// tests/unit-ms2-store-wiring.test.ts — Unit U-MS2: the store-instance wiring +
// the `store` selector on the 12 MCP tools
// (docs/specs/unit-ms2-store-wiring.md).
//
// RED SET (RCA-1) — written BEFORE any implementation exists. The module
// `src/main/rag-store-directory.ts` (spec §5.1 — NEW) does NOT exist yet, so
// this file cannot even LOAD (missing-module import — the house red pattern,
// cf. tests/unit-ms1-store-registry.test.ts); test 01 names the module as the
// explicit red marker. Every assertion below derives from the spec ALONE:
//
//   §5.1        the pure module surface: `resolveStoreArg` (return states
//               S1–S3, byte-pinned fail messages M1–M3, the M1-before-M2
//               ordering), `buildRagStoreDirectory` (construction rules
//               1–6, the F8 explicit cache path, the A6/R10 lexical-only
//               non-default pin, the one-default defensive guard), the
//               exported `storeLoadStatus` accessor (F6 — the D7 three-state
//               derivation), the D8 read-once missing flag, the export census
//               (§5.10 — 3 functions + 6 interfaces)
//   §5.2        the 12 tool inputSchemas each gain `store: z.string().optional()`
//               (house `topK` mirror) + the ONE A5 description change
//               (byte-exact old→new) + the five-seam gate gains NOTHING
//   §5.3        the resolution-order rules: the resolution state matrix R1–R7,
//               the 12 per-tool resolution-first ordering tests (each tool's
//               otherwise-invalid trigger), the engine-selection pin, the
//               directory-as-single-source-of-truth pin, the omitted ≡
//               explicit-default equivalence
//   §5.4        the `dir` trailing-optional params on handleRagTool /
//               handleEditTool / handleRagQueryIpc (F4 — the IPC half is
//               pinned at the handler level only; the RagQueryPayload.store
//               END-TO-END row is STAGED to U-MS5)
//   §5.5        the per-store reconcile routing: the `onStoreChanged` callback
//               widened to `(payload, storeName)` (2-arg), the ADDRESSED
//               store's engine reconciled PER CALL, the legacy sentinel
//               passing `''`, the broadcast payload shape UNCHANGED
//   §5.6        the per-store import root (the programmatic `corpusRoot` param)
//               + the F2 EXECUTION-ORDER STAGING: the wired import asserted the
//               2-ARG form at U-MS2 (SANCTIONED RE-PIN at U-MS4, 2026-09-05 —
//               tests 55/53: the third `ImportStoreContext` argument exists
//               now, so §5.6's staging note "from the U-MS4 window onward"
//               flips the wired call to the 3-ARG form); the `<name>:`-prefixed
//               half of the wired import was RED at U-MS2 and went green with
//               U-MS4 (test 56); the default store's wired import stays
//               UNPREFIXED (byte-equal)
//   §5.7        the failed-store matrix (loaded / failed-corrupt serves EMPTY /
//               failed-missing first-run empty) + `storeLoadStatus` derivation
//               + cross-store independence + the corrupt name still resolves
//   §5.8        the boot-order state matrix at the MODULE level (absent /
//               corrupt fail-soft / invalid fail-loud / valid N stores) + the
//               D8 read-once rule (the boot-captured missing flag is never
//               re-probed). The abort ordering + the registry-read-once /
//               IPC_OPERATOR_SETTINGS_SET pins are main.ts wiring — relegated
//               per §6 (code-review/live-battery pinned; main.ts is never
//               imported by tests in this repo)
//   §5.9        the zero-config byte-equality rows: the persistence file, the
//               engine-construction branch (covered by the §5.1 construction
//               tests), the import root, the tool results incl. the F3
//               result-`store` field (zero-config ⇒ 'main', non-default ⇒
//               that store's name, legacy sentinel ⇒ '' — the ONE intentional
//               delta on query results)
//
// Conventions follow tests/unit-ms1-store-registry.test.ts +
// tests/vector-boot.test.ts (vitest node environment, `.js` import suffix for
// the main-process ESM modules, temp dirs via node:fs mkdtemp, byte-exact
// message assertions via catch + toBe — vitest's toThrow is substring-only).
// NO test touches the repo's real userData paths; every file-touching case
// runs in its own mkdtemp temp dir. The cwd-relative import fixtures
// (the `process.cwd()` default is the pinned importer resolution root,
// markdown-import.ts:66) create a TRANSIENT mkdtemp dir INSIDE the repo cwd
// and remove it in `finally` — never written to outside that temp dir.
//
// `main.ts` is NEVER imported by this test file (house TestWriter contract;
// spec §6: the boot wiring is tested via the node-testable seams only —
// `buildRagStoreDirectory` + the shared handlers). `mcp-server.ts` handlers
// ARE node-testable here (the established direct-call + SDK seams, spec §2).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import {
  resolveStoreArg,
  buildRagStoreDirectory,
  storeLoadStatus,
  type RagStoreDirectory,
  type RagStoreEntry,
  type RagStoreBootPlan,
  type ResolvedRegistry,
} from '../src/main/rag-store-directory.js' // ← does NOT exist yet (the red marker)
import {
  loadRagStoreRegistry,
  resolveRegistry,
  type LoadedRagStoreRegistry,
  type RagStoreConfig,
} from '../src/main/rag-store-registry.js' // LANDED (U-MS1) — fixture seam only
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
} from '../src/main/rag-store.js'
import {
  createRetrieval,
  createLexicalEmbedder,
  createLexicalIndex,
  type RetrievalEngine,
  type RetrievalResult,
} from '../src/main/retrieval.js'
import {
  handleRagTool,
  handleEditTool,
  handleRagQueryIpc,
  ProvidentMcpServer,
  type McpBackend,
  type RagStoreChangedPayload,
  type McpServerOptions,
} from '../src/main/mcp-server.js'
import { SecurityGate, groupForTool } from '../src/main/security.js'
import { IPC_RAG_STORE_CHANGED } from '../src/shared/types.js'
import type { EmbeddingProvider } from '../src/main/embeddings.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

// ---------------------------------------------------------------------------
// The F2 import-call recorder: the wired `edit.import_markdown` pass-through
// (§5.6) is pinned through the importer's call records — the call-shape pin
// (RE-PINNED at U-MS4: the wired call is the 3-ARG form with the pinned
// `ImportStoreContext`; the LEGACY path stays 2-ARG) and the
// `corpusRoot: entry.corpusRoot` param pin.
// The mock is a PASS-THROUGH: the real importer still runs for every
// behavioral test; only the call arguments are recorded.
// vi.mock is established house style (tests/template-adversarial.test.ts,
// tests/vector-cache.test.ts).
// ---------------------------------------------------------------------------
const importCalls: unknown[][] = vi.hoisted(() => [] as unknown[][])
vi.mock('../src/main/markdown-import.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/main/markdown-import.js')>()
  const wrapped = (...args: unknown[]) => {
    importCalls.push(args)
    return (actual.importMarkdownCorpus as unknown as (...a: unknown[]) => Promise<unknown>)(...args)
  }
  return {
    ...actual,
    importMarkdownCorpus: wrapped as unknown as typeof actual.importMarkdownCorpus,
  }
})

// ---------------------------------------------------------------------------
// The 12 tool names (§5.2 — security.ts:34-45 maps them already; the gate is
// untouched by U-MS2).
// ---------------------------------------------------------------------------
const RAG_TOOLS = ['rag.query', 'rag.get_document', 'rag.list_nodes', 'rag.get_edges', 'rag.backlinks']
const EDIT_TOOLS = [
  'edit.set_content',
  'edit.create_node',
  'edit.delete_node',
  'edit.split_node',
  'edit.merge_node',
  'edit.set_edge',
  'edit.import_markdown',
]
const ALL_12 = [...RAG_TOOLS, ...EDIT_TOOLS]

// The A5 description change (§5.2, mcp-server.ts:1078) — the pinned string,
// AMENDED by the §3a F-MS2-6 ruling (the original "the default store's root is
// the project root" tail was false for a default entry with a CONFIGURED
// corpusRoot; the sanctioned re-pin of test 20 to the amended byte-pinned
// string):
const IMPORT_DESCRIPTION_NEW =
  'Import a corpus of markdown files into the addressed RAG store as a ONE-WAY SNAPSHOT (parse → validate doc-flow → applyBatch as ONE atomic batch journal entry). Requires edit group. The corpus root is fixed server-side per store: the addressed store\'s configured corpus root; the default store\'s root is its configured corpus root (the project root when unconfigured) — it is NOT an agent-supplied argument.'

const DEFAULT_NAME = 'main'
const OTHER_NAME = 'research-2026-09' // a valid U-MS1 charset name ([a-z0-9][a-z0-9_-]{0,63})

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, try/finally cleanup, byte-exact
// message assertions via catch + toBe).
// ---------------------------------------------------------------------------

function withDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ms2-'))
  try {
    run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function withDirAsync<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ms2-'))
  try {
    return await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** A transient mkdtemp dir INSIDE process.cwd() — for the importer's pinned
 *  `process.cwd()` default (markdown-import.ts:66 resolves relative files
 *  against cwd). Removed in finally. */
function withCwdDir(run: (relFile: string, absFile: string) => Promise<void>): Promise<void> {
  const abs = mkdtempSync(join(process.cwd(), 'provident-ms2-cwd-'))
  const rel = relative(process.cwd(), abs)
  try {
    return run(join(rel, 'note.md'), join(abs, 'note.md')).finally(() => {
      rmSync(abs, { recursive: true, force: true })
    })
  } catch (err) {
    rmSync(abs, { recursive: true, force: true })
    throw err
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

/** The async-handler form: a resolution throw REJECTS the promise (the
 *  handlers are async fns). Accepts the promise directly or a thunk. */
async function expectReject(run: Promise<unknown> | (() => Promise<unknown>), exactMessage: string): Promise<void> {
  let caught: unknown
  try {
    await (typeof run === 'function' ? run() : run)
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a rejection with message: ${exactMessage}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exactMessage)
}

/** Silence EVERY console channel (the vector-boot controller logs its pending
 *  milestone on console.error; the registry module may log on its fail-soft
 *  path). Restored by afterEach(vi.restoreAllMocks). */
function silenceConsole(): void {
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    vi.spyOn(console, m).mockImplementation(() => {})
  }
}

function makeNode(id: string, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-05T00:00:00.000Z'
  return {
    id,
    type: 'p',
    content,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** A deterministic bag-of-words → fixed-dimension embedding (the house
 *  provider-double idiom — NO live network anywhere). */
function makeProviderDouble(): EmbeddingProvider & { embedTexts: string[] } {
  const embedTexts: string[] = []
  const dim = 4
  const textEmbedding = (text: string): number[] => {
    const vec = new Array(dim).fill(0)
    for (const t of text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)) {
      let h = 0
      for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
      vec[h % dim] += 1
    }
    return vec
  }
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: dim,
    embedTexts,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      return textEmbedding(text)
    },
  }
}

/** A marker engine double (the engine-selection pin): its query result is
 *  distinguishable from ANY real engine's result, so a directory-routed call
 *  provably used the ENTRY's engine — never the per-call createRetrieval
 *  fallback and never the passed `engine` param. Cast through unknown: the
 *  double intentionally bypasses createRetrieval's F3 stamping to pin that
 *  handleRagTool itself is the ONE stamp point (spec §5.9 "ONE stamp point"). */
function makeMarkerEngine(markdown: string): RetrievalEngine {
  return {
    query: async () =>
      ({ query: 'q', ranked: [], context: [], markdown, lineMap: { ranges: [] }, k: 5 }) as unknown as RetrievalResult,
    onStoreChanged: async () => {},
    setEmbedder: () => {},
  } as unknown as RetrievalEngine
}

/** A recording engine double (the per-store reconcile pin): records every
 *  onStoreChanged payload. */
function makeRecordingEngine(): RetrievalEngine & { calls: RagStoreChangedPayload[] } {
  const calls: RagStoreChangedPayload[] = []
  return {
    query: async () => {
      throw new Error('unused')
    },
    onStoreChanged: async (kind: RagStoreChangedPayload['kind'], nodeIds: string[], edgeIds: string[]) => {
      calls.push({ kind, nodeIds, edgeIds })
    },
    setEmbedder: () => {},
    calls,
  } as unknown as RetrievalEngine & { calls: RagStoreChangedPayload[] }
}

/** Write the registry file (the §5.4 wiring file name) and load it through
 *  U-MS1's loader — the CONSUMED view (structurally `ResolvedRegistry`, F5:
 *  no `version` field). */
function loadRegistry(dir: string, stores: RagStoreConfig[]): LoadedRagStoreRegistry {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  return loadRagStoreRegistry({ path: regPath })
}

/** A hand-built directory entry over a REAL store (the handler-level
 *  fixture). Seeded nodes go in BEFORE the engine is built so the engine's
 *  lexical index includes them (the wired construction order). */
async function makeEntry(
  root: string,
  name: string,
  opts: { seed?: RagNode[]; corrupt?: boolean; corpusRoot?: string; engine?: RetrievalEngine } = {},
): Promise<RagStoreEntry> {
  const persistenceFile = join(root, `persist-${name}.json`)
  if (opts.corrupt) writeFileSync(persistenceFile, '{garbage')
  const store: RagStore = createJsonRagStore({ path: persistenceFile })
  for (const n of opts.seed ?? []) await store.putNode(n)
  const entry: RagStoreEntry = {
    name,
    store,
    engine: opts.engine ?? createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes()))),
    corrupt: opts.corrupt ?? store.status().corrupt,
    missing: !existsSync(persistenceFile),
  }
  if (opts.corpusRoot !== undefined) entry.corpusRoot = opts.corpusRoot
  return entry
}

