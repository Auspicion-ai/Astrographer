// src/main/embeddings.ts — Unit F: the vector embedder + embedding providers
// (docs/specs/unit-f-embeddings.md). Pure + async; no Electron — the HTTP call
// is a plain fetch to the configured endpoint.
//
// Scope: the embedding provider abstraction + config (§5.2), the ollama
// `embeddinggemma` concrete provider (the local test environment), the
// remote/cloud provider drop-in, the vector index (§5.3), cosine similarity
// scoring (§5.4), the vector embedder behind the async `Embedder` interface
// (§5.5), the deterministic mock embedder + the integration-test probe (§5.6).
import { execFileSync } from 'node:child_process'
import type { RagNode, RagStore, RagEdge } from './rag-store.js'
import type { Embedder, PlacementDecision, ScoredNode } from './retrieval.js'
import { PLACEMENT_MIN_SCORE } from './retrieval.js'
import { createSingleTextMemoizer, type VectorCache } from './vector-cache.js'

// ---------------------------------------------------------------------------
// §5.2 The embedding provider abstraction + config
// ---------------------------------------------------------------------------

/** The embed function: text → embedding vector. ASYNC. */
export type EmbedTextFn = (text: string) => Promise<number[]>

/** W2 (§5.2 "Batch seam") — the batch embed function: texts → embedding
 *  vectors in ONE provider request. ASYNC. Positional: result[i] is the
 *  vector for texts[i]; the WHOLE batch rejects on an alignment mismatch. */
export type EmbedBatchFn = (texts: string[]) => Promise<number[][]>

/** F-W2-2 (2026-09-05) — the batch build CHUNKS its requests: texts per
 *  provider request (the last chunk may be short). Bounds one request's
 *  budget + blast radius (a rejected chunk falls back per-item for exactly
 *  that chunk's texts — §5.3 batch build path). */
export const BATCH_CHUNK_SIZE = 64

/** The embedding provider config — the ONLY thing that differs between
 *  providers. */
export interface EmbeddingProviderConfig {
  provider: 'ollama' | 'openai' | 'cohere' | string
  baseUrl: string
  model: string
  apiKey?: string
  dimension?: number
  timeoutMs?: number
  /** F9 — an optional EXTENSION to the default `connect-src` CSP allowlist
   *  (hostnames). The default safe set is always included (fail-closed); this
   *  only ADDS hostnames for a remote/cloud provider. */
  connectSrc?: string[]
}

/** The provider abstraction — a configurable embedding provider. */
export interface EmbeddingProvider {
  readonly kind: string
  readonly model: string
  readonly baseUrl: string
  readonly dimension: number
  embed(text: string): Promise<number[]>
  /** W2 (2026-09-05 amendment) — OPTIONAL batch member: embed several texts
   *  in ONE provider request, preserving positional order (result[i] is the
   *  vector for texts[i]). Implemented by BOTH concrete providers; callers
   *  without a batch need use the sequential per-item default
   *  (`provider.embedBatch ?? per-item embed()` — §5.2 "Batch seam").
   *  Interface members: 5 → 6 (§5.10). */
  embedBatch?(texts: string[]): Promise<number[][]>
}

/** Create the embedding provider from a config. Dispatches on config.provider:
 *  'ollama' → the local ollama provider; any other kind → the remote/cloud
 *  provider. */
export function createEmbeddingProvider(config: EmbeddingProviderConfig): EmbeddingProvider {
  if (config === null || config === undefined) throw new Error('createEmbeddingProvider: config required')
  if (typeof config.baseUrl !== 'string' || config.baseUrl.trim() === '') {
    throw new Error('createEmbeddingProvider: baseUrl required')
  }
  if (typeof config.model !== 'string' || config.model.trim() === '') {
    throw new Error('createEmbeddingProvider: model required')
  }
  if (config.provider === 'ollama') {
    return createOllamaEmbedProvider({ baseUrl: config.baseUrl, model: config.model, timeoutMs: config.timeoutMs, dimension: config.dimension })
  }
  return createRemoteEmbedProvider({ baseUrl: config.baseUrl, model: config.model, apiKey: config.apiKey, dimension: config.dimension, timeoutMs: config.timeoutMs, kind: config.provider, connectSrc: config.connectSrc })
}

// ---------------------------------------------------------------------------
// §5.2 The ollama concrete provider (ONE concrete config — the local test env)
// ---------------------------------------------------------------------------

export interface OllamaEmbedOptions {
  baseUrl?: string
  model?: string
  timeoutMs?: number
  dimension?: number
}

/** The default connect-src CSP allowlist for remote/cloud providers
 *  (REMOTE-SECURITY-POSTURE — §5.7). A remote baseUrl whose origin is NOT in
 *  this allowlist is rejected (fail-closed). */
const DEFAULT_CONNECT_SRC = new Set([
  'api.openai.com',
  'api.cohere.com',
  'api.anthropic.com',
  'api.mistral.ai',
  'api.voyageai.com',
  'api.jina.ai',
])

function isLocalhostHost(hostname: string): boolean {
  // F3 — normalize the hostname: `new URL('http://[::1]:11434').hostname` is
  // '[::1]' (bracketed), so strip the brackets before the '::1' comparison.
  const h = hostname.replace(/^\[|\]$/g, '')
  return h === '127.0.0.1' || h === 'localhost' || h === '::1'
}

/** F5 — parse a positive-integer env value. NaN / negative / non-integer /
 *  empty → undefined (the field is dropped rather than passed through as a
 *  malformed dimension/timeout). */
