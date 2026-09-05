// tests/vector-boot.test.ts — Unit F / W1: the vector-boot controller
// (docs/specs/unit-f-embeddings.md §5.12 — BOOT MODEL B, §5.8 #27–33, §5.9
// #37/#42/#43/#44, §5.5 prebuilt-index adoption).
//
// Mirrors tests/embeddings.test.ts conventions (vitest node environment,
// `.js` import suffix for the main-process ESM modules, temp dirs via
// node:fs, a stubbed global `fetch` for the REAL provider HTTP path and a
// full provider DOUBLE for the injected-provider controller path — NO live
// network anywhere).
//
// The module under test is `src/main/vector-boot.ts` (the W1 module seam:
// pure + injectable, NO Electron) — it DOES NOT EXIST yet, so this whole
// file is RED (the static import fails to resolve). Additionally, once the
// module lands, the `RetrievalEngine.setEmbedder` promotion seam
// (§5.12 — the NEW third engine member) and the `createVectorEmbedder`
// `opts.index` adoption (§5.5 W1 amendment) are expected to surface their
// own assertion failures until implemented.
//
// STATE ENUMERATION (derived from the spec text ALONE):
//   §5.8 happy states under test here:
//     #27  warm-up gate happy — ONE REAL POST /api/embed single-text probe
//          (VECTOR_BOOT_WARMUP_TEXT), NOT isOllamaAvailable (/api/tags);
//          resolves with the warmed provider.
//     #28  born-lexical pending — the ONE shared RetrievalEngine is created
//          with the LEXICAL embedder (pending phase) synchronously at
//          controller construction; queries are served while the vector
//          index builds in the background.
//     #29  pending query equivalence — rag.query (MCP) and rag-query (IPC)
//          both return the SAME RetrievalResult shape, served LEXICALLY by
//          the shared engine (the DESIGNED born-lexical state, logged as
//          pending — NOT a silent lexical fallback).
//     #30  background build — the controller builds the vector index from
//          the store's NON-EMPTY nodes after boot, sequential per-item in
//          W1; the engine stays pending until promotion.
//     #31  reconcile + tie rule — a node whose updatedAt strictly postdates
//          its build-time embed snapshot (embedAt) is re-embedded BEFORE the
//          swap; `updatedAt === embedAt` (tie) → UNCHANGED (no re-embed).
//          embedAt = the node's updatedAt AS READ at the moment the build
//          embedded it (snapshot recorded WITH the embed — no injectable
//          clock; constructed deterministically here by bumping the node
//          DURING its own build embed call).
//     #32  atomic one-way promotion — setEmbedder swaps the embedder inside
//          the SAME engine instance; an in-flight pre-swap query completes
//          coherently on the OLD (lexical) embedder with the same
//          RetrievalResult shape; post-swap queries are scored by the vector
//          embedder; onStoreChanged attaches with the swap.
//     #33  promotion is one-way — a second setEmbedder throws (§5.9 #42).
//   §5.9 fail-states under test here:
//     #37  warm-up total failure → rejects
//          `vector boot warm-up: <underlying provider error message>` (the
//          ONLY abort point after config; the main()-side abort/app.exit
//          wiring is outside this module seam — see QUESTION block below).
//     #38  config-missing abort — QUESTION (not derivable at this seam; see
//          the QUESTION block below — no test written, nothing invented).
//     #42  double promotion → `retrieval engine: embedder promotion is
//          one-way (already promoted)`.
//     #43  setEmbedder null/undefined → `retrieval engine: embedder required`.
//     #44  warm-up ≠ availability probe — a server whose /api/tags responds
//          but whose /api/embed fails FAILS the warm-up (never false-ready).
//   §5.12 promotion pins (pin-by-test): (a) in-flight pre-promotion query
//     completes on the OLD embedder; (b) post-promotion query uses the new
//     embedder; (c) the onStoreChanged hook attaches with the swap; (d) the
//     reconcile tie rule; (e) the reconcile-to-swap gap (a pre-swap edit
//     landing after the re-check leaves the node on its pre-edit embedding
//     until its NEXT touch via the attached hook).
//   §5.12 PromotionReport W1 pins: cacheHits 0 (W4), skipped =
//     { empty: <build's empty-content skip count>, transient: 0 (W3) }.
//   §5.5 W1 amendment: `VectorEmbedderOptions.index?` — when supplied the
//     embedder ADOPTS it (NO build embeds inside createVectorEmbedder);
//     omitted → build from the store's nodes as today.
//   OUT OF SCOPE (owned by later units per the §5.12 decomposition table —
//     not tested here): W2 batch seam (`opts.embedBatchFn`, §5.9 #39–41),
//     W3 failure policy (transient skips, §5.9 #45–48), W4 persisted cache
//     (`opts.cache`, §5.9 #49–51).
//
// QUESTION (spec-untestable-as-written at this seam — reported to the
// supervisor, NOT invented): §5.9 #38 — the config-missing abort throws
// `Error('retrieval.embedder: vector requires retrieval.embeddingProvider
// config')` at `src/main/main.ts:147-149` (§5.12 failure class 1,
// "UNCHANGED", and the main() wiring step (1) "the config check at
// main.ts:147-149 UNCHANGED"). That throw site is main.ts, which §5.12's
// module-seam note explicitly puts OUTSIDE the node-testable seam ("this
// repo tests shared modules, not main.ts"), and NO function of the
// `vector-boot.ts` seam (`warmUpEmbeddingProvider` /
// `createVectorBootController`) is specified to produce that message
// (the controller receives an already-warmed PROVIDER, not the app config;
// the warm-up's only specified rejection is the failure-class-2 wrapper).
// Same seam limitation applies to the #37 sub-clause "main() throws → the
// fatal handler app.exit(1)" — the rejection itself IS tested below; the
// main()-side abort is main-wiring. Relatedly, #28's "window + MCP server
// start" and the §5.12 main() wiring order are main.ts-owned; the seam
// observables tested here are the live engine + pending-phase serving.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  warmUpEmbeddingProvider,
  createVectorBootController,
  VECTOR_BOOT_WARMUP_TEXT,
  type VectorBootPhase,
  type PromotionReport,
} from '../src/main/vector-boot.js'
import {
  createVectorEmbedder,
  type EmbeddingProvider,
  type EmbeddingProviderConfig,
  type VectorIndex,
} from '../src/main/embeddings.js'
import { type Embedder } from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { handleRagTool, handleRagQueryIpc } from '../src/main/mcp-server.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-vector-boot-'))
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

