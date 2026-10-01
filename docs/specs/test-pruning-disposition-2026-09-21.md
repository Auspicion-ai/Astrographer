# TEST-PRUNING DISPOSITION AUDIT — the 224-file classification + the archive list (2026-09-21)

> **⟶ CITATION REPOINT `2026-10-04` (the ARCHIVE-MOVE pass of `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`'s EXEMPT-ENGINE class; `RCA-8(c)` — every reading, row and count below is KEPT AS FILED and nothing is rewritten; only the PATHS are repointed, and the as-filed `tests/<name>.test.ts` form remains readable as the file's name).** **The `8` MOVABLE `EXEMPT-ENGINE` suites were moved byte-identically by `git mv` to `archive/tests/2026-10-04-<name>.test.ts`** (`blind-unit-a2-document-crud-wiring-greens` · `blind-unit-gn-engine-integration-greens` · `blind-unit-gn-mcp-ui-wiring-greens` · `engine-crud-real-transport` · `props-a1-crud-routing-proxy` · `unit-a1-crud-routing-proxy` · `unit-gn-engine-integration` · `unit-shell-integration`; no byte edited, `md5` identical per file, nothing deleted). **Every citation of those paths in this file now names the archive address.** **PER `archive/README.md` THE ARCHIVE IS NOT A CITABLE SOURCE OF AUTHORITY** — the archive path is a HISTORICAL POINTER; the authority for each subject remains its owning unit spec / tracker row. **(The task's "repoint every citation in `tests/**`" arm is DISCHARGED-EXCEPT-ONE and recorded: `tests/unit-gn-mcp-ui-wiring.test.ts:25` carries a stale `tests/**` comment citation left BYTE-UNTOUCHED, because the same task forbids editing any test file's content — recorded as an unresolved conflict, never repaired by guessing.)**


**Kind:** the **disposition audit** the product owner's instruction *"proceed with pruning
further down the development chain, archiving tests for changed/obsoleted features"* requires
**before any test moves**. This file **classifies**; it does not move, delete, rename or edit a
single test, doc, spec or tracker row.

- **Layer (RCA-12, mandatory declaration): DOC-LAYER / AUDIT.** This pass changed exactly one
  file — this one. It ran the **suite leg** of the trio as a *reading* (`npm test`), the typecheck
  leg and the build leg; it wrote no `src/**`, no `tests/**`, no `docs/**` other than this file.
