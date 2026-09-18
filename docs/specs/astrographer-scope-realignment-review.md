# Astrographer scope realignment — PROPOSAL-REVIEW record

- **Kind:** proposal-gate FINAL VERDICT (step 3 of the three-agent gate,
  `AGENTS.md` item 8) — the record that closes the gate on the scope-realignment
  proposal and opens the upstream-request / fork-divergence doc set. **DOC-ONLY:
  no code, no tests, no trio this pass.**
- **Proposal:** the user's architecture review and scope realignment (2026-09-17,
  quoted verbatim in §1).
- **Verdict path:** **validity `VALID-WITH-AMENDMENTS` ∥ critique `NEEDS-REWORK`
  → architecture `PROCEED-WITH-AMENDMENTS` → change-analysis `PROCEED-WITH-AMENDMENTS`
  (with a citation audit).**
- **Reviewers:** four read-only gate steps (validity, critique, architecture,
  change-analysis) — no file was edited by any of them.
- **Inputs:** the build (`src/shared/types.ts`, `src/main/main.ts`,
  `src/main/traversal.ts`, `src/main/rag-store.ts`, `src/main/rag-store-runtime.ts`,
  `src/main/rag-store-default.ts`, `src/main/markdown-parse.ts`,
  `src/main/markdown-import.ts`, `src/main/adjacency.ts`, `src/main/backlinks.ts`,
  `src/main/vector-boot.ts`, `src/main/embeddings.ts`, `src/main/retrieval.ts`,
  `src/main/app-menu.ts`, `src/main/import-directory.ts`, `src/main/security.ts`,
  `src/main/authority-store.ts`, `src/main/idempotency-registry.ts`,
  `src/main/query-audit.ts`, `src/main/mcp-server.ts`, `src/main/edit-ops.ts`,
  `src/main/doc-flow.ts`, `src/main/rich-decompose.ts`,
  `src/main/paste-sanitize.ts`, `src/renderer/runtime.ts`,
  `src/renderer/pane-graph.ts`, `src/renderer/content-reconcile.ts`,
  `src/renderer/sidebar-panes.ts`, `src/renderer/index.html`,
  `src/renderer/modal-state.ts`, `src/renderer/layout-state.ts`,
  `src/renderer/pane-drag.ts`, `src/renderer/pane-gutter.ts`,
  `src/renderer/tab-state.ts`, `src/renderer/tab-strip.ts`,
  `src/renderer/renderer.ts`, `src/renderer/render-shared.ts`,
  `src/renderer/theme.ts`, `src/renderer/hover-preview.ts`,
  `src/renderer/cross-document-shared.ts`); `AGENTS.md` items 3/4/6/7/8/9/10;
  `docs/specs/gnosis-offload-proposal.md`; `docs/specs/gnosis-offload-review.md`;
  `docs/specs/ui-overhaul.md`; `docs/specs/mcp-endpoint.md`;
  `docs/feature-requests/gnosis-engine-feature-requests.md`;
  `docs/decisions.md`; `docs/defects.md`; `docs/pending.md`;
  `docs/next-steps.md`; `docs/HANDOFF.md`; `docs/FORKER.md`;
  `../Provident-Electron/`.
- **Status:** **PROCEED-WITH-AMENDMENTS (GATED 2026-09-17)** — the boundary is
  pinned, the chrome decomposition is recorded, and the upstream request set is
  indexed. The doc-only landing is complete in this pass; the shell units stay
  behind the user's go-ahead and the O-0 hard precondition.

---

## What the proposal asked

Verbatim (user, 2026-09-17):

> "Architecture review and scope realignment. The Astrographer side of the
> project should be limited to primarily a presentation layer interface (UI/MCP).
> All computationally intensive non-rendering tasks, ex. document parsing to
> Provident/RAG; change diffing of documents; RAG node child data --> Provident
> assembly; graph enrichment; vector search — should be entirely handed off to
> Gnosis. Review UI overhaul changes/features and note things that have to be
> delegated to shell chrome instead of using Provident. Create a feature request
> doc for the upstream Provident-Electron project to implement those as standard
> interfaces."

Three asks: (1) re-scope Astrographer to UI + MCP and hand the compute to Gnosis;
(2) review the UI-overhaul surface and name what belongs to shell chrome rather
than Provident; (3) file upstream feature requests for those shell-chrome
interfaces.

---

## §1 The four review steps (verdicts + the decisive findings)

### 1.1 Validity — `VALID-WITH-AMENDMENTS`