async function makeDirectory(
  root: string,
  specs: Array<{ name: string; default?: boolean; seed?: RagNode[]; corrupt?: boolean; corpusRoot?: string; engine?: RetrievalEngine }>,
): Promise<RagStoreDirectory> {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    const entry = await makeEntry(root, s.name, s)
    entries.set(s.name, entry)
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

/** A resolver-only directory: the resolver reads ONLY `entries.has` +
 *  `defaultName` (§5.1) — the store/engine slots are unused. */
function resolverDir(defaultName: string, names: string[]): RagStoreDirectory {
  const entries = new Map<string, RagStoreEntry>()
  for (const n of names) {
    entries.set(n, {
      name: n,
      store: null as unknown as RagStore,
      engine: null as unknown as RetrievalEngine,
      corrupt: false,
      missing: false,
    })
  }
  return { entries, defaultName }
}

function countOf(store: RagStore): number {
  return store.listNodes().length + store.listEdges().length
}

/** The §5.9 byte-equality normalizer: create_node/split_node/import mints
 *  (`n-<uuid>` / `e-<uuid>`) and ISO timestamps are NON-DETERMINISTIC — the
 *  pinned "deep-equals on EVERY field" comparison holds on every spec-visible
 *  field once the minted identity + wall-clock stamps are normalized away. */
const MINTED_ID = /^(n|e)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const ISO_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
function normalize(value: unknown): unknown {
  if (typeof value === 'string') {
    if (MINTED_ID.test(value)) return `${value.slice(0, 1)}-<minted>`
    if (ISO_STAMP.test(value)) return '<iso>'
    return value
  }
  if (Array.isArray(value)) return value.map(normalize)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, normalize(v)]),
    )
  }
  return value
}

beforeEach(() => {
  importCalls.length = 0
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// RED marker (§5.1, §6 — the house red pattern)
// ===========================================================================
describe('U-MS2 RED marker — the pure module does not exist yet (§5.1, §6)', () => {
  it('01. RED — src/main/rag-store-directory.ts (spec §5.1) is not implemented yet; this suite cannot load until it exists', () => {
    expect(typeof resolveStoreArg).toBe('function')
    expect(typeof buildRagStoreDirectory).toBe('function')
    expect(typeof storeLoadStatus).toBe('function')
  })
})

// ===========================================================================
// §5.1 — resolveStoreArg: the return states (S1–S3)
// ===========================================================================
describe('resolveStoreArg — return states S1–S3 (§5.1)', () => {
  // Data states enumerated (§5.1 "return states"):
  //   S1  raw omitted (key absent) + dir != null → { requested: null, name: dir.defaultName }
  //   S1' raw explicitly undefined ≡ key absent (the same S1 result)
  //   S2  raw a non-empty string in dir.entries → { requested: raw, name: raw }
  //   S3  raw undefined + dir == null → null (the LEGACY sentinel — no
  //       resolution; the handler uses the passed store param unchanged)
  it('02. S1 — raw omitted (key absent) + dir injected ⇒ EXACTLY { requested: null, name: dir.defaultName }', () => {
    const ref = resolveStoreArg('rag.query', undefined, resolverDir(DEFAULT_NAME, [DEFAULT_NAME, OTHER_NAME]))
    expect(ref).toEqual({ requested: null, name: DEFAULT_NAME })
  })

  it('03. S1 — an explicitly-undefined store value is ABSENCE (≡ the key being absent)', () => {
    const ref = resolveStoreArg('edit.set_content', undefined, resolverDir(DEFAULT_NAME, [DEFAULT_NAME]))
    expect(ref).toEqual({ requested: null, name: DEFAULT_NAME })
  })

  it('04. S2 — a known non-empty store name ⇒ { requested: raw, name: raw } (the raw echoed verbatim)', () => {
    const ref = resolveStoreArg('rag.query', OTHER_NAME, resolverDir(DEFAULT_NAME, [DEFAULT_NAME, OTHER_NAME]))
    expect(ref).toEqual({ requested: OTHER_NAME, name: OTHER_NAME })
  })

  it('05. S3 — raw omitted + dir null/undefined ⇒ null (the LEGACY sentinel: no resolution, byte-equal today)', () => {
    // dir === null
    expect(resolveStoreArg('rag.query', undefined, null)).toBe(null)
    // dir === undefined (the param is `RagStoreDirectory | null | undefined`)
    expect(resolveStoreArg('rag.query', undefined, undefined)).toBe(null)
    // S3 is unconditional on the raw value being a plausible name: the legacy
    // path performs NO resolution at all.
    expect(resolveStoreArg('rag.list_nodes', undefined, null)).toBe(null)
  })
})

// ===========================================================================
// §5.1 — resolveStoreArg: the byte-pinned fail messages (M1–M3) + ordering
// ===========================================================================
describe('resolveStoreArg — byte-pinned fail messages M1–M3 (§5.1)', () => {
  // Fail-states enumerated (§5.1 message table):
  //   M1  raw present and not a non-empty string (null/5/true/false/{}/[]/0/'')
  //   M2  raw a non-empty string and (dir == null or !dir.entries.has(raw))
  //   M3  raw omitted + dir != null + !dir.entries.has(dir.defaultName)
  // Ordering (§5.1): M1 (type/emptiness) BEFORE M2 (membership) — a malformed
  // value never leaks membership information.
  it('06. M1 — non-string AND empty-string raw ⇒ EXACTLY "<tool>: store must be a non-empty string" (the tool prefix echoed; null/5/true/false/{}/[]/0/\'\')', () => {
    const dir = resolverDir(DEFAULT_NAME, [DEFAULT_NAME, OTHER_NAME])
    for (const raw of [null, 5, true, false, {}, [], 0, '']) {
      expectThrow(() => resolveStoreArg('rag.query', raw, dir), 'rag.query: store must be a non-empty string')
      expectThrow(() => resolveStoreArg('edit.set_content', raw, dir), 'edit.set_content: store must be a non-empty string')
    }
    // The message carries the CALLER's tool name — any tool string.
    expectThrow(() => resolveStoreArg('rag.backlinks', 7, dir), 'rag.backlinks: store must be a non-empty string')
  })

  it('07. M2 — an unknown non-empty store name ⇒ EXACTLY "<tool>: unknown store \'<raw>\'" echoing ONLY the caller input (no registry census, no escaping)', () => {
    const dir = resolverDir(DEFAULT_NAME, [DEFAULT_NAME, OTHER_NAME])
    // Byte-exact message, the tool prefix + the raw value.
    expectThrow(() => resolveStoreArg('rag.query', 'nope', dir), `rag.query: unknown store 'nope'`)
    // A9/B9/R8 — the error echoes ONLY the caller's input: NO other registry
    // name may appear in the message (never enumerating the registry).
    const caught = (() => {
      try {
        resolveStoreArg('rag.query', 'nope', dir)
      } catch (err) {
        return err as Error
      }
      throw new Error('expected a throw')
    })()
    expect(caught.message).toBe("rag.query: unknown store 'nope'")
    expect(caught.message).not.toContain(DEFAULT_NAME)
    expect(caught.message).not.toContain(OTHER_NAME)
    // The raw string is interpolated WITHOUT escaping (a quote passes through).
    expectThrow(() => resolveStoreArg('rag.query', "o'neil", dir), "rag.query: unknown store 'o'neil'")
    // dir == null (R4) — a non-empty raw against NO directory is still M2.
    expectThrow(() => resolveStoreArg('rag.query', 'nope', null), "rag.query: unknown store 'nope'")
    expectThrow(() => resolveStoreArg('rag.query', 'nope', undefined), "rag.query: unknown store 'nope'")
  })

  it('08. M3 — raw omitted + a malformed directory (the default absent from entries) ⇒ EXACTLY "rag-store-directory: default store not found"', () => {
    // A wiring bug (U-MS1 never produces one): defaultName names no entry.
    expectThrow(
      () => resolveStoreArg('rag.query', undefined, resolverDir(DEFAULT_NAME, [OTHER_NAME])),
      'rag-store-directory: default store not found',
    )
    // M3 is checked on the OMITTED path only — an explicit raw on the same
    // malformed directory takes the normal M1/M2 path instead. (Supervisor
    // repair 2026-09-05: the original second call reused the first call's
    // directory, whose helper had inserted OTHER_NAME into entries — making
    // raw a MEMBER, so §5.1 M2/S2 resolves it no-throw (as test 04 pins).
    // The malformed variant below (default absent, raw ∉ entries) keeps the
    // assertion's M2 intent with the byte-identical message.)
    expectThrow(
      () => resolveStoreArg('rag.query', OTHER_NAME, resolverDir(OTHER_NAME, [DEFAULT_NAME])),
      `rag.query: unknown store '${OTHER_NAME}'`,
    )
  })

  it('09. ordering — M1 (type/emptiness) precedes M2 (membership): a malformed value never leaks membership information', () => {
    // A directory whose default is ALSO missing: with raw omitted M3 fires,
    // but a malformed raw must hit M1 FIRST (never M2/M3).
    const dir = resolverDir(DEFAULT_NAME, []) as RagStoreDirectory
    expectThrow(() => resolveStoreArg('rag.query', '', dir), 'rag.query: store must be a non-empty string')
    expectThrow(() => resolveStoreArg('rag.query', 5, dir), 'rag.query: store must be a non-empty string')
    expectThrow(() => resolveStoreArg('rag.query', null, dir), 'rag.query: store must be a non-empty string')
  })
})

// ===========================================================================
// §5.1 — buildRagStoreDirectory: the construction rules (1–6)
// ===========================================================================
describe('buildRagStoreDirectory — the construction rules (§5.1 rules 1–6)', () => {
  // Data states enumerated (§5.1 rules 1–6):
  //   rule 1  N createJsonRagStore instances, ONE per registry entry, each
  //           with its OWN single-writer queue (distinct instances, distinct
  //           persistence files).
  //   rule 2  the default store takes today's exact lexical/vector branch
  //           (main.ts:145-173); non-default stores are ALWAYS lexical (A6).
  //   rule 3  entry.corrupt = store.status().corrupt; entry.missing =
  //           !existsSync(persistenceFile) — boot-captured (D8).
  //   rule 4  entry.corpusRoot = cfg.corpusRoot (absolute when configured).
  //   rule 5  defaultName = registry.defaultStoreName + the defensive
  //           exactly-one-default cross-check.
  //   rule 6  plan.directory = { entries, defaultName }; plan.defaultName.
  it('10. rules 1+4+5+6 — N stores + N engines, Map-keyed by name in registry insertion order, corpusRoot passthrough, distinct single-writer instances, defaultName from the consumed view', async () => {
    await withDirAsync(async (root) => {
      const corpus = join(root, 'corpus')
      // Pre-seed the DEFAULT store's persistence file (the legacy
      // provident-rag.json path the carve-out derives) so the constructed
      // engine's lexical index includes the node.
      await createJsonRagStore({ path: join(root, 'provident-rag.json') }).putNode(makeNode('n-main', 'main only'))
      const loaded = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: OTHER_NAME, corpusRoot: corpus },
      ])
      // F5 — the consumed view is STRUCTURALLY U-MS1's ResolvedRagStoreRegistry
      // ({ stores, defaultStoreName }); the loader dropped `version` (U-MS1
      // §5.2). The view is passed to buildRagStoreDirectory UNCHANGED.
      const registry: ResolvedRegistry = loaded
      const plan: RagStoreBootPlan = buildRagStoreDirectory(registry, {
        userDataPath: root,
        embedderKind: 'lexical',
        provider: null,
      })
      // rule 6 — plan.directory is { entries, defaultName }; plan.defaultName.
      expect(plan.directory.defaultName).toBe(DEFAULT_NAME)
      expect(plan.defaultName).toBe(DEFAULT_NAME)
      // Map-keyed by name, in REGISTRY INSERTION ORDER (no reordering).
      expect([...plan.directory.entries.keys()]).toEqual([DEFAULT_NAME, OTHER_NAME])
      // rule 5 — defaultName = registry.defaultStoreName.
      expect(plan.defaultName).toBe(loaded.defaultStoreName)
      // rule 1 — each entry carries its OWN store instance (its OWN
      // single-writer queue) + its OWN engine.
      const main = plan.directory.entries.get(DEFAULT_NAME)!
      const research = plan.directory.entries.get(OTHER_NAME)!
      expect(main.store).not.toBe(research.store)
      expect(main.engine).not.toBe(research.engine)
      expect(main.name).toBe(DEFAULT_NAME)
      expect(research.name).toBe(OTHER_NAME)
      // rule 1 — the instances are INDEPENDENT stores: a putNode through
      // main's store is invisible to research's (separate in-memory state +
      // separate persistence files).
      await main.store.putNode(makeNode('n-main-2', 'second main node'))
      expect(research.store.listNodes()).toEqual([])
      expect(main.store.getNode('n-main')).toBeDefined()
      expect(main.store.getNode('n-main-2')).toBeDefined()
      // rule 4 — corpusRoot passthrough: the configured absolute root kept;
      // unconfigured ⇒ undefined (the importer's cwd default applies).
      expect(research.corpusRoot).toBe(corpus)
      expect(main.corpusRoot).toBeUndefined()
      // rule 2 (lexical mode) — the entry's engine ANSWERS queries over its
      // own store's nodes.
      const result = await main.engine.query('main')
      expect(result.ranked[0].nodeId).toBe('n-main')
    })
  })

  it('11. rule 2 (vector) — the DEFAULT store takes the vector branch: plan.vectorBoot is the ONE controller, entry.engine === vectorBoot.engine, and the F8 explicit cache path is join(opts.userDataPath, "provident-vector-cache.json") (NODE-RUNNABLE — the NO-ARG form throws outside Electron, F8)', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const loaded = loadRegistry(root, [{ name: DEFAULT_NAME, default: true }])
      const provider = makeProviderDouble()
      const plan = buildRagStoreDirectory(loaded, {
        userDataPath: root,
        embedderKind: 'vector',
        provider,
      })
      // Exactly ONE vector boot — the default store's.
      expect(plan.vectorBoot).not.toBe(null)
      expect(plan.directory.entries.get(DEFAULT_NAME)!.engine).toBe(plan.vectorBoot!.engine)
      // The engine is LIVE (born-lexical pending) — queries are served while
      // the background build runs (W1).
      const engine = plan.directory.entries.get(DEFAULT_NAME)!.engine
      expect(typeof engine.query).toBe('function')
      expect(typeof engine.onStoreChanged).toBe('function')
      // F8 — the vector cache is constructed with the EXPLICIT
      // join(opts.userDataPath, 'provident-vector-cache.json') path (byte-equal
      // to today's Electron default file, vector-cache.ts:114-133). Observable:
      // after the background build's promotion drain the cache file EXISTS at
      // exactly that path (the NO-ARG createVectorCache() form would have
      // thrown outside Electron — F8 — so reaching here proves the explicit
      // path; the file proves WHICH path).
      await plan.vectorBoot!.start()
      expect(existsSync(join(root, 'provident-vector-cache.json'))).toBe(true)
    })
  })

  it('12. rule 2 (A6/R10) — non-default stores are ALWAYS lexical EVEN in vector mode: their engines answer queries with ZERO provider calls (no per-store warm-up, no per-store cache), and their engine is NOT the vector boot\'s', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const loaded = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: OTHER_NAME },
      ])
      await createJsonRagStore({ path: loaded.stores[1].persistenceFile }).putNode(makeNode('r1', 'research content'))
      const provider = makeProviderDouble()
      const plan = buildRagStoreDirectory(loaded, {
        userDataPath: root,
        embedderKind: 'vector',
        provider,
      })
      const research = plan.directory.entries.get(OTHER_NAME)!
      // A6 — the non-default engine is a LEXICAL engine (NOT the vector
      // boot's): it answers queries without a SINGLE provider call.
      const before = provider.embedTexts.length
      const result = await research.engine.query('research')
      expect(result.ranked[0].nodeId).toBe('r1')
      expect(provider.embedTexts).toEqual([]) // zero provider calls — lexical
      expect(research.engine).not.toBe(plan.vectorBoot!.engine)
      // R10 — non-default engines never participate in the vector boot.
      expect(plan.vectorBoot!.engine).toBe(plan.directory.entries.get(DEFAULT_NAME)!.engine)
    })
  })

  it('13. rule 2 — the vector provider re-guard (defense-in-depth): vector mode + provider null on the default store ⇒ EXACTLY the byte-identical main.ts:157 message', () => {
    withDir((root) => {
      silenceConsole()
      const loaded = loadRegistry(root, [{ name: DEFAULT_NAME, default: true }])
      expectThrow(
        () =>
          buildRagStoreDirectory(loaded, {
            userDataPath: root,
            embedderKind: 'vector',
            provider: null,
          }),
        'retrieval.embedder: vector requires retrieval.embeddingProvider config',
      )
    })
  })

  it('14. rule 3 — the per-store boot flags: corrupt from store.status().corrupt, missing from the boot-captured !existsSync — the three states compose independently across stores in ONE directory', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const valid = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: 'a-corrupt' },
        { name: 'b-missing' },
      ])
      // present + valid (persisted through the store's own writer).
      await createJsonRagStore({ path: valid.stores[0].persistenceFile }).putNode(makeNode('n1', 'seed'))
      // present + corrupt (unparseable).
      writeFileSync(valid.stores[1].persistenceFile, '{garbage')
      // absent: created by nothing.
      const plan = buildRagStoreDirectory(valid, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const mainEntry = plan.directory.entries.get(DEFAULT_NAME)!
      const corruptEntry = plan.directory.entries.get('a-corrupt')!
      const missingEntry = plan.directory.entries.get('b-missing')!
      // loaded: present + valid ⇒ corrupt false, missing false.
      expect(mainEntry.corrupt).toBe(false)
      expect(mainEntry.missing).toBe(false)
      expect(storeLoadStatus(mainEntry)).toBe('loaded')
      // failed-corrupt: present but unparseable ⇒ corrupt true, missing false.
      expect(corruptEntry.corrupt).toBe(true)
      expect(corruptEntry.missing).toBe(false)
      expect(storeLoadStatus(corruptEntry)).toBe('failed-corrupt')
      // failed-missing: absent (first run) ⇒ missing true, corrupt false.
      expect(missingEntry.missing).toBe(true)
      expect(missingEntry.corrupt).toBe(false)
      expect(storeLoadStatus(missingEntry)).toBe('failed-missing')
    })
  })

  it('15. rule 5 — the defensive one-default cross-check: zero defaults / two defaults / flagged name ≠ defaultStoreName ⇒ EXACTLY "rag-store-directory: registry must contain exactly one default store"', () => {
    withDir((root) => {
      silenceConsole()
      const zeroDefaults = {
        stores: [
          { name: DEFAULT_NAME, default: false, persistenceFile: join(root, 'p-main.json') },
          { name: OTHER_NAME, default: false, persistenceFile: join(root, 'p-other.json') },
        ],
        defaultStoreName: DEFAULT_NAME,
      }
      expectThrow(
        () => buildRagStoreDirectory(zeroDefaults, { userDataPath: root, embedderKind: 'lexical', provider: null }),
        'rag-store-directory: registry must contain exactly one default store',
      )
      const twoDefaults = {
        stores: [
          { name: DEFAULT_NAME, default: true, persistenceFile: join(root, 'p-main.json') },
          { name: OTHER_NAME, default: true, persistenceFile: join(root, 'p-other.json') },
        ],
        defaultStoreName: DEFAULT_NAME,
      }
      expectThrow(
        () => buildRagStoreDirectory(twoDefaults, { userDataPath: root, embedderKind: 'lexical', provider: null }),
        'rag-store-directory: registry must contain exactly one default store',
      )
      const nameMismatch = {
        stores: [{ name: DEFAULT_NAME, default: true, persistenceFile: join(root, 'p-main.json') }],
        defaultStoreName: OTHER_NAME,
      }
      expectThrow(
        () => buildRagStoreDirectory(nameMismatch, { userDataPath: root, embedderKind: 'lexical', provider: null }),
        'rag-store-directory: registry must contain exactly one default store',
      )
    })
  })

  it('16. D8 (module level) — the missing flag is captured ONCE at construction and NEVER re-probed: creating the file afterwards keeps missing=true; deleting it afterwards keeps missing=false', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      // Case 1 — absent at construction ⇒ missing true; the file appears
      // afterwards; the captured flag does NOT flip (never re-probed).
      // (Supervisor repair 2026-09-05: the fixture dir must exist for the
      // loader's registry-file write — mirrors the present-case pattern.)
      mkdirSync(join(root, 'absent-case'))
      const absent = loadRegistry(join(root, 'absent-case'), [{ name: DEFAULT_NAME, default: true }])
      const planAbsent = buildRagStoreDirectory(absent, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const entryAbsent = planAbsent.directory.entries.get(DEFAULT_NAME)!
      expect(entryAbsent.missing).toBe(true)
      expect(storeLoadStatus(entryAbsent)).toBe('failed-missing')
      writeFileSync(absent.stores[0].persistenceFile, '{}')
      expect(entryAbsent.missing).toBe(true) // still the boot-captured value
      expect(storeLoadStatus(entryAbsent)).toBe('failed-missing')
      // Case 2 — present at construction ⇒ missing false; the file is removed
      // afterwards; the captured flag does NOT flip.
      const presentDir = join(root, 'present-case')
      mkdirSync(presentDir)
      const present = loadRegistry(presentDir, [{ name: DEFAULT_NAME, default: true }])
      const persistPath = present.stores[0].persistenceFile
      await createJsonRagStore({ path: persistPath }).putNode(makeNode('n1', 'seed'))
      const planPresent = buildRagStoreDirectory(present, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const entryPresent = planPresent.directory.entries.get(DEFAULT_NAME)!
      expect(entryPresent.missing).toBe(false)
      expect(storeLoadStatus(entryPresent)).toBe('loaded')
      rmSync(persistPath, { force: true })
      expect(entryPresent.missing).toBe(false) // still the boot-captured value
      expect(storeLoadStatus(entryPresent)).toBe('loaded')
    })
  })
})

