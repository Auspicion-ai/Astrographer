# USER FEEDBACK — Sidebar pane decomposition

**Date:** 2026-09-19 · **Reporter:** product owner (user feedback pass) ·
**Status:** OPEN — first focus of this feedback pass · **Target:** this repo (fork-side
implementation unit), NOT the foundation/engine/package projects ·
**Companion docs:** `docs/next-steps.md` (work queue), `docs/pending.md`,
`docs/decisions.md`, `docs/specs/ui-overhaul.md` (Table A/B/C classification),
`docs/feature-requests/provident-electron-shell-chrome-requests.md` (the upstream
mechanism set — this doc is deliberately NOT one of those).

> **Scope note.** This is a fork-side code-structure request. It changes **where**
> pane code lives, not **what** it renders or how it is authored. The provident
> authoring contract (`AGENTS.md` UI-rendering rule) is unchanged: every pane stays
> authored as provident-ssr data (envelope nodes / handler bodies / hooks) and
> reaches the bridge through the `window.provident.sidebar` seams. Decomposition
> must not introduce hand-written DOM, inline `<script>`, or a "translate layer".

---

## FB-1 — Decompose the sidebar panes into a foldered collection of per-pane files (P1)

### Problem

The sidebar pane surface is concentrated in a small number of very large files:

| File | Lines | What it holds |
| --- | --- | --- |
| `src/renderer/sidebar-panes.ts` | 3664 | the `SidebarPanes` host: registry, boot, reconcile, layout/zone wiring, pane-visibility, doc-switch, search, editor, operator settings, and every host seam |
| `src/renderer/pane-graph.ts` | 1750 | the pure graph builders for every pane: `docNavContent`, `crosslinksContent`, `searchContent`, `landingContent`, `searchTabContent`, editor toolbar, pane frame/minimize/tab helpers, `assembleAppGraphEnvelope`, `buildOperatorEnvelope` |
| `src/renderer/gnosis-crud-panes.ts` | 563 | the Gnosis CRUD pane host + builders |
| `src/renderer/secure-panels.ts` | 516 | the isolated operator settings graph |
| `src/renderer/gnosis-panes.ts` | 244 | the Gnosis query pane |

`sidebar-panes.ts` + `pane-graph.ts` alone are **5414 lines**. Every pane's builder,
its handler bodies, its host seam, its state flags, its CSS-class constants, and the
cross-cutting layout/reconcile machinery all live together. Consequences observed:

1. **Review cost.** A change to one pane's rendering forces a reviewer through the
   whole host class; diffs are large and mixed (builder + host + registry + boot).
2. **Merge/ownership collisions.** Unrelated panes share one file, so two panes
   cannot be worked in parallel without stepping on each other.
3. **Stale citations.** Spec/defect rows cite `sidebar-panes.ts:NNNN`, and those
   line numbers drift constantly as the file grows — the AGENTS.md documentation
   loop has repeatedly had to re-point them.
4. **Test targeting.** The container-level tests span the whole host; a per-pane
   unit is hard to isolate.
5. **Registry drift risk.** The pane list is assembled inline at
   `sidebar-panes.ts:1206-1250` (`registerPanes`) while the builders live in
   `pane-graph.ts` — the definition of "a pane" is split across two 1000+ line
   files with no single per-pane home.

### Requested shape

A foldered collection with **one file per pane**, plus the shared cross-cutting
machinery lifted into its own folder. Proposed layout (names illustrative, to be
pinned by the unit spec):

```
src/renderer/panes/
  index.ts                 # re-exports; the single public surface renderer.ts consumes
  registry.ts              # the pane registration list (the "what panes exist" table)
  shared/
    frame.ts               # pane frame / collapse / minimize / tab-strip helpers
    assembly.ts            # assembleAppGraphEnvelope + buildOperatorEnvelope
    zones.ts               # LAYOUT_PANE_ZONES / zone-track wiring helpers
    handlers.ts            # shared handler-body constants (e.g. OPERATOR_PANE_VISIBILITY_*)
    classes.ts             # clickableClasses + pane CSS-class constants
  doc-nav/
    graph.ts               # docNavContent, deriveDocNavDocuments, DOC_NAV_* constants
    host.ts                # the doc-nav host seams (select/toggle)
  crosslinks/
    graph.ts               # crosslinksContent + hover-preview builder
    host.ts
  search/
    graph.ts               # searchContent, searchTabContent, ADVANCED_SEARCH_*, SEARCH_* constants/bodies
    host.ts                # submit / advanced-toggle / advanced-submit / expand-tab seams
  template-editor/
    graph.ts               # createTemplateEditorPane + buildTemplateContext
    host.ts
  editor/
    toolbar.ts             # EDITOR_TOOLBAR_* + the editing-mode/undo/redo bodies
  settings/
    operator.ts            # the operator settings graph builders (from secure-panels.ts)
    settings-pane.ts       # the SidebarPanes settingsContent()
  rag/
    graph.ts               # the rag-content builders currently in pane-graph.ts
    host.ts
```