- **The model this audit is judged against:** the ACTIVE rows of `docs/decisions.md` —
  `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (`GN-1`), `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`
  (`GN-4`), `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` (identity clause **REVERSED**), `DECIDED: WHOLE-PAGE-EDITING`,
  `DECIDED: EDITING-MODE-SETTING` / `DECIDED: FORM-CONTROL-EDITING`, `DECIDED: RICH-TEXT-EDITING-GATE`,
  `DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`, `DECIDED: ADVISORY-REQUIREMENT-CATALOG` — plus the
  approved program and its per-unit gate record, `docs/specs/design-extensions-review.md`
  section **"THE APPROVED PROGRAM (P0–P4)"** (`C1`…`C14`, `S1`–`S5`) and its §14.2 fence re-plan / §14.3
  test-surface census.
- **The input.** `docs/feature-requests/design-extensions-2026-09-21.md` §2 — the 40 ids
  (`TB-*`, `LZ-*`, `PN-*`, `ST-1`…`ST-6`, `TAB-*`, `DN-*`, `SR-*`, `FL-*`, `GN-1`…`GN-4`, `EN-*`).
- **Citation discipline (binding on this file):** every claim cites a **path + a symbol / decision id /
  `§`-section title / row id**. **No line number is used as an address anywhere below** (where a source
  file was read, the anchor is the exported symbol or the doc anchor, never a line number).

---

## §0 — THE ONE FINDING THE USER NEEDS FIRST (stated plainly, not softened)

**`ARCHIVE-READY` IS EMPTY. 0 of 224 files.**

That is not a failure of this audit; it is the audit's result, and it is the second-most-important
number in this file. The reason is mechanical and was verified symbol-by-symbol (§2):

> **Every one of the 224 test files imports only modules and symbols that still exist and are still
> reachable in `src/**`.** There is no file in the suite whose subject feature has been removed from the
> code. The decision-level obsolescence recorded on 2026-09-21 (`GN-1` engine authority, `GN-4` no-engine
> refusal, `ST-6` textarea removal, the catalog-generator park) is **contract-layer only** — the code it
> supersedes is still present and still exercised.

Therefore, **the pruning the product owner asked for cannot precede the implementing units; it must
follow them** (§6). What this audit *can* deliver now is:

1. the **complete classification** (all 224 files, four classes, §3);
2. the **`ORPHANED-PIN` set — 26 files** whose cited spec/doc no longer exists (§3.2) — the only set that
   is *citation*-actionable today (repoint-or-archive candidates, §4.2);
3. the **`HOLD-UNTIL-IMPLEMENTED` set — 44 files** that are the *live pins* the product owner's
   instruction would redden the suite by archiving (§3.3) — each with the implementing unit it waits on
   and an explicit **do-not-archive-before-it-lands** rule;
4. the **trio-impact analysis** (§5) and the **order-of-operations rule** (§6) that makes the whole
   program safe.

**The alternative reading is rejected in terms:** archiving a `HOLD-UNTIL-IMPLEMENTED` file is not
"pruning the development chain" — it is deleting the **only pin** on behaviour that is still live in the
shipped code, and the suite is red from the moment the move lands.

---

## §1 — INVENTORY: ALL 224 TEST FILES (subject + size + family)

**The count, reconciled with the suite's own reading.** `glob tests/**/*.test.ts` returns **221** files
and `glob tests/**/*.test.mjs` returns **3** → **224** test files, **115 749** lines total. The
three `.test.mjs` files (`adapter-parity-battery`, `e2e-battery`, `mcp-stdio-e2e`) are **not suite
members**: `vitest.config.ts` pins `include: ['tests/**/*.test.ts']`, so they run only under the
separate `npm run battery` leg. The suite is therefore **221 files / 4 988 passed / 58 skipped / 0 failed**
(§5.1) — the same figure the gate record's §14.3 census records as a *reading*.

**Groups** (the requested families). One file may legitimately touch two subjects; it is placed by its
*primary* subject module, and the family tables below name the module each family's files import.

| # | Family | Files |
| --- | --- | ---: |
| A | store / traversal / retrieval | 34 |
| B | renderer panes / tabs / zones / shell | 87 |
| C | editing — rich-text / textarea | 21 |
| D | import / parse | 6 |
| E | MCP / security | 18 |
| F | gnosis / engine | 11 |
| H | embeddings / vector | 9 |
| I | the `blind-*` batteries | 7 |
| J | the `unit-*-greens` / blind batteries | 11 |
| K | adversarial suites | 9 |
| L | driver / contract suites + the O-0 harness | 10 |
| M | misc | 1 |
| | **total** | **224** |

**The `templates / operator` subject** (the requested family **G**) is carried **inside A/B** as its
primary module requires: `template.test.ts`, `template-adversarial.test.ts` and
`unit-ms5-settings-listing.test.ts` sit in **B** (they import `src/main/template-store.ts` /
`src/main/template-shape.ts` and the `sidebar-panes` host); `operator-settings-editing-mode.test.ts`,
`unit-u-shell-7-settings-modal.test.ts` and `unit-u-shell-8-view-menu-pane-visibility.test.ts` are in
**B/C**. All six are named individually in §3, and their module verification is §2.6 — **no test is
unaccounted for**, and the four-class counts in §3 sum to 224.

> Family **G (templates / operator)** is carried inside the B and M tables — its six files
> (`template.test.ts`, `template-adversarial.test.ts`, `operator-settings-editing-mode.test.ts`,
> `unit-ms5-settings-listing.test.ts`, `unit-u-shell-7-settings-modal.test.ts`,
> `unit-u-shell-8-view-menu-pane-visibility.test.ts`) are pinned in §3 by name and their module
> verification is in §2.6, so no test is unaccounted for.

### §1.1 The inventory, classified

Each row: **file** · **lines** · **the subject it pins** (the file's own top-level `describe` /
header) · **class**.


### A. store / traversal / retrieval

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `doc-flow.test.ts` | 267 | validateDocFlow — happy paths (§5.2 rule 5) | **KEEP-LIVE** |
| `lookback-adversarial.test.ts` | 408 | L3 — security-store accepts the rag/edit groups (a) | **KEEP-LIVE** |
| `rag-store-adversarial.test.ts` | 431 | RagStore — adversarial regression (HOST findings) | **HOLD-UNTIL-IMPLEMENTED** |
| `rag-store.test.ts` | 420 | RagStore — Unit A persistence (unit-a-rag-store.md §5.8/§5.9) | **HOLD-UNTIL-IMPLEMENTED** |
| `retrieval-adversarial.test.ts` | 323 | Unit E adversarial-fix regression (HOST findings F1-F7) | **KEEP-LIVE** |
| `retrieval.test.ts` | 741 | Unit E — retrieval module (unit-e-rag-index.md §5.8/§5.9) | **KEEP-LIVE** |
| `traversal-e2e.test.ts` | 245 | E2E scenario 9 — cross-document shared node (B/C → A → D) | **KEEP-LIVE** |
| `traversal.test.ts` | 769 | buildTraversal — happy paths (§5.7) | **KEEP-LIVE** |
| `unit-f1-merge-store-results.test.ts` | 511 | Unit F1 — the rank-based interleave (§5.2) | **KEEP-LIVE** |
| `unit-f2-result-qualification.test.ts` | 803 | Unit F2 — the A-F1 gate: `qualified: false` pass-through (§5.3/§5.8-1) | **KEEP-LIVE** |
| `unit-f3-stores-all-schema.test.ts` | 587 | §5.2 — Guard 1: `store` + `stores` mutual exclusion (A-F3) | **KEEP-LIVE** |
| `unit-q-retrieval-children-indexing.test.ts` | 322 | Unit Q — retrieval indexing of inline children text (unit-q-retrieval-children-indexing.md §5.6/§5.7) | **KEEP-LIVE** |
| `unit-r-traversal-inline-children.test.ts` | 817 | Unit R — inline-children rendering in buildSubtree (§5.6) | **KEEP-LIVE** |
| `unit-ud1-document-metadata-fields-adversarial.test.ts` | 214 | RagStore — Unit U-D1 adversarial F1 (structural replay normalization) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud1-document-metadata-fields.test.ts` | 738 | RagStore — Unit U-D1 document metadata fields (§5.6 happy-path states) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud2-journal-invertibility.test.ts` | 578 | RagStore — Unit U-D2 journal invertibility (§5.6 happy-path states) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud3-import-path-id-scheme-adversarial.test.ts` | 179 | U-D3 adversarial ADV-1 — alias scoped to the SAME sanitized parent path | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud3-import-path-id-scheme.test.ts` | 517 | U-D3 §5.6 — happy-path states (path-qualified id + documentPath) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud4-doc-heads-tree-adversarial.test.ts` | 182 | F1 — buildDocumentTree depth-safety | **KEEP-LIVE** |
| `unit-ud4-doc-heads-tree.test.ts` | 527 | §5.1 the amended RagDocHeadsPayload entry (path/tags required) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud5-list-documents-tool.test.ts` | 664 | U-D5 §5.2 — the security.ts seam (TOOL_GROUPS + unchanged unions) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud6-query-document-filters-adversarial.test.ts` | 142 | U-D6 adversarial — F1: an unowned crosslink is not excluded by a NON-document filter object | **KEEP-LIVE** |
| `unit-ud6-query-document-filters.test.ts` | 596 | U-D6 §5.6.1 — the LOCAL-only extension type | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ud7-set-doc-meta-op.test.ts` | 772 | U-D7 setDocMeta — §5.6 happy-path states | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ujr1-get-journal.test.ts` | 756 | U-JR1 §3 valid-path states (engine `Supervisor.journalEntries`) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-v1-store-adjacency-adversarial.test.ts` | 191 | Unit V1 adversarial — MED-1: createSnapshotStore captures an immutable view | **KEEP-LIVE** |
| `unit-v1-store-adjacency.test.ts` | 500 | Unit V1 — shared PURE adjacency core: buildAdjacencyIndex (§5.1/§5.6/§5.7) | **KEEP-LIVE** |
| `unit-v2-scoped-traversal-mcp-adversarial.test.ts` | 479 | HOST-2 — cross-document shared fixture equivalence (amendment 1) | **KEEP-LIVE** |
| `unit-v2-scoped-traversal-mcp.test.ts` | 681 | computeDocumentSubgraph (§5.2) — RED (export does not exist yet) | **KEEP-LIVE** |
| `unit-v3-doc-heads-docnav-adversarial.test.ts` | 335 | MED-1 — handleRagDocHeadsIpc skips a doc-head edge with a missing/undefined/empty target | **KEEP-LIVE** |
| `unit-v3-doc-heads-docnav.test.ts` | 533 | §5.1 the rag-doc-heads IPC constant + payload type (types.ts) | **KEEP-LIVE** |
| `unit-v5-bridge-capture.test.ts` | 434 | Pin 2 — the capture survives the beforeEach boundary (the Class-A failure mode) | **KEEP-LIVE** |
| `unit-v5-migration-contract.test.ts` | 660 | Pin 1 (§3.1 / §4 P-SM-2) — the ONE sanctioned pattern across the derived bridge-mock census | **KEEP-LIVE** |
| `unit-x-rag-provenance-traversal.test.ts` | 841 | Unit X — additive store fields (§5.1) | **KEEP-LIVE** |

### B. renderer panes / tabs / zones / shell

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `0-2-regression-adversarial.test.ts` | 105 | 0.2 regression — the demo envelope round-trips intact (no shrink/double) | **KEEP-LIVE** |
| `contenteditable-caret.test.ts` | 238 | the discriminated CaretState + RichCaretEdge (§1.2, §2.1 states 1-2) | **HOLD-UNTIL-IMPLEMENTED** |
| `debug-panel.test.ts` | 42 | debug panel — hosted by the isolated SecurePanels graph (SecurePanels.refreshDebug) | **KEEP-LIVE** |
| `module-dynamic.test.ts` | 81 | U9 — dynamic tool registration (M-r3, proposal §5) | **KEEP-LIVE** |
| `module-e2e.test.ts` | 128 | U9-FIX — the store→router→MCP dynamic-tool chain (integration) | **KEEP-LIVE** |
| `module-image.test.ts` | 95 | imageResult — format an MCP image content block (M-r4, proposal §9) | **KEEP-LIVE** |
| `module-pane.test.ts` | 216 | IPC channel constants (module-feature-list.md §4) | **KEEP-LIVE** |
| `module-queue.test.ts` | 112 | U7 — async-queue data-hook: bounded queue (M-r12, proposal §4 + feature-list §3) | **KEEP-LIVE** |
| `module-router.test.ts` | 210 | CapabilityRouter — registerModule + tool registration (§4, feature-list §3) | **KEEP-LIVE** |
| `module-security-gate.test.ts` | 132 | module group validity — OFF by default, VALID when granted (§5, M-r6) | **KEEP-LIVE** |
| `module-store.test.ts` | 214 | ModuleStore — persisted module registry (module-import-proposal.md §6, fail-disabled) | **KEEP-LIVE** |
| `module-tools.test.ts` | 246 | ModuleManifest type shape (§2) | **KEEP-LIVE** |
| `module-transform.test.ts` | 128 | U6 — render-transform wiring into the Runtime render (M-r5) | **KEEP-LIVE** |
| `props-a1-crud-routing-proxy.test.ts` | 693 | PBT register (§5.7) | **ORPHANED-PIN** |
| `props-a2-document-crud-wiring.test.ts` | 787 | PBT register (§5.7) | **KEEP-LIVE** |
| `props-cross-doc-shared.test.ts` | 757 | §5.7 register — U-SHELL-9b cross-document-shared | **KEEP-LIVE** |
| `props-layout-state.test.ts` | 368 | U-SHELL-1 §5.7 the PBT register (deterministic mulberry32) | **KEEP-LIVE** |
| `props-pane-graph.test.ts` | 633 | PBT register (§5.7) | **KEEP-LIVE** |
| `props-reconcile-1a.test.ts` | 541 | U-STATE-1a §5.7 the PBT register (deterministic mulberry32) | **KEEP-LIVE** |
| `props-reconcile-1e.test.ts` | 744 | PBT register (§5.7) — N-root reconcile | **KEEP-LIVE** |
| `props-shell-integration.test.ts` | 624 | PBT register (§5.7) | **KEEP-LIVE** |
| `props-tab-state.test.ts` | 592 | U-SHELL-9a §5.7 the PBT register (deterministic mulberry32) | **KEEP-LIVE** |
| `renderer-backend.test.ts` | 358 | RendererBackend — A2/A6 lifecycle hardening (RED) | **ORPHANED-PIN** |
| `renderer-empty-zone-track.test.ts` | 549 | F-3 empty-zone track: a collapsed-track variable exists AND is consumed (point 1) | **KEEP-LIVE** |
| `renderer-pane-drag-surface.test.ts` | 506 | F-1 U-3 — the pane-drag GESTURE SURFACE is the pane HEADER (clause 2) | **KEEP-LIVE** |
| `runtime-battery.test.ts` | 349 | Runtime battery surface (spec e2e-test-battery.md §3) | **ORPHANED-PIN** |
| `runtime-host.test.ts` | 320 | renderer Runtime — host capabilities (spec runtime-host.md §2/§3/§4) | **ORPHANED-PIN** |
| `runtime.test.ts` | 125 | renderer Runtime — MCP-facing provident-ssr surface (provident-ssr 0.1.1) | **KEEP-LIVE** |
| `secure-panels.test.ts` | 190 | SecurePanels — the isolated security/debug pane graph | **ORPHANED-PIN** |
| `sidebar-panes-adversarial.test.ts` | 272 | H1 — data-flow helpers survive a null store/ctx | **KEEP-LIVE** |
| `sidebar-panes-host.test.ts` | 1043 | census (§5.10) | **KEEP-LIVE** |
| `sidebar-panes.test.ts` | 812 | PaneRegistry — register/get/list (§5.8 1-2) | **KEEP-LIVE** |
| `template-adversarial.test.ts` | 202 | I3 — bridge.template.validate sends { template: tpl } (MCP/UI equivalence) | **KEEP-LIVE** |
| `template.test.ts` | 924 | DEFAULT_CONTENT_WINDOW_TEMPLATE + the store — happy paths (§5.8) | **KEEP-LIVE** |
| `unit-h1-registry-write.test.ts` | 1073 | U-H1 RED marker — the write module does not exist yet (§5.1, §6) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-h2-runtime-controller.test.ts` | 1411 | createRagStoreRuntimeController — the module + factory (§5.2/§5.3) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-h4-hot-remove.test.ts` | 758 | P0 — the U-H4 additive orchestration surface is ABSENT on the pre-U-H4 code (RCA-1 red marker) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-h5-teardown.test.ts` | 595 | P0 — the U-H5 additive members are ABSENT on the pre-U-H5 code (RCA-1 red marker) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-h6-hot-rename.test.ts` | 830 | P0 — the U-H6 additive surface is ABSENT on the pre-U-H6 code (RCA-1 red marker) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-h7-default-reassign.test.ts` | 1231 | P0 — the U-H7 additive surface is ABSENT on the pre-U-H7 code (RCA-1 red markers) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-h8-operator-editor.test.ts` | 1348 | P0 — the U-H8 manage surface DOES NOT EXIST (the four markers of the red set absence markers) | **KEEP-LIVE** |
| `unit-live-dom-click-dispatch.test.ts` | 105 | LIVE root cause — the real-DOM-click→dispatch seam resolves a path-key wire | **KEEP-LIVE** |
| `unit-live11-bridge-seams.test.ts` | 705 | U-LIVE11 (a) — preload exposes the four collapse/visibility seams as functions (§2.1, P-IM-1) | **KEEP-LIVE** |
| `unit-live4-adversarial-fix.test.ts` | 295 | U-LIVE4 AD-2026-09-14-1 — phantom landing ghost: the empty-boot landing is destroyed when the store fills | **KEEP-LIVE** |
| `unit-live4-empty-store-landing.test.ts` | 346 | U-LIVE4 §6.1 — empty-boot assembly contains #stage-landing in ONE pane-inclusive envelope | **KEEP-LIVE** |
| `unit-live8-toolbar-undo-refresh.test.ts` | 481 | U-LIVE8 §6 (a) — host reconcile red: content edit + reDerive("content") enables Undo | **KEEP-LIVE** |
| `unit-ms1-store-registry.test.ts` | 1312 | U-MS1 RED marker — the pure module does not exist yet (§5.1, §6) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ms2-store-wiring.test.ts` | 2192 | U-MS2 RED marker — the pure module does not exist yet (§5.1, §6) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ms3-store-qualified-broadcast.test.ts` | 770 | TYPECHECK-LEVEL red — the collapsed shared declaration requires store (§5.1, §5.7 happy 1, §5.8 fail 1/7) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-runtime-applycommand-placement.test.ts` | 111 | HOST-APPLYCOMMAND-PLACEMENT-STATESLICE — placement-routed state-slice | **KEEP-LIVE** |
| `unit-u-edit-1-markdown-html-toggle.test.ts` | 420 | editor toolbar — app-graph authoring (§2 placement, §3 state 4) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-u-edit-2-undo-redo-history.test.ts` | 607 | U-EDIT-2 §2.5 — the project-journal IPC constants + types | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-u-import-1-import-surface.test.ts` | 749 | U-IMPORT-1 §3a · expandImportDirectory valid states | **KEEP-LIVE** |
| `unit-u-menu-1-application-menus.test.ts` | 318 | U-MENU-1 · the pane IPC channel consts | **KEEP-LIVE** |
| `unit-u-parity-c18-advanced-search.test.ts` | 494 | state 1 — disclosure sub-pane (collapsed by default) | **KEEP-LIVE** |
| `unit-u-parity-c19-hover-preview.test.ts` | 511 | state 1 — the linked node section resolves + authors a popup | **KEEP-LIVE** |
| `unit-u-parity-decisions.test.ts` | 232 | PG12 — the module pane authors an operator-only runner control | **KEEP-LIVE** |
| `unit-u-parity-docnav.test.ts` | 480 | PG14 — doc-nav leaves carry a select handler + is-clickable | **KEEP-LIVE** |
| `unit-u-parity-partials.test.ts` | 225 | U-PARITY-PARTIALS 1.1 — the template-editor Validate control (W1-Q11 a) | **KEEP-LIVE** |
| `unit-u-shell-1-layout-zones.test.ts` | 784 | U-SHELL-1 — the layout module + coerceLayout (spec §2.1/§2.2, §5) | **KEEP-LIVE** |
| `unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts` | 192 | W2-N1 — host boot read + write-through of OperatorSettings.layout | **KEEP-LIVE** |
| `unit-u-shell-1-w2n3-zone-size-grid.test.ts` | 86 | W2-N3 — ZoneLayout.size drives the shell grid (CSS custom properties) | **KEEP-LIVE** |
| `unit-u-shell-1-w2n4-operator-grid-area.test.ts` | 82 | W2-N4 — the operator pane does not occupy the app `right` zone | **KEEP-LIVE** |
| `unit-u-shell-2-theme.test.ts` | 104 | U-SHELL-2 — resolveTheme (pure) | **KEEP-LIVE** |
| `unit-u-shell-3-collapsible-panes.test.ts` | 633 | U-SHELL-3 — pane frame: header-only render + provident collapse control (§2.1/§2.2) | **KEEP-LIVE** |
| `unit-u-shell-4-drag-relocate.test.ts` | 1043 | U-SHELL-4 — the drag module + pure helpers (spec §5) | **KEEP-LIVE** |
| `unit-u-shell-5-resizable-gutters.test.ts` | 643 | U-SHELL-5 — the gutter module + clamp/min constants (spec §5, §2.1) | **KEEP-LIVE** |
| `unit-u-shell-6-hover-affordance.test.ts` | 260 | U-SHELL-6 — the shared is-clickable convention (render-shared) | **KEEP-LIVE** |
| `unit-u-shell-7-settings-modal.test.ts` | 997 | U-SHELL-7 §5.7 the PBT register (deterministic mulberry32, pinned seed) | **KEEP-LIVE** |
| `unit-u-shell-8-view-menu-pane-visibility.test.ts` | 968 | U-SHELL-8 — View → Panes data-driven menu (spec §2.1, W2-Q10) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-u-shell-9a-main-focus-tabs.test.ts` | 1086 | U-SHELL-9a — the TabTarget/TabEntry/TabState model (spec §2.2) | **KEEP-LIVE** |
| `unit-u-shell-9b-blind-greens.test.ts` | 732 | U-SHELL-9b blind — H3 per-document id namespace (§2.7) | **KEEP-LIVE** |
| `unit-u-shell-9b-cross-document-shared.test.ts` | 920 | U-SHELL-9b — Option-C detection (spec §2.2/§2.4, §3.1/§3.6, §4) | **KEEP-LIVE** |
| `unit-u-shell-9b-h1-optionc-interception.test.ts` | 516 | U-SHELL-9b H1 — sharedCommitStripContent (spec §2.9) | **KEEP-LIVE** |
| `unit-u-shell-9b-h2-c20-materialization.test.ts` | 377 | U-SHELL-9b H2 — buildOwnersMap (§2.8 owners reverse map) | **KEEP-LIVE** |
| `unit-u-shell-9b-h3-doc-namespace.test.ts` | 376 | U-SHELL-9b H3 — scopeDocumentIds (§2.7 scope carrier) | **KEEP-LIVE** |
| `unit-u-shell-9b-w2n15-rederive-scope.test.ts` | 228 | U-SHELL-9b W2-N15 — owners-box decoration is idempotent (§2.10) | **KEEP-LIVE** |
| `unit-u-shell-shell-wiring-adversarial.test.ts` | 538 | HOST-1 — the wiring routes gutters/frames authored AFTER install (delegated document pointerdown) | **KEEP-LIVE** |
| `unit-u-shell-shell-wiring-pbt-generators.test.ts` | 442 | U-SHELL-N7 §5.7 PBT negative/malformed-generator complement (deterministic mulberry32) | **KEEP-LIVE** |
| `unit-u-shell-shell-wiring.test.ts` | 814 | U-SHELL-N7 §5.7 the PBT register (deterministic mulberry32, pinned seed) | **KEEP-LIVE** |
| `unit-u-state-1a-content-reconcile-adversarial.test.ts` | 122 | U-STATE-1a adversarial regressions | **KEEP-LIVE** |
| `unit-u-state-1a-content-reconcile.test.ts` | 233 | U-STATE-1a — §4 states | **KEEP-LIVE** |
| `unit-u-state-1b-host-application.test.ts` | 170 | U-STATE-1b — §4 states | **KEEP-LIVE** |
| `unit-u-state-1c-persistent-scaffolding.test.ts` | 164 | U-STATE-1c — Runtime persistent scaffolding | **KEEP-LIVE** |
| `unit-u-state-1e-nroot-reconcile.test.ts` | 656 | U-STATE-1e — §3 states | **KEEP-LIVE** |
| `unit-u-state-w2n11-depth-safety.test.ts` | 133 | W2-N11 — U-STATE-1a `reconcileContentRoots` depth safety | **KEEP-LIVE** |
| `unit-wave-1-bridge-wiring.test.ts` | 305 | W1-N5 — template Validate host hook | **KEEP-LIVE** |

### C. editing — rich-text / textarea

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `contenteditable-editor-host.test.ts` | 1163 | census (§3) | **HOLD-UNTIL-IMPLEMENTED** |
| `edit-adversarial.test.ts` | 497 | edit-ops adversarial fixes (H4/M1/M2/M3/L1/L2/L3/L4) | **HOLD-UNTIL-IMPLEMENTED** |
| `edit-controller.test.ts` | 285 | edit-controller — Unit D editing controller (unit-d-editing.md §5.2/§5.3/§5.4/§5.8/§5.9) | **HOLD-UNTIL-IMPLEMENTED** |
| `edit-ops.test.ts` | 430 | edit-ops — Unit D editing write-back (unit-d-editing.md §5.1/§5.8/§5.9) | **HOLD-UNTIL-IMPLEMENTED** |
| `editing-mode-broadcast-host.test.ts` | 725 | census — the U1 host additions (§3) | **HOLD-UNTIL-IMPLEMENTED** |
| `operator-settings-editing-mode.test.ts` | 269 | operator-settings store — the editingMode default (§2.1 state 1) | **HOLD-UNTIL-IMPLEMENTED** |
| `rich-eligibility.test.ts` | 180 | rich-eligibility — module existence | **HOLD-UNTIL-IMPLEMENTED** |
| `rich-splice.test.ts` | 662 | rich-splice — eligible root splices (§2.1 state 11) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-l-textarea-editing-ui.test.ts` | 734 | census (§5.10) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-m-children-field.test.ts` | 488 | RagStore — Unit M children field (§5.6 happy-path states) | **KEEP-LIVE** |
| `unit-m1-inline-offset-model.test.ts` | 378 | unit-m1 — the offset model + full-projection producers (§5.6) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ms4-id-prefixing-adversarial.test.ts` | 427 | F-MS4-3 — a non-string params.corpusRoot ⇒ the byte-pinned fail-state, NEVER a thrown TypeError (§5.2 step 3) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ms4-id-prefixing.test.ts` | 1228 | U-MS4 RED marker — the optional third parameter does not exist yet (§5.1, §6) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-ms5-settings-listing.test.ts` | 806 | §5.1 — IPC_RAG_STORE_LISTING + the store-listing types (types.ts, RED) | **KEEP-LIVE** |
| `unit-n-batch-atomicity.test.ts` | 558 | RagStore — Unit N batch atomicity (§5.7 happy-path states) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-o-edit-ops.test.ts` | 513 | edit-ops — Unit O rich-text ops (§5.7 happy-path states) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-p-ipc-edit-batch.test.ts` | 483 | edit-batch — Unit P IPC_EDIT_BATCH (§5.6 happy-path states) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-s-paste-sanitization.test.ts` | 483 | paste-sanitize — Unit S happy-path states (§5.6) | **KEEP-LIVE** |
| `unit-u2-rich-decompose.test.ts` | 687 | rich-decompose — module existence | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-u5-rich-commit-ipc.test.ts` | 401 | handleRichCommit — Unit U5 (§2.1 states 16–19) | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-u5-set-rich-text.test.ts` | 702 | setRichText — Unit U5 (§2.1 happy-path states) | **HOLD-UNTIL-IMPLEMENTED** |

### D. import / parse

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `import-render-no-duplicates.test.ts` | 243 | an IMPORTED document materializes each RAG node exactly ONCE (the user 1-1 requirement) | **KEEP-LIVE** |
| `markdown-endpoint.test.ts` | 58 | 0.2 MarkdownAdapter endpoint (provident.get_markdown) | **KEEP-LIVE** |
| `unit-defect-resolution.test.ts` | 218 | HOST-MS4-10 · edit.import_markdown must not silently pre-filter non-string files | **KEEP-LIVE** |
| `unit-import-batch-persist-contract.test.ts` | 1195 | §3 states — the persist census, the boundaries and the durability oracles | **HOLD-UNTIL-IMPLEMENTED** |
| `unit-t-markdown-import.test.ts` | 321 | markdown-import — Unit T happy-path states (§5.6) | **KEEP-LIVE** |
| `unit-t-markdown-parse.test.ts` | 291 | markdown-parse — Unit T happy-path states (§5.6) | **KEEP-LIVE** |

### E. MCP / security

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `blind-mcp-notify.test.ts` | 144 | S1: notify is per-resource content update, not tool/list change | **KEEP-LIVE** |
| `blind-mcp-resources.test.ts` | 153 | S1 — resources exist and are gated by read | **KEEP-LIVE** |
| `blind-security-gate.test.ts` | 493 | G1 — Tool-group mapping (spec §2) | **ORPHANED-PIN** |
| `integration-adversarial.test.ts` | 352 | Finding 1 — MCP edit.* broadcast uses IPC_RAG_STORE_CHANGED | **KEEP-LIVE** |
| `journal-endpoint.test.ts` | 333 | Runtime.journal — undo/redo/replay (J3-J8) | **ORPHANED-PIN** |
| `journal-reversibility.test.ts` | 184 | journal reversibility — state-slice | **ORPHANED-PIN** |
| `mcp-notify-adversarial.test.ts` | 96 | A1 — N3: SecurePanels NEVER emits the notify (no operator leak) | **KEEP-LIVE** |
| `mcp-notify.test.ts` | 49 | N2 — stdio-only push (never a silent HTTP hang) | **ORPHANED-PIN** |
| `mcp-resources-adversarial.test.ts` | 88 | A1 — a `read`-off gate shuts off the resources (no bypass door) | **KEEP-LIVE** |
| `mcp-resources.test.ts` | 87 | MCP resources — read-group gating (R1/R2) | **ORPHANED-PIN** |
| `mcp-security-hardening.test.ts` | 1013 | Invariant (a) — every rag.* tool is read-only + rag-group + default-off (§5.2a) | **KEEP-LIVE** |
| `mcp-server-gate.test.ts` | 108 | ProvidentMcpServer gate (spec §2/§4) | **ORPHANED-PIN** |
| `mcp-server-wiring.test.ts` | 147 | toolForName (§2, §5) | **ORPHANED-PIN** |
| `mcp-stdio-e2e.test.mjs` | 70 | (no top-level describe — a script / battery runner) | **KEEP-LIVE** |
| `rag-edit-gate.test.ts` | 230 | Seam 1 — security.ts ToolGroup/TOOL_GROUPS/VALID_GROUPS/defaultSecurityConfig (§5.3) | **KEEP-LIVE** |
| `security-gate.test.ts` | 184 | SecurityGate — construction & defaults (§2, §3) | **ORPHANED-PIN** |
| `security-store.test.ts` | 234 | SecurityStore — manual-UI settings persistence (mcp-endpoint.md §6.4) | **KEEP-LIVE** |
| `security.test.ts` | 159 | groupForTool — spec §2 table | **ORPHANED-PIN** |

### F. gnosis / engine

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `blind-unit-a2-document-crud-wiring-greens.test.ts` | 865 | §5.2 gnosis-edit group + security | **KEEP-LIVE** |
| `blind-unit-gn-engine-integration-greens.test.ts` | 787 | Factory + proxy surface (§5.1, §5.8-1/14, §5.9-1/2/3) | **ORPHANED-PIN** |
| `blind-unit-gn-mcp-ui-wiring-greens.test.ts` | 549 | §5.2 gnosis group + security | **KEEP-LIVE** |
| `blind-unit-shell-integration-greens.test.ts` | 750 | §5.1 engine-transport — isLoopbackHost/assertLoopback/headers/transportError/fetchWithTimeout/createEngineFetch | **KEEP-LIVE** |
| `engine-crud-real-transport.test.ts` | 105 | createEngineCrudRagStore — DEFAULT transport is GET-with-body capable (HOST-GET-WITH-BODY-SSE-CRUD) | **KEEP-LIVE** |
| `engine-surfaces.test.ts` | 157 | provident-ssr 0.1.1 shared surfaces (the adopted contract) | **KEEP-LIVE** |
| `unit-a1-crud-routing-proxy.test.ts` | 1709 | createEngineCrudRagStore — factory + proxy surface | **ORPHANED-PIN** |
| `unit-a2-document-crud-wiring.test.ts` | 1283 | handleGnosisTool — the 11 document/wiki tools (RED until wired) | **KEEP-LIVE** |
| `unit-gn-engine-integration.test.ts` | 1741 | createEngineRagStore — factory + proxy surface | **ORPHANED-PIN** |
| `unit-gn-mcp-ui-wiring.test.ts` | 1180 | handleGnosisTool — the gnosis.* tools (RED until wired) | **KEEP-LIVE** |
| `unit-shell-integration.test.ts` | 801 | engine-transport.ts — the shared transport module (RED until implemented) | **KEEP-LIVE** |

### H. embeddings / vector

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `embeddings-adversarial.test.ts` | 462 | Unit F adversarial findings (F1-F9) — host fixes + regression tests | **KEEP-LIVE** |
| `embeddings-batch.test.ts` | 580 | W2 §5.2 ollama embedBatch (batch seam, mocked fetch) | **KEEP-LIVE** |
| `embeddings-failure-policy.test.ts` | 711 | W3 embed-failure policy — transient skips (§5.3, §5.9 #46) | **KEEP-LIVE** |
| `embeddings-ollama-integration.test.ts` | 72 | (no top-level describe — a script / battery runner) | **KEEP-LIVE** |
| `embeddings.test.ts` | 741 | Unit F — embeddings module (unit-f-embeddings.md §5.8/§5.9) | **KEEP-LIVE** |
| `live-embed-cache.test.ts` | 953 | Unit F / W5 — the live embed cache (unit-f-embeddings.md §5.13 W5 amendment + §5.5 `cache?` + §5.12 promote step) | **KEEP-LIVE** |
| `vector-boot-adversarial.test.ts` | 351 | Unit F / W1 — RCA-3 adversarial pass (docs/specs/unit-f-embeddings.md §3a F-W1-1..F-W1-5 + §5.12) | **KEEP-LIVE** |
| `vector-boot.test.ts` | 1042 | §5.12 warmUpEmbeddingProvider (§5.8 #27 happy; §5.9 #37/#44 fail-states) | **KEEP-LIVE** |
| `vector-cache.test.ts` | 1224 | Unit F / W4 — the persisted embedding cache (unit-f-embeddings.md §5.13 + §5.8 #40–42 + §5.9 #49–51 + §5.12) | **KEEP-LIVE** |

### I. the blind-* batteries

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `blind-battery-hooks-handlers.test.ts` | 356 | Hooks-scenarios (battery-hooks-greens.md) | **ORPHANED-PIN** |
| `blind-battery-verify.test.ts` | 426 | B1 — the cycle-variant envelope (path-fork-cycle module) | **ORPHANED-PIN** |
| `blind-ci-divergence.test.ts` | 93 | D2 — the code.load teardown pin (ci-divergence-greens.md D2.5-D2.7) | **ORPHANED-PIN** |
| `blind-loadbatch.test.ts` | 167 | S1 — batch applies N ops and re-derives once | **ORPHANED-PIN** |
| `blind-renderer-debug.test.ts` | 399 | RendererBackend — R1..R10 (docs/specs/renderer-backend-greens.md) | **ORPHANED-PIN** |
| `blind-runtime-host.test.ts` | 474 | R1 — loadEnvelope (A2) & the render | **ORPHANED-PIN** |
| `gemma4-blind-battery.test.ts` | 421 | Gemma4 Blind Battery | **KEEP-LIVE** |

### J. the unit-*-greens / blind batteries

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `blind-unit-ud1-document-metadata-fields-greens.test.ts` | 737 | blind U-D1 A — persistence + round-trip | **KEEP-LIVE** |
| `blind-unit-ud2-journal-invertibility-greens.test.ts` | 327 | BLIND U-D2 greens — journal invertibility of document metadata | **KEEP-LIVE** |
| `blind-unit-ud3-import-path-id-scheme-greens.test.ts` | 523 | blind U-D3 H — path derivation + `/`-joined ids (§5.6) | **KEEP-LIVE** |
| `blind-unit-ud4-doc-heads-tree-greens.test.ts` | 603 | UD4-B1 payload entry shape (§5.1 / §5.6-1) | **KEEP-LIVE** |
| `blind-unit-ud5-list-documents-tool-greens.test.ts` | 447 | blind U-D5 — membership seams | **KEEP-LIVE** |
| `blind-unit-ud6-query-document-filters-greens.test.ts` | 576 | UD6-G S1 — flat: omission and empty arrays are no constraint (byte-equal) | **KEEP-LIVE** |
| `blind-unit-ud7-set-doc-meta-op-greens.test.ts` | 843 | UD7-G1 — tags-only update preserves path + all other fields | **KEEP-LIVE** |
| `blind-unit-ujr1-get-journal-greens.test.ts` | 504 | §3.1 — empty journal shape | **KEEP-LIVE** |
| `blind-unit-v1-store-adjacency-greens.test.ts` | 567 | A. Shared PURE adjacency core | **KEEP-LIVE** |
| `blind-unit-v2-scoped-traversal-mcp-greens.test.ts` | 721 | A. Scoped buildTraversal walk | **KEEP-LIVE** |
| `blind-unit-v3-doc-heads-docnav-greens.test.ts` | 533 | A. §5.6 happy-path states | **KEEP-LIVE** |

### K. adversarial suites

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `construction-exhaustion.test.ts` | 107 | construction-path exhaustion — graphScope threaded at EVERY construction site | **KEEP-LIVE** |
| `construction-exhaustion2.test.ts` | 48 | cross-scope adoption + render def-fill scope | **KEEP-LIVE** |
| `crosslink-backlink-adversarial.test.ts` | 154 | G1 — edit.set_edge empty-string documentIds (edit-ops.ts) | **KEEP-LIVE** |
| `crosslink-backlink.test.ts` | 622 | §5.1 crosslink RAG edge kind (rag-store.ts) | **KEEP-LIVE** |
| `isolation-adv-d.test.ts` | 22 | ISO-ADV-D fix verify | **KEEP-LIVE** |
| `isolation-adversarial-e2e.test.ts` | 116 | isolation adversarial (real Runtime + SecurePanels) — MCP surface vs isolated panes | **KEEP-LIVE** |
| `isolation-adversarial.test.ts` | 135 | isolation adversarial — the app graph must never reach the isolated panes graph | **KEEP-LIVE** |
| `loadbatch-adversarial.test.ts` | 127 | A1 — B2: a failing LATER op leaves the envelope untouched | **KEEP-LIVE** |
| `unit-o0-m1-m3-adversarial-pins.test.ts` | 611 | (no top-level describe — a script / battery runner) | **KEEP-LIVE** |

### L. driver / contract / O-0 harness suites

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `adapter-parity-battery.test.mjs` | 418 | (no top-level describe — a script / battery runner) | **ORPHANED-PIN** |
| `e2e-battery.test.mjs` | 571 | (no top-level describe — a script / battery runner) | **ORPHANED-PIN** |
| `live-drive-contract.test.ts` | 713 | R1 falsifiability — every row verdict derives `pass` from an observed value | **KEEP-LIVE** |
| `path-fork-cycle.test.ts` | 99 | pathForkCycleLegacyData — the cycle-variant static envelope (§5.1.x) | **ORPHANED-PIN** |
| `unit-o-0-driver-contract.test.ts` | 546 | O-0 §7 §3a finding 5 (driver twin) — the verdict fields are recomputed AFTER the post-style application | **KEEP-LIVE** |
| `unit-o-0-hook-contract.test.ts` | 1396 | §A the pure measurement-only hook recorder (src/shared/o0-hook.ts) | **KEEP-LIVE** |
| `unit-o-0-report-contract.test.ts` | 2118 | O-0 §6 fail-states F1..F5 — every forcing condition is loud (§4.3: pass:false + a failReasons line) | **KEEP-LIVE** |
| `unit-o0-m1-m3-driver-contract.test.ts` | 575 | (no top-level describe — a script / battery runner) | **KEEP-LIVE** |
| `unit-o0-m1-m3-measurement-shape.test.ts` | 1574 | O0-M1-M3 §5 — the register budget is stated, not implied | **KEEP-LIVE** |
| `unit-o0-m1-m3-reaudit-pins.test.ts` | 665 | RA-0 — the CONTROL row is legal by construction (§2/§3/§4.2) | **KEEP-LIVE** |

### M. misc

| Test file | Lines | Subject it pins | Class |
| --- | ---: | --- | --- |
| `loadbatch.test.ts` | 101 | code.loadBatch — B2 all-or-nothing atomicity | **KEEP-LIVE** |
---

## §2 — PER-FAMILY VERIFICATION: IS THE SUBJECT FEATURE STILL LIVE IN `src/**`?

**This is the load-bearing step.** A file may be archived **only** when the module/symbol it imports is
**absent** or its behaviour is **unreachable**. A decision superseding a behaviour is **not** evidence —
`docs/specs/design-extensions-review.md` §13.2 **S1** says it in terms: *"the contract says
engine-authoritative while the code still writes locally; that gap is RECORDED … never hidden"*.

**Method (mechanical, reproducible):** for every named import in all 224 files, resolve
`../src/<path>.js` → `<path>.ts` and search the target module's text for the binding. The probe covered
**value imports and `import type` bindings**. Result:

> **Zero unresolved modules. Zero unresolved symbols. 224/224 files import only what exists.**
> (One probe hit is a false positive and is reported honestly in §2.9: `tests/unit-ms4-id-prefixing.test.ts`
> carries an **inline comment inside its own import list** that reads
> *"← INTENTIONAL TYPE-LEVEL RED: `ImportStoreContext` … does not exist yet (TS2305 until U-MS4 lands)"* —
> the symbol **does** exist (`src/main/markdown-import.ts` `export interface ImportStoreContext`), so the
> test is green and the **comment is stale**, not the code.)

Additionally: **every `src/**/*.ts` module except `src/main/standalone.ts` (the CLI entry, deliberately
untested) is imported by at least one test** — there is no untested live module, so there is no
"test for a module nobody uses" case either.

### §2.1 — Family A: store / traversal / retrieval — **ALL LIVE**

| Module the family's files import | The symbols the files bind | Still exists? | Any part now unreachable? |
| --- | --- | --- | --- |
| `src/main/rag-store.ts` | `RagStore`, `RagNode`, `RagEdge`, `RagEdgeKind`, `RagEdgeType`, `RagNodeKind`, `RagReferenceState`, `RagNodeChild`, `RagNodeChildType`, `RagNodeType`, `BatchOp`, `BatchOpResult`, `BatchResult`, `createJsonRagStore`, `createSnapshotStore`, `buildAdjacencyIndex`, `AdjacencyIndex`, `edgesFromIndex`, `edgesToIndex`, `edgesByKindIndex`, `edgesForDocumentIndex`, `docHeadForDocumentIndex` | **YES** — all present | **NO.** `createJsonRagStore` is still constructed by `src/main/rag-store-runtime.ts` / `rag-store-default.ts` and is the **temporary authority** `S1` names. The 22-member `interface RagStore` (13 sync reads + 9 async) is unchanged. |
| `src/main/traversal.ts` | `buildTraversal`, `rebuildBackRefs`, `computeDocumentSubgraph`, `TraversalInput`, `TraversalResult`, `LineNodeMap`, `CrosslinkWiring`, `CROSSLINK_LINK_CONFIG` | **YES** | **NO** — and this file is an **explicit FENCE**: `docs/specs/design-extensions-review.md` §14.2 pins `tests/traversal.test.ts` *"GREEN UNCHANGED in P2"* and forbids treating it as a re-derivation casualty. |
| `src/main/adjacency.ts`, `src/main/doc-flow.ts`, `src/main/backlinks.ts`, `src/main/query-audit.ts`, `src/main/merge-store-results.ts` | `createSnapshotStore`, `validateDocFlow`, `DocFlowVerdict`, `enumerateLinks`, `listBacklinks`, `listOutlinks`, `documentOf`, `LinkEntry`, `LinkScope`, `BacklinkResult`, `createQueryAuditLog`, `mergeStoreResults`, `qualifyStoreResult` | **YES** | **NO** |
| `src/main/retrieval.ts` | `createRetrieval`, `createLexicalIndex`, `updateLexicalIndex`, `addToLexicalIndex`, `removeFromLexicalIndex`, `createLexicalEmbedder`, `retrieve`, `selectTopK`, `assembleContext`, `tokenize`, `nodeText`, `ragQuery`, `walkReferenceGraph`, `buildCitations`, `buildFlatTrace`, `expandParentContext`, `documentIdsForNode`, `Embedder`, `RagResult`, `RagResultItem`, `ScoredNode`, `StoreContextBlock`, `PlacementDecision`, `PLACEMENT_MIN_SCORE`, `DEFAULT_STOPWORDS`, `LineNodeMap`, `LexicalIndex`, `AssemblyOptions`, `AssemblyResult`, `RetrievalOptions`, `RetrievalResult`, `RetrievalEngine`, `RagQueryFilters`, `LocalRagQueryFilters`, `BlockedByType…` (`BlockedByEntry`), `FlatTrace`, `GraphTraceEntry`, `WalkOptions`, `WalkResult`, `RagTrace`, `RagQueryOptions` | **YES** | **NO** |
| `src/main/markdown-parse.ts`, `src/main/paste-sanitize.ts`, `src/main/rich-decompose.ts` (used by A/C) | `parseMarkdown`, `ParsedMarkdown`, `sanitizePastedHtml`, `SanitizePasteResult`, `parseHtml`, `escapeAttr`, `isSafeUrl`, `normalizeUrl`, `HtmlNode`, `HtmlElement`, `HtmlText`, `decomposeRichHtml`, `DecomposeRichResult` | **YES** | **NO** |

**Family-A conclusion:** nothing archivable. The family is dominated by `HOLD` (12) + `KEEP` (22).

### §2.2 — Family B: renderer panes / tabs / zones / shell — **ALL LIVE**

| Module | Symbols checked | Exists? | Unreachable part? |
| --- | --- | --- | --- |
| `src/renderer/runtime.ts` | `class Runtime` (+ `loadEnvelope`, `loadDoc`, `loadBatch`, `applyCommand`, `teardown`, `journal`, `applyContentReconcile`) | **YES** | **NO** — `applyContentReconcile` is the U-STATE-1b path still called by the host's `applyContentChange`. |
| `src/renderer/sidebar-panes.ts` | `SidebarPanes`, `SidebarPanesOptions`, `sidebarContent`, `settingsContent`, `applyPersistedPaneVisibility`, `applyEditingMode`, `applyEditorToolbar`, `persistEnabledPanes`, the `operator-enabled-panes` census node | **YES** | **NO — measured, see §2.3.** |
| `src/renderer/pane-registry.ts` | `PaneRegistry`, `PaneDefinition`, `PaneContext`, `PaneChange` | **YES** | **NO** |
| `src/renderer/pane-graph.ts` | `assembleAppGraphEnvelope`, `paneSubtreeRoot`, `operatorContent`, `editorToolbarContent`, `AppGraphAssemblyInput`, `AppGraphAssemblyResult` | **YES** | **NO** |
| `src/renderer/layout-state.ts` | `LayoutState`, `ZoneLayout`, `PaneLayoutEntry`, `LayoutPaneSpec` | **YES** | **NO** (O-3/O-9/O-10 have not landed — `--stage-weight` is still JS-projected) |
| `src/renderer/pane-drag.ts` / `pane-gutter.ts` / `render-shared.ts` / `hover-preview.ts` / `tab-strip.ts` / `theme.ts` / `modal-state.ts` / `content-reconcile.ts` / `cross-document-shared.ts` / `gnosis-panes.ts` / `gnosis-crud-panes.ts` | `createDragController`, `movePane`, `dropZoneForPoint`, `legalZonesForScope`, `zoneOrientation`, `withinSnapThreshold`, `gutterSizeForPoint`, `clampZoneSize`, `clickableClasses`, `HoverPreviewController`, `TabStrip`, `applyThemeToRoot`, `installSettingsModal`, `reconcileDocumentRoots`, `plainRagId`, `SharedOwners`, `ForkPlanInput`, `GnosisPanes`, `GnosisCrudPanes` | **YES — every one is imported by a live `src/` module**, not only by a test: `pane-drag` by `sidebar-panes.ts` + `pane-graph.ts` + `renderer.ts`; `pane-gutter` by `sidebar-panes.ts` + `renderer.ts`; `hover-preview` by `sidebar-panes.ts` + `pane-graph.ts`; `tab-strip`/`theme`/`modal-state`/`gnosis-panes`/`gnosis-crud-panes` by `renderer.ts`; `content-reconcile` by `sidebar-panes.ts` + `runtime.ts`; `cross-document-shared` by `sidebar-panes.ts` + `content-reconcile.ts`; `rich-eligibility` by `sidebar-panes.ts` | **NO** |
| `src/main/operator-settings-store.ts` | `OperatorSettingsStore`, `createOperatorSettingsStore`, `DEFAULT_OPERATOR_SETTINGS`, `coerceEditingMode` | **YES** | **NO.** `DEFAULT_SETTINGS.editingMode = 'contenteditable'`; `editingMode` is written/read on every get/set/patch. |
| `src/main/app-menu.ts` | `buildMenuTemplate`, `AppMenuActions`, `IMPORT_DIALOG_FILTERS`, `importSelectionFromDialog`, `normalizePaneCatalog`, `orderPaneCatalog` | **YES** | **NO.** The module's own header names *"pane visibility — U-SHELL-8 owns the …"*; the View → Panes catalog path is live. |
| `src/main/rag-store-registry*.ts`, `rag-store-directory.ts`, `rag-store-runtime.ts`, `rag-store-remove.ts`, `rag-store-default.ts` | `loadRagStoreRegistry`, `resolveRegistry`, `implicitRegistry`, `RAG_STORE_NAME_PATTERN`, `buildRagStoreDirectory`, `resolveStoreArg`, `storeLoadStatus`, `createRagStoreRuntimeController`, `drainAndReleaseEntry`, `createDefaultVectorBoot`, `releaseDefaultVectorBoot`, `writeRegistryMutation`, `applyRegistryMutation`, `addRegistryStore`, `removeRegistryStore`, `renameRegistryStore`, `renameDefaultRegistryStore`, `setDefaultRegistryStore`, `persistRagStoreRegistry` | **YES** | **NO.** `DECIDED: MULTI-STORE-REGISTRY` and `DECIDED: FANOUT-INTERLEAVE-MERGE` are **ACTIVE and explicitly not prunable** by the `GN-1` ruling. |
| `src/main/rag-store-registry-write.ts` `src/main/module-store.ts` `src/renderer/extensions.ts` | registry-write seam; `createModuleStore`, `ModuleStore`, `ModuleRecord`; `CapabilityRouter`, `ModuleCtx` | **YES** | **NO** (the module/extension lane is untouched by the 2026-09-21 rulings) |

**Family-B conclusion:** nothing archivable. 5 files are `ORPHANED-PIN` on citations only (§3.2).

### §2.3 — The three contested "superseded" behaviours, measured in the code

These are the cases the brief calls out by name. Each was resolved by grepping **the code that implements
it**, not the decision that supersedes it.

1. **`ST-6` (textarea editing is obsolete and is removed) — the code STILL IMPLEMENTS IT → `HOLD`.**
   `src/main/traversal.ts` `buildSubtree` still authors the textarea child
   (`{ type: 'textarea', props: { id: \`textarea-${ragId}\`, 'data-rag-node-id': ragId, value: node.content }, handlers: [{ name: 'rag-textarea-input', … }, { name: 'rag-textarea-blur', … }] }`)
   for **every** RAG subtree root. `src/renderer/sidebar-panes.ts` `applyEditingMode` **removes** it — but
   only on the `editingMode === 'contenteditable'` branch (`if (editingMode !== 'contenteditable') return`).
   `src/main/operator-settings-store.ts` still stores `editingMode` and both `src/renderer/pane-graph.ts`
   `editorToolbarContent` and `src/renderer/sidebar-panes.ts`'s toggle body still flip
   `'contenteditable' ↔ 'textarea'`. **The textarea path is reachable through a live, persisted operator
   setting and a live toolbar button** — the UI is *deprecated*, not *removed*. `ST-6`'s removal is
   **C9 `U-EDIT-1`'s work**, and `docs/defects.md` `EDIT-MODE-TEXTAREA-UI` carries it as **OPEN**.
2. **`WHOLE-PAGE-EDITING` (single whole-document editing block) — the per-node model STILL IMPLEMENTS IT
   → `HOLD`.** `DECIDED: WHOLE-PAGE-EDITING` says in terms *"(REQUIREMENT, not yet implemented)"* and
   *"the present per-paragraph/table-cell `contenteditable` (and per-node textarea) hosts break normal
   editing"*. `src/renderer/rich-eligibility.ts` `isRichEditableRoot(type, ownsDocChildren)` +
   `EDITABLE_TYPES` is the **per-node** eligibility gate; `applyEditingMode` authors `contenteditable: true`
   **per RAG root**. Per-node editing is the live model. The `EDITING-MODE-SETTING` /
   `FORM-CONTROL-EDITING` `SUPERSEDED` rows are written **at C9's landing, not before**
   (`docs/specs/design-extensions-review.md` §6.2 item (b)).
3. **`C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` — the dropdown STILL IMPLEMENTS IT → `HOLD`.**
   `DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` says of itself: *"**does not implement the
   removal** (that is a UI unit's work with its own spec, red set and live battery)"*. The code path is
   live end-to-end: `src/main/app-menu.ts` `normalizePaneCatalog`/`orderPaneCatalog`/`buildMenuTemplate`,
   `src/renderer/sidebar-panes.ts` `applyPersistedPaneVisibility` + `persistEnabledPanes` + the
   `#operator-enabled-panes` census, and the `IPC_PANE_VISIBILITY` seam. The owning unit is **C11
   `U-SEARCH`** (whose `PN-1` visibility half §3.3 C item 8 subordinates to the C13 removal).

### §2.4 — The engine-authoritative behaviours, measured in the code

| Superseding decision | What the code does today | Class consequence |
| --- | --- | --- |
| `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (`GN-1`) | **`src/main/rag-store.ts` `createJsonRagStore` is still the live store and still persists to `provident-rag.json` in `userData`**; `src/main/rag-store-runtime.ts` + `rag-store-default.ts` boot it; the `edit.*` ops write it; the reader is the traversal over it. `docs/specs/design-extensions-review.md` §14.1 **C-1** records the corpus (226 docs / 6 102 nodes / 9 266 edges) as *still local*, and §13.2 **S1** names the local store a **TEMPORARY authority with a recorded sunset** — the sunset fires when **`U-AUTHORITY-SWITCH` (O-8)** lands, and *"from that point any surviving local document write is a fence violation"*. **`U-AUTHORITY-SWITCH` has NOT landed** (`docs/specs/unit-authority-switch.md` is a SPEC; `src/main/authority-store.ts` exists for the *engine-CRUD* seam, not for the document-authority cutover). | The store/file-shape pins are **HOLD**, not archivable — **78 files construct `createJsonRagStore` directly**, and §14.1 **C-4** reads *"~120 of 221 test files import the data layer directly … the tests assert store state and file shape"*. |
| `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` (`GN-4`) | **No refusal exists.** `src/main/main.ts` boots the local store from disk regardless of engine presence; `src/main/engine-rag-store.ts` / `engine-crud-rag-store.ts` expose typed-unavailable errors only when their **own** seam is unconfigured. The `GN-4` reading is a **contract** with a typed failure vocabulary; §11.3's own text says the typed-unavailable surface *"is RETAINED as the failure vocabulary"*. | **No test pins the reversed identity clause**, so there is no file to archive here **and no file to keep on that ground either** — the probe for *"identical local path with no engine"* assertions returned **none**. The `no engine` matches in `tests/*` are the **seam** messages (`"<tool>: no engine crud rag store configured"` / `"gnosis.query: no engine rag store configured"`), i.e. the **surviving** typed-unavailable clause. This is a **finding, not a gap to prune**: nothing in the suite became dead. |
| `DECIDED: ADVISORY-REQUIREMENT-CATALOG` + the catalog-generator park | **The generator does not exist.** `scripts/catalog-derive.mjs` **ABSENT**; `tests/requirement-catalog-contract.test.ts` **ABSENT** (verified by direct path test). `docs/specs/unit-catalog-generator.md` is a DRAFT spec; `docs/pending.md` row **`U-CATALOG-GENERATOR`** is the park. | **This is the one place where an obsolescence is already true in the code — and there is no test to archive, because the unit never landed.** Recorded so no later pass looks for the file. |

### §2.5 — Families D/E/F/H/I/J/K/L/M: verification summary

| Family | Modules bound | Exists? | Unreachable part? |
| --- | --- | --- | --- |
| **D. import / parse** | `markdown-import.ts` `importMarkdownCorpus`/`ImportStoreContext`/`ImportMarkdownParams`/`ImportMarkdownResult`; `markdown-parse.ts` `parseMarkdown`; `edit-ops.ts` `EditOpContext`; `unit-ms4`/`unit-ud3` family | **YES** | **NO** — `ImportStoreContext` **exists** (§2.9); the id-prefix mint + A1 rejection are landed per `DECIDED: STORE-ID-PREFIX`. |
| **E. MCP / security** | `security.ts` `SecurityGate`/`ToolGroup`/`TOOL_GROUPS`/`MUTATING_METHODS`/`groupForTool`/`toolAllowed`/`moduleToolAllowed`/`applyPatch`/`authorized`/`defaultSecurityConfig`; `mcp-server.ts` `ProvidentMcpServer`/`registeredToolNames`/`toolForName`/`handleRagTool`/`handleRagQueryIpc`/`handleRagBacklinksIpc`/`handleEditTool`/`handleTemplateTool`/`handleGnosisTool`/`handleModuleTool`/`invokeModuleTool`/`imageResult`/`McpBackend`/`RendererBackend`; `security-store.ts` `createSecurityStore`/`gatePatchFromStoreResult` | **YES** | **NO.** `DECIDED: RAG-EDIT-MCP-GROUPS`, `HARDENING-VERIFICATION-CONTRACT`, `IPC-SURFACE-NOT-GROUP-GATED`, `EDIT-COMMIT-RETURN-ASYMMETRY` are all **ACTIVE**. |
| **F. gnosis / engine** | `engine-rag-store.ts` (`createEngineRagStore`, `ENGINE_ENDPOINTS`, `ENGINE_HTTP_STATUS`, `EngineError`/`EngineUnavailable`/`EngineWireError`/`ConflictError`/`TraceUnavailable`, `decodeEnvelope`/`decodeChunk`/`decodeError`/`decodeHealthReport`/`decodeRagResult`/`decodeSseChunk`/`parseSseFrame`/`wireCodeToError`, the trace types); `engine-crud-rag-store.ts` (`createEngineCrudRagStore`, `ENGINE_CRUD_ENDPOINTS`, `encodeCrudRequest`/`decodeCrudRequest`/`decodeCrudResponse`/`validateCrudResult`, `CrudMethod`, `Document`, `DocumentList`, `DocumentSummary`, `Wiki`); `engine-config.ts` (`getEngineConfigBaseUrl`, `setEngineConfigBaseUrl`); `engine-transport.ts` (`isLoopbackHost`, `assertLoopback`, `headers`, `transportError`, `fetchWithTimeout`, `createEngineFetch`, `createCrudFetch`) | **YES** | **NO — and this family is the DESTINATION, not the casualty.** `docs/specs/obsolete-document-disposition-2026-09-21.md` §D.1b.3 rules the `unit-a1-*`/`unit-a2-*` and `unit-gn-*` specs **"no contradiction — the opposite"**: they *are* the engine-CRUD wire client the ruling makes authoritative. **Archiving them would delete the pins on the destination.** |
| **H. embeddings / vector** | `embeddings.ts` (`createEmbeddingProvider`, `createOllamaEmbedProvider`, `createRemoteEmbedProvider`, `createMockEmbedder`, `createVectorEmbedder`, `createVectorIndex`, `addToVectorIndex`/`updateVectorIndex`/`removeFromVectorIndex`, `cosineSimilarity`, `isOllamaAvailable`, `parsePositiveIntEnv`, `EmbedTextFn`, `EmbeddingProvider`, `EmbeddingProviderConfig`, `VectorIndex`); `vector-boot.ts` (`createVectorBootController`, `warmUpEmbeddingProvider`, `VECTOR_BOOT_WARMUP_TEXT`, `VectorBootPhase`, `PromotionReport`, `VectorBootController`); `vector-cache.ts` (`createVectorCache`, `createSingleTextMemoizer`, `contentHashOf`, `CacheKey`, `VectorCache`) | **YES** | **NO.** `DECIDED: PROVIDER-AGNOSTIC`, `LEXICAL-FIRST-RETRIEVAL`, `VECTOR-TOPOLOGY-PER-STORE` stay ACTIVE; the disposition enumeration keeps the F-family **host-owned by name** (§D.1b.1 row 6). |
| **I/J. blind batteries + `unit-*-greens`** | the same live modules as their parent families; the batteries are **verification artifacts** that run against live modules | **YES** | **NO** |
| **K. adversarial suites** | the same live modules | **YES** | **NO** |
| **L. driver / contract / O-0 harness** | `src/shared/o0-report.ts` + `src/shared/o0-hook.ts` + `scripts/live-drive.mjs` + `src/main/battery-host.ts` (`RuntimeBackend`); `src/main/engine-transport.ts` | **YES** | **NO — with a HARD WARNING:** `docs/specs/design-extensions-review.md` §13.3 pins *"Oracle-identity discipline … a change to **either** file of the pair (`src/shared/o0-report.ts` + `scripts/live-drive.mjs`) invalidates the recorded live provenance … No unit of this program may touch the pair as a side effect."* |
| **M. misc** | `src/main/mcp-server.ts` (`code.loadBatch` seam, `Runtime.loadBatch`) | **YES** | **NO** |

### §2.6 — The `templates / operator` sub-verification (named explicitly)

`src/main/template-store.ts` (`createTemplateStore`, `TemplateStore`, `TemplateSource`, `TemplateStatus`,
`TemplateVerdict`, `validateTemplate`, `DEFAULT_CONTENT_WINDOW_TEMPLATE`), `src/main/template-shape.ts`
(`ContentWindowTemplate`), `src/renderer/template-pane.ts` (`TemplatePaneContext`),
`src/main/operator-settings-store.ts`, `src/main/app-menu.ts` — **all present, all reachable**.
`DECIDED: TEMPLATE-STORE`, `TEMPLATE-PANE`, `ZONE-CONSISTENCY-INVARIANT`, `CODE-GROUP-TEMPLATE-CRUD` are
**ACTIVE**; the disposition enumeration rules `docs/specs/unit-i-template.md` **"no contradiction … keep"**
(§D.1b.1 row 26). **Nothing archivable in this subject.**

### §2.7 — Shared helper / fixture inventory (the thing a naive prune breaks)

`tests/fixtures/` holds five files. **None may be archived by this program** — each is a *shared* input
whose sharers span both the proposed set and kept files:

| Fixture | Sharers | Rule |
| --- | --- | --- |
| `tests/fixtures/hooks-scenarios-data.mjs` | `tests/blind-battery-hooks-handlers.test.ts`, `tests/gemma4-blind-battery.test.ts`, `tests/e2e-battery.test.mjs` | **SHARED HELPER — NEVER ARCHIVE.** `gemma4-blind-battery.test.ts` is **KEEP-LIVE**, so archiving the fixture would redden a kept test. |
| `tests/fixtures/handlers-scenarios-data.mjs` | same three | **SHARED HELPER — NEVER ARCHIVE** (same reason). |
| `tests/fixtures/o0-artifact-third-edition-legs.json` · `…-banner.json` | `tests/unit-o0-m1-m3-driver-contract.test.ts` **only** | Single-consumer today, but it is the **O-0 oracle artifact** the gate record §13.3 protects; it stays with the **KEEP-LIVE** O-0 suite. **Do not archive a fixture with its consumer unless no kept test names it — and here the consumer is kept.** |
| `tests/fixtures/v5-bridge-capture-fixture.ts` | `tests/unit-v5-migration-contract.test.ts` **only** | **KEEP** (its consumer is a **fence-adjacent** contract file, KEEP-LIVE). |

**Source-module sharers to watch (imports, not lines):** `src/shared/dom-shim.ts`
(`installShim`/`mountEl`/`shimDocument`/`ShimElement`) is imported by **88 files**;
`src/main/rag-store.ts` by **99**; `src/main/security.ts` by **47**; `src/renderer/runtime.ts` by **65**;
`src/renderer/pane-registry.ts` by **43**; `src/renderer/sidebar-panes.ts` by **38**;
`src/renderer/edit-controller.ts` by **38**. **These are `src/` modules, not test helpers — they are never
archivable at all.** The rule the brief states applies to **`tests/fixtures/**` and any future
`tests/helpers/**`**, and its answer here is: **the ARCHIVE list (§4) contains no file that is the sole
consumer of any fixture except the O-0 and v5 fixtures — and neither of those consumers is on the list.**

### §2.8 — What would make a file `ARCHIVE-READY` (the counterfactual, for the next pass)

To move a file out of this audit and into `ARCHIVE-READY`, the pruning pass must produce **one** of:

- **module absence** — the file's `../src/<module>.js` no longer exists (today: 0 cases);
- **symbol absence** — a bound symbol is gone (today: 0 real cases; §2.9);
- **reachability loss** — the symbol exists but **no live `src/` module reaches the branch that calls
  it** (today: 0 cases — the three contested behaviours in §2.3 are all reachable);
- **replaced-by-unit** — the implementing unit landed **and** the archived file's pin is re-derived
  inside that unit's own red set (`docs/specs/design-extensions-review.md` §13.3: *"one unit = one spec,
  one red run, one green"*).

Only the **last** is achievable in this program, and only **after** the unit lands.

### §2.9 — The two honest anomalies

1. **`tests/unit-ms4-id-prefixing.test.ts` — a stale red-set comment, not a dead import.** The file's
   import list carries an inline comment claiming `ImportStoreContext` *"does not exist yet (TS2305 until
   U-MS4 lands)"*; `src/main/markdown-import.ts` `export interface ImportStoreContext` **exists** and the
   file is green. **Class: KEEP-LIVE.** The stale comment is a **doc-drift finding** (AGENTS.md item 3's
   spirit — a claim that no longer matches the code) for the file's owning unit's next doc-review, **not**
   an archive ground.
2. **`tests/unit-o-0-report-contract.test.ts` cites `docs/specs/other.md` and
   `tests/unit-ud3-import-path-id-scheme-adversarial.test.ts` cites `docs/2024/x.md`** — both are
   **illustrative path strings inside test data** for a citation-integrity check, **not** spec citations.
   They are **excluded from the `ORPHANED-PIN` set by inspection** (§3.2 says so) so the class stays
   evidence-honest.

---

## §3 — THE CLASSIFICATION (the deliverable's core)

**The four classes. Definitions are operational, not rhetorical:**

- **`ARCHIVE-READY`** — the subject feature **no longer exists in `src/**`**: the imported module/symbol
  is absent **or** the behaviour is unreachable. Evidence required: the grep that shows the absence.
- **`ORPHANED-PIN`** — the subject is **live**, but the **cited spec/doc no longer exists** (a dangling
  spec reference, or a file an archival pass moved). Repoint-or-archive candidates; the correct target is
  listed in §4.2.
- **`HOLD-UNTIL-IMPLEMENTED`** — a decision **supersedes/obsoletes** the subject but **the code still
  implements it**. **Archiving now would delete the only pin on live behaviour and would redden the
  suite.** The implementing unit is named; **archiving before it lands is forbidden** (§3.3).
- **`KEEP-LIVE`** — the subject is live and current; not a prune candidate.

### §3.0 — The counts

| Class | Files | Share |
| --- | ---: | ---: |
| **`ARCHIVE-READY`** | **0** | 0.0 % |
| **`ORPHANED-PIN`** | **26** | 11.6 % |
| **`HOLD-UNTIL-IMPLEMENTED`** | **44** | 19.6 % |
| **`KEEP-LIVE`** | **154** | 68.8 % |
| **total (must equal the inventory)** | **224** | 100 % |

**Class counts per family** (so the shrinkage in §5.2 is checkable):

| Family | `ARCHIVE-READY` | `ORPHANED-PIN` | `HOLD` | `KEEP-LIVE` | total |
| --- | ---: | ---: | ---: | ---: | ---: |
| A. store / traversal / retrieval | 0 | 0 | 12 | 22 | 34 |
| B. renderer panes / tabs / zones / shell | 0 | 5 | 13 | 69 | 87 |
| C. editing — rich-text / textarea | 0 | 0 | 18 | 3 | 21 |
| D. import / parse | 0 | 0 | 1 | 5 | 6 |
| E. MCP / security | 0 | 9 | 0 | 9 | 18 |
| F. gnosis / engine | 0 | 3 | 0 | 8 | 11 |
| H. embeddings / vector | 0 | 0 | 0 | 9 | 9 |
| I. the `blind-*` batteries | 0 | 6 | 0 | 1 | 7 |
| J. the `unit-*-greens` / blind batteries | 0 | 0 | 0 | 11 | 11 |
| K. adversarial suites | 0 | 0 | 0 | 9 | 9 |
| L. driver / contract / O-0 harness | 0 | 3 | 0 | 7 | 10 |
| M. misc | 0 | 0 | 0 | 1 | 1 |
| **total** | **0** | **26** | **44** | **154** | **224** |

### §3.1 — `ARCHIVE-READY`: **the empty set, with its evidence**

**There is no `ARCHIVE-READY` file.** The evidence is a *set* of probes, each stated as the absence it
would have to find:

| Probe | Command shape (symbol/module absence) | Result |
| --- | --- | --- |
| Module absence | resolve `../src/<p>.js` → `src/<p>.ts` for **every** named import in all 224 files | **0 unresolved modules** |
| Symbol absence | `grep` each bound symbol in its target module (value imports **and** `import type`) | **0 unresolved symbols** (one stale-comment false positive, §2.9) |
| Reachability loss — textarea (`ST-6`) | `grep -n 'textarea' src/main/traversal.ts` → `buildSubtree` authors `{ type: 'textarea', props: { id: \`textarea-${ragId}\` … } }`; `src/renderer/sidebar-panes.ts` `applyEditingMode` strips it **only** on the `contenteditable` branch; `src/main/operator-settings-store.ts` still stores `editingMode` | **reachable → `HOLD`** |
| Reachability loss — pane-visibility dropdown (`C13`) | `grep -n 'enabledPanes\|applyPersistedPaneVisibility\|operator-enabled-panes' src/` → `src/renderer/sidebar-panes.ts` (boot apply, persist write-through, census node) + `src/main/operator-settings-store.ts` + `src/main/app-menu.ts` catalog | **reachable → `HOLD`** |
| Reachability loss — per-node editing (`WHOLE-PAGE-EDITING`) | `src/renderer/rich-eligibility.ts` `isRichEditableRoot`/`EDITABLE_TYPES` called by `applyEditingMode` per root | **reachable → `HOLD`** |
| Reachability loss — local store as authority (`GN-1`) | `createJsonRagStore` still constructed by `src/main/rag-store-runtime.ts` + `rag-store-default.ts`; **78 test files** construct it directly | **reachable → `HOLD`** |
| The catalog-generator park | `ls scripts/catalog-derive.mjs` → **No such file**; `ls tests/requirement-catalog-contract.test.ts` → **No such file**; `docs/pending.md` row `U-CATALOG-GENERATOR` = park | **absent — and there is no test to archive** |

**Read this as the honest finding it is:** the pruning the product owner asked for is a **follow-on**
activity, not a present-day one. **Do not pad this set.** An `ARCHIVE-READY` row invented today would
either redden the suite (the module still resolves and still runs) or delete a live pin, and either is a
review finding against the pass that made it.

### §3.2 — `ORPHANED-PIN`: **26 files** (repoint-or-archive candidates)

Every row: the file (subject **live**, verified in §2) → the **dangling citation(s)** → the **correct
target** → the move verdict. `archive/parent-project/` targets are **`[archive]`** (gitignored, per
`archive/README.md` — *"the path vocabulary … does NOT make `archive/**` a citable address"*), so a
repoint to an archive path must carry the `(historical; archived 2026-08-26; successor …)` marker
`archive/README.md` prescribes, or point at the live tracker/owning-spec instead.

#### §3.2.1 The `archive/parent-project/` imports — the pre-existing 2026-08-26 sweep (21 files)

These citations point at paths under `docs/specs/` that were moved to `archive/parent-project/` by an
**earlier** pass. **The move was never repointed through the test suite** — this is the single largest
citation-debt block in the repo, and it is the reason these files read as orphaned.

| # | File | Dangling citation(s) | Correct target | Move verdict |
| ---: | --- | --- | --- | --- |
| 1 | `tests/blind-battery-hooks-handlers.test.ts` | `docs/specs/battery-hooks-greens.md`, `docs/specs/battery-hooks-unit.md`, `docs/specs/battery-handlers-greens.md`, `docs/specs/battery-handlers-unit.md` | `archive/parent-project/2026-08-26-battery-{hooks,handlers}-{greens,unit}.md` `[archive]`; live successor = `docs/specs/mcp-endpoint.md` (the battery's surviving contract) | **REPOINT** (subject is the live `blind-battery` hook/handler scenario set) |
| 2 | `tests/blind-battery-verify.test.ts` | `docs/specs/battery-units-greens.md` | `archive/parent-project/2026-08-26-battery-units-greens.md` `[archive]` | **REPOINT** |
| 3 | `tests/blind-ci-divergence.test.ts` | `docs/specs/ci-divergence-greens.md` | `archive/parent-project/2026-08-26-ci-divergence-greens.md` `[archive]` | **REPOINT** |
| 4 | `tests/blind-renderer-debug.test.ts` | `docs/specs/renderer-backend-greens.md`, `docs/specs/renderer-backend-hardening.md`, `docs/specs/debug-panel-greens.md`, `docs/specs/debug-panel.md` | `archive/parent-project/2026-08-26-{renderer-backend-greens,renderer-backend-hardening,debug-panel-greens,debug-panel}.md` `[archive]` | **REPOINT** |
| 5 | `tests/blind-runtime-host.test.ts` | `docs/specs/runtime-host-greens.md`, `docs/specs/runtime-host.md` | `archive/parent-project/2026-08-26-{runtime-host-greens,runtime-host}.md` `[archive]` | **REPOINT** |
| 6 | `tests/blind-security-gate.test.ts` | `docs/specs/mcp-security-greens.md`, `docs/specs/mcp-server-gate-greens.md`, `docs/specs/mcp-security.md`, `docs/specs/mcp-security-gate.md`, `docs/specs/mcp-server-wiring.md`, `docs/specs/mcp-server-gate.md` | `archive/parent-project/2026-08-26-{mcp-security-greens,mcp-security,mcp-security-gate,mcp-server-gate-greens,mcp-server-gate,mcp-server-wiring}.md` `[archive]`; **live successor = `docs/specs/unit-j-mcp-security-hardening.md`** + `docs/specs/mcp-endpoint.md` | **REPOINT** (prefer the live successor for the *contract* claim; archive paths for the scenario ids) |
| 7 | `tests/journal-reversibility.test.ts` | `docs/specs/journal-reversibility-battery.md` | `archive/parent-project/2026-08-26-journal-reversibility-battery.md` `[archive]` | **REPOINT** |
| 8 | `tests/path-fork-cycle.test.ts` | `docs/specs/e2e-test-battery.md` | `archive/parent-project/2026-08-26-e2e-test-battery.md` `[archive]` | **REPOINT** |
| 9 | `tests/runtime-battery.test.ts` | `docs/specs/e2e-test-battery.md` | same | **REPOINT** |
| 10 | `tests/renderer-backend.test.ts` | `docs/specs/renderer-backend-hardening.md` | `archive/parent-project/2026-08-26-renderer-backend-hardening.md` `[archive]` | **REPOINT** |
| 11 | `tests/runtime-host.test.ts` | `docs/specs/runtime-host.md` | `archive/parent-project/2026-08-26-runtime-host.md` `[archive]` | **REPOINT** |
| 12 | `tests/secure-panels.test.ts` | `docs/specs/secure-panels.md` | `archive/parent-project/2026-08-26-secure-panels.md` `[archive]`; live successor = `DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE` + `docs/specs/unit-h-sidebar-panes.md` | **REPOINT** |
| 13 | `tests/security-gate.test.ts` | `docs/specs/mcp-security-gate.md` | `archive/parent-project/2026-08-26-mcp-security-gate.md` `[archive]`; successor = `docs/specs/unit-j-mcp-security-hardening.md` | **REPOINT** |
| 14 | `tests/security.test.ts` | `docs/specs/mcp-security.md` | `archive/parent-project/2026-08-26-mcp-security.md` `[archive]`; successor = `docs/specs/unit-j-mcp-security-hardening.md` §5.2 + `docs/decisions.md` `RAG-EDIT-MCP-GROUPS` | **REPOINT** |
| 15 | `tests/mcp-server-gate.test.ts` | `docs/specs/mcp-server-gate.md` | `archive/parent-project/2026-08-26-mcp-server-gate.md` `[archive]` | **REPOINT** |
| 16 | `tests/mcp-server-wiring.test.ts` | `docs/specs/mcp-server-wiring.md` | `archive/parent-project/2026-08-26-mcp-server-wiring.md` `[archive]` | **REPOINT** |
| 17 | `tests/adapter-parity-battery.test.mjs` | `docs/specs/adapter-parity-battery.md` | `archive/parent-project/2026-08-26-adapter-parity-battery.md` `[archive]` | **REPOINT** |
| 18 | `tests/e2e-battery.test.mjs` | `docs/specs/e2e-test-battery.md` | same as #8 | **REPOINT** |
| 19 | `archive/tests/2026-10-04-blind-unit-gn-engine-integration-greens.test.ts` | `docs/integrations/astrographer-interface-implementation.md`, `docs/specs/engine-wire-contract.md` | **these are the Gnosis sibling repo's paths** — the files **exist** at `../Gnosis/docs/integrations/astrographer-interface-implementation.md` and `../Gnosis/docs/specs/engine-wire-contract.md` (verified) | **REPOINT to the `../Gnosis/`-prefixed form** (a citation-form fix, not an archive ground) |
| 20 | `archive/tests/2026-10-04-unit-gn-engine-integration.test.ts` | `docs/specs/engine-wire-contract.md` | `../Gnosis/docs/specs/engine-wire-contract.md` | **REPOINT** (citation form) |
| 21 | `archive/tests/2026-10-04-unit-a1-crud-routing-proxy.test.ts` · `archive/tests/2026-10-04-props-a1-crud-routing-proxy.test.ts` | `docs/specs/p1a-document-crud-wire.md` | `../Gnosis/docs/specs/p1a-document-crud-wire.md` | **REPOINT** (citation form) |

#### §3.2.2 The never-existed reference docs (5 files)

These named docs were **never committed to this tree** and are **not in `archive/`** — the tests'
*subjects* are nonetheless live and verified in §2.

| # | File | Dangling citation | Correct target | Move verdict |
| ---: | --- | --- | --- | --- |
| 22 | `tests/blind-loadbatch.test.ts` | `docs/specs/loadbatch-review.md`, `docs/specs/loadbatch-proposal.md` | `docs/specs/mcp-endpoint.md` (**the live contract**, which the file already cites for §4.1/§6.2) — the proposal/review pair was never committed here | **REPOINT, then HOLD** (the subject — `code.loadBatch` atomicity — is live) |
| 23 | `tests/journal-endpoint.test.ts` | `docs/specs/journal-endpoint-review.md` | `docs/specs/mcp-endpoint.md` §4 (the `journal`/`undo`/`redo` surface) + `docs/specs/unit-ujr1-get-journal.md` | **REPOINT, then HOLD** |
| 24 | `tests/mcp-notify.test.ts` | `docs/specs/live-notification-review.md` | `docs/specs/mcp-endpoint.md` (the notify leg) | **REPOINT** |
| 25 | `tests/mcp-resources.test.ts` | `docs/specs/mcp-resources-review.md` | `docs/specs/mcp-endpoint.md` | **REPOINT** |

> **The count, reconciled.** Row 21 of §3.2.1 covers **two files**
> (`archive/tests/2026-10-04-unit-a1-crud-routing-proxy.test.ts` **and** `archive/tests/2026-10-04-props-a1-crud-routing-proxy.test.ts`), so
> §3.2.1 is **21 numbered rows = 22 files** and §3.2.2 is **5 rows = 5 files**:
> **22 + 5 − 1 = 26 files**, where the subtraction is `archive/tests/2026-10-04-blind-unit-gn-engine-integration-greens.test.ts`
> (§3.2.1 row 19), which would otherwise also be a `docs/specs/` row. **Verified by re-counting the class
> membership, not by assertion** — the probe enumerated 26 distinct basenames before the tables were
> written, and the tables reproduce exactly those basenames. The two files excluded by inspection (§2.9)
> are **not** in the 26.

**Two files are excluded from `ORPHANED-PIN` by inspection** (reported in §2.9): `unit-o-0-report-contract.test.ts`
(`docs/specs/other.md` is illustrative test data) and `unit-ud3-import-path-id-scheme-adversarial.test.ts`
(`docs/2024/x.md` is illustrative test data).

**A defect-class note for the tracker.** This 26-file citation debt is the **test-side half** of
`docs/defects.md` `CATALOG-CITES-NONEXISTENT-UNIT-SPEC`'s class (a citation that does not resolve). Unlike
that row, these live in **`tests/**`, not `docs/**`, so they are outside that row's write set and outside
`docs/specs/obsolete-document-disposition-2026-09-21.md` §D.4's citation-impact audit (which swept
`docs/**`). **It needs a tracker row of its own** — see §7.

### §3.3 — `HOLD-UNTIL-IMPLEMENTED`: **44 files** — the do-not-archive set

> **THE RULE (binding): a file in this class must NOT be archived before its implementing unit lands.**
> Archiving it now deletes the only pin on behaviour that is **still live in `src/**`** (§2.3/§2.4) and
> reddens the suite at the moment of the move. The archive follows the removal **inside the same unit**,
> with the unit's red set **re-derived** (§6).

#### §3.3.1 The editing block — waits on **C9 `U-EDIT-1`** (the `WHOLE-PAGE-EDITING` unit) — **19 files**

**The unit:** `docs/specs/design-extensions-review.md` §3.3 C row **C9** — ids `ST-1` (non-live-markdown
half), `ST-3`, `ST-4`, `ST-5`, **`ST-6`**; *"the biggest unit — store + envelope + renderer"*;
**"spec re-derivation first"**; lands the `SUPERSEDED` rows against `EDITING-MODE-SETTING` +
`FORM-CONTROL-EDITING` **in its own landing pass**. Ordered at §6.2 item 11. Carries
`docs/defects.md` `EDIT-MODE-TEXTAREA-UI` (OPEN).

| # | File | What it pins that is still live |
| ---: | --- | --- |
| 1 | `tests/unit-l-textarea-editing-ui.test.ts` | the Unit L textarea UI: `buildSubtree`'s textarea child, `textareaInput`/`textareaBlur` bridge, `readOnly` from `isEditable` |
| 2 | `tests/contenteditable-editor-host.test.ts` | the 4 `rag-editor-*` handler defs + the host splice and caret restore |
| 3 | `tests/contenteditable-caret.test.ts` | the discriminated `CaretState` + `RichCaretEdge` in `src/renderer/edit-controller.ts` |
| 4 | `tests/editing-mode-broadcast-host.test.ts` | the `operator-settings-changed` re-derive + the button-toggle control |
| 5 | `tests/operator-settings-editing-mode.test.ts` | `editingMode` in `OperatorSettings` / the store's `sanitize`/`set`/`get` |
| 6 | `tests/rich-splice.test.ts` | `applyEditingMode(envelope, editingMode)` — the host post-assembly splice |
| 7 | `tests/rich-eligibility.test.ts` | `isRichEditableRoot` + the closed `EDITABLE_TYPES` set (23 `RagNodeType` members) |
| 8 | `tests/unit-u-edit-1-markdown-html-toggle.test.ts` | the app-graph editor-toolbar toggle (`editorToolbarContent`, `applyEditorToolbar`) |
| 9 | `tests/unit-u5-set-rich-text.test.ts` | the `setRichText` op + `deriveRichCommitBroadcast` |
| 10 | `tests/unit-u5-rich-commit-ipc.test.ts` | `IPC_EDIT_RICH_COMMIT` + `handleRichCommit` + the `edit.commitRich` bridge |
| 11 | `tests/unit-u2-rich-decompose.test.ts` | `decomposeRichHtml` (the in-house converter `ST-4` must name) |
| 12 | `tests/unit-m1-inline-offset-model.test.ts` | the inline offset model + full-projection producers |
| 13 | `tests/unit-o-edit-ops.test.ts` | `setProps`/`setSubtree`/`setType` (the 6→9 census) |
| 14 | `tests/unit-p-ipc-edit-batch.test.ts` | `IPC_EDIT_BATCH` + `handleEditBatch` + `deriveBatchBroadcast` |
| 15 | `tests/unit-n-batch-atomicity.test.ts` | `applyBatch` — **the commit primitive C9 uses** (`docs/specs/design-extensions-review.md` §3.3 C `C9` collision discipline: *"commit = one `applyBatch` = one invertible `batch` entry"*) |
| 16 | `archive/tests/2026-10-04-unit-u-edit-2-undo-redo-history.test.ts` | the project-journal IPC + undo/redo history |
| 17 | `tests/edit-controller.test.ts` | the Unit D editing controller (commit-on-blur, dirty-edit guard) |
| 18 | `tests/edit-ops.test.ts` | the Unit D write-back (`setContent`/`createNode`/`deleteNode`/`split_node`/`merge_node`/`setEdge`) |
| 19 | `tests/edit-adversarial.test.ts` | the same write-back's adversarial battery (H4/M1/M2/M3/L1-L4): it pins those per-node ops **and** the `rag-store-changed` broadcast *through* them, so it retires with the model they belong to |

> **EXECUTED 2026-09-21 (the archive-rebuild pass) — read the appended §9 before this table.** The product
> owner ruled this a **rebuild pass** (correcting drift + enforcing spec compliance, a **BREAKING** change)
> and ordered this `HOLD` class archived **now**, ahead of the implementing units, so the suites can be
> **rebuilt in their own gated passes**. **Status: all 19 ARCHIVED 2026-09-21** →
> `archive/tests/2026-09-21-<name>.test.ts`, with two of them **restored in-pass** because a protected
> file pinned them by name (`unit-u2-rich-decompose.test.ts`; see §9.3). The audit's own
> **do-not-archive-before-the-unit-lands** rule (§3.3 head) is **SUPERSEDED by the user ruling** recorded
> in `docs/decisions.md` `DECIDED: REBUILD-ARCHIVE-POLICY`, and the retired pins are **re-derived from
> the spec** in the owning unit's cycle (§9.4's rebuild map) — the archive is that re-derivation's input.
> The 19 files were **moved, never edited** (`md5sum`-verified byte-identical), so each archived file is
> available to its unit as a **rebuild input**, not a discard.

**Waits on:** **C9 `U-EDIT-1`** for all **19**. This block is the largest single retirement in the program:
the per-node editing model is exactly what `ST-1`/`ST-4` replace and `ST-6` removes, so each of the 19
files is a pin on a surface the unit deletes — **archiving any of them now deletes the only pin on live
code and reddens the suite.**

#### §3.3.2 The pane-visibility block — waits on **C11 `U-SEARCH`** (the `C13`-removal half) — **1 file**

| # | File | What it pins that is still live |
| ---: | --- | --- |
| 1 | `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` | View → Panes catalog, `IPC_PANE_VISIBILITY`, `applyPersistedPaneVisibility`, `persistEnabledPanes`, the `#operator-enabled-panes` census, the first-run default `FIRST_RUN_APP_DEFAULT = {search, doc-nav}` |

> **EXECUTED 2026-09-21 → `ARCHIVED 2026-09-21 → archive/tests/2026-09-21-unit-u-shell-8-view-menu-pane-visibility.test.ts`.**
> **Consequence recorded, not hidden:** this is the file `docs/decisions.md`
> `DECIDED: FIRST-RUN-ENABLED-DEFAULT` names as its pin, so that row's *"Pinned by …"* pointer is now
> **stale-until-rebuilt** — the owner of the re-derived pin is **C11 `U-SEARCH`** (§9.4), and restoring
> the decision row's pointer belongs to that unit's landing pass. See §9.3 (no exclusion applied).

**Waits on:** **C11 `U-SEARCH`** — whose `PN-1` visibility half is subordinated to
`DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` (`docs/specs/design-extensions-review.md` §3.6 F
item 8 / §6.2 item 13). **That decision explicitly does not implement the removal.** Archiving this file
first deletes the only pin on a live, persisted, MCP-visible surface —
`DECIDED: FIRST-RUN-ENABLED-DEFAULT` is pinned **by this very file** (`docs/decisions.md`, *"Pinned by the
re-derived `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts`"*), so archiving it would also orphan a
**live ACTIVE decision row's** pin.

#### §3.3.3 The local-authority block — waits on **P2 `U-AUTHORITY-SWITCH`** (`O-8`) — **17 files**

**The unit:** `docs/specs/design-extensions-review.md` §13.1 **P2** (`U-AUTHORITY-SWITCH` — *"the
O-8 authority-switch / offline dual-path — the track's stated PREREQUISITE"*), §13.2 **S1** (the sunset
condition), §13.2 **S4** (*"the prerequisites are gates, not tails"*), §14.2 (the re-derivation set is
**"explicitly scoped, not deleted"** and *"`U-AUTHORITY-SWITCH`'s spec names the re-derivation set by
file"*). **S1 forbids any pass from stating the contract as if the cutover had already happened.**

| # | File | What it pins that is still live |
| ---: | --- | --- |
| 1 | `tests/rag-store.test.ts` | `createJsonRagStore` persistence + load/hash-verify (the local file shape) |
| 2 | `tests/rag-store-adversarial.test.ts` | the same store's adversarial regression |
| 3 | `tests/unit-ms1-store-registry.test.ts` | `loadRagStoreRegistry`/`resolveRegistry`/`implicitRegistry` (the registry survives; the per-store **lock point** does not) |
| 4 | `tests/unit-ms2-store-wiring.test.ts` | `buildRagStoreDirectory`'s N distinct `createJsonRagStore` instances, each with its own closure queue |
| 5 | `tests/unit-ms3-store-qualified-broadcast.test.ts` | the `store`-qualified broadcast + the host's foreign-store drop |
| 6 | `tests/unit-ms4-id-prefixing.test.ts` | the `<name>:` prefix mint at the **host** import seam + the A1 rejection |
| 7 | `tests/unit-ms4-id-prefixing-adversarial.test.ts` | the same seam's adversarial battery |
| 8 | `tests/unit-h1-registry-write.test.ts` | the host registry file write seam |
| 9 | `tests/unit-h2-runtime-controller.test.ts` | `createRagStoreRuntimeController` rebuilding `createJsonRagStore` instances |
| 10 | `tests/unit-h4-hot-remove.test.ts` | drain-then-teardown of a host store (`drainAndReleaseEntry`) |
| 11 | `tests/unit-h5-teardown.test.ts` | teardown of the host store + vector boot + engine |
| 12 | `tests/unit-h6-hot-rename.test.ts` | hot rename of a host store entry |
| 13 | `tests/unit-h7-default-reassign.test.ts` | default-store reassignment + the vector-boot rebind |
| 14 | `tests/unit-ud1-document-metadata-fields.test.ts` | document metadata on the **host** store (`documentPath`/`tags`) |
| 15 | `tests/unit-ud1-document-metadata-fields-adversarial.test.ts` | the same, adversarially |
| 16 | `tests/unit-ud3-import-path-id-scheme.test.ts` | the path-qualified id mint + per-store `corpusRoot` resolution |
| 17 | `tests/unit-ud3-import-path-id-scheme-adversarial.test.ts` | the same, adversarially |

**Waits on:** **P2 `U-AUTHORITY-SWITCH` (`O-8`)** for all **17**. **`unit-h8-operator-editor.test.ts` and
`unit-u-import-1-import-surface.test.ts` are NOT in this block** — `docs/specs/obsolete-document-disposition-2026-09-21.md`
§D.1b.2/§D.1b.1 rule the **operator/manage and import-UI surfaces host-owned and untouched**; they stay
**KEEP-LIVE**.

> **EXECUTED 2026-09-21: all 17 ARCHIVED 2026-09-21 → `archive/tests/2026-09-21-<name>.test.ts`**
> (under the same user ruling as §3.3.1; the `P2 U-AUTHORITY-SWITCH` unit owns their re-derivation —
> §9.4). The `unit-h8`/`unit-u-import-1` KEEP-LIVE note above still holds: **neither moved.**

#### §3.3.4 The read-path block — waits on **P2 `U-READS-PIVOT`** — **7 files**

**The unit:** `docs/specs/design-extensions-review.md` §13.1 **P2** `U-READS-PIVOT` (*"this ruling's read
model, §12"*), §14.1 **C-2** (*"with no resident cache entry there is no render"*).

| # | File | What it pins that is still live |
| ---: | --- | --- |
| 1 | `tests/unit-ud2-journal-invertibility.test.ts` | journal invertibility over the **host** store's writes |
| 2 | `tests/unit-ud4-doc-heads-tree.test.ts` | the `rag-doc-heads` payload read over the host store's doc-head edges |
| 3 | `tests/unit-ud5-list-documents-tool.test.ts` | `rag.list_documents` reading the host store's doc-heads |
| 4 | `tests/unit-ud6-query-document-filters.test.ts` | the local-only document filters over the host store |
| 5 | `tests/unit-ud7-set-doc-meta-op.test.ts` | `setDocMeta` writing the host store |
| 6 | `tests/unit-ujr1-get-journal.test.ts` | `RuntimeBackend` journal over the host store |
| 7 | `tests/unit-import-batch-persist-contract.test.ts` | the host persist census + the depth-10 000 totality rows (**a 15 000 ms-budget tenant**, §5.3) |

**Waits on:** **P2 `U-READS-PIVOT`** for all **7**.

> **EXECUTED 2026-09-21: 6 of 7 ARCHIVED 2026-09-21 → `archive/tests/2026-09-21-<name>.test.ts`; row 7
> EXCLUDED AND KEPT IN PLACE.** `tests/unit-import-batch-persist-contract.test.ts` is named on the
> executing pass's **absolute-exclusion** list, and the exclusion is **substantiated**, not arbitrary:
> `tests/unit-v5-migration-contract.test.ts` (§5.3's budget tenant, itself protected) pins it **by path
> and by name** — `join(TESTS_DIR, 'unit-import-batch-persist-contract.test.ts')` (Pin 4, §3.2 of that
> file's header) and, in the §2a C-4 note, *"§2a of `docs/specs/unit-import-batch-persist.md` … is pinned
> at `tests/unit-import-batch-persist-contract.test.ts` — never re-timed here"*. Moving it would redden a
> protected file. It therefore stays a **live pin** and its re-derivation obligation stays **with the
> file**, not with `U-READS-PIVOT`. See §9.3.

#### §3.3.5 The engine-absent / `GN-4` note — **0 files, and that is the finding**

**No test pins the reversed identity clause.** The probe for *"with no engine, every local path works
IDENTICALLY"* assertions returned **none** — the `no engine` matches in the suite are the **seam**
messages (`"<tool>: no engine crud rag store configured"`, `"gnosis.query: no engine rag store
configured"`), i.e. the clause that **SURVIVES** (`DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`'s
*"typed unavailable, never silent"* / *"the launcher must fail loud"*). Consequence: **there is no
`GN-4`-grounded archive candidate**, and the suite is *already* clean of the reversed pin. Worth a
tracker note, because a later pass looking for that file will not find it.

**44 = 19 (C9 `U-EDIT-1`) + 1 (C11 `U-SEARCH`) + 17 (P2 `U-AUTHORITY-SWITCH`) + 7 (P2 `U-READS-PIVOT`).**
Verified **two ways**: against §3.0's class table, and mechanically from the §1 inventory's class column —
every one of the 44 `HOLD-UNTIL-IMPLEMENTED` rows appears in exactly one of the four blocks above, and the
four blocks list no file that is not `HOLD`. **Reconciliation after the correction: the editing block is 19,
not 18** — the earlier draft of this section mis-stated `tests/edit-adversarial.test.ts` as KEEP-LIVE while
the inventory classified it `HOLD`; the file is a pin on the per-node write-back, so **`HOLD` is the correct
class** and this section now lists it (row 19).

### §3.4 — `KEEP-LIVE`: the remaining **154 files**

Not enumerated again here — §1's table names every one. The notable *groups* that a naive prune might
have swept and that this audit rules **KEEP-LIVE** with a named reason:

| Group | Files | Why it must stay |
| --- | ---: | --- |
| **The two FENCE files** (`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`) | 2 | `docs/specs/design-extensions-review.md` §14.2: *"**Pinned: the fence stays GREEN UNCHANGED in P2**"* — a change to either *"is not an implementation of the ruling — it is a new proposal re-entering this gate"*. **Archiving either is a gate violation, not a prune.** |
| **The F-family (gnosis / engine) destination** (`unit-a1-*`, `unit-a2-*`, `unit-gn-*`, `props-a1/a2`, `engine-crud-real-transport`, `unit-shell-integration`) | 11 | `docs/specs/obsolete-document-disposition-2026-09-21.md` §D.1b.3: **"no contradiction — the opposite"** — these are the **engine-CRUD client the ruling makes authoritative**. Archiving them deletes the pins on the destination. |
| **The O-0 harness** (`unit-o-0-*`, `unit-o0-m1-m3-*`) | 7 | §13.3: the oracle-identity pair is protected; the O-0 artifact is the **accepted `OPEN-structural` gate input** `DECIDED: O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`. |
| **The `unit-*-greens` blind batteries** | 11 | they are the **RCA-4 blind-run artifacts** — an independent verification layer the doc-side `*-greens.md` archival (already executed) did **not** cover. Retiring them is the **catalog-generator / doc-review** lane's decision, not the feature-obsoletion lane's. |
| **The adversarial suites** | 9 | each pins a **fixed host defect** (`docs/decisions.md` `PANE-DRAG-HEADER-ONLY`, `PLACEMENT-ONLY-PAYLOAD-ROOT`, `EDIT-MODE-TEXTAREA-UI`, …); `docs/specs/design-extensions-review.md` §3.3 C `C4` notes pins that move do so as **that unit's own re-derivation**. |
| **The shell/O-9/O-10 pin set** (`unit-u-shell-*`, `props-*`) | 30+ | O-9/O-10 have **not** landed; C4/C5/C7 explicitly **amend** rather than delete their pin sets (§6.2 items 5–9). |
| **The module / extension lane** (`module-*`, `unit-u-parity-*`) | 15 | untouched by every 2026-09-21 ruling. |

**The one KEEP-LIVE *cluster* worth flagging for a LATER pass (not this one):** the **stale red-set
headers**. **85 files** still carry a header asserting *"This is the TestWriter RED set … the change does
NOT exist yet"* while the change has landed and the file is green (probe: files matching
`TestWriter RED set|This is the TestWriter|RED SET (RCA-1)|do NOT exist yet|INTENTIONAL TYPE-LEVEL RED|staged red`).
That is a **documentation-drift** finding of exactly the class AGENTS.md item 10d exists to catch
(§2.9 item 1 is the worked example, where the *comment* is wrong inside a green file). **It is not an
archive ground** — it is a `file-header` repoint batch for a future doc-review pass, and it is the
**largest** remaining hygiene item in `tests/**`.

---

## §4 — THE ARCHIVE LIST (what would move, where, with what evidence)

### §4.1 — The `ARCHIVE-READY` list: **EMPTY**

**No move is proposed in this class.** There is no destination path to allocate, no topic to add, no
citation to repoint — because there is no file whose subject feature is gone (§3.1). **Stated again,
because this is the deliverable's headline: the `ARCHIVE-READY` set is empty, and no row was padded to
make it non-empty.**

### §4.2 — The `ORPHANED-PIN` list: **26 files, `REPOINT-FIRST`**

**The destination convention** (per `archive/README.md`'s topic vocabulary and AGENTS.md item 6).
`archive/README.md` documents the topics `reviews/`, `pending/`, `parent-project/`, `live-batch/`,
`live-testing-findings/`, `inline-order/`, `catalog-authoring/`, `unit-k-resolution/`, `greens/`,
`gate-reviews/`, `findings/`, `notes/`. **A test-archive topic does not exist.** This audit therefore
proposes:

> **`archive/tests/` — a NEW topic, to be added to `archive/README.md`'s topic table** (status:
> **NEW 2026-09-21**, *"superseded test files retired by the test-pruning disposition pass"*), with the
> naming convention **`archive/tests/2026-09-21-<name>.test.ts`** (the `.test.ts` suffix is kept so the
> file's kind is self-evident; the `2026-09-21` prefix follows the convention's `<date>-<name>` rule).
> **`archive/README.md` DOES need the new topic row**, and `archive/tests` must **not** be created before
> the first executed move (README: *"A topic dir is created only by an executed archive"*).

**None of the 26 is `ARCHIVE-READY`** — their subjects are live (§2). So the **`REPOINT` leg is the
actionable half**, and the **`ARCHIVE` leg is deferred** to the same rule that governs `HOLD`: a citation
fix does not make a live test archivable.

| # | File | Proposed destination if it is later archived | Topic | Shared helper / fixture risk | Citations to repoint (the live work) |
| ---: | --- | --- | --- | --- | --- |
| 1 | `tests/blind-battery-hooks-handlers.test.ts` | `archive/tests/2026-09-21-blind-battery-hooks-handlers.test.ts` | `tests/` (**NEW**) | **SHARED — BLOCKED.** Shares `tests/fixtures/hooks-scenarios-data.mjs` + `handlers-scenarios-data.mjs` with the **KEEP-LIVE** `tests/gemma4-blind-battery.test.ts`. **The fixtures must NOT be archived**; the file could only move if the fixtures stayed, which they can (they are not this file's private fixture). | §3.2.1 row 1 (4 paths) |
| 2 | `tests/blind-battery-verify.test.ts` | `archive/tests/2026-09-21-blind-battery-verify.test.ts` | `tests/` | none (imports only `src/` + `dom-shim`) | §3.2.1 row 2 |
| 3 | `tests/blind-ci-divergence.test.ts` | `archive/tests/2026-09-21-blind-ci-divergence.test.ts` | `tests/` | none | §3.2.1 row 3 |
| 4 | `tests/blind-loadbatch.test.ts` | `archive/tests/2026-09-21-blind-loadbatch.test.ts` | `tests/` | none | §3.2.2 row 22 — **the 2 dangling paths must be replaced by `docs/specs/mcp-endpoint.md` FIRST** |
| 5 | `tests/blind-renderer-debug.test.ts` | `archive/tests/2026-09-21-blind-renderer-debug.test.ts` | `tests/` | none | §3.2.1 row 4 (4 paths) |
| 6 | `tests/blind-runtime-host.test.ts` | `archive/tests/2026-09-21-blind-runtime-host.test.ts` | `tests/` | none | §3.2.1 row 5 (2 paths) |
| 7 | `tests/blind-security-gate.test.ts` | `archive/tests/2026-09-21-blind-security-gate.test.ts` | `tests/` | none | §3.2.1 row 6 (6 paths) |
| 8 | `archive/tests/2026-10-04-blind-unit-gn-engine-integration-greens.test.ts` | `archive/tests/2026-09-21-blind-unit-gn-engine-integration-greens.test.ts` | `tests/` | none | §3.2.1 row 19 (citation **form** fix to `../Gnosis/…`) |
| 9 | `tests/journal-endpoint.test.ts` | `archive/tests/2026-09-21-journal-endpoint.test.ts` | `tests/` | none | §3.2.2 row 23 |
| 10 | `tests/journal-reversibility.test.ts` | `archive/tests/2026-09-21-journal-reversibility.test.ts` | `tests/` | none | §3.2.1 row 7 |
| 11 | `tests/mcp-notify.test.ts` | `archive/tests/2026-09-21-mcp-notify.test.ts` | `tests/` | none | §3.2.2 row 24 |
| 12 | `tests/mcp-resources.test.ts` | `archive/tests/2026-09-21-mcp-resources.test.ts` | `tests/` | none | §3.2.2 row 25 |
| 13 | `tests/mcp-server-gate.test.ts` | `archive/tests/2026-09-21-mcp-server-gate.test.ts` | `tests/` | none | §3.2.1 row 15 |
| 14 | `tests/mcp-server-wiring.test.ts` | `archive/tests/2026-09-21-mcp-server-wiring.test.ts` | `tests/` | none | §3.2.1 row 16 |
| 15 | `tests/path-fork-cycle.test.ts` | `archive/tests/2026-09-21-path-fork-cycle.test.ts` | `tests/` | none | §3.2.1 row 8 |
| 16 | `archive/tests/2026-10-04-props-a1-crud-routing-proxy.test.ts` | `archive/tests/2026-09-21-props-a1-crud-routing-proxy.test.ts` | `tests/` | none | §3.2.1 row 21 (citation **form** fix to `../Gnosis/…`) |
| 17 | `tests/renderer-backend.test.ts` | `archive/tests/2026-09-21-renderer-backend.test.ts` | `tests/` | none | §3.2.1 row 10 |
| 18 | `tests/runtime-battery.test.ts` | `archive/tests/2026-09-21-runtime-battery.test.ts` | `tests/` | none | §3.2.1 row 9 |
| 19 | `tests/runtime-host.test.ts` | `archive/tests/2026-09-21-runtime-host.test.ts` | `tests/` | none | §3.2.1 row 11 |
| 20 | `tests/secure-panels.test.ts` | `archive/tests/2026-09-21-secure-panels.test.ts` | `tests/` | none | §3.2.1 row 12 |
| 21 | `tests/security-gate.test.ts` | `archive/tests/2026-09-21-security-gate.test.ts` | `tests/` | none | §3.2.1 row 13 |
| 22 | `tests/security.test.ts` | `archive/tests/2026-09-21-security.test.ts` | `tests/` | none | §3.2.1 row 14 |
| 23 | `archive/tests/2026-10-04-unit-a1-crud-routing-proxy.test.ts` | `archive/tests/2026-09-21-unit-a1-crud-routing-proxy.test.ts` | `tests/` | none | §3.2.1 row 21 (citation **form** fix) |
| 24 | `archive/tests/2026-10-04-unit-gn-engine-integration.test.ts` | `archive/tests/2026-09-21-unit-gn-engine-integration.test.ts` | `tests/` | none | §3.2.1 row 20 (citation **form** fix) |
| 25 | `tests/adapter-parity-battery.test.mjs` | `archive/tests/2026-09-21-adapter-parity-battery.test.mjs` | `tests/` | none | §3.2.1 row 17 |
| 26 | `tests/e2e-battery.test.mjs` | `archive/tests/2026-09-21-e2e-battery.test.mjs` | `tests/` | **SHARED — BLOCKED.** Shares `hooks-scenarios-data.mjs` + `handlers-scenarios-data.mjs` with the **KEEP-LIVE** `gemma4-blind-battery.test.ts`. Fixtures **must stay**. **Also:** this file is the `npm run battery` leg's entry — retiring it retires the leg, which is a **build-script change**, not a test move. | §3.2.1 row 18 |

**Three of the 26 are NOT archivable even on the citation leg, and must be said plainly:**

- **#1 and #26 are fixture-sharers** (`hooks-scenarios-data.mjs` / `handlers-scenarios-data.mjs` are also
  read by the **KEEP-LIVE** `tests/gemma4-blind-battery.test.ts`). **Rule: a shared fixture is never
  archived.** The files *could* still move (the fixtures stay), but a pass that moves the fixture with
  them — the natural mistake — reddens a kept test. **Flagged as the audit's #1 shared-helper risk.**
- **#26 also owns the `npm run battery` leg.** `package.json` `battery` = `npm run build && node
  tests/e2e-battery.test.mjs`. Retiring the file without editing `package.json` leaves a **broken
  script** — outside the test-archive scope entirely.

**The remaining 23 have no fixture risk at all** — every one imports only `src/**` modules and (for those
that need a DOM) `src/shared/dom-shim.ts`, which is a **live `src/` module imported by 88 test files and
is never archivable**.

### §4.3 — What this archive list does NOT authorize

- It does **not** authorize moving any of the 26 while its **subject is live** — because `ORPHANED-PIN`'s
  subject is live by definition, and the archive leg for every one of them is governed by the `HOLD` rule.
- It does **not** authorize touching the **44** `HOLD` files (§3.3).
- It does **not** authorize touching either **fence** file (§14.2).
- It does **not** authorize creating `archive/tests/` before the first executed move, or adding the
  `tests/` topic row to `archive/README.md` before then (the README's own rule).
- It does **not** authorize a `docs/**` edit to make a citation resolve — the 26 citations live in
  **`tests/**`**, which is exactly why they escaped the doc-side §D.4 citation audit.

---

## §5 — THE TRIO-IMPACT ANALYSIS

### §5.1 — The trio as it reads TODAY (this pass's own recording — RCA-1's "run it, don't plan it")

| Leg | Command | Reading |
| --- | --- | --- |
| suite | `npm test` (`vitest run`) | **`Test Files 221 passed (221)` · `Tests 4988 passed \| 58 skipped (5046)` · `Duration 14.17s`** |
| typecheck | `npm run typecheck` (`tsc --noEmit -p tsconfig.json`) | **exit 0** |
| build | `npm run build` | **exit 0** (main cjs + preload cjs + standalone mjs + battery-host mjs + renderer esm + index.html) |

**Note the reconciliation:** `npm test` reads **221** files although `tests/` holds **224** test files —
the **3 `.test.mjs`** files are **outside `vitest.config.ts`'s `include: ['tests/**/*.test.ts']`**. That is
not a discrepancy; it is the config. It also means the suite's **4988 + 58 = 5046** rows are the
**`.test.ts` rows only**.

### §5.2 — What `npm test` would read AFTER the proposed moves

**Because the `ARCHIVE-READY` set is empty, the only executable move today is the `ORPHANED-PIN` set's
*repoint* leg — a citation fix that moves no file and changes no test count.** So:

| Scenario | Files `npm test` reads | Rows | Which families shrink |
| --- | ---: | ---: | --- |
| **today (measured)** | **221** | **4 988 passed / 58 skipped / 0 failed** | — |
| **after the 26 citation repoints** | **221 (UNCHANGED)** | **4 988 / 58 / 0 (UNCHANGED)** — repointing a `//` header changes no test | none |
| **after moving all 26 test files** (NOT recommended — see §4.2's blockers) | **221 − 24 = 197** (−26 files, but 2 are `.test.mjs` and were never in the 221) | the 26 files' rows leave; **the exact row count must be RE-DERIVED by running the suite, never predicted** | **I** (−6 of 7), **E** (−9 of 18), **B** (−5 of 87), **F** (−3 of 11), **L** (−3 of 10) |
| **after the C9 unit lands and its 19 editing files retire** | **197 − 18 = 179** (if the 26 also moved) / **221 − 18 = 203** (if they did not) | re-derived; the C9 unit's own green run supplies the red set | **C** (−19 of 21 — the family all but disappears) |
| **after C11's C13-removal half lands** | −1 more | re-derived | **G/B** (−1) |

**The rule this table exists to enforce: the row count is a READING, never a prediction.**
`docs/specs/design-extensions-review.md` §14.3's census rule binds this pass too — *"a figure in this
table is a reading with a named source"*.

### §5.3 — The 15 000 ms budget — **NOT affected by any move in this audit, with one hazard named**

`vitest.config.ts` commits `testTimeout: 15_000`, sized for *"the two 10k-deep totality rows"*: *"measured
3.1-3.4 s in isolation and 5.4-5.8 s under full-suite load against vitest 5's 5 000 ms default."*

- **The tenants of that budget are the two depth-10 000 rows inside
  `tests/unit-v5-migration-contract.test.ts`** — this pass measured them at **`5 616 ms`** and
  **`6 221 ms` under full-suite load** (the run's own per-row output; the file's total is `11 937 ms`
  because those two rows dominate it). The taller row is **~41 % of the `15 000 ms` per-test budget**,
  i.e. a margin of **~8.8 s** — the config's claim of a margin above *"the worst measured load case"*
  holds, and it is the committed budget, not headroom to spend.
- **That file is `KEEP-LIVE`** (§3.4, the fence-adjacent contract suite). **No proposed move touches it.**
- **The hazard is the opposite of a prune:** removing files **shortens** the suite, which *reduces*
  load-time contention and therefore **lowers** those two rows' wall time. **A prune cannot push the depth
  rows over the budget.** What *would* is **adding another depth-10 000 totality row** (the C9/C10 units
  write new commit-path tests). **Rule for those units: any new 10k-depth row must be measured against the
  committed budget and the measurement recorded, not assumed.**
- **`tests/import-render-no-duplicates.test.ts`** is the second fence file and is likewise **KEEP-LIVE**.

### §5.4 — `-greens` / blind-battery ordering — **NOT affected**

- The 11 `blind-unit-*-greens.test.ts` files are **ordinary suite members** with no special ordering
  contract; vitest runs files in parallel workers with no documented inter-file dependency, and none of the
  26 proposed movers appears in another file's setup (`beforeEach`/`beforeAll` fixtures are per-file; the
  only cross-file inputs are the **shared fixtures**, §2.7).
- **One opt-in gate exists and must be respected:** `tests/blind-unit-shell-integration-greens.test.ts`
  uses `describe.skipIf(!ENGINE_REACHABLE)` for *"§5.5 e2e transport over a live loopback engine (opt-in +
  gated; `GNOSIS_ENGINE_TEST=1`)"* — that is the **only** environment-gated block in the movers' vicinity,
  and the file is **KEEP-LIVE** (§3.4's F-family).
- **The gated blocks' skip counts are stable and must be re-read after any move:** 58 skips today, mostly
  `describe.skip('renderer-dependent (verified by code review … not node-testable)')` blocks in
  `mcp-security-hardening`, `sidebar-panes{,-host}`, `template`, `contenteditable-editor-host`,
  `unit-l-textarea-editing-ui`, `unit-ms5-settings-listing`, `blind-battery-verify`,
  `blind-unit-shell-integration-greens`. **A move must not silently convert a run-to-skip or a skip-to-run
  — the 58 must be re-read, not assumed.**
- **The `npm run battery` leg is a FOURTH leg** (`tests/e2e-battery.test.mjs` via `src/main/battery-host.ts`,
  `dist/main/battery-host.mjs`): it is **not** part of `npm test` and **is** on the `ORPHANED-PIN` list
  (#26). Retiring it is a **build-script** change.

### §5.5 — THE VERIFICATION RULE (mandatory, binding on the executing pass)

> **A test move may NOT be reported from a plan.** The move must be executed and then the **full trio**
> re-run, with the reading recorded in the move's DONE row:
>
> ```
> npm test           # the reading: file count / passed / skipped / failed
> npm run typecheck  # tsc --noEmit
> npm run build      # the three esbuild bundles
> ```
>
> and additionally — because two of the movers are `.test.mjs` — **`npm run battery`** when any
> `.test.mjs` file or `tests/fixtures/**` changes. The reading is recorded as a **reading with a named
> source**, never as a claim (`docs/specs/design-extensions-review.md` §14.3).
> **The last recorded reading before this pass was `221 files / 4 988 passed / 58 skipped / 0 failed`**
> (§14.2/§14.3, `docs/HANDOFF.md`/`docs/next-steps.md`); **this pass re-measured it and it is
> unchanged** — i.e. the tree is at the same point the gate record left it, which is why the
> `ARCHIVE-READY` set is empty.

---

## §6 — THE ORDER-OF-OPERATIONS RULE FOR THIS WHOLE PROGRAM

### §6.1 — The rule, stated plainly (this is the audit's normative output)

> **1. A decision-level obsolescence recorded in this session does NOT obsolete any test by itself.**
> The 2026-09-21 decisions — `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (`GN-1`),
> `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` (`GN-4`), `ST-6`'s textarea removal, and the
> catalog-generator park — are **contract-level**. `docs/specs/design-extensions-review.md` §13.2 **S1**
> makes it explicit: *"The contract says engine-authoritative while the code still writes locally; that
> gap is RECORDED … never hidden."* **A supersession is a destination, not a removal.**
>
> **2. THE CODE CHANGE COMES FIRST. The test archive follows the removal IN THE SAME UNIT, with the red
> set re-derived.** §13.3: *"one unit = one spec, one red run, one green, one adversarial pass, one doc
> review, one DONE row"*; §6.2 item (b): the `SUPERSEDED` rows for `EDITING-MODE-SETTING` /
> `FORM-CONTROL-EDITING` are written **at C9's landing, not before** — *"writing them earlier would
> supersede a live model with an unimplemented one."*
>
> **3. A test may be archived OUTSIDE a unit's cycle only when its subject is ALREADY GONE from the
> code** — module absent, symbol absent, or the calling branch unreachable. `docs/specs/design-extensions-review.md`
> §14.2 states the re-derivation set's discipline in the same terms: *"Explicitly scoped, not deleted"*,
> and *"a unit that finds itself rewriting fence-shaped assertions must stop and re-enter this gate."*
>
> **4. `ARCHIVE` is not the first move for an orphaned citation — `REPOINT` is.** Every one of the 26
> has a live subject, so the citation fix is the only authorised work today (§4.2).
>
> **5. No move without the trio reading recorded (§5.5), no move across a contract regime
> (§13.2 `S2`), and no move that touches the fence pair or the O-0 oracle pair (§13.3).**

### §6.2 — The order in which the `HOLD` class FREES UP (and what it frees)

| Order | The unit that lands | The `HOLD` files it frees | Freed by which change in the unit |
| --- | --- | --- | --- |
| **1** | **C9 `U-EDIT-1`** (`WHOLE-PAGE-EDITING`: `ST-1` non-live-markdown half, `ST-3`, `ST-4`, `ST-5`, **`ST-6`**) | **19 files** (§3.3.1) | the single whole-document editing block replaces the per-node model: `ST-6` removes the textarea authoring from `buildSubtree` + the `editingMode` setting + the toolbar toggle; `ST-1`/`ST-4` replace the per-node `contenteditable` hosts with the one editable surface and the diff-commit. **It also closes `docs/defects.md` `EDIT-MODE-TEXTAREA-UI`.** |
| **2** | **C11 `U-SEARCH`** (`SR-1`, `SR-2`, `SR-4`, `SR-5` + the `PN-1` visibility half) | **1 file** (§3.3.2) | the `C13`-removal half deletes the pane-visibility dropdown: `app-menu.ts`'s catalog, `IPC_PANE_VISIBILITY`, `applyPersistedPaneVisibility`/`persistEnabledPanes`, the census node |
| **3** | **P2 `U-AUTHORITY-SWITCH` (`O-8`)** — a **PREREQUISITE, not a tail** (§13.2 `S4`) | **17 files** (§3.3.3) | the authority cutover: the local store stops being the persistence authority, the engine becomes the document-CRUD authority, and per §13.2 **S1** *"the local store's authority ends … from that point any surviving local document write is a fence violation"* |
| **4** | **P2 `U-READS-PIVOT`** (the §12 tab-scoped read cache; lands **with** the §14.2 fence plan) | **7 files** (§3.3.4) | resident-cache reads behind the engine fetch; the miss policy; the eviction/dirty-tab machine |
| **5** | **P2 `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION`** | **(none directly — a PRE-REQUISITE pair)** | without them the corpus is lost at restart (§14.1 **C-1**), so **no cutover-driven archive may precede them**. `O0_OPERATOR_DOCUMENTS = 226` must not be re-seeded (§3.6 F.3 item 9) |

**Two hard ordering facts a later pass must not lose:**
(a) **C10 `U-TAB-MERGE` is STRICTLY AFTER C9** (`TAB-2`'s conflict predicate is spec-first) — so no
`TAB-*` test retires before C9's green; (b) **C13/C14 are parked and are never sequenced behind a trigger
they do not have** (§6.2 item 15) — the `FL-1`/`FL-2`/`TB-4`/`SR-3`/live-markdown halves produce **no**
archive candidate.

### §6.3 — What the executing pass must do, in order, per unit

1. **The unit's own cycle** — spec re-derivation → **TestWriter red run, reported** → Implementer green →
   RCA-3 adversarial → RCA-4 blind greens → item-10d doc review → DONE row with the **layer** (RCA-12),
   the **recorded red set**, and the **contract regime** (§13.3).
2. **Inside that same unit**, the removed behaviour's tests are archived — with the destination
   `archive/tests/2026-09-21-<name>.test.ts`, the new `tests/` topic row added to `archive/README.md`
   **in the same pass**, and every citation repointed (AGENTS.md item 6c: *"never leave a citation
   pointing at a moved file"*).
3. **The trio re-run and the reading recorded** (§5.5) — plus `npm run battery` if a `.test.mjs` file or
   a fixture moved.
4. **The trackers updated in the same pass** (AGENTS.md item 6: `docs/defects.md`, `docs/decisions.md`,
   `docs/pending.md`, `docs/next-steps.md`, `docs/HANDOFF.md`) — including the **test-count claims**,
   which are stale-prone (§13.3's *"a DONE row that cites no documentation-review pass … is a review
   finding"*).

---

## §7 — WHAT NEEDS A USER RULING

Three questions only. Each is a **decision the audit cannot make for the user**, and each blocks a
different part of the program.

**R-1 — Does the user want the 26-file `ORPHANED-PIN` citation debt repointed NOW, ahead of the
implementing units?**
The subject of every one is live, so repointing moves no test and changes no count — it is pure citation
hygiene. **Recommended: YES, as one atomic `tests/**` repoint pass**, because it is the only pruning-shaped
work the tree can absorb today, and because these 26 citations are the **test-side half** of the
`docs/defects.md` `CATALOG-CITES-NONEXISTENT-UNIT-SPEC` class that the doc-side §D.4 citation audit could
not reach. **If the user declines, the debt is recorded and nothing else changes.**

**R-2 — Does the user accept that the test pruning is a FOLLOW-ON to C9/C11/P2, not a parallel workstream?**
This audit's finding is that the honest `ARCHIVE-READY` set is **empty** and that the 44 `HOLD` files
retire **only** as their units land (§6.2). **Recommended: YES — adopt §6 as the program's order-of-
operations rule and record it as a decision row** (`DECIDED: TEST-ARCHIVE-FOLLOWS-THE-REMOVAL` or similar),
because otherwise the next pass repeats this audit's finding from scratch or, worse, prunes on the
decision text and reddens the suite.

**R-3 — Who owns the `tests/**` citation debt, and does it get its own tracker row?**
The 26 dangling citations are **not** in `docs/**`, so they fall outside
`docs/specs/obsolete-document-disposition-2026-09-21.md` §D.4's citation-impact audit and outside
`CATALOG-CITES-NONEXISTENT-UNIT-SPEC`'s write set. **Recommended: file one defect row** —
`TEST-CITES-MISSING-SPEC` (or similar) — on `docs/defects.md`, pointing at this audit's §3.2.1/§3.2.2,
with the 21 `archive/parent-project/` imports as the primary sub-class, and name the owning pass.

**Two secondary notes the user should see but need not rule on:**
(a) **85 files carry stale red-set headers** (§3.4) — a doc-drift batch for a future doc-review pass, not
an archive ground; (b) **`tests/fixtures/hooks-scenarios-data.mjs` + `handlers-scenarios-data.mjs` and
`tests/fixtures/o0-artifact-*.json` + `v5-bridge-capture-fixture.ts` must never be archived while
`tests/gemma4-blind-battery.test.ts` (KEEP-LIVE) or the O-0/v5 suites (KEEP-LIVE) exist** — the single
shared-helper trap this audit found.

---

## §8 — STATUS

- **Kind:** DOC-LAYER / AUDIT. **Files written by this pass: exactly one — this file.**
- **Nothing moved, deleted, renamed or edited** in `tests/**`, `src/**`, `docs/**` (other than this file),
  or `archive/**`. No tracker row was updated (this pass is the audit the tracker update follows).
- **The trio was RUN, not planned:** `npm test` = `221 files / 4 988 passed / 58 skipped / 0 failed`;
  `npm run typecheck` = exit 0; `npm run build` = exit 0.
- **The census rule obeyed:** every figure above is a **reading with a named source**; no count was
  asserted from memory, and the `ARCHIVE-READY` count (0) is the probe's result, not a preference.
- **What this file does NOT do:** it does not lift a freeze, release a catalog row, sign anything off, or
  name a disposition authority other than the user's ruling (§7) plus the owning tracker row
  (`docs/specs/requirement-catalog.md` §C.0 rule 2).

---

## §9 — EXECUTION RECORD: the archive-rebuild pass (2026-09-21, appended)

**§9.1 — the ruling this section executes, and what it supersedes.** The product owner ruled this a
**REBUILD pass** to correct drift and enforce feature compliance with the specs — an explicitly
**BREAKING** change — and ordered the `HOLD-UNTIL-IMPLEMENTED` class **archived now**, ahead of the
implementing units, so the suites can be **rebuilt in proper gated passes later**. That ruling
**supersedes this audit's §3.3 head rule** (*"a file in this class must NOT be archived before its
implementing unit lands"*) and §6.1 clauses 2-3. The normative record is `docs/decisions.md`
`DECIDED: REBUILD-ARCHIVE-POLICY` (**ACTIVE**): *a test whose subject the specs supersede is
**ARCHIVED, not adapted**; the archive is the **rebuild's input**; the coverage hole is **recorded, not
hidden**; and no archived file may be restored except through its owning unit's cycle with a **fresh red
set**.*

**Layer (RCA-12, mandatory declaration): REPO-TEST-SURFACE change — NOT app-green.** This pass moved
test files and updated docs. It wrote **no `src/**`**, changed **no test content**, and its green reading
proves **the suite still collects and passes over the reduced surface** — it proves nothing about the
assembled Electron app, and it is **not** a claim that the archived behaviours work or do not work.

**§9.2 — the work list, reconciled (the per-file list wins over the class table).** The executing pass
took the work list from the **per-file blocks** (§3.3.1/§3.3.2/§3.3.3/§3.3.4), which total
**19 + 1 + 17 + 7 = 44**. **This document's §1.1 inventory class column and its §3.0 per-family table
DISAGREE with that count and with each other**, and the discrepancy is recorded here rather than
silently used:

- §3.0's total row says **44** `HOLD`; its per-family column sums to **50** (`A` 12 + `B` 13 + `C` 18 +
  `D` 1 = 44 … **but** §1.1's class column actually marks **A 10 / B 13 / C 20 / D 1 = 44**). The
  **`A` count (12 vs 10)** and the **`C` count (18 vs 20)** are both wrong in §3.0; §1.1's own rows and
  §3.3.1's own reconciliation note (*"the editing block is 19, not 18"*) agree with the per-file blocks.
- **Rule applied:** *the per-file list wins* — the audited §3.3 blocks were treated as the work list, and
  every file was re-verified individually (existence + import safety) before moving. **No file was moved
  on the strength of a class-table row.**

**§9.3 — the executed moves, the exclusions, and the two in-pass restores.** **43 files moved**, each to
`archive/tests/2026-09-21-<original-basename>`, via `git mv`, **bytes preserved** (`md5sum` before/after:
**43/43 identical; 0 files deleted**). The count is **44 − 1 exclusion**.

*Excluded from the work list (not moved, with the reason):*

| Excluded file | Work-list block | Reason |
| --- | --- | --- |
| `tests/unit-import-batch-persist-contract.test.ts` | §3.3.4 row 7 | On the executing pass's **absolute-exclusion** list; **substantiated** — `tests/unit-v5-migration-contract.test.ts` pins it **by path + by name** (Pin 4 and the §2a C-4 note). Moving it reddens a protected file. |

*Restored in-pass (moved, found red, moved back with `git mv`; bytes re-verified):*

| Restored file | The red it caused | The pin that forced it |
| --- | --- | --- |
| `tests/unit-u2-rich-decompose.test.ts` | 2 failing rows: *"RED-TODAY: unit-u2-rich-decompose.test.ts ADR-4 builds its input at depth exactly 10000"* + *"… asserts the totality contract"* (a missing file ⇒ `readDepth` returns `null`) | `tests/unit-v5-migration-contract.test.ts` `DEEP_ROWS` pins the file path as the **depth-10 000 budget tenant** (§5.3) |
| `tests/unit-u5-rich-commit-ipc.test.ts` | 1 failing row: *"RED-TODAY: the derived census is NON-EMPTY"* (the derived electron-mock census dropped to 4) | the same file's Pin 1 pins the census to **exactly** `['template-adversarial', 'unit-live11-bridge-seams', 'unit-u5-rich-commit-ipc', 'unit-v5-bridge-capture', 'unit-wave-1-bridge-wiring']` |

**§9.3a — absolute exclusions honoured (never moved, verified after the moves):**
`tests/fixtures/**` (all 5 files: the two `*-scenarios-data.mjs` fixtures remain shared with the
KEEP-LIVE `tests/gemma4-blind-battery.test.ts`); the two **fence** files
(`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts` — §14.2); the O-0 suites
(`tests/unit-o-0-*.test.ts`, `tests/unit-o0-m1-m3-*.test.ts`); `tests/unit-v5-migration-contract.test.ts`;
`tests/import-batch-persist-contract.test.ts`; the three `.test.mjs` files (outside
`vitest.config.ts`'s `include:`; `e2e-battery.test.mjs` owns the `npm run battery` leg). The work list
contained **none** of them except the exclusions named above, and every file verified as
`KEEP-LIVE`/`ORPHANED-PIN` by §1.1 was left in place.

**§9.4 — THE REBUILD MAP (for every archived file: the unit that owns its re-derivation, and the spec
the rebuilt suite must be derived from).** The general derivation rule, binding on all four units: the
rebuilt suite is derived from **`docs/specs/design-extensions-review.md`** (§13.1/§13.3 the program +
the one-unit-one-cycle rule; §14.2 the re-derivation discipline *"explicitly scoped, not deleted"*) +
**the owning unit's own spec** + **the affected `docs/decisions.md` rows** — **never** from the archived
file's assertions (the archive is an input to *what the old pin covered*, not the source of the new
contract). Each rebuilt suite lands through its unit's own gate cycle: **spec → TestWriter red (reported)
→ Implementer green → RCA-3 adversarial / PBT → item-10d doc review → DONE row naming the layer**.

| Owning unit | Archived files | Count |
| --- | ---: | ---: |
| **C9 `U-EDIT-1`** (`WHOLE-PAGE-EDITING`; closes defect `EDIT-MODE-TEXTAREA-UI`) | `unit-l-textarea-editing-ui` · `contenteditable-editor-host` · `contenteditable-caret` · `editing-mode-broadcast-host` · `operator-settings-editing-mode` · `rich-splice` · `rich-eligibility` · `unit-u-edit-1-markdown-html-toggle` · `unit-u5-set-rich-text` · `unit-m1-inline-offset-model` · `unit-o-edit-ops` · `unit-p-ipc-edit-batch` · `unit-n-batch-atomicity` · `unit-u-edit-2-undo-redo-history` · `edit-controller` · `edit-ops` · `edit-adversarial` | **17** |
| **C11 `U-SEARCH`** (the `C13`-removal half of `PN-1`) | `unit-u-shell-8-view-menu-pane-visibility` | **1** |
| **P2 `U-AUTHORITY-SWITCH` (`O-8`)** | `rag-store` · `rag-store-adversarial` · `unit-ms1-store-registry` · `unit-ms2-store-wiring` · `unit-ms3-store-qualified-broadcast` · `unit-ms4-id-prefixing` · `unit-ms4-id-prefixing-adversarial` · `unit-h1-registry-write` · `unit-h2-runtime-controller` · `unit-h4-hot-remove` · `unit-h5-teardown` · `unit-h6-hot-rename` · `unit-h7-default-reassign` · `unit-ud1-document-metadata-fields` · `unit-ud1-document-metadata-fields-adversarial` · `unit-ud3-import-path-id-scheme` · `unit-ud3-import-path-id-scheme-adversarial` | **17** |
| **P2 `U-READS-PIVOT`** | `unit-ud2-journal-invertibility` · `unit-ud4-doc-heads-tree` · `unit-ud5-list-documents-tool` · `unit-ud6-query-document-filters` · `unit-ud7-set-doc-meta-op` · `unit-ujr1-get-journal` | **6** |
| | **total archived** | **41** |

**Two files of the §3.3.1 block do not appear above:** `unit-u2-rich-decompose.test.ts` and
`unit-u5-rich-commit-ipc.test.ts` were **restored in-pass** (§9.3) and keep their pins live, so they
carry **no** rebuild obligation — 44 − 1 exclusion − 2 restores = **41 archived**. Per-unit spec
ownership of the re-derived suites follows the unit files named in §3.3.1-§3.3.4's own headings
(`docs/specs/design-extensions-review.md` §3.3 C row `C9` and §3.6 F item 8; §13.1 P2 `unit-authority-switch`
/ `U-READS-PIVOT` spec obligations in `docs/specs/unit-authority-switch.md` and §12's read-model).

**§9.5 — COVERAGE DELTA (a READING, never a prediction — `npm test`, this pass's own output).**

| Reading | Before the moves | After the moves | Delta |
| --- | ---: | ---: | ---: |
| Test **files** collected | **221** | **180** | **−41** |
| **Passed** rows | **4 988** | **3 846** | **−1 142** |
| **Skipped** rows | **58** | **44** | **−14** |
| **Failed** rows | **0** | **0** | **0** |
| `npm run typecheck` | exit 0 | **exit 0** | — |
| `npm run build` | exit 0 | **exit 0** | — |

**The skip delta is a finding, read not assumed.** The 14 lost skips are the
`describe.skip('renderer-dependent (verified by code review … not node-testable)')` blocks that live
**inside the moved files** (`contenteditable-editor-host`, `unit-l-textarea-editing-ui`, and the
`unit-ms*`/`unit-h*` blocks §5.4 names) — a moved file takes its own skips with it. **No run-to-skip or
skip-to-run conversion occurred**, and the §5.3 depth-row budget is untouched by construction: the two
depth-10 000 rows were **restored** (§9.3), and the first (red) run of this pass is what proved the
budget's tenant had to stay.

**§9.6 — the red the moves produced, and its cause (reported, not hidden).** The first post-move run was
**RED**: `npm test` = **178 files / 1 failed / 3 failed rows / 3 761 passed / 44 skipped**, all three
failures in **one kept, protected file** — `tests/unit-v5-migration-contract.test.ts`. Cause: that file
**pins two of the movers by path and/or by name** (§9.3's table) — exactly the failure mode the executing
brief anticipated (*"a moved file that a kept file imported is the likely cause"*). **Fix applied per the
brief: `git mv` both files back**, re-verified byte-identical, and the file went green (21/21) before the
full trio was re-run. **No test content was edited to make the suite pass.**

**§9.7 — citation debt this pass CREATES (recorded, not left dangling).** `AGENTS.md` item 6(c) forbids
leaving a citation pointing at a moved file. This pass had a **narrow write set** (this audit,
`archive/**`, `docs/decisions.md`, `docs/next-steps.md`, `docs/pending.md`), so the following is
**recorded debt, owned by the named unit at its landing**:

- **`tests/**` prose references (9 hits, all comments — no imports):** `unit-live8-toolbar-undo-refresh`
  → `unit-u-edit-2-undo-redo-history`; `unit-x-rag-provenance-traversal`, `retrieval`,
  `unit-f1-merge-store-results`, `unit-v1-store-adjacency` → `rag-store`; `unit-f3-stores-all-schema` →
  `unit-ms2-store-wiring`; `blind-unit-ud3-…-greens` → `unit-ud3-import-path-id-scheme`;
  `unit-ud4-doc-heads-tree-adversarial` → `unit-ud4-doc-heads-tree`; `blind-unit-ud5-…-greens` →
  `unit-ud5-list-documents-tool`; `unit-ud6-query-document-filters-adversarial` →
  `unit-ud6-query-document-filters`; `props-layout-state` / `props-tab-state` → `unit-ujr1-get-journal`;
  plus `src/main/rag-store-directory.ts` (a comment). **No test breaks; all are stale-comment repoints**
  for the owning unit's doc-review, and they are the same class as §3.4's 85-file stale-header batch.
  *(The two restored files' references — `unit-v5-migration-contract.test.ts` → `unit-u5-rich-commit-ipc`
  / `unit-u2-rich-decompose` — are **live and correct** again.)*
- **`docs/**` citations (≈200 file-citations across ~40 unit specs + `docs/decisions.md` /
  `docs/defects.md` rows).** These are the pins of the **retired** suites, so each is **stale until its
  unit rebuilds**; repointing them is the **owning unit's landing duty** (the unit rewrites the citation
  to its re-derived suite), and in the interim `docs/next-steps.md` + `docs/pending.md` carry the
  obligation so a later pass does not read the stale spec citation as a live pin. **This pass repointed
  the citations inside its own write set only**; the remainder is recorded, not hidden.
- **`docs/decisions.md` `DECIDED: FIRST-RUN-ENABLED-DEFAULT`** names
  `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` as its pin — **stale until `C11 U-SEARCH`
  rebuilds it**; that unit's landing restores the pointer (§3.3.2's note).