export function parsePositiveIntEnv(raw: string | undefined): number | undefined {
  if (raw === undefined || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return undefined
  return n
}

function hostnameOf(baseUrl: string): string {
  try {
    return new URL(baseUrl).hostname
  } catch {
    return ''
  }
}

/** W2 (§5.2 "Batch seam", §5.9 #8/#14/#40) — one HTTP request under a
 *  PER-REQUEST time budget with a REAL abort: the budget expiry aborts the
 *  in-flight fetch via AbortController (no orphaned request — this replaces
 *  the Promise.race abandonment), and the aborted fetch's rejection is
 *  SWALLOWED (the timeout error is the one thrown; no unhandled rejection).
 *  `budgetMs` is the caller's budget: `timeoutMs` for a single-text embed,
 *  `N × timeoutMs` for a batch of N. A non-timeout fetch failure is wrapped
 *  as `<prefix>: <message>` (unchanged behavior). */
async function fetchWithTimeout(prefix: string, url: string, init: RequestInit, budgetMs: number): Promise<Response> {
  // F-W2-2 — clamp the budget to the setTimeout ceiling (2^31-1 ms): Node
  // coerces a larger delay to 1 ms, which would fire a spurious INSTANT
  // timeout for a legitimately long batch budget.
  const clampedBudget = Math.min(budgetMs, 2147483647)
  const timeoutError = new Error(`${prefix}: timeout after ${clampedBudget}ms`)
  const controller = new AbortController()
  let timedOut = false
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      timedOut = true
      // W2 — the budget expiry ACTUALLY ABORTS the in-flight fetch.
      controller.abort()
      reject(timeoutError)
    }, clampedBudget)
  })
  try {
    return await Promise.race([
      fetch(url, { ...init, signal: controller.signal }),
      timeoutPromise,
    ])
  } catch (e) {
    // The aborted fetch's rejection (and the timeout rejection itself) is
    // swallowed — the timeout error is the one thrown.
    if (timedOut || e === timeoutError) throw timeoutError
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`${prefix}: ${msg}`)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Create the ollama embed provider — ONE concrete provider config (the local
 *  test environment). The returned provider embeds a single text via a
 *  localhost HTTP POST to ollama's embeddings endpoint. */
export function createOllamaEmbedProvider(opts?: OllamaEmbedOptions): EmbeddingProvider {
  const baseUrl = opts?.baseUrl ?? 'http://127.0.0.1:11434'
  const model = opts?.model ?? 'embeddinggemma'
  // F-W2-5 — validate timeoutMs when present: a positive integer within the
  // setTimeout ceiling (a negative/zero/fractional/huge value would produce
  // spurious instant or 1 ms-clamped timeouts). undefined keeps the 5000
  // default; env-parsed values are pre-validated by parsePositiveIntEnv
  // (unchanged).
  if (opts?.timeoutMs !== undefined && (!Number.isInteger(opts.timeoutMs) || opts.timeoutMs < 1 || opts.timeoutMs > 2147483647)) {
    throw new Error('createOllamaEmbedProvider: timeoutMs must be a positive integer')
  }
  const timeoutMs = opts?.timeoutMs ?? 5000
  const configuredDimension = opts?.dimension
  // LOCAL-SECURITY-POSTURE — the base URL is pinned to localhost/loopback.
  if (!isLocalhostHost(hostnameOf(baseUrl))) {
    throw new Error('createOllamaEmbedProvider: baseUrl must be localhost')
  }
  let dimension = configuredDimension ?? 0
  let dimensionSet = configuredDimension !== undefined

  // F6/F7 for ONE vector — shared by the single-text and batch paths (the
  // dimension state is the provider's shared closure: an auto-detect from
  // either path is consistent across both — §5.2). F-W2-1 — a zero-length
  // vector is MALFORMED (`[].every` is vacuously true; a zero-length vector
  // would latch dimension 0 — a provider brick — or be stored as an index
  // poison). `batchDim` is the in-batch auto-detect candidate (the FIRST
  // vector's length) used while the shared dimension is still unset (F41c).
  function checkVec(vec: unknown, batchDim: number | undefined): number[] {
    if (!Array.isArray(vec) || vec.length === 0 || !vec.every((v) => typeof v === 'number' && Number.isFinite(v))) {
      throw new Error('ollama embed: malformed response')
    }
    const expected = dimensionSet ? dimension : batchDim
    if (expected !== undefined && vec.length !== expected) {
      throw new Error(`ollama embed: dimension mismatch (expected ${expected}, got ${vec.length})`)
    }
    return vec
  }

  // F-W2-1 — validate-then-commit: ALL vectors of a response are validated
  // BEFORE any dimension state is committed (a malformed later vector must
  // not leave an earlier latch). The in-batch auto-detect still uses the
  // FIRST in-batch vector (F41c — unchanged).
  function validateAll(vectors: unknown[]): number[][] {
    let batchDim: number | undefined
    const checked = vectors.map((vec) => {
      const ok = checkVec(vec, batchDim)
      if (!dimensionSet && batchDim === undefined) batchDim = ok.length
      return ok
    })
    if (!dimensionSet && batchDim !== undefined) {
      dimension = batchDim
      dimensionSet = true
    }
    return checked
  }

  async function embed(text: string): Promise<number[]> {
    if (typeof text !== 'string') throw new Error('ollama embed: text must be a string')
    const res = await fetchWithTimeout('ollama embed', `${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: text }),
    }, timeoutMs)
    if (!res.ok) throw new Error(`ollama embed: HTTP ${res.status}`)
    let data: { embeddings?: unknown }
    try {
      data = await res.json() as { embeddings?: unknown }
    } catch {
      throw new Error('ollama embed: malformed response')
    }
    const embeddings = data?.embeddings
    if (!Array.isArray(embeddings)) {
      throw new Error('ollama embed: malformed response')
    }
    return validateAll([embeddings[0]])[0]
  }

  // W2 (§5.2 "Batch seam") — the plural form of the single-text request: ONE
  // POST for the whole batch; the response `embeddings[i]` is the vector for
  // `texts[i]` (positional). No auth header (LOCAL-SECURITY-POSTURE).
  async function embedBatch(texts: string[]): Promise<number[][]> {
    // F-W2-4 — validate the INPUT (asymmetric with the single-text
    // "text must be a string" guard): the texts must be an array of strings.
    // Empty-string items remain VALID (live-verified aligned — §5.2).
    if (!Array.isArray(texts) || !texts.every((t) => typeof t === 'string')) {
      throw new Error('ollama embed: batch texts must be an array of strings')
    }
    if (texts.length === 0) return []
    const res = await fetchWithTimeout('ollama embed', `${baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: texts }),
    }, texts.length * timeoutMs)
    if (!res.ok) throw new Error(`ollama embed: HTTP ${res.status}`)
    let data: { embeddings?: unknown }
    try {
      data = await res.json() as { embeddings?: unknown }
    } catch {
      throw new Error('ollama embed: malformed response')
    }
    const embeddings = data?.embeddings
    if (!Array.isArray(embeddings)) {
      throw new Error('ollama embed: malformed response')
    }
    // ALIGNMENT INVARIANT — the WHOLE batch rejects unless the response
    // vectors are 1:1 positional with the input (never assigned from a
    // misaligned response).
    if (embeddings.length !== texts.length) {
      throw new Error(`ollama embed: batch alignment mismatch (expected ${texts.length} vectors, got ${embeddings.length})`)
    }
    // F-W2-1 — validate ALL vectors BEFORE committing any dimension state.
    return validateAll(embeddings)
  }

  return { kind: 'ollama', model, baseUrl, get dimension() { return dimension }, embed, embedBatch }
}

