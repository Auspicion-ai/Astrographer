# Review — Vector-mode (local Ollama) boot: batch embeddings + background build + promotion (change-analysis verdict)

- **Gate position:** step 4 of the four-agent proposal gate (validity VALID-WITH-AMENDMENTS → critique BLOCKERs+amendments → architecture SOUND-WITH-AMENDMENTS → **change-analysis**).
- **Status: PROCEED-WITH-AMENDMENTS** (P4 dist-hygiene + the persisted embedding cache PARKED with revisit conditions; pre-W2 measurement gate mandatory).
- **Date:** 2026-09-05. **Inputs:** the supervisor's three review summaries, spot-checked against `docs/specs/unit-f-embeddings.md`, `src/main/embeddings.ts`, `src/main/main.ts`, `src/main/retrieval.ts`, `src/main/mcp-server.ts`, `tests/embeddings.test.ts`, `docs/decisions.md`, `docs/defects.md`, `docs/pending.md`, `docs/next-steps.md`, `package.json`.
- **Standing pause (unchanged):** no spec/code work until the user's go-ahead (`docs/next-steps.md:41-42`). This review does not lift that pause.

---

## 1. What the proposal asks

Resolve the vector-mode boot failure and unusability reported as "Issue with attempting to use local Ollama as embedding provider":

- The immediate cause (stale `dist/` bundle missing the F9 empty-node skip) is already FIXED — `HOST-F-DIST-STALE` recorded + FIXED, trio 2031 pass / 38 skip (`docs/defects.md:27`, `docs/next-steps.md:26-32`).
- The OPEN contract-shape work (the stale-bundle rebuild changed no contract): today vector-mode boot embeds ~16,840 non-empty nodes SEQUENTIALLY (~0.1s/call ≈ 28 min) fully dark before any UI/MCP (`main.ts:150` `await createVectorEmbedder` → window only at `main.ts:392`, MCP start at `main.ts:406`); ANY single embed failure aborts boot (`createVectorIndex` rejection propagates — `src/main/embeddings.ts:308-325`; pinned at `tests/embeddings.test.ts:380-386`); the 5s `timeoutMs` trips on ollama's cold model load (`embeddings.ts:117,128-149`).

Landed as three units: **W1** boot architecture (sync fail-fast warm-up gate → window+MCP born-lexical → background batched build → reconcile → atomic one-way embedder promotion inside the ONE shared `RetrievalEngine`); **W2** batch seam (optional `embedBatch?` on `EmbeddingProvider`, alignment invariant, per-batch reject → per-item fallback, per-text timeout budget N × timeoutMs + AbortController); **W3** three-class failure policy (config-missing → abort; provider-down-at-boot → abort; per-node-after-reachability → skip+log with `Map<nodeId,'empty'|'transient'>`, retry via the changed-nodeIds trigger, empty-guard extended to add/update).

## 2. Feasibility verdict

**PROCEED-WITH-AMENDMENTS.** The problem is real and measured (`docs/next-steps.md:24-42`); the design resolves the critique's self-defeating P1×5s coupling (per-text budget, not a per-request 5s wall); the born-lexical pending state + atomic one-way promotion preserve both binding constraints: §8.2 MCP/UI equivalence (both surfaces await the SAME engine instance — `retrieval.ts:606-627`, `mcp-server.ts:137,190-200,1115`, decision `MCP-UI-EQUIVALENCE` `docs/decisions.md:43`) and no-silent-lexical-fallback on provider-creation failure (`main.ts:147-149`, spec §5.9 #34). The W1→W2→W3 order is correct and each unit is independently red→green-able. The amendments below are pinning/sequencing requirements, not design changes.

### Amendments (binding)

