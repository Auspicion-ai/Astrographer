# Wave 2 — Open Decisions & Blockers (accumulator)

Per the user directive (2026-09-12): while drafting the Wave-2 unit specs, any
**blocker or open design decision** is recorded here and **addressed after all
Wave-2 specs are drafted** (not inline). Each item has an ID (`W2-Qn`), the unit
that raised it, the question, options, and a proposed default.

Status legend: **OPEN** (needs a ruling) · **DEFERRED** (blocks a later wave) ·
**RESOLVED** (with the resolution) · **BLOCKER** (stops its unit until ruled).

Wave-2 units: U-SHELL-1 (keystone, zones/layout), U-SHELL-3 (collapse),
U-SHELL-4 (drag/relocate + C11 + C12), U-SHELL-5 (gutters), U-SHELL-8 (View-menu
visibility), U-SHELL-9 (main-focus tabs), U-EDIT-2 (undo/redo/history).

| # | Unit | Question / blocker | Resolution |
| --- | --- | --- | --- |
| **W2-Q1** | U-SHELL-1 / U-SHELL-3 | Collapse/minimize/size granularity: per-pane vs per-zone? | **RESOLVED — as proposed.** `collapsed` per-pane (C5); `minimized` + `size` per-zone (C12/C7). |
| **W2-Q2** | U-SHELL-1 | Are `stage`/`top-bar` pane zones (relocatable) or regions? | **RESOLVED — regions only.** Serialized geometry; never pane drop targets. |
| **W2-Q3** | U-SHELL-1 | Always-present `zone:*` nodes vs only non-empty zones? | **RESOLVED — as proposed.** Always-present, stable identity, derived `is-empty`. |
| **W2-Q4** | U-SHELL-1 | Default-placement source | **RESOLVED — (a)** additive `PaneDefinition.defaultZone?`/`defaultOrder?` (default to a scope-derived zone + registration order). |
| **W2-Q5** | U-SHELL-1 / U-SHELL-8 | Pane-additive assembly (no full `loadEnvelope` on a visibility toggle) | **RESOLVED — (a)** reuse the U-STATE-1 pane reconcile (detach = invisible to MCP). |
| **W2-Q6** | U-SHELL-4 | Drag mechanics | **RESOLVED — (a) NOW** (pointer-based shell handles, one managed write at drop); **(b) HTML5 DnD** recorded as a SPECULATIVE future change (`docs/pending.md`). |
| **W2-Q7** | U-SHELL-4 / U-SHELL-5 | C11 snap threshold + retained-size reset | **RESOLVED — as proposed.** Restore last size; one managed write per threshold-crossing. |
| **W2-Q8** | U-SHELL-4 | Minimized-zone drop target + expand + orientation | **RESOLVED — (a)** (stays a drop target; reveals/expands on nearby drag; edge-derived orientation). |
| **W2-Q9** | U-SHELL-5 | Gutter clamp defaults + double-click reset | **RESOLVED — as proposed; tightened at implementation.** Pinned min/max; the double-click reset is **REQUIRED for v1** (U-SHELL-5 §2.2/§2.5 pin 5 — the spec raised the proposed "optional" to required). |
| **W2-Q10** | U-SHELL-8 | View → Panes lists operator panes too? | **RESOLVED — as proposed.** List both scopes (grouped); operator toggles stay operator-scope. |
| **W2-Q11** | U-SHELL-9 | Tabbable kinds + new-tab default | **RESOLVED (user).** v1 tabbable set = **`document` + `search-results`**; `graph` + the template editor are **PARKED** (will land with G3 / the template work); **Gnosis docs are interpreted into the Astrographer document format** (provident and/or markdown) — NOT a distinct tabbable kind. **Only the first tab opens without a target:** default = previous session's most-recently-focused doc → else alphabetically first doc in the focused wiki → else the empty-wiki "Getting started" page; **all other tabs require a target** (document link, opening a graph, search result). Duplicate = focus existing (force-duplicate later). Close = left neighbour else right; the last tab falls back to the first-tab default page. Labels/persistence as proposed. **Include the MCP focus tool.** *(Spec: `unit-u-shell-9a-main-focus-tabs.md`.)* |
| **W2-Q12** | U-SHELL-9 | Strip dispatchable / MCP focus tool? | **RESOLVED (user):** the strip is **not** `provident.dispatch`-able; MCP tooling works with the **internal application code** (the shared focus-selection seam), per the clarified parity definition. |
| **W2-Q13** | U-SHELL-9 | C20 owners-box + Option-C warn source | **RESOLVED — (a)** owners from the `rag.backlinks` reverse map; app-graph box; provident confirmation strip (fork vs mutate-all). C20's live behavior is gated on Q17(a)'s N-root follow-on. *(Spec: `unit-u-shell-9b-cross-document-shared.md`.)* |
| **W2-Q14** | U-EDIT-2 | Journal introspection (no enumerable entries) | **RESOLVED — `provident-ssr@0.5.0` (2026-09-12).** The package now ships the sanitized reader **`Supervisor.journalEntries(opts?): JournalView`** (`{index,kind,status}` + depths/windowing); `ENG-JOURNAL-ENTRY-READ-API` is **RESOLVED upstream**. The host-side `provident.get_journal` (U-JR1) is **re-scoped** to a thin renderer-routed read over it (`DECIDED: JOURNAL-READ-VIA-PACKAGE`; spec to be re-authored). **U-EDIT-2 is unblocked on the read surface**; only the C16-consumption choice (engine `journalEntries()` vs the project journal) remains to be ruled (`docs/specs/unit-u-edit-2-undo-redo-history.md` §2.3). See §A. |
| **W2-Q15** | U-EDIT-2 | What counts as an undoable history entry | **RESOLVED — as proposed.** Mirror the engine condense semantics; label by op kind. |
| **W2-Q16** | U-SHELL-1 | `LayoutState` version migration + export policy | **RESOLVED — as proposed (all defaults).** `layout.version:1`; deep-sanitize + unknown fields ignored; version > known → fail-soft to defaults; no explicit migration now (additive via `sanitize`; future version-keyed migration policy documented); drop unknown pane ids; per-zone fail-soft; deep sanitize; apply clamps at load; **global** (one layout, not per-store); **NOT MCP-exported** (layout-preset export SPECULATIVE). |
| **W2-Q17** | U-SHELL-9 | N-root multi-document render + fork identity | **RESOLVED — (a).** Extend the reconciler to N document roots + identity replace (a U-STATE-1 follow-on unit) **before** U-SHELL-9; no single-active-only shortcut. See §B. *(Specs: `unit-u-state-1e-nroot-reconcile.md` — the follow-on; `unit-u-shell-9b-cross-document-shared.md` — the consumer.)* |

