# Unit E — RAG Index + Retrieval: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-e-rag-index.md`
  ONLY — no implementation reading of the scenario content).
- **Source contract:** `docs/specs/unit-e-rag-index.md` §5.1–§5.10.
- **Modules under test:** `src/main/retrieval.ts` (`tokenize`, `DEFAULT_STOPWORDS`,
  `PLACEMENT_MIN_SCORE`, `createLexicalIndex`, `updateLexicalIndex`,
  `addToLexicalIndex`, `removeFromLexicalIndex`, `createLexicalEmbedder`,
  `selectTopK`, `assembleContext`, `retrieve`, `createRetrieval`), the `rag.query`
  tool in `src/main/mcp-server.ts` (`handleRagTool`) and the `rag-query` IPC
  (`handleRagQueryIpc`), the `RagStore` interface via `createJsonRagStore`
  (`src/main/rag-store.ts`), the gating predicate `toolAllowed` /
  `defaultSecurityConfig` (`src/main/security.ts`), and the `IPC_RAG_QUERY`
  constant (`src/shared/types.ts`).
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The store's mutating methods
  (`putNode`/`putEdge`/`removeNode`) are async and queue-serialized, so they are
  awaited.
- **Run:** 52 scenarios — 52 pass, 0 fail. The single scenario that initially
  failed was a TEST-AUTHORING bug, not a spec drift (see the run record).

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (22)

Fixture helpers: `N(id, type, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`.

### H1. `tokenize` happy
- **Ops:** `tokenize('Hello, World!')`.
- **Expected:** `['hello', 'world']` (lowercase, split on non-alphanumeric runs,
  drop empty tokens + stopwords); `tokenize('x  y')` → `['x','y']`;
  `tokenize('the quick brown fox')` → `['quick','brown','fox']`.

### H2. `createLexicalIndex` happy
- **Setup:** nodes `N1('hello world')`, `N2('hello there')`.
- **Ops:** `createLexicalIndex([n1, n2])`.
- **Expected:** `nodeIds === ['n1','n2']`; `documentCount === 2`;
  `termFrequencies['n1']['hello'] === 1`, `['world'] === 1`;
  `documentFrequencies['hello'] === 2`, `['world'] === 1`;
  `averageDocumentLength === 2`.

### H3. `updateLexicalIndex` happy (content edit)
- **Setup:** index over `N1('hello world')`, `N2('hello there')`.
- **Ops:** `updateLexicalIndex(index, N1('goodbye moon'))`.
- **Expected:** `n1`'s TF replaced (`goodbye`/`moon` present, `hello`/`world`
  gone); DF recomputed for the changed terms (`hello` → 1, `goodbye` → 1,
  `world` removed at DF 0); `averageDocumentLength` recomputed to 2.

### H4. `addToLexicalIndex` happy (node add)
- **Setup:** index over `N1('hello world')`.
- **Ops:** `addToLexicalIndex(index, N2('hello there'))`.
- **Expected:** `nodeIds === ['n1','n2']`; `documentCount === 2`; `n2`'s TF added
  (`hello` → 1); `documentFrequencies['hello'] === 2`;
  `averageDocumentLength === 2`.

### H5. `removeFromLexicalIndex` happy (node delete)
- **Setup:** index over `N1('hello world')`, `N2('hello there')`.
- **Ops:** `removeFromLexicalIndex(index, 'n1')`.
- **Expected:** `nodeIds === ['n2']`; `documentCount === 1`; `n1`'s TF removed;
  `documentFrequencies['hello'] === 1`, `['world']` removed at DF 0;
  `averageDocumentLength === 2`.

### H6. `createLexicalEmbedder` + `score` happy
- **Setup:** nodes `N1('hello world')`, `N2('goodbye moon')`; index + embedder.
- **Ops:** `embedder.score('hello', nodes)`.
- **Expected:** `n1` scores > 0 and ranks first; `n2` scores 0 (no matching
  terms); result is a fresh array, highest score first.

### H7. BM25 determinism
- **Setup:** nodes `N1('hello world')`, `N2('hello there')`; index + embedder.
- **Ops:** `embedder.score('hello', nodes)` twice.
- **Expected:** both calls return identical ranked results.

