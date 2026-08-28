# Spec — Unit U4: The Contenteditable Rich-Text Editor (Handlers + Bridge + Discriminated `CaretState` + IME Composition Guard + Re-Derive Caret Restore)

- **Status:** SPEC (the **U4** unit of the editing-mode-toggle + contenteditable
  rich-text editor slice — the final, highest-risk unit). It wires the
  per-node contenteditable rendering (already authored by the U3 splice) to the
  edit path: the rich-mode event handler defs (`rag-editor-input` /
  `rag-editor-blur` / `rag-editor-compositionstart` / `rag-editor-compositionend`),
  the bridge methods, the discriminated `CaretState` (`textarea` | `rich`) +
  `RichCaretEdge`, the IME composition guard keyed by ragId, and the re-derive
  caret restore. On blur the HOST decomposes the contenteditable's HTML ONCE
  (`decomposeRichHtml`, Unit U2) into `{content, children}` and commits via the
  `setRichText` write-back (Unit U5, `edit.commitRich`) + the dirty-edit guard +
  re-traversal (re-derive). Decisions **B**, **G**, **H**, **I** of
  `docs/specs/editing-mode-toggle-review.md` §4/§5 + amendments 4 (the cross-unit
  textarea gate) and 6 (the first-materialization limitation).
- **Scope:** `src/renderer/sidebar-panes.ts` (the 4 rich handler defs + the 4
  bridge methods + the composition-guard fields + the gated re-derive caret
  restore + the `applyEditingMode` handler attachment + the `CaretState`
  supersession of the Unit L textarea path), `src/renderer/edit-controller.ts`
  (the discriminated `CaretState` + `RichCaretEdge` types + `saveCaret` /
  `restoreCaret` handling both kinds), `src/renderer/rich-eligibility.ts` (no
  change — consumed). It CONSUMES: Unit U2 `decomposeRichHtml`
  (`src/main/rich-decompose.ts`, PURE — imported into the renderer, the same
  cross-main import pattern as `buildTraversal`), Unit U5 `edit.commitRich`
  (`IPC_EDIT_RICH_COMMIT` / `RichCommitResult`), Unit U3's `applyEditingMode`
  splice + `isRichEditableRoot`, Unit U1's `editingMode` field +
  `operator-settings-changed` broadcast. This unit does NOT implement the
  `setRichText` op (U5, landed), the decompose converter (U2, landed), the
  eligibility/splice (U3, landed), or the settings control/broadcast (U1,
  landed). It does NOT touch `src/main/*` (no store, no new IPC, no new op — it
  only ADDS host wiring + the discriminated caret type).
- **TestWriter contract:** every signature, return shape, state, and fail-state
  below is derivable from this spec ALONE. The discriminated `CaretState` +
  `RichCaretEdge` types and the `saveCaret`/`restoreCaret` both-kinds behavior
  (edit-controller.ts) are fully node-testable. The DOM-coupled host wiring (the
  rich caret capture/restore, the selection reads, `document.getElementById`
  reads, the innerHTML blur read, the composition guard against real IME
  sequencing) rides the existing SidebarPanes host integration harness (the
  same harness Unit K/U3/U1/U5 use) with the dom-shim, and the DOM-only parts are
  documented in a `.skip` block (mirroring the Unit L §5.8/§5.9 convention —
  verified by code review / the e2e battery). The PURE seam
  (`decomposeRichHtml`) is U2's; U4's decomposition-ONCE call + the
  commitRich-ONCE call are asserted via the harness (spy: `decomposeRichHtml`
  called exactly once, `bridge.edit.commitRich` called exactly once per real
  blur).

---

## 1. Status + signatures + handler defs + bridge + caret + IME + restore

### 1.1 What the proposal asks (U4)

When `editingMode === 'contenteditable'`, a RICH-ELIGIBLE RAG subtree root
(Unit U3 §1.2 `isRichEditableRoot`) is spliced to `contenteditable: true` (U3
`applyEditingMode`) and must become a live rich-text editor: the user types rich
HTML into it, the host captures the browser selection, and on blur the host
decomposes the root's `innerHTML` ONCE (Unit U2 `decomposeRichHtml`) into
`{content, children}` and commits BOTH atomically via the Unit U5
`setRichText` op (`edit.commitRich`). The edit is guarded by the dirty-edit
guard (input marks the node dirty; a re-derive while dirty is queued); after the
commit the re-derive re-traverses and re-renders the contenteditable from the
store's re-traversed `children`, then the host restores the saved rich caret
(anchor/focus path + offset) into the re-rendered DOM. IME composition is
guarded: while composing, a blur/commit is suppressed and deferred until
`compositionend` (decision H). The textarea caret is never restored into a
contenteditable node and the rich caret never into a textarea node (amendment 4 /
U3 F2). A multi-parent duplicate commits from the FIRST materialization only
(decision I / amendment 6 — documented limitation).

### 1.2 The discriminated `CaretState` + `RichCaretEdge` (pinned — decision B)

**`src/renderer/edit-controller.ts`.** The former textarea-only `CaretState = {
offset; focused }` (Unit D §5.3 / Unit L §5.4) is SUPERSEDED by the
DISCRIMINATED union (now the pinned `CaretState` type at lines 45-47). The
`saveCaret`/`restoreCaret` signatures are UNCHANGED in
shape (`saveCaret(nodeId, caret: CaretState)`, `restoreCaret(nodeId): CaretState
| undefined`); only the `CaretState` type is superseded.

```ts
/** The discriminated caret state (Unit U4 §1.2 — decision B). A `textarea`
 *  caret is the existing Unit L shape PLUS the `kind` discriminator; a `rich`
 *  caret carries the RAG node id + a path-based anchor/focus edge into the
 *  decomposed inline children. Restored after a re-derive, gated by the node's
 *  RENDERED control type (amendment 4 — a textarea caret is never applied to a
 *  contenteditable node and vice versa). */
export type RichCaretEdge = {
  /** The child-index path from the contenteditable root element down to the
   *  target text node in the rendered inline-children subtree (the decomposed
   *  `content`/`children` render). Each element is the child index at that
   *  depth (0-based). `[]` addresses the root element itself (its direct text
   *  run); a non-empty path addresses the text node reached by following the
   *  child indices from the root. */
  path: number[]
  /** The character offset within the target text node. Clamped to the text
   *  node's length on restore. */
  offset: number
}

export type CaretState =
  | { kind: 'textarea'; offset: number; focused: boolean }
  | { kind: 'rich'; ragId: string; anchor: RichCaretEdge; focus: RichCaretEdge; focused: boolean }
```

**API rules (pinned):**

- **`kind` discriminator:** every saved caret carries `kind: 'textarea'` or
  `kind: 'rich'`. There is NO ambiguous `{ offset, focused }` without a `kind`
  (the discriminated type is total — every object matches exactly one branch).