/** A deterministic bag-of-words → fixed-dimension embedding (the mock's
 *  algorithm shape — same idiom as tests/embeddings.test.ts). */
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

function parseBody(init: RequestInit): any {
  const b = init.body
  if (typeof b === 'string') return JSON.parse(b)
  return b
}

/** Stub the global `fetch` with a responder; records URL/init/parsed body. */
function stubFetch(
  responder: (url: string, init: RequestInit) => { ok: boolean; status: number; json: () => Promise<unknown> },
): Array<{ url: string; init: RequestInit; body: any }> {
  const calls: Array<{ url: string; init: RequestInit; body: any }> = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const body = parseBody(init)
    calls.push({ url, init, body })
    return responder(url, init)
  }))
  return calls

}

/** Stub the ollama embed endpoint with deterministic text-derived vectors. */
function stubOllamaEmbedFetch(): Array<{ url: string; init: RequestInit; body: any }> {
  return stubFetch((_url, init) => {
    const body = parseBody(init)
    return { ok: true, status: 200, json: async () => ({ embeddings: [textEmbedding(body.input)] }) }
  })
}

function headerValue(init: RequestInit, name: string): string | undefined {
  const h = init.headers as Record<string, string> | Headers | undefined
  if (!h) return undefined
  if (typeof (h as Headers).get === 'function') return (h as Headers).get(name) ?? undefined
  return (h as Record<string, string>)[name]
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

const OLLAMA_CONFIG: EmbeddingProviderConfig = {
  provider: 'ollama',
  baseUrl: 'http://127.0.0.1:11434',
  model: 'embeddinggemma',
}

// Deterministic updatedAt instants for the reconcile (embedAt) tests —
// ISO strings compare monotonically. T0 = build time; T1/T2 = later edits.
const T0 = '2026-09-05T00:00:00.000Z'
const T1 = '2026-09-05T00:00:01.000Z'
const T2 = '2026-09-05T00:00:02.000Z'

type EmbedHook = (text: string, callIndexForText: number) => void | Promise<void>

/** A full `EmbeddingProvider` DOUBLE (the §5.12 seam injects the provider —
 *  no HTTP). Records every embed text, tracks concurrency (the W1 build is
 *  SEQUENTIAL per-item) and runs a per-test hook INSIDE each embed call —
 *  the deterministic interleaving point for the embedAt snapshot tests. */
function makeProviderDouble(onEmbed?: EmbedHook): EmbeddingProvider & {
  embedTexts: string[]
  concurrency(): number
} {
  const embedTexts: string[] = []
  const seen = new Map<string, number>()
  let inFlight = 0
  let maxConcurrent = 0
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: 4,
    embedTexts,
    concurrency: () => maxConcurrent,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      inFlight++
      maxConcurrent = Math.max(maxConcurrent, inFlight)
      try {
        const n = (seen.get(text) ?? 0) + 1
        seen.set(text, n)
        await onEmbed?.(text, n)
        return textEmbedding(text)
      } finally {
        inFlight--
      }
    },
  }
}

/** A minimal `Embedder` double for the setEmbedder promotion seam — its
 *  scoring is observably DIFFERENT from the lexical embedder (it scores
 *  nothing) so a post-swap query is distinguishable from a pre-swap one. */
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

