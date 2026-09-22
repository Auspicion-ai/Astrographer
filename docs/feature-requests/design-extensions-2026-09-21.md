# USER FEEDBACK — Design extensions / clarifications (2026-09-21)

**Date:** 2026-09-21 · **Reporter:** product owner (user design input, delivered as
"Extensions/Clarifications to design") · **Status:** **OPEN — PROPOSAL GATE REQUIRED** (AGENTS.md
item 8 / Gate 1: validity ∥ critique → architecture review → change analysis → user go-ahead
BEFORE any spec or code) · **Target:** this repo, plus the upstream sets it touches
(`docs/feature-requests/provident-electron-shell-chrome-requests.md`,
`docs/feature-requests/gnosis-engine-feature-requests.md`, the Gnosis engine project).

**Companion docs:** `docs/requirement-catalog.md` (the ADVISORY catalog this input extends),
`docs/specs/requirement-catalog.md` (its contract), `docs/decisions.md` (the ACTIVE rows this
input may supersede), `docs/pending.md` (the parked engine track), `docs/next-steps.md` (the work
queue), `docs/specs/ui-overhaul.md` (the C1–C20 constraint table).

> **Why this file exists.** This input is a USER DESIGN PROPOSAL that changes the repo's contract
> in at least one load-bearing place (the Gnosis document-CRUD/persistence ownership — items
> `GN-1`…`GN-4`) and extends it in ~35 others. Per AGENTS.md item 8 it must not be implemented,
> specified, or catalogued as settled behavior until the three-agent gate has run and the user has
> given the go-ahead. This file is the **verbatim capture** of the input plus the **itemization**
> the gate works from.

---

## 1. Verbatim input (as received, 2026-09-21)

> **Extensions/Clarifications to design:**
>
> **Top-bar/Outer frame**
> Shell top - browser-style tab strip with app title/icon floated on left side and with
> minimize/maximize/close buttons on right and tabs left-aligned in middle. Title and unoccupied
> parts of the bar can be used for dragging window. Tabs can be rearranged with dragging. Later
> feature: new window by dragging tab out of frame. Top bar is fixed to top of shell
> Tagline is on landing page seen when opening without a wiki selected
>
> **Layout Zones:**
> All UI interactions should be built to be element-local, if possible, ex. zone resizing should be
> done by clicking-dragging on the gutter and triggering a relevant handler in the gutter,
> pane-dragging should work by clicking a handle region in the pane with an appropriate handler.
> Zones have explicit size controls.
> Header and footer are full-width, extending over sidebars.
> Sidebar top is at bottom of header, sidebar bottom is at top of footer.
> The stage has a margin from the bottom of the header toolbar, and takes up the space left between
> the left and right sidebar zones.
> The sidebars and stage are separately scrollable
>
> **Panes**
> File import and visibility menu should itself be a tool pane, defaulting to top-zone
> Panes need a vertical (in sidebar) or horizontal (in header/footer) drag-adjustable size
> controller at the bottom/left edge for layout control. Default height is half of the previous
> empty space or the size needed to present it without a scrollbar, whichever is less.
> When dragging a pane, other panes rearrange to show a ghost in its new drop spot and the new
> layout. Right-click abandons the drag and resets
> No effect other than a deliberate drag reposition, size adjustment, minimize, or visibility
> change should affect the pane location or size.
> Pane should be a generic container class that has these universal features implemented once, with
> specific panes (ex. document selector) providing name/contents
> Collapse/expand should be a pure 'hidden' toggle for pane body, without requiring any js-level
> recalculation of the body contents.
> Dropdown/expandable menus can overflow over main stage or from header/footer over sidebars, but
> only as long as they keep focus/mouseover (ex. showing results from search, selecting element
> types in a format pane).
>
> **Stage**
> Stage is a *single* contenteditable element that lets users type into it. In markdown formatting
> mode, this is plaintext editing for now - live markdown formatting is a later feature.
> Add pane for element type (ex heading, p, etc.) that alters the element containing the caret or
> selected text.
> Document name/heading element is visually divided from document text. Editing heading changes the
> document title on blur. User can move caret from heading to document text first-line and back with
> arrow keys
> On blur, diff with the provident-editable import tools to isolate and update only changed
> sub-elements of document.
> Throw user-visible warning on failure to commit.
> Textarea editing is obsolete and should be removed. Rich text is the default. Markdown format is
> still in rich-text contenteditable stage, but without html formatting and using monospace fonts
>
> **Tabs**
> A document that fails to commit (see above) displays warning symbol in tab
> Tabs containing document can listen for updates to their contained document. Tabs without
> uncommitted changes update immediately, tabs with uncommitted changes (the active tab during user
> edits, blurred tabs with commit failures) check if there is merge conflict (diffs include same
> element) and merge if not.
>
> **Doc-Nav**
> Document Pane needs to be able to listen to Gnosis and automatically update if new document is
> added to focused wiki.
> Document pane should not have to recalculate on collapse/expand (see panes rule)
>
> **Search**
> Search results appear in the pane, unless the search has been opened in a tab already, in which
> case it populates inside the tab stage
> In-pane results only show document name, other details only show in full tab search
> Search has an auto-complete, with a history tool favoring recent searches (future feature)
> Search can be set to a in-document-only mode
> ctl+f defaults to moving focus to search bar, in document-only-mode. Any highlighted text is
> copied into the bar
>
> **Files**
> Add export as future feature
> Add automatic re-export on commit as future feature
>
> **Gnosis**
> All document CRUD operations go through Gnosis, Astrographer does not persist documents other
> than the data owned by current tabs. All contradicting information is obsolete and should be
> pruned/archived.
> App always checks if a Gnosis instance is running and launches if it can't find an existing one.
> Warn user that wiki can't be opened if Gnosis is not found.
>
> **Engineering**
> Dominant cost of freezes is downstream of code but triggered off of unnecessary changes. Also,
> performance complaints like this are not requirements, architecture decisions made to resolve
> them are requirements.

