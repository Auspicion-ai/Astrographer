# Unit F — Vector Embeddings: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-f-embeddings.md`
  ONLY — no implementation reading of the scenario content).
- **Source contract:** `docs/specs/unit-f-embeddings.md` §5.1–§5.10, plus the
  amended `docs/specs/unit-e-rag-index.md` §5.2 (the async `Embedder` interface).
- **Modules under test:** `src/main/embeddings.ts` (`createEmbeddingProvider`,
  `createOllamaEmbedProvider`, `createRemoteEmbedProvider`, `createVectorIndex`,
  `updateVectorIndex`, `addToVectorIndex`, `removeFromVectorIndex`,
  `cosineSimilarity`, `createVectorEmbedder`, `createMockEmbedder`,
  `isOllamaAvailable`, `parsePositiveIntEnv`, the `EmbeddingProviderConfig`
  shape), the async `src/main/retrieval.ts` (`Embedder`, `selectTopK`,
  `retrieve`, `createRetrieval`, the engine's `onStoreChanged` forwarding to the
  embedder hook), `src/main/mcp-server.ts` (`rag.query` via `handleRagTool` +
  the `rag-query` IPC via `handleRagQueryIpc`), `src/main/main.ts` (the
  `retrieval.embedder` lexical|vector selection), and the `RagStore` interface
  via `createJsonRagStore` (`src/main/rag-store.ts`).
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. Provider HTTP calls are exercised against a
  STUBBED `globalThis.fetch` (no live remote call — no network egress in CI),
  except the real-ollama integration scenarios (H17–H20) which run against the
  live localhost ollama `embeddinggemma` model (the test environment) and are
  gated by `isOllamaAvailable`. The store's mutating methods
  (`putNode`/`putEdge`/`removeNode`) are async and queue-serialized, so they are
  awaited.
- **Run:** 63 scenarios — 62 pass, 1 fail (F33 — a spec-vs-impl drift; see the
  Findings section).

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (26)

Fixture helpers: `N(id, type, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`.

### H1. `createEmbeddingProvider` happy (ollama)
- **Ops:** `createEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })`.
- **Expected:** an `EmbeddingProvider` whose `kind === 'ollama'`,
  `model === 'embeddinggemma'`, `baseUrl === 'http://127.0.0.1:11434'`; its
  `embed` posts to the localhost endpoint with the model `embeddinggemma`.

### H2. `createEmbeddingProvider` happy (remote/cloud)
- **Ops:** `createEmbeddingProvider({ provider: 'openai', baseUrl:
  'https://api.openai.com/v1', model: 'text-embedding-3-small', apiKey:
  'sk-...' })`.
- **Expected:** an `EmbeddingProvider` whose `kind === 'openai'`,
  `model === 'text-embedding-3-small'`; its `embed` posts to the cloud endpoint
  with the `Authorization: Bearer sk-...` header.

### H3. Provider dimension auto-detect
- **Setup:** a stubbed `fetch` returns a 4-vector on the first embed and a
  4-vector on the second.
- **Ops:** `createOllamaEmbedProvider().embed('a')` then `embed('b')`.
- **Expected:** the first embed auto-detects the dimension (4); the second
  validates against it and resolves; `provider.dimension === 4`.

### H4. Provider configured dimension
- **Setup:** a stubbed `fetch` returns a 4-vector.
- **Ops:** `createOllamaEmbedProvider({ dimension: 4 }).embed('a')`.
- **Expected:** resolves; every returned vector is validated to length 4.

### H5. `createVectorIndex` happy
- **Setup:** nodes `N1('hello world')`, `N2('goodbye moon')`; a mock `embedFn`
  returning a fixed 4-vector.
- **Ops:** `createVectorIndex([n1, n2], embedFn)`.
- **Expected:** `nodeIds === ['n1','n2']`; `embeddings` has one entry per node;
  `dimension === 4`.

### H6. `updateVectorIndex` happy (content edit)
- **Setup:** index over `N1('hello world')`; a mock `embedFn`.
- **Ops:** `updateVectorIndex(index, N1('goodbye moon'), embedFn)`.
- **Expected:** `n1`'s embedding is replaced (re-embedded from the new content).

### H7. `addToVectorIndex` happy (node add)
- **Setup:** index over `N1('hello world')`; a mock `embedFn`.
- **Ops:** `addToVectorIndex(index, N2('goodbye moon'), embedFn)`.
- **Expected:** `n2`'s embedding added; `nodeIds === ['n1','n2']`.

### H8. `removeFromVectorIndex` happy (node delete)
- **Setup:** index over `N1`, `N2`; a mock `embedFn`.
- **Ops:** `removeFromVectorIndex(index, 'n1')`.
- **Expected:** `n1`'s embedding and id removed; `nodeIds === ['n2']`.

