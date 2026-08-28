# Spec — Unit O: The Rich-Text Edit Ops (`setProps`/`setSubtree`/`setType`)

- **Status:** SPEC (the rich-text editing ops — the final RICH-TEXT-EDITING-GATE
  must-fix item that lands the edit-op census 6→9). Gate reference:
  `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design pins
  the three ops: `setProps` MERGES — preserves the `data-doc-head` marker and
  other existing props; `setSubtree` updates `children`; `setType` changes a
  node's `type`, never delete+create). This unit adds the three rich-text edit
  ops to the edit-ops layer (`src/main/edit-ops.ts`), which the resolved design
  pins as the `setProps` edit op the user chose (Option A). It is the census
  6→9 unit: the edit-op count goes from 6 (`setContent`/`createNode`/
  `deleteNode`/`splitNode`/`mergeNode`/`setEdge`) to 9 (adding `setProps`/
  `setSubtree`/`setType`). It does NOT implement the `IPC_EDIT_BATCH` IPC
  channel (Unit P), the contenteditable UI (a later slice), the retrieval
  indexing of inline `children` text, the traversal disambiguation of inline vs
  doc-children, or paste-time sanitization (later slices).
- **Scope:** the three NEW edit ops in `src/main/edit-ops.ts` — `setProps`
  (MERGE semantics), `setSubtree` (replace `children`), `setType` (change
  `type`, preserve id/content/children/props/ownedNodeIds) — their signatures,
  return shapes, throw patterns, happy-path states, fail-states, the atomicity
  guarantee (each op is a single atomic edit), the MCP/UI equivalence binding
  (§8.2 BINDING — the same op reachable via MCP tool and UI IPC), and the
  census 6→9. This unit does NOT change the `RagStore` interface, the
  `BatchOp` union (already closed at 7 members with the three rich-text ops
  forward-looking — Unit N §5.1), the traversal, or the renderer.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/main/edit-ops.ts` (the three ops + the three result types) from
  §5.7/§5.8 before any implementation.

---

## 1. What the proposal asks

The rich-text contenteditable machinery (the RICH-TEXT-EDITING-GATE resolved
design) needs three edit ops on the edit-ops layer to mutate a RAG node's
inline rich-text state without delete+create:

1. **`setProps`** — MERGES props onto a node. Only the named keys in `props`
   are updated; the node's existing props (including the `data-doc-head`
   marker) are preserved. This is the `setProps` edit op the user chose
   (Option A).
2. **`setSubtree`** — replaces a node's inline `children` (the `RagNodeChild[]`
   field added in Unit M) with a new array.
3. **`setType`** — changes a node's `type`. NEVER delete+create: the node's id,
   content, children, props, and ownedNodeIds are all preserved; only `type`
   changes.

Each op is a single atomic edit (a single store write, or a single-op
`applyBatch` from Unit N). The ops must be MCP/UI-equivalent (§8.2 BINDING —
the same op reachable via MCP tool and UI IPC). The census 6→9: the edit-op
count goes from 6 to 9.

## 2. Feasibility verdict

**Feasible — a purely additive change to the already-landed
`src/main/edit-ops.ts` (Unit D, amended by Unit M).** The edit-ops module
already has the exact machinery this needs:

- **The `EditOpContext`** (§5.1.1 of Unit D) carries the `RagStore` INTERFACE
  (Unit A §5.4 — SOURCE-SWITCHABLE). The three new ops take the same `ctx` and
  operate on the interface, never the concrete JSON store.
- **The discriminated-result discipline** (§5.1.1 of Unit D): every op returns
  `{ ok: true, ... }` on success, `{ ok: false, error }` on a domain failure,
  and NEVER throws for a domain failure. The three new ops follow the same
  pattern.
- **The `RAG_NODE_TYPES` runtime set** (§5.1.1 of Unit D) already exists in
  `src/main/edit-ops.ts` — `setType` validates `type` against it.
- **The `RagNode` interface** (Unit A §5.1, amended by Unit M §5.1) carries the
  `children?: RagNodeChild[]` field `setSubtree` replaces and the `props?`
  field `setProps` merges.
