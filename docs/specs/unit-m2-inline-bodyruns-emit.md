# Spec — Unit M2: The Traversal `bodyRuns` Emit + A7 Content-Equivalence Gate

- **Status:** SPEC. This is M2 of the **Inline-Ordering Render Fix** program
  (gate reference: `docs/specs/inline-order-render-fix-review.md`,
  **PROCEED-WITH-AMENDMENTS**, A1–A8, 2026-08-31). M2 is the **traversal emit**
  slice: `buildSubtree` (in `src/main/traversal.ts`) emits the engine's opt-in
  `bodyRuns` (alternating `{text: slice}` / `{child: <authoredInlineId>}` runs)
  on each subtree root's `LegacyNodeData`, derived from `content` + per-child
  `offset`, then relies on the M3 rewrite to map each `{child}` ref to the child's
  compiled path-key wire. **M2 MUST NOT SHIP BEFORE the M3 rewrite module exists**
  (A1): emitting `bodyRuns` without the M3 rewrite drops children on every
  placement-routed root — a regression. Execution order is M3 → M1 → M2 → M4
  (A1/A8). It consumes the M1 model (`offset` + full-projection `content`) and
  the M3 rewrite.
- **Scope:** the `buildSubtree` amendment that (a) emits `bodyRuns` from
  `content` + child `offset`s on the subtree root, (b) pins the ordering
  algorithm (children sorted by offset, stable; same-offset = flattened nested
  siblings emit back-to-back; text segments split at offsets), and (c) enforces
  the **A7 gate**: the generated `bodyRuns` must EXACTLY reproduce `content`
  (`{text}` slices + the child contents at `{child}` positions === `content`).
  It does NOT model (`offset`/full projection — M1), does NOT contain the rewrite
  (M3), and does NOT touch validation/retrieval/textarea/splitNode (M4).
- **TestWriter contract:** every API behavior, ordering rule, return shape, and
  fail-state below is derivable from this spec ALONE. The TestWriter writes the
  red set for the amended `src/main/traversal.ts` `buildSubtree` (the `bodyRuns`
  generation + the A7 gate + the M3 application guard) from §5.6/§5.7 before any
  implementation.

---

## 1. What the proposal asks

1. **`buildSubtree` emits `bodyRuns` on the subtree root's `LegacyNodeData`** for
   a rich/offset-bearing node, so the engine renders the inline text/child order
   instead of `escapeText(content) + children` (which puts every child after the
   content). The subtree root KEEPS its `content` + `children` (the inline child
   elements, the textarea overlay, the doc-children) for the textarea/retrieval/
   back-compat — the `bodyRuns` is ADDITIVE on the same element.
2. **The `bodyRuns` array is `BodyRun[]`** (`{text: slice}` / `{child:
   <authoredInlineId>}`), built from `node.content` (full projection) + each
   inline child's `offset` (M1).
3. **The `{child}` ref uses the inline child's authored id `inline-<ragId>-<index>`
   (original `node.children` index)** — the SAME authored id the Unit R inline
   child element carries — so the M3 rewrite can resolve authored id →
   compiled path-key wire.
4. **The M3 rewrite is applied to the resulting translated instance at every
   render-feeding translate site** (M3 §5.4) — M2 does not bypass it. M2 never
   ships on an unmet rewrite (A1).
5. **The A7 gate:** the generated `bodyRuns` must EXACTLY reproduce `content`
   (splice the child contents at offsets) — a pinned correctness assertion for
   the lineMap (a wrong bodyRuns ⇒ a wrong markdown line count ⇒ a wrong lineMap).

## 2. Feasibility verdict

