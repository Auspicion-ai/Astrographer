# Unit N — Batch Atomicity (a Real Transaction on the `RagStore`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-n-batch-atomicity.md` ONLY — no implementation reading of
  `src/`).
- **Source contract:** `docs/specs/unit-n-batch-atomicity.md` §5.7 (the 14
  happy-path states) + §5.8 (the 11 fail-states) + §5.1/§5.2/§5.3 (the
  `applyBatch` API + the atomicity/rollback semantics the happy/fail states
  ride) + §5.4 (the single `batch` journal entry + the inverse discipline) +
  §5.5 (the single-persist behavior) + §5.6 (the re-entrancy guarantee) + §3a
  (the adversarial findings A1–A7 the contract pins).
- **Modules under test:** `src/main/rag-store.ts` (the amended `RagStore`
  interface with the NEW `applyBatch` method + the `BatchOp`/`BatchOpResult`/
  `BatchResult` types + the `batch` journal kind + the `isValidBatchOp`/
  `isValidJournalEntry` boot validators + the internal batch-application/
  rollback paths). Supporting modules imported for fixtures (NOT the
  implementation under test): `node:crypto` (the SHA-256 hash helper).
- **Harness:** `tests/unit-n-batch-atomicity.test.ts`, executed with
  `npx vitest run tests/unit-n-batch-atomicity.test.ts`. The store is exercised
  through the real `createJsonRagStore` factory against a temp-file JSON store.
  The `nodeHash` helper replicates the store's `nodeSource` field order
  (`id, type, content, children, props, ownedNodeIds, createdAt, updatedAt`)
  so persisted-file fixtures (quarantined-node / malformed-batch-entry boot)
  can be authored with a hash the store will re-derive.
- **Run:** 25 scenarios — 25 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.7 Happy-path states (14)

Fixture helpers: `makeNode(id, overrides)` = a snapshot node
`{ id, type: 'p', content: 'content-<id>', ownedNodeIds: [], createdAt,
updatedAt, ...overrides }`; `makeEdge(id, source, target, overrides)` = a
snapshot edge `{ id, kind: 'parent-child', source, target, createdAt,
updatedAt, ...overrides }`. A valid `RagNodeChild` is
`{ type: 'strong'|'em'|'a'|'img', content: string, props? }`.

### H1. Empty batch (§5.7 1)
- **Setup:** a fresh temp-file JSON store at `file`.
- **Ops:** `applyBatch([])`.
- **Expected:** `{ ok: true, results: [] }` (a no-op, valid); `journal()` is
  `[]` (no journal entry); `undoDepth()`/`redoDepth()` are unchanged (0); the
  file does NOT exist (no persist).

### H2. Single-op batch (putNode create) (§5.7 2)
- **Setup:** a fresh temp-file JSON store at `file`.
- **Ops:** `applyBatch([{ op: 'putNode', node: makeNode('n1') }])`.
- **Expected:** `{ ok: true, results: [{ op: 'putNode', node: { id: 'n1' } }] }`;
  `getNode('n1')` is defined; `listNodes()` has 1 entry; `undoDepth()` is 1;
  the file exists (written atomically).

### H3. Multi-op batch (create node + edge) (§5.7 3)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'putNode', node: n1 }, { op: 'putNode', node: n2
  }, { op: 'putEdge', edge: e1 }])` where `e1` references `n1`/`n2`.
- **Expected:** `{ ok: true, results: [putNode, putNode, putEdge] }`; `n1`,
  `n2`, and `e1` are all present; the batch lands as ONE `batch` journal entry
  (not three); `undoDepth()` is 1.

### H4. Batch with a node update (§5.7 4)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { content:
  'before' }))`; capture `before = getNode('n1').updatedAt`.
- **Ops:** `applyBatch([{ op: 'putNode', node: makeNode('n1', { content:
  'after' }) }])`.
- **Expected:** the node is replaced (`getNode('n1').content === 'after'`);
  `updatedAt` is refreshed (≠ `before`); the batch lands as ONE `batch` entry
  whose `inverse` has length 1 with `inverse[0].op === 'putNode'` (the inverse
  captures the before-state).

### H5. Batch with a removeNode (§5.7 5)
- **Setup:** a fresh temp-file JSON store; `putNode(n1)`, `putNode(n2)`,
  `putEdge(e1, n1, n2)`.
- **Ops:** `applyBatch([{ op: 'removeNode', id: 'n1' }])`.
- **Expected:** `{ ok: true, results: [{ op: 'removeNode', removed: true }] }`;
  `getNode('n1')` is `undefined`; the cascade removes `e1` (referencing `n1`);
  the unrelated node `n2` survives.

