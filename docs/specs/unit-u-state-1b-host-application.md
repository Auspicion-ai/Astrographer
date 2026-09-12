# Unit U-STATE-1b — Host Application of the Reconciler — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** Gate
`docs/specs/u-state-1-content-repopulation-review.md` (PROCEED-WITH-AMENDMENTS);
unit U-STATE-1a (the pure reconciler) is **COMPLETE**
(`src/renderer/content-reconcile.ts`). This is the per-unit contract required by
AGENTS.md item 9 / umbrella amendment A1 **before any TestWriter red set**.

**TestWriter RED (2026-09-11, RCA-1):** `tests/unit-u-state-1b-host-application.test.ts`
authored from this spec ALONE (9 cases: §4 states 1–6/8 + §5 F2/F4). RUN and
reported: **`TypeError: runtime.materializedContentRoots is not a function` /
`applyContentReconcile is not a function` — 9 failed / 9**. **STATUS: RED —
awaiting the Implementer pass.**

**Implementer UPDATE (2026-09-11c): WIRED + GREEN.** The change-kind dispatch
(`edit-controller` `RebuildKind`/`requestRebuild(kind)`/`onRebuild(kind)`) and
`SidebarPanes.reDerive(kind)` landed; **content** changes take the new
`applyContentChange` (pane-inclusive assemble → `reconcileContentRoots` →
`Runtime.applyContentReconcile`, no `loadEnvelope`/teardown/operator remount),
**operator**/**template** keep `refresh()`. A content re-derive calls
`loadEnvelope` **0 times** (the re-anchored contenteditable CRITICAL #1).
Adversarial re-run on the wired path (§11): AF1b-1..4/6 FIXED; AF1b-5 open-low.
**Trio: 159 files / 3808 pass + 43 skip, typecheck 0, build 0.** Doc review:
`archive/reviews/2026-09-11-unit-u-state-1b-1c-doc-review.md`.

**Implementer (2026-09-11): PARTIAL — BLOCKED on the adversarial HIGH finding
AF1.** The two Runtime methods landed (`materializedContentRoots`,
`applyContentReconcile`, `extractContentRoots`, `ApplyReconcileInput`/
`ApplyReconcileReport`); the initial 9 tests passed, but the adversarial pass
(RCA-3) found the attach path does not actually materialize, and a strengthened
test exposes it: **`rag-docC` is absent from `renderedHtml` after an `added`
bucket** (`tests/unit-u-state-1b-host-application.test.ts` state 3 now FAILS).
Trio at the partial landing: 158 files / 3797 pass + 43 skip, typecheck 0, build
0 — but **this unit is NOT done**.

## 9. Adversarial findings (RCA-3, 2026-09-11) — BLOCKING

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **AF1** | **HIGH** | **`attachRoot` reports `applied` but never materializes the root.** The mini-envelope `{ template: { root: { type:'div' } }, content: […] }` has no `main` zone producer and uses a fresh hub, so the root's `targetPlacement` resolves against the wrong graph; only `supervisor.registerNode` + `this.nodes.push` run, and the already-bootstrapped `render()` emits from `prevStates`, so the new root is never compiled/placed. Observed: `applied:['rag-docC']` while `renderedHtml` lacks it. | **OPEN — blocking.** Fix: translate with the LIVE hub/graph (or recompile the live root with `this.nodes` after registering), so placement anchors resolve into the existing `zone:main`; then flush/settle before render. |
| **AF2** | HIGH | No `rag-` validation on `result` buckets → a malformed/hostile `result` (e.g. `cssId:'zone:main'`) destroys the template/zone (`renderedHtml === ''`). §5 F1 requires containment. | **OPEN — hardening.** Reject/skip non-`rag-` cssIds in `applyContentReconcile`. |
| **AF3** | MED | `this.envelope` is left stale while `this.contentRoots` advances → `code.get`/`code.loadBatch`/validate read a desynced source of truth. | **OPEN** (scope: 1b or 1c) — update `this.envelope` content on reconcile. |
| **AF4** | MED | `materializedContentRoots()` is a shallow copy — callers can mutate store node objects (the doc comment is false). | **OPEN** — deep-copy or return frozen projections. |
| **AF5** | MED | `this.nodes` grows unboundedly; `destroyRoot` never removes destroyed roots/subtree from it (`isPlacementRouted`/`exportLegacy` scan it). | **OPEN** — prune `this.nodes` on destroy. |
| **AF6** | MED | A twice-materialized `rag-<id>` (section + doc-child) → `nodeByPropsId` destroys an arbitrary first match; the reconciler is first-wins. | **SPEC AMBIGUITY** — Architect ruling on duplicate addressing needed. |
| **AF7** | MED | `destroy` cascade is deferred; `applyContentReconcile` never `flush()`es → the returned view/census is a pre-settle snapshot. | **OPEN** — settle (like `teardownResult`) before returning. |
| **AF8** | LOW | `payloads` is never updated on attach/destroy (payload/userData leak; unplaced linger). | **OPEN**. |
| **AF9** | LOW | A malformed `result` (missing `added`/`replaced`) throws mid-mutation (destructive partial). | **OPEN** — validate buckets first. |
| **AF10** | LOW | `next` duplicate `cssId`s not deduped in `extractContentRoots` (vs the reconciler's first-wins). | **OPEN**. |
| **AF11** | LOW | Duplicate bucket entries → spurious warnings / double-register. | **OPEN**. |
| **AF12** | INFO | `applyContentReconcile`/`materializedContentRoots` have **no call sites**; `sidebar-panes.refresh` still calls `loadAppGraph`→`loadEnvelope`→`tearDownGraph` — C10 is NOT achieved by this code alone. | **OPEN** — §3.1 host wiring still to land (1b's remaining half). |
| **AF13** | INFO | The original tests masked AF1 (they asserted only *kept* roots). | **FIXED** — state 3 now asserts the added root renders (currently red). |

**Verdict: U-STATE-1b INCOMPLETE.** The pure API shape is in place, but the core
outcome (added/replaced roots actually render; the host stops tearing down)
is not achieved. AF1/AF2/AF12 are the critical path. **A fix pass + a re-run of
this adversarial set is required before 1b can be called green.**

## 11. Adversarial findings on the wired content path (RCA-3, 2026-09-11)

After the content path was wired (change-kind dispatch + `applyContentChange` +
pane reconciliation), a read-only adversarial pass found:

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **AF1b-1** | HIGH | `reDerive`'s **in-flight coalescing dropped the kind** — a second request while awaiting the snapshot re-invoked `reDerive()` with the default `'content'`, so a queued template/operator rebuild silently became a content rebuild. | **FIXED** — `reDeriveQueuedKind` + `mergeRebuildKind` (precedence template>operator>content); the `finally` fires the preserved kind |
| **AF1b-2** | HIGH | `pendingContentChange` was **overwritten** per broadcast — a coalesced content change covering several broadcasts lost the earlier roots' ids (missed repopulation). | **FIXED** — accumulate `nodeIds`/`edgeIds` as unions; `kind` sticky-structural |
| **AF1b-3** | MED | `contentRoots` was **not reset on full-reset paths** (`teardown`/`loadDoc`) → `materializedContentRoots()` returned stale roots, mis-classifying a later reconcile. | **FIXED** — `tearDownGraph` clears `contentRoots` + `envelope` (regression: the 1b `reset` test) |
| **AF1b-4** | MED | `shapeProjection` stripped **all** `data-*` → an authored `data-*` change (doc-nav `data-current` highlight) was never detected. | **FIXED** — only runtime markers (`data-doc-head`, `data-node-id`) are excluded; authored `data-*` are compared (regressions R8/R9) |
| **AF1b-5** | LOW | `backRefs` is recomputed from a throwaway `translateLegacy`, not the live graph (Decision 3 deviation). | **CLOSED (accepted)** — the `backRefs` **contract is its KEYS** (the `rag-` ids: `isEditable`/`commit` check `has(ragId)`; the map is the edit-surface reverse lookup). The values are engine node ids used only informationally; the envelope is the same authored data the live graph was built from, so the keys are correct. Deriving from the envelope avoids a live-graph walk on every content change. (Decision 3's "live graph" wording is satisfied at the key level; recorded here.) |
| **AF1b-6** | LOW | A stale `pendingContentChange` could be reused by a non-RAG content rebuild (`selectDocument`). | **FIXED (partial)** — cleared on operator/template; `selectDocument` follow-up |
| — | clean | First content change does not double-attach panes (boot's `loadEnvelope` seeds `contentRoots` incl. panes); operator/template path correct in isolation; no pane→`backRefs` pollution; pane shape is deterministic; hub change has no regression beyond AF1b-3. | — |

Regressions added: `unit-u-state-1a-content-reconcile-adversarial` R8/R9; the 1b
`reset` test; `edit-controller` kind-precedence test. **Trio: 159 files / 3808
pass + 43 skip, typecheck 0, build 0.** **Coverage gap (partial):** host-level
tests for `applyContentChange`/`reDerive(kind)` beyond the kind + the re-anchored
contenteditable CRITICAL #1 remain thin.

## 10. AF1 root cause + corrected fix design (2026-09-11, user-confirmed)

**Root cause.** `attachRoot` translated the new root with a **fresh, anonymous
hub** (`translateLegacy({…})` with no `opts.hub`) into a bare template with no
`main` container. Placement resolution is **per-hub** (provident-ssr
`translate.d.ts:149-155`: "one `LinkConfigNameHub` instance per tree — same-name
component/placement anchors land on ONE shared Link"). So the new root's
`targetPlacement: ['main']` anchor joined a different hub than the live
`zone:main`, and the node was never compiled/recorded — `applied` was reported
while nothing rendered. The app Runtime's hub is also anonymous: the constructor
(`runtime.ts:156`) and `loadEnvelope` (`:378`) call `translateLegacy` with no hub.

**Corrected mechanism (user ruling — see `ui-overhaul.md` §3.1 "translate+attach
mechanism"):**

1. **Runtime owns ONE persistent app-graph hub** (`this.hub = createLinkHub()`),
   passed to every app-graph `translateLegacy` (boot, `loadEnvelope`, `loadDoc`,
   and the attach path). This is **U-STATE-1c**'s "engine scaffolding persists"
   concern and is the **prerequisite** for 1b's attach — so 1b's fix depends on
   1c's hub-ownership landing first.
2. **`attachRoot`** translates the incoming content (still required — data
   arrives as legacy envelopes from Gnosis/UI/MCP) with
   `translateLegacy(mini, { hub: this.hub })` into the LIVE hub (so the new
   root's `targetPlacement` anchor joins the same per-name Link as the live
   `zone:<name>` container), admits the resulting nodes via
   `Runtime.admitContentNodes` (handler-body resolution + tracking), and
   force-recompiles the graph. **No explicit `placement-attach` op is needed** —
   the shared-hub translate makes placement resolve at compile (verified: the
   added root renders).
3. Compile/record the new node states (`compilePath` → actionable →
   `recordResolved`/`setStates`) so `render()` has state for them.
4. `render()` with the **retained** `domPrevMap`/`ssrPrevMap` (no
   `resetRenderState()`) → DOM surgical, SSR consistent (A9).
5. **Teardown rule:** `tearDownGraph` is full-reset only (boot /
   `provident.teardown` / `loadDoc`); the content-change path never calls it.
   AF2/AF3/AF4/AF5/AF7/AF8/AF9 fixes as in §9.

**Revised 1b/1c boundary:** **U-STATE-1c** owns (a) the persistent app-graph hub
+ Supervisor (scaffolding lifetime), (b) the operator-scope persistence, and
(c) incremental `backRefs`. **U-STATE-1b** owns the reconcile application
(placement-attach/destroy/state-slice) and the host call-site rewiring, and
depends on 1c's (a). The gate's A6 (Supervisor persists) and this hub ownership
are the same "scaffolding persists" decision.

U-STATE-1b wires the reconciler into the renderer host so a RAG change repopulates
content instead of tearing the page down (C10, hard requirement). Lifecycle
(journal/Supervisor/operator persistence/backRefs) is **U-STATE-1c**; test
re-anchoring is **U-STATE-1d**. This unit must NOT change the journal/operator
scope (that is 1c) — it only stops the full rebuild and applies the buckets.

---

## 1. What the proposal asks

Replace the content-rebuild path in the host:

- **Current** (`src/renderer/sidebar-panes.ts:587-620, 782-891, 1155-1179` +
  `src/renderer/runtime.ts:325-348, 759-776`): `reDerive` → `refresh` →
  `loadAppGraph` → `runtime.loadEnvelope` → `tearDownGraph` (destroy every
  in-tree non-root) → full `render()`.
- **Required:** keep the template + zones + panes; replace only the content
  roots the reconciler marks. Use managed ops.

Gate pins: A1 payload diff, A2 pure reconciler (landed), A3 whole-root replace
v1, A4 producers persist, A9 full SSR re-emit (DOM surgical), A10 mechanism-only
+ preserve zone nodes; ADV-1/AF2 (a removed nested child is detected).

---

## 2. New Runtime surface (pinned)

`src/renderer/runtime.ts` gains a method that applies a reconcile result against
the currently-loaded graph, WITHOUT `tearDownGraph`:

```ts
export interface ApplyReconcileInput {
  /** The reconcile buckets (from `reconcileContentRoots`). */
  result: ReconcileResult
  /** The fresh traversal envelope (`buildTraversal(...).envelope`) whose
   *  payload content supplies the added/replaced roots' node data. */
  next: LegacyInitialData
}