// ---------------------------------------------------------------------------
// §5.2 The remote/cloud concrete provider (a drop-in via the SAME interface)
// ---------------------------------------------------------------------------

export interface RemoteEmbedOptions {
  baseUrl: string
  model: string
  apiKey: string | undefined
  dimension?: number
  timeoutMs?: number
  /** The provider kind (config.provider) — surfaced as `EmbeddingProvider.kind`.
   *  Defaults to 'remote'. F8 — the request/response shape is dispatched on
   *  this kind ('cohere' → `{ model, texts }` / `embeddings[0]`; any other →
   *  the OpenAI-shaped `{ model, input }` / `data[0].embedding`). */
  kind?: string
  /** F9 — an optional EXTENSION to the default `connect-src` CSP allowlist
   *  (hostnames). The default safe set is always included (fail-closed). */
  connectSrc?: string[]
}

/** Create a remote/cloud embed provider — a drop-in behind the SAME
 *  EmbeddingProvider interface (different config: model URL, API key, model
 *  name). */
export function createRemoteEmbedProvider(opts: RemoteEmbedOptions): EmbeddingProvider {
  if (opts === null || opts === undefined || typeof opts.apiKey !== 'string' || opts.apiKey.trim() === '') {
    throw new Error('createRemoteEmbedProvider: apiKey required')
  }
  // F-W2-5 — validate timeoutMs when present: a positive integer within the
  // setTimeout ceiling (see the ollama provider). undefined keeps the 5000
  // default; env-parsed values are pre-validated by parsePositiveIntEnv
  // (unchanged).
  if (opts.timeoutMs !== undefined && (!Number.isInteger(opts.timeoutMs) || opts.timeoutMs < 1 || opts.timeoutMs > 2147483647)) {
    throw new Error('createRemoteEmbedProvider: timeoutMs must be a positive integer')
  }
  const baseUrl = opts.baseUrl
  const model = opts.model
  const timeoutMs = opts.timeoutMs ?? 5000
  const configuredDimension = opts.dimension
  const kind = opts.kind ?? 'remote'
  // F9 — the connect-src allowlist is the DEFAULT safe set (fail-closed) plus
  // any caller-supplied EXTENSION hostnames. A remote baseUrl whose origin is
  // NOT in the resulting allowlist is rejected.
  const allowlist = new Set(DEFAULT_CONNECT_SRC)
  for (const h of opts.connectSrc ?? []) {
    if (typeof h === 'string' && h.trim() !== '') allowlist.add(h.trim())
  }
  const allowlisted = allowlist.has(hostnameOf(baseUrl))
  // F8 — dispatch the request/response shape on the provider kind. The
  // OpenAI-shaped `{ model, input }` / `data[0].embedding` is the default; a
  // Cohere-shaped provider uses `{ model, texts }` / `embeddings[0]`.
  const isCohere = kind === 'cohere'
  let dimension = configuredDimension ?? 0
  let dimensionSet = configuredDimension !== undefined

  // F6/F7 for ONE vector — shared by the single-text and batch paths (the
  // dimension state is the provider's shared closure: an auto-detect from
  // either path is consistent across both — §5.2). F-W2-1 — a zero-length
  // vector is MALFORMED (`[].every` is vacuously true; a zero-length vector
  // would latch dimension 0 — a provider brick — or be stored as an index
  // poison). `batchDim` is the in-batch auto-detect candidate (the FIRST
  // vector's length) used while the shared dimension is still unset (F41c).
  function checkVec(vec: unknown, batchDim: number | undefined): number[] {
    if (!Array.isArray(vec) || vec.length === 0 || !vec.every((v) => typeof v === 'number' && Number.isFinite(v))) {
      throw new Error('remote embed: malformed response')
    }
    const expected = dimensionSet ? dimension : batchDim
    if (expected !== undefined && vec.length !== expected) {
      throw new Error(`remote embed: dimension mismatch (expected ${expected}, got ${vec.length})`)
    }
    return vec
  }

  // F-W2-1 — validate-then-commit: ALL vectors of a response are validated
  // BEFORE any dimension state is committed (a malformed later vector must
  // not leave an earlier latch). The in-batch auto-detect still uses the
  // FIRST in-batch vector (F41c — unchanged).
  function validateAll(vectors: unknown[]): number[][] {
    let batchDim: number | undefined
    const checked = vectors.map((vec) => {
      const ok = checkVec(vec, batchDim)
      if (!dimensionSet && batchDim === undefined) batchDim = ok.length
      return ok
    })
    if (!dimensionSet && batchDim !== undefined) {
      dimension = batchDim
      dimensionSet = true
    }
    return checked
  }

  async function embed(text: string): Promise<number[]> {
    if (typeof text !== 'string') throw new Error('remote embed: text must be a string')
    // REMOTE-SECURITY-POSTURE — fail-closed: the baseUrl origin must be in the
    // connect-src CSP allowlist.
    if (!allowlisted) throw new Error('remote embed: baseUrl not in connect-src allowlist')
    const body = isCohere ? { model, texts: [text] } : { model, input: text }
    const res = await fetchWithTimeout('remote embed', baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify(body),
    }, timeoutMs)
    if (!res.ok) throw new Error(`remote embed: HTTP ${res.status}`)
    let data: Record<string, unknown>
    try {
      data = await res.json() as Record<string, unknown>
    } catch {
      throw new Error('remote embed: malformed response')
    }
    let vec: unknown
    if (isCohere) {
      const embeddings = (data as { embeddings?: unknown }).embeddings
      if (!Array.isArray(embeddings) || !Array.isArray(embeddings[0])) throw new Error('remote embed: malformed response')
      vec = embeddings[0]
    } else {
      const d = (data as { data?: Array<{ embedding?: unknown }> }).data
      vec = d?.[0]?.embedding
      if (!Array.isArray(vec)) throw new Error('remote embed: malformed response')
    }
    return validateAll([vec])[0]
  }

  // W2 (§5.2 "Batch seam") — the plural form of the single-text request, F8
  // dispatched on the provider kind: OpenAI-shaped default `{ model,
  // input: [t1..tn] }` → `data[i].embedding`; Cohere `{ model, texts:
  // [t1..tn] }` → `embeddings[i]`. Positional: vectors[i] is the vector for
  // texts[i]. Authorization Bearer header as today (REMOTE-SECURITY-POSTURE).
  async function embedBatch(texts: string[]): Promise<number[][]> {
    // F-W2-4 — validate the INPUT (asymmetric with the single-text
    // "text must be a string" guard): the texts must be an array of strings.
    // Empty-string items remain VALID (live-verified aligned — §5.2).
    if (!Array.isArray(texts) || !texts.every((t) => typeof t === 'string')) {
      throw new Error('remote embed: batch texts must be an array of strings')
    }
    if (texts.length === 0) return []
    // REMOTE-SECURITY-POSTURE — fail-closed: the baseUrl origin must be in the
    // connect-src CSP allowlist.
    if (!allowlisted) throw new Error('remote embed: baseUrl not in connect-src allowlist')
    const body = isCohere ? { model, texts } : { model, input: texts }
    const res = await fetchWithTimeout('remote embed', baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify(body),
    }, texts.length * timeoutMs)
    if (!res.ok) throw new Error(`remote embed: HTTP ${res.status}`)
    let data: Record<string, unknown>
    try {
      data = await res.json() as Record<string, unknown>
    } catch {
      throw new Error('remote embed: malformed response')
    }
    let vectors: unknown[]
    if (isCohere) {
      const embeddings = (data as { embeddings?: unknown }).embeddings
      if (!Array.isArray(embeddings)) throw new Error('remote embed: malformed response')
      vectors = embeddings
    } else {
      const d = (data as { data?: unknown[] }).data
      if (!Array.isArray(d)) throw new Error('remote embed: malformed response')
      vectors = d.map((item) => (item as { embedding?: unknown } | undefined)?.embedding)
    }
    // ALIGNMENT INVARIANT — the WHOLE batch rejects unless the response
    // vectors are 1:1 positional with the input (never assigned from a
    // misaligned response).
    if (vectors.length !== texts.length) {
      throw new Error(`remote embed: batch alignment mismatch (expected ${texts.length} vectors, got ${vectors.length})`)
    }
    // F-W2-1 — validate ALL vectors BEFORE committing any dimension state.
    return validateAll(vectors)
  }

  return { kind, model, baseUrl, get dimension() { return dimension }, embed, embedBatch }
}

