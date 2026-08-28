# Spec — Unit U3: Rich-Text Editing Eligibility + Host Post-Assembly Splice + Snapshot `children` Field

- **Status:** SPEC (the U3 unit of the editing-mode-toggle + contenteditable
  rich-text editor slice — decisions **C** and **E** of
  `docs/specs/editing-mode-toggle-review.md` §4/§5, U3 row). Three related
  pieces: (1) a PURE eligibility gate that decides whether a RAG subtree root
  may host a `contenteditable` editor; (2) a host post-assembly splice
  (`applyEditingMode`) that swaps the traversal-authored textarea for the
  contenteditable editor at render time; (3) an additive `children` field on the
  `RagSnapshotPayload.nodes` element so a rich re-derive preserves inline
  children.
- **Scope:** `src/renderer/rich-eligibility.ts` (NEW module, pure),
  `src/renderer/sidebar-panes.ts` (`applyEditingMode` + the `loadAppGraph`
  splice invocation + a private `editingMode` field), `src/shared/types.ts`
  (the additive snapshot `children` field + the `EditingMode` type). This unit
  does NOT implement the contenteditable UI handlers / caret / IME (Unit U4),
  the `editingMode` operator setting + control + re-derive broadcast (Unit U1),
  the `setRichText` write-back op / `IPC_EDIT_RICH_COMMIT` (Unit U5), or the
  blur decomposition (Unit U2, already landed). The traversal stays PURE — it
  still emits the textarea on every subtree; the mode swap is host-side (decision
  **C**). The `contenteditable` prop is authored as provident data (the AGENTS.md
  UI-via-provident constraint); the engine's prop→attribute mapping is OUT OF
  SCOPE for U3 (amendment 8 pins only that the prop key is `contenteditable`).
- **TestWriter contract:** every signature, return shape, state, and fail-state
  below is derivable from this spec ALONE. The TestWriter writes the red set
  BEFORE any implementation: the PURE `isRichEditableRoot` node tests (§2) for
  the new `src/renderer/rich-eligibility.ts` + the type-level `children` field
  + `EditingMode` (§1.4) are fully node-testable (no `.skip`). The HOST splice
  is not a standalone pure function — it is a private `SidebarPanes` method
  tested through the `loadAppGraph` integration path with an INJECTED
  `editingMode` (§2.1/§2.2 + §5 integration note). The amendment pins: U3's pure
  functions take `editingMode` INJECTED (testable before U1 exists) and U3
  includes the `loadAppGraph` splice invocation + an integration test against an
  injected `editingMode`.

---

## 1. Status + signatures + EDITABLE_TYPES + splice + snapshot field

### 1.1 What the proposal asks (U3)

When `editingMode === 'contenteditable'`, a RAG subtree root that is rich-editable
(a heading/paragraph/blockquote/div that does NOT own doc-children) must render
its content as a contenteditable element instead of the plain-text textarea the
traversal always emits (Unit L). The traversal cannot see `editingMode` (it is
PURE and has no settings access — decision **C**), so the HOST splices the
ASSEMBLED envelope after assembly: for each eligible subtree root it REMOVES the
traversal-authored `textarea-<ragId>` child and sets `contenteditable: true` on
the root's props (authored as provident data). Ineligible roots keep their
textarea (the fallback control). When `editingMode === 'textarea'` the splice is
a no-op. Separately, `RagSnapshotPayload.nodes` must expose the `children` the
snapshot already returns, so the traversal + splice can type-check `node.children`.

### 1.2 The pure eligibility function (pinned)

New module `src/renderer/rich-eligibility.ts` — PURE, node-testable, no Electron,
no DOM, no host state.

```ts
/** PURE — whether a RAG subtree root (by its RagNodeType) may host a
 *  contenteditable editor. `ownsDocChildren` is true when the root has a direct
 *  doc-child (a child carrying a `rag-`-prefixed authored id). Returns true iff
 *  `type ∈ EDITABLE_TYPES` AND `!ownsDocChildren`. */
export function isRichEditableRoot(type: RagNodeType, ownsDocChildren: boolean): boolean

/** The closed set of rich-editable RAG node types. h1–h6, p, blockquote, div. */
export const EDITABLE_TYPES: ReadonlySet<RagNodeType>
```

