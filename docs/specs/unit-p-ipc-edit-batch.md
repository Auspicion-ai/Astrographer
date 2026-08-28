# Spec — Unit P: The `IPC_EDIT_BATCH` IPC Channel (a Batch of Edits to the RAG Store)

- **Status:** SPEC (the `IPC_EDIT_BATCH` IPC channel — the batch channel for the
  rich-text editing machinery, one of the RICH-TEXT-EDITING-GATE must-fix items
  to land). Gate reference: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE**
  (the resolved design pins `IPC_EDIT_BATCH` as the batch channel that carries a
  batch of edits to the RAG store). This unit lands the renderer→main IPC
  channel that carries a batch of `BatchOp` values to the store, applied
  atomically via the `applyBatch` transaction primitive (Unit N) and the three
  rich-text ops (Unit O). It does NOT implement the contenteditable UI (a later
  slice), the retrieval indexing of inline `children` text, the traversal
  disambiguation of inline vs doc-children, or paste-time sanitization (later
  slices).
- **Scope:** the `IPC_EDIT_BATCH` channel — the exact channel name, the request
  shape (a batch of `BatchOp` values), the response shape (the `BatchResult`),
  the error/throw behavior, the batch semantics (applied atomically via
  `applyBatch` — all or nothing, one journal entry, one persist), the preload
  bridge function (`bridge.edit.batch`), the `rag-store-changed` broadcast after
  a successful batch (so the renderer re-traverses), the MCP/UI equivalence
  binding (§8.2 BINDING — the same batch reachable via MCP tool and UI IPC), and
  the fail-states (a malformed batch, a batch that fails partway, a batch on a
  quarantined/unknown node, an invalid channel payload). This unit does NOT
  change the `RagStore` interface, the `BatchOp` union (closed at 7 members —
  Unit N §5.1), the `applyBatch` method, the traversal, or the renderer's
  re-traversal logic.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/shared/types.ts` (the `IPC_EDIT_BATCH` constant + the `EditBatchPayload`
  type), the amended `src/main/preload.ts` (the `bridge.edit.batch` method), the
  amended `src/main/main.ts` (the `ipcMain.handle(IPC_EDIT_BATCH, ...)` handler),
  the amended `src/main/edit-ops.ts` (the `handleEditBatch` shared handler + the
  `deriveBatchBroadcast` helper), and the amended `src/main/mcp-server.ts`
  (the forward-looking `edit.batch` tool wiring) from §5.6/§5.7 before any
  implementation.

---

## 1. What the proposal asks

The rich-text contenteditable machinery (the RICH-TEXT-EDITING-GATE resolved
design) needs a renderer→main IPC channel that carries a batch of edits to the
RAG store. The resolved design pins `IPC_EDIT_BATCH` as the batch channel. The
channel:

1. **Carries a batch of `BatchOp` values** (the closed 7-member union — Unit N
   §5.1) from the renderer to main.
2. **Applies the batch atomically** via the `applyBatch` transaction primitive
   (Unit N) — all or nothing, one journal entry, one persist.
3. **Consumes the three rich-text ops** (Unit O) — the batch op shape carries
   `setProps`/`setSubtree`/`setType` forward-looking; their application within a
   batch is a forward-looking extension (see §5.2).
4. **Broadcasts `rag-store-changed`** after a successful batch, so the renderer
   re-traverses (the re-traversal trigger, Unit D §5.1.9).
5. **Is MCP/UI-equivalent** (§8.2 BINDING) — the same batch reachable via an MCP
   tool and the UI IPC, both routing through the same `applyBatch` primitive.

## 2. Feasibility verdict

**Feasible — a purely additive change to the already-landed IPC surface
(`src/shared/types.ts`, `src/main/preload.ts`, `src/main/main.ts`).** The
project already has the exact machinery this needs:

- **The `applyBatch` transaction primitive** (Unit N §5.1) is the atomic
  application path. The channel is a thin renderer→main IPC that validates the
  payload and calls `ragStore.applyBatch(ops)`, exactly like the existing
  `IPC_EDIT_COMMIT` handler calls `setContent` (Unit D §5.1.10).
- **The `BatchOp`/`BatchResult` types** (Unit N §5.1) are already exported from
  `src/main/rag-store.ts` and are JSON-safe (structured-clone args — the Phase C
  seam, `src/shared/types.ts` header). The channel transports them verbatim.
- **The `rag-store-changed` broadcast** (Unit D §5.1.9) is already wired: the
  `IPC_RAG_STORE_CHANGED` constant, the `RagStoreChangedPayload` shape, the
  `backend.broadcast` mechanism, and the renderer's `onRagStoreChanged` handler
  (which calls `requestRebuild`). The batch handler reuses the same broadcast.
- **The preload bridge pattern** (`bridge.edit.commit` — Unit D §5.1.10) is the
  template for `bridge.edit.batch`. The renderer never writes to the RAG store
  directly; it sends an IPC to main, which calls the store (SINGLE-WRITER-STORE).
- **The MCP tool→op mapping pattern** (Unit D §5.1.8) is the template for the
  forward-looking `edit.batch` MCP tool.

No engine/foundation gap blocks this unit. The IPC channel is **project-specific**
(the IPC surface is host-side, per `docs/decisions.md` ENGINE-GAP-HANDOFF). No
handoff item is opened by this unit. The `provident-editable@0.1.0` package (the
rich-text converter/diff) is consumed by the contenteditable UI (a later slice),
NOT this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `IPC_EDIT_BATCH` channel + `EditBatchPayload` type | Project-specific (the IPC surface) | Low cost; the batch channel the rich-text machinery uses. |
| The `bridge.edit.batch` preload method | Project-specific | Low cost; the renderer-side invocation (MCP/UI equivalence). |
| The `ipcMain.handle(IPC_EDIT_BATCH, ...)` handler | Project-specific | Low cost; validates the payload, calls `applyBatch`, broadcasts on success. |
| The `deriveBatchBroadcast` helper | Project-specific | Low cost; derives the `rag-store-changed` payload from a successful batch. |
| The forward-looking `edit.batch` MCP tool | Project-specific (the tool→op mapping) | Low cost; the same batch reachable via MCP tool and UI IPC (§8.2 BINDING). |

No engine gap. The contenteditable UI, the retrieval indexing of inline
`children` text, the traversal disambiguation of inline vs doc-children, and
paste-time sanitization are LATER slices (the remaining RICH-TEXT-EDITING-GATE
must-fix items) — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — a malformed batch payload is a domain result, never a throw.** A
  non-object payload, a payload with a non-array `ops`, or a payload with a
  `null`/`undefined` `ops` returns `{ ok: false, error: 'edit-batch: ops must be
  an array', failedIndex: 0 }` — it does NOT throw an uncaught IPC error (§5.7).
- **A2 — a batch that fails partway rolls back and does NOT broadcast.** If
  `applyBatch` returns `{ ok: false, error, failedIndex }`, the handler returns
  it as-is; the store is rolled back to the pre-batch state; NO `rag-store-changed`
  broadcast is sent (§5.4/§5.7).
- **A3 — a batch on a quarantined/unknown node is a domain fail-state.** A
  `putEdge` referencing a quarantined/unknown node fails the batch (referential
  integrity) and rolls back; the handler returns the `applyBatch` result; NO
  broadcast (§5.7).
- **A4 — a successful batch broadcasts EXACTLY ONCE.** A successful non-empty
  batch sends exactly 1 `rag-store-changed` broadcast (not per-op); a failed
  batch sends 0 (§5.4).
- **A5 — a batch containing a forward-looking rich-text op is a documented
  fail-state.** A batch carrying `setProps`/`setSubtree`/`setType` returns
  `{ ok: false, error: 'rag applyBatch: op not supported: <op> at index N',
  failedIndex: N }` in the CURRENT code (their application within a batch is a
  forward-looking extension, deferred from Unit O §5.5) (§5.2/§5.7).
- **A6 — the broadcast payload is deterministic.** The `deriveBatchBroadcast`
  helper derives `{ kind, nodeIds, edgeIds }` deterministically from the batch's
  ops, results, and pre-batch node snapshot — the same batch always produces the
  same broadcast payload (§5.4).
- **A7 — the renderer ignores the broadcast payload content.** The renderer's
  `onRagStoreChanged` handler calls `requestRebuild()` and ignores the payload
  (the re-traversal re-derives from the `rag-snapshot` IPC). The broadcast kind
  is informational; a wrong kind must not break the re-traversal (§5.4).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

- **F1 (HIGH) — `deriveBatchBroadcast` was untested and the greens doc made an
  unbacked coverage claim.** The broadcast derivation (A4/A6) had no direct unit
  test, and the greens doc claimed it was "exercised by the main-process harness"
  (which does not exist). FIXED: moved `deriveBatchBroadcast` (and its `sameOwned`
  helper) out of `src/main/main.ts` into `src/main/edit-ops.ts` so it is
  node-testable without importing electron; added a direct regression set
  (create → structural, content-only → content, type change → structural,
  ownedNodeIds change → structural, putEdge/removeNode → structural, empty batch →
  content, determinism, short-results guard); corrected the greens doc claim.
- **F2 (LOW) — `deriveBatchBroadcast` dereferenced `result` without a guard.** A
  short/null `results` array threw a `TypeError`. FIXED: guarded `result` before
  dereferencing (`result && result.op === ...`); regression-tested (F1i).
- **F3 (LOW) — stale RED-state header/name in the test file.** The TestWriter
  red-set header and test-1 name still claimed the amendment "does not exist"
  after it went green. FIXED: updated the header and test-1 name to the green
  state.
- **F4 (LOW, note) — redundant payload validation in the main handler.** The
  `IPC_EDIT_BATCH` handler validates `Array.isArray(payload.ops)` and then
  `handleEditBatch` re-validates identically. Accepted as defense-in-depth; no
  behavior change required.

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

- **P1 — `IPC_EDIT_BATCH` is the batch channel** (§5.1): the resolved design
  pins `IPC_EDIT_BATCH` as the renderer→main IPC channel that carries a batch of
  edits to the RAG store. This unit lands it.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins `IPC_EDIT_BATCH`
  as the batch channel for the rich-text editing machinery. This unit lands the
  channel.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. The batch channel writes back to the RAG store (via `applyBatch`); the
  provident graph is a transient render materialization re-traversed after a
  successful batch.
- **SINGLE-WRITER-STORE (consumed):** every mutation to the RAG store routes
  through the single-writer queue. The batch is serialized through the same
  queue (a batch is a single write unit, not N interleavable writes — Unit N
  §5.2). The renderer never writes to the RAG store directly; it sends the
  `IPC_EDIT_BATCH` IPC to main, which calls `applyBatch`.
- **PROJECT-JOURNAL (consumed):** undo/redo lives in the store's journal. A
  successful batch lands as a SINGLE invertible `batch` journal entry (Unit N
  §5.4) — the channel does not change this.
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the same batch is reachable
  through both the MCP `edit.batch` tool and the UI `IPC_EDIT_BATCH` channel,
  both routing through the same `applyBatch` primitive. Neither writes to the RAG
  store from the renderer.

## 5. The exhaustive contract

### 5.1 The `IPC_EDIT_BATCH` channel (channel name + request/response shapes)

The renderer→main IPC channel that carries a batch of edits to the RAG store.
It follows the existing `IPC_EDIT_COMMIT` pattern (Unit D §5.1.10): the renderer
sends an IPC to main, which calls the store and broadcasts `rag-store-changed` on
success.

**The new channel constant + payload type (pinned, in `src/shared/types.ts`):**

```ts
// src/shared/types.ts — the new IPC channel constant + payload type.
/** The renderer→main `edit-batch` IPC (the batch channel for the rich-text
 *  editing machinery — RICH-TEXT-EDITING-GATE). Payload: `{ ops: BatchOp[] }`.
 *  Main calls `applyBatch` on the store (the SAME transaction primitive as the
 *  MCP `edit.batch` tool — MCP/UI equivalence, §8.2 BINDING), then broadcasts
 *  `rag-store-changed` on success. */
export const IPC_EDIT_BATCH = 'provident:edit-batch'
export interface EditBatchPayload {
  /** The batch of edit operations to apply atomically (a `BatchOp[]` — Unit N
   *  §5.1). Applied via `applyBatch` — all or nothing. */
  ops: BatchOp[]
}
```

**The response shape (pinned):** the handler returns the `BatchResult` from
`src/main/rag-store.ts` (Unit N §5.1) verbatim — a JSON-safe discriminated
result:

```ts
// src/main/rag-store.ts — the response shape (re-exported; NOT redefined here).
export type BatchResult =
  | { ok: true; results: BatchOpResult[] }
  | { ok: false; error: string; failedIndex: number }
```

**API rules (pinned):**

- **The channel name is `'provident:edit-batch'`** (the `IPC_EDIT_BATCH`
  constant). It is a renderer→main `ipcRenderer.invoke` channel (a request/reply
  channel, like `IPC_EDIT_COMMIT`), NOT a fire-and-forget `send`.
- **The request payload is `{ ops: BatchOp[] }`** — a batch of `BatchOp` values
  (the closed 7-member union — Unit N §5.1). The payload is JSON-safe
  (structured-clone args — the Phase C seam).
- **The response is the `BatchResult`** — `{ ok: true; results: BatchOpResult[]
  }` on success, `{ ok: false; error: string; failedIndex: number }` on a domain
  failure. The handler returns it verbatim (no wrapping, no mapping).
- **The handler NEVER throws for a domain failure.** A malformed payload, a
  batch that fails partway, a batch on a quarantined/unknown node, and an
  invalid channel payload all return a `{ ok: false }` result. The ONLY throw
  path is a store-level failure `applyBatch` does not catch (none are documented
  in Unit N — a `persist()` failure is non-fatal, Unit N §5.5).
- **The channel is NOT group-gated.** Like `IPC_EDIT_COMMIT`, the renderer is a
  trusted surface; the `edit` group gates the MCP agent path, not the UI IPC.
- **The channel is NOT added to the `RpcMethod` union.** The `RpcMethod` union
  declares MCP tool methods routed to the renderer; `IPC_EDIT_BATCH` is a
  renderer→main IPC channel (a separate constant, like `IPC_EDIT_COMMIT`).

### 5.2 The batch semantics (applied atomically via `applyBatch`)

The channel applies its batch via the `applyBatch` transaction primitive (Unit
N) — all or nothing, one journal entry, one persist.

**Batch semantics rules (pinned):**

- **The handler calls `ragStore.applyBatch(payload.ops)`** — the SAME
  transaction primitive the MCP `edit.batch` tool uses (MCP/UI equivalence,
  §5.5). The handler does NOT reimplement the batch application inline.
- **All-or-nothing:** if EVERY op in the batch succeeds, the whole batch is
  applied. If ANY op fails, the WHOLE batch is rolled back (Unit N §5.2/§5.3) —
  no partial application is ever observable. The handler returns the
  `applyBatch` result verbatim.
- **One journal entry:** a successful batch lands as a SINGLE `batch` journal
  entry (Unit N §5.4) — not N `content`/`structural` entries. The channel does
  not change this.
- **One persist:** a successful batch persists ONCE (Unit N §5.5); a failed batch
  does not persist. The channel does not change this.
- **Serialized (single-writer):** the batch is serialized through the
  single-writer queue (Unit N §5.2) — a single write unit, not N interleavable
  writes.
- **The three rich-text ops (Unit O) are carried forward-looking.** The `BatchOp`
  union carries `setProps`/`setSubtree`/`setType` (Unit N §5.1). In the CURRENT
  code, `applyBatch` rejects a batch containing one (Unit N §5.8 fail-state 7 —
  `'rag applyBatch: op not supported: <op> at index N'`), because Unit O chose the
  single-`putNode` path as the primary implementation and deferred the
  `applyBatch` extension (Unit O §5.5). A batch containing a rich-text op is a
  documented fail-state in THIS unit (§5.7). The rich-text ops' application
  within a batch is a FORWARD-LOOKING extension (a later slice) — the channel's
  contract is pinned now; the rich-text-in-batch application is not.

### 5.3 The preload bridge (`bridge.edit.batch`)

The renderer-side function that invokes the channel. It follows the existing
`bridge.edit.commit` pattern (Unit D §5.1.10).

**The amended `ProvidentBridge.edit` surface (pinned, in `src/main/preload.ts`):**

```ts
// src/main/preload.ts — the amended `edit` surface. `batch` is NEW.
export interface ProvidentBridge {
  // ...
  edit: {
    /** Unit D §5.1.10 — the UI commit-on-blur write-back. Sends the
     *  `edit-commit` IPC to main, which calls `setContent` on the store (the
     *  SAME edit op as the MCP tool) and broadcasts `rag-store-changed`. */
    commit(nodeId: string, content: string): Promise<EditCommitResult>
    /** Unit P §5.1 — the UI batch write-back. Sends the `edit-batch` IPC to
     *  main, which calls `applyBatch` on the store (the SAME transaction
     *  primitive as the MCP `edit.batch` tool — MCP/UI equivalence, §8.2
     *  BINDING) and broadcasts `rag-store-changed` on success. Returns the
     *  `BatchResult`. */
    batch(ops: BatchOp[]): Promise<BatchResult>
    /** Unit D §5.1.9 — subscribe to the `rag-store-changed` re-traversal
     *  trigger. Returns an unsubscribe function. */
    onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void): () => void
  }
  // ...
}
```

**The bridge implementation (pinned):**

```ts
// src/main/preload.ts — the `batch` bridge method.
batch(ops: BatchOp[]): Promise<BatchResult> {
  const payload: EditBatchPayload = { ops }
  return ipcRenderer.invoke(IPC_EDIT_BATCH, payload)
}
```

**API rules (pinned):**

- **The bridge method is `bridge.edit.batch(ops: BatchOp[]): Promise<BatchResult>`**
  — the renderer-side invocation of the `IPC_EDIT_BATCH` channel. (The task's
  `window.api.editBatch(ops)` is an illustrative example; the project convention
  is the `bridge.edit` surface, so the pinned name is `bridge.edit.batch`.)
- **The method is ASYNC** and returns `Promise<BatchResult>` (the `ipcRenderer.invoke`
  promise).
- **The method wraps the ops in the `EditBatchPayload`** (`{ ops }`) before
  invoking — the renderer never sends a raw array.
- **The renderer never writes to the RAG store directly** — it sends the IPC to
  main, which calls `applyBatch` (SINGLE-WRITER-STORE).

### 5.4 The `rag-store-changed` broadcast (after a successful batch)

After a successful batch, the main handler broadcasts the `rag-store-changed`
re-traversal trigger (Unit D §5.1.9) so the renderer re-traverses.

**The main handler (pinned, in `src/main/main.ts`):**

```ts
// src/main/main.ts — the `IPC_EDIT_BATCH` handler.
ipcMain.handle(IPC_EDIT_BATCH, async (_event, payload: EditBatchPayload) => {
  // A1 — a malformed payload is a domain result, never a throw.
  if (!payload || !Array.isArray(payload.ops)) {
    return { ok: false, error: 'edit-batch: ops must be an array', failedIndex: 0 }
  }
  // Capture the pre-batch node snapshot for the broadcast derivation (A6).
  const preBatchNodes = new Map<string, RagNode>()
  for (const op of payload.ops) {
    if (op && op.op === 'putNode' && op.node && typeof op.node.id === 'string') {
      const n = ragStore.getNode(op.node.id)
      if (n) preBatchNodes.set(op.node.id, n)
    }
  }
  const result = await handleEditBatch(ragStore, payload)
  if (result.ok) {
    // A4 — a successful batch broadcasts EXACTLY ONCE.
    const { kind, nodeIds, edgeIds } = deriveBatchBroadcast(payload.ops, result.results, preBatchNodes)
    void retrievalEngine.onStoreChanged(kind, nodeIds, edgeIds).catch((e) => {
      console.error('[provident-main] retrieval index reconcile failed:', e)
    })
    backend.broadcast(IPC_RAG_STORE_CHANGED, { kind, nodeIds, edgeIds })
  }
  return result
})
```

**The `deriveBatchBroadcast` helper (pinned):**

```ts
// src/main/edit-ops.ts — a PURE helper (exported for direct unit testing).
// Derives the `rag-store-changed` payload from a successful batch. Deterministic
// (A6): the same batch + pre-batch snapshot always produces the same payload.
export function deriveBatchBroadcast(
  ops: BatchOp[],
  results: BatchOpResult[],
  preBatchNodes: Map<string, RagNode>,
): RagStoreChangedPayload {
  const nodeIds: string[] = []
  const edgeIds: string[] = []
  let structural = false
  const pushNode = (id: string) => { if (!nodeIds.includes(id)) nodeIds.push(id) }
  const pushEdge = (id: string) => { if (!edgeIds.includes(id)) edgeIds.push(id) }
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]
    const result = results[i]
    switch (op.op) {
      case 'putNode': {
        pushNode(op.node.id)
        const pre = preBatchNodes.get(op.node.id)
        const after = result && result.op === 'putNode' ? result.node : op.node
        // A putNode is structural when it CREATES a node (no pre-batch node) or
        // changes type/ownedNodeIds; otherwise it is content.
        if (!pre || pre.type !== after.type || !sameOwned(pre.ownedNodeIds, after.ownedNodeIds)) {
          structural = true
        }
        break
      }
      case 'removeNode':
        pushNode(op.id)
        structural = true
        break
      case 'putEdge':
        pushNode(op.edge.source)
        pushNode(op.edge.target)
        if (result && result.op === 'putEdge') pushEdge(result.edge.id)
        structural = true
        break
      case 'removeEdge':
        pushEdge(op.id)
        structural = true
        break
      case 'setProps':
      case 'setSubtree':
      case 'setType':
        // Forward-looking rich-text ops — never reach a successful batch in the
        // current code (applyBatch rejects them, §5.2). If one did, treat it as
        // structural (conservative).
        structural = true
        break
    }
  }
  return { kind: structural ? 'structural' : 'content', nodeIds, edgeIds }
}
```

**Broadcast rules (pinned):**

- **A successful non-empty batch broadcasts `rag-store-changed` EXACTLY ONCE**
  (A4) — after `applyBatch` returns `{ ok: true }`. A failed batch broadcasts 0
  times (A2).
- **The broadcast payload is `{ kind, nodeIds, edgeIds }`** (the
  `RagStoreChangedPayload` shape — Unit D §5.1.9).
- **`nodeIds`** is the deduped, in-order union of: each `putNode` op's node id,
  each `removeNode` op's id, and each `putEdge` op's source+target.
- **`edgeIds`** is the deduped, in-order union of: each `putEdge` op's result
  edge id, and each `removeEdge` op's id.
- **`kind`** is `'structural'` if the batch contains any `putEdge`/`removeEdge`/
  `removeNode` op, OR any `putNode` that creates a node (no pre-batch node) or
  changes `type`/`ownedNodeIds`; else `'content'`. (A `putNode` that only changes
  `content`/`children`/`props` is `'content'`.)
- **The renderer ignores the broadcast payload content** (A7): the renderer's
  `onRagStoreChanged` handler calls `requestRebuild()` and ignores the payload
  (the re-traversal re-derives from the `rag-snapshot` IPC). The kind is
  informational; a wrong kind must not break the re-traversal.
- **The retrieval engine's `onStoreChanged` re-indexes the `nodeIds`** (it
  ignores the `kind` for index purposes — `src/main/retrieval.ts` §5.6). The
  reconcile is fire-and-forget; a rejection (e.g. the vector embedder's provider
  is down) is caught and logged, never an unhandled rejection (the same pattern
  as the `IPC_EDIT_COMMIT` handler, Unit D §5.1.10).

