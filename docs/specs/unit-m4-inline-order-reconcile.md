# Spec — Unit M4: Reconciliation — Validation, Retrieval, Textarea, splitNode

- **Status:** SPEC. This is M4 of the **Inline-Ordering Render Fix** program
  (gate reference: `docs/specs/inline-order-render-fix-review.md`,
  **PROCEED-WITH-AMENDMENTS**, A1–A8, 2026-08-31). M4 is the **reconciliation**
  slice: it consumes the M1 model (`RagNodeChild.offset` + full-projection
  `content`) and reconciles every consumer that assumed the OLD `content`
  meaning (parent-only text). It is the LAST unit in execution order (A8: M3 →
  M1 → M2 → M4). It covers `validateNodeShape`/`isValidChildren` offset
  bound-checks (A6), the retrieval `nodeText` reconciliation (A4-i), the textarea
  `value: node.content` full-projection change (A4-ii), the U5 `setRichText`
  atomic content+children+offsets write (A4-ii), and the `splitNode at` new
  fail-state — reject `at` strictly inside a child span + children attribution at
  boundary splits + the offset-absent (append-after) back-compat rule (A4-iii).
- **Scope:** `src/main/rag-store.ts` (`validateNodeShape`/`isValidChildren` +
  the offset bound), `src/main/retrieval.ts` (`nodeText`), the textarea authoring
  (the `value: node.content` meaning — in `src/main/traversal.ts`, Unit L/R), the
  U5 atomic write (`src/main/edit-ops.ts` `setRichText`), and the `splitNode`
  op (`src/main/edit-ops.ts`). It does NOT model (M1), does NOT emit `bodyRuns`
  (M2), and does NOT contain the rewrite (M3).
- **TestWriter contract:** every API signature, return shape, throw/domain
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set from §5.6/§5.7 before any
  implementation (RCA-1).

---

## 1. What the proposal asks

1. **`validateNodeShape` / `isValidChildren` accept + bound-check `offset`**
   (A6): a child's present `offset` must be a non-negative integer ≤ the node's
   `content.length`; an out-of-bound/non-integer `offset` is rejected at write
   (throw) and skipped at boot. Offset-ABSENT stays valid (append-after,
   back-compat).
2. **Retrieval `nodeText` = `content` (full projection)** (A4-i): the
   children-appending space-join that would double-count inline-child text is
   dropped; `nodeText(node)` returns the full-projection `content`. For
   offset-ABSENT (legacy) children, their text is appended after (space-joined,
   dropping empties) — **byte-compatible with the current `nodeText` for legacy
   nodes** (A4-i).
3. **Textarea `value: node.content` shows the full projection** (A4-ii,
   documented change): with `content` now the full projection, the textarea
   editing overlay (Unit L/R) displays the complete text including inline text.
4. **U5 `setRichText` writes content + children + offsets ATOMICALLY** (A4-ii):
   one `putNode` writes the whole tuple so an edit cannot orphan offsets against
   `content`.
5. **`splitNode at` — new documented domain fail-state** (A4-iii): reject `at`
   strictly INSIDE an offset-bearing child span; document children attribution at
   boundary splits + the offset-absent (append-after) rule. Back-compat: absent
   offset = append-after, so the new fail-state never triggers for legacy nodes.

## 2. Feasibility verdict

**Feasible — a reconciliation of existing consumers against the M1 meaning
change.** Each consumer already reads `node.content` / the `children` field;
M4 adjusts `nodeText` (append-after only for offset-absent children), the
`validateNodeShape`/`isValidChildren` bindings (offset bound), the textarea's
`value` contract (meaning change, no code shape change), `setRichText` (already
atomic — now carries offsets), and `splitNode` (one new domain branch + children
attribution). All are host-side, node-testable, and PURE. No engine change.
`docs/specs/unit-q-retrieval-children-indexing.md` and `unit-d-editing.md`
specs must be reconciled against the changed `nodeText`/`splitNode` behavior in
the same documentation pass (RCA-6).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `validateNodeShape`/`isValidChildren` offset bound-check (A6) | Project-specific (the store) | Low cost; rejects a corrupt/tampered offset at write/boot. |
| `nodeText` reconciliation (A4-i) | Project-specific (retrieval) | Low cost; full-projection retrieval, byte-compatible for legacy offset-absent children. |
| Textarea full-projection + U5 atomic write (A4-ii) | Project-specific | Low cost; documented meaning change; atomic write cannot orphan offsets. |
| `splitNode at`-inside-span fail-state + boundary attribution (A4-iii) | Project-specific | Low cost; a new documented domain fail-state per the gate §5. |

