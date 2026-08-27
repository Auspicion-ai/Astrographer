# Unit H — Sidebar Panes: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-h-sidebar-panes.md`
  ONLY — no implementation reading of the scenario content).
- **Source contract:** `docs/specs/unit-h-sidebar-panes.md` §5.1–§5.11 (the
  `PaneRegistry` + `PaneDefinition` shape, the assembly module
  `SIDEBAR_ZONE`/`paneSubtreeRoot`/`assembleAppGraphEnvelope`/
  `buildOperatorEnvelope`, the app-graph panes `doc-nav`/`crosslinks`/`search`
  MCP-visible, the operator-only `settings` pane in an isolated `GraphScope`,
  the per-pane data flow, §5.8 happy paths, §5.9 fail-states, §5.10 census) +
  §3a (the post-green adversarial findings H1–H6, host-fixed + regression-tested).
- **Modules under test:** `src/renderer/pane-registry.ts` (`createPaneRegistry`),
  `src/renderer/pane-graph.ts` (`SIDEBAR_ZONE`, `paneSubtreeRoot`,
  `assembleAppGraphEnvelope`, `buildOperatorEnvelope`, `deriveDocNavDocuments`,
  `docNavContent`, `crosslinksContent`, `searchContent`), the traversal envelope
  fixture via `src/main/traversal.ts` (`buildTraversal`), the `rag-backlinks` IPC
  fail-state via `src/main/mcp-server.ts` (`handleRagBacklinksIpc`), and the
  pre-existing IPC constants (`IPC_RAG_SNAPSHOT`/`IPC_RAG_BACKLINKS`/
  `IPC_RAG_QUERY`) in `src/shared/types.ts`.
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The pure registry + assembly + data-flow
  helpers are exercised directly. The traversal envelope fixtures come from
  `buildTraversal` over a minimal read-only `RagStore` adapter (`listNodes`/
  `listEdges`), the same adapter pattern the traversal uses. The `rag-backlinks`
  IPC null-store fail-state is exercised via `handleRagBacklinksIpc`.
- **Run:** 61 scenarios — 61 pass, 0 fail. No spec-vs-impl drift observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (23 node-tested)