The `SidebarPanes` class becomes a thin orchestrator that imports every pane module,
delegates `render` to the per-pane builder, delegates each host seam to the per-pane
host module, and keeps only the genuinely cross-cutting lifecycle (boot, the
content reconcile, document-switch, pane-visibility persistence, MCP tool routing).

### Constraints (non-negotiable)

1. **Pure move first.** The decomposition is a **file/ownership refactor with no
   behavior change**. The unit's red→green evidence is the existing suite passing
   unchanged (plus a new per-pane import/registration test), not new behavior.
2. **Authoring contract preserved.** Every pane remains provident-authored data.
   Handler bodies remain the same `function (ctx) { … window.provident.sidebar.… }`
   strings; only their module home moves.
3. **No circular imports.** `panes/index.ts` is the only module `renderer.ts`
   imports; per-pane modules may import `shared/` but never each other's `host.ts`.
   A dependency-direction test should pin this.
4. **The registry stays the single source of truth.** One `registry.ts` (or one
   exported table) lists every pane with its `id`/`title`/`scope`/builder, so
   "add a pane" is a one-line addition in one file — not edits in two 1000-line files.
5. **Citations get re-pointed in the same pass.** Every spec/defect/decision row
   citing `sidebar-panes.ts:NNNN` / `pane-graph.ts:NNNN` is updated to the new
   module (AGENTS.md item 6 archival loop + item 10d doc review).
6. **Build test.** `npm run build` must still emit a single renderer bundle that
   loads under the existing CSP `script-src 'self'` (the esbuild entry stays the
   same; decomposition adds no runtime fetches).

### Acceptance criteria (testable)

- `src/renderer/panes/**` exists; no single pane module exceeds a agreed budget
  (proposal: 600 lines) and **no file in the pane surface exceeds 1000 lines**.
- `src/renderer/sidebar-panes.ts` and `src/renderer/pane-graph.ts` are either gone
  or reduced to thin re-export/orchestration shims.
- Every pane registered in `registerPanes` today (`doc-nav`, `crosslinks`,
  `search`, `template-editor`, `settings`) has exactly one builder module and (where
  it has host seams) one host module.
- The existing test suite passes with no assertion changes (pure move).
- A new test asserts: (a) the registry lists all five panes with unchanged
  `id`/`title`/`scope`; (b) the dependency direction (no per-pane `host.ts` →
  another per-pane `host.ts`; no cycle through `index.ts`).
- `npm run typecheck` clean, `npm test` green, `npm run build` green.
- The MCP surface is unchanged: `provident.dispatch` / `get_rendered_html` /
  `get_markdown` produce byte-identical output for the same graph before/after
  (verify with a rendered-HTML snapshot comparison).

### MCP-visibility consequence

None intended — this is the point. The refactor must be MCP-neutral: the same nodes,
the same `css.id`s, the same handler names, the same rendered HTML. Any observable
change to `get_rendered_html`/`get_markdown`/`dispatch` output is a regression, not
a refactor.

### Priority

**P1** — blocks no shipped path, but every subsequent pane change pays the
review/citation cost until it lands, and the owner has made it the first focus of
this feedback pass.

### Target project

**This repo** (fork-side unit). Not a foundation request: the foundation ships
generic panes and must not learn Astrographer's pane vocabulary (see the
DO-NOT-FILE table in `provident-electron-shell-chrome-requests.md`). Not an engine
request. Not a `provident-ssr` package request.

### Fallback if deferred

Stay as-is; the cost is review/citation drift, not lost function. There is no
upstream handoff for a fork-local code-structure change.

### Filing verdict

