# Spec — Unit M3: The Shared Host-Side `bodyRuns` Child-Ref → Path-Key-Wire Rewrite

- **Status:** SPEC. This is M3 of the **Inline-Ordering Render Fix** program
  (gate reference: `docs/specs/inline-order-render-fix-review.md`,
  **PROCEED-WITH-AMENDMENTS**, A1–A8, 2026-08-31). Per A1, M3 must land BEFORE
  M2 (the emit unit): M2 must never ship on an unmet rewrite (else it drops
  children). **M3 is a CAPABILITY with no observable behavior on its own — its
  red set RIDES ON M2's integration** (no M2 emit ⇒ nothing to rewrite). It is
  the host-side workaround for the open engine defect `ENG-BODYRUNS-WIRE-REF-PATHSTATE`
  (placement-routed content root's `bodyRuns` child refs fail to resolve to the
  parent's childOrder wires). Execution order is M3 → M1 → M2 → M4 (A1/A8).
- **Scope:** a single shared host-side PURE rewrite module importable by BOTH the
  main-process traversal (the markdown/lineMap re-emits) and the renderer runtime
  (the DOM/SSR renders), the rewrite's fail-contract, and the call-site census
  (A2/A3). It does NOT emit `bodyRuns` (M2), does NOT change the model (M1), and
  does NOT touch validation/retrieval/textarea/splitNode (M4).
- **TestWriter contract:** every API signature, return shape, throw pattern,
  happy-path state, and fail-state below is derivable from this spec ALONE. The
  TestWriter writes the red set for the new `src/main/body-runs-rewrite.ts`
  module from §5.6/§5.7 before any implementation. Because M3 is capability-only,
  the red set exercises the rewrite helper directly (its pure behavior on crafted
  inputs) AND asserts the M2 integration once the emit lands (§5.8).

---

## 1. What the proposal asks

The engine (`provident-ssr` v0.3.2) renders a LegacyNodeData content root as
`escapeText(content) + children`; text-after-element interleave is possible ONLY
via the opt-in `bodyRuns` passthrough (`translate.js` L178-184 carries
`LegacyNodeData.bodyRuns` onto the base; `render-helpers.js` emits it). The
engine's `resolveBodyRunsChildWires` (`render-helpers.js` ~L139) rewrites any
`{child: <authoredId>}` run to a child wire AFTER emit, using the element's own
`childOrder` + a global `authoredIdToWire` index built from each node's
`base.props.id → pathWireOf(s)`. For PLACEMENT-ROUTED (path-state) content roots
— the model Astrographer uses for EVERY RAG subtree root — this resolution FAILS
(**ENG-BODYRUNS-WIRE-REF-PATHSTATE**): `pathWireOf(s)` returns the NODE id (a
non-fork path-state's `forkKey`/pathKey is undefined) while the placement
parent's `childOrder` references the PATH-KEY wire, so the referenced child run
is dropped AND, with `bodyRuns` present, the children are not rendered separately
("children vanish"). The engine MUST NOT be patched (AGENTS.md).

The host workaround is a **post-`translateLegacy` rewrite pass** (host file, not
a package patch) that rewrites each emitted `bodyRuns` `{child: <authoredId>}`
run to the child's COMPILED PATH-KEY wire, so the ref is already a valid child
in the parent's `childOrder` and passes through the engine's resolver unchanged.

1. **A shared rewrite module** (`src/main/body-runs-rewrite.ts`) importable by
   both `src/main/traversal.ts` and `src/renderer/runtime.ts`.
2. **The rewrite runs on the SAME `translated.nodes` instance that feeds the
   render** — path-key wires differ per translate instance (A2).
3. **Applied at EVERY translate/render site that feeds a placement content-root
   render**, INCLUDING the main-side markdown/lineMap re-emits
   (`renderEnvelopeMarkdown`/`renderSubtreeMarkdown`), where a missing rewrite
   would drop children → wrong line counts → a wrong lineMap (A2 — the
   lineMap-correctness gate).

## 2. Feasibility verdict

**Feasible — a coherent, self-contained, permissible host-side rewrite (gate §2
#3).** A post-`translateLegacy` pass over the same translated node set rewrites
each `bodyRuns` child run to the compiled path-key wire from the compiled
states' `pathKey`/`trace`. The engine's own resolver is already tolerant: an
already-valid child wire passes through; an unresolvable ref drops
deterministically (never a throw, never a wrong-child); the child element still
emits as its own element — only the inline position is lost. The host rewrite is
idempotent + forward-compatible: an upstream fix makes the rewrite redundant,
not harmful (A3). No package patch. No new handoff item beyond the already-open
`ENG-BODYRUNS-WIRE-REF-PATHSTATE` defect record.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The shared rewrite module + the call-site census (A2) | Project-specific (host file, no package patch) | Low cost; unblocks the inline-order render on every placement-routed content root. |
| Rewriting `base.bodyRuns` child refs to compiled path-key wires | Project-specific | Low cost; robust + idempotent (A3). The children still emit as their own elements even on a dropped run. |
| The engine blocker `ENG-BODYRUNS-WIRE-REF-PATHSTATE` | **Engine-handoff (NOT patched)** — recorded in `docs/defects.md` / `docs/HANDOFF.md` | The host rewrite is the workaround; the upstream fix is the eventual remedy (forward-compatible no-op). |

Engine ground truth (verified, encoded, gate §"Engine ground truth"):
- `provident-ssr` v0.3.2 renders `escapeText(content) + children`; text-after-
  element interleave ONLY via the opt-in `bodyRuns` (`translate.js` L178-184 →
  `base.bodyRuns`; `render-helpers.js` emits it).
- `resolveBodyRunsChildWires` (~render-helpers.js L139-193) rewrites
  `{child:<authoredId>}` → a wire AFTER emit via the element's own `childOrder` +
  a global `authoredIdToWire` (`base.props.id → pathWireOf(s)`). It drops a
  dangling ref deterministically (never a throw, never a wrong-child); it never
  mutates `base.bodyRuns` (round-trip idempotent — only the emitted
  `props['text']` string is rewritten).
- For a placement-routed (path-state) root with `bodyRuns`, this resolution
  FAILS (`pathWireOf` → node id, parent's `childOrder` → path-key wire) ⇒ the
  child run is dropped AND, with `bodyRuns` present, children are not emitted
  separately. This is the open handoff `ENG-BODYRUNS-WIRE-REF-PATHSTATE`.
- An ALREADY-VALID child wire passes through unchanged (the host rewrite makes
  the ref already-valid, so the engine's resolver is then a no-op for it).

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (the adversarial pass must NOT
regress them):

- **A1 — never throw:** the rewrite (and the engine resolver it feeds) must
  never throw on any ref form (absent id, foreign id, non-string child ref,
  malformed `bodyRuns`).
- **A2 — never a wrong-child:** the rewrite maps an authored id ONLY to the
  corresponding child's OWN compiled wire; it never rewrites to an unrelated
  element's wire.
- **A3 — idempotent + forward-compatible:** re-running the rewrite (or running
  it after an upstream-engine fix) is a no-op for already-valid refs; the rewrite
  is harmless under a fixed engine (A3).
- **A4 — deterministic drop:** an unresolvable ref drops deterministically (the
  child element STILL emits as its own element; only the inline position is
  lost). It is never replaced by a wrong child's text.
- **A5 — SAME-instance:** the rewrite must operate on the SAME `translated.nodes`
  instance that feeds the render (path-key wires differ per translate instance);
  rewriting a different translate's nodes is a no-op for the active render.
- **A6 — main/renderer parity:** the DOM, SSR, and the main-side markdown/lineMap
  re-emits must all observe the rewrite (a rewrite in one view but not another is
  a PAR-5 / lineMap divergence finding).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings; none are PACKAGE findings (the
package defect is handoff `ENG-BODYRUNS-WIRE-REF-PATHSTATE`). (Pass TBD, RCA-3.)

### 3b. Proposal-review findings

The gate (`docs/specs/inline-order-render-fix-review.md`, 2026-08-31) returned
**PROCEED-WITH-AMENDMENTS**, Design B. The amendments THIS unit resolves:

- **A1 — Sequencing:** M3 lands BEFORE M2; M3's red set rides on M2.
- **A2 — Shared rewrite + call-site census:** `src/main/body-runs-rewrite.ts`
  importable by both `src/main/traversal.ts` and `src/renderer/runtime.ts`;
  applied on the same translated instances; every translate site feeding a
  placement content-root render enumerated + rewritten (incl. the main-side
  markdown re-emits — the lineMap-correctness gate).
- **A3 — Rewrite fail-contract:** already-a-child-wire passes through;
  unresolvable → deterministic drop; never throw / never wrong-child; idempotent;
  confirmed on DOM and SSR (PAR-5 parity) and the MarkdownAdapter re-emit.

## 4. Design decisions pinned by this spec

- **ENG-BODYRUNS-WIRE-REF-PATHSTATE (the open handoff this unit works around):**
  the engine's placement-path-state bodyRuns child-wire resolution is broken;
  the package is NOT patched; the host rewrite is the workaround (recorded in
  `docs/defects.md` / `docs/HANDOFF.md`).
- **HOST-ONLY (consumed, AGENTS.md):** NO `provident-ssr` package patch; the
  rewrite is a host file.
- **SHARED-PURE-MODULE (this unit):** the rewrite lives in a single PURE,
  node-free module (mirrors the existing `src/main/adjacency.ts` shared-pure
  pattern) so the renderer bundle can import it without node builtins.

## 5. The exhaustive contract

### 5.1 The module + exported API

**`src/main/body-runs-rewrite.ts`** — a PURE, node-free, TOTAL module (no
Electron, no node builtins, no global state; importable by main and renderer).

```ts
// src/main/body-runs-rewrite.ts (NEW). The translated-node set from a single
// translateLegacy instance (the type may be a structural subset — the helper
// only reads the fields it needs). PURE + TOTAL. Mutates the nodes' base.bodyRuns
// in place (a pass over the SAME instance that feeds the render); returns void.
export function rewriteBodyRunsChildWires(nodes: TranslatedNodeLite[]): void
```

A single exported function with this behavior:

**`rewriteBodyRunsChildWires(nodes: TranslatedNodeLite[]): void`**

- **Input:** the `translated.nodes` of ONE translateLegacy instance (each node
  exposing `base.props?.id`, `base.bodyRuns?`, and the resolution surface needed
  to map a child's authored id to its compiled path-key wire).
- **Mutation:** for each node whose `base.bodyRuns` contains any `{child: <ref>}`
  run, rewrite the run's `<ref>` to the child's compiled path-key wire when the
  ref is an authored inline-child id → its compiled wire; leave an already-valid
  child wire unchanged; drop an unresolvable ref. `base.bodyRuns` is mutated in
  place (the engine later re-derives `props['text']` from it); the child elements
  are untouched.
- **Return:** `undefined` (in-place mutation; void).
- **Never throws** (TOTAL) — any malformed/absent/foreign ref is handled
  deterministically, never a throw.

**Resolution source (pinned at the behavioral level):** the authored
`inline-<ragId>-<index>` child id → the child's compiled PATH-KEY wire, derived
from the child's compiled state's `pathKey`/`trace` (falling back to `nodeId`
for non-placement children). The exact mechanism by which each call site makes
the compiled states available (compile once at the rewrite point, or consume the
already-compiled actionable set) is an Implementer decision resolved against the
engine's compiled-state surface — the CONTRACT (idempotent, never-throw,
deterministic drop) holds regardless. See §6 flag 1.

### 5.2 The rewrite fail-contract (A3, pinned exactly)

For each `{child: <ref>}` run in a node's `base.bodyRuns`:

1. **Already-valid child wire → PASS THROUGH unchanged.** If `<ref>` is already a
   wire present in the element's `childOrder` (a valid child), the run is left
   as-is (the engine's resolver then passes it through). This is the
   forward-compatible case (an upstream fix that pre-wires the ref, or a
   re-run of this rewrite, is a no-op).
2. **Authored inline-child id → REWRITE to the child's compiled path-key wire.**
   If `<ref>` equals an authored inline-child id (e.g. `inline-<ragId>-<index>`)
   that resolves to a child's compiled wire, the run is rewritten to that wire.
3. **Unresolvable ref → DETERMINISTIC DROP.** If `<ref>` is neither a valid child
   wire nor a resolvable authored id, the run is dropped (never a throw, never a
   wrong-child). The child element STILL emits as its own element (only the
   inline position is lost).

**Idempotency (pinned):** applying the rewrite twice (or applying it after an
upstream engine fix) yields no further change: a run already rewritten to a
valid child wire passes through unchanged (case 1); a run already dropped stays
dropped. The rewrite is a no-op on a node with no `{child}` runs.

**Forward-compat (pinned):** if the engine's placement path-state resolution is
fixed upstream, the host rewrite (case 2) is redundant but HARMLESS — it either
produces the same valid wire (case 1 passthrough on re-run) or is a no-op.
`base.bodyRuns` round-trips idempotently (never mutated by the ENGINE; only the
host rewrite mutates it).

**DOM + SSR + markdown parity (A3, pinned):** the SAME rewritten
`translated.nodes` feeds the DOM adapter AND the SSR fragment (the Runtime's
`render()` emits both from the same `liveActionable`/`byNode`) AND the main-side
MarkdownAdapter re-emits — so the inline order is identical across DOM/SSR (PAR-5)
and the markdown (D15), and the lineMap (which the markdown re-emit drives) is
correct only when the rewrite is applied there too (A2).

### 5.3 The SAME-instance rule (A2/A5, pinned)

- The rewrite mutates the `translated.nodes` of the SAME translate instance that
  feeds the render. Path-key wires differ per translate instance, so rewriting a
  DIFFERENT instance's nodes has no effect on the active render — the call sites
  MUST rewrite the instance about to be rendered.

### 5.4 The call-site census (A2, pinned)

Every translate/render site that feeds a placement content-root render must apply
the rewrite on the SAME translated instance:

**Renderer (`src/renderer/runtime.ts`):**

| Site | Line (approx.) | What it feeds | Rewrite applied? |
| --- | --- | --- | --- |
| `Runtime` constructor `translateLegacy(opts.envelope)` | L114 | boot render (DOM + SSR) | YES — same instance feeds `render()`. |
| `loadEnvelope` `translateLegacy(env)` | L335 | envelope load render (DOM + SSR) | YES — same instance feeds `this.render()`. |
| `validateExport` `translateLegacy(exp)` | L514 | throwaway validate graph (compile → census compare; no live render) | YES — uniform "always apply"; a harmless no-op here. |
| `codeValidate` `translateLegacy(structuredClone(env))` | L946 | validation only (node-count/warnings; no render) | YES — uniform "always apply"; a harmless no-op here. |

The uniform posture: **apply the rewrite immediately after EVERY `translateLegacy`
in `runtime.ts` on the returned `translated.nodes`**, so no translate site can
feed an unrewritten render. On non-render sites (L514/L946) it is a no-op (A3
harmless). (See §6 flag 1 for the compiled-state availability at L114/L335.)

**Main traversal (`src/main/traversal.ts`):**

| Site | Line (approx.) | What it feeds | Rewrite applied? |
| --- | --- | --- | --- |
| `renderEnvelopeMarkdown` `translateLegacy(envelope)` | L131 | the FULL envelope's markdown re-emit (drives the lineMap top) | YES — same instance feeds `renderProducingProcess`. |
| `renderSubtreeMarkdown` → `renderEnvelopeMarkdown` | L147/L131 | each subtree's standalone markdown re-emit (drives `assignSubtreeRanges`) | YES — same instance feeds the render. |
| `buildTraversal` back-refs `translateLegacy(envelope)` | L482 | backRefs map only (collects subtree ids; NO render/emit) | NO — no render; the rewrite would be a needless no-op (the backRefs walk does not emit children). |

**Census:** the rewrite MUST be applied at **5 render-feeding translate sites** —
runtime.ts L114, L335, L514, L946 (all, uniform) + traversal.ts L131
(`renderEnvelopeMarkdown`, covering the full-envelope + subtree re-emits). The
backRefs translate (traversal.ts L482) is NOT a render site and does NOT apply
it.

### 5.5 Numeric/invariant claims (census)

- **Shared rewrite module:** 1 — `src/main/body-runs-rewrite.ts`, PURE, node-free,
  TOTAL, importable by main + renderer.
- **Exported function:** 1 (name pinned by the Implementer; test surface name
  `rewriteBodyRunsChildWires`).
- **Rewrite cases for a `{child}` run:** 3 — pass-through / rewrite / drop
  (§5.2). Never a 4th (wrong-child) case.
- **Call sites:** renderer 4 (`runtime.ts` L114/L335/L514/L946) + main 1
  (`traversal.ts` L131 via `renderEnvelopeMarkdown`) = **5 render-feeding
  translate sites**; 1 non-render translate (backRefs, L482) does NOT apply it.
- **Never-throw refs:** all ref forms are handled deterministically; the rewrite
  NEVER throws.
- **Idempotency passes:** applying it twice is a no-op on the second pass.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Authored id → path-key wire rewrite:** a node's `base.bodyRuns` with
   `[{ child: 'inline-ra-0' }, { text: 'x' }]` where the authored id resolves to
   a compiled path-key wire → after the rewrite the run is `{ child: '<wire>' }`.
2. **Already-valid child wire passes through:** a run whose ref is already a wire
   present in the element's childOrder → unchanged.
3. **Multiple runs rewritten:** a node with several `{child}` + `{text}` runs →
   only the `{child}` runs that are authored ids are rewritten; `{text}` runs are
   untouched; order is preserved.
4. **No-`{child}` node untouched:** a node with no `{child}` runs (or no
   `bodyRuns`) → unchanged; the rewrite is a no-op.
5. **Idempotent re-run:** applying the rewrite twice → the second pass changes
   nothing.
6. **Multiple nodes rewritten on one instance:** several nodes with `{child}`
   refs → each rewritten to ITS OWN child's wire; no cross-node bleed.
7. **Children still emit after a drop:** a node with both a resolvable and an
   unresolvable `{child}` run → the resolvable one is rewritten, the unresolvable
   one is dropped, and (integration, via M2) the child elements still emit as
   their own elements.
8. **Same-instance invariance:** the rewrite on instance A's nodes does not
   affect instance B's nodes (per-instance path-key wires) — after rewrites, each
   instance's refs reflect only its own compiled wires.
9. **DOM/SSR/markdown parity (integration, rides M2):** a placement content root
   with `bodyRuns` renders the SAME inline order in DOM, SSR, and the main
   markdown/lineMap re-emit (PAR-5, D15) once the rewrite is applied at every
   render-feeding site.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **Unresolvable ref → deterministic drop:** a `{child: '<unknown>'}` ref →
   the run is DROPPED (never a throw, never a replaced-with-wrong-child).
2. **Non-string / malformed child ref → drop, never throw:** a `{child: 42}` (or
   a non-string ref) → dropped deterministically; the rewrite does NOT throw.
3. **A node with an authored id that maps to NO child (absent/foreign id)** → the
   ref is dropped; the node is otherwise untouched.
4. **Never a wrong-child:** for a node whose authored id resolves, the rewrite
   maps it to that child's OWN wire — a test asserts the result is not some other
   element's wire.
5. **No-throw on malformed `base.bodyRuns`:** a non-array / non-conforming
   `bodyRuns` value (already warned `body-runs-shape-invalid` by the engine) →
   the rewrite never throws; it either skips or drops per §5.2.
6. **Renderer unrewritten-site regression guard (integration):** if a render-
   feeding translate were NOT rewritten, the children-vanish/wrong-lineMap
   symptom returns — the M2 integration test asserts the rewrite IS applied at
   the L114/L335/L131 sites (the census is regression-tested, not just the helper).

### 5.8 TDD red-set framing + the M2 ride-along

- **Unit-M3 red set = §5.6 + §5.7 against the `src/main/body-runs-rewrite.ts`
  helper directly** (its pure behavior on crafted inputs) — this is the 
  capability-only red set. The TestWriter RUNS it before implementation (RCA-1);
  the helper does not yet exist → the red set fails (method missing). The
  Implementer lands the module (least code to go green).
- **The observable-behavior ride-along is on M2 (A1):** the helper has NO
  observable DOM/markdown effect until `buildSubtree` emits `bodyRuns` (M2,
  `docs/specs/unit-m2-inline-bodyruns-emit.md`). The M2 integration test is the
  real render correctness gate (children render in the correct inline order on a
  placement content root; lineMap correct). M3's helper must be green BEFORE M2's
  emit lands (A1) so M2 never ships on an unmet rewrite.
- **After M2, M3's DOM/SSR/markdown parity + never-throw/drop invariants are
  re-asserted against the live render** (§5.6 9, §5.7 6). Greens are blind-run +
  doc-reviewed per RCA-4/6; adversarial pass §3a TBD.

### 5.9 Cross-references

- Gate: `docs/specs/inline-order-render-fix-review.md` §2 (feasibility #3 — the
  host rewrite), §3 **A1/A2/A3**, §4 (execution order: M3 first), §8 (the host
  rewrite is forward-compatible with the upstream fix).
- Defects: `docs/defects.md` **ENG-BODYRUNS-WIRE-REF-PATHSTATE** (the open handoff
  this unit works around; the package is NOT patched).
- HANDOFF: `docs/HANDOFF.md` (the catalogue the defect record flows into).
- Engine: `node_modules/provident-ssr/dist/core/render-helpers.js` ~L109-193
  (`pathWireOf`, `isInterleaving`, `emitTextProp`, `resolveBodyRunsChildWires`),
  `node_modules/provident-ssr/dist/core/translate.js` L178-184 (`LegacyNodeData.
  bodyRuns` passthrough → `base.bodyRuns`), `dist/core/body-runs.d.ts` (`BodyRun`,
  `encodeRuns`/`decodeRuns`/`isBodyEncoded`). The engine is READ-ONLY — nothing
  here patches it.
- M1 / M2 / M4 (this program): `docs/specs/unit-m1-inline-offset-model.md` (the
  offsets the M2 emit consumes), `docs/specs/unit-m2-inline-bodyruns-emit.md`
  (the traversal emit that CALLS this rewrite — must lag M3, A1),
  `docs/specs/unit-m4-inline-order-reconcile.md`.
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE** (the store is
  authoritative; the graph is a transient materialization this rewrite operates
  on), and the open-defect-handoff discipline (record, don't patch).
- Host patterns: `src/main/adjacency.ts` (the existing shared PURE module pattern
  this module mirrors), `src/main/traversal.ts` (`renderEnvelopeMarkdown` at
  L131 — the main-side call site), `src/renderer/runtime.ts` (`translateLegacy`
  at L114/L335/L514/L946 — the renderer call sites).

## 6. Flags / ambiguities (raised, not guessed)

1. **Compiled-state availability at the renderer translate sites (raised — the
   one real design tension).** The rewrite needs each inline child's compiled
   path-key wire, but `translateLegacy` returns un-compiled `Node`s; compiled
   states only exist after `compilePath`/`compile` (which the Runtime runs in
   `render()`). At runtime.ts L114/L335 the nodes are not yet compiled when
   `translateLegacy` returns. The CONTRACT here (idempotent, never-throw,
   deterministic drop) is implementation-agnostic, but the call-site hooking
   (rewrite at the translate call vs. once the compiled actionable set exists in
   `render()`) is an Implementer decision; the "always apply after every
   translateLegacy" census (§5.4) is the SAFE target posture. If a render-feeding
   site cannot hold compiled states at the translate call, the rewrite must be
   moved to the pre-emit seam (after compilation, before `renderProducingProcess`)
   — an A1/A2-compatible placement. Flagged so the Implementer does not silently
   apply the rewrite to an un-compiled instance (a no-op that would drop children
   at render).
2. **The exact wire identity / childOrder relationship for NON-placement inline
   children under a placement-routed envelope (raised, rides M2):** whether the
   inline children emit on nodeId wires or path-key wires (and thus which wire
   the rewrite must produce for them) is confirmed by the M2 integration test
   before the rewrite's wire derivation is hardened. This unit pins the
   behavioral contract (§5.2) so the safe default (pass-through/drop) holds even
   if the wire identity is confirmed later.