- **The store's `putNode`** (Unit A §5.4) is the single atomic write path. Each
  op reads the node, computes the new node, and writes via a single `putNode`
  (serialized through the single-writer queue — Unit A §5.5). The store's
  `validateNodeShape` (Unit A §5.1, amended by Unit M §5.4) validates the
  merged/replaced fields at write time (throw) — the ops surface the store's
  domain failures as results.
- **The `applyBatch` transaction primitive** (Unit N §5.1) is available as an
  equivalent atomic path — a single-op `applyBatch` is a valid implementation
  of any of the three ops.

No engine/foundation gap blocks this unit. The three ops are **project-specific**
(the edit-ops layer is host-side, per `docs/decisions.md` ENGINE-GAP-HANDOFF).
No handoff item is opened by this unit. The `provident-editable@0.1.0` package
(the rich-text converter/diff) is consumed by the contenteditable UI (a later
slice), NOT this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `setProps` MERGE op | Project-specific (the edit-ops layer) | Low cost; the props-merge edit op the user chose (Option A) — preserves `data-doc-head` and other existing props. |
| The `setSubtree` op (replace `children`) | Project-specific | Low cost; the inline rich-text `children` replacement op (Unit M field). |
| The `setType` op (change `type`, never delete+create) | Project-specific | Low cost; the type-change op that preserves id/content/children/props/ownedNodeIds. |
| The atomicity guarantee (each op is a single atomic edit) | Project-specific (reuses the single-writer queue / `applyBatch`) | Low cost; each op is a single store write or a single-op `applyBatch`. |
| The MCP/UI equivalence binding (§8.2) | Project-specific (the tool→op mapping + the UI IPC routing) | Low cost; the same op reachable via MCP tool and UI IPC. |
| The census 6→9 | Project-specific (the edit-op count) | Low cost; the edit-op count goes from 6 to 9. |

No engine gap. The `IPC_EDIT_BATCH` IPC channel (Unit P), the contenteditable
UI, the retrieval indexing of inline `children` text, the traversal
disambiguation of inline vs doc-children, and paste-time sanitization are LATER
slices (the remaining RICH-TEXT-EDITING-GATE must-fix items) — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — `setProps` MERGES, never replaces.** A `setProps` with `{ props: { a:
  1 } }` on a node with `props: { 'data-doc-head': true, b: 2 }` yields
  `props: { 'data-doc-head': true, b: 2, a: 1 }` — the `data-doc-head` marker
  and the unrelated `b` are preserved (§5.2). The adversarial pass must confirm
  a merge never drops an existing prop.
- **A2 — `setProps` with a dangerous-key prop is a domain fail-state.** A
  `setProps` with `{ props: { __proto__: {} } }` returns
  `{ ok: false, error: 'edit.set_props: props contains a dangerous key' }` and
  leaves the store unchanged — it does NOT throw an uncaught store error and
  does NOT pollute (§5.2/§5.8).
- **A3 — `setSubtree` replaces the WHOLE `children` array.** A `setSubtree`
  with a new array replaces the node's `children` entirely (no merge, no
  append) (§5.3). The adversarial pass must confirm the prior children are gone.
- **A4 — `setSubtree` with a malformed `children` array is a domain
  fail-state.** A `setSubtree` with a non-array, a `span` child, a non-string
  child content, or a dangerous-key child returns
  `{ ok: false, error: 'edit.set_subtree: children required/invalid' }` and
  leaves the store unchanged — it does NOT throw an uncaught store error
  (§5.3/§5.8, the Unit M §5.4 validation).
- **A5 — `setType` preserves id/content/children/props/ownedNodeIds.** A
  `setType` changing `type` from `p` to `h1` leaves the node's id, content,
  children, props, and ownedNodeIds UNCHANGED — only `type` changes (§5.4). The
  adversarial pass must confirm a type change never delete+creates (the node id
  is stable) and never drops content/children/props/ownedNodeIds.
- **A6 — `setType` with an invalid type is a domain fail-state.** A `setType`
  with `type: 'span'`/`'bogus'`/a non-string returns
  `{ ok: false, error: 'edit.set_type: invalid type' }` and leaves the store
  unchanged (§5.4/§5.8).
