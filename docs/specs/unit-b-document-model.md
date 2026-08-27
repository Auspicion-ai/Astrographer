# Spec — Unit B: Document Model + Doc-Flow + MCP Gating

- **Status:** SPEC (first-milestone Unit B). Gate reference:
  `docs/specs/astrographer-review.md` §3c (DERIVED-DOC-FLOW), §9.2.3
  (doc-flow edges authoritative + validation + fallback), §9.2.7
  (RAG-EDIT-MCP-GROUPS), Amendment 1 (gating decisions in Unit B), §10
  (SUBTREE-OWNERSHIP). Decisions: `docs/decisions.md` rows
  **DERIVED-DOC-FLOW**, **RAG-EDIT-MCP-GROUPS**, **SUBTREE-OWNERSHIP**,
  **SINGLE-WRITER-STORE**.
- **Scope:** the RAG node/edge type semantics (doc-flow edges authoritative in
  the store), traversal-time edge validation (cycle/missing-node/missing-head)
  with family-pre-order fallback, the doc-head marker prop convention, the
  subtree-boundary convention, and the `rag` (read-only, default-off) + `edit`
  (mutating, default-off) MCP tool-group decisions through the five-seam gate.
  This unit does NOT implement the traversal/render spine (Unit C) or the
  retrieval index (Unit E); it defines the model + the gating the later units
  build on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE.

---

## 1. What the proposal asks

1. **RAG node/edge types** with the doc-flow semantics: doc-flow edges
   (doc-head / next-section / doc-end) are **authoritative in the store** (not
   derived at render time), PLUS the **`doc-child` edge** for hierarchical
   nesting (a nested semantic unit — e.g. a paragraph-length `li` inside a
   `ul` — is its own RAG object, a doc-child of the containing RAG object).
   The traversal maps them to family child-anchor order + a doc-head marker
   prop.
2. **Traversal-time edge validation:** the traversal VALIDATES the doc-flow
   edges (cycle / missing-node / missing-head) and **falls back to family
   pre-order** on any violation.
3. **The doc-head marker prop convention:** a RAG node that is a document head
   carries a marker prop; the traversal emits it on the subtree root's
   provident element.
4. **The subtree-boundary convention:** which provident nodes belong to one RAG
   object (the `ownedNodeIds` declaration + the back-reference map).
5. **MCP gating decisions:** a new read-only `rag` tool group (default-off) + a
   new mutating `edit` tool group (default-off), each through the full
   five-seam gate. Editing is NEVER a `code`-group op.

## 2. Feasibility verdict

**Feasible — grounded in the engine's closed `Role` union and the foundation's
five-seam gate.**

- **Doc-flow as store-authoritative edges + a marker prop:** the engine's
  `Role` union is closed (`types.d.ts`: `'parent' | 'child' | 'source' |
  'target' | 'duplex' | 'container' | 'content' | 'component'`), so adding
  head/next/end roles is impossible. The review's resolution (§3c/§9.2.3) —
  store the doc-flow edges in the RAG store, map them to family child-anchor
  order + a doc-head marker prop at traversal — is the only option that
  respects the closed union. The marker prop is an engine-adjacent convention
  (allowed), documented here, not an engine feature.
- **Edge validation + family-pre-order fallback:** pure host-side logic over
  the RAG store (Unit A). No engine primitive needed.
- **MCP gating:** the five-seam gate is fully implemented in the foundation
  (`security.ts` TOOL_GROUPS/`groupForTool`/`toolAllowed`; `mcp-server.ts`
  ALL_TOOLS/`registerTools`; `shared/types.ts` RpcMethod; `renderer.ts`
  `handleRequest` + `MUTATING_METHODS`). Adding `rag`/`edit` groups mirrors the
  existing `module` group (main-handled tools). The `rag`/`edit` tools are
  **main-handled** (they call the main-process RAG store — SINGLE-WRITER-STORE),
  exactly like the `module.*` tools (`handleModuleTool`).

No engine/foundation gap blocks this unit. The doc-flow model and the gating
are project-specific (the RAG layer is not a foundation feature).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| Doc-flow edges authoritative in the store | Project-specific (the engine cannot express head/next/end roles — closed `Role` union) | Low cost; the only correct home given the closed union. |
| Traversal-time edge validation + fallback | Project-specific (pure host logic) | Low cost; prevents chain fragility (broken/cyclic chains undefined). |
| Doc-head marker prop convention | Engine-adjacent (allowed; documented as a convention, not an engine feature) | Low cost; a `props` marker on the head node. |
| `rag`/`edit` MCP groups | Project-specific (mirrors the foundation's `module` group pattern) | Low cost; reuses the five-seam gate. |

No engine gap. ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) stays a
non-blocking handoff item (the host-side line→node map covers it).

