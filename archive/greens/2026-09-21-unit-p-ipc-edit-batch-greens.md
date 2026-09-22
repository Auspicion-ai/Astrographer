# Unit P — The `IPC_EDIT_BATCH` IPC Channel (a Batch of Edits to the RAG Store): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-p-ipc-edit-batch.md` ONLY — no implementation reading of `src/`).
- **Source contract:** `docs/specs/unit-p-ipc-edit-batch.md` §5.6 (the 8 happy-path
  states) + §5.7 (the 10 fail-states) + §5.1 (the channel name `'provident:edit-batch'`
  + the `EditBatchPayload { ops: BatchOp[] }` request shape + the `BatchResult`
  response shape + the API rules) + §5.2 (the batch semantics — applied atomically
  via `applyBatch`, all-or-nothing, one journal entry, one persist) + §5.3 (the
  `bridge.edit.batch(ops): Promise<BatchResult>` preload method) + §5.4 (the
  `rag-store-changed` broadcast after a successful batch + the `deriveBatchBroadcast`
  helper) + §5.5 (the MCP/UI equivalence binding) + §3a (the adversarial findings
  A1–A7 the contract pins).
- **Modules under test:** `src/main/edit-ops.ts` (the `handleEditBatch` shared
  handler — the pure async function that validates the payload and calls
  `ragStore.applyBatch`, the node-testable proxy for the `ipcMain.handle(IPC_EDIT_BATCH, ...)`
  handler the spec pins in `src/main/main.ts` §5.4). Supporting module imported for
  the store fixture (NOT the implementation under test): `src/main/rag-store.ts`
  (the `createJsonRagStore` factory + the `RagStore` interface + the `RagNode`/
  `RagEdge` shapes the batch mutates).
- **Harness:** `tests/unit-p-ipc-edit-batch.test.ts`, executed with
  `npx vitest run tests/unit-p-ipc-edit-batch.test.ts`. The handler is a pure async
  function over the `RagStore` INTERFACE (Unit A §5.4 — SOURCE-SWITCHABLE), so it is
  exercised against the real `createJsonRagStore` factory on a temp-file JSON store
  exactly as the IPC handler uses it. All store mutating methods are queue-serialized
  and async, so every call is awaited.
- **Run:** 18 scenarios — 18 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.6 Happy-path states (8)

Fixture helper: `makeNode(id, overrides)` = a snapshot node
`{ id, type: 'p', content: 'content-<id>', ownedNodeIds: [], createdAt, updatedAt,
...overrides }`. `makeEdge(id, source, target)` = a snapshot edge
`{ id, kind: 'doc-child', source, target, order: 0, documentIds: [], createdAt,
updatedAt }`. The handler is invoked as `handleEditBatch(store, { ops })` where
`store` is a `createJsonRagStore` instance.

### H1. Single-op batch (putNode create) (§5.6 1)
- **Setup:** a fresh temp-file JSON store; `n1 = makeNode('n1')`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: n1 }] })`.
- **Expected:** `{ ok: true, results: [{ op: 'putNode', node: n1 }] }`; `getNode('n1')`
  returns the node; the batch lands as ONE `batch` journal entry (a create is
  structural — no pre-batch node); the store persists once.

### H2. Multi-op batch (create node + edge) (§5.6 2)
- **Setup:** a fresh temp-file JSON store; `n1 = makeNode('n1')`, `n2 = makeNode('n2')`,
  `e1 = makeEdge('e1', 'n1', 'n2')` (references `n1`/`n2`).
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: n1 }, { op: 'putNode',
  node: n2 }, { op: 'putEdge', edge: e1 }] })`.
- **Expected:** `{ ok: true, results: [putNode, putNode, putEdge] }`; `n1`, `n2`, and
  `e1` are all present; the batch lands as ONE `batch` journal entry.

