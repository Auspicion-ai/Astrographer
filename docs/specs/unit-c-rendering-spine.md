# Spec — Unit C: Rendering Spine

- **Status:** SPEC (first-milestone Unit C). Gate reference:
  `docs/specs/astrographer-review.md` §8.1 (RAG-authoritative → traversal →
  materialized graph), §9.2.2 (back-reference carrier), §9.2.4 (render path =
  `LegacyInitialData` → `translateLegacy` → `renderProducingProcess`), §9.2.8
  (MULTI-PARENT-DUPLICATE), §9.3(c) (traversal execution site + back-reference
  map home), §9.3(h) (multi-parent duplicate coherence), §10 (SUBTREE-
  OWNERSHIP), §10.3 Q1-Q5 (hard precondition, subtree boundary, line→node map,
  engine invariants). Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **MULTI-PARENT-DUPLICATE**, **SINGLE-WRITER-STORE**,
  **DERIVED-DOC-FLOW**.
- **Scope:** the main-process traversal producing TWO outputs — the
  `LegacyInitialData` envelope AND the back-reference `Map<ragNodeId, nodeId[]>`
  — the envelope shipped to the renderer for `translateLegacy` →
  `renderProducingProcess`; the container-producer hard precondition; the
  multi-parent duplicate coherence; the coarse line→node map; and MCP/UI
  equivalence verified on the spine. This unit does NOT implement editing
  (Unit D), retrieval (Unit E), or crosslinks (Unit G); it defines the render
  spine those units build on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE.

---

## 1. What the proposal asks

1. A **main-process traversal** that compiles the relevant RAG nodes/edges into
   a provident subtree, producing TWO outputs: the `LegacyInitialData` envelope
   AND the back-reference `Map<ragNodeId, nodeId[]>`.
2. The envelope is shipped to the renderer for `translateLegacy` →
   `renderProducingProcess` (the "ordered element payload" IS the
   `CompiledState[]` — coherent, not hand-rolled).
3. Each RAG object's subtree is emitted as a `ContentPayload.content[]` root
   with `placement.targetPlacement`, attached into a root-visible zone.
4. **HARD PRECONDITION:** the traversal must ALSO emit a `container`-role
   producer (`placementName`) for every targeted zone, or the subtree stays
   `unplaced` and won't render.
5. **Multi-parent duplicate coherence:** content edits update all duplicates, or
   explicit cross-duplicate staleness until the next structural rebuild.
6. The **coarse line→node map** (whole subtree → one RAG object) as a
   first-class assembly output.
7. **MCP/UI equivalence** verified on the spine.

## 2. Feasibility verdict

**Feasible — grounded in the engine's placement model and the foundation's
render path.**

- **Envelope → translateLegacy → renderProducingProcess:** the foundation's
  `Runtime` (`src/renderer/runtime.ts`) already implements this exact path:
  `loadEnvelope` → `translateLegacy` → register → compile → render, and
  `renderProducingProcess` is the canonical re-emit loop
  (`render-helpers.d.ts`). The traversal produces the envelope; the renderer
  consumes it.
- **Subtree as a `ContentPayload.content[]` root with `targetPlacement`:** the
  engine's `translateLegacy` maps `ContentPayload.content[]` to
  contentNodes-owned content roots (family-'in-tree' via the permanent-owner
  token, dropped from compile until attached — translate.md §2, node.md P3
  §2.4/F-13). `targetPlacement: string[]` mints one ordered `content` anchor per
  requested name (translate.md §2, P3 §1.2). The placement path (content anchor
  → per-name placement Link → container producer) makes the root render-eligible
  (compilePath enumerates path-states to `'rootNode'`).
- **HARD PRECONDITION (container producer):** the focused validity check
  (§10.3 Q1) confirmed: a content root is render-eligible only when a real edge
  supersedes the `contentNodes` token. The placement path is that edge; it
  requires a `container`-role producer (`placementName`) for the targeted zone.
  With no container for the name, the content anchor resolves to nothing and the
  root stays `unplaced` (silently not render-eligible). The traversal MUST emit
  the container producers.
- **Back-reference map:** the host-side `Map<ragNodeId, nodeId[]>` is the SOLE
  authoritative carrier (survives all surfaces; never stale across a rebuild —
  §9.2.2). The traversal runs `translateLegacy` (provident-ssr is a pure
  module, importable in main) to obtain the minted node ids and build the map.
