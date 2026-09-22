# Unit W2 — Batch Seam: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). Derived from the
  DOCUMENTATION ONLY — `docs/specs/unit-f-embeddings.md` §5.2 "The batch seam
  (W2, 2026-09-05 amendment — review A5)" (the optional `embedBatch?` member,
  the per-provider plural request shapes, the sequential default expression,
  the alignment invariant + pinned messages, per-vector F6/F7 validation, the
  per-text timeout budget, the index-build wiring `embedBatchFn?`, and the W2
  adversarial fail-states F-W2-1/-2/-4/-5 incl. `BATCH_CHUNK_SIZE = 64` and
  the budget clamp), §5.3 "Batch build path (W2, F-W2-2 amended)" (chunked
  batch requests, per-chunk fallback isolation, the zero-length rejection,
  the F-W2-6 caller-trust boundary) + the §5.3 fail-states W1/W2
  reject-propagation pin, §5.8 happy states #37–39, §5.9 fail-states #39–41,
  §5.10 census (the W2-era claims: interface members 5 → 6,
  `createVectorIndex` params 2 → 3, `BATCH_CHUNK_SIZE = 64`, the
  `Math.min(N × timeoutMs, 2147483647)` clamp, the `timeoutMs` positive-
  integer ≤ 2147483647 option rule), and §3a's W2 subsection (the F-W2-1…
  F-W2-6 registrations). Format precedent:
  `docs/specs/unit-f-w1-vector-boot-greens.md`. NO implementation file was
  read: `src/main/embeddings.ts`, `src/main/retrieval.ts`,
  `src/main/vector-boot.ts` and `src/main/main.ts` were NOT opened; the
  scenarios below are derived entirely from the spec text (the repo's
  `vitest.config.ts` was read only for runner wiring — the W1 precedent).
