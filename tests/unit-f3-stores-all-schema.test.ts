// tests/unit-f3-stores-all-schema.test.ts — Unit F3: the `stores:"all"` schema +
// the MCP/IPC wiring (cross-store fan-out).
//
// The RED set derived from docs/specs/unit-f3-stores-all-schema.md's §5.2 (the
// guards), §5.3 (the fan-out flow), §5.4 (the audit), §5.5 (the rag-stream
// fan-out), §5.6 (the rag-query IPC), §5.8 (happy-path states) + §5.9
// (fail-states).
//
// The `mergeStoreResults` (U-F1, src/main/merge-store-results.ts) +
// `qualifyStoreResult` (U-F2, src/main/retrieval.ts) CONSUMERS are LANDED
// (green). The RED here is the MISSING `stores:"all"` wiring in
// src/main/mcp-server.ts:
//   - the rag.query/rag-stream inputSchema `stores` field is ABSENT (§5.1)
//   - the four §5.2 guards are ABSENT (mutual-exclusion, stores-value,
//     dir==null, flat-only)
//   - the §5.3 fan-out is ABSENT (handleRagTool does NOT iterate dir.entries and
//     does NOT merge/qualify)
//   - `handleRagQueryIpc` does NOT forward `stores` (§5.6)
//   - `RagQueryPayload.stores?` + `QueryAuditEntry.stores?` additions are ABSENT.
//
// So every test below that exercises `stores:"all"` is RED: `handleRagTool`
// currently IGNORES the `stores` arg and runs the SINGLE-store path, so the
// guards don't throw, the merged+qualified shape is absent, and the audit lacks
// the `stores` key. The single-store byte-equality rows (§5.8-8/9) are GREEN-ON-
// ARRIVAL (guards) confirming the §5.1 additive fields are gated to
// `stores:"all"`.
//
// Convention: follows tests/unit-ms2-store-wiring.test.ts + unit-f1 +
// unit-f2 (vitest node environment, `.js` import suffix for the main-process ESM
// module, byte-exact message assertions via catch + toBe / rejects.toThrow —
// toThrowMessage would be substring-only). The multi-store directory is a MARKER
// directory (hand-built `RagStoreDirectory` whose entries carry marker engines
// returning deterministic `RagResult`s) — the sanctioned wiring shortcut. Each
// marker engine's result object is a STABLE reference, so the fan-out's
// merge-by-reference + qualify-by-reference (U-F2 §5.3.1) attributes correctly.
// No real userData paths are touched; every file-touching case sits in a
// mkdtemp temp dir.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  handleRagTool,
  handleRagQueryIpc,
} from '../src/main/mcp-server.js'
import {
  createQueryAuditLog,
  type QueryAuditEntry,
  type QueryAuditLog,
} from '../src/main/query-audit.js'
import {
  type RetrievalEngine,
  type RetrievalResult,
  type RagResult,
  type RagResultItem,
  type RagNode,
  type StoreContextBlock,
} from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'
import type { RagStoreDirectory, RagStoreEntry } from '../src/main/rag-store-directory.js'

// ---------------------------------------------------------------------------
// The byte-pinned guard/fail messages (§5.2, §5.9, §5.10 census).
// ---------------------------------------------------------------------------
const MUTUAL_EXCLUSION_ERROR = 'rag.query: store and stores are mutually exclusive'
const STORES_VALUE_ERROR = 'rag.query: stores must be "all"'
const REGISTRY_REQUIRED_ERROR = 'rag.query: stores:"all" requires a configured store registry'
const FLAT_ONLY_ERROR = 'rag.query: stores:"all" is only valid in flat mode'
const DEFAULT_STORE_REQUIRED_ERROR = 'mergeStoreResults: default store result required'

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------

function makeNode(id: string): RagNode {
  const now = '2026-09-08T00:00:00.000Z'
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now }
}