// ---------------------------------------------------------------------------
// §5.3 The vector index
// ---------------------------------------------------------------------------

export interface VectorIndex {
  nodeIds: string[]
  embeddings: Map<string, number[]>
  dimension: number
  /** W3 (2026-09-05 amendment, §5.3) — the skipped-node record: nodeId →
   *  'empty' (a by-design PERMANENT skip — empty/whitespace content,
   *  UNIT-F-SKIP-EMPTY) | 'transient' (a retryable per-node embed failure).
   *  A skipped node is NOT in `nodeIds`/`embeddings` (it scores 0 — §5.4); an
   *  update-to-empty skip therefore ALSO removes the id from `nodeIds`. A
   *  successful re-embed (or a delete) removes the entry. Interface members:
   *  3 → 4 (§5.10). */
  skipped: Map<string, 'empty' | 'transient'>
}

/** W3 — the transient-skip warning (§5.9 #46): a per-node embed rejection is
 *  logged with the node id + the error and the operation RESOLVES. The string
 *  is NOT pinned — only the fact + the id. */
function warnTransientSkip(nodeId: string, e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e)
  console.error(`vector index: node embed failed (transient): ${nodeId} ${msg}`)
}

/** Remove a node's embedding + id (the index-mutation half of
 *  removeFromVectorIndex, shared by the W3 skip paths). */
function removeIndexed(index: VectorIndex, nodeId: string): void {
  const pos = index.nodeIds.indexOf(nodeId)
  if (pos === -1) return
  index.embeddings.delete(nodeId)
  index.nodeIds.splice(pos, 1)
}

/** Build the index from a node list (boot). Embeds each node's content once.
 *  W2 (§5.3 "Index-build wiring") — the OPTIONAL THIRD param `embedBatchFn`:
 *  when supplied, the build embeds via BATCH calls (the non-empty contents in
 *  node order); on a batch REJECTION the caller fallback re-embeds exactly
 *  that batch's texts via per-item `embedFn` (a rejected batch never assigns
 *  vectors positionally — §5.2 alignment invariant). Omitted (ALL existing
 *  calls/tests) → the sequential per-item build, byte-identical behavior. */
