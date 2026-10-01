# REBUILD DRIFT MAP — which live code the landed specs supersede, what consumes it, and which tests pin it

> **⟶ CITATION REPOINT `2026-10-04` (the ARCHIVE-MOVE pass of `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`'s EXEMPT-ENGINE class; `RCA-8(c)` — every reading, row and count below is KEPT AS FILED and nothing is rewritten; only the PATHS are repointed, and the as-filed `tests/<name>.test.ts` form remains readable as the file's name).** **The `8` MOVABLE `EXEMPT-ENGINE` suites were moved byte-identically by `git mv` to `archive/tests/2026-10-04-<name>.test.ts`** (`blind-unit-a2-document-crud-wiring-greens` · `blind-unit-gn-engine-integration-greens` · `blind-unit-gn-mcp-ui-wiring-greens` · `engine-crud-real-transport` · `props-a1-crud-routing-proxy` · `unit-a1-crud-routing-proxy` · `unit-gn-engine-integration` · `unit-shell-integration`; no byte edited, `md5` identical per file, nothing deleted). **Every citation of those paths in this file now names the archive address.** **PER `archive/README.md` THE ARCHIVE IS NOT A CITABLE SOURCE OF AUTHORITY** — the archive path is a HISTORICAL POINTER; the authority for each subject remains its owning unit spec / tracker row. **(The task's "repoint every citation in `tests/**`" arm is DISCHARGED-EXCEPT-ONE and recorded: `tests/unit-gn-mcp-ui-wiring.test.ts:25` carries a stale `tests/**` comment citation left BYTE-UNTOUCHED, because the same task forbids editing any test file's content — recorded as an unresolved conflict, never repaired by guessing.)**


**Date:** 2026-09-21 · **Pass kind:** READ-ONLY DRIFT-MAP AUDIT (**one** write: this file) · **Layer
(RCA-12, mandatory):** **DOC-LAYER / audit record — NOT app-green, NOT envelope-green, NOT
store-green, NOT live-green.** Every source-mapping claim below is a **code read**; every test claim
is a **grep reading**; every suite count is a `npm test` reading unless a spec row is quoted as such.