// ===========================================================================
// §5.1 F6 / §5.7 — storeLoadStatus: the D7 three-state derivation
// ===========================================================================
describe('storeLoadStatus — the D7 three-state derivation (§5.1 F6, §5.7)', () => {
  // Data states enumerated (§5.1 F6 precedence): missing ⇒ 'failed-missing'
  // (an absent persistence file = the first-run empty store, NOT an error
  // state), else corrupt ⇒ 'failed-corrupt', else 'loaded'. The returned
  // union's members are EXACTLY 'loaded' | 'failed-corrupt' | 'failed-missing'.
  it('17. precedence — missing ⇒ failed-missing; else corrupt ⇒ failed-corrupt; else loaded', () => {
    expect(storeLoadStatus({ missing: true, corrupt: false })).toBe('failed-missing')
    // The precedence is pinned: missing wins even alongside corrupt.
    expect(storeLoadStatus({ missing: true, corrupt: true })).toBe('failed-missing')
    expect(storeLoadStatus({ missing: false, corrupt: true })).toBe('failed-corrupt')
    expect(storeLoadStatus({ missing: false, corrupt: false })).toBe('loaded')
  })

  it('18. the D7 discriminator + the Pick shape — corrupt ALONE cannot distinguish loaded from failed-missing (both false); the accessor accepts the minimal { missing, corrupt } view (the U-MS5 surface)', () => {
    // corrupt === false is shared by 'loaded' AND 'failed-missing' — only the
    // missing flag discriminates (F6).
    expect(storeLoadStatus({ missing: false, corrupt: false })).toBe('loaded')
    expect(storeLoadStatus({ missing: true, corrupt: false })).toBe('failed-missing')
    // The parameter is Pick<RagStoreEntry, 'missing' | 'corrupt'> — the EXACT
    // surface U-MS5's settings listing consumes (unit-ms5 §5.4).
    const entry: Pick<RagStoreEntry, 'missing' | 'corrupt'> = { missing: false, corrupt: true }
    expect(storeLoadStatus(entry)).toBe('failed-corrupt')
  })
})

// ===========================================================================
// §5.2 — the 12 tool inputSchemas + the A5 description (SDK-level census)
// ===========================================================================
describe('§5.2 — the per-tool `store` schema change + the A5 description (SDK listTools)', () => {
  // Data states enumerated (§5.2 table): EVERY one of the 12 inputSchemas gains
  // the SAME trailing optional field `store: z.string().optional()` (lax schema
  // + strict handler validation — the house topK mirror); existing fields
  // UNCHANGED; edit.import_markdown stays files-only (ADV-1); EXACTLY ONE
  // description changes (A5).

  /** Connect an SDK client to a stdio server built from the given options. */
  async function connectSdk(opts: McpServerOptions): Promise<{ client: Client; close: () => Promise<void> }> {
    const server = new ProvidentMcpServer(opts)
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['rag', 'edit'] })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'unit-ms2', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    return {
      client,
      close: async () => {
        await client.close()
      },
    }
  }

  it('19. §5.2 — all 12 tools expose store: { type: "string" } as an OPTIONAL trailing field (not in required); existing fields unchanged; edit.import_markdown stays files-only (ADV-1)', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [{ name: DEFAULT_NAME, default: true }])
      const backend: McpBackend = { invoke: async () => ({}) }
      const { client, close } = await connectSdk({
        backend,
        transport: 'stdio',
        gate: new SecurityGate(),
        ragStore: dir.entries.get(DEFAULT_NAME)!.store,
        retrievalEngine: dir.entries.get(DEFAULT_NAME)!.engine,
        ragStores: dir,
      })
      try {
        const { tools } = await client.listTools()
        const byName = new Map(tools.map((t) => [t.name, t]))
        for (const name of ALL_12) {
          const tool = byName.get(name)
          expect(tool, `${name} must be registered`).toBeDefined()
          const schema = tool!.inputSchema as
            | { properties?: Record<string, unknown>; required?: string[] }
            | undefined
          const store = schema?.properties?.store as { type?: string } | undefined
          expect(store, `${name} must gain the optional store field (§5.2)`).toBeDefined()
          expect(store!.type).toBe('string')
          expect(schema?.required ?? [], `${name}: store must be OPTIONAL (not in required)`).not.toContain('store')
        }
        // Existing fields UNCHANGED — spot pins from the §5.2 table.
        const ragQuery = byName.get('rag.query')!.inputSchema as { properties?: Record<string, unknown>; required?: string[] }
        expect(Object.keys(ragQuery.properties ?? {}).sort()).toEqual(['query', 'store', 'topK'])
        expect(ragQuery.required ?? []).toEqual(['query'])
        // rag.list_nodes was {} — it gains ONLY store.
        const listNodes = byName.get('rag.list_nodes')!.inputSchema as { properties?: Record<string, unknown> }
        expect(Object.keys(listNodes.properties ?? {})).toEqual(['store'])
        // edit.import_markdown stays files-ONLY otherwise (ADV-1).
        const importTool = byName.get('edit.import_markdown')!.inputSchema as { properties?: Record<string, unknown> }
        expect(Object.keys(importTool.properties ?? {}).sort()).toEqual(['files', 'store'])
      } finally {
        await close()
      }
    })
  })

  it('20. A5 — the edit.import_markdown description is EXACTLY the pinned new string (byte-exact)', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [{ name: DEFAULT_NAME, default: true }])
      const backend: McpBackend = { invoke: async () => ({}) }
      const { client, close } = await connectSdk({
        backend,
        transport: 'stdio',
        gate: new SecurityGate(),
        ragStore: dir.entries.get(DEFAULT_NAME)!.store,
        retrievalEngine: dir.entries.get(DEFAULT_NAME)!.engine,
        ragStores: dir,
      })
      try {
        const { tools } = await client.listTools()
        const tool = tools.find((t) => t.name === 'edit.import_markdown')
        expect(tool?.description).toBe(IMPORT_DESCRIPTION_NEW)
      } finally {
        await close()
      }
    })
  })

  // GREEN-ON-ARRIVAL GUARD (house pattern): this test pins the UNCHANGED half
  // of §5.2 (§5.10 census) — the five-seam gate gains NOTHING. Every assertion
  // is satisfied by TODAY's security.ts and must stay true after U-MS2 (a
  // change here is a scope violation: no new tool name, no new group).
  it('21. GUARD (§5.2/§5.10, green-on-arrival) — the five-seam gate gains NOTHING: the 12 names resolve to rag/edit exactly as today and NO store-census tool exists (A9)', () => {
    expect(groupForTool('rag.query')).toBe('rag')
    expect(groupForTool('rag.get_document')).toBe('rag')
    expect(groupForTool('rag.list_nodes')).toBe('rag')
    expect(groupForTool('rag.get_edges')).toBe('rag')
    expect(groupForTool('rag.backlinks')).toBe('rag')
    for (const name of EDIT_TOOLS) expect(groupForTool(name)).toBe('edit')
    // No new tool name, no new group (§5.2 "the five-seam gate gains NOTHING").
    expect(groupForTool('rag.stores')).toBe(null) // A9 — no store-census tool
    expect(groupForTool('store.list')).toBe(null)
    expect(groupForTool('edit.unknown-future')).toBe(null)
  })
})

