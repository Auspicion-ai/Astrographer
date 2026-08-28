# Unit U3 — Rich-Text Eligibility + Host Splice + Snapshot `children`: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived ONLY from
  `docs/specs/unit-u3-rich-eligibility-splice.md` — §1.2 (the pure `isRichEditableRoot`
  signature + `EDITABLE_TYPES` set + API rules), §1.3 (the `applyEditingMode` splice
  contract + walk coverage + `ownsDocChildren` detection + idempotence + prop key),
  §1.4 (the additive snapshot `children` field), §2.1 (happy-path states 1–22), §2.2
  (fail-states 1–7), §3 (numeric/census claims), §5 (adversarial must-hunt
  ADR-1/2/3/4/5/6/7/8/9/10) — PLUS `docs/specs/editing-mode-toggle-review.md` decisions
  **C** and **E** (the host splice in `loadAppGraph` after `setTextareaReadOnly` /
  before `recomputeBackRefs`; the pure gate with the pinned `EDITABLE_TYPES`),
  `src/shared/types.ts` (`RagNodeType` via `src/main/rag-store.ts` §5.1, `EditingMode`,
  `RagSnapshotPayload`), and `src/main/traversal.ts` (~287–360, the subtree-root /
  `inline-<ragId>-<n>` / `textarea-<ragId>` / `rag-`-prefixed doc-child id
  shape the splice operates on). NO implementation reading of
  `src/renderer/rich-eligibility.ts` or `src/renderer/sidebar-panes.ts`, and NOT a
  copy of the U3 red-set test names (`tests/rich-eligibility.test.ts` /
  `tests/rich-splice.test.ts` were not read).
- **Modules under test:** the PURE `isRichEditableRoot` + `EDITABLE_TYPES`
  (`src/renderer/rich-eligibility.ts` — imported LIVE to RUN the gate scenarios) and
  the host splice `applyEditingMode` (a PRIVATE `SidebarPanes` method). The splice is
  NOT imported; per the task's harness carve-out it is exercised through a small host
  harness that mirrors the shape the spec describes (§1.3), reusing the LIVE
  eligibility gate for the decision. The integration-level claims (the `loadAppGraph`
  ordering after `setTextareaReadOnly` / before `recomputeBackRefs`; the injected
  `this.editingMode` field) are documented here but asserted only to the degree the
  spec pins splice-outcome shape — the full host-ordered path lives in the (unread)
  real `rich-splice.test.ts`.
- **Harness:** a standalone vitest scratch file
  (`tests/_scratch-u3-greens.test.ts`) importing `isRichEditableRoot` / `EDITABLE_TYPES`
  from `src/renderer/rich-eligibility.js` and a spec-derived `applyEditingMode`
  host harness over envelopes built in the traversal shape (§1.3 walk: each payload's
  `content[0]` is a subtree root; recursion into `rag-`-prefixed doc-children; removal
  of `textarea-<ragId>`; `ownsDocChildren` = a direct child whose `props.id` starts
  with `rag-`). Run: `npx vitest run tests/_scratch-u3-greens.test.ts`. The snapshot
  `children` type-level scenario is additionally checked with `tsc --noEmit` on a
  scratch type file.
- **Run:** **35 scenarios — all PASS, 0 fail, 0 skipped.** No spec-vs-impl drift
  observed in the LIVE eligibility gate or in the spec-derived splice contract. (The
  scratch files were deleted after the run.)

Each scenario lists: name, input, expected outcome (from the spec), actual result,
PASS/FAIL.

---

## A. `isRichEditableRoot` gate (§1.2, §2.1 1–9/10, §2.2 1, §3) — LIVE module

### A-1. All six heading types × `ownsDocChildren=false` → `true` (§2.1 1)
- **Input:** `('h1',false)`, `('h2',false)`, `('h3',false)`, `('h4',false)`,
  `('h5',false)`, `('h6',false)`
- **Expected:** each returns `true` (h1–h6 are in `EDITABLE_TYPES`, no doc-children)
- **Actual:** `true` for all six
- **Result:** ✅ PASS

