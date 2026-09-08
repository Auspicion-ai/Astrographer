# Spec — Unit U-H5: The Teardown Primitives (A-P2-8) — `teardown()` on RagStore / RetrievalEngine / VectorBootController

> **STATE (2026-09-08): U-H5 — the teardown PRIMITIVES — is LANDED (22/22 via
> `tests/unit-h5-teardown.test.ts`; full suite 2687 pass / 41 skip, typecheck +
> build clean; see the Unit U-H5 DONE row in `docs/next-steps.md`). U-H5 landed
> the NEW `teardown()` primitives the later slice units (U-H4 drain-then-teardown
> hot-remove, U-H6 hot-rename, U-H7 default reassignment) consume — WITHOUT
> wiring any caller (the U-H2 runtime module KEEPS its A-P2-8 "no teardown
> call" negative pin). This was a BUILD spec: it pinned the interface additions,
> the per-concrete teardown semantics, the drain seam, the byte-pinned messages,
> the red-set expectation, and the §7 design questions (all five resolved and
> Architect-ruled CONFIRMED).**

- **Status: SPEC (LANDED 2026-09-08)** — the registry hot-apply/removal/rename
  slice, Unit U-H5 (the teardown primitives), is LANDED; the execution order
  continues U-H1 → U-H2 → U-H3 → **U-H5 (LANDED)** → U-H4 → U-H6 → U-H8; U-H7
  (default reassignment) is split out and CONSUMES U-H5's primitives. The next
  cycle is **U-H4 (hot-remove, drain-then-teardown)**. Gate reference:
  `docs/specs/registry-hot-apply-review.md` §2 **D7** (mid-flight consistency —
  remove drain-then-teardown; **REQUIRES NEW `teardown()` primitives on
  `RagStore`/`RetrievalEngine`/`VectorBootController`**), **D8** (the unit
  decomposition — "U-H5 teardown"), **D3** (hot-remove ORPHAN — teardown must
  NEVER delete the store persistence file or the cache file), **D5/D8/A-P2-4**
  (default reassignment is U-H7, which CONSUMES teardown); §5 "Impact on
  existing contracts" (**A-P2-8** — the new `teardown()` primitives land in
  U-H5 with their own red set); **A-P2-2** (`stores:"all"` drain-then-teardown
  so a removed engine is never mid-query — U-H5 lands the drain CHECK seam,
  the orchestration is U-H4); §6 (the live-scenario PARKED by user
  instruction). Consumed dependency: the U-H2 runtime module
  `src/main/rag-store-runtime.ts` (its A-P2-8 negative pin must STAY GREEN),
  `docs/specs/unit-h2-runtime-controller.md` §4 (**REBUILD-ALL-OF-NON-DEFAULT**:
  "the old non-default entries are ORPHANED ... no `teardown()` — U-H5/A-P2-8"),
  §5.7 (the N1/A-P2-8 negative pin that currently FORBIDS the runtime module
  from tearing down — the seam will now EXIST but the runtime must NOT call
  it), and the interface contracts it extends (`docs/specs/unit-a-rag-store.md`,
  `docs/specs/unit-e-rag-index.md`, `docs/specs/unit-f-embeddings.md` §5.12/
  §5.13, `docs/specs/unit-ms2-store-wiring.md` — the `RagStoreEntry` shape).

- **Scope:** the NEW `teardown()` primitives + the interface additions, as
  their OWN red set — on THREE interfaces, each with an idempotent NO-OP
  release semantics, PLUS the drain seam (an engine in-flight-query check).
  Files touched: `src/main/rag-store.ts` (the `RagStore` interface +
  `createJsonRagStore`), `src/main/adjacency.ts` (`createSnapshotStore` — the
  NO-OP reference teardown), `src/main/retrieval.ts` (the `RetrievalEngine`
  interface + `createRetrieval` + the optional `Embedder.teardown?` hook),
  `src/main/vector-boot.ts` (the `VectorBootController` interface +
  `createVectorBootController`). This unit does NOT wire any caller (U-H2's
  runtime module does NOT call teardown — A-P2-8; no `hotApply` remove/rename/
  default branch calls it — U-H4/U-H6/U-H7), does NOT touch `main.ts`/
  `mcp-server.ts`/`rag-store-runtime.ts`/`rag-store-directory.ts`/
  `rag-store-registry-write.ts`, does NOT re-author the U-MS5 settings-pane
  listing or the `stores:"all"` fan-out, does NOT add an MCP tool or an IPC
  channel (D6), and does NOT change any page design.

- **TestWriter contract:** every interface/method signature, return shape,
  throw pattern, happy-path state, and fail-state below is derivable from this
  spec ALONE. The TestWriter writes the U-H5 red set into the SpecWriter-pinned
  file `tests/unit-h5-teardown.test.ts` (§5.9), in the house red-first order
  (RCA-1), reporting the failing set BEFORE the Implementer goes green. **The
  red set asserts the `teardown()`/`inFlight()` interface additions EXIST and
  are callable — and FAILS on the pre-U-H5 code because those members are
  absent (RCA-1: `teardown` is not a function / `undefined`).** The §7 design
  questions are ruled CONFIRMED (2026-09-08, the Architect ruling below) — the
  TestWriter derived the red set against that ruling.

---

## 1. What the proposal asks (the U-H5 slice)

The registry hot-apply slice (review §2 D7) needs a teardown capability so a
later hot-remove (U-H4), hot-rename (U-H6), or default-reassignment (U-H7) can
RELEASE a store's resources when it leaves the live registry. Today (post-U-H2)
each non-default rebuild ORPHANS the prior entry's store/engine (a file handle
+ lexical index + possibly a vector-boot build) — documented as a "bounded
resource hold" until U-H5 lands (`unit-h2-runtime-controller.md` §3). U-H5's job:

1. **A NEW `teardown()` primitive on `RagStore` (A-P2-8 / D7):** each concrete
   store (`createJsonRagStore`, `createSnapshotStore`) implements an idempotent
   resource-release that a remove/rename/default-reassignment can call to drop
   the store's write resources WITHOUT deleting the persisted data (D3 — the
   file is never deleted).
2. **A NEW `teardown()` primitive on `RetrievalEngine` (A-P2-8):** the engine
   releases/revokes its service seam — a torn-down engine stops serving
   `query`/`onStoreChanged`/`setEmbedder` (idempotent) and forwards to an
   optional embedder teardown hook (absent from every current embedder → a
   no-op in U-H5).
3. **A NEW `teardown()` primitive on `VectorBootController` (A-P2-8):** the
   background build controller's teardown CANCELS an in-flight background
   build (rejects the reconcile-promise), marks the controller stopped, and
   forwards its engine's teardown — WITHOUT deleting/corrupting the persisted
   vector-cache file (content-addressed, left intact — §7 Q2).
4. **The drain SEAM, not the orchestration (A-P2-2):** U-H5 lands the CHECK
   primitive the later drain-then-teardown consumes — the engine exposes an
   in-flight-query counter (`inFlight()`). The U-H4 orchestration (a remove
   reads `inFlight()`, awaits 0, THEN tears down) is NOT U-H5's (deferred to
   U-H4). §7 Q3.
5. **The U-H2 runtime module's A-P2-8 negative pin STAYS GREEN:** the seam
   now exists, but `src/main/rag-store-runtime.ts` does NOT call `teardown()`,
   does NOT define a teardown primitive, and the landing `tests/unit-h2-runtime-controller.test.ts`
   N1/N2 + A-P2-8 negative-pin tests are UNCHANGED and stay green (the callers
   are U-H4/U-H6/U-H7).
