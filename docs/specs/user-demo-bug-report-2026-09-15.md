# USER-DEMO BUG REPORT — 2026-09-15 (9 user-reported UI/engine issues, all reproduced live)

**Layer (RCA-12).** Every row below is an **ASSEMBLED/RENDERED-app** observation (Electron on DISPLAY `:0`,
MCP `:3787`, CDP `:9222`, real CDP gestures + painted-box/DOM measurements). A node/envelope green
**cannot** satisfy any of them — the dom-shim is layout-less/CSS-less.

**How it was driven.** Live probes on the running app (operator store, 65 docs) via CDP
`Input.dispatchMouseEvent` (hit-tested) + `DOM`/`getComputedStyle`/`getBoundingClientRect` reads, plus
`provident.*` MCP probes for the engine legs. Each row states the exact observed value.

---

## 1. Verdict table

| # | User report | Verdict | Exact live observation |
| --- | --- | --- | --- |
| **I-1** | The system top-bar can scroll away — the user must scroll back to the top to change tabs / move the window; it should be fixed position | **CONFIRMED** | `#tab-strip` computed `position: static` (parent `.layout` also `static`); at `scrollY=0` its box is `y=-720`, at `scrollY=1200` `y=-1200` while `.layout` `y=-1073` — the strip and the window drag region scroll off with the content (page `scrollHeight` 5 300–27 629 px, so it is far off-screen). |
| **I-2** | Table formatting (e.g. the Active Decisions page) extends off the side of the page | **CONFIRMED (viewport-dependent)** | At `innerWidth ≥ ~2100` the 4 `#zone:main table`s fit (`mainW 1816`, `scrollW 1842`). Narrowing the viewport: **1440 → table overflow 670px**, **1280 → 830px**, **1024 → 1 086px**; `document.documentElement.scrollWidth` stays 2095 while `clientWidth` drops to 1425/1265/1009 — the page gains a horizontal scrollbar and the table runs off the side. No `overflow-x` wrapper on the table's parents (`wrap:false`). |
| **I-3** | The first paragraph is merged with the header formatting **and** duplicated (seen before) | **CONFIRMED (worse than reported)** | On the mounted `decisions` doc: `#zone:main` first child is `H1#rag-decisions:section:1` (`textContent` 461 chars) and its **nested** `P#rag-decisions:p:1` (`contenteditable`, 422 chars) is a descendant of that `H1`; a SECOND `P#rag-decisions:p:1` (`contenteditable`, same text) is a **direct child of `#zone:main`**. So the paragraph renders twice with the header styling the first time. **All three of the doc's first paragraphs are duplicated:** `rag-decisions:p:1/p:2/p:3` each exist **twice** with the identical `id` (3 duplicate ids, 6 editable hosts, 3 duplicated editable text strings). |
| **I-4** | Lots of text duplication — test for duplicate elements/text strings | **CONFIRMED** | Duplicate-`id` census on the stage: 3 duplicate ids (`rag-decisions:p:1|2|3`, each ×2); duplicated editable text strings with `count:2` each ("Maintained by the document-archival loop (AGENTS.md item 6).", "transaction primitive (a real transaction, not store.enqueue…", "| | 2026-08-28 | The new exported nodeText(node) helper…"). Inline runs also re-emit the parent id (`#inline-decisions:p:1-0 < #rag-decisions:p:1`), so `[data-rag-node-id]` matches 4 elements for one paragraph. The stage `textContent` is 148 863 chars for a doc whose body is ~55 k chars of tables — the duplication is user-visible page length. |
| **I-5** | undo/redo/history and the html/markdown toggle are still in the main window — they should be in panes | **CONFIRMED** | `#pane-history` `inMain=true`, `pane=null`; `#editor-toolbar` `inMain=true`, `pane=null`; `#editor-toolbar-toggle` `inMain=true`, `pane=null`; `.pane-frame [data-role="history"]` count **0**. All three live inside `#zone:main` (the canvas), not in a pane frame. |
| **I-6** | The html/markdown toggle triggers textarea editing — textarea is a pre-MVP testing UI to be discarded; Markdown mode should drop the HTML formatting and open the markdown data as plain text | **CONFIRMED** | Real hit-tested click on `#editor-toolbar-toggle` (`mode contenteditable` → `data-mode=textarea`, label `HTML` → `Markdown`): the stage materializes **815 `<textarea>`** hosts (`#textarea-decisions:section:1`, `#textarea-decisions:p:1` ×2 with the same id, …) and `contenteditable` hosts drop 6 → **0**. The markdown view is NOT the markdown source: the rendered text is the HTML-rendered body re-flowed (`"Astrographer — Active Decisions SummaryMaintained by the document-archival loop…"`, no `#`/table-pipe tokens), i.e. it drops the formatting affordance but still renders a form-control editor rather than plain markdown text. |
| **I-7** | Panes still can't be dragged | **CONFIRMED** | With `doc-nav`'s header hit-tested in-viewport (`hit=pane-collapse-doc-nav`, `y=340`, next sibling `search` `top 358 / bottom 532`) a real down + 3 moves + up ending at `y=526` produced **no order change**: before = after = `[gnosis-query, doc-nav, search, gnosis-documents, gnosis-wikis, crosslinks, template-editor]`. Event log: `["pointerdown:pane-collapse-doc-nav:340", "pointerup:pane-search:526"]` — the gesture starts on the header (the F-1 fix) but the drop never commits a relocation. (Note: the reorder *is* possible in one observed case — a `doc-nav` drag moved `search` to slot 3 — so the commit path is order/geometry-dependent rather than universally dead; the reported user experience — a simple drag past the next pane — reliably does nothing.) |
| **I-8** | Sidebar panes still minimize into horizontal/left-to-right alignment | **CONFIRMED** | Real click on `#zone-minimize-left` → 7 `#zone-tab-left-*` strips, EACH `writing-mode: horizontal-tb`, `text-orientation: mixed`, `transform: none`, sized short-and-wide (`96×21`, `57×21` "Search", `128×21`, `82×21`, `92×21`, `46×21`, `69×21`). The STRIP LAYOUT is a vertical column (distinct y 171→294, equal x=33) — which is why the older scenario passed — but the LABEL TEXT reads left-to-right, which is the reported defect. |
| **I-9** | Started without Gnosis engine | **CONFIRMED as an app-start gap; RESOLVED by running the engine** | With no engine: `gnosis.status` → `fetch failed` and the gnosis panes are empty/unavailable. After starting `GNOSIS_SERVER_OLLAMA_URL=http://127.0.0.1:11434 GNOSIS_SERVER_OLLAMA_MODEL=embeddinggemma ../Gnosis/target/debug/gnosis-server --port 8080` (`/engine/status` → `state:Ready`, subsystems all up) and relaunching the app with `--gnosis`: `gnosis.status` → `state:"Ready"` and the operator pane renders `"Gnosis engineState: ReadyVersion: 0.1.0store: upgraph: uplexical: upvector: upembedding: upreranker: uplastError: null"` — the `#gnosis-status-refresh` real click keeps it `Ready`. **Gap:** there is no single-command demo start that brings the engine up with the app unless `--mode=gnosis` is used, and the launcher's engine spawn silently fails if port 8080 is already taken (it then reports READY from the pre-existing server). |
| **I-10** | (added mid-pass) Opening/closing advanced search changes the search pane's position within the pane zone | **CONFIRMED** | Real click on `#advanced-search-toggle` (`data-expanded false → true`): the `search` pane moved from **slot 2** (`y=322`, h=173) to **slot 7** (`y=1181`, h=718, `fieldset` 139×544 painted) — the frame order changed from `[gnosis-query, search, gnosis-documents, doc-nav, gnosis-wikis, crosslinks, template-editor]` to `[…, search]` (search last), so the pane the user just used jumps to the bottom of the sidebar. The second toggle click then missed (`elementFromPoint=null`) because the control had moved. |