### H6. Batch with a removeNode of a nonexistent id (§5.7 6)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'removeNode', id: 'ghost' }])`.
- **Expected:** `{ ok: true, results: [{ op: 'removeNode', removed: false }] }`
  (a no-op, consistent with the single-op `removeNode` semantics — does NOT
  fail the batch).

### H7. Batch with a removeEdge of a nonexistent id (§5.7 7)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'removeEdge', id: 'ghost' }])`.
- **Expected:** `{ ok: true, results: [{ op: 'removeEdge', removed: false }] }`
  (a no-op, does NOT fail the batch).

### H8. Batch undo/redo (whole batch as a unit) (§5.7 8)
- **Setup:** a fresh temp-file JSON store; `applyBatch([putNode n1, putNode n2,
  putEdge e1])`; `undoDepth()` is 1.
- **Ops:** `undo()`; then `redo()`.
- **Expected:** `undo()` restores the pre-batch state as a unit (`n1`/`n2`/`e1`
  all gone); `redoDepth()` is 1; `redo()` re-applies the whole batch (all back).
  Depths move by 1 per undo/redo (one `batch` entry).

### H9. Batch undo/redo (node update) (§5.7 9)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { content:
  'before' }))`; `applyBatch([{ op: 'putNode', node: makeNode('n1', { content:
  'after' }) }])`.
- **Ops:** `undo()`; then `redo()`.
- **Expected:** `undo()` restores the prior content (`'before'`); `redo()`
  re-applies the new content (`'after'`).

### H10. Batch with a `children`-bearing node (§5.7 10)
- **Setup:** a fresh temp-file JSON store at `file`.
- **Ops:** `applyBatch([{ op: 'putNode', node: makeNode('n1', { children: [{
  type: 'strong', content: 'bold' }] }) }])`.
- **Expected:** the node is stored with `children` intact
  (`getNode('n1').children` equals the input); the on-disk `hash` equals
  `nodeHash(stored)` (the hash covers `children`, Unit M §5.2); the batch lands
  as ONE `batch` entry.

### H11. Batch serialization (single-writer) (§5.7 11)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** two concurrent `applyBatch` calls — `p1` creates `n1`; `p2` creates
  `n2` + edge `e1` referencing `n1`; `await Promise.all([p1, p2])`.
- **Expected:** both run, in FIFO order; the second observes the first's effect
  (the second batch's edge references `n1` created by the first → serialized
  FIFO); `n1`, `n2`, and `e1` are all present (the batch is a single write
  unit, not N interleavable writes).

### H12. Batch re-entrancy (no deadlock) (§5.7 12)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `store.enqueue(async () => store.applyBatch([{ op: 'putNode', node:
  makeNode('n1') }]))`.
- **Expected:** the batch completes (does not hang) — `applyBatch` called from
  inside the queue runs directly via the `inQueue` re-entrant path;
  `getNode('n1')` is defined (A5).

### H13. Batch round-trip (persist → boot) (§5.7 13)
- **Setup:** a temp-file JSON store at `file`; store A `applyBatch([putNode n1,
  putNode n2, putEdge e1])`.
- **Ops:** boot a fresh store B from `file`.
- **Expected:** `status().corrupt === false`; all batch-created records load
  (`n1`/`n2`/`e1` defined); the single `batch` journal entry loads (validated at
  boot); `undo()` on the fresh store restores the pre-batch state (all gone).

### H14. Batch journal cap (§5.7 14)
- **Setup:** a fresh temp-file JSON store with `maxJournalLength: 3`.
- **Ops:** 4 `applyBatch` calls, each creating a node `n0`…`n3`.
- **Expected:** `journal()` has 3 entries, all `batch` kind (the oldest batch
  entry is dropped — a `batch` entry counts as ONE entry toward the cap);
  `undoDepth()` is 3; the journal cap only drops undo history — `getNode('n0')`
  is still defined.

---

## B. §5.8 Fail-states (11)

### F1. Invalid op kind (§5.8 1)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'bogus' }])`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: invalid op at index 0',
  failedIndex: 0 }`; the store is unchanged (`listNodes()`/`listEdges()` are
  `[]`, `journal()` is `[]`, `undoDepth()`/`redoDepth()` are 0).

### F2. Malformed op payload (putNode) (§5.8 2)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'putNode', node: makeNode('n1', { type: 'bogus'
  }) }])`.
- **Expected:** `{ ok: false, error: /^rag applyBatch: .* required\/invalid at
  index 0$/, failedIndex: 0 }`; the store is unchanged (`listNodes()` is `[]`).

