# Spec — Unit M1: The `offset?: number` Model + the Full-Projection Producers

- **Status:** SPEC. This is M1 of the four-unit **Inline-Ordering Render Fix**
  program (gate reference: `docs/specs/inline-order-render-fix-review.md`,
  **PROCEED-WITH-AMENDMENTS**, amendments A1–A8, 2026-08-31; user go-ahead
  REQUIRED before red→green work). This unit is the **design-B model +
  producers** slice (the reviewed shape: per-child numeric `offset?`, `content`
  stays the stored full-plain-text scalar). It is the ONLY unit that changes the
  `RagNodeChild`/`RagNode` shape (per A8, the shape change is exclusive to M1;
  M2/M3/M4 consume it). Execution order is M3 → M1 → M2 → M4 (A1: the M3 rewrite
  unit must land before the M2 emit unit); M1 is unit 2 in execution order.
- **Scope:** (a) the additive `offset?: number` field on `RagNodeChild` in
  `src/main/rag-store.ts` + the `RagNode.content` meaning change to the FULL
  plain-text projection; (b) the THREE producers — `markdown-parse.ts`
  `parseInline`, `paste-sanitize.ts` `sanitizePastedHtml`, and
  `rich-decompose.ts` `decomposeRichHtml` — must ALL emit full-projection
  `content` + per-child `offset` together (A5), otherwise imported/pasted/edited
  nodes diverge in model meaning. It does NOT emit the engine `bodyRuns` (M2),
  does NOT contain the host-side rewrite (M3), and does NOT touch validation /
  retrieval / textarea / splitNode reconciliation (M4).
- **TestWriter contract:** every API signature, return shape, throw pattern,
  happy-path state, and fail-state below is derivable from this spec ALONE. The
  TestWriter writes the red set for the amended `src/main/rag-store.ts`
  (`RagNodeChild.offset`), the amended `parseInline`, the amended
  `sanitizePastedHtml`, and the amended `decomposeRichHtml` from §5.6/§5.7
  before any implementation. Red-set framing per §5.8 (what test asserts what).

---

## 1. What the proposal asks

1. **`RagNodeChild` gains an optional `offset?: number`** — the 0-based char
   offset into the owning node's FULL plain-projection `content` at which this
   child's run slot begins. ABSENT (`undefined`) = append-after-content (the
   current v1 default; backward-compatible with pre-B stored nodes — A6).
2. **`RagNode.content` MEANING CHANGE:** `content` becomes the FULL plain-text
   projection in document order — the text runs on the node itself PLUS the text
   inside the inline children, concatenated — the SINGLE coordinate space the
   child `offset`s index into. (Previously `content` was parent-only text;
   child text lived only on the children.) The stored scalar is unchanged in
   type (still `string`); only its meaning is widened.
3. **The THREE producers emit full-projection `content` + per-child `offset`
   together** (A5): `markdown-parse.parseInline`, `paste-sanitize.
   sanitizePastedHtml`, `rich-decompose.decomposeRichHtml`. If any producer
   still emits parent-only `content` with offset-less children, its outputs
   diverge from the others — a model inconsistency (A5 is the guard).
4. **No `RagNode.body` run-list** (Design A was REJECTED at gate, §7); the
   offset-annotation is the only added shape.

## 2. Feasibility verdict