// ===========================================================================
// §5.3 — the 12 per-tool resolution-first ordering tests (R1/R5/R6/R7 rows)
// ===========================================================================
describe('§5.3 — per-tool resolution-first ordering (12 tools; unknown store beats every tool-specific validation throw)', () => {
  // Data states enumerated: for EACH tool, a call carrying BOTH an unknown
  // `store` AND that tool's otherwise-invalid remaining args throws the
  // unknown-store error — NEVER the tool-specific validation throw — and
  // performs NO store access (R5: no store method ran, no mutation, no
  // broadcast). The triggers are the spec §5.3 table's ordering triggers.

  async function freshFixture() {
    return withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed one alpha')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research only')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const research = dir.entries.get(OTHER_NAME)!
      const countsBefore = [countOf(main.store), countOf(research.store)]
      return { dir, main, research, countsBefore }
    })
  }

  it('22. rag.query — { store: "nope" } with the query MISSING ⇒ unknown store, NOT "rag.query: query must be a non-empty string"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleRagTool(main.store, 'rag.query', { store: 'nope' }, main.engine, dir),
      "rag.query: unknown store 'nope'",
    )
  })

  it('23. rag.query — { store: "nope", query: "q", topK: 0 } ⇒ unknown store, NOT "rag.query: topK must be a positive integer"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleRagTool(main.store, 'rag.query', { store: 'nope', query: 'q', topK: 0 }, main.engine, dir),
      "rag.query: unknown store 'nope'",
    )
  })

  it('24. rag.get_document — { store: "nope" } ⇒ unknown store, NOT "rag.get_document: documentId required"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleRagTool(main.store, 'rag.get_document', { store: 'nope' }, main.engine, dir),
      "rag.get_document: unknown store 'nope'",
    )
  })

  it('25. rag.list_nodes — { store: "nope" } ⇒ unknown store (resolution is the only gate for this tool)', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleRagTool(main.store, 'rag.list_nodes', { store: 'nope' }, main.engine, dir),
      "rag.list_nodes: unknown store 'nope'",
    )
  })

  it('26. rag.get_edges — { store: "nope" } ⇒ unknown store (no other validation)', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleRagTool(main.store, 'rag.get_edges', { store: 'nope' }, main.engine, dir),
      "rag.get_edges: unknown store 'nope'",
    )
  })

  it('27. rag.backlinks — { store: "nope" } ⇒ unknown store, NOT "rag.backlinks: nodeId required"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleRagTool(main.store, 'rag.backlinks', { store: 'nope' }, main.engine, dir),
      "rag.backlinks: unknown store 'nope'",
    )
  })

  it('28. edit.set_content — { store: "nope" } ⇒ unknown store, NOT "edit.set_content: nodeId required"; NO store access, NO broadcast', async () => {
    const { dir, main, research, countsBefore } = await freshFixture()
    const cb = vi.fn()
    await expectReject(
      handleEditTool(main.store, 'edit.set_content', { store: 'nope' }, cb, dir),
      "edit.set_content: unknown store 'nope'",
    )
    expect([countOf(main.store), countOf(research.store)]).toEqual(countsBefore)
    expect(cb).not.toHaveBeenCalled()
  })

  it('29. edit.create_node — { store: "nope", type: "p", content: "x" } (the op would otherwise run) ⇒ unknown store; NO node created in ANY store (the side-effect-freedom probe)', async () => {
    const { dir, main, research, countsBefore } = await freshFixture()
    const cb = vi.fn()
    // NOTE: the spec's illustrative trigger type is 'paragraph', which is NOT
    // a valid RagNodeType (edit-ops.ts:44) — 'p' is the valid equivalent that
    // makes "the op would otherwise run [and create a node]" hold.
    await expectReject(
      handleEditTool(main.store, 'edit.create_node', { store: 'nope', type: 'p', content: 'x' }, cb, dir),
      "edit.create_node: unknown store 'nope'",
    )
    expect([countOf(main.store), countOf(research.store)]).toEqual(countsBefore)
    expect(cb).not.toHaveBeenCalled()
  })

  it('30. edit.delete_node — { store: "nope" } ⇒ unknown store, NOT "edit.delete_node: nodeId required"; NO mutation', async () => {
    const { dir, main, research, countsBefore } = await freshFixture()
    const cb = vi.fn()
    await expectReject(
      handleEditTool(main.store, 'edit.delete_node', { store: 'nope' }, cb, dir),
      "edit.delete_node: unknown store 'nope'",
    )
    expect([countOf(main.store), countOf(research.store)]).toEqual(countsBefore)
    expect(cb).not.toHaveBeenCalled()
  })

  it('31. edit.split_node — { store: "nope" } ⇒ unknown store, NOT "edit.split_node: nodeId required"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleEditTool(main.store, 'edit.split_node', { store: 'nope' }, vi.fn(), dir),
      "edit.split_node: unknown store 'nope'",
    )
  })

  it('32. edit.merge_node — { store: "nope" } ⇒ unknown store, NOT "edit.merge_node: sourceId and targetId required"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleEditTool(main.store, 'edit.merge_node', { store: 'nope' }, vi.fn(), dir),
      "edit.merge_node: unknown store 'nope'",
    )
  })

  it('33. edit.set_edge — { store: "nope" } ⇒ unknown store, NOT "edit.set_edge: kind, source and target required"', async () => {
    const { dir, main } = await freshFixture()
    await expectReject(
      handleEditTool(main.store, 'edit.set_edge', { store: 'nope' }, vi.fn(), dir),
      "edit.set_edge: unknown store 'nope'",
    )
  })

  it('34. edit.import_markdown — { store: "nope", files: [...] } ⇒ unknown store; the importer NEVER ran (no file read, no batch, no broadcast)', async () => {
    const { dir, main, research, countsBefore } = await freshFixture()
    const cb = vi.fn()
    const importsBefore = importCalls.length
    await expectReject(
      handleEditTool(main.store, 'edit.import_markdown', { store: 'nope', files: ['/tmp/x.md'] }, cb, dir),
      "edit.import_markdown: unknown store 'nope'",
    )
    expect(importCalls.length).toBe(importsBefore) // the importer never ran
    expect([countOf(main.store), countOf(research.store)]).toEqual(countsBefore) // no batch
    expect(cb).not.toHaveBeenCalled() // no broadcast
  })
})

// ===========================================================================
// §5.3 — the resolution state matrix R1–R7 through the shared handlers
// ===========================================================================
describe('§5.3 — the resolution state matrix through the handlers (R1–R7 + engine selection + the omitted ≡ explicit-default equivalence)', () => {
  // Data states enumerated (§5.3 matrix):
  //   R1  omitted + dir injected ⇒ the DEFAULT entry serves the call
  //   R2  omitted + dir null/absent ⇒ LEGACY path — the passed store/engine
  //       params are used (byte-equal today; the resolver returned null)
  //   R3  a known name + dir ⇒ that entry's store/engine serve
  //   R4  a known name + dir null ⇒ fail-loud M2 (no directory ⇒ no store by
  //       that name exists on this server)
  //   R5  an unknown non-empty string + any ⇒ M2 (covered per tool above)
  //   R6  non-string ⇒ M1  (covered by the resolver + one handler probe)
  //   R7  empty string ⇒ M1  (covered by the resolver + one handler probe)
  //   +   the null-store guard stays FIRST (unchanged, mcp-server.ts:135,371)
  //   +   the engine-selection pin (entry.engine — never the per-call
  //       createRetrieval fallback) and the single-source-of-truth pin.

  it('35. the null-store configuration guard is UNCHANGED and FIRST: a null store + an unknown store arg ⇒ "no rag store configured" (never the resolver\'s M2)', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [{ name: DEFAULT_NAME, default: true }])
      await expectReject(
        handleRagTool(null, 'rag.query', { query: 'q', store: 'nope' }, null, dir),
        'rag.query: no rag store configured',
      )
      await expectReject(
        handleEditTool(null, 'edit.set_content', { store: 'nope' }, undefined, dir),
        'edit.set_content: no rag store configured',
      )
    })
  })

  it('36. R1 — omitted store + dir injected ⇒ the DEFAULT entry serves the call', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'default store content')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research store content')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      // rag.list_nodes through the default entry.
      const census = (await handleRagTool(main.store, 'rag.list_nodes', {}, main.engine, dir)) as Array<{ id: string }>
      expect(census.map((n) => n.id)).toEqual(['n1'])
      // rag.query through the default entry (content only in the default).
      const result = (await handleRagTool(main.store, 'rag.query', { query: 'default' }, main.engine, dir)) as RetrievalResult
      expect(result.ranked.map((r) => r.nodeId)).toEqual(['n1'])
    })
  })

  it('37. R3 + engine selection — a known name ⇒ that entry\'s store AND engine serve the call; the engine is entry.engine — NEVER the per-call createRetrieval fallback (F1 no-rebuild, per store)', async () => {
    await withDirAsync(async (root) => {
      const marker = makeMarkerEngine('ENTRY-ENGINE-MARKER')
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'default store content')], engine: marker },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research store content')] },
      ])
      const research = dir.entries.get(OTHER_NAME)!
      // R3 — the research entry's STORE serves the read (research-only content).
      const census = (await handleRagTool(dir.entries.get(DEFAULT_NAME)!.store, 'rag.list_nodes', { store: OTHER_NAME }, null, dir)) as Array<{ id: string }>
      expect(census.map((n) => n.id)).toEqual(['r1'])
      // Engine selection — engine param NULL: the marker proves the ENTRY's
      // engine answered (a per-call createRetrieval fallback would return a
      // real RetrievalResult without the marker markdown), and the F3 store
      // stamp is applied by the shared handler (the ONE stamp point, §5.9).
      const marked = (await handleRagTool(research.store, 'rag.query', { query: 'q' }, null, dir)) as unknown as { markdown: string; store: string }
      expect(marked.markdown).toBe('ENTRY-ENGINE-MARKER')
      expect(marked.store).toBe(DEFAULT_NAME)
      // R2 (the legacy sentinel through the handler) — dir null: the PASSED
      // engine is used unchanged (byte-equal today) and the result carries the
      // F3 legacy sentinel store: ''.
      const legacy = (await handleRagTool(research.store, 'rag.query', { query: 'research' }, research.engine, null)) as RetrievalResult
      expect(legacy.ranked[0].nodeId).toBe('r1')
      expect((legacy as unknown as { store: string }).store).toBe('') // F3 sentinel
    })
  })

  it('38. R4 — a KNOWN registry name with dir null ⇒ fail-loud M2 (no directory ⇒ no store by that name exists on this server)', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      await expectReject(
        handleRagTool(main.store, 'rag.query', { query: 'q', store: OTHER_NAME }, main.engine, null),
        `rag.query: unknown store '${OTHER_NAME}'`,
      )
      await expectReject(
        handleEditTool(main.store, 'edit.set_content', { nodeId: 'n1', content: 'x', store: OTHER_NAME }, undefined, undefined),
        `edit.set_content: unknown store '${OTHER_NAME}'`,
      )
    })
  })

  it('39. R6+R7 at the handler — a non-string or empty-string store value ⇒ the byte-pinned M1 message, NO side effect', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const research = dir.entries.get(OTHER_NAME)!
      const countsBefore = [countOf(main.store), countOf(research.store)]
      for (const raw of [null, 5, true, {}, '']) {
        await expectReject(
          handleRagTool(main.store, 'rag.list_nodes', { store: raw }, main.engine, dir),
          'rag.list_nodes: store must be a non-empty string',
        )
      }
      expect([countOf(main.store), countOf(research.store)]).toEqual(countsBefore)
    })
  })

  it('40. single source of truth + the omitted ≡ explicit-default equivalence — with dir injected the passed store/engine params are IGNORED: omitted and store:"main" hit the SAME default entry with identical results', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'default store content')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research store content')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      // A DECOY store + DECOY engine passed as the legacy params — with a
      // directory injected they are IGNORED (the directory is the single
      // source of truth).
      const decoy = createJsonRagStore({ path: join(root, 'decoy.json') })
      await decoy.putNode(makeNode('d1', 'decoy content'))
      const decoyEngine = makeMarkerEngine('DECOY-ENGINE-MARKER')
      const omitted = (await handleRagTool(decoy, 'rag.query', { query: 'default' }, decoyEngine, dir)) as RetrievalResult
      const explicit = (await handleRagTool(decoy, 'rag.query', { query: 'default', store: DEFAULT_NAME }, decoyEngine, dir)) as RetrievalResult
      // Both hit the DEFAULT entry (never the decoy).
      expect(omitted.ranked.map((r) => r.nodeId)).toEqual(['n1'])
      expect(explicit.ranked.map((r) => r.nodeId)).toEqual(['n1'])
      expect(omitted).toEqual(explicit) // identical results — §5.3 equivalence
      expect((omitted as unknown as { store: string }).store).toBe(DEFAULT_NAME) // F3
      // The census too: the decoy's node is NOT served — the default entry's.
      const census = (await handleRagTool(decoy, 'rag.list_nodes', {}, decoyEngine, dir)) as Array<{ id: string }>
      expect(census.map((n) => n.id)).toEqual(['n1'])
    })
  })
})

