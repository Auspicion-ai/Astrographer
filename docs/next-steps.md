# Astrographer — Work Queue

Maintained by the document-archival loop (AGENTS.md item 6). Open work on
top; finished items move to the tracker rows they produced. This queue is
this project's local next-steps (the foundation's queue lives in the adjacent
`../Provident-Electron/docs/next-steps.md`).

Astrographer is a **hybrid human-readable local wiki (Obsidian-like) with a
graph-based RAG**, built on a fork of the Provident-Electron foundation. The
proposal gate is complete (PROCEED-WITH-AMENDMENTS — see
`docs/specs/astrographer-review.md`). The first milestone is a smaller slice —
Units A/B/C/D/E are implemented (persistence → document model + doc-flow →
rendering spine → editable text → RAG index + retrieval); Units F–J remain
later units.

## OPEN

### Later units (noted, not in this slice)

- **Unit F — embeddings.** Vector embeddings behind the `Embedder` interface
  (deferred; local-first, no network egress).
- **Unit G — crosslink/backlink.** Custom crosslink `LinkConfig` (open name
  union) + host-side backlink enumeration.
- **Unit H — sidebar panes.** Host-side pane registry; app-graph panes
  MCP-visible; operator-only panes (settings) in an isolated `GraphScope`.
- **Unit I — template customization.** Envelope CRUD via a provident-rendered
  template-editor pane.
- **Unit J — MCP/security hardening.** Completion pass for the `rag`/`edit`
  groups and the equivalence surface.

## DONE

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