### H8. BM25 tie-break
- **Setup:** nodes `N2('hello world')`, `N1('hello there')` (equal scores).
- **Ops:** `embedder.score('hello', nodes)`.
- **Expected:** equal scores sorted by node id ascending → `n1` then `n2`.

### H9. `place` happy
- **Setup:** node `N1('p', 'hello world')`; index + embedder.
- **Ops:** `embedder.place('hello', [n1], [])`.
- **Expected:** `{ ok: true, targetNodeId: 'n1', edgeKind: 'next-section', score > 0 }`
  (the new section follows a section in document order).

### H10. `place` container match
- **Setup:** for each of `ul`/`ol`/`div`, node `N1(type, 'hello world')`.
- **Ops:** `embedder.place('hello', [n1], [])`.
- **Expected:** `{ ok: true, targetNodeId: 'n1', edgeKind: 'doc-child', ... }`
  (the new section nests within the container).

### H11. `selectTopK` happy
- **Setup:** nodes `N1('hello world')`, `N2('hello there')`, `N3('goodbye moon')`;
  index + embedder.
- **Ops:** `selectTopK(embedder, 'hello', nodes, 2)`.
- **Expected:** returns the top-2 scored nodes, highest-first; `n1` then `n2`
  (equal scores tie-broken by node id); both score > 0.

### H12. `selectTopK` k > node count
- **Setup:** nodes `N1('hello world')`, `N2('goodbye moon')`.
- **Ops:** `selectTopK(embedder, 'hello', nodes, 10)`.
- **Expected:** all scored nodes returned (length 2).

### H13. `assembleContext` happy
- **Setup:** store with `n1`/`n2`/`n3` linked by `next-section n1→n2→n3`; seeds
  `[{ nodeId:'n1', score:1 }]`.
- **Ops:** `assembleContext(store, topK, { maxNodes:50, maxDepth:3 })`.
- **Expected:** context assembled by graph traversal with the seed first;
  `traversal.visited` equals `context` node ids in visit order;
  `traversal.nodeCount === context.length`; `markdown` is a non-empty string;
  `lineMap.ranges` is an array.

### H14. `assembleContext` bound
- **Setup:** store with 100 nodes in a `next-section` chain; seed `n0`.
- **Ops:** `assembleContext(store, topK, { maxNodes:10, maxDepth:2 })`.
- **Expected:** `context.length ≤ 10`; `traversal.nodeCount ≤ 10`;
  `traversal.depth ≤ 2`.

### H15. `assembleContext` empty seeds
- **Setup:** fresh store.
- **Ops:** `assembleContext(store, [], { maxNodes:50, maxDepth:3 })`.
- **Expected:** empty context — `context: []`, `markdown: ''`,
  `lineMap: { ranges: [] }`, `traversal: { visited: [], depth: 0, nodeCount: 0 }`
  — no throw.

### H16. `retrieve` happy
- **Setup:** store with `n1('hello world')`, `n2('goodbye moon')`; index +
  embedder.
- **Ops:** `retrieve(store, embedder, index, 'hello', {})`.
- **Expected:** `query === 'hello'`; `ranked[0].nodeId === 'n1'`; `context` is an
  array; `markdown` is a string; `lineMap.ranges` is an array; `k === 5`
  (default).

### H17. `createRetrieval` + `query` happy
- **Setup:** store with `n1('hello world')`; engine built over the store.
- **Ops:** `engine.query('hello')`.
- **Expected:** the engine returns the retrieval result (`query`, non-empty
  `ranked`, `k === 5` default).

### H18. `onStoreChanged` content
- **Setup:** engine over store with `n1('hello world')`.
- **Ops:** `putNode(n1('goodbye moon'))`; `onStoreChanged('content', ['n1'], [])`.
- **Expected:** the index is updated for `n1` — `query('goodbye')` ranks `n1`,
  `query('hello')` no longer ranks `n1`.

### H19. `onStoreChanged` structural add
- **Setup:** engine over store with `n1('hello world')`.
- **Ops:** `putNode(n2('goodbye moon'))`; `onStoreChanged('structural', ['n2'], [])`.
- **Expected:** the index adds `n2` — `query('goodbye')` ranks `n2`.

