# Spec — Unit N: Batch Atomicity (a Real Transaction on the `RagStore`)

- **Status:** SPEC (the batch-atomicity foundation for the rich-text editing
  machinery — one of the RICH-TEXT-EDITING-GATE must-fix items to land).
  Gate reference: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the
  resolved design pins "batch atomicity (a real transaction, not
  `store.enqueue`)"). This unit lands the **batch/transaction API on the
  `RagStore` interface** — a method that applies a batch of edit operations
  atomically (all or nothing, with rollback on failure). It is the foundation
  the rich-text ops (`setProps`/`setSubtree`/`setType`, Unit O) and
  `IPC_EDIT_BATCH` (Unit P) build on. It does NOT implement the rich-text ops
  (Unit O), the `IPC_EDIT_BATCH` IPC channel (Unit P), the retrieval indexing
  of inline `children` text, the traversal disambiguation of inline vs
  doc-children, or paste-time sanitization (later slices).
- **Scope:** a NEW `applyBatch` method on the `RagStore` interface in
  `src/main/rag-store.ts`, the `BatchOp`/`BatchOpResult`/`BatchResult` types,
  the atomicity/rollback semantics, the single-journal-entry integration (a new
  `batch` journal kind), the single-persist behavior, and the re-entrancy
  guarantee. The batch op shape carries the four store primitives
  (`putNode`/`removeNode`/`putEdge`/`removeEdge`) AND the three forward-looking
  rich-text ops (`setProps`/`setSubtree`/`setType`) — the latter are pinned in
  the TYPE now (so Unit O does not change the batch op shape) but their
  APPLICATION is Unit O; in THIS unit a batch containing one is a documented
  fail-state. This unit does NOT change the traversal, the renderer, or the
  edit-op census (6→9 is Unit O).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/main/rag-store.ts` (the `applyBatch` method + the `BatchOp`/
  `BatchOpResult`/`BatchResult` types + the `batch` journal kind + the
  `isValidBatchOp`/`isValidJournalEntry` boot validators + the internal
  batch-application/rollback paths) from §5.7/§5.8 before any implementation.

---

## 1. What the proposal asks

The rich-text contenteditable machinery (the RICH-TEXT-EDITING-GATE resolved
design) needs a batch of edits to apply **atomically** — all or nothing, with
rollback on failure. The resolved design pins "batch atomicity (a real
transaction, not `store.enqueue`)". The rich-text ops (`setProps`/`setSubtree`/
`setType`, Unit O) and `IPC_EDIT_BATCH` (Unit P) each need to apply a multi-op
edit as a single unit: if any op fails, the WHOLE batch rolls back (no partial
application), the journal is not polluted with a partial batch, and the batch
persists once. This unit lands that transaction primitive on the `RagStore`
interface:

1. **A new `applyBatch(ops)` method on the `RagStore` interface** that applies a
   batch of edit operations atomically. The batch op shape carries the four
   store primitives (`putNode`/`removeNode`/`putEdge`/`removeEdge`) and the
   three forward-looking rich-text ops (`setProps`/`setSubtree`/`setType`).
2. **Atomicity semantics:** if any op in the batch fails, the WHOLE batch rolls
   back (no partial application). The batch is serialized (single-writer) and
   persisted as a single unit.
3. **Rollback:** on failure, the store's in-memory state is restored to the
   pre-batch state (no partial mutations), and the journal is not polluted with
   a partial batch.
4. **Journal integration:** a successful batch lands as a SINGLE journal entry
   (invertible — undo/redo restores the whole batch), not N separate entries.
5. **Persistence:** a successful batch persists ONCE (not per-op).
6. **Re-entrancy:** a batch op that calls a store method must not deadlock (the
   existing `inQueue` re-entrancy pattern).
7. **Fail-states:** a batch with an invalid op, a batch that fails partway, a
   batch on a quarantined/unknown node, etc.

## 2. Feasibility verdict

**Feasible — a purely additive change to the already-landed
`src/main/rag-store.ts` (Unit A, amended by Unit M).** The store already has
the exact machinery this needs:

- **The single-writer queue** (§5.5 of Unit A) is the serialization point. The
  batch is applied inside the queue (like every mutating method), so it is
  serialized against all other writes. The `inQueue` re-entrancy flag (§5.5)
  already prevents deadlock for a call made from inside the queue — the batch
  follows the same pattern.
- **The internal sync methods** (`putNodeSync`/`removeNodeSync`/`putEdgeSync`/
  `removeEdgeSync`) apply each op against the in-memory store but journal and
  persist UNCONDITIONALLY. The batch therefore does NOT compose them directly —
  it applies its ops via a NON-JOURNALING, NON-PERSISTING internal path (the
  lower-level `insertNode`/`removeNodeInternal`/`insertEdge`/`setNodeFields`/
  `setEdgeFields` helpers, or a suppression flag on the sync methods), deferring
  journal + persist to a single unit at the end.
- **The journal** (§5.6 of Unit A) already has a discriminated `JournalEntry`
  union with `content`/`structural` kinds and a boot validator
  (`isValidJournalEntry`). A new `batch` kind slots into the same union and the
  same validator.
- **The invertible-entry discipline** (§5.6 of Unit A) already computes inverse
  ops for structural entries. A batch entry carries its forward ops AND its
  reverse-ordered inverse ops, so `undo()`/`redo()` restore/re-apply the whole
  batch as a unit.
- **The atomic-write persistence** (§5.7 of Unit A) already persists via temp +
  rename. A successful batch calls `persist()` once; a failed batch does not
  persist at all.

No engine/foundation gap blocks this unit. The batch/transaction API is
**project-specific** (the RAG store is host-side, per `docs/decisions.md`
ENGINE-GAP-HANDOFF). No handoff item is opened by this unit. The
`provident-editable@0.1.0` package (the rich-text converter/diff) is consumed by
Unit O, NOT this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `applyBatch` transaction method on `RagStore` | Project-specific (the RAG store is host-side) | Medium cost; the atomicity primitive the rich-text ops (Unit O) and `IPC_EDIT_BATCH` (Unit P) build on. |
| The `BatchOp`/`BatchOpResult`/`BatchResult` types | Project-specific | Low cost; the closed batch-op union (4 store primitives + 3 forward-looking rich-text ops) and the discriminated result. |
| The atomicity/rollback semantics (all-or-nothing, restore on failure) | Project-specific | Medium cost; the "real transaction, not `store.enqueue`" guarantee the gate pins. |
| The `batch` journal kind (single invertible entry) | Project-specific | Medium cost; undo/redo restores the whole batch as a unit, not N entries. |
| The single-persist behavior | Project-specific | Low cost; a successful batch persists once, a failed batch never persists. |
| The re-entrancy guarantee (no deadlock) | Project-specific (reuses the `inQueue` pattern) | Low cost; the batch follows the existing re-entrant path. |

No engine gap. The rich-text editing ops (Unit O), the `IPC_EDIT_BATCH` IPC
channel (Unit P), the retrieval indexing of inline `children` text, the
traversal disambiguation of inline vs doc-children, and paste-time sanitization
are LATER slices (the remaining RICH-TEXT-EDITING-GATE must-fix items) — NOT
this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — a batch that fails partway leaves NO partial mutation.** If op 3 of 5
  fails, the store's in-memory state (`getNode`/`listNodes`/`getEdge`/
  `listEdges`/`status`/`journal`/`undoDepth`/`redoDepth`) is IDENTICAL to the
  pre-batch state — ops 1–2 are rolled back (§5.3). The adversarial pass must
  confirm a mid-batch failure restores every record the earlier ops touched.
- **A2 — a failed batch does NOT pollute the journal.** `journal()` after a
  failed batch returns the pre-batch entries; no partial `batch` entry (and no
  per-op `content`/`structural` entry) is recorded (§5.3/§5.4). The adversarial
  pass must confirm `undoDepth()`/`redoDepth()` are unchanged by a failed batch.
- **A3 — a failed batch does NOT persist.** The on-disk file is byte-identical
  to the pre-batch file (no `persist()` on failure) (§5.5). The adversarial
  pass must confirm a failed batch leaves the on-disk state unchanged.
- **A4 — a successful batch lands as ONE journal entry and persists ONCE.** A
  batch of N ops produces exactly 1 `batch` journal entry (not N entries) and
  exactly 1 `persist()` (§5.4/§5.5). The adversarial pass must confirm
  `undoDepth()` increases by exactly 1 after a batch, and the on-disk file
  reflects the whole batch.
- **A5 — a batch op that calls a store method does NOT deadlock.** The batch is
  applied inside the queue via the re-entrant path; a batch op that internally
  calls a store method runs directly (the `inQueue` pattern) rather than
  enqueueing onto the tail (§5.6). The adversarial pass must confirm a batch
  that internally calls store methods completes (does not hang).
- **A6 — a batch on a quarantined node.** A `putEdge` referencing a quarantined
  node fails the batch (referential integrity) and rolls back (§5.8). The
  adversarial pass must confirm a quarantined endpoint is treated as
  nonexistent by the batch's referential check.
- **A7 — a batch containing a forward-looking rich-text op is a documented
  fail-state.** A batch carrying `setProps`/`setSubtree`/`setType` returns
  `{ ok: false, error, failedIndex }` in THIS unit (their application is Unit O)
  (§5.8). The adversarial pass must confirm the batch rolls back and the store
  is unchanged.

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-28, Unit N):** all findings are HOST findings,
fixed + regression-tested in the same pass:

- **F1 (MEDIUM) — a `null`/`undefined` op in the array threw a `TypeError`
  instead of returning `{ ok: false }`, leaking a partial mutation.** `applyBatch([validOp, null])` applied the first op, then threw on the second without restoring the snapshot. Fixed: the op loop is wrapped in `try/catch`; an unexpected throw restores the pre-batch snapshot and returns `{ ok: false, error: 'rag applyBatch: unexpected failure', failedIndex: -1 }` — never a partial mutation, never a throw for a domain failure.
- **F2 (LOW-MEDIUM) — `applyBatch(null)`/`applyBatch(undefined)` threw a
  `TypeError` at `ops.length`.** Fixed: `applyBatchSync` rejects a non-array `ops` with `{ ok: false, error: 'rag applyBatch: ops must be an array', failedIndex: 0 }`.
- **F3 (LOW) — the journal `batch` entry stored the RAW caller ops, so `redo()`
  diverged from the original batch (createdAt/updatedAt/ownedNodeIds not
  preserved).** Fixed: the forward ops persisted in the `batch` entry are the APPLIED records (captured from each op's result), so redo reproduces the exact applied record.
- **F4 (LOW) — the `removeNode` cascade inverse edges were not reverse-ordered
  as the spec pins.** Fixed: the cascaded-edge inverse array is reversed before pushing.
- **F5 (LOW/INFORMATIONAL) — the snapshot deep-copied the entire store on every
  batch (O(n)), even for empty batches.** Fixed: an empty batch is a valid no-op that skips the snapshot. The O(n) snapshot for non-empty batches is an accepted trade-off (documented).

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** for the rich-text editing proposal
(`docs/decisions.md` row **RICH-TEXT-EDITING-GATE**, 2026-08-28). The
consolidated verdicts:

| Review | Verdict |
| --- | --- |
| Validity | VALID-WITH-AMENDMENTS |
| Critique | UNSOUND (as written) |
| Architecture | SOUND-WITH-AMENDMENTS |
| Change-analysis | PROCEED-WITH-AMENDMENTS |

The resolved design amendment that THIS unit pins (cross-referenced to the
section that resolves it):

- **N1 — batch atomicity is a REAL TRANSACTION, not `store.enqueue`** (§5.1/
  §5.2/§5.3): a new `applyBatch` method applies a batch of edit operations
  atomically (all or nothing, with rollback on failure). `store.enqueue` only
  serializes a single fn; it does NOT roll back a partial multi-op failure. The
  batch is the transaction primitive the rich-text ops (Unit O) and
  `IPC_EDIT_BATCH` (Unit P) build on.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins "batch
  atomicity (a real transaction, not `store.enqueue`)". This unit lands the
  `applyBatch` transaction primitive on the `RagStore` interface.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. A batch is a store-level transaction; the provident graph is a
  transient render materialization re-traversed after a successful batch.
- **SINGLE-WRITER-STORE (consumed):** every mutation to the RAG store routes
  through the single-writer queue. The batch is serialized through the same
  queue (a batch is a single write unit, not N interleavable writes).
- **PROJECT-JOURNAL (consumed):** undo/redo lives in the store's journal. A
  successful batch lands as a SINGLE invertible `batch` journal entry (undo/redo
  restores the whole batch), not N entries.
- **HASH-VERIFIED-SOURCE (consumed, Unit A §5.7):** the SHA-256 hash is always
  derived from the record's serialized source at write time. A batch's
  `putNode`/`putEdge` ops recompute hashes exactly as the single-op methods do.

## 5. The exhaustive contract

### 5.1 The batch API (`applyBatch` + the `BatchOp`/`BatchOpResult`/`BatchResult` types)

The `RagStore` interface in `src/main/rag-store.ts` gains a NEW `applyBatch`
method. The batch op shape carries the four store primitives AND the three
forward-looking rich-text ops.

**The amended `RagStore` interface (pinned):**

```ts
// src/main/rag-store.ts — the amended RagStore. `applyBatch` is NEW.
export interface RagStore {
  // ... existing methods (getNode/listNodes/putNode/removeNode/getEdge/
  //     listEdges/putEdge/removeEdge/status/journal/undo/redo/undoDepth/
  //     redoDepth/enqueue) ...
  /** Apply a batch of edit operations ATOMICALLY (all or nothing). Serialized
   *  through the single-writer queue. A successful batch lands as a SINGLE
   *  `batch` journal entry and persists ONCE. On ANY op failure the WHOLE batch
   *  rolls back: the store's in-memory state is restored to the pre-batch
   *  state, the journal is not polluted, and no persist happens. Returns a
   *  discriminated result (NEVER throws for domain failures). Async. */
  applyBatch(ops: BatchOp[]): Promise<BatchResult>
}
```

**The new `BatchOp` type (pinned):**

```ts
/** A single edit operation a batch can carry. The four store primitives
 *  (putNode/removeNode/putEdge/removeEdge) are applied by THIS unit. The three
 *  rich-text ops (setProps/setSubtree/setType) are FORWARD-LOOKING (Unit O) —
 *  the batch op shape carries them so the rich-text machinery can apply a
 *  multi-op edit atomically, but their APPLICATION is Unit O; in THIS unit a
 *  batch containing one is a documented fail-state (§5.8). */