### 5.5 MCP/UI equivalence (§8.2 BINDING)

The batch is MCP/UI-equivalent — the same batch is reachable via MCP tool and UI
IPC, both routing through the same `applyBatch` primitive (§8.2 BINDING,
`docs/specs/astrographer-review.md` §8.2, Unit D §5.7). The MCP TOOL WIRING
(adding `edit.batch` to `mcp-server.ts`) is FORWARD-LOOKING — a later unit; this
unit pins the channel-level contract and the tool→op mapping below as the
contract that later unit implements.

**Tool → op mapping (pinned):**

| Tool | Op | Result |
| --- | --- | --- |
| `edit.batch` | `applyBatch` | `BatchResult` |

**Binding rules (pinned):**

- **Same primitive:** the MCP `edit.batch` tool and the UI `IPC_EDIT_BATCH`
  channel route through the SAME `applyBatch` transaction primitive on the store.
  The MCP `edit.batch` tool calls `applyBatch` on the store (the Unit D §5.1.8
  thin-validator pattern); the UI path sends the `IPC_EDIT_BATCH` IPC to main,
  which calls the same `applyBatch`. Neither writes to the RAG store from the
  renderer.
- **Same re-traversal:** the renderer re-traverses in response to the store
  change in BOTH cases (the `rag-store-changed` broadcast — Unit D §5.1.9). A
  successful batch broadcasts `rag-store-changed` once in both cases.
