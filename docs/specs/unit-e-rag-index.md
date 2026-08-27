# Spec — Unit E: RAG Index + Retrieval

- **Status:** SPEC (first-milestone Unit E). Gate reference:
  `docs/specs/astrographer-review.md` §3d (lexical-first retrieval ENDORSE),
  §9.2.10 (retrieval selection), §8.2 (MCP/UI equivalence — a BINDING
  constraint on every unit that touches retrieval), §9.2.1 (PROJECT-JOURNAL),
  §9.2.6 (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS), §9.3 ("strays
  from the topic" re-scoping — the `Embedder` owns the semantic placement
  decision), §10.3 Q3 (the coarse line→node map), §13 (cross-document shared
  nodes). Decisions: `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL**,
  **RAG-EDIT-MCP-GROUPS**, **SINGLE-WRITER-STORE**, **SUBTREE-OWNERSHIP**,
  **CROSS-DOCUMENT-SHARED**.
- **Scope:** the main-process retrieval module — the interface-swappable
  `Embedder` (lexical-first BM25/tf-idf is the v1 default; vector embeddings,
  Unit F, are a drop-in behind the SAME interface), the lexical index
  (tokenization, term frequencies, document frequencies) kept consistent with
  edits, selection (score all RAG nodes, take top-k), graph traversal for
  context assembly (bounded), the coarse line→node map as a first-class
  assembly output, the `rag.query` MCP tool handler (the retrieval entry
  point), and MCP/UI equivalence. This unit does NOT implement vector
  embeddings (Unit F), crosslinks/backlinks (Unit G), or the full
  `rag.get_document` subtree scoping (Unit C). It defines the retrieval index
  + assembly those units build on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/retrieval.ts` from
  §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. A **lexical-first retrieval index** (BM25/tf-idf) behind an
   **interface-swappable `Embedder`** — deterministic, offline (no network
   egress), testable. Vector embeddings (Unit F) are a drop-in behind the same
   interface.
2. **Selection:** score all RAG nodes against a query, take top-k.
3. **Graph traversal for context assembly** (bounded): from the top-k nodes,
   walk the doc-flow edges (`next-section`/`doc-head`/`doc-end`) and the
   `parent-child`/`doc-child` edges to assemble the relevant document context.
4. The **coarse line→node map** (whole subtree → one RAG object) as a
   **first-class assembly output** — the "relevant document lines" problem
   (MarkdownAdapter drops `data-node-id`, D7), solved by carrying node mapping
   through the assembly step.
5. The **`rag.query` MCP tool** (the retrieval entry point) — full handler
   behavior through the five-seam gate.
6. **MCP/UI equivalence** — retrieval reachable equivalently through the MCP
   `rag` group and the UI (§8.2, a BINDING constraint).
7. **Determinism + testability** — no network egress, no randomness; every
   state and fail-state derivable.

## 2. Feasibility verdict

**Feasible — grounded in the review's lexical-first ENDORSE (§3d) and the
retrieval-selection resolution (§9.2.10).** The retrieval layer is net-new
host-side work (the foundation has no index/embeddings/similarity mechanism —
review §2 finding 1), but it is pure, deterministic, and composes the existing
`RagStore` interface (Unit A §5.4) + the render path (Unit C). No
engine/foundation gap blocks this unit. The `Embedder` interface is the
swappable seam; the lexical implementation is pure (no network, no
randomness). ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is SHELVED
2026-08-26 (markdown is export-only; the host-side line→node map covers it —
see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Lexical index (tokenization, TF, DF) | Project-specific (no foundation index) | Low cost; pure + deterministic. |
| `Embedder` interface + lexical (BM25) implementation | Project-specific (the swappable seam) | Low cost; the seam for the Unit F vector drop-in. |
| Selection (score all, top-k) | Project-specific | Low cost; deterministic tie-breaking. |
| Graph traversal for context assembly (bounded) | Project-specific (composes the RAG store + doc-flow edges) | Medium cost; the "relevant document context" assembly. |
| Coarse line→node map as a first-class assembly output | Project-specific (the assembly step; MarkdownAdapter drops node identity) | Low cost; the agent cites the RAG object, not a leaf. |
| `rag.query` MCP tool handler | Project-specific (Unit B registered it; Unit E implements the FULL behavior) | Low cost; reuses the five-seam gate. |
| MCP/UI equivalence for retrieval | Project-specific (both call the same retrieval module) | Low cost; reuses the IPC pattern (Unit D). |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only; the
host-side line→node map covers it — see `docs/pending.md`).

