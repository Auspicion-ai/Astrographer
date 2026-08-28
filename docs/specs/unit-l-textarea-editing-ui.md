# Spec — Unit L: The Form-Control Textarea Editing UI (Renderer Surface)

- **Status:** SPEC (the deferred form-control textarea UI — Unit D §3a H5, the
  rendering follow-up; the prerequisite for the rich-text contenteditable
  machinery). Gate reference: `docs/specs/astrographer-review.md` §3b
  (FORM-CONTROL-EDITING), §8.1 (RAG-authoritative → traversal → materialized
  graph), §8.2 (MCP/UI equivalence — a BINDING constraint), §9.2.1
  (PROJECT-JOURNAL), §9.2.2 (back-reference carrier), §9.2.6
  (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS), §10.3 Q4 (FS-10 editing
  constraint). Decisions: `docs/decisions.md` rows **FORM-CONTROL-EDITING**,
  **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**, **SUBTREE-OWNERSHIP** (the
  back-reference carrier), **MCP-UI-EQUIVALENCE**, **UI-MOUNT-RE-DERIVE** (the
  re-derive path the textarea's caret restore rides). New decisions pinned by
  this spec (added to `docs/decisions.md` when the unit lands):
  **TEXTAREA-PROVIDENT-AUTHORING** (the textarea is authored as provident-ssr
  data in the traversal — a `textarea` child of each RAG subtree root, bound to
  the RAG node's content via the back-reference map; NOT hand-written
  HTML/DOM), **TEXTAREA-BRIDGE-SURFACE** (the textarea's `onInput`/`onBlur`
  handlers reach the edit controller through the `window.provident.sidebar`
  bridge surface — the Unit K §5.3 M2 pattern; a function-string body cannot
  call `markDirty`/`commit` directly), **TEXTAREA-READONLY-HOST-SET** (the
  `readOnly` prop is set by the host at render time from
  `editController.isEditable(ragId)` — the traversal is pure and cannot see the
  edit controller).
- **Scope:** the renderer-surface slice that makes the RAG node content
  editable in the live app via a provident-rendered textarea. It pins: the
  textarea's provident-ssr authoring (the exact node shape, authored in the
  traversal as a `textarea` child of each RAG subtree root), the `onInput` →
  `markDirty(nodeId)` / `onBlur` → `commit(nodeId, value)` handler wiring
  (through the `window.provident.sidebar` bridge surface), the `readOnly`
  behavior (`!isEditable(nodeId)` → read-only), the caret/focus preservation
  (`saveCaret` on blur, `restoreCaret` after a rebuild), the dirty-edit guard
  interaction (a re-derive while dirty is queued), the MCP/UI equivalence (the
  textarea's commit routes through the SAME `setContent` op as the MCP
  `edit.set_content` tool), and the renderer wiring (where the textarea is
  mounted in the render path + how it binds to each RAG node's content root).
  This unit consumes Unit A (the RAG store snapshot), Unit C (`buildTraversal`
  + the back-reference map), Unit D (the edit controller + the dirty-edit guard
  + the re-traversal path + the `edit-commit` IPC), and Unit K (the
  `SidebarPanes` host + the `window.provident.sidebar` bridge surface + the
  re-derive wiring). This unit does NOT implement the rich-text contenteditable
  machinery (a later slice), the operator settings editing-mode config (Unit K
  §5.4 — NOT in this slice), or the shared-node edit UX (a pending feature —
  `docs/pending.md`).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/main/traversal.ts` (the textarea authoring in `buildSubtree`), the
  amended `src/renderer/sidebar-panes.ts` (the textarea handler defs + the
  `textareaInput`/`textareaBlur` bridge methods + the readOnly setting + the
  caret restore), and the amended `src/renderer/renderer.ts` (the textarea
  handler registration) from §5.8/§5.9 before any implementation. The
  Electron/DOM-dependent parts (§5.8 items 13-16, §5.9 items 8-10) are
  documented in a `.skip` block (verified by code review / the e2e battery),
  mirroring the Unit H/Unit K test convention.

---

## 1. What the proposal asks

1. **The form-control textarea editing UI.** The RAG node content must be
   editable in the live app via a provident-rendered textarea, authored as
   provident-ssr data (a component binding / handler body) and driven through
   the producing graph — NOT hand-written HTML/DOM (the project-wide
   constraint: ALL non-shell UI must be rendered with the provident framework).
   This is the deferred rendering follow-up (Unit D §3a H5) and the prerequisite
   for the rich-text contenteditable machinery.
2. **The textarea is bound to the RAG node's content** via the back-reference
   map (Unit C §5.3) — the node's owned subtree root.
3. **`onInput` → `markDirty(nodeId)`** on the edit controller.
4. **`onBlur` → if dirty, `commit(nodeId, value)`** on the edit controller,
   which routes through the `edit-commit` IPC → the SAME `setContent` op as the
   MCP `edit.set_content` tool (MCP/UI equivalence).
5. **`readOnly` when `!isEditable(nodeId)`** (dangling back-reference →
   read-only).
6. **Caret saved on blur (`saveCaret`) and restored after a rebuild
   (`restoreCaret`)** — the `CaretState = { offset, focused }` shape.
7. **The dirty-edit guard interaction** — the textarea marks itself dirty via
   `markDirty`; a re-derive while dirty is queued.

## 2. Feasibility verdict

**Feasible — grounded in the already-landed edit controller (Unit D), the
back-reference map (Unit C §5.3), the `window.provident.sidebar` bridge
surface (Unit K §5.3 M2), and the traversal's `buildSubtree` authoring path.**

- **Provident authoring:** the traversal (`src/main/traversal.ts`
  `buildSubtree`) already authors each RAG subtree root as a `LegacyNodeData`
  content root. Amending it to emit a `textarea` child (bound to the RAG
  node's content) is pure provident-ssr data authoring — the same pattern the
  pane content helpers use (`searchContent`'s `input`, the template-editor
  pane's `input`/`button` with `handlers`). No engine gap.
- **Handler wiring:** the `window.provident.sidebar` bridge surface (Unit K
  §5.3 M2) is the established pattern for a compiled function-string handler
  body to reach a host method. The textarea's `onInput`/`onBlur` handlers
  register as handler defs (like the pane handlers) and call
  `window.provident.sidebar.textareaInput`/`textareaBlur`, which reach the edit
  controller. No new bridge surface is needed — the existing `sidebar` surface
  is extended with two methods.
- **`readOnly`:** the edit controller's `isEditable(nodeId)` (Unit D §5.4) is
  the authoritative read-only source. The host sets the textarea's `readOnly`
  prop at render time (the traversal is pure and cannot see the edit
  controller). This is host-side wiring.
- **Caret/focus:** the edit controller's `saveCaret`/`restoreCaret` (Unit D
  §5.3) are already implemented. The host calls them on blur / after a rebuild.
- **MCP/UI equivalence:** the textarea's `commit` routes through the SAME
  `edit-commit` IPC → `setContent` op as the MCP `edit.set_content` tool (Unit
  D §5.1.10). No new op or IPC.

No engine/foundation gap blocks this unit. The textarea authoring, the handler
wiring, the readOnly setting, and the caret restore are all project-specific
(compose the traversal + the edit controller + the `window.provident.sidebar`
bridge surface). ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is SHELVED
2026-08-26 (markdown is export-only; the host-side line→node map covers it —
see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The textarea provident authoring (a `textarea` child of each RAG subtree root) | Project-specific (amends `buildTraversal`'s `buildSubtree`) | Low cost; makes the RAG content editable in the live app (H5). |
| The `onInput`/`onBlur` handler wiring (the `window.provident.sidebar` bridge methods) | Project-specific (extends the Unit K §5.3 bridge surface) | Low cost; the handlers reach the edit controller. |
| The `readOnly` setting (host-set from `isEditable`) | Project-specific (host-side render-path wiring) | Low cost; the dangling back-reference → read-only behavior. |
| The caret/focus preservation (save on blur, restore after rebuild) | Project-specific (host calls the edit controller's `saveCaret`/`restoreCaret`) | Low cost; the caret has no home between materializations (§9.2.1 finding 3). |
| The dirty-edit guard interaction | Project-specific (the textarea's `markDirty` queues a re-derive) | Low cost; prevents destroying an in-progress edit (§9.2.1 finding 7). |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The
deferred finding this unit closes is recorded here for provenance:

- **H5 (Unit D §3a, 2026-08-26):** the re-traversal trigger (§5.1.9) and
  commit-on-blur IPC (§5.1.10) were wired, but the form-control textarea UI
  (§5.6) was DEFERRED as a rendering follow-up. Closed by this unit (the
  textarea authoring + the handler wiring + the readOnly + the caret restore).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-26, Unit L):** all findings are HOST findings,
fixed + regression-tested in the same pass:

- **H1 (CRITICAL) — `readOnly: false` renders as the `readonly` boolean
  attribute, making the textarea uneditable in a real DOM.** Fixed: the
  traversal omits the `readOnly` prop (editable by default); `setTextareaReadOnly`
  sets `readOnly: true` only when `!isEditable(ragId)` and omits it otherwise.
- **H2 (MEDIUM) — the caret restore was not one-shot; every re-derive re-focused
  every textarea that ever had a saved caret.** Fixed: the node is removed from
  the saved-caret set after a SUCCESSFUL restore too.
- **H3 (MEDIUM) — a no-op (non-dirty) blur saved `focused: true`, stealing focus
  on the next re-derive.** Fixed: `textareaBlur` saves `focused: dirty` (only a
  real edit re-focuses).
- **H4 (LOW) — `setTextareaReadOnly` mutated the shared traversal envelope,
  leaking `readOnly: true` into `lastTraversalEnvelope`.** Fixed: it sets the
  correct value on every pass (omits `readOnly` when editable), keeping the
  mutation idempotent across re-assembles.
- **H5 (LOW/EDGE) — a node deleted while dirty permanently blocked all
  re-derives.** Fixed: `commit` clears the dirty flag on a `deleted-node` result
  (the edit is unrecoverable — the node is gone).
- **H6 (LOW) — MCP `dispatch` of `blur` ignored the dispatch `value` arg.**
  Fixed: `TEXTAREA_BLUR_BODY` prefers a dispatch-provided value arg when present,
  falling back to the DOM textarea's current value (M4).

**Adversarial pass (to be run after the unit lands, RCA-3):** the findings are
recorded here when the pass runs. The known edge cases this unit's contract
already pins (so the adversarial pass must NOT regress them):

- **A1 — a textarea rendered outside the provident graph is a review finding**
  (the project-wide all-UI-via-provident constraint). The textarea MUST be
  authored as provident-ssr data in the traversal.
- **A2 — a `commit` on a dangling back-reference must NOT send the `edit-commit`
  IPC** (Unit D §5.4 M9 — the edit controller refuses the write; the textarea's
  `onBlur` must not bypass it).
- **A3 — a re-derive while the textarea is dirty must be QUEUED, not executed**
  (the dirty-edit guard — a rebuild would destroy the in-progress edit).
- **A4 — a stale caret must be cleared on a dangling node** (Unit D §5.3 L5 —
  `restoreCaret` returns `undefined` and clears the stale caret; the host must
  not re-apply a stale caret).

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS**. The consolidated verdicts:

| Review | Verdict |
| --- | --- |
| Validity | VALID-WITH-AMENDMENTS |
| Critique | UNSOUND (as written) |
| Architecture | SOUND-WITH-AMENDMENTS |
| Change-analysis | PROCEED-WITH-AMENDMENTS |

The consolidated amendments are folded into the contract below. Each is
cross-referenced to the section that resolves it:

- **M1 — the textarea is a CHILD of the RAG subtree root, not the root itself**
  (§5.1): a `textarea` cannot have children, and the subtree root must keep its
  semantic type (e.g. `section`) + its doc-children nested. The textarea is a
  child of the subtree root; the subtree root's `content` (text) is removed
  (the textarea replaces it).
- **M2 — the handlers reach the edit controller through the
  `window.provident.sidebar` bridge surface** (§5.2): a compiled function-string
  handler body cannot call `markDirty`/`commit` directly (they are host methods,
  not reachable from a `new Function` body). The host extends the Unit K §5.3
  bridge surface with `textareaInput`/`textareaBlur`.
- **M3 — the `readOnly` prop is host-set at render time** (§5.3): the traversal
  is pure and cannot see the edit controller. The host sets `readOnly` on each
  textarea from `editController.isEditable(ragId)` in the render path (after
  assembly, before load).
- **M4 — the committed value is the textarea's CURRENT value, not the authored
  `value` prop** (§5.2): the engine's node `props.value` is the initial value;
  the typed value lives in the DOM. The `onBlur` handler reads the DOM
  textarea's current `.value` and passes it to the bridge method.
- **M5 — the caret offset is captured from the DOM textarea's `selectionStart`**
  (§5.4): the host reads the DOM textarea's `selectionStart` in the
  `textareaBlur` bridge method to build the `CaretState.offset`.
- **M6 — the caret restore runs after a re-derive, for the node(s) with a saved
  caret** (§5.4): the host tracks the set of node ids with saved carets and
  restores each after a re-derive (re-applying offset + focus when
  `focused: true`). The restore is ONE-SHOT (adversarial H2): the node is removed
  from the saved-caret set after a successful restore, so only the re-derive
  immediately following the edit re-focuses — not every subsequent re-derive.

## 4. Design decisions pinned by this spec

- **TEXTAREA-PROVIDENT-AUTHORING:** the textarea is authored as provident-ssr
  data in the traversal (`buildSubtree`) — a `textarea` child of each RAG
  subtree root, bound to the RAG node's content via the back-reference map. NOT
  hand-written HTML/DOM. A textarea rendered outside the provident graph is a
  review finding.
- **TEXTAREA-BRIDGE-SURFACE:** the textarea's `onInput`/`onBlur` handlers reach
  the edit controller through the `window.provident.sidebar` bridge surface (the
  Unit K §5.3 M2 pattern). A function-string body cannot call
  `markDirty`/`commit` directly.
- **TEXTAREA-READONLY-HOST-SET:** the `readOnly` prop is set by the host at
  render time from `editController.isEditable(ragId)` (the traversal is pure and
  cannot see the edit controller).
- **FORM-CONTROL-EDITING (consumed):** editing is commit-on-blur via a
  provident-rendered textarea, writing back to the source RAG object. NOT
  contenteditable. NOT a zone-targeted state-slice (FS-10 blocks it —
  `placement-target-blocked`).
- **RAG-AUTHORITATIVE (consumed):** the RAG store is authoritative; the
  provident graph is a transient render materialization. The textarea's content
  is a projection of the RAG node's content.
- **SINGLE-WRITER-STORE (consumed):** the textarea's commit routes through the
  SAME edit op (`edit.set_content`) as the MCP tool; both call the main-process
  store's `putNode` (via the edit op), serialized through the single-writer
  queue. No renderer-side writes to the RAG store.
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the textarea's commit routes
  through the SAME `setContent` op as the MCP `edit.set_content` tool; the same
  graph, the same rendering, and the same operations are reachable equivalently
  through the MCP surface and the Electron UI.
- **UI-MOUNT-RE-DERIVE (consumed):** the textarea's caret restore rides the
  re-derive path (Unit K §5.2) — after a re-derive re-loads the pane-inclusive
  envelope, the host restores the saved caret.

## 5. The exhaustive contract

### 5.1 The textarea component (provident-ssr authoring)

The textarea is authored as provident-ssr data in the traversal
(`src/main/traversal.ts` `buildSubtree`). Each RAG subtree root is amended to
carry a `textarea` child bound to the RAG node's content.

**The amended `buildSubtree` return shape (pinned):**

```ts
// src/main/traversal.ts — the amended buildSubtree return (the RAG subtree
// root). The subtree root KEEPS its semantic type (e.g. 'section') + its
// doc-children nested; a `textarea` child carries the RAG node's content.
return {
  type: node.type,                       // the RAG node's type (e.g. 'section')
  props: {
    ...(node.props ?? {}),               // the RAG node's own props (e.g. href/src)
    id: `rag-${ragId}`,                  // the stable authored id (the back-reference key)
    'data-rag-node-id': ragId,           // the RAG node id the handlers resolve
  },
  placement: { targetPlacement: [zoneName] },
  content: node.content,                 // KEPT — the subtree root's content stays in the
                                         // envelope so the markdown/line→node map (HOST-C1)
                                         // still renders the text. The textarea is a
                                         // RENDER-ONLY editing overlay (Conflict C
                                         // resolution — the textarea is present in the DOM
                                         // render view, NOT in the markdown; the
                                         // MarkdownAdapter does not render a `textarea`).
  children: [
    {
      type: 'textarea',                  // the form-control editing UI (render-only overlay)
      props: {
        id: `textarea-${ragId}`,         // the textarea's OWN authored id (the blur
                                         // handler + the caret capture resolve THIS, not
                                         // the subtree root's `rag-<ragId>` id). NOT
                                         // `rag-`-prefixed — `collectSubtreeIds` treats a
                                         // `rag-`-prefixed child as a doc-child subtree
                                         // root and would exclude the textarea from the
                                         // backRefs map.
        'data-rag-node-id': ragId,       // the RAG node id the handlers resolve
        value: node.content,             // the bound content (the RAG node's content)
        // NOTE: NO `readOnly` prop is authored (adversarial H1) — emitting
        // `readOnly: false` would render as the `readonly` boolean attribute
        // and make the textarea uneditable in a real DOM. The HOST sets
        // `readOnly: true` at render time when `!isEditable(ragId)` (§5.3).
      },
      handlers: [
        { name: 'rag-textarea-input', event: 'input' },
        { name: 'rag-textarea-blur', event: 'blur' },
      ],
    },
    ...children,                         // the doc-children subtrees (nested at their order)
  ],
}
```

**Authoring rules (pinned):**

- **One textarea per RAG subtree root** (per materialized RAG node content). A
  RAG node with N materialized duplicates (multi-parent, Unit C §5.5) gets N
  textareas (one per duplicate subtree), each bound to the SAME RAG node id via
  the back-reference map.
- **The textarea is a CHILD of the subtree root** (M1): a `textarea` cannot
  have children, and the subtree root must keep its semantic type + its
  doc-children nested. The subtree root's `content` is KEPT (Conflict C
  resolution — the markdown/line→node map renders the root's text; the
  textarea is a RENDER-ONLY editing overlay present in the DOM render view, NOT
  in the markdown). The textarea's `value` mirrors the root's `content`.
- **The `value` prop is the RAG node's content** (`node.content`). This is the
  INITIAL value; the typed value lives in the DOM (M4).
- **The `data-rag-node-id` prop** is the RAG node id the handlers resolve. It is
  present on BOTH the subtree root and the textarea.
- **The stable authored id `rag-<ragNodeId>`** is the back-reference key (Unit C
  §5.3). The backRefs map maps `ragNodeId` → the subtree's minted node ids
  (including the textarea's node id).
- **The textarea's OWN authored id `textarea-<ragNodeId>`** is the element the
  blur handler and the caret capture resolve (`document.getElementById`). It is
  DISTINCT from the subtree root's `rag-<ragNodeId>` id (the root is a
  `section`/`div` — no `.value`/`selectionStart`; the textarea is the editable
  element), and it is deliberately NOT `rag-`-prefixed: `collectSubtreeIds`
  (both `src/main/traversal.ts` and the mirrored `src/renderer/sidebar-panes.ts`
  copy) treats a `rag-`-prefixed child as a doc-child subtree root and would
  exclude the textarea from the backRefs map. The `data-rag-node-id` prop (on
  both) is the RAG node id the handlers pass to the bridge.
- **The `readOnly` prop is OMITTED** by the traversal (a materialized node is
  editable by default). The HOST sets it to `true` at render time when
  `!editController.isEditable(ragId)` (§5.3). Emitting `readOnly: false` would
  render as the `readonly` boolean attribute and make the textarea uneditable
  (adversarial H1).
- **The handlers** are `{ name: 'rag-textarea-input', event: 'input' }` and
  `{ name: 'rag-textarea-blur', event: 'blur' }` — the engine's compile path
  (`loadEnvelope` → `compileHandlerBody`) resolves each to the registered def's
  body by name (§5.2).
- **The `data-doc-head` marker** (when the RAG node is a doc head) is preserved
  on the subtree root's props (the existing traversal behavior).

**The back-reference map (consumed, Unit C §5.3):** the backRefs map
(`Map<ragNodeId, nodeId[]>`) is the SOLE authoritative carrier. The textarea's
node id is part of the RAG node's owned subtree node ids. The edit controller's
`isEditable(ragId)` = `backRefs.has(ragId)` (a best-effort check — Unit D §5.4
M8; the AUTHORITATIVE deleted-node check lives in the injected `commit`).

**Provident-rendering constraint (pinned):** the textarea is authored as
provident-ssr data in the traversal. A textarea rendered outside the provident
graph (hand-written HTML/DOM in the renderer) is a review finding (A1).

### 5.2 The handler wiring (`onInput`/`onBlur` → the edit controller)

The textarea's `onInput`/`onBlur` handlers reach the edit controller through the
`window.provident.sidebar` bridge surface (M2 — the Unit K §5.3 pattern). A
compiled function-string handler body cannot call `markDirty`/`commit` directly
(they are host methods, not reachable from a `new Function` body).

**The handler defs (registered by the host in `bindHandlers`, pinned):**

```ts
// src/renderer/sidebar-panes.ts — the textarea handler defs (function-STRING
// bodies). They reach the edit controller via `window.provident.sidebar` —
// NEVER an MCP tool.
const TEXTAREA_INPUT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.textareaInput(ragId);
}`
const TEXTAREA_BLUR_BODY = `function (ctx, value) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (!ragId) return;
  // H6 — prefer a dispatch-provided value arg (MCP path) when present; fall
  // back to the DOM textarea's current value (UI path, M4).
  if (value === undefined) {
    var el = document.getElementById('textarea-' + ragId);
    value = el ? el.value : '';
  }
  s.textareaBlur(ragId, value);
}`
```

