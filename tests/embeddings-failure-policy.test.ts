// tests/embeddings-failure-policy.test.ts — Unit F W3: the embed-failure policy
// + the UNIT-F-SKIP-EMPTY extension + the VectorIndex `skipped` member.
//
// CONTRACT (docs/specs/unit-f-embeddings.md — spec-only, no src/ reading):
//   §5.3 "Embed-failure policy (W3, 2026-09-05 amendment — review W3/A6)":
//     a per-node embed rejection on ANY index-MAINTENANCE path
//     (`createVectorIndex` build loop, `addToVectorIndex`,
//     `updateVectorIndex`, the `onStoreChanged` hook) is NOT propagated:
//     `skipped.set(nodeId, 'transient')` + a warning log + the operation
//     RESOLVES (the build continues). A transient skip on update REPLACES the
//     previous embedding with nothing (scores 0 until a successful re-embed).
//     The retry trigger is REAL: `onStoreChanged` re-embeds only its passed
//     nodeIds (a next-touch retry). A successful re-embed or
//     `removeFromVectorIndex` deletes the skipped entry. Never-edited transient
//     skips surface in the promotion census (§5.12 — the boot controller's
//     report; NOT testable from this file, see the report note).
//   §5.3 "UNIT-F-SKIP-EMPTY — the empty-content guard" extends to ALL THREE
//     paths: `createVectorIndex` (skip + 'empty' record), `addToVectorIndex`
//     (NOT added, NO embed call, skipped 'empty'), `updateVectorIndex`
//     (embedding REMOVED, id removed from nodeIds, skipped 'empty', NO embed
//     call). An 'empty' skip is by-design permanent, re-classified only when
//     content later becomes non-empty (a touch re-embeds).
//   §5.3 `VectorIndex` gains the 4th member
//     `skipped: Map<string, 'empty' | 'transient'>` (members 3 → 4, §5.10);
//     a skipped node is NOT in nodeIds/embeddings — the invariant wins.
//   §5.8 #34–36 (partial-index query semantics / transient skip + retry / the
//     skipped census) and §5.9 #45–48 (#45 empty add/update; #46 per-node
//     transient failure — failure class 3 AFTER warm-up; #47 required-arg
//     rejections UNCHANGED; #48 query-time embed rejection UNCHANGED).
//
// STATE ENUMERATION (one valid test per state, one fail-safe test per
// documented fail-state):
//   S1  build, all nodes embed                → nodeIds+embeddings full, `skipped` an EMPTY Map (4-member shape)
//   S2  build, one node's embed rejects       → resolves; that node 'transient'; the others indexed; warning logged (§5.9 #46)
//   S3  update, re-embed rejects              → resolves; the previous embedding REMOVED (scores 0); 'transient'
//   S4  add, embed rejects                    → resolves; node NOT added; 'transient'
//   S5  hook (`onStoreChanged`), embed rejects → resolves; 'transient' (#46's build/add/update/HOOK list)
//   S6  next touch of the SAME nodeId, embed recovered → re-embeds; the skipped entry DELETED
//   S7  touch of an UNRELATED nodeId          → NO retry of the skipped node (the trigger is only the passed nodeIds)
//   S8  removeFromVectorIndex                 → ANY skipped entry cleared ('transient' AND 'empty')
//   S9  update, content became empty          → embedding removed; id leaves nodeIds; 'empty'; NO embed call (§5.9 #45)
//   S10 add, content empty                    → NOT added; NO embed call; 'empty' (§5.9 #45)
//   S11 build, content empty                  → skip + the 'empty' record (the guard "as today, plus the skipped record")
//   S12 'empty' content becomes non-empty     → a touch re-embeds + re-classifies (the skipped entry clears)
//   S13 transient-skipped node at query time  → scores 0, excluded from `ranked` (§5.8 #34)
//   F1  required-arg rejections UNCHANGED     (§5.9 #47 → #19–21)
//   F2  query-time embed rejection UNCHANGED  (§5.9 #48 → #32: score/place/engine.query)
//   F3  the re-pinned tests/embeddings.test.ts:380-386 block (build/maintenance
//       skip+resolve, NOT reject) — edited IN that file (the sanctioned re-pin).
//
// RED EXPECTATION (W3 not implemented yet): the W1/W2 implementation
// propagates per-node embed rejections from the build/maintenance paths (the
// pre-W3 fail-state), has NO `skipped` member (members 3, §5.10), and lacks
// the empty guard on add/update — so S2–S13/F3 are RED; F1/F2 pin UNCHANGED
// behavior and must stay GREEN.
//
// Mock patterns ONLY are borrowed from tests/embeddings.test.ts +
// tests/vector-boot.test.ts (the deterministic textEmbedding mock, the
// scriptable embed/provider doubles, the real-JSON-store double, the console
// capture). NO contract was derived from src/.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createVectorIndex,
  updateVectorIndex,
  addToVectorIndex,
  removeFromVectorIndex,
  createVectorEmbedder,
  type EmbedTextFn,
  type EmbeddingProvider,
  type VectorIndex,
} from '../src/main/embeddings.js'
import { createVectorBootController } from '../src/main/vector-boot.js'
import { createRetrieval } from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-emb-w3-'))
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

