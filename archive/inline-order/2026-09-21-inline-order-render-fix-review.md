# Inline-Ordering Render Fix — Change-Analysis Review (compile-horizon-review)

**Status:** **PROCEED-WITH-AMENDMENTS** (four-agent gate, 2026-08-31). Validity
**VALID-WITH-AMENDMENTS**; critique **REJECTED-AS-SHAPED** (the sound kernel is the
offset-annotation, not a run-list-with-derived-content); architecture **Design B**
(per-child `offset` annotation); change-analysis **PROCEED-WITH-AMENDMENTS**
(A1–A8). A user go-ahead is REQUIRED before spec-gate red→green work begins.

- **Proposal:** Fix the inline-formatting-order render defect (`**Proposal:**
  Astrographer →` currently renders "Astrographer Proposal:") by landing
  **Design B** — a per-child numeric `offset?: number` on `RagNodeChild`, keep
  `RagNode.content` as the stored full-plain-text scalar, the traversal emits the
  engine's opt-in `bodyRuns` on placement content roots, and a HOST‑SIDE
  post-`translateLegacy` rewrite of `bodyRuns` child refs to the compiled path-key
  wires. Host-side only (no `provident-ssr` package patch — AGENTS.md).
- **Reviewer:** change-analysis agent (step 4 of the proposal gate).
- **Inputs:** validity (step 1), critique (step 2), architecture (step 3); the
  rendered defect reproduction; the engine `bodyRuns`/wire-resolution mechanics.

---

## 1. What the proposal asks

Fix the leading-format-run rendering defect. A markdown node like
`- **Proposal:** Astrographer — a hybrid…` splits into `content` (plain text
`" Astrographer…"`) + a `children` list (`[strong 'Proposal:']`), and the engine
renders `escapeText(content) + children` (content-first), so the bold label lands
after the content ("Astrographer… Proposal:"). The fix restores the document
order of inline text + formatted spans via the engine's opt-in `bodyRuns` runs
(text/element order), annotated from per-child numeric offsets, plus a host-side
rewrite of the `bodyRuns` child refs because the engine's own placement-routed
child-wire resolution is broken.

**Design B (the chosen shape):**

```ts
// rag-store.ts
interface RagNodeChild {
  type: RagNodeChildType          // strong | em | a | img
  content: string
  props?: Record<string, unknown>
  offset?: number                 // NEW: char offset into node.content where this
                                  //      child's run slot begins; ABSENT = append-after
                                  //      content (the v1 default, backward-compatible)
}
interface RagNode {
  id: string
  type: RagNodeType
  content: string                 // becomes the FULL plain-text projection
                                  // (text runs + the text inside the inline children,
                                  //  in document order) — the single coordinate space
                                  //  the offsets index into
  children?: RagNodeChild[]       // formatted spans, each may carry an offset
  ...
}
```

- No `RagNode.body` run-list. `content` stays the stored scalar; only per-child
  `offset` annotation is added.
- The traversal (`buildSubtree`) builds an engine `bodyRuns: BodyRun[]`
  (`{text: slice}` / `{child: <authoredInlineId>}`) from `content` + each child's
  `offset`, and places it on the subtree root's `LegacyNodeData`, keeping
  `content` + `children` emitted for the textarea/retrieval/back-compat.
- A HOST-side post-`translateLegacy` pass rewrites each `bodyRuns`
  `{ child: <authoredId> }` ref to the child's COMPILED PATH-KEY wire (so the ref
  is already in the parent's `childOrder` and passes through the engine's
  `resolveBodyRunsChildWires` unchanged).

## 2. Feasibility verdict

**FEASIBLE, but only as an ordered multi-unit program** (PROCEED-WITH-AMENDMENTS).

1. **The model/emit half is sound and small.** `LegacyNodeData.bodyRuns` is a
   documented passthrough (translate.js L178); the host can author it in
   `buildSubtree`. Existing child refs already present in the element's
   `childOrder` pass through the engine's post-emit resolver unmodified.