**Handler names (pinned):**

| Handler name | Event | Body reads | Bridge call |
| --- | --- | --- | --- |
| `rag-textarea-input` | `input` | the textarea's `data-rag-node-id` prop | `window.provident.sidebar.textareaInput(ragId)` |
| `rag-textarea-blur` | `blur` | the textarea's `data-rag-node-id` prop + a dispatch-provided `value` arg when present, else the DOM textarea's current `.value` (H6/M4) | `window.provident.sidebar.textareaBlur(ragId, value)` |

**The bridge methods (extended on the `window.provident.sidebar` surface,
pinned):**

```ts
// src/renderer/sidebar-panes.ts — the textarea bridge methods (added to the
// `window.provident.sidebar` surface installed at boot, Unit K §5.3 M2).
window.provident.sidebar.textareaInput = (ragId: string) => this.textareaInput(ragId)
window.provident.sidebar.textareaBlur = (ragId: string, value: string) => void this.textareaBlur(ragId, value)
```

**The host methods (pinned):**

```ts
/** `rag-textarea-input` — mark the RAG node's control dirty. A re-derive while
 *  dirty is QUEUED (the dirty-edit guard, Unit D §5.2). */
private textareaInput(ragId: string): void {
  this.editController.markDirty(ragId)
}

/** `rag-textarea-blur` — save the caret, then commit if dirty. The commit
 *  routes through the SAME `edit-commit` IPC → `setContent` op as the MCP
 *  `edit.set_content` tool (MCP/UI equivalence, §5.6). */
private textareaBlur(ragId: string, value: string): void {
  // M5 — capture the caret offset from the DOM textarea's selectionStart.
  const el = document.getElementById('textarea-' + ragId) as HTMLTextAreaElement | null
  const offset = el && typeof el.selectionStart === 'number' ? el.selectionStart : 0
  // H3 — a non-dirty (no-op) blur saves the caret OFFSET but not focus, so a
  // re-derive restores the offset without stealing focus from the control the
  // user is now interacting with. Only a real edit (dirty) re-focuses.
  const dirty = this.editController.isDirty(ragId)
  this.editController.saveCaret(ragId, { offset, focused: dirty })
  this.caretNodes.add(ragId)
  if (dirty) {
    void this.editController.commit(ragId, value).then((result) => {
      // commit clears the dirty flag on success (Unit D §5.2 L6), which may
      // trigger a queued rebuild. On a `deleted-node` result the dirty flag is
      // ALSO cleared (H5 — the node is gone, the edit is unrecoverable, and the
      // guard must not permanently block re-derives). On `store-error` the dirty
      // flag stays (the edit is not lost).
    })
  }
}
```