Fixture helpers: `N(id, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. `def(id,
scope, render)` = a `PaneDefinition`. A traversal envelope is built via
`buildTraversal` over a one-document `doc-head` store; `envelopeWithoutSidebar`
uses `zoneName:'main'` (NO sidebar producer), `envelopeWithSidebar` uses
`SIDEBAR_ZONE` (carries a `sidebar` producer).

### H1. `createPaneRegistry` + `register` happy (§5.8 1)
- **Ops:** register a unique `id`; `get(id)`; `list()`.
- **Expected:** the pane is added DISABLED; `get(id)` returns it; `list()` has 1
  entry; `isEnabled(id)` is `false`.

### H2. `register` + `listByScope` (§5.8 2)
- **Ops:** register `doc-nav` (app-graph), `settings` (operator), `crosslinks`
  (app-graph); `listByScope('app-graph')` and `listByScope('operator')`.
- **Expected:** app-graph returns `['doc-nav','crosslinks']`; operator returns
  `['settings']` — each scope's panes only, in registration order.

### H3. `enable` happy (§5.8 3)
- **Ops:** register `doc-nav`; subscribe via `onChanged`; `enable('doc-nav')`.
- **Expected:** `isEnabled('doc-nav')` is `true`; the subscriber is notified
  with `{ id:'doc-nav', enabled:true }`.

### H4. `setEnabled` no-op on same state (§5.8 4)
- **Ops:** register + enable `doc-nav`; subscribe; `setEnabled('doc-nav', true)`.
- **Expected:** no `onChanged` notification (a no-op on the current state).

### H5. `disable` happy (§5.8 5)
- **Ops:** register + enable `doc-nav`; subscribe; `disable('doc-nav')`.
- **Expected:** `isEnabled('doc-nav')` is `false`; the subscriber is notified
  with `{ id:'doc-nav', enabled:false }`.

### H6. `onChanged` unsubscribe (§5.8 6)
- **Ops:** register `doc-nav`; subscribe; `enable` (notified); unsubscribe;
  `disable`.
- **Expected:** after unsubscribing, further changes do not notify (the
  notification count stays at 1).

### H7. `isEnabled` unknown id (§5.8 7)
- **Ops:** `isEnabled('nope')` on a fresh registry.
- **Expected:** `false` (a safe default — an unknown pane is never visible).

### H8. `paneSubtreeRoot` happy (§5.8 8)
- **Setup:** a pane whose `render` returns `{ type:'ul', content:'hello',
  children:[{type:'li',props:{id:'li-1'}}] }`.
- **Ops:** `paneSubtreeRoot(def('doc-nav','app-graph',render), ctx, SIDEBAR_ZONE)`.
- **Expected:** the wrapped root carries `props.id = 'pane-doc-nav'` and
  `placement.targetPlacement = ['sidebar']`; the `type`/`content`/`children`
  from `render` are preserved.

### H9. `paneSubtreeRoot` id/placement enforcement (§5.8 9)
- **Setup:** a pane whose `render` sets its OWN `props.id` and `targetPlacement`.
- **Ops:** `paneSubtreeRoot(...)`.
- **Expected:** the wrapped root OVERWRITES them with `pane-<id>` and
  `[sidebarZone]`.

### H10. `assembleAppGraphEnvelope` happy (§5.8 10)
- **Setup:** `envelopeWithoutSidebar()` + one enabled `doc-nav` app-graph pane.
- **Ops:** `assembleAppGraphEnvelope({traversalEnvelope, registry, ctx})`.
- **Expected:** the merged envelope has the traversal content payloads + one
  pane ContentPayload (appended after), a `sidebar` container producer in the
  template (the HARD PRECONDITION), and `paneIds: ['doc-nav']`.

### H11. `assembleAppGraphEnvelope` multiple panes (§5.8 11)
- **Setup:** two enabled app-graph panes (`doc-nav`, `search`).
- **Ops:** `assembleAppGraphEnvelope(...)`.
- **Expected:** both pane ContentPayloads are present (`pane-doc-nav`,
  `pane-search`) and `paneIds` is `['doc-nav','search']` (registration order).

### H12. `assembleAppGraphEnvelope` disabled pane excluded (§5.8 12)
- **Setup:** a registered but DISABLED app-graph pane (`doc-nav`).
- **Ops:** `assembleAppGraphEnvelope(...)`.
- **Expected:** the pane is NOT in the envelope and NOT in `paneIds`
  (`paneIds: []`; the payload count is unchanged from the traversal envelope).

### H13. `assembleAppGraphEnvelope` operator pane excluded (§5.8 13)
- **Setup:** an ENABLED operator pane (`settings`).
- **Ops:** `assembleAppGraphEnvelope(...)`.
- **Expected:** the operator pane is NOT in the app-graph envelope (it never
  enters the app graph); `paneIds: []`; the envelope text does not contain
  `operator-pane-settings`.

### H14. `assembleAppGraphEnvelope` existing sidebar producer (§5.8 14)
- **Setup:** `envelopeWithSidebar()` (already carries a `sidebar` producer) + one
  enabled app-graph pane.
- **Ops:** `assembleAppGraphEnvelope(...)`.
- **Expected:** the existing `sidebar` producer is KEPT — exactly one, never
  duplicated.

### H15. `buildOperatorEnvelope` happy (§5.8 15)
- **Setup:** one enabled `settings` operator pane whose `render` returns a
  section (with its own `props.id`).
- **Ops:** `buildOperatorEnvelope(registry, ctx)`.
- **Expected:** the envelope has a template root `id: 'operator-panes'` with the
  pane section as a family child (`props.id` FORCED to `operator-pane-settings`),
  `content: []`, NO `targetPlacement` on the root or the section, and
  `clientConfig: { runInstantiation:true, runRendering:true }`.

### H16. `buildOperatorEnvelope` disabled operator pane excluded (§5.8 16)
- **Setup:** a registered but DISABLED `settings` pane.
- **Ops:** `buildOperatorEnvelope(registry, ctx)`.
- **Expected:** the operator envelope's template root has NO children (the pane
  is not mounted).

### H17. `doc-nav` happy (§5.8 17)
- **Setup:** a store with two `doc-head` edges (doc-a, doc-b, sorted targets),
  `currentDocumentId: 'doc-b'`.
- **Ops:** `docNavContent(ctx)`.
- **Expected:** a `ul` with two `li` document entries sorted by root id ascending
  (doc-a, doc-b); each `li` carries `data-document-id`; the current document's
  `li` carries `data-current: 'true'`.

### H18. `doc-nav` empty store (§5.8 18)
- **Ops:** `docNavContent(ctx)` with an empty store.
- **Expected:** a single `p` with content `(no documents)` — no throw.

### H19. `crosslinks` happy (§5.8 19)
- **Setup:** `currentNodeId: 'n1'`, `crosslinks: [cl1 n1→n9]`, and a `BacklinkResult`
  with `crosslinkBacklinks: [b1 n2→n1 cross-document]` + `crosslinkOutlinks:
  [o1 n1→n3 intra-document]`.
- **Ops:** `crosslinksContent(ctx, result)`.
- **Expected:** two `section`s — "Outgoing crosslinks" (one `li` per
  `ctx.crosslinks` with `data-target`) and "Backlinks / outlinks" (one `li` per
  `crosslinkBacklinks` + per `crosslinkOutlinks`, each carrying
  `data-source`/`data-target`/`data-scope`).

### H20. `crosslinks` no current node (§5.8 20)
- **Setup:** `currentNodeId: null`, non-empty `crosslinks`.
- **Ops:** `crosslinksContent(ctx, null)`.
- **Expected:** the pane shows the outgoing crosslinks only (one `li`); the
  backlink/outlink list is empty; the enumeration is skipped, no throw.

### H21. `search` happy (§5.8 21)
- **Setup:** a `RagQueryResult` with `ranked: [{nodeId:'n1',score:0.9},
  {nodeId:'n2',score:0.5}]`.
- **Ops:** `searchContent(ctx, result)`.
- **Expected:** a `pane-search-input` `input` + one `li` per `ranked` entry, each
  carrying `data-node-id` and the score.

### H22. App-graph pane MCP-visible (equivalence, structural) (§5.8 22)
- **Setup:** one enabled app-graph pane, `envelopeWithoutSidebar()`.
- **Ops:** `assembleAppGraphEnvelope(...)`; inspect the returned envelope.
- **Expected:** the pane-inclusive envelope carries the pane content root
  (`pane-doc-nav`) in its `content` — the exact payload `get_rendered_html`/
  `get_markdown`/`list_targets`/`get_node_state`/`provident.dispatch` read from
  the app Runtime (§5.6). The MCP-visible equivalence of the FULL Runtime load
  (get_rendered_html vs the UI's `renderedHtmlResult`) is a renderer-surface
  behavior — the assembly guarantee above is its node-testable precondition
  (see test-authoring note).

### H23. Operator settings isolated (structural) (§5.8 23)
- **Setup:** an ENABLED `settings` operator pane.
- **Ops:** `assembleAppGraphEnvelope(...)` (app graph) AND `buildOperatorEnvelope(...)`
  (operator scope) — the two assemblies.
- **Expected:** the settings pane's content appears ONLY in the operator envelope
  (template root `operator-panes`), NEVER in the app-graph envelope (H13) — so
  the app-graph endpoints (`list_targets`/`get_rendered_html`/`get_markdown`/
  `get_node_state`/`dispatch`) read only the app Runtime and cannot reach it
  (fail-closed). The full isolated-`createIsolatedScope()` mount is a
  renderer-surface concern (mirrors `SecurePanels`); the assembly-level seam is
  the node-testable guarantee (see test-authoring note).

### H24. Re-traversal keeps panes MCP-visible (§5.8 24)
- **Setup:** an enabled `doc-nav` app-graph pane; a one-document store.
- **Ops:** traverse + assemble → mutate the store (add a second `doc-head` edge
  → a second document) → re-traverse + re-assemble.
- **Expected:** the enabled app-graph pane is STILL in the re-assembled
  pane-inclusive envelope (`paneIds` still `['doc-nav']`), and its `data-*`
  payload is re-materialized from the CURRENT store (the doc-nav `ul` now lists
  two documents). A `rag-store-changed` re-traversal therefore keeps the panes
  MCP-visible.

### H25. Form-control editing integration (read-only classification) (§5.8 25)
- **Setup:** the three app-graph panes (`doc-nav` via `docNavContent`,
  `crosslinks` via `crosslinksContent`, `search` via `searchContent`).
- **Ops:** assemble all three into the pane-inclusive envelope; stringify it.
- **Expected:** NONE of the three app-graph panes binds an editable RAG control —
  the envelope contains no `textarea`, `edit-commit`, `onInput`, or `onBlur`
  (all three are read-only; the settings pane's operator edits commit via the
  IPC bridge, never the RAG `edit.*` path — §5.4).

---

## B. §5.9 Fail-states (15 node-tested)

### F1. `register` duplicate id (§5.9 1)
- **Ops:** register `doc-nav` twice.
- **Expected:** the second throws `Error('pane registry: duplicate id "doc-nav"')`.

### F2. `register` null/undefined def (§5.9 2)
- **Ops:** `register(null)` / `register(undefined)`.
- **Expected:** each throws `Error('pane registry: definition required')`.

### F3. `register` empty/non-string id (§5.9 3)
- **Ops:** `register` with `id:''` and `id:42`.
- **Expected:** each throws `Error('pane registry: id must be a non-empty string')`.

### F4. `register` non-string/empty title (§5.9 4)
- **Ops:** `register` with `title:''` and `title:7`.
- **Expected:** each throws `Error('pane registry: title must be a non-empty string')`.

### F5. `register` invalid scope (§5.9 5)
- **Ops:** `register` with `scope:'bogus'`.
- **Expected:** throws `Error('pane registry: invalid scope "bogus"')`.

### F6. `register` non-function render (§5.9 6)
- **Ops:** `register` with `render:'nope'`.
- **Expected:** throws `Error('pane registry: render must be a function')`.

### F7. `enable`/`disable`/`setEnabled` unknown id (§5.9 7)
- **Ops:** `enable('nope')`, `disable('nope')`, `setEnabled('nope', true)`.
- **Expected:** each throws `Error('pane registry: unknown pane "nope"')`.

### F8. `onChanged` non-function (§5.9 8)
- **Ops:** `onChanged('nope')`.
- **Expected:** throws `Error('pane registry: onChanged requires a callback')`.

### F9. `paneSubtreeRoot` null/undefined def/ctx or empty sidebarZone (§5.9 9)
- **Ops:** `paneSubtreeRoot(null, ctx, zone)`, `paneSubtreeRoot(def, null, zone)`,
  `paneSubtreeRoot(def, ctx, '')`.
- **Expected:** each throws `Error('paneSubtreeRoot: def/ctx/sidebarZone required')`.

### F10. `paneSubtreeRoot` render returns nothing (§5.9 10)
- **Ops:** a pane whose `render` returns `null`.
- **Expected:** throws
  `Error('paneSubtreeRoot: pane "doc-nav" render returned nothing')`.

### F11. `assembleAppGraphEnvelope` null/undefined input/registry/ctx/traversalEnvelope (§5.9 11)
- **Ops:** `assembleAppGraphEnvelope(null)` and the variants with a null
  `registry`/`ctx`/`traversalEnvelope`.
- **Expected:** each throws
  `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')`.

