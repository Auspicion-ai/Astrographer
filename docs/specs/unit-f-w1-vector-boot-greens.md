# Unit W1 — Vector-Boot Controller: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). Derived from the
  DOCUMENTATION ONLY — `docs/specs/unit-f-embeddings.md` §5.12 (the W1
  vector-boot controller — BOOT MODEL B, module seam, signatures, exact error
  messages, log milestones, the reconcile tie rule with the operational
  `embedAt` definition, single-shot `start()`, the promotion pins a–e, the
  `PromotionReport` shape incl. `adopted`), §5.8 happy states #27–33, §5.9
  fail-states #37–44, §5.5 (the `VectorEmbedderOptions.index?` prebuilt-index
  adoption + the provider option), §5.3 (the `VectorIndex` + the
  UNIT-F-SKIP-EMPTY empty-content rule), §3a's W1 subsection (the F-W1-1…
  F-W1-5 adversarial registrations), plus the format precedent of
  `docs/specs/unit-f-embeddings-greens.md`. NO implementation file was read:
  `src/main/vector-boot.ts`, `src/main/retrieval.ts`, `src/main/embeddings.ts`
  and `src/main/main.ts` were NOT opened; the scenarios below are derived
  entirely from the spec text.
- **Source contract:** `docs/specs/unit-f-embeddings.md` §5.12 + §5.5 + §5.9
  (the W1 unit mapping: §5.12 + §5.5 + §5.9), with supporting shapes from
  §5.1–§5.3, the `RagStore` interface from `docs/specs/unit-a-rag-store.md`
  §5.4, and the engine/`RetrievalResult` contract from
  `docs/specs/unit-e-rag-index.md` §5.5–§5.6 (as amended async by Unit F §5.1).
- **Modules under test (the live module seam):** `src/main/vector-boot.ts`
  (`warmUpEmbeddingProvider`, `createVectorBootController`,
  `VECTOR_BOOT_WARMUP_TEXT`, the `VectorBootController` /
  `VectorBootOptions` / `PromotionReport` shapes), the promotion seam on the
  engine (`createRetrieval` → `RetrievalEngine.setEmbedder` — the W1 third
  member), `src/main/embeddings.ts` (the provider abstraction consumed by the
  warm-up + the §5.5 prebuilt-index option), `src/main/mcp-server.ts`
  (`handleRagTool` / `handleRagQueryIpc` — the §8.2 equivalence surface, per
  the Unit F greens convention), and the `RagStore` interface (a spec-shaped
  in-memory store double per the §5.12 red-test note "a store double … no
  injectable clock").
- **Harness:** a THROWAWAY vitest file under `/tmp/w1-greens/` (the repo's
  `tests/` untouched), executed with the repo's own vitest
  (`npx vitest run --root /tmp/w1-greens` run from the repo, so the repo's
  node_modules supply vitest; `/tmp/w1-greens/node_modules` is a symlink to
  the repo's node_modules so the test can also `import typescript` for
  A-F-W1-4). The test imports the LIVE modules by absolute path into the repo
  (e.g. `…/src/main/vector-boot.js`). The HTTP layer is STUBBED
  (`globalThis.fetch`) for every scenario except the two marked **LIVE**,
  which run against the real localhost ollama `embeddinggemma`
  (`http://127.0.0.1:11434`) and are skip-gated on its availability — the
  battery does not depend on them.
- **Derivation order:** every scenario below was authored from the spec
  BEFORE any scenario was executed; the Run record (§G) was filled in after.
- **Runner (as run):** the repo's own vitest — `npx vitest run --root
  /tmp/w1-greens` executed from the repo (the repo's node_modules supply
  vitest; `/tmp/w1-greens/node_modules` is a symlink to it so the runner can
  also `import typescript` for A-F-W1-4). `npx tsx --test` was NOT used (tsx
  is not installed in the repo; vitest was already the repo harness).
- **Run:** 31 executable scenarios ran — 28 pass, 0 fail in the W1 unit
  scope; 3 scenarios (F39/F40/F41) are PENDING-W2 (see the Findings section —
  the batch seam is the W2 unit's contract and does not exist yet);
  F38 is DEFERRED-STATIC. Both LIVE scenarios ran (ollama up).

**Fixture helpers (spec-shaped doubles, not implementation-derived):**

- `node(id, content, updatedAt)` = a `RagNode` `{ id, type: 'p', content,
  ownedNodeIds: [], createdAt: T0, updatedAt }` (ISO-8601 strings; §Unit A
  5.1). Timestamps are ordered ISO strings `T0 < T1 < T2` (millisecond
  precision) — the §5.12 "no injectable clock" construction: the tie rule is
  exercised by bumping the node's `updatedAt` in the store, never by mocking
  time.
- **The store double** implements the `RagStore` interface (unit-a §5.4) in
  memory: sync `getNode`/`listNodes` (fresh shallow copies), async
  `putNode`/`removeNode`/`putEdge`/`removeEdge`, plus the status/journal/
  undo/redo/`enqueue` members as inert stubs. `putNode` stores the record as
  given (the double does not auto-refresh `updatedAt` — the test controls it
  deterministically).
- **The provider double** implements `EmbeddingProvider` (§5.2):
  `kind: 'test'`, `model: 'test-model'`, `baseUrl: 'http://127.0.0.1:11434'`,
  `dimension: 8`, `embed(text)` → a deterministic 8-dim bag-of-words count
  vector over whitespace-lowercased tokens (disjoint token sets → orthogonal
  vectors; identical text → cosine 1). It REJECTS empty/whitespace text with
  `Error('ollama embed: malformed response')` — mirroring the real provider's
  documented empty-input behavior (§5.3 UNIT-F-SKIP-EMPTY rationale), which
  makes the F-W1-1 guard load-bearing in the test. It records every
  `embed` call's text in order, and supports two test hooks: `holdIf(pred)`
  (the NEXT matching call awaits a deferred — exposes `held` then
  `release()`) and `failIf(pred)` (the call throws `Error('provider died')`).
- **The fetch stub** replaces `globalThis.fetch`; it records
  `{ method, url, body, signal }` per call and returns canned responses
  (2xx JSON, non-2xx, hanging-with-signal, or rejecting) per scenario.

---

## A. §5.8 Happy-path states (the W1 set, #27–33)

### H27. Warm-up gate happy (stubbed HTTP — §5.8 #27)
- **Ops:** install the fetch stub (2xx `{ embeddings: [[…8 numbers…]] }`);
  `import { VECTOR_BOOT_WARMUP_TEXT }` from the live module;
  `await warmUpEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })`.
- **Expected:** EXACTLY ONE fetch call; it is a single-text `POST
  http://127.0.0.1:11434/api/embed` (NOT a `GET /api/tags` probe — §5.8 #27
  "NOT `isOllamaAvailable`"); the body carries `model: 'embeddinggemma'` and
  `input === VECTOR_BOOT_WARMUP_TEXT`; the module constant
  `VECTOR_BOOT_WARMUP_TEXT === 'provident warm-up'` (§5.12, pinned for
  determinism). The promise RESOLVES with the warmed provider — an
  `EmbeddingProvider` with `kind === 'ollama'`, `model === 'embeddinggemma'`,
  a usable async `embed`.