## 4. Design decisions pinned by this spec

- **LEXICAL-FIRST-RETRIEVAL:** retrieval is lexical-first (BM25/tf-idf) behind
  an interface-swappable `Embedder`; vector embeddings deferred (Unit F).
  Selection scores all RAG nodes, takes top-k, then assembles context by graph
  traversal (bounded). The line→node map is a first-class assembly output
  (coarse: whole subtree → one RAG object).
- **EMBEDDER-OWNS-PLACEMENT:** the `Embedder` owns the SEMANTIC PLACEMENT
  decision (which RAG node/edge a new section attaches to — review §9.3
  "strays from the topic" re-scoping). The lexical implementation scores the
  new content against existing nodes and returns the best-matching target + the
  edge kind.
- **INDEX-CONSISTENT-WITH-EDITS:** the lexical index is maintained
  incrementally — a content edit (`edit.set_content`) updates the affected
  node's term frequencies + recomputes document frequencies; a structural edit
  (node add/delete) adds/removes the node's terms. The index is reconciled on
  `rag-store-changed`.
- **DETERMINISTIC-RETRIEVAL:** no network egress, no randomness. BM25 with
  fixed default parameters (k1=1.2, b=0.75); tie-breaking by node id
  (lexicographic ascending). Same query + same store → same result.
- **MCP-UI-EQUIVALENCE:** retrieval is reachable equivalently through the MCP
  `rag.query` tool and the UI (a `rag-query` IPC), both calling the same
  retrieval module (§8.2, a BINDING constraint).

## 5. The exhaustive contract

### 5.1 Tokenization + the lexical index

```ts
// src/main/retrieval.ts (project-specific; pure, no Electron — operates on the
// RagStore interface, Unit A §5.4).

/** Tokenize text for lexical retrieval. Deterministic: lowercase, split on
 *  non-alphanumeric runs, drop empty tokens, drop stopwords. */
export function tokenize(text: string): string[]

/** The fixed default stopword set (a module constant). Configurable via
 *  LexicalEmbedderOptions.stopwords. */
export const DEFAULT_STOPWORDS: ReadonlySet<string>

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
export function createLexicalIndex(nodes: RagNode[]): LexicalIndex
/** Incremental content update: re-tokenize the node's new content, replace its
 *  term frequencies, recompute document frequencies for the changed terms, and
 *  recompute the average document length. */
export function updateLexicalIndex(index: LexicalIndex, node: RagNode): void
/** Incremental add: tokenize the node, add its term frequencies, increment the
 *  document frequencies for its terms, increment documentCount, recompute the
 *  average document length. */
export function addToLexicalIndex(index: LexicalIndex, node: RagNode): void
/** Incremental remove: remove the node's term frequencies, decrement the
 *  document frequencies for its terms, decrement documentCount, recompute the
 *  average document length. */
export function removeFromLexicalIndex(index: LexicalIndex, nodeId: string): void
```

**Tokenization rules** (`tokenize(text)`):

- Lowercase the input.
- Split on runs of non-alphanumeric characters (`/[^a-z0-9]+/`).
- Drop empty tokens.
- Drop tokens in the stopword set (default `DEFAULT_STOPWORDS`).
- Returns the token array in order. Deterministic.

**Index rules:**

- `createLexicalIndex(nodes)` — tokenizes each node's `content`, computes TF
  per node, DF per term, `documentCount = nodes.length`,
  `averageDocumentLength = totalTokens / documentCount` (0 if empty).
- `updateLexicalIndex(index, node)` — the node must already be in the index
  (its `nodeId` in `index.nodeIds`). Re-tokenizes the node's new content,
  replaces its TF, recomputes DF for the changed terms (decrement old terms,
  increment new terms), recomputes `averageDocumentLength`. If the node is NOT
  in the index, it is added (same as `addToLexicalIndex`).
- `addToLexicalIndex(index, node)` — the node must NOT already be in the index.
  Adds its TF, increments DF for its terms, increments `documentCount`,
  recomputes `averageDocumentLength`. If the node IS already in the index, it
  is updated (same as `updateLexicalIndex`).