### F12. `assembleAppGraphEnvelope` a pane whose `paneSubtreeRoot` throws (§5.9 12)
- **Setup:** an enabled app-graph pane whose `render` returns `null`.
- **Ops:** `assembleAppGraphEnvelope(...)`.
- **Expected:** the throw PROPAGATES
  (`'paneSubtreeRoot: pane "doc-nav" render returned nothing'`) — a pane that
  cannot be authored is a caller error, never a silent skip.

### F13. `buildOperatorEnvelope` null/undefined registry/ctx (§5.9 13)
- **Ops:** `buildOperatorEnvelope(null, ctx)` / `(registry, null)`.
- **Expected:** each throws `Error('buildOperatorEnvelope: registry/ctx required')`.

### F14. `buildOperatorEnvelope` operator pane render returns nothing (§5.9 14)
- **Setup:** an enabled `settings` pane whose `render` returns `null`.
- **Ops:** `buildOperatorEnvelope(registry, ctx)`.
- **Expected:** throws
  `Error('buildOperatorEnvelope: operator pane "settings" render returned nothing')`.

### F17. `rag-backlinks` IPC with a null store (§5.9 17)
- **Ops:** `handleRagBacklinksIpc(null, { nodeId:'x' })`; plus
  `crosslinksContent(ctx, null)` with a non-null `currentNodeId`.
