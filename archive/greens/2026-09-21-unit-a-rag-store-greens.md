# Unit A — RAG Store: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-a-rag-store.md`
  ONLY — no implementation reading).
- **Source contract:** `docs/specs/unit-a-rag-store.md` §5.1–§5.10.
- **Module under test:** `src/main/rag-store.ts` (`createJsonRagStore`).
- **Method discipline:** mutating methods (`putNode`/`removeNode`/`putEdge`/
  `removeEdge`/`undo`/`redo`) and `enqueue` are ASYNC — awaited. Reads
  (`getNode`/`listNodes`/`getEdge`/`listEdges`/`status`/`journal`/
  `undoDepth`/`redoDepth`) are synchronous.
- **Store path:** a unique temp path per scenario (`os.tmpdir()` + unique dir).

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (11)

### H1. Fresh boot (missing file)
- **Setup:** `createJsonRagStore({ path: <nonexistent>.json })`.
- **Ops:** `status()`.
- **Expected:** `{ corrupt: false, quarantined: [], loadedNodes: [], loadedEdges: [] }`.

### H2. Node create
- **Setup:** fresh store.
- **Ops:** `await putNode({ id:'n1', type:'p', content:'hello', ownedNodeIds:[], createdAt, updatedAt })`.
- **Expected:** returns the stored node; `getNode('n1')` returns it; `listNodes()`
  has 1 entry; the file is written atomically (exists, valid JSON, no `.tmp`
  leftover).

### H3. Node update
- **Setup:** store with `n1` created.
- **Ops:** `await putNode` same `id`, new `content`.
- **Expected:** node replaced; `updatedAt` refreshed; a `content` journal entry
  recorded.

### H4. Edge create
- **Setup:** store with nodes `n1`, `n2`.
- **Ops:** `await putEdge({ id:'e1', kind:'parent-child', source:'n1', target:'n2', ... })`.
- **Expected:** `getEdge('e1')` returns it; `listEdges()` has 1 entry.

### H5. Node remove cascade
- **Setup:** store with `n1`, `n2`, edge `e1` (n1→n2).
- **Ops:** `await removeNode('n1')`.
- **Expected:** returns `true`; `getNode('n1')` is `undefined`; `getEdge('e1')`
  is `undefined` (cascade removes edges referencing the removed node).

### H6. Edge remove
- **Setup:** store with edge `e1`.
- **Ops:** `await removeEdge('e1')`.
- **Expected:** returns `true`; `getEdge('e1')` is `undefined`.

### H7. Queue serialization (FIFO + effect visibility)
- **Setup:** fresh store.
- **Ops:** two concurrent `enqueue` writes; then two concurrent `enqueue` where
  the second reads what the first wrote.
- **Expected:** both run, in FIFO order (the second starts only after the first
  fully settles); the second observes the first's effect.

### H8. Content undo/redo
- **Setup:** store with `n1` created (`content:'hello'`, `props:{a:1}`), then
  updated (`content:'world'`, `props:{b:2}`).
- **Ops:** `await undo()` then `await redo()`.
- **Expected:** `undo()` restores `content:'hello'`/`props:{a:1}`; `redo()`
  re-applies `content:'world'`/`props:{b:2}`.

### H9. Structural undo/redo (node-add)
- **Setup:** store with `n1` created (records a structural `node-add`).
- **Ops:** `await undo()` then `await redo()`.
- **Expected:** `undo()` removes the node (inverse `node-delete`) and signals a
  re-traversal; `redo()` re-adds it. `getNode('n1')` is `undefined` after undo,
  defined after redo.

### H10. Boot with a valid file
- **Setup:** store A writes `n1`, `n2`, edge `e1` (n1→n2) to path P; then a
  fresh store B boots from P.
- **Ops:** `status()` on B.
- **Expected:** `corrupt:false`; `loadedNodes` includes `n1`,`n2`;
  `loadedEdges` includes `e1`; `quarantined` empty.

### H11. Boot with a quarantined record
- **Setup:** store A writes `n1` to P; the file is tampered (node `content`
  changed WITHOUT updating its stored hash); fresh store B boots from P.
- **Ops:** `status()` on B.
- **Expected:** `status().quarantined` includes `n1`; `n1` is NOT in
  `loadedNodes`/`loadedEdges`.

---

## B. §5.9 Fail-states (11)

### F1. `createJsonRagStore` bad opts
- **Setup:** `null`, `undefined`, `{ path: '' }`.
- **Expected:** each throws `Error('rag store: path required')`.
- **Note:** `{ path: '   ' }` (whitespace-only) is a NON-empty string, so it
  does NOT throw (spec §5.3 — see the test-authoring note below).

### F2. Corrupt file boot
- **Setup:** file with (a) invalid JSON, (b) a non-object (e.g. `[1,2,3]`),
  (c) `version: 2`.
- **Expected:** each boots empty with `status().corrupt === true`; never throws.

### F3. `putNode` malformed record
- **Setup:** fresh store; records: `null`, non-object, empty `id`, invalid
  `type`, non-string `content`, non-array `ownedNodeIds`.
- **Expected:** each throws `Error('rag putNode: <field> required/invalid')`;
  the store is unchanged (`listNodes()` empty).

### F4. `putEdge` malformed record
- **Setup:** store with `n1`,`n2`; records: `null`, non-object, empty `id`,
  invalid `kind`, empty `source`, empty `target`.
