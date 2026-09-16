# Handover — Astrographer UI Overhaul (Wave 2)

**Date:** 2026-09-14 (latest) · **Tree:** the last Wave-3 unit
(`docs/specs/unit-u-import-1-import-surface.md`, previously an untracked
spec-only draft) is now **GREEN / COMPLETE / CODE LANDED** — **WAVE 3 COMPLETE:
the UI-overhaul (C1–C20 wave decomposition) is ALL-LANDED** with U-IMPORT-1 (C17) +
U-SHELL-7 (C3). The Wave-2 batch (PBT backfill + U-JR1 + W2-N11 + U-SHELL-N7
shell-wiring), U-SHELL-7, and U-IMPORT-1 are all landed; the unit DONE rows are in
`docs/next-steps.md`.

**Baseline (recorded green state of the U-IMPORT-1 pass):**
`npm test` → **4613 pass + 58 skip**; `npm run typecheck` → 0;
`npm run build` → OK.

**Objective:** implement the document-only UI-overhaul spec
(`docs/specs/ui-overhaul.md`, C1–C20) as gated, per-unit TDD waves (RCA-2).

---

## CURRENT HANDOVER STATE (2026-09-13 — U-SHELL-N7 LANDED/COMPLETE)

> **Superseded (proofreader pass, 2026-09-13):** the U-SHELL-N7 host fix is now
> LANDED and CLOSED — the section below is the PRE-FIX handover record. See the
> updated `docs/specs/unit-u-shell-shell-wiring.md` (§3a/§3b: HOST-1..5 + ADV1..5),
> the `docs/next-steps.md` CURRENT WORK block, and this handover's §1/§5 rows
> (all now FIXED). `docs/defects.md` `HOST-SHELL-WIRING` → FIXED.

> **Later note (2026-09-15, user-flow-audit pass — doc review):** the U-SHELL-N7
> wiring was FURTHER superseded in one dimension. Defect **F-1
> PANE-BODY-GESTURE-SWALLOWED** (FIXED + LIVE-CONFIRMED, `docs/defects.md`) showed the
> `.pane-frame[data-pane-id]` frame-wide pane-drag surface (plus the immediate
> `setPointerCapture`) made every clickable row inside a pane body — and the pane
> header's own collapse toggle — inert to a real user. The delegated selector is now
> `'.gutter[data-zone], .pane-collapse-toggle'` with capture deferred past
> `PANE_DRAG_CAPTURE_THRESHOLD` (4px): see `docs/decisions.md`
> (PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE), `docs/specs/unit-u-shell-shell-wiring.md`
> §2 note 1, and `docs/specs/user-flow-audit-coverage-2026-09-15.md` §4 F-1. Any
> `.pane-frame[data-pane-id]` selector text below is the PRE-F-1 historical record.
> The current queue (F-2 first, then the uncovered drivable checklist rows) is the
> CURRENT WORK block in `docs/next-steps.md`; this handover file has no F-1/F-2/F-3
> rows yet, so it is provenance only for the audit pass.

**All Wave-2 OPEN items are RESOLVED/FIXED** (W2-N5/N7/N8/N9/N10/N11/N12/N13/
N14/N15) per `docs/specs/wave-2-open-decisions.md` §D status line. The last
uncommitted in-flight unit was **U-SHELL-N7** (`unit-u-shell-shell-wiring.md`,
W2-N7 — the shell pointer-wiring integration pass), now **LANDED/COMPLETE**: the
adversarial HOST-1..5 + re-audit ADV1..5 fixes shipped and the trio is green
(4527 pass / 58 skip). The detailed PRE-FIX handover record follows (the
superseded note above points to the post-fix records). Its gates were as follows.