### A-2. `p` × `ownsDocChildren=false` → `true` (§2.1 2)
- **Input:** `('p', false)`
- **Expected:** `true`
- **Actual:** `true`
- **Result:** ✅ PASS

### A-3. `blockquote` × `ownsDocChildren=false` → `true` (§2.1 3)
- **Input:** `('blockquote', false)`
- **Expected:** `true`
- **Actual:** `true`
- **Result:** ✅ PASS

### A-4. `div` × `ownsDocChildren=false` → `true` (§2.1 4)
- **Input:** `('div', false)`
- **Expected:** `true`
- **Actual:** `true`
- **Result:** ✅ PASS

### A-5. All 9 `EDITABLE_TYPES` × `ownsDocChildren=true` → `false` (§2.1 8)
- **Input:** `('h1'..'h6','p','blockquote','div', true)` — each with
  `ownsDocChildren=true`
- **Expected:** each returns `false` (a doc-child owner is never a rich-text leaf)
- **Actual:** `false` for all nine
- **Result:** ✅ PASS

### A-6. Non-eligible group 1 — `ul/ol/li/pre/code` × `ownsDocChildren=false` → `false` (§2.1 5)
- **Input:** `('ul',false)`, `('ol',false)`, `('li',false)`, `('pre',false)`,
  `('code',false)`
- **Expected:** each returns `false` (not in `EDITABLE_TYPES` → textarea fallback)
- **Actual:** `false` for all five
- **Result:** ✅ PASS

### A-7. Non-eligible group 2 — `strong/em/a/img` × `ownsDocChildren=false` → `false` (§2.1 6)
- **Input:** `('strong',false)`, `('em',false)`, `('a',false)`, `('img',false)`
- **Expected:** each returns `false`
- **Actual:** `false` for all four
- **Result:** ✅ PASS

### A-8. Non-eligible group 3 — `table/thead/tr/td/th` × `ownsDocChildren=false` → `false` (§2.1 7)
- **Input:** `('table',false)`, `('thead',false)`, `('tr',false)`, `('td',false)`,
  `('th',false)`
- **Expected:** each returns `false`
- **Actual:** `false` for all five
- **Result:** ✅ PASS

### A-9. `EDITABLE_TYPES` census — exactly 9 members (§1.2 / §3)
- **Input:** inspect `EDITABLE_TYPES.size` + membership
- **Expected:** `size === 9` and the set is exactly
  `{ h1,h2,h3,h4,h5,h6,p,blockquote,div }` (the review's "7" is a miscount — this
  spec pins **9**)
- **Actual:** `size === 9`, exactly the enumerated set
- **Result:** ✅ PASS

### A-10. `RagNodeType` census — 23 total = 9 editable + 14 non-eligible (§3)
- **Input:** the 23 members enumerated in `src/main/rag-store.ts` §5.1, checked
  against `EDITABLE_TYPES`
- **Expected:** 23 types total; 9 in `EDITABLE_TYPES`; 14 not
  (`ul/ol/li/pre/code/strong/em/a/img/table/thead/tr/td/th`); 9+14=23
- **Actual:** 9 in set, 14 not, 23 total
- **Result:** ✅ PASS

### A-11. Non-member type → `false` (§2.2 1)
- **Input:** `('section', false)`
- **Expected:** `false` (a string NOT in the `RagNodeType` union is not in
  `EDITABLE_TYPES`; no throw)
- **Actual:** `false`, no throw
- **Result:** ✅ PASS

### A-12. Defensive non-member variants → `false` (§1.2 API rules)
- **Input:** `('divx',false)`, `('H1',false)` (case-sensitive), `('p ',false)`
  (no trim)
- **Expected:** each returns `false` (the set is exact; case/whitespace not folded)
- **Actual:** `false` for all three
- **Result:** ✅ PASS

### A-13. Determinism / purity (§1.2 API rules)
- **Input:** `('p',false)` called repeatedly; same pair → same result
- **Expected:** every repeated `(type, ownsDocChildren)` pair returns the SAME boolean
  (no host state, no global reads)
- **Actual:** deterministic across repeated calls
- **Result:** ✅ PASS

### A-14. Totality — never throws across the whole domain (§1.2 API rules)
- **Input:** all 23 `RagNodeType` members × both `ownsDocChildren` values (46 calls)
- **Expected:** every call returns a boolean and never throws (total function, no
  throw path)
