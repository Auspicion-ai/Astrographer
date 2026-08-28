# Spec — Unit R: Traversal Disambiguation of Inline vs Doc-Children

- **Status:** SPEC (the RICH-TEXT-EDITING-GATE must-fix "traversal disambiguation
  of inline vs doc-children"). Gate reference: `docs/decisions.md` row
  **RICH-TEXT-EDITING-GATE** (the resolved design: inline `strong`/`em`/`a`/`img`
  are held by a NEW `children` field on `RagNode`, NOT separate RAG nodes —
  preserves one-chunk-per-subtree), **SUBTREE-OWNERSHIP** (a RAG object owns a
  subtree; the back-reference is many-to-one), **DOC-CHILD** (a RAG object's
  subtree CONTAINS nested subtrees owned by its doc-children at their `order`
  positions), **TEXTAREA-RENDER-ONLY-OVERLAY** (the textarea is a render-only
  editing overlay present in the DOM render view, NOT in the markdown; its
  authored id is `textarea-<ragId>`, NOT `rag-`-prefixed). This unit lands the
  traversal disambiguation must-fix: `buildSubtree` renders the node's inline
  `children` (the Unit M `RagNodeChild[]` field) as child elements of the
  subtree root, and the disambiguation key — the `rag-` id prefix — separates
  inline children (part of the node's OWN subtree) from doc-children (separate
  RAG subtree roots). It does NOT implement the rich-text editing ops (Unit O),
  the retrieval indexing of inline `children` text (Unit Q), or paste-time
  sanitization (Unit S).
- **Scope:** the main-process traversal (`src/main/traversal.ts`) amendment that
  renders a RAG node's inline `children` (`RagNodeChild[]`) as child elements of
  the subtree root, and the precise disambiguation of inline children vs
  doc-children by the `rag-` id prefix. It pins: the inline-children rendering
  in `buildSubtree` (the exact `LegacyNodeData` element shape, the authored ids,
  the ordering relative to the textarea overlay and the doc-children), the
  disambiguation contract (inline children get NO `rag-` id, are NOT in
  `materialized`, get NO backRefs entry, get NO lineMap range; doc-children DO),
  the `collectSubtreeIds` behavior (inline children are collected into the
  node's OWN subtree), the `assignSubtreeRanges` behavior (inline children are
  part of the node's OWN lines, NOT recursed as doc-children), the UNCHANGED
  textarea overlay behavior (a node with inline children is a "rich subtree" →
  textarea; the textarea still binds to `node.content`), and the UNCHANGED
  `rebuildBackRefs` helper (routes through `buildTraversal`). This unit does
  NOT change the textarea authoring (Unit L), does NOT change the store format
  (Unit M), does NOT add an edit op (Unit O), does NOT index inline `children`
  text for retrieval (Unit Q), and does NOT sanitize paste (Unit S).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/main/traversal.ts` (`buildSubtree` — the inline-children rendering +
  the authored ids + the ordering; `collectSubtreeIds` — the inline-children
  collection; `assignSubtreeRanges` — the inline-children non-recursion) from
  §5.6/§5.7 before any implementation. The full red set is **27 tests**: 15
  happy-path (§5.6) + 8 fail-state (§5.7) + 4 adversarial regression (§3a
  F1/F2, F3, F4, F6).

---

## 1. What the proposal asks

1. **`buildSubtree` must render the node's inline `children`** (the Unit M
   `RagNodeChild[]` field) as child elements of the subtree root, so they appear
   in the DOM render. Each inline child maps to a provident `LegacyNodeData`
   element: `strong`/`em`/`a`/`img` → the same element type, with `content` and
   the child's `props` (e.g. `href`/`src`/`alt`).
2. **Pin the exact authored ids for inline children** — they must NOT be
   `rag-`-prefixed (that prefix marks a doc-child subtree root), and they must
   NOT collide with the textarea's `textarea-<ragId>` id.
3. **Pin the ordering** — where the inline children sit relative to the textarea
   overlay and the doc-children.
4. **DISAMBIGUATION (the core of this unit):** inline children are rendered
   INLINE within the node's subtree and are NOT separate RAG subtree roots —
   they get NO `rag-` id, are NOT added to the `materialized` set, get NO
   backRefs entry, and get NO lineMap range. Doc-children ARE separate RAG
   subtree roots (they carry the stable `rag-<id>` id, are in `materialized`,
   get their own backRefs entry + lineMap range). The disambiguation key is the
   `rag-` id prefix.
5. **`collectSubtreeIds`** — inline children are part of the node's OWN subtree
   (they are collected, since they are not `rag-`-prefixed). Confirm and pin this
   (the existing logic already collects non-`rag-` children).
6. **`assignSubtreeRanges`** — inline children are part of the node's OWN lines
   (they are NOT recursed as doc-children, since they are not `rag-`-prefixed).
   Confirm and pin this.
7. **The textarea overlay behavior is UNCHANGED** — a node with inline children
   is a "rich subtree" → textarea; the textarea still binds to `node.content`.
   Pin that Unit R does NOT change the textarea authoring.
8. **The `rebuildBackRefs` helper is unchanged** — it routes through
   `buildTraversal`.

## 2. Feasibility verdict

**Feasible — a purely additive amendment to the already-landed
`src/main/traversal.ts` (Unit C + Unit L), grounded in the existing
`buildSubtree` authoring path and the existing `rag-`-prefix disambiguation
already used by `collectSubtreeIds` and `assignSubtreeRanges`.**

- **Inline-children rendering:** `buildSubtree` already authors each RAG subtree
  root as a `LegacyNodeData` content root with a `children` array (the textarea
  overlay + the doc-children subtrees). Amending it to prepend the node's inline
  `children` (`RagNodeChild[]`) as child elements is pure provident-ssr data
  authoring — each inline child maps to a `LegacyNodeData` element of the same
  type (`strong`/`em`/`a`/`img`) with `content` + the child's `props` merged.
  No engine gap.
- **The `rag-`-prefix disambiguation already exists:** `collectSubtreeIds`
  (Unit C §5.2 rule 6) already stops at a `rag-`-prefixed child (a doc-child
  subtree root) and collects every non-`rag-` child into the node's own subtree;
  `assignSubtreeRanges` (Unit C §5.6) already recurses ONLY into `rag-`-prefixed
  children. The inline children (authored id `inline-<ragId>-<index>`, NOT
  `rag-`-prefixed) fall into the existing non-`rag-` bucket automatically — the
  disambiguation is FREE once the inline children are authored with a
  non-`rag-` id. No new disambiguation machinery is needed.
- **The textarea overlay is untouched:** the textarea authoring (Unit L §5.1)
  is unchanged — the `textarea-<ragId>` id, the `value: node.content`, the
  handlers, the NO-`readOnly`-prop rule. Unit R only inserts the inline children
  into the subtree root's `children` array.
- **`rebuildBackRefs` is unchanged:** it routes through `buildTraversal`, so it
  inherits the inline-children disambiguation automatically (no code change).

No engine/foundation gap blocks this unit. The inline-children rendering, the
authored-id scheme, the ordering, and the disambiguation are all
**project-specific** (compose `buildSubtree` + the existing `rag-`-prefix
disambiguation). No handoff item is opened by this unit. ENG-GAP-1
(MarkdownAdapter `data-node-id`, D7) is SHELVED 2026-08-26 (markdown is
export-only; the host-side line→node map covers it — see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The inline-children rendering in `buildSubtree` (each `RagNodeChild` → a `LegacyNodeData` element) | Project-specific (amends `buildTraversal`'s `buildSubtree`) | Low cost; the inline `strong`/`em`/`a`/`img` appear in the DOM render (one-chunk-per-subtree preserved). |
| The inline-children authored-id scheme (`inline-<ragId>-<index>`) | Project-specific | Low cost; a stable, non-`rag-`-prefixed, non-colliding id per inline child. |
| The ordering (inline children → textarea → doc-children) | Project-specific | Low cost; the node's own content (text + inline formatting) stays contiguous at the top of the subtree. |
| The disambiguation (inline children NOT in `materialized`/backRefs/lineMap; doc-children ARE) | Project-specific (rides the existing `rag-`-prefix logic) | Low cost; the `rag-`-prefix disambiguation already exists in `collectSubtreeIds`/`assignSubtreeRanges`. |
| The `collectSubtreeIds`/`assignSubtreeRanges` confirmation | Project-specific (no code change — the existing non-`rag-` bucket) | Zero cost; the inline children fall into the existing non-`rag-` bucket automatically. |

No engine gap. The rich-text editing ops (Unit O), the retrieval indexing of
inline `children` text (Unit Q), and paste-time sanitization (Unit S) are LATER
slices (the remaining RICH-TEXT-EDITING-GATE must-fix items) — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — an inline child's authored id must NOT be `rag-`-prefixed.** A
  `rag-`-prefixed inline child would be treated as a doc-child subtree root by
  `collectSubtreeIds` (excluded from the node's backRefs entry) and by
  `assignSubtreeRanges` (recursed as a doc-child, minting a spurious lineMap
  range). The pinned id `inline-<ragId>-<index>` is NOT `rag-`-prefixed.
- **A2 — an inline child's authored id must NOT collide with the textarea's
  `textarea-<ragId>` id.** The pinned id `inline-<ragId>-<index>` is distinct
  from `textarea-<ragId>` (different prefix), so no collision.
- **A3 — a node with `children: []` (an empty array) renders NO inline
  children** — equivalent to a node without inline children (the empty array
  maps to an empty inline-children list).
- **A4 — a node with `children: undefined` renders NO inline children** — the
  plain-text v1 default (Unit M §5.1).
- **A5 — an inline child's `props` (e.g. `href`/`src`/`alt`) are merged into the
  element's props, with the authored `id`/`data-rag-node-id` taking precedence**
  (the same merge discipline as the subtree root's own props — Unit C finding 7).
- **A6 — inline children are NOT added to `materialized`, get NO backRefs entry,
  and get NO lineMap range** — they are part of the node's OWN subtree, not
  separate RAG subtree roots.
- **A7 — the inline children's markdown lines (if any) are part of the node's
  OWN line range** — `renderSubtreeMarkdown` renders the subtree (including the
  inline children) as one markdown chunk, which maps to the node's own range;
  the inline children get NO separate range.

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-28, Unit R):** all findings are HOST findings,
addressed + regression-tested in the same pass:

- **F1/F2 (LOW, known behavior — documented, regression-tested):** a multi-parent
  duplicate RAG node (≥2 `parent-child` parents) and a section+doc-child
  double-materialized node each render the inline children with the SAME authored
  id `inline-<ragId>-<index>` in every copy (duplicate ids across the envelope).
  This mirrors the existing `rag-<id>` subtree-root collision and has NO
  functional consequence today (inline children are never looked up by id — not
  in `backRefs`, not in `lineMap`, no handler targets them). Documented as known
  behavior. The regression test covers the multi-parent duplicate case (the
  duplicate-id behavior is asserted as present, not as an error); the
  section+doc-child double-materialized case is documented known behavior, not
  separately regression-tested.
- **F3 (LOW, test gap — fixed):** no test exercised a node with MANY inline
  children. Added a regression test: a node with 20 inline `strong` children →
  all inline ids are distinct and ordered (`inline-<ragId>-0` … `-19`), and the
  node's lineMap range still covers all their markdown lines.
- **F4 (LOW, test gap — fixed):** the A5 merge discipline (an inline child whose
  own `props` carry `id`/`data-rag-node-id` must NOT break the disambiguation)
  was untested. Added a regression test: a child with `props: { id: 'rag-foo',
  'data-rag-node-id': 'other' }` → the authored `inline-<ragId>-<index>` id and
  the owning `ragId` take precedence.
- **F5 (INFORMATIONAL, deferred to Unit S):** inline `a`/`img` props are rendered
  unsanitized (the store validates shape + prototype-pollution keys only, not the
  `href`/`src` content). This is explicitly deferred to Unit S (paste-time
  sanitization) per the spec §5.7 fail-state 8 — NOT a Unit R regression.
- **F6 (LOW, test gap — fixed):** the family-pre-order fallback path
  (`nestDocChildren: false`) with a node carrying BOTH inline children AND
  doc-children was untested. Added a regression test: the inline children still
  render, and the doc-children become separate sections.

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** for the rich-text editing proposal
(`docs/decisions.md` row **RICH-TEXT-EDITING-GATE**, 2026-08-28). The
consolidated verdicts:

| Review | Verdict |
| --- | --- |
| Validity | VALID-WITH-AMENDMENTS |
| Critique | UNSOUND (as written) |
| Architecture | SOUND-WITH-AMENDMENTS |
| Change-analysis | PROCEED-WITH-AMENDMENTS |

The resolved design amendments that THIS unit pins (each cross-referenced to the
section that resolves it):

- **R1 — inline `strong`/`em`/`a`/`img` are held by a NEW `children` field on
  `RagNode`, NOT separate RAG nodes** (§5.1/§5.2): preserves one-chunk-per-subtree.
  The traversal renders them as child elements of the subtree root, NOT as
  separate RAG subtree roots.
- **R2 — the traversal disambiguation of inline vs doc-children is the `rag-`
  id prefix** (§5.2): inline children (authored id `inline-<ragId>-<index>`, NOT
  `rag-`-prefixed) are part of the node's OWN subtree; doc-children (authored id
  `rag-<id>`) are separate RAG subtree roots. The `rag-` prefix is the
  disambiguation key.
- **R3 — the textarea overlay is UNCHANGED** (§5.5): a node with inline children
  is a "rich subtree" → textarea; the textarea still binds to `node.content`.
  Unit R does NOT change the textarea authoring.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins inline
  `strong`/`em`/`a`/`img` on a NEW `children` field on `RagNode` (not separate
  RAG nodes — preserves one-chunk-per-subtree). This unit lands the traversal
  disambiguation must-fix: the traversal renders the inline `children` as child
  elements of the subtree root, disambiguated from doc-children by the `rag-`
  id prefix.
- **SUBTREE-OWNERSHIP (consumed):** a RAG object owns a subtree; the
  back-reference is many-to-one. The inline `children` are part of the node's
  OWN subtree (collected into the node's backRefs entry); the doc-children are
  separate RAG subtree roots (each with its own backRefs entry).
- **DOC-CHILD (consumed):** a RAG object's subtree CONTAINS nested subtrees
  owned by its doc-children at their `order` positions. The doc-children carry
  the stable `rag-<id>` id and are separate RAG subtree roots; the inline
  children do NOT.
- **TEXTAREA-RENDER-ONLY-OVERLAY (consumed):** the textarea is a render-only
  editing overlay present in the DOM render view, NOT in the markdown; its
  authored id is `textarea-<ragId>`, NOT `rag-`-prefixed. Unit R does NOT change
  the textarea authoring.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is authoritative; the
  provident graph is a transient render materialization. The inline `children`
  are read from the store (already validated by Unit M) and rendered as a
  projection.

## 5. The exhaustive contract

### 5.1 The inline-children rendering in `buildSubtree`

`buildSubtree` (in `src/main/traversal.ts`) is amended to render the node's
inline `children` (the Unit M `RagNodeChild[]` field) as child elements of the
subtree root. Each inline child maps to a provident `LegacyNodeData` element of
the SAME type (`strong`/`em`/`a`/`img`), with `content` and the child's `props`
merged.

**The amended `buildSubtree` return shape (pinned):**

```ts
// src/main/traversal.ts — the amended buildSubtree return (the RAG subtree
// root). The subtree root KEEPS its semantic type + its `content` + its
// doc-children nested; the node's inline `children` (RagNodeChild[]) are
// rendered as child elements of the subtree root; a `textarea` child carries
// the RAG node's content (the render-only editing overlay, Unit L — UNCHANGED).
return {
  type: node.type,                       // the RAG node's type (e.g. 'p')
  props: {
    ...(node.props ?? {}),               // the RAG node's own props (e.g. href/src)
    id: `rag-${ragId}`,                  // the stable authored id (the back-reference key)
    'data-rag-node-id': ragId,           // the RAG node id the handlers resolve
  },
  placement: { targetPlacement: [zoneName] },
  content: node.content,                 // KEPT — the subtree root's content stays in the
                                         // envelope so the markdown/line→node map still
                                         // renders the text (TEXTAREA-RENDER-ONLY-OVERLAY).
  children: [
    // 1. The node's inline children (RagNodeChild[]) — rendered as child
    //    elements of the subtree root, INLINE within the node's own content.
    //    Each maps to a provident LegacyNodeData element of the SAME type
    //    (strong/em/a/img), with `content` + the child's `props` merged.
    //    Authored id: `inline-<ragId>-<index>` — NOT `rag-`-prefixed (that
    //    prefix marks a doc-child subtree root) and NOT colliding with the
    //    textarea's `textarea-<ragId>` id.
    ...(node.children ?? []).map((child, index) => ({
      type: child.type,                  // 'strong' | 'em' | 'a' | 'img' (RagNodeChildType)
      props: {
        ...(child.props ?? {}),          // the child's props (e.g. href/src/alt) merged
        id: `inline-${ragId}-${index}`,  // the inline child's OWN authored id (NOT rag-)
        'data-rag-node-id': ragId,       // the RAG node id (consistent with the root + textarea)
      },
      content: child.content,            // the inline child's text content
    })),
    // 2. The textarea overlay (Unit L §5.1 — UNCHANGED by this unit).
    {
      type: 'textarea',
      props: {
        id: `textarea-${ragId}`,         // the textarea's OWN authored id (NOT rag-)
        'data-rag-node-id': ragId,
        value: node.content,             // the bound content (the RAG node's content)
        // NOTE: NO `readOnly` prop is authored (adversarial H1, Unit L §5.1).
      },
      handlers: [
        { name: 'rag-textarea-input', event: 'input' },
        { name: 'rag-textarea-blur', event: 'blur' },
      ],
    },
    // 3. The doc-children subtrees (nested at their `order` positions).
    ...children,                         // the local `children` array (the doc-children subtrees)
  ],
}
```

**Inline-children rendering rules (pinned):**

- **Each inline child maps to a `LegacyNodeData` element of the SAME type** as
  the child's `RagNodeChildType` (`strong`/`em`/`a`/`img`). A `strong` child →
  a `{ type: 'strong' }` element; an `em` child → a `{ type: 'em' }` element; an
  `a` child → a `{ type: 'a' }` element; an `img` child → a `{ type: 'img' }`
  element.
- **The element's `content` is the child's `content`** (`RagNodeChild.content`).
- **The child's `props` are merged into the element's props**, with the authored
  `id` and `data-rag-node-id` taking precedence (the same merge discipline as
  the subtree root's own props — Unit C finding 7). E.g. an `a` child with
  `props: { href: 'https://x' }` → the element's props include `href`; an `img`
  child with `props: { src, alt }` → the element's props include `src`/`alt`.
- **The inline children are rendered for ANY node that has a non-empty
  `children` array** (the `RagNodeChild[]` field), regardless of the node's
  `type`. A node with `children: []` or `children: undefined` renders NO inline
  children (A3/A4).
- **The inline-children rendering is independent of `nestDocChildren`** — it
  applies in BOTH the valid-doc-flow path (`nestDocChildren: true`) and the
  family-pre-order fallback path (`nestDocChildren: false`). The inline children
  are the node's OWN content; the doc-children nesting is a separate concern.

**The authored id scheme (pinned):**

- Each inline child's authored id is **`inline-<ragId>-<index>`**, where
  `<ragId>` is the owning RAG node id and `<index>` is the 0-based index of the
  child within the node's `children` array (the `RagNodeChild[]` field).
- The id is **NOT `rag-`-prefixed** — a `rag-`-prefixed child is treated as a
  doc-child subtree root by `collectSubtreeIds` (excluded from the node's
  backRefs entry) and by `assignSubtreeRanges` (recursed as a doc-child, minting
  a spurious lineMap range). The `inline-` prefix is NOT `rag-`-prefixed (A1).
- The id is **distinct from the textarea's `textarea-<ragId>` id** — the
  `inline-` prefix does not collide with the `textarea-` prefix (A2).
- The id is **unique within the node's subtree** — the `<index>` disambiguates
  multiple inline children of the same node.

**The ordering (pinned):**

The subtree root's `children` array is ordered as follows:

1. **The inline children** (the node's own inline formatting content) — FIRST,
   immediately after the subtree root's own `content`. Rationale: the inline
   children are part of the node's OWN content (they render inline within the
   node's text), so they belong adjacent to the content, before the editing
   overlay and before the nested doc-children.
2. **The textarea overlay** (the render-only editing overlay, Unit L) — SECOND.
3. **The doc-children subtrees** (nested at their `order` positions) — LAST.

The ordering is a DOM-render concern only: `collectSubtreeIds` collects all
non-`rag-` children regardless of order, and `assignSubtreeRanges` recurses only
into `rag-`-prefixed children regardless of order. The ordering does NOT affect
the backRefs map or the lineMap.

### 5.2 The disambiguation contract (inline vs doc-children)

The core of this unit. Inline children and doc-children are disambiguated by the
`rag-` id prefix.

**The disambiguation table (pinned):**

| Property | Inline children (`RagNodeChild[]`) | Doc-children (RAG subtree roots) |
| --- | --- | --- |
| Authored id | `inline-<ragId>-<index>` (NOT `rag-`-prefixed) | `rag-<id>` (the stable `rag-` prefix) |
| Rendered as | child elements of the node's subtree root (INLINE within the node's own content) | separate RAG subtree roots nested at their `order` positions |
| In the `materialized` set | **NO** | **YES** |
| backRefs entry | **NO** (no `Map` entry keyed by an inline child's id) | **YES** (its own entry) |
| lineMap range | **NO** (no range keyed by an inline child's id) | **YES** (its own range) |
| Collected by `collectSubtreeIds` | **YES** (part of the node's OWN subtree) | **NO** (stops at each doc-child subtree root) |
| Recursed by `assignSubtreeRanges` | **NO** (part of the node's OWN lines) | **YES** (recursed as doc-children) |

**Disambiguation rules (pinned):**

- **The disambiguation key is the `rag-` id prefix.** A child whose authored id
  is `rag-`-prefixed is a doc-child subtree root; a child whose authored id is
  NOT `rag-`-prefixed (e.g. `inline-<ragId>-<index>`, `textarea-<ragId>`) is part
  of the node's OWN subtree.
- **Inline children are NOT separate RAG subtree roots:** they get NO `rag-` id
  (their authored id is `inline-<ragId>-<index>`), are NOT added to the
  `materialized` set, get NO backRefs entry, and get NO lineMap range. They are
  rendered INLINE within the node's subtree.
- **Doc-children ARE separate RAG subtree roots:** they carry the stable
  `rag-<id>` id, ARE in the `materialized` set, get their own backRefs entry,
  and get their own lineMap range.
- **The `materialized` set is NOT polluted by inline children:** `buildSubtree`
  adds ONLY the RAG node id (`ragId`) to `materialized` (the existing behavior);
  the inline children are NOT added. The `materialized` set therefore contains
  exactly the RAG subtree roots (sections + nested doc-children + multi-parent
  duplicates), never an inline child.
- **The backRefs map is NOT polluted by inline children:** the backRefs map
  (`Map<ragNodeId, nodeId[]>`) has one entry per RAG object. The inline
  children's minted node ids are part of the owning node's entry (collected by
  `collectSubtreeIds` — §5.3); there is NO separate entry keyed by an inline
  child's id.
- **The lineMap is NOT polluted by inline children:** the lineMap
  (`LineNodeMap.ranges`) has one range per RAG object. The inline children's
  markdown lines (if any) are part of the owning node's range (§5.4); there is NO
  separate range keyed by an inline child's id.

### 5.3 `collectSubtreeIds` (inline children collected into the node's OWN subtree)

`collectSubtreeIds` (in `src/main/traversal.ts`) collects a translated node's
subtree node ids (root-first, tree order), STOPPING at each doc-child subtree
root (a child carrying the stable authored `rag-<id>` id). The existing logic
already collects every non-`rag-` child. The inline children (authored id
`inline-<ragId>-<index>`, NOT `rag-`-prefixed) fall into the existing non-`rag-`
bucket automatically.

**`collectSubtreeIds` behavior (pinned):**

- **The inline children are collected into the node's OWN subtree.** A child
  whose authored id is NOT `rag-`-prefixed (e.g. `inline-<ragId>-<index>`,
  `textarea-<ragId>`) is recursed into and its minted node id is pushed onto the
  node's `out` array. The inline children's minted node ids are therefore part
  of the owning node's backRefs entry.
- **The inline children are NOT doc-child subtree roots.** A child whose
  authored id IS `rag-`-prefixed is a doc-child subtree root — `collectSubtreeIds`
  does NOT descend into it (its nodes belong to the doc-child's own backRefs
  entry). The inline children are NOT `rag-`-prefixed, so they ARE descended
  into.
- **The existing logic is UNCHANGED** — the `rag-`-prefix check
  (`typeof pid === 'string' && pid.startsWith('rag-')`) already handles the
  inline children correctly (they are not `rag-`-prefixed, so they are
  collected). No code change to `collectSubtreeIds` is required by this unit.

**The backRefs entry for a node with inline children (pinned):** the owning
node's backRefs entry (`Map<ragNodeId, nodeId[]>`) contains the minted node ids
of: the subtree root itself, the inline children, the textarea overlay, and any
non-`rag-` children — but EXCLUDES the doc-children's nodes (which stop the
recursion). The inline children's minted node ids are part of the owning node's
entry.

### 5.4 `assignSubtreeRanges` (inline children part of the node's OWN lines)

`assignSubtreeRanges` (in `src/main/traversal.ts`) assigns REAL markdown line
ranges to a RAG subtree and its nested doc-children. The existing logic recurses
ONLY into `rag-`-prefixed children (a doc-child subtree root). The inline
children (authored id `inline-<ragId>-<index>`, NOT `rag-`-prefixed) are NOT
recursed as doc-children — they are part of the node's OWN lines.

**`assignSubtreeRanges` behavior (pinned):**

- **The inline children are part of the node's OWN lines.** `renderSubtreeMarkdown`
  renders the subtree (including the inline children) as one markdown chunk; the
  chunk's line count maps to the node's own range. The inline children get NO
  separate lineMap range.
- **The inline children are NOT recursed as doc-children.** The recursion filter
  (`typeof cid === 'string' && cid.startsWith('rag-')`) excludes the inline
  children (their authored id `inline-<ragId>-<index>` is NOT `rag-`-prefixed),
  so they are NOT recursed and do NOT mint a separate range.
- **The textarea overlay is also NOT recursed** (its authored id
  `textarea-<ragId>` is NOT `rag-`-prefixed) — the existing behavior (Unit C
  Conflict C resolution). The textarea is a render-only overlay NOT in the
  markdown, so it contributes no lines.
- **The existing logic is UNCHANGED** — the `rag-`-prefix filter already handles
  the inline children correctly (they are not `rag-`-prefixed, so they are not
  recursed). No code change to `assignSubtreeRanges` is required by this unit.

**The lineMap range for a node with inline children (pinned):** the node's
lineMap range (`{ ragNodeId, startLine, endLine }`) covers the node's OWN lines,
which include the inline children's markdown lines (if any). The inline children
get NO separate range.

### 5.5 The textarea overlay (UNCHANGED) + `rebuildBackRefs` (unchanged)

**The textarea overlay behavior is UNCHANGED by this unit (pinned):**

- A node with inline children is a "rich subtree" → textarea (the editing-mode
  selection, a later slice — the rich-text contenteditable machinery). The
  textarea is still authored for EVERY materialized RAG subtree root (Unit L
  §5.1), including nodes with inline children.
- The textarea still binds to `node.content` (the `value` prop is the RAG
  node's content — the plain text, NOT the inline children).
- The textarea's authored id is still `textarea-<ragId>` (NOT `rag-`-prefixed).
- The textarea's `data-rag-node-id` prop, the `rag-textarea-input`/
  `rag-textarea-blur` handlers, and the NO-`readOnly`-prop rule are all UNCHANGED
  (Unit L §5.1).
- The textarea is a RENDER-ONLY editing overlay present in the DOM render view,
  NOT in the markdown (TEXTAREA-RENDER-ONLY-OVERLAY). The inline children ARE in
  the markdown (they are part of the node's content); the textarea is NOT.

**`rebuildBackRefs` is unchanged (pinned):**

- `rebuildBackRefs` (in `src/main/traversal.ts`) routes through `buildTraversal`
  (Unit C §5.3). It inherits the inline-children disambiguation automatically —
  the inline children are collected into the owning node's backRefs entry
  (§5.3), and the doc-children get their own entries. No code change to
  `rebuildBackRefs` is required by this unit.

### 5.6 Happy-path states (TestWriter red set — valid paths; 15 states)

1. **Inline-children rendering happy:** a RAG node with
   `children: [{ type: 'strong', content: 'bold' }]` → `buildSubtree` renders the
   subtree root with a `{ type: 'strong', props: { id: 'inline-<ragId>-0',
   'data-rag-node-id': ragId }, content: 'bold' }` child element, in addition to
   the textarea overlay and the doc-children.
2. **All four inline child types:** a RAG node with `children: [{ type: 'strong',
   content: 'b' }, { type: 'em', content: 'i' }, { type: 'a', content: 'l',
   props: { href: 'https://x' } }, { type: 'img', content: '', props: { src:
   'x.png', alt: 'x' } }]` → four child elements of the same types, with the
   `content` and the `props` merged (the `a` element carries `href`; the `img`
   element carries `src`/`alt`).
3. **Authored ids:** each inline child's authored id is `inline-<ragId>-<index>`
   (0-based index within the node's `children` array), NOT `rag-`-prefixed, and
   distinct from the textarea's `textarea-<ragId>` id.
4. **Ordering:** the subtree root's `children` array is ordered [inline children,
   textarea overlay, doc-children subtrees].
5. **Node WITHOUT inline children (plain-text, the v1 default):** a RAG node with
   `children: undefined` → NO inline children rendered; the subtree root's
   `children` array is [textarea overlay, doc-children subtrees] (the pre-Unit-R
   shape).
6. **Empty `children` array:** a RAG node with `children: []` → NO inline
   children rendered (equivalent to no inline children); the subtree root's
   `children` array is [textarea overlay, doc-children subtrees].
7. **Disambiguation — inline children NOT in `materialized`:** a RAG node with
   inline children → `buildSubtree` adds ONLY the RAG node id to `materialized`;
   the inline children are NOT added.
8. **Disambiguation — inline children get NO backRefs entry:** a RAG node with
   inline children → the backRefs map has ONE entry for the RAG node (its owned
   subtree node ids, INCLUDING the inline children's minted node ids); there is
   NO separate entry keyed by an inline child's id.
9. **Disambiguation — inline children get NO lineMap range:** a RAG node with
   inline children → the lineMap has ONE range for the RAG node (its own lines,
   INCLUDING the inline children's markdown lines); there is NO separate range
   keyed by an inline child's id.
10. **`collectSubtreeIds` collects inline children:** a RAG node with inline
    children → `collectSubtreeIds` collects the inline children's minted node ids
    into the node's backRefs entry (they are NOT `rag-`-prefixed, so they are
    descended into).
11. **`assignSubtreeRanges` does NOT recurse inline children:** a RAG node with
    inline children → `assignSubtreeRanges` does NOT recurse into the inline
    children (they are NOT `rag-`-prefixed); the inline children's markdown lines
    are part of the node's OWN range.
12. **Doc-children still disambiguated:** a RAG node with BOTH inline children
    AND doc-children → the inline children are part of the node's OWN subtree
    (collected into its backRefs entry, part of its lineMap range); the
    doc-children are separate RAG subtree roots (each in `materialized`, each
    with its own backRefs entry + lineMap range).
13. **Textarea UNCHANGED:** a RAG node with inline children → the textarea
    overlay is still authored (id `textarea-<ragId>`, `value: node.content`, the
    handlers, NO `readOnly` prop); the textarea still binds to `node.content`.
14. **`rebuildBackRefs` unchanged:** `rebuildBackRefs` on a snapshot with a node
    with inline children → returns the backRefs map with the inline children's
    minted node ids in the owning node's entry (inherited via `buildTraversal`).
15. **Fallback path:** a RAG node with inline children in a document whose
    doc-flow validation FAILS (family-pre-order fallback, `nestDocChildren:
    false`) → the inline children are STILL rendered (the inline-children
    rendering is independent of `nestDocChildren`).

### 5.7 Fail-states (TestWriter red set — documented fail-states; 8 states)

1. **An inline child authored with a `rag-`-prefixed id** (e.g. `rag-inline-...`)
   → the child is treated as a doc-child subtree root by `collectSubtreeIds`
   (excluded from the node's backRefs entry) and by `assignSubtreeRanges`
   (recursed as a doc-child, minting a spurious lineMap range). The pinned id
   `inline-<ragId>-<index>` is NOT `rag-`-prefixed, so this MUST NOT happen; a
   test asserts the inline children's authored ids are NOT `rag-`-prefixed (A1).
2. **An inline child's authored id colliding with the textarea's
   `textarea-<ragId>` id** → the two elements would share an authored id. The
   pinned id `inline-<ragId>-<index>` is distinct from `textarea-<ragId>`, so
   this MUST NOT happen; a test asserts the inline children's authored ids are
   distinct from the textarea's id (A2).
3. **An inline child added to `materialized`** → the `materialized` set would
   contain a non-RAG-subtree-root id, breaking the reconciliation set for
   backRefs + lineMap. The inline children MUST NOT be added to `materialized`;
   a test asserts `materialized` contains ONLY RAG subtree roots (A6).
4. **An inline child minting a backRefs entry** → the backRefs map would contain
   a spurious entry keyed by an inline child's id. The inline children MUST NOT
   get a backRefs entry; a test asserts the backRefs map has one entry per RAG
   object, never an inline child (A6).
5. **An inline child minting a lineMap range** → the lineMap would contain a
   spurious range keyed by an inline child's id. The inline children MUST NOT
   get a lineMap range; a test asserts the lineMap has one range per RAG object,
   never an inline child (A6/A7).
6. **`collectSubtreeIds` descending into a `rag-`-prefixed inline child** → the
   child would be treated as a doc-child subtree root and excluded from the
   node's backRefs entry. The inline children are NOT `rag-`-prefixed, so this
   MUST NOT happen; a test asserts the inline children are collected into the
   node's OWN subtree (A1).
7. **`assignSubtreeRanges` recursing into a `rag-`-prefixed inline child** → the
   child would be recursed as a doc-child, minting a spurious lineMap range. The
   inline children are NOT `rag-`-prefixed, so this MUST NOT happen; a test
   asserts the inline children are part of the node's OWN lines (A1).
8. **A node with a malformed `children` array reaching the traversal** → the
   store's write-time validation (Unit M §5.4) rejects it at write (throw) and
   skips it at boot; the traversal reads only validated nodes from the store, so
   a malformed `children` array never reaches `buildSubtree`. This is a
   store-level fail-state (Unit M), NOT a traversal fail-state — the traversal
   does NOT re-validate `children` (it reads the already-validated store).

### 5.8 Census / numeric claims

- **Inline child element types:** 4 — `strong`, `em`, `a`, `img` (the closed
  `RagNodeChildType` union, Unit M §5.1). Each maps to a `LegacyNodeData` element
  of the SAME type.
- **Inline-children authored-id scheme:** 1 — `inline-<ragId>-<index>` (0-based
  index within the node's `children` array). NOT `rag-`-prefixed; distinct from
  the textarea's `textarea-<ragId>` id.
- **Subtree-root `children` ordering:** 3 slots — [inline children, textarea
  overlay, doc-children subtrees].
- **Inline children in `materialized`:** 0 — the inline children are NOT added to
  the `materialized` set (only RAG subtree roots are).
- **Inline children backRefs entries:** 0 — the inline children get NO backRefs
  entry (their minted node ids are part of the owning node's entry).
- **Inline children lineMap ranges:** 0 — the inline children get NO lineMap
  range (their markdown lines are part of the owning node's range).
- **`collectSubtreeIds` recursion:** the inline children are collected into the
  node's OWN subtree (they are NOT `rag-`-prefixed); the doc-children are NOT
  (they ARE `rag-`-prefixed).
- **`assignSubtreeRanges` recursion:** the inline children are NOT recursed (they
  are NOT `rag-`-prefixed); the doc-children ARE recursed (they ARE
  `rag-`-prefixed).
- **Textarea overlays:** 1 per materialized RAG subtree root (UNCHANGED — Unit L
  §5.10). A node with inline children still gets its textarea.
- **`rebuildBackRefs`:** unchanged — routes through `buildTraversal` (Unit C
  §5.3).
- **The disambiguation key:** 1 — the `rag-` id prefix (a `rag-`-prefixed child
  is a doc-child subtree root; a non-`rag-`-prefixed child is part of the node's
  OWN subtree).

### 5.9 Cross-references

- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalResult` — the
  `envelope` + `backRefs` + `lineMap`), §5.2 (the envelope shape — the stable
  authored id `rag-<ragNodeId>` + the doc-child nesting), §5.3 (the back-reference
  map — the SOLE authoritative carrier the inline children's minted node ids flow
  into), §5.6 (the coarse line→node map — the inline children's lines are part of
  the node's own range), §5.7/§5.8 (the happy-path/fail-state sets this unit
  amends), §5.9 (the census — the `materialized` set + the backRefs map + the
  lineMap).
- Unit L: `docs/specs/unit-l-textarea-editing-ui.md` §5.1 (the textarea authoring
  this unit does NOT change — the `textarea-<ragId>` id, the `value: node.content`,
  the handlers, the NO-`readOnly`-prop rule), §5.10 (the census — the textarea
  overlays).
- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/
  `RagNodeChildType` types this unit renders — the `children?: RagNodeChild[]`
  field on `RagNode`), §5.4 (the write-time validation that guarantees the
  traversal reads only validated `children`), §5.8 (the census — the
  `RagNodeChildType` union members).
