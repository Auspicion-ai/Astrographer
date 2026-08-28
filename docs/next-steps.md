# Astrographer — Work Queue

Maintained by the document-archival loop (AGENTS.md item 6). Open work on
top; finished items move to the tracker rows they produced. This queue is
this project's local next-steps (the foundation's queue lives in the adjacent
`../Provident-Electron/docs/next-steps.md`).

Astrographer is a **hybrid human-readable local wiki (Obsidian-like) with a
graph-based RAG**, built on a fork of the Provident-Electron foundation. The
proposal gate is complete (PROCEED-WITH-AMENDMENTS — see
`docs/specs/astrographer-review.md`). The first milestone is a smaller slice —
Units A–S are implemented (persistence → document model + doc-flow →
rendering spine → editable text → RAG index + retrieval → vector embeddings →
crosslink/backlink → sidebar panes → template customization → MCP/security
hardening → the form-control textarea editing UI → the `children` store-format
foundation → batch atomicity → the rich-text edit ops → the rich-text
contenteditable editing slice: retrieval indexing of inline `children` text,
traversal disambiguation of inline vs doc-children, paste-time sanitization).

## OPEN

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

### Later units (noted, not in this slice)

_(none — Units A–S are implemented.)_

## DONE

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
