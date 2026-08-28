// src/main/retrieval.ts — Unit E: the RAG index + retrieval module
// (docs/specs/unit-e-rag-index.md). Pure, deterministic, no Electron — operates
// on the RagStore INTERFACE (Unit A §5.4), never the concrete JSON store.
//
// Scope: tokenization + the lexical index (§5.1), the interface-swappable
// Embedder + the lexical (BM25) implementation (§5.2), selection (§5.3), graph
// traversal for context assembly (§5.4), the retrieval entry point (§5.5), the
// retrieval engine (§5.6), and the rag.query MCP tool handler (§5.7).
//
// Determinism: no network egress, no randomness. BM25 with fixed defaults
// (k1=1.2, b=0.75); tie-breaking by node id (lexicographic ascending). Same
// query + same store → same result.
import type { RagNode, RagEdge, RagStore } from './rag-store.js'

// ---------------------------------------------------------------------------
// §5.1 Tokenization + the lexical index
// ---------------------------------------------------------------------------

/** The fixed default stopword set (a module constant). Configurable via
 *  LexicalEmbedderOptions.stopwords. */
export const DEFAULT_STOPWORDS: ReadonlySet<string> = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'being', 'but', 'by',
  'can', 'did', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'he', 'her',
  'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it',
  'its', 'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'ours', 'she',
  'so', 'than', 'that', 'the', 'their', 'theirs', 'them', 'then', 'these',
  'they', 'this', 'those', 'to', 'too', 'us', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with',
  'would', 'you', 'your', 'yours',
])

/** Tokenize text for lexical retrieval. Deterministic: lowercase, split on
 *  non-alphanumeric runs, drop empty tokens, drop stopwords. F6 — the split
 *  boundary is UNICODE-aware (`\p{L}` letters / `\p{N}` numbers, `u` flag), so
 *  non-ASCII letters/numbers are kept as token characters rather than split
 *  into boundaries. ASCII behavior is unchanged (a-z/0-9 are `\p{L}`/`\p{N}`). */
export function tokenize(text: string): string[] {
  if (typeof text !== 'string') throw new Error('tokenize: text must be a string')
  return tokenizeWithStopwords(text, DEFAULT_STOPWORDS)
}

function tokenizeWithStopwords(text: string, stopwords: ReadonlySet<string>): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    // Drop empty tokens and stopwords (§5.1 — a stopword is dropped regardless
    // of length; 'a'/'i' are in DEFAULT_STOPWORDS and are dropped too).
    .filter((t) => t !== '' && !stopwords.has(t))
}

/** Unit Q — return a node's FULL searchable text: content + the content of
 *  every inline child (in order), space-joined after dropping empty strings.
 *  Pure + deterministic. Reads the Unit M `children?: RagNodeChild[]` field. */
export function nodeText(node: RagNode): string {
  if (node === null || node === undefined) throw new Error('nodeText: node required')
  return [node.content, ...(node.children ?? []).map((c) => c.content)]
    .filter((s) => s !== '')
    .join(' ')
}

/** The lexical index — the maintained term/document statistics over the RAG
 *  node content. */
export interface LexicalIndex {
  /** The indexed RAG node ids, in insertion order. */
  nodeIds: string[]
  /** Term frequencies per node: nodeId → term → count. */
  termFrequencies: Map<string, Map<string, number>>
  /** Document frequencies: term → number of indexed nodes containing it. */
  documentFrequencies: Map<string, number>
  /** The number of indexed nodes. */
  documentCount: number
  /** The average document length (in tokens) across indexed nodes. */
  averageDocumentLength: number
}