- **Expected:** the IPC throws
  `Error('rag.backlinks: no rag store configured')` (Unit G §5.4 — the SAME
  fail-state the MCP `rag.backlinks` tool throws); the crosslinks pane surfaces
  the failed/absent enumeration as an EMPTY list (`(none)` state), never a
  crash.

### F15/F16 (renderer-surface). `dispatch`/`get_node_state` on a settings pane node → fail-closed (§5.9 15-16)
- **Structural guarantee (node-tested via H13/H23):** the settings (operator)
  pane NEVER enters the app-graph envelope — so a `dispatch` or `get_node_state`
  on a settings pane node resolves against the app Runtime and finds no such
  node → the existing `unresolved target` throw (fail-closed). The actual
  `dispatch`/`get_node_state` call is a renderer-surface behavior, not
  node-testable in the pure modules (see test-authoring note).

### F18 (renderer-surface). `rag-query` IPC with an empty query (§5.9 18)
- **Behavior (renderer-surface):** the search pane's submit handler does NOT
  send the `rag-query` IPC for an empty query (it does nothing); an invalid
  query would reject cleanly with
  `Error('rag.query: query must be a non-empty string')` (Unit E §5.7). The
  submit handler is a browser-entry host body, not node-testable in the pure
  modules (see test-authoring note).