export type BatchOp =
  | { op: 'putNode'; node: RagNode }
  | { op: 'removeNode'; id: string }
  | { op: 'putEdge'; edge: RagEdge }
  | { op: 'removeEdge'; id: string }
  // Forward-looking rich-text ops (Unit O) — pinned in the TYPE now so Unit O
  // does not change the batch op shape; their application is Unit O.
  | { op: 'setProps'; nodeId: string; props: Record<string, unknown> }
  | { op: 'setSubtree'; nodeId: string; children: RagNodeChild[] }
  | { op: 'setType'; nodeId: string; type: RagNodeType }
```

**The new `BatchOpResult` type (pinned):**

```ts
/** The per-op result of a SUCCESSFUL batch — one entry per op, in order. The
 *  forward-looking rich-text ops (setProps/setSubtree/setType) never produce a
 *  result in THIS unit (a batch containing one is a fail-state). */
export type BatchOpResult =
  | { op: 'putNode'; node: RagNode }
  | { op: 'removeNode'; removed: boolean }
  | { op: 'putEdge'; edge: RagEdge }
  | { op: 'removeEdge'; removed: boolean }
```

**The new `BatchResult` type (pinned):**

```ts
/** The batch result — a DISCRIMINATED result. `applyBatch` NEVER throws for a
 *  domain failure (invalid op, malformed payload, referential failure,
 *  unsupported rich-text op, mid-batch failure); it returns `{ ok: false }`.
 *  On success, `results` has one `BatchOpResult` per op, in order. On failure,
 *  `failedIndex` is the index of the first failing op and `error` is the
 *  failure message; the store is rolled back to the pre-batch state. */