export async function createVectorIndex(nodes: RagNode[], embedFn: EmbedTextFn, embedBatchFn?: EmbedBatchFn): Promise<VectorIndex> {
  if (nodes === null || nodes === undefined || embedFn === null || embedFn === undefined) {
    throw new Error('createVectorIndex: nodes/embedFn required')
  }
  const nodeIds: string[] = []
  const embeddings = new Map<string, number[]>()
  const skipped = new Map<string, 'empty' | 'transient'>()
  let dimension = 0
  // F-W2-1 — an explicit dimension-set flag replaces the `dimension === 0`
  // sentinel (a latched 0 dimension is exactly the zero-length-vector brick).
  let dimensionSet = false
  if (embedBatchFn !== null && embedBatchFn !== undefined) {
    // W2 batch build path — the UNIT-F-SKIP-EMPTY guard first (empty/
    // whitespace nodes are NEVER batched — recorded 'empty', W3), then the
    // non-empty contents go to the batch fn in node order.
    const batch: RagNode[] = []
    for (const node of nodes) {
      if (typeof node.content !== 'string' || node.content.trim() === '') {
        skipped.set(node.id, 'empty')
        continue
      }
      batch.push(node)
    }
    // F-W2-2 — CHUNK the batch loop: BATCH_CHUNK_SIZE texts per request (the
    // last chunk may be short), with per-CHUNK fallback isolation — a
    // rejected or misaligned chunk falls back per-item for exactly THAT
    // chunk's texts (the union of the chunk texts stays the non-empty
    // contents in node order — the §5.8 #39 invariant).
    for (let start = 0; start < batch.length; start += BATCH_CHUNK_SIZE) {
      const chunk = batch.slice(start, start + BATCH_CHUNK_SIZE)
      let chunkVectors: number[][] | undefined
      try {
        chunkVectors = await embedBatchFn(chunk.map((n) => n.content))
      } catch {
        chunkVectors = undefined
      }
      if (chunkVectors !== undefined && chunkVectors.length !== chunk.length) {
        // A non-rejecting but misaligned chunk result is still never assigned
        // positionally (a malformed-RESPONSE defect — it rejects, it does not
        // transient-skip).
        throw new Error(`createVectorIndex: batch alignment mismatch (expected ${chunk.length} vectors, got ${chunkVectors.length})`)
      }
      // The chunk's committed (node, vector) pairs — one per SUCCESSFULLY
      // embedded node. W3: a per-node embed rejection on the fallback path is
      // a transient skip, so a fallback chunk may commit fewer pairs than its
      // nodes.
      const committed: Array<{ node: RagNode; vec: number[] }> = []
      if (chunkVectors !== undefined) {
        chunkVectors.forEach((vec, i) => committed.push({ node: chunk[i], vec }))
      } else {
        // §5.2 caller fallback — re-embed exactly this CHUNK's texts
        // per-item. W3 embed-failure policy (§5.9 #46): a per-item rejection
        // here is a transient skip (logged) + the build continues — the
        // chunk's remaining nodes still land.
        for (const node of chunk) {
          try {
            committed.push({ node, vec: await embedFn(node.content) })
          } catch (e) {
            skipped.set(node.id, 'transient')
            warnTransientSkip(node.id, e)
          }
        }
      }
      for (const { node, vec } of committed) {
        // F-W2-1 — a zero-length (or non-array) vector is malformed: never
        // stored (an [] vector poisons later cosineSimilarity calls) and never
        // used to latch the dimension.
        if (!Array.isArray(vec) || vec.length === 0) {
          throw new Error('createVectorIndex: malformed response (zero-length vector)')
        }
        // F6 — validate each vector's length against the first (dimension
        // consistency across nodes).
        if (!dimensionSet) {
          dimension = vec.length
          dimensionSet = true
        } else if (vec.length !== dimension) {
          throw new Error(`createVectorIndex: dimension mismatch (expected ${dimension}, got ${vec.length})`)
        }
        embeddings.set(node.id, vec)
        nodeIds.push(node.id)
      }
    }
    return { nodeIds, embeddings, dimension, skipped }
  }
  for (const node of nodes) {
    // UNIT-F-SKIP-EMPTY (F10, was mislabelled "F9") — skip empty/whitespace-
    // content nodes: ollama's /api/embed returns `{ embeddings: [] }` for an
    // empty input, which the embed fn rejects as "malformed response" (a boot
    // crash on any corpus with an empty node). An empty-text node has no
    // retrieval value, so it is simply not indexed. W3: recorded 'empty' in
    // the skipped map.
    if (typeof node.content !== 'string' || node.content.trim() === '') {
      skipped.set(node.id, 'empty')
      continue
    }
    let vec: number[]
    try {
      vec = await embedFn(node.content)
    } catch (e) {
      // W3 embed-failure policy (§5.9 #46, failure class 3): a per-node embed
      // rejection is NOT propagated — record 'transient' + warn + the build
      // continues (retry = the node's next touch).
      skipped.set(node.id, 'transient')
      warnTransientSkip(node.id, e)
      continue
    }
    // F-W2-1 — a zero-length (or non-array) vector is malformed (the same
    // pinned message as the batch path).
    if (!Array.isArray(vec) || vec.length === 0) {
      throw new Error('createVectorIndex: malformed response (zero-length vector)')
    }
    if (!dimensionSet) {
      dimension = vec.length
      dimensionSet = true
    }
    // F6 — validate each vector's length against the first (dimension
    // consistency across nodes).
    else if (vec.length !== dimension) {
      throw new Error(`createVectorIndex: dimension mismatch (expected ${dimension}, got ${vec.length})`)
    }
    embeddings.set(node.id, vec)
    nodeIds.push(node.id)
  }
  return { nodeIds, embeddings, dimension, skipped }
}

