# Astrographer — Work Queue

Maintained by the document-archival loop (AGENTS.md item 6). Open work on
top; finished items move to the tracker rows they produced. This queue is
this project's local next-steps (the foundation's queue lives in the adjacent
`../Provident-Electron/docs/next-steps.md`).

Astrographer is a **hybrid human-readable local wiki (Obsidian-like) with a
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

## OPEN

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
textarea stays the DEFAULT (decision **D** supersedes the FORM-CONTROL-EDITING
'NOT contenteditable' + the 'no global editingMode field' clauses in U1). Each
unit was its own red→green→adversarial→greens→doc-review cycle per AGENTS.md
(RCA-1/2/3/6).

### Next slice — the rich-text contenteditable editing machinery (COMPLETE)

The rich-text contenteditable editing machinery (the `provident-editable@0.1.0`
integration — see `docs/decisions.md` RICH-TEXT-EDITING-GATE, sequenced
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
  `'contenteditable'` passes, everything else → `'textarea'`; TOTAL, never
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
  `docs/decisions.md`).
- **Unit U3 — rich-text editing eligibility + host post-assembly splice +
  snapshot `children` field (2026-08-28).** The editing-mode-toggle slice's
  second unit (unit 2 of 5 in execution order U2→U3→U1→U5→U4 — decisions **C**
  and **E** of `docs/specs/editing-mode-toggle-review.md` §4/§5, U3 row). A new
  PURE, node-testable module `src/renderer/rich-eligibility.ts` exports
  `isRichEditableRoot(type, ownsDocChildren): boolean` (true iff
  `EDITABLE_TYPES.has(type) && !ownsDocChildren` — PURE + DETERMINISTIC + TOTAL,
  never throws) + the closed `EDITABLE_TYPES` set (`h1`–`h6`/`p`/`blockquote`/
  `div` — **9 members**, NOT the review's miscounted "7"; the 14 other
  `RagNodeType` members fall back to the textarea). The host post-assembly
  splice — a private `SidebarPanes` method `applyEditingMode(envelope,
  editingMode)` in `src/renderer/sidebar-panes.ts` — walks each payload
  `content[0]`, recurses into `rag-`-prefixed doc-children, REMOVES the
  traversal-authored `textarea-<ragId>` child + sets `contenteditable: true` on
  every RICH-ELIGIBLE root (preserving the root's other props, incl. authored
  `id`/`data-rag-node-id`/`data-doc-head`); ineligible roots keep their textarea
  (the fallback control); `editingMode === 'textarea'` is a byte-for-byte no-op;
  idempotent across re-assembles (H4-style). `applyEditingMode` is invoked in
  `loadAppGraph` immediately after `setTextareaReadOnly` and BEFORE
  `recomputeBackRefs` (decision C — the readOnly pass still sees the textarea;
  backRefs recomputed from the POST-splice envelope). The mode is supplied from
  a NEW private host field `private editingMode: EditingMode = 'textarea'` (the
  safe default, decision D) INJECTED by the U3 integration test (no U1
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
  + spec prose to pin "parent-keeps-textarea / doc-child-splices" — the h1
  keeps its textarea (it owns a doc-child), only the doc-child h2 splices.
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
  `docs/decisions.md`).
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