- **Equivalence test:** an MCP `edit.batch` and a UI `bridge.edit.batch` with the
  same `ops` produce the same store state and the same re-traversal.
- **The `edit.*` tools are main-handled** (Unit B §5.3); the UI path sends an
  IPC to main, which calls the same store. `applyBatch` is the single source of
  truth for both paths.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Single-op batch (putNode create):** `bridge.edit.batch([{ op: 'putNode',
   node: n1 }])` → `{ ok: true, results: [{ op: 'putNode', node: n1 }] }`;
   `getNode(n1.id)` returns the node; the batch lands as ONE `batch` journal
   entry; the store persists ONCE; the handler broadcasts `rag-store-changed`
   with `{ kind: 'structural', nodeIds: [n1.id], edgeIds: [] }` (a create is
   structural — no pre-batch node).
2. **Multi-op batch (create node + edge):** `bridge.edit.batch([{ op: 'putNode',
   node: n1 }, { op: 'putEdge', edge: e1 }])` where `e1` references `n1` →
   `{ ok: true, results: [putNode, putEdge] }`; both `n1` and `e1` are present;
   the batch lands as ONE `batch` journal entry; the handler broadcasts
   `rag-store-changed` with `{ kind: 'structural', nodeIds: [n1.id, e1.source,
   e1.target], edgeIds: [e1.id] }`.