**New pending feature (user directive):** `.provident.dispatch` should cause **visible animations showing agent activity** during work while the UI is live — recorded in `docs/pending.md` SPECULATIVE (UI-only; the animation is shell, the activity signal can be a graph/host hook).

## A. W2-Q14 — journal introspection (BLOCKER)

**STATUS (2026-09-12, package landed): RESOLVED by `provident-ssr@0.5.0`.**
The package ships the sanitized reader **`Supervisor.journalEntries(opts?): JournalView`**
(`{index,kind,status}` + `fromIndex`/`totalEntries`/`truncated`/depths/`basePresent`/
`maxJournalLength?`; window `afterIndex?`/`limit?` clamped `[1,1000]`; JSON-safe).
`ENG-JOURNAL-ENTRY-READ-API` is **RESOLVED upstream**; the host-side
`provident.get_journal` (U-JR1) is **re-scoped** to a thin renderer-routed read
over it (no host sanitization / no mirror). **U-EDIT-2 is unblocked on the read
surface**; only the C16-consumption choice (engine `journalEntries()` vs the
project journal) remains (`docs/specs/unit-u-edit-2-undo-redo-history.md` §2.3).
The analysis below is retained for context.

**The problem.** `Runtime.journal(action)` (`src/renderer/runtime.ts:804`)
returns a `JournalResult` built from the engine's `UndoRedoReport`: `status`,
`scheduledDirtied`, `stackTopKind`, `redoTopKind`, `baseBoundary`
(`:821-830`). It exposes **no enumerable entry list and no numeric position**.
The C16 history sub-pane must (i) list entries and (ii) click-to-undo-to-point,
which requires knowing the distance from the current top to the target entry.

**The options:**