**API rules (pinned):**

- **PURE + DETERMINISTIC:** the function depends only on its two arguments; the
  same `(type, ownsDocChildren)` pair ALWAYS returns the same boolean. No global
  state, no host reads. The ENTIRE eligibility contract is node-testable.
- **Return shape:** `boolean`. `true` iff `EDITABLE_TYPES.has(type)` AND
  `!ownsDocChildren`. No throw path.
- **`EDITABLE_TYPES` (pinned, decision E):** the closed set
  `{ 'h1','h2','h3','h4','h5','h6','p','blockquote','div' }` — **9 members**
  (h1–h6 = 6 + p + blockquote + div). (See §3 — the review prose cited "7"; the
  enumerated set has 9. This spec pins **9**.)
- **Eligibility by type:** every other `RagNodeType` member
  (`ul`, `ol`, `li`, `pre`, `code`, `strong`, `em`, `a`, `img`, `table`, `thead`,
  `tr`, `td`, `th` — **14 members**) is NOT eligible → falls back to textarea.
- **`ownsDocChildren` semantics:** true when the ROOT has a DIRECT child whose
  authored `props.id` is a string starting with `'rag-'` (the doc-child subtree
  root convention — traversal.ts `buildSubtree` / `collectSubtreeIds`). A node
  with INLINE `children` (`strong`/`em`/`a`/`img` rendered as
  `inline-<ragId>-<n>`) is eligible — that is the PRIMARY rich-text case. Inline
  children are NOT `rag-`-prefixed, so they never set `ownsDocChildren`.
- **A node with NO children at all** (plain-text, `content` only) is eligible
  when its type is in `EDITABLE_TYPES` and it owns no doc-children.
- **A node that owns a doc-child is NOT eligible** even if its type is in
  `EDITABLE_TYPES` (a container with nested document content is not a single
  rich-text leaf).
- **Non-member type:** a type string NOT in the `RagNodeType` union is NOT in
  `EDITABLE_TYPES` → returns `false` (defensive; the splice passes real
  `RagNodeType` values).
- **Multi-parent duplicates are NOT a separate eligibility branch:** every
  duplicate subtree root of a multi-parent RAG node follows the SAME rule (same
  type + its own `ownsDocChildren`), so all N duplicates get the SAME verdict.

### 1.3 The host splice `applyEditingMode` (pinned)

`src/renderer/sidebar-panes.ts`, a private method on `SidebarPanes` extending the
`setTextareaReadOnly` post-assembly prop-mutation pattern (Unit L §5.3).

```ts
/** Unit U3 §1.3 — the host post-assembly splice. When `editingMode ===
 *  'contenteditable'`, walk every subtree root in the assembled envelope's
 *  content payloads: for each RICH-ELIGIBLE root, REMOVE the traversal-authored
 *  `textarea-<ragId>` child and set `contenteditable: true` on the root's props
 *  (authored as provident data). Ineligible roots keep their textarea (the
 *  fallback control). When `editingMode === 'textarea'`, no-op. Idempotent. */
private applyEditingMode(envelope: LegacyInitialData, editingMode: EditingMode): void
```

**The `editingMode` injection decision (pinned):** `editingMode` is an EXPLICIT
second parameter, NOT read from `this.lastOperatorSettings`. Rationale: the
`editingMode` field does NOT yet exist on `OperatorSettings` (Unit U1 adds it);
reading it from `this.lastOperatorSettings` would always yield `undefined` in U3
and make the splice untestable in isolation. Passing it as a parameter keeps the
splice testable before U1 exists (the amendment). The `EditingMode` type
(`'textarea' | 'contenteditable'`) is defined ADDITIVELY in
`src/shared/types.ts` as part of U3 so the splice's signature is typed; Unit U1
later adds the `editingMode` field to `OperatorSettings` using the SAME
`EditingMode` type and rewires the host source.

