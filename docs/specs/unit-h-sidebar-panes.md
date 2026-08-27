# Spec — Unit H: Sidebar Panes

- **Status:** SPEC (later unit H). Gate reference:
  `docs/specs/astrographer-review.md` §4 item 8 (Sidebar panes — "a **host-side
  pane registry** with app-graph panes MCP-visible and operator-only panes
  (settings) in an isolated `GraphScope`, never MCP-visible"), §7 scope item 8
  (the same, in the concrete scope list), §8.2 (MCP/UI equivalence — a BINDING
  constraint on every unit that touches rendering), §9.2.6
  (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS — the `rag`/`edit` groups
  are the agent-visible read/mutate surface; the settings pane is NOT exposed
  to them), §9.2.2 (back-reference carrier), §13 (cross-document shared nodes).
  Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **RAG-EDIT-MCP-GROUPS**, **SUBTREE-OWNERSHIP**,
  **FORM-CONTROL-EDITING**. New decisions pinned by this spec (added to
  `docs/decisions.md` when the unit lands): **PANE-REGISTRY** (a host-side
  `PaneRegistry` with `register`/`list`/`enable`/`disable`), **PANE-PROVIDENT-AUTHORING**
  (every pane is authored as provident-ssr data and rendered through the
  producing graph), **APP-GRAPH-PANES-MCP-VISIBLE** (document-navigation +
  crosslink/backlink + search panes render in the app Runtime graph, so the MCP
  endpoints see them), **OPERATOR-ISOLATED-GRAPHSCOPE** (the settings pane
  renders in an isolated `createIsolatedScope()` `GraphScope`, never MCP-visible).
- **Scope:** the host-side pane registry (the `PaneRegistry` +
  `PaneDefinition` shape), how each pane is authored as provident-ssr data and
  rendered through the producing graph, the app-graph panes (document
  navigation + crosslink/backlink + search) being MCP-visible, the operator-only
  settings pane living in an isolated `GraphScope` (never MCP-visible, never
  exposed to the `rag`/`edit` groups), and each pane's data flow (read-only vs
  the form-control editing model). This unit consumes Units A (RAG store — the
  document list), C (the traversal envelope + back-reference map), D (the
  form-control editing model), E (the `rag-query` IPC for the search pane), and
  G (the `crosslinks` wiring + the `rag-backlinks` IPC for the crosslink/backlink
  pane). This unit does NOT implement the crosslink `Link`/`Anchor` DOM
  materialization (the Unit G consumer — the hover-preview pane is a SPECULATIVE
  feature, `docs/pending.md`); it defines the pane registry + the app-graph-vs-
  operator scope split the panes render in.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/renderer/pane-registry.ts`
  and `src/renderer/pane-graph.ts` (and the amended
  `src/renderer/renderer.ts` + the new `src/renderer/sidebar-panes.ts` +
  `src/shared/types.ts`) from §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. **A host-side pane registry** of sidebar panes (document navigation,
   crosslink/backlink visibility, search, settings, etc.). Pin the registry API
   (register/list/enable/disable), the pane definition shape, the pane lifecycle,
   and how each pane is authored as provident-rendered content.
2. **App-graph panes MCP-visible.** The sidebar panes that are part of the app
   graph (document navigation, crosslink/backlink visibility, search) MUST be
   visible to the MCP endpoints (`get_rendered_html`/`get_markdown`/
   `provident.dispatch`/`list_targets`) — they render through the producing
   graph (the app Runtime). Pin how they are authored into the app graph.
3. **Operator-only panes (settings) in an isolated `GraphScope`.** The settings
   pane is an OPERATOR-ONLY pane — it MUST NOT be MCP-visible (not in the app
   graph). It lives in an ISOLATED `GraphScope` (a separate
   `createIsolatedScope()` scope, not exposed to the MCP `rag`/`edit` groups,
   not exposed to the app-graph read/dispatch endpoints). Pin the isolated
   `GraphScope` for the settings pane, and why it is isolated (operator-only
   content is not part of the agent-visible app graph).
4. **Integration with earlier units.** Unit H consumes:
   - Unit G's crosslink/backlink output (the `crosslinks: CrosslinkWiring[]`
     traversal output + the backlink enumeration via the `rag-backlinks` IPC)
     for the crosslink/backlink visibility pane.
   - Unit E's retrieval (`rag.query`/`rag-query`) for the search pane.
   - Unit D's editing path — the panes are provident-rendered and editable (or
     read-only) per the form-control editing model.
   - Unit A's RAG store — the document navigation pane reads the store's
     documents (via the `rag-snapshot` IPC).
5. **The pane content + the render.** Each pane is authored as provident-ssr
   data (a `LegacyNodeData` content root/section) rendered through the producing
   graph. Pin the render wiring (app-graph assembly + the isolated operator
   scope mount).

## 2. Feasibility verdict

**Feasible — grounded in the app Runtime's producing graph (MCP-visible by
construction) and the `createIsolatedScope()` GraphScope pattern the shell
already uses for operator-only panes.**

- **App-graph panes MCP-visible:** the app Runtime (`src/renderer/runtime.ts`)
  renders a `LegacyInitialData` envelope into `#app`; the MCP endpoints
  (`get_rendered_html`/`get_markdown`/`list_targets`/`get_node_state`/
  `provident.dispatch`) read THAT Runtime (via `RenderedHtmlResult`/
  `MarkdownResult`/`ListTargetsResult`/`NodeStateResult`/`DispatchResult` —
  `src/shared/types.ts`). Any provident subtree authored INTO the envelope the
  app Runtime renders is MCP-visible by construction. The app-graph panes are
  authored as additional content roots in the pane-inclusive envelope.
