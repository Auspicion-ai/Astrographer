# Spec — Unit G: Crosslink/Backlink

- **Status:** SPEC (later unit G). Gate reference:
  `docs/specs/astrographer-review.md` §8.2 (MCP/UI equivalence — a BINDING
  constraint on every unit that touches retrieval/editing/rendering), §9.2.7
  (RAG-EDIT-MCP-GROUPS — the `rag.backlinks` tool is registered in Unit B),
  §13 (cross-document shared nodes — the `documentIds` field + the
  CROSS-DOCUMENT-SHARED model), §9.2.6 (SINGLE-WRITER-STORE). Decisions:
  `docs/decisions.md` rows **RAG-EDIT-MCP-GROUPS**, **CROSS-DOCUMENT-SHARED**,
  **SINGLE-WRITER-STORE**, **RAG-AUTHORITATIVE**. New decisions pinned by this
  spec: **CROSSLINK-EDGE-KIND** (a `crosslink` RAG edge kind is the
  authoritative crosslink representation) and **CROSSLINK-LINKCONFIG** (a
  custom `LinkConfig` with `name: 'crosslink'`, `roles: ['source', 'target']`
  materializes crosslinks into the provident graph). These rows are added to
  `docs/decisions.md` when the unit lands (the archival loop, AGENTS.md item 6).