export type BatchResult =
  | { ok: true; results: BatchOpResult[] }
  | { ok: false; error: string; failedIndex: number }
```

**API rules (pinned):**

- **`applyBatch(ops)` is ASYNC** and returns `Promise<BatchResult>`.
- **`applyBatch` NEVER throws for a domain failure.** Every domain failure
  (invalid op, malformed payload, referential failure, unsupported rich-text
  op, mid-batch failure) returns `{ ok: false, error, failedIndex }`. The ONLY
  throw path is a store-level failure the batch does not catch (none are
  documented in this unit — a `persist()` failure is non-fatal, §5.5).
- **`applyBatch` is serialized through the single-writer queue** (§5.6), like
  every mutating method.
- **The batch op shape is a CLOSED union of 7 members** — the 4 store
  primitives (`putNode`/`removeNode`/`putEdge`/`removeEdge`) + the 3
  forward-looking rich-text ops (`setProps`/`setSubtree`/`setType`). An op with
  an unknown `op` kind is an invalid op (§5.8).
- **The batch op shape is FORWARD-COMPATIBLE:** the 3 rich-text ops are pinned
  in the TYPE now so Unit O does not change the batch op shape. In THIS unit a
  batch containing one is a documented fail-state (§5.8); Unit O extends the
  batch application to apply them.

### 5.2 Atomicity semantics (all or nothing)

A batch applies its ops **atomically** — all or nothing. This is the "real
transaction, not `store.enqueue`" guarantee the gate pins.

**Atomicity rules (pinned):**

- **All-or-nothing:** if EVERY op in the batch succeeds, the whole batch is
  applied. If ANY op fails, the WHOLE batch is rolled back — NO partial
  application is ever observable.
- **Ordered application:** the ops are applied in array order. A later op may
  depend on an earlier op's effect (e.g. a `putNode` creates a node, then a
  `putEdge` references it). Referential integrity is checked during application
  (a `putEdge` may reference a node created earlier in the SAME batch).
- **Serialized (single-writer):** the batch is applied inside the single-writer
  queue, so it is serialized against every other write. No other write can
  interleave between the batch's ops — the batch is a single write unit.
- **Single unit of persistence:** a successful batch persists ONCE (§5.5). A
  failed batch does not persist at all.
- **Single unit of journaling:** a successful batch lands as a SINGLE `batch`
  journal entry (§5.4). A failed batch lands NO journal entry.
- **Observable atomicity:** after a successful batch, `getNode`/`listNodes`/
  `getEdge`/`listEdges`/`status` reflect the FULL batch (all ops applied). After
  a failed batch, they reflect the PRE-BATCH state (no ops applied).

### 5.3 Rollback (restore on failure)

On failure, the store's in-memory state is restored to the pre-batch state — no
partial mutations, and the journal is not polluted with a partial batch.

**Rollback rules (pinned):**

- **On ANY op failure, the store's in-memory state is restored to the pre-batch
  state.** Every record the earlier (successful) ops touched is restored to its
  pre-batch value; every record the earlier ops created is removed; every record
  the earlier ops removed is re-inserted. After a failed batch, `getNode`/
  `listNodes`/`getEdge`/`listEdges`/`status` are IDENTICAL to the pre-batch
  state (A1).
- **The journal is NOT polluted by a failed batch.** `journal()` after a failed
  batch returns the pre-batch entries; no partial `batch` entry and no per-op
  `content`/`structural` entry is recorded. `undoDepth()`/`redoDepth()` are
  unchanged by a failed batch (A2).
- **A failed batch does NOT persist.** The on-disk file is unchanged (no
  `persist()` on failure) (A3).
- **The rollback is a restore, not a re-apply of inverses.** The batch restores
  the pre-batch in-memory state directly (a snapshot restore), so it is exact
  and does not depend on computing per-op inverses at rollback time. (The
  inverse ops are computed for the SUCCESS path's journal entry, §5.4 — not for
  rollback.)
- **Rollback is invisible to the caller except via the result.** The caller
  observes `{ ok: false, error, failedIndex }`; the store is unchanged.

### 5.4 Journal integration (a single `batch` entry)

A successful batch lands as a SINGLE journal entry — invertible, so undo/redo
restores the whole batch as a unit, not N separate entries.

**The new `batch` journal entry (pinned):**

```ts
// src/main/rag-store.ts — the amended JournalEntry union. A `batch` kind is NEW.
export type JournalEntry =
  | {
      kind: 'content'
      nodeId: string
      before: { content: string; children?: RagNodeChild[]; props?: Record<string, unknown> }
      after: { content: string; children?: RagNodeChild[]; props?: Record<string, unknown> }
      at: string
    }
  | { kind: 'structural'; op: StructuralJournalOp; at: string }
  | {
      kind: 'batch'
      /** The forward ops (redo re-applies these, in order). */
      ops: BatchOp[]
      /** The inverse ops, in REVERSE order (undo applies these, in order). */
      inverse: BatchOp[]
      at: string
    }