**Feasible — a purely additive shape + a meaning change on scalar `content`,
grounded in the already-landed `src/main/rag-store.ts` (Unit M) and the three
PURE producer modules.** Each producer already computes `{ content, children }`
in document order; adding an `offset` to each emitted child (the char offset at
which the child's run begins in the full projection) + accumulating child text
into `content` is a localized change. The `children` deep-copy + dangerous-key +
shape-validation machinery in the store already round-trips the child objects;
`offset` rides the same paths. No engine change — this unit is entirely
host-side data-model + producers. No handoff item is opened by this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `RagNodeChild.offset?: number` (additive) | Project-specific (the RAG data model) | Low cost; the coordinate the traversal/`bodyRuns`/offline-render rely on (M2). |
| `RagNode.content` meaning → full projection | Project-specific | Meaning change; cascades to M4 retrieval/textarea/splitNode (the 4-unit scope, gate §5). |
| The three producers emit full-projection `content` + offsets | Project-specific | Low-to-moderate cost; guarantees imported/pasted/edited nodes share ONE model meaning (A5). |
| The full-projection + offset model invariants | Project-specific | Low cost; pinned here, asserted at the M2 A7 gate; keeps offset/spans/`bodyRuns` self-consistent. |

No engine gap. The `bodyRuns` emit (M2), the host rewrite (M3), and validation /
retrieval / textarea / splitNode reconciliation (M4) are LATER slices — NOT this
unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (the adversarial pass must NOT
regress them):

- **A1 — a producer MUST NOT emit a negative or out-of-range `offset`** (must
  satisfy 0 ≤ offset ≤ content.length, the §5.5 bound).
- **A2 — a producer MUST emit `offset` on EVERY inline child it emits** — a
  producer that emits a child with NO `offset` while other children carry one
  would mix model meanings (offset-absent = append-after vs offset = positioned);
  the three producers are pinned to emit offsets consistently on all children.
- **A3 — nested inline flattened to a sibling inherits the OUTER child's offset
  slot** (§5.3) — the flattened sibling and its outer child share one offset and
  emit back-to-back; they must NOT get distinct mid-span offsets (which the
  contiguous-span model cannot represent).
- **A4 — an `img` child (content `''`) still occupies an offset slot** at its
  document position (its empty run contributes no text, so splice-reconstruction
  is unaffected, but its offset is still emitted).
- **A5 — empty-`content` child text still appears in the full projection only
  where it belongs**; a dropped `img` (missing/unsafe `src`) contributes NO text
  and NO child (the drop discipline is preserved).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings — none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.
(Run 2026-08-31 — M1 model + producers.)

**Host findings (resolved in M3/M4 — the downstream reconciliation surface):**
- **H1 (HIGH)** `retrieval.nodeText` (`retrieval.ts:54-59`) joins `content` (now the
  full projection, includes child text) + children's content → every child's text
  double-counted (e.g. `**Proposal:** Astrographer` → `"Proposal: Astrographer
  Proposal:"`), inflating the lexical index. Fix: read `content` alone for
  offset-bearing children; only append offset-absent (legacy) children's content.
  → M4.
- **H2 (HIGH)** `renderInlineText` (`retrieval.ts:366-383`) re-appends child
  content on top of the full projection → doubled in the markdown export. → M4.
- **H3 (HIGH)** `traversal.buildSubtree` (`traversal.ts:362,375-383`) sets content to
  the full projection AND emits one child element per inline child → the child text
  renders twice + the textarea duplicates; the M3 emit must place children at their
  offsets (not double-emit). → M3.
- **H4 (MED)** `splitNode` (`edit-ops.ts:227-267`) validates `at` against the full
  projection but keeps the original `children`/offsets on the split head and gives
  the tail NO children → inline formatting crossing the cut is lost + stale offsets.
  → M4 (the split-at-inside-run fail-state).
- **H5 (MED)** `setContent` (`edit-ops.ts:156-166`) replaces `content` while keeping
  old `children`/offsets → out-of-bound/re-shifted positions. → M4.
- **H6 (MED)** store write-time `validateNodeShape`/`isValidChildren`
  (`rag-store.ts`) do NOT validate `offset` (accepts `-5`, `2.7`, `"x"`, `> content.length`,
  mixed present/absent) — a tampered `RagNode` JSON persists silently. → M4 (A6 bound-check).

**Minor / accepted notes:**
- **L1 (LOW)** unsafe-link demotion embeds literal markdown markers in the "plain"
  projection (`[**b**](javascript:…)` → `**b**`) — diverges from safe-link flattening;
  accept or normalize in M4.
- **L2 (LOW)** dropped-`img` trailing-text divergence between paste-sanitize ("Hello ")
  and rich-decompose ("Hello  world") — pre-existing, accepted.
- **L3 (LOW)** `offset` is a UTF-16 code-unit index, not a grapheme; runs are whole
  strings so a run never splits a surrogate pair and the splice invariant holds for
  emoji. M2/M3 must slice/count in code units.

**Spec self-inconsistency (proofread):** §5.6-5 claims `parseInline("**bold *em* tail**")`
→ `content = 'bold tailem'` (one space), but §5.3's worked example + the code yield
`'bold  tailem'` (two spaces). §5.3/§5.6-5 must agree.

### 3b. Proposal-review findings

The proposal-review gate (`docs/specs/inline-order-render-fix-review.md`,
2026-08-31) returned **PROCEED-WITH-AMENDMENTS** for the inline-ordering fix,
**Design B** (per-child `offset` annotation, `content` stays the stored full
scalar, host-side rewrite). The amendments THIS unit resolves:

- **A5 — Producer consistency** (§5.1–§5.5): all three producers emit
  full-projection `content` + offsets together.
- **A6 — Back-compat + validation** (§5.2/§5.10): `offset` optional; absent =
  append-after (current behavior); the full-projection + bound invariants
  (validation bound-check is M4, §5.8).
- **A8 — process** (§0/§5.8): M1 is its own red→green→adversarial→greens→
  doc-review cycle; the ONLY unit changing the `RagNodeChild`/`RagNode` shape.

## 4. Design decisions pinned by this spec

- **DESIGN-B (consumed, the gate's architecture verdict):** per-child `offset?`
  on `RagNodeChild`; `RagNode.content` stays the stored FULL plain-projection
  scalar; NO `RagNode.body` run-list (Design A REJECTED — gate §7).
- **RAG-AUTHORITATIVE (consumed, Unit R):** the RAG store is authoritative; the
  offset + full-projection scalar are persisted on the node (via `children` +
  `content`), and the provident graph is a transient render materialization.
- **HASH-VERIFIED-SOURCE (consumed, Unit A §5.7):** `nodeSource` already covers
  `children` (Unit M §5.2) — an `offset` change on a child changes the node's
  hash; the existing additive-load/hash discipline is unchanged (additive field).
- **SUBTREE-OWNERSHIP (consumed, Unit R):** inline children remain inline content
  held on the owning node; `offset` rides the existing `children` persistence.

## 5. The exhaustive contract

### 5.1 The shape change (the ONLY shape change of the whole program)

`src/main/rag-store.ts` — `RagNodeChild` gains one additive optional field.
`RagNode` is unchanged structurally (only `content`'s MEANING changes). `RagNodeType`
and `RagNodeChildType` unions are unchanged.

**The amended `RagNodeChild` (pinned):**

```ts
export interface RagNodeChild {
  type: RagNodeChildType   // 'strong' | 'em' | 'a' | 'img'  (UNCHANGED)
  content: string          // the child's OWN text content (UNCHANGED; may be '')
  props?: Record<string, unknown>  // (UNCHANGED)
  /** NEW — the 0-based char offset into the owning node's FULL plain-text
   *  `content` at which this child's run slot begins. ABSENT = append-after
   *  content (the v1 default; backward-compatible). 0 ≤ offset ≤ content.length. */
  offset?: number
}
```

**`RagNode.content` meaning (pinned):** `content` is the FULL plain-text
projection in document order — the node's own text runs PLUS the text inside
every inline child — concatenated in the flattened emission order (§5.3). It is
the single coordinate space all child `offset`s index into. The field type stays
`string`; `nodeSource`/`nodeHash`/persistence/load are unchanged in shape.

**Shape rules (pinned):**

- **`offset` is OPTIONAL.** A child without `offset` is the current v1 default
  (its run is appended AFTER `content`; its text may or may not be inside
  `content`, see §5.2 back-compat).
- **`offset`, when present, is a non-negative integer** with **0 ≤ offset ≤
  node.content.length** (the bound, §5.5).
- **`offset` is a coordinate into the FULL projection**, not into any parent-text
  substring.
- `offset` is a child-level field; `RagNode` gains no new field except the
  `content` meaning change.
- **This is the ONLY shape change in the whole inline-ordering program** — M2/M3/
  M4 do NOT further change `RagNodeChild`/`RagNode` (A8).

### 5.2 Back-compat (offset-absent = append-after) + the full-projection invariant

**Append-after semantics (pinned):** a child with `offset` ABSENT is treated as
appended AFTER the node's full `content` (the current v1 render + retrieval
behavior). An offset-absent child's text is NOT counted inside `content` — it
only ever contributes its own `child.content`, in `children` order, after the
end of `content`. This is what makes offset-bearing and offset-absent children
byte-compatible with the current `nodeText` for the legacy case (see M4).

**The full-projection invariant (pinned):** define the splice-reconstruction of
a node as the string produced by starting with `content` and, for each child in
`children` order, nothing more to splice (the projection ALREADY includes child
text). Equivalently the invariant is the FORWARD form:

> For every node produced by any of the three producers, `content` EXACTLY
> equals the concatenation of the runs, where each run is either the node's own
> text run or a child's own `content` text, in flattened emission order (§5.3).
> Each child's `offset` equals the length of `content` accumulated before that
> child's run begins.

This is the MODEL-side statement of the M2 A7 gate (the traversal-generated
`bodyRuns` must exactly reproduce `content`); M1 pins the production-side of the
same invariant.

**Forward-compat (pinned):** an upstream engine fix that makes the placement
path-state wire resolution work has NO effect on this unit (offset/full
projection are host model facts independent of the engine's wire behavior).

### 5.3 The parser offset rule (leading / mid / trailing runs; nested flattening)

`parseInline(text)` (in `src/main/markdown-parse.ts`) is amended to produce
full-projection `content` + per-child `offset`. The rule is shared in essence by
all three producers (each is a document-order accumulator).

**Offset + accumulation rule (pinned):**

- Walk the inline input in document order, accumulating a `content` string.
- A **leading text run** (text before the first child) is appended to `content`;
  its offset span is `[0, len)`.
- When an inline element is recognized (link `[..](..)`, `strong`/`em`, `img`):
  record the child's `offset = CURRENT content.length` (before the child's own
  text is appended), then append the child's OWN text to `content`. A **mid or
  trailing text run** is appended after the preceding child's run.
- **Nested-inline flattening to a sibling inherits the OUTER child's offset
  slot:** when a child-producing element is nested inside another, its flattened
  sibling is emitted immediately AFTER the outer child ("back-to-back"), sharing
  the OUTER child's `offset` (A3). It does NOT receive a distinct mid-span
  offset (the contiguous-span model cannot represent a child split around
  another child). Concretely, for `outer` with inner `{ content, children }`:
  the outer child carries `content` (its OWN text) and `offset = cur`; each
  flattened `inner.children` sibling carries the SAME `offset = cur` and is
  appended (content + child) in order; `cur` advances by the sum of the appended
  text.
- **Inline code** (`` `code` ``) is folded into `content` as plain text with NO
  child/offset (unchanged from the current fold).
- **Raw HTML** dropped entirely (unchanged).
- The function stays TOTAL (never throws on malformed markdown; depth caps
  unchanged).

**Worked example (the reported defect), `- **Proposal:** Astrographer …`:**
`parseInline("**Proposal:** Astrographer")` →
- strong recognized at 0: offset = 0; append children's+outer text.
- outer strong `content` = "Proposal:" (its own text); offset `0`.
- trailing text " Astrographer" appended after the strong's run.
- result: `content = "Proposal: Astrographer"`, `children = [{ type:'strong',
  content:'Proposal:', offset: 0 }]`. The strong's run occupies `[0,9)`.

**Worked example (nested flatten), `**bold *em* tail**`:** outer strong
`{ content:'bold  tail', offset:0 }`; the flattened em sibling inherits
`offset:0`, `content:'em'`. `content = 'bold  tail' + 'em' = 'bold  tailem'`.
Splice reconstruction (children at their offsets) reproduces `content` exactly
(em's empty-slot at 0 adds 'em' after the strong — back-to-back at offset 0).

### 5.4 The paste-sanitize + rich-decompose rules

Both producers already process an HTML string into a document-order
`{ content, children }` via the shared iterative `processNodes` merge. M1 amends
the merge to (a) accumulate full-projection `content` (the node's own text runs
+ each child's own text) and (b) stamp an `offset` on each emitted child.

**Common rule (pinned, both producers):**

- Each emitted child's `offset = CURRENT accumulated content.length` at the
  moment its run is produced (before the child's own text is appended).
- Text nodes and unwrapped-element text append to `content` (full projection).
- A child-producing element (`strong`/`em`/`a`/`img`, with the `b`→`strong` /
  `i`→`em` mapping in rich-decompose) emits ONE child whose `content` is its own
  text (`inner.content`) and whose `offset` is recorded at its slot;
  nested child-producing descendants are hoisted to siblings AFTER it, each
  INHERITING the outer child's offset slot (same rule as §5.3).
- Dropped elements (disallowed / unsafe-URL) emit NO child and NO text —
  unchanged drop discipline.

**`sanitizePastedHtml` specifics (pinned):** the `SanitizePasteResult.ok` shape
is unchanged (`{ ok, html, content, children }`) EXCEPT that every child in
`children` carries an `offset` (full-projection rule). `html` is unchanged (the
sanitized order-preserving markup). The only fail-state is unchanged: a
non-string input → `{ ok:false, error:'sanitizePastedHtml: input must be a
string' }`.

**`decomposeRichHtml` specifics (pinned):** the `DecomposeRichResult.ok` shape
is unchanged (`{ ok, content, children }`) EXCEPT each child carries an `offset`.
`img` is void in the rich model: an `img` child has `content:''` and an `offset`
(empty run) at its document position (A4); a dropped `img` contributes nothing.
The only fail-state is unchanged: a non-string input → `{ ok:false, error:
'decomposeRichHtml: input must be a string' }`.

### 5.5 The offset bound + numeric/invariant claims (census)

- **Offset bound:** for every emitted child, **0 ≤ offset ≤ content.length**
  (where `content` is the FINAL full projection). `offset === content.length`
  is allowed (a child at the very end — its empty/text run is the last slot).
- **Run-count / offset monotonicity is NOT required to be strictly increasing:
  distinct top-level children have strictly increasing offsets; flattened nested
  siblings SHARE an offset (back-to-back).** The order of children by
  `offset` is STABLE (equals `children` array order when sorted stably; equal
  offsets keep `children`-relative order).
- **Full-projection splice reproduction:** for every producer output,
  splice(content, children) === content (§5.2). This is the MODEL invariant that
  the M2 A7 gate re-asserts on the traversal-generated `bodyRuns`.

**Census / numeric claims:**

- **New field on `RagNodeChild`:** 1 — `offset?: number` (optional, additive).
- **Structurally changed types:** 1 — `RagNodeChild` (one added field). `RagNode`
  is structurally UNCHANGED (only `content`'s meaning changes).
- **Producers amended:** 3 — `parseInline` (markdown-parse.ts),
  `sanitizePastedHtml` (paste-sanitize.ts), `decomposeRichHtml`
  (rich-decompose.ts).
- **`RagNodeChildType` union members:** 4 — `strong`, `em`, `a`, `img`
  (UNCHANGED; `span` still not a member).
- **`RagNodeType` union members:** 18 (UNCHANGED).
- **Offset domain:** integer in `[0, content.length]`.
- **Nested-flatten offset slots:** 1 per outer child (all flattened nested
  siblings share the outer's offset).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **`RagNodeChild.offset` field present:** the `RagNodeChild` interface exposes
   `offset?: number`.
2. **`parseInline` leading text + child + trailing text:** `parseInline("pre **b** post")`
   → `content = 'pre b post'`, `children = [{ type:'strong', content:'b',
   offset: 4 }]` (the strong run occupies `[4,5)`).
3. **`parseInline` full-projection splice:** for the §5.6-2 output,
   splice(content, children) === content.
4. **`parseInline` the reported defect:** `parseInline("**Proposal:** Astrographer")`
   → `content = 'Proposal: Astrographer'`, child `{ type:'strong',
   content:'Proposal:', offset: 0 }`.
5. **`parseInline` nested flatten inherits the outer slot:** `parseInline("**bold *em* tail**")`
   → two children `[{type:'strong',content:'bold  tail',offset:0},
   {type:'em',content:'em',offset:0}]`; `content = 'bold  tailem'`; splice === content.
6. **`parseInline` inline code folded with no child/offset:** inline `` `code` ``
   appears in `content`, no child emitted.
7. **`parseInline` all four child types:** a markdown string with `strong`, `em`,
   `a` (safe href), `img` (safe raster src) → four children, each with a
   distinct increasing offset (top-level), and `content` is the full splice.
8. **`parseInline` link demotion:** an `a` with an unsafe href → demoted to
   plain text: its text is in `content`, NO `a` child/offset.
9. **`parseInline` img drop:** an `img` with a missing/unsafe src → no `img`
   child, no text contributed.
10. **`sanitizePastedHtml` emits offsets:** sanitizing a pasted fragment with
    inline markup → every child in `children` carries an `offset` in
    `[0, content.length]`; `content` is the full projection (splice === content).
11. **`sanitizePastedHtml` span fold + hoist:** a `span` folding to the parent
    with hoisted nested children → the hoisted children carry their offsets per
    §5.4 (nested inherits the outer slot).
12. **`sanitizePastedHtml` image offset slot:** an `img` child (content `''` →
    content `''` only) still carries an `offset` at its document position.
13. **`decomposeRichHtml` emits offsets:** decomposing a contenteditable blur
    with inline markup → every child in `children` carries an `offset`;
    `content` is the full projection (splice === content).
14. **`decomposeRichHtml` nested `b`→`strong` inherits slot:** a nested
    `b`→`strong` / `i`→`em` flattened sibling inherits the outer child's offset.
15. **`decomposeRichHtml` img void slot:** an `img` child (`content:''`, safe
    src) carries an `offset` at its position; a dropped `img` contributes
    nothing.
16. **`offset === content.length`:** a child whose run is the last slot has an
    offset equal to the final `content.length` (valid, no throw).
17. **Determinism:** the same input to any producer ALWAYS produces the same
    `content` + same child offsets.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **A producer emitting a negative `offset`** → the child is outside the bound
   `[0, content.length]`; this is a MODEL violation (the producer MUST NOT emit
   it). Under §5.5, a test asserts every emitted child's offset is in
   `[0, content.length]` (A1).
2. **A producer emitting `offset > content.length`** → out of bound; a test
   asserts the bound (A1).
3. **A producer emitting a child WITHOUT `offset` among offset-bearing
   siblings** → inconsistent model meaning (offset-absent = append-after vs the
   positioned siblings). The three producers are pinned to emit `offset` on
   EVERY emitted child (A2); a test asserts every emitted child carries an
   `offset`.
4. **Splice reconstruction ≠ content for a producer output** (the full-projection
   invariant) → the producer's offsets/content are inconsistent (a bug or
   tampering). A test asserts splice(content, children) === content for
   representative producer outputs (§5.2/§5.6).
5. **Nested flatten given a DISTINCT mid-span offset instead of the inherited
   outer slot** → the flattened sibling would occupy a non-contiguous span the
   model cannot represent. A5/A3: a test asserts flattened nested siblings share
   the outer child's offset (back-to-back).
6. **`parseInline` non-string / empty documentId (unchanged throw):**
   `parseMarkdown(markdown, documentId)` with a non-string `markdown` or a
   non-non-empty-string `documentId` → throws `Error('markdown parse:
   markdown/documentId required')` (UNCHANGED by this unit — a caller error, the
   only throw).
7. **`sanitizePastedHtml` on a non-string** → `{ ok:false, error:'sanitizePastedHtml:
   input must be a string' }` (UNCHANGED fail-state; the function stays TOTAL).
8. **`decomposeRichHtml` on a non-string** → `{ ok:false, error:'decomposeRichHtml:
   input must be a string' }` (UNCHANGED fail-state; the function stays TOTAL).
9. **Depth-cap overflow** (deeply nested inline beyond `MAX_INLINE_DEPTH` /
   `MAX_BLOCK_DEPTH`, unchanged) → flattened to plain text, never a throw
   (UNCHANGED TOTAL contract; the flattened text still lands in `content`, no
   child/offset).
10. **A `span` child type reaching the model** → still invalid (the closed
    `RagNodeChildType` union; `span` NOT a member — unchanged, M §5.7 3). A
    child `type` outside the closed union is NOT produced by any of the three
    producers.

### 5.8 TDD red-set framing (what test asserts what)

- **Unit-M1 red set = the §5.6 happy paths + §5.7 fail-states.** Each red test
  targets the amended module and asserts the pinned output:
  - §5.6 1 → the `RagNodeChild` type exposes `offset?` (a TS type assert).
  - §5.6 2–9 → `parseInline` returns `content` = full projection + each child's
    exact `offset` (asserted per the §5.3 rule / worked examples).
  - §5.6 10–17 → `sanitizePastedHtml` / `decomposeRichHtml` return full-
    projection `content` + per-child `offset` (+ the §5.5 bound), splice ===
    content.
  - §5.7 1–5 → assert the bound/consistency/inherited-slot invariants.
  - §5.7 6–10 → assert the UNCHANGED throw/fail/TOTAL contracts still hold.
- **The TestWriter RUNS the red set BEFORE implementation** (RCA-1): the amended
  functions do not yet exist → the red set fails (method/field missing). The
  Implementer then lands the least code that makes them green (RCA-1/2), and the
  greens are blind-run + doc-reviewed per RCA-4/6 (adversarial pass §3a TBD).

### 5.9 Cross-references

- Gate: `docs/specs/inline-order-render-fix-review.md` §1 (Design B shape), §2
  (feasibility), §3 amendments **A5** (producer consistency), **A6** (back-compat
  + validation), **A8** (process / exclusive shape change), §7 (Design A REJECTED).
- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/`RagNode`
  shapes this unit amends with `offset` + the `content` meaning), §5.2 (the hash
  source — `offset` rides the existing `children` hash coverage), §5.4 (the
  write-time `children` validation — `offset` rides the same child shape rules),
  §5.8 (the census this unit extends).
- Unit R: `docs/specs/unit-r-traversal-inline-children.md` §5.1 (the inline-
  children rendering `buildSubtree` this unit's `offset` will drive in M2).
- Unit T: `docs/specs/unit-t-markdown-import.md` §5.2/§5.3 (the markdown parser
  + `parseInline` inline-children parse this unit amends).
- Unit S: `docs/specs/unit-s-paste-sanitization.md` §5.1 (the
  `sanitizePastedHtml` PURE-module shape this unit amends).
- Unit U2: `docs/specs/unit-u2-rich-decompose.md` §1.4–§1.7 (the
  `decomposeRichHtml` decomposition this unit amends).
- M2 / M3 / M4 (this program): `docs/specs/unit-m2-inline-bodyruns-emit.md`
  (consumes the offsets to emit `bodyRuns`), `docs/specs/unit-m3-inline-bodyruns-rewrite.md`
  (the host rewrite — execution order lands it first), `docs/specs/unit-m4-inline-order-reconcile.md`
  (validation bound-check + retrieval/textarea/splitNode reconciliation — consumes
  this unit's `offset` + full-projection `content`).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**, **SUBTREE-OWNERSHIP**,
  **HASH-VERIFIED-SOURCE** (as applied in §4).
- Host patterns: `src/main/rag-store.ts` (the `RagNodeChild`/`RagNode` types,
  `nodeSource`/`nodeHash`, the child shape validation), `src/main/markdown-parse.ts`
  (`parseInline`), `src/main/paste-sanitize.ts` (`sanitizePastedHtml` /
  `processNodes` / `computeNodeResult`), `src/main/rich-decompose.ts`
  (`decomposeRichHtml` / `processNodes` / `computeNodeResult`).

## 6. Flags / ambiguities (raised, not guessed)

1. **Nested-interleave fidelity loss (pin; no open question):** for a nested
   interleave where a child-producing element is split around another (e.g.
   `**bold *em* tail**`), the contiguous per-child-span model CANNOT represent
   the true source order ("bold em tail"); the §5.3 rule folds it to the
   flattened emission order ("bold  tailem"). This is a deliberate consequence
   of the reviewed offset design. If true source-order fidelity for nested
   interleave is later required, it needs a new program (not representable in
   this model).
2. **`content` for offset-ABSENT (legacy) children (raised):** the full-
   projection definition (§5.1) applies to nodes PRODUCED by the three
   producers (which always emit offsets). A legacy persisted node (offset-absent
   children) has `content` = parent-only text, per §5.2 append-after. The M4
   `nodeText` must special-case offset-absent children (append-after join) so a
   legacy node's retrieval text is unchanged. This is flagged so M4 does not
   regress legacy retrieval.
3. **The exact engine wire identity for NON-placement inline children (raised,
   implementation detail):** this unit does NOT emit or resolve engine wires
   (M2/M3). Whether a non-placement inline child emits on its nodeId wire or a
   path-key wire under the placement-routed envelope is an M2/M3 concern; this
   unit is independent of the wire scheme. Flagged so M2 confirms the child wire
   identity before pinning the M3 rewrite details.