- **Scope:** the BACKEND crosslink/backlink mechanism — the `crosslink` RAG
  edge kind (the authoritative representation), the custom crosslink
  `LinkConfig` + the traversal's `Link`/`Anchor` materialization, the host-side
  backlink/outlink enumeration (`listBacklinks`/`listOutlinks`/`enumerateLinks`),
  the `rag.backlinks` MCP tool (FULL handler — Unit B registered it) + the
  `rag-backlinks` IPC (MCP/UI equivalence), and the five-seam gate. This unit
  does NOT implement the sidebar pane UI (Unit H — the consumer of the
  enumeration); it defines the backend mechanism Unit H builds on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/backlinks.ts` (and
  the amended `src/main/traversal.ts` + `src/main/rag-store.ts` +
  `src/main/mcp-server.ts` + `src/shared/types.ts`) from §5.8/§5.9 before any
  implementation.

---

## 1. What the proposal asks

1. A **custom crosslink `LinkConfig`** using the engine's OPEN `LinkConfig.name`
   union (`'parent-child' | 'component' | 'placement' | (string & {})`). Pin the
   custom link name, the `LinkConfig` shape (the link name + how it resolves to
   a target), how a crosslink is represented in the RAG layer, and how the
   traversal materializes it into the provident graph (the `Link`/`Anchor`
   wiring).
2. **Host-side backlink enumeration:** enumerate which RAG nodes link TO a given
   node (backlinks) and which a node links FROM (outlinks/crosslinks). Pin the
   enumeration API, the source of truth (the RAG store edges — the authoritative
   layer), the return shape, and how it distinguishes crosslinks (across
   documents) from intra-document links.
3. **MCP/UI equivalence:** a `rag`-group MCP tool (`rag.backlinks`) + a UI IPC
   (`rag-backlinks`) that call the SAME host-side enumeration (the §8.2 BINDING
   constraint). Pin the tool schema, the handler, the IPC, and the equivalence
   test.
4. **Integration with the RAG store + traversal:** the crosslink/backlink data
   lives in the RAG store (authoritative); the traversal materializes the
   crosslinks into the provident graph. Pin how a crosslink edge is stored, how
   the traversal emits the `Link`/`Anchor`, and how the backlink enumeration
   reads the store.
5. **The UI pane is Unit H** (sidebar panes) — Unit G is the BACKEND mechanism
   (the `LinkConfig` + backlink enumeration + MCP/UI equivalence). Do NOT spec
   the sidebar pane UI here; note it as the Unit H consumer.

## 2. Feasibility verdict

**Feasible — grounded in the engine's open `LinkConfig.name` union, the closed
`Role` union, and the foundation's MCP/UI equivalence pattern.**

- **Custom crosslink `LinkConfig`:** the engine's `LinkConfig.name` is an OPEN
  union (`types.d.ts`: `'parent-child' | 'component' | 'placement' | (string &
  {})`), so a custom name (`'crosslink'`) is allowed — **no engine gap**. The
  `Link` constructor (`link.d.ts`/`link.js`) merges a custom config over a base
  (`baseFor(name)` returns `DEFAULT_PARENT_CHILD` for an unknown name), so the
  custom config MUST explicitly set `roles: ['source', 'target']` (the inherited
  `['parent','child']` roles would otherwise apply). The `parent`/`children`
  constraints inherited from `DEFAULT_PARENT_CHILD` are inert for a
  source/target link (they only apply to `parent`/`child` role anchors).
- **Crosslink as a RAG edge kind:** the RAG store (Unit A) is authoritative; a
  `crosslink` edge (`{ kind: 'crosslink', source, target, documentIds? }`) reuses
  the `RagEdge` shape + the store's edge CRUD + the project journal. No new
  store mechanism. The `edit.set_edge` op (Unit D) already creates any edge kind
  once `crosslink` is in the `RagEdgeKind` union.
- **Backlink enumeration:** pure host-side logic over the `RagStore` interface
  (Unit A §5.4) — reads `store.listEdges()` + the doc-flow edges for document
  membership. No engine primitive needed.
- **MCP/UI equivalence:** the `rag.backlinks` tool is already registered in Unit
  B §5.3 (read-only, `rag`-group, default-off, main-handled). Unit G implements
  the FULL handler. The `rag-backlinks` IPC mirrors the `rag-query` IPC pattern
  (Unit E §5.7) — both call the same host-side enumeration.

No engine/foundation gap blocks this unit. The crosslink representation, the
custom `LinkConfig`, the traversal materialization, and the enumeration are all
project-specific (compose the `Link`/`Anchor` primitives + the `RagStore`
interface). ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is SHELVED 2026-08-26
(markdown is export-only; the host-side line→node map covers it — see
`docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `crosslink` RAG edge kind | Project-specific (a new `RagEdgeKind` value; reuses the store's edge CRUD + journal) | Low cost; the authoritative crosslink representation. |
| Custom crosslink `LinkConfig` | Project-specific (composes the engine's open `LinkConfig.name` union + the `Link`/`Anchor` primitives) | Low cost; no engine gap (the name union is open). |
| Traversal `Link`/`Anchor` materialization | Project-specific (the traversal emits a `crosslinks` wiring; the renderer materializes the `Link`/`Anchor` post-`translateLegacy`) | Medium cost; the graph-level crosslink visibility. |
| Backlink/outlink enumeration | Project-specific (pure host logic over the `RagStore` interface) | Low cost; the source of truth is the store edges. |
| `rag.backlinks` MCP tool FULL handler | Project-specific (Unit B registered it; Unit G implements the FULL behavior) | Low cost; reuses the five-seam gate. |
| `rag-backlinks` IPC (MCP/UI equivalence) | Project-specific (mirrors the `rag-query` IPC pattern, Unit E §5.7) | Low cost; reuses the IPC pattern. |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings (host findings, fixed + regression-tested)

Post-green adversarial pass (RCA-3) 2026-08-27. All findings are HOST (this
repo's `src/`); none are package/upstream findings (nothing went to
`docs/defects.md`/`docs/HANDOFF.md`). Each host finding was fixed + regression-
tested (6 regression tests in `tests/crosslink-backlink-adversarial.test.ts`).

**LOW:**
- **G1** — `edit.set_edge` with an empty-string `documentIds` element on a
  crosslink THREW out of the op (the store's `validateEdgeShape` rejected `''`
  and `putEdge` threw), violating the op's "Ops NEVER throw for domain failures"
  contract. Fixed: `setEdge` now guards empty-string elements → returns
  `{ ok: false, error: 'edit.set_edge: documentIds must be a non-empty string
  array' }` (a domain result, store untouched). Regression-tested (empty-string
  element → domain result; valid non-empty `documentIds` still succeeds).
- **G2** — the `rag-backlinks` IPC (`handleRagBacklinksIpc`) threw
  `'backlinks: store required'` on a null store, while the `rag.backlinks` MCP
  tool threw `'rag.backlinks: no rag store configured'` — breaking the §5.4
  "rejects identically" MCP/UI-equivalence claim. Fixed: the IPC now throws the
  SAME message as the MCP tool. Regression-tested (IPC + MCP with a null store
  throw the same message).

## 4. Design decisions pinned by this spec

- **CROSSLINK-EDGE-KIND:** a crosslink is represented in the RAG layer as a NEW
  RAG edge kind `crosslink` (`{ kind: 'crosslink', source, target, documentIds?
  }`). This is the authoritative representation — it reuses the `RagEdge` shape
  (Unit A §5.1), the store's edge CRUD, and the project journal. It is NOT a
  node property and NOT a separate link registry. The RAG store is
  authoritative; the traversal materializes the graph; the backlink enumeration
  reads the store.
- **CROSSLINK-LINKCONFIG:** the custom crosslink `LinkConfig` is
  `{ name: 'crosslink', roles: ['source', 'target'] }` — a custom name in the
  engine's OPEN `LinkConfig.name` union. The traversal materializes each
  outgoing crosslink edge as a DISTINCT `Link` (created directly via
  `new Link(CROSSLINK_LINK_CONFIG)`, NOT via `createLinkHub` — the hub is the
  engine's same-name sharing mechanism for `component`/`placement` links and
  would inherit parent-child roles for a custom name). The `Link` carries a
  `source` anchor on the source RAG node's subtree root and a `target` anchor on
  the target RAG node's subtree root.
- **BACKLINK-ENUMERATION:** the host-side enumeration reads the RAG store edges
  (the authoritative layer). `listBacklinks(nodeId)` returns the edges that
  TARGET `nodeId`; `listOutlinks(nodeId)` returns the edges that `nodeId`
  SOURCES. Each edge is classified by scope (`cross-document` /
  `intra-document` / `unscoped`) via a document-membership derivation over the
  doc-flow edges.
- **MCP-UI-EQUIVALENCE:** the `rag.backlinks` MCP tool and the `rag-backlinks`
  IPC call the SAME host-side enumeration (`enumerateLinks`) on the same store
  (§8.2, a BINDING constraint).
- **RAG-AUTHORITATIVE:** the crosslink/backlink data lives in the RAG store; the
  provident graph is a transient render materialization. The traversal
  materializes outgoing crosslinks as `Link`/`Anchor`; the enumeration reads the
  store.
- **SINGLE-WRITER-STORE:** a `crosslink` edge is created/updated/removed through
  the store's single-writer queue (via `edit.set_edge` or the store's edge CRUD).
  The enumeration is read-only and lock-free.

## 5. The exhaustive contract

### 5.1 The `crosslink` RAG edge kind (refining Unit A §5.1)

The persisted shapes are defined in Unit A §5.1. This section adds the
`crosslink` kind to the `RagEdgeKind` union and pins its semantics.

```ts
// src/main/rag-store.ts (project-specific; NOT in shared/types.ts — the store
// is main-process only; MCP/UI reach it via IPC, not by importing the type).

/** The RAG edge kinds. Doc-flow kinds (doc-head/next-section/doc-end) are
 *  authoritative in the store; `doc-child` expresses hierarchical nesting;
 *  `crosslink` expresses a CROSS-DOCUMENT reference (a link from a node in one
 *  document to a node in another document). */
export type RagEdgeKind =
  | 'parent-child'
  | 'doc-head'
  | 'next-section'
  | 'doc-end'
  | 'doc-child'
  | 'crosslink'   // Unit G — a cross-document reference (source → target).
```

**`crosslink` edge semantics:**

| Edge kind | Meaning | Direction |
| --- | --- | --- |
| `crosslink` | A **cross-document reference**: `source` (a RAG node in one document) links TO `target` (a RAG node in another document). It is the explicit crosslink representation. `documentIds` lists the documents that OWN/USE the edge (CROSS-DOCUMENT-SHARED — an edge can have multiple document owners). | `source` → `target` (a directed reference across documents). |

**Shape rules (enforced by the store, extending Unit A §5.1):**

- `order` is NOT valid on a `crosslink` edge (it is only valid on `doc-child`).
  A `crosslink` edge with `order` is rejected at write time (the per-kind field
  enforcement — Unit A §5.1).
- `documentIds` is allowed on a `crosslink` edge (CROSS-DOCUMENT-SHARED — an
  edge can have multiple document owners). Empty strings in `documentIds` are
  rejected; duplicates are deduped on write (Unit A §5.1).
- A self-referential `crosslink` edge (`source === target`) is rejected (Unit A
  §5.1).
- A `crosslink` edge referencing a nonexistent or quarantined node is rejected
  (Unit A §5.1 — referential integrity).
- A `crosslink` edge is a **structural** edge: its add/remove/retarget/update is
  journaled as a structural entry (`edge-add`/`edge-remove`/`edge-retarget`/
  `edge-update` — Unit A §5.6) → re-traversal. No new journal op is needed.

**Creation path:** a `crosslink` edge is created via the store's `putEdge` (Unit
A §5.4) or via the `edit.set_edge` tool (Unit D §5.1.7) with
`{ kind: 'crosslink', source, target, documentIds? }`. Once `crosslink` is in
the `RagEdgeKind` union, the `setEdge` op's kind validation accepts it — no new
edit op.