## 4. Design decisions pinned by this spec

- **DERIVED-DOC-FLOW:** doc-flow edges are authoritative in the RAG store; the
  traversal maps them to family order + a doc-head marker prop. No new engine
  roles, no document-flow `LinkConfig`.
- **RAG-EDIT-MCP-GROUPS:** `rag` (read-only, default-off) + `edit` (mutating,
  default-off), through the five-seam gate. Editing is NEVER a `code`-group op.
- **SUBTREE-OWNERSHIP:** a RAG object owns a subtree of provident nodes; the
  boundary is declared by `ownedNodeIds` and carried by the back-reference map
  (Unit C).
- **DOC-CHILD (nested semantic units):** a RAG object can own a subtree that
  CONTAINS nested subtrees owned by doc-child RAG objects (a paragraph-length
  `li` inside a `ul` is its own RAG object). The `doc-child` edge expresses
  hierarchical nesting, distinct from the linear doc-flow edges. A RAG object's
  `ownedNodeIds` EXCLUDES the nodes owned by its doc-children. (User
  clarification 2026-08-26 — `docs/specs/astrographer-review.md` §12.)
- **SINGLE-WRITER-STORE:** the `edit` tools route through the main-process
  store's single-writer queue (Unit A).

## 5. The exhaustive contract

### 5.1 RAG node/edge type semantics (refining Unit A §5.1)

The persisted shapes are defined in Unit A §5.1. This section pins their
*document-model semantics*.

**Doc-flow edge semantics (authoritative in the store):**