### H9. `cosineSimilarity` happy
- **Ops:** `cosineSimilarity([1,0,0,0],[1,0,0,0])`,
  `cosineSimilarity([1,0,0,0],[0,1,0,0])`,
  `cosineSimilarity([1,0,0,0],[-1,0,0,0])`.
- **Expected:** `1`, `0`, `-1` respectively (identical → 1, orthogonal → 0,
  opposite → -1).

### H10. `cosineSimilarity` zero vector
- **Ops:** `cosineSimilarity([0,0,0,0],[1,0,0,0])`.
- **Expected:** `0` (no throw).

### H11. `createVectorEmbedder` + `score` happy (mock)
- **Setup:** store with `N1('hello world')`, `N2('goodbye moon')`; a stubbed
  `fetch` remote provider (api.openai.com) returning canned vectors.
- **Ops:** `createVectorEmbedder(store, { provider })` then
  `embedder.score('hello', store.listNodes())`.
- **Expected:** the node matching the query scores > 0; the result is ranked
  highest-first.

### H12. Vector determinism
- **Setup:** store with `N1('hello world')`, `N2('goodbye moon')`; a vector
  embedder over a stubbed `fetch` provider.
- **Ops:** `embedder.score('hello', nodes)` twice.
- **Expected:** both calls return identical ranked results.

### H13. Vector tie-break
- **Setup:** store with `N2('hello world')`, `N1('hello there')` (equal scores);
  a vector embedder over a stubbed `fetch` provider.
- **Ops:** `embedder.score('hello', nodes)`.
- **Expected:** equal scores sorted by node id ascending → `n1` then `n2`.

### H14. `place` happy (vector)
- **Setup:** node `N1('p', 'hello world')`; a vector embedder over a stubbed
  `fetch` provider.
- **Ops:** `embedder.place('hello', [n1], [])`.
- **Expected:** `{ ok: true, targetNodeId: 'n1', edgeKind: 'next-section', score > 0 }`
  (the new section follows a section in document order).

### H15. `place` container match (vector)
- **Setup:** for each of `ul`/`ol`/`div`, node `N1(type, 'hello world')`; a
  vector embedder over a stubbed `fetch` provider.
- **Ops:** `embedder.place('hello', [n1], [])`.
- **Expected:** `{ ok: true, targetNodeId: 'n1', edgeKind: 'doc-child', ... }`
  (the new section nests within the container).

### H16. `createMockEmbedder` happy
- **Setup:** nodes `N1('hello world')`, `N2('goodbye moon')`.
- **Ops:** `createMockEmbedder()`; `score('hello', nodes)` twice; `place(...)`.
- **Expected:** `score`/`place` work with NO provider dependency; the same query
  + nodes → the same result (twice); `place('hello', [n1], [])` returns
  `{ ok: true, targetNodeId: 'n1', edgeKind: 'next-section', score > 0 }`.

### H17. `isOllamaAvailable` happy (ollama up)
- **Ops:** `isOllamaAvailable('http://127.0.0.1:11434')`.
- **Expected:** `true` (the local ollama server responds).

### H18. `isOllamaAvailable` happy (ollama down)
- **Ops:** `isOllamaAvailable('http://127.0.0.1:1')` (a closed port).
- **Expected:** `false` (no throw).

### H19. Integration test gating
- **Setup:** the real-ollama integration test file.
- **Ops:** inspect the gating predicate.
- **Expected:** the integration test is gated by `describe.skipIf(!isOllamaAvailable())`
  — SKIPPED when ollama is down, RUNS when it is up (never failed on a down
  ollama).

### H20. Integration test happy (ollama up)
- **Setup:** the real `embeddinggemma` model (available).
- **Ops:** `createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434',
  model: 'embeddinggemma' })`; embed a known text; embed two similar + two
  dissimilar texts; `createVectorEmbedder` + `score`/`place` end-to-end.
- **Expected:** a real embed returns a vector of the model's dimension
  (auto-detected); two semantically-similar texts score higher (cosine) than two
  dissimilar texts; the vector embedder's `score`/`place` work end-to-end.

### H21. Remote/cloud provider mocked happy
- **Setup:** a stubbed `fetch` returns a canned 2xx OpenAI-shaped response.
- **Ops:** `createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1',
  model: 'text-embedding-3-small', apiKey: 'sk-...' }).embed('hello')`.
- **Expected:** the provider parses the embedding, validates the dimension, and
  resolves; the request carried the `Authorization: Bearer sk-...` header and the
  configured URL/body.

### H22. Async lexical embedder (amended)
- **Setup:** nodes `N1('hello world')`; a lexical index + embedder.
- **Ops:** `createLexicalEmbedder(index).score('hello', nodes)` and
  `.place('hello', nodes, [])`.