/** Build the index from a node list (boot). */
export function createLexicalIndex(nodes: RagNode[]): LexicalIndex {
  if (nodes === null || nodes === undefined) throw new Error('createLexicalIndex: nodes required')
  const nodeIds: string[] = []
  const termFrequencies = new Map<string, Map<string, number>>()
  const documentFrequencies = new Map<string, number>()
  let totalTokens = 0
  for (const node of nodes) {
    const tf = new Map<string, number>()
    for (const t of tokenize(nodeText(node))) tf.set(t, (tf.get(t) ?? 0) + 1)
    termFrequencies.set(node.id, tf)
    nodeIds.push(node.id)
    for (const [t, c] of tf) {
      documentFrequencies.set(t, (documentFrequencies.get(t) ?? 0) + 1)
      totalTokens += c
    }
  }
  const documentCount = nodes.length
  return {
    nodeIds,
    termFrequencies,
    documentFrequencies,
    documentCount,
    averageDocumentLength: documentCount > 0 ? totalTokens / documentCount : 0,
  }
}

function recomputeAverageDocumentLength(index: LexicalIndex): void {
  let total = 0
  for (const tf of index.termFrequencies.values()) {
    for (const c of tf.values()) total += c
  }
  index.averageDocumentLength = index.documentCount > 0 ? total / index.documentCount : 0
}

/** Incremental content update: re-tokenize the node's new content, replace its
 *  term frequencies, recompute document frequencies for the changed terms, and
 *  recompute the average document length. If the node is NOT in the index, it
 *  is added (same as addToLexicalIndex). */
export function updateLexicalIndex(index: LexicalIndex, node: RagNode): void {
  if (index === null || index === undefined || node === null || node === undefined) {
    throw new Error('lexical index: index/node required')
  }
  if (!index.nodeIds.includes(node.id)) {
    addToLexicalIndex(index, node)
    return
  }
  const oldTF = index.termFrequencies.get(node.id) ?? new Map<string, number>()
  const newTF = new Map<string, number>()
  for (const t of tokenize(nodeText(node))) newTF.set(t, (newTF.get(t) ?? 0) + 1)
  // decrement DF for terms removed from this node
  for (const t of oldTF.keys()) {
    if (!newTF.has(t)) {
      const df = (index.documentFrequencies.get(t) ?? 0) - 1
      if (df <= 0) index.documentFrequencies.delete(t)
      else index.documentFrequencies.set(t, df)
    }
  }
  // increment DF for terms newly added to this node
  for (const t of newTF.keys()) {
    if (!oldTF.has(t)) index.documentFrequencies.set(t, (index.documentFrequencies.get(t) ?? 0) + 1)
  }
  index.termFrequencies.set(node.id, newTF)
  recomputeAverageDocumentLength(index)
}

/** Incremental add: tokenize the node, add its term frequencies, increment the
 *  document frequencies for its terms, increment documentCount, recompute the
 *  average document length. If the node IS already in the index, it is updated
 *  (same as updateLexicalIndex). */
export function addToLexicalIndex(index: LexicalIndex, node: RagNode): void {
  if (index === null || index === undefined || node === null || node === undefined) {
    throw new Error('lexical index: index/node required')
  }
  if (index.nodeIds.includes(node.id)) {
    updateLexicalIndex(index, node)
    return
  }
  const tf = new Map<string, number>()
  for (const t of tokenize(nodeText(node))) tf.set(t, (tf.get(t) ?? 0) + 1)
  index.termFrequencies.set(node.id, tf)
  index.nodeIds.push(node.id)
  for (const t of tf.keys()) index.documentFrequencies.set(t, (index.documentFrequencies.get(t) ?? 0) + 1)
  index.documentCount++
  recomputeAverageDocumentLength(index)
}

/** Incremental remove: remove the node's term frequencies, decrement the
 *  document frequencies for its terms, decrement documentCount, recompute the
 *  average document length. If the node is NOT in the index, it is a no-op. */
export function removeFromLexicalIndex(index: LexicalIndex, nodeId: string): void {
  if (index === null || index === undefined || typeof nodeId !== 'string') {
    throw new Error('lexical index: index/nodeId required')
  }
  const pos = index.nodeIds.indexOf(nodeId)
  if (pos === -1) return // no-op
  const tf = index.termFrequencies.get(nodeId)
  if (tf) {
    for (const t of tf.keys()) {
      const df = (index.documentFrequencies.get(t) ?? 0) - 1
      if (df <= 0) index.documentFrequencies.delete(t)
      else index.documentFrequencies.set(t, df)
    }
  }
  index.termFrequencies.delete(nodeId)
  index.nodeIds.splice(pos, 1)
  index.documentCount--
  recomputeAverageDocumentLength(index)
}