3. **Batch with a content-only node update:** `bridge.edit.batch([{ op:
   'putNode', node: { ...n1, content: 'new' } }])` where `n1` exists and only
   `content` changes → `{ ok: true, results: [{ op: 'putNode', node: updated }]
   }`; the handler broadcasts `rag-store-changed` with `{ kind: 'content',
   nodeIds: [n1.id], edgeIds: [] }` (a content-only putNode is `'content'`).
4. **Batch with a structural node update (type change):** `bridge.edit.batch([{
   op: 'putNode', node: { ...n1, type: 'h1' } }])` where `n1` exists and `type`
   changes → `{ ok: true, results: [{ op: 'putNode', node: updated }] }`; the
   handler broadcasts `rag-store-changed` with `{ kind: 'structural', nodeIds:
   [n1.id], edgeIds: [] }` (a type change is structural).
5. **Batch with a removeNode:** `bridge.edit.batch([{ op: 'removeNode', id: 'n1'
   }])` where `n1` exists → `{ ok: true, results: [{ op: 'removeNode', removed:
   true }] }`; `getNode('n1')` is `undefined`; the handler broadcasts
   `rag-store-changed` with `{ kind: 'structural', nodeIds: ['n1'], edgeIds: []
   }`.
6. **Empty batch:** `bridge.edit.batch([])` → `{ ok: true, results: [] }` (a
   no-op, valid — Unit N §5.7 item 1); the handler broadcasts `rag-store-changed`
   with `{ kind: 'content', nodeIds: [], edgeIds: [] }` (an empty batch is a
   valid no-op; the broadcast is still sent once).
