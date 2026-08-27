# Spec — Unit F: Vector Embeddings (Ollama `embeddinggemma`)

- **Status:** SPEC (later unit, Unit F). Gate reference:
  `docs/specs/astrographer-review.md` §3d (lexical-first retrieval ENDORSE,
  "vector later"), §9.2.10 (retrieval selection), §8.2 (MCP/UI equivalence — a
  BINDING constraint on every unit that touches retrieval), §9.2.6
  (SINGLE-WRITER-STORE), §9.3 ("strays from the topic" re-scoping — the
  `Embedder` owns the semantic placement decision). Decisions:
  `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL** (the `Embedder` is the
  drop-in seam for the Unit F vector implementation), **SINGLE-WRITER-STORE**,
  **RAG-EDIT-MCP-GROUPS**. Pending: `docs/pending.md` (vector embeddings — the
  deferred row; the "no network egress yet (the `connect-src` CSP allowlist for
  a declared network is an open tracked item)" constraint — a localhost ollama
  call is LOCAL, not external egress).
- **Scope:** the vector embedder behind the `Embedder` interface (the Unit E
  drop-in seam) — the ollama `embeddinggemma` provider (a localhost HTTP call,
  local-first, NO external network egress), the vector index (node id →
  embedding, maintained incrementally on store change), cosine similarity
  scoring, the **async `Embedder` interface amendment** (a Unit E contract
  amendment), the deterministic mock embedder for unit tests, the real-ollama
  INTEGRATION test path (the test environment), the config selection, and
  MCP/UI equivalence. This unit does NOT implement crosslinks/backlinks
  (Unit G) or a remote embedding provider (a pending SPECULATIVE item —
  `docs/pending.md`).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/embeddings.ts` (and
  the amended `src/main/retrieval.ts`) from §5.8/§5.9 before any
  implementation.

---

## 1. What the proposal asks

1. A **vector embedder** behind the `Embedder` interface (the Unit E drop-in
   seam) — local-first, NO external network egress.
2. The **ollama `embeddinggemma` provider** as the local vectorization backend
   — a localhost HTTP call to ollama's embeddings endpoint.
3. **Testability:** a deterministic MOCK for unit tests (no ollama dependency)
   AND a real-ollama INTEGRATION test path (the test environment) that exercises
   the actual `embeddinggemma` model.
4. A **vector index** (node id → embedding vector), built by calling ollama once
   per node (at index build / on store change), maintained incrementally like
   the lexical index.
5. **Cosine similarity** scoring with deterministic tie-breaking (by node id,
   matching Unit E).
6. **MCP/UI equivalence** — the vector embedder is a drop-in behind the
   `Embedder` interface so `rag.query`/`rag-query` work unchanged (§8.2, a
   BINDING constraint).
7. **Security/CSP posture** — the ollama call is a localhost HTTP request
   (local, no external egress); pin the security surface.

## 2. Feasibility verdict

**Feasible — grounded in the review's lexical-first ENDORSE (§3d, "vector
later") and the retrieval-selection resolution (§9.2.10), and the Unit E
drop-in seam.** The vector embedder is net-new host-side work (the foundation
has no embeddings/similarity mechanism — review §2 finding 1), but it composes
the existing `Embedder` interface (Unit E §5.2) + the `RagStore` interface
(Unit A §5.4). The ollama `embeddinggemma` model is available as a TEST
ENVIRONMENT (local ollama running `embeddinggemma`). The one contract tension —
the Unit E `Embedder` interface is SYNCHRONOUS, but a vector embedder must
compute the query embedding via an async ollama HTTP call — is resolved by
amending the interface to async (§4, §5.1). No engine/foundation gap blocks
this unit. The ollama call is a localhost HTTP request (local-first, no
external egress) — it does NOT trigger the pending.md "no network egress"
constraint's `connect-src` CSP allowlist (that remains an open tracked item for
REMOTE providers only).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Async `Embedder` interface amendment | Project-specific (a Unit E contract amendment) | Low cost; the lexical embedder wraps its sync computation in a resolved promise. |
| Ollama `embeddinggemma` provider (localhost HTTP) | Project-specific (no foundation HTTP-embedding mechanism) | Low cost; local-first, no external egress. |
| Vector index (node id → embedding) | Project-specific (composes the RagStore + the provider) | Low cost; maintained incrementally like the lexical index. |
| Cosine similarity scoring | Project-specific | Low cost; deterministic, range [-1, 1]. |
| Mock embedder (unit tests) | Project-specific | Low cost; deterministic, no ollama dependency. |
| Real-ollama integration test path | Project-specific (the test environment) | Low cost; gated/skipped when ollama is unavailable. |
| Config selection + MCP/UI equivalence | Project-specific (reuses the Unit E engine + the passed-embedder seam) | Low cost; the vector embedder is a drop-in. |