function item(documentId: string, nodeId: string, score: number): RagResultItem {
  return { documentId, nodeId, score, snippet: `snip-${nodeId}`, source: 'local' }
}

/** A deterministic per-store `RagResult` (stable object references — the
 *  merge/qualify attribution-by-reference basis). */
function storeResult(nodeItems: RagResultItem[], markdown: string, k = 5): RagResult {
  return {
    query: 'shared query',
    results: nodeItems,
    engine: 'local',
    citations: nodeItems.map((i) => ({ documentId: i.documentId, nodeId: i.nodeId })),
    trace: { mode: 'flat', engine: 'local', topK: k, source: 'local' },
    ranked: nodeItems.map((i) => ({ nodeId: i.nodeId, score: i.score })),
    context: nodeItems.map((i) => makeNode(i.nodeId)),
    markdown,
    lineMap: { ranges: [] },
    k,
  }
}

/** A marker engine double: returns the SAME `result` object every call (or
 *  throws `engine-fail` when `fail`), so a directory-routed fan-out provably
 *  used the ENTRY's engine and the exact per-store inputs. Cast through
 *  unknown: the double bypasses createRetrieval's F3 stamping — handleRagTool
 *  itself is the ONE stamp point. */
function markerEngine(result: RetrievalResult, fail = false): RetrievalEngine {
  return {
    query: async () => {
      if (fail) throw new Error('engine-fail')
      return result
    },
    onStoreChanged: async () => {},
    setEmbedder: () => {},
  } as unknown as RetrievalEngine
}

/** A hand-built multi-store directory carrying marker engines. The entries' `store`
 *  slots are unused by the fan-out (handleRagTool addresses `entry.engine`);
 *  `resolveStoreArg` reads only `entries.has` + `defaultName`. */
function directory(specs: Array<{ name: string; engine: RetrievalEngine; default?: boolean }>): RagStoreDirectory {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    entries.set(s.name, {
      name: s.name,
      store: null as unknown as RagStore,
      engine: s.engine,
      corrupt: false,
      missing: false,
    })
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

/** A non-null `RagStore` for the `handleRagTool` first arg (the top null-store
 *  guard). A fresh mkdtemp dir, removed in `finally`. */
async function withStore<T>(run: (store: RagStore) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-f3-'))
  try {
    return await run(createJsonRagStore({ path: join(dir, 'rag.json') }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// The canonical names shared by the fan-out rows.
const DEFAULT_NAME = 'main'
const WIKI_NAME = 'wiki'
const NOTES_NAME = 'notes'

// The deterministic per-store item sets.
const A1 = item('dA', 'a1', 1)
const A2 = item('dA', 'a2', 0.8)
const B1 = item('dB', 'b1', 0.9)
const B2 = item('dB', 'b2', 0.7)
const C1 = item('dC', 'c1', 0.6)

/** The canonical audit stores array helper. Reads `stores` off a returned
 *  entry (the field does not exist on the current `QueryAuditEntry` type — the
 *  §5.1 A-F2 addition; cast to observe the runtime key). */
function enteredWithStores(e: QueryAuditEntry): QueryAuditEntry & { stores?: string[] } {
  return e as QueryAuditEntry & { stores?: string[] }
}

// ---------------------------------------------------------------------------
// §5.2 — the four `stores:"all"` guards, each in the rag.query throw form + the
// rag-stream error-chunk form. Every row is RED (no guards exist → the calls run
// the single-store path and do NOT fail).
// ---------------------------------------------------------------------------
describe('§5.2 — Guard 1: `store` + `stores` mutual exclusion (A-F3)', () => {
  it('01. rag.query — { store:"main", stores:"all", query:"q" } rejects with EXACTLY "rag.query: store and stores are mutually exclusive"', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(
        handleRagTool(store, 'rag.query', { query: 'q', store: DEFAULT_NAME, stores: 'all' }, null, dir),
      ).rejects.toThrow(MUTUAL_EXCLUSION_ERROR)
    })
  })

  it('02. rag-stream — { store:"main", stores:"all", query:"q" } → the error chunk [{ type:"error", error:"rag.query: store and stores are mutually exclusive" }]', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(
        handleRagTool(store, 'rag-stream', { query: 'q', store: DEFAULT_NAME, stores: 'all' }, null, dir),
      ).resolves.toEqual([{ type: 'error', error: MUTUAL_EXCLUSION_ERROR }])
    })
  })

  it('03. ordering pin — mutual exclusion is the FIRST stores guard (A-F3): { store:"main", stores:"foo" } throws the mutual-exclusion message, NOT "stores must be all"', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(
        handleRagTool(store, 'rag.query', { query: 'q', store: DEFAULT_NAME, stores: 'foo' }, null, dir),
      ).rejects.toThrow(MUTUAL_EXCLUSION_ERROR)
    })
  })

  it('04. ordering pin — the stores-value guard (2) is evaluated BEFORE the flat-only guard (4): { stores:"foo", mode:"graph" } throws "stores must be all"', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(
        handleRagTool(store, 'rag.query', { query: 'q', stores: 'foo', mode: 'graph' }, null, dir),
      ).rejects.toThrow(STORES_VALUE_ERROR)
    })
  })
})