**Adversarial review (RCA-3) — RUN, findings CONFIRMED REAL (2026-09-13):**
the wiring in `src/renderer/renderer.ts` `installShellPointers()` queries selectors
that match **NO authored DOM** — the core deliverable (C4/C7/C11/C12 reachable in
the live app) is **NOT met**, and the §2.8 source-string pin is a **false green**.
Verified in code: `paneSubtreeRoot` (src/renderer/pane-graph.ts) frame root props
are `{ id: \`pane-${def.id}\` }` with **no `data-pane-id`**; `index.html` authors only
`.layout .gutter` **CSS** (no `.gutter[data-zone]` element); `installShellPointers`
runs before `host.boot()`/each `rerenderAppGraph()` re-mounts the graph, so
boot-snapshot element listeners get orphaned. Findings to FIX (all host-side,
fix here, never package):
- **HOST-1 (HIGH):** dead selectors `.gutter[data-zone]` + `.pane-frame[data-pane-id]`.
- **HOST-2 (HIGH):** per-gesture `pointermove/up/cancel/dblclick` registered per
  `pointerdown` on the shared element, never removed → duplicate/spurious commits
  (a double-click → N `resetGutter` writes; a later gesture's stale handler re-commits
  an OLDER paneId).
- **HOST-3 (MEDIUM):** `isInteractiveControl(e.target)` inspects only the deepest
  node → a click on an interactive control's nested child (svg/span) is mis-routed
  as a drag start (F9 violation).
