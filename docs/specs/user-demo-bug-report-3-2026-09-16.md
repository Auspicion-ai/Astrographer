# USER-DEMO BUG REPORT #3 — 2026-09-16 (7 further defects reproduced live)

**What this file is.** This is the third user-demo bug report, committed as a **document** so that every
citation of *"report #3"* resolves. It was first transmitted as the prose block **"USER-DEMO BUG REPORT #3
(2026-09-16) — 7 further defects reproduced live (all filed in `docs/defects.md`)"** inside
`docs/next-steps.md` §CURRENT WORK / handover-state; that block is **retained verbatim** as the historical
record of how the report arrived, and this file is the report's own address.

**Provenance.** The seven items were reproduced **live against the assembled, running app** (a real
user-demo session) and each one was filed as an OPEN row in `docs/defects.md` in the same pass. The shape
follows report #1 (`docs/specs/user-demo-bug-report-2026-09-15.md`, items I-1..I-10) and report #2
(`docs/specs/user-demo-bug-report-2-2026-09-15.md`, items B1..B7).

**Layer (RCA-12, mandatory declaration).** This file is a **dated observation record**: it is
**not APP-GREEN**, it is not a test, a coverage report or a status source, and **no clause of it is
evidence that the application behaves in any way today**. Each item's current state is read from its
owning `docs/defects.md` row, never from this file (the tracker is the sole status authority).

**Cited by.** The seven `docs/defects.md` rows whose titles carry the item ids —
`TOP-BAR-NOT-FIXED` (C1), `NAMEPLATE-NO-SIDE-MARGIN` (C2), `TABLE-CELLS-NOT-EDITABLE` (C3),
`FIND-IN-PAGE-NOT-WIRED` (C4), `DOC-NAV-NOT-A-TREE` (C5), `PANE-TOGGLE-FULL-REASSEMBLY` (C6),
`DOC-TITLE-NOT-EDITABLE` (C7) — plus the `docs/decisions.md` **`WHOLE-PAGE-EDITING`** row (source cell:
"user requirement 2026-09-16 (report #3 follow-up)") and
`docs/specs/session-feedback-doc-audit-2026-09-16.md` §4 (doc-record cells "(+ report #3 C1)"…"(report #3
C7)"). **Nine citing locations in total.**

---

## The seven items

### C1 — `TOP-BAR-NOT-FIXED` (high, HOST)

`#tab-strip` reads `position: static`, `z-index: auto`, box `[0, -1320, 2032, 36]` at the current scroll
offset, while the 14px document scrollbar belongs to the page (`body`/`html` `overflow: visible`, page
`scrollHeight` 46 851). The bar is in normal flow inside the scrolled page, so it **scrolls away** and the
scrollbar **paints over it**. Owning row: `docs/defects.md` `TOP-BAR-NOT-FIXED` (overlaps
`TABBAR-SCROLLS-AWAY`).

### C2 — `NAMEPLATE-NO-SIDE-MARGIN` (low, HOST)

The `.app-nameplate` box is `[4, -1320, 98, 36]` with computed `margin: 0px 8px 0px 4px` and
`#tab-strip` `padding-left: 0px`, so `gapFromWindowEdge = 4` — the nameplate hugs the window frame.
Owning row: `docs/defects.md` `NAMEPLATE-NO-SIDE-MARGIN`.

### C3 — `TABLE-CELLS-NOT-EDITABLE` (medium, HOST)

On a fresh `docs/defects` focused in the stage: **6 tables, 116 `td`/`th` cells, 0 with
`contenteditable`** (`editableInTable = 0`), while the `<p>` hosts are editable (`{P: 10}`). The cells
carry real RAG node ids (`docs/defects:th:1`…), but the editing-control splice never reaches them.
Owning row: `docs/defects.md` `TABLE-CELLS-NOT-EDITABLE`.

### C4 — `FIND-IN-PAGE-NOT-WIRED` (medium, HOST)

A real `Ctrl+F` reaches the page (the event log reads `["ctrl+f"]`) but there is **no find UI**:
`src/main/app-menu.ts` authors **only** a `File` menu (Import… / Import folder… / Quit) and a `View` menu
(Panes) — **no `Edit` menu, no `find` role, no `CmdOrCtrl+F` accelerator**, and nothing calls `findInPage`.
Owning row: `docs/defects.md` `FIND-IN-PAGE-NOT-WIRED`.

### C5 — `DOC-NAV-NOT-A-TREE` (medium, HOST)

The document navigator renders as **ONE flat `ul` / 63 `li`** with `list-style: disc`, a 40px bullet
indent, `[role=tree|treeitem]` = 0, `[aria-expanded]` = 0 and `[data-folder-path]` = 0; and the store's
`rag.list_documents` returns **63 docs with `path: []` (0 non-empty)** — so the folder branch can never
fire. The pane's source **does** author folders (nested `<ul data-folder-children>`); the **data** has no
path segments. Owning row: `docs/defects.md` `DOC-NAV-NOT-A-TREE`.

### C6 — `PANE-TOGGLE-FULL-REASSEMBLY` (high, HOST)

Clicking `#zone-minimize-left` produced **2 556 DOM mutations + 2 long tasks (465 ms, 52 ms)** and a
2.5–2.9 s gesture; a single `togglePaneCollapse('search')` produced the **same 2 556-mutation profile**.
The `Profiler` shows the JS is tiny (`translateNodeData` 13 ms / `renderTree` 8 ms), so the cost is the
**style/layout/paint of a full app-graph re-assembly** for what should be a single-element CSS state flip —
the user's framing ("should be a pure CSS change on a single element") is correct. This also explains the
C6→I-10 pane-slot instability. Owning row: `docs/defects.md` `PANE-TOGGLE-FULL-REASSEMBLY`.

### C7 — `DOC-TITLE-NOT-EDITABLE` (medium, HOST)

The `[data-doc-head]` H1 (`rag-docs/defects:section:1`) has **`contenteditable = null`**; the stage's
`[contenteditable]` census is **`{P: 10}`** with **0 editable `h1`/`h2`/`h3`** (`editableHs = 0`), and the
H2 `docs/defects:section:2` likewise carries no control. The editing-control splice is authored for
paragraph-like roots, so the document title and every section heading are excluded from the eligible set.
Owning row: `docs/defects.md` `DOC-TITLE-NOT-EDITABLE`.

---

## The lineage note (added by the documentation review, 2026-09-21)

Item **C4** (`FIND-IN-PAGE-NOT-WIRED`) is the only item of the seven that had **no verbatim text in the
prose block**: the block recorded that "there is no find UI and `app-menu.ts` authors ONLY `File` … + `View`
(Panes)", and the fuller reading above is transcribed from that row's own recorded reproduction cell in
`docs/defects.md`. The other six items are the block's own text, transcribed with the readings the citing
rows carry. No item was invented, added or re-scoped by the transcription: the item ids, severities and
subjects are exactly the seven the block and the seven tracker rows carry.

**This file was created by the item-10d documentation review** to resolve the catalog's conflict **X-2**
(*"report #3 is cited as a source by nine locations, but no standalone report-#3 file exists"*) by the
contract's fix **(a)** — *commit the report as a document* — recorded as decision row
**`DECIDED: REPORT-3-COMMITTED-AS-A-DOCUMENT`** in `docs/decisions.md`, with the defect row
`docs/defects.md` **`REPORT-3-DANGLING-CITATION`** carrying the fix record. **The register's rows on this
lineage remain frozen at `keep-advisory`** (they are `user-*`-provenance and/or on a lineage that touched a
dangling citation); this fix repairs the **address**, not a verdict, and it un-freezes nothing.