The causal story is right in substance and wrong in seven particulars (corrected
in §2). The review demanded the **precise boundary wording** before anything
could land: without it, "presentation layer" is unfalsifiable and the ownership
transfer it implies is unrecordable as a decision.

### 1.2 Critique — `NEEDS-REWORK`

The dominant measured cost of the observed freezes is **style / layout / paint**,
so the proposal's lever is mis-aimed for 3 of 5 rows:

- pane collapse / zone minimize ≈ **465 ms** with only ≈ **29 ms JS self-time**
  of ≈ **517 ms** (`translateNodeData` 13 + `renderTree` 8 + `enumPathWalks` 8) —
  `docs/next-steps.md` CURRENT WORK, `docs/defects.md`
  `PANE-TOGGLE-FULL-REASSEMBLY`;
- doc-nav document-row click ≈ **1 011 ms** (`docs/defects.md`
  `HEAVY-OPS-FREEZE-THE-PAGE`);
- idle resize **6 ms** (`docs/next-steps.md`, `docs/specs/gnosis-offload-proposal.md`,
  `docs/specs/gnosis-offload-review.md` §2.1, line 123) — resizing is *not* the cost.

The engine legs cannot touch a paint cost. Therefore: the compute-offload half is
**mis-aimed as a lever** (it stays parked); the chrome half is salvageable **only**
as a **MECHANISM-vs-CONTROL-NODE split** (§4); and the engine track is **already
parked with named triggers** (`docs/pending.md` §"PARKED DESTINATION — the engine
track", O-6/O-7/O-8), while the proposal asserts no new trigger (§3's per-row
table, O-7 row).

### 1.3 Architecture — `PROCEED-WITH-AMENDMENTS`

- **DOC-ONLY landing; NOT a new architectural ruling.** It **EXTENDS**
  `ARCH-GNOSIS-OFFLOAD` (`docs/decisions.md`): **no** superseded decision rows,
  **no** re-opened units, **no** new parked trigger.
- Adds three things: **(a)** the **layer model + the named crossing** (§3);
  **(b)** a **mandatory engine-absent degraded-mode contract** (§3, recorded as the
  new ACTIVE decision `ENGINE-ABSENT-DEGRADED-CONTRACT`); **(c)** the explicit
  **rejection of the ownership transfer** — "Astrographer = UI + MCP, everything
  compute goes to Gnosis" is NOT adopted (§3, MCP-server ownership + the
  excluded-by-name seams).

### 1.4 Change-analysis — `PROCEED-WITH-AMENDMENTS` (with a citation audit)

Every load-bearing citation was re-verified against the build. **All resolve**
except the four corrections in §2.2 (C2, C3, C4, C6). Amendments C7 and C8 are
recorded in §6. The change-analysis also re-issued the spec-gate readiness
checklist (§8).

---

## §2 Corrections applied to the proposal

### 2.1 The seven mis-statements (validity)

1. **"Document parsing is a Gnosis task, not yet done"** — parsing is local and
   *already* in the shell; the offload is a *parked destination*, not a new gap.
2. **"Change diffing of documents is a compute task to hand off"** — there is no
   such task locally (see the per-row table).
3. **"RAG node child data → Provident assembly is compute to hand off"** — the
   assembly *is* the render path; only the *projection* may cross.
4. **"Graph enrichment is a shell task to hand off"** — the local part is O(edges)
   index maintenance; the *engine* part is blocked on engine defects.
5. **"Vector search is a shell task to hand off"** — it is already off-thread and
   dual-routed; the real defect is different.
6. **"The UI + MCP is the whole Astrographer side"** — MCP server ownership is a
   pinned shell carve-out and is NOT transferred.
7. **"Heavy document work causes the freezes"** — the measured dominant term is
   style/layout/paint (§1.2).

### 2.2 The change-analysis corrections (applied; not repeated)

- **C1 — the C3 modal: NO contradiction exists and NO CARVE-OUT decision row is
  owed.** `docs/specs/ui-overhaul.md:65` already pins "the shell may own open/close
  of the modal *frame*", and Q2 (`docs/specs/ui-overhaul.md:1167`) pins "Shell
  frame/scrim + the operator isolated-scope body". The record therefore carries
  **only a one-line clarification**: **modal frame / scrim / toggle = shell
  chrome; the modal BODY = provident (an isolated operator scope)** — `#settings-modal`
  / `#settings-modal-scrim` / `#settings-modal-body` / `#settings-toggle`
  (`src/renderer/index.html:297-301`) + `createModalController` / `installSettingsModal`
  (`src/renderer/modal-state.ts:42/116`). The **modal-toggle-provident request
  stays on the DO-NOT-FILE list** (§5).