6. **Explicitly OUT:** the FULL drain orchestration (U-H4), the hot-remove
   caller (U-H4), the hot-rename caller (U-H6), the default-reassignment
   caller (U-H7), the vector-boot cache-release/flush handoff on
   default-reassignment (U-H7 — §7 Q2), the operator-UI IPC trigger (U-H8),
   and any change to the `stores:"all"` fan-out resolution.

## 2. Feasibility verdict

**Feasible — grounded entirely in the existing host constructors and interfaces;
no engine gap, no new module, no wire-up.**

- **The store is already resource-light and fail-safe:** `createJsonRagStore`
  holds NO open file handle (reads/writes are synchronous per-operation file
  I/O; `rag-store.ts:690-753`); its only "resource" that teardown must settle
  is the single-writer promise-chain write queue (`rag-store.ts:716-734`) and
  the lazily-built adjacency index (`rag-store.ts:702-713`), both in-memory.
  Teardown = drain the queue + mark torn-down (revoke future mutations) +
  leave the persisted file intact. `createSnapshotStore` (`adjacency.ts:170`)
  is a read-only in-memory adapter whose mutators ALREADY throw
  `createSnapshotStore: read-only` — its teardown is a pure idempotent NO-OP
  (the reference no-op semantics).
- **The engine holds no OS resource and is a clean stop-serving seam:**
  `createRetrieval` (`retrieval.ts:611`) holds the `activeEmbedder` binding,
  the shared LexicalIndex (in-memory Maps), and a `promoted` one-way latch —
  no timer, no lock, no file handle. Teardown = mark stopped (revoke
  `query`/`onStoreChanged`/`setEmbedder`) + forward to an optional
  `embedder.teardown?` hook (never required; no current embedder implements
  it). Because `tests/` is EXCLUDED from the trio's typecheck (tsconfig.json
  `include: ["src/**/*.ts"]`, `exclude: [..., "tests"]`) and vitest uses
  esbuild (transpile-only, no typecheck), adding REQUIRED members to the
  source interfaces does NOT break any existing test literal at the trio level
  (§5.9).