**The `loadAppGraph` splice invocation (pinned, decision C):** in
`loadAppGraph` (`sidebar-panes.ts`), the splice is called immediately AFTER
`setTextareaReadOnly(result.envelope)` and BEFORE `recomputeBackRefs`:

```ts
this.setTextareaReadOnly(result.envelope)
this.applyEditingMode(result.envelope, this.editingMode)   // NEW (U3) — after §Unit L readOnly, before backRefs
const assembledBackRefs = this.recomputeBackRefs(result.envelope)
```

The mode is supplied from a NEW private host field `private editingMode:
EditingMode = 'textarea'` (the safe default — textarea stays the default,
decision **D**). U3's integration test INJECTS the mode by setting this field to
`'contenteditable'` (or `'textarea'`) before calling `loadAppGraph`. Unit U1
later wires this field to the operator-settings value + the re-derive broadcast.

**Splice behavior (pinned):**

- **Eligible root, contenteditable mode:** REMOVE the child whose authored
  `props.id === 'textarea-<ragId>'` (where `ragId` = the root's authored id
  after the `rag-` prefix, equivalently the root's `data-rag-node-id`) and set
  `root.props = { ...(root.props ?? {}), contenteditable: true }` (preserves the
  root's existing props, including the authored `id`, `data-rag-node-id`,
  `data-doc-head`). The root's INLINE children (`inline-<ragId>-<n>`) and any
  nested doc-child subtree roots are NOT touched by the removal.
- **Ineligible root, contenteditable mode:** leave the `textarea-<ragId>` child
  in place (the fallback control) and do NOT set `contenteditable` on the root.
- **`editingMode === 'textarea'`:** no-op — no node is mutated, no textarea
  removed, no prop set.
- **Walk coverage:** the walk starts at each payload's `content[0]` (always a
  subtree root) and RECURSES into every direct child that is ITSELF a subtree
  root (a child whose authored `props.id` starts with `'rag-'` — a doc-child
  subtree root). It does NOT recurse into inline children or textareas (neither
  is `rag-`-prefixed).
- **`ownsDocChildren(root)` detection (pinned):** `true` iff `root.children`
  contains at least one child whose authored `props.id` is a string starting
  with `'rag-'` (the SAME convention `collectSubtreeIds` / `recomputeBackRefs`
  use). Mirrors the traversal's `rag-`-prefix rule exactly.