**Handler wiring rules (pinned):**

- **`onInput` → `markDirty(ragId)`:** the `rag-textarea-input` handler calls
  `window.provident.sidebar.textareaInput(ragId)` → `editController.markDirty(ragId)`.
  A re-derive while the textarea is dirty is QUEUED (the dirty-edit guard, §5.5).
- **`onBlur` → if dirty, `commit(ragId, value)`:** the `rag-textarea-blur`
  handler prefers a dispatch-provided `value` arg when present (H6 — the MCP
  path), falling back to the DOM textarea's current `.value` (M4), and calls
  `window.provident.sidebar.textareaBlur(ragId, value)`. The host saves the
  caret (§5.4), then — IF `editController.isDirty(ragId)` — calls
  `editController.commit(ragId, value)`. If the textarea is NOT dirty, the
  commit is NOT sent (no-op blur).
- **The committed value is the textarea's CURRENT value** (M4): the engine's
  node `props.value` is the initial value; the typed value lives in the DOM. The
  handler reads the DOM textarea's `.value` (or a dispatch-provided `value` arg
  when present — H6).
- **The handlers are registered in the app-graph scope** (the app Runtime's
  scope), so `provident.dispatch` can drive them (MCP/UI equivalence — the
  textarea is MCP-visible, §5.6).