### H27-LIVE. Warm-up gate happy (LIVE ollama — §5.8 #27, the test environment)
- **LIVE** (skip-gated on ollama; the battery does not depend on it).
- **Ops:** `await warmUpEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })` against the REAL
  ollama; then `await provider.embed('provident warm-up')`.
- **Expected:** resolves (the real `POST /api/embed` loads the model); the
  resolved provider embeds a vector of finite numbers whose length is the
  model's auto-detected dimension (768 per the §5.10 live-verified census).

### H28. Born-lexical pending (§5.8 #28)
- **Ops:** store with `n1('alpha one', T0)`, `n2('bravo two', T0)`; provider
  double with `holdIf(() => true)` (the build cannot finish);
  `const boot = createVectorBootController(store, provider)` — WITHOUT
  awaiting anything; inspect `boot` synchronously; then
  `await boot.engine.query('alpha')`.
- **Expected:** `createVectorBootController` returns the controller
  SYNCHRONOUSLY (not a promise) and it ALREADY exposes `boot.engine` — the ONE
  shared `RetrievalEngine` instance, created born-LEXICAL inside the factory
  (§5.12: main never creates the engine in vector mode). `boot.phase() ===
  'pending'` before any `start()`; `boot.skipped()` is an empty live Map.
  The pending engine serves queries in the standard `RetrievalResult` shape
  (`query`, `ranked`, `context`, `markdown`, `lineMap`, `k`), ranked
  lexically (`ranked[0].nodeId === 'n1'` for the `'alpha'` query — the
  lexical index was built from `store.listNodes()` at creation).

### H29. Pending query equivalence (§5.8 #29)
- **Ops:** same pending controller as H28 (before `start()`);
  `handleRagTool(store, 'rag.query', { query: 'alpha', topK: 2 }, boot.engine)`
  and `handleRagQueryIpc(boot.engine, store, { query: 'alpha', topK: 2 })`.
- **Expected:** both return the SAME result — identical `ranked`, `context`,
  `markdown`, `lineMap` and `k === 2` — served LEXICALLY by the shared engine
  (the DESIGNED born-lexical pending state, §5.12; §8.2 equivalence holds in
  the pending phase).

### H30. Background build (§5.8 #30)
- **Ops:** store `n1('alpha one', T0)`, `n2('', T0)` (empty),
  `n3('bravo two', T0)`; provider double holding the FIRST embed; `boot =
  createVectorBootController(store, provider)`; `p = boot.start()`; while
  held: assert the phase and the embed log; `release()`; `report = await p`.
- **Expected:** DURING the build the engine stays pending (`boot.phase() ===
  'pending'`). The build is sequential per-item in W1: exactly 2 embed calls
  for the 2 NON-EMPTY nodes (the empty node is never embedded — §5.3
  UNIT-F-SKIP-EMPTY), in `listNodes` order (`['alpha one', 'bravo two']`); no
  batch call (no `embedBatchFn` supplied). After `start()` resolves,
  `report.embedded === 2` and `boot.phase() === 'promoted'`.

