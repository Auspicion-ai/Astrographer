# Unit U-STATE-1a — Content Reconciler (Pure) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** The gate for this
unit is `docs/specs/u-state-1-content-repopulation-review.md`
(PROCEED-WITH-AMENDMENTS, 2026-09-11); decision row
`U-STATE-1-CONTENT-REPOPULATION-GATE` (GATED). This spec is the per-unit
contract required by AGENTS.md item 9 / umbrella amendment A1 **before any
TestWriter red set**. Once this spec is ratified and a TestWriter authors the red
set from it, the Implementer lands the least code.

**Baseline (recorded 2026-09-11, commit `27cf9e5`):** the trio is green —
`npm test` **155 files / 3762 pass + 43 skip**, `typecheck` 0, `build` 0. The
red set for this unit is attributable to the new test file alone.

**TestWriter RED (2026-09-11, RCA-1):** `tests/unit-u-state-1a-content-reconcile.test.ts`
authored from this spec ALONE (22 cases: §4 states 1–12 + §5 F1–F6). RUN and
reported: **suite-load failure** — `Failed to load url ../src/renderer/content-reconcile.js`
(the module does not exist yet). 1 failed test file / 0 tests collected; the
baseline 155 files stay green.

**Implementer GREEN (2026-09-11):** `src/renderer/content-reconcile.ts` landed
(`reconcileContentRoots` + `PreviousRoot`/`MaterializedRoot`/`ReconcileChange`/
`ReconcileInput`/`ReconcileResult`). The red run surfaced one **spec
ambiguity** (state 10 contradicted §3.1 — a nested doc-child is not a payload
root); resolved in favour of §3.1 and state 10 amended. Unit 18/18.

**Adversarial (RCA-3, 2026-09-11) — findings + fixes:**

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| AF1 | HIGH | `shapeOf` omitted `props` → a props-only change reported `kept` | **FIXED** — the projection now includes authored props, excluding runtime `data-*` markers (regression R1/R1b) |
| AF2 | HIGH | A content-only change that REMOVES a nested doc-child was missed (the payload path read only the *next* subtree; the fallback never fired) | **FIXED** — replaced = payload-hit **OR** prev/next subtree id-set change **OR** (fallback AND shape) (regression R2) |
| AF3 | MED | Raw `TypeError`s on malformed envelopes (non-array `content`, non-array `children`, null child) | **FIXED** — defensive `Array.isArray`/null guards (regression R3) |
| AF4 | MED | F1 did not fire for a missing `content` | **FIXED** — F1 now requires `content` present (empty `[]` still valid) (regression R4) |
| AF5 | MED | A structural change discarded the payload `changed` set (fallback exclusive) | **FIXED** — union semantics (regression R5) |
| AF6 | MED | A node that is both a nested doc-child and a payload section is emitted in two buckets | **SPEC NOTE** — correct per §3.1 (double-materialization, `traversal.ts`); buckets are per payload root. State 10 qualifies: it holds when the nested child is not also a section |
| AF7 | LOW | `collectRagIds` diverges from the cited `collectSubtreeIds` (includes the nested root id) | **SPEC NOTE** — intentional (needed for direct nested-child changes); the citation is corrected to "adapted from" |
| AF8 | LOW | `content` JSON projection: key-order false positives; `undefined`/`null` false negative | **FIXED** — canonical (sorted-key) projection (regression R6); non-JSON `content` is documented as out of scope |
| AF9 | LOW | `usedFallback` wording contradiction (§3.2 "changes the outcome" vs §3.3 "always") | **SPEC RESOLVED** — `usedFallback` = true iff the fallback path ran (null/malformed change, structural, or edge-bearing); §3.2 reworded |
| AF10 | LOW | §6 census said 4 types; 5 are exported (`PreviousRoot` omitted) | **FIXED** — census corrected to 1 function + 5 types |

Adversarial regressions: `tests/unit-u-state-1a-content-reconcile-adversarial.test.ts`
(8 tests, all green). **Trio after the fixes: 157 files / 3788 pass + 43 skip,
typecheck 0, build 0.**

Unit U-STATE-1a is the **pure reconciler** only — no Electron, no host wiring.
Host application is U-STATE-1b; lifecycle state (journal/operator/backRefs) is
U-STATE-1c; regression re-anchoring is U-STATE-1d (see the gate §5).

---

## 1. What the proposal asks

Compute, from the **previously materialized graph** and a **newly built
traversal envelope**, the minimal set of content-root operations that turn the
old materialization into the new one — so the host can apply them through the
managed channel (journaled) instead of tearing the page down.

Gate pins honoured: A1 (payload-primary diff + full-subgraph fallback), A2
(new pure module; `buildTraversal` unchanged), A3 (whole-document-root replace
v1), A10 (mechanism-only + zone-node preservation), ADV-1 (fallback
authoritative on structural ambiguity).

---

## 2. Signature + return shape (pinned)