No engine gap. The model (`offset`/full projection) is M1; the `bodyRuns` emit is
M2; the rewrite is M3 — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (the adversarial pass must NOT
regress them):

- **A1 — offset bound is enforced at validateNodeShape (node scope) but only
  shape-checked at isValidChildren (no `content` in scope).** A child `offset`
  that is a non-negative integer passes `isValidChildren`; the node-level bound
  (≤ content.length) is enforced where `content` is visible. A test must not
  assume `isValidChildren` enforces the content-length bound (flag §6.1).
- **A2 — `nodeText` must not double-count offset-bearing child text** (already in
  `content`) AND must not LOSE offset-absent (legacy) child text (append-after).
- **A3 — the `splitNode` inside-span reject must only trigger for offset-bearing
  spans; a legacy (all offset-absent) node must behave exactly as pre-M4** (the
  new fail-state is unreachable for it).
- **A4 — a boundary split (`at == child.offset` or `at == child.offset + len`)
  must NOT be rejected**, and the child must be attributed per §5.5 with re-based
  offsets on the right node.
- **A5 — `setRichText` with children (incl. offsets) + content writes them in ONE
  putNode; a no-op (content + children-equivalent) performs NO write.** The
  `sameChildren` deep-compare now covers `offset` (a child whose `offset` changed
  is "changed" → broadcast structural).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here; none are PACKAGE findings. (Pass TBD, RCA-3.)

### 3b. Proposal-review findings

The gate (`docs/specs/inline-order-render-fix-review.md`, 2026-08-31) returned
**PROCEED-WITH-AMENDMENTS**, Design B. The amendments THIS unit resolves:

- **A4 — Content-meaning reconciliation:** (i) `nodeText`/lexical index —
  full-projection content; offset-absent children append after (byte-compatible);
  (ii) textarea `value: node.content` shows the full projection (documented) and
  U5 `setRichText` writes content+children+offsets atomically; (iii) `splitNode
  at` — reject strictly-inside-a-child-span (domain), document children
  attribution at boundary splits.
- **A6 — Back-compat + validation:** `offset` optional, absent = append-after;
  `validateNodeShape`/`isValidChildren` accept + bound-check `offset`
  (0 ≤ offset ≤ content length).

## 4. Design decisions pinned by this spec

- **FULL-PROJECTION-CONTENT (consumed, M1):** `node.content` is the full
  plain-text projection (inline text inside the scalar). Every consumer that
  treated `content` as parent-only must be reconciled.
- **ATOMIC-RICH-WRITE (consumed, Unit U5):** `setRichText` writes content +
  children (+ offsets) in one `putNode` — the anti-orphan-offset guarantee.
- **APPEND-AFTER (consumed, M1 §5.2):** an offset-absent child appends after
  content (the v1 default); M4 keeps every legacy path byte-compatible.

## 5. The exhaustive contract

### 5.1 `validateNodeShape` / `isValidChildren` — accept + bound-check `offset`

**`validateNodeShape` (in `src/main/rag-store.ts`) — the amended child branch
(pinned):** in the existing `children` loop, when `c.offset !== undefined`:

```ts
if (c.offset !== undefined) {
  if (typeof c.offset !== 'number' || !Number.isInteger(c.offset)
      || c.offset < 0 || c.offset > (n.content as string).length) {
    return { ok: false, field: 'children' }
  }
}
```

- **A child with `offset` ABSENT** → valid (append-after, back-compat).
- **A child with `offset` present** must be a **non-negative INTEGER ≤
  `node.content.length`**; else `{ ok: false, field: 'children' }`.
- **Write-time:** `putNode` with an out-of-bound/non-integer `offset` throws
  `Error('rag putNode: children required/invalid')` (the existing pattern); the
  store is unchanged.
- **Boot:** a persisted record with a malformed (out-of-bound/non-integer)
  `offset` fails `validateNodeShape` → SKIPPED (never loaded), like any other
  malformed child field; a tampered `offset` (changed without a hash update) is
  QUARANTINED (the existing hash source covers `children` — M §5.2).

