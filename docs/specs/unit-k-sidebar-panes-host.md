# Spec — Unit K: The `SidebarPanes` Renderer Host (UI Mount)

- **Status:** SPEC (the deferred UI-mount work — look-back findings L1/L2, Unit H
  §3a, Unit I §3a). Gate reference: `docs/specs/astrographer-review.md` §4 item 8
  (Sidebar panes — a host-side pane registry with app-graph panes MCP-visible and
  operator-only panes (settings) in an isolated `GraphScope`, never MCP-visible),
  §7 scope item 8, §8.2 (MCP/UI equivalence — a BINDING constraint on every unit
  that touches rendering), §9.2.6 (SINGLE-WRITER-STORE), §9.2.7
  (RAG-EDIT-MCP-GROUPS), §9.2.2 (back-reference carrier), §13 (cross-document
  shared nodes). Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **RAG-EDIT-MCP-GROUPS**, **SUBTREE-OWNERSHIP**,
  **FORM-CONTROL-EDITING**, **PANE-REGISTRY**, **PANE-PROVIDENT-AUTHORING**,
  **APP-GRAPH-PANES-MCP-VISIBLE**, **OPERATOR-ISOLATED-GRAPHSCOPE**,
  **CONTENT-WINDOW-TEMPLATE**, **TEMPLATE-STORE**, **TEMPLATE-PANE**,
  **TEMPLATE-RE-DERIVE**, **ZONE-CONSISTENCY-INVARIANT**, **MCP-UI-EQUIVALENCE**.
  New decisions pinned by this spec (added to `docs/decisions.md` when the unit
  lands): **UI-MOUNT-BOOT** (the renderer bootstraps the app Runtime with the
  pane-inclusive envelope derived from the RAG store + the stored template,
  replacing the `demoEnvelope()` bootstrap), **UI-MOUNT-RE-DERIVE** (both
  `rag-store-changed` and `template-changed` trigger the SAME re-derive:
  fetch snapshot → `buildTraversal` (with the stored template) →
  `assembleAppGraphEnvelope` → re-load the pane-inclusive envelope, guarded by
  the dirty-edit guard), **UI-MOUNT-PANE-REGISTRATION** (the four app-graph
  panes `doc-nav`/`crosslinks`/`search`/`template-editor` + the operator
  `settings` pane are registered + enabled by the host, and their handlers are
  bound to the IPC bridge), **UI-MOUNT-OPERATOR** (the settings pane mounts in
  an isolated `createIsolatedScope()` GraphScope via `mountOperator`, never
  MCP-visible).