- **C2 — the `revision` field on the crossing is OWED, NOT EXISTING.**
  `src/shared/types.ts:481` `RagSnapshotPayload { store?, nodes, edges }` and the
  `IPC_RAG_SNAPSHOT` handler `src/main/main.ts:751` carry **no** `revision`. Cross-cite
  the owed decision `SNAPSHOT-REVISION-AUTHORITY` and the engine requests **GR-4**
  (bulk projection snapshot with a monotonic revision) / **GR-5** (store-change
  notification + staleness contract) in
  `docs/feature-requests/gnosis-engine-feature-requests.md`. **Never describe the
  crossing as shipped.**
- **C3 — engine-request numbering.** **GR-1** = the F2-envelope / masked-400 query
  defect; **GR-2** = `mode`+`topK` ignored over POST; **GR-3** = the vector index is
  never built for the server store; **GR-4** = the revisioned bulk projection
  snapshot; **GR-5** = store-change notification. **GR-1..GR-9 live in
  `docs/feature-requests/gnosis-engine-feature-requests.md`, NOT in
  `docs/defects.md`** (the `defects.md` rows are the per-defect index that the
  request doc cross-cites).
- **C4 — the prior spec-gate readiness checklist has 11 items, not 12.**
  `docs/specs/gnosis-offload-review.md` §"SPEC-GATE READINESS CHECKLIST" (lines
  300-318) enumerates **11** items; items **5 / 9 / 11** are already **PRESENT** and
  **3 / 7** are **PARTLY**. The re-issued **13-item** checklist is §8 below and is
  the authority from this pass on.
- **C5 — `docs/feature-requests/` already exists and is populated**
  (`docs/feature-requests/gnosis-engine-feature-requests.md` — GR-1..GR-9). The new
  request docs land **beside it**; that **IS** the established convention:
  **indexed from `docs/HANDOFF.md`, never a package patch, never a `defects.md`
  row set.**
- **C6 (SHOULD — already actioned by the sibling agent, and now VERIFIED) — the SC-3
  `inert` expressibility claim.** The claim is **verified in this repo's installed
  copy**: `inert` IS a member of the closed `BOOLEAN_ATTRS` set (`provident-ssr@0.5.0`
  `dist/core/adapters.js:25-53`, `'inert'` at **`:37`**; 27 members), handled on the
  boolean presence/absence path at **`:300-313`** (DOM) and **`:520-528`** (SSR) —
  presence/absence, never `attr="false"`. **What is missing is the PRIMITIVE**
  (the overlay/trap/top-layer/scrim mechanics), not attribute support.
- **C7 (SHOULD) — the explicit D-GP-UFA-1 zero-row exemption sentence.** The §5.U
  matrix (`docs/specs/user-flow-audit.md` §2) is capped at 8 and FULL at U-1..U-8;
  this doc set therefore claims **ZERO new matrix rows** — recorded, not silent.
- **C8 (SHOULD) — the PBT/§5.x register exemption, explicitly justified.**
  This doc set changes **NO code** ⇒ the register exemption is **explicit and
  scoped to the doc artifacts only**; the **trio is not owed this pass**; every
  shell unit landing later under this boundary **keeps full TDD / PBT / live-battery**
  (`AGENTS.md` items 3/4/10/11/RCA-1..RCA-12).

---

## §3 The pinned boundary

### 3.1 The ruling (verbatim from the architecture step)

> **The Astrographer shell keeps the render path** — the snapshot pull
> (`IPC_RAG_SNAPSHOT`, `src/main/main.ts:751`), `buildTraversal`
> (`src/main/traversal.ts:325`), `assembleAppGraphEnvelope`
> (`src/renderer/pane-graph.ts:329`), `translateLegacy` admission into the live hub
> (`src/renderer/runtime.ts:196/432/528`), `compilePath`, the DOM+SSR dual emit,
> `reconcileDocumentRoots` (`src/renderer/content-reconcile.ts:421`) and
> `Runtime.applyContentReconcile` (`src/renderer/runtime.ts:480`), and all
> pane/graph authoring. **The engine may own the STORE and the compute that
> produces the traversal-input PROJECTION** — nodes, edges, docHeads, adjacency,
> child data, embeddings, ingest — **but never the envelope and never the
> derivation.** The only engine→shell crossing is the revisioned
> `RagSnapshotPayload {nodes, edges, store, revision}` (the `revision` field is
> **OWED** — see §2.2 C2). **`RagStore` reads stay SYNCHRONOUS**
> (`src/main/rag-store.ts:246-297`: 22 members, 16 synchronous reads / 6 async).