/** Incremental content update: re-embed the node's new content, replace its
 *  embedding. If the node is NOT in the index, it is added. W3 (§5.9
 *  #45/#46): empty/whitespace content → the embedding is REMOVED + 'empty'
 *  (NO embed call); a per-node embed rejection → the previous embedding is
 *  REMOVED (the node scores 0 until a successful re-embed) + 'transient' —
 *  both RESOLVE (not propagated). */
export async function updateVectorIndex(index: VectorIndex, node: RagNode, embedFn: EmbedTextFn): Promise<void> {
  if (index === null || index === undefined || node === null || node === undefined || embedFn === null || embedFn === undefined) {
    throw new Error('vector index: index/node/embedFn required')
  }
  if (!index.nodeIds.includes(node.id)) {
    await addToVectorIndex(index, node, embedFn)
    return
  }
  // UNIT-F-SKIP-EMPTY (W3 extension) — the content became empty/whitespace/
  // non-string: the node's embedding is REMOVED from the index (an empty node
  // has no retrieval value — the same rule as the build), the id leaves
  // nodeIds, and NO embed call is made.
  if (typeof node.content !== 'string' || node.content.trim() === '') {
    removeIndexed(index, node.id)
    index.skipped.set(node.id, 'empty')
    return
  }
  let vec: number[]
  try {
    vec = await embedFn(node.content)
  } catch (e) {
    // W3 embed-failure policy (§5.9 #46): a per-node embed rejection is NOT
    // propagated — the previous embedding is REPLACED WITH NOTHING (the node
    // becomes unindexed — it scores 0 until a successful re-embed; the
    // 'transient' skip is the authoritative record) and the promise RESOLVES.
    removeIndexed(index, node.id)
    index.skipped.set(node.id, 'transient')
    warnTransientSkip(node.id, e)
    return
  }
  // F6 — validate the vector's length against the index dimension.
  if (index.dimension !== 0 && vec.length !== index.dimension) {
    throw new Error(`updateVectorIndex: dimension mismatch (expected ${index.dimension}, got ${vec.length})`)
  }
  // RCA-3 pass 2 (F3) — an index at dimension 0 (the post-outage shape:
  // promoted from an all-transient build) LATCHES its dimension on the first
  // successful re-embed, so subsequent wrong-length vectors reject with the
  // F6 message instead of silently poisoning the index.
  if (index.dimension === 0) index.dimension = vec.length
  index.embeddings.set(node.id, vec)
  // W3 — a successful re-embed deletes any skipped entry for the id.
  index.skipped.delete(node.id)
}

/** Incremental add: embed the node, add its embedding, append its id. If the
 *  node IS already in the index, it is updated. W3 (§5.9 #45/#46): empty/
 *  whitespace content → NOT added + 'empty' (NO embed call); a per-node embed
 *  rejection → NOT added + 'transient' — both RESOLVE (not propagated). */
export async function addToVectorIndex(index: VectorIndex, node: RagNode, embedFn: EmbedTextFn): Promise<void> {
  if (index === null || index === undefined || node === null || node === undefined || embedFn === null || embedFn === undefined) {
    throw new Error('vector index: index/node/embedFn required')
  }
  if (index.nodeIds.includes(node.id)) {
    await updateVectorIndex(index, node, embedFn)
    return
  }
  // UNIT-F-SKIP-EMPTY (W3 extension) — empty/whitespace/non-string content is
  // NEVER embedded (ollama rejects an empty input as `malformed response`):
  // the node is NOT added and is recorded 'empty'.
  if (typeof node.content !== 'string' || node.content.trim() === '') {
    index.skipped.set(node.id, 'empty')
    return
  }
  let vec: number[]
  try {
    vec = await embedFn(node.content)
  } catch (e) {
    // W3 embed-failure policy (§5.9 #46): a per-node embed rejection is NOT
    // propagated — the node is NOT added, recorded 'transient' (retried on
    // its next touch), and the promise RESOLVES.
    index.skipped.set(node.id, 'transient')
    warnTransientSkip(node.id, e)
    return
  }
  // F6 — validate the vector's length against the index dimension.
  if (index.dimension !== 0 && vec.length !== index.dimension) {
    throw new Error(`addToVectorIndex: dimension mismatch (expected ${index.dimension}, got ${vec.length})`)
  }
  // RCA-3 pass 2 (F3) — an index at dimension 0 (the post-outage shape:
  // promoted from an all-transient build) LATCHES its dimension on the first
  // successful add, so subsequent wrong-length adds reject with the F6
  // message instead of silently poisoning the index.
  if (index.dimension === 0) index.dimension = vec.length
  index.embeddings.set(node.id, vec)
  index.nodeIds.push(node.id)
  // W3 — a successful embed (a touch that re-classifies an 'empty'/'transient'
  // skip) deletes the skipped entry.
  index.skipped.delete(node.id)
}

/** Incremental remove: remove the node's embedding and id (and any `skipped`
 *  entry for the id). If the node is NOT in the index, it is a no-op.
 *  SYNCHRONOUS. */
export function removeFromVectorIndex(index: VectorIndex, nodeId: string): void {
  if (index === null || index === undefined || typeof nodeId !== 'string') {
    throw new Error('vector index: index/nodeId required')
  }
  removeIndexed(index, nodeId)
  index.skipped.delete(nodeId)
}

// ---------------------------------------------------------------------------
// §5.4 Cosine similarity + scoring
// ---------------------------------------------------------------------------

