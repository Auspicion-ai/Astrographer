// src/main/embeddings.ts — Unit F: the vector embedder + embedding providers
// (docs/specs/unit-f-embeddings.md). Pure + async; no Electron — the HTTP call
// is a plain fetch to the configured endpoint.
//
// Scope: the embedding provider abstraction + config (§5.2), the ollama
// `embeddinggemma` concrete provider (the local test environment), the
// remote/cloud provider drop-in, the vector index (§5.3), cosine similarity
// scoring (§5.4), the vector embedder behind the async `Embedder` interface
// (§5.5), the deterministic mock embedder + the integration-test probe (§5.6).
import { execSync } from 'node:child_process'
import type { RagNode, RagStore, RagEdge } from './rag-store.js'
import type { Embedder, PlacementDecision, ScoredNode } from './retrieval.js'
import { PLACEMENT_MIN_SCORE } from './retrieval.js'

// ---------------------------------------------------------------------------
// §5.2 The embedding provider abstraction + config
// ---------------------------------------------------------------------------

/** The embed function: text → embedding vector. ASYNC. */
export type EmbedTextFn = (text: string) => Promise<number[]>

/** The embedding provider config — the ONLY thing that differs between
 *  providers. */
export interface EmbeddingProviderConfig {
  provider: 'ollama' | 'openai' | 'cohere' | string
  baseUrl: string
  model: string
  apiKey?: string
  dimension?: number
  timeoutMs?: number
}

/** The provider abstraction — a configurable embedding provider. */
export interface EmbeddingProvider {
  readonly kind: string
  readonly model: string
  readonly baseUrl: string
  readonly dimension: number
  embed(text: string): Promise<number[]>
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
  return createRemoteEmbedProvider({ baseUrl: config.baseUrl, model: config.model, apiKey: config.apiKey, dimension: config.dimension, timeoutMs: config.timeoutMs, kind: config.provider })
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
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
}

function hostnameOf(baseUrl: string): string {
  try {
    return new URL(baseUrl).hostname
  } catch {
    return ''
  }
}

/** Create the ollama embed provider — ONE concrete provider config (the local
 *  test environment). The returned provider embeds a single text via a
 *  localhost HTTP POST to ollama's embeddings endpoint. */