describe('§5.2 — Guard 2: the `stores` value must be the string "all" (the defensive mirror of the zod enum)', () => {
  it('05. rag.query — { stores:"foo", query:"q" } rejects with EXACTLY "rag.query: stores must be \"all\""', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(handleRagTool(store, 'rag.query', { query: 'q', stores: 'foo' }, null, dir)).rejects.toThrow(
        STORES_VALUE_ERROR,
      )
    })
  })

  it("06. rag.stream — { stores:\"foo\", query:\"q\" } → the error chunk [{ type:\"error\", error:\"rag.query: stores must be \\\"all\\\"\" }]", async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(handleRagTool(store, 'rag-stream', { query: 'q', stores: 'foo' }, null, dir)).resolves.toEqual([
        { type: 'error', error: STORES_VALUE_ERROR },
      ])
    })
  })
})

describe('§5.2 — Guard 3: `stores:"all"` + `dir == null`/undefined (no registry) → the legacy fail-loud, BEFORE any engine call (A-F3)', () => {
  it('07. rag.query — { stores:"all", query:"q" } with dir null rejects with EXACTLY "rag.query: stores:\\"all\\" requires a configured store registry"', async () => {
    await withStore(async (store) => {
      await expect(handleRagTool(store, 'rag.query', { query: 'q', stores: 'all' }, markerEngine(storeResult([A1], 'md-main')), null))
        .rejects.toThrow(REGISTRY_REQUIRED_ERROR)
    })
  })

  it('08. rag-stream — { stores:"all", query:"q" } with dir null → the error chunk [{ type:"error", error:"rag.query: stores:\\"all\\" requires a configured store registry" }]', async () => {
    await withStore(async (store) => {
      await expect(
        handleRagTool(store, 'rag-stream', { query: 'q', stores: 'all' }, markerEngine(storeResult([A1], 'md-main')), null),
      ).resolves.toEqual([{ type: 'error', error: REGISTRY_REQUIRED_ERROR }])
    })
  })

  it("09. dir == undefined (omitted) is the SAME legacy sentinel — the same fail-loud message", async () => {
    await withStore(async (store) => {
      await expect(handleRagTool(store, 'rag.query', { query: 'q', stores: 'all' }, markerEngine(storeResult([A1], 'md-main'))))
        .rejects.toThrow(REGISTRY_REQUIRED_ERROR)
    })
  })
})

