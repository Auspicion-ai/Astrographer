// tests/unit-h5-teardown.test.ts — Unit U-H5: the teardown PRIMITIVES
// (A-P2-8) — `teardown(): Promise<void>` on RagStore / RetrievalEngine /
// VectorBootController + the `RetrievalEngine.inFlight(): number` drain CHECK
// seam + the OPTIONAL `Embedder.teardown?(): Promise<void>` forward hook.
//
// RED SET (RCA-1) — written BEFORE any U-H5 implementation exists. The four
// consumed modules (`rag-store.js`, `adjacency.js`, `retrieval.js`,
// `vector-boot.js`) are GREEN and IMPORT CLEANLY, so this suite LOADS. The red
// is the ABSENCE of the U-H5 members: `teardown`/`inFlight` do NOT exist on any
// returned object, so every `it()` that touches them FAILS with a TypeError /
// assertion on `undefined`/`typeof !== 'function'`. Every assertion derives
// from docs/specs/unit-h5-teardown.md ALONE:
//   §5.2       the exact TS additions (RagStore.teardown, Embedder.teardown?,
//              RetrievalEngine.teardown + inFlight, VectorBootController.teardown)
//   §5.3       the four factories gain the members (no signature change)
//   §5.4       the behavior pins (queue drain + mutate-revoke + read-safe
//              store teardown; snapshot NO-OP reference; engine STOPPED + the
//              embedder forward; boot in-flight CANCEL + stopped + no cache flush)
//   §5.5       the byte-pinned messages (TD-store / TD-engine / TD-boot /
//              snapshot-read-only)
//   §5.6 H1–H11 the happy-path states
//   §5.7 F1–F9  the fail-states
//   §5.8       the negative pins D6 / D3 / A-P2-8 (STAY GREEN — absence pins)
//   §7         Architect ruling (ASYNC / resolves-undefined / idempotent /
//              no-fail/void / mutate-only store poisoning / engine-level
//              inFlight / NO cache-file delete-flush)
//
// Conventions follow tests/unit-h2-runtime-controller.test.ts + tests/vector-
// boot.test.ts (vitest node environment, `.js` import suffix for the main-
// process ESM modules, temp dirs via node:fs mkdtempSync + rmSync, byte-exact
// catch/expectThrow), and tests/vector-boot.test.ts (the provider double +
// gated build). NO test touches real repo/userData paths.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync as readSrc } from 'node:fs'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
} from '../src/main/rag-store.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { createRetrieval, type Embedder, type RetrievalEngine } from '../src/main/retrieval.js'
import { createVectorBootController, type VectorBootController } from '../src/main/vector-boot.js'
import type { EmbeddingProvider } from '../src/main/embeddings.js'
import { createVectorCache } from '../src/main/vector-cache.js'

// ---------------------------------------------------------------------------
// The byte-pinned message set (§5.5).
// ---------------------------------------------------------------------------
const TD_STORE = 'rag store: torn down'
const TD_ENGINE = 'retrieval engine: torn down'
const TD_BOOT = 'vector boot: torn down'
const SNAPSHOT_RO = 'createSnapshotStore: read-only'

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, byte-exact message assertions).
// ---------------------------------------------------------------------------

function withDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h5-'))
  try {
    run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Async variant — for tests that seed a store/engine/boot via `await`. */
async function withDirAsync(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h5-'))
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

/** The pinned teardown message may surface as a SYNC throw (a defensive guard)
 *  or an ASYNC rejection — both are the §5.7 fail-loud contract. Handle both.
 *  `make()` must either throw synchronously or return a promise that rejects
 *  with the exact message. */
async function expectFailLoud(make: () => Promise<unknown> | unknown, exactMessage: string): Promise<void> {
  let made: Promise<unknown> | unknown
  let syncCaught: unknown
  try {
    made = make()
  } catch (err) {
    syncCaught = err
  }
  if (syncCaught !== undefined) {
    expect(syncCaught).toBeInstanceOf(Error)
    expect((syncCaught as Error).message).toBe(exactMessage)
    return
  }
  await expect(made as Promise<unknown>).rejects.toThrow(exactMessage)
}

/** A deterministic leaf node (the ms2 makeNode idiom). */
function makeNode(id: string, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-08T00:00:00.000Z'
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

/** A minimal `Embedder` without a `teardown?` hook — the shape of EVERY
 *  current embedder (none implements the optional hook). */
function makePlainEmbedder(): Embedder {
  return {
    async score() { return [] },
    async place() { return { ok: false as const, reason: 'no-match' as const } },
  }
}

/** A deferred we control, so a `query()` can be held pending (resolved) or
 *  rejected — the deterministic interleaving point for the inFlight tests. */
function makeDeferred(): { promise: Promise<void>; resolve(): void; reject(e: Error): void } {
  let resolve!: () => void
  let reject!: (e: Error) => void
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

/** A full `EmbeddingProvider` DOUBLE (the §5.12 seam injects the provider —
 *  no HTTP). Records every embed text; runs a per-test hook INSIDE each embed
 *  call so a build can be held in flight (tests/vector-boot.test.ts idiom). */
function makeProviderDouble(onEmbed?: (text: string, callIndex: number) => void | Promise<void>): EmbeddingProvider & {
  embedTexts: string[]
} {
  const embedTexts: string[] = []
  const seen = new Map<string, number>()
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: 4,
    embedTexts,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      const n = (seen.get(text) ?? 0) + 1
      seen.set(text, n)
      await onEmbed?.(text, n)
      return textEmbedding(text)
    },
  }
}

/** A deterministic bag-of-words → fixed-dimension embedding (the
 *  tests/embeddings.test.ts idiom — only a shape the embedder must return). */
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

/** A test-controlled pause for the background build. */
function gated(): { gate: Promise<void>; release: () => void } {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  return { gate, release }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// P0 — the RCA-1 red marker: the ADDITIVE members do NOT exist on the
// pre-U-H5 code. Every body FAILS (the members are `undefined`, so
// `typeof x.teardown === 'function'` is false) — the suite still LOADS.
// ---------------------------------------------------------------------------

describe('P0 — the U-H5 additive members are ABSENT on the pre-U-H5 code (RCA-1 red marker)', () => {
  it('P0a — RagStore objects carry a teardown(): Promise<void> member (createJsonRagStore + createSnapshotStore)', () => {
    withDir((dir) => {
      const json = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(typeof (json as RagStore).teardown).toBe('function') // ABSENT → fails
      const snap = createSnapshotStore([makeNode('n1', 'a')], [])
      expect(typeof (snap as RagStore).teardown).toBe('function') // ABSENT → fails
    })
  })

  it('P0b — RetrievalEngine carries teardown(): Promise<void> AND inFlight(): number members', () => {
    withDir((dir) => {
      const engine: RetrievalEngine = createRetrieval(createJsonRagStore({ path: join(dir, 'rag.json') }), makePlainEmbedder())
      expect(typeof engine.teardown).toBe('function') // ABSENT → fails
      expect(typeof engine.inFlight).toBe('function') // ABSENT → fails
    })
  })

  it('P0c — VectorBootController carries a teardown(): Promise<void> member', () => {
    withDir((dir) => {
      const boot: VectorBootController = createVectorBootController(
        createJsonRagStore({ path: join(dir, 'rag.json') }),
        makeProviderDouble(),
      )
      expect(typeof boot.teardown).toBe('function') // ABSENT → fails
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H1–H4 — the store teardown states (createJsonRagStore + the
// createSnapshotStore NO-OP reference).
// ---------------------------------------------------------------------------

describe('§5.6 store teardown — createJsonRagStore (H1–H3) + createSnapshotStore reference NO-OP (H4)', () => {
  it('H1 — store teardown resolves undefined, is idempotent, every READ still resolves, the persistence file is BYTE-IDENTICAL (D3)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'content one'))
      const filePath = join(dir, 'rag.json')
      const before = readFileSync(filePath, 'utf8')
      // first teardown resolves undefined.
      await expect(store.teardown()).resolves.toBeUndefined()
      // second teardown is an idempotent, immediately-resolving NO-OP.
      await expect(store.teardown()).resolves.toBeUndefined()
      // READ methods STILL RESOLVE (a torn-down store is read-safe — §7 Q4).
      expect(store.getNode('n1')?.id).toBe('n1')
      expect(store.listNodes()).toHaveLength(1)
      expect(store.getEdge('E1')).toBeUndefined()
      expect(store.listEdges()).toEqual([])
      expect(typeof store.status()).toBe('object')
      expect(Array.isArray(store.journal())).toBe(true)
      expect(store.undoDepth()).toBe(1)
      expect(store.redoDepth()).toBe(0)
      expect(store.edgesFrom('n1')).toEqual([])
      expect(store.edgesTo('n1')).toEqual([])
      expect(store.edgesByKind('doc-head')).toEqual([])
      expect(store.edgesForDocument('doc-1')).toEqual([])
      expect(store.docHeadForDocument('doc-1')).toBeUndefined()
      // the persistence file is NEVER deleted/touched (D3).
      expect(readFileSync(filePath, 'utf8')).toBe(before)
    })
  })

  it('H2 — store teardown DRAINS a pending write: teardown resolves only after an enqueued putNode settles + persists; the record is on disk', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const pending = store.putNode(makeNode('n1', 'pending write')) // fire-and-forget, NOT awaited
      await store.teardown() // resolves only after the queued write settles + persists
      await pending
      // the record is on disk + readable after the teardown.
      expect(store.getNode('n1')?.id).toBe('n1')
      expect(readFileSync(join(dir, 'rag.json'), 'utf8')).toContain('n1')
    })
  })

  it('H3 — store torn-down READs work, MUTATIONS fail loud; the file is untouched (mutations covered by F1–F3)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'content one'))
      const filePath = join(dir, 'rag.json')
      const before = readFileSync(filePath, 'utf8')
      await store.teardown()
      expect(store.getNode('n1')?.id).toBe('n1') // reads still resolve
      expect(readFileSync(filePath, 'utf8')).toBe(before)
    })
  })

  it('H4 — createSnapshotStore teardown is the reference NO-OP: resolves, idempotent, reads work, mutators still throw the EXISTING read-only message', async () => {
    const snap = createSnapshotStore([makeNode('n1', 'a'), makeNode('n2', 'b')], [])
    await expect(snap.teardown()).resolves.toBeUndefined()
    await expect(snap.teardown()).resolves.toBeUndefined()
    expect(snap.getNode('n1')?.id).toBe('n1')
    expect(snap.listNodes()).toHaveLength(2)
    // the adapter is read-only pre- AND post-teardown — the torn-down message
    // is NEVER the snapshot store's (no lifecycle queue to drain; §5.4).
    expectThrow(() => snap.putNode(makeNode('x', 'c')), SNAPSHOT_RO)
  })
})

// ---------------------------------------------------------------------------
// §5.6 H5–H8 + §5.7 F4–F6/F8 — the engine teardown + inFlight states.
// ---------------------------------------------------------------------------

describe('§5.6/§5.7 engine teardown + inFlight — createRetrieval (H5–H8, F4–F6, F8)', () => {
  it('H5 — engine teardown is a resolving, idempotent NO-OP; a fresh/never-queried engine reports inFlight() === 0', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const engine: RetrievalEngine = createRetrieval(store, makePlainEmbedder())
      expect(engine.inFlight()).toBe(0) // fresh / never queried
      await expect(engine.teardown()).resolves.toBeUndefined()
      await expect(engine.teardown()).resolves.toBeUndefined() // idempotent NO-OP
    })
  })

  it('H6 — engine torn-down service fails loud: query/onStoreChanged/setEmbedder each report "retrieval engine: torn down" (F4–F6)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const engine: RetrievalEngine = createRetrieval(store, makePlainEmbedder())
      await engine.teardown()
      await expectFailLoud(() => engine.query('hello'), TD_ENGINE) // F4
      await expectFailLoud(() => engine.onStoreChanged('content', ['n1'], []), TD_ENGINE) // F5
      expectThrow(() => engine.setEmbedder(makePlainEmbedder()), TD_ENGINE) // F6 (sync)
    })
  })

  it('H7 — engine inFlight() counts unsettled queries: 0 fresh, 1 while pending, 0 after settle; a REJECTED query also decrements (1→0)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'alpha content'))
      // resolve-half: hold `score` pending, then resolve it.
      const d = makeDeferred()
      const embedder: Embedder = {
        async score() { await d.promise; return [] },
        async place() { return { ok: false as const, reason: 'no-match' as const } },
      }
      const engine: RetrievalEngine = createRetrieval(store, embedder)
      expect(engine.inFlight()).toBe(0)
      const q = engine.query('hello')
      await vi.waitFor(() => { expect(engine.inFlight()).toBe(1) }) // unsettled query counted
      d.resolve()
      await q
      expect(engine.inFlight()).toBe(0) // settle decrements
      // rejected-query half: a rejection also decrements (resolve OR reject).
      const d2 = makeDeferred()
      const rejectEmbedder: Embedder = {
        async score() { await d2.promise; return [] },
        async place() { return { ok: false as const, reason: 'no-match' as const } },
      }
      const engine2: RetrievalEngine = createRetrieval(store, rejectEmbedder)
      const q2 = engine2.query('hello')
      await vi.waitFor(() => { expect(engine2.inFlight()).toBe(1) })
      d2.reject(new Error('embedder failed'))
      await expect(q2).rejects.toThrow('embedder failed')
      expect(engine2.inFlight()).toBe(0) // a rejection decrements too
    })
  })

  it('H8 — engine teardown forwards the OPTIONAL embedder.teardown hook exactly once; an embedder WITHOUT the hook is a no-op (no throw)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const teardownSpy = vi.fn(async () => {})
      const withHook: Embedder = {
        score: vi.fn(async () => []),
        place: vi.fn(async () => ({ ok: false as const, reason: 'no-match' as const })),
        teardown: teardownSpy, // the OPTIONAL hook — present ⇒ forwarded
      }
      const engine: RetrievalEngine = createRetrieval(store, withHook)
      await engine.teardown()
      expect(teardownSpy).toHaveBeenCalledTimes(1) // forwarded exactly once
      // WITHOUT the hook (absent = a no-op in U-H5 — every real embedder) the
      // engine teardown must STILL work and resolve with no throw.
      const store2: RagStore = createJsonRagStore({ path: join(dir, 'rag2.json') })
      const engine2: RetrievalEngine = createRetrieval(store2, makePlainEmbedder())
      await expect(engine2.teardown()).resolves.toBeUndefined() // no hook → no-op forward
    })
  })

  it('F8 — a query() entered BEFORE engine.teardown() completes normally on the OLD embedder (teardown does NOT cancel it); only NEW queries throw', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'alpha content'))
      const d = makeDeferred()
      const embedder: Embedder = {
        async score() { await d.promise; return [] },
        async place() { return { ok: false as const, reason: 'no-match' as const } },
      }
      const engine: RetrievalEngine = createRetrieval(store, embedder)
      const q = engine.query('hello') // in-flight BEFORE teardown (a caller error — U-H4 drains first)
      await vi.waitFor(() => { expect(engine.inFlight()).toBe(1) })
      await engine.teardown() // does NOT cancel the in-flight query
      d.resolve()
      await q // still settles normally on the OLD embedder
      expect(engine.inFlight()).toBe(0)
      // a NEW query after teardown is rejected (F4).
      await expectFailLoud(() => engine.query('hello'), TD_ENGINE)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H1/H3 + §5.7 F1–F3 — the store MUTATION-revoke fail-states (the
// post-teardown mutation set). Reads stay safe (H1/H3); mutations fail loud.
// ---------------------------------------------------------------------------

describe('§5.7 store mutation fail-states — F1/F2/F3 (mutations on a torn-down createJsonRagStore)', () => {
  it('F1 — putNode/removeNode/putEdge/removeEdge/applyBatch on a torn-down store → "rag store: torn down" (file untouched)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'seed'))
      const filePath = join(dir, 'rag.json')
      const before = readFileSync(filePath, 'utf8')
      await store.teardown()
      await expectFailLoud(() => store.putNode(makeNode('x', 'c')), TD_STORE)
      await expectFailLoud(() => store.removeNode('n1'), TD_STORE)
      await expectFailLoud(() => store.putEdge({ id: 'e1' } as never), TD_STORE)
      await expectFailLoud(() => store.removeEdge('e1'), TD_STORE)
      await expectFailLoud(() => store.applyBatch([] as never), TD_STORE)
      // the persisted file is untouched by the failed mutations (D3).
      expect(readFileSync(filePath, 'utf8')).toBe(before)
    })
  })

  it('F2 — undo()/redo() on a torn-down store → "rag store: torn down"', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'seed'))
      await store.teardown()
      await expectFailLoud(() => store.undo(), TD_STORE)
      await expectFailLoud(() => store.redo(), TD_STORE)
    })
  })

  it('F3 — store.enqueue(fn) (NEW work) on a torn-down store → "rag store: torn down" and does NOT enqueue', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.teardown()
      let ran = false
      await expectFailLoud(() => store.enqueue(() => { ran = true; return 'x' }), TD_STORE)
      expect(ran).toBe(false) // did NOT enqueue / did NOT run
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H9–H11 + §5.7 F7/F9 — the boot-controller + snapshot fail-states.
// ---------------------------------------------------------------------------

describe('§5.6/§5.7 boot-controller teardown (H9–H11, F7) + snapshot fail-state (F9)', () => {
  it('H9 — boot-controller teardown (NEVER started): resolves; phase stays pending; the shared engine is torn down; a post-teardown start() rejects "vector boot: torn down"', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const boot: VectorBootController = createVectorBootController(store, makeProviderDouble())
      await boot.teardown()
      expect(boot.phase()).toBe('pending') // never promoted — still pending
      await expectFailLoud(() => boot.engine.query('hello'), TD_ENGINE) // shared engine torn down
      await expect(boot.start()).rejects.toThrow(TD_BOOT) // F7: post-teardown start rejects
    })
  })

  it('H10 — boot-controller teardown (PROMOTED): after await boot.start(), teardown resolves; the promoted engine is torn down', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'alpha content'))
      const boot: VectorBootController = createVectorBootController(store, makeProviderDouble())
      await boot.start()
      expect(boot.phase()).toBe('promoted')
      await boot.teardown()
      await expectFailLoud(() => boot.engine.query('hello'), TD_ENGINE) // promoted engine torn down
    })
  })

  it('H11 — boot-controller teardown CANCELS an in-flight build: the outstanding start() promise settles REJECTED with "vector boot: torn down", teardown resolves after; the vector-CACHE file is BYTE-IDENTICAL (no delete/no flush)', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'alpha content'))
      // a pre-seeded content-addressed cache file — the U-H5 teardown must
      // NEVER delete or flush it (D3 / §7 Q2).
      const cachePath = join(dir, 'provident-vector-cache.json')
      const payload = { version: 1, entries: [] }
      writeFileSync(cachePath, JSON.stringify(payload))
      const beforeCache = readFileSync(cachePath, 'utf8')
      const cache = createVectorCache({ path: cachePath })
      // gate the FIRST embed so the background build stays in flight. NO
      // cache.set has run at this point (gated BEFORE the first embed).
      const { gate, release } = gated()
      const provider = makeProviderDouble((_text, n) => (n === 1 ? gate : undefined))
      const boot: VectorBootController = createVectorBootController(store, provider, { cache })
      const startP = boot.start() // the in-flight build (not awaited by the caller)
      await vi.waitFor(() => { expect(provider.embedTexts.length).toBe(1) }) // build is in flight (blocked at the first embed)
      // teardown must CANCEL the build (set the abort token + AWAIT the real
      // build's settlement, not just the start() deferred). The build is
      // blocked at the gated first embed, so RELEASE the gate (a genuine
      // cancel lets the embed resume, hit the abort check, and short-circuit
      // WITHOUT writing) — the test then awaits teardown, which resolves only
      // after the build has actually stopped.
      const td = boot.teardown()
      release()
      await td
      // the outstanding start() promise settles REJECTED with the pinned message
      // (the start() caller's `.catch` fires).
      await expect(startP).rejects.toThrow(TD_BOOT)
      // the content-addressed vector-cache file is BYTE-IDENTICAL (never
      // deleted, never flushed by a U-H5 teardown; and because the abort
      // fired BEFORE the first embed completed, no cache.set ever ran).
      expect(readFileSync(cachePath, 'utf8')).toBe(beforeCache)
    })
  })

  it('H12 — boot-controller teardown GENUINELY CANCELS an ALREADY-EMBEDDED in-flight build (H5-1): the build has progressed past ≥1 embed (a cache.set has run) when teardown fires; teardown AWAITS the build actually stopping — NO store/cache/engine mutation outlives it: the cache FILE stays byte-identical, phase stays pending (never promoted), and start() rejects "vector boot: torn down"', async () => {
    await withDirAsync(async (dir) => {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'alpha one'))
      await store.putNode(makeNode('n2', 'beta two'))
      // a pre-seeded content-addressed cache file — an H12 teardown must NEVER
      // delete or flush it, and must NOT let the freed build rewrite it after
      // teardown resolves (D3 / §7 Q2 — the H5-1 host finding).
      const cachePath = join(dir, 'provident-vector-cache.json')
      const payload = { version: 1, entries: [] }
      writeFileSync(cachePath, JSON.stringify(payload))
      const beforeCache = readFileSync(cachePath, 'utf8')
      const cache = createVectorCache({ path: cachePath })
      // Gate ONLY the SECOND embed (by its distinct text): the first node
      // embeds freely, so cache.set #1 has RUN (the already-embedded case)
      // and the build is in flight past ≥1 embed when teardown fires.
      const { gate, release } = gated()
      const provider = makeProviderDouble((text) => (text === 'beta two' ? gate : undefined))
      const boot: VectorBootController = createVectorBootController(store, provider, { cache })
      const startP = boot.start()
      // both embeds requested; the second is blocked on the gate (≥1 embed +
      // cache.set have run — the free-running already-embedded case).
      await vi.waitFor(() => { expect(provider.embedTexts).toContain('alpha one'); expect(provider.embedTexts).toContain('beta two') })
      // teardown aborts the build and AWAITS its real settlement. The build is
      // blocked at the gated second embed, so release the gate to let it resume
      // and hit the abort check — teardown then resolves only after the build
      // has ACTUALLY stopped (no flush, no prune, no promotion).
      const td = boot.teardown()
      release()
      await td
      // the outstanding start() promise settles REJECTED with the pinned message.
      await expect(startP).rejects.toThrow(TD_BOOT)
      // the build ACTUALLY stopped: it must never reach the atomic promotion —
      // a leaked build that continued to completion would call engine.
      // setEmbedder + cache.flush AFTER teardown resolved (the H5-1 bug).
      // Poll phase for a bounded window: the buggy (pre-fix) build promotes
      // within a few microtasks; a genuine cancel keeps phase 'pending' forever.
      let phaseLeftPending = false
      const pollDeadline = Date.now() + 200
      while (Date.now() < pollDeadline) {
        if (boot.phase() !== 'pending') { phaseLeftPending = true; break }
        await new Promise((r) => setTimeout(r, 5))
      }
      expect(phaseLeftPending).toBe(false) // the buggy build PROMOTES → RED on the pre-fix code
      // the content-addressed vector-cache file is BYTE-IDENTICAL (the build
      // short-circuited BEFORE its promotion-time flush/prune — read within
      // the cache's debounce window, before any coalesced write fires).
      expect(readFileSync(cachePath, 'utf8')).toBe(beforeCache)
    })
  })

  it('F9 — snapshot-store mutation pre/post teardown throws the EXISTING "createSnapshotStore: read-only" (NEVER the torn-down message)', async () => {
    const snap = createSnapshotStore([makeNode('n1', 'a')], [])
    expectThrow(() => snap.putNode(makeNode('x', 'c')), SNAPSHOT_RO) // pre-teardown unchanged
    await snap.teardown()
    expectThrow(() => snap.putNode(makeNode('x', 'c')), SNAPSHOT_RO) // post-teardown STILL read-only
    await expect(snap.teardown()).resolves.toBeUndefined() // idempotent
  })
})