No engine gap. The ollama call is localhost (local, no external egress) — the
pending.md `connect-src` CSP allowlist for a declared network remains an open
tracked item for REMOTE providers only.

### 3a. Adversarial findings

Pending — the adversarial pass (RCA-3) runs AFTER the green. This section is
filled in the post-green adversarial pass (host findings fixed +
regression-tested, recorded here). No adversarial findings yet (Unit F is not
yet implemented).

## 4. Design decisions pinned by this spec

- **ASYNC-EMBEDDER-AMENDMENT (CRITICAL — a Unit E contract amendment):** the
  `Embedder` interface is amended to ASYNC: `score(query, nodes):
  Promise<ScoredNode[]>` and `place(content, nodes, edges):
  Promise<PlacementDecision>`. Rationale: a vector embedder must compute the
  query embedding via an async ollama HTTP call, and the interface takes the
  query STRING (so pre-computing the embedding elsewhere would change the
  interface shape anyway — the embedder must receive the query to embed it).
  Async is the natural fit for a network-backed embedder. The lexical embedder
  (Unit E) wraps its synchronous computation in a resolved promise (a trivial
  change). This amendment ripples through the retrieval stack: `selectTopK`,
  `retrieve`, `RetrievalEngine.query`, `RetrievalEngine.onStoreChanged`, the
  `rag.query` MCP handler, and the `rag-query` IPC all become async. **Unit E
  tests must be updated** (the lexical embedder's `score`/`place` now return
  promises; the retrieval stack is async).
- **OLLAMA-EMBEDDINGGEMMA-PROVIDER:** the vector embedder uses the ollama
  `embeddinggemma` model as the local vectorization backend — a localhost HTTP
  call to ollama's embeddings endpoint (`POST http://127.0.0.1:11434/api/embed`).
  Local-first, NO external network egress.
- **VECTOR-INDEX-MAINTAINED:** a vector index (node id → embedding vector) is
  built by calling ollama once per node (at index build) and maintained
  incrementally on store change (content edit → re-embed; structural add →
  embed; structural delete → remove), mirroring the lexical index maintenance.
- **COSINE-SIMILARITY-SCORING:** the vector embedder scores each node by cosine
  similarity between the query embedding and the node's embedding (range
  [-1, 1]); deterministic tie-breaking by node id ascending (matching Unit E).
- **MOCK-AND-INTEGRATION-TESTABILITY:** a deterministic mock embedder (no ollama
  dependency) for unit tests AND a real-ollama integration test path (the test
  environment) that exercises the actual `embeddinggemma` model, gated/skipped
  when ollama is unavailable.
- **LOCALHOST-SECURITY-POSTURE:** the ollama call is a localhost HTTP request
  (local, no external egress) — it does NOT require a `connect-src` CSP
  allowlist for a declared network (that remains an open tracked item for
  REMOTE providers). The provider is main-process-only, localhost-pinned,
  opt-in via config.
- **MCP-UI-EQUIVALENCE:** the vector embedder is a drop-in behind the `Embedder`
  interface; the retrieval engine uses the passed embedder (Unit E F2);
  `rag.query`/`rag-query` both use the same maintained engine → unchanged
  (§8.2, a BINDING constraint).

## 5. The exhaustive contract

### 5.1 The async `Embedder` interface amendment (Unit E contract amendment)

The Unit E `Embedder` interface (§5.2) is amended to ASYNC. The amended
interface (in `src/main/retrieval.ts`):

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
 *  decision. ASYNC (Unit F amendment): a vector embedder computes the query
 *  embedding via an async ollama HTTP call. */
