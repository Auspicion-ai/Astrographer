# Unit D — Editable Text (Form-Control Editing): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-d-editing.md` ONLY —
  no implementation reading).
- **Source contract:** `docs/specs/unit-d-editing.md` §5.1 (the 6 edit ops + MCP
  handlers + re-traversal trigger), §5.2 (dirty-edit guard), §5.3 (caret/focus),
  §5.4 (dangling back-reference → read-only), §5.5 (multi-parent duplicate
  coherence), §5.6 (form-control UI), §5.7 (MCP/UI equivalence), §5.8 (16 happy
  paths), §5.9 (17 fail-states), §5.10 (census). Persisted shapes from
  `docs/specs/unit-a-rag-store.md` §5.1.
- **Modules under test:** `src/main/edit-ops.ts` (`setContent`/`createNode`/
  `deleteNode`/`splitNode`/`mergeNode`/`setEdge`), `src/renderer/edit-controller.ts`
  (`createEditController`), `src/main/mcp-server.ts` (`handleEditTool`), and the
  `RagStore` interface from `src/main/rag-store.ts` (`createJsonRagStore`).
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The edit ops are pure async functions over the
  `RagStore` INTERFACE, so they are exercised against the concrete JSON store
  (`createJsonRagStore`) exactly as the MCP handlers use them. The edit
  controller is exercised with an injected `commit`/`onRebuild` (pure, no
  Electron). The MCP handler is exercised directly with an `onStoreChanged`
  callback. The multi-parent scenario additionally exercises `buildTraversal`
  (Unit C) to verify the re-traversal re-materializes duplicates.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 happy paths (16)

Fixture helpers: `N(id, type, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`.

### H1. `setContent` happy
- **Setup:** store with `n1` (`content:'hello'`).
- **Ops:** `setContent({ store }, { nodeId:'n1', content:'world' })`.
- **Expected:** `{ ok:true, node }`; `node.content === 'world'`; the store's
  `getNode('n1').content === 'world'`; a `content` journal entry is recorded
  (§5.1.2).

### H2. `createNode` happy (no parent)
- **Setup:** fresh store.
- **Ops:** `createNode({ store }, { type:'p', content:'x' })`.
- **Expected:** `{ ok:true, node }`; the node exists in the store; a structural
  `node-add` journal entry is recorded (§5.1.3).

### H3. `createNode` happy (with parent)
- **Setup:** store with `parent`.
- **Ops:** `createNode({ store }, { type:'p', content:'x', parentId:'parent' })`.
- **Expected:** `{ ok:true, node }`; a `parent-child` edge
  (source=`parent`, target=new node) exists (§5.1.3 — the created node is not
  orphaned).

### H4. `deleteNode` happy
- **Setup:** store with `n1`, `n2`, edge `e1` (`parent-child` n1→n2).
- **Ops:** `deleteNode({ store }, { nodeId:'n1' })`.
- **Expected:** `{ ok:true, removed:true }`; `getNode('n1')` undefined;
  `getEdge('e1')` undefined (cascade); a structural `node-delete` journal entry
  is recorded (§5.1.4).

### H5. `deleteNode` nonexistent
- **Setup:** fresh store.
- **Ops:** `deleteNode({ store }, { nodeId:'ghost' })`.
- **Expected:** `{ ok:true, removed:false }` — a no-op, no throw (§5.1.4).

### H6. `splitNode` happy
- **Setup:** store with `n1` (`type:'p'`, `content:'hello world'`).
- **Ops:** `splitNode({ store }, { nodeId:'n1', at:5 })`.
- **Expected:** `{ ok:true, nodes:[original, new], edge }`; `original.content ===
  'hello'`; `new.content === ' world'`; `new.type === 'p'`; `edge.kind ===
  'doc-child'`, `edge.source === 'n1'`, `edge.target === new.id` (§5.1.5).

### H7. `mergeNode` happy
- **Setup:** store with `src` (`content:'B'`), `tgt` (`content:'A'`), `child`,
  edge `e1` (`parent-child` src→child).