7. **Batch undo/redo (whole batch as a unit):** a batch creates `n1` + edge `e1`
   → `undo()` restores the pre-batch state (both gone) as a unit; `redo()`
   re-applies the whole batch (both back). `undoDepth()`/`redoDepth()` move by 1
   per undo/redo (one `batch` entry).
8. **MCP/UI equivalence happy:** an MCP `edit.batch` and a UI `bridge.edit.batch`
   with the same `ops` produce the same store state and the same re-traversal.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **Malformed batch payload (non-object):** `bridge.edit.batch` invoked with a
   payload that is not an object (e.g. a `null`, a string, a number) → the
   handler returns `{ ok: false, error: 'edit-batch: ops must be an array',
   failedIndex: 0 }`; the store is unchanged; NO broadcast (A1).
2. **Malformed batch payload (non-array ops):** a payload with a non-array `ops`
   (e.g. `{ ops: 'bogus' }`, `{ ops: {} }`, `{ ops: null }`, `{ ops: undefined
   }`) → the handler returns `{ ok: false, error: 'edit-batch: ops must be an
   array', failedIndex: 0 }`; the store is unchanged; NO broadcast (A1).
3. **Invalid op kind:** `bridge.edit.batch([{ op: 'bogus' }])` → `{ ok: false,
   error: 'rag applyBatch: invalid op at index 0', failedIndex: 0 }`; the store
   is unchanged; NO broadcast.