// ---------------------------------------------------------------------------
// §5.8 negative pins — D6 / D3 / A-P2-8. These are ABSENCE pins and STAY
// GREEN on the pre-U-H5 code (the seam is not wired, the files are not
// edited, no tool/IPC/delete primitive is added). They are the §5.9 N-pin
// red-set companions — NOT teardown-member-presence assertions.
// ---------------------------------------------------------------------------

describe('§5.8 negative pins — D6 / D3 / A-P2-8 (STAY GREEN: the seam exists but no call site, no tool/IPC, no delete)', () => {
  const RUNTIME_SRC = fileURLToPath(new URL('../src/main/rag-store-runtime.ts', import.meta.url))
  const UH5_SRCS = [
    fileURLToPath(new URL('../src/main/rag-store.ts', import.meta.url)),
    fileURLToPath(new URL('../src/main/adjacency.ts', import.meta.url)),
    fileURLToPath(new URL('../src/main/retrieval.ts', import.meta.url)),
    fileURLToPath(new URL('../src/main/vector-boot.ts', import.meta.url)),
  ]

  it('A-P2-8 — the runtime module (rag-store-runtime.ts) still defines NO teardown/close/destroy primitive and makes NO teardown call (the U-H2 N1 pin)', () => {
    const src = readSrc(RUNTIME_SRC, 'utf8')
    expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)
    expect(src).not.toMatch(/\bruntime\.(teardown|destroy)\s*\(/)
  })

  it('D6 + D3 — the four U-H5 files add NO MCP tool / IPC surface and the teardown paths add NO delete primitive', () => {
    for (const f of UH5_SRCS) {
      const src = readSrc(f, 'utf8')
      // D6 — no MCP / IPC surface added by U-H5's module files.
      expect(src).not.toMatch(/\bALL_TOOLS\b/)
      expect(src).not.toMatch(/\bRpcMethod\b/)
      expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
      expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
      // D3 — teardown NEVER deletes the store/cache files (no unlink/rm/rmdir).
      expect(src).not.toMatch(/\b(unlink|rmdir)\s*\(/)
    }
  })
})