// ---------------------------------------------------------------------------
// §5.2 The Embedder interface + the lexical (BM25) implementation
// ---------------------------------------------------------------------------

/** A scored RAG node. */
export interface ScoredNode {
  nodeId: string
  score: number
}

/** The semantic placement decision — which existing RAG node/edge a new section
 *  attaches to (the "strays from the topic" re-scoping — review §9.3). */
export type PlacementDecision =
  | { ok: true; targetNodeId: string; edgeKind: 'parent-child' | 'doc-child' | 'next-section'; score: number }
  | { ok: false; reason: 'no-match' | 'empty-content' }

/** The interface-swappable scoring engine. The lexical-first implementation
 *  (BM25/tf-idf) is the v1 default; vector embeddings (Unit F) are a drop-in
 *  behind the SAME interface. The Embedder owns the SEMANTIC PLACEMENT
 *  decision. Deterministic (no network egress, no randomness).
 *
 *  **ASYNC (Unit F amendment, 2026-08-27):** the interface is ASYNC — `score`
 *  and `place` return Promises. A vector embedder (Unit F) must compute the
 *  query embedding via an async provider call, so the interface is async to
 *  fit a network-backed embedder. The lexical embedder wraps its synchronous
 *  computation in a resolved promise. The optional `onStoreChanged?` lifecycle
 *  hook lets a stateful embedder (e.g. the vector embedder's vector index)
 *  reconcile its own state on a store change. */
export interface Embedder {
  /** Score all RAG nodes against a query. Returns a ranked list (highest score
   *  first). Deterministic. ASYNC. */
  score(query: string, nodes: RagNode[]): Promise<ScoredNode[]>
  /** The semantic placement decision: given a new section's content, which
   *  existing RAG node/edge it attaches to. ASYNC. */
  place(content: string, nodes: RagNode[], edges: RagEdge[]): Promise<PlacementDecision>
  /** Optional lifecycle hook: reconcile the embedder's own state (e.g. a vector
   *  index) on a store change. The retrieval engine calls it (if present) after
   *  its own index reconciliation (§5.6). ASYNC. */
  onStoreChanged?(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): Promise<void>
}

export interface LexicalEmbedderOptions {
  /** BM25 k1 (default 1.2). */
  k1?: number
  /** BM25 b (default 0.75). */
  b?: number
  /** The stopword set (default DEFAULT_STOPWORDS). */
  stopwords?: ReadonlySet<string>
}

/** The placement minimum score — a best score at or below this is `no-match`.
 *  Fixed constant (default 0). */
export const PLACEMENT_MIN_SCORE = 0

/** Module-private marker: the `LexicalIndex` a `createLexicalEmbedder`-created
 *  `Embedder` scores against. The retrieval engine (F2) reads it so it can
 *  share the SAME maintained index with the lexical (v1 default) embedder —
 *  `onStoreChanged` then updates the index the embedder actually references. A
 *  non-lexical drop-in embedder (a vector embedder, Unit F) has no such marker
 *  and the engine maintains its own index (a no-op for scoring — such an
 *  embedder computes scores from the live node content). */
const LEXICAL_INDEX = Symbol('lexical-index')
type LexicalEmbedder = Embedder & { [LEXICAL_INDEX]: LexicalIndex }

/** The lexical-first (BM25) implementation. Holds a reference to the
 *  LexicalIndex (maintained by the retrieval engine — §5.6). */