### 5.2 The custom crosslink `LinkConfig` + the traversal materialization

**The custom `LinkConfig`:**

```ts
// src/main/traversal.ts (project-specific; pure, no Electron — importable in
// main and renderer).

/** The custom crosslink LinkConfig. `name: 'crosslink'` is a custom name in
 *  the engine's OPEN `LinkConfig.name` union ('parent-child' | 'component' |
 *  'placement' | (string & {})). `roles: ['source', 'target']` MUST be set
 *  explicitly — the `Link` constructor's `baseFor(name)` returns
 *  DEFAULT_PARENT_CHILD (roles ['parent','child']) for an unknown name, and the
 *  custom config overrides it. The inherited `parent`/`children` constraints
 *  are inert for a source/target link (they only apply to `parent`/`child`
 *  role anchors). */
export const CROSSLINK_LINK_CONFIG: LinkConfig = {
  name: 'crosslink',
  roles: ['source', 'target'],
}
```

**Engine constraint (no gap):** `LinkConfig.name` is an OPEN union
(`types.d.ts`), so `'crosslink'` is a valid custom name. The `Link` constructor
(`link.js`) merges the custom config over `baseFor(name)`; the custom config
MUST override `roles` to `['source', 'target']` (otherwise the link would accept
`parent`/`child` anchors, not `source`/`target`). The `Link.addAnchor` guard
throws `LinkConfigError('role-mismatch')` if an anchor's role is not in
`config.roles` — so a `source`/`target` anchor on a link whose `roles` did not
include them would throw.

**`createLinkHub` is NOT used for crosslinks:** the engine's `createLinkHub`
(`translate.d.ts` `LinkConfigNameHub.linkFor(name, kind)`) is the SAME-NAME
sharing mechanism for `component`/`placement` links — it creates
`new Link({ name: kind })`, which for a custom name would inherit parent-child
roles (wrong for a crosslink). Each crosslink edge is a DISTINCT `Link` (a
distinct source→target pair), so the hub is not used. The crosslink `Link` is
created directly via `new Link(CROSSLINK_LINK_CONFIG)`.

**The traversal output (extending Unit C §5.1):**