### F3. Malformed op payload (putEdge) (§5.8 3)
- **Setup:** a fresh temp-file JSON store; `putNode(n1)`, `putNode(n2)`.
- **Ops:** `applyBatch([{ op: 'putEdge', edge: makeEdge('e1', '', 'n2') }])`.
- **Expected:** `{ ok: false, error: /^rag applyBatch: .* required\/invalid at
  index 0$/, failedIndex: 0 }`; the store is unchanged (`listEdges()` is `[]`).

### F4. putEdge referencing a nonexistent node (§5.8 4)
- **Setup:** a fresh temp-file JSON store; `putNode(n1)`.
- **Ops:** `applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost')
  }])`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source/target node not
  found or quarantined at index 0', failedIndex: 0 }`; the store is unchanged
  (`listEdges()` is `[]`).

### F5. putEdge referencing a quarantined node (§5.8 5)
- **Setup:** a temp-file JSON store at `file`; store A `putNode(n1)` +
  `putNode(q1)`; tamper `q1` on disk without updating its hash; boot a fresh
  store from `file` (so `q1` is quarantined — `status().quarantined` contains
  `q1`).
- **Ops:** `applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'q1') }])`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source/target node not
  found or quarantined at index 0', failedIndex: 0 }`; the store is unchanged
  (a quarantined endpoint is treated as nonexistent — A6; `listEdges()` is
  `[]`).

### F6. A batch that fails partway (§5.8 6)
- **Setup:** a fresh temp-file JSON store at `file`.
- **Ops:** `applyBatch([{ op: 'putNode', node: n1 }, { op: 'putNode', node: n2
  }, { op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost') }])` where op 3 fails.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source/target node not
  found or quarantined at index 2', failedIndex: 2 }`; the store is ROLLED BACK
  to the pre-batch state (ops 1–2 undone — `n1`/`n2` are NOT present,
  `listNodes()`/`listEdges()` are `[]`); `journal()` is unchanged (`[]`);
  `undoDepth()`/`redoDepth()` are unchanged (0); the on-disk file is unchanged
  (no persist on failure — the file was never written) (A1/A2/A3).

### F7. A batch containing a forward-looking rich-text op (§5.8 7)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'setProps', nodeId: 'n1', props: { a: 1 } }])`;
  `applyBatch([{ op: 'setSubtree', nodeId: 'n1', children: [] }])`;
  `applyBatch([{ op: 'setType', nodeId: 'n1', type: 'p' }])`.
- **Expected:** each returns `{ ok: false, error: 'rag applyBatch: op not
  supported: <op> at index 0', failedIndex: 0 }` (their application is Unit O —
  A7); the store is unchanged (`listNodes()` is `[]`, `journal()` is `[]`).

### F8. A batch whose putNode writes a malformed `children` array (§5.8 8)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'putNode', node: makeNode('n1', { children: [{
  type: 'span', content: 'x' }] }) }])`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: children required/invalid
  at index 0', failedIndex: 0 }`; the store is unchanged (the Unit M §5.4
  validation applies inside the batch; `listNodes()` is `[]`).

### F9. A batch whose putEdge writes a self-referential edge (§5.8 9)
- **Setup:** a fresh temp-file JSON store; `putNode(n1)`.
- **Ops:** `applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'n1') }])`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: source required/invalid at
  index 0', failedIndex: 0 }`; the store is unchanged (the Unit A §5.1
  self-referential rejection applies; `listEdges()` is `[]`).

### F10. A batch whose putNode writes a dangerous-key `props` (§5.8 10)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `applyBatch([{ op: 'putNode', node: makeNode('n1', { props: {
  __proto__: {} } }) }])`.
- **Expected:** `{ ok: false, error: 'rag applyBatch: props required/invalid at
  index 0', failedIndex: 0 }`; the store is unchanged (the prototype-pollution
  guard applies; `listNodes()` is `[]`).

### F11. A persisted `batch` journal entry with a malformed op at boot (§5.8 11)
- **Setup:** a temp-file JSON store at `file` authored with a journal containing
  a VALID `batch` entry (`ops: [{ op: 'putNode', node: validNode }]`) AND a
  MALFORMED `batch` entry (`ops: [{ op: 'bogus' }]`).