- **Expected:** both return RESOLVED promises (the Unit E behavior preserved);
  `score` resolves to `[{ nodeId:'n1', score > 0 }]`.

### H23. Async retrieval stack (amended)
- **Setup:** store with `N1('hello world')`; a lexical index + embedder.
- **Ops:** `selectTopK(embedder, 'hello', nodes, 5)`, `retrieve(store, embedder,
  index, 'hello', {})`, `createRetrieval(store, embedder).query('hello')`.
- **Expected:** all return promises that resolve to the same results as the sync
  Unit E behavior (`ranked[0].nodeId === 'n1'`, `k === 5` default).

### H24. `onStoreChanged` vector maintenance
- **Setup:** store with `N1('hello world')`; a vector embedder over a stubbed
  `fetch` provider.
- **Ops:** content edit `putNode(N1('goodbye moon'))` +
  `onStoreChanged('content', ['n1'], [])`; structural add `putNode(N2(...))` +
  `onStoreChanged('structural', ['n2'], [])`; structural delete
  `removeNode('n1')` + `onStoreChanged('structural', ['n1'], [])`.
- **Expected:** the vector index re-embeds the affected node on content edit;
  embeds the new node on structural add; removes the node's embedding on
  structural delete.

### H25. Config selection
- **Setup:** `src/main/main.ts` (static verification).
- **Ops:** inspect the `retrieval.embedder` selection logic.
- **Expected:** `retrieval.embedder: 'vector'` with a valid
  `retrieval.embeddingProvider` config → main creates the vector embedder
  (`createVectorEmbedder`) and passes it to `createRetrieval`; the engine uses
  it. Default `'lexical'` uses the lexical embedder.

### H26. MCP/UI equivalence (vector)
- **Setup:** store with `N1('hello world')`, `N2('hello there')`; a shared
  maintained engine over a VECTOR embedder (stubbed `fetch` provider).
- **Ops:** `handleRagTool(store, 'rag.query', { query:'hello', topK:2 }, engine)`
  and `handleRagQueryIpc(engine, store, { query:'hello', topK:2 })`.
- **Expected:** both produce the identical result — same `ranked`, `context`,
  `markdown`, `lineMap`, and `k === 2` (MCP/UI equivalence, §8.2 BINDING), with
  the vector embedder selected.

---

## B. §5.9 Fail-states (36)

### F1. `createEmbeddingProvider` null/undefined config
- **Ops:** `createEmbeddingProvider(null)`, `createEmbeddingProvider(undefined)`.
- **Expected:** each throws `Error('createEmbeddingProvider: config required')`.

### F2. `createEmbeddingProvider` missing/empty baseUrl
- **Ops:** `createEmbeddingProvider({ provider:'ollama', baseUrl:'', model:'m' })`,
  `{ baseUrl:'   ' }`.
- **Expected:** each throws `Error('createEmbeddingProvider: baseUrl required')`.

### F3. `createEmbeddingProvider` missing/empty model
- **Ops:** `createEmbeddingProvider({ provider:'ollama', baseUrl:'http://127.0.0.1:11434', model:'' })`,
  `{ model:'   ' }`.
- **Expected:** each throws `Error('createEmbeddingProvider: model required')`.

### F4. `createOllamaEmbedProvider` non-localhost baseUrl
- **Ops:** `createOllamaEmbedProvider({ baseUrl: 'https://api.openai.com/v1' })`,
  `{ baseUrl: 'http://example.com' }`.
- **Expected:** each throws `Error('createOllamaEmbedProvider: baseUrl must be localhost')`.

### F5. `createRemoteEmbedProvider` missing/empty apiKey
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m' })`,
  `{ ..., apiKey:'' }`, `{ ..., apiKey:'   ' }`.
- **Expected:** each throws `Error('createRemoteEmbedProvider: apiKey required')`.

### F6. Ollama provider non-2xx HTTP
- **Setup:** a stubbed `fetch` returns `{ ok:false, status:500 }`.
- **Ops:** `createOllamaEmbedProvider().embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('ollama embed: HTTP 500')`.

### F7. Ollama provider network failure (ollama down)
- **Setup:** a stubbed `fetch` rejects with `TypeError('fetch failed')`.
- **Ops:** `createOllamaEmbedProvider().embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('ollama embed: fetch failed')`.

### F8. Ollama provider timeout
- **Setup:** a stubbed `fetch` that never resolves; `timeoutMs: 20`.
- **Ops:** `createOllamaEmbedProvider({ timeoutMs: 20 }).embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('ollama embed: timeout after 20ms')`.

### F9. Ollama provider malformed response
- **Setup:** a stubbed `fetch` returns `{ ok:true, json: async () => ({}) }`
  (no embeddings array).