describe('§5.2 — Guard 4: `stores:"all"` + `mode:"graph"` → the flat-only guard (D4)', () => {
  it('10. rag.query — { stores:"all", mode:"graph", query:"q" } rejects with EXACTLY "rag.query: stores:\\"all\\" is only valid in flat mode"', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(handleRagTool(store, 'rag.query', { query: 'q', stores: 'all', mode: 'graph' }, null, dir)).rejects.toThrow(
        FLAT_ONLY_ERROR,
      )
    })
  })

  it("11. rag-stream — { stores:\"all\", mode:\"graph\", query:\"q\" } → the error chunk [{ type:\"error\", error:\"rag.query: stores:\\\"all\\\" is only valid in flat mode\" }]", async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(handleRagTool(store, 'rag-stream', { query: 'q', stores: 'all', mode: 'graph' }, null, dir)).resolves.toEqual([
        { type: 'error', error: FLAT_ONLY_ERROR },
      ])
    })
  })

  it('12. flat-only guard passes when mode is OMITTED or "flat": stores:"all" in flat mode is allowed (the fan-out never runs in graph mode)', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
      ])
      const omitted = (await handleRagTool(store, 'rag.query', { query: 'q', stores: 'all' }, null, dir)) as {
        storeContexts?: StoreContextBlock[]
      }
      expect(omitted.storeContexts).toBeDefined()
      const flat = (await handleRagTool(store, 'rag.query', { query: 'q', stores: 'all', mode: 'flat' }, null, dir)) as {
        storeContexts?: StoreContextBlock[]
      }
      expect(flat.storeContexts).toBeDefined()
    })
  })
})

// ---------------------------------------------------------------------------
// §5.3 — the fan-out flow (`rag.query` case). Happy states §5.8-1/2/3/4 + D7.
// Every row asserts the merged+qualified shape, so they are RED (the fan-out is
// absent: the current single-store result has no storeContexts, no per-item
// store, and only the default store's items).
// ---------------------------------------------------------------------------
describe('§5.3 — the `stores:"all"` rag.query fan-out (§5.8-1..4, D7)', () => {
  it('§5.8-1. two stores equal length (main default [a1,a2] + wiki [b1,b2]): returned results = [a1,b1,a2,b2] interleave, each item stamped with its bare registry store, storeContexts = default-first [main,wiki], engine "local", NO blockedBy, top-level store = the default registry name (non-\'\')', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1, B2], 'md-wiki')) },
      ])
      const result = (await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir)) as RagResult & {
        store?: string
      }
      expect(result.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2', 'b2'])
      expect(result.results.map((i) => i.store)).toEqual(['main', 'wiki', 'main', 'wiki'])
      expect(result.engine).toBe('local')
      expect((result as Record<string, unknown>).blockedBy).toBeUndefined()
      expect(result.store).toBe('main')
      expect(result.storeContexts).toBeDefined()
      expect(result.storeContexts!.map((b) => b.store)).toEqual(['main', 'wiki'])
      expect(result.storeContexts![0].markdown).toBe('md-main')
      expect(result.storeContexts![1].markdown).toBe('md-wiki')
    })
  })

  it('§5.8-2. a failed NON-default store (D6): wiki throws → SKIPPED ({ name, result:null }), the merged results contain ONLY main\'s [a1] + notes\'s [c1] ([a1,c1]), NO wiki storeContexts block, NO throw', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki'), true) },
        { name: NOTES_NAME, engine: markerEngine(storeResult([C1], 'md-notes')) },
      ])
      const result = (await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir)) as RagResult
      expect(result.results.map((i) => i.nodeId)).toEqual(['a1', 'c1'])
      expect(result.results.map((i) => i.store)).toEqual(['main', 'notes'])
      expect(result.storeContexts!.map((b) => b.store)).toEqual(['main', 'notes'])
    })
  })

  it('§5.8-3. an empty NON-default store (D6): wiki returns [] → contributes ZERO items but STILL contributes a (possibly empty) storeContexts block', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([], 'md-wiki')) },
      ])
      const result = (await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir)) as RagResult
      expect(result.results.map((i) => i.nodeId)).toEqual(['a1'])
      expect(result.storeContexts!.map((b) => b.store)).toEqual(['main', 'wiki'])
      expect(result.storeContexts![1].results ?? result.storeContexts![1].context).toBeDefined()
    })
  })

  it('§5.8-4. a single store in the registry: only the default entry → the merged results = that store\'s items, storeContexts = one block, top-level store = its registry name', async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true }])
      const result = (await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir)) as RagResult & {
        store?: string
      }
      expect(result.results.map((i) => i.nodeId)).toEqual(['a1', 'a2'])
      expect(result.results.map((i) => i.store)).toEqual(['main', 'main'])
      expect(result.storeContexts!.map((b) => b.store)).toEqual(['main'])
      expect(result!.store).toBe('main')
    })
  })

  it('D7 — registry-insertion-order iteration (the default NOT first): entries [wiki, main(default)] → the audit `stores` = canonical order ["wiki","main"], but the merge/qualify `stores` array is default-FIRST so storeContexts[0].store = "main"', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
      ])
      const log: QueryAuditLog = createQueryAuditLog()
      await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir, log)
      const result = (await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir, log)) as RagResult
      // the merge/qualify array is default-FIRST → the default block is index 0
      expect(result.storeContexts![0].store).toBe('main')
      // the audit `stores` array is the canonical INSERTION order (D7, distinct)
      const { entries } = (await handleRagTool(store, 'get_query_audit_log', {}, null, dir, log)) as { entries: QueryAuditEntry[] }
      expect(entries[0]).toBeDefined()
      expect(enteredWithStores(entries[0]).stores).toEqual(['wiki', 'main'])
    })
  })

  it('§5.8-10. determinism (D7): two identical stores:"all" fan-out calls over the same registry → the SAME merged+qualified result (twice) + the same audit entry', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1, B2], 'md-wiki')) },
      ])
      const log: QueryAuditLog = createQueryAuditLog()
      const first = await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir, log)
      const second = await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir, log)
      expect(first).toEqual(second)
      expect((first as RagResult).storeContexts).toBeDefined()
      const { entries } = (await handleRagTool(store, 'get_query_audit_log', {}, null, dir, log)) as { entries: QueryAuditEntry[] }
      expect(entries[0]).toBeDefined()
      expect(enteredWithStores(entries[0]).stores).toEqual(['main', 'wiki'])
    })
  })
})