```ts
// src/main/traversal.ts

export interface CrosslinkWiring {
  /** The crosslink RAG edge id. */
  edgeId: string
  /** The source RAG node id (in the current materialization). */
  sourceRagNodeId: string
  /** The target RAG node id (may be in a DIFFERENT document — not materialized
   *  in the single-document view). */
  targetRagNodeId: string
}

export interface TraversalResult {
  envelope: LegacyInitialData
  backRefs: Map<string, string[]>
  lineMap: LineNodeMap
  /** Unit G — the crosslink wiring: one entry per `crosslink` edge whose SOURCE
   *  RAG node is materialized in the current traversal. The renderer
   *  materializes the `Link`/`Anchor` from this wiring after `translateLegacy`. */
  crosslinks: CrosslinkWiring[]
}
```

**Traversal behavior (extending Unit C):**

- The traversal collects the `crosslink` edges from the store
  (`store.listEdges()` filtered by `kind === 'crosslink'`).
- For each `crosslink` edge whose SOURCE RAG node is materialized in the current
  traversal, it emits a `CrosslinkWiring` entry `{ edgeId, sourceRagNodeId,
  targetRagNodeId }`.
- **Outgoing-only materialization (pinned):** the traversal emits wiring ONLY
  for crosslinks whose SOURCE is in the current materialization (outgoing
  crosslinks from the current document). A crosslink whose source is in a
  DIFFERENT document (an incoming crosslink to the current document) is NOT
  materialized as a `Link`/`Anchor` in the current graph — it is visible via the
  backlink enumeration (§5.3) and the Unit H sidebar pane. This respects the
  single-document view (only one document renders at a time — review §13.3): an
  incoming crosslink's source is not materialized, so its `Link`/`Anchor` would
  be dangling on both ends.
- **Throws:** `buildTraversal` throws `Error('traversal: store/documentIds/zoneName required')`
  if `input` is null/undefined or any required field is missing/invalid (Unit C
  §5.1). It does NOT throw on a missing crosslink target (a crosslink whose
  target is not materialized is a valid dangling reference).

**The renderer materialization (post-`translateLegacy`):**

After the renderer's `translateLegacy` mints the live Nodes (Unit C §5.4), the
renderer walks the `crosslinks` wiring and, for each entry:

1. Resolves the source subtree root by its stable authored id
   `rag-<sourceRagNodeId>` (Unit C §5.2 rule 2 — the reconciliation key).
2. Resolves the target subtree root by its stable authored id
   `rag-<targetRagNodeId>`.
3. Creates `const link = new Link(CROSSLINK_LINK_CONFIG)`.
4. Adds a `source` anchor on the source root:
   `sourceRoot.addAnchor('source', sourceRoot, {}, link)` +
   `link.addAnchor({ role: 'source', target: sourceRoot, options: {}, link })`.
5. Adds a `target` anchor on the target root:
   `targetRoot.addAnchor('target', targetRoot, {}, link)` +
   `link.addAnchor({ role: 'target', target: targetRoot, options: {}, link })`.
6. **Dangling target (pinned):** if the target root is NOT in the current
   materialization (a different document — the single-document view), the target
   anchor's `target` is the STRING `'rag-<targetRagNodeId>'` (a dangling
   reference — the anchor is unresolved until that document renders). The source
   anchor is still materialized (the crosslink is visible as a source link even
   when the target is not rendered). No throw.

**Fail-states (TestWriter red set):**

- A `crosslinks` wiring entry whose source root is NOT found in the translated
  tree → the renderer SKIPS that crosslink's materialization (no throw; the
  crosslink is not materialized but the graph still renders). This is a
  defensive guard — the traversal only emits wiring for materialized sources.