- **Ops:** `createOllamaEmbedProvider().embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('ollama embed: malformed response')`.

### F10. Ollama provider dimension mismatch
- **Setup:** a stubbed `fetch` returns a 4-vector; `dimension: 8`.
- **Ops:** `createOllamaEmbedProvider({ dimension: 8 }).embed('hello')`.
- **Expected:** the returned promise REJECTS with
  `Error('ollama embed: dimension mismatch (expected 8, got 4)')`.

### F11. Ollama provider non-string text
- **Ops:** `createOllamaEmbedProvider().embed(null)`, `.embed(42)`.
- **Expected:** each REJECTS with `Error('ollama embed: text must be a string')`.

### F12. Remote provider non-2xx HTTP
- **Setup:** a stubbed `fetch` returns `{ ok:false, status:401 }`.
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m', apiKey:'k' }).embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('remote embed: HTTP 401')`.

### F13. Remote provider network failure
- **Setup:** a stubbed `fetch` rejects with `TypeError('network down')`.
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m', apiKey:'k' }).embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('remote embed: network down')`.

### F14. Remote provider timeout
- **Setup:** a stubbed `fetch` that never resolves; `timeoutMs: 20`.
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m', apiKey:'k', timeoutMs:20 }).embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('remote embed: timeout after 20ms')`.

### F15. Remote provider malformed response
- **Setup:** a stubbed `fetch` returns `{ ok:true, json: async () => ({}) }`.
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m', apiKey:'k' }).embed('hello')`.
- **Expected:** the returned promise REJECTS with `Error('remote embed: malformed response')`.

### F16. Remote provider dimension mismatch
- **Setup:** a stubbed `fetch` returns a 4-vector; `dimension: 8`.
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m', apiKey:'k', dimension:8 }).embed('hello')`.
- **Expected:** the returned promise REJECTS with
  `Error('remote embed: dimension mismatch (expected 8, got 4)')`.

### F17. Remote provider non-string text
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://api.openai.com/v1', model:'m', apiKey:'k' }).embed(null)`.
- **Expected:** REJECTS with `Error('remote embed: text must be a string')`.

### F18. Remote provider baseUrl not in connect-src allowlist
- **Ops:** `createRemoteEmbedProvider({ baseUrl:'https://evil.example.com/v1', model:'m', apiKey:'k' }).embed('hello')`.
- **Expected:** the returned promise REJECTS with
  `Error('remote embed: baseUrl not in connect-src allowlist')`.

### F19. `createVectorIndex` null/undefined nodes or embedFn
- **Ops:** `createVectorIndex(null, fn)`, `createVectorIndex(nodes, null)`.
- **Expected:** each REJECTS with `Error('createVectorIndex: nodes/embedFn required')`.

### F20. `updateVectorIndex`/`addToVectorIndex` null/undefined index/node/embedFn
- **Ops:** `updateVectorIndex(null, n, fn)`, `updateVectorIndex(index, null, fn)`,
  `updateVectorIndex(index, n, null)`, `addToVectorIndex(null, n, fn)`,
  `addToVectorIndex(index, null, fn)`, `addToVectorIndex(index, n, null)`.
- **Expected:** each REJECTS with `Error('vector index: index/node/embedFn required')`.

### F21. `removeFromVectorIndex` null/undefined index or non-string nodeId
- **Ops:** `removeFromVectorIndex(null, 'n')`, `removeFromVectorIndex(index, null)`,
  `removeFromVectorIndex(index, 42)`.
- **Expected:** each throws `Error('vector index: index/nodeId required')`.

### F22. `cosineSimilarity` null/undefined a/b
- **Ops:** `cosineSimilarity(null, [1])`, `cosineSimilarity([1], null)`.
- **Expected:** each throws `Error('cosineSimilarity: a/b required')`.

### F23. `cosineSimilarity` dimension mismatch
- **Ops:** `cosineSimilarity([1,0], [1,0,0])`.
- **Expected:** throws `Error('cosineSimilarity: dimension mismatch')`.

### F24. `createVectorEmbedder` null/undefined store
- **Ops:** `createVectorEmbedder(null, { provider })`.
- **Expected:** REJECTS with `Error('createVectorEmbedder: store required')`.

### F25. `createVectorEmbedder` null/undefined opts or opts.provider
- **Ops:** `createVectorEmbedder(store, null)`, `createVectorEmbedder(store, {})`,
  `createVectorEmbedder(store, { provider: null })`.
- **Expected:** each REJECTS with
  `Error('createVectorEmbedder: provider config required')`.

### F26. Provider-creation failure propagation
- **Setup:** a remote/cloud config missing its `apiKey`.
- **Ops:** `createVectorEmbedder(store, { provider: { provider:'openai',
  baseUrl:'https://api.openai.com/v1', model:'m' } })`.