- `removeFromLexicalIndex(index, nodeId)` — the node must be in the index.
  Removes its TF, decrements DF for its terms (a term whose DF reaches 0 is
  removed from `documentFrequencies`), decrements `documentCount`, recomputes
  `averageDocumentLength`. If the node is NOT in the index, it is a no-op.

**Fail-states:**

- `tokenize` with a non-string → throws `Error('tokenize: text must be a string')`.
- `createLexicalIndex` with null/undefined `nodes` → throws
  `Error('createLexicalIndex: nodes required')`.
- `updateLexicalIndex`/`addToLexicalIndex` with a null/undefined `index` or
  `node` → throws `Error('lexical index: index/node required')`.
- `removeFromLexicalIndex` with a null/undefined `index` or a non-string
  `nodeId` → throws `Error('lexical index: index/nodeId required')`.

### 5.2 The `Embedder` interface + the lexical (BM25) implementation

```ts
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
 *  decision. Deterministic (no network egress, no randomness). */
export interface Embedder {
  /** Score all RAG nodes against a query. Returns a ranked list (highest score
   *  first). Deterministic. */
  score(query: string, nodes: RagNode[]): ScoredNode[]
  /** The semantic placement decision: given a new section's content, which
   *  existing RAG node/edge it attaches to. */
  place(content: string, nodes: RagNode[], edges: RagEdge[]): PlacementDecision
}

export interface LexicalEmbedderOptions {
  /** BM25 k1 (default 1.2). */
  k1?: number
  /** BM25 b (default 0.75). */
  b?: number
  /** The stopword set (default DEFAULT_STOPWORDS). */
  stopwords?: ReadonlySet<string>
}

/** The lexical-first (BM25) implementation. Holds a reference to the
 *  LexicalIndex (maintained by the retrieval engine — §5.6). */
export function createLexicalEmbedder(index: LexicalIndex, opts?: LexicalEmbedderOptions): Embedder
```

**BM25 scoring** (`score(query, nodes)`):

- Tokenize the query.
- For each node, compute the BM25 score:
  ```
  score(q, d) = Σ over terms t in q of IDF(t) · (tf(t,d) · (k1 + 1)) / (tf(t,d) + k1 · (1 − b + b · |d| / avgdl))
  ```
  where `tf(t,d)` = the node's term frequency for t (from the index; 0 if
  absent), `|d|` = the node's token count (from the index), `avgdl` =
  `index.averageDocumentLength`, `k1`/`b` = the options (defaults 1.2/0.75),
  and `IDF(t) = ln(1 + (N − df(t) + 0.5) / (df(t) + 0.5))` where `N =
  index.documentCount` and `df(t)` = the document frequency of t (from the
  index).
- A node not in the index (or with no matching terms) scores 0.
- **Determinism:** the result is sorted by score descending, then by node id
  ascending (lexicographic) — a deterministic tie-break. Same query + same
  index + same nodes → same result.
- **Return:** a fresh array of `ScoredNode` (highest score first).

**Placement decision** (`place(content, nodes, edges)`):

- If `content` is empty/whitespace → `{ ok: false, reason: 'empty-content' }`.
- Score the new content against all existing nodes (treating the new content
  as the query — the same BM25 scoring).
- If the best score is below a fixed minimum threshold (`PLACEMENT_MIN_SCORE`,
  default 0) → `{ ok: false, reason: 'no-match' }`.
- Otherwise, return the best-matching node + the edge kind:
  - If the best match's `type` is a container (`ul`, `ol`, `div`) →
    `edgeKind: 'doc-child'` (the new section nests within it).
  - If the best match's `type` is a section (`h1`-`h6`, `p`) →
    `edgeKind: 'next-section'` (the new section follows it in document order).
  - Otherwise → `edgeKind: 'parent-child'`.
- **Determinism:** ties broken by node id ascending (same as `score`).

**Fail-states:**

- `createLexicalEmbedder` with a null/undefined `index` → throws
  `Error('createLexicalEmbedder: index required')`.
- `score` with a non-string `query` or null/undefined `nodes` → throws
  `Error('embedder score: query/nodes required')`.