### 3.2 The assembly contradiction, resolved by an exact function boundary

What may cross is **what `buildTraversal` consumes** — `listNodes()` / `listEdges()`
/ doc-heads / adjacency: today's snapshot payload. `buildTraversal` itself **stays
in-process** (a Node worker is the only sanctioned off-thread move = **O-4,
CONDITIONAL on O-0**; `docs/specs/gnosis-offload-review.md` §3/§4 (O-4 row, line 246) + §7
A-10, line 428).
`assembleAppGraphEnvelope` (`src/renderer/pane-graph.ts:329`), the `translateLegacy`
admission (`src/renderer/runtime.ts:528-544`) and everything downstream author zone
containers, pane frames/roots and `targetPlacement`
(`src/renderer/pane-graph.ts:200-248`, `:317-360`) — **that IS the render path and
cannot move**.

### 3.3 Per-row ownership (replaces the proposal's list)

| Named task | Ruling |
| --- | --- |
| Document parsing → Provident/RAG | **TRUE IN SUBSTANCE but already parked** (O-7 / GR-6). Parse is `src/main/markdown-parse.ts:617` inside `importMarkdownCorpus` (`src/main/markdown-import.ts:133`). Cheaper alternative: chunk `applyBatch` + incremental `IPC_IMPORT_RESULT` in main. |
| Change diffing of documents | **NOT A TASK** — the only local diff is a pure renderer-side root-set classifier (`src/renderer/content-reconcile.ts:421`, coalesced by `mergeRebuildKind` `src/renderer/sidebar-panes.ts:254`); the O-1 changed-`nodeIds`/`edgeIds` census is local and in-process. |
| RAG node child data → Provident assembly | Assembly **STAYS** (§3.2); only the PROJECTION may cross. |
| Graph enrichment | **Engine defects first** (GR-3, GR-8 — the enrichment routes 404) + local O(edges) index maintenance stays (`src/main/adjacency.ts:84`, `src/main/backlinks.ts:105`). |
| Vector search | **Already off-thread and dual-routed** (`src/main/vector-boot.ts:117-345`, `src/main/embeddings.ts:506,800`, `src/main/retrieval.ts:626`); the real fixable defect is `VECTOR-IMPORT-NO-BODY-VECTORS`. |
| WRITE PATH (excluded by name) | `src/main/edit-ops.ts`, `src/main/doc-flow.ts`, `src/main/rich-decompose.ts`, `src/main/paste-sanitize.ts` — commit-on-blur editing cannot be async-chunked behind an engine hop. |
| AUTHORITY / SECURITY SEAM (excluded by name) | `src/main/security.ts`, `src/main/authority-store.ts`, `src/main/idempotency-registry.ts`, `src/main/query-audit.ts`, and the pinned MCP contract `docs/specs/mcp-endpoint.md` — host-side by contract (GR-9 is the engine-side machine-caller authority request). |
| MCP-server ownership | **STAYS HOST-OWNED** — `AGENTS.md:23-34` states the carve-out (the rule is at `:23`: non-shell UI MUST be provident-authored; `:28-29` names the MCP server inside the exception list); the proposal's "UI + MCP presentation layer" phrasing must not be read as transferring it. |

### 3.4 Degraded-mode contract (owed as a decision row — `ENGINE-ABSENT-DEGRADED-CONTRACT`)

With no engine, **every local path must work IDENTICALLY** — local store boot
(`src/main/rag-store-runtime.ts:662`, `src/main/rag-store-default.ts:31`), import
atomicity + the 512 cap, local `rag.query`, synchronous `RagStore` reads. **No
offload unit may make a local path DEPEND on engine presence**; engine-absent reads
must be **typed-unavailable, never silent** (defects `DEMO-ENGINE-START-GAP`,
`GNOSIS-SIDEBAR-SEAM-MISSING`); **the launcher must fail loud**.

---

## §4 The chrome decomposition

Table copied verbatim (C = the UI-overhaul concern id, `docs/specs/ui-overhaul.md` §2).