- **Expected:** REJECTS with the provider error
  (`Error('createRemoteEmbedProvider: apiKey required')`).

### F27. `score` non-string query or null/undefined nodes
- **Setup:** a vector embedder over a stubbed `fetch` provider.
- **Ops:** `embedder.score(null, [])`, `embedder.score('hello', null)`.
- **Expected:** each REJECTS with `Error('embedder score: query/nodes required')`.

### F28. `place` non-string content or null/undefined nodes/edges
- **Setup:** a vector embedder over a stubbed `fetch` provider.
- **Ops:** `place(null, [], [])`, `place('hello', null, [])`, `place('hello', [], null)`.
- **Expected:** each REJECTS with `Error('embedder place: content/nodes/edges required')`.

### F29. `place` empty content (vector)
- **Setup:** a vector embedder over a stubbed `fetch` provider.
- **Ops:** `place('', [], [])`, `place('   ', [], [])`.
- **Expected:** each `{ ok: false, reason: 'empty-content' }`.

### F30. `place` no match (vector)
- **Setup:** node `N1('alpha beta')`; a vector embedder over a stubbed `fetch`
  provider returning orthogonal vectors for the query.
- **Ops:** `place('zzz qqq', [n1], [])`.
- **Expected:** `{ ok: false, reason: 'no-match' }` (best score ≤
  `PLACEMENT_MIN_SCORE`).

### F31. `onStoreChanged` null/undefined nodeIds
- **Setup:** a vector embedder over a stubbed `fetch` provider.
- **Ops:** `onStoreChanged('content', null, [])`, `onStoreChanged('content', undefined, [])`.
- **Expected:** each REJECTS with `Error('onStoreChanged: nodeIds required')`.

### F32. Embed rejection propagation
- **Setup:** a stubbed `fetch` that rejects (provider down).
- **Ops:** `embedder.score('hello', nodes)`, `embedder.place('hello', nodes, [])`,
  `embedder.onStoreChanged('content', ['n1'], [])`, and
  `createRetrieval(store, embedder).query('hello')`.
- **Expected:** each REJECTS with the embed error (the provider rejection
  propagates).

### F33. `RetrievalEngine.query` non-string/empty query
- **Ops:** `engine.query('')`, `engine.query('   ')`, `engine.query(null)`.
- **Expected:** each REJECTS with `Error('retrieve: query must be a non-empty string')`.
- **Result:** **FAIL (spec-vs-impl drift).** The empty/whitespace sub-cases
  (`''`, `'   '`) correctly reject with `Error('retrieve: query must be a
  non-empty string')`. The NON-STRING sub-case (`null`) rejects with
  `Error('retrieve: store/embedder/index/query/opts required')` instead — the
  implementation distinguishes a non-string query (→ the `retrieve` "required"
  fail-state, consistent with Unit E §5.9 F14) from an empty/whitespace string
  (→ the "non-empty string" fail-state, Unit E §5.9 F15). The Unit F spec §5.9
  F33 (and §5.7) conflates the two, claiming a non-string query also rejects
  with `'retrieve: query must be a non-empty string'`. See the Findings section.

### F34. `retrieval.embedder: 'vector'` with a missing/invalid `retrieval.embeddingProvider` config
- **Setup:** `src/main/main.ts` (static verification).
- **Ops:** inspect the `'vector'` selection path.
- **Expected:** with `retrieval.embedder: 'vector'` and NO provider config, main
  throws `Error('retrieval.embedder: vector requires retrieval.embeddingProvider config')`
  — the app does NOT silently fall back to lexical.

### F35. `rag.query` with the `rag` group disabled
- **Setup:** `defaultSecurityConfig()` (default-off).
- **Ops:** inspect the default enabled groups; `toolAllowed('rag.query', …)`.
- **Expected:** `defaultSecurityConfig().enabled === ['read','dispatch']` (no
  `rag`); `toolAllowed('rag.query', ['read','dispatch']) === false`;
  `toolAllowed('rag.query', ['rag']) === true`.

### F36. `rag.query` reaching the renderer switch → unknown method (static grep)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, grep for a `rag.query`
  switch case.
- **Expected:** NO `case 'rag.query'` switch case exists — a `rag.query` that
  reaches the renderer switch hits the `default` branch → `unknown method`
  (fail-closed, the negative contract, Unit B §5.3 Seam 4).

---

## C. §5.10 Census / numeric claims

### C1. Provider kinds — 2 concrete behind ONE interface
- **Ops:** `createEmbeddingProvider` with `provider:'ollama'` and
  `provider:'openai'`.