4. **Malformed op payload (putNode):** `bridge.edit.batch([{ op: 'putNode', node:
   malformed }])` where `malformed` has an invalid `type`/non-string `content`/
   non-array `ownedNodeIds`/etc. → `{ ok: false, error: 'rag applyBatch: <field>
   required/invalid at index 0', failedIndex: 0 }`; the store is unchanged; NO
   broadcast.
5. **putEdge referencing a nonexistent node:** `bridge.edit.batch([{ op:
   'putEdge', edge: { source: 'n1', target: 'ghost' } }])` where `ghost` does not
   exist → `{ ok: false, error: 'rag applyBatch: source/target node not found or
   quarantined at index 0', failedIndex: 0 }`; the store is unchanged; NO
   broadcast.
6. **putEdge referencing a quarantined node:** `bridge.edit.batch([{ op:
   'putEdge', edge: { source: 'n1', target: 'q1' } }])` where `q1` is quarantined
   → `{ ok: false, error: 'rag applyBatch: source/target node not found or
   quarantined at index 0', failedIndex: 0 }`; the store is unchanged; NO
   broadcast (A3 — a quarantined endpoint is treated as nonexistent).
7. **A batch that fails partway:** `bridge.edit.batch([{ op: 'putNode', node: n1
   }, { op: 'putNode', node: n2 }, { op: 'putEdge', edge: { source: 'n1', target:
   'ghost' } }])` where op 3 fails → `{ ok: false, error: 'rag applyBatch:
   source/target node not found or quarantined at index 2', failedIndex: 2 }`;
   the store is ROLLED BACK to the pre-batch state (ops 1–2 undone — `n1`/`n2`
   are NOT present); `journal()` is unchanged; `undoDepth()`/`redoDepth()` are
   unchanged; the on-disk file is unchanged; NO broadcast (A2).
