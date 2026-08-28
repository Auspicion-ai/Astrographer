# Spec — Unit U5: The Atomic Rich-Text Write-Back Op (`setRichText`) + `IPC_EDIT_RICH_COMMIT` + Preload `edit.commitRich`

- **Status:** SPEC (the U5 unit of the editing-mode-toggle + contenteditable
  rich-text editor slice — decision **A** of `docs/specs/editing-mode-toggle-review.md`
  §4, amendment 7 (UI-IPC-only rich commit), §5 U5 row). The write-back path the
  contenteditable editor's blur (Unit U4) uses: after the host decomposes the
  blurred contenteditable HTML into `{content, children}` ONCE (Unit U2
  `decomposeRichHtml`), it commits BOTH atomically. The rich-text edit ops
  `setProps`/`setSubtree`/`setType` (Unit O) set only ONE aspect each — `setSubtree`
  writes only `children`, `setContent` writes only `content`; NEITHER sets both.
  `setRichText` is the SINGLE op that writes the pair atomically. Per decision A,
  `applyBatch` (rag-store.ts ~1072) is deliberately LEFT ALONE (it rejects the
  Unit O ops — forward-looking only, out of scope); `setRichText` is a NEW op,
  NOT an applyBatch extension.
- **Scope:** `src/main/edit-ops.ts` (the `setRichText` op + `SetRichTextResult` +
  `handleRichCommit` + `RichCommitResult` + the pure `deriveRichCommitBroadcast`
  helper), `src/shared/types.ts` (`IPC_EDIT_RICH_COMMIT` + `EditRichCommitPayload` +
  `RichCommitResult`), `src/main/main.ts` (the `IPC_EDIT_RICH_COMMIT` handler),
  `src/main/preload.ts` (the `edit.commitRich` bridge method). This unit does NOT
  implement the contenteditable UI handlers / caret / IME / `editorBlur`
  (Unit U4), the blur decomposition (Unit U2, landed), or the settings control /
  broadcast (Unit U1). It does NOT touch `applyBatch` (decision A — §1.5).
- **TestWriter contract:** every signature, return shape, state, and fail-state
  below is derivable from this spec ALONE. The `setRichText` op + `handleRichCommit` +
  `deriveRichCommitBroadcast` are fully node-testable (no Electron — they run over
  the `RagStore` interface). The `IPC_EDIT_RICH_COMMIT` handler + the preload
  `edit.commitRich` method ride the existing SidebarPanes / main IPC integration
  harness (the same harness Units D/P/U1 use).

---

## 1. Status + signatures + IPC + bridge + applyBatch non-interaction

### 1.1 What the proposal asks (U5)

When a user edits a node in `contenteditable` mode and blurs it (Unit U4), the
host decomposes the blurred root's `innerHTML` ONCE into `{content, children}`
(Unit U2 `decomposeRichHtml` — TOTAL, always emits a valid `RagNodeChild[]`,
possibly `[]`) and must write BOTH back to the RAG node ATOMICALLY. Today the
rich-text machinery can write only ONE aspect per op: `setSubtree` writes only
`children`, `setContent` writes only `content`, `setProps` writes only `props`,
`setType` changes only `type`. A blur commit that calls `setContent` then
`setSubtree` would be TWO writes (two journal entries, two broadcasts, a
non-atomic window where content is updated but children are stale). Decision A
resolves this with a NEW combined `setRichText(ctx, {nodeId, content, children})`
op that does ONE atomic `putNode` (writing content + children in a single record)
→ ONE `content` journal entry (the content snapshot already carries
`children`+`props` at rag-store.ts line 156) → ONE broadcast. The op is reached
only through a NEW `IPC_EDIT_RICH_COMMIT` channel + a preload `edit.commitRich`
bridge method. Per amendment 7 this op is **UI-IPC-only** in this slice — there
is NO MCP rich tool exposing it (MCP-UI-EQUIVALENCE is not violated; the rich
commit simply has no MCP surface yet). Per decision A `applyBatch` is untouched.

The single write-back op must also:
- be **idempotent for a no-op commit** (same `content` + same `children` → no
  write, no journal entry, no `updatedAt` refresh, no broadcast — no redundant
  re-derive on a blur that changed nothing);
- derive a broadcast that correctly reflects the change so retrieval + traversal
  re-derive. `deriveBatchBroadcast` tags the forward-looking rich-text ops
  (incl. `setSubtree`) as `structural` (conservative — edit-ops.ts ~567-574), so a
  `children` change is tagged `structural` on the same conservative principle (a
  children-bearing commit is traversal-affecting). `setRichText` tags a children
  change as `structural` AND still reflects the `content` change (the structural
  reconcile re-indexes content too). The exact kind rule is pinned in §1.2/§1.3
  (and the conservative — not correctness-mandated — basis is explained in §1.2).

### 1.2 The `setRichText` op + the broadcast helper (pinned)

**`src/main/edit-ops.ts`.** Add the op (a CONTENT op in the journaling sense —
the store's `putNodeSync` journals a `content` entry when `type`/`ownedNodeIds`
are unchanged, regardless of `children`, rag-store.ts ~888-897), a result type, a
handler, and a pure broadcast-derivation helper.

```ts
export type SetRichTextResult = { ok: true; node: RagNode } | { ok: false; error: string }

/** Unit U5 §1.2 — the SINGLE atomic rich-text write-back op. Writes BOTH
 *  `content` AND `children` for a node in ONE `putNode` (one record write, one
 *  `content` journal entry). Content-only / children-only ops (Unit O) cannot
 *  write the pair atomically — this op can. A CONTENT op → journaled as a
 *  `content` entry (the content snapshot includes `children`+`props`) → the
 *  main handler derives the broadcast via `deriveRichCommitBroadcast`. */
export async function setRichText(
  ctx: EditOpContext,
  params: { nodeId: string; content: string; children: RagNodeChild[] },
): Promise<SetRichTextResult>
```

**Validation order (pinned — a TestWriter can assert the exact error strings):**
1. `typeof params.content !== 'string'` → return `{ ok: false, error: 'edit.set_rich_text: content must be a string' }`.
2. `params.children === undefined || !isValidChildren(params.children)` → return `{ ok: false, error: 'edit.set_rich_text: children required/invalid' }`. **`children` is REQUIRED** — mirroring `setSubtree` (Unit O F2): `undefined`/absent children is a fail-state, only `[]` clears. `isValidChildren` (edit-ops.ts ~79) already validates the FULL `RagNodeChild[]` shape: a non-array → invalid; a null/non-object/array child → invalid; a dangerous key in a child → invalid; a non-string/unknown (e.g. `span`) child `type` → invalid; a non-string child `content` → invalid; a null/array/non-object child `props` → invalid; a dangerous key in child `props` → invalid.
3. `ctx.store.getNode(params.nodeId)` is `undefined` (nonexistent OR quarantined — `getNode` returns `undefined` for both) → return `{ ok: false, error: 'edit.set_rich_text: node not found' }`.