```ts
// src/renderer/content-reconcile.ts — PURE (no Electron, no DOM)

/** A previously materialized content root: its stable authored css.id + the
 *  RAG node id it was materialized from. */
export interface MaterializedRoot {
  /** The authored css.id, e.g. `rag-<ragNodeId>`. */
  cssId: string
  /** The RAG node id (cssId minus the `rag-` prefix). */
  ragNodeId: string
}

/** A previously materialized content root, carrying its subtree so the
 *  full-subgraph fallback can compare shapes. The previous roots are passed as
 *  `LegacyNodeData[]` (user-confirmed 2026-09-11) — NOT id-only. */
export type PreviousRoot = LegacyNodeData

/** The change descriptor from the `rag-store-changed` broadcast. */
export interface ReconcileChange {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

export interface ReconcileInput {
  /** The previously materialized content roots, in render order, AS THEIR
   *  ENVELOPE NODES (so the fallback can compare subtree shape). */
  previous: PreviousRoot[]
  /** The newly built traversal envelope (`buildTraversal(...).envelope`). */
  next: LegacyInitialData
  /** The `rag-store-changed` payload when available; null on boot/template
   *  change or when a payload is unavailable (forces the fallback). */
  change: ReconcileChange | null
}

export interface ReconcileResult {
  /** Content roots in `next` that are NOT in `previous` (attach these). */
  added: MaterializedRoot[]
  /** Content roots present in BOTH, whose RAG subtree changed (replace these —
   *  whole-root replace v1). */
  replaced: MaterializedRoot[]
  /** Content roots in `previous` but NOT in `next` (detach/destroy these). */
  removed: MaterializedRoot[]
  /** Content roots present in BOTH and unchanged (leave untouched). */
  kept: MaterializedRoot[]
  /** True when the payload was insufficient and the result came from the
   *  full-subgraph comparison (ADV-1). */
  usedFallback: boolean
}

export function reconcileContentRoots(input: ReconcileInput): ReconcileResult
```

**Purity:** the module imports only `provident-ssr` types +
`../shared/types.js`; it reads nothing from disk/DOM and mutates nothing. It is
unit-testable in isolation (the `unit-m-children`/`pane-graph` pure-module
precedent).

---

## 3. Derivation rules (pinned)

### 3.1 Enumerating content roots

A **content root** is a `LegacyContentPayload.content[]` entry whose
`props.id` is a `rag-<id>` string (the authored convention — `traversal.ts`
`assignSubtreeRanges` / `collectSubtreeIds`; the same `rag-` prefix rule used
throughout). Non-`rag-` roots (pane payloads, the textarea overlay) are
**out of scope** — U-STATE-1a reconciles **document content roots only**; pane
roots are preserved by the host (A10/Reading 2) and are NOT returned in any
bucket.

`ragNodeId` = `cssId.slice(4)` (`rag-` prefix removed).

### 3.2 Payload-driven diff (primary — A1)

When `change != null`:

- Let `changed = new Set(change.nodeIds)`.
- For each root id in `previous ∩ next` (same `cssId`):
  - **replaced** if any of: the root's own `ragNodeId ∈ changed`; OR
    `change.kind === 'structural'` and the root's `ragNodeId` is a doc in
    `change.edgeIds`-touched flow (the fallback resolves this — see §3.3); OR
    the root's subtree contains a changed node.
  - **kept** otherwise.
- `added` = roots in `next` not in `previous`.
- `removed` = roots in `previous` not in `next`.

**Subtree membership:** a root's subtree is its `rag-<id>` root PLUS its nested
`rag-`-prefixed descendants (adapted from the `collectSubtreeIds` walk, stopping
at nested `rag-` roots — the doc-child boundary; the local copy INCLUDES the
nested root id so a direct nested-child change marks its containing root —
adversarial AF7).

**Under-reporting (ADV-1):** the fallback runs for a null/malformed change, a
structural change, or any `edgeIds`-bearing change (`usedFallback = true` when
the fallback path ran; §3.3). The **payload is UNIONED in, never discarded**:
`replaced` = payload-hit **OR** prev/next subtree id-set change **OR**
(fallback AND shape differs) — so a content-only change that REMOVES a nested
doc-child is still detected (adversarial AF2/AF5).

### 3.3 Full-subgraph fallback (authoritative on ambiguity)

When `change == null`, or when §3.2 flags ambiguity:

- Compare `previous` vs `next` by `cssId`.
- `added` / `removed` from set difference (always exact).
- For a shared `cssId`, compare the **serialized subtree shape** of the old
  materialization against the new root's serialized shape. `previous` carries
  the old envelope roots (`PreviousRoot = LegacyNodeData[]`, user-confirmed
  2026-09-11), so both sides are comparable directly: stringify a normalized
  projection (id + type + content + children + props, excluding runtime-minted
  fields) of each root's subtree. A differing projection ⇒ **replaced**.
- `usedFallback = true` iff the fallback path ran (null/malformed change,
  structural, or edge-bearing); a clean content change reports `false`
  (adversarial AF9; this supersedes the earlier "changes the outcome" wording).

### 3.4 Subtree shape / membership source (pinned)