- **Scope:** the renderer-surface wiring that makes the RAG content + the
  app-graph panes actually render in the live app and be MCP-visible. It pins
  the `SidebarPanes` host (`src/renderer/sidebar-panes.ts`): the boot wiring
  (replacing the `demoEnvelope()` bootstrap), the re-derive wiring (the
  `rag-store-changed` + `template-changed` re-derive), the pane registration +
  handler binding, the operator mount (the isolated `GraphScope` settings pane),
  and the MCP/UI equivalence (the rendered app-graph panes are MCP-visible).
  This unit consumes Unit A (the RAG store snapshot), Unit C (`buildTraversal` +
  the envelope + backRefs + lineMap + crosslinks), Unit D (the edit controller +
  the dirty-edit guard + the re-traversal path), Unit E (the `rag-query` IPC),
  Unit G (the `rag-backlinks` IPC + the crosslinks wiring), Unit H (the pane
  registry + `assembleAppGraphEnvelope`/`buildOperatorEnvelope` + the
  `SidebarPanes` host shape), and Unit I (the template store + the
  `template-changed` re-derive + the template-editor pane). This unit does NOT
  implement the pure modules (Unit H `pane-registry.ts`/`pane-graph.ts`, Unit I
  `template-pane.ts` — already landed); it wires them into the live renderer.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/renderer/sidebar-panes.ts`
  (the `SidebarPanes` host) + the amended `src/renderer/renderer.ts` (the boot
  wiring replacing the `demoEnvelope()` bootstrap) from §5.8/§5.9 before any
  implementation. The Electron/DOM-dependent parts (§5.8 items 16-20, §5.9 items
  10-11) are documented in a `.skip` block (verified by code review / the e2e
  battery), mirroring the Unit H test convention.

---

## 1. What the proposal asks

1. **The boot wiring.** The renderer must bootstrap the app Runtime with the
   pane-inclusive envelope derived from the RAG store + the stored template,
   replacing the current `demoEnvelope()` bootstrap. On boot: fetch the RAG
   snapshot → fetch the stored template → `buildTraversal` (with the stored
   template) → `assembleAppGraphEnvelope` → `runtime.loadEnvelope` → mount the
   operator settings pane → subscribe to the re-derive triggers.
2. **The re-derive wiring.** Both `rag-store-changed` (Unit D §5.1.9) and
   `template-changed` (Unit I §5.5) must trigger a re-derive: fetch the snapshot
   → `buildTraversal` (with the stored template) → `assembleAppGraphEnvelope` →
   re-load the pane-inclusive envelope. The dirty-edit guard (Unit D §5.2)
   queues a re-derive that runs while a control is dirty.
3. **The pane registration.** The app-graph panes (`doc-nav`, `crosslinks`,
   `search`, `template-editor`) must be registered + enabled in the pane
   registry, and their handlers bound to the IPC bridge.
4. **The operator mount.** The settings pane must be mounted in an isolated
   `createIsolatedScope()` GraphScope (`mountOperator`), never MCP-visible,
   mirroring `SecurePanels`.
5. **The MCP/UI equivalence.** The rendered app-graph panes must be MCP-visible
   (`get_rendered_html`/`list_targets`/`get_markdown`/`dispatch` see them) — the
   §8.2 BINDING constraint.

## 2. Feasibility verdict

**Feasible — grounded in the already-landed pure modules (Unit H `pane-registry.ts`
+ `pane-graph.ts`, Unit I `template-pane.ts`), the app Runtime's `loadEnvelope`
path, the `createIsolatedScope()` GraphScope pattern (`SecurePanels`), and the
existing IPC bridge.**

- **Boot wiring:** the app Runtime (`src/renderer/runtime.ts`) already implements
  `loadEnvelope` (the A2 load path — teardown → translate → register → compile →
  render). The renderer already fetches the RAG snapshot over the `rag-snapshot`
  IPC (Unit D §5.1.9 `onRebuild`) and the template over the `template` IPC (Unit
  I §5.4). `buildTraversal` (Unit C) + `assembleAppGraphEnvelope` (Unit H §5.2)
  are pure, importable in the renderer. Replacing the `demoEnvelope()` bootstrap
  with the pane-inclusive envelope is pure host-side wiring.
- **Re-derive wiring:** the renderer already subscribes to `rag-store-changed`
  (Unit D §5.1.9) and routes it through the edit controller's `requestRebuild()`
  (the dirty-edit guard). The `template-changed` subscription (Unit I §5.4
  `bridge.template.onTemplateChanged`) is the SAME re-derive path with the
  stored template. No new render path.
- **Pane registration:** the pane registry + `PaneDefinition` (Unit H §5.1) and
  the concrete panes (Unit H §5.3 + Unit I §5.4) are pure and already landed.
  The host registers + enables them and binds their handlers to the IPC bridge.
- **Operator mount:** the `createIsolatedScope()` GraphScope pattern is the
  `SecurePanels` model (`src/renderer/secure-panels.ts` — own scope + own
  Supervisor + own DomAdapter + own mount, handlers call the IPC bridge, never an
  MCP tool). The settings pane is a second isolated scope on the same pattern.
- **MCP/UI equivalence:** the pane-inclusive envelope is loaded into the app
  Runtime (the SAME Runtime the MCP endpoints read), so the app-graph panes are
  MCP-visible by construction (§8.2).

No engine/foundation gap blocks this unit. The boot wiring, the re-derive
wiring, the pane registration, and the operator mount are all project-specific
(compose the app Runtime + `createIsolatedScope()` + the existing IPC bridge).
ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is SHELVED 2026-08-26 (markdown
is export-only; the host-side line→node map covers it — see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The boot wiring (replace `demoEnvelope()` with the pane-inclusive envelope) | Project-specific (composes `buildTraversal` + `assembleAppGraphEnvelope` + `runtime.loadEnvelope`) | Medium cost; makes the RAG content + app-graph panes MCP-visible in the live app (L1). |
| The re-derive wiring (`rag-store-changed` + `template-changed` → re-derive + re-load) | Project-specific (composes the Unit D re-traversal path + the Unit I template re-derive) | Medium cost; keeps the panes MCP-visible across edits + template changes (L2 + I1). |
| The pane registration + handler binding | Project-specific (composes the Unit H registry + the IPC bridge) | Low cost; the app-graph panes render + are dispatchable (I2). |
| The operator mount (the isolated `GraphScope` settings pane) | Project-specific (composes `createIsolatedScope()` + own Supervisor/DomAdapter, mirroring `SecurePanels`) | Medium cost; keeps the settings pane off the agent-visible surfaces. |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The
deferred findings this unit closes are recorded here for provenance:

- **L1 (look-back, 2026-08-28):** the store→traversal→pane-assembly→render
  pipeline is not wired into the live renderer — the app bootstraps with
  `demoEnvelope()`, so the RAG content + app-graph panes are not MCP-visible.
  Closed by the boot wiring (§5.1).
- **L2 (look-back, 2026-08-28):** the D→C re-traversal only updates the backRefs
  map, never re-renders the RAG content. Closed by the re-derive wiring (§5.2),
  which re-loads the pane-inclusive envelope into the app Runtime.
- **I1 (Unit I §3a, 2026-08-28):** the `template-changed` whole-graph re-derive
  is not wired in the renderer — `renderer.ts` has no
  `bridge.template.onTemplateChanged` subscription. Closed by the re-derive
  wiring (§5.2).
- **I2 (Unit I §3a, 2026-08-28):** the template-editor pane is authored but never
  registered/wired into the app-graph. Closed by the pane registration (§5.3).

The adversarial pass findings (host findings, fixed + regression-tested) will be
recorded here when the unit lands.

## 4. Design decisions pinned by this spec

- **UI-MOUNT-BOOT:** the renderer bootstraps the app Runtime with the
  pane-inclusive envelope derived from the RAG store + the stored template,
  replacing the `demoEnvelope()` bootstrap. The boot sequence is pinned in §5.1.
- **UI-MOUNT-RE-DERIVE:** both `rag-store-changed` and `template-changed` trigger
  the SAME re-derive: fetch the snapshot → `buildTraversal` (with the stored
  template) → `assembleAppGraphEnvelope` → re-load the pane-inclusive envelope
  into the app Runtime. The dirty-edit guard (Unit D §5.2) queues a re-derive
  that runs while a control is dirty. The re-derive reuses the Unit C traversal +
  Unit H assembly + the Unit D §5.1.9 re-traversal path — NO new render path.
- **UI-MOUNT-PANE-REGISTRATION:** the four app-graph panes
  (`doc-nav`/`crosslinks`/`search`/`template-editor`) + the operator `settings`
  pane are registered + enabled by the host, and their handlers are bound to the
  IPC bridge (registered as handler defs whose bodies call `window.provident.*`,
  NEVER an MCP tool).
- **UI-MOUNT-OPERATOR:** the settings pane mounts in an isolated
  `createIsolatedScope()` GraphScope via `mountOperator` (own Supervisor + own
  DomAdapter → the operator mount, mirroring `SecurePanels`), never MCP-visible.
- **APP-GRAPH-PANES-MCP-VISIBLE (consumed):** the four app-graph panes render in
  the app Runtime graph → MCP-visible (§8.2).
- **OPERATOR-ISOLATED-GRAPHSCOPE (consumed):** the settings pane renders in an
  isolated `GraphScope`, never MCP-visible.
- **SINGLE-WRITER-STORE (consumed):** every pane read goes through the IPC
  bridge (`rag-snapshot`/`rag-backlinks`/`rag-query`/`template`); every pane
  write (the settings pane, the template-editor pane) routes through the
  main-process store via the IPC bridge. No renderer-side RAG-store writes.
- **TEMPLATE-RE-DERIVE (consumed):** a template change triggers a whole-graph
  re-derive, reusing the Unit C traversal + Unit H assembly (§5.2).
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the rendered app-graph panes
  are MCP-visible; the same graph, the same rendering, and the same operations
  are reachable equivalently through the MCP surface and the Electron UI.

## 5. The exhaustive contract

### 5.1 The boot wiring (`SidebarPanes.boot`)

The renderer bootstraps the app Runtime with the pane-inclusive envelope derived
from the RAG store + the stored template, replacing the `demoEnvelope()`
bootstrap. The `SidebarPanes` host owns the boot sequence.

**The renderer entry (`src/renderer/renderer.ts` amendment, pinned):**

1. The renderer constructs the app `Runtime` with a PLACEHOLDER envelope (the
   default content-window template envelope — a bare `wiki-root` + one `main`
   zone container, no content) so the Runtime is constructible synchronously.
   The `demoEnvelope()` import is REMOVED (the demo counter/echo content is no
   longer the bootstrap).
2. The renderer constructs the `SidebarPanes` host with the mount, the operator
   mount, the registry, the bridge, the current-document/node accessors, the
   backRefs map, and the edit controller.
3. The renderer calls `host.boot(runtime)` (async). The boot sequence is pinned
   below.
4. The renderer wires the MCP request handler (`handleRequest`) + the
   `app-graph-changed` push (`MUTATING_METHODS`) as today. The `onRebuild`
   callback of the edit controller is the host's `reDerive` (see §5.2).

**The boot sequence (`SidebarPanes.boot(runtime)`, pinned):**

1. **Register + enable the panes** (`registerPanes`, §5.3): register the four
   app-graph panes (`doc-nav`, `crosslinks`, `search`, `template-editor`) + the
   operator `settings` pane; enable the four app-graph panes (they must be
   enabled to be MCP-visible) + the `settings` pane (it is the operator pane to
   mount).
2. **Bind the handlers** (`bindHandlers`, §5.3): register the pane handler defs
   whose bodies call the IPC bridge.
3. **Fetch the RAG snapshot** (`bridge.rag.snapshot()` → `RagSnapshotPayload`).
   The renderer has no store access (SINGLE-WRITER-STORE); the snapshot is a
   read-only copy.
4. **Fetch the stored template** (`bridge.template.get()` →
   `{ source, template }`). The stored template is the envelope's `template`
   (Unit I §5.1); the default is `DEFAULT_CONTENT_WINDOW_TEMPLATE`.
5. **Derive the document ids** from the snapshot's `doc-head` edges' targets
   (the document roots). An empty snapshot (no `doc-head` edges → no documents)
   → an empty `documentIds` array (the traversal emits no content payloads, no
   throw).
6. **`buildTraversal`** with the snapshot adapter + the derived document ids +
   the zone name (`'main'`) + the stored template:
   `buildTraversal({ store: <snapshot adapter>, documentIds, zoneName: 'main', template: storedTemplate })`
   → the `TraversalResult` (envelope + backRefs + lineMap + crosslinks).
7. **Repopulate the backRefs map** (the SOLE authoritative carrier, Unit C §5.3):
   clear + repopulate the host's `backRefs` Map (the SAME reference the edit
   controller holds) from `traversal.backRefs`. This makes the re-traversal REAL
   (closes L2).
8. **`assembleAppGraphEnvelope`** with the traversal envelope + the registry +
   the pane context + the sidebar zone:
   `assembleAppGraphEnvelope({ traversalEnvelope, registry, ctx, sidebarZone })`
   → the pane-inclusive `AppGraphAssemblyResult` (envelope + paneIds).
9. **`runtime.loadEnvelope(result.envelope)`** — the app Runtime renders the
   pane-inclusive envelope. The app-graph panes are now MCP-visible by
   construction (§5.5).
10. **`mountOperator()`** (§5.4): build the operator envelope via
    `buildOperatorEnvelope` + render it in a fresh `createIsolatedScope()`
    GraphScope (own Supervisor + own DomAdapter → the operator mount).
11. **Subscribe to the re-derive triggers** (§5.2): `bridge.edit.onRagStoreChanged`
    + `bridge.template.onTemplateChanged`.

**The snapshot adapter (pinned):** the host builds a minimal read-only adapter
over the snapshot that satisfies the `RagStore` interface:
`{ listNodes: () => snapshot.nodes, listEdges: () => snapshot.edges }` (the same
adapter `rebuildBackRefs` uses — Unit C §5.9). `buildTraversal` only reads
`listNodes()`/`listEdges()`.

**The document-id derivation (pinned):** `documentIds = [...new Set(snapshot.edges.filter(e => e.kind === 'doc-head').map(e => e.target))]` — the `doc-head` edges' targets, deduped, in store order. This is the SAME derivation `rebuildBackRefs` uses (Unit C §5.9).

**Fail-states (boot):** a `null`/`undefined` `runtime` argument to `boot` → throws
`Error('SidebarPanes.boot: runtime required')`. A bridge error during the
snapshot/template fetch → the boot is ABORTED (the placeholder envelope stays
rendered; the error is caught + logged, never a crash). A `buildTraversal` /
`assembleAppGraphEnvelope` throw → propagates (a malformed store/template is a
caller error, never a silent skip).

### 5.2 The re-derive wiring (`SidebarPanes.reDerive` + the subscriptions)

Both `rag-store-changed` (Unit D §5.1.9) and `template-changed` (Unit I §5.5)
trigger the SAME re-derive. The re-derive reuses the Unit C traversal + Unit H
assembly + the Unit D §5.1.9 re-traversal path — NO new render path.

**The re-derive sequence (`SidebarPanes.reDerive()`, pinned):**

1. **Fetch the RAG snapshot** (`bridge.rag.snapshot()`).
2. **Use the stored template** (`this.template` — the current template, updated
   on boot + on each `template-changed`). No template fetch is needed on a
   `template-changed` re-derive (the payload carries the template).
3. **Derive the document ids** from the snapshot's `doc-head` edges' targets.
4. **`buildTraversal`** with the snapshot adapter + the derived document ids +
   the zone name + `this.template`.
5. **Repopulate the backRefs map** from `traversal.backRefs` (the SOLE
   authoritative carrier).
6. **`assembleAppGraphEnvelope`** with the traversal envelope + the registry +
   the pane context + the sidebar zone.
7. **`runtime.loadEnvelope(result.envelope)`** — re-render. The app-graph panes
   stay MCP-visible with their `data-*` payloads re-materialized from the current
   store (closes L2 + I1).
8. **`refresh()`** the pane data (the crosslinks backlink enumeration) over the
   bridge (§5.6).

**The subscriptions (pinned):**

- **`rag-store-changed`** (`bridge.edit.onRagStoreChanged`): the handler calls
  `editController.requestRebuild()`. The edit controller's `onRebuild` callback
  is the host's `reDerive`. If a control is dirty, the re-derive is QUEUED (the
  dirty-edit guard, Unit D §5.2); when the control commits and clears its dirty
  flag, the queued re-derive executes.
- **`template-changed`** (`bridge.template.onTemplateChanged`): the handler
  updates `this.template = payload.template`, then calls
  `editController.requestRebuild()`. The re-derive uses the payload's template
  (no follow-up fetch). The dirty-edit guard applies identically (a
  `template-changed` while a template-editor control is dirty queues the
  re-derive behind the commit — Unit I §5.5).

**The dirty-edit guard (pinned):** the re-derive routes through the edit
controller's `requestRebuild()` (Unit D §5.2). A re-derive that runs while a
control is dirty is QUEUED (not executed); at most ONE queued rebuild (coalesced);
when the control commits and clears its dirty flag, the queued re-derive
executes. This is the SAME guard as the Unit D re-traversal.

**Fail-states (re-derive):** a bridge error during the snapshot fetch → the
re-derive is ABORTED (the current graph stays rendered; the error is caught +
logged, never a crash). A `buildTraversal` / `assembleAppGraphEnvelope` throw →
propagates (a caller error). The re-derive is fire-and-forget (the `onRebuild`
signature is sync); a failure leaves the current backRefs + graph in place.

### 5.3 The pane registration + handler binding (`registerPanes` + `bindHandlers`)

**The concrete panes (pinned):**

| Pane id | Title | Scope | Render (the host's closure) | Data source |
| --- | --- | --- | --- | --- |
| `doc-nav` | "Documents" | `app-graph` | `(ctx) => docNavContent(ctx)` (Unit H §5.3) | `ctx.snapshot` (the `doc-head` edges) |
| `crosslinks` | "Links" | `app-graph` | `(ctx) => crosslinksContent(ctx, this.lastBacklinks)` (Unit H §5.3) | `ctx.crosslinks` + `this.lastBacklinks` (the `rag-backlinks` IPC) |
| `search` | "Search" | `app-graph` | `(ctx) => searchContent(ctx, this.lastQueryResult)` (Unit H §5.3) | `this.lastQueryResult` (the `rag-query` IPC) |
| `template-editor` | "Template" | `app-graph` | `createTemplateEditorPane().render(this.buildTemplateContext())` (Unit I §5.4) | `ctx.template` + `ctx.targetedZones` (the `template` IPC) |
| `settings` | "Settings" | `operator` | the operator settings content (operator-owned settings) | the operator IPC bridge |

**Registration (pinned):** `registerPanes()` registers the five panes in the
registry (in the order above) and enables the four app-graph panes + the
`settings` pane. Newly registered panes are DISABLED (Unit H §5.1); the host
enables the panes it wants. The four app-graph panes MUST be enabled to be
MCP-visible (Unit H §4 PANE-REGISTRY). The `settings` pane MUST be enabled to be
mounted in the operator scope.

**The host's pane-data cache (pinned):** the host maintains
`lastBacklinks: BacklinkResult | null` and `lastQueryResult: RagQueryResult |
null`. The `crosslinks` and `search` pane render closures read these (the pure
helpers take the result as a parameter — Unit H §5.3). `refresh()` re-fetches
`lastBacklinks` (when `currentNodeId()` is non-null) over the `rag-backlinks`
IPC; `lastQueryResult` is set by the `pane-search-submit` handler (§5.3).

**The handler binding (`bindHandlers`, pinned):** the host registers the pane
handler defs (via `registerHandlerDef` from `provident-ssr/core/registry.js`) for
each pane handler name, with bodies that call the IPC bridge (`window.provident.*`),
NEVER an MCP tool. The handler names + the IPC calls they make:

| Handler name | Pane | IPC call |
| --- | --- | --- |
| `pane-doc-nav-select` | `doc-nav` | reads the `li`'s `data-document-id` prop → triggers a document-switch re-traversal (the single-document view's `documentIds` becomes `[<document root id>]`; updates `currentDocumentId` + calls `requestRebuild()`) |
| `pane-search-submit` | `search` | reads the `pane-search-input` value → `bridge.rag.query(value)` (topK default 5) → stores the result in `lastQueryResult` → re-renders. An EMPTY query → the handler does nothing (no IPC). |
| `template-zone-add` | `template-editor` | reads the `template-zone-input` value → `bridge.template.create(zone)` |
| `template-zone-remove` | `template-editor` | reads the `li`'s `data-template-zone` prop → `bridge.template.delete(zone)`; a TARGETED zone's remove is disabled (a targeted-zone delete would reject — Unit I §5.9.5) |
| `template-reset` | `template-editor` | `bridge.template.reset()` |
| `template-save` | `template-editor` | `bridge.template.set(editedTemplate)` |
| the settings handlers | `settings` | the operator IPC bridge (operator-owned settings; never the RAG `edit.*` path) |

**The handler defs are registered in the app-graph scope** (the app Runtime's
scope) for the app-graph panes, so `provident.dispatch` can drive them (§5.5).
The settings handlers are registered in the ISOLATED scope (the operator mount,
§5.4), so an agent cannot reach them.

**Fail-states (registration):** a `registerPanes` that registers a duplicate id →
the registry throws `Error('pane registry: duplicate id "X"')` (Unit H §5.9.1).
A `bindHandlers` that registers a handler def with a non-string body → the
engine's `registerHandlerDef` throw (a caller error).

### 5.4 The operator mount (`SidebarPanes.mountOperator`)

The settings pane mounts in an isolated `createIsolatedScope()` GraphScope,
never MCP-visible, mirroring `SecurePanels` (Unit H §5.4).

**The isolated scope (pinned):**

- `mountOperator()` builds the operator envelope via
  `buildOperatorEnvelope(registry, ctx)` (Unit H §5.2) and renders it in a fresh
  `createIsolatedScope()` GraphScope (own Supervisor + own DomAdapter → the
  operator mount), mirroring `SecurePanels` (`src/renderer/secure-panels.ts`).
- The scope is created by `createIsolatedScope()` (`provident-ssr/core/registry.d.ts`
  D1/D8). Per the engine: "A graph rendered under this scope is fully disjoint
  from every other scope: it never resolves, compiles, or destroys another
  graph's handler defs, nodes, or userData." The app Runtime (the agent-visible
  graph) and the settings scope share NO registry state.
- The pane renders through the engine's canonical render path with the scope
  threaded through: `translateLegacy(buildOperatorEnvelope(...), { hub,
  graphScope: this.scope })` → `new Supervisor({ events: new EventBridge(),
  graphScope: this.scope })` → `new DomAdapter(operatorMount, { onEvent })` →
  `renderProducingProcess(actionable, byNode, adapter, prevMap, { nodeIdAttribute:
  true, graphScope: this.scope })` (the `RenderOptions.graphScope` —
  `render-helpers.d.ts`).
- **Why isolated (pinned):** operator-only content (the settings pane) is not
  part of the agent-visible app graph. The app Runtime's dispatch/rendered/
  target/state endpoints read ONLY the app Runtime graph (§5.5); the settings
  pane is not in it, so an agent has no path to the operator's settings. An
  operator-only pane rendered OUTSIDE an isolated scope (i.e. in the app graph)
  is a review finding.
- **Handlers:** the settings pane's handler bodies call the IPC bridge
  (`window.provident.*`) — NEVER an MCP tool. An agent cannot reach these
  handlers (they are in the isolated scope, not the app graph).
- **Content (pinned, concrete):** the `settings` pane renders operator-owned
  settings that are NOT agent-visible. Concrete examples: which sidebar panes
  are enabled for the operator view; the default document on boot; the retrieval
  `topK` default. Each setting is a form control (an `input`/a set of `label`
  toggles) authored as provident data. The exact setting set is the host's
  choice; the CONTRACT is: (a) it is operator-only, (b) it renders in an isolated
  scope, (c) its controls commit via the IPC bridge, never an MCP tool, (d) it is
  NOT MCP-visible.

**Fail-states (operator mount):** a `buildOperatorEnvelope` throw (a null
registry/ctx, or an operator pane whose `render` returns nothing — Unit H
§5.9.13/14) → propagates (a caller error). The operator scope is disjoint from
the app Runtime (D1/D8) — a settings pane node is never resolvable by the app
Runtime's dispatch/state endpoints (fail-closed, §5.5).

### 5.5 The MCP/UI equivalence (the §8.2 BINDING constraint)

**App-graph panes are MCP-visible (§8.2, a BINDING constraint):**

- The pane-inclusive envelope (§5.1/§5.2) is loaded into the app Runtime (the
  SAME Runtime the MCP endpoints read). Therefore:
  - `provident.get_rendered_html` (→ `renderedHtml`) includes the app-graph pane
    elements (`pane-doc-nav`, `pane-crosslinks`, `pane-search`,
    `pane-template-editor` + their `data-*` props).
  - `provident.get_markdown` (→ `markdown`) includes the app-graph panes' text
    content.
  - `provident.list_targets` (→ `ListTargetsResult`) lists the app-graph pane
    nodes (their authored `props.id`/`css.id`).
  - `provident.get_node_state` can resolve an app-graph pane node.
  - `provident.dispatch` can target an app-graph pane node (e.g. the
    `pane-search-input` input, a `doc-nav` `li`, a `template-save` button) and
    drive its handler.
- **Equivalence test (pinned):** an app-graph pane's rendered output is identical
  through the MCP surface (`get_rendered_html`) and the UI (the app Runtime's
  `renderedHtmlResult()`) — the same graph, the same rendering, the same
  operations reachable equivalently (§8.2).

**Operator panes are NOT MCP-visible (isolation):**

- The `settings` pane renders in an isolated `createIsolatedScope()` GraphScope
  (§5.4), NOT in the app Runtime. The app-graph endpoints read ONLY the app
  Runtime. Therefore:
  - `provident.get_rendered_html`/`get_markdown` do NOT include the settings
    pane.
  - `provident.list_targets` does NOT list the settings pane nodes.
  - `provident.get_node_state` cannot resolve a settings pane node (an
    unresolved target → the existing `unresolved target` throw, fail-closed).
  - `provident.dispatch` cannot target a settings pane node (unresolved →
    fail-closed).
  - The `rag`/`edit` MCP groups operate on the main-process RAG store only; the
    settings content is never in the store, so those groups cannot reach it.
- **Isolation test (pinned):** after mounting the settings pane, `list_targets`
  contains NO settings pane node; `get_rendered_html`/`get_markdown` contain NO
  settings content; `dispatch` on a settings pane id throws `unresolved target`
  (fail-closed).

### 5.6 The `SidebarPanes` host API (`src/renderer/sidebar-panes.ts`)

```ts
// src/renderer/sidebar-panes.ts (project-specific; the renderer host).