- **Actual:** 46 calls, all boolean, no throw
- **Result:** ✅ PASS

---

## B. The host splice `applyEditingMode` (spec-derived harness, §1.3 / §2.1 11–20 / §2.2 2–7 / §5)

### B-1. Eligible `p` root splices — textarea removed + `contenteditable:true` (§2.1 11)
- **Input:** envelope with one `p` subtree root (`rag-p1`, plain content, its
  `textarea-p1` child), `editingMode='contenteditable'`
- **Expected:** the `textarea-p1` child is REMOVED from `children`;
  `root.props.contenteditable === true`; the root's other props (`id:'rag-p1'`,
  `data-rag-node-id:'p1'`) are preserved
- **Actual:** textarea removed, `contenteditable:true`, `id`/`data-rag-node-id` kept
- **Result:** ✅ PASS

### B-2. Inline children survive the splice (§2.1 12)
- **Input:** a `p` root with inline `strong`/`em` children (`inline-p1-0`,
  `inline-p1-1`) + its `textarea-p1`, `contenteditable` mode
- **Expected:** the inline children REMAIN in `children` (only the textarea removed);
  `contenteditable:true`
- **Actual:** inline children intact, textarea removed, `contenteditable:true`
- **Result:** ✅ PASS

### B-3. Ineligible roots keep their textarea (§2.1 13 / ADR-1 / §2.2 3)
- **Input:** envelope with `ul`, `pre`, and `td` subtree roots, `contenteditable`
  mode
- **Expected:** each root's `textarea-<ragId>` child REMAINS; `contenteditable` NOT set
  on any (no erroneous removal — a dangling-edit-control defect is a fail-state)
- **Actual:** all three textareas remain, no `contenteditable` prop
- **Result:** ✅ PASS

### B-4. `EDITABLE_TYPES` type WITH a doc-child keeps its textarea (§2.1 13 / §2.1 8)
- **Input:** an `h1` root that owns an `h2` doc-child (a `rag-`-prefixed child),
  `contenteditable` mode
- **Expected:** the `h1` is NOT eligible (`ownsDocChildren=true`) → its
  `textarea-h1` REMAINS; `contenteditable` NOT set on the `h1`
- **Actual:** `textarea-h1` kept, no `contenteditable` on `h1`
- **Result:** ✅ PASS

### B-5. Parent-keeps-textarea / doc-child-splices (§2.1 14 — state 14)
- **Input:** an `h1` root owning an eligible `h2` doc-child (both with their own
  textareas), `contenteditable` mode
- **Expected:** the `h2` doc-child (eligible) has its `textarea-h2` removed +
  `contenteditable:true`; the parent `h1` (ineligible) KEEPS its `textarea-h1` and no
  `contenteditable`
- **Actual:** `h2` spliced (textarea gone + `contenteditable:true`); `h1` untouched
- **Result:** ✅ PASS

### B-6. Deep recursion — the walk descends doc-children, each judged by its OWN eligibility (§1.3 walk / §1.2 / §2.1 14)
- **Input:** `div(top)` → `div(mid)` → `p(leaf)` doc-child chain — each node owns the
  next as its doc-child (so each of top/mid has `ownsDocChildren=true`), `contenteditable`
  mode
- **Expected:** the top `div` and the mid `div` EACH own a doc-child, so both are
  INELIGIBLE (§1.2 — a doc-child owner is never a rich-text leaf) and keep their own
  textareas; the walk still RECURSES down to the leaf `p` (owns no doc-child), which is
  eligible → its textarea removed + `contenteditable:true`. Recursion is per-node,
  independent of the parent.
- **Actual:** top `div` and mid `div` keep their textareas (no `contenteditable`); the
  leaf `p` spliced (textarea gone + `contenteditable:true`) — the recursion reached and
  correctly evaluated every nested level.
- **Result:** ✅ PASS

### B-7. Inline children are NOT doc-children — primary rich case (ADR-6)
- **Input:** a `p` root with `strong`/`em`/`a`/`img` inline children and NO doc-child,
  `contenteditable` mode
