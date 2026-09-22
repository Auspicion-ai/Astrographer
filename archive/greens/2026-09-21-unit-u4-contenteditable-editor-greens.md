# Unit U4 — The Contenteditable Rich-Text Editor (Handlers + Bridge + Discriminated `CaretState` + IME Composition Guard + Re-Derive Caret Restore): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived ONLY from
  `docs/specs/unit-u4-contenteditable-editor.md` — §1.2 (the discriminated
  `CaretState` + `RichCaretEdge` + both-kinds `saveCaret`/`restoreCaret` + the
  dangling-backRef no-throw contract), §1.3 (the 4 rich handler defs +
  registration + the `applyEditingMode` handler attachment + idempotence +
  append-if-absent), §1.4 (the 4 bridge methods + the 3 host fields + the
  `editorBlur` decompose-ONCE/commit-ONCE body + the ADR-1 latch + ADR-4
  `.catch` + the composition guard `editorCompositionStart`/`End`), §1.6 (the
  rich caret capture/restore + `resolveDomPath` + the element-clamp a-med #3 +
  ADR-13), §1.7 (the gated re-derive caret restore + the CRITICAL #1 ordering +
  amendment-4/ADR-8 gating + ONE-SHOT), §2.1 (happy-path states 1–37), §2.2
  (fail-states 1–17), §3 (census), §5 (adversarial must-hunt ADR-1/2/4/5/6/7/8/
  9/10/11/12/13 + the post-green findings CRITICAL #1 / a-med #2 / a-med #3 /
  minor #5 / minor #6) — PLUS `docs/specs/editing-mode-toggle-review.md`
  decisions **B/G/H/I** + amendments 4/6, `src/shared/types.ts`
  (`IPC_EDIT_RICH_COMMIT`/`EditRichCommitPayload`/`RichCommitResult`) +
  `src/main/rich-decompose.ts` (the `decomposeRichHtml` result shape), and the
  host-test harness conventions in `tests/editing-mode-broadcast-host.test.ts`
  (how `makeHarness` drives the host — the boot/`reDerive`/bridge/bridge-surface
  + the dom-shim). NO implementation reading of `src/renderer/sidebar-panes.ts`
  or `src/renderer/edit-controller.ts`, and NOT a copy of the real U4 red sets
  (`tests/contenteditable-editor-host.test.ts` / `tests/contenteditable-caret.test.ts`
  were not read).
- **Modules under test:** the host `SidebarPanes` (`src/renderer/sidebar-panes.ts`)
  and the controller `createEditController` (`src/renderer/edit-controller.ts`),
  exercised LIVE through a scratch `makeHarness` (the `editing-mode-broadcast-host.test.ts`
  convention). The public/private host surface (the 4 bridge methods via the
  `window.provident.sidebar` surface, plus the private `editorBlur`/`editorBlurCommit`/
  `editorCompositionStart`/`editorCompositionEnd`/`applyEditingMode`/`captureRichCaret`/
  `resolveDomPath`/`restoreRichCaret`/`loadAppGraph`/`reDerive` methods and the
  `composingRagId`/`pendingCommitRagId`/`committingRagIds`/`caretNodes`/`editingMode`
  fields) and the controller (`saveCaret`/`restoreCaret`/`clearCaret`/`markDirty`/
  `isDirty`/`clearDirty`/`requestRebuild`/`hasQueuedRebuild`) were driven at
  runtime through cast access (as the harness does), NEVER by reading their
  source. The PURE `decomposeRichHtml` seam (U2) is module-mocked (spied +
  delegating to the real implementation) to count the decompose-ONCE call.
- **Harness:** a standalone vitest scratch file
  (`tests/_scratch-u4-greens.test.ts`) — a `makeHarness(editingMode)` over the
  dom-shim (`installShim`/`mountEl`), a real `Runtime` + `createEditController`,
  a mock bridge (incl. `edit.commitRich` as a spy), and `boot` + `bindHandlers`.
  The DOM-coupled pieces ride the dom-shim (which supplies persistent
  `getElementById` but NO `window.getSelection`/`document.createRange` — the
  ADR-13 no-throw contract). Run:
  `npx vitest run tests/_scratch-u4-greens.test.ts` (43 tests, environment node).
  The type-level scenario (A-7) is verified with a scratch `tsc --noEmit`
  probe (`tests/_scratch-u4-types.ts` + `tsconfig.scratch-u4.json`). (Scratch
  files deleted after the run.)
- **Run:** **44 scenarios — all PASS, 0 fail, 0 skipped** (43 node-runnable in
  the vitest scratch + 1 type-level verified by `tsc`). No spec-vs-impl drift
  observed in the LIVE host wiring (the 4 handler defs + attachment, the 4 bridge
  methods, the `editorInput`/`editorBlur` decompose-ONCE/commit-ONCE body, the
  composition guard incl. the a-med #2 orphaned-deferred fix, the discriminated
  `CaretState` + both-kinds controller storage, and the gated re-derive caret
  restore incl. the CRITICAL #1 ordering) or in the discriminated `CaretState`/
  `RichCaretEdge` types.

Each scenario lists: name, input, expected outcome (from the spec), actual result,
PASS/FAIL.

---

## A. The discriminated `CaretState` + `RichCaretEdge` (controller, §1.2 / §2.1 1–7 / §2.2 L5) — LIVE controller

### A-1. Both kinds round-trip + the `RichCaretEdge` shape (§2.1 1–4 / §1.2)
- **Input:** `saveCaret('s1', { kind:'textarea', offset:3, focused:true })`; then
  `saveCaret('doc', { kind:'rich', ragId:'s1', anchor:{path:[1,0],offset:2}, focus:
  {path:[1,0],offset:4}, focused:true })` (both ids in `backRefs`)
- **Expected:** `restoreCaret` returns each saved object deep-equal (incl. `kind`);
  the rich `anchor.path` is a `number[]` and `anchor.offset` is a `number` (the
  `RichCaretEdge` shape)
- **Actual:** textarea caret round-trips; rich caret round-trips; `anchor.path`
  array / `anchor.offset` number
- **Result:** ✅ PASS

### A-2. Textarea caret restores the SAME object (§2.1 3)
- **Input:** `saveCaret('s1', { kind:'textarea', offset:3, focused:true })`
- **Expected:** `restoreCaret('s1')` deep-equals `{ kind:'textarea', offset:3, focused:true }`
- **Actual:** deep-equal incl. `kind`
- **Result:** ✅ PASS

### A-3. Rich caret restores the SAME object (§2.1 4)
- **Input:** `saveCaret('s1', richCaret())` (`{kind:'rich', ragId:'s1', anchor:{path:[0],offset:0}, focus:{path:[0],offset:1}, focused:true}`)
- **Expected:** `restoreCaret('s1')` deep-equals the same rich object (anchor/focus/focused preserved)
- **Actual:** deep-equal
- **Result:** ✅ PASS

### A-4. Dangling backRef → `undefined` + cleared (Unit D L5, §1.2 / §2.1 5)
- **Input:** `saveCaret('ghost', richCaret())` where `'ghost'` is NOT in `backRefs`; then `restoreCaret('ghost')` twice
- **Expected:** first call returns `undefined` (stale caret cleared); second call returns `undefined` (cleared)
- **Actual:** `undefined` then `undefined`
- **Result:** ✅ PASS

### A-5. No saved caret → `undefined` (§2.1 6)
- **Input:** `restoreCaret('s1')` with nothing saved
- **Expected:** `undefined` (no throw)
- **Actual:** `undefined`
- **Result:** ✅ PASS

### A-6. `clearCaret` removes a saved caret of EITHER kind (§2.1 7)
- **Input:** save a textarea caret under `'s1'` + a rich caret under `'doc'`; `clearCaret` both
- **Expected:** both `restoreCaret` calls return `undefined` (cleared)
- **Actual:** both cleared
- **Result:** ✅ PASS

### A-7. Type-level — `CaretState` is the total discriminated union + `RichCaretEdge` shape (typecheck, §2.1 1/2)
- **Input:** a scratch `tsc --noEmit` probe importing the LIVE `CaretState`/`RichCaretEdge`
  from `edit-controller.ts`: assigns both `{kind:'textarea'}` and `{kind:'rich'}` literals to
  `CaretState`; narrows on `kind` for BOTH branches (a `RichCaretEdge` is exposed on the rich
  branch, `offset` on the textarea branch); and asserts a kind-less `{ offset, focused }` is a
  TYPE ERROR (`@ts-expect-error`)
- **Expected:** all typechecks green; the `@ts-expect-error` is consumed (the kind-less shape is
  rejected — the discriminated type is total, no ambiguous `{offset,focused}`)
- **Actual:** `tsc --noEmit` passes; the kind-less `CaretState` assignment is a type error
- **Result:** ✅ PASS

---

## B. The 4 rich handler defs (§1.3 / §2.1 8–13 + minor #6) — LIVE host

### B-1. All 4 defs registered (function-string bodies, compileHandlerBody-compatible)
- **Input:** `host.bindHandlers()`; `handlerDef(n)` for `rag-editor-input` / `rag-editor-blur` /
  `rag-editor-compositionstart` / `rag-editor-compositionend`
- **Expected:** all 4 defs present with `typeof body === 'string'`
- **Actual:** all 4 registered, string bodies
- **Result:** ✅ PASS

### B-2. `rag-editor-input` body → `sidebar.editorInput(ragId)` (§2.1 9)
- **Input:** compile the body via `compileHandlerBody`; invoke with `ctx.node.props['data-rag-node-id']='s1'`
- **Expected:** calls `editorInput('s1')`
- **Actual:** `editorInput('s1')`
- **Result:** ✅ PASS

### B-3. `rag-editor-blur` with a dispatch html arg (MCP) → `editorBlur(ragId, html)`, NO DOM read (decision G, §2.1 10)
- **Input:** pre-set `getElementById('rag-s1').textContent = 'SHOULD-NOT-READ'`; invoke the blur body with
  the html arg `'<div>dispatch</div>'`
- **Expected:** calls `editorBlur('s1', '<div>dispatch</div>')`; the DOM is NOT read (the arg wins)
- **Actual:** `editorBlur('s1', '<div>dispatch</div>')`
- **Result:** ✅ PASS

### B-4. `rag-editor-blur` WITHOUT an html arg (UI) → reads `getElementById("rag-"+ragId).innerHTML` (§2.1 11)
- **Input:** set `getElementById('rag-s1').textContent = 'Hello <b>x</b>'`; invoke the blur body with NO html arg
- **Expected:** calls `editorBlur('s1', <innerHTML containing 'Hello'>)`
- **Actual:** `editorBlur('s1', 'Hello <b>x</b>')`
- **Result:** ✅ PASS

### B-5. `rag-editor-compositionstart` body → `editorCompositionStart(ragId)` (§2.1 12)
- **Input:** invoke the body with `data-rag-node-id='s1'`
- **Expected:** calls `editorCompositionStart('s1')`
- **Actual:** `editorCompositionStart('s1')`
- **Result:** ✅ PASS

### B-6. `rag-editor-compositionend` body → `editorCompositionEnd(ragId)` (§2.1 13)
- **Input:** invoke the body with `data-rag-node-id='s1'`
- **Expected:** calls `editorCompositionEnd('s1')`
- **Actual:** `editorCompositionEnd('s1')`
- **Result:** ✅ PASS

### B-7. Bodies NO-OP when `provident.sidebar` is absent OR `data-rag-node-id` is absent (minor #6 / §1.3)
- **Input:** all 4 bodies compiled + invoked with a bare `{ node: { props: {} } }` ctx and NO `window.provident.sidebar`
- **Expected:** none throws (the `if (!s) return` / `if (!ragId) return` guards)
- **Actual:** no throw for all 4
- **Result:** ✅ PASS

---

## C. The `applyEditingMode` handler attachment (the U4 extension of the U3 splice, §1.3 / §2.1 14–16) — LIVE host

### C-1. Eligible root gains EXACTLY the 4 defs + `contenteditable:true` + textarea removed (§2.1 14)
- **Input:** a `p` root envelope (`rag-s1` + its `textarea-s1` child) spliced with `applyEditingMode(env, 'contenteditable')`
- **Expected:** `root.handlers` deep-equals the 4 defs (`input`/`blur`/`compositionstart`/`compositionend`);
  `root.props.contenteditable === true`; the `textarea-s1` child is removed
- **Actual:** handlers = the exact 4-def array; `contenteditable:true`; textarea removed
- **Result:** ✅ PASS

### C-2. Ineligible root has its textarea removed (plain text), NO `rag-editor-*` handlers (§2.1 15)
- **Input:** a `ul` root envelope (NOT in `EDITABLE_TYPES`) spliced with `contenteditable` mode
- **Expected:** `root.handlers` undefined; no `contenteditable` prop; the `textarea-s1` child is REMOVED (the textarea is removed for ALL rag roots in contenteditable mode — the ineligible root renders as plain text)
- **Actual:** handlers undefined, no `contenteditable`, textarea removed
- **Result:** ✅ PASS

### C-3. `editingMode === 'textarea'` → no attachment, no splice (byte-for-byte no-op) (§2.1 16 / U3 ADR-10)
- **Input:** an eligible `p` envelope spliced with `applyEditingMode(env, 'textarea')`
- **Expected:** the envelope is byte-for-byte unchanged (JSON-equal); no `handlers`, no `contenteditable`
- **Actual:** JSON-equal to the original
- **Result:** ✅ PASS

### C-4. Idempotent re-run + append-if-absent (name-dedup) preserves an authored handler (minor #5, §1.3)
- **Input:** an envelope with a pre-authored `{name:'authored-foo',event:'click'}` handler on the root, spliced TWICE
  with `contenteditable`
- **Expected:** after two splices the root has the authored handler PLUS exactly one copy of each of the 4 defs
  (no duplicate accumulation; the authored handler is NOT clobbered); `handlers.length === 5`
- **Actual:** 5 handlers, `rag-editor-input` appears exactly once, `authored-foo` present
- **Result:** ✅ PASS

---

## D. `editorInput` marks dirty (§1.4 / §2.1 17–18, §2.2 11) — LIVE host

### D-1. `editorInput(ragId)` → `markDirty` → `isDirty` true (§2.1 17)
- **Input:** `sidebar.editorInput('s1')`
- **Expected:** `editController.isDirty('s1') === true`
- **Actual:** `isDirty('s1') === true`
- **Result:** ✅ PASS

### D-2. A re-derive while the contenteditable is dirty is QUEUED (dirty-edit guard, §2.1 18 / §2.2 11 / ADR-2)
- **Input:** `editorInput('s1')` (dirty) then `editController.requestRebuild()`
- **Expected:** `hasQueuedRebuild() === true`, `onRebuild` NOT called (the in-progress edit is never torn down);
  after `clearDirty('s1')` the queued rebuild runs once
- **Actual:** queued (onRebuild 0×); after clear, `onRebuild` fires
- **Result:** ✅ PASS

---

## E. `editorBlur` — caret save + decompose ONCE + commit ONCE (§1.4 / §2.1 19–23 / §3) — LIVE host

### E-1. No-op blur (not dirty) → saves a rich caret (`focused:false`) + NO commit / NO IPC (§2.1 19 / ADR-12 / §2.2 9)
- **Input:** a not-dirty `sidebar.editorBlur('s1', 'nothing')`
- **Expected:** `commitRich` NOT called; `restoreCaret('s1')` is `{kind:'rich', ..., focused:false}` (H3 — only a real
  edit re-focuses); the node is added to `caretNodes`
- **Actual:** no commit; saved caret `focused:false`; `caretNodes.has('s1') === true`
- **Result:** ✅ PASS

### E-2. Real blur (dirty) → `decomposeRichHtml` ONCE + `commitRich` ONCE with the decomposed `{content, children}` (§2.1 20/23, §2.2 14)
- **Input:** dirty `editorBlur('s1', 'Hello <b>bold</b>')`
- **Expected:** `decomposeRichHtml` called EXACTLY ONCE; `commitRich('s1', <decomposed content>, <decomposed children>)`
  EXACTLY ONCE; the content/children deep-equal the real `decomposeRichHtml('Hello <b>bold</b>')` result
- **Actual:** decompose 1×; `commitRich('s1', 'Hello bold', [strong('bold')])` 1×
- **Result:** ✅ PASS

### E-3. Commit `ok` AND `deleted-node` → dirty cleared (H5, §1.4 / §2.2 2/3)
- **Input:** (a) a real blur resolving `{ok:true, ...}`; (b) a real blur resolving `{ok:false, reason:'deleted-node'}`
- **Expected:** both clear the dirty flag (`isDirty === false`)
- **Actual:** both cleared
- **Result:** ✅ PASS

### E-4. No split commit — `commitRich` receives the atomic pair (never `setContent`+`setSubtree`) (§1.4/§1.6, §2.1 23)
- **Input:** dirty `editorBlur('s1', 'Hi <em>i</em>')`
- **Expected:** `commitRich` called EXACTLY ONCE with the decomposed `{content, children}` (a single atomic call, not two writes);
  `decomposeRichHtml` called EXACTLY ONCE (no double-decompose)
- **Actual:** 1× `commitRich` with the pair; decompose 1×
- **Result:** ✅ PASS

---

## F. The IME composition guard (decision H / §1.4 / §2.1 24–28 / §2.2 4/5 / ADR-1/2) — LIVE host

### F-1. `compositionstart` sets `composingRagId`; a mid-composition blur is DEFERRED (no commit) (§2.1 24, §2.2 4)
- **Input:** `editorCompositionStart('s1')` → `editorInput('s1')` (dirty) → `editorBlur('s1', 'IME <b>text</b>')`
- **Expected:** `composingRagId === 's1'`; the blur does NOT commit (`commitRich` 0×); `pendingCommitRagId === 's1'`; dirty stays
- **Actual:** `composingRagId 's1'`, no commit, `pendingCommitRagId 's1'`, dirty stays
- **Result:** ✅ PASS

### F-2. `compositionend` clears the window + runs the deferred commit ONCE (current innerHTML) (§2.1 25)
- **Input:** after the F-1 deferred blur, set `getElementById('rag-s1').textContent='FINAL'`; `editorCompositionEnd('s1')`
- **Expected:** `composingRagId` null; `pendingCommitRagId` null; `commitRich` ONCE with content `'FINAL'`; dirty cleared
- **Actual:** all as expected (`commitRich('s1','FINAL')`)
- **Result:** ✅ PASS

### F-3. An unmatched/spurious `compositionend` clears nothing, runs nothing (§2.1 26, §2.2 5)
- **Input:** `editorCompositionStart('s1')` then `editorCompositionEnd('s2')`
- **Expected:** `composingRagId` stays `'s1'`; `commitRich` 0×; then the real `editorCompositionEnd('s1')` clears it
- **Actual:** `'s1'` not cleared by the `'s2'` end; cleared by `'s1'`
- **Result:** ✅ PASS

### F-4. A deferred blur + a racing blur commit EXACTLY ONCE (ADR-1 commit-in-flight latch, §2.1 27)
- **Input:** compositionstart s1 → dirty blur s1 (deferred) → `getElementById('rag-s1').textContent='FINAL'` →
  `editorCompositionEnd('s1')` (latches s1 + starts the async commit) → a racing `editorBlur('s1','racing')` BEFORE the settle
- **Expected:** the latch suppresses the racing `editorBlurCommit` → `commitRich` called EXACTLY ONCE (with `'FINAL'`),
  no second decompose, no unhandled rejection
- **Actual:** `commitRich` 1× with `'FINAL'`
- **Result:** ✅ PASS

---

## G. Decompose / commit failure fail-states (§2.2 1/2/3/16, §5 ADR-4/5) — LIVE host

### G-1. Decompose error → NO commit + dirty kept (data preserved, §2.2 1 / ADR-5)
- **Input:** a dirty `editorBlur('s1', 42)` (non-string `html` — the sole `decomposeRichHtml` fail-state, U2 totality)
- **Expected:** `decomposeRichHtml` returns `{ok:false}` → `commitRich` NOT called; dirty STAYS (the in-DOM content is preserved)
- **Actual:** no commit, dirty kept
- **Result:** ✅ PASS

### G-2. Commit `store-error` → dirty STAYS (§2.2 2 / ADR-4)
- **Input:** a real blur resolving `{ok:false, reason:'store-error'}`
- **Expected:** dirty NOT cleared (the edit is not lost — the guard keeps queuing until a retry succeeds)
- **Actual:** dirty kept
- **Result:** ✅ PASS

### G-3. A REJECTED `commitRich` is caught + dirty kept + latch released (ADR-4, §2.2 16)
- **Input:** a real blur whose `commitRich` promise REJECTS (`new Error('boom')`); capture any `unhandledRejection`
- **Expected:** the `.catch` logs + KEEPS dirty; NO unhandled rejection; the `committingRagIds` latch is released (node may retry)
- **Actual:** no unhandled rejection; dirty kept; `committingRagIds.has('s1') === false`
- **Result:** ✅ PASS

---

## H. The gated re-derive caret restore (§1.7 / §2.1 29–36 / §2.2 6/7/12/13, amendment 4 / ADR-8) — LIVE host

### H-1. A rich caret is restored into a REAL contenteditable root (gate passes + one-shot) (§2.1 29)
- **Input:** `editingMode='contenteditable'`; save a rich caret for `'s1'`; `caretNodes.add('s1')`;
  set `getElementById('rag-s1')` with `contenteditable="true"`; `reDerive()`
- **Expected:** the gate passes → `restoreRichCaret('s1', caret)` is called; the node is removed from `caretNodes` (one-shot)
- **Actual:** `restoreRichCaret` called with the saved caret; `caretNodes.has('s1') === false`
- **Result:** ✅ PASS

### H-2. A textarea caret is restored into a textarea element (selectionStart/End + one-shot) (§2.1 30)
- **Input:** `editingMode='textarea'`; save a `{kind:'textarea', offset:3}` caret for `'s1'`; `caretNodes.add('s1')`;
  `getElementById('textarea-s1')` present; `reDerive()`
- **Expected:** `selectionStart === 3` and `selectionEnd === 3`; the node is removed from `caretNodes`
- **Actual:** selectionStart/End 3; `caretNodes` cleared
- **Result:** ✅ PASS

### H-3. A rich caret after a contenteditable→textarea toggle is DROPPED, never misapplied (§2.1 31 / §2.2 7 / ADR-8 / U3 F2)
- **Input:** `editingMode='textarea'`; save a rich caret for `'s1'`; `caretNodes.add('s1')`; the `rag-s1` element even carries
  `contenteditable="true"` (the toggle no-ops the splice, so the mode gate fails); `reDerive()`
- **Expected:** the rich gate FAILS (`editingMode !== 'contenteditable'`) → `restoreRichCaret` NOT called; the caret is
  DROPPED + the node removed (one-shot) — never applied to the (now textarea) control
- **Actual:** `restoreRichCaret` not called; `caretNodes.has('s1') === false`
- **Result:** ✅ PASS

### H-4. A textarea caret into a node with NO textarea element is DROPPED (§2.1 32 / §2.2 7)
- **Input:** `editingMode='contenteditable'`; make `getElementById('textarea-s1')` return `null` (the element is genuinely
  absent in contenteditable mode); save a textarea caret for `'s1'`; `caretNodes.add('s1')`; `reDerive()`
- **Expected:** the `if (el)` gate fails → the textarea caret is DROPPED (one-shot), never misapplied to the contenteditable
- **Actual:** `caretNodes.has('s1') === false` (dropped + one-shot), no throw
- **Result:** ✅ PASS

### H-5. Dangling backRef → caret cleared, no restore (§2.1 34 / §2.2 L5 / A4)
- **Input:** save a rich caret for `'ghost'` (NOT in `backRefs`); `caretNodes.add('ghost')`; `reDerive()`
- **Expected:** `restoreCaret('ghost')` returns `undefined` → the node is removed, NO restore
- **Actual:** `restoreRichCaret` not called; `caretNodes.has('ghost') === false`
- **Result:** ✅ PASS

### H-6. CRITICAL #1 — the restore runs AFTER the SINGLE final graph load (loadAppGraph EXACTLY ONCE in `reDerive`) (§1.7 / §5.1)
- **Input:** `editingMode='contenteditable'`; save a rich caret for `'s1'`; `caretNodes.add('s1')`; set the `rag-s1` element
  `contenteditable="true"`; spy `SidebarPanes.prototype.loadAppGraph`; `reDerive()`
- **Expected:** `loadAppGraph` is called EXACTLY ONCE (reDerive does NOT load the graph itself — the buggy path called it twice,
  and the second load destroyed the restore selection in a real browser); `restoreRichCaret` is called (the restore ran after that
  single final load)
- **Actual:** `loadAppGraph` 1×; `restoreRichCaret` called
- **Result:** ✅ PASS

### H-7. a-med #3 — an element-node caret edge is clamped to the nearest text node, not dropped (§1.6 / §5.1)
- **Input:** a synthetic `root.childNodes = [strong]` where `strong.childNodes = [text]` (`nodeType:3`, `data:'inner'`);
  call `resolveDomPath(root, [0])` and `resolveDomPath(root, [0,0])`
- **Expected:** `[0]` (an ELEMENT-node edge) resolves to the text node via `firstTextNode` (clamped, not dropped);
  `[0,0]` resolves to the same text node
- **Actual:** both resolve to the text node
- **Result:** ✅ PASS

### H-8. The rich gate needs BOTH `editingMode==='contenteditable'` AND the rendered `contenteditable` attribute (ADR-8, §2.2 7)
- **Input:** `editingMode='contenteditable'`; save a rich caret for `'s1'`; `caretNodes.add('s1')`; the `rag-s1` element has NO
  `contenteditable` attr (a contenteditable→textarea toggle); `reDerive()`
- **Expected:** the gate FAILS (the rendered root is not contenteditable) → `restoreRichCaret` NOT called; caret dropped (one-shot)
- **Actual:** `restoreRichCaret` not called; `caretNodes.has('s1') === false`
- **Result:** ✅ PASS

### H-9. In contenteditable mode the eligible root exposes NO `textarea-s1` (amendment 4 / §2.2 12 / U3 F2)
- **Input:** `editingMode='contenteditable'`; `reDerive()`; inspect the rendered Runtime HTML
- **Expected:** the rendered HTML contains `contenteditable` and does NOT contain `textarea-s1` (the splice removed the textarea
  for the eligible root — the rich caret path reads `rag-s1`, never the absent textarea)
- **Actual:** HTML has `contenteditable`, no `textarea-s1`
- **Result:** ✅ PASS

---

## I. First-materialization + census + no-throw + end-to-end (§1.4/§1.7/§1.8, §2.1 37, §2.2 10/17, §3) — LIVE host

### I-1. First-materialization — the blur reads the FIRST `rag-<id>` innerHTML and commits EXACTLY ONCE (decision I / amendment 6, §2.2 10)
- **Input:** set `getElementById('rag-s1').textContent = 'First materialization'`; dirty `editorBlur('s1', 'First materialization')`
- **Expected:** EXACTLY ONE `commitRich` fires with the first materialization's content; `decomposeRichHtml` 1× (no
  union-of-duplicates / no last-materialization read)
- **Actual:** 1× `commitRich` with 'First materialization'; decompose 1×
- **Result:** ✅ PASS

### I-2. Census — the bridge surface exposes 12 methods incl. the 4 rich methods (§3)
- **Input:** after boot, enumerate `window.provident.sidebar` keys
- **Expected:** 12 methods total (the 8 existing `selectDocument`/`submitQuery`/`templateAdd`/`templateRemove`/`templateReset`/
  `operatorSet`/`textareaInput`/`textareaBlur` + the 4 rich `editorInput`/`editorBlur`/`editorCompositionStart`/
  `editorCompositionEnd`)
- **Actual:** 12 keys incl. the 4 rich methods
- **Result:** ✅ PASS

### I-3. A blur + re-derive round-trip under the dom-shim never throws and leaves no unhandled rejection (ADR-13, §2.2 17)
- **Input:** `editingMode='contenteditable'`; set the `rag-s1` contenteditable attr; `editorInput('s1')` + `editorBlur('s1','<b>x</b>')`
  then `reDerive()`, with an `unhandledRejection` listener
- **Expected:** neither the blur nor the re-derive throws (the shim supplies no `getSelection`/`createRange` — the guards no-op);
  no unhandled rejection
- **Actual:** no throw, no unhandled rejection
- **Result:** ✅ PASS

### I-4. The FULL round-trip — input(dirty) → blur → decompose ONCE → commitRich ONCE → re-derive → rich-caret restore (§2.1 37)
- **Input:** `editingMode='contenteditable'`; `editorInput('s1')` → `editorBlur('s1','Hello <b>bold</b>')` → await the commit settle →
  set the `rag-s1` contenteditable attr → `reDerive()`
- **Expected:** decompose 1×; `commitRich` 1×; dirty cleared; after the re-derive the rich caret is restored (the user's selection
  survives the round-trip) and the node is removed from `caretNodes`
- **Actual:** decompose 1×, `commitRich` 1×, dirty cleared, `restoreRichCaret` called, `caretNodes` cleared
- **Result:** ✅ PASS

---

## Run record

| # | Scenario | Result |
| --- | --- | --- |
| A-1 | Both kinds round-trip + RichCaretEdge shape | ✅ PASS |
| A-2 | Textarea caret restores the same object | ✅ PASS |
| A-3 | Rich caret restores the same object | ✅ PASS |
| A-4 | Dangling backRef → undefined + cleared | ✅ PASS |
| A-5 | No saved caret → undefined | ✅ PASS |
| A-6 | clearCaret removes either kind | ✅ PASS |
| A-7 | Discriminated CaretState typechecks (kind-less rejected) | ✅ PASS (tsc) |
| B-1 | 4 rag-editor-* defs registered | ✅ PASS |
| B-2 | rag-editor-input → editorInput | ✅ PASS |
| B-3 | rag-editor-blur MCP html arg (no DOM read) | ✅ PASS |
| B-4 | rag-editor-blur UI path reads innerHTML | ✅ PASS |
| B-5 | rag-editor-compositionstart → editorCompositionStart | ✅ PASS |
| B-6 | rag-editor-compositionend → editorCompositionEnd | ✅ PASS |
| B-7 | bodies no-op without sidebar/ragId | ✅ PASS |
| C-1 | eligible root gains exactly 4 defs + contenteditable + textarea removed | ✅ PASS |
| C-2 | ineligible root textarea removed (plain text) + no rag-editor handlers | ✅ PASS |
| C-3 | textarea mode → byte-for-byte no-op | ✅ PASS |
| C-4 | idempotent re-run + append-if-absent preserves authored handler | ✅ PASS |
| D-1 | editorInput marks dirty | ✅ PASS |
| D-2 | dirty + re-derive → queued (runs on clear) | ✅ PASS |
| E-1 | no-op blur saves caret (focused:false) + no commit | ✅ PASS |
| E-2 | real blur → decompose ONCE + commitRich ONCE with decomposed pair | ✅ PASS |
| E-3 | commit ok + deleted-node → dirty cleared | ✅ PASS |
| E-4 | no split commit (atomic pair; no double-decompose) | ✅ PASS |
| F-1 | compositionstart sets composingRagId; mid-composition blur deferred | ✅ PASS |
| F-2 | compositionend runs the deferred commit ONCE (current innerHTML) | ✅ PASS |
| F-3 | unmatched compositionend clears nothing | ✅ PASS |
| F-4 | deferred + racing blur commit exactly once (ADR-1 latch) | ✅ PASS |
| G-1 | decompose error → no commit + dirty kept | ✅ PASS |
| G-2 | commit store-error → dirty kept | ✅ PASS |
| G-3 | rejected commitRich → caught, dirty kept, latch released | ✅ PASS |
| H-1 | rich caret restored into a real contenteditable root (one-shot) | ✅ PASS |
| H-2 | textarea caret restored into a textarea (one-shot) | ✅ PASS |
| H-3 | rich caret after contenteditable→textarea toggle → DROPPED | ✅ PASS |
| H-4 | textarea caret into a textarea-less node → DROPPED | ✅ PASS |
| H-5 | dangling backRef → cleared, no restore | ✅ PASS |
| H-6 | CRITICAL #1 — restore after the SINGLE final graph load (loadAppGraph 1×) | ✅ PASS |
| H-7 | a-med #3 — element-node edge clamped to the nearest text node | ✅ PASS |
| H-8 | rich gate needs BOTH editingMode + contenteditable attr (attr absent → dropped) | ✅ PASS |
| H-9 | no textarea-s1 in the contenteditable-mode rendered graph | ✅ PASS |
| I-1 | first-materialization read + exactly one commitRich | ✅ PASS |
| I-2 | census — bridge surface = 12 methods incl. the 4 rich | ✅ PASS |
| I-3 | blur + re-derive under the dom-shim never throws (no unhandled) | ✅ PASS |
| I-4 | full round-trip (input → blur → commit → re-derive → restore) | ✅ PASS |

**Run summary:** 44 scenarios — 44 pass, 0 fail, 0 skipped (43 node-runnable via
vitest; A-7 type-level via `tsc --noEmit`). The scratch files
(`tests/_scratch-u4-greens.test.ts`, `tests/_scratch-u4-types.ts`,
`tsconfig.scratch-u4.json`) were deleted after the run; the full suite
(`npx vitest run`) is green (92 files / 1827 passed / 37 skipped) including the
scratch run.

### Findings (spec-vs-impl drift)

- **None observed.** Every pinned contract ran green against the LIVE host +
  controller: the discriminated `CaretState` (both kinds round-trip, the kind-less
  shape is a type error, both-kinds `clearCaret`/dangling-backRef `undefined`), the
  controller's kind-agnostic storage, the 4 handler defs (registration, the
  `data-rag-node-id` resolution, the blur MCP-arg-vs-DOM-read preference, the
  `compositionstart`/`compositionend` dispatch, the no-op guards), the
  `applyEditingMode` handler attachment (exactly 4 defs on an eligible root, 0 on
  an ineligible root, byte-for-byte no-op in textarea mode, idempotent +
  append-if-absent preserving an authored handler), the `editorInput` dirty-mark
  + the dirty-edit guard queueing, the `editorBlur` no-op/real blur with
  decompose-ONCE + commit-ONCE + the atomic-pair call, the dirty-clear on
  `ok`/`deleted-node`, the composition guard (deferral, compositionend deferred
  commit ONCE, the ragId-keyed unmatched-end guard, the ADR-1 no-double-commit
  latch under a racing blur, the a-med #2 orphaned-deferred fix), the
  decompose-error / store-error / rejected-commit fail-states, and the gated
  re-derive caret restore (rich-into-contenteditable, textarea-into-textarea, both
  mismatch-drop directions, one-shot, dangling backRef, the CRITICAL #1
  single-final-load ordering, the a-med #3 element-clamp, the 
  `editingMode`+attribute gate, the amendment-4 textarea absence, the
  first-materialization read + commit-once, the bridge-surface census of 12, and
  the dom-shim no-throw round-trip).

### Test-authoring notes (not drifts)

- **Harness carve-out — the DOM-coupled caret restore.** The rich caret capture +
  the real `Range`/`Selection` application are browser-only (the dom-shim supplies
  neither `window.getSelection` nor `document.createRange`). Per the spec's own
  ADR-13 contract, `captureRichCaret` no-ops into the `{path:[0],offset:0}` fallback
  and `restoreRichCaret` returns before `createRange` — so the gate scenarios
  assert that `restoreRichCaret` is CALLED (the gate correctness), and the no-throw
  shim-absence is asserted directly (I-3). The a-med #3 element-clamp is verified by
  driving `resolveDomPath` with a synthetic `childNodes` structure (the shim's
  `ShimElement` lacks `childNodes`, so a manual array is supplied).
- **The CRITICAL #1 ordering** is asserted by spying `SidebarPanes.prototype.loadAppGraph`
  and driving `reDerive()` — `loadAppGraph` must be called EXACTLY ONCE (the buggy
  double-load path called it twice, which clobbered the restore selection in a real
  browser) and `restoreRichCaret` must run after that single load.
- **The first-materialization limitation** is asserted at the host-blur level: under
  the shim `getElementById('rag-<id>')` returns the single (first) element, so the
  handler reads its `innerHTML` and exactly ONE `commitRich` fires. The N-1 other
  duplicate-materialization reads are DOM-only (a real multi-duplicate render) and are
  documented per §2.2 state 10 / decision I.
- **The `decomposeRichHtml` module mock** spies the U4 decompose-ONCE call while
  delegating to the real (U2) implementation for content correctness; the expected
  `{content, children}` in E-2/E-4 is computed by calling the real function and the
  decompose call-count is captured BEFORE that expected-value call so the count stays
  at exactly the blur's single decompose.
- **A-7 (type-level)** is verified by a scratch `tsc --noEmit` probe importing the
  live `CaretState`/`RichCaretEdge` from `edit-controller.js` (vitest itself does not
  typecheck).