8. **A batch containing a forward-looking rich-text op:** `bridge.edit.batch([{
   op: 'setProps', nodeId: 'n1', props: { a: 1 } }])` (or `setSubtree`/`setType`)
   → `{ ok: false, error: 'rag applyBatch: op not supported: setProps at index
   0', failedIndex: 0 }`; the store is unchanged; NO broadcast (A5 — their
   application within a batch is a forward-looking extension, deferred from Unit
   O §5.5).
9. **A batch whose putNode writes a malformed `children` array:** `bridge.edit.batch([{
   op: 'putNode', node: { ...n1, children: [{ type: 'span', content: 'x' }] } }])`
   → `{ ok: false, error: 'rag applyBatch: children required/invalid at index 0',
   failedIndex: 0 }`; the store is unchanged; NO broadcast (the Unit M §5.4
   validation applies inside the batch).
10. **A batch whose putNode writes a dangerous-key `props`:** `bridge.edit.batch([{
    op: 'putNode', node: { ...n1, props: { __proto__: {} } } }])` → `{ ok: false,
    error: 'rag applyBatch: props required/invalid at index 0', failedIndex: 0
    }`; the store is unchanged; NO broadcast (the prototype-pollution guard
    applies).

### 5.8 Census / numeric claims

- **New IPC channel constant:** 1 — `IPC_EDIT_BATCH = 'provident:edit-batch'`
  (in `src/shared/types.ts`).