/** Capture every console line regardless of stream (the tests/vector-boot.test.ts
 *  idiom). The spec pins "a warning is logged" for a transient skip — the FACT
 *  + the failed node id, NOT the exact string (only the §5.12 boot milestone
 *  strings are SpecWriter-pinned). */
function captureConsole(): { lines: string[] } {
  const lines: string[] = []
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    vi.spyOn(console, m).mockImplementation((...args: unknown[]) => {
      lines.push(args.map((a) => String(a)).join(' '))
    })
  }
  return { lines }
}

type ScriptableEmbedFn = EmbedTextFn & { calls: string[]; failures: Set<string> }

/** A scriptable `EmbedTextFn` double: records every embedded text and throws
 *  `Error('provider down')` for the texts in `failures` (a per-NODE embed
 *  rejection — failure class 3, AFTER warm-up). */
function makeScriptableEmbedFn(): ScriptableEmbedFn {
  const calls: string[] = []
  const failures = new Set<string>()
  const fn = (async (text: string) => {
    calls.push(text)
    if (failures.has(text)) throw new Error('provider down')
    return textEmbedding(text)
  }) as ScriptableEmbedFn
  fn.calls = calls
  fn.failures = failures
  return fn
}

type ScriptableProvider = EmbeddingProvider & { embedCalls: string[]; failures: Set<string> }

/** A scriptable `EmbeddingProvider` double (the tests/vector-boot.test.ts
 *  provider-double idiom, plus a failure set): records every embed text and
 *  throws `Error('provider down')` for the texts in `failures`. Injected as a
 *  provider INSTANCE (the §5.5 W1 amendment — no HTTP). */
function makeScriptableProvider(): ScriptableProvider {
  const embedCalls: string[] = []
  const failures = new Set<string>()
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: 4,
    embedCalls,
    failures,
    async embed(text: string) {
      embedCalls.push(text)
      if (failures.has(text)) throw new Error('provider down')
      return textEmbedding(text)
    },
  } as ScriptableProvider
}

