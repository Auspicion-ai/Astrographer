# Unit W4 — Persisted Embedding Cache: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). Derived from the
  DOCUMENTATION ONLY — `docs/specs/unit-f-embeddings.md` §5.13 (the FULL cache
  contract: the `provident-vector-cache.json` file + the pinned
  `{version: 1, entries: [...]}` format; the VECTOR-CACHE-CONTENT-HASH-KEY key
  tuple (provider kind, model, dimension, contentHash = lowercase-hex SHA-256
  of the EXACT embedded text) + the two invalidation axes; the SYNCHRONOUS
  load at `createVectorCache` call time with the malformed-entry drops and the
  §5.9 #49 fail-states INCL. the ratified absent-file-LOGGED behavior (W4
  implementation pin (b)); the MEMOIZING WRAPPER around the embed fns (a HIT
  adopts with NO HTTP call, a MISS embeds + writes through; the batch wrapper
  adopts hits IN PLACE and batch-embeds only the misses with positional
  alignment; the W2 per-chunk fallback routes through the SAME wrapper); the
  F1 write-timing amendment (`set()` COALESCES on the module-level
  `CACHE_WRITE_DEBOUNCE_MS = 500` debounce, the pending write executes with
  the map state AT EXECUTION TIME, `flush()` cancels the timer + forces the
  write when dirty, atomic temp+rename, single-writer, never awaited by the
  embed loop, DRAINED before the promotion report); the non-fatal write
  failure + whole-map recovery; the promotion prune (foreign tuples +
  dead hashes dropped, the file rewritten ONCE, the census log emitted by
  `VectorCache.prune` per pin (c)); the `cacheHits` census), §5.8 #40–42,
  §5.9 #49–51, §5.12 (`VectorBootOptions.cache?`; the `cacheHits` field of
  `PromotionReport`; the load-ownership wiring `createVectorBootController(
  ragStore, provider, { cache: createVectorCache() })`; the pinned
  `vector boot: build complete (embedded N, cacheHits M, …)` milestone), and
  the two tracker corollaries in `docs/next-steps.md`'s Unit W4 DONE row (the
  `cacheHits` census DEDUPED by contentHash so a fallback re-lookup counts
  once; the `embedded` census = provider embeds = cache misses when a cache is
  present; drain → prune → drain; atomic `<path>.tmp`+rename writes).
  Format precedent: `docs/specs/unit-f-w3-failure-policy-greens.md`. NO
  implementation file was read: `src/main/vector-cache.ts`,
  `src/main/vector-boot.ts`, `src/main/embeddings.ts` and `src/main/main.ts`
  were NOT opened; the scenarios below are derived entirely from the spec text
  + the greens set (the repo's `vitest.config.ts` + `package.json` were read
  only for runner wiring — the W2/W3 precedent). Supporting shapes (`RagNode`,
  `RagStore` incl. the documented `enqueue` member) came from
  `docs/specs/unit-a-rag-store.md` §5.1/§5.4 — documentation, not code.
- **Source contract:** `docs/specs/unit-f-embeddings.md` §5.13 + §5.8 #40–42 +
  §5.9 #49–51 + §5.12 + §5.10's Cache census row, with the W4 implementation
  pins (a)/(b)/(c) and the F1 amendment inside §5.13.
- **Module under test (the live module seam):** `src/main/vector-cache.ts`
  (`createVectorCache(opts?: { path? })` — the `VectorCache`
  `{ get, set, prune, flush }` seam and the `CACHE_WRITE_DEBOUNCE_MS` export),
  `src/main/vector-boot.ts` (`createVectorBootController` — the
  `VectorBootOptions.cache?` seam, the memoizing wrapper wiring, the
  `cacheHits` census, the drain → prune → drain promotion sequence), and
  `src/main/embeddings.ts` (`createEmbeddingProvider` for the fetch-stub +
  LIVE scenarios; `isOllamaAvailable` as the LIVE skip gate). No store is
  constructed: the store + provider are INJECTED per the spec's injectability
  (§5.12 "a NEW pure module … NO Electron; the store + provider are injected")
  — fixture doubles below.