- `place` with a non-string `content` or null/undefined `nodes`/`edges` →
  throws `Error('embedder place: content/nodes/edges required')`.

### 5.3 Selection (score all, take top-k)

```ts
/** Select the top-k scored RAG nodes. Deterministic. */
export function selectTopK(embedder: Embedder, query: string, nodes: RagNode[], k: number): ScoredNode[]
```

**Behavior:**

- Scores all nodes via `embedder.score(query, nodes)`.
- Sorts by score descending, then by node id ascending (tie-break).
- Takes the top-k. If `k` > the number of nodes, returns all scored nodes.
- Returns a fresh array of `ScoredNode` (highest score first).

**Fail-states:**

- `selectTopK` with a null/undefined `embedder`, a non-string `query`,
  null/undefined `nodes`, or a non-positive-integer `k` → throws
  `Error('selectTopK: embedder/query/nodes/k required')`.
- `k` < 1 → throws `Error('selectTopK: k must be a positive integer')`.

### 5.4 Graph traversal for context assembly (bounded)

```ts
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

/** Assemble the relevant document context by graph traversal from the top-k
 *  seed nodes. Bounded by maxNodes/maxDepth. Deterministic. */
export function assembleContext(store: RagStore, topK: ScoredNode[], opts: AssemblyOptions): AssemblyResult
```

**Traversal rules:**

- **Seeds:** the top-k scored nodes, in rank order (highest score first).
- **Edges followed:** from each node, follow the RAG edges (via
  `store.listEdges()`):
  - `next-section` (forward: source → target; backward: find the node whose
    `next-section` targets this node) — document-order neighbors.
  - `parent-child` (both directions) — family.
  - `doc-child` (both directions) — hierarchical nesting.
  - `doc-head`/`doc-end` (to anchor the document — include the head and end
    nodes).
- **BFS:** level 0 = the seeds. At each level, expand each node's neighbors (in
  sorted-by-node-id order), adding them to the context if not already visited
  and if `maxNodes` is not exceeded. Stop when the current level's expansion
  would exceed `maxNodes`, or when `maxDepth` levels have been processed.
- **Determinism:** seeds in rank order; neighbors in sorted-by-node-id order;
  BFS level by level. Same store + same seeds + same options → same context.
- **Bound:** the context size never exceeds `maxNodes`; the traversal depth
  never exceeds `maxDepth`.
- **Census:** `visited` = the context node ids in visit order; `depth` = the
  max BFS level reached; `nodeCount` = the number of context nodes.

**Line→node map (first-class assembly output):**