### H31. Reconcile + tie rule (§5.8 #31; promotion pin d)
- **Ops:** store `n1('alpha', T0)`, `n2('bravo', T0)`, `n3('gamma', T0)`;
  provider double holding the THIRD embed (n3's build embed — n1/n2 are
  already embedded with `embedAt = T0` snapshots). While held:
  `putNode(n1, content 'alpha', updatedAt T1)` (bumped, same content) and
  `putNode(n2, content 'bravo', updatedAt T1)` (bumped, same content); n3 is
  left at `T0`. `release()`; `report = await boot.start()`.
- **Expected:** the reconcile pass re-embeds EXACTLY the strictly-postdating
  nodes BEFORE the swap: the embed log is `['alpha','bravo','gamma']` (build)
  then `['alpha','bravo']` (reconcile) — 5 calls total, and `start()` resolves
  only after them. `report.reEmbedded === 2`. The TIE node n3
  (`updatedAt === embedAt`) is UNCHANGED — no second `'gamma'` embed (the
  pinned tie rule: re-embed iff `updatedAt > embedAt`; equality means the
  embed observed exactly that version). Post-promotion, the engine scores
  from the reconciled index: `query('gamma')` ranks `n3`.

### H32. Atomic one-way promotion (§5.8 #32; promotion pin c)
- **Ops:** store `n1('alpha one', T0)`; provider double (held first embed);
  `boot = createVectorBootController(store, provider)`; `eng = boot.engine`
  (captured BEFORE the promotion); pending query `r1 = await eng.query('alpha
  one')`; `report = await boot.start()`; post-promotion query
  `r2 = await eng.query('alpha one')`; then a store edit
  (`putNode(n9('zulu nine', T1))` + `await eng.onStoreChanged('content',
  ['n9'], [])`) and `r3 = await eng.query('zulu nine')`.
- **Expected:** `boot.engine === eng` — the SAME engine instance across the
  swap (no engine re-creation). `r1` (pre-promotion) and `r2`
  (post-promotion) share the SAME `RetrievalResult` shape (identical key
  sets); `r2` is scored by the VECTOR embedder (`ranked[0].nodeId === 'n1'`
  with the cosine score ≈ 1 against the adopted build vector). The
  `onStoreChanged` hook attaches WITH the swap: the post-promotion store
  change flows to the vector hook and `r3` ranks the newly embedded `n9`
  (`ranked[0].nodeId === 'n9'`, score ≈ 1).

### H33. Promotion is one-way (§5.8 #33 → §5.9 #42)
- **Ops:** run a controller to promotion (`await boot.start()`); then
  `boot.engine.setEmbedder(<any valid embedder double>)`.
- **Expected:** THROWS `Error('retrieval engine: embedder promotion is
  one-way (already promoted)')` — after promotion the engine never serves
  lexical scoring again.

---

## B. §5.12 promotion pins + report/log contracts

### PIN-A. In-flight pre-promotion query completes on the OLD embedder (pin a)
- **Ops:** direct engine seam: `eng = createRetrieval(store, embedderA)` where
  `embedderA.score` awaits a test deferred then resolves
  `[{ nodeId: 'n1', score: 7 }]`; `q = eng.query('alpha')` (in flight);
  `eng.setEmbedder(embedderB)` (whose `score` resolves
  `[{ nodeId: 'n1', score: 99 }]`); resolve the deferred; `r = await q`; then
  `r2 = await eng.query('alpha')`.
- **Expected:** the in-flight `q` completes coherently on the OLD embedder —
  `r.ranked[0].score === 7`, with the SAME `RetrievalResult` shape (no torn/
  mixed result) — even though the swap happened while it was in flight
  (every query observes exactly ONE embedder).

### PIN-B. Post-promotion query uses the NEW embedder; no mixed index (pin b)
- **Ops:** the same engine as PIN-A, after the swap: `r2 = await
  eng.query('alpha')`.
- **Expected:** `r2.ranked[0].score === 99` — the post-swap query is scored by
  the NEW embedder only (no residual/lexical mixing).

### PIN-C. The `onStoreChanged` hook attaches WITH the swap (pin c, differential)
- **Ops:** pending controller over `n1('alpha one', T0)`; BEFORE `start()`:
  `putNode(n5('delta five', T0))` + `await eng.onStoreChanged('content',
  ['n5'], [])` — count provider embed calls; then `await boot.start()`
  (promotion); then `putNode(n6('echo six', T1))` + `await
  eng.onStoreChanged('content', ['n6'], [])` — count again; `await
  eng.query('echo six')`.
- **Expected:** the PENDING-phase `onStoreChanged` produces ZERO provider
  embeds (the born-lexical embedder implements no vector hook; only the
  lexical index reconciles); the POST-promotion `onStoreChanged` DOES reach
  the vector hook (the embed count increases; `query('echo six')` ranks `n6`
  with score ≈ 1) — the hook attaches with the swap.