- **The handlers NEVER call an MCP tool** — they call the `window.provident.sidebar`
  bridge surface, which reaches the edit controller (the SINGLE-WRITER-STORE
  path).

**Fail-states (handler wiring):** a `bindHandlers` that registers a handler def
with a non-string body → the def is STORED (no throw at registration — Unit K
§5.3 M4); the throw surfaces at COMPILE (`compileHandlerBody`/`new Function`),
which the app Runtime's `loadEnvelope` path triggers (a caller error). A
`textareaBlur` on a non-dirty textarea → the commit is NOT sent (no-op). A
`textareaBlur` on a dangling back-reference → `commit` returns
`{ ok: false, reason: 'deleted-node' }` (the `edit-commit` IPC is NOT sent —
Unit D §5.4 M9).

### 5.3 The `readOnly` behavior (dangling back-reference → read-only)

The textarea's `readOnly` prop is set by the host at render time from
`editController.isEditable(ragId)` (M3 — the traversal is pure and cannot see
the edit controller).

**The readOnly setting (pinned):**

- The traversal emits the textarea with NO `readOnly` prop (editable by
  default — adversarial H1: emitting `readOnly: false` would render as the
  `readonly` boolean attribute and make the textarea uneditable).
- The HOST, in the render path (after `assembleAppGraphEnvelope`, before
  `loadEnvelope` — in `loadAppGraph`), walks the assembled envelope's content
  payloads and sets the textarea `readOnly` prop to the CORRECT value on every
  pass: `true` when the `data-rag-node-id` is NOT editable
  (`!editController.isEditable(ragId)`), and OMITTED (editable by default)
  otherwise. Setting the correct value on every pass (not just flipping to
  `true`) keeps the mutation idempotent across re-assembles (adversarial H4).