**Accept as a fork-side implementation unit.** Write it as a spec
(`docs/specs/unit-<n>-pane-decomposition.md`) before any code (AGENTS.md item 8/9),
with the TestWriter red set authored FIRST (item 3): the red set is the
dependency-direction test + the registry-completeness test + the rendered-HTML
snapshot equality check, all failing against the current single-file layout because
`src/renderer/panes/` does not exist.

---

## FB-2 — Decompose `src/main/mcp-server.ts` (P1)

### Problem

`src/main/mcp-server.ts` is **2873 lines** — the largest shipped source file in the
repo. It is the entire MCP surface in one module:

- the `provident.*` graph/tool implementations (`registerTools`, `mcp-server.ts:2102`),
- the `rag.*` tool router (`handleRagTool`, `:200`) and its filter validation (`:163`),
- the `gnosis.*` tool router (`handleGnosisTool`, `:556`) and its validation (`:512`),
- the `edit.*` / `code.template.*` tool implementations (`:1284-1499`),
- the module-tool bridge (`invokeModuleTool`/`handleModuleTool`, `:60-129`),
- the eleven `*-ipc` handlers the preload calls (`handleRagQueryIpc:844`,
  `handleRagBacklinksIpc:884`, `handleRagDocHeadsIpc:910`, `handleRagJournalIpc:951`,
  `handleRagJournalOpIpc:965`, `handleRagStoreListingIpc:1009`,
  `handleRagStoreManageIpc:1058`, …),
- the `ProvidentMcpServer` class: transport setup, gating, idempotency, resource
  registration, catalog (`:1640-2480`).

Consequences: the MCP contract (the thing `AGENTS.md` calls this project's core
deliverable) has no per-domain home; a change to one tool family touches the same
file as the HTTP transport; the tool list is a 14-argument positional call
(`registerTools(server, backend, …, this.idempotency)`, `:2094`) that every new
dependency widens; and spec/defect citations to this file drift continuously.

### Requested shape

Split by **tool domain**, with transport/lifecycle kept separate:

```
src/main/mcp/
  server.ts            # ProvidentMcpServer: transports (stdio/http), gating, idempotency, catalog
  registration.ts      # the per-domain register* fns; one ALL_TOOLS/ALL_RESOURCES table
  tools/
    provident.ts       # provident.dispatch / get_rendered_html / get_markdown / list_targets / get_node_state / get_journal / focus
    rag.ts             # handleRagTool + validateRagQueryFilters + the rag-query/backlinks/doc-heads/journal/store-listing/store-manage IPC handlers
    gnosis.ts          # handleGnosisTool + validateGnosisFilters + the gnosis IPC handlers
    edit.ts            # edit.* + code.template.*
    module.ts          # invokeModuleTool / handleModuleTool
  context.ts           # a single McpToolContext object replacing the positional args
```

The `registerTools(server, backend, …14 args…)` signature collapses to
`registerTools(server, ctx)` where `ctx` carries the stores, router, gate, log,
runtime, engine proxies, authority and idempotency. `ProvidentMcpServer` keeps the
transport/lifecycle responsibility only.

### Constraints (non-negotiable)

1. **Pure move, contract-frozen.** No tool name, arg schema, response shape, error
   code, HTTP status, or gating rule may change. The MCP contract IS the deliverable.
2. **The tool/resource table is the single source of truth.** `ALL_TOOLS` /
   `ALL_RESOURCES` move to one module; adding a tool is one table row + one handler,
   not an edit at a 14-arg call site.
3. **Gate/security semantics unchanged.** `handleGnosisTool`'s `resolveCallerCredential`
   (`:613`), the authority store, and the `gnosis-edit` default-off group stay exactly
   as they are.
4. **Citations re-pointed in the same pass** (AGENTS.md item 6 + 10d).
5. **Build/typecheck green**; the esbuild main bundle entry stays `src/main/main.ts`.

### Acceptance criteria (testable)

- `src/main/mcp/` exists; no file exceeds 1000 lines; `mcp-server.ts` gone or a
  thin re-export shim.
- Every existing MCP test passes **with no assertion changes** (pure move):
  `tests/mcp-security-hardening.test.ts`, `tests/unit-gn-mcp-ui-wiring.test.ts`,
  the CRUD-routing/engine-integration suites, and the `provident.*` tool suites.
- A new test asserts the tool/resource catalog is byte-identical to the pre-refactor
  list (a frozen `ALL_TOOLS`/`ALL_RESOURCES` snapshot) and that each tool maps to a
  handler module.