export interface Embedder {
  /** Score all RAG nodes against a query. Returns a ranked list (highest score
   *  first). Deterministic. ASYNC. */
  score(query: string, nodes: RagNode[]): Promise<ScoredNode[]>
  /** The semantic placement decision: given a new section's content, which
   *  existing RAG node/edge it attaches to. ASYNC. */
  place(content: string, nodes: RagNode[], edges: RagEdge[]): Promise<PlacementDecision>
  /** OPTIONAL lifecycle hook (Unit F addition): the retrieval engine calls this
   *  on a store change so the embedder can maintain its own index (e.g. the
   *  vector embedder re-embeds changed nodes). The lexical embedder does NOT
   *  implement it (the engine maintains the lexical index directly). ASYNC. */
  onStoreChanged?(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): Promise<void>
}
```

**The amendment's ripple (all become async):**

- `selectTopK(embedder, query, nodes, k): Promise<ScoredNode[]>` (was
  `ScoredNode[]`).
- `retrieve(store, embedder, index, query, opts): Promise<RetrievalResult>` (was
  `RetrievalResult`).
- `RetrievalEngine.query(query, opts): Promise<RetrievalResult>` (was
  `RetrievalResult`).
- `RetrievalEngine.onStoreChanged(kind, nodeIds, edgeIds): Promise<void>` (was
  `void`).
- The `rag.query` MCP handler and the `rag-query` IPC both `await` the engine's
  async `query` (MCP handlers and `ipcMain.handle` are async-capable — no
  surface change beyond the await).
- The lexical embedder's `score`/`place` return a RESOLVED promise wrapping
  their synchronous computation (a trivial change; the BM25 math and the
  placement logic are unchanged — Unit E §5.2).

**Fail-states (amended):**

- `score` with a non-string `query` or null/undefined `nodes` → the returned
  promise REJECTS with `Error('embedder score: query/nodes required')`.
- `place` with a non-string `content` or null/undefined `nodes`/`edges` → the
  returned promise REJECTS with `Error('embedder place: content/nodes/edges required')`.

### 5.2 The ollama `embeddinggemma` provider

The local vectorization backend — a localhost HTTP call to ollama's embeddings
endpoint. Local-first, NO external network egress.

```ts
// src/main/embeddings.ts (project-specific; pure + async; no Electron — the
// HTTP call is a plain fetch to the localhost ollama endpoint).

/** The embed function: text → embedding vector. ASYNC. */
export type EmbedTextFn = (text: string) => Promise<number[]>

export interface OllamaEmbedOptions {
  /** The ollama base URL. Default 'http://127.0.0.1:11434'. MUST be a
   *  localhost/loopback address (LOCALHOST-SECURITY-POSTURE — §5.7). */
  baseUrl?: string
  /** The ollama model name. Default 'embeddinggemma'. */
  model?: string
  /** The HTTP request timeout in ms. Default 5000. */
  timeoutMs?: number
  /** The expected embedding dimension. Default undefined = auto-detect from the
   *  model's first response (validated for consistency across all vectors). */
  dimension?: number
}

/** Create the ollama embed provider. The returned function embeds a single text
 *  string via a localhost HTTP POST to ollama's embeddings endpoint. */
export function createOllamaEmbedProvider(opts?: OllamaEmbedOptions): EmbedTextFn
```

**Request/response shape (the `POST {baseUrl}/api/embed` endpoint):**

- **Request:** `POST {baseUrl}/api/embed` with a JSON body
  `{ model: <model>, input: <text> }` (a single string input).
- **Response (2xx):** `{ embeddings: number[][], ... }` — `embeddings[0]` is the
  embedding vector for the single input. The provider reads `embeddings[0]`.
- **Dimension:** if `opts.dimension` is set, the provider validates that every
  returned vector has exactly that length (a mismatch → throw). If
  `opts.dimension` is undefined (default), the provider auto-detects the
  dimension from the FIRST response's vector length and validates that all
  subsequent vectors have the same length (a mismatch → throw).
- **Determinism note:** the ollama model output is deterministic for the same
  input + model + server state (no sampling for embeddings). The provider does
  NOT add randomness.

**Error handling (documented fail-states):**

- A non-2xx HTTP response → the returned promise REJECTS with
  `Error('ollama embed: HTTP <status>')`.
- A network failure (ollama down / connection refused / timeout) → the returned
  promise REJECTS with `Error('ollama embed: <message>')` (the underlying fetch
  error message).
- A timeout (the request exceeds `timeoutMs`) → the returned promise REJECTS
  with `Error('ollama embed: timeout after <timeoutMs>ms')`.
- A malformed response (no `embeddings` array, or `embeddings[0]` missing) →
  the returned promise REJECTS with `Error('ollama embed: malformed response')`.
- A dimension mismatch (against `opts.dimension` or the auto-detected dimension)
  → the returned promise REJECTS with
  `Error('ollama embed: dimension mismatch (expected <n>, got <m>)')`.
- A non-string `text` → the returned promise REJECTS with
  `Error('ollama embed: text must be a string')`.
- `createOllamaEmbedProvider` with a `baseUrl` that is NOT a localhost/loopback
  address (not `127.0.0.1`/`localhost`/`::1`) → throws
  `Error('createOllamaEmbedProvider: baseUrl must be localhost')` (the
  LOCALHOST-SECURITY-POSTURE — §5.7).

### 5.3 The vector index

The maintained node-id → embedding map, built by calling ollama once per node
(at index build) and maintained incrementally on store change (mirroring the
lexical index — Unit E §5.1).

```ts
/** The vector index — the maintained node-id → embedding map over the RAG
 *  node content. */
export interface VectorIndex {
  /** The indexed RAG node ids, in insertion order. */
  nodeIds: string[]
  /** The embeddings: nodeId → embedding vector. */
  embeddings: Map<string, number[]>
  /** The embedding dimension (auto-detected from the first embed, or the
   *  configured dimension). */
  dimension: number
}