export function createOllamaEmbedProvider(opts?: OllamaEmbedOptions): EmbeddingProvider {
  const baseUrl = opts?.baseUrl ?? 'http://127.0.0.1:11434'
  const model = opts?.model ?? 'embeddinggemma'
  const timeoutMs = opts?.timeoutMs ?? 5000
  const configuredDimension = opts?.dimension
  // LOCAL-SECURITY-POSTURE — the base URL is pinned to localhost/loopback.
  if (!isLocalhostHost(hostnameOf(baseUrl))) {
    throw new Error('createOllamaEmbedProvider: baseUrl must be localhost')
  }
  let dimension = configuredDimension ?? 0
  let dimensionSet = configuredDimension !== undefined

  async function embed(text: string): Promise<number[]> {
    if (typeof text !== 'string') throw new Error('ollama embed: text must be a string')
    const timeoutError = new Error(`ollama embed: timeout after ${timeoutMs}ms`)
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(timeoutError), timeoutMs)
    })
    let res: Response
    try {
      res = await Promise.race([
        fetch(`${baseUrl}/api/embed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, input: text }),
        }),
        timeoutPromise,
      ])
    } catch (e) {
      if (e === timeoutError) throw e
      const msg = e instanceof Error ? e.message : String(e)
      throw new Error(`ollama embed: ${msg}`)
    } finally {
      if (timer) clearTimeout(timer)
    }
    if (!res.ok) throw new Error(`ollama embed: HTTP ${res.status}`)
    let data: { embeddings?: unknown }
    try {
      data = await res.json() as { embeddings?: unknown }
    } catch {
      throw new Error('ollama embed: malformed response')
    }
    const embeddings = data?.embeddings
    if (!Array.isArray(embeddings) || !Array.isArray(embeddings[0])) {
      throw new Error('ollama embed: malformed response')
    }
    const vec = embeddings[0] as number[]
    if (!dimensionSet) {
      dimension = vec.length
      dimensionSet = true
    }
    if (vec.length !== dimension) {
      throw new Error(`ollama embed: dimension mismatch (expected ${dimension}, got ${vec.length})`)
    }
    return vec
  }

  return { kind: 'ollama', model, baseUrl, get dimension() { return dimension }, embed }
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
   *  Defaults to 'remote'. */
  kind?: string
}

/** Create a remote/cloud embed provider — a drop-in behind the SAME
 *  EmbeddingProvider interface (different config: model URL, API key, model
 *  name). */
export function createRemoteEmbedProvider(opts: RemoteEmbedOptions): EmbeddingProvider {
  if (opts === null || opts === undefined || typeof opts.apiKey !== 'string' || opts.apiKey.trim() === '') {
    throw new Error('createRemoteEmbedProvider: apiKey required')
  }
  const baseUrl = opts.baseUrl
  const model = opts.model
  const timeoutMs = opts.timeoutMs ?? 5000
  const configuredDimension = opts.dimension
  const kind = opts.kind ?? 'remote'
  const allowlisted = DEFAULT_CONNECT_SRC.has(hostnameOf(baseUrl))
  let dimension = configuredDimension ?? 0
  let dimensionSet = configuredDimension !== undefined

  async function embed(text: string): Promise<number[]> {
    if (typeof text !== 'string') throw new Error('remote embed: text must be a string')
    // REMOTE-SECURITY-POSTURE — fail-closed: the baseUrl origin must be in the
    // connect-src CSP allowlist.
    if (!allowlisted) throw new Error('remote embed: baseUrl not in connect-src allowlist')
    const timeoutError = new Error(`remote embed: timeout after ${timeoutMs}ms`)
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(timeoutError), timeoutMs)
    })
    let res: Response
    try {
      res = await Promise.race([
        fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.apiKey}` },
          body: JSON.stringify({ model, input: text }),
        }),
        timeoutPromise,
      ])
    } catch (e) {
      if (e === timeoutError) throw e
      const msg = e instanceof Error ? e.message : String(e)
      throw new Error(`remote embed: ${msg}`)
    } finally {
      if (timer) clearTimeout(timer)
    }
    if (!res.ok) throw new Error(`remote embed: HTTP ${res.status}`)
    let data: { data?: Array<{ embedding?: unknown }> }
    try {
      data = await res.json() as { data?: Array<{ embedding?: unknown }> }
    } catch {
      throw new Error('remote embed: malformed response')
    }
    const vec = data?.data?.[0]?.embedding
    if (!Array.isArray(vec)) throw new Error('remote embed: malformed response')
    if (!dimensionSet) {
      dimension = vec.length
      dimensionSet = true
    }
    if (vec.length !== dimension) {
      throw new Error(`remote embed: dimension mismatch (expected ${dimension}, got ${vec.length})`)
    }
    return vec as number[]
  }

  return { kind, model, baseUrl, get dimension() { return dimension }, embed }
}

// ---------------------------------------------------------------------------
// §5.3 The vector index
// ---------------------------------------------------------------------------

export interface VectorIndex {
  nodeIds: string[]
  embeddings: Map<string, number[]>
  dimension: number
}

/** Build the index from a node list (boot). Embeds each node's content once. */
export async function createVectorIndex(nodes: RagNode[], embedFn: EmbedTextFn): Promise<VectorIndex> {
  if (nodes === null || nodes === undefined || embedFn === null || embedFn === undefined) {
    throw new Error('createVectorIndex: nodes/embedFn required')
  }
  const nodeIds: string[] = []
  const embeddings = new Map<string, number[]>()
  let dimension = 0
  for (const node of nodes) {
    const vec = await embedFn(node.content)
    if (dimension === 0) dimension = vec.length
    embeddings.set(node.id, vec)
    nodeIds.push(node.id)
  }
  return { nodeIds, embeddings, dimension }
}