// ===========================================================================
// §5.5 — the per-store reconcile routing (the 2-arg onStoreChanged widening)
// ===========================================================================
describe('§5.5 — the per-store reconcile routing (the onStoreChanged callback is widened to (payload, storeName))', () => {
  // Data states enumerated (§5.3 step 5 + §5.5):
  //   an edit addressed at a NON-default store ⇒ the callback receives the
  //   RESOLVED name as the 2nd argument;
  //   an omitted-store edit ⇒ the default name;
  //   the LEGACY sentinel (dir == null) ⇒ '' (§5.3 step 5 legacy discipline);
  //   the payload shape is UNCHANGED { kind, nodeIds, edgeIds } (U-MS3's
  //   qualification does NOT land here);
  //   per-store index coherence: the ADDRESSED store's engine reconciles — a
  //   foreign store's index is untouched (§5.5).

  it('41. the callback receives the RESOLVED store name: store:"research-2026-09" ⇒ (payload, "research-2026-09"); omitted ⇒ (payload, "main"); the legacy sentinel (dir null) ⇒ (payload, "")', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research seed')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const research = dir.entries.get(OTHER_NAME)!
      // Addressed at the non-default store ⇒ the RESOLVED name.
      const cb1 = vi.fn()
      await handleEditTool(main.store, 'edit.set_content', { nodeId: 'r1', content: 'new content', store: OTHER_NAME }, cb1, dir)
      expect(cb1).toHaveBeenCalledTimes(1)
      expect(cb1.mock.calls[0]).toHaveLength(2)
      expect(cb1.mock.calls[0][0]).toEqual({ kind: 'content', nodeIds: ['r1'], edgeIds: [] })
      expect(cb1.mock.calls[0][1]).toBe(OTHER_NAME)
      // Omitted ⇒ the default name.
      const cb2 = vi.fn()
      await handleEditTool(main.store, 'edit.set_content', { nodeId: 'n1', content: 'edited' }, cb2, dir)
      expect(cb2).toHaveBeenCalledTimes(1)
      expect(cb2.mock.calls[0]).toHaveLength(2)
      expect(cb2.mock.calls[0][1]).toBe(DEFAULT_NAME)
      // The legacy sentinel (dir == null) ⇒ '' (§5.3 step 5).
      const cb3 = vi.fn()
      await handleEditTool(research.store, 'edit.set_content', { nodeId: 'r1', content: 'legacy edit' }, cb3, null)
      expect(cb3).toHaveBeenCalledTimes(1)
      expect(cb3.mock.calls[0]).toHaveLength(2)
      expect(cb3.mock.calls[0][1]).toBe('')
    })
  })

  it('42. SDK-level per-store index coherence — an edit addressed at the non-default store reconciles ONLY that entry\'s engine (the bound default engine is NOT used); the broadcast payload shape is UNCHANGED (U-MS3\'s field absent)', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research seed')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const research = dir.entries.get(OTHER_NAME)!
      // Recording engine doubles for BOTH entries.
      const mainEngine = makeRecordingEngine()
      const researchEngine = makeRecordingEngine()
      const coherentDir: RagStoreDirectory = {
        entries: new Map([
          [DEFAULT_NAME, { ...main, engine: mainEngine }],
          [OTHER_NAME, { ...research, engine: researchEngine }],
        ]),
        defaultName: DEFAULT_NAME,
      }
      const broadcasts: Array<{ channel: string; msg: unknown }> = []
      const backend: McpBackend = {
        invoke: async () => ({}),
        broadcast: (channel, msg) => broadcasts.push({ channel, msg }),
      }
      const server = new ProvidentMcpServer({
        backend,
        transport: 'stdio',
        gate: new SecurityGate(),
        ragStore: main.store,
        retrievalEngine: mainEngine,
        ragStores: coherentDir,
      })
      server.ensureServerRegistered()
      server.applyGatePatch({ groups: ['edit'] })
      const sdkServer = server.ensureServerRegistered()
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
      const client = new Client({ name: 'unit-ms2-reconcile', version: '0.1.0' })
      await Promise.all([
        client.connect(clientTransport),
        (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
      ])
      try {
        const result = await client.callTool({
          name: 'edit.set_content',
          arguments: { nodeId: 'r1', content: 'edited via sdk', store: OTHER_NAME },
        })
        const text = (result as { content?: Array<{ text?: string }> }).content?.[0]?.text ?? ''
        expect(text).toContain('"ok": true')
        // The ADDRESSED store's engine reconciled PER CALL — exactly once, with
        // the unchanged payload shape.
        expect(researchEngine.calls).toEqual([{ kind: 'content', nodeIds: ['r1'], edgeIds: [] }])
        // The DEFAULT (bound) engine was NOT used (per-store coherence, §5.5).
        expect(mainEngine.calls).toEqual([])
        // The broadcast is UNCHANGED in shape (the `store` field is U-MS3's).
        expect(broadcasts).toHaveLength(1)
        expect(broadcasts[0].channel).toBe(IPC_RAG_STORE_CHANGED)
        expect(Object.keys(broadcasts[0].msg as Record<string, unknown>).sort()).toEqual(['edgeIds', 'kind', 'nodeIds'])
      } finally {
        await client.close()
      }
    })
  })
})

// ===========================================================================
// §5.4 F4 — the IPC `dir` injection (handler-level plumbing only; the
// RagQueryPayload.store END-TO-END row is STAGED to U-MS5)
// ===========================================================================
describe('§5.4 F4 — handleRagQueryIpc gains the trailing optional dir (the §5.3 directory-injection pattern)', () => {
  // Data states enumerated (§5.4 step 4 / §5.9 tool-results row): at U-MS2 the
  // IPC payload carries NO store field ⇒ the resolver's omitted ⇒ default-entry
  // rule (S1) applies unchanged; the handler-level `dir` plumbing forwards into
  // handleRagTool so the resolver behaves IDENTICALLY on both surfaces
  // (MCP-UI-EQUIVALENCE). The RagQueryPayload.store END-TO-END row (a forwarded
  // unknown store failing loud on the IPC path) is U-MS5's — NOT authored here.

  it('43. the dir plumbing: decoy engine/store params IGNORED, the default entry serves, and the result deep-equals the MCP tool result (incl. the F3 store stamp "main")', async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [
        { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'default store content')] },
        { name: OTHER_NAME, seed: [makeNode('r1', 'research store content')] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      // A decoy engine over the research store + the research store passed as
      // the legacy params — the injected directory wins on BOTH surfaces.
      const decoyEngine = makeMarkerEngine('DECOY-ENGINE-MARKER')
      const research = dir.entries.get(OTHER_NAME)!
      const ipc = await handleRagQueryIpc(decoyEngine, research.store, { query: 'default' }, dir)
      const mcp = await handleRagTool(main.store, 'rag.query', { query: 'default' }, null, dir)
      expect(ipc).toEqual(mcp) // MCP/UI equivalence — §8.2 binding
      expect((ipc as unknown as { store: string }).store).toBe(DEFAULT_NAME) // F3
      const result = ipc as RetrievalResult
      expect(result.ranked.map((r) => r.nodeId)).toEqual(['n1'])
      expect(result.markdown).not.toBe('DECOY-ENGINE-MARKER')
    })
  })
})

// ===========================================================================
// §5.7 — the failed-store behavior matrix (store state × tool class)
// ===========================================================================
describe('§5.7 — the failed-store matrix (the store\'s OWN fail-disabled empty-store semantics, per store)', () => {
  // Data states enumerated (§5.7):
  //   loaded          present + valid      → corrupt false, missing false
  //   failed-corrupt  present, unparseable → corrupt true,  missing false — serves EMPTY
  //   failed-missing  absent (first run)   → corrupt false, missing true  — serves EMPTY (NOT an error state)
  // The two failed states differ ONLY in which flag is set (F6). The selector
  // still resolves a corrupt store's NAME (the name exists in the registry
  // regardless of file state) — a call addressing it serves the empty-store
  // row, never 'unknown store'. Cross-store independence: each store's state
  // affects only its own entries/tools.

  it('44. failed-corrupt serves EMPTY across the tool classes (reads, census, retrieval, edits, import)', async () => {
    // The import row needs a real corpus file under cwd (the default entry's
    // corpusRoot is undefined ⇒ the importer's cwd default).
    await withCwdDir(async (_rel, absNote) => {
      await withDirAsync(async (root) => {
        silenceConsole()
        writeFileSync(absNote, '# Note\n\nBody note.\n')
        const relNote = relative(process.cwd(), absNote)
        const loaded = loadRegistry(root, [
          { name: DEFAULT_NAME, default: true },
          { name: OTHER_NAME },
        ])
        writeFileSync(loaded.stores[0].persistenceFile, '{garbage') // the DEFAULT store corrupt
        writeFileSync(loaded.stores[1].persistenceFile, '{garbage') // research corrupt too
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        const main = plan.directory.entries.get(DEFAULT_NAME)!
        expect(main.corrupt).toBe(true)
        expect(main.missing).toBe(false)
        expect(storeLoadStatus(main)).toBe('failed-corrupt')
        // Read-census ⇒ [].
        expect(await handleRagTool(main.store, 'rag.list_nodes', {}, main.engine, plan.directory)).toEqual([])
        expect(await handleRagTool(main.store, 'rag.get_edges', {}, main.engine, plan.directory)).toEqual([])
        // Read-scoped (the HOST-6 pin + the Unit G empty shape).
        expect(await handleRagTool(main.store, 'rag.get_document', { documentId: 'doc1' }, main.engine, plan.directory)).toEqual({
          documentId: 'doc1',
          nodes: [],
          edges: [],
        })
        expect(await handleRagTool(main.store, 'rag.backlinks', { nodeId: 'x' }, main.engine, plan.directory)).toEqual({
          nodeId: 'x',
          backlinks: [],
          outlinks: [],
          crosslinkBacklinks: [],
          crosslinkOutlinks: [],
        })
        // Retrieval (the additive F3 store field stamps the addressed entry's name).
        expect(await handleRagTool(main.store, 'rag.query', { query: 'anything' }, main.engine, plan.directory)).toEqual({
          query: 'anything',
          ranked: [],
          context: [],
          markdown: '',
          lineMap: { ranges: [] },
          k: 5,
          store: DEFAULT_NAME,
        })
        // Content edit ⇒ the op's own node-not-found fail-state.
        expect(await handleEditTool(main.store, 'edit.set_content', { nodeId: 'x', content: 'y' }, undefined, plan.directory)).toEqual({
          ok: false,
          error: 'edit.set_content: node not found',
        })
        // Structural edits: create_node WRITES INTO the empty store (no
        // repair/quarantine/lock-out layer — the store's own contract).
        const created = (await handleEditTool(main.store, 'edit.create_node', { type: 'p', content: 'into empty' }, undefined, plan.directory)) as { ok: boolean; node: RagNode }
        expect(created.ok).toBe(true)
        expect(created.node.content).toBe('into empty')
        expect(await handleEditTool(main.store, 'edit.delete_node', { nodeId: 'nope' }, undefined, plan.directory)).toEqual({ ok: true, removed: false })
        expect(await handleEditTool(main.store, 'edit.split_node', { nodeId: 'nope', at: 1 }, undefined, plan.directory)).toEqual({
          ok: false,
          error: 'edit.split_node: node not found',
        })
        expect(await handleEditTool(main.store, 'edit.merge_node', { sourceId: 'a', targetId: 'b' }, undefined, plan.directory)).toEqual({
          ok: false,
          error: 'edit.merge_node: source/target not found',
        })
        expect(await handleEditTool(main.store, 'edit.set_edge', { kind: 'doc-child', source: 'a', target: 'b' }, undefined, plan.directory)).toEqual({
          ok: false,
          error: 'edit.set_edge: source/target node not found or quarantined',
        })
        // Import: the corpus imports INTO the empty store (the store's persist
        // discipline rewrites the file — Unit A). The default entry's corpusRoot
        // is undefined ⇒ the importer's cwd default ⇒ a real cwd-relative file.
        const imports = (await handleEditTool(main.store, 'edit.import_markdown', { files: [relNote] }, undefined, plan.directory)) as { ok: boolean; documentIds?: string[]; nodeCount?: number; edgeCount?: number }
        expect(imports.ok).toBe(true)
        expect(imports.documentIds).toEqual(['note'])
        expect(imports.nodeCount ?? 0).toBeGreaterThan(0)
        expect(imports.edgeCount ?? 0).toBeGreaterThan(0)
      })
    })
  })

  it('45. failed-missing — missing === true AND corrupt === false (F6: the two failed states differ ONLY in which flag is set); serves EMPTY identically', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const loaded = loadRegistry(root, [{ name: DEFAULT_NAME, default: true }])
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const main = plan.directory.entries.get(DEFAULT_NAME)!
      expect(main.missing).toBe(true)
      expect(main.corrupt).toBe(false)
      expect(storeLoadStatus(main)).toBe('failed-missing')
      expect(await handleRagTool(main.store, 'rag.list_nodes', {}, main.engine, plan.directory)).toEqual([])
      expect(await handleRagTool(main.store, 'rag.query', { query: 'x' }, main.engine, plan.directory)).toEqual({
        query: 'x',
        ranked: [],
        context: [],
        markdown: '',
        lineMap: { ranges: [] },
        k: 5,
        store: DEFAULT_NAME,
      })
    })
  })

  it('46. cross-store independence + the corrupt name still resolves — a corrupt non-default store never changes a main result; addressing the corrupt store serves the empty row, NEVER "unknown store"', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const loaded = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: OTHER_NAME },
      ])
      await createJsonRagStore({ path: loaded.stores[0].persistenceFile }).putNode(makeNode('n1', 'main seed content'))
      writeFileSync(loaded.stores[1].persistenceFile, '{garbage') // research corrupt
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const main = plan.directory.entries.get(DEFAULT_NAME)!
      // main's result is NORMAL (the corrupt research store never changes it).
      const census = (await handleRagTool(main.store, 'rag.list_nodes', {}, main.engine, plan.directory)) as Array<{ id: string }>
      expect(census.map((n) => n.id)).toEqual(['n1'])
      const query = (await handleRagTool(main.store, 'rag.query', { query: 'main' }, main.engine, plan.directory)) as RetrievalResult
      expect(query.ranked[0].nodeId).toBe('n1')
      // The selector still resolves the corrupt store's NAME — the empty-store
      // row, never 'unknown store'.
      const corruptCensus = (await handleRagTool(main.store, 'rag.list_nodes', { store: OTHER_NAME }, main.engine, plan.directory)) as unknown[]
      expect(corruptCensus).toEqual([])
      const research = plan.directory.entries.get(OTHER_NAME)!
      expect(research.corrupt).toBe(true)
      expect(research.missing).toBe(false)
      expect(storeLoadStatus(research)).toBe('failed-corrupt')
    })
  })
})