- **Expected:** each throws `Error('rag putEdge: <field> required/invalid')`;
  the store is unchanged (`listEdges()` empty).

### F5. `putEdge` referencing a nonexistent node
- **Setup:** store with `n1` only.
- **Ops:** `putEdge` with `source:'n1', target:'ghost'`; and `source:'ghost',
  target:'n1'`.
- **Expected:** each throws
  `Error('rag putEdge: source/target node not found or quarantined')`; the
  store is unchanged.

### F6. `removeNode` of a nonexistent id
- **Expected:** returns `false` (no-op, no throw).

### F7. `removeEdge` of a nonexistent id
- **Expected:** returns `false` (no-op, no throw).

### F8. `undo()` at the base boundary
- **Setup:** fresh store (cursor at 0).
- **Expected:** returns `null` (no-op, no throw).

### F9. `redo()` at the redo boundary
- **Setup:** fresh store; and after an edit with nothing undone.
- **Expected:** returns `null` (no-op, no throw).

### F10. A write that throws inside the queue
- **Setup:** fresh store.
- **Ops:** `enqueue(() => { throw new Error('boom') })`, then a normal
  `enqueue` write.
- **Expected:** the rejection propagates to the caller of the failed `enqueue`;
  the NEXT enqueued write still runs (failure isolation).

### F11. Persist failure
- **Setup:** store writes `n1` to P; P is then replaced by a directory (so the
  atomic rename fails).
- **Ops:** `await putNode('n2')`.
- **Expected:** no crash / no throw; the in-memory store reflects the write
  (`getNode('n2')` defined); on-disk state may be stale (documented, not
  surfaced as a throw).

---

## C. Contract points (§5.1–§5.7, §5.10)

### C1. Return-shape discipline
- `getNode`/`getEdge` return a shallow copy (mutating the returned object does
  not change the store). `listNodes`/`listEdges` return fresh arrays of shallow
  copies. `status()` returns a fresh object. `journal()` returns a fresh array
  of shallow copies.

### C2. Atomic write
- After a mutation the file at `opts.path` exists, is valid JSON with
  `version: 1`, is written with 2-space indent, and no `${path}.tmp` file
  remains.

### C3. Hash-verified source
- Each persisted node/edge record carries a `hash` field that is a 64-char
  lowercase hex string (SHA-256), always derived at write time.

### C4. Journal cap (`maxJournalLength`)
- A store created with `maxJournalLength: 3` and 6 journal-producing writes
  keeps at most 3 entries (oldest dropped); `undo()` past the dropped base
  returns `null`.
- Default cap is 1000 entries (§5.10): 1001 content writes keep ≤ 1000 entries.

### C5. Structural journal inversion (edge ops)
- `edge-add` inverts to `edge-remove`; `edge-remove` inverts to `edge-add`
  (verified via `undo()`/`redo()` on an edge).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Fresh boot (missing file) | ✅ PASS |
| H2 | Node create | ✅ PASS |
| H3 | Node update | ✅ PASS |
| H4 | Edge create | ✅ PASS |
| H5 | Node remove cascade | ✅ PASS |
| H6 | Edge remove | ✅ PASS |
| H7 | Queue serialization | ✅ PASS |
| H8 | Content undo/redo | ✅ PASS |
| H9 | Structural undo/redo | ✅ PASS |
| H10 | Boot with valid file | ✅ PASS |
| H11 | Boot with quarantined record | ✅ PASS |
| F1 | Bad opts throw | ✅ PASS |
| F2 | Corrupt file boot | ✅ PASS |
| F3 | putNode malformed | ✅ PASS |
| F4 | putEdge malformed | ✅ PASS |
| F5 | putEdge nonexistent node | ✅ PASS |
| F6 | removeNode nonexistent | ✅ PASS |
| F7 | removeEdge nonexistent | ✅ PASS |
| F8 | undo at base | ✅ PASS |
| F9 | redo at boundary | ✅ PASS |
| F10 | Queue failure isolation | ✅ PASS |
| F11 | Persist failure | ✅ PASS |
| C1 | Return-shape discipline | ✅ PASS |
| C2 | Atomic write | ✅ PASS |
| C3 | Hash-verified source | ✅ PASS |
| C4 | Journal cap (`maxJournalLength` option, incl. default = 1000) | ✅ PASS |
| C5 | Structural edge inversion | ✅ PASS |

**Run summary:** 27 scenarios — 27 pass.

### Finding (spec-vs-impl drift — RESOLVED)

- **C4 — `maxJournalLength` option not honored (RESOLVED).** The blind run
  found the option documented in §5.6/§5.10 but not wired through the
  implementation (a store created with `maxJournalLength: 3` grew its journal
  unbounded). This was a genuine spec-vs-impl drift. The host-side fix landed in
  `src/main/rag-store.ts` — the option is now honored (`maxJournalLength`
  bounds the journal by dropping the oldest entries, default 1000) — and is
  regression-tested in `tests/rag-store-adversarial.test.ts`. C4 now passes.

### Test-authoring note (not a drift)

- **F1 whitespace path.** The spec (§5.3) throws only when `opts.path` is "not a
  non-empty string". `'   '` IS a non-empty string, so it must NOT throw. The
  implementation correctly does not throw; an initial test assertion expecting a
  throw was a test bug and was corrected (the implementation is spec-conformant
  here).
