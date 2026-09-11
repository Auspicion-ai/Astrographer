// tests/props-a1-crud-routing-proxy.test.ts — Unit A1: the §5.7 PBT register
// (8 rows) for the document-CRUD routing proxy
// (`src/main/engine-crud-rag-store.ts`).
// (docs/specs/unit-a1-crud-routing-proxy.md §5.7 — the register; the frozen
// wire shapes + golden vectors V-10..V-12 + §10 decode-then-validate in
// ../Gnosis/docs/specs/p1a-document-crud-wire.md.)
//
// Deterministic pinned seed 0xA1A1A1A1 (the unit's mnemonic "A1"), ≤100
// attempts/row, ≤400 total, stop-after-5. Each row is reported held/broken
// with its Strategy-id.
//
// RED: `src/main/engine-crud-rag-store.ts` does NOT exist yet, so the static
// import fails to resolve — the ENTIRE register is the red set (the file fails
// to load).
import { describe, it, expect } from 'vitest'
import {
  encodeCrudRequest,
  decodeCrudRequest,
  decodeCrudResponse,
  validateCrudResult,
  ENGINE_CRUD_ENDPOINTS,
  type CrudMethod,
  type CrudRequestArgs,
  type CrudResult,
  type Document,
  type DocumentSummary,
} from '../src/main/engine-crud-rag-store.js'
import {
  EngineWireError,
  EngineError,
  ConflictError,
  ENGINE_HTTP_STATUS,
  decodeEnvelope,
  type EngineErrorCode,
} from '../src/main/engine-rag-store.js'

// ---------------------------------------------------------------------------
// Golden vectors (P1a §9) — the byte-exact conformance targets.
// ---------------------------------------------------------------------------

const V11_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"createDocument","result":{"document_id":"d1","wiki_id":"w1","revision":0,"state":"Draft","graph":{"nodes":[],"edges":[]},"title":"Getting Started","created_at":"2026-09-09T00:00:00Z","updated_at":"2026-09-09T00:00:00Z","tags":["guide"],"author":"alice"}}}'

const V12_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"updateDocument","error":{"code":"conflict","message":"optimistic-concurrency conflict: stale base revision"}}}'

const DOC_TYPED: Document = {
  documentId: 'd1',
  wikiId: 'w1',
  revision: 0,
  state: 'Draft',
  graph: { nodes: [], edges: [] },
  title: 'Getting Started',
  createdAt: '2026-09-09T00:00:00Z',
  updatedAt: '2026-09-09T00:00:00Z',
  tags: ['guide'],
  author: 'alice',
}

// ---------------------------------------------------------------------------
// The closed method sets + the 21-code set.
// ---------------------------------------------------------------------------

const CRUD_METHODS: CrudMethod[] = [
  'createDocument',
  'getDocument',
  'updateDocument',
  'deleteDocument',
  'publishDocument',
  'unpublishDocument',
  'archiveDocument',
  'listDocuments',
  'createWiki',
  'getWiki',
  'listWikis',
]

const MUTATING_METHODS: CrudMethod[] = [
  'createDocument',
  'updateDocument',
  'deleteDocument',
  'publishDocument',
  'unpublishDocument',
  'archiveDocument',
  'createWiki',
]

const READ_ONLY_METHODS: CrudMethod[] = [
  'getDocument',
  'listDocuments',
  'getWiki',
  'listWikis',
]

const ALL_21_CODES: EngineErrorCode[] = [
  'not_found',
  'wiki_not_found',
  'validation_error',
  'conflict',
  'doc_in_use',
  'invalid_state',
  'unresolved_reference',
  'engine_unavailable',
  'engine_error',
  'trace_unavailable',
  'hop_limit_exceeded',
  'cycle_detected',
  'embedding_unavailable',
  'vector_index_unavailable',
  'lexical_index_unavailable',
  'reranker_unavailable',
  'compression_failed',
  'hyde_generation_failed',
  'multi_query_expansion_failed',
  'community_not_found',
  'sub_task_dag_failed',
]