- **Expected:** `ownsDocChildren` stays `false` (inline ids are `inline-…`, never
  `rag-`-prefixed) → the `p` is eligible → its textarea removed + `contenteditable:true`
- **Actual:** `p` spliced; inline children survive
- **Result:** ✅ PASS

### B-8. The textarea child is NOT mistaken for a doc-child (ADR-6)
- **Input:** a plain `p` root whose only child is its `textarea-p1` (no inline, no
  doc-children), `contenteditable` mode
- **Expected:** `ownsDocChildren` stays `false` (the `textarea-…` id is not
  `rag-`-prefixed) → eligible → textarea removed + `contenteditable:true`
- **Actual:** `p` spliced (its only child removed, `contenteditable:true`)
- **Result:** ✅ PASS

### B-9. Multi-parent ELIGIBLE duplicates all splice (§2.1 15 / ADR-8 / §2.2 6)
- **Input:** one eligible `p` subtree root materialized TWICE (two payloads, each
  `content[0]` a distinct duplicate with its own `textarea-p1`), `contenteditable`
  mode
- **Expected:** BOTH duplicates have their textarea removed + `contenteditable:true`
  (the same rule per duplicate — one-removed-one-kept is a fail-state)
- **Actual:** both duplicates spliced identically
- **Result:** ✅ PASS

### B-10. Multi-parent INELIGIBLE duplicates all keep the textarea (§2.1 15 / ADR-8)
- **Input:** one ineligible `ul` subtree root materialized TWICE, `contenteditable`
  mode
- **Expected:** BOTH duplicates keep their textarea; no `contenteditable`
- **Actual:** both kept, no `contenteditable`
- **Result:** ✅ PASS

### B-11. Root that is BOTH a subtree root AND a doc-child — same verdict (§2.2 7 / ADR-3)
- **Input:** an eligible `h2` materialized TWICE (once as its own payload `content[0]`,
  once nested as a doc-child of an `h1`), `contenteditable` mode
- **Expected:** both materializations get the SAME splice verdict (same type + same
  `ownsDocChildren=false` → both splice); a divergence is a defect
- **Actual:** both `h2` materializations spliced (textarea removed +
  `contenteditable:true`); the `h1` parent kept its textarea
- **Result:** ✅ PASS

### B-12. Empty eligible root still splices (§2.1 16 / ADR-5)
- **Input:** a `p` root with `content:''` and no children, `contenteditable` mode
- **Expected:** still eligible → textarea removed + `contenteditable:true`, no throw
  (an empty editor is valid)
- **Actual:** textarea removed, `contenteditable:true`, no throw
- **Result:** ✅ PASS

### B-13. Empty envelope no-ops (§2.1 17 / F3)
- **Input:** `envelope.content === []` (or a payload with `content: []`), both modes
- **Expected:** the splice no-ops (zero payloads walked) and never throws
- **Actual:** no-op, no throw
- **Result:** ✅ PASS

### B-14. textarea-mode is a byte-for-byte no-op (§2.1 18 / ADR-10)
- **Input:** a rich envelope (eligible + ineligible roots) with
  `editingMode='textarea'`
- **Expected:** every subtree root keeps its textarea, no `contenteditable` prop set,
  no child removed — the assembled envelope is unchanged by the splice (deep-equal)
- **Actual:** deep-equal to the original (byte-for-byte unchanged)
- **Result:** ✅ PASS

### B-15. Idempotence — re-run on the same envelope (§2.1 19 / ADR-4 / §2.2 4)
- **Input:** run the splice on an eligible-root envelope, then run it AGAIN on the
  same envelope object, `contenteditable` mode
- **Expected:** the already-removed textarea is not found → removal no-ops (no throw,
  no double-remove); `contenteditable:true` is set again; result identical to the
  first pass
- **Actual:** identical after re-run, no throw, no double-remove
- **Result:** ✅ PASS

### B-16. `contenteditable` prop collision overwritten to `true` (§2.2 2 / ADR-2)
- **Input:** an eligible `p` root whose authored props already carry
  `contenteditable:'false'`, `contenteditable` mode
- **Expected:** the splice OVERWRITES it to `true` (`root.props.contenteditable ===
  true`) — the authored value is NOT preserved