### H20. `onStoreChanged` structural delete
- **Setup:** engine over store with `n1('hello world')`, `n2('goodbye moon')`.
- **Ops:** `removeNode('n1')`; `onStoreChanged('structural', ['n1'], [])`.
- **Expected:** the index removes `n1` — `query('hello')` no longer ranks `n1`.

### H21. `rag.query` happy
- **Setup:** fresh store.
- **Ops:** `handleRagTool(store, 'rag.query', { query: 'hello' })`.
- **Expected:** the tool returns the retrieval result — `query === 'hello'`,
  `ranked`/`context` arrays, `markdown` string, `lineMap` defined, `k === 5`
  (default).

### H22. MCP/UI equivalence happy
- **Setup:** store with `n1('hello world')`, `n2('hello there')`; a shared
  maintained engine.
- **Ops:** `handleRagTool(store, 'rag.query', { query:'hello', topK:2 }, engine)`
  and `handleRagQueryIpc(engine, store, { query:'hello', topK:2 })`.
- **Expected:** both produce the identical result — same `ranked`, `context`,
  `markdown`, `lineMap`, and `k === 2` (MCP/UI equivalence, §8.2 BINDING).

---

## B. §5.9 Fail-states (22)

### F1. `tokenize` non-string
- **Ops:** `tokenize(null)`, `tokenize(undefined)`, `tokenize(42)`.
- **Expected:** each throws `Error('tokenize: text must be a string')`.

### F2. `createLexicalIndex` null/undefined nodes
- **Ops:** `createLexicalIndex(null)`, `createLexicalIndex(undefined)`.
- **Expected:** each throws `Error('createLexicalIndex: nodes required')`.

### F3. `updateLexicalIndex`/`addToLexicalIndex` null/undefined index or node
- **Ops:** `updateLexicalIndex(null, n)`, `updateLexicalIndex(index, null)`,
  `addToLexicalIndex(null, n)`, `addToLexicalIndex(index, null)`.
- **Expected:** each throws `Error('lexical index: index/node required')`.

### F4. `removeFromLexicalIndex` null/undefined index or non-string nodeId
- **Ops:** `removeFromLexicalIndex(null, 'n')`,
  `removeFromLexicalIndex(index, null)`, `removeFromLexicalIndex(index, 42)`.
- **Expected:** each throws `Error('lexical index: index/nodeId required')`.

### F5. `createLexicalEmbedder` null/undefined index
- **Ops:** `createLexicalEmbedder(null)`, `createLexicalEmbedder(undefined)`.
- **Expected:** each throws `Error('createLexicalEmbedder: index required')`.

### F6. `score` non-string query or null/undefined nodes
- **Ops:** `embedder.score(null, [])`, `embedder.score('hello', null)`.
- **Expected:** each throws `Error('embedder score: query/nodes required')`.

### F7. `place` non-string content or null/undefined nodes/edges
- **Ops:** `place(null, [], [])`, `place('hello', null, [])`,
  `place('hello', [], null)`.
- **Expected:** each throws `Error('embedder place: content/nodes/edges required')`.

### F8. `place` empty content
- **Ops:** `place('', [], [])`, `place('   ', [], [])`.
- **Expected:** each `{ ok: false, reason: 'empty-content' }`.

### F9. `place` no match
- **Setup:** node `n1('alpha beta')`.
- **Ops:** `place('zzz qqq', [n1], [])` (no shared terms).
- **Expected:** `{ ok: false, reason: 'no-match' }` (best score 0 ≤
  `PLACEMENT_MIN_SCORE`).

### F10. `selectTopK` null/undefined embedder, non-string query, null/undefined nodes, non-positive-integer k
- **Ops:** `selectTopK(null, 'hello', nodes, 1)`, `selectTopK(embedder, null, ...)`,
  `selectTopK(embedder, 'hello', null, 1)`, `selectTopK(embedder, 'hello', nodes, 1.5)`,
  `selectTopK(embedder, 'hello', nodes, NaN)`.
- **Expected:** each throws `Error('selectTopK: embedder/query/nodes/k required')`.

### F11. `selectTopK` k < 1
- **Ops:** `selectTopK(embedder, 'hello', [], 0)`, `(…, -1)`.
- **Expected:** each throws `Error('selectTopK: k must be a positive integer')`.

