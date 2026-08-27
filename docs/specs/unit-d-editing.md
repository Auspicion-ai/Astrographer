# Spec — Unit D: Editable Text (Form-Control Editing)

- **Status:** SPEC (first-milestone Unit D). Gate reference:
  `docs/specs/astrographer-review.md` §3b (FORM-CONTROL-EDITING), §8.1
  (RAG-authoritative → traversal → materialized graph), §8.2 (MCP/UI
  equivalence), §9.2.1 (PROJECT-JOURNAL), §9.2.2 (back-reference carrier),
  §9.2.6 (SINGLE-WRITER-STORE), §9.2.7 (RAG-EDIT-MCP-GROUPS), §9.3(h)
  (multi-parent duplicate coherence), §10.3 Q4 (FS-10 editing constraint),
  §13.4 (shared-node edit UX pending). Decisions: `docs/decisions.md` rows
  **FORM-CONTROL-EDITING**, **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**,
  **MULTI-PARENT-DUPLICATE**, **SUBTREE-OWNERSHIP** (the back-reference carrier
  is part of SUBTREE-OWNERSHIP — there is no separate BACK-REFERENCE row).
- **Scope:** the FULL behavior of the `edit.*` tool handlers (Unit B registered
  them through the five-seam gate; Unit D implements the FULL handler behavior),
  the UI commit-on-blur write-back path, the dirty-edit guard, caret/focus
  preservation, the dangling back-reference → read-only behavior, multi-parent
  duplicate coherence, the form-control editing UI (provident-rendered
  textarea/input), and MCP/UI equivalence. This unit does NOT implement
  retrieval (Unit E), crosslinks (Unit G), or the shared-node edit UX (a pending
  feature — `docs/pending.md`; revisit when Unit D lands).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/edit-ops.ts` and
  `src/renderer/edit-controller.ts` from §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. **Form-control editing:** editing is commit-on-blur via a provident-rendered
   textarea/input, writing back to the source RAG object. NOT contenteditable
   (fights graph-is-authoritative; `DomAdapter.text` clobbers a live editor).
   NOT a zone-targeted state-slice (FS-10 blocks it — `placement-target-blocked`).
2. **Content edit → re-traversal:** a content edit writes back to the RAG store
   (via the back-reference), then triggers a re-traversal to re-materialize the
   graph consistently (including multi-parent duplicates). The `edit.set_content`
   tool updates the store; the re-traversal is the renderer's response to the
   store change.
3. **Structural edit → re-traversal:** node add/delete/split/merge, edge
   add/remove/retarget, doc-flow role change → full re-traversal.
4. **Dirty-edit guard:** queues (not executes) a rebuild while a control is dirty.
5. **Caret/focus preservation:** host-side state keyed by RAG node id, restored
   after rebuild.
6. **Dangling back-reference:** a back-reference whose RAG node was deleted marks
   the element read-only; commit-on-blur refuses a write to a deleted node.
7. **Multi-parent duplicate coherence:** a content edit updates all duplicates
   (re-traversal re-materializes all consistently).
8. **MCP/UI equivalence:** the same edit operations reachable through both the
   MCP `edit` group and the UI commit-on-blur, both routing through the
   single-writer store.

## 2. Feasibility verdict

**Feasible — grounded in the engine's FS-10 constraint, the closed `Role` union,
and the foundation's render path.**

- **Form-control editing (not contenteditable):** `DomAdapter.text` writes
  `textContent` and would clobber a live editor; contenteditable-in-provident
  fights graph-is-authoritative. Form-control editing (textarea/input committed
  on blur) preserves graph-is-authoritative, is caret-safe, and keeps editing a
  graph/edit-group op rather than a code-group op (§3b).
- **FS-10 (`placement-target-blocked`):** `state-slice` mutation targeting a
  placement zone is HARD-BLOCKED. This constrains the editing model: commit-on-
  blur must write back to the RAG store → re-traversal, NOT a zone-targeted
  state-slice (§10.3 Q4). The write-back path is a RAG-store mutation (Unit A),
  not a graph state-slice.
- **Write-back via the back-reference:** the host-side `Map<ragNodeId, nodeId[]>`
  (Unit C §5.3) is the SOLE authoritative carrier. A content edit on any owned
  node writes back to the owning RAG object (§10.2). The back-reference is
  many-to-one (SUBTREE-OWNERSHIP): one RAG object → its owned provident node ids.
- **Re-traversal as the renderer's response:** the renderer re-traverses in
  response to a RAG-store change (content or structural), re-materializing the
  graph consistently (including multi-parent duplicates). This is the "pure
  projection" invariant (§9.2.1) — the materialized graph is always re-derivable
  from the RAG store. The re-traversal is the renderer's response to the store
  change, not a store concern.
- **MCP/UI equivalence:** the same edit operations reachable through both the MCP
  `edit` group and the UI commit-on-blur, both routing through the single-writer
  store (§8.2, §9.2.6). The UI commit-on-blur routes through the SAME edit op
  (`edit.set_content`) as the MCP tool.

No engine/foundation gap blocks this unit. The editing write-back path, dirty-
edit guard, caret/focus preservation, and form-control editing UI are all
project-specific (compose the store + the back-reference map + the render path).
ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is SHELVED 2026-08-26 (markdown
is export-only; the host-side line→node map covers it; markdown-parsing-to-storage
will use text-match diffing — see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `edit.*` tool handler full behavior | Project-specific (Unit B registered them; Unit D implements the FULL behavior) | Medium cost; the write-back path for MCP edits. |
| UI commit-on-blur write-back | Project-specific (composes the store + the back-reference map) | Medium cost; the write-back path for UI edits. |
| Dirty-edit guard | Project-specific (queues a rebuild while a control is dirty) | Low cost; prevents destroying an in-progress edit (§9.2.1 finding 7). |
| Caret/focus preservation | Project-specific (host-side state keyed by RAG node id) | Low cost; the caret has no home between materializations (§9.2.1 finding 3). |
| Dangling back-reference → read-only | Project-specific (a deleted node's back-reference marks the element read-only) | Low cost; prevents a write to a deleted node (§9.2.2). |
| Multi-parent duplicate coherence | Project-specific (re-traversal re-materializes all duplicates) | Low cost; the default update-all-duplicates path (§9.3(h)). |
| Form-control editing UI (provident-rendered textarea/input) | Project-specific (authored as provident-ssr data) | Low cost; respects the all-UI-via-provident constraint. |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings (host findings, fixed + regression-tested)

Post-green adversarial pass (RCA-3) 2026-08-26. All findings are HOST (this
repo's `src/`); none are package/upstream findings (nothing went to
`docs/defects.md`/`docs/HANDOFF.md`). Each host finding was fixed + regression-
tested (27 regression tests in `tests/edit-adversarial.test.ts`).

**HIGH:**
- **H1** — `handleEditTool` reimplemented each edit op inline instead of calling
  the ops from `edit-ops.ts` (spec §5.1.8). Fixed: refactored to call
  `setContent`/`createNode`/`deleteNode`/`splitNode`/`mergeNode`/`setEdge` and
  return the op's JSON result. This also fixed H2/H3/M4/M5/M6/M7.
- **H2** — MCP `edit.split_node` did not create a `doc-child` edge → tail node
  orphaned. Fixed by H1 (the `splitNode` op creates the edge).
- **H3** — MCP `edit.merge_node` did not re-parent children or transfer
  `next-section` edges → source's children orphaned. Fixed by H1 (the `mergeNode`
  op does this).
- **H4** — `mergeNode` with source as an ancestor of target (or target as a
  doc-child of source) created a self-referential edge and threw an uncaught
  store error after a partial mutation. Fixed: validate BEFORE mutating — if
  target is a descendant of source (or a doc-child of source), return
  `{ ok: false, error: 'edit.merge_node: cannot merge a node into its own
  subtree' }`; never throws, no partial mutation.
- **H5** — the re-traversal trigger (§5.1.9) and commit-on-blur IPC (§5.1.10)
  were not wired. Fixed: `handleEditTool` takes an `onStoreChanged` callback,
  broadcast via `RendererBackend.broadcast()`; `rag-store-changed` broadcast
  after a successful mutation; `edit-commit` IPC handler in main; renderer
  subscribes to `rag-store-changed` → `requestRebuild()`. The form-control
  textarea UI (§5.6) is deferred as a rendering follow-up.

**MEDIUM:**
- **M1** — `setEdge` with a non-array `documentIds` threw an uncaught store
  error. Fixed: validate → `'edit.set_edge: documentIds must be a string array'`.
- **M2** — `createNode` with a non-string `content` threw an uncaught store
  error. Fixed: validate → `'edit.create_node: content must be a string'`.
- **M3** — `setEdge` with a non-number `order` on a `doc-child` threw an uncaught
  store error. Fixed: validate → `'edit.set_edge: order must be a number'`.
- **M4** — MCP `edit.set_edge` with a nonexistent `edgeId` created a new edge
  instead of "edge not found". Fixed by H1 (the `setEdge` op returns
  `'edit.set_edge: edge not found'`).
- **M5** — MCP `edit.split_node` did not validate `at` bounds. Fixed by H1.
- **M6** — MCP `edit.create_node` did not validate `type`. Fixed by H1.
- **M7** — MCP `edit.set_edge` did not validate kind/self-reference/order-on-non-
  doc-child. Fixed by H1.
- **M8** — edit-controller `isEditable` uses `backRefs.has(nodeId)` as a proxy
  for `status().loadedNodes` — unsound in the delete→re-traversal window.
  Reconciled: documented as a best-effort backRefs check; the AUTHORITATIVE
  deleted-node check lives in the injected `commit` (which has store access via
  IPC).
- **M9** — edit-controller `commit` did not check `isEditable` before delegating.
  Fixed: `commit` checks `isEditable` first; a non-editable node returns
  `{ ok: false, reason: 'deleted-node' }` WITHOUT calling the injected commit
  (the IPC is not sent).

**LOW:**
- **L1** — `deleteNode` on a quarantined node removed it and returned
  `removed:true`. Fixed: check existence first; a quarantined/nonexistent node
  is a no-op `{ ok: true, removed: false }`.
- **L2** — `splitNode` dropped the original's `props` on the new node. Fixed:
  copy the original's `props` to the new node.
- **L3** — `splitNode` doc-child `order` collision with non-contiguous existing
  orders. Fixed: `order` = `max(existing doc-child orders) + 1`.
- **L4** — `mergeNode` could create duplicate `parent-child`/`doc-child` edges.
  Fixed: skip creating an edge when target already has the child.
- **L5** — edit-controller `restoreCaret` returned `undefined` for a dangling
  node but did not clear the caret from the map. Fixed: clear the stale caret on
  a dangling node.
- **L6** — edit-controller `commit` did not clear the dirty flag. Fixed: clear
  the node's dirty flag on a successful commit (may trigger a queued rebuild).

**2026-08-27 — Unit D adversarial-fix pass (all HOST, fixed in `src/` +
regression-tested in `tests/edit-adversarial.test.ts`):**

- **H1** — `handleEditTool` reimplemented each edit op inline. Refactored to
  call `setContent`/`createNode`/`deleteNode`/`splitNode`/`mergeNode`/`setEdge`
  from `src/main/edit-ops.ts` (the §5.1.8 tool→op mapping). This also fixed
  H2/H3/M4/M5/M6/M7 (the MCP divergences).
- **H2** — MCP `edit.split_node` did not create a `doc-child` edge (tail
  orphaned). Fixed by H1 (the `splitNode` op creates the edge).
- **H3** — MCP `edit.merge_node` did not re-parent children / transfer
  `next-section` edges. Fixed by H1 (the `mergeNode` op does this).
- **H4** — `mergeNode` with source as an ancestor of target (or target as a
  doc-child of source) created a self-referential edge and threw after a partial
  mutation. Now validates BEFORE mutating (a descendant check over
  parent-child/doc-child edges) and returns
  `{ ok: false, error: 'edit.merge_node: cannot merge a node into its own
  subtree' }` — never throws, no partial mutation.
- **H5** — the re-traversal trigger (§5.1.9) and commit-on-blur IPC (§5.1.10)
  were not wired. Wired: `handleEditTool` broadcasts `rag-store-changed`
  (`{ kind, nodeIds, edgeIds }`) after a successful mutation; the renderer
  subscribes and calls `requestRebuild()`; the `edit-commit` IPC handler in
  main calls `setContent` then broadcasts. The form-control textarea UI (§5.6)
  is a rendering follow-up (see the renderer scope note).
- **M1** — `setEdge` with a non-array `documentIds` threw. Now returns
  `{ ok: false, error: 'edit.set_edge: documentIds must be a string array' }`.
- **M2** — `createNode` with a non-string `content` threw. Now returns
  `{ ok: false, error: 'edit.create_node: content must be a string' }`.
- **M3** — `setEdge` with a non-number `order` on a `doc-child` threw. Now
  returns `{ ok: false, error: 'edit.set_edge: order must be a number' }`.
- **M4** — MCP `edit.set_edge` with a nonexistent `edgeId` created a new edge.
  Fixed by H1 (the `setEdge` op returns `edge not found`).
- **M5** — MCP `edit.split_node` did not validate `at` bounds. Fixed by H1.
- **M6** — MCP `edit.create_node` did not validate `type`. Fixed by H1.
- **M7** — MCP `edit.set_edge` did not validate kind/self-reference/order. Fixed
  by H1.
- **M8** — edit-controller `isEditable` used `backRefs.has(nodeId)` as a proxy
  for `status().loadedNodes` (unsound in the delete→re-traversal window).
  Documented as a best-effort backRefs check; the AUTHORITATIVE deleted-node
  check lives in the injected `commit` (M9).
- **M9** — edit-controller `commit` did not check `isEditable` before
  delegating. Now refuses a non-editable node with
  `{ ok: false, reason: 'deleted-node' }` WITHOUT calling the injected commit.
- **L1** — `deleteNode` on a quarantined node removed it. Now checks existence
  first (`store.getNode`); a quarantined/nonexistent node is a no-op
  (`{ ok: true, removed: false }`).
- **L2** — `splitNode` dropped the original's `props` on the new node. Now
  copies them.
- **L3** — `splitNode` doc-child `order` collided with non-contiguous existing
  orders. Now `max(existing doc-child orders) + 1`.
- **L4** — `mergeNode` could create duplicate `parent-child`/`doc-child` edges.
  Now skips creating an edge when target already has the same child.
- **L5** — edit-controller `restoreCaret` returned `undefined` for a dangling
  node but did not clear the caret. Now clears the stale caret.
- **L6** — edit-controller `commit` did not clear the dirty flag. Now clears it
  on a successful commit (which may trigger a queued rebuild per §5.2).

## 4. Design decisions pinned by this spec

- **FORM-CONTROL-EDITING:** editing is commit-on-blur via a provident-rendered
  textarea/input, writing back to the source RAG object. NOT contenteditable.
  NOT a zone-targeted state-slice (FS-10 blocks it — `placement-target-blocked`).
- **CONTENT-EDIT-RE-TRAVERSAL (resolves the content-edit tension):** a content
  edit writes back to the RAG store (via the back-reference), then triggers a
  re-traversal to re-materialize the graph consistently (including multi-parent
  duplicates). The `edit.set_content` tool updates the store; the re-traversal
  is the renderer's response to the store change. **This supersedes the
  "no re-traversal" note in Unit B §5.4 for `edit.set_content`** (the content op
  is still journaled as a `content` entry — Unit A §5.6; the re-traversal is the
  renderer's response to the store change, not a journaling concern). The
  renderer re-traverses on ANY RAG-store change (content or structural) — the
  strongest coherence guarantee (the materialized graph is always re-derivable
  from the RAG store). Reconciliation with Unit A §5.6: a `content` entry's
  inversion is by restore (no structural re-derivation in the STORE); the
  renderer still re-traverses in response to the store change from the undo.
- **SINGLE-WRITER-STORE:** the UI commit-on-blur routes through the SAME edit op
  (`edit.set_content`) as the MCP tool; both call the main-process store's
  `putNode` (via the edit op), serialized through the single-writer queue. No
  renderer-side writes to the RAG store.
- **DIRTY-EDIT-GUARD:** a rebuild is QUEUED (not executed) while a control is
  dirty. When the control commits and clears its dirty flag, the queued rebuild
  executes.
- **CARET-FOCUS-PRESERVATION:** caret/focus is host-side state keyed by RAG node
  id, restored after rebuild.
- **DANGLING-BACK-REFERENCE:** a back-reference whose RAG node was deleted marks
  the element read-only; commit-on-blur refuses a write to a deleted node.
- **MULTI-PARENT-DUPLICATE-COHERENCE:** a content edit updates all duplicates
  (re-traversal re-materializes all consistently).
- **MCP-UI-EQUIVALENCE:** the same edit operations reachable through both the MCP
  `edit` group and the UI commit-on-blur, both routing through the single-writer
  store.

## 5. The exhaustive contract

### 5.1 The editing write-back path (the `edit.*` tool handlers + the UI commit-on-blur)

The write-back path is the set of edit operations that mutate the RAG store. It
is implemented in TWO places: the **edit ops** (`src/main/edit-ops.ts`, pure
functions over the `RagStore` interface) and the **MCP tool handlers**
(`src/main/mcp-server.ts` `handleEditTool`, thin validators that call the ops).
The UI commit-on-blur routes through the SAME edit op (`edit.set_content`) as
the MCP tool.

#### 5.1.1 The edit ops module (`src/main/edit-ops.ts`)

```ts
// src/main/edit-ops.ts (project-specific; pure, no Electron — operates on the
// RagStore interface, Unit A §5.4).

export interface EditOpContext {
  /** The RAG store (Unit A) — the `RagStore` INTERFACE (the abstraction layer,
   *  Unit A §5.3). The edit ops depend on the interface, NOT the concrete JSON
   *  store, so the source is switchable. */
  store: RagStore
}

// ---- result types (JSON-serializable; the MCP tools return these) ----------

export type SetContentResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type CreateNodeResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type DeleteNodeResult = { ok: true; removed: boolean } | { ok: false; error: string }
export type SplitNodeResult = { ok: true; nodes: [RagNode, RagNode]; edge: RagEdge } | { ok: false; error: string }
export type MergeNodeResult = { ok: true; target: RagNode } | { ok: false; error: string }
export type SetEdgeResult = { ok: true; edge: RagEdge } | { ok: false; error: string }

// ---- the edit ops (all async — the store's mutating methods are queue-serialized) ----

/** Set a RAG node's content. A CONTENT op → journaled as a `content` entry
 *  (Unit A §5.6). The renderer's response to the store change is a re-traversal
 *  (CONTENT-EDIT-RE-TRAVERSAL). */
export async function setContent(ctx: EditOpContext, params: { nodeId: string; content: string }): Promise<SetContentResult>

/** Create a RAG node. A STRUCTURAL op → journaled as a `node-add` entry →
 *  re-traversal. When `parentId` is given, ALSO create a `parent-child` edge
 *  (source=`parentId`, target=new node) so the created node is not orphaned
 *  (Unit B §5.4 finding 3). */
export async function createNode(ctx: EditOpContext, params: { type: string; content: string; parentId?: string; props?: Record<string, unknown> }): Promise<CreateNodeResult>

/** Delete a RAG node + cascade its edges. A STRUCTURAL op → journaled as a
 *  `node-delete` entry → re-traversal. */
export async function deleteNode(ctx: EditOpContext, params: { nodeId: string }): Promise<DeleteNodeResult>

/** Split a RAG node at character offset `at`. A STRUCTURAL op → journaled →
 *  re-traversal. The original keeps `content[0..at]`; a new node gets
 *  `content[at..]` and becomes a `doc-child` of the original (appended at the
 *  end of the original's doc-children). */
export async function splitNode(ctx: EditOpContext, params: { nodeId: string; at: number }): Promise<SplitNodeResult>

/** Merge `sourceId` into `targetId`. A STRUCTURAL op → journaled → re-traversal.
 *  Target content = `target.content + source.content`; source's children are
 *  re-parented to target; source is deleted. */
export async function mergeNode(ctx: EditOpContext, params: { sourceId: string; targetId: string }): Promise<MergeNodeResult>

/** Create/update a RAG edge. A STRUCTURAL op → journaled → re-traversal. */
export async function setEdge(ctx: EditOpContext, params: { kind: string; source: string; target: string; edgeId?: string; order?: number; documentIds?: string[] }): Promise<SetEdgeResult>
```

**Id minting:** the edit ops mint RAG node/edge ids (a unique non-empty string,
e.g. `n-<uuid>` / `e-<uuid>`). The store's `putNode`/`putEdge` require a full
record with an id (Unit A §5.1); the op generates the id and passes the full
record. The store validates the id is a non-empty string (Unit A §5.1 shape
rule). The op ensures uniqueness (a fresh id per create).

**Return-shape rules:**

- Every op returns a discriminated result: `{ ok: true, ... }` on success,
  `{ ok: false, error: string }` on failure. An op NEVER throws to the caller
  for a domain failure (nonexistent node, invalid offset, invalid kind) — it
  returns `{ ok: false, error }`. The ONLY throw path is a store-level failure
  that the op does not catch (e.g. a malformed record reaching `putNode`), which
  propagates to the caller (the MCP handler surfaces it).
- `setContent` returns the updated node. `createNode` returns the created node.
  `deleteNode` returns `{ ok: true, removed: boolean }` (`true` if the node
  existed and was removed, `false` if it did not exist — a no-op, no throw,
  consistent with the store's `removeNode` returning `false`). `splitNode`
  returns `[original, new]` + the `doc-child` edge. `mergeNode` returns the
  updated target. `setEdge` returns the created/updated edge.

#### 5.1.2 `setContent` — full behavior

- **Content op** → journaled as a `content` entry (Unit A §5.6). The renderer's
  response to the store change is a re-traversal (CONTENT-EDIT-RE-TRAVERSAL).
- **Validation:** `nodeId` is a non-empty string; `content` is a string.
- **Existence check:** reads the node via `store.getNode(nodeId)`. If undefined
  (or quarantined — not in `status().loadedNodes`), returns
  `{ ok: false, error: 'edit.set_content: node not found' }`.
- **Write:** updates the node's `content` and refreshes `updatedAt` (preserving
  `createdAt` — Unit A §5.1), via `store.putNode`.
- **Return:** `{ ok: true, node: <updated node> }`.

#### 5.1.3 `createNode` — full behavior

- **Structural op** → journaled as a `node-add` entry → re-traversal.
- **Validation:** `type` is a valid `RagNodeType` (Unit A §5.1 closed union);
  `content` is a string; `parentId` (if given) is a non-empty string.
- **Parent check:** if `parentId` given, reads the parent via
  `store.getNode(parentId)`. If undefined (or quarantined), returns
  `{ ok: false, error: 'edit.create_node: parent not found' }`.
- **Create:** mints a new RAG node id; creates the node with `type`, `content`,
  `props` (or absent), `ownedNodeIds: []`, fresh `createdAt`/`updatedAt`
  (ISO-8601), via `store.putNode`.
- **Parent edge:** if `parentId` given, ALSO creates a `parent-child` edge
  (source=`parentId`, target=new node) so the created node is not orphaned
  (Unit B §5.4 finding 3), via `store.putEdge`.
- **Return:** `{ ok: true, node: <created node> }`.

#### 5.1.4 `deleteNode` — full behavior

- **Structural op** → journaled as a `node-delete` entry → re-traversal.
- **Existence check:** reads the node via `store.getNode(nodeId)`. If undefined,
  returns `{ ok: true, removed: false }` (a no-op, no throw — consistent with
  the store's `removeNode` returning `false`).
- **Delete:** removes the node + cascades its edges (Unit A `removeNode`
  cascade), via `store.removeNode`.
- **Return:** `{ ok: true, removed: true }`.

#### 5.1.5 `splitNode` — full behavior

- **Structural op** → journaled → re-traversal.
- **Validation:** `nodeId` is a non-empty string; `at` is an integer.
- **Existence check:** reads the node via `store.getNode(nodeId)`. If undefined
  (or quarantined), returns `{ ok: false, error: 'edit.split_node: node not found' }`.
- **Offset check:** `at` must be an integer in `[1, content.length - 1]` (a split
  must produce two non-empty parts; `at` is 0-based). If `at` is not an integer,
  or `at` < 1, or `at` >= `content.length`, returns
  `{ ok: false, error: 'edit.split_node: invalid offset' }`. (If
  `content.length === 0`, no valid `at` exists → any `at` is invalid.)
- **Split:** the original node's content becomes `content[0..at]` (via
  `store.putNode`, `updatedAt` refreshed). A new node is created with content
  `content[at..]`, the SAME `type` as the original, `ownedNodeIds: []`, fresh
  `createdAt`/`updatedAt`, via `store.putNode`.
- **Doc-child edge:** a `doc-child` edge is created
  `{ kind: 'doc-child', source: originalId, target: newId, order: <the count of
  the original's existing doc-children> }` — the new node is appended as the
  last doc-child, via `store.putEdge`.
- **Return:** `{ ok: true, nodes: [original, new], edge: <doc-child edge> }`.

#### 5.1.6 `mergeNode` — full behavior

- **Structural op** → journaled → re-traversal.
- **Validation:** `sourceId` and `targetId` are non-empty strings; `sourceId !==
  targetId`.
- **Existence check:** reads both nodes via `store.getNode`. If either is
  undefined (or quarantined), returns
  `{ ok: false, error: 'edit.merge_node: source/target not found' }`.
- **Self-merge check:** if `sourceId === targetId`, returns
  `{ ok: false, error: 'edit.merge_node: cannot merge a node into itself' }`.
- **Merge (re-parenting rules):**
  1. Target content = `target.content + source.content` (via `store.putNode`,
     `updatedAt` refreshed).
  2. For each `parent-child` edge where `source` is the parent: create a new
     `parent-child` edge (source=target, target=child), remove the old edge.
  3. For each `doc-child` edge where `source` is the source: create a new
     `doc-child` edge (source=target, target=child, order=appended at the end of
     target's doc-children), remove the old edge.
  4. For each `next-section` edge where `source` is the source: if target has no
     `next-section` edge in the same document, create a new `next-section` edge
     (source=target, target=the same target, same `documentIds`); remove the old
     edge. If target already has a `next-section` edge in the same document, the
     source's is NOT transferred (the target's existing one wins) and the old
     edge is removed.
  5. Source is deleted + its remaining edges cascaded (via `store.removeNode`).
- **Return:** `{ ok: true, target: <updated target> }`.

#### 5.1.7 `setEdge` — full behavior

- **Structural op** → journaled → re-traversal.
- **Validation:** `kind` is a valid `RagEdgeKind` (Unit A §5.1 closed union);
  `source`/`target` are non-empty strings; `source !== target`; `order` is only
  valid on a `doc-child` kind; `documentIds` (if given) is a string array
  (deduped on write — Unit A §5.1).
- **Existence check:** reads both nodes via `store.getNode`. If either is
  undefined (or quarantined), returns
  `{ ok: false, error: 'edit.set_edge: source/target node not found or
  quarantined' }` (the store throws `rag putEdge: source/target node not found
  or quarantined` — Unit A fail-state; the op surfaces it as a result).
- **Self-referential check:** if `source === target`, returns
  `{ ok: false, error: 'edit.set_edge: self-referential edge' }`.
- **Order check:** if `order` is present on a non-`doc-child` kind, returns
  `{ ok: false, error: 'edit.set_edge: order only valid on doc-child' }`.
- **Create/update:** if `edgeId` given, reads the edge via `store.getEdge`. If
  undefined, returns `{ ok: false, error: 'edit.set_edge: edge not found' }`.
  Updates the edge (kind/source/target/order/documentIds, `updatedAt` refreshed)
  via `store.putEdge`. If `edgeId` not given, mints a new edge id and creates
  the edge via `store.putEdge`.
- **Return:** `{ ok: true, edge: <created/updated edge> }`.

#### 5.1.8 The MCP tool handlers (`src/main/mcp-server.ts` `handleEditTool`)

Unit B §5.3 registered the `edit.*` tools through the five-seam gate and
declared them main-handled. Unit D implements the FULL handler behavior:

- Each `edit.*` tool handler validates the input against the zod schema (Unit B
  §5.4), calls the corresponding edit op (§5.1.2-§5.1.7) on the store, and
  returns the JSON result.
- The handler is main-handled (never reaches the renderer — Unit B §5.3 Seam 4
  negative contract).
- The handler routes through the single-writer queue (the store's mutating
  methods are queue-serialized — Unit A §5.5).
- After a successful mutation, the main process broadcasts a `rag-store-changed`
  event to the renderer (the re-traversal trigger — §5.1.9).
- The handler depends on the `RagStore` INTERFACE (Unit A §5.3 — SOURCE-
  SWITCHABLE), never the concrete JSON store.

**Tool → op mapping:**

| Tool | Op | Result |
| --- | --- | --- |
| `edit.set_content` | `setContent` | `SetContentResult` |
| `edit.create_node` | `createNode` | `CreateNodeResult` |
| `edit.delete_node` | `deleteNode` | `DeleteNodeResult` |
| `edit.split_node` | `splitNode` | `SplitNodeResult` |
| `edit.merge_node` | `mergeNode` | `MergeNodeResult` |
| `edit.set_edge` | `setEdge` | `SetEdgeResult` |

#### 5.1.9 The re-traversal trigger (the renderer's response to the store change)

- **Main → renderer IPC event `rag-store-changed`:** after ANY successful
  RAG-store mutation (content or structural — via an MCP `edit.*` tool OR a UI
  commit-on-blur), the main process broadcasts a `rag-store-changed` event to the
  renderer. Payload: `{ kind: 'content' | 'structural', nodeIds: string[],
  edgeIds: string[] }`.
- **Renderer response:** the renderer, on `rag-store-changed`, calls
  `requestRebuild()` on the edit controller (§5.2). If no control is dirty, the
  rebuild executes immediately (a re-traversal — Unit C `buildTraversal`). If a
  control is dirty, the rebuild is QUEUED (the dirty-edit guard — §5.2).
- **Content edit → re-traversal:** a content edit (MCP `edit.set_content` or UI
  commit-on-blur) writes back to the RAG store, then the renderer re-traverses
  in response to the store change, re-materializing the graph consistently
  (including multi-parent duplicates). This is pinned by CONTENT-EDIT-RE-
  TRAVERSAL (§4).

#### 5.1.10 The UI commit-on-blur write-back

- The renderer's edit controller (§5.2) exposes `commit(nodeId, content)`. On a
  control's blur, if the control is dirty, the renderer calls `commit`.
- `commit` sends an `edit-commit` IPC to main: `{ nodeId: string, content:
  string }`. Main calls `setContent` on the store (the SAME edit op as the MCP
  tool), then broadcasts `rag-store-changed`.
- The UI commit-on-blur routes through the SAME edit op (`edit.set_content`) as
  the MCP tool — MCP/UI equivalence (§5.7). Both call the main-process store's
  `putNode` (via the edit op), serialized through the single-writer queue. No
  renderer-side writes to the RAG store.

### 5.2 The dirty-edit guard

The dirty-edit guard queues (not executes) a rebuild while a control is dirty.
This prevents a rebuild from destroying an in-progress edit (the control's
uncommitted content would be re-materialized from the store).

```ts
// src/renderer/edit-controller.ts (project-specific; pure, no Electron — the
// `commit` function and `onRebuild` callback are injected, so the controller is
// testable in isolation).

export interface EditControllerOptions {
  /** The back-reference map (Unit C §5.3) — the SOLE authoritative carrier.
   *  `Map<ragNodeId, nodeId[]>` (SUBTREE-OWNERSHIP). */
  backRefs: Map<string, string[]>
  /** The RAG store access (via IPC to the main process — SINGLE-WRITER-STORE).
   *  The renderer never writes to the RAG store directly; it sends an IPC to
   *  main, which calls the store. Injected for testability. */
  commit: (nodeId: string, content: string) => Promise<CommitResult>
  /** Called to trigger a re-traversal (rebuild) after a store change. Injected
   *  for testability. */
  onRebuild: () => void
}

export type CommitResult =
  | { ok: true; nodeId: string }
  | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }

export interface EditController {
  /** Mark a control dirty. A rebuild is QUEUED (not executed) while any control
   *  is dirty (dirty-edit guard). */
  markDirty(nodeId: string): void
  /** Clear a control's dirty flag. If a rebuild was queued by the dirty-edit
   *  guard and no control is dirty, the queued rebuild executes. */
  clearDirty(nodeId: string): void
  /** Whether a control is dirty. */
  isDirty(nodeId: string): boolean
  /** Whether ANY control is dirty. */
  anyDirty(): boolean
  /** Whether a node is editable (not a dangling back-reference). */
  isEditable(nodeId: string): boolean
  /** Commit a control's content on blur. Writes back to the RAG store via the
   *  back-reference. Refuses a write to a deleted node (dangling back-reference
   *  → read-only). */
  commit(nodeId: string, content: string): Promise<CommitResult>
  /** Request a rebuild. If any control is dirty, the rebuild is QUEUED (not
   *  executed). If no control is dirty, the rebuild executes immediately. */
  requestRebuild(): void
  /** Whether a rebuild is queued (waiting for the dirty-edit guard to clear). */
  hasQueuedRebuild(): boolean
  /** Save caret/focus state keyed by RAG node id. */
  saveCaret(nodeId: string, caret: CaretState): void
  /** Restore caret/focus state after a rebuild. Returns the saved state, or
   *  undefined if none was saved. */
  restoreCaret(nodeId: string): CaretState | undefined
  /** Clear saved caret/focus state for a node. */
  clearCaret(nodeId: string): void
}

export function createEditController(opts: EditControllerOptions): EditController
```

**Dirty-edit guard behavior:**

- `markDirty(nodeId)`: sets the dirty flag for the node.
- `requestRebuild()`: if `anyDirty()`, QUEUES the rebuild (sets the queued flag —
  does NOT call `onRebuild`). If no control is dirty, executes immediately
  (calls `onRebuild`).
- `clearDirty(nodeId)`: clears the dirty flag for the node. If `hasQueuedRebuild()`
  and `!anyDirty()`, executes the queued rebuild (calls `onRebuild`) and clears
  the queue.
- **Coalescing:** if a rebuild is already queued and another `requestRebuild()`
  arrives, the queue coalesces — at most ONE queued rebuild. `hasQueuedRebuild()`
  returns true until the queued rebuild executes.
- **The re-traversal trigger (§5.1.9) routes through `requestRebuild()`:** the
  renderer, on `rag-store-changed`, calls `requestRebuild()`. If a control is
  dirty, the rebuild is queued; when the control commits and clears its dirty
  flag, the queued rebuild executes.

### 5.3 Caret/focus preservation

Caret/focus is host-side state keyed by RAG node id, restored after rebuild
(§9.2.1 finding 3 — the caret has no home between materializations).

```ts
export interface CaretState {
  /** The caret offset within the control's text. */
  offset: number
  /** Whether the control had focus. */
  focused: boolean
}
```

**Behavior:**

- `saveCaret(nodeId, caret)`: stores the caret state keyed by RAG node id.
- `restoreCaret(nodeId)`: returns the saved state, or `undefined` if none was
  saved (or the saved state was cleared).
- `clearCaret(nodeId)`: clears the saved caret state for a node.
- **After a rebuild:** the renderer calls `restoreCaret` for the focused node
  and re-applies the caret (offset + focus).
- **Deleted node:** if the node's back-reference is dangling (the RAG node was
  deleted), the saved caret is cleared (no restore) — `restoreCaret` returns
  `undefined`.

### 5.4 The dangling back-reference → read-only behavior

A back-reference whose RAG node was deleted marks the element read-only;
commit-on-blur refuses a write to a deleted node (§9.2.2).

- **`isEditable(nodeId)`:** returns `false` if the node's back-reference is
  dangling (the RAG node was deleted — the node id is not in the store's
  `status().loadedNodes`). Returns `true` otherwise.
- **Read-only control:** a form control bound to a non-editable node is
  read-only (§5.6).
- **`commit(nodeId, content)`:** if `!isEditable(nodeId)` (dangling back-
  reference), returns `{ ok: false, reason: 'deleted-node' }` — the write is
  REFUSED. The `edit-commit` IPC is NOT sent.
- **`commit` store error:** if the store write fails (e.g. the store threw),
  returns `{ ok: false, reason: 'store-error', error }`.

### 5.5 Multi-parent duplicate coherence

A content edit on a multi-parent RAG node updates all duplicates (re-traversal
re-materializes all consistently) — §9.3(h), Unit C §5.5.

- **Write-back:** a content edit writes back to the RAG store (the single
  authoritative node) via the back-reference. The store holds ONE node; the
  duplicates are per-render materializations (Unit C §5.5).
- **Re-traversal:** the renderer re-traverses in response to the store change,
  re-materializing all duplicates consistently (the default update-all-duplicates
  path — Unit C §5.5).
- **Single-document view:** in the single-document view, only ONE duplicate is
  live at a time (Unit C §5.5 / review §13.3); the re-traversal re-materializes
  the visible duplicate consistently. The N duplicates COEXIST only under a
  multi-document (tabs) render (a pending feature — `docs/pending.md`).
- **No in-place state-slice path:** Unit D pins the re-traversal path as the
  ONLY content-edit coherence mechanism (CONTENT-EDIT-RE-TRAVERSAL). The
  cross-duplicate-staleness alternative (a pure in-place state-slice) is NOT
  used in Unit D.

### 5.6 The form-control editing UI (provident-rendered textarea/input)

The form-control editing UI is a provident-rendered textarea/input, authored as
provident-ssr data (a component binding / handler body), driven through the
producing graph — NOT hand-written HTML/DOM (project constraint: ALL non-shell
UI must be rendered with the provident framework).

- **Control type:** a **textarea** (multi-line) for RAG node content.
- **Binding:** the control's `value` is bound to the RAG node's content (via the
  back-reference — the node's owned subtree root).
- **`onInput`:** calls `markDirty(nodeId)` on the edit controller (§5.2).
- **`onBlur`:** if the control is dirty, calls `commit(nodeId, value)` on the
  edit controller (§5.1.10). On success, clears the dirty flag (which may
  trigger a queued rebuild).
- **`readOnly`:** set when `!isEditable(nodeId)` (dangling back-reference →
  read-only, §5.4).
- **Caret:** the control's caret is saved on blur (`saveCaret`) and restored
  after a rebuild (`restoreCaret`) — §5.3.
- **Provident-rendering constraint:** the textarea is authored as provident-ssr
  data (a component binding in the producing graph), NOT hand-written HTML/DOM.
  A textarea rendered outside the provident graph is a review finding.

### 5.7 MCP/UI equivalence

The same edit operations are reachable through both the MCP `edit` group and
the UI commit-on-blur, both routing through the single-writer store (§8.2,
§9.2.6).

- **Same op:** the UI commit-on-blur routes through the SAME edit op
  (`edit.set_content`) as the MCP tool (§5.1.10). Both call the main-process
  store's `putNode` (via the edit op), serialized through the single-writer
  queue.
- **Same re-traversal:** the renderer re-traverses in response to the store
  change in BOTH cases (the `rag-store-changed` broadcast — §5.1.9).
- **Equivalence test:** an MCP `edit.set_content` and a UI commit-on-blur with
  the same params produce the same store state and the same re-traversal.
- **The `edit.*` tools are main-handled** (Unit B §5.3); the UI commit-on-blur
  sends an `edit-commit` IPC to main, which calls the same store. Neither writes
  to the RAG store from the renderer.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`setContent` happy:** a node exists → `setContent` updates its content,
   journals a `content` entry, returns `{ ok: true, node }`; the renderer
   re-traverses in response to the store change.
2. **`createNode` happy (no parent):** `createNode` creates a node, journals a
   `node-add` entry, returns `{ ok: true, node }`.
3. **`createNode` happy (with parent):** `createNode` creates a node + a
   `parent-child` edge (source=`parentId`, target=new node), returns
   `{ ok: true, node }`.
4. **`deleteNode` happy:** `deleteNode` deletes the node + cascades its edges,
   journals a `node-delete` entry, returns `{ ok: true, removed: true }`.
5. **`deleteNode` nonexistent:** `deleteNode` on a nonexistent node returns
   `{ ok: true, removed: false }` (a no-op, no throw).
6. **`splitNode` happy:** `splitNode` truncates the original to `content[0..at]`,
   creates a new node with `content[at..]` (same type), creates a `doc-child`
   edge (source=original, target=new, order=end), returns
   `{ ok: true, nodes: [original, new], edge }`.
7. **`mergeNode` happy:** `mergeNode` concatenates target content, re-parents
   source's children to target, deletes source, returns `{ ok: true, target }`.
8. **`setEdge` happy (create):** `setEdge` creates a new edge, returns
   `{ ok: true, edge }`.
9. **`setEdge` happy (update):** `setEdge` with an `edgeId` updates the edge,
   returns `{ ok: true, edge }`.
10. **UI commit-on-blur happy:** a dirty control blurs → `commit` writes back to
    the store → returns `{ ok: true, nodeId }` → the renderer re-traverses.
11. **Dirty-edit guard happy:** a rebuild request while a control is dirty → the
    rebuild is QUEUED (`hasQueuedRebuild()` true, `onRebuild` NOT called); when
    the control commits and clears its dirty flag → the queued rebuild executes
    (`onRebuild` called, `hasQueuedRebuild()` false).
12. **Dirty-edit guard coalescing:** two rebuild requests while a control is
    dirty → at most ONE queued rebuild; when the control clears → ONE rebuild
    executes.
13. **Caret/focus preservation happy:** save caret for a node → rebuild →
    `restoreCaret` returns the saved state.
14. **Dangling back-reference → read-only happy:** a node's back-reference is
    dangling (deleted) → `isEditable` returns `false` → the control is read-only.
15. **Multi-parent duplicate coherence happy:** a content edit on a multi-parent
    node → re-traversal re-materializes all duplicates consistently.
16. **MCP/UI equivalence happy:** an MCP `edit.set_content` and a UI commit-on-
    blur with the same params produce the same store state and the same
    re-traversal.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`setContent` nonexistent node:** `setContent` on a nonexistent (or
   quarantined) node → `{ ok: false, error: 'edit.set_content: node not found' }`.
2. **`setContent` non-string content:** `setContent` with a non-string content →
   `{ ok: false, error: 'edit.set_content: content must be a string' }`.
3. **`createNode` invalid type:** `createNode` with an invalid `RagNodeType` →
   `{ ok: false, error: 'edit.create_node: invalid type' }`.
4. **`createNode` nonexistent parent:** `createNode` with a nonexistent/
   quarantined `parentId` → `{ ok: false, error: 'edit.create_node: parent not
   found' }`.
5. **`splitNode` nonexistent node:** `splitNode` on a nonexistent node →
   `{ ok: false, error: 'edit.split_node: node not found' }`.
6. **`splitNode` invalid offset:** `splitNode` with `at` not an integer, or
   `at` < 1, or `at` >= `content.length` → `{ ok: false, error: 'edit.split_node:
   invalid offset' }` (a split must produce two non-empty parts).
7. **`mergeNode` nonexistent source/target:** `mergeNode` with a nonexistent
   source or target → `{ ok: false, error: 'edit.merge_node: source/target not
   found' }`.
8. **`mergeNode` self-merge:** `mergeNode` with `sourceId === targetId` →
   `{ ok: false, error: 'edit.merge_node: cannot merge a node into itself' }`.
9. **`setEdge` invalid kind:** `setEdge` with an invalid `RagEdgeKind` →
   `{ ok: false, error: 'edit.set_edge: invalid kind' }`.
10. **`setEdge` nonexistent source/target:** `setEdge` referencing a nonexistent/
    quarantined node → `{ ok: false, error: 'edit.set_edge: source/target node
    not found or quarantined' }` (the store throws `rag putEdge: source/target
    node not found or quarantined` — Unit A fail-state; the op surfaces it as a
    result).
11. **`setEdge` self-referential:** `setEdge` with `source === target` →
    `{ ok: false, error: 'edit.set_edge: self-referential edge' }`.
12. **`setEdge` order on non-doc-child:** `setEdge` with `order` on a non-
    `doc-child` kind → `{ ok: false, error: 'edit.set_edge: order only valid on
    doc-child' }`.
13. **`setEdge` nonexistent edgeId (update):** `setEdge` with an `edgeId` that
    doesn't exist → `{ ok: false, error: 'edit.set_edge: edge not found' }`.
14. **UI commit-on-blur on a deleted node:** `commit` on a dangling back-
    reference → `{ ok: false, reason: 'deleted-node' }` (the write is REFUSED;
    the `edit-commit` IPC is NOT sent).
15. **UI commit-on-blur store error:** `commit` when the store write fails →
    `{ ok: false, reason: 'store-error', error }`.
16. **Dirty-edit guard:** a rebuild request while a control is dirty → the
    rebuild is QUEUED (not executed); `hasQueuedRebuild()` returns true;
    `onRebuild` is NOT called.
17. **Caret restore for a deleted node:** `restoreCaret` for a node whose
    back-reference is dangling → returns `undefined` (the saved caret was
    cleared).

### 5.10 Census / numeric claims

- **`edit.*` tools:** 6 (already counted in Unit B §5.5 — `edit.set_content`,
  `edit.create_node`, `edit.delete_node`, `edit.split_node`, `edit.merge_node`,
  `edit.set_edge`).
- **Edit ops:** 6 in `src/main/edit-ops.ts` (`setContent`, `createNode`,
  `deleteNode`, `splitNode`, `mergeNode`, `setEdge`).
- **Edit controller:** 1 in `src/renderer/edit-controller.ts`
  (`createEditController`).
- **IPC event:** 1 (`rag-store-changed`, main → renderer).
- **IPC method:** 1 (`edit-commit`, renderer → main).
- **Re-traversal trigger:** 1 per successful RAG-store mutation (content or
  structural).
- **Dirty-edit guard:** at most 1 queued rebuild (coalesced).
- **Form-control editing UI:** 1 textarea per RAG node content.
- **Result types:** 6 (`SetContentResult`, `CreateNodeResult`, `DeleteNodeResult`,
  `SplitNodeResult`, `MergeNodeResult`, `SetEdgeResult`).
- **Commit reasons:** 2 (`deleted-node`, `store-error`).

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (RAG node/edge shapes,
  `ownedNodeIds`), §5.4 (the `RagStore` interface), §5.5 (single-writer queue),
  §5.6 (project journal — `content`/`structural` entries).
- Unit B: `docs/specs/unit-b-document-model.md` §5.3 (five-seam gate), §5.4
  (tool schemas — the `edit.*` tools), §5.4 finding 3 (`create_node` parent
  edge).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.3 (back-reference map — the
  SOLE authoritative carrier), §5.5 (multi-parent duplicate coherence).
- Gate: `docs/specs/astrographer-review.md` §3b (FORM-CONTROL-EDITING), §8.1
  (RAG-authoritative), §8.2 (MCP/UI equivalence), §9.2.1 (PROJECT-JOURNAL),
  §9.2.2 (back-reference carrier), §9.2.6 (SINGLE-WRITER-STORE), §9.2.7
  (RAG-EDIT-MCP-GROUPS), §9.3(h) (multi-parent duplicate coherence), §10.3 Q4
  (FS-10 editing constraint), §13.4 (shared-node edit UX pending).
- Decisions: `docs/decisions.md` rows **FORM-CONTROL-EDITING**,
  **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**, **MULTI-PARENT-DUPLICATE**,
  **SUBTREE-OWNERSHIP** (the back-reference carrier).
- Pending: `docs/pending.md` (shared-node edit UX — revisit when Unit D lands;
  document tabs — the multi-document render that makes "update all duplicates"
  live).
- Engine invariants: `node.md` §7.1 FS-10 (`placement-target-blocked` — the
  constraint that forces write-back-to-store → re-traversal, NOT a zone-targeted
  state-slice).