- **Idempotent across re-assembles (mirrors setTextareaReadOnly's H4):** on a
  fresh traversal the textarea is re-emitted, so the splice re-runs identically.
  On a REPEATED splice of the SAME envelope, an already-removed textarea is not
  found → the removal no-ops; `contenteditable: true` is set again (idempotent).
  Re-running the splice never throws and never double-removes.
- **The `contenteditable` prop (pinned):** the prop KEY is `contenteditable` and
  its VALUE is `true` (a boolean). It is authored as a provident prop on the
  subtree root — the engine's prop→`contenteditable`-attribute mapping is OUT OF
  SCOPE (amendment 8) but the prop key must be exactly `contenteditable`.

### 1.4 The snapshot `children` field (pinned, additive)

`src/shared/types.ts`, the `RagSnapshotPayload.nodes` element type. The current
element is `{ id; type: string; content: string; props?; ownedNodeIds;
createdAt; updatedAt }` (no `children`). This unit ADDS an optional `children`
field (additive; no field is removed or made required):

```ts
nodes: Array<{
  id: string
  type: string
  content: string
  props?: Record<string, unknown>
  children?: Array<{ type: string; content: string; props?: Record<string, unknown> }>   // NEW (U3) — additive
  ownedNodeIds: string[]
  createdAt: string
  updatedAt: string
}>
```

- **No runtime change:** the `IPC_RAG_SNAPSHOT` handler in `src/main/main.ts`
  already returns `ragStore.listNodes()` — full `RagNode` objects that ALREADY
  carry `children`. The type addition is purely so the renderer's traversal
  (`buildTraversalEnvelope`) + splice can type-check `node.children`.
- **Additive/optional:** a snapshot node WITHOUT `children` (the v1 default) is
  valid; the field is `children?`, absent for plain-text nodes.
- **Field element shape:** `{ type: string; content: string; props? }` — mirrors
  the store's `RagNodeChild` shape (`RagNodeChildType` = strong/em/a/img) but
  uses `type: string` to match the snapshot node's existing `type: string`
  convention (no new import coupling).

---

## 2. Every state + fail-state (TestWriter red set)

### 2.1 Happy-path states (TestWriter red set — valid paths)

**`isRichEditableRoot(type, ownsDocChildren=false)` — eligible (9):**
1. `h1`, `h2`, `h3`, `h4`, `h5`, `h6` (no doc-children) → `true` (each of the 6
   heading types).
2. `p` (no doc-children) → `true`.
3. `blockquote` (no doc-children) → `true`.
4. `div` (no doc-children) → `true`.

**`isRichEditableRoot(type, ownsDocChildren=false)` — NOT eligible (14):**
5. Each of `ul`, `ol`, `li`, `pre`, `code` (no doc-children) → `false`.
6. Each of `strong`, `em`, `a`, `img` (no doc-children) → `false`.
7. Each of `table`, `thead`, `tr`, `td`, `th` (no doc-children) → `false`.

**`isRichEditableRoot` with doc-children (23 → all false):**
8. An `EDITABLE_TYPES` type (e.g. `h1`, `p`, `blockquote`, `div`) WITH
   doc-children (`ownsDocChildren=true`) → `false` (a doc-child owner is never a
   rich-text leaf).
9. A non-`EDITABLE_TYPES` type (e.g. `ul`, `pre`, `td`) WITH doc-children → `false`.

**The primary rich-text case:**
10. A node with INLINE `children` (e.g. `p` with `strong`/`em`/`a`/`img`
    `RagNodeChild`s) and NO doc-children → `true` (inline children are not
    `rag-`-prefixed, so `ownsDocChildren` stays false). This is the case the
    contenteditable editor is built for.

**The splice (`applyEditingMode`, through `loadAppGraph` with
`this.editingMode = 'contenteditable'`):**
11. **Eligible root splices:** an eligible root (e.g. `p`) → its `textarea-<ragId>`
    child is REMOVED from `root.children` and `root.props.contenteditable === true`;
    the root's OTHER props (`id: 'rag-<ragId>'`, `data-rag-node-id`, any authored
    props) are preserved.
12. **Inline children survive the splice:** an eligible root WITH inline
    children → the inline children remain in `root.children` (only the textarea
    is removed) and `contenteditable: true` is set.
13. **Ineligible root keeps its textarea:** an ineligible root (e.g. `ul`, `pre`,
    `td`, or an `EDITABLE_TYPES` type WITH a doc-child) → its `textarea-<ragId>`
    child REMAINS and `contenteditable` is NOT set on the root.
14. **Nested subtree roots splice recursively:** a subtree root that is a
    doc-child of another subtree root and is ITSELF eligible (e.g. an `h2`
    doc-child of a parent `h1`) → its own textarea is removed +
    `contenteditable: true`, recursively, independent of its parent. NOTE: the
    PARENT that OWNS the doc-child is itself INELIGIBLE (state 8/13 —
    `ownsDocChildren=true` → `isRichEditableRoot` false), so it KEEPS its
    textarea; only the doc-child splices. (A parent that owns no doc-child and
    is in EDITABLE_TYPES, e.g. a plain `p`, splices normally.)
15. **Multi-parent duplicates are consistent:** an ELIGIBLE multi-parent RAG
    node materialized twice → BOTH duplicate subtree roots have their textarea
    removed + `contenteditable: true` (the same rule per duplicate). An
    INELIGIBLE multi-parent node → BOTH duplicates keep their textarea.
16. **Empty eligible root:** an eligible root with `content: ''` and no children
    → still eligible; its textarea is removed + `contenteditable: true` (the
    contenteditable editor exists, empty).
17. **Empty envelope:** `envelope.content` empty (`[]`) → the splice no-ops
    (zero payloads walked), never throws.