/** Build the index from a node list (boot). Embeds each node's content once.
 *  ASYNC (calls embedFn once per node). */
export function createVectorIndex(nodes: RagNode[], embedFn: EmbedTextFn): Promise<VectorIndex>
/** Incremental content update: re-embed the node's new content, replace its
 *  embedding. ASYNC. */
export function updateVectorIndex(index: VectorIndex, node: RagNode, embedFn: EmbedTextFn): Promise<void>
/** Incremental add: embed the node, add its embedding, append its id. ASYNC. */
export function addToVectorIndex(index: VectorIndex, node: RagNode, embedFn: EmbedTextFn): Promise<void>
/** Incremental remove: remove the node's embedding and id. SYNCHRONOUS (no
 *  embed call). */
export function removeFromVectorIndex(index: VectorIndex, nodeId: string): void
```

**Index rules:**

- `createVectorIndex(nodes, embedFn)` — embeds each node's `content` once (in
  `nodes` order), stores `nodeId → embedding`, sets `dimension` from the first
  embed (or the configured dimension). `nodeIds` = the node ids in `nodes`
  order.
- `updateVectorIndex(index, node, embedFn)` — the node must already be in the
  index (its `nodeId` in `index.nodeIds`). Re-embeds the node's new content,
  replaces its embedding. If the node is NOT in the index, it is added (same as
  `addToVectorIndex`).
- `addToVectorIndex(index, node, embedFn)` — the node must NOT already be in the
  index. Embeds the node, adds its embedding, appends its id. If the node IS
  already in the index, it is updated (same as `updateVectorIndex`).
- `removeFromVectorIndex(index, nodeId)` — the node must be in the index.
  Removes its embedding and id. If the node is NOT in the index, it is a no-op.
- **Determinism:** the index is deterministic given a deterministic `embedFn`
  (the mock is deterministic; the ollama provider is deterministic for the same
  input + model + server state).

**Fail-states:**

- `createVectorIndex` with null/undefined `nodes` or `embedFn` → the returned
  promise REJECTS with `Error('createVectorIndex: nodes/embedFn required')`.
- `updateVectorIndex`/`addToVectorIndex` with a null/undefined `index`, `node`,
  or `embedFn` → the returned promise REJECTS with
  `Error('vector index: index/node/embedFn required')`.
- `removeFromVectorIndex` with a null/undefined `index` or a non-string `nodeId`
  → throws `Error('vector index: index/nodeId required')`.
- An `embedFn` rejection (e.g. ollama down) propagates from the index
  build/maintenance functions (the returned promise REJECTS with the embed
  error).

### 5.4 Cosine similarity + scoring

```ts
/** Cosine similarity between two embedding vectors. Range [-1, 1]. Deterministic. */
export function cosineSimilarity(a: number[], b: number[]): number
```

**Behavior:**

- `cosineSimilarity(a, b)` = `(a·b) / (|a|·|b|)` where `a·b` is the dot product
  and `|a|`/`|b|` are the L2 norms.
- If either vector is all-zeros (L2 norm 0) → returns 0.
- If the vectors have different lengths → throws
  `Error('cosineSimilarity: dimension mismatch')`.
- **Range:** the result is in [-1, 1] (1 = identical direction, 0 = orthogonal,
  -1 = opposite direction). Deterministic.

**Scoring rules (the vector embedder's `score` — §5.5):**

- The query embedding is computed once (`await embedFn(query)`).
- For each node in `nodes`, its embedding is looked up in the vector index (by
  node id). A node NOT in the vector index scores 0.
- The node's score = `cosineSimilarity(queryEmbedding, nodeEmbedding)`.
- **Determinism:** the result is sorted by score descending, then by node id
  ascending (lexicographic) — a deterministic tie-break (matching Unit E §5.2).
  Same query + same vector index + same nodes → same result.
- **Return:** a fresh array of `ScoredNode` (highest score first).

**Fail-states:**

- `cosineSimilarity` with null/undefined `a`/`b` → throws
  `Error('cosineSimilarity: a/b required')`.
- `cosineSimilarity` with different-length vectors → throws
  `Error('cosineSimilarity: dimension mismatch')`.

### 5.5 The vector embedder (`createOllamaEmbedder`)

The vector embedder — a drop-in behind the (async-amended) `Embedder` interface.
It holds a reference to the `RagStore` (to read nodes in `onStoreChanged`) and
its own `VectorIndex` (maintained on store change).

```ts
export interface OllamaEmbedderOptions {
  /** The embed provider options (baseUrl/model/timeoutMs/dimension — §5.2). */
  provider?: OllamaEmbedOptions
  /** The placement minimum score threshold. Default PLACEMENT_MIN_SCORE (0). */
  placementMinScore?: number
}