```

**Journal rules (pinned):**

- **A successful batch lands as EXACTLY ONE `batch` journal entry** — not N
  `content`/`structural` entries. A batch of N ops produces 1 journal entry
  (A4).
- **The `batch` entry carries the forward `ops` AND the reverse-ordered
  `inverse` ops.** `undo()` applies the `inverse` ops in order (restoring the
  pre-batch state); `redo()` applies the `ops` in order (re-applying the whole
  batch). Undo/redo restores the WHOLE batch as a unit — never individual ops.
- **The inverse ops are computed from the pre-batch state of each affected
  record** (captured before the batch applies). The inverse mapping (pinned):
  - `putNode` where the node did NOT exist before → inverse `removeNode(id)`.
  - `putNode` where the node DID exist before → inverse `putNode(before-state)`.
  - `removeNode(id)` → inverse `putNode(the removed node)` PLUS `putEdge` for
    each edge the removal cascaded (removed because its source/target referenced
    the node), reverse-ordered — mirroring the single-op `removeNodeSync` undo
    discipline so undo restores the node AND its cascaded edges.
  - `putEdge` where the edge did NOT exist before → inverse `removeEdge(id)`.
  - `putEdge` where the edge DID exist before → inverse `putEdge(before-state)`.
  - `removeEdge(id)` → inverse `putEdge(the removed edge)`.
  - The `inverse` array is in REVERSE order of the forward `ops` (so undo undoes
    the last op first — a `putEdge` referencing a node created earlier in the
    batch is undone before the node is removed).
  - **`updatedAt` restoration:** an inverse `putNode`/`putEdge` restores the
    record's EXACT pre-batch `updatedAt` (the before-state is applied verbatim,
    not refreshed) — so undo restores the record to its precise pre-batch state,
    including its timestamp.
- **A `batch` entry counts as ONE entry toward the journal cap**
  (`maxJournalLength`, default 1000 — Unit A §5.10). A batch of N ops consumes 1
  journal slot, not N.
- **A successful batch discards the redo history** (a new write resets
  `redoDepth()` to 0), exactly like any other journal-producing write.
- **`undoDepth()` increases by exactly 1 after a successful batch** (one `batch`
  entry); `redoDepth()` resets to 0 (A4).
- **The boot validator accepts a `batch` kind.** `isValidJournalEntry` accepts a
  `batch` entry whose `ops`/`inverse` arrays are each valid `BatchOp` values
  (validated by a new `isValidBatchOp` — §5.4). A `batch` entry with a
  malformed op is SKIPPED at boot (never loaded), exactly like a malformed
  `content`/`structural` entry.
- **`applyInverse`/`applyForward` handle the `batch` kind.** `applyInverse` on a
  `batch` entry applies the `inverse` ops in order via the non-journaled
  internal mutation paths; `applyForward` applies the `ops` in order. A batch
  undo/redo that cannot apply an op (e.g. an out-of-band record removal) does
  NOT advance the cursor (the existing desync discipline, Unit A §5.6).

### 5.5 Persistence (single persist)

A successful batch persists ONCE (not per-op). A failed batch does not persist
at all.

**Persistence rules (pinned):**

- **A successful batch calls `persist()` EXACTLY ONCE** — after all ops are
  applied and the single `batch` journal entry is pushed. The on-disk file
  reflects the WHOLE batch (all ops + the single `batch` entry) (A4).
- **A failed batch does NOT call `persist()`.** The on-disk file is unchanged
  (A3).
- **The batch suppresses per-op persistence.** The batch applies its ops via the
  internal sync paths WITHOUT calling `persist()` per op; the single `persist()`
  happens at the end of a successful batch.
- **A `persist()` failure is non-fatal** (the existing Unit A §5.7 discipline): a
  successful batch whose `persist()` fails does NOT crash; the in-memory store
  reflects the batch, but the on-disk state may be stale (documented, not
  surfaced as a throw). The batch still returns `{ ok: true, results }` (the
  batch itself succeeded; only the disk write failed).

### 5.6 Re-entrancy (no deadlock)

A batch op that calls a store method must not deadlock — the existing `inQueue`
re-entrancy pattern.

**Re-entrancy rules (pinned):**

- **`applyBatch` follows the same re-entrant pattern as every mutating method:**
  `if (inQueue) return applyBatchSync(ops); return enqueue(() => applyBatchSync(ops))`.
  A call made from inside the queue runs directly; a call from outside enqueues
  onto the tail.
- **The batch applies its ops via the NON-JOURNALING, NON-PERSISTING internal
  mutation helpers** (`insertNode`/`removeNodeInternal`/`insertEdge`), NOT the
  async enqueueing wrappers (and NOT the journaling `putNodeSync`/
  `removeNodeSync`/`putEdgeSync`/`removeEdgeSync` sync methods, which journal +
  persist per op — the batch defers journal + persist to a single unit at the
  end, §5.4/§5.5). This is what prevents deadlock: enqueueing onto the tail from
  inside the queue would append after the current fn's continuation and hang
  (A5).
- **A batch op that internally calls a store method runs directly** (the
  `inQueue` check), never enqueues onto the tail. The batch completes (does not
  hang).
- **The batch is a single write unit in the queue:** no other write can
  interleave between the batch's ops, and the batch's ops cannot deadlock
  against each other.

### 5.7 Happy-path states (TestWriter red set — valid paths)

1. **Empty batch:** `applyBatch([])` → `{ ok: true, results: [] }` (no-op, valid;
   no journal entry, no persist; `undoDepth()`/`redoDepth()` unchanged).
2. **Single-op batch (putNode create):** `applyBatch([{ op: 'putNode', node }])`
   → `{ ok: true, results: [{ op: 'putNode', node }] }`; `getNode(id)` returns
   the node; `listNodes()` has 1 entry; `undoDepth()` is 1; the file is written
   atomically.
3. **Multi-op batch (create node + edge):**
   `applyBatch([{ op: 'putNode', node: n1 }, { op: 'putEdge', edge: e1 }])`
   where `e1` references `n1` → `{ ok: true, results: [putNode, putEdge] }`;
   both `n1` and `e1` are present; the batch lands as ONE `batch` journal entry
   (not two); `undoDepth()` is 1.
4. **Batch with a node update:** `applyBatch([{ op: 'putNode', node: updated }])`
   where `updated.id` already exists → the node is replaced; `updatedAt` is
   refreshed; the batch lands as ONE `batch` entry (the inverse captures the
   before-state).
5. **Batch with a removeNode:** `applyBatch([{ op: 'removeNode', id: 'n1' }])`
   where `n1` exists → `{ ok: true, results: [{ op: 'removeNode', removed: true }] }`;
   `getNode('n1')` is `undefined`; the cascade removes edges referencing `n1`.
6. **Batch with a removeNode of a nonexistent id:** `applyBatch([{ op:
   'removeNode', id: 'ghost' }])` → `{ ok: true, results: [{ op: 'removeNode',
   removed: false }] }` (a no-op, consistent with the single-op `removeNode`
   semantics — does NOT fail the batch).
7. **Batch with a removeEdge of a nonexistent id:** `applyBatch([{ op:
   'removeEdge', id: 'ghost' }])` → `{ ok: true, results: [{ op: 'removeEdge',
   removed: false }] }` (a no-op, does NOT fail the batch).
8. **Batch undo/redo (whole batch as a unit):** a batch creates `n1` + edge `e1`
   → `undo()` restores the pre-batch state (both `n1` and `e1` gone) as a unit;
   `redo()` re-applies the whole batch (both back). `undoDepth()`/`redoDepth()`
   move by 1 per undo/redo (one `batch` entry).
9. **Batch undo/redo (node update):** a batch updates `n1`'s content → `undo()`
   restores the prior content; `redo()` re-applies the new content.
10. **Batch with a `children`-bearing node:** `applyBatch([{ op: 'putNode',
    node: { ...n1, children: [{ type: 'strong', content: 'bold' }] } }])` →
    the node is stored with `children` intact; the hash covers `children`
    (Unit M §5.2); the batch lands as ONE `batch` entry.
11. **Batch serialization (single-writer):** two concurrent `applyBatch` calls →
    both run, in FIFO order; the second observes the first's effect (the batch
    is a single write unit, not N interleavable writes).
12. **Batch re-entrancy (no deadlock):** a batch op that internally calls a
    store method (e.g. a `putNode` whose application reads another node) →
    completes (does not hang); the batch applies atomically.
13. **Batch round-trip (persist → boot):** a successful batch writes to path P;
    a fresh store boots from P → `status().corrupt === false`; all batch-created
    records load; the single `batch` journal entry loads (validated at boot);
    `undo()` on the fresh store restores the pre-batch state.
14. **Batch journal cap:** a store with `maxJournalLength: 3` and 3 batch
    entries + 1 more batch → the oldest batch entry is dropped (a `batch` entry
    counts as ONE entry toward the cap).

### 5.8 Fail-states (TestWriter red set — documented fail-states)

1. **Invalid op kind:** `applyBatch([{ op: 'bogus' }])` → `{ ok: false, error:
   'rag applyBatch: invalid op at index 0', failedIndex: 0 }`; the store is
   unchanged.
2. **Malformed op payload (putNode):** `applyBatch([{ op: 'putNode', node:
   malformed }])` where `malformed` has an invalid `type`/non-string `content`/
   non-array `ownedNodeIds`/etc. → `{ ok: false, error: 'rag applyBatch: <field>
   required/invalid at index 0', failedIndex: 0 }`; the store is unchanged.
3. **Malformed op payload (putEdge):** `applyBatch([{ op: 'putEdge', edge:
   malformed }])` where `malformed` has an invalid `kind`/empty `source`/empty
   `target`/etc. → `{ ok: false, error: 'rag applyBatch: <field> required/invalid
   at index 0', failedIndex: 0 }`; the store is unchanged.
4. **putEdge referencing a nonexistent node:** `applyBatch([{ op: 'putEdge',
   edge: { source: 'n1', target: 'ghost' } }])` where `ghost` does not exist →
   `{ ok: false, error: 'rag applyBatch: source/target node not found or
   quarantined at index 0', failedIndex: 0 }`; the store is unchanged.
5. **putEdge referencing a quarantined node:** `applyBatch([{ op: 'putEdge',
   edge: { source: 'n1', target: 'q1' } }])` where `q1` is quarantined →
   `{ ok: false, error: 'rag applyBatch: source/target node not found or
   quarantined at index 0', failedIndex: 0 }`; the store is unchanged (a
   quarantined endpoint is treated as nonexistent — A6).
6. **A batch that fails partway:** `applyBatch([{ op: 'putNode', node: n1 },
   { op: 'putNode', node: n2 }, { op: 'putEdge', edge: { source: 'n1', target:
   'ghost' } }])` where op 3 fails → `{ ok: false, error: 'rag applyBatch:
   source/target node not found or quarantined at index 2', failedIndex: 2 }`;
   the store is ROLLED BACK to the pre-batch state (ops 1–2 undone — `n1`/`n2`
   are NOT present); `journal()` is unchanged; `undoDepth()`/`redoDepth()` are
   unchanged; the on-disk file is unchanged (A1/A2/A3).
7. **A batch containing a forward-looking rich-text op:** `applyBatch([{ op:
   'setProps', nodeId: 'n1', props: { a: 1 } }])` (or `setSubtree`/`setType`) →
   `{ ok: false, error: 'rag applyBatch: op not supported: setProps at index 0',
   failedIndex: 0 }`; the store is unchanged (their application is Unit O — A7).
8. **A batch whose putNode writes a malformed `children` array:** `applyBatch([{
   op: 'putNode', node: { ...n1, children: [{ type: 'span', content: 'x' }] }
   }])` → `{ ok: false, error: 'rag applyBatch: children required/invalid at
   index 0', failedIndex: 0 }`; the store is unchanged (the Unit M §5.4
   validation applies inside the batch).
9. **A batch whose putEdge writes a self-referential edge:** `applyBatch([{ op:
   'putEdge', edge: { source: 'n1', target: 'n1' } }])` → `{ ok: false, error:
   'rag applyBatch: source required/invalid at index 0', failedIndex: 0 }`; the
   store is unchanged (the Unit A §5.1 self-referential rejection applies).
10. **A batch whose putNode writes a dangerous-key `props`:** `applyBatch([{ op:
    'putNode', node: { ...n1, props: { __proto__: {} } } }])` → `{ ok: false,
    error: 'rag applyBatch: props required/invalid at index 0', failedIndex: 0
    }`; the store is unchanged (the prototype-pollution guard applies).
11. **A persisted `batch` journal entry with a malformed op at boot:** a store
    file authored with a `batch` entry whose `ops`/`inverse` contains an invalid
    op (e.g. `{ op: 'bogus' }`) → the entry is SKIPPED at boot (the
    `isValidBatchOp` validator rejects it); `journal()` does not include it;
    `status().corrupt === false`.

### 5.9 Census / numeric claims

- **New method on `RagStore`:** 1 — `applyBatch(ops: BatchOp[]): Promise<BatchResult>`.
- **New types exported from `src/main/rag-store.ts`:** 3 — `BatchOp`,
  `BatchOpResult`, `BatchResult`.
- **`BatchOp` union members:** 7 — `putNode`, `removeNode`, `putEdge`,
  `removeEdge` (the 4 store primitives, applied by THIS unit) + `setProps`,
  `setSubtree`, `setType` (the 3 forward-looking rich-text ops, applied by Unit
  O — a batch containing one is a fail-state in THIS unit).
- **`BatchOpResult` union members:** 4 — `putNode`, `removeNode`, `putEdge`,
  `removeEdge` (the forward-looking rich-text ops never produce a result in THIS
  unit).
- **New journal entry kind:** 1 — `batch` (carries `ops` + reverse-ordered
  `inverse` + `at`).
- **Journal entries per successful batch:** exactly 1 (not N). A batch of N ops
  consumes 1 journal slot toward `maxJournalLength` (default 1000, Unit A
  §5.10).
- **`persist()` calls per successful batch:** exactly 1. A failed batch calls
  `persist()` 0 times.
- **`undoDepth()` change after a successful batch:** +1 (one `batch` entry);
  `redoDepth()` resets to 0 (a new write discards the redo history).
- **`undoDepth()`/`redoDepth()` change after a failed batch:** 0 (no journal
  entry, no pollution).
- **Edit-op census 6→9:** the edit-op census context (6→9) is Unit O, NOT this
  unit. This unit adds NO edit op. The current edit-op count (6: `setContent`,
  `createNode`, `deleteNode`, `splitNode`, `mergeNode`, `setEdge`) is unchanged
  by Unit N.

### 5.10 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.4 (the `RagStore` interface this
  unit amends with `applyBatch`), §5.5 (the single-writer queue + the `inQueue`
  re-entrancy pattern this unit reuses), §5.6 (the journal + the invertible-entry
  discipline the `batch` kind extends), §5.7 (the atomic-write persistence +
  the non-fatal `persist()` failure this unit's single-persist rides), §5.10
  (the census — the journal cap + the hash).
- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/
  `RagNodeChildType` types the `setSubtree` batch op carries), §5.4 (the
  `children` shape validation the batch's `putNode` applies), §5.5 (the journal
  content snapshot the `batch` entry coexists with).