/** Cosine similarity between two embedding vectors. Range [-1, 1]. Deterministic. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a === null || a === undefined || b === null || b === undefined) {
    throw new Error('cosineSimilarity: a/b required')
  }
  if (a.length !== b.length) throw new Error('cosineSimilarity: dimension mismatch')
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

// ---------------------------------------------------------------------------
// §5.5 The vector embedder (createVectorEmbedder)
// ---------------------------------------------------------------------------

export interface VectorEmbedderOptions {
  /** The embedding provider config (provider kind, baseUrl, apiKey, model,
   *  dimension, timeoutMs — §5.2). The config is the ONLY thing that differs
   *  between providers. W1 (§5.12): an ALREADY-CREATED provider instance may
   *  be passed instead — the vector-boot controller hands its warmed provider
   *  here so the promoted embedder embeds through the SAME instance (no
   *  second provider is constructed). */
  provider: EmbeddingProviderConfig | EmbeddingProvider
  /** The placement minimum score threshold. Default PLACEMENT_MIN_SCORE (0). */
  placementMinScore?: number
  /** W1 (2026-09-05 amendment) — OPTIONAL prebuilt index: when supplied, the
   *  embedder ADOPTS it (NO build embeds happen inside
   *  `createVectorEmbedder`). The vector-boot controller builds the index in
   *  the BACKGROUND (§5.12 — cache/batch-aware) and hands the prebuilt index
   *  here for the promotion. Omitted (ALL existing calls and tests) → build
   *  from the store's nodes as today. */
  index?: VectorIndex
  /** W5 (§5.13 amendment, 2026-09-05) — the OPTIONAL persisted cache: when
   *  supplied, ALL the embedder's single-text embeds (the `score`
   *  query-embed — which is also `place()`'s content-embed — and the
   *  `onStoreChanged` maintenance embeds via addToVectorIndex/
   *  updateVectorIndex) route through the ONE single-text memoizer over this
   *  provider instance's tuple (a HIT adopts with NO HTTP call; a FAILED
   *  embed writes nothing). F1/F2 (RCA-3 pass 2): a QUERY-embed MISS is
   *  adopted IN-MEMORY ONLY (session-scoped — a repeated identical query
   *  still makes no HTTP call; nothing is persisted); only the MAINTENANCE
   *  (node-content) embeds write through on the cache's debounced
   *  single-writer queue. Absent (ALL W1–W3 callers/tests) → byte-identical
   *  `provider.embed` behavior. */
  cache?: VectorCache
}

/** Create the vector embedder. Builds the vector index from the store's nodes
 *  (embedding each once) via the configured provider — OR adopts
 *  `opts.index` (W1) when supplied. ASYNC. */
export async function createVectorEmbedder(store: RagStore, opts: VectorEmbedderOptions): Promise<Embedder> {
  if (store === null || store === undefined) throw new Error('createVectorEmbedder: store required')
  if (opts === null || opts === undefined || opts.provider === null || opts.provider === undefined) {
    throw new Error('createVectorEmbedder: provider config required')
  }
  // W1 (§5.12) — a supplied provider INSTANCE is adopted as-is; a config is
  // created via createEmbeddingProvider (unchanged).
  const provider = 'embed' in opts.provider
    ? opts.provider as EmbeddingProvider
    : createEmbeddingProvider(opts.provider as EmbeddingProviderConfig)
  // W1 (§5.5 amendment) — adopt the prebuilt index when supplied (NO build
  // embeds happen here; the vector-boot controller built it in the
  // background); omitted → build from the store's nodes as today.
  const index = opts.index ?? await createVectorIndex(store.listNodes(), provider.embed)
  const placementMinScore = opts.placementMinScore ?? PLACEMENT_MIN_SCORE
  // W5 (§5.13 amendment) — with a cache, the ONE memoizer over the provider
  // instance's tuple fronts every single-text live embed; without one the
  // raw `provider.embed` passes through byte-identically (W1–W3 unchanged —
  // the L5 guard). The internal-build path (no `opts.index`) is NOT a live
  // embed route and keeps the raw provider fn.
  // F1/F2 (the RCA-3 pass-2 ruling) — the CALLER distinction: the memoizer
  // is built with `persistMisses: false` (the default), so a QUERY-embed
  // miss (score/place — `embed(text)`) is adopted IN-MEMORY ONLY (session-
  // scoped, nothing on disk) while a MAINTENANCE (node-content) miss — the
  // onStoreChanged add/update embeds — calls `embed(text, { persist: true })`
  // and writes through (the live-upload write-through the user ordered).
  const memoizer = opts.cache
    ? createSingleTextMemoizer(provider, opts.cache, { persistMisses: false })
    : undefined
  const queryEmbedFn: EmbedTextFn = memoizer
    ? (text: string) => memoizer.embed(text)
    : (text: string) => provider.embed(text)
  const maintenanceEmbedFn: EmbedTextFn = memoizer
    ? (text: string) => memoizer.embed(text, { persist: true })
    : (text: string) => provider.embed(text)

  async function score(query: string, nodes: RagNode[]): Promise<ScoredNode[]> {
    if (typeof query !== 'string' || nodes === null || nodes === undefined) {
      throw new Error('embedder score: query/nodes required')
    }
    const qVec = await queryEmbedFn(query)
    // W3 (§5.8 #34, partial-index query semantics): a node absent from the
    // vector index (never indexed, transiently/empty skipped, or deleted)
    // scores 0 and is EXCLUDED — it is not scored at all (the engine's
    // score>0 `ranked` filter drops it either way, so the RetrievalResult is
    // identical).
    const scored: ScoredNode[] = []
    for (const node of nodes) {
      const nodeVec = index.embeddings.get(node.id)
      if (!nodeVec) continue
      scored.push({ nodeId: node.id, score: cosineSimilarity(qVec, nodeVec) })
    }
    scored.sort((a, b) => b.score - a.score || (a.nodeId < b.nodeId ? -1 : a.nodeId > b.nodeId ? 1 : 0))
    return scored
  }

  async function place(content: string, nodes: RagNode[], edges: RagEdge[]): Promise<PlacementDecision> {
    if (typeof content !== 'string' || nodes === null || nodes === undefined || edges === null || edges === undefined) {
      throw new Error('embedder place: content/nodes/edges required')
    }
    if (content.trim() === '') return { ok: false, reason: 'empty-content' }
    const scored = await score(content, nodes)
    const best = scored[0]
    if (!best || best.score <= placementMinScore) return { ok: false, reason: 'no-match' }
    const bestNode = nodes.find((n) => n.id === best.nodeId)
    let edgeKind: 'parent-child' | 'doc-child' | 'next-section'
    if (bestNode && (bestNode.type === 'ul' || bestNode.type === 'ol' || bestNode.type === 'div')) {
      edgeKind = 'doc-child'
    } else if (bestNode && (bestNode.type.startsWith('h') || bestNode.type === 'p')) {
      edgeKind = 'next-section'
    } else {
      edgeKind = 'parent-child'
    }
    return { ok: true, targetNodeId: best.nodeId, edgeKind, score: best.score }
  }

  async function onStoreChanged(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): Promise<void> {
    if (nodeIds === null || nodeIds === undefined) throw new Error('onStoreChanged: nodeIds required')
    for (const nodeId of nodeIds) {
      const node = store.getNode(nodeId)
      if (node) {
        // W5 (§5.13 amendment) — the maintenance embeds route through the
        // maintenance embed fn (memoized + PERSIST:true when a cache was
        // supplied — the node-content write-through; the raw provider fn
        // otherwise). W3's transient-skip policy is UNCHANGED: a failed
        // embed still resolves the hook and, memoized, writes nothing
        // through. (F1/F2: only THESE maintenance embeds persist — the
        // score/place query path is in-memory only.)
        if (index.nodeIds.includes(nodeId)) await updateVectorIndex(index, node, maintenanceEmbedFn)
        else await addToVectorIndex(index, node, maintenanceEmbedFn)
      } else {
        // RCA-3 pass 2 (F1) — the delete branch is UNCONDITIONAL:
        // removeFromVectorIndex no-ops for an id the index never saw, and
        // clears the skipped ('transient'/'empty') entry of a node deleted
        // while unindexed (§5.3 — a delete removes the entry; never a stale
        // forever-record).
        removeFromVectorIndex(index, nodeId)
      }
    }
  }

  return { score, place, onStoreChanged }
}