- **(a) Engine read API** — e.g. `Supervisor.journalEntries()` returning an
  ordered, labelled entry list (+ depth). Pro: authoritative, live. Con: a
  `provident-ssr` package change → per the project's core duty this is a
  **defect/requirement gap recorded in `docs/defects.md` + `docs/HANDOFF.md`**,
  never patched here; U-EDIT-2 blocks on the upstream handoff.
- **(b) Host-side mirrored action log (proposed default).** The host records one
  entry per journaled op it dispatches (label + monotonic depth), and
  click-to-undo-to-point issues N repeated `undo`s to the recorded depth. Pro:
  no package change; ships now. Con: the mirror must stay in lockstep with any
  engine-internal journal coalescing/condense (W2-Q15); it cannot reflect
  op-level entries the host did not dispatch (e.g. engine-internal layers).
- **(c) Probe via repeated undo/redo** — rejected (destructive/ambiguous).

**Proposed ruling (SUPERSEDED — see the STATUS note above):** **(b) now**, and
file the (a) engine read API as an upstream requirement in
`defects.md`/`HANDOFF.md` so a future version can replace the mirror.

## B. W2-Q17 — multi-document render vs the U-STATE-1 reconciler

**The problem.** C14 makes multiple document tabs render simultaneously, and
OB1 Option C makes a shared-node fork an **identity change** in the editing
document. U-STATE-1's landed reconciler (OB3) does **whole-document-root
replace v1** and was verified for a single current document at a time
(`scoped-load`; `sidebar-panes.ts:949-964` renders ONE document). N simultaneous
document roots + a post-fork identity replace is beyond the landed single-root
scope.

**The options:**

- **(a) Extend the reconciler to N document roots + identity replace before
  U-SHELL-9.** Pro: correct. Con: a U-STATE-1 follow-up unit (its own
  red→green→adversarial→greens cycle) precedes U-SHELL-9.
- **(b) Sequentially stage only the active tab** and treat inactive tabs as
  descriptors (content unmounted) — cheaper, but does **not** deliver
  simultaneous render or the live CROSS-DOCUMENT-SHARED case the C14 row
  promises.
- **(c) Defer multi-document to a follow-on** and ship single-active-tab C14
  v1 (open set/active/order serialized; one body mounted).

**Proposed ruling:** **(c) for the U-SHELL-9 unit, (a) as a named follow-on** —
ship the tab model + single-active render first (fully testable), and open a
U-STATE-1 follow-on for N-root reconcile + fork-identity before the C20
shared-subtree visualization goes live. Pin whether the C20 warn may ship
against single-active render (proposed: no — the warn requires ≥2 mounted
owners to be meaningful).

**Specs (2026-09-12):** the W2-Q17(a) N-root follow-on is `docs/specs/unit-u-state-1e-nroot-reconcile.md`; its consumer is `docs/specs/unit-u-shell-9b-cross-document-shared.md`.

## C. Resolution pass

**ALL W2-Q RESOLVED (2026-09-12).** First pass: Q1, Q2, Q3, Q7, Q9, Q10, Q12,
Q14, Q15, Q17. Second pass: Q4, Q5, Q6, Q8, Q13. Third pass: Q11, Q16. The §F
elaborations are retained for context. **Q14 was later re-ruled** (see §A):
the read now lands via **`provident-ssr@0.5.0`** (`Supervisor.journalEntries()`,
`DECIDED: JOURNAL-READ-VIA-PACKAGE`); the host tool is re-scoped to a thin read
over it, and **U-EDIT-2 is unblocked on the read surface** (C16-consumption
choice still pending).

## D. TDD blockers / new decisions (found while implementing)

(status: W2-N1/N2/N3/N4 RESOLVED/FIXED 2026-09-12; W2-N6 **RESOLVED** 2026-09-12; **W2-N5 (LOW) + W2-N7 (MEDIUM) + W2-N8/N9/N10/N11 (LOW) + W2-N12 (MEDIUM) + W2-N13/N14 (HIGH) OPEN** — see below)