- **Textarea kind = the existing shape + `kind`:** `{ kind: 'textarea';
  offset; focused }`. The Unit L textarea path (`textareaBlur` in
  sidebar-panes.ts) now writes `saveCaret(ragId, { kind: 'textarea', offset,
  focused: dirty })` — the ONLY change to the textarea path is the added `kind`
  discriminator (supersedes Unit L §5.4's `{ offset, focused }` shape).
- **Rich kind:** `{ kind: 'rich'; ragId; anchor; focus; focused }`. `anchor` and
  `focus` are the selection's anchor and focus edges captured from the DOM at
  blur (§1.6); `ragId` is the RAG node id; `focused` follows the Unit L H3 rule
  (only a real edit — dirty — re-focuses).
- **`saveCaret` / `restoreCaret` handle both kinds transparently** (pinned):
  the controller stores/returns the full discriminated `CaretState` keyed by RAG
  node id; it does NOT branch on `kind` in its own storage logic. The controller
  is PURE — it has NO DOM access and NO editing-mode knowledge, so the MODE
  GATING (which kind to apply, to which element) lives in the HOST's re-derive
  caret-restore loop (§1.7), NOT in the controller. `restoreCaret` keeps the
  dangling-backRef behavior (Unit D §5.3 L5): a dangling back-reference clears
  the saved caret and returns `undefined`.
- **No throw path:** `saveCaret`/`restoreCaret`/`clearCaret` never throw for any
  `CaretState`/nodeId value (the existing controller contract is unchanged).

### 1.3 The rich handler defs (pinned — decision G)

**`src/renderer/sidebar-panes.ts`**, the 4 function-string handler defs. They
reach the host via `window.provident.sidebar` (NEVER an MCP tool — the Unit K
M2 pattern). The blur body prefers a dispatch-provided `html` arg (MCP path,
decision G) and falls back to the DOM contenteditable root's `innerHTML`
(`document.getElementById('rag-' + ragId)`, UI path).

```ts
const RAG_EDITOR_INPUT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.editorInput(ragId);
}`
const RAG_EDITOR_BLUR_BODY = `function (ctx, html) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (!ragId) return;
  // G — prefer a dispatch-provided html arg (MCP path); else read the DOM
  // contenteditable root's innerHTML (UI path).
  if (html === undefined) {
    var el = document.getElementById('rag-' + ragId);
    html = el ? el.innerHTML : '';
  }
  s.editorBlur(ragId, html);
}`
const RAG_EDITOR_COMPOSITIONSTART_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.editorCompositionStart(ragId);
}`
const RAG_EDITOR_COMPOSITIONEND_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.editorCompositionEnd(ragId);
}`
```

**Handler names + events + bridge calls (pinned):**

| Handler name | Event | Body reads | Bridge call |
| --- | --- | --- | --- |
| `rag-editor-input` | `input` | the root's `data-rag-node-id` prop | `window.provident.sidebar.editorInput(ragId)` |
| `rag-editor-blur` | `blur` | the root's `data-rag-node-id` prop + a dispatch-provided `html` arg when present, else `document.getElementById('rag-' + ragId).innerHTML` | `window.provident.sidebar.editorBlur(ragId, html)` |
| `rag-editor-compositionstart` | `compositionstart` | the root's `data-rag-node-id` prop | `window.provident.sidebar.editorCompositionStart(ragId)` |
| `rag-editor-compositionend` | `compositionend` | the root's `data-rag-node-id` prop | `window.provident.sidebar.editorCompositionEnd(ragId)` |

**Registration (pinned):** `bindHandlers()` registers the 4 defs via
`registerHandlerDef` with the FULL function-expression bodies above (the
`compileHandlerBody`-compatible form — the U1 F3 convention; the harness also
reads them back as `new Function('ctx', body)` for the inner-statement forms).
They are registered in the app-graph scope so `provident.dispatch` can drive
them (MCP/UI equivalence — the contenteditable is MCP-visible, §3).

**`applyEditingMode` handler attachment (pinned — the U4 extension of the U3
splice):** in `contenteditable` mode, the U3 `applyEditingMode` splice (which
sets `contenteditable: true` and removes the `textarea-<ragId>` child) is
EXTENDED to ALSO attach the 4 name-referenced handler defs to each eligible
root's `handlers` array:

```ts
n.handlers = [
  { name: 'rag-editor-input', event: 'input' },
  { name: 'rag-editor-blur', event: 'blur' },
  { name: 'rag-editor-compositionstart', event: 'compositionstart' },
  { name: 'rag-editor-compositionend', event: 'compositionend' },
]
```

- **Eligible root, contenteditable mode:** its `handlers` array carries EXACTLY
  the 4 defs above (name-referenced — resolved to the registered bodies by the
  app Runtime's `resolveNameReferencedHandlerBodies`, the Unit L §5.8 state-12
  pattern). The root's `data-rag-node-id` prop (preserved by the splice) is what
  the handler bodies resolve.
- **Ineligible root, contenteditable mode:** the root keeps its textarea (and its
  textarea handlers, Unit L) — NO `rag-editor-*` handlers are attached.
- **`editingMode === 'textarea'`:** the splice no-ops — no handler attachment
  (the U3 idempotence contract is preserved).
- **Idempotence (mirrors the U3 H4):** on a repeated splice of the same envelope,
  the handler attachment is set again to the same 4-def array (idempotent — no
  duplicate handler accumulation, no throw). **minor #5 (adversarial):** the
  splice APPENDS the 4 defs NAME-DEDUPLICATED (`[...(n.handlers ?? []), ...the 4
  defs not already present]`) instead of REPLACING `n.handlers`. No authored
  template or traversal ever places a handler on a rich root (verified — the
  traversal authors handlers ONLY on the `textarea-<ragId>` child, traversal.ts;
  the content-window template authors zone containers only), so the merge yields
  EXACTLY the 4 defs today, but a future/extended authored handler on the root is
  never clobbered.
- **Authoring constraint (pinned):** the contenteditable root + its handlers are
  authored as provident-ssr data in the splice (the AGENTS.md
  all-UI-via-provident constraint). A contenteditable rendered outside the
  provident graph is a review finding.

### 1.4 The bridge + host methods (pinned — decisions G/H)

**`src/renderer/sidebar-panes.ts`.** `installSidebarBridge()` extends the
`window.provident.sidebar` surface with 4 methods:

```ts
editorInput: (ragId: string) => this.editorInput(ragId),
editorBlur: (ragId: string, html: string) => void this.editorBlur(ragId, html),
editorCompositionStart: (ragId: string) => void this.editorCompositionStart(ragId),
editorCompositionEnd: (ragId: string) => void this.editorCompositionEnd(ragId),
```

Three new host fields (decision H):

```ts
private composingRagId: string | null = null   // the RAG node id currently IME-composing
private pendingCommitRagId: string | null = null  // a blur deferred mid-composition, keyed by ragId
private committingRagIds: Set<string> = new Set()  // per-ragId commit-in-flight latch (ADR-1 no-double-commit race)
```

**`editorInput(ragId)` (pinned) — mark dirty:**
```ts
private editorInput(ragId: string): void {
  this.editController.markDirty(ragId)
}
```
A re-derive while the contenteditable is dirty is QUEUED (the dirty-edit guard,
Unit D §5.2) — the in-progress edit is never destroyed.

**`editorBlur(ragId, html)` (pinned — the HOST blur, decision G/I):**
```ts
private editorBlur(ragId: string, html: string): void {
  // I — capture the rich caret (selection) from the DOM BEFORE the commit; the
  // re-derive re-renders and destroys the selection.
  const anchor = this.captureRichCaret(ragId, 'anchor')
  const focus = this.captureRichCaret(ragId, 'focus')
  const dirty = this.editController.isDirty(ragId)
  this.editController.saveCaret(ragId, { kind: 'rich', ragId, anchor, focus, focused: dirty })
  this.caretNodes.add(ragId)
  if (!dirty) return   // no-op blur: caret saved, NO commit (no-op blur contract)
  if (this.composingRagId === ragId) {
    // H — a mid-composition blur is DEFERRED (commit suppressed until
    // compositionend); the selection was already captured + saved above.
    this.pendingCommitRagId = ragId
    return
  }
  this.editorBlurCommit(ragId, html)
}

/** The decompose-ONCE + commit-ONCE body (shared by the normal blur and the
 *  compositionend-deferred blur). Pinned with a per-ragId commit-in-flight
 *  latch (ADR-1 — the no-double-commit race) + a `.catch` (ADR-4 — a rejected
 *  invoke is logged, never an unhandled rejection). */
private editorBlurCommit(ragId: string, html: string): void {
  if (this.committingRagIds.has(ragId)) return   // ADR-1 — a commit is already in flight for this node
  const result = decomposeRichHtml(html)   // U2 — decompose ONCE (decision G)
  if (!result.ok) return   // defensive fail-state — NO commit; the DOM content is preserved (§2.2)
  this.committingRagIds.add(ragId)   // ADR-1 — latch the in-flight commit BEFORE the async settle
  void this.bridge.edit.commitRich(ragId, result.content, result.children)
    .then((r) => {
      // I/L6 — on success clear the dirty flag (which may trigger a queued
      // rebuild). On `deleted-node` ALSO clear it (H5 — the node is gone, the
      // edit is unrecoverable). On `store-error` keep it (the edit is not lost).
      if (r.ok || r.reason === 'deleted-node') {
        this.editController.clearDirty(ragId)
      }
      // ADR-1 — release the latch once the commit settles (the success path).
      this.committingRagIds.delete(ragId)
    })
    .catch((e) => {
      // ADR-4 — a rejected invoke is logged, NEVER an unhandled rejection; the
      // dirty flag STAYS (the edit is not lost — a later blur may retry).
      console.error('[sidebar-panes] rich commit failed', e)
      // ADR-1 — release the latch on a rejected settle too (the node may retry).
      this.committingRagIds.delete(ragId)
    })
}
```

> **minor (adversarial, spec alignment):** the pinned §1.4 form above uses a
> dual `.then`/`.catch` that each release the latch (instead of a `.finally`).
> This is BEHAVIORALLY EQUIVALENT to the pinned `.finally` release — the latch is
> released exactly once on every settle (success or rejection), never before the
> async settle. The spec is aligned to the implemented form (a `.finally` would
> require a `.finally` on the promise chain and is not present).

**Bridge-contract rules (pinned):**

- **minor #6 (adversarial) — the public bridge methods no-op on a null/undefined
  ragId:** each of the 4 bridge methods (`editorInput`/`editorBlur`/
  `editorCompositionStart`/`editorCompositionEnd`) guards `ragId == null` and
  returns — it never throws, never marks a phantom node dirty, never commits an
  id-less blur, and never starts/ends a composition on a phantom node.
  `editorBlur` also defaults a missing `html` to `''` (the same fallback the
  handler body applies when the DOM root is absent).

- **`decomposeRichHtml` is called EXACTLY ONCE per real blur commit** (decision
  G — never in the handler body, never twice). It is imported into the renderer
  from `src/main/rich-decompose.js` (PURE, no Electron — the same cross-main
  import pattern as `buildTraversal` in sidebar-panes.ts line 36).
- **`edit.commitRich` is called EXACTLY ONCE per real blur commit** (via the
  preload bridge, U5 §1.4). The commit is a DIRECT bridge call — it does NOT
  route through `editController.commit` (which is the textarea `setContent` /
  `edit-commit` path, Unit L). The rich path uses the controller ONLY for
  `markDirty`/`isDirty`/`saveCaret`/`clearDirty`/`requestRebuild`; the
  AUTHORITATIVE deleted-node refusal is the `RichCommitResult.reason:'deleted-node'`
  returned by main (U5 §1.3).
- **The decomposed `{content, children}` are passed verbatim** to `commitRich` —
  U4 does NOT split the commit into `setContent`+`setSubtree` (that would be two
  writes; U5's `setRichText` is the atomic pair).
- **No-op blur:** a non-dirty blur saves the rich caret (with `focused: false` —
  H3: only a real edit re-focuses) but sends NO commit and NO IPC.
- **Dirty-edit guard:** the commit success / `deleted-node` clears the dirty flag;
  a `store-error` keeps it (§2.1/§2.2).
- **No-double-commit latch (ADR-1):** `editorBlurCommit` latches the ragId in
  `committingRagIds` before the async settle and releases it in `.finally`; a
  re-entrant call for the same ragId returns early (no second decompose, no
  second commit). A normal blur AND a deferred blur both ride this latch.
- **Rejected commit (ADR-4):** the `commitRich` promise pins a `.catch` that logs
  + KEEPS the dirty flag (mirroring the `operatorSet` `.catch`); a rejection is
  never an unhandled rejection and the edit is retryable.

**`editorCompositionStart(ragId)` / `editorCompositionEnd(ragId)` (pinned —
decision H, the IME composition guard):**
```ts
private editorCompositionStart(ragId: string): void {
  if (this.pendingCommitRagId && this.pendingCommitRagId !== ragId) {
    // a-med #2 — a SUPERSEDING composition: a blur deferred for a DIFFERENT node
    // will never get its compositionend (this composition supersedes it), so run
    // the orphaned deferred commit NOW (its dirty flag clears — the guard is never
    // wedged). Reads the orphan node's CURRENT innerHTML (the same read
    // compositionend would have used).
    const orphan = this.pendingCommitRagId
    this.pendingCommitRagId = null
    const el = document.getElementById('rag-' + orphan) as HTMLElement | null
    const html = el ? el.innerHTML : ''
    this.editorBlurCommit(orphan, html)
  }
  this.composingRagId = ragId   // begin the IME composition window for this node
}

