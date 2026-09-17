# Change-Analysis Verdict — ARCH-GNOSIS-OFFLOAD (amended): Gnosis offload / render-path scoping

- **Kind:** proposal-gate FINAL VERDICT (step 3 of the three-agent gate,
  `AGENTS.md` item 8) — the record that closes the proposal gate and opens (or
  refuses) the spec gate.
- **Proposal:** `docs/specs/gnosis-offload-proposal.md` (PROPOSED, AMENDED
  2026-09-16, ARCHITECTURE RULING §3.2 = APPROVED-AS-SPLIT, Alt C).
- **Reviewer:** change-analysis agent (read-only; no file edited).
- **Inputs:** the proposal + its A1–A15 amendments and §3.3 invariant; the
  **validity** verdict (VALID-WITH-AMENDMENTS); the **critique** verdict
  (NEEDS-REWORK); the **architecture** verdict (APPROVED-AS-SPLIT, shape Alt C);
  the build (`src/renderer/runtime.ts`, `src/renderer/sidebar-panes.ts`,
  `src/renderer/pane-graph.ts`, `src/renderer/content-reconcile.ts`,
  `src/renderer/layout-state.ts`, `src/renderer/index.html`,
  `src/main/rag-store.ts`, `src/main/main.ts`, `src/shared/types.ts`);
  `scripts/live-drive.mjs`; `docs/decisions.md`; `docs/defects.md`;
  `docs/pending.md`; `docs/next-steps.md`; `docs/HANDOFF.md`;
  `docs/specs/process-rca-battery.md` (→ the archived original,
  `archive/parent-project/2026-08-26-process-rca-battery.md`, RCA-1..RCA-5);
  `docs/specs/rca-live-bugs-green-pipeline.md` (RCA-11/12);
  `docs/specs/user-flow-audit.md` (D-GP-UFA-1..4, §5.U, §6.1/§6.2);
  `docs/specs/user-flow-audit-checklist.md`; `AGENTS.md` items 3/4/8/9/10.
- **Status:** **PROCEED-WITH-AMENDMENTS** (GATED 2026-09-16). The architecture
  review's split is adopted as the gate's shape. **Nothing is delegated to a
  TestWriter until §5's spec-gate checklist is fully satisfied, and no unit lands
  before O-0's committed artifact exists.** Only this passing review PLUS the
  user's go-ahead opens the spec gate.

---

## 1. VERDICT