- **The vector-boot controller is single-shot and owns the build + cache:**
  `createVectorBootController` (`vector-boot.ts:110`) holds the background
  `build()` promise (single-shot `start()` → `vector boot: start already
  called`), the `phase`, the `builtIndex`, the `skipped` map, and the W4
  `cache`. Its teardown must: (a) reject an in-flight `start()`/reconcile
  promise (`vector boot: torn down`), (b) mark stopped (a later `start()`
  rejects the same message), (c) forward `engine.teardown()`, (d) leave the
  content-addressed cache FILE intact (it is keyed by
  kind/model/dimension/SHA-256-contentHash and reusable across stores —
  `vector-cache.ts:40-50`; deleting it would destroy a cross-remove warm cache,
  contradicting D3's never-delete).
- **The drain seam is already observable:** `RagStoreEntry` holds per-store
  `engine` (`rag-store-directory.ts:62-81`); the MCP/UI fan-out resolves each
  store's engine per call (`mcp-server.ts:250,376`, `:1608-1609`). An
  in-flight-query counter on the engine is additive (+1 member) and
  node-testable; it does NOT change retrieval behavior. A-P2-2's full
  drain-then-teardown orchestration needs it; U-H5 lands the count, U-H4 the
  orchestration.

No engine gap — every change is host-side (`src/`), additive to existing
constructors/interfaces, node-testable, and consumes only LANDED contracts
(U-H2's runtime + the U-A/E/F/MS2 store/engine/embedder/boot surfaces).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The new `teardown()` members on the THREE interfaces + the concrete implementors | Project-specific (additive members on `RagStore`/`RetrievalEngine`/`VectorBootController` in `src`; the concrete `createJsonRagStore`/`createSnapshotStore`/`createRetrieval`/`createVectorBootController` implement them) | Medium cost; the entire teardown surface becomes node-testable with an idempotent/no-op contract that the U-H4/U-H6/U-H7 callers then consume. This closes the "bounded resource hold" gap the U-H2 spec documented. |
| The optional `Embedder.teardown?` forward-only hook | Project-specific (additive OPTIONAL member — no current embedder implements it; avoids breaking any embedder literal) | Near-zero cost; gives the engine teardown a future embedder-release seam without coupling to the vector cache (the cache is the boot controller's, not the engine's). |
| The drain SEAM — `RetrievalEngine.inFlight()` | Project-specific (additive +1 member on the engine; node-testable) | Low cost; the CHECK primitive A-P2-2 needs. Full orchestration (read → await 0 → teardown) is U-H4. |
| The vector-cache release on boot-controller teardown | Project-specific (surfaced in §7 Q2) | The cache FILE is content-addressed and reusable; U-H5 defaults to NOT deleting/flushing it (D3 never-delete). Whether U-H7's default-reassignment flushes/hands off the cache is deferred to U-H7 (§7 Q2). |
| The U-H2 runtime module keeps its A-P2-8 negative pin | Project-specific (runtime must NOT call teardown in U-H5) | Zero cost to U-H5; keeps the N1/N2/A-P2-8 negative-pin tests green. The CALLS land in U-H4/U-H6/U-H7. |

No engine gap — the module changes are entirely additive (`src/`), node-testable,
and consume only LANDED contracts. No new module, no main/mcp change, no IPC/MCP.

### 3a. Adversarial findings (registered — the U-H5 adversarial pass RUNS after the green, per RCA-3; placeholder + pre-registered probes)

The RCA-3 read-only adversarial pass on the U-H5 green runs BEFORE the unit is
reported done; host findings (ids `F-H5-*`) are fixed here + regression-tested;
an engine (provident-ssr) finding, should one ever surface, is a
`docs/defects.md` + `docs/HANDOFF.md` item, NEVER a package patch (AGENTS.md
item 7).

**Pre-registered edge probes (the adversarial pass MUST confirm on the landed
code):**

- A DOUBLE teardown of every concrete (store/snapshot/engine/boot) is a safe
  NO-OP that resolves with `undefined` (idempotency — the U-H5 §5.6 H-rows).
- A teardown then an immediately-following mutation (`putNode`/`query`/`start`)
  on the torn-down object FAILS LOUD with the pinned message (§5.5); a
  teardown then a READ on the torn-down store still RESOLVES (reads are safe;
  only mutations are revoked — §5.4).
- An engine teardown while a `query()` is in flight does NOT cancel the
  in-flight query (it completes on the old embedder and settles) — the U-H4
  drain (via `inFlight()===0`) is what guarantees no in-flight query at
  teardown; a mid-query teardown is a caller error, documented not silently
  corrupted (§5.7 F8).
- A boot-controller teardown mid-background-build rejects the outstanding
  `start()` promise with `vector boot: torn down` and leaves the vector-cache
  FILE byte-identical (no delete, no flush in U-H5).
- NO U-H5 change calls `teardown()` from `rag-store-runtime.ts`/`main.ts`/
  `mcp-server.ts` — the A-P2-8 runtime negative pin stays GREEN (grep-level,
  §5.8).

**Adversarial findings (registered after the U-H5 green):**

- **F-H5-1 (MEDIUM — HOST, fixed + regression-tested):** the landed teardown
  only cancelled an in-flight build in the OBSERVABLE sense — it rejected the
  `start()` deferred with `vector boot: torn down` and awaited THAT promise's
  settle, but the background `build()` loop kept running to completion
  (store.enqueue → embed loop → `cache.set`/`cache.flush` → `engine.setEmbedder`),
  so it could rewrite the persisted vector-cache FILE AFTER `boot.teardown()`
  had resolved — violating the §5.6 H11 / D3 "cache byte-identical after EVERY
  teardown path" invariant. The pre-existing H11 test only exercised a build
  gated BEFORE the first embed (no `cache.set` run), leaving the free-running
  already-embedded case unverified. **Fix (genuine cancel, landed in this
  pass):** `createVectorBootController` threads an internal abort token
  (`aborted` + `assertNotAborted()` — a plain flag/promise, NO AbortController
  dependency) that the build loop checks at every await boundary (after
  `store.enqueue`, after `createVectorIndex`, per reconcile/adopt iteration,
  before the `cache.flush()`/`prune` block, before `engine.setEmbedder`/
  `promote`) and in the cache wrappers before each `cache.set` (a write that
  must not run after teardown); `teardown()` NOW (a) rejects the `start()`
  deferred, (b) sets `aborted`, and (c) AWAITS the REAL `build()` settlement
  (a captured `buildPromise`, not just the deferred) before resolving — so NO
  store mutation, engine `setEmbedder`, or cache write outlives `teardown()`.
  The cancellation is thrown internally as a `CancelledBuildError` and rethrown
  UNLOGGED (not a real build failure — the §5.5 "0 new console lines" pin; it
  is never observed by the `start()` caller, who sees `vector boot: torn
  down`). The existing no-fail/void + idempotent + STOPPED contract and the
  byte-pinned messages are preserved intact; `cache.set` guarded by `if
  (!aborted)` so an already-embedded abort leaves the cache file untouched.
  **Regression:** H11 was reworked to release its gate before awaiting teardown
  (the genuine cancel BLOCKS teardown on the gated embed, so the gate must
  release for the build to short-circuit) and the NEW **H12** covers the
  already-embedded in-flight case (≥1 embed + `cache.set` run when teardown
  fires) and asserts: the cache FILE stays byte-identical, `boot.phase()`
  stays `'pending'` (never promoted — no `setEmbedder`/`flush` outlives
  teardown), and `start()` rejects `vector boot: torn down`. H12 was RED on the
  pre-fix teardown (the freed build rewrote the cache file) and GREEN after.
- **F-H5-2 (INFO — HOST, census corrected + recorded):** the §5.5/§5.10
  member-signature census was initially overstated as **7** and is now **5** —
  the three REQUIRED `teardown(): Promise<void>` members (RagStore /
  RetrievalEngine / VectorBootController) + `RetrievalEngine.inFlight(): number` +
  the OPTIONAL `Embedder.teardown?(): Promise<void>` hook (a forward-only member,
  not a required signature addition). The corrected census **5** (§5.5 / §5.10)
  matches the landed interfaces (verified against the build in the doc-review
  pass). Census correction already applied to §5.5/§5.10; this row records the
  finding for the adversarial record.
- **F-H5-3 (INFO — record ONLY, DO NOT fix; a U-H4 drain-then-teardown
  awareness note):** a `createJsonRagStore.teardown()` may HANG if a caller
  enqueued a never-settling promise onto the store's single-writer queue before
  teardown (the queue drain awaits the chain tail). This is pre-existing
  single-writer-queue semantics, NOT a U-H5 regression — U-H5 defines the
  teardown primitive, and U-H4's drain-then-teardown orchestration must AWAIT
  build/query settlement (via `engine.inFlight()`) rather than assume teardown
  itself settles any caller-held resource. No code change is made in U-H5; the
  note is registered here for U-H4's owner.

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:
- **D7 (binding):** remove drain-then-teardown; **REQUIRES NEW `teardown()`
  primitives on `RagStore`/`RetrievalEngine`/`VectorBootController`.** Pinned in
  §4/§5.
- **D8 (binding):** the unit decomposition — "U-H5 teardown" with its own red
  set (the review §5 A-P2-8: "the new `teardown()` ... lands in U-H5 with its
  own red set"). Pinned §5.9.
- **A-P2-8 (bound):** the new `teardown()` primitives land in U-H5; U-H2's
  runtime module does NOT call them. Pinned §5.8 (negative pin stays green).
- **A-P2-2 (bound):** `stores:"all"` resolves a current snapshot atomically;
  drain-then-teardown so a removed engine is never mid-query. U-H5 lands the
  drain CHECK (`inFlight()`); the orchestration is U-H4.
- **D3 (bound):** hot-remove ORPHAN — teardown NEVER deletes the store
  persistence file or the journal, and U-H5 never deletes the vector-cache file.

## 4. Design decisions pinned by this spec

- **TEARDOWN-ASYNC (new — §7 Q1, resolve to ASYNC):** every `teardown()`
  signature is **`teardown(): Promise<void>`** — ASYNC, resolving with
  `undefined`, **NEVER throwing and NEVER rejecting (the no-fail/void
  contract, §7 Q5)**. ASYNC across all three because: (a) the store must DRAIN
  its async single-writer queue (a sync teardown cannot await a pending
  `putNode`); (b) the boot controller must await the rejection-settlement of an
  in-flight build; (c) a uniform signature simplifies the U-H4/U-H6/U-H7 caller
  contract. **IDEMPOTENT (the U-H5 §4 pin):** a second `teardown()` on any
  concrete resolves immediately with `undefined` (a safe NO-OP — a torn-down
  object may be torn down again).
- **STORE-TEARDOWN-REVOKES-MUTATION-ONLY (new):** `createJsonRagStore.teardown()`
  (i) sets a `tornDown` flag, (ii) AWAITS the single-writer queue's tail (`rag-store.ts:716-734`)
  so any mutation enqueued BEFORE the teardown settles, then (iii) resolves
  with `undefined`. AFTER teardown: the MUTATING methods — `putNode`/
  `removeNode`/`putEdge`/`removeEdge`/`applyBatch`/`undo`/`redo`/`enqueue` (of
  new work) — each FAIL LOUD with the pinned `rag store: torn down` (§5.5);
  the READ methods — `getNode`/`listNodes`/`getEdge`/`listEdges`/`status`/
  `journal`/`undoDepth`/`redoDepth`/`edgesFrom`/`edgesTo`/`edgesByKind`/
  `edgesForDocument`/`docHeadForDocument` — STILL RESOLVE (a torn-down store is
  read-safe; the persisted file + in-memory state are intact). The persistence
  file + journal are NEVER deleted/touched by teardown (D3); `persist()` is a
  no-op after teardown because no mutation can reach it.
- **SNAPSHOT-STORE-TEARDOWN-NOOP (new):** `createSnapshotStore.teardown()` is
  the REFERENCE idle/no-op teardown — it resolves with `undefined`, is
  idempotent, and changes NOTHING else (the adapter is already read-only; its
  mutators keep throwing the existing `createSnapshotStore: read-only`, NOT the
  torn-down message — the adapter has no lifecycle queue). This is the "NO-OP
  teardown must not disturb" guarantee the gate names.
- **ENGINE-TEARDOWN-STOP-SERVING (new):** `createRetrieval.teardown()` (i) marks
  the engine STOPPED, (ii) forwards `await activeEmbedder.teardown?.()` (the
  OPTIONAL `Embedder.teardown?` hook — absent from every current embedder, a
  no-op in U-H5), (iii) resolves with `undefined`. AFTER teardown:
  `query()`/`onStoreChanged()`/`setEmbedder()` each throw the pinned
  `retrieval engine: torn down` (§5.5). Teardown does NOT cancel an in-flight
  `query()` (§5.7 F8 — the U-H4 drain guarantees idleness first). The engine
  does NOT own/release the persisted vector cache (that is the boot controller's
  W4 cache; the engine holds no cache reference — §7 Q2).
- **DRAIN-SEAM-INFLIGHT (new — §7 Q3, resolve to engine-level):** the drain
  CHECK primitive is **`RetrievalEngine.inFlight(): number`** — the count of
  currently-unsettled `query()` calls (incremented on `query()` entry,
  decremented on settle — resolve OR reject). A stopped or never-started engine
  reports its residual unresolved count (truthful). The U-H4 drain
  orchestration (a remove reads `inFlight()`, awaits it to reach 0, THEN tears
  down) CONSUMES this check; U-H5 does NOT add the orchestration. The
  `RagStoreRuntimeController` is UNCHANGED (no teardown/drain method added —
  A-P2-8 the runtime calls nothing; U-H4 orchestrates against the entry's
  `engine` directly).
- **BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD (new):** `createVectorBootController.teardown()`
  (i) marks the controller STOPPED, (ii) if the background build is IN-FLIGHT,
  GENUINELY CANCELS it (H5-1): REJECTS the outstanding `start()`/reconcile
  promise with `Error('vector boot: torn down')` — the `start()` caller's
  `.catch` fires — ARMS an internal abort token the build loop checks at every
  await boundary (short-circuiting before any promotion-time `cache.set`/
  `cache.flush`/`engine.setEmbedder` write), and AWAITS the build's REAL
  settlement (a captured `buildPromise`, not merely the deferred) so NO store
  mutation, engine `setEmbedder`, or cache write outlives `teardown()` and the
  persisted cache FILE stays byte-identical after EVERY teardown path (§5.6 H11
  / D3), (iii) forwards `await this.engine.teardown()` (the shared engine — a
  born-lexical-pending OR promoted engine — is released), (iv) resolves with
  `undefined`. AFTER teardown: a NEW `start()` rejects `vector boot: torn down`.
  The persisted vector-CACHE FILE is NEVER deleted and NEVER flushed by a U-H5
  teardown (content-addressed, reusable; D3 + §7 Q2). If never started or
  already settled, teardown is (ii)-a no-op and still (i)/(iii)/(iv).
- **TEARDOWN-NO-WIRE-UP (new):** U-H5 defines the primitives + the drain seam
  but NO call site. `main.ts`, `mcp-server.ts`, and `rag-store-runtime.ts`
  are UNCHANGED — in particular `rag-store-runtime.ts` still defines NO
  `teardown`/`close`/`destroy` primitive and makes NO teardown call (A-P2-8;
  the landed U-H2 N1/N2 + A-P2-8 pins stay green). The `hotApply` remove/rename
  branches DO NOT call teardown in U-H5 (U-H4/U-H6). The `stores:"all"` fan-out
  in `mcp-server.ts` is UNCHANGED (it does not add an `inFlight()` read in U-H5;
  U-H4's drain-then-teardown consumes the seam).
- **Consumed decision rows (implemented by U-H2/U-* or inherited, cite-only):**
  **ENGINE-PER-STORE** (each entry owns an engine; a remove drains + tears that
  engine down via the U-H5 primitive), **SINGLE-WRITER-STORE-PER-STORE** (a
  store's teardown drains ITS OWN queue), **STORE-ID-PREFIX** / **D4-NO-IDS-
  CALLER-PRECONDITION** (the U-H2 runtime preconditions that a U-H6 rename
  reconciles with a teardown), **D3 hot-remove ORPHAN** (teardown never
  deletes), **VECTOR-CACHE-CONTENT-HASH-KEY** / **W4/W5** (the persisted cache is
  content-addressed; a teardown may not corrupt it), **BOOT-MODEL-B** (the
  W1 controller's background build is cancellable via teardown).

## 5. The exhaustive contract

### 5.1 The interfaces to extend (exact current shapes — read to pin)

The U-H5 interface additions land on top of the CURRENT shapes (unchanged
members are NOT re-specified here; the additions are):

- **`src/main/rag-store.ts`** — the `RagStore` interface (`rag-store.ts:237-280`)
  gains ONE required member `teardown(): Promise<void>`. The concrete
  `createJsonRagStore` (`rag-store.ts:686`) implements it. The re-exported
  `createSnapshotStore` (from the node-free `src/main/adjacency.ts:170`)
  implements the NO-OP variant. **What teardown must NOT break:** the persisted
  file stays intact; reads still work; the W4 `store.enqueue(() => undefined)`
  boot barrier (`vector-boot.ts:223`) runs BEFORE any teardown (boot-time) so
  it is never blocked by U-H5.
- **`src/main/retrieval.ts`** — the `Embedder` interface (`retrieval.ts:216-227`)
  gains ONE OPTIONAL member `teardown?(): Promise<void>` (forward-only; NOT
  required — no current embedder implements it, so no embedder literal breaks).
  The `RetrievalEngine` interface (`retrieval.ts:576-602`) gains TWO REQUIRED
  members: `teardown(): Promise<void>` and `inFlight(): number`. The concrete
  `createRetrieval` (`retrieval.ts:611`) implements both.
- **`src/main/vector-boot.ts`** — the `VectorBootController` interface
  (`vector-boot.ts:71-87`) gains ONE REQUIRED member `teardown(): Promise<void>`.
  The concrete `createVectorBootController` (`vector-boot.ts:110`) implements
  it.

### 5.2 The exact TS additions (compile-horizon shapes)

```ts
// src/main/rag-store.ts — Unit U-H5.
export interface RagStore {
  // ... (all EXISTING members unchanged) ...
  /** RELEASE U-H5 — tear the store down: drain the single-writer write queue,
   *  revoke FUTURE mutations (they throw `rag store: torn down`), and resolve
   *  with `undefined`. IDEMPOTENT (a second call resolves immediately). NEVER
   *  deletes or touches the persisted file/journal (D3). NO-FAIL: never
   *  throws, never rejects. READ methods still resolve after teardown. */
  teardown(): Promise<void>
}

// src/main/retrieval.ts — Unit U-H5.
export interface Embedder {
  // ... (all EXISTING members unchanged) ...
  /** RELEASE U-H5 — OPTIONAL forward-only hook: an embedder's resource-release
   *  (e.g. a future vector embedder releasing its memoizer/session). NOT
   *  required — NO current embedder implements it (absent = a no-op). Called
   *  by the retrieval engine's `teardown()`. */
  teardown?(): Promise<void>
}

export interface RetrievalEngine {
  // ... (all EXISTING members unchanged) ...
  /** RELEASE U-H5 — tear the engine down: mark STOPPED (query/onStoreChanged/
   *  setEmbedder now throw `retrieval engine: torn down`), forward to
   *  `activeEmbedder.teardown?.()`, resolve with `undefined`. IDEMPOTENT.
   *  NO-FAIL. Does NOT cancel an in-flight query (the U-H4 drain first). */
  teardown(): Promise<void>
  /** DRAIN-SEAM U-H5 (A-P2-2 check) — the count of currently-unsettled
   *  `query()` calls (incremented on entry, decremented on settle). The U-H4
   *  drain-then-teardown reads it and awaits 0 BEFORE tearing down. A stopped
   *  engine reports its residual unresolved count (truthful). */
  inFlight(): number
}

// src/main/vector-boot.ts — Unit U-H5.
export interface VectorBootController {
  // ... (all EXISTING members unchanged) ...
  /** RELEASE U-H5 — tear the controller down: mark STOPPED, REJECT any
   *  in-flight background build's promise with `vector boot: torn down` and
   *  AWAIT its settlement, forward `engine.teardown()`, resolve with
   *  `undefined`. IDEMPOTENT. NEVER deletes/flushes the persisted cache file
   *  (content-addressed, D3). A post-teardown `start()` rejects
   *  `vector boot: torn down`. */
  teardown(): Promise<void>
}
```

### 5.3 Factories (all existing factories gain the members; none is re-spec'd)

`createJsonRagStore(opts)` (`rag-store.ts:686`) — the returned `RagStore` gains
`teardown()`. `createSnapshotStore(nodes, edges)` (`adjacency.ts:170`) — the
returned `RagStore` gains the NO-OP `teardown()`. `createRetrieval(store,
embedder, opts?)` (`retrieval.ts:611`) — the returned `RetrievalEngine` gains
`teardown()` + `inFlight()`. `createVectorBootController(store, provider, opts?)`
(`vector-boot.ts:110`) — the returned `VectorBootController` gains `teardown()`.

### 5.4 Behavior (pinned)

#### `createJsonRagStore(...).teardown()`

1. If `tornDown` is already true → return a RESOLVED promise immediately
   (IDEMPOTENT NO-OP).
2. Set `tornDown = true` (any mutating call made after this point throws
   `rag store: torn down` — §5.5/§5.7 F1–F3, and will NOT enqueue).
3. AWAIT the single-writer queue's tail (`rag-store.ts:716-734`) — a mutation
   enqueued BEFORE the teardown (e.g. a fire-and-forget `putNode`) settles with
   its persist BEFORE teardown resolves.
4. Resolve with `undefined`. NO-FAIL: a drain that itself rejects (a queued
   fn rejects — the store's `enqueue` failure-isolation keeps the chain alive,
   `rag-store.ts:731-733`) NEVER propagates; teardown still resolves (the
   mutation already surfaced its own failure to its caller).
5. NEVER touches the file: no read, no write, no delete of the persistence
   file or journal (D3). `persist()` is unreachable post-teardown (mutators
   throw before it).

#### `createSnapshotStore(...).teardown()` — the NO-OP reference

1. Resolve with `undefined`, idempotent.
2. NOTHING else changes: reads still work; mutators still throw the EXISTING
   `createSnapshotStore: read-only` (`adjacency.ts:186`) — NOT the torn-down
   message (the adapter has no lifecycle queue to drain).

#### `createRetrieval(...).teardown()` + `.inFlight()`

`teardown()`:
1. If already STOPPED → return a RESOLVED promise (idempotent).
2. Mark STOPPED.
3. `await activeEmbedder.teardown?.()` — the optional forward (a no-op in U-H5;
   neither the lexical nor the vector nor the mock embedder implements it).
4. Resolve with `undefined`. NO-FAIL: an embedder teardown hook that rejects is
   awaited and its rejection is SWALLOWED (teardown still resolves — the
   resource-release is best-effort; the engine's stopped state is the contract).

`inFlight()`: returns the current count of unsettled `query()` calls (see §5.4
DRAIN-SEAM-INFLIGHT). `query()` increments on entry, decrements on settle
(resolve OR reject). Deterministic, node-testable.

**SERVING state transitions:** POST-teardown, `query()`, `onStoreChanged()`,
and `setEmbedder()` each throw `retrieval engine: torn down`. An in-flight
`query()` that entered BEFORE teardown completes normally on the OLD embedder
and its settle decrements `inFlight()` (teardown does not cancel it — §5.7 F8).

#### `createVectorBootController(...).teardown()`

1. If already STOPPED → return a RESOLVED promise (idempotent).
2. Mark STOPPED.
3. If the background build is IN-FLIGHT (a `start()` was called and its promise
   has not settled), GENUINELY CANCEL it (H5-1): REJECT the outstanding
   `start()` promise with `Error('vector boot: torn down')` (the rejection is
   observed by the `start()` caller's fire-and-forget `.catch`), ARMS the
   internal abort token the build loop checks at every await boundary (so the
   build short-circuits BEFORE any promotion-time `cache.set`/`cache.flush`/
   `engine.setEmbedder` write), and AWAIT the build's REAL settlement — NOT just
   the `start()` deferred — so no store mutation, engine `setEmbedder`, or cache
   write outlives `teardown()` and the persisted cache FILE stays byte-identical
   (§5.6 H11 / D3). `teardown()` resolves only AFTER that settlement.
   (Mechanism as landed: `start()` wraps the real `build()` in a deferred it
   returns, keeps the REAL build promise, and `teardown()` rejects the deferred,
   sets `aborted`, and awaits `buildPromise`; the OUTCOME pinned here is: the
   outstanding `start()` promise settles REJECTED, the build actually STOPS, and
   `teardown()` resolves after that.)
4. `await this.engine.teardown()` — the shared engine (born-lexical pending OR
   promoted) is released.
5. Resolve with `undefined`. NO-FAIL.
6. NEVER deletes and NEVER flushes the persisted vector-CACHE file (content-
   addressed; D3; §7 Q2). A post-teardown `start()` rejects `vector boot: torn
   down`. If never started / already settled, step 3 is a no-op and steps
   2/4/5 still run.

### 5.5 The byte-pinned error set + the message census

| # | Trigger | Exact `Error` message |
| --- | --- | --- |
| TD-store | ANY mutating call on a torn-down createJsonRagStore — `putNode`/`removeNode`/`putEdge`/`removeEdge`/`applyBatch`/`undo`/`redo`/`enqueue` (new work) | `rag store: torn down` |
| TD-engine | `query()`/`onStoreChanged()`/`setEmbedder()` on a torn-down engine | `retrieval engine: torn down` |
| TD-boot | `start()` after a boot-controller teardown; the in-flight build's promise REJECTS with this on teardown | `vector boot: torn down` |
| (snapshot-read-only) | a mutator on createSnapshotStore (UNCHANGED, pre- AND post-teardown) | `createSnapshotStore: read-only` |

**NO-FAIL contract:** every `teardown()` resolves with `undefined` and NEVER
THROWS, NEVER REJECTS (§7 Q5). All three pinned messages are thrown by the
POST-teardown serving methods, not by teardown itself.

**Message census:**
- New message templates: **3** (`rag store: torn down`, `retrieval engine: torn
  down`, `vector boot: torn down`).
- New member-signature additions: **5** — `teardown(): Promise<void>` on
  `RagStore`/`RetrievalEngine`/`VectorBootController` + `inFlight(): number` on
  `RetrievalEngine` + `teardown?(): Promise<void>` on `Embedder` (optional).
- Log output introduced by U-H5: **0 new `console.*` lines** (the U-H5 members
  emit no console output; the W1/W4 build + cache logs already exist and are
  UNCHANGED; a torn-down store/engine/boot fails LOUD via throws, never logs).

### 5.6 U-H5 happy-path states (TestWriter red set — valid paths)

`<d>` is an absolute temp dir. A store/engine/boot as produced by the existing
factories (byte-identical pre-teardown behavior is preserved — U-H5 adds no
construction-time side effect).

1. **H1 — store teardown is a resolving, idempotent NO-OP:** `createJsonRagStore`
   `.teardown()` resolves with `undefined`; a SECOND `.teardown()` resolves
   immediately with `undefined`; after teardown, every READ method
   (`getNode`/`listNodes`/`getEdge`/`listEdges`/`status`/`journal`/
   `undoDepth`/`redoDepth`/`edgesFrom`/`edgesTo`/`edgesByKind`/
   `edgesForDocument`/`docHeadForDocument`) still resolves; the persistence file
   is BYTE-IDENTICAL (never touched/deleted).
2. **H2 — store teardown DRAINS a pending write:** enqueue a `putNode` (do not
   await), call `.teardown()` → teardown resolves ONLY after the queued write
   settles + persists; the record is on disk; teardown then resolves.
3. **H3 — store torn-down reads work, mutations fail loud:** after teardown,
   `getNode` still returns a node; the file is intact; the mutation set is
   covered by F1–F3 (§5.7).
4. **H4 — snapshot store teardown is the reference NO-OP:** `createSnapshotStore`
   `.teardown()` resolves; a second resolves; `getNode`/`listNodes` still work;
   `putNode` throws the existing `createSnapshotStore: read-only` (pre- AND
   post-teardown).
5. **H5 — engine teardown is a resolving, idempotent NO-OP:** `createRetrieval`
   `.teardown()` resolves with `undefined`; a second `.teardown()` resolves;
   `inFlight()` returns 0 on a fresh/never-queried engine.
6. **H6 — engine torn-down service fails loud:** after teardown,
   `query()`/`onStoreChanged()`/`setEmbedder()` each throw
   `retrieval engine: torn down` (F4–F6, §5.7).
7. **H7 — engine `inFlight()` counts unsettled queries:** fire a `query()` (do
   not await); while pending `inFlight() === 1`; after it settles
   (`await`) `inFlight() === 0`; a rejected query also decrements (inFlight 1→0
   after a rejection settles).
8. **H8 — engine teardown forwards the OPTIONAL embedder hook:** an embedder
   carrying a spy `teardown?` is called exactly once on `engine.teardown()`;
   an embedder WITHOUT the hook is a no-op (no throw).
9. **H9 — boot-controller teardown (never started):** `createVectorBootController`
   `.teardown()` resolves; `phase()` is still `'pending'`; the shared engine is
   torn down (`engine.query()` throws); a post-teardown `start()` rejects
   `vector boot: torn down`.
10. **H10 — boot-controller teardown (promoted):** after `await boot.start()`
    (promoted), `.teardown()` resolves; the promoted engine is torn down.
11. **H11 — boot-controller teardown CANCELS an in-flight build:** start the
    background build (a gated embed keeps it pending), call `.teardown()` →
    teardown resolves ONLY after the outstanding `start()` promise settles
    REJECTED with `vector boot: torn down` (the `start()` caller's `.catch`
    fires); the vector-CACHE file is BYTE-IDENTICAL (never deleted/flushed).
12. **H12 — boot teardown GENUINELY CANCELS an ALREADY-EMBEDDED build (H5-1
    regression):** start the build and let it progress past ≥1 embed (a
    `cache.set` has run) before `.teardown()`; teardown aborts the build and
    AWAITS its real settlement → the build actually STOPS (no promotion-time
    `cache.flush`/`engine.setEmbedder` outlives teardown), `phase()` stays
    `'pending'`, the cache FILE stays byte-identical, and the outstanding
    `start()` promise rejects `vector boot: torn down`.

### 5.7 U-H5 fail-states (TestWriter red set — documented fail-states)

`<d>` = an absolute temp dir. Outcomes: **fail-loud** = the pinned `Error`.

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `putNode`/`removeNode`/`putEdge`/`removeEdge`/`applyBatch` on a torn-down createJsonRagStore | fail-loud | `rag store: torn down` (live + file untouched) |
| F2 | `undo()`/`redo()` on a torn-down store | fail-loud | `rag store: torn down` |
| F3 | `store.enqueue(fn)` (new work) on a torn-down store | fail-loud | `rag store: torn down` (does NOT enqueue) |
| F4 | `query()` on a torn-down engine | fail-loud | `retrieval engine: torn down` |
| F5 | `onStoreChanged()` on a torn-down engine | fail-loud | `retrieval engine: torn down` |
| F6 | `setEmbedder()` on a torn-down engine | fail-loud | `retrieval engine: torn down` |
| F7 | `start()` after a boot-controller teardown | fail-loud | `vector boot: torn down` (rejects; a second `start()` on a NOT-torn controller still returns the existing `vector boot: start already called`) |
| F8 | a `query()` entered BEFORE `engine.teardown()` (in-flight at teardown — a caller error, NOT the U-H4 drain guarantee) | completes normally | the in-flight query settles on the OLD embedder; `teardown()` does NOT cancel it (U-H4's `inFlight()===0` drain is the guarantee); after teardown only NEW queries throw |
| F9 | a snapshot-store mutation pre/post teardown (UNCHANGED behavior) | fail-loud | `createSnapshotStore: read-only` (NOT `rag store: torn down`) |

### 5.8 Negative pins (D6 / D8 / A-P2-8 — the U-H2 N1 + A-P2-8 stay GREEN)

- **A-P2-8 (the RUNTIME module):** `src/main/rag-store-runtime.ts` still
  defines NO `teardown`/`close`/`destroy` primitive and makes NO teardown call.
  The LANDED `tests/unit-h2-runtime-controller.test.ts` negative pins — **N1**
  (`expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)` on the runtime
  source), **N2** (no MCP/IPC/no-remove/0-log on the runtime source), and the
  **A-P2-8** grep pin (no `runtime.teardown(`/`.destroy(` in `main.ts` or
  `mcp-server.ts`) — are **UNCHANGED and stay GREEN.** U-H5 does NOT edit those
  files, so the pins cannot regress.
- **D6 — no new MCP tool / IPC channel:** U-H5 touches only the four module
  files; it adds NO tool name to `ALL_TOOLS` (`mcp-server.ts:1099-1150` stays
  41), NO `RpcMethod` member, NO `MUTATING_METHODS` member, NO IPC constant.
- **D8 — the boot loader still reads the registry EXACTLY ONCE per boot:**
  teardown introduces NO re-read/refresh; `rag-store.ts`'s `load()` + the ms1
  loader + the U-H2 runtime's `writeRegistryMutation` re-read discipline are
  UNCHANGED and are NOT invoked by any teardown.
- **D3 — teardown NEVER deletes:** a store teardown leaves the persistence
  file + journal byte-identical; a boot-controller teardown leaves the
  vector-cache file byte-identical (grep-level: NO `unlink`/`rm`/`rmdir`/
  `remove` primitive is added to the torn-down paths).
- **No call sites:** a grep of `rag-store-runtime.ts`/`main.ts`/`mcp-server.ts`
  shows ZERO teardown calls (the seam exists for U-H4/U-H6/U-H7, not wired in
  U-H5).

### 5.9 Unit → file → test-file mapping + the red-set expectation

| Unit | File | Test file | Red-set expectation (RCA-1) |
| --- | --- | --- | --- |
| **U-H5** (this spec) | `src/main/rag-store.ts` (RagStore + createJsonRagStore teardown), `src/main/adjacency.ts` (createSnapshotStore no-op teardown), `src/main/retrieval.ts` (Embedder.teardown? + RetrievalEngine teardown/inFlight + createRetrieval), `src/main/vector-boot.ts` (VectorBootController.teardown + createVectorBootController) | `tests/unit-h5-teardown.test.ts` (SpecWriter-pinned; the §5.6 H1–H12 + §5.7 F1–F9 + §5.8 N-pin red set; H12 is the H5-1 genuine-cancel regression) | RED — the `teardown()`/`inFlight()` members do NOT EXIST on the pre-U-H5 code: every red `it()` that asserts `typeof store.teardown === 'function'` / `typeof engine.teardown === 'function'` / `typeof engine.inFlight === 'function'` / `typeof boot.teardown === 'function'` FAILS (RCA-1 — `teardown` is `undefined`, not a function), and the H/F-behavior bodies each fail on the missing members. The suite FAILS on the interface-member absence BEFORE any behavior is exercised. |

- **Existing tests that STAY GREEN (and why):** the trio's `typecheck`
  (`tsconfig.json` `include: ["src/**/*.ts"]`, `exclude: [..., "tests"]`) does
  NOT compile `tests/`, and vitest uses esbuild (transpile-only, no typecheck),
  so the hand-authored `RagStore`/`RetrievalEngine` literals in
  `tests/vector-boot.test.ts:270` (`makeStoreDouble`),
  `tests/retrieval-adversarial.test.ts:108`, and
  `tests/embeddings-adversarial.test.ts:99` do NOT break from a REQUIRED member
  (they simply lack it and never call it at runtime). All existing behavior
  tests pass unchanged — `createJsonRagStore`/`createSnapshotStore`/
  `createRetrieval`/`createVectorBootController` gain the additive members with
  byte-identical pre-teardown behavior. The full U-H2 suite
  (`tests/unit-h2-runtime-controller.test.ts`) stays green (source untouched).
  Optional per-clarity: `tests/vector-boot.test.ts`'s `makeStoreDouble` MAY gain
  `teardown: () => real.teardown()` — NOT required (tests aren't typechecked).
- **Per RCA-2/RCA-5:** U-H5 runs its OWN TestWriter-red → Implementer-green →
  adversarial → blind-greens → doc-review cycle; the trio (`npm test` /
  `npm run typecheck` / `npm run build`) runs after the green. The live-scenario
  battery stays PARKED (§6).

### 5.10 Census / numeric claims

- **New modules/files this unit creates:** **0** (`docs/specs/unit-h5-teardown.md`
  + `tests/unit-h5-teardown.test.ts` are the only NEW files).
- **Files EDITED:** **4** — `src/main/rag-store.ts`, `src/main/adjacency.ts`,
  `src/main/retrieval.ts`, `src/main/vector-boot.ts`. **NO edits** to
  `rag-store-runtime.ts`/`main.ts`/`mcp-server.ts`/`rag-store-directory.ts`/
  `rag-store-registry-write.ts`/`rag-store-registry.ts`/`embeddings.ts`/
  `vector-cache.ts`/`shared/types.ts`/`preload.ts`/`security.ts`/`sidebar-panes.ts`.
- **New interface/exports members:** **5** — `teardown(): Promise<void>` on
  `RagStore`/`RetrievalEngine`/`VectorBootController`, `inFlight(): number` on
  `RetrievalEngine`, `teardown?(): Promise<void>` on `Embedder` (optional). No
  new top-level exports; no factory signature changes.
- **New byte-pinned message templates:** **3** (`rag store: torn down`,
  `retrieval engine: torn down`, `vector boot: torn down`).
- **New MCP tools / IPC channels / teardown CALL sites:** **0** (D6 / A-P2-8 —
  U-H5 wires no caller).
- **New `console.*` lines:** **0** (U-H5 members fail loud via throws; no logs).
- **Files this unit does NOT touch (must stay green):** the U-H2 module
  (`rag-store-runtime.ts` — its A-P2-8 pin), the write module, the loader, the
  MCP/UI wiring, the `stores:"all"` fan-out. **No page-design change** ⇒
  `docs/skills/designing-pages.md` is UNCHANGED by U-H5.

### 5.11 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D7** (remove
  drain-then-teardown — REQUIRES the new `teardown()` primitives), **D8**
  ("U-H5 teardown" — the unit decomposition), **D3** (hot-remove ORPHAN —
  teardown never deletes), **D5/D8/A-P2-4** (U-H7 default reassignment CONSUMES
  teardown); §5 (A-P2-8 — teardown in U-H5 with its own red set; A-P2-2 — the
  `stores:"all"` drain); §6 (live-scenario PARKED).
- **U-H2 (the runtime that stays teardown-free):**
  `docs/specs/unit-h2-runtime-controller.md` §4 **REBUILD-ALL-OF-NON-DEFAULT**
  ("the old non-default entries are ORPHANED ... no `teardown()` — U-H5/A-P2-8"),
  **DEFAULT-STABLE-APPLY**, **ATOMIC-APPLY**; §5.7 (the N1/A-P2-8 negative pin
  that currently FORBIDS the runtime from tearing down — the seam now exists
  but the runtime must NOT call it, only expose it for U-H4/U-H6/U-H7); §5.10
  census; §7. `src/main/rag-store-runtime.ts` (UNCHANGED by U-H5).
- **Sibling slice units (cite-only):** U-H4 (hot-remove — drain-then-teardown,
  CONSUMES U-H5), U-H6 (hot-rename — CONSUMES teardown), U-H7 (default
  reassignment — CONSUMES teardown + owns the cache-release handoff, §7 Q2),
  U-H8 (operator-UI editor). Execution order proceeding: **U-H5 → U-H4 → U-H6 →
  U-H7 → U-H8**. U-H3 (hot-add, delivered-by-U-H2a) is CITING U-H5's teardown as
  the seam it never calls.
- **Interface contracts (read to pin — U-H5 extends, does NOT change):**
  `docs/specs/unit-a-rag-store.md` §5.4 (the `RagStore` interface; `createJsonRagStore`),
  `docs/specs/unit-e-rag-index.md` §5.6 (the `RetrievalEngine`/`createRetrieval`),
  `docs/specs/unit-f-embeddings.md` §5.12/§5.13 (the `VectorBootController` —
  `start()` SINGLE-SHOT, the W4 cache, `vector boot: start already called`;
  the `Embedder` interface), `docs/specs/unit-ms2-store-wiring.md` §5.1 (`RagStoreEntry` —
  the per-store `engine`/`store` the U-H4 drain-teardown drains).
- **Source (read to confirm, NOT to re-spec):** `src/main/rag-store.ts:237-280`
  (the `RagStore` interface), `:686` (`createJsonRagStore`), `:716-734` (the
  single-writer queue), `:702-713` (the lazy adjacency index);
  `src/main/adjacency.ts:170` (`createSnapshotStore`); `src/main/retrieval.ts:216-227`
  (the `Embedder` interface), `:576-602` (the `RetrievalEngine` interface),
  `:611` (`createRetrieval`); `src/main/vector-boot.ts:71-87` (the
  `VectorBootController` interface), `:110` (`createVectorBootController`),
  `:323-327` (`start()`); `src/main/vector-cache.ts:40-68` (the content-
  addressed `VectorCache` — what a teardown must NOT corrupt).
- **Test file (SpecWriter-pinned):** `tests/unit-h5-teardown.test.ts`.
- **Downstream (cite-only, U-H4's future contract):** the U-H4 drain-then-
  teardown consumes `engine.inFlight()` + `store.teardown()` +
  `engine.teardown()` (and, for the default, `vectorBoot.teardown()`); the
  `stores:"all"` fan-out + A-P2-2 snapshot semantics are U-H4's.

## 6. The live-scenario gate

**Live-scenario gate: PARKED (2026-09-08, per the user's instruction — the
registry hot-apply/removal/rename MCP/UI surface cannot be driven live because
a live app session is unavailable).** U-H5's live gate is PARKED accordingly: the
teardown primitives are node-testable in `tests/unit-h5-teardown.test.ts`
(no live app needed); a **live-pending battery** (`tests/unit-h5-teardown-live-pending-battery.md`)
SHOULD be authored in a LATER live-app session, exercising a REAL
operator-triggered remove/rename end-to-end (via U-H4/U-H6) that drains + tears
down a live store/engine/boot. It is NOT authored now (PARKED).

## 7. Design questions surfaced to the Architect (all five arbitrated 2026-09-08 — see the Architect ruling below; all CONFIRMED)

1. **Sync vs async `teardown()` (RESOLVED provisionally to ASYNC — needs
   confirmation):** every `teardown()` is **`teardown(): Promise<void>`** —
   ASYNC. Rationale: the store must DRAIN its async single-writer queue; the
   boot controller must AWAIT the rejection-settlement of an in-flight build;
   a uniform async signature simplifies the U-H4/U-H6/U-H7 callers. A sync
   teardown cannot satisfy these. **CONFIRM async + the `Promise<void>`/
   resolves-undefined return shape so the TestWriter locks the H-rows.
2. **Does an engine/boot teardown release (or flush/delete) the persisted
   vector-cache FILE? (RESOLVED provisionally to NO — needs confirmation):**
   the persisted vector cache is content-ADDRESSED (kind/model/dimension/
   contentHash — `vector-cache.ts:40-50`) and reusable across stores; deleting
   it would destroy a warm cache on every remove/rename and contradict D3's
   never-delete. U-H5 pins: a teardown NEVER deletes and NEVER flushes the cache
   FILE (the engine does not even hold a cache reference — the cache is the
   boot controller's W4 + the vector embedder's W5 memoizer). Whether U-H7's
   default-reassignment FLUSHES or HANDS OFF the cache when re-warming a new
   default is a **U-H7** decision (deferred, surfaced here only to confirm U-H5
   does NOT flush). **CONFIRM U-H5 = no cache-file delete and no flush.**
3. **Where does the drain guard live in U-H5? (RESOLVED provisionally — the
   engine-level `inFlight()` check seam; the orchestration is U-H4):** U-H5
   lands the drain CHECK as **`RetrievalEngine.inFlight(): number`** (the
   unsettled-query count), and DOES NOT add the read-await-0-then-teardown
   orchestration (U-H4 owns that; the `RagStoreRuntimeController` stays
   unchanged/A-P2-8). The alternative — a controller-level drain guard
   (`canTearDown(name)`) — is deferred because A-P2-8 forbids the runtime from
   calling teardown in U-H5 and the controller has no in-flight knowledge. The
   `stores:"all"` A-P2-2 snapshot-atomicity + per-engine drain is likewise
   U-H4's. **CONFIRM the `inFlight()` engine-level seam is the U-H5 drain
   primitive.**
4. **Does teardown poison READS or only MUTATIONS on the store? (RESOLVED
   provisionally to MUTATION-ONLY):** a torn-down `createJsonRagStore` keeps its
   READ methods working (get/list/status/journal/adjacency) and only revokes
   MUTATIONS + new `enqueue` work. This keeps a torn-down store read-safe (the
   U-H4 remove drain may still inspect it) and matches "teardown must not
   disturb a NO-OP". **CONFIRM read-safe + mutate-fail-loud.**
5. **No-fail/void vs surfaceable teardown failures (RESOLVED provisionally to
   the NO-FAIL/VOID contract):** every `teardown()` resolves with `undefined`
   and NEVER throws / NEVER rejects; resource-release failures (a draining
   mutation that already failed, an embedder teardown hook that rejects, an
   unavailable build promise) are best-effort — the STOPPED state is the
   binding contract, and the underlying failure was (or will be) surfaced to
   its own caller, not to the teardown caller. This keeps the U-H4/U-H6/U-H7
   remove/rename flow free of teardown-race exceptions. **CONFIRM the NO-FAIL
   contract** (the alternative — teardown rejecting on a failed drain — would
   force U-H4 to handle teardown exceptions and complicates the caller).

---

**Bottom line:** U-H5 lands the three `teardown()` primitives (A-P2-8) — on
`RagStore`/`RetrievalEngine`/`VectorBootController`, each `teardown(): Promise<void>`
(ASYNC, resolving `undefined`, idempotent NO-OP, no-fail/void) — plus the
`RetrievalEngine.inFlight()` drain CHECK seam (A-P2-2) and the OPTIONAL
`Embedder.teardown?` forward hook, WITHOUT wiring any caller (the U-H2 runtime
module's A-P2-8 "no teardown call" pin stays GREEN; U-H4/U-H6/U-H7 consume the
seam). The store teardown drains the single-writer queue + revokes mutations
only (reads stay safe; the file is never deleted — D3); the snapshot-store
teardown is the reference NO-OP; the engine teardown marks STOPPED + forwards
the optional embedder hook; the boot-controller teardown CANCELS an in-flight
build (rejects the reconcile-promise) + marks stopped + never touches the
content-addressed cache file. No new module, no MCP/IPC (D6), no page-design
change, live gate PARKED. The §7 Q1–Q5 design resolutions (async, no cache-file
release, engine-level drain seam, mutate-only store poisoning, no-fail contract)
were all **CONFIRMED** by the Architect ruling (2026-09-08) — the TestWriter ran
against that ruling and the unit LANDED.

---

### §7 Architect ruling (2026-09-08, Gate Supervisor / Architect)

All five surfaced design questions **CONFIRMED** as provisionally resolved:

1. **ASYNC teardown** — every `teardown(): Promise<void>` (resolves `undefined`),
   uniform across `RagStore`/`RetrievalEngine`/`VectorBootController` (the store
   drains its async single-writer queue; the boot controller awaits an in-flight
   build's settlement). **CONFIRMED.**
2. **NO cache-file delete/flush in U-H5** — a teardown NEVER deletes/flushes the
   persisted content-addressed vector-cache file (D3 never-delete; reusable
   across stores; the engine holds no cache reference). Whether U-H7's
   default-reassignment flushes or hands off the cache is a **U-H7** decision. **CONFIRMED.**
3. **Drain guard = the engine-level `RetrievalEngine.inFlight(): number` seam** —
   U-H5 lands the CHECK; the read-await-0-then-teardown orchestration (and the
   `stores:"all"` snapshot/atomic-drain) is **U-H4**'s; the runtime stays A-P2-8
   (no teardown call in U-H5). **CONFIRMED.**
4. **Store teardown poisons MUTATIONS only** — reads (get/list/status/journal/
   adjacency) stay safe; mutations + new `enqueue` work fail loudly (`rag store:
   torn down`). **CONFIRMED.**
5. **NO-FAIL/VOID teardown contract** — every `teardown()` resolves `undefined`
   and NEVER throws/rejects; resource-release failures are best-effort (the
   STOPPED state is the binding contract). **CONFIRMED.**

The TestWriter may derive U-H5's red set (the three `teardown()` primitives +
`inFlight()` + the optional `Embedder.teardown?` hook + the byte-pinned messages)
against this ruling; no further arbitration is required before the red run.