| Edge kind | Meaning | Direction |
| --- | --- | --- |
| `parent-child` | A RAG node's family parent. Multi-parent is allowed (a node may have several `parent-child` edges — MULTI-PARENT-DUPLICATE). | `source` is the parent, `target` is the child. |
| `doc-head` | `source` is the **head** of the document that `target` belongs to. A document has exactly one head. `documentIds` lists the document(s) this edge belongs to. | `source` = head node, `target` = a document-identifying node (the head's document root). |
| `next-section` | `source`'s next section in document order is `target`. **`documentIds` has ONE owner** — the target (next section) differs per document, so a node in multiple documents' flows has a separate `next-section` edge per document (CROSS-DOCUMENT-SHARED, review §13). | `source` → `target` (document order, within the edge's `documentIds`). |
| `doc-end` | `source` is the **end** of the document that `target` belongs to. A document has exactly one end. `documentIds` lists the document(s) this edge belongs to. | `source` = end node, `target` = a document-identifying node. |
| `doc-child` | **HIERARCHICAL NESTING** (distinct from the linear doc-flow edges): the `target` RAG object's subtree is nested WITHIN the `source` RAG object's subtree at the given `order` position. A nested node (e.g. a paragraph-length `li` inside a `ul`) that is large enough for semantic distinctiveness is its own RAG object, a doc-child of the containing RAG object. The engine's family structure (e.g. `ul` → `li`) is the RENDER structure; the `doc-child` edge expresses the SEMANTIC ownership boundary. | `source` = the containing RAG object, `target` = the nested RAG object, `order` = the position of the child's subtree within the parent's subtree. |

**Cross-document shared nodes (CROSS-DOCUMENT-SHARED, review §13):**

- A RAG node can appear in MULTIPLE documents at the same time. A shared node
  (e.g. A's spec, called by both Class B and Class C) has MULTIPLE `parent-child`
  edges — one from each document's use-case node. Per MULTI-PARENT-DUPLICATE, it
  is materialized as **duplicate subtrees** in each document, all sharing the same
  RAG id via the back-reference map. A text change to the shared node updates all
  duplicates (the content-edit path state-slices every duplicate, or a
  re-traversal re-materializes all consistently) — "if the text of A changes, so
  do both documents."
- **An edge can have MULTIPLE document owners in its metadata** — the
  `documentIds: string[]` field (document root node ids). A shared
  reference/content edge (e.g. the A→D edge carrying the shared explanation of
  D's use in function A) is used by both document B and document C, so it lists
  both. A `next-section` edge's TARGET (the next section) differs per document,
  so those are separate edges each with ONE owner. The traversal, when
  assembling document B, follows B's `next-section` edges; when assembling
  document C, follows C's.
- A shared node referenced by N documents is materialized as N duplicate
  subtrees — the cost of respecting the engine's single-parent family model
  (SI-1). The back-reference map keeps all duplicates coherent (one RAG id → N
  node-id sets).

**Doc-child semantics (refining SUBTREE-OWNERSHIP §10/§12):**

- A RAG object's `ownedNodeIds` EXCLUDES the nodes owned by its doc-children (those belong to the doc-children). The ownership is hierarchical: a parent RAG object owns its subtree, and within it, doc-child RAG objects own nested subtrees.
- The `doc-child` `order` positions the child's subtree within the parent's subtree relative to the parent's owned nodes and other doc-children. The cleanest mapping: the child's subtree is inserted at the position of the corresponding engine family child (e.g. the `li` node) within the parent's owned subtree.
- A doc-child RAG object's text = the markdown of its OWN subtree, embedded as a SEPARATE chunk (a paragraph-length `li` is its own embedding); the parent RAG object's text = the markdown of its subtree EXCLUDING the doc-children's subtrees (or including them as references). The exact chunking is a Unit E decision.

**Doc-head marker prop convention:**

- A RAG node that is a document head (the `source` of a `doc-head` edge) carries
  the marker prop `props['data-doc-head'] === true`.
- The traversal (Unit C) emits this marker as a prop on the subtree root's
  provident element, so the rendered document marks its head.
- This is a **convention**, not an engine feature (the engine's `Role` union is
  closed). It is documented here and in `docs/decisions.md` (DERIVED-DOC-FLOW).

**Subtree-boundary convention:**

- A RAG object (node/edge) OWNS a subtree of provident nodes. The boundary is
  declared by the RAG node's `ownedNodeIds` field (Unit A §5.1) and carried by
  the host-side back-reference map `Map<ragNodeId, nodeId[]>` (Unit C).
- The envelope structure alone cannot express the boundary (a content root's
  children are just family children with no "owned by RAG object X" marker —
  §10.2 Q2). The boundary is project-specific.
- A RAG object's text = the markdown of its whole subtree, embedded as ONE chunk
  (a `ul` + its `li` children are one RAG object / one embedding — §10.1).

### 5.2 Traversal-time edge validation

The traversal (Unit C) validates the doc-flow edges before mapping them to
family order. The validation is a pure function over the RAG store:

```ts
// src/main/doc-flow.ts (project-specific; pure, no Electron).

export type DocFlowVerdict =
  | { ok: true; order: string[] }   // the document order (RAG node ids), head-first
  | { ok: false; reason: 'cycle' | 'missing-node' | 'missing-head'; detail: string }

/** Validate the doc-flow edges for one document and produce the document
 *  order. On any violation, the caller falls back to family pre-order. */
export function validateDocFlow(
  nodes: RagNode[],
  edges: RagEdge[],
  documentId: string,
): DocFlowVerdict
```

**Validation rules** (`validateDocFlow(nodes, edges, documentId)` validates ONE
document's flow, scoped by `documentId`; a shared node in multiple documents'
flows is validated independently per document):

1. **Missing-head:** if the document has no `doc-head` edge (or the head node
   does not exist), the verdict is `{ ok: false, reason: 'missing-head' }`.
2. **Missing-node:** if any `next-section`/`doc-end`/`doc-head`/`doc-child` edge
   references a node id not present in `nodes`, the verdict is `{ ok: false,
   reason: 'missing-node' }`.
3. **Cycle:** if following the document's `next-section` edges (scoped by
   `documentId`) from the head revisits a node (a cycle), the verdict is
   `{ ok: false, reason: 'cycle' }`.
4. **Nesting cycle:** if the `doc-child` edges form a cycle (a RAG object is a
   doc-child of itself, transitively), the verdict is `{ ok: false, reason:
   'cycle' }` (a `doc-child` nesting cycle is a structural violation).
5. **Happy path:** if the head exists, all referenced nodes exist, the
   document's `next-section` chain is acyclic and reaches the `doc-end`, and the
   `doc-child` nesting is acyclic, the verdict is `{ ok: true, order:
   <head-first document order> }`.

**Fallback (family pre-order):** on any violation (`ok: false`), the traversal
falls back to **family pre-order** — the order defined by the `parent-child`
edges (a pre-order walk of the family tree). The fallback is deterministic and
never throws.

**Fail-states (TestWriter red set):**

1. No `doc-head` edge for the document → `{ ok: false, reason: 'missing-head' }`.
2. A `next-section`/`doc-end`/`doc-head`/`doc-child` edge references a
   nonexistent node → `{ ok: false, reason: 'missing-node' }`.
3. A `next-section` cycle (A→B→A) → `{ ok: false, reason: 'cycle' }`.
4. A `doc-child` nesting cycle (A is a doc-child of B, B is a doc-child of A) →
   `{ ok: false, reason: 'cycle' }`.
5. A valid document (head exists, all nodes exist, acyclic flow + nesting,
   reaches the end) → `{ ok: true, order: [...] }` (head-first, acyclic).
6. `validateDocFlow` with a null/undefined `nodes`/`edges`/`documentId` → throws
   `Error('validateDocFlow: nodes/edges/documentId required')` (a malformed
   input is a caller error, never a silent fallback).

### 5.3 The five-seam gate for `rag`/`edit`

The `rag` (read-only) and `edit` (mutating) tool groups are registered through
the five-seam gate. Both default-off. Editing is NEVER a `code`-group op.

**Seam 1 — `src/main/security.ts` TOOL_GROUPS:**

- Extend the `ToolGroup` union: `'read' | 'dispatch' | 'graph' | 'code' |
  'module' | 'rag' | 'edit'`.
- Add to `TOOL_GROUPS`:
  - `rag.query`, `rag.get_document`, `rag.list_nodes`, `rag.get_edges`,
    `rag.backlinks` → `'rag'`.
  - `edit.set_content`, `edit.create_node`, `edit.delete_node`,
    `edit.split_node`, `edit.merge_node`, `edit.set_edge` → `'edit'`.
- `groupForTool`/`toolAllowed` work unchanged (exact-name static lookup).
- `defaultSecurityConfig()` stays `{ token: null, enabled: ['read',
  'dispatch'] }` — `rag`/`edit` are NOT enabled by default.
- `VALID_GROUPS` (in `applyPatch`) gains `'rag'` and `'edit'`.

**Seam 2 — `src/main/mcp-server.ts` ALL_TOOLS + registerTools:**

- Add to `ALL_TOOLS`: the five `rag.*` names + the six `edit.*` names.
- `registerTools` handles the `rag.*`/`edit.*` tools **in MAIN** (like
  `module.*`), calling the main-process RAG store (Unit A) — NEVER routed to
  the renderer. The `rag.*` tools call read methods; the `edit.*` tools call
  mutating methods (through the single-writer queue).
- A tool registers ONLY when its group is allowed (the existing
  `registeredToolNames` gate).

**Seam 3 — `src/shared/types.ts` RpcMethod:**

- Add to the `RpcMethod` union: `'rag.query'`, `'rag.get_document'`,
  `'rag.list_nodes'`, `'rag.get_edges'`, `'rag.backlinks'`, `'edit.set_content'`,
  `'edit.create_node'`, `'edit.delete_node'`, `'edit.split_node'`,
  `'edit.merge_node'`, `'edit.set_edge'`. (The main-handled tools still declare
  their method names here for the shared IPC contract — the `module.*` methods
  are already in the union.)

**Seam 4 — renderer switch (`src/renderer/renderer.ts` `handleRequest`):**

- **Negative contract:** the `rag.*`/`edit.*` tools are main-handled and NEVER
  reach the renderer switch (intercepted in `mcp-server.ts`, like `module.*`).
  The switch needs NO new cases. A `rag.*`/`edit.*` method that somehow reaches
  the renderer hits the `default` branch and throws `unknown method` (fail-closed).

**Seam 5 — `MUTATING_METHODS` (`src/renderer/renderer.ts`):**

- **Negative contract:** the `edit.*` methods are mutating but main-handled;
  they do NOT mutate the renderer graph, so they are NOT added to the
  renderer's `MUTATING_METHODS` (which drives the app-graph-changed push for
  the RENDERER graph). The RAG-store mutation notification is a separate
  concern (Unit C / later). This is documented so a future agent does not
  misclassify them.

### 5.4 Tool schemas

The `rag.*`/`edit.*` tool schemas (zod, mirroring the `registerTools` pattern):

**`rag` group (read-only, default-off):**

| Tool | Input schema | Return (JSON) |
| --- | --- | --- |
| `rag.query` | `{ query: string, topK?: number }` | The relevant RAG objects + the coarse line→node map (Unit E implements the retrieval; the tool is registered here). |
| `rag.get_document` | `{ documentId: string }` | The document's RAG nodes/edges (the subtree). |
| `rag.list_nodes` | `{}` | A census of RAG nodes (id, type, content preview, ownedNodeIds count). |
| `rag.get_edges` | `{ nodeId?: string }` | The RAG edges (all, or those touching `nodeId`). |
| `rag.backlinks` | `{ nodeId: string }` | The backlinks to `nodeId` (Unit G enumerates them; the tool is registered here). |

**`edit` group (mutating, default-off):**

| Tool | Input schema | Effect |
| --- | --- | --- |
| `edit.set_content` | `{ nodeId: string, content: string }` | Set a RAG node's content (a content op → journaled, no re-traversal). |
| `edit.create_node` | `{ type: RagNodeType, content: string, parentId?: string, props?: Record<string, unknown> }` | Create a RAG node (a structural op → journaled, re-traversal). |
| `edit.delete_node` | `{ nodeId: string }` | Delete a RAG node + cascade its edges (structural → re-traversal). |
| `edit.split_node` | `{ nodeId: string, at: number }` | Split a RAG node at character offset `at` (structural → re-traversal). |
| `edit.merge_node` | `{ sourceId: string, targetId: string }` | Merge `sourceId` into `targetId` (structural → re-traversal). |
| `edit.set_edge` | `{ kind: RagEdgeKind, source: string, target: string, edgeId?: string }` | Create/update a RAG edge (structural → re-traversal). |

**Gating behavior:**

- A `rag.*` tool is callable only when the `rag` group is enabled.
- An `edit.*` tool is callable only when the `edit` group is enabled.
- Both default-off (`defaultSecurityConfig`).
- Editing is NEVER a `code`-group op — the `edit.*` tools are in the `edit`
  group, not `code`. An agent with only `code` enabled cannot edit the RAG
  store.

**Fail-states (TestWriter red set):**

1. A `rag.*`/`edit.*` tool with its group disabled → not registered, not
   callable (`toolAllowed` returns false).
2. An `edit.*` tool invoked with only `code` enabled → denied (editing is never
   a `code`-group op).
3. A malformed tool name (empty rest, double prefix) → `toolForName` throws
   (fail-closed, the existing F2 guard).
4. An `edit.*` tool that reaches the renderer switch → `unknown method` throw
   (fail-closed, the negative contract).
5. `edit.set_content` on a nonexistent node → the store throws
   `rag putNode: node not found` (Unit A fail-state); the tool surfaces the
   error.
6. `edit.set_edge` referencing a nonexistent node → the store throws
   `rag putEdge: source/target node not found` (Unit A fail-state).

### 5.5 Census / numeric claims

- **Tool counts:** 5 `rag.*` tools + 6 `edit.*` tools = 11 new tool names in
  `ALL_TOOLS`.
- **Groups:** 2 new `ToolGroup` values (`rag`, `edit`); `VALID_GROUPS` grows
  from 5 to 7.
- **Doc-flow edges:** 3 linear doc-flow kinds (`doc-head`, `next-section`,
  `doc-end`) + 1 hierarchical nesting kind (`doc-child`) + 1 family kind
  (`parent-child`) in the first slice = 5 edge kinds.
- **Validation outcomes:** 3 fail reasons (`cycle`, `missing-node`,
  `missing-head`) + 1 happy path. The `cycle` reason covers BOTH a
  `next-section` cycle AND a `doc-child` nesting cycle.

### 5.6 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (persisted node/edge shapes),
  §5.5 (single-writer queue), §5.6 (project journal).
- Unit C: `docs/specs/unit-c-rendering-spine.md` (the traversal consumes the
  doc-flow validation + the marker prop; the back-reference map carries the
  subtree boundary).
- Gate: `docs/specs/astrographer-review.md` §3c, §9.2.3, §9.2.7, Amendment 1,
  §10.
- Decisions: `docs/decisions.md` rows **DERIVED-DOC-FLOW**,
  **RAG-EDIT-MCP-GROUPS**, **SUBTREE-OWNERSHIP**, **SINGLE-WRITER-STORE**,
  **MULTI-PARENT-DUPLICATE**.
- Foundation seams: `src/main/security.ts` (TOOL_GROUPS/`groupForTool`/
  `toolAllowed`/`defaultSecurityConfig`/`applyPatch`), `src/main/mcp-server.ts`
  (ALL_TOOLS/`registerTools`/`handleModuleTool`), `src/shared/types.ts`
  (RpcMethod), `src/renderer/renderer.ts` (`handleRequest`/`MUTATING_METHODS`).
- Engine invariants: `node.md` §1.2 SI-1 (single-parent), §7.1 FS-10
  (`placement-target-blocked`), P3 §2.4 (contentNodes family-'in-tree' ≠
  compiled viability); `types.d.ts` `Role` (closed union).