**PROCEED-WITH-AMENDMENTS** — the proposal as *originally* written ("make Gnosis
the owner of heavy document handling") was not the right first move and is now
correctly demoted to a parked destination; what remains is a **different, cheaper
and better-evidenced proposal** — scope the renderer's re-derivation, make the
slot authority explicit, move layout geometry into CSS, and measure before fixing.

Decisive reasoning (max ~10 lines):

1. The critique is right on the causal claim's *lever*: the measured cost is
   renderer-side DOM style/layout/paint (`translateNodeData` 13 + `renderTree` 8
   + `enumPathWalks` 8 ms of a 465 ms task; `defects.md` `PANE-TOGGLE-FULL-REASSEMBLY`),
   and the engine/worker traversal the proposal named cannot touch it — so the
   engine legs must not be the vehicle. The architecture split already does this.
2. The validity review is right that the causal *mechanism* was mis-stated for
   two rows and that `createRemoteRagStore` cannot implement a synchronous
   `RagStore`; §3.1 A4 + §3.3 of the proposal now state both.
3. The cheap units (O-9, O-10, O-3) attack measured defects with measured fix
   shapes already recorded in `defects.md`; they are single-diff reversible and
   touch no store contract.
4. The expensive units (O-1, O-2) touch the exact code path that produced
   LIVE-UF6, the slot instability (`I-10`) and the stale-mount leak (`N2`) — this
   is the repo's riskiest code, and it lands **after** the cheap units, behind
   explicit guardrails (one admission point, sole classifier, one new `Runtime`
   entry point, the single-in-flow-`#wiki-root` invariant promoted to a node test).
5. The proposal's own §4 counter-consideration is answered: the offload is a
   destination, not a prerequisite — so approving the split approves the
   incentive-relevant work only.
6. Nothing is lost by the split: O-6/O-7/O-8 keep their engine-repo handoff rows
   and their external trigger conditions.

**The single condition that most threatens the outcome:** *O-0's committed
measurement artifact does not exist yet.* Every threshold (O-5's budget), every
"is this unit even worth doing" judgment (O-1/O-2 vs O-9/O-10), and the entire
justification for parking the engine track (trigger (c): "O-0 shows the
derivation WALK itself exceeds the budget") rest on a breakdown that has never
been produced. If O-0 is skipped, stubbed, or authored by the same agent that
implements the fix, the gate degenerates into the RCA-11/RCA-12 failure mode:
green gates on the wrong layer. **O-0 is therefore a hard precondition, not a
unit.**

---

## 2. VERDICT RATIONALE mapped to THIS repo's process rules

The architecture review's split is judged below on whether each unit can actually
pass THIS repo's gates. It is a **good split**, but three of the seven rows are
"units" only nominally, and one cannot satisfy a gate as scoped.

| Rule | Does the split satisfy it? | Where it fails / what must change |
| --- | --- | --- |
| **item 9 (delegation gate)** — a unit is delegable only once its `docs/specs/*.md` contract exists AND a TestWriter has run and reported the red set | **Partly.** O-1/O-2/O-3/O-9/O-10 are contract-able (they are host-side behavior changes). **O-0, O-5, O-4 are not delegable as spec'd** — none has a behavior contract; they are instrumentation. | O-0/O-5 must be re-scoped as **harness-deliverable rows** (see §2.1) with a *contract on the report shape*, not on app behavior. |
| **RCA-1 (red set RUN and REPORTED per unit before implementation)** | **Fails for O-0, O-5, O-3.** | **O-0** produces a measurement, not a failing test — there is nothing to go red. **O-5**'s budget is unknown until O-0 runs, so its assertion cannot be written first (a threshold-inventing TestWriter is the anti-pattern). **O-3** removes a JS write for a behavior that is *already correct* in the rendered app — no red exists; it is a refactor. |
| **RCA-2 / RCA-5 (per-unit cycles; never a shared inline pass)** | **Yes** — §3.2 pins landing order O-0 → O-5 → O-9+O-3 → O-10 → O-1 → O-2, each a single-diff revert. | The "O-9**+O-3**" pair is the one bundled step. §3.2's own A15 note says O-3 is small enough to fold into O-9. **Pin the fold**: one unit, one red set, one cycle. |
| **item 3 (TDD always; a change adding no test is itself a finding)** | **Yes for O-1/O-2/O-9/O-10**, each of which has a node-testable invariant (§3.3's root-scoped rule is explicitly testable in node — the proposal lists 5 assertions). | O-3 as its own unit fails this: "drop the JS `--stage-weight` serialization" is testable only as a *source pin* (and `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts:44` currently pins the OPPOSITE). Fold it into O-9, which has a real red. |
| **RCA-3 (adversarial pass mandatory after each green)** | **Yes** — the split's riskiest units (O-1/O-2) are exactly the ones the adversarial pass exists for. | The adversarial prompt must name the A13 watchlist as its target set (duplication census, `#wiki-root` census, slot census, MCP-visibility census), not be left generic. |
| **item 10 / RCA-4 / RCA-6 (blind-greens + doc-review per unit)** | **Yes for the behavior units.** | For O-0/O-5 the blind-greens artifact is the *coverage report* (`user-flow-audit.md` §6.1), not a greens doc — see §2.1. |
| **RCA-11 (live battery MANDATORY pre-DONE for UI-rendering units; park only a structurally non-exercisable surface WITH a recorded reason)** | **Yes, and this is the split's strongest property.** Every behavior unit here (O-1, O-2, O-9, O-10) is *defined by* a live row, and `scripts/live-drive.mjs --connect` + CDP is proven working on this repo (`user-flow-audit.md` §5, the D-GP-UFA gate). | **No unit may be parked.** These are the most live-assertable units this repo has ever had (long tasks, painted boxes, slot indices, mount counts). A `-live-pending-battery.md` for any of them is a review finding. |
| **RCA-12 (verify the right layer; envelope-green ≠ app-green)** | **Yes** — §3.2's "per-unit layer declaration" + the proposal's own §5 table ("assembled layer") name the layer. | The declaration must be in the **unit spec**, not only the umbrella table (see §5 item 3). O-0/O-5 are the `assembled-renderer` layer by construction — that is their whole point. |
| **D-GP-UFA-1..4 (§5.U matrix cap ≤8, `proxyPASS:false`, `realInput` proof, `summary.total` == matrix rows)** | **Partly — and this is the gate's real cost.** The matrix is **capped at 8 rows and is currently FULL** (U-1..U-8). Five units here each owe a live row. | The gate cannot accept a 9th row. **Amendment A-6 (§3)**: each unit's live assertion must either (a) *re-pin an existing row* whose behavior it changes (see §3 mapping), or (b) enter as an **extended (non-matrix) row** per `user-flow-audit.md` §3's allowance for rows outside `ROW_EXTENDED`. A unit cannot claim a §5.U matrix slot it does not have. |
| **item 4 (trio after every change: test + typecheck + build)** | **Yes** — mechanical. | — |
| **item 8 (this gate; contract changes need the full landing)** | **Yes** — this verdict is the landing. | The `mcp-endpoint.md` delta list (validity A7/A4) is still unwritten: nothing here changes the MCP wire today, but the *snapshot* contract changes (additive) and the O-1 invariant narrows what an agent observes through `get_rendered_html`/`get_markdown`. |

### 2.1 The three rows that CANNOT satisfy a gate as scoped

**(a) O-0 — a pure-measurement unit has no red set and no user-visible end state.**
As spec'd ("a named `scripts/live-drive.mjs` block that stages one freeze … a
recorded per-stage ms breakdown") it is *instrumentation*, not a unit. It cannot
go red, it cannot be blind-greened, and its "green" is unfalsifiable unless the
report shape is pinned. **Re-scope it as a committed harness artifact with a
contract on the report**: the block must emit, per stage
(`snapshot pull` / `buildTraversal` / `assembleAppGraphEnvelope` / `translateLegacy`
/ `compilePath` / DOM `render()` / SSR mirror / reconcile / post-render layout),
a **named numeric field** plus the long-task list, with `proxyPASS:false`-style
honesty (a stage that cannot be separated must be reported as *unseparated*, never
imputed). It is a **precondition gate**, delivered by the live-runner role — and it
still owes the RCA-12 layer statement and a documented run command. This is
exactly how `scripts/live-drive.mjs`'s existing `MATRIX_ROWS` reconciliation works
(`scripts/live-drive.mjs:483-531`), so the mechanism exists.

**(b) O-5 — a harness unit can satisfy RCA-11 but NOT RCA-1 as written.** Its
"FAIL row when a user interaction exceeds the pinned budget" is only testable
live, and the pinned number does not exist until O-0 runs. Two consequences:
(i) O-5 **cannot be delegated before O-0** (correctly pinned in §3.2); (ii) O-5's
*node* red set must be the **harness's own contract** — the reconciliation logic
(`reconcileMatrixRows`, the report schema fields, the "a block that cannot fail is
not evidence" rule from `user-flow-audit.md` §3), which is TDD-able in node and
already has a precedent (`tests/live-drive-contract.test.ts`). Without that,
O-5 adds a test-free file and is an item-3 finding.

**(c) O-3 — a pure-CSS/JS-refactor unit has no node red set and no user-visible
end state.** The window-resize geometry is *already* correct (idle resize = 6 ms,
`defects.md` `CANVAS-DIMENSIONS-JS-DRIVEN`); what is wrong is *who owns the
number*. There is no failing behavior to write first — only a source pin, and the
existing pin asserts the opposite (`tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts:44`
expects `--stage-weight === '700fr'`). **Fold O-3 into O-9** (the proposal's own
A15 note) so the CSS refactor rides a unit that has a real red (the 2 556-mutation
/ 465 ms gesture), and let O-9's live row carry O-3's acceptance
("after a resize the geometry follows with no JS layout write").

**Verdict on the split:** 4 gate-satisfying units (O-1, O-2, O-9[+O-3], O-10) +
1 pre-gate artifact (O-0) + 1 conditional unit (O-4) + 1 harness unit that must be
re-scoped to be TDD-able (O-5). That is a *workable* decomposition — but it is
**four units, not seven**, and the spec gate must say so.

---

## 3. CHANGE-IMPACT TABLE (per now-spec unit)

Legend for **LIVE row**: the unit's owed live assertion, and whether an existing
§5.U matrix slot can carry it (`M`) or it must be an extended row (`E`) — the
matrix is capped at 8 and full.

### O-0 — the discriminating measurement (precondition artifact; not a unit)

| | |
| --- | --- |
| **Files touched** | `scripts/live-drive.mjs` (a new block + `MATRIX_ROWS`/extended wiring only if it becomes a row); no `src/` change. |
| **Pin set at risk** | `tests/live-drive-contract.test.ts` (the driver's exported contract — the only node suite that reads the driver). Low risk. |
| **Migration / compat** | none (no shipped surface). |
| **MCP contract** | none. |
| **LIVE row** | **E** — the artifact IS the live run: per-stage ms breakdown at operator corpus size (226 docs), the GPU-on/GPU-off control, and the 12 698.7 px `display:block` track ablation. **New: it must also separate the whole-store `IPC_RAG_SNAPSHOT` pull itself** (structured-clone + `buildTraversal`), which nothing in the proposal measures — see A-4. |
| **Cost** | ~one live session + the report shape. |
| **Risk** | Low, but it is the gate's load-bearing item (see §1). |

### O-1 — scoped `'content'` render (the highest-risk now-spec unit)

| | |
| --- | --- |
| **Files likely touched** | `src/renderer/runtime.ts` (the ONE new scoped-emit entry point next to `applyContentReconcile`, `runtime.ts:492-569`; `bootstrapped=false` at `:543`; `render()`/`prevStates` prune at `:253-298`), `src/renderer/sidebar-panes.ts` (`reDerive` `:1985-2067`, `applyContentChange`, `rebuildIdIndex`/`syncZoneMirrors`/`recomputeBackRefs`), `src/renderer/content-reconcile.ts` (the classifier — **may not gain a second path**), possibly `pane-graph.ts` (the doc-nav disclosure as graph state). |
| **Pin set at risk (re-derive expected)** | `tests/unit-u-shell-shell-wiring.test.ts` + `-adversarial.test.ts` + `-pbt-generators.test.ts` (the wiring/pin censuses), `tests/unit-u-state-1a-content-reconcile.test.ts` (+`-adversarial`), `tests/unit-u-state-1e-nroot-reconcile.test.ts`, `tests/props-reconcile-1a.test.ts` + `props-reconcile-1e.test.ts`, `tests/sidebar-panes.test.ts` + `sidebar-panes-host.test.ts` + `sidebar-panes-adversarial.test.ts`, `tests/unit-u-shell-1-layout-zones.test.ts`, `tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts` (the re-derive scope pin — direct conflict), `tests/unit-u-shell-9b-h3-doc-namespace.test.ts`, `tests/unit-live8-toolbar-undo-refresh.test.ts` (the toolbar reconcile allocation), `tests/unit-live4-empty-store-landing.test.ts` + `-adversarial-fix`, `tests/renderer-empty-zone-track.test.ts`, `tests/unit-u-state-1a-content-reconcile*.test.ts`, `tests/unit-u-shell-3-collapsible-panes.test.ts` (§3.5 "collapse survives a content change" is a direct pin on this path), `tests/unit-l-textarea-editing-ui.test.ts` (§5.9.7 pins the assembly guard), `tests/unit-u-shell-9b-blind-greens.test.ts`. Also `tests/import-render-no-duplicates.test.ts` and `tests/traversal.test.ts` **must stay green unchanged** — they are the regression fence, not re-derivable. |
| **Migration / compat** | No store-format change. IPC unchanged unless the `RagSnapshotPayload` `revision` (additive) lands here — it must NOT land here (amendment A-5: it belongs to the parked seam spec; see the cross-unit notes below). `RagStore` interface **must not change** (`src/main/rag-store.ts:246-297`, 22 members of which 16 are synchronous reads) — the architecture ruling is explicit, and this verdict concurs: making it async would ripple into `traversal.ts`, the MCP `rag`/`edit` handlers and the 4 746 pins for a genuinely local derive. |
| **MCP contract** | **This is the real contract risk, not the store.** Narrowing the re-derive narrows what `provident.list_targets` / `get_node_state` / `get_rendered_html` / `get_markdown` observe during and after a change. **Accept criterion: post-change MCP censuses are unchanged** (same targets, same rendered HTML for the changed document, same markdown). An MCP-visible omission is a fail, not a perf win. |
| **LIVE row** | **M** — re-pin **U-1** (`uf_panes_12`: a real doc-row click focuses the document) + **U-3** (`uf_panes_12`/`uf_panes_14` body-click half) with the added D-class oracle: **budget met** (no >100 ms long task) with `realInput:true`. |
| **Cost / benefit** | High cost, high benefit: removes the user-visible freeze for the document-open and folder-toggle gestures. |

### O-5 — long-task/liveness harness + the budget row

| | |
| --- | --- |
| **Files likely touched** | `scripts/live-drive.mjs` (the budget assertion + report fields), `tests/live-drive-contract.test.ts` (the harness contract's node red set — **mandatory**, or O-5 has no TDD surface), a `docs/specs/user-flow-audit.md` §5.U/§6.1 amendment if the budget becomes a matrix row. |
| **Pin set at risk** | `tests/live-drive-contract.test.ts` only. The 4 746-suite is otherwise untouched (a harness unit) — which is precisely why it needs its own node contract. |
| **Migration / compat** | none. |
| **MCP contract** | none. |
| **LIVE row** | **E** (the budget row is an extended row while the §5.U cap is full), plus a **recorded FAIL** demonstration: a block that CAN fail (a diagnostic that always passes is not evidence — `user-flow-audit.md` §3). |
| **Cost / benefit** | Low cost, high value: it is the only mechanism that keeps the fix from regressing silently, and it is the instrument the whole gate depends on. |

### O-9 (+O-3 folded) — pure-CSS collapse/minimize class flip + CSS-owned geometry

| | |
| --- | --- |
| **Files likely touched** | `src/renderer/sidebar-panes.ts` (`togglePaneCollapse` `:2938-2972`, `zoneMinimizeToggle` `:3009`, the `setLayout` write-through at `:2761`/`:2791` and the `requestRebuild('operator')` fan-out), `src/renderer/index.html` (`:104-139` track vars + the `is-collapsed` rule), `src/renderer/layout-state.ts` (`layoutCssVars` `:217-222`, `applyLayoutToRoot` `:282`). |
| **Pin set at risk (re-derive expected)** | `tests/unit-u-shell-3-collapsible-panes.test.ts` — **directly pinned** and the largest re-derivation in this batch: §3.2 asserts collapsed = "the body is NOT rendered" (`hasBody(collapsed) === false`), which a pure-CSS flip contradicts (the body stays in the DOM, hidden by CSS). §3.5, §F2 (the dirty-edit guard + queued re-render), §3.4 (persisted collapse after restart) and the `index.html` source-pin at §5 all move with it. Also `tests/unit-u-shell-1-layout-zones.test.ts`, `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts:44/76/83` (**pins the opposite** of O-3: `--stage-weight === '700fr'` and `index.html` consuming `var(--stage-weight`), `tests/props-layout-state.test.ts`, `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`, `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts`, `tests/unit-u-shell-4-drag-relocate.test.ts`, `tests/renderer-empty-zone-track.test.ts` (the F-3 empty-track collapse interacts with the track vars), `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts`. |
| **Migration / compat** | **No store-format change, but a persisted-state semantic change**: `OperatorSettings.layout[].collapsed` keeps its meaning (still persisted, still the boot source) — the invariant is that it stops being an *assembly input* for a gesture and becomes a *CSS class on a persistent frame*. `UI-CONFIG-CARRIER` is amended (persist WITHOUT re-derive) — the supersession row is owed (§5 item 6). The CSS var surface shrinks (one fewer JS-owned var); any operator/agent relying on `--stage-weight` breaks — it is not part of the MCP contract, so this is a documented internal change only. |
| **MCP contract** | A collapsed pane's body must stay in the graph/render output (`get_rendered_html` must still contain the collapsed pane's nodes) or `APP-GRAPH-PANES-MCP-VISIBLE` is violated. **This is the unit's sharpest hidden risk** and must be an explicit accept criterion. |
| **LIVE row** | **M** — re-pin **U-6** (`uf_panes_8`: pane-tab click after zone minimize re-expands) with the mutation/long-task budget; plus the O-3 acceptance ("after a resize the geometry follows with no JS layout write") as the same row's evidence field. |
| **Cost / benefit** | Low-medium cost, very high benefit: `PANE-TOGGLE-FULL-REASSEMBLY` is measured as 2 556 mutations / 465 ms for a class flip. Cheapest lever in the batch. |

### O-10 — `LayoutState.panes[].order` as the slot authority

| | |
| --- | --- |
| **Files likely touched** | `src/renderer/pane-graph.ts` (`:107-135` — `order` today falls back to registration `seq` when `entry?.order` is absent, which is the reorder mechanism; `:328-384` assembly order), `src/renderer/sidebar-panes.ts` (the layout read/write path), possibly `layout-state.ts` (coerce/derive). |
| **Pin set at risk (re-derive expected)** | `tests/props-pane-graph.test.ts` (assembly determinism), `tests/unit-u-shell-4-drag-relocate.test.ts` (slot/order semantics — the drag-reorder contract), `tests/unit-u-shell-1-layout-zones.test.ts` + `-w2n4-operator-grid-area`, `tests/sidebar-panes.test.ts` / `-host` / `-adversarial`, `tests/unit-u-shell-3-collapsible-panes.test.ts` (the H1 "an existing entry is COLLAPSED-ONLY" comment is the same authority rule — the two pins should converge), `tests/unit-u-shell-shell-wiring.test.ts`. |
| **Migration / compat** | **Persisted-layout meaning changes**: an existing `OperatorSettings.layout` without an `order` for some pane must still boot deterministically (derive once, then write through) or a first boot re-sorts. This is a **compat case that must have its own fail-state** (a layout with missing/garbage `order` → deterministic, never a shuffle). No IPC/store change. |
| **MCP contract** | `provident.list_targets` order stability is observable to agents; pin it. |
| **LIVE row** | **M** — re-pin the `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` assertion (the `search` pane slot must not move on an advanced-search disclosure) and pair it with **U-7/U-8**'s stage-stability evidence; the owed PANE-SLOT STABILITY row in `defects.md` is the source. |
| **Cost / benefit** | Medium cost, high benefit: it is the **prerequisite that makes O-1 safe** (a scoped pass that re-sorts a zone re-opens I-10). Must land BEFORE O-1. |

### O-2 — document open mounts only the stage payload; doc-nav bounded at CSS level

| | |
| --- | --- |
| **Files likely touched** | `src/renderer/sidebar-panes.ts` (the document-open/mount path + the doc-nav pane body), `src/renderer/pane-graph.ts` (`docNavContent`), `src/renderer/index.html` (containment: `contain: layout style paint` on pane/zone frames + a bounded scroll body — the architecture's new acceptance row), `src/renderer/runtime.ts` (the stage mount scoping). |
| **Hard constraint (architecture ruling, restated)** | Bounding must stay **graph-resident**: no row removal, no graph-level windowing. `provident.list_targets`/`get_node_state`/`get_rendered_html` must still see every doc-nav row and every content root, or `PANE-PROVIDENT-AUTHORING` + `APP-GRAPH-PANES-MCP-VISIBLE` are violated. Containment/`content-visibility`/a bounded scroll body only. |
| **Pin set at risk (re-derive expected)** | `tests/unit-live4-empty-store-landing.test.ts` + `-adversarial-fix` (the stage body vs the pane-inclusive envelope — the exact assembly seam O-2 narrows), `tests/unit-live8-toolbar-undo-refresh.test.ts`, `tests/unit-u-shell-9a-main-focus-tabs.test.ts` (open-in-tab/mount behavior), `tests/unit-u-shell-9b-*` (multi-document mount set), `tests/unit-u-shell-shell-wiring*.test.ts`, `tests/sidebar-panes-host.test.ts`, `tests/unit-k-sidebar-panes-host*`-derived suites, `tests/renderer-backend.test.ts`, `tests/unit-u-shell-6-hover-affordance.test.ts` (doc-nav row affordance), `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts`. `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` stay green unchanged. |
| **Migration / compat** | No IPC/store change. **New compat case**: a capped/contained doc-nav must still render the SAME graph for a large corpus, so a `content-visibility`-based bound must not alter the rendered markdown (`get_markdown`) — a D-visual win that silently truncates `get_rendered_html` is a fail. |
| **MCP contract** | Direct: the doc-nav is an app-graph pane. Explicit accept criterion: the MCP row count for the doc-nav equals the store's document count after bounding. |
| **LIVE row** | **M/E** — re-pin **U-1** (doc open < budget, with `realInput:true`) and add the doc-nav scroll-usability + painted-geometry assertion as an **extended** row (the §5.U cap is full); reuse `uf_layout_10`'s painted-box oracle style (`user-flow-audit.md` §2 U-5) — a computed-style-only probe is `proxyPASS:true` = FAIL. |
| **Cost / benefit** | Medium-high cost, high benefit: it is the second half of the freeze (a 12 700 px stage per document) and the only unit that touches the assembly seam that LIVE-UF6/N2 came from. **Lands last, behind the §6 rollback demands.** |

### Cross-unit notes (all now-spec units)

- **The 4 746-test pin set.** 4 746 pass / 58 skip / 0 fail is the count at the
  `PLACEMENT-ONLY-PAYLOAD-ROOT` fix (`docs/next-steps.md`). Re-derivation is
  expected to be *largest for O-9* (the collapse contract flips), *largest in
  blast-radius for O-1* (the reconcile/wiring censuses), *most compat-sensitive for
  O-10* (the persisted-layout authority), and *most assembly-sensitive for O-2*.
  Each unit's DONE row must record its own red set and its own re-derived suite
  list — a unit that reports "the suite is green" without naming the re-derived
  pins repeats the RCA-6 drift finding.
- **No unit may touch `src/main/rag-store.ts`'s interface**, `src/main/traversal.ts`,
  or `src/main/mcp-server.ts`'s `rag`/`edit` handler shapes. If a unit needs to,
  it is a different proposal and re-enters this gate (validity A7).
- **`RagSnapshotPayload` `revision` + the stale-drop rule** is an *additive field
  on the parked seam*, not a now-spec unit: today's `IPC_RAG_SNAPSHOT` handler
  (`src/main/main.ts:751-755`) returns a synchronous whole-store read and `reDerive`
  pulls it through the single-writer queue, so a snapshot older than the last
  committed one cannot currently be observed. The rule is cheap
  insurance and should be written into the parked spec, **not** landed as a unit
  now (it has no failing behavior and no user-visible end state — RCA-1).

---

## 4. GAPS + COSTS / BENEFITS

| Gap | Project-specific vs engine-handoff | Status after the split |
| --- | --- | --- |
| Renderer re-derivation is not scoped (`'content'` path) | Project-specific (the load-bearing fix) | **O-1** (highest risk, guarded) |
| Document open mounts a full stage; doc-nav is unbounded | Project-specific | **O-2** |
| Pane gestures are a full re-assembly | Project-specific | **O-9** (cheapest lever) |
| Zone slots are not authoritative from the layout | Project-specific | **O-10** (O-1's prerequisite) |
| Layout geometry is JS-owned | Project-specific | **O-3**, folded into O-9 |
| No per-stage measurement / no budget | Project-specific | **O-0** (precondition) + **O-5** (harness) |
| Traversal walk may be load-bearing off-thread | Project-specific (a shell worker) — **and a Gnosis route is the alternative** | **O-4, CONDITIONAL on O-0.** As a worker it is a shell change; as an engine route it is a Gnosis-repo change. Do not schedule before O-0. |
| Query path onto the engine (envelope + `mode`/`topK`) | **Gnosis-repo handoff** (3 open engine defects) | **O-6 — PARKED** |
| Bulk ingestion / markdown parse / durability / cap / progress contract | **Gnosis-repo handoff + a shell contract re-derivation** | **O-7 — PARKED** |
| Engine-owned store: single-writer move, offline/dual-path, **authority switch** | **Gnosis-repo handoff** (O-8 is the parked track's PREREQUISITE, not a tail unit) | **O-8 — PARKED** |
| Store-change notification / adjacency reads over the wire (A12) | Gnosis-repo handoff | Closed *for the now-spec track* by the additive `revision` + stale-drop rule (parked spec); still open for a genuinely remote store. |

**Costs accepted by this verdict**

1. **A measurement pass before any fix** (O-0 + O-5). This is schedule cost with
   no user-visible payoff — and it is exactly what the critique demanded and what
   RCA-11/RCA-12 exist to enforce. Non-negotiable.
2. **A large re-derivation of the pin set**, concentrated in O-1 and O-9. The
   4 746-test suite is a real asset here, not an obstacle: the units that *cannot*
   re-derive safely (`import-render-no-duplicates`, `traversal`) are the fence.
3. **Two units (O-1, O-2) on the repo's most defect-prone path.** Mitigated by
   landing them last, after the cheap units bank wins, and behind the §6 demands.
4. **The architecture's `RagStore`-stays-synchronous ruling is adopted as final**
   for this track. The async question is parked with a named precondition. This
   deliberately declines a change that would touch the traversal, the MCP `rag`/`edit`
   handlers and the whole pin set for a derivation that is genuinely local.

**Benefits**

1. The **user's actual symptom** (a ~1 011 ms unresponsive document open; a 505 ms
   folder disclosure; a 2 556-mutation collapse) is attacked directly, on the
   renderer, at the measured layer.
2. The **offload remains a live architectural destination** — parked with external
   trigger conditions, an engine-repo handoff shape, and O-8's authority-switch as
   its prerequisite — so the original incentive is *deferred, not abandoned*.
3. **`LAYOUT-IN-CSS` + layout-containment** remove a class of geometry bugs and a
   JS-owned-layout invariant violation the user explicitly asked to be fixed.
4. The split **converts an unmeasurable architecture claim into four live-verifiable
   behavior units + one measurement gate**, which is the only shape this repo's
   gate battery can actually accept.

**Does a better solution exist?** Than the *original* proposal: yes — this is it
(scope the render path; measure first; park the engine move). Than the *split as
recorded*: one improvement, and it is the strongest single finding of this review.
The `'content'` path does **not only** re-traverse and recompile: it first pulls the
**whole store across IPC** (`bridge.rag.snapshot()` →
`IPC_RAG_SNAPSHOT` → `runtime.getDefaultStore().listNodes()`/`listEdges()`,
`src/renderer/sidebar-panes.ts:1995` → `src/main/main.ts:751-755`) plus the doc-heads
payload, and *then* builds the full traversal envelope — for a **folder disclosure**,
which is client-side presentation state and needs no store read at all. The proposal's
causal statement (validity-amended) still names only traversal/compile/emit/reconcile.
**O-0 must therefore also separate the snapshot-pull + serialization cost**, and a
cheap non-engine variant may exist that the split does not yet contain: *a doc-nav
disclosure that performs no store read at all*. That variant would make O-1 and O-2
substantially cheaper — but it must be *measured*, not asserted, which is precisely
what O-0 is for. Record it as an O-0 output feeding an O-1 spec amendment, not as a
new unit.

---

## 5. SPEC-GATE READINESS CHECKLIST

Nothing may be delegated to a TestWriter until every item is satisfied. Items
marked **[MISSING]** are absent from the proposal as amended.

| # | Prerequisite | Status |
| --- | --- | --- |
| 1 | **O-0's committed artifact** — the per-stage breakdown + the GPU control + the track ablation, recorded in a committed file with the run command, at operator corpus size, **plus the snapshot-pull/serialization stage** (A-4) | **[MISSING]** — O-0 is an intention, not an artifact. HARD PRECONDITION. |
| 2 | **O-5's harness + pinned thresholds** — the budget number derived *from* O-0, with the harness's own node contract (report schema + `reconcileMatrixRows` + a can-fail proof) | **[MISSING]** — "the number is pinned after O-0" is not a pin; the node contract is unnamed. |
| 3 | **The per-unit layer declaration** (envelope vs assembled) written into each *unit spec*, not only the umbrella §5 table | **PARTLY** — the proposal's table names "assembled layer" for O-1/O-2; O-9/O-10's layer and every unit's RCA-12 statement are unwritten. |
| 4 | **The per-unit falsifiable, user-visible end state** (D-class + oracle + `realInput` proof), mapped to a §5.U matrix slot or an extended row (cap is full) | **[MISSING]** — §5's acceptance rows are prose ("doc open < budget"), not falsifiable oracles; no row/slot mapping exists. |
| 5 | **The R2 invariant text** — verbatim from §3.3, with the root-scoped rule *and* its 5 node assertions, plus the "re-derive every root" fallback (structural / non-empty `edgeIds` / absent descriptor) | **PRESENT in the proposal (§3.3)** — but it must be copied into the unit specs (O-1/O-2) as the accept criterion, not left only in the umbrella. |
| 6 | **The supersession rows written into `docs/decisions.md`**: `CONTENT-EDIT-RE-TRAVERSAL` → SUPERSEDED (narrowed); `RAG-AUTHORITATIVE`, `MULTI-PARENT-DUPLICATE`, `UI-CONFIG-CARRIER` → AMENDED; **NEW `SNAPSHOT-REVISION-AUTHORITY`**; `SINGLE-WRITER-STORE` amendment confined to the parked track; and the `HEAVY-OPS-FREEZE-THE-PAGE`/`PANE-TOGGLE-FULL-REASSEMBLY`/`PANE-SLOT-INSTABILITY` status transitions in `docs/defects.md` | **[MISSING]** — §3.3 lists them as *owed*; no row exists in `docs/decisions.md` yet (item 6's "a change that parks an item or lands a decision MUST update these trackers in the same pass"). |
| 7 | **The regression watchlist as per-unit accept criteria** — A13's rows (`PLACEMENT-ONLY-PAYLOAD-ROOT`/LIVE-UF6, `STALE-MOUNT-PUSHES-CANVAS`, LIVE-8 toolbar reconcile, AD-2026-09-14-1/-2, `MULTI-PARENT-DUPLICATE`) attached to the unit they can regress | **PARTLY** — §5 lists them; they are not yet attached to units as accept criteria. |
| 8 | **The two architecture additions as acceptance rows**: (a) the snapshot `revision` stale-drop rule; (b) the **layout-containment** row (`contain: layout style paint` + a bounded pane body, asserted as painted geometry) | **[MISSING]** — named in §3.2 but not written as acceptance rows. |
| 9 | **The guardrails as spec text**: one re-derive per change batch (no second path to `reconcileDocumentRoots`/`Runtime`); `Runtime` gains exactly ONE new public entry point preserving the `prevStates` prune + the dual DOM+SSR emit; the single in-flow `#wiki-root` mount promoted from a fix to an **INVARIANT** (node test + live row on *every* pass) | **PRESENT as ruling text (§3.2)** — must be copied into the unit specs verbatim; none of it is a test yet. |
| 10 | **The unit re-scoping this verdict requires** (A-1..A-6 below) | **[MISSING]** — see §7. |
| 11 | **Landing order + rollback statements per unit** (single-diff revert), and O-10 strictly before O-1 | **PRESENT (§3.2)** — sound; keep. |

---

## 6. SCOPE / SEQUENCING RISK — O-1 and O-2

O-1 and O-2 touch the path that produced **LIVE-UF6** (duplicate editable
paragraphs / double materialization), the **slot instability** (`I-10`, and its
generalization to a doc-nav folder click) and the **stale-mount leak** (`N2`
`STALE-MOUNT-PUSHES-CANVAS`, `F-2` `WIKI-ROOT-MOUNT-LEAK` — fixed, with the
absolute count still partly harness-accumulated per `docs/next-steps.md`).
Ordering is not stylistic; it is the difference between a fix and a re-open.

**What specifically can regress**

1. **Duplication (LIVE-UF6 class).** The `'content'` path's scoped narrowing
   changes which roots enter `added`/`removed`/`replaced`
   (`src/renderer/runtime.ts:492-569`). `attachRoot` re-translates each payload
   root through the LIVE hub and re-places it via `targetPlacement` — the exact
   mechanism that produced the nested/sibling double materialization
   (`PLACEMENT-ONLY-PAYLOAD-ROOT`). A scoped pass that attaches a nested payload
   root with a placement anchor re-creates it.
2. **Slot re-sort (`I-10` class).** `pane-graph.ts:107-135` falls back to the
   registration `seq` when `entry?.order` is absent. Any new assembly path that
   re-derives with a layout whose `order` is missing re-sorts the zone — the
   defect O-1 would otherwise re-open. This is why **O-10 must land first**, and
   why O-10's missing/garbage-`order` fail-state is a hard accept criterion.
3. **Mount leak (`F-2`/`N2` class).** A scoped pass that mounts a stage payload
   without reconciling the OLD root re-introduces a second in-flow `#wiki-root`
   (h ≈ 11 589 px, pushing the canvas ~11 000 px down). O-2 is the unit at risk.
4. **Caret / dirty-edit / queued-rebuild loss.** `reDerive`'s caret-restore loop
   (`sidebar-panes.ts:2073-2113`) runs *after* the single final render; a second
   admission path or an extra emit destroys the selection (the documented
   CRITICAL #1 bug). A scoped emit must not become a second render.
5. **MCP invisibility (silent).** A scoped pass that narrows the *graph* rather
   than the *render* silently drops `list_targets`/`get_rendered_html` content.
   This is the failure mode no node test sees (RCA-12) and the one an agent
   relying on MCP would hit first.
6. **The toolbar reconcile allocation** (`LIVE-8`, the `EDITOR_TOOLBAR_ID` entry
   in the content-root allow-list) — a classifier change can evict it from
   `replaced`, re-breaking `toolbar_undo`.
7. **Landing-page coexistence** (`LIVE-4`, `stage-landing` reconciled rather than
   clobbered) — O-2's stage-only mount is the same seam.

**Order (non-negotiable)**

`O-0` → `O-5` → `O-9(+O-3)` → `O-10` → **`O-1`** → **`O-2`**, each a single-diff
revert, each its own red→green→adversarial→live→blind-greens→doc-review cycle
(RCA-1/RCA-2/RCA-3/RCA-6/RCA-11). **No unit lands before O-0's artifact and O-5's
budget row exist.** O-10 strictly before O-1. O-1 strictly before O-2.

**What the supervisor must demand BEFORE accepting O-1 or O-2**

1. **A recorded red set per unit**, run and reported before implementation
   (RCA-1). For O-1 the red set must include a *node* assertion of the root-scoped
   invariant (the 5 assertions in §3.3) — not only a live perf assertion.
2. **A live run on a real display with real hit-tested gestures** (`--connect`,
   `realInput:true`), with the long-task/mutation budget as the oracle and the
   **painted** geometry for any D-visual claim (`proxyPASS:false`). A
   scripted `.click()` alone is not evidence (`user-flow-audit.md` §3).
3. **A duplication census in the same pass**: `tests/import-render-no-duplicates.test.ts`
   green **unchanged**, plus a live duplicate-`[data-rag-node-id]` census equal to
   the pre-change number for the focused document.
4. **A single-in-flow `#wiki-root` census** (`=== 1`) before and after adding a
   pane and before/after a scoped content change (the N2 invariant).
5. **A slot census**: toggling a disclosure / opening a document changes no pane's
   slot index (the I-10 assertion), with the zone order printed.
6. **An MCP-visibility parity census**: post-change `provident.list_targets` /
   `get_rendered_html` / `get_markdown` contain the same targets/content as before
   (the RCA-12 layer the node trio cannot see).
7. **A rollback rehearsal**: the unit's diff reverts cleanly to a green trio + the
   previous live numbers (not merely "it is a small diff").
8. **The doc review (§10d/RCA-6) in the same pass**, reconciling the unit spec,
   its greens doc, the active trackers, and the re-derived pin list — including the
   `docs/defects.md` status transitions for the defects the unit closes.

An O-1 or O-2 that arrives without items 3/5/6 has not been verified at the layer
it changes, and must not be accepted (RCA-11/RCA-12).

---

## 7. THE AMENDMENTS (this verdict's conditions)

- **A-1 — O-0 is a PRECONDITION ARTIFACT, not a unit.** Delivered by the
  live-runner role, committed, with a pinned report shape and the RCA-12 layer
  statement. No TestWriter delegation for any other unit until it exists.
- **A-2 — O-5 is re-scoped** into (i) the live budget row + (ii) a **node**-tested
  harness contract (report schema + row-set reconciliation + a can-fail proof).
  It cannot be delegated before O-0.
- **A-3 — O-3 is FOLDED into O-9.** It has no red set and no user-visible end
  state; its acceptance ("no JS layout write after a resize") rides O-9's live row.
  The now-spec set is **O-1, O-2, O-5, O-9(+O-3), O-10** + the O-0 precondition.
- **A-4 — O-0 must measure the whole-store `IPC_RAG_SNAPSHOT` pull + serialization
  as a named stage**, and must rule in/out "a doc-nav disclosure that performs no
  store read at all" (the cheapest possible variant of O-1). This is the strongest
  single addition this review makes to the causal model.
- **A-5 — the `revision` field + stale-drop rule are PARKED-SPEC content, not a
  now-spec unit** (today's pull is serialized through the single-writer queue, so
  the rule has no failing behavior; RCA-1). They belong in the handoff spec for the
  engine-owned-store track.
- **A-6 — each unit's live assertion must be mapped to a §5.U matrix slot it is
  allowed to re-pin, or enter as an extended row.** The matrix is capped at 8 and
  full; a unit cannot claim a slot it does not have (`user-flow-audit.md` §2/§3).
- **A-7 — the guardrail set (§3.2) and the R2 invariant (§3.3) are copied verbatim
  into each unit spec as accept criteria**, and the single-in-flow `#wiki-root`
  invariant becomes a node test + a live row on *every* pass.
- **A-8 — O-1/O-2 are the only units allowed to touch the reconcile/assembly
  path**, they land last, and they carry the §6 eight demands.
- **A-9 — no unit may change the `RagStore` interface, `src/main/traversal.ts`, or
  the MCP `rag`/`edit` handler shapes.** A unit that needs to re-enters the proposal
  gate (validity A7).
- **A-10 — O-4 stays conditional on O-0** and is not sequenced; if O-0 shows the
  walk is load-bearing, O-4 is re-decided at that point (worker vs engine route).

---

## 8. PARKED-TRACK BOOKKEEPING (O-6 / O-7 / O-8)

The parked pieces must be re-findable and must not be re-litigated. Exactly this
must be written, in these places:

1. **`docs/pending.md` — three new DEFERRED rows** (one per unit, or one row with
   three sub-items), each with: the unit id; the state **PARKED — destination
   work, not incentive-driven**; the reason (each moves **no measured long task**;
   the measured freeze is renderer-side DOM style/layout/paint); the owning repo
   (**Gnosis**, handoff — never patched from here); and the **external revisit
   conditions** (copy the proposal §3.2 triggers verbatim): **(a)** a
   multi-user/remote-corpus requirement exists; **(b)** the operator corpus exceeds
   the local store ceiling — **the node-count threshold is pinned by O-0**; **(c)**
   O-0 shows the derivation **WALK** itself (not compile/emit/layout) exceeds the
   budget. Note explicitly: **O-8's authority-switch contract is the track's
   PREREQUISITE**, not a tail unit.
2. **`docs/HANDOFF.md` → `## OPEN handoff items` — three entries** (the existing
   handoff entries for `GNOSIS-ENGINE-QUERY-MODE-IGNORED` and
   `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` already cover O-6's blockers; add
   pointer rows for O-7/O-8). Each entry: what the engine must gain (**O-6** the
   POST-envelope fix + `mode`/`topK`; **O-7** a bulk markdown parse + batch-atomic
   ingest route + a progress/cancel/512-cap contract + **persistence** (the engine
   server persists NOTHING today) + the node-model mapping; **O-8** store-change
   notification/adjacency reads + the single-writer/authority-switch contract), the
   observed symptom, the repro, and the standing **"Do NOT patch the Gnosis repo
   from this project"** rule. Keep them OUT of the `provident-ssr` rows.
3. **`docs/decisions.md`** — the `SINGLE-WRITER-STORE` amendment is recorded as
   **confined to the parked engine track** (its "the main process owns all writes"
   clause is NOT amended for the now-spec work), plus a pointer that
   `SOURCE-SWITCHABLE`'s `createRemoteRagStore` anticipation remains **unfulfilled
   and parked**, with **A4's choice (async read surface vs an engine-materialized
   projection) recorded as an OPEN prerequisite decision** — named, not silently
   deferred.
4. **`docs/defects.md`** — the three engine rows
   (`HOST-ENGINE-QUERY-POST-NO-ENVELOPE`, `GNOSIS-ENGINE-QUERY-MODE-IGNORED`,
   `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`) gain a cross-reference to the parked
   O-6 track ("blocked on the parked engine-offload track; see `pending.md`"), and
   `ARCH-GNOSIS-OFFLOAD` moves from "OPEN (recorded)" to **"OPEN — SPLIT: the
   incentive-relevant half is scheduled (O-1/O-2/O-9/O-10/O-5 behind O-0); the
   engine-offload half is parked with the §3.2 triggers"** — with the change-analysis
   verdict path cited.
5. **`docs/next-steps.md`** — a CURRENT WORK entry: the verdict, the now-spec unit
   list and landing order as the queue, the O-0 precondition, and the parked-track
   pointer. A handover that repeats the old blanket "move document handling to
   Gnosis" framing is an item-3 staleness finding.
6. **`docs/specs/gnosis-offload-proposal.md`** — a §3.2 status line pointing at
   this verdict and at the parked tracker rows, so the proposal is not re-read as
   an active mandate.
7. **The MCP-contract delta record** (`docs/specs/mcp-endpoint.md`): an explicit
   note that **no MCP tool/group/param changes in this track**, that the
   `RagSnapshotPayload` `revision` is additive-and-parked, and that the O-1
   narrowing is bounded by the MCP-parity accept criterion — so a future agent
   reading the MCP contract knows the current shape is unchanged and *why*.

---

## 9. STATEMENT FOR THE USER (plain language)

What was approved is the part that actually fixes what you felt: the app will stop
rebuilding the entire document every time you click something. Concretely, opening
a document, expanding a folder in the documents list, collapsing a pane and
minimizing a zone will each do a small piece of work instead of a full rebuild, the
sidebar will get a bounded height with its own scrollbar instead of pushing the
whole page down 6 000 pixels, and the pane order will be fixed by the saved layout
so a pane can never jump position because its content changed — the same change
also hands the canvas geometry back to plain CSS so nothing in JavaScript touches
your window size. What was parked is the original idea of moving document handling
into the Gnosis engine: measuring the actual freeze showed the time is spent in the
browser laying out and painting the page, not in the document logic, so sending the
work to Gnosis would not have helped, and the engine also has no way yet to import
a folder of markdown or to remember anything across restarts. It is recorded as
future work with clear conditions for when it becomes worth doing (a remote or
shared corpus, a much bigger local library, or a measurement showing the document
walk itself is the cost). Before any of the fixes are built, one measuring pass must
run and be written down, and the whole thing still needs your go-ahead; after that
the next step is the spec gate, where each of the four changes gets its own written
contract and its own failing tests before a single line of the fix is written,
followed by a real-app check that the freeze is gone rather than a green test suite
that never touched the screen.

---

## 10. VERDICT (recap)

**PROCEED-WITH-AMENDMENTS.** Adopt the architecture review's Alt-C split with the
seven amendments in §7 (A-1..A-10, most importantly: O-0 as a precondition artifact,
O-3 folded into O-9, and O-0 additionally measuring the whole-store snapshot pull).
The now-spec work is **five units + one precondition** — O-1, O-2, O-5, O-9(+O-3),
O-10 — landing **O-0 → O-5 → O-9 → O-10 → O-1 → O-2**, each its own
red→green→adversarial→live→blind-greens→doc-review cycle. O-6/O-7/O-8 are parked
with the §8 bookkeeping. Only this passing review **plus the user's go-ahead** may
proceed to the spec gate.
