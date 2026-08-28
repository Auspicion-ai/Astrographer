# Editing-Mode Toggle + Contenteditable Rich-Text Editor — Proposal-Gate Review (compile-horizon-review)

- **Proposal:** Add a global `editingMode: 'textarea' | 'contenteditable'` operator setting toggling the document editing control, AND build the contenteditable rich-text editor UI. Today only the plain-text textarea (Unit L) exists; the rich-text DATA-MODEL machinery is complete (RagNode `children`, `setProps`/`setSubtree`/`setType` ops, `sanitizePastedHtml`, retrieval indexing, census 6→9). `provident-editable@0.1.0` was adopted in design but NOT installed.
- **Reviewer:** change-analysis agent (step 4 of the proposal gate), grounded by validity + critique + architecture reviews.
- **Inputs:** proposal text; validity (VALID-WITH-AMENDMENTS, 11 findings); critique (UNSOUND-as-written, 13 findings); architecture review (resolved decisions A–I + a 5-unit plan).
- **Status:** **PROCEED-WITH-AMENDMENTS** (conditional on the amendments below and the user's go-ahead).

---

## 1. What the proposal asks

1. Add `editingMode: 'textarea' | 'contenteditable'` to the operator settings (`OperatorSettings` + `DEFAULT_SETTINGS` + `sanitize`/`patch`), default **textarea**.
2. Render an operator-settings control (provident `select`/`option`, or radio fallback) to toggle it.
3. Broadcast `operator-settings-changed` on a settings set → host `requestRebuild` → `reDerive` → whole-graph re-materialization in the chosen mode.
4. In `contenteditable` mode, splice the assembled envelope (remove the textarea child; set `contenteditable:true` on the RAG subtree root), with a pure `isRichEditableRoot(type, ownsDocChildren)` gate (h1–h6/p/blockquote/div and NOT a doc-children-owner); all other types + doc-children owners fall back to textarea.
5. Build the contenteditable editor UI: rich-event handler defs (input/blur/compositionstart/compositionend) + bridge methods; decomposition ONCE in the host `editorBlur`; a new combined `setRichText` edit op + `IPC_EDIT_RICH_COMMIT` + preload `edit.commitRich`; discriminated path-based `CaretState` restored after re-derive; IME composition guard keyed by ragId.
6. Supersede the RICH-TEXT-EDITING-GATE "no global editingMode field" + FORM-CONTROL-EDITING "NOT contenteditable" pins with one new DECIDED row; textarea stays the default.

## 2. Feasibility verdict

**FEASIBLE.** The architecture resolves the two reviews' load-bearing objections against verified code:

- **"No atomic content+children write"** — resolved by decision **A**: a NEW `setRichText(ctx,{nodeId,content,children})` op doing ONE atomic `putNode` + ONE `content` journal entry (the journal already carries `children`+`props` at `rag-store.ts` line 156) + a `kind:'content'` broadcast. It deliberately does NOT touch `applyBatch` (which correctly stays rejecting the Unit O ops — confirmed at `rag-store.ts` lines 1072–1075).
- **"CaretState textarea-only"** — resolved by decision **B**: a discriminated `CaretState` (`textarea` | `rich` with path-based `RichCaretEdge`) restored after re-derive; the rich path reads `rag-<ragId>` (the root), never the absent textarea.
- **"operator-settings don't reach traversal / display-only pane"** — resolved by decision **C** + the new broadcast: the traversal stays PURE (still emits textarea); the HOST splices the assembled envelope in `applyEditingMode` (called in `loadAppGraph`, after `setTextareaReadOnly`, before `recomputeBackRefs`). `settingsContent` is display-only today (verified); the new control + broadcast are the fix.
- **"traversal can't see editingMode"** — resolved: `applyEditingMode`/`isRichEditableRoot` take editingMode injected; the host reads it from the settings store.

The data-model prerequisites (Units N/O/P/Q/R/S) are all landed and verified. `sanitizePastedHtml` provides a pure, TOTAL, DOM-free decompose substrate. **No engine gap blocks this slice**; the only engine uncertainty is U1's `select`/`option` rendering, which has a safe fallback.

## 3. Gaps + costs-benefits (amendments the spec must pin)

**Amendments (must land in the spec before code):**
1. **U1 control fallback (test-first):** confirm the engine renders a provident `select`/`option` (option children, selected state, change-dispatch value); if red, land **radio inputs** (INPUT is in `VALUE_FORMS`, the safe path). `FORM_CONTROLS` includes SELECT, `VALUE_FORMS` does not.
2. **No re-derive loop by construction:** the broadcast fires only on a settings SET, never from inside `reDerive`, and re-derive does not write settings. The host MUST re-fetch settings on the broadcast (single source of truth = main store) to avoid operator-scope/app-graph divergence.
3. **Round-trip decompose invariant:** `decompose(render(subtree))` reproduces `content` + `children` in document order — root plain text between inline children preserved in `content`; nested strong/em/a/img → `children`.
4. **Cross-unit gate:** the Unit L `textareaBlur` DOM read + caret-restore path is disabled in contenteditable mode (the `textarea-<ragId>` element does not exist).
5. **IME deferred-commit:** drop the pending commit if the node's backRef is dangling post-re-derive.
6. **First-materialization limitation (decision I):** documented + adversarial regression test; commit from dispatch-provided html when present, else the first materialization, never a union.
7. **`setRichText` is UI-IPC-only** in this slice (no MCP rich tool yet) — consistent with IPC-SURFACE-NOT-GROUP-GATED; MCP-UI-EQUIVALENCE is not violated.
8. **`contenteditable` attribute mapping** in the engine pinned.

**Costs:** U4 is the most DOM-coupled, least node-testable work in the project; new IPC + broadcast + snapshot-payload field; new supersession row; an accepted, documented duplicate-materialization innerHTML limitation; a small engine-rendering fallback risk in the settings control.

**Benefits:** turns the complete-but-idle rich-text machinery (Units N/S) into a usable feature; a low-cost global toggle with a **safe default (textarea)** preserves current behavior and lets operators opt into rich editing; graph-is-authoritative, commit-on-blur, and MCP/UI equivalence are preserved; the RAG store stays authoritative.

**Net: clearly positive.**

## 4. Resolved design summary (A–I)

- **A** New `setRichText` combined op (atomic putNode, ONE content journal entry, `kind:'content'` broadcast) + `IPC_EDIT_RICH_COMMIT` + preload `edit.commitRich`. `applyBatch` untouched (still rejects Unit O ops).
- **B** Discriminated `CaretState` = `{kind:'textarea'}` | `{kind:'rich'; ragId; anchor; focus; focused}` with path-based `RichCaretEdge`; restored after re-derive.
- **C** Host `applyEditingMode(envelope)` splice (in `loadAppGraph` after `setTextareaReadOnly`, before `recomputeBackRefs`): remove textarea + set `contenteditable:true` on the root when contenteditable + rich-eligible. New `operator-settings-changed` broadcast → `requestRebuild` → `reDerive`. Traversal stays pure.
- **D** One new DECIDED row superseding FORM-CONTROL-EDITING's 'NOT contenteditable' + the 'no global editingMode field' clause; textarea remains the default.
- **E** Pure `isRichEditableRoot(type, ownsDocChildren)` (new `src/renderer/rich-eligibility.ts`): EDITABLE_TYPES = h1–h6/p/blockquote/div && !ownsDocChildren; else textarea.
- **F** Pure `decomposeRichHtml(rawHtml)` (new `src/main/rich-decompose.ts`), reusing paste-sanitize's tokenizer + URL helpers (exported additively); b/i→strong/em; unwrap u/font/span/div/br; re-validate a href/img src; emits `{content, children}` in document order; TOTAL.
- **G** Rich handler defs (rag-editor-input/blur/compositionstart/compositionend) + bridge methods; decomposition ONCE in host `editorBlur` (never the handler body); blur prefers dispatch-provided html (MCP) else `getElementById('rag-'+ragId).innerHTML` (UI).
- **H** Composition guard keyed by ragId (`composingRagId` + `pendingCommitRagId`).
- **I** Dirty + caret keyed by ragId; commit once; documented first-materialization innerHTML-read limitation (adversarial regression test).

**Supporting change:** `RagSnapshotPayload.nodes` gains `children?: Array<{type;content;props?}>` (additive; required so a rich re-derive preserves inline children).

## 5. Unit plan

Order **U2 → U3 → U1 → U5 → U4** (confirmed; no split/merge). U3's pure functions take editingMode injected (testable before U1); U1 supplies the field + control + broadcast; U3 includes the `loadAppGraph` splice invocation + integration test; U4 is last (highest risk, depends on U2/U5/U3/U1). Each unit is its own red→green→adversarial→greens→doc-review cycle per AGENTS.md (RCA-1/2/3/6).

| Unit | Title | Files |
| --- | --- | --- |
| **U2** | blur HTML→RagNodeChild[] decomposition (pure) | `src/main/rich-decompose.ts`, `src/main/paste-sanitize.ts` (additive exports) |
| **U3** | eligibility + host splice + snapshot children field | `src/renderer/rich-eligibility.ts`, `src/renderer/sidebar-panes.ts`, `src/shared/types.ts` |
| **U1** | editingMode operator setting + Settings control + re-derive broadcast + supersession | `src/shared/types.ts`, `src/main/operator-settings-store.ts`, `src/main/main.ts`, `src/main/preload.ts`, `src/renderer/sidebar-panes.ts`, `docs/decisions.md` |
| **U5** | atomic write-back op + IPC/bridge | `src/main/edit-ops.ts`, `src/shared/types.ts`, `src/main/main.ts`, `src/main/preload.ts` |
| **U4** | contenteditable handlers + bridge + caret + IME + re-derive restore | `src/renderer/edit-controller.ts`, `src/renderer/sidebar-panes.ts`, `src/main/preload.ts` |

---

## Bottom line

**PROCEED-WITH-AMENDMENTS** on the full 5-unit deliverable. The architecture is sound and grounded; the amendments above (control fallback, no-loop broadcast, round-trip decompose invariant, cross-unit textarea gate, IME dangling-commit drop, documented first-materialization limitation, UI-IPC-only rich commit, contenteditable attribute pin) are the conditions of that verdict.