**`isValidChildren` (boot/journal/batch-ops validator, in `rag-store.ts` +
mirrored in `edit-ops.ts`) — the amended branch (pinned):** `isValidChildren`
has NO `content` in scope, so it enforces the SHAPE part only:

```ts
if (typeof child.offset !== 'undefined') {
  if (typeof child.offset !== 'number' || !Number.isInteger(child.offset) || child.offset < 0) {
    return false
  }
}
```

- **`isValidChildren` enforces a non-negative INTEGER `offset`** (shape-only); it
  does NOT (cannot) enforce `offset ≤ content.length` — that is the
  `validateNodeShape` node-level bound (§5.1, flag §6.1).
- `isValidChildren` is used for the journal entry + batch-op children validation
  (`setSubtree`/`setRichText`) at boot/apply; a negative/non-integer `offset`
  fails it (the entry/op is skipped/rejected).

### 5.2 `nodeText` — the full-projection retrieval reconciliation (A4-i)

**`nodeText(node)` (in `src/main/retrieval.ts`) — the amended behavior (pinned):**

```ts
export function nodeText(node: RagNode): string {
  if (node === null || node === undefined) throw new Error('nodeText: node required')
  // content is the FULL plain-text projection (M1). Offset-bearing children's
  // text is ALREADY inside content — do NOT append it (avoids double-count).
  // Offset-ABSENT (legacy) children append AFTER, space-joined, dropping empties
  // (byte-compatible with the pre-M4 join for legacy nodes).
  const legacy = (node.children ?? []).filter((c) => c.offset === undefined).map((c) => c.content)
  const tail = legacy.filter((s) => s !== '').join(' ')
  return tail === '' ? node.content : `${node.content}${node.content === '' || node.content.endsWith(' ') ? '' : ' '}${tail}`
}
```

**`nodeText` rules (pinned):**

- **Signature:** `nodeText(node: RagNode): string`. `nodeText(null) / nodeText(undefined)`
  → throws `Error('nodeText: node required')` (UNCHANGED).
- **Returns `node.content` (full projection)** — the offset-BEARING children's
  text is already inside it; the old `[...content, ...allChildContent].join(' ')`
  is DROPPED (it would double-count offset-bearing children).
- **Offset-ABSENT (legacy) children append AFTER** (space-joined, empty strings
  dropped) — **byte-compatible with the current `nodeText` for a node whose
  children are all offset-absent** (the pre-M1 parent-only `content` + the
  child join). Separator: a single space between `content` and the tail, but no
  trailing-space change when `content` is empty or already space-terminated
  (the exact separator join is pinned to preserve legacy byte-equality for the
  pure legacy case: when `content` is a plain run and all children are
  offset-absent, the result equals the OLD `[content, ...children].filter(!='').
  join(' ')`).

**The three index builders** (`createLexicalIndex`, `updateLexicalIndex`,
`addToLexicalIndex`, `removeFromLexicalIndex` — `retrieval.ts`) already tokenize
`nodeText(node)` (Unit Q §5.2) — they inherit the reconciliation with NO code
change. The `renderInlineText` markdown helper (Unit Q §5.3) — reconciled
separately (it reflects the model the traversal now emits via `bodyRuns`; see
cross-ref Unit Q) — not changed by M4 itself.

### 5.3 Textarea `value: node.content` — full-projection (documented change)

- **The textarea authoring (`buildSubtree`, `src/main/traversal.ts` — Unit L/R)
  is UNCHANGED in shape** — `value: node.content` (the textarea overlay id
  `textarea-<ragId>`, the handlers, NO-`readOnly`). **The MEANING of that
  `value` changes**: with M1, `node.content` is the full projection (inline text
  included) → the textarea editing overlay now displays the complete text.
- **Documented change (A4-ii, pinned):** a rich/interleaved node's textarea shows
  `content` = the full projection (text runs + inline text), matching what the
  rendered DOM/markdown show. This is a deliberate, documented behavior
  change (the textarea was previously bound to parent-only `content`).
- The textarea remains a RENDER-ONLY overlay NOT in the markdown
  (TEXTAREA-RENDER-ONLY-OVERLAY); it still does not contribute lines to the
  lineMap.

### 5.4 U5 `setRichText` — atomic content + children + offsets (A4-ii)

