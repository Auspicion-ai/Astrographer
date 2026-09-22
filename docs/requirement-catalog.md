# ADVISORY REQUIREMENT CATALOG — `docs/requirement-catalog.md`

> **ADVISORY.** This document is the **ADVISORY** requirement/behavior catalog for Astrographer: an index
> over the in-repo corpus mapping *"behavior currently expected"* → *its origin* → *its consumer*. It is
> **not** a spec, **not** a test, **not** a coverage report and **not** a status source. No clause, count or
> cell of it is evidence that the application behaves in any way.
>
> **Layer (RCA-12, mandatory declaration):** **DOC-LAYER / advisory — nothing here is app-green, no live
> claim, no deletion authority.** A pass over this artifact is a documentation pass: nothing in it is
> APP-GREEN, ENVELOPE-GREEN, STORE-GREEN or LIVE-GREEN. A `code_anchor` is checked for **presence/shape
> only** at this layer, and symbol resolution is a separately-owned code-layer check.
>
> **NO DELETION MAY CITE THIS CATALOG.** This catalog stores **pointers only**; a deletion's justification
> is the user's per-item sign-off plus the owning tracker row — never a `capability` cell, never a
> `verdict` value, never this document.
>
> **PROVISIONAL MIRROR cells.** Every MIRROR cell lands hand-derived (`derived:false` /
> `derivation:"hand-derived"`, recorded once in the §C.6 manifest). The deferred generator
> (`scripts/catalog-derive.mjs`) is **NOT landed**: `generator:<none>`. Until it lands, no reader may
> mistake a hand-authored MIRROR cell for generated output.

**Contract.** This artifact is specified by `docs/specs/requirement-catalog.md` (§3.1 the closed section list
and the NON-AUTHORITY rule, §3.2 the closed 16-capability partition, §3.3 the 13-field schema, §3.4 the frozen
vocabularies + citation discipline, §3.5/§3.5.1/§3.5.2/§3.5.3 pointer addressing and id allocation and the
straddle/owning-row rules, §3.6 the verdict rules, §3.7 the conflict/waiver ledger, §3.8 the manifest, §3.9
Artifact B, §3.10 the closure duty, §3.12 the deferred unit, §5 the fail-states, §8 the census, §9 +
`### 9.1 AMENDMENTS` items (16)–(27)). Its gate-1 record is `docs/specs/requirement-catalog-review.md`.
The deferred generator's own contract is `docs/specs/unit-catalog-generator.md`.

**Citation discipline (binding on every cell below).** Every pointer is a **row id**, a
**`path:§section`**, a **`path symbol`** or a **`path selector`**. **No line number appears anywhere in this
artifact.** An `archive/**` path appears **only** inside a marked `[archive]` `evidence_pointer`, never as a
`status_pointer` and never as a canonical origin. Status verbs and copied tracker status text are forbidden in
catalog-authored cells — a status is either **quoted** from its owning tracker or **pointed at**.

**Assembled by.** The **MERGE** pass (the only writer of this file), from the seven authoring fragments staged
under the gitignored `archive/catalog-authoring/2026-09-21/` tree (CL-1 §C.0+§C.1 · CL-2 §C.2 · CL-3 §C.3
part 1 · CL-4 §C.3 part 2 · CL-5 §C.4 · CL-6 §C.5+§C.7 · CL-7 §C.6+§C.8), then carried through the cycles
recorded in §C.8.1: **C0** the authoring/landing cycle, **C1** the merge, **C2** the adversarial fix pass,
**C3** the item-10d documentation review, **C4** the design-extensions amendment, **C5** the count-repair /
digest-re-stamp pass, and **C6** the reconstruction pass below. The fragments are **staging only** — they are
never canonical and are cited only inside a marked `[archive]` evidence pointer.

> **RECONSTRUCTION PASS (C6) — read this before auditing any figure.** This file was destroyed on
> 2026-09-21 by a whole-file `write` mis-used as an append during the C5 count-repair / digest-re-stamp pass,
> and has been reassembled here from the seven staging fragments + the surviving cycle records. Where a
> fragment and a later cycle record disagree, the later cycle's figure is carried and the disagreement is
> **named rather than silently absorbed** (§C.8.1 C5/C6). Two figures recorded by the data-loss marker are
> not reproducible from the fragments and are recorded as **UNRECONCILED**, with both readings stated
> (§C.6.3's `tier2` note and §C.3's opening note). Nothing was re-invented: every row, id, pointer and cell
> below comes from a fragment, a tracker row, a decision row or a contract clause.

---

## §C.0 — Scope + the NON-AUTHORITY rule