/** Create the vector embedder. Builds the vector index from the store's nodes
 *  (embedding each once). ASYNC. */
export function createOllamaEmbedder(store: RagStore, opts?: OllamaEmbedderOptions): Promise<Embedder>
```

**Construction:**

- Builds the vector index from the store's nodes
  (`createVectorIndex(store.listNodes(), embedFn)`), where `embedFn` is the
  ollama provider (`createOllamaEmbedProvider(opts.provider)`).
- Returns an `Embedder` whose `score`/`place` are async and whose
  `onStoreChanged` maintains the vector index.

**`score(query, nodes)` (async):**

- Computes the query embedding (`await embedFn(query)`).
- Scores each node by cosine similarity against its vector-index embedding
  (a node not in the vector index scores 0) — §5.4.
- Sorts by score descending, then node id ascending. Returns `ScoredNode[]`.

**`place(content, nodes, edges)` (async):**

- If `content` is empty/whitespace → `{ ok: false, reason: 'empty-content' }`.
- Embeds the new content and scores it against all existing nodes (cosine
  similarity — the same scoring as `score`).
- If the best score is below `opts.placementMinScore` (default
  `PLACEMENT_MIN_SCORE` = 0) → `{ ok: false, reason: 'no-match' }`.
- Otherwise, return the best-matching node + the edge kind (the SAME logic as
  the lexical embedder — Unit E §5.2):
  - If the best match's `type` is a container (`ul`, `ol`, `div`) →
    `edgeKind: 'doc-child'`.
  - If the best match's `type` is a section (`h1`-`h6`, `p`) →
    `edgeKind: 'next-section'`.
  - Otherwise → `edgeKind: 'parent-child'`.
- **Determinism:** ties broken by node id ascending (same as `score`).

**`onStoreChanged(kind, nodeIds, edgeIds)` (async):**

- For each nodeId, read the node via `store.getNode(nodeId)`:
  - If the node exists and is in the vector index → `updateVectorIndex`
    (re-embed the node's new content).
  - If the node exists and is NOT in the vector index → `addToVectorIndex`.
  - If the node does NOT exist and IS in the vector index →
    `removeFromVectorIndex`.
- Edge changes do not affect the vector index (edges are not embedded);
  `edgeIds` is accepted and ignored for index purposes.

**Fail-states:**

- `createOllamaEmbedder` with a null/undefined `store` → the returned promise
  REJECTS with `Error('createOllamaEmbedder: store required')`.
- `score` with a non-string `query` or null/undefined `nodes` → the returned
  promise REJECTS with `Error('embedder score: query/nodes required')`.
- `place` with a non-string `content` or null/undefined `nodes`/`edges` → the
  returned promise REJECTS with
  `Error('embedder place: content/nodes/edges required')`.
- `onStoreChanged` with a null/undefined `nodeIds` → the returned promise
  REJECTS with `Error('onStoreChanged: nodeIds required')`.
- An `embedFn` rejection (e.g. ollama down) propagates from `score`/`place`/
  `onStoreChanged` (the returned promise REJECTS with the embed error).

### 5.6 The mock embedder + the integration test path

**The mock embedder (unit tests — no ollama dependency):**

```ts
/** Create a deterministic mock embedder for unit tests. Implements the async
 *  Embedder interface with NO ollama dependency. Deterministic. */
export function createMockEmbedder(opts?: { dimension?: number }): Embedder
```

- The mock computes a deterministic embedding from text via a fixed-dimension
  feature-hash (a bag-of-words → fixed-dimension vector; the exact algorithm is
  implementation detail, but it MUST be deterministic and produce cosine
  similarities that reflect content overlap). Default dimension 4.
- `score(query, nodes)` — computes the query embedding and each node's
  embedding deterministically (from the node's `content`), scores by cosine
  similarity, sorts by score descending then node id ascending. Returns
  `ScoredNode[]`. No ollama call.
- `place(content, nodes, edges)` — the same placement logic as the vector
  embedder (§5.5), using the deterministic mock embeddings. No ollama call.
- `onStoreChanged` — a no-op (the mock computes embeddings on demand; it holds
  no persistent index). Deterministic.
- **Determinism:** the same query + same nodes → the same result (twice).

**The real-ollama integration test path (the test environment):**

```ts
/** Detect whether the local ollama server is reachable. Pings the ollama
 *  endpoint with a short timeout. SYNCHRONOUS (a best-effort reachability
 *  probe). */