**No-op / idempotence (pinned — the critical idempotence contract):**
- Compute `contentChanged = node.content !== params.content`.
- Compute `childrenChanged = !sameChildren(node.children, params.children)` where
  `sameChildren(a, b) = deepEqual(a ?? [], b ?? [])` — i.e. stored `undefined`
  and `[]` are treated as EQUIVALENT ("no children"). This makes a blur on an
  unchanged empty/plain-text node a no-op even though `decomposeRichHtml` emits
  `children: []` for it (U2 §2.1 states 1/2).
- If `!contentChanged && !childrenChanged` → return `{ ok: true, node }` with
  **NO write, NO journal entry, NO `updatedAt` refresh, NO broadcast.** The op
  short-circuits BEFORE `putNode` (mirrors `setProps`/`setType` no-op short-circuit,
  Unit O F1/F6).

**Atomic write (pinned — the atomicity contract):**
- `const nextChildren = childrenChanged ? params.children : node.children` — when
  `children` are EQUIVALENT but `content` changed, the stored children
  representation is PRESERVED (a node with `children: undefined` stays `undefined`;
  no `undefined`→`[]` normalization noise on a content-only edit).
- `const updated = await ctx.store.putNode({ ...node, content: params.content, children: nextChildren })` — **ONE** `putNode` call carries BOTH `content` and `children`. There is NO separate content-then-children write: the two fields land in a single record through the store's serialized single-writer queue, so there is no window where content is set but children is stale. This is the atomicity guarantee (decision A). The store's `putNodeSync` journals ONE `content` entry (the content snapshot includes `content`+`children`+`props`, rag-store.ts ~894-896) and refreshes `updatedAt`.
- Return `{ ok: true, node: updated }`.

**The broadcast helper (pinned — a PURE, exported, node-testable function):**

```ts
/** Unit U5 §1.2 — derive the `rag-store-changed` payload from a successful
 *  `setRichText`. Returns null for a no-op commit (content AND children both
 *  unchanged → NO broadcast → no redundant re-derive). A `children` change is
 *  tagged `structural` (children → traversal re-derives the inline subtree —
 *  mirrors `deriveBatchBroadcast`'s conservative `structural` tag for
 *  `setSubtree`); a content-only change is `content`. A combined change is
 *  `structural` (the structural reconcile re-indexes content too — so BOTH the
 *  content change AND the structural children change are reflected). */
export function deriveRichCommitBroadcast(
  before: RagNode,
  after: RagNode,
): RagStoreChangedPayload | null
```

**Kind rule (pinned — "tag BOTH the content change AND the structural children change"):**
- `contentChanged = before.content !== after.content`.
- `childrenChanged = !sameChildren(before.children, after.children)` (`sameChildren`
  as above — `undefined` ≡ `[]`).
- If `!contentChanged && !childrenChanged` → return `null` (no-op).
- `kind = childrenChanged ? 'structural' : 'content'`.
- Return `{ kind, nodeIds: [after.id], edgeIds: [] }`.

Rationale (pinned): the `structural` tag for a `children` change is CONSERVATIVE and
consistent with `deriveBatchBroadcast`, which tags the forward-looking `setSubtree`
op `structural` (edit-ops.ts ~567-574) on the principle that a children-bearing
commit is traversal-affecting. So a rich-text commit that touched `children`
broadcasts `structural`, keeping the inline-children subtree re-deriving on the
same conservative basis as the batch path. A `content`-only change broadcasts
`content`. A combined `content`+`children` change broadcasts `structural`, which
drives the reconcile to rebuild and thereby re-index the changed `content` too — so
both dimensions are covered by the single `kind` field. Note: this is NOT a
correctness necessity for either consumer — the current `rag-store-changed` consumer
(sidebar-panes.ts `onRagStoreChanged` ~602-604) re-derives for ANY `kind`, and
retrieval's `onStoreChanged` re-indexes regardless of `kind` (retrieval.ts ~610-626)
— so a `content`-kind broadcast would NOT "skip the children traversal". The
`structural` tag for a children change is therefore a deliberate, conservative
choice (consistent with `deriveBatchBroadcast`), not a hard requirement imposed by
the consumers.

**Throw-vs-fail contract (pinned):** domain failures (non-string content, children
absent/invalid, nonexistent node) return `{ ok: false, error }` — NEVER throw. The
ONLY throw path is a store-level failure the op does not catch: `putNode` throwing
`rag putNode: <field> required/invalid` if the assembled node fails
`validateNodeShape` (unreachable in practice because `isValidChildren` mirrors the
store's children validation and `content` is type-checked, but it is the documented
throw path, consistent with `setContent`/`setSubtree`/`setProps`). A `putNode`
throw means NEITHER `content` NOR `children` is applied (the write is atomic — a
record is validated before it is stored), so the fail-closed property holds: no
partial mutation, no journal entry for the failed op.

### 1.3 The `IPC_EDIT_RICH_COMMIT` channel + handler (pinned)

**`src/shared/types.ts`.** Add the channel const + payload type + result type
(alongside `IPC_EDIT_COMMIT`/`EditCommitPayload`/`EditCommitResult`, ~368/432):

```ts
/** The renderer→main `edit-rich-commit` IPC (the atomic rich-text write-back,
 *  Unit U5 §1.3 — decision A). Payload: `{ nodeId, content, children }` — the
 *  FULL decomposed result of the contenteditable blur (Unit U2). Main calls the
 *  SAME `setRichText` edit op the renderer's `edit.commitRich` bridge wraps
 *  (one call — the host decomposes ONCE in `editorBlur`, Unit U4), then derives
 *  + broadcasts `rag-store-changed` on success. */
export const IPC_EDIT_RICH_COMMIT = 'provident:edit-rich-commit'
export interface EditRichCommitPayload {
  nodeId: string
  content: string
  children: RagNodeChild[]   // REQUIRED — a valid RagNodeChild[] (possibly [])
}
/** The `edit-rich-commit` IPC reply. Mirrors `EditCommitResult` (a deleted-node
 *  race surfaces as `reason:'deleted-node'`, not `store-error`) and additionally
 *  returns the UPDATED node on success (so the renderer/controller can observe
 *  the written state + refreshed `updatedAt`). */
export type RichCommitResult =
  | { ok: true; nodeId: string; node: RagNode }
  | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }
```

`EditRichCommitPayload.children` uses `RagNodeChild[]`, and `RichCommitResult.node`
uses `RagNode`. Both are NEW imports into `src/shared/types.ts` from
`src/main/rag-store.ts` (the file currently imports ONLY `BatchOp` from rag-store,
line 11 — `RagNodeChild` and `RagNode` are additions, not existing imports).
Note: `RagSnapshotPayload.nodes` does NOT use `RagNode` — it is an inline anonymous
node type (types.ts ~404-422), so `RagNode` cannot be claimed as "already used by
`RagSnapshotPayload`".

**`src/main/edit-ops.ts` — `handleRichCommit` (PURE, node-testable, no Electron):**

