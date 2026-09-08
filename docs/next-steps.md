# Astrographer — Work Queue

Maintained by the document-archival loop (AGENTS.md item 6). Open work on
top; finished items move to the tracker rows they produced. This queue is
this project's local next-steps (the foundation's queue lives in the adjacent
`../Provident-Electron/docs/next-steps.md`).

Astrographer is a **hybrid human-readable local wiki with a
graph-based RAG**, built on a fork of the Provident-Electron foundation. The
proposal gate is complete (PROCEED-WITH-AMENDMENTS — see
`docs/specs/astrographer-review.md`). The first milestone is a smaller slice —
Units A–T are implemented (persistence → document model + doc-flow →
rendering spine → editable text → RAG index + retrieval → vector embeddings →
crosslink/backlink → sidebar panes → template customization → MCP/security
hardening → the form-control textarea editing UI → the `children` store-format
foundation → batch atomicity → the rich-text edit ops → the rich-text
contenteditable editing slice: retrieval indexing of inline `children` text,
traversal disambiguation of inline vs doc-children, paste-time sanitization →
the markdown file import slice: initial-ingestion corpus → RAG store as a
one-way snapshot).

## CURRENT WORK / handover-state

**IMMEDIATE STATE (2026-09-08): two Phase-2 slices share the tree; the cross-store fan-out slice is COMPLETE and the registry hot-apply slice has U-H1 landed.** (1) **Cross-store fan-out (`stores:"all"`)** — U-F1 `mergeStoreResults` / U-F2 `qualifyStoreResult` / U-F3 the `stores:"all"` schema + MCP/IPC wiring are ALL LANDED and SLICE-COMPLETE (see the U-F1/U-F2/U-F3 DONE rows below; slice live-scenario PARKED). (2) **Registry hot-apply** — **U-H1** (`src/main/rag-store-registry-write.ts`) is LANDED; **U-H2 (the runtime hot-apply controller — mutable live `RagStoreDirectory` + closure rewiring) is the NEXT cycle**; then U-H3 → U-H5 → U-H4 → U-H6 → U-H8 (+ U-H7 split out), per `docs/specs/registry-hot-apply-review.md` §2 D8 + the unit decomposition. **Trio VERIFIED GREEN 2026-09-08 (the current build state): 2609 pass / 41 skip (118 files), typecheck clean, build clean** — the earlier 4 live-ollama integration failures (`tests/embeddings-ollama-integration.test.ts`, `tests/embeddings-batch.test.ts` W2 LIVE) were environmental (no `embeddinggemma` served) and re-pass once ollama serves the model (verified this pass). **A fresh supervisor's next action: begin the U-H2 cycle (the spec `docs/specs/unit-h2-runtime-controller.md` does not exist yet — author it from the hot-apply gate, then red→green→adversarial→blind-greens→doc-review per RCA-1/2/3/4/6).** The full F/H slice work was checkpointed in commit `<FILLED-AT-COMMIT>` so U-H2 builds on a clean green base.