// ---------------------------------------------------------------------------
// Deterministic pinned seed + the property harness (≤100/row, ≤400 total,
// stop-after-5).
// ---------------------------------------------------------------------------

const PBT_SEED = 0xa1a1a1a1 // the unit's mnemonic "A1"
const PBT_ATTEMPTS = 40 // ≤100/row; 8 rows × 40 = 320 ≤ 400 total
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function runProperty(
  attempts: number,
  stopAfter: number,
  check: (i: number, rng: () => number) => string | null,
): { held: boolean; counterexamples: string[] } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < attempts; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= stopAfter) break
    }
  }
  return { held: counterexamples.length === 0, counterexamples }
}

// ---------------------------------------------------------------------------
// Generators — well-formed per-method args + well-formed per-method results.
// ---------------------------------------------------------------------------

function genArgs(rng: () => number, method: CrudMethod): CrudRequestArgs {
  const caller = pick(rng, ['', 'user:alice', 'user:博', 'caller-body'])
  const id = pick(rng, ['', 'd1', 'a b/c', '550e8400-e29b-41d4-a716-446655440000'])
  const title = pick(rng, ['', 't', 'Getting Started', 'x'.repeat(200)])
  const tags = pick(rng, [null, [], ['guide'], ['a', 'b', 'c']])
  const author = pick(rng, [null, 'alice'])
  switch (method) {
    case 'createDocument':
      return { caller, wikiId: id, body: { title, tags, author } }
    case 'getDocument':
      return { documentId: id }
    case 'updateDocument':
      return {
        caller,
        documentId: id,
        body: {
          baseRevision: pick(rng, [0, 1, 4294967295]),
          graph: { nodes: [], edges: [] },
          title,
          tags,
        },
      }
    case 'deleteDocument':
    case 'publishDocument':
    case 'unpublishDocument':
    case 'archiveDocument':
      return { caller, documentId: id }
    case 'listDocuments':
      return {
        wikiId: id,
        body: {
          state: pick(rng, [null, 'Draft', 'Published', 'Archived']),
          tag: pick(rng, [null, 'guide']),
          page: pick(rng, [null, 1, 100]),
          pageSize: pick(rng, [null, 1, 20, 100]),
        },
      }
    case 'createWiki':
      return { caller, name: title }
    case 'getWiki':
      return { wikiId: id }
    case 'listWikis':
      return {}
  }
}

function genDocument(
  rng: () => number,
  state: 'Draft' | 'Published' | 'Archived',
  revision: number,
): Document {
  return {
    documentId: pick(rng, ['d1', 'd2']),
    wikiId: 'w1',
    revision,
    state,
    graph: { nodes: [], edges: [] },
    title: pick(rng, ['t', 'Getting Started']),
    createdAt: '2026-09-09T00:00:00Z',
    updatedAt: '2026-09-09T00:00:00Z',
    tags: pick(rng, [[], ['guide']]),
    author: pick(rng, [null, 'alice']),
  }
}

/** A well-formed `DocumentSummary` (the §4.1.3 list item — six typed fields).
 *  `graph`/`tags`/`createdAt`/`author` are ABSENT by contract. */
function genSummary(
  rng: () => number,
  state: 'Draft' | 'Published' | 'Archived',
): DocumentSummary {
  return {
    documentId: pick(rng, ['d1', 'd2', 'a b/c']),
    wikiId: pick(rng, ['w1', 'w2']),
    title: pick(rng, ['t', 'Getting Started']),
    state,
    revision: pick(rng, [0, 1, 5]),
    updatedAt: '2026-09-09T00:00:00Z',
  }
}