### H3. Batch with a content-only node update (§5.6 3)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { content: 'old' }))`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: { ...makeNode('n1',
  { content: 'new' }), createdAt: getNode('n1').createdAt } }] })` (only `content`
  changes).
- **Expected:** `{ ok: true, results: [{ op: 'putNode', node: updated }] }`;
  `getNode('n1').content` is `'new'`; a content-only putNode is `'content'` kind.

### H4. Batch with a structural node update (type change) (§5.6 4)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { type: 'p' }))`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: { ...makeNode('n1',
  { type: 'h1' }), createdAt: getNode('n1').createdAt } }] })` (only `type` changes).
- **Expected:** `{ ok: true, results: [{ op: 'putNode', node: updated }] }`;
  `getNode('n1').type` is `'h1'`; a type change is `'structural'` kind.

### H5. Batch with a removeNode (§5.6 5)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1'))`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'removeNode', id: 'n1' }] })`.
- **Expected:** `{ ok: true, results: [{ op: 'removeNode', removed: true }] }`;
  `getNode('n1')` is `undefined`; a removeNode is `'structural'` kind.

### H6. Empty batch (§5.6 6)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, { ops: [] })`.
- **Expected:** `{ ok: true, results: [] }` (a no-op, valid — Unit N §5.7 item 1);
  no `batch` journal entry is recorded (an empty batch is a valid no-op).

### H7. Batch undo/redo (whole batch as a unit) (§5.6 7)
- **Setup:** a fresh temp-file JSON store; `n1 = makeNode('n1')`, `n2 = makeNode('n2')`,
  `e1 = makeEdge('e1', 'n1', 'n2')`.
- **Ops:** `handleEditBatch(store, { ops: [putNode n1, putNode n2, putEdge e1] })`;
  then `store.undo()`; then `store.redo()`.
- **Expected:** after the batch, `n1`/`n2`/`e1` are present; `undo()` restores the
  pre-batch state (all three gone) as a unit; `redo()` re-applies the whole batch
  (all three back). `undoDepth()`/`redoDepth()` move by 1 per undo/redo (one `batch`
  entry).

### H8. MCP/UI equivalence happy (§5.6 8)
- **Setup:** two independent fresh temp-file JSON stores `a.json`/`b.json`.
- **Ops:** the same `ops` (`[{ op: 'putNode', node: n1 }]`) on both stores —
  `handleEditBatch(storeA, { ops })` and `handleEditBatch(storeB, { ops })`.
- **Expected:** the MCP `edit.batch` tool and the UI `bridge.edit.batch` both route
  through the SAME `applyBatch` primitive (§5.5 BINDING) — the two stores produce
  IDENTICAL resulting store state (`storeA.getNode('n1').content` equals
  `storeB.getNode('n1').content`, `.type` matches).

---

## B. §5.7 Fail-states (10)

### F1. Malformed batch payload (non-object) (§5.7 1)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, null as never)`.
- **Expected:** `{ ok: false, error: 'edit-batch: ops must be an array', failedIndex: 0 }`;
  the store is unchanged; NO broadcast (A1 — a malformed payload is a domain result,
  never a throw).

### F2. Malformed batch payload (non-array ops) (§5.7 2)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, { ops: bad })` for each bad value in `['bogus', {},
  null, undefined]`.
- **Expected:** each returns `{ ok: false, error: 'edit-batch: ops must be an array',
  failedIndex: 0 }`; the store is unchanged; NO broadcast (A1).

### F3. Invalid op kind (§5.7 3)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'bogus' }] as never })`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: invalid op at index 0',
  failedIndex: 0 }`; the store is unchanged; NO broadcast.

### F4. Malformed op payload (putNode) (§5.7 4)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: { ...makeNode('n1'),
  type: 'span' } }] })` (an invalid `type`).
- **Expected:** `{ ok: false, error: /rag applyBatch: .* required\/invalid at index 0/,
  failedIndex: 0 }`; the store is unchanged; NO broadcast.