| # | Unit | Blocker / decision | Status |
| --- | --- | --- | --- |
| **W2-N1** | U-SHELL-1 | **Host boot read + write-through** of `OperatorSettings.layout` (§2.5) was not in the U-SHELL-1 red set (node-level only). | **FIXED (2026-09-12)** — `SidebarPanes.layout` reads `OperatorSettings.layout` at boot/refresh/broadcast and passes it through both `assembleAppGraphEnvelope` call sites; `SidebarPanes.setLayout(layout)` is the write-through seam (→ `bridge.operatorSettings.set({ layout })`). Tests: `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`. |
| **W2-N2** | U-SHELL-1 | **Pin-5 reconciliation:** the pinned min-clamp conflicted with the red set (header/footer/topBar strips are 36–48 px); resolved to **finite-positive preserved / invalid → default**, with drag-time min/max owned by U-SHELL-5. Optional per-axis minimums to be pinned in U-SHELL-5. | RESOLVED (2026-09-12) |
| **W2-N3** | U-SHELL-1 / U-SHELL-5 | **`ZoneLayout.size` not yet applied to the shell grid** (`index.html` hardcoded tracks); §2.4 says geometry reads `size`. | **FIXED (2026-09-12)** — `layout-state.ts` gains `layoutCssVars`/`applyLayoutToRoot` (+`LayoutRoot`); `index.html` tracks read `var(--zone-*-size)`/`var(--stage-weight)`/`var(--top-bar-size)` with fallbacks; `renderer.ts installLayout()` applies the persisted layout. Tests: `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts`. |
| **W2-N4** | U-SHELL-1 / U-SHELL-3 | **Operator pane grid-area dead rule:** `.layout #operator-panes { grid-area: right }` (higher specificity) beat the later `#operator-panes { grid-column: 1/-1 }`, so the operator pane occupied `right`. | **FIXED (2026-09-12)** — removed the dead rule (C3: operator panes are modal-confined, never an app pane zone); the spanning rule wins. Tests: `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts`. |
| **W2-N5** | U-SHELL-3 | **Test-only `paneSubtreeRoot` 3-arg legacy branch:** the `collapsed === undefined` shape exists only for the pre-U-SHELL-3 tests. The ONE production caller (`assembleAppGraphEnvelope`) always passes an explicit boolean, so no production pane can miss the collapse control; the 3-arg form has 6 test call sites across 2 files (`tests/sidebar-panes.test.ts` 5 cases, `tests/template.test.ts` 1 case), of which 4 actually exercise the branch (the other 2 throw at the entry guards first). | **OPEN (LOW — cleanup unit recommended).** Remove the `collapsed === undefined` branch; update the 4 branch-exercising tests to pass an explicit `false`/`true` so the U-SHELL-3 frame shape is the only code path. Not a defect — the branch is documented as test-only in `unit-u-shell-3-collapsible-panes.md` §2.5/§2.6. |
| **W2-N6** | U-SHELL-1 / U-SHELL-4 | **`is-empty` semantics conflict (needs Architect reconciliation).** U-SHELL-4's reveal test expects `layout:{panes:[]}` + a spec pane → `left` is `is-empty`; U-SHELL-1's census test expects a registered pane absent from an explicit overlay to be **default-placed** (→ non-empty). The Implementer satisfied both by deriving `is-empty` from the **enabled-pane placement overlay**. **Risk:** a zone could read `is-empty` (track collapsed) while a fallback-placed pane renders in it. Also unpinned: whether `createDragController.drop` must additionally require the zone to be **currently revealed**. | **RESOLVED (2026-09-12).** The U-SHELL-4 adversarial pass ran and definitively resolved it: **`is-empty` ⇔ zero enabled+placed panes (post-overlay/fallback resolution)**, NOT zero overlay entries. Fixed in `pane-graph.ts` (H1 — `overlayCounts` deleted, mirror from `zonePanes[zone].length`) + `sidebar-panes.ts` (H2 — minimize count uses the same census); the provably-wrong test assertion amended with proof; pins added to U-SHELL-1 §2.3/§3 and U-SHELL-4 §2.5 pins 8/9. `drop` acceptance documented (pin 9). |
| **W2-N7** | U-SHELL-4 / U-SHELL-5 | **Shell pointer wiring is absent (integration gap).** The drag (`pane-drag.ts`) and gutter (`pane-gutter.ts`) controllers are pure modules + host seams, but there is **no DOM `pointerdown/move/up` (capture) + `getBoundingClientRect` listener wiring** in `renderer.ts` / `index.html`, so C4/C7 gestures are **unreachable in the live app** (the `.gutter` CSS is dead; `startGutter`/`startPaneDrag` have no caller). The U-SHELL-5 spec §2.1/§5 pins "pointer capture + rect math" as its census. | **OPEN (MEDIUM — Architect ruling).** Options: (a) add a **shell-wiring integration pass** (DOM listeners + rect math → the host seams; shell chrome, not provident graph — needs its own spec + TestWriter red), or (b) declare the pure-controller + host-seam split the deliberate boundary and record the DOM wiring as a separate shell-integration unit. Affects both U-SHELL-4 (drag) and U-SHELL-5 (gutter). **Re-verified OPEN in the U-SHELL-8 doc review (2026-09-12).** |
| **W2-N8** | U-SHELL-8 | **Zone-mirror `state-slice` writes are journaled, so repeated visibility toggles accumulate state layers on the `zone:*` nodes.** The V4/V5 fix (`SidebarPanes.syncZoneMirrors` — spec §2.6 pin 5) emits one managed `state-slice` (`runtime.applyCommand`) per changed zone per toggle; because the `state-slice` path routes through `clientAPI.apply` it is journaled/undoable, so a long toggle session grows the journal and an undo can revert a **derived** mirror independently of the pane change. Correctness is unaffected (V4/V5 PASS). Noted by the fixer. | **OPEN (LOW — hygiene follow-up).** Options: (a) mark the derived-mirror write non-journaled / non-condensed, (b) coalesce to one write per reconcile, or (c) accept it as an engine surface. Revisit if the accumulation is measurable or the engine exposes a layer/journal count to assert. |
| **W2-N9** | U-SHELL-8 | **H6 hot-added-pane regression not exercised.** §2.7 H6 pins that a pane registered **after boot** named in persisted `enabledPanes` defaults to **enabled** (persisted lists govern boot-present panes; a later registration uses the registry default). The unit file + blind set do not exercise it (it needs a post-boot registration / second boot against the same registry). | **OPEN (LOW — test-completeness).** Add a dedicated regression: boot, register a new pane after boot, confirm it is enabled even when a persisted `enabledPanes` omitted it. Revisit on the next U-SHELL-8-adjacent pass. |
| **W2-N10** | U-SHELL-9a | **Non-`document` stage mount not settled in the node harness (`search` / parked `graph`/`template` placeholder bodies).** The blind run observed that a non-`document` `mountTab` left the stage without a `zone:main`; HOST-1 subsequently made the mount node-testable for `document` + landing (spec §2.9 pin 6 + §2.10). The async search body (`mountSearchStage` → `rag.query`) and the parked graph/template placeholder bodies are only asserted at the model level. | **OPEN (LOW — live-battery settle).** Settle in the skipped live-runtime block / an app session: a search tab mounts its derived-results body, and a parked target renders its placeholder, both without a teardown. Revisit when the live battery runs. |
| **W2-N11** | U-STATE-1e | **Circular `content`/`children` shape throws `RangeError` (inherited from U-STATE-1a).** The pure reconciler's recursive `collectRagIds`/`shapeProjection` walks `children` with no visited-set or depth cap, so a circular (or pathologically deep) structure hits `RangeError: Maximum call stack size exceeded`. Not reachable from a well-formed traversal envelope; a hostile/malformed input could DoS the reconcile path. | **OPEN (LOW — hardening follow-up).** Add a visited-set guard or a depth cap to `collectRagIds` + `shapeProjection` (and the 1a originals), mirroring the Unit S `TOK-F1` / Unit U2 `ADR-4` stack-safety discipline, with a regression test. Revisit on the next U-STATE-1 hardening pass. Recorded in `unit-u-state-1e-nroot-reconcile.md` §9 (L2). |
| **W2-N12** | U-STATE-1e / U-SHELL-9b | **Host identity apply ignores `documentId` (`H3`).** `Runtime.applyContentReconcile`'s `destroyRoot` resolves a `cssId` GLOBALLY, so a multi-scope same-`cssId` identity replace (the same `rag-X` root in two simultaneously-mounted documents) would destroy the wrong document's node. The reconciler half is pinned (`identityReplaced` scoped by `(documentId, cssId)`) but the host cannot apply it per document until the per-document id-namespace/mount exists. | **OPEN (MEDIUM — U-SHELL-9b prerequisite).** The per-document id-namespace/mount is U-SHELL-9b's (spec §2.2/§8 item 2); 9b MUST land it before the C20/Option-C multi-document identity replace can be applied. Until then the live path is single-active/single-document. Recorded in `unit-u-state-1e-nroot-reconcile.md` §9 (H3). |
| **W2-N13** | U-SHELL-9b | **Option-C commit warn + fork/mutate-all is unreachable (adversarial H1).** `cross-document-shared.ts` has zero `src/` importers; the commit paths write directly with no `detectSharedCommit` intercept, no provident confirmation strip, no `planFork→applyBatch`/`planMutateAll` apply, no >2-owner checklist UI. | **OPEN (HIGH — required before 9b is done).** Needs a host commit seam + the provident fork/mutate-all strip + the owners checklist + the apply handler. |
| **W2-N14** | U-SHELL-9b | **C20 never materialized (adversarial H2).** `applySharedSubtreeDecoration`/`ownersBoxContent` have no `src/` callers; the shared-subtree class + the collapsible side owners box are never rendered into the graph. Also H7: `toggleOwnersBox` is uninstalled. | **OPEN (HIGH — required before 9b is done).** Decorate at assembly from the reverse map; register the toggle handler. |

