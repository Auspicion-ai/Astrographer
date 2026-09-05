// tests/vector-boot-adversarial.test.ts — Unit F / W1: the RCA-3 adversarial
// pass regressions (F-W1-1..F-W1-5).
//
// This file is SPEC-PINNED for W1 in docs/specs/unit-f-embeddings.md §5.12
// (the unit-mapping table: `tests/vector-boot.test.ts` +
// `tests/vector-boot-adversarial.test.ts`). One regression test per finding;
// each pins the FIX SHAPE decided for that finding:
//
//   F-W1-1 (HIGH)    the §5.12 reconcile loop must NOT re-embed a node whose
//                    content became empty/whitespace during the build window
//                    (embedFn('') → ollama `{embeddings: []}` →
//                    `ollama embed: malformed response` → TOTAL build failure
//                    → the engine pending forever): the live content is
//                    guarded — removeFromVectorIndex (if present) +
//                    skipped.set(id, 'empty') + counted as a skip (the
//                    build-side UNIT-F-SKIP-EMPTY semantics); the promotion
//                    continues.
//   F-W1-2 (MEDIUM)  nodes ADDED during the build window (after the listNodes
//                    snapshot) must be adopted: the reconcile pass walks the
//                    LIVE node list and every non-empty live node MISSING from
//                    the built index is embedded + addToVectorIndex BEFORE the
//                    swap, counted in the NEW `adopted: number` PromotionReport
//                    field (§5.12 amendment). Empty/whitespace additions follow
//                    the F-W1-1 skip path.
//   F-W1-3 (LOW)     retrieval.setEmbedder must reject a STRUCTURALLY invalid
//                    embedder (`{} as Embedder`) with the PINNED message
//                    'retrieval engine: embedder required' WITHOUT consuming
//                    the one-way latch — a subsequent VALID setEmbedder still
//                    succeeds.
//   F-W1-4 (LOW)     tests/vector-boot.test.ts:933 must NOT carry a property
//                    that is not on the `VectorIndex` interface (TS2353
//                    excess-property drift — pinned via the real TypeScript
//                    compiler; tests/ is outside `npm run typecheck` scope).
//   F-W1-5 (LOW)     warmUpEmbeddingProvider must construct the provider
//                    INSIDE the try: a present-but-invalid config (openai
//                    without apiKey) rejects the PINNED class-2 wrap
//                    'vector boot warm-up: <underlying message>' and logs the
//                    'vector boot: warm-up failed' milestone ONCE (the
//                    construction failure is a warm-up failure too).
//
// Conventions mirror tests/vector-boot.test.ts (vitest node environment, `.js`
// import suffix, temp dirs via node:fs, a full provider DOUBLE for the
// injected-provider controller path — NO live network anywhere).
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import {
  warmUpEmbeddingProvider,
  createVectorBootController,
  type PromotionReport,
} from '../src/main/vector-boot.js'
import type { EmbeddingProvider, EmbeddingProviderConfig } from '../src/main/embeddings.js'
import {
  createRetrieval,
  createLexicalEmbedder,
  createLexicalIndex,
  type Embedder,
} from '../src/main/retrieval.js'
import { createJsonRagStore, type RagNode } from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-vector-boot-adversarial-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** Deterministic bag-of-words → fixed-dimension embedding (the mock's
 *  algorithm shape — same idiom as tests/vector-boot.test.ts). */
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

/** Capture every console line regardless of stream (the spec pins the LOG
 *  MILESTONE strings, not which console method carries them). */
function captureConsole(): { lines: string[] } {
  const lines: string[] = []
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    vi.spyOn(console, m).mockImplementation((...args: unknown[]) => {
      lines.push(args.map((a) => String(a)).join(' '))
    })
  }
  return { lines }
}

// Deterministic updatedAt instants (ISO strings compare monotonically).
const T0 = '2026-09-05T00:00:00.000Z'
const T1 = '2026-09-05T00:00:01.000Z'

type EmbedHook = (text: string) => void | Promise<void>

/** A full `EmbeddingProvider` DOUBLE (the §5.12 seam injects the provider —
 *  no HTTP). Records every embed text and runs a per-test hook INSIDE each
 *  embed call (the deterministic mid-build-edit interleaving point). Mimics
 *  the REAL provider's empty-input contract (§5.3/§5.9 #9): an empty/
 *  whitespace input rejects `ollama embed: malformed response` (ollama
 *  returns `{ embeddings: [] }` for an empty input) — never a silent vector. */
function makeProviderDouble(onEmbed?: EmbedHook): EmbeddingProvider & { embedTexts: string[] } {
  const embedTexts: string[] = []
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: 4,
    embedTexts,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      if (typeof text !== 'string' || text.trim() === '') {
        throw new Error('ollama embed: malformed response')
      }
      await onEmbed?.(text)
      return textEmbedding(text)
    },
  }
}