- **Ops:** `mergeNode({ store }, { sourceId:'src', targetId:'tgt' })`.
- **Expected:** `{ ok:true, target }`; `target.content === 'AB'`; `getNode('src')`
  undefined (source deleted); a `parent-child` edge (source=`tgt`, target=`child`)
  exists (child re-parented) (§5.1.6).

### H8. `setEdge` happy (create)
- **Setup:** store with `a`, `b`.
- **Ops:** `setEdge({ store }, { kind:'parent-child', source:'a', target:'b' })`.
- **Expected:** `{ ok:true, edge }`; the edge exists in the store (§5.1.7).

### H9. `setEdge` happy (update)
- **Setup:** store with `a`, `b`, `c`, edge `e1` (`parent-child` a→b).
- **Ops:** `setEdge({ store }, { kind:'parent-child', source:'a', target:'c',
  edgeId:'e1' })`.
- **Expected:** `{ ok:true, edge }`; `edge.target === 'c'`; `getEdge('e1').target
  === 'c'` (§5.1.7).

### H10. UI commit-on-blur happy
- **Setup:** controller with `backRefs` containing `n1`, injected `commit` that
  writes to the store, `onRebuild` counter.
- **Ops:** `markDirty('n1')`; `requestRebuild()` (queued — dirty); `commit('n1',
  'new')`.
- **Expected:** `commit` returns `{ ok:true, nodeId:'n1' }`; the store's
  `getNode('n1').content === 'new'`; the queued rebuild executes on commit
  (`onRebuild` called once) (§5.1.10, §5.2).

### H11. Dirty-edit guard happy
- **Setup:** controller with `onRebuild` counter.
- **Ops:** `markDirty('n1')`; `requestRebuild()`; `clearDirty('n1')`.
- **Expected:** while dirty, `hasQueuedRebuild()` true and `onRebuild` NOT called;
  after `clearDirty`, `onRebuild` called once and `hasQueuedRebuild()` false
  (§5.2).

### H12. Dirty-edit guard coalescing
- **Setup:** controller with `onRebuild` counter.
- **Ops:** `markDirty('n1')`; `requestRebuild()`; `requestRebuild()` (second);
  `clearDirty('n1')`.
- **Expected:** at most ONE queued rebuild; after clear, `onRebuild` called
  exactly once (§5.2 — coalescing).

### H13. Caret/focus preservation happy
- **Setup:** controller with `backRefs` containing `n1`.
- **Ops:** `saveCaret('n1', { offset:3, focused:true })`; `restoreCaret('n1')`.
- **Expected:** `restoreCaret` returns `{ offset:3, focused:true }` (§5.3).

### H14. Dangling back-reference → read-only happy
- **Setup:** controller with empty `backRefs` (node `n1` deleted → dangling).
- **Ops:** `isEditable('n1')`.
- **Expected:** `false` — the control is read-only (§5.4).

### H15. Multi-parent duplicate coherence happy
- **Setup:** store with shared node `A` in two documents (`B-root`, `C-root`):
  `B-head`/`C-head` doc-heads, `B-use`/`C-use` next-section chains into `A`, `A→D`
  next-section in both docs, `parent-child B-use→A` and `C-use→A`.
- **Ops:** `setContent({ store }, { nodeId:'A', content:'updated' })`; then
  `buildTraversal({ store, documentIds:['B-root','C-root'], zoneName:'main' })`.
- **Expected:** `setContent` returns `{ ok:true }`; the re-traversal materializes
  `A` as TWO duplicate subtrees (two content roots with `props.id='rag-A'`), both
  carrying the updated content; `backRefs.get('A')` has 2 entries (§5.5,
  CONTENT-EDIT-RE-TRAVERSAL).

### H16. MCP/UI equivalence happy
- **Setup:** store with `n1` (`content:'old'`); a second store + controller for
  the UI path.