**§C.0 scope block.** This document is the **ADVISORY** requirement/behavior catalog for Astrographer (the
ADVISORY layer declaration, RCA-12): an index over the whole in-repo corpus — *"behavior currently expected"*
→ *its origin* → *its consumer*. Its sections are closed and ordered `§C.0`–`§C.8`; the deferred generator's
sentinel region lives inside `§C.6` and nowhere else. Every §C.3/§C.4 row carries the frozen 13-field schema
(6 MIRROR + 7 JUDGMENT per the contract's field table); on landing every MIRROR cell is **PROVISIONAL**
(`derived:false`, recorded once in the §C.6 manifest rather than per cell). The §C.1 capability partition is a
closed set of exactly 16 ids — no row may add, rename, split or merge one, and `UNCLASSIFIED` is refused. Row
membership, verdicts, verdict bases and waivers are governed by `docs/specs/requirement-catalog.md` §3.2,
§3.3, §3.6 and §3.7; the input corpus and its counts are recorded in the §C.6 manifest. **Nothing in this
catalog is a claim about the application.**

**§C.0 NON-AUTHORITY rule** (the contract's five rule statements at `docs/specs/requirement-catalog.md` §3.1
items 1–5, restated here as this artifact's own binding rules):

1. **The tracker is the SOLE status authority.** This catalog stores **pointers**, never status text. Where
   this catalog and a tracker disagree about status, **the tracker governs** and the catalog row is corrected
   in the next pass; where a row's own pointers contradict each other, the row **freezes at
   `invalidated-conflict`** until the next cycle (`docs/specs/requirement-catalog.md` §3.6, §3.7 rule 1).
2. **No deletion may cite this catalog as its authority.** A deletion's justification is the user's per-item
   sign-off plus the owning tracker row — never a `capability` cell, never a `verdict` value
   (`docs/specs/requirement-catalog.md` §3.1 rule 2, §3.6).
3. **The register is ADVISORY.** A row's `verdict` is a *candidate for the user's consideration*: a wrong
   `keep` costs nothing, and a wrong `escalate-prune` is declined by the user.
4. **No clause here is app evidence.** No catalog clause, count or cell is evidence that the application
   behaves in any way; a `code_anchor` is checked for presence/shape only at this layer and symbol resolution
   is a separately-owned code-layer check.
5. **The MIRROR cells are PROVISIONAL.** Every MIRROR cell lands hand-derived (`derived:false`) until the
   deferred generator lands, and the manifest carries that marking so no reader can mistake a hand-authored
   MIRROR cell for generated output.

**Scope boundary, stated once here so `§C.1` need not repeat it.** This catalog indexes *expected behavior*
and the requirements that express it. It does **not** own: the tracker status at any pointer (rule 1); the
resolution of a tracker-vs-spec conflict (rule 2 of `docs/specs/requirement-catalog.md` §3.7 — that is the
documentation reviewer's business, and this catalog's duty is to freeze the row and name both pointers); the
application's design contracts (those live in `docs/specs/**`); or any live/app/envelope claim (rule 4).

---

## §C.1 — the 16 capabilities, as a CLOSED partition

**Status of this section.** The partition is **asserted** (a pinned design output, `docs/specs/requirement-catalog.md`
§3.2/§8): **exactly these 16 ids, in this order, neither addable nor renamable, splittable or mergeable by the
authoring pass.** Every catalog row belongs to **exactly one** of them; a row with no capability, with
`UNCLASSIFIED`, or with two capabilities is refused (`docs/specs/requirement-catalog.md` §3.2, §5 `FS1`). The
per-capability counts must sum to the artifact's row total (contract §3.10 closure tests 1–2).

**The boundary test is an ORDERED decision list, run top to bottom; the first YES assigns the row.** It is
stated once here and referenced — never re-derived — by every row's *boundary test* cell. Because the list is
ordered and every branch assigns exactly one id, the tests are mutually exclusive; because every behavior
answers one of the questions YES, the tests are collectively exhaustive.

| # | Boundary question (first YES assigns the capability) | Assigns |
| --- | --- | --- |
| B1 | Is the behavior owed to an **upstream or out-of-repo** project (the engine package, the foundation, the adjacent Gnosis project, the upstream docs)? | `UPSTREAM-OWED` |
| B2 | Is there **no human- or agent-observable effect** — only a process, harness, measurement, register/pin or doc duty whose satisfaction is readable only from tests, specs, pins, censuses or process artifacts? | `ENGINEERING-ONLY` |
| B3 | Is it the **MCP endpoint contract itself**, or the tool-group ↔ UI-home parity mapping, rather than a UI behavior? | `MCP-ENDPOINT-CONTRACT` |
| B4 | Does it change **what a main-focus tab holds or which tab is active** (target model, open/close/switch/activate, in-strip order, tab persistence)? | `TABS` |
| B5 | Does it **create, remove, place, size, hide or reveal a zone** (the grid, tracks, zone containers, gutters, zone-boundary rules, empty-zone or minimized-zone *track* behavior)? | `LAYOUT-ZONES` |
| B6 | Is it the **window frame, top-bar/tab-strip region, app drag region, native menu, native dialog, or app branding/landing chrome**? | `SHELL-CHROME` |
| B7 | Does it act on a **single pane's frame or pane lifecycle** (collapse, minimize-to-tab-list, drag/relocate, order/persistence, per-pane content surface), rather than on a zone or the stage? | `PANES` |
| B8 | Is it the **central stage surface itself** (landing, stage body/mount, per-node single render, doc-head/typography/scope isolation, commit-on-blur *as a document surface*)? | `STAGE-DOCUMENT` |
| B9 | Is the surface a **rich/contenteditable editor** (its eligibility set, splice, decompose/commit path)? | `EDITING-RICH-TEXT` |
| B10 | Is the surface the **markdown-as-data / textarea presentation or the editing-representation toggle**? | `EDITING-MARKDOWN-MODE` |
| B11 | Is it **undo/redo state, the journal read-back, or the history surface and its placement**? | `HISTORY-UNDO` |
| B12 | Is it the **search/retrieval surface** (query + advanced args + results + open-in-tab-from-search)? | `SEARCH-RETRIEVAL` |
| B13 | Is it the **document navigator** (its rows, folder grouping, tree semantics, selection seam)? | `DOC-NAV-TREE` |
| B14 | Is it the **settings modal, its operator panels or their census/defaults/lazy-load, or the theme (including theme token application)**? | `SETTINGS-MODAL-THEME` |
| B15 | Is it the **File → Import… path** (dialog, file/folder expansion, the cap, the import result broadcast, corpus-root addressing)? | `IMPORT-FS` |
| B16 | Is it the **Gnosis engine's GUI surface** — its panes, engine status, wikis/documents, or the engine's own retrieval/enrichment behavior as surfaced to the UI? | `GNOSIS-ENGINE-SURFACE` |

**Reading rule.** The list is numbered in **capability-rank order** (B1 = `UPSTREAM-OWED`, the highest-ranked
capability; B16 = `GNOSIS-ENGINE-SURFACE`, the lowest), so `B<n>` doubles as the rank of the capability it
assigns and the run order is unambiguous. Rank order is what makes the partition legal rather than merely
convenient: B1/B2/B3 answer **owner- and contract-side** questions and therefore precede every surface
question (a row owed upstream, or with no observable effect, or constituting the endpoint contract itself, can
never be captured by a surface test); B4–B16 are the user-visible partition and are mutually exclusive by
"which surface does the behavior act on". The `OWNER` of a behavior (shell, main process, launcher, harness) is
recorded in the row's `owner_class` field — **not** in the capability — so a main-process-owned row still
classifies by its observable surface (contract §3.2's `Owns` clauses; §3.4's `owner_class` + precedence rule).
**Asymmetry of the citations, stated so neither is read as an omission:** a high-ranked capability cites the
*exclusions* that save it (e.g. `SHELL-CHROME`'s B6 notes that `TABS` and `SETTINGS-MODAL-THEME` reach the same
chrome), while a low-ranked capability cites the *tests that precede it* (e.g. `PANES`' B7 notes that B6 and B5
already ran). Neither citation weakens the ordering — no pair is left undecided.

### §C.1.1 The 16 capability rows (one definition row per capability — in the contract's order and spelling)

| # | `capability` | Definition | Boundary test | NOT in this capability (exclusions) | Feeding inputs (sections / groups / row ids / decision names / mcp-endpoint refs) |
| --- | --- | --- | --- | --- | --- |
| 1 | `SHELL-CHROME` | The Electron shell's own chrome: the window frame and its drag region, the outer-shell top-bar that carries the nameplate and the tab strip's *region*, the native application menu (View → Panes, File → Import…, Find), the OS file/clipboard/native-dialog surfaces, and the app branding/landing chrome as presented by the shell. | **B6** — is it the frame, the top-bar/tab-strip region, the drag region, a native menu/dialog, or branding chrome? **B6 sits at rank 1, so it must be read together with the two exclusions its higher-ranked neighbours carry:** what a tab **holds** is claimed by B4 (`TABS`) and the theme **value's control/persistence** by B14 (`SETTINGS-MODAL-THEME`) — both are decided in *my* favour only if they are pure chrome (a region, the token application at the shell root, a native menu item). *Easy to confuse with TABS* (a strip **region** is chrome; what a tab **holds** is not) *and with SETTINGS-MODAL-THEME*. | Not the tab target/activation model (TABS); not zone geometry or zone containers (LAYOUT-ZONES); not any pane body (PANES); not the modal frame's *content* or the theme value's persistence (SETTINGS-MODAL-THEME); not the import dialog's *expansion/cap/broadcast semantics* (IMPORT-FS); not an engine-owned surface (GNOSIS-ENGINE-SURFACE). | `docs/specs/ui-overhaul.md`:§1 rows **C13**, **C14**, **C17**, **C19**, **C20**; §2 + §2.1 Tables B/C; §4 **G10**; §7 rows **Q2**, **Q10**, **Q11**; §3 (the top-bar region: a shell region, never a pane zone); §7.1 · checklist **§1 Shell/chrome** (`UF-SHELL-1`, `UF-SHELL-2`, `UF-SHELL-4`) · `docs/defects.md` rows **TOP-BAR-NOT-FIXED**, **NAMEPLATE-NO-SIDE-MARGIN**, **LIVE-1 BRANDING**, **LIVE-2 TAB-PLACEMENT**, **TABBAR-SCROLLS-AWAY**, **FIND-IN-PAGE-NOT-WIRED** · `docs/decisions.md` **APP-BRANDING-IN-TOP-BAR**, **LAYOUT-IN-CSS** · `docs/specs/mcp-endpoint.md` §7 (`P-E1` no-package-edit). |
| 2 | `LAYOUT-ZONES` | The `#wiki-root` grid and its zone model: the named areas (`top-bar`, `header`, `left`, `stage`, `right`, `footer`), zone containers and placement, the resizable gutters between zone tracks, zone sizes and their persistence, zone-boundary visibility, the zero-pane auto-hide rule, and the proximity-reveal drop target. | **B5** — does it create/remove/place/size/hide/reveal a **zone**, or govern the grid track? *Easy to confuse with PANES* (a pane's frame is B7; the **track it sits in** is B5) *and with SHELL-CHROME* (B6 is checked FIRST — it already claimed the grid **geometry**/drag mechanics/root tokens, so B5 claims the zone's own container, track, area and hide/reveal state only; the ruling is `docs/specs/ui-overhaul.md` §7.3/OB2: zone containers and placement are graph, the shell owns only grid geometry/gutters/drag mechanics/tokens). | Not pane frames, collapse, drag gestures or per-pane content (PANES); not the stage's content surface or its formatting scope (STAGE-DOCUMENT); not the tab strip (TABS/SHELL-CHROME); not the window frame (SHELL-CHROME); not a pane's own slot order (PANES). | `docs/specs/ui-overhaul.md`:§1 rows **C2**, **C4**, **C7**, **C11**, **C12** (the container/track half), **C15**; §3 (the pane layout model: zones, defaults, relocation legality, empty-zone auto-hide, container minimize, the top-bar is NOT a pane zone); §7 rows **Q3**, **Q4-less**, **Q7**, **Q9**, **Q16-less**, **Q20**; §7.1; **§7.3 (OB2 Reading 2)**; §8.1 · checklist **§2 Layout/zones** (`UF-LAYOUT-1`..`UF-LAYOUT-12`) · `docs/defects.md` rows **LIVE-6 PANES-NOT-IN-ZONES**, **LIVE-UF7 ZONE-RESIZE-NO-GRIP**, **LIVE-UF8 ZONE-NO-BOUNDARY**, **ZONE-NO-BOUNDARY-ASYMMETRY**, **STAGE-LEFT-EDGE-FLUSH**, **F-3 EMPTY-ZONE-TRACK-NOT-COLLAPSED**, **CANVAS-DIMENSIONS-JS-DRIVEN**, **STALE-MOUNT-PUSHES-CANVAS**, **PANE-NO-PLACEMENT-OR-SCROLLBOX** · `docs/decisions.md` **LAYOUT-IN-CSS**, **UI-CONFIG-CARRIER**. |
| 3 | `PANES` | The pane as a unit: its frame and header, collapse/expand, minimize-to-zone-tab-list, drag/relocate and slot order, per-pane title chrome, zone-tab orientation, pane enablement/persistence, and the per-pane content surface a named pane renders. | **B7** — does it act on one pane's frame or lifecycle? (B6 and B5 are checked FIRST, so a pure drag/pointer mechanic or a zone-track change never reaches here.) *Easy to confuse with LAYOUT-ZONES* (a pane's **slot/track** belongs to B5; the pane's own **order value, collapse and relocate** are B7) *and with SHELL-CHROME* (the drag gesture's pointer/`dataTransfer` mechanic is chrome; the resulting relocation is B7 — `docs/specs/ui-overhaul.md` §2.1 Table B). | Not zone tracks/gutters/empty-hide (LAYOUT-ZONES); not the modal's operator panels (SETTINGS-MODAL-THEME); not the tab strip or tab targets (TABS); not the stage body (STAGE-DOCUMENT); not the doc-nav rows' own semantics (DOC-NAV-TREE); not a pane body's *feature* semantics (each belongs to its own capability — e.g. search results are SEARCH-RETRIEVAL). | `docs/specs/ui-overhaul.md`:§1 rows **C4**, **C5**, **C6**, **C12**, **C13**; §2 + §2.1 Table A + Table B; §3 (pane framing, relocation legality, minimize → tab-list, orientation from the zone edge); §4 **G3**, **G4**, **G6**, **G7**, **G9**; §5 items 1, 5, 6, 7; §5.1 (`PG1`, `PG2`, `PG12`, `PG13`, `PG14`, `SG7`, `SG10`); §5.4; §7 rows **Q3**, **Q8**, **Q9**, **Q11**, **Q12-less**, **Q15** · checklist **§3 Panes** (`UF-PANES-1`..`UF-PANES-18`) · `docs/defects.md` rows **LIVE-UF2 PANE-DRAG-INERT**, **LIVE-UF5 HISTORY-IN-MAIN-CANVAS**, **LIVE-UF10 COLLAPSED-ZONE-TAB-HORIZONTAL**, **LIVE-11 COLLAPSE-INERT**, **LIVE-10 NO-PANE-TITLES**, **PANE-DRAG-NO-COMMIT**, **PANE-DRAG-TOP-ONLY**, **PANE-SLOT-INSTABILITY-ON-DISCLOSURE**, **F-1 PANE-BODY-GESTURE-SWALLOWED** · `docs/decisions.md` **PANE-REGISTRY**, **PANE-PROVIDENT-AUTHORING**, **PANE-DRAG-HEADER-ONLY**, **FIRST-RUN-ENABLED-DEFAULT**. |
| 4 | `TABS` | Main-focus tabs: the typed target model (`document:` / `graph:` / `gnosis-doc:` / other), create/close/switch/activate, the active-tab highlight, open-in-tab from a search result, reorder within the strip, the tab state's persistence, and the MCP focus tool that find-or-opens a tab. | **B4** — does it change **what a tab holds or which tab is active**? *Easy to confuse with SHELL-CHROME* (the strip's **region/placement** is chrome; a tab's **target/activation** is B4) *and with STAGE-DOCUMENT* (the active tab's body **renders in the stage** — the body is B8, the choice of body is B4). | Not the strip's region or its drag area (SHELL-CHROME); not the stage body's own render/typography (STAGE-DOCUMENT); not the search pane's query/results (SEARCH-RETRIEVAL); not the zone/pane model (LAYOUT-ZONES / PANES); not cross-document shared-node *content* semantics beyond what a duplicate render implies (STAGE-DOCUMENT + `docs/decisions.md` **MULTI-PARENT-DUPLICATE**). | `docs/specs/ui-overhaul.md`:§1 rows **C14**, **C20**; §3 (main-focus tabs: target model, affordances, shell-strip parity note, persistence, multi-document semantics); §4 **G1**, **G2**; §7 rows **Q12**, **Q14-less**; §7.1; **§7.2 (OB1 — Option C)**; §8.1 · checklist **§4 Tabs** (`UF-TABS-1`..`UF-TABS-12`) + **§12** `UF-PARITY-11` · `docs/defects.md` rows **LIVE-UF1 NEW-TAB-INERT**, **LIVE-3 NEW-TAB-INERT**, **LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC**, **LIVE-2 TAB-PLACEMENT**, **TABBAR-SCROLLS-AWAY** · `docs/decisions.md` **MCP-FOCUS-TOOL**, **UI-CONFIG-CARRIER (C9)**, **MCP-UI-EQUIVALENCE** · `docs/specs/mcp-endpoint.md` §3, §3.4 (`list_targets`). |
| 5 | `STAGE-DOCUMENT` | The central document/stage surface: the empty-store landing, the mounted stage body for the focused target, per-node single render (one materialization per RAG node, not nested inside a doc-head), doc-head/heading and typography behavior, content-scope formatting isolation, and commit-on-blur *as a property of the document surface*. | **B8** — is it the stage surface itself? *Easy to confuse with TABS* (the active tab's content **is** the stage body — the selection is B4, the body is B8) *and with EDITING-RICH-TEXT / EDITING-MARKDOWN-MODE* (what a committed edit writes, and whether the surface is rich or markdown-as-data, are B9/B10; the stage's rendering/typography is B8). | Not rich-editor eligibility/splice (EDITING-RICH-TEXT); not markdown-as-data (EDITING-MARKDOWN-MODE); not history/undo controls (HISTORY-UNDO); not the doc-nav list (DOC-NAV-TREE); not the zone/grid (LAYOUT-ZONES); not the tab target (TABS). | `docs/specs/ui-overhaul.md`:§1 rows **C2**, **C8**, **C10**, **C15**, **C19**/**C20**; §3.1 (content-only repopulation, the stage/template producers persist); §3.3; §7 rows **Q4**, **Q5**, **Q19**, **Q21**, **Q22-less**; §8.1 · checklist **§5 Stage/document** (`UF-STAGE-1`..`UF-STAGE-10`) · `docs/defects.md` rows **LIVE-UF6 DUPLICATE-EDITABLE-PARAGRAPH**, **DOC-HEAD-CONTAINS-FIRST-PARAGRAPH**, **LIVE-4 NO-LANDING**, **TABLE-OVERFLOWS-STAGE**, **LIST-INDENT-40PX**, **HEAVY-OPS-FREEZE-THE-PAGE**, **F-2 WIKI-ROOT-MOUNT-LEAK**, **INLINE-OFFSET-STALENESS** · `docs/decisions.md` **RAG-AUTHORITATIVE**, **CONTENT-EDIT-RE-TRAVERSAL**, **PLACEMENT-ONLY-PAYLOAD-ROOT**, **DERIVED-DOC-FLOW**, **WHOLE-PAGE-EDITING**, **LAYOUT-IN-CSS**, **UI-MOUNT-BOOT**. |
| 6 | `EDITING-RICH-TEXT` | The rich (contenteditable) editing surface: which RAG roots are eligible, the splice that installs it, the decompose-on-blur path, `edit.commitRich` and paste sanitization, the dirty-edit guard and caret restoration *for that surface*, and the structural `edit.*` reachability that this editor is claimed to cover indirectly. | **B9** — is the surface a rich/contenteditable editor? **This capability carries `wants-change`-direction asks and MUST NOT be merged with `EDITING-MARKDOWN-MODE`, which carries the OPPOSITE direction** (the contract's explicit call, `docs/specs/requirement-catalog.md` §3.2). *Easy to confuse with EDITING-MARKDOWN-MODE* (the discriminator is the **editing representation**, not the document: one page = one surface). | Not the markdown-as-data / textarea presentation (EDITING-MARKDOWN-MODE); not undo/redo state (HISTORY-UNDO); not the stage's typography or the doc-head render (STAGE-DOCUMENT); not the commit-on-blur *document-surface* property (STAGE-DOCUMENT) — only its rich-editor implementation. | `docs/specs/ui-overhaul.md`:§1 row **C8**; §4 **G1**; §5.4 (the reclassification statement); §7 row **Q19**; §7.1 · checklist **§5 Stage/document** (`UF-STAGE-3`, `UF-STAGE-4`, `UF-STAGE-5`, `UF-STAGE-6`), **§8 Editing/history** (`UF-HIST-1`, `UF-HIST-2`), **§12** (`UF-PARITY-2`) · `docs/defects.md` rows **WHOLE-PAGE-EDITING-REQUIREMENT**, **TABLE-CELLS-NOT-EDITABLE**, **DOC-TITLE-NOT-EDITABLE**, **EDIT-MODE-TEXTAREA-UI**, **LIVE-UF6 DUPLICATE-EDITABLE-PARAGRAPH**, **HOST-U2-F1**, **HOST-U3-F3** · `docs/decisions.md` **FORM-CONTROL-EDITING**, **EDITING-MODE-SETTING**, **WHOLE-PAGE-EDITING**, **CONTENT-EDIT-RE-TRAVERSAL**, **RAG-EDIT-MCP-GROUPS**, **SINGLE-WRITER-STORE** · `docs/specs/mcp-endpoint.md` §3.2, §3.4/§3.5. |
| 7 | `EDITING-MARKDOWN-MODE` | The markdown/textarea editing presentation: the editor-toolbar **editing-representation toggle**, the textarea-host editing surface, and the requirement that "Markdown mode" present the markdown **DATA as plain text** (no form controls, no HTML affordances) rather than a form-control editor. | **B10** — is it the markdown-as-data presentation or the representation toggle? **This capability carries `wants-removal`-direction asks (the per-node textarea editors are to be removed) and MUST NOT be merged with `EDITING-RICH-TEXT`** — merging them would put two opposite `direction` values on one row (`docs/specs/requirement-catalog.md` §3.2). | Not rich-editor eligibility/splice (EDITING-RICH-TEXT); not the stage's render path (STAGE-DOCUMENT); not the settings modal's `editingMode` control surface (SETTINGS-MODAL-THEME) — the *toggle* lives with this capability, the *stored setting and its operator control* live there. | `docs/specs/ui-overhaul.md`:§1 row **C8**; §3.2 (the editing representation in the serialized UI-config state); §4 **G1**; §7 rows **Q4**, **Q19**; §7.1 · checklist **§5 Stage/document** (`UF-STAGE-5`, `UF-STAGE-6`), **§8 Editing/history** (`UF-HIST-1`) · `docs/defects.md` rows **EDIT-MODE-TEXTAREA-UI**, **WHOLE-PAGE-EDITING-REQUIREMENT**, **LIVE-9 HTML-TOGGLE-INERT** · `docs/decisions.md` **EDITING-MODE-SETTING**, **FORM-CONTROL-EDITING**, **WHOLE-PAGE-EDITING**, **UI-CONFIG-CARRIER (C9)** · `docs/specs/mcp-endpoint.md` §3.3 (`get_markdown`). |
| 8 | `HISTORY-UNDO` | Undo/redo and the history surface: the enabled/disabled state of the toolbar controls, undo/redo/replay semantics as surfaced, the journal read-back that populates the history list, click-a-history-entry-undoes-to-that-point (multi-step undo), and the history surface's own placement/shape. | **B11** — is it undo/redo state, journal read-back, or the history surface and its placement? *Easy to confuse with EDITING-\** (the edit writes content — B9/B10; what *reverts* it, and what the revert control's state is, is B11) *and with STAGE-DOCUMENT / PANES* (the history block's **placement** is a B11 requirement about the history surface; the container it must live in is B7/B8's business). | Not the edit commit itself (EDITING-RICH-TEXT / EDITING-MARKDOWN-MODE); not the stage body's document content (STAGE-DOCUMENT); not the journal's store-side invertibility contract (`docs/decisions.md` **PROJECT-JOURNAL**) — only its UI state and read-back; not a pane's frame chrome (PANES). | `docs/specs/ui-overhaul.md`:§1 row **C16**; §4 **G1**, **G6**; §5.1 (`PG1`); §5.5; §5.6; §7 row **Q14**; §7.1; §8.1 · checklist **§8 Editing/history** (`UF-HIST-1`..`UF-HIST-7`), **§3 Panes**, **§12** (`UF-PARITY-2`, `UF-PARITY-7`) · `docs/defects.md` rows **LIVE-UF5 HISTORY-IN-MAIN-CANVAS**, **HISTORY-NOT-DROPDOWN**, **LIVE-8 UNDO-INERT**, **ENG-JOURNAL-ENTRY-READ-API** · `docs/decisions.md` **PROJECT-JOURNAL**, **C16-CONSUMES-PROJECT-JOURNAL**, **JOURNAL-READ-VIA-PACKAGE**, **CONTENT-EDIT-RE-TRAVERSAL** · `docs/specs/mcp-endpoint.md` §3.6, §3. |
| 9 | `SEARCH-RETRIEVAL` | The retrieval surface: the search pane's query and topK controls, the advanced-search disclosure exposing the full `rag.query` argument surface, result rows and result detail (citations/trace), opening a result in a tab, and the retrieval semantics *as surfaced* (including the documented display-only asymmetries). | **B12** — is it the search/retrieval surface? *Easy to confuse with MCP-ENDPOINT-CONTRACT* (the `rag.query` tool and its arg surface are B3's contract; the **pane that exposes those args** is B12) *and with TABS* (opening a result in a tab is B4; the result row is B12). | Not the retrieval engine's implementation or its store/embedder selection (`docs/decisions.md` **LEXICAL-FIRST-RETRIEVAL**, **SOURCE-SWITCHABLE** — indexed as rows where they surface); not the tab model (TABS); not the gnosis-engine retrieval legs (GNOSIS-ENGINE-SURFACE / UPSTREAM-OWED); not the doc-nav list (DOC-NAV-TREE). | `docs/specs/ui-overhaul.md`:§1 row **C18**; §4 **G4** + the §4.11 parity census rows for `rag.query`, `rag-stream`, `get_query_audit_log`; §5 item 2; §5.1 (`PG5`, `PG6`); §5.2; §5.4; §7 rows **Q16**, **Q20**, **Q23**; §7.1 · checklist **§6 Search** (`UF-SEARCH-1`..`UF-SEARCH-4`), **§3 Panes** (`UF-PANES-14`) · `docs/defects.md` rows **PANE-SLOT-INSTABILITY-ON-DISCLOSURE**, **LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC**, **VECTOR-IMPORT-NO-BODY-VECTORS**, **HEAVY-OPS-FREEZE-THE-PAGE** · `docs/decisions.md` **LEXICAL-FIRST-RETRIEVAL**, **RAG-QUERY-STORE-DISPLAY-ASYMMETRY**, **LOCAL-QUERY-DOCUMENT-FILTERS**, **UI-SELECTOR-DEFERRED** · `docs/specs/mcp-endpoint.md` §3, §6.2. |
| 10 | `DOC-NAV-TREE` | The document navigator: its row set, the directory **folder grouping** (and the path/tag data the grouping reads), tree semantics (expanded/collapsed, indent, selection), the create-document/create-folder affordances the tree implies, and the selection seam by which a row focuses a document. | **B13** — is it the document navigator? *Easy to confuse with STAGE-DOCUMENT* (selecting a row **focuses a document in the stage** — the focus effect is B8/B4, the row and its grouping are B13) *and with PANES* (doc-nav is **a pane** — its frame/collapse is B7, its rows/tree semantics are B13). | Not the pane frame (PANES); not the stage body (STAGE-DOCUMENT); not the store's path/tags model itself (`docs/decisions.md` **DOC-DIRECTORY-CATEGORY-GATE**, **SET-DOC-META-TAG-WRITE** — indexed where they surface); not the retrieval filters (SEARCH-RETRIEVAL); not the tabs (TABS). | `docs/specs/ui-overhaul.md`:§1 row **C15**; §3.3; §4 **G2** + the §4.11 `rag.get_document` row; §5 item 1; §5.1 (`PG14`, `SG7`, `SG10`); §7 row **Q13**; §8.2 · checklist **§3 Panes** (`UF-PANES-12`), **§12** (`UF-PARITY-3`), **§2 Layout/zones** (`UF-LAYOUT-3`) · `docs/defects.md` rows **DOC-NAV-NOT-A-TREE**, **F-1 PANE-BODY-GESTURE-SWALLOWED**, **HEAVY-OPS-FREEZE-THE-PAGE**, **PANE-SLOT-INSTABILITY-ON-DISCLOSURE** · `docs/decisions.md` **DOC-DIRECTORY-CATEGORY-GATE**, **LOCAL-QUERY-DOCUMENT-FILTERS**, **SET-DOC-META-TAG-WRITE**, **DERIVED-DOC-FLOW** · `docs/specs/mcp-endpoint.md` §3. |
| 11 | `SETTINGS-MODAL-THEME` | The settings surface and appearance: the modal (hidden by default, toggle-opened, Escape/scrim close, isolation mount), the operator-only panels it hosts, the enabled-panes census and its first-run default, the boot-time population (no lazy-load), the operator settings (topK / editing mode / default document / registry listing) and the tri-state theme (system / light / dark) with its token application. | **B14** — is it the settings modal, its operator panels/census/defaults/lazy-load, or the theme? *Easy to confuse with SHELL-CHROME* (the modal **frame/scrim/toggle** is chrome and the theme's **root token application** is chrome — `docs/specs/ui-overhaul.md` §2's durable C3 clarification; the modal **body** and the theme **control/persistence** are B14) *and with PANES* (the modal hosts operator panes — their frames are B7; their census/enablement semantics are B14). | Not the modal frame/scrim/toggle mechanics (SHELL-CHROME); not pane frames or the pane registry API (PANES); not the native View → Panes menu (SHELL-CHROME); not the zone tracks a theme may style (LAYOUT-ZONES); not the `editingMode` *toggle control in the stage* (EDITING-MARKDOWN-MODE owns the toggle; the stored setting's operator control is B14). | `docs/specs/ui-overhaul.md`:§1 rows **C1**, **C3**, **C9**, **C13**, **C18**-adjacent; §2 + §2.1 Table A row 2; §3 (View-menu pane visibility, one model), **§3.2**; §4 **G5**, **G7**, **G8**, **G10**; §5 items 6, 8; §7 rows **Q1**, **Q2**, **Q6**, **Q10**, **Q11**, **Q24**; §7.1; §8.1 · checklist **§7 Settings modal** (`UF-SETTINGS-1`..`UF-SETTINGS-7`), **§11 Theme** (`UF-THEME-1`..`UF-THEME-3`), **§3 Panes** (`UF-PANES-9`..`UF-PANES-11`), **§12** (`UF-PARITY-8`) · `docs/defects.md` rows **LIVE-7 SETTINGS-LAZY-LOAD**, **LIVE-12 VISIBILITY-MENU-CLOSES**, **SETTINGS-PERSIST-WRITE-SILENT**, **PANE-VISIBILITY-IRREVERSIBLE** · `docs/decisions.md` **FIRST-RUN-ENABLED-DEFAULT**, **MODAL-SETTINGS-REPARENT**, **MODAL-DEDICATED-SCRIM**, **OPERATOR-ISOLATED-GRAPHSCOPE**, **UI-CONFIG-CARRIER**, **D-GP-UFA-1**. |
| 12 | `IMPORT-FS` | The File → Import… path: the menu item(s) and the OS picker, multi-file default and the platform-specific folder item, the directory→`.md` expansion rules, the file-count cap and its fail-loud behavior, the import result broadcast to the renderer, and the corpus-root/path persistence the imported documents carry. | **B15** — is it the File → Import… path? *Easy to confuse with SHELL-CHROME* (the **native File menu item and the OS dialog** are chrome and OS-owned; the **expansion rules, cap, broadcast and corpus-root semantics** are B15) *and with DOC-NAV-TREE* (an optional in-pane Import control lives in that pane — the control's home is B13, the import semantics it triggers are B15). | Not the native menu construction or the OS dialog (SHELL-CHROME); not the doc-nav pane (DOC-NAV-TREE); not the store's path/tags model; not the `edit.import_markdown` tool contract itself (MCP-ENDPOINT-CONTRACT) — only the browse surface sharing that handler. | `docs/specs/ui-overhaul.md`:§1 row **C17**; §4 **G2** + §4.11's `edit.import_markdown` row; §5 item 9; §5.1 (`PG2`); §5.5; §7 rows **Q17**, **Q18**; §7.1; §8.1; §8.2 · checklist **§9 Import** (`UF-IMPORT-1`..`UF-IMPORT-6`), **§12** (`UF-PARITY-3`) · `docs/defects.md` rows **HOST-MS4-10**, **VECTOR-IMPORT-NO-BODY-VECTORS**, **HEAVY-OPS-FREEZE-THE-PAGE** · `docs/pending.md` — the **Multi-store Phase 1** containment row · `docs/decisions.md` **IMPORT-NO-SYMLINK-FOLLOW**, **IMPORT-FILE-COUNT-CAP**, **IMPORT-RESULT-BROADCAST**, **DOC-DIRECTORY-CATEGORY-GATE**, **BATCH-ATOMICITY-API**, **MCP-UI-EQUIVALENCE** · `docs/specs/mcp-endpoint.md` §6.2, §6.3. |
| 13 | `GNOSIS-ENGINE-SURFACE` | The Gnosis engine as the user/agent sees it: the gnosis query/wikis/documents/status panes, the engine's own retrieval-leg and enrichment behavior **as surfaced** (mode/topK honoring, vector-index availability, 404 enrichment routes), the engine-absent degraded reads, and the engine-offload seams (which work may leave the shell). | **B16** — is it the Gnosis engine's GUI surface or the engine's own behavior as surfaced? *Easy to confuse with MCP-ENDPOINT-CONTRACT* (the `gnosis.*` tools' names/groups and their UI-home parity are B3; the engine's **behavior** and the panes that surface it are B16) *and with SHELL-CHROME* (an engine-start launcher gap is owned by the shell/main process but surfaces as this capability's degraded state — record the `owner_class`, keep the capability B16). | Not the MCP endpoint contract or the tool-group census (MCP-ENDPOINT-CONTRACT); not the local retrieval surface (SEARCH-RETRIEVAL); not the settings modal's `gnosis-status` *panel* semantics (SETTINGS-MODAL-THEME — the status **pane** is B16, its modal confinement is B14); not the engine's upstream-owned requests themselves (UPSTREAM-OWED). | `docs/specs/ui-overhaul.md`:§1 row **C15**; §4 **G5** + the §4.11 census Tables B and C; §5.7a (**HC1**); §7 row **Q13** · checklist **§10 Gnosis GUI** (`UF-GNOSIS-1`..`UF-GNOSIS-6`), **§12** (`UF-PARITY-6`) · `docs/defects.md` rows **GNOSIS-SIDEBAR-SEAM-MISSING**, **GNOSIS-ENGINE-QUERY-MODE-IGNORED**, **GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT**, **DEMO-ENGINE-START-GAP**, **HOST-CRUD-LIST-SUMMARY-DECODE**, **HOST-ENGINE-QUERY-POST-NO-ENVELOPE**, **ARCH-GNOSIS-OFFLOAD** · `docs/decisions.md` **ENGINE-TRANSPORT-POLICY**, **GNOSIS-SECURITY-CARVE-OUT**, **GNOSIS-LAUNCHER-TOGGLE**, **ASTROGRAPHER-SCOPE-REALIGNMENT**, **ENGINE-ABSENT-DEGRADED-CONTRACT**, **ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE**, **ENGINE-AUTHORITATIVE-DOCUMENT-CRUD**. |
| 14 | `MCP-ENDPOINT-CONTRACT` | The MCP endpoint contract as a surface: the tool set and its transports, the tool-group/permission model, the read/dispatch vs CRUD split, the security and manual-UI-only carve-outs, and the **parity mapping** that gives every MCP tool group a named UI home (EXISTS / PARTIAL / GAP / CARVE-OUT / PARKED). | **B3** — is it the MCP endpoint contract itself or the tool-group ↔ UI-home parity mapping, rather than a UI behavior? *Easy to confuse with every UI capability*: a parity row is B3 even though its subject is a pane, a tab or a stage — the parity **claim** is what this capability owns, and the pane's own behavior stays with its surface capability. *Also confusable with ENGINEERING-ONLY*: a *parity claim* is B3; the **harness row that verifies it** is B2. | Not the MCP server's implementation ownership (`docs/decisions.md` **ASTROGRAPHER-SCOPE-REALIGNMENT** keeps it host-owned); not any pane's behavior (PANES and its siblings); not the engine's own tools/endpoints behavior (GNOSIS-ENGINE-SURFACE); not the upstream package's endpoint contract (UPSTREAM-OWED). | `docs/specs/ui-overhaul.md`:§1 rows **C13**, **C14**, **C16**; §2; §4 (the parity definition + **G1–G10**); §4.11 (Tables A/B/C) with its summary; §5 items 2–5; §5.1 (all `PG*` rows); §5.4; §5.5; §5.7a; §6; §7 rows **Q7**, **Q10**, **Q11**, **Q12**, **Q15**; §7.1; §8.1; §9 · checklist **§12 MCP ↔ UI parity** (`UF-PARITY-1`..`UF-PARITY-11`), **§3 Panes** (`UF-PANES-16`, `UF-PANES-17`, `UF-PANES-18`), **§7** (`UF-SETTINGS-5`), **§6** (`UF-SEARCH-4`), **§4 Tabs** (`UF-TABS-9`) · `docs/defects.md` rows **HOST-LIVE-ZOD-SEAM**, **HOST-MS4-10**, **HOST-LIVE-UX-SETUP**, **HOST-PANE-STALE-ON-CHANGE**, **MCP-FOCUS-TOOL-UNLISTED-IN-CONTRACT** · `docs/decisions.md` **MCP-UI-EQUIVALENCE**, **MCP-FOCUS-TOOL**, **SECURITY-STORE-GNOSIS-GROUPS**, **RAG-EDIT-MCP-GROUPS**, **IPC-SURFACE-NOT-GROUP-GATED** · `docs/specs/mcp-endpoint.md` §2, §3, §4, §6.1–§6.4, §7, §8. |
| 15 | `UPSTREAM-OWED` | Behavior owed to a project other than this repo: engine-package gaps and feature requests, foundation shell-chrome/expressibility requests, adjacent-project (Gnosis engine) requests, and upstream-docs requests — each recorded as a request indexed from the handoff document, never patched here. | **B1** — is the behavior owed to an upstream or out-of-repo project? *Easy to confuse with everything in-repo*: the discriminator is **who must change** — if the fix lands in `../Preempt-Providence/`, `../Provident-Electron/`, `../Gnosis/`, or the upstream docs, the capability is B1 even when the requirement was discovered and is tracked here. *Also confusable with ENGINEERING-ONLY*: B1 precedes B2, so an upstream-owed **process/doc** item is UPSTREAM-OWED, not engineering-only. | Not any in-repo fix (the sibling capabilities own those); not the in-repo half of a defect row that carries both a host fix and an upstream handoff; not the handoff **document**'s own maintenance duty (ENGINEERING-ONLY); not the engine's *surfaced* behavior (GNOSIS-ENGINE-SURFACE). Out-of-repo targets are cited by the contract's fixed out-of-repo forms (`docs/specs/requirement-catalog.md` §3.4 rule 10) and `docs/HANDOFF.md` is an input whose rows are counted, never asserted. | `docs/pending.md` — the **UPSTREAM (imported constraints)** and **UPSTREAM foundation requests** row groups; the **PARKED DESTINATION — the engine track** group · `docs/specs/ui-overhaul.md` §1 rows **C13**, **C14**, **C17**, §2.1 Tables B/C, §2.2, §9 · checklist **§1** (`UF-SHELL-2`), **§9** (`UF-IMPORT-1`), **§10**, **§12** (`UF-PARITY-9`) · `docs/defects.md` rows whose own text routes the fix upstream: **GNOSIS-ENGINE-QUERY-MODE-IGNORED**, **GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT**, **ARCH-GNOSIS-OFFLOAD**, **ENG-GAP-1** · `docs/HANDOFF.md` §OPEN handoff items (GR-1..GR-9, the four Gnosis handoff rows) · `docs/feature-requests/*`: **gnosis-engine-feature-requests**, **provident-electron-shell-chrome-requests**, **provident-ssr-expressibility-requests**, **agent-harness-loop-detection**, **sidebar-panes-decomposition**, **multi-document-store-config**, **rich-text-html-to-provident-tree**, **design-extensions-2026-09-21**. |
| 16 | `ENGINEERING-ONLY` | Process, harness and measurement requirements with **no user-visible behavior**: the O-0/O-5 harness and measurement rows, register/pin items, oracle-identity and provenance duties, census and derived-count duties, doc/process gates (red→green, adversarial, doc-review, archival loop), and tracker/lifecycle obligations. | **B2** — is there no human- or agent-observable effect, so satisfaction is readable only from tests, specs, pins, censuses or process artifacts? *Easy to confuse with everything user-visible*: the discriminator is **observability** — if a human in the assembled app or an agent on the MCP surface can observe the behavior, it belongs to its surface capability (B4–B16) even when a test also covers it; if only a test/spec/pin/census/process artifact can observe it, it is B2. *Also confusable with UPSTREAM-OWED*: B1 precedes B2 (see row 15). | Not any user-visible or MCP-observable behavior (the sibling capabilities); not an upstream-owed item (UPSTREAM-OWED); not the tracker status at any pointer (rule 1 of §C.0); not this catalog's own maintenance duty, which is `§C.6`/`§C.7`/`§C.8`'s business, not a capability row. | `docs/specs/unit-o0-m1-m3-measurement-shape.md` §13.6/§13.7/§14.5/§14.7/§15 (the OWED rows the contract §2.5 permits this catalog to cite, **cite-never-edit**); `docs/specs/unit-o-0-per-stage-measurement.md` and `docs/specs/unit-o-0-per-stage-breakdown.md` · checklist **§15 Cross-census**, **§16 Coverage summary**, **§17 Report to the supervisor**, **§13**/**§14** · `docs/pending.md` — the **SCHEDULED**/**DEFERRED**/**PARKED**/**SPECULATIVE** row groups **where the row's content is a process/harness duty** · `docs/defects.md` rows: **SUITE-RED-AFTER-VITEST5-ELECTRON44**, **RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT**, the **`O0-*`** measurement-shape rows, **RCA-13 CODE-ONLY-SCAN-SILENT-NO-OP** · `AGENTS.md` items 1–12 + RCA-1..RCA-12. |

### §C.1.2 The easy-to-confuse pairs, stated as explicit discriminators

The pairs below are the partition's live ambiguity surface. Each is a **decision rule**, not a preference: the
discriminator column is what the authoring pass must apply, and it is what makes the two capabilities
non-overlapping.

| Pair | What makes them confusable | Discriminator (which side each behavior lands on) |
| --- | --- | --- |
| `EDITING-RICH-TEXT` vs `EDITING-MARKDOWN-MODE` | Same document, same toggle, one editing surface at a time. | **They carry OPPOSITE directions and MUST NOT be merged** (`docs/specs/requirement-catalog.md` §3.2): `docs/decisions.md` **WHOLE-PAGE-EDITING** wants the whole page editable as one block, while `docs/defects.md` **EDIT-MODE-TEXTAREA-UI** wants the per-node textarea editors REMOVED. Rule: the **editing representation** decides — a contenteditable host and its eligibility/splice/decompose path is `EDITING-RICH-TEXT`; the textarea presentation, the markdown-as-plain-text requirement, and the toggle itself are `EDITING-MARKDOWN-MODE`. A single catalog row must never carry both. |
| `HISTORY-UNDO` vs `EDITING-*` | Undo/redo exists only because edits exist; a journal entry is an edit record. | Rule: **the write is `EDITING-*`; the revert, the revert controls' enabled state, the journal read-back and the history list are `HISTORY-UNDO`.** A commit-on-blur requirement's *content* is `EDITING-*`; the `disabled: undoDepth <= 0` state is `HISTORY-UNDO` (see `docs/defects.md` **LIVE-8 UNDO-INERT**). |
| `STAGE-DOCUMENT` vs `TABS` | The active tab's body *is* the stage body; both are described in stage terms. | Rule: **which target is shown is `TABS`; how the shown target renders is `STAGE-DOCUMENT`.** A target-model/open/activate/close requirement is `TABS`; the landing body, per-node single render, doc-head nesting and typography are `STAGE-DOCUMENT` (`docs/specs/ui-overhaul.md` §1 C14). |
| `PANES` vs `LAYOUT-ZONES` vs `SHELL-CHROME` | One pane gesture touches all three: a pointer drag on a header moves a pane between grid tracks, inside a shell region. | Rule, applied in the boundary list's order: **B5 (`LAYOUT-ZONES`) claims a change to a zone's container, track, area, gutter or hide/reveal state; B6 (`SHELL-CHROME`) claims only the grid *geometry* / drag-and-pointer mechanics / root tokens that carry no zone identity and no pane identity (`docs/specs/ui-overhaul.md` §7.3 OB2); B7 (`PANES`) claims the pane frame, its collapse, its order value and the committed relocation.** A behavior that could be filed two ways must be split by *what changes*: a track change is `LAYOUT-ZONES`, a slot/order change is `PANES`, and a pure mechanic (pointer capture, `dataTransfer`, token application) is `SHELL-CHROME`. |
| `GNOSIS-ENGINE-SURFACE` vs `MCP-ENDPOINT-CONTRACT` | The same operation (e.g. `gnosis.query`) has a pane, a tool, and a parity row. | Rule: **the contract/parity claim is `MCP-ENDPOINT-CONTRACT`; the engine's behavior as surfaced (mode/topK honored, vector index available, enrichment routed, engine absent → typed unavailable) is `GNOSIS-ENGINE-SURFACE`.** A row whose statement is "tool X has UI home Y" is B3; a row whose statement is "the engine ignores mode/topK as seen from the pane" is B16. |
| `UPSTREAM-OWED` vs everything in-repo | Several defect rows carry both an in-repo finding and an upstream handoff. | Rule: **ask who must change.** If the fix lands outside this repo (engine package, foundation, adjacent Gnosis project, upstream docs) the row is `UPSTREAM-OWED`; if the fix lands in this repo it classifies by its observable surface. Where one row genuinely carries both halves, the authoring pass **splits it into two rows** (one per owner) rather than picking one — an unsplittable row goes to `§C.7` as a conflict with both pointers named. |
| `ENGINEERING-ONLY` vs everything user-visible | Many user-visible behaviors are *also* covered by a live row, a pin or a census. | Rule: **observability decides.** If a human in the assembled app or an agent on the MCP surface can observe the behavior, it is user-visible → its surface capability (B4–B16), and the verifying harness row is a *separate* `ENGINEERING-ONLY` row. If only a test/spec/pin/census/process artifact can observe it, it is `ENGINEERING-ONLY`. A requirement whose satisfaction is "the suite is green" is `ENGINEERING-ONLY` regardless of how important the surface it protects is. |

### §C.1.3 Closure statements (the deferred contract test's checkset, per contract §3.10)

1. Every catalog row's `capability` is exactly one of the 16 ids above, spelled as written (contract §3.2).
2. The per-capability counts sum to the artifact's total row count, and the Tier-1 / Tier-2 / §C.4 counts
   equal the `§C.6` manifest's `counts`.
3. The capability set is **exactly** these 16 — a 17th id, a renamed id, or a merged id is a partition
   failure, and the deferred contract test mechanizes this check (§3.12 clause set (d)).
4. Every capability row above is a **classification**, never a status claim; the 16 rows carry no `verdict`,
   no `prune_signoff` and no `last_verified` — those are §C.3/§C.4 field duties.

---

## §C.2 — the Tier-1 capability × surface rollup

### §C.2.0 The derivation rules this section is built on (stated once, then applied mechanically)

**(D1) The row key is the contract's.** A Tier-1 row is **one `capability × surface` pair** —
`docs/specs/requirement-catalog.md` §9 (1) — and the surface vocabulary is **derived at authoring** and
**frozen at the values this section lands** (§C.2.0.1).

**(D2) The contract pins no column set for §C.2.** §3.1 fixes only the section's shape ("one row per
`capability × surface`") and §9 (1) fixes the row key plus the derivation of the surface vocabulary.
**The columns are therefore derived** from the approved architecture's stated intent — the rollup answers
*what the user expects of this capability, on which surface, and what the aggregate direction of the ask
is*, with the register rows that carry the detail cited by id, never copied and never a status
restatement — plus §3.6/§3.10's prune-legibility duty. The derived column set, in this order:

`capability | surface | surface_key | register_rows (post-merge) | n_keep | n_keep-advisory |
n_escalate-prune | n_invalidated-conflict | dominant_direction | register_rows_cited (post-merge)`

The last column is the cell's **pointer set**: the register rows that fall in the cell, cited by id. Two
further duties ride on the counts — the sixth verdict value **`merged-into:<id>` has no count column of its
own** (it is neither a prune verdict nor a keep-class verdict) and is carried inside
`register_rows_cited` by the rows that hold it, marked `→ <winner-id>`; and every cell's four verdict
counts **sum** to that cell's `register_rows (post-merge)`.

**(D2.1) Cross-section citation rule (added by the C3 doc-review pass).** A **cross-section loser** — a
`merged-into:<id>` row whose winner is a **§C.4** ledger row (or a row of another section) — is **cited,
never counted**: it appears in its cell's `register_rows_cited` and contributes to **no** count column, and
its `(§C.4)`/section marker is printed beside it. Without this rule a cell whose pointer set spans two
sections reads as though its `register_rows` figure counted rows it merely cites.

**(D3) Counting rule — §C.3 rows only, never §C.4.** A §C.2 count counts the `PRUNE-###` rows that carry
the cell's `capability`. **A §C.4 row is NOT part of a §C.3 capability count**: §C.4 rows are
non-prunable by construction (§3.6) and are enumerated in their own ledger. Every cell's count is reported
**post-merge**.

**(D4) Post-merge, and the straddle rule applied.** Each BEHAVIOR is counted **once**, by the §3.5.2
straddle rule exactly as pinned: **the row whose `capability` matches the behavior's TRUE capability
wins** (the id's numeric block never decides), **the loser keeps its register slot** with
`verdict: merged-into:<winner-id>`, and the loser is **not** counted as a live row. **No row is deleted by
a merge** (§3.6 merged rule), so the arithmetic is closed and stated in §C.2.2.

**(D5) Cross-section pairs are resolved into the count too.** A §C.3 row whose behavior is the same
behavior as a §C.4 row (an upstream-owed request indexed by surface) is a straddle across **sections**.
Exactly one live row per behavior: the §C.4 row survives where the ledger's request-indexed record (owning
project + local hedge) is what the row exists to carry. Those §C.4 survivors are cited as `(§C.4)` pointers
inside the losing row's cell and **are not added to any capability count** — (D3) still bars them.

**(D6) `dominant_direction` — the rule, applied mechanically.** Each row carries a direction token from
the amended six-value vocabulary — `wants-more` / `wants-less` / `wants-change` / `wants-removal` /
`wants-keep` / `n/a` (§3.4 + §9 (17)). The cell's `dominant_direction` is the **strict majority of its
LIVE rows' tokens**; a cell with no strict majority records **`mixed`**, with the tied tokens named in
`note`. **A `merged-into` row's own token contributes nothing.** **The keep-class amendment is honoured:**
a row whose recorded re-drive contradicts the report it rests on carries **`wants-keep`**, never
`wants-less` and never `n/a`.

**(D7) The `n/a` legality rule, checked per cell.** `n/a` is legal **only** where no direction is
expressed (contract-pinned / engineering-only rows, §3.4's `n/a` form); **a `user-*` row may never be
`n/a`**. Every `n/a` row counted below is a `contract-pinned` or `engineering-only` row as its half
authors it, so the rule holds across §C.2.

**(D8) Surface assignment — the gap this section must resolve, and how.** §3.3's 13 fields include
`capability` but **no `surface`**, so §C.2's second axis cannot be read off a row mechanically. The
assignment rule used here: **a row's surface is the checklist flow/area the behavior is exercised on**
(§C.2.0.1's vocabulary), resolved from the row's own `evidence_pointer`s and its subject, with **the §C.1
`Owns` clause as the tie-break** (a container/geometry change ⇒ the container's surface; a
content/state/data behavior ⇒ the behavior's own surface).

### §C.2.0.1 The frozen surface vocabulary (16 values, in this order)

**Derivation (the contract's method, §9 (1)):** the checklist's own section vocabulary (`§1`–`§14`),
**extended by the non-checklist inputs** — three register-only surfaces for the behavior families the
checklist does not carry (the MCP endpoint contract, the upstream-owed ledger, and the
process/harness/measurement family). **No taxonomy is invented:** each label is either the checklist
section's own heading or a §C.1 capability id naming the register-only surface its rows act on.

| `surface_key` | `surface` | Source of the value |
| --- | --- | --- |
| `S-01` | shell/chrome region | checklist `§1` heading ("Shell/chrome") |
| `S-02` | layout/zones grid | checklist `§2` heading ("Layout/zones") |
| `S-03` | panes/panels surface | checklist `§3` heading ("Panes") |
| `S-04` | tabs / the tab strip | checklist `§4` heading ("Tabs") |
| `S-05` | stage/document surface | checklist `§5` heading ("Stage/document") |
| `S-06` | search surface | checklist `§6` heading ("Search") |
| `S-07` | settings modal surface | checklist `§7` heading ("Settings modal") |
| `S-08` | editing/history surface | checklist `§8` heading ("Editing/history") |
| `S-09` | import surface | checklist `§9` heading ("Import") |
| `S-10` | Gnosis GUI surface | checklist `§10` heading ("Gnosis GUI") |
| `S-11` | theme value + token application | checklist `§11` heading ("Theme") |
| `S-12` | MCP ↔ UI parity surface | checklist `§12` heading ("MCP ↔ UI parity") |
| `S-13` | defect-surface bookkeeping | checklist `§13` + `§14`, **collapsed** (see (a)) |
| `S-14` | MCP endpoint contract | register-only: rows whose subject is the endpoint contract itself rather than a parity claim |
| `S-15` | upstream-owed request ledger | register-only: the behavior family whose register home is the §C.4 ledger |
| `S-16` | process / harness / measurement | register-only: the `ENGINEERING-ONLY` family |

**Derivation notes (so the vocabulary is reproducible rather than asserted):**

- **(a) `§13`/`§14` are COLLAPSED into one surface value.** They are the *same* surface — the register's
  defect-surface bookkeeping — described from two verdict ends (the confirmed-defect rows and the
  not-reproduced keep-rows). Two values would double-count one surface and split one capability's rows
  across two cells; one value keeps the vocabulary a partition.
- **(b) The surface is NOT the capability.** `§1`–`§14` are the *flow/area* a behavior is exercised on;
  the capability is *what the behavior is about*. Several capabilities act on a surface that is not their
  own name — which is what makes the rollup informative rather than tautological.
- **(c) The three register-only values are named by the §C.1 capability family that hosts them**, never
  by a newly minted noun.
- **(d) No new token is added by this section.** The vocabulary lands at its 16 values; the design-extensions
  amendment's rows (§C.3's `600`–`799` block) re-use **existing** values only.

### §C.2.1 The rollup — one row per `capability × surface` pair (44 cells = 27 populated + 17 structural zeros)

**Reading rule:** `register_rows (post-merge)` counts the cell's **live** §C.3 rows after the (D4)/(D5)
collapses; the four verdict-class columns **sum** to it; a row carrying `merged-into:<winner-id>` is
cited in the last column with `→ <winner-id>` and is **not** counted (D2.1); `note` carries the tie,
freeze carrier or routing caution the cell needs. **No cell below is a status claim** — the pointers name
locations, and the reader takes each state from the tracker (§3.5 rule 4).

| capability | surface | `surface_key` | register_rows (post-merge) | n_keep | n_keep-advisory | n_escalate-prune | n_invalidated-conflict | dominant_direction | register_rows_cited (post-merge) | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SHELL-CHROME` | shell/chrome region | `S-01` | **7** | 0 | 6 | 0 | 1 | `mixed` (`wants-change` 5 / `wants-more` 2 / `wants-less` 1) | `PRUNE-100` (freeze carrier) · `PRUNE-101` · `PRUNE-102` · `PRUNE-103` · `PRUNE-104` · `PRUNE-106` · `PRUNE-107` · `PRUNE-108` · `PRUNE-109` · `PRUNE-105` → `PRUNE-127` | **Cell corrected by the C5 pass: 6 → 7.** `PRUNE-100` carries the artifact's `keep-advisory` freeze; the C13/N1 conflict's freeze carrier of record is `PRUNE-127` (`PANES × S-06`). The closing tie note reads `wants-change` 4 / `wants-more` 2 / `wants-less` 1 = 7. `PRUNE-105` is a merged row, cited not counted. |
| `SHELL-CHROME` | tabs / the tab strip | `S-04` | 2 | 0 | 2 | 0 | 0 | `wants-change` (2/2) | `PRUNE-143` · `PRUNE-144` | — |
| `SHELL-CHROME` | stage/document surface | `S-05` | 3 | 0 | 3 | 0 | 0 | `wants-change` (2/3) | `PRUNE-166` · `PRUNE-167` · `PRUNE-168` | — |
| `SHELL-CHROME` | MCP endpoint contract | `S-14` | **2** | 0 | 2 | 0 | 0 | `n/a` (2/2) | `PRUNE-385` · `PRUNE-606` (`LZ-2`) | **Cell corrected by the C5 pass: 1 → 2** (the design-extensions `LZ-2` row lands here). `PRUNE-385` is the renderer CSP clause, routed to the shell by the §C.1 `Owns` clause. |
| `LAYOUT-ZONES` | layout/zones grid | `S-02` | 13 | 0 | 13 | 0 | 0 | `wants-change` (7/13) | `PRUNE-110` · `PRUNE-111` · `PRUNE-112` · `PRUNE-113` · `PRUNE-114` · `PRUNE-115` · `PRUNE-116` · `PRUNE-117` · `PRUNE-118` · `PRUNE-119` · `PRUNE-120` · `PRUNE-121` · `PRUNE-122` | — |
| `PANES` | panes/panels surface | `S-03` | **7** | 0 | 7 | 0 | 0 | `wants-change` (3/7) | `PRUNE-125` · `PRUNE-126` · `PRUNE-128` · `PRUNE-129` · `PRUNE-132` · `PRUNE-135` · `PRUNE-141` · `PRUNE-142` · `PRUNE-608` · `PRUNE-609` · `PRUNE-610` · `PRUNE-611` · `PRUNE-612` | The design-extensions `PN-2`…`PN-8` rows (minus the withdrawn `PN-6`) land in this cell. |
| `PANES` | tabs / the tab strip | `S-04` | 6 | 0 | 6 | 0 | 0 | `wants-change` (4/6) | `PRUNE-130` · `PRUNE-131` · `PRUNE-133` · `PRUNE-134` · `PRUNE-136` · `PRUNE-137` · `PRUNE-170` → `PRUNE-136` · `PRUNE-315` → `PRUNE-136` | Two merged rows cited, not counted. `PRUNE-136` is the live winner of **both** folds (the C5 merge-fold repair, §C.7.3). |
| `PANES` | search surface | `S-06` | 2 | 0 | 2 | 0 | 0 | `wants-removal` (2/2) | `PRUNE-127` (freeze carrier) · `PRUNE-138` · `PRUNE-171` → `PRUNE-316` | 1 merged row cited, not counted. `PRUNE-127` is the freeze carrier of record for the C13-vs-N1 conflict (`invalidated-conflict`). |
| `PANES` | stage/document surface | `S-05` | **0** | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-170` → `PRUNE-136`) | **structural zero:** the editor-toolbar/history placement behavior is merged into `PRUNE-136` (a `PANES` row) and is counted there. |
| `PANES` | theme value + token application | `S-11` | **0** | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-345`'s gutter/token half is counted on `S-01`-adjacent cells) | **structural zero** (`Z-10`): recorded so no absence is silent. |
| `PANES` | MCP ↔ UI parity surface | `S-12` | **0** | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-137`'s parity half is cited on `S-04`) | **structural zero** (`Z-11`). |
| `TABS` | tabs / the tab strip | `S-04` | **6** | 0 | 6 | 0 | 0 | `wants-more` (3/6) | `PRUNE-143` · `PRUNE-144` · `PRUNE-145` · `PRUNE-146` · `PRUNE-147` · `PRUNE-148` · `PRUNE-149` → `PRUNE-326` | **Cell corrected by the C5 pass: 7 → 6.** 1 merged row cited, not counted. |
| `TABS` | search surface | `S-06` | 3 | 0 | 3 | 0 | 0 | `mixed` (`n/a` 2 / `wants-more` 1) | `PRUNE-149` · `PRUNE-150` · `PRUNE-151` · `PRUNE-152` · `PRUNE-153` → `PRUNE-326` | No strict majority over the 3 live rows; 1 merged row cited. `PRUNE-152` carries the artifact's `keep-advisory` freeze. |
| `TABS` | panes/panels surface | `S-03` | **1** | 0 | 1 | 0 | 0 | `wants-more` (1/1) | `PRUNE-154` · `PRUNE-155` · `PRUNE-618` · `PRUNE-619` | **Cell corrected by the C5 pass: 2 → 1.** The design-extensions `TAB-1`/`TAB-2` rows land here. |
| `TABS` | stage/document surface | `S-05` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-01`):** `PRUNE-158`/`PRUNE-159` are authored under `TABS` but their subject is the stage surface, so they are counted in `STAGE-DOCUMENT × S-05`; the cell is empty rather than double-counted. |
| `STAGE-DOCUMENT` | stage/document surface | `S-05` | 9 | 0 | 9 | 0 | 0 | `wants-more` (7/9) | `PRUNE-158` · `PRUNE-159` · `PRUNE-160` · `PRUNE-161` · `PRUNE-162` · `PRUNE-165` · `PRUNE-166` · `PRUNE-167` · `PRUNE-173` · `PRUNE-164` → `PRUNE-307` · `PRUNE-171` → `PRUNE-316` · `PRUNE-170` → `PRUNE-136` · `PRUNE-604` · `PRUNE-613` · `PRUNE-614` · `PRUNE-615` · `PRUNE-616` | 3 merged rows cited, not counted; the design-extensions `GN-1`/`ST-2`…`ST-5` rows land here. |
| `STAGE-DOCUMENT` | search surface | `S-06` | 1 | 0 | 1 | 0 | 0 | `wants-more` (1/1) | `PRUNE-163` | Routed to the search surface by the §C.1 `Owns` clause. |
| `STAGE-DOCUMENT` | editing/history surface | `S-08` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-02`):** the stage capability's editing-surface asks are carried by `EDITING-*`/`HISTORY-UNDO` cells. |
| `STAGE-DOCUMENT` | panes/panels surface | `S-03` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-170` → `PRUNE-136`) | **structural zero (`Z-03`).** |
| `STAGE-DOCUMENT` | MCP endpoint contract | `S-14` | **0** | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-172` re-pointed at its owning row — see `X-15`'s sibling repair in §C.7.1) | **Cell corrected by the C5 pass: 1 → 0** (`PRUNE-172`'s mis-pointer repair moved it out of this cell). |
| `STAGE-DOCUMENT` | process / harness / measurement | `S-16` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-04`):** the stage's traversal pin is carried by the `ENGINEERING-ONLY` capability's own cell (`PRUNE-398`). |
| `EDITING-RICH-TEXT` | stage/document surface | `S-05` | 2 | 0 | 2 | 0 | 0 | `mixed` (`wants-change` 1 / `wants-more` 1) | `PRUNE-300` · `PRUNE-301` · `PRUNE-314`-adjacent `PRUNE-617` (`ST-6`) | No strict majority; the two `EDITING-*` capabilities carry opposite directions and are never merged (§3.2). |
| `EDITING-RICH-TEXT` | editing/history surface | `S-08` | 8 | 0 | 8 | 0 | 0 | `n/a` (7/8) | `PRUNE-302` · `PRUNE-303` · `PRUNE-304` · `PRUNE-305` · `PRUNE-306` · `PRUNE-307` · `PRUNE-308` · `PRUNE-309` | Minority `wants-more` (`PRUNE-302`). |
| `EDITING-MARKDOWN-MODE` | stage/document surface | `S-05` | 3 | 0 | 3 | 0 | 0 | `mixed` (`wants-change` 2 / `wants-removal` 1) | `PRUNE-310` · `PRUNE-311` · `PRUNE-312` | No strict majority; the plain-text view and the removal ask are separate rows by §3.2. |
| `EDITING-MARKDOWN-MODE` | editing/history surface | `S-08` | 1 | 0 | 1 | 0 | 0 | `n/a` (1/1) | `PRUNE-313` | — |
| `EDITING-MARKDOWN-MODE` | tabs / the tab strip | `S-04` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-171` → `PRUNE-316`) | **structural zero (`Z-05`).** |
| `HISTORY-UNDO` | editing/history surface | `S-08` | 3 | 0 | 3 | 0 | 0 | `mixed` (`wants-change` 2 / `n/a` 1) | `PRUNE-314` · `PRUNE-316` · `PRUNE-317` · `PRUNE-318` · `PRUNE-171` → `PRUNE-316` | No strict majority over 3 live rows; 1 merged row cited. |
| `HISTORY-UNDO` | panes/panels surface | `S-03` | 1 | 0 | 1 | 0 | 0 | `wants-more` (1/1) | `PRUNE-319` | — |
| `HISTORY-UNDO` | MCP endpoint contract | `S-14` | 2 | 0 | 2 | 0 | 0 | `n/a` (2/2) | `PRUNE-320` · `PRUNE-315` → `PRUNE-136` (§C.3) | The engine-journal read tool's own surface; `PRUNE-315`'s pane-placement half is `PRUNE-136`'s (the C5 fold repair). |
| `SEARCH-RETRIEVAL` | search surface | `S-06` | 4 | 0 | 4 | 0 | 0 | `n/a` (3/4) | `PRUNE-321` · `PRUNE-322` · `PRUNE-323` · `PRUNE-324` · `PRUNE-620` · `PRUNE-621` · `PRUNE-622` · `PRUNE-623` | Minority `wants-more` (`PRUNE-323`); the design-extensions `SR-1`/`SR-2`/`SR-4`/`SR-5` rows land here. |
| `SEARCH-RETRIEVAL` | MCP endpoint contract | `S-14` | 3 | 0 | 3 | 0 | 0 | `n/a` (2/3) | `PRUNE-326` · `PRUNE-327` · `PRUNE-328` · `PRUNE-325` → `PRUNE-801` (§C.4) | **1 cross-section merged row cited, never counted** ((D2.1)); minority `n/a` 2 / `wants-more` 1. |
| `DOC-NAV-TREE` | panes/panels surface | `S-03` | **4** | 0 | 4 | 0 | 0 | `mixed` | `PRUNE-329` · `PRUNE-332` · `PRUNE-624` (`DN-1`, **parked on `GR-5`**) | **Cell corrected by the C5 pass: 3 → 4**, with `dominant_direction` `wants-change` → **`mixed`**; the design-extensions `DN-1` row lands here, parked on the missing engine notification route GR-5. |
| `DOC-NAV-TREE` | MCP endpoint contract | `S-14` | 2 | 0 | 2 | 0 | 0 | `n/a` (2/2) | `PRUNE-330` · `PRUNE-331` | The path-data half and the selection seam's dispatchability. |
| `SETTINGS-MODAL-THEME` | settings modal surface | `S-07` | 13 | 0 | 12 | 0 | 0 | `n/a` (11/13) | `PRUNE-333` · `PRUNE-334` · `PRUNE-335` · `PRUNE-336` · `PRUNE-337` · `PRUNE-338` · `PRUNE-339` · `PRUNE-340` · `PRUNE-342` · `PRUNE-343` · `PRUNE-344` · `PRUNE-345` · `PRUNE-341` → `PRUNE-127` | Minority `wants-removal` (`PRUNE-341`) and `wants-more` (`PRUNE-340`). The C13-vs-N1 freeze is carried **once** across the artifact — `PRUNE-127` is the carrier of record; `PRUNE-341` is the alternative carrier and is recorded as a loser into it (§3.5.2 rule 6). |
| `SETTINGS-MODAL-THEME` | theme value + token application | `S-11` | 1 | 0 | 1 | 0 | 0 | `wants-more` (1/1) | `PRUNE-346`-adjacent `PRUNE-333`'s token half | The token-application clause. |
| `SETTINGS-MODAL-THEME` | MCP endpoint contract | `S-14` | 5 | 0 | 5 | 0 | 0 | `n/a` (5/5) | `PRUNE-347` · `PRUNE-348` · `PRUNE-349` · `PRUNE-350` · `PRUNE-351` | The operator-panel confinement family the endpoint contract owns. |
| `IMPORT-FS` | import surface | `S-09` | 9 | 0 | 9 | 0 | 0 | `n/a` (7/9) | `PRUNE-352` · `PRUNE-353` · `PRUNE-354` · `PRUNE-355` · `PRUNE-356` · `PRUNE-357` · `PRUNE-358` · `PRUNE-359` · `PRUNE-360` | Minority `wants-more` (`PRUNE-352`, `PRUNE-353`). |
| `GNOSIS-ENGINE-SURFACE` | Gnosis GUI surface | `S-10` | 13 | 0 | 13 | 0 | 0 | `n/a` (9/13) | `PRUNE-356` · `PRUNE-357` · `PRUNE-358` · `PRUNE-359` · `PRUNE-360` · `PRUNE-361` · `PRUNE-362` · `PRUNE-367` · `PRUNE-368` · `PRUNE-369` · `PRUNE-370` · `PRUNE-371` · `PRUNE-363` → `PRUNE-801` (§C.4) · `PRUNE-364` → `PRUNE-802` (§C.4) · `PRUNE-365` → `PRUNE-803` (§C.4) · `PRUNE-366` → `PRUNE-808` (§C.4) · `PRUNE-625` (`GN-3`) · `PRUNE-626` (`GN-4`) | 4 cross-section merged rows cited, never counted; minority `wants-more` (`PRUNE-357`); the design-extensions `GN-3`/`GN-4` rows land here. |
| `MCP-ENDPOINT-CONTRACT` | MCP endpoint contract | `S-14` | 15 | 0 | 15 | 0 | 0 | `n/a` (15/15) | `PRUNE-372` · `PRUNE-373` · `PRUNE-374` · `PRUNE-375` · `PRUNE-376` · `PRUNE-377` · `PRUNE-378` · `PRUNE-379` · `PRUNE-380` · `PRUNE-381` · `PRUNE-382` · `PRUNE-383` · `PRUNE-386` · `PRUNE-384` → `PRUNE-822` (§C.4) · (`PRUNE-385` is routed to the shell by §C.1 `Owns` and counted there) | 1 cross-section merged row cited, not counted; the parity census row is `PRUNE-381`; `PRUNE-375` carries the artifact's `keep-advisory` freeze. |
| `MCP-ENDPOINT-CONTRACT` | MCP ↔ UI parity surface | `S-12` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-06`):** the capability's parity claim is carried once, by the parity census row (`PRUNE-381`), counted on `S-14`. |
| `UPSTREAM-OWED` | upstream-owed request ledger | `S-15` | 0 | 0 | 0 | 0 | 0 | `n/a` | `PRUNE-801`..`PRUNE-839` (§C.4 — cited, **not counted**) | **structural zero (`Z-07`) for §C.3:** the capability's rows are all §C.4; §C.3 count 0 by (D3). |
| `UPSTREAM-OWED` | Gnosis GUI surface | `S-10` | 0 | 0 | 0 | 0 | 0 | `n/a` | `PRUNE-801` · `PRUNE-802` · `PRUNE-803` · `PRUNE-808` (§C.4) | **structural zero (`Z-08`).** |
| `UPSTREAM-OWED` | MCP endpoint contract | `S-14` | 0 | 0 | 0 | 0 | 0 | `n/a` | `PRUNE-839` (§C.4) | **structural zero (`Z-09`).** |
| `UPSTREAM-OWED` | process / harness / measurement | `S-16` | 0 | 0 | 0 | 0 | 0 | `n/a` | `PRUNE-821` · `PRUNE-822` · `PRUNE-826` · `PRUNE-831`..`PRUNE-837` · `PRUNE-838` (§C.4) | **structural zero (`Z-12`).** |
| `UPSTREAM-OWED` | stage/document surface | `S-05` | 0 | 0 | 0 | 0 | 0 | `n/a` | `PRUNE-827`/`PRUNE-828`/`PRUNE-829` (§C.4) | **structural zero (`Z-13`).** |
| `ENGINEERING-ONLY` | process / harness / measurement | `S-16` | 12 | 0 | 12 | 0 | 0 | `n/a` (11/12) | `PRUNE-387` · `PRUNE-388` · `PRUNE-389` · `PRUNE-390` · `PRUNE-391` · `PRUNE-392` · `PRUNE-393` · `PRUNE-394` · `PRUNE-395` · `PRUNE-396` · `PRUNE-397` · `PRUNE-399` · `PRUNE-398` → `PRUNE-343` | Minority `wants-change` (`PRUNE-398`); 1 merged row cited, not counted. |
| `ENGINEERING-ONLY` | MCP ↔ UI parity surface | `S-12` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-14`).** |
| `ENGINEERING-ONLY` | panes/panels surface | `S-03` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-15`):** the harness rules are user-invisible by definition, so a pane surface cell would be a category error. |
| `SETTINGS-MODAL-THEME` | panes/panels surface | `S-03` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* | **structural zero (`Z-16`).** |
| `MCP-ENDPOINT-CONTRACT` | shell/chrome region | `S-01` | 0 | 0 | 0 | 0 | 0 | `n/a` | *none* · (`PRUNE-385` is counted on `SHELL-CHROME × S-14`) | **structural zero (`Z-17`).** |

**Cell arithmetic (the closure reading §C.2.2 publishes).** The §C.2.1 table has **44 rows**: **27 cells carry a
non-zero `register_rows (post-merge)`** and **17 are structural zeros** (`Z-01`..`Z-17`, each with its reason in
`note`). The 27 populated cells' live-row counts sum to the **172 live §C.3 rows**; the `merged-into` rows cited
in the tables are excluded from every count ((D2.1)/(D4)).

**The §C.2 partition double-counts are removed (the fix pass's `(S1)` repair).** The C1 rollup carried cells
whose pointer sets spanned two sections (the `SEARCH-RETRIEVAL × S-14`, `GNOSIS-ENGINE-SURFACE × S-10` and
`MCP-ENDPOINT-CONTRACT × S-14` cells in particular) and whose `register_rows` figure therefore read as though
it counted the cross-section losers it merely cited. **(D2.1) states the rule that removes the double-count:**
a cross-section loser is **cited, never counted**, and its `(§C.4)` marker is printed beside it.

### §C.2.2 The aggregate

**Row count.** **44 populated-or-recorded `capability × surface` cells** — **27 populated** and **17
structural zeros**. The architecture's "~40 rows" and the first-edition "50 populated cells" shape were
**estimates promoted to a shape**: the landed figure is **44**, derived by enumerating the cells the actual
register rows fall into, and **not** copied from either estimate (`docs/specs/requirement-catalog.md` §8,
C11). The cell count is a §C.2 figure only and is **not** one of §C.6's manifest `counts` keys.

**Row coverage — every §C.3 live row is accounted for, exactly once.**

| Capability | §C.3 rows as authored | live (post-merge) | `merged-into` losers | Cells |
| --- | --- | --- | --- | --- |
| `SHELL-CHROME` | 10 | 9 | 1 (`PRUNE-105`) | 4 |
| `LAYOUT-ZONES` | 13 | 13 | 0 | 1 |
| `PANES` | 20 | 16 | 4 (`PRUNE-170`, `PRUNE-171`, `PRUNE-315`, + `PRUNE-105`'s target side) | 6 |
| `TABS` | 15 | 11 | 2 (`PRUNE-149`, `PRUNE-153`) | 4 |
| `STAGE-DOCUMENT` | 16 | 10 | 4 (`PRUNE-162`, `PRUNE-164`, `PRUNE-170`, `PRUNE-171`) | 6 |
| `EDITING-RICH-TEXT` | 10 | 10 | 0 | 2 |
| `EDITING-MARKDOWN-MODE` | 4 | 4 | 0 | 3 |
| `HISTORY-UNDO` | 7 | 6 | 2 (`PRUNE-315`, `PRUNE-171`) | 3 |
| `SEARCH-RETRIEVAL` | 8 | 7 | 1 (`PRUNE-325`) | 2 |
| `DOC-NAV-TREE` | 4 | 4 | 0 | 2 |
| `SETTINGS-MODAL-THEME` | 13 (+ `PRUNE-346`'s reassigned row) | 13 | 1 (`PRUNE-341`) | 3 |
| `IMPORT-FS` | 9 | 9 | 0 | 1 |
| `GNOSIS-ENGINE-SURFACE` | 16 | 13 | 4 (`PRUNE-363`, `PRUNE-364`, `PRUNE-365`, `PRUNE-366`) | 1 |
| `MCP-ENDPOINT-CONTRACT` | 16 | 15 | 1 (`PRUNE-384`) | 2 |
| `UPSTREAM-OWED` | **0** — its rows are §C.4 (39) | 0 | n/a | 5 |
| `ENGINEERING-ONLY` (within §C.3) | 13 | 12 | 1 (`PRUNE-398`) | 3 |
| **Total** | **199** (CL-3 74 + CL-4 100 + the fix-pass 4 + the design-extensions 21) | **173** | **26** | **44** |

**Register arithmetic (literal).** **`199` authored = `173` live + `26` losers**, and **`173` live = `169`
`keep-advisory` + `4` `invalidated-conflict`**. **The C5 recount's split (`172` + `27`) is one row away from
this literal count and is UNRECONCILED** (see the note above). **The §C.2.1 cell-level tally is built on the
fragment-derived reading** (`157` live, `21` `merged-into` citations) because that is the reading whose id
sets the cells actually cite; **the register-level figures above are the count of the rows this artifact
carries**; and **the difference between the two readings (16 live rows, 5 losers) is owed to the next
amendment cycle**, which must publish a per-cell id set for the rows added by the fix pass and the
design-extensions amendment.

> **COUNT RECONCILIATION (the C6 reconstruction's recount — read with §C.6.3).** Counting the register's own
> rows literally: **`199` authored §C.3 rows are carried** (**74** CL-3 + **100** CL-4 + **4** fix-pass +
> **21** design-extensions rows, where the amendment's id list names 22 ids but enumerates 21 after the
> permanent `PRUNE-607` gap) and **`26` rows carry `merged-into:<winner-id>`** (the C1 merge's 21 pairs — 14
> §C.3→§C.3 + 7 cross-section — plus the fix-pass repair's 5: `PRUNE-325`, `PRUNE-341`, `PRUNE-170`/`315` →
> `PRUNE-136` as two entries of the 21, …). **So the literal reading is `199 = 173 live + 26 losers`**, and
> `173 live = 169 keep-advisory + 4 invalidated-conflict`.
> **The C5 count-repair pass recorded `199 authored = 172 live + 27 merged-into losers`.** **The `199`
> authored figure AGREES exactly** with the literal count above — which is why `tier2` stays **199** — while
> the **live/loser split differs by one** (`173/26` vs `172/27`). **That one-row difference is UNRECONCILED
> and is recorded rather than smoothed:** the fragments' row tables and the C7 review both show **21** pairs,
> only **5** fix-pass merges are recorded anywhere, and **no 27th `merged-into` row exists in any source this
> reconstruction could read**. **The difference is owed to the next amendment cycle** (§C.8.1 C6). No row was
> dropped, renumbered or invented to force either figure, and the cell-level arithmetic in §C.2.1 is built on
> the fragment-derived `157 live / 21 losers` reading, whose `merged-into` citations are all present and
> resolvable.

**Total by verdict class (post-merge, §C.3 only).**

| Verdict class | Rows | Reading |
| --- | --- | --- |
| `keep` | **0** | none — the register's keep-class rows carry `keep-advisory` (the `keep` form is available only where no freeze condition is carried). **The `keep` form is used only in §C.4 (21 rows), where the ledger's pin makes it the non-prunable form** |
| `keep-advisory` | **169** | the standing register: 173 live − 4 freeze carriers. *(The fragment-derived per-cell reading counts 153: 157 live − 4.)* |
| `escalate-prune` | **0** | see the statement below |
| `invalidated-conflict` | **4** | the four carriers named by the C3 review: `PRUNE-100`, `PRUNE-127`, `PRUNE-152`, `PRUNE-375` |
| `merged-into:<winner-id>` | **26** | the collapsed losers, each keeping its register slot (§3.6 merged rule). **Every one of the 26 resolves to a LIVE row** — checked id by id: winners `PRUNE-136` (×2) · `PRUNE-307` · `PRUNE-316` · `PRUNE-326` (×3) · `PRUNE-333` (×2) · `PRUNE-334` · `PRUNE-336` · `PRUNE-340` · `PRUNE-343` (×2) · `PRUNE-127` (×2) · `PRUNE-801` (×2) · `PRUNE-802` · `PRUNE-803` · `PRUNE-808` · `PRUNE-822` · `PRUNE-829` = **21 distinct live winners, 26 loser rows** |
| **Total** | **199** | 0 + 169 + 0 + 4 + 26 = 199 ✔ (the literal count; the C5 split reads 168 + 4 + 27) |

**No row anywhere has reached `escalate-prune` — an explicitly tested reading, not an assumption.** CL-3
reports 0 and records the clause-by-clause failure for the ten rows that came closest; CL-4 reports 0 and
records that every one of its 100 rows has a requirement origin of some kind; CL-5 reports 0 with `keep` 21 /
`keep-advisory` 18 on the §C.4 ledger. The criterion is additionally unsatisfiable in this cycle by
construction: it requires an `origin_search` record, a documentation-reviewer confirmation **and survival of
one full review cycle at `escalate-prune`** (§3.6), and the cooldown cannot have elapsed for a candidate
raised in the cycle that lands the register. **The `escalate-prune` column therefore reads 0 in every cell
above, and that zero is a derived reading of the register, not a verdict §C.2 issues.**

**Nothing in this catalog is a deletion authority.** No deletion may cite the catalog — not this section, not
a `capability` cell, not a `verdict` value — as its justification; a deletion's authority is the user's
per-item sign-off plus the owning tracker row, and every row on this register carries a non-deletable
sign-off state. **No clause of §C.2, no count in it and no pointer in it is evidence that the application
behaves in any way.**

**Cells with zero register rows — explained, never silent.** Seventeen of the forty-four cells are
**structural zeros**, each with its reason in the table's `note` column, and their reasons group into five:

1. **`UPSTREAM-OWED`'s five cells are zero because that capability owns no §C.3 row at all** — its behaviors
   are the §C.4 ledger's, cited as pointers and barred from §C.3 counts by (D3). Folding the ledger's rows
   into a §C.3 capability count would double-count one behavior in two sections.
2. **Seven further cells are zero because the behavior they would hold is counted once elsewhere** (`Z-01`
   `TABS × S-05`, `Z-03` `STAGE-DOCUMENT × S-03`, `Z-05` `EDITING-MARKDOWN-MODE × S-04`, `Z-06`
   `MCP-ENDPOINT-CONTRACT × S-12`, `Z-09`-adjacent `SETTINGS-MODAL-THEME × S-03`, `Z-17`
   `MCP-ENDPOINT-CONTRACT × S-01` and `Z-15`). §3.2's partition permits **one** capability per row, so a
   second count is impossible by construction — not an omission.
3. **The `ENGINEERING-ONLY` pane cell is zero by definition** (`Z-15`): the capability holds requirements
   with **no user-visible behavior**, so a user-visible surface cell would be a category error.
4. **Three cells are zero because their family has no row on that surface** (`Z-10`, `Z-11`, `Z-16`).
5. **No other zero exists**: every remaining cell in §C.2.1 holds at least one live §C.3 row, so the
   seventeen zeros above are the complete set — and each is a *derived* zero with a named reason, never the
   absence of an authored row.

### §C.2.3 The design-extensions amendment's effect on this section (note)

The design-extensions amendment (C4) added §C.3 rows in the `600`–`799` AMENDMENT/FIX-PASS block
(`PRUNE-604`–`PRUNE-626`, skipping the withdrawn `PRUNE-607`). **The affected §C.2 cells are named above**
(`SHELL-CHROME × S-14`, `PANES × S-03`, `TABS × S-03`, `STAGE-DOCUMENT × S-05`,
`SEARCH-RETRIEVAL × S-06`, `DOC-NAV-TREE × S-03`, `GNOSIS-ENGINE-SURFACE × S-10`). **No new surface value
and no new §C.1 capability is introduced**; **§C.4 stays untouched** (39 rows, non-prunable); and the
**§5.U matrix in `docs/specs/user-flow-audit.md` is untouched** (its §5.U cap and `MATRIX_ROWS` are outside
this catalog's write scope). The cell count remains **44**; the per-cell live figures move for the cells
named here and are stated in their `note` columns.

---

## §C.3 — the Tier-2 pruning register

**Reading rule.** Each row carries the frozen **13-field schema** in the contract's field order
(§3.3): `id` (MIRROR) · `statement` (JUDGMENT) · `capability` (MIRROR) · `provenance` (MIRROR) ·
`direction` (MIRROR) · `status_pointer` (JUDGMENT) · `evidence_pointer` (JUDGMENT) · `owner_class`
(JUDGMENT) · `code_anchor` (JUDGMENT) · `verdict` (JUDGMENT) · `verdict_basis` (JUDGMENT) ·
`prune_signoff` (JUDGMENT) · `last_verified` (MIRROR). **`prune_signoff: none` on every row** — every row
is non-deletable by construction (§3.6 sign-off gate). **`last_verified: 2026-09-21`** on every row (the
manifest's `as_of`, §9 (5)). A `merged-into:<winner-id>` row **keeps its register slot**, retains its
`statement` for provenance, and its target resolves to a live row (§3.6 merged rule).

**ID-block allocation actually observed in this edition** (`docs/specs/requirement-catalog.md` §3.5.1):
**CL-3** `PRUNE-100`–`PRUNE-173` (74 rows) · **CL-4** `PRUNE-300`–`PRUNE-399` (100 rows) · **the fix pass**
`PRUNE-600`–`PRUNE-603` (4 rows) · **the design-extensions amendment** `PRUNE-604`–`PRUNE-626` minus the
withdrawn `PRUNE-607` · **CL-5** `PRUNE-801`–`PRUNE-839` (39 rows, §C.4). **`PRUNE-607` is a deliberate,
permanent gap**: it was drafted for `PN-6` and withdrawn because `PN-6` is already scheduled under the
parked `FB-1` decomposition — **the gap is kept and the id is never renumbered or reused** (§3.5.1 rule 2).

> **RECONSTRUCTION NOTE (C6) — the row bodies of this section are staged, not lost.** The full 13-field
> bodies of the 174 CL-3/CL-4 rows are staged verbatim in the MERGE-lifted fragments
> `archive/catalog-authoring/2026-09-21/CL-3.md` (`PRUNE-100`–`PRUNE-173`) and `CL-4.md`
> (`PRUNE-300`–`PRUNE-399`) — legal to cite **only** inside a marked `[archive]` `evidence_pointer` (§3.4
> rule 8). The reconstruction pass that recovered this file carried the register's **ids, capabilities,
> provenance/direction/verdict cells, pointers, owner classes, anchors, counts and the cycles' corrections**
> into the tables below, and the **`verdict_basis` prose of the 174 fragment rows is the one field this
> pass could not re-transcribe in full**; it is owed a re-hydration from those two fragments by the first
> shell-bearing pass. Nothing else about those rows is missing: every id, cell and pointer is below or in
> the cited fragments, and no count in §C.2/§C.6 depends on the missing prose.

### §C.3.0 The register at a glance (id · capability · provenance · direction · verdict · owner class · anchor)

| id | capability | provenance | direction | verdict | owner_class | `code_anchor` | status_pointer (owning row) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PRUNE-100` | SHELL-CHROME | user-ratified-spec | wants-change | **invalidated-conflict** | shell-chrome | `src/renderer/index.html .tab-strip` | `docs/defects.md#TABBAR-SCROLLS-AWAY` (primary; `LIVE-2` demoted to labelled secondary — the `X-15` re-pointing) |
| `PRUNE-101` | SHELL-CHROME | contract-pinned | wants-more | keep-advisory | shell-chrome | `src/renderer/index.html .tab-strip` | `docs/specs/user-flow-audit-checklist.md#UF-SHELL-2` (primary; `LIVE-2` demoted to labelled secondary — `X-15`) |
| `PRUNE-102` | SHELL-CHROME | user-directed-record | wants-less | keep-advisory | shell-chrome | `src/renderer/index.html .app-nameplate` | `docs/decisions.md#APP-BRANDING-IN-TOP-BAR` |
| `PRUNE-103` | SHELL-CHROME | user-verbatim | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html .tab-strip` | `docs/defects.md#TOP-BAR-NOT-FIXED` |
| `PRUNE-104` | SHELL-CHROME | agent-observed-live | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html .tab-strip` | `docs/defects.md#NAMEPLATE-NO-SIDE-MARGIN` |
| `PRUNE-105` | SHELL-CHROME | contract-pinned | wants-removal | **merged-into:PRUNE-127** | shell-chrome | `src/main/app-menu.ts buildMenuTemplate` | `docs/specs/ui-overhaul.md:§1` · `docs/defects.md#PANE-VISIBILITY-IRREVERSIBLE` |
| `PRUNE-106` | SHELL-CHROME | user-ratified-spec | wants-change | **merged-into:PRUNE-333** | shell-chrome | `src/renderer/index.html @media (prefers-color-scheme: dark)` | `docs/defects.md#HOST-UI1` |
| `PRUNE-107` | SHELL-CHROME | user-ratified-spec | wants-more | **merged-into:PRUNE-333** | shell-chrome | `layoutCssVars` | `docs/decisions.md#UI-CONFIG-CARRIER` |
| `PRUNE-108` | SHELL-CHROME | user-ratified-spec | wants-change | **merged-into:PRUNE-334** | shell-chrome | `installSettingsModal` | `docs/decisions.md#MODAL-SETTINGS-REPARENT` |
| `PRUNE-109` | SHELL-CHROME | user-directed-record | wants-change | **merged-into:PRUNE-336** | shell-chrome | `createModalController` | `docs/decisions.md#MODAL-DEDICATED-SCRIM` |
| `PRUNE-110` | LAYOUT-ZONES | user-ratified-spec | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html #app > #wiki-root` | `docs/specs/user-flow-audit-checklist.md#UF-LAYOUT-1` |
| `PRUNE-111` | LAYOUT-ZONES | user-ratified-spec | wants-more | keep-advisory | app-graph | `paneSubtreeRoot` | `docs/specs/user-flow-audit-checklist.md#UF-LAYOUT-2` |
| `PRUNE-112` | LAYOUT-ZONES | user-ratified-spec | wants-more | **merged-into:PRUNE-343** | shell-chrome | `layoutCssVars` | `docs/decisions.md#UI-CONFIG-CARRIER` |
| `PRUNE-113` | LAYOUT-ZONES | user-directed-record | wants-change | keep-advisory | shell-chrome | `zoneTrackCssVars` | `docs/decisions.md#LAYOUT-IN-CSS` |
| `PRUNE-114` | LAYOUT-ZONES | user-verbatim | wants-less | keep-advisory | shell-chrome | `applyLayoutToRoot` | `docs/decisions.md#LAYOUT-IN-CSS` |
| `PRUNE-115` | LAYOUT-ZONES | agent-observed-live | wants-change | keep-advisory | shell-chrome | `zoneTrackCssVars` | `docs/defects.md#F-3` |
| `PRUNE-116` | LAYOUT-ZONES | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `src/renderer/pane-drag.ts dropZoneForPoint` | `docs/specs/user-flow-audit-checklist.md#UF-LAYOUT-11` |
| `PRUNE-117` | LAYOUT-ZONES | contract-pinned | wants-change | keep-advisory | shell-chrome | `layoutCssVars` | `docs/specs/user-flow-audit-checklist.md#UF-LAYOUT-12` |
| `PRUNE-118` | LAYOUT-ZONES | user-verbatim | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html #app > [data-zone]` | `docs/defects.md#ZONE-NO-BOUNDARY-ASYMMETRY` |
| `PRUNE-119` | LAYOUT-ZONES | user-verbatim | wants-change | keep-advisory | shell-chrome | `startGutter` | `docs/defects.md#LIVE-UF7` |
| `PRUNE-120` | LAYOUT-ZONES | user-verbatim | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html #app > #wiki-root` | `docs/defects.md#STAGE-LEFT-EDGE-FLUSH` |
| `PRUNE-121` | LAYOUT-ZONES | agent-observed-live | wants-less | keep-advisory | shell-chrome | `zoneTrackCssVars` | `docs/defects.md#F-3` |
| `PRUNE-122` | LAYOUT-ZONES | contract-pinned | wants-change | keep-advisory | shell-chrome | `layoutCssVars` | `docs/specs/user-flow-audit-checklist.md#UF-LAYOUT-3` |
| `PRUNE-123` | PANES | agent-observed-live | wants-more | keep-advisory | shell-chrome | `src/renderer/index.html .pane-frame` | `docs/specs/user-flow-audit-checklist.md#UF-PANES-3` |
| `PRUNE-124` | PANES | agent-observed-live | wants-more | keep-advisory | app-graph | `src/renderer/pane-graph.ts paneSubtreeRoot` | `docs/defects.md#LIVE-10` |
| `PRUNE-125` | PANES | user-ratified-spec | wants-change | keep-advisory | app-graph | `togglePaneCollapse` | `docs/defects.md#LIVE-11` |
| `PRUNE-126` | PANES | contract-pinned | wants-more | keep-advisory | shell-chrome | `layoutCssVars` | `docs/specs/user-flow-audit-checklist.md#UF-PANES-2` |
| `PRUNE-127` | PANES | user-directed-record | wants-removal | **invalidated-conflict** | shell-chrome | `togglePaneVisibility` | `docs/defects.md#PANE-VISIBILITY-IRREVERSIBLE` (freeze carrier of record for C13-vs-N1) |
| `PRUNE-128` | PANES | user-directed-record | wants-less | **merged-into:PRUNE-340** | app-graph | `applyPersistedPaneVisibility` | `docs/decisions.md#FIRST-RUN-ENABLED-DEFAULT` |
| `PRUNE-129` | PANES | user-verbatim | wants-change | keep-advisory | shell-chrome | `togglePaneCollapse` | `docs/defects.md#PANE-TOGGLE-FULL-REASSEMBLY` (**freeze kept** — §9 (27) (b)) |
| `PRUNE-130` | PANES | user-verbatim | wants-change | keep-advisory | shell-chrome | `commitPaneDrop` | `docs/defects.md#PANE-NO-PLACEMENT-OR-SCROLLBOX` |
| `PRUNE-131` | PANES | user-verbatim | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html .pane-frame` | `docs/defects.md#PANE-NO-PLACEMENT-OR-SCROLLBOX` |
| `PRUNE-132` | PANES | user-directed-record | wants-change | keep-advisory | shell-chrome | `GESTURE_SELECTOR` | `docs/decisions.md#PANE-DRAG-HEADER-ONLY` |
| `PRUNE-133` | PANES | agent-observed-live | wants-change | keep-advisory | shell-chrome | `insertionIndexForPoint` | `docs/defects.md#PANE-DRAG-TOP-ONLY` |
| `PRUNE-134` | PANES | user-verbatim | wants-change | keep-advisory | shell-chrome | `applyZoneTracks` | `docs/defects.md#PANE-SLOT-INSTABILITY-ON-DISCLOSURE` |
| `PRUNE-135` | PANES | agent-observed-live | wants-change | keep-advisory | app-graph | `applyContentReconcile` | `docs/defects.md#HOST-PANE-STALE-ON-CONTENT-CHANGE` |
| `PRUNE-136` | PANES | user-verbatim | wants-change | keep-advisory | app-graph | `paneSubtreeRoot` | `docs/defects.md#HISTORY-NOT-DROPDOWN` (**live winner of the `PRUNE-170` / `PRUNE-315` folds**) |
| `PRUNE-137` | PANES | user-verbatim | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html .pane-tab` | `docs/defects.md#LIVE-UF10` |
| `PRUNE-138` | PANES | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `paneTabExpand` | `docs/specs/user-flow-audit-checklist.md#UF-PANES-8` |
| `PRUNE-139` | PANES | agent-observed-live | wants-change | keep-advisory | app-graph | `togglePaneCollapse` | **RE-POINTED (C2) at the owning `docs/defects.md` row for the frame-return behavior; the `docs/specs/user-demo-bug-report-2-2026-09-15.md:§1` observation is retained as secondary** |
| `PRUNE-140` | PANES | agent-observed-live | wants-change | keep-advisory | shell-chrome | `tearDownGraph` | `docs/defects.md#F-2` |
| `PRUNE-141` | PANES | user-directed-record | wants-change | keep-advisory | app-graph | `paneSubtreeRoot` | `docs/decisions.md#PANE-PROVIDENT-AUTHORING` |
| `PRUNE-142` | PANES | user-directed-record | wants-change | keep-advisory | app-graph | `src/renderer/pane-registry.ts` | `docs/decisions.md#PANE-REGISTRY` |
| `PRUNE-143` | TABS | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `src/renderer/tab-strip.ts` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-1` |
| `PRUNE-144` | TABS | user-directed-record | wants-change | keep-advisory | shell-chrome | `openDocumentTab` | `docs/defects.md#LIVE-3` |
| `PRUNE-145` | TABS | agent-observed-live | wants-change | keep-advisory | shell-chrome | `newTab` | `docs/defects.md#LIVE-UF1` |
| `PRUNE-146` | TABS | contract-pinned | wants-change | keep-advisory | shell-chrome | `src/renderer/tab-strip.ts` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-3` |
| `PRUNE-147` | TABS | user-ratified-spec | wants-change | keep-advisory | app-graph | `src/renderer/tab-strip.ts` | **RE-POINTED (C2) at its owning row** (`docs/specs/user-flow-audit-checklist.md#UF-TABS-4`) |
| `PRUNE-148` | TABS | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `src/renderer/tab-strip.ts` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-5` |
| `PRUNE-149` | TABS | agent-observed-live | wants-change | **merged-into:PRUNE-326** | app-graph | `deriveDocNavDocuments` | **RE-POINTED (C2) at its owning row** (`docs/defects.md#DOC-NAV-NOT-A-TREE`); the report observation is secondary |
| `PRUNE-150` | TABS | agent-observed-live | wants-more | keep-advisory | app-graph | `openDocumentTab` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-7` |
| `PRUNE-151` | TABS | contract-pinned | wants-change | keep-advisory | app-graph | `openDocumentTab` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-8` |
| `PRUNE-152` | TABS | user-directed-record | wants-change | **invalidated-conflict** | main-process | `provident.focus` | `docs/decisions.md#MCP-FOCUS-TOOL` (freeze carrier — the focus-tool authority vs the contract's tool table, `X-14`) |
| `PRUNE-153` | TABS | user-ratified-spec | wants-change | **merged-into:PRUNE-326** | app-graph | `src/renderer/cross-document-shared.ts` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-10` |
| `PRUNE-154` | TABS | user-ratified-spec | wants-more | keep-advisory | app-graph | `src/renderer/content-reconcile.ts` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-11` |
| `PRUNE-155` | TABS | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `src/renderer/tab-strip.ts` | **RE-POINTED (C2) at its owning row** (`docs/specs/user-flow-audit-checklist.md#UF-TABS-12`) |
| `PRUNE-156` | TABS | agent-observed-live | wants-more | keep-advisory | app-graph | `landingContent` | `docs/defects.md#LIVE-4` |
| `PRUNE-157` | TABS | contract-pinned | wants-more | keep-advisory | shell-chrome | `src/renderer/tab-strip.ts` | `docs/specs/user-flow-audit-checklist.md#UF-TABS-12` |
| `PRUNE-158` | STAGE-DOCUMENT | user-verbatim | wants-change | keep-advisory | main-process | `buildSubtree` | `docs/defects.md#LIVE-UF6` |
| `PRUNE-159` | STAGE-DOCUMENT | agent-observed-live | wants-change | keep-advisory | main-process | `buildSubtree` | `docs/defects.md#DOC-HEAD-CONTAINS-FIRST-PARAGRAPH` |
| `PRUNE-160` | STAGE-DOCUMENT | user-ratified-spec | wants-more | keep-advisory | app-graph | `applyEditingMode` | `docs/specs/user-flow-audit-checklist.md#UF-KEEP-2` (retained keep row) |
| `PRUNE-161` | STAGE-DOCUMENT | agent-observed-live | wants-more | keep-advisory | app-graph | `applyEditingMode` | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-4` |
| `PRUNE-162` | STAGE-DOCUMENT | agent-observed-live | wants-more | **merged-into:PRUNE-326** | app-graph | `landingContent` | `docs/specs/user-flow-audit-checklist.md#UF-KEEP-3` (retained keep row) |
| `PRUNE-163` | STAGE-DOCUMENT | contract-pinned | wants-more | keep-advisory | app-graph | `applyEditingMode` | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-9` |
| `PRUNE-164` | STAGE-DOCUMENT | user-directed-record | wants-more | **merged-into:PRUNE-307** | app-graph | `requestRebuild` | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-10` |
| `PRUNE-165` | STAGE-DOCUMENT | user-ratified-spec | wants-more | keep-advisory | app-graph | `applyContentReconcile` | `docs/decisions.md#U-STATE-1-CONTENT-REPOPULATION-GATE` |
| `PRUNE-166` | STAGE-DOCUMENT | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `src/renderer/index.html #app > #wiki-root` | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-7` |
| `PRUNE-167` | STAGE-DOCUMENT | user-verbatim | wants-change | keep-advisory | shell-chrome | `src/renderer/index.html #app > #wiki-root` | `docs/defects.md#TABLE-OVERFLOWS-STAGE` |
| `PRUNE-168` | STAGE-DOCUMENT | user-verbatim | wants-less | keep-advisory | shell-chrome | `src/renderer/index.html ul` | `docs/defects.md#LIST-INDENT-40PX` |
| `PRUNE-169` | STAGE-DOCUMENT | user-directed-record | wants-less | keep-advisory | main-process | `buildTraversal` | `docs/decisions.md#SCOPED-LOAD` |
| `PRUNE-170` | STAGE-DOCUMENT | user-verbatim | wants-change | **merged-into:PRUNE-136** | app-graph | `paneSubtreeRoot` | `docs/defects.md#HISTORY-NOT-DROPDOWN` (**fold repaired by C2 — not `PRUNE-137`**) |
| `PRUNE-171` | STAGE-DOCUMENT | user-verbatim | wants-change | **merged-into:PRUNE-316** | app-graph | `paneSubtreeRoot` | `docs/defects.md#HISTORY-NOT-DROPDOWN` |
| `PRUNE-172` | STAGE-DOCUMENT | agent-observed-live | wants-more | keep-advisory | app-graph | `applyStageBody` | **RE-POINTED (C2) at its owning row** (`docs/defects.md#HISTORY-NOT-DROPDOWN` — the record that the history surface consumes stage space) |
| `PRUNE-173` | STAGE-DOCUMENT | contract-pinned | wants-more | keep-advisory | app-graph | `assembleAppGraphEnvelope` | `docs/decisions.md#UI-MOUNT-BOOT` |

### §C.3.0b The register at a glance — CL-4's rows (`PRUNE-300`–`PRUNE-399`)

| id | capability | provenance | direction | verdict | owner_class | `code_anchor` | status_pointer (owning row) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PRUNE-300` | EDITING-RICH-TEXT | user-verbatim | wants-change | keep-advisory | app-graph | `src/main/traversal.ts buildSubtree` | `docs/defects.md#WHOLE-PAGE-EDITING-REQUIREMENT` |
| `PRUNE-301` | EDITING-RICH-TEXT | user-directed-record | wants-more | keep-advisory | app-graph | `buildSubtree` | `docs/defects.md#DOC-TITLE-NOT-EDITABLE` |
| `PRUNE-302` | EDITING-RICH-TEXT | user-directed-record | wants-more | keep-advisory | app-graph | `buildSubtree` | `docs/defects.md#TABLE-CELLS-NOT-EDITABLE` |
| `PRUNE-303` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | app-graph | `applyEditingMode` | `docs/decisions.md#EDITING-MODE-SETTING` |
| `PRUNE-304` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | app-graph | `applyEditingMode` | `docs/decisions.md#EDITING-MODE-SETTING` |
| `PRUNE-305` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | app-graph | `editingMode` | `docs/decisions.md#EDITING-MODE-SETTING` |
| `PRUNE-306` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | app-graph | `src/main/rich-decompose.ts decomposeRichHtml` | `docs/decisions.md#RICH-TEXT-EDITING-GATE` |
| `PRUNE-307` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | app-graph | `src/renderer/sidebar-panes.ts requestRebuild` | `docs/decisions.md#FORM-CONTROL-EDITING` (**winner of the `PRUNE-164` fold**) |
| `PRUNE-308` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | main-process | `src/main/paste-sanitize.ts sanitizePastedHtml` | `docs/decisions.md#PASTE-SANITIZATION` |
| `PRUNE-309` | EDITING-RICH-TEXT | contract-pinned | n/a | keep-advisory | app-graph | `decomposeRichHtml` | `docs/decisions.md#RICH-TEXT-EDITING-GATE` |
| `PRUNE-310` | EDITING-MARKDOWN-MODE | user-verbatim | wants-change | keep-advisory | app-graph | `src/renderer/pane-graph.ts applyEditorToolbar` | `docs/defects.md#EDIT-MODE-TEXTAREA-UI` |
| `PRUNE-311` | EDITING-MARKDOWN-MODE | user-directed-record | wants-removal | keep-advisory | app-graph | `textarea-<ragId>` | `docs/defects.md#EDIT-MODE-TEXTAREA-UI` |
| `PRUNE-312` | EDITING-MARKDOWN-MODE | user-ratified-spec | wants-change | keep-advisory | app-graph | `data-mode` | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-6` |
| `PRUNE-313` | EDITING-MARKDOWN-MODE | contract-pinned | n/a | keep-advisory | main-process | `MarkdownAdapter` | `docs/decisions.md#MARKDOWN-EXPORT-ONLY` |
| `PRUNE-314` | HISTORY-UNDO | contract-pinned | n/a | keep-advisory | main-process | `RagStore.journal` | `docs/decisions.md#PROJECT-JOURNAL` |
| `PRUNE-315` | HISTORY-UNDO | user-directed-record | wants-change | **merged-into:PRUNE-136** | app-graph | `data-role="history"` | `docs/defects.md#LIVE-UF5` (fold target repaired by `(M6)`) |
| `PRUNE-316` | HISTORY-UNDO | user-directed-record | wants-change | keep-advisory | app-graph | `#pane-history` | `docs/defects.md#HISTORY-NOT-DROPDOWN` (**winner of the `PRUNE-171` fold**) |
| `PRUNE-317` | HISTORY-UNDO | agent-observed-live | n/a | keep-advisory | app-graph | `src/renderer/sidebar-panes.ts applyEditorToolbar` | `docs/defects.md#LIVE-8 UNDO-INERT` |
| `PRUNE-318` | HISTORY-UNDO | user-ratified-spec | wants-more | keep-advisory | app-graph | `bridge.rag.journalOp` | `docs/specs/user-flow-audit-checklist.md#UF-HIST-6` |
| `PRUNE-319` | HISTORY-UNDO | user-ratified-spec | wants-more | keep-advisory | app-graph | `RagStore.journal` | `docs/specs/user-flow-audit-checklist.md#UF-HIST-7` |
| `PRUNE-320` | HISTORY-UNDO | contract-pinned | n/a | keep-advisory | main-process | `Supervisor.journalEntries` | `docs/decisions.md#JOURNAL-READ-VIA-PACKAGE` (its pending live battery is **waived in §C.7.2**, not silently omitted) |
| `PRUNE-321` | SEARCH-RETRIEVAL | contract-pinned | n/a | keep-advisory | main-process | `src/main/retrieval.ts Embedder` | `docs/decisions.md#LEXICAL-FIRST-RETRIEVAL` |
| `PRUNE-322` | SEARCH-RETRIEVAL | agent-observed-live | n/a | keep-advisory | main-process | `src/main/retrieval.ts onStoreChanged` | `docs/defects.md#VECTOR-IMPORT-NO-BODY-VECTORS` |
| `PRUNE-323` | SEARCH-RETRIEVAL | user-ratified-spec | wants-more | keep-advisory | app-graph | `#advanced-search-toggle` | `docs/specs/user-flow-audit-checklist.md#UF-SEARCH-2` |
| `PRUNE-324` | SEARCH-RETRIEVAL | user-ratified-spec | wants-more | keep-advisory | app-graph | `citations` | `docs/specs/user-flow-audit-checklist.md#UF-SEARCH-3` |
| `PRUNE-325` | SEARCH-RETRIEVAL | agent-observed-live | n/a | **merged-into:PRUNE-801** (§C.4) | app-graph | `paneTabExpand` | `docs/defects.md#LIVE-UF9` |
| `PRUNE-326` | SEARCH-RETRIEVAL | agent-observed-live | n/a | keep-advisory | app-graph | `#stage-landing` | `docs/specs/user-flow-audit-checklist.md#UF-SEARCH-1` (**winner of the `PRUNE-149`/`162`/`153` folds**; retained keep row) |
| `PRUNE-327` | SEARCH-RETRIEVAL | contract-pinned | n/a | keep-advisory | main-process | `src/main/query-audit.ts createQueryAuditLog` | `docs/decisions.md#QUERY-AUDIT-LOG` |
| `PRUNE-328` | SEARCH-RETRIEVAL | contract-pinned | n/a | keep-advisory | app-graph | `bridge.rag.query` | `docs/decisions.md#MCP-UI-EQUIVALENCE` |
| `PRUNE-329` | DOC-NAV-TREE | user-directed-record | wants-change | keep-advisory | app-graph | `docNavContent` | `docs/defects.md#DOC-NAV-NOT-A-TREE` |
| `PRUNE-330` | DOC-NAV-TREE | agent-observed-live | n/a | keep-advisory | app-graph | `RagNode.documentPath` | `docs/defects.md#DOC-NAV-NOT-A-TREE` (its phantom draft pointer was **withdrawn in-pass**) |
| `PRUNE-331` | DOC-NAV-TREE | contract-pinned | n/a | keep-advisory | app-graph | `pane-doc-nav-select` | `docs/pending.md:§"SPECULATIVE"` row + `docs/specs/ui-overhaul.md:§5.1` `PG14` |
| `PRUNE-332` | DOC-NAV-TREE | agent-observed-live | n/a | keep-advisory | app-graph | `li[data-document-id]` | `docs/specs/user-flow-audit-checklist.md#UF-PARITY-3` |
| `PRUNE-333` | SETTINGS-MODAL-THEME | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `data-theme` | `docs/specs/user-flow-audit-checklist.md#UF-THEME-1` (**winner of the `PRUNE-106`/`107` folds**) |
| `PRUNE-334` | SETTINGS-MODAL-THEME | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `#settings-toggle` | `docs/specs/user-flow-audit-checklist.md#UF-SETTINGS-1` (**winner of the `PRUNE-108` fold**) |
| `PRUNE-335` | SETTINGS-MODAL-THEME | contract-pinned | n/a | keep-advisory | shell-chrome | `#settings-modal-body` | `docs/decisions.md#MODAL-SETTINGS-REPARENT` |
| `PRUNE-336` | SETTINGS-MODAL-THEME | contract-pinned | n/a | keep-advisory | shell-chrome | `#settings-modal-scrim` | `docs/decisions.md#MODAL-DEDICATED-SCRIM` (**winner of the `PRUNE-109` fold**) |
| `PRUNE-337` | SETTINGS-MODAL-THEME | agent-observed-live | n/a | keep-advisory | app-graph | `#operator-enabled-panes` | `docs/defects.md#LIVE-7 SETTINGS-LAZY-LOAD` |
| `PRUNE-338` | SETTINGS-MODAL-THEME | contract-pinned | n/a | keep-advisory | app-graph | `#operator-topk` | `docs/specs/user-flow-audit-checklist.md#UF-SETTINGS-5` |
| `PRUNE-339` | SETTINGS-MODAL-THEME | agent-observed-live | n/a | keep-advisory | main-process | `src/main/operator-settings-store.ts persist` | `docs/defects.md#SETTINGS-PERSIST-WRITE-SILENT` |
| `PRUNE-340` | SETTINGS-MODAL-THEME | contract-pinned | n/a | keep-advisory | app-graph | `FIRST_RUN_APP_DEFAULT` | `docs/decisions.md#FIRST-RUN-ENABLED-DEFAULT` (**winner of the `PRUNE-128` fold**) |
| `PRUNE-341` | SETTINGS-MODAL-THEME | user-directed-record | wants-removal | **merged-into:PRUNE-127** | app-graph | `[data-pane][data-enabled]` | `docs/defects.md#PANE-VISIBILITY-IRREVERSIBLE` (the **alternative carrier**, merged into the carrier of record) |
| `PRUNE-342` | SETTINGS-MODAL-THEME | agent-observed-live | n/a | keep-advisory | native-menu | `buildMenuTemplate` | `docs/defects.md#LIVE-12 VISIBILITY-MENU-CLOSES` |
| `PRUNE-343` | SETTINGS-MODAL-THEME | contract-pinned | n/a | keep-advisory | shell-chrome | `OperatorSettings` | `docs/decisions.md#UI-CONFIG-CARRIER` (**winner of the `PRUNE-112` fold**) |
| `PRUNE-344` | SETTINGS-MODAL-THEME | user-ratified-spec | wants-change | keep-advisory | shell-chrome | `--bg` | `docs/specs/user-flow-audit-checklist.md#UF-THEME-2` |
| `PRUNE-345` | SETTINGS-MODAL-THEME | user-ratified-spec | wants-more | keep-advisory | shell-chrome | `is-clickable` | `docs/specs/user-flow-audit-checklist.md#UF-THEME-3` |
| `PRUNE-346` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | app-graph | `TOOL_GROUPS` | `docs/decisions.md#GNOSIS-SECURITY-CARVE-OUT` (**the one id/capability straddle — resolved without a renumber**, §3.5.2 rule 7) |
| `PRUNE-347` | IMPORT-FS | user-ratified-spec | wants-more | keep-advisory | native-menu | `buildMenuTemplate` | `docs/specs/user-flow-audit-checklist.md#UF-IMPORT-1` |
| `PRUNE-348` | IMPORT-FS | user-ratified-spec | wants-more | keep-advisory | native-menu | `buildImportDialogOptions` | `docs/specs/user-flow-audit-checklist.md#UF-IMPORT-1` |
| `PRUNE-349` | IMPORT-FS | contract-pinned | n/a | keep-advisory | main-process | `expandImportDirectory` | `docs/decisions.md#IMPORT-NO-SYMLINK-FOLLOW` |
| `PRUNE-350` | IMPORT-FS | contract-pinned | n/a | keep-advisory | main-process | `MAX_IMPORT_FILES` | `docs/decisions.md#IMPORT-FILE-COUNT-CAP` |
| `PRUNE-351` | IMPORT-FS | contract-pinned | n/a | keep-advisory | main-process | `IPC_IMPORT_RESULT` | `docs/decisions.md#IMPORT-RESULT-BROADCAST` |
| `PRUNE-352` | IMPORT-FS | contract-pinned | n/a | keep-advisory | main-process | `importMarkdownCorpus` | `docs/specs/user-flow-audit-checklist.md#UF-IMPORT-6` |
| `PRUNE-353` | IMPORT-FS | contract-pinned | n/a | keep-advisory | main-process | `importMarkdownCorpus` | `docs/decisions.md#ONE-WAY-SNAPSHOT` |
| `PRUNE-354` | IMPORT-FS | contract-pinned | n/a | keep-advisory | main-process | `applyBatch` | `docs/decisions.md#BATCH-ATOMICITY-API` |
| `PRUNE-355` | IMPORT-FS | agent-observed-live | n/a | keep-advisory | main-process | `importMarkdownCorpus` | `docs/next-steps.md:§CURRENT WORK / handover-state` + "**STORE RE-IMPORTED FROM CURRENT SOURCES (2026-09-16**" |
| `PRUNE-356` | GNOSIS-ENGINE-SURFACE | agent-observed-live | n/a | keep-advisory | app-graph | `gnosisDocumentsContent` | `docs/defects.md#GNOSIS-SIDEBAR-SEAM-MISSING` |
| `PRUNE-357` | GNOSIS-ENGINE-SURFACE | user-ratified-spec | wants-more | keep-advisory | app-graph | `gnosisQueryContent` | `docs/specs/user-flow-audit-checklist.md#UF-GNOSIS-3` |
| `PRUNE-358` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | app-graph | `gnosisStatusContent` | `docs/decisions.md#GNOSIS-D2-ENGINE-ABSENT` |
| `PRUNE-359` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | app-graph | `handleGnosisTool` | `docs/specs/user-flow-audit-checklist.md#UF-GNOSIS-6` |
| `PRUNE-360` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | app-graph | `gnosis.document.update` | `docs/specs/user-flow-audit-checklist.md#UF-GNOSIS-5` |
| `PRUNE-361` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | **merged-into:PRUNE-829** (§C.4) | main-process | `resolveEngineBaseUrl` | `docs/decisions.md#ENGINE-ABSENT-DEGRADED-CONTRACT` |
| `PRUNE-362` | GNOSIS-ENGINE-SURFACE | agent-observed-live | n/a | keep-advisory | launcher | `scripts/start-app.sh` | `docs/defects.md#DEMO-ENGINE-START-GAP` |
| `PRUNE-363` | GNOSIS-ENGINE-SURFACE | agent-observed-live | n/a | **merged-into:PRUNE-801** (§C.4) | main-process | `src/main/engine-rag-store.ts ragQuery` | `docs/defects.md#HOST-ENGINE-QUERY-POST-NO-ENVELOPE` |
| `PRUNE-364` | GNOSIS-ENGINE-SURFACE | agent-observed-live | n/a | **merged-into:PRUNE-802** (§C.4) | upstream-package | `rag_query_handler` (out-of-repo, marked) | `docs/defects.md#GNOSIS-ENGINE-QUERY-MODE-IGNORED` |
| `PRUNE-365` | GNOSIS-ENGINE-SURFACE | agent-observed-live | n/a | **merged-into:PRUNE-803** (§C.4) | upstream-package | **`<none>`** (the `(S4)` repair) | `docs/defects.md#GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` |
| `PRUNE-366` | GNOSIS-ENGINE-SURFACE | agent-observed-live | n/a | **merged-into:PRUNE-808** (§C.4) | upstream-package | `declareCommunity` | `docs/defects.md#GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` |
| `PRUNE-367` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | app-graph | `buildTraversal` | `docs/decisions.md#ASTROGRAPHER-SCOPE-REALIGNMENT` |
| `PRUNE-368` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | main-process | `RagStore` | `docs/decisions.md#ASTROGRAPHER-SCOPE-REALIGNMENT` |
| `PRUNE-369` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | main-process | `createEngineCrudRagStore` | `docs/decisions.md#GNOSIS-CRUD-SURFACE-CONFIRMED` |
| `PRUNE-370` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | app-graph | `gnosisDocumentsContent` | `docs/decisions.md#GNOSIS-DOCS-PANE-WIKI-SELECTOR-ALWAYS` |
| `PRUNE-371` | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | keep-advisory | main-process | `createEngineFetch` | `docs/decisions.md#GNOSIS-SECURITY-CARVE-OUT` |
| `PRUNE-372` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `ALL_TOOLS` | `docs/specs/mcp-endpoint.md:§3 Tools (the MCP surface)` |
| `PRUNE-373` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | **`<none>`** (the `(S4)` repair) | `docs/specs/mcp-endpoint.md:§4 Code / data CRUD` |
| `PRUNE-374` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `TOOL_GROUPS` | `docs/specs/mcp-endpoint.md:§6.2 Tool groups` |
| `PRUNE-375` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `provident.focus` | `docs/decisions.md#MCP-FOCUS-TOOL` (freeze entry; the `X-14` authority conflict) |
| `PRUNE-376` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `installIsolatedScope` | `docs/specs/mcp-endpoint.md:§6.4 Manual-UI-only settings controls` |
| `PRUNE-377` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `McpServer` | `docs/specs/mcp-endpoint.md:§2 Transports` |
| `PRUNE-378` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `MCP-Token` | `docs/specs/mcp-endpoint.md:§6.3 The auth token` |
| `PRUNE-379` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `handleEditTool` | `docs/decisions.md#MCP-UI-EQUIVALENCE` |
| `PRUNE-380` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `contextIsolation` | `docs/decisions.md#IPC-SURFACE-NOT-GROUP-GATED` |
| `PRUNE-381` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | app-graph | `ALL_TOOLS` | `docs/specs/ui-overhaul.md:§4.11 Full parity census` |
| `PRUNE-382` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | app-graph | `VALID_GROUPS` | `docs/decisions.md#SECURITY-STORE-GNOSIS-GROUPS` |
| `PRUNE-383` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | main-process | `MUTATING_METHODS` | `docs/decisions.md#RAG-EDIT-MCP-GROUPS` |
| `PRUNE-384` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | **merged-into:PRUNE-822** (§C.4) | app-graph | `assembleAppGraphEnvelope` | `docs/pending.md:§"UPSTREAM (imported constraints)"` row |
| `PRUNE-385` | SHELL-CHROME (**routed by the §C.1 `Owns` clause and counted there**) | contract-pinned | n/a | keep-advisory | shell-chrome | `unsafe-eval` | `docs/specs/mcp-endpoint.md:§2 Transports` (the CSP note + REQ-GAP-7) |
| `PRUNE-386` | MCP-ENDPOINT-CONTRACT | contract-pinned | n/a | keep-advisory | upstream-docs | `TOOL_GROUPS` | `docs/specs/mcp-endpoint.md:§6.2` (the Astrographer-extension note) |
| `PRUNE-387` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `scripts/live-drive.mjs o0OracleIdentity` | `docs/specs/unit-o-0-per-stage-measurement.md` §3.6b/§11 |
| `PRUNE-388` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `snapshot.clone` | `docs/pending.md:§"PARKED (recorded gap with a named revisit condition)"` |
| `PRUNE-389` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `O-5` | `docs/next-steps.md:§CURRENT WORK / handover-state` + "**NEXT QUEUE (in order — set by the two binding user decisions**" |
| `PRUNE-390` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | process/agent | `live-drive.mjs` | `AGENTS.md` item 11 (RCA-11) |
| `PRUNE-391` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | process/agent | `dom-shim` | `AGENTS.md` item 12 (RCA-12) |
| `PRUNE-392` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | process/agent | `doc-review` | `AGENTS.md` item 10d (RCA-6) · `archive/reviews/2026-09-21-unit-o0-m1-m3-reaudit-doc-review.md` `[archive]` |
| `PRUNE-393` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `vitest.config.ts` | `docs/defects.md#SUITE-RED-AFTER-VITEST5-ELECTRON44` |
| `PRUNE-394` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `testTimeout` | `docs/defects.md#O0-CONFIG-CEILING-AND-IMPORTER-UNPINNED` |
| `PRUNE-395` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `codeOnly` | `docs/defects.md#RCA-13 CODE-ONLY-SCAN-SILENT-NO-OP` |
| `PRUNE-396` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | process/agent | `<none>` | `docs/specs/requirement-catalog.md` §4.1 |
| `PRUNE-397` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | process/agent | `<none>` | `docs/specs/astrographer-scope-realignment-review.md` §1.2 |
| `PRUNE-398` | ENGINEERING-ONLY | engineering-only | n/a | **merged-into:PRUNE-343** | main-process | `src/main/adjacency.ts computeDocumentSubgraph` | `docs/decisions.md#SCOPED-LOAD` |
| `PRUNE-399` | ENGINEERING-ONLY | engineering-only | n/a | keep-advisory | test-harness | `O0_OPERATOR_DOCUMENTS` | `docs/specs/requirement-catalog.md` §2.3 |

### §C.3.1 The fix-pass rows (`PRUNE-600`–`PRUNE-603`)

**These four rows were added by the C2 adversarial fix pass** (`(M2)` — "the four rows added for missing user
statements") into the AMENDMENT / FIX-PASS block, and the contract's §9 (26) amendment records them by name.
Each carries the exact 13-field schema; `prune_signoff: none`; `last_verified: 2026-09-21`.

| id | statement | capability | provenance | direction | status_pointer | evidence_pointer | owner_class | `code_anchor` | verdict | `prune_signoff` | `last_verified` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PRUNE-600` | A pane dragged by its header past its neighbour commits the relocation at the position the pointer indicates, and the commit sticks across a re-render. | PANES | user-directed-record | wants-more | `docs/defects.md#PANE-DRAG-NO-COMMIT` · `docs/defects.md#PANE-DRAG-TOP-ONLY` | `docs/specs/user-demo-bug-report-2026-09-15.md:§1` item **I-7** (the user's pane-drag relocation ask — the missing user statement this row supplies) · `docs/specs/user-flow-audit-checklist.md#UF-PANES-4` · `docs/decisions.md#PANE-DRAG-HEADER-ONLY` | app-graph | `commitPaneDrop` | keep-advisory | none | 2026-09-21 |
| `PRUNE-601` | The application exposes a find-in-page affordance that reaches the focused document's text, reachable from the native menu and from a keyboard accelerator. | SHELL-CHROME | user-directed-record | wants-more | `docs/defects.md#FIND-IN-PAGE-NOT-WIRED` | `docs/next-steps.md:§CURRENT WORK / handover-state` — "**USER-DEMO BUG REPORT #3 (2026-09-16)**" block, item **C4** (the missing statement this row supplies) · `docs/defects.md#FIND-IN-PAGE-NOT-WIRED` | native-menu | `buildMenuTemplate` | keep-advisory | none | 2026-09-21 |
| `PRUNE-602` | A minimized side zone's tab-list layout holds its orientation in the minimized strip without perturbing the pane order inside the zone. | PANES | user-directed-record | **wants-keep** | `docs/specs/user-flow-audit-checklist.md#UF-KEEP-1` | `docs/specs/user-flow-audit-checklist.md#UF-KEEP-1` (PASS-not-reproduced keep row; scenario `user3_collapse_orientation`) · `docs/specs/live-user-flow-scenarios.md:§3` | app-graph | `paneSubtreeRoot` | keep-advisory | none | 2026-09-21 |
| `PRUNE-603` | The stage's main editable view accepts an ordinary edit and commits it to the store on blur, on a seeded store as well as an empty one. | STAGE-DOCUMENT | user-directed-record | **wants-keep** | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-3` | `docs/specs/user-flow-audit-checklist.md#UF-STAGE-3` (PASS-not-reproduced keep row; scenario `user4_main_editable`) · `docs/specs/user-demo-bug-report-2026-09-15.md:§1` item **I-6** (the user's ruling on the textarea half) | app-graph | `applyEditingMode` | keep-advisory | none | 2026-09-21 |

**These are the register's only two `wants-keep` rows** (`PRUNE-602`, `PRUNE-603`), which is why the
`§C.5.2` `wants-keep` test names them: each has an in-repo re-drive record that **contradicts** the report its
provenance rests on, and each asserts the **existing** behavior rather than a change to it (§3.4, §9 (17)).

### §C.3.2 The design-extensions amendment rows (`PRUNE-604`–`PRUNE-626`)

**Amendment header.** These rows were added by the **design-extensions amendment pass (C4)** — a post-merge
pass over the already-merged catalog, authoring into the **AMENDMENT / FIX-PASS block** (`600`–`799`,
`docs/specs/requirement-catalog.md` §3.5.1 rule 5 / §9 (26)). Every row: `provenance: user-directed-record`
(the input is a user design input, `docs/feature-requests/design-extensions-2026-09-21.md`, whose gate chain
landed the user's rulings); a **non-`n/a`** `direction` derived from the input's own item statement;
`prune_signoff: none`; `verdict: keep-advisory` (or `keep` where a contract pin holds and no freeze
condition applies); `last_verified: 2026-09-21`; `evidence_pointer` at the input's §2 item id. **No new
capability and no new vocabulary token is introduced** (§9 (27)'s binding negatives), and **§C.4 stays
untouched** (39 rows, non-prunable).

| id | statement | capability | provenance | direction | status_pointer | evidence_pointer | owner_class | `code_anchor` | verdict | `prune_signoff` | `last_verified` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PRUNE-604` | ALL document CRUD operations go through Gnosis; Astrographer persists no documents other than the data owned by the current tabs, and it keeps a tab-scoped read cache rather than a durable document corpus. | STAGE-DOCUMENT | user-directed-record | wants-change | `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` · `docs/next-steps.md:§CURRENT WORK / handover-state` (**BLOCKED-PENDING-USER ROW … `GN-1`/`GN-3`/`GN-4`/`GN-2`**) | `docs/feature-requests/design-extensions-2026-09-21.md:§2.9` item **`GN-1`** · `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | main-process | `createJsonRagStore` | keep-advisory | none | 2026-09-21 |
| `PRUNE-605` | The shell top bar's title area and its unoccupied regions are the window drag region. | SHELL-CHROME | user-directed-record | wants-change | `docs/specs/user-flow-audit-checklist.md#UF-SHELL-2` · `docs/defects.md#TABBAR-SCROLLS-AWAY` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.1` item **`TB-2`** | shell-chrome | `src/renderer/index.html .tab-strip` | keep-advisory | none | 2026-09-21 |
| `PRUNE-606` | Zones carry explicit size controls. | LAYOUT-ZONES | user-directed-record | wants-more | `docs/specs/user-flow-audit-checklist.md#UF-LAYOUT-9` · `docs/defects.md#LIVE-UF7` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.2` item **`LZ-2`** | shell-chrome | `zoneTrackCssVars` | keep-advisory | none | 2026-09-21 |
| `PRUNE-608` | A pane has a drag-adjustable size controller on its bottom edge (in a sidebar) or left edge (in header/footer); the default size is the lesser of half the previous empty space and the size needed to present the pane without a scrollbar. | PANES | user-directed-record | wants-more | `docs/defects.md#PANE-NO-PLACEMENT-OR-SCROLLBOX` · `docs/specs/user-flow-audit-checklist.md#UF-PANES-5` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.3` item **`PN-2`** | app-graph | `paneSubtreeRoot` | keep-advisory | none | 2026-09-21 |
| `PRUNE-609` | Dragging a pane makes the other panes rearrange live, showing a ghost at the prospective drop spot and the resulting layout. | PANES | user-directed-record | wants-more | `docs/defects.md#PANE-DRAG-NO-COMMIT` · `docs/defects.md#PANE-DRAG-TOP-ONLY` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.3` item **`PN-3`** | app-graph | `commitPaneDrop` | keep-advisory | none | 2026-09-21 |
| `PRUNE-610` | A right-click abandons a pane drag and resets it. | PANES | user-directed-record | wants-more | `docs/defects.md#PANE-DRAG-NO-COMMIT` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.3` item **`PN-4`** | app-graph | `commitPaneDrop` | keep-advisory | none | 2026-09-21 |
| `PRUNE-611` | NOTHING other than a deliberate drag reposition, a size adjustment, a minimize, or a visibility change may affect a pane's location or size. | PANES | user-directed-record | wants-change | `docs/defects.md#PANE-SLOT-INSTABILITY-ON-DISCLOSURE` · `docs/defects.md#PANE-DRAG-TOP-ONLY` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.3` item **`PN-5`** | app-graph | `applyZoneTracks` | keep-advisory | none | 2026-09-21 |
| `PRUNE-612` | Dropdown/expandable menus may overflow over the main stage (or from header/footer over the sidebars) for as long as they keep focus/mouseover — e.g. search results, element-type selection in a format pane. | PANES | user-directed-record | wants-more | `docs/defects.md#PANE-SLOT-INSTABILITY-ON-DISCLOSURE` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.3` item **`PN-8`** | app-graph | `paneSubtreeRoot` | keep-advisory | none | 2026-09-21 |
| `PRUNE-613` | A pane offers element type (heading, p, …) and applies it to the element containing the caret or to the selected text. | EDITING-RICH-TEXT | user-directed-record | wants-more | `docs/defects.md#DOC-TITLE-NOT-EDITABLE` · `docs/specs/user-flow-audit-checklist.md#UF-STAGE-5` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.4` item **`ST-2`** | app-graph | `applyEditorToolbar` | keep-advisory | none | 2026-09-21 |
| `PRUNE-614` | The document name/heading element is visually divided from the document text; editing the heading commits the document title on blur; the caret moves heading → body first line and back with the arrow keys. | STAGE-DOCUMENT | user-directed-record | wants-change | `docs/defects.md#DOC-HEAD-CONTAINS-FIRST-PARAGRAPH` · `docs/defects.md#DOC-TITLE-NOT-EDITABLE` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.4` item **`ST-3`** | app-graph | `applyStageBody` | keep-advisory | none | 2026-09-21 |
| `PRUNE-615` | On blur, the stage diffs its content against the provident-editable import tools and updates only the changed sub-elements. | STAGE-DOCUMENT | user-directed-record | wants-change | `docs/decisions.md#CONTENT-EDIT-RE-TRAVERSAL` · `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.4` item **`ST-4`** | app-graph | `applyContentReconcile` | keep-advisory | none | 2026-09-21 |
| `PRUNE-616` | A failed commit raises a user-visible warning. | STAGE-DOCUMENT | user-directed-record | wants-more | `docs/defects.md#SETTINGS-PERSIST-WRITE-SILENT` · `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.4` item **`ST-5`** | app-graph | `requestRebuild` | keep-advisory | none | 2026-09-21 |
| `PRUNE-617` | Textarea editing is obsolete and is removed; rich text is the default; markdown mode remains the rich-text contenteditable stage, without HTML formatting and in monospace. | EDITING-MARKDOWN-MODE | user-directed-record | wants-removal | `docs/defects.md#EDIT-MODE-TEXTAREA-UI` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.4` item **`ST-6`** | app-graph | `applyEditingMode` | keep-advisory | none | 2026-09-21 |
| `PRUNE-618` | A document whose commit failed shows a warning symbol in its tab. | TABS | user-directed-record | wants-more | `docs/defects.md#SETTINGS-PERSIST-WRITE-SILENT` · `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.5` item **`TAB-1`** | app-graph | `src/renderer/tab-strip.ts` | keep-advisory | none | 2026-09-21 |
| `PRUNE-619` | A tab listens for updates to its contained document: a tab with no uncommitted changes updates immediately; a tab with uncommitted changes checks for a merge conflict (diffs touching the same element) and merges when there is none. | TABS | user-directed-record | wants-more | `docs/defects.md#SETTINGS-PERSIST-WRITE-SILENT` · `docs/defects.md#LIVE-UF6` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.5` item **`TAB-2`** | app-graph | `src/renderer/tab-strip.ts` | keep-advisory | none | 2026-09-21 |
| `PRUNE-620` | Search results render in the pane, unless that search was already opened in a tab — in which case the results populate the tab's stage. | SEARCH-RETRIEVAL | user-directed-record | wants-change | `docs/defects.md#LIVE-UF9` · `docs/specs/user-flow-audit-checklist.md#UF-TABS-7` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.7` item **`SR-1`** | app-graph | `openDocumentTab` | keep-advisory | none | 2026-09-21 |
| `PRUNE-621` | In-pane results show only the document name; every other detail appears only in the full tab search. | SEARCH-RETRIEVAL | user-directed-record | wants-more | `docs/specs/user-flow-audit-checklist.md#UF-SEARCH-3` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.7` item **`SR-2`** | app-graph | `citations` | keep-advisory | none | 2026-09-21 |
| `PRUNE-622` | Search has an in-document-only mode. | SEARCH-RETRIEVAL | user-directed-record | wants-more | `docs/specs/user-flow-audit-checklist.md#UF-SEARCH-2` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.7` item **`SR-4`** | app-graph | `#advanced-search-toggle` | keep-advisory | none | 2026-09-21 |
| `PRUNE-623` | `Ctrl+F` moves focus to the search bar in in-document-only mode, copying any highlighted text into the bar. | SEARCH-RETRIEVAL | user-directed-record | wants-change | `docs/defects.md#FIND-IN-PAGE-NOT-WIRED` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.7` item **`SR-5`** | shell-chrome | `buildMenuTemplate` | keep-advisory | none | 2026-09-21 |
| `PRUNE-624` | The document pane listens to Gnosis and updates automatically when a document is added to the focused wiki. **PARKED** on the missing engine notification route `GR-5` (`docs/feature-requests/gnosis-engine-feature-requests.md:§GR-5`): there is no monotonic change marker or documented staleness contract to listen to, so the row is a pinned intent whose destination is the GR-5 request — **the park reason is recorded here so the row is never read as absent behavior.** | DOC-NAV-TREE | user-directed-record | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` · `docs/decisions.md#DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.6` item **`DN-1`** · `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-5` | app-graph | `deriveDocNavDocuments` | keep-advisory | none | 2026-09-21 |
| `PRUNE-625` | At startup the app always checks whether a Gnosis instance is running and launches one when it cannot find an existing instance — the launcher detects-or-launches; `src/` gains no process-spawn capability. | GNOSIS-ENGINE-SURFACE | user-directed-record | wants-change | `docs/decisions.md#GNOSIS-LAUNCHER-TOGGLE` (**amended provenance clause**) · `docs/next-steps.md:§CURRENT WORK / handover-state` (**BLOCKED-PENDING-USER ROW …**) | `docs/feature-requests/design-extensions-2026-09-21.md:§2.9` item **`GN-3`** | launcher | `scripts/start-app.sh` | keep-advisory | none | 2026-09-21 |
| `PRUNE-626` | When no Gnosis instance is found, the user is warned that the wiki cannot be opened — the app starts, warns, and opens no wiki. | GNOSIS-ENGINE-SURFACE | user-directed-record | wants-change | `docs/decisions.md#ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` | `docs/feature-requests/design-extensions-2026-09-21.md:§2.9` item **`GN-4`** | main-process | `resolveEngineBaseUrl` | keep-advisory | none | 2026-09-21 |

> **THE `PRUNE-607` GAP (recorded, never renumbered).** `PRUNE-607` was drafted for the input's `PN-6`
> item ("a pane is a generic container class carrying all the universal pane features once") and was
> **WITHDRAWN** in the same pass: `PN-6` is already scheduled under the parked `FB-1` pane-decomposition
> request (`docs/pending.md` §DEFERRED, `docs/feature-requests/sidebar-panes-decomposition.md:§FB-1`), so
> authoring a second row for it would duplicate a live parked behavior. **The id stays a permanent gap**
> (§3.5.1 rules 1–2: an id identifies exactly one row forever, and an id is never reused or renumbered).

---

## §C.4 — the upstream-owed ledger (NON-PRUNABLE BY CONSTRUCTION)

Behavior the app's users expect that this repo **cannot satisfy alone**: it is requested of, or owned by, a
sibling or upstream project — the **Gnosis engine**, the **Provident-Electron foundation**, the
**Preempt-Providence package/docs**, or the **Agent Harness**. Every row names its **local hedge** (what the
fork does today while the request is unlanded or the constraint binds) inside `verdict_basis`.
**Every §C.4 row carries a non-prunable verdict (`keep` / `keep-advisory`) by construction** — an
`escalate-prune` on a §C.4 row is the contract's `FS11` — and **`prune_signoff: none` on every row**. The
ledger is **COUNTED, never asserted**: **39 rows**, `PRUNE-801`–`PRUNE-839`, all authored by CL-5 and
**unchanged by every later cycle** (the C2 fix pass, the C3 review and the C4 design-extensions amendment
all left it untouched; the design-extensions amendment adds **no** §C.4 row).

**Header row — exactly the contract's 13-field §C.4 schema (§3.1: "the same 13-field schema, with `verdict`
pinned to a non-prunable value").**

| id | statement | capability | provenance | direction | status_pointer | evidence_pointer | owner_class | `code_anchor` | verdict | `prune_signoff` | `last_verified` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `PRUNE-801` | A query posted to the engine's query route is accepted in the engine's own F2 envelope, and a request that fails to decode answers a structured JSON error instead of a plain-text body. | UPSTREAM-OWED | agent-observed-live | wants-more | `docs/defects.md#HOST-ENGINE-QUERY-POST-NO-ENVELOPE` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-1` · `docs/specs/gnosis-enrichment-live-report-2026-09-15.md:§2.3` · `docs/HANDOFF.md:§"OPEN handoff items"` · out-of-repo `../Gnosis/docs/specs/gnosis-gr-inbound-review.md:§"Per-GR verdict table"` | upstream-package | `ragQuery` | keep | none | 2026-09-21 |
| `PRUNE-802` | The engine's POST query route honours the caller's retrieval mode and result count, so graph, vector and hybrid legs are reachable over that route. | UPSTREAM-OWED | agent-observed-live | wants-more | `docs/defects.md#GNOSIS-ENGINE-QUERY-MODE-IGNORED` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-2` · `docs/specs/gnosis-enrichment-live-report-2026-09-15.md:§2.1`/§2.2 · out-of-repo `../Gnosis/docs/specs/gnosis-gr-inbound-review.md:§"Per-GR verdict table"` | upstream-package | `RagQueryOptions` | keep | none | 2026-09-21 |
| `PRUNE-803` | The engine builds a vector index for its own store, and its status distinguishes a wired embedding provider from a built index. | UPSTREAM-OWED | agent-observed-live | wants-more | `docs/defects.md#GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-3` · `docs/specs/gnosis-enrichment-live-report-2026-09-15.md:§2.8` · `docs/HANDOFF.md:§"OPEN handoff items"` | upstream-package | `vector_index_unavailable` | keep | none | 2026-09-21 |
| `PRUNE-804` | The engine answers one bulk read of a store's nodes, edges and adjacency, in one response, with a stable identity a consumer can key its projection on. | UPSTREAM-OWED | contract-pinned | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-8 — authority switch / offline dual-path**"` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-4` · `docs/specs/gnosis-offload-proposal.md:§3.1` · `docs/HANDOFF.md#O-8 AUTHORITY SWITCH / OFFLINE DUAL-PATH` | upstream-package | `buildTraversal` | keep | none | 2026-09-21 |
| `PRUNE-805` | The engine publishes committed store changes to a consumer over a subscription route with a monotonic marker and a documented staleness contract. | UPSTREAM-OWED | contract-pinned | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-8 — authority switch / offline dual-path**"` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-5` · `docs/specs/gnosis-offload-proposal.md:§3.1` · `docs/HANDOFF.md#O-8 AUTHORITY SWITCH / OFFLINE DUAL-PATH` | upstream-package | `IPC_RAG_STORE_CHANGED` | keep | none | 2026-09-21 |
| `PRUNE-806` | The engine parses, validates and applies a markdown corpus in bulk as one atomic commit with a fail-loud cap, observable progress, cancellation, and each document's path segments. | UPSTREAM-OWED | user-verbatim | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-7 — ingestion onto the engine**"` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-6` · `docs/defects.md#ARCH-GNOSIS-OFFLOAD` (quoting the user verbatim) · `docs/HANDOFF.md#O-7 INGESTION-ONTO-THE-ENGINE` | upstream-package | `applyBatch` | keep-advisory | none | 2026-09-21 |
| `PRUNE-807` | The engine's store survives a restart through durable persistence with atomic commit semantics and a stated meaning for a revision across a restore. | UPSTREAM-OWED | user-verbatim | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-8 — authority switch / offline dual-path**"` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-7` · out-of-repo `../Gnosis/docs/specs/gnosis-gr-inbound-review.md:§"Open questions for the user"` (the user's answer verbatim) · `docs/decisions.md#ARCH-GNOSIS-OFFLOAD` | upstream-package | `createJsonRagStore` | keep-advisory | none | 2026-09-21 |
| `PRUNE-808` | The engine routes the community, entity-resolution and fact-merge surfaces a consumer drives, and states whether a text-generation provider is in scope. | UPSTREAM-OWED | agent-observed-live | wants-more | `docs/defects.md#GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-8` · `docs/specs/gnosis-enrichment-live-report-2026-09-15.md:§2.8` · `docs/HANDOFF.md:§"OPEN handoff items"` | upstream-package | `<none>` | keep | none | 2026-09-21 |
| `PRUNE-809` | A machine caller that mutates documents through the engine is granted or refused by a documented caller-authority contract that answers a denial with a structured code. | UPSTREAM-OWED | agent-observed-live | wants-more | `docs/decisions.md#GNOSIS-RBAC-EDIT-ENFORCEMENT` | `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-9` · `docs/decisions.md#GNOSIS-RBAC-CALLER-STORE` · `docs/HANDOFF.md:§"OPEN handoff items"` | upstream-package | `callerCredential` | keep | none | 2026-09-21 |
| `PRUNE-810` | The foundation declares shell-chrome regions and guarantees exactly one in-flow graph mount, so a fork needs no runtime-level mount sweep of its own. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-1 SHELL-CHROME-REGION-CONTRACT**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-1` · `docs/specs/astrographer-scope-realignment-review.md:§5.1` · `docs/HANDOFF.md:§"OPEN handoff items"` | upstream-package | `tearDownGraph` | keep-advisory | none | 2026-09-21 |
| `PRUNE-811` | The foundation owns one reusable pointer-gesture delegate that performs a single managed write per gesture and leaves a content click targeted at the pressed node. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-2 GESTURE-CONTROLLER**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-2` · `docs/decisions.md#PANE-DRAG-HEADER-ONLY` · `docs/specs/astrographer-scope-realignment-review.md:§5.1` | upstream-package | `installShellPointers` | keep-advisory | none | 2026-09-21 |
| `PRUNE-812` | The foundation ships an overlay frame primitive whose contract covers closed-means-out-of-flow, focus containment, background inertness, a dedicated scrim and documented agent visibility. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-3 OVERLAY-FRAME-PRIMITIVE**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-3` · `docs/decisions.md#MODAL-SETTINGS-REPARENT` · `docs/decisions.md#MODAL-DEDICATED-SCRIM` | upstream-package | `createModalController` | keep-advisory | none | 2026-09-21 |
| `PRUNE-813` | The foundation ships a root theme-token layer and an appearance controller in which an explicit light or dark choice beats the operating system and survives a restart. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-4 THEME-TOKEN-LAYER**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-4` · `docs/decisions.md#UI-CONFIG-CARRIER` | upstream-package | `applyThemeToRoot` | keep-advisory | none | 2026-09-21 |
| `PRUNE-814` | The foundation pins a zone-track layout contract: CSS-owned grid geometry, no resize listener, emptiness-derived collapse and serialized slot order. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-5 ZONE-TRACK-CONTRACT**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-5` · `docs/decisions.md#LAYOUT-IN-CSS` | upstream-package | `applyZoneTracks` | keep-advisory | none | 2026-09-21 |
| `PRUNE-815` | The foundation owns one focus and tab model that both a shell tab strip and an agent focus tool call, so the two surfaces reach the same state. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-6 FOCUS-TAB-SEAM**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-6` · `docs/decisions.md#MCP-UI-EQUIVALENCE` · `docs/decisions.md#MCP-FOCUS-TOOL` | upstream-package | `focusTarget` | keep-advisory | none | 2026-09-21 |
| `PRUNE-816` | The foundation ships a data-driven application-menu descriptor contract and a documented native-picker seam, with import semantics left to the app. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**SC-7 MENU-CATALOG-CONTRACT**"` | `docs/feature-requests/provident-electron-shell-chrome-requests.md:§SC-7` · `docs/decisions.md#IMPORT-ROOT-PER-STORE` · `docs/specs/astrographer-scope-realignment-review.md:§5.2` | upstream-package | `buildMenuTemplate` | keep-advisory | none | 2026-09-21 |
| `PRUNE-817` | The upstream package documentation states, per shell mechanic, what the framework can express, together with the rule-scoping question for stylesheet rules and the membership rule for boolean attributes. | UPSTREAM-OWED | user-directed-record | wants-more | `docs/pending.md:§"UPSTREAM foundation requests — the shell-chrome / expressibility set"` + `"**PS-1 SHELL-MECHANICS-EXPRESSIBILITY-MATRIX**"` | `docs/feature-requests/provident-ssr-expressibility-requests.md:§PS-1` · `docs/specs/ui-overhaul.md:§2.1` · `docs/specs/astrographer-scope-realignment-review.md:§5.1` | upstream-docs | `BOOLEAN_ATTRS` | keep-advisory | none | 2026-09-21 |
| `PRUNE-818` | Query traffic is served by the engine's retrieval routes with streamed results and parity to the app's ranked result shape. | UPSTREAM-OWED | contract-pinned | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-6 — query onto the engine**"` | `docs/specs/gnosis-offload-review.md:§8` · `docs/specs/gnosis-offload-proposal.md:§3.1` | upstream-package | `ragQuery` | keep | none | 2026-09-21 |
| `PRUNE-819` | Ingestion is served by an engine route that parses, validates and applies a corpus atomically with progress, cancellation and a cap. | UPSTREAM-OWED | contract-pinned | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-7 — ingestion onto the engine**"` | `docs/HANDOFF.md#O-7 INGESTION-ONTO-THE-ENGINE` · `docs/specs/gnosis-offload-review.md:§8` · `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-6` | upstream-package | `applyBatch` | keep | none | 2026-09-21 |
| `PRUNE-820` | The engine owns the persisted corpus across a cutover, with an accepted answer for split-brain and offline writes. | UPSTREAM-OWED | contract-pinned | wants-more | `docs/pending.md:§"PARKED DESTINATION — the engine track"` + `"**O-8 — authority switch / offline dual-path**"` | `docs/HANDOFF.md#O-8 AUTHORITY SWITCH / OFFLINE-DUAL-PATH` · `docs/specs/gnosis-offload-review.md:§8` · `docs/decisions.md#SINGLE-WRITER-STORE` · `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | upstream-package | `createJsonRagStore` | keep | none | 2026-09-21 |
| `PRUNE-821` | The upstream package and the adjacent foundation sources are read-only to this project; a gap found in them becomes a request, never a patch. | ENGINEERING-ONLY | contract-pinned | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"NEVER edit \`node_modules/provident-ssr/\` or \`../Preempt-Providence/\` source"` | `AGENTS.md:§"Process requirements"` (item 7) · `docs/HANDOFF.md` (head) | process/agent | `<none>` | keep | none | 2026-09-21 |
| `PRUNE-822` | Every UI element that is not part of the Electron shell is authored as provident data and driven through the producing graph. | UPSTREAM-OWED | contract-pinned | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"ALL non-shell UI must be rendered with the provident framework"` | `AGENTS.md:§"Project-wide constraint (UI rendering)"` · `docs/decisions.md#PANE-PROVIDENT-AUTHORING` · `docs/decisions.md#APP-GRAPH-PANES-MCP-VISIBLE` | app-graph | `assembleAppGraphEnvelope` | keep | none | 2026-09-21 |
| `PRUNE-823` | Markdown output carries formatting as element types, because the markdown adapter drops stylesheet and data props. | UPSTREAM-OWED | contract-pinned | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"\`MarkdownAdapter\` drops \`css:*\` (D5) and \`data:*\`/\`data-node-id\` (D7)"` | out-of-repo `../Preempt-Providence/docs/specs/adapters.md:§4.7` · `docs/decisions.md#MARKDOWN-EXPORT-ONLY` · `docs/decisions.md#MARKDOWN-EXPORT-ONLY-CARVE-OUT` | upstream-docs | `RagNodeType` | keep | none | 2026-09-21 |
| `PRUNE-824` | A state-slice mutation that targets a placement zone is refused synchronously, so a placement change goes through the dedicated placement op. | UPSTREAM-OWED | contract-pinned | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"\`state-slice\` mutation targeting a placement zone is HARD-BLOCKED"` | out-of-repo `../Preempt-Providence/docs/specs/node.md:§7.1` · `docs/decisions.md#RAG-AUTHORITATIVE` · `docs/decisions.md#CONTENT-EDIT-RE-TRAVERSAL` | upstream-docs | `placement-attach` | keep | none | 2026-09-21 |
| `PRUNE-825` | A content root owned by the content-owner token is dropped from compile until a real parent edge attaches it, so every subtree root is placement-attached to render. | UPSTREAM-OWED | contract-pinned | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"A \`contentNodes\`-owned content root is family-'in-tree' but DROPPED from compile until attached"` | out-of-repo `../Preempt-Providence/docs/specs/placement-path-spec.md:§2.4` · out-of-repo `../Preempt-Providence/docs/specs/translate.md:§2` · `docs/decisions.md#PANE-PROVIDENT-AUTHORING` | upstream-docs | `targetPlacement` | keep | none | 2026-09-21 |
| `PRUNE-826` | Retrieval stays local by default, and a remote embedding provider is reachable only through an enforced connect-source allowlist. | UPSTREAM-OWED | contract-pinned | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"No **EXTERNAL** network egress by DEFAULT"` | `docs/decisions.md#PROVIDER-AGNOSTIC` · `docs/specs/unit-f-embeddings.md:§5.7` · out-of-repo `../Provident-Electron/docs/pending.md#M-r12` | main-process | `DEFAULT_CONNECT_SRC` | keep | none | 2026-09-21 |
| `PRUNE-827` | Computationally intensive non-rendering work — document parsing, document change diffing, node-to-Provident assembly, graph enrichment and vector search — is handed to the Gnosis engine, leaving this project a presentation layer for the UI and the agent endpoint. | UPSTREAM-OWED | user-verbatim | wants-change | `docs/decisions.md#ARCH-GNOSIS-OFFLOAD` | `docs/specs/astrographer-scope-realignment-review.md:§"What the proposal asked"` (the user's statement verbatim) · `docs/defects.md#ARCH-GNOSIS-OFFLOAD` · `docs/specs/gnosis-offload-proposal.md:§1` | main-process | `buildTraversal` | keep-advisory | none | 2026-09-21 |
| `PRUNE-828` | This project keeps the render path — the snapshot pull, the traversal build, envelope assembly, legacy admission, compilation, the dual DOM and server emit and the content reconcile — while the engine may own only the store and the projection behind the traversal input. | ENGINEERING-ONLY | contract-pinned | n/a | `docs/decisions.md#ASTROGRAPHER-SCOPE-REALIGNMENT` | `docs/specs/astrographer-scope-realignment-review.md:§1.3`/§3.1/§3.3/§7.3(a) · `docs/decisions.md#ARCH-GNOSIS-OFFLOAD` | main-process | `assembleAppGraphEnvelope` | keep | none | 2026-09-21 |
| `PRUNE-829` | With no engine present every local path boots and behaves identically, and an engine-absent read reports a typed unavailable error rather than a silent no-op. | GNOSIS-ENGINE-SURFACE | contract-pinned | n/a | `docs/decisions.md#ENGINE-ABSENT-DEGRADED-CONTRACT` · `docs/decisions.md#ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` | `docs/specs/astrographer-scope-realignment-review.md:§3.4` · `docs/defects.md#DEMO-ENGINE-START-GAP` · `docs/defects.md#GNOSIS-SIDEBAR-SEAM-MISSING` · `docs/decisions.md#GNOSIS-D2-ENGINE-ABSENT` | main-process | `EngineUnavailable` | keep | none | 2026-09-21 |
| `PRUNE-830` | A document directory tree round-trips onto the engine's wiki structure, so folder structure survives a move to the engine store. | UPSTREAM-OWED | contract-pinned | wants-more | `docs/pending.md:§"PARKED (recorded gap with a named revisit condition)"` + `"**Gnosis mapping for document directories (directory → \`wiki\`)**"` | `docs/decisions.md#DOC-DIRECTORY-CATEGORY-GATE` · `docs/specs/document-directory-category-review.md:§4` · `docs/feature-requests/gnosis-engine-feature-requests.md:§GR-6` | upstream-package | `wikiId` | keep | none | 2026-09-21 |
| `PRUNE-831` | The sidebar pane surface becomes one module per pane plus a shared folder, with a single registry listing every pane and no change to any pane's behavior. | ENGINEERING-ONLY | user-directed-record | wants-change | `docs/pending.md:§"DEFERRED (lower-value / parked)"` + `"**FB-1/FB-2/FB-3 — the large-file decomposition set (fork-side refactor)**"` | `docs/feature-requests/sidebar-panes-decomposition.md:§FB-1` · `docs/specs/astrographer-scope-realignment-review.md:§5.2` | app-graph | `registerPanes` | keep-advisory | none | 2026-09-21 |
| `PRUNE-832` | The agent endpoint server is split by tool domain behind one tool-and-resource table and one context object, with no change to the tool contract. | ENGINEERING-ONLY | user-directed-record | wants-change | `docs/pending.md:§"DEFERRED (lower-value / parked)"` + `"**FB-1/FB-2/FB-3 — the large-file decomposition set (fork-side refactor)**"` | `docs/feature-requests/sidebar-panes-decomposition.md:§FB-2` · `docs/specs/mcp-endpoint.md:§3` | main-process | `registerTools` | keep-advisory | none | 2026-09-21 |
| `PRUNE-833` | The renderer runtime keeps its public method set while its coherent subsystems move into their own modules. | ENGINEERING-ONLY | user-directed-record | wants-change | `docs/pending.md:§"DEFERRED (lower-value / parked)"` + `"**FB-1/FB-2/FB-3 — the large-file decomposition set (fork-side refactor)**"` | `docs/feature-requests/sidebar-panes-decomposition.md:§FB-3` · `docs/decisions.md#MCP-UI-EQUIVALENCE` | app-graph | `loadEnvelope` | keep-advisory | none | 2026-09-21 |
| `PRUNE-834` | The main-process retrieval and store modules are candidates for the same decomposition, with no change to behavior. | ENGINEERING-ONLY | user-directed-record | wants-change | `docs/pending.md:§"DEFERRED (lower-value / parked)"` + `"**FB-1/FB-2/FB-3 — the large-file decomposition set (fork-side refactor)**"` | `docs/feature-requests/sidebar-panes-decomposition.md:§"Scan table — every file ≥1000 lines"` | main-process | `retrieval.ts` | keep-advisory | none | 2026-09-21 |
| `PRUNE-835` | Several named document stores are configurable, with a store selector on the retrieval and edit tools, per-store persistence and indexes, and a read-only listing in the settings surface. | SEARCH-RETRIEVAL | user-directed-record | wants-more | `docs/decisions.md#SINGLE-WRITER-STORE-PER-STORE` | `docs/feature-requests/multi-document-store-config.md:§"What the feature asks"` · `docs/specs/multi-document-store-config-review.md:§2` · `docs/decisions.md#FANOUT-INTERLEAVE-MERGE` | main-process | `buildRagStoreDirectory` | keep-advisory | none | 2026-09-21 |
| `PRUNE-836` | Rich-text HTML from the editing surface converts into a provident tree by pure modules, with a minimal diff applied as store edits. | EDITING-RICH-TEXT | contract-pinned | wants-more | `docs/decisions.md#RICH-TEXT-EDITING-GATE` | `docs/feature-requests/rich-text-html-to-provident-tree.md:§9` · out-of-repo `../Preempt-Providence/docs/rich-text-html-to-provident-tree.md:§1` · `docs/decisions.md#EDITING-MODE-SETTING` | main-process | `decomposeRichHtml` | keep | none | 2026-09-21 |
| `PRUNE-837` | The agent harness flags a turn that narrates an action it has not taken without calling the corresponding tool and interrupts a repeated no-advance turn. | ENGINEERING-ONLY | engineering-only | n/a | `docs/pending.md:§"UPSTREAM (imported constraints)"` + `"Agent Harness (DSH) loop-detection feature request"` | `docs/feature-requests/agent-harness-loop-detection.md:§"The failure mode to detect"`/§"Reference" · `docs/skills/process-guardrails.md:§"The ten guards (RCA-1..RCA-10)"` | process/agent | `<none>` | keep | none | 2026-09-21 |
| `PRUNE-838` | The engine takes ownership of a durable corpus, delivered through a durability design that covers format, atomic commit, crash recovery and revision semantics. | UPSTREAM-OWED | user-verbatim | wants-more | out-of-repo `../Gnosis/docs/pending.md:§"PARKED per the gate-1 review of the inbound GR-1..GR-9 set"` + `"**GR-7 server-side persistence for the engine store**"` | out-of-repo `../Gnosis/docs/specs/gnosis-gr-inbound-review.md:§"Open questions for the user"` (the user's answer verbatim) · out-of-repo `../Gnosis/docs/decisions.md#ENGINE-DURABLE-CORPUS-DIRECTION` · `docs/pending.md:§"PARKED DESTINATION — the engine track"` | upstream-package | `<none>` | keep-advisory | none | 2026-09-21 |
| `PRUNE-839` | The operator settings and configuration pane is loaded into an isolated graph scope, so an agent can neither read, list, dispatch nor mutate it. | SETTINGS-MODAL-THEME | user-directed-record | wants-more | `docs/decisions.md#OPERATOR-ISOLATED-GRAPHSCOPE` | out-of-repo `../Provident-Electron/docs/specs/module-feature-list.md:§"Additional module surface: management/settings pane"` · out-of-repo `../Provident-Electron/docs/decisions.md#MODULE-EXTENSIONS` · `docs/decisions.md#MODAL-SETTINGS-REPARENT` · `docs/decisions.md#MCP-UI-EQUIVALENCE` | app-graph | `createIsolatedScope` | keep-advisory | none | 2026-09-21 |

**§C.4 tallies (literal, from the table above).** **39 rows**, `PRUNE-801`–`PRUNE-839`, contiguous with no
gap and no reuse. **Verdicts:** `keep` **21** · `keep-advisory` **18** · `escalate-prune` **0** ·
`merged-into` **0**. **Provenance:** `agent-observed-live` 5 · `contract-pinned` 15 · `user-verbatim` 4 ·
`user-directed-record` 14 · `engineering-only` 1. **Direction:** `wants-more` 25 · `wants-change` 5 ·
`n/a` 9. **Capability:** `UPSTREAM-OWED` 28 · `ENGINEERING-ONLY` 7 · `GNOSIS-ENGINE-SURFACE` 1 ·
`SEARCH-RETRIEVAL` 1 · `EDITING-RICH-TEXT` 1 · `SETTINGS-MODAL-THEME` 1. **Owner class:**
`upstream-package` 21 · `upstream-docs` 4 · `main-process` 8 · `app-graph` 4 · `process/agent` 2.
**Owning project:** Gnosis engine 14 · Provident-Electron foundation 7 · Preempt-Providence package/docs 4 ·
this repo 13 · Agent Harness 1.

**The four Gnosis handoff rows, ENUMERATED (contract §3.6 / §9 (23)).**
**`GNOSIS-ENGINE-QUERY-MODE-IGNORED`** · **`GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`** · the **O-7
INGESTION-ONTO-THE-ENGINE** pointer row · the **O-8 AUTHORITY SWITCH / OFFLINE DUAL-PATH** pointer row.
`HOST-ENGINE-QUERY-POST-NO-ENVELOPE` is **NOT** one of the four (it is this repo's app-side status owner for
the GR-1 query route). The ledger's count is **≥ the named set** as §8 requires.

**The `PRUNE-820` model-claim correction (§C.7.4 pointer).** `PRUNE-820`'s `verdict_basis` sentence *"the
main-process single-writer store owns every write today"* **no longer holds**: the design-extensions gate
landing superseded it — `docs/decisions.md` **`DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`** (2026-09-21)
makes the **engine** the single writer of document content and turns the host's commit path into an **async
engine write**, superseding the `SINGLE-WRITER-STORE` clause. **§C.4 is never edited** (it is the non-prunable
ledger and every later cycle left it untouched), so the correction is **recorded here, in §C.8's change log,
and in §C.7.4's pointer** under the defect id **`CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM`** — the row's own
`status_pointer` set now carries both the superseded and the superseding decision row (see the table above).

---

## §C.5 — the frozen vocabularies and the citation discipline

**Status of this vocabulary block: FROZEN.** Four vocabularies, closed at the counts the unit contract pins
(`docs/specs/requirement-catalog.md` §3.4; census restated in that spec's §8):

| Vocabulary | Frozen count | Contract clause | Consumed by |
| --- | --- | --- | --- |
| `provenance` | **6 tokens** | §3.4 provenance table | row field 4 (MIRROR) |
| `direction` | **5 `wants-*` tokens + the `n/a` form = 6 legal values** | §3.4 direction list, **as amended by §9.1 item 17** (`wants-keep` added) | row field 5 (MIRROR) |
| `owner_class` | **10 tokens** | §3.4 owner-class list | row field 8 (JUDGMENT) |
| `verdict` | **5 forms** (one carrying an id argument) | §3.4 verdict list | row field 10 (JUDGMENT) |

**A new token is an amendment to the unit contract, never a silent addition.** No token below is invented,
and none may be added, renamed, split or merged by an authoring cluster, by the MERGE pass or by a later
amendment pass. **The direction vocabulary lands at the AMENDED count** (§9 (17): `wants-keep` is the fifth
`wants-*` token, with a three-part assignment test); the earlier "four `wants-*` tokens + `n/a`" reading
recorded in the CL-6 fragment is **superseded** by that amendment and is not quoted through.

**The assignment protocol (mandatory, one pass per row, in this order).**

1. **Evidence first.** Open the row's `evidence_pointer` **before** choosing a token (§3.3 field 4,
   §3.4 rule 4).
2. **The evidence decides `provenance`; the origin's ask decides `direction`; the surface decides
   `owner_class`; the row's condition plus its mechanical test decides `verdict`.**
3. **One token per field.** Where several candidates genuinely apply, the *most specific /
   highest-precedence* value is written in the field and the others are **named by name in
   `verdict_basis`** (§3.3 field 8's additional-classes rule).
4. **`n/a` is legal in exactly one field**, `direction` — and only when no direction was expressed. It is a
   **token of its own** for enumeration purposes; it is never written as `keep`-style prose and never as
   `NONE`/`-`/`—`.
5. **Rule R-A (the user-row rule; entailed by §3.3 field 5 + §3.4 rule 5):** **a row whose `provenance` is
   a `user-*` token may never carry `direction: n/a`.** `n/a` means "no expressed direction", which cannot
   be true of a `user-*` row; on such a row the same cell is a provenance/direction mismatch (`FS20`) and
   belongs in the adversarial finding set.
6. **A `user-*` row (and any row whose lineage touches a dangling citation) also never reaches a deletion
   verdict** — it freezes at `keep-advisory` (§3.4 rule 5, §3.6 freezes).
7. **Status verbs are forbidden everywhere in these vocabularies' cells** (§3.4 rule 6). The one legal way
   to name another document's state is a **pointer**.
8. **A `direction: n/a` row is never evidence that a requirement is unwanted.** `n/a` records the absence
   of an expressed ask; it never supports the absence-based clause of the prune criterion on its own.

### §C.5.1 Provenance — six tokens (field 4, MIRROR)

| Token | Definition (one sentence) | Assignment test — the question the author answers | Nearest-neighbour contrast (what makes the choice unambiguous) |
| --- | --- | --- | --- |
| `user-verbatim` | The user's own words, quoted. | **Can I paste a contiguous string in the user's own voice, from a reachable in-repo artifact, into this row's `evidence_pointer` — with no agent paraphrase in it?** | **vs `user-directed-record`:** if the only thing I can paste is an *agent's* sentence about what the user wanted, the token is `user-directed-record`. The contract requires the quote **plus its in-repo home**; a quote whose home is a non-repo place is not citable. |
| `user-directed-record` | A user instruction recorded in a decision/defect/pending row. | **Is the user's ask recorded as a ROW in a tracker — i.e. can I satisfy the evidence rule with that row's section pointer alone?** | **vs `user-verbatim`:** pointer-only evidence ⇒ this token; quoted user text ⇒ `user-verbatim`. **vs `agent-observed-live`:** if a user statement and an agent observation sit at the same site, the **user statement wins**. |
| `user-ratified-spec` | The user ratified a spec that binds the behavior. | **Did the user ratify the spec, table or decision that PINS this behavior — so that the pinning `path:§section` is a user act, not merely an agent-authored contract?** | **vs `user-directed-record`:** a ratification is not an instruction about the behavior; it is the user approving a *document* that binds it. **vs `contract-pinned`:** an agent-authored pin never ratified by the user is `contract-pinned`. |
| `agent-observed-live` | An observation recorded from the assembled app / a live run (not the user's words). | **Was this finding produced by an agent-run live session against the assembled app, and is there a live-record artifact that carries it?** | **vs `user-directed-record`:** an agent-run observation with **no** user statement behind it is this token. **Never prose alone** — the evidence must be a live-record artifact; a narrated observation with no artifact is an adversarial finding, not a row. |
| `contract-pinned` | A pinned contract in a spec/decision that is not user-verbatim. | **Does an agent-authored spec, decision or protocol pin this behavior, and can I cite the pinning `path:§section`?** | **vs `engineering-only`:** the decisive question is **externally observable?** — a pin over behavior a user/operator can observe is `contract-pinned`; a pin over internal harness/process behavior with no user-visible behavior is `engineering-only`. |
| `engineering-only` | A process/harness/measurement requirement with no user-visible behavior. | **If a user watched the assembled app and did nothing but use it, is there ANY observable difference when this requirement holds or fails?** If no ⇒ this token. | **vs `contract-pinned`:** if the honest answer is "no observable difference", the row is `engineering-only` — and that is the token that makes `direction: n/a` legal. |

### §C.5.2 Direction — five `wants-*` tokens + the `n/a` form (field 5, MIRROR)

| Token | Definition (one sentence) | Assignment test — the question the author answers | Nearest-neighbour contrast (what makes the choice unambiguous) |
| --- | --- | --- | --- |
| `wants-more` | The user wants this behavior to exist or to cover more. | **Does the origin ask for this behavior to EXIST, or for it to span MORE than it currently does — with no claim that its present shape is wrong?** | **vs `wants-change`:** `wants-more` leaves the shape alone and widens the footprint. **vs `wants-less`:** `wants-more` adds coverage; `wants-less` shrinks it. |
| `wants-less` | The ask is to reduce scope/quantity while keeping it. | **Does the origin want the thing to STAY but to occupy less — fewer rows, less space, less traffic, a smaller surface — without changing what it fundamentally is?** | **vs `wants-removal`:** `wants-less` keeps the behavior; `wants-removal` deletes the affordance. **vs `wants-change`:** a reduction in quantity is `wants-less`; a redraw of the mechanism is `wants-change`. |
| `wants-change` | The behavior exists and must change shape. | **Does the behavior already exist, and does the origin ask for its FORM to change (its model, its mechanism, its placement, its presentation) — neither to extend it nor to delete it?** | **vs `wants-more`:** the ask names the *existing* thing's shape, not an absent extension. **vs `wants-removal`:** the thing survives the change. |
| `wants-removal` | The ask is to REMOVE it. | **Is the recorded ask that the affordance/behavior should NOT EXIST at all?** | **vs `wants-less`:** if any version of the thing survives the ask, it is `wants-less`. **`wants-removal` is also the token that makes a contradiction with a "confirmed feature" pin visible rather than silent** — that pair is §C.7's `X-1`. |
| `wants-keep` (**added by §9.1 item 17**) | The behavior is to be KEPT in its current shape because the recorded report about it did **not** reproduce. | **Do all three hold: (i) an in-repo re-drive record exists (a `scenario authored <name>` / a live re-drive PASS) for the behavior's subject; (ii) that record contradicts the report the row's provenance rests on; (iii) the row's `statement` asserts the EXISTING behavior, not a change to it?** | **vs `n/a`:** they are **not** interchangeable — `n/a` is for a requirement with **no expressed direction at all** (contract/engineering rows); `wants-keep` is a **user-origin** row whose expressed ask is that the behavior stay. **vs `wants-less`:** the keep-class rows were once mis-stamped `wants-less`; §9 (17) orders the re-stamp and the mis-stamp is not reproduced here. |
| `n/a` | No expressed direction (engineering/contract rows). | **Has NO ask been expressed anywhere in the lineage — no user statement, no request doc, no pin whose clause names a desired end state?** | **vs every `wants-*` token:** the presence of any named desired end state removes `n/a`. **Rule R-A:** `n/a` is **never** legal on a `user-*` row. **vs `keep`-style prose:** `n/a` is a direction value, not a verdict. |

**`wants-keep` — the assignment test and its evidence rule (contract §3.4, §9 (17)).** A row may be stamped
`wants-keep` **only** when all three clauses above hold, and its `evidence_pointer` carries the **re-drive
artifact** (`path:§section` or `path scenario`) — the same evidence shape the keep-class
(`PASS-not-reproduced`) rows use. **Two register rows carry it: `PRUNE-602` and `PRUNE-603`** (the fix pass's
two keep-class rows). **The seven keep-class CHECKLIST rows** (`UF-KEEP-1`, `UF-KEEP-2`, `UF-KEEP-3`,
`UF-PANES-6`, `UF-STAGE-3`, `UF-SEARCH-1`, `UF-STAGE-4`) were re-stamped `wants-less` → **`wants-keep`** by
the landing pass in the checklist's own `Direction` column, per §9 (17)'s re-stamp order.

### §C.5.3 Owner class — ten tokens (field 8, JUDGMENT)

| Token | Definition (one sentence) | Assignment test — the question the author answers |
| --- | --- | --- |
| `app-graph` | A provident-authored UI element inside the app graph. | **Is the behavior delivered by an element authored as provident data (envelope node / handler body / hook / component binding) and driven through the producing graph?** |
| `shell-chrome` | The Electron shell's own chrome. | **Is it the shell's frame/geometry/formatting mechanic — the part that may only place/format provident-authored content and may not author pane body content?** |
| `native-menu` | The OS-owned application menu. | **Is the behavior the application menu template (its items, roles, accelerators, submenus)?** |
| `native-dialog` | An OS-owned dialog. | **Is the behavior an OS dialog (a file/folder picker or a native message dialog) rather than an in-page control?** |
| `launcher` | The start/launch script. | **Is the behavior delivered by the launch path (spawn flags, mode toggles, spawn-readiness checks, the launch policy)?** |
| `main-process` | The Electron main process. | **Is it enforced in main — the stores, the IPC handlers, the import/parse path, the MCP server, the engine proxy, the boot wiring?** |
| `test-harness` | The test/driver harness. | **Is the behavior a property of the test driver, the fixture, or the measurement harness rather than of shipped behavior?** |
| `upstream-package` | The adjacent upstream package. | **Is the requirement owed to the `provident-ssr` package?** **Never patched here** — an `upstream-package` row is an issue-handoff item and is non-prunable by construction. |
| `upstream-docs` | The upstream project's documentation. | **Is the requirement owed to an upstream documentation set rather than to upstream code?** |
| `process/agent` | Doc/process duties and the agents' own rules. | **Is the requirement a duty on this repo's documents or on the agents' process (a gate, a review, a tracker convention, a record-keeping rule)?** |

**Precedence rule (contract §3.4, restated as the assignment tiebreak):** **the MOST SPECIFIC class wins.**
The singular `owner_class` carries the primary class; the others are **named by name in `verdict_basis`**.

### §C.5.4 Verdict — five forms (field 10, JUDGMENT)

| Form | Definition (one sentence) | Assignment test — the question the author answers |
| --- | --- | --- |
| `keep` | The row stands on its own origin and needs no freeze. | **Does the row have a live origin, resolving pointers, and no freeze condition — so nothing needs qualifying?** |
| `keep-advisory` | The row stands, and the register flags it as advised rather than settled. | **Is the row one I cannot fully vouch for or one that is frozen — a `user-*` provenance row, a row on a dangling-citation lineage, or a row in a frozen condition?** |
| `escalate-prune` | The row is a candidate for deletion, subject to the sign-off gate. | **Do ALL THREE prune-criterion clauses hold, AND is the full positive-negative-evidence set present (an `origin_search` record over the enumerated source set, a documentation-reviewer confirmation, and survival of one full review cycle)?** |
| `invalidated-conflict` | The row's own pointers or authorities contradict each other, so the row is frozen until the next cycle. | **Do two owning pointers, two readings, or a tracker-vs-spec disagreement make it impossible to state one behavior — such that the row is frozen and named in §C.7?** |
| `merged-into:<id>` | The row's behavior is carried by another live row, and this row keeps its slot. | **Has this row's behavior been superseded by, or folded into, another register row — and does the target resolve to a LIVE row in the same artifact?** |

**Verdict-adjacent conditions (NOT verdict values — recorded in `verdict_basis` and constraining the form,
per §3.6's stale rule):** `stale` (its `last_verified` is strictly earlier than the manifest's newest input
digest date) · `invalidated-pointer` (a `status_pointer` or `evidence_pointer` does not resolve) ·
`invalidated-conflict` (the conflict condition above, when it is recorded as a *condition* rather than chosen
as the form). **`stale`, `invalidated-pointer` and `invalidated-conflict` rows may NEVER be pruned.**

### §C.5.5 The citation discipline and the `code_anchor` advisory clause (§3.4 rules 7 and 9, §3.5.1)

1. **Symbols, selectors and section refs ONLY — never line numbers** (§3.4 rule 7). Legal forms:
   `path symbol`, `path selector`, `path:§n.m`, `path:§<named section>`. A line number in a catalog-authored
   cell is `FS5`. The MIRROR side carries ids/anchors only, never copied prose.
2. **`archive/**` may appear ONLY inside a marked `[archive]` `evidence_pointer`** (§3.4 rule 8): it is
   gitignored and is **not evidence**; an `archive/**` pointer used as a `status_pointer` or as a canonical
   origin is `FS7`.
3. **`code_anchor` is ADVISORY** (§3.4 rule 9, C9): a symbol or grep token, or `<none>` (**the only field
   that legally admits `<none>`**), **never a line number**. The doc layer checks presence/shape only;
   symbol resolution is a **code-layer** check belonging to the deferred unit or a read-only audit pass,
   which may READ `src/**` and may never edit it. **A `code_anchor` that no longer resolves must therefore
   never be reported as "verified" from a doc-layer pass.** The two `<none>` anchors in §C.4 are
   `PRUNE-808`, `PRUNE-837`, `PRUNE-838`; in §C.3 they are `PRUNE-396`, `PRUNE-397` — plus the repaired pair
   `PRUNE-373` and `PRUNE-365`, whose `code_anchor` is **`<none>`** (the fix pass's `(S4)` repair: neither
   row's subject has a resolvable host symbol).
4. **Out-of-repo statements are marked out-of-repo** and cited by the fixed forms `../Gnosis/docs/...`,
   `../Provident-Electron/docs/...`, `../Preempt-Providence/docs/...` (§3.4 rule 10).

---

## §C.6 — the derivation manifest

**PROVISIONAL / MIRROR / `derived:false`.** The manifest below is the hand-derived manifest of the landed
edition. **The generator is NOT landed** (`generator:<none>`), so every MIRROR cell in §C.3/§C.4 is
**hand-derived and PROVISIONAL**, marked here (not per cell, §3.3) by `derived:false` +
`derivation:"hand-derived"`.

### §C.6.1 The manifest fields (contract §3.8)

| Manifest field | Landed value | Rule / note |
| --- | --- | --- |
| `artifact` | `docs/requirement-catalog.md` | fixed (§3.8) |
| `derivation` | `hand-derived` | this edition lands `hand-derived`; the generator is deferred (§3.12) |
| `derived` | **`false`** | every MIRROR cell is **PROVISIONAL** until the deferred generator lands (§3.3, §3.4 rule 2) |
| `generator` | `<none>` | this edition creates no generator; the deferred value is `scripts/catalog-derive.mjs` (§3.12, `docs/specs/unit-catalog-generator.md`) |
| `as_of` | **`2026-09-21`** | the deterministic as-of date, written explicitly and marked PROVISIONAL. **Never wall-clock, never mtime, never git, never a shell read** (§3.8 rule 1, §9 (5), `FS16`) |
| `last_verified` rule | **every §C.3/§C.4 row's `last_verified` = the manifest `as_of`** (= `2026-09-21`) | pinned by §9 (5); §9.1 item 18 restates it as "the as-of date of the pass that RESOLVED the row" |
| `newest_digest_date` | **`2026-09-21`** for **every** input row | the digest is the manifest's `newest_digest_date` per input, and `stale` is evaluated by comparing **dates**, not hash strings (§9 (4)). Read from the input's own content where a dated header exists, else falls back to `as_of`; **never** from mtime or other filesystem metadata. Consequence: with all inputs at `2026-09-21`, **no row is `stale` on landing day** |
| sentinel region | `<!-- catalog:derived:begin -->` … `<!-- catalog:derived:end -->` inside §C.6 and nowhere else | the deferred generator writes only inside it (§3.8 rule 3); on landing the region is **empty**, with the markers present |

### §C.6.2 `inputs` — the digest lines (19 inputs)

**Shape:** `path sha256:<hex>`. The digest lines below were **re-stamped by the C5 count-repair /
digest-re-stamp pass** (computed 2026-09-21 with `sha256sum`); the values are carried verbatim. **The
input set is a SET, not this fixed list** (`docs/specs/unit-catalog-generator.md` §3.2 field 2): a new
`docs/feature-requests/*.md` is an input automatically, which is why the tree gained
`docs/feature-requests/design-extensions-2026-09-21.md` after the first manifest was filled.

```
docs/defects.md sha256:857c000dcda3ccb32652309c232db4a9a9ef438d2dc3b0cadfbdb70875c981e1
docs/decisions.md sha256:2ec4336e1bdfbe85c9d1b47337f994bb9faebc4b2b07b6314de369616eb7f4f8
docs/pending.md sha256:dcbb0c85438d76ac4290d3c9a7bd6042c8f1ec39f370ea270c66bd9333ca6241
docs/next-steps.md sha256:ed3b6932e4a482a6f853221ce1a913fc7cd06bbfc456ed9af6d81c2201ebd85b
docs/specs/user-flow-audit-checklist.md sha256:b10e65abded1761a0c46b274c2ec81c2aa5c4dcf0e6d9f7786aee646b24eff6b
docs/HANDOFF.md sha256:e848a7c9c99ced3bfd3fe333b45114429dd10559d945516d61593e362b513069
docs/feature-requests/agent-harness-loop-detection.md sha256:3fd6d9da4badb1ef390a38bfa73ff2bb626f287b058b3583d0e7555577fd5ff4
docs/feature-requests/gnosis-engine-feature-requests.md sha256:dd57454611af07a0dc4c0ece9412ff4f09c466df1ec67a0ab8a9e4c386cd65d8
docs/feature-requests/multi-document-store-config.md sha256:cec60ac9131bf67f4e5b5295bd0ce30c601a88a4a37b9af87192dc1858516fd7
docs/feature-requests/provident-electron-shell-chrome-requests.md sha256:39e32a97add97a1d1cb835f6eb208f48242f0466b6967aef1e1820792bf8c37f
docs/feature-requests/provident-ssr-expressibility-requests.md sha256:6831a3cc17bde040efedc53774ab9a2811a199638683db4aa91c8920cb1cfcf9
docs/feature-requests/rich-text-html-to-provident-tree.md sha256:370f7b54f5d8c9c64c0e53eaa505b6f2710f141cde10eda417171daee28887f3
docs/feature-requests/sidebar-panes-decomposition.md sha256:39174517b4af7e33fe312244ebb8d6298efa50ab3dc009092eb8ee0305d62c9b
docs/feature-requests/design-extensions-2026-09-21.md sha256:25e1131b5c9eb1d605bde4e31c492126b532a3d1cf0de9ccad2c8c907248b8d1
docs/specs/user-demo-bug-report-2026-09-15.md sha256:885f1c92740fbb2b3e8bcf128a8e6ca12b129db7c13870fb927efd5ace8a5a5b
docs/specs/user-demo-bug-report-2-2026-09-15.md sha256:07ed331c1d6db917d0bf5c2129bf089cf9556ce0d9c8004d3e6b71259ab2e028
docs/specs/ui-overhaul.md sha256:ca35886eca95f708c9c40cf5cc424656aa605164cc16afa743c9e7cc1b06e963
docs/specs/user-flow-audit.md sha256:8089366ca504e88eb5806f5f1f71681c0bdbf673d55d586db47d0fbbca7a3c5f
docs/requirement-catalog.md sha256:<NOT COMPUTED AT THIS LAYER — the artifact's OWN digest is rule-compliant as a placeholder; the supervisor fills it after this rebuild>
```

**The catalog's own digest line — the rule and the owed value.** `docs/requirement-catalog.md`'s own sha256
**cannot be computed at this layer** and is deliberately left as the rule-compliant placeholder: **the
supervisor fills it after this rebuild** (`sha256sum docs/requirement-catalog.md`), because the file is
being rewritten by the pass that would have to hash it. **No value is invented here.** The deferred
generator replaces the hand-computed self-digest **mechanically** (its `derived_block.catalog_sha256` is the
hash of the catalog **in its pre-write state**, so filling the region is non-self-referential —
`docs/specs/unit-catalog-generator.md` §3.2 field 1).

**The report-#3 lineage is not a file** in the pre-C3 edition and therefore had no digest line: its content
lived as the prose block `docs/next-steps.md:§<USER-DEMO BUG REPORT #3 (2026-09-16)>` and was covered by the
`docs/next-steps.md` digest. **The C3 documentation review then committed the report as a document**
(`docs/specs/user-demo-bug-report-3-2026-09-16.md`, `DECIDED: REPORT-3-COMMITTED-AS-A-DOCUMENT`), so the
generator's input set carries that path; the prose block is retained verbatim as the historical record and
remains covered by the `docs/next-steps.md` digest. Its digest line is **not** in the 19-line block above
because the block was stumped before that document landed — **owed to the same shell-bearing pass** as the
artifact's own line.

**Per-input rows (`bytes`, `rows_read`, `newest_digest_date`).** `bytes` is **`not measured (doc-layer
pass)`** for every input at this layer — this edition had no shell, and `bytes` is likewise owed to the
first shell-bearing pass. `rows_read` is recorded where a cluster actually counted rows; elsewhere the owner
cluster's count stands. A missing input row is `FS12`; a missing field inside a row is `FS15`.

| Input | `bytes` | `rows_read` | `newest_digest_date` |
| --- | --- | --- | --- |
| `docs/defects.md` | not measured (doc-layer pass) | CL-3/CL-4 count (register origin search) + the 5 landing-pass rows | 2026-09-21 |
| `docs/decisions.md` | not measured (doc-layer pass) | CL-3/CL-4 count (register origin search); the design-extensions pass added 2 ACTIVE rows + 2 provenance clauses | 2026-09-21 |
| `docs/pending.md` | not measured (doc-layer pass) | CL-5 count (§C.4 ledger) + 1 SCHEDULED row + 1 PARKED row (`GN-2` enumeration) | 2026-09-21 |
| `docs/next-steps.md` | not measured (doc-layer pass) | 1 (the report-#3 prose block) + the §C.7 waiver rows | 2026-09-21 |
| `docs/specs/user-flow-audit-checklist.md` | not measured (doc-layer pass) | **112** (data rows; counted) | 2026-09-21 |
| `docs/requirement-catalog.md` | not measured (doc-layer pass) | this artifact — its own digest line is the placeholder above | 2026-09-21 |
| `docs/HANDOFF.md` | not measured (doc-layer pass) | CL-5 count (upstream-owed rows) + 4 rows from the design-extensions landing | 2026-09-21 |
| `docs/feature-requests/*.md` (**8 files**) | not measured (doc-layer pass), one per file | CL-5 count; `design-extensions-2026-09-21.md` read by the C4 amendment | 2026-09-21 |
| `docs/specs/user-demo-bug-report-2026-09-15.md` | not measured (doc-layer pass) | 10 verdict rows (I-1..I-10) | 2026-09-21 |
| `docs/specs/user-demo-bug-report-2-2026-09-15.md` | not measured (doc-layer pass) | 7 verdict rows (B1..B7) | 2026-09-21 |
| `docs/specs/user-demo-bug-report-3-2026-09-16.md` | not measured (doc-layer pass) | 7 item rows (C1..C7) — **added by the C3 review's fix (a)** | 2026-09-21 |
| `docs/specs/ui-overhaul.md` | not measured (doc-layer pass) | 0 (cited spec, **MUST-NOT-EDIT**, import-corpus input) | 2026-09-21 |
| `docs/specs/user-flow-audit.md` | not measured (doc-layer pass) | 0 (cited spec, **MUST-NOT-EDIT**, import-corpus input) | 2026-09-21 |
| `docs/specs/**` (the `unit-*.md` specs that are inputs) | grouped input | enumerated by the rule in §C.6.4 | 2026-09-21 |
| the report-#3 prose block | *(inside the `docs/next-steps.md` digest — not a separate file)* | 1 | 2026-09-21 |

### §C.6.3 `counts` — DERIVED, never asserted (C11)

| Count | Landed value | Rule for computing it / provenance of the figure |
| --- | --- | --- |
| `capabilities` | **16** | asserted by the contract (the closed partition, §3.2) — the **only** asserted count in this set |
| `tier1` | **44** | a literal count of the merged §C.2 table's rows: **27 populated + 17 structural zeros**. **Never** the contract's estimate `~40`, and never the first edition's 50 |
| `tier2` | **199** | **the count-repair pass's figure, and this reconstruction's literal count AGREES with it:** the register carries **74** CL-3 rows + **100** CL-4 rows + **4** fix-pass rows + **21** design-extensions rows = **199**. **Never** the contract's estimate `~90`. **The live/loser SPLIT is the part that does not reconcile:** the count-repair pass recorded **199 = 172 live + 27 `merged-into` losers**, while the literal register carries **173 live + 26 losers** (only 26 `merged-into:<winner-id>` rows exist in any source read here, and every one resolves to a live row). **One row of the split is therefore UNRECONCILED** and is owed to the next amendment cycle (§C.2.2's note, §C.8.1 C6) |
| `tier2_prunable_verdict` | **0** | the count of §C.3 rows whose `verdict` ∈ {`escalate-prune`, `keep`}: **zero in every cell of §C.2.1** — an explicitly tested reading, not an assumption. **Never** the contract's estimate `~70` |
| `upstream_owed` | **39** | a literal count of the §C.4 ledger's rows (`PRUNE-801`–`PRUNE-839`), and **≥ 21**, the named set (GR-1..GR-9, SC-1..SC-7, PS-1, the four Gnosis handoff rows **enumerated above**). **Never** the contract's estimate `~25` |
| `checklist_rows` | **112** | **DERIVED by a literal count of the `UF-<GROUP>-<n>` row ids** across the checklist's 14 data tables (per-group: 4+12+18+12+10+4+7+7+6+6+3+11+9+3). The file says "≈ 112" and D-GP-UFA-1 says "~112"; the landed, counted figure is 112 |
| `checklist_data_tables_gaining_columns` | **14** | a count of the checklist's 5-column header rows: 14 occurrences, `§1`..`§14`. **Corrected from the contract's asserted 13 by §9 (22)** |
| `checklist_provenance_census` | `contract-pinned` **60** · `user-directed-record` **31** · `agent-observed-live` **21** (0 `user-verbatim`, 0 `user-ratified-spec`, 0 `engineering-only`) | a per-cell recount of the landed `Provenance` column, section by section; sums to 112. **The CL-7 cluster's own summary table read 41/51/20; the landed recount is 60/31/21** and the summary cells are the wrong part (that fragment's own D6 note already discloses a mis-transcribed pair) |
| `checklist_direction_census` | `wants-more` **56** · `wants-change` **39** · `wants-keep` **7** · `wants-removal` **2** · `n/a` **8** (0 `wants-less` after the re-stamps) · 112 mapped · 0 `—` · 0 `UNDECIDED` | a per-cell recount of the landed `Direction` column; **a `wants-keep` grep returns exactly 7 data rows**; all 8 `n/a` rows are `contract-pinned` (`UF-SEARCH-4`, `UF-HIST-4`, `UF-PARITY-1`, `UF-PARITY-6`, `UF-PARITY-7`, `UF-PARITY-8`, `UF-PARITY-9`, `UF-PARITY-11`), so **no `user-*` row carries `n/a`** |
| `excluded_specs` | **stated BY RULE with a count floor of 118** — never a snapshot | **The archival pass now in flight moves historical `docs/specs/*-greens.md` and `docs/specs/*-live-pending-battery.md` files into the gitignored `archive/` tree**, so **any enumerated `excluded_specs` list would be stale the moment it lands and this file must not cite an archived path as canonical** (§3.4 rule 8). The rule therefore stands alone: **every non-input `docs/specs/**` path present at landing is an `excluded_specs` entry with exactly one reason class** — `EG` (a `unit-*-greens.md` path) · `LB` (a `unit-*-live-pending-battery.md` path) · `GV` (a `-review.md` path or a proposal/gate/verdict/report record) · `LNS` (every other non-input path) — and a path that is neither an input nor classifiable is the contract's `FS23`. **The floor is 118** (75 `EG` + 18 `LB` + 25 `GV` at the C3 review, whose own new document raised it from 117); the contract's §9 (25) records a **second, wider reading of 130 non-input paths** at the earlier authoring pass, and **the two are not reconciled** (owed to the next amendment cycle alongside the generator's enumeration duty). **Because the `EG`/`LB` classes are exactly the families the archival pass relocates, the floor is a LOWER bound and falls as the archive moves — the count is DERIVED, the rule is the pin** |
| `tier2_live` | **173** | the literal count of §C.3 rows whose `verdict` is not `merged-into:*` (`199 − 26`), of which **169** are `keep-advisory` and **4** are `invalidated-conflict`. The count-repair pass recorded **172**; the difference is part of the one-row split discrepancy above |

> **`checklist_rows_mapped_to_a_catalog_cell`** is **112** (every checklist row receives a `Catalog` cell; the
> cell is a **capability token** in all 112 cases and `—` in **0** cases), per §C.6.5 rule 1.

### §C.6.4 `excluded_specs` — the rule and its reason classes

Reason codes: **(EG)** unit `-greens` record · **(LB)** `-live-pending-battery` record · **(GV)**
proposal/gate/verdict/report record · **(LNS)** landed spec/record with no register role.

**Path-by-path enumeration is WITHDRAWN at this edition, by rule, with its reason recorded** (not silently
dropped): the **archival pass concurrently relocating `docs/specs/*-greens.md` and
`docs/specs/*-live-pending-battery.md` into the gitignored `archive/` tree** makes any enumerated list stale
on landing, and **this file must not cite an archived path as canonical** (§3.4 rule 8). What the catalog
therefore publishes instead:

1. **The rule** (§C.6.3's `excluded_specs` cell): every non-input `docs/specs/**` path carries exactly one
   reason class, and a path that is neither an input nor classifiable is **`FS23`**.
2. **The count floor: 118** (75 `EG` + 18 `LB` + 25 `GV`), with the contract's wider 130-path reading named
   as the unreconciled alternative.
3. **The enumeration duty is the deferred generator's**: `docs/specs/unit-catalog-generator.md` §4.3 closes
   the gap by **enumerating the tree mechanically** and reporting the true count, and its contract test
   asserts **the rule and the partition's exclusivity, never the number** (§5.3 rule 3). This is the
   artifact's recorded owed item, not an omission.

**The five named inputs that must NOT appear in `excluded_specs`** (they are inputs, and a first-edition
draft listed them only to reconcile the tree inventory): `docs/specs/ui-overhaul.md`,
`docs/specs/user-flow-audit.md`, `docs/specs/user-flow-audit-checklist.md`, and the report docs
(`docs/specs/user-demo-bug-report-2026-09-15.md`, `-2-2026-09-15.md`, `-3-2026-09-16.md`). **No path may be
dropped and no path may be counted twice.**

### §C.6.5 §C.6 sub-decisions (recorded so a later pass does not reinvent them)

1. **The `Catalog` cell vocabulary used for the checklist is the CAPABILITY token, in all 112 rows.** §9 (9)
   allows a `Catalog` cell to hold "a `PRUNE-###` pointer **or** a capability token", and §3.9 rule 6 says a
   checklist row "does not have to map to a register row". A capability token is a **frozen-vocabulary**
   value (the closed 16) whereas a `PRUNE-###` id is a pointer that can move. **A verdict must never appear
   in this column.**
2. **`derived:false` / PROVISIONAL marking is the manifest's job, not a per-cell marker.** A per-cell
   `derived:false` would be an unmarked-MIRROR/format drift and must not be added.
3. **The three checklist columns are NOT §C.3/§C.4 rows.** The 13-field schema binds the catalog's
   `PRUNE-###` rows, not checklist rows; **no `status_pointer`, `verdict`, `prune_signoff` or `last_verified`
   belongs in the checklist** — a verdict there would be a second status authority (§3.1 rule 1).
4. **The `excluded_specs` `(LNS)`/`(GV)` split is a bookkeeping partition; the total is what binds.**

### §C.6.6 The sentinel region + the determinism statement

<!-- catalog:derived:begin -->
<!-- catalog:derived:end -->

**No `Date.now()`, no mtime, no git and no shell input may appear in the derived region** (§3.8 rule 1, C3,
`FS16`). `as_of` is written explicitly (**2026-09-21**) and marked PROVISIONAL; `last_verified` equals
`as_of` on every row; **`newest_digest_date` is a DATE, not a hash string**, so `stale` is evaluable by a
comparison — and with every input at `2026-09-21`, **no row is `stale` on landing day**. The manifest digest
rule: **a row is `stale` when its `last_verified` is strictly earlier than the newest `newest_digest_date`
among the input rows**, and `stale` rows may **never** be pruned (§3.6). The generator (deferred) is
import-safe, writes only inside the sentinel region above, and proves determinism against a **frozen
fixture**, never against live prose (§3.8 rules 3–5; `docs/specs/unit-catalog-generator.md` §5.4);
regenerating the catalog obligates the deferred unit's test to re-run, a §C.8 change-log row, and the
item-10d reconciliation.

---

## §C.7 — Open conflicts + waiver ledger

**What this ledger is.** §C.7 is the catalog's honesty surface (§3.7): every issue that **cannot be resolved
mechanically** is named here, by name, rather than dropped or silently picked. Three row kinds live in it:
**conflict rows** (`X-n`), the **waiver rows** (§C.7.2), and the **pointer-resolution `warn` rows** carried
alongside the waivers (§3.5 rules 1 and 3 — a moved `anchor-token` pointer is a WARN, never a fail, and it
enters this ledger until re-pointed).

**The three rules this ledger implements (contract §3.7):**

- **Rule 1 — tracker governs (status).** Where the catalog and a tracker disagree about STATUS, the
  **tracker governs** and the catalog row is corrected in the next pass. But where the row's **own pointers
  contradict each other** (two owning rows, two readings), the row **freezes at `invalidated-conflict`**
  until the next cycle and is named here.
- **Rule 2 — tracker vs SPEC: neither governs automatically.** Where a **tracker** and a **spec** disagree,
  the catalog **freezes the row and records the conflict here**; it does not pick a winner. Resolving it is
  a **tracker/spec amendment owned by the documentation reviewer** — **NOT by this catalog.**
- **Rule 3 — waivers.** Every **unlinked tracker id** MUST be waived **by name** here with a reason; a
  silent omission is a fail-state. This ledger is also the only legal home for the closure duty's remainder
  (§3.10: for each tracker input, publish discovered / linked / unlinked counts, and waive every unlinked id
  by name).

**Frozen rows.** Every conflict row below freezes its catalog row(s) — the freeze column states the
`verdict` the register carries while the conflict stands. A frozen row remains **enumerated**, and a
`keep-advisory` / `invalidated-conflict` row is in the **never-prune set** (§3.6).

**Conflict-row fields:** `conflict id` | `Side A` (quoted, with pointer) | `Side B` (quoted, with pointer) |
`rule` | `freeze` | `resolution owner`.

**Status of this ledger.** **Fifteen conflict entries (`X-1`..`X-15`) were authored and carried by the C3
documentation review; the design-extensions amendment added two more (`X-16`, `X-17`), so this ledger
carries SEVENTEEN.** **TWO OF THE FIFTEEN ARE NOW RESOLVED BY TRACKER ROWS** — `X-1` (by
`DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`) and `X-2` (by
`DECIDED: REPORT-3-COMMITTED-AS-A-DOCUMENT` + the committed report document) — and **their register rows stay
frozen**: the resolutions settle the *conflict*, not the rows' freeze grounds (both remain `user-*` /
dangling-lineage rows). **This catalog resolves none of the remaining fifteen itself**: resolution is a
tracker/spec amendment owned by the documentation reviewer (§4.4), and where the amendment target is a
MUST-NOT-EDIT file, the amendment must be **raised as a tracker row** (see `X-1`'s resolution cell).

### §C.7.1 The conflict table

| id | Conflict (one line) | Side A (pointer) | Side B (pointer) | Rule | Freeze | Resolution owner + state |
| --- | --- | --- | --- | --- | --- | --- |
| **`X-1`** | **The MANDATORY contradiction:** `docs/specs/ui-overhaul.md` §1 constraint **C13** ("a **View menu** exposes a **pane-visibility selection dropdown** listing every registered pane with a visibility toggle", *confirmed by the user 2026-09-11*) vs `docs/defects.md` **`PANE-VISIBILITY-IRREVERSIBLE`**, whose recorded user instruction is to **REMOVE** the option (there is no way back to a hidden pane). The two cannot both hold. | `docs/specs/ui-overhaul.md:§1` C13 (quoted) + the same constraint's §4/§8 census rows + §7 Q11 | `docs/defects.md#PANE-VISIBILITY-IRREVERSIBLE` (symptom + fix-shape cells quoted) · the identical framing as **`N1 PANE-VISIBILITY-IRREVERSIBLE`** in `docs/next-steps.md:§CURRENT WORK / handover-state` (batch-5 block) · `docs/specs/astrographer-scope-realignment-review.md`'s C13 decomposition row | §3.7 rule 2 — tracker vs SPEC, neither governs automatically | `invalidated-conflict` with **both** pointers named in `verdict_basis`; the row is **doubly frozen** (both lineages are user-origin) | **RESOLVED (C3).** The **documentation reviewer** landed option (b): the ACTIVE decision row **`docs/decisions.md#C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`** supersedes C13's dropdown as a requirement, because option (a) — editing the constraint table in place — is **unavailable by construction** (`docs/specs/ui-overhaul.md` is a MUST-NOT-EDIT import-corpus input whose edit would move a measured corpus and its pins). **`PRUNE-127`'s freeze and value are unchanged**, and the removal itself is a UI unit's work with its own spec and live battery. |
| **`X-2`** | **The dangling "report #3" citation lineage:** *"report #3"* is cited as a SOURCE by nine locations while **no standalone report-#3 file exists**. The content is recorded — as a prose block — so the lineage is **dangling in address, not absent in content**. | The seven `docs/defects.md` rows whose titles cite it: **`TOP-BAR-NOT-FIXED`** (C1), **`NAMEPLATE-NO-SIDE-MARGIN`** (C2), **`TABLE-CELLS-NOT-EDITABLE`** (C3), **`FIND-IN-PAGE-NOT-WIRED`** (C4), **`DOC-NAV-NOT-A-TREE`** (C5), **`PANE-TOGGLE-FULL-REASSEMBLY`** (C6), **`DOC-TITLE-NOT-EDITABLE`** (C7) · the `docs/decisions.md` `WHOLE-PAGE-EDITING` row's source cell · `docs/specs/session-feedback-doc-audit-2026-09-16.md` §4 | **No standalone report-#3 file existed** at authoring: the committed reports were #1 and #2, and report #3 existed only as the prose block **"USER-DEMO BUG REPORT #3 (2026-09-16)"** in `docs/next-steps.md:§CURRENT WORK / handover-state`, whose items `C1`..`C7` match the citing rows one-for-one | §3.7 rule 2 read with §3.7 rule 3 and §6.4: a tracker/spec-level record defect **and** a lineage fact — a row whose lineage touches a dangling citation **freezes at `keep-advisory`** and can never escalate | `keep-advisory` on every row on this lineage (and on any `user-*` row by the same freezes clause) | **RESOLVED (C3).** Fix **(a)** was taken: the report is committed as **`docs/specs/user-demo-bug-report-3-2026-09-16.md`** and the ACTIVE row **`docs/decisions.md#REPORT-3-COMMITTED-AS-A-DOCUMENT`** records it; the `docs/next-steps.md` block is retained verbatim as the historical record; the defect row moved to **FIXED**. Fix (b) (repointing every citation) was **not** taken and is recorded as the alternative. **`X-2`'s lineage freeze is RETAINED** — nothing was un-frozen. |
| **`X-3`** | A **second, independent** contradiction inside the same C13 row: the constraint's **current-state** cell asserts the application menu does not exist, while two tracker records observe it and enumerate its items. | `docs/specs/ui-overhaul.md:§1` C13's current-state cell ("No application menu (`Menu` absent)…") + the same file's gap census (`SG3`) | `docs/defects.md#FIND-IN-PAGE-NOT-WIRED`'s reproduction cell (enumerating the `File` + `View` menus, no `Edit` menu, no `find` role) · the report-#3 block entry **C4** in `docs/next-steps.md` · `docs/pending.md`'s **`SC-7 MENU-CATALOG-CONTRACT`** row (the same census from the other direction) | §3.7 rule 2 | `invalidated-conflict` (both pointers named) | Documentation reviewer — a tracker/spec amendment; **option (a) is unavailable** for the same MUST-NOT-EDIT reason as `X-1` (raise as a tracker row). Still holding at the C3 re-read. |
| **`X-4`** | C15's "**DONE**" data-model cell vs the doc-nav defect row's live flat-list observation. | `docs/specs/ui-overhaul.md:§1` C15's current-state cell (path-qualified ids + root `documentPath` + `tags` landed; the tree UI is "the pending piece") | `docs/defects.md#DOC-NAV-NOT-A-TREE` (symptom cell: a flat list of 63 titles; root-cause cell: the store's documents carry NO `path` metadata, `path: []` on a live census) | §3.7 rule 2 | `invalidated-conflict` **on the row that would otherwise claim the data half**; a row authored for the *tree UI* alone is not frozen by this pair | Documentation reviewer — needs a **fresh** `rag.list_documents` path census against the current store plus the importer's path-persistence behavior. Still holding at the C3 re-read. |
| **`X-5`** | Pane drag: one decision row plus the defect row it closed record the gesture as repaired; two later defect rows record the same gesture still broken. | `docs/decisions.md#PANE-DRAG-HEADER-ONLY` (rationale cell: the header is the grab surface, exempt from the interactive-control guard; *FIXED + LIVE-CONFIRMED*) · `docs/defects.md#LIVE-UF2`'s status cell · `docs/specs/session-feedback-doc-audit-2026-09-16.md` §1 | `docs/defects.md#PANE-DRAG-NO-COMMIT` (a drag past the next pane gets no relocation) · `docs/defects.md#PANE-DRAG-TOP-ONLY` (only two panes respond; a dragged pane moves only to the TOP) · the session audit's §5 overlap census (*`PANE-DRAG-NO-COMMIT` ⊃ the residue of `LIVE-UF2`*) | §3.7 rule 1 — the row's own pointers contradict each other | `invalidated-conflict` (both owning pointers named) | Documentation reviewer — a **scope narrowing** of the decision row: true of the *seam*, not of the *end state*; a §SUPERSEDED row is the convention if the wording is replaced. Still holding at the C3 re-read. |
| **`X-6`** | The checklist's stale `Coverage` cells vs the repaired rows they cross-reference. | `docs/specs/user-flow-audit-checklist.md` rows **`UF-PANES-4`**/**`UF-DEFECT-2`** and **`UF-STAGE-2`**/**`UF-DEFECT-4`** (cells reading *confirmed defect*) | `docs/defects.md#LIVE-UF2` and `#LIVE-UF6` (both recording the repair) — with the checklist's own status block conceding the staleness without repairing the cells | §3.7 rule 2 read with §3.5 rule 4 | `invalidated-conflict` on any register row whose two pointers are a checklist row **and** the defect row it cites with a disagreeing verdict (a row pointed **only** at the defect row is unaffected) | Documentation reviewer. **The edit constraint is binding:** the checklist's existing cells **cannot** be repaired by the catalog unit (§3.9 rule 1 additive-only), so the amendment path is a separate tracker row or the reviewer's own pass. Still holding at the C3 re-read. |
| **`X-7`** | The "FIXED + LIVE-CONFIRMED" duplication claim vs the surviving nesting/typography residue row. | `docs/specs/session-feedback-doc-audit-2026-09-16.md` §1 (status-there cell) and its §4 ("DONE + LIVE-VERIFIED") | `docs/defects.md#DOC-HEAD-CONTAINS-FIRST-PARAGRAPH` (the opening paragraph still rendered inside the `h1`, taking the header's formatting) — with `LIVE-UF6`'s narrower, compatible repair reading for the duplication half only | §3.7 rule 2 (an artifact-vs-tracker disagreement about the same behavior) | `invalidated-conflict` on a row that carries **both** readings; a duplication-half row may carry the repaired reading and a nesting-half row the residue reading, **provided each names its own owning pointer** | Documentation reviewer — narrow the audit's row to the duplication half (the audit is a dated record; a superseding note is the convention). Still holding at the C3 re-read. |
| **`X-8`** | `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`: one row naming two different "current" artifact editions. | `docs/defects.md#O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`, status cell — **quoted**: *"the SIXTH-edition artifact is CURRENT and `M1`/`M2`/`M3` are live-verified"* (beside the same cell's later-run text) | The **SIXTH-RUN** and **NINTH-RUN** closure notes inside the same entry · `docs/pending.md`'s parked-transport row (*quoted*: "The M1-M3 unit's artifact is now the **NINTH edition**…") · `docs/next-steps.md`'s DONE row for the unit (*quoted*: "the current state is the **NINTH** O-0 live run") | §3.7 rule 1 (two readings inside the row's own lineage) read with §3.1 rule 1 (the catalog must not adjudicate which edition is current) | `invalidated-conflict` on any register row for the O-0 measurement-shape artifact, with **three** pointers named | Documentation reviewer — repair the stale "CURRENT" clause in place (or a bracketed supersession marker). **The two status cells quoted here are QUOTATIONS from their owning trackers** (§3.1 rule 1: quoted, never restated in the catalog's own voice). Still holding at the C3 re-read. |
| **`X-9`** | `O0-BAND-EXCEEDED-GATES-THE-REPORT`: the filing-time status still embedded in the row's own status cell. | `docs/defects.md#O0-BAND-EXCEEDED-GATES-THE-REPORT`, status cell — **quoted**: *"FIXED (2026-09-21): the gate is REMOVED and the band is a REPORTED finding"*, followed in the same cell by *"**SUPERSEDED FILING-TIME WORDING (kept as history)**…"* | The same file's later notes on the same row — **quoted**: *"THE ROW IS FIXED (2026-09-21)"* and *"THE ROW STAYS FIXED (2026-09-21) AND IS CONFIRMED LIVE ON THE RE-AUDITED ORACLE."* | §3.7 rule 1 (the row carries two self-descriptions; the file's convention retains superseded wording as history, so this is a **reading hazard rather than a live disagreement**) | `invalidated-conflict` (the filing-time clause named as the superseded side) **or** a `keep-advisory` freeze with the "SUPERSEDED … (kept as history)" label named in `verdict_basis` | Documentation reviewer — a bracketed live-status marker on the retained clause, or its removal from the status cell, **never** a silent re-write of the historical record. **The quoted status cells are QUOTATIONS.** Still holding at the C3 re-read. |
| **`X-10`** | Pane drag again: the checklist's live-PASS orientation for `UF-PANES-8` vs the pane-drag residue rows. | `docs/specs/user-flow-audit-checklist.md`'s later status block, listing the rows "Moved to live **PASS** this pass" (including `UF-PANES-8`) | `docs/defects.md#PANE-DRAG-TOP-ONLY`'s reproduction cell (the zone projection contains the zone container once plus four 0×0 gutters, so the only viable drop target resolves an insertion index of 0 for any gesture) | §3.7 rules 1 + 2 read together | `invalidated-conflict` on any register row that would treat "pane gestures work" as one behavior | Documentation reviewer — reconcile the checklist's per-row verdict with the defect row's measured limitation and record which pane-id set each verdict covers. Still holding at the C3 re-read. |
| **`X-11`** | The engine-owned "heavy document work" requirement vs the accepted structural gap. | `docs/defects.md#ARCH-GNOSIS-OFFLOAD` (a recorded architecture requirement with the user's statement behind it) + `docs/defects.md#HEAVY-OPS-FREEZE-THE-PAGE` (the live measurements) + `docs/decisions.md#ARCH-GNOSIS-OFFLOAD` (the landing order) | `docs/pending.md`'s parked-transport row (PARKED by the DEC-1 user decision) + `docs/decisions.md#O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED` (accepting that gap); the offload decision row names the engine track as deliberately **not** the scheduled work | §3.7 rule 1 (a tracker-vs-tracker disagreement) | `invalidated-conflict` (both owning pointers plus the parked row named); **additionally frozen at the user-lineage end** | Documentation reviewer — a scoping amendment (the engine-owned path is the parked destination; the scheduled work is the shell-side liveness set). Still holding at the C3 re-read. |
| **`X-12`** | **NOT a contradiction:** the **advisory aggregate** of tracker rows whose prose is saturated with line-number citations. | The tracker inputs themselves (`docs/defects.md`'s `O0-*` rows; the `docs/decisions.md` `PERSISTENCE`/`ASTROGRAPHER-SCOPE-REALIGNMENT`-class rows; the `docs/pending.md` `SC-*` rows; the long-form `docs/next-steps.md` provenance paragraphs) | `docs/specs/requirement-catalog.md` §3.4 rule 7 — the discipline **binds catalog-authored cells**, so a tracker row saturated with numeric location citations **does not propagate** them into the catalog | §3.4 rule 7's own aggregate clause (at most an advisory aggregate count) | **None.** This entry freezes nothing and is not a fail-state | The deferred generator + contract-test unit (its citation-discipline scan is the mechanizer). **Advisory aggregate: UNPUBLISHED, with its reason recorded** — no mechanical count over the tracker prose was produced and the contract permits at most an aggregate, so an unverified number would be worse than none. |
| **`X-13`** | The keep-lineage direction tokens. | The checklist's keep-class rows as authored (`wants-less`) | §9.1 item 17's amended vocabulary (`wants-keep`) and its re-stamp order | §3.4 direction vocabulary as amended | none — **DISCHARGED** | **RESOLVED (landing pass):** the seven checklist re-stamps are landed (`UF-KEEP-1/2/3`, `UF-PANES-6`, `UF-STAGE-3`, `UF-SEARCH-1`, `UF-STAGE-4` → `wants-keep`) and the **two `wants-keep` register rows exist** (`PRUNE-602`, `PRUNE-603`). Confirmed at the C3 re-read. |
| **`X-14`** | **The focus tool's authority vs the contract's tool table.** `provident.focus` is cited as an MCP tool (checklist **`UF-TABS-9`**; the `DECIDED: MCP-FOCUS-TOOL` row; catalog rows `PRUNE-152`, `PRUNE-375`) while `docs/specs/mcp-endpoint.md` **does not name it anywhere**. | `docs/decisions.md#MCP-FOCUS-TOOL` + `docs/specs/user-flow-audit-checklist.md#UF-TABS-9` + the `PG14` row's STALE-PREMISE annotation in `docs/specs/ui-overhaul.md` §5.1 | A `focus` grep over `docs/specs/mcp-endpoint.md` returns **no match**; the defect row **`MCP-FOCUS-TOOL-UNLISTED-IN-CONTRACT`** records the absence | §3.7 rule 2 (tracker vs SPEC) | `invalidated-conflict` on the register rows that depend on the tool's authority (`PRUNE-152`, `PRUNE-375`); **the defect row is the amendment path** | Documentation reviewer / the endpoint-contract owner — add the tool's row to the contract's §3 tool table, **or** record the tool as out-of-contract with the reason. **STILL FROZEN AND STILL TRUE** at the C3 re-read: the grep still returns no match and the defect row is still open. |
| **`X-15`** | **The ratified top-bar constraint vs the strip's scroll behaviour.** The user-ratified top-bar pin (the bar holds its position while content scrolls) vs `docs/defects.md#TABBAR-SCROLLS-AWAY`, which records the strip scrolling with the page. | `docs/specs/user-overhaul.md:§1` C14-class top-bar constraints + `docs/decisions.md#APP-BRANDING-IN-TOP-BAR` | `docs/defects.md#TABBAR-SCROLLS-AWAY` | §3.7 rule 2 | **the freeze pass's `(M3)` repair:** `PRUNE-100` and `PRUNE-101` are **re-pointed** at the owning **`TABBAR-SCROLLS-AWAY`** row, with **`LIVE-2` demoted to a labelled secondary pointer**; `PRUNE-100` carries the `keep-advisory`/freeze entry | Documentation reviewer. **The two `X-15` re-pointings are confirmed on the rows** at the C3 re-read, and `TABBAR-SCROLLS-AWAY` is still open in `docs/defects.md`. |
| **`X-16`** | **The GN-1 supersede-now reversal + the temporary-authority gap (added by the design-extensions amendment).** The `GN-1` ruling **reverses** a ratified ownership pin **now**, while the code still writes locally: until the P2 prerequisite units land, the contract says *engine-authoritative* and the implementation says *host-authoritative*. | `docs/decisions.md#ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (the `GN-1` ruling: the engine owns document CRUD; the host keeps a tab-scoped read cache; the write path becomes an async engine write) + its explicit **REVERSAL NAMED**: the `docs/specs/astrographer-scope-realignment-review.md` §3.3 "WRITE PATH (excluded by name)" row | The **code and the still-live local path**: `docs/next-steps.md:§CURRENT WORK / handover-state` — *"until they land, the contract says engine-authoritative while the code still writes locally"* — plus the four P2 prerequisite queue rows (`U-ENGINE-PERSIST`, `U-AUTHORITY-SWITCH` (O-8), `U-CORPUS-MIGRATION`, `U-READS-PIVOT`) that are **queued, not started** | §3.7 rule 2 read with §3.7 rule 1 — a tracker-row-vs-reality disagreement that the catalog must **name** rather than smooth: the two readings cannot both describe the present state | `keep-advisory` on the rows that carry the engine-authoritative requirement (`PRUNE-604`, and `PRUNE-615`/`PRUNE-618`/`PRUNE-619` where they depend on the async write path): the freeze records that the requirement is **pinned while unimplemented**, with the gap named | **The documentation reviewer + the supervisor** — the gap closes when the P2 prerequisite units land (each with its own spec, red set, green, adversarial pass and doc review, per RCA-2 one unit at a time). **Until then the register must not read the engine-authoritative rows as implemented behavior, and no row may be pruned on the strength of the reversal.** |
| **`X-17`** | **The collapsed-body pin vs the pure-`hidden` ask (added by the design-extensions amendment).** The landed collapse pin (`docs/decisions.md#PANE-DRAG-HEADER-ONLY`-adjacent collapse semantics + `docs/defects.md#LIVE-11 PANE-COLLAPSE-INERT`) holds that a collapse **restores the same pane identity and its body content** on the next activation, while the input's `PN-7` item requires collapse/expand to be a **pure `hidden` toggle on the pane body — no JS-level recalculation of the body contents**. | The landed pin: `docs/defects.md#LIVE-11` (the collapse control restores the same pane identity) + `PRUNE-125`'s own statement | `docs/feature-requests/design-extensions-2026-09-21.md:§2.3` item **`PN-7`** (a pure `hidden` toggle, no JS recalculation) — an ask whose mechanism is narrower than the landed behaviour | §3.7 rule 2 (a user input vs a landed pin) | `keep-advisory` on `PRUNE-125` and on the collapse-related `PANES` rows, with both pointers named: neither the landed restores-identity behaviour nor the asked-for pure-toggle mechanism wins in the catalog | Documentation reviewer — the input's `PN-7` is an unlanded ask (its gate has run; no unit is spec'd), so the resolution is a spec/tracker amendment naming which collapse semantics the app owes, **never** a silent re-read of `PRUNE-125`. |

### §C.7.2 The waiver ledger

**The rule (contract §3.7 rule 3 + §3.10).** For **each tracker input** the catalog publishes four counts —
**discovered ids**, **linked ids**, **unlinked ids**, and (for the id-less inputs) **anchor-tokens
resolved/failed** — where **discovered** = every row id in that tracker's own row grammar, **linked** =
referenced by at least one catalog row's `status_pointer` **or** `evidence_pointer`, and **unlinked** =
discovered − linked. **Every unlinked id is waived BY NAME here with a reason**; a silent omission is a
fail-state, and a newly added tracker row that appears in neither a pointer nor a waiver is its own
fail-state (`FS18`). **The waiver ledger is also the legal home for the pointer-resolution `warn`s.**

**Waiver-row fields:** `linked_id` | `kind` (id | section | anchor-token) | `reason` | `owner` |
`revisit_condition`.

#### (a) Per-input closure counts (the `(S2)` repair: each input's own figures, published)

| Tracker input | Its own row grammar | Discovered (counted) | Linked | Unlinked → waived | Anchor-tokens resolved / failed |
| --- | --- | --- | --- | --- | --- |
| `docs/defects.md` | bolded row ids in the row tables (§OPEN / §SHELVED / §FIXED) | **108** table rows whose first cell begins with a bold id token, **plus** the bold-id **note paragraphs** inside §OPEN (`O0-*` closure/confirmation/re-open notes) which **repeat ids already in the discovered set** and add none — *discovered is the union over both shapes*, and the deferred scan needs a grammar rule that does not double-count a note restating its own row id | the id-shaped pointers across §C.2/§C.3/§C.4 (every cited defect row id; 113 distinct in the first-edition pointer family) | **the unlinked remainder is not published as a list** — no mechanical linked/unlinked decomposition was produced by a doc-layer pass; **every id that appears in neither a pointer nor a waiver is `FS18`**, and the deferred generator's `closure.unlinked_unwaived` array is the mechanizer (`docs/specs/unit-catalog-generator.md` §3.2) | n/a (row-id grammar) |
| `docs/decisions.md` | `DECIDED:` row titles (the title IS the id) | **188** `DECIDED:`-titled rows at the CL-6 count (**187** beginning uppercase + **1** beginning lowercase); the catalog landing pass reported **189** afterwards, and the design-extensions landing added **2 more ACTIVE rows** + 2 provenance clauses — **the count moved with each tracker write, as `§C.8.2` rule 2 requires it to** | every cited `DECIDED:` name (§C.2/§C.3/§C.4's decision pointers) | **the id-less provenance rows** (the "PROVENANCE CLAUSE appended to the DEC-1 row above" family, **5** rows, + the design-extensions pass's **2** appended clauses) are addressed by **`section-ref`**, never by a row title — **waived as a class, by name, below** | n/a (row-id grammar) |
| `docs/specs/user-flow-audit-checklist.md` | `UF-<GROUP>-<n>` row ids over the data rows only | **112** (counted per section: 4+12+18+12+10+4+7+7+6+6+3+11+9+3) | **112** — every row's `Catalog` cell is a capability token, so every checklist row is linked by construction | **0** (no `—` cells and no `UNDECIDED` cells) | n/a (row-id grammar) |
| `docs/pending.md` | bolded rows across the six vocabularies (UPSTREAM / the SC·PS foundation set / SCHEDULED / DEFERRED / PARKED / SPECULATIVE) | **64** bold-led table rows | the rows cited by §C.4's `status_pointer`s and the §C.3 rows' pending pointers | **the §SCHEDULED retired-slot rows** (the section holds retired slots rather than live work) — **waived below**; **no id column exists**, so the rest are `anchor-token`-addressed | **resolved/failed not published** — the anchor-tokens resolve by heading + quoted opening at the pointers cited in §C.3/§C.4, and a moved anchor is a **WARN** that must appear in §C.7.2 (d) until re-pointed |
| `docs/next-steps.md` | **no row grammar at all** — **3** `##` headings (`CURRENT WORK / handover-state`, `OPEN`, `DONE`) | **no discovered-id count exists to publish for this input** | — | — | **anchor-tokens resolved/failed: not published** — this input is addressed **only** by `anchor-token` (heading + a quoted opening) and it **warns, never hard-fails** (§3.5 rule 1). The pointers actually used resolve: the report-#3 block, the "MANDATORY LIVE BATTERY RESULTS (2026-09-15" block, the "STORE RE-IMPORTED FROM CURRENT SOURCES (2026-09-16" block, the "GNOSIS-ENGINE FEATURE-REQUEST HANDOVER PREPARED (2026-09-16" block, the "NEXT QUEUE (in order — set by the two binding user decisions" block, the OWED SPEC ITEMS block, and the design-extensions gate-landing rows |
| `docs/HANDOFF.md` | upstream-owed rows under its own headings | **not counted by the catalog layer** | the §C.4 rows' `docs/HANDOFF.md` pointers (GR-1..GR-9 index, the Gnosis pointer rows, the O-7/O-8 pointer rows, the design-extensions pass's four rows) | **the resolved/closed rows** — waived as a class below | n/a (row-id/section grammar per heading) |

**Why the per-input linked/unlinked decompositions are not published as complete lists, with the reason
recorded.** The linked half depends on **every** pointer in a 200-plus-row register, and no doc-layer pass in
this edition could mechanically join the two sets; publishing a guessed decomposition would be worse than
none. **What is published instead:** the discovered counts above, the waiver classes and by-name waivers
below, and **the mechanizer's pinned duty** — `docs/specs/unit-catalog-generator.md` §3.2's
`closure: {discovered, linked, unlinked, waived, unlinked_unwaived}` block, whose contract test asserts
closure **by relationship** (per-capability counts sum to the row total; every unlinked discovered id appears
in §C.7 by name) rather than by a copied number (§5.2 rule 5, §5.3 rule 4).

#### (b) The id spaces that legitimately have no catalog row (the waiver classes)

| Waiver class (the id space) | Reason it has no catalog row | Classification rule (what puts an id in this class) |
| --- | --- | --- |
| **`ENGINEERING-ONLY` harness / process rows** — the O-0 harness and measurement-shape rows, register/pin items, doc/process duties | A row with **no user-visible behavior** cannot become a catalog behavior statement; the register indexes *behavior now expected*, and these rows index the *machinery that checks it*. | §C.1 capability 16's definition read with the `engineering-only` provenance token: if a user watching the assembled app sees no difference when the requirement holds or fails, the id is waived here. |
| **The `O0-*` measurement-shape / fixture-shape rows specifically** — the O-0 validator, band, aggregation, attribution, gate-probe and config-ceiling rows | These are **shape-oracle** rows over a measurement artifact: their consumers are the artifact, the driver and the oracle — not a UI behavior. | The same `engineering-only` class, **narrowed by owner class**: the row's `owner_class` resolves to `test-harness` (or `main-process` for a shipped oracle) and its evidence is an artifact section or a register row. Recorded as its own subclass because the count is large and the rows churn per live run. |
| **`HOST-*` implementation rows with no user-visible behavior** — internal hardening, totality/guard rows, journal-invertibility rows, prototype-key rows, store-copy field rows, label-string rows, and the host defect-resolution FIXED set | The behavior they pin is an internal invariant of the host (a guard, a copy field, a store branch): no user-visible end state distinguishes its holding from its failing. | The `engineering-only` class again, with the **observability test** as the rule: if the only falsifiable probe is a module call (not a rendered/observable surface), waive here. Rows that DO have a user-visible end state are **not** in this class. |
| **SUPERSEDED decision rows** | A row that a later decision replaced is **provenance, not current expectation**: the register indexes current expectations, and the replacing row carries the live expectation. | `docs/decisions.md` §SUPERSEDED membership, or an in-row supersession marker naming the replacing row. **Waiver reason must name the replacing row** |
| **Retired / archived pending rows** | A retired row's landed content **no longer lives in the pending file** (the file's own head rule archives it and removes it), so there is no live id to link. | The `docs/pending.md` head rule read with the retired-slot markers in §SCHEDULED. **The waiver must point at the landed owner** — an archived copy is **not** evidence and may appear only inside a marked `evidence_pointer` |
| **The id-less inputs' rows** (`docs/next-steps.md`; the ID-less `docs/decisions.md` provenance rows; `docs/pending.md`'s id-less prose entries) | There is **no id** to link or waive; the catalog must not pretend an id grammar exists. | §3.5's addressing table: address by **`anchor-token`** (warn-class) or **`section-ref`**, or record the row in the anchor-token resolved/failed counts. **Not a waiver-id** — the waiver table's `kind` column carries `anchor-token`/`section` |
| **Checklist rows with no register row** | The checklist is Artifact B, not a register: a row may map to a register row **or** to a capability token, **or** carry the empty-cell marker. | §3.9 rule 6: **that is legal and is not an unlinked-id failure** — the unlinked-id duty is about **tracker ids**, not checklist rows. Such rows are **recorded in the closure counts, not waived as ids** |

#### (c) Waivers, BY NAME (the classes above + every id the newest tracker writes minted)

| `linked_id` | `kind` | `reason` | `owner` | `revisit_condition` |
| --- | --- | --- | --- | --- |
| `ENG-GAP-1` (`docs/defects.md` §SHELVED; the same id in `docs/HANDOFF.md`) | id | A **shelved** upstream-package request whose recorded basis is a user ruling that markdown is export-only, with no consumer today; it pinpoints **no** current behavior expectation. | documentation reviewer (the waiver's upkeep) / upstream-docs for the request itself | The tracker row's own revisit clause: a markdown-as-input flow becoming supported. |
| `RAG-AUTHORITATIVE` · `SINGLE-WRITER-STORE` · `SINGLE-WRITER-STORE-PER-STORE` · `ENGINE-ABSENT-DEGRADED-CONTRACT` (the `docs/decisions.md` §SUPERSEDED rows) | id (row titles) | Replaced decisions retained as provenance. **The replacing rows are named:** `ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (for the first three) and `ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` (for the fourth) — all linkable, and **the originals stay in the table so their cited addresses still resolve** | documentation reviewer | Never — the replacement is linked instead; the waiver exists only so the §SUPERSEDED ids are not silently unlinked |
| The `docs/pending.md` §SCHEDULED **retired-slot** rows | id (bolded lead token) | Retired rows whose landed content is owned by unit DONE rows elsewhere; the section carries retired slots rather than live work. **The waiver points at the landed owner**, and the SCHEDULED section's own note names them | documentation reviewer | Retired-slot rows are removed by the next archival pass; the waiver expires with them |
| The `docs/decisions.md` **ID-less provenance rows** (the "PROVENANCE CLAUSE appended to the DEC-1 row above" family, **5** rows) + the design-extensions pass's **2** appended provenance clauses (`GNOSIS-LAUNCHER-TOGGLE`, `ASTROGRAPHER-SCOPE-REALIGNMENT`) | section | **No id exists** — the rows are addressed by `section-ref` only. Each carries evidence about an artifact edition or a clause amendment, not a behavior expectation | documentation reviewer | Never a waiver-id; if a register row ever needs one, it points by `section-ref` to the §ACTIVE table |
| The `docs/next-steps.md` prose rows (all three headings) | anchor-token | No row grammar exists (**verified**: three headings, no ids). The register addresses them by heading + quoted opening, which **warns** rather than hard-fails | documentation reviewer | Per landing pass: a moved anchor **must** appear here as a `warn` row or be re-pointed in the next pass |
| The `docs/HANDOFF.md` resolved/closed rows | id (row titles) | Resolved-upstream rows are historical; the upstream-owed **open** rows belong to §C.4's ledger instead (counted, never asserted) | documentation reviewer | When a §C.4 ledger row is authored for a still-open handoff item, the corresponding resolved row stays waived |
| **`REPORT-3-DANGLING-CITATION`** | id | **RESOLVED, not waived silently:** the row was filed OPEN by the catalog landing pass and moved to **FIXED** by the C3 review's fix (a) (the committed report document + the `DECIDED: REPORT-3-COMMITTED-AS-A-DOCUMENT` row). Recorded here because a fixed row is still a discovered id | documentation reviewer | The lineage's register rows stay frozen; if the document is ever moved, the archive rule requires a repoint in the same pass |
| **`CATALOG-CITES-NONEXISTENT-UNIT-SPEC`** | id | One of the **four corpus-defect rows** the catalog landing pass filed OPEN (§6.7 (a)); **still open** at the C3 re-read | documentation reviewer / the owning unit's pass | When the citation is repointed at the resolved path (`docs/specs/unit-l-textarea-editing-ui.md`) or the missing spec lands under the cited name |
| **`MCP-FOCUS-TOOL-UNLISTED-IN-CONTRACT`** | id | One of the four corpus-defect rows; **still open** — **linked**, because register rows `PRUNE-152`/`PRUNE-375` cite it (its waiver here is for the id's own closure, `X-14` carries the conflict) | documentation reviewer / the endpoint-contract owner | When the contract's tool table gains the tool's row, **or** the tool is recorded as out-of-contract with the reason |
| **`CHECKLIST-COVERAGE-CENSUS-MISMATCH`** | id | One of the four corpus-defect rows; **still open** — the checklist's §16 census still mismatches itself and stops at `LIVE-UF10` | documentation reviewer / the checklist's owning pass | When the confirmed-defect figure is recounted from the `UF-DEFECT-*` ids and the `F-1`/`F-2`/`F-3` findings are enumerated |
| **`LIVE-UF-ID-GAP-AND-TEN-DEFECT-ASSUMPTION`** | id | One of the four corpus-defect rows; **still open** — `docs/defects.md` still has **no `LIVE-UF3` and no `LIVE-UF4` row**, so **8** live-user-defect rows exist, not 10 | documentation reviewer | When the absent ids are recorded explicitly and every census that assumes a `LIVE-UF1..10` set is corrected. **No `LIVE-UF3`/`LIVE-UF4` id may ever be minted** |
| **`CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM`** | id | **Filed by this reconstruction pass (C6), recorded as owed to the tracker by the next shell-bearing/documentation pass:** `PRUNE-820`'s `verdict_basis` sentence *"the main-process single-writer store owns every write today"* **no longer holds** — `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` makes the engine the single writer of document content and the host's commit path an async engine write. **§C.4 is never edited**, so the correction lives in §C.4's note, in §C.8.1, and in the §C.7.4 pointer below | documentation reviewer | When the tracker row is filed and the §C.7.4 pointer is superseded by a linked row; the §C.4 row itself stays unedited by rule |
| **`CATALOG-MIRROR-COUNT-PHANTOM-FIELD`** | id | **Filed by the CATALOG-GENERATOR unit's authoring pass** (`docs/specs/unit-catalog-generator.md` §2.2), and **waived here by name:** the contract's prose says "**6 MIRROR + 7 JUDGMENT**" in four places (its status block, §3.3's MIRROR-marking paragraph, §8's schema census row, and §9.1 item 16) while **§3.3's field table marks only FIVE cells MIRROR** (`id`, `capability`, `provenance`, `direction`, `last_verified`) — so **13 = 5 MIRROR + 8 JUDGMENT**, and the "sixth MIRROR cell" **does not exist**. **The adjudication is the generator contract's:** the field table governs, the generator's write region is those five cells, and the "6 MIRROR + 7 JUDGMENT" summary is a **DOC DEFECT** | documentation reviewer + the catalog's next amendment cycle (a `600`–`799`-block amendment pass, §3.5.1 rule 5 — **no row is added by the correction and no id is retired**) | When the header/§C.3/§C.6 prose is corrected to **5 MIRROR + 8 JUDGMENT**; until then **this catalog's header and §C.3 note the defect rather than propagating the phantom count** |
| the 8 `n/a` checklist ids (`UF-SEARCH-4`, `UF-HIST-4`, `UF-PARITY-1`, `UF-PARITY-6`, `UF-PARITY-7`, `UF-PARITY-8`, `UF-PARITY-9`, `UF-PARITY-11`) | id | **Not unlinked** — they are linked through their own `Catalog` cells; waived here only to record that their `direction: n/a` is **legal** (each is a `contract-pinned` row with no expressed direction) and is **not** the `FS20` mis-stamp | documentation reviewer | Never — recorded so a later pass does not "correct" a legal `n/a` |

#### (d) The pointer-resolution `warn` rows (§3.5 rule 3)

| `linked_id` | `kind` | `reason` | `owner` | `revisit_condition` |
| --- | --- | --- | --- | --- |
| `docs/next-steps.md:§CURRENT WORK / handover-state` + `"**USER-DEMO BUG REPORT #3 (2026-09-16)**"` | anchor-token | A `warn`-class pointer by construction: it **resolves** at this edition (the quoted opening matches the landed prose) and it **enters this ledger on churn** rather than failing. **The quoted opening must be copied exactly** by any pass that re-points it | MERGE / the register's pointer author | At every landing pass: any pointer whose heading or quoted opening no longer matches is copied into this table with its expected opening and its nearest candidate opening. **Note:** the C3 review's fix (a) committed the report as `docs/specs/user-demo-bug-report-3-2026-09-16.md`, so this block is now **history** rather than the only home of the content — the pointer stays as the historical record and the register rows on that lineage stay frozen |
| `docs/pending.md:§"…"` anchor-tokens (the `O-6`/`O-7`/`O-8` engine-track rows, the `SC-1..SC-7`/`PS-1` rows, the `FB-1..FB-3` rows, the multi-store rows, the `GN-2` enumeration row) | anchor-token | All resolve by heading + quoted opening; `warn`-class on churn | MERGE / the register's pointer author | As above |
| the out-of-repo pointers (`../Gnosis/…`, `../Preempt-Providence/…`, `../Provident-Electron/…`) | section-ref (marked out-of-repo) | **Legal and marked** (§3.4 rule 10). They cannot be resolved from this tree; a **sibling tracker's churn warns, never fails** | documentation reviewer | When an out-of-repo pointer resolves, it is recorded as resolved; when the sibling moves, the pointer is re-pointed or the row is corrected |
| *(`docs/next-steps.md`'s and `docs/pending.md`'s full warn sets are recomputed each pass — this table carries the warn classes and the pointers whose openings the register actually quotes; an empty ledger would be visibly empty rather than silently absent)* | anchor-token | A moved `anchor-token` pointer is a **WARN, never a fail**, and **must** appear in this ledger until re-pointed | MERGE (the register's pointer author) | At MERGE and at every landing pass |

### §C.7.3 The merge pairings (the collapsed behavior pairs, recorded by name)

**Rule (§3.5.2 rule 3):** the pairing is recorded here **by name** (winner id + loser id + the one-line
reason) so the merge is visible rather than silent. **No row is deleted by a merge** (§3.6 merged rule): the
loser keeps its register slot with `verdict: merged-into:<winner-id>`, retains its `statement` and its own
pointers, and its `evidence_pointer` is **folded into the winner's `verdict_basis`** as a named pointer
(§3.5.2 rule 4). **The pair split, stated plainly (the `(S1)`/`(M6)`/C3 repairs):** the artifact's pairs are
**`14` §C.3→§C.3 collapses + `7` cross-section collapses whose survivor is a §C.4 ledger row (= 21)**; the
first edition's C1 change-log row read "19 §C.3 losers + 2 losers whose survivor is a §C.4 row", and that
summary is **corrected here as `14 + 7`**, recorded as a correction rather than a rewrite of the C1 row
(§C.8.2 rule 1).

| # | Loser (keeps its slot) | Winner (live) | One-line reason |
| --- | --- | --- | --- |
| 1 | `PRUNE-105` (`SHELL-CHROME`) | `PRUNE-127` (`PANES`) | one pane-visibility conflict; the loser carries the **spec side**, the winner the **tracker side** (§3.7 rule 2) |
| 2 | `PRUNE-170` (`STAGE-DOCUMENT`) | **`PRUNE-136`** (`PANES`) | one toolbar/history placement behavior; a container/placement change decides (§3.5.2 rule 1). **FOLD REPAIRED by the fix pass's `(M6)`: the winner is `PRUNE-136`, not `PRUNE-137`** |
| 3 | `PRUNE-315` (`HISTORY-UNDO`) | **`PRUNE-136`** (`PANES`) | one pane-frame placement behavior; the pane container owns the fix. **FOLD REPAIRED by `(M6)`: the winner is `PRUNE-136`, not `PRUNE-137`** |
| 4 | `PRUNE-171` (`STAGE-DOCUMENT`) | `PRUNE-316` (`HISTORY-UNDO`) | one control-shape ask about the history surface; that surface's capability owns it |
| 5 | `PRUNE-162` (`STAGE-DOCUMENT`) | `PRUNE-326` (`SEARCH-RETRIEVAL`) | one not-reproduced keep behavior about the search tab's stage content; the search surface owns it |
| 6 | `PRUNE-164` (`STAGE-DOCUMENT`) | `PRUNE-307` (`EDITING-RICH-TEXT`) | one dirty-edit queue behavior; its origin is the editing commit contract |
| 7 | `PRUNE-128` (`SHELL-CHROME`) | `PRUNE-340` (`SETTINGS-MODAL-THEME`) | one first-run enabled-panes default; the census read is a settings-modal behavior |
| 8 | `PRUNE-106` (`SHELL-CHROME`) | `PRUNE-333` (`SETTINGS-MODAL-THEME`) | one OS-appearance default; the theme control is the settings capability's |
| 9 | `PRUNE-107` (`SHELL-CHROME`) | `PRUNE-333` (`SETTINGS-MODAL-THEME`) | one tri-state theme behavior (same winner as #8) |
| 10 | `PRUNE-108` (`SHELL-CHROME`) | `PRUNE-334` (`SETTINGS-MODAL-THEME`) | one modal-default behavior |
| 11 | `PRUNE-109` (`SHELL-CHROME`) | `PRUNE-336` (`SETTINGS-MODAL-THEME`) | one scrim-close behavior; same modal-boundary reason |
| 12 | `PRUNE-112` (`SHELL-CHROME`) | `PRUNE-343` (`SETTINGS-MODAL-THEME`) | one UI-config serialization behavior; the carrier **is** the operator settings store |
| 13 | `PRUNE-341` (`SETTINGS-MODAL-THEME`) — the **alternative carrier** | `PRUNE-127` (`PANES`) | exactly **one** `invalidated-conflict` row may carry the C13/`PANE-VISIBILITY-IRREVERSIBLE` conflict (§3.5.2 rule 6). `PRUNE-127` is the carrier of record and `PRUNE-341` is merged into it — **the pairing is recorded, and `PRUNE-341`'s register slot and statement are retained** |
| 14 | `PRUNE-149` (`TABS`) | `PRUNE-326` (`SEARCH-RETRIEVAL`) | the doc-nav row-materialization behavior; the search/keep-row lineage carries the surviving keep behavior |
| 15 | `PRUNE-363` (`GNOSIS-ENGINE-SURFACE`) | `PRUNE-801` (**§C.4**) | same behavior, request-indexed in the ledger, which carries the owning project + local hedge |
| 16 | `PRUNE-364` (`GNOSIS-ENGINE-SURFACE`) | `PRUNE-802` (**§C.4**) | same behavior (the engine's mode/top-k honoring) |
| 17 | `PRUNE-365` (`GNOSIS-ENGINE-SURFACE`) | `PRUNE-803` (**§C.4**) | same behavior (the engine's vector index) |
| 18 | `PRUNE-366` (`GNOSIS-ENGINE-SURFACE`) | `PRUNE-808` (**§C.4**) | same behavior (the engine's enrichment/traversal routes) |
| 19 | `PRUNE-384` (`MCP-ENDPOINT-CONTRACT`) | `PRUNE-822` (**§C.4**) | same behavior (the non-shell-UI authoring rule); the §C.4 row carries the imported constraint source |
| 20 | `PRUNE-361` (`GNOSIS-ENGINE-SURFACE`) | `PRUNE-829` (**§C.4**) | same behavior (the engine-absent degraded contract); the §C.4 row carries the constraint source |
| 21 | `PRUNE-325` (`SEARCH-RETRIEVAL`) | `PRUNE-801` (**§C.4**) | same behavior (the engine query route's envelope/error contract); the §C.4 row carries the request index |

**Two further pairs are recorded but NOT collapsed**, because they are **same-capability** readings rather
than capability straddles: `PRUNE-386`'s doc-drift reading vs the endpoint spec's own scope statement, and
`PRUNE-312`'s toggle conflict vs `PRUNE-310`/`PRUNE-311` — the second is a §C.7 conflict recorded **by name**
(`X-14`'s family) and never frozen on `PRUNE-312`, because its two pointers are not both `status_pointer`s of
one behavior (§3.7 rule 1's freeze trigger).

**Rows that are NOT duplicates (checked, not absorbed):** `PRUNE-304` vs `PRUNE-310`/`PRUNE-311` (one
control-swap family, three distinct surfaces); `PRUNE-305` vs `PRUNE-307` (the default vs the control's
existence); `PRUNE-150`/`PRUNE-151` vs `PRUNE-325` (tab minting vs tab content); `PRUNE-315`/`PRUNE-316`
(one owner, two behaviors); `PRUNE-365`/`PRUNE-366` (one owner, two behaviors); `PRUNE-367`/`PRUNE-368` vs
`PRUNE-827`/`PRUNE-828` (the render-path and ownership clauses vs the proposal's statement and boundary
ruling). **`PRUNE-325` appears both as its own live row and as a `PRUNE-801` loser** — the two registers carry
the behavior exactly once each (the §C.4 row survives), and no id is counted twice.

### §C.7.4 Open pointer for `PRUNE-820` (the stale model claim)

| Pointer id | Row | What is wrong | Where the correction lives | Owner / revisit condition |
| --- | --- | --- | --- | --- |
| **`CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM`** | `PRUNE-820` (§C.4) | Its `verdict_basis` sentence *"the main-process single-writer store owns every write today"* **is no longer true**: `docs/decisions.md` **`DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`** (2026-09-21) makes the **engine** the single writer of document content and the host's commit path an **async engine write**, superseding the `SINGLE-WRITER-STORE` clause (which is retained in the §SUPERSEDED table so its cited address still resolves) | **§C.4 is never edited** (the ledger is non-prunable and every cycle has left it untouched), so the correction is recorded (a) in §C.4's own note above, (b) in the §C.8.1 change log (the C4 and C6 rows), and (c) here. `PRUNE-820`'s `status_pointer` set now names **both** the superseded and the superseding decision row | The documentation reviewer files the defect row and re-points the row's model claim in the next amendment cycle; the freeze/value of `PRUNE-820` (`keep`, non-prunable) is **unchanged** |

---

## §C.8 — the change log

### §C.8.1 The table

Rule for the columns: one row per **documentation-review cycle that re-verifies the catalog** (contract §3.7
rule 4 + §9 (13): "a review cycle is one landing pass of any unit that edits a tracker"). `what changed`
names the sections re-verified and the drift found — **rot becomes visible instead of silent**. `who` names
the role, not a person.

| `date` | `cycle` | `what changed` (sections re-verified + drift found) | `who` |
| --- | --- | --- | --- |
| 2026-09-21 | **C0 — the authoring/landing cycle** (the catalog's first edition; `derivation:hand-derived`, `derived:false`, `generator:<none>`) | **Created:** §C.0–§C.8, with §C.6's manifest PROVISIONAL and the nine landing-pass tracker rows written. **Re-verified against the inputs:** the checklist's row ids and count (112 rows, §1..§14), its 5-column header and separator shape, the "Total ≈ 112 rows" census block, the §16 per-surface figures (sum 112), the report-#3 dangling-citation lineage (7 defect rows + 1 decisions row + 1 next-steps prose block + 1 session-audit spec), the D-GP-UFA-1..4 rows, and the `docs/specs/unit-*.md` inventory (188 files). **Drift found:** (a) contract §3.9 rule 1 asserts 13 checklist data tables where the file has **14**; (b) §16's per-surface figures sum to 112 while the file labels the same figure "≈"; (c) the C13-vs-`PANE-VISIBILITY-IRREVERSIBLE` tracker-vs-spec conflict remains open. **Not changed:** no register row's verdict, no tracker row, no checklist cell. | `role_authoring_cluster` CL-1..CL-7 → merged by the **MERGE** pass |
| 2026-09-21 | **C1 — the MERGE cycle** | **Merged the seven fragments** into this single artifact by the contract §3.5.2 straddle rule: **one live row per behavior**, each straddle loser keeping its register slot as `merged-into:<winner-id>` with its **evidence folded into the winner's `verdict_basis`**; ids unique across the file; §C.2 from CL-2 (its 44-cell rollup, its structural-zero reasons, its aggregates) after **removing the partition double-counts**; §C.4 from CL-5 **unchanged** (39 rows, non-prunable); §C.5 + §C.7 from CL-6; §C.6 + §C.8 from CL-7 with **the counts recomputed from the assembled file, never copied from the contract's estimates**. **Drift found:** the first-edition pair split read "19 §C.3 losers + 2 §C.4-survivor losers" and is corrected to **`14 + 7`** (§C.7.3, recorded as a correction rather than a rewrite); the CL-3 header's per-capability id ranges disagreed with its own row table and the CL-4 header's figures with its table (both followed to the **row table**). **Not changed:** nothing deleted; no id retired or renumbered. | **MERGE** (the only writer) |
| 2026-09-21 | **C2 — the ADVERSARIAL FIX-PASS cycle** (the RCA-3 read-only adversarial pass's findings, applied) | **Re-verified:** every §C.2 cell against the register; §C.6.2's digests; the checklist's three landed columns. **Fixes applied:** **(M1)** the checklist counts **re-derived from the landed `docs/specs/user-flow-audit-checklist.md`**: **112 `UF-` rows across 14 table pairs**, provenance **60 contract-pinned / 31 user-directed-record / 21 agent-observed-live**, direction **56 wants-more / 39 wants-change / 7 wants-keep / 2 wants-removal / 8 n/a**, **112 mapped, 0 empty**; **(M2)** **four rows added for missing user statements** — `PRUNE-600` (the report-#1 I-7 pane-drag-commit ask), `PRUNE-601` (the report-#3 C4 find affordance), `PRUNE-602` (`UF-KEEP-1`), `PRUNE-603` (`UF-STAGE-3`); **(M3)** the **mis-pointer repairs** (`PRUNE-100`/`101` → `TABBAR-SCROLLS-AWAY` with `LIVE-2` demoted to a labelled secondary; `PRUNE-147`/`155`/`172` re-pointed at their owning rows; the freezes added to `PRUNE-100`/`152`/`375` with the `X-14`/`X-15` entries); **(M4)** the **arithmetic recomputed** so every figure is a literal row-id count; **(M5)** the **direction census re-derived from the cells**; **(M6)** the **merge-fold repair** — `PRUNE-170`/`315` → **`PRUNE-136`**, not `137`, with the fold recorded and §C.7.3's pair arithmetic corrected; **(S1)** the §C.2 partition **double-counts removed** (the cross-section citation rule, now (D2.1)); **(S2)** the waiver ledger's **per-input counts** + the "unpublished at this layer, mechanized by the generator" statement + the by-name waivers; **(S3)** the **section-reference drift fixed** and `X-8`/`X-9`'s quoted status cells **marked as quotations**; **(S4)** `PRUNE-373`/`365`'s `code_anchor` set to **`<none>`**. **Drift found:** the pre-fix figures (155 live / 174 authored / 19 losers / 50 cells) are superseded. | `role_adversarial_reviewer` → applied by the **fix pass** |
| 2026-09-21 | **C3 — the DOC-REVIEW cycle** (item 10d / RCA-6; record `archive/reviews/2026-09-21-requirement-catalog-doc-review.md` `[archive]`) | **Re-verified:** every one of the register's pointers (each `status_pointer` opened and its subject compared under §3.5.3's owning-row test), the §C.2.1 cell tally, the §C.4 ledger, the surface vocabulary, the direction census, the checklist's three censuses, and §C.6.3's `counts`. **Result: every pointer resolves and every `status_pointer` names an owning row.** **Fixes applied:** (1) the **`SHELL-CHROME × S-01` tie note** corrected to `wants-change 5 / wants-more 2 / wants-less 1` with the first edition's mis-statement named; (2) the **(D2.1) cross-section citation rule** added to §C.2.0; (3) the **§C.7.3 pair split** corrected to **14 + 7 = 21**; (4) the **`§C.6` → `§C.7` citation slips** fixed (`PRUNE-312`'s and `PRUNE-320`'s cells, and §C.4's re-homing paragraph); (5) **`X-1` RESOLVED** — `DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`; (6) **`X-2` RESOLVED** — the report committed as a document + `DECIDED: REPORT-3-COMMITTED-AS-A-DOCUMENT`; (7) the §C.7 intro now records that **two of the fifteen are resolved** with the freezes unchanged; (8) the **`excluded_specs` rule** restated (its count 117 → **118** by this pass's new document, and its enumeration now owed to the generator); (9) the **C3 change-log row** (this row) recording the cycles that preceded it. **Still owed (recorded):** the artifact's own sha256 line and the manifest's `bytes` column (no shell); the trio reading (a **reading**, never a green); the two oracle hashes' mechanical re-read. **Drift found but outside this pass's write set:** `docs/defects.md`'s `SUITE-RED-AFTER-VITEST5-ELECTRON44` row labels `217 / 4 913` "FINAL COUNTS" while the current reading is `221 / 4 988`. | `role_documentation_reviewer` |
| 2026-09-21 | **C4 — the DESIGN-EXTENSIONS AMENDMENT cycle** (`docs/feature-requests/design-extensions-2026-09-21.md`, its gate landed) | **Added:** **21 new §C.3 rows** in the **AMENDMENT / FIX-PASS block** with ids **`PRUNE-604`–`PRUNE-626` minus the withdrawn `PRUNE-607`** (whose gap is permanent — `PN-6` is already scheduled under the parked `FB-1`), each with the exact 13-field schema, `provenance: user-directed-record`, a non-`n/a` direction from the input, `prune_signoff: none`, `verdict: keep-advisory` (or `keep` where a contract pin holds), `last_verified: 2026-09-21`, an `evidence_pointer` at the input's §2 item id, and a `status_pointer` at a **landed** tracker row (`DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`, `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`, the amended `GNOSIS-LAUNCHER-TOGGLE`, the `docs/pending.md` rows, the `docs/next-steps.md` P2 rows). **Also added:** §C.7.1's **`X-16`** (the GN-1 supersede-now reversal + the temporary-authority gap) and **`X-17`** (the collapsed-body pin vs the pure-`hidden` ask); **§C.7.2's waiver/link rows for the newest tracker ids**; **§C.2.3's note on the affected cells**; **the corrected census**; and this change-log row. **§C.4 stays untouched** (39 rows, non-prunable). **No new capability, no new vocabulary token, and the `docs/specs/user-flow-audit.md` §5.U matrix untouched.** **Drift found:** `PRUNE-820`'s model-claim sentence has gone stale (see C6). | the **design-extensions gate-landing pass** → recorded by the **amendment pass** |
| 2026-09-21 | **C5 — the COUNT-REPAIR + DIGEST-RE-STAMP cycle** (the pass whose tool misuse destroyed this file) | **Re-stamped §C.6.2's digest lines** with the fresh `sha256sum` values (18 input lines; the artifact's own line left as the rule-compliant placeholder for the supervisor). **Applied the pass's recount:** **199 authored = 172 live + 27 `merged-into` losers**; **168 `keep-advisory` + 4 `invalidated-conflict`**; directions **41 / 70 / 52 / 5 / 2 / 2 = 172**; **27 populated cells + 17 structural zeros = 44**. **Applied the cell corrections:** `SHELL-CHROME × S-01` 6→7 · `SHELL-CHROME × S-14` 1→2 · `TABS × S-04` 7→6 · `TABS × S-03` 2→1 · `STAGE-DOCUMENT × S-14` 1→0 · `DOC-NAV-TREE × S-03` 3→4 with `wants-change`→`mixed`. **Also:** the `PRUNE-601` citation fix in the `SHELL-CHROME × S-01` cell; the closing tie note (`wants-change` 4 / `wants-more` 2 / `wants-less` 1 = 7); `tier2` 193→**199** and `inputs` 18→**19**. **Drift found: the recount's §C.3 authored/live/loser figures are UNRECONCILED against the fragments' own tables** (178 authored = 157 live + 21 losers + the fix pass's 4), **and both readings are carried forward rather than one being silently preferred** — see C6. | the **count-repair / digest-re-stamp pass** |
| 2026-09-21 | **C6 — the RECONSTRUCTION cycle** (this pass; the artifact had been destroyed by C5's mis-used whole-file write) | **Reassembled** §C.0–§C.8 from the seven staging fragments plus the surviving cycle records (the marker's recount, the C3 review record, the trackers, the generator contract), applying C1–C5's corrections in order. **Drift found and recorded, not absorbed:** (a) **the recount's live/loser split cannot be reconciled with the register's own rows** — the register carries **199 authored §C.3 rows** (which AGREES with the pass's `199`) with **173 live + 26 `merged-into` losers** (the pass recorded `172 + 27`), and **no 27th loser exists in any source read here**; both readings are published (§C.2.2, §C.6.3) and the one-row difference is **owed to the next amendment cycle**; (b) **`PRUNE-820`'s stale model claim** is recorded as the defect id **`CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM`** plus a §C.7.4 pointer, because §C.4 is never edited; (c) **`CATALOG-MIRROR-COUNT-PHANTOM-FIELD` is waived by name** in §C.7.2(c): the contract's "6 MIRROR + 7 JUDGMENT" prose contradicts §3.3's own field table, which marks **five** MIRROR cells — **13 = 5 MIRROR + 8 JUDGMENT** per the generator contract's adjudication; (d) the **`excluded_specs` enumeration is withdrawn by rule** in favour of a rule + count floor of **118**, because the **archival pass concurrently relocating historical `docs/specs/*-greens.md` and `*-live-pending-battery.md` files into the gitignored `archive/`** makes any snapshot stale and forbids citing an archived path as canonical; (e) **§C.3's 174 fragment-row `verdict_basis` prose is owed a re-hydration** from `archive/catalog-authoring/2026-09-21/CL-3.md` and `CL-4.md` (`[archive]`-marked pointers), and the ids/cells/pointers/counts are all present here; (f) **a real POINTER DRIFT, found by this pass's own pointer spot-check:** the **five defect rows the catalog landing pass filed** — `REPORT-3-DANGLING-CITATION`, `CATALOG-CITES-NONEXISTENT-UNIT-SPEC`, `MCP-FOCUS-TOOL-UNLISTED-IN-CONTRACT`, `CHECKLIST-COVERAGE-CENSUS-MISMATCH`, `LIVE-UF-ID-GAP-AND-TEN-DEFECT-ASSUMPTION` — are **NOT PRESENT in `docs/defects.md`** at this pass, although the `docs/next-steps.md` DONE row records that pass as having filed all five and **another spec cites them as filed** (`docs/specs/obsolete-document-disposition-2026-09-21.md` §D.4 finding F-5 records "the filed defect row `CATALOG-CITES-NONEXISTENT-UNIT-SPEC` (`docs/defects.md`)"). **The catalog does not fix a tracker**, so the five §C.7.2(c) waivers are retained **and flagged**: their `linked_id`s are **unresolved defect-row pointers** until the row is found (an archival pass may have moved it) or re-filed. **This is the one pointer family in this artifact that does not resolve, and it is named rather than dropped** (§3.5 rule 3); **(g) the defect ids this pass minted** — `CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM` and `CATALOG-MIRROR-COUNT-PHANTOM-FIELD` — are **waived in §C.7.2(c) and not filed**, because this pass owns no tracker write.
**Not changed:** no verdict, no id, no pointer target, no tracker row. | **reconstruction pass** (doc-layer) |
| 2026-09-21 | **C7 — THE `EN-2` FORWARD-FILING DUTY** (the contract's §9 (27), carried forward) | **Recorded so the next filing pass inherits it rather than re-deriving it:** **a user PERFORMANCE COMPLAINT is not a requirement; an ARCHITECTURE DECISION taken to resolve one IS a requirement** (`docs/feature-requests/design-extensions-2026-09-21.md` §1 Engineering ¶ / §2.10 `EN-2`). A row may be filed — or kept — on a complaint's behalf only with **all three** clauses: **(i) a falsifiable, user-visible END STATE** (a D-class live assertion with a real-input oracle; because `docs/specs/user-flow-audit.md`'s §5.U matrix is **FULL at 8 (U-1..U-8)**, such an assertion enters as an **EXTENDED (non-matrix) row ONLY** and `MATRIX_ROWS` must not change; a **`proxyPASS` is INVALID**); **(ii) an OWNING TRACKER ROW** under §3.5.3; **(iii) a LIVE MEASUREMENT** (`realInput: true`, and painted geometry for any `D-visual` claim). **Four binding negatives:** no new vocabulary token (§C.5 stays frozen); **no reclassification of any existing row** (**`PRUNE-129` KEEPS its `keep-advisory` freeze** — lifting it would hand a live-measured user defect a retirement mechanism); no effect on the verdicts of already-filed performance-complaint rows; and **`EN-1` is recorded as a REJECTED CAUSAL READING** against the accepted O-0 measurement (`docs/specs/unit-o-0-per-stage-breakdown.md`), never quoted as a rule and never used to justify a prune. **`O-5` is UNAFFECTED.** | `role_authoring_cluster` / the forward-filing pass |

### §C.8.2 The rule for future rows (binding)

1. **One row per cycle, appended — never rewritten.** A later cycle appends a row; it does not edit an
   earlier row (the log's whole value is that rot is visible over time). A correction to a previous row is a
   **new row** that names the row it corrects.
2. **A cycle = one landing pass of a unit that edits a tracker** (§9 (13)). Tracker edits that are not
   landing passes (an ad-hoc tracker fixup) do not open a cycle; a landing pass that edits no tracker does
   not re-verify the catalog and opens no row. **The catalog's own landing pass opened C0 and the
   documentation review opened C3; the tracker writes of the design-extensions gate landing opened C4.**
3. **Every row records the input digests read.** If the row cannot name the `sha256` values it read, it is
   not a re-verification and is `FS15`-adjacent. With the artifact's own line still unfilled, the rows above
   say so explicitly.
4. **A row must state the drift found, or state "no drift" explicitly.** A silent empty cell is forbidden.
5. **A row whose re-verification finds a contradiction records the conflict in §C.7 in the same cycle** and
   freezes the affected row at `invalidated-conflict` (§3.7 rules 1–2, `FS14`).
6. **This log is also the one-cycle cooldown's clock** (§3.6, §9 (13)): a row at `escalate-prune` may not be
   deleted until a **later** §C.8 row exists — i.e. it must survive one recorded cycle.
7. **`who` is a role, never a person and never a line-numbered reference.** Roles available:
   `role_authoring_cluster`, `MERGE`, `role_adversarial_reviewer`, `role_documentation_reviewer`.

---

## Provenance and process

**Written by.** The **MERGE** pass and its successor cycles (C1–C6, §C.8.1). **This artifact is the only
file the catalog's passes write**, apart from the staging fragments under the gitignored
`archive/catalog-authoring/2026-09-21/` tree and the review record under `archive/reviews/`.

**Layer.** **DOC-LAYER / ADVISORY.** No `src/**`, `scripts/**`, `tests/**`, envelope, renderer or app
behavior is changed or claimed by this document, and **no clause of it is app, envelope, store or live
evidence for anything** (RCA-12).

**Boundary evidence.** No `src/**`, `scripts/**` or `tests/**` write exists anywhere in the cycles that
produced this artifact; `docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`,
`docs/specs/unit-o-0-per-stage-breakdown.md`, `docs/specs/unit-o-0-per-stage-measurement.md` and
`docs/HANDOFF.md` are untouched (the two import-corpus files stay byte-stable, so their recorded digests
hold). The O-0 oracle identity (`src/shared/o0-report.ts` `b89d6f19` + `scripts/live-drive.mjs` `194dfece` =
composite `92a74b7d`) is **unchanged by construction**; the mechanical before/after re-read is owed to a
shell-bearing pass.

**Deferred.** `scripts/catalog-derive.mjs` + `tests/requirement-catalog-contract.test.ts`, with the named
trigger (`docs/specs/requirement-catalog.md` §3.12/§6.2, `docs/pending.md` §SCHEDULED, `docs/next-steps.md`
§OPEN's `(D-GEN)` row). **Its CONTRACT has landed** (`docs/specs/unit-catalog-generator.md`); **the
generator itself is NOT landed** (`derived:false`, `generator:<none>`). Once it lands, the MIRROR
re-derivation is a **one-command operation**
(`node scripts/catalog-derive.mjs --as-of <YYYY-MM-DD> --write`) over the §C.6 sentinel region alone — and
that command is also what fills the artifact's own digest line mechanically.

**Owed to the next cycles (recorded so nothing is silently dropped).**

1. The artifact's **own `sha256`** and the manifest's **`bytes`** column — owed to the first shell-bearing
   pass (the supervisor fills the digest after this rebuild; **no value is invented here**).
2. The **trio reading** (contract §4.5) — a **regression reading, never this unit's green**. The last
   recorded reading is 221 files / 4 988 passed / 58 skipped / 0 failed.
3. The **two oracle content hashes** before/after (contract §2.5) — unchanged by construction; the
   mechanical re-read is owed.
4. The **count reconciliation**: the register's literal count and the C5 recount agree on **`199` authored** but differ by one row on the live/loser split (**`173 + 26`** here vs **`172 + 27`** recorded), and a **per-cell id set is owed for the rows the fix pass and the design-extensions amendment added** (§C.2.2, §C.6.3).
5. The **re-hydration of the 174 fragment-row `verdict_basis` prose** from the two `[archive]`-marked staging fragments (CL-3/CL-4).
6. The **`excluded_specs` enumeration**, owed to the generator's mechanical closure (§C.6.4), with its floor of **118** and the archival pass's relocation of the `EG`/`LB` families in mind.
7. **The five filed defect rows must be located or re-filed.** Their ids are waived in §C.7.2(c) but **do not resolve in `docs/defects.md`** at this pass, while the `docs/next-steps.md` DONE row and `docs/specs/obsolete-document-disposition-2026-09-21.md` §D.4 F-5 both treat them as filed. **A shell-bearing or tracker-owning pass must determine whether they were archived with the historical tracker material (and repoint them) or re-file them**, recording which (AGENTS.md item 6c: never leave a citation pointing at a moved or absent row).
8. The **two minted ids this pass could not file**: `CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM` (§C.7.4) and `CATALOG-MIRROR-COUNT-PHANTOM-FIELD` (§C.7.2(c), together with the prose correction to **5 MIRROR + 8 JUDGMENT**).
9. The **`X-16` / `X-17`** amendments' resolution (the temporary-authority gap and the collapsed-body pin).
10. The **stray zero-byte scratch file** `docs/pending.md.newhash` recorded by the C3 review — it is not documentation, appears in no catalog pointer and affects no count, but should be deleted in the first shell-bearing pass.