/** A well-formed CrudResult for the method (satisfying the §5.3 invariants). */
function genResult(rng: () => number, method: CrudMethod): CrudResult {
  switch (method) {
    case 'createDocument':
      return { method, result: genDocument(rng, 'Draft', 0) }
    case 'getDocument':
    case 'updateDocument':
      return {
        method,
        result: genDocument(
          rng,
          pick(rng, ['Draft', 'Published', 'Archived'] as const),
          pick(rng, [0, 1, 5]),
        ),
      }
    case 'deleteDocument':
      return { method, result: null }
    case 'publishDocument':
      return { method, result: genDocument(rng, 'Published', pick(rng, [0, 1])) }
    case 'unpublishDocument':
      return { method, result: genDocument(rng, 'Draft', pick(rng, [0, 1])) }
    case 'archiveDocument':
      return { method, result: genDocument(rng, 'Archived', pick(rng, [0, 1])) }
    case 'listDocuments': {
      // Counterexample 4 (HOST-2): also emit the engine's §4.1.3 page-beyond-data
      // shape — empty `items`, `total: 0` — among the positive listDocuments
      // samples, so the property path (P-IM-2 / P-TP-1 / P-IM-4) exercises the
      // empty-items decode (a HOST-2 unit/positive path, not only the proxy).
      if (rng() < 0.15) {
        return {
          method,
          result: { items: [], total: 0, page: 1, pageSize: 20 },
        }
      }
      return {
        method,
        result: {
          // The §4.1.3 list wire carries `DocumentSummary` items — NEVER full
          // `Document`s. Re-derived `HOST-CRUD-LIST-SUMMARY-DECODE`.
          items: [
            genSummary(rng, pick(rng, ['Draft', 'Published', 'Archived'] as const)),
            genSummary(rng, pick(rng, ['Draft', 'Published', 'Archived'] as const)),
          ],
          total: 2,
          page: pick(rng, [1, 2, 100]),
          pageSize: pick(rng, [1, 20, 100]),
        },
      }
    }
    case 'createWiki':
    case 'getWiki':
      return { method, result: { wikiId: 'w1', name: pick(rng, ['', 'My Wiki']) } }
    case 'listWikis':
      return { method, result: [{ wikiId: 'w1', name: 'My Wiki' }] }
  }
}

/** The response-envelope payload for a well-formed (method, result). */
function resultPayload(result: CrudResult): unknown {
  return {
    method: result.method,
    ...(result.result === null ? { result: null } : { result: result.result }),
  }
}

// ---------------------------------------------------------------------------
// The §5.7 register (8 rows).
// ---------------------------------------------------------------------------