- **A7 — each op is a single atomic edit.** A `setProps`/`setSubtree`/`setType`
  applies as ONE atomic edit (a single `putNode` write, or a single-op
  `applyBatch`) — no partial mutation is ever observable, and the journal lands
  ONE entry (§5.5). The adversarial pass must confirm a failed op leaves the
  store unchanged and the journal unpolluted.

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-28, Unit O):** all findings are HOST findings,
fixed + regression-tested in the same pass:

- **F1 (LOW) — `setProps` empty-merge on a node with `props: undefined` was NOT
  a no-op** (it wrote `props: {}` and journaled a `content` entry). Fixed: an
  empty merge (`Object.keys(params.props).length === 0`) is a no-op regardless
  of the prior props. Regression-tested.
- **F2 (LOW) — `setSubtree` accepted `children: undefined` as valid** (clearing
  the children) instead of the §5.8 fail-state. Fixed: `setSubtree` rejects
  `undefined` explicitly (only `[]` clears children). Regression-tested.
- **F3 (LOW) — test-coverage gaps** for the adversarial edge cases (empty-merge
  on undefined-props, `children: undefined`, `props: undefined`, ops on a
  quarantined node). Fixed: added regression tests for each.
- **F4 (LOW) — unbounded recursion in `hasDangerousKey` on deeply-nested
  props/children (a `RangeError` DoS).** Fixed: `hasDangerousKey` is depth-bounded
  (returns `true` — reject — at depth > 100), so a deep object cannot overflow
  the call stack.
- **F5 (LOW, OBSERVATION) — read-modify-write lost-update race across concurrent
  ops** (two concurrent `setProps` on the same node can clobber each other). This
  is a PRE-EXISTING pattern shared with the six existing ops (the ops read via
  `getNode` outside the queue, then write via `putNode`); it is NOT a Unit O
  regression. Documented as an accepted limitation — the §5.5 atomicity guarantee
  covers "no partial mutation observable / one journal entry", not cross-op
  lost-update prevention.
- **F6 (LOW) — a `setProps` that changes no key (an empty merge, or a merge whose
  result deep-equals the existing props) and a same-type `setType` were NOT
  no-ops** (they wrote and journaled). Fixed: both are no-ops — no write, no
  journal entry (a `setProps` with `Object.keys(params.props).length === 0` or a
  deep-equal merge, and a `setType` with `type === node.type`, return the node
  unchanged). Regression-tested (§5.7 items 3 and 8).

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

The resolved design amendments that THIS unit pins (each cross-referenced to the
section that resolves it):

- **O1 — `setProps` MERGES (preserves the `data-doc-head` marker)** (§5.2): the
  `setProps` edit op the user chose (Option A). Only the named keys in `props`
  are updated; the node's existing props (including `data-doc-head`) are
  preserved.
- **O2 — `setSubtree` updates `children`** (§5.3): a new op that replaces a
  node's inline `children` (the Unit M field).
- **O3 — `setType` changes `type`, never delete+create** (§5.4): a new op that
  changes a node's `type` while preserving id/content/children/props/
  ownedNodeIds.
- **O4 — the edit-op census 6→9** (§5.9): the edit-op count goes from 6 to 9.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins the three
  rich-text edit ops — `setProps` MERGES (preserves the `data-doc-head`
  marker), `setSubtree` (updates `children`), `setType` (type changes, never
  delete+create). This unit lands them on the edit-ops layer.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. Each op writes back to the RAG store (via `putNode`); the provident
  graph is a transient render materialization re-traversed after a successful
  edit.
- **SINGLE-WRITER-STORE (consumed):** every mutation to the RAG store routes
  through the single-writer queue. Each op is a single atomic edit (a single
  `putNode` write, or a single-op `applyBatch`), serialized through the queue.
- **PROJECT-JOURNAL (consumed):** undo/redo lives in the store's journal. A
  `setProps`/`setSubtree` (content changes) lands as a `content` entry; a
  `setType` (type change) lands as a `structural` `node-update` entry. Each op
  lands ONE journal entry.
- **HASH-VERIFIED-SOURCE (consumed, Unit A §5.7):** the SHA-256 hash is always
  derived from the record's serialized source at write time. Each op's `putNode`
  recomputes the hash (covering `children`/`props`/`type` — Unit M §5.2).
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the same edit operations are
  reachable through both the MCP `edit` group and the UI, both routing through
  the single-writer store. The three ops are the single source of truth for both
  paths.