export function createLexicalEmbedder(index: LexicalIndex, opts?: LexicalEmbedderOptions): Embedder {
  if (index === null || index === undefined) throw new Error('createLexicalEmbedder: index required')
  const k1 = opts?.k1 ?? 1.2
  const b = opts?.b ?? 0.75
  const stopwords = opts?.stopwords ?? DEFAULT_STOPWORDS

  function score(query: string, nodes: RagNode[]): Promise<ScoredNode[]> {
    if (typeof query !== 'string' || nodes === null || nodes === undefined) {
      return Promise.reject(new Error('embedder score: query/nodes required'))
    }
    const qTokens = tokenizeWithStopwords(query, stopwords)
    const N = index.documentCount
    const avgdl = index.averageDocumentLength
    const scored: ScoredNode[] = nodes.map((node) => {
      const tf = index.termFrequencies.get(node.id)
      const docLen = tf ? [...tf.values()].reduce((s, c) => s + c, 0) : 0
      let s = 0
      for (const t of qTokens) {
        const df = index.documentFrequencies.get(t) ?? 0
        if (df === 0) continue
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5))
        const tfT = tf?.get(t) ?? 0
        if (tfT === 0) continue
        const lenRatio = avgdl === 0 ? 0 : docLen / avgdl
        const denom = tfT + k1 * (1 - b + b * lenRatio)
        s += idf * ((tfT * (k1 + 1)) / denom)
      }
      return { nodeId: node.id, score: s }
    })
    scored.sort((a, b) => b.score - a.score || (a.nodeId < b.nodeId ? -1 : a.nodeId > b.nodeId ? 1 : 0))
    return Promise.resolve(scored)
  }

  function place(content: string, nodes: RagNode[], edges: RagEdge[]): Promise<PlacementDecision> {
    if (typeof content !== 'string' || nodes === null || nodes === undefined || edges === null || edges === undefined) {
      return Promise.reject(new Error('embedder place: content/nodes/edges required'))
    }
    if (content.trim() === '') return Promise.resolve({ ok: false, reason: 'empty-content' })
    return score(content, nodes).then((scored) => {
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
    })
  }

  const embedder: Embedder = { score, place }
  // F2 — tag the lexical embedder with the index it references, so the
  // retrieval engine can share it (the engine maintains the index the embedder
  // scores against). The public `Embedder` shape is unchanged.
  ;(embedder as LexicalEmbedder)[LEXICAL_INDEX] = index
  return embedder
}

// ---------------------------------------------------------------------------
// §5.3 Selection (score all, take top-k)
// ---------------------------------------------------------------------------

/** Select the top-k scored RAG nodes. Deterministic. ASYNC (Unit F amendment —
 *  awaits the embedder's async `score`). */
export async function selectTopK(embedder: Embedder, query: string, nodes: RagNode[], k: number): Promise<ScoredNode[]> {
  if (embedder === null || embedder === undefined || typeof query !== 'string' || nodes === null || nodes === undefined) {
    throw new Error('selectTopK: embedder/query/nodes/k required')
  }
  // A non-integer k (1.5) or NaN is a non-positive-integer k → the required error.
  if (typeof k !== 'number' || !Number.isInteger(k)) {
    throw new Error('selectTopK: embedder/query/nodes/k required')
  }
  if (k < 1) throw new Error('selectTopK: k must be a positive integer')
  const scored = await embedder.score(query, nodes)
  scored.sort((a, b) => b.score - a.score || (a.nodeId < b.nodeId ? -1 : a.nodeId > b.nodeId ? 1 : 0))
  return scored.slice(0, k)
}

// ---------------------------------------------------------------------------
// §5.4 Graph traversal for context assembly (bounded)
// ---------------------------------------------------------------------------

/** The coarse line→node map (first-class assembly output): each RAG object in
 *  the context → its line range in the rendered markdown. */
export interface LineNodeMap {
  ranges: Array<{ nodeId: string; startLine: number; endLine: number }>
}

export interface AssemblyOptions {
  /** The maximum number of RAG nodes in the assembled context (default 50). */
  maxNodes: number
  /** The maximum traversal depth from a seed node (default 3). */
  maxDepth: number
}