| # | Class | Today's implementation | MCP verdict |
| --- | --- | --- | --- |
| C1 theme | HYBRID — control = operator pane; mechanic = root tokens | `src/renderer/index.html:15-73`, `src/renderer/theme.ts:30` | Control invisible BY DESIGN; tokens inherently invisible — OK |
| C2 stage | HYBRID — placement provident, formatting CSS shell | placement `src/renderer/pane-graph.ts:329`; `index.html:104-131` | Stage content MUST stay visible |
| C3 settings modal | HYBRID — frame/scrim/toggle = shell; hosted panels = operator | `index.html:297-301`, `src/renderer/modal-state.ts:42/116` | Invisible BY DESIGN (pinned `ui-overhaul.md:65` + Q2) — clarification note only, NO decision row |
| C4 pane drag/reorder | HYBRID — frame + `data-pane-id` provident; pointer stream shell | `pane-graph.ts:218-246`; `src/renderer/renderer.ts:752-796`, `src/renderer/pane-drag.ts:253` | Control nodes visible; the gesture is not dispatchable — parity at the application seam |
| C5 pane collapse | PROVIDENT control + shell mechanic | collapse-toggle control `src/renderer/pane-graph.ts:224-229` (the `pane-collapse-<id>` button, class `pane-collapse-toggle`; handler NAME `PANE_COLLAPSE_HANDLER = 'togglePaneCollapse'` at `:50`; host seam `src/renderer/sidebar-panes.ts:2938`) | **MUST stay visible/dispatchable — never move to shell** |
| C6 hover affordance | HYBRID — class authored, rule shell | `src/renderer/render-shared.ts:11`, `index.html:158-159` | Visible (the class rides the node) |
| C7 gutters/resize | SHELL | `index.html:283-290`, `src/renderer/pane-gutter.ts:151` | Invisible OK (pure geometry) |
| C8 markdown/html toggle | PROVIDENT | markdown/html toggle control `src/renderer/pane-graph.ts:1357` (the `editor-toolbar-toggle` button; its toolbar host `:1337`; function `editorToolbarContent` `:1329`; `:1271` is the `EDITOR_TOOLBAR_TOGGLE_ID` const) | Visible |
| C9 UI-config serialization | HYBRID — serialized model + shell writes | `src/renderer/layout-state.ts:214-224` (`layoutCssVars`) / `:275-288` (`zoneTrackCssVars`) / `:300-314` (`applyLayoutToRoot`), `src/renderer/tab-state.ts:43`, decision `UI-CONFIG-CARRIER` | Invisible BY DESIGN (operator-scoped) |
| C10 content repopulation | PROVIDENT + host reconcile (render path) | `src/renderer/content-reconcile.ts:421`, `src/renderer/runtime.ts:480` | MUST NOT narrow what `get_rendered_html`/`list_targets` see |
| C11 empty-zone hide/reveal | HYBRID — class mirror provident, proximity shell | `pane-graph.ts:317-323`, `pane-drag.ts:196`, `index.html:147-150` | Invisible OK (an empty zone exposes nothing) |
| C12 container minimize + tab list | PROVIDENT controls + shell styling | `pane-graph.ts:161-183`; `index.html:193-198` | **MUST stay visible/dispatchable** |
| C13 View-menu pane visibility | SHELL native menu + serialized `enabledPanes` | `src/main/app-menu.ts:93-135` | Invisible OK; the real defect is `N1 PANE-VISIBILITY-IRREVERSIBLE` |
| C14 top-bar tabs | SHELL strip + shared seam | `index.html:278`, `src/renderer/tab-strip.ts:58`, seam `tab-state.ts:269` | Strip invisible OK — counterpart exists: MCP `provident.focus` (`src/main/mcp-server.ts:1791,2247`), so the "no MCP selection tool" claim is STALE and `docs/specs/mcp-endpoint.md` §3 is DRIFTED (recorded, not fixed here) |
| C15 doc-directory | data model + PROVIDENT doc-nav tree | `pane-graph.ts:690` | Visible; data gap `DOC-NAV-NOT-A-TREE` (`path: []`) |
| C16 undo/redo + history | PROVIDENT | `pane-graph.ts:1329,1373` | Visible |
| C17 File → Import | SHELL native menu + OS dialog | `app-menu.ts:114-127`; `src/main/import-directory.ts:14` | Invisible OK (structurally non-exercisable, parked with reason) |
| C18 advanced search | PROVIDENT | `pane-graph.ts:812-865` | Visible |
| C19 hover-preview | HYBRID — popup + handlers provident, timer/anchor shell | `src/renderer/hover-preview.ts:26-59`, `:203` | Visible; timing is not graph state |
| C20 shared subtrees | PROVIDENT | `src/renderer/cross-document-shared.ts:66-80,344` | Visible |

### 4.1 Ruling on the "backwards" case (explicit)

The tab strip (C14), gutters (C7), modal frame/scrim (C3), theme-token application
(C1 mechanic) and the native menus (C13/C17) are **ALREADY and CORRECTLY shell
chrome** — the `AGENTS.md` carve-out is **functional** (window frame, geometry, OS
integration), **not geographic**. The user's ask is **backwards for C5, C12, C15,
C18, C19, C20** — their CONTROL NODES are provident-authored **precisely so**
`provident.dispatch` can reach them. **What IS fileable upstream is the MECHANISM
layer underneath them** (§5).

