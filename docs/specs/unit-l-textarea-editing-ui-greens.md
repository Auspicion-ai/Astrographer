# Unit L — The Form-Control Textarea Editing UI: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-l-textarea-editing-ui.md` ONLY — no implementation reading of
  the scenario content).
- **Source contract:** `docs/specs/unit-l-textarea-editing-ui.md` §5.1–§5.11 (the
  textarea provident-ssr authoring, the `onInput`/`onBlur` handler wiring, the
  `readOnly` behavior, the caret/focus preservation, the dirty-edit guard
  interaction, the MCP/UI equivalence, the renderer wiring, §5.8 happy-path
  states, §5.9 fail-states, §5.10 census) + §3a (the adversarial findings A1–A4
  the contract pins) + §3b (the review amendments M1–M6 folded into the
  contract).
- **Modules under test:** `src/main/traversal.ts` (`buildSubtree` — the textarea
  authoring), `src/renderer/sidebar-panes.ts` (the `SidebarPanes` host — the
  `textareaInput`/`textareaBlur` bridge methods + the `rag-textarea-input`/
  `rag-textarea-blur` handler defs + the readOnly setting + the caret restore),
  `src/renderer/renderer.ts` (the renderer entry that constructs the host + the
  edit controller). Supporting modules imported for fixtures/envelopes (NOT the
  implementation under test): `src/renderer/edit-controller.js` (Unit D — the
  dirty-edit guard + caret), `src/renderer/runtime.js` (the app Runtime the
  textarea renders in), `src/main/rag-store.js` + `src/main/edit-ops.js` (the
  MCP/UI equivalence), `src/shared/dom-shim.js`.
- **Harness:** `tests/unit-l-textarea-editing-ui.test.ts`, executed with
  `npx vitest run tests/unit-l-textarea-editing-ui.test.ts`. The host is
  exercised against a real app `Runtime` (DOM-shimmed) + a mock `ProvidentBridge`
  (vi.fn() spies + controllable state), mirroring the RED-set harness pattern.
  The Electron/DOM-dependent parts (§5.8 items 13–16, §5.9 items 8–10 — the
  provident-rendered textarea (A1), the caret-restore re-apply, the
  `onBlur`→`setContent` e2e, and the read-only-inert e2e) are documented in a
  `.skip` block (verified by code review / the e2e battery), matching the Unit
  H / Unit K convention.
- **Run:** 32 scenarios — 25 pass, 0 fail, 7 skipped (Electron/DOM-dependent,
  code-review-verified). No spec-vs-impl drift observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (16 — 12 node-tested, 4 e2e/skipped)

Fixture helpers: `N(id, type, content)` = a snapshot node
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a snapshot edge
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. A valid
single-document flow is `head → s1 → end` scoped to `'doc'`; the edit snapshot
has a section node `'n1'` (editable via the backRefs map). The placeholder/
default content-window template envelope is a bare `wiki-root` + one `main` zone
container, no content payloads.

### H1. Textarea authoring happy (§5.8 1)
- **Setup:** a real JSON RAG store seeded with the single-document flow.
- **Ops:** `buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })`;
  find the payload whose subtree root id is `rag-head`.