### PIN-E. The reconcile-to-swap gap (pin e — the PINNED, documented window)
- **Ops:** store `n1('alpha', T0)`; provider double holding the FIRST embed
  (the build embed). While held: `putNode(n1, 'bravo', T1)` (a build-window
  edit). `release()` → the build finishes (`embedAt = T0`); the reconcile
  re-embed (`'bravo'`) is held by the double (2nd hold). While THAT is in
  flight: `putNode(n1, 'charlie', T2)` (an edit landing AFTER n1's reconcile
  re-check). `release()`; `report = await boot.start()`.
- **Expected:** the promoted index holds n1's PRE-edit (`'bravo'`) embedding —
  the `'charlie'` edit landed in the reconcile-to-swap gap: `report.
  reEmbedded === 1`; `query('charlie')` does NOT rank n1 (its embedding is the
  pre-edit `'bravo'` vector — orthogonal → filtered from `ranked`); the node
  stays on its pre-edit embedding until its NEXT touch: after
  `await eng.onStoreChanged('content', ['n1'], [])` (the attached hook),
  `query('charlie')` ranks `n1` (score ≈ 1).

### SHOT. Single-shot `start()` (§5.12 — AMENDMENT-REVIEW note 8)
- **Ops:** (i) healthy controller with the first embed held: `s1 =
  boot.start()`; `s2 = boot.start()`; inspect `s2`'s settlement; `release()`;
  `await s1`; `s3 = boot.start()`. (ii) a failing controller (`failIf` on
  every embed): `f1 = boot2.start()` → rejected; `f2 = boot2.start()`.
- **Expected:** (i) `s2` REJECTS with `Error('vector boot: start already
  called')` while `s1` still resolves normally with the promotion report (the
  ORIGINAL promise's settlement is authoritative); after resolution, `s3`
  ALSO rejects with `Error('vector boot: start already called')`. (ii) after
  `f1` rejected (the total build failure), `f2` STILL rejects with
  `Error('vector boot: start already called')` — a second call after a
  rejection is equally refused.

### REPORT. The `PromotionReport` shape incl. `adopted` (§5.12 + the RCA-3 amendment)
- **Ops:** clean 2-non-empty-node store; no window edits; `report = await
  boot.start()`; inspect the key sets and W1-pinned values.
- **Expected:** the report's own keys are EXACTLY `embedded`, `cacheHits`,
  `reEmbedded`, `adopted`, `skipped`, `promotedAt`; `skipped`'s keys are
  EXACTLY `empty`, `transient`. W1 pins: `report.cacheHits === 0` (cache hits
  are W4) and `report.skipped.transient === 0` (the transient class does not
  exist until W3); `report.embedded === 2`; `report.reEmbedded === 0`;
  `report.adopted === 0` on a clean build; `report.promotedAt` is a finite
  epoch-ms number (Date.now() at the swap).

### LOGS. The pinned log milestones — happy sequence (§5.12, SpecWriter-pinned strings)
- **Ops:** console spy (all `console` levels + a `process.stdout.write` tap)
  installed BEFORE controller creation; clean build to promotion; read the
  captured lines.
- **Expected:** the pinned milestone sequence appears in order — `vector
  boot: pending (born-lexical)` (at synchronous controller creation) → a
  `vector boot: build complete (embedded N, cacheHits M, re-embedded R,
  skipped empty e / transient t)` line whose numbers match the report (N=2,
  M=0, R=0, e=0, t=0) → `vector boot: promoted`.

### LOGS-FAIL. The total-build-failure milestone + stays pending (§5.12)
- **Ops:** provider double `failIf` on every embed; `p = boot.start()` →
  rejected; inspect the console capture and `boot.phase()`.
- **Expected:** `start()` REJECTS (a TOTAL build failure is the only
  rejection); the failure logs `vector boot: build failed (staying pending):
  <error>`; the engine STAYS pending — `boot.phase() === 'pending'` after the
  rejection (lexical-served; the fire-and-forget `.catch` discipline — never
  an unhandled rejection).

---

## C. §5.5 prebuilt-index adoption + §5.3 the empty-content skip rule

### IDX. `VectorEmbedderOptions.index?` prebuilt-index adoption (§5.5, W1 amendment)
- **Ops:** fetch stub returning deterministic vectors computed from the
  request body's `input` (the same bag-of-words function, 8-dim); store
  `n1('alpha one', T0)`, `n2('bravo two', T0)`; `prebuilt =
  await createVectorIndex([n1, n2], <deterministic embed fn>)`; reset the
  fetch-call counter; `embedder = await createVectorEmbedder(store, {
  provider: { provider: 'ollama', baseUrl: 'http://127.0.0.1:11434', model:
  'embeddinggemma' }, index: prebuilt })`; count fetch calls; `await
  embedder.score('alpha one', store.listNodes())`; count again. CONTROL: a
  second embedder WITHOUT `index` over a fresh counter.
- **Expected:** with `index` supplied, `createVectorEmbedder` performs ZERO
  build embeds (0 fetch calls at construction — the embedder ADOPTS the
  prebuilt index, §5.5 "NO build embeds happen inside
  `createVectorEmbedder`"); `score` then makes exactly ONE fetch call (the
  query embedding) and ranks the node whose adopted vector matches
  (`ranked[0].nodeId === 'n1'`, score ≈ 1). CONTROL: WITHOUT `index`, the
  construction itself builds from the store's nodes (fetch calls > 0 at
  construction) — the omitted-option behavior is unchanged.