- **Actual:** `contenteditable:true` (authored `'false'` replaced)
- **Result:** ✅ PASS

### B-17. Missing textarea on an eligible root — idempotent/partial envelope (§2.2 4)
- **Input:** an eligible `p` root whose `textarea-p1` child is ALREADY absent,
  `contenteditable` mode
- **Expected:** the removal no-ops; the splice does NOT throw and still sets
  `contenteditable:true`
- **Actual:** no throw; `contenteditable:true` set
- **Result:** ✅ PASS

### B-18. The splice never removes a non-textarea child (ADR-9)
- **Input:** an eligible `p` root with a sibling child carrying a DIFFERENT id (e.g. a
  nested element or a `textarea-<otherRagId>`) alongside its own `textarea-p1`,
  `contenteditable` mode
- **Expected:** ONLY the child whose `props.id === 'textarea-p1'` is removed; the
  other-id child REMAINS (no same-type-elsewhere or different-id removal)
- **Actual:** only `textarea-p1` removed; the other-id child preserved
- **Result:** ✅ PASS

### B-19. Post-splice shape — root + non-textarea children intact (§2.1 20 / ADR-1)
- **Input:** an eligible `p` root with inline children + a `rag-<id>` id,
  `contenteditable` mode
- **Expected:** after the splice the eligible root's `id:'rag-p1'` subtree (its inline
  children) remains in the envelope — only the `textarea-p1` element is gone (no
  dangling editing control; the removed textarea is absent from the spliced envelope)
- **Actual:** `rag-p1` + inline children present, no `textarea-p1`
- **Result:** ✅ PASS

---

## C. Snapshot `children` field — type-level (§1.4 / §2.1 22)

### C-1. A snapshot node WITH `children` typechecks against `RagSnapshotPayload.nodes` (§1.4 / §2.1 22)
- **Input:** `nodes: [{ id, type:'p', content:'x', children:[{type:'strong',
  content:'b'}], ownedNodeIds:[], createdAt, updatedAt }]` typed as
  `RagSnapshotPayload`
- **Expected:** the element typechecks (the additive `children` field is present);
  `node.children` is a `{type;content;props?}` array — verified with `tsc --noEmit`
- **Actual:** typechecks green (tsc), runtime shape valid
- **Result:** ✅ PASS

### C-2. A snapshot node WITHOUT `children` (v1 default) typechecks — additive/optional (§1.4 / §2.1 22)
- **Input:** a `RagSnapshotPayload` node with NO `children` field
- **Expected:** still valid (the field is `children?`, absent for plain-text nodes —
  additive, no field made required); typechecks green with `tsc --noEmit`
- **Actual:** typechecks green (tsc), runtime shape valid
- **Result:** ✅ PASS

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| A-1 | h1–h6 × no doc-children → true | ✅ PASS |
| A-2 | `p` × no doc-children → true | ✅ PASS |
| A-3 | `blockquote` × no doc-children → true | ✅ PASS |
| A-4 | `div` × no doc-children → true | ✅ PASS |
| A-5 | All 9 EDITABLE_TYPES × doc-children → false | ✅ PASS |
| A-6 | `ul/ol/li/pre/code` → false | ✅ PASS |
| A-7 | `strong/em/a/img` → false | ✅ PASS |
| A-8 | `table/thead/tr/td/th` → false | ✅ PASS |
| A-9 | EDITABLE_TYPES census = 9 | ✅ PASS |
| A-10 | RagNodeType census 23 = 9 + 14 | ✅ PASS |
| A-11 | Non-member `section` → false | ✅ PASS |
| A-12 | Defensive non-member variants → false | ✅ PASS |
| A-13 | Determinism / purity | ✅ PASS |
| A-14 | Totality — no throw across the domain | ✅ PASS |
| B-1 | Eligible `p` splices (textarea removed + contenteditable:true) | ✅ PASS |
| B-2 | Inline children survive | ✅ PASS |
| B-3 | Ineligible roots keep textarea (ul/pre/td) | ✅ PASS |
| B-4 | EDITABLE_TYPES WITH doc-child keeps textarea | ✅ PASS |
| B-5 | Parent-keeps-textarea / doc-child-splices (state 14) | ✅ PASS |
| B-6 | Deep recursion (div→div→p) | ✅ PASS |
| B-7 | Inline children NOT doc-children (ADR-6) | ✅ PASS |
| B-8 | Textarea NOT doc-child (ADR-6) | ✅ PASS |
| B-9 | Multi-parent eligible duplicates both splice | ✅ PASS |
| B-10 | Multi-parent ineligible duplicates both keep | ✅ PASS |
| B-11 | Root BOTH subtree root AND doc-child — same verdict | ✅ PASS |
| B-12 | Empty eligible root splices | ✅ PASS |
| B-13 | Empty envelope no-op | ✅ PASS |
| B-14 | textarea-mode byte-for-byte no-op | ✅ PASS |
| B-15 | Idempotence (re-run) | ✅ PASS |
| B-16 | `contenteditable` prop collision overwritten to true | ✅ PASS |
| B-17 | Missing textarea on eligible root — no throw | ✅ PASS |
| B-18 | Never removes a non-textarea child (ADR-9) | ✅ PASS |
| B-19 | Post-splice shape — root + non-textarea intact | ✅ PASS |
| C-1 | Snapshot node WITH `children` typechecks | ✅ PASS |
| C-2 | Snapshot node WITHOUT `children` typechecks (additive) | ✅ PASS |