### F12. `assembleContext` null/undefined store/topK/opts
- **Ops:** `assembleContext(null, [], opts)`, `assembleContext(store, null, opts)`,
  `assembleContext(store, [], null)`.
- **Expected:** each throws `Error('assembleContext: store/topK/opts required')`.

### F13. `assembleContext` maxNodes < 1 or maxDepth < 0
- **Ops:** `{ maxNodes:0, maxDepth:1 }`, `{ maxNodes:1, maxDepth:-1 }`, plus
  malformed `maxNodes:1.5`/`maxDepth:1.5`.
- **Expected:** each throws `Error('assembleContext: maxNodes/maxDepth invalid')`.

### F14. `retrieve` null/undefined store/embedder/index, non-string query, null/undefined opts
- **Ops:** `retrieve(null, e, i, 'hello', {})`, `retrieve(store, null, i, …)`,
  `retrieve(store, e, null, …)`, `retrieve(store, e, i, null, {})`,
  `retrieve(store, e, i, 'hello', null)`.
- **Expected:** each throws `Error('retrieve: store/embedder/index/query/opts required')`.

### F15. `retrieve` empty/whitespace query
- **Ops:** `retrieve(store, e, i, '', {})`, `retrieve(store, e, i, '   ', {})`.
- **Expected:** each throws `Error('retrieve: query must be a non-empty string')`.

### F16. `retrieve` k < 1
- **Ops:** `retrieve(store, e, i, 'hello', { k:0 })`, `{ k:-1 }`.
- **Expected:** each throws `Error('retrieve: k must be a positive integer')`.

### F17. `createRetrieval` null/undefined store or embedder
- **Ops:** `createRetrieval(null, e)`, `createRetrieval(store, null)`.
- **Expected:** each throws `Error('createRetrieval: store/embedder required')`.

### F18. `onStoreChanged` null/undefined nodeIds
- **Ops:** `engine.onStoreChanged('content', null, [])`,
  `engine.onStoreChanged('content', undefined, [])`.
- **Expected:** each throws `Error('onStoreChanged: nodeIds required')`.

### F19. `rag.query` non-string/empty query
- **Ops:** `handleRagTool(store, 'rag.query', { query:'' })`,
  `{ query:'   ' }`, `{ query:42 }`.
- **Expected:** each throws `Error('rag.query: query must be a non-empty string')`.

### F20. `rag.query` non-positive-integer topK
- **Ops:** `handleRagTool(store, 'rag.query', { query:'hello', topK:0 })`,
  `{ topK:-1 }`, `{ topK:1.5 }`.
- **Expected:** each throws `Error('rag.query: topK must be a positive integer')`.

### F21. `rag.query` with the `rag` group disabled → not callable
- **Setup:** `defaultSecurityConfig()` (default-off).
- **Ops:** inspect the default enabled groups; `toolAllowed('rag.query', …)`.
- **Expected:** `defaultSecurityConfig().enabled === ['read','dispatch']` (no
  `rag`); `toolAllowed('rag.query', ['read','dispatch']) === false`;
  `toolAllowed('rag.query', ['rag']) === true`.

### F22. `rag.query` reaching the renderer switch → unknown method (static grep)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, grep for a `rag.query`
  switch case.
- **Expected:** NO `case 'rag.query'` switch case exists — a `rag.query` that
  reaches the renderer switch hits the `default` branch → `unknown method`
  (fail-closed, the negative contract, Unit B §5.3 Seam 4).

---

## C. §5.10 Census / numeric claims (8)

### C1. BM25 parameters: k1 = 1.2, b = 0.75 (defaults, configurable)
- **Ops:** with a single node `N1('hello world')` (so the length-normalization
  factor collapses to 1), `score('hello')`.
- **Expected:** exact default score `ln(4/3)` (k1 = 1.2, b = 0.75). With
  unequal-length nodes (`N1` 2 tokens, `N2` 4 tokens) a different
  `{ k1:1, b:0.5 }` config produces a different score for the same node
  (the options are honored).

### C2. Stopword set — `DEFAULT_STOPWORDS` fixed module constant
- **Ops:** inspect `DEFAULT_STOPWORDS`.
- **Expected:** a `ReadonlySet<string>` of common English function words —
  `has('the')`, `has('and')`, `has('a')` all `true`; `has('hello')` `false`.
  Configurable via `LexicalEmbedderOptions.stopwords`.

