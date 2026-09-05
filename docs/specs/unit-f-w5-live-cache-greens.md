# Unit W5 — Live Vector-Embed Cache (the promoted-embedder write-through): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). Derived from the
  DOCUMENTATION ONLY — `docs/specs/unit-f-embeddings.md` §5.13 "W5 amendment
  (2026-09-05)" (the live cache write-through contract: the memoizing wrapper
  applies to ALL vector-embed paths of the PROMOTED embedder when a cache is
  supplied; `createVectorEmbedder` gains an optional `cache?: VectorCache`
  (§5.5 amendment); the promoted embedder's `score` query-embeds AND its
  `onStoreChanged` maintenance embeds (`addToVectorIndex`/`updateVectorIndex`)
  route through a single-text memoizer; a live embed whose content matches a
  cached hash adopts with NO HTTP call; a live embed of NEW/CHANGED content
  embeds through the provider AND writes through immediately (the cache's own
  debounced queue persists it — no explicit flush is needed post-promotion;
  the drain-before-report pin is a boot-time guarantee and the F-W4-6
  quit-tail note still applies); the promote step passes the SAME
  `VectorCache` instance it used for the build (the shared in-memory map makes
  build-time entries live-hittable); the boot build's batch wrapper + census
  are UNCHANGED; `place()`'s content-embed routes through the SAME single-text
  memoizer (supervisor ruling 2026-09-05 on the W5 TestWriter's Q1); the
  shape-validation + poison-entry limitation applies identically to the live
  path; the RCA-3 pass-2 amendment (F1/F2): query-embed misses are adopted
  IN-MEMORY only (session-scoped, NOT persisted — closing the inter-prune
  growth bound and query-hash disk retention), only maintenance (node-content)
  embeds write through (`embed(text, { persist: true })`; the L4
  one-HTTP-call pin holds via in-memory adoption); the RCA-3 pass-2 note (F4,
  doc-only): a poison HIT fails the index-layer F6 check OUTSIDE the embed
  try/catch → the hook REJECTS (caught + logged non-fatal at the four
  reconcile call sites), NOT a W3 transient skip), plus §5.13's W4 body (the
  pinned file format + key tuple + the F1 coalescing amendment
  `CACHE_WRITE_DEBOUNCE_MS = 500` + `flush()` forces-when-dirty + the
  write-through-after-each-SUCCESSFUL-embed rule + the §5.9 #50 non-fatal
  write posture), §5.5 (the `VectorEmbedderOptions` seam + the `score`/
  `place`/`onStoreChanged` routing + the W1 `provider`-instance amendment),
  §5.3 (the index maintenance + the F6-on-a-resolved-vector HARD-rejection
  taxonomy + the UNIT-F-SKIP-EMPTY guard), §5.4 (scoring/omission), §5.7
  (the engine hook forward), §5.12 (the promote step + the re-pinned
  `vector index: node embed failed (transient): <nodeId> <error>` warning),
  §5.8 #24/#40–41, §5.9 #45–50, and the §5.13 cross-referenced
  "RCA-3 F1 amendment" write-timing pins. Format precedent:
  `docs/specs/unit-f-w4-cache-greens.md` (and the W2/W3 greens). NO
  implementation file was read: `src/main/vector-cache.ts`,
  `src/main/vector-boot.ts`, `src/main/embeddings.ts` and `src/main/main.ts`
  were NOT opened, and NO `tests/` file was read (the artifact is derived
  entirely from the spec text + the greens set; the repo's `vitest.config.ts`
  + `package.json` were read only for runner wiring — the W2/W3/W4
  precedent). Supporting shapes (`RagNode` incl. `ownedNodeIds`,
  `RagStore` incl. the documented `enqueue` member, `RetrievalResult.ranked`)
  came from `docs/specs/unit-a-rag-store.md` §5.1/§5.4 and
  `docs/specs/unit-e-rag-index.md` §5.7 — documentation, not code.
- **Source contract:** `docs/specs/unit-f-embeddings.md` §5.13 (the W5
  amendment + the F1 coalescing amendment + the F-W4-7 limitation + the
  `VectorCache` seam) + §5.5 + §5.3 + §5.7 + §5.12 + §5.8 + §5.9, plus the
  supervisor brief's contract letters (a)–(l) — see the coverage matrix.
