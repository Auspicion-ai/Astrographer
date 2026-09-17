# SESSION FEEDBACK AUDIT — 2026-09-15/16: every user UI note → its documentation record

**Question answered:** for every UI/behaviour note the user raised during this session, is it
PERSISTED in the project documentation, and where? Verified by direct grep against the trackers
(not from memory). **Result: 100% persisted — one gap found and closed during this audit**
(the whole-page-editing requirement had a decision row but no defect row; now filed as
`WHOLE-PAGE-EDITING-REQUIREMENT`).

**Trackers checked:** `docs/defects.md` (defect/finding rows), `docs/decisions.md` (ACTIVE
decisions + requirements), `docs/next-steps.md` (CURRENT WORK / handover), the unit specs, and the
three live evidence artifacts (`docs/specs/user-flow-audit-coverage-2026-09-15.md`,
`docs/specs/user-demo-bug-report-2026-09-15.md`, `docs/specs/user-demo-bug-report-2-2026-09-15.md`,
`docs/specs/gnosis-enrichment-live-report-2026-09-15.md`).

---

## 1. Batch 1 — the checklist live run (the eight defects + three keep-rows)

| User note | Doc record | Status there |
| --- | --- | --- |
| New-tab button inert | `defects.md` **LIVE-UF1**; checklist UF-SHELL-3 / UF-TABS-2 / UF-DEFECT-1; `live-user-flow-scenarios.md` §1 | OPEN (re-confirmed live) |
| Pane drag inert | `defects.md` **LIVE-UF2** (RE-SCOPED: the original repro used an off-viewport header; a real in-viewport header drag DOES reorder) ; checklist UF-PANES-4 / UF-DEFECT-2; scenarios §2 CONTRADICTED note | **FIXED + LIVE-CONFIRMED** |
| History/undo/redo in the main canvas | `defects.md` **LIVE-UF5**; checklist UF-HIST-1 / UF-DEFECT-3 | OPEN |
| First paragraph merged with the header AND duplicated | `defects.md` **LIVE-UF6**; checklist UF-STAGE-2 / UF-DEFECT-4 | **FIXED + LIVE-CONFIRMED (2026-09-16)** |
| Zone resize has no reachable grip | `defects.md` **LIVE-UF7**; checklist UF-LAYOUT-5/6 / UF-DEFECT-5 | OPEN |
| No visible boundary between the side zone and the stage | `defects.md` **LIVE-UF8** (+ report #2 `ZONE-NO-BOUNDARY-ASYMMETRY`); checklist UF-LAYOUT-7 / UF-DEFECT-6 | OPEN |
| Search "Open in a tab" shows the doc, not the search view | `defects.md` **LIVE-UF9**; checklist UF-TABS-6 / UF-DEFECT-7 | OPEN |
| Collapsed-zone labels read horizontally | `defects.md` **LIVE-UF10**; checklist UF-PANES-7 / UF-DEFECT-8 | OPEN |
| Three reports that did NOT reproduce | checklist `UF-KEEP-1..3`; `live-user-flow-scenarios.md` scenarios 3/4/6 (PASS-not-reproduced) | retained as keep-rows |

## 2. Batch 2 — the first additional-issues list

| User note | Doc record | Status there |
| --- | --- | --- |
| Table formatting extends off the side of the page | `defects.md` **TABLE-OVERFLOWS-STAGE** (+ report #1 I-2) | OPEN |
| First paragraph merged with header formatting AND duplicated | `defects.md` **LIVE-UF6** (+ report #1 I-3) | **FIXED** |
| Lots of text duplication (test for duplicate elements/text strings) | `defects.md` **LIVE-UF6** (+ report #1 I-4); the owed duplicate-census live row is in report #1 §3 row 1 | **FIXED** (census row now exists in `tests/import-render-no-duplicates.test.ts` + the §6.1 report) |
| undo/redo/history + html/markdown toggle still in the main window (should be in panes) | `defects.md` **LIVE-UF5** + **HISTORY-NOT-DROPDOWN** + report #1 I-5 | OPEN |
| html/markdown toggle triggers textarea editing; textarea is pre-MVP and should be discarded; Markdown should show plain-text markdown | `defects.md` **EDIT-MODE-TEXTAREA-UI** (+ report #1 I-6, §3 row 5) | OPEN |
| Panes still can't be dragged | `defects.md` **PANE-DRAG-NO-COMMIT** (+ report #1 I-7) | OPEN |
| Sidebar panes still minimize into horizontal/left-to-right alignment | `defects.md` **LIVE-UF10** (+ report #1 I-8) | OPEN |
| Started without the Gnosis engine | `defects.md` **DEMO-ENGINE-START-GAP** (+ report #1 I-9: starting the engine + `--gnosis` gives `state: Ready`, verified live) | OPEN (ops) |

## 3. Batch 3 — the second additional-issues list (+ the mid-list addition)

| User note | Doc record | Status there |
| --- | --- | --- |
| Opening/closing advanced search moves the search pane's position | `defects.md` **PANE-SLOT-INSTABILITY-ON-DISCLOSURE** (+ report #1 I-10) | OPEN |
| Panes have a visible boundary but zones do not | `defects.md` **ZONE-NO-BOUNDARY-ASYMMETRY** (+ report #2 B1) | OPEN |
| Pane visibility settings still haven't saved | `defects.md` **SETTINGS-PERSIST-WRITE-SILENT** (+ report #2 B2: the persistence logic is verified CORRECT; the app was denied writes to its userData in this session — `EACCES`; owed hardening is to surface a failed persist) | OPEN |
| Left canvas edge overlapped by the left pane — needs margins | `defects.md` **STAGE-LEFT-EDGE-FLUSH** (+ report #2 B3) | OPEN |
| List bullets in the document pane take too much space | `defects.md` **LIST-INDENT-40PX** (+ report #2 B4) | OPEN |
| Panes fixed where placed, UI enforces no-overlap, internal scrollbox on overflow | `defects.md` **PANE-NO-PLACEMENT-OR-SCROLLBOX** (+ report #2 B5) | OPEN |
| History should be in a dropdown | `defects.md` **HISTORY-NOT-DROPDOWN** (+ report #2 B6) | OPEN |
| (observed) doc-nav returned from collapse with no list | report #2 B7 (new observation, needs a focused repro; likely the F-2 re-assembly path) | OPEN |
| Vector/graph enrichment with local ollama: embeddinggemma + gemma4:e4b-it-q8_0 | `live-testing.md` §1.2 (verified configuration) + `defects.md` **VECTOR-IMPORT-NO-BODY-VECTORS**, **GNOSIS-SIDEBAR-SEAM-MISSING**, **HOST-ENGINE-QUERY-POST-NO-ENVELOPE**, **GNOSIS-ENGINE-QUERY-MODE-IGNORED**, **GNOSIS-ENRICHMENT-SURFACE-ABSENT** + `HANDOFF.md` + `docs/specs/gnosis-enrichment-live-report-2026-09-15.md` | mixed (2 FIXED earlier; the rest OPEN/handoff) |
| App nameplate + description take too much screen real estate → name to the top bar, description to the landing page | **IMPLEMENTED**; decision `APP-BRANDING-IN-TOP-BAR`; row `LIVE-1` (re-scoped) + checklist UF-SHELL-4 (re-pinned) | DONE + live-verified |
| Delete and re-add the existing test documents (pre-rework parse suspicion) | `next-steps.md` "STORE RE-IMPORTED FROM CURRENT SOURCES"; `defects.md` LIVE-UF6 carries the fresh-data repro | DONE (verdict: the defects are NOT data artifacts) |

## 4. Batch 4 — the third additional-issues list

| User note | Doc record | Status there |
| --- | --- | --- |
| Scrollbar goes under the top-bar | `defects.md` **TOP-BAR-NOT-FIXED** (+ report #3 C1; overlaps TABBAR-SCROLLS-AWAY) | OPEN |
| "Astrographer" title has no margin to the side of the window | `defects.md` **NAMEPLATE-NO-SIDE-MARGIN** (report #3 C2) | OPEN |
| Tables are not contenteditable | `defects.md` **TABLE-CELLS-NOT-EDITABLE** (report #3 C3) | OPEN (absorbed by the whole-page-editing requirement) |
| Ctrl-f find doesn't work | `defects.md` **FIND-IN-PAGE-NOT-WIRED** (report #3 C4) | OPEN |
| Directories should look like trees, not nested bullet lists | `defects.md` **DOC-NAV-NOT-A-TREE** (report #3 C5, incl. the `path: []` data gap) | OPEN |
| Very long lag on button input; collapsing the sidebar spikes CPU; should be a pure CSS change on a single element | `defects.md` **PANE-TOGGLE-FULL-REASSEMBLY** (report #3 C6: 2 556 DOM mutations + 2 long tasks per gesture; the user's framing is recorded as the fix direction) | OPEN |
| Document title cannot be edited | `defects.md` **DOC-TITLE-NOT-EDITABLE** (report #3 C7) | OPEN (absorbed by the whole-page-editing requirement) |
| **Highest priority: stop the duplications**; end-to-end test = import from /specs with a 1-1 text match and no duplicate elements | `defects.md` **LIVE-UF6** (FIXED + the live 1-1 evidence); decision `PLACEMENT-ONLY-PAYLOAD-ROOT`; `next-steps.md` "HIGHEST-PRIORITY FIX LANDED"; test `tests/import-render-no-duplicates.test.ts` | **DONE + LIVE-VERIFIED** |
| The ENTIRE page should be editable as a single block (per-paragraph editing breaks cross-paragraph selection) | decision `WHOLE-PAGE-EDITING` + **`defects.md` WHOLE-PAGE-EDITING-REQUIREMENT** (filed during THIS audit — the gap) | OPEN (requirement recorded, not implemented) |

---

## 5. Audit method + the gap found

- Every row above was verified by grepping the tracker for the row id (a count of zero = not
  persisted). All 32 defect/finding ids resolve in `docs/defects.md`; every requirement that pins
  current behaviour has a `docs/decisions.md` row; every pass has a `docs/next-steps.md` CURRENT WORK
  entry; and the three live evidence artifacts exist with their observed values.
- **Gap found and closed:** the user's *whole-page single-block editing* requirement had a decision
  row (`WHOLE-PAGE-EDITING`, added in the duplication pass) but **no defect row** — an agent picking
  up the defect list alone would not have seen it. Filed as
  `WHOLE-PAGE-EDITING-REQUIREMENT` in `docs/defects.md`, cross-linked to
  `DOC-TITLE-NOT-EDITABLE` / `TABLE-CELLS-NOT-EDITABLE` / `EDIT-MODE-TEXTAREA-UI` (it absorbs all
  three) and to the decision row.
- **Overlap (intentional, cross-referenced, not duplication of record):** `TOP-BAR-NOT-FIXED` ⊂
  `TABBAR-SCROLLS-AWAY` (same root as `PANE-NO-PLACEMENT-OR-SCROLLBOX`); `HISTORY-NOT-DROPDOWN` ⊃
  `LIVE-UF5`; `ZONE-NO-BOUNDARY-ASYMMETRY` ⊃ `LIVE-UF8`; `PANE-DRAG-NO-COMMIT` ⊃ the residue of
  `LIVE-UF2`; the three editing rows ⊂ `WHOLE-PAGE-EDITING-REQUIREMENT`. Each pair points at the
  other, so no note is orphaned and no fix is double-counted.
- **Not UI, carried anyway:** the vector/enrichment configuration notes are recorded in
  `docs/live-testing.md` §1.2 + the gnosis defect/handoff rows (no separate UI row owed).