### C3. Placement threshold — `PLACEMENT_MIN_SCORE` fixed constant (default 0)
- **Ops:** inspect `PLACEMENT_MIN_SCORE`.
- **Expected:** `=== 0`; a best score at or below it is `no-match` (F9).

### C4. Selection default k = 5; assembly bounds maxNodes = 50, maxDepth = 3
- **Ops:** `engine.query('hello').k`; `retrieve(…)` with default options.
- **Expected:** `k === 5`; the assembled context is bounded by
  `maxNodes = 50` (≤ 50 nodes).

### C5. Index statistics — documentCount, averageDocumentLength, termFrequencies, documentFrequencies
- **Ops:** `createLexicalIndex` over a 2-node list; inspect the index.
- **Expected:** `documentCount === 2`, `averageDocumentLength === 2`,
  `termFrequencies` is a `Map` (nodeId → term → count),
  `documentFrequencies` is a `Map` (term → count).

### C6. Retrieval outputs — 5 (`ranked`, `context`, `markdown`, `lineMap`, `k`) + `query`
- **Ops:** `retrieve(…)`; inspect the `RetrievalResult` keys.
- **Expected:** the result has exactly `query` + the 5 retrieval outputs:
  `ranked`, `context`, `markdown`, `lineMap`, `k` (6 keys total).

### C7. Edge kinds followed in traversal — 5 (`next-section`, `parent-child`, `doc-child`, `doc-head`, `doc-end`)
- **Setup:** store with `root(div)`, `H(h1)`, `A(p)`, `B(p)`, `C(p)`, `D(p)`;
  edges `doc-head H→root`, `next-section H→A, A→B`, `doc-end B→root`,
  `parent-child A→C`, `doc-child A→D`.
- **Ops:** `assembleContext(store, [{ nodeId:'H', score:1 }], { maxNodes:50, maxDepth:3 })`.
- **Expected:** the traversal reaches nodes via all five edge kinds — the
  context contains `H`, `A`, `B`, `C`, `D`, `root` (next-section H→A/A→B,
  parent-child A→C, doc-child A→D, doc-head H→root; doc-end B→root re-anchors
  the already-visited root, deduped).

### C8. One new IPC — `rag-query` (renderer → main)
- **Ops:** inspect `IPC_RAG_QUERY`; exercise `handleRagQueryIpc`.
- **Expected:** `IPC_RAG_QUERY === 'provident:rag-query'` (the single UI
  retrieval IPC); `handleRagQueryIpc` routes to the SAME engine path and
  rejects identically to the MCP `rag.query` tool (`'rag.query: query must be a
  non-empty string'` / `'rag.query: topK must be a positive integer'`).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `tokenize` happy | ✅ PASS |