---

## C. §5.10 Census / numeric claims (13 node-tested)

### C1. Pane scopes — 2
- **Expected:** exactly `app-graph` and `operator`.

### C2. Concrete panes — 4
- **Expected:** `doc-nav`, `crosslinks`, `search` (app-graph) + `settings`
  (operator) — 4 registered panes total.

### C3. App-graph panes — 3 (MCP-visible)
- **Expected:** `listByScope('app-graph')` has 3 entries.

### C4. Operator panes — 1 (isolated, NOT MCP-visible)
- **Expected:** `listByScope('operator')` has 1 entry (`settings`).

### C5. Registry methods — 9
- **Expected:** `register`, `get`, `list`, `listByScope`, `isEnabled`, `enable`,
  `disable`, `setEnabled`, `onChanged` are all functions on the registry.

### C6. `PaneDefinition` fields — 4
- **Expected:** `id`, `title`, `scope`, `render`.

### C7. `PaneContext` fields — 5
- **Expected:** `snapshot`, `currentDocumentId`, `currentNodeId`, `backRefs`,
  `crosslinks`.

### C8. Assembly functions — 3
- **Expected:** `paneSubtreeRoot`, `assembleAppGraphEnvelope`,
  `buildOperatorEnvelope` are all functions.

### C9. Sidebar zone — 1 constant
- **Expected:** `SIDEBAR_ZONE === 'sidebar'`.