- **Multi-parent duplicate:** the engine's single-parent family model (SI-1)
  cannot represent a multi-parent RAG node; duplicate-per-parent (distinct
  content roots sharing the RAG id via the map) is the only option that respects
  the engine model (§9.2.8).
- **Line→node map:** the MarkdownAdapter drops `data-node-id` (D7), so the map
  is produced by the assembly step (host-side) and is COARSE (whole subtree →
  one RAG object) — §10.3 Q3.

No engine/foundation gap blocks this unit. The traversal, back-reference map,
subtree-boundary convention, container-producer emission, and line→node map are
all project-specific (compose `translateLegacy`/`renderProducingProcess`).
ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) stays a non-blocking handoff item
(the host-side line→node map covers it).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Main-process traversal (envelope + back-reference map) | Project-specific (composes `translateLegacy`/`renderProducingProcess`) | Medium cost; the load-bearing spine of RAG-AUTHORITATIVE. |
| Container-producer emission (hard precondition) | Project-specific (the traversal must emit `placementName` producers) | Low cost; without it the subtree silently stays unplaced. |
| Back-reference map lifecycle | Project-specific (the SOLE authoritative carrier) | Medium cost; the reconciliation across the main-process translate and the renderer translate (§5.4). |
| Multi-parent duplicate coherence | Project-specific (duplicate subtrees sharing the RAG id) | Medium cost; the only option respecting SI-1. |
| Coarse line→node map | Project-specific (the assembly step; MarkdownAdapter drops node identity) | Low cost; the agent cites the RAG object, not a leaf. |
| MCP/UI equivalence on the spine | Project-specific (both load the same envelope) | Low cost; reuses the foundation's `provident.load` + `loadEnvelope`. |

No engine gap. ENG-GAP-1 stays a non-blocking handoff item.

## 4. Design decisions pinned by this spec

- **RAG-AUTHORITATIVE:** the RAG store is authoritative; the provident graph is
  a transient render materialization produced by the traversal. The graph is a
  pure projection of the RAG store.
- **SUBTREE-OWNERSHIP:** a RAG object owns a subtree of provident nodes; the
  back-reference is many-to-one (`Map<ragNodeId, nodeId[]>`).
- **MULTI-PARENT-DUPLICATE:** a multi-parent RAG node is materialized as
  duplicate subtrees (distinct content roots sharing the RAG id via the map).
- **SINGLE-WRITER-STORE:** the traversal reads the RAG store; edits route
  through the single-writer queue (Unit A).
- **DERIVED-DOC-FLOW:** the traversal maps doc-flow edges to family order + a
  doc-head marker prop, validating and falling back to family pre-order (Unit B).
- **DOC-CHILD (nested semantic units):** a RAG object's subtree can CONTAIN
  nested subtrees owned by its doc-children; the traversal materializes them at
  the doc-child `order` position. The parent's `ownedNodeIds` EXCLUDES the
  doc-children's nodes. (User clarification 2026-08-26 — review §12.)

## 5. The exhaustive contract

### 5.1 Traversal input/output

```ts
// src/main/traversal.ts (project-specific; pure, no Electron — importable in
// main and renderer).

export interface TraversalInput {
  /** The RAG store (Unit A). Read-only for the traversal. */
  store: RagStore
  /** The documents to materialize (RAG document ids). */
  documentIds: string[]
  /** The root-visible zone to attach the RAG subtrees into. */
  zoneName: string
}

export interface TraversalResult {
  /** The envelope shipped to the renderer for translateLegacy →
   *  renderProducingProcess. */
  envelope: LegacyInitialData
  /** The back-reference map: RAG object id → its owned provident node ids.
   *  The SOLE authoritative carrier (never stale across a rebuild). */
  backRefs: Map<string, string[]>
  /** The coarse line→node map: each RAG object → its line range in the
   *  rendered markdown. First-class assembly output. */
  lineMap: LineNodeMap
}

export function buildTraversal(input: TraversalInput): TraversalResult
```

**Throws:** `buildTraversal` throws `Error('traversal: store/documentIds/zoneName required')`
if `input` is null/undefined or any required field is missing/invalid. It does
NOT throw on a doc-flow validation failure (it falls back to family pre-order —
Unit B §5.2).

### 5.2 Envelope shape

The envelope is a `LegacyInitialData`:

```ts
envelope = {
  template: {
    root: {
      type: 'div',
      props: { id: 'wiki-root' },
      children: [
        // CONTAINER PRODUCERS — one per targeted zone (the HARD PRECONDITION).
        // Each offers the zone via placement.placementName (a container-role
        // producer). In-tree (attached to root) so the zone is offered.
        { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
        // ... one per distinct zoneName in any targetPlacement
      ]
    }
  },
  content: [
    // ONE ContentPayload per RAG subtree.
    {
      content: [
        {
          type: <ragNodeType>,                       // h1-h6/p/ul/ol/li/... (RagNodeType)
          props: {
            id: 'rag-<ragNodeId>',                   // STABLE authored id (reconciliation key)
            'data-doc-head': <true | undefined>,     // the doc-head marker prop (Unit B §5.1)
          },
          content: <ragNode.content>,                // the subtree root's text
          placement: { targetPlacement: ['main'] },  // the root-visible zone
          children: [ ...subtree children... ],       // the RAG object's owned subtree
        }
      ]
    }
    // ... one ContentPayload per RAG subtree
  ],
  clientConfig: { runInstantiation: true, runRendering: true }
}
```

**Envelope rules:**

1. **Container producers (HARD PRECONDITION):** for every distinct zone name in
   any RAG subtree's `targetPlacement`, the traversal MUST emit a
   `container`-role producer node (`placement.placementName: <zone>`) in the
   template (in-tree). With no container for the name, the content anchor
   resolves to nothing and the root stays `unplaced` (silently not
   render-eligible — §10.3 Q1). The traversal MUST NOT emit a `targetPlacement`
   naming a zone it does not also produce a container for.
2. **Stable authored id:** each RAG subtree root carries `props.id =
   'rag-<ragNodeId>'` (a stable authored id derived from the RAG node id). This
   is the reconciliation key between the main-process back-reference map and the
   renderer's translated tree (§5.4).
3. **Doc-head marker prop:** a RAG node that is a document head carries
   `props['data-doc-head'] = true` on its subtree root (Unit B §5.1).
4. **Subtree children:** the RAG object's owned subtree is emitted as the
   content root's `children` (ordinary `NodeData.children` under the root).
5. **Formatting → element type:** RAG text → `content`; formatting → element
   `type` (h1-h6/p/ul/ol/li/blockquote/pre/code/strong/em/a/img). CSS is used
   only for non-semantic styling (MarkdownAdapter drops `css:*`, D5).
6. **Doc-child nesting (Unit B §5.1 / review §12):** a RAG object's subtree can
   CONTAIN nested subtrees owned by its doc-children. When materializing a
   parent RAG object's subtree, the traversal emits the parent's owned nodes AND,
   at the position of each doc-child (by the `doc-child` edge `order`), the
   doc-child RAG object's OWN subtree (its content root + its children). The
   engine's family structure (e.g. `ul` → `li`) is the RENDER structure; the
   `doc-child` edge expresses the SEMANTIC ownership boundary. A doc-child's
   subtree root carries its own stable authored id (`rag-<docChildRagNodeId>`)
   and its own `data-doc-head` marker if it is a document head. The parent RAG
   object's `ownedNodeIds` EXCLUDES the nodes owned by its doc-children (Unit B
   §5.1).

### 5.3 Back-reference map lifecycle

- **Shape:** `Map<ragNodeId, nodeId[]>` — one RAG object → its owned provident
  node ids (many-to-one, §10.1).
- **Rebuilt per traversal:** every `buildTraversal` produces a fresh map. It is
  the SOLE authoritative carrier (survives all surfaces; never stale across a
  rebuild — §9.2.2).
- **Construction:** the traversal runs `translateLegacy` on the envelope
  (provident-ssr is a pure module, importable in main) to obtain the minted
  provident node ids, then maps each RAG subtree root (by its stable authored
  id `rag-<ragNodeId>`) to the minted ids of its subtree.
- **Reconciliation with the renderer:** the renderer's `Runtime` re-translates
  the envelope (minting fresh node ids). The back-reference map is reconciled
  against the renderer's translated tree by the stable authored root id
  (`rag-<ragNodeId>`): the renderer resolves each RAG object's owned node ids
  by walking the subtree from the stable root id. The map is authoritative; the
  owned node ids are resolved at render time.
- **Dangling back-reference:** a back-reference whose RAG node was deleted marks
  the element **read-only**; commit-on-blur (Unit D) refuses a write to a
  deleted node (§9.2.2).

### 5.4 Render path

- **Envelope → translateLegacy → renderProducingProcess:** the envelope is
  shipped to the renderer. The renderer's `Runtime` (foundation) loads it via
  `loadEnvelope` (→ `translateLegacy` → register → compile → render) and
  re-emits via `renderProducingProcess` (the canonical loop). The "ordered
  element payload" IS the `CompiledState[]` — coherent, not hand-rolled
  (§9.2.4).
