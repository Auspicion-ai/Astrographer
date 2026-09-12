# Wave 1 — Open Decisions & Blockers (accumulator)

Per the user directive (2026-09-11): while drafting the Wave-1 unit specs, any
**blocker or open design decision** is recorded here and **addressed after all
Wave-1 specs are drafted** (not inline). Each item has an ID (`W1-Qn`), the unit
that raised it, the question, options, and a proposed default.

Status legend: **OPEN** (needs a ruling) · **DEFERRED** (blocks a later wave) ·
**RESOLVED** (with the resolution).

| # | Unit | Question / blocker | Resolution |
| --- | --- | --- | --- |
| **W1-Q1** | U-MENU-1 | Native vs provident menu bar | **RESOLVED — native** `Menu.setApplicationMenu` (shell carve-out) |
| **W1-Q2** | U-MENU-1 / U-SHELL-8 | Pane catalog transport | **RESOLVED — push on boot + on registry change** (new IPC) |
| **W1-Q3** | U-MENU-1 | Menu action execution home | **RESOLVED — split**: dialog in main (fs); actions route to the host over IPC |
| **W1-Q4** | U-SHELL-2 | Theme application surface | **RESOLVED — (a)** `:root` custom properties set by the shell |
| **W1-Q5** | U-SHELL-2 | `system` live re-resolve | **RESOLVED — (a)** live `matchMedia`, persisted |
| **W1-Q6** | U-EDIT-1 | Markdown/HTML semantics | **RESOLVED — (a)** Markdown↔textarea, HTML↔contenteditable; editor control |
| **W1-Q7** | U-EDIT-1 | Toggle placement | **RESOLVED — (a)** central-stage editor toolbar (app-graph) |
| **W1-Q8** | U-SHELL-6 | Hover token + coverage | **RESOLVED — (a)** `is-clickable` on every handler node + cssDef `:hover` |
| **W1-Q9** | U-PARITY-C18 | Advanced-search fields | **RESOLVED — as proposed** (all `rag.query` args + `filters` + `stores:'all'` + C15 fields) |
| **W1-Q10** | U-PARITY-C19 | Hover-preview content/timing | **RESOLVED — as proposed** (linked section / doc opening; 0.5 s; hoverable) |
| **W1-Q11** | U-PARITY-PARTIALS | `code.template.validate` UX | **RESOLVED — (a)** explicit Validate button + inline feedback |
| **W1-Q12** | U-PARITY-PARTIALS | `gnosis.document.update` (HC1) | **RESOLVED — PARK the edit surface** (option (c)): remove/disable the fake empty-graph Update control (NO fake update); keep the real verbs; the graph edit is deferred (see §A) |
| **W1-Q13** | U-PARITY-PARTIALS | `rag.get_document` scoped-subgraph UI | **RESOLVED — DEFER with G3** (option (b)): the PARTIAL stands until the knowledge-graph inspectors unpark (see §B) |
| **W1-Q14** | U-PARITY-DECISIONS | PG12 module-tool runner | **RESOLVED — (a)** operator-only runner (never MCP) |
| **W1-Q15** | U-PARITY-DECISIONS | PG13 assistant suggestions | **RESOLVED — parity required** (no UI-only carve-out; see §C) |
| **W1-Q16** | U-PARITY-DOCNAV | PG14 doc-nav dispatchability | **RESOLVED — (a)** give doc-nav items a select handler |
| **W1-Q17** | all Wave-1 | Per-unit spec + red set | **RESOLVED — as proposed** (specs drafted; per-unit TDD next, RCA-2) |

## A. W1-Q12 — `gnosis.document.update` (HC1, hollow) — elaboration

**The problem.** The G5 `gnosis-documents` pane's Update button calls
`gnosis.document.update` with a literal `{ nodes: [], edges: [] }`
(`src/renderer/gnosis-crud-panes.ts:132-139`). It "succeeds" and blanks/revisions
a document but cannot edit its content — the panel is fake. Gnosis's real wire
shape is `updateDocument { callerId, documentId, baseRevision, graph:
{ nodes[], edges[] }, title?, tags? }` with optimistic concurrency.

**The options:**

- **(a) A real graph editor inside the G5 pane.** Build node/edge editing for
  Gnosis documents in the pane (add/remove/edit nodes + edges, then submit the
  whole `graph`). Pro: self-contained. Con: duplicates the G1 editor; the G5 pane
  would grow a second document editor.
