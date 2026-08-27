# Spec — Unit F: Vector Embeddings (Provider/Model Agnostic)

- **Status:** SPEC (later unit, Unit F). Gate reference:
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
  implementation.

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
  config.timeoutMs })` (a remote/cloud provider — a drop-in).

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
- A timeout (the request exceeds `timeoutMs`) → the returned promise REJECTS
  with `Error('ollama embed: timeout after <timeoutMs>ms')` (ollama) or
  `Error('remote embed: timeout after <timeoutMs>ms')` (remote/cloud).
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
- An `embedFn` rejection (e.g. the provider is down) propagates from the index
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
   *  between providers. */
  provider: EmbeddingProviderConfig
  /** The placement minimum score threshold. Default PLACEMENT_MIN_SCORE (0). */
  placementMinScore?: number
}

/** Create the vector embedder. Builds the vector index from the store's nodes
 *  (embedding each once) via the configured provider. ASYNC. */
export function createVectorEmbedder(store: RagStore, opts: VectorEmbedderOptions): Promise<Embedder>
```

**Construction:**

- Creates the provider via `createEmbeddingProvider(opts.provider)`.
- Builds the vector index from the store's nodes
  (`createVectorIndex(store.listNodes(), provider.embed)`).
- Returns an `Embedder` whose `score`/`place` are async and whose
  `onStoreChanged` maintains the vector index.

**`score(query, nodes)` (async):**

- Computes the query embedding (`await provider.embed(query)`).
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

### 5.10 Census / numeric claims

- **Provider kinds:** 2 concrete (`ollama` — local; remote/cloud — generic
  OpenAI/Cohere/etc.) behind ONE `EmbeddingProvider` interface.
- **`EmbeddingProvider` interface members:** 5 (`kind`, `model`, `baseUrl`,
  `dimension`, `embed`).
- **`EmbeddingProviderConfig` fields:** 6 (`provider`, `baseUrl`, `model`,
  `apiKey?`, `dimension?`, `timeoutMs?`).
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