// ===========================================================================
// §5.8 — the boot-order state matrix (at the MODULE level) + D8 read-once
// ===========================================================================
describe('§5.8 — the boot-order state matrix at the module level (registry state × per-store file state)', () => {
  // Data states enumerated (§5.8 table):
  //   absent registry file   ⇒ the implicit entry (U-MS1/D3) ⇒ boot continues;
  //                            1 store + 1 engine; the store's OWN file state applies
  //   corrupt/unreadable     ⇒ fail-soft: the SAME implicit view — identical to
  //                            absent at the behavior level
  //   valid JSON, invalid    ⇒ the loader THROWS (U-MS1's fail-loud error set,
  //                            cited not restated) ⇒ NOTHING constructed: no
  //                            store file created/written (the fatal-path
  //                            ordering + app.exit(1) are main.ts wiring —
  //                            relegated per §6)
  //   valid                  ⇒ N stores + N engines; each store's file state independent
  // The D8 read-once module-level pin (the missing flag is never re-probed) is
  // test 16; the registry-read-once / IPC_OPERATOR_SETTINGS_SET pins are
  // main.ts wiring — relegated per §6 (code-review/live-battery pinned).

  it('47. absent registry file ⇒ the implicit main entry; boot continues; 1 store + 1 engine; the store\'s OWN file state applies (missing ⇒ failed-missing; corrupt ⇒ failed-corrupt serves empty; present+valid ⇒ loaded)', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      // Sub-case 1 — the store file ABSENT ⇒ failed-missing (first run).
      const absentDir = join(root, 'absent-store')
      mkdirSync(absentDir)
      const absent = loadRagStoreRegistry({ path: join(absentDir, 'provident-rag-stores.json') })
      const planAbsent = buildRagStoreDirectory(absent, { userDataPath: root, embedderKind: 'lexical', provider: null })
      expect(planAbsent.directory.entries.size).toBe(1)
      expect(planAbsent.defaultName).toBe('main')
      expect(storeLoadStatus(planAbsent.directory.entries.get('main')!)).toBe('failed-missing')
      // Sub-case 2 — the store file CORRUPT ⇒ failed-corrupt; serves empty.
      const corruptDir = join(root, 'corrupt-store')
      mkdirSync(corruptDir)
      writeFileSync(join(corruptDir, 'provident-rag.json'), '{garbage')
      const corrupt = loadRagStoreRegistry({ path: join(corruptDir, 'provident-rag-stores.json') })
      const planC = buildRagStoreDirectory(corrupt, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const entryC = planC.directory.entries.get('main')!
      expect(entryC.corrupt).toBe(true)
      expect(entryC.missing).toBe(false)
      expect(storeLoadStatus(entryC)).toBe('failed-corrupt')
      expect(await handleRagTool(entryC.store, 'rag.list_nodes', {}, entryC.engine, planC.directory)).toEqual([])
      // Sub-case 3 — the store file PRESENT + VALID ⇒ loaded.
      const validDir = join(root, 'valid-store')
      mkdirSync(validDir)
      const persistPath = join(validDir, 'provident-rag.json')
      await createJsonRagStore({ path: persistPath }).putNode(makeNode('n1', 'valid seed'))
      const valid = loadRagStoreRegistry({ path: join(validDir, 'provident-rag-stores.json') })
      const planV = buildRagStoreDirectory(valid, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const entryV = planV.directory.entries.get('main')!
      expect(storeLoadStatus(entryV)).toBe('loaded')
      const census = (await handleRagTool(entryV.store, 'rag.list_nodes', {}, entryV.engine, planV.directory)) as Array<{ id: string }>
      expect(census.map((n) => n.id)).toEqual(['n1'])
    })
  })

  it('48. corrupt/unreadable registry file ⇒ fail-soft: the SAME implicit view as absent at the behavior level; boot continues (1 store + 1 engine serve)', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const regPath = join(root, 'provident-rag-stores.json')
      writeFileSync(regPath, '{not json')
      const loaded = loadRagStoreRegistry({ path: regPath })
      expect(loaded.implicit).toBe(true)
      expect(loaded.corrupt).toBe(true) // U-MS1's own contract (its red set)
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      expect(plan.directory.entries.size).toBe(1)
      const census = (await handleRagTool(plan.directory.entries.get('main')!.store, 'rag.list_nodes', {}, plan.directory.entries.get('main')!.engine, plan.directory)) as unknown[]
      expect(census).toEqual([])
    })
  })

  it('49. valid JSON, invalid registry ⇒ the loader THROWS (fail-LOUD, U-MS1\'s pinned error set — cited, not restated); NOTHING constructed: the referenced persistence file does NOT exist', () => {
    withDir((root) => {
      silenceConsole()
      const regPath = join(root, 'provident-rag-stores.json')
      // Two defaults — invalid per U-MS1 (any of its fail-loud errors).
      writeFileSync(regPath, JSON.stringify({ version: 1, stores: [{ name: 'a', default: true }, { name: 'b', default: true }] }))
      const persistA = join(root, 'provident-rag-a.json')
      let threw = false
      try {
        loadRagStoreRegistry({ path: regPath })
      } catch {
        threw = true // the loader's byte-pinned error set is U-MS1's contract
      }
      expect(threw).toBe(true)
      // NOTHING downstream: no store file was created or written for the
      // registry's referenced persistence paths (the fatal-path ordering —
      // console.error + app.exit(1) BEFORE the window — is main.ts wiring,
      // relegated per §6).
      expect(existsSync(persistA)).toBe(false)
      expect(existsSync(join(root, 'provident-rag-b.json'))).toBe(false)
    })
  })

  it('50. valid registry ⇒ N stores + N engines, each store\'s file state independent (loaded + failed-corrupt + failed-missing in ONE directory)', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const loaded = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: 'a-corrupt' },
        { name: 'b-missing' },
      ])
      await createJsonRagStore({ path: loaded.stores[0].persistenceFile }).putNode(makeNode('n1', 'main seed'))
      writeFileSync(loaded.stores[1].persistenceFile, '{garbage')
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      expect(plan.directory.entries.size).toBe(3)
      expect(storeLoadStatus(plan.directory.entries.get(DEFAULT_NAME)!)).toBe('loaded')
      expect(storeLoadStatus(plan.directory.entries.get('a-corrupt')!)).toBe('failed-corrupt')
      expect(storeLoadStatus(plan.directory.entries.get('b-missing')!)).toBe('failed-missing')
      // Independent states compose: main serves its node; a-corrupt serves empty.
      const census = (await handleRagTool(plan.directory.entries.get(DEFAULT_NAME)!.store, 'rag.list_nodes', {}, plan.directory.entries.get(DEFAULT_NAME)!.engine, plan.directory)) as Array<{ id: string }>
      expect(census.map((n) => n.id)).toEqual(['n1'])
      const corruptCensus = (await handleRagTool(plan.directory.entries.get(DEFAULT_NAME)!.store, 'rag.list_nodes', { store: 'a-corrupt' }, null, plan.directory)) as unknown[]
      expect(corruptCensus).toEqual([])
    })
  })
})