/** The store double: the REAL JSON store (full RagStore surface — the
 *  controller creates the engine INTERNALLY, and the engine/MCP handlers
 *  exercise the whole interface) with read counters, per §5.12's "a red
 *  test constructs it deterministically with a store double". The embedAt
 *  determinism comes from bumping a node DURING its own embed call (see the
 *  reconcile tests) — no injectable clock, exactly as the spec prescribes. */
function makeStoreDouble(dir: string): { store: RagStore; counts: { listNodes: number; getNode: number } } {
  const real = createJsonRagStore({ path: join(dir, 'rag.json') })
  const counts = { listNodes: 0, getNode: 0 }
  const store: RagStore = {
    getNode: (id) => {
      counts.getNode++
      return real.getNode(id)
    },
    listNodes: () => {
      counts.listNodes++
      return real.listNodes()
    },
    putNode: (node) => real.putNode(node),
    removeNode: (id) => real.removeNode(id),
    getEdge: (id) => real.getEdge(id),
    listEdges: () => real.listEdges(),
    putEdge: (edge) => real.putEdge(edge),
    removeEdge: (id) => real.removeEdge(id),
    status: () => real.status(),
    journal: () => real.journal(),
    undo: () => real.undo(),
    redo: () => real.redo(),
    undoDepth: () => real.undoDepth(),
    redoDepth: () => real.redoDepth(),
    enqueue: (fn) => real.enqueue(fn),
  }
  return { store, counts }
}

/** A test-controlled pause for the background build. */
function gated(): { gate: Promise<void>; release: () => void } {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  return { gate, release }
}

/** W3 RE-PIN helper (2026-09-05): arms a NON-embed total-build-failure trigger
 *  — the store's listNodes throws ONCE (the build's snapshot call), then
 *  passes through. Under the W3 embed-failure flip a per-node embed rejection
 *  is a 'transient' skip (the build RESOLVES), so the "total build failure →
 *  stays pending" pins are reshaped onto a store failure. One-shot: the
 *  post-failure lexical-serving assertions (and the single-shot second
 *  start(), which rejects before touching the store) see a working store.
 *  Arming AFTER controller creation keeps the born-lexical engine's own
 *  construction-time listNodes call working. */