- Unit D: `docs/specs/unit-d-editing.md` §5.1 (the edit ops — the census 6→9
  context is Unit O, NOT this unit), §5.1.1 (the `src/main/edit-ops.ts` module
  the rich-text ops will extend in Unit O).
- Unit O (future): the rich-text editing ops (`setProps`/`setSubtree`/`setType`)
  that consume the `applyBatch` transaction primitive — the census 6→9. The
  batch op shape carries them (forward-looking); their application is Unit O.
- Unit P (future): the `IPC_EDIT_BATCH` IPC channel that carries a batch of
  edits to the store — consumes the `applyBatch` transaction primitive.
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  pins "batch atomicity (a real transaction, not `store.enqueue`)" — this unit
  lands it).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE** (the batch is serialized through the single-writer
  queue), **PROJECT-JOURNAL** (a successful batch lands as a single invertible
  `batch` entry).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — retrieval indexing of inline `children` text, traversal
  disambiguation of inline vs doc-children, paste-time sanitization — LATER
  slices, NOT this unit).
- Host patterns: `src/main/rag-store.ts` (the `RagStore` interface, the
  `JournalEntry` union, the single-writer queue + `inQueue`, the internal sync
  methods, `persist()`, the boot validators — the amendment sites),
  `src/main/edit-ops.ts` (the edit ops — the census 6→9 context, Unit O).
