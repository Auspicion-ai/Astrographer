# Handover — Astrographer UI Overhaul (Wave 2)

**Date:** 2026-09-13 · **Last commit:** `8c67100 "Additional shell UI overhaul"`
(+ uncommitted U-SHELL-9b hardening H4/H5/H6 in `src/renderer/cross-document-shared.ts`
+ its tests). · **Tree:** dirty (the U-SHELL-9b hardening is not yet committed).

**Baseline (verified this pass):** `npm test` → **185 files / 4327 pass + 58 skip**;
`npm run typecheck` → 0; `npm run build` → OK.

**Objective:** implement the document-only UI-overhaul spec
(`docs/specs/ui-overhaul.md`, C1–C20) as gated, per-unit TDD waves (RCA-2).

---

## 1. Status at a glance

| Wave-2 unit | State | Notes |
| --- | --- | --- |
| U-SHELL-1 (layout/zones/C9) | ✅ GREEN | keystone; all gates |
| U-SHELL-3 (collapse C5) | ✅ GREEN | |
| U-SHELL-4 (drag/relocate + C11 + C12) | ✅ GREEN | |
| U-SHELL-5 (gutters C7) | ✅ GREEN | C7 shell pointer wiring deferred → W2-N7 |
| U-SHELL-8 (View-menu visibility C13) | ✅ GREEN | |
| U-SHELL-9a (tab strip + focus tool C14) | ✅ GREEN | |
| U-STATE-1e (N-root reconcile + fork identity) | ✅ GREEN | unblocks 9b |
| **U-SHELL-9b (multi-doc + C20 + Option-C)** | ✅ **GREEN / COMPLETE (H1–H7 FIXED)** | blind-greens 23/0/0; follow-ups W2-N15 + AF3-3/AF1-2 (§4) |
| U-EDIT-2 (undo/redo + history C16) | ⬜ not started | C16 ruled; needs the project-journal read seam |
| U-JR1 (host `provident.get_journal`) | ⬜ spec re-authored | thin read over `Supervisor.journalEntries()` |

**Wave 3 (not started):** U-IMPORT-1 (C17), U-SHELL-7 (settings modal C3).

---

## 2. What was done this session

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
  23/0/0). Remaining follow-ups: W2-N15 + AF3-3/AF1-2.
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
Remaining are follow-ups only (W2-N15; AF3-3/AF1-2).

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
| **W2-N7** | U-SHELL-4/5 | **MEDIUM — no shell `pointerdown/move/up` + rect wiring** (C4/C7 unreachable live) |
| W2-N8 | U-SHELL-8 | LOW — derived-mirror `state-slice` layer accumulation |
| W2-N9 | U-SHELL-8 | LOW — hot-added-pane regression unexercised |
| W2-N10 | U-SHELL-9a | LOW — non-document stage-mount live settle |
| W2-N11 | U-STATE-1e (1a-inherited) | LOW — circular `content`/`children` `RangeError` |
| W2-N12 | U-STATE-1e/9b | ~~MEDIUM — host identity apply ignores `documentId`~~ **FIXED (H3)** |
| W2-N13 | U-SHELL-9b | ~~HIGH — Option-C commit warn/fork unreachable~~ **FIXED (H1)** |
| W2-N14 | U-SHELL-9b | ~~HIGH — C20 never materialized~~ **FIXED (H2/H7)** |
| W2-N15 | U-SHELL-9b | MEDIUM — multi-doc operator/template re-derive loses the H3 scope (AF3-2) |

---

## 6. Pending units

- **U-EDIT-2** (`unit-u-edit-2-undo-redo-history.md`): read seam for the RAG
  **project journal** (`RagStore.journal(): JournalEntry[]`) before red; C16 ruled.
- **U-JR1** (`unit-ujr1-get-journal.md`): 6-seam host read over
  `Supervisor.journalEntries()`; no host sanitization; group `dispatch`.
- **Wave 3:** U-IMPORT-1 (C17, needs U-MENU-1 + the C14-lite import root),
  U-SHELL-7 (settings modal C3).

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

Reconciled against the actual build at `8c67100` + the uncommitted 9b hardening:
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
  state (**U-SHELL-9b GREEN** — H1–H7 FIXED + blind-greens 23/0/0; W2-N12/N13/N14
  FIXED; W2-N15 + AF3-3/AF1-2 OPEN).
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