- **(b) Route Gnosis edits through the G1 editor** (my earlier default). Load the
  Gnosis document's graph into the app graph, edit with the existing
  textarea/contenteditable machinery, and on commit serialize the graph back and
  call `gnosis.document.update` with the real `graph`. Pro: one editor.
  Con: needs a read→edit→serialize→update loop + a **local-graph ↔ Gnosis-wire
  mapping** (the local `RagNode`/`RagEdge` shapes are not Gnosis's `nodes[]/edges[]`),
  and the G1 editor currently commits to the local RAG store, not the Gnosis
  proxy — so the commit seam must be made engine-aware.
- **(c) Park the edit surface.** Remove/disable the G5 Update button; keep the
  real verbs (create/delete/publish/unpublish/archive/list/get). The pane stops
  faking an update. Revisit when the Gnosis edit wiring (graph mapping + commit
  seam) is designed.
- **(d) Minimal honest update.** Make Update edit only the **title/tags** (fields
  Gnosis accepts without a graph) and leave the graph unchanged; relabel it
  "Edit metadata". A small, honest closure that doesn't fake a graph write.

**Dependencies / why it's a real decision.** (a)/(b) require a
**graph-shape bridge** (local ↔ Gnosis) and, for (b), an engine-aware commit
path; neither exists. (c)/(d) are cheap. The Gnosis CRUD MVP is landed but the
graph-ops surface is DEFERRED (`GNOSIS-CRUD-MVP-SCOPE`), and `GNOSIS-CRUD-SURFACE-
CONFIRMED` says the app's document CRUD UI *is* the intended Gnosis surface — so
(b) is directionally right but blocked on the mapping/commit seam.

**Proposed default (for the ruling):** **(d) now, (b) later** — make the button
honest (title/tags only) immediately, and open a separate unit for the graph
bridge + engine-aware commit that unlocks (b).

## B. W1-Q13 — `rag.get_document` scoped-subgraph options — elaboration

**The problem.** `rag.get_document { documentId }` returns the document's RAG
nodes/edges (a scoped subgraph). The doc-nav selects a document but exposes no
subgraph options (focus node, depth, expand-parent). The richer graph view is the
**G3 graph-neighborhood/path view, which is PARKED** (post-MVP knowledge-graph
tools).

**The options:**

- **(a) Extend the doc-nav/graph view now** with scoped-subgraph options (focus,
  depth). Pro: closes the PARTIAL. Con: builds the G3 graph view early, before
  the knowledge-graph tools that would front it — the parked rationale.
- **(b) Defer with G3** (my proposed default). Treat `rag.get_document`'s UI as
  the doc-nav selection only; record the PARTIAL as deferred until G3 unparks.

**Proposed default:** **(b) defer** — consistent with the G3 park
(`docs/pending.md` knowledge-graph tools).

## C. W1-Q15 — assistant suggestions: parity required

The ruling is **parity**, not a UI-first carve-out. Consequence: an
assistant-suggestions **pane alone is not acceptable** — it must have a matching
**MCP tool** (and both must share the same application seam/source). Since there
is currently **no suggestion source**, the feature is **blocked on defining one**:

- If a suggestion source is defined (host-side store or a service), define the
  pane + the matching MCP tool + the shared seam together.
- Until then, **park** the assistant-suggestions pane (do NOT ship it UI-only).

This supersedes `unit-u-parity-decisions.md` §2's UI-first carve-out.

## D. Resolution pass

Q1–Q11, Q14, Q16, Q17 resolved as above (the drafted specs already match).
Q12/Q13 await the rulings on §A/§B. Q15 = parity (§C) — update the decisions spec.

## E. TDD blockers / new decisions (found while implementing)

| # | Unit | Blocker / decision | Status |
| --- | --- | --- | --- |
| **W1-N1** | U-SHELL-2 | **The theme BOOT is not wired.** `resolveTheme` + the tokens + the persisted `theme` are landed and green, but `src/renderer/renderer.ts` does not yet apply `document.documentElement.dataset.theme` at boot nor attach the `matchMedia` change listener. | **RESOLVED** — `installTheme()` in `renderer.ts` + pure `applyThemeToRoot` in `theme.ts` (boot + live `system` + `onChanged`; no-`matchMedia` degrades to light). |
| **W1-N5** | U-PARITY-PARTIALS | The template Validate handler result needs a host hook to display end-to-end. | **RESOLVED** — `sidebar-panes.ts` `templateValidation` state + `buildTemplateContext().validation` + the `templateValidateResult` seam (tested). |
| **W1-N6** | U-PARITY-DECISIONS | PG12's operator module-tool runner needs production wiring. | **PARTIAL** — the runner now lists real tools + invokes via the two-gate (`IPC_MODULE_TOOL_LIST/INVOKE` → `mcp.invokeTool`) and `SecurePanels` gets a `moduleRunner`. **Remaining (W1-N10):** the landed `secure-panels.ts` runner seam is SYNCHRONOUS while IPC is async, so a successful async result renders `ok: {}` until `SecurePanels` awaits it. |
| **W1-N10** | U-PARITY-DECISIONS | The module-runner result display is async-incompatible (see W1-N6). | **RESOLVED** — `secure-panels.ts` `runModuleToolAsync()` awaits the runner seam (`pendingRun`, awaited by `dispatch`/`handleDomEvent` before render); sync runners unchanged. |
| **W1-N11** | U-PARITY-C18/C19 | The packaged preload still does not expose the C18/C19 seams nor the rich-editor methods. | **RESOLVED** — preload `SidebarMethods` exposes+delegates `searchAdvancedToggle`/`submitAdvancedQuery`/`hoverPreview*` (4) + `editorInput`/`editorBlur`/`editorCompositionStart`/`editorCompositionEnd`. |
| **W1-N7** | U-PARITY-DOCNAV | Preload did not forward `docNavToggle`. | **RESOLVED** — added to the preload `sidebar` + `installSidebar` delegation. |
| **W1-N9** | U-PARITY-C18 | Preload/payload/IPC did not forward the advanced-search args. | **RESOLVED** — `RagQueryPayload` + preload `query(..., options?)` + `main.ts` + `handleRagQueryIpc` forward `mode/maxHops/expand/maxParentContext/filters`. |
| **W1-N8** | U-PARITY-DOCNAV | `applyCommand` state-slice silent no-op on placement-routed nodes. | **RESOLVED** — FIXED via ClientAPI normalization + placement-aware recompile; defect `HOST-APPLYCOMMAND-PLACEMENT-STATESLICE` CLOSED (`docs/defects.md`); regression `tests/unit-runtime-applycommand-placement.test.ts`. |
| **W1-N2** | U-MENU-1 | `showOpenDialog({ properties: ['openFile','openDirectory'] })` per the spec is a macOS-only COMBINATION. | **RESOLVED (2026-09-11).** `multiSelections` is supported on Windows/Linux/macOS; only the combined file-or-directory picker is macOS-only. **Strategy (user 2026-09-11): MULTI-FILE upload is the DEFAULT on ALL platforms; Windows/Linux get a SEPARATE directory-bulk-upload menu.** Concretely — **all platforms:** `File → Import files…` = `['openFile','multiSelections']` `.md` filter (the default item); **macOS:** the same item may additionally allow directories in one dialog (`['openFile','openDirectory','multiSelections']`); **Windows/Linux:** an ADDITIONAL `File → Import folder…` = `['openDirectory']` (bulk). Both feed the same `importMarkdownCorpus { files: [] }` handler (a folder expands to its `.md` files). Pin in U-IMPORT-1. |
| **W1-N3** | U-SHELL-2 | An additive `OperatorSettings.theme` broke a PRIOR-unit test (`tests/operator-settings-editing-mode.test.ts`) that froze the 4-field shape (`toEqual` + `Object.keys`). The agent reconciled it to 5 fields (not weakened). | **ACCEPTED** — sanctioned additive-shape reconciliation. |
| **W1-N4** | U-SHELL-6 | **Residual `is-clickable` coverage:** handler-bearing nodes in `gnosis-panes.ts` (`gnosis-status-refresh`, `gnosis-query-submit`), `secure-panels.ts`, and `sidebar-panes.ts` were outside the unit's confinement. | **RESOLVED** — a follow-up agent extended `clickableClasses` to all three files (+3 tests). |

**Progress (TDD):** ALL Wave-1 units GREEN. **Follow-ups CLOSED:** W1-N1 (theme boot), W1-N2 (platform dialog), W1-N4 (hover coverage), W1-N5 (template Validate host hook), W1-N7 (preload `docNavToggle`), W1-N8 (applyCommand state-slice — defect CLOSED), W1-N9 (advanced-search args). **PARTIAL:** W1-N6 (module runner → W1-N10). **ACCEPTED:** W1-N3. **OPEN follow-ups: NONE** — W1-N10 + W1-N11 CLOSED. **Integrated trio: 170 files / 3952 pass + 44 skip, typecheck 0, build 0.** **Next sets:** Wave 2 (U-SHELL-1 zones/layout → U-SHELL-3/4/5/8/9; U-EDIT-2) and Wave 3 (U-IMPORT-1, U-SHELL-7) — each needs its own spec (umbrella A1) before TDD.