- **Expected:** the subtree root KEEPS its semantic type (`h1`) and its
  `content` (`'Title'` — Conflict C resolution: the markdown/line→node map still
  renders the root's text; the textarea is a render-only overlay). A `textarea`
  child is present with `id: 'textarea-head'`, `data-rag-node-id: 'head'`,
  `value: 'Title'` (the RAG node's content), NO `readOnly` prop (OMITTED —
  editable by default, adversarial H1: emitting `readOnly: false` would render
  as the `readonly` boolean attribute and make the textarea uneditable), and the
  handlers `[{ name: 'rag-textarea-input', event: 'input' }, { name:
  'rag-textarea-blur', event: 'blur' }]`. The subtree root carries the stable
  authored id `rag-head` + the `data-rag-node-id` prop.

### H2. One textarea per RAG node content (§5.8 2)
- **Setup:** a real JSON RAG store with a multi-parent node `'shared'` (two
  `parent-child` edges from `a` and `b`).
- **Ops:** `buildTraversal(...)`; collect the payloads whose root id is
  `rag-shared`.
- **Expected:** exactly 2 payloads (N duplicates → N textareas), each carrying
  exactly ONE `textarea` child bound to the SAME RAG node id
  (`data-rag-node-id: 'shared'`).

### H3. `onInput` → `markDirty` happy (§5.8 3)
- **Setup:** a host booted over the edit snapshot; the `rag-textarea-input`
  handler def is registered by `bindHandlers`.
- **Ops:** `window.provident.sidebar.textareaInput('n1')`.
- **Expected:** the bridge method calls `editController.markDirty('n1')` →
  `isDirty('n1')` is `true`.

### H4. `onBlur` → `commit` happy (§5.8 4)
- **Setup:** a host booted over the edit snapshot; `markDirty('n1')`.
- **Ops:** `window.provident.sidebar.textareaBlur('n1', 'new value')`.
- **Expected:** the host saves the caret (offset captured from the DOM
  textarea's `selectionStart` — M5) and calls `commit('n1', 'new value')` → the
  `edit-commit` IPC is sent (`bridge.edit.commit` called with `('n1', 'new
  value')`) → on success the dirty flag is cleared.

### H5. `onBlur` on a non-dirty textarea (§5.8 5)
- **Setup:** a host booted over the edit snapshot (the textarea is NOT dirty).
- **Ops:** `window.provident.sidebar.textareaBlur('n1', 'new value')`.
- **Expected:** the host saves the caret but does NOT call `commit` (no-op blur)
— `editController.commit` NOT called, `bridge.edit.commit` NOT called (no IPC).

### H6. `readOnly` happy (§5.8 6)
- **Setup:** a host with `registerPanes()`; `backRefs.set('n1', ['provident-n1'])`
  (the node is editable at the time the readOnly setting runs).
- **Ops:** `host.loadAppGraph(runtime, traversalEnvelope())`; inspect the
  envelope passed to `runtime.loadEnvelope`.
- **Expected:** the textarea whose `data-rag-node-id` is `'n1'` has NO
  `readOnly` prop (OMITTED — editable by default, adversarial H1; the user can
  edit it).

### H7. Dangling back-reference → read-only happy (§5.8 7)
- **Setup:** a host with `registerPanes()`; `'n1'` is NOT in `backRefs` (a
  dangling back-reference) at the time the readOnly setting runs.
- **Ops:** `host.loadAppGraph(runtime, traversalEnvelope())`; inspect the
  envelope passed to `runtime.loadEnvelope`.
- **Expected:** the textarea whose `data-rag-node-id` is `'n1'` has
  `readOnly: true` (the user cannot edit it).

### H8. Caret save happy (§5.8 8)
- **Setup:** a host booted over the edit snapshot.
- **Ops:** `window.provident.sidebar.textareaBlur('n1', 'new value')`.
- **Expected:** the host calls `editController.saveCaret('n1', { offset: 0,
  focused: false })` (offset from the DOM textarea's `selectionStart` — M5; the
  node is NOT dirty, so `focused: dirty` = `focused: false` — H3: a non-dirty
  blur saves the caret OFFSET but not focus, so a re-derive restores the offset
  without stealing focus from the control the user is now interacting with).

### H9. Caret restore happy (§5.8 9)
- **Setup:** a host booted over the edit snapshot; a caret saved through the
  host's blur path (adds `'n1'` to the host's saved-caret set).
- **Ops:** `await host.reDerive()`.
- **Expected:** the host calls `editController.restoreCaret('n1')` for the node
  with a saved caret (M6 — the host tracks the set of node ids with saved carets
  and restores each after a re-derive).

### H10. Dirty-edit guard happy (§5.8 10)
- **Setup:** a host booted over the edit snapshot.
- **Ops:** `textareaInput('n1')` (marks dirty); `editController.requestRebuild()`;
  then `textareaBlur('n1', 'new value')` (commits → clears the dirty flag).
- **Expected:** while dirty, `hasQueuedRebuild()` is `true` and `onRebuild` is
  NOT called; after the blur commit clears the dirty flag, the queued re-derive
  executes (`onRebuild` called once) and `hasQueuedRebuild()` is `false`.

### H11. MCP/UI equivalence happy (§5.8 11)
- **Setup:** two real JSON RAG stores, each with node `'n1'` content `'before'`.
- **Ops:** MCP path — `setContent({ store: storeA }, { nodeId: 'n1', content:
  'same' })`; UI path — an edit controller whose injected `commit` routes through
  the SAME `setContent` op, `markDirty('n1')` then `commit('n1', 'same')`.
- **Expected:** both return `{ ok: true, nodeId: 'n1' }`; both stores end with
  `'n1'.content === 'same'` (the textarea's commit routes through the SAME
  `setContent` op as the MCP `edit.set_content` tool — same store state).

### H12. Textarea MCP-visible (§5.8 12)
- **Setup:** a host booted over the edit snapshot (the pane-inclusive envelope
  is loaded into the app Runtime).
- **Ops:** read `runtime.renderedHtmlResult().renderedHtml`; `runtime.listTargets()`;
  `runtime.dispatch({ target: 'textarea-n1', event: 'input' })`.
- **Expected:** the rendered html includes the `textarea` element;
  `list_targets` lists the textarea node (`propsId: 'textarea-n1'`) with the
  `rag-textarea-input`/`rag-textarea-blur` handlers; `dispatch` can target the
  textarea and drive its `input` handler → `isDirty('n1')` is `true` (the
  name-referenced handler bodies resolve via `resolveNameReferencedHandlerBodies`
  — Conflict B resolution).

### H13. Textarea rendered via provident (e2e) (§5.8 13)
- **Setup:** the traversal envelope over a store with a section node.
- **Ops:** inspect the authored envelope (the `textarea` child of each RAG
  subtree root) + the app Runtime's rendered html.
- **Expected:** the textarea is authored as provident-ssr data in the traversal
  and rendered through the app Runtime — NOT hand-written HTML/DOM (A1).
  (Electron/DOM surface — code-review-verified, `.skip`.)

### H14. Caret restore after a re-derive (e2e) (§5.8 14)
- **Setup:** a textarea with a saved caret.
- **Ops:** a re-derive re-loads the envelope.
- **Expected:** the host restores the caret (offset + focus) to the re-rendered
  textarea. (Electron/DOM surface — code-review-verified, `.skip`.)

### H15. `onBlur` commit routes through `setContent` (e2e) (§5.8 15)
- **Setup:** a textarea commit-on-blur.
- **Ops:** the blur sends the `edit-commit` IPC → main calls `setContent` (the
  SAME op as the MCP `edit.set_content` tool) → the store updates + broadcasts
  `rag-store-changed` → the renderer re-traverses.
- **Expected:** the store updates and the renderer re-traverses. (Electron/DOM
  surface — code-review-verified, `.skip`.)

### H16. Read-only textarea inert (e2e) (§5.8 16)
- **Setup:** a read-only textarea.
- **Ops:** `input`/`blur` events on the read-only textarea.
- **Expected:** the events do NOT mark dirty or commit (the user cannot type).
  (Electron/DOM surface — code-review-verified, `.skip`.)

---

## B. §5.9 Fail-states (10 — 7 node-tested, 3 e2e/skipped)

### F1. `onBlur` on a dangling back-reference (§5.9 1)
- **Setup:** a host booted over the edit snapshot; `backRefs.delete('n1')` (a
  dangling back-reference); `markDirty('n1')`.
- **Ops:** `window.provident.sidebar.textareaBlur('n1', 'value')`.
- **Expected:** `commit` returns `{ ok: false, reason: 'deleted-node' }` (the
  write is REFUSED — Unit D §5.4 M9); the `edit-commit` IPC is NOT sent
  (`bridge.edit.commit` NOT called).

### F2. `onBlur` store error (§5.9 2)
- **Setup:** a host booted over the edit snapshot with a custom `commit` that
  returns `{ ok: false, reason: 'store-error', error: 'disk full' }`;
  `markDirty('n1')`.
- **Ops:** `window.provident.sidebar.textareaBlur('n1', 'value')`.
- **Expected:** `commit` returns `{ ok: false, reason: 'store-error', error:
  'disk full' }`.

### F3. Dirty-edit guard (§5.9 3)
- **Setup:** a host booted over the edit snapshot.
- **Ops:** `textareaInput('n1')` (marks dirty); `editController.requestRebuild()`.
- **Expected:** the re-derive is QUEUED (not executed) — `hasQueuedRebuild()` is
  `true`; `onRebuild` is NOT called.

### F4. Caret restore for a deleted node (§5.9 4)
- **Setup:** an edit controller with an EMPTY `backRefs` map (the node's
  back-reference is dangling); `saveCaret('n1', { offset: 2, focused: true })`.
- **Ops:** `restoreCaret('n1')`.
- **Expected:** returns `undefined` (the saved caret was cleared — Unit D §5.3
  L5; the host does NOT re-apply a stale caret — A4).

### F5. Caret restore for a node with no saved caret (§5.9 5)
- **Setup:** an edit controller with `backRefs.set('n1', ['provident-n1'])` and
  no saved caret.
- **Ops:** `restoreCaret('n1')`.
- **Expected:** returns `undefined` (no restore).

### F6. `bindHandlers` with a non-string handler body (§5.9 6)
- **Setup:** a host.
- **Ops:** `registerHandlerDef('rag-textarea-nonstring', { name:
  'rag-textarea-nonstring', body: 42 })`.
- **Expected:** the def is STORED (no throw at registration — Unit K §5.3 M4);
  the throw surfaces at COMPILE (`compileHandlerBody`/`new Function`) via the
  app Runtime's `loadEnvelope` path (a caller error).

### F7. `loadAppGraph` with a null/undefined `runtime`/`traversalEnvelope` (§5.9 7)
- **Setup:** a host with `registerPanes()`.
- **Ops:** `host.loadAppGraph(runtime, null)`; `host.loadAppGraph(null,
  traversalEnvelope())`.
- **Expected:** each throws
  `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')`
  (Unit H §5.9.11).

### F8. A textarea rendered outside the provident graph (e2e) (§5.9 8)
- **Setup:** a textarea authored as hand-written HTML/DOM in the renderer (not
  provident-ssr data).
- **Ops:** inspect the renderer.
- **Expected:** a review finding (A1) — it is invisible to
  `provident.dispatch`/`get_rendered_html`/`get_markdown`. (Electron/DOM surface
  — code-review-verified, `.skip`.)

### F9. A `commit` that bypasses the edit controller (e2e) (§5.9 9)
- **Setup:** a textarea `onBlur` that sends the `edit-commit` IPC directly
  (bypassing `editController.commit`).
- **Ops:** inspect the handler wiring.
- **Expected:** it would NOT refuse a write to a deleted node — the edit
  controller's `deleted-node` guard (Unit D §5.4 M9) is the authoritative check;
  the textarea MUST route through `editController.commit`. (Electron/DOM surface
  — code-review-verified, `.skip`.)

### F10. A re-derive that destroys an in-progress edit (e2e) (§5.9 10)
- **Setup:** a re-derive that runs while the textarea is dirty (bypassing the
  dirty-edit guard).
- **Ops:** inspect the re-derive path.
- **Expected:** it would re-materialize the textarea from the store, destroying
  the uncommitted content — the dirty-edit guard MUST queue the re-derive.
  (Electron/DOM surface — code-review-verified, `.skip`.)

---

## C. §5.10 Census / numeric claims (node-tested)

### C1. Textarea handler defs — 2
- **Ops:** `host.bindHandlers()`; `handlerDef(name)` for `rag-textarea-input` and
  `rag-textarea-blur`.
- **Expected:** both defs are defined with function-STRING bodies.

### C2. `rag-textarea-input` body — calls `textareaInput(ragId)`
- **Ops:** `host.bindHandlers()`; read the `rag-textarea-input` def body.
- **Expected:** the body contains `s.textareaInput(ragId)` (reaches the edit
  controller via `window.provident.sidebar` — NEVER an MCP tool).

### C3. `rag-textarea-blur` body — reads the DOM value + calls `textareaBlur`
- **Ops:** `host.bindHandlers()`; read the `rag-textarea-blur` def body.
- **Expected:** the body contains `document.getElementById('textarea-' + ragId)`
  (M4 — reads the DOM textarea's current `.value`) and
  `s.textareaBlur(ragId, value)`.

### C4. Textarea bridge methods — 2
- **Setup:** a host booted over the edit snapshot.
- **Ops:** read `window.provident.sidebar.textareaInput` /
  `window.provident.sidebar.textareaBlur`.
- **Expected:** both are functions (the `window.provident.sidebar` surface is
  extended by the 2 textarea bridge methods).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Textarea authoring happy (§5.8 1) | ✅ PASS |
| H2 | One textarea per RAG node content (§5.8 2) | ✅ PASS |
| H3 | `onInput` → `markDirty` happy (§5.8 3) | ✅ PASS |
| H4 | `onBlur` → `commit` happy (§5.8 4) | ✅ PASS |
| H5 | `onBlur` on a non-dirty textarea (§5.8 5) | ✅ PASS |
| H6 | `readOnly` happy (§5.8 6) | ✅ PASS |
| H7 | Dangling back-reference → read-only happy (§5.8 7) | ✅ PASS |
| H8 | Caret save happy (§5.8 8) | ✅ PASS |
| H9 | Caret restore happy (§5.8 9) | ✅ PASS |
| H10 | Dirty-edit guard happy (§5.8 10) | ✅ PASS |
| H11 | MCP/UI equivalence happy (§5.8 11) | ✅ PASS |
| H12 | Textarea MCP-visible (§5.8 12) | ✅ PASS |
| H13 | Textarea rendered via provident (e2e) (§5.8 13) | ⏭ SKIP (code-review) |
| H14 | Caret restore after a re-derive (e2e) (§5.8 14) | ⏭ SKIP (code-review) |
| H15 | `onBlur` commit routes through `setContent` (e2e) (§5.8 15) | ⏭ SKIP (code-review) |
| H16 | Read-only textarea inert (e2e) (§5.8 16) | ⏭ SKIP (code-review) |
| F1 | `onBlur` on a dangling back-reference (§5.9 1) | ✅ PASS |
| F2 | `onBlur` store error (§5.9 2) | ✅ PASS |
| F3 | Dirty-edit guard (§5.9 3) | ✅ PASS |
| F4 | Caret restore for a deleted node (§5.9 4) | ✅ PASS |
| F5 | Caret restore for a node with no saved caret (§5.9 5) | ✅ PASS |
| F6 | `bindHandlers` with a non-string handler body (§5.9 6) | ✅ PASS |
| F7 | `loadAppGraph` null runtime/envelope (§5.9 7) | ✅ PASS |
| F8 | Textarea outside the provident graph (e2e) (§5.9 8) | ⏭ SKIP (code-review) |
| F9 | `commit` bypassing the edit controller (e2e) (§5.9 9) | ⏭ SKIP (code-review) |
| F10 | Re-derive destroying an in-progress edit (e2e) (§5.9 10) | ⏭ SKIP (code-review) |
| C1 | Textarea handler defs (2) | ✅ PASS |
| C2 | `rag-textarea-input` body | ✅ PASS |
| C3 | `rag-textarea-blur` body | ✅ PASS |
| C4 | Textarea bridge methods (2) | ✅ PASS |

**Run summary:** 32 scenarios — 25 pass, 0 fail, 7 skipped (Electron/DOM-
dependent, code-review-verified).

### Findings (spec-vs-impl drift)

- **None observed.** Every node-testable scenario derived from
  `docs/specs/unit-l-textarea-editing-ui.md` §5.1–§5.11 + §3a/§3b passed against
  the live modules. The textarea provident-ssr authoring (§5.1), the
  `onInput`/`onBlur` handler wiring (§5.2), the `readOnly` behavior (§5.3), the
  caret/focus preservation (§5.4), the dirty-edit guard interaction (§5.5), the
  MCP/UI equivalence (§5.6), the renderer wiring (§5.7), all 12 node-testable
  happy paths (§5.8), all 7 node-testable fail-states (§5.9), and every census
  claim (§5.10) match the spec. No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H13–H16/F8–F10 (Electron/DOM surfaces).** The provident-rendered textarea
  (A1), the caret-restore re-apply, the `onBlur`→`setContent` e2e, and the
  read-only-inert e2e are Electron/DOM surfaces, not node-testable. The
  node-testable proxies that make them hold are asserted directly: (a) the
  textarea is authored as provident-ssr data in the traversal envelope (H1/H2 —
  the SAME envelope loaded into the app Runtime, so it is provident-rendered by
  construction, §5.1); (b) the caret save/restore host contract is node-tested
  (H8/H9 — `saveCaret` on blur, `restoreCaret` after a re-derive); (c) the
  `onBlur` commit routes through the SAME `setContent` op as the MCP tool
  (H11 — the store-state equivalence); (d) the read-only classification is the
  host contract (H6/H7 — the host flips `readOnly` from `isEditable`).
- **F6 (M4).** The `registerHandlerDef` non-string-body throw surface is
  exercised via `registerHandlerDef` directly (the def is stored; the throw
  surfaces at compile via the app Runtime's `loadEnvelope` path).