export interface SidebarPanesOptions {
  /** The app graph mount (#app) — the app Runtime renders the pane-inclusive
   *  envelope here. */
  mount: HTMLElement
  /** The operator mount (#panes) — the settings pane renders in its isolated
   *  GraphScope here. */
  operatorMount: HTMLElement
  /** The pane registry (the single authority over enabled panes). */
  registry: PaneRegistry
  /** The preload IPC bridge (window.provident). */
  bridge: ProvidentBridge
  /** The current document root id accessor (the single-document view). */
  currentDocumentId: () => string | null
  /** The current node id accessor (the crosslink pane's focus node). */
  currentNodeId: () => string | null
  /** The back-reference map (the edit controller's map — the SOLE authoritative
   *  carrier). The host clears + repopulates it after each buildTraversal. */
  backRefs: Map<string, string[]>
  /** The edit controller (the dirty-edit guard + the re-traversal trigger). The
   *  host's reDerive is the controller's onRebuild callback. */
  editController: EditController
  /** The traversal zone name (default 'main'). */
  zoneName?: string
  /** The sidebar zone name (default SIDEBAR_ZONE). */
  sidebarZone?: string
}

export class SidebarPanes {
  constructor(opts: SidebarPanesOptions)
  /** Register the concrete panes (doc-nav/crosslinks/search/template-editor
   *  app-graph + settings operator) + enable the app-graph panes + the settings
   *  pane. */
  registerPanes(): void
  /** Bind the pane handlers to the IPC bridge (register the handler defs). */
  bindHandlers(): void
  /** Build the base PaneContext from the current accessors + backRefs + the
   *  traversal crosslinks + the last-fetched pane data. */
  buildContext(): PaneContext
  /** Build the TemplatePaneContext (PaneContext + template + targetedZones). */
  buildTemplateContext(): TemplatePaneContext
  /** Assemble the pane-inclusive app-graph envelope from a traversal envelope
   *  + the enabled app-graph panes, and LOAD it into the app Runtime. Returns
   *  the assembly result. */
  loadAppGraph(runtime: Runtime, traversalEnvelope: LegacyInitialData): AppGraphAssemblyResult
  /** Mount the operator settings pane in its OWN isolated GraphScope (the
   *  SecurePanels pattern) from the enabled operator panes. */
  mountOperator(): void
  /** Re-fetch the pane data (snapshot/backlinks/query) over the bridge,
   *  re-assemble, and re-render both the app graph panes and the operator
   *  settings pane. Async. */
  async refresh(): Promise<void>
  /** The full boot wiring: register + enable the panes, bind the handlers,
   *  fetch the snapshot + template, buildTraversal → assemble → load the
   *  pane-inclusive envelope, mount the operator pane, subscribe to
   *  rag-store-changed + template-changed. Async. */
  async boot(runtime: Runtime): Promise<void>
  /** The re-derive wiring: fetch the snapshot, buildTraversal (with the stored
   *  template), assemble the pane-inclusive envelope, re-load it into the app
   *  Runtime, repopulate the backRefs map. Async. */
  async reDerive(): Promise<void>
  /** The rag-store-changed handler: routes through the edit controller's
   *  dirty-edit guard (requestRebuild). */
  onRagStoreChanged(payload: RagStoreChangedPayload): void
  /** The template-changed handler: updates the stored template + routes through
   *  the edit controller's dirty-edit guard (requestRebuild). */
  onTemplateChanged(payload: TemplateChangedPayload): void
}
```

**Return-shape / behavior rules:**

- `registerPanes()` registers the five panes + enables the four app-graph panes +
  the `settings` pane. A duplicate id → the registry throws (Unit H §5.9.1).
- `bindHandlers()` registers the pane handler defs (§5.3). A non-string body →
  the engine's `registerHandlerDef` throw.
- `buildContext()` returns a `PaneContext`:
  `{ snapshot, currentDocumentId: currentDocumentId(), currentNodeId:
  currentNodeId(), backRefs, crosslinks }` — the `snapshot`/`crosslinks` are the
  host's last-fetched values.
- `buildTemplateContext()` returns a `TemplatePaneContext` (PaneContext +
  `template: this.template` + `targetedZones: this.targetedZones`).
- `loadAppGraph(runtime, traversalEnvelope)` calls
  `assembleAppGraphEnvelope({ traversalEnvelope, registry, ctx, sidebarZone })`
  and `runtime.loadEnvelope(result.envelope)`. It returns the
  `AppGraphAssemblyResult`. A null `runtime`/`traversalEnvelope` → the
  `assembleAppGraphEnvelope` guard throws (Unit H §5.9.11).
- `mountOperator()` builds the operator envelope via `buildOperatorEnvelope` and
  renders it in a fresh `createIsolatedScope()` GraphScope (§5.4).
- `refresh()` re-fetches the pane data over the bridge (the crosslinks backlink
  enumeration when `currentNodeId()` is non-null) and re-renders. A bridge error
  is caught (the last-known pane state is kept — never a crash), mirroring
  `SecurePanels.refresh`.
- `boot(runtime)` runs the §5.1 sequence. A null `runtime` → throws
  `Error('SidebarPanes.boot: runtime required')`.
- `reDerive()` runs the §5.2 sequence. A bridge error during the snapshot fetch →
  the re-derive is aborted (the current graph stays rendered; caught + logged).
- `onRagStoreChanged(payload)` calls `editController.requestRebuild()`.
- `onTemplateChanged(payload)` sets `this.template = payload.template` + calls
  `editController.requestRebuild()`.

### 5.7 Pane lifecycle + re-traversal

- **Registry lifecycle:** register (disabled) → enable/disable (the host or
  operator) → the enabled set drives the assembly. Enabling an app-graph pane
  makes it MCP-visible on the next assembly/re-render; disabling removes it.
  Enabling an operator pane mounts it in the isolated scope; disabling
  unmounts/removes it.
- **Re-traversal lifecycle:** after ANY `rag-store-changed` (Unit D §5.1.9) or
  `template-changed` (Unit I §5.5), the host re-derives the graph + re-assembles
  the pane-inclusive envelope + re-loads it into the app Runtime. The app-graph
  panes stay MCP-visible across edits + template changes. The dirty-edit guard
  queues the re-derive while a control is dirty.
- **Operator-pane lifecycle:** the settings pane renders once on mount (its
  isolated scope persists for the session); a settings change commits over the
  bridge and re-renders the operator scope. The settings scope is NOT rebuilt by
  a RAG re-traversal (it is disjoint).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`registerPanes` happy:** registering the five panes + enabling the four
   app-graph panes + the `settings` pane → `registry.list()` has 5 entries;
   `isEnabled` is `true` for all five.
2. **`buildContext` happy:** with the current accessors + backRefs + crosslinks →
   the returned `PaneContext` carries the snapshot, the current document id, the
   current node id, the backRefs, and the crosslinks.
3. **`buildTemplateContext` happy:** with the stored template + targetedZones →
   the returned `TemplatePaneContext` carries the template + targetedZones.
4. **`loadAppGraph` happy:** a traversal envelope + the enabled app-graph panes →
   the pane-inclusive envelope is loaded into the app Runtime; the returned
   `AppGraphAssemblyResult` has the paneIds.
5. **`mountOperator` happy:** the settings pane renders in its isolated
   `createIsolatedScope()` GraphScope → the operator mount shows the settings
   content; the app Runtime does NOT include it.
6. **`refresh` happy:** re-fetching the pane data over the bridge → the
   `lastBacklinks`/`lastQueryResult` are updated; the panes re-render.
7. **`boot` happy:** the full boot sequence → the app Runtime renders the
   pane-inclusive envelope (the RAG content + the app-graph panes); the operator
   settings pane is mounted; the re-derive triggers are subscribed.
8. **`reDerive` happy:** a `rag-store-changed` → the re-derive fetches the
   snapshot, re-traverses, re-assembles, re-loads the pane-inclusive envelope;
   the backRefs map is repopulated; the app-graph panes stay MCP-visible.
9. **`reDerive` template-changed happy:** a `template-changed` → the re-derive
   uses the payload's template (no follow-up fetch), re-traverses, re-assembles,
   re-loads; the content-window + the panes re-render with the new template.
10. **Dirty-edit guard happy:** a re-derive request while a control is dirty →
    the re-derive is QUEUED (the edit controller's `hasQueuedRebuild()` is true,
    `onRebuild` NOT called); when the control commits and clears its dirty flag →
    the queued re-derive executes.
11. **`pane-doc-nav-select` happy:** a document `li` is dispatched → the
    document-switch re-traversal runs (the single-document view's `documentIds`
    becomes `[<document root id>]`); the content re-renders.
12. **`pane-search-submit` happy:** a non-empty query is dispatched on the
    `pane-search-input` → `bridge.rag.query(value)` (topK default 5) returns the
    `RagQueryResult`; the results render as `li` entries with `data-node-id` +
    score.
13. **`pane-search-submit` empty query:** an empty query → the handler does
    nothing (no IPC).
14. **`template-zone-add` happy:** a zone is added via `bridge.template.create` →
    the template store updates + broadcasts `template-changed` → the re-derive
    re-renders.
15. **`template-reset` happy:** `bridge.template.reset()` → the default template
    is restored + `template-changed` → the re-derive re-renders.
16. **App-graph pane MCP-visible (equivalence):** after `boot`, the pane-inclusive
    envelope is in the app Runtime → `get_rendered_html` includes the pane
    elements, `get_markdown` includes the pane text, `list_targets` lists the
    pane nodes, `dispatch` can target a pane node.
17. **Operator settings isolated (isolation):** after `mountOperator`, the
    settings pane renders in its isolated scope → `list_targets` does NOT list
    it, `get_rendered_html`/`get_markdown` do NOT include it, `dispatch` on a
    settings id throws `unresolved target` (fail-closed).
18. **Re-traversal keeps panes MCP-visible:** after a `rag-store-changed` +
    re-derive (which re-loads the pane-inclusive envelope), the app-graph panes
    are STILL in the app graph (MCP-visible), with their `data-*` payloads
    re-materialized from the current store.
19. **Template re-derive keeps panes MCP-visible:** after a `template-changed` +
    re-derive, the app-graph panes (including the template-editor pane) are
    STILL MCP-visible with the new template.
20. **Form-control editing integration (read-only classification):** the four
    app-graph panes bind NO RAG edit control (read-only); the settings pane's
    edits commit via the IPC bridge (never the RAG `edit.*` path); the
    template-editor pane's edits commit via the template IPC (never the RAG
    `edit.*` path).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`boot` with a null/undefined `runtime`** → throws
   `Error('SidebarPanes.boot: runtime required')`.
2. **`registerPanes` with a duplicate id** → the registry throws
   `Error('pane registry: duplicate id "X"')` (Unit H §5.9.1).
3. **`bindHandlers` with a non-string handler body** → the engine's
   `registerHandlerDef` throw (a caller error).
4. **`loadAppGraph` with a null/undefined `runtime`/`traversalEnvelope`** → the
   `assembleAppGraphEnvelope` guard throws
   `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')`
   (Unit H §5.9.11).