---

## 2. Itemization (the gate's working set)

One id per discrete statement. `Kind` = **extension** (new behavior/clarification of an existing
one), **change** (alters an existing pinned behavior), or **process** (a rule about how the repo
treats feedback/cost). Every id is sourced to the verbatim block in §1; no id is inferred.

### 2.1 Top-bar / outer frame

| Id | Kind | Statement (restated, no status) | Source line |
| --- | --- | --- | --- |
| `TB-1` | extension | The shell top bar is a browser-style tab strip: app title/icon floated LEFT, minimize/maximize/close at RIGHT, tabs left-aligned in the MIDDLE. | Top-bar ¶1 |
| `TB-2` | extension | The title area and the bar's unoccupied regions are the window drag region. | Top-bar ¶1 |
| `TB-3` | extension | Tabs reorder by dragging within the strip. | Top-bar ¶1 |
| `TB-4` | extension (**later feature**) | Dragging a tab OUT of the frame opens a new window. | Top-bar ¶1 |
| `TB-5` | extension | The top bar is FIXED to the top of the shell. | Top-bar ¶1 |
| `TB-6` | extension | The app tagline renders on the LANDING page, shown when the app opens with no wiki selected. | Top-bar ¶2 |

### 2.2 Layout zones

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `LZ-1` | change (mechanism) | Every UI interaction is ELEMENT-LOCAL where possible: a zone resize is a click-drag on the gutter handled by a handler ON the gutter; a pane drag starts in a HANDLE REGION of the pane, handled by the pane's own handler. | Layout ¶1 |
| `LZ-2` | extension | Zones carry explicit size controls. | Layout ¶2 |
| `LZ-3` | extension | Header and footer are FULL-WIDTH, extending over the sidebars. | Layout ¶3 |
| `LZ-4` | extension | A sidebar's top edge sits at the header's bottom; its bottom edge at the footer's top. | Layout ¶4 |
| `LZ-5` | extension | The stage is inset by a margin below the header toolbar and occupies the remaining space between the left and right sidebar zones. | Layout ¶5 |
| `LZ-6` | extension | The sidebars and the stage scroll INDEPENDENTLY. | Layout ¶6 |

### 2.3 Panes

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `PN-1` | extension | The file-import and pane-visibility menu is ITSELF a tool pane, defaulting to the top zone. | Panes ¶1 |
| `PN-2` | extension | A pane has a drag-adjustable SIZE controller on its bottom edge (in a sidebar) or left edge (in header/footer); the default size is the LESSER of half the previous empty space and the size needed to present the pane without a scrollbar. | Panes ¶2 |
| `PN-3` | extension | Dragging a pane makes the other panes rearrange live, showing a GHOST at the prospective drop spot and the resulting layout. | Panes ¶3 |
| `PN-4` | extension | A right-click abandons a pane drag and resets it. | Panes ¶3 |
| `PN-5` | extension | NOTHING other than a deliberate drag reposition, a size adjustment, a minimize, or a visibility change may affect a pane's location or size. | Panes ¶4 |
| `PN-6` | change (structure) | A pane is a GENERIC CONTAINER CLASS carrying all the universal pane features once; a specific pane (e.g. the document selector) supplies only its name and contents. | Panes ¶5 |
| `PN-7` | change (mechanism) | Collapse/expand is a PURE `hidden` toggle on the pane body — no JS-level recalculation of the body contents. | Panes ¶6 |
| `PN-8` | extension | Dropdown/expandable menus may overflow over the main stage (or from header/footer over the sidebars) for as long as they keep focus/mouseover — e.g. search results, element-type selection in a format pane. | Panes ¶7 |