**Additive-shape note (accepted precedent):** extending `OperatorSettings` with
`layout` and `tabs` will break any prior unit test that froze the exact field
set (`W1-N3` in `wave-1-open-decisions.md`). That is a sanctioned
additive-shape reconciliation, not a weakened test.

## E. Spec-level blockers found while drafting

1. **U-EDIT-2 / Q14 — journal-entry introspection** (engine read gap). **RESOLVED
   upstream in `provident-ssr@0.5.0`** (`Supervisor.journalEntries()`; see §A).
   The host-side `provident.get_journal` (U-JR1) is re-scoped to a thin read over
   it. **U-EDIT-2 is unblocked on the read surface**; only the C16-consumption
   choice remains before its red cycle.
2. **U-SHELL-9 / Q17 — N-root reconcile + fork identity** beyond U-STATE-1's
   landed single-root whole-root-replace v1. Needs a named U-STATE-1 follow-on
   before simultaneous multi-document render / C20 goes live.
3. **U-SHELL-8 / Q5 — pane-additive assembly** must be verified to avoid a full
   `loadEnvelope`/teardown on every visibility toggle (the C10 discipline).
   If the pane reconcile cannot attach/detach without a full assemble, the
   toggle may temporarily fall back to a full reload — an explicit, recorded
   asymmetry rather than a silent regression.