export interface AssemblyResult {
  /** The assembled context RAG nodes (bounded by maxNodes), in visit order. */
  context: RagNode[]
  /** The rendered markdown of the assembled context. */
  markdown: string
  /** The coarse line→node map (first-class assembly output): each RAG object in
   *  the context → its line range in `markdown`. */
  lineMap: LineNodeMap
  /** Traversal census. */
  traversal: { visited: string[]; depth: number; nodeCount: number }
}

/** Unit Q — render a node's full inline markdown: content + each inline child's
 *  markdown, concatenated DIRECTLY (no auto-inserted separator). A node WITHOUT
 *  children returns content unchanged. Pure + deterministic. */
function renderInlineText(n: RagNode): string {
  let text = n.content
  for (const c of n.children ?? []) {
    // F1 — skip empty-content children (consistent with nodeText's empty-string
    // filter): a `strong` child with content '' must not render `****`, an `em`
    // `**`, an `a` `[]()`, an `img` `![]()`.
    if (c.content === '') continue
    switch (c.type) {
      case 'strong': text += `**${c.content}**`; break
      case 'em':     text += `*${c.content}*`;   break
      // F2 — coerce href/src to string: a non-string value (e.g. `{}`) must not
      // coerce to garbage like `[object Object]`; it renders the empty-URL form.
      case 'a':      text += `[${c.content}](${typeof c.props?.href === 'string' ? c.props.href : ''})`; break
      case 'img':    text += `![${c.content}](${typeof c.props?.src === 'string' ? c.props.src : ''})`; break
    }
  }
  return text
}

function renderNode(n: RagNode): string {
  switch (n.type) {
    case 'h1': return `# ${renderInlineText(n)}`
    case 'h2': return `## ${renderInlineText(n)}`
    case 'h3': return `### ${renderInlineText(n)}`
    case 'h4': return `#### ${renderInlineText(n)}`
    case 'h5': return `##### ${renderInlineText(n)}`
    case 'h6': return `###### ${renderInlineText(n)}`
    case 'li': return `- ${renderInlineText(n)}`
    case 'blockquote': return `> ${renderInlineText(n)}`
    case 'pre': return `\`\`\`\n${renderInlineText(n)}\n\`\`\``
    case 'code': return `\`${renderInlineText(n)}\``
    default: return renderInlineText(n)
  }
}

function buildMarkdown(context: RagNode[]): { markdown: string; ranges: LineNodeMap['ranges'] } {
  const lines: string[] = []
  const ranges: LineNodeMap['ranges'] = []
  for (const n of context) {
    const startLine = lines.length
    const nodeLines = renderNode(n).split('\n')
    lines.push(...nodeLines)
    ranges.push({ nodeId: n.id, startLine, endLine: lines.length - 1 })
    lines.push('')
  }
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  return { markdown: lines.join('\n'), ranges }
}

/** Assemble the relevant document context by graph traversal from the top-k
 *  seed nodes. Bounded by maxNodes/maxDepth. Deterministic. */