5. **`mountOperator` with a null registry/ctx** → `buildOperatorEnvelope` throws
   `Error('buildOperatorEnvelope: registry/ctx required')` (Unit H §5.9.13).
6. **`mountOperator` with an operator pane whose `render` returns nothing** →
   `buildOperatorEnvelope` throws
   `Error('buildOperatorEnvelope: operator pane "<id>" render returned nothing')`
   (Unit H §5.9.14).
7. **A bridge error during the boot snapshot/template fetch** → the boot is
   ABORTED (the placeholder envelope stays rendered; the error is caught + logged,
   never a crash).
8. **A bridge error during the re-derive snapshot fetch** → the re-derive is
   ABORTED (the current graph stays rendered; the error is caught + logged,
   never a crash).
9. **A `buildTraversal` / `assembleAppGraphEnvelope` throw during boot/re-derive**
   → propagates (a caller error, never a silent skip).
10. **`dispatch` on a settings pane node** → the app Runtime throws
    `unresolved target: ...` (fail-closed — the settings pane is NOT in the app
    graph, so it is not targetable). The settings pane's handlers are unreachable
    by an agent.
11. **`get_node_state` on a settings pane node** → `unresolved target` (fail-
    closed; the settings node is not in the app graph).
12. **`rag-backlinks` IPC with a null store** → throws
    `'rag.backlinks: no rag store configured'` (Unit G §5.4 fail-state — the
    crosslinks pane surfaces it as an empty enumeration, never a crash).