- `editController.isEditable(ragId)` = `backRefs.has(ragId)` (Unit D §5.4 M8 —
  a best-effort backRefs check; the AUTHORITATIVE deleted-node check lives in
  the injected `commit`).
- **Dangling back-reference → read-only:** a back-reference whose RAG node was
  deleted marks the textarea read-only (Unit D §5.4, §9.2.2). In the
  delete→re-traversal window, the graph may still show a deleted node; the host
  sets `readOnly: true` on its textarea. The authoritative refusal is in
  `commit` (a `deleted-node` result, §5.2).

**Read-only behavior (pinned):**

- A read-only textarea cannot be edited (the browser enforces `readOnly`).
- A read-only textarea's `onInput`/`onBlur` handlers are inert (no `markDirty`,
  no `commit` — the user cannot type, so no input/blur edit).
- The `readOnly` is a best-effort hint (Unit D §5.4 M8): the AUTHORITATIVE
  deleted-node check is in `commit`, which refuses a write to a deleted node
  (`{ ok: false, reason: 'deleted-node' }` — the `edit-commit` IPC is NOT sent).

**Fail-states (readOnly):** a textarea whose RAG node is not editable →
`readOnly: true` (the user cannot edit it). A `commit` on a non-editable node →
`{ ok: false, reason: 'deleted-node' }` (the write is REFUSED; the `edit-commit`
IPC is NOT sent — Unit D §5.4 M9).

### 5.4 Caret/focus preservation

The textarea's caret is saved on blur (`saveCaret`) and restored after a
rebuild (`restoreCaret`) — the `CaretState = { offset, focused }` shape (Unit D
§5.3).

**The `CaretState` shape (consumed, Unit D §5.3):**

```ts
export interface CaretState {
  /** The caret offset within the control's text. */
  offset: number
  /** Whether the control had focus. */
  focused: boolean
}
```

**The save (on blur, pinned):**

- In `textareaBlur` (§5.2), the host captures the caret offset from the DOM
  textarea's `selectionStart` (M5) and calls
  `editController.saveCaret(ragId, { offset, focused: dirty })`.
- The `focused` field is `dirty` (H3): only a real edit (dirty) re-focuses on
  the next re-derive. A non-dirty (no-op) blur saves the caret OFFSET but not
  focus, so a re-derive restores the offset without stealing focus from the
  control the user is now interacting with.

**The restore (after a rebuild, pinned):**

- The host tracks the set of node ids with saved carets (`this.caretNodes:
  Set<string>`). On `saveCaret`, add the node id; on `clearCaret`/restore,
  remove it.
- After a re-derive completes (in `reDerive`, after `loadAppGraph` re-loads the
  pane-inclusive envelope), the host calls `editController.restoreCaret(ragId)`
  for each node id in `this.caretNodes`.
- `restoreCaret(ragId)` returns the saved `CaretState`, or `undefined` if none
  was saved (or the node's back-reference is dangling — the RAG node was
  deleted, Unit D §5.3 L5).
- If the returned state has `focused: true`, the host re-applies the caret to
  the DOM textarea: sets `selectionStart`/`selectionEnd` to `offset` and focuses
  it. If `focused: false`, the host sets the offset but does NOT focus.
- **Deleted node:** if the node's back-reference is dangling, `restoreCaret`
  returns `undefined` (the stale caret was cleared — Unit D §5.3 L5); the host
  does NOT re-apply a stale caret (A4).