---

## 2. RCA — why the gates did not catch these

| # | Why the node suite missed it | Why the live battery missed it |
| --- | --- | --- |
| I-1 | `position: static` + scroll behaviour is **CSS/layout**; the dom-shim is deliberately layout-less (no cascade, no scroll geometry) — structurally unassertable in node (RCA-12). | The `uf_*` blocks assert geometry of the panes/zones, never the tab strip's `position` or its y after a scroll. The checklist has a row for the tab STRIP presence (UF-SHELL-1) but none for scroll-invariance. |
| I-2 | Table widths come from the CSS cascade + content; the dom-shim has no layout, so no test could see an overflow. | Every live run used the **2116-px-wide** display; the table fits at that width, so the defect only appears when the window is narrowed (≤1440). The battery never resized the viewport (no `Emulation.setDeviceMetricsOverride` block existed). |
| I-3/I-4 | The node fixtures use SIMPLE markdown (`# Title\n\npara`) which does exercise the double emission, but the traversal-level tests assert the **envelope/content-root set**, not "this RAG node appears once in the RENDERED stage" — the duplicate is produced by the materialization (nested subtree + standalone root), and the envelope legitimately contains two authored copies. `repro_dup_para` (the live block that DOES catch it) was authored only after a user report, and it was a DIAGNOSTIC block (unfalsifiable) until the D-GP-UFA driver repair — so its FAIL was never a gate input. | The checklist rows UF-STAGE-2 / UF-DEFECT-4 exist and this pass's report marks them FAIL — but they were **not** part of the §5.U matrix PASS/FAIL gate that a unit had to clear, and no row asserts a duplicate-`id`/duplicate-text CENSUS of the rendered stage (only the single `…:p:1` case). A census-level row is owed (see §3). |
| I-5 | The placement of the toolbar/history is a **mount/assembly** fact: node tests assert the AUTHORED ids/handlers exist (`editor-toolbar`, `pane-history`), and the dom-shim has no notion of "inside a `.pane-frame` vs inside `#zone:main`". | UF-HIST-1 exists and is a confirmed FAIL in the report — again not a gate input, and the toolbar/toggle placement rows (UF-HIST-1's siblings) were `NONE`. |
| I-6 | The toggle was tested as `data-mode` **state** (`toolbar_toggle`: "flips `contenteditable`→`textarea`") — the test BLESSED the very behaviour the user now rejects. There is no test of "what the markdown view renders" (textareas vs plain text), and the requirement itself (plain-text markdown, no form-control editing UI) was never written down as a spec row. | Same: the live block asserts the `data-mode` attribute — a **proxy PASS** of exactly the forbidden class. |
| I-7 | The pane-drag is pointer/geometry behaviour; node tests assert the pure helpers + the listener registration, never a real drop that commits a reorder. | The `user2_pane_drag` block PARKED (its precondition — an in-viewport sibling — was unmet) and the earlier recorded evidence was contested (NEW-1); the §5.U matrix row U-3 was about the body-click half only. So the "simple drag past the next pane reorders" assertion had no active, passing row. |
| I-8 | `writing-mode`/`text-orientation` is computed CSS — unassertable in node. | The keep-row scenario 3/`user3_collapse_orientation` asserts the **strip LAYOUT** (distinct y, uniform h, equal x) and passes; the **label orientation** row (UF-PANES-7/LIVE-UF10) is a confirmed FAIL in the report but was parked as a "known defect" rather than a gate input. The `uf_panes_8` block likewise passed on layout, not label text. |
| I-9 | Not a test gap — an **operational** gap: the engine is an external process the app never starts (`GNOSIS-LAUNCHER-TOGGLE` spawns it only under `--mode=gnosis`). | The gnosis rows were run with a manually started engine; the "app launched without an engine" path was only asserted as the `EngineUnavailable` D2 fallback, which is a correct failure mode, not a demo-readiness check. |
| I-10 | Frame ORDER after a disclosure toggle is an assembly/state fact — node tests assert the disclosure state and the pure search-pane render, not the zone slot order the reconcile produces. | No block asserted the pane's slot index/position across a disclosure toggle; `uf_search_2` asserted the fields' presence only. |

**Root pattern (RCA-12 class).** Nine of the ten rows are APP/CSS/assembly facts the node layer cannot see, and the live
rows that *could* see them either (a) were diagnostics rather than gate inputs, (b) asserted a **proxy** (attribute,
presence, strip layout) instead of the reported user-visible end state, or (c) were never authored (no census row for
duplicate ids/text; no viewport-resize row; no slot-stability row; no scroll-invariance row).

---

## 3. What must change in the gate (owed rows — not yet authored)

1. **A duplicate-render CENSUS row** (UF-STAGE-DUP): on a mounted document, assert (a) no RAG node id materializes
   more than one editable host, (b) no duplicate `id` in the stage, (c) no duplicated editable text ≥40 chars, and
   (d) the first paragraph of a `# Title` doc is NOT a descendant of the `[data-doc-head]`.
2. **A scroll-invariance row** (UF-SHELL-SCROLL): after `scrollTo(0, N)`, `#tab-strip`'s box y stays within the
   viewport (fixed/sticky), and the window drag region remains reachable.
3. **A responsive-width row** (UF-LAYOUT-WIDE): with the viewport set to 1280 (and 1024), no `#zone:main table`
   extends past `clientWidth` — the table must scroll/wrap inside a container, never widen the page.
4. **A placement row** (UF-HIST-1 extension): `#editor-toolbar`, `#editor-toolbar-toggle` and
   `[data-role="history"]` must be DESCENDANTS of a `.pane-frame` and NOT of `#zone:main`.
5. **A markdown-mode content row** (UF-STAGE-MD): after the toggle, the stage contains **zero** `<textarea>`s and
   renders the markdown source as plain text (a `pre`/plain-text content root), with no HTML-formatting affordance.
6. **A pane-drag commit row** (UF-PANES-DRAG): a real header drag past the NEXT sibling changes that pane's slot
   index (and survives a re-render) — not a diagnostic.
7. **A collapsed-label orientation row** (existing UF-PANES-7/LIVE-UF10) must be a GATE input, not a parked defect.
8. **A pane-slot stability row** (UF-PANES-SLOT): toggling a pane's disclosure/expansion does not change that pane's
   zone slot index.
9. **A demo-readiness row**: `--mode=gnosis` (or an equivalent single command) brings the engine up AND the app's
   `gnosis.status` reports `Ready` within the boot wait — plus a fail-loud when the engine port is already bound.

---

## 4. Fix queue implied by this report (proposed, not yet landed)

| Priority | Fix | Notes |
| --- | --- | --- |
| P1 | **I-3/I-4** — materialize each RAG node ONCE; the first paragraph must not nest inside the `[data-doc-head]`, and ids must be unique in the DOM | `src/main/traversal.ts` standalone-materialization + the nested `buildSubtree(section)` double emission; a node test CAN pin the envelope half (single content root per node), and the live census row pins the DOM half. |
| P1 | **I-6** — drop the textarea editing UI; HTML/Markdown becomes a plain-text markdown VIEW (no form controls, unique ids) | Touches the editing-mode contract (`EDITING-MODE-SETTING` decision must be superseded) + the docs row. |
| P1 | **I-1** — pin the tab strip (and the window drag region) as fixed/sticky in the shell CSS | `src/renderer/index.html`; needs the new scroll-invariance live row. |
| P2 | **I-2** — make tables scroll/wrap inside the content stage instead of widening the page | content-stage CSS + the responsive live row. |
| P2 | **I-7/I-10** — pane drag must commit a relocation for a simple "past the next pane" gesture, and a disclosure toggle must not change the pane's slot | `src/renderer/sidebar-panes.ts` drop/commit + the reconcile's slot allocation. |
| P2 | **I-5** — move the history segment + the editor toolbar (and its mode toggle) into a pane frame | pane-registry + the zone assembly; `unit-u-edit-2` owns the history sub-pane. |
| P3 | **I-8** — vertical bottom-to-top labels for minimized side zones | the existing LIVE-UF10 fix (CSS `writing-mode: vertical-rl` / rotation). |
| P3 | **I-9** — one-command demo start that brings the engine up (and fails loud on a bound port) | launcher only; no JS contract change. |

**Already-filed overlapping defects:** `LIVE-UF6` (duplicate editable paragraph) = I-3/I-4; `LIVE-UF5` (history in the
main canvas) = I-5; `LIVE-UF10` (collapsed labels horizontal) = I-8; the textarea/markdown complaint is NEW (no
existing row). Full defect rows live in `docs/defects.md`; this file is the user-report reconciliation record.