- **A1 — spec-first gate.** Amend `docs/specs/unit-f-embeddings.md` §5.2–§5.10 (batch member; index rules; boot/promotion; fail-states; census) BEFORE any test/code. The abort-on-embed-failure contract is pinned in THREE places that must all be amended together: spec §5.3 fail-state (`unit-f-embeddings.md:577-579`), §5.9 #32 (`:1013-1015`), and the test `tests/embeddings.test.ts:380-386`.
- **A2 — F9 label collision resolved.** Spec §3a F9 = the `connect-src` allowlist (`unit-f-embeddings.md:173-176`); the unlabelled empty-node-skip in code reuses the "F9" tag (`embeddings.ts:309-313`). Rename the greens row, give the skip its own finding id + a §5.3 rule + a named test.
- **A3 — W1 must be node-testable.** This repo tests shared modules, not `main.ts` directly (precedent: U5 F1 handler extraction). W1's spec must name the extracted boot/promotion seam (e.g. a pure `vector-boot` controller: warm-up → pending → build → reconcile → promote) so the TestWriter can red it without Electron.
- **A4 — promotion + reconcile pins.** The engine's `embedder` closure binding (`retrieval.ts:607-626`) becomes mutable via an explicit one-way promotion mechanism. Pin by test: in-flight pre-promotion queries complete coherently on the old embedder; the `onStoreChanged` hook attaches with the swap (`retrieval.ts:625`); reconcile-before-swap re-checks `node.updatedAt` vs build-time embedAt (pin the tie rule) and re-embeds changed nodes BEFORE swapping.
- **A5 — batch shape + timeout semantics.** `embedBatch?` is OPTIONAL with a sequential per-text default (PROVIDER-AGNOSTIC preserved — `docs/decisions.md:30`); `createVectorIndex` gains the batch fn as an OPTIONAL third param (existing tests/mocks unchanged); alignment invariant (response length ≠ inputs length → whole batch rejected → per-item fallback); per-text budget N × timeoutMs + AbortController with the timeout error message BYTE-IDENTICAL to spec §5.9 #8/#14 and the fetch actually aborted (today `Promise.race` abandons the in-flight request — `embeddings.ts:128-149,232-254`).
- **A6 — W2/W3 contract handoff.** W2 must NOT change the single-item reject-propagation contract (§5.3/§5.9 for index maintenance stays until W3 re-pins `tests/embeddings.test.ts:380-386` red→green). The W3 amendment enumerates exactly which fail-states flip (build-time embed rejection → skip+log) and which stay (required-arg rejections §5.9 #19-21; query-time embed rejection for `score`/`query` §5.9 #32).
- **A7 — pre-W2 measurement gate.** A standalone delegated task measures how many of the ~16,840 non-empty nodes exceed the ollama model's ~2048-token context; the result is recorded in the amended spec §5.10. Large → a chunking unit precedes W2's design lock; never silent truncation absorption.
- **A8 — tracker pass in the same delegation.** `docs/decisions.md` gains the `VECTOR-BOOT-BACKGROUND-PROMOTE` row (currently absent — file fully read, 92 lines); `docs/next-steps.md` OPEN row rewritten per unit; `docs/pending.md` gains the two PARKED rows below (currently absent — file fully read).

### PARKED (with revisit conditions, for `docs/pending.md` DEFERRED)

1. **P4 dist-staleness hygiene** — revisit when a TDD-able staleness mechanism is spec'd (`docs/defects.md:27` already routes P4 here).
2. **Persisted embedding cache** — revisit if per-restart promotion latency (the batched background build re-runs on every restart) pains operators.

## 3. Gaps + costs-benefits (change inventory, risks, cost, scope)

### 3.1 CHANGE INVENTORY — observable behavior changes

**CHANGES (vector mode; lexical default untouched):**

1. **Boot sequence:** today the app is dark for the whole ~28-min build (`main.ts:150` blocks before the window at `:392` / `mcp.start()` at `:406`). After W1: one real `/api/embed` warm-up (not the `/api/tags` probe — `embeddings.ts:540`) → window + MCP up within seconds → `rag.query`/`rag-query` answer LEXICALLY in the SAME `RetrievalResult` shape (`retrieval.ts:560-568`) → background batched build → reconcile → atomic promotion to vector scoring. Pending-lexical is the DESIGNED born-lexical state, announced in logs — not a fallback after failure. Every restart re-pays the (batched, non-blocking) build — the parked cache.
2. **Failure modes:** provider-down/cold-load at boot aborts EARLY with a distinct warm-up error instead of a mid-build failure minutes in; per-node failures AFTER the warm-up skip + log ('empty' vs 'transient' classified) instead of aborting the whole boot (`tests/embeddings.test.ts:380-386` re-pinned); 'transient' skips retry via the changed-nodeIds trigger (`onStoreChanged` touches only passed nodeIds today — `embeddings.ts:452-463`; the broadcast wiring is `mcp-server.ts:383-446,1131`), so a skipped node is no longer lost.
3. **Empty-content handling:** build-time skip stays (`embeddings.ts:309-313`) but is spec'd/named/tested (A2); `addToVectorIndex`/`updateVectorIndex` gain the missing empty guard (today they embed empty content → ollama 'malformed response' — `embeddings.ts:337,355`).
4. **Timeout mechanics:** per-text budget N × timeoutMs + AbortController; the HTTP request is actually cancelled (today the fetch keeps running after the race loses — `embeddings.ts:128-149`).
5. **Batch:** index-build (and add/update) ollama requests become `{ model, input: string[] }` instead of one call per node (W2 pins the request shape; spec §5.2 currently pins single-string `unit-f-embeddings.md:411-413`). Build wall-time drops roughly by the batch factor.
6. **Logs:** pending → built → promoted milestones with skipped counts; failure classes distinguishable in output.

**DOES NOT CHANGE:**

- **Config-missing abort** (`main.ts:147-149`; spec §5.9 #34) — failure class 1 is preserved verbatim.
- **Query-time provider-down rejection** — after promotion, an embed rejection still propagates from `score`/`query` (spec §5.9 #32; only the BUILD path's rejection policy flips in W3).
- **Single-engine MCP/UI equivalence** — every phase serves both surfaces from the ONE `RetrievalEngine` (`retrieval.ts:606-627`; `mcp-server.ts:1115,190-200`; `docs/decisions.md:43`); no new MCP tool, no new IPC channel, no renderer change.
- **Lexical-first default + lexical index maintenance** (`main.ts:153`; `retrieval.ts:602,613-621`); the `RetrievalResult` shape/topK/lineMap; PROVIDER-AGNOSTIC + LOCAL/REMOTE security posture (`embeddings.ts:114-122,203-231`); edit-succeeds-despite-embed-failure (F1 `.catch`, `mcp-server.ts:1131`) — W3 adds retry for the skipped node rather than changing the edit behavior.

### 3.2 RISK REGISTER (top risks → pin-by-test mitigation)

| # | Risk | Mitigation pinned by test |
| --- | --- | --- |
| R1 | Promotion seam touches the shared engine used by MCP+IPC (`retrieval.ts:606-627`) — a mid-promotion query sees torn/mixed results | In-flight pre-promotion query completes on the OLD embedder with the same `RetrievalResult` shape; post-promotion query uses the new embedder; no mixed index observable; §8.2 equivalence asserted in BOTH phases (pending + promoted) |
| R2 | Reconcile correctness at promotion — a node edited between build-embed and the swap embeds stale content | Promote re-checks `updatedAt` vs embedAt (tie rule pinned) and re-embeds changed nodes BEFORE the swap; post-swap edits flow through the attached hook (`retrieval.ts:625`) |
| R3 | Batch alignment — a short/long response mis-assigns vectors to nodes | Response length ≠ inputs length rejects the WHOLE batch → per-item `embed()` fallback; F6/F7 per-vector dimension/element validation still runs (`embeddings.ts:164-173,316-320`) |
| R4 | AbortController changes timeout semantics/messages | Timeout error byte-identical ('… timeout after Nms', §5.9 #8/#14); the stub observes the abort signal; no unhandled rejection |
| R5 | Warm-up cold-load exceeds budget → boot aborts on a healthy-but-slow ollama | Warm-up uses the same per-text budget; failure message distinct + actionable; the warm-up is the ONLY abort point after config (pinned); today's behavior is no better (first embed aborts boot the same way) |
| R6 | W3 re-pin weakens the wrong fail-states | The amendment enumerates flipped vs preserved pins (A6); the red set includes BOTH the flipped `tests/embeddings.test.ts:380-386` AND the preserved required-arg + query-path rejections |
| R7 | Boot-order regression — MCP constructed before a live engine exists (`main.ts:144-155`) | W1's controller returns a live (born-lexical) engine synchronously; boot equivalence test asserts the MCP server always receives a live engine |

### 3.3 COST ESTIMATE

- **W1:** spec amendment (A1–A4) + module extraction + ~20–28 tests (warm-up 3–4; pending semantics 4–5; build 3–4; reconcile 3–4; promotion 4–6; abort classes 2–3). Heaviest unit; one delegation.
- **W2:** ~15–22 tests (interface member + sequential default 3–4; ollama batch request shape 2–3; alignment 3; fallback 2–3; budget + AbortController 3–4) + the A7 measurement as a SEPARATE small delegation.
- **W3:** ~15–20 tests (skip/log 3; 'empty' vs 'transient' map 3; retry trigger 3; empty-guard add/update 4; partial-index query semantics 3–4; the 380–386 re-pin 1–2).
- **Docs:** one spec amended + 4 trackers + this review. Per-unit trio (~2031+ tests today) — heavy but delegated.
- **Context budget:** no unit approaches the 50% task threshold (each is a bounded ~20–30-test red→green cycle over one file cluster); no unit shares a red→green cycle with a sibling (RCA-2/RCA-5 honored); the spec amendment and the A7 measurement MUST each be their own delegation or they will eat a unit's budget.

### 3.4 SCOPE DISCIPLINE

- **Confirmed host-side only.** W1–W3 touch `src/main/{main.ts, embeddings.ts, retrieval.ts, mcp-server.ts (hook wiring/logging only), + a new vector-boot module}`, `tests/*`, `docs/*`. Nothing patches `node_modules/provident-ssr/` or `../Preempt-Providence/` — the OPEN package rows HOST/U1-ENG / ENG-INLINE-ORDER / ENG-BODYRUNS-WIRE-REF-PATHSTATE stay untouched (`docs/defects.md:13-15`).
- **Parked items + gates recorded:** P4 and the embedding cache need their `docs/pending.md` rows (A8 — absent today); the A7 measurement gate + its large-corpus → chunking-unit condition must be recorded in the amended spec §5.10 + the rewritten `docs/next-steps.md` OPEN row.

## 4. Final verdict

**PROCEED-WITH-AMENDMENTS.** The three prior reviews' findings all verify against the code: the sequential dark boot, abort-on-any-failure, and 5s-timeout coupling are real and measured; the batch + background-build + promotion design fixes them without touching the two binding invariants (single-engine §8.2 equivalence; no silent lexical fallback), and the W1→W2→W3 order keeps each contract change in exactly one unit's red→green cycle. The amendments are pinning discipline, not redesign: spec-first (A1), the F9 collision (A2), the testable W1 seam (A3), promotion/reconcile pins (A4), batch shape + abort semantics (A5), the W2/W3 handoff (A6), the truncation measurement gate (A7), and the tracker pass (A8).

**Exact first delegation (spec-first per the delegation gate):** a SpecWriter delegation that (1) amends `docs/specs/unit-f-embeddings.md` §5.2–§5.10 + a new boot/promotion section implementing A1–A6 with the W1 TestWriter contract (§5.8/§5.9 states + fail-states for the extracted vector-boot controller), (2) resolves the F9 collision (A2), and (3) lands the A8 tracker rows; then a read-only review of the amendment. ONLY after that amendment reviews clean does W1's TestWriter run: "Write tests FIRST (red) from the amended spec §5.8/§5.9 ALONE for the W1 vector-boot controller — warm-up gate (real /api/embed; total failure → abort before the window; config-missing abort preserved), born-lexical pending query semantics (same RetrievalResult on MCP+IPC), background build + reconcile (`updatedAt` tie rule), atomic one-way promotion (in-flight coherence + hook attachment) — against the spec-named module seam; report the failing set; never implement."

## 4a. SCOPE RESOLUTION — user go-ahead (2026-09-05)

Asked to choose between the reviewed W1–W3 (per-boot re-embed, backgrounded) and a cache-inclusive variant, the user asked whether embeddings are computed on every boot or only when a vector "is not found" — then approved the **CACHE-INCLUSIVE DESIGN**: the persisted embedding cache (parked alternative C, §1) is PROMOTED TO IN-SCOPE as part of the core contract, not a follow-up. The landed design becomes: boot → warm-up gate → window+MCP born-lexical → load the persisted vector cache (keyed by provider kind + model + dimension + node-content hash) → background-embed ONLY the cache misses (new/changed content) → reconcile → atomic promotion. First boot embeds the full corpus in the background; later boots embed only new/changed nodes. The cache unit adds a persisted file + invalidation rules (content edit / model change / dimension change / provider swap) and lands as its own unit (W4) after W1–W3, OR as part of the W1 spec amendment — the SpecWriter decides the cleanest section split; the §5.10 census + a new persisted-file fail-state set are mandatory either way. The `docs/pending.md` parked row for the cache is superseded by this approval.

## 5. Live-verified premises (2026-09-05, same pass as the verdict)

The reviewer-noted empirical gaps were closed against the LIVE ollama server (`embeddinggemma:latest`, `http://127.0.0.1:11434`) in this pass — recorded facts, not premises:

1. **Batch `input` premise VERIFIED (closes the web-search-unavailable note):** `POST /api/embed` with `{"model":"embeddinggemma","input":["alpha text","beta text","gamma text"]}` → HTTP 200, `embeddings` = 3 vectors, 768 dims each, positional order preserved. The W2 request-shape test still pins this by test, but the server behavior is no longer an assumption.
2. **Alignment edge VERIFIED:** a batch containing an empty item (`["alpha text","","gamma text"]`) → HTTP 200 with **3** vectors — 1:1 positional alignment is PRESERVED even for the empty-input edge. The W2 alignment invariant (response length === inputs length, else whole-batch reject) remains the pinned contract; the live server satisfies it.
3. **Truncation measurement (the pre-W2 gate) PASSES — no chunking unit:** token census over the operator's real store (23,469 nodes, 16,840 non-empty; est. tokens ≈ chars/4): **0 nodes exceed the model's 2048-token context** (est. p50 = 12, p90 = 47, p99 = 196, max = 1,998). Silent truncation is a non-issue on this corpus; the "large fraction truncates → chunking unit" condition is NOT triggered. Recorded for the amended §5.10.
4. **Warm latency reference:** ~0.1s per single-text embed (3 consecutive probes: 0.103s / 0.103s / 0.080s) — the basis of the ~28-min sequential-build estimate (16,840 × ~0.1s).

**Exact first delegation (spec-first per the delegation gate):** a SpecWriter delegation that (1) amends `docs/specs/unit-f-embeddings.md` §5.2–§5.10 + a new boot/promotion section implementing A1–A6 with the W1 TestWriter contract (§5.8/§5.9 states + fail-states for the extracted vector-boot controller), (2) resolves the F9 collision (A2), and (3) lands the A8 tracker rows; then a read-only review of the amendment. ONLY after that amendment reviews clean does W1's TestWriter run: "Write tests FIRST (red) from the amended spec §5.8/§5.9 ALONE for the W1 vector-boot controller — warm-up gate (real /api/embed; total failure → abort before the window; config-missing abort preserved), born-lexical pending query semantics (same RetrievalResult on MCP+IPC), background build + reconcile (`updatedAt` tie rule), atomic one-way promotion (in-flight coherence + hook attachment) — against the spec-named module seam; report the failing set; never implement."