**Run summary:** 35 scenarios — 35 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed in the LIVE eligibility gate.** Every `isRichEditableRoot` /
  `EDITABLE_TYPES` scenario (the 9 EDITABLE_TYPES × both `ownsDocChildren` values,
  the 14 non-eligible types, the non-member + defensive variants, the 9/14/23 census,
  determinism, totality) passed against the live `src/renderer/rich-eligibility.ts`.
- **Splice contract is coherent and executable.** The spec-derived `applyEditingMode`
  harness (walk each payload `content[0]`, recurse into `rag-`-prefixed doc-children,
  `ownsDocChildren` = direct child with `rag-`-prefixed `props.id`, remove
  `textarea-<ragId>` + set `contenteditable:true` on eligible roots, no-op in textarea
  mode, idempotent) satisfied every splice state and fail-state, including state 14
  (parent-keeps-textarea / doc-child-splices), multi-parent consistency, the
  `contenteditable` prop-collision overwrite, and the never-remove-a-non-textarea
  guarantee.
- **Snapshot `children` field is additive and optional** — both with and without
  `children` typecheck against `RagSnapshotPayload.nodes`.

### Test-authoring notes (not drifts)

- **Harness carve-out.** The real `applyEditingMode` is a private `SidebarPanes`
  method; per the task it was NOT imported or read. The splice scenarios run through a
  host harness that mirrors the §1.3 splice over envelopes built in the traversal
  shape, REUSING the live `isRichEditableRoot`/`EDITABLE_TYPES` gate for the decision.
  The integration-only claims (the exact `loadAppGraph` ordering after
  `setTextareaReadOnly` / before `recomputeBackRefs`, and driving it with the injected
  `this.editingMode` field) are asserted here only to the splice-outcome shape they
  pin (§2.1 20/21); the full host-ordered integration lives in the real
  `tests/rich-splice.test.ts` (unread).
- **B-6 (blind-test derivation slip, corrected).** The first draft of the deep-recursion
  scenario wrongly expected the mid `div` (which owns the leaf `p` as a doc-child) to
  splice. Re-deriving from §1.2's pinned rule — "a node that owns a doc-child is NOT
  eligible even if its type is in `EDITABLE_TYPES`" — the correct expectation is that
  only the leaf (owns no doc-child) splices. The correction was applied to the scenario
  and the live gate + harness passed the corrected expectation; the spec's
  `ownsDocChildren` rule is what caught the slip (not a spec-vs-impl drift).
- **A-1/A-5 (grouped heading scenarios).** The six heading types share one spec state
  (§2.1 1); each member is asserted individually within the scenario.
- **C-1/C-2 (type-level).** Verified by a `tsc --noEmit` run on a scratch type file
  plus a runtime shape assertion; vitest itself does not typecheck.