// ===========================================================================
// §5.9 — the zero-config byte-equality acceptance criteria
// ===========================================================================
describe('§5.9 — the zero-config byte-equality rows (no provident-rag-stores.json present)', () => {
  // Rows enumerated (§5.9 table):
  //   persistence file   the implicit main entry's persistenceFile IS the
  //                      legacy provident-rag.json; NO registry file is created (D3)
  //   engine branch      covered by the §5.1 construction tests (10/11/12):
  //                      lexical ⇒ vectorBoot null + the entry's engine serves;
  //                      vector ⇒ exactly one boot, entry.engine === boot.engine,
  //                      non-defaults lexical with NO cache involvement
  //   import root        the implicit entry's corpusRoot is undefined ⇒ the
  //                      importer's ?? process.cwd() default ⇒ byte-identical
  //   tool results       for EACH of the 12 tools the directory-routed omitted
  //                      call deep-equals the legacy call on EVERY field EXCEPT
  //                      the F3 store delta on the query result ('main' vs '')

  it('51. persistence-file row — the absent-file loader output builds a 1-entry directory keyed main; after a putNode the LEGACY file exists and the registry file does NOT (D3, never written back)', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const regPath = join(root, 'provident-rag-stores.json')
      const loaded = loadRagStoreRegistry({ path: regPath }) // the file is ABSENT
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      expect(plan.directory.entries.size).toBe(1)
      expect(plan.directory.entries.get('main')).toBeDefined()
      expect(plan.defaultName).toBe('main')
      const store = plan.directory.entries.get('main')!.store
      await store.putNode(makeNode('n1', 'legacy path'))
      // The legacy persistence file EXISTS (the implicit entry's path).
      expect(existsSync(join(root, 'provident-rag.json'))).toBe(true)
      // The registry file was NEVER created (D3 — the implicit entry is never
      // written back).
      expect(existsSync(regPath)).toBe(false)
    })
  })

  it('52. import-root row (zero-config half) — entries.get("main").corpusRoot is undefined; a RELATIVE file under cwd imports through the directory byte-equal to the legacy call; an ABSOLUTE file OUTSIDE cwd fails containment (proving the cwd default applied)', async () => {
    await withCwdDir(async (relFile, absFile) => {
      await withDirAsync(async (root) => {
        silenceConsole()
        writeFileSync(absFile, '# Note\n\nBody note.\n')
        const loaded = loadRegistry(root, [{ name: DEFAULT_NAME, default: true }])
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        const main = plan.directory.entries.get(DEFAULT_NAME)!
        expect(main.corpusRoot).toBeUndefined()
        // The directory-routed call (2-arg wired form, corpusRoot undefined).
        const routed = (await handleEditTool(main.store, 'edit.import_markdown', { files: [relFile] }, undefined, plan.directory)) as { ok: boolean; documentIds?: string[] }
        expect(routed.ok).toBe(true)
        expect(routed.documentIds).toEqual(['note'])
        // The LEGACY call (dir == null) — byte-equal outcome on the same file.
        const legacyStore = createJsonRagStore({ path: join(root, 'legacy-import.json') })
        const legacy = (await handleEditTool(legacyStore, 'edit.import_markdown', { files: [relFile] }, undefined, null)) as { ok: boolean; documentIds?: string[] }
        expect(legacy.ok).toBe(true)
        expect(legacy.documentIds).toEqual(['note'])
        // An ABSOLUTE file OUTSIDE cwd fails containment — the cwd default is
        // what applied (the file is outside resolve(process.cwd())).
        const outside = mkdtempSync(join(tmpdir(), 'provident-ms2-outside-'))
        try {
          const outsideFile = join(outside, 'out.md')
          writeFileSync(outsideFile, '# Out\n\nBody out.\n')
          const failed = (await handleEditTool(main.store, 'edit.import_markdown', { files: [outsideFile] }, undefined, plan.directory)) as { ok: boolean; error?: string; failedFile?: string }
          expect(failed.ok).toBe(false)
          expect(failed.error).toBe(`markdown import: path outside corpus root: ${outsideFile}`)
          expect(failed.failedFile).toBe(outsideFile)
        } finally {
          rmSync(outside, { recursive: true, force: true })
        }
      })
    })
  })

  it('53. import-root row (per-store half) — a non-default store with a CONFIGURED corpusRoot: an absolute file inside cwd but OUTSIDE that root fails containment; a file INSIDE the root imports ok (ADV-1: the store arg selects only the root)', async () => {
    await withCwdDir(async (relFile, absFile) => {
      await withDirAsync(async (root) => {
        silenceConsole()
        writeFileSync(absFile, '# Cwd Note\n\nBody cwd note.\n')
        const corpusRoot = join(root, 'corpus')
        mkdirSync(corpusRoot)
        const insideFile = join(corpusRoot, 'inside.md')
        writeFileSync(insideFile, '# Inside\n\nBody inside.\n')
        const loaded = loadRegistry(root, [
          { name: DEFAULT_NAME, default: true },
          { name: OTHER_NAME, corpusRoot },
        ])
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        const research = plan.directory.entries.get(OTHER_NAME)!
        expect(research.corpusRoot).toBe(corpusRoot)
        // An absolute file inside cwd but OUTSIDE the addressed store's
        // corpusRoot ⇒ the pinned containment failure (§5.6 observable TODAY).
        const failed = (await handleEditTool(research.store, 'edit.import_markdown', { files: [absFile], store: OTHER_NAME }, undefined, plan.directory)) as { ok: boolean; error?: string; failedFile?: string }
        expect(failed.ok).toBe(false)
        expect(failed.error).toBe(`markdown import: path outside corpus root: ${absFile}`)
        expect(failed.failedFile).toBe(absFile)
        // A file INSIDE the configured root imports ok (the per-store root
        // flows through the programmatic param).
        const ok = (await handleEditTool(research.store, 'edit.import_markdown', { files: [insideFile], store: OTHER_NAME }, undefined, plan.directory)) as { ok: boolean; documentIds?: string[] }
        expect(ok.ok).toBe(true)
        // SANCTIONED RE-PIN (U-MS4, 2026-09-05 — spec §5.6's staging note):
        // the wired non-default import mints `<name>:`-prefixed documentIds
        // now that F2's third-argument pass-through is live, so the value pin
        // `['inside']` (green at U-MS2) is the PREFIXED id from the U-MS4
        // window onward (§5.6's red-set addition, F2).
        expect(ok.documentIds).toEqual([`${OTHER_NAME}:inside`])
      })
    })
  })

  it('54. tool-results row + F3 — for EACH of the 12 tools the directory-routed omitted call deep-equals the legacy call on EVERY field EXCEPT the query store delta ("main" vs ""); a non-default query returns THAT store\'s name; the legacy sentinel carries ""', async () => {
    await withCwdDir(async (relFile, absNote) => {
      await withDirAsync(async (root) => {
        silenceConsole()
        writeFileSync(absNote, '# Note\n\nBody note with alpha.\n')
        // The DIRECTORY side: main (default) + research, built the wired way.
        const loaded = loadRegistry(root, [
          { name: DEFAULT_NAME, default: true },
          { name: OTHER_NAME },
        ])
        // Pre-seed BOTH logical sides identically (fixed ids — putNode
        // preserves them; same fixtures, same store state, §5.9).
        const dirPersist = loaded.stores[0].persistenceFile
        const dirStore = createJsonRagStore({ path: dirPersist })
        await dirStore.putNode(makeNode('n1', 'seed one alpha'))
        await dirStore.putNode(makeNode('n2', 'seed two beta'))
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        // The LEGACY side: an identical fresh store + engine (the R2 path).
        const legacyRoot = join(root, 'legacy-side')
        mkdirSync(legacyRoot)
        const legacyStore = createJsonRagStore({ path: join(legacyRoot, 'provident-rag.json') })
        await legacyStore.putNode(makeNode('n1', 'seed one alpha'))
        await legacyStore.putNode(makeNode('n2', 'seed two beta'))
        const legacyEngine = createRetrieval(legacyStore, createLexicalEmbedder(createLexicalIndex(legacyStore.listNodes())))

        const ops: Array<{ tool: string; args: Record<string, unknown>; kind: 'rag' | 'edit' }> = [
          { tool: 'edit.create_node', args: { type: 'p', content: 'alpha created' }, kind: 'edit' },
          { tool: 'edit.set_content', args: { nodeId: 'n1', content: 'gamma delta' }, kind: 'edit' },
          { tool: 'edit.delete_node', args: { nodeId: 'n2' }, kind: 'edit' },
          { tool: 'edit.split_node', args: { nodeId: 'n1', at: 5 }, kind: 'edit' },
          { tool: 'edit.merge_node', args: { sourceId: 'zz', targetId: 'yy' }, kind: 'edit' },
          { tool: 'edit.set_edge', args: { kind: 'doc-child', source: 'n1', target: 'n1' }, kind: 'edit' },
          { tool: 'edit.import_markdown', args: { files: [relFile] }, kind: 'edit' },
          { tool: 'rag.list_nodes', args: {}, kind: 'rag' },
          { tool: 'rag.get_edges', args: {}, kind: 'rag' },
          { tool: 'rag.get_document', args: { documentId: 'note' }, kind: 'rag' },
          { tool: 'rag.backlinks', args: { nodeId: 'n1' }, kind: 'rag' },
          { tool: 'rag.query', args: { query: 'alpha', topK: 3 }, kind: 'rag' },
        ]
        for (const op of ops) {
          // LEGACY: the passed store/engine params, NO dir (byte-equal today).
          const legacyResult =
            op.kind === 'rag'
              ? await handleRagTool(legacyStore, op.tool, op.args, legacyEngine, null)
              : await handleEditTool(legacyStore, op.tool, op.args, vi.fn(), null)
          // DIRECTORY-ROUTED: store OMITTED ⇒ the default entry (S1). The
          // passed store param is the LEGACY store — ignored (single source
          // of truth).
          const routedResult =
            op.kind === 'rag'
              ? await handleRagTool(legacyStore, op.tool, op.args, legacyEngine, plan.directory)
              : await handleEditTool(legacyStore, op.tool, op.args, vi.fn(), plan.directory)
          if (op.tool === 'rag.query') {
            // F3 — the ONE intentional delta: 'main' (directory-routed) vs ''
            // (legacy sentinel).
            const legacyQuery = legacyResult as RetrievalResult & { store?: string }
            const routedQuery = routedResult as RetrievalResult & { store?: string }
            expect(routedQuery.store).toBe(DEFAULT_NAME)
            expect(legacyQuery.store).toBe('')
            const { store: _s1, ...legacyRest } = legacyQuery as unknown as Record<string, unknown>
            const { store: _s2, ...routedRest } = routedQuery as unknown as Record<string, unknown>
            expect(normalize(routedRest)).toEqual(normalize(legacyRest))
          } else {
            expect(normalize(routedResult)).toEqual(normalize(legacyResult))
          }
        }
        // The F3 non-default row: a query addressed at the non-default store
        // carries THAT store's registry name on the result.
        const researchQuery = (await handleRagTool(legacyStore, 'rag.query', { query: 'note', store: OTHER_NAME }, legacyEngine, plan.directory)) as RetrievalResult & { store?: string }
        expect(researchQuery.store).toBe(OTHER_NAME)
      })
    })
  })
})

// ===========================================================================
// §5.6 — the per-store import root + the F2 EXECUTION-ORDER STAGING
// ===========================================================================
describe('§5.6 — the wired import: the per-store corpusRoot + the F2 pass-through (RE-PINNED at U-MS4: the 3-ARG form with the pinned ImportStoreContext; the LEGACY path stays the 2-ARG form)', () => {
  // SANCTIONED RE-PIN (U-MS4, 2026-09-05 — §5.6's execution-order staging
  // note): at U-MS2 the byte-equality red asserted the 2-ARG form because
  // U-MS4's optional third parameter did NOT exist yet:
  //   importMarkdownCorpus(ctx, { files, corpusRoot: entry.corpusRoot })
  // §5.6 pins the flip — "from the U-MS4 window onward the wired call passes
  // the third argument EXACTLY as pinned above"; U-MS4's parameter has landed,
  // so test 55 now asserts the 3-ARG form
  //   importMarkdownCorpus(ctx, { files, corpusRoot: entry.corpusRoot },
  //     { name, isDefault, reservedNames })
  // with `reservedNames` = ONLY the non-default names (U-MS4 §5.4 A1-S7: the
  // seam takes the list as GIVEN, so the wiring must never include the default
  // store's own name).
  // The LEGACY directory-less path (dir == null, R2) passes NO third argument
  // and NO corpusRoot (byte-equal today).

  it('55. the wired import call shape (RE-PINNED at U-MS4 — was the 2-ARG staging pin) — the wired call is the 3-ARG form with params { files, corpusRoot: entry.corpusRoot } and the pinned ImportStoreContext { name, isDefault, reservedNames }; the LEGACY path passes NO corpusRoot and NO third argument', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const corpusRoot = join(root, 'corpus')
      mkdirSync(corpusRoot)
      const loaded = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: OTHER_NAME, corpusRoot },
      ])
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const research = plan.directory.entries.get(OTHER_NAME)!
      const inside = join(corpusRoot, 'note.md')
      writeFileSync(inside, '# Note\n\nBody note.\n')
      const before = importCalls.length
      await handleEditTool(research.store, 'edit.import_markdown', { files: [inside], store: OTHER_NAME }, undefined, plan.directory)
      expect(importCalls.length).toBe(before + 1)
      const wired = importCalls[importCalls.length - 1]
      // THE RE-PINNED CALL SHAPE — the 3-ARG form (U-MS4 landed the optional
      // ImportStoreContext parameter; §5.6's staging note governs the flip
      // "from the U-MS4 window onward"). The third argument is the pinned
      // context: name/isDefault from the ADDRESSED entry; reservedNames =
      // ONLY the non-default names (A1-S7).
      expect(wired).toHaveLength(3)
      expect(wired![1]).toEqual({ files: [inside], corpusRoot })
      expect(wired![2]).toEqual({ name: OTHER_NAME, isDefault: false, reservedNames: [OTHER_NAME] })
      // The DEFAULT entry's wired call passes corpusRoot: entry.corpusRoot —
      // undefined for the zero-config implicit entry (byte-equal cwd default).
      const main = plan.directory.entries.get(DEFAULT_NAME)!
      const beforeDefault = importCalls.length
      await handleEditTool(main.store, 'edit.import_markdown', { files: [] }, undefined, plan.directory)
      const wiredDefault = importCalls[importCalls.length - 1]
      expect(wiredDefault).toHaveLength(3)
      expect((wiredDefault![1] as { corpusRoot?: string }).corpusRoot).toBeUndefined()
      // The DEFAULT entry's context: isDefault true (name unused on the
      // default path), and reservedNames STILL lists the OTHER non-default
      // stores (A1's reserved namespace is consulted on the default seam).
      expect(wiredDefault![2]).toEqual({ name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME] })
      // The LEGACY directory-less path (dir == null): NO corpusRoot AT ALL —
      // byte-equal today (params are exactly { files }).
      const beforeLegacy = importCalls.length
      await handleEditTool(main.store, 'edit.import_markdown', { files: ['whatever.md'] }, undefined, null)
      const wiredLegacy = importCalls[importCalls.length - 1]
      expect(wiredLegacy).toHaveLength(2)
      expect(Object.keys(wiredLegacy![1] as Record<string, unknown>)).toEqual(['files'])
    })
  })

  // F2 red-set addition (binding, §5.6): the WIRED import into a NON-default
  // store mints `<name>:`-prefixed documentIds (STORE-ID-PREFIX activated
  // through the wired path via the third-argument pass-through). RED at
  // U-MS2 — goes green with U-MS4's importer parameter (the U-MS2 → U-MS4
  // order; the contract + the assertion are owned HERE).
  it('56. F2 (staged red) — the wired import into a NON-default store mints "<name>:"-prefixed documentIds (STORE-ID-PREFIX via the wired pass-through)', async () => {
    await withDirAsync(async (root) => {
      silenceConsole()
      const corpusRoot = join(root, 'corpus')
      mkdirSync(corpusRoot)
      const inside = join(corpusRoot, 'note.md')
      writeFileSync(inside, '# Note\n\nBody note.\n')
      const loaded = loadRegistry(root, [
        { name: DEFAULT_NAME, default: true },
        { name: OTHER_NAME, corpusRoot },
      ])
      const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
      const research = plan.directory.entries.get(OTHER_NAME)!
      const result = (await handleEditTool(research.store, 'edit.import_markdown', { files: [inside], store: OTHER_NAME }, undefined, plan.directory)) as { ok: boolean; documentIds?: string[] }
      expect(result.ok).toBe(true)
      // The STORE-ID-PREFIX half (§5.6 red-set addition, F2): every minted
      // documentId carries the `<name>:` prefix. (The exact prefix rendering
      // beyond the `<name>:` shape is U-MS4's pinned surface.)
      expect(result.documentIds!.length).toBeGreaterThan(0)
      for (const id of result.documentIds!) expect(id.startsWith(`${OTHER_NAME}:`)).toBe(true)
    })
  })

  // The byte-equal half: the DEFAULT store's wired import stays UNPREFIXED
  // (§5.6 execution-order note — green at U-MS2's own trio).
  it('57. the wired import into the DEFAULT store stays UNPREFIXED (byte-equal — the §5.9 import-root row)', async () => {
    await withCwdDir(async (relFile, absNote) => {
      await withDirAsync(async (root) => {
        silenceConsole()
        writeFileSync(absNote, '# Note\n\nBody note.\n')
        const loaded = loadRegistry(root, [{ name: DEFAULT_NAME, default: true }])
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        const main = plan.directory.entries.get(DEFAULT_NAME)!
        const result = (await handleEditTool(main.store, 'edit.import_markdown', { files: [relFile] }, undefined, plan.directory)) as { ok: boolean; documentIds?: string[] }
        expect(result.ok).toBe(true)
        expect(result.documentIds).toEqual(['note']) // UNPREFIXED (byte-equal)
      })
    })
  })
})

// ===========================================================================
// §3a adversarial fix batch F-MS2-1..F-MS2-7 (2026-09-05) — RED-FIRST
// regression tests (RCA-1: written and run RED against the PRE-FIX modules
// BEFORE any fix). Sources: the Architect's ruled fix batch on the U-MS2
// adversarial pass + the spec amendments (unit-ms1-store-registry.md §5.4 F14
// + §5.3.2 Pass D seed sentence; unit-ms2-store-wiring.md §3a record, §5.1 M2
// cap, §5.2 A5 amendment, §5.7 limitation). The 57 tests above stay
// byte-intact EXCEPT the SANCTIONED test-20 re-pin (F-MS2-6: the amended A5
// description string — the const above); numbering continues at 58. Test 56
// (U-MS4's staged red) is UNTOUCHED and stays red through this batch.
//
// The F-MS2-4 (spec erratum) / F-MS2-3 (documented limitation) / F-MS2-8/9
// (INFO notes) items are spec-only rulings — no code, no test here; they are
// registered in docs/specs/unit-ms2-store-wiring.md §3a.
//
// PLACEMENT NOTE (the unit-ms1 test file's F-MS1-5 precedent): the FIFO test
// (63 — last) is PLACED LAST deliberately — against the PRE-FIX module it HANGS
// inside createJsonRagStore's load (readFileSync on a FIFO never returns —
// the F-MS2-2 defect itself), and a worker wedged in sync code cannot be
// interrupted, so it must not sit before the other results report. Short
// timeout keeps a wedged run identifiable; the red run is killed at the wall
// clock.
// ===========================================================================