### SKIP. The build-side empty-content skip through the §5.12 build (§5.3 UNIT-F-SKIP-EMPTY)
- **Ops:** store `n1('alpha one', T0)`, `n2('', T0)`, `n3('   ', T0)`
  (whitespace); clean `boot.start()`.
- **Expected:** the empty/whitespace nodes are NEVER embedded (the embed log
  contains only `'alpha one'` — no `malformed response` rejection, no total
  failure); they are recorded in `boot.skipped()` with `'empty'` (both ids)
  and counted in `report.skipped.empty === 2`; `report.embedded === 1`; the
  promotion proceeds (`phase() === 'promoted'`); a node not in the vector
  index never ranks (`query('alpha one')` ranks only `n1`).

---

## D. §3a W1 adversarial registrations (F-W1-1 … F-W1-5)

### A-F-W1-1. The reconcile pass guards the LIVE empty content (§3a F-W1-1, HIGH)
- **Ops:** store `n1('alpha', T0)`, `n2('bravo', T0)`; provider double holding
  the SECOND embed (n2's build embed). While held:
  `putNode(n1, content '', updatedAt T1)` (content emptied during the build
  window). `release()`; `report = await boot.start()` (must NOT reject).
- **Expected:** the reconcile pass checks n1's LIVE content BEFORE embedding:
  n1 (`updatedAt T1 > embedAt T0`) is NOT re-embedded (the provider double
  would reject `ollama embed: malformed response` on `''` and the build would
  totally fail) — instead it is removed from the built index
  (`removeFromVectorIndex`), recorded `skipped.set(n1, 'empty')`, and counted
  as a skip: `report.skipped.empty === 1`, `report.reEmbedded === 0`; the
  promotion CONTINUES (`phase() === 'promoted'`, report resolved);
  `boot.skipped().get('n1') === 'empty'`; post-promotion `query('alpha')`
  does not rank n1 (absent from the vector index).

### A-F-W1-2. Nodes ADDED during the build window are adopted (§3a F-W1-2, MEDIUM)
- **Ops:** store `n1('alpha', T0)`; provider double holding the FIRST embed.
  While held (still after the `listNodes` snapshot): `putNode(n3('gamma new',
  T0))` — a non-empty structural add NOT routed through `onStoreChanged` —
  and `putNode(n4('', T0))` — an empty addition. `release()`; `report =
  await boot.start()`.
- **Expected:** the reconcile pass walks the LIVE node list: n3 (missing from
  the built index, non-empty) is embedded + `addToVectorIndex` BEFORE the
  swap and counted in `report.adopted === 1`; n4 (empty) follows the F-W1-1
  skip path (`report.skipped.empty === 1`, no embed of `''`); the build
  counts stay build-only (`report.embedded === 1`). Post-promotion:
  `query('gamma new')` ranks `n3` (score ≈ 1) — the window addition is
  visible, not invisible post-promotion.

### A-F-W1-3. The structural `setEmbedder` guard does NOT consume the one-way latch (§3a F-W1-3)
- **Ops:** fresh engine `eng = createRetrieval(store, <valid lexical
  embedder>)`; `eng.setEmbedder({} as Embedder)` (structurally invalid — no
  `score`/`place` functions); then a VALID embedder double
  (`eng.setEmbedder(valid)`); `r = await eng.query('alpha')`; then a SECOND
  valid `eng.setEmbedder(valid2)`.
- **Expected:** the invalid call THROWS the PINNED message
  `Error('retrieval engine: embedder required')` WITHOUT consuming the
  one-way latch — the subsequent VALID `setEmbedder` succeeds and the engine
  serves through it (`r` reflects the valid embedder's scores); the NEXT
  valid call then throws `Error('retrieval engine: embedder promotion is
  one-way (already promoted)')` (the latch held for exactly one promotion).

### A-F-W1-4. The `VectorIndex` literal type-drift pin (§3a F-W1-4 — zero TS2353)
- **Ops:** compile ONE virtual TS file (in-memory compiler host, the repo's
  own TypeScript, `strict`, `moduleResolution: bundler` — the repo's
  tsconfig mode) containing `import type { VectorIndex } from '<repo
  absolute>/src/main/embeddings.js'` and TWO literals: the FIXED literal
  `{ nodeIds: [], embeddings: new Map(), dimension: 4 }` and a CONTRAST
  literal that adds one excess property (`bogus: 1`). Collect ALL diagnostics.
- **Expected:** the CONTRAST literal produces TS2353 (excess property) —
  proving the live type is imported and the checker is real (the pin is not
  vacuous) — and the FIXED literal produces ZERO TS2353 diagnostics (the
  F-W1-4 fix: the excess `skipped` property is gone from the literal). Any
  OTHER diagnostics on the fixed literal (e.g. a missing-member error if the
  live interface already carries the W3 `skipped` member) are recorded in the
  run notes as observations, not asserted.

### A-F-W1-5. Warm-up with a present-but-INVALID config (§3a F-W1-5)
- **Ops:** console spy installed; `warmUpEmbeddingProvider({ provider:
  'openai', baseUrl: 'https://api.openai.com/v1', model: 'm' })` (an openai
  config WITHOUT `apiKey` — the provider construction itself fails).
- **Expected:** the promise REJECTS with the PINNED class-2 wrap
  `Error('vector boot warm-up: createRemoteEmbedProvider: apiKey required')`
  — the construction failure is INSIDE the try, wrapped like any warm-up
  failure (never an unwrapped throw); the milestone `vector boot: warm-up
  failed` is logged EXACTLY ONCE.

---

## E. §5.9 Fail-states (the W1 set, #37–44)

### F37. Warm-up total failure — the class-2 wrap (§5.9 #37)
- **Ops:** three stubbed-fetch variants of `warmUpEmbeddingProvider({ …
  ollama config … })`: (i) the fetch REJECTS with
  `TypeError('connect ECONNREFUSED 127.0.0.1:11434')`; (ii) a hanging fetch
  with `timeoutMs: 20`; (iii) the fetch returns HTTP 503.
- **Expected:** each REJECTS with the pinned wrap shape
  `Error('vector boot warm-up: <underlying message>')`: (i) `vector boot
  warm-up: ollama embed: connect ECONNREFUSED 127.0.0.1:11434`; (ii)
  `vector boot warm-up: ollama embed: timeout after 20ms` (the warm-up
  timeout is the provider's `timeoutMs` applied to that ONE embed); (iii)
  `vector boot warm-up: ollama embed: HTTP 503`. (The boot aborts BEFORE the
  window — `main()`'s fatal handler is out of the module seam's scope; the
  pinned CONTRACT here is the rejection + message shape.)

### F38. Config-missing abort — failure class 1, UNCHANGED (§5.9 #38)
- **Contract (from the spec):** `retrieval.embedder: 'vector'` with a
  missing/invalid provider config throws `Error('retrieval.embedder: vector
  requires retrieval.embeddingProvider config')` at boot (`main.ts:147-149`);
  §5.9 #34 is preserved verbatim.
- **Verification scope:** the throw site is the `main.ts` boot wiring — a
  main-process-only construct. Per the blind-test constraint for THIS battery
  (`src/main/main.ts` is on the do-NOT-open list), this scenario is
  **DEFERRED-STATIC**: enumerated from the spec, NOT executed, NOT counted as
  a pass; it is left for the item-10d documentation reviewer (who reconciles
  `main.ts` against the spec as a matter of course).
- **Post-run verification (item-10d doc review, 2026-09-05):** the deferred
  F38 contract was verified against the live `src/main/main.ts` — the
  config-missing throw is at `main.ts:153-157` (the spec's pre-W1 cite
  `main.ts:147-149` was re-pointed by the doc review; the W1 rewiring shifted
  the file) and throws the pinned
  `Error('retrieval.embedder: vector requires retrieval.embeddingProvider
  config')` verbatim. **VERIFIED.**

### F39. Batch alignment mismatch (§5.9 #39 — the W2 seam, included per the battery brief)
- **Ops:** ollama provider over a stubbed fetch that answers a 3-text
  `embedBatch` with only 2 vectors; `provider.embedBatch(['a','b','c'])`.
  Remote variant: `createRemoteEmbedProvider({ baseUrl:
  'https://api.openai.com/v1', model: 'm', apiKey: 'k' })` (allowlisted
  origin) with a 2-vector response for 3 texts.
- **Expected:** the ollama `embedBatch` REJECTS with `Error('ollama embed:
  batch alignment mismatch (expected 3 vectors, got 2)')`; the remote one
  with `Error('remote embed: batch alignment mismatch (expected 3 vectors,
  got 2)')` — the WHOLE batch is rejected, never assigned positionally (the
  caller falls back to per-item `embed()` for exactly that batch's texts).

### F40. Batch timeout budget + a REAL abort (§5.9 #40)
- **Ops:** ollama provider, `timeoutMs: 20`; stubbed fetch that HANGS but
  exposes its `AbortSignal` (records `abort` firing); `provider.embedBatch(['a','b'])`
  (N=2 → budget `2 × 20ms`).
- **Expected:** REJECTS with `Error('ollama embed: timeout after 40ms')` (the
  per-text budget, byte-identical shape to §5.9 #8); the stub OBSERVES the
  abort signal fire (the in-flight fetch is ACTUALLY ABORTED via
  `AbortController` — no orphaned request).

### F41. Batch per-vector validation (§5.9 #41 — F6/F7 extended to batches)
- **Ops:** ollama provider `embedBatch(['a','b'])` with (i) an in-batch vector
  containing a string element (F7) → (ii) an in-batch 2-length vector against
  `dimension: 4` (F6). Remote variant of (i) over the allowlisted OpenAI
  shape.
- **Expected:** (i) REJECTS with `Error('ollama embed: malformed response')`;
  (ii) REJECTS with `Error('ollama embed: dimension mismatch (expected 4,
  got 2)')`; the remote variant rejects with the `remote embed: …` prefix of
  the same shapes.

### F42. Double promotion (§5.9 #42 — the direct engine seam)
- **Ops:** `eng = createRetrieval(store, <valid embedder double>)`;
  `eng.setEmbedder(<valid double A>)`; then `eng.setEmbedder(<valid double B>)`.
- **Expected:** the second call THROWS `Error('retrieval engine: embedder
  promotion is one-way (already promoted)')` (SpecWriter-pinned).

### F43. `setEmbedder` null/undefined (§5.9 #43)
- **Ops:** a fresh engine; `eng.setEmbedder(null)`; `eng.setEmbedder(undefined)`.
- **Expected:** each THROWS `Error('retrieval engine: embedder required')`
  (SpecWriter-pinned).

### F44. Warm-up ≠ availability probe (§5.9 #44)
- **Ops:** stubbed fetch: `GET …/api/tags` → 2xx (a healthy tags probe) while
  `POST …/api/embed` → 500; `warmUpEmbeddingProvider(ollama config)`.
- **Expected:** the warm-up REJECTS with `Error('vector boot warm-up: ollama
  embed: HTTP 500')` — a server whose `/api/tags` responds but whose
  `/api/embed` fails FAILS the warm-up (abort, F37) — never a false-ready
  boot (the tags-only probe would NOT load the model).

---

## F. LIVE end-to-end (the second LIVE scenario)

### LIVE-2. Full boot cycle against the live ollama (§5.12 end-to-end, the test environment)
- **LIVE** (skip-gated on ollama; the battery does not depend on it).
- **Ops:** REAL warm-up (`warmUpEmbeddingProvider` over the real
  `embeddinggemma`); a store double with three real-content nodes;
  `boot = createVectorBootController(store, <the warmed REAL provider>)`;
  `report = await boot.start()`; `query(<a node's exact content>)`.
- **Expected:** the controller is created synchronously (`phase() ===
  'pending'`); the background build embeds the 3 nodes through the REAL
  provider (a few seconds); the report pins `cacheHits === 0`, `transient ===
  0`, `adopted === 0`, `embedded === 3`; `phase() === 'promoted'`; the
  post-promotion engine query ranks the node whose content was queried
  (`ranked[0].nodeId` === that node, score ≈ 1 — real cosine scoring).

---

## G. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H27 | Warm-up gate happy (stubbed) | ✅ PASS |
| H27-LIVE | Warm-up gate happy (LIVE ollama) | ✅ PASS (LIVE) |
| H28 | Born-lexical pending | ✅ PASS |
| H29 | Pending query equivalence (MCP/UI) | ✅ PASS |
| H30 | Background build (sequential; pending until promotion) | ✅ PASS |
| H31 | Reconcile + tie rule (pin d) | ✅ PASS |
| H32 | Atomic one-way promotion (pins b/c at boot) | ✅ PASS |
| H33 | Promotion is one-way (post-boot) | ✅ PASS |
| PIN-A | In-flight pre-promotion query on the OLD embedder (pin a) | ✅ PASS |
| PIN-B | Post-promotion query on the NEW embedder (pin b) | ✅ PASS |
| PIN-C | Hook attaches with the swap (pin c, differential) | ✅ PASS |
| PIN-E | The reconcile-to-swap gap (pin e) | ✅ PASS |
| SHOT | Single-shot `start()` (running/resolved/rejected) | ✅ PASS |
| REPORT | `PromotionReport` shape incl. `adopted` | ✅ PASS |
| LOGS | Log milestones — happy sequence | ✅ PASS |
| LOGS-FAIL | Total-build-failure milestone + stays pending | ✅ PASS |
| IDX | §5.5 prebuilt-index adoption (no build embeds) | ✅ PASS |
| SKIP | Build-side empty-content skip (§5.3 via §5.12) | ✅ PASS |
| A-F-W1-1 | Reconcile guards LIVE empty content | ✅ PASS |
| A-F-W1-2 | Window additions adopted (+ empty-addition skip) | ✅ PASS |
| A-F-W1-3 | Structural `setEmbedder` guard, latch preserved | ✅ PASS |
| A-F-W1-4 | `VectorIndex` literal — zero TS2353 | ✅ PASS |
| A-F-W1-5 | Warm-up present-but-invalid config (wrapped + logged once) | ✅ PASS |
| F37 | Warm-up total failure wrap (network/timeout/non-2xx) | ✅ PASS |
| F38 | Config-missing abort (class 1) | ⏸ DEFERRED-STATIC (main-process-only; out of blind scope — see the scenario) |
| F39 | Batch alignment mismatch (W2 seam) | ⏳ PENDING-W2 (the `embedBatch` seam does not exist yet — the W2 unit's contract; see Findings) |
| F40 | Batch timeout budget + real abort (W2 seam) | ⏳ PENDING-W2 (as F39) |
| F41 | Batch per-vector validation (W2 seam) | ⏳ PENDING-W2 (as F39) |
| F42 | Double promotion (direct seam) | ✅ PASS |
| F43 | `setEmbedder` null/undefined | ✅ PASS |
| F44 | Warm-up ≠ availability probe | ✅ PASS |
| LIVE-2 | Full boot cycle (LIVE ollama) | ✅ PASS (LIVE) |

**Run summary:** 31 scenarios executed (2 of them LIVE against the real
localhost ollama `embeddinggemma`) — **28 pass, 0 fail** in the W1 unit
scope; 3 scenarios (F39/F40/F41) are **PENDING-W2** — the batch-seam
fail-states are unit-mapped to W2 by the spec's own §5.12 decomposition
table, and the live providers do not yet expose `embedBatch`; F38 is
**DEFERRED-STATIC** (the throw site is `src/main/main.ts`, which the blind
writer must not open). Zero doc-drift findings and zero un-hardened-regression
findings in the W1 unit scope.

### Findings (spec-vs-impl drift / un-hardened regressions)

- **F39/F40/F41 — PENDING-W2, not a W1 finding (unit-sequencing observation).**
  The battery brief's §5.9 range #37–44 includes three batch-seam fail-states
  that the spec's own unit decomposition (§5.12, the unit table) assigns to
  **W2** ("W2 batch seam … §5.9 #39–41"). Executed against the live modules,
  `createOllamaEmbedProvider()` and `createRemoteEmbedProvider({…})` both
  expose `embedBatch === undefined` (runtime member probe) — i.e. the W2 seam
  has not landed. This is exactly the state the spec pins for the W1 era
  (§5.10: "`EmbeddingProvider` members 5 → 6 (`embedBatch?`)" is the W2
  amendment; the Unit F greens battery's C2 row records the same convention:
  the W1-era code pins 5 members until the W2 red→green cycle re-pins it).
  Classified **NOT doc-drift, NOT an un-hardened regression** — the scenarios
  stay in this battery as PENDING-W2 rows and are re-run (expecting the pinned
  `… batch alignment mismatch …` / `timeout after <N × timeoutMs>ms` /
  per-vector messages) when the W2 unit ships. **CLOSED 2026-09-05:** the W2
  battery re-ran all three against the landed seam — all three PASS with the
  pinned messages (`docs/specs/unit-f-w2-batch-greens.md`, rows F39/F40/F41).
- **Zero drift found in the W1 unit scope.** Every W1 scenario derived from
  §5.12 (the BOOT MODEL B flow, the module seam, the single-shot `start()`,
  the reconcile tie rule with the operational `embedAt` definition, the
  promotion pins a/b/c/d/e, the `PromotionReport` shape incl. `adopted`, the
  pinned log milestones), §5.8 #27–33, §5.9 #37/#38(contract
  recorded)/#42/#43/#44, §5.5 (`index?` adoption — zero build embeds, provider
  option unchanged), §5.3 (the build-side UNIT-F-SKIP-EMPTY guard), and the
  five §3a F-W1-1…F-W1-5 registrations passed against the live modules with
  the SpecWriter-pinned error strings byte-matching (including
  `vector boot warm-up: <underlying message>`,
  `vector boot: start already called`, `retrieval engine: embedder promotion
  is one-way (already promoted)`, `retrieval engine: embedder required`, the
  `vector boot: pending (born-lexical)` → `vector boot: build complete
  (embedded N, cacheHits M, re-embedded R, skipped empty e / transient t)` →
  `vector boot: promoted` sequence, `vector boot: build failed (staying
  pending): <error>`, and the once-only `vector boot: warm-up failed`).

### Test-authoring notes

- **PIN-E (harness, fixed).** The first run had a self-inflicted harness bug:
  the scenario awaited a SECOND `boot.start()` instead of the original
  promise, which the single-shot contract correctly refused
  (`vector boot: start already called`). The fix (await the original promise)
  is the only change ever made to the runner; the refusal itself was correct
  W1 behavior (and corroborates SHOT).
- **A-F-W1-4 (observation).** The contrast literal produced TS2353 (the live
  type import resolved; the checker is real), and the fixed 3-member literal
  produced ZERO diagnostics of ANY code (not just zero TS2353) — i.e. the
  live `VectorIndex` is still the W1 3-member shape (`nodeIds`, `embeddings`,
  `dimension`; the W3 `skipped` member has not landed), consistent with the
  §5.10 census ("`VectorIndex` members 3 → 4 (`skipped`, W3)") and the
  Unit F greens battery's C9 annotation.
- **Log sink.** The pinned §5.12 log milestones are observable on the console
  sink (all `console` levels spied, plus a `process.stdout.write` tap) in the
  node seam — LOGS/LOGS-FAIL/A-F-W1-5 pass against it.
- **LIVE scenarios.** Ollama was UP with `embeddinggemma`; H27-LIVE and
  LIVE-2 ran and passed (the warm-up single-text probe loads the real model;
  the full boot cycle promotes and vector-scores end-to-end). Both are
  skip-gated (`it.skipIf(!isOllamaAvailable())`); the battery's verdict does
  not depend on them.