```ts
/** Unit U5 §1.3 — the shared `IPC_EDIT_RICH_COMMIT` handler. Calls the SAME
 *  `setRichText` op as the bridge (MCP/UI-equivalent by construction — though
 *  there is NO MCP rich tool yet, amendment 7) and maps the op's domain result
 *  to the `RichCommitResult` shape. `setRichText`'s documented
 *  `'edit.set_rich_text: node not found'` fail-state (a deleted-node race)
 *  surfaces as `reason:'deleted-node'` (NOT `store-error`), mirroring
 *  `handleEditCommit`. PURE — the caller (main) performs the broadcast + index
 *  reconcile on success. */
export async function handleRichCommit(
  store: RagStore,
  payload: EditRichCommitPayload,
): Promise<RichCommitResult>
```

Behavior: calls `setRichText({ store }, { nodeId, content, children })`. On
`ok` → `{ ok: true, nodeId: payload.nodeId, node: result.node }`. On
`error === 'edit.set_rich_text: node not found'` → `{ ok: false, reason:
'deleted-node', error }`. Otherwise → `{ ok: false, reason: 'store-error', error }`.

**`src/main/edit-ops.ts` — `handleRichCommitIpc` (PURE-ish, node-testable, the
derive→reconcile→broadcast-once handler body — F1 extraction) + `src/main/main.ts`
the `IPC_EDIT_RICH_COMMIT` handler (binds the Electron boundary):**

The F1 regression (post-green adversarial finding) requires the main handler's
broadcast contract (§2.1 states 24-27) to be node-testable. This repo tests
shared handlers (e.g. `handleEditBatch`), never `main.ts` directly, so the
handler body is extracted into the shared `handleRichCommitIpc(store, payload,
deps)` function (edit-ops.ts) and `main.ts` binds the Electron boundary into it.
The A1 boundary check lives INSIDE `handleRichCommitIpc`, so the
malformed/failed/no-op/real-change broadcast contract is covered by the F1
regression tests against the shared handler (matching `handleRichCommit`'s
pattern — the shared-handler extraction is the node-testable seam).

```ts
/** The Electron boundary `handleRichCommitIpc` injects (the reconcile + the
 *  broadcast). */
export interface RichCommitIpcDeps {
  reconcile: (kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]) => Promise<void>
  broadcast: (kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]) => void
}

/** Unit U5 §1.3/F1 — node-testable extraction of the IPC_EDIT_RICH_COMMIT
 *  handler's derive→reconcile→broadcast-once body. PURE-ish — no Electron;
 *  the boundary is injected as `reconcile`/`broadcast`. F2 (ADR-9): the
 *  before-derive is guarded so an exotic node-absent→recreated race that makes
 *  `before` undefined while `result.ok` NEVER throws (falls back to NO
 *  broadcast). */
export async function handleRichCommitIpc(
  store: RagStore,
  payload: EditRichCommitPayload,
  deps: RichCommitIpcDeps,
): Promise<RichCommitResult> {
  // A1 — the boundary check: a malformed payload is a domain result, never a throw.
  if (!payload || typeof payload.nodeId !== 'string' || typeof payload.content !== 'string' || !Array.isArray(payload.children)) {
    return { ok: false, reason: 'store-error', error: 'edit-rich-commit: nodeId, content, and children array required' }
  }
  const before = store.getNode(payload.nodeId)
  const result = await handleRichCommit(store, payload)
  if (result.ok) {
    // F2 (ADR-9) — the before-guard: before-undefined-while-ok NEVER throws;
    // falls back to NO broadcast.
    const broadcast = before ? deriveRichCommitBroadcast(before as RagNode, result.node) : null
    if (broadcast) {
      void deps.reconcile(broadcast.kind, broadcast.nodeIds, broadcast.edgeIds).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      deps.broadcast(broadcast.kind, broadcast.nodeIds, broadcast.edgeIds)
    }
  }
  return result
}

// src/main/main.ts
ipcMain.handle(IPC_EDIT_RICH_COMMIT, (_event, payload: EditRichCommitPayload) => {
  return handleRichCommitIpc(ragStore, payload, {
    reconcile: (kind, nodeIds, edgeIds) => retrievalEngine.onStoreChanged(kind, nodeIds, edgeIds),
    broadcast: (kind, nodeIds, edgeIds) => backend.broadcast(IPC_RAG_STORE_CHANGED, { kind, nodeIds, edgeIds }),
  })
})
```

**Handler contract (pinned):**
- The handler calls `setRichText` EXACTLY ONCE per `IPC_EDIT_RICH_COMMIT`
  invocation (the host decomposes ONCE in `editorBlur`, U4 — U5 only defines the
  commit path; there is NO decompose here).
- A malformed payload → `{ ok: false, reason: 'store-error', error:
  'edit-rich-commit: nodeId, content, and children array required' }`, broadcasts 0
  times.
- A failed op (deleted-node or store-error) → the mapped `RichCommitResult`,
  broadcasts 0 times.
- A successful no-op commit → `{ ok: true, nodeId, node }` (node unchanged),
  broadcasts 0 times (idempotent).
- A successful real change → `{ ok: true, nodeId, node }`, reconciles + broadcasts
  EXACTLY ONCE with the `deriveRichCommitBroadcast` result.
- The reconcile is fire-and-forget with a `.catch` (never an unhandled rejection —
  the same pattern as `IPC_EDIT_COMMIT` ~227-229 / `IPC_EDIT_BATCH` ~264-266).