- **`setRichText(ctx, { nodeId, content, children })` (in `src/main/edit-ops.ts`)
  is UNCHANGED in signature** but now carries offset-bearing `children` (M1).
  It writes BOTH `content` AND `children` (including each child's `offset`) in
  ONE `putNode` — **atomic: an edit cannot write a new `content` without the
  matching children/offsets (or vice versa), so offsets cannot be orphaned
  against `content` (A4-ii)**.
- **No-orphan guarantee (pinned):** because `setRichText` writes the tuple
  atomically, a successful `setRichText` never leaves a node with `content` and
  `children.offset`s that disagree with the full-projection invariant (the
  producers — M1 — generate them together).
- **`sameChildren`/`deriveRichCommitBroadcast` now compare `offset`**
  (`sameChildren` deep-compares the children, which includes `offset`): a child
  whose `offset` changed is "changed" → `deriveRichCommitBroadcast` returns a
  `structural` broadcast (offset change → traversal re-derives the inline
  subtree) — A5.
- The ONLY throw path is unchanged (`putNode` validateNodeShape — the store
  bound-checks the offsets now, §5.1); the fail-closed atomic property holds
  (neither field applied on a throw).
- **Not-changed ops (pinned):** `setContent` (content-only) and `setSubtree`
  (children-only) are NOT made atomic by M4 — a caller using them can still
  write a mismatched tuple, but the resulting node is rejected at write if its
  offsets violate the bound (validateNodeShape) and is a documented consequence
  of using a non-atomic op. `setRichText` is the designated atomic rich write.

### 5.5 `splitNode at` — the inside-span fail-state + boundary attribution (A4-iii)

**`splitNode(ctx, { nodeId, at })` (in `src/main/edit-ops.ts`) — the amended
behavior (pinned):**

- **Existing validation UNCHANGED:** `nodeId` non-empty string; `at` an integer
  in `[1, content.length - 1]`; nonexistent node →
  `{ ok:false, error:'edit.split_node: node not found' }`; invalid `at`
  (non-integer, <1, ≥ content.length) →
  `{ ok:false, error:'edit.split_node: invalid offset' }`.
- **NEW inside-span fail-state (A4-iii, pinned):** for each OFFSET-BEARING
  inline child, if `at` lies STRICTLY inside the child's span — i.e.
  `child.offset < at && at < child.offset + child.content.length` — the split is
  a DOMAIN fail-state:
  `{ ok:false, error:'edit.split_node: inside inline run' }`. The op NEVER
  splits mid-child (which would break the child element + orphan its offsets).
- **Boundary splits (pinned, NOT rejected):**
  - `at === child.offset` (the child's START boundary) → the SPLIT IS VALID; the
    child is attributed to the NEW (right) node, re-based to
    `offset' = 0` (its span starts at the boundary) / `offset' = child.offset - at`.
  - `at === child.offset + child.content.length` (the child's END boundary) → the
    SPLIT IS VALID; the child is attributed to the ORIGINAL (left) node
    (its span ends at the boundary), `offset` unchanged.
- **Children attribution + re-basing (pinned):** partition the offset-bearing
  children by their span relative to `at`:
  - span entirely `< at` (end boundary ≤ at) → stays with the ORIGINAL, `offset`
    unchanged;
  - span entirely `≥ at` (start boundary ≥ at) → moves to the NEW node, `offset`
    re-based to `offset' = offset - at`;
  - a straddling span is IMPOSSIBLE (an inside-span `at` is rejected).
  The left/right children arrays are assigned to `original` / `fresh`
  respectively; the doc-child edge + `order = max+1` behavior is UNCHANGED.
- **Offset-ABSENT (append-after, legacy) children (pinned):** their spans lie
  beyond `content.length` (append-after), so any valid `at < content.length` is
  NEVER inside them — the new fail-state cannot trigger for them. They are
  attributed to the NEW (right) node (they render after the split point; the
  right node continues the content sequence). **Back-compat:** a legacy node
  (all offset-absent) splits exactly as pre-M4 (byte-compatible; the inside-span
  branch is unreachable).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **`validateNodeShape` accepts a valid `offset`:** a node with a child
   `offset` in `[0, content.length]` → `putNode` succeeds; `getNode` returns it
   with `offset` intact.
2. **`validateNodeShape` accepts `offset` absent:** a child without `offset` →
   valid (append-after, back-compat); stored unchanged.
3. **`validateNodeShape` accepts `offset === content.length`:** a child whose
   offset equals the final content length → valid.
4. **`isValidChildren` accepts a non-negative integer `offset`:** the shape
   check passes (batch/journal paths).
5. **`nodeText` full projection:** a node with offset-bearing children →
   `nodeText(node) === node.content` (the join is dropped; no double-count).
6. **`nodeText` legacy byte-compat:** a node with only offset-ABSENT children →
   `nodeText(node) === ` the OLD `[content, ...childContent].filter(!='').join(' ')`
   (byte-identical).
7. **`nodeText` mixed:** a node with both offset-bearing + offset-absent children
   → `content` (which includes offset-bearing text) + the offset-absent tail
   appended per §5.2.
8. **Index builders inherit `nodeText`:** `createLexicalIndex`/`update`/`add`
   tokenize the reconciled `nodeText` (no code change; a new-node edit
   re-tokenizes full-projection text).
9. **Textarea full projection:** a rich node's authored `value: node.content` is
   the full projection (the documented change).
10. **`setRichText` atomic write with offsets:** `setRichText({ nodeId, content,
    children })` where the children carry offsets → ONE node record with the full
    tuple; no orphaned offsets.
11. **`setRichText` offset-change broadcast:** a child whose `offset` changed
    between before/after → `deriveRichCommitBroadcast` returns a `structural`
    broadcast.
12. **`splitNode` outside any span:** `at` between child spans (not strictly
    inside) → valid split; children attributable per §5.5.
13. **`splitNode` at a START boundary:** `at === child.offset` → valid; the child
    moves to the new (right) node with re-based offset.
14. **`splitNode` at an END boundary:** `at === child.offset + child.content.length`
    → valid; the child stays with the original (left) node.
15. **`splitNode` legacy (all offset-absent):** any valid `at` → split proceeds
    exactly as pre-M4 (no inside-span branch); offset-absent children → new node.
16. **`splitNode` returns the partitioned tuple:** the returned
    `{ nodes:[original, fresh], edge }` carries the correct partitioned children
    (offset-bearing: left/right per §5.5; offset-absent: right).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`validateNodeShape` rejects a non-integer `offset`** (e.g. 1.5) →
   `{ ok:false, field:'children' }`; `putNode` throws
   `Error('rag putNode: children required/invalid')`.
2. **`validateNodeShape` rejects a negative `offset`** (−1) → same rejection.
3. **`validateNodeShape` rejects `offset > content.length`** → same rejection.
4. **A persisted record with a malformed `offset` at boot** → SKIPPED (never
   loaded); `status().loadedNodes` excludes it.
5. **A persisted record whose `offset` was tampered (changed without a hash
   update) at boot** → QUARANTINED; `status().quarantined` includes it.
6. **`isValidChildren` rejects a negative or non-integer `offset`** (shape-only;
   the content-length bound is NOT enforced here — flag §6.1). A journal/batch
   children array with such an `offset` is rejected.
7. **`nodeText(null)`/`nodeText(undefined)`** → throws
   `Error('nodeText: node required')` (UNCHANGED).
8. **`splitNode` inside an offset-bearing span:** `at` strictly inside a child
   span → `{ ok:false, error:'edit.split_node: inside inline run' }` (domain;
   never a throw). The store is UNCHANGED (no partial mutation).
9. **`splitNode` inside-span is NOT triggered by boundary `at` values** (start /
   end boundaries are valid — §5.5): a test asserts boundaries are NOT rejected.
10. **`splitNode` legacy nodes never hit the inside-span branch**: a legacy
    (offset-absent only) node with any valid `at` → the pre-M4 split, never
    `'inside inline run'`.
11. **`setRichText` with an out-of-bound offset** → the store rejects it
    (`putNode` throw, §5.1); the write is fail-closed (neither field applied).

### 5.8 TDD red-set framing

- **Unit-M4 red set = §5.6 + §5.7** against `rag-store.ts` (`validateNodeShape` /
  `isValidChildren` offset branch), `retrieval.ts` (`nodeText`), and
  `edit-ops.ts` (`setRichText` comparison + `splitNode` inside-span/attribution).
  The TestWriter RUNS it before implementation (RCA-1) — the offset branch /
  `nodeText` reconciliation / `splitNode` inside-span do not exist → the red set
  fails. The Implementer lands the least code to go green (RCA-1/2).
- **Documentation reconciliation (RCA-6, in the same pass):** update
  `docs/specs/unit-q-retrieval-children-indexing.md` (the `nodeText` join +
  §5.1/§5.6/§5.7 claims) and `docs/specs/unit-d-editing.md` (§5.1.5 `splitNode`
  + the census) to reflect the M4 `nodeText`/`splitNode` reconciliation, so a
  fresh sub-agent inherits accurate claims.
- After the greens: blind-run + documentation review (RCA-4/6) + adversarial pass
  (§3a TBD).

### 5.9 Cross-references

- Gate: `docs/specs/inline-order-render-fix-review.md` §3 **A4** (content-meaning
  reconciliation — nodeText/lexical index, textarea, setRichText atomic, splitNode
  inside-span fail-state), **A6** (offset optional, absent = append-after,
  validation bound-check), §4 (M4 last in the execution order), §5 (costs — the
  splitNode-at-inside-run becomes a new documented domain fail-state).
- M1: `docs/specs/unit-m1-inline-offset-model.md` §5.1 (the `offset?` field + the
  `content` full-projection meaning), §5.2 (the append-after back-compat + the
  full-projection invariant), §5.5 (the offset bound `[0, content.length]`).
- Unit Q: `docs/specs/unit-q-retrieval-children-indexing.md` §5.1 (the `nodeText`
  helper this unit reconciles), §5.2 (the three index builders that tokenize
  `nodeText(node)`). (To be updated in the M4 doc pass — §5.8.)
- Unit D: `docs/specs/unit-d-editing.md` §5.1.5 (the `splitNode` op this unit
  amends — the new inside-span fail-state + children attribution). (To be
  updated in the M4 doc pass — §5.8.)
- Unit U5: `docs/specs/unit-u5-set-rich-text.md` §1.2/§1.3 (the `setRichText`
  atomic write + `deriveRichCommitBroadcast` — the offset-carrying children +
  the offset-change structural broadcast).
- Unit L / Unit R: `docs/specs/unit-l-textarea-editing-ui.md` §5.1 and
  `docs/specs/unit-r-traversal-inline-children.md` §5.5 (the textarea
  `value: node.content` — the full-projection meaning change documented here).
- Unit M: `docs/specs/unit-m-children-field.md` §5.4 (the `children` shape
  validation branch this unit extends with the `offset` bound), §5.5 (the journal
  snapshot).
- Host patterns: `src/main/rag-store.ts` (`validateNodeShape`, `isValidChildren`),
  `src/main/retrieval.ts` (`nodeText` + the index builders),
  `src/main/edit-ops.ts` (`setRichText`, `setContent`, `setSubtree`, `splitNode`),
  `src/main/traversal.ts` (the textarea `value: node.content`).

## 6. Flags / ambiguities (raised, not guessed)

1. **`isValidChildren` cannot enforce the content-length offset bound (raised —
   a real scope limit).** `isValidChildren(v)` validates a `children` array with
   no `content` in scope, so it enforces only the shape (non-negative integer);
   the `≤ content.length` bound is enforced by `validateNodeShape` (node scope).
   A `setSubtree`/`setRichText` batch/journal entry carrying a child with an
   out-of-bound-for-its-content offset would pass `isValidChildren` shape but be
   rejected node-side at write. This is pinned (§5.1) so the TestWriter does not
   write a contradictory `isValidChildren` bound test.
2. **`splitNode` offset-absent (legacy) child attribution (raised — a decision,
   pinned):** offset-absent children are attributed to the NEW (right) node
   (§5.5). This keeps the append-after tail with the split's trailing content and
   is byte-compatible for the all-legacy case, but the exact split of a mixed
   legacy+rich node's offset-absent tail is an edge the adversarial pass should
   probe (flagged, not guessed).
3. **`nodeText` separator for the mixed (offset-bearing + offset-absent) case
   (raised, pinned):** the exact space-separator join (§5.2) is pinned to preserve
   legacy byte-equality for the pure-legacy case; the mixed-case separator is an
   implementation detail the §5.6-7 test fixes. Any change to the pure-legacy
   separator would break byte-compat — flagged as the invariant the adversarial
   pass must not regress.