- A `Link` created with a config whose `roles` does not include `'source'`/
  `'target'` → `Link.addAnchor` throws `LinkConfigError('role-mismatch')`. The
  spec pins `CROSSLINK_LINK_CONFIG` with the correct roles, so this is a
  defensive fail-state (a test asserts the config's roles).

### 5.3 The backlink/outlink enumeration API

The enumeration reads the RAG store edges (the authoritative layer). It is a
pure module over the `RagStore` interface (Unit A §5.4 — SOURCE-SWITCHABLE).

```ts
// src/main/backlinks.ts (project-specific; pure, no Electron — operates on the
// RagStore interface, Unit A §5.4).

/** The scope classification of a link: cross-document (source and target in
 *  DIFFERENT documents), intra-document (source and target in the SAME
 *  document), or unscoped (a node with no document membership — indeterminate). */
export type LinkScope = 'cross-document' | 'intra-document' | 'unscoped'

/** One enumerated link (a RAG edge + its scope classification). */
export interface LinkEntry {
  /** The RAG edge that links to/from the node (a shallow copy — never the
   *  internal record). */
  edge: RagEdge
  /** The edge kind. */
  kind: RagEdgeKind
  /** The edge's source RAG node id. */
  source: string
  /** The edge's target RAG node id. */
  target: string
  /** The documents that OWN/USE the edge (CROSS-DOCUMENT-SHARED). Absent if the
   *  edge has no document owners. */
  documentIds?: string[]
  /** The scope classification. */
  scope: LinkScope
}

/** The combined enumeration result. */
export interface BacklinkResult {
  /** The queried node id. */
  nodeId: string
  /** The edges that TARGET nodeId (backlinks), in store order. */
  backlinks: LinkEntry[]
  /** The edges that nodeId SOURCES (outlinks/crosslinks), in store order. */
  outlinks: LinkEntry[]
  /** The crosslink backlinks (the backlinks whose edge kind is 'crosslink'). */
  crosslinkBacklinks: LinkEntry[]
  /** The crosslink outlinks (the outlinks whose edge kind is 'crosslink'). */
  crosslinkOutlinks: LinkEntry[]
}

/** The edges that TARGET nodeId (backlinks), across all documents. */
export function listBacklinks(store: RagStore, nodeId: string): LinkEntry[]
/** The edges that nodeId SOURCES (outlinks/crosslinks). */
export function listOutlinks(store: RagStore, nodeId: string): LinkEntry[]
/** The combined enumeration (backlinks + outlinks + the crosslink subsets). */
export function enumerateLinks(store: RagStore, nodeId: string): BacklinkResult
```

**Document membership derivation (a pure helper):**

```ts
/** The set of document root node ids whose flow includes the node. A node with
 *  none of the doc-flow memberships belongs to NO document (an empty set). */
export function documentOf(store: RagStore, nodeId: string): string[]
```

`documentOf(store, nodeId)` returns the set of document root node ids `D` such
that the node is part of D's flow, derived from the doc-flow edges (Unit B §5.1)
scoped by `documentIds`:

- The node is the SOURCE of a `doc-head` edge with `documentIds` containing `D`
  (the node is D's head), OR
- The node is the TARGET of a `doc-head` edge with `documentIds` containing `D`
  (the node is D's document root), OR
- The node is the SOURCE of a `doc-end` edge with `documentIds` containing `D`
  (the node is D's end), OR
- The node is the SOURCE or TARGET of a `next-section` edge with `documentIds`
  containing `D` (the node is a section in D's linear flow).

A node with none of these memberships belongs to NO document (an empty set).

**Scope classification (`scopeOf(edge)`):**

- Let `S` = `documentOf(store, edge.source)`, `T` = `documentOf(store,
  edge.target)`.
- If `S` and `T` are BOTH non-empty AND disjoint (`S ∩ T = ∅`) →
  `'cross-document'` (the source and target are in different documents).
- If `S ∩ T ≠ ∅` → `'intra-document'` (the source and target share at least one
  document).
- Otherwise (either `S` or `T` is empty — a node with no document membership) →
  `'unscoped'` (indeterminate; cannot be classified without document
  membership).

**Return-shape rules:**

- `listBacklinks(store, nodeId)` returns the edges where `edge.target ===
  nodeId`, in STORE ORDER (the order `store.listEdges()` returns them), each
  wrapped in a `LinkEntry` with the scope classification.
- `listOutlinks(store, nodeId)` returns the edges where `edge.source === nodeId`,
  in store order.
- `enumerateLinks(store, nodeId)` returns the combined result: `backlinks` =
  `listBacklinks`, `outlinks` = `listOutlinks`, `crosslinkBacklinks` = the
  backlinks whose edge kind is `'crosslink'`, `crosslinkOutlinks` = the outlinks
  whose edge kind is `'crosslink'`. (A `crosslink` edge is a crosslink BY
  DEFINITION — its `scope` may be `'cross-document'`, `'intra-document'`, or
  `'unscoped'` (no document membership); the `crosslink*` fields select by edge
  KIND, not by scope.)
- The `edge` in each `LinkEntry` is a shallow copy (the store's `listEdges`
  already returns shallow copies — Unit A §5.4).
- A nonexistent `nodeId` → an empty result (no throw): `listBacklinks` → `[]`,
  `listOutlinks` → `[]`, `enumerateLinks` → `{ nodeId, backlinks: [], outlinks:
  [], crosslinkBacklinks: [], crosslinkOutlinks: [] }`.

**Fail-states (TestWriter red set):**

- `listBacklinks`/`listOutlinks`/`enumerateLinks` with a null/undefined `store`
  → throws `Error('backlinks: store required')`.
- `listBacklinks`/`listOutlinks`/`enumerateLinks` with a non-string/empty
  `nodeId` → throws `Error('backlinks: nodeId required')`.
- `documentOf` with a null/undefined `store` or a non-string `nodeId` → throws
  `Error('documentOf: store/nodeId required')`.

### 5.4 The `rag.backlinks` MCP tool + the `rag-backlinks` IPC (MCP/UI equivalence)

**The `rag.backlinks` tool (the enumeration entry point):**

Unit B §5.3 registered `rag.backlinks` through the five-seam gate (read-only,
`rag`-group, default-off, main-handled). Unit G implements the FULL handler
behavior:

- **Input schema (zod):** `{ nodeId: string }`.
- **Handler (main-handled, `handleRagTool` case `'rag.backlinks'`):**
  - Validates `nodeId` is a non-empty string (a missing/empty `nodeId` → throws
    `'rag.backlinks: nodeId required'`).
  - Calls `enumerateLinks(store, nodeId)` (the host-side enumeration — §5.3).
  - Returns the `BacklinkResult` (JSON-serializable).
- **Gating:** the tool is callable only when the `rag` group is enabled
  (default-off — Unit B §5.3). A `rag.backlinks` call with the group disabled →
  not registered, not callable.

**The `rag-backlinks` IPC (MCP/UI equivalence, §8.2 a BINDING constraint):**

- **IPC constant + payload + result** (`src/shared/types.ts`, mirroring the
  `rag-query` IPC — Unit E §5.7):

```ts
/** The renderer→main `rag-backlinks` IPC (the UI enumeration path, §5.4 —
 *  MCP/UI equivalence, §8.2 a BINDING constraint). Payload: `{ nodeId: string }`.
 *  Main calls the SAME host-side enumeration as the MCP `rag.backlinks` tool
 *  (`enumerateLinks`, §5.3) and returns the `BacklinkResult`. */
export const IPC_RAG_BACKLINKS = 'provident:rag-backlinks'
export interface RagBacklinksPayload {
  nodeId: string
}
/** The `rag-backlinks` IPC result — the JSON-safe transport of the enumeration's
 *  `BacklinkResult`. Mirrors the MCP `rag.backlinks` result so both surfaces are
 *  equivalent. */
export type RagBacklinksResult = BacklinkResult
```

- **Main handler:** `ipcMain.handle(IPC_RAG_BACKLINKS, ...)` delegates to a
  shared `handleRagBacklinksIpc(store, payload)` that calls the SAME
  `enumerateLinks` (the same function as the MCP `rag.backlinks` tool) and
  returns the `BacklinkResult`. On an invalid `nodeId` it throws the same
  documented `rag.backlinks` fail-state (so the IPC rejects identically to the
  MCP tool).
- **Preload bridge:** the renderer-side preload exposes the `rag-backlinks` IPC
  (e.g. `rag.backlinks` on the bridge), mirroring the `rag-query` bridge method
  (Unit E §5.7).
- **Same module:** both the MCP `rag.backlinks` tool and the UI `rag-backlinks`
  IPC call the same `enumerateLinks` on the same store. Neither computes the
  enumeration in the renderer.
- **Equivalence test:** an MCP `rag.backlinks` and a UI `rag-backlinks` IPC with
  the same `nodeId` produce the same result (same `BacklinkResult`).

**Fail-states (TestWriter red set):**

- `rag.backlinks` with a missing/empty `nodeId` → the tool rejects it
  (`'rag.backlinks: nodeId required'`).
- `rag.backlinks` with the `rag` group disabled → not registered, not callable
  (Unit B §5.3).
- A `rag.backlinks` that reaches the renderer switch → `unknown method` throw
  (fail-closed, the negative contract — Unit B §5.3 Seam 4).
- The `rag-backlinks` IPC with a missing/empty `nodeId` → rejects with the same
  `'rag.backlinks: nodeId required'` error (the IPC mirrors the MCP tool's
  fail-state).

### 5.5 The five-seam gate for `rag.backlinks` + `rag-backlinks`

`rag.backlinks` is read-only, `rag`-group, default-off (matching `rag.query`).
It was registered in Unit B §5.3; Unit G implements the FULL handler. The
`rag-backlinks` IPC is a separate renderer→main IPC (not an MCP tool).

- **Seam 1 — `src/main/security.ts` TOOL_GROUPS:** `rag.backlinks` → `'rag'`
  (already present — Unit B §5.3). `defaultSecurityConfig()` stays
  `{ token: null, enabled: ['read', 'dispatch'] }` — `rag` is NOT enabled by
  default.
- **Seam 2 — `src/main/mcp-server.ts` ALL_TOOLS + registerTools:** `rag.backlinks`
  is in ALL_TOOLS (already present — Unit B §5.3); the handler is main-handled
  (calls the main-process RAG store — SINGLE-WRITER-STORE), NEVER routed to the
  renderer. Unit G replaces the placeholder handler with the FULL behavior
  (§5.4). The tool depends on the `RagStore` INTERFACE (Unit A §5.4 —
  SOURCE-SWITCHABLE), never the concrete JSON store.
- **Seam 3 — `src/shared/types.ts` RpcMethod:** `'rag.backlinks'` is in the
  `RpcMethod` union (already present — Unit B §5.3). The `rag-backlinks` IPC is
  a SEPARATE IPC channel constant (`IPC_RAG_BACKLINKS`), NOT an RpcMethod —
  mirroring the `rag-query` IPC (Unit E §5.7), which is also a channel constant,
  not an RpcMethod.
- **Seam 4 — renderer switch (`src/renderer/renderer.ts` `handleRequest`):**
  **Negative contract:** `rag.backlinks` is main-handled and NEVER reaches the
  renderer switch (intercepted in `mcp-server.ts`, like `module.*`). The switch
  needs NO new case. A `rag.backlinks` method that somehow reaches the renderer
  hits the `default` branch and throws `unknown method` (fail-closed).
- **Seam 5 — `MUTATING_METHODS` (`src/renderer/renderer.ts`):** **Negative
  contract:** `rag.backlinks` is read-only and does NOT mutate the renderer
  graph, so it is NOT added to `MUTATING_METHODS`.

### 5.6 Integration with the RAG store + traversal

- **The crosslink/backlink data lives in the RAG store (authoritative).** A
  crosslink is a `crosslink` edge (`{ kind: 'crosslink', source, target,
  documentIds? }` — §5.1). The store is the source of truth; the provident graph
  is a transient render materialization (RAG-AUTHORITATIVE).
- **The traversal emits outgoing crosslinks into the provident graph** (§5.2):
  the traversal produces a `crosslinks: CrosslinkWiring[]` output. This is the
  Unit G deliverable — the traversal-side wiring of each `crosslink` edge whose
  SOURCE is materialized (outgoing-only), with a dangling string target when the
  target is in a different document.
- **The RENDERER materialization of the `Link`/`Anchor` from the `crosslinks`
  wiring is a Unit H consumer** (the renderer/display surface — the actual DOM
  rendering of the crosslink links, a `source` anchor on the source subtree
  root + a `target` anchor on the target subtree root, plus the hover-preview
  pane from `docs/pending.md`). Unit G delivers the wiring output + the
  enumeration + the MCP/UI equivalence; the renderer walks the wiring and
  creates the `Link`/`Anchor` post-`translateLegacy` when the renderer surface
  (Unit H) lands. The greens verify the traversal output, not the renderer DOM.
- **The backlink enumeration reads the store** (§5.3): `listBacklinks`/
  `listOutlinks`/`enumerateLinks` read `store.listEdges()` + the doc-flow edges
  for document membership. The enumeration is read-only and lock-free (Unit A
  §5.5).
- **The `rag.backlinks` MCP tool + `rag-backlinks` IPC call the same
  enumeration** (§5.4) — MCP/UI equivalence (§8.2).
- **The Unit H sidebar pane is the UI consumer** — it reads the enumeration via
  the `rag-backlinks` IPC (or the MCP tool) to display crosslinks/backlinks.
  The pane UI is NOT spec'd here (Unit H).

## 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`listBacklinks` happy:** a node with incoming edges → the edges that target
   it, each with the scope classification, in store order.
2. **`listOutlinks` happy:** a node with outgoing edges → the edges it sources,
   in store order.
3. **`enumerateLinks` happy:** the combined result (backlinks + outlinks +
   crosslink subsets).
4. **Cross-document classification:** a `crosslink` edge between two nodes in
   different documents → `scope: 'cross-document'`.
5. **Intra-document classification:** a `next-section` edge within one document
   → `scope: 'intra-document'`.
6. **Unscoped classification:** an edge whose source or target has no document
   membership → `scope: 'unscoped'`.
7. **`documentOf` happy:** a node in a document's flow → the document root
   id(s).
8. **`rag.backlinks` happy:** a valid `nodeId` → the tool returns the
   `BacklinkResult`.
9. **`rag-backlinks` IPC happy:** a valid `nodeId` → the IPC returns the same
   `BacklinkResult`.
10. **MCP/UI equivalence happy:** an MCP `rag.backlinks` and a UI `rag-backlinks`
    IPC with the same `nodeId` → the same result.
11. **Traversal crosslink materialization happy:** a document with an outgoing
    crosslink → the traversal emits a `CrosslinkWiring` entry; the renderer
    materializes the `Link`/`Anchor` (a `source` anchor on the source root, a
    `target` anchor on the target root).
12. **Traversal crosslink with a dangling target:** a crosslink whose target is
    in a different (not-currently-rendered) document → the source anchor is
    materialized; the target anchor is a dangling string reference
    (`'rag-<targetRagNodeId>'`); no throw.
13. **`edit.set_edge` creating a crosslink:** `edit.set_edge` with
    `kind: 'crosslink'` → the edge is created (a structural op → journaled →
    re-traversal).
14. **Crosslink edge in the journal:** a `crosslink` edge add/remove → journaled
    as a structural entry → re-traversal.
15. **A `crosslink` edge with `documentIds`:** a crosslink edge with multiple
    document owners → the `documentIds` is stored (deduped) and surfaced in the
    enumeration's `LinkEntry.documentIds`.

## 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`listBacklinks`/`listOutlinks`/`enumerateLinks` with a null/undefined
   `store`** → throws `Error('backlinks: store required')`.
2. **`listBacklinks`/`listOutlinks`/`enumerateLinks` with a non-string/empty
   `nodeId`** → throws `Error('backlinks: nodeId required')`.
3. **`documentOf` with a null/undefined `store` or a non-string `nodeId`** →
   throws `Error('documentOf: store/nodeId required')`.
4. **A nonexistent `nodeId`** → an empty result (no throw): `listBacklinks` →
   `[]`, `listOutlinks` → `[]`, `enumerateLinks` → the empty `BacklinkResult`.
5. **`rag.backlinks` with a missing/empty `nodeId`** → the tool rejects it
   (`'rag.backlinks: nodeId required'`).
6. **`rag.backlinks` with the `rag` group disabled** → not registered, not
   callable (Unit B §5.3).
7. **A `rag.backlinks` that reaches the renderer switch** → `unknown method`
   throw (fail-closed, the negative contract — Unit B §5.3 Seam 4).
8. **A `crosslink` edge with `order`** → rejected by the store (per-kind field
   enforcement — `order` is only valid on `doc-child`).
9. **A self-referential `crosslink` edge (`source === target`)** → rejected by
   the store (Unit A §5.1).
10. **A `crosslink` edge referencing a nonexistent/quarantined node** → rejected
    by the store (`rag putEdge: source/target node not found or quarantined` —
    Unit A fail-state).
11. **`edit.set_edge` with `kind: 'crosslink'` referencing a nonexistent node** →
    the op returns `{ ok: false, error: 'edit.set_edge: source/target node not
    found or quarantined' }` (Unit D §5.1.7).
12. **A `crosslinks` wiring entry whose source root is NOT found in the
    translated tree** → the renderer SKIPS that crosslink's materialization (no
    throw; the graph still renders).
13. **A `Link` created with a config whose `roles` does not include
    `'source'`/`'target'`** → `Link.addAnchor` throws
    `LinkConfigError('role-mismatch')` (a defensive fail-state; the spec pins
    `CROSSLINK_LINK_CONFIG` with the correct roles).

## 5.10 Census / numeric claims

- **Edge kinds:** 6 (the 5 existing — `parent-child`, `doc-head`,
  `next-section`, `doc-end`, `doc-child` — + `crosslink`).
- **Custom `LinkConfig`:** 1 (`CROSSLINK_LINK_CONFIG`, `name: 'crosslink'`,
  `roles: ['source', 'target']`).
- **Enumeration functions:** 3 (`listBacklinks`, `listOutlinks`,
  `enumerateLinks`) + 1 helper (`documentOf`).
- **`LinkScope` values:** 3 (`cross-document`, `intra-document`, `unscoped`).
- **`LinkEntry` fields:** 6 (`edge`, `kind`, `source`, `target`, `documentIds?`,
  `scope`).
- **`BacklinkResult` fields:** 5 (`nodeId`, `backlinks`, `outlinks`,
  `crosslinkBacklinks`, `crosslinkOutlinks`).
- **MCP tool:** 1 (`rag.backlinks` — already registered in Unit B §5.3; Unit G
  implements the FULL handler).
- **IPC:** 1 (`rag-backlinks`, renderer → main — `IPC_RAG_BACKLINKS`).
- **Traversal output:** 1 new field (`crosslinks: CrosslinkWiring[]`).
- **`CrosslinkWiring` fields:** 3 (`edgeId`, `sourceRagNodeId`,
  `targetRagNodeId`).

## 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (the `RagEdgeKind` union — the
  `crosslink` kind is added here; the per-kind field enforcement — `order` only
  on `doc-child`, `documentIds` on any kind), §5.4 (the `RagStore` interface —
  the enumeration depends on the interface, NOT the concrete JSON store, so the
  source is switchable), §5.5 (single-writer queue — the enumeration is
  read-only and lock-free), §5.6 (project journal — a `crosslink` edge is a
  structural entry).
- Unit B: `docs/specs/unit-b-document-model.md` §5.1 (doc-flow edge semantics —
  the document-membership derivation in §5.3 reads the `doc-head`/`next-section`/
  `doc-end` edges scoped by `documentIds`), §5.3 (five-seam gate — `rag.backlinks`
  registered), §5.4 (the `rag.backlinks` tool schema).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalResult` — the
  `crosslinks` field is added), §5.2 (envelope rules — the stable authored id
  `rag-<id>` the renderer resolves the crosslink roots by), §5.3 (back-reference
  map), §5.4 (the render path — `translateLegacy` mints the live Nodes the
  crosslink `Link`/`Anchor` are created on).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.7 (`setEdge` — creating a
  `crosslink` edge), §5.1.9 (`rag-store-changed` — the re-traversal trigger a
  crosslink edge add/remove fires).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.7 (the `rag-query` IPC pattern the
  `rag-backlinks` IPC mirrors).
- Gate: `docs/specs/astrographer-review.md` §8.2 (MCP/UI equivalence — a BINDING
  constraint), §9.2.7 (RAG-EDIT-MCP-GROUPS), §13 (cross-document shared nodes —
  the `documentIds` field + the CROSS-DOCUMENT-SHARED model), §9.2.6
  (SINGLE-WRITER-STORE).
- Decisions: `docs/decisions.md` rows **RAG-EDIT-MCP-GROUPS**,
  **CROSS-DOCUMENT-SHARED**, **SINGLE-WRITER-STORE**, **RAG-AUTHORITATIVE**.
  New rows pinned by this spec (added when the unit lands): **CROSSLINK-EDGE-KIND**,
  **CROSSLINK-LINKCONFIG**.
- Engine surfaces: `types.d.ts` (`LinkConfig` — the OPEN `name` union, `Link`,
  `Anchor`, `Role`), `link.d.ts`/`link.js` (the `Link` class — `baseFor(name)`
  returns `DEFAULT_PARENT_CHILD` for an unknown name, so the custom config MUST
  override `roles`; `addAnchor` throws `LinkConfigError('role-mismatch')` for a
  role not in `config.roles`), `translate.d.ts` (`createLinkHub`,
  `LinkConfigNameHub` — the same-name sharing mechanism for
  `component`/`placement` links, NOT used for crosslinks).
- Unit H: `docs/specs/unit-h-sidebar-panes.md` (the UI consumer — the sidebar
  pane reads the enumeration via the `rag-backlinks` IPC or the MCP tool; NOT
  spec'd here).