### 2.4 Stage

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `ST-1` | change | The stage is a SINGLE `contenteditable` element the user types into; in markdown mode it is plaintext editing for now (live markdown formatting is a LATER feature). | Stage ¶1 |
| `ST-2` | extension | A pane offers ELEMENT TYPE (heading, p, …) and applies it to the element containing the caret or to the selected text. | Stage ¶2 |
| `ST-3` | extension | The document name/heading element is VISUALLY DIVIDED from the document text; editing the heading commits the document title on blur; the caret moves heading → body first line and back with the arrow keys. | Stage ¶3 |
| `ST-4` | change (mechanism) | On blur, the stage DIFFS its content against the provident-editable import tools and updates ONLY the changed sub-elements. | Stage ¶4 |
| `ST-5` | extension | A failed commit raises a USER-VISIBLE warning. | Stage ¶5 |
| `ST-6` | change | Textarea editing is OBSOLETE and is REMOVED; rich text is the default; markdown mode remains the rich-text contenteditable stage, WITHOUT html formatting and in monospace. | Stage ¶6 |

### 2.5 Tabs

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `TAB-1` | extension | A document whose commit failed shows a WARNING SYMBOL in its tab. | Tabs ¶1 |
| `TAB-2` | extension | A tab listens for updates to its contained document: a tab with NO uncommitted changes updates immediately; a tab WITH uncommitted changes (the active tab during edits, or a blurred tab with a commit failure) checks for a MERGE CONFLICT (diffs touching the same element) and merges when there is none. | Tabs ¶2 |

### 2.6 Doc-nav

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `DN-1` | change | The document pane LISTENS to Gnosis and updates automatically when a document is added to the focused wiki. | Doc-Nav ¶1 |
| `DN-2` | extension | The document pane does NOT recalculate on collapse/expand (the panes rule). | Doc-Nav ¶2 |

### 2.7 Search

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `SR-1` | change | Search results render IN THE PANE, unless that search was already opened in a tab — in which case the results populate the TAB'S STAGE. | Search ¶1 |
| `SR-2` | extension | In-pane results show ONLY the document name; every other detail appears only in the full tab search. | Search ¶2 |
| `SR-3` | extension (**future feature**) | Search auto-completes, with a history tool favouring recent searches. | Search ¶3 |
| `SR-4` | extension | Search has an IN-DOCUMENT-ONLY mode. | Search ¶4 |
| `SR-5` | change | `Ctrl+F` moves focus to the search bar in in-document-only mode, copying any highlighted text into the bar. | Search ¶5 |

### 2.8 Files

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `FL-1` | extension (**future feature**) | Document EXPORT. | Files ¶1 |
| `FL-2` | extension (**future feature**) | AUTOMATIC RE-EXPORT on commit. | Files ¶2 |

### 2.9 Gnosis (the contract-changing block)

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `GN-1` | **change (ownership)** | ALL document CRUD operations go through Gnosis; Astrographer persists NO documents other than the data owned by the CURRENT TABS. | Gnosis ¶1 |
| `GN-2` | **change (disposition)** | All information contradicting the above is OBSOLETE and is to be PRUNED / ARCHIVED. | Gnosis ¶1 |
| `GN-3` | change | At startup the app ALWAYS checks whether a Gnosis instance is running and LAUNCHES one when it cannot find an existing instance. | Gnosis ¶2 |
| `GN-4` | change | When no Gnosis instance is found, the user is WARNED that the wiki cannot be opened. | Gnosis ¶2 |

### 2.10 Engineering / process

| Id | Kind | Statement (restated) | Source line |
| --- | --- | --- | --- |
| `EN-1` | process | The dominant cost of the observed freezes is DOWNSTREAM of the code but is TRIGGERED by unnecessary changes. | Engineering ¶1 |
| `EN-2` | **process (catalog rule)** | User PERFORMANCE COMPLAINTS are NOT requirements; the ARCHITECTURE DECISIONS taken to resolve them ARE requirements. | Engineering ¶2 |

---

## 3. Candidate contract collisions (FOR THE GATE TO VERIFY — not assertions)

Listed so the gate starts from the real conflict set. Each line names the item and the artifact it
appears to collide with; the reviewers must verify each collision against the artifact rather than
inheriting this list.