export function assembleContext(store: RagStore, topK: ScoredNode[], opts: AssemblyOptions): AssemblyResult {
  if (store === null || store === undefined || topK === null || topK === undefined || opts === null || opts === undefined) {
    throw new Error('assembleContext: store/topK/opts required')
  }
  // F4 — `maxNodes` must be a positive INTEGER and `maxDepth` a non-negative
  // INTEGER. A non-numeric / non-integer / fractional bound is rejected (the
  // documented §5.9 fail-state) rather than silently mis-bounding the walk.
  if (
    !Number.isInteger(opts.maxNodes) || opts.maxNodes < 1 ||
    !Number.isInteger(opts.maxDepth) || opts.maxDepth < 0
  ) {
    throw new Error('assembleContext: maxNodes/maxDepth invalid')
  }
  const maxNodes = opts.maxNodes
  const maxDepth = opts.maxDepth
  const edges = store.listEdges()
  const visited = new Set<string>()
  const context: RagNode[] = []
  const visitOrder: string[] = []

  const addNode = (id: string): void => {
    if (visited.has(id) || context.length >= maxNodes) return
    const node = store.getNode(id)
    if (!node) return
    visited.add(id)
    context.push(node)
    visitOrder.push(id)
  }

  // Seeds in rank order (highest score first).
  for (const s of topK) addNode(s.nodeId)

  const neighbors = (nodeId: string): string[] => {
    const out = new Set<string>()
    for (const e of edges) {
      if (e.kind === 'next-section') {
        if (e.source === nodeId) out.add(e.target)
        if (e.target === nodeId) out.add(e.source) // backward: the node whose next-section targets this node
      } else if (e.kind === 'parent-child' || e.kind === 'doc-child') {
        if (e.source === nodeId) out.add(e.target)
        if (e.target === nodeId) out.add(e.source)
      } else if (e.kind === 'doc-head' || e.kind === 'doc-end') {
        if (e.source === nodeId) out.add(e.target) // anchor the document: include the head/end node
      }
    }
    return [...out].sort()
  }

  // BFS: level 0 = the seeds. At each level, expand each node's neighbors (in
  // sorted-by-node-id order), adding them if not already visited and if
  // maxNodes is not exceeded. Stop when the current level's expansion would
  // exceed maxNodes, or when maxDepth levels have been processed.
  let depth = 0
  let currentLevel = visitOrder.slice()
  while (currentLevel.length > 0 && depth < maxDepth) {
    const nextLevel: string[] = []
    for (const nodeId of currentLevel) {
      for (const nb of neighbors(nodeId)) {
        if (!visited.has(nb) && context.length < maxNodes) {
          addNode(nb)
          if (visited.has(nb)) nextLevel.push(nb)
        }
      }
    }
    currentLevel = nextLevel
    if (nextLevel.length > 0) depth++
  }

  const { markdown, ranges } = buildMarkdown(context)
  return {
    context,
    markdown,
    lineMap: { ranges },
    traversal: { visited: visitOrder, depth, nodeCount: context.length },
  }
}

// ---------------------------------------------------------------------------
// §5.5 The retrieval entry point
// ---------------------------------------------------------------------------

export interface RetrievalOptions {
  /** The top-k to select (default 5). */
  k?: number
  /** The context assembly bound (default 50). */
  maxNodes?: number
  /** The context assembly depth bound (default 3). */
  maxDepth?: number
}

export interface RetrievalResult {
  query: string
  /** The top-k ranked RAG nodes (highest score first). */
  ranked: ScoredNode[]
  /** The assembled context RAG nodes (bounded). */
  context: RagNode[]
  /** The rendered markdown of the assembled context. */
  markdown: string
  /** The coarse line→node map (first-class assembly output). */
  lineMap: LineNodeMap
  /** The k used. */
  k: number
}

/** The retrieval entry point: select top-k, then assemble context by graph
 *  traversal. Deterministic. ASYNC (Unit F amendment — awaits the embedder's
 *  async `score` via `selectTopK`). */
export async function retrieve(
  store: RagStore,
  embedder: Embedder,
  index: LexicalIndex,
  query: string,
  opts: RetrievalOptions,
): Promise<RetrievalResult> {
  if (
    store === null || store === undefined ||
    embedder === null || embedder === undefined ||
    index === null || index === undefined ||
    typeof query !== 'string' ||
    opts === null || opts === undefined
  ) {
    throw new Error('retrieve: store/embedder/index/query/opts required')
  }
  if (query.trim() === '') throw new Error('retrieve: query must be a non-empty string')
  // F4 — the zero-token (stopword-only) check is LEXICAL-specific: a lexical
  // embedder cannot score a query that tokenizes to zero tokens (the documented
  // empty-query fail-state — Unit E F5). A vector embedder CAN embed a
  // stopword-only query (e.g. 'the'), so the check is gated on the lexical
  // embedder (detected via the LEXICAL_INDEX marker).
  const isLexical = (embedder as { [LEXICAL_INDEX]?: unknown })[LEXICAL_INDEX] !== undefined
  if (isLexical && tokenize(query).length === 0) throw new Error('retrieve: query must be a non-empty string')
  const k = opts.k ?? 5
  if (typeof k !== 'number' || !Number.isInteger(k) || k < 1) {
    throw new Error('retrieve: k must be a positive integer')
  }
  const maxNodes = opts.maxNodes ?? 50
  const maxDepth = opts.maxDepth ?? 3
  // The ranked result excludes irrelevant (score ≤ 0) nodes — a retrieval
  // returns only nodes that actually match the query. (selectTopK itself still
  // returns the full scored list including score-0 nodes when k exceeds the
  // node count — §5.3 test 12.)
  const ranked = (await selectTopK(embedder, query, store.listNodes(), k)).filter((s) => s.score > 0)
  const assembled = assembleContext(store, ranked, { maxNodes, maxDepth })
  return {
    query,
    ranked,
    context: assembled.context,
    markdown: assembled.markdown,
    lineMap: assembled.lineMap,
    k,
  }
}

