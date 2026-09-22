# Unit W3 — Embed-Failure Policy: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). Derived from the
  DOCUMENTATION ONLY — `docs/specs/unit-f-embeddings.md` §5.3 (the W3
  amendment: the `VectorIndex` 4-member shape with the `skipped` map
  (`nodeId → 'empty' | 'transient'`); the UNIT-F-SKIP-EMPTY guard extended to
  ALL THREE embed paths incl. the update-to-empty removal rule ("an
  update-to-empty skip therefore ALSO removes the id from `nodeIds`") and the
  empty→non-empty re-classification rule; the embed-failure policy flip (a
  per-node embed rejection on ANY index-maintenance path is recorded
  `skipped.set(nodeId, 'transient')` + logged + the operation RESOLVES) with
  the REAL retry trigger ("re-embeds only its passed nodeIds"); the taxonomy
  note (provider-channel rejections are transient-classified; index-level
  RESOLVED-vector checks remain HARD rejections); the F1
  unconditional-delete-on-hook rule; the F3 dimension latch on the maintenance
  paths; `removeFromVectorIndex` clearing any `skipped` entry), §5.8 #34–36
  (partial-index query semantics; transient skip + retry; the skipped
  census), §5.9 #45–48 (the empty-content add/update fail-state; the per-node
  transient failure; the UNCHANGED required-arg + query-time pins), §5.12
  (the production `embedBatchFn` wiring — F-W2-3 amendment; the RE-PINNED
  `vector index: node embed failed (transient): …` milestone (F4); the
  `PromotionReport` shape incl. `skipped: { empty, transient }` + `adopted`;
  the promotion-census log milestone), §5.10 (the W3 census claims:
  `VectorIndex` members 3 → 4, the skipped-map shape, the 3 failure classes),
  and §3a's W3 subsection (RCA-3 pass 2: F1, F2, F3, F4, F5, F6, F7 — both
  RCA-3 passes' registrations). Format precedent:
  `docs/specs/unit-f-w2-batch-greens.md`. NO implementation file was read:
  `src/main/embeddings.ts`, `src/main/vector-boot.ts`,
  `src/main/retrieval.ts` and `src/main/main.ts` were NOT opened; the
  scenarios below are derived entirely from the spec text (the repo's
  `vitest.config.ts` + `package.json` were read only for runner wiring — the
  W2 precedent). Supporting shapes (`RagNode`, `RagStore`, `Embedder`,
  `RetrievalResult`) came from `docs/specs/unit-a-rag-store.md` §5.1/§5.4 and
  `docs/specs/unit-e-rag-index.md` §5.2/§5.5 — documentation, not code.
- **Source contract:** `docs/specs/unit-f-embeddings.md` §5.3 + §5.8 #34–36 +
  §5.9 #45–48 + §5.10 + §5.12, with §3a's W3 subsection (the unit mapping:
  "W3 failure policy (§5.3 `skipped` map + the empty-guard extension + the
  embed-failure flip; §5.8 #34–36; §5.9 #45–48) | §5.3/§5.9 |
  `tests/embeddings-failure-policy.test.ts` + the re-pin of
  `tests/embeddings.test.ts:380-386`").
- **Module under test (the live module seam):** `src/main/embeddings.js`
  (`createVectorIndex` / `addToVectorIndex` / `updateVectorIndex` /
  `removeFromVectorIndex` — the §5.3 index paths that carry the flip; the
  embedder factory `createVectorEmbedder` whose `onStoreChanged` hook is the
  fourth flip path), `src/main/vector-boot.js` (`createVectorBootController`
  — the §5.12 promotion census + the batched-build wiring observable), and
  `src/main/retrieval.js` (`createRetrieval` — the #48 query-time propagation
  seam). No store is constructed: the store + provider are INJECTED per the
  spec's injectability ("a NEW pure module … NO Electron; the store + provider
  are injected", §5.12) — fixture doubles below.