## F. Elaborations on the PENDING items

### E.1 / W2-Q4 — default-placement source

Each pane needs a default `zone` + `order` when no persisted `LayoutState`
overrides it.

- **(a) Additive `PaneDefinition` fields** (`defaultZone?`/`defaultOrder?`) —
  colocated with each pane; the registry type + every registrant gain two
  optional fields. Explicit header/footer/stage homes are expressible.
- **(b) A separate `DEFAULT_LAYOUT` map** (id → zone/order) in the layout
  module — no `PaneDefinition` change; but a second source that can drift from
  the registry.
- **(c) Scope-derived only** — app-graph → left, operator → modal; order =
  registration order. Zero new data, but header/footer/stage homes are
  inexpressible.

**Decision needed:** which mechanism, and whether operator panes participate
(they are modal-confined — §Q10/SG4 — so their "zone" may be moot). **Proposed:
(a), defaulting to a scope-derived zone + registration order.**

### E.2 / W2-Q5 — pane-additive assembly (visibility toggle without a reload)

Enabling/disabling a pane changes the app-graph envelope's pane payloads. The
C10 discipline forbids a teardown.

- **(a) Reuse the U-STATE-1 pane reconcile.** On a visibility change,
  re-assemble the pane-inclusive envelope and `applyContentReconcile` (panes are
  `pane-` content roots) → attach/detach only the changed pane roots. Consistent
  with C10; needs the runtime booted + the assembled envelope; handle the
  first-enable.