- **Placement-routed bootstrap:** the renderer's `Runtime` already detects a
  placement-routed tree (`isPlacementRouted()` — any node with a `content`-role
  anchor) and bootstraps via the path-enumeration `compilePath` pass
  (`runtime.ts`), which enumerates path-states to `'rootNode'`. The RAG
  subtrees (content roots with `targetPlacement`) are placement-routed, so this
  path applies.
- **MCP/UI equivalence:** the same envelope is loadable through BOTH the MCP
  surface (`provident.load` with `kind: 'envelope'`) and the UI (the renderer's
  `loadEnvelope`). The back-reference map is available to both MCP and UI
  (§9.3(c)). The same graph, the same rendering, and the same operations are
  reachable equivalently through both (§8.2).

### 5.5 Multi-parent duplicate coherence

- **Materialization:** a RAG node owned by multiple parents is materialized as
  **duplicate subtrees** — each a distinct content root sharing the same RAG
  object id via the back-reference map (respecting SI-1, §9.2.8).
- **Content-edit coherence:** a content edit on a multi-parent RAG node must
  update ALL materialized duplicates (state-slice every duplicate), OR the host
  explicitly accepts **cross-duplicate staleness** until the next structural
  rebuild (§9.3(h)). The spec pins: the default is **update-all-duplicates**
  (a content edit writes back to the RAG store → re-traversal, which
  re-materializes all duplicates consistently). Cross-duplicate staleness is
  only acceptable for a content edit that does NOT trigger a re-traversal (a
  pure in-place state-slice), and must be explicitly documented as stale until
  the next structural rebuild.
- **Structural edits always re-traverse:** a structural edit (node add/delete/
  split/merge, edge add/remove/retarget, doc-flow role change) triggers a full
  re-traversal, which re-materializes all duplicates consistently.

### 5.6 The coarse line→node map

- **Shape:** a range-based map — each RAG object → its line range in the
  rendered markdown.

```ts
export interface LineNodeMap {
  /** Each RAG object → its line range (0-based, inclusive start, exclusive end)
   *  in the full rendered markdown output. */
  ranges: Array<{ ragNodeId: string; startLine: number; endLine: number }>
}
```

- **Coarse by design:** all lines of a subtree's markdown map to the owning RAG
  object (the whole `ul`+`li` chunk), so the agent cites the RAG object, not a
  leaf (§10.3 Q3). Per-leaf citation is impossible by design (MarkdownAdapter
  drops `data-node-id`, D7).
- **First-class assembly output:** the line→node map is produced by the assembly
  step (host-side), NOT by the MarkdownAdapter. It is a READ aid (the agent
  cites the owning RAG object), not a write-back path (markdown is export-only —
  §11).
- **Lifecycle:** rebuilt per traversal alongside the back-reference map.

### 5.7 Happy-path states (TestWriter red set — valid paths)