## 5. The exhaustive contract

### 5.1 The three rich-text edit ops (module + result types + signatures)

The edit-ops module `src/main/edit-ops.ts` (Unit D §5.1.1) gains THREE new edit
ops. They operate on the same `EditOpContext` (the `RagStore` INTERFACE — Unit A
§5.4, SOURCE-SWITCHABLE) and follow the same discriminated-result discipline as
the existing six ops.

**The new result types (pinned):**

```ts
// src/main/edit-ops.ts — the three NEW result types (JSON-serializable; the MCP
// tools return these). Each is a discriminated result: `{ ok: true, node }` on
// success, `{ ok: false, error }` on a domain failure.
export type SetPropsResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type SetSubtreeResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type SetTypeResult = { ok: true; node: RagNode } | { ok: false; error: string }
```

**The three new edit ops (pinned):**

```ts
/** Set a RAG node's props by MERGE — only the named keys in `props` are
 *  updated; the node's existing props (including the `data-doc-head` marker)
 *  are preserved. A CONTENT op → journaled as a `content` entry (the content
 *  snapshot includes `props` — Unit A §5.6) → re-traversal. */
export async function setProps(ctx: EditOpContext, params: { nodeId: string; props: Record<string, unknown> }): Promise<SetPropsResult>

/** Replace a RAG node's inline `children` (the `RagNodeChild[]` field added in
 *  Unit M) with a new array. A CONTENT op → journaled as a `content` entry (the
 *  content snapshot includes `children` — Unit M §5.5) → re-traversal. */
export async function setSubtree(ctx: EditOpContext, params: { nodeId: string; children: RagNodeChild[] }): Promise<SetSubtreeResult>

/** Change a RAG node's `type`. NEVER delete+create: the node's id, content,
 *  children, props, and ownedNodeIds are all preserved; only `type` changes. A
 *  STRUCTURAL op → journaled as a `node-update` entry (the type change — Unit A
 *  §5.6) → re-traversal. */
export async function setType(ctx: EditOpContext, params: { nodeId: string; type: RagNodeType }): Promise<SetTypeResult>
```

**API rules (pinned):**

- **All three ops are ASYNC** and return `Promise<SetPropsResult>` /
  `Promise<SetSubtreeResult>` / `Promise<SetTypeResult>`.
- **All three ops NEVER throw for a domain failure.** Every domain failure
  (nonexistent node, non-object props, dangerous-key props, malformed children,
  invalid type) returns `{ ok: false, error }`. The ONLY throw path is a
  store-level failure the op does not catch (e.g. a malformed record reaching
  `putNode`), which propagates to the caller (the MCP handler surfaces it) —
  the same discipline as the existing six ops (Unit D §5.1.1).
- **All three ops return the updated node** on success: `{ ok: true, node:
  <updated node> }`.
- **All three ops are single atomic edits** (§5.5): each reads the node,
  computes the new node, and writes via a single `putNode` (serialized through
  the single-writer queue), OR applies a single-op `applyBatch` (Unit N). No
  partial mutation is ever observable.
- **All three ops operate on the `RagStore` INTERFACE** (Unit A §5.4), never the
  concrete JSON store — SOURCE-SWITCHABLE.

### 5.2 `setProps` — full behavior (MERGE semantics)

- **Content op** → journaled as a `content` entry (the content snapshot
  includes `props` — Unit A §5.6). The renderer's response to the store change
  is a re-traversal.
- **Validation:** `props` is a non-null, non-array object. A non-object `props`
  (a string, a number, a boolean, `null`, an array) →
  `{ ok: false, error: 'edit.set_props: props must be an object' }`.
- **Dangerous-key check:** `props` contains a prototype-pollution key
  (`__proto__`/`constructor`/`prototype`) anywhere →
  `{ ok: false, error: 'edit.set_props: props contains a dangerous key' }` (the
  op mirrors the store's prototype-pollution guard — Unit A §5.1/Unit M §5.4 —
  so a dangerous-key prop returns a domain result instead of an uncaught store
  throw).
- **Existence check:** reads the node via `store.getNode(nodeId)`. If undefined
  (or quarantined — not in `status().loadedNodes`), returns
  `{ ok: false, error: 'edit.set_props: node not found' }`.