- Unit O (future): the rich-text editing ops (`setProps`/`setSubtree`/`setType`)
  that write the `children` field the traversal renders. NOT this unit.
- Unit Q (future): the retrieval indexing of inline `children` text. NOT this
  unit.
- Unit S (future): paste-time sanitization. NOT this unit.
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  this unit pins: inline `strong`/`em`/`a`/`img` on a NEW `children` field, NOT
  separate RAG nodes; the traversal disambiguation of inline vs doc-children).
- Decisions: `docs/decisions.md` rows **SUBTREE-OWNERSHIP** (the inline children
  are part of the node's OWN subtree; the doc-children are separate RAG subtree
  roots), **DOC-CHILD** (the doc-children carry the stable `rag-<id>` id and are
  separate RAG subtree roots), **TEXTAREA-RENDER-ONLY-OVERLAY** (the textarea is
  a render-only overlay; its authored id is `textarea-<ragId>`, NOT
  `rag-`-prefixed), **RAG-AUTHORITATIVE** (the RAG store is authoritative; the
  inline `children` are read from the store and rendered as a projection).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — retrieval indexing of inline `children` text, paste-time sanitization —
  LATER slices, NOT this unit).
- Host patterns: `src/main/traversal.ts` (`buildSubtree` — the inline-children
  rendering site; `collectSubtreeIds` — the inline-children collection; the
  `assignSubtreeRanges` — the inline-children non-recursion; `rebuildBackRefs` —
  unchanged, routes through `buildTraversal`).