- **Harness:** a THROWAWAY vitest file under `/tmp/w4-greens/` (the repo's
  `tests/` untouched), executed with the repo's own vitest
  (`npx vitest run --root /tmp/w4-greens` run from the repo, so the repo's
  node_modules supply vitest; `/tmp/w4-greens/node_modules` is a symlink to
  the repo's node_modules). The test imports the LIVE modules by absolute path
  through `/tmp/astro` (a symlink to the repo — the repo path contains a
  SPACE, which vite cannot load through a URL-encoded absolute specifier; the
  W3 precedent). Cache paths are per-scenario `mkdtemp` temp dirs — the real
  `userData` path is never touched. The provider is a DOUBLE for every
  scenario except the fetch-stub pair (H40 + its control, where the REAL
  provider construction is used with `globalThis.fetch` replaced by a counting
  stub — no network egress) and the one marked **LIVE**, which runs against
  the real localhost ollama `embeddinggemma` (`http://127.0.0.1:11434`,
  reported up at run time) behind a COUNTING PASS-THROUGH fetch wrapper.
- **Derivation order:** every scenario below was authored from the spec
  BEFORE any scenario was executed; the Run record (§H) was filled in after.
- **Runner (as run):** the repo's own vitest — `npx vitest run --root
  /tmp/w4-greens` executed from the repo; `/tmp/w4-greens/node_modules` is a
  symlink to the repo's node_modules; the live modules import through
  `/tmp/astro`.

**Fixture helpers (spec-shaped doubles, not implementation-derived):**

- `node(id, content)` = a `RagNode` `{ id, type: 'p', content, ownedNodeIds:
  [], createdAt: T0, updatedAt: T0 }` (ISO-8601 strings; Unit A §5.1 shape —
  the same fixture convention as the W1/W2/W3 greens batteries). `updatedAt`
  is held AT the build read time so the §5.12 reconcile tie rule
  (`updatedAt === embedAt` → UNCHANGED) keeps the controller scenarios
  single-variable.
- `vec(text)` = a deterministic 4-dim vector of positive integers derived from
  the text's char codes (distinct texts → distinct vectors) — the double's
  embed result; 4 matches the double's configured `dimension`.
- `sha256(text)` = lowercase-hex SHA-256 of the exact text bytes
  (`node:crypto`, the §5.13 documented hash discipline — plain SHA-256 of the
  embedded TEXT, no normalization).
- **The provider double** is an `EmbeddingProvider`-shaped object
  (`{ kind: 'ollama', model: 'embeddinggemma', baseUrl:
  'http://127.0.0.1:11434', dimension: 4, embed, embedBatch }`) with a
  mutable state: `calls` (per-item embed call log), `batchCalls` (batch input
  log), `failAll` (reject every embed with `Error('simulated provider outage
  (transient)')`), `batchReject` (reject every batch with the W2-pinned
  alignment-mismatch shape), and `overrides` (a text → vector map for pinning
  query-time embeds).
- **The store double** is a `RagStore`-shaped in-memory map (`getNode`,
  `listNodes`, `getEdge: () => undefined`, `listEdges: () => []`,
  `putNode`/`removeNode`, and `enqueue: async (fn) => fn()` — the Unit A §5.4
  member the build's snapshot settles through, per the W4 tracker note) — the
  reads the spec names are `store.listNodes()` (build) and the live node list
  (reconcile).
- **The cache seed** writes a hand-authored `{ version: 1, entries: [...] }`
  file (the §5.13 pinned format) at a per-scenario temp path; `readCache(path)`
  reads + parses it back.
- **The write observables** (see the authoring notes): the live module's `fs`
  surface is OPAQUE to property patches under the vitest module runner (a
  probe proved the module reads/writes files while NONE of the patched
  `fs.rename*`/`fs.*writeFile` primitives fire), so write COUNTS are pinned
  BEHAVIORALLY instead: content-polling across the debounce window (no write
  before the timer), the trailing-write state (the map state at execution
  time), `statSync().mtimeMs` stability across a redundant flush (no further
  write when not dirty), and a tmp-path DISCRIMINATOR (blocking
  `<path>.tmp` with a directory must fail the write non-fatally and name the
  temp path in the pinned log — which both proves the documented temp name
  and exercises the non-fatal failure path).
- **Log capture** spies `console.log`/`warn`/`error`/`info` into one ordered
  string buffer per test (the pinned milestones do not name a stream; §5.13
  pins the log STRINGS).
- **Message assertions are byte-exact where the spec pins the string** (the
  three §5.13 pinned log lines, matched by prefix + the documented literal);
  where the spec pins the class but not the string, the assertion is the
  rejection/class only — noted per scenario.

---

## A. §5.8 Happy-path states (the W4 set, #40–42)

### H40. Cache hit adoption with NO HTTP — the boot path over the REAL provider (§5.8 #40; §5.13 Adoption)
- **Ops:** a temp dir; a cache file hand-seeded with ONE well-formed entry
  `{ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash:
  sha256('cached node content'), vector: [1, 2, 3, 4], savedAt: 1 }`. The REAL
  ollama provider is constructed via `createEmbeddingProvider({ provider:
  'ollama', baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma',
  dimension: 4 })` (the CONFIGURED-dimension shape, §5.8 #4) with
  `globalThis.fetch` replaced by a COUNTING stub that would serve
  `{ embeddings: [[1, 2, 3, 4]] }` (HTTP 200) for any request. Store double
  with 1 node whose content is `cached node content`;
  `boot = createVectorBootController(store, provider, { cache:
  createVectorCache({ path }) })`; snapshot the stub count; `report = await
  boot.start()`; snapshot again; THEN `res = await boot.engine.query('cache
  probe query')` (the stub still installed — it serves the same canned vector
  for the query embed).
- **Expected:** `start()` RESOLVES; the stub count after `start()` is EXACTLY
  0 — NO HTTP call was made for the hit (§5.8 #40 "adopts the cached vector
  with NO HTTP call"); `report.cacheHits === 1` and `report.embedded === 0`;
  `boot.phase() === 'promoted'`; the promoted engine SERVES the cached vector:
  `res.ranked[0].nodeId === 'n1'` with `score > 0.999` (the index holds the
  canned vector — cosine 1 against itself). CONTROL (harness validity, same
  scenario): a second boot over a FRESH cache path with the same stub MUST
  make ≥ 1 stub call and resolve with `embedded: 1` — proving the stub serves
  a parseable response (i.e. the zero-count above is the cache, not a broken
  stub).

### H41. Cache miss embed + write-through persistence — the entry hits the file in the pinned format (§5.8 #41; §5.13 Format)
- **Ops:** a temp dir; a COLD cache path (no file); store double with 1 node
  (`n1`, content `miss node content`); the provider double (healthy, 4-dim
  `vec`); `boot = createVectorBootController(store, provider, { cache:
  createVectorCache({ path }) })`; `report = await boot.start()`; `await
  cache.flush()`; read the file from disk.
- **Expected:** the build EMBEDDED (the provider double's `calls` contains
  exactly `miss node content` — a miss embeds through the provider, §5.8 #41);
  `report.embedded === 1`, `report.cacheHits === 0`; the file EXISTS, parses,
  and matches the §5.13 pinned format EXACTLY: a root `{ version: 1, entries:
  [...] }` with EXACTLY ONE entry whose `kind === 'ollama'`, `model ===
  'embeddinggemma'`, `dimension === 4`, `contentHash ===
  sha256('miss node content')` (lowercase hex — the documented hash
  discipline), `vector` deep-equals `vec('miss node content')`, and `savedAt`
  is a number (epoch ms). The entry was persisted WITHOUT any explicit
  post-report flush being required (the drain pin — DRAIN-1 pins the timing).

### H42. Cache prune at promotion — foreign tuples + dead hashes dropped, the pinned census log, rewritten ONCE (§5.8 #42; §5.13 pins (a)+(c))
- **Ops:** a temp dir; a cache file hand-seeded with FOUR well-formed entries:
  `e1` (the CURRENT tuple, `contentHash: sha256('alpha content')`, a 4-vector),
  `e2` (the CURRENT tuple, `contentHash: sha256('beta content')`, a 4-vector),
  `e3` (a FOREIGN tuple — `kind: 'openai'`, `model: 'other-model'`), `e4`
  (the CURRENT tuple but a DEAD hash — `contentHash: sha256('deleted long
  ago')`). Store double with 2 nodes whose contents are `alpha content` and
  `beta content` (BOTH are cache hits — no miss writes can interleave); the
  provider double healthy with its embed call-counted;
  `boot = createVectorBootController(store, provider, { cache:
  createVectorCache({ path }) })`; `report = await boot.start()`; read the
  captured log; read the file; snapshot the file's `mtimeMs`; `await
  cache.flush()` again; snapshot the mtime again.
- **Expected:** `start()` RESOLVES; the provider's embed was NEVER called
  (both live nodes were hits): `report.cacheHits === 2`, `report.embedded ===
  0`; the captured log contains a line of the PINNED shape `vector cache:
  pruned to 2 entries` (§5.13's pinned prune census — the post-compaction
  count, emitted by `VectorCache.prune` per pin (c)); the file now holds
  EXACTLY the two current-tuple live entries (matched by contentHash
  `sha256('alpha content')` + `sha256('beta content')` — the foreign tuple
  AND the dead hash are GONE, §5.8 #42); the redundant post-prune flush
  leaves the file UNTOUCHED (`mtimeMs` unchanged — the prune's one-shot
  rewrite was the only write, and nothing was left dirty).

---

## B. §5.9 Fail-states (the W4 set, #49–51)

### LOAD-OK. Control — a well-formed cache file loads SILENTLY and round-trips (§5.13 Load; the B49 control)
- **Ops:** a temp dir; a cache file hand-seeded with ONE well-formed entry
  (current tuple, `contentHash: sha256('loaded text')`, `vec('loaded text')`);
  capture the log; `cache = createVectorCache({ path })`; `cache.get({ kind:
  'ollama', model: 'embeddinggemma', dimension: 4, contentHash:
  sha256('loaded text') })`; then `cache.set({…contentHash: sha256('new
  text')}, vec('new text'))`; `await cache.flush()`; read the file.
- **Expected:** creation does NOT throw and emits NO `vector cache: load
  failed (treating as empty)` line (a well-formed load is silent — the B49
  fail-states are the ones that log); the HIT returns a deep-equal
  `vec('loaded text')`; after the flush the file holds BOTH entries (the
  loaded entry survived the whole-map write — the load populated the map the
  write serializes).

### B49a. Absent cache file → EMPTY + the PINNED log — NOT silent (§5.9 #49; §5.13 pin (b))
- **Ops:** a temp dir; a path that does not exist; capture the log;
  `cache = createVectorCache({ path })`; probe `cache.get(<any key>)`.
- **Expected:** creation does NOT throw; `get` returns `undefined` (an EMPTY
  cache — a full re-embed); the captured log contains a line with the PINNED
  prefix `vector cache: load failed (treating as empty): ` followed by the
  underlying error (pin (b): the ABSENT-file case is logged with the SAME
  line as the unreadable/corrupt/wrong-version cases — the ratified
  not-silent behavior); the load never threw either way.

### B49b. Corrupt JSON → EMPTY + the pinned log (§5.9 #49)
- **Ops:** a file whose body is `not json{`; capture; `createVectorCache({
  path })`; `get(<any key>)`.
- **Expected:** no throw; `get` → `undefined`; the pinned `vector cache: load
  failed (treating as empty): ` line is present.

### B49c. Non-object root → EMPTY + the pinned log (§5.9 #49)
- **Ops:** two files, one whose body is `[]` and one whose body is `42`;
  for each: capture; `createVectorCache({ path })`; `get(<any key>)`.
- **Expected:** for BOTH, no throw; `get` → `undefined`; the pinned
  `vector cache: load failed (treating as empty): ` line is present.

### B49d. Wrong version → EMPTY + the pinned log (§5.9 #49)
- **Ops:** a file `{ version: 2, entries: [ <one well-formed entry> ] }`;
  capture; `createVectorCache({ path })`; `get(<the entry's exact key>)`.
- **Expected:** no throw; the get MISSES (`undefined`) even though the entry
  itself is well-formed — a wrong version treats the WHOLE cache as EMPTY (a
  full re-embed); the pinned load-failed line is present.

### B49e. Absent version field → EMPTY + the pinned log (§5.9 #49 "a wrong/absent `version`")
- **Ops:** a file `{ entries: [ <one well-formed entry> ] }` (no `version`
  key); capture; `createVectorCache({ path })`; `get(<the entry's exact
  key>)`.
- **Expected:** no throw; the get MISSES; the pinned load-failed line is
  present.

### B49f. Directory-at-path (the unreadable-file class) → EMPTY + the pinned log (§5.9 #49 "an absent/unreadable file")
- **Ops:** a path that EXISTS but is a DIRECTORY (reading it as a file fails);
  capture; `createVectorCache({ path })`; `get(<any key>)`.
- **Expected:** no throw; `get` → `undefined`; the pinned
  `vector cache: load failed (treating as empty): ` line is present. (This is
  the documented unreadable-file class — the file exists but cannot be read;
  the spec does not distinguish a permissions failure from any other read
  failure.)

### B50. Cache write failure is NON-FATAL + the next successful write recovers the file (§5.9 #50)
- **Ops:** a temp dir `d`; `path = join(d, 'cache.json')`;
  `cache = createVectorCache({ path })` (an absent-file load — irrelevant
  here); capture the log; DELETE `d` (the write's temp+rename now fails —
  ENOENT); `cache.set(key1, vec('one'))` (must not throw); `await
  cache.flush()`; probe `cache.get(key1)`; probe the file's existence; THEN
  recreate `d`; `cache.set(key2, vec('two'))`; `await cache.flush()`; read
  the file.
- **Expected:** the FIRST `flush()` RESOLVES (a failed persist never escapes
  as a rejection — §5.9 #50 non-fatal; a rejecting flush would contradict the
  drain-before-report pin); the captured log contains a line with the PINNED
  prefix `vector cache: write failed (non-fatal): ` + the underlying error;
  the file was NOT created by the failed write; the IN-MEMORY state still
  serves (`get(key1)` deep-equals `vec('one')` — "the in-memory index and the
  promotion continue"); after recovery, the file EXISTS and holds BOTH
  entries (key1 AND key2 — the next successful write serializes the WHOLE map
  and recovers the file, §5.9 #50).

### B51. Malformed cache entries are DROPPED (treated as a miss), never thrown (§5.9 #51)
- **Ops:** a cache file with version 1 and SEVEN entries: `e_ok` (well-formed,
  current tuple, `sha256('good text')` / `vec('good text')`); `e_nan` (its
  vector contains `NaN`); `e_inf` (its vector contains `Infinity`); `e_str`
  (its vector contains a string element); `e_len` (a 3-length vector with
  `dimension: 4`); `e_nofield` (no `contentHash` field); `e_wrongtype`
  (`dimension: '4'` — wrong-typed); `e_notarray` (`vector` is an object, not
  an array). `cache = createVectorCache({ path })`; probe `get` for each
  entry's key. THEN clause (b), the boot-level consequence: a SECOND cache
  file where node `n1`'s entry is malformed (a 3-length vector against
  `dimension: 4`) and node `n2`'s is well-formed; store double with `n1`
  (`content one`) + `n2` (`content two`); healthy provider double;
  `boot = createVectorBootController(store, provider, { cache:
  createVectorCache({ path }) })`; `report = await boot.start()`.
- **Expected:** clause (a): creation does NOT throw; `get(e_ok's key)`
  deep-equals `vec('good text')` (a valid entry survives alongside the bad
  ones); EVERY malformed key (`e_nan`, `e_inf`, `e_str`, `e_len`,
  `e_nofield`, `e_wrongtype`, `e_notarray`) returns `undefined` (DROPPED —
  treated as a miss); NO `vector cache: load failed (treating as empty)` line
  appeared (the file itself is valid — per-entry drops are not a load
  failure; the cache must NOT be treated as empty, which `e_ok`'s adoption
  proves). Clause (b): `start()` RESOLVES with `report.cacheHits === 1` (only
  n2 adopted) and `report.embedded === 1` (n1 was re-embedded — the malformed
  entry behaved as a MISS, never a throw).

---

## C. The memoizing wrapper at the controller seam (§5.13 Adoption; the key-tuple axes)

### WRAP-HIT. A full-hit build succeeds with the provider COMPLETELY DOWN — the vector came from the cache (§5.8 #40; §5.13 "a key HIT adopts the cached vector")
- **Ops:** a cache file hand-seeded with ONE well-formed entry (current
  tuple, `contentHash: sha256('sole content')`, `vec('sole content')`); store
  double with 1 node (`content: 'sole content'`); the provider double with
  `failAll = true` (ANY embed attempt rejects); `boot =
  createVectorBootController(store, provider, { cache: createVectorCache({
  path }) })`; `report = await boot.start()`.
- **Expected:** `start()` RESOLVES and PROMOTES (`boot.phase() ===
  'promoted'`) even though the provider is down for the whole build — the
  node's vector came from the cache; the embed double was NEVER called
  (0 calls); `report.cacheHits === 1`, `report.embedded === 0`;
  `report.skipped` deep-equals `{ empty: 0, transient: 0 }` (no transient
  skip — no embed was ATTEMPTED, which distinguishes adoption from a
  failed-embed skip).

### WRAP-BATCH. The batch wrapper — hits adopted IN PLACE, only the misses batched, positional alignment preserved (§5.13 Adoption)
- **Ops:** a cache file hand-seeded with hits for contents `content one` and
  `content three` (current tuple + `vec` of each); store double with 3 nodes
  (`content one`, `content two`, `content three`); the provider double
  healthy with `calls`/`batchCalls` recorded; `boot =
  createVectorBootController(store, provider, { cache: createVectorCache({
  path }), embedBatchFn: provider.embedBatch })`; `report = await
  boot.start()`; then pin the double's query-time embed
  (`overrides['alignment probe'] = vec('content two')`) and `res = await
  boot.engine.query('alignment probe')`.
- **Expected:** the batch fn was called EXACTLY ONCE with input EXACTLY
  `['content two']` in node order — the two hits were adopted IN PLACE and
  only the miss was batched; the per-item `embed` was called 0 times by the
  build; `report.cacheHits === 2`, `report.embedded === 1`; the assembled
  index is positionally CORRECT: `res.ranked.length === 3` (all three nodes
  served — the assembled array length equaled the texts' 3) and
  `res.ranked[0].nodeId === 'n2'` with `score > 0.999` — n2's index vector is
  `vec('content two')`, which is only true if the batch result landed on the
  miss's position while the hits kept theirs.

### WRAP-FALLBACK. The W2 per-item fallback routes through the SAME wrapper — a fallback-embedded text is a cache write-through (§5.13 Batch-fallback routing pin)
- **Ops:** a COLD cache path; store double with 2 nodes; the provider double
  healthy on per-item embeds but `batchReject = true` (every batch rejects
  with the alignment-mismatch shape); `boot = createVectorBootController(
  store, provider, { cache: createVectorCache({ path }), embedBatchFn:
  provider.embedBatch })`; `report = await boot.start()`; `await
  cache.flush()`; read the file.
- **Expected:** `start()` RESOLVES (the W2 per-chunk fallback isolates the
  rejected chunk); the batch fn was called (and rejected); the per-item
  `embed` was called for BOTH texts (the fallback ran — and it ran through
  the WRAPPER, not the raw provider); `report.embedded === 2`,
  `report.cacheHits === 0`; the file holds EXACTLY TWO entries whose
  contentHashes are `sha256` of the two node contents — the fallback-embedded
  texts were WRITTEN THROUGH like any other embed (§5.13 "a fallback-embedded
  text is a cache write-through like any other embed").

### DEDUPE. The `cacheHits` census is DEDUPED by contentHash — one cached entry adopted by two identical-content nodes counts once (the tracker corollary; §5.12 `cacheHits`)
- **Ops:** a cache file hand-seeded with ONE well-formed entry (current
  tuple, `contentHash: sha256('same text')`, `vec('same text')`); store
  double with TWO nodes whose contents are IDENTICAL (`same text` / `same
  text`); the provider double healthy with `calls` recorded; `boot =
  createVectorBootController(store, provider, { cache: createVectorCache({
  path }) })`; `report = await boot.start()`; then `overrides['dedupe probe']
  = vec('same text')`; `res = await boot.engine.query('dedupe probe')`.
- **Expected:** the embed double was NEVER called (both nodes adopt the same
  cached entry); `report.cacheHits === 1` — the census is DEDUPED by
  contentHash (the tracker's Unit W4 DONE row: "the `cacheHits` census deduped
  by contentHash so a fallback re-lookup counts once"), NOT 2;
  `report.embedded === 0`; the dedupe is census-only, not index-level:
  `res.ranked.length === 2` (BOTH nodes are served from the single cached
  entry, tie-broken by node id ascending — `ranked[0].nodeId === 'n1'`, §5.8
  #13).

### KEY-KIND. Invalidation axis 1 — a provider-kind mismatch is a MISS that re-embeds and overwrites (§5.13 Key + Invalidation)
- **Ops:** a cache file hand-seeded with ONE well-formed entry keyed
  `{ kind: 'openai', model: 'embeddinggemma', dimension: 4, contentHash:
  sha256('axis content') }` with a 4-vector; store double with 1 node
  (`content: 'axis content'`); the provider double healthy (kind
  `'ollama'`); `boot` with the cache; `report = await boot.start()`; `await
  cache.flush()`; read the file.
- **Expected:** the kind mismatch is a MISS: the provider's embed WAS called
  exactly once with `axis content`; `report.cacheHits === 0`,
  `report.embedded === 1`; after the flush the file holds EXACTLY ONE entry
  keyed with the CURRENT tuple (`kind: 'ollama'`) — the new entry's
  write-through plus the promotion prune left no foreign-tuple entry behind.

### KEY-MODEL. Invalidation axis 2 — a model mismatch is a MISS (§5.13 Key)
- **Ops:** as KEY-KIND but the seeded entry is `{ kind: 'ollama', model:
  'other-model', dimension: 4, … }`.
- **Expected:** the model mismatch is a MISS (embed called exactly once with
  the node content; `cacheHits === 0`, `embedded === 1`); the file after the
  flush holds exactly one entry keyed `model: 'embeddinggemma'`.

### KEY-DIM. Invalidation axis 3 — a dimension mismatch is a MISS (§5.13 Key)
- **Ops:** as KEY-KIND but the seeded entry is `{ kind: 'ollama', model:
  'embeddinggemma', dimension: 5, … }` with a 5-length vector (well-formed
  for ITS OWN key — so the load does not drop it; the drop rule compares a
  vector to its OWN entry's dimension).
- **Expected:** the dimension mismatch is a MISS (embed called exactly once;
  `cacheHits === 0`, `embedded === 1`); the file after the flush holds
  exactly one entry keyed `dimension: 4`.

### KEY-HASH. Invalidation axis 4 — a content-hash mismatch (edited content) is a MISS (§5.13 Key + Invalidation "a hash mismatch (content changed)")
- **Ops:** as KEY-KIND but the seeded entry is the CURRENT tuple with
  `contentHash: sha256('stale pre-edit text')` and a 4-vector; the node's
  content is `axis content`.
- **Expected:** the hash mismatch is a MISS (embed called exactly once with
  `axis content`; `cacheHits === 0`, `embedded === 1`); the file after the
  flush holds exactly one entry whose contentHash is `sha256('axis content')`
  and whose vector is `vec('axis content')` — the stale hash is gone (dropped
  by the prune: it matches no current store node's embedded text).

---

## D. Write timing — the F1 coalescing amendment (§5.13 "RCA-3 F1 amendment")

### COAL-1. N sets + flush → one whole-map write; a redundant flush writes nothing (§5.13 F1: "schedules AT MOST ONE trailing whole-map write"; "flush() … forces the write when dirty")
- **Ops:** a fresh temp path; `cache = createVectorCache({ path })`;
  `set(k1, v1)`; `set(k2, v2)`; `set(k3, v3)` (three sets, no awaits
  between); `await cache.flush()`; read the file; snapshot its `mtimeMs`;
  `await cache.flush()` AGAIN; snapshot the mtime again.
- **Expected:** the file holds ALL THREE entries (the write executed with the
  map state at execution time — "later sets need no new job"); the second
  flush performs NO write (the `mtimeMs` is unchanged — the write is forced
  only WHEN DIRTY; the coalescing itself — nothing written before the timer —
  is COAL-2's window poll).

### COAL-2. The debounce fires by itself — nothing written during the window, one trailing write carrying the LATER state, on the exported 500 ms constant (§5.13 F1: `CACHE_WRITE_DEBOUNCE_MS = 500`)
- **Ops:** a fresh temp path; `cache = createVectorCache({ path })`;
  `set(k1)`; await ~60 ms (inside the window); `set(k2)`; NO flush; POLL the
  file's existence every ~25 ms until ~460 ms after the first set (inside the
  500 ms window); then await past the debounce (~810 ms total); read the
  file; also read the module export `CACHE_WRITE_DEBOUNCE_MS`.
- **Expected:** `CACHE_WRITE_DEBOUNCE_MS === 500` (the documented module-level
  export); during EVERY poll inside the window the file does NOT exist (no
  per-set write escaped the coalescing); after the debounce fires — with no
  flush ever called — the file EXISTS and holds BOTH entries (ONE trailing
  write carried the map state AT EXECUTION TIME, including the set that
  landed after the first).

### DRAIN-1. The write queue is DRAINED before the promotion report resolves (§5.13 "The queue is DRAINED before the promotion report resolves")
- **Ops:** a COLD cache path; store double with 2 nodes; the provider double
  healthy; `boot` with the cache; `report = await boot.start()`; IMMEDIATELY
  (no flush, no waits) read the file; snapshot the rename log; `await
  cache.flush()`; snapshot again.
- **Expected:** right after `start()` resolves, the file ALREADY exists and
  holds BOTH entries keyed by the documented hashes (the drain happened
  inside the boot — with a 500 ms debounce and no drain, a fast double-driven
  build could not have written yet); the post-report `flush()` performs NO
  further write (the file's `mtimeMs` is unchanged — nothing was left
  dirty).

### TMP-1. The atomic write goes through `<path>.tmp` (the documented temp name) — observed by blocking it (§5.13 "atomic temp+rename write"; the tracker's "atomic `<path>.tmp`+rename writes")
- **Ops:** a fresh temp path; pre-create a DIRECTORY at `<path>.tmp` (blocking
  the documented temp name); `cache = createVectorCache({ path })`;
  `set(k1, v1)`; `await cache.flush()`; read the captured log; probe the
  target file; THEN remove the blocking directory; `set(k2, v2)`; `await
  cache.flush()`; read the file.
- **Expected:** the blocked write FAILED NON-FATAL: the captured log contains
  a line with the PINNED prefix `vector cache: write failed (non-fatal): `
  whose error NAMES the temp path `<path>.tmp` (the module attempted its temp
  write at EXACTLY the documented path — the discriminator's evidence for the
  temp+rename shape); the target file was NOT created by the blocked write;
  after unblocking, the next write lands the WHOLE map (the file holds both
  k1 and k2 — the failed entry was still dirty and recovered, consistent with
  §5.9 #50).

---

## E. §5.12 observables — the census over boots + the load ownership

### LATER-BOOTS. The first boot embeds the corpus; later boots embed only misses — the census story (§5.13 Census; §5.12 `cacheHits`)
- **Ops:** a COLD cache path; store double with 2 nodes; the provider double
  healthy with `calls` recorded; boot #1 with a cache instance A → `report1`;
  note the embed-call count. Boot #2 with a FRESH cache instance B (same
  path, same store, same provider double) → `report2`; note the embed-call
  count again.
- **Expected:** boot #1: `report1.embedded === 2`, `report1.cacheHits === 0`
  (the first boot embeds the full corpus — both embeds happened); boot #2:
  the embed-call count DID NOT MOVE (zero provider calls),
  `report2.cacheHits === 2`, `report2.embedded === 0` (later boots embed only
  new/changed nodes — here, none); both files' states agree (the file still
  holds both entries).

### OWN-1. Load ownership — the FILE is read at `createVectorCache()` CALL time, before the build (§5.13 Load ownership)
- **Ops:** a temp path that does not exist; capture the log; `cache =
  createVectorCache({ path })` (the read happens HERE); assert the factory's
  return shape; THEN hand-write a well-formed cache file at the SAME path
  (an entry for the store's node content); store double with 1 node; `boot`
  with the ALREADY-CREATED cache instance; `report = await boot.start()`.
- **Expected:** `createVectorCache` returned SYNCHRONOUSLY (not a Promise —
  the documented sync signature), and the pinned load-failed line was ALREADY
  captured at creation time (BEFORE any build ran); the later-written file is
  INVISIBLE to that instance: `report.cacheHits === 0`, `report.embedded ===
  1` (the node was re-embedded — the cache was loaded empty at creation, per
  "the cache is fully loaded before the background build starts" — load at
  creation, not lazily at build).

### WIRE-CACHE. The production call site — `createVectorBootController(ragStore, provider, { embedBatchFn: provider.embedBatch, cache })` with `cache: createVectorCache()` in `main()` (§5.12 main() wiring step 3, the W4 final shape)
- **Contract (from the spec):** main constructs the cache AT
  controller-creation time with NO opts (the default
  `join(app.getPath('userData'), 'provident-vector-cache.json')` resolves
  through the running Electron app) and passes it as `opts.cache`.
- **Verification scope:** the claim's site is `src/main/main.ts` — on this
  battery's do-NOT-open list. Per the W2/W3 precedent (A-F-W2-3, WIRE-MAIN)
  this scenario is **DEFERRED-STATIC**: enumerated from the spec, NOT
  executed, NOT counted as a pass; left for the item-10d documentation
  reviewer. (The controller-seam half of the claim IS executed — every boot
  scenario above passes `opts.cache`.)
- **CLOSED 2026-09-05 (item-10d doc review):** the deferred claim was
  verified against the live `src/main/main.ts` — the production call is
  `const boot = createVectorBootController(ragStore, provider, {
  embedBatchFn: provider.embedBatch, cache: createVectorCache() })` at
  `main.ts:168` with `import { createVectorCache } from './vector-cache.js'`
  at `main.ts:20` — `createVectorCache()` takes NO opts, so the default
  `join(app.getPath('userData'), 'provident-vector-cache.json')` resolves
  through the running Electron app exactly as the spec pins. **VERIFIED.**

---

## F. NOT-DERIVABLE — brief items with NO documentation anchor (a doc gap, recorded; no scenario)

The task brief for this battery additionally cites "the lstat guards + 0o600
tmp + the sanitized load log (the F3/F4 amendments)" and "§3a's W4 subsection
(the F-W4 registrations incl. F1/F3/F4)". A documentation sweep of the ENTIRE
`docs/` tree + `archive/` (grep for `F-W4`, `lstat`, `0o600`, `sanitiz`)
found NONE of these: §3a of `docs/specs/unit-f-embeddings.md` has MEDIUM/LOW,
W1, W2 and W3 subsections but NO W4 subsection; no `F-W4` finding ids exist
anywhere in the documentation; no `lstat` guard, no `0o600` tmp-file mode,
and no "sanitized load log" are pinned in any doc (the ONLY documented W4
adversarial registration is the F1 coalescing amendment inside §5.13, and the
ONLY documented load log is the pinned `vector cache: load failed (treating
as empty): <error>` line). A blind scenario cannot assert undocumented
behavior — doing so would be deriving from the implementation by other
means. These brief items are therefore recorded as a DOC GAP for the
supervisor / item-10d documentation reviewer (either the brief runs ahead of
the docs, or the W4 adversarial registrations were never written into §3a/§5.13),
and NO scenario here asserts them. The documented temp+rename shape IS pinned
(TMP-1); a tmp-file MODE and symlink/FIFO guards are NOT pinned by any
documentation and are not tested.

---

## G. LIVE end-to-end (the test environment — skip-gated; the battery does not depend on it)

### LIVE-1. A real ollama build with a pre-seeded cache — the hit node makes NO HTTP call (§5.8 #40 LIVE; §5.13 Census LIVE)
- **LIVE** (skip-gated on `isOllamaAvailable()`; the battery does not depend
  on it).
- **Ops:** the REAL provider via the §5.12 production order:
  `provider = await warmUpEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })` (the warm-up's ONE
  real embed latches the model's dimension before the controller exists —
  the documented production sequence). `globalThis.fetch` is wrapped with a
  COUNTING PASS-THROUGH (counts + delegates to the real fetch). Store double
  with 2 real-content nodes (`provident alpha cache note`, `provident beta
  cache note`); a COLD cache path; boot #1 = `createVectorBootController(
  store, provider, { embedBatchFn: provider.embedBatch, cache:
  createVectorCache({ path }) })` (the §5.12 W4 production shape); snapshot
  the fetch count; `report1 = await boot1.start()`; snapshot again; read the
  file. Boot #2 = a FRESH cache instance (same path) + the SAME (dimension-
  latched) provider behind a RESET counter; `report2 = await boot2.start()`;
  snapshot again. THEN bump node n2's content (`provident beta cache note —
  EDITED`, `updatedAt` bumped) and run boot #3 (fresh cache instance, counter
  reset) → `report3`.
- **Expected:** boot #1 RESOLVES with `report1.embedded === 2`,
  `report1.cacheHits === 0`, `report1.skipped` deep-equals `{ empty: 0,
  transient: 0 }`; the fetch count moved by ≥ 1 during boot #1 (the real
  embeds); the file exists immediately after `start()` (the LIVE drain pin)
  with TWO entries whose contentHashes are the sha-256 of the two contents
  and whose dimension is the model's. Boot #2 RESOLVES with
  `report2.cacheHits === 2`, `report2.embedded === 0` and the fetch count
  UNCHANGED (delta 0 — the hit nodes made NO HTTP call; the cache short-
  circuited the provider entirely); `boot2.phase() === 'promoted'`. Boot #3
  RESOLVES with `report3.cacheHits === 1`, `report3.embedded === 1` and a
  fetch delta of exactly 1 — only the EDITED node re-embedded (§5.13 Census
  "later boots embed only new/changed nodes (cache misses)").

---

## H. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H40 | Hit adoption, NO HTTP (boot path, real provider + fetch stub) | ✅ PASS |
| H41 | Miss embed + write-through persistence (pinned format) | ✅ PASS |
| H42 | Prune — foreign tuples + dead hashes + pinned log + rewritten once | ✅ PASS |
| LOAD-OK | Control — a well-formed load is silent and round-trips | ✅ PASS |
| B49a | Absent file → EMPTY + the pinned log (not silent) | ✅ PASS |
| B49b | Corrupt JSON → EMPTY + the pinned log | ✅ PASS |
| B49c | Non-object root → EMPTY + the pinned log | ✅ PASS |
| B49d | Wrong version → EMPTY + the pinned log | ✅ PASS |
| B49e | Absent version → EMPTY + the pinned log | ✅ PASS |
| B49f | Directory-at-path (unreadable) → EMPTY + the pinned log | ✅ PASS |
| B50 | Write failure non-fatal + whole-map recovery | ✅ PASS |
| B51 | Malformed-entry drops (cache layer + boot-level) | ✅ PASS |
| WRAP-HIT | Full-hit build with the provider DOWN — adoption proven | ✅ PASS |
| WRAP-BATCH | Hits in place / only misses batched / alignment | ✅ PASS |
| WRAP-FALLBACK | The per-item fallback writes through the wrapper | ✅ PASS |
| DEDUPE | The cacheHits census deduped by contentHash | ✅ PASS |
| KEY-KIND | Kind-mismatch invalidation → miss + overwrite | ✅ PASS |
| KEY-MODEL | Model-mismatch invalidation → miss + overwrite | ✅ PASS |
| KEY-DIM | Dimension-mismatch invalidation → miss + overwrite | ✅ PASS |
| KEY-HASH | Content-hash-mismatch invalidation → miss + overwrite | ✅ PASS |
| COAL-1 | N sets + flush → the whole map; a redundant flush writes nothing | ✅ PASS |
| COAL-2 | Nothing written during the 500 ms window; the trailing write carries the later state | ✅ PASS |
| DRAIN-1 | The queue is drained before the promotion report | ✅ PASS |
| TMP-1 | The atomic write goes through `<path>.tmp` (blocked-write discriminator + recovery) | ✅ PASS |
| LATER-BOOTS | First boot embeds; later boots embed only misses | ✅ PASS |
| OWN-1 | The file is read at createVectorCache() call time | ✅ PASS |
| WIRE-CACHE | The main.ts production call site | ⏸ DEFERRED-STATIC (main-process-only; out of blind scope — see the scenario) → **CLOSED 2026-09-05 (doc review): verified TRUE at `main.ts:168`** |
| LIVE-1 | Real ollama build + pre-seeded cache: hits make no HTTP call | ✅ PASS (LIVE) |

**Run summary:** 27 executable scenarios ran (1 of them LIVE against the real
localhost ollama `embeddinggemma`; skip-gated, ollama UP, not skipped) —
**27 pass, 0 fail** in the W4 unit scope; WIRE-CACHE is **DEFERRED-STATIC**;
zero un-hardened-regression findings. The battery's first recorded run was
preceded by two harness-fix cycles (see the authoring notes) whose failing
assertions were OBSERVABILITY mechanics (a dead fs-rename spy; a broken
rejection sentinel), not contract claims — the contract claims themselves
never changed and all hold against the live modules. **Post-review status
(item-10d doc review, 2026-09-05): 28/28 — WIRE-CACHE's deferred-static
claim verified TRUE at `src/main/main.ts:168` (`cache: createVectorCache()`
at controller creation; see the scenario's CLOSED note), and the §F DOC GAP
was CLOSED by the same review: the §3a W4 subsection (F-W4-1..F-W4-8) is
WRITTEN and §5.13 carries the adversarial hardening pins (the lstat
regular-file guards, the 0o600 tmp mode, the sanitized load log) + the
F-W4-7 limitation sentence — the runtime-observed
`cache path is not a regular file` guard below is the registered F-W4-3
behavior.**

### Findings

- **Zero contract failures / zero un-hardened-regression findings in the W4
  unit scope.** Every documented pin held against the live modules: the
  §5.13 format (a byte-level round-trip: `version: 1`, the entry shape, the
  lowercase-hex sha-256 contentHash, the `savedAt` epoch number — H41,
  LOAD-OK); the load fail-states incl. the ratified ABSENT-file-LOGGED
  behavior (B49a–B49f all emit the pinned
  `vector cache: load failed (treating as empty): <error>` line, and the
  well-formed control is silent); the malformed-entry drops with valid
  entries surviving alongside (B51, cache layer + boot level); the key-tuple
  invalidation on ALL FOUR axes with the miss re-embedding and the promotion
  prune leaving exactly the current tuple (KEY-KIND/MODEL/DIM/HASH); hit
  adoption with NO HTTP at BOTH the fetch level (H40, real provider behind a
  counting stub: ZERO fetch calls for the build, the cached vector served
  with cosine 1) and the provider level (WRAP-HIT: a full-hit build promotes
  with the provider completely DOWN, no transient skip); the miss +
  write-through persistence (H41); the memoizing batch wrapper (hits adopted
  IN PLACE, only the miss batched, positional alignment proven by the served
  vectors — WRAP-BATCH) and the fallback routing through the SAME wrapper
  (WRAP-FALLBACK); the cacheHits census deduped by contentHash (DEDUPE —
  `cacheHits === 1` for two identical-content nodes, both still served); the
  F1 coalescing (the exported `CACHE_WRITE_DEBOUNCE_MS === 500`; NOTHING
  written during the debounce window; ONE trailing write carrying the later
  state — COAL-1/COAL-2); the drain-before-report pin (DRAIN-1: the file
  already reflects every set() the instant the promotion report resolves,
  and a redundant flush rewrites nothing); the non-fatal write failure +
  whole-map recovery (B50, TMP-1); the promotion prune with the pinned
  census log and a one-shot rewrite (H42); the census story over boots
  (LATER-BOOTS + LIVE-1: boot #1 embedded 2 / cacheHits 0; boot #2 cacheHits
  2 / embedded 0 with the fetch count UNCHANGED; boot #3 after an edit:
  cacheHits 1 / embedded 1 with exactly ONE HTTP embed); the load ownership
  (OWN-1: the sync factory reads the file at CALL time — the pinned
  load-failed log is captured before any build, and a file written after
  creation is invisible to that instance).
- **DOC GAP (the task brief vs the documentation — for the supervisor / the
  item-10d doc reviewer).** The battery's task brief cites "the lstat guards
  + 0o600 tmp + the sanitized load log (the F3/F4 amendments)" and "§3a's W4
  subsection (the F-W4 registrations incl. F1/F3/F4)". A grep-verified sweep
  of the ENTIRE `docs/` tree + `archive/` found NONE of these: §3a of
  `docs/specs/unit-f-embeddings.md` has MEDIUM/LOW, W1, W2 and W3 subsections
  but NO W4 subsection; no `F-W4` finding ids exist anywhere in the
  documentation; no `lstat` guard, no `0o600` tmp-file mode and no
  "sanitized load log" are pinned in any doc (the only documented W4
  adversarial registration is §5.13's F1 coalescing amendment; the only
  documented load log is the pinned
  `vector cache: load failed (treating as empty): <error>` line). No scenario
  asserts them — a blind test cannot pin undocumented behavior. The docs
  either need the W4 adversarial registrations WRITTEN (§3a W4 + §5.13 pins)
  or the brief corrected. **RESOLVED 2026-09-05 (the item-10d doc review):**
  the W4 adversarial registrations were WRITTEN — §3a of
  `docs/specs/unit-f-embeddings.md` gains the W4 subsection (F-W4-1 HIGH the
  coalescing queue + the debounce constant; F-W4-2 LOW the sanitized load
  log; F-W4-3 LOW the lstat regular-file guards + the 0o600 tmp;
  F-W4-4..F-W4-8 INFO) and §5.13 gains the hardening pins + the F-W4-7
  limitation sentence. The brief was correct: the registrations simply had
  not been written yet — this review closes the gap.
- **Runtime observation relevant to that doc gap (NOT a scenario, NOT
  source-derived):** the TMP-1 discriminator surfaced the live module's
  non-fatal write-failure error `cache path is not a regular file: <path>.tmp`
  — i.e. the module DOES exercise a regular-file (lstat-style) guard on its
  temp path, and the temp name IS the documented `<path>.tmp`. The guard's
  behavior exists but is UNDOCUMENTED (no spec text pins it, its message, or
  a 0o600 tmp mode), so nothing here asserts it as a contract. If the W4
  adversarial pass's F3/F4 findings are these guards, they have never been
  written into §3a/§5.13 — the doc reviewer should register them.
  **REGISTERED 2026-09-05 (the item-10d doc review):** the guard is §3a
  F-W4-3 (`regularFileOrAbsent`, the lstat regular-file guards + the 0o600
  tmp; regression tests R4/R5/R6/R7/R8) and §5.13's hardening pins now
  document it.
- **WIRE-CACHE stays DEFERRED-STATIC** (the W2/W3 precedent): the production
  `main.ts` call site (`cache: createVectorCache()` at controller creation)
  is on this battery's do-NOT-open list; the controller-seam half of the
  claim is executed by every boot scenario above. **Since CLOSED — verified
  TRUE at `main.ts:168` by the item-10d doc review (see the post-review
  status + the scenario's CLOSED note).**

### Test-authoring notes

- **Derivation order held.** All 28 scenario rows (27 executable + 1
  deferred-static) were authored and committed BEFORE the first execution;
  the §H table, run summary and findings were the only post-run edits (plus
  the five Ops observability rewrites below, which preceded the first
  RECORDED result).
- **Two harness-fix cycles preceded the first recorded run** (the W3
  precedent's discipline: fix runner wiring before recording results; no
  scenario claim changed):
  1. The planned fs-RENAME SPY (counting whole-map writes via wrapped
     `fs.rename`/`renameSync`/`promises.rename`) proved DEAD: a probe showed
     the live module reads and writes real files while NONE of the patched
     primitives fire — under the vitest module runner the module's `fs`
     surface is opaque to property patches. All write-COUNT assertions were
     re-expressed BEHAVIORALLY before recording: content-polling across the
     debounce window (COAL-2), trailing-state reads (COAL-1), `mtimeMs`
     stability across redundant flushes (COAL-1/H42/DRAIN-1), and the
     tmp-path discriminator (TMP-1). The first run's 5 failures were ALL
     rename-spy artifacts (deltas of 0) plus one broken sentinel — none was a
     contract divergence.
  2. B50's rejection sentinel was broken (`await` of a `Promise<void>`
     resolves to `undefined`, which `.toMatch` rejected on) — replaced with a
     caught-rejection boolean.
- **The `fs`-opacity caveat is recorded for future batteries:** any harness
  that needs to count the cache module's syscalls must not rely on patching
  `node:fs` properties from the test process; use file-level black-box
  observables (existence polling, content, mtime, blocking paths).
- **LIVE scenario.** Ollama was UP with `embeddinggemma` (the
  `isOllamaAvailable` gate passed; LIVE-1 RAN, not skipped). Boot #1 (cold,
  the production shape `createVectorBootController(store, provider, {
  embedBatchFn: provider.embedBatch, cache })` after the documented warm-up
  order) embedded both nodes with real HTTP; boot #2 over the pre-seeded
  cache made ZERO HTTP calls (counting pass-through fetch) and reported
  `cacheHits 2 / embedded 0`; boot #3 after editing one node reported
  `cacheHits 1 / embedded 1` with exactly one HTTP embed.
- **Message assertions.** The three pinned §5.13 log lines were matched by
  their pinned literal prefixes (`vector cache: load failed (treating as
  empty): `, `vector cache: write failed (non-fatal): `, `vector cache:
  pruned to 2 entries`); the prune census was matched at its full pinned
  shape (post-compaction count 2). The B49 family's KEY assertion is that
  the SAME line appears for ALL the failure classes — including the absent
  first-run file (pin (b)) — and does NOT appear for a well-formed load or a
  malformed-ENTRIES-only file (per-entry drops are not load failures, proven
  by the valid entry's adoption).