export function isOllamaAvailable(baseUrl?: string): boolean
```

- `isOllamaAvailable(baseUrl)` — probes `GET {baseUrl}/api/tags` (or a health
  check) with a short timeout (e.g. 1000ms). Returns `true` if the server
  responds, `false` otherwise. Never throws (a probe failure → `false`).
- **Integration test gating:** the real-ollama integration test file uses
  `describe.skipIf(!isOllamaAvailable())('ollama integration', ...)` — the test
  is SKIPPED when ollama is not reachable, and RUNS when it is (the test
  environment). The skip is a vitest `skipIf` (the test is reported as skipped,
  not failed, when ollama is down).
- **Integration test scope:** exercises the ACTUAL `embeddinggemma` model via
  the real provider (`createOllamaEmbedProvider` + `createOllamaEmbedder`):
  - A real embed of a known text returns a vector of the model's dimension
    (auto-detected).
  - Two semantically-similar texts score higher (cosine) than two dissimilar
    texts.
  - The vector embedder's `score`/`place` work end-to-end against the real
    model.
- **Fail-state:** if ollama is down, the integration test is SKIPPED (not
  failed) — the `skipIf` gate. If ollama is up but the model is missing, the
  provider rejects with the ollama error (a documented fail-state — §5.2).

### 5.7 The retrieval engine + MCP/UI equivalence + security/CSP + config selection

**The async ripple on the retrieval engine (Unit E §5.6, amended):**

- `RetrievalEngine.query(query, opts): Promise<RetrievalResult>` — awaits
  `retrieve(...)` (now async).
- `RetrievalEngine.onStoreChanged(kind, nodeIds, edgeIds): Promise<void>` —
  updates the lexical index (synchronously, as in Unit E) AND awaits
  `embedder.onStoreChanged?.(kind, nodeIds, edgeIds)` if the embedder implements
  the hook (the vector embedder does; the lexical embedder does not).
- `createRetrieval(store, embedder, opts)` stays SYNCHRONOUS (it builds the
  lexical index synchronously; the vector embedder's index is built in
  `createOllamaEmbedder`, before the engine is created).

**Config selection (how the vector embedder is selected):**

- An app config option `retrieval.embedder: 'lexical' | 'vector'` (default
  `'lexical'`).
- When `'lexical'` (default): main creates the lexical embedder (Unit E) and
  passes it to `createRetrieval` — unchanged.
- When `'vector'`: main creates the vector embedder
  (`await createOllamaEmbedder(store, opts)`) and passes it to
  `createRetrieval`.
- **The engine uses the passed embedder** (Unit E F2 — `createRetrieval` uses
  the passed embedder; a vector embedder is a drop-in). No engine change is
  needed to select the vector embedder beyond passing it.

**MCP/UI equivalence (§8.2, a BINDING constraint):**

- The `rag.query` MCP tool and the `rag-query` IPC both call the SAME maintained
  engine's `query` (now async — both `await` it). Neither computes retrieval in
  the renderer.
- The vector embedder is a drop-in behind the `Embedder` interface, so
  `rag.query`/`rag-query` work UNCHANGED (same engine, same result shape) when
  the vector embedder is selected.
- **Equivalence test:** an MCP `rag.query` and a UI `rag-query` IPC with the
  same params produce the same result (same ranked, context, markdown, lineMap)
  — with EITHER embedder selected.

**Security/CSP posture (LOCALHOST-SECURITY-POSTURE):**

- The ollama call is a localhost HTTP request (`http://127.0.0.1:11434`) — LOCAL,
  no external network egress. It does NOT require a `connect-src` CSP allowlist
  for a declared network (that remains an open tracked item in `docs/pending.md`
  for REMOTE providers only).
- **Security surface:**
  - The base URL is pinned to localhost/loopback by default and REJECTED if
    set to a non-localhost address (§5.2 — `createOllamaEmbedProvider` throws).
  - The provider is a MAIN-PROCESS-ONLY module — the renderer has NO access to
    the ollama endpoint (no IPC exposes it).
  - The vector embedder is OPT-IN via config (`retrieval.embedder: 'vector'`);
    the lexical embedder is the default (no ollama call unless opted in).
  - No credentials are sent; the request is a plain HTTP POST to the localhost
    endpoint.
  - The ollama call is made only when the vector embedder is selected (not by
    default).

**Fail-states (amended):**

- `RetrievalEngine.query` with a non-string/empty `query` → the returned promise
  REJECTS with `Error('retrieve: query must be a non-empty string')` (propagated
  from `retrieve`).
- `RetrievalEngine.onStoreChanged` with a null/undefined `nodeIds` → the
  returned promise REJECTS with `Error('onStoreChanged: nodeIds required')`.
- An embedder rejection (e.g. ollama down during `score`) propagates from
  `query` (the returned promise REJECTS with the embed error).
- `rag.query` with the `rag` group disabled → not registered, not callable
  (Unit B §5.3).