**The textarea-mode no-op (`applyEditingMode(…, 'textarea')`):**
18. **No-op:** every subtree root keeps its textarea, no `contenteditable` prop
    is set, no child is removed — the assembled envelope is byte-for-byte
    unchanged by the splice.

**Idempotence:**
19. **Re-run of the splice on the same envelope (contenteditable mode):** an
    already-spliced eligible root → the textarea is already absent (removal
    no-ops — no throw, no double-remove), `contenteditable: true` is set again.
    The result is identical to the first pass.

**Integration + ordering:**
20. **Splice runs after setTextareaReadOnly:** in `loadAppGraph`, `applyEditingMode`
    is invoked after `setTextareaReadOnly` and before `recomputeBackRefs`
    (decision C — the readOnly pass still sees the textarea; the splice then
    removes it for eligible roots; backRefs are recomputed from the POST-splice
    envelope). The eligible root's `rag-<ragId>` id IS present in the recomputed
    backRefs (its subtree is collected), so `isEditable(ragId)` stays true for
    the contenteditable root.
21. **Injected-editingMode integration test (the amendment):** driving
    `loadAppGraph` with the host's `editingMode` field set to `'contenteditable'`
    splices eligible roots; set to `'textarea'` it is a no-op — both assertions
    from ONE host instance against an INJECTED mode (no U1 field required).

**Snapshot `children` (type-level):**
22. **Additive field typechecks:** a snapshot node carrying `children`
    (`[{ type: 'strong', content: 'x' }]`) and a snapshot node WITHOUT
    `children` both type-check against `RagSnapshotPayload.nodes`; the traversal
    (`buildTraversalEnvelope`) and the splice can read `node.children`
    (typecheck green).

### 2.2 Fail-states (TestWriter red set — documented fail-states)

1. **Non-member type:** `isRichEditableRoot('section', false)` (a string NOT in
   the `RagNodeType` union) → `false` (not in `EDITABLE_TYPES`; the function is
   total and never throws for any string type).
2. **`contenteditable` prop collision:** an ELIGIBLE root whose authored props
   ALREADY contain a `contenteditable` key (e.g. `contenteditable: 'false'` or
   `'plaintext-only'` authored on the store node) → the splice OVERWRITES it to
   `true` (`root.props.contenteditable === true`). The authored value is NOT
   preserved — the splice's `contenteditable: true` wins. (Must-hunt §5.)
3. **Ineligible roots MUST keep their textarea (no erroneous removal):** for
   every INELIGIBLE root in contenteditable mode, the textarea remains — a
   regression assertion that no ineligible root loses its fallback control. An
   ineligible root WITHOUT its textarea is a dangling-edit-control defect
   (must-hunt §5).
4. **Missing textarea on an eligible root (idempotent/partial envelope):** an
   eligible root whose `textarea-<ragId>` child is ALREADY absent (a repeated
   splice, or an envelope assembled without one) → the removal no-ops; the splice
   does NOT throw and still sets `contenteditable: true`.
5. **Cross-unit gate — the `textarea-<ragId>` element is absent in
   contenteditable mode:** for an eligible root in contenteditable mode, the
   `textarea-<ragId>` DOM element does NOT exist after load. Any Unit L
   textarea-only path (textareaBlur DOM read, textarea caret restore) MUST NOT
   read it (amendment 4). U3 pins the DOM absence; the read-guarding is Unit U4's
   wiring. A regression assertion that eligible roots expose NO
   `textarea-<ragId>` in the loaded graph. (Must-hunt §5.)
6. **Inconsistent multi-parent treatment is a defect:** a multi-parent RAG node
   must receive the SAME splice decision on every duplicate — a regression
   assertion that a multi-parent eligible node's duplicates ALL splice (and an
   ineligible one's duplicates ALL keep the textarea). One-removed-one-kept is a
   fail-state (must-hunt §5).
7. **A root that is BOTH a subtree root AND a doc-child:** such a node is
   materialized TWICE (once as its own section content[0], once nested — finding
   8, mutual-exclusion, traversal.ts). Both materializations MUST get the SAME
   splice treatment (same type + same `ownsDocChildren` → same verdict). A
   regression assertion that both materializations either both splice or both
   keep the textarea. (Must-hunt §5.)