// ---------------------------------------------------------------------------
// §5.6 The mock embedder + the integration-test probe
// ---------------------------------------------------------------------------

/** A deterministic bag-of-words → fixed-dimension embedding (the mock's
 *  algorithm). Similar texts (sharing tokens) get similar vectors. */
function mockEmbedding(text: string, dim: number): number[] {
  const vec = new Array(dim).fill(0)
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  for (const t of tokens) {
    let h = 0
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
    vec[h % dim] += 1
  }
  return vec
}

/** Create a deterministic mock embedder for unit tests. Implements the async
 *  Embedder interface with NO provider dependency. Deterministic. */
export function createMockEmbedder(opts?: { dimension?: number }): Embedder {
  const dim = opts?.dimension ?? 4

  async function score(query: string, nodes: RagNode[]): Promise<ScoredNode[]> {
    if (typeof query !== 'string' || nodes === null || nodes === undefined) {
      throw new Error('embedder score: query/nodes required')
    }
    const qVec = mockEmbedding(query, dim)
    const scored: ScoredNode[] = nodes.map((node) => {
      const nodeVec = mockEmbedding(node.content, dim)
      return { nodeId: node.id, score: cosineSimilarity(qVec, nodeVec) }
    })
    scored.sort((a, b) => b.score - a.score || (a.nodeId < b.nodeId ? -1 : a.nodeId > b.nodeId ? 1 : 0))
    return scored
  }

  async function place(content: string, nodes: RagNode[], edges: RagEdge[]): Promise<PlacementDecision> {
    if (typeof content !== 'string' || nodes === null || nodes === undefined || edges === null || edges === undefined) {
      throw new Error('embedder place: content/nodes/edges required')
    }
    if (content.trim() === '') return { ok: false, reason: 'empty-content' }
    const scored = await score(content, nodes)
    const best = scored[0]
    if (!best || best.score <= PLACEMENT_MIN_SCORE) return { ok: false, reason: 'no-match' }
    const bestNode = nodes.find((n) => n.id === best.nodeId)
    let edgeKind: 'parent-child' | 'doc-child' | 'next-section'
    if (bestNode && (bestNode.type === 'ul' || bestNode.type === 'ol' || bestNode.type === 'div')) {
      edgeKind = 'doc-child'
    } else if (bestNode && (bestNode.type.startsWith('h') || bestNode.type === 'p')) {
      edgeKind = 'next-section'
    } else {
      edgeKind = 'parent-child'
    }
    return { ok: true, targetNodeId: best.nodeId, edgeKind, score: best.score }
  }

  return { score, place }
}

/** Detect whether the local ollama server is reachable. Pings the ollama
 *  endpoint with a short timeout. SYNCHRONOUS (a best-effort reachability
 *  probe). Never throws (a probe failure → false). */
export function isOllamaAvailable(baseUrl?: string): boolean {
  const url = baseUrl ?? 'http://127.0.0.1:11434'
  try {
    // F2 — validate the URL is a localhost/loopback address before probing (a
    // caller-supplied baseUrl must not be used to reach an arbitrary host).
    if (!isLocalhostHost(hostnameOf(url))) return false
    // F2 — use execFileSync (NO shell) so a caller-supplied baseUrl cannot
    // inject shell metacharacters into the probe command. A synchronous
    // reachability probe: spawn a short-lived curl to the ollama tags
    // endpoint. If curl is unavailable or the server does not respond within
    // the timeout, the probe fails → false (never throws).
    execFileSync('curl', ['-s', '-m', '1', '-o', '/dev/null', `${url}/api/tags`], { stdio: 'ignore', timeout: 1500 })
    return true
  } catch {
    return false
  }
}