private editorCompositionEnd(ragId: string): void {
  if (this.composingRagId !== ragId) return   // only the composing node's end clears
  this.composingRagId = null
  if (this.pendingCommitRagId === ragId) {
    // A blur was deferred mid-composition; run the deferred commit NOW
    // (the final commit happens on compositionend-then-blur).
    this.pendingCommitRagId = null
    const el = document.getElementById('rag-' + ragId) as HTMLElement | null
    const html = el ? el.innerHTML : ''
    this.editorBlurCommit(ragId, html)
  }
}
```

**Composition-guard contract (pinned — decision H):**

- **`composingRagId` is set on `compositionstart`** (keyed by the ragId of the
  composing node). The IME text lands via `input` events, which mark the node
  dirty (§1.4 `editorInput`); the composition events themselves do NOT mark
  dirty.
- **A blur DURING composition is DEFERRED, not executed** (decision H): the
  caret is captured + saved (the selection survives), `pendingCommitRagId` is set
  to the ragId, and `editorBlurCommit` (decompose + commit) is NOT called. The
  in-DOM composition text is preserved.
- **`compositionend` clears the composition window** AND, if a blur was deferred
  for the SAME ragId (`pendingCommitRagId === ragId`), runs the deferred commit
  ONCE. This is the "final commit on compositionend-then-blur" — the blur that
  fired mid-composition is honored once composition ends. After running, the
  pending flag is cleared (no re-run).
- **Guard keyed by ragId:** `editorCompositionEnd` only clears `composingRagId`
  when it matches the ENDING node's ragId (a spurious/unmatched `compositionend`
  does not clear another node's composition or run another node's pending commit).
  `pendingCommitRagId` is only consumed when it equals the ending node's ragId.
- **No double-commit — the commit-in-flight latch (ADR-1):** a deferred blur
  runs its commit EXACTLY ONCE (on `compositionend`). Because `pendingCommitRagId`
  is cleared SYNCHRONOUSLY in `editorCompositionEnd` while the deferred commit's
  dirty-clear happens in the async `.then`, a later blur arriving before that
  `.then` resolves would otherwise see `dirty` still true + `composingRagId`
  null + `pendingCommitRagId` null and run a SECOND commit. `editorBlurCommit`
  therefore latches the ragId in `committingRagIds` BEFORE the async settle and
  releases it in `.finally`; a re-entrant `editorBlurCommit` for the same ragId
  (from a later blur OR a normal blur) returns early — no second decompose, no
  second `commitRich`. The in-flight commit's settle clears the dirty flag. The
  latch is keyed per ragId (a commit on one node never blocks another node's
  commit).
- **A normal (non-deferred) blur commits EXACTLY ONCE:** a second blur for the
  same dirty ragId whose commit is still in flight is suppressed by the same
  latch (no duplicate commit, no unhandled rejection).
- **A re-derive during composition:** the dirty guard QUEUES it (the node is
  dirty — input events marked it). The composition is never torn down mid-IME by
  a re-derive (the re-derive runs only after the dirty flag clears, which
  happens on the deferred commit's success at `compositionend`).

### 1.5 The host `applyEditingMode` + U3 splice integration (consumed)

U4 consumes the U3 splice (§1.3 handler attachment). The contenteditable root is
a `LegacyNodeData` with `type` in `EDITABLE_TYPES`, `props.contenteditable:
true`, `props['data-rag-node-id']` = the RAG id, the stable authored id
`rag-<ragId>`, and the 4 `rag-editor-*` handlers attached (§1.3). The traversal
stays PURE (still emits the textarea) — the splice + handler attachment is
host-side. In contenteditable mode the `textarea-<ragId>` element is ABSENT for
eligible roots (U3 §2.2 state 5 — the cross-unit gate, amendment 4). The rich
caret path reads `rag-<ragId>` (the root), NEVER the absent textarea.

### 1.6 The rich caret capture/restore machinery (pinned — decisions B/I)

**The selection capture (`captureRichCaret(ragId, which)`, pinned):**
```ts
private captureRichCaret(ragId: string, which: 'anchor' | 'focus'): RichCaretEdge {
  // ADR-13 — guard `window.getSelection` (the dom-shim supplies neither
  // `getSelection` nor `createRange`); its absence NO-OPs into the fallback,
  // never throws (mirrors the Unit L `typeof el.focus === 'function'` guard).
  const sel = typeof window.getSelection === 'function' ? window.getSelection() : null
  const node = which === 'anchor' ? sel?.anchorNode : sel?.focusNode
  const offset = which === 'anchor' ? sel?.anchorOffset : sel?.focusOffset
  const root = document.getElementById('rag-' + ragId) as HTMLElement | null
  if (!sel || !node || !root || !root.contains(node)) {
    return { path: [0], offset: 0 }   // fallback — the start of the root's first text run
  }
  return { path: this.domPathToRoot(root, node), offset: typeof offset === 'number' ? offset : 0 }
}
```
- The selection is read from `window.getSelection()` at blur (§1.4) — BEFORE the
  commit, because the re-derive re-renders and destroys it.
- `domPathToRoot(root, node)` computes the child-index path from `root` down to
  `node` by walking `node.parentNode` up to `root`, collecting the `childNodes`
  index at each level, and reversing (the root's direct text run → `[]` or `[n]`
  per the target). The path targets a TEXT NODE (the caret lives in a text node).
- **Fallback:** when there is no selection, `window.getSelection` is absent
  (dom-shim — ADR-13), the selection node is outside the root, or the root is
  absent → `{ path: [0], offset: 0 }` (the start of the root's first text run —
  a stable, conservative default). NO throw on any of these.

**The path re-resolution (`resolveDomPath(root, path)`, pinned):**
- Walks the `childNodes` child-index steps from `root`; returns the resolved node
  or `null` if any step is out of range.
- **`[]` (empty path)** addresses the root element itself; for caret restore the
  host resolves it to the root's FIRST text node with offset clamped to its
  length (a document-order text run).
- **a-med #3 (adversarial) — an ELEMENT-node edge is CLAMPED to its nearest text
  node** in document order (via `firstTextNode`): a caret whose anchor/focus lands
  on a `strong`/`em`/`a` element boundary (a real-DOM boundary selection) is
  restored instead of silently dropped. An element with NO text-node descendant
  (e.g. an empty `<br>`) still resolves to `null` (dropped — there is no text run
  to place a caret in).

**The restore (`restoreRichCaret(ragId, caret)`, pinned):**
```ts
private restoreRichCaret(ragId: string, caret: Extract<CaretState, { kind: 'rich' }>): void {
  const root = document.getElementById('rag-' + ragId) as HTMLElement | null
  if (!root) return   // no contenteditable root — dropped (stale)
  const anchorNode = this.resolveDomPath(root, caret.anchor.path)
  const focusNode = this.resolveDomPath(root, caret.focus.path)
  if (!anchorNode || !focusNode) return   // path invalid after re-derive — dropped (§2.2)
  // ADR-13 — the dom-shim supplies neither `getSelection` nor `createRange`;
  // their absence NO-OPs the restore (never throws, never an unhandled error).
  if (typeof window.getSelection !== 'function') return
  const sel = window.getSelection()
  if (!sel) return
  if (typeof document.createRange !== 'function') return
  const range = document.createRange()
  const aLen = (anchorNode as Text).data?.length ?? 0
  const fLen = (focusNode as Text).data?.length ?? 0
  range.setStart(anchorNode, Math.min(caret.anchor.offset, aLen))
  range.setEnd(focusNode, Math.min(caret.focus.offset, fLen))
  sel.removeAllRanges()
  sel.addRange(range)
  if (caret.focused && typeof root.focus === 'function') root.focus()
}
```
- The anchor/focus edges are re-resolved against the RE-RENDERED contenteditable
  DOM (the store's re-traversed `children`), offsets CLAMPED to the text node's
  length (a re-derive that truncated a text run does not throw).
- **Path validity after re-derive (§2.2):** if a path no longer resolves (the
  re-derived children changed structure — a child was removed/renamed), the
  restore is a NO-OP (no throw) and the caret is dropped (§1.7 one-shot).

### 1.7 The gated re-derive caret restore (pinned — amendment 4 / U3 F2)

**`src/renderer/sidebar-panes.ts` `reDerive()`.** The EXISTING textarea-only
caret-restore loop (Unit L §5.4; the pre-U4 loop lived at the old lines
571-589) is REPLACED by a kind-GATED loop (now the `reDerive` restore loop at
lines 659-699). The controller's `restoreCaret` returns the discriminated state; the host
applies the caret to the node's RENDERED control (rich caret → contenteditable
root, textarea caret → textarea), gated so a caret is NEVER applied to a control
of the wrong kind:

```ts
for (const ragId of [...this.caretNodes]) {
  const caret = this.editController.restoreCaret(ragId)
  if (caret === undefined) {
    this.caretNodes.delete(ragId)   // dangling backRef — stale caret cleared (L5)
    continue
  }
  this.caretNodes.delete(ragId)     // ONE-SHOT (H2) — even a successful/mismatched restore
  if (caret.kind === 'rich') {
    // Gate — ONLY restore a rich caret into a REAL contenteditable root. The
    // `rag-<ragId>` element is authored by the traversal UNCONDITIONALLY (it
    // exists in BOTH modes), so ELEMENT PRESENCE is NOT a valid gate (U3 F2 —
    // a rich caret would be applied to a non-contenteditable block after a
    // contenteditable→textarea toggle). The real indicator is `this.editingMode
    // === 'contenteditable'` AND the rendered root carrying the `contenteditable`
    // attribute that `applyEditingMode` authors ONLY for eligible roots in
    // contenteditable mode.
    const root = document.getElementById('rag-' + ragId) as HTMLElement | null
    const rootIsContenteditable =
      this.editingMode === 'contenteditable' &&
      !!root &&
      (root.isContentEditable === true || root.getAttribute?.('contenteditable') === 'true')
    if (rootIsContenteditable) {
      this.restoreRichCaret(ragId, caret)
    }
    // else: editingMode is 'textarea', the node is ineligible, or the rendered
    // root is not contenteditable (a contenteditable→textarea toggle) — the rich
    // caret is DROPPED, never applied to a textarea/non-contenteditable node
    // (amendment 4 / U3 F2 / ADR-8).
  } else {
    // Gate — ONLY restore a textarea caret into a `textarea-<ragId>` element.
    const el = document.getElementById('textarea-' + ragId) as HTMLTextAreaElement | null
    if (el) {
      el.selectionStart = caret.offset
      el.selectionEnd = caret.offset
      if (caret.focused && typeof el.focus === 'function') el.focus()
    }
    // else: the node now renders contenteditable — the textarea caret is
    // DROPPED, never applied to a contenteditable node (amendment 4 / U3 F2).
  }
}
```

**Restore-loop rules (pinned):**

- **Restore runs AFTER the SINGLE final graph load** (in `reDerive`, after
  `refresh()`'s one `loadAppGraph`, against the FINAL render), for each node in
  `caretNodes` (Unit L §5.4 M6). **CRITICAL #1 (adversarial):** `reDerive` does
  NOT call `loadAppGraph` itself — it stashes the fresh traversal envelope into
  `lastTraversalEnvelope` and lets `refresh()` perform the ONE `loadAppGraph`
  (which re-assembles + re-loads → `tearDownGraph` + `resetRenderState` + a full
  fresh `render()`), then the restore loop runs AFTER that single final render so
  the selection survives. The prior shape called `loadAppGraph` in `reDerive`
  AND again in `refresh()` — the second load destroyed the restore selection in a
  real browser (a real-render bug the dom-shim's persistent `getElementById` +
  restore-CALLED-only assertions masked).
- **Mode gating (amendment 4 / U3 F2 / ADR-8):** the node's RENDERED control
  decides the valid kind, and the gate is on a REAL rendered indicator, never on
  `rag-<ragId>` element presence (that element is authored by the traversal in
  BOTH modes). A `kind:'rich'` caret is applied ONLY when `this.editingMode ===
  'contenteditable'` AND the rendered `rag-<ragId>` root carries the
  `contenteditable` attribute (`root.isContentEditable === true` OR
  `root.getAttribute('contenteditable') === 'true'`) — the attribute that
  `applyEditingMode` authors ONLY for eligible roots in contenteditable mode, so
  it is the authoritative "this node renders contenteditable RIGHT NOW" signal.
  A `kind:'textarea'` caret is applied ONLY if a `textarea-<ragId>` element
  exists (that element IS genuinely absent in contenteditable mode — the splice
  removes it — so its presence is a valid gate). A MISMATCH (the node changed
  control type between save and re-derive, e.g. a contenteditable→textarea
  toggle) is a DROPPED caret — never applied to the wrong control. This closes
  U3 finding F2 (the Unit L loop deleted `caretNodes` entries for nodes whose
  textarea was absent, discarding rich carets without restoring them).
- **ONE-SHOT restore (H2):** the node is removed from `caretNodes` after a
  SUCCESSFUL restore AND after a dropped/mismatched restore (only the re-derive
  immediately following the edit re-focuses — not every subsequent re-derive).
- **Dangling backRef:** `restoreCaret` returns `undefined` (the stale caret was
  cleared — Unit D §5.3 L5) → the host removes the node, no restore (A4).
- **No throw (ADR-13):** a missing element, an invalid path, a missing
  `window.getSelection`/`document.createRange` (dom-shim — it supplies neither),
  or a missing `focus` all NO-OP — never throw and never leave an unhandled
  rejection. The `typeof ... === 'function'` guards on `window.getSelection`
  (§1.6 capture + restore), `document.createRange` (§1.6 restore), and `focus`
  mirror the Unit L `typeof el.focus === 'function'` guard.
- **First-materialization restore (decision I):** `document.getElementById('rag-'
  + ragId)` resolves the FIRST `rag-<ragId>` element in the DOM. For a
  multi-parent duplicate, the rich caret is restored into the first
  materialization only (consistent with the first-materialization commit
  limitation, §1.4/§2.2).

### 1.8 Cross-unit contract (what U4 consumes; what it owns)

- **U4 consumes U5's `edit.commitRich`** (the `IPC_EDIT_RICH_COMMIT` →
  `setRichText` atomic op). U4 does NOT decompose twice and does NOT split the
  commit. U5 commits whatever `{content, children}` U4 hands it (U5 has no
  HTML/materialization knowledge).
- **U4 consumes U2's `decomposeRichHtml`** (PURE; imported into the renderer).
- **U4 consumes U3's `applyEditingMode`** (extends it with the 4 handler defs,
  §1.3) + `isRichEditableRoot`.
- **U4 consumes U1's `editingMode`** (the host field the splice/restore gates
  derive from) + the broadcast → re-derive path.
- **U4 OWNS the dirty-edit guard + caret (decision I):** keyed by ragId, in the
  host + controller. The `IPC_EDIT_RICH_COMMIT` handler (U5) does not manage a
  dirty guard or caret.
- **U4 owns the first-materialization limitation (decision I / amendment 6):**
  the blur reads the FIRST `rag-<ragId>` element's innerHTML (or a
  dispatch-provided html); a multi-parent node's OTHER duplicate materializations
  are NOT committed on this blur. Documented (§2.2). U5 has no materialization
  knowledge.

---

## 2. Every state + fail-state (TestWriter red set)

### 2.1 Happy-path states (TestWriter red set — valid paths)

**The discriminated `CaretState` + `RichCaretEdge` (edit-controller.ts,
node-testable):**
1. **Typecheck — `CaretState` is the discriminated union** `{ kind:'textarea';
   offset; focused }` | `{ kind:'rich'; ragId; anchor; focus; focused }`.
2. **`RichCaretEdge` shape:** `{ path: number[]; offset: number }`.
3. **`saveCaret`/`restoreCaret` store + return a textarea caret:** `saveCaret(id,
   { kind:'textarea', offset: 3, focused: true })` → `restoreCaret(id)` returns
   the SAME object (deep-equal, incl. `kind`).
4. **`saveCaret`/`restoreCaret` store + return a rich caret:** `saveCaret(id,
   { kind:'rich', ragId:'n1', anchor:{path:[1,0],offset:2}, focus:{path:[1,0],
   offset:4}, focused:true })` → `restoreCaret(id)` returns the SAME object.
5. **`restoreCaret` for a dangling backRef returns `undefined` + clears** (Unit D
   L5 — the stale caret is not restored; a later re-created node does not restore
   a stale caret).
6. **`restoreCaret` for a node with no saved caret returns `undefined`.**
7. **`clearCaret` removes a saved caret of either kind.**

**The handler defs (sidebar-panes.ts, harness — body read-back + registration):**
8. **4 defs registered:** `rag-editor-input`, `rag-editor-blur`,
   `rag-editor-compositionstart`, `rag-editor-compositionend` (each via
   `registerHandlerDef`, compileHandlerBody-compatible full function-expression
   bodies).
9. **`rag-editor-input` resolves the ragId from `data-rag-node-id` + calls
   `sidebar.editorInput(ragId)`.**
10. **`rag-editor-blur` with a dispatch-provided `html` arg (MCP path)** → calls
    `sidebar.editorBlur(ragId, html)` with that html (the DOM is NOT read).
11. **`rag-editor-blur` WITHOUT an `html` arg (UI path)** → reads
    `document.getElementById('rag-' + ragId).innerHTML` and calls
    `sidebar.editorBlur(ragId, html)`.
12. **`rag-editor-compositionstart`** → calls `sidebar.editorCompositionStart(ragId)`.
13. **`rag-editor-compositionend`** → calls `sidebar.editorCompositionEnd(ragId)`.

**`applyEditingMode` handler attachment (harness, contenteditable mode):**
14. **An eligible root gains EXACTLY the 4 `rag-editor-*` handlers** (name-referenced
    `{ name, event }` on `input`/`blur`/`compositionstart`/`compositionend`) +
    `contenteditable: true` + the textarea removed (U3 splice preserved).
15. **An ineligible root keeps its textarea + textarea handlers** (NO
    `rag-editor-*` handlers attached).
16. **`editingMode === 'textarea'` → no handler attachment, no splice** (no-op).

**The rich edit path — input marks dirty:**
17. **`editorInput(ragId)` → `editController.markDirty(ragId)`** → `isDirty(ragId)`
    is true.
18. **A dirty contenteditable + a `rag-store-changed` / mode-toggle re-derive →
    QUEUED** (the dirty-edit guard, Unit D §5.2 — `hasQueuedRebuild()` true,
    `onRebuild` not called).

**The rich blur — caret save + decompose ONCE + commit ONCE:**
19. **No-op blur (not dirty):** a non-dirty blur captures + saves the rich caret
    (`{ kind:'rich', ragId, anchor, focus, focused:false }` — H3: only a real
    edit re-focuses), adds the node to `caretNodes`, and sends NO commit / NO IPC.
20. **Real blur (dirty, not composing):** captures + saves the rich caret
    (`focused:true`), calls `decomposeRichHtml(html)` EXACTLY ONCE, and on `ok`
    calls `bridge.edit.commitRich(ragId, content, children)` EXACTLY ONCE with
    the decomposed `{content, children}`.
21. **Commit success → dirty cleared:** a `{ ok: true, nodeId, node }`
    `RichCommitResult` → `editController.clearDirty(ragId)` (which may trigger a
    queued rebuild).
22. **Commit `deleted-node` → dirty cleared** (H5 — the node is gone, the edit is
    unrecoverable, the guard must not permanently block re-derives).
23. **Decompose-ONCE + commit-ONCE are spied:** the harness asserts
    `decomposeRichHtml` is called once and `bridge.edit.commitRich` once per real
    blur (no double-decompose, no split `setContent`+`setSubtree`).

**The composition guard:**
24. **`compositionstart` sets `composingRagId`.** A subsequent dirty blur (mid-
    composition) captures + saves the rich caret, sets `pendingCommitRagId`, and
    does NOT commit (no `decomposeRichHtml`, no `commitRich`).
25. **`compositionend` for the composing node clears `composingRagId` and runs the
    deferred commit ONCE** (decompose ONCE + `commitRich` ONCE with the CURRENT
    `rag-<ragId>.innerHTML`), then clears `pendingCommitRagId`. The final commit
    happens on compositionend-then-blur.
26. **`compositionend` for a node NOT composing / not pending** → clears nothing,
    runs nothing (the ragId-keyed guard).
27. **A deferred blur does NOT re-commit on a later blur — the commit-in-flight
    latch (ADR-1):** the deferred commit on `compositionend` latches the ragId in
    `committingRagIds` until it settles. A later blur that arrives BEFORE that
    settle (dirty still true + composing null + pending cleared) re-enters
    `editorBlurCommit` → the latch returns early → NO second `decomposeRichHtml`,
    NO second `commitRich`. A normal blur after the deferred commit settles
    commits once (the latch is released in `.finally`). The harness asserts a
    deferred blur followed by a racing blur fires `commitRich` EXACTLY ONCE.
28. **A re-derive during composition is QUEUED** (the node is dirty) — the
    composition is not torn down mid-IME.

**The gated re-derive caret restore:**
29. **Rich caret restored into a contenteditable root:** a saved `kind:'rich'`
    caret + a re-derive re-renders the contenteditable with `editingMode ===
    'contenteditable'` and the rendered `rag-<ragId>` root carrying the
    `contenteditable` attribute → the gate passes, the host re-resolves the
    anchor/focus `path`+`offset` against the re-rendered DOM, re-applies the
    Range, and (when `focused:true`) focuses the root.
30. **Textarea caret restored into a textarea:** a saved `kind:'textarea'` caret +
    a re-derive → `selectionStart`/`selectionEnd` set to `offset` (+ focus when
    `focused:true`).
31. **Rich caret into a node after a contenteditable→textarea toggle → DROPPED**
    (amendment 4 / ADR-8): the `rag-<ragId>` element STILL EXISTS (authored by the
    traversal in both modes), so the gate CANNOT be element presence. The rich
    gate FAILS because `this.editingMode === 'textarea'` (and/or the rendered
    `rag-<ragId>` root no longer carries the `contenteditable` attribute — the
    splice no-ops in textarea mode) → `restoreRichCaret` is NOT called and the
    rich caret is DROPPED; the node is removed from `caretNodes` (one-shot). A
    textarea caret is never applied to a contenteditable node and vice versa. A
    regression assertion that after a contenteditable→textarea toggle the saved
    rich caret is NOT applied to the (now textarea) control.
32. **Textarea caret into a node that now renders contenteditable → DROPPED**
    (the `textarea-<ragId>` element is absent → no restore; one-shot).
33. **ONE-SHOT restore (H2):** after a successful restore OR a dropped/mismatched
    restore, the node is removed from `caretNodes` — only the re-derive
    immediately following the edit re-focuses.
34. **Dangling backRef → caret cleared, no restore** (`restoreCaret` undefined —
    L5/A4).
35. **Offset clamping on restore:** a saved `offset` beyond the re-rendered text
    node's length is CLAMPED (never throws, never out-of-range).
36. **First-materialization restore (decision I):** for a multi-parent duplicate,
    the rich caret is restored into the FIRST `rag-<ragId>` in document order.

**The full end-to-end edit path:**
37. **Type → input (dirty) → blur → decompose ONCE → commitRich ONCE → broadcast →
    re-derive → re-render → rich-caret restore:** the store's re-traversed
    `children` re-materialize the contenteditable; the saved rich caret is
    restored into the re-rendered root (the round-trip: the user's selection
    survives the re-derive).

### 2.2 Fail-states (TestWriter red set — documented fail-states)

1. **Decompose error → NO commit (data-preservation):** `decomposeRichHtml(html)`
   returns `{ ok: false, error }` (only reachable defensively — it is TOTAL for
   any string, U2 §1.2, so a non-string `html` is the sole trigger) → the host
   does NOT call `commitRich`; the in-DOM content is PRESERVED (the
   contenteditable still shows the user's text — no store write, no data loss).
   The dirty flag is NOT cleared (the edit is not lost; a later blur may retry).
2. **Commit `store-error` → dirty STAYS:** a `{ ok: false, reason: 'store-error' }`
   `RichCommitResult` → the dirty flag is NOT cleared (the edit is not lost; the
   guard keeps queuing re-derives until a retry succeeds or the node is deleted).
3. **Commit `deleted-node` → dirty cleared** (H5 — unrecoverable), the node is
   dropped from `caretNodes` on the next restore pass, no IPC re-send.
4. **A mid-composition blur commits NOTHING** (deferred — §2.1 state 24); the
   commit is suppressed until `compositionend`.
5. **An unmatched/spurious `compositionend`** (the ragId does not match
   `composingRagId`) clears nothing and runs nothing (the keyed guard — no
   cross-node commit).
6. **Path invalid after re-derive → no restore, dropped:** a saved `RichCaretEdge`
   whose `path` does not resolve against the re-rendered DOM (a child was
   removed/renamed by the re-derive) → `resolveDomPath` returns `null` →
   `restoreRichCaret` NO-OPs (no throw) and the caret is dropped (one-shot).
7. **Kind mismatch → caret dropped, never misapplied** (amendment 4 / U3 F2 /
   ADR-8): a `kind:'rich'` caret when the node now renders a textarea (the rich
   gate fails — `editingMode` is not 'contenteditable' OR the rendered
   `rag-<ragId>` root lacks the `contenteditable` attribute), and a
   `kind:'textarea'` caret when only a contenteditable renders (the
   `textarea-<ragId>` element is absent), are both DROPPED (never applied to the
   wrong control). A regression assertion for both directions.
8. **A malformed handler body → STORED, throw at compile:** a `bindHandlers` def
   with a non-string body is stored (no throw at registration — Unit K §5.3 M4);
   the throw surfaces at COMPILE via the app Runtime's `loadEnvelope` path (a
   caller error).
9. **No-op blur sends no IPC:** a non-dirty blur → `commitRich` NOT called, no
   `IPC_EDIT_RICH_COMMIT` sent (§2.1 state 19 — the no-op blur must not re-derive).
10. **The first-materialization limitation (decision I / amendment 6):** a
    multi-parent eligible RAG node materialized N times → the blur reads the FIRST
    `rag-<ragId>.innerHTML` (or a dispatch html) and commits the FIRST
    materialization's `{content, children}` ONLY; the OTHER N-1 duplicates are
    NOT committed on this blur (documented limitation — a regression assertion
    that EXACTLY ONE `commitRich` fires with the first materialization's content).
11. **A re-derive that destroys an in-progress edit (dirty guard):** a re-derive
    running while the contenteditable is dirty (bypassing the guard) would
    re-materialize the contenteditable from the store, destroying uncommitted
    content. The dirty guard MUST queue the re-derive (§2.1 state 18).
12. **The `textarea-<ragId>` element is absent in contenteditable mode (amendment
    4):** for an eligible root in contenteditable mode, NO `textarea-<ragId>` DOM
    element exists; the rich caret path reads `rag-<ragId>`, NEVER the absent
    textarea. A regression assertion (with U3 §2.2 state 5).
13. **A rich caret is never captured from / restored into the textarea:** the
    capture reads `window.getSelection()` against `rag-<ragId>`, never a textarea
    `selectionStart`; the restore re-resolves against `rag-<ragId>` only.
14. **Malformed `html` totality:** any string `html` (garbage, unclosed tags, huge)
    → `decomposeRichHtml` returns `{ ok: true, content, children }` (U2 totality,
    §2.1 state 33/34) → the commit proceeds with the decomposed (possibly empty)
    `{content, children}` — never throws.
15. **No `rag-<ragId>` root on blur (dangling/DOM-absent):** the handler falls back
    to `html = ''` → `decomposeRichHtml('')` → `{ ok:true, content:'', children:[] }`
    → `commitRich(ragId, '', [])`. If the node was deleted, main returns
    `deleted-node` → dirty cleared (H5). No throw, no unhandled rejection.
16. **A rejected `commitRich` promise (bridge/Electron failure):** the promise
    rejection is the async main-handler rejection (U5 §2.2 state 13 — a `putNode`
    throw rejects the invoke). `editorBlurCommit` pins a `.catch` (ADR-4) that
    LOGS the error and KEEPS the dirty flag set — mirroring the `operatorSet`
    `.catch` (sidebar-panes.ts:1048) — so the host NEVER leaves an unhandled
    rejection and a rejected invoke is retryable. The `.then` clears dirty only
    on `ok`/`deleted-node`; a rejected promise leaves dirty set (the edit is not
    lost). The commit-in-flight latch is released in `.finally` (the node may
    retry). A regression assertion that a rejected `commitRich` is caught (no
    unhandled rejection), never clears dirty, and releases the latch.
17. **The dom-shim supplies neither `window.getSelection` nor
    `document.createRange` (ADR-13) — capture/restore NO-OP, never throw:** in
    the dom-shim harness, `captureRichCaret` sees `typeof window.getSelection !==
    'function'` → returns the `{ path:[0], offset:0 }` fallback (no throw);
    `restoreRichCaret` returns before `document.createRange` (no throw). A blur +
    re-derive round-trip under the dom-shim completes without throwing and
    without an unhandled rejection. A regression assertion that the harness blur
    tests (which lack `getSelection`/`createRange`) never throw.

---

## 3. Numeric / census claims

- **New handler defs:** **4** — `rag-editor-input`, `rag-editor-blur`,
  `rag-editor-compositionstart`, `rag-editor-compositionend` (app-graph scope,
  MCP-visible — the contenteditable is dispatchable, Unit L §5.6 pattern).
- **New bridge/host methods:** **4** — `editorInput`, `editorBlur`,
  `editorCompositionStart`, `editorCompositionEnd` (extend the
  `window.provident.sidebar` surface. Current surface = **8** methods —
  `selectDocument`/`submitQuery`/`templateAdd`/`templateRemove`/`templateReset`/
  `operatorSet`/`textareaInput`/`textareaBlur`; U4 adds **4** → **12** total.
  The editing-related subset (textarea 2 + operator 1 + rich 4) is **7**).
- **New host fields:** **3** — `composingRagId`, `pendingCommitRagId` (the IME
  composition guard, decision H) + `committingRagIds` (the per-ragId
  commit-in-flight latch, ADR-1).
- **New types:** **2** — `RichCaretEdge` (1) + the DISCRIMINATED `CaretState`
  (1, supersedes the Unit L `CaretState = { offset; focused }` shape).
- **`CaretState` kinds:** **2** — `'textarea'`, `'rich'`.
- **`RichCaretEdge` fields:** **2** — `path: number[]`, `offset: number`.
- **Handler defs attached per eligible root (contenteditable mode):** **4**
  (`input`/`blur`/`compositionstart`/`compositionend`). Per ineligible root: **0**
  (keeps its textarea handlers). Overall in textarea mode: **0**.
- **`decomposeRichHtml` calls per real blur commit:** **1** (decision G — never
  in the handler body, never twice). Per no-op/deferred blur: **0**.
- **`edit.commitRich` calls per real blur commit:** **1** (decision A/G). Per
  no-op/deferred blur: **0**.
- **`IPC_EDIT_RICH_COMMIT` sends per real blur commit:** **1** (U5). Per
  no-op/deferred blur: **0**.
- **Edit-op census:** **10** — UNCHANGED (U4 adds no op; it consumes U5's
  `setRichText`, already counted in U5 §3).
- **IPC channels:** UNCHANGED (U4 adds none; it consumes `IPC_EDIT_RICH_COMMIT`).
- **Preload bridge methods (`edit`):** **4** — UNCHANGED (U5 landed
  `commitRich`; U4 consumes it, adds nothing).
- **Composition-guard states:** **3** (`composingRagId`, `pendingCommitRagId`,
  `committingRagIds`); deferred commits run EXACTLY **1** per deferred blur (on
  `compositionend`), enforced by the commit-in-flight latch (ADR-1).
- **`CaretState` restore gating directions:** **2** — rich→contenteditable,
  textarea→textarea; both MISMATCH directions dropped (§2.2 state 7).
- **First-materialization limitation:** a multi-parent duplicate commits **1**
  (the first) `{content, children}`; the other N-1 are NOT committed on this blur.
- **The rich caret:** **1** capture (`window.getSelection()` anchor+focus) per
  blur + **1** one-shot restore per re-derive; **0** restores on a mismatched/
  invalid-path/dangling case.

---

## 4. Cross-references + section numbers

- **Proposal review:** `docs/specs/editing-mode-toggle-review.md` §4-B (the
  discriminated `CaretState` = `{kind:'textarea'}` | `{kind:'rich'; ragId;
  anchor; focus; focused}` with path-based `RichCaretEdge`; restored after
  re-derive), §4-G (rich handler defs `rag-editor-input`/`blur`/
  `compositionstart`/`compositionend` + bridge methods; decomposition ONCE in
  host `editorBlur` (never the handler body); blur prefers dispatch-provided html
  (MCP) else `getElementById('rag-'+ragId).innerHTML` (UI)), §4-H (composition
  guard keyed by ragId — `composingRagId` + `pendingCommitRagId`), §4-I (dirty +
  caret keyed by ragId; commit once; the documented first-materialization
  innerHTML-read limitation), §3 amendment 4 (the cross-unit textarea gate — the
  `textarea-<ragId>` element is ABSENT in contenteditable mode, so the textarea
  caret-restore + dirty-edit are gated for rich), §3 amendment 6 (first-
  materialization limitation — documented + adversarial regression), §5 (the U4
  row: `src/renderer/edit-controller.ts`, `src/renderer/sidebar-panes.ts`,
  `src/main/preload.ts` — preload consumes, not changes).
- **Unit U2:** `docs/specs/unit-u2-rich-decompose.md` §1.2 (`decomposeRichHtml` —
  ALWAYS `{ ok: true, content, children }` with `children` a valid
  `RagNodeChild[]`, possibly `[]`; the ONLY fail-state is a non-string input),
  §3 (the round-trip invariant — the decompose U4's `editorBlur` calls ONCE),
  §2.1 states 33/34 (totality — a malformed `html` never throws).
- **Unit U5:** `docs/specs/unit-u5-set-rich-text.md` §1.3 (`IPC_EDIT_RICH_COMMIT`
  + `RichCommitResult` — the `ok`/`deleted-node`/`store-error` result U4's
  `editorBlur` handles), §1.4 (preload `edit.commitRich` — the bridge U4 calls
  ONCE), §1.6 (the cross-unit contract: U4 decomposes ONCE + commits ONCE; the
  dirty guard + caret keyed by ragId live in U4, NOT U5), §2.2 state 13 (a
  `putNode` throw rejects the invoke — U4's rejected-commit fail-state),
  §5 ADR-10 (the no-op rich blur must not re-derive).
- **Unit U3:** `docs/specs/unit-u3-rich-eligibility-splice.md` §1.2
  (`isRichEditableRoot` — the eligibility U4's splice + restore gate on), §1.3
  (`applyEditingMode` — the splice U4 extends with the 4 handler defs), §2.2
  state 5 (the cross-unit textarea gate — `textarea-<ragId>` absent for eligible
  roots), §5-F2 (the caret over-delete finding U4 closes via the gated restore +
  discriminated `CaretState`).
- **Unit U1:** `docs/specs/unit-u1-editing-mode-setting.md` §1.3 (the
  `operator-settings-changed` broadcast → `requestRebuild` → re-derive path the
  rich edit's commit broadcast rides), §1.4 (the button-toggle control the mode
  derives from), §2.2 state 10 (the cross-unit textarea gate after a mode-change
  re-derive).
- **Unit L:** `docs/specs/unit-l-textarea-editing-ui.md` §5.2 (the textarea
  handler defs + bridge methods U4's rich defs mirror — the M2 bridge pattern),
  §5.4 (the textarea caret save/restore — the `CaretState` shape U4 SUPERSEDES
  with the discriminated union; the restore loop U4 REPLACES with the gated
  loop), §5.8 state 12 (the name-referenced handler resolution the `rag-editor-*`
  defs ride).
- **Unit D:** `docs/specs/unit-d-editing.md` §5.2 (the dirty-edit guard the rich
  input/blur ride), §5.3 (`saveCaret`/`restoreCaret`/`clearCaret` — the
  controller methods U4's both-kinds type flows through; L5 dangling-backRef
  clear), §5.4 M8/M9 (`isEditable` best-effort; the authoritative deleted-node
  refusal — for the rich path, the U5 `deleted-node` result).
- **Store / node model:** `src/main/rag-store.ts` — `RagNodeChild` /
  `RagNodeChildType` (lines 45-58), `RagNode.children` (line 71) — the decomposed
  model U4 commits; `validateNodeShape`/`isValidChildren` (the write-time
  validation the committed `children` passes via U5's `setRichText`).
- **Edit controller:** `src/renderer/edit-controller.ts` — the former
  textarea-only `CaretState` SUPERSEDED by the discriminated union (now the
  pinned `CaretState` type, lines 45-47; §1.2); `saveCaret`/`restoreCaret`
  (lines 154-166); `markDirty`/`clearDirty` (lines 87-98) / `requestRebuild`
  (lines 143-150, the dirty-edit guard); `isEditable` (lines 105-115).
- **Host:** `src/renderer/sidebar-panes.ts` — `installSidebarBridge` (~944-977,
  the bridge surface extended with 4 methods), `bindHandlers` (~404-434, the 4
  rich defs registered), `applyEditingMode` (~884-930, the U3 splice U4 extends
  with the handler attachment), `reDerive` (~614-707, the caret-restore loop U4
  replaces with the gated loop), `loadAppGraph` (~461-494, the splice +
  recompute path), `textareaBlur` (~1064-1082, the `CaretState` shape superseded
  to `kind:'textarea'`), `decomposeRichHtml` import (line 50, from
  `src/main/rich-decompose.js`, the same cross-main pattern as `buildTraversal`
  line 36).
- **Preload (consumed, NOT changed by U4):** `src/main/preload.ts` — `edit.commitRich`
  (lines 210-213), the `edit` bridge (lines 197-223).
- **Decisions:** `docs/decisions.md` — RICH-TEXT-EDITING-GATE (the rich-text
  machinery context), RAG-AUTHORITATIVE (the decomposed `content`+`children` are
  what the rich edit writes), SINGLE-WRITER-STORE (the rich commit via U5's
  `setRichText` — a single atomic write), SUBTREE-OWNERSHIP (the back-reference
  carrier the `rag-<ragId>` root binds through), UI-MOUNT-RE-DERIVE (the re-derive
  path the rich caret restore rides), MCP-UI-EQUIVALENCE (the contenteditable is
  MCP-visible + dispatchable; the rich commit is UI-IPC-only per amendment 7).
- **Page-design note (repo divergence):** the task instruction references
  `docs/skills/designing-pages.md` + a test-use-case coverage matrix + demo-page
  index. This repo has NO `docs/skills/designing-pages.md` (only
  `docs/skills/process-guardrails.md` exists in `docs/skills/`). Per the unit-t
  convention (`docs/specs/unit-t-markdown-import.md` line 883-884 — "no
  `docs/skills/designing-pages.md` update ... is warranted"), and because the
  doc does not exist here, NO such page-design skill update is made in this
  pass. The contenteditable's page-design impact (MCP-visibility, provident
  authoring, the rich caret UX) is documented in THIS spec (§1.3/§1.6/§3).

---

## 5. Adversarial must-hunt list + integration note

**Integration note:** U4 is the DOM-coupled, least node-testable unit in the
slice. The discriminated `CaretState` + `RichCaretEdge` + the controller's
both-kinds `saveCaret`/`restoreCaret` are fully node-testable (no Electron, no
DOM). The DOM-coupled host wiring (the selection capture, the `getElementById`
reads, the innerHTML blur read, the rich caret restore, the composition guard
against real IME sequencing) rides the SidebarPanes host integration harness
with the dom-shim; the browser-only pieces (real `window.getSelection()`,
`document.createRange`, `Range`/`Selection`, real IME events) are documented in a
`.skip` block (verified by code review / the e2e battery — mirroring Unit L
§5.8 items 13-16). The PURE seam `decomposeRichHtml` is U2's; U4's decompose-ONCE
+ commitRich-ONCE are asserted via harness spies.

**Adversarial must-hunt list (the post-green adversarial reviewer MUST verify
these; the TestWriter writes the regression tests NOW from this list):**

- **ADR-1 — the composition/blur race + the no-double-commit latch:** a blur
  firing DURING IME composition must be deferred (`pendingCommitRagId`), NOT
  committed; the commit runs ONCE on `compositionend`-then-blur; a spurious
  `compositionend` for a non-composing node, or for a different ragId, must not
  run another node's pending commit. Because `pendingCommitRagId` is cleared
  SYNCHRONOUSLY in `editorCompositionEnd` while the deferred commit's dirty-clear
  happens in the async `.then`, a later blur before that `.then` resolves would
  see dirty still true + composing null + pending null and run a SECOND commit.
  `editorBlurCommit` pins a per-ragId commit-in-flight latch (`committingRagIds`,
  set before the async settle, released in `.finally`); a re-entrant call for the
  same ragId returns early — NO second decompose, NO second `commitRich`, no
  unhandled rejection. The caret (selection) must be captured at the deferred
  BLUR (not at compositionend) so it survives (§2.1 states 24-27, §2.2 states
  4/5).
- **ADR-2 — IME composition across a re-derive:** a re-derive during composition
  (the node is dirty) must be QUEUED, never tearing the IME down mid-composition;
  the deferred commit fires after `compositionend`, clears the dirty flag, and
  THEN the queued re-derive runs (§2.1 state 28). A re-derive that re-materializes
  the contenteditable mid-IME is a defect.
- **ADR-3 — multi-parent duplicate (first-materialization commit):** a
  multi-parent eligible node's blur reads the FIRST `rag-<ragId>.innerHTML` and
  commits it ONCE; the OTHER duplicates are NOT committed on this blur (decision
  I / amendment 6). Hunt for a union-of-duplicates or a last-materialization
  read; exactly ONE `commitRich` with the first materialization's content
  (§2.2 state 10).
- **ADR-4 — commit failure (dirty stays or is cleared?):** a `store-error`
  leaves the dirty flag set (edit not lost — the guard keeps queuing); a
  `deleted-node` clears it (unrecoverable — H5); a REJECTED `commitRich` (a
  `putNode` throw, U5 §2.2 state 13) is CAUGHT by `editorBlurCommit`'s `.catch`
  (mirroring the `operatorSet` `.catch` at sidebar-panes.ts:1048) — it LOGS, KEEPS
  the dirty flag set, and releases the commit-in-flight latch, so the host never
  leaves an unhandled rejection and the node may retry on a later blur
  (§2.2 states 2/3/16).
- **ADR-5 — decompose error on blur (data loss?):** a `{ ok:false }`
  `decomposeRichHtml` → NO commit; the in-DOM content is PRESERVED (no store
  write, no data loss); the dirty flag is NOT cleared (the edit is retryable).
  Since U2 is TOTAL for any string, this is defensive-only (non-string `html`);
  a valid string never triggers it (§2.2 state 1).
- **ADR-6 — the caret path/offset into a re-rendered subtree (path validity):**
  a saved `RichCaretEdge.path` that does not resolve against the RE-RENDERED
  DOM (children removed/renamed by the re-derive) → `resolveDomPath` returns
  null → NO restore (no throw) and the caret is DROPPED (one-shot); offsets are
  CLAMPED to the text node length. Hunt for a restore that throws, applies the
  caret to a stale/wrong node, or re-focuses after an invalid path (§2.1 state
  35, §2.2 state 6).
- **ADR-7 — the mode toggle mid-edit:** a mode toggle (contenteditable→textarea)
  while a contenteditable is dirty → the re-derive is QUEUED (dirty guard), runs
  after the blur commits; a dirty rich node that toggles before committing must
  still commit (or, if the toggle re-derive is queued, commit first). A toggle
  that destroys an uncommitted rich edit is a defect (§2.1 state 18, §2.2 state
  11).
- **ADR-8 — textarea-vs-rich caret restore gating (amendment 4 / U3 F2):** a
  `kind:'textarea'` caret is NEVER applied to a contenteditable node; a
  `kind:'rich'` caret is NEVER applied to a textarea node; a mismatch is DROPPED
  (one-shot), closing U3 F2. The rich gate must NOT be `rag-<ragId>` element
  PRESENCE — that element is authored by the traversal in BOTH modes, so a
  saved rich caret would be applied to a non-contenteditable block after a
  contenteditable→textarea toggle. The gate is a REAL contenteditable indicator:
  `this.editingMode === 'contenteditable'` AND the rendered root's
  `contenteditable` attribute (`root.isContentEditable === true` OR
  `root.getAttribute('contenteditable') === 'true'`). The textarea gate (on
  `textarea-<ragId>` presence) is correct because that element IS genuinely
  absent in contenteditable mode. Hunt for any code path that gates the rich
  restore on `rag-<ragId>` presence alone, reads `caret.offset` without branching
  on `kind`, or applies a rich caret via the textarea path (§2.1 states 29/31/32,
  §2.2 state 7).
- **ADR-9 — malformed-input totality:** any string `html` (garbage, unclosed
  tags, huge, control chars) → `decomposeRichHtml` returns `{ ok:true, content,
  children }` (U2 totality) → the commit proceeds with the decomposed result,
  never throws (§2.2 state 14). A malformed handler body → stored at
  registration, throw at compile (§2.2 state 8).
- **ADR-10 — no redundant re-derive on a no-op rich blur:** a non-dirty blur
  saves the caret but sends NO commit/NO IPC/NO broadcast → no re-derive. Hunt
  for a blur-without-edit that triggers a full re-derive (§2.1 state 19, §2.2
  state 9, U5 ADR-10).
- **ADR-11 — rich caret capture reads the root, never the absent textarea:** in
  contenteditable mode the `textarea-<ragId>` element does not exist (amendment
  4); the capture/restore reads `rag-<ragId>` + `window.getSelection()`, never a
  textarea `selectionStart`. A rich caret captured from / restored into a textarea
  is a defect (§2.2 states 12/13).
- **ADR-12 — the no-op blur caret save (`focused: false`):** a non-dirty blur
  saves the rich caret with `focused:false` (H3) so a re-derive restores the
  offset WITHOUT stealing focus from the control the user is now interacting
  with; only a real edit re-focuses. A no-op blur that re-focuses is a defect
  (§2.1 state 19).
- **ADR-13 — the dom-shim shim-absence no-throw contract:** the dom-shim
  (`src/shared/dom-shim.ts`) supplies NO `window.getSelection` and NO
  `document.createRange`. `captureRichCaret` MUST guard `typeof window.getSelection
  === 'function'` (absent → the `{ path:[0], offset:0 }` fallback, no throw) and
  `restoreRichCaret` MUST guard both `window.getSelection` and
  `document.createRange` (absent → no-op return, no throw). A blur + re-derive
  round-trip under the dom-shim never throws and never leaves an unhandled
  rejection — the harness blur tests depend on it (§1.6, §1.7 no-throw, §2.2
  state 17).

**Recording rule (RCA-3):** after the unit's green, the read-only adversarial
sub-agent runs the must-hunt list above plus any further edge cases. Every HOST
finding (this repo's `src/`) is fixed here + regression-tested, and the finding
record is appended to this §5. Every PACKAGE finding (in
`node_modules/provident-ssr/` or the upstream `../Preempt-Providence/` — e.g. any
`contenteditable` attribute or handler-on-heading rendering defect, amendment 8)
is recorded in `docs/defects.md` + `docs/HANDOFF.md`, never patched here. The
expected findings are HOST findings; none are catalogued unless a package defect
surfaces.

### 5.1 Adversarial findings record (RCA-3 — post-green read-only review)

The read-only adversarial reviewer ran the must-hunt list + edge cases against
the green U4 and found the following HOST findings, each fixed here +
regression-tested (RCA-3). All are HOST findings (`src/renderer/sidebar-panes.ts`);
no package defect surfaced.

- **CRITICAL #1 (real-browser) — the re-derive caret restore is clobbered by the
  `await this.refresh()` that immediately follows it.** `reDerive()` ran
  `loadAppGraph` (fresh render) → the gated caret-restore loop → `await
  this.refresh()`. But `refresh()` calls `this.loadAppGraph(...)` AGAIN, and
  `loadAppGraph` → `runtime.loadEnvelope` → `tearDownGraph` (destroys every node)
  + `resetRenderState` + a full fresh `render()` — so the selection the restore
  loop just set (on the prior render's elements) is destroyed in a real browser.
  The caret does NOT survive the re-derive (the central §1.7/§2.1 states 29/33/37
  contract). The dom-shim masked it (persistent `getElementById` + the tests only
  asserted `restoreRichCaret` was CALLED, not that the selection survives the
  final render).
  **RESOLUTION:** eliminated the double graph load — `reDerive` no longer calls
  `loadAppGraph` itself; it stashes the fresh traversal envelope in
  `lastTraversalEnvelope` and lets `refresh()` perform the SINGLE `loadAppGraph`,
  then the restore loop runs AFTER that final render (§1.7 rule). The selection is
  applied to the FINAL render and survives.
  **REGRESSION (RCA-3):** `tests/contenteditable-editor-host.test.ts`
  "CRITICAL #1 — the re-derive caret restore runs AFTER the SINGLE final graph
  load" — drives `reDerive` through the full `loadAppGraph→refresh` and asserts
  `runtime.loadEnvelope` is called EXACTLY ONCE (the buggy path called it twice)
  and that `restoreRichCaret`'s global call index is AFTER the load's (the restore
  runs on the final render, not on a pre-teardown render).

- **a-med #2 — the composition guard can orphan a deferred commit + wedge the
  dirty guard.** `editorCompositionStart` unconditionally overwrites
  `composingRagId` and `pendingCommitRagId` is a single slot. Sequence: blur
  deferred for A (`pendingCommitRagId=A`) → `compositionstart B` → `compositionend
  B` (`pendingCommitRagId !== B`) → A's deferred commit never runs, `dirty(A)`
  stays forever → the dirty guard permanently queues every re-derive.
  **RESOLUTION:** on `compositionstart` for a node ≠ the pending node, run the
  orphaned deferred commit NOW (reads the orphan node's current innerHTML, the
  same read `compositionend` would have used) so `dirty(A)` clears and the guard
  is never wedged. A re-composition of the SAME node (`pendingCommitRagId ===
  ragId`) is NOT orphaned (§1.4 composition-start block).
  **REGRESSION (RCA-3):** "a-med #2 — a superseding composition does NOT wedge A's
  dirty guard" — `compositionstart s1` → dirty blur s1 (deferred) →
  `compositionstart s2` (superseding) → asserts the orphaned commit fires ONCE,
  `pendingCommitRagId` clears, `dirty(s1)` clears, and the guard is no longer
  wedged.

- **a-med #3 — a caret whose anchor/focus lands on an element node is silently
  dropped on restore.** `captureRichCaret` records `domPathToRoot` for whatever
  the anchorNode is; `resolveDomPath` returned `null` unless the final node was
  `nodeType===3`. A real-DOM selection at a `strong`/`em`/`a` boundary was never
  restored.
  **RESOLUTION:** `resolveDomPath` now CLAMPS an element-node edge to its nearest
  text node in document order (via `firstTextNode`), so a boundary selection is
  restored. An element with no text-node descendant still resolves to `null`
  (§1.6).
  **REGRESSION (RCA-3):** "a-med #3 — an element-node caret edge ... is clamped to
  the nearest text node, not dropped" — drives `resolveDomPath` with a synthetic
  `root > strong > text` and asserts the element-edge path resolves to the text
  node.

- **minor (spec alignment) — the pinned `.finally` latch release vs the
  implemented dual `.then`/`.catch` deletes.** The pinned §1.4 `editorBlurCommit`
  released the commit-in-flight latch in `.finally`; the implementation releases
  it in each of `.then` (success) and `.catch` (rejection). Behaviorally
  equivalent (released exactly once on every settle); the spec §1.4 was aligned to
  the actual form.

- **minor #6 — public bridge methods vs a null/undefined ragId.** The 4 rich
  bridge methods now guard `ragId == null` and no-op (never throw / never mark a
  phantom dirty / never commit / never start or end a composition on a phantom
  node). Regression: "minor #6 — the public bridge methods NO-OP on a
  null/undefined ragId".

- **minor #5 — authored handler on a rich root.** Confirmed: NO authored template
  or traversal ever places a handler on a rich root (the traversal authors
  handlers ONLY on the `textarea-<ragId>` child; the content-window template
  authors zone containers only). The splice still changed to APPEND-IF-ABSENT
  (name-deduplicated) so a future/extended authored handler is never clobbered
  (§1.3).