- **Operator-only settings pane in an isolated `GraphScope`:** the engine's
  `createIsolatedScope()` (`provident-ssr/core/registry.d.ts` D1/D8) creates a
  fully disjoint per-graph registry scope: a graph rendered under it "never
  resolves, compiles, or destroys another graph's handler defs, nodes, or
  userData". The shell ALREADY uses this exact pattern for the operator-only
  Security/Debug/Module panes (`src/renderer/secure-panels.ts` — `SecurePanels`
  creates its OWN `createIsolatedScope()` + own `Supervisor` + own `DomAdapter`
  → own mount, handlers call the IPC bridge, never an MCP tool; the app
  Runtime's dispatch/rendered endpoints never see it). The settings pane is a
  second isolated scope built on the same pattern.
- **Pane registry:** a host-side registry is a pure data structure over
  `PaneDefinition` records + an enabled-state map — no engine primitive needed,
  fully testable in isolation.
- **Pane authoring as provident-ssr data:** every pane's content is authored as
  a `LegacyNodeData` subtree (the same envelope-data authoring the traversal and
  the demo use). App-graph panes attach via `placement.targetPlacement` into a
  `sidebar` container zone (the Unit C HARD PRECONDITION — every targeted zone
  needs a `container`-role producer); operator panes are family children of an
  isolated-scope template root (the `SecurePanels.paneEnvelope` pattern).

No engine/foundation gap blocks this unit. The pane registry, the app-graph
assembly, the operator isolated-scope mount, and the pane data flows are all
project-specific (compose the app Runtime + `createIsolatedScope()` + the
existing IPC bridge). ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is SHELVED
2026-08-26 (markdown is export-only; the host-side line→node map covers it — see
`docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Pane registry (`PaneRegistry` + `PaneDefinition`) | Project-specific (a pure data structure) | Low cost; the host-side pane registry the review pins. |
| Pane authoring as provident-ssr data | Project-specific (composes the envelope-data authoring) | Low cost; respects the all-UI-via-provident constraint. |
| App-graph assembly (traversal envelope + enabled app-graph panes) | Project-specific (merges content roots into the app Runtime envelope) | Medium cost; makes the panes MCP-visible by construction. |
| Operator isolated-scope settings pane | Project-specific (composes `createIsolatedScope()` + own Supervisor/DomAdapter, mirroring `SecurePanels`) | Medium cost; keeps the settings pane off the agent-visible surfaces. |
| Per-pane data flow (snapshot/backlinks/query/edit) | Project-specific (reuses the Unit A/E/G IPC bridge) | Low cost; reuses the existing `rag-snapshot`/`rag-backlinks`/`rag-query`/`edit-commit` IPCs. |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings (host findings, fixed + regression-tested)

Post-green adversarial pass (RCA-3) — recorded here when the unit lands. All
findings are expected to be HOST (this repo's `src/`); none are package/upstream
findings (the `createIsolatedScope()` mechanism is an engine primitive and is NOT
patched). Any host finding is fixed + regression-tested; the findings + the
regression-test count are recorded in this section when the greens land.

## 4. Design decisions pinned by this spec

- **PANE-REGISTRY:** a host-side `PaneRegistry` is the single authority over
  which sidebar panes exist and which are enabled. `PaneDefinition` =
  `{ id, title, scope: 'app-graph' | 'operator', render }`. The registry
  provides `register`/`get`/`list`/`listByScope`/`isEnabled`/`enable`/`disable`/
  `setEnabled`/`onChanged`. Newly registered panes are DISABLED; the host
  enables the panes it wants (the app-graph panes must be enabled to be
  MCP-visible).
- **PANE-PROVIDENT-AUTHORING:** every pane's content is authored as provident-ssr
  data — a `LegacyNodeData` subtree returned by the pane's `render(ctx)` — and
  rendered through the producing graph. A pane rendered outside the provident
  graph is a review finding (the project-wide constraint, AGENTS.md).
- **APP-GRAPH-PANES-MCP-VISIBLE:** the document-navigation, crosslink/backlink,
  and search panes are `scope: 'app-graph'`. Their `render(ctx)` subtrees are
  authored into the pane-inclusive envelope the app Runtime renders, so
  `get_rendered_html`/`get_markdown`/`list_targets`/`get_node_state`/
  `provident.dispatch` see them (the §8.2 BINDING equivalence: the app-graph
  panes are part of the agent-visible rendering).
- **OPERATOR-ISOLATED-GRAPHSCOPE:** the settings pane is `scope: 'operator'`. It
  renders in its OWN `createIsolatedScope()` `GraphScope` (own `Supervisor` +
  own `DomAdapter` → own mount, mirroring `SecurePanels`), disjoint from the app
  graph. It is NOT MCP-visible and NOT exposed to the `rag`/`edit` groups — an
  agent cannot read it, list it as a target, dispatch on it, or mutate it.
- **FORM-CONTROL-EDITING-INTEGRATION:** an app-graph pane that renders editable
  RAG content binds its controls through the Unit D form-control editing model
  (a textarea, `markDirty`/`commit` via the back-reference → `edit-commit` IPC →
  `setContent` → re-traversal). The concrete panes in this unit are classified
  read-only (doc-nav, crosslinks, search) or operator-editable (settings, which
  commits via the IPC bridge — never the RAG edit path).
- **SINGLE-WRITER-STORE (consumed):** every pane's read of the store goes
  through the existing IPC bridge (`rag-snapshot`/`rag-backlinks`/`rag-query`);
  every pane's write (an editable pane) routes through the main-process store's
  single-writer queue (via `edit-commit`). No renderer-side RAG-store writes.

## 5. The exhaustive contract

### 5.1 The pane registry (`src/renderer/pane-registry.ts`)

The pane registry is a PURE module (no Electron) — importable in main and
renderer, testable in isolation. It holds the `PaneDefinition` records + an
enabled-state map.

```ts
// src/renderer/pane-registry.ts (project-specific; pure, no Electron).

/** The scope of a sidebar pane. 'app-graph' panes render in the app Runtime
 *  graph → MCP-visible. 'operator' panes render in an isolated GraphScope →
 *  NOT MCP-visible (operator-only content). */
export type PaneScope = 'app-graph' | 'operator'

/** The host-provided data a pane's render reads. The registry treats this as
 *  opaque (a type parameter defaulting to PaneContext); the host (SidebarPanes)
 *  supplies it. */
export interface PaneContext {
  /** The current RAG store snapshot (Unit A §5.2 — nodes + edges), fetched over
   *  the `rag-snapshot` IPC. The doc-nav pane derives the document list from the
   *  `doc-head` edges. */
  snapshot: { nodes: RagNode[]; edges: RagEdge[] }
  /** The current document root id (the single-document view). null if none. */
  currentDocumentId: string | null
  /** The currently-selected RAG node id (the crosslink pane's focus node). */
  currentNodeId: string | null
  /** The back-reference map (Unit C §5.3 — the SOLE authoritative carrier). An
   *  editable pane binds its controls via it. */
  backRefs: Map<string, string[]>
  /** The traversal's crosslink wiring (Unit G §5.2 — the outgoing crosslinks of
   *  the current materialization). */
  crosslinks: CrosslinkWiring[]
}

/** A sidebar pane. `render` authors the pane's content as provident-ssr data.
 *  For an 'app-graph' pane it returns a content ROOT (a LegacyNodeData that the
 *  assembler attaches into the sidebar zone — §5.2); for an 'operator' pane it
 *  returns a section (a LegacyNodeData mounted in the isolated-scope
 *  envelope — §5.4). */
export interface PaneDefinition<C = PaneContext> {
  id: string
  title: string
  scope: PaneScope
  render: (ctx: C) => LegacyNodeData
}

/** One enabled-state change notification. */
export interface PaneChange {
  id: string
  enabled: boolean
}

export interface PaneRegistry {
  /** Register a pane. A newly registered pane is DISABLED. Throws on a
   *  duplicate id. */
  register(def: PaneDefinition): void
  /** Look up a pane by id. Returns undefined for an unknown id. */
  get(id: string): PaneDefinition | undefined
  /** All registered panes, in registration order. */
  list(): PaneDefinition[]
  /** The registered panes of one scope, in registration order. */
  listByScope(scope: PaneScope): PaneDefinition[]
  /** Whether a pane is enabled. Returns false for an unknown id. */
  isEnabled(id: string): boolean
  /** Enable a pane. Throws on an unknown id. Notifies onChanged subscribers. */
  enable(id: string): void
  /** Disable a pane. Throws on an unknown id. Notifies onChanged subscribers. */
  disable(id: string): void
  /** Set a pane's enabled state. Throws on an unknown id. Notifies onChanged
   *  subscribers only when the state actually changes. */
  setEnabled(id: string, enabled: boolean): void
  /** Subscribe to enabled-state changes. Returns an unsubscribe function. */
  onChanged(cb: (change: PaneChange) => void): () => void
}

export function createPaneRegistry(): PaneRegistry
```

**Return-shape / behavior rules:**

- `register(def)` adds the pane DISABLED (whether or not `def` is otherwise the
  same as an existing pane — the id is the identity). It throws on a
  `null`/`undefined` def, an empty/non-string `id`, a `title` that is not a
  non-empty string, a `scope` that is not `'app-graph'`/`'operator'`, or a
  `render` that is not a function.
- `get(id)` / `list()` / `listByScope(scope)` return the registered definitions
  (never a copy — the registry is read-only over its records; a caller must not
  mutate them). `listByScope` returns only the panes of the given scope.
- `isEnabled(id)` returns `false` for an unknown id (a safe default — an
  unknown pane is never visible).
- `enable(id)` / `disable(id)` / `setEnabled(id, bool)` throw on an unknown id.
  `setEnabled` to the CURRENT state is a no-op (does not notify); `enable` on an
  already-enabled pane is a no-op; `disable` on an already-disabled pane is a
  no-op.
- `onChanged(cb)` subscribes; the returned function unsubscribes. The callback
  is invoked SYNCHRONOUSLY on a state change with `{ id, enabled }`.
- **Pane lifecycle (pinned):** a pane is registered DISABLED, explicitly enabled
  by the host when it should be visible, and re-enabled/disabled by the operator
  or host. Enabling an 'app-graph' pane makes its subtree MCP-visible (it joins
  the app-graph envelope on the next assembly/re-render); disabling it removes
  it from the app graph. Enabling an 'operator' pane mounts it in the isolated
  scope; disabling it unmounts/removes it.

**Fail-states (TestWriter red set):**

- `register` with a duplicate `id` → throws `Error('pane registry: duplicate id "X"')`.
- `register` with a `null`/`undefined` def → throws
  `Error('pane registry: definition required')`.
- `register` with an empty/non-string `id` → throws
  `Error('pane registry: id must be a non-empty string')`.
- `register` with a non-string/empty `title` → throws
  `Error('pane registry: title must be a non-empty string')`.
- `register` with an invalid `scope` (not `'app-graph'`/`'operator'`) → throws
  `Error('pane registry: invalid scope "X"')`.
- `register` with a non-function `render` → throws
  `Error('pane registry: render must be a function')`.
- `enable`/`disable`/`setEnabled` on an unknown id → throws
  `Error('pane registry: unknown pane "X"')`.
- `onChanged` with a non-function `cb` → throws
  `Error('pane registry: onChanged requires a callback')`.

### 5.2 Pane authoring as provident content + the assembly (`src/renderer/pane-graph.ts`)

Every pane's content is authored as provident-ssr data. The assembly module is a
PURE module (no Electron) that merges the Unit C traversal envelope with the
enabled app-graph panes (into the pane-inclusive app-graph envelope) and builds
the operator isolated-scope envelope.

```ts
// src/renderer/pane-graph.ts (project-specific; pure, no Electron).

/** The root-visible sidebar zone the app-graph panes attach into. The assembler
 *  MUST emit a `container`-role producer for this zone (the Unit C HARD
 *  PRECONDITION — a `targetPlacement` naming a zone with no container producer
 *  leaves the root `unplaced`, silently not render-eligible). */
export const SIDEBAR_ZONE = 'sidebar'

/** Wrap a pane's render output into a sidebar content root: enforce the stable
 *  pane id (`pane-<id>`) and the sidebar targetPlacement, OVERWRITING whatever
 *  `render` returned (so a pane cannot accidentally place itself elsewhere or
 *  drop its authored id). PURE. */
export function paneSubtreeRoot<C>(
  def: PaneDefinition<C>,
  ctx: C,
  sidebarZone: string,
): LegacyNodeData

export interface AppGraphAssemblyInput {
  /** The Unit C traversal envelope (the wiki content — buildTraversal's
   *  `TraversalResult.envelope`). */
  traversalEnvelope: LegacyInitialData
  /** The pane registry. The enabled app-graph panes are assembled in. */
  registry: PaneRegistry
  /** The pane data context (the host supplies it). */
  ctx: PaneContext
  /** The sidebar zone name (default SIDEBAR_ZONE). */
  sidebarZone?: string
}

export interface AppGraphAssemblyResult {
  /** The pane-inclusive envelope: the traversal content payloads + one
   *  ContentPayload per ENABLED app-graph pane, with a `sidebar` container
   *  producer in the template. Ready to load into the app Runtime. */
  envelope: LegacyInitialData
  /** The enabled app-graph pane ids included (in registration order). */
  paneIds: string[]
}

/** Assemble the pane-inclusive app-graph envelope from the traversal envelope
 *  + the enabled app-graph panes. PURE. */
export function assembleAppGraphEnvelope(input: AppGraphAssemblyInput): AppGraphAssemblyResult

/** Build the operator isolated-scope envelope from the enabled 'operator'
 *  panes (each `render(ctx)` → a section mounted as a family child of the
 *  template root). PURE. */
export function buildOperatorEnvelope(
  registry: PaneRegistry,
  ctx: PaneContext,
): LegacyInitialData
```

**`paneSubtreeRoot` behavior:**

- Calls `def.render(ctx)` to obtain the pane's content root.
- Returns a NEW `LegacyNodeData` root:
  `{ ...renderRoot, props: { ...renderRoot.props, id: 'pane-<id>' }, placement: { targetPlacement: [sidebarZone] } }`.
  The `props.id` is FORCED to `pane-<id>` (overwriting any id `render` set); the
  `targetPlacement` is FORCED to `[sidebarZone]` (overwriting any placement
  `render` set). The root's `type`, `content`, `children`, and the remaining
  `props` come from `render`.
- **Fail-states:** a `null`/`undefined` `def`, `ctx`, or an empty `sidebarZone`
  → throws `Error('paneSubtreeRoot: def/ctx/sidebarZone required')`. A `render`
  that returns `null`/`undefined` → throws `Error('paneSubtreeRoot: pane "<id>" render returned nothing')`.

**`assembleAppGraphEnvelope` behavior:**

1. Collects the ENABLED `'app-graph'` panes (`listByScope('app-graph')` filtered
   by `isEnabled`), in registration order. Operator panes are EXCLUDED (they
   never enter the app graph).
2. For each, calls `paneSubtreeRoot(def, ctx, sidebarZone)` → a sidebar content
   root; wraps it in a `ContentPayload` `{ content: [root] }`.
3. Merges the traversal envelope's `content` payloads + the pane ContentPayloads
   (panes appended after the traversal content).
4. Ensures the envelope template's root has a `container`-role producer for the
   `sidebarZone` (the HARD PRECONDITION). If the traversal envelope's template
   already carries one (a `placement.placementName: <sidebarZone>` node), it is
   kept; otherwise the assembler ADDS `{ type: 'div', props: { id: 'zone:<sidebarZone>' }, placement: { placementName: sidebarZone } }`
   to the template root's children. The assembler MUST NOT emit a pane
   `targetPlacement` naming a zone it does not also produce a container for.
5. Returns `{ envelope, paneIds }` (the enabled app-graph pane ids, in
   registration order).

- **MCP-visible by construction:** because the returned envelope is the one the
  app Runtime renders, every assembled app-graph pane's subtree is part of the
  app graph → `get_rendered_html`/`get_markdown`/`list_targets`/
  `get_node_state`/`provident.dispatch` see it (§5.6).
- **Fail-states:** a `null`/`undefined` `input`, `registry`, `ctx`, or
  `traversalEnvelope` → throws
  `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')`.
  A pane whose `paneSubtreeRoot` throws → the throw propagates (a pane that
  cannot be authored is a caller error, never a silent skip).

**`buildOperatorEnvelope` behavior:**

- Collects the ENABLED `'operator'` panes, in registration order.
- For each, calls `render(ctx)` → a section (a `LegacyNodeData`). Each section
  carries `props.id = 'operator-pane-<id>'` (FORCED, overwriting any id `render`
  set).
- Builds a template root `{ type: 'div', props: { id: 'operator-panes' }, children: [ ...sections ] }`
  with `content: []` and `clientConfig: { runInstantiation: true, runRendering: true }`.
- Returns the envelope. **No `targetPlacement`** — the sections are family
  children of the isolated-scope template root (the `SecurePanels.paneEnvelope`
  pattern), so they render WITHOUT placement into the isolated scope's own mount.
- **Fail-states:** a `null`/`undefined` `registry` or `ctx` → throws
  `Error('buildOperatorEnvelope: registry/ctx required')`. A pane whose `render`
  returns `null`/`undefined` → throws
  `Error('buildOperatorEnvelope: operator pane "<id>" render returned nothing')`.

### 5.3 The app-graph panes (MCP-visible)

The concrete `scope: 'app-graph'` panes. Their `render(ctx)` subtrees are
authored into the app-graph envelope (§5.2) → MCP-visible (§5.6).

| Pane id | Title | Scope | Data source | Editable? |
| --- | --- | --- | --- | --- |
| `doc-nav` | "Documents" | `app-graph` | `ctx.snapshot` (the Unit A store's `doc-head` edges) | read-only |
| `crosslinks` | "Links" | `app-graph` | `ctx.crosslinks` (Unit G wiring) + the `rag-backlinks` IPC (Unit G enumeration) | read-only |
| `search` | "Search" | `app-graph` | the `rag-query` IPC (Unit E retrieval) | read-only (the input is a UI control; it never edits the store) |

**The `doc-nav` pane (document navigation):**

- **Data:** the store's documents, derived from `ctx.snapshot.edges` where
  `edge.kind === 'doc-head'`. Each document = the `doc-head` edge's `target`
  (the document root id); its title = the `doc-head` edge's SOURCE node's
  `content` (the document head — from `ctx.snapshot.nodes`). Sorted by document
  root id (lexicographic ascending, deterministic).
- **Render:** a `ul` of `li` entries, one per document, each `li` carrying
  `props['data-document-id'] = <document root id>`. The current document's `li`
  carries `props['data-current'] = 'true'`. Empty store (no `doc-head` edges) →
  a single `p` with content `(no documents)`.
- **Selection:** clicking a document entry dispatches a `pane-doc-nav-select`
  event (a handler body that the host wires to a document-switch re-traversal —
  the single-document view's `documentIds` becomes `[<document root id>]`). The
  event target is the `li` by its authored `pane-doc-nav-<id>` id. **Read-only**
  (it never edits the RAG store).
- **MCP-visible:** the pane subtree (including each document `li` and its
  `data-*` props) is in the app graph — an agent can read it via
  `get_rendered_html`/`get_markdown` and dispatch the select event via
  `provident.dispatch`.

**The `crosslinks` pane (crosslink/backlink visibility):**

- **Data:** two sources, both read-only:
  - The outgoing crosslinks of the current materialization: `ctx.crosslinks`
    (the Unit G `CrosslinkWiring[]` — one entry per `crosslink` edge whose SOURCE
    is materialized).
  - The backlinks/outlinks of the CURRENT node (`ctx.currentNodeId`), fetched
    over the `rag-backlinks` IPC (`bridge.rag.backlinks(nodeId)` → the Unit G
    `BacklinkResult`). A `null` `currentNodeId` → the enumeration is skipped (the
    pane shows the outgoing crosslinks only).
- **Render:** two `section`s:
  - "Outgoing crosslinks": one `li` per `ctx.crosslinks` entry,
    `props['data-target'] = <targetRagNodeId>`. Empty → `(none)`.
  - "Backlinks / outlinks": one `li` per `crosslinkBacklinks` + one per
    `crosslinkOutlinks` (the Unit G subsets), each carrying
    `props['data-source']`/`props['data-target']` + `props['data-scope']` (the
    `LinkScope`: `cross-document`/`intra-document`/`unscoped`). Empty → `(none)`.
- **Read-only:** the pane only displays enumerated data; it never edits the
  store. The `Link`/`Anchor` DOM materialization of a crosslink (a source anchor
  on the source subtree root + a target anchor on the target subtree root) is
  the Unit G consumer renderer-surface — NOT this pane (the pane lists the
  enumeration; the graph-level `Link`/`Anchor` is a separate renderer concern;
  the hover-preview is a SPECULATIVE feature — `docs/pending.md`).
- **MCP-visible:** the pane subtree (the link list + its `data-*` props) is in
  the app graph — an agent can read the current document's crosslink/backlink
  census via `get_rendered_html`/`get_markdown`, and via `provident.dispatch` can
  drive the `rag-backlinks` fetch that repopulates it.

**The `search` pane (retrieval):**

- **Data:** the `rag-query` IPC (`bridge.rag.query(query, topK?)` — the SAME
  maintained retrieval engine as the MCP `rag.query` tool; MCP/UI equivalence,
  §8.2). The pane renders a text `input` (a UI control) + a results list.
- **Render:** an `input` (`props.id = 'pane-search-input'`) with a
  `pane-search-submit` handler that reads the input value, calls
  `bridge.rag.query(value)` (topK default 5), and renders the `ranked` results
  as `li` entries, each carrying `props['data-node-id'] = <ragNodeId>` and the
  score. Empty query → the handler does nothing (no IPC).
- **Read-only:** the input is a UI control that submits a QUERY (never edits the
  RAG store). The results are display-only.
- **MCP-visible:** the pane subtree (the input + the results list) is in the app
  graph — an agent can dispatch the `pane-search-submit` event on the input via
  `provident.dispatch` (with an `args[0]` value) to run a retrieval, exactly as
  it can call the MCP `rag.query` tool. Both route through the same maintained
  engine (§8.2).

**Authoring rule (shared by all three):** each app-graph pane's `render` output
is wrapped by `paneSubtreeRoot` (§5.2) so its authored id is `pane-<id>` and its
`targetPlacement` is `[sidebar]`. The pane's `data-*` props are the MCP-readable
payload (an agent reads the pane to discover documents, crosslinks, and search
results; it dispatches the pane's handlers to drive them).

### 5.4 The operator-only settings pane + the isolated `GraphScope`

The `settings` pane is `scope: 'operator'`. It renders in its OWN isolated
`GraphScope` (`createIsolatedScope()`) — a separate scope, disjoint from the app
graph AND from the shell's `SecurePanels` scope. It is NOT part of the app graph,
so the MCP endpoints (`get_rendered_html`/`get_markdown`/`list_targets`/
`get_node_state`/`provident.dispatch`) never see it, and it is NOT exposed to the
`rag`/`edit` MCP groups (an agent cannot read, list, dispatch on, or mutate it).

```ts
// src/renderer/sidebar-panes.ts (project-specific; the renderer host wiring).
// The operator pane host mirrors `SecurePanels` (src/renderer/secure-panels.ts):
// its OWN createIsolatedScope() GraphScope + own Supervisor + own DomAdapter →
// its own mount. Pane handlers call the IPC bridge (`window.provident.*`),
// NEVER an MCP tool.

import { createIsolatedScope, type GraphScope } from 'provident-ssr/core/registry.js'
```

**The isolated scope (pinned):**

- The `settings` pane mounts in a scope created by `createIsolatedScope()`
  (`provident-ssr/core/registry.d.ts` D1/D8). Per the engine: "A graph rendered
  under this scope is fully disjoint from every other scope: it never resolves,
  compiles, or destroys another graph's handler defs, nodes, or userData." The
  app Runtime (the agent-visible graph) and the `settings` scope share NO
  registry state — a node, handler def, or userData in one is unreachable from
  the other.
- The pane renders through the engine's canonical render path with the scope
  threaded through: `translateLegacy(buildOperatorEnvelope(...), { hub,
  graphScope: this.scope })` → `new Supervisor({ events: new EventBridge(),
  graphScope: this.scope })` → `new DomAdapter(mount, { onEvent })` →
  `renderProducingProcess(actionable, byNode, adapter, prevMap,
  { nodeIdAttribute: true, graphScope: this.scope })` (the `RenderOptions.graphScope`
  — `render-helpers.d.ts` — makes the emit read ITS OWN scope's def prototypes;
  the `graphScope` is threaded through BOTH the translate and the render).
- **Why isolated (pinned):** operator-only content (the settings pane) is not
  part of the agent-visible app graph. The app Runtime's dispatch/rendered/
  target/state endpoints read ONLY the app Runtime graph (§5.6); the settings
  pane is not in it, so an agent has no path to the operator's settings — the 
  `rag`/`edit` groups operate on the main-process RAG store (never the settings
  content), and the app-graph endpoints read the app Runtime (never the isolated
  scope). An operator-only pane rendered OUTSIDE an isolated scope (i.e. in the
  app graph) is a review finding (it would leak operator settings to the agent).
- **Handlers:** the settings pane's handler bodies call the IPC bridge
  (`window.provident.*`) — NEVER an MCP tool. An agent cannot reach these
  handlers (they are in the isolated scope, not the app graph).
- **Content (pinned, concrete):** the `settings` pane renders operator-owned
  settings that are NOT agent-visible. Concrete examples: which sidebar panes
  are enabled for the operator view; the default document on boot; the
  retrieval `topK` default. Each setting is a form control (an `input`/a set of
  `label` toggles) authored as provident data. The exact setting set is the
  host's choice; the CONTRACT is: (a) it is operator-only, (b) it renders in an
  isolated scope, (c) its controls commit via the IPC bridge, never an MCP tool,
  (d) it is NOT MCP-visible.

**Editable vs read-only (pinned):** the `settings` pane is the ONE editable
pane in this unit, and its edits are OPERATOR edits — they commit through the
IPC bridge to the main process (an operator-owned settings channel), NOT through
the RAG `edit.*` path (the settings are not RAG content). This is the
`SecurePanels` model (its toggles call `window.provident.security.set`). The
form-control editing model (Unit D) applies to app-graph panes that render
EDITABLE RAG content; none of the three concrete app-graph panes in this unit do
(§5.3 — all read-only), so no app-graph pane in this unit binds an edit control.
A future app-graph pane that renders editable RAG content MUST use the Unit D
form-control editing model (§5.7).

### 5.5 The panes' data flow (per pane)

| Pane | Scope | Read path | Write path | Editable? |
| --- | --- | --- | --- | --- |
| `doc-nav` | app-graph | `ctx.snapshot` (via `bridge.rag.snapshot()`) | none (selection → re-traversal, not a store write) | read-only |
| `crosslinks` | app-graph | `ctx.crosslinks` (Unit G wiring) + `bridge.rag.backlinks(currentNodeId)` | none | read-only |
| `search` | app-graph | `bridge.rag.query(query)` (Unit E engine) | none (a query, never a store write) | read-only (input is a UI control) |
| `settings` | operator | the IPC bridge (`window.provident.*` operator channels) | the IPC bridge (operator-owned settings; never the RAG `edit.*` path) | operator-editable |

- **`doc-nav`:** reads the Unit A store's documents over the `rag-snapshot` IPC
  (the renderer has no store access — SINGLE-WRITER-STORE; the snapshot is a
  read-only copy). The document list is derived from the `doc-head` edges'
  targets. Selecting a document triggers a re-traversal with the selected
  document's root id as the single `documentIds` entry (the single-document view
  switch). The pane is read-only — it never writes to the store.
- **`crosslinks`:** reads the Unit G enumeration over the `rag-backlinks` IPC
  (`bridge.rag.backlinks(nodeId)` → `BacklinkResult`, the SAME `enumerateLinks`
  as the MCP `rag.backlinks` tool — MCP/UI equivalence, §8.2) plus the traversal
  `crosslinks` wiring (`ctx.crosslinks`). Read-only.
- **`search`:** reads the Unit E retrieval engine over the `rag-query` IPC
  (`bridge.rag.query(query)` → `RagQueryResult`, the SAME maintained engine as
  the MCP `rag.query` tool — MCP/UI equivalence, §8.2). Read-only (a query).
- **`settings`:** reads + writes operator-owned settings over the IPC bridge
  (the operator-only channel), never an MCP tool and never the RAG `edit.*`
  path. Its commits are operator edits (the `SecurePanels` model).
- **Re-traversal (the pane-inclusive envelope is re-derived):** after ANY
  `rag-store-changed` broadcast (Unit D §5.1.9), the renderer re-derives the
  graph via `buildTraversal` + re-assembles the pane-inclusive envelope (§5.2)
  + re-loads it into the app Runtime. The app-graph panes therefore stay
  MCP-visible across every content/structural edit (their `data-*` payloads
  re-materialize from the current store). The dirty-edit guard (Unit D §5.2)
  still queues the rebuild while an editable control is dirty.

### 5.6 MCP visibility + isolation + the render wiring

**App-graph panes are MCP-visible (§8.2, a BINDING constraint):**

- The pane-inclusive envelope (§5.2) is loaded into the app Runtime (the SAME
  Runtime the MCP endpoints read). Therefore:
  - `provident.get_rendered_html` (→ `renderedHtml`) includes the app-graph pane
    elements (`pane-doc-nav`, `pane-crosslinks`, `pane-search` + their `data-*`
    props).
  - `provident.get_markdown` (→ `markdown`) includes the app-graph panes' text
    content.
  - `provident.list_targets` (→ `ListTargetsResult`) lists the app-graph pane
    nodes (their authored `props.id`/`css.id`).
  - `provident.get_node_state` can resolve an app-graph pane node.
  - `provident.dispatch` can target an app-graph pane node (e.g. the
    `pane-search-input` input or a `doc-nav` `li`) and drive its handler.
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

**The render wiring (`SidebarPanes` host):**

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
   *  carrier). */
  backRefs: Map<string, string[]>
}

export class SidebarPanes {
  constructor(opts: SidebarPanesOptions)
  /** Build the pane context from the current accessors + backRefs + the
   *  traversal crosslinks. */
  buildContext(): PaneContext
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
}
```

- `loadAppGraph(runtime, traversalEnvelope)` calls
  `assembleAppGraphEnvelope({ traversalEnvelope, registry, ctx, sidebarZone })`
  and `runtime.loadEnvelope(result.envelope)` (the app Runtime's A2 load path).
  It returns the `AppGraphAssemblyResult`. The app-graph panes render in the app
  Runtime → MCP-visible. **The app Runtime's re-traversal path (Unit D §5.1.9)
  MUST re-load the pane-inclusive envelope (not a bare traversal envelope)** —
  otherwise the panes would vanish from the app graph on the next edit.
- `mountOperator()` builds the operator envelope via `buildOperatorEnvelope` and
  renders it in a fresh `createIsolatedScope()` GraphScope (own Supervisor +
  own DomAdapter → the operator mount), mirroring `SecurePanels`. The settings
  pane's handler bodies call `window.provident.*` (the bridge), NEVER an MCP
  tool. The operator scope is disjoint from the app Runtime (D1/D8).
- `refresh()` re-fetches the pane data over the bridge (snapshot / backlinks /
  query), re-assembles, and re-renders. A bridge error is caught (the last-known
  pane state is kept — never a crash), mirroring `SecurePanels.refresh`.

**Form-control editing (Unit D) integration (§5.7 of the editing contract):**

- App-graph panes that render EDITABLE RAG content (none of the three concrete
  panes in §5.3; a future pane) MUST bind their controls through the Unit D
  edit controller: a textarea with `value` bound to the RAG node's content (via
  the back-reference), `onInput` → `markDirty(nodeId)`, `onBlur` → `commit(nodeId, value)`,
  `readOnly` when `!isEditable(nodeId)` (dangling back-reference), caret saved/
  restored (§5.3/§5.6 of Unit D). Commit routes through the `edit-commit` IPC →
  the SAME `setContent` op as the MCP tool → `rag-store-changed` → re-traversal
  (which re-loads the pane-inclusive envelope, keeping the panes MCP-visible).
- The three concrete app-graph panes are read-only (their `data-*` payloads are
  display data); the `settings` pane's edits are operator edits through the IPC
  bridge, not RAG edits.

### 5.7 Pane lifecycle + re-traversal

- **Registry lifecycle:** register (disabled) → enable/disable (the operator or
  host) → the enabled set drives the assembly. Enabling an app-graph pane makes
  it MCP-visible on the next assembly/re-render; disabling removes it. Enabling
  an operator pane mounts it in the isolated scope; disabling unmounts/removes
  it.
- **Re-traversal lifecycle:** after ANY `rag-store-changed` (Unit D §5.1.9), the
  renderer re-derives the graph + re-assembles the pane-inclusive envelope +
  re-loads it into the app Runtime. The app-graph panes stay MCP-visible across
  edits. The dirty-edit guard queues the rebuild while a control is dirty.
- **Operator-pane lifecycle:** the settings pane renders once on mount (its
  isolated scope persists for the session); a settings change commits over the
  bridge and re-renders the operator scope. The settings scope is NOT rebuilt by
  a RAG re-traversal (it is disjoint).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`createPaneRegistry` + `register` happy:** registering a unique `id` → the
   pane is added DISABLED; `get(id)` returns it; `list()` has 1 entry.
2. **`register` + `listByScope`:** registering `app-graph` and `operator` panes →
   `listByScope('app-graph')` returns only the app-graph panes, in registration
   order.
3. **`enable` happy:** `enable('doc-nav')` → `isEnabled('doc-nav')` is `true`;
   an `onChanged` subscriber is notified with `{ id: 'doc-nav', enabled: true }`.
4. **`setEnabled` no-op on same state:** `setEnabled(id, true)` on an already-
   enabled pane → no `onChanged` notification (a no-op).
5. **`disable` happy:** `disable('doc-nav')` → `isEnabled` is `false`; the
   subscriber is notified.
6. **`onChanged` unsubscribe:** unsubscribing → further changes do not notify.
7. **`isEnabled` unknown id:** `isEnabled('nope')` → `false` (a safe default).
8. **`paneSubtreeRoot` happy:** a pane `render` returns a content root → the
   wrapped root carries `props.id = 'pane-<id>'` and
   `placement.targetPlacement = ['sidebar']`, with the pane's `type`/`content`/
   `children` preserved.
9. **`paneSubtreeRoot` id/placement enforcement:** a `render` that sets its OWN
   `props.id` and `targetPlacement` → the wrapped root OVERWRITES them with
   `pane-<id>` and `[sidebarZone]`.
10. **`assembleAppGraphEnvelope` happy:** a traversal envelope + one enabled
    app-graph pane → the merged envelope has the traversal content payloads +
    one pane ContentPayload, a `sidebar` container producer in the template,
    and `paneIds: ['<id>']`.
11. **`assembleAppGraphEnvelope` multiple panes:** two enabled app-graph panes →
    both ContentPayloads present, `paneIds` in registration order.
12. **`assembleAppGraphEnvelope` disabled pane excluded:** a registered but
    DISABLED app-graph pane → NOT in the envelope, NOT in `paneIds`.
13. **`assembleAppGraphEnvelope` operator pane excluded:** an ENABLED operator
    pane → NOT in the app-graph envelope (it never enters the app graph).
14. **`assembleAppGraphEnvelope` existing sidebar producer:** a traversal
    envelope that already has a `sidebar` container producer → it is KEPT (not
    duplicated).
15. **`buildOperatorEnvelope` happy:** one enabled operator pane → the envelope
    has a template root `id: 'operator-panes'` with the pane section as a child,
    `content: []`, no `targetPlacement`.
16. **`buildOperatorEnvelope` disabled operator pane excluded:** a registered but
    DISABLED operator pane → NOT in the operator envelope.
17. **`doc-nav` happy:** a store with two `doc-head` edges → the pane renders two
    `li` document entries (sorted by root id), the current document's `li`
    carries `data-current: 'true'`.
18. **`doc-nav` empty store:** no `doc-head` edges → the pane renders `(no
    documents)` (no throw).
19. **`crosslinks` happy:** `ctx.currentNodeId` set + `ctx.crosslinks` non-empty →
    the pane renders the outgoing-crosslinks list + the backlink/outlink list
    with their `data-scope` props.
20. **`crosslinks` no current node:** `ctx.currentNodeId` is `null` → the pane
    shows the outgoing crosslinks only (the enumeration is skipped, no throw).
21. **`search` happy:** a submitted query → `bridge.rag.query(query)` returns the
    `RagQueryResult`; the pane renders the `ranked` results as `li` entries with
    `data-node-id` + score.
22. **App-graph pane MCP-visible (equivalence):** after `loadAppGraph`, the
    pane-inclusive envelope is in the app Runtime → `get_rendered_html` includes
    the pane elements, `get_markdown` includes the pane text, `list_targets`
    lists the pane nodes, `dispatch` can target a pane node.
23. **Operator settings isolated (isolation):** after `mountOperator`, the
    settings pane renders in its isolated scope → `list_targets` does NOT list
    it, `get_rendered_html`/`get_markdown` do NOT include it, `dispatch` on a
    settings id throws `unresolved target` (fail-closed).
24. **Re-traversal keeps panes MCP-visible:** after a `rag-store-changed` +
    re-traversal (which re-loads the pane-inclusive envelope), the app-graph
    panes are STILL in the app graph (MCP-visible), with their `data-*` payloads
    re-materialized from the current store.
25. **Form-control editing integration (read-only classification):** the three
    app-graph panes bind NO edit control (read-only); the settings pane's edits
    commit via the IPC bridge (never the RAG `edit.*` path).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`register` duplicate id** → throws `Error('pane registry: duplicate id "X"')`.
2. **`register` null/undefined def** → throws
   `Error('pane registry: definition required')`.
3. **`register` empty/non-string id** → throws
   `Error('pane registry: id must be a non-empty string')`.
4. **`register` non-string/empty title** → throws
   `Error('pane registry: title must be a non-empty string')`.
5. **`register` invalid scope** → throws `Error('pane registry: invalid scope "X"')`.
6. **`register` non-function render** → throws
   `Error('pane registry: render must be a function')`.
7. **`enable`/`disable`/`setEnabled` unknown id** → throws
   `Error('pane registry: unknown pane "X"')`.
8. **`onChanged` non-function** → throws
   `Error('pane registry: onChanged requires a callback')`.
9. **`paneSubtreeRoot` null/undefined def/ctx or empty sidebarZone** → throws
   `Error('paneSubtreeRoot: def/ctx/sidebarZone required')`.
10. **`paneSubtreeRoot` render returns nothing** → throws
    `Error('paneSubtreeRoot: pane "<id>" render returned nothing')`.
11. **`assembleAppGraphEnvelope` null/undefined input/registry/ctx/
    traversalEnvelope** → throws
    `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')`.
12. **`assembleAppGraphEnvelope` a pane whose `paneSubtreeRoot` throws** → the
    throw PROPAGATES (a pane that cannot be authored is a caller error, never a
    silent skip).
13. **`buildOperatorEnvelope` null/undefined registry/ctx** → throws
    `Error('buildOperatorEnvelope: registry/ctx required')`.
14. **`buildOperatorEnvelope` an operator pane whose `render` returns nothing** →
    throws `Error('buildOperatorEnvelope: operator pane "<id>" render returned
    nothing')`.
15. **`dispatch` on a settings pane node** → the app Runtime throws
    `unresolved target: ...` (fail-closed — the settings pane is NOT in the app
    graph, so it is not targetable). The settings pane's handlers are unreachable
    by an agent.
16. **`get_node_state` on a settings pane node** → `unresolved target` (fail-
    closed; the settings node is not in the app graph).
17. **`rag-backlinks` IPC with a null store** → throws
    `'rag.backlinks: no rag store configured'` (Unit G §5.4 fail-state — the
    crosslinks pane surfaces it as an empty enumeration, never a crash).
18. **`rag-query` IPC with an empty query** → throws
    `'rag.query: query must be a non-empty string'` (Unit E §5.7 fail-state — the
    search pane's submit handler does NOT send the IPC for an empty query; an
    invalid query rejects cleanly).

### 5.10 Census / numeric claims

- **Pane scopes:** 2 (`app-graph`, `operator`).
- **Concrete panes:** 4 (`doc-nav`, `crosslinks`, `search` — app-graph; `settings`
  — operator).
- **App-graph panes:** 3 (MCP-visible).
- **Operator panes:** 1 (isolated, NOT MCP-visible).
- **Registry methods:** 9 (`register`, `get`, `list`, `listByScope`, `isEnabled`,
  `enable`, `disable`, `setEnabled`, `onChanged`).
- **`PaneDefinition` fields:** 4 (`id`, `title`, `scope`, `render`).
- **`PaneContext` fields:** 6 (`snapshot`, `currentDocumentId`, `currentNodeId`,
  `backRefs`, `crosslinks`).
- **Assembly functions:** 3 (`paneSubtreeRoot`, `assembleAppGraphEnvelope`,
  `buildOperatorEnvelope`).
- **Sidebar zone:** 1 constant (`SIDEBAR_ZONE = 'sidebar'`).
- **`AppGraphAssemblyResult` fields:** 2 (`envelope`, `paneIds`).
- **Pane-inclusive app-graph envelope:** 1 per load — the traversal content
  payloads + 1 ContentPayload per enabled app-graph pane + exactly one `sidebar`
  container producer (the HARD PRECONDITION, never duplicated).
- **Operator isolated scope:** exactly 1 `createIsolatedScope()` GraphScope for
  the settings pane (disjoint from the app graph and from `SecurePanels`).
- **IPC surfaces consumed (all pre-existing):** `rag-snapshot` (doc-nav),
  `rag-backlinks` (crosslinks), `rag-query` (search), the operator bridge
  `window.provident.*` (settings). No new IPC channel is required by this unit.
- **Isolation fail-closed paths:** `dispatch`/`get_node_state`/`list_targets` on
  a settings pane node — the settings pane is invisible to all of them.

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.2 (the store snapshot shape the
  `doc-nav` pane reads — nodes + edges), §5.4 (the `RagStore` interface — the
  doc-nav pane reads the store's documents over the `rag-snapshot` IPC),
  §5.5 (single-writer queue — every pane write routes through the main-process
  store).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalResult` — the
  `envelope` + `backRefs` + `lineMap` + `crosslinks` the app-graph panes consume),
  §5.2 (the envelope rules + the HARD PRECONDITION — a `sidebar` container
  producer must be emitted for every targeted zone), §5.3 (the back-reference map
  the editable-pane contract binds via), §5.4 (the render path the pane-inclusive
  envelope loads through).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.9 (the `rag-store-changed`
  re-traversal trigger — after which the renderer re-loads the pane-inclusive
  envelope, keeping the panes MCP-visible), §5.1.10 (the `edit-commit` IPC — the
  editable-app-graph-pane write-back path), §5.2 (the dirty-edit guard — queues
  the rebuild while a control is dirty), §5.6 (the form-control editing model an
  editable app-graph pane MUST use).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.7 (the `rag-query` IPC the search
  pane reads — the SAME maintained engine as the MCP `rag.query` tool).
- Unit G: `docs/specs/unit-g-crosslink-backlink.md` §5.2 (the `crosslinks:
  CrosslinkWiring[]` traversal output the crosslinks pane reads), §5.3 (the
  backlink enumeration the `rag-backlinks` IPC returns), §5.4 (the `rag-backlinks`
  IPC + its fail-state), §5.6 (the crosslinks pane is the UI consumer of the
  enumeration; the `Link`/`Anchor` DOM materialization is the renderer surface,
  NOT this pane).
- Gate: `docs/specs/astrographer-review.md` §4 item 8 (Sidebar panes — the
  host-side pane registry + app-graph MCP-visible + operator-only isolated
  `GraphScope`), §7 scope item 8, §8.2 (MCP/UI equivalence — a BINDING
  constraint), §9.2.6 (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS — the
  `rag`/`edit` groups; the settings pane is NOT exposed to them), §9.2.2
  (back-reference carrier), §13 (cross-document shared nodes).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **RAG-EDIT-MCP-GROUPS**, **SUBTREE-OWNERSHIP**,
  **FORM-CONTROL-EDITING**. New rows pinned by this spec (added when the unit
  lands): **PANE-REGISTRY**, **PANE-PROVIDENT-AUTHORING**,
  **APP-GRAPH-PANES-MCP-VISIBLE**, **OPERATOR-ISOLATED-GRAPHSCOPE**.
- Pending: `docs/pending.md` (crosslink hover-preview pane — builds on the Unit H
  display-pane infrastructure; document tabs — the multi-document render).
- Engine surfaces: `provident-ssr/core/registry.d.ts` (`GraphScope`,
  `createIsolatedScope`, `DEFAULT_SCOPE` — D1/D8; an isolated scope is disjoint
  from every other scope), `provident-ssr/dist/core/render-helpers.d.ts`
  (`renderProducingProcess`, `RenderOptions.graphScope` — the isolated scope is
  threaded through the render), `provident-ssr/dist/core/adapters.d.ts`
  (`DomAdapter`, `SSRFragmentAdapter`, `MarkdownAdapter`), `provident-ssr`
  (`translateLegacy`, `Supervisor`, `EventBridge`, `LegacyInitialData`,
  `LegacyNodeData`, `LegacyContentPayload`).
- Host patterns: `src/renderer/secure-panels.ts` (the `createIsolatedScope()`
  operator-pane pattern the settings pane mirrors — own scope + own Supervisor +
  own DomAdapter + own mount, handlers call the IPC bridge, never an MCP tool),
  `src/renderer/runtime.ts` (the app Runtime the app-graph panes render in + the
  `loadEnvelope` path), `src/renderer/renderer.ts` (the renderer entry that
  bootstraps the Runtime + `SecurePanels` + the edit controller; the
  pane-inclusive envelope is loaded here), `src/main/preload.ts` (`ProvidentBridge`
  — the `rag.snapshot`/`rag.backlinks`/`rag.query`/`edit.commit` surfaces the
  panes consume).