### C10. `AppGraphAssemblyResult` fields — 2
- **Expected:** `envelope`, `paneIds`.

### C11. Exactly one `sidebar` container producer per load (never duplicated)
- **Ops:** assemble over `envelopeWithoutSidebar()` AND `envelopeWithSidebar()`.
- **Expected:** both yield exactly one `sidebar` container producer in the
  template root's children.

### C12. IPC surfaces consumed (all pre-existing) — no new channel
- **Expected:** `IPC_RAG_SNAPSHOT === 'provident:rag-snapshot'` (doc-nav),
  `IPC_RAG_BACKLINKS === 'provident:rag-backlinks'` (crosslinks),
  `IPC_RAG_QUERY === 'provident:rag-query'` (search) — all pre-existing; the
  settings pane uses the operator bridge `window.provident.*`. No new IPC
  channel is required by this unit.

### C13. The three app-graph panes are read-only (no editable RAG control bound)
- **Expected:** the assembled app-graph envelope (doc-nav/crosslinks/search)
  contains no `textarea`/`edit-commit`/`onInput`/`onBlur` — all three are
  read-only; the settings pane is the one operator-editable pane, committing via
  the IPC bridge, never the RAG `edit.*` path (§5.4).

---

## D. §3a Adversarial findings (host, fixed + regression-tested) — 5 node-tested

### D1 (H1). Data-flow helpers survive a null store/ctx
- **Ops:** `deriveDocNavDocuments(null)`, `docNavContent(null)`,
  `crosslinksContent(null, null)`.
- **Expected:** the empty state — `[]`, `(no documents)`, and the empty-state
  `section`s — with NO `TypeError` (the §5.3 helpers no longer dereference
  `ctx.snapshot.nodes/.edges`/`ctx.crosslinks` unconditionally).

### D2 (H2). `assembleAppGraphEnvelope` on a malformed traversal envelope
- **Setup:** an envelope with `template.root == null`.
- **Ops:** `assembleAppGraphEnvelope({ traversalEnvelope: malformed, ... })`.
- **Expected:** the documented guard error
  `'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required'` —
  NOT a raw `TypeError` from dereferencing `template.root.children`.

### D3 (H3). `crosslinksContent` coerces a partial result
- **Setup:** a non-null but partial `BacklinkResult` (missing
  `crosslinkBacklinks`/`crosslinkOutlinks`).
- **Ops:** `crosslinksContent(ctx, partial)`.
- **Expected:** the missing arrays are coerced to `[]` (`...([] ?? [])`), the
  backlink list is empty, NO `... is not iterable` throw.

### D4 (H4). `onChanged` subscriber isolation
- **Ops:** (a) a subscriber that throws, then a second subscriber — enable;
  (b) a self-unsubscribing subscriber, then a second subscriber — enable.
- **Expected:** in both cases the later subscriber still receives the change —
  a throwing or self-unsubscribing subscriber cannot starve the rest (the loop
  iterates a snapshot copy; each `cb(change)` is wrapped in try/catch).

### D5 (H6). `docNavContent` dedupes duplicate doc-head targets
- **Setup:** a corrupted store with TWO `doc-head` edges to the SAME document
  (`doc-a`), from different source nodes.
- **Ops:** `deriveDocNavDocuments(snapshot)` + `docNavContent(ctx)`.
- **Expected:** ONE document entry (`doc-a`, first head wins) and ONE `li` —
  no duplicate `data-document-id` entries.