---

## §5 The upstream request set

### 5.1 The requests (the sibling agent authors the docs; this record indexes them)

`docs/feature-requests/provident-electron-shell-chrome-requests.md`:

| Id | Title | Priority |
| --- | --- | --- |
| **SC-1** | SHELL-CHROME-REGION-CONTRACT | P1 |
| **SC-2** | GESTURE-CONTROLLER | P1 |
| **SC-3** | OVERLAY-FRAME-PRIMITIVE | P1 |
| **SC-4** | THEME-TOKEN-LAYER | P1 |
| **SC-5** | ZONE-TRACK-CONTRACT | P1 |
| **SC-6** | FOCUS-TAB-SEAM | P2 |
| **SC-7** | MENU-CATALOG-CONTRACT | P2 |

`docs/feature-requests/provident-ssr-expressibility-requests.md`:

| Id | Title | Priority | Target |
| --- | --- | --- | --- |
| **PS-1** | SHELL-MECHANICS-EXPRESSIBILITY-MATRIX | P2 | Preempt-Providence **docs** (not the package) |

**All SC-\* target the Provident-Electron foundation**; **PS-1 targets upstream
docs**. Filing convention (§2.2 C5): a request doc indexed from `docs/HANDOFF.md`,
**never** a package patch, **never** a `defects.md` row set.

**Expressibility caveat (C6) — VERIFIED:** the SC-3 `inert` claim is **verified against
the closed `BOOLEAN_ATTRS` set** (`provident-ssr@0.5.0` `dist/core/adapters.js:25-53`,
`'inert'` at `:37`; 27 members; the boolean presence/absence path at `:300-313` DOM /
`:520-528` SSR) — `inert` **IS** expressible as a provident prop today. **The PRIMITIVE
is what is missing** (the overlay frame / focus trap / top-layer / scrim lifecycle), not
attribute support.

### 5.2 The DO-NOT-FILE list

- a modal-toggle-provident request (pinned already — §2.2 C1);
- the doc-nav tree (a host data gap: `DOC-NAV-NOT-A-TREE`, `path: []`);
- the editor toolbar;
- hover-preview;
- shared-subtree decoration;
- the RAG/pane registry;
- `rag.*` / `edit.*` / `module.*` tools;
- `enabledPanes`;
- zone names;
- the Import semantics (512 cap / atomicity / corpusRoot);
- any `provident-ssr` package patch for focus-trap (a DOM API);
- **O-1 / O-2 / O-9 / O-10** (already-gated shell units);
- anything already covered by **GR-1..GR-9**.

---

## §6 Gate shape, acceptance, and what "done" means

**Doc-only ⇒ no red set, no trio.** The **PBT / §5.x register exemption is
explicitly justified and scoped to the doc artifacts** (§2.2 C8). **No new §5.U
matrix rows** (§2.2 C7 — the matrix is capped at 8 and FULL at U-1..U-8). Upstream
requests are verified by **`docs/HANDOFF.md` index presence + the recorded revisit
condition**, **never by a live row**.

**"Done" = the artifact set below exists and the trackers are reconciled in the
same pass.**

Files of record:

1. `docs/specs/astrographer-scope-realignment-review.md` (this file);
2. `docs/feature-requests/provident-electron-shell-chrome-requests.md` +
   `docs/feature-requests/provident-ssr-expressibility-requests.md` (sibling agent);
3. `docs/FORK-DIVERGENCE.md` (+ a `docs/FORKER.md` pointer) — the upstream-vs-fork
   delta: upstream ships **NO** layout grid / zones / gutters / tabs / modal / theme
   tokens / application menu (`../Provident-Electron/src/renderer/index.html`,
   `../Provident-Electron/src/main/main.ts:136-155`,
   `../Provident-Electron/docs/next-steps.md` "no open items");
4. same-pass tracker rows (`docs/decisions.md`, `docs/pending.md`,
   `docs/HANDOFF.md`, `docs/defects.md`, `docs/next-steps.md`);
5. `archive/reviews/2026-09-17-scope-realignment-doc-review.md` — the
   documentation-review record for this doc-only landing (RCA-6 / `AGENTS.md` item 10d;
   verdict `PASS-WITH-FIXES`): the F-2 OPEN→FIXED reconciliation R-1..R-3, the four
   citation/label corrections R-4, the PG14 stale-premise annotation R-5, the durable
   C3 clarification R-6, and the residual-owed list (§4 of that record).