- **HOST-4 (MEDIUM):** a reveal-driven re-render re-mounts the graph mid-gesture,
  detaching the captured element (coupled with HOST-1's boot-snapshot wiring).
- **HOST-5 (LOW):** `toZoneBounds` coerces unknown `[data-zone]` to `'left'` → a
  malformed zone becomes a real drop target (fail-closed fix).

**Read-only PBT audit (2026-09-13):** all 8 register rows (P-IM-1/-2/-3, P-SM-1/-2,
P-TP-1/-2/-3) are **NOT over-strength** against the pinned helpers as driven. The
gaps are **generator-coverage**: P-IM-1 (out-of-rect points — the helper legitimately
returns a negative raw candidate), P-IM-2 (unknown-zone / non-object rect), P-SM-1
(degenerate/inverted rects), P-TP-1 (overlapping-rect FIRST-match — currently
unfalsifiable because the generator's zones are disjoint), P-TP-3 (random renumber
correctness on interleaved/out-of-range orders).

**Blind-greens (RCA-4) — RUN: `docs/specs/unit-u-shell-shell-wiring-greens.md` =
35 PASS / 0 FAIL / 4 NOT-TESTABLE** (F5/F9/F11 need a live captured element / real
pointerdown target / a boot; the pure-module + source-pin surface is fully green).
The blind-greens does NOT exercise the live DOM, so it does not catch HOST-1.

### THE FIX (unstarted — do this first)
A TDD red→green cycle for the HOST-1..5 fixes + the PBT negative generators:
1. **TestWriter RED** — extend `src/shared/dom-shim.ts` minimally (add `querySelectorAll`
   for the concrete subset, a mount tree, element `getBoundingClientRect()`,
   `setPointerCapture/releasePointerCapture` no-ops, and a synthetic pointer-event
   dispatch helper), then write `tests/unit-u-shell-shell-wiring-adversarial.test.ts`
   pinning HOST-1..5 (must fail red against the current broken wiring) + the PBT
   negative-generator strategies (they may be partly green-on-arrival — coverage
   closures are fine). Do NOT touch `src/renderer/*` or index.html logic.
2. **Implementer GREEN** — rework `installShellPointers` to the fix shape:
   - author the four `.gutter[data-zone][data-axis]` chrome elements;
   - add `data-pane-id: def.id` to the frame root props in `paneSubtreeRoot`;
   - **document-level DELEGATED** `pointerdown` listeners using
     `e.target.closest('.gutter[data-zone], .pane-frame[data-pane-id]')`, applied
     after the graph renders and re-attached across `loadEnvelope` re-mounts
     (fixes HOST-1 + HOST-4); **[SUPERSEDED 2026-09-15 — the delegated selector is
     now `'.gutter[data-zone], .pane-collapse-toggle'` (defect F-1; see the note at
     the top of this file)]**
   - register move/up/cancel/dblclick ONCE or tear down per gesture
     (`removeEventListener` / `{once:true}` / AbortController) routing through a
     module-level active-gesture record (HOST-2);
   - ancestor climb in `isInteractiveControl` (`closest('button,input,a,select,
     textarea,[on:click],[on-click],[data-handler],[on:pointerdown]')`) (HOST-3);
   - skip non-`LayoutZoneName` `data-zone` values (HOST-5).
3. Re-run the adversarial pass (RCA-3) + the blind-greens (RCA-4) on the fixed wiring.

### REMAINING GATES (after the fix)
Proofreader → documentation review (RCA-6: reconcile `unit-u-shell-shell-wiring.md`
**top status block is STALE — it still says "No src/ or tests/ change in this pass
(spec-only…)"**, contradicting its own §5.7/§2.8; add the adversarial + doc-review
records) → live-scenario (shell DOM wiring is not node/MCP-testable without a running
app — park as a pending battery per gate 6) → **trio re-confirm** → tracker gate
(`docs/next-steps.md` U-SHELL-N7 **DONE row** — currently ABSENT; `docs/HANDOVER.md`
W2-N7 **line 166 still lists it PENDING**; reconcile `docs/defects.md` to record the
HOST-1..5 host finding as FIXED) → commit the whole uncommitted green batch.

### SUBAGENT-DELEGATION RELIABILITY (READ FIRST)
The `role_test_writer` subagent **failed 4× with no output** when given the large
shell-wiring fix task (3× in background, 1× in foreground), while a trivial foreground
probe succeeded. Suspected flaky infra on heavy read+write+vitest runs. **Mitigation:**
run the TestWriter in **foreground (`run_in_background: false`) with a SMALLER, single
concern per delegation** (e.g. shim+HOST-1..2, then PBT generators, separately), and
verify the files actually landed (`git status`) rather than trusting a pass/fail. The
`role_adversarial_reviewer` and `role_blind_test_writer` delegations in this session
**succeeded** in background.

---

## Older handover content (committed through U-SHELL-9b hardening; U-JR1 + PBT + W2-N11/N15 + shell-wiring are the newer uncommitted batch)

## 1. Status at a glance

| Wave-2 unit | State | Notes |
| --- | --- | --- |
| U-SHELL-1 (layout/zones/C9) | ✅ GREEN | keystone; all gates |
| U-SHELL-3 (collapse C5) | ✅ GREEN | |
| U-SHELL-4 (drag/relocate + C11 + C12) | ✅ GREEN | |
| U-SHELL-5 (gutters C7) | ✅ GREEN | shell wiring delivered by **U-SHELL-N7** (below) |
| U-SHELL-8 (View-menu visibility C13) | ✅ GREEN | |
| U-SHELL-9a (tab strip + focus tool C14) | ✅ GREEN | |
| U-STATE-1e (N-root reconcile + fork identity) | ✅ GREEN | unblocks 9b |
| **U-SHELL-9b (multi-doc + C20 + Option-C)** | ✅ **GREEN / COMPLETE (H1–H7 FIXED)** | blind-greens 23/0/0; W2-N15 FIXED; follow-ups AF3-3/AF1-2 (§4) |
| U-EDIT-2 (undo/redo + history C16) | ✅ GREEN | project-journal seam (§2.5); committed in `49079b9` |
| U-JR1 (host `provident.get_journal`) | ✅ **GREEN / DONE** | thin read over `Supervisor.journalEntries()`; `read` group; unit 35 + blind-greens 22/22; battery-host `journalEntries` HOST fix; live battery PARKED (running-app surface) |
| PBT backfill (props-*.test.ts) | ✅ **GREEN / uncommitted** | §5.7 registers + property layers for the UI pure modules |
| **U-SHELL-N7 (shell pointer-wiring, W2-N7)** | ✅ **GREEN / COMPLETE (2026-09-13)** | `installShellPointers` delegated wiring LANDED, closing HOST-1..5 + ADV1..5; four `.gutter[data-zone][data-axis]` authored + frame `data-pane-id` (`pane-graph.ts`); dom-shim extended (getters + delegated pointer dispatch + closest/setRect/setPointerCapture); trio 4527/58; tests 30 + 14 + 5 = 49; spec §3a/§3b; `docs/defects.md` HOST-SHELL-WIRING → FIXED |
| **U-SHELL-7 (settings modal, C3)** | ✅ **GREEN / COMPLETE (2026-09-14)** | `modal-state.ts` (NEW — pure `createModalController` + `installSettingsModal`) + the `main()` call after `installShellPointers` + the `index.html` shell chrome (frame/scrim/body/toggle + `.is-closed{display:none}` + SH7-ADV1 `pointer-events:auto`); hosts `#panes`+`#operator-panes` (re-parent only — isolation preserved); tests 40 (red 37); blind-greens 31/0/2; live battery PARKED; decisions `MODAL-SETTINGS-REPARENT` + `MODAL-DEDICATED-SCRIM` ACTIVE; trio 4566/58; spec §3c |
| **U-IMPORT-1 (File → Import… FS/browse, C17)** | ✅ **GREEN / COMPLETE (2026-09-14)** | `import-directory.ts` (NEW — `MAX_IMPORT_FILES=512` + the pure TOTAL `expandImportDirectory`/`buildImportDialogOptions`/`resolveImportSelection`) + the win/linux `Import…`+`Import folder…` two-item File menu + `openImportFolder` seam (`app-menu.ts`) + the `main.ts` Import flow (→ `buildImportDialogOptions`/`['openDirectory']` → `resolveImportSelection` → `importMarkdownCorpus` with the default-store `corpusRoot` + `IPC_IMPORT_RESULT`/`IPC_RAG_STORE_CHANGED` broadcasts) + `IPC_IMPORT_RESULT`/`ImportResultPayload` (`types.ts`); tests 47 (red 43; +4 ADV pins); blind-greens 36/0/5; live battery PARKED; decisions `IMPORT-NO-SYMLINK-FOLLOW` + `IMPORT-FILE-COUNT-CAP` + `IMPORT-RESULT-BROADCAST` ACTIVE; trio 4613/58; spec §3c |

**Wave 3 COMPLETE (2026-09-14):** both Wave-3 units — **U-SHELL-7 (settings modal C3)** and **U-IMPORT-1 (File → Import… FS/browse C17)** — are GREEN / COMPLETE — the UI-overhaul (C1–C20 wave decomposition) is all-LANDED. No remaining Wave-3 item. The two live-scenario batteries stay PARKED artifacts (running-app + UI/OS-dialog driver surface), documented in their `...live-pending-battery.md` files.

---

## 2. What was done this session

- **U-EDIT-2 (C16 undo/redo + history sub-pane) LANDED (2026-09-13):** the
  project-journal host seam (§2.5: `IPC_RAG_JOURNAL`/`IPC_RAG_JOURNAL_OP` +
  `bridge.rag.journal`/`journalOp`), the app-graph Undo/Redo toolbar controls
  (disabled from the project-journal depths) and the `pane-history` sub-pane
  with click-to-undo-to-point. Doc-review:
  `archive/reviews/2026-09-13-unit-u-edit-2-doc-review.md`. Trio 187/4362.
- **9b doc finding closed:** `HOST/U1-ENG` (boolean attributes) is **RESOLVED
  upstream** (`BOOLEAN-ATTRS`, present in `provident-ssr@0.5.0`); it moved to the
  RESOLVED table in `docs/HANDOFF.md` + `docs/defects.md`. This is what lets
  U-EDIT-2 author `disabled: undoDepth <= 0` correctly.
- **U-SHELL-9b H3/W2-N12 FIXED (2026-09-13; see §4 item 1):** the per-document
  id namespace (ratified scheme: scope `props.id`, keep `data-rag-node-id`
  plain). Delegated TestWriter→Implementer cycle + my adversarial pass (AF3-1
  separator collision found + fixed). `tests/unit-u-shell-9b-h3-doc-namespace.test.ts`
  13/13.
- **U-SHELL-9b H1/W2-N13 FIXED (2026-09-13; see §4 item 2):** Option-C commit
  interception + confirmation strip/checklist + fork/mutate-all/cancel via the
  atomic `edit.batch`; adversarial AF1-1 (fork dropped the pending edit) fixed.
  `tests/unit-u-shell-9b-h1-optionc-interception.test.ts` 15/15.
- **U-SHELL-9b H2/W2-N14 + H7 FIXED (2026-09-13; see §4 item 3):** C20
  materialization (`buildOwnersMap` + the `decorateShared` seam) + the
  `toggleOwnersBox` bridge install. `tests/unit-u-shell-9b-h2-c20-materialization.test.ts`
  14/14.
- **U-SHELL-9b hardening H4/H5/H6 FIXED (2026-09-13; see §4 item 4):** a
  standalone red→green→adversarial→doc-review cycle on the pure
  `cross-document-shared.ts` module (dedupe, totality, fork validation). +8
  regression tests.
- **Trio after H1–H7: 185 files / 4327 pass + 58 skip, typecheck 0, build 0.**
  **U-SHELL-9b is GREEN** (blind-greens `docs/specs/unit-u-shell-9b-greens.md`
  23/0/0; then W2-N15 FIXED per §2.10). Remaining follow-ups: AF3-3/AF1-2 only.
- **Wave-2 spec resolution:** W2-Q1…Q17 all RESOLVED; the elaborated §E/§F in
  `wave-2-open-decisions.md`; the U-SHELL-9 split into **9a/9b**; new
  **U-STATE-1e** spec (label collision with the landed `1d` re-anchor resolved).
- **Package upgrade:** `provident-ssr@^0.5.0` (ships `Supervisor.journalEntries(opts?):
  JournalView` — sanitized `{index,kind,status}` + depths/windowing). Resolves
  `ENG-JOURNAL-ENTRY-READ-API`; upgrade verified clean.
- **Journal rulings:** `DECIDED: JOURNAL-READ-VIA-PACKAGE` (0.5.0 landed) +
  `DECIDED: C16-CONSUMES-PROJECT-JOURNAL` (the history sub-pane reads the RAG
  project journal, NOT the engine journal); **U-JR1 re-authored** as a thin
  renderer-routed read.
- **Wave-2 fixes:** W2-N1/N2/N3/N4/N6 (host boot/write-through, `ZoneLayout.size`
  application, operator-pane grid rule, pin-5 clamp, `is-empty` semantics) all
  FIXED with regression tests.
- **Seven units driven through the full gate** (red → green → trio → adversarial
  → fixes → blind-greens → doc-review), each with an archive record under
  `archive/reviews/2026-09-12-<unit>-doc-review.md`.

---

## 3. Implemented surfaces (key files)

- `src/renderer/layout-state.ts` — `LayoutState` + `coerceLayout`/`defaultLayout`/
  `deriveLayout` + `layoutCssVars`/`applyLayoutToRoot`; `LAYOUT_ZONE_MIN/MAX`.
- `src/renderer/pane-graph.ts` — multi-zone `zone:*` producers, per-zone
  placement, `is-empty`/`is-minimized`/`is-revealed`/`is-collapsed` mirrors, the
  C12 tab strip, the collapse control (`pane-collapse-<id>`), `searchContent`.
- `src/renderer/pane-drag.ts` — `movePane`/`legalZonesForScope`/
  `withinSnapThreshold`/`zoneOrientation`/`setZoneMinimized`/`createDragController`
  (+ `insertionIndexForPoint`).
- `src/renderer/pane-gutter.ts` — `createGutterController` + clamp helpers.
- `src/renderer/tab-state.ts` — the `TabState` model (pure).
- `src/renderer/tab-strip.ts` — `TabStrip` (focus/close/reorder/new/search).
- `src/renderer/content-reconcile.ts` — `reconcileContentRoots` (1a, unchanged) +
  **`reconcileDocumentRoots`** (N-root, `ScopedRoot` buckets, `identityReplaced`).
- `src/renderer/cross-document-shared.ts` — C20 + Option-C **planner** (see §4).
- `src/renderer/sidebar-panes.ts` — host wiring: layout boot/write-through,
  `togglePaneCollapse`, gutter seams, pane-visibility (`applyPersistedPaneVisibility`/
  `syncZoneMirrors`), `mountTab`/`getTabContext`, `mountTabs`/`applyDocumentSet`.
- `src/renderer/renderer.ts` — `installLayout`, `TabStrip` construction + boot.
- `src/main/operator-settings-store.ts` / `src/shared/types.ts` — additive
  `OperatorSettings` slices: `layout`, `tabs`, `enabledOperatorPanes`,
  `panesInitialized`.
- `src/main/mcp-server.ts` / `src/main/security.ts` — `provident.focus`
  (`dispatch` group).
- `src/renderer/index.html` — the grid tracks (CSS vars), gutters, tab strip.

---

## 4. U-SHELL-9b — GREEN / COMPLETE (H1–H7 FIXED)

Spec `docs/specs/unit-u-shell-9b-cross-document-shared.md`; §2.6/§2.6b/§2.6c
record the adversarial findings. All six integration fixes (H1–H7) landed
2026-09-13, each as its own red→green→trio→adversarial cycle (RCA-2), then the
RCA-4 **blind-greens** re-run by an independent agent:
`docs/specs/unit-u-shell-9b-greens.md` — **23 PASS / 0 FAIL / 0 NOT-TESTED**.
Remaining are the accepted AF3-3/AF1-2 follow-ups only (per-mount editing
context for a shared node).

1. **H3 first (id-namespace; W2-N12 — prerequisite): ✅ FIXED (2026-09-13, this
   session).** Per-document id namespace landed per spec §2.7
   (`scopeDocumentIds` scopes authored `props.id`, `data-rag-node-id` stays
   plain; `plainRagId` recovery; `applyDocumentSet` no longer cross-attributes
   siblings). `tests/unit-u-shell-9b-h3-doc-namespace.test.ts` 13/13. Adversarial
   separator hardening (AF3-1: `--` is legal in `sanitizeDocumentId`) fixed +
   regression-tested. **Residual W2-N15** (multi-doc `operator`/`template`
   re-derive does not re-scope) recorded. Doc-review:
   `archive/reviews/2026-09-13-unit-9b-h3-doc-review.md`.
2. **H1 (Option-C interception; W2-N13) — ✅ FIXED (2026-09-13, this session).**
   `interceptSharedCommit` wired into `textareaBlur` + `editorBlurCommit`; the
   provident-authored confirmation strip + >2-owner checklist
   (`sharedCommitStripContent`); `sharedCommitFork`/`sharedCommitMutateAll`/
   `sharedCommitCancel`/`sharedCommitToggleOwner` applied via the existing atomic
   `edit.batch` (`IPC_EDIT_BATCH`); F8 block / F7 rollback / F10b no-op handled.
   Spec §2.9. `tests/unit-u-shell-9b-h1-optionc-interception.test.ts` 15/15.
   Adversarial **AF1-1** (fork dropped the user's pending edit) found + fixed.
   Doc-review: `archive/reviews/2026-09-13-unit-9b-h1-doc-review.md`.
3. **H2 (C20 materialization; W2-N14) + H7 — ✅ FIXED (2026-09-13, this
   session).** `buildOwnersMap` + the ONE `SidebarPanes.decorateShared` seam
   (boot/refresh/mountTab/content-change/per-doc multi-mount) +
   `applySharedSubtreeDecoration(env, owners, collapsed)` + `toggleOwnersBox`
   registered on the bridge. Spec §2.8.
   `tests/unit-u-shell-9b-h2-c20-materialization.test.ts` 14/14. Doc-review:
   `archive/reviews/2026-09-13-unit-9b-h2-doc-review.md`.
4. **H4/H5/H6 (LOW/MED) — FIXED (2026-09-13, this session):** `ownersFor`
   de-dupes order-preserving (H5); `planFork` is total on malformed input /
   subtree / edge entries / `ownedNodeIds` / missing minters and rejects
   `root ∉ subtree` (H4); a fork must leave ≥1 original owner and non-owner
   migrate ids are ignored (H6). Regressions in the new "adversarial hardening"
   block of `tests/unit-u-shell-9b-cross-document-shared.test.ts` (37/37).
   **H7 FIXED in H2** — the owners-box toggle (`toggleOwnersBox`) is registered
   on the bridge in the H2 unit (spec §2.8). Doc-review:
   `archive/reviews/2026-09-13-unit-9b-hardening-doc-review.md`.

---

## 5. Open follow-ups (`docs/specs/wave-2-open-decisions.md` §D)

| ID | Unit | Sev |
| --- | --- | --- |
| W2-N5 | U-SHELL-3 | LOW — test-only `paneSubtreeRoot` 3-arg branch cleanup |
| **W2-N7** | U-SHELL-4/5 | ~~MEDIUM — no shell `pointerdown/move/up` + rect wiring~~ **FIXED (2026-09-13 — U-SHELL-N7 `installShellPointers` delegated wiring landed)** |
| W2-N8 | U-SHELL-8 | LOW — derived-mirror `state-slice` layer accumulation |
| W2-N9 | U-SHELL-8 | LOW — hot-added-pane regression unexercised |
| W2-N10 | U-SHELL-9a | LOW — non-document stage-mount live settle |
| W2-N11 | U-STATE-1e (1a-inherited) | LOW — circular `content`/`children` `RangeError` |
| W2-N12 | U-STATE-1e/9b | ~~MEDIUM — host identity apply ignores `documentId`~~ **FIXED (H3)** |
| W2-N13 | U-SHELL-9b | ~~HIGH — Option-C commit warn/fork unreachable~~ **FIXED (H1)** |
| W2-N14 | U-SHELL-9b | ~~HIGH — C20 never materialized~~ **FIXED (H2/H7)** |
| W2-N15 | U-SHELL-9b | ~~MEDIUM — multi-doc operator/template re-derive loses the H3 scope~~ **FIXED (§2.10)** |

---

## 6. Pending units

- **Wave 3 COMPLETE (2026-09-14):** **U-SHELL-7 (settings modal C3)** and **U-IMPORT-1 (File → Import… FS/browse C17)** are both GREEN / COMPLETE — the UI-overhaul (C1–C20 wave decomposition) is all-LANDED; no Wave-3 unit is pending. The U-SHELL-7 + U-IMPORT-1 live-scenario batteries stay PARKED artifacts (running-app + UI/DOM-driver / OS-dialog-driver surface), documented in
  `docs/specs/unit-u-shell-7-settings-modal-live-pending-battery.md` and
  `docs/specs/unit-u-import-1-import-surface-live-pending-battery.md`.
- Accept-from-9b: AF3-3/AF1-2 (per-mount editing context for a shared node).
- **U-JR1 is GREEN/DONE (2026-09-13)** — no longer pending; see §1 + the
  U-JR1 DONE row in `docs/next-steps.md`. Its live-scenario battery stays a
  PARKED artifact (running-app surface), documented in
  `docs/specs/unit-ujr1-get-journal-live-pending-battery.md`.

---

## 7. Process / commands

- Per unit: **TestWriter red** (run + report) → **Implementer green** (least code)
  → **trio** → **adversarial** (read-only; host findings fixed here + regression
  tests, package findings → `defects.md`/`HANDOFF.md`) → **blind-greens** →
  **doc-review** (`archive/reviews/…`). One unit per cycle (RCA-2).
- Trio: `npm test` · `npm run typecheck` · `npm run build`.
- **Never** commit unless asked; **never** patch `node_modules/provident-ssr/` or
  `../Preempt-Providence/` (path-confine agents to the repo).
- Delegated agents: path-confine to the repo (no `/tmp`, no parent `Projects/`).

---

## 8. Documentation-staleness review (this pass)

Reconciled against the actual build + the U-SHELL-N7/7/IMPORT-1 hardening:
- **2026-09-14 (U-IMPORT-1):** the previously untracked spec-only draft is now
  GREEN / COMPLETE / CODE LANDED — the status block + the §3c note updated
  (IMPORT-ADV-1..3 host-fixed, no package finding); `next-steps.md` gained the
  Unit U-IMPORT-1 DONE row (red 43 → green 47; 3 sanctioned re-pins; ADV-1..3 +
  4 pins; blind-greens 36/0/5; live battery PARKED; trio 4613/58; the three
  IMPORT-* decisions) + the CURRENT WORK lead + the Wave-3-COMPLETE status;
  `pending.md` gained the U-IMPORT-1 parked-live-battery row; `defects.md`
  correctly ABSENT (host findings only); `decisions.md` `IMPORT-NO-SYMLINK-FOLLOW`
  / `IMPORT-FILE-COUNT-CAP` / `IMPORT-RESULT-BROADCAST` ACTIVE + dated.
  Doc-review: `archive/reviews/2026-09-14-unit-u-import-1-import-surface-doc-review.md`.
  **WAVE 3 COMPLETE — the UI-overhaul is all-LANDED.**
- **2026-09-13 (U-JR1):** the U-JR1 spec §2.2/§5.7/§5.8 gained the battery-host
  "7th surface" notes (gate-6 HOST fix: `battery-host.ts` routes `journalEntries`,
  `RuntimeBackend` exported, auto-start main-only); the live-pending battery's §0.2
  `unknown method` finding is now **FIXED + regression-tested**; `next-steps.md`
  CURRENT WORK + line-69 record say **GREEN/DONE**, the baseline is **189/4421**,
  and the Unit U-JR1 DONE row is added. Doc-review:
  `archive/reviews/2026-09-13-unit-ujr1-doc-review.md`.
- **2026-09-13 (U-EDIT-2):** the spec §2.1/§2.5/§8 reconciled (project-journal
  seam pinned) + status LANDED. **`HOST/U1-ENG` closed upstream** (`BOOLEAN-ATTRS`,
  present in `provident-ssr@0.5.0`) — moved to RESOLVED in `docs/HANDOFF.md`,
  marked RESOLVED in `docs/defects.md`. Doc-review:
  `archive/reviews/2026-09-13-unit-u-edit-2-doc-review.md`.
- **2026-09-13 (W2-N15):** 9b spec §2.10 pins the multi-doc non-content
  re-derive scope fix; §2.6b AF3-2 → FIXED; `wave-2-open-decisions.md` §D
  W2-N15 → FIXED. Doc-review: `archive/reviews/2026-09-13-w2n15-doc-review.md`.
- **2026-09-13 (9b H1/H2):** the 9b spec §2.6 H1/H2/H7 rows are FIXED; new
  §2.6c (H1 adversarial) and §2.8/§2.9 host-seam pins; the §2.6 verdict now
  reads **9b GREEN** (blind-greens `docs/specs/unit-u-shell-9b-greens.md`
  23/0/0). `wave-2-open-decisions.md` §D W2-N13/N14 → FIXED; `next-steps.md`
  updated. Doc-reviews: `archive/reviews/2026-09-13-unit-9b-h1-doc-review.md` +
  `...-h2-doc-review.md`.
- **2026-09-13 (9b H3):** the 9b spec §2.6 H3 row is FIXED + a new §2.6b records
  the H3 adversarial findings (AF3-1 fixed; AF3-2 → W2-N15; AF3-3 accepted);
  §2.7 pins the namespace scheme. `wave-2-open-decisions.md` §D W2-N12 → FIXED +
  W2-N15 added; `next-steps.md` updated. No method/census drift beyond the
  intended new exports (`scopeDocumentIds`, `plainRagId`).
- **2026-09-13 (9b hardening):** the 9b spec §2.6 H4/H5/H6 rows are now FIXED
  with regression pointers and H7 re-scoped to H2; `next-steps.md`'s 9b
  paragraph carries the fix + the new suite count. No method/signature/census
  drift (the module's public surface is unchanged).
- `docs/next-steps.md`, `docs/specs/wave-2-open-decisions.md` §C/§D, the unit
  specs, `decisions.md`, `defects.md`, `HANDOFF.md`, `pending.md` were kept
  current per-unit by the doc-review gates; this handover records the final
  state (**U-SHELL-9b GREEN** — H1–H7 FIXED + blind-greens 23/0/0; W2-N12/N13/N14/N15
  all FIXED; AF3-3/AF1-2 OPEN).
- **Stale claims fixed earlier this session:** the U-STATE-1d/1e label collision;
  the "host-side journal mirror" narrative (superseded by 0.5.0 + C16 ruling);
  the U-SHELL-9 split pointers; `DECIDED: MCP-FOCUS-TOOL` §9.2 → §2.7 citation;
  W2-Q9 "optional" → required double-click reset; the §8/§2.7 AF-3/AF-4 and
  U-SHELL-3/4/5/8 "Open items" statuses; the U-SHELL-9a/9b/1e greens tallies.
- **Known residual staleness (owned by their units, not fixed here):** the
  "queued via the dirty-edit guard" wording in `unit-u-edit-1-*` F2 and
  `unit-u-shell-8-*` F4 (unverified — reconcile when their cycles reopen);
  pre-U-SHELL-1 `pane-graph.ts` line citations in `ui-overhaul.md` /
  `unit-ms5-*` / `unit-h8-*` (line drift only).