- **Expected:** both return an `EmbeddingProvider` (the same interface); the
  ollama one is the local provider, the openai one the remote/cloud provider.

### C2. `EmbeddingProvider` interface members — 5
- **Ops:** inspect a created provider.
- **Expected:** exactly `kind`, `model`, `baseUrl`, `dimension`, `embed`.

### C3. `EmbeddingProviderConfig` fields — 6
- **Ops:** inspect the config shape.
- **Expected:** exactly `provider`, `baseUrl`, `model`, `apiKey?`, `dimension?`,
  `timeoutMs?`.

### C4. Ollama base URL + model + endpoint
- **Ops:** `createOllamaEmbedProvider()` (no opts).
- **Expected:** `baseUrl === 'http://127.0.0.1:11434'` (default, localhost-pinned);
  `model === 'embeddinggemma'` (default); the embed posts to `POST /api/embed`.

### C5. HTTP timeout default — 5000 ms
- **Ops:** inspect the provider's timeout behavior (a stubbed `fetch` that never
  resolves).
- **Expected:** the embed rejects with `timeout after 5000ms` (the default).

### C6. Embedding dimension — auto-detected; mock fixed dimension 4
- **Ops:** `createOllamaEmbedProvider().embed(...)` (auto-detect); `createMockEmbedder()`.
- **Expected:** the provider auto-detects the dimension from the first response;
  the mock's fixed dimension is 4 (default).

### C7. Cosine similarity range — [-1, 1]
- **Ops:** `cosineSimilarity` over several vector pairs.
- **Expected:** every result is in [-1, 1].

### C8. Placement threshold — `PLACEMENT_MIN_SCORE` (default 0)
- **Ops:** inspect `PLACEMENT_MIN_SCORE` (from `src/main/retrieval.ts`).
- **Expected:** `=== 0`; a best score at or below it is `no-match` (F30).

### C9. Vector index statistics — nodeIds, embeddings, dimension
- **Ops:** `createVectorIndex` over a 2-node list.
- **Expected:** `nodeIds` (insertion order), `embeddings` (nodeId → vector),
  `dimension`.

### C10. Vector index maintenance calls — 1 embed per node at build; 1 per affected node on change; 0 on delete
- **Setup:** a counting `embedFn`.
- **Ops:** `createVectorIndex` over 2 nodes; `updateVectorIndex`; `addToVectorIndex`;
  `removeFromVectorIndex`.
- **Expected:** 2 embeds at build; 1 embed per affected node on content/structural
  change; 0 embeds on delete.

### C11. `Embedder` interface methods — 2 + 1 optional hook
- **Ops:** inspect the `Embedder` shape.
- **Expected:** `score`, `place` + the optional `onStoreChanged?` lifecycle hook.

### C12. Async-amended retrieval stack — 4 signatures become async
- **Ops:** inspect `selectTopK`, `retrieve`, `RetrievalEngine.query`,
  `RetrievalEngine.onStoreChanged`.
- **Expected:** all 4 return Promises (async).

### C13. Mock dimension — 4 (default)
- **Ops:** `createMockEmbedder()`; `score` a node.
- **Expected:** the mock's embedding dimension is 4 (default).

### C14. Integration-test probe timeout — 1000 ms
- **Ops:** inspect `isOllamaAvailable`'s probe.
- **Expected:** the probe uses a short timeout (~1000 ms); a non-responding
  endpoint returns `false` (no throw).

### C15. Config options — 2
- **Ops:** inspect the config selection.
- **Expected:** `retrieval.embedder: 'lexical' | 'vector'` (default `'lexical'`)
  and `retrieval.embeddingProvider: EmbeddingProviderConfig` (REQUIRED when
  `retrieval.embedder === 'vector'`).

### C16. Security surfaces — 2
- **Ops:** inspect the local + remote security posture.
- **Expected:** LOCAL-SECURITY-POSTURE (localhost, no egress, no API key) and
  REMOTE-SECURITY-POSTURE (`connect-src` CSP allowlist + API-key handling).

### C17. `parsePositiveIntEnv` (the F5 env-parse guard)
- **Ops:** `parsePositiveIntEnv('4')`, `parsePositiveIntEnv('')`,
  `parsePositiveIntEnv(undefined)`, `parsePositiveIntEnv('abc')`,
  `parsePositiveIntEnv('-3')`, `parsePositiveIntEnv('2.5')`.
- **Expected:** `4`; `undefined`; `undefined`; `undefined` (NaN); `undefined`
  (negative); `undefined` (non-integer) — a NaN/negative/non-integer/empty env
  value is dropped (never passed through as a malformed dimension/timeout).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `createEmbeddingProvider` happy (ollama) | ✅ PASS |