- **MERGE:** the new node's `props` = `{ ...existing.props, ...params.props }`.
  Only the named keys in `params.props` are updated; the node's existing props
  (including the `data-doc-head` marker) are preserved. If the node had no
  `props` (undefined), the new `props` is exactly `params.props`.
- **Write:** updates the node's `props` and refreshes `updatedAt` (preserving
  `createdAt` — Unit A §5.1), via `store.putNode`. The store's
  `validateNodeShape` re-validates the merged `props` at write time (throw); a
  store-level failure propagates (the ONLY throw path).
- **Return:** `{ ok: true, node: <updated node> }`.

### 5.3 `setSubtree` — full behavior (replace `children`)

- **Content op** → journaled as a `content` entry (the content snapshot includes
  `children` — Unit M §5.5). The renderer's response to the store change is a
  re-traversal.
- **Validation:** `children` is a valid `RagNodeChild[]` (the Unit M §5.4
  shape). A malformed `children` (a non-array, a non-object child, a `span`/
  unknown/non-string child `type`, a missing/non-string child `content`, a
  null/array/non-object child `props`, a dangerous key in a child's `props` or
  on the child itself) →
  `{ ok: false, error: 'edit.set_subtree: children required/invalid' }`.
- **Existence check:** reads the node via `store.getNode(nodeId)`. If undefined
  (or quarantined), returns
  `{ ok: false, error: 'edit.set_subtree: node not found' }`.
- **Replace:** the new node's `children` = `params.children` (the WHOLE array is
  replaced — no merge, no append). An empty array (`[]`) is valid (equivalent
  to no inline children). A node whose `children` was previously set is
  replaced entirely.
- **Write:** updates the node's `children` and refreshes `updatedAt` (preserving
  `createdAt`), via `store.putNode`. The store's `validateNodeShape` re-validates
  the `children` at write time (throw); a store-level failure propagates (the
  ONLY throw path).
- **Return:** `{ ok: true, node: <updated node> }`.

### 5.4 `setType` — full behavior (change `type`, never delete+create)

- **Structural op** → journaled as a `node-update` entry (the type change —
  Unit A §5.6). The renderer's response to the store change is a re-traversal.
- **Validation:** `type` is a valid `RagNodeType` (the closed union — Unit A
  §5.1, validated against the `RAG_NODE_TYPES` runtime set in
  `src/main/edit-ops.ts`). An invalid `type` (a `span`, an unknown type, a
  non-string) →
  `{ ok: false, error: 'edit.set_type: invalid type' }`.
- **Existence check:** reads the node via `store.getNode(nodeId)`. If undefined
  (or quarantined), returns
  `{ ok: false, error: 'edit.set_type: node not found' }`.
- **Type change (never delete+create):** the new node's `type` = `params.type`;
  the node's id, content, children, props, and ownedNodeIds are ALL preserved
  UNCHANGED. The node id is STABLE (no delete+create — the node is not removed
  and re-added; it is updated in place).
- **Write:** updates the node's `type` and refreshes `updatedAt` (preserving
  `createdAt`), via `store.putNode`. The store's `validateNodeShape` re-validates
  the `type` at write time (throw); a store-level failure propagates (the ONLY
  throw path).
- **Return:** `{ ok: true, node: <updated node> }`.

### 5.5 Atomicity (each op is a single atomic edit)

Each of the three ops is a SINGLE atomic edit — all or nothing, no partial
mutation is ever observable.

**Atomicity rules (pinned):**

- **Each op is a single store write OR a single-op `applyBatch`.** The PRIMARY
  implementation is a single `putNode` write (serialized through the
  single-writer queue — Unit A §5.5). An equivalent implementation is a
  single-op `applyBatch([{ op: 'setProps'|'setSubtree'|'setType', ... }])`
  (Unit N §5.1) — the `BatchOp` union already carries the three rich-text ops
  forward-looking, but their APPLICATION is this unit (Unit N §5.8 fail-state 7
  rejects them), so the `applyBatch` path requires this unit to extend
  `applyBatch`'s application of the rich-text ops. The single-`putNode` path is
  the simplest and is the primary implementation.
- **No partial mutation is ever observable.** A failed op (nonexistent node,
  non-object props, dangerous-key props, malformed children, invalid type)
  leaves the store UNCHANGED — the op validates BEFORE mutating, so no write
  happens on a domain failure.