// ---------------------------------------------------------------------------
// §5.4 — the audit recording (D4/A-F2). Happy state §5.8-5. RED (no `stores`
// key + the resultCount is the single-store count, not the merged count).
// ---------------------------------------------------------------------------
describe('§5.4 — the merged audit entry for `stores:"all"` (§5.8-5)', () => {
  it('§5.8-5. the fan-out records ONE entry: resultCount = the MERGED count (4 for [a1,b1,a2,b2]) + `stores` = the canonical-order store names + mode "flat"', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1, B2], 'md-wiki')) },
      ])
      const log: QueryAuditLog = createQueryAuditLog()
      await handleRagTool(store, 'rag.query', { query: 'q', topK: 5, stores: 'all' }, null, dir, log)
      const { entries } = (await handleRagTool(store, 'get_query_audit_log', {}, null, dir, log)) as { entries: QueryAuditEntry[] }
      expect(entries).toHaveLength(1)
      expect(entries[0].mode).toBe('flat')
      expect(entries[0].resultCount).toBe(4)
      expect(enteredWithStores(entries[0]).stores).toEqual(['main', 'wiki'])
    })
  })

  it('pinned non-throw (§5.4) — auditLog null/absent: the fan-out still returns (recording is SKIPPED, no throw)', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
      ])
      await expect(handleRagTool(store, 'rag.query', { query: 'q', stores: 'all' }, null, dir)).resolves.toBeDefined()
    })
  })
})