| H2 | `createEmbeddingProvider` happy (remote/cloud) | ✅ PASS |
| H3 | Provider dimension auto-detect | ✅ PASS |
| H4 | Provider configured dimension | ✅ PASS |
| H5 | `createVectorIndex` happy | ✅ PASS |
| H6 | `updateVectorIndex` happy (content edit) | ✅ PASS |
| H7 | `addToVectorIndex` happy (node add) | ✅ PASS |
| H8 | `removeFromVectorIndex` happy (node delete) | ✅ PASS |
| H9 | `cosineSimilarity` happy | ✅ PASS |
| H10 | `cosineSimilarity` zero vector | ✅ PASS |
| H11 | `createVectorEmbedder` + `score` happy (mock) | ✅ PASS |
| H12 | Vector determinism | ✅ PASS |
| H13 | Vector tie-break | ✅ PASS |
| H14 | `place` happy (vector) | ✅ PASS |
| H15 | `place` container match (vector) | ✅ PASS |
| H16 | `createMockEmbedder` happy | ✅ PASS |
| H17 | `isOllamaAvailable` happy (ollama up) | ✅ PASS |
| H18 | `isOllamaAvailable` happy (ollama down) | ✅ PASS |
| H19 | Integration test gating | ✅ PASS |
| H20 | Integration test happy (ollama up) | ✅ PASS |
| H21 | Remote/cloud provider mocked happy | ✅ PASS |
| H22 | Async lexical embedder (amended) | ✅ PASS |
| H23 | Async retrieval stack (amended) | ✅ PASS |
| H24 | `onStoreChanged` vector maintenance | ✅ PASS |
| H25 | Config selection | ✅ PASS |
| H26 | MCP/UI equivalence (vector) | ✅ PASS |
| F1 | `createEmbeddingProvider` null/undefined config | ✅ PASS |
| F2 | `createEmbeddingProvider` missing/empty baseUrl | ✅ PASS |
| F3 | `createEmbeddingProvider` missing/empty model | ✅ PASS |
| F4 | `createOllamaEmbedProvider` non-localhost baseUrl | ✅ PASS |
| F5 | `createRemoteEmbedProvider` missing/empty apiKey | ✅ PASS |
| F6 | Ollama provider non-2xx HTTP | ✅ PASS |
| F7 | Ollama provider network failure | ✅ PASS |
| F8 | Ollama provider timeout | ✅ PASS |
| F9 | Ollama provider malformed response | ✅ PASS |
| F10 | Ollama provider dimension mismatch | ✅ PASS |
| F11 | Ollama provider non-string text | ✅ PASS |
| F12 | Remote provider non-2xx HTTP | ✅ PASS |
| F13 | Remote provider network failure | ✅ PASS |
| F14 | Remote provider timeout | ✅ PASS |
| F15 | Remote provider malformed response | ✅ PASS |
| F16 | Remote provider dimension mismatch | ✅ PASS |
| F17 | Remote provider non-string text | ✅ PASS |
| F18 | Remote provider baseUrl not in connect-src allowlist | ✅ PASS |
| F19 | `createVectorIndex` null/undefined nodes or embedFn | ✅ PASS |
| F20 | `update`/`add` null/undefined index/node/embedFn | ✅ PASS |
| F21 | `removeFromVectorIndex` null/undefined index or non-string nodeId | ✅ PASS |
| F22 | `cosineSimilarity` null/undefined a/b | ✅ PASS |
| F23 | `cosineSimilarity` dimension mismatch | ✅ PASS |
| F24 | `createVectorEmbedder` null/undefined store | ✅ PASS |
| F25 | `createVectorEmbedder` null/undefined opts or opts.provider | ✅ PASS |
| F26 | Provider-creation failure propagation | ✅ PASS |
| F27 | `score` non-string query or null/undefined nodes | ✅ PASS |
| F28 | `place` non-string content or null/undefined nodes/edges | ✅ PASS |
| F29 | `place` empty content (vector) | ✅ PASS |
| F30 | `place` no match (vector) | ✅ PASS |
| F31 | `onStoreChanged` null/undefined nodeIds | ✅ PASS |
| F32 | Embed rejection propagation | ✅ PASS |
| F33 | `RetrievalEngine.query` non-string/empty query | ❌ FAIL (drift) |
| F34 | `retrieval.embedder: 'vector'` missing/invalid provider config | ✅ PASS |
| F35 | `rag.query` with the `rag` group disabled | ✅ PASS |
| F36 | `rag.query` reaching the renderer switch → unknown method | ✅ PASS |
| C1 | Provider kinds (2 concrete, ONE interface) | ✅ PASS |
| C2 | `EmbeddingProvider` interface members (5) | ✅ PASS |
| C3 | `EmbeddingProviderConfig` fields (6) | ✅ PASS |
| C4 | Ollama base URL + model + endpoint | ✅ PASS |
| C5 | HTTP timeout default (5000 ms) | ✅ PASS |
| C6 | Embedding dimension (auto-detect; mock = 4) | ✅ PASS |
| C7 | Cosine similarity range [-1, 1] | ✅ PASS |
| C8 | Placement threshold (`PLACEMENT_MIN_SCORE` = 0) | ✅ PASS |
| C9 | Vector index statistics | ✅ PASS |
| C10 | Vector index maintenance calls (1/1/0) | ✅ PASS |
| C11 | `Embedder` interface methods (2 + 1 hook) | ✅ PASS |
| C12 | Async-amended retrieval stack (4 async) | ✅ PASS |
| C13 | Mock dimension (4) | ✅ PASS |
| C14 | Integration-test probe timeout (1000 ms) | ✅ PASS |
| C15 | Config options (2) | ✅ PASS |
| C16 | Security surfaces (2) | ✅ PASS |
| C17 | `parsePositiveIntEnv` (F5 env-parse guard) | ✅ PASS |

