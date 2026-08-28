# Astrographer — Work Queue

Maintained by the document-archival loop (AGENTS.md item 6). Open work on
top; finished items move to the tracker rows they produced. This queue is
this project's local next-steps (the foundation's queue lives in the adjacent
`../Provident-Electron/docs/next-steps.md`).

Astrographer is a **hybrid human-readable local wiki (Obsidian-like) with a
graph-based RAG**, built on a fork of the Provident-Electron foundation. The
proposal gate is complete (PROCEED-WITH-AMENDMENTS — see
`docs/specs/astrographer-review.md`). The first milestone is a smaller slice —
Units A–J are implemented (persistence → document model + doc-flow →
rendering spine → editable text → RAG index + retrieval → vector embeddings →
crosslink/backlink → sidebar panes → template customization → MCP/security
hardening).

## OPEN

### Later units (noted, not in this slice)

_(none — Units A–J are implemented.)_

## DONE

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