---

## E. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `createPaneRegistry` + `register` happy | ✅ PASS |
| H2 | `register` + `listByScope` | ✅ PASS |
| H3 | `enable` happy | ✅ PASS |
| H4 | `setEnabled` no-op on same state | ✅ PASS |
| H5 | `disable` happy | ✅ PASS |
| H6 | `onChanged` unsubscribe | ✅ PASS |
| H7 | `isEnabled` unknown id | ✅ PASS |
| H8 | `paneSubtreeRoot` happy | ✅ PASS |
| H9 | `paneSubtreeRoot` id/placement enforcement | ✅ PASS |
| H10 | `assembleAppGraphEnvelope` happy | ✅ PASS |
| H11 | `assembleAppGraphEnvelope` multiple panes | ✅ PASS |
| H12 | `assembleAppGraphEnvelope` disabled pane excluded | ✅ PASS |
| H13 | `assembleAppGraphEnvelope` operator pane excluded | ✅ PASS |
| H14 | `assembleAppGraphEnvelope` existing sidebar producer | ✅ PASS |
| H15 | `buildOperatorEnvelope` happy | ✅ PASS |
| H16 | `buildOperatorEnvelope` disabled operator pane excluded | ✅ PASS |
| H17 | `doc-nav` happy | ✅ PASS |
| H18 | `doc-nav` empty store | ✅ PASS |
| H19 | `crosslinks` happy | ✅ PASS |
| H20 | `crosslinks` no current node | ✅ PASS |
| H21 | `search` happy | ✅ PASS |
| H22 | App-graph pane MCP-visible (structural) | ✅ PASS |
| H23 | Operator settings isolated (structural) | ✅ PASS |
| H24 | Re-traversal keeps panes MCP-visible | ✅ PASS |
| H25 | Form-control editing integration (read-only) | ✅ PASS |
| F1 | `register` duplicate id | ✅ PASS |
| F2 | `register` null/undefined def | ✅ PASS |
| F3 | `register` empty/non-string id | ✅ PASS |
| F4 | `register` non-string/empty title | ✅ PASS |
| F5 | `register` invalid scope | ✅ PASS |
| F6 | `register` non-function render | ✅ PASS |
| F7 | `enable`/`disable`/`setEnabled` unknown id | ✅ PASS |
| F8 | `onChanged` non-function | ✅ PASS |
| F9 | `paneSubtreeRoot` null/undefined def/ctx or empty sidebarZone | ✅ PASS |
| F10 | `paneSubtreeRoot` render returns nothing | ✅ PASS |
| F11 | `assembleAppGraphEnvelope` null/undefined input | ✅ PASS |
| F12 | `assembleAppGraphEnvelope` a pane that throws → propagates | ✅ PASS |
| F13 | `buildOperatorEnvelope` null/undefined registry/ctx | ✅ PASS |
| F14 | `buildOperatorEnvelope` operator render returns nothing | ✅ PASS |
| F15 | `dispatch` on a settings node → unresolved (structural) | ✅ PASS |
| F16 | `get_node_state` on a settings node → unresolved (structural) | ✅ PASS |
| F17 | `rag-backlinks` null store → documented throw + empty pane | ✅ PASS |
| F18 | `rag-query` empty query → no IPC (renderer-surface) | ✅ PASS |
| C1 | Pane scopes (2) | ✅ PASS |
| C2 | Concrete panes (4) | ✅ PASS |
| C3 | App-graph panes (3) | ✅ PASS |
| C4 | Operator panes (1) | ✅ PASS |
| C5 | Registry methods (9) | ✅ PASS |
| C6 | `PaneDefinition` fields (4) | ✅ PASS |
| C7 | `PaneContext` fields (5) | ✅ PASS |
| C8 | Assembly functions (3) | ✅ PASS |
| C9 | Sidebar zone constant (1) | ✅ PASS |
| C10 | `AppGraphAssemblyResult` fields (2) | ✅ PASS |
| C11 | One `sidebar` producer per load | ✅ PASS |
| C12 | IPC surfaces consumed (pre-existing) | ✅ PASS |
| C13 | App-graph panes read-only | ✅ PASS |
| D1 | (H1) Data-flow helpers null-safe | ✅ PASS |
| D2 | (H2) Malformed traversal envelope → documented guard | ✅ PASS |
| D3 | (H3) `crosslinksContent` partial-result coercion | ✅ PASS |
| D4 | (H4) `onChanged` subscriber isolation | ✅ PASS |
| D5 | (H6) `docNavContent` doc-head dedupe | ✅ PASS |