- **Ops:** boot a store from `file`.
- **Expected:** `status().corrupt === false`; `journal()` has exactly 1 entry
  (the malformed entry is SKIPPED — the `isValidBatchOp` validator rejects it);
  the remaining entry is `batch` kind.

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Empty batch (§5.7 1) | ✅ PASS |
| H2 | Single-op batch (putNode create) (§5.7 2) | ✅ PASS |
| H3 | Multi-op batch (create node + edge) (§5.7 3) | ✅ PASS |
| H4 | Batch with a node update (§5.7 4) | ✅ PASS |
| H5 | Batch with a removeNode (§5.7 5) | ✅ PASS |
| H6 | Batch with a removeNode of a nonexistent id (§5.7 6) | ✅ PASS |
| H7 | Batch with a removeEdge of a nonexistent id (§5.7 7) | ✅ PASS |
| H8 | Batch undo/redo (whole batch as a unit) (§5.7 8) | ✅ PASS |
| H9 | Batch undo/redo (node update) (§5.7 9) | ✅ PASS |
| H10 | Batch with a `children`-bearing node (§5.7 10) | ✅ PASS |
| H11 | Batch serialization (single-writer) (§5.7 11) | ✅ PASS |
| H12 | Batch re-entrancy (no deadlock) (§5.7 12) | ✅ PASS |
| H13 | Batch round-trip (persist → boot) (§5.7 13) | ✅ PASS |
| H14 | Batch journal cap (§5.7 14) | ✅ PASS |
| F1 | Invalid op kind (§5.8 1) | ✅ PASS |
| F2 | Malformed op payload (putNode) (§5.8 2) | ✅ PASS |
| F3 | Malformed op payload (putEdge) (§5.8 3) | ✅ PASS |
| F4 | putEdge referencing a nonexistent node (§5.8 4) | ✅ PASS |
| F5 | putEdge referencing a quarantined node (§5.8 5) | ✅ PASS |
| F6 | A batch that fails partway (§5.8 6) | ✅ PASS |
| F7 | A batch containing a forward-looking rich-text op (§5.8 7) | ✅ PASS |
| F8 | A batch whose putNode writes a malformed `children` array (§5.8 8) | ✅ PASS |
| F9 | A batch whose putEdge writes a self-referential edge (§5.8 9) | ✅ PASS |
| F10 | A batch whose putNode writes a dangerous-key `props` (§5.8 10) | ✅ PASS |
| F11 | A persisted `batch` journal entry with a malformed op at boot (§5.8 11) | ✅ PASS |

**Run summary:** 25 scenarios — 25 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-n-batch-atomicity.md` §5.7/§5.8 (plus the §5.1/§5.2/§5.3
  API + atomicity/rollback semantics, the §5.4 single-`batch`-entry + inverse
  discipline, the §5.5 single-persist behavior, the §5.6 re-entrancy
  guarantee, and the §3a adversarial pins A1–A7) passed against the live
  `src/main/rag-store.ts`. The `applyBatch` method exists on the `RagStore`
  interface and returns the discriminated `BatchResult` (§5.1); an empty batch
  is a valid no-op with no journal/persist (§5.7 1); a successful batch applies
  all ops atomically, lands as exactly ONE `batch` journal entry, and persists
  once (§5.7 2/3/4/10, §5.4/§5.5); undo/redo restores/re-applies the whole batch
  as a unit (§5.7 8/9); the batch is serialized through the single-writer queue
  and re-entrant (no deadlock) (§5.7 11/12, §5.6); a batch round-trips through
  persist → boot and counts as ONE entry toward the journal cap (§5.7 13/14);
  every documented fail-state returns `{ ok: false, error, failedIndex }` with
  the store unchanged and rolled back on a mid-batch failure (§5.8 1–11, §5.3).
  No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H11 (batch serialization).** The two-concurrent-`applyBatch` test (the
  second batch's edge references a node created by the first) is the direct
  node-testable proxy for the §5.2 "serialized (single-writer)" claim — the
  second batch must observe the first's effect, proving FIFO serialization.
- **H12 (batch re-entrancy).** The `enqueue(() => applyBatch(...))` wrapper is
  the direct node-testable proxy for the §5.6 "no deadlock" claim — a batch
  called from inside the queue must run directly (the `inQueue` pattern) and
  complete rather than hang (A5).
- **F5 (quarantined endpoint).** The `q1` node is tampered on disk without a
  hash update so the boot re-verification quarantines it; the batch's
  referential check must then treat it as nonexistent (A6).
- **F11 (malformed batch entry at boot).** The file is authored with BOTH a
  valid and a malformed `batch` entry so the test proves the malformed one is
  SKIPPED (via `isValidBatchOp`) while the valid one still loads — the SKIP
  must come from the boot validator, not from a whole-file rejection.