**Feasible — a localized additive emit in the already-landed `buildSubtree`
(Unit C + Unit R).** The engine's `LegacyNodeData.bodyRuns` is a documented
passthrough (`translate.js` L178-184); the host authors it as provident-ssr data.
The existing `buildSubtree` already authors the inline child elements with the
authored ids `inline-<ragId>-<index>` (Unit R); M2 adds a `bodyRuns` array to the
same returned object. The offset→text-split algorithm is pure. **The one binding
precondition is the A7 equivalence + the M3 rewrite** — Design B cannot render by
itself (the emit alone is a regression on every placement-routed root, gate §2
#2/#4). No package patch.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `buildSubtree` emits `bodyRuns` from `content` + offsets | Project-specific (amends `buildTraversal`'s `buildSubtree`) | Low cost; the inline order renders correctly on a placement content root. |
| The offset-ordering / text-split algorithm (children sorted by offset, stable; same-offset back-to-back) | Project-specific | Low cost; deterministic + A7-gated. |
| The A7 content-`bodyRuns` equivalence gate | Project-specific | Low cost; pins the lineMap correctness ("the generated bodyRuns must exactly reproduce content"). |
| The M3 rewrite application at the render site | Rides M3 (host-side; the engine defect is handoff, not patched) | Mandatory dependency (A1) — M2 must never ship before M3. |

No new engine gap (the existing `ENG-BODYRUNS-WIRE-REF-PATHSTATE` defect is M3's
workaround). The model (`offset`/full projection) is M1; validation/retrieval/
textarea/splitNode is M4 — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (the adversarial pass must NOT
regress them):

- **A1 — A7 equivalence must hold for EVERY emitted `bodyRuns`** (no text dropped
  or duplicated; `{text}` slices + child contents === `content`).
- **A2 — same-offset flattened siblings emit back-to-back in `children` order**
  (never reordered or merged into a wrong span).
- **A3 — the `{child}` refs use the ORIGINAL `node.children` index** (not the
  post-sort index), matching the inline child element's authored id — so M3
  resolution finds the right wire.
- **A4 — `bodyRuns` is emitted ONLY when interleaving is meaningful** (a rich
  node with ≥1 offset-bearing child); a plain node (no children or only offset-
  absent children) emits NO `bodyRuns` → the engine scalar path (append-after)
  is preserved (back-compat).
- **A5 — the textarea overlay + doc-children are NOT referenced in `bodyRuns`**
  (they are not inline children) and remain ordinary element children.
- **A6 — offset-bearing children at the same position as other text still respect
  the offset bound (§5.5, M1); an out-of-bound offset is a model violation that
  must not silently produce a wrong span.**

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here; none are PACKAGE findings (the package defect is handoff). (Pass
TBD, RCA-3.)

### 3b. Proposal-review findings

The gate (`docs/specs/inline-order-render-fix-review.md`, 2026-08-31) returned
**PROCEED-WITH-AMENDMENTS**, Design B. The amendments THIS unit resolves:

- **A1 — Sequencing:** M2 must never precede M3; M2's red set includes the M3-
  application guard.
- **A7 — Content-`bodyRuns` equivalence gate:** the generated `bodyRuns` must
  exactly reproduce `content` (splice child contents at offsets) — pinned as the
  correctness assertion.
- **A8 — Process (execution order M3 → M1 → M2 → M4):** M2 is its own
  red→green→adversarial→greens→doc-review cycle.

## 4. Design decisions pinned by this spec

- **DESIGN-B (consumed):** `content` stays the stored full-projection scalar; the
  traversal builds `bodyRuns` from `content` + child `offset`s on the subtree
  root's `LegacyNodeData`, keeping `content` + `children` emitted for the
  textarea/retrieval/back-compat.
- **TEXTAREA-RENDER-ONLY-OVERLAY (consumed, Unit L/R):** the textarea is a
  render-only editing overlay NOT in the markdown; it is NOT referenced by
  `bodyRuns`.
- **RAG-AUTHORITATIVE (consumed):** the store is authoritative; `content` +
  `children` (+ `offset`) are read from the store and projected into the
  envelope's `bodyRuns` by the traversal.

## 5. The exhaustive contract

### 5.1 The `bodyRuns` emit in `buildSubtree`

`buildSubtree` (in `src/main/traversal.ts`) returns the subtree root
`LegacyNodeData` (Unit C §5.2 + Unit R §5.1). M2 adds a `bodyRuns` field to that
returned object.

**The amended `buildSubtree` return shape (pinned):**

```ts
// src/main/traversal.ts — the amended subtree root. The `bodyRuns` field is NEW
// (a BodyRun[]). It interleaves the node's own text with the inline children in
// document order. `content` + `children` are KEPT (textarea/retrieval/back-compat).
return {
  type: node.type,
  props: { ...(node.props ?? {}), id: `rag-${ragId}`, 'data-rag-node-id': ragId },
  placement: { targetPlacement: [zoneName] },
  content: node.content,               // KEPT — the full-projection scalar
  bodyRuns: <BodyRun[] | undefined>,   // NEW — the interleave runs, or undefined
  children: [ ...inlineChildren, ...textarea, ...docChildren ],
}
```

**When `bodyRuns` is emitted (pinned):**

- **Emitted iff `node.children` contains ≥1 inline child WITH a numeric `offset`**
  (a rich/interleaved node, A4). The node's FULL-projection `content` + each
  offset-bearing child's position drive the runs.
- **A plain node** (`children` undefined or `[]`) or a node with ONLY offset-absent
  (legacy) inline children → `bodyRuns` is `undefined` → the engine scalar path
  (`escapeText(content) + children`, i.e. the v1 append-after) renders unchanged
  (back-compat).
- **A MIXED node** (some offset-bearing, some offset-absent children): the
  offset-bearing children are interleaved by `bodyRuns`; the offset-absent
  children are NOT referenced by `bodyRuns` and render as ordinary children
  (append-after), preserving legacy behavior.

### 5.2 The ordering algorithm (pinned exactly)

Given `content` (full projection) + the offset-bearing inline children:

1. **Sort the offset-bearing inline children by `offset`, STABLE** (equal offsets
   preserve `node.children` relative order). Distinct top-level children have
   strictly increasing offsets; flattened nested siblings SHARE their outer
   child's offset (M1 §5.3) and therefore sort adjacent, in `children` order.
2. **Walk `content` left-to-right, splitting text at each child's offset,**
   producing the runs in this order:
   - a `{text: slice}` for the text from the current cursor to the next child's
     `offset` (only if the slice is non-empty);
   - a `{child: inline-<ragId>-<origIndex>}` run for that child;
   - advance the cursor past the child's span.
3. **Same-offset flattened nested siblings emit BACK-TO-BACK** (A2): each sibling
   at the shared offset produces its `{child}` run consecutively (no text between
   them — their shared slot has no text).
4. **After the last child, emit a trailing `{text: content[cursor..]}` run** (if
   non-empty).
5. **The `{child}` ref uses the child's ORIGINAL `node.children` index** (A3),
   which is exactly the authored id of the Unit R inline child-element — so the
   M3 rewrite's authored-id → wire resolution matches.

**The reported-defect example (A7 visible):** `content = 'Proposal: Astrographer'`,
inline child `{ type:'strong', content:'Proposal:', offset:0 }`.
Sorted: one child at offset 0. Runs:
- `{ child: 'inline-<ragId>-0' }` (offset 0),
- `{ text: ' Astrographer' }` (the `content[0+9..]` trailing slice).
Reconstruction: child content `'Proposal:'` + `' Astrographer'` = `'Proposal:
Astrographer'` = `content` ✓. Renders the bold "Proposal:" first, then the tail —
the corrected order.

### 5.3 The A7 content-`bodyRuns` equivalence gate (pinned)

**A7 gate (the correctness assertion):** define `reconstruct(runs, childContents)`
= the concatenation of each `{text}` run's TEXT and, for each `{child}` run, the
referenced inline child's `content`, in run order. The gate asserts:
**`reconstruct(runs, childContents) === content`** for every emitted `bodyRuns`.

- Because the `{text}` slices are precisely `content` minus the child spans and
  the child contents occupy those spans, reconstruction reproduces `content`
  exactly (this is the traversal-side statement of the M1 full-projection
  invariant).
- **The gate is asserted as a test assertion (§5.6) AND, at minimum, internally
  guarded (a mismatch is a model/producer bug — never silently emitted).** A
  mismatch MUST NOT silently ship a wrong bodyRuns (which would corrupt the
  lineMap); it is either dropped (no `bodyRuns` → scalar fallback) or surfaced.
- **LineMap-correction tie-in:** the main-side markdown re-emits
  (`renderEnvelopeMarkdown`/`renderSubtreeMarkdown`) render the same
  `bodyRuns`; a correct bodyRuns ⇒ the correct markdown line count ⇒ a correct
  `lineMap`. The A7 gate is therefore the lineMap-correctness guard (gate §2 #4).

### 5.4 The M3 application (A1) — not shipped on an unmet rewrite

- M2's emit is wired into the SAME render-feeding translate path that M3 rewrites
  (M3 §5.4: runtime.ts L114/L335/L514/L946 + traversal.ts L131). The `buildSubtree`
  emits `bodyRuns`; the M3 rewrite runs on the translated instance at those sites.
- **A1 guard (pinned):** M2 (this unit) MUST NOT ship/land before the M3 rewrite
  module exists and is applied at the render-feeding translate sites. The M2 red
  set includes a guard test asserting the M3 helper is applied to the rendered
  instance (so a future M3 removal is a test failure, not a silent regression).

### 5.5 Numeric/invariant claims (census)

- **`BodyRun` element kinds:** 2 — `{text: string}` / `{child: string}` (the engine
  type, body-runs.d.ts).
- **Inline child element types referenced by `bodyRuns`:** 4 — `strong`, `em`,
  `a`, `img` (the closed `RagNodeChildType`; only these are inline children).
- **Run count relation:** for N offset-bearing inline children, the emitted
  `bodyRuns` has at most `2N+1` runs (`N` `{child}` + up to `N+1` `{text}`), with
  the leading/empty `{text}` slices dropped. Same-offset siblings contribute
  consecutive `{child}` runs with no intervening `{text}`.
- **Authored id scheme in `bodyRuns`:** 1 — `inline-<ragId>-<origIndex>` (ORIGINAL
  `node.children` index), matching the Unit R inline-child-element authored id.
- **A7 equivalence:** `reconstruct(runs, childContents) === content`, asserted for
  every emitted `bodyRuns`.
- **`bodyRuns` emitters:** 1 — `buildSubtree`. Non-emitting (plain/legacy) nodes
  are the scalar path.
- **Rewrite application sites (ride M3):** 5 render-feeding translate sites
  (M3 §5.4): runtime.ts L114/L335/L514/L946 + traversal.ts L131.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Interleaved inline child with `bodyRuns`:** a node with `content =
   'Proposal: Astrographer'` + inline child `{type:'strong', content:'Proposal:',
   offset:0}` → `bodyRuns = [{child:'inline-<ragId>-0'}, {text:' Astrographer'}]`;
   A7 reconstruct === content.
2. **Mid-text child:** `content='ab bold cd'`, child `{type:'em', content:'bold',
   offset:3}` → `bodyRuns = [{text:'ab '},{child:...},{text:' cd'}]`; A7 holds.
3. **Leading + trailing children:** two offset-bearing children, one at offset 0,
   one mid → leading `{text}` (if any) then `{child}`…; A7 holds.
4. **Same-offset flattened sibling back-to-back:** two children sharing one offset
   → their `{child}` runs are consecutive (no `{text}` between them); A7 holds.
5. **Plain node (no `bodyRuns`):** `children` undefined / `[]` → `bodyRuns`
   undefined → the scalar path renders.
6. **Legacy offset-absent child (no `bodyRuns`):** a child WITHOUT an `offset` →
   `bodyRuns` undefined → the v1 append-after scalar path renders (back-compat).
7. **Mixed node:** one offset-bearing child (interleaved) + one offset-absent child
   → `bodyRuns` interleaves the offset-bearing child; the offset-absent child is
   not referenced; A7 holds for the offset-bearing span.
8. **`{child}` refs use the ORIGINAL index:** after sorting, a child whose
   original `node.children` index differs from its sorted position still refs
   `inline-<ragId>-<origIndex>` (matching its element authored id).
9. **A7 gate holds for MANY children (20 offset-bearing children):** the
   reconstruction reproduces `content` exactly; the runs are ordered by offset,
   stable.
10. **M3 applied (A1 integration):** with the M3 rewrite present, a placement
    content root with `bodyRuns` renders the inline order in DOM/SSR/markdown and
    the lineMap is correct (the M3-application guard passes).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **A7 mismatch — dropped text:** a generated `bodyRuns` whose `{text}` slices
   + child contents ≠ `content` (a missing or duplicated span) → the A7 gate
   fails; the emit MUST NOT produce a wrong `bodyRuns`. A test asserts
   reconstruction reproduces `content` for every emitted case.
2. **A7 mismatch — duplicated/overlapping spans:** two offset-bearing children
   whose spans overlap (offsets not increasing) → the algorithm sorts stably by
   offset; a duplicate-offset pair is the same-offset back-to-back case (valid),
   but a span ordering violation is a fail-state — a test asserts monotone
   top-level offsets (M1 §5.5).
3. **`{child}` ref pointing at the SORTED index instead of the ORIGINAL index**
   → the ref would not match the inline-child-element authored id → the M3
   rewrite could not resolve it → the run drops + children-vanish. A test asserts
   the ref uses the ORIGINAL `node.children` index (A3).
4. **Out-of-bound `offset` reaching `buildSubtree`** (a model violation; > the M1
   bound) → must not silently produce a wrong span; the emit either drops
   `bodyRuns` (scalar fallback) or surfaces the violation. A test asserts out-of-
   bound offsets never emit a wrong span (A6).
5. **M2 shipped WITHOUT the M3 rewrite (A1 violation)** → the emit alone drops
   children on a placement-routed root. The M2 red set's guard test asserts the
   M3 helper is present + applied at the render-feeding sites — this fail-state
   is the A1 blocking guard, not an accepted behavior.
6. **A `bodyRuns` referencing the textarea overlay or a doc-child** (an inline
   child only) → those are NOT inline children; a test asserts `bodyRuns` refs
   cover ONLY the inline `strong`/`em`/`a`/`img` children (A5).

### 5.8 TDD red-set framing

- **Unit-M2 red set = §5.6 + §5.7 against the amended `buildSubtree`.** Each red
  test asserts the emitted `bodyRuns` (or its absence) + the A7 reconstruction on
  a crafted node. The TestWriter RUNS it before implementation (RCA-1) — `bodyRuns`
  does not exist yet → the red set fails. The Implementer lands the emit (least
  code to go green), which MUST include the A7 gate + the M3-application guard.
- **The M3 ride-along:** M2's render correctness is confirmed only once the M3
  rewrite is applied at the render site (§5.6 10). M3 MUST be green first (A1).
- **After the greens:** blind-run (§5.6) + documentation review (RCA-4/6) +
  adversarial pass (§3a TBD).

### 5.9 Cross-references

- Gate: `docs/specs/inline-order-render-fix-review.md` §1 (the traversal builds
  `bodyRuns` on the subtree root), §2 #1/#2/#4 (the emit is sound; Design B cannot
  render by itself; the rewrite must not be renderer-only), §3 **A1** (sequencing),
  **A7** (content-`bodyRuns` equivalence gate), §4 (execution order M3 → M1 → M2 →
  M4), §5/§6 (costs + benefits).
- M1: `docs/specs/unit-m1-inline-offset-model.md` §5.1–§5.5 (the `offset` +
  full-projection `content` + the bound + the nested-flatten offset rule this
  unit's algorithm consumes).
- M3: `docs/specs/unit-m3-inline-bodyruns-rewrite.md` §5.1–§5.4 (the rewrite this
  emit relies on; the call-site census; the A1 sequencing guard; the SAME-instance
  rule).
- Unit R: `docs/specs/unit-r-traversal-inline-children.md` §5.1 (the inline-child-
  element authored id `inline-<ragId>-<index>` that this unit's `{child}` refs
  use), §5.8 (the id scheme census).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1/§5.2/§5.6 (the
  `LegacyNodeData` subtree root + the coarse lineMap this unit's A7 gate guards).
- Engine (READ-ONLY): `node_modules/provident-ssr/dist/core/body-runs.d.ts`
  (`BodyRun`, `encodeRuns`/`decodeRuns`), `dist/core/render-helpers.js`
  (`isInterleaving`, `emitTextProp` — a single `{text}` run normalizes to the
  scalar path; interleaving requires ≥2 runs or any `{child}`),
  `dist/core/translate.js` L178-184 (the `bodyRuns` passthrough). Not patched.
- Host patterns: `src/main/traversal.ts` (`buildSubtree` — the emit site; the
  render-feeding translate sites at L131/L147; the backRefs translate at L482
  does NOT emit/rewrite).

## 6. Flags / ambiguities (raised, not guessed)

1. **M2 rides M3 and M1; no independent render gate (raised, consistent with the
   program):** this unit's observable behavior requires the M1 model (offsets in
   the store) AND the M3 rewrite (applied at render). The M2 red set therefore
   must either (a) assert against a synthetic node with offsets + a stubbed M3,
   or (b) be gated behind M1+M3 landing. The Implementer should run unit-level
   asserts on the pure `bodyRuns` generator (independent of the store + engine)
   FIRST, then the live-render integration after M1+M3. Flagged so the red
   sequence is not blocked by a missing sibling unit.
2. **The A7 gate's runtime disposition (raise/flag):** whether a detected A7
   mismatch is internally dropped (`bodyRuns: undefined` → scalar fallback) or
   surfaced at runtime is pinned here as "MUST NOT silently emit"; the exact
   disposition (drop vs. assert/warn) is an Implementer choice that must preserve
   the never-corrupt-the-lineMap guarantee (§5.3). Flagged so the test + the
   implementation agree.