// ---------------------------------------------------------------------------
// Availability probes (the unit-ms1 test file's idiom): a real FIFO needs
// mkfifo(1) — Linux-only per the ruling (probed once at load, in its own
// cleaned-up temp dir); /dev/null is a character device expressible WITHOUT
// root (`isFile() === false` on unix-likes).
// ---------------------------------------------------------------------------
const DEVICE_FILE_PATH = '/dev/null'

const DEVICE_FILE_AVAILABLE: boolean = (() => {
  try {
    return existsSync(DEVICE_FILE_PATH) && !statSync(DEVICE_FILE_PATH).isFile()
  } catch {
    return false
  }
})()

const CAN_MKFIFO: boolean = (() => {
  if (process.platform !== 'linux') {
    return false
  }
  const probeDir = mkdtempSync(join(tmpdir(), 'provident-ms2-mkfifo-probe-'))
  try {
    return spawnSync('mkfifo', [join(probeDir, 'probe.fifo')]).status === 0
  } finally {
    rmSync(probeDir, { recursive: true, force: true })
  }
})()

describe('§3a adversarial fix batch — the R-series regressions (the ruled fix batch)', () => {
  // ---------------------------------------------------------------------------
  // F-MS2-1 (HIGH) — the registry-file self-collision (F14): a store whose
  // derived/explicit persistence path resolves onto the LOADED registry file's
  // own path passed U-MS1 validation and silently shadowed it — the first
  // store write destroyed provident-rag-stores.json and the NEXT boot failed
  // loud (locked out). FIX: the loader threads its own resolved registry path
  // into Pass D as the seeded reserved key (unit-ms1 §5.3.2 seed sentence +
  // §5.4 F14).
  // ---------------------------------------------------------------------------
  it('58. F-MS2-1 (F14) — a DERIVED persistence path resolving onto the registry file itself (an entry named "stores") ⇒ fail-loud with the byte-pinned F14; the registry file survives the throw byte-intact', () => {
    withDir((root) => {
      silenceConsole()
      const regPath = join(root, 'provident-rag-stores.json')
      const registry = JSON.stringify({
        version: 1,
        stores: [{ name: DEFAULT_NAME, default: true }, { name: 'stores' }],
      })
      writeFileSync(regPath, registry)
      // The entry named 'stores' derives <dir>/provident-rag-stores.json — the
      // LOADED registry file's own path. F14 (new; byte-pinned — F13 shape).
      expectThrow(
        () => loadRagStoreRegistry({ path: regPath }),
        `rag-store-registry: persistence file collision with the registry file: ${regPath} (store 'stores')`,
      )
      // Fail-LOUD means throw only — NOTHING is written (the module never
      // writes; the operator's registry file is byte-intact).
      expect(readFileSync(regPath, 'utf8')).toBe(registry)
    })
  })

  it("59. F-MS2-1 (F14) — the EXPLICIT-path variant (persistenceFile === the registry file) ⇒ the same F14; the loader's seeding is the ONLY change: the direct-JS 2-arg resolveRegistry still resolves the same parsed value (U-MS1 byte-intact) and the implicit-entry synthesis is unaffected", () => {
    withDir((root) => {
      silenceConsole()
      const regPath = join(root, 'provident-rag-stores.json')
      const registry = JSON.stringify({
        version: 1,
        stores: [{ name: DEFAULT_NAME, default: true }, { name: OTHER_NAME, persistenceFile: regPath }],
      })
      writeFileSync(regPath, registry)
      expectThrow(
        () => loadRagStoreRegistry({ path: regPath }),
        `rag-store-registry: persistence file collision with the registry file: ${regPath} (store '${OTHER_NAME}')`,
      )
      // The pure direct-JS form (2 args — NO reserved path threaded) resolves
      // the same parsed value VALID: the seeding is the LOADER's contribution
      // (unit-ms1 §5.3.2 — the optional internal reserved-path param).
      const pure = resolveRegistry(JSON.parse(readFileSync(regPath, 'utf8')), root)
      expect(pure.stores).toHaveLength(2)
      expect(pure.defaultStoreName).toBe(DEFAULT_NAME)
      // The implicit-entry synthesis is unaffected (an ABSENT registry file ⇒
      // the implicit main entry deriving provident-rag.json — never the
      // registry file's own name).
      const absent = loadRagStoreRegistry({ path: join(root, 'absent', 'provident-rag-stores.json') })
      expect(absent.implicit).toBe(true)
      expect(absent.corrupt).toBe(false)
      expect(absent.stores).toEqual([
        { name: DEFAULT_NAME, default: true, persistenceFile: join(root, 'absent', 'provident-rag.json') },
      ])
    })
  })

  // ---------------------------------------------------------------------------
  // F-MS2-5 (LOW) — the M2 echo cap (the F-MS1-6 idiom): the `<raw>` echo in
  // `<tool>: unknown store '<raw>'` is capped at 200 chars — longer than 200
  // renders as its first 197 chars + '…' (exactly 198 chars); the cap applies
  // to the RENDERING only (membership/validation unchanged — still M2).
  // ---------------------------------------------------------------------------
  it("60. F-MS2-5 — the M2 echo is CAPPED: a 300-char unknown store yields the truncated byte-exact message (first 197 + '…') through the resolver AND the handler; the ≤200-char case stays byte-exact", async () => {
    await withDirAsync(async (root) => {
      const dir = await makeDirectory(root, [{ name: DEFAULT_NAME, default: true }])
      const raw300 = 'a'.repeat(300)
      const capped300 = `rag.query: unknown store '${'a'.repeat(197)}…'`
      // Resolver level — the echo is the capped rendering.
      expectThrow(() => resolveStoreArg('rag.query', raw300, dir), capped300)
      // Still M2 (membership), never M1 — the cap touches the message only.
      expectThrow(() => resolveStoreArg('edit.set_content', raw300, dir), `edit.set_content: unknown store '${'a'.repeat(197)}…'`)
      // The idiom's boundary: a raw of exactly 200 chars stays byte-exact.
      const raw200 = 'b'.repeat(200)
      expectThrow(() => resolveStoreArg('rag.query', raw200, dir), `rag.query: unknown store '${raw200}'`)
      // Handler level — the capped message reaches the MCP surface unchanged.
      const main = dir.entries.get(DEFAULT_NAME)!
      await expectReject(
        handleRagTool(main.store, 'rag.query', { query: 'q', store: raw300 }, main.engine, dir),
        capped300,
      )
    })
  })

  // ---------------------------------------------------------------------------
  // F-MS2-7 (LOW) — the embedderKind runtime guard: buildRagStoreDirectory
  // accepted ANY kind value (a wiring bug / an any-holed caller silently took
  // the lexical branch for every store). Fail loud BEFORE any construction —
  // the guard precedes even the rule-5 one-default cross-check (which itself
  // precedes any store construction, §5.1 rule 5). Message byte-pinned with
  // the jsonOf-style TOTAL + CAPPED rendering (the F-MS1-3/F-MS1-6 idiom).
  // ---------------------------------------------------------------------------
  it("61. F-MS2-7 — embedderKind neither 'lexical' nor 'vector' ⇒ EXACTLY \"rag-store-directory: embedderKind must be 'lexical' or 'vector' (got <json>)\" BEFORE any construction (precedes the rule-5 cross-check); the rendering is TOTAL + CAPPED", () => {
    withDir((root) => {
      silenceConsole()
      const registry: ResolvedRegistry = {
        stores: [{ name: DEFAULT_NAME, default: true, persistenceFile: join(root, 'p-main.json') }],
        defaultStoreName: DEFAULT_NAME,
      }
      // The jsonOf-style rendering (JSON.stringify; undefined renders bare).
      const expected = (kind: unknown): string =>
        `rag-store-directory: embedderKind must be 'lexical' or 'vector' (got ${kind === undefined ? 'undefined' : JSON.stringify(kind)})`
      for (const kind of ['hybrid', 5, null, true, '']) {
        expectThrow(
          () =>
            buildRagStoreDirectory(registry, {
              userDataPath: root,
              embedderKind: kind as 'lexical' | 'vector',
              provider: null,
            }),
          expected(kind),
        )
      }
      expectThrow(
        () =>
          buildRagStoreDirectory(registry, {
            userDataPath: root,
            embedderKind: undefined as unknown as 'lexical' | 'vector',
            provider: null,
          }),
        expected(undefined),
      )
      // BEFORE any construction — the guard precedes the rule-5 cross-check:
      // an INVALID registry + an invalid kind throws the KIND message.
      const invalidRegistry: ResolvedRegistry = { stores: [], defaultStoreName: DEFAULT_NAME }
      expectThrow(
        () =>
          buildRagStoreDirectory(invalidRegistry, {
            userDataPath: root,
            embedderKind: 'hybrid' as 'lexical' | 'vector',
            provider: null,
          }),
        expected('hybrid'),
      )
      // CAPPED rendering (the F-MS1-6 idiom — the cap applies to the RENDERING,
      // quotes included): a 300-char kind renders as its first 197 chars + '…'
      // = '"' + 196 x's + '…' (exactly 198 rendered chars).
      expectThrow(
        () =>
          buildRagStoreDirectory(registry, {
            userDataPath: root,
            embedderKind: 'x'.repeat(300) as 'lexical' | 'vector',
            provider: null,
          }),
        `rag-store-directory: embedderKind must be 'lexical' or 'vector' (got "${'x'.repeat(196)}…)`,
      )
      // Nothing constructed: no store file exists after the throws.
      expect(existsSync(join(root, 'p-main.json'))).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // F-MS2-2 (MEDIUM) — a FIFO/device at a STORE persistenceFile hung the boot:
  // rag-store.ts load() probed only existsSync, so readFileSync on a FIFO
  // blocked forever (single-threaded boot — the hang/OOM class). FIX: an
  // isFile() probe alongside existsSync (the F-MS1-5 registry-side precedent);
  // a non-regular file (isFile false OR a throwing stat) takes the EXISTING
  // corrupt-class fail-soft outcome; a directory keeps its graceful
  // EISDIR⇒corrupt outcome (outcome-identical — the probe short-circuits it).
  // ---------------------------------------------------------------------------

  // SKIP REASON (per the ruling): a device file expressible WITHOUT root —
  // /dev/null is a character device (`statSync().isFile() === false`). NEVER
  // MUTATED: a persist would rename a temp file over the device node — this
  // test constructs + reads ONLY (construction performs no write).
  it.runIf(DEVICE_FILE_AVAILABLE)(
    '62. F-MS2-2 — a DEVICE at a store persistenceFile (/dev/null, no root needed) ⇒ the corrupt-class outcome at BOTH seams (the store load + the wired construction); construct + read ONLY',
    () => {
      withDir((root) => {
        silenceConsole()
        // Unit level — the store's own load probe.
        const store = createJsonRagStore({ path: DEVICE_FILE_PATH })
        expect(store.status().corrupt).toBe(true)
        expect(store.listNodes()).toEqual([])
        // Wiring level — a registry entry whose persistenceFile IS the device.
        const loaded = loadRegistry(root, [
          { name: DEFAULT_NAME, default: true, persistenceFile: DEVICE_FILE_PATH },
        ])
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        const entry = plan.directory.entries.get(DEFAULT_NAME)!
        expect(entry.corrupt).toBe(true)
        expect(entry.missing).toBe(false) // the device EXISTS (existsSync true)
        expect(storeLoadStatus(entry)).toBe('failed-corrupt')
        expect(entry.store.listNodes()).toEqual([])
      })
    },
  )

  // SKIP REASON (per the ruling): a real FIFO needs mkfifo(1) — Linux-only.
  // PLACED LAST deliberately (see the block comment above): against the
  // PRE-FIX module this test HANGS inside createJsonRagStore's load (the
  // F-MS2-2 defect itself — the worker cannot be interrupted; the red run is
  // killed at the wall clock). Short timeout keeps a wedged run identifiable.
  it.runIf(CAN_MKFIFO)(
    '63. F-MS2-2 — a FIFO at a STORE persistenceFile ⇒ the entry CONSTRUCTS fail-soft (corrupt:true, serves [], the call RETURNS — the isFile probe fires BEFORE the blocking read)',
    async () => {
      await withDirAsync(async (root) => {
        silenceConsole()
        const loaded = loadRegistry(root, [{ name: DEFAULT_NAME, default: true }])
        const fifoPath = loaded.stores[0].persistenceFile
        expect(spawnSync('mkfifo', [fifoPath]).status).toBe(0)
        // THE RED POINT: the pre-fix module HUNG here (readFileSync on a FIFO
        // never returns — no writer ⇒ no EOF). The call must RETURN.
        const plan = buildRagStoreDirectory(loaded, { userDataPath: root, embedderKind: 'lexical', provider: null })
        const entry = plan.directory.entries.get(DEFAULT_NAME)!
        expect(entry.corrupt).toBe(true)
        expect(entry.missing).toBe(false) // the FIFO EXISTS (existsSync true)
        expect(storeLoadStatus(entry)).toBe('failed-corrupt')
        // The store serves EMPTY (the fail-disabled empty-store semantics).
        expect(entry.store.listNodes()).toEqual([])
        expect(entry.store.listEdges()).toEqual([])
        // Boot continues: the engine answers over the empty store.
        const result = await entry.engine.query('anything')
        expect(result.ranked).toEqual([])
      })
    },
    2000,
  )
})