| H2 | `createLexicalIndex` happy | ✅ PASS |
| H3 | `updateLexicalIndex` happy (content edit) | ✅ PASS |
| H4 | `addToLexicalIndex` happy (node add) | ✅ PASS |
| H5 | `removeFromLexicalIndex` happy (node delete) | ✅ PASS |
| H6 | `createLexicalEmbedder` + `score` happy | ✅ PASS |
| H7 | BM25 determinism | ✅ PASS |
| H8 | BM25 tie-break | ✅ PASS |
| H9 | `place` happy (next-section) | ✅ PASS |
| H10 | `place` container match (doc-child) | ✅ PASS |
| H11 | `selectTopK` happy | ✅ PASS |
| H12 | `selectTopK` k > node count | ✅ PASS |
| H13 | `assembleContext` happy | ✅ PASS |
| H14 | `assembleContext` bound | ✅ PASS |
| H15 | `assembleContext` empty seeds | ✅ PASS |
| H16 | `retrieve` happy | ✅ PASS |
| H17 | `createRetrieval` + `query` happy | ✅ PASS |
| H18 | `onStoreChanged` content | ✅ PASS |
| H19 | `onStoreChanged` structural add | ✅ PASS |
| H20 | `onStoreChanged` structural delete | ✅ PASS |
| H21 | `rag.query` happy | ✅ PASS |
| H22 | MCP/UI equivalence happy | ✅ PASS |
| F1 | `tokenize` non-string | ✅ PASS |
| F2 | `createLexicalIndex` null/undefined nodes | ✅ PASS |
| F3 | `update`/`add` null/undefined index or node | ✅ PASS |
| F4 | `removeFromLexicalIndex` null/undefined index or non-string nodeId | ✅ PASS |
| F5 | `createLexicalEmbedder` null/undefined index | ✅ PASS |
| F6 | `score` non-string query or null/undefined nodes | ✅ PASS |
| F7 | `place` non-string content or null/undefined nodes/edges | ✅ PASS |
| F8 | `place` empty content | ✅ PASS |
| F9 | `place` no match | ✅ PASS |
| F10 | `selectTopK` null/undefined embedder, non-string query, nodes, non-positive k | ✅ PASS |
| F11 | `selectTopK` k < 1 | ✅ PASS |
| F12 | `assembleContext` null/undefined store/topK/opts | ✅ PASS |
| F13 | `assembleContext` maxNodes < 1 or maxDepth < 0 | ✅ PASS |
| F14 | `retrieve` null/undefined store/embedder/index, non-string query, opts | ✅ PASS |
| F15 | `retrieve` empty/whitespace query | ✅ PASS |
| F16 | `retrieve` k < 1 | ✅ PASS |
| F17 | `createRetrieval` null/undefined store or embedder | ✅ PASS |
| F18 | `onStoreChanged` null/undefined nodeIds | ✅ PASS |
| F19 | `rag.query` non-string/empty query | ✅ PASS |
| F20 | `rag.query` non-positive-integer topK | ✅ PASS |
| F21 | `rag.query` with the `rag` group disabled | ✅ PASS |
| F22 | `rag.query` reaching the renderer switch → unknown method | ✅ PASS |
| C1 | BM25 params (k1 = 1.2, b = 0.75, configurable) | ✅ PASS |
| C2 | Stopword set (`DEFAULT_STOPWORDS`) | ✅ PASS |
| C3 | Placement threshold (`PLACEMENT_MIN_SCORE` = 0) | ✅ PASS |
| C4 | Selection default k = 5; bounds maxNodes = 50, maxDepth = 3 | ✅ PASS |
| C5 | Index statistics (TF, DF, documentCount, avgdl) | ✅ PASS |
| C6 | Retrieval outputs (5 + query) | ✅ PASS |
| C7 | Five edge kinds followed in traversal | ✅ PASS |
| C8 | One new IPC (`rag-query`) | ✅ PASS |

**Run summary:** 52 scenarios — 52 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from `docs/specs/unit-e-rag-index.md`
  §5.1–§5.10 passed against the live modules. The tokenization + lexical index
  (§5.1), the `Embedder` + BM25 lexical implementation (§5.2), selection
  (§5.3), bounded graph traversal + the coarse line→node map (§5.4), the
  retrieval entry point (§5.5), the maintained retrieval engine (§5.6), the
  `rag.query` MCP tool + MCP/UI equivalence (§5.7), all 22 happy paths (§5.8),
  all 22 fail-states (§5.9), and every census claim (§5.10) match the spec. No
  spec-vs-impl drift was observed.

### Test-authoring note (not a drift)

- **C1 (BM25 configurable).** An initial assertion expecting a different `k1`/`b`
  to change the score used a SINGLE node whose `|d|` equals `avgdl` and whose
  `tf == 1` — under those inputs the BM25 length-normalization factor collapses
  to `1` for ANY `k1`/`b`, so the score legitimately does not change. This was a
  test bug, not a spec drift; the implementation is spec-conformant. The fixed
  scenario uses unequal document lengths (`N1` 2 tokens, `N2` 4 tokens), where
  `k1`/`b` genuinely change the score — that passes and confirms the options are
  honored.
- **F22 (renderer negative contract).** The renderer switch is a browser-entry
  construct, not node-testable; the scenario verifies the negative contract by
  static grep on `src/renderer/renderer.ts` (comments stripped), matching the
  Unit B G9 convention — no `case 'rag.query'` exists, so a call reaching the
  renderer falls through to the `default` branch → `unknown method` (fail-closed).