/** A minimal `Embedder` double whose scoring is observably DIFFERENT from the
 *  lexical embedder (it scores nothing) so the active embedder post-swap is
 *  distinguishable via its queries. */
function makeEmbedderDouble(): Embedder & { scoreQueries: string[] } {
  const scoreQueries: string[] = []
  return {
    scoreQueries,
    async score(query: string) {
      scoreQueries.push(query)
      return []
    },
    async place() {
      return { ok: false as const, reason: 'no-match' as const }
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Unit F / W1 — RCA-3 adversarial pass (docs/specs/unit-f-embeddings.md §3a F-W1-1..F-W1-5 + §5.12)', () => {
  // =========================================================================
  // F-W1-1 (HIGH) — reconcile: content became EMPTY during the build window
  // =========================================================================

  it('A-F-W1-1 (HIGH) the reconcile pass does NOT re-embed a node whose content became empty during the build window — it removes the vector, records skipped(id) = \'empty\', counts the skip, and the promotion continues (no total build failure)', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world', updatedAt: T0 }))
      // the mid-build edit: during the node's OWN build embed call (after the
      // embedAt snapshot T0 was recorded, before the reconcile re-check) the
      // node's content becomes EMPTY with a bumped updatedAt — the reconcile
      // will see updatedAt > embedAt with empty live content
      const provider = makeProviderDouble(async (text) => {
        if (text === 'hello world') {
          await store.putNode(makeNode('n1', { content: '', updatedAt: T1 }))
        }
      })
      const boot = createVectorBootController(store, provider)
      // THE REGRESSION: today the reconcile calls updateVectorIndex →
      // embedFn('') → `ollama embed: malformed response` → a TOTAL build
      // failure — start() rejects and the engine stays pending FOREVER
      // (single-shot start, no retry). The fix: the empty-content node is a
      // SKIP (build-side UNIT-F-SKIP-EMPTY semantics) and the promotion
      // continues.
      const report: PromotionReport = await boot.start()
      // the empty content NEVER reached the provider
      expect(provider.embedTexts).toEqual(['hello world'])
      // recorded as an 'empty' skip, NOT a re-embed
      expect(boot.skipped().get('n1')).toBe('empty')
      expect(report.reEmbedded).toBe(0)
      expect(report.skipped).toEqual({ empty: 1, transient: 0 })
      expect(report.embedded).toBe(1) // the build DID embed the pre-edit content
      // the promotion CONTINUED — never a total build failure / pending forever
      expect(boot.phase()).toBe('promoted')
      // post-promotion: n1 has NO vector (removed with the skip) — a query that
      // lexically matches its content is served by the vector embedder and n1
      // scores 0 → filtered from ranked (§5.8 #34)
      const result = await boot.engine.query('hello')
      expect(result.ranked.map((r) => r.nodeId)).not.toContain('n1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F-W1-2 (MEDIUM) — reconcile adoption: nodes ADDED during the build window
  // =========================================================================

  it('A-F-W1-2 (MEDIUM) the reconcile pass ADOPTS nodes added during the build window — every non-empty live node missing from the built index is embedded + indexed BEFORE the swap (report.adopted); a whitespace addition follows the \'empty\' skip path', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a', { content: 'alpha content', updatedAt: T0 }))
      // mid-build additions (after the listNodes snapshot): one non-empty node
      // 'b' and one whitespace node 'c' — 'c' must follow the F-W1-1 skip path
      const provider = makeProviderDouble(async (text) => {
        if (text === 'alpha content') {
          await store.putNode(makeNode('b', { content: 'beta content', updatedAt: T1 }))
          await store.putNode(makeNode('c', { content: '   ', updatedAt: T1 }))
        }
      })
      const boot = createVectorBootController(store, provider)
      const report: PromotionReport = await boot.start()
      // 'b' was adopted: embedded with its LIVE content before the swap;
      // the whitespace 'c' was never embedded (the 'empty' skip path)
      expect(provider.embedTexts).toEqual(['alpha content', 'beta content'])
      // the NEW PromotionReport census field (§5.12 amendment) counts the adoption
      expect(report.adopted).toBe(1)
      expect(report.embedded).toBe(1) // the build-side embed ('a') only
      expect(report.reEmbedded).toBe(0)
      // 'c' is a skip, not an adoption
      expect(boot.skipped().get('c')).toBe('empty')
      expect(boot.skipped().has('b')).toBe(false)
      expect(report.skipped).toEqual({ empty: 1, transient: 0 })
      expect(boot.phase()).toBe('promoted')
      // post-promotion 'b' is VISIBLE (in the index, scored > 0) — the
      // regression: today it is invisible post-promotion (score 0, filtered
      // from ranked at retrieval.ts:558)
      const result = await boot.engine.query('beta')
      expect(result.ranked[0]?.nodeId).toBe('b')
      expect(result.ranked[0]?.score).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F-W1-3 (LOW) — setEmbedder structural guard (no latch consumption)
  // =========================================================================

  it('A-F-W1-3 (LOW) setEmbedder({} as Embedder) throws the PINNED \'retrieval engine: embedder required\' WITHOUT consuming the one-way latch — a subsequent VALID setEmbedder still succeeds and serves', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
      // a structurally invalid embedder (no score/place functions) must be
      // rejected with the PINNED message — today it LATCHES the one-way
      // promotion silently and the first query throws TypeError
      expect(() => engine.setEmbedder({} as unknown as Embedder)).toThrow('retrieval engine: embedder required')
      // the failed call consumed NOTHING: a valid promotion still succeeds
      const valid = makeEmbedderDouble()
      expect(() => engine.setEmbedder(valid)).not.toThrow()
      // ...and the VALID embedder is the active one (the impostor never latched)
      const result = await engine.query('hello')
      expect(result.ranked).toHaveLength(0) // the double scores nothing
      expect(valid.scoreQueries).toContain('hello')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F-W1-4 (LOW) — the prebuilt VectorIndex literal's type drift (TS2353)
  // =========================================================================

  it('A-F-W1-4 (LOW) the prebuilt `VectorIndex` literal in tests/vector-boot.test.ts carries NO property that is not on the VectorIndex interface (real TypeScript excess-property check — TS2353)', () => {
    const embeddingsSrc = readFileSync(fileURLToPath(new URL('../src/main/embeddings.ts', import.meta.url)), 'utf8')
    const testSrc = readFileSync(fileURLToPath(new URL('./vector-boot.test.ts', import.meta.url)), 'utf8')
    // the REAL interface text (single source of truth — never duplicated here)
    const ifaceMatch = embeddingsSrc.match(/export interface VectorIndex \{[\s\S]*?\n\}/)
    expect(ifaceMatch).not.toBeNull()
    // the literal under test
    const marker = 'const prebuilt: VectorIndex = {'
    const literalStart = testSrc.indexOf(marker)
    expect(literalStart, 'the prebuilt VectorIndex literal was not found in tests/vector-boot.test.ts').toBeGreaterThan(-1)
    const openBrace = testSrc.indexOf('{', literalStart)
    let depth = 0
    let end = -1
    for (let i = openBrace; i < testSrc.length; i++) {
      if (testSrc[i] === '{') depth++
      else if (testSrc[i] === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    expect(end).toBeGreaterThan(-1)
    const literalText = testSrc.slice(literalStart, end + 1)
    // compile the interface + the literal TOGETHER in one virtual file and ask
    // the real compiler for the excess-property diagnostics
    const virtual = `${ifaceMatch![0]}\n${literalText}\n`
    const vdir = freshDir()
    try {
      const file = join(vdir, 'literal-check.ts')
      writeFileSync(file, virtual, 'utf8')
      const options: ts.CompilerOptions = { strict: true, target: ts.ScriptTarget.ES2022, noEmit: true }
      const program = ts.createProgram([file], options)
      const sf = program.getSourceFile(file)
      expect(sf).toBeDefined()
      const diagnostics = program.getSemanticDiagnostics(sf!)
      const excess = diagnostics
        .filter((d) => d.code === 2353)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
      // RED until the excess `skipped` property is removed from that literal
      expect(excess, `F-W1-4: excess property on the VectorIndex literal (tests are outside npm run typecheck scope, so this pins the drift here): ${excess.join('; ')}`).toEqual([])
    } finally {
      rmSyncSafe(vdir)
    }
  })

  // =========================================================================
  // F-W1-5 (LOW) — warm-up: provider CONSTRUCTION failure is wrapped + logged
  // =========================================================================

  it('A-F-W1-5 (LOW) a present-but-invalid provider config (openai without apiKey) rejects the PINNED class-2 wrap \'vector boot warm-up: <underlying message>\' and logs the \'vector boot: warm-up failed\' milestone ONCE', async () => {
    // construction throws OUTSIDE any embed: createRemoteEmbedProvider rejects
    // 'createRemoteEmbedProvider: apiKey required' — today that propagates
    // UNWRAPPED (the construction sits outside the try)
    const badConfig: EmbeddingProviderConfig = {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      model: 'text-embedding-3-small',
      // NO apiKey — a present-but-invalid config
    }
    const captured = captureConsole()
    await expect(warmUpEmbeddingProvider(badConfig)).rejects.toThrow(
      'vector boot warm-up: createRemoteEmbedProvider: apiKey required',
    )
    // the pinned milestone fired ONCE for the construction failure too
    const warmupFailures = captured.lines.filter((l) => l.includes('vector boot: warm-up failed'))
    expect(warmupFailures, `expected exactly one warm-up-failed milestone, got: ${JSON.stringify(warmupFailures)}`).toHaveLength(1)
    expect(warmupFailures[0]).toContain('createRemoteEmbedProvider: apiKey required')
  })
})