---

## 3. Numeric / census claims

- **`RagNodeType` members:** **23** (the closed union at `src/main/rag-store.ts`
  §5.1): `h1`–`h6` (6), `p`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code` (7 →
  13), `strong`, `em`, `a`, `img` (4 → 17), `div` (18), `table`, `thead`, `tr`,
  `td`, `th` (5 → 23).
- **`EDITABLE_TYPES` members:** **9** — `h1`–`h6` (6), `p`, `blockquote`, `div`.
  **Discrepancy flag (doc-review gate):** the proposal/review prose
  (`editing-mode-toggle-review.md` §4-E, decision E) enumerated the set as
  `{h1,h2,h3,h4,h5,h6,p,blockquote,div}` but a §3-style count of "7" was cited
  in the U3 brief. The ENUMERATED set has **9** members. This spec pins **9**
  (the set definition is authoritative); the "7" is a miscount to be corrected by
  the proofreader/doc-reviewer, not enshrined.
- **Non-eligible `RagNodeType` members (fallback to textarea):** **14** —
  `ul`, `ol`, `li`, `pre`, `code` (5), `strong`, `em`, `a`, `img` (4 → 9),
  `table`, `thead`, `tr`, `td`, `th` (5 → 14). (9 + 14 = 23.)
- **Eligible-with-doc-children → fallback:** every `RagNodeType` member with
  `ownsDocChildren=true` is NOT eligible (0 eligible doc-child owners).
- **Textareas per eligible root (contenteditable mode):** removed — an eligible
  root renders 0 textareas (the contenteditable editor replaces it). Per
  INELIGIBLE root: 1 textarea (the fallback control, as in Unit L §5.10). A
  multi-parent node with N duplicates → N textareas ineligible, 0 if eligible.
- **`contenteditable` props (contenteditable mode):** 1 per eligible subtree
  root; 0 per ineligible root; 0 overall in textarea mode.
- **New functions/methods:** `isRichEditableRoot` (1 pure export),
  `EDITABLE_TYPES` (1 const export), `applyEditingMode` (1 host method),
  `this.editingMode` (1 host field), `EditingMode` (1 type).
- **Snapshot type additions:** 1 optional field (`children?`) on the
  `RagSnapshotPayload.nodes` element; 0 runtime changes (the handler already
  returns full `RagNode` objects including `children`).
- **The `contenteditable` prop key/value:** exactly 1 key (`contenteditable`) set
  to the boolean `true`.

---

## 4. Cross-references + section numbers

- **Proposal review:** `docs/specs/editing-mode-toggle-review.md` §4-C (decision
  **C** — the host `applyEditingMode` splice in `loadAppGraph`, after
  `setTextareaReadOnly`, before `recomputeBackRefs`), §4-E / decision **E** (the
  pure `isRichEditableRoot` gate + `EDITABLE_TYPES`), §4 (the supporting change
  — the snapshot `children` field), §3 amendment 4 (the cross-unit
  textarea gate — the `textarea-<ragId>` element does not exist in contenteditable
  mode), §3 amendment 8 (the `contenteditable` prop→attribute mapping pinned), §5
  (U3 row: `src/renderer/rich-eligibility.ts`, `src/renderer/sidebar-panes.ts`,
  `src/shared/types.ts`; the integration test against an injected editingMode;
  "U3's pure functions take editingMode injected (testable before U1)").
- **Traversal:** `src/main/traversal.ts` `buildSubtree` (~§5.1): the subtree root
  authoring (`id: 'rag-<ragId>'`, `data-rag-node-id`, `data-doc-head`), the inline
  children (`inline-<ragId>-<n>` — NOT `rag-`-prefixed), and the textarea child
  (`textarea-<ragId>`, always emitted). `collectSubtreeIds` (the `rag-`-prefixed
  child = doc-child subtree root rule that `ownsDocChildren` mirrors). Finding 8
  (a node BOTH a section AND a doc-child → materialized twice).
- **Unit L:** `docs/specs/unit-l-textarea-editing-ui.md` §5.1 (the traversal
  textarea authoring this splice removes for eligible roots), §5.3 (the
  `setTextareaReadOnly` post-assembly prop-mutation pattern + H4 idempotence the
  splice mirrors), §5.10 (the census — 1 textarea per materialized root), §5.11.
- **Unit K:** `docs/specs/unit-k-sidebar-panes-host.md` §5.1/§5.2 (the boot +
  re-derive wiring `loadAppGraph` rides), §5.4 (the operator settings pane — the
  `editingMode` field is NOT in U3, it is U1).
- **Unit C:** `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalResult` —
  the `envelope` the splice operates on), §5.3 (the back-reference map — the
  `recomputeBackRefs` that runs AFTER the splice), §5.5 (multi-parent duplicate
  coherence — the N duplicate roots the splice treats consistently).
- **Unit D:** `docs/specs/unit-d-editing.md` §5.4 M8 (`isEditable` — the eligible
  contenteditable root stays editable), §5.3 (the textarea `CaretState` the U4
  caret-restore replaces for rich nodes).
- **Unit M:** `docs/specs/unit-m-children-field.md` (the `RagNodeChild[]` inline
  children model — the primary rich-text case's children the contenteditable
  editor edits).
- **Unit R:** `docs/specs/unit-r-traversal-inline-children.md` §5.1 (the
  `inline-<ragId>-<n>` authoring the splice leaves untouched).
- **Unit U2:** `docs/specs/unit-u2-rich-decompose.md` (the blur decomposition the
  contenteditable editor's write-back path uses — landed before U3).
- **Unit U5 / U1 / U4:** the `setRichText` write-back op (U5), the `editingMode`
  operator setting + control + broadcast (U1 — which wires `this.editingMode` and
  `OperatorSettings.editingMode`), the contenteditable handlers/caret/IME +
  `editorBlur` (U4 — which consumes the spliced root + guards the textarea-less
  DOM per amendment 4). Cross-referenced; NOT implemented in U3.

---

## 5. Adversarial findings (must-hunt) + integration note

**Integration note (the amendment):** U3 includes the `loadAppGraph` splice
invocation AND an integration test against an INJECTED `editingMode` — the host's
private `this.editingMode` field is set to `'contenteditable'`/`'textarea'` and
`loadAppGraph` is driven to assert the splice (no U1 operator-settings field
required). The pure `isRichEditableRoot` is fully node-testable in isolation.

**Adversarial must-hunt list (the post-green adversarial reviewer MUST verify
these; the TestWriter writes the regression tests NOW from this list):**

- **ADR-1 — dangling backRef / dangling edit control:** an INELIGIBLE root whose
  textarea was ERRONEOUSLY removed (a splice bug) would leave the root without any
  editing control while its `rag-<ragId>` backRef remains → the edit controller
  thinks it editable but no control exists. Regression: every ineligible root in
  contenteditable mode keeps its textarea (§2.2 state 3). Conversely, an eligible
  root's REMOVED `textarea-<ragId>` must be absent from the recomputed backRefs
  (recompute runs AFTER the splice) — no dangling textarea reference.
- **ADR-2 — `contenteditable` prop collision:** an eligible root whose authored
  props already carry a `contenteditable` key must be overwritten to `true`
  (never left at a stale `'false'`/`'plaintext-only'` value that would defeat the
  editor). Regression: §2.2 state 2.
- **ADR-3 — root that is BOTH a subtree root AND a doc-child:** the two
  materializations (own section + nested) must get the SAME splice verdict
  (§2.2 state 7). A divergence (one splices, the other keeps the textarea) is a
  defect.
- **ADR-4 — the splice on a re-assemble (idempotence):** the splice must be
  idempotent across re-assembles (H4-style) — re-running on the same envelope (or
  after a fresh traversal that re-emits the textarea) must not double-remove,
  throw, or leave stale state (§2.1 state 19, §2.2 state 4).
- **ADR-5 — a root with no inline content (empty):** an eligible root with empty
  `content` and no children must still splice correctly (textarea removed,
  `contenteditable: true`, no throw) — an empty editor is valid (§2.1 state 16).
- **ADR-6 — `ownsDocChildren` detection accuracy (the `rag-`-prefix rule):** the
  detection must use EXACTLY the traversal's convention — a direct child whose
  authored `props.id` is a `rag-`-prefixed string is a doc-child owner. INLINE
  children (`inline-…`) and the textarea (`textarea-…`) must NEVER be mistaken
  for doc-children (an inline-children node is eligible — the PRIMARY case). A
  false `ownsDocChildren` would wrongly demote an eligible rich node to textarea.
- **ADR-7 — cross-unit textarea gate:** in contenteditable mode, eligible roots
  expose NO `textarea-<ragId>` in the loaded graph; the Unit L textarea-only paths
  (textareaBlur DOM read, textarea caret restore) must be gated (amendment 4).
  U3 pins the DOM absence; U4 wires the guard. A regression assertion that
  eligible roots expose no textarea element (§2.2 state 5).
- **ADR-8 — multi-parent duplicate consistency:** every duplicate of a multi-parent
  node must splice identically (§2.2 state 6). One-removed-one-kept is a defect.
- **ADR-9 — the splice never removes a non-textarea child:** the removal targets
  ONLY the child whose `props.id === 'textarea-<ragId>'`; a same-type-elsewhere
  or a different-authored-id child must not be removed by mistake.
- **ADR-10 — textarea mode is byte-for-byte inert:** `applyEditingMode(…,
  'textarea')` mutates NOTHING (§2.1 state 18). The safe default (decision D)
  must not regress the existing Unit L behavior.

### Adversarial findings (post-green, RCA-3) — HOST fixes, regression-tested

- **F1 (a-med, forward-looking for U1): the splice irreversibly mutates the
  shared cached traversal envelope.** `applyEditingMode` removes the
  `textarea-<ragId>` child in place from subtree-root objects that are the SAME
  objects `lastTraversalEnvelope` references (re-used by `refresh()` /
  `submitQuery`). Within contenteditable-stable mode this is idempotent, but the
  mutation is NOT reversible: a future contenteditable→textarea toggle that reuses
  the cached envelope (instead of a fresh re-derive) would leave textareas
  permanently gone. **Contract for U1: mode toggling MUST always trigger a fresh
  traversal (`reDerive`/`buildTraversalEnvelope`), never `refresh()` over the
  cached envelope.** Documented here; enforced in the U1 wiring.
- **F2 (minor, deferred to U4): caret over-delete on textarea→contenteditable
  transition.** The Unit L caret-restore loop deletes `caretNodes` entries even
  when the `textarea-<ragId>` element is absent (the contenteditable splice
  removed it), discarding a saved caret without restoring it. Adjacent to
  amendment 4. **Contract for U4: gate the textarea caret-restore by editing mode
  and let the contenteditable caret restore own those nodes** (a discriminated
  `CaretState`, decision B).
- **F3 (minor, FIXED): malformed-payload walk throws.** `setTextareaReadOnly` and
  `applyEditingMode` dereferenced `p.content[0]` without a guard → a payload with
  an empty `content` array threw a TypeError. Fix: both passes drive the walk
  with `walk(p.content?.[0])` and the `walk` helper starts with `if (!n) return`
  (the guard lives inside the walk helper, equivalent to guarding the root
  before recursing — cheap hardening; no behavior change for valid envelopes).
  Regression-tested (rich-splice "malformed payload does NOT throw").

**Recording rule (RCA-3):** after the unit's green, the read-only adversarial
sub-agent runs the must-hunt list above plus any further edge cases. Every HOST
finding (this repo's `src/`) is fixed here + regression-tested, and the finding
record is appended to this §5. Every PACKAGE finding (in
`node_modules/provident-ssr/` or the upstream `../Preempt-Providence/` — e.g. the
`contenteditable` prop→attribute mapping, amendment 8) is recorded in
`docs/defects.md` + `docs/HANDOFF.md`, never patched here. All findings expected
are HOST findings; none are catalogued unless a package defect surfaces.