// ---------------------------------------------------------------------------
// §5.6 The retrieval engine (index lifecycle + MCP/UI routing)
// ---------------------------------------------------------------------------

export interface RetrievalEngine {
  /** Run a retrieval query. Returns the ranked + assembled context + line map.
   *  ASYNC (Unit F amendment — awaits the embedder's async `score`). */
  query(query: string, opts?: { k?: number }): Promise<RetrievalResult>
  /** Update the index on a store change (content or structural). ASYNC (Unit F
   *  amendment — forwards to the embedder's `onStoreChanged` hook, if present). */
  onStoreChanged(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): Promise<void>
}

/** Create the retrieval engine. Builds the index from the store on
 *  construction; maintains it on store changes. F2 — the passed `embedder` IS
 *  used (the interface-swappable seam). For a lexical embedder the engine
 *  shares the SAME index the embedder references, so `onStoreChanged` keeps the
 *  index the embedder scores against consistent (the tests observe the index
 *  via the engine's query). For any other drop-in embedder (no exposed index)
 *  the engine maintains its own index. */
export function createRetrieval(store: RagStore, embedder: Embedder, opts?: RetrievalOptions): RetrievalEngine {
  if (store === null || store === undefined || embedder === null || embedder === undefined) {
    throw new Error('createRetrieval: store/embedder required')
  }
  // F2 — the passed `embedder` IS used (the interface-swappable seam: a vector
  // embedder is a drop-in behind the same interface). For the lexical (v1
  // default) embedder the engine SHARES the index the embedder references
  // (LEXICAL_INDEX) so `onStoreChanged` keeps the index the embedder scores
  // against consistent. For any other embedder (no exposed index) the engine
  // maintains its own index (a no-op for scoring — such an embedder derives
  // scores from the live node content passed to `score`).
  const shared = (embedder as { [LEXICAL_INDEX]?: LexicalIndex })[LEXICAL_INDEX]
  const index = shared ?? createLexicalIndex(store.listNodes())
  const maxNodes = opts?.maxNodes ?? 50
  const maxDepth = opts?.maxDepth ?? 3

  return {
    query(query: string, qopts?: { k?: number }): Promise<RetrievalResult> {
      return retrieve(store, embedder, index, query, { k: qopts?.k, maxNodes, maxDepth })
    },
    async onStoreChanged(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): Promise<void> {
      if (nodeIds === null || nodeIds === undefined) throw new Error('onStoreChanged: nodeIds required')
      // edgeIds is accepted and ignored for index purposes (edges are not indexed).
      for (const nodeId of nodeIds) {
        const node = store.getNode(nodeId)
        if (node) {
          if (index.nodeIds.includes(nodeId)) updateLexicalIndex(index, node)
          else addToLexicalIndex(index, node)
        } else if (index.nodeIds.includes(nodeId)) {
          removeFromLexicalIndex(index, nodeId)
        }
      }
      // Unit F amendment — forward to the embedder's onStoreChanged hook (if
      // present) so a stateful embedder (e.g. the vector embedder's vector
      // index) reconciles its own state on the same store change.
      await embedder.onStoreChanged?.(kind, nodeIds, edgeIds)
    },
  }
}