| Item | Apparent collision | Artifact |
| --- | --- | --- |
| `GN-1` | **The store/persistence ownership reverses.** The landed contract has the HOST `RagStore` authoritative with the main process owning all writes. | `docs/decisions.md` `DECIDED: RAG-AUTHORITATIVE`, `DECIDED: SINGLE-WRITER-STORE`, `DECIDED: SINGLE-WRITER-STORE-PER-STORE`; `docs/specs/astrographer-review.md` §8.1/§9.2.6 |
| `GN-1` | The prior proposal gate **rejected the ownership transfer** and **demoted** engine-owns-documents to a parked track with external revisit triggers; the input asserts the transfer outright. | `docs/specs/astrographer-scope-realignment-review.md` §3.3 ("MCP-server ownership STAYS HOST-OWNED") / §7.3(a); `docs/specs/gnosis-offload-review.md`; `docs/pending.md` §PARKED DESTINATION (O-6/O-7/O-8) |
| `GN-1`, `GN-3` | The engine-absent contract: with no engine every local path must work IDENTICALLY and engine-absent reads must be typed-unavailable, never silent. The input instead launches an engine or refuses to open a wiki. | `docs/specs/astrographer-scope-realignment-review.md` §3.4 |
| `GN-2` | "Prune/archive all contradicting information" is a mass-disposition instruction touching specs, decisions, pending rows, and the catalog's upstream-owed ledger. | `docs/pending.md`, `docs/decisions.md`, `docs/requirement-catalog.md` §C.4 |
| `EN-2` | The catalog currently treats user performance complaints as rows with a direction; `EN-2` changes the RULE by which such feedback becomes a requirement. | `docs/requirement-catalog.md` §C.5; `DECIDED: ADVISORY-REQUIREMENT-CATALOG`; defect rows `HEAVY-OPS-FREEZE-THE-PAGE`, `PANE-TOGGLE-FULL-REASSEMBLY`, `CANVAS-DIMENSIONS-JS-DRIVEN` |
| `ST-1`, `ST-4`, `ST-6` | Whole-page single-block editing + the per-node editing model's supersession chain; the markdown-mode-as-plaintext rule. | `DECIDED: WHOLE-PAGE-EDITING`, `DECIDED: EDITING-MODE-SETTING` / `FORM-CONTROL-EDITING`; catalog rows `PRUNE-300`, `PRUNE-310`, `PRUNE-311` |
| `PN-6`, `PN-7`, `LZ-1`, `PN-2` | The pane-decomposition request (one file per pane + shared machinery) and the pane-drag gesture decisions; `LZ-1`'s element-local handlers vs the current frame-wide gesture surface. | `docs/feature-requests/sidebar-panes-decomposition.md` (FB-1…FB-4); `DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE`; catalog rows `PRUNE-129`…`PRUNE-136` |
| `TB-5`, `TB-1`, `TB-2` | The shell top-bar layout, the window drag region, and the tab strip's position after the LIVE-6 shell fixes. | `docs/defects.md` `TOP-BAR-NOT-FIXED`, `TABBAR-SCROLLS-AWAY`, `LIVE-2`; catalog rows `PRUNE-100`, `PRUNE-101` |
| `PN-1`, `TB-1`, `SR-1`, `SR-5` | The native File/View application menus (carve-out) vs moving import + visibility into a provident pane; the search-in-tab vs search-in-pane split; `Ctrl+F`. | `DECIDED` rows for the menus; `docs/defects.md` `FIND-IN-PAGE-NOT-WIRED`; catalog rows `PRUNE-147`, `PRUNE-155` |
| `TB-4`, `SR-3`, `FL-1`, `FL-2`, `ST-1` (markdown) | Explicitly labelled LATER/FUTURE features — they must not be scheduled as current work. | `docs/pending.md` (SPECULATIVE / SCHEDULED sections) |
| `LZ-2`, `LZ-3`, `LZ-4`, `LZ-5`, `LZ-6`, `PN-2`, `PN-5` | The layout/zone contracts: CSS-owned geometry, the zone grid tracks, the stage inset, independent scrolling. | `DECIDED: LAYOUT-IN-CSS`; catalog rows `PRUNE-110`…`PRUNE-122` |

---

## 4. Status of this capture

- **This file asserts no status, no verdict and no feasibility claim.** It records the user's input
  and its itemization; the gate produces the verdict.
- **Nothing here is implemented, specified, scheduled, or catalogued.** The catalog's §C.4 ledger
  and §C.7 conflict register are UPDATED ONLY AFTER the gate — `GN-1`…`GN-4` in particular must not
  enter the catalog as settled behavior before the proposal gate returns and the user gives the
  go-ahead (the same rule applied to the `sidebar-panes-decomposition` request).
- **Next steps (in order):** (1) `role_validity` ∥ `role_critique` over this file; (2)
  `role_architecture_review` informed by both; (3) `role_change_analysis` for the verdict; (4)
  **PAUSE for the user's go-ahead**; (5) only then the spec/unit decomposition, the catalog update,
  and the `GN-1`…`GN-4` contract amendments (each with its own supersession rows).