function armListNodesFailure(store: RagStore): void {
  const real = store.listNodes.bind(store)
  let armed = true
  store.listNodes = () => {
    if (armed) {
      armed = false
      throw new Error('store exploded')
    }
    return real()
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Unit F / W1 — vector-boot controller (unit-f-embeddings.md §5.12 + §5.8 #27–33 + §5.9 #37/#42/#43/#44 + §5.5 index adoption)', () => {
  it('RED — the vector-boot module is not exported yet (src/main/vector-boot.ts does not exist)', () => {
    expect(typeof warmUpEmbeddingProvider).toBe('function')
    expect(typeof createVectorBootController).toBe('function')
  })

  // =========================================================================
  // §5.12 + §5.8 #27 + §5.9 #37/#44 — THE WARM-UP GATE (failure class 2)
  // =========================================================================

  describe('§5.12 warmUpEmbeddingProvider (§5.8 #27 happy; §5.9 #37/#44 fail-states)', () => {
    it('#27a VECTOR_BOOT_WARMUP_TEXT is the pinned warm-up probe text "provident warm-up"', () => {
      expect(VECTOR_BOOT_WARMUP_TEXT).toBe('provident warm-up')
    })

    it('#27b warm-up happy: ONE REAL POST /api/embed of the warm-up text — NOT an /api/tags probe', async () => {
      const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
      await warmUpEmbeddingProvider(OLLAMA_CONFIG)
      // exactly ONE real embed call — a single-text probe through the
      // configured provider (not isOllamaAvailable, which probes GET /api/tags
      // and does NOT load the model)
      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('http://127.0.0.1:11434/api/embed')
      expect(calls[0].init.method).toBe('POST')
      expect(calls[0].body).toEqual({ model: 'embeddinggemma', input: 'provident warm-up' })
      // no availability probe, no credentials (LOCAL-SECURITY-POSTURE)
      expect(calls.some((c) => c.url.includes('/api/tags'))).toBe(false)
      expect(headerValue(calls[0].init, 'Authorization')).toBeUndefined()
    })

    it('#27c warm-up happy: resolves with the warmed provider (an EmbeddingProvider that embeds)', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
      const provider = await warmUpEmbeddingProvider(OLLAMA_CONFIG)
      expect(provider.kind).toBe('ollama')
      expect(provider.model).toBe('embeddinggemma')
      expect(provider.baseUrl).toBe('http://127.0.0.1:11434')
      expect(typeof provider.embed).toBe('function')
      expect(typeof provider.dimension).toBe('number')
      await expect(provider.embed('check')).resolves.toEqual([0.1, 0.2, 0.3, 0.4])
    })

    it('#37a warm-up total failure (timeout) rejects "vector boot warm-up: ollama embed: timeout after <ms>ms"', async () => {
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
      const provider = warmUpEmbeddingProvider({ ...OLLAMA_CONFIG, timeoutMs: 20 })
      await expect(provider).rejects.toThrow('vector boot warm-up: ollama embed: timeout after 20ms')
    })

    it('#37b warm-up total failure (non-2xx) rejects "vector boot warm-up: ollama embed: HTTP <status>"', async () => {
      stubFetch(() => ({ ok: false, status: 500, json: async () => ({}) }))
      await expect(warmUpEmbeddingProvider(OLLAMA_CONFIG)).rejects.toThrow('vector boot warm-up: ollama embed: HTTP 500')
    })

    it('#37c warm-up total failure (connection refused) rejects "vector boot warm-up: ollama embed: <message>"', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('fetch failed') }))
      await expect(warmUpEmbeddingProvider(OLLAMA_CONFIG)).rejects.toThrow('vector boot warm-up: ollama embed: fetch failed')
    })

    it('#37d warm-up total failure (malformed response) rejects "vector boot warm-up: ollama embed: malformed response"', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({}) }))
      await expect(warmUpEmbeddingProvider(OLLAMA_CONFIG)).rejects.toThrow('vector boot warm-up: ollama embed: malformed response')
    })

    it('#44 warm-up ≠ availability probe: /api/tags up + /api/embed down FAILS the warm-up (never a false-ready boot)', async () => {
      const calls = stubFetch((url) =>
        url.includes('/api/tags')
          ? { ok: true, status: 200, json: async () => ({ models: [{ name: 'embeddinggemma' }] }) }
          : { ok: false, status: 500, json: async () => ({}) },
      )
      // a tags-responding server must NOT false-ready the boot: the embed probe
      // fails → the warm-up rejects
      await expect(warmUpEmbeddingProvider(OLLAMA_CONFIG)).rejects.toThrow('vector boot warm-up: ollama embed: HTTP 500')
      // ...and the warm-up never even asked /api/tags
      expect(calls.some((c) => c.url.includes('/api/tags'))).toBe(false)
    })
  })

  // =========================================================================
  // §5.8 #28/#29 — BORN-LEXICAL PENDING (the controller owns engine creation)
  // =========================================================================

  describe('§5.8 #28/#29 born-lexical pending (createVectorBootController)', () => {
    it('#28a the controller is created SYNCHRONOUSLY with the ONE live shared engine (R7: a live engine from construction)', () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        expect(typeof boot.engine.query).toBe('function')
        expect(typeof boot.engine.onStoreChanged).toBe('function')
        expect(typeof boot.engine.setEmbedder).toBe('function') // the W1 third engine member
        expect(boot.phase()).toBe('pending')
        expect(boot.skipped()).toBeInstanceOf(Map)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#28b pending query is served LEXICALLY with ZERO provider calls while the background build runs; "vector boot: pending (born-lexical)" logged', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const { gate, release } = gated()
        // hold the FIRST build embed → the build is in flight while we query
        const provider = makeProviderDouble((_text, n) => (n === 1 ? gate : undefined))
        const captured = captureConsole()
        const boot = createVectorBootController(store, provider)
        const build = boot.start()
        await vi.waitFor(() => expect(provider.embedTexts).toEqual(['hello world']))
        // the born-lexical state is LOGGED as pending — explicitly NOT a
        // silent lexical fallback
        expect(captured.lines.some((l) => l.includes('vector boot: pending (born-lexical)'))).toBe(true)
        // window + MCP start immediately: a query NOW is served lexically by
        // the shared engine while the vector index builds in the background
        const pending = await boot.engine.query('hello')
        expect(pending.ranked[0].nodeId).toBe('n1')
        // the provider was NEVER asked to embed the query (lexical serving)
        expect(provider.embedTexts).toEqual(['hello world'])
        release()
        await build
        expect(boot.phase()).toBe('promoted')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#29 pending MCP/IPC equivalence: rag.query and rag-query IPC return the SAME RetrievalResult shape from the shared engine', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        // pending phase — no start() yet
        const mcp = await handleRagTool(store, 'rag.query', { query: 'hello', topK: 2 }, boot.engine)
        const ipc = await handleRagQueryIpc(boot.engine, store, { query: 'hello', topK: 2 })
        expect(ipc).toEqual(mcp)
        for (const key of ['ranked', 'context', 'markdown', 'lineMap']) {
          expect(mcp).toHaveProperty(key)
        }
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#27/#28 chain: the warmed provider resolves from the warm-up and the SAME provider instance serves the background build (and ONLY it — no re-embed at promotion)', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const calls = stubOllamaEmbedFetch()
        const provider = await warmUpEmbeddingProvider(OLLAMA_CONFIG) // the main() wiring shape: warm-up → controller
        const boot = createVectorBootController(store, provider)
        const report = await boot.start()
        expect(boot.phase()).toBe('promoted')
        expect(report.embedded).toBe(1)
        // exactly TWO HTTP embeds total: the warm-up probe + ONE build embed
        // through the SAME provider (a third call would mean the promotion
        // re-embedded the store instead of adopting the background-built index)
        expect(calls).toHaveLength(2)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.8 #30 — BACKGROUND BUILD
  // =========================================================================

  describe('§5.8 #30 background build', () => {
    it('#30 builds the index from the store\'s NON-EMPTY nodes SEQUENTIALLY (W1), records the empty skips live, engine pending until promotion', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'alpha content' }))
        await store.putNode(makeNode('n2', { content: '' })) // never embedded
        await store.putNode(makeNode('n3', { content: 'beta content' }))
        await store.putNode(makeNode('n4', { content: '   ' })) // whitespace = empty
        await store.putNode(makeNode('n5', { content: 'gamma content' }))
        const holder: { boot?: { phase(): VectorBootPhase }; phasesDuringEmbed: VectorBootPhase[] } = {
          phasesDuringEmbed: [],
        }
        const provider = makeProviderDouble(() => {
          if (holder.boot) holder.phasesDuringEmbed.push(holder.boot.phase())
        })
        const boot = createVectorBootController(store, provider)
        holder.boot = boot
        const report = await boot.start()
        // sequential per-item in W1: each non-empty content embedded exactly once
        expect([...provider.embedTexts].sort()).toEqual(['alpha content', 'beta content', 'gamma content'])
        expect(provider.concurrency()).toBe(1)
        // empty/whitespace nodes make NO embed call and are recorded 'empty'
        expect(boot.skipped() instanceof Map).toBe(true)
        expect([...boot.skipped().keys()].sort()).toEqual(['n2', 'n4'])
        expect(boot.skipped().get('n2')).toBe('empty')
        expect(boot.skipped().get('n4')).toBe('empty')
        // the engine stays pending THROUGHOUT the build, promoted only at the swap
        expect(holder.phasesDuringEmbed.length).toBe(3)
        for (const p of holder.phasesDuringEmbed) expect(p).toBe('pending')
        expect(boot.phase()).toBe('promoted')
        expect(report.embedded).toBe(3)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#30-log the pinned log milestones: pending → build complete (embedded N, cacheHits M, re-embedded R, skipped empty e / transient t) → promoted', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'alpha content' }))
        await store.putNode(makeNode('n2', { content: '' }))
        await store.putNode(makeNode('n3', { content: 'beta content' }))
        await store.putNode(makeNode('n4', { content: '   ' }))
        const provider = makeProviderDouble()
        const captured = captureConsole()
        const boot = createVectorBootController(store, provider)
        await boot.start()
        expect(captured.lines.some((l) => l.includes('vector boot: pending (born-lexical)'))).toBe(true)
        expect(captured.lines.some((l) =>
          l.includes('vector boot: build complete (embedded 2, cacheHits 0, re-embedded 0, skipped empty 2 / transient 0)'),
        )).toBe(true)
        expect(captured.lines.some((l) => l.includes('vector boot: promoted'))).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.8 #31 + §5.12 embedAt + pin (d) — RECONCILE + TIE RULE
  // =========================================================================

  describe('§5.8 #31 reconcile + tie rule (embedAt; pin d)', () => {
    it('#31a TIE: updatedAt === embedAt (build at T, keep T) → UNCHANGED, no re-embed, reEmbedded 0', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'tie content', updatedAt: T0 }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        const report = await boot.start()
        // the node's updatedAt still equals the snapshot recorded with its
        // build embed → the tie rule says UNCHANGED
        expect(provider.embedTexts).toEqual(['tie content'])
        expect(report.reEmbedded).toBe(0)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#31b CHANGED: updatedAt bumped to T+1 after the build embed → re-embedded with the NEW content BEFORE the swap (reEmbedded 1)', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'before edit', updatedAt: T0 }))
        const holder: { boot?: { phase(): VectorBootPhase }; phaseAtReconcileEmbed?: VectorBootPhase } = {}
        // embedAt construction (spec-prescribed, no injectable clock): the node
        // is bumped DURING its own build embed call, i.e. AFTER the build
        // recorded the snapshot (embedAt = T0) and BEFORE the reconcile re-check
        const provider = makeProviderDouble(async (text) => {
          if (text === 'before edit') {
            await store.putNode(makeNode('n1', { content: 'after edit', updatedAt: T1 }))
          } else if (text === 'after edit') {
            if (holder.boot) holder.phaseAtReconcileEmbed = holder.boot.phase()
          }
        })
        const boot = createVectorBootController(store, provider)
        holder.boot = boot
        const report = await boot.start()
        // build embed (snapshot content) + ONE reconcile re-embed of the LIVE
        // (edited) content — re-embedding the stale snapshot content instead
        // would defeat the reconcile
        expect(provider.embedTexts).toEqual(['before edit', 'after edit'])
        expect(report.reEmbedded).toBe(1)
        // ...and the re-embed happened BEFORE the swap (still pending)
        expect(holder.phaseAtReconcileEmbed).toBe('pending')
        expect(boot.phase()).toBe('promoted')
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.8 #32 — ATOMIC ONE-WAY PROMOTION (pins a/b/c)
  // =========================================================================

  describe('§5.8 #32 atomic one-way promotion (pins a/b/c)', () => {
    it('#32 pin (a): an in-flight pre-promotion query completes on the OLD (lexical) embedder with the same RetrievalResult shape', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        const pre = await boot.engine.query('hello')
        expect(pre.ranked.map((r) => r.nodeId)).toContain('n1')
        // swap in an embedder that scores NOTHING while a query is in flight —
        // the in-flight query must observe exactly ONE embedder (the OLD one)
        const intruder = makeEmbedderDouble()
        const inflight = boot.engine.query('hello')
        boot.engine.setEmbedder(intruder)
        const during = await inflight
        expect(during).toEqual(pre) // completed coherently on the OLD embedder
        // post-swap queries observe exactly the NEW embedder (pin b, seam-level)
        const post = await boot.engine.query('hello')
        expect(post.ranked).toHaveLength(0)
        expect(intruder.scoreQueries).toContain('hello')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#32 pin (b): a post-promotion query is scored by the vector embedder (the query embedding goes through the provider; ranked per the built index)', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        await boot.start()
        expect(boot.phase()).toBe('promoted')
        const embedsBeforeQuery = provider.embedTexts.length
        const result = await boot.engine.query('hello')
        // the query embedding went through the provider (vector scoring) —
        // the contrast with #28b (zero provider calls while pending)
        expect(provider.embedTexts.length).toBe(embedsBeforeQuery + 1)
        expect(provider.embedTexts[provider.embedTexts.length - 1]).toBe('hello')
        expect(result.ranked[0].nodeId).toBe('n1')
        expect(result.ranked[0].score).toBeGreaterThan(0)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#32 pin (c): the onStoreChanged hook attaches WITH the swap — pre-swap edits make NO provider call; post-swap edits flow to the vector hook', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        // pending phase: the lexical embedder has no vector hook — no embeds
        await store.putNode(makeNode('n1', { content: 'edited pending' }))
        await boot.engine.onStoreChanged('content', ['n1'], [])
        expect(provider.embedTexts).toEqual([])
        // post-swap: the hook forward reaches the vector embedder
        await boot.start()
        await store.putNode(makeNode('n1', { content: 'edited promoted' }))
        await boot.engine.onStoreChanged('content', ['n1'], [])
        expect(provider.embedTexts).toContain('edited promoted')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#32 §8.2 equivalence at EVERY instant: post-promotion rag.query and rag-query IPC agree on the SAME shared engine', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        await boot.start()
        const mcp = await handleRagTool(store, 'rag.query', { query: 'hello', topK: 2 }, boot.engine)
        const ipc = await handleRagQueryIpc(boot.engine, store, { query: 'hello', topK: 2 })
        expect(ipc).toEqual(mcp)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.8 #33 + §5.9 #42/#43 — ONE-WAY FAIL-STATES
  // =========================================================================

  describe('§5.8 #33 + §5.9 #42/#43 one-way promotion fail-states', () => {
    it('#42a a SECOND setEmbedder on the same engine throws "retrieval engine: embedder promotion is one-way (already promoted)"', () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        boot.engine.setEmbedder(makeEmbedderDouble()) // first promotion: fine
        expect(() => boot.engine.setEmbedder(makeEmbedderDouble())).toThrow(
          'retrieval engine: embedder promotion is one-way (already promoted)',
        )
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#42b after the controller\'s own promotion swap, any further setEmbedder still throws the one-way error (#33: the engine never serves lexical again)', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        await boot.start() // the controller promoted the vector embedder internally
        expect(boot.phase()).toBe('promoted')
        expect(() => boot.engine.setEmbedder(makeEmbedderDouble())).toThrow(
          'retrieval engine: embedder promotion is one-way (already promoted)',
        )
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('#43 setEmbedder(null/undefined) throws "retrieval engine: embedder required" and does NOT consume the one-way promotion', () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        expect(() => boot.engine.setEmbedder(null as never)).toThrow('retrieval engine: embedder required')
        expect(() => boot.engine.setEmbedder(undefined as never)).toThrow('retrieval engine: embedder required')
        // the failed calls assigned nothing — a valid promotion is still possible
        expect(() => boot.engine.setEmbedder(makeEmbedderDouble())).not.toThrow()
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.12 — SINGLE-SHOT start()
  // =========================================================================

  describe('§5.12 single-shot start()', () => {
    it('a second start() WHILE the build is running rejects "vector boot: start already called"; the original promise settles authoritatively', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'node one' }))
        await store.putNode(makeNode('n2', { content: 'node two' }))
        const { gate, release } = gated()
        const provider = makeProviderDouble((_text, n) => (n === 1 ? gate : undefined))
        const boot = createVectorBootController(store, provider)
        const first = boot.start()
        await vi.waitFor(() => expect(provider.embedTexts.length).toBe(1))
        await expect(boot.start()).rejects.toThrow('vector boot: start already called')
        release()
        const report = await first // the ORIGINAL promise's settlement is authoritative
        expect(report.embedded).toBe(2)
        expect(boot.phase()).toBe('promoted')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('a second start() AFTER the first resolved rejects "vector boot: start already called"', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        const report = await boot.start()
        await expect(boot.start()).rejects.toThrow('vector boot: start already called')
        expect(report.embedded).toBe(1)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('a second start() AFTER the first REJECTED rejects "vector boot: start already called" (not the build error)', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        // W3 RE-PIN (2026-09-05): the total-failure trigger is reshaped to a
        // NON-embed path (the store's listNodes throws) — under the W3
        // embed-failure flip (§5.9 #46) a per-node embed rejection is a
        // 'transient' skip and the build RESOLVES, so an embed-rejection
        // trigger no longer fails the build. The single-shot pin is unchanged.
        armListNodesFailure(store)
        await expect(boot.start()).rejects.toThrow('store exploded')
        await expect(boot.start()).rejects.toThrow('vector boot: start already called')
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.12 — TOTAL BUILD FAILURE (F1 discipline) + the failure log milestone
  // =========================================================================

  describe('§5.12 total build failure (the engine STAYS pending)', () => {
    it('a total build failure rejects start() with the build error, the engine STAYS pending and is still lexically served', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        // W3 RE-PIN (2026-09-05): the total-failure trigger is reshaped to a
        // NON-embed path (the store's listNodes throws) — under the W3
        // embed-failure flip (§5.9 #46) a per-node embed rejection is a
        // 'transient' skip and the build RESOLVES (the engine promotes), so
        // the stays-pending pin is exercised by a STORE failure instead. The
        // stays-pending + lexical-serving pins are unchanged.
        armListNodesFailure(store)
        await expect(boot.start()).rejects.toThrow('store exploded')
        expect(boot.phase()).toBe('pending') // never an unhandled demotion — stays pending
        const result = await boot.engine.query('hello') // lexical serving continues
        expect(result.ranked[0].nodeId).toBe('n1')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('a total build failure logs "vector boot: build failed (staying pending): <error>"', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const provider = makeProviderDouble()
        const captured = captureConsole()
        const boot = createVectorBootController(store, provider)
        // W3 RE-PIN (2026-09-05): NON-embed total-failure trigger (see above).
        armListNodesFailure(store)
        await expect(boot.start()).rejects.toThrow('store exploded')
        expect(captured.lines.some((l) =>
          l.includes('vector boot: build failed (staying pending): store exploded'),
        )).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.12 — THE PROMOTION REPORT (W1 pins)
  // =========================================================================

  describe('§5.12 PromotionReport (W1 pins: cacheHits 0, skipped { empty: n, transient: 0 })', () => {
    it('the report carries exactly the pinned shape: embedded, cacheHits 0 (W4), reEmbedded, adopted (F-W1-2), skipped { empty n, transient 0 } (W3), promotedAt', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'alpha' }))
        await store.putNode(makeNode('n2', { content: 'beta' }))
        await store.putNode(makeNode('n3', { content: '' }))
        await store.putNode(makeNode('n4', { content: '   ' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider)
        const startedAt = Date.now()
        const report: PromotionReport = await boot.start()
        expect(Object.keys(report).sort()).toEqual(['adopted', 'cacheHits', 'embedded', 'promotedAt', 'reEmbedded', 'skipped'])
        expect(report.embedded).toBe(2)
        expect(report.cacheHits).toBe(0) // W4 pin: 0 until the cache lands
        expect(report.reEmbedded).toBe(0)
        expect(report.skipped).toEqual({ empty: 2, transient: 0 }) // W1 pin
        expect(typeof report.promotedAt).toBe('number')
        expect(report.promotedAt).toBeGreaterThanOrEqual(startedAt)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.12/§5.3 W3 — THE TRANSIENT CENSUS VIA THE CONTROLLER (the sanctioned W3
  // addition: a per-node embed failure is a census row, NOT a build failure)
  // =========================================================================

  describe('§5.12 W3 — the promotion report\'s transient census (the index\'s skipped map is authoritative)', () => {
    it('a build whose embed fails for some nodes records skipped.transient > 0 and the engine STILL promotes', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('n1', { content: 'cursed content' }))
        await store.putNode(makeNode('n2', { content: 'healthy content' }))
        const provider = makeProviderDouble()
        const realEmbed = provider.embed.bind(provider)
        provider.embed = async (text: string) => {
          if (text === 'cursed content') throw new Error('provider down')
          return realEmbed(text)
        }
        const boot = createVectorBootController(store, provider)
        const report = await boot.start()
        // the failed node is a 'transient' census row on the controller's
        // skipped map (the background build's INDEX carries the authoritative
        // record — the W3 flip, §5.9 #46)
        expect(boot.skipped().get('n1')).toBe('transient')
        expect(report.skipped.transient).toBeGreaterThan(0)
        expect(report.skipped.empty).toBe(0)
        // the engine STILL promotes — the build resolved (never a total
        // failure); n2 is indexed and served post-promotion
        expect(boot.phase()).toBe('promoted')
        const result = await boot.engine.query('healthy')
        expect(result.ranked.some((r) => r.nodeId === 'n2')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.12 pin (e) — THE RECONCILE-TO-SWAP GAP (pinned, documented window)
  // =========================================================================

  describe('§5.12 pin (e) — the reconcile-to-swap gap', () => {
    it('a pre-swap edit landing after the reconcile re-check (during that node\'s own re-embed) leaves the node on its pre-edit embedding until its NEXT touch via the attached hook', async () => {
      const dir = freshDir()
      try {
        const { store } = makeStoreDouble(dir)
        await store.putNode(makeNode('m', { content: 'content zero', updatedAt: T0 }))
        // The edit is landed DURING the node's own reconcile re-embed: the
        // re-check for that node has BY DEFINITION already happened (the
        // re-embed decision required reading its updatedAt), and the swap has
        // not happened yet (re-embeds complete before the swap) — exactly the
        // pinned window. Single-node construction: no cross-node ordering
        // assumptions.
        const provider = makeProviderDouble(async (text) => {
          if (text === 'content zero') {
            // build embed → bump to T1/C1 so the reconcile re-embeds it
            await store.putNode(makeNode('m', { content: 'content one', updatedAt: T1 }))
          } else if (text === 'content one') {
            // reconcile re-embed (after the re-check, before the swap) →
            // bump to T2/C2: this edit must land in the gap
            await store.putNode(makeNode('m', { content: 'content two', updatedAt: T2 }))
          }
        })
        const boot = createVectorBootController(store, provider)
        const bootDone = boot.start()
        const report = await bootDone
        // 'content two' was NEVER embedded during boot: the node stays on its
        // pre-edit (T2-edit) embedding through the promotion
        expect(provider.embedTexts).toEqual(['content zero', 'content one'])
        expect(report.reEmbedded).toBe(1)
        expect(boot.phase()).toBe('promoted')
        // ...until its NEXT touch via the now-attached hook
        await boot.engine.onStoreChanged('content', ['m'], [])
        expect(provider.embedTexts).toEqual(['content zero', 'content one', 'content two'])
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.5 W1 amendment — PREBUILT-INDEX ADOPTION (VectorEmbedderOptions.index?)
  // =========================================================================

  describe('§5.5 prebuilt-index adoption (createVectorEmbedder opts.index — W1)', () => {
    it('index SUPPLIED: NO build embeds inside createVectorEmbedder; the adopted index\'s vectors drive scoring', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        // a hand-built index whose vectors are NOT derivable from the node
        // contents — if the embedder adopted it, scoring must reflect THESE
        // vectors, not content-derived ones
        const prebuilt: VectorIndex = {
          nodeIds: ['n1', 'n2'],
          embeddings: new Map<string, number[]>([
            ['n1', [1, 0, 0, 0]],
            ['n2', [0, 1, 0, 0]],
          ]),
          dimension: 4,
        }
        const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[1, 0, 0, 0]] }) }))
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG, index: prebuilt })
        // ADOPTION: zero embed calls at construction (the controller builds the
        // index in the background and hands the prebuilt index here)
        expect(calls).toHaveLength(0)
        // the adopted vectors drive scoring: the only HTTP call is the query embed
        const scored = await embedder.score('q', store.listNodes())
        expect(calls).toHaveLength(1)
        expect(scored[0].nodeId).toBe('n1')
        expect(scored[0].score).toBeGreaterThan(0.99) // parallel to the query vector
        expect(scored.find((s) => s.nodeId === 'n2')?.score ?? 0).toBe(0) // orthogonal
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('index OMITTED: build from the store\'s nodes as today (one embed per non-empty node inside createVectorEmbedder)', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        const calls = stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG }) // NO index
        expect(calls).toHaveLength(2) // the build embedded each node once
        const scored = await embedder.score('hello', store.listNodes())
        expect(scored[0].nodeId).toBe('n1')
        expect(scored[0].score).toBeGreaterThan(0)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })
})