- **New payload type:** 1 — `EditBatchPayload { ops: BatchOp[] }` (in
  `src/shared/types.ts`).
- **New preload bridge method:** 1 — `bridge.edit.batch(ops: BatchOp[]):
  Promise<BatchResult>` (in `src/main/preload.ts`).
- **New main IPC handler:** 1 — `ipcMain.handle(IPC_EDIT_BATCH, ...)` (in
  `src/main/main.ts`).
- **New helper:** 1 — `deriveBatchBroadcast(ops, results, preBatchNodes):
  RagStoreChangedPayload` (in `src/main/edit-ops.ts`, exported for direct unit
  testing).
- **New MCP tool (forward-looking):** 1 — `edit.batch` (the tool→op mapping in
  §5.5; the tool wiring is a later unit).
- **`rag-store-changed` broadcasts per successful non-empty batch:** exactly 1
  (A4). A failed batch broadcasts 0 times (A2). An empty batch broadcasts 1 time
  (a valid no-op).
- **Journal entries per successful batch:** exactly 1 (a `batch` entry — Unit N
  §5.4). A failed batch lands 0 journal entries.
- **`persist()` calls per successful batch:** exactly 1 (Unit N §5.5). A failed
  batch calls `persist()` 0 times.
- **`undoDepth()` change after a successful batch:** +1 (one `batch` entry);
  `redoDepth()` resets to 0. After a failed batch: 0 (no journal entry, no
  pollution).
- **`BatchOp` union members:** 7 — UNCHANGED (Unit N §5.1; this unit does not
  change the batch op shape).
- **`BatchResult` union members:** 2 — `{ ok: true; results }` / `{ ok: false;
  error; failedIndex }` — UNCHANGED (Unit N §5.1).
- **Edit-op census:** 9 — UNCHANGED (Unit O landed the census 6→9; this unit
  adds NO edit op).

### 5.9 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.4 (the `RagStore` interface the
  batch channel's `applyBatch` operates on), §5.5 (the single-writer queue the
  batch serializes through), §5.6 (the project journal — the `batch` entry the
  batch lands).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.8 (the MCP tool→op mapping pattern
  the `edit.batch` tool follows), §5.1.9 (the `rag-store-changed` re-traversal
  trigger the batch handler broadcasts), §5.1.10 (the `IPC_EDIT_COMMIT` handler
  pattern the `IPC_EDIT_BATCH` handler mirrors), §5.7 (MCP/UI equivalence).
- Unit N: `docs/specs/unit-n-batch-atomicity.md` §5.1 (the `BatchOp`/`BatchResult`
  types the channel transports), §5.2 (the atomicity semantics the batch applies),
  §5.3 (the rollback on failure), §5.4 (the single `batch` journal entry), §5.5
  (the single persist), §5.8 (the fail-states the channel surfaces — including
  fail-state 7, the forward-looking rich-text op rejection).
- Unit O: `docs/specs/unit-o-edit-ops.md` §5.1 (the three rich-text ops the batch
  op shape carries forward-looking), §5.5 (the atomicity guarantee — the
  single-`putNode` path is primary; the `applyBatch` extension is deferred), §5.6
  (the MCP/UI equivalence binding the batch channel shares).
- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/
  `RagNodeChildType` types the `setSubtree` batch op carries), §5.4 (the
  `children` shape validation the batch's `putNode` applies).
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  pins `IPC_EDIT_BATCH` as the batch channel).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE** (the batch is serialized through the single-writer
  queue; the renderer never writes directly), **PROJECT-JOURNAL** (a successful
  batch lands as a single invertible `batch` entry), **MCP-UI-EQUIVALENCE** (the
  same batch reachable via MCP tool and UI IPC).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — retrieval indexing of inline `children` text, traversal
  disambiguation of inline vs doc-children, paste-time sanitization — LATER
  slices, NOT this unit).
- Host patterns: `src/shared/types.ts` (the IPC channel constants + payload
  types — the amendment site for `IPC_EDIT_BATCH`/`EditBatchPayload`),
  `src/main/preload.ts` (the `ProvidentBridge.edit` surface — the amendment
  site for `bridge.edit.batch`), `src/main/main.ts` (the `ipcMain.handle`
  handlers — the amendment site for the `IPC_EDIT_BATCH` handler),
  `src/main/edit-ops.ts` (the `handleEditBatch` shared handler + the
  `deriveBatchBroadcast` helper the handler calls), `src/main/rag-store.ts` (the
  `applyBatch` method the channel calls, the `BatchOp`/`BatchResult` types the
  channel transports),
  `src/main/mcp-server.ts` (the `edit.*` tool wiring — the forward-looking
  `edit.batch` tool), `src/renderer/sidebar-panes.ts` (the `onRagStoreChanged`
  handler that ignores the broadcast payload and calls `requestRebuild`).