1. **Single document, single zone:** a document with one RAG subtree →
   `buildTraversal` returns an envelope with one container producer (`main`) +
   one `ContentPayload` (the subtree root with `targetPlacement: ['main']`); the
   back-reference map has one entry (RAG id → the subtree's minted node ids);
   the line→node map has one range.
2. **Multiple documents, one zone:** several documents → one container producer
   per distinct zone + one `ContentPayload` per RAG subtree; the back-reference
   map has one entry per RAG object.
3. **Valid doc-flow:** a document with a valid `doc-head`/`next-section`/
   `doc-end` chain → the traversal maps the edges to family child-anchor order
   + the doc-head marker prop; the head node's subtree root carries
   `props['data-doc-head'] = true`.
4. **Doc-flow violation → fallback:** a document with a `next-section` cycle →
   the traversal falls back to family pre-order (no throw); the envelope still
   renders.
5. **Multi-parent node:** a RAG node with two `parent-child` edges →
   materialized as two duplicate subtrees, both sharing the RAG id in the
   back-reference map.
6. **Render path:** the envelope loads through `provident.load` (MCP) and
   `loadEnvelope` (UI) → `translateLegacy` → `renderProducingProcess` produces
   the `CompiledState[]`; the RAG subtrees render in the root-visible zone.
7. **MCP/UI equivalence:** the same envelope + back-reference map reachable
   through both MCP and UI; the rendered output is identical.
8. **Doc-child nesting:** a `ul` RAG object with four paragraph-length `li`
   doc-children → the traversal emits the `ul` content root with the four
   `li` doc-child subtrees nested at their `order` positions; the back-reference
   map has one entry for the `ul` RAG object (its owned nodes, excluding the
   `li`s) + one entry per `li` doc-child RAG object; the line→node map maps each
   `li`'s lines to its own doc-child RAG object.

### 5.8 Fail-states (TestWriter red set — documented fail-states)

1. **`buildTraversal` with null/undefined input or missing required field** →
   throws `Error('traversal: store/documentIds/zoneName required')`.
2. **HARD PRECONDITION violation:** a `targetPlacement` naming a zone with no
   container producer → the subtree stays `unplaced` (silently not
   render-eligible). The traversal MUST NOT emit such a `targetPlacement`; a
   test asserts the traversal always emits a container producer for every
   targeted zone.
3. **Empty document:** a document with no RAG nodes → the traversal emits no
   `ContentPayload` for it (no throw); the envelope still has the container
   producers.
4. **Dangling back-reference:** a back-reference whose RAG node was deleted →
   the element is read-only; commit-on-blur (Unit D) refuses a write to a
   deleted node.
5. **Doc-flow validation failure** (cycle/missing-node/missing-head) → the
   traversal falls back to family pre-order (no throw) — Unit B §5.2.
6. **A RAG node with no `ownedNodeIds`** → the traversal derives the owned set
   from the subtree structure (the content root + its children); the
   back-reference map still records the RAG object → its subtree's node ids.
7. **A malformed envelope** (e.g. a `targetPlacement` that is not a string
   array) → `translateLegacy` warns + skips (the engine's `placement-name-invalid`/
   `placement-target-invalid` guards); the subtree may not render. The traversal
   must emit well-formed `targetPlacement: string[]`.
8. **Doc-child nesting cycle** (a RAG object is a doc-child of itself,
   transitively) → the traversal falls back to family pre-order (no throw) —
   Unit B §5.2 (the `cycle` reason covers a `doc-child` nesting cycle).

### 5.9 Census / numeric claims

- **Traversal outputs:** 2 (the envelope + the back-reference map) + 1
  first-class assembly output (the line→node map).
- **Container producers:** exactly one per distinct targeted zone name.
- **ContentPayloads:** exactly one per RAG subtree (a doc-child's nested
  subtree is emitted WITHIN its parent's subtree, not as a separate
  ContentPayload — the doc-child's content root is a child of the parent's
  content root).
- **Back-reference map:** one entry per RAG object; values are the owned provident
  node ids (≥ 1 per subtree root). A doc-child RAG object has its own entry
  (its owned nodes, EXCLUDING any deeper doc-children).
- **Line→node map:** one range per RAG object (a doc-child's lines map to the
  doc-child RAG object, not the parent).

### 5.10 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (RAG node/edge shapes,
  `ownedNodeIds`), §5.5 (single-writer queue), §5.6 (project journal).
- Unit B: `docs/specs/unit-b-document-model.md` §5.1 (doc-flow semantics,
  doc-head marker prop, subtree-boundary convention), §5.2 (edge validation +
  fallback), §5.3 (five-seam gate).
- Gate: `docs/specs/astrographer-review.md` §8.1, §8.2, §9.2.2, §9.2.4, §9.2.8,
  §9.3(c), §9.3(h), §10, §10.3 Q1-Q5, §11, §12 (doc-child nesting).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **MULTI-PARENT-DUPLICATE**, **SINGLE-WRITER-STORE**,
  **DERIVED-DOC-FLOW**, **MARKDOWN-EXPORT-ONLY**.
- Foundation render path: `src/renderer/runtime.ts` (`loadEnvelope`,
  `isPlacementRouted`, `renderProducingProcess`), `src/renderer/renderer.ts`
  (`handleRequest` `load` case).
- Engine surfaces: `translate.d.ts` (`LegacyInitialData`, `LegacyContentPayload`,
  `LegacyPlacementConfig`, `translateLegacy`), `render-helpers.d.ts`
  (`renderProducingProcess`, `RenderOptions`), `node.d.ts` (P3 §2.4,
  `compilePath`), `types.d.ts` (`Role`, `CompiledState`).
- Upstream specs: `translate.md` §2 (contentNodes-owned content roots,
  `targetPlacement` → ordered `content` anchors, F-13), `node.md` §1.2 SI-1,
  §7.1 FS-10, P3 §2.4, `graph.md` §3 (placement Link = zone registry),
  `payload.md` P-4/P-5, `adapters.md` §4.7 D5/D7.