2. **The engine blocker is real and binding.** The engine renders
   `escapeText(content) + children`; text-after-element interleave is ONLY via
   the opt-in `bodyRuns`. Empirically (provident-ssr 0.3.0–0.3.2), `bodyRuns`
   child-wire resolution FAILS for PLACEMENT-ROUTED (path-state) content roots —
   the model Astrographer uses for EVERY RAG subtree root. `pathWireOf(s)`
   returns the NODE id (`forkKey` undefined on a non-fork path-state) while the
   placement parent's `childOrder` references the PATH-KEY wire → the rewritten
   child run is dropped AND, with `bodyRuns` present, the children are not
   rendered separately ("children vanish"). This is the open handoff item
   `ENG-BODYRUNS-WIRE-REF-PATHSTATE`; the package MUST NOT be patched.
   **Design B cannot render by itself** — the emit alone is a regression on every
   placement-routed root.
3. **The host-side rewrite is coherent, self-contained, and permissible.**
   A post-`translateLegacy` pass on the SAME translated node set (path-key wires
   differ per translate instance) rewrites each `bodyRuns` child run to the
   compiled path-key wire from the compiled states' `pathKey`/`trace`. Robust:
   an already-valid child wire passes through; an unresolvable ref drops
   deterministically (never a throw, never a wrong-child) and the child element
   still emits as its own element — only the inline position is lost. Idempotent
   + forward-compatible: an upstream fix makes the rewrite redundant, not harmful.
4. **Critical — the rewrite is NOT only in the renderer.** `buildTraversal`'s
   line→node map (`renderEnvelopeMarkdown`/`renderSubtreeMarkdown`) is a SEPARATE
   main-process translate+render; emitting `bodyRuns` there without the same
   rewrite drops children in the markdown re-emits → wrong line counts → a wrong
   lineMap. The rewrite helper must be shared by main and renderer and applied at
   EVERY translate site that feeds a placement content-root render.

## 3. Amendments the spec must pin before any red→green work

| # | Amendment |
| --- | --- |
| **A1** | **Sequencing (mandatory):** land the rewrite unit (M3) BEFORE the emit unit (M2). M2 must never ship on an unmet rewrite (else it drops children). M3 is a capability with no observable behavior on its own — frame its red set to ride on M2. |
| **A2** | **Shared rewrite + call-site census:** the rewrite helper lives in a module importable by both `src/main/traversal.ts` and `src/renderer/runtime.ts`; applied on the same translated instances; every translate site feeding a placement content-root render enumerated and rewritten (including the main-side markdown re-emits — the lineMap correctness gate). |
| **A3** | **Rewrite fail-contract:** already-a-child-wire passes through; unresolvable → deterministic drop; never throw / never wrong-child; idempotent; confirmed on DOM and SSR (PAR-5 parity) and the MarkdownAdapter re-emit. |
| **A4** | **Content-meaning reconciliation:** `node.content` becomes the full plain-text projection (child text inside the scalar). Reconcile (i) `nodeText`/lexical index — full-projection means child text is already in the scalar; offset-absent (legacy) children append after (byte-compatible with current `nodeText`); (ii) textarea `value: node.content` shows the full projection (documented change) and U5 `setRichText` writes content+children+offsets atomically so an edit cannot orphan offsets; (iii) `splitNode at` — pin the fail-state: reject `at` strictly inside a child span (domain result); document children attribution at boundary splits. |
| **A5** | **Producer consistency:** `markdown-parse`, `paste-sanitize`, AND `rich-decompose` must ALL emit full-projection `content` + offsets together (they currently emit parent-only content, child text excluded); otherwise imported/pasted/edited nodes diverge in model meaning. |
| **A6** | **Back-compat + validation:** `offset` optional; absent = append-after (current behavior) so pre-B stored nodes render identically; `validateNodeShape`/`isValidChildren` accept + bound-check `offset` (0 ≤ offset ≤ content length; full-projection invariant). |
| **A7** | **Content-`bodyRuns` equivalence gate:** the traversal-generated `bodyRuns` must exactly reproduce `content` (splice child contents at offsets) for the lineMap to be correct; pin as the correctness assertion. |
| **A8** | **Process:** split M1 (model+producers), M2 (traversal emit), M3 (host rewrite), M4 (validation/content/retrieval reconciliation), each its own red→green→adversarial→greens→doc-review cycle (RCA-1/2/5/6); M3 before M2 (A1). |