- A `rag.query` that reaches the renderer switch → `unknown method` throw
  (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`createOllamaEmbedProvider` happy:** a provider with default options → the
   returned function embeds a text via a localhost POST to
   `http://127.0.0.1:11434/api/embed` (model `embeddinggemma`).
2. **Provider dimension auto-detect:** the first embed returns a vector; the
   provider auto-detects its length and validates subsequent vectors against it.
3. **Provider configured dimension:** `dimension: 4` → every returned vector is
   validated to length 4.
4. **`createVectorIndex` happy:** a node list + a mock `embedFn` → the index has
   the node ids, embeddings (one per node), and the dimension.
5. **`updateVectorIndex` happy (content edit):** a content edit changes a node's
   text → the node's embedding is replaced.
6. **`addToVectorIndex` happy (node add):** a new node → its embedding added, its
   id appended.
7. **`removeFromVectorIndex` happy (node delete):** a node removed → its
   embedding and id removed.
8. **`cosineSimilarity` happy:** two identical vectors → 1; two orthogonal
   vectors → 0; two opposite vectors → -1.
9. **`cosineSimilarity` zero vector:** a zero vector → 0 (no throw).
10. **`createOllamaEmbedder` + `score` happy (mock):** a query matching a node's
    content → the node scores > 0; the result is ranked highest-first.
11. **Vector determinism:** the same query + same vector index + same nodes →
    the same ranked result (twice).
12. **Vector tie-break:** two nodes with equal scores → sorted by node id
    ascending.
13. **`place` happy (vector):** a new section's content matches an existing
    section → `{ ok: true, targetNodeId, edgeKind: 'next-section', score }`.
14. **`place` container match (vector):** a new section's content matches a
    `ul`/`ol`/`div` node → `edgeKind: 'doc-child'`.
15. **`createMockEmbedder` happy:** a deterministic mock embedder → `score`/
    `place` work with no ollama dependency; the same query + nodes → the same
    result (twice).
16. **`isOllamaAvailable` happy (ollama up):** the probe returns `true`.
17. **`isOllamaAvailable` happy (ollama down):** the probe returns `false` (no
    throw).
18. **Integration test gating:** with ollama down, the integration test is
    SKIPPED (not failed).
19. **Integration test happy (ollama up):** a real embed of a known text returns
    a vector of the model's dimension; similar texts score higher than
    dissimilar texts.
20. **Async lexical embedder (amended):** the lexical embedder's `score`/`place`
    return RESOLVED promises (the Unit E behavior preserved).
21. **Async retrieval stack (amended):** `selectTopK`/`retrieve`/`engine.query`
    return promises that resolve to the same results as the sync Unit E
    behavior.
22. **`onStoreChanged` vector maintenance:** a content edit → the vector index
    re-embeds the affected node; a structural add → embeds the new node; a
    structural delete → removes the node's embedding.
23. **Config selection:** `retrieval.embedder: 'vector'` → main creates the
    vector embedder and passes it to `createRetrieval`; the engine uses it.
24. **MCP/UI equivalence (vector):** an MCP `rag.query` and a UI `rag-query` IPC
    with the same params → the same result, with the vector embedder selected.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`createOllamaEmbedProvider` non-localhost baseUrl** → throws
   `Error('createOllamaEmbedProvider: baseUrl must be localhost')`.
2. **Provider non-2xx HTTP** → the returned promise REJECTS with
   `Error('ollama embed: HTTP <status>')`.
3. **Provider network failure (ollama down)** → the returned promise REJECTS
   with `Error('ollama embed: <message>')`.
4. **Provider timeout** → the returned promise REJECTS with
   `Error('ollama embed: timeout after <timeoutMs>ms')`.
5. **Provider malformed response** → the returned promise REJECTS with
   `Error('ollama embed: malformed response')`.
6. **Provider dimension mismatch** → the returned promise REJECTS with
   `Error('ollama embed: dimension mismatch (expected <n>, got <m>)')`.
7. **Provider non-string text** → the returned promise REJECTS with
   `Error('ollama embed: text must be a string')`.
8. **`createVectorIndex` null/undefined nodes or embedFn** → the returned
   promise REJECTS with `Error('createVectorIndex: nodes/embedFn required')`.
9. **`updateVectorIndex`/`addToVectorIndex` null/undefined index/node/embedFn** →
   the returned promise REJECTS with
   `Error('vector index: index/node/embedFn required')`.
10. **`removeFromVectorIndex` null/undefined index or non-string nodeId** →
    throws `Error('vector index: index/nodeId required')`.
11. **`cosineSimilarity` null/undefined a/b** → throws
    `Error('cosineSimilarity: a/b required')`.
12. **`cosineSimilarity` dimension mismatch** → throws
    `Error('cosineSimilarity: dimension mismatch')`.
13. **`createOllamaEmbedder` null/undefined store** → the returned promise
    REJECTS with `Error('createOllamaEmbedder: store required')`.
14. **`score` non-string query or null/undefined nodes** → the returned promise
    REJECTS with `Error('embedder score: query/nodes required')`.
15. **`place` non-string content or null/undefined nodes/edges** → the returned
    promise REJECTS with `Error('embedder place: content/nodes/edges required')`.
16. **`place` empty content (vector)** → `{ ok: false, reason: 'empty-content' }`.
17. **`place` no match (vector)** → `{ ok: false, reason: 'no-match' }`.
18. **`onStoreChanged` null/undefined nodeIds** → the returned promise REJECTS
    with `Error('onStoreChanged: nodeIds required')`.
19. **Embed rejection propagation** → an `embedFn` rejection (e.g. ollama down)
    propagates from `score`/`place`/`onStoreChanged`/`query` (the returned
    promise REJECTS with the embed error).
20. **`RetrievalEngine.query` non-string/empty query** → the returned promise
    REJECTS with `Error('retrieve: query must be a non-empty string')`.
21. **`rag.query` with the `rag` group disabled** → not registered, not callable
    (Unit B §5.3).
22. **`rag.query` reaching the renderer switch** → `unknown method` throw
    (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.10 Census / numeric claims

- **Ollama base URL:** `http://127.0.0.1:11434` (default; localhost-pinned).
- **Ollama model:** `embeddinggemma` (default).
- **Ollama endpoint:** `POST /api/embed` (the embeddings endpoint).
- **HTTP timeout:** 5000 ms (default, configurable via `OllamaEmbedOptions.timeoutMs`).
- **Embedding dimension:** auto-detected from the model's first response
  (validated for consistency); configurable via `OllamaEmbedOptions.dimension`.
  The mock's fixed dimension is 4 (default).
- **Cosine similarity range:** [-1, 1].
- **Placement threshold:** `PLACEMENT_MIN_SCORE` — a fixed constant (default 0);
  a best score below it is `no-match` (shared with Unit E).
- **Vector index statistics:** nodeIds (insertion order), embeddings
  (nodeId → vector), dimension.
- **Vector index maintenance calls:** 1 embed per node at build; 1 embed per
  affected node on content/structural change; 0 embeds on delete.
- **`Embedder` interface methods:** 2 (`score`, `place`) + 1 optional lifecycle
  hook (`onStoreChanged`).
- **Async-amended retrieval stack:** 4 signatures become async (`selectTopK`,
  `retrieve`, `RetrievalEngine.query`, `RetrievalEngine.onStoreChanged`).
- **Mock dimension:** 4 (default).
- **Integration-test probe timeout:** 1000 ms (the `isOllamaAvailable` probe).
- **Config option:** 1 (`retrieval.embedder: 'lexical' | 'vector'`, default
  `'lexical'`).

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (RAG node/edge shapes — the
  vector embedder reads `RagNode.content` for embedding), §5.4 (the `RagStore`
  interface — the vector embedder depends on the interface, NOT the concrete
  JSON store).
- Unit B: `docs/specs/unit-b-document-model.md` §5.3 (five-seam gate — the `rag`
  group), §5.4 (the `rag.query` tool schema).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.2 (the `Embedder` interface — the
  drop-in seam, AMENDED to async by Unit F §5.1), §5.1 (the lexical index — the
  maintenance pattern the vector index mirrors), §5.3 (`selectTopK` — amended to
  async), §5.5 (`retrieve` — amended to async), §5.6 (the retrieval engine —
  `createRetrieval` uses the passed embedder, F2; `onStoreChanged` amended to
  async + the embedder hook), §5.7 (the `rag.query` MCP tool + `rag-query` IPC —
  both await the async engine), §3a F2 (the passed-embedder seam the vector
  embedder drops into).
- Gate: `docs/specs/astrographer-review.md` §3d (lexical-first retrieval
  ENDORSE, "vector later"), §9.2.10 (retrieval selection), §8.2 (MCP/UI
  equivalence — a BINDING constraint), §9.2.6 (SINGLE-WRITER-STORE), §9.3
  ("strays from the topic" re-scoping — the `Embedder` owns the semantic
  placement decision).
- Decisions: `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL** (the `Embedder`
  is the drop-in seam for the Unit F vector implementation),
  **SINGLE-WRITER-STORE**, **RAG-EDIT-MCP-GROUPS**.
- Pending: `docs/pending.md` (vector embeddings — the deferred row, now
  implemented by Unit F; the "no network egress yet (the `connect-src` CSP
  allowlist for a declared network is an open tracked item)" constraint — a
  localhost ollama call is LOCAL, not external egress; the remote embedding
  provider — a SPECULATIVE item that requires network egress + a CSP allowlist
  + a new security surface).