---

## §7 Landing order, revert units, residual risk

### 7.1 Landing order

**1 → 2+3** (this doc set, then the shell requests / fork-divergence docs), then the
**already-gated** shell units in the change-analysis order
**O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2** (unchanged; each a single-diff revert
with its own red set — `docs/specs/gnosis-offload-review.md` §6/§7 A-1..A-10).

### 7.2 Must NOT be bundled with this doc set

- any MCP contract change (**none exists**);
- the `RagStore` interface;
- `src/main/traversal.ts`;
- the engine track (O-6/O-7/O-8, GR-\*);
- O-1/O-2 with this doc set;
- the shell-track supersession rows.

### 7.3 Residual risk accepted

- **(a)** upstream may **decline every SC/PS request** — `docs/FORK-DIVERGENCE.md` +
  the per-request fallback are the hedge;
- **(b)** this doc set **fixes NO measured freeze** — the dominant term is
  style/layout/paint and every mitigation stays behind the **O-0 hard precondition**;
- **(c)** the **offload stays parked with no new trigger** (§1.2);
- **(d)** `docs/specs/mcp-endpoint.md` §3 drift (**`provident.focus`** and
  **`provident.get_journal`** unlisted — `provident.code.get` **IS** already listed, at
  `docs/specs/mcp-endpoint.md:236`, §4.1) is **recorded, not fixed**; the same PG14 row
  annotation this pass added to `docs/specs/ui-overhaul.md:974` cites the counterpart
  `provident.focus` registration `src/main/mcp-server.ts:1791` / guard `:2247`;
- **(e)** O-8's **authority-switch prerequisite remains unmet**.

---

## §8 Spec-gate readiness checklist (re-issued — 13 items)

| # | Item | Status | Closes it |
| --- | --- | --- | --- |
| 1 | O-0 committed artifact + snapshot-pull stage | **MISSING** | the O-0 run (hard precondition) |
| 2 | O-5 harness + pinned thresholds | **MISSING** | the O-5 node contract |
| 3 | Per-unit layer declaration (envelope/pure vs assembled/renderer) | **PARTLY** | the unit specs |
| 4 | Per-unit falsifiable end state + slot | **MISSING** | unit specs + the zero-row exemption |
| 5 | R2 invariant text into O-1/O-2 | **PRESENT (umbrella)** | copy into the unit specs |
| 6 | Supersession rows + `SNAPSHOT-REVISION-AUTHORITY` | **MISSING** | `docs/decisions.md` — this pass adds only the two new rows; item 6 stays owed |
| 7 | Regression watchlist per unit | **PARTLY** | attach the A13 rows to the units |
| 8 | Snapshot-revision + containment acceptance rows | **MISSING** | the O-1/O-2 specs |
| 9 | Guardrails as spec text | **PRESENT (ruling)** | copy verbatim |
| 10 | Unit re-scoping A-1..A-6 | **MISSING** | §7 of `docs/specs/gnosis-offload-review.md` |
| 11 | Landing order + rollback per unit | **PRESENT** | keep |
| 12 | `revision` field + stale-drop implemented (`src/shared/types.ts:481`, `src/main/main.ts:751`) | **MISSING** | the owed revision unit (NOT this doc set) |
| 13 | SC/PS requests indexed from `docs/HANDOFF.md` (upstream section ≠ NONE) | **CLOSED by this pass** | the two request docs + the HANDOFF row |

**Superseded as the authority:** the 11-item checklist in
`docs/specs/gnosis-offload-review.md` §"SPEC-GATE READINESS CHECKLIST"
(2026-09-16) is retained for provenance; this 13-item list is the current one
(§2.2 C4).

---

## §9 Cross-references