- **One journal entry per op.** A successful `setProps`/`setSubtree` lands ONE
  `content` journal entry; a successful `setType` lands ONE `structural`
  `node-update` journal entry. (A single-op `applyBatch` implementation lands
  ONE `batch` journal entry instead — Unit N §5.4.) A failed op lands NO journal
  entry.
- **Serialized (single-writer).** Each op's write is serialized through the
  single-writer queue, so it is atomic against every other write.
- **Observable atomicity.** After a successful op, `getNode(nodeId)` reflects the
  FULL change (merged props / replaced children / new type). After a failed op,
  `getNode(nodeId)` reflects the PRE-op state.

### 5.6 MCP/UI equivalence (§8.2 BINDING)

The three ops are MCP/UI-equivalent — the same op is reachable via MCP tool and
UI IPC, both routing through the single-writer store (§8.2 BINDING,
`docs/specs/astrographer-review.md` §8.2, Unit D §5.7). The MCP TOOL WIRING
(adding `edit.set_props`/`edit.set_subtree`/`edit.set_type` to `mcp-server.ts`)
is FORWARD-LOOKING — a later unit; this unit pins the op-level contract and the
tool→op mapping below as the contract that later unit implements.

**Tool → op mapping (pinned):**

| Tool | Op | Result |
| --- | --- | --- |
| `edit.set_props` | `setProps` | `SetPropsResult` |
| `edit.set_subtree` | `setSubtree` | `SetSubtreeResult` |
| `edit.set_type` | `setType` | `SetTypeResult` |

**Binding rules (pinned):**

- **Same op:** the MCP tool and the UI path route through the SAME edit op. The
  MCP `edit.set_props`/`edit.set_subtree`/`edit.set_type` tools call the
  corresponding op on the store (the Unit D §5.1.8 thin-validator pattern); the
  UI rich-text path (a later slice, via IPC — Unit P) routes through the same
  op. Neither writes to the RAG store from the renderer.
- **Same re-traversal:** the renderer re-traverses in response to the store
  change in BOTH cases (the `rag-store-changed` broadcast — Unit D §5.1.9). A
  successful `setProps`/`setSubtree` (content op) broadcasts
  `{ kind: 'content', nodeIds: [nodeId], edgeIds: [] }`; a successful `setType`
  (structural op) broadcasts `{ kind: 'structural', nodeIds: [nodeId], edgeIds:
  [] }`.
- **Equivalence test:** an MCP `edit.set_props` and a UI path with the same
  params produce the same store state and the same re-traversal (the same for
  `set_subtree`/`set_type`).
- **The `edit.*` tools are main-handled** (Unit B §5.3); the UI path sends an
  IPC to main, which calls the same store. The three ops are the single source
  of truth for both paths.

### 5.7 Happy-path states (TestWriter red set — valid paths)

1. **`setProps` merge happy:** a node with `props: { 'data-doc-head': true, b:
   2 }` → `setProps({ nodeId, props: { a: 1 } })` → `{ ok: true, node }`; the
   node's `props` is `{ 'data-doc-head': true, b: 2, a: 1 }` (the `data-doc-head`
   marker and `b` are preserved); a `content` journal entry is recorded; the
   renderer re-traverses.
2. **`setProps` on a node with no props:** a node with `props: undefined` →
   `setProps({ nodeId, props: { a: 1 } })` → `{ ok: true, node }`; the node's
   `props` is `{ a: 1 }`.
3. **`setProps` empty props:** `setProps({ nodeId, props: {} })` → `{ ok: true,
   node }`; the node's `props` is unchanged (an empty merge is a no-op on the
   props). A no-op `setProps` (no keys changed) is a NO-OP — it performs NO
   write and records NO journal entry (F1/F6).