- `provident.get_rendered_html` / `get_markdown` / `dispatch` outputs are
  byte-identical before/after for a fixed graph (the MCP-equivalence check).

### MCP-visibility consequence

**Zero intended change** — and this is the more sensitive refactor of the two: the
MCP surface is the product. Any observable delta (tool list, schema, error text,
status code) is a regression.

### Priority

**P1** — the core deliverable's maintainability; every new tool currently widens a
14-argument call and lands in an already-2873-line file.

### Target project

**This repo** (fork-side). Not a foundation request (the foundation ships the MCP
server mechanism; the tool set is Astrographer's domain).

### Fallback if deferred

Stay as-is; cost is review/citation drift and call-site widening.

### Filing verdict

**Accept as a fork-side implementation unit**, spec'd before code (AGENTS.md 8/9),
red first: the frozen-catalog snapshot test + the per-domain handler-mapping test +
the rendered-output equivalence check fail against the current layout because
`src/main/mcp/` does not exist.

---

## FB-3 — Decompose `src/renderer/runtime.ts` (P1)

### Problem

`src/renderer/runtime.ts` is **1564 lines** and holds the whole renderer-side
provident runtime: envelope load/admit (`loadEnvelope:433`, `admitContentNodes:464`),
the content reconcile (`applyContentReconcile:491` + its `…Body:507`), doc loading
(`loadDoc:636`), commands/ops (`applyCommand:687`, `op:892`), journal
(`journal:914`), export/validate (`exportLegacy/Serialized:795/810`, `validateExport:816`,
`export:945`, `validate:953`), teardown (`teardown:854`, `teardownResult:865`), the
DOM/SSR render + merge pass (`render:264`, `mergePass2:311`, `setStates:250`), the
event dispatch/state plumbing (`handleDomEvent:223`, `focusedSlice:781`), the id/
css/props index (`rebuildIdIndex:352`, `nodeByCssId:384`), and the tree-signature
hashing (`structuralProps:969`, `emitTree:1015`, `shapeSig:1024`).

Consequences: the runtime is the object every renderer feature touches; a change to
export hashing sits beside the DOM event handler beside bootstrap; `mcp-server.ts`
and `runtime.ts` are the two files most often cited in specs, and both are 1000+ lines.

### Requested shape

Keep `Runtime` as the public façade class, but extract coherent subsystems:

```
src/renderer/runtime/
  index.ts             # the Runtime class (façade; constructor + delegation)
  envelope.ts          # loadEnvelope / admitContentNodes / materialized*Roots / extractContentRoots
  reconcile.ts         # applyContentReconcile + body
  commands.ts          # applyCommand / op / load / loadDoc
  journal.ts           # journal + the supervisor-facing journal helpers
  export.ts            # exportLegacy/Serialized / export / validate / validateExport
  render.ts            # render / mergePass2 / setStates / renderOptions
  dom-events.ts        # handleDomEvent + dispatch target resolution
  index-map.ts         # css/props id index + nodeByCssId/nodeByPropsId/rebuildIdIndex
  tree-signature.ts    # structuralProps / emitTree / shapeSig / foldElements
  teardown.ts          # teardown / teardownResult / settleGate / hasPendingWork
```

`Runtime` keeps its exact public method names (the file `renderer.ts` + the MCP
`Runtime` consumer depend on them) and delegates to the extracted modules, which
receive the runtime's shared state via a narrow internal context (not `this`-spray).

### Constraints (non-negotiable)

1. **Public surface frozen.** Every method `renderer.ts` and the MCP layer call on
   `Runtime` keeps its name and signature (this is what makes the MCP methods work).
2. **Pure move, behavior-identical.** The `handleRequest` switch in `renderer.ts`
   is untouched; rendered HTML/SSR/markdown and export bytes are identical.
3. **No new global state.** Extracted modules take the shared maps/buffers via an
   explicit context object; no module-level singletons beyond what exists today.
4. **Citations re-pointed in the same pass.**
5. **dom-shim compatibility preserved** — the runtime runs under the node dom-shim
   in tests, so extraction must not assume a browser-only API.

### Acceptance criteria (testable)

- `src/renderer/runtime/` exists; no file exceeds 1000 lines (target ≤600).
- `runtime.ts` gone or a thin re-export.
- Existing suites pass unchanged: `tests/unit-h2-runtime-controller.test.ts`,
  `tests/sidebar-panes-host.test.ts`, the renderer/mcp-equivalence suites.
- New test: the `Runtime` public method set is byte-identical to the pre-refactor
  set (a frozen method-name snapshot), and each extracted module is importable
  under the dom-shim with no browser-only globals.
- `npm run typecheck` clean, `npm test` green, `npm run build` green; the MCP
  `dispatch`/`get_rendered_html`/`get_markdown` responses are byte-identical for a
  fixed graph before/after.

### MCP-visibility consequence

**Zero intended change.** The runtime is the thing `provident.dispatch` and
`get_rendered_html` drive; any observable delta is a regression.

### Priority

**P1** — the renderer runtime is the highest-traffic object in the renderer; it
co-changes with `renderer.ts` (1052) and `sidebar-panes.ts` (FB-1).

### Target project

**This repo** (fork-side). Not a foundation request — the runtime wraps the
`provident-ssr` package; the package is never patched (AGENTS.md item 7).

### Fallback if deferred

Stay as-is; cost is review/citation drift.

### Filing verdict

**Accept as a fork-side implementation unit**, spec'd before code, red first: the
frozen public-method snapshot + the dom-shim importability test + the rendered/
export byte-equivalence check fail against the current layout because
`src/renderer/runtime/` does not exist.

---

## Scan table — every file ≥1000 lines (2026-09-19)

For context; the actionable decomposition targets are FB-1 (pane surface), FB-2
(`mcp-server.ts`), FB-3 (`runtime.ts`). The remaining rows are tracked here so a
later pass has the full census and does not re-scan.

**`src/` (8 files ≥1000; 71 source files, 35,149 lines total):**

| File | Lines | Disposition |
| --- | --- | --- |
| `src/renderer/sidebar-panes.ts` | 3664 | **FB-1** |
| `src/main/mcp-server.ts` | 2873 | **FB-2** |
| `src/renderer/pane-graph.ts` | 1750 | **FB-1** |
| `src/renderer/runtime.ts` | 1564 | **FB-3** |
| `src/main/retrieval.ts` | 1467 | candidate FB-4 (deferred) |
| `src/main/rag-store.ts` | 1423 | candidate FB-4 (deferred) |
| `src/main/engine-rag-store.ts` | 1093 | candidate FB-4 (deferred) |
| `src/renderer/renderer.ts` | 1052 | residual after FB-1/FB-3 (boot/orchestration) |

**`scripts/`:**

| File | Lines | Disposition |
| --- | --- | --- |
| `scripts/live-drive.mjs` | 3849 | test driver, not shipped; no action |

**`tests/` (largest; one-file-per-unit by convention, not decomposition targets):**

| File | Lines |
| --- | --- |
| `tests/unit-ms2-store-wiring.test.ts` | 2191 |
| `tests/unit-gn-engine-integration.test.ts` | 1741 |
| `tests/unit-a1-crud-routing-proxy.test.ts` | 1709 |
| `tests/unit-o-0-report-contract.test.ts` | 1605 |
| `tests/unit-h2-runtime-controller.test.ts` | 1411 |
| `tests/unit-h8-operator-editor.test.ts` | 1348 |
| `tests/unit-ms1-store-registry.test.ts` | 1311 |
| `tests/unit-a2-document-crud-wiring.test.ts` | 1283 |
| `tests/unit-h7-default-reassign.test.ts` | 1231 |
| `tests/unit-ms4-id-prefixing.test.ts` | 1227 |
| `tests/vector-cache.test.ts` | 1223 |
| `tests/unit-gn-mcp-ui-wiring.test.ts` | 1180 |
| `tests/contenteditable-editor-host.test.ts` | 1163 |
| `tests/unit-u-shell-9a-main-focus-tabs.test.ts` | 1086 |
| `tests/unit-h1-registry-write.test.ts` | 1073 |
| `tests/unit-u-shell-4-drag-relocate.test.ts` | 1043 |
| `tests/sidebar-panes-host.test.ts` | 1043 |
| `tests/vector-boot.test.ts` | 1041 |
| `tests/unit-o-0-hook-contract.test.ts` | 1031 |
| `tests/mcp-security-hardening.test.ts` | 1013 |

A deferred **FB-4** (main-process data layer: `retrieval.ts`, `rag-store.ts`,
`engine-rag-store.ts`) is recorded as a candidate only — not requested in this pass.