- **Source contract:** `docs/specs/unit-f-embeddings.md` §5.2 + §5.3 (the W2
  unit mapping: "W2 batch seam (§5.2 'Batch seam'; §5.3 batch build path;
  §5.9 #39–41; §5.8 #37–39) | §5.2/§5.3 | `tests/embeddings-batch.test.ts`"),
  with the §3a W2 registrations and the §5.10 census.
- **Module under test (the live module seam):** `src/main/embeddings.ts` —
  `createEmbeddingProvider` / `createOllamaEmbedProvider` /
  `createRemoteEmbedProvider` (the two concrete providers that §5.2 pins
  implement `embedBatch`), `createVectorIndex` / `addToVectorIndex` /
  `updateVectorIndex` (the §5.3 index paths + the optional third
  `embedBatchFn?` param), the module-level `BATCH_CHUNK_SIZE` export
  (§5.10/F-W2-2), `isOllamaAvailable` (the LIVE skip gate, §5.6), and
  `createMockEmbedder` (the §5.2 "W2 requires no mock change" smoke). No
  store double is needed — the W2 seam is the provider + index modules; node
  fixtures are plain `RagNode` literals.
- **Harness:** a THROWAWAY vitest file under `/tmp/w2-greens/` (the repo's
  `tests/` untouched), executed with the repo's own vitest
  (`npx vitest run --root /tmp/w2-greens` run from the repo, so the repo's
  node_modules supply vitest; `/tmp/w2-greens/node_modules` is a symlink to
  the repo's node_modules). The test imports the LIVE module by absolute path
  into the repo (`…/src/main/embeddings.js`, a namespace import so a
  missing-in-W1 export such as `BATCH_CHUNK_SIZE` reports as `undefined`
  rather than failing the whole file). The HTTP layer is STUBBED
  (`globalThis.fetch`) for every scenario except the two marked **LIVE**,
  which run against the real localhost ollama `embeddinggemma`
  (`http://127.0.0.1:11434`) and are skip-gated on its availability — the
  battery does not depend on them. `api.openai.com` is the established
  allowlisted mocked remote origin (the Unit F greens battery's convention).
- **Derivation order:** every scenario below was authored from the spec
  BEFORE any scenario was executed; the Run record (§F) was filled in after.
- **Runner (as run):** the repo's own vitest — `npx vitest run --root
  /tmp/w2-greens` executed from the repo; `/tmp/w2-greens/node_modules` is a
  symlink to the repo's node_modules.
- **Run:** 23 executable scenarios ran (2 of them LIVE against the real
  localhost ollama `embeddinggemma`) — **23 pass, 0 fail** in the W2 unit
  scope; A-F-W2-3 is DEFERRED-STATIC (the wiring claim's site is
  `src/main/main.ts`, which the blind writer must not open). The battery ran
  clean on its FIRST execution; both LIVE scenarios ran (ollama up).

**Fixture helpers (spec-shaped doubles, not implementation-derived):**

- `node(id, content)` = a `RagNode` `{ id, type: 'p', content, ownedNodeIds:
  [], createdAt: T0, updatedAt: T0 }` (ISO-8601 strings; Unit A §5.1 shape —
  the same fixture convention as the W1 greens battery).
- `vec(text)` = a deterministic 4-dim vector derived from the text's char
  codes (positive integers; distinct texts → distinct vectors; the SAME
  function is used inside fetch stubs and per-item embed doubles so batch and
  sequential builds are directly comparable).
- **The fetch stub** replaces `globalThis.fetch`; it records `{ method, url,
  body, headers, signal, aborted }` per call and returns canned responses
  (2xx JSON, non-2xx, hanging-with-signal, or rejecting) per scenario. A
  hanging stub rejects its promise when the abort signal fires (mimicking a
  real aborted fetch) — exercising the §5.2 swallow rule ("the aborted
  fetch's rejection is swallowed — the timeout error is the one thrown; no
  unhandled rejection").
- **Message assertions are byte-exact** (caught `err.message` equality, not
  substring matching) — every pinned message below is SpecWriter-pinned in
  §5.2/§5.3/§5.9/§3a.

---

## A. §5.8 Happy-path states (the W2 set, #37–39)

### H37. Batch happy — ollama plural shape, positional order (§5.8 #37)
- **Ops:** fetch stub recording the call and answering any `{model, input}`
  body with `{ embeddings: input.map(vec) }`;
  `provider = createEmbeddingProvider({ provider: 'ollama', baseUrl:
  'http://127.0.0.1:11434', model: 'embeddinggemma' })`;
  `vectors = await provider.embedBatch(['a','b','c'])`.
- **Expected:** EXACTLY ONE fetch call — `POST
  http://127.0.0.1:11434/api/embed` whose body is EXACTLY
  `{ model: 'embeddinggemma', input: ['a','b','c'] }` (the §5.2 ollama batch
  shape, the plural form of the single-text request). The promise RESOLVES
  with 3 vectors in POSITIONAL order — `vectors` deep-equals
  `[vec('a'), vec('b'), vec('c')]` (`result[i]` is the vector for
  `texts[i]`) — each passing F6/F7 validation (finite numbers, consistent
  length). The dimension auto-detects from the FIRST in-batch vector:
  `provider.dimension === vec('a').length` (§5.2 "Dimension auto-detect uses
  the FIRST in-batch vector").

### H37-R. Batch happy — the remote/cloud request shapes (§5.2 "Batch seam")
- **Ops:** (i) `createRemoteEmbedProvider({ baseUrl:
  'https://api.openai.com/v1', model: 'text-embedding-3-small', apiKey:
  'sk-test' }).embedBatch(['x','y'])` over a fetch stub answering
  `{ data: [{ embedding: vec('x') }, { embedding: vec('y') }] }`. (ii)
  `createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model:
  'm', apiKey: 'k', kind: 'cohere' }).embedBatch(['x','y'])` over a stub
  answering `{ embeddings: [vec('x'), vec('y')] }`.
- **Expected:** (i) resolves with `[vec('x'), vec('y')]` (positional —
  `data[i].embedding` is the vector for `texts[i]`); the request is a POST
  to the configured baseUrl carrying `Authorization: Bearer sk-test` (the
  §5.2 remote contract) and the OpenAI PLURAL batch body (`model` +
  `input` deep-equal `['x','y']`). (ii) resolves with `[vec('x'), vec('y')]`;
  the Cohere batch body is EXACTLY `{ model: 'm', texts: ['x','y'] }` (§5.2
  "Cohere (`kind: 'cohere'`): `{ model, texts: [t1..tn] }`") and the response
  is read positionally from `embeddings[i]`.

### H38. Batch sequential default (§5.8 #38; §5.2 sequential-default expression)
- **Ops:** a provider double exposing ONLY `embed` (`embedBatch ===
  undefined`) recording every call; compute (a) the per-item reference
  `Promise.all(['a','b','c'].map((t) => p.embed(t)))` and (b) the §5.2
  sequential default applied literally —
  `p.embedBatch ?? ((texts) => Promise.all(texts.map((t) => p.embed(t))))`
  — over the same texts; reset the log between the two. SMOKE:
  `createMockEmbedder()` scored twice over two nodes.
- **Expected:** (a) and (b) are identical (same vectors, same order) and the
  default path made exactly 3 per-item `embed` calls (the sequential
  per-item pattern, not one call) — the mock and any test double exposing
  only `embed` passes through this default UNCHANGED. SMOKE: the mock
  embedder still works with NO provider dependency and the same query +
  nodes → the same result twice (W2 required no mock change).

### H39. Batch index build — identical to the sequential build's (§5.8 #39)
- **Ops:** 5 non-empty nodes (`n0`…`n4`, distinct contents); fetch stub
  answering `{ embeddings: body.input.map(vec) }` and recording input arrays.
  Build (i) BATCH: `createVectorIndex(nodes, provider.embed,
  provider.embedBatch)` (the real provider over the stub). Build (ii)
  SEQUENTIAL reference: `createVectorIndex(nodes, async (t) => vec(t))`.
  Compare the two indexes.
- **Expected:** the batch build makes ≥ 1 batch call (exactly 1 for 5 texts:
  one 64-cap chunk) whose recorded input is EXACTLY the 5 non-empty contents
  in node order (§5.8 #39 + §3a F-W2-2 "union of texts in node order, ≥ 1
  call" — stayed green under chunking) — fewer requests than the sequential
  build's 5 single-text calls. The resulting index is IDENTICAL to the
  sequential build's: same `nodeIds` order, same `embeddings` per node
  (deep-equal), same `dimension`.

### H39-SEQ. Two-arg `createVectorIndex` unchanged (§5.2 "Index-build wiring")
- **Ops:** the same 5 nodes; an `embedFn` double recording calls (no fetch
  stub installed — none is needed); `createVectorIndex(nodes, embedFn)` —
  the TWO-ARG form.
- **Expected:** resolves; EXACTLY 5 per-item `embed` calls in `nodes` order
  (one per node); the index is complete (`nodeIds` in order, one embedding
  per node, `dimension === vec(...).length`). The optional third param is
  OMITTED → the sequential per-item embed, unchanged (existing two-arg calls
  and tests are UNCHANGED — §5.2).

---

## B. §5.9 Fail-states (the W2 set, #39–41)

### F39. Batch alignment mismatch — the whole batch rejected (§5.9 #39)
- **Ops:** (i) ollama provider over a stub answering a 3-text `embedBatch`
  with only 2 vectors: `provider.embedBatch(['a','b','c'])`. (ii) remote
  provider (`baseUrl: 'https://api.openai.com/v1'`, model `m`, apiKey `k`)
  whose stub answers 3 texts with 2 `data[]` entries.
- **Expected:** (i) REJECTS with the PINNED `Error('ollama embed: batch
  alignment mismatch (expected 3 vectors, got 2)')`; (ii) REJECTS with
  `Error('remote embed: batch alignment mismatch (expected 3 vectors, got
  2)')` — the WHOLE batch is rejected, never assigned positionally (the
  caller falls back to per-item `embed()` for exactly that batch's texts —
  the caller-side behavior is pinned by A-F-W2-2c below).

### F40. Batch timeout budget + a REAL abort (§5.9 #40; §5.2 per-text budget)
- **Ops:** (i) ollama provider `timeoutMs: 20`; hanging fetch stub exposing
  its `AbortSignal` (records `abort` firing; rejects its promise on abort —
  the swallow discipline is under test); `provider.embedBatch(['a','b'])`
  (N=2 → budget `2 × 20ms`). (ii) remote provider `timeoutMs: 20`, same
  hanging stub, `embedBatch(['a','b'])`. CONTROL (iii): the same ollama
  provider, SINGLE-text `embed('a')`.
- **Expected:** (i) REJECTS with `Error('ollama embed: timeout after 40ms')`
  (the per-text budget — byte-identical shape to §5.9 #8); the stub OBSERVES
  the abort signal fire (the in-flight fetch is ACTUALLY ABORTED via
  `AbortController` — no orphaned request) and the aborted fetch's rejection
  is swallowed (no unhandled rejection from the aborted fetch). (ii) REJECTS
  with `Error('remote embed: timeout after 40ms')` (same shape, remote
  prefix) + abort observed. CONTROL (iii) REJECTS with `Error('ollama embed:
  timeout after 20ms')` — a single-text embed keeps exactly `timeoutMs` (not
  2×) and gains the same AbortController abort.

### F41. Batch per-vector validation — F6/F7 extended to batches (§5.9 #41)
- **Ops:** (i) ollama `embedBatch(['a','b'])` with an in-batch vector
  containing a string element (F7). (ii) ollama `dimension: 4`,
  `embedBatch(['a','b'])` with an in-batch 2-length vector (F6). (iii) NO
  configured dimension, batch response `[vec('a') (4-dim), vec('b') padded to
  5-dim]` (auto-detect from the FIRST in-batch vector). (iv) remote variants
  of (i) and (ii) over the allowlisted OpenAI shape.
- **Expected:** (i) REJECTS `Error('ollama embed: malformed response')`; (ii)
  REJECTS `Error('ollama embed: dimension mismatch (expected 4, got 2)')`;
  (iii) REJECTS `Error('ollama embed: dimension mismatch (expected 4, got
  5)')` — the expected dimension came from the FIRST in-batch vector; (iv)
  the `remote embed: …` prefix of the same shapes. (Per-provider prefix —
  the §5.9 #9/#10/#15/#16 messages, batch context.)

---

## C. §3a W2 registrations + the §5.2/§5.3 amendment pins

### A-F-W2-1a. Zero-length vector — provider brick (§3a F-W2-1, MEDIUM)
- **Ops:** ollama provider (no configured dimension); fetch stub whose FIRST
  response is `{ embeddings: [[]] }` (a zero-length vector) and whose
  SUBSEQUENT responses are proper 4-dim vectors. `errMsg(provider.embed('first'))`;
  then `v = await provider.embed('second')`; `provider.dimension`. BATCH
  variant: a fresh provider, stub answering `[[], vec('b')]` for a 2-text
  batch → `errMsg(provider.embedBatch(['a','b']))`; then `await
  provider.embed('good')`.
- **Expected:** the zero-length response REJECTS with `Error('ollama embed:
  malformed response')` (zero-length fails F6/F7 validation — `[].every` is
  vacuously true no longer passes) and the provider is NOT BRICKED: the
  subsequent good embed resolves with a 4-dim vector and
  `provider.dimension === 4` (the dimension was never latched to 0 — every
  later vector would otherwise be rejected). The batch variant likewise
  rejects `malformed response` and a subsequent good embed still works.

### A-F-W2-1b. Zero-length vector — index poison / the PINNED createVectorIndex message (§3a F-W2-1, MEDIUM)
- **Ops:** (i) SEQUENTIAL path: `createVectorIndex([node('n1','x')], async ()
  => [])` (an `embedFn` returning `[]`). (ii) BATCH path:
  `createVectorIndex(nodes3, embedFn, async () => [[], [], []])` (a
  caller `embedBatchFn` returning zero-length vectors).
- **Expected:** EACH rejects with the PINNED message `Error('createVectorIndex:
  malformed response (zero-length vector)')` — a zero-length vector is never
  stored and never used to latch the dimension (no `[]` index entry — the
  index-poison vector cannot exist; the `dimension === 0` sentinel is
  replaced by an explicit `dimensionSet` boolean, F-W2-1c).

### A-F-W2-1c. Validate-then-commit — a malformed LATER vector leaves no earlier latch (§3a F-W2-1, MEDIUM)
- **Ops:** ollama provider, NO configured dimension; fetch stub answering a
  2-text batch with `[vec('a') (valid 4-dim), ['oops'] (malformed element)]`
  → `errMsg(provider.embedBatch(['a','b']))`; THEN the stub answers a
  single-text embed with a valid 6-dim vector → `await provider.embed('good')`;
  `provider.dimension`.
- **Expected:** the batch REJECTS `Error('ollama embed: malformed response')`
  (ALL vectors of a response are validated BEFORE any dimension state is
  committed) and the subsequent good embed AUTO-DETECTS 6 (`provider.dimension
  === 6`) — the rejected batch's first (valid 4-dim) vector left NO earlier
  dimension latch.

### A-F-W2-2a. `BATCH_CHUNK_SIZE` — the module-level export (§3a F-W2-2; §5.10)
- **Ops:** namespace-import the LIVE `src/main/embeddings.js` and read
  `BATCH_CHUNK_SIZE`.
- **Expected:** `BATCH_CHUNK_SIZE === 64` (a module-level export; §5.10
  "Batch chunk size (F-W2-2): `BATCH_CHUNK_SIZE = 64` texts per batch
  request"; the last chunk may be short).

### A-F-W2-2b. Chunk count — 130 texts → 3 batch calls of 64/64/2 (§3a F-W2-2; §5.3 batch build path)
- **Ops:** 130 non-empty nodes (`chunk text 0` … `chunk text 129`); fetch
  stub recording each batch request's `input` array and answering
  `{ embeddings: input.map(vec) }`; `idx = await createVectorIndex(nodes,
  provider.embed, provider.embedBatch)` (the REAL provider's batch member
  over the stub). Reference: `seq = await createVectorIndex(nodes, async (t)
  => vec(t))`.
- **Expected:** EXACTLY 3 batch requests with input lengths `[64, 64, 2]`
  (the last chunk short); the union of the chunk texts (flattened, in
  request order) is EXACTLY the 130 non-empty contents in node order; the
  resulting index is identical to the sequential reference's (same
  `nodeIds` order, same embeddings, same dimension) — §5.8 #39's assertions
  stay green under chunking.

### A-F-W2-2c. Per-chunk fallback isolation (§3a F-W2-2; §5.3 "for exactly THAT chunk's texts")
- **Ops:** the same 130 nodes; a caller `embedBatchFn` double recording every
  call which RESOLVES for calls 1 and 3 (`texts.map(vec)`) and REJECTS call 2
  with `Error('ollama embed: batch alignment mismatch (expected 64 vectors,
  got 63)')`; an `embedFn` double recording every per-item call;
  `idx = await createVectorIndex(nodes, embedFn, batchFn)`.
- **Expected:** the build RESOLVES (a chunk alignment rejection falls back to
  per-item `embed()` — it does NOT fail the build); the batch double was
  called 3 times with sizes `[64, 64, 2]`; the per-item fallback embedded
  EXACTLY the second chunk's 64 texts, in node order (`embedCalls`
  deep-equals `batchCalls[1]`) — the OTHER chunks were NOT re-embedded
  per-item (isolation); the final index contains ALL 130 nodes with the
  correct vectors (the fallback vectors identical to the batch ones).

### A-F-W2-2d. Budget clamp — no spurious instant timeout over the setTimeout ceiling (§3a F-W2-2; §5.10)
- **Ops:** ollama provider `timeoutMs: 2147483647` (the F-W2-5 ceiling — a
  VALID option); a hanging fetch stub; `p = provider.embedBatch(['a','b'])`
  (raw budget `2 × 2147483647 = 4294967294 > 2^31-1`); race `p` against a
  ~300 ms real-time sleep recording whether it settled.
- **Expected:** `p` did NOT settle within the window — the batch budget is
  clamped to `Math.min(N × timeoutMs, 2147483647)` (the clamped budget is
  the timer AND the reported timeout), so no spurious INSTANT rejection
  occurs. (Pre-fix, Node's setTimeout 1 ms clamp would fire the un-clamped
  4294967294 ms timer ~immediately — the exact F-W2-2 bug. The clamped
  ceiling value itself is 24.8 days out — a real-time wait to its message is
  impossible; the instant-vs-pending distinction is the black-box
  observable, and the 40 ms message shape is pinned by F40.)

### A-F-W2-3. The production wiring is W3's — spec-only, NO code change (§3a F-W2-3)
- **Contract (from the spec):** the batch seam had no production caller at
  W2 time; W3 owns the production wiring `embedBatchFn: provider.embedBatch`
  at controller creation (`main.ts`); until then the `embedBatchFn?` option
  exists (W2) with NO production caller — the §5.2 sequential-default
  expression is pinned at that wiring (§5.12 F-W2-3 amendment note).
- **Verification scope:** the claim's site is `src/main/main.ts` — on this
  battery's do-NOT-open list. Per the W1 precedent (F38) this scenario is
  **DEFERRED-STATIC**: enumerated from the spec, NOT executed, NOT counted
  as a pass; it is left for the item-10d documentation reviewer.
  **CLOSED 2026-09-05 (W3 doc review):** W3 landed the wiring — verified at
  `src/main/main.ts:163`:
  `createVectorBootController(ragStore, provider, { embedBatchFn:
  provider.embedBatch })`. **Re-pointed 2026-09-05 (W4 doc review):** the
  call is now at `main.ts:168` — the W4 `cache: createVectorCache()` arg
  completed the pinned final shape; the wiring claim holds.

### A-F-W2-4. Batch input validation (§3a F-W2-4; §5.2 W2 fail-states)
- **Ops:** ollama provider: `embedBatch(null)`, `embedBatch('nope')`,
  `embedBatch([1, 2])`, `embedBatch(['a', 5])`. Remote provider (allowlisted
  origin): the same four. THEN the VALID cases: ollama
  `embedBatch(['', 'b'])` over a stub answering 2 proper vectors; and the
  empty-array probe `embedBatch([])` (record its settlement + fetch count as
  an observation).
- **Expected:** every invalid call REJECTS with the PINNED
  `<prefix> embed: batch texts must be an array of strings` (`ollama embed: …`
  / `remote embed: …` — asymmetric-with-`text must be a string` guard,
  ollama + remote). The empty-STRING items remain VALID: `embedBatch(['',
  'b'])` does NOT reject the validation error and resolves with 2
  positionally-aligned vectors (§5.2 "alignment holds even when a batch item
  is the empty string" — live-verified, and pinned here by stub). The empty
  ARRAY is an array with no non-string items → the validation error must NOT
  fire (its actual settlement/fetch behavior is recorded as an observation —
  the spec pins the validation rule, not the zero-text request).

### EMPTY-BATCH. Empty-batch no-op — a zero-non-empty corpus makes NO batch calls (§5.3 batch build path + UNIT-F-SKIP-EMPTY)
- **Ops:** nodes `[node('e1',''), node('e2','   ')]` (empty + whitespace —
  the build-side UNIT-F-SKIP-EMPTY guard: never embedded, left out of
  `nodeIds`/`embeddings`); counting `embedFn` + counting `embedBatchFn`
  doubles; `idx = await createVectorIndex(nodes, embedFn, batchFn)`.
- **Expected:** resolves — ZERO batch calls and ZERO per-item embed calls
  (§5.3: the build embeds the NON-EMPTY node contents; the union of chunk
  texts is the empty set → no chunk exists to request); `idx.nodeIds` is
  `[]` and no embeddings are stored. (Whether the W3 `skipped` map already
  records the empties is a W3-era observation, not asserted — §5.10 pins
  `VectorIndex` members 3 → 4 (`skipped`) for W3. [RESOLVED 2026-09-05: W3
  landed — the batch build path records the 'empty' skip; pinned by the W3
  F6a scenario and the `F6a` test in
  `tests/embeddings-failure-policy.test.ts`.]

### A-F-W2-5. `timeoutMs` option validation (§3a F-W2-5; §5.2 W2 fail-states)
- **Ops:** for each of `timeoutMs: -5`, `0`, `1.5`, `1e12`:
  `createOllamaEmbedProvider({ timeoutMs })` and
  `createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model:
  'm', apiKey: 'k', timeoutMs })`. PLUS the ceiling control
  `createOllamaEmbedProvider({ timeoutMs: 2147483647 })`. CONTROL: a hanging
  fetch stub + `createOllamaEmbedProvider({})` (timeoutMs ABSENT) →
  `errMsg(provider.embed('x'))`.
- **Expected:** each invalid value THROWS (at construction — a sync
  construction has no promise to reject) with the PINNED
  `createOllamaEmbedProvider: timeoutMs must be a positive integer` /
  `createRemoteEmbedProvider: timeoutMs must be a positive integer`
  respectively (positive integer ≤ 2147483647). The ceiling value
  `2147483647` does NOT throw (cross-ref A-F-W2-2d). CONTROL: `timeoutMs`
  undefined keeps the 5000 default — rejects with `Error('ollama embed:
  timeout after 5000ms')` (not instant, not `-5`).

### A-F-W2-6. Caller-trust boundary — a never-settling caller `embedBatchFn` hangs the build (§3a F-W2-6; §5.3 caller-trust note)
- **Ops:** 3 non-empty nodes; counting `embedFn`; a caller `embedBatchFn`
  that NEVER settles (`() => new Promise(() => {})`); `p =
  createVectorIndex(nodes, embedFn, never)`; race `p` against a ~300 ms
  real-time sleep recording whether it settled; read the embed-call count.
- **Expected:** `p` did NOT settle within the window (the build HANGS — the
  engine-stays-pending F1 discipline; no rejection is synthesized) and the
  `embedFn` count is 0 (NO per-item fallback is invoked — the build does not
  time out or recover on its own; "callers are trusted to settle"). The
  provider's OWN `embedBatch` is bounded by the per-text budget instead
  (cross-ref F40). (The abandoned pending promise holds no timer handle —
  the runner exits cleanly.)

### MAINT. Incremental paths keep the per-item `embed()` path; W2 keeps reject-propagation (§5.2 "Index-build wiring"; §5.3 fail-states "[W1/W2 — unchanged until W3]")
- **Ops:** build a small index via the batch path (stubbed fetch, 2 nodes);
  count embed + batch calls; `addToVectorIndex(idx, node('nAdd','new
  text'), embedFn)`; then `updateVectorIndex(idx, node('n0','changed'),
  embedFn)`; count again. THEN the reject-propagation pin: a failing
  `embedFn` (`async () => { throw new Error('provider died') }`) →
  `errMsg(createVectorIndex(nodes2, failing))`, `errMsg(addToVectorIndex(idx,
  node('nX','y'), failing))`, `errMsg(updateVectorIndex(idx, node('n0','z'),
  failing))`.
- **Expected:** `addToVectorIndex` made EXACTLY ONE per-item embed call and
  ZERO batch calls; `updateVectorIndex` likewise exactly ONE (the per-node
  paths "embed exactly ONE node each and keep the per-item `embed()` path —
  their signatures are unchanged by W2", the W2/W3 handoff). Each failing
  call REJECTS with `Error('provider died')` — the embedFn rejection
  PROPAGATES from the build/maintenance functions (the W2-era contract; the
  W3 transient-skip flip has NOT landed [SUPERSEDED 2026-09-05: the W3 flip
  has since LANDED — a per-node embed rejection on the build/maintenance
  paths is now a 'transient' skip + resolve, §5.9 #46; this row records the
  W2-era state as run]).

---

## D. §5.10 census — the W2-era claims

### CENSUS. `EmbeddingProvider` members 5 → 6 landed at runtime (§5.10; the W1-era probe was `embedBatch === undefined`)
- **Ops:** `createOllamaEmbedProvider()` and
  `createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model:
  'm', apiKey: 'k' })`; probe `typeof p.embedBatch` on BOTH; cross-read
  `BATCH_CHUNK_SIZE`.
- **Expected:** BOTH concrete providers expose `embedBatch` as a FUNCTION at
  runtime (the §5.10 W2 amendment "Interface members: 5 → 6 … lands with the
  W2 red→green cycle" — the W1 greens battery recorded `embedBatch ===
  undefined` for the W1 era); `BATCH_CHUNK_SIZE === 64` (cross-ref A-F-W2-2a);
  `createVectorIndex` accepts BOTH the two-arg form (H39-SEQ) and the
  optional third `embedBatchFn?` param (H39) — params 2 → 3 landed.

---

## E. LIVE end-to-end (the test environment — skip-gated; the battery does not depend on them)

### LIVE-1. The real 3-text batch — positional alignment incl. an empty-string item (§5.2 LIVE-VERIFIED premise)
- **LIVE** (skip-gated on ollama; the battery does not depend on it).
- **Ops:** REAL ollama provider (`createEmbeddingProvider({ provider:
  'ollama', baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })`);
  `vectors = await provider.embedBatch(['provident alpha', 'provident beta',
  ''])`; then `single = await provider.embed('provident alpha')`.
- **Expected:** resolves with EXACTLY 3 vectors (`vectors.length ===
  texts.length` — the alignment invariant on the real model), each an array
  of finite numbers sharing ONE length equal to `provider.dimension` (768 —
  the §5.10 live-verified census); alignment holds even though the third
  batch item is the empty string; the batch vector for a text matches the
  single-text embed of the same text (deterministic model: `cosineSimilarity(vectors[0],
  single)` ≈ 1).

### LIVE-2. A real >64-text batch build through `createVectorIndex` — chunking observed live (§5.3 batch build path, the test environment)
- **LIVE** (skip-gated on ollama; the battery does not depend on it).
- **Ops:** a recording PASSTHROUGH fetch (records `body.input`, then calls
  the REAL fetch); the REAL ollama provider; 70 nodes with real distinct
  contents; `idx = await createVectorIndex(nodes, provider.embed,
  provider.embedBatch)`; then `spot = await provider.embed(nodes[5].content)`.
- **Expected:** EXACTLY 2 batch POSTs to `/api/embed` with input lengths
  `[64, 6]` (70 = 64 + 6 — the last chunk short, chunking observed LIVE);
  the union of the chunk texts is the 70 contents in node order; the index
  is complete — `nodeIds` all 70 in order, one embedding per node,
  `dimension === 768` (the §5.10 live-verified census); the spot node's
  batch-built embedding matches the single-text embed of the same content
  (`cosineSimilarity(idx.embeddings.get('n5'), spot)` ≈ 1 — positional
  integrity on the real model).

---

## F. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H37 | Batch happy — ollama plural shape, positional order | ✅ PASS |
| H37-R | Batch happy — remote OpenAI + Cohere request shapes | ✅ PASS |
| H38 | Batch sequential default (+ mock-unchanged smoke) | ✅ PASS |
| H39 | Batch index build ≡ sequential build | ✅ PASS |
| H39-SEQ | Two-arg `createVectorIndex` unchanged | ✅ PASS |
| F39 | Batch alignment mismatch (ollama + remote) | ✅ PASS |
| F40 | Batch timeout budget + REAL abort (+ single-text control) | ✅ PASS |
| F41 | Batch per-vector validation F7/F6 (+ first-vector auto-detect) | ✅ PASS |
| A-F-W2-1a | Zero-length vector — provider brick | ✅ PASS |
| A-F-W2-1b | Zero-length vector — index poison / pinned message | ✅ PASS |
| A-F-W2-1c | Validate-then-commit (no earlier latch) | ✅ PASS |
| A-F-W2-2a | `BATCH_CHUNK_SIZE === 64` export | ✅ PASS |
| A-F-W2-2b | Chunking 64/64/2 for 130 texts | ✅ PASS |
| A-F-W2-2c | Per-chunk fallback isolation | ✅ PASS |
| A-F-W2-2d | Budget clamp — no spurious instant timeout | ✅ PASS |
| A-F-W2-3 | Production wiring is W3's (spec-only) | ⏸ DEFERRED-STATIC (main-process-only; out of blind scope — see the scenario) |
| A-F-W2-4 | Batch input validation (+ empty-string valid) | ✅ PASS |
| EMPTY-BATCH | Empty-batch no-op (zero calls over an all-empty corpus) | ✅ PASS |
| A-F-W2-5 | `timeoutMs` option validation (+ undefined-5000 control) | ✅ PASS |
| A-F-W2-6 | Caller-trust boundary (never-settling caller fn) | ✅ PASS |
| MAINT | Incremental paths keep per-item embed; W2 reject-propagation | ✅ PASS |
| CENSUS | W2-era runtime census (members 5 → 6; params 2 → 3) | ✅ PASS |
| LIVE-1 | Real 3-text batch incl. empty-string item | ✅ PASS (LIVE) |
| LIVE-2 | Real 70-text batch build (chunking live) | ✅ PASS (LIVE) |

**Run summary:** 23 executable scenarios (2 of them LIVE against the real
localhost ollama `embeddinggemma`; both skip-gated) — **23 pass, 0 fail** in
the W2 unit scope; A-F-W2-3 is **DEFERRED-STATIC** (the throw site is
`src/main/main.ts`, which the blind writer must not open). Zero doc-drift
findings and zero un-hardened-regression findings in the W2 unit scope.

### Findings

- **Zero drift found in the W2 unit scope.** Every W2 scenario derived from
  §5.2 "The batch seam" (the plural request shapes for ollama / OpenAI-shape
  / Cohere, the sequential-default expression, the alignment invariant +
  pinned messages, per-vector F6/F7 validation with first-in-batch-vector
  auto-detect, the `N × timeoutMs` per-text budget with the real
  `AbortController` abort + swallowed aborted-fetch rejection, the
  `embedBatchFn?` index-build wiring, the W2 adversarial fail-states), §5.3
  "Batch build path" (`BATCH_CHUNK_SIZE = 64` chunking, per-chunk fallback
  isolation, the pinned
  `createVectorIndex: malformed response (zero-length vector)` message, the
  F-W2-6 caller-trust boundary, the W1/W2 reject-propagation pin on the
  maintenance paths), §5.8 #37–39, §5.9 #39–41, §5.10 (the W2-era census),
  and §3a F-W2-1…F-W2-6 passed against the live module with the
  SpecWriter-pinned error strings byte-matching — including `ollama embed:
  batch alignment mismatch (expected 3 vectors, got 2)` /
  `remote embed: …`, `ollama embed: timeout after 40ms` /
  `remote embed: timeout after 40ms` (+ the single-text `…timeout after
  20ms` control and the undefined-`timeoutMs` `…timeout after 5000ms`
  control), `… embed: malformed response`, `… embed: dimension mismatch
  (expected 4, got 2)`, `… embed: batch texts must be an array of strings`,
  `createOllamaEmbedProvider: timeoutMs must be a positive integer` /
  `createRemoteEmbedProvider: timeoutMs must be a positive integer`, and
  `createVectorIndex: malformed response (zero-length vector)`.
- **W2-era census confirmed at runtime (§5.10).** The W1-era probe recorded
  `embedBatch === undefined` on both concrete providers; the W2 battery
  records `typeof embedBatch === 'function'` on BOTH — the §5.10 "Interface
  members: 5 → 6 … lands with the W2 red→green cycle" amendment HAS landed;
  `createVectorIndex` accepts both the two-arg form and the optional third
  `embedBatchFn?` param (params 2 → 3 landed); `BATCH_CHUNK_SIZE === 64`.
- **No W2 unit-mapping pendings remain.** The W1 greens battery left
  F39/F40/F41 as PENDING-W2 rows; this battery re-runs exactly those
  fail-states (§5.9 #39–41) against the now-landed seam — all three PASS
  with the pinned messages, closing the W1 battery's pendings.

### Test-authoring notes

- **First-run clean.** Unlike the W1 battery (whose PIN-E note records a
  self-inflicted harness fix), this battery ran to green on its FIRST
  execution — no runner changes were needed after the scenarios were
  authored; the only pre-run edits were two runner-hygiene cleanups (a dead
  stub branch and an out-of-scope helper) made BEFORE the first execution.
- **A-F-W2-2d (the clamp) is pinned behaviorally, not by message.** The
  clamped ceiling budget (2147483647 ms ≈ 24.8 days) cannot be waited out in
  real time, so the scenario pins the black-box distinction: with the clamp,
  a batch whose raw budget is 4294967294 ms does NOT reject ~instantly
  (Node's pre-fix setTimeout 1 ms clamp would); the 40 ms message shape of
  the same budget formula is byte-pinned by F40. The scenario leaves one
  24.8-day implementation timer pending at test end (no test-visible
  effect — the vitest worker is terminated; the run exited in 6.76 s).
- **Observations (recorded, not asserted):** (i) `embedBatch([])` RESOLVES
  with ZERO fetch calls (an empty-batch short-circuit — the spec pins only
  that the input-validation error must not fire for an empty array; the
  observed behavior is the stricter no-op, consistent with the §5.3
  empty-batch no-op reading). (ii) The W2-era `VectorIndex` own keys are
  `nodeIds, embeddings, dimension` — the W3 `skipped` map has NOT landed
  (exactly the §5.10 census "members 3 → 4 (`skipped`, W3)"); EMPTY-BATCH
  therefore pins the skip BEHAVIOR (never embedded, never indexed), not the
  record.
- **LIVE scenarios.** Ollama was UP with `embeddinggemma`; LIVE-1 and LIVE-2
  both ran (the real 3-text batch incl. an empty-string item — 3 ordered
  768-dim vectors, batch vector ≈ single-text embed; the real 70-text build
  through `createVectorIndex` — exactly 2 batch POSTs of 64 + 6 observed
  live through a recording passthrough fetch, complete 70-node index,
  dimension 768, positional integrity cosine ≈ 1). Both are skip-gated
  (`isOllamaAvailable()`); the battery's verdict does not depend on them.
- **Byte-exact message assertions.** Every pinned message was compared by
  caught `err.message` EQUALITY (not substring matching); construction-time
  validations (F-W2-5) were compared as sync-throw messages.