- **Harness:** a THROWAWAY vitest file under `/tmp/w3-greens/` (the repo's
  `tests/` untouched), executed with the repo's own vitest
  (`npx vitest run --root /tmp/w3-greens` run from the repo, so the repo's
  node_modules supply vitest; `/tmp/w3-greens/node_modules` is a symlink to
  the repo's node_modules). The test imports the LIVE modules by absolute
  path into the repo (`…/src/main/embeddings.js` etc., namespace imports so a
  missing export reports as `undefined` rather than failing the whole file).
  The provider is a DOUBLE for every scenario except the one marked **LIVE**,
  which runs against the real localhost ollama `embeddinggemma`
  (`http://127.0.0.1:11434`) and is skip-gated on its availability — the
  battery does not depend on it. No HTTP stub is needed (the provider double
  replaces the whole provider), so the battery makes NO network egress.
- **Derivation order:** every scenario below was authored from the spec
  BEFORE any scenario was executed; the Run record (§F) was filled in after.
- **Runner (as run):** the repo's own vitest — `npx vitest run --root
  /tmp/w3-greens` executed from the repo; `/tmp/w3-greens/node_modules` is a
  symlink to the repo's node_modules.
- **Run:** 24 executable scenarios ran (1 of them LIVE against the real
  localhost ollama `embeddinggemma`) — **23 pass, 1 fail** in the W3 unit
  scope; the single failure (H34, clause (a)) is a LOW-severity DOC-LETTER
  divergence in the direct `score()` output contract (finding F-SCORE below —
  the §5.8 #34 ranked-level semantics of the SAME scenario PASS); zero
  un-hardened-regression findings. **F-SCORE CLOSED 2026-09-05** by the RCA-6
  doc review's DOC-LETTER re-pin — see the disposition appended to the F-SCORE
  finding below. WIRE-MAIN is DEFERRED-STATIC (the wiring
  claim's site is `src/main/main.ts`, which the blind writer must not open).
  The LIVE scenario ran (ollama up with `embeddinggemma`).

**Fixture helpers (spec-shaped doubles, not implementation-derived):**

- `node(id, content)` = a `RagNode` `{ id, type: 'p', content, ownedNodeIds:
  [], createdAt: T0, updatedAt: T0 }` (ISO-8601 strings; Unit A §5.1 shape —
  the same fixture convention as the W1/W2 greens batteries). `updatedAt` is
  held AT the build read time so the §5.12 reconcile tie rule
  (`updatedAt === embedAt` → UNCHANGED) keeps the controller scenarios
  single-variable.
- `vec(text)` = a deterministic 4-dim vector derived from the text's char
  codes (positive integers; distinct texts → distinct vectors). Used by every
  provider/embed double so all paths are comparable.
- **The provider double** is an `EmbeddingProvider`-shaped object
  (`{ kind, model, baseUrl, dimension, embed, embedBatch }`) whose `embed`
  resolves `vec(text)` unless the text is in its mutable `failTexts` set (or
  its `failAll` flag is set), in which case it REJECTS with
  `Error('simulated provider outage (transient)')` — a caller-settable
  per-text failure that models "a per-node embed rejection after the provider
  is reachable" (§5.3) without any HTTP. The same double flipped between
  calls models an outage that begins or ends mid-life.
- **The store double** is a `RagStore`-shaped in-memory map (`getNode`,
  `listNodes`, `getEdge: () => undefined`, `listEdges: () => []`,
  `putNode`/`removeNode`, plus the remaining interface members as inert
  stubs) — the reads the spec names for these paths are `store.listNodes()`
  (build) and `store.getNode(nodeId)` (the `onStoreChanged` hook, §5.5).
  Deletions in the F1 scenarios remove the node from the map.
- **Log capture** spies `console.log`/`warn`/`error`/`info` into one ordered
  string buffer (the pinned milestones do not name a stream; §5.12 names the
  log STRINGS, and §3a F4 names the helper `warnTransientSkip`).
- **Message assertions are byte-exact** where the spec pins the string
  (`caught err.message` equality); where the spec pins the CLASS but not the
  string (the index-level F6 rejection, §3a F3/F6) the assertion is the
  rejection itself + the doc's own wording (`dimension mismatch`) as a
  substring — noted per scenario.

---

## A. §5.8 Happy-path states (the W3 set, #34–36)

### H34. Partial-index query semantics — a vector-absent node scores 0 and is excluded from `ranked` (§5.8 #34)
- **Ops:** store double with 3 nodes: `n1` content `alpha node one`, `n2`
  content `alpha alpha alpha` (a LEXICAL match for the query), `n3` content
  `gamma node three`. Provider double that FAILS exactly `n2`'s content
  (repeatedly — the build AND every retry attempt) and whose query embed for
  `alpha query` is PINNED to `vec(n1 content)` (a fixture detail — so n1's
  cosine is exactly 1 and the top rank is deterministic). (a) `embedder =
  await createVectorEmbedder(store, { provider })` (the W1 provider-instance
  widening); `await embedder.score('alpha query', store.listNodes())`. (b) the
  §5.12 promotion route: `boot = createVectorBootController(store, provider)`;
  `report = await boot.start()`; `res = await boot.engine.query('alpha
  query')`.
- **Expected:** (a) the embedder construction RESOLVES despite n2's embed
  failure (the §5.3 flip — the build loop is a maintenance path) and `score`
  returns n2 with score EXACTLY 0 (§5.4 "a node NOT in the vector index
  scores 0") while n1 scores 1 (the query embed is pinned to n1's vector by
  the double). (b) `boot.start()` resolves with `skipped: { empty: 0,
  transient: 1 }` and phase `promoted`; `res` carries the SIX
  `RetrievalResult` keys (`query`, `ranked`, `context`, `markdown`,
  `lineMap`, `k` — Unit E §5.5); `ranked` CONTAINS `n1` (score > 0) and does
  NOT contain `n2` (the score>0 `ranked` filter, `retrieval.ts:558` per §5.8
  #34) even though n2 matches the query LEXICALLY — a lexical fallback would
  rank it, so its absence is the partial-index vector serving (NOT a lexical
  fallback); `ranked[0].nodeId === 'n1'` (score 1 is the maximum —
  deterministic top rank).

### H35. Transient skip + retry — the touch re-embeds and clears the record (§5.8 #35; §5.3 the REAL trigger)
- **Ops:** store double with nodes `n1`, `n2`; provider double failing only
  `n1`'s content. `embedder = await createVectorEmbedder(store, { provider })`
  → n1 lands `skipped: 'transient'`, n2 indexed. THEN clear the double's
  failure (the outage ends); `await embedder.onStoreChanged('content',
  ['n1'], [])` (the node is TOUCHED).
- **Expected:** the hook call RESOLVES (no rejection — §5.9 #46); the re-embed
  happened (the embed fn was called with `n1`'s content again); on success the
  `skipped` entry for `n1` is REMOVED (§5.8 #35 "on success, removed from
  `skipped`") and n1 is INDEXED again (its id back in `nodeIds`, an embedding
  stored — `vec(n1 content)`).

### H36. Skipped census on the promotion report (§5.8 #36; §5.12 `PromotionReport`)
- **Ops:** store double with 4 nodes: `n1` good content, `n2` EMPTY content
  (`''`), `n3` + `n4` whose contents the provider double fails (an outage
  that outlives the build). `boot = createVectorBootController(store,
  provider)`; `report = await boot.start()`.
- **Expected:** `start()` RESOLVES (a partial build is not a total failure —
  failure class 3, §5.10) and `report` carries the skipped census EXACTLY:
  `report.skipped` deep-equals `{ empty: 1, transient: 2 }` (§5.8 #36 "the
  promotion report carries the skipped census (`empty` n, `transient` m)
  covering the never-edited transient skips"); `report.embedded === 1` (only
  n1 embedded); `boot.phase() === 'promoted'` (the empty/partial index is
  still PROMOTED — boot resilience over loud abort, §5.3 taxonomy); the
  report's other pinned members are present (`cacheHits`, `reEmbedded`,
  `adopted`, `promotedAt` — §5.12 + the RCA-3 F-W1-2 amendment).

---

## B. §5.9 Fail-states (the W3 set, #45–48)

### B45. Empty-content add/update — NO embed call, `skipped` 'empty', the update REMOVES the embedding (§5.9 #45; §5.3 UNIT-F-SKIP-EMPTY on ALL THREE paths)
- **Ops:** a happy 1-node index (`idx = await createVectorIndex([node('n0',
  'seed')], healthyEmbed)`); a counting embed double `embedCalls`. THEN:
  (i) `addToVectorIndex(idx, node('nA', ''), embed)` — empty content;
  (ii) `addToVectorIndex(idx, node('nB', '   '), embed)` — whitespace;
  (iii) `addToVectorIndex(idx, { ...node('nC', 'x'), content: undefined },
  embed)` — non-string content; (iv) `updateVectorIndex(idx, node('n0',
  ''), embed)` — the indexed node's content BECAME empty.
- **Expected:** EVERY call RESOLVES — no `malformed response` rejection
  (§5.9 #45) — and the embed-call count NEVER moves (NO embed call on any of
  the four). (i)–(iii): `skipped.get('nA'/'nB'/'nC') === 'empty'`, none of
  them in `nodeIds`/`embeddings` ("the node is NOT added"). (iv): n0's
  PREVIOUS embedding is REMOVED from the index (`embeddings` no longer holds
  n0) and n0's id is removed from `nodeIds` too (§5.3 "an update-to-empty
  skip therefore ALSO removes the id from `nodeIds`" — the invariant wins),
  `skipped.get('n0') === 'empty'`; the index's other state is untouched.

### B46a. Build-transient — a per-node build embed failure does NOT propagate; the build CONTINUES (§5.9 #46; §5.3 build-loop path)
- **Ops:** 3 nodes (`n1`, `n2`, `n3`); provider double failing exactly
  `n2`'s content; `idx = await createVectorIndex(nodes, provider.embed)`.
- **Expected:** the promise RESOLVES (pre-W3 this rejected — §5.3
  "[W1/W2 — unchanged until W3]" vs the W3 flip); ALL 3 nodes were attempted
  (the embed fn was called 3 times — the loop did not stop at the failure);
  `n2` is recorded `skipped.get('n2') === 'transient'` and is ABSENT from
  `nodeIds`/`embeddings`; `n1` and `n3` are fully indexed in node order with
  their vectors (`vec` of their contents); `idx.dimension ===
  vec(anything).length === 4`.

### B46b. Update-transient — the node becomes UNINDEXED (its previous embedding replaced with nothing) (§5.9 #46; §5.3 update path)
- **Ops:** a happy 1-node index over `n1` (`vec` vector stored); THEN the
  provider double fails (`failAll`); `p = updateVectorIndex(idx, node('n1',
  'changed content'), provider.embed)`.
- **Expected:** `p` RESOLVES (the flip — the operation is not propagated);
  n1's previous embedding is GONE (`embeddings` holds no n1 entry) and n1's
  id is out of `nodeIds` (a skipped node is NOT in `nodeIds`/`embeddings` —
  it scores 0 until a successful re-embed); `skipped.get('n1') ===
  'transient'` ("the `skipped` map stays the authoritative 'not currently
  indexed due to failure' record").

### B46c. Add-transient — a failing add does NOT reject and does NOT index (§5.9 #46; §5.3 add path)
- **Ops:** a happy 1-node index; the provider double failing; `p =
  addToVectorIndex(idx, node('nX', 'brand new'), provider.embed)`.
- **Expected:** `p` RESOLVES; `nX` is NOT in `nodeIds` (nothing appended) and
  has NO embedding; `skipped.get('nX') === 'transient'`; the pre-existing
  index state is unchanged.

### B46d. Hook-transient — a per-node failure on the `onStoreChanged` hook path resolves (§5.9 #46; §5.3 "the `onStoreChanged` hook"; §3a F1's hook context)
- **Ops:** store double with `n1`, `n2`; a HEALTHY provider double;
  `embedder = await createVectorEmbedder(store, { provider })` (both nodes
  indexed). THEN set the double to fail ALL embeds; `p =
  embedder.onStoreChanged('content', ['n1'], [])` (a content touch of n1 —
  the hook re-embeds via `updateVectorIndex`).
- **Expected:** `p` RESOLVES (pre-W3 the hook rejected — §5.5 fail-state
  "an `embedFn` rejection … propagates from … `onStoreChanged`" as amended by
  the §5.3 flip, which names the hook as a flip path); n1 is recorded
  `skipped: 'transient'` and UNINDEXED (B46b semantics through the hook);
  n2 (untouched) is still indexed with its original embedding.

### B47. Required-arg rejections — UNCHANGED in W3, byte-exact (§5.9 #47 → §5.9 #19–21; §5.3 fail-states)
- **Ops:** over a happy index `idx` + healthy embed double: `errMsg(await
  catch(createVectorIndex(null, embed)))`, `createVectorIndex(nodes,
  undefined)`, `addToVectorIndex(null, node, embed)`,
  `addToVectorIndex(idx, null, embed)`, `addToVectorIndex(idx, node,
  undefined)`, `updateVectorIndex(null, node, embed)`,
  `updateVectorIndex(idx, null, embed)`, `updateVectorIndex(idx, node,
  undefined)`; and the SYNCHRONOUS throws `try { removeFromVectorIndex(null,
  'x') }`, `try { removeFromVectorIndex(idx, 42) }`.
- **Expected:** every `createVectorIndex` call REJECTS with EXACTLY
  `Error('createVectorIndex: nodes/embedFn required')`; every
  `addToVectorIndex`/`updateVectorIndex` call REJECTS with EXACTLY
  `Error('vector index: index/node/embedFn required')`; both
  `removeFromVectorIndex` calls THROW (sync — §5.3 "SYNCHRONOUS (no embed
  call)") with EXACTLY `Error('vector index: index/nodeId required')`. The
  W3 flip does NOT soften these (§5.9 #47 "§5.9 #19–21 … still reject
  verbatim").

### B48. Query-time embed rejection — UNCHANGED in W3; the flip's boundary (§5.9 #48 → §5.9 #32)
- **Ops:** store double with 2 nodes; a provider double failing ALL embeds;
  (a) `embedder = await createVectorEmbedder(store, { provider })` — the
  BUILD side under the flip; (b) `errMsg(await catch(embedder.score('q',
  store.listNodes())))`; (c) `errMsg(await catch(embedder.place('new
  content', store.listNodes(), [])))`; (d) `engine =
  createRetrieval(store, embedder)`; `errMsg(await
  catch(engine.query('q')))` — the propagation through the shared engine.
- **Expected:** (a) RESOLVES (the flip: every per-node BUILD embed failure is
  a transient skip — the boundary of the flip); (b), (c) and (d) each REJECT
  with the SAME provider error message (`simulated provider outage
  (transient)`) — a provider rejection during the QUERY/content embedding
  still propagates from `score`/`place` (§5.9 #32) and from
  `RetrievalEngine.query` (§5.9 #48 "UNCHANGED"). The build-side mercy does
  not reach the query side.

---

## C. §3a W3 registrations + the §5.3 amendment pins

### SHAPE. The `VectorIndex` 4-member shape — `skipped` is a Map on every path (§5.3 interface; §5.10 "members 3 → 4")
- **Ops:** `idx = await createVectorIndex([node('n1', 'a'), node('n2',
  'b')], healthyEmbed)`; read the index's own keys + `idx.skipped`'s type.
- **Expected:** the index exposes EXACTLY the four members `{ nodeIds,
  embeddings, dimension, skipped }` (§5.3 interface — `skipped` is the W3
  addition, "Interface members: 3 → 4 (§5.10)"); `idx.skipped` is a `Map`
  (of size 0 on a fully-successful build); `nodeIds` is an array in node
  order, `embeddings` a `Map` with one vector per node, `dimension` a
  number.

### RETRY-UNRELATED. The retry trigger is REAL — an UNRELATED touch does not retry a skipped node (§5.3 "re-embeds only its passed nodeIds — the trigger is REAL")
- **Ops:** store double with `n1`, `n2`; provider double failing exactly
  `n1`'s content; `embedder = await createVectorEmbedder(store, {
  provider })` → n1 transient-skipped, n2 indexed. Reset the embed-call log;
  provider now healthy for everything; `await embedder.onStoreChanged(
  'content', ['n2'], [])` — a touch of n2 ONLY.
- **Expected:** the hook resolves; the embed fn was called EXACTLY ONCE, with
  `n2`'s content (the hook re-embeds only its PASSED nodeIds); n1 is STILL
  `skipped: 'transient'` (no retry — an unrelated touch must not resurrect
  it) and still absent from `nodeIds`/`embeddings`; n2 remains indexed.

### E-RECLASS. The empty→non-empty re-classification — an 'empty' skip is re-classified only by a re-embed (§5.3 "it is re-classified only if the node's content later becomes non-empty (a normal `onStoreChanged` touch re-embeds it)"; §5.10 skipped map)
- **Ops:** a happy 1-node index over `n1` via `createVectorEmbedder(store, {
  provider })` (healthy); `await embedder.onStoreChanged('content', ['n1'],
  [])` after the store double's n1 content is set to `''` → B45(iv)
  semantics: n1 `skipped: 'empty'`, unindexed. THEN set the store double's
  n1 content back to a real string (bump `updatedAt`); `await
  embedder.onStoreChanged('content', ['n1'], [])`.
- **Expected:** the second touch RESOLVES; the embed fn was called with n1's
  non-empty content; the 'empty' record is GONE (`skipped.has('n1') ===
  false` — re-classified by the successful re-embed, no stale 'empty' entry
  on an indexed node); n1 is indexed again (id in `nodeIds`, embedding
  stored).

### RM-SKIP. `removeFromVectorIndex` clears `skipped` entries (§5.3 "Removes its embedding and id (and any `skipped` entry for the id)"; the F1 mechanism)
- **Ops:** 3 nodes; provider double failing `n1` and `n3`;
  `idx = await createVectorIndex(nodes, provider.embed)` → n1 + n3
  transient-skipped, n2 indexed. THEN `removeFromVectorIndex(idx, 'n1')` and
  `removeFromVectorIndex(idx, 'n3')` (both unindexed ids) and a CONTROL
  `removeFromVectorIndex(idx, 'unknown-id')`.
- **Expected:** every call is a silent no-throw; the `skipped` entries for
  `n1` and `n3` are CLEARED (`skipped.size === 0` after both); n2's index
  state is untouched; the unknown-id call is a NO-OP (no throw, no state
  change). The unindexed-id clearing is exactly the F1 mechanism the hook
  now relies on ("it no-ops for unknown ids and clears any skipped entry").

### F1-T. A node DELETED while transient-skipped leaves NO stale record (§3a W3 F1, MEDIUM)
- **Ops:** store double with `n1`, `n2`; provider double failing `n1`;
  `embedder = await createVectorEmbedder(store, { provider })` → n1
  transient-skipped (unindexed), n2 indexed. THEN delete n1 from the store
  double; `p = embedder.onStoreChanged('structural', ['n1'], [])`.
- **Expected:** `p` RESOLVES; the `skipped` map has NO entry for `n1` (the
  hook's delete branch calls `removeFromVectorIndex` UNCONDITIONALLY — the
  pre-F1 bug kept the stale 'transient' record forever because the delete
  branch only matched ids still in `nodeIds`); no throw, no other state
  change (n2 still indexed).

### F1-E. A node DELETED while empty-skipped leaves NO stale record (§3a W3 F1 — "deleted while 'transient'/'empty'-skipped")
- **Ops:** store double with `n1` (EMPTY content — never embedded, `skipped:
  'empty'` from the build) and `n2`; `embedder = await
  createVectorEmbedder(store, { provider })`; verify `skipped.get('n1') ===
  'empty'`; delete n1 from the store double; `p =
  embedder.onStoreChanged('structural', ['n1'], [])`.
- **Expected:** `p` RESOLVES; `skipped.has('n1') === false` (no stale 'empty'
  record — the same unconditional-delete rule covers the permanent class).

### F3. The dimension latch on the maintenance paths — an index at dimension 0 latches on the first successful add/update (§3a W3 F3, LOW; §5.3 F6)
- **Ops:** (i) ALL-TRANSIENT build: provider double failing ALL; `idx =
  await createVectorIndex([node('n1','a'), node('n2','b')],
  provider.embed)` — the post-outage dimension-0 index shape (§3a F3 "an
  index promoted at dimension 0"); record `idx.dimension`. (ii) a HEALTHY
  4-dim embed double: `addToVectorIndex(idx, node('nA', 'text a'), embed4)`.
  (iii) a 5-dim embed double (`embed5` returns a 5-length vector):
  `addToVectorIndex(idx, node('nB', 'text b'), embed5)`. (iv) on a FRESH
  all-transient index: `updateVectorIndex(idx2, node('nU', 'text u'),
  embed4)` (nU is unindexed → routed to the add path), then
  `updateVectorIndex(idx2, node('nU', 'text u2'), embed4)` (now indexed),
  then `updateVectorIndex(idx2, node('nU', 'text u3'), embed5)`.
- **Expected:** (i) resolves with `nodeIds === []` and `idx.dimension === 0`
  (no successful embed ever latched a dimension — §3a F3's own "dimension 0"
  shape). (ii) RESOLVES and LATCHES: `idx.dimension === 4` after the add
  (the fix: "the add success path latches `index.dimension = vec.length`
  when the dimension is 0"). (iii) REJECTS — a HARD rejection, never a skip
  (the taxonomy: index-level RESOLVED-vector checks remain hard) — with a
  dimension-mismatch message (substring `dimension mismatch`; §3a F6/F3's
  wording — the exact index-path string is not SpecWriter-pinned), and nB is
  NOT added (the index is not poisoned: `nodeIds` still `['nA']`). (iv) the
  routed add LATCHES (`idx2.dimension === 4`), the successful indexed update
  KEEPS the latch (`dimension` still 4, embedding replaced), and the
  wrong-length update REJECTS with a `dimension mismatch` message (the
  update-path latch + F6 check).

### F2. The systematic-malformation taxonomy — an ALL-transient build promotes an EMPTY index with a LOUD census; index-level resolved-vector checks stay HARD (§3a W3 F2; §5.3 taxonomy; §5.12 log milestone)
- **Ops:** (a) 3 nodes; provider double rejecting EVERY embed with a
  PROVIDER-CHANNEL error (`Error('dimension mismatch (expected 768, got 3)')
` — thrown while EMBEDDING a text): `idx = await createVectorIndex(nodes,
  provider.embed)`; record settlement + skipped. (b) the promotion route:
  `boot = createVectorBootController(store, provider)`; capture console;
  `report = await boot.start()`; read the captured lines; `res = await
  boot.engine.query('anything')`. (c) the HARD control: a HEALTHY embed
  double that RESOLVES with a ZERO-LENGTH vector (`async () => []`):
  `errMsg(await catch(createVectorIndex([node('n1','x')], zeroVec)))`.
- **Expected:** (a) the build RESOLVES — the provider-channel rejection is
  transient-CLASSIFIED (recorded `skipped: 'transient'` × 3, `nodeIds ===
  []`, `dimension === 0`), NOT propagated (the flip). (b) `start()` RESOLVES
  with the pinned all-transient census: `report.skipped` deep-equals
  `{ empty: 0, transient: 3 }` and `report.embedded === 0` (§3a F2 "the
  build RESOLVES with an empty index (`embedded 0`) → the empty-index
  promotion with a LOUD census (`skipped empty 0 / transient N`)");
  `boot.phase() === 'promoted'` (boot resilience over loud abort — the
  PINNED design); the captured log contains the loud census milestone — a
  line matching `vector boot: build complete (embedded 0, cacheHits 0,
  re-embedded` … `skipped empty 0 / transient 3` (§5.12 pinned string);
  `res.ranked` is EMPTY (§5.8 #34 empty-ranked semantics: every node scores
  0 → the score>0 filter drops all). (c) the zero-length RESOLVED vector is
  a HARD rejection: `createVectorIndex` REJECTS with EXACTLY
  `Error('createVectorIndex: malformed response (zero-length vector)')`
  (never stored, never a skip — the index-level check stays hard).

### F6A. The batch-path 'empty' record — the empty text is never batched and is recorded 'empty' (§3a W3 F6a; §5.3 batch build path + UNIT-F-SKIP-EMPTY)
- **Ops:** 3 nodes with contents `[n1: 'content one', n2: '', n3: 'content
  three']`; a recording `embedBatchFn` double + a counting per-item `embed`
  double; `idx = await createVectorIndex(nodes, embed, batchFn)`.
- **Expected:** resolves; the batch fn was called (once — 2 texts fit one
  64-cap chunk) with input EXACTLY `['content one', 'content three']` in node
  order — the EMPTY text was NEVER batched; the per-item embed count is 0
  (no fallback needed); `idx.skipped.get('n2') === 'empty'` (the batch path
  records the same 'empty' class); n2 absent from `nodeIds`/`embeddings`; n1
  + n3 indexed with their vectors.

### F6B. The double-failure fallback — a rejected chunk whose per-item fallback ALSO rejects per text transient-skips every text and still resolves (§3a W3 F6b)
- **Ops:** 3 non-empty nodes; `embedBatchFn` that REJECTS
  (`Error('ollama embed: batch alignment mismatch (expected 3 vectors, got
  2)')` — the W2-pinned alignment shape); a per-item `embed` double that
  ALSO rejects every text (`Error('simulated provider outage (transient)')
  `); `p = createVectorIndex(nodes, embed, batchFn)`.
- **Expected:** `p` RESOLVES (neither failure escapes the build); the batch
  fn was called once and the per-item fallback ran for EXACTLY that chunk's
  3 texts (embed called 3 times — the per-chunk fallback isolation, W2,
  unchanged); EVERY node is recorded `skipped: 'transient'` (each fallback
  rejection is its own per-node transient skip); `nodeIds === []`, no
  embeddings.

### F4. The transient-skip warning carries the RE-PINNED `vector index:` prefix (§3a W3 F4; §5.12 log milestone)
- **Ops:** 1 node (`n1`); provider double failing all; capture console;
  `await createVectorIndex([node('n1','content')], provider.embed)`.
- **Expected:** resolves (the flip); the captured log contains a warning line
  of the shape `vector index: node embed failed (transient): n1 simulated
  provider outage (transient)` — the RE-PINNED prefix `vector index:` (NOT
  the pre-F4 `vector boot:` prefix), carrying BOTH the nodeId and the
  underlying error message (§5.12: "`vector index: node embed failed
  (transient): <nodeId> <error>`").

---

## D. §5.12 observables — the production wiring + the promotion census

### WIRE-BATCH. The controller build is BATCHED when `embedBatchFn` is supplied (§5.12 main() wiring step 3 + the F-W2-3 amendment; §5.12 `VectorBootOptions.embedBatchFn?`)
- **Ops:** store double with 2 non-empty nodes; a healthy provider double
  with its per-item `embed` call-counted; a recording `embedBatchFn` double;
  `boot = createVectorBootController(store, provider, { embedBatchFn:
  batchFn })`; `report = await boot.start()`.
- **Expected:** `start()` RESOLVES and the build went through the BATCH seam:
  the batch double was called ≥ 1 time with the union of its inputs EXACTLY
  the 2 non-empty contents in node order; the provider's per-item `embed`
  was called 0 times by the build (the W1 sequential loop is REPLACED by the
  batched build); `report.embedded === 2`, `report.skipped` deep-equals
  `{ empty: 0, transient: 0 }`; `boot.phase() === 'promoted'`.

### WIRE-SEQ. Control — no `embedBatchFn` → the sequential per-item build (§5.12 "omitted … → the sequential per-item embed, unchanged"; §5.2 sequential default)
- **Ops:** the same store/provider; `boot = createVectorBootController(store,
  provider, {})` (no options); `report = await boot.start()`.
- **Expected:** resolves; the per-item `embed` was called EXACTLY 2 times
  (one per node, in node order) and NO batch fn exists to call;
  `report.embedded === 2`; `report.skipped` `{ empty: 0, transient: 0 }`;
  `boot.phase() === 'promoted'`.

### WIRE-MAIN. The production call site — `createVectorBootController(ragStore, provider, { embedBatchFn: provider.embedBatch, cache })` in `main()` (§5.12 main() wiring step 3)
- **Contract (from the spec):** main passes `embedBatchFn: provider.embedBatch`
  (plus the W4 `cache`) at controller creation — the §5.2 sequential-default
  expression is pinned at that wiring (the F-W2-3 amendment).
- **Verification scope:** the claim's site is `src/main/main.ts` — on this
  battery's do-NOT-open list. Per the W2 precedent (A-F-W2-3) this scenario
  is **DEFERRED-STATIC**: enumerated from the spec, NOT executed, NOT counted
  as a pass; left for the item-10d documentation reviewer. (The controller-
  seam half of the claim IS executed — WIRE-BATCH above.)

---

## E. LIVE end-to-end (the test environment — skip-gated; the battery does not depend on it)

### LIVE-1. A real batched build through the controller — the skipped map is EMPTY (§5.12 wiring live; the W3 flip's happy path on the real model)
- **LIVE** (skip-gated on `isOllamaAvailable()`; the battery does not depend
  on it).
- **Ops:** REAL ollama provider (`createEmbeddingProvider({ provider:
  'ollama', baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })`);
  store double with 3 real-content nodes (`provident alpha vector note`,
  `provident beta storage note`, `provident gamma retrieval note`);
  `boot = createVectorBootController(store, provider, { embedBatchFn:
  provider.embedBatch })` — the §5.12 production shape; `report = await
  boot.start()`; `liveSkipped = boot.skipped()`; `res = await
  boot.engine.query('provident alpha vector')`.
- **Expected:** `start()` RESOLVES with `report.embedded === 3` and
  `report.skipped` deep-equals `{ empty: 0, transient: 0 }` (no node failed,
  none empty); `boot.skipped()` is an EMPTY Map (the live 4th member);
  `boot.phase() === 'promoted'`; the promoted engine's query returns the
  `RetrievalResult` shape with `ranked.length >= 1` and
  `ranked[0].score > 0` (real embeddings rank the corpus; the dimension is
  the model's — 768 per the §5.10 live-verified census, observed not
  asserted).

---

## F. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H34 | Partial-index query semantics (score-0 exclusion + shape) | ❌ FAIL (clause (a) only — the §5.4 direct-score letter; clause (b) the §5.8 #34 ranked-level semantics PASS — finding F-SCORE) → **CLOSED 2026-09-05** (RCA-6 doc review: the DOC LETTER re-pinned to the omission semantics — §5.4/§5.5/§5.8 #34; the docs now match the live `score()`; no code change) |
| H35 | Transient skip + retry — the touch re-embeds and clears | ✅ PASS |
| H36 | Skipped census on the promotion report (mixed) | ✅ PASS |
| B45 | Empty-content add/update — NO embed call, 'empty', update removes | ✅ PASS |
| B46a | Build-transient — resolves, the build continues | ✅ PASS |
| B46b | Update-transient — the node becomes unindexed | ✅ PASS |
| B46c | Add-transient — resolves, not indexed | ✅ PASS |
| B46d | Hook-transient — the hook path resolves | ✅ PASS |
| B47 | Required-arg rejections UNCHANGED (byte-exact) | ✅ PASS |
| B48 | Query-time embed rejection UNCHANGED (+ flip boundary) | ✅ PASS |
| SHAPE | The `VectorIndex` 4-member shape (`skipped` Map) | ✅ PASS |
| RETRY-UNRELATED | An unrelated touch does not retry | ✅ PASS |
| E-RECLASS | The empty→non-empty re-classification | ✅ PASS |
| RM-SKIP | `removeFromVectorIndex` clears skipped entries | ✅ PASS |
| F1-T | Deleted while transient-skipped → no stale record | ✅ PASS |
| F1-E | Deleted while empty-skipped → no stale record | ✅ PASS |
| F3 | The dimension latch (add/update paths at dimension 0) | ✅ PASS |
| F2 | Systematic-malformation taxonomy (loud census; hard control) | ✅ PASS |
| F6A | The batch-path 'empty' record | ✅ PASS |
| F6B | The double-failure fallback | ✅ PASS |
| F4 | The re-pinned `vector index:` warning prefix | ✅ PASS |
| WIRE-BATCH | The controller build is batched w/ `embedBatchFn` | ✅ PASS |
| WIRE-SEQ | Control — no `embedBatchFn` → sequential per-item | ✅ PASS |
| WIRE-MAIN | The main.ts production call site | ⏸ DEFERRED-STATIC (main-process-only; out of blind scope — see the scenario) |
| LIVE-1 | Real batched controller build; skipped map empty | ✅ PASS (LIVE) |

**Run summary:** 24 executable scenarios (1 of them LIVE against the real
localhost ollama `embeddinggemma`; skip-gated) — **23 pass, 1 fail** in the
W3 unit scope; WIRE-MAIN is **DEFERRED-STATIC**. The one failure is a
DOC-LETTER divergence (finding F-SCORE: the direct `score()` output omits —
rather than zero-scores — vector-absent nodes), NOT an un-hardened
regression: every W3 behavior pin (the flip on all four paths, the REAL
retry trigger both ways, the empty-guard extension + re-classification, the
F1 unconditional delete, the F3 latch, the F2 taxonomy + loud census, F6a/F6b,
the byte-exact unchanged pins, the batched-build wiring observable, the
promotion census) held against the live modules, and the ranked-level
semantics of the failing scenario's own §5.8 #34 claim passed. **Post-review
status: 24/24 — the F-SCORE doc-letter drift was CLOSED 2026-09-05 by the RCA-6
doc review's re-pin (§5.4/§5.5/§5.8 #34), and WIRE-MAIN's deferred-static claim
was verified TRUE at `src/main/main.ts:163` (`embedBatchFn: provider.embedBatch`
at controller creation) by the same review. **Re-pointed 2026-09-05 (W4 doc
review): the call is now at `main.ts:168` with the W4
`cache: createVectorCache()` arg added (the W4 final shape) — verified by
that review.**

### Findings

- **F-SCORE (the one failure — LOW, doc-letter drift in the `score()` output
  contract; NOT a W3 flip regression).** §5.4 ("For each node in `nodes`, its
  embedding is looked up in the vector index … A node NOT in the vector index
  scores 0"), §5.5 ("a node not in the vector index scores 0"), Unit E §5.2
  ("Score all RAG nodes against a query") and §5.8 #34 (whose exclusion
  mechanism is cited as `retrieve`'s `retrieval.ts:558` **score>0 filter** — a
  filter that can only drop a node PRESENT with score 0) all model a
  vector-absent node as SCORED-THEN-FILTERED. The live module's `score()`
  instead OMITS vector-absent nodes from the returned list: H34 clause (a)
  found NO `n2` entry at all (a characterization probe — throwaway, not part
  of the battery — confirmed `score(all nodes)` over `{n1 indexed, n2
  skipped, n3 indexed}` returns exactly `[{n1}, {n3}]`; a SUBSET passed list
  is respected correctly (`score(query, [n1])` → `[{n1}]`, the indexed-but-
  not-passed node does NOT leak); an empty list → `[]`). The downstream
  contract is UNAFFECTED — H34 clause (b) PASSED: the absent node is excluded
  from `ranked`, the `RetrievalResult` shape is exact, and the exclusion is
  partial-index vector serving rather than a lexical fallback. **Suggested
  disposition (supervisor/doc-reviewer):** either re-pin the docs' letter
  ("a vector-absent node is omitted from the scored list — equivalent at the
  `ranked` level") or align `score()` to zero-score absent nodes; one line of
  either doc or code closes it. **DISPOSITION (2026-09-05, RCA-6 doc review): the DOC LETTER re-pinned** — `docs/specs/unit-f-embeddings.md` §5.4 ("Scoring rules") + §5.5 ("`score(query, nodes)`") + §5.8 #34 now state the omission semantics ("a vector-absent node is omitted from the scored set — equivalent at the ranked level to the pre-W3 score-0-and-filter"); the three citing parentheticals that repeated the old letter (§5.3 ×2 + the §3a F2 empty-ranked registration) were re-pinned for consistency. Unit E §5.2 was CHECKED and does NOT repeat the score-0 letter (its "a node not in the index … scores 0" is the BM25/LEXICAL scoring rule — the lexical index's own behavior, load-bearing in Unit E and unchanged); no code change. CLOSED.
- **Zero un-hardened-regression findings in the W3 unit scope.** Every W3
  behavior claim derived from §5.3 (the flip, the `skipped` map, the
  empty-guard extension, the F1/F3 fixes), §5.8 #34–36, §5.9 #45–48, §5.12
  and §3a's W3 subsection passed — including the byte-exact unchanged pins
  (`createVectorIndex: nodes/embedFn required`, `vector index:
  index/node/embedFn required`, `vector index: index/nodeId required` sync
  throw) and the pinned census/log strings (`vector boot: build complete
  (embedded 0, cacheHits 0, re-embedded 0, skipped empty 0 / transient 3)`
  observed for the all-transient build; `vector index: node embed failed
  (transient): <nodeId> <error>` observed with the RE-PINNED prefix on every
  transient skip — the pre-F4 `vector boot:` prefix never appeared).
- **W3-era census confirmed at runtime (§5.10).** `VectorIndex` exposes the
  FOUR members `{ nodeIds, embeddings, dimension, skipped }` with `skipped` a
  `Map` (members 3 → 4 LANDED); `createVectorBootController` accepts
  `opts.embedBatchFn` and the build goes through the batch seam when it is
  supplied, staying sequential per-item when omitted (WIRE-BATCH/WIRE-SEQ);
  the promotion report carries the full pinned shape incl. the
  `skipped: { empty, transient }` census and the RCA-3 `adopted` field
  (H36/F2).
- **The W3 flip is real on ALL FOUR paths** (§5.3): a per-node embed
  rejection on the build loop (B46a), `updateVectorIndex` (B46b — the node's
  previous embedding is replaced with NOTHING and the id leaves `nodeIds`),
  `addToVectorIndex` (B46c) and the `onStoreChanged` hook (B46d) all RESOLVE
  with a `transient` record, while the required-arg rejections (B47) and the
  query-time embed rejection through `score`/`place`/`RetrievalEngine.query`
  (B48) still reject verbatim — the flip's boundary is exactly where the spec
  draws it.
- **No W3 pendings remain from the earlier batteries.** The W2 greens battery
  left the W3-era items (the `skipped` member, the flip re-pin of the
  reject-propagation contract, the production `embedBatchFn` wiring) explicitly
  unclaimed; this battery ran exactly those and they hold (SHAPE, B46a, and
  WIRE-BATCH at the controller seam — the `main.ts` call site itself stays
  DEFERRED-STATIC per the do-NOT-open rule).

### Test-authoring notes

- **Derivation order held.** All 25 scenario rows (24 executable + 1
  deferred-static) were authored and committed BEFORE the first execution;
  the §F table, run summary and findings were the only post-run edits.
- **Runner-wiring fixes before the first recorded result.** (i) The repo path
  contains a SPACE, which vite cannot load through a URL-encoded absolute
  specifier — the runner imports the live modules through `/tmp/astro`, a
  symlink to the repo (runner wiring only; no scenario changed). The modules'
  own internal `.js` → `.ts` specifiers resolve correctly through it. (ii) A
  destructure bug in the B48 harness (reading `state` off the provider instead
  of the double) was fixed. Both were fixed before the result-recording run.
- **The hook-path scenarios read the embedder's index through the §5.5 W1
  prebuilt-index ADOPTION seam** (`createVectorEmbedder(store, { provider,
  index })` — "the embedder ADOPTS it"): the adopted literal is mutated by the
  hook in place, giving a direct read of `skipped`/`nodeIds`/`embeddings` for
  B46d, E-RECLASS, F1-T and F1-E. Where a scenario's Ops produce the skip from
  a BUILD instead (H35, RETRY-UNRELATED), the pre/post state is observed
  through the embedder's `score` as absent-or-zero — see the next note.
- **H35/RETRY-UNRELATED probes assert absent-or-zero, not the zero-letter.**
  The live `score()` omits vector-absent nodes (finding F-SCORE), so a probe
  pinned to `score === 0` would fail for the wrong reason; the authored claims
  of those two scenarios are about the skip/retry OUTCOME (still-not-indexed /
  re-indexed), which absent-or-zero observes faithfully. H34's §5.4 letter
  assertion was deliberately KEPT and is reported as the battery's one
  failure.
- **The F2/F4 log assertions capture all four console streams** (the pinned
  milestones name strings, not a stream); the captured output showed the
  transient-skip warnings on stderr and the boot milestones interleaved, and
  every pinned prefix/line was found. The controller scenarios observed the
  full §5.12 milestone sequence (`vector boot: pending (born-lexical)` →
  `vector boot: build complete (…)` → `vector boot: promoted`).
- **LIVE scenario.** Ollama was UP with `embeddinggemma`; LIVE-1 ran — the
  real 3-node batched build through `createVectorBootController(store,
  provider, { embedBatchFn: provider.embedBatch })` (the §5.12 production
  shape): report `{ embedded 3, cacheHits 0, re-embedded 0, skipped empty 0 /
  transient 0 }`, an EMPTY live `skipped()` map, phase `promoted`, and the
  promoted engine's query returning the exact `RetrievalResult` shape with a
  positively-ranked top node. Skip-gated on `isOllamaAvailable()`; the
  battery's verdict does not depend on it.
- **Byte-exact message assertions.** Every pinned message (B47, the F2 hard
  control `createVectorIndex: malformed response (zero-length vector)`) was
  compared by caught `err.message` EQUALITY; the index-level F6 dimension
  rejections (F3) are asserted as rejection + `dimension mismatch` substring
  (the exact index-path string is not SpecWriter-pinned — noted per scenario).