- **Ops:** MCP `handleEditTool(store, 'edit.set_content', { nodeId:'n1',
  content:'same' }, onStoreChanged)`; UI `markDirty('n1')`; `commit('n1','same')`;
  then `requestRebuild()` (the renderer's response to the store change).
- **Expected:** both paths produce the same store state (`getNode('n1').content
  === 'same'`); the MCP path fires `onStoreChanged({ kind:'content',
  nodeIds:['n1'], edgeIds:[] })`; the UI path triggers a re-traversal
  (`onRebuild` called once) (§5.7, §5.1.9).

---

## B. §5.9 fail-states (17)

### F1. `setContent` nonexistent node
- **Ops:** `setContent({ store }, { nodeId:'ghost', content:'x' })`.
- **Expected:** `{ ok:false, error:'edit.set_content: node not found' }`.

### F2. `setContent` non-string content
- **Setup:** store with `n1`.
- **Ops:** `setContent({ store }, { nodeId:'n1', content:123 })`.
- **Expected:** `{ ok:false, error:'edit.set_content: content must be a string' }`.

### F3. `createNode` invalid type
- **Ops:** `createNode({ store }, { type:'bogus', content:'x' })`.
- **Expected:** `{ ok:false, error:'edit.create_node: invalid type' }`.

### F4. `createNode` nonexistent parent
- **Ops:** `createNode({ store }, { type:'p', content:'x', parentId:'ghost' })`.
- **Expected:** `{ ok:false, error:'edit.create_node: parent not found' }`.

### F5. `splitNode` nonexistent node
- **Ops:** `splitNode({ store }, { nodeId:'ghost', at:2 })`.
- **Expected:** `{ ok:false, error:'edit.split_node: node not found' }`.

### F6. `splitNode` invalid offset
- **Setup:** store with `n1` (`content:'abc'`).
- **Ops:** `splitNode` with `at:0`, `at:3`, `at:1.5`.
- **Expected:** each `{ ok:false, error:'edit.split_node: invalid offset' }` (a
  split must produce two non-empty parts; `at` must be an integer in
  `[1, content.length-1]`).

### F7. `mergeNode` nonexistent source/target
- **Setup:** store with `n1`.
- **Ops:** `mergeNode` with `sourceId:'ghost'`; and with `targetId:'ghost'`.
- **Expected:** each `{ ok:false, error:'edit.merge_node: source/target not
  found' }`.

### F8. `mergeNode` self-merge
- **Setup:** store with `n1`.
- **Ops:** `mergeNode({ store }, { sourceId:'n1', targetId:'n1' })`.
- **Expected:** `{ ok:false, error:'edit.merge_node: cannot merge a node into
  itself' }`.

### F9. `setEdge` invalid kind
- **Setup:** store with `a`, `b`.
- **Ops:** `setEdge({ store }, { kind:'bogus', source:'a', target:'b' })`.
- **Expected:** `{ ok:false, error:'edit.set_edge: invalid kind' }`.

### F10. `setEdge` nonexistent source/target
- **Setup:** store with `a`.
- **Ops:** `setEdge({ store }, { kind:'parent-child', source:'a', target:'ghost' })`.
- **Expected:** `{ ok:false, error:'edit.set_edge: source/target node not found
  or quarantined' }`.

### F11. `setEdge` self-referential
- **Setup:** store with `a`.
- **Ops:** `setEdge({ store }, { kind:'parent-child', source:'a', target:'a' })`.
- **Expected:** `{ ok:false, error:'edit.set_edge: self-referential edge' }`.

### F12. `setEdge` order on non-doc-child
- **Setup:** store with `a`, `b`.
- **Ops:** `setEdge({ store }, { kind:'parent-child', source:'a', target:'b',
  order:1 })`.
- **Expected:** `{ ok:false, error:'edit.set_edge: order only valid on
  doc-child' }`.

### F13. `setEdge` nonexistent edgeId (update)
- **Setup:** store with `a`, `b`.
- **Ops:** `setEdge({ store }, { kind:'parent-child', source:'a', target:'b',
  edgeId:'ghost' })`.
- **Expected:** `{ ok:false, error:'edit.set_edge: edge not found' }`.

### F14. UI commit-on-blur on a deleted node
- **Setup:** controller with empty `backRefs` (node `n1` deleted → dangling);
  injected `commit` that records whether it was called.
- **Ops:** `commit('n1', 'x')`.
- **Expected:** `{ ok:false, reason:'deleted-node' }`; the injected `commit` is
  NOT called (the `edit-commit` IPC is NOT sent) (§5.4).

### F15. UI commit-on-blur store error
- **Setup:** controller with `backRefs` containing `n1`; injected `commit`
  returns `{ ok:false, reason:'store-error', error:'boom' }`.
- **Ops:** `commit('n1', 'x')`.
- **Expected:** `{ ok:false, reason:'store-error', error:'boom' }` (§5.4).

### F16. Dirty-edit guard (queued, not executed)
- **Setup:** controller with `onRebuild` counter.
- **Ops:** `markDirty('n1')`; `requestRebuild()`.
- **Expected:** `hasQueuedRebuild()` true; `onRebuild` NOT called (§5.2).

### F17. Caret restore for a deleted node
- **Setup:** controller with empty `backRefs` (node `n1` deleted → dangling).
- **Ops:** `saveCaret('n1', { offset:2, focused:true })`; `restoreCaret('n1')`.
- **Expected:** `restoreCaret` returns `undefined` (the saved caret was cleared)
  (§5.3).

---

## C. §5.10 census

### C1. Six edit ops
- **Ops:** import `setContent`, `createNode`, `deleteNode`, `splitNode`,
  `mergeNode`, `setEdge` from `src/main/edit-ops.ts`.
- **Expected:** all six are exported functions.

### C2. One edit controller
- **Ops:** import `createEditController` from `src/renderer/edit-controller.ts`.
- **Expected:** exported function.

### C3. One `rag-store-changed` IPC event + one `edit-commit` IPC method
- **Ops:** static grep on `src/shared/types.ts` + `src/main/main.ts` +
  `src/main/mcp-server.ts`.
- **Expected:** `rag-store-changed` (main → renderer, the re-traversal trigger)
  and `edit-commit` (renderer → main, the UI commit-on-blur write-back) are the
  two IPC channels; `handleEditTool` broadcasts `rag-store-changed` after a
  successful mutation.

### C4. Six result types + two commit reasons
- **Ops:** verify the six result types (`SetContentResult`, `CreateNodeResult`,
  `DeleteNodeResult`, `SplitNodeResult`, `MergeNodeResult`, `SetEdgeResult`) are
  the discriminated `{ ok:true } | { ok:false, error }` shapes; verify the two
  `CommitResult` reasons (`deleted-node`, `store-error`) at runtime.
- **Expected:** both commit reasons are reachable: `deleted-node` on a dangling
  back-reference, `store-error` on a failing injected commit.

### C5. Re-traversal trigger payloads (MCP handler)
- **Ops:** `handleEditTool` for each of the 6 tools with an `onStoreChanged`
  callback.
- **Expected:** `edit.set_content` → `{ kind:'content', nodeIds:[nodeId],
  edgeIds:[] }`; `edit.create_node`/`edit.delete_node`/`edit.merge_node` →
  `{ kind:'structural', nodeIds:[...], edgeIds:[] }`; `edit.split_node` →
  `{ kind:'structural', nodeIds:[orig,new], edgeIds:[edge.id] }`; `edit.set_edge`
  → `{ kind:'structural', nodeIds:[source,target], edgeIds:[edge.id] }` (§5.1.9).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `setContent` happy | ✅ PASS |
| H2 | `createNode` happy (no parent) | ✅ PASS |
| H3 | `createNode` happy (with parent) | ✅ PASS |
| H4 | `deleteNode` happy | ✅ PASS |
| H5 | `deleteNode` nonexistent | ✅ PASS |
| H6 | `splitNode` happy | ✅ PASS |
| H7 | `mergeNode` happy | ✅ PASS |
| H8 | `setEdge` happy (create) | ✅ PASS |
| H9 | `setEdge` happy (update) | ✅ PASS |
| H10 | UI commit-on-blur happy | ✅ PASS |
| H11 | Dirty-edit guard happy | ✅ PASS |
| H12 | Dirty-edit guard coalescing | ✅ PASS |
| H13 | Caret/focus preservation happy | ✅ PASS |
| H14 | Dangling back-reference → read-only happy | ✅ PASS |
| H15 | Multi-parent duplicate coherence happy | ✅ PASS |
| H16 | MCP/UI equivalence happy | ✅ PASS |
| F1 | `setContent` nonexistent node | ✅ PASS |
| F2 | `setContent` non-string content | ✅ PASS |
| F3 | `createNode` invalid type | ✅ PASS |
| F4 | `createNode` nonexistent parent | ✅ PASS |
| F5 | `splitNode` nonexistent node | ✅ PASS |
| F6 | `splitNode` invalid offset | ✅ PASS |
| F7 | `mergeNode` nonexistent source/target | ✅ PASS |
| F8 | `mergeNode` self-merge | ✅ PASS |
| F9 | `setEdge` invalid kind | ✅ PASS |
| F10 | `setEdge` nonexistent source/target | ✅ PASS |
| F11 | `setEdge` self-referential | ✅ PASS |
| F12 | `setEdge` order on non-doc-child | ✅ PASS |
| F13 | `setEdge` nonexistent edgeId (update) | ✅ PASS |
| F14 | UI commit-on-blur on a deleted node | ✅ PASS |
| F15 | UI commit-on-blur store error | ✅ PASS |
| F16 | Dirty-edit guard (queued, not executed) | ✅ PASS |
| F17 | Caret restore for a deleted node | ✅ PASS |
| C1 | Six edit ops | ✅ PASS |
| C2 | One edit controller | ✅ PASS |
| C3 | One `rag-store-changed` event + one `edit-commit` method | ✅ PASS |
| C4 | Six result types + two commit reasons | ✅ PASS |
| C5 | Re-traversal trigger payloads (MCP handler) | ✅ PASS |

**Run summary:** 38 scenarios — 38 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from `docs/specs/unit-d-editing.md`
  §5.1–§5.10 passed against the live modules. The six edit ops, the edit
  controller, the MCP handler, the re-traversal trigger payloads, the dirty-edit
  guard, caret/focus preservation, the dangling back-reference → read-only
  refusal, multi-parent duplicate coherence, MCP/UI equivalence, and all 17
  fail-states match the spec.

### Test-authoring notes (not drifts)

- **Content roots are nested in the traversal envelope.** In H15, the duplicate
  subtrees live inside each payload's `.content` array (`envelope.content[i]
  .content[j]`), not directly on `envelope.content[i]`. The A duplicates are
  identified by `props.id === 'rag-A'` (the stable authored root id, Unit C
  §5.3). An initial filter on `envelope.content` directly returned 0 — a test
  bug, corrected by descending into the payload `.content` arrays.
- **The UI re-traversal is the renderer's response to the store change.** In
  H16, the controller's `commit` does not itself call `onRebuild` unless a
  rebuild was already queued by the dirty-edit guard. The re-traversal after a
  UI commit comes from the renderer subscribing to `rag-store-changed` and
  calling `requestRebuild()` (§5.1.9). The test simulates that response by
  calling `requestRebuild()` after `commit` (no control is dirty, so it executes
  immediately). This matches the spec's MCP/UI-equivalence claim (both paths
  re-traverse in response to the store change).
- **`setEdge` structural payload.** The `edit.set_edge` re-traversal payload is
  `{ kind:'structural', nodeIds:[source,target], edgeIds:[edge.id] }` — verified
  with a valid edge (an earlier probe that merged away the target node produced
  no event because the op correctly failed, not because the payload was wrong).