**Authority for the rebuild.** `docs/decisions.md` `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE):
*a test whose subject the specs supersede is **ARCHIVED, not adapted**; the archive is the **rebuild's
INPUT**; the coverage hole is **RECORDED, not hidden**; no archived file may be restored except
through its owning unit's cycle with a **fresh red set***. It **SUPERSEDES**
`DECIDED: PRUNING-FOLLOWS-THE-IMPLEMENTING-UNIT` (retained as provenance only). The product-owner
instruction this map executes is quoted in
`docs/specs/test-pruning-disposition-2026-09-21.md` §9.1: *"rewrite/delete tests that do not
represent updated behavior. Archive code that doesn't align with tests."*

**Citation discipline.** Per `docs/specs/requirement-catalog.md` §3.4 rule 7, every claim cites a
`path` + **symbol** / **row id** / **§section**. **No line numbers appear in this file** (the
`docs/decisions.md` cells quoted in the specs do carry them; they are not reproduced here).

**The unit set this map covers (four units, `docs/specs/design-extensions-review.md` §3.3 C + §13.1
P2):**

| Unit | Ids | Phase | Spec status (this pass's read) |
| --- | --- | --- | --- |
| **C9 `U-EDIT-1`** (the `WHOLE-PAGE-EDITING` unit) | `ST-1` (non-live-markdown half), `ST-3`, `ST-4`, `ST-5`, `ST-6` | **P3** (`§13.1` P3) | **MISSING** — see §1.1 |
| **C11 `U-SEARCH`** (the `C13`-removal half + `PN-1` visibility) | `SR-1`, `SR-2`, `SR-4`, `SR-5` + the `C13` removal | **P3** | **MISSING for the removal half** — see §1.2 |
| **P2 `U-READS-PIVOT`** | the read model, `docs/specs/design-extensions-review.md` §12 | **P2** | **PRESENT** — `docs/specs/unit-reads-pivot-tab-cache.md` |
| **P2 `U-AUTHORITY-SWITCH`** (`O-8`) | the authority switch / offline dual-path | **P2** | **PRESENT** — `docs/specs/unit-authority-switch.md` |

**Two sibling P2 units are read for their boundary rules only** (they are not among the four per-unit
sections, because neither owns a `tests/**` re-derivation obligation —
`docs/specs/test-pruning-disposition-2026-09-21.md` §9.4): `docs/specs/unit-corpus-migration.md`
(`U-CORPUS-MIGRATION`) and `docs/specs/unit-engine-persist.md` (`U-ENGINE-PERSIST`). Their
module lists are recorded in §6 because they **gate** `U-AUTHORITY-SWITCH`.

---

## 0. THE SPEC GATE (AGENTS.md item 9) — a unit without a spec cannot be delegated

`AGENTS.md` item 9: *"a code unit is only delegable once (a) its `docs/specs/*.md` contract exists,
(b) a TestWriter unit has run and reported the red set."* `docs/specs/design-extensions-review.md`
§13.3 makes the same gate per-unit. Applying it to the four:

| Unit | Spec exists? | Evidence (this pass's read) | Verdict |
| --- | --- | --- | --- |
| **C9 `U-EDIT-1`** | **NO** | `docs/specs/unit-u-edit-1-markdown-html-toggle.md` is the **markdown/HTML toolbar toggle** unit (C8) — it pins `editorToolbarContent`/`applyEditorToolbar` and flips the **existing** `editingMode` seam; it does **not** state the whole-page single-block contract. `docs/specs/unit-l-textarea-editing-ui.md` + `docs/specs/unit-d-editing.md` pin the **per-node form-control** model `WHOLE-PAGE-EDITING` SUPERSEDES. No file matching `whole-page` / `page-edit` exists under `docs/specs/` (glob `docs/specs/*whole*`, `docs/specs/*page-edit*`), and `WHOLE-PAGE-EDITING`'s own text reads *"(REQUIREMENT, not yet implemented)"* + *"Owes a spec re-derivation"* | **`SPEC-MISSING — the unit's spec must be authored before any test or code change`** |
| **C11 `U-SEARCH`** (the `C13`-removal half) | **NO for the removal half** | `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` is the **C13 IMPLEMENTATION** spec ("Status: GREEN — COMPLETE"), i.e. the thing being removed. `PN-1`'s visibility clause is *"subordinated to `C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` + `LIVE-12`"* (`docs/specs/design-extensions-review.md` §3.6 F item 8 / §10.4 item 8). The removal instruction lives on a **decision row** and a **defect row**, not in a spec | **`SPEC-MISSING — the unit's spec must be authored before any test or code change`** (the `SR-1`/`SR-2`/`SR-4`/`SR-5` half is *also* spec-less: no `docs/specs/unit-u-search*` file exists) |
| **P2 `U-READS-PIVOT`** | **YES** | `docs/specs/unit-reads-pivot-tab-cache.md` (DRAFT, "the contract for this unit"; gate satisfied by the file **plus a reported TestWriter red set**, which does **not** yet exist) | **delegable on the spec half; red set owed** |
| **P2 `U-AUTHORITY-SWITCH`** | **YES** | `docs/specs/unit-authority-switch.md` §12.1 (the cycle) + §12.2 (the touch set) | **delegable on the spec half; red set owed** |

**Consequence, stated plainly.** The rebuild may **start** on the two P2 units and **may not start**
on C9 or C11. Two of the four units are **gated on a doc-layer authoring pass** that this map cannot
perform (this pass writes one file). That is the first honest blocker (§6).

---

## 0a. THE BASELINE READING (this pass's own, RCA-1's "run it, don't plan it")

| Item | Reading | Provenance |
| --- | --- | --- |
| `npm test` (this pass, 2026-09-21) | **180 files / 3 846 passed / 44 skipped / 0 failed** | ran by this pass; matches `docs/specs/test-pruning-disposition-2026-09-21.md` §9.5's post-move row **exactly** (no drift since the archive pass) |
| `tests/*.test.ts` on disk | **180** | `ls tests/*.test.ts` |
| `archive/tests/2026-09-21-*.test.ts` on disk | **41** | `ls archive/tests/` — matches §9.4's rebuild map total (43 moved − 2 restored in-pass, §9.3) |
| Vitest collection surface | `tests/**/*.test.ts` (`vitest.config.ts` `include`), `testTimeout: 15_000` | the three `.test.mjs` files are outside it (§9.3a) |
| The two 10 000-deep budget tenants | `tests/unit-u2-rich-decompose.test.ts` `ADR-4` + `tests/unit-s-paste-sanitization.test.ts` `Tokenizer F1`, pinned by `tests/unit-v5-migration-contract.test.ts` `DEEP_ROWS` | the same file pins `tests/unit-import-batch-persist-contract.test.ts` via `join(TESTS_DIR, …)` |
| **Repo-wide constraint** | **the `vitest-5 / electron-44` toolchain migration BLOCKS every unit's `npm test` leg** | `docs/next-steps.md` §OPEN, `TEST-SUITE REBUILD OBLIGATIONS`'s carried-obligations paragraph. This pass's 180/0 run reads **green**, so the constraint is a *recorded standing risk*, not a present failure — but no unit may report a trio green **from a plan** (`docs/specs/design-extensions-review.md` §14.2: *"No unit may report the fence green from a plan"*) |

**Citation debt, measured.** `grep -rEo` over `docs/` for the 41 archived basenames +
their `2026-09-21-` forms returns **380 citation occurrences across 39 `docs/**` files** —
consistent with §9.7's *"≈200 file-citations across ~40 unit specs"* (the 380 counts
**occurrences**, the ≈200 counts **files cited**; both readings are recorded so no later pass
re-derives one and calls the other wrong). The per-unit repoint duty is §5 step (v) below.

---

## 1. PER-UNIT SECTION — **C9 `U-EDIT-1`** (the `WHOLE-PAGE-EDITING` unit)

> **`SPEC-MISSING — the unit's spec must be authored before any test or code change`** (§0, AGENTS.md
> item 9). **Nothing in this section authorizes a code change.** The source map is produced so the
> spec author writes the contract against **the exact modules the new behavior must delete**, and so
> no later pass re-derives them.

### 1.1 The obsolete-behavior inventory

| # | NEW behavior (one line) | Pinned by | OLD behavior (one line) |
| --- | --- | --- | --- |
| C9-1 | The stage is **ONE editable surface** for the whole document (one editing block; a selection spans paragraph boundaries; the title and table cells are editable) | `docs/decisions.md` `DECIDED: WHOLE-PAGE-EDITING`; `docs/feature-requests/design-extensions-2026-09-21.md` §2.4 `ST-1`; `docs/defects.md` `WHOLE-PAGE-EDITING-REQUIREMENT` | Each paragraph / table cell is its **own** `contenteditable` host, and in textarea mode each RAG node is its **own** `textarea` |
| C9-2 | **Textarea editing is REMOVED** — rich text is the default; markdown mode is the rich-text contenteditable stage **as plain text**, not a form control | `docs/feature-requests/design-extensions-2026-09-21.md` §2.4 `ST-6`; `docs/specs/design-extensions-review.md` §3.3 C `C9` (ids incl. `ST-6`); `docs/decisions.md` `DECIDED: WHOLE-PAGE-EDITING` | `editingMode: 'textarea' \| 'contenteditable'` with the textarea the opt-in legacy control and the per-node `textarea-<ragId>` overlay authored by the traversal |
| C9-3 | On blur the stage **diffs its content** and updates **only the changed sub-elements**, against the **in-house** module `src/main/rich-decompose.ts` `decomposeRichHtml` — never "the provident-editable import tools" | `docs/feature-requests/design-extensions-2026-09-21.md` §2.4 `ST-4`; `docs/specs/design-extensions-review.md` §3.3 C `C9` collision discipline (**explicitly names the in-house module**); `docs/decisions.md` `DECIDED: RICH-TEXT-EDITING-GATE` | The per-node control commits its **whole** node content on blur (`textareaBlur` / `rag-editor-blur` → one `setContent`/`setRichText` per node) |
| C9-4 | The document **name/heading is visually divided** from the body; editing the heading commits the **document title** on blur; the caret moves heading → body first line and back by arrow keys | `docs/feature-requests/design-extensions-2026-09-21.md` §2.4 `ST-3`; `docs/decisions.md` `DECIDED: WHOLE-PAGE-EDITING` (*"the doc title … not editable at all"*); `docs/defects.md` `DOC-TITLE-NOT-EDITABLE` | The doc-head `h1` is a plain rich-eligible root; the document **title** has no commit path |
| C9-5 | A failed commit raises a **user-visible warning** in the document's **tab** (the `TAB-1` warning-symbol class), and the tab enters `commit-failed` | `docs/feature-requests/design-extensions-2026-09-21.md` §2.4 `ST-5` + §2.5 `TAB-1`; `docs/specs/design-extensions-review.md` §12.4 (the dirty machine) + §12.5 (failure UX) | The commit failure surfaces as a **per-node** in-stage warning strip (`commitUi` / the Option-C strip), with no tab-scoped state owner |
| C9-6 | **The commit path becomes an ASYNC ENGINE WRITE** — a recorded REVERSAL; commit = one `applyBatch` = **one invertible `batch` journal entry**; no unit implements an async commit before the restatement | `docs/specs/design-extensions-review.md` §12.7(**a**) (the reversal, by name, of `docs/specs/astrographer-scope-realignment-review.md` §3.3's WRITE PATH row); §14.1 `C-6`; `docs/specs/unit-reads-pivot-tab-cache.md` §6.1/§6.3; `docs/decisions.md` `DECIDED: BATCH-ATOMICITY-API` + `DECIDED: PROJECT-JOURNAL` + `DECIDED: C16-CONSUMES-PROJECT-JOURNAL` | `edit.*` / `IPC_EDIT_COMMIT` / `IPC_EDIT_BATCH` / `IPC_EDIT_RICH_COMMIT` call the **synchronous local** `RagStore` op; `src/main/edit-ops.ts`'s ops write the local store and the host re-traverses |

**Rows the C9 landing owes (SUPERSEDED, `docs/specs/design-extensions-review.md` §3.3 C `C9`).**
`DECIDED: EDITING-MODE-SETTING` and `DECIDED: FORM-CONTROL-EDITING` are the two rows **the C9
landing pass writes `SUPERSEDED` against** — the gate record puts that in the unit's own landing
pass, not in this map. Also superseded in substance: `DECIDED: RICH-TEXT-EDITING-GATE`'s per-node
sequencing (its must-fix items are all MET and its **units survive**; only the *per-node* control
model is what `ST-1`/`ST-4`/`ST-6` replace), and `DECIDED: TEXTAREA-PROVIDENT-AUTHORING` /
`DECIDED: TEXTAREA-BRIDGE-SURFACE` / `DECIDED: TEXTAREA-RENDER-ONLY-OVERLAY` /
`DECIDED: TEXTAREA-READONLY-HOST-SET` (the four textarea rows).

**Catalog pointer rows (ADVISORY — read for the pointer target, never as status;
`DECIDED: ADVISORY-REQUIREMENT-CATALOG` clauses (1)/(2)).** The affected C9 capability rows live in
`archive/catalog-authoring/2026-09-21/CL-3.md` (§C.3 part 1; gitignored authoring artifact):

| Row id | Its statement (abridged) | `status_pointer` / `code_anchor` | What C9 does to it |
| --- | --- | --- | --- |
| `PRUNE-160` | *"The stage's main view is editable and an ordinary edit commits to the store on blur."* | `docs/specs/user-flow-audit-checklist.md#UF-KEEP-2`; anchor `applyEditingMode`; verdict **`keep-advisory`** — a **RETAINED KEEP ROW** carrying a live re-drive PASS + a live-confirmed regression pin | **The behavior SURVIVES, the anchor MOVES.** C9 must keep commit-on-blur (`DECIDED: EDITING-MODE-SETTING`'s *"Commit-on-blur … RETAINED"* clause) but repoint the anchor from the **per-node** `applyEditingMode` to the single stage editor. Re-homed by C9's landing pass; **never pruned** |
| `PRUNE-105` (merged `→ PRUNE-127`) | *"The View application menu exposes a pane-visibility dropdown …"* (`direction: wants-removal`) | `src/main/app-menu.ts` `buildMenuTemplate` | **Not C9's** — see §2 |
| `PRUNE-136` / `PRUNE-170` (merged) | *"The editor toolbar and the history surface render inside a pane frame rather than in the central stage."* | `docs/defects.md#HISTORY-NOT-DROPDOWN`; anchor `paneSubtreeRoot`; `keep-advisory` | **Adjacent, not C9-owned.** C9 owns the toolbar's **mode** behavior, not its placement (`PRUNE-136`'s own cell says so). Do **not** fold this into C9 |
| `PRUNE-836` (CL-5) | *"Rich-text HTML from the editing surface converts into a provident tree by pure modules, with a minimal diff applied as store edits."* | — | **This is `ST-4`.** Its "pure modules" = `src/main/rich-decompose.ts` + `src/main/paste-sanitize.ts` (both survive); its **"minimal diff"** = the C9 whole-document diff, which replaces the per-node whole-content commit |

### 1.2 The source map (verified by reading the code)

**Grep family run for this section** (recorded so each claim is re-runnable):
`grep -rn "textarea\|contenteditable\|ragId\|editingMode" src/main/traversal.ts` ·
`grep -rn "contenteditable" src/` · `grep -rn "applyEditingMode" src/ tests/` ·
`grep -rn "rich-eligibility\|isRichEditableRoot\|EDITABLE_TYPES" src/ tests/` ·
`grep -rn "RAG_EDITOR_HANDLER_DEFS\|rag-editor-\|rag-textarea-\|setTextareaReadOnly" src/` ·
`grep -rn "main/edit-ops" src/ tests/` · `grep -rln "edit-controller" src/ tests/` ·
`grep -rn "paste-sanitize\|sanitizePastedHtml\|rich-decompose\|decomposeRichHtml" src/`.

| Path + symbol | What it does (the OLD behavior) | Class | Surviving consumers (PARTIALLY-SHARED only) |
| --- | --- | --- | --- |
| `src/main/traversal.ts` → `buildTraversal`'s inner `buildSubtree`, **the `type: 'textarea'` child** (`props.id: \`textarea-${ragId}\``, `data-rag-node-id`, `value: node.content`, handlers `rag-textarea-input` / `rag-textarea-blur`) | Authors a **per-RAG-node textarea editing overlay** as a child of every subtree root in the traversal output | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** (the child authoring). `buildTraversal` / `computeDocumentSubgraph` / `rebuildBackRefs` / `DocumentSubgraph` / `CROSSLINK_LINK_CONFIG` are **UNAFFECTED** — `buildTraversal` stays host-side and in-process (`docs/specs/design-extensions-review.md` §14.2) | — (the module survives; the child authoring does not) |
| `src/main/traversal.ts` → `assignSubtreeRanges`, the comment pinning the overlay as *"a render-only child"* | The line→node map excludes the overlay from the markdown range measurement | **PARTIALLY-SHARED** — the comment/comment-contract must be rewritten in the same pass that deletes C9-1's child | `renderSubtreeMarkdown`'s measurement |
| `src/renderer/rich-eligibility.ts` → `isRichEditableRoot(type, ownsDocChildren)` + `EDITABLE_TYPES` | The **per-node gate** deciding whether a RAG subtree root may host a `contenteditable` editor (9 members: `h1`–`h6`, `p`, `blockquote`, `div`) | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** — under one whole-page block there is no per-node eligibility question. Its only `src/` importer is `src/renderer/sidebar-panes.ts` (`import { isRichEditableRoot } from './rich-eligibility.js'`), inside `applyEditingMode` | **importer to change first:** `src/renderer/sidebar-panes.ts` |
| `src/renderer/sidebar-panes.ts` → `applyEditingMode(envelope, editingMode)`, **the contenteditable-only strip**: the `editingMode !== 'contenteditable'` early return, the `c.type !== 'textarea'` child filter, the `ownsDocChildren` computation, `n.props = { …, contenteditable: true }`, and the `RAG_EDITOR_HANDLER_DEFS` append-if-absent | Walks every `rag-`-prefixed subtree root in the assembled envelope, **removes** the traversal's `textarea-<ragId>` child for **ALL** roots (not just rich-eligible ones — the pinned behavior: `docs/decisions.md` `DECIDED: EDITING-MODE-SETTING`'s `1af5000` "Render fix" note; `docs/specs/unit-u1-editing-mode-setting.md` ADR-8 / "amendment 4"), and splices `contenteditable: true` **only** onto rich-eligible roots | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** as a whole method | its call sites are all inside the same host (`applyEditingMode` is called at 5 places, all in `src/renderer/sidebar-panes.ts`) |
| `src/renderer/sidebar-panes.ts` → `setTextareaReadOnly(envelope)` + its 4 call sites | Sets `readOnly: true` on the per-node textarea when `editController.isEditable(ragId)` is false (`DECIDED: TEXTAREA-READONLY-HOST-SET`) | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** | — (all call sites in the same host) |
| `src/renderer/sidebar-panes.ts` → `RAG_EDITOR_HANDLER_DEFS` (`rag-editor-input` / `-blur` / `-compositionstart` / `-compositionend`) + their `registerHandlerDef` bodies (`RAG_EDITOR_INPUT_BODY`, `RAG_EDITOR_BLUR_BODY`, `RAG_EDITOR_COMPOSITIONSTART_BODY`, `RAG_EDITOR_COMPOSITIONEND_BODY`) | The 4 name-referenced contenteditable handler defs, registered + spliced onto each eligible root | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** as a *per-node* set; the **whole-page** editor needs its own handler defs (C9's spec authors them) | — |
| `src/renderer/sidebar-panes.ts` → `TEXTAREA_INPUT_BODY`, `TEXTAREA_BLUR_BODY`, `registerHandlerDef('rag-textarea-input'|'rag-textarea-blur')`, `textareaInput(ragId)`, `textareaBlur(ragId, value)`, and the bridge surface `bridge.textareaInput` / `bridge.textareaBlur` | The textarea commit-on-blur write-back path (Unit L) | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** (C9-2 removes textarea editing) | — |
| `src/renderer/sidebar-panes.ts` → `pendingRichEdits` + the `decomposeRichHtml` call sites + `bridge.edit.commitRich` | The per-node rich-text commit path (Unit U5) | **PARTIALLY-SHARED** — the **commit** plumbing (`commitRich` → `IPC_EDIT_RICH_COMMIT` → `setRichText`) is re-shaped by C9-6 (async engine write) but **the dirty-edit guard, the queue and the re-derive are RETAINED** (`DECIDED: EDITING-MODE-SETTING`: *"Commit-on-blur, the dirty-edit guard, RAG-authoritative re-traversal, and all-UI-via-provident authoring are RETAINED"*) | `src/renderer/edit-controller.ts` → `markDirty`/`clearDirty`/`anyDirty`/`requestRebuild` are used by the **template editor** (`template-zone-add`/`-remove`/`-reset`) and by 3 guard sites in `submitQuery`-class paths — **independent of the editing model** |
| `src/renderer/edit-controller.ts` → `type CaretState = { kind:'rich'; ragId; anchor; focus; focused } \| { kind:'textarea'; offset; focused }` and `RichCaretEdge`; `saveCaret` / `restoreCaret` / `clearCaret`; `isEditable(nodeId)` | The discriminated per-control caret state + the per-node writability predicate | **PARTIALLY-SHARED** — **this is the clearest surgery site in C9.** `edit-controller.ts` has **27 test-file importers + 2 `src/` importers** (`sidebar-panes.ts`, `renderer.ts`); the module **survives** (the dirty guard + the commit + the rebuild queue are retained), while the **caret model** and `isEditable` are per-node-editor artifacts that the whole-page model replaces | `src/renderer/sidebar-panes.ts` (the caret-restore loop in `applyContentChange`/the rich splice), `src/renderer/renderer.ts` |
| `src/renderer/pane-graph.ts` → `editorToolbarContent(editingMode, zone, journal)` | Authors the app-graph toolbar that reflects/flips `editingMode` | **PARTIALLY-SHARED** — C9 replaces the *`textarea` ↔ `contenteditable`* meaning of the toggle with the document's **rich-text / markdown-plaintext** meaning (`ST-1` + `ST-6`); the toolbar node survives | `src/renderer/sidebar-panes.ts` → `applyEditorToolbar` |
| `src/renderer/cross-document-shared.ts` → `scopeDocumentIds`, `plainRagId` | The per-document id namespace rewrite; its **`textarea-` branch** is part of the C9-1 namespace | **PARTIALLY-SHARED** — a real live consumer of the `textarea-` branch: `archive/tests/2026-10-04-unit-u-shell-9b-h3-doc-namespace.test.ts` (asserts `textarea-DOC--X`) | C9's landing drops the `textarea-` branch and the row's assertion with it |
| `src/main/rich-decompose.ts` → `decomposeRichHtml`, `DecomposeRichResult` | **PURE** converter: contenteditable-blur HTML → `RagNodeChild[]` | **UNAFFECTED** — `ST-4` **names this module** and its pure-module shape is exactly what the new diff needs | `src/renderer/sidebar-panes.ts`; pinned by `tests/unit-u2-rich-decompose.test.ts` |
| `src/main/paste-sanitize.ts` → `sanitizePastedHtml`, `parseHtml`, `normalizeUrl`, `isSafeUrl` | **PURE** paste-time sanitizer / parser reused **additively** by `rich-decompose` | **UNAFFECTED** (`DECIDED: PASTE-SANITIZATION`; `PRUNE-836`'s "pure modules") | `src/main/rich-decompose.ts`; pinned by `tests/unit-s-paste-sanitization.test.ts` |
| `src/main/edit-ops.ts` → `setContent`, `setRichText`, `setSubtree`, `setProps`, `setType`, `createNode`, `deleteNode`, `splitNode`, `mergeNode`, `setEdge`, `setDocMeta`, `handleEditCommit`, `handleEditBatch`, `handleRichCommit`, `handleRichCommitIpc`, `deriveBatchBroadcast`, `deriveRichCommitBroadcast` | The 11-op write-back layer + the IPC commit handlers (`DECIDED: EDIT-OP-CENSUS`) | **UNAFFECTED as a module; the COMMIT SHAPE is C9-6's restatement.** `docs/specs/design-extensions-review.md` §12.7(a) names `edit-ops.ts` in the **reversed** exclusion, so every op's local-`RagStore` target becomes an engine hop — but **no op is deleted** and `applyBatch` remains the commit primitive | `src/main/mcp-server.ts` + 7 test files import it |
| `src/main/doc-flow.ts`, `src/main/markdown-import.ts` | Named in the same reversed WRITE PATH exclusion (`docs/specs/design-extensions-review.md` §12.7(a)) | **UNAFFECTED** — C9 does not own them; the reversal only means their *target* may move | — |

**What is NOT an archive candidate in C9** (verified so a later pass does not over-prune):
`src/main/traversal.ts` (the fence's subject), `src/main/edit-ops.ts`, `src/main/rich-decompose.ts`,
`src/main/paste-sanitize.ts`, `src/renderer/edit-controller.ts` (the module), `src/renderer/pane-graph.ts`,
`src/main/rag-store.ts` (`applyBatch` is C9's commit primitive — `docs/specs/design-extensions-review.md`
§3.3 C `C9` collision discipline).

### 1.3 The consumer map (for every C9 archive candidate: who must change first)

| Candidate | `src/**` importers | `tests/**` importers | `scripts/**` | Config / `package.json` | Dependency-ordered change list |
| --- | --- | --- | --- | --- | --- |
| `src/renderer/rich-eligibility.ts` | `src/renderer/sidebar-panes.ts` (only) | **1** — `archive/tests/2026-10-04-unit-u-shell-9b-h2-c20-materialization.test.ts` (the row *"the synthetic owners box does not flip a shared root out of rich-eligibility (contenteditable)"*) | none | none | **(1)** `sidebar-panes.ts` `applyEditingMode` removal → **(2)** the C20 test row's re-derivation → **(3)** archive `rich-eligibility.ts` |
| `applyEditingMode` + `setTextareaReadOnly` + `RAG_EDITOR_HANDLER_DEFS` + the textarea bridge members (all inside `src/renderer/sidebar-panes.ts`) | the host itself | the whole-page suites (below) + `archive/tests/2026-10-04-sidebar-panes.test.ts`'s *"the three app-graph panes are read-only (no edit/textarea/commit controls in their content)"* row | `scripts/live-drive.mjs` (the live blocks that click the toolbar / a textarea) | none | **(1)** the C9 spec → **(2)** the red set → **(3)** `sidebar-panes.ts` surgery in one pass → **(4)** **no archive move** (the module survives) |
| `buildSubtree`'s `type:'textarea'` child (`src/main/traversal.ts`) | the host (via the envelope) | **the fence** `tests/traversal.test.ts` (row 8 asserts `childIds` `=== [undefined, 'textarea-ul', 'rag-li1'…]`) + `tests/unit-r-traversal-inline-children.test.ts` (rows 3/4/5/6 assert the *"[inline children, textarea overlay, doc-children subtrees]"* order) | none | none | See §1.5 step (iii-b) — **this is a blocking collision, not a normal importer** |
| `src/renderer/edit-controller.ts`'s caret model + `isEditable` | `sidebar-panes.ts`, `renderer.ts` | **27 files** import the module; the **caret/`isEditable`-specific** rows are in `archive/tests/2026-10-04-unit-u-shell-9b-blind-greens.test.ts` (the `textareaInput`/`textareaBlur`/`sidebarApi().textarea*` rows) and `archive/tests/2026-10-04-unit-live8-toolbar-undo-refresh.test.ts` | none | none | **(1)** spec → **(2)** red set on the **caret model** (module stays) → **(3)** surgery → **(4)** the 27 importers need **no** change unless they touch caret |
| the four textarea rows (`DECIDED: TEXTAREA-*`) | — | — | — | — | doc-layer: `SUPERSEDED` rows in C9's landing pass |

**Named importers that must change BEFORE any archive move, in dependency order** (a module with a
live importer cannot be archived before that importer is changed):

1. `src/renderer/sidebar-panes.ts` — the sole `src/` importer of `rich-eligibility.ts`, and the owner
   of every C9 renderer artifact.
2. `src/main/traversal.ts` — the author of the overlay the host strips.
3. `src/renderer/pane-graph.ts` — the toolbar's authoring half.
4. `src/renderer/cross-document-shared.ts` — the `textarea-` id-namespace branch.

### 1.4 The test disposition

**Already archived (C9, 17 files; `docs/specs/test-pruning-disposition-2026-09-21.md` §9.4).** All 17
are in `archive/tests/2026-09-21-*.test.ts`:
`unit-l-textarea-editing-ui` · `contenteditable-editor-host` · `contenteditable-caret` ·
`editing-mode-broadcast-host` · `operator-settings-editing-mode` · `rich-splice` · `rich-eligibility` ·
`unit-u-edit-1-markdown-html-toggle` · `unit-u5-set-rich-text` · `unit-m1-inline-offset-model` ·
`unit-o-edit-ops` · `unit-p-ipc-edit-batch` · `unit-n-batch-atomicity` · `unit-u-edit-2-undo-redo-history` ·
`edit-controller` · `edit-ops` · `edit-adversarial`.

**Verified: no live `tests/**`, `src/**` or `scripts/**` file imports any of the 17** (grep reading:
per-basename `grep -rl`; the 8 apparent hits are **comments**, not imports — e.g. `src/renderer/sidebar-panes.ts`
cites `unit-l-textarea-editing-ui.md`'s **spec**, not the test; `archive/tests/2026-10-04-unit-live8-toolbar-undo-refresh.test.ts`
cites `unit-u-edit-2-undo-redo-history` in a comment). **So no archived C9 file blocks the rebuild** —
unlike the Authority-Switch set (§3.3, where none are blocked either) and unlike the two **protected**
files §1.4b names.

**§1.4b — the two PROTECTED files C9 may NOT archive (this is the trap the last pass hit).**
`tests/unit-v5-migration-contract.test.ts` pins, **by path**, four files:

| Protected file | Pin | Why |
| --- | --- | --- |
| `tests/unit-u2-rich-decompose.test.ts` | `DEEP_ROWS` row `ADR-4` (`fn: 'decomposeRichHtml'`) | the **depth-10 000 budget tenant** (`docs/specs/test-pruning-disposition-2026-09-21.md` §5.3) |
| `tests/unit-s-paste-sanitization.test.ts` | `DEEP_ROWS` row `Tokenizer F1` (`fn: 'sanitizePastedHtml'`) | the same budget |
| `tests/unit-u5-rich-commit-ipc.test.ts` | the derived **electron-mock census** list | a **path-and-name** pin (§9.3's restore table) |
| `tests/unit-import-batch-persist-contract.test.ts` | `join(TESTS_DIR, …)` (Pin 4 + §2a C-4) | §3.3.4's substantiated exclusion |

The last pass moved three of these, found the protected file **red**, and `git mv`-ed them back
(`docs/specs/test-pruning-disposition-2026-09-21.md` §9.3/§9.6). **C9's rebuild must treat all four
as immovable** and re-derive them **in place**.

**The remaining 180 suites that pin OLD C9 behavior → `REWRITE` / `DELETE` / `KEEP`.**

| File (of the 180) | The pinned OLD behavior | Disposition | Derived from |
| --- | --- | --- | --- |
| `tests/traversal.test.ts` | row 8: *"the ul's body is a bare `text` child …, **then the textarea editing overlay**, then the doc-children"* — `childIds === [undefined, 'textarea-ul', 'rag-li1'…]` | **`REWRITE` (C9 owns it — and see the blocker in §1.5)** | the C9 whole-page spec (`ST-1`/`ST-6`) |
| `tests/unit-r-traversal-inline-children.test.ts` | rows 3/4/5/6: the inline-vs-textarea id disambiguation and the *"[inline children, textarea overlay, doc-children subtrees]"* order | **`REWRITE`** | the C9 spec's child-order contract |
| `archive/tests/2026-10-04-unit-u-shell-9b-h3-doc-namespace.test.ts` | *"rewrites `rag-`/`textarea-`/`inline-` ids with a `<documentId>--` scope"* | **`REWRITE`** (drop the `textarea-` branch) | the C9 spec + `docs/specs/unit-u-shell-9b-cross-document-shared.md` §2.7 (the scope carrier itself is unaffected) |
| `archive/tests/2026-10-04-unit-u-shell-9b-h2-c20-materialization.test.ts` | *"the synthetic owners box does not flip a shared root out of rich-eligibility (contenteditable)"* | **`REWRITE`** (the eligibility question disappears) | the C9 spec + §2.8 |
| `archive/tests/2026-10-04-unit-u-shell-9b-blind-greens.test.ts` | the `sidebarApi().textareaInput(...)` / `textareaBlur(...)` commit rows (12+ call sites) driving the per-node textarea write-back | **`REWRITE`** — the commit assertions survive, the **driver** changes to the whole-page surface | the C9 spec |
| `archive/tests/2026-10-04-sidebar-panes.test.ts` | *"the three app-graph panes are read-only (no edit/textarea/commit controls in their content)"* | **`KEEP`** — it asserts the **absence** of editing controls **inside the panes**, which the whole-page stage model preserves; only the comment's `Unit L §5.1` citation repoints | — |
| `archive/tests/2026-10-04-sidebar-panes-host.test.ts` | the harness's `textareaBlur` bridge function existence + a 1-hit `editingMode` comment | **`REWRITE` (small)** | the C9 spec |
| `archive/tests/2026-10-04-unit-live8-toolbar-undo-refresh.test.ts` | `editorToolbarContent('textarea', …)` rows | **`REWRITE`** | the C9 spec (`ST-1`/`ST-6`'s new toggle meaning) |
| `tests/unit-live11-bridge-seams.test.ts` | the `textarea` seam mentions | **`REWRITE` (small)** | the C9 spec |
| `tests/unit-h8-operator-editor.test.ts` | 1 `editingMode` fixture hit | **`KEEP`** (the operator registry editor is host-owned; `docs/specs/test-pruning-disposition-2026-09-21.md` §3.3.3's note) | — |
| `tests/unit-ms5-settings-listing.test.ts` | 1 `editingMode` hit (a handler-census comment) | **`KEEP`** | — |
| `tests/unit-wave-1-bridge-wiring.test.ts`, `archive/tests/2026-10-04-unit-u-shell-shell-wiring-adversarial.test.ts`, `tests/unit-u-parity-c18/c19/docnav`, `archive/tests/2026-10-04-unit-u-shell-3-collapsible-panes.test.ts`, `archive/tests/2026-10-04-unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts` | 1–2 `editingMode` hits each (fixtures/fixture-builders) | **`KEEP`** (fixture-level, not behavior assertions) | — |
| `tests/unit-u2-rich-decompose.test.ts`, `tests/unit-s-paste-sanitization.test.ts`, `tests/unit-u5-rich-commit-ipc.test.ts` | `decomposeRichHtml` / `sanitizePastedHtml` / `IPC_EDIT_RICH_COMMIT` | **`KEEP` (PROTECTED — §1.4b).** `setRichText`'s **op** survives; only its *caller* changes | — |
| `tests/blind-unit-ud3-import-path-id-scheme-greens.test.ts`, `tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts`, `tests/integration-adversarial.test.ts`, `tests/mcp-security-hardening.test.ts`, `tests/unit-defect-resolution.test.ts`, `tests/unit-t-markdown-import.test.ts` | import `src/main/edit-ops.ts` | **`KEEP`** (the op module is unaffected; C9 changes the op's *target*, not its existence) | — |

**Count: 7 `REWRITE` + 0 `DELETE` for C9** (the DELETE/ARCHIVE action already happened in the
archive pass — `DECIDED: REBUILD-ARCHIVE-POLICY` clause (1) forbids adapting in place, so every old
pin is either archived-and-rebuilt or rewritten from the new spec).

**The C9 regression fence.** `docs/specs/design-extensions-review.md` §14.2 re-plans the fence pair
**for P2**, and §11.1 item 5 exempts `tests/import-render-no-duplicates.test.ts` +
`tests/traversal.test.ts` **by name** (*"may not be re-derived by any `GN-*` unit"*) — C9 is a `P3`
unit (`§13.1` P3), **not** a `GN-*` unit. **`tests/import-render-no-duplicates.test.ts` is C9's
regression fence** (it asserts the rendered *duplicate-free 1-1* property and makes **no** textarea
assertion — verified: `grep -n "textarea\|contenteditable" tests/import-render-no-duplicates.test.ts`
returns nothing). **`tests/traversal.test.ts` is the collision** — see §1.5 (iii-b) and §6 B-3.

### 1.5 The per-unit execution order for C9

| Step | Action | Breaking? | Expected trio reading |
| --- | --- | --- | --- |
| **(i) spec** | Author the `U-EDIT-1` whole-page contract (`docs/specs/unit-u-edit-1-whole-page-editing.md` or the name the landing pass picks): the single editable stage, the whole-document/per-text-node diff, the heading/body division + title commit, the async commit's restatement (one `applyBatch`, one invertible `batch` entry), the `commit-failed`/`uncommitted` dirty states, the `TAB-1` warning class, the **fence-replan citation**, and a typed §5.x register. **Nothing may be delegated before this file exists (AGENTS.md item 9)** | no | unchanged **180 / 3 846 / 0** |
| **(ii) test changes (the red set)** | Write the new red set (`tests/unit-u-edit-1-whole-page-editing.test.ts` + `-adversarial` + `-pbt-generators`), and **rewrite** the 7 files named in §1.4 to the new spec. **RCA-1: the red run is REPORTED before any implementation** | **BREAKING** — the 7 rewrites target code that still exists, so their new assertions are red | **red**: the new rows fail (the whole-page surface does not exist); the 7 rewritten files fail against the old code; everything else stays green |
| **(iii) source changes** | (a) `src/renderer/sidebar-panes.ts`: delete `applyEditingMode` + `setTextareaReadOnly` + `RAG_EDITOR_HANDLER_DEFS`' per-node splice + `textareaInput`/`textareaBlur`; author the single editable stage. (b) `src/main/traversal.ts`: delete the `type: 'textarea'` child from `buildSubtree` **(this is what reddens `tests/traversal.test.ts` — see below)**. (c) `src/renderer/rich-eligibility.ts`: remove the module + its import. (d) `src/renderer/edit-controller.ts`: replace the caret model / `isEditable`. (e) `src/renderer/pane-graph.ts`: re-author `editorToolbarContent`'s mode meaning. (f) `src/renderer/cross-document-shared.ts`: drop the `textarea-` branch | **BREAKING** — (iii-b) reddens the fence-named `tests/traversal.test.ts` **until (ii) rewrites it**; the trio is **red** through (ii)+(iii) | **red** until (iii) closes; **green at (iii)'s end** for the unit + the rewritten set |
| **(iii-b) THE FENCE COLLISION (must be resolved by the spec, not silently)** | `tests/traversal.test.ts` is **exempt by name** (`§11.1` item 5) **and** it asserts the textarea overlay (row 8). C9's `ST-1`/`ST-6` **require** the overlay's removal. **The two cannot both hold.** Options, for the **user** (`§14.2` S3: *"a unit that 'adjusts' the fence is re-entering this gate"*): **(A)** amend `§14.2`'s fence plan to **scope the exemption to the non-textarea rows** of `tests/traversal.test.ts` (the fence's real subject — `buildTraversal`'s placement/traversal contract — is asserted by rows other than row 8); **(B)** re-author row 8 as C9's own re-derivation and record the fence as **re-planned, not re-derived** (`§14.2`'s own wording). **This needs a user ruling** (§6 **B-3**) | — | — |
| **(iv) the archive move** | **Nothing to move.** Every C9 archive candidate is either a code site **inside a surviving module** or a module whose sole importer is changed in (iii). The 17 retired suites are already in `archive/tests/` | no | unchanged |
| **(v) the citation repoints** | The archived C9 basenames appear in `docs/**` (the ≈200-file debt, §0a). Repoint: `docs/decisions.md` `DECIDED: EDITING-MODE-SETTING`'s pin list, `DECIDED: RICH-TEXT-EDITING-GATE`'s must-fix pointers, `DECIDED: WHOLE-PAGE-EDITING`, `docs/defects.md` `EDIT-MODE-TEXTAREA-UI` + `WHOLE-PAGE-EDITING-REQUIREMENT`, and 6 `docs/specs/*.md` citations (`unit-u1-editing-mode-setting.md`, `unit-u2-rich-decompose.md`, `unit-u3-rich-eligibility-splice.md`, `unit-u4-contenteditable-editor.md`, `unit-u5-set-rich-text.md`, `unit-l-textarea-editing-ui.md`). Also repoint the **test-side** 9 comment hits §9.7 names. Land the `SUPERSEDED` rows for `EDITING-MODE-SETTING` + `FORM-CONTROL-EDITING` + the four `TEXTAREA-*` rows | no | unchanged |
| **(vi) trio** | `npm test` + `npm run typecheck` + `npm run build` | — | **green**: 180 + the new files − 0 archived, 0 failed |
| **(vii) adversarial + item-10d** | RCA-3 read-only adversarial (edge cases: a selection spanning boundaries; a paste inside the single block; a commit failure mid-diff; a malformed envelope) → recorded in the spec's §3a/§3b; **item-10d** doc review → `archive/reviews/<date>-unit-u-edit-1-whole-page-editing-doc-review.md`; **live battery MANDATORY** (`docs/specs/design-extensions-review.md` §13.3: `C9` is an assembled/UI unit — `scripts/live-drive.mjs` on a usable display; the §5.U matrix is **full at 8**, so the whole-page-edit row enters as a **re-pin or an extended row**, never a new slot) | — | green, with the live reading recorded in the DONE row |

**The single commit boundary C9 should land on.** **One commit = (ii)+(iii)+(v)+(vii)'s doc row**:
the rewritten red set, the source surgery, the `SUPERSEDED` rows and the citation repoints **cannot be
split across commits** — (ii)'s rewrites are red against (iii)'s pre-state and green against its
post-state, and splitting them leaves the tree red between commits. That is exactly
`DECIDED: REBUILD-ARCHIVE-POLICY`'s *"one unit = one spec, one red run, one green"* (`§13.3`).

---

## 2. PER-UNIT SECTION — **C11 `U-SEARCH`** (the `C13`-removal half)

> **`SPEC-MISSING — the unit's spec must be authored before any test or code change`** (§0, AGENTS.md
> item 9). The `C13` removal is pinned by a **decision row** (`DECIDED:
> C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`) and a **defect row** (`docs/defects.md`
> `PANE-VISIBILITY-IRREVERSIBLE`), and the decision row says so explicitly: *"it **does not implement
> the removal** (that is a UI unit's work with its own spec, red set and live battery)."*

### 2.1 The obsolete-behavior inventory

| # | NEW behavior (one line) | Pinned by | OLD behavior (one line) |
| --- | --- | --- | --- |
| C11-1 | The **the operator should not be able to hide app-graph panes at all** — the pane-visibility option is **REMOVED**, not repaired; app-graph panes are authored **always-enabled** | `docs/decisions.md` `DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`; `docs/defects.md` `PANE-VISIBILITY-IRREVERSIBLE` (*"Recommended (smallest, matches the user's call): drop the visibility toggles + the View → Panes submenu and author the app-graph panes as always-enabled"*) | A pane's visibility is a **persisted enabled-set** toggled from the native **View → Panes** submenu and from an in-pane operator control |
| C11-2 | The **`View → Panes` submenu is dropped**; `IPC_PANE_VISIBILITY` + `IPC_PANE_CATALOG` lose their visibility purpose | same two rows; `docs/specs/design-extensions-review.md` §3.6 F item 8 (*"the `PN-1` visibility half is subordinated to `C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` + `LIVE-12`"*) | `src/main/app-menu.ts` builds a data-driven `Panes` submenu from the live pane catalog and routes each checkbox to `IPC_PANE_VISIBILITY` |
| C11-3 | **`PaneRegistry.enabled` is kept for the OPERATOR-scope panes only** | `docs/defects.md` `PANE-VISIBILITY-IRREVERSIBLE`'s recommended-fix cell, verbatim | `PaneRegistry.enable`/`disable`/`setEnabled` govern both scopes; `DECIDED: PANE-REGISTRY` (*"newly registered panes are DISABLED"*) + `DECIDED: APP-GRAPH-PANES-MCP-VISIBLE` |
| C11-4 | **Search results are pane data** (a cache class, `docs/specs/design-extensions-review.md` §12.1 item 2), and a search hit on a **non-resident** document follows §12.2's **miss policy** rather than opening from a local read | `docs/specs/design-extensions-review.md` §12.8's `C11` row; §12.1 item 2 | Search results render in-pane or in-tab from a **local** store read with no residency concept |
| C11-5 | **`Ctrl+F`** moves focus to the search bar in **in-document-only** mode, copying highlighted text; `SR-5` must be decided **with** `FIND-IN-PAGE-NOT-WIRED` (**one owning row, one Ctrl+F meaning**) | `docs/feature-requests/design-extensions-2026-09-21.md` §2.7 `SR-4`/`SR-5`; `docs/specs/design-extensions-review.md` §3.3 C `C11` collision discipline; `docs/defects.md` `FIND-IN-PAGE-NOT-WIRED` | There is **no find UI at all** — `src/main/app-menu.ts` builds only `File` + `View`; no `Edit` menu, no `CmdOrCtrl+F` |
| C11-6 | `SR-1`/`SR-2`: results render **in the pane** unless that search is already open in a tab (then the tab's stage), and in-pane results show **only the document name** | `docs/feature-requests/design-extensions-2026-09-21.md` §2.7 `SR-1`/`SR-2` | The in-pane/in-tab split is not a cache-class question today |

### 2.2 The source map (verified by reading the code)

**Grep family run for this section:**
`grep -rn "applyPersistedPaneVisibility\|persistEnabledPanes\|operator-enabled-panes\|FIRST_RUN_APP_DEFAULT\|enabledPanes\|panesInitialized" src/` ·
`grep -rn "PANE_VISIBILITY\|PANE_CATALOG" src/` · `grep -rn "paneCatalog\|onPaneVisibilityChange\|paneVisibilityTouched" src/` ·
`grep -rn "togglePaneVisibility\|paneVisibilityToggle\|syncZoneMirrors" src/renderer/` ·
`grep -rn "Panes\|buildMenuTemplate\|normalizePaneCatalog\|orderPaneCatalog" src/main/app-menu.ts`.

| Path + symbol | What it does (the OLD behavior) | Class | Surviving consumers (PARTIALLY-SHARED only) |
| --- | --- | --- | --- |
| `src/main/app-menu.ts` → `buildMenuTemplate(catalog, options)`, **the `{ label: 'Panes' }` submenu** + the `AppMenuActions.togglePane` action wiring; `normalizePaneCatalog`, `orderPaneCatalog` | Builds the **data-driven View → Panes checkbox submenu** from the latest pane catalog and routes each toggle to the host | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** (the `Panes` submenu + `togglePane`). **`buildMenuTemplate` itself SURVIVES** — `File → Import…`/`Import folder…`/`Quit` and the `Edit`/find menu C11-5 adds are authored here | `src/main/main.ts` → `rebuildApplicationMenu` (must change first); `archive/tests/2026-10-04-unit-u-menu-1-application-menus.test.ts` |
| `src/main/main.ts` → the `IPC_PANE_VISIBILITY` broadcast inside `rebuildApplicationMenu`'s `togglePane` action; `latestPaneCatalog` + the `ipcMain.on(IPC_PANE_CATALOG, …)` handler | Stores the renderer-pushed catalog and rebuilds the menu; broadcasts a visibility flip | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** (the visibility half). The **catalog push** may survive if C11-5's find bar or another surface consumes it — **the spec must decide** (it is `PARTIALLY-SHARED` with an **undecided** surviving consumer) | `src/main/preload.ts` → `paneCatalog()`; `src/renderer/sidebar-panes.ts` → `paneCatalog()` |
| `src/shared/types.ts` → `IPC_PANE_CATALOG = 'provident:pane-catalog'`, `IPC_PANE_VISIBILITY = 'provident:pane-visibility'`, `type PaneCatalogEntry` | The two pane IPC constants + the catalog entry shape | **PARTIALLY-SHARED** — `IPC_PANE_VISIBILITY` is a **REMOVAL** candidate; `IPC_PANE_CATALOG`/`PaneCatalogEntry` survive **iff** the catalog keeps a consumer | `src/main/main.ts`, `src/main/preload.ts`, `src/renderer/sidebar-panes.ts` |
| `src/main/preload.ts` → `paneCatalog(catalog)` (`ipcRenderer.send(IPC_PANE_CATALOG, …)`) + `onPaneVisibility(listener)` (`ipcRenderer.on(IPC_PANE_VISIBILITY, …)`) + their JSDoc naming *"sent when a View → Panes checkbox is toggled"* | The bridge surface for the two pane channels | **PARTIALLY-SHARED** (same split as above) | `src/renderer/sidebar-panes.ts` → `unsubPaneVisibility = this.bridge.onPaneVisibility(...)` |
| `src/renderer/sidebar-panes.ts` → **`applyPersistedPaneVisibility(settings)`** + the `FIRST_RUN_APP_DEFAULT = {search, doc-nav}` first-run branch + the `appFirstRunDefault` write-through | At boot, enables only the pinned first-run set (or the persisted set) on the empty-first-run branch, and writes it through (`DECIDED: FIRST-RUN-ENABLED-DEFAULT`) | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** as an *apply* path — under "app-graph panes are always-enabled" there is nothing to apply at boot. **`DECIDED: FIRST-RUN-ENABLED-DEFAULT` itself is superseded in substance** and its `STALE-PIN 2026-09-21` note is discharged by this unit's landing (`docs/specs/test-pruning-disposition-2026-09-21.md` §9.7's last bullet) | `src/renderer/sidebar-panes.ts` → `boot`'s settings-fetch path (must change first) |
| `src/renderer/sidebar-panes.ts` → **`persistEnabledPanes()`** | Reads the live registry's enabled set per scope and writes `{ enabledPanes, enabledOperatorPanes, panesInitialized: true }` through `operatorSettings.set` | **PARTIALLY-SHARED** — the **operator-scope** half survives (`C11-3` keeps `PaneRegistry.enabled` for operator panes); the **app-graph** half is dead | `src/renderer/sidebar-panes.ts` → `togglePaneVisibility`, `onPaneVisibilityChange`, the first-run branch, `setLayout`-class write-through |
| `src/renderer/sidebar-panes.ts` → the **`#operator-enabled-panes`** census div inside `settingsContent` (**"Keep the pinned enabled-panes census (tests assert this id)"**) | Renders the persisted `enabledPanes` list in the operator settings pane | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** (`C11-1`) | `tests/unit-ms5-settings-listing.test.ts` asserts the id |
| `src/renderer/sidebar-panes.ts` → the **`#operator-pane-visibility`** section + the per-pane `#operator-pane-visibility-<id>` buttons (`data-pane`/`data-enabled`) + `OPERATOR_PANE_VISIBILITY_HANDLER` / `OPERATOR_PANE_VISIBILITY_HANDLER_BODY` | The **in-pane visibility toggle** the modal hosts (the LIVE-11/LIVE-12 seam) | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** | — |
| `src/renderer/sidebar-panes.ts` → **`togglePaneVisibility(paneId)`** + the `bridge.paneVisibilityToggle` member + `onPaneVisibilityChange` + `paneVisibilityTouched` | The two toggle entry points (in-pane + native) plus the boot-race guard | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** | `tests/unit-live11-bridge-seams.test.ts` (the flag + persistence rows) |
| `src/renderer/sidebar-panes.ts` → **`syncZoneMirrors(envelope)`** | Reconciles the `zone:*` `is-empty` mirrors after a pane-additive visibility change (introduced to fix the U-SHELL-8 blind-greens V4/V5 drift) | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** — with no live visibility change there is no pane-additive toggle to mirror | — |
| `src/renderer/pane-graph.ts` → `resolveEnabledZonePanes`, `enabledZonePaneCounts` | Derives a zone's enabled+placed pane list and the per-zone census from the **enabled set** | **PARTIALLY-SHARED** — the **zone/placement** half survives (`DECIDED: PANE-DRAG-HEADER-ONLY`, `PLACEMENT-ONLY-PAYLOAD-ROOT`, the O-10 slot authority); the **enabled-set filter** collapses to "the app-graph panes are always enabled, the operator-scope gate remains" | `src/renderer/sidebar-panes.ts` (2 call sites), `src/renderer/layout-state.ts` (the count mirror) |
| `src/renderer/pane-registry.ts` → `isEnabled` / `enable` / `disable` / `setEnabled` / `listByScope` | The single authority over which panes **exist** and which are **enabled** | **PARTIALLY-SHARED** — `C11-3` keeps the registry + its enabled state **for operator-scope panes only**; a newly-registered **app-graph** pane becomes enabled by construction | the whole pane host |
| `src/main/operator-settings-store.ts` → `OperatorSettings.enabledPanes`, `enabledOperatorPanes`, `panesInitialized` + the `sanitize`/`set`/`get` handling | Persists the enabled sets + the H2 "empty means none" flag | **PARTIALLY-SHARED** — `enabledOperatorPanes` + `panesInitialized` survive; **`enabledPanes` (app-graph) is dead**. `DECIDED: UI-CONFIG-CARRIER` keeps the store | `src/main/main.ts` (the settings IPC), the operator settings pane |
| `src/renderer/search`-related surface (`src/renderer/sidebar-panes.ts`'s `SEARCH_SUBMIT_BODY`, the `search` pane) + `src/renderer/pane-graph.ts`'s advanced-search disclosure | The search pane's submit + the extended `rag.query` args (`docs/specs/unit-u-parity-c18-advanced-search.md`) | **PARTIALLY-SHARED / UNAFFECTED** — `C11-4` re-classes the **results** as cache data; the pane's authoring and the query seam survive | `src/main/retrieval.ts` → `retrieve`/`ragQuery` |

### 2.3 The consumer map

| Candidate | `src/**` importers | `tests/**` importers | `scripts/**` / config | Must change first (dependency order) |
| --- | --- | --- | --- | --- |
| `buildMenuTemplate`'s `Panes` submenu + `AppMenuActions.togglePane` (`src/main/app-menu.ts`) | `src/main/main.ts` → `rebuildApplicationMenu` | `archive/tests/2026-10-04-unit-u-menu-1-application-menus.test.ts` (the whole `§3.2` block + `§3 state 4`) | — | **(1)** `main.ts` `rebuildApplicationMenu` → **(2)** the U-MENU-1 test's `§3.2`/`§3 state 4` rows → **(3)** the `Panes` submenu's removal (module survives) |
| `IPC_PANE_VISIBILITY` + `bridge.onPaneVisibility` (`src/shared/types.ts`, `src/main/preload.ts`) | `src/main/main.ts`, `src/renderer/sidebar-panes.ts` | `archive/tests/2026-10-04-unit-u-menu-1-application-menus.test.ts` (asserts the literal `'provident:pane-visibility'`) | — | same pass |
| `applyPersistedPaneVisibility` + `persistEnabledPanes` + `#operator-enabled-panes` + `#operator-pane-visibility` + `togglePaneVisibility` + `onPaneVisibilityChange` + `paneVisibilityTouched` + `syncZoneMirrors` (all `src/renderer/sidebar-panes.ts`) | the host itself | **8 files**: `tests/unit-ms5-settings-listing.test.ts`, `archive/tests/2026-10-04-unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`, `tests/unit-live11-bridge-seams.test.ts`, `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts`, `archive/tests/2026-10-04-props-pane-graph.test.ts`, `archive/tests/2026-10-04-unit-u-menu-1-application-menus.test.ts`, `tests/unit-h8-operator-editor.test.ts`, `archive/tests/2026-10-04-sidebar-panes-host.test.ts` | `scripts/live-drive.mjs` (the LIVE-5/LIVE-11/LIVE-12 blocks + the `§5.U` matrix rows `U-6`/`U-7`) | **(1)** the C11 spec → **(2)** the red set → **(3)** the `sidebar-panes.ts` surgery → **(4)** the 8 tests' re-derivation |
| `resolveEnabledZonePanes` / `enabledZonePaneCounts` (`src/renderer/pane-graph.ts`) | `src/renderer/sidebar-panes.ts`, `src/renderer/layout-state.ts` | `archive/tests/2026-10-04-props-pane-graph.test.ts` (`P-TP-1`, `P-SM-1`, `P-SM-2`, `P-SM-3`), `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts` (`S1`/`S3d`/`F3`/`F3b`) | — | **surgery, not archival** (the zone/placement half survives) |
| `src/renderer/pane-registry.ts` | the whole pane host | 20+ files | — | **no archive** (`C11-3` keeps it) |

### 2.4 The test disposition

**Already archived (C11, 1 file; §9.4):** `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` →
`archive/tests/2026-09-21-unit-u-shell-8-view-menu-pane-visibility.test.ts`. Its subject is the **C13
implementation** (`View → Panes` catalog, `IPC_PANE_VISIBILITY`, `applyPersistedPaneVisibility`,
`persistEnabledPanes`, the `#operator-enabled-panes` census, `FIRST_RUN_APP_DEFAULT`) — which is
exactly what `C11-1` removes. **Its pin on `DECIDED: FIRST-RUN-ENABLED-DEFAULT` is now owed, not
carried** (that row's `STALE-PIN 2026-09-21` note). **No live file imports it** (verified by
`grep -rl`).

**The remaining 180 suites that pin OLD C11 behavior.**

| File | The pinned OLD behavior | Disposition | Derived from |
| --- | --- | --- | --- |
| `archive/tests/2026-10-04-unit-u-menu-1-application-menus.test.ts` | `§3.2` *"the View → Panes checkbox submenu"* (5 rows: data-driven build, grouping, ordering, `enabled` gating) + `§3 state 4` *"a toggle routes `IPC_PANE_VISIBILITY`"* + the constants block asserting `IPC_PANE_CATALOG`/`IPC_PANE_VISIBILITY` literals | **`REWRITE`** — the `Panes` submenu rows DELETE; the constants block keeps `IPC_PANE_CATALOG` **iff** the spec keeps a catalog consumer, and C11-5's `Edit`/find menu rows are ADDED | the **C11 spec** (which must decide the catalog's fate — §2.2's `PARTIALLY-SHARED` note) |
| `tests/unit-ms5-settings-listing.test.ts` | *"RED 24 … the PRE-EXISTING settings rows byte-unchanged + the listing section APPENDED below them"* (asserts `operator-enabled-panes` presence) + *"the handler-def census is 13"* | **`REWRITE`** — the census row drops the `#operator-enabled-panes`/`#operator-pane-visibility` ids; the census count (13) changes if the toggle handlers retire | the C11 spec |
| `tests/unit-live11-bridge-seams.test.ts` | `§(c)` *"togglePaneVisibility sets paneVisibilityTouched"* + the native-seam equivalence row + `§(d)` *"in-pane paneVisibilityToggle flips + persists; hidden survives a restart"* + `§(e)` *"the in-pane visibility rebuild is dirty-edit-guard QUEUED"* | **`REWRITE` (delete the visibility rows; keep `§(a)`/the preload-seam rows)** | the C11 spec |
| `archive/tests/2026-10-04-props-pane-graph.test.ts` | `P-TP-1`, `P-SM-1` (*"disabled/operator panes never appear"*), `P-SM-2` (*"the per-zone census summing to the enabled set"*), `P-SM-3` (*"the visibility mirrors are deterministic functions of the layout"*) | **`REWRITE`** — the `P-SM-*` rows re-derive against "app-graph panes always enabled, operator-scope gate only". **The §5.7 register the file cites is `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` §5.7 — the spec being retired** | the C11 spec |
| `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts` | `S1`/`S3d`/`F3`/`F3b` — the empty-zone track-collapse semantics driven by *"zero enabled+placed panes"*, and `F3b` *"an OPERATOR-scope pane never populates an app-graph zone"* | **`KEEP`** — `F3b` survives verbatim (`C11-3`); `S1`/`S3d`/`F3` need only the **enabled-set construction** in their fixtures updated. Its header cites `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` §2.7 H6 → **citation repoint only** | — |
| `archive/tests/2026-10-04-unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts` | a comment naming `persistEnabledPanes()`'s write-through | **`KEEP`** (comment repoint only) | — |
| `archive/tests/2026-10-04-sidebar-panes-host.test.ts`, `archive/tests/2026-10-04-sidebar-panes.test.ts`, `archive/tests/2026-10-04-sidebar-panes-adversarial.test.ts` | the host harness's settings fixtures | **`KEEP`** (fixtures) | — |
| `tests/unit-h8-operator-editor.test.ts` | the operator registry editor (host-owned) | **`KEEP`** (§3.3.3's own note) | — |
| the parity/state/shell suites that merely **construct** an `OperatorSettings` with `enabledPanes` | fixtures only | **`KEEP`** | — |

**Count: 4 `REWRITE` + 0 `DELETE` for C11.**

**The C11 regression fence.** `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts` `F3b` — *"an OPERATOR-scope
pane never populates an app-graph zone (the census is app-graph only)"* — is the row that must stay
green through the whole removal (it is the row that pins `C11-3`'s surviving operator-scope gate).
`tests/defects.md` `PANE-VISIBILITY-IRREVERSIBLE`'s owed live row (*"a hidden pane is recoverable OR
the hide affordance does not exist"*) is the live fence; the §5.U matrix is full at 8, so it enters
as a **re-pin of `U-6`/`U-7` or an extended row**.

### 2.5 The per-unit execution order for C11

| Step | Action | Breaking? | Expected trio reading |
| --- | --- | --- | --- |
| **(i) spec** | Author the `U-SEARCH` spec: the `C13`-removal (`C11-1`/`C11-2`/`C11-3`), the `IPC_PANE_CATALOG` fate, the `SR-1`/`SR-2`/`SR-4`/`SR-5` half with `FIND-IN-PAGE-NOT-WIRED` folded into **one owning row**, the `SR-5`-with-`FIND-IN-PAGE-NOT-WIRED` decision, the `§12.8` cache-class re-scope, the `DECIDED: FIRST-RUN-ENABLED-DEFAULT` supersession, the §5.U re-pin, and a typed §5.x register | no | unchanged **180 / 3 846 / 0** |
| **(ii) test changes (the red set)** | New: `tests/unit-u-search-*.test.ts`. Rewrite: the 4 files in §2.4 | **BREAKING** — the new rows are red (the removal has not happened) | **red** on the new + 4 rewritten files |
| **(iii) source changes** | `src/main/app-menu.ts` (drop `Panes`/`togglePane`; add the find/`Edit` menu), `src/main/main.ts` (`rebuildApplicationMenu`, the `IPC_PANE_VISIBILITY` broadcast, the catalog handler's fate), `src/shared/types.ts` + `src/main/preload.ts` (the constants/bridge), `src/renderer/sidebar-panes.ts` (`applyPersistedPaneVisibility`, `persistEnabledPanes`'s app-graph half, the two census/toggle sections, `togglePaneVisibility`, `onPaneVisibilityChange`, `paneVisibilityTouched`, `syncZoneMirrors`), `src/renderer/pane-graph.ts` (the enabled-set filter) | **BREAKING** — the trio stays **red** through (ii)+(iii) | **green at (iii)'s end** |
| **(iv) the archive move** | **Nothing to move.** Every candidate is a code site inside a surviving module; the 1 retired suite is already archived | no | unchanged |
| **(v) the citation repoints** | `docs/decisions.md` `DECIDED: FIRST-RUN-ENABLED-DEFAULT` (a **SUPERSEDED** row + the pointer transfer), `DECIDED: PANE-REGISTRY`/`APP-GRAPH-PANES-MCP-VISIBLE` (amendment clauses), `docs/defects.md` `PANE-VISIBILITY-IRREVERSIBLE` (→ FIXED, with the owed live row) + `LIVE-5 VISIBILITY-NOT-SAVED` (its `persistEnabledPanes`/`applyPersistedPaneVisibility` fix shape is retired), `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` (its whole pin set + its 4 internal citations of the retired test), `docs/specs/user-flow-audit-checklist.md` `UF-PANES-9`/`UF-PANES-10`/`UF-PANES-11`/`UF-SETTINGS-7` (all four are `wants-removal`/`wants-change` on a removed surface — the census rows need a disposition), `docs/specs/props-pane-graph`-class citations, `docs/next-steps.md` §OPEN item 2, `docs/pending.md`'s grouped rebuild row | no | unchanged |
| **(vi) trio** | as above | — | green |
| **(vii) adversarial + item-10d** | RCA-3 adversarial (malformed catalog payload; an unregistered pane id; a stale persisted `enabledPanes` from a pre-removal file — **the migration edge: what happens to an `enabledPanes` list that hides a pane, after the option is gone?**); item-10d doc review; **live battery MANDATORY** (`C11` is an assembled/UI unit — `docs/specs/design-extensions-review.md` §13.3) with the §5.U re-pin | — | green + the live reading |

**The single commit boundary C11 should land on.** **One commit = (ii)+(iii)+(v)+(vii)'s doc row.**
Note the **stale-persisted-settings migration** (a `provident-operator-settings.json` whose
`enabledPanes` omits an app-graph pane) is a **fail-state the spec must pin** — it is the one place
the removal can silently hide a pane the user never chose to lose.

---

## 3. PER-UNIT SECTION — **P2 `U-READS-PIVOT`** (the tab-scoped read cache)

> **Spec PRESENT** — `docs/specs/unit-reads-pivot-tab-cache.md`. **The spec half of the delegation gate
> is satisfied; the red half is not** (no TestWriter run has been reported, AGENTS.md item 9(b)).

### 3.1 The obsolete-behavior inventory

| # | NEW behavior (one line) | Pinned by | OLD behavior (one line) |
| --- | --- | --- | --- |
| RP-1 | The host keeps a **read cache** holding **only** (a) the documents owned by currently-open tabs and (b) pane data; **everything else is not in the cache** | `docs/specs/design-extensions-review.md` §11.5 (verbatim ruling) + §12.1; `docs/specs/unit-reads-pivot-tab-cache.md` §2.1 | Every read answers from the **whole-store** map; the `RagSnapshotPayload` returns the **whole store** |
| RP-2 | **Residency is a precondition of rendering**; the **tab-open load path owns residency** (`TAB-OPEN → async fetch → cache-populate → notify → stage renders`) | §12.2; `unit-reads-pivot-tab-cache.md` §2.3 | There is no resident-key concept; a document renders as soon as the snapshot arrives |
| RP-3 | A **cache miss is a DEFINED TYPED FAILURE** — `CacheMiss` (thrown, never `undefined`/`[]`/`0`), naming the key + the resident-set size; **never a silent local read** | §12.2 items 1–2; `unit-reads-pivot-tab-cache.md` §3.3 + §8.1's `FS` set | A read for an unloaded document returns the local store's answer **silently** (the `FS13` class) |
| RP-4 | The **five-state read matrix** — (a) resident-and-loaded → value, (b) pending, (c) typed-not-resident, (d) typed-unavailable, (e) typed-load-failed. **Never one silent empty** | §12.2 item 4 | The `M1` "empty-snapshot guard" (`PaneContext.snapshot: RagSnapshotPayload \| null` → *"(no documents)"*) **conflates "not loaded yet" with "no documents"** (§12.2 item 3, an explicit `[verified]` claim against `src/renderer/pane-registry.ts`) |
| RP-5 | **Eviction**: a document's entry releases on the **LAST owning tab's close**; deferred to `closing-dirty` when dirty, with **resolve-or-discard**; a re-opened tab **re-fetches**; **NO TTL/LRU**; eviction is **observable in a node test** | §12.3 (all 6 items); `unit-reads-pivot-tab-cache.md` §5 | No cache lifetime; the store's `teardown()` is the only release |
| RP-6 | The **dirty machine**: `clean` / `uncommitted` / `commit-failed` / `closing-dirty`, **per tab**, exactly one at a time; `TAB-1`'s warning is bound to `commit-failed` | §12.4; `unit-reads-pivot-tab-cache.md` §6 | There is **no pinned dirty machine**; the guard is a per-node boolean (`editController.anyDirty()`) |
| RP-7 | **Failure UX**: load failure / engine-absence at tab-open surfaces in the **tab** (`TAB-1` class) + typed detail; the **enumerated silent-empty outcomes are fail-states**; the warning **survives a re-derive** | §12.5 (5 items) | The failure is an in-stage/per-node strip with no tab state owner |
| RP-8 | **"Persists" means the TABS' own state** (open tabs / targets / order / active), via `DECIDED: UI-CONFIG-CARRIER`'s `OperatorSettings` shape; **the host persists NO document bytes**; boot restores tabs and fetches the **active tab only** | §12.6; `unit-reads-pivot-tab-cache.md` §2.4 | The local store **is** the document persistence |
| RP-9 | The **13 synchronous `RagStore` reads are served FROM THE CACHE**, and the cache **is not a `RagStore`** and **never answers a mutation** | §11.5 + `unit-reads-pivot-tab-cache.md` §3.1/§3.2 (22 = 13 sync + 9 async; `src/main/rag-store.ts` `interface RagStore` — **verified by this pass's read: the interface block declares exactly those 22 members**) | The 13 reads are answered by the local store directly |
| RP-10 | The tab-open fetch is **narrowed**: the unit **MUST narrow** `IPC_RAG_SNAPSHOT`'s handler to be **tab-scoped** — *"a whole-store return on a tab-open path is `FS9`"* | `unit-reads-pivot-tab-cache.md` §4.1 | `IPC_RAG_SNAPSHOT`'s handler in `src/main/main.ts` returns the **whole store** |

**What `U-READS-PIVOT` explicitly does NOT do** (`unit-reads-pivot-tab-cache.md`, "What this unit does
NOT do", items 1–5 — quoted as **constraints on this map**): it does **not** change the `RagStore`
interface (**not one member, not one signature**; `docs/specs/gnosis-offload-review.md` §7 `A-9`
forbids it by name; `docs/specs/astrographer-scope-realignment-review.md` §7.2 lists
`src/main/traversal.ts` + the interface as **MUST-NOT-BUNDLE**); it does **not** add `revision` to
`RagSnapshotPayload` (owed — `SNAPSHOT-REVISION-AUTHORITY`); it does **not** write the commit
contract (that is **C9's**); it does **not** reverse anything about engine absence; it does **not**
touch the operator corpus (`O0_OPERATOR_DOCUMENTS = 226`).

### 3.2 The source map (verified by reading the code)

**Grep family run:** `grep -rn "from '.*rag-store\.js'\|from '\.\./main/rag-store" src/` ·
`grep -rln "rag-store-registry" src/` · `grep -rn "rag-store-registry" src/main/{main,mcp-server,markdown-import,rag-store-runtime}.ts` ·
`grep -rln "rag-store-runtime\|hotApply\|getDefaultStore\|loadRagStoreRegistry\|resolveStoreArg\|buildRagStoreDirectory\|rag-store-directory\|rag-store-remove" tests/` ·
`grep -rn "RagSnapshotPayload\|IPC_RAG_SNAPSHOT" src/` · `grep -rn "PaneContext" src/renderer/pane-registry.ts`.

| Path + symbol | What it does (the OLD behavior) | Class | Surviving consumers |
| --- | --- | --- | --- |
| `src/main/main.ts` → the `IPC_RAG_SNAPSHOT` handler (returns the whole store; `RagSnapshotPayload`) | The **whole-store snapshot pull** the renderer's `buildTraversal` input is built from | **PARTIALLY-SHARED** — the **seam is PRESERVED** (`DECIDED: RAG-SNAPSHOT-PRESERVED`: *"the `RagSnapshotPayload` + the `rag-snapshot` IPC are PRESERVED for `buildTraversal`"*) and the ruling **builds on** it; the unit **narrows** the handler to be tab-scoped (`FS9`) | `src/main/preload.ts` (`bridge.rag.snapshot`), `src/renderer/sidebar-panes.ts` |
| `src/shared/types.ts` → `interface RagSnapshotPayload` (`{ store, nodes, edges }` — **three** fields, `revision` OWED) + `IPC_RAG_SNAPSHOT` | The snapshot's wire shape | **PARTIALLY-SHARED** — reused **verbatim** by the unit (*"This unit adds no field"*); the `revision` field is a prerequisite of a later pass | `src/main/main.ts`, `src/main/preload.ts`, `src/renderer/sidebar-panes.ts`, `src/renderer/pane-registry.ts` (`PaneContext.snapshot`) |
| `src/renderer/pane-registry.ts` → `PaneContext.snapshot: RagSnapshotPayload \| null` and the *"(no documents)"* empty-state guard (`M1`) | The empty-state guard the unit pins as **must become distinguishable from a miss** (§12.2 item 3) | **PARTIALLY-SHARED (surgery)** — legal for a **genuinely empty store**, **must not be reachable for a miss** | the panes' `render(ctx)` subtrees |
| `src/main/rag-store.ts` → `interface RagStore` (22 members) + `createJsonRagStore` | The local store the cache replaces as the **read** source | **TEMPORARY-AUTHORITY (KEPT)** — `§13.2 S1` + `§14.5`: until P2 lands, the local store is a **temporary authority** with a recorded sunset; the sunset fires when `U-AUTHORITY-SWITCH` lands. The **13 sync reads** become cache-served; the **9 async members are untouched** | 31 `src/` importers (see §3.3) |
| `src/main/traversal.ts` → `computeDocumentSubgraph(store, documentId)`, `DocumentSubgraph`, `buildTraversal`, `TraversalInput`, `rebuildBackRefs` | The **single shared per-document derivation** the tab-open fetch's payload must be built from (*"never re-derived inline"*, §14.4) | **UNAFFECTED** — §14.2 pins `buildTraversal` **in-process + unchanged**; the ruling moves **where the data comes FROM**, never where the traversal runs | `src/main/mcp-server.ts`, `src/main/retrieval.ts`, the host, the fence |
| `src/main/retrieval.ts` → `retrieve`, `ragQuery`, `createRetrieval`, the lexical/vector `Embedder` seam | The search engine whose **results become a cache class** (`search`, `unit-reads-pivot-tab-cache.md` §2.1 item 2) | **PARTIALLY-SHARED** — the engine is unchanged; the unit wraps its results as a `search` cache entry | `src/main/main.ts` (`handleRagQueryIpc`), `src/main/mcp-server.ts` |
| `src/main/preload.ts` + `src/shared/types.ts` → the **pane-data IPC surfaces** (`IPC_RAG_DOC_HEADS`/`RagDocHeadsPayload`, `IPC_RAG_BACKLINKS`/`RagBacklinksPayload`, `IPC_RAG_QUERY`, `IPC_RAG_STORE_LISTING`, `IPC_TEMPLATE_*`, `IPC_OPERATOR_SETTINGS_*`) | §12.1 item 2's **enumerable** pane-data class | **PARTIALLY-SHARED** — the class is **enumerable, not invented** (§14.4); each surface gains a cache class | the panes |
| `src/main/adjacency.ts` → `buildAdjacencyIndex`, `edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`, `createSnapshotStore`, the `deepCopy`-on-read discipline | The indexed adjacency + the **read-only snapshot adapter** the renderer-facing suites fake the store with | **PARTIALLY-SHARED** — `P-IM-2` explicitly mirrors the store's `deepCopy`-on-read discipline (*"the cache returns copies"*); **a cache that changes the adapter's shape breaks the seam** (the unit's own blast-radius table names ≈20 files) | the traversal, the fence, ≈20 test files |
| `src/main/rag-store-registry.ts` → `loadRagStoreRegistry`, `resolveRegistry`, `implicitRegistry`, `RAG_STORE_NAME_PATTERN`, `ResolvedRagStoreRegistry`; `src/main/rag-store-registry-write.ts` → `writeRegistryMutation`, `persistRagStoreRegistry`, `RegistryMutation` | The **multi-store registry** (the `store` key dimension of the cache key, `unit-reads-pivot-tab-cache.md` §2.2) | **TEMPORARY-AUTHORITY (KEPT) — NOT prunable.** `docs/specs/design-extensions-review.md` §11.1 item 4 lists the registry as **NOT superseded and NOT prunable**; `U-AUTHORITY-SWITCH` §7 item 7 pins it **host-owned and untouched** | `src/main/main.ts` (`loadRagStoreRegistry`), `src/main/rag-store-runtime.ts`, `src/main/mcp-server.ts`, `src/main/markdown-import.ts` (a comment), `tests/unit-h8-operator-editor.test.ts` |
| `src/main/rag-store-directory.ts` → `resolveStoreArg`, `buildRagStoreDirectory`, `resolveStoreRef`, `RagStoreEntry`, `storeLoadStatus` | The per-store directory + the tool-level `store` resolution | **TEMPORARY-AUTHORITY (KEPT)** — the `store` key dimension is registry-sourced; the host owns resolution | `src/main/main.ts`, `src/main/mcp-server.ts` |
| `src/main/rag-store-runtime.ts` → `createRagStoreRuntimeController`, `RagStoreRuntimeController` (`hotApply`/`hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault`), `drainAndReleaseEntry` (`src/main/rag-store-remove.ts`) | The runtime controller that rebuilds/tests down local `createJsonRagStore` instances | **TEMPORARY-AUTHORITY (KEPT)** — `U-AUTHORITY-SWITCH` §7 item 7 pins the controllers host-owned; the switch **consumes** the registry and **writes nothing** into it | `src/main/main.ts`, `tests/unit-h8-operator-editor.test.ts` |
| `src/main/vector-boot.ts` / `src/main/embeddings.ts` / `src/main/vector-cache.ts` → the vector boot + `provident-vector-cache.json` path | The **separate host-owned** vector store | **UNAFFECTED** — §12.1's *"everything else is NOT in the cache"* names it explicitly; `U-AUTHORITY-SWITCH` §7 item 6 pins it untouched | — |

### 3.3 The consumer map

| Candidate / touched module | `src/**` importers | `tests/**` | `scripts/**` | Change-first order |
| --- | --- | --- | --- | --- |
| `src/main/rag-store.ts` (`RagStore`, `createJsonRagStore`) | **31 `src/` modules** (`adjacency`, `backlinks`, `doc-flow`, `edit-ops`, `embeddings`, `markdown-import`, `markdown-parse`, `mcp-server`, `paste-sanitize`, `preload`, `rag-store-default`, `rag-store-directory`, `rag-store-remove`, `rag-store-runtime`, `retrieval`, `rich-decompose`, `traversal`, `vector-boot`, `cross-document-shared`, `rich-eligibility`, `sidebar-panes`, `shared/types`, …) | **≈74 files** (the unit's own blast-radius reading, §8.4) | `scripts/live-drive.mjs` | **the interface is untouched by this unit** (`A-9`); the cache lands **above** it |
| `src/main/traversal.ts` | `src/main/{mcp-server,retrieval}.ts` + the host | **23 files** (§8.4) + **the 2 fence files** | the O-0 harness | **the fence may not be re-derived** (§8.4) |
| `src/main/retrieval.ts` | `src/main/{main,mcp-server}.ts` | **≈30 files** (§8.4) | `scripts/live-drive.mjs` | — |
| `src/main/adjacency.ts` + `createSnapshotStore` | the traversal + the renderer-facing suites | **≈20 files** (§8.4) | — | — |
| `src/main/rag-store-registry*.ts` | `src/main/main.ts`, `src/main/rag-store-runtime.ts` | **≈8 files** (§8.4) → verified live: `tests/unit-h8-operator-editor.test.ts`, `tests/unit-f3-stores-all-schema.test.ts`, `tests/unit-ms5-settings-listing.test.ts` | — | **kept — no archive** |
| `src/main/main.ts`'s `IPC_RAG_SNAPSHOT` handler | `src/main/preload.ts` | `tests/props-*`, the blind batteries | `scripts/live-drive.mjs` | the **narrowing** is the unit's; `FS9` guards it |
| `src/renderer/pane-registry.ts` `PaneContext` | the pane host | the pane suites | — | the **miss-vs-empty** distinction is a surgery site |

**A module with a live importer cannot be archived before that importer is changed.** For
`U-READS-PIVOT` **no module satisfies the archive criteria**: the unit's whole design is *change the
read layer above the store*, and its own spec forbids touching the `RagStore` interface. **There is no
archive move in this unit** (see §3.5 step (iv)).

### 3.4 The test disposition

**Already archived (6 files; §9.4):** `unit-ud2-journal-invertibility` · `unit-ud4-doc-heads-tree` ·
`unit-ud5-list-documents-tool` · `unit-ud6-query-document-filters` · `unit-ud7-set-doc-meta-op` ·
`unit-ujr1-get-journal`. **Live-import check:** each has a **live sibling that names it in a comment**
(`tests/unit-ud4-doc-heads-tree-adversarial.test.ts`, `tests/unit-ud6-query-document-filters-adversarial.test.ts`,
`tests/blind-unit-ud4-/ud5-/ud6-…-greens.test.ts`, `archive/tests/2026-10-04-props-layout-state.test.ts`, `archive/tests/2026-10-04-props-tab-state.test.ts`)
— **comments only, no imports** (§9.7's `tests/**` repoint list). **The 7th file of §3.3.4
(`tests/unit-import-batch-persist-contract.test.ts`) was EXCLUDED and stays live** (protected by
`tests/unit-v5-migration-contract.test.ts`) — it remains `U-READS-PIVOT`'s **live pin**, not its
re-derivation.

**The remaining 180 suites that pin OLD read-path behavior.**

| File | The pinned OLD behavior | Disposition | Derived from |
| --- | --- | --- | --- |
| `tests/unit-ud4-doc-heads-tree-adversarial.test.ts` | the `rag-doc-heads` payload's adversarial rows over the **host store** | **`KEEP`** (its adversarial rows pin payload **shape/totality**, which the `docnav` cache class preserves) | — |
| `tests/unit-ud6-query-document-filters-adversarial.test.ts` | the local-only document filters' adversarial rows | **`KEEP`** (`DECIDED: LOCAL-QUERY-DOCUMENT-FILTERS` is not superseded; the `search` cache class wraps the same filters) | — |
| `archive/tests/2026-10-04-sidebar-panes-host.test.ts`, `archive/tests/2026-10-04-sidebar-panes.test.ts`, `archive/tests/2026-10-04-sidebar-panes-adversarial.test.ts` | the host boot/re-derive path reading the **whole-store snapshot** | **`REWRITE`** — the boot sequence changes to *restore tabs → fetch the **active tab only*** (`§12.6`) | `unit-reads-pivot-tab-cache.md` §2.4/§4 |
| `archive/tests/2026-10-04-unit-live4-empty-store-landing.test.ts` + `archive/tests/2026-10-04-unit-live4-adversarial-fix.test.ts` | the empty-store landing, which rides the `M1` `null`-snapshot guard the miss policy **must distinguish** from a miss | **`REWRITE`** (the empty-vs-miss distinction is a §12.2 item 3 fail-state) | `unit-reads-pivot-tab-cache.md` §3.3/§8.1 |
| `archive/tests/2026-10-04-unit-u-shell-9b-w2n15-rederive-scope.test.ts` | the re-derive scope over the whole-store snapshot | **`REWRITE`** | §2.4/§4 |
| `archive/tests/2026-10-04-unit-u-state-1a-content-reconcile.test.ts`, `archive/tests/2026-10-04-unit-u-state-1e-nroot-reconcile.test.ts`, `archive/tests/2026-10-04-unit-u-state-1b-host-application.test.ts`, `archive/tests/2026-10-04-unit-u-state-1c-persistent-scaffolding.test.ts`, `archive/tests/2026-10-04-unit-u-state-w2n11-depth-safety.test.ts` | content repopulation over the whole-store snapshot's payload | **`KEEP`** (the reconciler's contract is payload-shape-driven and the payload shape is unchanged — `RagSnapshotPayload` is **reused verbatim**) | — |
| `archive/tests/2026-10-04-props-reconcile-1a.test.ts`, `archive/tests/2026-10-04-props-reconcile-1e.test.ts`, `archive/tests/2026-10-04-props-cross-doc-shared.test.ts`, `archive/tests/2026-10-04-props-pane-graph.test.ts`, `archive/tests/2026-10-04-props-tab-state.test.ts`, `archive/tests/2026-10-04-props-layout-state.test.ts` | the PBT registers for reconcile/pane/tab/layout | **`KEEP`** (registers, not cache semantics) | — |
| `tests/unit-v3-doc-heads-docnav.test.ts` + `-adversarial`, `archive/tests/2026-10-04-unit-u-parity-docnav.test.ts` | the doc-nav build over the host store's doc-head edges | **`REWRITE`** (the doc-nav build is one of §3.3 item 4's **six enumerated miss-capable read paths**) | `unit-reads-pivot-tab-cache.md` §3.3 item 4 |
| `archive/tests/2026-10-04-unit-u-parity-c18-advanced-search.test.ts`, `archive/tests/2026-10-04-unit-u-shell-9a-main-focus-tabs.test.ts`, `archive/tests/2026-10-04-unit-u-parity-c19-hover-preview.test.ts` | the search/tab read paths over the local store | **`REWRITE`** (the `search` cache class + §12.8's `C11` re-scope) | §2.1 item 2 + §12.8 |
| `tests/traversal.test.ts` + `tests/import-render-no-duplicates.test.ts` | the two **fence** files | **`KEEP` — EXEMPT BY NAME.** §14.2 pins them **green unchanged in P2**; the unit's own §8.4 repeats it (*"must stay green unchanged"*; *"A unit that cannot stay green under the fence is not an implementation of this ruling but a new proposal"*) | — |

**Count: 8 `REWRITE` + 0 `DELETE` for `U-READS-PIVOT`.**

**The regression fence (three parts, all mandatory).** (1) The fence pair —
`tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` — **green unchanged**; the
unit's own §8.4 makes the fence its `P-SM`-class control. (2) **The `§14.2` fence plan lands WITH
this unit** (`docs/specs/design-extensions-review.md` §13.2 S3 + §14.2's verification clause: *"the
fence must be run (trio) as `U-READS-PIVOT`'s and `U-CORPUS-MIGRATION`'s regression reading, and the
reading recorded in their DONE rows"*). (3) The unit's **own** guarantee lives in **new** suites —
`tests/unit-reads-pivot-tab-cache.test.ts` + `-adversarial` + `-pbt-generators` (§8.4's pinned rule:
the fence is **never** cited as this unit's green).

### 3.5 The per-unit execution order for `U-READS-PIVOT`

| Step | Action | Breaking? | Expected trio reading |
| --- | --- | --- | --- |
| **(i) spec** | **PRESENT.** Only the TestWriter red set is owed (AGENTS.md item 9(b)). One open doc-layer pin: the spec's `§8.5` records the fence plan's `revision`-field prerequisite | no | unchanged **180 / 3 846 / 0** |
| **(ii) test changes (the red set)** | New: `tests/unit-reads-pivot-tab-cache.test.ts` (the cache model, §2/§3), `-adversarial` (§8.1's `FS` ids), `-pbt-generators` (§7's 8 register rows). Rewrite: the 8 files in §3.4. **RCA-1: report the red set before implementing.** The spec pins the four red-set obligations (cache module + `CacheMiss`/`CacheOverBound` absent; the 13-read mapping red *"today every read answers from the whole-store map"*; the residency predicate/eviction/bound absent; the engine-absent typed surface red) | **BREAKING** — the rewritten files are red against today's whole-store read model | **red** on the new + 8 rewritten files |
| **(iii) source changes** | New module(s) for the cache + `CacheMiss`/`CacheOverBound` (mirroring `EngineUnavailable`'s shape in `src/main/engine-rag-store.ts`); narrow the `IPC_RAG_SNAPSHOT` handler in `src/main/main.ts`; the tab-open fetch on `computeDocumentSubgraph`; the tab lifecycle's residency/eviction in `src/renderer/tab-state.ts` + the host; the `PaneContext` miss-vs-empty distinction in `src/renderer/pane-registry.ts`; the `TAB-1` warning carrier | **BREAKING** — the trio stays **red** through (ii)+(iii) | **green at (iii)'s end** |
| **(iv) the archive move** | **EMPTY — nothing to move.** Every touched module has a live importer and every one of them **survives** (the `RagStore` interface may not change; the fence may not be re-derived; the registry/runtime are host-owned). **This unit is a surgery unit, not an archive unit** | no | unchanged |
| **(v) the citation repoints** | The archived `unit-ud{2,4,5,6,7}*`/`unit-ujr1` citations: `docs/specs/{unit-ud2,unit-ud4,unit-ud5,unit-ud6,unit-ud7,unit-ujr1}-*.md` + `docs/specs/unit-ms*`, `docs/decisions.md` (`DECIDED: DOC-HEADS-IPC`, `DECIDED: LOCAL-QUERY-DOCUMENT-FILTERS`, `DECIDED: SET-DOC-META-TAG-WRITE`, `DECIDED: C16-CONSUMES-PROJECT-JOURNAL`), `docs/defects.md`, and the 5 test-side comment hits §9.7 names. Also: the `13/9` sync-read correction's **two remaining OWED carriers** — `docs/specs/astrographer-scope-realignment-review.md` §3.1 + `docs/specs/gnosis-offload-review.md` §3 (`unit-reads-pivot-tab-cache.md` §3.1 records them as owed, not discharged) | no | unchanged |
| **(vi) trio** | as above | — | green, with the **fence reading recorded** (§14.2) |
| **(vii) adversarial + item-10d** | RCA-3 adversarial (§8.1's `FS` ids: foreign-store data, malformed payload, over-bound, mid-commit failure, teardown); PBT (§7's 8 rows, ≤100 attempts/row, ≤400 total, stop-after-5, a **read-only** auditor who did not author the rows); item-10d; **live battery MANDATORY** (§8.3: residency/eviction/failure-UX are **assembled** properties, RCA-12) + the oracle-identity discipline (§13.3: **no unit may touch `src/shared/o0-report.ts` + `scripts/live-drive.mjs` as a side effect** — a change to either **invalidates** the recorded live provenance) | — | green + the live reading |

**The single commit boundary.** One commit = **(ii)+(iii)+(v)+(vii)'s doc row**, with the
**fence plan's citation** in the same commit (§13.2 S3: *"Any unit whose work touches the fence must
cite the re-plan"*).

---

## 4. PER-UNIT SECTION — **P2 `U-AUTHORITY-SWITCH`** (`O-8`)

> **Spec PRESENT** — `docs/specs/unit-authority-switch.md`. **The spec half of the delegation gate is
> satisfied; the red half is not.** **This is the most spec-complete and the most
> prerequisite-blocked of the four.**

### 4.1 The obsolete-behavior inventory

| # | NEW behavior (one line) | Pinned by | OLD behavior (one line) |
| --- | --- | --- | --- |
| AS-1 | The authority is **one value per session** over four pinned states — `local-authoritative` (S0) / `dual` (S1) / `engine-authoritative` (S2) / `engine-authoritative-offline` (S3) | `unit-authority-switch.md` §3.1; `docs/specs/design-extensions-review.md` §11.1 | There is **one** authority: the local store's per-store single-writer queue (`DECIDED: SINGLE-WRITER-STORE` + `SINGLE-WRITER-STORE-PER-STORE`, **both SUPERSEDED**) |
| AS-2 | **The rule that replaces the single-writer rule**: one writer per state; `dual` mirrors every committed local write engine-side as a **shadow replica** (the engine holds a **replica, never an authority**) | §4.1; `docs/specs/design-extensions-review.md` §11.1 (*"the lock point moves"*) | The local store is the lock point; MCP and UI both route through it |
| AS-3 | **No channel and no tool may be served by two authorities in one state** (`FS3`); the routing flip at **K5** is **atomic** | §4.1, §3.4 pinned property 1; register `P-AS-1` | — |
| AS-4 | A **single total resolver** is the only routing authority: `resolveDocumentRoute(tool, state) → DocumentRoute`, with the closed 5-member route union and the closed 7-member `UnavailableReason` set; **totality is the register row `P-AS-5`**, and a `default:` branch returning an off-table route is `FS17` | §5.1/§5.2/§5.3 | There is **no routing resolver**: the local handler is the only route; `IPC_EDIT_*` bodies call `runtime.getDefaultStore()` unconditionally |
| AS-5 | The **renderer IPC routing table** is total over 19 channel rows × 4 states; channels 14–16 + 18–19 (operator settings / security / template / pane / module) **never move in any state** (`FS14` if they do) | §5.4 | The renderer reaches main through IPC bodies with no state dimension |
| AS-6 | **Engine absence**: at boot, `GN-4`'s refusal; mid-session, **S3** with **all** document writes refused (typed), the local store **still frozen** | §8; `docs/specs/design-extensions-review.md` §11.3; `docs/decisions.md` `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` | `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`'s **identity clause**: *"with no engine every local path works IDENTICALLY"* (**REVERSED**; the *"never silent"* clause **survives**) |
| AS-7 | The switch needs a durable, citable **`authority-switch` record** written **FIRST**, with `state`/`since`/`engineBase`/`migrationReceipt`/`sunsetRecorded`/`rollbackPoint`/`regime`; **`regime` ≠ `state` is legal and IS the temporary authority** | §3.3 + `docs/specs/design-extensions-review.md` §14.5 | **There is no authority record** — `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`'s *"the engine may own the STORE … never the envelope"* clause is the code's de-facto authority statement |
| AS-8 | **The sunset fires** when the `authority-switch` record is written with `state: 'engine-authoritative'` — *"from that point a surviving local document write is a FENCE VIOLATION, not a temporary authority"* | `docs/specs/design-extensions-review.md` §13.2 **S1** + §14.5 item 2; `unit-authority-switch.md` §3.1 | — |
| AS-9 | The routed MCP surface is a **closed union of 31** = 8 `rag` + 9 `edit` (8 registered + the `edit.batch` IPC-only primitive) + 7 `gnosis` + 7 `gnosis-edit`, over a **124-cell** grid | §5.2/§5.3 + §16 | The tools exist, but no state dimension exists to route over |
| AS-10 | `edit.*` becomes an **alias** at the switch — **explicitly NOT implied by `GN-1`**; it owes an amendment to `RAG-EDIT-MCP-GROUPS` + `MCP-UI-EQUIVALENCE` and is **NOT authored by this unit** | `docs/specs/design-extensions-review.md` §11.1 item 2; `unit-authority-switch.md` §4.4 | `edit.*` and `gnosis-edit.*` are separate, non-aliased paths |

### 4.2 The source map (verified by reading the code)

**Grep family run:** `grep -rln "rag-store-runtime\|hotApply\|getDefaultStore\|loadRagStoreRegistry\|resolveStoreArg\|buildRagStoreDirectory\|rag-store-directory\|rag-store-remove" tests/` ·
`grep -rln "engine-crud-rag-store" src/ tests/` · `grep -rln "engine-rag-store" src/ tests/ scripts/` ·
`grep -rn "rag-store-registry" src/main/*.ts` · `grep -rn "PANE_VISIBILITY\|PANE_CATALOG" src/`.

| Path + symbol | What it does (the OLD behavior) | Class | Surviving consumers |
| --- | --- | --- | --- |
| `src/main/rag-store-registry.ts` (`loadRagStoreRegistry`, `resolveRegistry`, `implicitRegistry`, `ResolvedRagStoreRegistry`, `RAG_STORE_NAME_PATTERN`) | The multi-store registry: which stores exist, the default, the per-entry `persistenceFile`/`corpusRoot`, Pass A–D validation | **TEMPORARY-AUTHORITY (KEPT) — `§11.1` item 4 lists it NOT superseded / NOT prunable**; `§7` item 7 pins it **host-owned and untouched**; `§7` item 7's rule: *"A registry mutation on a cut-over store is REFUSED while the engine is the authority (`FS11`)"* | `src/main/main.ts`, `src/main/rag-store-runtime.ts`, `src/main/mcp-server.ts` |
| `src/main/rag-store-registry-write.ts` (`writeRegistryMutation`, `persistRagStoreRegistry`, `applyRegistryMutation`, `RegistryMutation`, `RegistryDelta`, `addRegistryStore`/`removeRegistryStore`/`renameRegistryStore`/`setDefaultRegistryStore`/`renameDefaultRegistryStore`) | The registry **file write** seam | **TEMPORARY-AUTHORITY (KEPT)** — the file, its validation messages and its hot-apply contracts are *"otherwise unchanged"*; only the cut-over-store refusal is added | `src/main/main.ts`, `src/main/rag-store-runtime.ts`, `src/main/mcp-server.ts` (as error-message text) |
| `src/main/rag-store-runtime.ts` (`createRagStoreRuntimeController`, `RagStoreRuntimeController`'s `hotApply`/`hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault`) | Rebuilds/tests down local `createJsonRagStore` instances at runtime | **TEMPORARY-AUTHORITY (KEPT)** — *"host-owned file, host-owned controllers, host-owned resolution"* | `src/main/main.ts`; `tests/unit-h8-operator-editor.test.ts` |
| `src/main/rag-store-directory.ts` (`resolveStoreArg`, `buildRagStoreDirectory`, `ResolvedStoreRef`, `RagStoreEntry`, `storeLoadStatus`) | The per-store directory + the **tool-level `store` resolution** the routing table's `H` cells read | **TEMPORARY-AUTHORITY (KEPT)** — `§11.1` item 4 + `§7` item 7 | `src/main/main.ts`, `src/main/mcp-server.ts` |
| `src/main/rag-store-remove.ts` (`drainAndReleaseEntry`, `RemovedEntry`, `RemovedEntryReleaseResult`) | drain-then-teardown of a local store entry (the `HOT-REMOVE-DRAIN-TEARDOWN` pin) | **TEMPORARY-AUTHORITY (KEPT)** — no row supersedes it; the 17 retired suites' owner (`unit-h4-hot-remove`) | `src/main/main.ts` |
| `src/main/rag-store.ts` (`createJsonRagStore`, `interface RagStore`, `RagStoreFile`, `applyBatch`, `journal`) | The local store: the **current** authority | **TEMPORARY-AUTHORITY (KEPT), with a RECORDED SUNSET** — `§13.2 S1`: *"Until P2 lands, the local store is a TEMPORARY authority with a recorded sunset condition… the contract says engine-authoritative while the code still writes locally; that gap is RECORDED, never hidden."* **This is `U-AUTHORITY-SWITCH`'s own subject, NOT an archive candidate.** The switch **freezes** it (read-only, never deleted — `§3.4` pinned property 2) | 31 `src/` modules; `tests/traversal.test.ts` + `tests/import-render-no-duplicates.test.ts` (the fence) |
| `src/main/main.ts` → the `ipcMain.handle` bodies for `IPC_EDIT_COMMIT`/`IPC_EDIT_BATCH`/`IPC_EDIT_RICH_COMMIT` calling `runtime.getDefaultStore()`, and the `runtime.getDefaultName()` broadcast stamps | The renderer's **unconditional local write route** | **PARTIALLY-SHARED** — the channels keep their identity; the **routing** gains a state dimension (rows 1–3 of §5.4's table) | `src/main/preload.ts` |
| `src/main/main.ts` → the `IPC_RAG_STORE_CHANGED` broadcast + the renderer's foreign-store drop (`DECIDED: STORE-QUALIFIED-BROADCAST`) | The store-change notification | **PARTIALLY-SHARED** — in S2 the notification becomes **engine-originated** (`GR-5`, upstream-owed); the drop guard survives | `src/renderer/sidebar-panes.ts` |
| `src/main/mcp-server.ts` → `handleRagTool`, `handleEditTool`, `handleGnosisTool`, the tool registrations, the `gnosis.document.update` `baseRevision` path | The 31-tool surface the resolver routes over | **PARTIALLY-SHARED (surgery)** — `§7` item 1: *"The MCP server stays HOST-OWNED. No tool is added, renamed, re-schema'd, regrouped or re-transported by this unit. The switch changes WHERE a tool's call goes, never WHAT the tool is."* | `src/main/main.ts`, `src/main/preload.ts`; ≈12 test files |
| `src/main/security.ts` (`SecurityGate`, `groupForTool`, `toolAllowed`, `authorized`, `applyPatch`, `defaultSecurityConfig`, `ToolGroup`, `TOOL_GROUPS`, `VALID_GROUPS`) + `src/main/security-store.ts` | The group gate + the persisted security config | **UNAFFECTED** — `§7` item 2: *"Unchanged and host-owned in EVERY state."* The switch adds **no group**, changes **no default** | the gate's own suites |
| `src/main/authority-store.ts` (`AuthorityStore`, `callerCredential`, `editors`, `createAuthorityStore`) + `loadAuthorityMapping` | The host-side identity → edit-authority-credential map | **UNAFFECTED** — `§7` item 3: **host-owned**; the engine's RBAC **consumes** a credential derived from it; *"never migrated, never replicated engine-side and never written by an engine-authoritative route"* | `src/main/main.ts`, `src/main/mcp-server.ts` |
| `src/main/engine-rag-store.ts` (`EngineRagStore`, `EngineUnavailable`, `EngineWireError`, `ConflictError`, `TraceUnavailable`, `ENGINE_HTTP_STATUS`, `ENGINE_ENDPOINTS`, `wireCodeToError`, `decodeHealthReport`, `HealthReport`) | The retrieval/health proxy + the **typed error vocabulary** the switch reuses (§8: *"§8 reuses this vocabulary rather than inventing one"*) | **UNAFFECTED (reused)** — `§7`'s engine-absent rule reads its `EngineUnavailable`; `§4.2` reads its `ConflictError`/`ENGINE_HTTP_STATUS` (the 409) | `src/main/{main,mcp-server,preload,engine-crud-rag-store,engine-transport}.ts`, 3 renderer modules, **10 test files + `scripts/live-drive.mjs`** |
| `src/main/engine-crud-rag-store.ts` (`EngineCrudRagStore`, `createEngineCrudRagStore`, `ENGINE_CRUD_ENDPOINTS`, `updateDocument`'s `baseRevision`, `interface Document`, `DocumentSummary`, `validateCrudResult`) | The **11-method** engine document-CRUD proxy — the S2 write route | **UNAFFECTED (the destination)** — the switch **routes to** it; the proxy is not a `RagStore` (`unit-reads-pivot-tab-cache.md` §3.2) | `src/main/{main,mcp-server,engine-transport}.ts`, `src/renderer/{gnosis-crud-panes,pane-graph}.ts`, **8 test files** |
| `src/main/engine-transport.ts` (`assertLoopback`, `isLoopbackHost`, `fetchWithTimeout`, `createEngineFetch`, `transportError`, `headers`), `src/main/engine-config.ts` (`EngineConfig`, `EngineConfigStore`, `createEngineConfigStore`, `setEngineConfigBaseUrl`, `getEngineConfigBaseUrl`), `src/main/main.ts` → `resolveEngineBaseUrl` | The loopback-enforced transport + the base-URL resolution the `authority-switch` record's `engineBase` reads | **UNAFFECTED** — `DECIDED: ENGINE-TRANSPORT-POLICY` + `DECIDED: ENGINE-TRANSPORT-SHARED-MODULE` are not superseded; `baseUrl` is *"NOT a credential"* | `src/main/{main,mcp-server,engine-*}.ts` |
| `src/main/vector-boot.ts`, `src/main/embeddings.ts`, `src/main/vector-cache.ts` | The host-owned vector boot/cache | **UNAFFECTED** — `§7` item 6: *"Host-owned and untouched… the switch does not move it"*; `§12.1` names it as **not** part of the tab cache | `src/main/main.ts` |
| `src/main/query-audit.ts`, `src/main/idempotency-registry.ts`, `src/main/module-store.ts`, `src/main/template-store.ts`, `src/main/operator-settings-store.ts`, `src/main/security-store.ts` | The host-side stores `§11.1` item 4 enumerates as **NOT superseded and NOT prunable**, plus §5.4's rows 10/14/15/16/18/19 which **never move in any state** | **UNAFFECTED** — `§5.4` rule 1: *"Channels 14–16 and 18–19 never move in any state. Their row is `H` for the contract's lifetime; a state-dependent value there is `FS14`."* | their own suites |

### 4.3 The consumer map

| Candidate / touched module | `src/**` importers | `tests/**` | `scripts/**` | Change-first order |
| --- | --- | --- | --- | --- |
| `src/main/rag-store.ts` (`RagStore` — the 13 sync reads become cache-legal in S2/S3) | 31 `src/` modules | **≈74** (the reads-pivot blast-radius reading) | `scripts/live-drive.mjs` | **the interface may not change** (`A-9`); the switch changes **where a call goes** |
| `src/main/main.ts`'s `IPC_EDIT_*` bodies + `IPC_RAG_SNAPSHOT`/`IPC_RAG_STORE_CHANGED` | `src/main/preload.ts` | the renderer/bridge suites | `scripts/live-drive.mjs` | **(1)** the resolver module → **(2)** `main.ts`'s bodies → **(3)** `preload.ts`'s bridge JSDoc → **(4)** the tests |
| `src/main/mcp-server.ts`'s three handlers | `src/main/main.ts` | ≈12 files | — | the resolver **consumes** it; no tool changes |
| `src/main/rag-store-registry*.ts` / `rag-store-runtime.ts` / `rag-store-directory.ts` / `rag-store-remove.ts` | `src/main/main.ts` (+ `mcp-server.ts` for messages) | 3 live files: `tests/unit-h8-operator-editor.test.ts`, `tests/unit-f3-stores-all-schema.test.ts`, `tests/unit-ms5-settings-listing.test.ts` | — | **kept — no archive**; only the cut-over-store **refusal** (`FS11`) is added |
| `src/main/engine-crud-rag-store.ts` / `engine-rag-store.ts` / `engine-transport.ts` / `engine-config.ts` | 6–7 `src/` modules each | 8–10 files each | `scripts/live-drive.mjs` | **kept — the destination, not the candidate** |

**A module with a live importer cannot be archived before that importer is changed — and for this
unit, NO module satisfies the archive criteria.** Every module the switch touches is either
**host-owned by a named pin** (`§7` items 1–7) or the **temporary authority itself** with a recorded
sunset. `U-AUTHORITY-SWITCH` is a **routing** unit, not an archive unit.

### 4.4 The test disposition

**Already archived (17 files; §9.4):** `rag-store` · `rag-store-adversarial` · `unit-ms1-store-registry` ·
`unit-ms2-store-wiring` · `unit-ms3-store-qualified-broadcast` · `unit-ms4-id-prefixing` ·
`unit-ms4-id-prefixing-adversarial` · `unit-h1-registry-write` · `unit-h2-runtime-controller` ·
`unit-h4-hot-remove` · `unit-h5-teardown` · `unit-h6-hot-rename` · `unit-h7-default-reassign` ·
`unit-ud1-document-metadata-fields` · `unit-ud1-document-metadata-fields-adversarial` ·
`unit-ud3-import-path-id-scheme` · `unit-ud3-import-path-id-scheme-adversarial`.

**Live-import check:** the 5 apparent hits are **comments**: `tests/unit-x-rag-provenance-traversal.test.ts`,
`tests/retrieval.test.ts`, `tests/unit-f1-merge-store-results.test.ts`, `tests/unit-v1-store-adjacency.test.ts`
(name the `rag-store` **module**), `tests/unit-f3-stores-all-schema.test.ts` (names `unit-ms2-store-wiring`'s **spec**),
`src/main/rag-store-directory.ts` (a comment), and the 4 blind-greens/adversarial files that cite their
sibling's name. **No live file imports an archived suite** → **no archived file blocks the rebuild.**

**The remaining 180 suites that pin OLD authority behavior.**

| File | The pinned OLD behavior | Disposition | Derived from |
| --- | --- | --- | --- |
| `tests/unit-h8-operator-editor.test.ts` | the **operator registry-management** surface (`hotApply`/`hotRename`/`hotSetDefault` + `registryManage`) | **`KEEP`** — `docs/specs/test-pruning-disposition-2026-09-21.md` §3.3.3 rules it **host-owned and untouched** (`docs/specs/obsolete-document-disposition-2026-09-21.md` §D.1b.2); §7 item 7 confirms. **It gains the cut-over-store refusal (`FS11`) as an extension row** | `unit-authority-switch.md` §5.4 row 11 |
| `tests/unit-ms5-settings-listing.test.ts` | the **read-only store listing** (`operator-rag-stores`) + `RagQueryPayload.store` | **`KEEP` + extension** — `§5.4` row 10 pins `IPC_RAG_STORE_LISTING` as **`H` in every state** (*"manual-UI only; never an MCP tool"*) | `unit-authority-switch.md` §5.4 |
| `tests/unit-f3-stores-all-schema.test.ts` | the registry **schema** validation + the `stores:all` result shape (`DECIDED: STORES-ALL-SCHEMA`, `DECIDED: FANOUT-INTERLEAVE-MERGE`) | **`KEEP`** — `§11.1` item 4 lists the multi-store registry + `FANOUT-INTERLEAVE-MERGE` (`PRUNE-835`, a `user-directed-record` row frozen at `keep-advisory`) as **NOT superseded / NOT prunable** | — |
| `tests/unit-live11-bridge-seams.test.ts`, `tests/unit-live4-*`, `archive/tests/2026-10-04-unit-live8-toolbar-undo-refresh.test.ts`, `tests/unit-live-dom-click-dispatch.test.ts`, `tests/sidebar-panes*.test.ts`, `tests/unit-wave-1-bridge-wiring.test.ts` | the renderer bridge + host boot/write paths | **`REWRITE`** — these gain the **engine-absent** / mid-session-S3 rows (`§8.2`'s pinned behavior) and the `authority-switch` record's projection | `unit-authority-switch.md` §8 + `docs/specs/design-extensions-review.md` §11.3 |
| `archive/tests/2026-10-04-unit-a1-crud-routing-proxy.test.ts`, `tests/unit-a2-document-crud-wiring.test.ts`, `archive/tests/2026-10-04-unit-gn-engine-integration.test.ts`, `tests/unit-gn-mcp-ui-wiring.test.ts`, `archive/tests/2026-10-04-engine-crud-real-transport.test.ts`, `archive/tests/2026-10-04-unit-shell-integration.test.ts`, `archive/tests/2026-10-04-props-a1-crud-routing-proxy.test.ts`, `tests/props-a2-document-crud-wiring.test.ts`, `tests/props-shell-integration.test.ts`, `tests/blind-unit-a2-…-greens.test.ts`, `tests/blind-unit-gn-…-greens.test.ts`, `tests/blind-unit-shell-integration-greens.test.ts`, `tests/blind-unit-ud6-…-greens.test.ts` | the engine CRUD/retrieval proxies over the real transport | **`KEEP`** — the proxies are the **destination**; the switch changes **which state routes to them**, not their behavior | — |
| `tests/unit-import-batch-persist-contract.test.ts` | the host persist census + the depth-10 000 rows | **`KEEP` (PROTECTED)** — the exclusion is substantiated (§3.3.4) | — |
| `tests/traversal.test.ts` + `tests/import-render-no-duplicates.test.ts` | the two fence files | **`KEEP` — EXEMPT BY NAME** (`§2.3`'s MUST-NOT-EDIT list: *"a unit that cannot stay green under them is NOT an implementation of the ruling but a new proposal re-entering the gate"*) | — |
| `tests/unit-v5-migration-contract.test.ts` | the migration contract + the path pins | **`KEEP` (PROTECTED)** | — |
| `tests/unit-o-0-*.test.ts`, `tests/unit-o0-m1-m3-*.test.ts`, `tests/unit-o-0-report-contract.test.ts` | the O-0 measurement/oracle contract | **`KEEP`** — the oracle-identity pair is a MUST-NOT-EDIT (§2.3) | — |
| `archive/tests/2026-10-04-unit-u-menu-1-application-menus.test.ts` | the application menus | **`KEEP` for this unit** (`REWRITE` under C11) | — |
| `tests/mcp-security-hardening.test.ts`, `tests/rag-edit-gate.test.ts`, `tests/security*.test.ts`, `archive/tests/2026-10-04-module-security-gate.test.ts`, `tests/mcp-server-gate.test.ts`, `tests/mcp-server-wiring.test.ts` | the group gate + the MCP contract | **`KEEP`** — `§7` items 1–2 + `docs/specs/mcp-endpoint.md` is **excluded by name** from `GN-2` (`docs/specs/design-extensions-review.md` §11.4) | — |

**Count: ~6 `REWRITE`-class file groups (`REWRITE` on 6 named files; the live-battery files are
`REWRITE`-class too) + 0 `DELETE` for `U-AUTHORITY-SWITCH`.** The unit's own spec names the
re-derivation set **by file** (§14.2: *"`U-AUTHORITY-SWITCH`'s spec names the re-derivation set by
file and the regime split"*) — §12.2's `What this unit may and may not touch` + §13.2's frozen
boundaries are that list.

**The regression fence.** (1) The fence pair — green **unchanged** (`§2.3`). (2) `§9.1`'s **V1–V7
pre-switch checklist** readings (corpus census · migration receipt · rollback-point verification ·
the fence's trio reading · the cache's residency) — *"the fence must be run, not planned"*. (3)
**`§9.3`'s rollback red set** — the rollback has its **own** red set and its own verification (§7.4).
(4) The **`P-AS-1`…`P-AS-n` register** (§10) as the PBT fence.

### 4.5 The per-unit execution order for `U-AUTHORITY-SWITCH`

| Step | Action | Breaking? | Expected trio reading |
| --- | --- | --- | --- |
| **(i) spec** | **PRESENT.** Owed: the TestWriter red run (AGENTS.md item 9(b)), and **the spec's own §12.1 cycle**. **The unit is additionally gated by `U-ENGINE-PERSIST` (C2/C5) + `U-CORPUS-MIGRATION` (C3/C7)** | no | unchanged **180 / 3 846 / 0** |
| **(ii) test changes (the red set)** | New: the resolver's totality rows (31 × 4 = 124 cells, `FS17`), the `authority-switch` record's shape + rules, the switch conditions C1–C10's precedence, the cutover sequence K0–K8's abort legs, the `dual` shadow-replica contract (`P-AS-1`), the offline/engine-loss surfaces (`§8`), the rollback (§9.3's own red set). Rewrite: the ~6 files in §4.4 | **BREAKING** — every new row is red (no resolver, no record, no states exist) | **red** on the new + the rewritten set |
| **(iii) source changes** | The resolver + the route union (`§5.1`); the `authoritySwitchState()` accessor (§5.2); the `authority-switch` record's writer (§3.3); the routing wiring in `src/main/main.ts`'s `ipcMain.handle` bodies, `src/main/mcp-server.ts`'s three handlers, `src/main/preload.ts`'s bridge; the cut-over-store registry refusal (`FS11`); the engine-absent surfaces. **It must NOT: add a group, change a tool, touch the oracle pair, migrate the corpus, or delete the local store** | **BREAKING** — the trio stays **red** through (ii)+(iii) | **green at (iii)'s end** |
| **(iv) the archive move** | **EMPTY — nothing to move** (§4.3). The 17 retired suites are already archived | no | unchanged |
| **(v) the citation repoints** | `docs/decisions.md`: the **three already-landed `SUPERSEDED` rows** (`RAG-AUTHORITATIVE`, `SINGLE-WRITER-STORE`, `SINGLE-WRITER-STORE-PER-STORE` are **already marked SUPERSEDED 2026-09-21 in place**) + the authority-switch row's **`sunsetRecorded`/cutover** clause + `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`'s appended clause. `docs/pending.md` §"PARKED DESTINATION — the engine track" (the O-8 row). `docs/HANDOFF.md`'s O-7/O-8 pointer rows (**cited, never edited**). `docs/specs/unit-ms1…ms5`, `unit-h1/h2/h4-h7`, `unit-ud1/ud3` specs' citations of the 17 retired suites. `docs/defects.md` `DEMO-ENGINE-START-GAP` + `GNOSIS-SIDEBAR-SEAM-MISSING` (**status change owed**, per `docs/specs/design-extensions-review.md` §11.3: *"their fix shape presumes the local path stays usable"*) | no | unchanged |
| **(vi) trio** | as above, with the **fence reading recorded** in the DONE row (§14.2's verification clause) | — | green |
| **(vii) adversarial + item-10d** | RCA-3 adversarial (a `(tool, state)` cell that is undefined; a two-authority write; an unrecorded sign-off; a rollback with two live authorities; a registry mutation on a cut-over store); item-10d + the **recorded adversarial + doc-review** rows; **live battery MANDATORY** (`§13.3`: *"the two-writer / split-brain surface is an assembled-app property"*) + the §5.U re-pin; the oracle-identity discipline | — | green + the live reading; the DONE row states the **regime** (§12.7(f)) |

**The single commit boundary.** **One commit = (ii)+(iii)+(v)+(vii)'s doc row**, with the DONE row
stating `regime` vs `state` (`TEMPORARY-AUTHORITY-1`, `§14`).

---

## 5. THE ARCHIVE-CANDIDATE LEDGER (all four units, one table)

| # | Candidate | Unit | Class | Live importer(s) to change first | Movable now? |
| --- | --- | --- | --- | --- | --- |
| 1 | `src/renderer/rich-eligibility.ts` (whole module: `isRichEditableRoot`, `EDITABLE_TYPES`) | C9 | **DEAD-ONCE-THE-NEW-BEHAVIOR-LANDS** | `src/renderer/sidebar-panes.ts`; `archive/tests/2026-10-04-unit-u-shell-9b-h2-c20-materialization.test.ts` | **NO** — C9 is `SPEC-MISSING` |
| 2 | `src/main/traversal.ts` `buildSubtree`'s `type:'textarea'` child | C9 | **DEAD-ONCE…** (site, not module) | the host + **the fence** | **NO** — `SPEC-MISSING` + the fence collision (§6 B-3) |
| 3 | `src/renderer/sidebar-panes.ts` `applyEditingMode` | C9 | **DEAD-ONCE…** (method) | the host itself | **NO** — `SPEC-MISSING` |
| 4 | `src/renderer/sidebar-panes.ts` `setTextareaReadOnly` | C9 | **DEAD-ONCE…** (method) | the host itself | **NO** — `SPEC-MISSING` |
| 5 | `src/renderer/sidebar-panes.ts` `RAG_EDITOR_HANDLER_DEFS` + the 4 `rag-editor-*` bodies | C9 | **DEAD-ONCE…** (set) | the host itself | **NO** — `SPEC-MISSING` |
| 6 | `src/renderer/sidebar-panes.ts` `TEXTAREA_INPUT_BODY`/`TEXTAREA_BLUR_BODY` + `textareaInput`/`textareaBlur` + the 2 bridge members | C9 | **DEAD-ONCE…** (set) | the host + `src/main/preload.ts` | **NO** — `SPEC-MISSING` |
| 7 | `src/renderer/edit-controller.ts` `CaretState`'s 2 per-node kinds + `RichCaretEdge` + `isEditable` | C9 | **PARTIALLY-SHARED (surgery)** — the module survives | 27 test files + 2 `src/` modules | **NO** — surgery, not a move |
| 8 | `src/renderer/cross-document-shared.ts` `scopeDocumentIds`'s `textarea-` branch | C9 | **PARTIALLY-SHARED** | `archive/tests/2026-10-04-unit-u-shell-9b-h3-doc-namespace.test.ts` | **NO** — branch surgery |
| 9 | `src/main/app-menu.ts` `buildMenuTemplate`'s `Panes` submenu + `AppMenuActions.togglePane` | C11 | **DEAD-ONCE…** (site) | `src/main/main.ts` `rebuildApplicationMenu` | **NO** — C11 is `SPEC-MISSING` |
| 10 | `src/shared/types.ts` `IPC_PANE_VISIBILITY` | C11 | **DEAD-ONCE…** (constant) | `main.ts`, `preload.ts`, `sidebar-panes.ts` | **NO** — `SPEC-MISSING` |
| 11 | `src/renderer/sidebar-panes.ts` `applyPersistedPaneVisibility` + the `FIRST_RUN_APP_DEFAULT` branch | C11 | **DEAD-ONCE…** (method) | the host's boot path | **NO** — `SPEC-MISSING` |
| 12 | `src/renderer/sidebar-panes.ts` `#operator-enabled-panes` census div | C11 | **DEAD-ONCE…** (node) | `tests/unit-ms5-settings-listing.test.ts` | **NO** — `SPEC-MISSING` |
| 13 | `src/renderer/sidebar-panes.ts` `#operator-pane-visibility` section + `OPERATOR_PANE_VISIBILITY_HANDLER(_BODY)` | C11 | **DEAD-ONCE…** (section) | the host itself | **NO** — `SPEC-MISSING` |
| 14 | `src/renderer/sidebar-panes.ts` `togglePaneVisibility` + `onPaneVisibilityChange` + `paneVisibilityTouched` | C11 | **DEAD-ONCE…** (methods) | the host + `tests/unit-live11-bridge-seams.test.ts` | **NO** — `SPEC-MISSING` |
| 15 | `src/renderer/sidebar-panes.ts` `syncZoneMirrors` | C11 | **DEAD-ONCE…** (method) | the host itself | **NO** — `SPEC-MISSING` |
| 16 | `src/renderer/pane-graph.ts` `resolveEnabledZonePanes`/`enabledZonePaneCounts`'s enabled-set filter | C11 | **PARTIALLY-SHARED** | `sidebar-panes.ts`, `layout-state.ts` | **NO** — surgery |
| 17 | `src/main/operator-settings-store.ts` `OperatorSettings.enabledPanes` (app-graph half) | C11 | **PARTIALLY-SHARED** | the store's `sanitize`/`set`, the host | **NO** — surgery |
| 18 | `src/main/main.ts` `IPC_RAG_SNAPSHOT`'s whole-store handler | RP | **PARTIALLY-SHARED** | `preload.ts`, the host | **NO** — surgery (`FS9`), the seam is `DECIDED: RAG-SNAPSHOT-PRESERVED` |
| 19 | `src/renderer/pane-registry.ts` `PaneContext.snapshot`'s `null`-as-empty guard | RP | **PARTIALLY-SHARED** | the panes | **NO** — surgery (`§12.2` item 3) |
| 20 | `src/main/rag-store.ts` (`temporary authority`) | RP + AS | **TEMPORARY-AUTHORITY (KEPT)** | — | **NO** — sunset is `U-AUTHORITY-SWITCH`'s |
| 21 | `src/main/rag-store-registry{,-write}.ts`, `rag-store-runtime.ts`, `rag-store-directory.ts`, `rag-store-remove.ts` | RP + AS | **TEMPORARY-AUTHORITY (KEPT) / §11.1 item 4 NOT-prunable** | — | **NO** |
| 22 | `src/main/engine-{rag,crud-rag}-store.ts`, `engine-transport.ts`, `engine-config.ts` | AS | **UNAFFECTED (the destination)** | — | **NO** |

**Archive-candidate count: 17 candidates across C9 (8) + C11 (9), of which exactly ONE (`rich-eligibility.ts`)
is a whole-module move and 16 are code sites inside surviving modules.** **`U-READS-PIVOT` and
`U-AUTHORITY-SWITCH` contribute ZERO archive candidates** — they are surgery/routing units by
construction. **Movable today: ZERO** — both spec-bearing units have no archive candidate, and both
spec-missing units may not move anything (AGENTS.md item 9).

---

## 6. THE HONEST BLOCKERS

### 6.1 Missing specs, missing upstream capabilities, missing rulings

| Id | Blocker | Kind | Whose |
| --- | --- | --- | --- |
| **B-1** | **C9 `U-EDIT-1` has no spec.** The `WHOLE-PAGE-EDITING` requirement is recorded as *"(REQUIREMENT, not yet implemented)"* and *"Owes a spec re-derivation"* (`docs/decisions.md`), and `docs/specs/design-extensions-review.md` §3.3 C `C9` says **"spec re-derivation first"**. Without it, neither the red set nor the code change may be delegated (AGENTS.md item 9) | **SPEC-MISSING** | a doc-layer authoring pass |
| **B-2** | **C11 `U-SEARCH`'s removal half has no spec.** `DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` states *"does not implement the removal (that is a UI unit's work with its own spec, red set and live battery)"*; the `SR-*` half has no spec either | **SPEC-MISSING** | a doc-layer authoring pass |
| **B-3** | **The C9 fence collision.** `tests/traversal.test.ts` is **exempt by name** (`docs/specs/design-extensions-review.md` §11.1 item 5) **and** it asserts the per-node textarea overlay (row 8: `childIds === [undefined, 'textarea-ul', 'rag-li1'…]`), which `ST-1`/`ST-6` **remove**. §14.2 S3 forbids a unit from "adjusting" the fence (*"a unit that 'adjusts' the fence is re-entering this gate"*). **Two options exist and neither is a unit's call** (§1.5 (iii-b)): (A) amend §14.2 to scope the exemption to the fence's **non-textarea rows** (the fence's real subject — `buildTraversal`'s placement/traversal contract — is asserted by other rows); (B) re-author row 8 as C9's own re-derivation and record the fence as **re-planned, not re-derived** | **NEEDS A USER RULING** | the user (a gate decision, `§14.2` S3) |
| **B-4** | **`U-AUTHORITY-SWITCH` is gated by two upstream capabilities it cannot supply.** Its conditions **C2 (engine persistent)** and **C5 (a revision/marker exists)** need the Gnosis engine's **durability** (`O-7`, `PRUNE-838`/GR-7 — the engine **persists nothing today** **⟨CORRECTED 2026-09-28 (`X-7`): the DURABILITY half of `C2` is no longer the blocker — the engine's own trackers record `D-D1`+`D-D2` DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22) and `GR-7`'s trigger DISCHARGED (`../Gnosis/docs/next-steps.md` §DONE rows `D-D1`/`D-D2`; `../Gnosis/docs/pending.md` `GR-7`; `docs/decisions.md` `DURABLE-STORE-LANDED`) — ENGINE-green, never app-green, UNVERIFIED LIVE from this repo. `C2` is re-aimed to a fork-side live-evidence obligation (see B-5); `C5`'s revision/marker half is UNCHANGED.⟩**) and a **monotonic revision** (`GR-4`, whose inbound review *"reframes the read as paginated cursor-tagged pages and refuses the revisioned-projection framing"* — so the **cursor-vs-revision difference is a recorded open question**). Every engine item is a **handoff, never a patch** (AGENTS.md item 7; `docs/specs/unit-engine-persist.md` §2.4) | **UPSTREAM-OWED — AMENDED 2026-09-28 (`X-7`): the durability/O-7 half of `C2` has LANDED engine-side (`D-D1`+`D-D2`, `GR-7` trigger DISCHARGED — ENGINE-green only); `C2` is now a FORK-side live-evidence obligation, and the remaining upstream block is the INGEST/RECORD-COPY route named in B-5. `C5`'s revision/marker half is UNCHANGED (`GR-4` REFUSED).** | the Gnosis repo + `docs/HANDOFF.md`'s O-7/GR-4 rows |
| **B-5** | **`U-AUTHORITY-SWITCH`'s conditions C3/C7 need `U-CORPUS-MIGRATION`**, whose **engine destination leg is BLOCKED**: *"The engine leg's only truthful status today is BLOCKED (`FS-CM-1`). There is nothing to be green about"* (`docs/specs/unit-corpus-migration.md` §10.3). Its §2.3 names the **not-yet-filed** fourth upstream capability (a **record-copy route with caller-supplied ids**) | **UPSTREAM-OWED — AMENDED 2026-09-28 (`X-7`): THIS IS NOW THE LOAD-BEARING ENGINE BLOCKER for the whole P2 chain** (the durability leg of `C2` has landed engine-side, so the record-copy route named here — `GR-6a`/`GRQ-6`, PARKED with its trigger **UNDISCHARGED** — is the unsatisfied conjunct; `docs/pending.md` `GR-6a`; `docs/specs/gnosis-grq-inbound-review.md` §4 `GRQ-6` + §11).** | the Gnosis repo |
| **B-6** | **The commit-path reversal is `C9`'s to restate, and nobody else's.** `docs/specs/design-extensions-review.md` §12.7(a): *"The unit that must RESTATE the commit contract is the `WHOLE-PAGE-EDITING` unit … **No other unit may restate it**, and no unit may implement an async commit before that restatement lands."* **So `U-READS-PIVOT`'s §6.3 "read-side envelope" cannot become a full commit contract, and `U-AUTHORITY-SWITCH`'s `edit.*` cells stay `D(U-EDIT-1)`** — which means **the authority switch's S2 write route is incomplete until C9 lands**. This is a **cross-unit ordering constraint that survives the spec gap**: `C9` is `P3` and `U-AUTHORITY-SWITCH` is `P2`, yet P2's S2 cells defer to P3's unit | **ORDERING CONSTRAINT (recorded; no new blocker)** | the program (`§13.1` P2 → P3) |
| **B-7** | **`U-READS-PIVOT`'s `revision`/marker field does not exist.** `RagSnapshotPayload` is `{store, nodes, edges}` (verified), and *"a cache cannot be made coherent without a revision/marker — so the revision field (or an equivalent marker) is a **PREREQUISITE** of `U-READS-PIVOT`"* (`docs/specs/design-extensions-review.md` §14.4). The unit ships **Rule A conditional + Rule B partial** and records `SNAPSHOT-REVISION-AUTHORITY` as **OWED** (`unit-reads-pivot-tab-cache.md` §9's honesty bound 1) | **UPSTREAM-OWED (partially self-mitigating)** | GR-4 + the decision row |
| **B-8** | **A stale persisted `enabledPanes` after the C11 removal.** A `provident-operator-settings.json` written before the removal may hide an app-graph pane; with the option gone there is **no UI handle back**. `DOCUMENT-CONSISTENCY-IS-A-PRODUCT-FEATURE`/`PANE-VISIBILITY-IRREVERSIBLE`'s recommended fix does **not** state the migration behavior. **This is the one place the removal can silently hide a pane the user never chose to lose** — it must be a pinned fail-state in C11's spec, not an implementation liberty | **NEEDS A SPEC DECISION** (may escalate to a ruling) | the C11 spec author |
| **B-9** | **The repo-wide toolchain constraint.** *"The `vitest-5 / electron-44` toolchain migration still BLOCKS every unit's `npm test` leg as a repo-wide constraint; this queue's obligations do not lift it"* (`docs/next-steps.md` §OPEN). This pass's run reads **180/3 846/0** (green), so the constraint is a **standing recorded risk**; **no unit may report the fence green from a plan** (§14.2) | **STANDING CONSTRAINT** | the repo (its own unit) |
| **B-10** | **Two catalog corrections are owed to another pass** and touch this map's rows: `PRUNE-820`'s stale model claim (*"the main-process single-writer store owns every write today"*, citing a now-**SUPERSEDED** row) and the `PRUNE-829`/`PRUNE-361` re-homing. `§C.4` is **non-prunable by construction** (§11.4's exclusion table), so the route must be a §C.3 correction row or a tracker row | **DOC-LAYER, another pass's write target** | the catalog amendment pass |

### 6.2 Ranked by "ready to execute now"

| Rank | Unit | Ready? | Why |
| --- | --- | --- | --- |
| **1** | **P2 `U-READS-PIVOT`** | **READY (spec-half gate satisfied; red set owed)** | The spec is complete and self-contained: 8 typed register rows, 6 `FS` groups, an explicit **MUST-NOT** list (the `RagStore` interface, the fence, the operator corpus), a **stated blast radius** with counts, a **named fence rule**, a **layer table**, and its own honesty bounds. It is the **only** unit of the four with **zero spec gaps** and **zero archive moves**, and its blockers (**B-7** `revision`, **B-9** toolchain) are **recorded and mitigated inside its own spec** (`Rule A conditional`/`Rule B partial`; the fence rule). It also **unblocks** `U-AUTHORITY-SWITCH`'s `C4` condition |
| **2** | **P2 `U-AUTHORITY-SWITCH`** | **SPEC-COMPLETE, PREREQUISITE-BLOCKED — partially executable** | Its spec is the most detailed of the four (a **124-cell** routing grid, a 19-row IPC table, a 10-condition switch gate, an 8-step cutover, a 4-state machine, a register, 7 MUST-NOT-EDIT items). But **C2/C3/C5/C7** need the engine's durability + the migration, i.e. **B-4 + B-5**; and its S2 `edit.*` cells defer to **C9** (**B-6**). **Executable now: the resolver + the record + the state machine + the routing tables (a large, node-testable slice that does not require the engine).** Not executable now: the **cutover itself** |
| **3** | **C11 `U-SEARCH`** | **BLOCKED — `SPEC-MISSING` (B-2)** | Its implementation surface is **small and fully mapped** (9 candidates, 4 test rewrites, 1 archived suite, a complete live path), and the removal instruction is **unambiguous**. It is **rank 3 only because the spec does not exist**; once authored, it is the **fastest** unit of the four. It also carries **B-8**'s stale-settings decision |
| **4** | **C9 `U-EDIT-1`** | **BLOCKED — `SPEC-MISSING` (B-1) + the fence collision (B-3)** | The largest unit (`ST-1`/`ST-3`/`ST-4`/`ST-5`/`ST-6`; store + envelope + renderer; 8 candidates; 7 test rewrites), **and** the only unit with a **hard, unresolved collision against a fence file that a user ruling protects by name**. It also owns the commit-contract restatement every other unit defers to (**B-6**) |

**Which one the rebuild should start with, and why.**

> **Start with P2 `U-READS-PIVOT`.** It is the only unit of the four whose **spec exists and carries no
> gap**, whose **blockers are already mitigated inside its own contract**, and which **contributes zero
> archive moves** — so it can run its whole gate cycle (red → green → adversarial → item-10d → live)
> **without touching a fence, without a new spec, and without an engine route**. It also **feeds
> `U-AUTHORITY-SWITCH`'s condition C4** (`docs/specs/unit-authority-switch.md` §13.1: *"`U-READS-PIVOT`
> → this unit … Feeds C4 and V5; supplies the `K` routes of §5"*), so it is on the critical path for
> both remaining units.
>
> **In parallel (a different workstream, doc-layer, no code): author the two missing specs (B-1, B-2)
> and take the fence ruling (B-3).** Those three items are what stand between the rebuild and C9/C11.
> **`U-AUTHORITY-SWITCH`'s node-testable slice** (the resolver + the record + the state machine) can
> start once `U-READS-PIVOT`'s cache exists to supply its `K` routes; its **cutover** legs wait on the
> Gnosis handoffs (B-4/B-5).

### 6.3 What needs a user ruling (the short list)

1. **B-3 — the `tests/traversal.test.ts` fence**: scope the exemption to the fence's non-textarea rows,
   or re-author row 8 as C9's own re-derivation and record the fence as **re-planned** (`§14.2` S3
   requires a gate decision, not a unit decision).
2. **B-8 — the stale `enabledPanes` migration** after C11's removal: does the removal **re-enable every
   app-graph pane unconditionally** (the "no hide affordance exists" reading) or **refuse to boot a
   stale hiding set**? The defect row's recommended fix implies the former; it does not say so.
3. **`§11.4`/`GN-2`'s `IPC_PANE_CATALOG` fate** after C11: the catalog's consumer is **undecided** in
   every governing row (this map records it as `PARTIALLY-SHARED` rather than guessing).

---

## 7. THE CROSS-UNIT EXECUTION ORDER (the four units, one sequence)

```text
[AUTHOR NOW · doc-layer, no code]
  · the C9 whole-page spec            (B-1)
  · the C11 U-SEARCH spec             (B-2)
  · the fence ruling on traversal.test.ts  (B-3, USER)
        │
        ▼
[P2 ①] U-READS-PIVOT   — spec ready · 8 REWRITE · 0 archive · fence green unchanged
        │                 red → green → adversarial + PBT → item-10d → LIVE → DONE(layer + fence reading)
        ├─────────────────────────────►  supplies U-AUTHORITY-SWITCH's C4 + the K routes
        ▼
[P2 ②] U-AUTHORITY-SWITCH — spec ready · ~6 REWRITE · 0 archive
        │   executable now: resolver (124 cells) + authority-switch record + state machine + routing tables
        │   BLOCKED: the cutover legs, on  U-ENGINE-PERSIST (C2/C5 — B-4) + U-CORPUS-MIGRATION (C3/C7 — B-5)
        │   DEFERRED: the S2 edit.* cells → D(U-EDIT-1)  (B-6)
        ▼
[P3 ③] C11 U-SEARCH   — spec authored first · 4 REWRITE · 0 archive · 1 suite already retired
        │                 the SMALLEST and FASTEST unit once its spec exists
        ▼
[P3 ④] C9 U-EDIT-1    — spec authored first · 7 REWRITE · 17 suites already retired · 0 PROTECTED move
                          THE LARGEST unit; owns the commit-contract restatement every other unit defers to (B-6)
                          resolves the fence collision (B-3) BEFORE any code
```

**RCA-2/RCA-5 hold by construction:** one unit = one spec, one red run, one green, one adversarial
pass, one doc review, one DONE row, one commit boundary. **No two of these four may share an inline
run**, and `C9`/`U-AUTHORITY-SWITCH` in particular must not be adjacent in the same cycle — the
`D(U-EDIT-1)` deferral is a **contract boundary**, not a convenience.

---

## 8. REPORT / LAYER

- **Written:** this file — `docs/specs/rebuild-drift-map-2026-09-21.md`. **The only write of this
  pass.** No `src/**`, `scripts/**`, `tests/**`, `archive/**`, tracker or other spec file was edited,
  moved or deleted.
- **Layer (RCA-12):** **DOC-LAYER / audit record.** Every source-mapping claim is a **code read**;
  every test claim is a **grep reading**; the one suite figure (`180 / 3 846 / 44 / 0`) is **this
  pass's own `npm test` run**, and it matches `docs/specs/test-pruning-disposition-2026-09-21.md`
  §9.5's post-move reading exactly. **Nothing here is app-green, envelope-green, store-green or
  live-green.**
- **The four verdicts:** **C9** `SPEC-MISSING`; **C11** `SPEC-MISSING` (the removal half);
  **`U-READS-PIVOT`** spec-ready, red-set owed; **`U-AUTHORITY-SWITCH`** spec-ready, red-set owed and
  cutover-blocked.
- **The one unit to start with:** **P2 `U-READS-PIVOT`.**
- **The three items needing a user ruling:** **B-3** (the fence), **B-8** (the stale-settings
  migration), and the `IPC_PANE_CATALOG` fate.
- **What this pass did NOT do:** it did not author the two missing specs, did not run any unit's red
  set, did not move a file, and did not re-derive any census — every figure is cited or read.
