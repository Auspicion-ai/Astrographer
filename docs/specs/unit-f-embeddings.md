# Spec — Unit F: Vector Embeddings (Provider/Model Agnostic)

- **Status:** SPEC (first-milestone Unit F). Gate reference:
  `docs/specs/astrographer-review.md` §3d (lexical-first retrieval ENDORSE,
  "vector later"), §9.2.10 (retrieval selection), §8.2 (MCP/UI equivalence — a
  BINDING constraint on every unit that touches retrieval), §9.2.6
  (SINGLE-WRITER-STORE), §9.3 ("strays from the topic" re-scoping — the
  `Embedder` owns the semantic placement decision). Decisions:
  `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL** (the `Embedder` is the
  drop-in seam for the Unit F vector implementation), **PROVIDER-AGNOSTIC**
  (2026-08-27 — all agent/model-specific tasks are provider/model AGNOSTIC,
  including remote/cloud-sourced providers, with config settings for the
  required inputs; the vector embedder is a configurable provider, NOT
  hardcoded to one provider/model), **SINGLE-WRITER-STORE**,
  **RAG-EDIT-MCP-GROUPS**. Pending: `docs/pending.md` (vector embeddings — the
  deferred row; the updated "no network egress" row — **PROVIDER-AGNOSTIC
  (2026-08-27):** the vector embedder is provider/model agnostic — local
  (ollama `embeddinggemma`) AND remote/cloud providers are in scope, so the
  `connect-src` CSP allowlist + API-key handling become a DESIGNED security
  surface; a localhost ollama call is LOCAL (no external egress); a
  remote/cloud provider requires the CSP allowlist + API-key config).
- **Scope:** the vector embedder behind the `Embedder` interface (the Unit E
  drop-in seam) — a **configurable embedding provider** (an `EmbeddingProvider`
  abstraction + an `EmbeddingProviderConfig` config shape; ollama
  `embeddinggemma` is ONE concrete provider config — the local test
  environment — and remote/cloud providers such as OpenAI/Cohere are drop-ins
  via the SAME interface + config), the vector index (node id → embedding,
  maintained incrementally on store change), cosine similarity scoring, the
  **async `Embedder` interface amendment** (a Unit E contract amendment), the
  deterministic mock embedder for unit tests, the real-ollama INTEGRATION test
  path (the test environment), the MOCKED remote/cloud provider test path (no
  live remote call in the test suite — no network egress in CI), the config
  selection, the security/CSP posture for BOTH local and remote providers, and
  MCP/UI equivalence. This unit does NOT implement crosslinks/backlinks
  (Unit G).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/embeddings.ts` (and
  the amended `src/main/retrieval.ts`) from §5.8/§5.9 before any
  implementation. For the vector-boot units, the red set derives from
  §5.8/§5.9 + §5.12 (W1) / §5.13 (W4) ALONE — no code reading.
- **Amended (2026-09-05 — the vector-boot amendment):** amended per
  `docs/specs/ollama-vector-boot-review.md` (the four-agent gate verdict
  PROCEED-WITH-AMENDMENTS, §2 binding amendments A1–A6) + the USER GO-AHEAD
  for the CACHE-INCLUSIVE variant (review §4a, 2026-09-05 — the persisted
  embedding cache is IN-SCOPE core contract, unit W4). Amended in place:
  §5.2 (the optional `embedBatch?` provider member + the batch seam + the
  per-text timeout budget), §5.3 (the `skipped` map + the UNIT-F-SKIP-EMPTY
  empty-content guard extension + the W3 embed-failure flip), §5.5 (the
  prebuilt-index option), §5.7 (the born-lexical boot flow), §5.8–§5.10
  (states, fail-states, census). NEW: §5.12 (the vector-boot controller —
  W1) and §5.13 (the persisted embedding cache — W4). Existing section
  numbering is UNCHANGED; the §3a F9 label collision is resolved (§3a).

---

## 1. What the proposal asks

1. A **vector embedder** behind the `Embedder` interface (the Unit E drop-in
   seam) that is **provider/model AGNOSTIC** — NOT hardcoded to one
   provider/model (the **PROVIDER-AGNOSTIC** binding decision, 2026-08-27).
2. A **configurable embedding provider** — an `EmbeddingProvider` abstraction
   with config settings for the required inputs (model URL / endpoint, API
   keys, model name, embedding dimension, etc.). The config is the ONLY thing
   that differs between providers; the retrieval engine uses the passed
   embedder (Unit E F2) unchanged.