### F5. putEdge referencing a nonexistent node (§5.7 5)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1'))`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putEdge', edge: makeEdge('e1', 'n1',
  'ghost') }] })` where `ghost` does not exist.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source/target node not found or
  quarantined at index 0', failedIndex: 0 }`; the store is unchanged; NO broadcast.

### F6. putEdge referencing a quarantined node (§5.7 6)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1'))`; author a
  quarantined node `q1` (tampered hash) directly into the JSON file so it is
  invisible to `getNode`; reload the store.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putEdge', edge: makeEdge('e1', 'n1',
  'q1') }] })` where `q1` is quarantined.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source/target node not found or
  quarantined at index 0', failedIndex: 0 }`; the store is unchanged; NO broadcast
  (A3 — a quarantined endpoint is treated as nonexistent).

### F7. A batch that fails partway (§5.7 7)
- **Setup:** a fresh temp-file JSON store; capture `journalBefore = journal().length`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: n1 }, { op: 'putNode',
  node: n2 }, { op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost') }] })` where op 3
  fails.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source/target node not found or
  quarantined at index 2', failedIndex: 2 }`; the store is ROLLED BACK to the pre-batch
  state (ops 1–2 undone — `n1`/`n2` are NOT present); `journal().length` is unchanged;
  NO broadcast (A2).

### F8. A batch containing a forward-looking rich-text op (§5.7 8)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1'))`.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'setProps', nodeId: 'n1', props: { a: 1 }
  }] as never })` (or `setSubtree`/`setType`).
- **Expected:** `{ ok: false, error: 'rag applyBatch: op not supported: setProps at
  index 0', failedIndex: 0 }`; the store is unchanged; NO broadcast (A5 — their
  application within a batch is a forward-looking extension, deferred from Unit O §5.5).

### F9. A batch whose putNode writes a malformed `children` array (§5.7 9)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: { ...makeNode('n1'),
  children: [{ type: 'span', content: 'x' }] } }] })`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: children required/invalid at index
  0', failedIndex: 0 }`; the store is unchanged; NO broadcast (the Unit M §5.4
  validation applies inside the batch).

### F10. A batch whose putNode writes a dangerous-key `props` (§5.7 10)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `handleEditBatch(store, { ops: [{ op: 'putNode', node: { ...makeNode('n1'),
  props: JSON.parse('{"__proto__":{}}') } }] })`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: props required/invalid at index 0',
  failedIndex: 0 }`; the store is unchanged; NO broadcast (the prototype-pollution guard
  applies).

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Single-op batch (putNode create) (§5.6 1) | ✅ PASS |
| H2 | Multi-op batch (create node + edge) (§5.6 2) | ✅ PASS |
| H3 | Batch with a content-only node update (§5.6 3) | ✅ PASS |
| H4 | Batch with a structural node update (type change) (§5.6 4) | ✅ PASS |
| H5 | Batch with a removeNode (§5.6 5) | ✅ PASS |
| H6 | Empty batch (§5.6 6) | ✅ PASS |
| H7 | Batch undo/redo (whole batch as a unit) (§5.6 7) | ✅ PASS |
| H8 | MCP/UI equivalence happy (§5.6 8) | ✅ PASS |
| F1 | Malformed batch payload (non-object) (§5.7 1) | ✅ PASS |
| F2 | Malformed batch payload (non-array ops) (§5.7 2) | ✅ PASS |
| F3 | Invalid op kind (§5.7 3) | ✅ PASS |
| F4 | Malformed op payload (putNode) (§5.7 4) | ✅ PASS |
| F5 | putEdge referencing a nonexistent node (§5.7 5) | ✅ PASS |
| F6 | putEdge referencing a quarantined node (§5.7 6) | ✅ PASS |
| F7 | A batch that fails partway (§5.7 7) | ✅ PASS |
| F8 | A batch containing a forward-looking rich-text op (§5.7 8) | ✅ PASS |
| F9 | A batch whose putNode writes a malformed `children` array (§5.7 9) | ✅ PASS |
| F10 | A batch whose putNode writes a dangerous-key `props` (§5.7 10) | ✅ PASS |