Both membership (§3.2) and shape comparison (§3.3) operate on the **envelope
`LegacyNodeData`**, not a RAG-node graph fixture: a content root is a payload
`content[]` entry with `props.id` starting `rag-`; its subtree is that node plus
its descendants, stopping at nested `rag-` roots (the `collectSubtreeIds`
doc-child boundary — a local re-implementation, since `traversal.ts` does not
export it). The TestWriter fixtures are therefore envelope nodes, not
`RagStore` stubs.

### 3.5 Determinism + order

- `added` / `replaced` / `removed` / `kept` preserve `next`'s render order
  (`removed` preserves `previous` order).
- No `Map`/`Set` iteration order leaks into the output arrays.
- The result is a pure function of the inputs (same inputs ⇒ identical result).

---

## 4. States (TestWriter red set — valid paths)

1. `previous=[]`, `next` has 2 roots → `added: 2`, others empty, `usedFallback`
   false (payload present) or true (null change).
2. Identical `previous`/`next`, `change.kind='content'` with an empty
   `nodeIds` → all `kept`, no changes.
3. `change.nodeIds` includes one root's file → that root `replaced`, others
   `kept`.
4. `change.nodeIds` includes a **nested** node (not a root) → its containing
   root `replaced`.
5. One root only in `previous` → `removed`; one only in `next` → `added`.
6. Reorder of roots (same ids, different order) → all `kept`, order reflects
   `next`.
7. `change.kind='structural'` with edgeIds touching a doc → the doc root
   `replaced` **and** `usedFallback=true`.
8. `change=null` (boot/template) → full-subgraph comparison; `usedFallback=true`.
9. A changed node in document A does **not** mark document B's root `replaced`.
10. A nested doc-child (`rag-` inside a root's subtree) is **part of its
    containing root's subtree** — a change to it marks the *containing payload
    root* `replaced`; it is **not** a separate bucket entry (buckets are per
    payload content root, §3.1). *Qualifier (adversarial AF6): a node that is
    BOTH a nested doc-child AND a top-level payload section is materialized
    twice (`traversal.ts`), so it legitimately appears as its own root too.*
    *(Amended after the TestWriter red run: the earlier "its own added/removed
    entry" wording contradicted §3.1.)*
11. **Pane roots (`pane-<id>`) ARE content roots** (U-STATE-1b pane refresh):
    a pane root is reconciled like a document root and is **shape-compared
    always** (its content is driven by the host `PaneContext`, not by the
    `rag-store-changed` id payload) — so a changed pane is `replaced` and a new
    pane is `added`. (Amended 2026-09-11: the earlier "never emitted in any
    bucket" contract was superseded to fix HOST-PANE-STALE-ON-CONTENT-CHANGE.)
12. Deterministic output: two runs on identical inputs are deep-equal.

## 5. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | `next` null / missing `content` / missing `template.root` | throw the documented guard error (never a raw TypeError) — the `assembleAppGraphEnvelope` guard precedent |
| F2 | A root with a non-string / missing `props.id` | skipped (not a content root) — never emitted, never a throw |
| F3 | Duplicate `cssId` within `next` | first wins; the duplicate is skipped (deterministic) |
| F4 | `previous` contains a root absent from `next` **and** a changed id | `removed` (set difference wins over change) |
| F5 | `change.nodeIds` empty but `kind='content'` | no root `replaced`; fallback NOT triggered (a no-op content change is legitimate) |
| F6 | Malformed `change` (missing arrays) | treat as `change=null` → fallback (`usedFallback=true`), never a throw |

---

## 6. Numeric / census claims

- The module exports **1** function (`reconcileContentRoots`) + **5** types
  (`PreviousRoot`, `MaterializedRoot`, `ReconcileChange`, `ReconcileInput`,
  `ReconcileResult`); **0** exported consts.
- No new npm dependency; no `provident-ssr` package change (no `docs/defects.md`
  item expected).

---

## 7. Cross-references

- Gate `docs/specs/u-state-1-content-repopulation-review.md` (A1–A3, A10, ADV-1)
  + decision `U-STATE-1-CONTENT-REPOPULATION-GATE`.
- `docs/specs/ui-overhaul.md` §3.1 (C10) + §7.3 (Reading 2: zone/root
  preservation).
- Build: `src/main/traversal.ts` (`assignSubtreeRanges`, `collectSubtreeIds`,
  `TraversalResult.envelope`), `src/shared/types.ts`
  (`RagStoreChangedPayload`), `src/renderer/pane-graph.ts`
  (`assembleAppGraphEnvelope`), `src/renderer/runtime.ts` (`loadEnvelope` /
  `tearDownGraph` — the path U-STATE-1b replaces).
- Precedent pure modules: `src/renderer/pane-graph.ts`, `src/main/adjacency.ts`.

---

## 8. Delimitation

This unit lands **only** the pure reconciler. It does NOT: call any supervisor/
managed op (U-STATE-1b), persist the journal or operator scope (U-STATE-1c),
touch `buildTraversal`, or change `loadEnvelope`/`tearDownGraph`. It must not
break the existing trio; a new `tests/unit-u-state-1a-content-reconcile.test.ts`
red set is authored by a TestWriter from this spec before implementation
(AGENTS.md item 9 / RCA-1).