describe('PBT register (§5.7)', () => {
  it('P-IM-1 [strat:crud-request-roundtrip] CRUD request round-trip identity', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const method = pick(rng, CRUD_METHODS)
        const args = genArgs(rng, method)
        const decoded = decodeCrudRequest(encodeCrudRequest(method, args))
        if (decoded.method !== method) {
          return `method mismatch: ${decoded.method} != ${method}`
        }
        if (JSON.stringify(decoded.args) !== JSON.stringify(args)) {
          return `args mismatch for ${method}`
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-IM-2 [strat:crud-response-decode] CRUD response decode determinism + listDocuments DocumentSummary[] + V-11', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const method = pick(rng, CRUD_METHODS)
        const result = genResult(rng, method)
        const payload = resultPayload(result)
        const a = decodeCrudResponse(payload)
        const b = decodeCrudResponse(payload)
        if (JSON.stringify(a) !== JSON.stringify(b)) {
          return `non-deterministic decode for ${method}`
        }
        // Re-derived: a listDocuments result decodes to `DocumentSummary[]`
        // items (the six-field summary, not full `Document`s), and the summary
        // round-trips element-wise (the decoder accepts the camelCase typed
        // shape and never requires graph/tags/createdAt/author).
        if (method === 'listDocuments') {
          const decodedItems = (a.result as { items: unknown[] }).items
          const genItems = (result.result as { items: unknown[] }).items
          if (JSON.stringify(decodedItems) !== JSON.stringify(genItems)) {
            return `listDocuments: decoded items != generated DocumentSummary[]`
          }
          for (const it of decodedItems as DocumentSummary[]) {
            const keys = Object.keys(it).sort().join(',')
            const expected = ['documentId', 'revision', 'state', 'title', 'updatedAt', 'wikiId'].join(',')
            if (keys !== expected) {
              return `listDocuments summary item keys [${keys}] != the six summary fields (graph/tags/createdAt/author present?)`
            }
          }
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
    // Golden-vector conformance: V-11 decodes to the pinned typed Document.
    expect(decodeCrudResponse(decodeEnvelope(V11_ENVELOPE).payload)).toEqual({
      method: 'createDocument',
      result: DOC_TYPED,
    })
  })

  it('P-IM-3 [strat:crud-error-decode] CRUD error decode determinism + V-12', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const method = pick(rng, CRUD_METHODS)
        const code = pick(rng, ALL_21_CODES)
        let thrown: unknown
        try {
          decodeCrudResponse({ method, error: { code, message: 'm' } })
        } catch (e) {
          thrown = e
        }
        if (!(thrown instanceof EngineWireError)) {
          return `code ${code}: no EngineWireError thrown`
        }
        const err = thrown as EngineWireError
        if (err.code !== code) return `code ${code}: wrong code ${err.code}`
        if (err.httpStatus !== ENGINE_HTTP_STATUS[code]) {
          return `code ${code}: wrong status ${err.httpStatus}`
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
    // Golden-vector conformance: V-12 decodes to ConflictError (409).
    expect(() => decodeCrudResponse(decodeEnvelope(V12_ENVELOPE).payload)).toThrow(
      ConflictError,
    )
  })

  it('P-IM-4 [strat:crud-summary-decode] listDocuments summary-decode contract', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const state = pick(rng, ['Draft', 'Published', 'Archived'] as const)
        const summary = genSummary(rng, state)

        // POSITIVE 1 (original): well-formed `DocumentSummary[]` (six typed
        // fields; graph/tags/createdAt/author ABSENT is legal) → decode WITHOUT
        // throwing, and the decoded item matches the pinned six-field
        // projection.
        let decoded: CrudResult | null = null
        try {
          decoded = decodeCrudResponse({
            method: 'listDocuments',
            result: { items: [summary], total: 1, page: 1, pageSize: 20 },
          })
        } catch (e) {
          return `well-formed summary threw (malformed document? current host routes list items through strict decodeDocument): ${String(e)}`
        }
        const decodedItem = (decoded.result as { items: unknown[] }).items[0] as DocumentSummary
        if (JSON.stringify(decodedItem) !== JSON.stringify(summary)) {
          return `summary item decoded != generated (six-field projection mismatch)`
        }
        const keys = Object.keys(decodedItem).sort().join(',')
        const expected = ['documentId', 'revision', 'state', 'title', 'updatedAt', 'wikiId'].join(',')
        if (keys !== expected) {
          return `decoded summary keys [${keys}] != the six summary fields (graph/tags/createdAt/author surfaced?)`
        }

        // POSITIVE 2 (HOST-2): the engine's §4.1.3 page-beyond-data response
        // `{items:[], total:0, page:1, pageSize:20}` decodes WITHOUT throwing to
        // an empty `DocumentList`.
        const emptyList = decodeCrudResponse({
          method: 'listDocuments',
          result: { items: [], total: 0, page: 1, pageSize: 20 },
        })
        const emptyResult = emptyList.result as {
          items: unknown[]
          total: number
          page: number
          pageSize: number
        }
        if (
          emptyResult.items.length !== 0 ||
          emptyResult.total !== 0 ||
          emptyResult.page !== 1 ||
          emptyResult.pageSize !== 20
        ) {
          return `empty-items page-beyond-data list did not decode to DocumentList { items:[], total:0, page:1, pageSize:20 }`
        }

        // POSITIVE 3 (Counterexample 5): interleave ONE full `Document` item
        // (graph/tags/createdAt/author all present) among summary items — the
        // §5.8-9 clause says a full-`Document` list item is valid and projects
        // to its six-field `DocumentSummary`, preserving its OWN revision/state/
        // title (no hard-coded default). The property layer must pin this, not
        // just the unit.
        const full = genDocument(
          rng,
          pick(rng, ['Draft', 'Published', 'Archived'] as const),
          pick(rng, [0, 1, 5]),
        )
        const mixed = rng() < 0.5 ? [summary, full] : [full, summary]
        let decMixed: CrudResult | null = null
        try {
          decMixed = decodeCrudResponse({
            method: 'listDocuments',
            result: { items: mixed, total: 2, page: 1, pageSize: 20 },
          })
        } catch (e) {
          return `full Document list item threw (projection not tolerated): ${String(e)}`
        }
        const decMixedItems = (decMixed.result as { items: DocumentSummary[] }).items
        const project = (it: Document | DocumentSummary): DocumentSummary => ({
          documentId: it.documentId,
          wikiId: it.wikiId,
          title: it.title,
          state: it.state,
          revision: it.revision,
          updatedAt: it.updatedAt,
        })
        if (
          JSON.stringify(decMixedItems) !==
          JSON.stringify(mixed.map(project))
        ) {
          return `mixed full/summary items: decoded != the six-field projection of the input`
        }
        const fullDec = decMixedItems[mixed.indexOf(full)] as DocumentSummary
        if (
          fullDec.revision !== full.revision ||
          fullDec.state !== full.state ||
          fullDec.title !== full.title
        ) {
          return `full Document item did not preserve its OWN revision/state/title in its six-field projection`
        }

        // NEGATIVE (HOST-1 + HOST-3): every malformed summary item → the decode
        // MUST throw `EngineError('malformed document')` (502) — NOT a native
        // TypeError. The register clause is ∀ malformed over ALL six wire fields
        // (`document_id`/`wiki_id`/`title`/`state`/`revision`/`updated_at`),
        // incl. the snake_case forms — the fields the original generator missed.
        const malformed: unknown[] = [
          // missing/typed-wrong `documentId` (camelCase).
          { ...summary, documentId: undefined as unknown as string },
          { ...summary, documentId: 123 as unknown as string },
          // HOST-3: typed-wrong / missing `wikiId` (camelCase, missed before).
          { ...summary, wikiId: 123 as unknown as string },
          { ...summary, wikiId: undefined as unknown as string },
          { ...summary, title: 5 as unknown as string },
          { ...summary, state: 'Foo' as unknown as DocumentSummary['state'] },
          { ...summary, revision: 'x' as unknown as number },
          // HOST-3: typed-wrong / missing `updatedAt` (camelCase, missed before).
          { ...summary, updatedAt: 0 as unknown as string },
          { ...summary, updatedAt: undefined as unknown as string },
          // HOST-3: snake_case malformed variants — `wiki_id` / `updated_at`.
          {
            document_id: summary.documentId,
            wiki_id: 123,
            title: summary.title,
            state: summary.state,
            revision: summary.revision,
            updated_at: summary.updatedAt,
          },
          {
            document_id: summary.documentId,
            wiki_id: summary.wikiId,
            title: summary.title,
            state: summary.state,
            revision: summary.revision,
            updated_at: 0,
          },
        ]
        for (const bad of malformed) {
          let threw: unknown
          try {
            decodeCrudResponse({
              method: 'listDocuments',
              result: { items: [bad], total: 1, page: 1, pageSize: 20 },
            })
          } catch (e) {
            threw = e
          }
          if (
            !(threw instanceof EngineError) ||
            (threw as Error).message !== 'malformed document' ||
            threw instanceof TypeError
          ) {
            return `malformed summary item did NOT throw EngineError('malformed document') (${threw instanceof TypeError ? 'was a native TypeError' : 'no/wrong throw'}): ${String(threw)}`
          }
        }

        // HOST-1: non-object list items (`[null]`, `[5]`, `['x']`, `[true]`) →
        // `decodeDocumentList` must throw `EngineError('malformed document')`, NOT
        // a native TypeError.
        for (const nonObject of [null, 5, 'x', true]) {
          let threw: unknown
          try {
            decodeCrudResponse({
              method: 'listDocuments',
              result: { items: [nonObject], total: 1, page: 1, pageSize: 20 },
            })
          } catch (e) {
            threw = e
          }
          if (
            !(threw instanceof EngineError) ||
            (threw as Error).message !== 'malformed document' ||
            threw instanceof TypeError
          ) {
            return `non-object list item ${JSON.stringify(nonObject)} did NOT throw EngineError('malformed document'): ${String(threw)}`
          }
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-SM-1 [strat:crud-method-endpoint-unique] method + endpoint bijection', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const a = pick(rng, CRUD_METHODS)
        const b = pick(rng, CRUD_METHODS)
        if (a.length === 0) return 'empty method string'
        if (!/^[a-z][a-zA-Z]*$/.test(a)) return `non-camelCase method: ${a}`
        if (a === b) return null
        if (ENGINE_CRUD_ENDPOINTS[a] === ENGINE_CRUD_ENDPOINTS[b]) {
          return `path collision: ${a} and ${b}`
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
    // Direct: 11 pairwise-distinct non-empty camelCase values, and exactly 11
    // rows, one per method (a bijection between the 11 paths and 11 methods).
    expect(new Set(CRUD_METHODS).size).toBe(11)
    for (let i = 0; i < CRUD_METHODS.length; i++) {
      for (let j = i + 1; j < CRUD_METHODS.length; j++) {
        expect(CRUD_METHODS[i]).not.toBe(CRUD_METHODS[j])
      }
    }
    expect(Object.keys(ENGINE_CRUD_ENDPOINTS).length).toBe(11)
    for (const m of CRUD_METHODS) {
      expect(ENGINE_CRUD_ENDPOINTS[m]).toBeTruthy()
    }
  })

  it('P-SM-2 [strat:crud-caller-preserved] RBAC caller preservation', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const method = pick(rng, CRUD_METHODS)
        const args = genArgs(rng, method)
        const env = encodeCrudRequest(method, args)
        const argsObj = env.payload.args as Record<string, unknown>
        if (MUTATING_METHODS.includes(method)) {
          if (argsObj.caller !== (args as any).caller) {
            return `mutating ${method}: caller not preserved`
          }
        } else if (READ_ONLY_METHODS.includes(method)) {
          if ('caller' in argsObj) {
            return `read-only ${method}: unexpected caller`
          }
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-SM-3 [strat:crud-envelope-stable] envelope stability', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const method = pick(rng, CRUD_METHODS)
        const args = genArgs(rng, method)
        const env = encodeCrudRequest(method, args)
        if (env.schemaVersion !== 1) return 'schemaVersion != 1'
        if (env.idFormat !== 'opaque-string-v1') {
          return 'idFormat != opaque-string-v1'
        }
        if (JSON.stringify(JSON.parse(JSON.stringify(env))) !== JSON.stringify(env)) {
          return 'envelope not stable under serialize/re-parse'
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-TP-1 [strat:crud-validate-total] decode-then-validate totality on well-formed input', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const method = pick(rng, CRUD_METHODS)
        const result = genResult(rng, method)
        const failure = validateCrudResult(method, result)
        if (failure !== null) {
          return `validateCrudResult(${method}) returned ${JSON.stringify(failure)}`
        }
        try {
          decodeCrudResponse(resultPayload(result))
        } catch (e) {
          return `decodeCrudResponse threw for well-formed ${method}: ${String(e)}`
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })
})