- `before` is only used for broadcast derivation and is only consulted on `result.ok`.
  Narrowing (ADR-9): `result.ok` implies `setRichText` found the node (its
  node-not-found fail-state is `not ok`), and that read happened AFTER `before` was
  captured at handler entry — so when `result.ok`, `before` is guaranteed
  non-undefined in the normal (non-race) case and `deriveRichCommitBroadcast(before
  as RagNode, result.node)` may assume a non-undefined `before` (the `as RagNode` is
  a narrowing, not a cast over a possibly-undefined value). If the node vanished
  between entry and `handleRichCommit`, `before` is `undefined` but
  `handleRichCommit` returns `deleted-node` (not `ok`), so the broadcast branch is
  never reached. **F2 (post-green adversarial fix):** an EXOTIC node-absent→recreated
  race can still make `before` undefined while `result.ok` (the node was recreated
  between the entry capture and `setRichText`'s existence check). The handler now
  guards the derive with `before ? deriveRichCommitBroadcast(...) : null` (§5 F2), so
  this window NEVER throws a TypeError — it falls back to NO broadcast (the store
  change still landed; only the redundant re-derive trigger is skipped, conservative).

### 1.4 Preload `edit.commitRich` (pinned)

**`src/main/preload.ts`.** Extend the `edit` bridge (both the structural
`ProvidentBridge` type ~41-55 and the impl ~192-210) with the 4th method:

```ts
/** Unit U5 §1.4 — the atomic rich-text write-back. Sends the `edit-rich-commit`
 *  IPC to main, which calls the SAME `setRichText` op once and derives +
 *  broadcasts `rag-store-changed` on a real change. Returns the `RichCommitResult`. */
commitRich(nodeId: string, content: string, children: RagNodeChild[]): Promise<RichCommitResult> {
  const payload: EditRichCommitPayload = { nodeId, content, children }
  return ipcRenderer.invoke(IPC_EDIT_RICH_COMMIT, payload)
}
```

Imports added: `IPC_EDIT_RICH_COMMIT`, `EditRichCommitPayload`, `RichCommitResult`,
`RagNodeChild` (from `../shared/types.js` / `../main/rag-store.js`).

### 1.5 No `applyBatch` change (pinned — decision A)

- `setRichText` is a NEW standalone op, NOT a `BatchOp` variant. The `BatchOp`
  type (rag-store.ts ~119-128) does NOT gain a `setRichText` member.
- `applyBatch` (rag-store.ts ~1072-1075) UNCHANGED: it still returns
  `{ ok: false, error: 'rag applyBatch: op not supported: <kind> at index <index>' }`
  for the Unit O ops (`setProps`/`setSubtree`/`setType`) and for any other unknown op
  (`'rag applyBatch: invalid op at index <index>'`). The pinned strings carry the
  ` at index N` suffix (the exact code, rag-store.ts 1075/1077, is
  `` `rag applyBatch: op not supported: ${String(kind)} at index ${index}` `` and
  `` `rag applyBatch: invalid op at index ${index}` `` — for a single-op batch the
  index is `0`). It does NOT learn to apply `setRichText`.
- `applyBatchOpInternal` (rag-store.ts ~749-752, undo/redo path) UNCHANGED: it
  still returns `false` for the three Unit O ops.
- `deriveBatchBroadcast` (edit-ops.ts ~525-578) UNCHANGED: its forward-looking
  rich-text case tags `setProps`/`setSubtree`/`setType` `structural`; it has NO
  `setRichText` case (a `setRichText` never reaches a batch, so it does not need
  one).
- `setRichText` is routed ONLY through `IPC_EDIT_RICH_COMMIT` (UI-IPC-only, amendment
  7). There is NO MCP tool for it.

### 1.6 Cross-unit contract (U4 consumes — U5 is the store/op + IPC layer only)

- U4's `editorBlur` (contenteditable, decision G) decomposes the blurred root
  ONCE via U2 `decomposeRichHtml` → `{ ok: true, content, children }`, then calls
  `edit.commitRich(nodeId, content, children)` EXACTLY ONCE. U5 defines that commit
  path. U4 does NOT decompose twice and does NOT split the commit into
  `setContent`+`setSubtree`.
- The dirty-edit guard + caret (decision I) are keyed by ragId and live in U4 — NOT
  in U5. The `IPC_EDIT_RICH_COMMIT` handler does not manage a dirty guard or caret.
- The first-materialization limitation (decision I / amendment 6): the U4 blur
  reads the contenteditable root's `innerHTML` from dispatch-provided html when
  present, else the first materialization; this is U4's concern. U5 commits
  whatever `{content, children}` it is handed — it has no HTML/materialization
  knowledge.
- U4's `edit-commit` (plain-text `setContent` path, Unit L) and U4's rich
  `edit-rich-commit` (`setRichText` path) are SEPARATE channels. In `contenteditable`
  mode the textarea `blur`/caret path is disabled (amendment 4 — the
  `textarea-<ragId>` element does not exist).
- `applyEditingMode` / re-derive (Unit U3/U1) respond to the `rag-store-changed`
  broadcast U5's handler emits on a real rich commit — the inline-children subtree
  re-materializes via the structural re-derive.

---

## 2. Every state + fail-state (TestWriter red set)

### 2.1 Happy-path states (TestWriter red set — valid paths)

**The `setRichText` op (node-testable over the `RagStore` interface):**
1. **Atomic content+children set:** `setRichText({ store }, { nodeId, content:
   'hello', children: [{ type: 'strong', content: 'bold' }] })` on an existing node
   → `{ ok: true, node }` where `node.content === 'hello'` AND `node.children`
   deep-equals `[{ type: 'strong', content: 'bold' }]` (BOTH set in ONE `putNode`).
2. **One journal entry:** the successful commit lands exactly ONE `content` journal
   entry whose `after` carries `{ content: 'hello', children: [strong('bold')] }`
   (and whose `before` carries the prior `content`/`children`). `undoDepth()` +1.
   (The `content` snapshot includes `children`+`props` — decision A.)
3. **`updatedAt` refreshed:** `node.updatedAt > before.updatedAt` on a real change;
   `createdAt` preserved.
4. **Node with NO prior children (`children: undefined`):** `setRichText({ nodeId,
   content: 'x', children: [{ type: 'em', content: 'i' }] })` → `{ ok: true, node }`
   with `node.children` deep-equals `[{ type: 'em', content: 'i' }]` (a
   plain-text node becomes rich).
5. **Node with prior children OVERWRITTEN:** `setRichText({ nodeId, content: 'y',
   children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] })` on a
   node whose `children` was `[{ type: 'strong', content: 'old' }]` → `node.children`
   deep-equals the NEW array (the old children fully replaced, not merged).
6. **Empty children clears:** `setRichText({ nodeId, content: 'z', children: [] })`
   → `{ ok: true, node }` with `node.children` deep-equals `[]` (children cleared; a
   rich node becomes plain). The stored field is `[]`.
7. **Idempotent no-op (content + children unchanged):** `setRichText({ nodeId,
   content: <same>, children: <same array, deep-equal> })` → `{ ok: true, node }`
   where `node` is the UNCHANGED node — NO write, NO journal entry (`undoDepth()`
   unchanged), `updatedAt` UNCHANGED, no broadcast (the `deriveRichCommitBroadcast`
   of the before/after returns `null`). The common "blur without edits" case does
   not re-derive.
8. **Idempotent no-op on an empty/plain node (undefined ≡ []):** a node with
   `children: undefined` + a commit `{ content: <same>, children: [] }` →
   `{ ok: true, node }`, NO write/no journal/`updatedAt` unchanged (U2 emits
   `children: []` for a plain node — the no-op guard treats stored `undefined` and
   `[]` as equivalent).
9. **Content-only change preserves the stored children representation:** a node
   with `children: undefined` + `setRichText({ content: <new>, children: [] })` →
   `{ ok: true, node }` with `node.content` changed AND `node.children` still
   `undefined` (the equivalent-empty representation is NOT normalized to `[]` on a
   content-only edit).
10. **Children-only change (content identical):** `setRichText({ nodeId, content:
    <same>, children: <new array> })` → writes `children`, `node.content` unchanged,
    ONE `content` journal entry, broadcast kind `structural`.
11. **Children with optional `props`:** a child `{ type: 'img', content: '', props:
    { src: 'https://x/i.png', alt: 'pic' } }` is a valid `children` entry and is
    written back verbatim.

**`deriveRichCommitBroadcast` (pure, node-testable):**
12. **Children changed → `structural`:** `deriveRichCommitBroadcast(before,
    after)` where `after.children` differs from `before.children` → `{ kind:
    'structural', nodeIds: [nodeId], edgeIds: [] }` (children → traversal re-derive).
13. **Content-only changed → `content`:** where only `content` differs and children
    are equivalent (`undefined` vs `[]`) → `{ kind: 'content', nodeIds: [nodeId],
    edgeIds: [] }`.
14. **Both content + children changed → `structural`:** → `{ kind: 'structural',
    nodeIds: [nodeId], edgeIds: [] }` (the structural kind is the superset — the
    reconcile re-indexes the changed content too, so BOTH dimensions are tagged).
15. **No-op → null:** identical before/after (content + children, `undefined` ≡ `[]`)
    → returns `null` (no broadcast).

**`handleRichCommit` (pure, node-testable):**
16. **Success mapping:** a successful `setRichText` → `{ ok: true, nodeId,
    payload.nodeId, node }` (the updated node is returned).
17. **Deleted-node race mapping:** a node that disappears between blur and commit →
    `setRichText` returns `'edit.set_rich_text: node not found'` → `{ ok: false,
    reason: 'deleted-node', error: 'edit.set_rich_text: node not found' }` (NOT
    `store-error`).
18. **Store-error mapping:** any other domain failure (e.g. invalid children shape)
    → `{ ok: false, reason: 'store-error', error }`.

**Type-level (typecheck green):**
19. **`IPC_EDIT_RICH_COMMIT === 'provident:edit-rich-commit'`**.
20. **`EditRichCommitPayload`** has required `nodeId: string`, `content: string`,
    `children: RagNodeChild[]`.
21. **`RichCommitResult`** is the discriminated union `{ ok: true; nodeId; node }` |
    `{ ok: false; reason: 'deleted-node' | 'store-error'; error?: string }`.
22. **`SetRichTextResult`** is `{ ok: true; node: RagNode } | { ok: false; error }`.
23. **`BatchOp` UNCHANGED** — no `setRichText` variant (applyBatch non-interaction,
    §1.5). `applyBatch`/`applyBatchOpInternal`/`deriveBatchBroadcast` signatures
    unchanged.

**Main handler (`IPC_EDIT_RICH_COMMIT`):**
24. **Real change → broadcast ONCE:** a valid payload with changed content/children →
    `setRichText` runs ONCE, the handler reconciles + broadcasts
    `IPC_RAG_STORE_CHANGED` EXACTLY ONCE with the derived `{kind, nodeIds, edgeIds}`,
    and returns `{ ok: true, nodeId, node }`.
25. **No-op commit → broadcast ZERO times:** a valid payload where content AND
    children are unchanged → returns `{ ok: true, nodeId, node }` (node unchanged),
    reconcile + broadcast do NOT run (idempotent — no redundant re-derive).
26. **Kind routing:** a payload that changes only children (or children+content) →
    broadcast `kind: 'structural'`; a payload that changes only content →
    broadcast `kind: 'content'`.
27. **Reconcile failure is non-fatal:** a rejecting `retrievalEngine.onStoreChanged`
    → caught + logged (`console.error('[provident-main] retrieval index reconcile
    failed:', e)`), the broadcast still fires, never an unhandled rejection.

**Preload bridge:**
28. **`edit.commitRich(nodeId, content, children)`** invokes `IPC_EDIT_RICH_COMMIT`
    with the `EditRichCommitPayload` and resolves to the `RichCommitResult`. The
    `edit` bridge now has 4 methods (`commit`, `batch`, `commitRich`,
    `onRagStoreChanged`).

### 2.2 Fail-states (TestWriter red set — documented fail-states)

1. **Nonexistent node:** `setRichText({ nodeId: 'nope', content, children })` →
   `{ ok: false, error: 'edit.set_rich_text: node not found' }`. (Also covers a
   QUARANTINED node — `getNode` returns `undefined` for it.)
2. **Content non-string:** `setRichText({ nodeId, content: 42, children })` →
   `{ ok: false, error: 'edit.set_rich_text: content must be a string' }` (also
   `null`/`undefined`/object content).
3. **Children non-array:** `setRichText({ nodeId, content, children: 'x' })` /
   `children: {}` / `children: 42` → `{ ok: false, error: 'edit.set_rich_text:
   children required/invalid' }`.
4. **Children ABSENT / `undefined`:** `setRichText({ nodeId, content })` (no
   `children`) → `{ ok: false, error: 'edit.set_rich_text: children required/invalid'
   }` (children is REQUIRED — only `[]` clears; mirroring `setSubtree` Unit O F2).
5. **A `children` entry with an invalid type:** `children: [{ type: 'span', content:
   'x' }]` / `[{ type: 'div', content: 'x' }]` / `[{ type: 42, content: 'x' }]` /
   `[{ type: 'strong' }]` (missing content) → `{ ok: false, error:
   'edit.set_rich_text: children required/invalid' }` (`span`/`div` are NOT
   `RagNodeChildType` members; a non-string/unknown type or a missing/non-string
   content is invalid — `isValidChildren`).
6. **A `children` entry with a non-object/missing/malformed `props`:**
   `children: [{ type: 'a', content: 'x', props: 'x' }]` / `props: []` / `props: null`
   → `{ ok: false, error: 'edit.set_rich_text: children required/invalid' }`.
7. **A dangerous key in a child / child props:** `children: [{ type: 'strong',
   content: 'x', props: { ['__proto__']: {} } }]` → `{ ok: false, error:
   'edit.set_rich_text: children required/invalid' }` (the dangerous-key guard in
   `isValidChildren`/`hasDangerousKey` rejects it).
8. **No partial mutation on a domain failure:** a fail-state returns BEFORE any
   `putNode` → the node is UNCHANGED, NO journal entry, NO broadcast (fail-closed:
   a rejected commit leaves the store exactly as it was).
9. **Atomicity fail-closed (the "content set but children failed" concern):** the
   op NEVER writes `content` and `children` separately — a single `putNode` carries
   both. If `putNode` throws (the ONLY throw path, e.g. a validateNodeShape failure
   on the assembled record), the throw happens before the record is stored, so
   NEITHER `content` NOR `children` is applied and NO journal entry is created. A
   half-applied (content-without-children or vice-versa) node is impossible by
   construction.
10. **Malformed IPC payload:** `IPC_EDIT_RICH_COMMIT` with `null` / missing
    `nodeId` / missing or non-string `content` / `children` not an array →
    `{ ok: false, reason: 'store-error', error: 'edit-rich-commit: nodeId, content,
    and children array required' }`, broadcasts 0 times, never throws. (The boundary
    check does NOT deep-validate the children SHAPE — that is setRichText's
    fail-state 3-7, mapped to `store-error`.)
11. **`applyBatch` still rejects rich-text ops (non-interaction):**
    `applyBatch([{ op: 'setProps'|'setSubtree'|'setType', ... }])` →
    `{ ok: false, error: 'rag applyBatch: op not supported: <kind> at index 0' }` —
    UNCHANGED (the code appends ` at index N`, where `N` is the op's position in the
    batch — `0` for a single-op batch; exact string from rag-store.ts 1075).
    `applyBatch([{ op: 'setRichText', ... }])` (a TypeScript error, but at runtime)
    → `{ ok: false, error: 'rag applyBatch: invalid op at index 0' }` (setRichText is
    NOT a batch op; exact string from rag-store.ts 1077). No applyBatch regression.
12. **No MCP surface (amendment 7):** there is NO MCP tool exposing `setRichText` /
    the rich commit — a `list_tools`/dispatch on the rich-commit is absent. A
    regression assertion that the rich write-back is reachable ONLY via
    `IPC_EDIT_RICH_COMMIT` (UI), never an MCP tool.
13. **Throw propagation contract:** a `putNode` throw propagates out of
    `setRichText`/`handleRichCommit` to the async main handler (a rejected invoke),
    the same throw contract as `setContent`/`setSubtree`/`setProps`. It is NOT
    swallowed into a `store-error` domain result (domain results are reserved for
    the op's OWN validation failures).

---

## 3. Numeric / census claims

- **Edit-op census 9 → 10:** `setRichText` is the 10th edit op in
  `src/main/edit-ops.ts` (the 9 existing: `setContent`, `createNode`, `deleteNode`,
  `splitNode`, `mergeNode`, `setEdge`, `setProps`, `setSubtree`, `setType`). This
  unit updates the census — the RICH-TEXT-EDITING-GATE rich-write-back is now MET.
- **New edit op:** **1** — `setRichText(ctx, { nodeId, content, children })` (writes
  BOTH `content` + `children` atomically).
- **New result types:** **2** — `SetRichTextResult` (op-level),
  `RichCommitResult` (IPC-level).
- **New payload type:** **1** — `EditRichCommitPayload` (`{ nodeId; content;
  children: RagNodeChild[] }`).
- **New IPC channels:** **1** — `IPC_EDIT_RICH_COMMIT = 'provident:edit-rich-commit'`
  (renderer→main, alongside `IPC_EDIT_COMMIT`/`IPC_EDIT_BATCH`).
- **New preload bridge methods:** **1** — `edit.commitRich(nodeId, content,
  children)` (the `edit` bridge grows from 3 to 4 methods).
- **New pure helpers:** **1** — `deriveRichCommitBroadcast(before, after):
  RagStoreChangedPayload | null`.
- **New handler functions:** **1** — `handleRichCommit(store, payload)` +
  **1** `handleRichCommitIpc(store, payload, deps)` (the F1 node-testable
  extraction of the `IPC_EDIT_RICH_COMMIT` derive→reconcile→broadcast body, §5 F1)
  + **1** main `ipcMain.handle(IPC_EDIT_RICH_COMMIT, ...)` (binds the Electron
  boundary into `handleRichCommitIpc`).
- **Broadcast counts:** EXACTLY **1** `rag-store-changed` broadcast per successful
  REAL change (content and/or children changed); **0** for a failed op, a malformed
  payload, OR a successful no-op commit (idempotence — no redundant re-derive).
- **Journal entries:** exactly **1** `content` journal entry per real change;
  **0** per no-op / failed op.
- **`undoDepth()` delta:** **+1** per real change; **0** per no-op / failed op.
- **`updatedAt` delta:** refreshed **+1** per real change; **unchanged** per no-op.
- **`applyBatch` / `BatchOp` / `applyBatchOpInternal` / `deriveBatchBroadcast`
  changes:** **0** (decision A — setRichText is NOT an applyBatch extension; the
  three Unit O ops stay rejected, setRichText is not a batch op).
- **Broadcast kind rule:** children changed (alone or with content) → `'structural'`;
  content-only changed → `'content'`; neither → `null` (no broadcast).
- **Journal classification:** **content** (the store's `putNodeSync` journals a
  `content` entry for a same-type/same-ownedNodeIds node regardless of `children`,
  rag-store.ts ~888-897). NOT a `batch` entry, NOT a `node-update` entry.
- **`sameChildren` equivalence:** stored `children: undefined` ≡ `[]` (used for
  no-op detection AND `deriveRichCommitBroadcast`).

---

## 4. Cross-references + section numbers

- **Proposal review:** `docs/specs/editing-mode-toggle-review.md` §4-A + §2 (decision
  **A** — the NEW `setRichText(ctx,{nodeId,content,children})` op: ONE atomic
  `putNode` + ONE `content` journal entry + broadcast; `IPC_EDIT_RICH_COMMIT` +
  preload `edit.commitRich`; `applyBatch` untouched — still rejects the Unit O ops),
  §3 amendment 7 (**UI-IPC-only** rich commit — no MCP rich tool yet; the
  IPC-SURFACE-NOT-GROUP-GATED / MCP-UI-EQUIVALENCE pins are preserved), §3 amendment
  6 + §4-I (the first-materialization innerHTML-read limitation — U4's concern, NOT
  U5's; U5 commits whatever `{content, children}` it is handed), §5 (the U5 row:
  `src/main/edit-ops.ts`, `src/shared/types.ts`, `src/main/main.ts`,
  `src/main/preload.ts`).
  **Reconciliation note — broadcast-kind supersession:** the review's decision A
  wording pins a plain `kind:'content'` broadcast (review §4-A line 50 + §2 line 23).
  This U5 spec DELIBERATELY REFINES/supersedes that wording with the conditional
  kind rule (§1.2): a `children` change (alone or combined with `content`) →
  `'structural'` so the inline-children subtree re-derives; a content-only change →
  `'content'`; a no-op commit → `null` (no broadcast). This refinement is grounded in
  (a) the task's requirement that a rich commit that touched `children` re-derive
  the inline-children subtree (satisfied by the conservative `structural` tag — see
  the §1.2 rationale, which notes the tag is NOT correctness-mandated because both
  consumers process any kind), and (b) the existing `deriveBatchBroadcast`
  structural precedent for children-bearing ops (edit-ops.ts ~567-574). The review's
  `kind:'content'` wording is superseded to the extent it implies a content-only
  broadcast for a children-bearing commit.
- **Unit U2:** `docs/specs/unit-u2-rich-decompose.md` §1.2/§2.1 (the `decomposeRichHtml`
  output — ALWAYS `{ ok: true, content, children }` with `children` a valid
  `RagNodeChild[]`, possibly `[]`; e.g. `decomposeRichHtml('Hello world')` →
  `{ content: 'Hello world', children: [] }`), §3 (the round-trip decompose
  invariant), §5.6 (the "children flow into the NEW `setRichText` op in Unit U5").
  U5's `children`-required contract + the `undefined`≡`[]` no-op guard align with
  U2's always-`[]`-children output.
- **Unit U4:** the planned Unit U4 spec (the contenteditable handlers + `editorBlur`
  that decomposes ONCE via U2 and calls `edit.commitRich` ONCE — decision G of
  `docs/specs/editing-mode-toggle-review.md` §4-G); the dirty-edit guard + caret keyed
  by ragId + first-materialization limitation (decision I) live in U4, NOT U5. (U4
  is the last unit in the plan and its spec is not yet written — when it lands it
  must cite this U5 spec as its commit path.)
- **Unit O:** `docs/specs/unit-o-edit-ops.md` §5.1/§5.3/§5.6 (the rich-text ops
  `setProps`/`setSubtree`/`setType` that set only ONE aspect each; the `content`
  journal entry the `setRichText` content classification reuses; the edit-op census
  6→9 context — this unit does 9→10).
- **Store / node model:** `src/main/rag-store.ts` — `RagNodeChild`/`RagNodeChildType`
  (lines 45-58), `RagNode.children` (line 71), `putNodeSync` journaling (lines
  ~877-906 — a same-type/same-ownedNodeIds node journals a `content` entry whose
  snapshot carries `content`+`children`+`props`, line 156), `applyBatch` rejection of
  the Unit O ops (lines 1072-1075), `applyBatchOpInternal` (lines ~749-752),
  `validateNodeShape`/`isValidChildren` (the write-time validation the op's
  `children` must pass). The `RagStore` interface (line 209 `applyBatch`, line 186
  `putNode`) is UNCHANGED.
- **Edit ops:** `src/main/edit-ops.ts` — `EditOpContext` (line 18), `isValidChildren`
  (line 79), `deepEqual` (line 96), `sameDocIds`/`sameOwned` (the array-equality
  helpers the `sameChildren` rule mirrors), `setSubtree` (line 470, the `children`-required
  F2 contract `setRichText` mirrors), `setContent` (line 147), `deriveBatchBroadcast`
  (line 525, the `structural`-tag-for-`setSubtree` precedent the broadcast kind rule
  follows), the `SetContentResult`/`SetSubtreeResult` shape `SetRichTextResult`
  mirrors.
- **Shared types:** `src/shared/types.ts` — `IPC_EDIT_COMMIT`/`EditCommitPayload`
  (lines 368-372) + `IPC_EDIT_BATCH`/`EditBatchPayload` (lines 379-384) — the
  pattern `IPC_EDIT_RICH_COMMIT`/`EditRichCommitPayload` joins; `EditCommitResult`
  (lines 432-434) — the shape `RichCommitResult` extends (success also returns the
  node); `RagSnapshotPayload.nodes.children?` (lines 410-416, the additive snapshot
  field the structural re-derive consumes); `RagNode`/`RagNodeChild` imports from
  `src/main/rag-store.js` (line 11 `import type { BatchOp }`).
- **Main:** `src/main/main.ts` — the `IPC_EDIT_COMMIT` handler (lines ~210-233, the
  pattern the `IPC_EDIT_RICH_COMMIT` handler mirrors: boundary validation → op →
  reconcile `.catch` → `backend.broadcast`), the `IPC_EDIT_BATCH` handler
  (lines ~242-270, the broadcast-once + no-broadcast-on-failure contract), the IPC
  channel import list (line 7).
- **Preload:** `src/main/preload.ts` — the `edit` bridge type (lines ~41-55, grows
  `commitRich`) + impl (lines ~192-210), `RagStoreChangedPayload` (lines 22-26, the
  broadcast shape `deriveRichCommitBroadcast` returns), the `EditCommitResult` re-export
  (line 19) pattern `RichCommitResult` follows.
- **Decisions:** `docs/decisions.md` — RICH-TEXT-EDITING-GATE (the census 6→9 and
  rich-text machinery context), IPC-SURFACE-NOT-GROUP-GATED (the UI-IPC-only rich
  commit is consistent), MCP-UI-EQUIVALENCE (no rich MCP tool in this slice — not
  violated), RAG-AUTHORITATIVE (the store is the single source of truth the op
  writes), PROJECT-JOURNAL (the ONE content entry per commit).
- **Unit U1:** `docs/specs/unit-u1-editing-mode-setting.md` (the settings control /
  broadcast that toggles `editingMode`; U5 is orthogonal to the settings layer).

---

## 5. Adversarial must-hunt list + integration note

**Integration note:** U5 is the store/op + IPC layer only. The `setRichText` op,
`handleRichCommit`, and `deriveRichCommitBroadcast` are fully node-testable (no
Electron). The `IPC_EDIT_RICH_COMMIT` handler + preload `edit.commitRich` ride the
existing main/preload integration harness. U4 (the contenteditable handlers +
`editorBlur`) is the consumer; U5 defines the commit path but does NOT decompose,
manage a dirty guard, or restore a caret. The atomicity of the pair is by
construction (ONE `putNode` carrying both fields through the serialized store
queue) — a separate content/children write is never performed.

**Adversarial must-hunt list (the post-green adversarial reviewer MUST verify
these; the TestWriter writes the regression tests NOW from this list):**

- **ADR-1 — atomicity (content set but children failed):** verify the op NEVER
  performs two writes. A single `putNode({ ...node, content, children })` carries
  both; if `putNode` throws, the throw precedes the store, so neither field is
  applied (fail-closed). Hunt for any code path that writes `content` first then
  `children`, or that can leave a node with a new `content` and a stale `children`
  (or vice-versa). A half-applied node is a hard fail-state (§2.2 state 9).
- **ADR-2 — broadcast correctness (structural tag for a children change):**
  verify `deriveRichCommitBroadcast` tags a `children` change `structural` (the
  conservative, `deriveBatchBroadcast`-consistent choice) and a combined change →
  `structural` (the structural reconcile re-indexes content too). This is a
  CONSERVATIVE tag, NOT a correctness necessity — the `rag-store-changed` consumer
  re-derives for ANY kind and retrieval re-indexes regardless of kind (§1.2
  rationale), so a `content`-kind broadcast would NOT "skip the children traversal".
  Verify the handler routes the derived kind into BOTH `retrievalEngine.onStoreChanged`
  AND `IPC_RAG_STORE_CHANGED` (§2.1 states 12-14).
- **ADR-3 — idempotence:** verify a no-op commit (content + children deep-equal;
  `undefined` ≡ `[]`) writes nothing, journals nothing, does NOT refresh `updatedAt`,
  and broadcasts 0 times — the redundant blur must not re-derive. Hunt for any
  path that writes/journals/broadcasts on an unchanged commit (§2.1 states 7/8,
  §2.2 state 10, §3 broadcast/journal counts).
- **ADR-4 — the `undefined`-vs-`[]` children equivalence:** verify the no-op guard
  and `deriveRichCommitBroadcast` treat stored `children: undefined` and `[]` as
  equivalent, AND that a real content-only change preserves the stored
  representation (a node that was `undefined` stays `undefined`, not normalized to
  `[]`) — the round-trip U2 `children: []` output must not cause spurious writes
  on plain nodes nor needless `undefined`→`[]` churn (§2.1 states 8/9, §2.1 13).
- **ADR-5 — malformed input totality:** a non-array `children`, a `span`/`div`/junk
  child `type`, a non-string child `content`, a malformed child `props`, a
  dangerous key in a child/props, a non-string `content`, and a nonexistent node
  each return the documented domain error WITHOUT throwing and WITHOUT mutating the
  node (§2.2 states 1-7). The deeper children-SHAPE is setRichText's validation, not
  the main boundary check (§2.2 state 10).
- **ADR-6 — the `applyBatch` non-interaction:** verify `applyBatch` still rejects
  `setProps`/`setSubtree`/`setType` and does NOT learn `setRichText`; `BatchOp` has
  no `setRichText` variant; `applyBatchOpInternal` (undo/redo) unchanged. A
  regression that sneaks `setRichText` into the batch path or stops rejecting the
  Unit O ops is a defect (§1.5, §2.2 state 11).
- **ADR-7 — concurrent / re-entrant commit:** two `IPC_EDIT_RICH_COMMIT` calls
  racing serialize through the store's single-writer queue; each is a distinct
  `putNode` with its own journal entry + broadcast. Hunt for lost updates or a
  double-broadcast from a single op (a real change must broadcast EXACTLY ONCE,
  §2.1 state 24). A deleted-node race surfaces as `reason:'deleted-node'`, never
  `store-error` (§2.1 state 17).
- **ADR-8 — deleted-node / quarantined race:** `setRichText` on a node that was
  deleted or quarantined between blur and commit → `'edit.set_rich_text: node not
  found'` → `deleted-node`; the handler broadcasts 0 times. A quarantine that
  surfaces as a successful write is a defect (§2.2 state 1, §2.1 state 17).
- **ADR-9 — the `before`-undefined broadcast guard:** the handler passes a
  NON-undefined `before` by construction: `deriveRichCommitBroadcast` is only called
  on `result.ok`, and `ok` implies the node existed when `setRichText` ran (its
  node-not-found fail-state is `not ok`), so `before` (captured at handler entry,
  earlier) is guaranteed non-undefined. Verify that (a) the handler narrows `before`
  with `as RagNode` only inside the `result.ok` branch (§1.3), (b) a deleted-node race
  (node vanished at entry) returns `deleted-node` (not `ok`) and therefore NEVER
  reaches `deriveRichCommitBroadcast` with an undefined `before` (§2.1 state 17), and
  (c) the helper itself assumes a non-undefined `before` and does not guard against
  `undefined` — the guard lives in the handler, not the helper (§1.3).
- **ADR-10 — no redundant re-derive on a no-op rich blur:** the U4 blur calls
  `commitRich` even when the user made no edit (or made edits that decompose back to
  the stored values). Verify the no-op guard suppresses the `rag-store-changed`
  broadcast so the graph does not re-derive on every unchanged blur (the 
  idempotence contract, §2.1 states 7/8). A blur-with-no-change that triggers a full
  re-derive is a defect.
- **ADR-11 — reconcile failure isolation:** a rejecting
  `retrievalEngine.onStoreChanged` is caught + logged, the broadcast still fires,
  never an unhandled rejection (§2.1 state 27).

**Recording rule (RCA-3):** after the unit's green, the read-only adversarial
sub-agent runs the must-hunt list above plus any further edge cases. Every HOST
finding (this repo's `src/`) is fixed here + regression-tested, and the finding
record is appended to this §5. Every PACKAGE finding (in
`node_modules/provident-ssr/` or the upstream `../Preempt-Providence/`) is recorded
in `docs/defects.md` + `docs/HANDOFF.md`, never patched here.

**Adversarial findings record (RCA-3 — the post-green read-only adversarial pass
returned 4 HOST findings, F1-F4; each host finding fixed here + regression-tested):**

- **F1 (a-med — the main handler's broadcast contract was UNTESTED).** The two U5
  test files covered `setRichText` / `deriveRichCommitBroadcast` /
  `handleRichCommit` / the preload bridge, but NOT the main handler's
  derive→reconcile→broadcast-once logic (§2.1 states 24-27 + ADR-2/3/11). FIX: the
  handler body is extracted into the shared, node-testable `handleRichCommitIpc(store,
  payload, deps)` function (edit-ops.ts) — the repo tests shared handlers, not
  `main.ts` directly, so this is the node-testable seam (matching `handleRichCommit`'s
  pattern). `main.ts` binds the Electron boundary (`retrievalEngine.onStoreChanged` +
  `backend.broadcast`) into it as `deps.reconcile`/`deps.broadcast`; the A1 boundary
  check lives inside `handleRichCommitIpc`, so the boundary check is KEPT (§1.3).
  REGRESSION: `tests/unit-u5-rich-commit-ipc.test.ts` "handleRichCommitIpc — the
  IPC_EDIT_RICH_COMMIT broadcast contract" describe block — real content change →
  reconcile + broadcast ONCE kind `content`; children change → kind `structural`;
  no-op → 0 broadcasts; malformed → store-error + 0 broadcasts; failed (deleted-node)
  → 0 broadcasts; a REJECTING `reconcile` → broadcast still fires, no unhandled
  rejection.
- **F2 (minor — ADR-9 `before` had no runtime guard).** The `before as RagNode`
  narrowing assumed a non-undefined `before` on `result.ok`; an exotic
  node-absent→recreated race (node absent at entry → `before` undefined; recreated
  before `setRichText`'s existence check → `result.ok`) would make
  `deriveRichCommitBroadcast(undefined as RagNode, ...)` throw a TypeError out of the
  handler. FIX (spec-adherent): the derive is guarded with `before ?
  deriveRichCommitBroadcast(...) : null` in `handleRichCommitIpc` (§1.3 updated), so
  the handler never throws in that window — it falls back to NO broadcast (the store
  change still landed; only the redundant re-derive trigger is skipped, conservative).
  REGRESSION: the F2/ADR-9 test in the F1 describe block — a mock store whose first
  `getNode` (entry capture) returns undefined but whose later `getNode` returns the
  node → `handleRichCommitIpc` resolves ok with 0 broadcasts and NEVER throws.
- **F3 (minor, accepted — spurious broadcast on a concurrent no-op).** Entry-time
  `before` is a snapshot taken before the op; if a CONCURRENT commit changes the same
  node to the SAME values our payload carries, our op is internally a no-op but the
  entry-time `before` still differs from the resulting node → a spurious
  `deriveRichCommitBroadcast` broadcast fires (an extra re-derive only, NOT a
  data-integrity issue). **ACCEPTED (documented, no code change):** the extra
  re-derive is harmless (both consumers re-derive for any kind, §1.2 rationale) and
  eliminating it would require a post-op before-read that complicates the atomicity
  story for no data-integrity gain. Recorded for completeness; no regression test
  (the current behavior is the accepted contract).
- **F4 (minor, pre-existing — `deepEqual` had no recursion-depth guard).** A
  pathologically deep props/children object could throw a RangeError out of
  `deepEqual` (the no-op comparison in `setRichText` / `setSubtree` / `setProps`),
  violating the never-throw rule. FIX: `deepEqual(a, b, depth)` now caps recursion at
  depth 100 (mirroring `hasDangerousKey`); at the cap it returns FALSE (treat as
  UNEQUAL → "changed", conservative — the op proceeds with a write rather than
  mis-declaring equality on a deep structure). REGRESSION:
  `tests/unit-u5-set-rich-text.test.ts` "F4 — deepEqual recursion cap" describe block
  — `deriveRichCommitBroadcast` on directly-constructed RagNodes with depth-5000 child
  props does NOT throw (treated as changed → structural; same-reference props →
  `a===b` short-circuit → null), and `setRichText` on a depth-5000 child props does
  NOT throw (handled as the `children required/invalid` domain fail — the store's
  depth-100 dangerous-key validation rejects it before the no-op comparison).