function makeStore(dir: string): RagStore {
  return createJsonRagStore({ path: join(dir, 'rag.json') })
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

// =========================================================================
// §5.3 W3 — THE EMBED-FAILURE POLICY (transient skips: build/update/add/hook)
// =========================================================================

describe('W3 embed-failure policy — transient skips (§5.3, §5.9 #46)', () => {
  it('S2 build: one node\'s embed rejects → the build RESOLVES, the node is skipped \'transient\', the others are indexed, a warning is logged', async () => {
    const dir = freshDir()
    try {
      const console_ = captureConsole()
      const embedFn = makeScriptableEmbedFn()
      embedFn.failures.add('cursed text')
      // The build continues past the per-node failure (n-fail embeds FIRST —
      // the loop must not abort): the other nodes are indexed in order.
      const index = await createVectorIndex([
        makeNode('n-fail', { content: 'cursed text' }),
        makeNode('n2', { content: 'alpha text' }),
        makeNode('n3', { content: 'beta text' }),
      ], embedFn)
      expect(index.nodeIds).toEqual(['n2', 'n3'])
      expect(index.embeddings.has('n-fail')).toBe(false)
      expect(index.embeddings.has('n2')).toBe(true)
      expect(index.embeddings.has('n3')).toBe(true)
      expect(index.skipped.get('n-fail')).toBe('transient')
      expect(index.skipped.size).toBe(1)
      // a warning is logged (the string is NOT pinned — only the fact + the id)
      expect(console_.lines.some((l) => l.includes('n-fail'))).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S3 update-to-transient: a touched node whose re-embed fails → its previous embedding is REMOVED (scores 0), skipped \'transient\', resolves', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([
        makeNode('n1', { content: 'first draft' }),
        makeNode('n2', { content: 'other text' }),
      ], embedFn)
      expect(index.embeddings.has('n1')).toBe(true) // sanity: indexed before the edit
      embedFn.failures.add('edited draft')
      await updateVectorIndex(index, makeNode('n1', { content: 'edited draft' }), embedFn) // RESOLVES (not propagated)
      // the previous embedding is REPLACED WITH NOTHING — the node is unindexed
      expect(index.embeddings.has('n1')).toBe(false)
      expect(index.nodeIds).not.toContain('n1')
      expect(index.nodeIds).toEqual(['n2'])
      expect(index.skipped.get('n1')).toBe('transient')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S4 add-transient: an addToVectorIndex embed failure → resolves, the node is NOT added, skipped \'transient\'', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([makeNode('n2', { content: 'alpha text' })], embedFn)
      embedFn.failures.add('new node text')
      await addToVectorIndex(index, makeNode('n1', { content: 'new node text' }), embedFn) // RESOLVES
      expect(index.nodeIds).toEqual(['n2']) // NOT added
      expect(index.embeddings.has('n1')).toBe(false)
      expect(index.skipped.get('n1')).toBe('transient')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S5 hook: an onStoreChanged touch whose embed fails → resolves (NOT propagated), the node is skipped \'transient\' (§5.9 #46 hook path)', async () => {
    const dir = freshDir()
    try {
      const store = makeStore(dir)
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const provider = makeScriptableProvider()
      provider.failures.add('hello world')
      // adopt a prebuilt index (n2 only) → NO build embeds; the hook touch is the only embed
      const prebuilt = await createVectorIndex([makeNode('n2', { content: 'other text' })], makeScriptableEmbedFn())
      const embedder = await createVectorEmbedder(store, { provider, index: prebuilt })
      await expect(embedder.onStoreChanged!('content', ['n1'], [])).resolves.toBeUndefined()
      // n1 is NOT indexed (skipped): a query excludes it (#34)
      const ranked = await embedder.score('hello', store.listNodes())
      expect(ranked.find((s) => s.nodeId === 'n1')?.score ?? 0).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S6/S7 the retry trigger is REAL: a next touch of the SAME nodeId re-embeds it; an UNRELATED node\'s touch does NOT retry it', async () => {
    const dir = freshDir()
    try {
      const store = makeStore(dir)
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      await store.putNode(makeNode('n2', { content: 'other text' }))
      const provider = makeScriptableProvider()
      provider.failures.add('hello world')
      const prebuilt = await createVectorIndex([makeNode('n2', { content: 'other text' })], makeScriptableEmbedFn())
      const embedder = await createVectorEmbedder(store, { provider, index: prebuilt })
      // first touch of n1 → transient skip
      await embedder.onStoreChanged!('content', ['n1'], [])
      expect(provider.embedCalls.filter((t) => t === 'hello world').length).toBe(1)
      // S7: an UNRELATED node's store change does NOT retry n1 (the trigger is
      // only the PASSED nodeIds)
      await embedder.onStoreChanged!('content', ['n2'], [])
      expect(provider.embedCalls.filter((t) => t === 'hello world').length).toBe(1) // no n1 retry
      const stillSkipped = await embedder.score('hello', store.listNodes())
      expect(stillSkipped.find((s) => s.nodeId === 'n1')).toBeUndefined() // still unindexed
      // S6: the next touch of the SAME nodeId, with a recovering embed, re-embeds it
      provider.failures.clear()
      await embedder.onStoreChanged!('content', ['n1'], [])
      expect(provider.embedCalls.filter((t) => t === 'hello world').length).toBe(2) // retried exactly once
      const recovered = await embedder.score('hello', store.listNodes())
      expect(recovered.some((s) => s.nodeId === 'n1')).toBe(true) // indexed again
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S6a a successful re-embed DELETES the skipped entry (index level: the next-touch retry clears it)', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([makeNode('n1', { content: 'first draft' })], embedFn)
      embedFn.failures.add('edited draft')
      await updateVectorIndex(index, makeNode('n1', { content: 'edited draft' }), embedFn) // transient skip
      expect(index.skipped.get('n1')).toBe('transient')
      // the next touch with a recovering embed → re-embed + the skipped entry is deleted
      await updateVectorIndex(index, makeNode('n1', { content: 'edited again' }), embedFn)
      expect(index.skipped.has('n1')).toBe(false)
      expect(index.skipped.size).toBe(0)
      expect(index.nodeIds).toContain('n1')
      expect(index.embeddings.get('n1')).toEqual(textEmbedding('edited again'))
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S8 removeFromVectorIndex clears ANY skipped entry (\'transient\' AND \'empty\')', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      // the 'transient' variant
      const indexT = await createVectorIndex([makeNode('n2', { content: 'alpha text' })], embedFn)
      embedFn.failures.add('new node text')
      await addToVectorIndex(indexT, makeNode('n1', { content: 'new node text' }), embedFn)
      expect(indexT.skipped.get('n1')).toBe('transient')
      removeFromVectorIndex(indexT, 'n1')
      expect(indexT.skipped.has('n1')).toBe(false)
      // the 'empty' variant
      const indexE = await createVectorIndex([makeNode('n2', { content: 'alpha text' })], embedFn)
      await addToVectorIndex(indexE, makeNode('n3', { content: '' }), embedFn)
      expect(indexE.skipped.get('n3')).toBe('empty')
      removeFromVectorIndex(indexE, 'n3')
      expect(indexE.skipped.has('n3')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// =========================================================================
// §5.3 W3 — UNIT-F-SKIP-EMPTY: the empty-content guard on ALL THREE paths
// =========================================================================

describe('W3 UNIT-F-SKIP-EMPTY — the empty-content guard (§5.3, §5.9 #45)', () => {
  it('S11 build: an empty/whitespace node is skipped + recorded \'empty\' (never embedded)', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([
        makeNode('n1', { content: '' }),
        makeNode('n2', { content: 'alpha text' }),
        makeNode('n3', { content: '   ' }),
      ], embedFn)
      expect(index.nodeIds).toEqual(['n2'])
      expect(index.skipped.get('n1')).toBe('empty')
      expect(index.skipped.get('n3')).toBe('empty')
      expect(index.skipped.size).toBe(2)
      // NO embed call was made for the empty/whitespace contents
      expect(embedFn.calls).toEqual(['alpha text'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S9 update-to-empty: the embedding is REMOVED, the id leaves nodeIds, skipped \'empty\', NO embed call for the empty content', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([
        makeNode('n1', { content: 'first draft' }),
        makeNode('n2', { content: 'other text' }),
      ], embedFn)
      expect(index.embeddings.has('n1')).toBe(true) // sanity
      const callsBefore = embedFn.calls.length
      for (const empty of ['', '   ', undefined] as string[]) {
        await updateVectorIndex(index, makeNode('n1', { content: empty as never }), embedFn) // resolves
      }
      expect(index.embeddings.has('n1')).toBe(false) // the embedding is removed
      expect(index.nodeIds).not.toContain('n1') // the id leaves nodeIds (the invariant wins)
      expect(index.nodeIds).toEqual(['n2'])
      expect(index.skipped.get('n1')).toBe('empty')
      expect(embedFn.calls.length).toBe(callsBefore) // NO embed call for the empty content
      expect(embedFn.calls).not.toContain('')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S10 add-empty: the node is NOT added, NO embed call, skipped \'empty\' (no malformed-response rejection)', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([makeNode('n2', { content: 'alpha text' })], embedFn)
      const callsBefore = embedFn.calls.length
      for (const empty of ['', '   '] as string[]) {
        await addToVectorIndex(index, makeNode('n1', { content: empty }), embedFn) // resolves
      }
      expect(index.nodeIds).toEqual(['n2']) // NOT added
      expect(index.embeddings.has('n1')).toBe(false)
      expect(index.skipped.get('n1')).toBe('empty')
      expect(embedFn.calls.length).toBe(callsBefore) // NO embed call
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('S12 \'empty\' is by-design permanent UNTIL the content becomes non-empty — a touch re-embeds + re-classifies (the entry clears)', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([makeNode('n2', { content: 'alpha text' })], embedFn)
      await addToVectorIndex(index, makeNode('n1', { content: '   ' }), embedFn)
      expect(index.skipped.get('n1')).toBe('empty')
      // the node's content later becomes non-empty; a normal touch re-embeds it
      await addToVectorIndex(index, makeNode('n1', { content: 'hello world' }), embedFn)
      expect(index.skipped.has('n1')).toBe(false) // re-classified
      expect(index.nodeIds).toContain('n1')
      expect(index.embeddings.get('n1')).toEqual(textEmbedding('hello world'))
      // the whitespace content was NEVER embedded; the non-empty content exactly once
      expect(embedFn.calls).toEqual(['alpha text', 'hello world'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// =========================================================================
// §5.3 W3 — THE VectorIndex 4-MEMBER SHAPE (members 3 → 4, §5.10)
// =========================================================================

describe('W3 VectorIndex shape — the `skipped` member (§5.3, §5.10)', () => {
  it('S1 the index literal has the 4-member shape: `skipped` present and an EMPTY Map when all nodes are indexed', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([
        makeNode('n1', { content: 'alpha text' }),
        makeNode('n2', { content: 'beta text' }),
      ], embedFn)
      expect(Object.keys(index).sort()).toEqual(['dimension', 'embeddings', 'nodeIds', 'skipped'])
      expect(index.skipped).toBeInstanceOf(Map)
      expect(index.skipped.size).toBe(0) // all nodes indexed → nothing skipped
      expect(index.nodeIds).toEqual(['n1', 'n2'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// =========================================================================
// §5.8 #34 — PARTIAL-INDEX QUERY SEMANTICS (the transient-skipped node scores 0)
// =========================================================================

describe('W3 partial-index query semantics (§5.8 #34)', () => {
  it('S13 a transient-skipped node scores 0 and is excluded from `ranked`; the indexed siblings are still served (partial-index, not empty)', async () => {
    const dir = freshDir()
    try {
      const store = makeStore(dir)
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      await store.putNode(makeNode('n2', { content: 'other text' }))
      const embedFn = makeScriptableEmbedFn()
      const index = await createVectorIndex([
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'other text' }),
      ], embedFn)
      // the transient failure: n1's re-embed after an edit is rejected
      embedFn.failures.add('edited draft')
      await updateVectorIndex(index, makeNode('n1', { content: 'edited draft' }), embedFn)
      // the mutated index drives the embedder (adopted as-is)
      const provider = makeScriptableProvider()
      const embedder = await createVectorEmbedder(store, { provider, index })
      const engine = createRetrieval(store, embedder)
      const result = await engine.query('other')
      expect(result.ranked.find((s) => s.nodeId === 'n1')).toBeUndefined() // scores 0 → excluded
      expect(result.ranked.some((s) => s.nodeId === 'n2')).toBe(true) // the indexed sibling IS served
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// =========================================================================
// §5.9 #47/#48 — THE W3-UNCHANGED PINS (must stay GREEN)
// =========================================================================

describe('W3-UNCHANGED pins (§5.9 #47/#48)', () => {
  it('F1 #47: the required-arg rejections are UNCHANGED (§5.9 #19–21)', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      await expect(createVectorIndex(null as never, embedFn)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      await expect(createVectorIndex(undefined as never, embedFn)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      await expect(createVectorIndex([], null as never)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      await expect(createVectorIndex([], undefined as never)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      const index = await createVectorIndex([], embedFn)
      const node = makeNode('n1')
      await expect(updateVectorIndex(null as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(undefined as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, null as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, undefined as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, node, null as never)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, node, undefined as never)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(null as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(undefined as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, null as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, undefined as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, node, null as never)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, node, undefined as never)).rejects.toThrow('vector index: index/node/embedFn required')
      expect(() => removeFromVectorIndex(null as never, 'n1')).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(undefined as never, 'n1')).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(index, null as never)).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(index, undefined as never)).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(index, 42 as never)).toThrow('vector index: index/nodeId required')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F2 #48: a provider rejecting at score/place time STILL propagates (also from RetrievalEngine.query)', async () => {
    const dir = freshDir()
    try {
      const store = makeStore(dir)
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const embedFn = makeScriptableEmbedFn()
      const prebuilt = await createVectorIndex([makeNode('n1', { content: 'hello world' })], embedFn)
      const provider = makeScriptableProvider()
      provider.failures.add('hello') // the QUERY text only — the index is warm
      const embedder = await createVectorEmbedder(store, { provider, index: prebuilt })
      await expect(embedder.score('hello', store.listNodes())).rejects.toThrow('provider down')
      await expect(embedder.place('hello', store.listNodes(), [])).rejects.toThrow('provider down')
      const engine = createRetrieval(store, embedder)
      await expect(engine.query('hello')).rejects.toThrow('provider down')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// =========================================================================
// §3a W3 adversarial regression (RCA-3 pass 2 — 2026-09-05): F1/F3 are HOST
// code fixes (red→green here); F2/F4/F6a/F6b pin the registered taxonomy /
// pinned strings / previously-unasserted W3 behaviors.
// =========================================================================

describe('W3 adversarial regression (RCA-3 pass 2: F1/F3 fixes + F2/F4/F6 pins)', () => {
  it('F1: a node DELETED while transient-skipped has its stale skipped entry cleared by the hook delete branch (§5.3 — a delete removes the entry, unconditionally)', async () => {
    const dir = freshDir()
    try {
      const store = makeStore(dir)
      await store.putNode(makeNode('n1', { content: 'doomed text' }))
      const provider = makeScriptableProvider()
      provider.failures.add('doomed text')
      // adopt a prebuilt index (n2 only) → the hook touches are the only embeds
      const prebuilt = await createVectorIndex([makeNode('n2', { content: 'other text' })], makeScriptableEmbedFn())
      const embedder = await createVectorEmbedder(store, { provider, index: prebuilt })
      // touch n1 while its embed fails → a transient skip (NOT in nodeIds)
      await embedder.onStoreChanged!('content', ['n1'], [])
      expect(prebuilt.skipped.get('n1')).toBe('transient')
      expect(prebuilt.nodeIds).not.toContain('n1')
      // the node is DELETED from the store; the hook learns of the delete
      await store.removeNode('n1')
      await embedder.onStoreChanged!('structural', ['n1'], [])
      // the stale skipped entry is CLEARED (never a forever-record)
      expect(prebuilt.skipped.has('n1')).toBe(false)
      expect(prebuilt.skipped.size).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F2 taxonomy (§3a): a systematic post-warm-up dimension-mismatch rejection → an ALL-transient build that RESOLVES, every node \'transient\', the census transient = N, and the engine STILL promotes (§5.8 #34 empty-ranked semantics)', async () => {
    const dir = freshDir()
    try {
      const console_ = captureConsole()
      const store = makeStore(dir)
      await store.putNode(makeNode('n1', { content: 'alpha text' }))
      await store.putNode(makeNode('n2', { content: 'beta text' }))
      await store.putNode(makeNode('n3', { content: 'gamma text' }))
      const provider = makeScriptableProvider()
      // a SYSTEMATIC provider-channel malformation: EVERY node-content embed
      // rejects with a dimension-mismatch error (post-warm-up). The query text
      // embeds fine — the rejection is about the provider's response shape.
      const realEmbed = provider.embed.bind(provider)
      provider.embed = async (text: string) => {
        if (['alpha text', 'beta text', 'gamma text'].includes(text)) {
          throw new Error('ollama embed: dimension mismatch (expected 4, got 7)')
        }
        return realEmbed(text)
      }
      const boot = createVectorBootController(store, provider)
      const report = await boot.start() // RESOLVES — never a total build failure
      expect(boot.skipped().get('n1')).toBe('transient')
      expect(boot.skipped().get('n2')).toBe('transient')
      expect(boot.skipped().get('n3')).toBe('transient')
      expect(boot.skipped().size).toBe(3)
      expect(report.skipped.transient).toBe(3)
      expect(report.skipped.empty).toBe(0)
      expect(report.embedded).toBe(0)
      expect(boot.phase()).toBe('promoted') // the empty-index promotion
      // the census is loud: the build-complete line reports transient 3
      expect(console_.lines.some((l) => l.includes('skipped empty 0 / transient 3'))).toBe(true)
      // §5.8 #34 empty-ranked semantics: no node has a vector → ranked is EMPTY
      const result = await boot.engine.query('alpha')
      expect(result.ranked).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F3: an index at dimension 0 (the post-outage shape) LATCHES its dimension on the first successful maintenance add (and update); a subsequent wrong-length add rejects the F6 message', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      embedFn.failures.add('n1 text')
      embedFn.failures.add('n2 text')
      const index = await createVectorIndex([
        makeNode('n1', { content: 'n1 text' }),
        makeNode('n2', { content: 'n2 text' }),
      ], embedFn)
      expect(index.nodeIds).toEqual([]) // the all-transient build
      expect(index.dimension).toBe(0) // never latched by the build
      // a SUCCESSFUL maintenance add latches the dimension
      await addToVectorIndex(index, makeNode('n3', { content: 'gamma text' }), embedFn)
      expect(index.dimension).toBe(4)
      expect(index.nodeIds).toEqual(['n3'])
      // a subsequent WRONG-LENGTH add rejects with the F6 message (no poison)
      const wrongDim: EmbedTextFn = async () => new Array(8).fill(1)
      await expect(addToVectorIndex(index, makeNode('n4', { content: 'wrong text' }), wrongDim))
        .rejects.toThrow('addToVectorIndex: dimension mismatch (expected 4, got 8)')
      expect(index.nodeIds).toEqual(['n3']) // the wrong-length vector never lands
      expect(index.skipped.has('n4')).toBe(false) // an F6 rejection is hard, not a skip
      // the update path latches too (a dimension-0 index with the node in
      // nodeIds — the re-embed succeeds → the dimension latches)
      const zeroDim: VectorIndex = {
        nodeIds: ['n9'],
        embeddings: new Map(),
        dimension: 0,
        skipped: new Map(),
      }
      await updateVectorIndex(zeroDim, makeNode('n9', { content: 'fresh text' }), embedFn)
      expect(zeroDim.dimension).toBe(4)
      expect(zeroDim.embeddings.get('n9')).toEqual(textEmbedding('fresh text'))
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F4: the transient-skip warning carries the re-pinned prefix \'vector index: node embed failed (transient)\' + the node id (§5.12 re-pinned 2026-09-05)', async () => {
    const dir = freshDir()
    try {
      const console_ = captureConsole()
      const embedFn = makeScriptableEmbedFn()
      embedFn.failures.add('cursed text')
      await createVectorIndex([makeNode('n-fail', { content: 'cursed text' })], embedFn)
      const line = console_.lines.find((l) => l.includes('n-fail'))
      expect(line).toBeDefined()
      expect(line).toContain('vector index: node embed failed (transient)')
      expect(line).toContain('n-fail')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F6a: the BATCH build path records the UNIT-F-SKIP-EMPTY \'empty\' skip — the empty node is never batched (§5.3 batch build path + the guard)', async () => {
    const dir = freshDir()
    try {
      const embedFn = makeScriptableEmbedFn()
      const batchCalls: string[][] = []
      const index = await createVectorIndex([
        makeNode('n1', { content: 'alpha text' }),
        makeNode('n2', { content: '' }),
        makeNode('n3', { content: 'beta text' }),
      ], embedFn, async (texts) => {
        batchCalls.push(texts)
        return texts.map((t) => textEmbedding(t))
      })
      expect(index.skipped.get('n2')).toBe('empty')
      expect(index.skipped.size).toBe(1)
      expect(index.nodeIds).toEqual(['n1', 'n3'])
      // the empty content NEVER reached the provider (not in the batch texts),
      // and the per-item embed fn was never needed (the batch succeeded)
      expect(batchCalls).toEqual([['alpha text', 'beta text']])
      expect(embedFn.calls).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F6b: a rejected chunk falls back per-item AND the per-item fallback embeds ALSO reject → EVERY text is transient-skipped and the build RESOLVES (§5.3 per-chunk fallback isolation × the W3 flip)', async () => {
    const dir = freshDir()
    try {
      const console_ = captureConsole()
      const embedFn = makeScriptableEmbedFn()
      embedFn.failures.add('alpha text')
      embedFn.failures.add('beta text')
      const index = await createVectorIndex([
        makeNode('n1', { content: 'alpha text' }),
        makeNode('n2', { content: 'beta text' }),
      ], embedFn, async () => { throw new Error('batch exploded') })
      // the build RESOLVES with an empty index: each text transient-skipped
      expect(index.nodeIds).toEqual([])
      expect(index.skipped.get('n1')).toBe('transient')
      expect(index.skipped.get('n2')).toBe('transient')
      expect(index.skipped.size).toBe(2)
      expect(index.dimension).toBe(0)
      // the per-item fallback actually ran — each text embedded exactly once
      expect(embedFn.calls).toEqual(['alpha text', 'beta text'])
      // each fallback rejection was warned with the pinned prefix + the id
      expect(console_.lines.some((l) => l.includes('vector index: node embed failed (transient)') && l.includes('n1'))).toBe(true)
      expect(console_.lines.some((l) => l.includes('vector index: node embed failed (transient)') && l.includes('n2'))).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })
})