- **One-shot restore (H2):** the node is removed from `this.caretNodes` after a
  SUCCESSFUL restore too (not just on a dangling/cleared caret), so only the
  re-derive immediately following the edit re-focuses — not every subsequent
  re-derive.

**Caret rules (pinned):**

- The caret is saved on blur (`saveCaret`), keyed by RAG node id.
- The caret is restored after a rebuild (`restoreCaret`), re-applying offset +
  focus (when `focused: true`).
- A dangling back-reference clears the saved caret (no restore) — `restoreCaret`
  returns `undefined` (Unit D §5.3 L5).

**Fail-states (caret):** `restoreCaret` for a node whose back-reference is
dangling → returns `undefined` (the saved caret was cleared — Unit D §5.3 L5).
A `restoreCaret` for a node with no saved caret → returns `undefined` (no
restore).

### 5.5 The dirty-edit guard interaction

The textarea marks itself dirty via `markDirty`; a re-derive while dirty is
queued (the dirty-edit guard, Unit D §5.2).

**The interaction (pinned):**

- **`onInput` → `markDirty(ragId)`:** the textarea marks its RAG node's control
  dirty. A re-derive request while the textarea is dirty is QUEUED (not
  executed) — the dirty-edit guard.
- **`onBlur` → `commit(ragId, value)`:** if the textarea is dirty, the host
  calls `commit`. On success, `commit` clears the dirty flag (Unit D §5.2 L6),
  which may trigger a queued rebuild.
- **The re-derive trigger routes through `requestRebuild()`:** a
  `rag-store-changed` (Unit D §5.1.9) while the textarea is dirty → the re-derive
  is QUEUED; when the textarea commits and clears its dirty flag, the queued
  re-derive executes.
- **Coalescing:** at most ONE queued rebuild (the dirty-edit guard coalesces —
  Unit D §5.2).

**Fail-states (dirty-edit guard):** a re-derive request while the textarea is
dirty → the re-derive is QUEUED (not executed); `hasQueuedRebuild()` returns
true; `onRebuild` is NOT called. When the textarea commits and clears its dirty
flag → the queued re-derive executes.

### 5.6 MCP/UI equivalence

The textarea's commit routes through the SAME `setContent` op as the MCP
`edit.set_content` tool (Unit D §5.1.10, §5.7; §8.2 a BINDING constraint).

**The equivalence (pinned):**

- **Same op:** the textarea's `onBlur` → `commit(ragId, value)` sends the
  `edit-commit` IPC to main, which calls `setContent` on the store — the SAME
  edit op as the MCP `edit.set_content` tool. Both call the main-process
  store's `putNode` (via the edit op), serialized through the single-writer
  queue. No renderer-side writes to the RAG store.
- **Same re-traversal:** the renderer re-traverses in response to the store
  change in BOTH cases (the `rag-store-changed` broadcast — Unit D §5.1.9).
- **Equivalence test:** an MCP `edit.set_content` and a textarea commit-on-blur
  with the same params produce the same store state and the same re-traversal.
- **The textarea is MCP-visible:** the textarea is authored in the traversal
  envelope, which is loaded into the app Runtime (the SAME Runtime the MCP
  endpoints read). Therefore `provident.get_rendered_html` includes the textarea
  element, `provident.list_targets` lists the textarea node, and
  `provident.dispatch` can target the textarea and drive its `input`/`blur`
  handlers (MCP/UI equivalence — the same graph, the same rendering, the same
  operations reachable equivalently).

**Fail-states (MCP/UI equivalence):** a textarea commit on a deleted node →
`{ ok: false, reason: 'deleted-node' }` (the write is REFUSED; the `edit-commit`
IPC is NOT sent — Unit D §5.4 M9). A textarea commit when the store write fails
→ `{ ok: false, reason: 'store-error', error }`.

### 5.7 The renderer wiring (mounting in the app graph)

The textarea is mounted in the app graph as part of the traversal content
payloads, loaded through the pane-inclusive envelope.

**The render path (pinned):**

1. **The traversal authors the textarea** (§5.1): `buildTraversal`'s
   `buildSubtree` emits a `textarea` child of each RAG subtree root, bound to
   the RAG node's content.
2. **The traversal envelope is assembled** into the pane-inclusive envelope by
   `assembleAppGraphEnvelope` (Unit K §5.1 step 8 / §5.6 `loadAppGraph`). The
   textarea is part of the traversal content payloads (the RAG content), which
   are merged with the pane payloads.
3. **The host sets `readOnly`** (§5.3): in `loadAppGraph`, after assembly and
   before `loadEnvelope`, the host walks the assembled envelope and sets
   `readOnly: true` on each textarea whose RAG node is not editable.
4. **The pane-inclusive envelope is loaded** into the app Runtime via
   `runtime.loadEnvelope` (Unit K §5.6 `loadAppGraph`). The textarea renders in
   the app graph (MCP-visible).
5. **The handlers are registered** (§5.2): the host's `bindHandlers` registers
   the `rag-textarea-input`/`rag-textarea-blur` handler defs (alongside the pane
   handler defs).
6. **The caret is restored after a re-derive** (§5.4): after a re-derive
   re-loads the envelope, the host restores the saved caret.

**The binding to each RAG node's content root (pinned):**