// ---------------------------------------------------------------------------
// §5.5 — the `rag-stream` fan-out (A-F4). Happy state §5.8-6. RED.
// ---------------------------------------------------------------------------
describe('§5.5 — the `rag-stream` fan-out (§5.8-6)', () => {
  it("§5.8-6. stores:\"all\" → { result: qualified } chunk carries the merged+qualified RagResult with NO top-level store field; per-item store + storeContexts present; then done", async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1, B2], 'md-wiki')) },
      ])
      const stream = (await handleRagTool(store, 'rag-stream', { query: 'q', topK: 5, stores: 'all' }, null, dir)) as Array<
        { type: string; result?: RagResult; error?: string }
      >
      expect(stream).toHaveLength(2)
      expect(stream[0].type).toBe('result')
      const r = stream[0].result!
      // the stream surface returns the bare result — NO top-level store stamp
      expect((r as Record<string, unknown> & { store?: string }).store).toBeUndefined()
      expect(r.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2', 'b2'])
      expect(r.results.map((i) => i.store)).toEqual(['main', 'wiki', 'main', 'wiki'])
      expect(r.storeContexts!.map((b) => b.store)).toEqual(['main', 'wiki'])
      expect(stream[1]).toEqual({ type: 'done' })
    })
  })

  it('§5.5 — the stream audit is IDENTICAL to the rag.query fan-out (§5.4): one entry, merged resultCount, optional stores', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1, B2], 'md-wiki')) },
      ])
      const log: QueryAuditLog = createQueryAuditLog()
      await handleRagTool(store, 'rag-stream', { query: 'q', topK: 5, stores: 'all' }, null, dir, log)
      const { entries } = (await handleRagTool(store, 'get_query_audit_log', {}, null, dir, log)) as { entries: QueryAuditEntry[] }
      expect(entries).toHaveLength(1)
      expect(entries[0].resultCount).toBe(4)
      expect(enteredWithStores(entries[0]).stores).toEqual(['main', 'wiki'])
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 — the `rag-query` IPC forward (A-F4, MCP/UI equivalence). Happy state
// §5.8-7 + the IPC fail-states §5.9-6/7. RED (`handleRagQueryIpc` does not
// forward `stores` → the UI path runs the single-store query).
// ---------------------------------------------------------------------------
describe('§5.6 — the `rag-query` IPC `stores` forward (§5.8-7, §5.9-6/7)', () => {
  it("§5.8-7. handleRagQueryIpc(..., { query, topK, stores:'all' }, dir, auditLog) → the SAME merged+qualified result + the SAME merged audit entry as the MCP rag.query tool (equivalence)", async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1, A2], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1, B2], 'md-wiki')) },
      ])
      const log: QueryAuditLog = createQueryAuditLog()
      const result = (await handleRagQueryIpc(
        null,
        store,
        { query: 'q', topK: 5, stores: 'all' },
        dir,
        log,
      )) as RagResult & { store?: string }
      expect(result.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2', 'b2'])
      expect(result.storeContexts!.map((b) => b.store)).toEqual(['main', 'wiki'])
      // the IPC result carries the default entry's registry name stamp (§5.3 step 4)
      expect(result.store).toBe('main')
      const { entries } = (await handleRagTool(store, 'get_query_audit_log', {}, null, dir, log)) as { entries: QueryAuditEntry[] }
      expect(entries).toHaveLength(1)
      expect(entries[0].resultCount).toBe(4)
      expect(enteredWithStores(entries[0]).stores).toEqual(['main', 'wiki'])
    })
  })

  it('§5.9-6. the IPC with stores:"all" + a null dir rejects with EXACTLY "rag.query: stores:\\"all\\" requires a configured store registry" (A-F3)', async () => {
    await withStore(async (store) => {
      await expect(
        handleRagQueryIpc(markerEngine(storeResult([A1], 'md-main')), store, { query: 'q', topK: 5, stores: 'all' }, null),
      ).rejects.toThrow(REGISTRY_REQUIRED_ERROR)
    })
  })

  it("§5.9-7. the IPC with stores:\"all\" + store both set rejects with EXACTLY \"rag.query: store and stores are mutually exclusive\"", async () => {
    await withStore(async (store) => {
      const dir = directory([{ name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true }])
      await expect(
        handleRagQueryIpc(null, store, { query: 'q', topK: 5, store: DEFAULT_NAME, stores: 'all' }, dir),
      ).rejects.toThrow(MUTUAL_EXCLUSION_ERROR)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.9 — the default-store failure fail-state (§5.9-5).
// ---------------------------------------------------------------------------
describe('§5.9 — Guard 5: the default store\'s engine throws → the merge fail-state surfaces (§5.9-5)', () => {
  it("rag.query — a failed DEFAULT store → rejects with EXACTLY \"mergeStoreResults: default store result required\"", async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main'), true), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
      ])
      await expect(handleRagTool(store, 'rag.query', { query: 'q', stores: 'all' }, null, dir)).rejects.toThrow(
        DEFAULT_STORE_REQUIRED_ERROR,
      )
    })
  })

  it("rag-stream — a failed DEFAULT store → the error chunk [{ type:\"error\", error:\"mergeStoreResults: default store result required\" }]", async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main'), true), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
      ])
      await expect(handleRagTool(store, 'rag-stream', { query: 'q', stores: 'all' }, null, dir)).resolves.toEqual([
        { type: 'error', error: DEFAULT_STORE_REQUIRED_ERROR },
      ])
    })
  })
})