- **(b) Full `loadEnvelope` reload on each toggle** — simple, but violates C10
  (teardown) and loses graph-resident state.
- **(c) Keep panes mounted; toggle a visibility class** (`state-slice`) — cheapest,
  no attach/detach; but a "hidden" pane still exists in the graph, so
  `get_rendered_html`/`list_targets` would still see it — which conflicts with
  the C13 semantic that a hidden pane is removed from the MCP surface.

**Decision needed:** (a) vs (c), which pins the C13 "hidden" semantics
(detached/invisible-to-MCP vs mounted-but-CSS-hidden). **Proposed: (a)** (detach
= invisible), falling back to a recorded asymmetry if the reconcile cannot
attach/detach cleanly.

### E.3 / W2-Q6 — drag mechanics

- **(a) Pointer-based shell handles** (`pointerdown`/`pointermove`/`pointerup` +
  pointer capture; one managed layout write at drop). Full control; no drag-image
  quirks; the handle is shell chrome (Table C).
- **(b) HTML5 drag-and-drop** (`dragstart`/`dragover`/`drop` + `dataTransfer` +
  drag image). Native events; the pane node could author `on:dragstart`, but the
  mechanics remain DOM/shell; known finicky cross-platform.

**Decision needed:** pointer vs DnD; and whether the pane **handle** is a
provident node with `on:*` handlers (MCP-dispatchable) or pure shell chrome (per
the parity definition the shell handle need not be dispatchable). **Proposed:
(a) pointer-based shell handles; one managed write at drop; the handle is shell.**

### E.4 / W2-Q8 — minimized-zone drop / expand / orientation

- **(a) Minimized zones stay drop targets**; a nearby drag reveals/expands them
  (C11 proximity); orientation is derived from the zone edge (`left`/`right` →
  vertical tab list; `header`/`footer` → horizontal).
- **(b) Minimized zones are NOT drop targets** — the user must expand via the
  minimize toggle before dropping.

**Decision needed:** (a) vs (b), the expand affordance (auto-expand on hover vs
click), and the orientation derivation (confirm edge-based). **Proposed: (a).**

### E.5 / W2-Q11 — RESOLVED (tabbable kinds, new-tab, duplicate, close, labels, persistence, parity)