- The assembly step renders the context to markdown (via the render path —
  Unit C's `buildTraversal` + `renderProducingProcess` + `MarkdownAdapter`) and
  produces the coarse line→node map: each context RAG object → its line range
  in the rendered markdown.
- **Coarse by design:** all lines of a subtree's markdown map to the owning RAG
  object (the whole `ul`+`li` chunk), so the agent cites the RAG object, not a
  leaf (§10.3 Q3). Per-leaf citation is impossible by design (MarkdownAdapter
  drops `data-node-id`, D7).
- The line→node map is a READ aid (the agent cites the owning RAG object), not
  a write-back path (markdown is export-only — §11).

**Fail-states:**

- `assembleContext` with a null/undefined `store`, null/undefined `topK`, or
  null/undefined `opts` → throws `Error('assembleContext: store/topK/opts required')`.
- `opts.maxNodes` < 1 or `opts.maxDepth` < 0 → throws
  `Error('assembleContext: maxNodes/maxDepth invalid')`.
- An empty `topK` (no seeds) → returns an empty context (`context: []`,
  `markdown: ''`, `lineMap: { ranges: [] }`, `traversal: { visited: [],
  depth: 0, nodeCount: 0 }`) — no throw.

### 5.5 The retrieval entry point

```ts
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
 *  traversal. Deterministic. */
export function retrieve(store: RagStore, embedder: Embedder, index: LexicalIndex, query: string, opts: RetrievalOptions): RetrievalResult
```

**Behavior:**

- `k` defaults to 5; `maxNodes` defaults to 50; `maxDepth` defaults to 3.
- Scores all nodes via `selectTopK(embedder, query, store.listNodes(), k)`.
- Assembles the context via `assembleContext(store, ranked, { maxNodes,
  maxDepth })`.
- Returns the `RetrievalResult`.

**Fail-states:**

- `retrieve` with a null/undefined `store`/`embedder`/`index`, a non-string
  `query`, or null/undefined `opts` → throws
  `Error('retrieve: store/embedder/index/query/opts required')`.
- An empty/whitespace `query` → throws
  `Error('retrieve: query must be a non-empty string')`.
- `opts.k` < 1 → throws `Error('retrieve: k must be a positive integer')`.

### 5.6 The retrieval engine (index lifecycle + MCP/UI routing)

```ts
export interface RetrievalEngine {
  /** Run a retrieval query. Returns the ranked + assembled context + line map. */
  query(query: string, opts?: { k?: number }): RetrievalResult
  /** Update the index on a store change (content or structural). */
  onStoreChanged(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): void
}

/** Create the retrieval engine. Builds the index from the store on
 *  construction; maintains it on store changes. */
export function createRetrieval(store: RagStore, embedder: Embedder, opts?: RetrievalOptions): RetrievalEngine
```

**Engine behavior:**

- **Construction:** builds the index from the store's nodes
  (`createLexicalIndex(store.listNodes())`).
- **`query(query, { k })`:** calls `retrieve(store, embedder, index, query, {
  k, maxNodes, maxDepth })` and returns the result.
- **`onStoreChanged(kind, nodeIds, edgeIds)`:** reconciles the index for the
  affected nodeIds:
  - For each nodeId, read the node via `store.getNode(nodeId)`.
  - If the node exists and is in the index → `updateLexicalIndex` (content or
    structural).
  - If the node exists and is NOT in the index → `addToLexicalIndex`.
  - If the node does NOT exist and IS in the index → `removeFromLexicalIndex`.
  - Edge changes do not affect the index (edges are not indexed); `edgeIds` is
    accepted and ignored for index purposes.
- **Determinism:** the engine is deterministic (no network, no randomness).

**Fail-states:**

- `createRetrieval` with a null/undefined `store` or `embedder` → throws
  `Error('createRetrieval: store/embedder required')`.
- `query` with a non-string/empty `query` → throws
  `Error('retrieve: query must be a non-empty string')` (propagated from
  `retrieve`).
- `onStoreChanged` with a null/undefined `nodeIds` → throws
  `Error('onStoreChanged: nodeIds required')`.

### 5.7 The `rag.query` MCP tool + MCP/UI equivalence

**The `rag.query` tool (the retrieval entry point):**

Unit B §5.3 registered `rag.query` through the five-seam gate (read-only,
default-off). Unit E implements the FULL handler behavior:

- **Input schema (zod):** `{ query: string, topK?: number }`.
- **Handler (main-handled, `handleRagTool`):**
  - Validates the input against the zod schema.
  - `query` must be a non-empty string; `topK` (if given) must be a positive
    integer (default 5).
  - Calls the retrieval engine's `query(query, { k: topK })`.
  - Returns the JSON result: `{ query, ranked, context, markdown, lineMap, k }`.
- **The engine is created once in main** with the store + the lexical embedder
  (v1 default). The index is maintained on `rag-store-changed` (§5.6).
- **Gating:** the tool is callable only when the `rag` group is enabled
  (default-off — Unit B §5.3). A `rag.query` call with the group disabled →
  not registered, not callable.

**MCP/UI equivalence (§8.2, a BINDING constraint):**

- **UI retrieval path:** the renderer sends a `rag-query` IPC to main:
  `{ query: string, topK?: number }`. Main calls the SAME retrieval engine's
  `query` (the same function as the MCP `rag.query` tool) and returns the
  result.
- **Same module:** both the MCP `rag.query` tool and the UI `rag-query` IPC
  call the same retrieval engine (§5.6). Neither computes retrieval in the
  renderer.
- **Equivalence test:** an MCP `rag.query` and a UI `rag-query` IPC with the
  same params produce the same result (same ranked, context, markdown,
  lineMap).

**Fail-states:**

- `rag.query` with a non-string/empty `query` → the tool rejects it
  (`'rag.query: query must be a non-empty string'`).
- `rag.query` with a non-positive-integer `topK` → the tool rejects it
  (`'rag.query: topK must be a positive integer'`).
- `rag.query` with the `rag` group disabled → not registered, not callable
  (Unit B §5.3).
- A `rag.query` that reaches the renderer switch → `unknown method` throw
  (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`tokenize` happy:** `tokenize('Hello, World!')` → `['hello', 'world']`
   (lowercase, split, drop empty + stopwords).
2. **`createLexicalIndex` happy:** a node list → the index has the node ids,
   term frequencies, document frequencies, documentCount, and
   averageDocumentLength.
3. **`updateLexicalIndex` happy (content edit):** a content edit changes a
   node's text → the node's TF is replaced, DF recomputed for the changed
   terms, averageDocumentLength recomputed.
4. **`addToLexicalIndex` happy (node add):** a new node → its TF added, DF
   incremented, documentCount incremented.
5. **`removeFromLexicalIndex` happy (node delete):** a node removed → its TF
   removed, DF decremented, documentCount decremented.
6. **`createLexicalEmbedder` + `score` happy:** a query matching a node's
   content → the node scores > 0; the result is ranked highest-first.
7. **BM25 determinism:** the same query + same index + same nodes → the same
   ranked result (twice).
8. **BM25 tie-break:** two nodes with equal scores → sorted by node id
   ascending.
9. **`place` happy:** a new section's content matches an existing section →
   `{ ok: true, targetNodeId, edgeKind: 'next-section', score }`.
10. **`place` container match:** a new section's content matches a `ul`/`ol`/
    `div` node → `edgeKind: 'doc-child'`.
11. **`selectTopK` happy:** a query + nodes + k → the top-k scored nodes,
    highest-first.
12. **`selectTopK` k > node count:** k larger than the node count → all scored
    nodes returned.
13. **`assembleContext` happy:** top-k seeds → the context assembled by graph
    traversal (bounded), with the markdown + line map.
14. **`assembleContext` bound:** a large graph → the context never exceeds
    `maxNodes`; the depth never exceeds `maxDepth`.
15. **`assembleContext` empty seeds:** an empty top-k → an empty context (no
    throw).
16. **`retrieve` happy:** a query → the ranked + context + markdown + lineMap.
17. **`createRetrieval` + `query` happy:** the engine returns the retrieval
    result.
18. **`onStoreChanged` content:** a content edit → the index updated for the
    affected node.
19. **`onStoreChanged` structural add:** a node add → the index adds the node.
20. **`onStoreChanged` structural delete:** a node delete → the index removes
    the node.
21. **`rag.query` happy:** a valid query → the tool returns the retrieval
    result.
22. **MCP/UI equivalence happy:** an MCP `rag.query` and a UI `rag-query` IPC
    with the same params → the same result.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`tokenize` non-string** → throws `Error('tokenize: text must be a string')`.
2. **`createLexicalIndex` null/undefined nodes** → throws
   `Error('createLexicalIndex: nodes required')`.
3. **`updateLexicalIndex`/`addToLexicalIndex` null/undefined index or node** →
   throws `Error('lexical index: index/node required')`.
4. **`removeFromLexicalIndex` null/undefined index or non-string nodeId** →
   throws `Error('lexical index: index/nodeId required')`.
5. **`createLexicalEmbedder` null/undefined index** → throws
   `Error('createLexicalEmbedder: index required')`.
6. **`score` non-string query or null/undefined nodes** → throws
   `Error('embedder score: query/nodes required')`.
7. **`place` non-string content or null/undefined nodes/edges** → throws
   `Error('embedder place: content/nodes/edges required')`.
8. **`place` empty content** → `{ ok: false, reason: 'empty-content' }`.
9. **`place` no match** → `{ ok: false, reason: 'no-match' }`.
10. **`selectTopK` null/undefined embedder, non-string query, null/undefined
    nodes, or non-positive-integer k** → throws
    `Error('selectTopK: embedder/query/nodes/k required')`.
11. **`selectTopK` k < 1** → throws `Error('selectTopK: k must be a positive integer')`.
12. **`assembleContext` null/undefined store/topK/opts** → throws
    `Error('assembleContext: store/topK/opts required')`.
13. **`assembleContext` maxNodes < 1 or maxDepth < 0** → throws
    `Error('assembleContext: maxNodes/maxDepth invalid')`.
14. **`retrieve` null/undefined store/embedder/index, non-string query, or
    null/undefined opts** → throws
    `Error('retrieve: store/embedder/index/query/opts required')`.
15. **`retrieve` empty/whitespace query** → throws
    `Error('retrieve: query must be a non-empty string')`.
16. **`retrieve` k < 1** → throws `Error('retrieve: k must be a positive integer')`.
17. **`createRetrieval` null/undefined store or embedder** → throws
    `Error('createRetrieval: store/embedder required')`.
18. **`onStoreChanged` null/undefined nodeIds** → throws
    `Error('onStoreChanged: nodeIds required')`.
19. **`rag.query` non-string/empty query** → the tool rejects it
    (`'rag.query: query must be a non-empty string'`).
20. **`rag.query` non-positive-integer topK** → the tool rejects it
    (`'rag.query: topK must be a positive integer'`).
21. **`rag.query` with the `rag` group disabled** → not registered, not callable
    (Unit B §5.3).
22. **`rag.query` reaching the renderer switch** → `unknown method` throw
    (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.10 Census / numeric claims

- **BM25 parameters:** k1 = 1.2, b = 0.75 (defaults, configurable via
  `LexicalEmbedderOptions`).
- **Stopword set:** `DEFAULT_STOPWORDS` — a fixed module constant (a set of
  common English function words), configurable via
  `LexicalEmbedderOptions.stopwords`.
- **Placement threshold:** `PLACEMENT_MIN_SCORE` — a fixed constant (default 0);
  a best score below it is `no-match`.
- **Selection default:** k = 5.
- **Assembly bounds:** maxNodes = 50, maxDepth = 3 (defaults).
- **Index statistics:** documentCount, averageDocumentLength,
  termFrequencies (nodeId → term → count), documentFrequencies (term → count).
- **Retrieval outputs:** 5 (`ranked`, `context`, `markdown`, `lineMap`, `k`).
- **Edge kinds followed in traversal:** 5 (`next-section`, `parent-child`,
  `doc-child`, `doc-head`, `doc-end`).
- **`rag.*` tools:** 5 (registered in Unit B §5.5); Unit E implements the FULL
  behavior of `rag.query` (the retrieval entry point).
- **IPC method:** 1 (`rag-query`, renderer → main — the UI retrieval path).

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (RAG node/edge shapes), §5.4
  (the `RagStore` interface — the retrieval module depends on the interface,
  NOT the concrete JSON store, so the source is switchable).
- Unit B: `docs/specs/unit-b-document-model.md` §5.1 (doc-flow edge semantics —
  `next-section`/`doc-head`/`doc-end`/`doc-child`/`parent-child`), §5.3
  (five-seam gate — the `rag` group), §5.4 (the `rag.query` tool schema).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.6 (the coarse line→node
  map — the first-class assembly output), §5.2 (the render path —
  `buildTraversal` + `renderProducingProcess` + `MarkdownAdapter`).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.9 (the `rag-store-changed` event —
  the index-consistency trigger), §5.1.10 (the `edit-commit` IPC — the UI
  write-back pattern the `rag-query` IPC mirrors).
- Gate: `docs/specs/astrographer-review.md` §3d (lexical-first retrieval
  ENDORSE), §9.2.10 (retrieval selection), §8.2 (MCP/UI equivalence — a
  BINDING constraint), §9.2.1 (PROJECT-JOURNAL), §9.2.6 (SINGLE-WRITER-STORE),
  §9.2.7 (RAG-EDIT-MCP-GROUPS), §9.3 ("strays from the topic" re-scoping — the
  `Embedder` owns the semantic placement decision), §10.3 Q3 (the coarse
  line→node map), §13 (cross-document shared nodes).
- Decisions: `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL**,
  **RAG-EDIT-MCP-GROUPS**, **SINGLE-WRITER-STORE**, **SUBTREE-OWNERSHIP**,
  **CROSS-DOCUMENT-SHARED**.
- Pending: `docs/pending.md` (vector embeddings — Unit F, the drop-in behind
  the `Embedder` interface; document tabs — the multi-document render).
- Engine invariants: `node.md` §1.2 SI-1 (single-parent — the multi-parent
  duplicate model the traversal respects); `adapters.md` §4.7 D7
  (MarkdownAdapter drops `data-node-id` — the reason the line→node map is
  coarse).