## 4. Recommended split (execution order, honoring the dependency)

- **M3 first**: the shared host-side `bodyRuns` child-ref→path-key-wire rewrite
  module + the call-site census (A2/A3). Capability-only; verification rides on M2.
- **M1**: `offset?: number` on `RagNodeChild` + the three producers
  (`markdown-parse`/`paste-sanitize`/`rich-decompose`) emit full-projection
  `content` + offsets (A4/A5/A6).
- **M2**: `buildSubtree` emits engine `bodyRuns` from the offsets + applies the M3
  rewrite (must never precede M3). A7 gate.
- **M4**: validation bound-checking + retrieval `nodeText`/textarea/`splitNode`
  reconciliation (A4/A6) + `split-at-inside-run` fail-state.

## 5. Costs

- Content-semantics shift cascades across 4 producers + edit ops + retrieval +
  textarea + lineMap (the 4-unit scope).
- Host couples to engine path-state internals (`pathKey`/`trace`/`childOrder`) —
  brittle to future engine changes (mitigated by A3's idempotence).
- The rewrite is a workaround for an open package defect, not a package fix — the
  `ENG-BODYRUNS-WIRE-REF-PATHSTATE` handoff item stands.
- `splitNode-at-inside-run` becomes a new documented domain fail-state.

## 6. Benefits

- Correct inline ordering — the reported rendering defect.
- Smallest blast radius of the design options (per-child optional `offset`; no
  second source of truth; no `RagNode.body` run-list).
- Host-only, AGENTS.md-compliant; forward-compatible with an upstream fix.
- Once reconciled, retrieval/lineMap/textarea stay self-consistent; formatting
  preservation works for both plain and interleaved nodes.

## 7. Rejected alternative — Design A (`RagNode.body` run-list + derived content)

Storing a run-list `body` as the single source of truth and DERIVING
`content`/`children` was REJECTED at gate: it collides with the existing write
paths (`setContent`/`splitNode`/`mergeNode` mutate the scalar `content`, never
`body`), makes character-offset edits ambiguous, forces a corpus migration that
synthesizes `body` from the BUGGY v1 order, introduces a text two-source-of-truth
hazard, adds an unvalidated tamper surface, and DUPLICATES the engine's `bodyRuns`
at the storage layer while still mapping into it at render — an order-of-magnitude
larger blast radius for zero render gain.

## 8. Is there a better solution?

Within the constraints (no package patch; placement-routed roots are the whole
model), **no**. Deferring to wait on the upstream `ENG-BODYRUNS-WIRE-REF-PATHSTATE`
fix risks uncontrolled timing on the host's critical rendering path, and the
host-side rewrite is forward-compatible with that fix. The host-side rewrite is
the only path that unblocks now without violating AGENTS.md.

## 9. Gate

Four-agent gate COMPLETE (2026-08-31): validity VALID-WITH-AMENDMENTS, critique
REJECTED-AS-SHAPED → sound kernel (offset-annotation), architecture Design B,
change-analysis PROCEED-WITH-AMENDMENTS (A1–A8). **Awaiting the user's go-ahead
before spec-gate red→green work.** Cross-refs: `docs/defects.md`
`ENG-BODYRUNS-WIRE-REF-PATHSTATE`; `docs/HANDOFF.md`; `docs/next-steps.md`.