**RESOLVED (user 2026-09-12):** v1 tabbable set = **`document` + `search-results`**; `graph` + the template editor are **PARKED** (future work) but will be included; **Gnosis docs are interpreted into the Astrographer document format** (provident and/or markdown) — not a distinct kind; **only the first tab may open targetless** (default: previous session's most-recently-focused doc → else alphabetically first doc in the focused wiki → else the empty-wiki "Getting started" page); **all other tabs require a target**; duplicate = focus existing (force-duplicate later); close = left neighbour else right, last tab falls back to the first-tab default; labels/persistence as proposed; **the MCP focus tool is IN SCOPE** (reverses the earlier "no tool in v1" proposal). The candidate analysis below is retained for context only. **Spec:** the resolved tab strip + focus tool live in `docs/specs/unit-u-shell-9a-main-focus-tabs.md`; the shared-node/multi-document half is `docs/specs/unit-u-shell-9b-cross-document-shared.md`.

The top-bar tabs (C14) hold **main-focus targets**; the active target's body
renders in the central stage (C2). Open questions, broken out:

- **(a) Tabbable kinds — the closed focus-descriptor set.** Candidate set:
  - `document:<documentId>` — a RAG document (the primary case).
  - `graph:<view>` — a graph view. **Note:** the G3 graph inspectors are PARKED
    (post-MVP knowledge-graph tools) and Q17=(a) defers N-root multi-doc render
    to a U-STATE-1 follow-on, so a graph tab may not be renderable in v1.
  - `gnosis-doc:<wikiId>/<documentId>` — a Gnosis engine document (the A2 panes
    exist; a tab could host one).
  - `other:<kind>` — e.g. the template editor, search results, or a future
    content kind.
  - **Operator panes / settings are NOT tabbable** (they are modal-confined, C3)
    — exclude them.
  **Decision:** exactly which of `document`/`graph`/`gnosis-doc`/`other` are in
  v1. **Proposed:** `document` + `gnosis-doc` in v1; `graph`/`other` declared in
  the model but gated (graph on G3, other per future kind). **(SUPERSEDED — see RESOLVED block.)**
- **(b) New-tab default target.** (i) the active tab's document (a duplicate),
  (ii) the first document in doc-nav order, (iii) a chooser/new-tab page listing
  openable targets, (iv) the most-recently-focused document. **Proposed:**
  (iv) most-recent, else (ii) first document; a chooser is a later nicety.
- **(c) Duplicate policy.** Selecting a document already open → (i) focus the
  existing tab (no duplicate) or (ii) open a second tab. **Proposed:** (i)
  focus-existing (the common browser default); a "open in new tab" gesture can
  force (ii) later.
- **(d) Close policy.** Closing the active tab → activate the neighbour
  (left, else right). Closing the **last** tab → the stage shows an empty/placeholder
  state (never close the window). **Proposed:** left-then-right; placeholder.
- **(e) Labels.** Tab label = the document title (truncated) + a tooltip with
  the full title/id; a dirty marker if the tab has an unsaved edit. **Proposed:**
  title + truncation + tooltip; dirty marker via the edit controller's dirty set.
- **(f) Persistence.** Open set + active id + order serialize in the UI-config
  state (C9 `tabs` slice); unknown/stale document ids dropped on load.
  **Proposed:** yes.
- **(g) Parity (Q12).** The strip is shell chrome and NOT `provident.dispatch`-able
  (Q12); focus selection reaches the **internal application code** (the same
  seam a future MCP focus tool would call). **(SUPERSEDED — the MCP focus tool IS in scope.)**

**Resolved above (2026-09-12).**

### E.7 / W2-Q16 — RESOLVED (`LayoutState` version, migration, sanitize, scope, export)

**RESOLVED — as proposed (all defaults accepted, user 2026-09-12).** `layout.version:1`; best-effort deep-sanitize with unknown fields ignored; version strictly greater than known → fail-soft to defaults; no explicit migration now (additive via the store `sanitize`, future version-keyed migration policy documented); drop unknown pane ids; per-zone fail-soft; deep sanitize; apply Q9 clamps at load; **global** (one layout in `OperatorSettings`, not per-store); **NOT MCP-exported** (operator-scoped UI-config carve-out; a shareable layout preset is SPECULATIVE). The analysis below is retained for context.

The layout lives in the C9 serialized state (extend `OperatorSettings`). The
sub-questions:

- **(a) Version + forward-compat.** A `layout.version: 1`. On load: a
  **higher/unknown version** → (i) fail-soft to defaults, or (ii) best-effort
  read with unknown fields ignored. **Proposed:** (ii) best-effort deep-sanitize
  with unknown fields ignored; a `version` strictly greater than known →
  fail-soft to defaults (never crash a newer schema).
- **(b) Migration.** Additive fields are handled by the store's `sanitize`
  (missing → default) — **no explicit migration code**. A future breaking change
  gets a migration map keyed by `version`. **Proposed:** none now; document the
  policy.
- **(c) Unknown pane ids.** A persisted `panes[]` entry whose id is no longer in
  the `PaneRegistry` (a pane removed) → **drop** on load (keep known panes).
  **Proposed:** drop unknown.
- **(d) Unknown/malformed zones.** A zone key not in the known set, or a
  non-object zone value → default that zone. **Proposed:** per-zone fail-soft.
- **(e) Deep sanitize.** The store's `sanitize` must validate `layout` deeply
  (arrays are arrays, sizes are finite numbers, booleans are booleans), mirroring
  the existing fail-soft operator-settings discipline — a corrupt layout never
  crashes boot. **Proposed:** yes.
- **(f) Clamps.** Sizes clamped to the Q9 min/max at load. **Proposed:** yes.
- **(g) Per-store scope.** Multi-store: is the layout per-store or global? The
  layout is a UI concern independent of which RAG store is active. **Proposed:**
  **global** (one layout in `OperatorSettings`, not per-store).
- **(h) Export / sharing.** The layout is **operator-scoped UI-config, NOT
  MCP-exported** (the C9 carve-out; credentials never serialized). Exporting a
  layout as a shareable preset is a separate future feature. **Proposed:** not
  exported; a preset export is SPECULATIVE (record if wanted).

**Resolved above (2026-09-12).**