/** Incremental content update: re-embed the node's new content, replace its
 *  embedding. If the node is NOT in the index, it is added. */
export async function updateVectorIndex(index: VectorIndex, node: RagNode, embedFn: EmbedTextFn): Promise<void> {
  if (index === null || index === undefined || node === null || node === undefined || embedFn === null || embedFn === undefined) {
    throw new Error('vector index: index/node/embedFn required')
  }
  if (!index.nodeIds.includes(node.id)) {
    await addToVectorIndex(index, node, embedFn)
    return
  }
  const vec = await embedFn(node.content)
  index.embeddings.set(node.id, vec)
}

/** Incremental add: embed the node, add its embedding, append its id. If the
 *  node IS already in the index, it is updated. */
export async function addToVectorIndex(index: VectorIndex, node: RagNode, embedFn: EmbedTextFn): Promise<void> {
  if (index === null || index === undefined || node === null || node === undefined || embedFn === null || embedFn === undefined) {
    throw new Error('vector index: index/node/embedFn required')
  }
  if (index.nodeIds.includes(node.id)) {
    await updateVectorIndex(index, node, embedFn)
    return
  }
  const vec = await embedFn(node.content)
  index.embeddings.set(node.id, vec)
  index.nodeIds.push(node.id)
}

/** Incremental remove: remove the node's embedding and id. If the node is NOT
 *  in the index, it is a no-op. SYNCHRONOUS. */
export function removeFromVectorIndex(index: VectorIndex, nodeId: string): void {
  if (index === null || index === undefined || typeof nodeId !== 'string') {
    throw new Error('vector index: index/nodeId required')
  }
  const pos = index.nodeIds.indexOf(nodeId)
  if (pos === -1) return
  index.embeddings.delete(nodeId)
  index.nodeIds.splice(pos, 1)
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
  provider: EmbeddingProviderConfig
  placementMinScore?: number
}

/** Create the vector embedder. Builds the vector index from the store's nodes
 *  (embedding each once) via the configured provider. ASYNC. */
export async function createVectorEmbedder(store: RagStore, opts: VectorEmbedderOptions): Promise<Embedder> {
  if (store === null || store === undefined) throw new Error('createVectorEmbedder: store required')
  if (opts === null || opts === undefined || opts.provider === null || opts.provider === undefined) {
    throw new Error('createVectorEmbedder: provider config required')
  }
  const provider = createEmbeddingProvider(opts.provider)
  const index = await createVectorIndex(store.listNodes(), provider.embed)
  const placementMinScore = opts.placementMinScore ?? PLACEMENT_MIN_SCORE

  async function score(query: string, nodes: RagNode[]): Promise<ScoredNode[]> {
    if (typeof query !== 'string' || nodes === null || nodes === undefined) {
      throw new Error('embedder score: query/nodes required')
    }
    const qVec = await provider.embed(query)
    const scored: ScoredNode[] = nodes.map((node) => {
      const nodeVec = index.embeddings.get(node.id)
      const s = nodeVec ? cosineSimilarity(qVec, nodeVec) : 0
      return { nodeId: node.id, score: s }
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
        if (index.nodeIds.includes(nodeId)) await updateVectorIndex(index, node, provider.embed)
        else await addToVectorIndex(index, node, provider.embed)
      } else if (index.nodeIds.includes(nodeId)) {
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
    // A synchronous reachability probe: spawn a short-lived curl to the ollama
    // tags endpoint. If curl is unavailable or the server does not respond
    // within the timeout, the probe fails → false (never throws).
    execSync(`curl -s -m 1 -o /dev/null ${url}/api/tags`, { stdio: 'ignore', timeout: 1500 })
    return true
  } catch {
    return false
  }
}