**Run summary:** 63 scenarios — 62 pass, 1 fail (F33 — a spec-vs-impl drift).

### Findings (spec-vs-impl drift)

- **F33 — `RetrievalEngine.query` non-string query (DRIFT).** The Unit F spec
  §5.9 F33 (and §5.7) claims a NON-STRING query to `RetrievalEngine.query`
  rejects with `Error('retrieve: query must be a non-empty string')`. The
  implementation rejects a non-string query (`null`) with
  `Error('retrieve: store/embedder/index/query/opts required')` — the
  `retrieve` "required" fail-state. The empty/whitespace sub-cases (`''`,
  `'   '`) DO reject with `'retrieve: query must be a non-empty string'` as the
  spec claims. The implementation distinguishes a non-string query (→ the
  "required" fail-state, consistent with Unit E §5.9 F14) from an
  empty/whitespace string (→ the "non-empty string" fail-state, Unit E §5.9
  F15). The Unit F spec F33 conflates the two. **This is a documentation drift
  in the Unit F spec** — the implementation is consistent with the authoritative
  Unit E `retrieve` fail-states (F14/F15). The implementation was NOT changed
  to make the scenario pass; the drift is reported to the supervisor.
- **No other drift observed.** Every other scenario derived from
  `docs/specs/unit-f-embeddings.md` §5.1–§5.10 (plus the amended
  `docs/specs/unit-e-rag-index.md` §5.2 async `Embedder`) passed against the
  live modules. The provider abstraction + config (§5.2), the ollama
  `embeddinggemma` concrete provider, the remote/cloud provider drop-in, the
  vector index (§5.3), cosine similarity scoring (§5.4), the vector embedder
  behind the async `Embedder` interface (§5.5), the mock embedder + the
  real-ollama integration path + the mocked remote path (§5.6), the async
  retrieval-engine ripple + MCP/UI equivalence + security/CSP + config
  selection (§5.7), all 26 happy paths (§5.8), the other 35 fail-states (§5.9),
  and every census claim (§5.10) match the spec.

### Test-authoring notes (not drifts)

- **H13 (vector tie-break).** An initial assertion used two nodes with DIFFERENT
  content (`'hello world'` vs `'hello there'`), which do NOT produce equal
  scores under the mock bag-of-words embedding (the `world`/`there` tokens land
  in different buckets). This was a test bug, not a spec drift. The fixed
  scenario uses two nodes with IDENTICAL content (`'hello world'`), which
  produce identical embeddings → equal scores → the tie-break by node id
  ascending (`n1` then `n2`) is exercised and passes.
- **H17/H20 (real-ollama integration).** These scenarios run against the live
  localhost ollama `embeddinggemma` model (the test environment). On this machine
  ollama is UP and the model is available, so they ran and passed. If ollama were
  down, H17 would return `false` and H20 would be SKIPPED (the `skipIf` gate) —
  never a fail.
- **H25/F34 (config selection).** The `retrieval.embedder` selection lives in
  `src/main/main.ts` (the Electron entry, not directly invocable in a node unit
  test). These scenarios are verified by static inspection of the selection
  logic, matching the Unit E F22 convention for main-process-only constructs.
- **F35 (rag group disabled).** Verified via `defaultSecurityConfig()` +
  `toolAllowed` from `src/main/security.ts`, matching the Unit E F21 convention.
- **F36 (renderer negative contract).** The renderer switch is a browser-entry
  construct, not node-testable; the scenario verifies the negative contract by
  static grep on `src/renderer/renderer.ts` (comments stripped), matching the
  Unit E F22 / Unit B G9 convention — no `case 'rag.query'` exists, so a call
  reaching the renderer falls through to the `default` branch → `unknown method`
  (fail-closed).