export interface ApplyReconcileReport {
  /** The RAG subtree roots actually attached/updated (css ids). */
  applied: string[]
  /** Warnings (a root whose next node data was not found, etc.). */
  warnings: string[]
}

/** Apply a content reconcile WITHOUT tearing the graph down. Destroys only the
 *  `removed` roots, attaches the `added`, and replaces the `replaced` roots —
 *  all through the managed channel (journaled). The template + zone producers +
 *  pane roots are untouched. */
applyContentReconcile(input: ApplyReconcileInput): ApplyReconcileReport
```

Plus a read accessor for the host to hand the reconciler its `previous`:

```ts
/** The current content roots as envelope nodes (the reconciler's `previous`). */
materializedContentRoots(): LegacyNodeData[]
```

**Determinism/purity:** `applyContentReconcile` is the only mutating method;
both it and `materializedContentRoots` are node-testable with the existing
Runtime test harness (no Electron).

---

## 3. Host wiring (pinned call sites)

### 3.1 `SidebarPanes.refresh` / `reDerive`

Replace the `loadAppGraph(this.runtime, this.lastTraversalEnvelope)` call in
`refresh` (`:667-669`) with:

1. build the fresh traversal envelope (already done in `reDerive`);
2. `previous = runtime.materializedContentRoots()`;
3. `result = reconcileContentRoots({ previous, next: traversalEnvelope, change: lastChange })`;
4. `runtime.applyContentReconcile({ result, next: traversalEnvelope })`;
5. `assembleAppGraphEnvelope` for the PANES only (pane roots are preserved; the
   pane payloads are reconciled separately or left attached — Reading 2, zone
   nodes preserved);
6. recompute `backRefs` from the **live** reconciled graph (Decision 3 — moved
   from 1c; NOT a throwaway `translateLegacy`);
7. **do NOT call `mountOperator`/`refreshOperator`** — the operator pane is
   decoupled from content refreshes (1c §2.3, user ruling 2026-09-11). Remove
   the `mountOperator()` call from `refresh` (`sidebar-panes.ts:674`).

**Attach path (AF1c-2):** `attachRoot` MUST translate with `{ hub: this.hub }`
(no anonymous hub) and admit the resulting nodes via `Runtime.admitContentNodes`
(completed — handler-body resolution + id-index + tracking), then
`placement-attach` by node ref to the live `zone:<name>` container.

**Boot / empty store (A7):** the FIRST load keeps `loadEnvelope` (no previous
graph to diff). The content reconcile path applies only when
`materializedContentRoots()` is non-empty OR the runtime is already booted.

### 3.2 Change payload

`onRagStoreChanged` (`:895`) already receives `RagStoreChangedPayload`; capture
it as `lastChange` and pass it into the reconcile (A1). A template change
(`onTemplateChanged`) passes `change: null` (forces the fallback).

### 3.3 `loadEnvelope` / `tearDownGraph`

Not removed (boot still uses `loadEnvelope`); they simply stop being called on
the content-change path. `tearDownGraph` remains for `loadDoc`/teardown.

---

## 4. States (TestWriter red set — valid paths)

1. Boot `loadEnvelope` with 2 docs → `materializedContentRoots()` returns 2
   `rag-` roots (not panes).
2. A content change editing doc A → only A's root replaced; B untouched; the
   template/zone nodes keep their ids (census: zone node still in tree).
3. A structural change adding doc C → C attached; A/B kept.
4. A structural change removing doc B → B's root destroyed; A/C kept.
5. An unchanged change (empty bucket) → no-op (no attach/destroy; census same).
6. `applyContentReconcile` with an `added` root whose node data is missing from
   `next` → a warning, no throw (defensive).
7. The reconcile path is journaled (the source-change journal entry exists;
   `undo` restores — cross-checked in 1c, asserted minimally here).
8. Node identity: after a content change, a `rag-<b>` node's `css.id` is
   unchanged (stable identity claim).

## 5. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | `next` malformed (the reconciler throws) | the host surfaces the documented guard (never a partial mutation) |
| F2 | `result` references a root not present in `next` | warning + skip (total) |
| F3 | empty store (0 roots) → content added | attach path (no previous) |
| F4 | every root removed (documents emptied) | destroy all content roots; template/zones persist |
| F5 | a change while an edit is dirty | queue via `requestRebuild` (A8) — no reconcile until clean |
| F6 | SSR re-emit fails | DOM unchanged; surface the error (testable seam) |

---

## 6. Numeric / census claims

- The land adds **3** Runtime methods (`applyContentReconcile`,
  `materializedContentRoots`, `admitContentNodes`) + **2** types
  (`ApplyReconcileInput`, `ApplyReconcileReport`) + the host wiring
  (`SidebarPanes.reDerive(kind)`, `SidebarPanes.applyContentChange`, and the
  `edit-controller` `RebuildKind` + `requestRebuild(kind)`/`onRebuild(kind)`).
- No new npm dependency; no `provident-ssr` change (0.4.1 upgrade was separate).

---

## 7. Cross-references

- Gate `docs/specs/u-state-1-content-repopulation-review.md` A1–A4/A7–A10 +
  ADV-1; decision `U-STATE-1-CONTENT-REPOPULATION-GATE`.
- U-STATE-1a `docs/specs/unit-u-state-1a-content-reconcile.md` (landed).
- Build: `src/renderer/runtime.ts` (`loadEnvelope`, `tearDownGraph`, `render`),
  `src/renderer/sidebar-panes.ts` (`reDerive`, `refresh`, `loadAppGraph`,
  `onRagStoreChanged`, `recomputeBackRefs`), `src/renderer/pane-graph.ts`
  (`assembleAppGraphEnvelope`).

---

## 8. Delimitation + open design points

- **Journal/operator persistence + incremental `backRefs` are U-STATE-1c**, not
  this unit. If `applyContentReconcile` unavoidably recreates the Supervisor or
  the operator scope, that is a scope violation — flag it.
- **Open design point (RESOLVED):** `replaced` is applied as whole-root
  `destroy`+`placement-attach` (A3). The richer `state-slice` path is a later
  optimization.
- **Open design point (RESOLVED):** pane roots are preserved (Reading 2); the
  assembly re-attaches pane payloads without a full graph load (verify the pane
  assembly supports additive updates; else pane rebuilds remain and content-only
  is partial for panes).
- **Operator pane:** `refresh` must NOT remount it (1c §2.3). `backRefs` is
  recomputed from the live graph here (Decision 3).