13. **`rag-query` IPC with an empty query** → throws
    `'rag.query: query must be a non-empty string'` (Unit E §5.7 fail-state — the
    search pane's submit handler does NOT send the IPC for an empty query; an
    invalid query rejects cleanly).
14. **A `template-changed` while a template-editor control is dirty** → the
    re-derive is QUEUED (the dirty-edit guard, Unit I §5.5); it executes when the
    control commits and clears its dirty flag.

### 5.10 Census / numeric claims

- **Concrete panes:** 5 (`doc-nav`, `crosslinks`, `search`, `template-editor` —
  app-graph; `settings` — operator).
- **App-graph panes:** 4 (MCP-visible).
- **Operator panes:** 1 (isolated, NOT MCP-visible).
- **Pane handler defs registered (app-graph):** 6 (`pane-doc-nav-select`,
  `pane-search-submit`, `template-zone-add`, `template-zone-remove`,
  `template-reset`, `template-save`). The settings handlers are registered in the
  isolated scope (the count is the host's choice).
- **`SidebarPanes` methods:** 10 (`constructor`, `registerPanes`, `bindHandlers`,
  `buildContext`, `buildTemplateContext`, `loadAppGraph`, `mountOperator`,
  `refresh`, `boot`, `reDerive`) + 2 subscription handlers (`onRagStoreChanged`,
  `onTemplateChanged`).
- **`SidebarPanesOptions` fields:** 8 required (`mount`, `operatorMount`,
  `registry`, `bridge`, `currentDocumentId`, `currentNodeId`, `backRefs`,
  `editController`) + 2 optional (`zoneName`, `sidebarZone`).
- **Boot steps:** 11 (register+enable → bind handlers → fetch snapshot → fetch
  template → derive document ids → buildTraversal → repopulate backRefs →
  assemble → load → mount operator → subscribe).
- **Re-derive steps:** 8 (fetch snapshot → use stored template → derive document
  ids → buildTraversal → repopulate backRefs → assemble → load → refresh).
- **Re-derive triggers:** 2 (`rag-store-changed`, `template-changed`), both
  routing through the edit controller's dirty-edit guard.
- **IPC surfaces consumed (all pre-existing):** `rag-snapshot` (doc-nav + the
  re-derive), `rag-backlinks` (crosslinks), `rag-query` (search),
  `template.get`/`set`/`create`/`delete`/`reset` (template-editor),
  `edit-commit` (the edit controller), `rag-store-changed` + `template-changed`
  (the re-derive triggers). No new IPC channel is required by this unit.
- **Isolation fail-closed paths:** `dispatch`/`get_node_state`/`list_targets` on
  a settings pane node — the settings pane is invisible to all of them.
- **The `demoEnvelope()` bootstrap is REMOVED** (replaced by the pane-inclusive
  envelope).

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.2 (the store snapshot shape the
  `doc-nav` pane + the re-derive read), §5.4 (the `RagStore` interface the
  snapshot adapter satisfies), §5.5 (single-writer queue — every pane write
  routes through the main-process store).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalResult` — the
  `envelope` + `backRefs` + `lineMap` + `crosslinks` the host consumes), §5.2
  (the envelope rules + the HARD PRECONDITION), §5.3 (the back-reference map the
  host repopulates), §5.4 (the render path the pane-inclusive envelope loads
  through), §5.9 (`rebuildBackRefs` — the snapshot adapter + document-id
  derivation the host mirrors).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.9 (the `rag-store-changed`
  re-traversal trigger the host subscribes to), §5.1.10 (the `edit-commit` IPC),
  §5.2 (the dirty-edit guard that queues a re-derive while a control is dirty),
  §5.6 (the form-control editing model).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.7 (the `rag-query` IPC the search
  pane reads — the SAME maintained engine as the MCP `rag.query` tool).
- Unit G: `docs/specs/unit-g-crosslink-backlink.md` §5.2 (the `crosslinks:
  CrosslinkWiring[]` traversal output the crosslinks pane reads), §5.3 (the
  backlink enumeration the `rag-backlinks` IPC returns), §5.4 (the `rag-backlinks`
  IPC + its fail-state).
- Unit H: `docs/specs/unit-h-sidebar-panes.md` §5.1 (the `PaneRegistry` +
  `PaneDefinition` the host registers through), §5.2 (`paneSubtreeRoot`/
  `assembleAppGraphEnvelope`/`buildOperatorEnvelope` — the assembly the host
  uses), §5.3 (the concrete app-graph panes + the data-flow helpers), §5.4 (the
  operator isolated-scope pattern the host mirrors), §5.6 (the `SidebarPanes`
  host shape this unit implements), §5.7 (the pane lifecycle + re-traversal),
  §3a (the renderer host is the documented deferral this unit closes).
- Unit I: `docs/specs/unit-i-template.md` §5.4 (the template-editor pane + the
  template IPC + the preload bridge), §5.5 (the whole-graph re-derive the host
  wires), §3a (I1/I2 — the `template-changed` re-derive + the pane registration
  this unit closes).
- Unit J: `docs/specs/unit-j-mcp-security-hardening.md` §5.4 (the equivalence
  mapping — the IPC surfaces the panes consume route through the SAME shared
  handlers), §5.6 (the renderer switch + `MUTATING_METHODS` the host's re-derive
  does not disturb).
- Gate: `docs/specs/astrographer-review.md` §4 item 8 (Sidebar panes), §7 scope
  item 8, §8.2 (MCP/UI equivalence — a BINDING constraint), §9.2.6
  (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS), §9.2.2 (back-reference
  carrier), §13 (cross-document shared nodes).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **RAG-EDIT-MCP-GROUPS**, **SUBTREE-OWNERSHIP**,
  **FORM-CONTROL-EDITING**, **PANE-REGISTRY**, **PANE-PROVIDENT-AUTHORING**,
  **APP-GRAPH-PANES-MCP-VISIBLE**, **OPERATOR-ISOLATED-GRAPHSCOPE**,
  **CONTENT-WINDOW-TEMPLATE**, **TEMPLATE-STORE**, **TEMPLATE-PANE**,
  **TEMPLATE-RE-DERIVE**, **ZONE-CONSISTENCY-INVARIANT**, **MCP-UI-EQUIVALENCE**.
  New rows pinned by this spec (added when the unit lands): **UI-MOUNT-BOOT**,
  **UI-MOUNT-RE-DERIVE**, **UI-MOUNT-PANE-REGISTRATION**, **UI-MOUNT-OPERATOR**.
- Pending: `docs/pending.md` (crosslink hover-preview pane — builds on the Unit H
  display-pane infrastructure + the `SidebarPanes` host / `mountOperator`
  isolated-GraphScope render this unit lands; document tabs — the multi-document
  render).
- Engine surfaces: `provident-ssr/core/registry.d.ts` (`GraphScope`,
  `createIsolatedScope`, `DEFAULT_SCOPE`, `registerHandlerDef` — D1/D8; an
  isolated scope is disjoint from every other scope), `provident-ssr/dist/core/
  render-helpers.d.ts` (`renderProducingProcess`, `RenderOptions.graphScope`),
  `provident-ssr/dist/core/adapters.d.ts` (`DomAdapter`), `provident-ssr`
  (`translateLegacy`, `Supervisor`, `EventBridge`, `LegacyInitialData`,
  `LegacyNodeData`, `LegacyContentPayload`).
- Host patterns: `src/renderer/secure-panels.ts` (the `createIsolatedScope()`
  operator-pane pattern the settings pane mirrors — own scope + own Supervisor +
  own DomAdapter + own mount, handlers call the IPC bridge, never an MCP tool),
  `src/renderer/runtime.ts` (the app Runtime the app-graph panes render in + the
  `loadEnvelope` path), `src/renderer/renderer.ts` (the renderer entry that
  bootstraps the Runtime + `SecurePanels` + the edit controller; the
  `demoEnvelope()` bootstrap is replaced by the pane-inclusive envelope),
  `src/main/preload.ts` (`ProvidentBridge` — the `rag.snapshot`/`rag.backlinks`/
  `rag.query`/`edit.commit`/`template.*` surfaces the panes consume),
  `src/main/main.ts` (the IPC handlers the panes' bridge calls).