4. **`setSubtree` replace happy:** a node with `children: [{ type: 'strong',
   content: 'old' }]` → `setSubtree({ nodeId, children: [{ type: 'em', content:
   'new' }] })` → `{ ok: true, node }`; the node's `children` is `[{ type: 'em',
   content: 'new' }]` (the prior children are GONE — a full replace); a `content`
   journal entry is recorded; the renderer re-traverses.
5. **`setSubtree` empty children:** `setSubtree({ nodeId, children: [] })` →
   `{ ok: true, node }`; the node's `children` is `[]` (equivalent to no inline
   children).
6. **`setSubtree` on a node with no children:** a node with `children: undefined`
   → `setSubtree({ nodeId, children: [{ type: 'a', content: 'link', props: {
   href: 'https://x' } }] })` → `{ ok: true, node }`; the node's `children` is
   the new array (with the child's `props` intact).
7. **`setType` happy:** a node with `type: 'p'`, `content: 'text'`, `children:
   [{ type: 'strong', content: 'bold' }]`, `props: { 'data-doc-head': true }`,
   `ownedNodeIds: ['n2']` → `setType({ nodeId, type: 'h1' })` → `{ ok: true,
   node }`; the node's `type` is `'h1'`; the node's id, content, children, props,
   and ownedNodeIds are ALL UNCHANGED (the node id is STABLE — no delete+create);
   a `structural` `node-update` journal entry is recorded; the renderer
   re-traverses.
8. **`setType` to the same type:** `setType({ nodeId, type: <current type> })`
   → `{ ok: true, node }`; the node is unchanged (a no-op type change is valid).
   A same-type `setType` is a NO-OP — it performs NO write and records NO
   journal entry (F1/F6).
9. **Atomicity happy:** each op applies as a single atomic edit — after a
   successful op, `getNode(nodeId)` reflects the FULL change; the journal has
   ONE new entry; `undoDepth()` increases by exactly 1.
10. **MCP/UI equivalence happy:** an MCP `edit.set_props` and a UI path with the
    same params produce the same store state and the same re-traversal (the same
    for `set_subtree`/`set_type`).

### 5.8 Fail-states (TestWriter red set — documented fail-states)

1. **`setProps` nonexistent node:** `setProps` on a nonexistent (or quarantined)
   node → `{ ok: false, error: 'edit.set_props: node not found' }`; the store is
   unchanged.
2. **`setProps` non-object props:** `setProps` with a non-object `props` (a
   string, a number, a boolean, `null`, an array) →
   `{ ok: false, error: 'edit.set_props: props must be an object' }`; the store
   is unchanged.
3. **`setProps` dangerous-key props:** `setProps` with a prototype-pollution key
   (`__proto__`/`constructor`/`prototype`) in `props` →
   `{ ok: false, error: 'edit.set_props: props contains a dangerous key' }`; the
   store is unchanged (no uncaught store throw, no pollution).
4. **`setSubtree` nonexistent node:** `setSubtree` on a nonexistent (or
   quarantined) node → `{ ok: false, error: 'edit.set_subtree: node not found' }`;
   the store is unchanged.
5. **`setSubtree` malformed children (non-array):** `setSubtree` with a
   non-array `children` (an object, a string, a number) →
   `{ ok: false, error: 'edit.set_subtree: children required/invalid' }`; the
   store is unchanged.
6. **`setSubtree` malformed children (invalid child):** `setSubtree` with a
   child that has a `span`/unknown/non-string `type`, a missing/non-string
   `content`, a null/array/non-object `props`, or a dangerous key in the child's
   `props`/on the child itself →
   `{ ok: false, error: 'edit.set_subtree: children required/invalid' }`; the
   store is unchanged (the Unit M §5.4 validation).
7. **`setType` nonexistent node:** `setType` on a nonexistent (or quarantined)
   node → `{ ok: false, error: 'edit.set_type: node not found' }`; the store is
   unchanged.
8. **`setType` invalid type:** `setType` with an invalid `RagNodeType` (a `span`,
   an unknown type, a non-string) →
   `{ ok: false, error: 'edit.set_type: invalid type' }`; the store is unchanged.

### 5.9 Census / numeric claims

- **Edit-op census 6→9:** the edit-op count goes from 6 (`setContent`,
  `createNode`, `deleteNode`, `splitNode`, `mergeNode`, `setEdge`) to 9 (adding
  `setProps`, `setSubtree`, `setType`). This unit updates the census — the
  RICH-TEXT-EDITING-GATE "census 6→9" must-fix is now MET.
- **New edit ops in `src/main/edit-ops.ts`:** 3 — `setProps`, `setSubtree`,
  `setType`.
- **New result types in `src/main/edit-ops.ts`:** 3 — `SetPropsResult`,
  `SetSubtreeResult`, `SetTypeResult`.
- **Total edit ops in `src/main/edit-ops.ts`:** 9 (per the census 6→9 claim — the
  6 existing ops plus the 3 new rich-text ops).
- **Total result types in `src/main/edit-ops.ts`:** 9 (the 6 existing
  `SetContentResult`/`CreateNodeResult`/`DeleteNodeResult`/`SplitNodeResult`/
  `MergeNodeResult`/`SetEdgeResult` + the 3 new).
- **New MCP tools (forward-looking):** 3 — `edit.set_props`, `edit.set_subtree`,
  `edit.set_type` (the tool→op mapping in §5.6; the tool wiring is a later unit).
- **Journal entries per successful op:** exactly 1 — a `content` entry for
  `setProps`/`setSubtree`, a `structural` `node-update` entry for `setType` (or
  ONE `batch` entry for a single-op `applyBatch` implementation). A failed op
  lands 0 journal entries.
- **`undoDepth()` change after a successful op:** +1 (one journal entry);
  `redoDepth()` resets to 0 (a new write discards the redo history).
- **`undoDepth()`/`redoDepth()` change after a failed op:** 0 (no journal entry,
  no pollution).
- **`RagNodeType` union members:** 18 — UNCHANGED (no `span` added; the union is
  not amended by this unit).
- **`BatchOp` union members:** 7 — UNCHANGED (the three rich-text ops were
  already forward-looking members — Unit N §5.1; this unit does not change the
  batch op shape).

### 5.10 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (the `RagNode`/`RagEdge` shapes
  the three ops mutate — `type`/`content`/`children`/`props`/`ownedNodeIds`),
  §5.4 (the `RagStore` interface the ops operate on), §5.5 (the single-writer
  queue the ops serialize through), §5.6 (the project journal — the `content`/
  `structural` entries the ops land), §5.7 (the hash-verified source the ops'
  writes recompute).
- Unit D: `docs/specs/unit-d-editing.md` §5.1 (the edit ops — the census 6→9
  context is THIS unit), §5.1.1 (the `src/main/edit-ops.ts` module the three ops
  extend — the `EditOpContext`, the result-type discipline, the `RAG_NODE_TYPES`
  set), §5.1.8 (the MCP tool→op mapping pattern the three tools follow), §5.1.9
  (the re-traversal trigger the ops' success broadcasts), §5.7 (MCP/UI
  equivalence).
- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/
  `RagNodeChildType` types `setSubtree` carries), §5.4 (the `children` shape
  validation `setSubtree` applies), §5.5 (the journal content snapshot the
  `setSubtree`/`setProps` content entries coexist with).
- Unit N: `docs/specs/unit-n-batch-atomicity.md` §5.1 (the `BatchOp` union that
  already carries `setProps`/`setSubtree`/`setType` forward-looking — a
  single-op `applyBatch` is an equivalent atomic path for any of the three ops),
  §5.4 (the `batch` journal entry a single-op batch lands).
- Unit P (future): the `IPC_EDIT_BATCH` IPC channel that carries a batch of
  edits to the store — consumes the `applyBatch` transaction primitive and the
  three ops.
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  this unit pins: `setProps` MERGES — preserves the `data-doc-head` marker;
  `setSubtree` updates `children`; `setType` changes `type`, never delete+create;
  the census 6→9).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE** (each op is a single atomic edit serialized through
  the queue), **PROJECT-JOURNAL** (each op lands one journal entry),
  **MCP-UI-EQUIVALENCE** (the same op reachable via MCP tool and UI IPC).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — retrieval indexing of inline `children` text, traversal
  disambiguation of inline vs doc-children, paste-time sanitization — LATER
  slices, NOT this unit).
- Host patterns: `src/main/edit-ops.ts` (the edit ops — the census 6→9 context,
  THIS unit; the `EditOpContext`, the result types, the `RAG_NODE_TYPES`/
  `RAG_EDGE_KINDS` sets — the amendment sites), `src/main/rag-store.ts` (the
  `RagNode` interface with the `children` field, the `RagNodeChild`/
  `RagNodeChildType` types, the `applyBatch` method the ops can use for
  atomicity).