**Run summary:** 61 scenarios — 61 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-h-sidebar-panes.md` §5.1–§5.11 + §3a passed against the live
  modules. The `PaneRegistry` API + its enabled-state semantics + the
  registered-DISABLED default (§5.1), the assembly module `SIDEBAR_ZONE`/
  `paneSubtreeRoot`/`assembleAppGraphEnvelope`/`buildOperatorEnvelope` (the HARD
  PRECONDITION sidebar producer, operator-pane exclusion, id/placement forcing,
  operator-envelope shape, §5.2), the app-graph pane data-flow helpers
  `deriveDocNavDocuments`/`docNavContent`/`crosslinksContent`/`searchContent`
  (§5.3), the `rag-backlinks` null-store fail-state (§5.9 17), all 23 node-tested
  happy paths (§5.8), all 15 node-tested fail-states (§5.9), every census claim
  (§5.10), and the §3a adversarial hardening (H1–H4, H6) match the spec. No
  spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H22/H23 and §5.9 15–16 (renderer-surface MCP/UI + isolation).** The full
  app-Runtime load (`loadAppGraph`) and the isolated-`createIsolatedScope()`
  operator mount (`mountOperator`) are browser-entry renderer constructs, not
  node-testable in the pure registry/assembly modules. The node-testable
  guarantees that make them hold are asserted directly: (a) the assembled
  pane-inclusive envelope carries the enabled app-graph pane content roots (the
  exact payload the app Runtime renders → MCP-visible, §5.8 22); (b) the
  operator `settings` pane NEVER enters the app-graph envelope (H13) and lives
  only in `buildOperatorEnvelope`'s separate envelope (H15), so `dispatch`/
  `get_node_state`/`list_targets` against the app Runtime cannot resolve it
  (fail-closed, §5.8 23 / §5.9 15–16). The equivalence of the rendered output
  through the MCP surface vs the UI (`renderedHtmlResult`) is the renderer
  Runtime's contract, verified by code review / the e2e battery per the Unit G
  convention.
- **F18 (search empty-query no-IPC).** The search pane's submit handler is a
  host-authored browser-entry body (the `pane-search-submit` handler in
  `SidebarPanes`), not node-testable. The spec's fail-state is that the handler
  does NOT send the `rag-query` IPC for an empty query and that an invalid
  query rejects cleanly with Unit E's `'rag.query: query must be a non-empty
  string'`; both are renderer-surface. The node-testable surface (`searchContent`
  renders the input + results; H21) is asserted.
- **F17 (rag-backlinks null store).** Verified node-testably via
  `handleRagBacklinksIpc(null, ...)` (the SAME fail-state as the MCP tool,
  `'rag.backlinks: no rag store configured'`) plus the crosslinks pane's
  null-result empty-enumeration rendering — the pane surfaces the failed
  enumeration as an empty list, never a crash.
- **§3a H5.** The spec's §3a lists H1–H4 and H6 (no H5); the renderer
  `mountOperator` isolated-GraphScope concern is noted as a renderer-surface
  host concern landing with the UI mount, consistent with the spec's §3a.