**docs/specs/**

- `docs/specs/gnosis-offload-proposal.md` — the parked engine-track proposal (§1.2);
- `docs/specs/gnosis-offload-review.md` — the O-0..O-10 units, the 11-item
  checklist (§2.2 C4), §7 A-1..A-10, §6 live-risk demands;
- `docs/specs/ui-overhaul.md` — the C1..C20 concerns (§4), §2 line 65 (modal frame),
  Q2 line 1167 (shell frame/scrim + operator body);
- `docs/specs/mcp-endpoint.md` — the pinned MCP contract, host-side by contract
  (§3.3); its §3 tool table is **DRIFTED** (`provident.focus`,
  `provident.get_journal` unlisted; `provident.code.get` IS listed at
  `docs/specs/mcp-endpoint.md:236`, §4.1) — recorded, not fixed here. The
  `provident.focus` counterpart cite is `src/main/mcp-server.ts:1791` (registration) /
  `:2247` (guard) — the same cite added to the PG14 annotation at
  `docs/specs/ui-overhaul.md:974` and to §7.3(d) above;
- `docs/specs/user-flow-audit.md` — §2 the §5.U matrix (cap 8, FULL), §3
  `proxyPASS`/`realInput` (the zero-row exemption context, §2.2 C7);
- `docs/specs/user-flow-audit-checklist.md` — the ~112-row census.

**docs/decisions.md**

- **EXTENDS** `ARCH-GNOSIS-OFFLOAD` (2026-09-16) — supersedes **no** row, re-opens
  **no** unit, asserts **no** new parked trigger (§1.3);
- adds **`ASTROGRAPHER-SCOPE-REALIGNMENT`** (this pass) — the §3 boundary;
- adds **`ENGINE-ABSENT-DEGRADED-CONTRACT`** (this pass) — §3.4;
- **stays owed:** `SNAPSHOT-REVISION-AUTHORITY` + the supersession rows (§8 item 6);
- related: `SOURCE-SWITCHABLE`, `SINGLE-WRITER-STORE`, `UI-CONFIG-CARRIER`,
  `RAG-AUTHORITATIVE`, `MULTI-PARENT-DUPLICATE`, `PANE-PROVIDENT-AUTHORING`,
  `APP-GRAPH-PANES-MCP-VISIBLE`, `OPERATOR-ISOLATED-GRAPHSCOPE`,
  `MCP-UI-EQUIVALENCE`, `IPC-SURFACE-NOT-GROUP-GATED`, `LAYOUT-IN-CSS`.

**docs/feature-requests/**

- `docs/feature-requests/gnosis-engine-feature-requests.md` — GR-1..GR-9 (the
  numbering authority, §2.2 C3; GR-4/GR-5 are the owed `revision` routes, §3.1);
- `docs/feature-requests/provident-electron-shell-chrome-requests.md` — SC-1..SC-7 (§5.1);
- `docs/feature-requests/provident-ssr-expressibility-requests.md` — PS-1 (§5.1).

**docs/defects.md** (cross-referenced, **no new rows** — §6)

- `HEAVY-OPS-FREEZE-THE-PAGE`, `PANE-TOGGLE-FULL-REASSEMBLY` — the measured freeze
  (§1.2);
- `DEMO-ENGINE-START-GAP`, `GNOSIS-SIDEBAR-SEAM-MISSING` — the engine-absent
  class (§3.4);
- `VECTOR-IMPORT-NO-BODY-VECTORS` — the vector-search real defect (§3.3);
- `N1 PANE-VISIBILITY-IRREVERSIBLE` (C13), `DOC-NAV-NOT-A-TREE` (C15), `LIVE-UF6`,
  `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` — the UI-overhaul backlog this record
  touches but does not fix.

**Other trackers**

- `docs/pending.md` — the parked engine track (O-6/O-7/O-8) + the new
  foundation-request rows (SC-1..SC-7, PS-1);
- `docs/HANDOFF.md` — the upstream index row (the `provident-ssr` /
  Provident-Electron section, formerly NONE);
- `docs/next-steps.md` — the CURRENT WORK entry for this pass;
- `docs/FORK-DIVERGENCE.md` + `docs/FORKER.md` — the upstream-vs-fork delta.

**Process**

- `AGENTS.md:23-34` (the shell carve-out — the rule at `:23`, the MCP server named inside the exception list at `:28-29`; quoted in §3.3); items 3/4/6/7/8/9/10;
  RCA-1..RCA-12 (the TDD/PBT/live-battery guards the shell units keep — §2.2 C8).

---

## §10 Verdict (recap)

**PROCEED-WITH-AMENDMENTS.** The boundary of §3 is pinned verbatim: **the shell
keeps the render path; the engine may own the store and the compute behind the
traversal-input projection, never the envelope and never the derivation**; the only
crossing is the revisioned `RagSnapshotPayload` (revision **owed**); `RagStore`
reads stay **synchronous**; the **MCP server stays host-owned**. The chrome
decomposition (§4) records that C5/C12/C15/C18/C19/C20 control nodes are
provident-authored on purpose and that only the **mechanism** layer underneath them
is fileable upstream — as **SC-1..SC-7 + PS-1** (§5), with the DO-NOT-FILE list.
The change-analysis corrections C1..C8 are applied (§2.2). The doc set changes **no
code**: no trio, no red set, no new §5.U rows, and every shell unit that lands later
under this boundary keeps full TDD / PBT / live-battery. Awaiting the user's
go-ahead for the shell units.