**Run summary:** 18 scenarios — 18 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-p-ipc-edit-batch.md` §5.6/§5.7 (plus the §5.1 channel/request/
  response shapes + API rules, the §5.2 batch semantics, the §5.3 bridge method, the
  §5.4 broadcast rules, the §5.5 MCP/UI equivalence binding, and the §3a adversarial
  pins A1–A7) passed against the live `src/main/edit-ops.ts` `handleEditBatch`. The
  handler exists and is exported; it validates the payload and returns the
  `BatchResult` (§5.1); a successful batch applies atomically with ONE `batch` journal
  entry (§5.6 1/2, §5.2, A4); a content-only putNode is `'content'` and a type-change/
  create/remove is `'structural'` (§5.6 3/4/5, §5.4); an empty batch is a valid no-op
  (§5.6 6); undo/redo move the whole batch as a unit (§5.6 7, §5.2); the same ops
  produce identical store state across stores (§5.6 8, §5.5); every documented
  fail-state returns `{ ok: false, error, failedIndex }` with the store unchanged and
  no journal pollution (§5.7 1–10, A1/A2/A3/A5). No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H8 (MCP/UI equivalence).** The two-independent-stores test (same `ops` on each)
  is the direct node-testable proxy for the §5.5 "same batch reachable via MCP tool
  and UI IPC" claim — the MCP `edit.batch` tool and the UI `bridge.edit.batch` both
  route through the SAME `applyBatch` primitive, so identical `ops` must produce
  identical store state. The MCP tool WIRING itself (`edit.batch` in `mcp-server.ts`)
  is forward-looking (a later unit, §5.5) and is NOT exercised here.
- **H6 (empty batch).** The `journal().length`-unchanged assertion (no `batch` entry
  for an empty batch) is the direct node-testable proxy for the §5.6 6 "a no-op, valid"
  claim (Unit N §5.7 item 1). The spec's §5.8 census "an empty batch broadcasts 1 time"
  is a broadcast-level claim exercised by the main handler, not the shared
  `handleEditBatch`; the node-testable proxy here is the no-op journal behavior.
- **F6 (quarantined node).** The tampered-hash JSON file is authored directly so the
  node is invisible to `getNode` (quarantined) — proving the batch's referential
  integrity treats a quarantined endpoint as nonexistent and returns a domain result
  rather than an uncaught throw (A3).
- **F10 (dangerous-key props).** The `JSON.parse('{"__proto__":{}}')` form is used so
  the test exercises a real own `__proto__` key (an object literal would set the
  prototype instead) — proving the batch's prototype-pollution guard returns a domain
  result rather than an uncaught store throw.
- **Broadcast-level claims (§5.4/§5.8).** The `rag-store-changed` broadcast (exactly
  once on success, 0 on failure) and the `bridge.edit.batch` preload method are pinned
  in `src/main/main.ts`/`src/main/preload.ts` (main-process concerns). The
  `deriveBatchBroadcast` helper — the pure broadcast-derivation function — lives in
  `src/main/edit-ops.ts` (moved out of `main.ts` so it is node-testable without
  importing electron) and is DIRECTLY unit-tested by the adversarial regression set
  (Unit P §3a F1: create → structural, content-only → content, type change →
  structural, ownedNodeIds change → structural, putEdge/removeNode → structural, empty
  batch → content, determinism, and the F2 short-results guard). The node-testable
  scenarios here pin the handler's payload validation, the `applyBatch` routing, the
  atomicity/rollback, the journal behavior, and the MCP/UI equivalence — the
  channel-level contract the broadcast rides on.