- The textarea binds to the RAG node's content via the back-reference map (Unit
  C §5.3): the backRefs map maps `ragNodeId` → the owned subtree node ids
  (including the textarea's node id). The textarea's `data-rag-node-id` prop
  carries the RAG node id; the handlers resolve it to reach the edit controller.
- The textarea's `value` prop is the RAG node's content (the initial value); the
  typed value lives in the DOM (M4).

**The renderer entry (`src/renderer/renderer.ts` amendment, pinned):**

- The renderer constructs the `SidebarPanes` host with the edit controller
  (whose `onRebuild` is the host's `reDerive` — Unit K §5.1 step 4). The host's
  `bindHandlers` registers the textarea handler defs (§5.2). No other renderer
  change is required — the textarea is authored in the traversal and rendered
  through the existing pane-inclusive envelope path.

**Fail-states (renderer wiring):** a `loadAppGraph` with a null
`runtime`/`traversalEnvelope` → the `assembleAppGraphEnvelope` guard throws
(Unit H §5.9.11). A `bindHandlers` with a non-string handler body → the def is
STORED (no throw at registration — Unit K §5.3 M4); the throw surfaces at
COMPILE via the app Runtime's `loadEnvelope` path (a caller error).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **Textarea authoring happy:** a RAG subtree root is authored with a `textarea`
   child whose `value` = the RAG node's content, `data-rag-node-id` = the RAG
   node id, NO `readOnly` prop (editable by default — adversarial H1), and the
   `rag-textarea-input`/`rag-textarea-blur` handlers. The subtree root keeps its
   semantic type + its doc-children nested.
2. **One textarea per RAG node content:** each materialized RAG subtree root
   carries exactly ONE textarea. A multi-parent RAG node with N duplicates gets
   N textareas (one per duplicate subtree), each bound to the SAME RAG node id.
3. **`onInput` → `markDirty` happy:** a textarea `input` event → the
   `rag-textarea-input` handler calls `window.provident.sidebar.textareaInput(ragId)`
   → `editController.markDirty(ragId)` → `isDirty(ragId)` is true.
4. **`onBlur` → `commit` happy:** a dirty textarea `blur` event → the
   `rag-textarea-blur` handler reads the DOM textarea's current `.value` and
   calls `window.provident.sidebar.textareaBlur(ragId, value)` → the host saves
   the caret + calls `editController.commit(ragId, value)` → the `edit-commit`
   IPC is sent → main calls `setContent` → returns `{ ok: true, nodeId }` → the
   dirty flag is cleared (which may trigger a queued rebuild).
5. **`onBlur` on a non-dirty textarea:** a non-dirty textarea `blur` event →
   the host saves the caret but does NOT call `commit` (no-op blur, no IPC).
6. **`readOnly` happy:** a textarea whose RAG node is editable → the `readOnly`
   prop is OMITTED (editable by default — the user can edit it).
7. **Dangling back-reference → read-only happy:** a textarea whose RAG node is
   NOT editable (dangling back-reference) → `readOnly: true` (the user cannot
   edit it).
8. **Caret save happy:** a textarea `blur` → the host calls
   `editController.saveCaret(ragId, { offset, focused: dirty })` → the caret is
   stored keyed by RAG node id (H3 — only a real edit re-focuses).
9. **Caret restore happy:** after a re-derive, the host calls
   `editController.restoreCaret(ragId)` for a node with a saved caret → returns
   the saved `CaretState` → the host re-applies the offset + focus to the DOM
   textarea.
10. **Dirty-edit guard happy:** a re-derive request while the textarea is dirty
    → the re-derive is QUEUED (`hasQueuedRebuild()` true, `onRebuild` NOT
    called); when the textarea commits and clears its dirty flag → the queued
    re-derive executes.
11. **MCP/UI equivalence happy:** a textarea commit-on-blur and an MCP
    `edit.set_content` with the same params produce the same store state and
    the same re-traversal.
12. **Textarea MCP-visible:** after the pane-inclusive envelope is loaded, the
    textarea is in the app Runtime → `get_rendered_html` includes the textarea
    element, `list_targets` lists the textarea node, `dispatch` can target the
    textarea and drive its `input`/`blur` handlers. (Conflict B resolution — the
    textarea's handlers are name-referenced (`{ name, event }`, body registered
    via `registerHandlerDef`); the host's `Runtime.loadEnvelope`/`loadDoc`
    resolves each name-referenced handler's body from the registry onto the node
    (`resolveNameReferencedHandlerBodies`), so the engine's `dispatchEvent` can
    fire it. This also fixes the pre-existing template-handler dispatch gap.)
13. **Textarea rendered via provident (e2e):** the textarea is authored as
    provident-ssr data in the traversal and rendered through the app Runtime —
    NOT hand-written HTML/DOM (A1).
14. **Caret restore after a re-derive (e2e):** a textarea with a saved caret →
    a re-derive re-loads the envelope → the host restores the caret (offset +
    focus) to the re-rendered textarea.
15. **`onBlur` commit routes through `setContent` (e2e):** a textarea
    commit-on-blur sends the `edit-commit` IPC → main calls `setContent` (the
    SAME op as the MCP `edit.set_content` tool) → the store updates + broadcasts
    `rag-store-changed` → the renderer re-traverses.
16. **Read-only textarea inert (e2e):** a read-only textarea's `input`/`blur`
    events do NOT mark dirty or commit (the user cannot type).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`onBlur` on a dangling back-reference:** a textarea `blur` on a node whose
   back-reference is dangling → `commit` returns
   `{ ok: false, reason: 'deleted-node' }` (the write is REFUSED; the
   `edit-commit` IPC is NOT sent — Unit D §5.4 M9). The node's dirty flag is
   CLEARED (adversarial H5 — the node is gone, the edit is unrecoverable, and
   the dirty-edit guard must not permanently block re-derives).
2. **`onBlur` store error:** a textarea `blur` when the store write fails →
   `commit` returns `{ ok: false, reason: 'store-error', error }`.
3. **Dirty-edit guard:** a re-derive request while the textarea is dirty → the
   re-derive is QUEUED (not executed); `hasQueuedRebuild()` returns true;
   `onRebuild` is NOT called.
4. **Caret restore for a deleted node:** `restoreCaret` for a node whose
   back-reference is dangling → returns `undefined` (the saved caret was
   cleared — Unit D §5.3 L5).
5. **Caret restore for a node with no saved caret:** `restoreCaret` for a node
   with no saved caret → returns `undefined` (no restore).
6. **`bindHandlers` with a non-string handler body:** the def is STORED (no
   throw at registration — Unit K §5.3 M4); the throw surfaces at COMPILE
   (`compileHandlerBody`/`new Function`) via the app Runtime's `loadEnvelope`
   path (a caller error).
7. **`loadAppGraph` with a null/undefined `runtime`/`traversalEnvelope`:** the
   `assembleAppGraphEnvelope` guard throws
   `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')`
   (Unit H §5.9.11).
8. **A textarea rendered outside the provident graph (e2e):** a textarea
   authored as hand-written HTML/DOM in the renderer (not provident-ssr data) is
   a review finding (A1) — it is invisible to `provident.dispatch`/
   `get_rendered_html`/`get_markdown`.
9. **A `commit` that bypasses the edit controller (e2e):** a textarea `onBlur`
   that sends the `edit-commit` IPC directly (bypassing `editController.commit`)
   would NOT refuse a write to a deleted node — the edit controller's
   `deleted-node` guard (Unit D §5.4 M9) is the authoritative check. The
   textarea MUST route through `editController.commit`.
10. **A re-derive that destroys an in-progress edit (e2e):** a re-derive that
    runs while the textarea is dirty (bypassing the dirty-edit guard) would
    re-materialize the textarea from the store, destroying the uncommitted
    content. The dirty-edit guard MUST queue the re-derive.

### 5.10 Census / numeric claims

- **Textareas:** 1 per materialized RAG subtree root (per RAG node content). A
  multi-parent RAG node with N duplicates → N textareas (one per duplicate
  subtree).
- **Textarea handler names:** 2 (`rag-textarea-input`, `rag-textarea-blur`).
- **Textarea bridge methods:** 2 (`window.provident.sidebar.textareaInput`,
  `window.provident.sidebar.textareaBlur`).
- **Textarea host methods:** 2 (`textareaInput`, `textareaBlur`).
- **The `edit-commit` IPC:** 1 (already counted in Unit D §5.10 — the textarea's
  commit routes through it).
- **The `rag-store-changed` event:** 1 (already counted in Unit D §5.10 — the
  re-traversal trigger the textarea's commit broadcasts).
- **The `setContent` op:** 1 (already counted in Unit D §5.10 — the SAME op the
  textarea's commit and the MCP `edit.set_content` tool route through).
- **The `CaretState` shape:** 1 (`{ offset: number, focused: boolean }` — Unit D
  §5.3).
- **The `readOnly` source:** 1 (`editController.isEditable(ragId)` — Unit D
  §5.4).
- **The dirty-edit guard:** at most 1 queued rebuild (coalesced — Unit D §5.2).
- **The `window.provident.sidebar` surface:** extended by 2 methods (the
  existing Unit K §5.3 surface + `textareaInput`/`textareaBlur`).

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (RAG node/edge shapes,
  `ownedNodeIds`), §5.4 (the `RagStore` interface), §5.5 (single-writer queue),
  §5.6 (project journal — `content`/`structural` entries).
- Unit B: `docs/specs/unit-b-document-model.md` §5.3 (five-seam gate), §5.4
  (tool schemas — the `edit.*` tools).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalResult` — the
  `envelope` + `backRefs` + `lineMap`), §5.3 (the back-reference
  map — the SOLE authoritative carrier the textarea binds through), §5.4 (the
  render path the textarea loads through), §5.5 (multi-parent duplicate
  coherence — the N textareas per duplicate).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.9 (the `rag-store-changed`
  re-traversal trigger), §5.1.10 (the `edit-commit` IPC the textarea's commit
  routes through), §5.2 (the dirty-edit guard that queues a re-derive while the
  textarea is dirty), §5.3 (the `CaretState` shape + `saveCaret`/`restoreCaret`),
  §5.4 (the dangling back-reference → read-only behavior + `isEditable`),
  §5.6 (the form-control editing UI — the textarea this unit implements), §5.7
  (MCP/UI equivalence), §5.10 (the census — the `edit-commit` IPC + the
  `rag-store-changed` event + the `setContent` op), §3a H5 (the deferred
  form-control textarea UI this unit closes).
- Unit H: `docs/specs/unit-h-sidebar-panes.md` §5.2 (`assembleAppGraphEnvelope`
  — the assembly the textarea's envelope loads through), §5.9.11 (the
  `assembleAppGraphEnvelope` guard error).
- Unit I: `docs/specs/unit-i-template.md` §5.4 (the template-editor pane — the
  `handlers: [{ name, event }]` authoring pattern the textarea mirrors).
- Unit K: `docs/specs/unit-k-sidebar-panes-host.md` §5.1 (the boot wiring the
  textarea's envelope loads through), §5.2 (the re-derive wiring the textarea's
  caret restore rides), §5.3 (the `window.provident.sidebar` bridge surface the
  textarea handlers use — the M2 pattern), §5.4 (the operator settings pane —
  the editing-mode config is NOT in this slice), §5.6 (the `SidebarPanes` host
  API the textarea's host methods extend), §5.10 (the census — the
  `window.provident.sidebar` surface).
- Gate: `docs/specs/astrographer-review.md` §3b (FORM-CONTROL-EDITING), §8.1
  (RAG-authoritative), §8.2 (MCP/UI equivalence — a BINDING constraint), §9.2.1
  (PROJECT-JOURNAL), §9.2.2 (back-reference carrier), §9.2.6
  (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS), §10.3 Q4 (FS-10 editing
  constraint).
- Decisions: `docs/decisions.md` rows **FORM-CONTROL-EDITING**,
  **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**, **SUBTREE-OWNERSHIP** (the
  back-reference carrier), **MCP-UI-EQUIVALENCE**, **UI-MOUNT-RE-DERIVE**. New
  rows pinned by this spec (added when the unit lands): **TEXTAREA-PROVIDENT-
  AUTHORING**, **TEXTAREA-BRIDGE-SURFACE**, **TEXTAREA-READONLY-HOST-SET**.
- Pending: `docs/pending.md` (the rich-text contenteditable machinery — the
  later slice this unit is the prerequisite for; the shared-node edit UX —
  revisit when Unit D lands; document tabs — the multi-document render that
  makes "update all duplicates" live).
- Engine surfaces: `provident-ssr` (`LegacyNodeData`, `LegacyContentPayload`,
  `translateLegacy`, `renderProducingProcess`, `compileHandlerBody` — the
  `handlers: [{ name, event }]` authoring + the compile path that resolves the
  handler defs by name).
- Host patterns: `src/main/traversal.ts` (`buildSubtree` — the textarea
  authoring site), `src/renderer/sidebar-panes.ts` (the `SidebarPanes` host —
  the textarea handler defs + the `textareaInput`/`textareaBlur` bridge methods
  + the readOnly setting + the caret restore), `src/renderer/renderer.ts` (the
  renderer entry that constructs the host + the edit controller),
  `src/renderer/edit-controller.ts` (the `EditController` interface the textarea
  handlers reach — `markDirty`/`isDirty`/`commit`/`saveCaret`/`restoreCaret`/
  `isEditable`), `src/main/preload.ts` (`ProvidentBridge.edit.commit` — the
  `edit-commit` IPC the textarea's commit routes through), `src/shared/types.ts`
  (the `edit-commit` IPC + `EditCommitResult`).