// ---------------------------------------------------------------------------
// §5.8-8/9 — the single-store byte-equality reconciliation (A-F1/A-F4). GREEN-
// ON-ARRIVAL: a `stores`-OMITTED query stays byte-equal to today (no per-item
// store, no storeContexts, no `stores` audit key). The fan-out is gated to
// `stores:"all"`.
// ---------------------------------------------------------------------------
describe('§5.8-8/9 — single-store byte-equality: the §5.1 additive fields are gated to stores:"all" (GREEN-ON-ARRIVAL)', () => {
  it('§5.8-8. a stores-omitted rag.query over a directory is byte-equal to today: NO per-item store, NO storeContexts; the audit entry has NO `stores` key (absent)', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
      ])
      const log: QueryAuditLog = createQueryAuditLog()
      const result = (await handleRagTool(store, 'rag.query', { query: 'q' }, null, dir, log)) as RagResult
      // no additive store fields / no storeContexts, per-item items carry no `store`
      expect(result.results).toHaveLength(1)
      expect(result.results[0]).not.toHaveProperty('store')
      expect((result as Record<string, unknown>).storeContexts).toBeUndefined()
      expect(result.citations[0]).not.toHaveProperty('store')
      const { entries } = (await handleRagTool(store, 'get_query_audit_log', {}, null, dir, log)) as { entries: QueryAuditEntry[] }
      expect(entries).toHaveLength(1)
      expect(enteredWithStores(entries[0]).stores).toBeUndefined()
    })
  })

  it('§5.8-9. `store` present with `stores` OMMITTED (the single-store selector path): the fan-out does NOT run — byte-equal to today', async () => {
    await withStore(async (store) => {
      const dir = directory([
        { name: DEFAULT_NAME, engine: markerEngine(storeResult([A1], 'md-main')), default: true },
        { name: WIKI_NAME, engine: markerEngine(storeResult([B1], 'md-wiki')) },
      ])
      const result = (await handleRagTool(store, 'rag.query', { query: 'q', store: WIKI_NAME }, null, dir)) as RagResult & {
        store?: string
      }
      // addressed the wiki store — only its items returned, no fan-out attribution
      expect(result.results.map((i) => i.nodeId)).toEqual(['b1'])
      expect(result.results[0]).not.toHaveProperty('store')
      expect((result as Record<string, unknown>).storeContexts).toBeUndefined()
      expect(result.store).toBe('wiki')
    })
  })
})