- **Module under test (the live module seam):** `src/main/vector-boot.ts`
  (`createVectorBootController` — the boot build through the memoizing
  wrapper, the promote step that passes the SAME cache instance into the
  promoted embedder, the reconciled promotion report) and
  `src/main/embeddings.ts` (`createVectorEmbedder` — the §5.5-amendment
  `cache?` seam exercised DIRECTLY in SEAM-EMBEDDER; `createVectorIndex` for
  the prebuilt-index adoption; `createEmbeddingProvider` /
  `createOllamaEmbedProvider` for the fetch-stub + LIVE scenarios;
  `isOllamaAvailable` as the LIVE skip gate), plus
  `src/main/vector-cache.ts` (`createVectorCache({ path })`,
  `CACHE_WRITE_DEBOUNCE_MS`, `flush()`) as the persisted-cache layer. No
  store is constructed: the store + provider are INJECTED per the spec's
  injectability (§5.12 "a NEW pure module … NO Electron; the store + provider
  are injected") — fixture doubles below. The PROMOTED embedder is reached
  ONLY through the documented production seam (`boot.engine.query` /
  `boot.engine.onStoreChanged`) or the documented direct seam
  (`createVectorEmbedder` + `opts.index` + `opts.cache`) — never through any
  implementation-internal handle.
- **Harness:** a THROWAWAY vitest file under `/tmp/w5-greens/` (the repo's
  `tests/` untouched), executed with the repo's own vitest (`npx vitest run
  --root /tmp/w5-greens` run from the repo, so the repo's node_modules supply
  vitest; `/tmp/w5-greens/node_modules` is a symlink to the repo's
  node_modules). The test imports the LIVE modules by absolute path through
  `/tmp/astro` (a symlink to the repo — the repo path contains a SPACE, which
  vite cannot load through a URL-encoded absolute specifier; the W2/W3/W4
  precedent), as NAMESPACE imports (a missing export reports as `undefined`
  rather than failing the whole file — the W2 convention). Cache paths are
  per-scenario `mkdtemp` temp dirs — the real `userData` path is never
  touched. The provider is a DOUBLE for every scenario except the fetch-stub
  pair (DIM-LATCH, where the REAL auto-detect provider construction is used
  with `globalThis.fetch` replaced by a counting stub — no network egress)
  and the one marked **LIVE**, which runs against the real localhost ollama
  `embeddinggemma` (`http://127.0.0.1:11434`) behind a COUNTING PASS-THROUGH
  fetch wrapper (skip-gated; the battery does not depend on it).
- **Derivation order:** every scenario below was authored from the spec
  BEFORE any scenario was executed; the Run record (§I) was filled in after.
- **Runner (as run):** the repo's own vitest — `npx vitest run --root
  /tmp/w5-greens` executed from the repo; `/tmp/w5-greens/node_modules` is a
  symlink to the repo's node_modules; the live modules import through
  `/tmp/astro`.

**Contract-letter coverage matrix (the brief's letters (a)–(l)):**

| Letter (the W5 contract) | Scenarios |
| --- | --- |
| (a) the promoted embedder's score/place query-embeds route through a single-text memoizer | CONTRAST (score, engine path), SEAM-EMBEDDER (score + place, direct seam), DIM-LATCH (score, real provider) |
| (b) its `onStoreChanged` maintenance embeds write through on persist | L-MISS, CONTRAST, SHARED-PENDING |
| (c) a live embed matching a cached hash adopts with NO HTTP | L-HIT-ADD (add route), L-HIT-UPDATE (update route) |
| (d) the promote step passes the SAME cache instance (shared in-memory map) | L-HIT-ADD, L-HIT-UPDATE, SHARED-PENDING (the un-flushed-entry discriminator) |
| (e) absent cache → byte-identical W1–W3 | NO-CACHE |
| (f) a failed embed never writes through | L-FAIL |
| (g) flush-forces + debounce auto-persist | L-MISS (flush forces), L-DEBOUNCE (the debounce persists with NO flush, the exported 500 constant) |
| (h) the F1/F2 ruling: query-embed misses adopted IN-MEMORY only (session-scoped, NOT persisted) | CONTRAST (×2 identical → one HTTP total; the file byte-unchanged; the whole-map write must NOT leak query entries), SEAM-EMBEDDER (in-memory only at the direct seam) |
| (i) the F3 per-embed dimension read (a latching provider becomes hit-eligible) | DIM-LATCH |
| (j) the F6 input-guard message | POISON-HIT (the index-layer F6 dimension message on the live poison path — class-asserted, recorded verbatim; see the §H doc-gap note) |
| (k) the F4 poison-HIT note (hook rejects, caught+logged non-fatal) | POISON-HIT (the hook-reject half) + WIRE-LIVE (the call-site containment half, DEFERRED-STATIC) |
| (l) the write-through-after-each-SUCCESSFUL-embed rule | L-MISS (success → the file), L-FAIL (failure → NEVER the file), SHARED-PENDING (each success → an immediate in-memory entry, debounced persist) |

---

**Fixture helpers (spec-shaped doubles, not implementation-derived):**

- `node(id, content)` = a `RagNode` `{ id, type: 'p', content, ownedNodeIds:
  [], createdAt: T0, updatedAt: T0 }` (ISO-8601 strings; Unit A §5.1 shape —
  the same fixture convention as the W1/W2/W3/W4 greens batteries).
  `updatedAt` is held AT the build read time so the §5.12 reconcile tie rule
  (`updatedAt === embedAt` → UNCHANGED) keeps the controller scenarios
  single-variable; an EDIT scenario bumps `updatedAt` to T1 (the hook path has
  no reconcile, but the bumped timestamp documents the edit).
- `vec(text)` = a deterministic 4-dim vector of positive integers derived from
  the text's char codes (distinct texts → distinct vectors) — the double's
  embed result; 4 matches the double's configured `dimension`. The SAME
  function is used inside fetch stubs and embed doubles so the paths are
  directly comparable (the W2 convention).
- `sha256(text)` = lowercase-hex SHA-256 of the exact text bytes
  (`node:crypto`, the §5.13 documented hash discipline — plain SHA-256 of the
  embedded TEXT, no normalization).
- `key(text)` = the §5.13 cache key for the scenario's provider tuple:
  `{ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash:
  sha256(text) }`.
- **The provider double** is an `EmbeddingProvider`-shaped object
  (`{ kind: 'ollama', model: 'embeddinggemma', baseUrl:
  'http://127.0.0.1:11434', dimension: 4, embed, embedBatch }`) with a
  mutable state: `calls` (an ordered per-item embed call log),
  `batchCalls` (a batch input log), `failAll` (reject every embed with
  `Error('simulated provider outage (transient)')`), and `overrides` (a text
  → vector map for pinning query-time embeds — `embed(t)` returns
  `overrides[t] ?? vec(t)`).
- **The store double** is a `RagStore`-shaped in-memory map (`getNode`
  (shallow copy), `listNodes` (fresh array), `getEdge: () => undefined`,
  `listEdges: () => []`, `putNode`/`removeNode`/`putEdge`/`removeEdge`,
  `status()`, `journal: () => []`, `undo`/`redo: async () => null`,
  `undoDepth`/`redoDepth: () => 0`, and `enqueue: async (fn) => fn()` — the
  Unit A §5.4 member, per the W4 precedent). The reads the spec names are
  `store.listNodes()` (build + reconcile) and `store.getNode(nodeId)` (the
  hook's per-node lookup, §5.5 `onStoreChanged`).
- **The cache seed** writes a hand-authored `{ version: 1, entries: [...] }`
  file (the §5.13 pinned format) at a per-scenario temp path;
  `readCache(path)` reads + parses it back (absent → `undefined`).
- **Write observables** are BEHAVIORAL ONLY (the W4 authoring note: the live
  module's `fs` surface is opaque to property patches under the vitest module
  runner): file existence, parsed entry-hash sets, raw-byte equality,
  `statSync().mtimeMs` stability, and content-polling across the debounce
  window. NO `node:fs` property patching anywhere in this battery.
- **Log capture** spies `console.log`/`warn`/`error`/`info` into one ordered
  string buffer per test (the pinned milestones do not name a stream).
- **Message assertions are byte-exact where the spec pins the string** (the
  pinned log lines + fail-state messages); where the spec pins the CLASS but
  not the string, the assertion is the rejection/class only and the observed
  message is RECORDED in the run record (the W4 precedent's
  message-assertion note).

---

## A. The live write-through paths (letters (b), (g), (h), (l))

### L-MISS. A live maintenance miss embeds + writes through; the entry is served before the write lands; the file reflects it after flush (§5.13 W5: "embeds through the provider AND writes through to the persisted cache"; letters (b) + (g-flush) + (l))
- **Ops:** a COLD cache path; store double with 1 node (`n1`, content
  `alpha content`); the healthy provider double (`calls` recorded, 4-dim
  `vec`); `cache = createVectorCache({ path })`; `boot =
  createVectorBootController(store, provider, { cache })`; `report = await
  boot.start()`; record the embed-call count; THEN `store.putNode(node('n2',
  'brand new content'))` and `await boot.engine.onStoreChanged('structural',
  ['n2'], [])` (the live ADD route over a MISS); record the count again;
  IMMEDIATELY (no flush, no wait) run `overrides['adopt probe'] =
  vec('brand new content')` and `res = await boot.engine.query('adopt
  probe')`; THEN `await cache.flush()`; read the file.
- **Expected:** `start()` RESOLVES with `report.embedded === 1`,
  `report.cacheHits === 0` (a cold-cache build embeds — the W4 H41
  baseline); the call count after `start()` is EXACTLY 1
  (`alpha content`); the live hook made EXACTLY ONE more provider call, with
  `brand new content` (the maintenance embed routed through the provider —
  the single-text memoizer's MISS path, §5.13 W5); the IMMEDIATE query RANKS
  n2 (`res.ranked[0].nodeId === 'n2'`, score > 0.999) — the entry was adopted
  into the in-memory index and SERVED regardless of the disk state (the
  write-through is never awaited by the embed path — "disk never throttles");
  after the flush the file parses with `version: 1` and holds EXACTLY TWO
  entries whose contentHashes are `sha256('alpha content')` (the build
  write-through, drained at promotion) and `sha256('brand new content')` (the
  LIVE write-through) — the new entry carries the §5.13 pinned shape EXACTLY:
  `kind: 'ollama'`, `model: 'embeddinggemma'`, `dimension: 4`,
  `vector` deep-equals `vec('brand new content')`, `savedAt` an epoch-ms
  number. (The debounce-without-flush half of the write-timing pin is
  L-DEBOUNCE's dedicated scenario.)

### L-DEBOUNCE. The live write-through auto-persists on the debounce WITHOUT any flush (§5.13 W5: "the cache's own debounced queue persists it — no explicit flush is needed post-promotion"; letter (g); the F1 coalescing amendment applied to the live path)
- **Ops:** a COLD cache path; store double with 1 node (`n1`, content
  `alpha content`); the healthy provider double; `cache = createVectorCache({
  path })`; `boot = createVectorBootController(store, provider, { cache })`;
  `await boot.start()` (the build's write is drained at promotion — the file
  exists with the `alpha content` entry); THEN `store.putNode(node('n2',
  'debounced content'))` + `await boot.engine.onStoreChanged('structural',
  ['n2'], [])`; start a t0 clock; with NO `flush()` call anywhere, POLL the
  file at ~t0+150ms, ~t0+350ms and ~t0+450ms (inside the window): for each
  poll record whether the file contains `sha256('debounced content')`; then
  await until ~t0+900ms (past the debounce) and read the file; also read the
  module export `CACHE_WRITE_DEBOUNCE_MS`.
- **Expected:** `CACHE_WRITE_DEBOUNCE_MS === 500` (the documented
  module-level export); at EVERY inside-window poll the file does NOT yet
  contain the `debounced content` entry (nothing escapes the coalescing on
  the live path — the live write-through rides the SAME single-writer
  debounced queue as the build's); after the debounce fires — with no flush
  ever called — the file EXISTS and holds BOTH entries (`alpha content` AND
  `debounced content`, the latter with `vector` deep-equals
  `vec('debounced content')`): the live path persisted ITSELF on the
  debounce.

### CONTRAST. The maintenance-vs-query persist contrast — query-embed misses are adopted IN-MEMORY ONLY and NEVER leak into a whole-map write (§5.13 W5 + the RCA-3 pass-2 amendment F1/F2; letters (a) + (h); the "L4 one-HTTP-call pin holds via in-memory adoption" reference)
- **Ops:** a COLD cache path; store double with 1 node (`n1`, content
  `alpha content`); the healthy provider double; `boot` with the cache;
  `await boot.start()`; (1) `await boot.engine.query('a unique query
  phrase')` — a QUERY-embed MISS; record the call count; `await cache.flush()`;
  read the file's entry-hash set AND its raw bytes; (2) `await
  boot.engine.query('a unique query phrase')` AGAIN (the IDENTICAL query);
  record the count again; (3) `store.putNode(node('n2', 'maintained
  content'))` + `await boot.engine.onStoreChanged('structural', ['n2'], [])`
  (a maintenance MISS); `await cache.flush()`; read the file again.
- **Expected:** step (1): the query-embed made EXACTLY ONE provider call
  (with `a unique query phrase`); after the flush the file holds EXACTLY ONE
  entry (`sha256('alpha content')` — the build write-through) and the query
  text's hash `sha256('a unique query phrase')` is ABSENT (a query-embed miss
  is NOT persisted — the F2 ruling); step (2): the identical query made ZERO
  additional provider calls (the in-memory adoption served it — ONE HTTP call
  total across the two identical queries, the L4 pin) — observed AFTER a
  flush, so the adoption demonstrably did not come from the file; step (3):
  the maintenance embed made exactly ONE more provider call (with
  `maintained content`); after the final flush the file holds EXACTLY TWO
  entries (`alpha content` AND `maintained content`) — the maintenance
  write-through LANDED and the query text's hash did NOT leak into the
  whole-map write (the F2 disk-retention close: the coalesced whole-map
  serialization excludes the session's query-embed adoptions).

---

## B. The live hit-adoption routes (letters (c) + (d))

### L-HIT-ADD. The live ADD route adopts a cached hash with ZERO HTTP — the hit came from the build-time (shared-instance) state (§5.13 W5: "a live embed whose content matches a cached hash adopts with NO HTTP call"; letters (c-add) + (d))
- **Ops:** a cache file hand-seeded with ONE well-formed entry (the current
  tuple, `contentHash: sha256('alpha content')`, `vector:
  vec('alpha content')`); store double with 1 node (`n1`, content
  `alpha content`); the healthy provider double (`calls` recorded);
  `boot = createVectorBootController(store, provider, { cache })`; `report =
  await boot.start()` (the build ADOPTS the seeded entry); record the call
  count; THEN `await store.putNode(node('n2', 'alpha content'))` (a NEW node
  whose content hash matches the SAME cached entry) + `await
  boot.engine.onStoreChanged('structural', ['n2'], [])`; record the count
  again; `res = await boot.engine.query('alpha content')` (the query-embed
  ITSELF matches the same cached hash — also a hit); record the count a
  third time; `await cache.flush()`; read the file.
- **Expected:** `report.cacheHits === 1`, `report.embedded === 0`; the
  provider double's call count NEVER MOVES — ZERO calls across the build AND
  the live add AND the query-embed (the live ADD route adopted the cached
  vector with NO HTTP call, §5.13 W5; the hit came from the build-time
  adoption through the SAME cache instance, letter (d)); the query ranks
  BOTH nodes with the SAME cached vector — `res.ranked.length === 2`, BOTH
  scores > 0.999, and the tie is broken by node id ascending
  (`ranked[0].nodeId === 'n1'`, `ranked[1].nodeId === 'n2'`, §5.4
  determinism); after the flush the file holds EXACTLY ONE entry
  (`sha256('alpha content')`) — a HIT performs no write-through and no
  duplicate (the hit-served posture).

### L-HIT-UPDATE. The live UPDATE route adopts a build-written hash with ZERO HTTP; the adopted vector replaces the node's index embedding (§5.13 W5: the maintenance embeds route through the memoizer; letters (c-update) + (d))
- **Ops:** a COLD cache path; store double with 2 nodes (`n1`, content
  `unique content`; `n2`, content `alpha content`); the healthy provider
  double; `boot` with the cache; `report = await boot.start()` (BOTH
  contents are build misses → 2 embeds + 2 write-throughs, drained at
  promotion); record the call count; THEN EDIT n1: `store.putNode(node('n1',
  'alpha content')` with `updatedAt` bumped to T1`)` + `await
  boot.engine.onStoreChanged('content', ['n1'], [])` (the live UPDATE route —
  n1 is in the index → `updateVectorIndex`); record the count; `res = await
  boot.engine.query('alpha content')` (the query-embed ITSELF hits the same
  cached hash — 0 calls); `await cache.flush()`; snapshot the file's
  `mtimeMs` + entry-hash set; `await cache.flush()` AGAIN; snapshot again.
- **Expected:** `report.embedded === 2`, `report.cacheHits === 0`; the edit's
  update-route embed made ZERO provider calls (the live embed of
  `alpha content` matched the build-written hash → adopted with NO HTTP —
  the §5.13 W5 hit clause on the maintenance path); the direct query ranks
  BOTH nodes with score > 0.999, tie-broken by node id ascending
  (`ranked[0].nodeId === 'n1'`, `ranked[1].nodeId === 'n2'`) — n1's index
  vector was REPLACED by the adopted `alpha content` vector (the update
  landed) while making no HTTP call; the file after the flushes holds
  EXACTLY the two build entries (`sha256('unique content')` AND
  `sha256('alpha content')`) with an UNCHANGED `mtimeMs` across the
  redundant flush (a hit-route touch leaves nothing dirty — no
  write-through on a hit).

---

## C. The shared-instance + per-embed-dimension seam (letters (d) + (i))

### SHARED-PENDING. The promote step's SAME cache instance: an UN-FLUSHED live write-through is immediately live-hittable (§5.13 W5: "the promote step passes the SAME VectorCache instance it used for the build (the shared in-memory map makes build-time entries live-hittable)"; letter (d); the write-through-after-each-SUCCESSFUL-embed rule, letter (l))
- **Ops:** a COLD cache path; store double with 1 node (`n1`, content
  `alpha content`); the healthy provider double; `boot` with the cache;
  `await boot.start()` (build embed #1; the promotion drain writes the file);
  IMMEDIATELY `store.putNode(node('n2', 'beta pending content'))` + `await
  boot.engine.onStoreChanged('structural', ['n2'], [])` (a MISS → embed #2 +
  the entry enqueued on the debounce — the file does NOT yet hold it);
  WITHOUT any flush and WITHIN the debounce window, `store.putNode(node('n3',
  'beta pending content'))` + `await boot.engine.onStoreChanged('structural',
  ['n3'], [])` (the SAME content, a new node); record the call count; THEN
  `await cache.flush()`; read the file.
- **Expected:** the provider `calls` are EXACTLY
  `['alpha content', 'beta pending content']` — TWO embeds TOTAL: the live
  ADD of n3 made NO provider call because it HIT the PENDING (not yet
  persisted) entry in the shared in-memory map (letter (d): a re-read from
  the file could not have seen the un-flushed entry, so a fresh/re-read cache
  instance would have produced a THIRD embed — the discriminator); the file
  after the flush holds EXACTLY TWO entries (`sha256('alpha content')` AND
  `sha256('beta pending content')`) — the two same-content nodes share ONE
  hash-keyed entry; the n2 write-through was COALESCED with the n3 hit (no
  per-embed write escaped — the F1 amendment riding the live path).

### DIM-LATCH. The F3 per-embed dimension read: a LATCHING (auto-detect) provider becomes hit-eligible (the brief letter (i); the §5.13 key tuple + the §5.2 auto-detect rule; the real provider + a counting fetch stub — no network egress)
- **Ops:** `provider = createEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })` with NO configured
  `dimension` (auto-detect, §5.2: the dimension comes "from the model's first
  response"); `globalThis.fetch` replaced by a COUNTING stub that answers any
  `{ model, input }` body with `{ embeddings: [vec(input)] }` (a 4-length
  vector); the store double with 1 node (`n1`, content `latch text`); the
  CACHE is created FIRST (`cache = createVectorCache({ path })`), THEN
  `preLatch = provider.dimension` is recorded (BEFORE any embed — the
  un-latched value), THEN `boot = createVectorBootController(store, provider,
  { cache })` (the wrapper exists from controller-creation time with the
  UN-latched provider); `await boot.start()`; `postLatch = provider.dimension`;
  `await cache.flush()`; read the file (the build entries' `dimension`
  fields); reset the fetch count to c0; `await boot.engine.query('a never
  built text')` (a live QUERY miss); record c1; `await
  boot.engine.query('latch text')` (a live query whose text was embedded at
  build time); record c2; `await cache.flush()`; read the file's entry set.
- **Expected:** `postLatch === 4` and `preLatch !== 4` (the provider LATCHED
  during this scenario — the §5.2 auto-detect; `preLatch` is recorded as the
  discriminator: the wrapper's creation-time dimension differed from the
  embed-time one); the file after the build holds EXACTLY ONE entry whose
  `dimension === 4` (the BUILD-side cache key used the LATCHED, per-embed
  dimension — an at-creation latch would have keyed `preLatch`); the live
  query miss made EXACTLY ONE fetch call (c1 = c0 + 1 — the live path is
  live); the live query of `latch text` made ZERO additional fetch calls
  (c2 = c1): the live embed of a build-embedded text ADOPTED the cached
  entry — HIT-ELIGIBLE after the latch (the F3 per-embed dimension read: an
  at-creation dimension latch would have keyed the live get with `preLatch`
  and MISSED, re-embedding); after the final flush the file holds EXACTLY
  ONE entry (the build entry) — neither query text persisted (the F1/F2
  in-memory-only ruling, riding the real-provider path).

---

## D. The no-cache passthrough + the failure rule + the poison-HIT posture (letters (e), (f), (j), (k))

### NO-CACHE. Absent cache → the W1–W3 byte-identity (§5.13 W4: "absent callers → the W1–W3 no-op passthrough" + §5.12 `VectorBootOptions.cache?` "LANDED … absent callers → the W1–W3 no-op passthrough"; letter (e))
- **Ops:** the healthy provider double with `calls` recorded; store double
  with 2 nodes (`n1` `alpha content`, `n2` `beta content`); `boot =
  createVectorBootController(store, provider, {})` — NO `cache` option;
  `report = await boot.start()`; record the count; `await
  boot.engine.query('q text')` (call delta); `await boot.engine.query('q
  text')` AGAIN (the identical query; call delta); `store.putNode(node('n3',
  'gamma content'))` + `await boot.engine.onStoreChanged('structural',
  ['n3'], [])` (a live maintenance add; call delta); `boot.phase()`.
- **Expected:** `report.embedded === 2`, `report.cacheHits === 0` (the W1–W3
  census shape — without a cache the `embedded` census is the indexed-node
  count and `cacheHits` is 0, §5.12's W4 re-pin of the field); the TWO
  identical query-embeds made TWO provider calls (one EACH — NO memoization
  without a cache: the W1–W3 behavior is that every live embed reaches the
  provider); the maintenance add made exactly ONE more provider call; 
  `boot.phase() === 'promoted'`. The provider's observed call sequence is
  EXACTLY the W1–W3 pattern (build N per-node embeds, then one per live
  embed) — the byte-identity is behavioral: nothing about the cache appears
  in the provider traffic, the census, or the phase model.

### L-FAIL. A FAILED live embed NEVER writes through (§5.13 W5 write-through rule + the §5.9 #50 posture at the live layer; letter (f); the W3 transient-skip + retry pins, §5.8 #35/§5.9 #46)
- **Ops:** a COLD cache path; store double with 1 node (`n1`, content
  `alpha content`); the healthy provider double; `boot` with the cache;
  `await boot.start()` (1 embed; the entry written + drained); capture the
  log; set `provider.failAll = true`; EDIT n1: `await
  store.putNode(node('n1', 'failed content')` with `updatedAt` bumped`)` +
  `await boot.engine.onStoreChanged('content', ['n1'], [])` — observe
  resolution/rejection; `await cache.flush()`; ALSO await past the debounce
  window (~950ms) and read the file again (record the entry-hash set both
  times); THEN `provider.failAll = false`; `overrides['failed probe'] =
  vec('failed content')`; `res1 = await boot.engine.query('failed probe')`
  (the omission probe — n1 is unindexed after the transient skip; the
  query-embed itself is a miss → +1 call); record the call count; re-touch
  n1 (`await boot.engine.onStoreChanged('content', ['n1'], [])` — the W3
  retry-on-next-touch pin); record the call count; `await cache.flush()`;
  read the file; `res2 = await boot.engine.query('failed probe')`.
- **Expected:** the failing hook call RESOLVED (a W3 provider-channel embed
  failure on the maintenance path is a transient skip, NOT a rejection —
  §5.9 #46); the captured log contains a line with the re-pinned prefix
  `vector index: node embed failed (transient): ` naming `n1` (§5.12's F4
  re-pin); the file after the flush AND after the debounce window does NOT
  contain `sha256('failed content')` — the failed embed NEVER wrote through
  (the entry set is byte-identical: only `alpha content`); the omission probe
  does NOT rank n1 (`res1.ranked` contains no `n1` — the transient skip
  unindexed the node, §5.4's omission rule) while the query-embed itself
  succeeded (+1 call, in-memory adopted); after recovery the re-touch made
  EXACTLY ONE provider call (with `failed content` — the transient skip was
  retried on the next touch) AND the write-through LANDED (the file now
  holds BOTH `alpha content` AND `failed content`) — the "next successful
  write recovers the file" posture (§5.9 #50) applied to the live path; the
  recovery probe RANKS n1 (`res2.ranked[0].nodeId === 'n1'`, score > 0.999
  against the pinned vector) with ZERO additional provider calls (the
  query-embed was already adopted in-memory).

### POISON-HIT. A poison HIT is SERVED by the cache and REJECTED by the index layer — the hook REJECTS (NOT a transient skip); the F6 input-guard message (§5.13 RCA-3 pass-2 note (F4) + §5.3's "index-level checks on an already-RESOLVED vector … remain HARD rejections" + the F-W4-7 limitation; letters (j) + (k))
- **Ops:** a COLD cache path; store double with 1 node (`n1`, content
  `victim old content`); the healthy provider double; `boot` with the cache;
  `await boot.start()` (n1 embedded + written; the entry drained); capture
  the log; THEN the OUT-OF-CONTRACT construction (the only way F4 says a
  poison HIT is constructible): `cache.set({ kind: 'ollama', model:
  'embeddinggemma', dimension: 4, contentHash: sha256('victim new content')
  }, [1, 2, 3])` — a 3-length vector against the 4-dim tuple; probe
  `cache.get(<that key>)`; EDIT n1: `store.putNode(node('n1', 'victim new
  content')` with `updatedAt` bumped`)` + attempt `await
  boot.engine.onStoreChanged('content', ['n1'], [])` inside a
  caught-rejection probe; record the provider's call count for
  `victim new content`; `await cache.flush()`; read the file.
- **Expected (the pinned F4 posture):** the poison is CONSTRUCTIBLE and
  SERVED: `cache.get(<poison key>)` returns the stored 3-length vector
  (the load-time drop rule is load-only — a direct `set()` admits it; the
  F-W4-7 limitation says a key-matching wrong-vector entry "is served as a
  hit"); the hook call REJECTS with an Error whose message carries the F6
  dimension shape — it names the dimension mismatch with the expected/got
  lengths (asserted at the pinned CLASS level: a message matching
  `dimension mismatch` with expected 4 vs got 3; the verbatim string is
  RECORDED in the run record — the F6 message family is doc-pinned as
  `… dimension mismatch (expected <n>, got <m>)` for the provider channel
  and the index-layer HARD-rejection taxonomy pins the class, not a live-path
  string; see the §H doc-gap note); the hook did NOT resolve-with-a-skip:
  NO `vector index: node embed failed (transient): n1 ` line appeared and the
  outcome is a REJECTION (the F4 note: the F6 check is OUTSIDE the embed
  try/catch — NOT a W3 transient skip); the provider embed was NEVER called
  with `victim new content` (the poison was SERVED — the hit path — and the
  F6 failure happened at the index layer on the ADOPTED vector); the file
  after the flush STILL holds the poisoned entry (the pinned
  hit-served/prune-invalidation posture: hash+tuple invalidation only — no
  vector-correctness self-healing dropped it).
  **FAIL definition (the un-hardened regression this scenario hunts):** the
  poison hit is adopted AND the hook SWALLOWS it — the hook resolves with a
  transient skip (the `… (transient): ` log line appears), or the index ends
  up storing/serving the wrong-length vector. **Alternative hardened posture
  (recorded, not a fail):** if the out-of-contract construction is refused
  (the `set()` validates the vector length, or the `get()` drops the
  wrong-length entry so the hook EMBEDS instead), the F4 "poison HIT" premise
  is unconstructible through the seam — the observed posture is recorded for
  the item-10d doc reviewer and the scenario passes on the
  no-silent-poisoning contract (the index must never serve the wrong-length
  vector either way).

---

## E. The direct embedder seam (letters (a) + (h) + the §5.5 amendment)

### SEAM-EMBEDDER. `createVectorEmbedder`'s own `cache?` seam — score AND place route through the SAME single-text memoizer; query-path misses are in-memory only (§5.13 W5: "`createVectorEmbedder` gains an optional `cache?: VectorCache` (§5.5 amendment)" + "place()'s content-embed routes through the SAME single-text memoizer" (the supervisor ruling on the W5 TestWriter's Q1))
- **Ops:** a COLD cache path; store double with 2 nodes (`n1` `seed text`,
  `n2` `other text`); the healthy provider double; `index = await
  createVectorIndex([node('n1','seed text'), node('n2','other text')], (t) =>
  provider.embed(t))` (the RAW provider embed — the index is plain data; the
  W1 `opts.index` adoption shape); `embedder = await createVectorEmbedder(
  store, { provider, index, cache })` (the §5.5-amendment seam: a provider
  INSTANCE + the cache); `s1 = await embedder.score('probe query', [n1,
  n2])`; record the calls; `s2 = await embedder.score('probe query', [n1,
  n2])` (the IDENTICAL query); record; `p = await embedder.place('seed
  text', [n1, n2], [])`; record; `s3 = await embedder.score('seed text',
  [n1, n2])`; record; `await cache.flush()`; read the file.
- **Expected:** after the index build the calls are EXACTLY
  `['seed text', 'other text']` (the RAW provider embed — the index is plain
  data; no wrapper, no cache write); after `s1` the calls are EXACTLY
  `['seed text', 'other text', 'probe query']` (a query-path miss → the
  provider); after `s2` UNCHANGED (the identical score ADOPTED in-memory —
  one HTTP total, the L4 pin at the direct seam); `s1` and `s2` deep-equal
  (determinism, §5.8 #12); `place('seed text')` made EXACTLY ONE new provider
  call — with `seed text` (the content-embed went through the memoizer as a
  MISS) — and returned the placement decision `{ ok: true, targetNodeId:
  'n1', edgeKind: 'next-section', score > 0.999 }` (n1's index vector is
  `vec('seed text')` — cosine 1; a `p` node → `next-section`, §5.5); after
  `s3` the calls are EXACTLY `['seed text', 'other text', 'probe query',
  'seed text']` — the score of the SAME text place just embedded made ZERO
  additional provider calls: the place content-embed and the score
  query-embed share the ONE single-text memoizer (§5.13 W5's Q1 ruling);
  after the flush the file holds ZERO entries (or does not exist at all —
  nothing was ever `set()`): EVERY embed in this scenario went down the
  QUERY path — score and place content-embeds — so NOTHING was persisted:
  the F1/F2 in-memory-only ruling at the direct seam.

---

## F. LIVE end-to-end (the test environment — skip-gated; the battery does not depend on it)

### LIVE-1. The real ollama live path — the query memoization (the L4 pin LIVE) + the maintenance write-through (§5.13 W5, letters (a)/(b)/(h); §5.12's production wiring shape)
- **LIVE** (skip-gated on `isOllamaAvailable()`; the battery does not depend
  on it).
- **Ops:** `globalThis.fetch` wrapped with a COUNTING PASS-THROUGH (counts +
  delegates to the real fetch); the §5.12 production order: `provider =
  await warmUpEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })` (the warm-up's ONE
  real embed latches the model's dimension before the controller exists);
  a COLD cache path; store double with 1 node (`n1`, content `provident w5
  live note`); `boot = createVectorBootController(store, provider, {
  embedBatchFn: provider.embedBatch, cache: createVectorCache({ path }) })`
  (the §5.12 W4/W5 production shape); c0 = the fetch count; `report = await
  boot.start()`; c1 = count; `await boot.engine.query('provident w5 live
  query')` (a live query-embed MISS — a text embedded nowhere); c2 = count;
  `await boot.engine.query('provident w5 live query')` AGAIN (the identical
  query); c3 = count; `await boot.engine.query('provident w5 live note')`
  (the node's OWN content — its hash is cached by the build); c4 = count;
  EDIT n1 (`store.putNode` with content `provident w5 live note — EDITED`,
  `updatedAt` bumped) + `await boot.engine.onStoreChanged('content',
  ['n1'], [])`; c5 = count; `await cache.flush()`; read the file.
- **Expected:** `report.embedded === 1`, `report.cacheHits === 0`; c1 = c0 +
  ≥ 1 (the real build embed — the batch request shape counts as its calls);
  c2 = c1 + 1 (the query-embed MISS made EXACTLY ONE real HTTP call); c3 =
  c2 (the IDENTICAL query made ZERO additional HTTP calls — the L4 one-HTTP
  pin LIVE: in-memory adoption); c4 = c3 (the live embed of the node's OWN
  content ADOPTED the cached hash with ZERO HTTP calls — the §5.13 W5 hit
  clause on the real model); c5 = c4 + 1 (the maintenance embed made
  EXACTLY ONE real HTTP call); after the flush the file holds EXACTLY TWO
  entries — `sha256('provident w5 live note')` AND
  `sha256('provident w5 live note — EDITED')` — each with
  `kind: 'ollama'`, `model: 'embeddinggemma'`, `dimension ===
  provider.dimension` (the model's), and epoch-ms `savedAt`; the query-path
  adoptions did NOT persist (neither `provident w5 live query` hash is in
  the file — in-memory only).

---

## G. DEFERRED-STATIC (main-process-only; out of blind scope)

### WIRE-LIVE. The F4 containment half — the four reconcile call sites catch the hook rejection + log non-fatal (§5.13 RCA-3 pass-2 note (F4): "caught + logged non-fatal at the four reconcile call sites: the two `IPC_EDIT_*` handlers + the rich-commit handler's reconcile wrapper in `src/main/main.ts`, and the MCP edit-tool wiring in `src/main/mcp-server.ts`")
- **Contract (from the spec):** the poison-HIT hook rejection (POISON-HIT)
  must be CAUGHT + LOGGED non-fatal at the four reconcile call sites in
  `main.ts`/`mcp-server.ts` — an edit that reconciles through a rejecting
  hook must not reject the IPC/MCP operation.
- **Verification scope:** the claim's sites are `src/main/main.ts` and
  `src/main/mcp-server.ts` — both on this battery's do-NOT-open list. Per
  the W2/W3/W4 precedent (A-F-W2-3, WIRE-MAIN, WIRE-CACHE) this scenario is
  **DEFERRED-STATIC**: enumerated from the spec, NOT executed, NOT counted as
  a pass; left for the item-10d documentation reviewer.
- **CLOSED 2026-09-05 (the item-10d doc review, RCA-6):** the deferred claim
  was verified read-only against the live wiring — all FOUR reconcile call
  sites `.catch` the hook rejection + log non-fatal:
  `src/main/main.ts:246-248` (the `IPC_EDIT_COMMIT` handler),
  `src/main/main.ts:283-285` (the `IPC_EDIT_BATCH` handler),
  `src/main/main.ts:307` → `src/main/edit-ops.ts:740-741` (the rich-commit
  handler's reconcile wrapper — ADR-11/state 27: a rejecting `reconcile` is
  NON-FATAL, caught + logged `[provident-main] retrieval index reconcile
  failed:`, the broadcast still fires), and
  `src/main/mcp-server.ts:1131-1133` (the MCP edit-tool wiring,
  `[provident-mcp] retrieval index reconcile failed:`). The promote-step
  same-instance half was byte-checked at `src/main/vector-boot.ts:302`
  (`createVectorEmbedder(store, { provider, index, cache })` — the
  controller's `opts.cache`, the SAME instance the build wrapper used; the
  production cache construction is `createVectorCache()` at
  `src/main/main.ts:168`). The scenario closes **PASS-BY-VERIFICATION**: the
  battery is 13/13 (12 blind PASS + WIRE-LIVE verified).

---

## H. NOT-DERIVABLE — brief letters with NO documentation anchor (a doc gap, recorded)

The task brief's letters (i) and (j) cite "the F3 per-embed dimension read"
and "the F6 input guard message" as W5-pass contract items. A
grep-verified sweep of the ENTIRE `docs/` tree found: §5.13's W5 amendment
registers ONLY the RCA-3 pass-2 amendment "(F1/F2 …)" and the pass-2 note
"(F4, doc-only)" — there are NO W5-pass F3/F5/F6 registrations anywhere in
`docs/` (no `§3a` W5 subsection exists; the W1/W2/W3/W4 §3a subsections are
present but no W5 one). **Letter (i)** is nevertheless SCENARIO-ED
(DIM-LATCH) because the brief states its content ("per-embed dimension read;
a latching provider becomes hit-eligible") and the behavior is
doc-consistent with the §5.13 key tuple + the §5.2 auto-detect rule — the
scenario is anchored on the brief letter + the documented key contract, and
its result either confirms or refutes the brief's claim. **Letter (j)** is
NOT scenario-ed as an independent assertion: no documentation pins an
"input guard" MESSAGE for the live path (the brief gives the label, not the
string), and every documented public path guards its inputs upstream
(§5.9 #27/#28 the embedder-level guards; §5.9 #45 the empty/non-string
guard) — a blind scenario cannot pin an undocumented string. POISON-HIT
therefore asserts the F6 message at the pinned CLASS level
(`dimension mismatch` with expected/got) and RECORDS the verbatim live
message as a runtime observation; the doc reviewer should register the W5
F3/F6 findings in §3a/§5.13 (the W4 precedent: the registrations were simply
not written yet). **RESOLVED 2026-09-05 (the item-10d doc review):** the W5
F3/F6 registrations are WRITTEN — §3a of `docs/specs/unit-f-embeddings.md`
gains the W5 subsection (F-W5-1 MEDIUM the persisted query misses; F-W5-2
LOW the per-embed dimension read [= letter (i)'s F3]; F-W5-3 LOW the pinned
input guard `cache memoizer: text must be a string` [= letter (j)'s F6,
asserted verbatim by R5]; F-W5-4..F-W5-6 INFO) and §5.13's W5 amendment
carries the implementation pins. The letter-(j) F6 message remains pinned at
the FAMILY level (`… dimension mismatch (expected <n>, got <m>)`, §5.9
#10/#41) with the verbatim live-path observation
`updateVectorIndex: dimension mismatch (expected 4, got 3)` recorded in the
POISON-HIT row + §3a F-W5-4 — the same reading the scenario used.

---

## I. Run record

| # | Scenario | Result |
| --- | --- | --- |
| L-MISS | Live maintenance miss → embed + write-through; served before the write; pinned format after flush | ✅ PASS |
| L-DEBOUNCE | The live write-through auto-persists on the 500 ms debounce, NO flush | ✅ PASS |
| CONTRAST | Query misses in-memory only; maintenance embeds persist; NO whole-map leak | ✅ PASS |
| L-HIT-ADD | The live ADD route adopts with ZERO HTTP (shared-instance hit) | ✅ PASS |
| L-HIT-UPDATE | The live UPDATE route adopts with ZERO HTTP; no dirty state | ✅ PASS |
| SHARED-PENDING | The SAME instance: an un-flushed live entry is immediately live-hittable | ✅ PASS |
| DIM-LATCH | The per-embed dimension read: a latching provider becomes hit-eligible | ✅ PASS |
| NO-CACHE | Absent cache → the W1–W3 passthrough (no memoization, census unchanged) | ✅ PASS |
| L-FAIL | A failed live embed NEVER writes through; transient skip + retry-on-touch recovery | ✅ PASS |
| POISON-HIT | The poison HIT is served → the hook REJECTS with the F6 dimension message (not a skip) | ✅ PASS |
| SEAM-EMBEDDER | The direct `createVectorEmbedder` seam: score/place share ONE memoizer; in-memory only | ✅ PASS |
| LIVE-1 | Real ollama: one query HTTP for two identical queries; the maintenance write-through | ✅ PASS (LIVE) |
| WIRE-LIVE | The four reconcile call sites catch + log non-fatal | ⏸ DEFERRED-STATIC → ✅ CLOSED (verified by the item-10d doc review 2026-09-05 — the four call sites byte-checked, PASS-BY-VERIFICATION; see §G) |

**Run summary:** 12 executable scenarios ran (1 of them LIVE against the real
localhost ollama `embeddinggemma`, which was UP — skip-gated, NOT skipped) —
**12 pass, 0 fail** in the W5 unit scope, confirmed by TWO CONSECUTIVE green
runs of the battery (12/12 both times; LIVE-1 ran both times). WIRE-LIVE is
**DEFERRED-STATIC** (main-process-only). Zero un-hardened-regression
findings; one DOC GAP registered (§H) plus two runtime observations recorded
verbatim for the item-10d doc reviewer (the §H/§I notes). [2026-09-05 doc
review (RCA-6): WIRE-LIVE CLOSED — the deferred claim verified TRUE read-only
at the four reconcile call sites (see §G); the §H DOC GAP and the §5.5 DOC
DRIFT finding are RESOLVED by the same review (the §3a W5 subsection written,
the §5.13 W5 implementation pins + the §5.5 `cache?` field landed); the
battery is 13/13 with that verification.] The battery's first
RECORDED run was preceded by four harness-fix cycles (see the authoring
notes) whose failing assertions were RUNNER WIRING + scenario-OPS mechanics,
not contract claims — the contract claims themselves never changed and all
hold against the live modules.

### Findings

- **Zero contract failures / zero un-hardened-regression findings in the W5
  unit scope.** Every contract letter held against the live modules:
  - **(a) single-text memoizer** — the promoted embedder's query-embeds are
    memoized at BOTH seams (CONTRAST, the engine path; SEAM-EMBEDDER, the
    direct `createVectorEmbedder` seam), and `place()`'s content-embed shares
    the SAME memoizer (SEAM-EMBEDDER: a `place('seed text')` followed by a
    `score('seed text')` made ZERO additional provider calls; the Q1 ruling
    verified).
  - **(b) maintenance write-through** — a live maintenance MISS embeds
    through the provider and lands in the persisted file (L-MISS: the pinned
    §5.13 entry shape — kind/model/dimension/hash/vector/`savedAt` epoch ms —
    with the entry SERVED by the engine before the write landed).
  - **(c) live hit adoption, NO HTTP** — BOTH routes: the live ADD route
    (L-HIT-ADD: zero provider calls across build + live add + query) and the
    live UPDATE route (L-HIT-UPDATE: zero calls; the file's `mtimeMs`
    unchanged across a redundant flush — a hit leaves nothing dirty); LIVE-1
    added the real-model version (a live embed of the node's own content made
    ZERO HTTP calls on the real 768-dim path).
  - **(d) the SAME cache instance** — SHARED-PENDING: an UN-FLUSHED live
    write-through (in-memory only, inside the debounce window) was
    immediately live-hittable by a second same-content node (a re-read-from-
    disk promote step could not have served it); L-HIT-ADD/L-HIT-UPDATE
    pinned the same sharing for build-adopted and build-written entries.
  - **(e) absent cache → byte-identical W1–W3** — NO-CACHE: `embedded` is the
    indexed-node count, `cacheHits === 0`, the two identical query-embeds
    made TWO provider calls (no memoization without a cache), the maintenance
    add made exactly one, and the run's stderr carried NO `vector cache:` log
    line at all.
  - **(f) failed embed never writes through** — L-FAIL: the failing hook
    RESOLVED (the W3 transient skip), the pinned
    `vector index: node embed failed (transient): n1 <error>` line appeared,
    the file's entry set was byte-identical after BOTH the flush AND the full
    debounce window, the node was omitted from the scored set, and the
    next-touch retry re-embedded + wrote through (the §5.9 #50 recovery).
  - **(g) flush-forces + debounce auto-persist** — L-MISS (the flush forces
    the dirty write) and L-DEBOUNCE (NOTHING written inside the 500 ms
    window at any of the 150/350/450 ms polls; BOTH entries present at
    ~900 ms with no flush ever called; the exported
    `CACHE_WRITE_DEBOUNCE_MS === 500` re-pinned).
  - **(h) query misses in-memory only** — CONTRAST: two identical queries
    made ONE HTTP call total; the file's entry set + raw bytes excluded the
    query hash after a flush; after the maintenance write-through the
    whole-map write STILL excluded the query hash (no disk leak of
    session-scoped adoptions); SEAM-EMBEDDER pinned the same at the direct
    seam (ZERO file entries after a query-only session).
  - **(i) per-embed dimension read** — DIM-LATCH: the REAL auto-detect
    provider reported dimension **0 at controller-creation time and 4 after
    the build** (recorded); the build's entry was keyed `dimension: 4` and
    the live query of the build-embedded text ADOPTED with a zero fetch
    delta — hit-eligible after the latch (a creation-time dimension latch
    would have keyed the live get with 0 and MISSED).
  - **(j) the F6 input-guard message (recorded, class-asserted)** —
    POISON-HIT: the hook REJECTED with the verbatim live message
    **`updateVectorIndex: dimension mismatch (expected 4, got 3)`** (an
    `Error`, the route being the update path since n1 was in the index) —
    see the DOC GAP below; the message FAMILY is doc-pinned
    (`… dimension mismatch (expected <n>, got <m>)`, §5.9 #10/#41) and the
    index-layer HARD-rejection class is §5.3's taxonomy; the exact live-path
    prefix is recorded here for the doc reviewer to pin.
  - **(k) the poison-HIT posture** — POISON-HIT verified the F4 note
    END-TO-END: the out-of-contract `cache.set(…, [1,2,3])` was CONSTRUCTIBLE
    (`get` served the 3-length vector — the load-time drop rule is load-only,
    the F-W4-7 limitation riding the live path), the hook REJECTED (NOT a W3
    transient skip — no `(transient): ` log line; the provider was NEVER
    called for the poisoned text), and the poisoned entry SURVIVED the flush
    (the pinned hit-served/prune-invalidation posture). The containment half
    (the four reconcile call sites) stays DEFERRED-STATIC (WIRE-LIVE).
  - **(l) write-through after each SUCCESSFUL embed** — L-MISS (a success →
    the file), L-FAIL (a failure → NEVER the file), SHARED-PENDING (each
    success → an immediate in-memory entry on the debounced queue).
- **DOC GAP (the task brief vs the documentation — for the supervisor / the
  item-10d doc reviewer).** The brief's letters (i) and (j) cite "the F3
  per-embed dimension read" and "the F6 input guard message" as W5-pass
  items. A grep-verified sweep of the ENTIRE `docs/` tree found that §5.13's
  W5 amendment registers ONLY the pass-2 amendment "(F1/F2 …)" and the pass-2
  note "(F4, doc-only)" — there are NO W5-pass F3/F5/F6 registrations
  anywhere (§3a has MEDIUM/LOW + W1/W2/W3/W4 subsections but NO W5 one).
  Letter (i) was scenario-ed anyway (DIM-LATCH) because the brief states its
  content and the behavior is doc-consistent with the §5.13 key tuple + the
  §5.2 auto-detect rule — the live modules CONFIRMED the brief's claim.
  Letter (j) is NOT asserted as a doc-pinned string (no documentation pins
  it): POISON-HIT asserts the F6 class and records the verbatim live message
  (`updateVectorIndex: dimension mismatch (expected 4, got 3)`) — the doc
  reviewer should register the W5 F3/F6 findings in §3a/§5.13 and pin the
  message (the W4 precedent: the registrations were simply not written yet).
- **DOC DRIFT (the §5.5 code block vs the §5.13 W5 amendment).** §5.13's W5
  amendment says "`createVectorEmbedder` gains an optional `cache?:
  VectorCache` (§5.5 amendment)", but §5.5's `VectorEmbedderOptions` code
  block (provider/placementMinScore/index) does NOT list `cache?`. The SEAM
  EXISTS at runtime (SEAM-EMBEDDER passed with `{ provider, index, cache }`
  — and its memoization is real), so this is a stale code block, not a
  missing feature: the item-10d doc reviewer should add `cache?: VectorCache`
  to the §5.5 block. **RESOLVED 2026-09-05 (the item-10d doc review):**
  `cache?: VectorCache` is ADDED to the §5.5 `VectorEmbedderOptions` block
  (with the doc-comment + the §5.5 W5 amendment note describing the
  memoizer routing), the §5.10 census re-pinned (fields 2 → 4), and the W5
  row added to the §5.12 unit-mapping table.
- **Runtime observations recorded (NOT contract assertions where the docs
  pin only a class):** the F6 live-path message above; DIM-LATCH's
  `preLatch: 0` / `postLatch: 4`; the L-FAIL transient line verbatim
  (`vector index: node embed failed (transient): n1 simulated provider
  outage (transient)` — the double's error text interpolated per the pinned
  shape); the LIVE provider's latched dimension **768** (`embeddinggemma`).

### Test-authoring notes

- **Derivation order held.** All 13 scenario rows (12 executable + 1
  deferred-static) were authored and committed BEFORE the first execution;
  the §I table, run summary and findings were the only post-recording edits
  (plus the pre-recording Ops refinements below, which preceded the first
  RECORDED result).
- **Four harness-fix cycles preceded the first RECORDED run** (the W3/W4
  precedent's discipline: fix runner wiring before recording; no contract
  claim changed):
  1. The LIVE skip gate used a top-level `await` inside the `describe` body —
     the vitest transform rejected it ("await can only be used inside an
     async function"); restructured to an in-test `ctx.skip()` gate.
  2. The store double's READS were async, so the controller's synchronous
     `store.listNodes()` handed a Promise to `createLexicalIndex`
     ("nodes is not iterable" — 11 failures on one wiring cause); the
     double's reads were made SYNC (the module-store idiom — Unit A §5.4;
     writes stay async). This also matches the W1/W4 doubles.
  3. Three expected entry-hash arrays (L-HIT-UPDATE, SHARED-PENDING,
     L-FAIL's recovered set) were written in authoring order while the
     received `hashSet` is SORTED — the expected sides sorted. A pure
     assertion-ordering bug; the entry SETS were correct in all three.
  4. LIVE-1's Ops anchored the query text ON the node's content — so the
     first query-embed was itself a HIT (zero HTTP) and the "one query HTTP"
     expectation mis-predicted (observed c2 = c1, not c1 + 1). The Ops were
     re-anchored BEFORE recording: a distinct query-phrase MISS (one HTTP;
     the identical second query adopts — the L4 pin) PLUS an added
     node-content-query HIT assertion (zero HTTP — letter (c) on the real
     model). The live behavior observed in the mis-anchored run was itself
     the correct W5 contract behavior; the scenario design, not the module,
     was wrong.
- **The `fs`-opacity caveat carries over from the W4 battery:** all
  write-timing observables in this battery are behavioral (existence polling,
  parsed entry sets, raw-byte `includes` checks, `mtimeMs` stability) — no
  `node:fs` property patching anywhere.
- **LIVE scenario.** Ollama was UP with `embeddinggemma` (the
  `isOllamaAvailable` gate passed; LIVE-1 RAN, not skipped, in BOTH recorded
  runs; provider dimension 768). The L4 one-HTTP pin held on the real model:
  the query MISS made exactly one HTTP call, the identical query zero, the
  node-content query zero (the live hit), the maintenance embed exactly one.
- **Message assertions.** Byte-exact where the spec pins the string (the
  `vector index: node embed failed (transient): ` prefix + the
  `CACHE_WRITE_DEBOUNCE_MS === 500` export); class-level where the docs pin
  the class only (the F6 dimension message — recorded verbatim in the
  findings), per the W4 message-assertion note.
- **Runner (verbatim):** `npx vitest run --root /tmp/w5-greens` from the
  repo; `/tmp/w5-greens/node_modules` → the repo's node_modules; the live
  modules import through `/tmp/astro` (a repo symlink) as namespace imports;
  per-scenario `mkdtemp` cache paths under the OS temp dir; the observed
  runtime messages side-file is `/tmp/w5-greens/observed.json` (a /tmp
  artifact, not a repo file).