**COMPLETE (2026-09-05): the multi-store Phase-1 slice — SPEC GATE + ALL FIVE per-unit TDD cycles COMPLETE (U-MS1, U-MS2, U-MS4, U-MS3 and U-MS5 — all five DONE rows are LANDED below; the U-MS5 blind-greens + live-scenario ran after its doc-review and are LANDED: `unit-ms5-settings-listing-greens.md` 25/0/9 + the live battery). The feature request is marked PHASE-1-SLICE IMPLEMENTED/COMPLETE in `docs/feature-requests/multi-document-store-config.md`. Trio: 2415 pass / 41 skip, typecheck + build clean (113 files). The APP IS LIVE WITH THE MULTI-STORE BUILD (2026-09-05, operator restart via the new launcher `scripts/start-app.sh`): all 12 rag/edit tools carry the `store` argument, the amended A5 description, the F3 `rag.query` result `store:'main'` field, and `rag.query {store:'nope'}` fails loud. A vector-mode launch was verified end-to-end against real ollama (`scripts/start-app.sh --mode=vector`: warm-up → born-lexical → MCP ready → build → `vector boot: promoted`). No OPEN work remains for this proposal — this entry is retained as the completed-slice narrative + pointer to the Phase-2 parked rows in `docs/pending.md` and the live pending batteries (U-MS1/U-MS2/U-MS4/U-MS3/U-MS5 — each awaits a UI-interactive / multi-store-registry session, per its revisit condition).** New feature request
`docs/feature-requests/multi-document-store-config.md` (configurable multiple named document stores for the RAG engine). The four-agent gate ran per gate 1: validity **VALID-WITH-AMENDMENTS** → critique **UNSOUND-as-written**
(12 blockers B1–B12; path forward = a Phase-1-only slice) → architecture **PROCEED — SOUND-WITH-AMENDMENTS** (Alternative B, Phase-1 slice,
decisions D1–D12) → change-analysis **PROCEED-WITH-AMENDMENTS** (binding amendments A1–A10). Full record:
`docs/specs/multi-document-store-config-review.md`. **The user approved the Phase-1 slice (2026-09-05, the recommended option).** The eight
decision rows (MULTI-STORE-REGISTRY, SINGLE-WRITER-STORE-PER-STORE, ENGINE-PER-STORE, STORE-QUALIFIED-BROADCAST, STORE-ID-PREFIX,
IMPORT-ROOT-PER-STORE, VECTOR-TOPOLOGY-PER-STORE, UI-SELECTOR-DEFERRED) are LANDED in `docs/decisions.md`; the Phase-2 non-goals are parked in
`docs/pending.md`. **SPEC GATE COMPLETE (2026-09-05):** the five unit specs are LANDED — `docs/specs/unit-ms1-store-registry.md` (452-line
registry contract at the gate: 3 exported functions + 13 byte-pinned fail-loud messages + FS1–FS30; the landed unit added FS31/FS32 (the adversarial fix batch) and 63 tests), `unit-ms2-store-wiring.md` (the `rag-store-directory`
resolver + the 12 tool schemas + the failed-store matrix + the result-`store` ownership), `unit-ms3-store-qualified-broadcast.md` (the shared
payload collapse + the 4 emission sites + the host drop guard), `unit-ms4-id-prefixing.md` (the `<name>:` minting seam + A1 resolution (a) +
the FOUR id-minting-site census), `unit-ms5-settings-listing.md` (`IPC_RAG_STORE_LISTING` + the settings pane + the `RagQueryPayload.store?`
passthrough). The reviewer loop ran THREE iterations to empty: iteration 1 = 13 findings (4 BLOCKER — the U-MS2/U-MS3 `handleEditTool` seam,
the orphaned `ImportStoreContext` pass-through, the unowned result-`store` field, the unresolvable IPC passthrough), iteration 2 = 8 findings
(3 MAJOR incomplete-sweep leftovers), iteration 3 = 3 must-fix residuals (a false cross-ref, a retired placeholder, an assertion-level
ambiguity) — all fixed, marker-sweep clean. **Next steps for a fresh supervisor:** the per-unit cycles in execution order **U-MS1 → U-MS2 →
U-MS4 → U-MS3 → U-MS5** (RCA-2: one red→green→adversarial→blind-greens→doc-review cycle per unit, never shared inline; red set recorded per
RCA-1) — U-MS1 cycle COMPLETE through the doc-review pass (2026-09-05: TestWriter red 46 — suite-load, the module does not exist → Implementer green 46/46, with the FS20–FS24 spec self-contradiction resolved by the Architect's option-A amendment of the five example rows, code unchanged → adversarial F-MS1-1..15 (2 MEDIUM / 6 LOW / 7 INFO) → red-first fix batch 10 → 63/63 → blind-greens 34 PASS / 1 FAIL reconciled to 35/0 (F-BLIND-MS1-1: ECMAScript `String(1n)` === `'1'`; the expectation was the drift) → live-scenario battery PARKED (the V1 pattern; the app is running but exposes no registry surface until U-MS2) → the doc-review pass `archive/reviews/2026-09-05-unit-ms1-doc-review.md`); **the U-MS1 DONE row is LANDED below; the U-MS2 cycle is COMPLETE through the doc-review pass (2026-09-05: TestWriter red 57 — suite-load → Implementer green 56/57 + 1 staged red (test 56, U-MS4's F2 staging pin) + 2 supervisor repairs to TestWriter defects (tests 08/16) → adversarial F-MS2-1..11 (1 HIGH / 3 MEDIUM / 3 LOW / 4 INFO) → red-first fix batch (58/59/60/61 + the sanctioned test-20 re-pin; test 63 HUNG the pre-fix module) → 62 pass / 1 staged red → blind-greens 43 PASS / 0 FAIL / 3 DEFERRED (`docs/specs/unit-ms2-store-wiring-greens.md`) → live-scenario PARKED (surface-absence — the app serves the pre-U-MS2 build; battery written, `docs/specs/unit-ms2-store-wiring-live-pending-battery.md`) → the doc-review pass `archive/reviews/2026-09-05-unit-ms2-doc-review.md`) — the supervisor lands the U-MS2 DONE row; U-MS4's delegation followed (the execution order U-MS1 → U-MS2 → U-MS4 → U-MS3 → U-MS5) — **U-MS4's cycle is NOW COMPLETE through its doc-review pass (see above; the supervisor lands the U-MS4 DONE row). U-MS3's cycle is COMPLETE through its doc-review pass (see the U-MS3 cycle record below); U-MS5's cycle is COMPLETE through the doc-review pass (2026-09-05 — TestWriter red (the §5.8/§5.9 red set authored per RCA-1) → Implementer green 39 pass / 3 skip (3 sanctioned re-pins = TestWriter fixture gaps) → adversarial F-MS5-1..5 (2 MEDIUM / 2 LOW / 1 INFO) → the F-MS5-2 red-first fix batch (the §5.4 wiring guard, byte-pinned) → **unit 41 pass / 3 skip (44 total: the 39/3 + the 2 F-MS5-2 R-tests), full suite 2415 pass / 41 skip, typecheck + build clean** → §3a registered → this doc-review pass `archive/reviews/2026-09-05-unit-ms5-doc-review.md`, which also CLOSES the U-MS2 F4 end-to-end row; the supervisor lands the U-MS5 DONE row AFTER the outstanding U-MS5 blind-greens + live-scenario gates, see the outstanding items).** After each unit's green run the adversarial (RCA-3) and blind-greens (RCA-4) gates,
then the doc review (RCA-6), then the trio. The trio baseline is **2415 pass / 41 skip after the U-MS5 cycle** (2374/38 after the U-MS3 cycle; 2351/38 (111 files) after the U-MS4 cycle; 2301/38 (109 files) after the U-MS2 cycle; 2239/38 after the U-MS1 fix batch; 2176/38 at the W5 close; review §6's cost estimate cites the W5 baseline historically).
**U-MS2 delegation notes (EXECUTED 2026-09-05 — the cycle is COMPLETE through the doc-review pass; kept as the record of the delegation brief):** the spec is `docs/specs/unit-ms2-store-wiring.md` (the `rag-store-directory` pure module `resolveStoreArg`/`buildRagStoreDirectory` + the 12 tool inputSchemas + the resolution-first ordering + the engine map + the failed-store matrix + the F2 import pass-through + the F3 result-`store` field + the F4 IPC dir injection); the TestWriter writes `tests/unit-ms2-store-wiring.test.ts` from the spec ALONE (est. 28–36 tests) and must NOT touch `src/`; the Implementer then lands the least code in `src/main/rag-store-directory.ts` (NEW) + `src/main/main.ts` + `src/main/mcp-server.ts` (+ the `edit-ops.ts` context plumbing) — mind the §5.6 execution-order staging pins (the F2 pass-through byte-equals the 2-arg call until U-MS4's optional parameter exists; the F4 dir injection's end-to-end IPC row completes at U-MS5) and the §5.9 byte-equality red matrix; U-MS1's module (`src/main/rag-store-registry.ts`) is the consumed dependency — its F-MS1-15(c) downstream pin (the directory stays Map-keyed by name) is a U-MS2 conformance requirement.
U-MS4 delegation notes (EXECUTED 2026-09-05 — the cycle is COMPLETE through the doc-review pass; kept as the record of the delegation brief): the spec is `docs/specs/unit-ms4-id-prefixing.md` (the `importMarkdownCorpus` optional 3rd param `store?: ImportStoreContext` `{ name, isDefault, reservedNames? }`; the A1 resolution (a) — the default store's import seam REJECTS a documentId equal to any registered non-default store name with the byte-pinned message `markdown import: documentId collides with a registered store name: <id>`; the FOUR id-minting-site census in `markdown-parse.ts` incl. the edge-id site `:448`; the per-store path resolution `resolve(corpusRoot, file)` at `markdown-import.ts:84`; the Unit T supersession of the old relative-path rule); the TestWriter writes `tests/unit-ms4-id-prefixing.test.ts` from the spec ALONE (est. 12–16 tests, the spec's §5.10 notes the count supersedes the review's estimate) and must NOT touch `src/`; the Implementer then lands the least code in `src/main/markdown-import.ts` (+ the store-name param; `markdown-parse.ts` is NOT changed — the prefix is applied to the documentId INPUT, not inside the parser); the F2 staging handoff: U-MS2's wired import call (`mcp-server.ts:529`) currently passes 2 args — U-MS4 adds the optional 3rd `ImportStoreContext` and U-MS2's §5.6 pass-through becomes active (the U-MS2 test 56 staged red flips green HERE); the default store's import output stays BYTE-EQUAL to today (A4); the A1 corner (a default-store document whose basename equals a registered store name) per the pinned resolution (a).
**U-MS3 delegation notes (EXECUTED 2026-09-05 — the cycle is COMPLETE through the doc-review pass; kept as the record of the delegation brief):** the spec is `docs/specs/unit-ms3-store-qualified-broadcast.md` (the §5.1 collapse resolution — ONE shared `RagStoreChangedPayload` in `src/shared/types.ts` with REQUIRED `store: string`; §5.3 the four emission sites — main.ts:249,286,308 + mcp-server.ts:1134's seven construction points stamping `store: <resolved name>` via U-MS2's `ref?.name ?? ''` (NO new handleEditTool param — F1); §5.3a the main.ts-side state-expression map (NODE-TESTED vs TYPECHECK-LEVEL vs RELEGATED-to-live-pending-battery); §5.4 the `lastStore` capture + the foreign-store drop guard with the R3 ordering; §5.5/§5.6 the snapshot `store` field + the byte-equality rows + the exactly-once broadcast-count invariants); the TestWriter writes `tests/unit-ms3-store-qualified-broadcast.test.ts` from the spec ALONE and must NOT touch `src/`; the Implementer then lands the least code in `src/shared/types.ts` + `src/main/preload.ts` (the compat re-export) + `src/main/mcp-server.ts` (the seven construction points + the collapse) + `src/main/main.ts` (the three sites + the snapshot handler + the host capture) + `src/renderer/sidebar-panes.ts` (the `lastStore`/`lastSnapshot` capture + the drop guard) — mind the pre-U-MS3 41 `handleEditTool` call-site ripple (the payload-literal assertions only) + the 11 snapshot-fixture files gaining `store: 'main'` + the 3 direct host-payload injections (contenteditable-editor-host.test.ts:568,835,1046); the broadcast-count invariants (a successful edit broadcasts EXACTLY ONCE, the Unit P A4 extension) MUST stay green; the F9 R3 ordering (capture-before-subscribe) + the fail-closed drop on `lastStore === null`.
**U-MS3 cycle record (COMPLETE through the doc-review pass, 2026-09-05 — the supervisor lands the U-MS3 DONE row below):** TestWriter red **16 behavioral + 3 typecheck-level** (20 authored; the emission sites don't stamp `store`; the host lacks the guard; the collapsed shared type doesn't exist; 4 green-on-arrival guards) → Implementer green 19/20 (two SPEC-CONFLICT escapes, both arbitrated: (1) test 04's `split_node` assertions — `splitNode` KEEPS the source id as `nodeIds[0]`, only `nodeIds[1]` is minted per §5.3's pinned `[n0.id, n1.id]` — corrected `expect(p.nodeIds[0]).toBe('para')`; (2) the §6-mandated `contenteditable-editor-host.test.ts` fixture updates were NOT applied by the landing pass — the 3 injected payloads (:568/:835/:1046) AND the harness BOOT snapshots (`singleSectionSnapshot()` + the `makeBridge` default) lacked `store`, so the guard (and the `lastStore` capture reading `snapshot.store`) dropped every broadcast → state 18/28/37 failed. The supervisor closed the gap: `store:'main'` added to the 3 injections, `singleSectionSnapshot()` and the `makeBridge` default) → **U-MS3 green: 20/20 unit; full trio 2374 pass / 38 skip, typecheck + build clean** (the §6 contenteditable re-pins are the ONLY sanctioned test changes). **Adversarial pass (RCA-3): F-MS3-1..6** (1 MEDIUM: F-MS3-1 the fail-closed silent drop of an addressed-store broadcast with a missing/`undefined` store → FIXED-WITH-REGRESSION: distinct `console.warn` on the malformed-store + `lastStore === null` drop branches, foreign drops stay silent, no drop-outcome change (R1–R3 red→green → unit 23/23); 2 LOW: F-MS3-2 the legacy `store:''` sentinel loss documented, F-MS3-3 the `delete_node` §5.3 `removed:true` qualifier spec-amended; 3 INFO: F-MS3-4 type-level-only REQUIRED field noted, F-MS3-5/6 verified-clean — recorded in spec §3a). **U-MS3 cycle COMPLETE (2026-09-05) — see the CURRENT WORK block + the U-MS3 delegation notes (EXECUTED) above; the original NEXT-directive text that follows is SUPERSEDED (recorded for history):** blind-greens (RCA-4) → live-scenario (the app is LIVE — the broadcast/snapshot `store` surface may be observable via a UI edit's re-derive on :3787, but the host change is renderer-side; park if not MCP-observable) → doc-review (RCA-6, `archive/reviews/2026-09-05-unit-ms3-doc-review.md`) → the U-MS3 DONE row.**
**U-MS5 delegation notes (EXECUTED 2026-09-05 — the cycle is COMPLETE through the doc-review pass; kept as the record of the delegation brief — the FINAL unit, the read-only settings listing + the `RagQueryPayload.store` passthrough):** the spec is `docs/specs/unit-ms5-settings-listing.md` (the `IPC_RAG_STORE_LISTING = 'provident:rag-store-listing'` channel + the `RagStoreLoadStatus`/`RagStoreListingEntry`/`RagStoreListingPayload` types + the `handleRagStoreListingIpc` handler + the `bridge.rag.stores()` preload method + the `operator-rag-stores` settings-pane section authored as provident data in the isolated operator scope + the `RagQueryPayload.store?` optional field + the F4 dir-plumbing consumption + the `query(query, topK?, store?)` bridge param + the RAG-QUERY-STORE-DISPLAY-ASYMMETRY row + the BE-1..BE-8 byte-equality acceptance rows); the TestWriter writes `tests/unit-ms5-settings-listing.test.ts` from the spec ALONE; the Implementer lands `src/shared/types.ts` + `src/main/preload.ts` + `src/main/mcp-server.ts` (the handler) + `src/main/main.ts` (the ipcMain.handle) + `src/renderer/sidebar-panes.ts` (the settings-pane section + the search-pane passthrough) — this unit COMPLETES the U-MS2 F4 end-to-end row (`RagQueryPayload.store` + `handleRagQueryIpc`'s dir plumbing) and the U-MS2 §5.9 IPC-half staging pin; the U-MS3 snapshot/broadcast `store` delta is the precedent for the settings listing's byte-equality rows; it is the slice's final unit (execution order U-MS1 → U-MS2 → U-MS4 → U-MS3 → U-MS5).

## OPEN

**Multi-document store config — PROPOSAL GATE COMPLETE (PROCEED-WITH-AMENDMENTS), USER GO-AHEAD GIVEN; SPEC GATE COMPLETE (2026-09-05 — see the CURRENT WORK block); the per-unit TDD cycles are COMPLETE: U-MS1's, U-MS2's, U-MS4's, U-MS3's AND U-MS5's cycles are COMPLETE through their doc-review passes (the supervisor lands the U-MS3 and the U-MS5 DONE rows; the U-MS5 DONE row additionally awaits the outstanding U-MS5 blind-greens + live-scenario gates).** Feature request
`docs/feature-requests/multi-document-store-config.md` (the Agent Harness bulk-research dogfooding driver: per-run corpora must not mix with the
main knowledge base in the single store). **Gate outcome:** validity VALID-WITH-AMENDMENTS → critique UNSOUND-as-written (the literal five-ask
package is rejected — per-store embedders would destroy other stores' vector-cache entries via the single-tuple prune contract [B1], per-store
embedder boot contradicts the §5.12 failure-class-2 sync warm-up [B2], cross-store fan-out collides on deterministically-minted node ids with
corpus-relative BM25 scores [B3/B4]) → architecture PROCEED (Alternative B) → change-analysis **PROCEED-WITH-AMENDMENTS**. **RATIFIED SHAPE (user go-ahead 2026-09-05): the Phase-1 slice** — a NEW pure registry module `src/main/rag-store-registry.ts` + server-side registry file
`provident-rag-stores.json` (NOT in OperatorSettings), implicit `{name:'main', default:true}` entry synthesized at boot mapping to the legacy
`provident-rag.json` (zero-config byte-equal), optional `store` argument on all 12 `rag.*`/`edit.*` tools resolved FIRST with fail-loud
no-enumeration errors, N store instances + N lexical engines, per-store import roots (relative paths resolve against the addressed store's
`corpusRoot`), non-default-store `<name>:` id prefixing at the import minting seam, REQUIRED `store` qualifier on `rag-store-changed` broadcasts
+ host-side foreign-store drop, a read-only provident-authored settings listing, and NO store-census MCP tool. **Phase-2 non-goals** (parked in
`docs/pending.md` with pinned seams): per-store embedder configs + per-store cache files + N boot controllers; cross-store `stores:"all"` fan-out;
registry hot-apply/removal/rename; per-store RBAC; root-allowlist base; scratch-store promotion. **Amendments A1–A10 bind the spec** —
notably A1 (the `<name>:` prefix-namespace hole at the node-id level, `markdown-parse.ts:444,565`), A4 (the zero-config byte-equality table as
binding acceptance criteria, the ONE intentional delta being the broadcast/result `store:'main'` field), A8 (the stale `mcp-endpoint.md` §6.2
group table must be reconciled in the per-unit doc reviews). Full record + unit decomposition + risk register + cost estimate:
`docs/specs/multi-document-store-config-review.md`. Decision rows LANDED in `docs/decisions.md` (2026-09-05).

**Vector-mode (local ollama) boot fix — the vector-boot proposal COMPLETE (2026-09-05):** DIAGNOSED → immediate remediation LANDED → four-agent proposal gate COMPLETE (PROCEED-WITH-AMENDMENTS) → user go-ahead GIVEN (cache-inclusive variant, 2026-09-05) → spec amendment LANDED (§5.12/§5.13) → **all four units LANDED per gates 2–9 — W1 boot model, W2 batch seam, W3 failure policy, W4 cache (each its own red→green→adversarial→blind-greens→doc-review cycle; see the Unit W1–W4 DONE rows below) — plus the USER-DIRECTED W5 FOLLOW-UP LANDED (2026-09-05, "live upload should also update the cache"; see the Unit W5 DONE row below): live uploads now update the cache. The user-approved cache-inclusive design is fully in place — "vectorize only if the vector is not found": the persisted cache loads at boot, hits adopt with NO HTTP call, only the misses embed; the final trio is 2176 pass / 38 skip (107 files), typecheck + build clean. Every gate (RCA-1..RCA-6) ran per unit; the W4 doc review recorded the proposal's gate statement in `archive/reviews/2026-09-05-unit-f-w4-doc-review.md`, and the W5 doc review (RCA-6, the closing pass of the follow-up) the follow-up's FINAL GATE STATEMENT in `archive/reviews/2026-09-05-unit-f-w5-doc-review.md`. No OPEN work remains for this proposal — this entry is retained as the completed-slice narrative + pointer to the DONE rows (P4 dist hygiene stays parked in `docs/pending.md`).**
User report: "Issue with attempting to use local Ollama as embedding provider."
Diagnosis (reproduced on this machine): (1) **FIXED** — the `dist/` bundle was
STALE, predating the F9 empty-node-skip fix (green-tested in src; the operator's
real store has 6,629 empty/whitespace-content nodes), so vector-mode boot crashed
deterministically with `ollama embed: malformed response` before any UI. A/B
reproduced (git HEAD vs fixed src against the real store slice). `dist/` rebuilt;
F9 verified in the bundle; trio green (2031 pass / 38 skip, typecheck clean,
build clean). Recorded as **HOST-F-DIST-STALE** in `docs/defects.md`.
(2) **APPROVED — the user's go-ahead is GIVEN (2026-09-05, the cache-inclusive variant):**
even with F9, vector-mode boot embeds ~16,840 non-empty nodes SEQUENTIALLY
(~0.1s/call measured against live ollama `embeddinggemma:latest`) ≈ 28 minutes
before the app is usable; ANY single embed failure aborts boot (`createVectorIndex`
rejects → `main()` throws — and the build runs BEFORE the window + MCP server
come up, so boot is fully dark); the 5s default `timeoutMs` can trip on ollama's
cold model load. **Four-agent gate run** (validity VALID-WITH-AMENDMENTS →
critique BLOCKERs B1–B4/amendments A5–A11 → architecture SOUND-WITH-AMENDMENTS
→ change-analysis **PROCEED-WITH-AMENDMENTS** — full record:
`docs/specs/ollama-vector-boot-review.md`). The reviewed design: boot model B
(fail-fast warm-up gate on a real `/api/embed` → window+MCP born-lexical →
background batched build → reconcile → atomic one-way promotion swapping the
embedder inside the ONE shared engine), an optional provider-level `embedBatch`
seam (alignment invariant + per-batch reject→per-item fallback + N×timeoutMs
budget + AbortController), and the three-class failure policy (config-missing →
abort; provider-down-at-boot → abort; per-node-after-reachability → skip+log
with an 'empty'|'transient' skipped-map), landed as W1 → W2 → W3. **User
go-ahead (2026-09-05, review record §4a):** asked whether embeddings are
computed on every boot or only when a vector "is not found", the user approved
the **CACHE-INCLUSIVE VARIANT** — the persisted embedding cache is IN-SCOPE
core contract, landing as unit **W4** (the `docs/pending.md` parked row is
SUPERSEDED). **Spec amendment LANDED (2026-09-05, this pass):**
`docs/specs/unit-f-embeddings.md` amended — NEW §5.12 (the W1 vector-boot
controller: warm-up gate / born-lexical pending / background build /
reconcile-with-tie-rule / atomic one-way `setEmbedder` promotion + the
unit→section→test-file mapping) and §5.13 (the W4 cache contract:
content-hash key, embed-on-miss, invalidation, write-through, pruning,
fail-states); §5.2 (`embedBatch?` + per-text budget + AbortController), §5.3
(`skipped` map + the UNIT-F-SKIP-EMPTY empty-guard extension to add/update +
the W3 embed-failure flip), §5.5/§5.7, and §5.8–§5.10 (states/fail-states/
census, incl. the 0-of-16,840 truncation measurement) amended in place; the
§3a F9 label collision resolved (the greens row renamed **GREEN-OLLAMA-MALFORMED**;
the empty-node skip is **F10 / UNIT-F-SKIP-EMPTY** with a §5.3 rule + a named
W3 regression test). Decision rows **VECTOR-BOOT-BACKGROUND-PROMOTE** +
**VECTOR-CACHE-CONTENT-HASH-KEY** landed in `docs/decisions.md`. Still parked
with a revisit condition: P4 dist hygiene (`docs/pending.md`). **W1 is LANDED (2026-09-05):** the TestWriter brief (the review record §4
final delegation — consumed by the W1 TestWriter) was executed red →
implementer green → adversarial (RCA-3) → blind-greens → doc-review (RCA-6);
the Unit W1 DONE row below carries the full record. **W2 batch seam is
LANDED (2026-09-05** — the Unit W2 DONE row below carries the full record;
`tests/embeddings-batch.test.ts`). **All four units ARE landed (the §5.12
decomposition COMPLETE):** W4 cache LANDED 2026-09-05 (`tests/vector-cache.test.ts`
— 35 tests incl. the 8 RCA-3 adversarial regressions R1–R8; see the Unit W4
DONE row) after the W3 failure policy (`tests/embeddings-failure-policy.test.ts`
+ the re-pins; see the Unit W3 DONE row). The adversarial (RCA-3),
blind-greens (RCA-4) and doc-review (RCA-6) gates all ran for W4; the
vector-boot proposal is COMPLETE; the user-directed W5 follow-up ("live
upload should also update the cache") is likewise LANDED (2026-09-05,
`tests/live-embed-cache.test.ts` — see the Unit W5 DONE row below).
**Live-verified in the gate pass (review record §5):** ollama batch
`input` works (3→3 ordered 768-dim vectors); positional alignment holds even
with an empty batch item; **0 of 16,840 non-empty nodes exceed the model's
2048-token context** (est. p50=12 tokens) — no chunking unit needed.

**provident-ssr upgraded to 0.3.2 (2026-08-31):** the package was upgraded
from `^0.3.0` → `^0.3.1` → `^0.3.2` (trio green — 2003 pass / 38 skip,
typecheck clean, build clean). This resolves the **ENG-INLINE-ORDER** engine defect
(the upstream `bodyRuns` capability — additive, opt-in text/element interleaving;
DOM/SSR adapters render runs IN ORDER) and the **ENG-BODYRUNS-WIRE-REF** blocker
(the `{ child: <authored-id> }` ref is rewritten at emit time — verified: a
TEMPLATE-authored node renders `<strong>Proposal:</strong> Astrographer`
correctly). **0.3.2 additionally fixed the def-fill / component-prototype
`bodyRuns` gap.** **HOST-SIDE re-expression STILL BLOCKED (2026-08-31, verified
with the real `buildTraversal` envelope):** the emit-boundary child-wire
translation STILL FAILS for **PLACEMENT-ROUTED (path-state) content roots** — the
RAG wiki's exact rendering model (every subtree root is a placement-routed
`LegacyContentPayload` into a zone). The global `authoredIdToWire` index maps a
path-state child to `pathWireOf`'s NODE id while the parent's `childOrder`
references its PATH-KEY wire, so the rewritten child run is dropped (children
vanish). Recorded as handoff item **`ENG-BODYRUNS-WIRE-REF-PATHSTATE`**
(`docs/defects.md` + `docs/HANDOFF.md`); a candidate host-side resolution is a
post-`translateLegacy` rewrite of `bodyRuns` child refs to the ACTUAL emitted
(path-key) wires. The parser/model offset work was reverted (it is inert without
working `bodyRuns`). NOTE: the host's dom-shim does not track interleaved order
for DOM-view tests. The markdown adapter does NOT consume
`bodyRuns` (upstream §9 L3 — the fix is for HTML/DOM rendering).

**Inline-ordering render fix — RESOLVED via provident-ssr 0.4.0 (2026-08-31).**
The four-agent gate ran (`docs/specs/inline-order-render-fix-review.md`):
PROCEED-WITH-AMENDMENTS, Design B (per-child `offset?: number` on `RagNodeChild`).
**M1 (offset model + the three producers emitting full-projection `content` +
offsets) is DONE + GREEN** (spec `docs/specs/unit-m1-inline-offset-model.md`;
adversarial findings H1–H6 recorded in §3a). **The render was blocked by a THIRD
engine ADAPTER defect** (`ENG-BODYRUNS-WIRE-REF-PATHSTATE` — the `bodyRuns`
run-child lookup uses a bare `wireKey` while placement path-state children are
under composite `pathKey\0forkKey` keys; not host-fixable). **provident-ssr 0.4.0
(2026-08-31) resolved it by adding a bare `text` child node + the content-XOR-
children model**: text beside children is now a `text` child in `childOrder`, so
interleave is deterministic WITHOUT `bodyRuns`. **The traversal `buildSubtree` was
rewritten to the XOR shape** — the subtree root carries NO `content`; its body is
the interleaved `text` + inline-span children (built from the full-projection
`content` + child offsets via `buildInterleavedChildren`). Verified end-to-end:
`**Proposal:** Astrographer` → `<strong>Proposal:</strong> Astrographer` (strong
first) and `Some **bold** text` → `Some <strong>bold</strong> text`. **Trio green
(2031 pass / 38 skip, typecheck clean, build clean).** The M3/M2/M4 `bodyRuns`
units are SUPERSEDED (the host no longer emits `bodyRuns`); the M3 red set is
archived at `archive/inline-order/2026-08-31-m3-bodyruns-rewrite-redset.test.ts`.
`ENG-BODYRUNS-WIRE-REF-PATHSTATE` is now MOOT for the host (still an upstream
adapter defect, but the host's interleave no longer uses `bodyRuns`).
kept (data-correct, inert for render until the adapter is fixed).

**New SPECULATIVE items (2026-08-29, user request):** six future features
recorded in `docs/pending.md` §SPECULATIVE — (1) lock document elements from
editing; (2) toggle whether MCP can lock/unlock elements (or only human); (3)
automatic (re-)export of markdown when contents change internally; (4) optional
HTML export instead of markdown; (5) MAJOR — migrate the RAG engine to a
faster/more-multithreading-capable language (Rust/Go/Odin/etc.); (6) JSON export
of a document path through the RAG graph with adjacent nodes out to a requested
number of steps. None are scheduled; each has a revisit condition in
`docs/pending.md`.

### Scoped-load fix — PROPOSAL GATE PROCEED-WITH-AMENDMENTS; Unit 1 (store adjacency) DONE, Unit 2 (scoped traversal + MCP refactor) DONE, Unit 3 (doc-heads doc-nav) DONE (2026-08-29, user go-ahead given)

**LIVE VERIFICATION (2026-08-29):** the app was run against the persisted
62MB corpus (63 documents, 23469 nodes) and the live scenarios exercised via
the MCP server (HTTP 3787). **A live finding surfaced + was fixed:** the boot
rendered ALL 63 documents at once (the full-graph render that times out), even
with the scoped walk. The boot now renders ONLY the current document (the
localeCompare-first doc-head, matching the doc-nav's first entry) — `get_rendered_html`
dropped from a 60s+ timeout to ~0.15s. The doc-nav pane renders all 63
documents with the current marked; `rag.get_document` returns scoped subgraphs
(77–430 nodes, not the whole graph). Regression test added
(`tests/sidebar-panes-host.test.ts` "SCOPED-LOAD (live finding)"). The doc-nav
`li` nodes are NOT MCP dispatch targets (no handlers), so the `pane-doc-nav-select`
select can't be driven via MCP dispatch — a pre-existing MCP-surface limitation
(recorded in `docs/pending.md`).

A user-reported load bug: "Application is trying to parse entire graph and
timing out. Correct behavior is that the document list only needs to find the
document heads, and the document rendering only needs to walk the graph based
on the document links from the head." The proposal gate is **PROCEED-WITH-
AMENDMENTS** (validity VALID-WITH-AMENDMENTS, critique SOUND-WITH-AMENDMENTS,
architecture SOUND-WITH-AMENDMENTS, change-analysis PROCEED-WITH-AMENDMENTS —
see `docs/specs/load-bug-scoped-traversal-review.md`). **Unit 1 (store
adjacency) is DONE (2026-08-29)** — the five `RagStore` adjacency methods
(`edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/`docHeadForDocument`),
the lazy O(E) index + invalidation across the 6 mutation paths, the shared PURE
adjacency core (`buildAdjacencyIndex` + the 5 query helpers), the quarantine
exclusion, and the read-only `createSnapshotStore(nodes, edges)` adapter have
landed (the PURE core + `createSnapshotStore` in `src/main/adjacency.ts`,
re-exported by `src/main/rag-store.ts`; spec
`docs/specs/unit-v1-store-adjacency.md`; greens
`docs/specs/unit-v1-store-adjacency-greens.md` 40/40). **Unit 2 (scoped traversal
+ MCP refactor) is DONE (2026-08-29)** — see the Unit V2 DONE row. **Unit 3
(doc-heads doc-nav) is DONE (2026-08-29)** — see the Unit V3 DONE row.
The fix is host-side (`src/`), scoped to
BOTH the document list AND document rendering. **9 amendments** (pin the
`materialized`-set equivalence; single `computeDocumentSubgraph` source; the
`createSnapshotStore` shares the JSON store's adjacency implementation; the two
snapshot adapters implement the new methods; `selectDocument` validates against
the doc-heads list; preserve the `rag.get_document` return contract; pin the
`validateDocFlow` pre-scoping; reconcile the greens docs + trackers (RCA-6);
document the snapshot-transfer limitation). **3-unit split (RCA-2, each its own
red→green→adversarial→greens→doc-review cycle):** Unit 1 store adjacency
(`rag-store.ts` + `createSnapshotStore`); Unit 2 scoped traversal + MCP refactor
(`traversal.ts` + `mcp-server.ts` + the edit-surface change — highest risk);
Unit 3 doc-heads doc-nav (`shared/types.ts` + `preload.ts` + `main.ts` +
`pane-graph.ts` + `sidebar-panes.ts`). Units 2 and 3 depend only on Unit 1, so
they can run in parallel after it. Decision recorded in `docs/decisions.md`
(SCOPED-LOAD, ACTIVE); the snapshot-transfer follow-up in `docs/pending.md`.

### Editing-mode toggle slice — COMPLETE (all 5 units done), AWAITING the user's commit (2026-08-28, execution order U2→U3→U1→U5→U4)

The editing-mode toggle proposal (the "demo textarea vs rich-text document
editing" switch — `docs/specs/editing-mode-toggle-review.md`,
PROCEED-WITH-AMENDMENTS, approved as a 5-unit slice) is **CODE-COMPLETE** — all
five units (**U2 → U3 → U1 → U5 → U4**) have landed their red→green→adversarial→
greens→doc-review cycles (confirmed; no split/merge). The slice is **AWAITING
the user's commit**. **U2 is DONE (2026-08-28)** — the pure `decomposeRichHtml` module
(`src/main/rich-decompose.ts`) + the additive exports on
`src/main/paste-sanitize.ts` (see the Unit U2 DONE row). **U3 is DONE
(2026-08-28)** — the pure `isRichEditableRoot(type, ownsDocChildren)` gate + the
closed `EDITABLE_TYPES` set (new `src/renderer/rich-eligibility.ts`), the host
`applyEditingMode(envelope, editingMode)` post-assembly splice + the private
`this.editingMode` field (in `src/renderer/sidebar-panes.ts`, invoked in
`loadAppGraph` after `setTextareaReadOnly`, before `recomputeBackRefs`), and the
additive snapshot `children?` field on `RagSnapshotPayload.nodes` + the
`EditingMode` type (`src/shared/types.ts`) (see the Unit U3 DONE row). **U1 is
DONE (2026-08-28)** — the `editingMode` 4th
`OperatorSettings`/`Patch` field + `coerceEditingMode` (only `'contenteditable'`
passes, else `'textarea'`), the `IPC_OPERATOR_SETTINGS_CHANGED` broadcast (main
post-SET) + preload `onChanged`, the payload-authoritative synchronous host
`onOperatorSettingsChanged` (broadcast payload IS the store result — NO
re-fetch) + the button-toggle Settings control (text div + a toggle button
reading `data-mode`), the `operatorSet` simplification (broadcast drives the
re-render), the M9 supersession, the decision **D** supersession
(EDITING-MODE-SETTING row in decisions.md), AND the adversarial F1–F5 host
fixes (F1 = boot now applies a PERSISTED editingMode before loadAppGraph, F2 =
null-payload guard, F3 = compileHandlerBody-compatible toggle body, F4 =
double-click coalescing regression, F5 = operatorSet .catch). Full suite
1679 pass / 0 failed. Engine boolean-attribute gap recorded as `HOST/U1-ENG`
in docs/defects.md + docs/HANDOFF.md (the control pivoted to a button-toggle
to avoid it). Blind-greens (35/35, `docs/specs/unit-u1-editing-mode-setting-greens.md`
— the single F-2 blind FAIL was re-verified by the Implementer as a HARNESS
ARTIFACT, not a real bug; a regression test added to
`tests/editing-mode-broadcast-host.test.ts` that PASSES); proofreader +
documentation review in `archive/reviews/2026-08-28-u1-doc-review.md`; the U1
DONE row below. **U5 is DONE (2026-08-28)** — the `setRichText` atomic
content+children write-back op + the pure `deriveRichCommitBroadcast` helper +
the `handleRichCommit` shared handler + the `handleRichCommitIpc` broadcast
handler-body extraction + the `IPC_EDIT_RICH_COMMIT` channel +
`EditRichCommitPayload`/`RichCommitResult` + the preload `edit.commitRich`
bridge (see the Unit U5 DONE row below). **U4 is DONE (2026-08-28)** — the
contenteditable rich-text editor (handlers + bridge + discriminated
`CaretState`/`RichCaretEdge` + IME composition guard + the gated re-derive
caret restore) — the final unit of the slice (see the Unit U4 DONE row below).
contenteditable is the DEFAULT (decision **D** supersedes the FORM-CONTROL-EDITING
'NOT contenteditable' + the 'no global editingMode field' clauses in U1; commit
`1af5000` "Render fix" flipped the default from textarea to contenteditable). Each
unit was its own red→green→adversarial→greens→doc-review cycle per AGENTS.md
(RCA-1/2/3/6).

### Next slice — the rich-text contenteditable editing machinery (COMPLETE)

The rich-text contenteditable editing machinery (the rich-text converter built
IN-HOUSE as `src/main/rich-decompose.ts`, Unit U2 — see `docs/decisions.md` RICH-TEXT-EDITING-GATE, sequenced
textarea-first) is now **COMPLETE (2026-08-28, Units Q/R/S)**. The plain-text
textarea editing UI (Unit L) landed the textarea-first prerequisite; the
store-format `children` additive + hash-source foundation (Unit M) landed; the
three rich-text edit ops `setProps`/`setSubtree`/`setType` + the edit-op census
6→9 (Unit O) landed; the `IPC_EDIT_BATCH` batch channel (Unit P) landed; and the
three remaining RICH-TEXT-EDITING-GATE must-fix items have all landed: retrieval
indexing of inline `children` text (Unit Q), traversal disambiguation of inline
vs doc-children (Unit R), and paste-time sanitization (Unit S). **All
RICH-TEXT-EDITING-GATE must-fix items are now MET** — the milestone is complete.
**Batch atomicity MET 2026-08-28 (Unit N)** — the `applyBatch` transaction
primitive (a real transaction, not `store.enqueue`) has landed (see the Unit N
DONE row). **Census 6→9 MET 2026-08-28 (Unit O)** — the three rich-text ops
`setProps`/`setSubtree`/`setType` have landed (see the Unit O DONE row).
**IPC_EDIT_BATCH MET 2026-08-28 (Unit P)** — the `IPC_EDIT_BATCH` channel +
the `handleEditBatch` shared handler + the `bridge.edit.batch` bridge + the
`deriveBatchBroadcast` helper have landed (see the Unit P DONE row).
**Retrieval indexing of inline `children` text MET 2026-08-28 (Unit Q)** — the
retrieval module indexes + renders the inline `children` text via the new
`nodeText(node)` helper (see the Unit Q DONE row). **Traversal disambiguation
of inline vs doc-children MET 2026-08-28 (Unit R)** — the traversal renders the
inline `children` as child elements of the subtree root, disambiguated from
doc-children by the `rag-` id prefix (see the Unit R DONE row). **Paste-time
sanitization MET 2026-08-28 (Unit S)** — the pure `sanitizePastedHtml` module
normalizes pasted HTML into the `RagNodeChild[]` shape (see the Unit S DONE
row).

### Markdown file import (Unit T) — COMPLETE

The markdown file import slice (the initial-ingestion framing, per the
PROCEED-WITH-AMENDMENTS gate verdict + the user's ADJUSTED SCOPE) is now
**COMPLETE (2026-08-28, Unit T)**. The PURE `parseMarkdown` parser
(`src/main/markdown-parse.ts`) + the `importMarkdownCorpus` importer
(`src/main/markdown-import.ts`) + the default-off `edit.import_markdown` MCP tool
have landed, along with the additive `RagNodeType` 18→23 change
(`table`/`thead`/`tr`/`td`/`th`). See the Unit T DONE row.

### Live-app verification + two host fixes (2026-08-28)

Live verification of Unit T through the foundation HTML reading tools
(`provident.get_rendered_html`/`get_markdown`) surfaced **two PRE-EXISTING host
bugs (not Unit T), both fixed + regression-tested** (see `docs/defects.md`
HOST-UI1/HOST-UI2):
- **HOST-UI1** — the app shell was unreadable in dark mode (white-on-white).
- **HOST-UI2** — the `SidebarPanes` host NEVER booted in the real Electron
  renderer (`contextIsolation` freezes the `contextBridge`-exposed
  `window.provident`, so `installSidebarBridge` threw and aborted boot before
  subscribing to `rag-store-changed`; the test dom-shim didn't freeze, so tests
  missed it). Fixed by owning the `sidebar` bridge in the preload +
  `installSidebar(methods)`.

After the fixes, `edit.import_markdown` → RAG store → `rag-store-changed`
broadcast → renderer `reDerive` → `buildTraversal` → materialize works end to
end: the imported doc (headings, inline `<strong>`/`<em>`/`<a>`, list, and the
**table** with `th` cells) renders through `get_rendered_html`, the doc appears
in the doc-nav pane, and `get_markdown` carries the same content. Trio green
(1523 pass / 30 skip).

### Later units (noted, not in this slice)

_(none — Units A–T are implemented.)_

## DONE

- **Unit U-H1 — the pure registry WRITE module `src/main/rag-store-registry-write.ts` (the registry hot-apply slice's FIRST unit; execution order U-H1 → U-H2 → U-H3 → U-H5 → U-H4 → U-H6 → U-H8 (+U-H7 split out); U-H2 = the runtime controller is the NEXT cycle) (2026-09-08).** Spec
  `docs/specs/unit-h1-registry-write.md` (the gate `docs/specs/registry-hot-apply-review.md` §2 D2/D3/D4/D5/D7/D8 + A-P2-3; the five decision rows REGISTRY-WRITE-MODULE / REGISTRY-ATOMIC-WRITE / REGISTRY-RELOAD-ON-WRITE / REGISTRY-WRITE-FAILS-LOUD / REGISTRY-DELTA-RETURN LANDED in
  `docs/decisions.md`; the slice is NOT complete — ONLY U-H1 is landed; U-H2..H8 pending). Landed: ONE NEW pure node-testable module
  `src/main/rag-store-registry-write.ts` — 6 exported functions (`applyRegistryMutation`, `addRegistryStore`, `removeRegistryStore`, `renameRegistryStore`, `persistRagStoreRegistry`, `writeRegistryMutation`) + 4 exported types (`RegistryMutation`, `RegistryDelta`, `RegistryMutationResult`, `RegistryWriteResult`), NO exported consts; the pure validate+derive mutators (reuse the loader's `resolveRegistry` for validation, byte-unchanged + read-only; the loader stays PURE per-module, A-P2-3 — REGISTRY-NO-WRITE refined per-module); the atomic persist (`mkdir recursive` → `writeFileSync(path+'.tmp')` → fsync the temp → `renameSync`, THROWS on any failure — REGISTRY-WRITE-FAILS-LOUD, diverging from the sibling stores' swallow; REGISTRY-ATOMIC-WRITE); the combined `writeRegistryMutation` (re-read current disk state fail-loud on corrupt/never the implicit form → pure mutate (F14 fires via the threaded reserved path) → persist → RE-LOAD → return the fresh `{ loaded, delta }`, persisted-and-live never diverge — REGISTRY-RELOAD-ON-WRITE + REGISTRY-DELTA-RETURN); the structural D3 no-REMOVE pin (the import set holds the write primitives but NO `unlink`/`rm`/`rmdir`/`truncate` — a hot-remove can structurally NEVER touch a store's persistence file or journal); D4/D5 rename NON-default-only (W-rename-default) + the D4 no-persisted-ids half documented as a U-H2 caller precondition; D6 (NO new MCP tool, NO new IPC channel). **TestWriter red: 46 failing** (the suite failed to load — the NEW module does not exist; the §5.6 H1–H14 + F1–F26 + §5.7 R1–R5 + the §5.9 negative-pin red set authored per RCA-1) → **Implementer green: 46/46** (`tests/unit-h1-registry-write.test.ts`). **Adversarial pass (RCA-3): F-H1-1/F-H1-2 — all HOST, fixed + regression-tested (no package/upstream findings):** (LOW) F-H1-1 an ADDED store's unknown keys leaked into `configs`/the persisted file (a raw-spread add) → FIXED with `normalizeAddStore` (pinned-fields-only on the add path; `embedder` deliberately PRESERVED so the loader F10 still fires); (MEDIUM) F-H1-2 a stat RACE (`existsSync` present then `statSync` throws ENOENT — file vanished) escaped as a raw native ENOENT instead of the pinned W-unreadable → FIXED by putting the stat/read/parse in the SAME try/catch (a stat race now lands on W-unreadable, never a bare ENOENT); regression tests R-F-H1-1a/b + R-F-H1-2a in the unit file + registered in spec §3a → **unit 49/49**. **Blind-greens (RCA-4):** `docs/specs/unit-h1-registry-write-greens.md` — **31 PASS / 0 FAIL** (31 scenarios; the W-* byte-pinned census, the mutators, the atomic round-trip R1–R5, the D2 combined write G12–G16, the propagated loader fails G28–G29, the D3 no-remove pin G30 all reproduce from the live module). **Live-scenario gate: PARKED (per the user's instruction** — the hot-apply surface awaits a live app session; the write module is a pure node seam whose live effect is reachable only after U-H2 wires the runtime controller; no live pending-battery written, the PARK note + the IN-PROGRESS marker are recorded in `docs/pending.md`'s hot-apply row). **Doc-review pass (RCA-6):** `archive/reviews/2026-09-08-unit-h1-doc-review.md` (this spec↔code reconciliation: the 6-function/4-type/0-const census verified against `src/main/rag-store-registry-write.ts`; §3a populated with F-H1-1/F-H1-2; the §5.8 message-census count normalized 12→13; the five §4 decision rows LANDED in `docs/decisions.md`; the hot-apply row marked IN-PROGRESS (U-H1 landed; U-H2..H8 pending); the W-* census count normalized for internal consistency; the trackers reconciled). **Trio: 49/49 unit; unit-ms1 63/63; typecheck clean; blind-greens 31 PASS / 0 FAIL.** Decisions REGISTRY-WRITE-MODULE / REGISTRY-ATOMIC-WRITE / REGISTRY-RELOAD-ON-WRITE / REGISTRY-WRITE-FAILS-LOUD / REGISTRY-DELTA-RETURN (LANDED) in `docs/decisions.md`. **NOT yet landed (the next unit):** U-H2 — the runtime controller (applies the delta, rebuilds/tears down the live directory, refreshes the listing / the mechanical refresh-on-apply + the ms5 Red 18 re-write).

- **Unit U-F1 — the pure `mergeStoreResults` module (the cross-store fan-out slice's FIRST unit; execution order U-F1 → U-F2 → U-F3) (2026-09-08).** Spec `docs/specs/unit-f1-merge-store-results.md` (the proposal gate is `docs/specs/multi-store-fanout-review.md`; user go-ahead GIVEN 2026-09-08; decisions D1/D6/D7/D8/A-F1 pinned). Landed: the NEW pure module `src/main/merge-store-results.ts` (no Electron, no I/O) exporting **`mergeStoreResults`** + the **`StoreResultInput`** type; the rank-based per-store top-k interleave (D1 — round-robin by rank over the stores in array order, NEVER score-compare, so mixed embedders are SAFE); the skip-failed/empty behavior (D6 — a non-default `{ name, result: null }` failed store contributes zero, a failed DEFAULT store FAILS LOUD with `mergeStoreResults: default store result required` as the deliberate D6 default-exemption); the deterministic merge (D7 — canonical registry-insertion order, index 0 = the default store); the citations dedup across ALL stores by `(documentId, nodeId)` first-appearance; the merged flat trace `{ mode: 'flat', engine: 'local', topK, source: 'local' }` (`opts.topK` default 5, enforced ∈ [1, 50]); the default store's `ranked`/`context`/`markdown`/`lineMap`/`k` block (D2); NO `blockedBy` (flat-only, D4); the per-store `score > 0` floor applied UPSTREAM, NOT re-applied (§5.3). **TestWriter red: 24 failing** (the suite failed to load — the NEW module does not exist; the §5.8/§5.9 red set authored per RCA-1) → **Implementer green: 26** (`tests/unit-f1-merge-store-results.test.ts`). **Adversarial pass (RCA-3): F-F1-1..F-F1-4 — all HOST, fixed + regression-tested:** (MEDIUM) F-F1-2 the default store's block was NOT validated — a non-null default `result` missing `ranked`/`context`/`markdown`/`lineMap`/`k` silently leaked `undefined` → FIXED with the byte-pinned `mergeStoreResults: default store result must carry ranked/context/markdown/lineMap/k` assertion; (LOW) F-F1-3 the interleave pushed a sparse-array hole / `null`/`undefined` element verbatim → FIXED (the D6 zero-contributor skip still reaches non-null items beyond the hole); (INFO) F-F1-1 the citation dedup key uses string coercion (`${documentId}\0${nodeId}`) — non-string/missing ids collide, spec pins strings, NO fix (documented); (INFO) F-F1-4 the merged block/items are shared by reference — spec §5.2 pins copy-by-reference, NO fix (documented). **Blind-greens (RCA-4):** `docs/specs/unit-f1-merge-store-results-greens.md` — **23 PASS / 0 FAIL** (23 scenarios; the fail-state byte strings verified live). **Live-scenario gate: PARKED** — the module is PURE (no Electron/I-O; the MCP-facing fan-out behavior is U-F3's scope), so there is no live battery for U-F1 itself; the MCP surface verification is deferred to U-F3. **Doc-review pass (RCA-6):** `archive/reviews/2026-09-08-unit-f1-doc-review.md` (the §5.10 census re-verified against the landed module — `mergeStoreResults` + `StoreResultInput` in `src/main/merge-store-results.ts`; the §3a adversarial register populated; the FANOUT-INTERLEAVE-MERGE decision row LANDED in `docs/decisions.md`; the `docs/pending.md` cross-store fan-out row marked IN-PROGRESS; no new OPEN defect in `docs/defects.md`). **Trio: 31/31 unit, typecheck clean, build clean.** **At the slice close (after U-F3), the following trios must be re-verified against the live MCP surface:** the pure merge's interleave/citations/trace behavior as CONSUMED by U-F2's `qualifyStoreResult` (`docs/specs/unit-f2-result-qualification.md`) and by U-F3's fan-out wiring in `handleRagTool` (`docs/specs/unit-f3-stores-all-schema.md`); the fail-state byte strings (`default store required`, `store results must be an array`, `topK must be an integer in [1, 50]`, `default store result must carry …`) as surfaced through the `rag.query`/`rag-stream` fan-out error channel. U-F2 and U-F3 are the NEXT cycles — DO NOT mark the whole slice complete.

- **Unit U-F2 — result qualification + `storeContexts` (the cross-store fan-out slice's SECOND unit; execution order U-F1 → U-F2 → U-F3) (2026-09-08).** Spec `docs/specs/unit-f2-result-qualification.md`. Landed: the PURE builder **`qualifyStoreResult(merged, stores, { qualified })`** + the **`StoreContextBlock`** type + the ADDITIVE `store`/`storeContexts` shape extensions — all gated to `stores:"all"` (A-F1), in `src/main/retrieval.ts` ONLY (`src/shared/types.ts`/`src/main/mcp-server.ts` UNTOUCHED — the IPC/MCP surface is U-F3's D5/A-F4); the additive `store?: string` on `RagResultItem`/`GraphTraceEntry`/`BlockedByEntry`/the `citations` element (type-shape uniformity; NEVER stamped by the FLAT builder — D4 FLAT-only) + `storeContexts?: StoreContextBlock[]` on `RagResult`; `qualified:false` returns `merged` BYTE-/OBJECT-EQUAL (the Phase-1 A4 single-store contract, `stores` not read); `qualified:true` spread-copies items with the producing store's REGISTRY name (reference-identity attribution), re-derives `citations` with the first-appearance store, and builds one `storeContexts` block per VALID store in registry-insertion order (default block first, index 0; a failed null-result store is SKIPPED — D6); the top-level `context`/`markdown`/`lineMap` stay the default store's block (D2); NO `blockedBy` (FLAT-only D4). **The A-F1 byte-equality reconciliations STAY GREEN** — the §5.10 single-store assertions in `tests/unit-ms2-store-wiring.test.ts:1400,1458` + `tests/unit-x-rag-provenance-traversal.test.ts:435,436,458` pass UNCHANGED (no re-pin). **TestWriter red: 29 failing** (the suite failed to load — `qualifyStoreResult`/the `store`/`storeContexts` additions absent; the §5.8/§5.9 red set authored per RCA-1) → **Implementer green: 29** (`tests/unit-f2-result-qualification.test.ts`). **Adversarial pass (RCA-3): F-F2-1/F-F2-2 — all HOST, fixed + regression-tested:** (MEDIUM) F-F2-1 a store with a VALID `result` but an ABSENT/undefined `results` array passed §5.6 and crashed with an unpinned `TypeError: results is not iterable` → FIXED with a guarded `Array.isArray(result.results)` + the byte-pinned `qualifyStoreResult: store results must be an array`; (LOW) F-F2-2 a `null`/`undefined` element in `merged.results` was silently spread (`{...null}` → `{}`) before `unattributable result item` → FIXED (skipped, consistent with U-F1's F-F1-3 null skip) — registered in spec §3a → **unit 31/31** (29 + the F-F2-1/F-F2-2 regression tests). **Blind-greens (RCA-4): `docs/specs/unit-f2-result-qualification-greens.md` — 22 PASS / 0 FAIL** (22 scenarios). **Live-scenario gate: PARKED** (a PURE module — no IPC/MCP/engine surface to exercise; the app-wiring verification is U-F3's). **Doc-review pass (RCA-6): `archive/reviews/2026-09-08-unit-f2-doc-review.md`** (the §5.11 census + the A-F1 §5.10 reconciliations verified against the landed code; the QUALIFY-RESULT / STORECONTEXTS-BLOCKS / STORE-FIELD-NAMING decision rows LANDED in `docs/decisions.md`; the trackers reconciled). **Unit 31/31, typecheck clean, build clean** — the shared U-F1 `mergeStoreResults` + the A-F1 byte-equality reconciliations (unit-ms2 + unit-x) stay green. **U-F3 (the fan-out wiring) is NOT landed — it is the next cycle.**

- **Unit U-F3 — the `stores:"all"` schema + the MCP/IPC fan-out wiring (the cross-store fan-out slice's THIRD + FINAL unit; execution order U-F1 → U-F2 → U-F3) (2026-09-08).** Spec `docs/specs/unit-f3-stores-all-schema.md` (D4/D5/D6/D7/A-F1/A-F2/A-F3/A-F4). Landed: `RagQueryPayload.stores?: 'all'` (`src/shared/types.ts`) + `QueryAuditEntry.stores?: string[]` (A-F2, `src/main/query-audit.ts`); the `rag.query`/`rag-stream` inputSchemas gain `stores: z.enum(['all']).optional()`; the FOUR §5.2 guards (mutual-exclusion fires FIRST before `resolveStoreArg`'s M2 — arbitration; stores-value `must be "all"`; the `dir == null` REGISTRY-REQUIRED fail-loud; the D4 flat-only guard — each in the `rag.query` throw form + the `rag-stream` `[{type:'error',error}]` chunk form); the §5.3 fan-out in `handleRagTool`'s `rag.query` case — iterate `dir.entries` in canonical insertion order, query each `entry.engine` with the SAME per-store topK/mode:'flat'/opts, SKIP a throwing non-default store (`{name, result:null}`), REORDER default-first, `mergeStoreResults` (U-F1) + `qualifyStoreResult(...,{qualified:true})` (U-F2), stamp the default entry's `ref.name`; the merged §5.4 audit (ONE entry, `resultCount = merged.results.length`, `stores` = canonical-order names, mode 'flat'); the §5.5 `rag-stream` fan-out (`[{type:'result',result:qualified},{type:'done'}]` with NO top-level `store`); the §5.6 `handleRagQueryIpc` `stores` forward (MCP/UI equivalence). **TestWriter red: 26 failing + 3 green-on-arrival guards** (the §5.4 pinned-non-throw, the §5.8-8/§5.8-9 single-store byte-equality rows are green-on-arrival; with the fan-out wiring absent the `stores:"all"` rows ran the single-store path; §5.8/§5.9 red set) → **Implementer green: 29** (`tests/unit-f3-stores-all-schema.test.ts`). **Sanctioned test update (arbitration):** `tests/unit-ms2-store-wiring.test.ts` test 19's expected `rag.query` inputSchema key list gained `stores`. **Trio:** F3 29/29 + unit-ms2 63/63 (incl. test 19) + unit-f1 31/31 + unit-f2 31/31, `npx tsc --noEmit` clean, `npm run build` clean. **Blind-greens + the live-`rag.query`/`rag-stream`/`rag-query`-IPC surface verification are the FOLLOW-ON (RCA-4/RCA-6) passes.** **Unit U-F1/U-F2's `mergeStoreResults` + `qualifyStoreResult` consumption is now LIVE through the `rag.query`/`rag-stream` fan-out (the slice's re-verification trio per U-F1's DONE row): the interleave/citations/trace behavior + the fail-state byte strings (`default store result required`, `store results must be an array`, `topK must be an integer in [1, 50]`) surface through the fan-out error channel — green per the F3 suite.** The whole cross-store fan-out slice (U-F1/U-F2/U-F3) is now LANDED.

- **Cross-store fan-out slice — the U-F3 completion record + SLICE-COMPLETE (2026-09-08; completes the U-F3 DONE row above — U-F1 → U-F2 → U-F3 all landed).** **Adversarial pass (RCA-3): F-F3-1/F-F3-2 — both INFO, NO host defects, NO package/upstream findings.** F-F3-1 (LOW, INFO): a caller-invoked `stores:"all"` necessarily discloses the full registry store-name set (returned `storeContexts`/per-item `store`/audit `stores`) — the DESIGNED behavior of a caller-invoked fan-out, NO fix. F-F3-2 (LOW, latent): a non-default store returning a malformed `RagResult` (rather than throwing → `{ name, result: null }`) fails U-F2's validation and fails the whole fan-out instead of D6-skipping — unreachable with real `buildRagStoreDirectory` engines (they always build a well-formed block), consistent with U-F2's fail-loud defensive state, NO fix; recorded in `docs/specs/unit-f3-stores-all-schema.md` §3a. **Blind-greens (RCA-4):** `docs/specs/unit-f3-stores-all-schema-greens.md` — **20 PASS / 0 FAIL** (8/8 guards, 4/4 fan-out incl. the default-not-first determinism, 1/1 audit, 2/2 stream, 3/3 IPC, 2/2 single-store byte-equality). **Live-scenario for the SLICE: PARKED** — the MCP `stores:"all"` mode cannot be driven live (the app is not running); no slice pending-battery was written (U-F1/U-F2 are pure modules; U-F3's fan-out is reachable only through a live MCP server against a real multi-store registry); the PARKED note + revisit condition is recorded in `docs/pending.md`'s fan-out row (now COMPLETE). **Doc-review pass (RCA-6):** `archive/reviews/2026-09-08-unit-f3-doc-review.md` (this slice-close reconciliation). **SLICE-COMPLETE (2026-09-08):** the cross-store fan-out (`stores:"all"`) — **Unit X's `rag.query` fan-out mode** (U-F1 `mergeStoreResults` → U-F2 `qualifyStoreResult` → U-F3 the `stores:"all"` schema + the MCP/IPC wiring in `handleRagTool`/`handleRagQueryIpc`) — is LANDED. The final suite counts: unit-f1 **31/31**, unit-f2 **31/31**, unit-f3 **29/29**; greens 23/0, 22/0, 20/0; `npx tsc --noEmit` clean + `npm run build` clean. The U-F1/U-F2/U-F3 trio is to be re-verified by the supervisor at the slice close (`npm test` + `npm run typecheck` + `npm run build`).

- **Unit X — RAG-surface provenance + multi-hop traversal (2026-09-08).** Spec
  `docs/specs/unit-x-rag-provenance-traversal.md` (the Auspicion Suite contract
  handoff — A1 result-level provenance + A2 multi-hop traversal). Landed: the
  extended `ragQuery`/`walkReferenceGraph`/`expandParentContext`/
  `documentIdsForNode`/`buildCitations`/`buildFlatTrace` + the `RagResult`/
  `RagQueryFilters`/`RagResultItem`/`FlatTrace`/`GraphTraceEntry`/`RagTrace`/
  `BlockedByEntry`/`RagQueryOptions`/`WalkOptions`/`WalkResult` types in
  `src/main/retrieval.ts`; the NEW pure `src/main/query-audit.ts`
  (`createQueryAuditLog` + `QueryAuditEntry`/`QueryAuditLog`); the extended
  `rag.query` handler + the NEW `get_query_audit_log`/`rag-stream` tools in
  `src/main/mcp-server.ts` (the `handleRagTool` optional `auditLog?` param,
  threaded through `handleRagQueryIpc`); the additive `nodeKind`/`edgeType`/
  `state` store fields in `src/main/rag-store.ts` (the `RagNodeKind`/
  `RagEdgeType`/`RagReferenceState` types + the `RAG_NODE_KINDS`/
  `RAG_EDGE_TYPES`/`RAG_REFERENCE_STATES` runtime sets + the byte-pinned
  `rag putNode: nodeKind required/invalid` / `rag putEdge: edgeType/state
  required/invalid` fail-states + the hash-coverage). **TestWriter red: 48
  failing** (the suite failed to load — the NEW module/functions/types absent;
  the §5.9/§5.10 red set authored per RCA-1) → **Implementer green: 54/54
  after the adversarial fix batch** (`tests/unit-x-rag-provenance-traversal.test.ts`
  54 tests). **Adversarial pass (RCA-3): F-X-1..F-X-6** (1 HIGH: F-X-1 the
  `HopLimitExceeded` off-by-one — a chain of exactly `maxHops` hops resolved a
  target then threw; 2 MEDIUM: F-X-2 `blockedBy` populated for a `BROKEN`/`STALE`
  edge even when a target was resolved, F-X-3 `rag-stream` validation threw
  OUTSIDE the `try`; 2 LOW: F-X-4 a malformed crosslink to a `content` node was
  traversed, F-X-5 a `null` result element threw an unpinned `TypeError`; 1 INFO:
  F-X-6 `buildFlatTrace` accepts `source` outside the union — matches the spec's
  pinned fail-state, NO fix) — **all HOST, fixed + regression-tested** (the
  F-X-1a/b, F-X-2, F-X-3, F-X-4, F-X-5 regression tests in the unit file;
  registered in spec §3a). **Blind-greens (RCA-4):**
  `docs/specs/unit-x-rag-provenance-traversal-greens.md` — **27 PASS / 0 FAIL**
  (27 scenarios). **Live-scenario gate: PARKED** —
  `docs/specs/unit-x-rag-provenance-traversal-live-pending-battery.md` (the app
  was down at the time; the battery is written and pending a live-scenario
  session). **Doc-review pass (RCA-6):**
  `archive/reviews/2026-09-08-unit-x-doc-review.md` (the spec↔code
  reconciliation incl. the §5.11 census + the greens count; the five §4 decision
  rows LANDED in `docs/decisions.md`; the trackers reconciled). **Trio: 2465
  pass / 41 skip, typecheck clean, build clean** (the 4 ollama live-test
  failures are a PRE-EXISTING environment issue — ollama has no models loaded,
  not a Unit X regression). Decisions RESULT-LEVEL-PROVENANCE /
  QUERY-AUDIT-LOG / GRAPH-MODE-WALK / PARENT-CONTEXT-EXPAND /
  REFERENCE-GRAPH-ADDITIVE-FIELDS (LANDED) in `docs/decisions.md`.

- **Unit U-MS5 — the read-only settings-pane store listing + the
  `RagQueryPayload.store` passthrough (the multi-store Phase-1 slice's FINAL
  unit) (2026-09-05).** Spec `docs/specs/unit-ms5-settings-listing.md`. Landed:
  the `IPC_RAG_STORE_LISTING = 'provident:rag-store-listing'` channel + the
  `RagStoreLoadStatus`/`RagStoreListingEntry`/`RagStoreListingPayload` types +
  the additive `RagQueryPayload.store?: string` (the F4 end-to-end
  completion) in `src/shared/types.ts`; the `handleRagStoreListingIpc` pure
  handler in `src/main/mcp-server.ts` (the three pinned throw paths + the
  coercion rules + the empty→`{ stores: [] }`) + the `handleRagQueryIpc` store
  forward; the `ipcMain.handle` registration + the F-MS5-2 defensive guard in
  `src/main/main.ts`; the `bridge.rag.stores()` + the 3-arg `query` widening in
  `src/main/preload.ts`; the `operator-rag-stores` settings-pane section + the
  `lastStoreListing` cache + the no-refetch in `src/renderer/sidebar-panes.ts`
  (provident-authored, operator-isolated, never MCP-visible). **TestWriter red:
  27 runtime-failing + 7 typecheck-leg + 12 green-on-arrival guards** (42
  authored) → **Implementer green: 39 pass / 3 skip** (3 sanctioned re-pins =
  TestWriter fixture bugs: the statusOf out-of-union resolver, the
  `SidebarBridge.stores` fixture, the null-storeListing coercion) → full suite
  2413/41. **Adversarial pass (RCA-3): F-MS5-1..5** (2 MEDIUM: F-MS5-1 the
  PROCESS gate — the five decision rows + §3a + the doc-review must land before
  the DONE row, F-MS5-4 the trusted-renderer cross-store read documented; 2 LOW:
  F-MS5-2 the unguarded `entries.get(name)!` → FIXED-WITH-REGRESSION (the
  byte-pinned `rag-store-listing: no directory entry for store "<name>"`
  guard), F-MS5-3 the awaited-inline boot fetch documented; 1 INFO: F-MS5-5
  verified-clean — registered in spec §3a) → fix batch → unit 41/3, full suite
  **2415/41**. **Blind-greens (RCA-4):**
  `docs/specs/unit-ms5-settings-listing-greens.md` — **25 PASS / 0 FAIL /
  9 DOCUMENTED-OR-RELEGATED** (the preload/ipcMain/render seams Electron/DOM-
  bound; the F4 end-to-end + the F-MS5-2 defensive throw byte-exact). **Live-
  scenario gate: PARKED** —
  `docs/specs/unit-ms5-settings-listing-live-pending-battery.md` (surface-
  observability park — the operator-isolated pane is by design never MCP-
  visible, verified live: `get_rendered_html` shows zero `operator-*` nodes;
  revisit = a UI-interactive settings-pane session + a multi-store registry for
  the N-entry case). **Doc-review pass (RCA-6):**
  `archive/reviews/2026-09-05-unit-ms5-doc-review.md` (the §5.4 repoint to the
  landed F-MS5-2 guard; the five decision rows STORE-LISTING-IPC /
  STORE-LISTING-PROVIDENT-AUTHORED / STORE-LISTING-BOOT-CACHED /
  STORE-LISTING-STATUS-SHARED / RAG-QUERY-STORE-DISPLAY-ASYMMETRY LANDED in
  `docs/decisions.md` + the UI-SELECTOR-DEFERRED LANDED-HALF annotation; the
  U-MS2 §5.9/§5.4 F4-staging rows marked COMPLETED; the trackers reconciled).
  **Trio: 2415 pass / 41 skip, typecheck clean, build clean** (baseline 2374 +
  39 U-MS5 + 2 R-tests). Decisions STORE-LISTING-* ×5 +
  RAG-QUERY-STORE-DISPLAY-ASYMMETRY (LANDED) in `docs/decisions.md`.

- **Unit U-MS3 — the store-qualified broadcast + the snapshot store field +
  the host re-derive guard (the multi-store Phase-1 slice's fourth unit)
  (2026-09-05).** Spec `docs/specs/unit-ms3-store-qualified-broadcast.md`.
  Landed: the collapse — ONE shared `RagStoreChangedPayload` in
  `src/shared/types.ts` with REQUIRED `store: string` (the three structural
  copies in preload/mcp-server/sidebar-panes DELETED with compat re-exports,
  `edit-ops.ts`/`main.ts` imports repointed) + `RagSnapshotPayload.store`; the
  four emission sites stamping `store: <resolved name>` (the seven
  `handleEditTool` construction points via `ref?.name ?? ''`, the typed
  `main.ts` UI literals + the snapshot handler via `plan.defaultName`, the
  `delete_node` `removed:true` gate); the host `lastStore` capture (boot +
  re-derive) + the foreign-store drop guard + the R3 capture-before-subscribe
  ordering + the fail-closed drops, in `src/renderer/sidebar-panes.ts`; the two
  derive helpers narrowed to `Omit<…,'store'>`. **TestWriter red: 16 behavioral
  + 3 typecheck-level + 4 guards** (20 authored; the emission sites don't stamp
  `store`, the host lacks the guard, the collapsed type doesn't exist) →
  **Implementer green: 19/20** (two SPEC-CONFLICT escapes arbitrated: test 04's
  `split_node` expectation — `splitNode` KEEPS the source id, corrected to
  `expect(p.nodeIds[0]).toBe('para')`; the §6-mandated
  `contenteditable-editor-host.test.ts` fixture gap — the 3 injected payloads
  :568/:835/:1046 AND the harness boot snapshots lacked `store`, so the guard +
  `lastStore` capture dropped every broadcast → state 18/28/37 failed; the
  supervisor applied the `store:'main'` fixture updates). Full suite 2374 pass /
  38 skip. **Adversarial pass (RCA-3): F-MS3-1..6** (1 MEDIUM: F-MS3-1 the
  fail-closed silent drop of an addressed-store broadcast with a
  missing/`undefined` store → FIXED-WITH-REGRESSION: distinct `console.warn`
  on the malformed-store + `lastStore === null` drop branches, foreign drops
  stay silent, no drop-outcome change; 2 LOW: F-MS3-2 the legacy `store:''`
  sentinel documented, F-MS3-3 the §5.3 `delete_node` `removed:true` qualifier
  spec-amended; 3 INFO: F-MS3-4 type-level-only REQUIRED field, F-MS3-5/6
  verified-clean — registered in spec §3a) → fix batch R1–R3 red→green →
  **unit 23/23**. **Blind-greens (RCA-4):**
  `docs/specs/unit-ms3-store-qualified-broadcast-greens.md` — **23 PASS /
  0 FAIL / 4 RELEGATED** (the host/UI-path states routed to the live battery per
  §5.3a; the collapse + REQUIRED `store` verified at the typecheck level; the
  broadcast-count invariants + the `delete_node`-no-op-zero + the `''` sentinel
  observed live). **Live-scenario gate: PARKED** —
  `docs/specs/unit-ms3-store-qualified-broadcast-live-pending-battery.md`
  (structural surface-absence: the broadcast/snapshot are renderer/IPC-side,
  not MCP tools; the app is live on :3787 but exercising the guard needs a
  UI-interactive or operator-edit session; 5 live-observable-later + 22
  never-live = 27). **Doc-review pass (RCA-6):**
  `archive/reviews/2026-09-05-unit-ms3-doc-review.md` (the spec↔code
  reconciliation incl. the ONE-shared-declaration + the four emission sites +
  the guard byte-verification; the construction-point anchors repointed to the
  landed `emit` sites ; the STORE-QUALIFIED-BROADCAST decision row annotated
  LANDED; the trackers reconciled). **Trio: 2374 pass / 38 skip, typecheck
  clean, build clean** (baseline 2351 + 20 U-MS3 + 3 R-tests). Decision
  STORE-QUALIFIED-BROADCAST (LANDED annotation) in `docs/decisions.md`.

- **Unit U-MS4 — the store-id prefixing at the import minting seam (the
  multi-store Phase-1 slice's third unit) (2026-09-05).** Spec
  `docs/specs/unit-ms4-id-prefixing.md`. Landed: the optional third
  `store?: ImportStoreContext { name, isDefault, reservedNames? }` parameter on
  `importMarkdownCorpus` + the SC1–SC5 fail-fast battery + the A1 collision
  rejection (byte-pinned `markdown import: documentId collides with a
  registered store name: <id>`, resolved (a) — the default store's seam rejects
  a documentId equal to any registered non-default store name) + the `<name>:`
  prefix minting for non-default stores + the per-store path resolution
  `resolve(corpusRoot, file)` + the corpusRoot guard + the NUL probe + the
  snapshot consts, all in `src/main/markdown-import.ts` (`markdown-parse.ts`
  UNCHANGED — the prefix rides the documentId INPUT); + the F2 wiring in
  `src/main/mcp-server.ts` (§5.6 pass-through, flipping U-MS2's test 56 green)
  + the two sanctioned U-MS2 re-pins (tests 53/55). **TestWriter red: 21 failing
  / 19 green-on-arrival guards** (40 authored; the 3-arg calls ignored at
  runtime — prefix/A1/SC absent; TS2554 ×39 + TS2305 ×1) → **Implementer green:
  39/40** (one SPEC-CONFLICT escape: test 13's misplaced atomicity assertion,
  arbitrated by the supervisor — moved above the successful boundary import) →
  F2 wiring + the two U-MS2 re-pins + the A1-S7 erratum → **40/40**. Full suite
  2342 pass / 38 skip. **Adversarial pass (RCA-3): F-MS4-1..11** (0 HIGH / 0
  MEDIUM / 4 LOW — F-MS4-1 the INV-6 non-coincidence erratum, F-MS4-2 the
  Proxy/trusted-caller snapshot, F-MS4-3 the corpusRoot throw gap, F-MS4-4 the
  NUL-byte probe — / 7 INFO) — host findings FIXED + regression-tested
  red-first (R2/R3/R5 red → adversarial 9/9 in
  `tests/unit-ms4-id-prefixing-adversarial.test.ts`; registered in spec §3a with
  the F-MS4-5/10 transcription completed at the doc review); HOST-MS4-10 (the
  MCP handler silently drops non-string `files` elements) recorded OPEN in
  `docs/defects.md`. **Blind-greens (RCA-4):**
  `docs/specs/unit-ms4-id-prefixing-greens.md` — 43 rows: **41 PASS / 0 FAIL /
  2 DEFERRED** (the F13 batch-failure row not doc-derivable; the pending
  transcriptions); the F2 staging LIVE (the wired non-default import is
  prefixed, U-MS2's S39 staged red now green). **Live-scenario gate: PARKED**
  — `docs/specs/unit-ms4-id-prefixing-live-pending-battery.md` (the app was
  down at the time; the U-MS4 build + dist were on disk; the revisit condition
  is now MET — the operator restarted the app with the multi-store build, so
  the U-MS1/U-MS2/U-MS4 batteries all run in a later live-scenario iteration).
  **Doc-review pass (RCA-6):**
  `archive/reviews/2026-09-05-unit-ms4-doc-review.md` (the spec↔code byte
  census re-verified; the line-citation repoints recomputed against the actual
  landed file — the implementer's proposed stale mapping was corrected; §5.10
  census "2 → 3 error strings" + "1 → 2 test files"; §3a completed; the F-MS4-7
  `corpusRoot: '/'` limitation landed as a `docs/pending.md` DEFERRED row;
  HOST-MS4-10 recorded; the STORE-ID-PREFIX + IMPORT-ROOT-PER-STORE decision
  rows annotated LANDED). **Trio: 2351 pass / 38 skip (111 files), typecheck
  clean, build clean** (baseline 2342 + 9 U-MS4 adversarial tests). Decisions
  STORE-ID-PREFIX / IMPORT-ROOT-PER-STORE (LANDED annotations) in
  `docs/decisions.md`.

- **Unit U-MS2 — the store-instance wiring + the `store` selector on the 12
  MCP tools (the multi-store Phase-1 slice's second unit) (2026-09-05).** Spec
  `docs/specs/unit-ms2-store-wiring.md`. Landed: the NEW pure module
  `src/main/rag-store-directory.ts` (`resolveStoreArg` / `buildRagStoreDirectory`
  / `storeLoadStatus` + 6 interfaces; the byte-pinned M1/M2/M3 + the one-default
  guard + the F-MS2-7 kind guard; the F8 explicit cache path; the A6/R10
  lexical-only non-defaults; the D8 read-once; Map-keyed entries per U-MS1's
  F-MS1-15(c) pin), the `main.ts` registry load at the ~116-120 position
  (fail-soft implicit / fail-loud abort before the window) + the default-entry
  bindings + `ragStores: plan.directory` in the server options, the
  `mcp-server.ts` 12 inputSchemas each gaining `store: z.string().optional()`
  + the A5 description amendment (the configured-corpusRoot qualification) +
  the resolution-first ordering + the 2-arg `onStoreChanged(payload, storeName)`
  widening + the F4 `handleRagQueryIpc` dir injection, and the
  `RagQueryResult.store` required field (the F3 stamp at the ONE shared handler
  seam — `RetrievalResult` gains NO field, the F-MS2-4 erratum). **TestWriter
  red: 57 authored, suite-load failure** (module does not exist) →
  **Implementer green: 56/57 + 1 staged red** (test 56 = U-MS4's F2 prefix pin)
  + 2 supervisor repairs to TestWriter defects (test 08's malformed-dir variant,
  test 16's mkdir). **Adversarial pass (RCA-3): F-MS2-1..11** (1 HIGH: F-MS2-1
  the registry-file self-collision — a store named `stores` derives its path
  ONTO `provident-rag-stores.json`, the first write destroys the registry and
  the next boot fail-loud locks the app out; 3 MEDIUM: F-MS2-2 FIFO/device
  store-file hang, F-MS2-3 symlink/hardlink aliasing, F-MS2-4 the F3 type-level
  drift; 3 LOW; 4 INFO) — host findings FIXED + regression-tested red-first
  (58/59/60/61 + test 20 red; test 63 HUNG pre-fix — the F-MS2-2 defect
  evidence) → **green 62 pass / 1 staged red** (`tests/unit-ms2-store-wiring.test.ts`
  63 tests; F14 added to U-MS1's module + the isFile probe in `rag-store.ts`;
  registered in spec §3a with the F-MS2-10/11 transcription completed at the
  doc review). **Blind-greens (RCA-4):**
  `docs/specs/unit-ms2-store-wiring-greens.md` — 46 rows: **43 PASS / 0 FAIL /
  3 DEFERRED** (S39 U-MS4's staged red, S40 U-MS5's end-to-end row, S42 the
  SDK-seam byte rows deferred to the live battery); the mkfifo sub-case
  returned in ~0ms (the F-MS2-2 hang hardened). **Live-scenario gate: PARKED**
  — `docs/specs/unit-ms2-store-wiring-live-pending-battery.md` (surface-absence:
  the app is up but serving the pre-U-MS2 build — no `store` arg live, the old
  A5 description, the negative control silently ignores the arg; 30 live +
  16 not-live = 46; revisit = the operator restarts with the rebuilt dist, which
  also unlocks the U-MS1 battery). **Proofreader pass:** the `handleRagQueryIpc`
  param-order drift fixed (greens recorded `(store, engine, …)`, the module is
  `(engine, store, …)`), the F3-erratum residuals, the A5 consistency, the
  census updates, the three decision rows annotated LANDED. **Doc-review pass
  (RCA-6):** `archive/reviews/2026-09-05-unit-ms2-doc-review.md` (spec↔code
  re-verified incl. the byte census; §3a completed; the F-MS2-3 symlink-aliasing
  limitation landed as a `docs/pending.md` DEFERRED row; the IMPORT-ROOT-PER-STORE
  A5 tail + the U-MS1 greens/battery F1–F14 re-census fixed; the U-MS3/U-MS5
  phantom-`RetrievalResult`-field cites corrected). **Trio: 2301 pass / 38 skip
  (109 files), typecheck clean, build clean** (baseline 2239 + 62 U-MS2 tests).
  Decisions MULTI-STORE-REGISTRY / SINGLE-WRITER-STORE-PER-STORE /
  ENGINE-PER-STORE (LANDED annotations) in `docs/decisions.md`.

- **Unit U-MS1 — the pure store-registry module (the multi-store Phase-1
  slice's first unit) (2026-09-05).** Spec `docs/specs/unit-ms1-store-registry.md`
  (the spec gate: five specs written per-unit, reviewer loop THREE iterations
  to empty — 13 findings → 8 → 3, all fixed; full record in the CURRENT WORK
  section). Landed: the NEW pure module `src/main/rag-store-registry.ts` — the
  registry load/sanitize/validate surface (`implicitRegistry` /
  `resolveRegistry` / `loadRagStoreRegistry` + the frozen
  `RAG_STORE_NAME_PATTERN` + 6 exported types; internals `jsonOf` +
  `derivePersistenceFile` + `CASE_INSENSITIVE_FS_PLATFORMS`), the D2
  validation rules (charset `/^[a-z0-9][a-z0-9_-]{0,63}$/`, unique names,
  exactly one `default`, derived∪explicit persistence-file collisions,
  absolute paths, the Phase-1 embedder rejection with the verbatim D2
  message), the MIGRATION-LEGACY-PATH implicit `{name:'main', default:true}`
  entry (legacy `provident-rag.json`, synthesized at boot, never written
  back), the fail-soft/fail-loud boot split (corrupt file ⇒ implicit entry +
  the pinned LOG-1 line; invalid registry ⇒ 13 byte-pinned fail-loud
  messages F1–F13 + 2 caller guards), and the adversarial hardenings (BOM
  strip, the `statSync().isFile()` non-regular-file probe, the
  platform-conditional casefolded collision key, the total `jsonOf` with the
  200-char render cap, the frozen regex export, NUL-byte path rejection).
  **TestWriter red: 46 failing** (suite-load failure — module
  `src/main/rag-store-registry.ts` does not exist; all H1–H14/FS1–FS30/F1–F13/B1–B5
  ids authored) → **Implementer green: 46/46** (one SPEC-CONFLICT escape
  during green: the spec's FS20–FS24 example rows omitted the `default` flag,
  contradicting the pinned C-before-D order — Architect ruling option A: the
  five example rows amended, tests 29–32 re-transcribed, code unchanged).
  **Adversarial pass (RCA-3): F-MS1-1..15** (2 MEDIUM: F-MS1-1 BOM⇒fail-soft
  wrong-store, F-MS1-2 lexical collision normalization misses case-FS/symlink
  identity; 6 LOW; 7 INFO) — host findings FIXED + regression-tested
  red-first 10 failing → **green 63/63** (`tests/unit-ms1-store-registry.test.ts`
  63 tests; registered in spec §3a with the F-MS1-9/11..15 transcription
  completed at the doc review). **Blind-greens (RCA-4):**
  `docs/specs/unit-ms1-store-registry-greens.md` — 35 scenarios: as recorded
  34 PASS / 1 FAIL (F-BLIND-MS1-1 — the BigInt got-clause expectation), the
  FAIL RECONCILED as conformant (`String(1n)` === `'1'`, ECMAScript
  BigInt::ToString; the drift was the greens expectation, not the module) →
  **35 PASS / 0 FAIL / 0 DEFERRED**. **Live-scenario gate: PARKED** —
  `docs/specs/unit-ms1-store-registry-live-pending-battery.md` (the V1
  pattern: the module is boot-time dead code until U-MS2 wires it; 30 live
  classes + 5 permanently-internal, 0 run live; revisit = U-MS2's wiring
  lands). **Proofreader pass:** census/section-count staleness fixed
  (FS1–FS32, LANDED: 63 tests), the FS3/FS4 mechanism notes, the §5.4 BigInt
  clarification, the MULTI-STORE-REGISTRY decision row annotated LANDED.
  **Doc-review pass (RCA-6):**
  `archive/reviews/2026-09-05-unit-ms1-doc-review.md` (spec↔code re-verified
  incl. the full 15-message byte census; §3a completed; §5.9's four decision
  rows reconciled INTO the single MULTI-STORE-REGISTRY row; trackers
  reconciled; the battery census corrected 30+5=35; the two test-file comment
  drifts fixed by the supervisor). **Trio: 2239 pass / 38 skip (108 files),
  typecheck clean, build clean** (baseline 2176 + 63 U-MS1 tests). Decisions
  MULTI-STORE-REGISTRY (LANDED annotation) in `docs/decisions.md`.

- **Unit W5 — the live cache write-through (the promoted embedder's live
  embeds route through the SAME persisted cache) (2026-09-05).** The
  vector-boot slice's USER-DIRECTED follow-up to the completed W4 cache unit
  (the directive "live upload should also update the cache"; spec
  `docs/specs/unit-f-embeddings.md` §5.13's W5 amendment + the §5.5
  `cache?` amendment + §5.12's promote step passing the SAME cache
  instance). Landed: the exported `contentHashOf` + `createSingleTextMemoizer`
  in `src/main/vector-cache.ts` (the §5.13 key tuple + the provider's
  `embed` fn as the MISS route; `persistMisses: false` DEFAULT + the
  per-call `{ persist: true }` split; the PER-EMBED dimension read; the
  pinned `cache memoizer: text must be a string` input guard); the
  `VectorEmbedderOptions.cache?` seam in `src/main/embeddings.ts`
  (`queryEmbedFn` — the score/place query path, `memoizer.embed(text)`,
  in-memory only; `maintenanceEmbedFn` — the `onStoreChanged` add/update
  path, `memoizer.embed(text, { persist: true })`, the node-content
  write-through; no cache → byte-identical `provider.embed`, the L5 guard);
  the promote step in `src/main/vector-boot.ts` passes the SAME
  `VectorCache` instance into `createVectorEmbedder` (`vector-boot.ts:302`,
  byte-checked by this review). **TestWriter red: 9 failing** (the missing
  `cache?` option + the non-caching live embeds: extra HTTP calls, no
  in-memory entry, no persisted entry, re-embedded query texts) **+ 1
  green-on-arrival guard** (L5 — the no-cache byte-identity clause) →
  **Implementer green: 10/10** (`tests/live-embed-cache.test.ts` L1–L7).
  **Adversarial pass (RCA-3, TWO passes; registered in spec §3a's W5
  subsection):** F-W5-1 MEDIUM (query-embed misses persisted → unbounded
  inter-prune growth + whole-map main-thread writes + query-hash disk
  retention; fixed per the Architect ruling: in-memory-only adoption for
  query misses — `persistMisses: false` + the per-call persist split;
  regression R1/R2/R3), F-W5-2 LOW (creation-time dimension snapshot → a
  cold provider permanently hit-ineligible; fixed: the per-embed dimension
  read; regression R4), F-W5-3 LOW (the exported memoizer accepted a
  non-string → raw crypto TypeError; fixed: the pinned guard; regression
  R5), F-W5-4/F-W5-5/F-W5-6 INFO (the poison-HIT failure-class asymmetry —
  the hook REJECTS outside the embed try/catch, caught + logged non-fatal at
  the four call sites, NOT a W3 transient skip; in-flight dedup NOT approved
  — note-only; the §5.5 code-block drift — fixed by this doc review) —
  red-first 6 (incl. the L4 re-pin per the superseded-persistence ruling;
  its HTTP-call pins kept verbatim) → **green 15/15** (`tests/live-embed-
  cache.test.ts` 15 tests: L1–L7 + R1–R5). **Blind-greens (RCA-4):**
  `docs/specs/unit-f-w5-live-cache-greens.md` — 13 scenarios: 12 PASS / 1
  DEFERRED-STATIC (WIRE-LIVE call-site), two consecutive green runs, zero
  un-hardened regressions, LIVE-1 running against the real localhost ollama
  `embeddinggemma` (768-dim) in BOTH recorded runs; the §H doc gap (the W5
  F3/F6 registrations) + the §5.5 DOC DRIFT finding CLOSED by this doc
  review, and the WIRE-LIVE DEFERRED-STATIC row CLOSED by this doc review
  (verified at the four reconcile call sites: `main.ts:246-248` /
  `:283-285` / `:307` → `edit-ops.ts:740-741` / `mcp-server.ts:1131-1133` —
  all four `.catch` + non-fatal `console.error`). **Doc-review pass
  (RCA-6):** `archive/reviews/2026-09-05-unit-f-w5-doc-review.md` (the §3a
  W5 subsection written, the §5.5 `cache?` field + the W5 amendment note +
  the stale provider-widening cite re-pointed, the §5.10 census re-pinned
  2 → 4, the §5.12 table W5 row, the §5.13 W5 implementation pins, the
  decisions.md W5-LANDED annotation, this DONE row + the OPEN narrative).
  **Trio: 2176 pass / 38 skip (107 files), typecheck clean, build clean**
  (the W4-era 2161/38 + the 15 W5 tests; 106 + 1 = 107 files). The
  vector-boot proposal + its user-directed follow-up are COMPLETE.
- **Unit W4 — the persisted embedding cache (§5.13, the cache-inclusive
  variant) (2026-09-05).** The vector-boot slice's fourth + LAST unit (spec
  `docs/specs/unit-f-embeddings.md` §5.13 + §5.8 #40–42 + §5.9 #49–51 +
  §5.12 `VectorBootOptions.cache?` + the `cacheHits` census; the §5.12
  decomposition W1 → W2 → W3 → W4). Landed: the NEW pure module
  `src/main/vector-cache.ts` (`CacheKey` / `VectorCache{get,set,prune,flush}` /
  `createVectorCache(opts?: {path?})` — the file read SYNCHRONOUSLY at
  creation; ANY load failure incl. the ABSENT first-run file → EMPTY cache +
  the pinned `vector cache: load failed (treating as empty): <error>` log,
  never a throw (§5.9 #49 — the spec groups absent under "+ logged"; the W4
  red test 2a pins it literally, so the task brief's "silent absent-file"
  idea was NOT implemented — pinned in §5.13's W4 implementation-pin note
  (b), an Architect-ratification point); malformed entries DROPPED at load
  (§5.9 #51); `set` write-through on a single-writer promise-chain queue with
  atomic `<path>.tmp`+rename writes, non-fatal failures
  (`vector cache: write failed (non-fatal): <error>`, the next successful
  write serializes the WHOLE map and recovers the file — §5.9 #50); `prune`
  drops foreign-tuple entries + hashes outside the keepKeys set (contentHash
  STRINGS), rewrites the file ONCE, logs `vector cache: pruned to N entries`
  (emitted by `VectorCache.prune`, pinned in §5.13 note (c))); the W4 wiring
  in `src/main/vector-boot.ts` (`VectorBootOptions.cache?`; the MEMOIZING
  wrapper around the embed fns handed `createVectorIndex` — a HIT adopts with
  NO HTTP call, a MISS embeds + writes through; the batch wrapper adopts hits
  IN PLACE and batch-embeds only the misses, the W2 per-chunk fallback
  re-routing through the SAME wrapper; the `cacheHits` census deduped by
  contentHash so a fallback re-lookup counts once; drain → prune → drain
  before the promotion report; the `embedded` census = provider embeds =
  cache misses when a cache is present, `index.nodeIds.length` unchanged
  otherwise) and `src/main/main.ts` (`cache: createVectorCache()` at
  controller creation — no opts, the default
  `join(app.getPath('userData'), 'provident-vector-cache.json')` resolves
  through the running Electron app, lazy required, no module-level Electron
  import in the pure seam). **TestWriter red: 27 failing** (the module
  `src/main/vector-cache.js` does not exist — suite-load failure; the boot-
  path controller-option reds surfaced after the module landed) →
  **Implementer green: 27/27** (`tests/vector-cache.test.ts`). Keep-green:
  vector-boot 34 + vector-boot-adversarial 5 + embeddings 57 + embeddings-
  batch 25 + embeddings-failure-policy 21 + embeddings-adversarial 23 — all
  passing (the brief's 58/35 counts include 2 conditionally-gated live-ollama
  tests; zero regressions). **Trio: 2161 pass / 38 skip (106 files),
  typecheck clean, build clean** (2126/38 + the 27 W4 tests + the 8 W4
  adversarial tests). Design note:
  the build's snapshot settles the store's ALREADY-ENQUEUED mutations first
  (`await store.enqueue(() => undefined)` — the store's own single-writer
  queue; the W4 boot wiring fires `putNode` without awaiting). **Adversarial
  pass (RCA-3, registered in spec §3a's W4 subsection):** F-W4-1 HIGH (the
  whole-map sync write per `set()` → O(n²) amplification + main-thread
  freezes; fixed: the COALESCING write queue + the exported
  `CACHE_WRITE_DEBOUNCE_MS = 500`; regression tests R1/R2), F-W4-2 LOW (the
  load log quoted corrupt-file content; fixed: the sanitized tail; R3),
  F-W4-3 LOW (symlink/FIFO/device at either path — written through /
  main-thread wedge; fixed: the lstat regular-file guards + the 0o600 tmp;
  R4/R7/R8 + the R5/R6 directory cases), F-W4-4..F-W4-8 INFO (the census
  dedupe — §5.12 re-pinned; the one-writer assumption; the no-quit-flush
  re-embed economics; the poison-entry limitation — a §5.13 sentence; the
  unreachable pre-traffic prune) — red-first 5→8 (the R-series red run 5
  failing | green 8/8; `tests/vector-cache.test.ts` now 35 tests).
  **Blind-greens (RCA-4):** `docs/specs/unit-f-w4-cache-greens.md` — 28
  scenarios: 27 PASS / 1 DEFERRED-STATIC (WIRE-CACHE — verified by this
  review at `main.ts:168`), zero un-hardened regressions, LIVE 3-boot
  sequence proving hit-adoption economics (boot 1: embedded 2 / cacheHits 0;
  boot 2: cacheHits 2 / embedded 0 with the fetch count UNCHANGED; boot 3
  after an edit: cacheHits 1 / embedded 1, exactly one HTTP embed).
  **Doc-review pass (RCA-6):**
  `archive/reviews/2026-09-05-unit-f-w4-doc-review.md` (the §3a W4
  subsection written, the §5.12 `cacheHits` census re-pinned + the W4 wiring
  byte-check at `main.ts:168`, the §5.13 hardening pins + the F-W4-7
  limitation sentence, the two `docs/decisions.md` vector rows annotated
  W4-LANDED, the `docs/pending.md` cache row repointed to the landed
  reality, the OPEN row → the completed-proposal state, the W2/W3 greens
  `main.ts:163` cites re-pointed to `main.ts:168`). **The vector-boot
  proposal is COMPLETE — every gate run per unit.**
- **Unit W3 — the embed-failure policy (the `skipped` map + the W3 flip + the
  production `embedBatchFn` wiring) (2026-09-05).** The vector-boot slice's
  third unit (spec `docs/specs/unit-f-embeddings.md` §5.3 (the `skipped` map +
  the UNIT-F-SKIP-EMPTY extension + the embed-failure flip) + §5.8 #34–36 +
  §5.9 #45–48 + §5.10 census + §5.12 (the F-W2-3 production wiring) + §3a's W3
  registrations; the §5.12 decomposition W1 → W2 → W3 → W4). Landed: the 4th
  `VectorIndex` member `skipped: Map<nodeId, 'empty' | 'transient'>`
  (interface members 3 → 4, §5.10); the UNIT-F-SKIP-EMPTY empty-content guard
  extended to `addToVectorIndex`/`updateVectorIndex` (an update-to-empty skip
  also removes the id from `nodeIds`); the W3 FLIP — a per-node embed
  rejection on ANY index-maintenance path (`createVectorIndex` build loop,
  `addToVectorIndex`, `updateVectorIndex`, the `onStoreChanged` hook) is
  recorded `skipped.set(nodeId, 'transient')` + logged via the RE-PINNED
  `vector index: node embed failed (transient): <nodeId> <error>` milestone
  and the operation RESOLVES (the required-arg rejections §5.9 #19–21 and the
  query-time embed rejection §5.9 #32 are UNCHANGED); `removeFromVectorIndex`
  clears any `skipped` entry (incl. the F1 UNCONDITIONAL hook-delete — a node
  deleted while skipped leaves no stale record); the F3 dimension-0 latch on
  the add/update success paths; the F2 taxonomy (provider-channel malformed/
  dimension rejections are transient-CLASSIFIED by design — an ALL-transient
  build promotes an EMPTY index with a loud census; the index-level
  RESOLVED-vector checks stay HARD rejections); the controller build routed
  through `createVectorIndex(snapshotNodes, provider.embed, opts.embedBatchFn)`
  (`src/main/vector-boot.ts`) and the production wiring
  `embedBatchFn: provider.embedBatch` at controller creation (`main.ts:163` —
  the F-W2-3 assignment). **TestWriter red: 14 failing** (13 in
  `tests/embeddings-failure-policy.test.ts` + 1 sanctioned
  `tests/embeddings.test.ts:380-386` re-pin) → **Implementer green: 14/14**
  (trio 2120 pass / 38 skip). **Adversarial pass (RCA-3, TWO passes;
  registered in spec §3a's W3 subsection):** pass 1 — F-W3-1 MEDIUM (a node
  DELETED while transient/empty-skipped left a stale `skipped` entry forever;
  fixed: the hook's delete branch calls `removeFromVectorIndex`
  UNCONDITIONALLY — it no-ops for unknown ids and clears any skipped entry),
  F-W3-2 (Architect taxonomy decision — malformed provider-channel rejections
  are transient-classified BY DESIGN; boot resilience over loud abort),
  F-W3-3 (the dimension-0 index shape never latched on the maintenance paths —
  the add/update success paths now latch), F-W3-4 (the §5.12 milestone-string
  drift — re-pinned to the `vector index:` prefix), F-W3-5 (dead
  `removeFromVectorIndex` import in `vector-boot.ts` dropped), F-W3-6
  (coverage gaps — the batch-path 'empty' record + the double-failure
  fallback; the regression tests grew red-first 2 → 6); pass 2 — the fixes
  registered in spec §3a + F-W3-7 (count reconciliation: the failure-policy
  file is 21 tests — 15 before the pass, +6 — and the W3 re-pin comprises 5
  sites: 2 in `tests/embeddings.test.ts` (the build/maintenance block + the
  hook-path block) and 3 in `tests/vector-boot.test.ts` (the three
  total-failure tests reshaped onto a non-embed store-failure trigger via the
  shared `armListNodesFailure` helper)); red set 2 failing (F-W3-1/F-W3-3) |
  green 21/21. **Blind-greens (RCA-4):**
  `docs/specs/unit-f-w3-failure-policy-greens.md` — 25 scenarios (24
  executable + 1 deferred-static): 23 PASS / 1 F-SCORE doc-letter drift (the
  direct `score()` output OMITS rather than zero-scores vector-absent nodes —
  the ranked-level observable identical) **CLOSED by this review's DOC-LETTER
  re-pin** (§5.4/§5.5/§5.8 #34) / 1 DEFERRED-STATIC (WIRE-MAIN — verified by
  this review at `main.ts:163`); zero un-hardened regressions. **Doc-review
  pass (RCA-6):** `archive/reviews/2026-09-05-unit-f-w3-doc-review.md` (the
  F-SCORE letter re-pinned, the OPEN row → this DONE row, the two
  `docs/decisions.md` vector rows annotated W3-LANDED, the W2 greens' W3-era
  pointers closed). **Trio: 2126 pass / 38 skip (105 files), typecheck clean,
  build clean** (2120/38 + the 6 W3 adversarial pass-2 tests).
  **NOT yet landed (the next unit):** W4 cache (§5.13) only. [2026-09-05 W4
  doc review: W4 has since LANDED — see the Unit W4 DONE row above; the
  vector-boot proposal is COMPLETE. The controller-creation call cited here
  at `main.ts:163` is now at `main.ts:168` (the W4 `cache:
  createVectorCache()` arg added).]
- **Unit W2 — the batch seam (`embedBatch?` on BOTH providers + the chunked
  batch build path) (2026-09-05).** The vector-boot slice's second unit (spec
  `docs/specs/unit-f-embeddings.md` §5.2 "Batch seam" + §5.3 batch build path +
  §5.9 #39–41 + §5.8 #37–39; the §5.12 decomposition W1 → W2 → W3 → W4).
  Landed: the OPTIONAL `embedBatch?` member on BOTH concrete providers (ollama
  + remote, F8-dispatched plural request shapes, the positional alignment
  invariant — the WHOLE batch rejects on a mismatch; interface members 5 → 6,
  §5.10), the exported `EmbedBatchFn` type, `fetchWithTimeout` with a REAL
  `AbortController` abort + the `Math.min(budget, 2147483647)`
  setTimeout-ceiling clamp, the exported `BATCH_CHUNK_SIZE = 64`,
  `createVectorIndex(nodes, embedFn, embedBatchFn?)` CHUNKED with per-chunk
  fallback isolation (a rejected/misaligned chunk falls back per-item for
  exactly THAT chunk's texts; the two-arg form unchanged), zero-length-vector
  rejection + validate-then-commit (no dimension-0 latch; the pinned
  `createVectorIndex: malformed response (zero-length vector)`), `embedBatch`
  input validation (`<prefix> embed: batch texts must be an array of strings`;
  empty-string items stay VALID), and `timeoutMs` construction validation at
  BOTH providers (positive integer ≤ 2147483647). **TestWriter red: 23
  failing** (18 missing-member `embedBatch`, 5 assertion — no AbortController,
  no batch wiring) **+ 2 unchanged-behavior guards green** → **Implementer
  green: 25/25** (`tests/embeddings-batch.test.ts`, incl. the LIVE 3-text
  batch against the real ollama `embeddinggemma`). **Adversarial pass (RCA-3,
  registered in spec §3a):** F-W2-1 MEDIUM (zero-length-vector dimension
  poisoning — the provider brick + the index poison; fixed: per-vector
  zero-length rejection + validate-then-commit + the explicit `dimensionSet`
  flag), F-W2-2 MEDIUM (the monolithic batch / the budget clamp / chunking —
  fixed: `BATCH_CHUNK_SIZE = 64` + per-chunk fallback isolation +
  `fetchWithTimeout` clamps to `Math.min(N × timeoutMs, 2147483647)`), F-W2-3
  MEDIUM (the production wiring was unassigned → resolved SPEC-ONLY: W3 owns
  the `embedBatchFn: provider.embedBatch` wiring per §5.12's F-W2-3 amendment
  note), F-W2-4/F-W2-5 LOW (`embedBatch` input validation; `timeoutMs`
  validation), F-W2-6 LOW (doc note — the §5.3 caller-trust boundary) — all
  fixed + regression-tested red-first 9→10 (red set 9 failing | 14 passing =
  13 pre-existing + 1 guard; green 23/23 in
  `tests/embeddings-adversarial.test.ts`). **Blind-greens (RCA-4):**
  `docs/specs/unit-f-w2-batch-greens.md` — 24 scenarios: 23 PASS /
  1 DEFERRED-STATIC (A-F-W2-3 — the wiring claim's site is `main.ts`,
  main-process-only), zero findings, 2 LIVE incl. a real 70-text chunked build
  (2 POSTs of 64 + 6 observed through a recording passthrough fetch); the
  battery closed the W1 greens' PENDING-W2 rows F39/F40/F41. **Doc-review pass
  (RCA-6):** `archive/reviews/2026-09-05-unit-f-w2-doc-review.md` (the
  §5.2/§5.3/§5.5/§5.12 `embeddings.ts` line cites re-pointed post-W2, the
  §5.10 census annotated W2-LANDED, this DONE row + the OPEN row updated, the
  W1 greens PENDING-W2 rows closed with a pointer). **Trio: 2104 pass / 38
  skip (104 files), typecheck clean, build clean** (2069/38 + the 25 batch
  tests + the 10 W2 adversarial tests). **NOT yet landed (the next units):**
  W3 failure policy + the production `embedBatchFn` wiring (per
  §5.12/F-W2-3), then W4 cache (§5.13). [2026-09-05 W4 doc review: W3 + W4
  have since LANDED — see the Unit W3/W4 DONE rows above; the vector-boot
  proposal is COMPLETE.]
- **Unit W1 — vector-boot (BOOT MODEL B + the promotion seam + prebuilt-index
  adoption) (2026-09-05).** The vector-boot slice's first unit (spec
  `docs/specs/unit-f-embeddings.md` §5.12 + §5.5 + §5.9, amended 2026-09-05;
  the §5.12 decomposition W1 → W2 → W3 → W4). Landed: the NEW pure module
  `src/main/vector-boot.ts` (`warmUpEmbeddingProvider` — ONE real
  `POST /api/embed` warm-up gate of the pinned `VECTOR_BOOT_WARMUP_TEXT`, NOT
  `isOllamaAvailable`; total failure rejects
  `vector boot warm-up: <underlying message>` → boot aborts before the window;
  `createVectorBootController` — created SYNCHRONOUSLY, builds the ONE shared
  `RetrievalEngine` born-LEXICAL internally (main never calls
  `createRetrieval` in vector mode), background sequential build over the
  non-empty nodes (UNIT-F-SKIP-EMPTY) → reconcile (strict `updatedAt >
  embedAt` tie rule; F-W1-1 live-empty guard; F-W1-2 mid-build additions
  adopted) → atomic one-way promotion; the `PromotionReport` census
  (`embedded`/`cacheHits` 0-until-W4/`reEmbedded`/`adopted`/`skipped
  {empty, transient}`/`promotedAt`); SINGLE-SHOT `start()` rejecting
  `vector boot: start already called`), the `RetrievalEngine.setEmbedder`
  promotion seam (the THIRD engine member in `src/main/retrieval.ts` — ONE-WAY
  `retrieval engine: embedder promotion is one-way (already promoted)`; the
  F-W1-3 structural guard rejects a broken embedder with
  `retrieval engine: embedder required` WITHOUT consuming the latch; the
  `onStoreChanged` hook attaches with the swap), `VectorEmbedderOptions.index?`
  prebuilt-index adoption (zero build embeds inside `createVectorEmbedder`)
  + the provider option WIDENED to config | instance (implementer deviation,
  documented in §5.5 this pass), and the `main.ts` vector branch rewired
  (config-check throw preserved verbatim at `main.ts:153-157`; the controller
  owns engine creation; window + `mcp.start()` start PENDING; fire-and-forget
  `void vectorBoot.start().catch(...)`). **TestWriter red: 33 red** (module
  `src/main/vector-boot.js` does not exist — suite-load failure; the RED
  marker test pins it) **+ adversarial red: 5 — A-F-W1-1..5 reproduced** →
  **Implementer green: 33/33** (`tests/vector-boot.test.ts`) **+ adversarial
  fixes green: 5/5** (`tests/vector-boot-adversarial.test.ts`). **Adversarial
  pass (RCA-3, registered in spec §3a):** F-W1-1 HIGH (the reconcile
  empty-guard — a node emptied mid-build re-embedded `''` →
  `malformed response` → total failure, pending forever; fixed: live-content
  guard + `skipped` 'empty' + the promotion continues), F-W1-2 MEDIUM
  (mid-build additions invisible post-promotion; fixed: the reconcile pass
  adopts them + the NEW `PromotionReport.adopted` field), F-W1-3/F-W1-4/F-W1-5
  LOW (the structural `setEmbedder` guard without consuming the one-way
  latch; the `VectorIndex` literal TS2353 type drift, pinned by a real
  in-process TypeScript compile; the warm-up provider construction moved
  INSIDE the try so a present-but-invalid config gets the class-2 wrap) —
  all fixed + regression-tested. **Blind-greens:**
  `docs/specs/unit-f-w1-vector-boot-greens.md` — 32 scenarios: 28 PASS,
  3 PENDING-W2 (F39/F40/F41 — the batch seam is W2's contract;
  `embedBatch === undefined` at runtime), 1 DEFERRED-STATIC (F38 —
  main-process-only; verified by this pass's doc review at
  `main.ts:153-157`), zero doc-drift findings in the W1 scope. **Doc-review
  pass (RCA-6):** `archive/reviews/2026-09-05-unit-f-w1-doc-review.md`
  (spec §5.12/§5.7 line-cites re-pointed post-W1, §5.5 provider-widening
  amendment note added, §5.10 census annotated W2-forward, the
  VECTOR-BOOT-BACKGROUND-PROMOTE decision row updated, this tracker row
  rewritten from the stale "NEXT = W1 TestWriter red"). **Trio: 2069 pass /
  38 skip (103 files), typecheck clean, build clean** (2031/38 + the 33 W1
  tests + the 5 adversarial tests). **NOT yet landed (the next units):** W2
  batch seam, W3 failure policy, W4 cache (§5.13). [2026-09-05 W2 doc review:
  W2 has since LANDED — see the Unit W2 DONE row above; W3 + W4
  outstanding.] [2026-09-05 W4 doc review: W3 + W4 have since LANDED — see
  the Unit W3/W4 DONE rows above; the vector-boot proposal is COMPLETE.] Decisions
  VECTOR-BOOT-BACKGROUND-PROMOTE / VECTOR-CACHE-CONTENT-HASH-KEY in
  `docs/decisions.md`.
- **Unit V1 — store adjacency (2026-08-29).** The SCOPED-LOAD fix's Unit 1
  (see `docs/specs/load-bug-scoped-traversal-review.md` §6). Added to
  `src/main/rag-store.ts`: the shared PURE adjacency core (`buildAdjacencyIndex`
  + the 5 query helpers `edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`/
  `edgesForDocumentIndex`/`docHeadForDocumentIndex`), the 5 new `RagStore`
  interface methods (`edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/
  `docHeadForDocument`), the lazy O(E) index + invalidation across all 6 mutation
  paths, the quarantine exclusion, and `createSnapshotStore(nodes, edges)` (the
  read-only adapter delegating to the SAME pure adjacency core). **TestWriter
  red: 34 failing (method does not exist)** → **Implementer green: 34/34** +
  the existing `rag-store.test.ts` 23/23 (no regression). **Adversarial: 3 MED +
  3 LOW host findings** (MED-1 snapshot aliasing, MED-2 duplicate `documentIds`
  parity, MED-3 doc-child-only scoping, LOW-4 throw-message divergence, LOW-5
  dangling doc-head source, LOW-6 no-op invalidation) — all fixed + regression-
  tested (`tests/unit-v1-store-adjacency-adversarial.test.ts`, 7/7). **Blind
  greens: 40/40** (`docs/specs/unit-v1-store-adjacency-greens.md`). **Live
  scenarios: PARKED** (the adjacency surface is internal — consumed by Units
  V2/V3; `docs/specs/unit-v1-store-adjacency-live-pending-battery.md`). **Doc
  review:** `archive/reviews/2026-08-29-unit-v1-store-adjacency-doc-review.md`
  (repointed the wrong "Unit C §5.9 (`rebuildBackRefs`)" citations in
  `unit-k-sidebar-panes-host.md` + `unit-v2-scoped-traversal-mcp.md` to
  `src/main/traversal.ts:485`). **Trio: 1865 pass / 37 skip, typecheck + build
  clean.** Decisions ADJACENCY-INDEXED / SHARED-ADJACENCY-CORE /
  READ-ONLY-SNAPSHOT-ADAPTER added to `docs/decisions.md`.

- **Unit V2 — scoped traversal + MCP refactor (2026-08-29).** The SCOPED-LOAD
  fix's Unit 2 (see `docs/specs/load-bug-scoped-traversal-review.md` §6). The
  scoped `buildTraversal` walk in `src/main/traversal.ts` (per-document
  `computeDocumentSubgraph` node set + `edgesForDocument` pre-scoped
  `validateDocFlow` + `edgesFrom`-filtered doc-child subtrees +
  `docHeadForDocument` O(1) doc-head marker + `edgesTo`-filtered multi-parent
  duplicates + the `seen`-set defense-in-depth cycle guard + the full-edge
  outgoing-only crosslink wiring), the shared `computeDocumentSubgraph(store,
  documentId)` helper (the SINGLE derivation used by BOTH the walk AND the
  `rag.get_document` MCP tool), the `rag.get_document` refactor in
  `src/main/mcp-server.ts` (preserving the `{ documentId, nodes, edges }`
  contract), the `rebuildBackRefs` inline-adapter replacement via
  `createSnapshotStore`, AND the renderer's `buildTraversalEnvelope` adapter
  (`sidebar-panes.ts:831`) replaced via `createSnapshotStore` (amendment 4). The
  accepted edit-surface change (amendment 1): the scoped walk's `materialized`
  set is the reachable-from-head set, so `backRefs`/`crosslinks` drop nodes not
  reachable from the head. **TestWriter red: 24 failing** (the
  `computeDocumentSubgraph` export + the `DocumentSubgraph` type do not exist;
  the adjacency-method enforcement does not throw) → **Implementer green: 24/24**
  (`tests/unit-v2-scoped-traversal-mcp.test.ts`). **Adversarial: HOST-2..HOST-8
  host findings** (HOST-2 cross-document shared-fixture equivalence, HOST-3
  `computeDocumentSubgraph` malformed-input cases, HOST-4 the edit-surface
  shrink drops a node the OLD walk materializes, HOST-5 the doc-child cycle
  terminates via the family-pre-order fallback, HOST-6 `rag.get_document` with
  an unknown id → `{ documentId, nodes: [], edges: [] }`, HOST-8
  `rebuildBackRefs([], [], 'main')` → empty `Map`) — all fixed + regression-tested
  (`tests/unit-v2-scoped-traversal-mcp-adversarial.test.ts`, 9/9); HOST-1
  (tracker staleness) + HOST-7 (informational) handled by the doc-review. **Blind
  greens: 32/32** (`docs/specs/unit-v2-scoped-traversal-mcp-greens.md`). **Trio:
  full suite 1898 pass / 0 fail, typecheck + build clean.** Decisions
  SCOPED-WALK / SINGLE-DOCUMENT-SUBGRAPH / MATERIALIZED-SHRINK added to
  `docs/decisions.md`; the snapshot-transfer limitation noted in `docs/pending.md`
  (amendment 9).

- **Unit V3 — doc-heads doc-nav (2026-08-29).** The SCOPED-LOAD fix's Unit 3
  (see `docs/specs/load-bug-scoped-traversal-review.md` §6). The lighter
  `rag-doc-heads` IPC (`IPC_RAG_DOC_HEADS` + `RagDocHeadsPayload` in
  `src/shared/types.ts`, the shared `handleRagDocHeadsIpc(store)` handler in
  `src/main/mcp-server.ts`, the `ipcMain.handle(IPC_RAG_DOC_HEADS, ...)` in
  `src/main/main.ts`, the `bridge.rag.docHeads()` in `src/main/preload.ts`)
  returns `{ documents: [{ documentId, title }] }` from the `doc-head` edges +
  the head node content — a strict subset of the snapshot. The doc-nav switched
  from `PaneContext.snapshot` to `ctx.docHeads` (`deriveDocNavDocuments`/
  `docNavContent` in `src/renderer/pane-graph.ts` read `ctx.docHeads`; the
  `PaneContext.docHeads` field added in `src/renderer/pane-registry.ts`), the
  host gained a `lastDocHeads` cache (boot/re-derive fetch `bridge.rag.docHeads()`;
  `buildContext` populates `ctx.docHeads`), and `selectDocument` validates
  against the doc-heads list instead of `lastSnapshot.edges` (amendment 5). The
  `RagSnapshotPayload` + the `rag-snapshot` IPC are PRESERVED for
  `buildTraversal` (amendment 9). **TestWriter red: 24 failing / 1 skip** (the
  `IPC_RAG_DOC_HEADS`/`RagDocHeadsPayload`/`handleRagDocHeadsIpc`/
  `bridge.rag.docHeads`/`PaneContext.docHeads`/`lastDocHeads` absent + the
  doc-nav helpers still reading `ctx.snapshot` — method-does-not-exist +
  type-level gaps) → **Implementer green: 24 pass / 1 skip**
  (`tests/unit-v3-doc-heads-docnav.test.ts`; the 1 skip is the preload bridge
  method, verified by code review). **Adversarial: MED-1 + LOW-2..LOW-6 host
  findings** (MED-1 `handleRagDocHeadsIpc` skips a malformed `doc-head` target,
  LOW-2 non-array `docHeads` → `[]`, LOW-3 defensive sort/dedupe restored,
  LOW-4 missing `title` → `''`, LOW-5 `reDerive` commits `lastSnapshot` +
  `lastDocHeads` together, LOW-6 null `lastDocHeads` no-ops) — all fixed +
  regression-tested (`tests/unit-v3-doc-heads-docnav-adversarial.test.ts`, 12/12).
  **Blind greens: 36/36** (`docs/specs/unit-v3-doc-heads-docnav-greens.md`).
  **Trio: full suite 1966 pass / 0 fail, typecheck + build clean.** Decisions
  DOC-HEADS-IPC / DOC-NAV-DOCHEADS / HOST-DOCHEADS-CACHE / RAG-SNAPSHOT-PRESERVED
  added to `docs/decisions.md`; the amendment-8 greens/tracker reconciliation
  (the stale `deriveDocNavDocuments(snapshot)`/`ctx.snapshot` doc-nav references
  in `unit-h-sidebar-panes-greens.md`/`unit-h-sidebar-panes.md`/
  `unit-k-sidebar-panes-host.md`) done in this pass. **LIVE VERIFICATION
  (2026-08-29):** the app was run against the persisted 63-document corpus and
  the live scenarios exercised via the MCP server. A live finding surfaced + was
  fixed: the boot rendered ALL 63 documents at once (the full-graph render that
  times out) even with the scoped walk — the boot now renders ONLY the current
  document (the localeCompare-first doc-head, matching the doc-nav's first
  entry), dropping `get_rendered_html` from a 60s+ timeout to ~0.15s. Regression
  test added (`tests/sidebar-panes-host.test.ts` "SCOPED-LOAD (live finding)");
  the Unit V3 `selectDocument` fail-state tests updated for the new boot
  behavior (the boot sets `currentDocumentId` to the first doc-head). **Trio
  (post-fix): full suite 2003 pass / 0 fail, typecheck + build clean.** The
  doc-nav `li` nodes are NOT MCP dispatch targets (no handlers), so the
  `pane-doc-nav-select` select can't be driven via MCP dispatch — recorded in
  `docs/pending.md`.

- **Live-app fixes — the editing-mode slice's 3 reported UI issues + the dead
  Save button (2026-08-28).** After the slice landed, the user reported 3 live
  issues; all fixed + verified (trio 1784 pass / 37 skip, typecheck + build
  clean):
  1. **Settings rendered at the bottom, not as a pane** — the operator panes
     (`#operator-panes`) are a separate graph scope (never MCP-visible), so they
     can't live in the app-graph sidebar; styled the container as a proper
     full-width card/pane (light + dark) in `src/renderer/index.html`.
  2. **Clicking the editing-mode toggle appended a new settings element** — a
     regression from the U1 `refresh→mountOperator` change: the engine's
     `DomAdapter.endBatch` APPENDS roots and never clears the mount, so each
     re-derive appended a duplicate. Fixed in `src/renderer/sidebar-panes.ts`
     (`mountOperator` now clears the container first, robustly across the real
     DOM + the test dom-shim).
  3. **Add-zone / reset / save buttons did nothing** — Add-zone read the button's
     own empty `value` prop; fixed to read the `template-zone-input`'s DOM value
     (UI) or a dispatch arg (MCP). Reset was already wired. Save was a documented
     no-op (M15 — the template is auto-committed, nothing to save); the dead
     Save button is REMOVED from the pane (decision
     TEMPLATE-SAVE-BUTTON-REMOVED; `src/renderer/template-pane.ts` + the Unit I
     spec + tests updated). **Verified live** via the MCP endpoint: Add-zone
     adds a zone, Reset restores it, the Save button is gone.

- **Unit U4 — the contenteditable rich-text editor (handlers + bridge +
  discriminated `CaretState` + IME + re-derive restore) (2026-08-28).** The
  editing-mode-toggle slice's FIFTH and FINAL unit (unit 5 of 5 in execution
  order U2→U3→U1→U5→U4 — decisions **B/G/H/I** of
  `docs/specs/editing-mode-toggle-review.md` §4 + §3 amendments 4/6; the U4
  spec is `docs/specs/unit-u4-contenteditable-editor.md`). **The slice is now
  CODE-COMPLETE (all 5 units U2/U3/U1/U5/U4 done) — AWAITING the user's
  commit.** Wires the U3-spliced per-node contenteditable to the edit path:
  the 4 rich handler defs (`rag-editor-input`/`rag-editor-blur`/
  `rag-editor-compositionstart`/`rag-editor-compositionend`, `registerHandlerDef`
  in `bindHandlers`) + the `applyEditingMode` handler attachment (APPEND-IF-
  ABSENT / name-deduplicated, minor #5) in `src/renderer/sidebar-panes.ts`; the
  4 bridge methods (`editorInput`/`editorBlur`/`editorCompositionStart`/
  `editorCompositionEnd` — surface 8→12) + the 3 host fields
  (`composingRagId`/`pendingCommitRagId`/`committingRagIds`) + `editorBlur`
  decompose-ONCE (`decomposeRichHtml`) + commit-ONCE (`bridge.edit.commitRich`,
  the atomic `{content, children}` pair) + the `.catch`-keeps-dirty (ADR-4) +
  the per-ragId commit-in-flight latch (ADR-1, released in the `.then`/`.catch`
  — the dual-delete is behaviorally the pinned `.finally` release); the IME
  composition guard (mid-composition blur deferred to `compositionend`, the
  orphaned-pending a-med #2 fix on a superseding `compositionstart`); the
  discriminated `CaretState` (`{kind:'textarea'}` | `{kind:'rich'; ragId;
  anchor; focus; focused}`) + `RichCaretEdge` in `src/renderer/edit-controller.ts`
  with kind-agnostic `saveCaret`/`restoreCaret`/`clearCaret` (no DOM, no mode
  knowledge — the MODE GATING lives in the host); and the gated re-derive caret
  restore loop (rich caret → contenteditable root ONLY when
  `editingMode==='contenteditable'` AND the rendered root carries the
  `contenteditable` attribute; textarea caret → textarea ONLY when the
  `textarea-<ragId>` element exists; a MISMATCH is DROPPED one-shot, never
  misapplied — amendment 4 / U3 F2 / ADR-8) with the element-caret clamp to the
  nearest text node (a-med #3), the ADR-13 dom-shim no-throw guards (no
  `getSelection`/`createRange`), and the FIRST-materialization restore
  limitation (decision I). TestWriter red → Implementer green in
  `tests/contenteditable-editor-host.test.ts` (44 pass / 5 skip — the 5 skipped
  are the browser-only real-DOM `createRange`/`getSelection`/IME/`dispatch`
  cases, documented in a `.skip` block, the Unit L §5.8/§5.9 convention) +
  `tests/contenteditable-caret.test.ts` (10 pass) = **54 pass / 5 skip** (the
  RED set = the 4 handler defs + 4 bridge methods + 3 host fields absent + the
  `CaretState`/`RichCaretEdge` types absent + the both-kinds controller
  storage absent + the decompose-ONCE/commit-ONCE blur + the composition guard
  + the gated restore — method-does-not-exist + type-level gaps, **36 failing /
  14 pass / 5 skip**, run and reported before implementation, RCA-1) →
  **Implementer green: 50 → 54 pass / 5 skip** (the 4 adversarial regressions
  CRITICAL #1 / a-med #2 / a-med #3 / minor #6 added after the adversarial
  pass). Adversarial pass (RCA-3) in the spec §5.1 — **all HOST (none
  package)**: **CRITICAL #1** (the re-derive caret restore was clobbered by the
  `await this.refresh()` that immediately followed `reDerive`'s own
  `loadAppGraph` — the second load's `tearDownGraph`+fresh `render()` destroyed
  the just-applied selection in a real browser; FIXED: `reDerive` no longer
  calls `loadAppGraph` itself — it stashes the traversal in
  `lastTraversalEnvelope` and lets `refresh()` perform the SINGLE final load,
  then the restore loop runs AFTER that render), **a-med #2** (a superseding
  composition orphaned a deferred commit + permanently wedged the dirty guard;
  FIXED: `editorCompositionStart` for a node ≠ the pending node runs the
  orphaned deferred commit NOW), **a-med #3** (an element-node caret edge was
  silently dropped on restore; FIXED: `resolveDomPath` clamps an element edge
  to its nearest text node via `firstTextNode`), **minor #5** (append-if-absent
  handler merge — confirmed no authored handler on a rich root today), **minor
  #6** (the 4 public bridge methods NO-OP on a null/undefined ragId), all fixed
  here + regression-tested (the CRITICAL #1 regression asserts `loadAppGraph`
  is called EXACTLY ONCE and the restore runs after that single final load).
  Blind-greens in `docs/specs/unit-u4-contenteditable-editor-greens.md`
  (44/44 — 43 node-runnable + 1 type-level; no spec-vs-impl drift observed).
  Documentation review in `archive/reviews/2026-08-28-u4-doc-review.md` (spec
  + greens + trackers reconciled against the build — the stale sidebar-panes /
  edit-controller line-number cross-refs + the CaretState line ref fixed).
  Trio green: full suite **1784 pass / 37 skip / 0 fail** (up from 1730/32 by
  the 54 U4 tests + 5 skips; the scratch-greens 1827 includes the deleted
  scratch run), typecheck clean, build clean. **Editing-mode toggle slice
  COMPLETE — AWAITING the user's commit.**
- **Unit U5 — the atomic rich-text write-back op + `IPC_EDIT_RICH_COMMIT` +
  preload `edit.commitRich` (2026-08-28).** The editing-mode-toggle slice's
  fourth unit (unit 4 of 5 in execution order U2→U3→U1→U5→U4 — decision **A**
  of `docs/specs/editing-mode-toggle-review.md` §4 + amendment 7 (UI-IPC-only
  rich commit); the U5 spec is `docs/specs/unit-u5-set-rich-text.md`). The
  SINGLE `setRichText(ctx, {nodeId, content, children})` op writes BOTH `content`
  AND `children` in ONE atomic `putNode` (one `content` journal entry; decision
  A — `applyBatch`/`BatchOp` UNTOUCHED), with the `undefined`≡`[]` children
  no-op guard (`sameChildren`) + the `children`-required + `nextChildren`
  representation-preserve contracts; the PURE exported
  `deriveRichCommitBroadcast(before, after)` helper (kind rule: children change
  → `structural`, content-only → `content`, no-op → `null`); the shared
  `handleRichCommit` handler (deleted-node → `reason:'deleted-node'`, else
  `store-error`); the `IPC_EDIT_RICH_COMMIT` channel +
  `EditRichCommitPayload`/`RichCommitResult`; and the preload `edit.commitRich`
  bridge (the `edit` bridge grows 3→4 methods). **F1 (post-green adversarial)
  extraction** — the main handler's derive→reconcile→broadcast-once body is the
  node-testable `handleRichCommitIpc(store, payload, deps)` (this repo tests
  shared handlers, not `main.ts` directly), so the §2.1 states 24-27 broadcast
  contract (real change → broadcast ONCE / no-op → 0 / kind routing / reconcile
  failure NON-FATAL) is regression-covered. TestWriter red → Implementer green in
  `tests/unit-u5-set-rich-text.test.ts` + `tests/unit-u5-rich-commit-ipc.test.ts`
  = **TestWriter red: 37 failing / 3 pass** (the missing
  `setRichText`/`deriveRichCommitBroadcast`/`handleRichCommit`/`handleRichCommitIpc`
  + the missing `IPC_EDIT_RICH_COMMIT`/`EditRichCommitPayload`/`RichCommitResult`
  + the missing preload `edit.commitRich` — method-does-not-exist + type-level
  gaps, run and reported before implementation, RCA-1) → **Implementer green:
  40/40** → the adversarial F1-F4 regressions grew the two files to **51 pass**
  (the F1 handler-broadcast + F2 before-guard regressions in
  `tests/unit-u5-rich-commit-ipc.test.ts`, the F4 deepEqual-recursion-cap
  regressions in `tests/unit-u5-set-rich-text.test.ts`). Adversarial pass
  (RCA-3) in the spec §5 — **all HOST, F1-F4** (F1 = the handler-broadcast
  contract UNTESTED → fixed by the `handleRichCommitIpc` extraction +
  regression tests; F2 = the ADR-9 `before` narrowing had no runtime guard →
  fixed with a `before ?` derive-guard (never throws, falls back to no
  broadcast) + regression; F3 = spurious broadcast on a concurrent no-op →
  ACCEPTED (extra re-derive only, documented, no code change); F4 = `deepEqual`
  had no recursion-depth guard → fixed with a depth-100 cap (treat as changed,
  conservative, mirroring `hasDangerousKey`) + regressions), all fixed here +
  regression-tested. Blind-greens: NOT yet run (creating the
  `unit-u5-set-rich-text-greens.md` file is a later blind-test pass, not this
  task). Documentation review in
  `archive/reviews/2026-08-28-u5-doc-review.md` (spec + trackers reconciled
  against the build). Trio green: full suite **1730 pass / 32 skip / 0 fail**
  (up from 1719 by the 11 F1/F4 regression tests), typecheck clean, build clean.
- **Unit U1 — `editingMode` operator setting + Settings button-toggle control +
  `operator-settings-changed` re-derive broadcast + the decision supersession
  (2026-08-28).** The editing-mode-toggle slice's third unit (unit 3 of 5 in
  execution order U2→U3→U1→U5→U4 — decisions **C** and **D** of
  `docs/specs/editing-mode-toggle-review.md` §4/§5, U1 row; the U1 spec is
  `docs/specs/unit-u1-editing-mode-setting.md`). Four pieces: (1) the
  `editingMode` 4th field on `OperatorSettings`/`OperatorSettingsPatch` + the
  store (`DEFAULT_SETTINGS`/`sanitize`/`set`/`get`) using the existing
  `EditingMode` type, with `coerceEditingMode` (only the exact string
  `'textarea'` passes, everything else → `'contenteditable'`; TOTAL, never
  throws); (2) the NEW `IPC_OPERATOR_SETTINGS_CHANGED` broadcast (main fires it
  EXACTLY ONCE post-`set`, payload = the store's filtered/coerced result, NOT the
  raw patch; GET never broadcasts) + the preload `operatorSettings.onChanged`
  (returns an unsubscribe); (3) the payload-authoritative SYNCHRONOUS host
  `onOperatorSettingsChanged` (uses the PAYLOAD directly — NO re-fetch,
  amendment A; defensive coercion; routes `requestRebuild` → the SAME single
  fresh re-derive as rag/template) + the boot-applies-persisted-mode fix (F1) +
  the button-toggle Settings control (a text div `operator-editing-mode` + a
  button `operator-editing-mode-toggle` reading `data-mode`, operator isolated
  scope, never MCP-visible, NO `checked`/`selected` boolean-attribute state — the
  pivot that avoids the confirmed `provident-ssr` gap `HOST/U1-ENG`) + the
  `operatorSet` simplification (broadcast drives the re-render, no inline
  re-mount / `.then`) + the M9 supersession (the reconciled M9 test drives the
  operator re-render via the broadcast path); (4) the NEW `docs/decisions.md`
  DECIDED `EDITING-MODE-SETTING` row superseding FORM-CONTROL-EDITING's "NOT
  contenteditable" clause + RICH-TEXT-EDITING-GATE's "no global `editingMode`
  field" clause. TestWriter red → Implementer green in
  `tests/operator-settings-editing-mode.test.ts` (21 node-tested) +
  `tests/editing-mode-broadcast-host.test.ts` (30 pass / 2 skip, incl. the F-2
  regression) = **51 pass / 2 skip** (the RED set = the missing
  `editingMode` field / `coerceEditingMode` / `IPC_OPERATOR_SETTINGS_CHANGED` /
  `onChanged` / `onOperatorSettingsChanged` / the button-toggle control / the
  `operatorSet` simplification — method-does-not-exist + type-level gaps — run
  and reported before implementation, RCA-1); the **2 contract conflicts** (the
  payload-authoritative amendment A rework + the M9 supersession) reconciled by
  amending the spec + the reconciled tests. Adversarial pass (RCA-3) in the spec
  §5 — **all HOST, F1–F5** (F1 boot-applies-persisted-mode, F2 null-payload
  guard, F3 compileHandlerBody-compatible toggle body, F4 double-click
  coalescing, F5 operatorSet `.catch`), all fixed + regression-tested in
  `tests/editing-mode-broadcast-host.test.ts`; the confirmed `provident-ssr`
  boolean-attribute engine gap recorded as **`HOST/U1-ENG`** in
  `docs/defects.md` + `docs/HANDOFF.md` (the control PIVOTED to a button-toggle
  to avoid it — a `button` is NOT a form control, carries no checked/selected
  state). Blind-greens in
  `docs/specs/unit-u1-editing-mode-setting-greens.md` (35 scenarios — 35 pass, 0
  fail, 0 skipped; the single F-2 blind FAIL was re-verified by the Implementer
  as a **HARNESS ARTIFACT, not a real bug** — the blind harness's `get()` mock
  did not reflect `set()`, so `refresh()`'s re-fetch overwrote the
  payload-authoritative value; a regression test added to
  `tests/editing-mode-broadcast-host.test.ts` that drives the EXACT blind flow
  and PASSES); proofreader pass; documentation review in
  `archive/reviews/2026-08-28-u1-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (full suite **1679 pass / 0 fail**,
  typecheck clean, build clean). Decision landed: **EDITING-MODE-SETTING** (see
  `docs/decisions.md`). **Control-fallback fix (2026-08-29, doc-review finding):**
  the `settingsContent` button-toggle's `?? 'textarea'` fallback (used when
  `lastOperatorSettings` is null — the boot-get-failure edge) contradicted the
  `contenteditable` default the host actually uses, so the control could
  advertise `editingMode: textarea` while the live mode was contenteditable. The
  three fallbacks in `src/renderer/sidebar-panes.ts` `settingsContent` were
  changed to `?? 'contenteditable'`; the F1 boot-failure test in
  `tests/editing-mode-broadcast-host.test.ts` was extended to pin the control
  fallback (red → green; trio green 2003 pass / 38 skip).
- **Unit U3 — rich-text editing eligibility + host post-assembly splice +
  snapshot `children` field (2026-08-28).** The editing-mode-toggle slice's
  second unit (unit 2 of 5 in execution order U2→U3→U1→U5→U4 — decisions **C**
  and **E** of `docs/specs/editing-mode-toggle-review.md` §4/§5, U3 row). A new
  PURE, node-testable module `src/renderer/rich-eligibility.ts` exports
  `isRichEditableRoot(type, ownsDocChildren): boolean` (true iff
  `EDITABLE_TYPES.has(type) && !ownsDocChildren` — PURE + DETERMINISTIC + TOTAL,
  never throws) + the closed `EDITABLE_TYPES` set (`h1`–`h6`/`p`/`blockquote`/
  `div` — **9 members**, NOT the review's miscounted "7"; the 14 other
  `RagNodeType` members are ineligible (in contenteditable mode they render as
  plain text — their textarea is removed). The host post-assembly
  splice — a private `SidebarPanes` method `applyEditingMode(envelope,
  editingMode)` in `src/renderer/sidebar-panes.ts` — walks each payload
  `content[0]`, recurses into `rag-`-prefixed doc-children, REMOVES the
  traversal-authored `textarea-<ragId>` child + sets `contenteditable: true` on
  every RICH-ELIGIBLE root (preserving the root's other props, incl. authored
  `id`/`data-rag-node-id`/`data-doc-head`); in contenteditable mode the textarea
  is removed for ALL rag roots — ineligible roots render as plain text (no
  textarea, no `contenteditable` prop, no `rag-editor-*` handlers);
  `editingMode === 'textarea'` is a byte-for-byte no-op;
  idempotent across re-assembles (H4-style). `applyEditingMode` is invoked in
  `loadAppGraph` immediately after `setTextareaReadOnly` and BEFORE
  `recomputeBackRefs` (decision C — the readOnly pass still sees the textarea;
  backRefs recomputed from the POST-splice envelope). The mode is supplied from
  a NEW private host field `private editingMode: EditingMode = 'contenteditable'` (the
  default edit mode, decision D) INJECTED by the U3 integration test (no U1
  operator-settings field required). `src/shared/types.ts` gains the additive
  `children?` field on `RagSnapshotPayload.nodes` (no runtime change — the
  `IPC_RAG_SNAPSHOT` handler already returns full `RagNode` objects) + the
  `EditingMode = 'textarea' | 'contenteditable'` type (Unit U1 later adds the
  `editingMode` field to `OperatorSettings` using this SAME type and rewires the
  host source). TestWriter red → Implementer green in
  `tests/rich-eligibility.test.ts` (20) + `tests/rich-splice.test.ts` (21) =
  41 — **TestWriter red: 32 failing / 8 pass** (the RED set: the
  `isRichEditableRoot`/`EDITABLE_TYPES` module missing + `applyEditingMode`/
  `this.editingMode` absent + the `children?`/`EditingMode` type-level gaps) →
  **Implementer green: 40 → 41 pass** (the F3 adversarial regression added after
  the adversarial pass). The **state-14 spec contradiction** (the §2.1 state-14
  prose read an "eligible h1 owning an h2 doc-child splices" vs the pinned
  `ownsDocChildren` rule making the h1 INELIGIBLE) resolved by amending the test
  + spec prose to pin "parent-textarea-removed / doc-child-splices" — the h1
  (ineligible — it owns a doc-child) has its textarea removed too (plain text),
  only the doc-child h2 splices.
  Adversarial pass (RCA-3) in the spec §5 — all HOST (none package): F1 (a-med,
  forward-looking for U1 — the splice irreversibly mutates the shared cached
  traversal envelope; contract for U1: mode toggling MUST always trigger a fresh
  traversal / re-derive, never `refresh()` over the cached envelope), F2 (minor,
  deferred to U4 — textarea caret over-delete on the textarea→contenteditable
  transition), F3 (minor, FIXED — `setTextareaReadOnly` AND `applyEditingMode`
  dereferenced `p.content[0]` without a guard → a payload with an empty `content`
  array threw; fixed: both passes drive the walk with `walk(p.content?.[0])` and
  the `walk` helper starts with `if (!n) return`; regression-tested — see
  `docs/defects.md` HOST-U3-F3). Blind-greens in
  `docs/specs/unit-u3-rich-eligibility-splice-greens.md` (35 scenarios — 35
  pass, 0 fail, 0 skipped, authored from the docs ONLY, blind-run against the
  live eligibility gate + a spec-derived splice harness); proofreader pass;
  documentation review in `archive/reviews/2026-08-28-u3-doc-review.md` (spec +
  greens + trackers reconciled against the build); trio green (full suite 1628
  pass / 30 skip, typecheck clean, build clean).
- **Unit U2 — contenteditable-blur HTML → `RagNodeChild[]` decomposition (pure)
  (2026-08-28).** The editing-mode-toggle slice's first unit (unit 1 of 5 in
  execution order U2→U3→U1→U5→U4 — decision **F** of
  `docs/specs/editing-mode-toggle-review.md`). A new PURE, TOTAL,
  node-testable module `src/main/rich-decompose.ts` exports
  `decomposeRichHtml(rawHtml: string): DecomposeRichResult` — a deterministic
  converter that turns a contenteditable root's `innerHTML` (browser-authored
  rich text) back into the RAG node's plain-text `content` + inline `children`
  (`RagNodeChild[]`), so the host can write it back via the combined
  `setRichText` edit op after blur (Unit U5). The discriminated return
  `{ ok: true; content; children } | { ok: false; error }`; the ONLY fail-state
  is a non-string input → `{ ok: false, error: 'decomposeRichHtml: input must be
  a string' }`; for ANY string input it returns `{ ok: true, ... }` (never
  throws). Closed accepted element set (11 types): `strong`/`em`/`a`/`img`
  (as-is) + `b`→`strong`/`i`→`em` (mapped — emitted `RagNodeChildType`s: 4,
  `strong`/`em`/`a`/`img`) + `u`/`font`/`span`/`div`/`br` + anything outside the
  set unwrapped to text (folded into the parent `content`); strips `on*`/
  dangerous-key attributes; re-validates `a` href / `img` src via
  `normalizeUrl`/`isSafeUrl` (raster-only `data:image/*` carve-out for `img`
  only); demotes unsafe/missing-`href` `a` to text, drops unsafe/missing-`src`
  `img`; nested-inline flattening + recursive hoisting; text-between-children
  folds into `content` (the §3 round-trip invariant). REUSES the paste-sanitize
  tokenizer + URL helpers exported ADDITIVELY from `src/main/paste-sanitize.ts`
  (`parseHtml`/`normalizeUrl`/`isSafeUrl`/`escapeAttr` + the
  `HtmlText`/`HtmlElement`/`HtmlNode` types) with NO behavior change to
  `sanitizePastedHtml` (the pinned Unit S 46-test suite stays green).
  TestWriter red → Implementer green in `tests/unit-u2-rich-decompose.test.ts`
  (RED marker: `src/main/rich-decompose.ts` did not exist + the additive exports
  were still private → **62 failing** → **64 green**; the 64 tests = the §2.1 38
  happy-path states + the §2.2 8 fail-states + the 1 module-existence RED + the
  §1.3 5 additive-export tests + the §6 12 adversarial regressions ADR-1..ADR-12
  — the original ADR-1..ADR-10 must-hunt + the two host-fix regressions ADR-11
  (F1) + ADR-12 (F2) added after the adversarial pass). Adversarial pass (RCA-3)
  in the spec §6 — **all HOST (none package)**: F1 (a-big, FIXED —
  `String.fromCodePoint` threw a `RangeError` on out-of-range / lone-surrogate
  HTML refs, violating totality; fixed with a `code > 0x10ffff || surrogate`
  guard in `decodeHtmlRefs` leaving the literal un-decoded — also makes
  `sanitizePastedHtml` not throw; regression ADR-11), F2 (a-med, FIXED — a
  legitimate trailing text run after `img` was dropped as the img's
  tokenizer-attached child; fixed by recovering it into the parent `content`;
  regression ADR-12), F3 (minor, resolved by F2 — `br` and `img` now recover
  tokenizer-attached text consistently). Blind-greens in
  `docs/specs/unit-u2-rich-decompose-greens.md` (35 scenarios / 36 vitest
  assertions — 35 pass, 0 fail, 0 skipped, authored from the docs ONLY, blind-run
  against the live module); proofreader pass (test-count 62→64 + the F1/F2
  host-fix records); documentation review in
  `archive/reviews/2026-08-28-u2-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (Unit U2 suite 64 pass; full suite
  1587 pass / 30 skip, 83 files, typecheck clean, build clean).
- **Unit T — markdown file import (initial-ingestion corpus → RAG store)
  (2026-08-28).** The markdown file import feature (the initial-ingestion
  framing, per the PROCEED-WITH-AMENDMENTS gate verdict + the user's ADJUSTED
  SCOPE — `docs/specs/markdown-import-review.md` §4/§5). A new PURE,
  node-testable module `src/main/markdown-parse.ts` exports
  `parseMarkdown(markdown: string, documentId: string): ParsedMarkdown` — a
  deterministic, TOTAL (never throws on malformed markdown; the ONLY throw is a
  caller error → `Error('markdown parse: markdown/documentId required')`) parser
  that maps markdown → RAG nodes/edges per the closed grammar (§5.2), the
  importer's deterministic heading→section chunking rule (R1–R9), the
  inline-children parse (§5.3, the closed `strong`/`em`/`a`/`img` union), the
  table rule (the additive `table`/`thead`/`tr`/`td`/`th` types), the URL-safety
  rules (inherited from Unit S), and the raw-HTML drop (A8). A new importer
  module `src/main/markdown-import.ts` exports
  `importMarkdownCorpus(ctx: EditOpContext, params: ImportMarkdownParams):
  Promise<ImportMarkdownResult>` — reads the corpus files (path-containment
  seam, `corpusRoot`), parses each via `parseMarkdown`, validates each
  document's doc-flow via `validateDocFlow` BEFORE commit, and applies the whole
  corpus via `applyBatch` as ONE atomic batch journal entry (putNode ops before
  putEdge ops). NEVER throws for a domain failure — returns the discriminated
  `{ ok: true, documentIds, nodeCount, edgeCount } | { ok: false, error,
  failedFile? }`. The `edit.import_markdown` MCP tool (default-off, `edit`
  group, main-handled, schema `z.array(z.string().min(1)).min(1)`, the corpus
  root FIXED server-side — the project root, NOT an agent-supplied arg) in
  `src/main/mcp-server.ts` + the `edit.import_markdown` TOOL_GROUPS entry in
  `src/main/security.ts`. The additive `RagNodeType` change 18→23
  (`table`/`thead`/`tr`/`td`/`th`) in `src/main/rag-store.ts` (the
  `RAG_NODE_TYPES` runtime set gains the 5 members; existing records still
  load). TestWriter red → Implementer green in
  `tests/unit-t-markdown-parse.test.ts` (RED marker: `src/main/markdown-parse.ts`
  did not exist → **26 green**) + `tests/unit-t-markdown-import.test.ts` (RED
  marker: `src/main/markdown-import.ts` did not exist → **18 green**); the red
  set = the 2 module-existence RED tests (module does not exist) → **40 green**
  total. Adversarial pass (RCA-3, two focused passes — security + edge-cases) in
  the spec §3a — **9 host findings ADV-1..ADV-9, all HOST (none package)**:
  ADV-1 (CRITICAL — `corpusRoot` was exposed as an MCP tool arg, defeating the
  path-containment seam; fixed: removed from the tool schema + handler, the
  containment root is FIXED server-side), ADV-2 (MEDIUM — TOCTOU: the importer
  realpath-checked but read the logical path; fixed: reads the REALPATH'D path),
  ADV-3 (LOW/MEDIUM — an unclosed inline raw-HTML element left its content as
  plain text; fixed: drops through end-of-input; regression test 10a), ADV-4
  (LOW — the zod schema did not enforce non-empty array of non-empty strings;
  fixed), ADV-5 (LOW — `isWithin` rejected everything when the root is `/`;
  fixed), ADV-6 (HIGH — `String.fromCodePoint` threw a RangeError on a numeric
  HTML ref > 0x10FFFF; fixed: guarded; regression test 10b), ADV-7 (HIGH — stack
  overflow on a deeply nested blockquote; fixed: `MAX_BLOCK_DEPTH`; regression
  test 10c), ADV-8 (HIGH — stack overflow on deeply nested inline; fixed:
  `MAX_INLINE_DEPTH`; regression test 10d), ADV-9 (MEDIUM — a re-import of a
  SHORTENED doc leaves stale nodes/edges orphaned; documented as a KNOWN
  LIMITATION of the one-shot design, not a defect). Blind-greens in
  `docs/specs/unit-t-markdown-import-greens.md` (47 scenarios — 47 pass, 0 fail,
  0 skipped); proofreader pass (the relative-path-vs-`corpusRoot` doc-ambiguity
  RESOLVED — §5.1/§5.4/fail-state 3b now pin that a RELATIVE `files` path
  resolves against the process CWD, not `corpusRoot`); documentation review in
  `archive/reviews/2026-08-28-unit-t-markdown-import-doc-review.md` (spec +
  greens + trackers reconciled against the build); trio green (1522 pass / 30
  skip, typecheck clean, build clean). Decisions landed: ONE-WAY-SNAPSHOT,
  MARKDOWN-EXPORT-ONLY-CARVE-OUT, TABLE-TYPES-ADDITIVE-STORE-FORMAT (see
  `docs/decisions.md`). **Inline-formatting-order defect catalogued (2026-08-29):**
  a formatted span that PRECEDES plain text (e.g. `**Proposal:** Astrographer…`)
  renders AFTER the content text — the `RagNodeChild` model (`content` = all
  plain text, `children` = all formatted spans) cannot represent interleaving
  order, and the provident-ssr framework renders `escapeText(content) + children`
  with no text/element interleaving. This is a PACKAGE limitation (not a host
  bug) — recorded as **`ENG-INLINE-ORDER`** in `docs/defects.md` +
  `docs/HANDOFF.md` (handled upstream, never patched here).
- **Unit S — paste-time sanitization (2026-08-28).** The RICH-TEXT-EDITING-GATE
  must-fix "paste-time sanitization". A new PURE, node-testable module
  `src/main/paste-sanitize.ts` exports `sanitizePastedHtml(rawHtml: string):
  SanitizePasteResult` — a deterministic, TOTAL (never throws for a string input)
  sanitizer that removes dangerous content and normalizes the surviving content
  into the `RagNodeChild[]` shape. The discriminated return
  `{ ok: true; html; content; children } | { ok: false; error }`; the ONLY
  fail-state is a non-string input → `{ ok: false, error: 'sanitizePastedHtml:
  input must be a string' }`. Removes 79 disallowed elements + the `fe*`
  wildcard + `a`-in-SVG-context; strips `on*`/dangerous-key attributes;
  validates URLs (http(s), relative, raster-only `data:image/*` for `img`);
  demotes unsafe/missing-`href` `a` to text, drops unsafe/missing-`src` `img`;
  folds `span` into the parent's content; hoists nested inline elements to
  siblings. TestWriter red → Implementer green in
  `tests/unit-s-paste-sanitization.test.ts` (RED marker: `src/main/paste-sanitize.ts`
  did not exist → **whole suite red → 46 green**; the 46 tests = the §5.6 32
  happy-path states + the §5.7 8 fail-states + the 1 module-existence RED + the
  5 adversarial regressions). Adversarial pass (RCA-3, two focused passes) in
  the spec §3a — **all HOST (none package)**: URL-F1 (CRITICAL — leading
  C0-control/space scheme bypass → XSS in the `html` output; fixed:
  `normalizeUrl` strips leading C0-control + space before the scheme test),
  URL-F2 (MEDIUM — the `data:image/*` carve-out admitted script-capable
  subtypes; fixed: raster-only), URL-F3 (MEDIUM — HTML character-reference
  smuggling survived in `props.href`; fixed: `decodeHtmlRefs` decodes before
  validation), TOK-F1 (MEDIUM — recursive normalization overflowed the stack on
  deeply-nested input, violating totality; fixed: iterative post-order
  traversal), TOK-F2 (LOW — O(n·m) re-lowercasing; fixed: lowercase once up
  front), TOK-F4 (LOW — `noembed`/`noframes` not in `DISALLOWED`; fixed).
  Blind-greens in `docs/specs/unit-s-paste-sanitization-greens.md` (46
  scenarios — 46 pass, 0 fail, 0 skipped); proofreader pass (test-count 40→46,
  raster-only carve-out, disallowed-element census 77→79); documentation review
  in `archive/reviews/2026-08-28-unit-s-doc-review.md` (CLEAN — no drift); trio
  green. Decisions landed: PASTE-SANITIZATION (see `docs/decisions.md`).
- **Unit R — traversal disambiguation of inline vs doc-children (2026-08-28).**
  The RICH-TEXT-EDITING-GATE must-fix "traversal disambiguation of inline vs
  doc-children". The traversal (`src/main/traversal.ts`) now renders the node's
  inline `children` (the Unit M `RagNodeChild[]` field) as child elements of the
  subtree root, disambiguated from doc-children by the `rag-` id prefix.
  `buildSubtree` renders each inline child as a same-type `LegacyNodeData`
  element (strong/em/a/img) with `content` + merged `props`, authored id
  `inline-<ragId>-<index>` (NOT `rag-`-prefixed, distinct from the textarea's
  `textarea-<ragId>`), ordered [inline children, textarea overlay, doc-children].
  Inline children get NO `rag-` id, are NOT in `materialized`, get NO backRefs
  entry, get NO lineMap range; doc-children ARE separate RAG subtree roots.
  `collectSubtreeIds`/`assignSubtreeRanges`/`rebuildBackRefs` are unchanged (the
  existing `rag-`-prefix logic handles the inline children). TestWriter red →
  Implementer green in `tests/unit-r-traversal-inline-children.test.ts` (RED
  marker: the inline-children rendering in `buildSubtree` did not exist →
  **15 red → 27 green**; the 27 tests = the §5.6 15 happy-path states + the §5.7
  8 fail-states + the 4 adversarial regressions F1/F2/F3/F4/F6). Adversarial
  pass (RCA-3) in the spec §3a — **all HOST (none package)**: F1/F2 (LOW, known
  behavior — multi-parent duplicate + section+doc-child double-materialization
  render duplicate `inline-<ragId>-<index>` ids across the envelope, mirroring
  the existing `rag-<id>` collision; documented + regression-tested), F3/F4/F6
  (LOW, test gaps — added regression tests for many inline children, the A5
  child-props precedence, and the fallback path with both inline + doc-children),
  F5 (INFORMATIONAL, deferred to Unit S — inline a/img props rendered
  unsanitized). Blind-greens in
  `docs/specs/unit-r-traversal-inline-children-greens.md` (27 scenarios — 27
  pass, 0 fail, 0 skipped); proofreader pass (test-count 23→27, §3a F1/F2
  reworded); documentation review in
  `archive/reviews/2026-08-28-unit-r-doc-review.md` (CLEAN — no drift); trio
  green. Decisions landed: INLINE-CHILDREN-AUTHORED-ID (see `docs/decisions.md`).
- **Unit Q — retrieval indexing of inline `children` text (2026-08-28).** The
  RICH-TEXT-EDITING-GATE must-fix "retrieval indexing of inline `children`
  text". The retrieval module (`src/main/retrieval.ts`) now indexes and renders
  the inline `children` text that Unit M landed on the data model. A new
  exported `nodeText(node)` helper returns a node's FULL searchable text
  (content + every inline child's content, space-joined after dropping empty
  strings); the three index builders
  (`createLexicalIndex`/`updateLexicalIndex`/`addToLexicalIndex`) tokenize
  `nodeText(node)` instead of `node.content`; the `renderNode`/`renderInlineText`
  renderer renders content + inline children (strong → `**…**`, em → `*…*`,
  a → `[…](href)`, img → `![alt](src)`). `place`/`retrieve`/`createRetrieval`
  are unchanged in shape (they route through the index). TestWriter red →
  Implementer green in `tests/unit-q-retrieval-children-indexing.test.ts` (RED
  marker: the `nodeText` export + the amended index builders + the renderer did
  not exist → **19 red → 25 green**; the 25 tests = the §5.6 20 happy-path
  states + the §5.7 5 fail-states + the 2 adversarial regressions F1/F2).
  Adversarial pass (RCA-3) in the spec §3a — **2 host findings F1/F2, all HOST
  (none package)**: F1 (LOW — `renderInlineText` did not drop empty-content
  children, rendering `****`/`[]()` markers; fixed: skips empty-content
  children), F2 (LOW — a non-string `href`/`src` rendered garbage; fixed:
  coerced to string). Blind-greens in
  `docs/specs/unit-q-retrieval-children-indexing-greens.md` (25 scenarios — 25
  pass, 0 fail, 0 skipped); proofreader pass (test-count 23→25, renderer code
  block, cross-ref); documentation review in
  `archive/reviews/2026-08-28-unit-q-doc-review.md` (CLEAN — no drift); trio
  green (1478 pass / 30 skip, typecheck clean, build clean). Decisions landed:
  NODETEXT-SPACE-JOIN, RENDER-DIRECT-CONCAT (see `docs/decisions.md`).
- **Unit P — the `IPC_EDIT_BATCH` IPC channel (a batch of edits to the RAG
  store) (2026-08-28).** The RICH-TEXT-EDITING-GATE batch channel — the
  renderer→main IPC channel that carries a batch of `BatchOp` values to the
  store, applied atomically via the `applyBatch` transaction primitive (Unit N)
  and consuming the three rich-text ops (Unit O). The `IPC_EDIT_BATCH =
  'provident:edit-batch'` constant + the `EditBatchPayload { ops: BatchOp[] }`
  type in `src/shared/types.ts`; the `bridge.edit.batch(ops): Promise<BatchResult>`
  preload method in `src/main/preload.ts`; the `ipcMain.handle(IPC_EDIT_BATCH, ...)`
  handler in `src/main/main.ts` (validates the payload, captures the pre-batch
  node snapshot, calls `handleEditBatch`, broadcasts `rag-store-changed` EXACTLY
  ONCE on success, 0 on failure); the `handleEditBatch` shared handler + the
  `deriveBatchBroadcast` pure helper in `src/main/edit-ops.ts` (moved out of
  `main.ts` so it is node-testable without importing electron). The channel is
  MCP/UI-equivalent (§8.2 BINDING) — the same batch reachable via the MCP
  `edit.batch` tool (forward-looking wiring) and the UI IPC, both routing through
  the same `applyBatch` primitive. TestWriter red → Implementer green in
  `tests/unit-p-ipc-edit-batch.test.ts` (RED marker: the `IPC_EDIT_BATCH`/
  `EditBatchPayload`/`BatchResult` + the `handleEditBatch`/`deriveBatchBroadcast`
  + the `bridge.edit.batch` did not exist → **19 red → 19 green**; the 19 tests =
  the §5.6 8 happy-path states + the §5.7 10 fail-states + the export check).
  Adversarial pass (RCA-3) in the spec §3a — **4 host findings F1–F4, all HOST
  (none package)**: F1 (HIGH — `deriveBatchBroadcast` was untested and the greens
  doc made an unbacked coverage claim; fixed: moved it + the `sameOwned` helper
  out of `main.ts` into `edit-ops.ts` + added a direct regression set), F2 (LOW —
  `deriveBatchBroadcast` dereferenced `result` without a guard; fixed: guarded
  `result`), F3 (LOW — stale RED-state header/name in the test file; fixed),
  F4 (LOW, note — redundant payload validation in the main handler; accepted as
  defense-in-depth). The 9 adversarial regression tests (F1a–F1i) bring the
  suite to **28 green**. Blind-greens in
  `docs/specs/unit-p-ipc-edit-batch-greens.md` (18 scenarios — 18 pass, 0 fail,
  0 skipped, authored from the docs ONLY, blind-run against the live modules);
  proofreader pass (7 fixes); documentation review in
  `archive/reviews/2026-08-28-unit-p-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (1380 tests, typecheck clean, build
  clean). Decisions landed: IPC-EDIT-BATCH (see `docs/decisions.md`).
- **Unit O — the rich-text edit ops (`setProps`/`setSubtree`/`setType`)
  (2026-08-28).** The final RICH-TEXT-EDITING-GATE must-fix item that lands the
  edit-op census 6→9 — the three rich-text edit ops on the edit-ops layer
  (`src/main/edit-ops.ts`). `setProps` MERGES props onto a node (only the named
  keys update; the existing props including the `data-doc-head` marker are
  preserved — the `setProps` edit op the user chose, Option A); `setSubtree`
  replaces a node's inline `children` (the Unit M `RagNodeChild[]` field) with a
  new array (a FULL replace, no merge/append); `setType` changes a node's `type`
  NEVER delete+create (the node's id/content/children/props/ownedNodeIds are all
  preserved; only `type` changes). Each op is a single atomic edit (a single
  `putNode` write, or a single-op `applyBatch` from Unit N), returns the
  discriminated `SetPropsResult`/`SetSubtreeResult`/`SetTypeResult`, and NEVER
  throws for a domain failure. The census 6→9: the edit-op count goes from 6
  (`setContent`/`createNode`/`deleteNode`/`splitNode`/`mergeNode`/`setEdge`) to 9
  (adding `setProps`/`setSubtree`/`setType`) — the RICH-TEXT-EDITING-GATE
  "census 6→9" must-fix is now MET. TestWriter red → Implementer green in
  `tests/unit-o-edit-ops.test.ts` (RED marker: the three ops + the three result
  types did not exist → **19 red → 23 green**; the 23 tests = the §5.7 10
  happy-path states + the §5.8 8 fail-states + the 4 adversarial regressions
  F1/F2/F3a/F3b). Adversarial pass (RCA-3) in the spec §3a — **6 host findings
  F1–F6, all HOST (none package)**: F1 (LOW — `setProps` empty-merge on a node
  with `props: undefined` was NOT a no-op; fixed: an empty merge is a no-op
  regardless of the prior props), F2 (LOW — `setSubtree` accepted
  `children: undefined` as valid; fixed: rejects `undefined` explicitly, only
  `[]` clears children), F3 (LOW — test-coverage gaps for the adversarial edge
  cases; fixed: added regression tests), F4 (LOW — unbounded recursion in
  `hasDangerousKey` on deeply-nested props/children, a `RangeError` DoS; fixed:
  depth-bounded at > 100), F5 (LOW, OBSERVATION — read-modify-write lost-update
  race across concurrent ops; a PRE-EXISTING pattern shared with the six existing
  ops, NOT a Unit O regression; documented as an accepted limitation), F6 (LOW —
  a `setProps` that changes no key and a same-type `setType` were NOT no-ops;
  fixed: both are no-ops — no write, no journal entry). Blind-greens in
  `docs/specs/unit-o-edit-ops-greens.md` (18 scenarios — 18 pass, 0 fail, 0
  skipped, authored from the docs ONLY, blind-run against the live modules);
  documentation review in `archive/reviews/2026-08-28-unit-o-doc-review.md`
  (spec + greens + trackers reconciled against the build); trio green (1352
  tests, typecheck clean, build clean). Decisions landed: RICH-TEXT-EDIT-OPS
  (see `docs/decisions.md`).
- **Unit N — batch atomicity (a real transaction on the `RagStore`)
  (2026-08-28).** The RICH-TEXT-EDITING-GATE must-fix "batch atomicity (a real
  transaction, not `store.enqueue`)" — the batch/transaction primitive the
  rich-text ops (Unit O) and `IPC_EDIT_BATCH` (Unit P) build on. The `RagStore`
  interface in `src/main/rag-store.ts` gains the NEW `applyBatch(ops: BatchOp[]):
  Promise<BatchResult>` method + the `BatchOp`/`BatchOpResult`/`BatchResult`
  types. The `BatchOp` union is CLOSED at 7 members — the 4 store primitives
  (`putNode`/`removeNode`/`putEdge`/`removeEdge`, applied by THIS unit) + the 3
  forward-looking rich-text ops (`setProps`/`setSubtree`/`setType`, applied by
  Unit O — a batch containing one is a documented fail-state in THIS unit). A
  successful batch applies all ops ATOMICALLY (all or nothing), lands as a SINGLE
  invertible `batch` journal entry (undo/redo restores the whole batch as a
  unit), and persists ONCE; a failed batch ROLLS BACK the in-memory state to
  the pre-batch snapshot, does NOT pollute the journal, and does NOT persist.
  Serialized through the single-writer queue; re-entrant (the `inQueue` pattern,
  no deadlock). `applyBatch` NEVER throws for a domain failure — it returns the
  discriminated `BatchResult` (`{ ok: true, results }` / `{ ok: false, error,
  failedIndex }`). The `batch` journal kind slots into the `JournalEntry` union +
  the `isValidJournalEntry` boot validator (a malformed `batch` entry is SKIPPED
  at boot); the new `isValidBatchOp` validator gates the `ops`/`inverse` arrays.
  TestWriter red → Implementer green in `tests/unit-n-batch-atomicity.test.ts`
  (RED marker: the `applyBatch` method + the `BatchOp`/`BatchOpResult`/
  `BatchResult` types + the `batch` journal kind + the `isValidBatchOp`/
  `isValidJournalEntry` amendments did not exist → **25 red → 25 green**; the 25
  tests = the §5.7 14 happy-path states + the §5.8 11 fail-states). Adversarial
  pass (RCA-3) in the spec §3a — **5 host findings F1–F5, all HOST (none
  package)**: F1 (MEDIUM — a `null`/`undefined` op in the array threw a
  `TypeError` instead of returning `{ ok: false }`, leaking a partial mutation;
  fixed: the op loop is wrapped in `try/catch`, an unexpected throw restores the
  snapshot and returns `{ ok: false, error: 'rag applyBatch: unexpected failure',
  failedIndex: -1 }`), F2 (LOW-MEDIUM — `applyBatch(null)`/`applyBatch(undefined)`
  threw at `ops.length`; fixed: `applyBatchSync` rejects a non-array `ops` with
  `{ ok: false, error: 'rag applyBatch: ops must be an array', failedIndex: 0 }`),
  F3 (LOW — the journal `batch` entry stored the RAW caller ops, so `redo()`
  diverged from the original batch; fixed: the forward ops persisted are the
  APPLIED records), F4 (LOW — the `removeNode` cascade inverse edges were not
  reverse-ordered; fixed: the cascaded-edge inverse array is reversed before
  pushing), F5 (LOW/INFORMATIONAL — the snapshot deep-copied the entire store on
  every batch, even empty; fixed: an empty batch is a valid no-op that skips the
  snapshot). Blind-greens in `docs/specs/unit-n-batch-atomicity-greens.md` (25
  scenarios — 25 pass, 0 fail, 0 skipped, authored from the docs ONLY, blind-run
  against the live modules); documentation review in
  `archive/reviews/2026-08-28-unit-n-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (1329 tests, typecheck clean, build
  clean). Decisions landed: BATCH-ATOMICITY-API (see `docs/decisions.md`). The
  edit-op census 6→9 is Unit O, NOT this unit — this unit adds NO edit op (the
  current count 6: `setContent`/`createNode`/`deleteNode`/`splitNode`/`mergeNode`/
  `setEdge` is unchanged).
- **Unit M — the `children` field on `RagNode` (2026-08-28).** The store-format
  `children` additive + hash-source must-fix (RICH-TEXT-EDITING-GATE) — the
  persistence-layer foundation the rich-text machinery builds on. The `RagNode`
  interface in `src/main/rag-store.ts` gains the NEW optional
  `children?: RagNodeChild[]` field + the `RagNodeChild`/`RagNodeChildType`
  types (the closed 4-member union `strong`/`em`/`a`/`img`; `span` NOT a member
  and NOT added to `RagNodeType` — the 18-member union is UNCHANGED).
  `nodeSource` includes `children` in the fixed field order (after `content`,
  before `props`), so the SHA-256 hash covers the inline children (a `children`
  change → a new hash; a tampered `children` → QUARANTINED at boot).
  `validateNodeShape` validates `children` at write (throw) and boot (skip);
  the journal content-entry snapshot carries before/after `children`; the
  internal copy paths (`toPublicNode`/`insertNode`/`setNodeFields`/
  `applyInverse`/`applyForward`) deep-copy `children`. The store-format change
  is ADDITIVE — existing records without `children` still load and hash-verify
  (a missing `children` serializes identically to `children: undefined`), no
  migration/re-hash. TestWriter red → Implementer green in
  `tests/unit-m-children-field.test.ts` (RED marker: the `children` field +
  `RagNodeChild`/`RagNodeChildType` + the `nodeSource`/`validateNodeShape`/
  journal/copy-path amendments did not exist → **20 red → 22 green**; the 22
  tests = the §5.6 12 happy-path states + the §5.7 10 fail-states). Adversarial
  pass (RCA-3) in the spec §3a — **5 host findings F1–F5, all HOST (none
  package)**: F1 (MEDIUM — `isContentSnapshot` did not apply the
  prototype-pollution guard to `props`; fixed), F2 (LOW — `isRagNode` was weaker
  than `validateNodeShape`; fixed to mirror it), F3 (LOW — `hasDangerousKey`
  false-positived on non-plain objects; fixed to scope to actual `__proto__`
  pollution), F4 (LOW — a dangerous key on the child ITSELF was silently
  stripped; fixed to reject), F5 (INFORMATIONAL — `__proto__` with a
  primitive/null value bypasses `hasDangerousKey`; no fix required). Blind-greens
  in `docs/specs/unit-m-children-field-greens.md` (22 scenarios — 22 pass, 0
  fail, 0 skipped, authored from the docs ONLY, blind-run against the live
  modules); documentation review in
  `archive/reviews/2026-08-28-unit-m-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (Unit M suite 22 pass, typecheck
  clean, build clean). Decisions landed: CHILDREN-ADDITIVE-STORE-FORMAT,
  CHILDREN-HASH-SOURCE (see `docs/decisions.md`).
- **Unit L — the form-control textarea editing UI (2026-08-28).** The deferred
  rendering follow-up (Unit D §3a H5) that makes the RAG node content editable
  in the live app via a provident-rendered textarea. The traversal
  (`src/main/traversal.ts` `buildSubtree`) authors a `textarea` child of each
  RAG subtree root (bound to the RAG node's content via the back-reference map;
  the subtree root's `content` is KEPT — Conflict C resolution: the textarea is
  a RENDER-ONLY editing overlay present in the DOM render view, NOT in the
  markdown). The `onInput`/`onBlur` handlers reach the edit controller through
  the `window.provident.sidebar` bridge surface (extended with
  `textareaInput`/`textareaBlur` — the Unit K §5.3 M2 pattern); `onInput` →
  `markDirty`, `onBlur` → if dirty `commit` (routing through the SAME
  `edit-commit` IPC → `setContent` op as the MCP `edit.set_content` tool —
  MCP/UI equivalence). The `readOnly` prop is HOST-SET at render time from
  `editController.isEditable(ragId)` (dangling back-reference → read-only). The
  caret is saved on blur (`saveCaret`, `focused: dirty` — H3) and restored
  after a re-derive (one-shot — H2). The dirty-edit guard queues a re-derive
  while the textarea is dirty. TestWriter red → Implementer green in
  `tests/unit-l-textarea-editing-ui.test.ts` (RED marker: the textarea
  authoring/handlers/readOnly/caret did not exist → **25 active pass / 7
  skipped**; the 7 skipped are the Electron/DOM-dependent §5.8 13–16 + §5.9 8–10
  cases, verified by code review / the e2e battery). Adversarial pass (RCA-3)
  in the spec §3a — **6 host findings H1–H6, all HOST (none package)**: H1
  (CRITICAL — `readOnly: false` rendered as the `readonly` boolean attribute,
  making the textarea uneditable; fixed: the traversal omits `readOnly`,
  `setTextareaReadOnly` sets `true` only when `!isEditable`), H2 (caret restore
  was not one-shot — now removed after a successful restore), H3 (a no-op blur
  saved `focused: true`, stealing focus — now `focused: dirty`), H4
  (`setTextareaReadOnly` mutated the shared traversal envelope — now idempotent
  across re-assembles), H5 (a node deleted while dirty permanently blocked
  re-derives — `commit` now clears the dirty flag on a `deleted-node` result),
  H6 (MCP `dispatch` of `blur` ignored the dispatch `value` arg — the blur body
  now prefers a dispatch-provided value, falling back to the DOM textarea's
  current value). Blind-greens in
  `docs/specs/unit-l-textarea-editing-ui-greens.md` (32 scenarios — 25 pass, 0
  fail, 7 skipped, authored from the docs ONLY, blind-run against the live
  modules); documentation review in
  `archive/reviews/2026-08-28-unit-l-doc-review.md` (spec + greens + trackers
  reconciled against the build — the greens H1/H6 `readOnly: false` and H8
  `focused: true` claims fixed to match the spec's OMITTED/`focused: dirty`
  contract); trio green (Unit L suite 25 pass / 7 skip, typecheck clean, build
  clean). Decisions landed: TEXTAREA-PROVIDENT-AUTHORING,
  TEXTAREA-BRIDGE-SURFACE, TEXTAREA-READONLY-HOST-SET,
  NAME-REFERENCED-HANDLER-RESOLUTION, TEXTAREA-RENDER-ONLY-OVERLAY (see
  `docs/decisions.md`).
- **Unit K — SidebarPanes renderer host (2026-08-28).** The UI-mount work that
  closes the deferred L1/L2/I1/I2 findings: the `SidebarPanes` host in
  `src/renderer/sidebar-panes.ts` wires the store→traversal→pane-assembly→render
  pipeline into the live renderer. `boot(runtime)` replaces the `demoEnvelope()`
  bootstrap with the pane-inclusive envelope (fetch snapshot + stored template →
  derive document ids → `buildTraversal` → `assembleAppGraphEnvelope` → load into
  the app Runtime), so the RAG content + the app-graph panes are MCP-visible by
  construction. The host owns the current-document/node state (M5); the edit
  controller's `onRebuild` IS the host's `reDerive` (the SOLE subscription —
  `rag-store-changed`/`template-changed` → dirty-edit guard → re-derive, with
  in-flight coalescing). `registerPanes()` registers the four app-graph panes
  (doc-nav/crosslinks/search/template-editor) + the operator `settings` pane;
  `bindHandlers()` registers the handler defs; the operator settings pane mounts
  in an isolated `createIsolatedScope()` GraphScope (`#operator-panes`, M3),
  never MCP-visible. TestWriter red → Implementer green in
  `tests/sidebar-panes-host.test.ts` (RED marker: `src/renderer/sidebar-panes.ts`
  missing → **49 active pass / 7 skipped**; the 7 skipped are the
  Electron/DOM-dependent §5.8 16–20 + §5.9 10–11 cases, verified by code review
  / the e2e battery). The last 3 red tests (#1/#2/#4) were a **spec conflict**
  (the spec pinned `currentDocumentId`/`currentNodeId` as read-only accessors;
  the tests required host-owned state) — resolved by amending the spec §5.6 M5
  (the host owns the state; `buildContext()` reads host-owned state; the
  accessors removed), tracked in `docs/unit-k-test-resolution-tracker.md` (all
  9 resolved). Adversarial pass (RCA-3) in the spec §3a — **11 host findings
  F1–F11, all HOST (none package)**: F1 (re-derive wiring not connected — the
  renderer's `onRebuild` was a leftover Unit-D closure; fixed to
  `host.reDerive()` + the duplicate subscription removed), F2 (stale M13 security
  cache — refreshed on re-derive), F3 (fail-closed template gate left a permanent
  dirty flag — the gate now runs before `markDirty`), F4 (operator `topK` ignored
  — now feeds `bridge.rag.query`), F7 (search re-render bypassed the dirty-edit
  guard — now skipped while `anyDirty()`), F8 (`selectDocument` accepted a bogus
  id — now validated against `doc-head` targets), F10 (malformed `''` dispatch on
  a null event — now a no-op), F11 (`deriveDocumentIds` threw on a malformed
  snapshot — now guarded); F5/F6/F9 recorded as LOW (double-load, boot-time
  subscription window, operator scope re-mount) — not fixed (perf/leak only).
  Blind-greens in `docs/specs/unit-k-sidebar-panes-host-greens.md` (57
  scenarios, all pass — authored from the docs ONLY, blind-run against the live
  modules); proofreader pass (fixed stale test-counts, phantom `currentNodeId()`
  accessor refs, the `refresh()` over-claim, the renderer-wiring claim);
  documentation review in `archive/reviews/2026-08-28-unit-k-doc-review.md`
  (spec + greens + trackers reconciled against the build — 15 stale entries
  fixed); trio green (test 1257 pass / 23 skip, typecheck clean, build clean).
  Decisions landed: UI-MOUNT-BOOT, UI-MOUNT-RE-DERIVE, UI-MOUNT-PANE-REGISTRATION,
  UI-MOUNT-OPERATOR (see `docs/decisions.md`).
- **Unit J — MCP/security hardening (2026-08-28).** The completion/hardening
  pass over the `rag`/`edit`/`code.template.*` tool groups + the MCP↔UI
  equivalence surface. It AUDITS the five-seam gate (completeness, default-off,
  read-vs-mutating split), the equivalence surface (every MCP tool with a UI IPC
  counterpart routes through the SAME handler), the renderer switch (fails
  closed on unknown methods), and `MUTATING_METHODS` (covers every mutating
  method). Pins the hardening as a VERIFICATION CONTRACT (the invariants (a)–(f)
  in `docs/specs/unit-j-mcp-security-hardening.md` §5.2) + the full tool
  inventory (17 `rag`/`edit`/`code.template.*` tools) + the equivalence mapping
  (§5.4). TestWriter red: **EMPTY** (the verification contract — no new
  behavior to red-test; the invariants are verified against the already-
  implemented Units B/D/E/G/I surfaces) → the committed verification-contract
  test in `tests/mcp-security-hardening.test.ts` (audits the invariants (a)–(f)
  + the 17-tool inventory + the equivalence mapping + §5.8/§5.9/§5.10; the red
  set is what would FAIL if an invariant did not hold — the audit finds none);
  blind-greens in `docs/specs/unit-j-mcp-security-hardening-greens.md` (60
  scenarios, all pass); adversarial pass (RCA-3) in the spec §3a — **NO host
  findings**, three LOW/informational observations (none fix-required, none in
  Unit J's scope); documentation review in
  `archive/reviews/2026-08-28-unit-j-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (test + typecheck + build).
- **Unit I — template customization (2026-08-28).** The content-window template
  as a stored, customizable value + the `code.template.*` CRUD + the
  template-editor pane. `src/main/template-shape.ts` (pure, no Electron): the
  `ContentWindowTemplate` shape + `DEFAULT_CONTENT_WINDOW_TEMPLATE` (the FIXED
  `wiki-root` + one `main` zone) + `validateTemplate` (the zone-consistency
  invariant — `invalid-shape`/`missing-zone`). `src/main/template-store.ts`
  (pure over `node:fs`): `createTemplateStore` (the 4 methods `get`/`set`/
  `reset`/`status` + the `readonly targetedZones` property; fail-disabled boot;
  atomic temp+rename persistence; deep-copy `get` + copy `targetedZones` — the
  I4/I5 adversarial fixes). The `code.template.*` CRUD (six tools, ALL in the
  `code` group default-off, main-handled) + `handleTemplateTool` in
  `src/main/mcp-server.ts` (the shared MCP/UI-equivalence handler; `create`/
  `delete` orchestrated on the single validated `set` path); the `code`
  TOOL_GROUPS in `src/main/security.ts`; the `TraversalInput.template`
  amendment + the zone-producer defense-in-depth in `src/main/traversal.ts`;
  the `template` bridge in `src/main/preload.ts`; the template-editor pane
  (`createTemplateEditorPane` + `TEMPLATE_PANE_ID`) in
  `src/renderer/template-pane.ts`; the `IPC_TEMPLATE_*` channels +
  `TemplateChangedPayload` in `src/shared/types.ts`; the template IPC wired in
  `src/main/main.ts`. TestWriter red → Implementer green in
  `tests/template.test.ts` (RED marker: `src/main/template-store.js` +
  `src/renderer/template-pane.js` did not exist; the traversal/mcp-server/
  security/types amendments RED → 48 node-tested tests pass; §5.8 14–16 / §5.9
  12 are renderer-dependent, skipped by design and verified by code review);
  adversarial pass in `tests/template-adversarial.test.ts` (6 regression tests
  — host findings I3–I5 fixed + regression-tested, recorded in the spec §3a;
  no unauthorized-access finding — the six `code.template.*` names map to the
  `code` group default-off, the renderer switch has no `code.template.*` cases,
  and `MUTATING_METHODS` excludes them; I1/I2 deferred to the UI mount per the
  spec §3a — the `template-changed` re-derive wiring + the pane registration
  land with the `SidebarPanes` renderer host); blind-greens in
  `docs/specs/unit-i-template-greens.md` (45 scenarios, all pass);
  documentation review in `archive/reviews/2026-08-28-unit-i-doc-review.md`
  (spec + greens + trackers reconciled against the build); trio green (test +
  typecheck + build).
- **Unit H — sidebar panes (2026-08-28).** The host-side pane registry +
  the app-graph-vs-operator scope split. `src/renderer/pane-registry.ts` (pure,
  no Electron): `PaneScope`/`PaneDefinition`/`PaneContext`/`PaneChange`/
  `PaneRegistry` + `createPaneRegistry` (the 9 methods `register`/`get`/`list`/
  `listByScope`/`isEnabled`/`enable`/`disable`/`setEnabled`/`onChanged`; the
  registered-DISABLED default; the documented throw patterns — §5.1/§5.8/§5.9).
  `src/renderer/pane-graph.ts` (pure): `SIDEBAR_ZONE` +
  `paneSubtreeRoot`/`assembleAppGraphEnvelope`/`buildOperatorEnvelope` (§5.2 —
  the HARD PRECONDITION `sidebar` container producer, operator-pane exclusion,
  id/placement forcing, the operator-envelope shape) + the §5.3 data-flow
  helpers `deriveDocNavDocuments`/`docNavContent`/`crosslinksContent`/
  `searchContent`. TestWriter red → Implementer green in
  `tests/sidebar-panes.test.ts` (RED marker: `src/renderer/pane-registry.js` +
  `pane-graph.js` did not exist → 48 node-tested tests pass; §5.8 22–25 /
  §5.9 15–16/18 are renderer-dependent, skipped by design and verified by code — the renderer host (`src/renderer/sidebar-panes.ts` — the
   `SidebarPanes` `loadAppGraph`/`mountOperator`/`refresh` + the `renderer.ts`
   pane wiring) is a DOCUMENTED DEFERRAL per the spec §3a: Unit H landed the
   PURE modules only (`pane-registry.ts` + `pane-graph.ts`); the isolated-
   GraphScope renderer mount lands with the UI mount
  review); adversarial pass in `tests/sidebar-panes-adversarial.test.ts` (12
  regression tests — host findings H1–H4/H6 fixed + regression-tested, recorded
  in the spec §3a; no unauthorized-access finding — the operator-isolation seam
  is enforced at the assembly layer); blind-greens in
  `docs/specs/unit-h-sidebar-panes-greens.md` (61 scenarios, all pass);
  documentation review in `archive/reviews/2026-08-28-unit-h-doc-review.md`
  (spec + greens + trackers reconciled against the build); trio green (test +
  typecheck + build).
- **Unit G — crosslink/backlink (2026-08-27).** The backend crosslink/backlink
  mechanism. `src/main/backlinks.ts` (pure, no Electron — operates on the
  `RagStore` interface, Unit A §5.4): the `LinkScope`/`LinkEntry`/`BacklinkResult`
  shapes + `listBacklinks`/`listOutlinks`/`enumerateLinks` + the `documentOf`
  helper + the scope classification (cross-document / intra-document / unscoped)
  (§5.3). The `crosslink` RAG edge kind in `src/main/rag-store.ts` (`RagEdgeKind`
  + the per-kind field enforcement — `order` only on `doc-child`, `documentIds`
  on any kind) (§5.1). `CROSSLINK_LINK_CONFIG` + the `crosslinks:
  CrosslinkWiring[]` output + outgoing-only materialization in
  `src/main/traversal.ts` (`buildTraversal`) (§5.2). The `rag.backlinks` MCP tool
  FULL handler + `handleRagBacklinksIpc` in `src/main/mcp-server.ts` (MCP/UI
  equivalence — §5.4/§8.2). The `'crosslink'` kind in `src/main/edit-ops.ts`
  (`setEdge`) (§5.6). `IPC_RAG_BACKLINKS`/`RagBacklinksPayload`/
  `RagBacklinksResult` in `src/shared/types.ts`; the `rag-backlinks` IPC wired in
  `src/main/main.ts` + `rag.backlinks` on the preload bridge
  (`src/main/preload.ts`). TestWriter red → Implementer green in
  `tests/crosslink-backlink.test.ts` (RED marker: `src/main/backlinks.ts` did not
  exist → 40 tests pass); adversarial pass in
  `tests/crosslink-backlink-adversarial.test.ts` (6 regression tests — host
  findings G1/G2 fixed + regression-tested, recorded in the spec §3a); blind-
  greens in `docs/specs/unit-g-crosslink-backlink-greens.md` (38 scenarios, all
  pass); documentation review in
  `archive/reviews/2026-08-27-unit-g-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (test + typecheck + build).
- **Unit F — vector embeddings (provider/model agnostic) (2026-08-27).**
  `src/main/embeddings.ts` (pure + async, no Electron — the HTTP call is a
  plain fetch to the configured endpoint): the `EmbeddingProvider` abstraction
  + `EmbeddingProviderConfig` config shape (§5.2 — provider/model AGNOSTIC,
  the PROVIDER-AGNOSTIC binding decision), the ollama `embeddinggemma` concrete
  provider (the local test environment, localhost-pinned), the remote/cloud
  provider drop-in (OpenAI/Cohere/etc. via the SAME interface + config, with
  the `connect-src` CSP allowlist + API-key handling — a DESIGNED security
  surface), the vector index (§5.3 — node id → embedding, maintained
  incrementally on store change), cosine similarity scoring (§5.4), the vector
  embedder behind the async-amended `Embedder` interface (§5.5), the
  deterministic mock embedder + the real-ollama integration path + the mocked
  remote/cloud path (§5.6). The async `Embedder` interface amendment (Unit E
  contract amendment — §5.1) ripples through `src/main/retrieval.ts`
  (`selectTopK`/`retrieve`/`RetrievalEngine.query`/`RetrievalEngine.onStoreChanged`
  all async; the engine forwards `onStoreChanged` to the embedder's hook). The
  `retrieval.embedder: 'lexical' | 'vector'` selection in `src/main/main.ts`
  (§5.7 — default 'lexical'; 'vector' reads the REQUIRED
  `retrieval.embeddingProvider` config and creates the vector embedder; a
  missing config FAILS, never silently falls back to lexical). `rag.query`/
  `rag-query` both use the SAME maintained engine (MCP/UI equivalence — §8.2).
  TestWriter red → Implementer green in `tests/embeddings.test.ts` (RED marker:
  `src/main/embeddings.ts` did not exist → 57 tests pass) + the async-amendment
  test in `tests/retrieval.test.ts` (the engine's `onStoreChanged` forwards to
  the embedder hook); adversarial pass in `tests/embeddings-adversarial.test.ts`
  (13 regression tests — host findings F1–F9 fixed + regression-tested,
  recorded in the spec §3a); blind-greens in
  `docs/specs/unit-f-embeddings-greens.md` (79 scenarios, all pass — the F33
  spec-vs-impl drift was resolved by correcting the spec §5.9 F33);
  documentation review in
  `archive/reviews/2026-08-27-unit-f-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (test + typecheck + build).
- **Integration adversarial pass (2026-08-27, before Unit G).** A broad
  cross-unit review (RCA-3) checked whether the LATER units (D/E/F) introduced
  integration defects on the EARLIER units (A/B/C) and the cross-unit seams.
  All findings HOST, fixed + regression-tested (14 tests in
  `tests/integration-adversarial.test.ts`): **I1** (MCP `edit.*` broadcast on
  the wrong IPC channel — now on the `IPC_RAG_STORE_CHANGED` constant), **I2**
  (`mergeNode` rejects a doc-flow-role/mid-chain source — preserves doc-flow
  validity), **I3** (renderer `onRebuild` wired to a real `buildTraversal`
  re-materialization via `IPC_RAG_SNAPSHOT` + `rebuildBackRefs`), **I4**
  (`edit-commit` maps `node not found` to `deleted-node`), **I5**
  (`handleEditTool` passes raw malformed inputs to the ops). Seams verified
  clean: the async `Embedder` migration, the `rag.query`/`rag-query` MCP/UI
  equivalence, the `retrieval.embedder` selection, and the `RagStore` interface
  usage. Record: `archive/reviews/2026-08-27-integration-adversarial.md`. Trio
  green (974 pass).
- **Look-back adversarial pass (2026-08-28, after Unit J).** A broad cross-unit
  review (RCA-3) over all units A–J checked the store→traversal→pane-assembly→
  render pipeline, the editing→re-traversal path, the retrieval→render path,
  the MCP/UI equivalence, and the shared types/IPC wiring. All findings HOST,
  fixed + regression-tested (10 tests in `tests/lookback-adversarial.test.ts`):
  **L3** (the `rag`/`edit` groups were unreachable — `security-store.ts` +
  `secure-panels.ts` omitted them, and `applyGatePatch` used the raw patch →
  live/persisted divergence; fixed: added the groups + the gate now consumes the
  store-filtered result), **L4** (`rag.get_document` returned the whole store,
  not the document's subtree — fixed: document-subtree scoping), **L5** (the
  traversal `lineMap` ranges were computed from standalone subtree renders, not
  the real envelope markdown — fixed: anchored to the single full-envelope
  render). Seams verified clean: the MCP/UI equivalence (every tool with a UI
  IPC counterpart routes through the same handler), the five-seam gate, the
  `edit-commit` deleted-node race. **Deferred (the `SidebarPanes` renderer host,
  Unit H §3a):** **L1** (the store→traversal→pane-assembly→render pipeline is
  not wired into the live renderer — the app bootstraps with `demoEnvelope()`,
  so the RAG content + app-graph panes are not MCP-visible) and **L2** (the
  D→C re-traversal only updates the backRefs map, never re-renders the RAG
  content). These are the remaining UI-mount work. Trio green (1208 pass).
- **Unit D — editable text (form-control editing) (2026-08-27).** The `edit.*`
  tool handlers (Unit B registered them through the five-seam gate; Unit D
  implements the FULL behavior) in `src/main/edit-ops.ts` (pure ops over the
  `RagStore` interface — `setContent`/`createNode`/`deleteNode`/`splitNode`/
  `mergeNode`/`setEdge`) + `src/main/mcp-server.ts` `handleEditTool` (thin
  validators calling the ops, broadcasting `rag-store-changed` after a
  successful mutation); the edit controller in `src/renderer/edit-controller.ts`
  (`createEditController`: dirty-edit guard, caret/focus preservation, dangling
  back-reference → read-only, MCP/UI equivalence); the `edit-commit` IPC +
  `rag-store-changed` re-traversal trigger wired in main/preload/renderer.
  TestWriter red → Implementer green in `tests/edit-ops.test.ts` (23 tests) +
  `tests/edit-controller.test.ts` (14 tests); adversarial pass in
  `tests/edit-adversarial.test.ts` (27 regression tests — host findings
  H1-H5/M1-M9/L1-L6 fixed + regression-tested, recorded in the spec §3a);
  blind-greens in `docs/specs/unit-d-editing-greens.md` (38 scenarios, all
  pass); documentation review in
  `archive/reviews/2026-08-27-unit-d-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (test + typecheck + build).
- **Unit E — RAG index + retrieval (2026-08-27).** `src/main/retrieval.ts`
  (pure, no Electron — operates on the `RagStore` INTERFACE, Unit A §5.4):
  tokenization + the lexical index (§5.1 — `tokenize`/`DEFAULT_STOPWORDS`/
  `createLexicalIndex`/`updateLexicalIndex`/`addToLexicalIndex`/
  `removeFromLexicalIndex`), the interface-swappable `Embedder` + the lexical
  (BM25) implementation (§5.2 — `createLexicalEmbedder`, `score`, `place`,
  `PLACEMENT_MIN_SCORE`), selection (§5.3 — `selectTopK`), bounded graph
  traversal for context assembly + the coarse line→node map (§5.4 —
  `assembleContext`), the retrieval entry point (§5.5 — `retrieve`), and the
  maintained retrieval engine (§5.6 — `createRetrieval`, index reconciled
  incrementally on `onStoreChanged`, never rebuilt per query). The `rag.query`
  MCP tool (FULL handler in `src/main/mcp-server.ts` `handleRagTool`) + the
  `rag-query` IPC (MCP/UI equivalence — §5.7/§8.2) both use the SAME maintained
  engine, created once in `src/main/main.ts` with the store + the lexical
  embedder (F1) and wired into the `edit.*` broadcast + the `IPC_EDIT_COMMIT`
  handler; `IPC_RAG_QUERY`/`RagQueryPayload`/`RagQueryResult` in
  `src/shared/types.ts`; `rag.query` on the preload bridge (`src/main/preload.ts`).
  TestWriter red → Implementer green in `tests/retrieval.test.ts` (RED marker:
  `src/main/retrieval.ts` did not exist → 51 tests pass); adversarial pass in
  `tests/retrieval-adversarial.test.ts` (10 regression tests — host findings
  F1–F7 fixed + regression-tested, recorded in the spec §3a); blind-greens in
  `docs/specs/unit-e-rag-index-greens.md` (52 scenarios, all pass);
  documentation review in
  `archive/reviews/2026-08-27-unit-e-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (test + typecheck + build).
- **Unit A — RAG store (persistence) (2026-08-26).** `createJsonRagStore`
  implemented in `src/main/rag-store.ts` behind the `RagStore` interface:
  node/edge CRUD, single-writer write queue, persisted invertible project
  journal (`maxJournalLength` cap, default 1000), fail-disabled boot,
  hash-verified source + quarantine, per-kind `order`/`documentIds`
  enforcement, `createdAt` preservation, self-referential-edge /
  prototype-pollution / empty-string / duplicate rejection. TestWriter red →
  Implementer green in `tests/rag-store.test.ts` (§5.8/§5.9, 11 happy-path +
  11 fail-state); adversarial pass in `tests/rag-store-adversarial.test.ts`
  (host findings fixed + regression-tested); blind-greens in
  `docs/specs/unit-a-rag-store-greens.md` (27 scenarios, all pass);
  documentation review in `archive/reviews/2026-08-26-unit-a-doc-review.md`
  (spec + greens + trackers reconciled against the build); trio green (test +
  typecheck + build).
- **Unit B — document model + doc-flow (2026-08-26).** `validateDocFlow` in
  `src/main/doc-flow.ts` (pure, no Electron): the `DocFlowVerdict` union
  (`ok:true` order / `ok:false` with `cycle`/`missing-node`/`missing-head`/
  `missing-end`), missing-head precedence, missing-node incl. the doc-head
  target, next-section + doc-child cycles, missing-end, happy path, and the
  null/undefined throw. The five-seam `rag`/`edit` gate: `security.ts`
  ToolGroup/TOOL_GROUPS/VALID_GROUPS/defaultSecurityConfig, `mcp-server.ts`
  ALL_TOOLS/registerTools/handleRagTool/handleEditTool (main-handled against
  the `RagStore` interface), `shared/types.ts` RpcMethod, and the renderer
  negative contracts (no switch cases; `edit.*` not in MUTATING_METHODS).
  TestWriter red → Implementer green in `tests/doc-flow.test.ts` (11
  happy-path + fail-state) + `tests/rag-edit-gate.test.ts` (19 seam + gating);
  + 6 adversarial regression tests (host findings fixed + regression-tested);
  blind-greens in `docs/specs/unit-b-document-model-greens.md` (22 scenarios,
  all pass); documentation review in
  `archive/reviews/2026-08-26-unit-b-doc-review.md` (spec + greens + trackers
  reconciled against the build); trio green (test 735 pass / 2 skip, typecheck
  clean, build clean — full suite no regressions).
- **Unit C — rendering spine (2026-08-26).** `buildTraversal` in
  `src/main/traversal.ts` (pure, no Electron): the `LegacyInitialData` envelope
  (one container producer per targeted zone — the HARD PRECONDITION — + one
  `ContentPayload` per RAG subtree), the back-reference `Map<ragNodeId,
  nodeId[]>` (the SOLE authoritative carrier, built by running `translateLegacy`
  and mapping each subtree root by its stable `rag-<id>` id), and the coarse
  line→node map. Doc-child nesting (a parent's subtree CONTAINS its doc-children
  at their `order` positions; the parent's owned set EXCLUDES the doc-children's
  nodes), multi-parent duplicate coherence, doc-flow fallback to family
  pre-order, and the doc-head marker prop. TestWriter red: 20 failing (module
  not found — `src/main/traversal.ts` did not exist) → Implementer green: 20
  pass in `tests/traversal.test.ts` (§5.7/§5.8, 16 happy-path + fail-state) +
  `tests/traversal-e2e.test.ts` (scenarios 9-10, 4 tests); adversarial pass
  (HOST findings fixed + regression-tested — 5 regression tests in
  `tests/traversal.test.ts`): real markdown line ranges (rendered via
  `renderProducingProcess` + `MarkdownAdapter`), parent back-refs exclude
  doc-children, per-document doc-child exclusion scoping, `documentIds` dedup,
  and RAG-node `props` propagation to the subtree root; blind-greens in
  `docs/specs/unit-c-rendering-spine-greens.md` (18 scenarios, all pass);
  documentation review in `archive/reviews/2026-08-26-unit-c-doc-review.md`
  (spec + greens + trackers reconciled against the build); trio green (test 761
  pass / 2 skip, typecheck clean, build clean — full suite no regressions).
- **Proposal gate (2026-08-26).** Three-agent gate (validity ∥ critique →
  architecture → change-analysis) on the top-level deliverable, then a re-run
  gate on the refined two-graph model, then a focused validity check on the
  subtree-ownership refinement. Verdict: **PROCEED-WITH-AMENDMENTS**. Recorded
  in `docs/specs/astrographer-review.md` (§1-§11). User approved the adjusted
  first-slice scope (Units A/B/C) with the subtree-ownership model and the
  markdown-export-only decision.
- **Spec gate (2026-08-26).** The first-slice contracts are written and
  verified in the compile-horizon-review format:
  `docs/specs/unit-a-rag-store.md` (526 lines), `docs/specs/unit-b-document-model.md`
  (431 lines), `docs/specs/unit-c-rendering-spine.md` (446 lines). Each is
  exhaustive enough for a TestWriter to derive every state and fail-state from
  §5.8/§5.9. **Unit C pinned a reconciliation key:** the back-reference map is
  built by the main-process traversal running `translateLegacy`, but the
  renderer re-translates and re-mints node ids — resolved by a stable authored
  root id (`props.id = 'rag-<ragNodeId>'`) as the reconciliation key between
  the main-process map and the renderer's translated tree. No engine gap opened
  by this slice (ENG-GAP-1 shelved 2026-08-26 — no open handoff items).