3. **ollama `embeddinggemma` as ONE concrete provider config** — the local
   test environment (a localhost HTTP call to ollama's embeddings endpoint),
   framed as one configurable provider among many, NOT the only one.
4. **Remote/cloud providers supported** (e.g. OpenAI, Cohere, etc.) via the
   SAME provider abstraction + config — a drop-in (same interface, different
   config: model URL, API key, model name).
5. **Testability:** a deterministic MOCK for unit tests (no provider
   dependency) AND a real-ollama INTEGRATION test path (the test environment)
   that exercises the actual `embeddinggemma` model, AND a MOCKED remote/cloud
   provider test path (no live remote call in the test suite — no network
   egress in CI).
6. A **vector index** (node id → embedding vector), built by calling the
   provider once per node (at index build / on store change), maintained
   incrementally like the lexical index.
7. **Cosine similarity** scoring with deterministic tie-breaking (by node id,
   matching Unit E).
8. **MCP/UI equivalence** — the vector embedder is a drop-in behind the
   `Embedder` interface so `rag.query`/`rag-query` work unchanged (§8.2, a
   BINDING constraint).
9. **Security/CSP posture** — a localhost ollama call is LOCAL (no external
   egress); a remote/cloud provider requires the `connect-src` CSP allowlist +
   API-key handling (a DESIGNED security surface, per the PROVIDER-AGNOSTIC
   decision). Pin the security posture for BOTH local and remote providers.

## 2. Feasibility verdict

**Feasible — grounded in the review's lexical-first ENDORSE (§3d, "vector
later"), the retrieval-selection resolution (§9.2.10), the Unit E drop-in seam,
and the PROVIDER-AGNOSTIC binding decision (2026-08-27).** The vector embedder
is net-new host-side work (the foundation has no embeddings/similarity mechanism
— review §2 finding 1), but it composes the existing `Embedder` interface
(Unit E §5.2) + the `RagStore` interface (Unit A §5.4). The provider abstraction
is a thin configurable seam: ollama `embeddinggemma` is available as a TEST
ENVIRONMENT (local ollama running `embeddinggemma`), and remote/cloud providers
are drop-ins behind the SAME interface + config. The one contract tension — the
Unit E `Embedder` interface is SYNCHRONOUS, but a vector embedder must compute
the query embedding via an async provider call — is resolved by amending the
interface to async (§4, §5.1). No engine/foundation gap blocks this unit. The
security surface is now a DESIGNED surface (per PROVIDER-AGNOSTIC): a localhost
ollama call is LOCAL (no external egress, no `connect-src` CSP allowlist
needed); a remote/cloud provider requires the `connect-src` CSP allowlist +
API-key handling (pinned in §5.7).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Async `Embedder` interface amendment | Project-specific (a Unit E contract amendment) | Low cost; the lexical embedder wraps its sync computation in a resolved promise. |
| `EmbeddingProvider` abstraction + `EmbeddingProviderConfig` config shape | Project-specific (no foundation HTTP-embedding mechanism) | Low cost; the provider/model-agnostic seam (PROVIDER-AGNOSTIC). |
| Ollama `embeddinggemma` provider (localhost HTTP) — ONE concrete config | Project-specific | Low cost; local-first, no external egress. |
| Remote/cloud provider (OpenAI/Cohere/etc.) — a drop-in via the same interface + config | Project-specific | Low cost; same interface, different config (model URL, API key, model name). |
| Vector index (node id → embedding) | Project-specific (composes the RagStore + the provider) | Low cost; maintained incrementally like the lexical index. |
| Cosine similarity scoring | Project-specific | Low cost; deterministic, range [-1, 1]. |
| Mock embedder (unit tests) | Project-specific | Low cost; deterministic, no provider dependency. |
| Real-ollama integration test path | Project-specific (the test environment) | Low cost; gated/skipped when ollama is unavailable. |
| MOCKED remote/cloud provider test path | Project-specific | Low cost; no live remote call in the test suite (no network egress in CI). |
| Security/CSP posture (local vs remote) | Project-specific (a DESIGNED security surface per PROVIDER-AGNOSTIC) | Low cost; localhost = no egress; remote = `connect-src` CSP allowlist + API-key handling. |
| Config selection + MCP/UI equivalence | Project-specific (reuses the Unit E engine + the passed-embedder seam) | Low cost; the vector embedder is a drop-in. |

No engine gap. The ollama call is localhost (local, no external egress). A
remote/cloud provider requires the `connect-src` CSP allowlist + API-key
handling — now a DESIGNED security surface (per PROVIDER-AGNOSTIC), not just an
open tracked item.

### 3a. Adversarial findings (host findings, fixed + regression-tested)

Post-green adversarial pass (RCA-3) 2026-08-27. All findings are HOST (this
repo's `src/`); none are package/upstream findings (nothing went to
`docs/defects.md`/`docs/HANDOFF.md`). Each host finding was fixed + regression-
tested (13 regression tests in `tests/embeddings-adversarial.test.ts`).

**MEDIUM:**
- **F1** — with `retrieval.embedder: 'vector'` and the provider down, any edit
  triggered `engine.onStoreChanged`, which awaits the vector embedder's hook;
  the hook re-embeds via the provider and rejects. Both call sites
  (`src/main/main.ts`, `src/main/mcp-server.ts`) fired-and-forgot with `void`
  and no `.catch()` → unhandled promise rejection + a silently-stale vector
  index. Fixed: attached `.catch()` to both fire-and-forget calls (log the
  embed error; the lexical index is already reconciled inside the engine before
  the embedder hook runs, so a hook failure only leaves the vector index stale,
  logged, never an unhandled rejection). Regression-tested (an edit tool
  succeeds even when the engine's `onStoreChanged` rejects, over a real
  in-process MCP client).
- **F2** — `isOllamaAvailable` interpolated the caller-supplied `baseUrl` into
  `execSync(\`curl ... ${url}/api/tags\`)` — a shell-command injection vector
  (a `baseUrl` with shell metacharacters executes arbitrary shell). Fixed:
  validate the URL is localhost/loopback before probing AND use
  `execFileSync('curl', [...])` (no shell). Regression-tested (non-localhost
  returns false; a baseUrl with shell metacharacters is not executed).

**LOW:**
- **F3** — IPv6 loopback `http://[::1]:11434` was rejected by the ollama
  localhost check (`new URL(...).hostname` returns `'[::1]'` bracketed, but the
  check compared against unbracketed `'::1'`). Fixed: strip `[`/`]` before the
  comparison. Regression-tested.
- **F4** — `retrieve` applied the lexical-specific zero-token (stopword-only)
  check to the vector embedder, rejecting a valid stopword-only query like
  `"the"`. Fixed: gate the zero-token check on the lexical embedder (detected
  via the `LEXICAL_INDEX` marker). Regression-tested (the vector embedder
  handles a stopword-only query).
- **F5** — `embeddingProviderConfigFromEnv` did `Number(env)` without
  validating → `NaN` dimension/timeout (every embed fails with `expected NaN`,
  or `setTimeout(..., NaN)` fires immediately). Fixed: `parsePositiveIntEnv`
  drops NaN/negative/non-integer/empty env values. Regression-tested.
- **F6** — `createVectorIndex` set `dimension` from the first embed and never
  checked subsequent vectors → mixed-dimension index → a later `score` rejects
  with `dimension mismatch`. Fixed: validate each vector's length against the
  established dimension in create/update/add. Regression-tested.
- **F7** — both providers cast the response vector to `number[]` without
  validating element types → a malformed response with string elements yields
  `NaN` scores (breaking `place` and the sort). Fixed: validate every element
  is a finite number before returning (else `malformed response`).
  Regression-tested.
- **F8** — the remote provider was OpenAI-shaped only, not truly
  provider-agnostic (a `provider: 'cohere'` config would send the wrong body and
  fail to parse). Fixed: dispatch the request/response shape on
  `config.provider`/`kind` (`cohere` → `{ model, texts }` / `embeddings[0]`;
  any other → the OpenAI-shaped `{ model, input }` / `data[0].embedding`).
  Regression-tested.
- **F9** — the `connect-src` allowlist was a hardcoded module constant with no
  extension seam (a legitimate custom/self-hosted remote provider could never
  be allowlisted). Fixed: the allowlist is extensible via a `connectSrc` config
  field (defaulting to the safe set, remaining fail-closed). Regression-tested.
- **F9 label disambiguation (2026-09-05 amendment, review A2):** §3a F9 (the
  `connect-src` extensibility finding, above) KEEPS the F9 label. The
  greens-file row that was labelled "F9 — Ollama provider malformed response"
  (`docs/specs/unit-f-embeddings-greens.md` — the §5.9 #9 scenario) is RENAMED
  **GREEN-OLLAMA-MALFORMED** so the two ids never collide.
- **F10 (UNIT-F-SKIP-EMPTY)** — the empty/whitespace-content node skip in
  `createVectorIndex` (`src/main/embeddings.ts:309-313` pre-W2; `545-549` post-W2) existed only as a
  code comment that REUSED the "F9" tag — colliding with §3a F9 above, with no
  finding id, no spec rule, and no named test (yet the stale-`dist` boot crash
  HOST-F-DIST-STALE made the unlabelled skip load-bearing). Fixed (2026-09-05
  amendment): the skip is its OWN finding id **F10 / UNIT-F-SKIP-EMPTY**,
  pinned as the §5.3 empty-content guard rule (EXTENDED to
  `addToVectorIndex`/`updateVectorIndex` in W3 — those lacked the guard and
  would embed empty content → ollama `malformed response`,
  `src/main/embeddings.ts:329-362` pre-W2; `573-606` post-W2), with a NAMED regression test in the W3
  test file (§5.12 unit mapping). The greens-row rename + the named regression
  test land with the W2/W3 test passes.

**W1 (RCA-3, 2026-09-05 — the MANDATORY post-W1 adversarial pass; 5 HOST
findings in `src/main/`, nothing package/upstream; all fixed + regression-
tested in `tests/vector-boot-adversarial.test.ts`, one test per finding):**

- **F-W1-1 (HIGH)** — the §5.12 reconcile loop re-embedded a node whose
  content became empty/whitespace during the build window: `embedFn('')` →
  ollama `{ embeddings: [] }` → `ollama embed: malformed response` → a TOTAL
  build failure → the engine pending FOREVER (single-shot `start()`, no
  retry). Fixed: the reconcile pass guards the LIVE content — empty/whitespace
  → `removeFromVectorIndex` (if present) + `skipped.set(id, 'empty')` + counted
  as a skip (the build-side UNIT-F-SKIP-EMPTY semantics); the promotion
  continues. Regression-tested (`tests/vector-boot-adversarial.test.ts`
  "A-F-W1-1").
- **F-W1-2 (MEDIUM, spec-gap)** — nodes ADDED during the build window (after
  the `listNodes` snapshot) were never embedded and invisible post-promotion
  (score 0, filtered from ranked). Fixed: the reconcile pass walks the LIVE
  node list — every non-empty live node MISSING from the built index is
  embedded + `addToVectorIndex` before the swap; counted in the NEW
  `adopted: number` PromotionReport field (§5.12 amendment, noted there).
  Empty/whitespace additions follow the F-W1-1 skip path. Regression-tested
  (`tests/vector-boot-adversarial.test.ts` "A-F-W1-2").
- **F-W1-3 (LOW, spec-gap)** — `retrieval.ts` `setEmbedder` rejected only
  null/undefined: `setEmbedder({} as Embedder)` latched the one-way promotion
  and the first query threw TypeError with no recovery. Fixed: a STRUCTURAL
  guard (`typeof next.score !== 'function' || typeof next.place !==
  'function'`) throws the PINNED message `retrieval engine: embedder required`
  WITHOUT consuming the one-way latch (a subsequent VALID `setEmbedder` still
  succeeds). Regression-tested (`tests/vector-boot-adversarial.test.ts`
  "A-F-W1-3").
- **F-W1-4 (LOW, test/type drift)** — `tests/vector-boot.test.ts` carried an
  excess `skipped` property on a `VectorIndex` literal (TS2353 if tests ever
  enter typecheck scope — they are excluded from `tsc -p tsconfig.json`).
  Fixed: the property removed from that literal (type-only drift; no runtime
  test semantics change; tests/ stays OUT of the typecheck scope — noted for
  the doc review). Regression-tested via the real TypeScript compiler
  (`tests/vector-boot-adversarial.test.ts` "A-F-W1-4" compiles the interface +
  the literal in one virtual file and pins ZERO TS2353 diagnostics).
- **F-W1-5 (LOW, spec-gap)** — `vector-boot.ts` `warmUpEmbeddingProvider`
  constructed `createEmbeddingProvider(config)` OUTSIDE the try: a
  present-but-invalid config (e.g. openai without `apiKey`) threw UNWRAPPED
  instead of the pinned class-2 wrap. Fixed: the construction moved INSIDE the
  try — ANY warm-up failure (construction or embed) rejects `vector boot
  warm-up: <underlying message>` + logs the `vector boot: warm-up failed`
  milestone once. Regression-tested (`tests/vector-boot-adversarial.test.ts`
  "A-F-W1-5").

**W2 (RCA-3, 2026-09-05 — the MANDATORY post-W2 adversarial pass; 6 findings:
4 HOST code findings in `src/main/embeddings.ts` + 2 spec-only; nothing
package/upstream — nothing went to `docs/defects.md`/`docs/HANDOFF.md`. The
HOST findings were fixed RED-FIRST + regression-tested in
`tests/embeddings-adversarial.test.ts`, describe "W2 adversarial regression
(F-W2-1..F-W2-5)" — 10 tests; red set 9 failing | 14 passing (13 pre-existing
+ 1 guard), green 23/23):**

- **F-W2-1 (MEDIUM)** — zero-length vectors passed F6/F7 (`[].every` is
  vacuously true): a provider's first zero-length vector latched
  `dimension = 0` (every later vector then rejected — a provider BRICK), and
  `createVectorIndex` stored an `[]` vector (a later `cosineSimilarity` call
  throws `dimension mismatch` — an index POISON). Fixed: (a) BOTH providers'
  per-vector validation rejects `vec.length === 0` as `... malformed
  response`; (b) validate-then-commit — ALL vectors of a response are
  validated BEFORE any dimension state is committed (a malformed later
  vector leaves no earlier latch); (c) `createVectorIndex`'s
  `dimension === 0` sentinel replaced with an explicit `dimensionSet`
  boolean, and zero-length vectors rejected there too with the PINNED
  message `createVectorIndex: malformed response (zero-length vector)`.
  Regression-tested ("F-W2-1 provider brick…", "F-W2-1 index poison…",
  "F-W2-1 validate-then-commit…").
- **F-W2-2 (MEDIUM)** — the batch build was monolithic (16,840 nodes → ONE
  request; budget 16,840 × timeoutMs ≈ 23.4 h; one bad batch re-embedded
  ALL texts per-item; N × timeoutMs > 2^31-1 hit Node's setTimeout 1 ms
  clamp → a spurious instant timeout). Fixed: (a) the batch loop is CHUNKED
  — module-level `export const BATCH_CHUNK_SIZE = 64` texts per request
  (the last chunk may be short), with per-CHUNK fallback isolation (a
  rejected/misaligned chunk falls back per-item for exactly that chunk's
  texts); (b) `fetchWithTimeout` clamps the budget to
  `Math.min(budget, 2147483647)` (the clamped budget is the reported
  timeout). The §5.8 #39 assertions (union of texts in node order, ≥ 1
  call) stay green under chunking. Regression-tested ("F-W2-2
  BATCH_CHUNK_SIZE…", "F-W2-2 chunk count… 130 nodes → 3 batch calls of
  64/64/2…", "F-W2-2 per-chunk fallback isolation…", "F-W2-2 budget
  clamp…").
- **F-W2-3 (MEDIUM, spec-only — Architect decision; NO code change)** — the
  batch seam had no production caller (§5.12's wiring text was unassigned).
  Resolved in §5.12 (the F-W2-3 amendment note there): W3 owns the
  production wiring `embedBatchFn: provider.embedBatch` at controller
  creation (main.ts); the §5.2 sequential-default expression is pinned at
  that wiring.
- **F-W2-4 (LOW)** — `embedBatch` input validation was missing (asymmetric
  with the single-text `text must be a string` guard). Fixed: a non-array
  input or any non-string item → `<prefix> embed: batch texts must be an
  array of strings` (ollama + remote). Empty-string items remain VALID
  (live-verified aligned — §5.2). Regression-tested ("F-W2-4 embedBatch
  input validation…").
- **F-W2-5 (LOW)** — `timeoutMs` was unvalidated on the direct-options path
  (`{timeoutMs: -5}` → instant spurious timeouts). Fixed: at BOTH provider
  constructions `timeoutMs` when present must be a positive integer within
  the setTimeout ceiling (≤ 2147483647 — so `{timeoutMs: 1e12}` also
  throws), else `createOllamaEmbedProvider: timeoutMs must be a positive
  integer` / `createRemoteEmbedProvider: timeoutMs must be a positive
  integer` (undefined keeps the 5000 default; env-parsed values are
  pre-validated by `parsePositiveIntEnv` — unchanged). Regression-tested
  ("F-W2-5 timeoutMs validation…", "F-W2-5 timeoutMs undefined keeps the
  5000 default…").
- **F-W2-6 (LOW, doc-only; NO code change)** — a caller-supplied
  `embedBatchFn` that never settles hangs the build (the engine stays
  pending — the F1 discipline); the provider's own `embedBatch` is bounded
  by the per-text budget — callers are trusted to settle. Covered by the
  §5.3 caller-trust-boundary note below.

**W3 (RCA-3 pass 2, 2026-09-05 — the mandatory post-W3-green adversarial
pass; 7 findings: 2 HOST code fixes (F1, F3), 1 hygiene (F5), 4 pins/records
(F2, F4, F6, F7); nothing package/upstream — nothing went to
`docs/defects.md`/`docs/HANDOFF.md`. The code findings were fixed RED-FIRST +
regression-tested in `tests/embeddings-failure-policy.test.ts`, describe
"W3 adversarial regression (RCA-3 pass 2: F1/F3 fixes + F2/F4/F6 pins)" —
6 tests; red set 2 failing (F1, F3) | 19 passing (the 15 pre-existing + the
4 green-on-arrival pins F2/F4/F6a/F6b), green 21/21):**

- **F1 (MEDIUM)** — a node deleted while 'transient'/'empty'-skipped left a
  STALE skipped entry forever: the `onStoreChanged` hook's delete branch ran
  only when the id was still in `index.nodeIds` — a skipped (unindexed) id
  never matched, so its `skipped` record outlived the node (violating §5.3
  "a successful re-embed (or a delete) removes the entry"). Fixed: the
  hook's delete branch calls `removeFromVectorIndex(index, nodeId)`
  UNCONDITIONALLY (it no-ops for unknown ids and clears any skipped entry).
  Regression-tested ("F1: a node DELETED while transient-skipped…").
- **F2 (LOW, Architect-decided — taxonomy registration; spec + test only,
  NO code change)** — provider-channel malformed/dimension rejections ARE
  transient-classified under the W3 flip: a systematic post-warm-up
  malformation (e.g. EVERY node embed rejecting `dimension mismatch`) → an
  ALL-transient build → the build RESOLVES with an empty index
  (`embedded 0`) → the empty-index promotion with a LOUD census
  (`skipped empty 0 / transient N`, §5.8 #34 empty-ranked semantics: every
  node is omitted from the scored set, `ranked` is empty — re-pinned
  2026-09-05 with §5.4's F-SCORE fix). This is the PINNED design — boot
  resilience over loud abort. The index-level RESOLVED-vector checks
  (zero-length, F6 on a resolved bad vector) remain HARD rejections.
  Regression-tested ("F2 taxonomy (§3a): a systematic post-warm-up
  dimension-mismatch rejection…").
- **F3 (LOW, spec-gap)** — `index.dimension` never latched on the
  maintenance paths for an index promoted at dimension 0 (the post-outage
  standard shape): `addToVectorIndex`'s success path skipped the F6 check
  when `index.dimension === 0` and never latched, so a later wrong-length
  vector silently poisoned the index. Fixed: the add success path latches
  `index.dimension = vec.length` when the dimension is 0 (subsequent
  wrong-length adds then reject with the F6 message); the
  `updateVectorIndex` success path latches too. Regression-tested ("F3: an
  index at dimension 0…").
- **F4 (LOW, doc drift)** — §5.12 pinned `vector boot: node embed failed
  (transient): …` but the code logs `vector index: node embed failed
  (transient): <nodeId> <error>` (the log site is the INDEX layer,
  outside boot). Fixed: §5.12 re-pinned to the `vector index:` prefix;
  string-asserted in the W3 test file ("F4: the transient-skip warning
  carries the re-pinned prefix…").
- **F5 (LOW, hygiene)** — dead import `removeFromVectorIndex` in
  `src/main/vector-boot.ts` (the controller stopped calling it when the W3
  build collapsed into `createVectorIndex`). Dropped.
- **F6 (LOW, coverage)** — two previously-unasserted W3 behaviors, pinned in
  the W3 test file: (a) the BATCH build path's 'empty' record
  (`embedBatchFn` over `[content, '', content]` → `skipped.get('n2') ===
  'empty'`; the empty text is never batched); (b) the double-failure
  fallback (a chunk rejects → the per-item fallback ALSO rejects per text →
  each text transient-skipped, the build resolves).
- **F7 (INFO — count reconciliation)** — the failure-policy file carried 15
  tests before this pass (21 after: +6), not 13 as an earlier note claimed;
  the W3 re-pin comprises 5 sites — 2 in `tests/embeddings.test.ts` (the
  build/maintenance skip+resolve block and the hook-path block, §5.9 #46)
  and 3 in `tests/vector-boot.test.ts` (the three total-failure tests
  reshaped onto the non-embed store-failure trigger via the shared RE-PIN
  helper).

**W4 (RCA-3, 2026-09-05 — the MANDATORY post-W4-green adversarial pass; 3 code
findings (the pass's short labels F1/F3/F4, registered here as F-W4-1..F-W4-3)
+ 5 INFO registrations (F-W4-4..F-W4-8); all HOST findings in `src/main/`,
nothing package/upstream — nothing went to `docs/defects.md`/`docs/HANDOFF.md`.
The code findings were fixed RED-FIRST + regression-tested in
`tests/vector-cache.test.ts` — the R-series written red-first (red run 5
failing), green 8/8, the file growing 27 → 35 tests (R1–R8; see the Unit W4
DONE row in `docs/next-steps.md`):**

- **F-W4-1 (HIGH)** — the original write-through issued a WHOLE-MAP
  synchronous write per `set()`: an N-node cold boot serialized the whole map
  N times (O(n²) byte amplification over the build — write i carries i+1
  entries) with every write landing on the main thread → main-thread freezes
  during the build. Fixed: the COALESCING write queue — `set()` mutates the
  in-memory map, marks a dirty flag, and schedules AT MOST ONE trailing
  whole-map write on the module-level `CACHE_WRITE_DEBOUNCE_MS = 500`
  debounce (exported from `src/main/vector-cache.ts`); the pending write
  executes with the map state AT EXECUTION TIME (later sets need no new job),
  `flush()` cancels the pending timer + forces the write when dirty (the
  drain-before-report pin holds), and the single-writer serialization, atomic
  temp+rename, never-awaited timing, and non-fatal recovery are unchanged.
  Registered in §5.13 as the "RCA-3 F1 amendment". Regression-tested
  (`tests/vector-cache.test.ts` R1 — 25 synchronous set()s + flush() → exactly
  ONE whole-map write, the file holding all 25 entries; R2 — the exported
  constant pinned to 500).
- **F-W4-2 (LOW)** — the load-failure log interpolated the RAW error: a V8
  JSON SyntaxError quotes ~30 chars of the corrupt file head — attacker-chosen
  bytes straight into the main-process log. Fixed: the interpolated error is
  SANITIZED (every double-quoted snippet stripped) before logging; the pinned
  `vector cache: load failed (treating as empty): ` PREFIX is unchanged.
  Regression-tested (R3 — a marker string in quotes in a corrupt body never
  reaches the log).
- **F-W4-3 (LOW)** — no special-file guard at either path: a symlink/FIFO/
  device at the cache path was read through, a symlink at the tmp path was
  written through, and a FIFO open would block the main thread forever. Fixed:
  lstat REGULAR-FILE guards (never follow links, never open) at BOTH the load
  path and the write/`<path>.tmp` paths — a non-regular file is a load failure
  (the pinned empty-cache log) / the pinned non-fatal write skip — and the tmp
  file is created mode `0o600`. Regression-tested (R4 symlink-at-path load;
  R7 symlink-at-tmp write; R8 FIFO-at-path never hangs; R5/R6 the
  directory-at-path load/write cases).
- **F-W4-4 (INFO, census)** — the `cacheHits` census is DEDUPED by
  contentHash: the W2 per-chunk fallback re-looks-up a rejected batch's texts
  through the SAME wrapper, and identical-content nodes adopt ONE entry —
  each distinct adopted text counts EXACTLY ONCE. §5.12's `cacheHits` field
  is re-pinned accordingly ("distinct embedded texts adopted … deduped by
  contentHash"); regression-tested (the W4 greens DEDUPE scenario).
- **F-W4-5 (INFO, concurrency)** — the cache assumes the module-store
  ONE-WRITER model: multi-instance/cross-process writers on the SAME
  `provident-vector-cache.json` (two app instances, or a foreign process)
  would last-wins race whole-map writes. Out of scope (single-instance
  Electron app; the SINGLE-WRITER-STORE contract) — noted as the documented
  one-writer assumption.
- **F-W4-6 (INFO, quit-time)** — there is NO quit-time flush hook: quitting
  mid-build (inside the 500 ms debounce window, before the drain) drops the
  trailing write — those texts re-embed on the next boot. RE-EMBED ECONOMICS
  ONLY (the in-memory index and the promotion are unaffected; the cache is an
  optimization surface, never a correctness surface).
- **F-W4-7 (INFO, invalidation scope)** — invalidation is hash+tuple keyed
  ONLY: an entry whose (kind, model, dimension, contentHash) matches but whose
  VECTOR is wrong (a poisoned entry, however it came to be) is served as a
  hit. The invalidation paths are deleting the cache file (a fresh full
  embed) or changing the model/dimension tuple (pinned as a §5.13 sentence).
- **F-W4-8 (INFO, unreachable)** — `prune()` before ANY get()/set() traffic
  would skip the foreign-tuple filter (`currentTuple` latches from traffic):
  unreachable in the wired flow — the controller only prunes after a build
  whose wrapper traffic latched the tuple. Noted for any future
  direct-prune caller.

**W5 (RCA-3, 2026-09-05 — the MANDATORY post-W5-green adversarial pass, TWO
passes: pass 1 found F-W5-1..F-W5-3 and was re-run (pass 2) after the
Architect ruling re-shaped the F-W5-1 fix; the live-embed cache unit — the
user-directed follow-up to the completed W4 cache, "live upload should also
update the cache". 6 findings: 3 HOST code fixes (F-W5-1 MEDIUM;
F-W5-2/F-W5-3 LOW) + 3 INFO registrations (F-W5-4..F-W5-6); all HOST findings
in `src/main/`, nothing package/upstream — nothing went to
`docs/defects.md`/`docs/HANDOFF.md`. The code findings were fixed RED-FIRST +
regression-tested in `tests/live-embed-cache.test.ts` — the R-series written
red-first (red run 6 failing: R1–R5 + the RE-PINNED L4 tail, whose original
"query misses write through" assertion was SUPERSEDED by the F-W5-1 ruling —
its HTTP-call pins kept verbatim), green 15/15 (the file's 15 tests:
L1–L7 + R1–R5; the initial pre-fix red set was 9 failing + 1
green-on-arrival guard L5):**

- **F-W5-1 (MEDIUM)** — the exported memoizer PERSISTED query-embed misses:
  every `score`/`place` query miss wrote through to the persisted cache →
  UNBOUNDED inter-prune growth (prune runs only at promotion, so query-hash
  entries matching no store node accumulated until the next boot), whole-map
  main-thread writes triggered by QUERY traffic, and query-hash disk
  retention (queries are ephemeral, not node content). Fixed per the
  Architect ruling: in-memory-only adoption for query misses — the memoizer
  is built `persistMisses: false` (the DEFAULT) and a MAINTENANCE embed opts
  in per call with `{ persist: true }` (the query path calls `embed(text)`
  bare → session-scoped adoption; only node-content embeds write through —
  the disk cache holds node-content vectors only). Registered in §5.13 as
  the "RCA-3 pass-2 amendment". Regression-tested
  (`tests/live-embed-cache.test.ts` R1 — a query-only session leaves a
  pre-seeded file BYTE-UNCHANGED and the VectorCache map clean; R2 — a
  query-only session NEVER CREATES the cache file, before AND after the
  coalescing window; R3 — the maintenance-vs-query persist contrast in ONE
  session; plus the re-pinned L4 tail).
- **F-W5-2 (LOW)** — the memoizer latched the provider's `dimension` at
  CREATION time: a cold auto-detect provider (dimension 0 until its first
  embed) was PERMANENTLY hit-ineligible (every live `get` keyed dimension 0 →
  a miss → a re-embed) while its misses wrote entries it could never hit.
  Fixed: the hit-check dimension is read PER EMBED from the live provider
  object (the boot wrapper's `keyDimension()` shape) — hit-eligible as soon
  as the first embed latches the dimension. Regression-tested (R4 — a
  getter-backed latching double: the second identical-text embed is a HIT,
  exactly ONE provider embed total).
- **F-W5-3 (LOW)** — the exported memoizer accepted a non-string text and
  passed it to the hash helper → a raw crypto TypeError (inconsistent with
  every provider's `<prefix> embed: text must be a string` guard). Fixed:
  the input guard fires BEFORE hashing with the PINNED message
  `cache memoizer: text must be a string`. Regression-tested (R5).
- **F-W5-4 (INFO, failure-class asymmetry)** — the poison-HIT class: a
  wrong-length cached entry (constructible only out-of-contract via a direct
  `set()`; §5.13's F-W4-7 limitation) is SERVED as a hit and fails the
  index-layer F6 dimension check OUTSIDE the embed try/catch → the hook
  REJECTS (caught + logged non-fatal at the four reconcile call sites — the
  two `IPC_EDIT_*` handlers + the rich-commit handler's reconcile wrapper in
  `src/main/main.ts`, and the MCP edit-tool wiring in
  `src/main/mcp-server.ts`), NOT a W3 transient skip — the pinned
  hit-served/prune-invalidation posture applies. Recorded verbatim in the
  greens POISON-HIT scenario:
  `updateVectorIndex: dimension mismatch (expected 4, got 3)`.
- **F-W5-5 (INFO, note-only)** — an in-flight single-text dedup (coalescing
  concurrent identical misses) was considered and NOT approved — note-only,
  unpinned (no code change, no test).
- **F-W5-6 (INFO, doc-only)** — §5.5's `VectorEmbedderOptions` code block
  omitted the live `cache?` field (the blind-greens DOC DRIFT finding) —
  fixed by the W5 doc review (the field + doc-comment + the §5.5 W5
  amendment note added below, 2026-09-05).

## 4. Design decisions pinned by this spec

- **ASYNC-EMBEDDER-AMENDMENT (CRITICAL — a Unit E contract amendment):** the
  `Embedder` interface is amended to ASYNC: `score(query, nodes):
  Promise<ScoredNode[]>` and `place(content, nodes, edges):
  Promise<PlacementDecision>`. Rationale: a vector embedder must compute the
  query embedding via an async provider call, and the interface takes the
  query STRING (so pre-computing the embedding elsewhere would change the
  interface shape anyway — the embedder must receive the query to embed it).
  Async is the natural fit for a network-backed embedder. The lexical embedder
  (Unit E) wraps its synchronous computation in a resolved promise (a trivial
  change). This amendment ripples through the retrieval stack: `selectTopK`,
  `retrieve`, `RetrievalEngine.query`, `RetrievalEngine.onStoreChanged`, the
  `rag.query` MCP handler, and the `rag-query` IPC all become async. **Unit E
  tests must be updated** (the lexical embedder's `score`/`place` now return
  promises; the retrieval stack is async).
- **PROVIDER-AGNOSTIC (the binding decision, 2026-08-27):** the vector embedder
  is provider/model AGNOSTIC — NOT hardcoded to one provider/model. It is
  configurable to point at ANY provider — local (ollama `embeddinggemma`) OR
  remote/cloud — via config settings for the required inputs (model URL, API
  keys, model name, embedding dimension, etc.). The `Embedder` interface
  (Unit E) is the seam; the vector embedder (Unit F) is a configurable
  provider, with ollama `embeddinggemma` as ONE concrete config and
  remote/cloud providers as others. **Security implication:** supporting
  remote/cloud providers means network egress IS in scope — the `connect-src`
  CSP allowlist + API-key handling become a DESIGNED security surface (§5.7).
- **EMBEDDING-PROVIDER-ABSTRACTION:** an `EmbeddingProvider` interface +
  `EmbeddingProviderConfig` config shape (§5.2). The config is the ONLY thing
  that differs between providers; the retrieval engine uses the passed embedder
  (Unit E F2) unchanged. `createEmbeddingProvider(config)` dispatches on
  `config.provider`: `'ollama'` → the local ollama provider; any other kind →
  the remote/cloud provider.
- **OLLAMA-EMBEDDINGGEMMA-PROVIDER (ONE concrete config):** the ollama
  `embeddinggemma` model is the LOCAL vectorization backend — a localhost HTTP
  call to ollama's embeddings endpoint (`POST http://127.0.0.1:11434/api/embed`).
  Local-first, NO external network egress. It is ONE concrete provider config,
  not the only one.
- **REMOTE-CLOUD-PROVIDER-SUPPORT:** remote/cloud providers (e.g. OpenAI,
  Cohere) are drop-ins via the SAME `EmbeddingProvider` interface + config
  (different config: model URL, API key, model name). A remote/cloud provider
  requires the `connect-src` CSP allowlist + API-key handling (§5.7).
- **VECTOR-INDEX-MAINTAINED:** a vector index (node id → embedding vector) is
  built by calling the provider once per node (at index build) and maintained
  incrementally on store change (content edit → re-embed; structural add →
  embed; structural delete → remove), mirroring the lexical index maintenance.
- **COSINE-SIMILARITY-SCORING:** the vector embedder scores each node by cosine
  similarity between the query embedding and the node's embedding (range
  [-1, 1]); deterministic tie-breaking by node id ascending (matching Unit E).
- **MOCK-AND-INTEGRATION-TESTABILITY:** a deterministic mock embedder (no
  provider dependency) for unit tests AND a real-ollama integration test path
  (the test environment) that exercises the actual `embeddinggemma` model,
  gated/skipped when ollama is unavailable, AND a MOCKED remote/cloud provider
  test path (no live remote call in the test suite — no network egress in CI).
- **LOCAL-SECURITY-POSTURE:** the ollama call is a localhost HTTP request
  (local, no external egress) — it does NOT require a `connect-src` CSP
  allowlist for a declared network. The provider is main-process-only,
  localhost-pinned, opt-in via config.
- **REMOTE-SECURITY-POSTURE:** a remote/cloud provider requires the `connect-src`
  CSP allowlist for the declared network (the provider's baseUrl origin must be
  in the allowlist) + API-key handling (stored in config, sent as an
  Authorization bearer header, never logged, never exposed to the renderer,
  never sent to a non-allowlisted origin). The provider is main-process-only,
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
 *  embedding via an async provider call. */
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

### 5.2 The embedding provider abstraction + config (provider/model agnostic)

The vector embedder is a **configurable provider** — NOT hardcoded to ollama.
The `EmbeddingProvider` interface is the provider abstraction; the
`EmbeddingProviderConfig` is the config shape. ollama `embeddinggemma` is ONE
concrete provider config (the local test environment); remote/cloud providers
(OpenAI, Cohere, etc.) are drop-ins via the SAME interface + config.

```ts
// src/main/embeddings.ts (project-specific; pure + async; no Electron — the
// HTTP call is a plain fetch to the configured endpoint).

/** The embed function: text → embedding vector. ASYNC. */
export type EmbedTextFn = (text: string) => Promise<number[]>

/** The embedding provider config — the ONLY thing that differs between
 *  providers. The vector embedder is constructed from this config; the
 *  retrieval engine uses the passed embedder (Unit E F2) unchanged. */
export interface EmbeddingProviderConfig {
  /** The provider kind. 'ollama' is the local test environment (localhost);
   *  remote/cloud providers ('openai', 'cohere', ...) are drop-ins via the
   *  same interface + config. */
  provider: 'ollama' | 'openai' | 'cohere' | string
  /** The model URL / endpoint base. For ollama, the localhost base URL
   *  (default 'http://127.0.0.1:11434'). For a remote/cloud provider, the
   *  cloud endpoint (e.g. 'https://api.openai.com/v1'). */
  baseUrl: string
  /** The model name (e.g. 'embeddinggemma' for ollama; a cloud model id). */
  model: string
  /** The API key. REQUIRED for remote/cloud providers; optional/absent for
   *  local ollama (no credentials sent). */
  apiKey?: string
  /** The expected embedding dimension. Default undefined = auto-detect from the
   *  model's first response (validated for consistency across all vectors). */
  dimension?: number
  /** The HTTP request timeout in ms. Default 5000. */
  timeoutMs?: number
  /** F9 — an optional EXTENSION to the default `connect-src` CSP allowlist
   *  (hostnames) for a remote/cloud provider. The default safe set is always
   *  included (fail-closed); this only ADDS hostnames. */
  connectSrc?: string[]
}

/** The provider abstraction — a configurable embedding provider. A remote/cloud
 *  provider is a drop-in (same interface, different config). */
export interface EmbeddingProvider {
  /** The provider kind (config.provider). */
  readonly kind: string
  /** The configured model name (config.model). */
  readonly model: string
  /** The configured base URL (config.baseUrl). */
  readonly baseUrl: string
  /** The embedding dimension (auto-detected from the first embed, or the
   *  configured dimension). */
  readonly dimension: number
  /** Embed a single text → embedding vector. ASYNC. */
  embed(text: string): Promise<number[]>
  /** W2 (2026-09-05 amendment) — OPTIONAL batch member: embed several texts
   *  in ONE provider request, preserving positional order (result[i] is the
   *  vector for texts[i]). Implemented by BOTH concrete providers; callers
   *  without a batch need use the sequential per-item default
   *  (`provider.embedBatch ?? per-item embed()` — §5.2 "Batch seam").
   *  Interface members: 5 → 6 (§5.10). */
  embedBatch?(texts: string[]): Promise<number[][]>
}

/** Create the embedding provider from a config. Dispatches on config.provider:
 *  'ollama' → the local ollama provider; any other kind → the remote/cloud
 *  provider. */
export function createEmbeddingProvider(config: EmbeddingProviderConfig): EmbeddingProvider
```

**`createEmbeddingProvider(config)` dispatch:**

- `config.provider === 'ollama'` → `createOllamaEmbedProvider({ baseUrl:
  config.baseUrl, model: config.model, timeoutMs: config.timeoutMs, dimension:
  config.dimension })` (the local test environment).
- Any other `config.provider` (e.g. `'openai'`, `'cohere'`) →
  `createRemoteEmbedProvider({ baseUrl: config.baseUrl, model: config.model,
  apiKey: config.apiKey, dimension: config.dimension, timeoutMs:
  config.timeoutMs, kind: config.provider, connectSrc: config.connectSrc })`
  (a remote/cloud provider — a drop-in).

**The ollama concrete provider (ONE concrete config — the local test
environment):**

```ts
export interface OllamaEmbedOptions {
  /** The ollama base URL. Default 'http://127.0.0.1:11434'. MUST be a
   *  localhost/loopback address (LOCAL-SECURITY-POSTURE — §5.7). */
  baseUrl?: string
  /** The ollama model name. Default 'embeddinggemma'. */
  model?: string
  /** The HTTP request timeout in ms. Default 5000. */
  timeoutMs?: number
  /** The expected embedding dimension. Default undefined = auto-detect from the
   *  model's first response (validated for consistency across all vectors). */
  dimension?: number
}

/** Create the ollama embed provider — ONE concrete provider config (the local
 *  test environment). The returned provider embeds a single text via a
 *  localhost HTTP POST to ollama's embeddings endpoint. */
export function createOllamaEmbedProvider(opts?: OllamaEmbedOptions): EmbeddingProvider
```

**Ollama request/response shape (the `POST {baseUrl}/api/embed` endpoint):**

- **Request:** `POST {baseUrl}/api/embed` with a JSON body
  `{ model: <model>, input: <text> }` (a single string input). No auth header
  (no credentials sent — LOCAL-SECURITY-POSTURE).
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

**The remote/cloud concrete provider (a drop-in via the SAME interface):**

```ts
export interface RemoteEmbedOptions {
  /** The cloud endpoint base URL (e.g. 'https://api.openai.com/v1'). */
  baseUrl: string
  /** The cloud model id. */
  model: string
  /** The API key (REQUIRED — sent as an Authorization bearer header). */
  apiKey: string
  /** The expected embedding dimension. Default undefined = auto-detect. */
  dimension?: number
  /** The HTTP request timeout in ms. Default 5000. */
  timeoutMs?: number
  /** The provider kind (config.provider) — surfaced as `EmbeddingProvider.kind`.
   *  Defaults to 'remote'. F8 — the request/response shape is dispatched on
   *  this kind ('cohere' → `{ model, texts }` / `embeddings[0]`; any other →
   *  the OpenAI-shaped `{ model, input }` / `data[0].embedding`). */
  kind?: string
  /** F9 — an optional EXTENSION to the default `connect-src` CSP allowlist
   *  (hostnames). The default safe set is always included (fail-closed). */
  connectSrc?: string[]
}

/** Create a remote/cloud embed provider — a drop-in behind the SAME
 *  EmbeddingProvider interface (different config: model URL, API key, model
 *  name). The exact request/response body is provider-specific; the interface
 *  contract (auth header, error handling, dimension validation) is pinned
 *  here. */
export function createRemoteEmbedProvider(opts: RemoteEmbedOptions): EmbeddingProvider
```

**Remote/cloud request/response contract:**

- **Request:** an HTTP POST to the configured `baseUrl` with the model name and
  the text to embed. The exact body shape is provider-specific (e.g. OpenAI's
  `{ model, input }`; Cohere's `{ model, texts }`). The provider MUST send the
  API key as an `Authorization: Bearer <apiKey>` header (REMOTE-SECURITY-POSTURE
  — §5.7).
- **Response (2xx):** the provider parses the provider-specific response into
  the single embedding vector for the input. The exact field is
  provider-specific (e.g. OpenAI's `data[0].embedding`; Cohere's
  `embeddings[0]`).
- **Dimension:** same auto-detect/validate rule as ollama (§5.2).
- **Determinism note:** the provider does NOT add randomness; the model output
  is deterministic for the same input + model + server state.

**The batch seam (W2, 2026-09-05 amendment — review A5):**

- **Both concrete providers implement `embedBatch`.** Request shapes (the
  plural form of each single-text request):
  - **ollama:** `POST {baseUrl}/api/embed` with `{ model, input: [t1..tn] }` →
    the response `embeddings[i]` is the vector for `texts[i]` (positional
    order). LIVE-VERIFIED (review record §5 item 1, 2026-09-05): a 3-text
    input returns 3 ordered 768-dim vectors, and alignment holds even when a
    batch item is the empty string. The W2 request-shape test still pins this
    by test.
  - **OpenAI-shaped (the default remote kind):** the batch body is the OpenAI
    plural form; the response `data[i].embedding` is the vector for
    `texts[i]`.
  - **Cohere (`kind: 'cohere'`):** `{ model, texts: [t1..tn] }` → the response
    `embeddings[i]` is the vector for `texts[i]`.
- **Sequential default (PROVIDER-AGNOSTIC preserved):** `embedBatch?` is
  OPTIONAL. Any caller without a batch need uses the sequential per-item
  default: `provider.embedBatch ?? ((texts) => Promise.all(texts.map((t) =>
  provider.embed(t))))`. The mock embedder (and any test double exposing only
  `embed`) passes through this default UNCHANGED — W2 requires no mock
  change.
- **Alignment invariant:** the batch response MUST satisfy
  `vectors.length === texts.length` (1:1 positional alignment) or the WHOLE
  batch is REJECTED — `Error('ollama embed: batch alignment mismatch
  (expected <n> vectors, got <m>)')` (ollama) / `Error('remote embed: batch
  alignment mismatch (expected <n> vectors, got <m>)')` (remote/cloud) — and
  the CALLER re-embeds exactly that batch's texts via the per-item `embed()`
  fallback (a rejected batch never assigns vectors positionally). [The
  alignment message text is SpecWriter-pinned 2026-09-05 — the review pins
  the invariant, not the string.]
- **Per-vector validation (F6/F7 extended to batches):** every in-batch
  vector is validated exactly as a single embed — every element a finite
  number (F7; else `... malformed response`) and length === the
  configured/auto-detected dimension (F6; else `... dimension mismatch
  (expected <n>, got <m>)`). Dimension auto-detect uses the FIRST in-batch
  vector.
- **Timeout = a PER-TEXT server-time budget:** a batch of N texts gets
  `N × timeoutMs` TOTAL (a single-text embed keeps exactly `timeoutMs`); the
  timeout message is byte-identical in shape to §5.9 #8/#14 — `ollama embed:
  timeout after <N × timeoutMs>ms` / `remote embed: timeout after <N ×
  timeoutMs>ms`. On expiry the in-flight fetch is ACTUALLY ABORTED via
  `AbortController` (the aborted fetch's rejection is swallowed — the timeout
  error is the one thrown; no unhandled rejection). This replaced the pre-W2
  `Promise.race` abandonment (the fetch kept running after the race lost —
  `src/main/embeddings.ts:128-149,232-254` pre-W2 line numbers; the
   AbortController rewrite itself LANDED with W2); the single-text `embed()` gains
  the same AbortController abort (same message shape, no orphaned request).
- **Index-build wiring:** `createVectorIndex` gains the batch fn as an
  OPTIONAL THIRD param — `createVectorIndex(nodes, embedFn, embedBatchFn?)`
  (§5.3). Existing two-arg calls (tests/mocks) are UNCHANGED. The per-node
  `updateVectorIndex`/`addToVectorIndex` embed exactly ONE node each and keep
  the per-item `embed()` path (their signatures are unchanged by W2 — the
  W2/W3 handoff, review A6, keeps the §5.3/§5.9 reject-propagation contract
  green until W3 re-pins it).

**Error handling (documented fail-states):**

- `createEmbeddingProvider` with a null/undefined `config` → throws
  `Error('createEmbeddingProvider: config required')`.
- `createEmbeddingProvider` with a missing/empty `config.baseUrl` → throws
  `Error('createEmbeddingProvider: baseUrl required')`.
- `createEmbeddingProvider` with a missing/empty `config.model` → throws
  `Error('createEmbeddingProvider: model required')`.
- `createOllamaEmbedProvider` with a `baseUrl` that is NOT a localhost/loopback
  address (not `127.0.0.1`/`localhost`/`::1`) → throws
  `Error('createOllamaEmbedProvider: baseUrl must be localhost')` (the
  LOCAL-SECURITY-POSTURE — §5.7).
- `createRemoteEmbedProvider` with a missing/empty `apiKey` → throws
  `Error('createRemoteEmbedProvider: apiKey required')` (a remote/cloud
  provider REQUIRES an API key).
- A non-2xx HTTP response (ollama) → the returned promise REJECTS with
  `Error('ollama embed: HTTP <status>')`.
- A non-2xx HTTP response (remote/cloud) → the returned promise REJECTS with
  `Error('remote embed: HTTP <status>')`.
- A network failure (ollama down / connection refused / timeout) → the returned
  promise REJECTS with `Error('ollama embed: <message>')` (the underlying fetch
  error message).
- A network failure (remote/cloud) → the returned promise REJECTS with
  `Error('remote embed: <message>')`.
- A timeout (the request exceeds its per-text budget — `timeoutMs` for a
  single embed, `N × timeoutMs` for a batch of N, W2) → the returned promise
  REJECTS with `Error('ollama embed: timeout after <timeoutMs>ms')` (ollama) or
  `Error('remote embed: timeout after <timeoutMs>ms')` (remote/cloud), and the
  in-flight fetch is ABORTED via `AbortController` (W2 — no orphaned request).
- A batch alignment mismatch (`embedBatch` response vector count ≠ the input
  count) → the `embedBatch` promise REJECTS with
  `Error('ollama embed: batch alignment mismatch (expected <n> vectors, got <m>)')`
  (ollama) or `Error('remote embed: batch alignment mismatch (expected <n>
  vectors, got <m>)')` (remote/cloud); the caller falls back to per-item
  `embed()` for exactly that batch's texts (§5.2 "Batch seam").
- A malformed response (no embeddings array, or the expected vector field
  missing) → the returned promise REJECTS with
  `Error('ollama embed: malformed response')` (ollama) or
  `Error('remote embed: malformed response')` (remote/cloud).
- A dimension mismatch (against the configured/auto-detected dimension) → the
  returned promise REJECTS with
  `Error('ollama embed: dimension mismatch (expected <n>, got <m>)')` (ollama)
  or `Error('remote embed: dimension mismatch (expected <n>, got <m>)')`
  (remote/cloud).
- A non-string `text` → the returned promise REJECTS with
  `Error('ollama embed: text must be a string')` (ollama) or
  `Error('remote embed: text must be a string')` (remote/cloud).
- A remote/cloud `baseUrl` whose origin is NOT in the `connect-src` CSP
  allowlist → the returned promise REJECTS with
  `Error('remote embed: baseUrl not in connect-src allowlist')` (the
  REMOTE-SECURITY-POSTURE — §5.7).
- **W2 adversarial fail-states (F-W2-1/-2/-4/-5, 2026-09-05):** a
  zero-length vector → `<prefix> embed: malformed response` (never latches
  dimension 0; `createVectorIndex` rejects the PINNED
  `createVectorIndex: malformed response (zero-length vector)`); the batch
  timeout budget is clamped to `Math.min(N × timeoutMs, 2147483647)` (the
  setTimeout ceiling); `embedBatch` with a non-array input or any
  non-string item → `<prefix> embed: batch texts must be an array of
  strings` (empty-string items remain VALID); a `timeoutMs` option that is
  not a positive integer ≤ 2147483647 →
  `createOllamaEmbedProvider: timeoutMs must be a positive integer` /
  `createRemoteEmbedProvider: timeoutMs must be a positive integer`. The
  batch build chunks its requests at `BATCH_CHUNK_SIZE = 64` texts (§5.3).

### 5.3 The vector index

The maintained node-id → embedding map, built by calling the provider once per
node (at index build) and maintained incrementally on store change (mirroring
the lexical index — Unit E §5.1). The index is provider-agnostic — it takes an
`EmbedTextFn` (the provider's `embed`), so it works with ANY provider.

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
  /** W3 (2026-09-05 amendment) — the skipped-node record:
   *  nodeId → 'empty' (a by-design PERMANENT skip — empty/whitespace content,
   *  UNIT-F-SKIP-EMPTY) | 'transient' (a retryable per-node embed failure).
   *  A skipped node is NOT in `nodeIds`/`embeddings` (omitted from the scored set — §5.4, re-pinned 2026-09-05);
   *  an update-to-empty skip therefore ALSO removes the id from `nodeIds`
   *  (AMENDMENT-REVIEW note 6, 2026-09-05 — the invariant wins).
   *  A successful re-embed (or a delete) removes the entry.
   *  Interface members: 3 → 4 (§5.10). */
  skipped: Map<string, 'empty' | 'transient'>
}

/** Build the index from a node list (boot). Embeds each node's content once.
 *  ASYNC. W2 (2026-09-05 amendment): `embedBatchFn?` is the OPTIONAL third
 *  param (the provider's `embedBatch`) — when supplied, the build embeds the
 *  non-empty contents in batch requests; omitted (ALL existing calls and
 *  tests) → the sequential per-item embed, unchanged. */
export function createVectorIndex(nodes: RagNode[], embedFn: EmbedTextFn, embedBatchFn?: (texts: string[]) => Promise<number[][]>): Promise<VectorIndex>
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

- `createVectorIndex(nodes, embedFn, embedBatchFn?)` — embeds each node's
  `content` once (in `nodes` order), stores `nodeId → embedding`, sets
  `dimension` from the first embed (or the configured dimension). `nodeIds` =
  the node ids in `nodes` order.
- **UNIT-F-SKIP-EMPTY — the empty-content guard (F10, 2026-09-05 amendment):**
  a node whose `content` is not a string or is empty/whitespace is NEVER
  embedded (ollama returns `{ embeddings: [] }` for an empty input, which the
  embed fn rejects as `malformed response`): the node is recorded in
  `index.skipped` with `'empty'` and left out of `nodeIds`/`embeddings`. The
  guard applies to ALL THREE embed paths:
  - `createVectorIndex` (build): the empty node is skipped (as today, plus the
    `skipped` record — `src/main/embeddings.ts:545-549` post-W2; `309-313` pre-W2).
  - `addToVectorIndex` (empty content): the node is NOT added (NO embed call);
    `skipped.set(id, 'empty')`. [NEW — `src/main/embeddings.ts:591-606` post-W2 (`347-362` pre-W2) lacks
    the guard today.]
  - `updateVectorIndex` (content became empty): the node's embedding is
    REMOVED from the index (an empty node has no retrieval value — the same
    rule as the build) and `skipped.set(id, 'empty')`. [NEW —
    `src/main/embeddings.ts:573-587` post-W2 (`329-343` pre-W2) lacks the guard today (W3).]
  - An `'empty'` skip is BY-DESIGN PERMANENT (empty content is not a
    failure); it is re-classified only if the node's content later becomes
    non-empty (a normal `onStoreChanged` touch re-embeds it).
- **Batch build path (W2, F-W2-2 amended 2026-09-05):** when `embedBatchFn`
  is supplied, `createVectorIndex` embeds the non-empty node contents in
  CHUNKED batch requests — `BATCH_CHUNK_SIZE = 64` texts per request (the
  last chunk may be short), positional order preserved (the union of the
  chunk texts is exactly the non-empty contents in node order); a chunk
  alignment rejection falls back to per-item `embed()` for exactly THAT
  chunk's texts (§5.2 per-chunk fallback isolation). Per-vector F6/F7
  validation still runs on every vector, and a zero-length vector is
  rejected with `createVectorIndex: malformed response (zero-length
  vector)` (F-W2-1 — never stored, never used to latch the dimension).
  **Caller-trust boundary (F-W2-6):** a caller-supplied `embedBatchFn` that
  never settles hangs the build (the engine stays pending — the F1
  discipline); the provider's own `embedBatch` is bounded by the per-text
  budget — callers are trusted to settle.
- **Embed-failure policy (W3, 2026-09-05 amendment — review W3/A6):** a
  per-node embed rejection on ANY index-MAINTENANCE path (`createVectorIndex`
  build loop, `addToVectorIndex`, `updateVectorIndex`, the `onStoreChanged`
  hook) after the provider is reachable is NOT propagated: the node is
  recorded `skipped.set(nodeId, 'transient')`, a warning is logged, and the
  operation RESOLVES (the build continues). A transient skip on
  `updateVectorIndex` REPLACES the node's previous embedding with nothing
  (the node becomes unindexed — omitted from the scored set until a successful re-embed; the
  `skipped` map stays the authoritative "not currently indexed due to
  failure" record). A transient skip is RETRIED when the node is NEXT TOUCHED
  (`onStoreChanged` re-embeds only its passed nodeIds — the trigger is REAL,
  `src/main/embeddings.ts:718-729` post-W2; `452-463` pre-W2); a successful re-embed (or
  a delete — the hook's delete branch removes UNCONDITIONALLY, RCA-3 pass 2
  finding F1, so a node deleted while skipped leaves NO stale record) deletes
  the `skipped` entry. Never-edited
  transient skips are reported in the promotion census (§5.12).
  **Taxonomy (F2, RCA-3 pass 2, 2026-09-05 — Architect-decided):**
  PROVIDER-CHANNEL rejections (a malformed response / dimension mismatch
  thrown while EMBEDDING a text) are transient-classified like any per-node
  embed failure — a systematic post-warm-up malformation yields an
  ALL-transient build that RESOLVES and promotes an EMPTY index with a loud
  census (`skipped empty 0 / transient N`; §5.8 #34 empty-ranked semantics).
  This is the pinned design: boot resilience over loud abort. The
  INDEX-level checks on an already-RESOLVED vector (zero-length, F6 length
  mismatch) remain HARD rejections (the promise REJECTS — never a skip).
  **Unit handoff (A6):** this flip is a W3 contract change — W1/W2 keep the
  reject-propagation fail-state (below) green; W3 re-pins
  `tests/embeddings.test.ts:380-386` red→green.
- `updateVectorIndex(index, node, embedFn)` — the node must already be in the
  index (its `nodeId` in `index.nodeIds`). Re-embeds the node's new content,
  replaces its embedding. If the node is NOT in the index, it is added (same as
  `addToVectorIndex`).
- `addToVectorIndex(index, node, embedFn)` — the node must NOT already be in the
  index. Embeds the node, adds its embedding, appends its id. If the node IS
  already in the index, it is updated (same as `updateVectorIndex`).
- `removeFromVectorIndex(index, nodeId)` — the node must be in the index.
  Removes its embedding and id (and any `skipped` entry for the id). If the
  node is NOT in the index, it is a no-op.
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
- An `embedFn` rejection (e.g. the provider is down) propagates from the index
  build/maintenance functions (the returned promise REJECTS with the embed
  error). **[W1/W2 — unchanged until W3.]** The W3 amendment (2026-09-05)
  FLIPS this for the maintenance paths: a per-node embed rejection after
  warm-up is recorded `skipped.set(nodeId, 'transient')` + logged, and the
  promise RESOLVES (see the embed-failure policy above). UNCHANGED in W3: the
  required-argument rejections below, and the QUERY-time embed rejection
  (`score`/`place` — §5.9 #32). The flip is pinned by the W3 re-pin of
  `tests/embeddings.test.ts:380-386`.

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
  node id). A node NOT in the vector index (never indexed, transiently/empty
  skipped, or deleted) is OMITTED from the scored set — it is not scored at
  all. **[DOC-LETTER RE-PIN 2026-09-05 (RCA-6 W3 doc review, greens finding
  F-SCORE): the pre-W3 letter said "scores 0" (scored-then-filtered); the live
  `score()` omits vector-absent nodes — equivalent at the ranked level to the
  pre-W3 score-0-and-filter (the engine's `retrieval.ts:558` score>0 filter
  drops a score-0 node either way), so `ranked` never contains a
  vector-absent node under either letter.]**
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

### 5.5 The vector embedder (`createVectorEmbedder`)

The vector embedder — a drop-in behind the (async-amended) `Embedder` interface.
It is provider/model AGNOSTIC: it is constructed from an `EmbeddingProviderConfig`
(§5.2), creates the provider via `createEmbeddingProvider`, and holds a reference
to the `RagStore` (to read nodes in `onStoreChanged`) and its own `VectorIndex`
(maintained on store change).

```ts
export interface VectorEmbedderOptions {
  /** The embedding provider config (provider kind, baseUrl, apiKey, model,
   *  dimension, timeoutMs — §5.2). The config is the ONLY thing that differs
   *  between providers. W1 amendment (2026-09-05, implementer deviation —
   *  see the note below the code block): an ALREADY-CREATED provider
   *  INSTANCE may be passed instead of a config. */
  provider: EmbeddingProviderConfig | EmbeddingProvider
  /** The placement minimum score threshold. Default PLACEMENT_MIN_SCORE (0). */
  placementMinScore?: number
  /** W1 (2026-09-05 amendment) — OPTIONAL prebuilt index: when supplied, the
   *  embedder ADOPTS it (NO build embeds happen inside
   *  `createVectorEmbedder`). The vector-boot controller builds the index in
   *  the BACKGROUND (§5.12 — cache/batch-aware) and hands the prebuilt index
   *  here for the promotion. Omitted (ALL existing calls and tests) → build
   *  from the store's nodes as today. */
  index?: VectorIndex
  /** W5 (§5.13 W5 amendment, 2026-09-05 — the user directive "live upload
   *  should also update the cache") — the OPTIONAL persisted cache: when
   *  supplied, ALL the embedder's single-text live embeds route through the
   *  ONE single-text memoizer over this provider instance's tuple (the
   *  score query-embed — which is also place()'s content-embed — and the
   *  onStoreChanged maintenance embeds): a HIT adopts with NO HTTP call; a
   *  FAILED embed writes nothing; a QUERY-embed MISS is adopted IN-MEMORY
   *  ONLY (F1/F2) while the MAINTENANCE (node-content) embeds write through
   *  on the cache's debounced single-writer queue. Absent (ALL W1–W3
   *  callers/tests) → byte-identical `provider.embed` behavior. */
  cache?: VectorCache
}

/** Create the vector embedder. Builds the vector index from the store's nodes
 *  (embedding each once) via the configured provider. ASYNC. */
export function createVectorEmbedder(store: RagStore, opts: VectorEmbedderOptions): Promise<Embedder>
```

**W1 amendment (2026-09-05 — the provider-option widening, an implementer
deviation now documented):** `provider` accepts `EmbeddingProviderConfig |
EmbeddingProvider` — a supplied provider INSTANCE is adopted as-is (the
vector-boot controller hands its warmed provider here so the promoted embedder
embeds through the SAME instance — no second provider is constructed); a
config is created via `createEmbeddingProvider` unchanged
(`src/main/embeddings.ts:807-809` post-W5; `675-677` post-W2; `402-433`
pre-W2 — the cite re-pointed by the W5 doc review, the W5 seam additions
having shifted the layout).

**W5 amendment (2026-09-05 — the live cache write-through; §5.13's W5
amendment):** `VectorEmbedderOptions.cache?` is LANDED (2026-09-05;
`src/main/embeddings.ts:782-794` the field, `:815-834` the wiring). With a
cache, the ONE memoizer (`createSingleTextMemoizer(provider, opts.cache, {
persistMisses: false })`) fronts every single-text live embed: `score`'s
query-embed and `place()`'s content-embed route through the query fn
(`memoizer.embed(text)` — a MISS is adopted IN-MEMORY ONLY, F1/F2), and
`onStoreChanged`'s maintenance embeds route through the maintenance fn
(`memoizer.embed(text, { persist: true })` — the node-content write-through
on the cache's debounced single-writer queue). Without a cache the raw
`provider.embed` passes through byte-identically (W1–W3 unchanged).

**Construction:**

- Creates the provider via `createEmbeddingProvider(opts.provider)`.
- Builds the vector index from the store's nodes
  (`createVectorIndex(store.listNodes(), provider.embed)`) — OR adopts
  `opts.index` when supplied (W1 amendment: no build embeds; §5.12).
- Returns an `Embedder` whose `score`/`place` are async and whose
  `onStoreChanged` maintains the vector index.

**`score(query, nodes)` (async):**

- Computes the query embedding (`await provider.embed(query)`; W5 — when
  `opts.cache` is supplied, through the memoizer's query path: in-memory
  miss adoption, never persisted).
- Scores each node by cosine similarity against its vector-index embedding
  (a node not in the vector index is OMITTED from the scored set — §5.4,
  re-pinned 2026-09-05, greens finding F-SCORE).
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
  - W5: with `opts.cache`, the update/add re-embeds route through the
    maintenance embed fn (`memoizer.embed(text, { persist: true })`) — a
    cached hash adopts with NO HTTP call; new/changed content embeds +
    writes through (the F1/F2 persist split — §5.13's W5 amendment).
- Edge changes do not affect the vector index (edges are not embedded);
  `edgeIds` is accepted and ignored for index purposes.

**Fail-states:**

- `createVectorEmbedder` with a null/undefined `store` → the returned promise
  REJECTS with `Error('createVectorEmbedder: store required')`.
- `createVectorEmbedder` with a null/undefined `opts` or `opts.provider` → the
  returned promise REJECTS with
  `Error('createVectorEmbedder: provider config required')`.
- A provider-creation failure (e.g. a remote/cloud config missing its `apiKey`)
  propagates from `createVectorEmbedder` (the returned promise REJECTS with the
  provider error).
- `score` with a non-string `query` or null/undefined `nodes` → the returned
  promise REJECTS with `Error('embedder score: query/nodes required')`.
- `place` with a non-string `content` or null/undefined `nodes`/`edges` → the
  returned promise REJECTS with
  `Error('embedder place: content/nodes/edges required')`.
- `onStoreChanged` with a null/undefined `nodeIds` → the returned promise
  REJECTS with `Error('onStoreChanged: nodeIds required')`.
- An `embedFn` rejection (e.g. the provider is down) propagates from `score`/
  `place`/`onStoreChanged` (the returned promise REJECTS with the embed error).

### 5.6 The mock embedder + the integration test path + the remote/cloud test path

**The mock embedder (unit tests — no provider dependency):**

```ts
/** Create a deterministic mock embedder for unit tests. Implements the async
 *  Embedder interface with NO provider dependency. Deterministic. */
export function createMockEmbedder(opts?: { dimension?: number }): Embedder
```

- The mock computes a deterministic embedding from text via a fixed-dimension
  feature-hash (a bag-of-words → fixed-dimension vector; the exact algorithm is
  implementation detail, but it MUST be deterministic and produce cosine
  similarities that reflect content overlap). Default dimension 4.
- `score(query, nodes)` — computes the query embedding and each node's
  embedding deterministically (from the node's `content`), scores by cosine
  similarity, sorts by score descending then node id ascending. Returns
  `ScoredNode[]`. No provider call.
- `place(content, nodes, edges)` — the same placement logic as the vector
  embedder (§5.5), using the deterministic mock embeddings. No provider call.
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
  the real provider (`createOllamaEmbedProvider` + `createVectorEmbedder` with
  `{ provider: { provider: 'ollama', baseUrl: 'http://127.0.0.1:11434', model:
  'embeddinggemma' } }`):
  - A real embed of a known text returns a vector of the model's dimension
    (auto-detected).
  - Two semantically-similar texts score higher (cosine) than two dissimilar
    texts.
  - The vector embedder's `score`/`place` work end-to-end against the real
    model.
- **Fail-state:** if ollama is down, the integration test is SKIPPED (not
  failed) — the `skipIf` gate. If ollama is up but the model is missing, the
  provider rejects with the ollama error (a documented fail-state — §5.2).

**The remote/cloud provider test path (MOCKED — no live remote call in the test
suite, no network egress in CI):**

- The remote/cloud provider (`createRemoteEmbedProvider`) is tested with a
  MOCKED HTTP layer (a stubbed `fetch`), NOT a live remote call. The test suite
  makes NO network egress to a remote/cloud provider.
- **Mocked test scope:**
  - A stubbed `fetch` returns a canned 2xx response → the provider parses the
    embedding vector, validates the dimension, and resolves.
  - The test asserts the REQUEST shape: the URL is the configured `baseUrl`, the
    body carries the model name + text, and the `Authorization: Bearer <apiKey>`
    header is present (REMOTE-SECURITY-POSTURE).
  - A stubbed `fetch` returns a non-2xx response → the provider rejects with
    `Error('remote embed: HTTP <status>')`.
  - A stubbed `fetch` rejects (network failure) → the provider rejects with
    `Error('remote embed: <message>')`.
  - A stubbed `fetch` returns a malformed response → the provider rejects with
    `Error('remote embed: malformed response')`.
  - A dimension mismatch against the configured dimension → the provider rejects
    with `Error('remote embed: dimension mismatch (expected <n>, got <m>)')`.
  - A `baseUrl` whose origin is NOT in the `connect-src` CSP allowlist → the
    provider rejects with `Error('remote embed: baseUrl not in connect-src
    allowlist')`.
- **No live remote call:** the remote/cloud provider is NEVER exercised against
  a real cloud endpoint in the test suite (no network egress in CI). The
  real-ollama integration test is the ONLY live-network test path, and it is
  localhost-only + gated by `isOllamaAvailable`.

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
  `createVectorEmbedder`, before the engine is created).

**Config selection (how the vector embedder is selected):**

- An app config option `retrieval.embedder: 'lexical' | 'vector'` (default
  `'lexical'`).
- When `'lexical'` (default): main creates the lexical embedder (Unit E) and
  passes it to `createRetrieval` — unchanged.
- When `'vector'`: main reads the embedding provider config
  (`retrieval.embeddingProvider: EmbeddingProviderConfig` — REQUIRED when
  `retrieval.embedder === 'vector'`) and creates the vector embedder
  (`await createVectorEmbedder(store, { provider: config })`), then passes it
  to `createRetrieval`.
- **The engine uses the passed embedder** (Unit E F2 — `createRetrieval` uses
  the passed embedder; a vector embedder is a drop-in). No engine change is
  needed to select the vector embedder beyond passing it. The config is the ONLY
  thing that differs between providers — the retrieval engine is unchanged
  regardless of which provider the vector embedder uses.

**AMENDED (2026-09-05, W1 — boot model B):** in vector mode the config
selection no longer awaits `createVectorEmbedder` before `createRetrieval`
(the old dark-boot flow, `src/main/main.ts:150` — pre-W1 line numbers,
shifted by the W1 rewiring). Boot performs the warm-up
gate, creates the engine BORN-LEXICAL (the pending phase) with the lexical
embedder, starts the window + MCP server, and promotes the vector embedder
into the SAME engine instance at the end of the background build (§5.12 — the
new one-way `setEmbedder` promotion seam on `RetrievalEngine`).
`retrieval.embedder: 'lexical'` behavior is UNCHANGED.

**MCP/UI equivalence (§8.2, a BINDING constraint):**

- The `rag.query` MCP tool and the `rag-query` IPC both call the SAME maintained
  engine's `query` (now async — both `await` it). Neither computes retrieval in
  the renderer.
- The vector embedder is a drop-in behind the `Embedder` interface, so
  `rag.query`/`rag-query` work UNCHANGED (same engine, same result shape) when
  the vector embedder is selected — regardless of which provider the vector
  embedder uses.
- **Equivalence test:** an MCP `rag.query` and a UI `rag-query` IPC with the
  same params produce the same result (same ranked, context, markdown, lineMap)
  — with EITHER embedder selected.

**Security/CSP posture (LOCAL-SECURITY-POSTURE + REMOTE-SECURITY-POSTURE):**

- **Local (ollama) — LOCAL-SECURITY-POSTURE:**
  - The ollama call is a localhost HTTP request (`http://127.0.0.1:11434`) —
    LOCAL, no external network egress. It does NOT require a `connect-src` CSP
    allowlist for a declared network.
  - The base URL is pinned to localhost/loopback by default and REJECTED if set
    to a non-localhost address (§5.2 — `createOllamaEmbedProvider` throws).
  - No credentials are sent; the request is a plain HTTP POST to the localhost
    endpoint (no API key).
  - The provider is a MAIN-PROCESS-ONLY module — the renderer has NO access to
    the ollama endpoint (no IPC exposes it).
  - The vector embedder is OPT-IN via config (`retrieval.embedder: 'vector'`);
    the lexical embedder is the default (no provider call unless opted in).
- **Remote/cloud — REMOTE-SECURITY-POSTURE (a DESIGNED security surface, per
  PROVIDER-AGNOSTIC):**
  - A remote/cloud provider requires the `connect-src` CSP allowlist for the
    declared network: the provider's `baseUrl` origin MUST be in the CSP
    `connect-src` allowlist. A `baseUrl` whose origin is NOT in the allowlist →
    the provider REJECTS with `Error('remote embed: baseUrl not in connect-src
    allowlist')` (fail-closed — §5.2).
  - **API-key handling:** the API key is stored in config
    (`EmbeddingProviderConfig.apiKey`), sent as an `Authorization: Bearer
    <apiKey>` header, NEVER logged, NEVER exposed to the renderer
    (main-process-only — no IPC exposes it), and NEVER sent to a
    non-allowlisted origin.
  - The provider is a MAIN-PROCESS-ONLY module — the renderer has NO access to
    the cloud endpoint or the API key.
  - The vector embedder is OPT-IN via config (`retrieval.embedder: 'vector'`);
    the lexical embedder is the default (no provider call unless opted in).
  - A remote/cloud provider REQUIRES an API key (`createRemoteEmbedProvider`
    throws if `apiKey` is missing — §5.2).

**Fail-states (amended):**

- `RetrievalEngine.query` with a NON-STRING `query` (e.g. `null`) → the returned
  promise REJECTS with `Error('retrieve: store/embedder/index/query/opts
  required')` (the `retrieve` "required" fail-state, propagated — consistent
  with Unit E §5.9 F14).
- `RetrievalEngine.query` with an EMPTY/WHITESPACE `query` (`''`, `'   '`) → the
  returned promise REJECTS with `Error('retrieve: query must be a non-empty
  string')` (propagated from `retrieve` — consistent with Unit E §5.9 F15).
- `RetrievalEngine.onStoreChanged` with a null/undefined `nodeIds` → the
  returned promise REJECTS with `Error('onStoreChanged: nodeIds required')`.
- An embedder rejection (e.g. the provider is down during `score`) propagates
  from `query` (the returned promise REJECTS with the embed error).
- `retrieval.embedder: 'vector'` with a missing/invalid
  `retrieval.embeddingProvider` config → main fails to create the vector
  embedder (the provider-creation error propagates; the app does NOT silently
  fall back to lexical).
- `rag.query` with the `rag` group disabled → not registered, not callable
  (Unit B §5.3).
- A `rag.query` that reaches the renderer switch → `unknown method` throw
  (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`createEmbeddingProvider` happy (ollama):** config
   `{ provider: 'ollama', baseUrl: 'http://127.0.0.1:11434', model:
   'embeddinggemma' }` → an `EmbeddingProvider` whose `embed` posts to the
   localhost endpoint (model `embeddinggemma`).
2. **`createEmbeddingProvider` happy (remote/cloud):** config
   `{ provider: 'openai', baseUrl: 'https://api.openai.com/v1', model:
   'text-embedding-3-small', apiKey: 'sk-...' }` → an `EmbeddingProvider` whose
   `embed` posts to the cloud endpoint with the `Authorization: Bearer` header.
3. **Provider dimension auto-detect:** the first embed returns a vector; the
   provider auto-detects its length and validates subsequent vectors against it.
4. **Provider configured dimension:** `dimension: 4` → every returned vector is
   validated to length 4.
5. **`createVectorIndex` happy:** a node list + a mock `embedFn` → the index has
   the node ids, embeddings (one per node), and the dimension.
6. **`updateVectorIndex` happy (content edit):** a content edit changes a node's
   text → the node's embedding is replaced.
7. **`addToVectorIndex` happy (node add):** a new node → its embedding added, its
   id appended.
8. **`removeFromVectorIndex` happy (node delete):** a node removed → its
   embedding and id removed.
9. **`cosineSimilarity` happy:** two identical vectors → 1; two orthogonal
   vectors → 0; two opposite vectors → -1.
10. **`cosineSimilarity` zero vector:** a zero vector → 0 (no throw).
11. **`createVectorEmbedder` + `score` happy (mock):** a query matching a node's
    content → the node scores > 0; the result is ranked highest-first.
12. **Vector determinism:** the same query + same vector index + same nodes →
    the same ranked result (twice).
13. **Vector tie-break:** two nodes with equal scores → sorted by node id
    ascending.
14. **`place` happy (vector):** a new section's content matches an existing
    section → `{ ok: true, targetNodeId, edgeKind: 'next-section', score }`.
15. **`place` container match (vector):** a new section's content matches a
    `ul`/`ol`/`div` node → `edgeKind: 'doc-child'`.
16. **`createMockEmbedder` happy:** a deterministic mock embedder → `score`/
    `place` work with no provider dependency; the same query + nodes → the same
    result (twice).
17. **`isOllamaAvailable` happy (ollama up):** the probe returns `true`.
18. **`isOllamaAvailable` happy (ollama down):** the probe returns `false` (no
    throw).
19. **Integration test gating:** with ollama down, the integration test is
    SKIPPED (not failed).
20. **Integration test happy (ollama up):** a real embed of a known text returns
    a vector of the model's dimension; similar texts score higher than
    dissimilar texts.
21. **Remote/cloud provider mocked happy:** a stubbed `fetch` returns a canned
    2xx response → the provider parses the embedding, validates the dimension,
    and resolves; the request carries the `Authorization: Bearer <apiKey>`
    header and the configured URL/body.
22. **Async lexical embedder (amended):** the lexical embedder's `score`/`place`
    return RESOLVED promises (the Unit E behavior preserved).
23. **Async retrieval stack (amended):** `selectTopK`/`retrieve`/`engine.query`
    return promises that resolve to the same results as the sync Unit E
    behavior.
24. **`onStoreChanged` vector maintenance:** a content edit → the vector index
    re-embeds the affected node; a structural add → embeds the new node; a
    structural delete → removes the node's embedding.
25. **Config selection:** `retrieval.embedder: 'vector'` with a valid
    `retrieval.embeddingProvider` config → main creates the vector embedder and
    passes it to `createRetrieval`; the engine uses it.
26. **MCP/UI equivalence (vector):** an MCP `rag.query` and a UI `rag-query` IPC
    with the same params → the same result, with the vector embedder selected.
27. **Warm-up gate happy (W1, §5.12):** the boot warm-up performs ONE REAL
    `POST /api/embed` (a single-text probe embed through the configured
    provider — NOT `isOllamaAvailable`, which probes `GET /api/tags` and does
    NOT load the model) and resolves with the warmed provider when the embed
    succeeds.
28. **Born-lexical pending (W1, §5.12):** after a successful warm-up, the ONE
    shared `RetrievalEngine` instance is created with the LEXICAL embedder
    (the pending phase); the window + MCP server start while the vector index
    builds in the background.
29. **Pending query equivalence (W1, §5.12):** during the pending phase,
    `rag.query` (MCP) and `rag-query` (IPC) both return the SAME
    `RetrievalResult` shape, served LEXICALLY by the shared engine — the
    DESIGNED born-lexical state (logged as pending), explicitly NOT a silent
    lexical fallback. Equivalence holds at EVERY instant (pending AND
    promoted).
30. **Background build (W1, §5.12):** the controller builds the vector index
    from the store's non-empty nodes after boot (sequential in W1; the W2
    batch seam when `embedBatchFn` is supplied); the engine stays pending
    until promotion.
31. **Reconcile + tie rule (W1, §5.12):** at promotion, every node whose
    `updatedAt` is strictly greater than its build-time embed start is
    re-embedded BEFORE the swap; `updatedAt === embedAt` (tie) → UNCHANGED
    (no re-embed).
32. **Atomic one-way promotion (W1, §5.12):** `engine.setEmbedder(vectorEmbedder)`
    swaps the embedder inside the SAME engine instance; a pre-promotion
    in-flight query completes coherently on the LEXICAL embedder with the
    same `RetrievalResult` shape; a post-promotion query is scored by the
    vector embedder; `onStoreChanged` forwards to the vector hook after the
    swap (the `retrieval.ts:639` closure binding).
33. **Promotion is one-way (W1):** after promotion the engine never serves
    lexical scoring again (a second `setEmbedder` throws — §5.9 #42).
34. **Partial-index query semantics (W3):** a node absent from the vector
    index (never indexed, skipped, or deleted) is OMITTED from the vector
    embedder's scored set — the `retrieval.ts:558` score>0 filter never sees
    it either way — and is excluded from `ranked` (the ranked-level observable
    is identical to the pre-W3 score-0-and-filter letter; DOC-LETTER RE-PIN
    2026-09-05, greens finding F-SCORE); the `RetrievalResult`
    shape is identical on MCP and IPC; post-promotion this is partial-index
    serving, NOT a lexical fallback.
35. **Transient skip + retry (W3):** a per-node embed failure during
    build/maintenance records `skipped.set(nodeId, 'transient')`, logs, and
    the operation RESOLVES; when the node is next touched (`onStoreChanged`
    lists it), it is re-embedded and, on success, removed from `skipped`.
36. **Skipped census (W3, §5.12):** the promotion report carries the skipped
    census (`empty` n, `transient` m) covering the never-edited transient
    skips.
37. **Batch happy (W2):** `provider.embedBatch(['a','b','c'])` sends ONE
    request (the provider's plural shape) and returns 3 vectors in
    positional order, each passing F6/F7 validation.
38. **Batch sequential default (W2):** a provider without `embedBatch` (the
    mock) is consumed via the sequential default — identical results to
    per-item `embed()`.
39. **Batch index build (W2):** `createVectorIndex(nodes, embedFn,
    provider.embedBatch)` embeds in batch requests; the resulting index is
    identical to the sequential build's.
40. **Cache hit adoption (W4, §5.13):** a node whose (kind, model, dimension,
    contentHash) is in the persisted cache adopts the cached vector with NO
    HTTP call.
41. **Cache miss embed + write-through (W4, §5.13):** a cache miss embeds
    through the provider and the entry is persisted (write-through, queued)
    after the embed succeeds.
42. **Cache prune (W4, §5.13):** at promotion, entries whose key tuple ≠ the
    current provider tuple, or whose contentHash matches no current store
    node's embedded text, are dropped and the file is rewritten once.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`createEmbeddingProvider` null/undefined config** → throws
   `Error('createEmbeddingProvider: config required')`.
2. **`createEmbeddingProvider` missing/empty baseUrl** → throws
   `Error('createEmbeddingProvider: baseUrl required')`.
3. **`createEmbeddingProvider` missing/empty model** → throws
   `Error('createEmbeddingProvider: model required')`.
4. **`createOllamaEmbedProvider` non-localhost baseUrl** → throws
   `Error('createOllamaEmbedProvider: baseUrl must be localhost')`.
5. **`createRemoteEmbedProvider` missing/empty apiKey** → throws
   `Error('createRemoteEmbedProvider: apiKey required')`.
6. **Ollama provider non-2xx HTTP** → the returned promise REJECTS with
   `Error('ollama embed: HTTP <status>')`.
7. **Ollama provider network failure (ollama down)** → the returned promise
   REJECTS with `Error('ollama embed: <message>')`.
8. **Ollama provider timeout** → the returned promise REJECTS with
   `Error('ollama embed: timeout after <timeoutMs>ms')`.
9. **Ollama provider malformed response** → the returned promise REJECTS with
   `Error('ollama embed: malformed response')`.
10. **Ollama provider dimension mismatch** → the returned promise REJECTS with
    `Error('ollama embed: dimension mismatch (expected <n>, got <m>)')`.
11. **Ollama provider non-string text** → the returned promise REJECTS with
    `Error('ollama embed: text must be a string')`.
12. **Remote provider non-2xx HTTP** → the returned promise REJECTS with
    `Error('remote embed: HTTP <status>')`.
13. **Remote provider network failure** → the returned promise REJECTS with
    `Error('remote embed: <message>')`.
14. **Remote provider timeout** → the returned promise REJECTS with
    `Error('remote embed: timeout after <timeoutMs>ms')`.
15. **Remote provider malformed response** → the returned promise REJECTS with
    `Error('remote embed: malformed response')`.
16. **Remote provider dimension mismatch** → the returned promise REJECTS with
    `Error('remote embed: dimension mismatch (expected <n>, got <m>)')`.
17. **Remote provider non-string text** → the returned promise REJECTS with
    `Error('remote embed: text must be a string')`.
18. **Remote provider baseUrl not in connect-src allowlist** → the returned
    promise REJECTS with `Error('remote embed: baseUrl not in connect-src
    allowlist')`.
19. **`createVectorIndex` null/undefined nodes or embedFn** → the returned
    promise REJECTS with `Error('createVectorIndex: nodes/embedFn required')`.
20. **`updateVectorIndex`/`addToVectorIndex` null/undefined index/node/embedFn** →
    the returned promise REJECTS with
    `Error('vector index: index/node/embedFn required')`.
21. **`removeFromVectorIndex` null/undefined index or non-string nodeId** →
    throws `Error('vector index: index/nodeId required')`.
22. **`cosineSimilarity` null/undefined a/b** → throws
    `Error('cosineSimilarity: a/b required')`.
23. **`cosineSimilarity` dimension mismatch** → throws
    `Error('cosineSimilarity: dimension mismatch')`.
24. **`createVectorEmbedder` null/undefined store** → the returned promise
    REJECTS with `Error('createVectorEmbedder: store required')`.
25. **`createVectorEmbedder` null/undefined opts or opts.provider** → the returned
    promise REJECTS with `Error('createVectorEmbedder: provider config required')`.
26. **Provider-creation failure propagation** → a provider-creation failure
    (e.g. a remote/cloud config missing its `apiKey`) propagates from
    `createVectorEmbedder` (the returned promise REJECTS with the provider
    error).
27. **`score` non-string query or null/undefined nodes** → the returned promise
    REJECTS with `Error('embedder score: query/nodes required')`.
28. **`place` non-string content or null/undefined nodes/edges** → the returned
    promise REJECTS with `Error('embedder place: content/nodes/edges required')`.
29. **`place` empty content (vector)** → `{ ok: false, reason: 'empty-content' }`.
30. **`place` no match (vector)** → `{ ok: false, reason: 'no-match' }`.
31. **`onStoreChanged` null/undefined nodeIds** → the returned promise REJECTS
    with `Error('onStoreChanged: nodeIds required')`.
32. **Embed rejection propagation** → an `embedFn` rejection (e.g. the provider
    is down) propagates from `score`/`place`/`onStoreChanged`/`query` (the
    returned promise REJECTS with the embed error).
33. **`RetrievalEngine.query` non-string query** → the returned promise REJECTS
    with `Error('retrieve: store/embedder/index/query/opts required')` (the
    `retrieve` "required" fail-state — consistent with Unit E §5.9 F14). An
    EMPTY/WHITESPACE query (`''`, `'   '`) instead REJECTS with
    `Error('retrieve: query must be a non-empty string')` (Unit E §5.9 F15).
34. **`retrieval.embedder: 'vector'` with a missing/invalid
    `retrieval.embeddingProvider` config** → main fails to create the vector
    embedder (the provider-creation error propagates; the app does NOT silently
    fall back to lexical).
35. **`rag.query` with the `rag` group disabled** → not registered, not callable
    (Unit B §5.3).
36. **`rag.query` reaching the renderer switch** → `unknown method` throw
    (fail-closed, the negative contract — Unit B §5.3 Seam 4).
37. **Warm-up total failure (W1, failure class 2)** → the warm-up promise
    REJECTS with `Error('vector boot warm-up: <underlying provider error
    message>')` (e.g. `vector boot warm-up: ollama embed: timeout after
    5000ms`); the boot aborts BEFORE the window (`main()` throws → the fatal
    handler `app.exit(1)`, `src/main/main.ts:434-439`). The warm-up is the
    ONLY abort point after config. [Message shape SpecWriter-pinned
    2026-09-05 — the review pins "distinct + actionable", not the string.]
38. **Config-missing abort (W1, UNCHANGED — failure class 1)** →
    `retrieval.embedder: 'vector'` with a missing/invalid provider config
    throws `Error('retrieval.embedder: vector requires
    retrieval.embeddingProvider config')` at boot
    (`src/main/main.ts:153-157`); §5.9 #34 is preserved verbatim.
39. **Batch alignment mismatch (W2)** → the `embedBatch` promise REJECTS with
    `Error('ollama embed: batch alignment mismatch (expected <n> vectors, got
    <m>)')` (ollama) / `Error('remote embed: batch alignment mismatch
    (expected <n> vectors, got <m>)')` (remote); the caller falls back to
    per-item `embed()` for exactly that batch's texts (no positional
    assignment from a rejected batch).
40. **Batch timeout budget (W2)** → a batch of N exceeding `N × timeoutMs`
    rejects with `Error('ollama embed: timeout after <N × timeoutMs>ms')`
    (remote: `remote embed: timeout after <N × timeoutMs>ms`), and the
    in-flight fetch IS aborted (the fetch stub observes the abort signal); no
    unhandled rejection from the aborted fetch.
41. **Batch per-vector validation (W2)** → an in-batch vector failing F7 →
    `... malformed response`; failing F6 → `... dimension mismatch (expected
    <n>, got <m>)` (per-provider prefix — the §5.9 #9/#10/#15/#16 messages,
    batch context).
42. **Double promotion (W1)** → `setEmbedder` after promotion throws
    `Error('retrieval engine: embedder promotion is one-way (already
    promoted)')`. [SpecWriter-pinned 2026-09-05.]
43. **`setEmbedder` null/undefined (W1)** → throws `Error('retrieval engine:
    embedder required')`. [SpecWriter-pinned 2026-09-05.]
44. **Warm-up ≠ availability probe (W1)** → a server whose `/api/tags`
    responds but whose `/api/embed` fails (model missing / cold-load beyond
    the per-text budget) FAILS the warm-up (abort, #37) — never a false-ready
    boot.
45. **Empty-content add/update (W3, the UNIT-F-SKIP-EMPTY extension)** →
    `addToVectorIndex`/`updateVectorIndex` with empty/whitespace/non-string
    content make NO embed call: add → not indexed (`skipped` 'empty');
    update → the previous embedding removed (`skipped` 'empty'); no
    `malformed response` rejection.
46. **Per-node transient failure (W3, failure class 3)** → after warm-up
    success, a per-node embed rejection on build/add/update/hook does NOT
    reject: recorded `skipped.set(nodeId, 'transient')` + logged + the
    promise RESOLVES (re-pins `tests/embeddings.test.ts:380-386` red→green).
47. **Required-arg rejections (W3, UNCHANGED)** → §5.9 #19–21 (the
    null/undefined nodes/embedFn/index/node rejections) still reject
    verbatim.
48. **Query-time embed rejection (W3, UNCHANGED)** → §5.9 #32: a provider
    rejection during `score`/`place` (the query/content embedding) still
    propagates from the embedder and from `RetrievalEngine.query`.
49. **Corrupt/unreadable cache file (W4, §5.13)** → an absent file, invalid
    JSON, a non-object root, or a wrong/absent `version` → the cache is
    treated as EMPTY (a full re-embed) + logged; boot NEVER crashes on the
    cache.
50. **Cache write failure (W4, §5.13)** → a failed cache persist is NON-FATAL
    (logged; the in-memory index and the promotion continue; the next
    successful write recovers the file).
51. **Malformed cache entries (W4, §5.13)** → an entry whose vector is not an
    array of finite numbers, whose length ≠ its key's dimension, or whose
    fields are missing/wrong-typed is DROPPED (treated as a miss), never
    thrown.

### 5.10 Census / numeric claims

- **Provider kinds:** 2 concrete (`ollama` — local; remote/cloud — generic
  OpenAI/Cohere/etc.) behind ONE `EmbeddingProvider` interface.
- **`EmbeddingProvider` interface members:** 6 (`kind`, `model`, `baseUrl`,
  `dimension`, `embed`, optional `embedBatch?` — the W2 amendment,
  2026-09-05 — LANDED (runtime `typeof embedBatch === 'function'` on BOTH
  concrete providers, confirmed by the W2 greens battery CENSUS row); the
  W1-era live interface was 5 members).
- **`EmbeddingProviderConfig` fields:** 7 (`provider`, `baseUrl`, `model`,
  `apiKey?`, `dimension?`, `timeoutMs?`, `connectSrc?`).
- **Ollama base URL:** `http://127.0.0.1:11434` (default; localhost-pinned).
- **Ollama model:** `embeddinggemma` (default).
- **Ollama endpoint:** `POST /api/embed` (the embeddings endpoint).
- **HTTP timeout:** 5000 ms (default, configurable via `timeoutMs`).
- **Embedding dimension:** auto-detected from the model's first response
  (validated for consistency); configurable via `dimension`. The mock's fixed
  dimension is 4 (default).
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
- **Config options:** 2 (`retrieval.embedder: 'lexical' | 'vector'`, default
  `'lexical'`; `retrieval.embeddingProvider: EmbeddingProviderConfig`, REQUIRED
  when `retrieval.embedder === 'vector'`).
- **Security surfaces:** 2 (LOCAL-SECURITY-POSTURE — localhost, no egress, no
  API key; REMOTE-SECURITY-POSTURE — `connect-src` CSP allowlist + API-key
  handling).
- **AMENDED (2026-09-05, the vector-boot amendment) — interface/param census:**
  `EmbeddingProvider` members 5 → 6 (`embedBatch?` — the W1-era
  live interface was 5 members, `embedBatch === undefined` at runtime,
  confirmed by the Unit W1 greens battery; LANDED with the W2 red→green
  cycle, 2026-09-05 — runtime `typeof embedBatch === 'function'` on BOTH
  concrete providers, confirmed by the W2 greens battery CENSUS row);
  `VectorIndex` members 3 → 4 (`skipped`, W3 — still 3 in W1/W2, confirmed by
  the W2 greens EMPTY-BATCH observation);
  `RetrievalEngine` members 2 → 3 (`setEmbedder`, W1 — LANDED);
  `createVectorIndex` params 2 → 3 (optional `embedBatchFn?`, W2 — LANDED);
  `VectorEmbedderOptions` fields 2 → 4 (optional `index?`, W1 — LANDED;
  optional `cache?`, W5 — LANDED 2026-09-05).
- **Warm-up gate (W1):** ONE real `POST /api/embed` (a single-text probe
  through the configured provider; NOT the `/api/tags` availability probe);
  its timeout is the provider's `timeoutMs` (default 5000 ms) applied to that
  ONE embed; total failure → boot aborts before the window (§5.9 #37).
- **Per-text timeout budget (W2):** a batch of N texts gets `N × timeoutMs`
  total (single-text keeps exactly `timeoutMs`); the fetch is aborted via
  `AbortController` on expiry.
- **Batch chunk size (F-W2-2):** `BATCH_CHUNK_SIZE = 64` texts per batch
  request (module-level export; the last chunk may be short); the batch
  timeout budget is clamped to `Math.min(N × timeoutMs, 2147483647)`; the
  per-text `timeoutMs` option must be a positive integer ≤ 2147483647
  (F-W2-5).
- **Skipped map (W3):** `Map<nodeId, 'empty' | 'transient'>` — 'empty' =
  by-design permanent (UNIT-F-SKIP-EMPTY); 'transient' = a retryable per-node
  embed failure (retried when the node is next touched by `onStoreChanged`).
- **Failure classes (W3):** 3 — (1) config-missing/invalid → abort (§5.9
  #34, unchanged); (2) provider-down at warm-up → abort BEFORE the window
  (§5.9 #37); (3) per-node failure AFTER warm-up success → skip + log +
  continue (`skipped` map).
- **Truncation measurement (the A7 pre-W2 gate, live-verified 2026-09-05 —
  review record §5 item 3):** over the operator's real store (23,469 nodes;
  16,840 non-empty; est. tokens ≈ chars/4): **0 nodes exceed the ollama
  model's 2048-token context** (est. p50 = 12, p90 = 47, p99 = 196, max =
  1,998) → the "large fraction truncates → chunking unit" condition is NOT
  triggered; NO chunking unit; never silent truncation absorption.
- **Sequential-build reference (live-measured 2026-09-05 — review record §5 item 4):**
  ~0.1s per single-text embed (probes 0.103s / 0.103s / 0.080s) × 16,840
  non-empty nodes ≈ 28 min sequential — the motivation for the background
  build + the batch seam.
- **Cache (W4, §5.13):** file `provident-vector-cache.json` (userData);
  format `{ version: 1, entries: [...] }`; key = provider kind + model +
  dimension + contentHash (lowercase-hex SHA-256 of the exact embedded text —
  the `nodeSource` SHA-256 discipline); write-through after each successful
  embed (single-writer queued, atomic temp+rename); pruning at promotion
  (drop other-tuple + no-longer-in-store entries); 3 documented cache
  fail-states (§5.9 #49–#51).

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
  **PROVIDER-AGNOSTIC** (2026-08-27 — the vector embedder is provider/model
  agnostic; ollama `embeddinggemma` is ONE concrete config; remote/cloud
  providers are drop-ins; network egress IS in scope — the `connect-src` CSP
  allowlist + API-key handling are a DESIGNED security surface),
  **SINGLE-WRITER-STORE**, **RAG-EDIT-MCP-GROUPS**.
- Pending: `docs/pending.md` (vector embeddings — the deferred row, now
  implemented by Unit F; the updated "no network egress" row — **PROVIDER-
  AGNOSTIC (2026-08-27):** the vector embedder is provider/model agnostic —
  local (ollama `embeddinggemma`) AND remote/cloud providers are in scope, so
  the `connect-src` CSP allowlist + API-key handling become a DESIGNED security
  surface; a localhost ollama call is LOCAL (no external egress); a remote/cloud
  provider requires the CSP allowlist + API-key config).
- Vector-boot amendment: `docs/specs/ollama-vector-boot-review.md` (the
  four-agent gate record — §2 binding amendments A1–A8, §3 change inventory +
  risk register, §4a the user go-ahead for the cache-inclusive variant, §5 the
  live-verified premises); decisions **VECTOR-BOOT-BACKGROUND-PROMOTE** and
  **VECTOR-CACHE-CONTENT-HASH-KEY** (`docs/decisions.md`, 2026-09-05).

### 5.12 The vector-boot controller (W1 — BOOT MODEL B: warm-up gate → born-lexical pending → background build → reconcile → atomic one-way promotion)

**[2026-09-05 amendment — source: `docs/specs/ollama-vector-boot-review.md` §2
amendments A1/A3/A4, §4 (the W1 TestWriter brief), §4a (the user go-ahead,
cache-inclusive variant).]**

**[2026-09-05 doc review (RCA-6): the `main.ts`/`retrieval.ts`/
`embeddings.ts` line citations in this section were re-pointed to the
POST-W1 file layout (the W1 rewiring shifted them); the pre-W1 narrative
cites are annotated as such. The `embeddings.ts` cites were re-pointed AGAIN
by the W2 doc review (2026-09-05, post-W2 — the W2 batch seam shifted the
`embeddings.ts` layout); the pre-W2 numbers are kept inline for provenance.]**

**Pre-W1 (the W1 motivation):** vector-mode boot embedded the whole corpus
SYNCHRONOUSLY and DARK: `src/main/main.ts:150` awaited
`createVectorEmbedder` before the window (`main.ts:392`) and `mcp.start()`
(`main.ts:406`) — pre-W1 line numbers, shifted by the W1 rewiring — ~28 min
for 16,840 non-empty nodes at ~0.1s/embed, and ANY single embed failure
aborted boot
(`createVectorIndex` rejection propagates — `tests/embeddings.test.ts:380-386`).
W1 re-structures boot as BOOT MODEL B, in order:

1. **Config (failure class 1 — UNCHANGED):** `retrieval.embedder: 'vector'`
   with a missing/invalid provider config throws
   `Error('retrieval.embedder: vector requires retrieval.embeddingProvider
   config')` at `src/main/main.ts:153-157` — preserved VERBATIM (§5.9 #34/#38).
2. **Warm-up gate (failure class 2):** ONE REAL `POST /api/embed` — a
   single-text probe embed through the configured provider. NOT
   `isOllamaAvailable` (that probes `GET /api/tags`, `embeddings.ts:806` post-W2; `551` pre-W2,
   which does NOT load the model — a tags-only probe would false-ready the
   boot onto a cold/missing model). The warm-up timeout is the provider's
   `timeoutMs` (default 5000 ms) applied to that one embed. TOTAL failure
   (connection refused / non-2xx / timeout / malformed) → the warm-up promise
   REJECTS with `Error('vector boot warm-up: <underlying message>')` →
   `main()` throws → the fatal handler exits the app (`main.ts:434-439`)
   BEFORE the window.
3. **Born-lexical pending:** after a successful warm-up, the ONE shared
   `RetrievalEngine` instance is created with the LEXICAL embedder (the
   pending phase) and handed to BOTH the MCP server and the IPC handlers;
   window + MCP start immediately. Pending queries are served LEXICALLY in
   the SAME `RetrievalResult` shape (`retrieval.ts:560-568`) on BOTH
   `rag.query` (MCP) and `rag-query` (IPC) — the DESIGNED born-lexical state,
   LOGGED as pending, explicitly NOT a silent lexical fallback. §8.2
   equivalence holds at EVERY instant (pending AND promoted).
4. **Background build:** the controller builds the vector index from the
   store's non-empty nodes AFTER boot (sequential per-item in W1; the W2
   batch seam via `opts.embedBatchFn`; the W4 cache via `opts.cache`). The
   controller is fire-and-forget with a `.catch` (the F1 discipline — a
   build failure is LOGGED and the engine STAYS pending; never an unhandled
   rejection).
5. **Reconcile (before the swap):** the controller re-checks every indexed
   node's `updatedAt` against its build-time embed snapshot. **`embedAt`
   operationally defined (AMENDMENT-REVIEW finding 2, 2026-09-05):** for node
   N, `embedAt` = the value of `N.updatedAt` AS READ at the moment the
   background build embedded N (a snapshot recorded WITH the embed — no
   injectable clock; a red test constructs it deterministically with a store
   double: build at T, keep T → unchanged; bump the node to T+1 → re-embed).
   A node whose current `updatedAt` strictly POSTDATES its snapshot is
   RE-EMBEDDED before the swap. **Tie rule (pinned, review A4):**
   `updatedAt === embedAt` → UNCHANGED (no re-embed) — equality means the
   embed observed exactly that version; re-embed iff `updatedAt > embedAt`
   (conservative: an over-embed is safe, an under-embed is not; `<` is
   impossible and ignored).
6. **Atomic ONE-WAY promotion:** the vector embedder is swapped INTO the same
   engine instance via the promotion seam below. In-flight pre-swap queries
   complete coherently on the OLD (lexical) embedder; post-swap queries are
   scored by the vector embedder; the `onStoreChanged` hook attaches with the
   swap (post-swap edits flow to the vector hook — the `retrieval.ts:639`
   binding). No demotion ever.

**Module seam (node-testable — review A3; this repo tests shared modules, not
`main.ts` — the U5-F1 handler-extraction precedent):** a NEW pure module
`src/main/vector-boot.ts` (NO Electron; the store + provider are injected):

```ts
// src/main/vector-boot.ts (W1 — pure + injectable; no Electron)
import type { RagStore } from './rag-store.js'
import type { RetrievalEngine } from './retrieval.js'
import type { EmbeddingProvider, EmbeddingProviderConfig } from './embeddings.js'

/** The boot phase of the shared engine. */
export type VectorBootPhase = 'pending' | 'promoted'

/** The warm-up probe text (a fixed non-empty string; pinned for determinism
 *  of the warm-up request). */
export const VECTOR_BOOT_WARMUP_TEXT = 'provident warm-up'

/** W1 fail-fast warm-up gate (failure class 2). Performs ONE REAL
 *  `POST /api/embed` — a single-text embed of VECTOR_BOOT_WARMUP_TEXT via
 *  `createEmbeddingProvider(config)` — NOT `isOllamaAvailable`. Resolves
 *  with the warmed provider (the model is loaded; the SAME provider instance
 *  is reused for the background build). REJECTS with
 *  `Error('vector boot warm-up: <underlying message>')` on ANY total
 *  failure → the caller aborts boot BEFORE the window. */
export function warmUpEmbeddingProvider(config: EmbeddingProviderConfig): Promise<EmbeddingProvider>

/** The promotion report (the promotion log census). */
export interface PromotionReport {
  /** Nodes embedded by the background build (W4 LANDED 2026-09-05: with a
   *  cache this counts the provider embeds = the cache MISSES — adopted hits
   *  made no embed call; without one, the indexed-node count, unchanged). */
  embedded: number
  /** W4 re-pin 2026-09-05 (§3a F-W4-4): distinct embedded texts adopted from
   *  the persisted cache with no HTTP call — DEDUPED by contentHash (a
   *  fallback re-lookup of the same text counts once). */
  cacheHits: number
  /** Nodes re-embedded by the reconcile pass (updatedAt > embedAt). */
  reEmbedded: number
  /** RCA-3 amendment (F-W1-2, 2026-09-05): nodes ADDED during the build
   *  window (after the listNodes snapshot) that the reconcile pass embedded +
   *  added to the built index before the swap. */
  adopted: number
  /** The skipped census at promotion: never-indexed 'empty' +
   *  never-edited 'transient' counts. W1 pins: `empty` = the build's
   *  empty-content skip count, `transient` = 0 (the transient class does
   *  not exist until W3 — AMENDMENT-REVIEW note 7, 2026-09-05). */
  skipped: { empty: number; transient: number }
  /** The promotion timestamp (Date.now() at the swap). */
  promotedAt: number
}

/** The W1 boot controller. Created SYNCHRONOUSLY after a successful
 *  warm-up. The controller OWNS engine creation: constructing it
 *  SYNCHRONOUSLY creates the ONE shared `RetrievalEngine` instance
 *  (born-lexical, pending — `createRetrieval` with the lexical embedder
 *  runs inside the factory) that main hands to the MCP server AND the IPC
 *  handlers (review R7 — the MCP server ALWAYS receives a live engine).
 *  AMENDMENT-REVIEW finding 1 (2026-09-05): main never creates the engine
 *  in vector mode. */
export interface VectorBootController {
  /** The shared engine (pending → promoted in place). */
  readonly engine: RetrievalEngine
  /** 'pending' until the promotion swap completes, then 'promoted'. */
  phase(): VectorBootPhase
  /** The live skipped map of the background build. */
  skipped(): Map<string, 'empty' | 'transient'>
  /** Background: build the vector index → reconcile → atomic one-way
   *  promotion. Resolves with the promotion report; REJECTS only on a TOTAL
   *  build failure (the engine STAYS pending — lexical-served — and the
   *  rejection is logged by main's fire-and-forget `.catch`).
   *  SINGLE-SHOT (AMENDMENT-REVIEW note 8, 2026-09-05): a second `start()`
   *  call — while a build is running, after it resolved, or after it
   *  rejected — REJECTS with `Error('vector boot: start already called')`;
   *  the original promise's settlement is authoritative. */
  start(): Promise<PromotionReport>
}

export interface VectorBootOptions {
  /** W2 seam — the provider's `embedBatch`, when available. */
  embedBatchFn?: (texts: string[]) => Promise<number[][]>
  /** W4 — the loaded persisted cache (§5.13). LANDED 2026-09-05 (W4 doc
   *  review: the option is live; absent callers → the W1–W3 no-op
   *  passthrough). */
  cache?: VectorCache
}

export function createVectorBootController(store: RagStore, provider: EmbeddingProvider, opts?: VectorBootOptions): VectorBootController
```

**RCA-3 amendment (2026-09-05, the W1 adversarial pass):** `PromotionReport`
gains `adopted: number` — the nodes ADDED during the build window (after the
`listNodes` snapshot) that the reconcile pass embeds + adds to the built index
before the swap (finding F-W1-2 in §3a; regression-tested in
`tests/vector-boot-adversarial.test.ts`).

**The promotion seam on the engine (NEW, W1 — LANDED 2026-09-05):** the `RetrievalEngine`
interface (`src/main/retrieval.ts:574-587`) gains a THIRD member:

```ts
export interface RetrievalEngine {
  query(query: string, opts?: { k?: number }): Promise<RetrievalResult>
  onStoreChanged(kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]): Promise<void>
  /** W1 — atomic ONE-WAY embedder promotion: replaces the closed-over
   *  embedder binding (`retrieval.ts:607-656` — the closure had NO setter
   *  pre-W1; the setter LANDED in W1) so
   *  the SAME engine instance serves lexical pre-swap and vector post-swap.
   *  Throws on a second call (one-way) or a null/undefined embedder. */
  setEmbedder(embedder: Embedder): void
}
```

- `setEmbedder(v)` is a SINGLE assignment of the closure `activeEmbedder`
  variable read by `query` (`retrieval.ts:617`, read at `:622`) and by the
  hook forward
  (`retrieval.ts:639`) — post-W1 line numbers. Every query observes exactly ONE embedder (R1: an
  in-flight pre-swap query completes on the OLD embedder with the same
  `RetrievalResult` shape; no torn/mixed results; §8.2 equivalence asserted
  in BOTH phases).
- The engine's LEXICAL index maintenance is UNCHANGED and continues in BOTH
  phases (`retrieval.ts:627-635`) — the pending phase scores with it;
  post-swap the vector embedder scores against its own VectorIndex.
- ONE-WAY fail-states: a second call throws `Error('retrieval engine:
  embedder promotion is one-way (already promoted)')`; a null/undefined
  `embedder` throws `Error('retrieval engine: embedder required')`.
  [Messages SpecWriter-pinned 2026-09-05 — the review pins the one-way
  semantics, not the strings.]

**main() wiring (W1 — the ONLY main.ts change; AMENDMENT-REVIEW finding 1
resolved — the CONTROLLER owns engine creation):** (1) the config check at
`main.ts:153-157` UNCHANGED; (2) `const provider = await
warmUpEmbeddingProvider(config)` — a rejection aborts boot before the window;
(3) `const boot = createVectorBootController(ragStore, provider, {
embedBatchFn: provider.embedBatch, cache })` — the controller
SYNCHRONOUSLY creates the born-lexical engine INTERNALLY
(`createRetrieval(ragStore, createLexicalEmbedder(createLexicalIndex(store.listNodes())))`
— the lexical default path, moved inside the controller) and exposes it as
`boot.engine`; main NEVER calls `createRetrieval` in vector mode; [W3 doc-review byte-check 2026-09-05: the LANDED W3 call was
`createVectorBootController(ragStore, provider, { embedBatchFn:
provider.embedBatch })` at `main.ts:163` — the `cache` arg in the pinned
final shape above arrives with W4. **W4 doc-review byte-check 2026-09-05 (the
W4 RCA-6 pass): the LANDED W4 call is `createVectorBootController(ragStore,
provider, { embedBatchFn: provider.embedBatch, cache: createVectorCache() })`
at `main.ts:168` — the pinned final shape above is now the LIVE call site
(the W3-era `main.ts:163` cite shifted +5 with the W4 wiring; the W4 greens'
WIRE-CACHE DEFERRED-STATIC row is closed on this verification).]** (4) the MCP
server + the IPC handlers are wired from `boot.engine` (the ONE shared
instance — R7 holds: the MCP server ALWAYS receives a live engine);
(5) window + `mcp.start()` immediately; (6) `void boot.start().catch(...)`
(F1 discipline). In lexical mode (the default) `main.ts:162-164` is unchanged
(pre-W1: `main.ts:153`).

**F-W2-3 amendment (2026-09-05, the W2 adversarial pass — spec-only,
Architect decision):** W3 owns the production wiring `embedBatchFn:
provider.embedBatch` at controller creation (main.ts) — the W1 sequential
loop is replaced by the batched build when W3 lands; the §5.2
sequential-default expression is pinned at that wiring. Until then the
`embedBatchFn?` option exists (W2) with NO production caller — the wiring
text in step (3) above is the W3 assignment, not a W1/W2 claim.

**Log milestones (pinned — review change-inventory item 6; strings
SpecWriter-pinned 2026-09-05):** `vector boot: pending (born-lexical)` →
`vector boot: build complete (embedded N, cacheHits M, re-embedded R,
skipped empty e / transient t)` → `vector boot: promoted`; a total build
failure logs `vector boot: build failed (staying pending): <error>`; a
per-node transient failure (W3) logs
`vector index: node embed failed (transient): <nodeId> <error>` (RE-PINNED
2026-09-05, RCA-3 pass 2 finding F4 — was mis-pinned as `vector boot: node
embed failed (transient): …`; the log site is the INDEX layer
(`src/main/embeddings.ts` `warnTransientSkip`), outside boot). Failure
classes (1/2/3) are distinguishable in the output.

**Promotion pins (review A4/R1/R2 — pin-by-test):** (a) an in-flight
pre-promotion query completes on the OLD embedder with the same
`RetrievalResult` shape; (b) a post-promotion query uses the new embedder; no
mixed index observable; §8.2 equivalence asserted in BOTH phases; (c) the
`onStoreChanged` hook attaches with the swap (`retrieval.ts:639`); (d) the
reconcile tie rule (`updatedAt > embedAt` → re-embed; `===` → unchanged);
changed nodes re-embed BEFORE the swap; (e) a pre-swap edit landing after the
reconcile re-check but before the swap completes leaves that node on its
pre-edit embedding until its NEXT touch via the attached hook — a PINNED,
documented window (the reconcile-to-swap gap; the promotion log reports the
re-embedded count). The boot-equivalence test asserts the MCP server always
receives a live engine (R7).

**Unit decomposition + spec-section → unit mapping (the W1 → W2 → W3 → W4 →
W5 order; each unit its own red→green→adversarial→greens cycle, RCA-2/5):**

| Unit | Spec sections | Test files (names SpecWriter-pinned 2026-09-05) |
| --- | --- | --- |
| **W1** boot model + promotion (this section; §5.5 prebuilt-index adoption `opts.index` — AMENDMENT-REVIEW finding 3; §5.7 amendment; §5.9 #37/#38/#42/#43/**#44**; §5.8 #27–33) | §5.12 + §5.5 + §5.9 | `tests/vector-boot.test.ts` (+ `tests/vector-boot-adversarial.test.ts`) |
| **W2** batch seam (§5.2 "Batch seam"; §5.3 batch build path; §5.9 #39–41; §5.8 #37–39) | §5.2/§5.3 | `tests/embeddings-batch.test.ts` (the `tests/embeddings.test.ts:380-386` reject contract stays GREEN until W3) |
| **W3** failure policy (§5.3 `skipped` map + the empty-guard extension + the embed-failure flip; §5.8 #34–36; §5.9 #45–48) + the F9→F10 comment cleanup in `src/main/embeddings.ts:545-549` post-W2 (`309-313` pre-W2) (AMENDMENT-REVIEW note 12 — the pass that touches those lines retires the stale F9 tag) | §5.3/§5.9 | `tests/embeddings-failure-policy.test.ts` + the re-pin of `tests/embeddings.test.ts:380-386` |
| **W4** persisted cache (§5.13; §5.9 #49–51; §5.8 #40–42) | §5.13 | `tests/vector-cache.test.ts` |
| **W5** live cache write-through (§5.13's W5 amendment — the promoted embedder's `score`/`place` + maintenance embeds route through the ONE single-text memoizer; the §5.5 `cache?` amendment; §5.12's promote step passing the SAME cache instance) | §5.13 (the W5 amendment) + §5.5 | `tests/live-embed-cache.test.ts` (L1–L7 + R1–R5) |

### 5.13 The persisted embedding cache (W4 — the cache-inclusive variant, IN-SCOPE per the user go-ahead 2026-09-05)

**[2026-09-05 amendment — source: review record §4a. The user approved the
"vectorize only if the vector is not found" model; the previously PARKED
cache (review §2 parked item 2) is PROMOTED to core contract; the
`docs/pending.md` parked row is SUPERSEDED (2026-09-05).]**

- **File:** `provident-vector-cache.json` in Electron `userData`
  (`join(app.getPath('userData'), 'provident-vector-cache.json')`) — the
  module-store idiom: same directory, same atomic temp+rename write, one
  main-process writer.
- **Format (pinned):**
  `{ "version": 1, "entries": [ { "kind": "ollama", "model":
  "embeddinggemma", "dimension": 768, "contentHash": "<lowercase hex
  sha-256>", "vector": [...], "savedAt": <epoch ms> } ] }`.
- **Key (the decision VECTOR-CACHE-CONTENT-HASH-KEY):** (provider kind, model,
  dimension, contentHash). `contentHash` = the lowercase-hex SHA-256 of the
  EXACT embedded text (the string passed to the embed fn — `node.content` at
  build; the SAME raw-bytes discipline as `nodeSource` — hash the exact
  string bytes, no normalization. AMENDMENT-REVIEW note 9, 2026-09-05: this
  is plain SHA-256 of the embedded TEXT, NOT the nodeSource record
  serialization). **Invalidation:** a hash mismatch (content changed) OR a
  key mismatch (provider/model/dimension changed) → a MISS → re-embed; the
  new entry overwrites on write-through. **Known limitation (§3a F-W4-7,
  2026-09-05):** invalidation is hash+tuple keyed ONLY — an entry whose key
  matches but whose VECTOR is wrong (a poisoned entry) is served as a hit;
  the invalidation paths are deleting the cache file (a fresh full embed) or
  changing the model/dimension tuple.
- **Load:** at controller creation (W4 wiring), the cache file is read
  synchronously; entries whose `vector` is not an array of finite numbers
  with length === their `dimension`, or whose fields are missing/wrong-typed,
  are DROPPED. **Fail-states (§5.9 #49/#51):** an absent/unreadable file,
  invalid JSON, a non-object root, or a wrong/absent `version` → the cache is
  treated as EMPTY (a full re-embed) + logged; the load NEVER throws and boot
  NEVER crashes on the cache.
- **Adoption ("vectorize only if the vector is not found"):** the cache is a
  MEMOIZING WRAPPER around the embed fns — the controller supplies
  `createVectorIndex` a wrapped `embedFn`/`embedBatchFn`: a key HIT adopts
  the cached vector with NO HTTP call; a MISS embeds through the provider and
  writes the entry through. The batch wrapper preserves positional alignment
  (hits adopted in place, misses batch-embedded; the assembled array length
  === texts.length). `createVectorIndex` itself stays cache-agnostic.
- **Write timing (PINNED — one of the two candidate models):** WRITE-THROUGH
  after each successful embed: the new entry is enqueued on the controller's
  SINGLE-WRITER queue and persisted with an atomic temp+rename write,
  serialized (never concurrent), NOT awaited by the embed loop (disk never
  throttles the build). The queue is DRAINED before the promotion report
  resolves (the persisted cache reflects the promoted index). Rationale: this
  matches every store in this project (per-write persistence + one writer).
  **RCA-3 F1 amendment (2026-09-05, the W4 adversarial pass):** `set()`
  COALESCES — it mutates the in-memory map and schedules AT MOST ONE trailing
  whole-map write on the module-level `CACHE_WRITE_DEBOUNCE_MS = 500`
  debounce (exported from `src/main/vector-cache.ts`); the pending write
  executes with the map state AT EXECUTION TIME (later sets need no new
  job), `flush()` cancels the pending timer + forces the write when dirty
  (the drain-before-report pin above holds), and the atomic temp+rename
  write, single-writer serialization, never-awaited-by-the-embed-loop
  timing, and non-fatal recovery are unchanged.
- **Write failure (§5.9 #50):** NON-FATAL — logged; the in-memory index and
  the promotion continue; the next successful write recovers the file.
- **Pruning (pinned):** at promotion the cache is COMPACTED: entries whose
  (kind, model, dimension) ≠ the current provider tuple, OR whose
  `contentHash` matches NO current store node's embedded text (the hash set
  of the non-empty contents), are dropped; the file is rewritten ONCE after
  the drain. Oversized growth is thereby bounded by the live corpus.
- **Census:** the promotion report carries `cacheHits` (§5.12) — the FIRST
  boot embeds the full corpus in the background; later boots embed only
  new/changed nodes (cache misses).
- **W5 amendment (2026-09-05, user directive "live upload should also update
  the cache"):** the memoizing wrapper applies to ALL vector-embed paths of
  the PROMOTED embedder when a cache is supplied — not only the boot build.
  `createVectorEmbedder` gains an optional `cache?: VectorCache` (§5.5
  amendment): the promoted embedder's `score` query-embeds AND its
  `onStoreChanged` maintenance embeds (`addToVectorIndex`/`updateVectorIndex`)
  route through a single-text memoizer — a live embed whose content matches a
  cached hash adopts with NO HTTP call; a live embed of NEW/CHANGED content
  embeds through the provider AND writes through to the persisted cache
  immediately (the cache's own debounced queue persists it — no explicit
  flush is needed post-promotion; the drain-before-report pin is a boot-time
  guarantee and the F-W4-6 quit-tail note still applies to a quit mid-debounce).
  The promote step passes the SAME `VectorCache` instance it used for the
  build (the shared in-memory map makes build-time entries live-hittable).
  The boot build's batch wrapper + census are UNCHANGED. `place()`'s
  content-embed routes through the SAME single-text memoizer — `place()`
  embeds its content by scoring it through `score` (supervisor ruling
  2026-09-05 on the W5 TestWriter's Q1). The
  shape-validation + poison-entry limitation (hash+tuple invalidation only)
  applies identically to the live path. **RCA-3 pass-2 amendment (F1/F2, the
  Architect ruling, 2026-09-05):** query-embed misses are adopted in-memory
  only (session-scoped, not persisted — closing the inter-prune growth bound
  and query-hash disk retention); only maintenance (node-content) embeds
  write through (`embed(text, { persist: true })`; the L4 one-HTTP-call pin
  holds via in-memory adoption). Regression-pinned by
  `tests/live-embed-cache.test.ts` R1–R3 + the re-pinned L4 tail.
  **W5 implementation pins (2026-09-05, the W5 RCA-3 pass 2 — §3a
  F-W5-2/F-W5-3):** the memoizer is built `persistMisses: false` (the
  DEFAULT) with the per-call `{ persist: true }` split (the query path calls
  `embed(text)` bare; the maintenance path passes the flag); the hit-check
  dimension is read PER EMBED from the live provider object (F-W5-2 — a cold
  auto-detect provider becomes hit-eligible once its first embed latches the
  dimension; pinned R4); a non-string text rejects with the PINNED
  `cache memoizer: text must be a string` guard BEFORE hashing (F-W5-3;
  pinned R5); the hash helper is the module's shared `contentHashOf`
  (exported from `src/main/vector-cache.ts` — the boot wrapper and the live
  memoizer hash through the ONE function).
  **RCA-3 pass-2 note (F4, doc-only):** a poison HIT (a wrong-length entry —
  only constructible out-of-contract) fails the index-layer F6 check OUTSIDE
  the embed try/catch → the hook REJECTS (caught + logged non-fatal at the
  four reconcile call sites: the two `IPC_EDIT_*` handlers + the rich-commit
  handler's reconcile wrapper in `src/main/main.ts`, and the MCP edit-tool
  wiring in `src/main/mcp-server.ts`), NOT a W3 transient skip — the pinned
  hit-served/prune-invalidation posture applies.
- **The `VectorCache` seam (AMENDMENT-REVIEW finding 4, 2026-09-05 — the type
  referenced by `VectorBootOptions.cache?` is THIS):**

  ```ts
  // src/main/vector-cache.ts (W4 — pure + injectable; no Electron)
  export interface CacheKey { kind: string; model: string; dimension: number; contentHash: string }

  export interface VectorCache {
    /** A HIT returns the cached vector (no HTTP call); a MISS returns
     *  undefined (the caller embeds + writes through). */
    get(key: CacheKey): number[] | undefined
    /** Write-through: enqueues the entry on the single-writer queue
     *  (atomic temp+rename, serialized, never awaited by the embed loop). */
    set(key: CacheKey, vector: number[]): void
    /** At promotion: drop entries outside `keepKeys` (or with a foreign
     *  provider tuple), then rewrite the file ONCE. */
    prune(keepKeys: Set<string>): void
    /** Drain the write queue; resolves when the file reflects every set(). */
    flush(): Promise<void>
  }

  /** The factory reads the file SYNCHRONOUSLY at creation (the load
   *  fail-states above apply — corrupt/absent → an EMPTY in-memory cache +
   *  logged, NEVER a throw). `opts.path` defaults to
   *  `join(app.getPath('userData'), 'provident-vector-cache.json')`. */
  export function createVectorCache(opts?: { path?: string }): VectorCache
  ```

  **Load ownership (resolves the §5.13/`VectorBootOptions` contradiction):**
  the FILE is read at `createVectorCache(...)` call time; the W4 wiring
  constructs the cache AT controller-creation time
  (`createVectorBootController(ragStore, provider, { cache:
  createVectorCache() })`), so the controller creation remains synchronous
  and the cache is fully loaded before the background build starts.
  **Batch-fallback routing (pinned):** the W2 per-item fallback routes
  through the SAME memoizing wrapper (NOT the raw provider) — a
  fallback-embedded text is a cache write-through like any other embed.
  **§5.9 #49–#51 log strings (pinned):** a load failure logs
  `vector cache: load failed (treating as empty): <error>`; a write failure
  logs `vector cache: write failed (non-fatal): <error>`; the promotion
  prune logs `vector cache: pruned to N entries`.
  **W4 implementation pins (2026-09-05, the W4 green pass — one line
  each):** (a) `prune(keepKeys)` elements are contentHash STRINGS for the
  CURRENT provider tuple — the controller builds the set from the live
  store's non-empty embedded texts, and the cache drops foreign-tuple
  entries and hashes outside the set; (b) the ABSENT-file case is NOT
  silent — per §5.9 #49 (which groups "an absent/unreadable file" under
  "+ logged", pinned by the W4 red set, test 2a) the first cold start logs
  the SAME `vector cache: load failed (treating as empty)` line as the
  unreadable/corrupt/wrong-version cases, and the load never throws either
  way; (c) the prune census log is emitted by `VectorCache.prune` (the
  cache layer) — one line per prune, after the in-memory compaction, with
  the one-shot rewrite enqueued on the single-writer queue.
  **W4 adversarial hardening pins (2026-09-05, the W4 RCA-3 pass — §3a
  F-W4-1..F-W4-3):** the write is COALESCED on the exported
  `CACHE_WRITE_DEBOUNCE_MS = 500` debounce (F-W4-1, the F1 amendment
  above); the load-failure log's interpolated error is SANITIZED — quoted
  corrupt-file snippets are stripped before logging (F-W4-2); BOTH the
  cache path and the `<path>.tmp` write path carry lstat REGULAR-FILE
  guards (a symlink/FIFO/directory/device is a load failure / the non-fatal
  write skip — never read through, never written through, never a
  main-thread block) and the tmp file is created mode `0o600` (F-W4-3).
  Regression tests: `tests/vector-cache.test.ts` R1–R8.
