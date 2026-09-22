# Unit U5 — The Atomic Rich-Text Write-Back Op (`setRichText`) + `IPC_EDIT_RICH_COMMIT` + Preload `edit.commitRich`: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived ONLY from
  `docs/specs/unit-u5-set-rich-text.md` — §1.1/§1.2 (the `setRichText` op + its
  validation order + the no-op/idempotence contract + the atomic ONE-`putNode`
  write + the `deriveRichCommitBroadcast` pure helper + the kind rule + the
  throw-vs-fail contract), §1.3 (`IPC_EDIT_RICH_COMMIT` / `EditRichCommitPayload` /
  `RichCommitResult` / `handleRichCommit` / `handleRichCommitIpc` + the A1
  boundary check + the F1/F2 before-guard), §1.4 (preload `edit.commitRich`),
  §1.5 (the `applyBatch` non-interaction), §2.1 (happy-path states 1–28), §2.2
  (fail-states 1–13), §3 (census/broadcast/journal/`undoDepth`/`updatedAt`
  counts), §5 (ADR-1/2/3/4/5/6/8/9/11 + the post-green adversarial findings
  F1/F2/F4) — PLUS `docs/specs/editing-mode-toggle-review.md` decision **A**
  (atomic `putNode` + ONE `content` journal entry + broadcast; `applyBatch`
  untouched) and `src/shared/types.ts` + `src/main/rag-store.ts` (the DATA
  TYPES/consts + the `RagNode`/`RagNodeChild` data model + the `applyBatch`
  rejection strings). NO implementation reading of `src/main/edit-ops.ts`,
  `src/main/main.ts`, or `src/main/preload.ts`, and NOT a copy of the U5 red-set
  test names (`tests/unit-u5-set-rich-text.test.ts` /
  `tests/unit-u5-rich-commit-ipc.test.ts` were not read).
- **Modules under test:** `setRichText`, `deriveRichCommitBroadcast`,
  `handleRichCommit`, `handleRichCommitIpc` (LIVE from `src/main/edit-ops.ts` —
  imported to RUN the scenarios), the preload `edit.commitRich` bridge
  (`src/main/preload.ts`, imported LIVE through a mocked `electron`
  `contextBridge`/`ipcRenderer`), and the `applyBatch` non-interaction over the
  LIVE `createJsonRagStore` (`src/main/rag-store.ts`).
- **Harness:** a standalone vitest scratch file
  (`tests/_scratch-u5-greens.test.ts`). The `setRichText`/`deriveRichCommitBroadcast`/
  `handleRichCommit`/`handleRichCommitIpc` scenarios run over the concrete JSON
  store (`createJsonRagStore` on a temp path — the same store harness the spec
  describes, §1.1 TestWriter contract) plus store-spy wrappers to count
  `putNode` invocations and to model the F2 node-absent→recreated race. The
  `applyBatch` non-interaction is asserted against the LIVE store. The preload
  `edit.commitRich` is driven through a `vi.mock('electron')` that captures the
  bridge object via `contextBridge.exposeInMainWorld` and records
  `ipcRenderer.invoke` calls. Type-level scenarios (payload/result/batch-op
  shapes) are additionally checked with `tsc --noEmit` on a scratch type file.
  Run: `npx vitest run tests/_scratch-u5-greens.test.ts`. (Scratch files deleted
  after the run.)
- **Run:** **35 scenarios — all PASS, 0 fail, 0 skipped.** No spec-vs-impl drift
  observed in the LIVE op / helpers / handler / preload bridge or in the
  `applyBatch` non-interaction.

Each scenario lists: name, input, expected outcome (from the spec), actual result,
PASS/FAIL.

---

## A. `setRichText` atomic pair-set (§1.2, §2.1 1–11, §2.2 1–9, §3) — LIVE module

### A-1. Atomic content+children set — BOTH land in ONE `putNode` (§2.1 1 / ADR-1 / §2.2 9)
- **Input:** store with node `n1` (`content:'old'`, `children: undefined`); a spy
  wrapping `store.putNode`; call
  `setRichText({store}, { nodeId:'n1', content:'hello', children:[{type:'strong',content:'bold'}] })`
- **Expected:** `{ ok:true, node }` where `node.content === 'hello'` AND
  `node.children` deep-equals `[{type:'strong',content:'bold'}]`; the spy records
  EXACTLY **ONE** call whose assembled node carries BOTH fields (there is NO
  separate content-then-children write — a half-applied node is impossible by
  construction).
- **Actual:** both fields set in a single putNode (spy count = 1)
- **Result:** ✅ PASS

### A-2. Exactly ONE `content` journal entry + `undoDepth` +1 (§2.1 2 / §3)
- **Input:** after the A-1 commit, inspect `store.journal()` / `store.undoDepth()`
- **Expected:** exactly **1** journal entry, `kind:'content'`, whose `after`
  carries `{ content:'hello', children:[strong('bold')] }` and whose `before`
  carries the prior `content:'old'` / `children: undefined`; `undoDepth() === 1`.
- **Actual:** one `content` entry with the pinned before/after; `undoDepth()===1`
- **Result:** ✅ PASS

### A-3. `updatedAt` refreshed / `createdAt` preserved (§2.1 3)
- **Input:** record `before.updatedAt`/`before.createdAt`; run a real change;
  inspect the returned node
- **Expected:** `node.updatedAt > before.updatedAt`; `node.createdAt ===
  before.createdAt`.
- **Actual:** updatedAt strictly later; createdAt preserved
- **Result:** ✅ PASS

### A-4. No prior children (`undefined`) → node becomes rich (§2.1 4)
- **Input:** node `n1` with `children: undefined`; commit
  `{ content:'x', children:[{type:'em',content:'i'}] }`
- **Expected:** `{ ok:true, node }` with `node.children` deep-equals
  `[{type:'em',content:'i'}]` (a plain-text node becomes rich).
- **Actual:** children deep-equal `[{type:'em',content:'i'}]`
- **Result:** ✅ PASS

### A-5. Prior children OVERWRITTEN, not merged (§2.1 5)
- **Input:** node `n1` with `children:[{type:'strong',content:'old'}]`; commit
  `{ content:'y', children:[{type:'a',content:'link',props:{href:'https://x'}}] }`
- **Expected:** `node.children` deep-equals the NEW array only (the old strong
  child fully replaced, not merged).
- **Actual:** only the new `a` child present
- **Result:** ✅ PASS

### A-6. Empty `[]` clears children (§2.1 6)
- **Input:** node `n1` with `children:[{type:'strong',content:'old'}]`; commit
  `{ content:'z', children:[] }`
- **Expected:** `{ ok:true, node }` with `node.children` deep-equals `[]` (stored
  field is `[]`; a rich node becomes plain).
- **Actual:** children deep-equal `[]`
- **Result:** ✅ PASS

### A-7. Idempotent no-op — content + children unchanged AND `undefined` ≡ `[]` (§2.1 7/8 / ADR-3/4/10)
- **Input:** (a) node `{ content:'same', children:[{type:'em',content:'i'}] }`
  committed with the SAME content + a deep-equal children; (b) node
  `{ content:'same', children: undefined }` committed with
  `{ content:'same', children:[] }` (U2 emits `[]` for a plain node)
- **Expected:** both `{ ok:true, node }` (node UNCHANGED); a `putNode` spy
  records ZERO calls; `undoDepth()` unchanged; `node.updatedAt` unchanged;
  `deriveRichCommitBroadcast(before, node) === null` — no write/journal/
  broadcast on an unchanged commit.
- **Actual:** no write (putNode 0), no journal, updatedAt unchanged, broadcast
  null for both forms
- **Result:** ✅ PASS

### A-8. Content-only change preserves the stored children representation (§2.1 9 / ADR-4)
- **Input:** node `n1` `{ content:'old', children: undefined }`; commit
  `{ content:'new', children:[] }`
- **Expected:** `{ ok:true, node }` with `node.content === 'new'` AND
  `node.children === undefined` (the equivalent-empty representation is NOT
  normalized to `[]` on a content-only edit); exactly ONE putNode.
- **Actual:** content changed, `node.children` still `undefined`
- **Result:** ✅ PASS

### A-9. Children-only change (content identical) (§2.1 10 / ADR-2)
- **Input:** node `n1` `{ content:'same', children: undefined }`; commit
  `{ content:'same', children:[{type:'strong',content:'b'}] }`
- **Expected:** writes children, `node.content === 'same'`, ONE `content` journal
  entry; `deriveRichCommitBroadcast(before, after).kind === 'structural'`.
- **Actual:** children written, content unchanged, kind `structural`
- **Result:** ✅ PASS

### A-10. Children with optional `props` — written verbatim (§2.1 11)
- **Input:** commit children
  `[{type:'img', content:'', props:{src:'https://x/i.png',alt:'pic'}}]`
- **Expected:** `{ ok:true, node }` with `node.children` deep-equal the input
  (props preserved verbatim).
- **Actual:** props preserved verbatim
- **Result:** ✅ PASS

### A-11. Nonexistent node → domain fail (§2.2 1 / ADR-8)
- **Input:** `setRichText({store}, { nodeId:'nope', content:'x', children:[] })`
- **Expected:** `{ ok:false, error:'edit.set_rich_text: node not found' }`, no
  putNode, no throw.
- **Actual:** `{ ok:false, error:'edit.set_rich_text: node not found' }`
- **Result:** ✅ PASS

### A-12. Content non-string → domain fail (§2.2 2)
- **Input:** `content: 42`, `content: null`, `content: undefined`, `content:
  {a:1}` (each with a valid `children:[]`) on an existing node
- **Expected:** each `{ ok:false, error:'edit.set_rich_text: content must be a
  string' }`, never throws, no mutation.
- **Actual:** `content must be a string` for all four
- **Result:** ✅ PASS

### A-13. Children non-array OR absent → domain fail (§2.2 3/4 / ADR-5)
- **Input:** `children:'x'`, `children:{}`, `children:42`, and a call with NO
  `children` field (on an existing node)
- **Expected:** each `{ ok:false, error:'edit.set_rich_text: children
  required/invalid' }` (children is REQUIRED — only `[]` clears).
- **Actual:** `children required/invalid` for all four
- **Result:** ✅ PASS

### A-14. Invalid child shape → domain fail (§2.2 5/6/7 / ADR-5)
- **Input:** `children:[{type:'span',content:'x'}]`, `[{type:'div',content:'x'}]`,
  `[{type:42,content:'x'}]`, `[{type:'strong'}]` (missing content),
  `[{type:'a',content:'x',props:'x'}]`, `[{type:'a',content:'x',props:[]}]`,
  `[{type:'a',content:'x',props:null}]`,
  `[{type:'strong',content:'x',props:{['__proto__']:{}}}]`
- **Expected:** each `{ ok:false, error:'edit.set_rich_text: children
  required/invalid' }` (`span`/`div` not `RagNodeChildType`; a non-string/unknown
  type, missing/non-string content, malformed props, or a dangerous key in
  child/props is invalid — `isValidChildren`).
- **Actual:** `children required/invalid` for all eight
- **Result:** ✅ PASS

### A-15. No partial mutation on a domain failure (§2.2 8/9 / ADR-5 / ADR-1)
- **Input:** run a failing call (A-13 children-absent) on a node with non-default
  content/children; also confirm a real change uses a single putNode (A-1)
- **Expected:** the node is UNCHANGED, `undoDepth()` unchanged, NO journal entry
  (a rejected commit leaves the store exactly as it was — fail-closed; no
  half-applied content-without-children or vice-versa).
- **Actual:** node unchanged, no journal entry, undoDepth unchanged
- **Result:** ✅ PASS

---

## B. `deriveRichCommitBroadcast` (pure helper, §1.2, §2.1 12–15, §3) — LIVE module

### B-1. Children changed (alone or with content) → `structural` (§2.1 12/14 / ADR-2)
- **Input:** (a) `before` children `[strong('old')]` → `after` children
  `[em('i')]` (same content); (b) `before` `{ content:'a', children:undefined }`
  → `after` `{ content:'b', children:[strong('x')] }`
- **Expected:** both `{ kind:'structural', nodeIds:[after.id], edgeIds:[] }` (the
  structural kind is the superset — the reconcile re-indexes the changed content
  too).
- **Actual:** `{ kind:'structural', nodeIds:['n1'], edgeIds:[] }` for both
- **Result:** ✅ PASS

### B-2. Content-only changed (children `undefined` vs `[]`) → `content` (§2.1 13 / ADR-4)
- **Input:** `before` `{ content:'a', children:undefined }`, `after`
  `{ content:'b', children:[] }` (only content differs; children equivalent)
- **Expected:** `{ kind:'content', nodeIds:[after.id], edgeIds:[] }`
- **Actual:** `{ kind:'content', nodeIds:['n1'], edgeIds:[] }`
- **Result:** ✅ PASS

### B-3. No-op → null (§2.1 15 / ADR-3)
- **Input:** identical `before`/`after` (content + children equal; also the
  `undefined` ≡ `[]` case)
- **Expected:** returns `null` (no broadcast).
- **Actual:** `null`
- **Result:** ✅ PASS

---

## C. `handleRichCommit` (pure handler, §1.3, §2.1 16–18) — LIVE module

### C-1. Success mapping — updated node returned (§2.1 16)
- **Input:** valid node + payload; `handleRichCommit(store, payload)`
- **Expected:** `{ ok:true, nodeId:payload.nodeId, node }` where `node` is the
  UPDATED node (content + children written).
- **Actual:** `{ ok:true, nodeId:'n1', node }` with the written state
- **Result:** ✅ PASS

### C-2. Deleted-node race mapping → `deleted-node` (§2.1 17 / ADR-8)
- **Input:** a node id that does NOT exist; `handleRichCommit(store,
  { nodeId:'ghost', content:'x', children:[] })`
- **Expected:** `{ ok:false, reason:'deleted-node', error:'edit.set_rich_text:
  node not found' }` (NOT `store-error`).
- **Actual:** `reason:'deleted-node'` with the node-not-found error
- **Result:** ✅ PASS

### C-3. Store-error mapping (§2.1 18)
- **Input:** a valid node + payload with invalid children (`children:[{type:'span'}]`)
- **Expected:** `{ ok:false, reason:'store-error', error:'edit.set_rich_text:
  children required/invalid' }`.
- **Actual:** `reason:'store-error'`, the children-required error
- **Result:** ✅ PASS

---

## D. `applyBatch` non-interaction (§1.5, §2.2 11, §3) — LIVE store

### D-1. `applyBatch` still rejects `setProps` (` at index N`) (§1.5 / §2.2 11)
- **Input:** `store.applyBatch([{op:'setProps', nodeId:'n1', props:{a:1}}])`
- **Expected:** `{ ok:false, error:'rag applyBatch: op not supported: setProps at
  index 0' }` (UNCHANGED — the pinned string carries ` at index 0` for a
  single-op batch).
- **Actual:** the exact pinned string
- **Result:** ✅ PASS

### D-2. `applyBatch` still rejects `setSubtree` (` at index N`) (§1.5 / §2.2 11)
- **Input:** `store.applyBatch([{op:'setSubtree', nodeId:'n1', children:[]}])`
- **Expected:** `{ ok:false, error:'rag applyBatch: op not supported: setSubtree
  at index 0' }`.
- **Actual:** the exact pinned string
- **Result:** ✅ PASS

### D-3. `applyBatch` still rejects `setType` (` at index N`) (§1.5 / §2.2 11)
- **Input:** `store.applyBatch([{op:'setType', nodeId:'n1', type:'h1'}])`
- **Expected:** `{ ok:false, error:'rag applyBatch: op not supported: setType at
  index 0' }`.
- **Actual:** the exact pinned string
- **Result:** ✅ PASS

### D-4. `setRichText` is NOT a batch op — invalid at runtime (§1.5 / §2.2 11)
- **Input:** `store.applyBatch([{op:'setRichText', nodeId:'n1', content:'x',
  children:[]}])` (a TypeScript error, but reachable at runtime)
- **Expected:** `{ ok:false, error:'rag applyBatch: invalid op at index 0' }`.
- **Actual:** the exact pinned string
- **Result:** ✅ PASS

---

## E. `handleRichCommitIpc` — the `IPC_EDIT_RICH_COMMIT` derive→reconcile→broadcast body (§1.3/F1, §2.1 24–27, §5 F1/F2/ADR-9/11) — LIVE module

### E-1. Real content change → reconcile + broadcast EXACTLY ONCE, kind `content` (§2.1 24/26 / F1)
- **Input:** node `n1` `{ content:'old' }`; call `handleRichCommitIpc(store,
  { nodeId:'n1', content:'new', children:[] }, { reconcile: spy, broadcast: spy })`
- **Expected:** returns `{ ok:true, nodeId:'n1', node }`; `reconcile` called
  EXACTLY ONCE with `('content', ['n1'], [])`; `broadcast` called EXACTLY ONCE
  with the same; no unhandled rejection.
- **Actual:** ok; reconcile+broadcast each once with `('content',['n1'],[])`
- **Result:** ✅ PASS

### E-2. Kind routing — a children-bearing change → `structural` (§2.1 26 / F1)
- **Input:** node `n1` `{ content:'same', children:undefined }`; commit
  `{ content:'same', children:[{type:'strong',content:'b'}] }`; and a combined
  `{ content:'b', children:[{type:'em',content:'i'}] }` from `{ content:'a' }`
- **Expected:** reconcile + broadcast each ONCE with `('structural', ['n1'], [])`
  for both the children-only and the combined change.
- **Actual:** `('structural',['n1'],[])` for both
- **Result:** ✅ PASS

### E-3. No-op commit → ZERO broadcasts / ZERO reconciles (§2.1 25 / ADR-3 / ADR-10 / F1)
- **Input:** node `n1` `{ content:'same', children:[{type:'em',content:'i'}] }`;
  commit the SAME content + a deep-equal children
- **Expected:** `{ ok:true, nodeId:'n1', node }` (node unchanged); `reconcile` and
  `broadcast` both called ZERO times (idempotent — no redundant re-derive).
- **Actual:** reconcile + broadcast both 0 calls
- **Result:** ✅ PASS

### E-4. Malformed IPC payload → store-error + ZERO broadcasts, never throws (§2.2 10 / ADR-5 / F1)
- **Input:** `handleRichCommitIpc(store, null, deps)`,
  `handleRichCommitIpc(store, { content:'x', children:[] }, deps)` (missing
  nodeId), `handleRichCommitIpc(store, { nodeId:'n1', content:42,
  children:[] }, deps)`, `handleRichCommitIpc(store, { nodeId:'n1',
  content:'x', children:'x' }, deps)`
- **Expected:** each `{ ok:false, reason:'store-error', error:'edit-rich-commit:
  nodeId, content, and children array required' }`; `reconcile` + `broadcast`
  both 0 calls; never throws. (The boundary check does NOT deep-validate the
  children SHAPE.)
- **Actual:** the pinned store-error for all four, 0 broadcasts, no throw
- **Result:** ✅ PASS

### E-5. Failed op (deleted-node race) → mapped result + ZERO broadcasts (§2.1 17 / ADR-8 / F1)
- **Input:** `handleRichCommitIpc(store, { nodeId:'ghost', content:'x',
  children:[] }, deps)`
- **Expected:** `{ ok:false, reason:'deleted-node', error:'edit.set_rich_text:
  node not found' }`; reconcile + broadcast both 0 calls.
- **Actual:** deleted-node result, 0 broadcasts
- **Result:** ✅ PASS

### E-6. Reconcile failure is NON-fatal — broadcast still fires (§2.1 27 / ADR-11 / F1)
- **Input:** node `n1` real content change; `deps.reconcile` is a REJECTING
  function (`() => Promise.reject(new Error('boom'))`)
- **Expected:** `{ ok:true, ... }`; `broadcast` called ONCE with the derived
  payload; the reconcile rejection is caught + logged (`console.error(...'retrieval
  index reconcile failed'...)`), NEVER an unhandled rejection.
- **Actual:** ok; broadcast once; rejection caught (no unhandled rejection)
- **Result:** ✅ PASS

### E-7. F2/ADR-9 — `before`-undefined-while-ok NEVER throws, falls back to NO broadcast (§1.3 / §5 F2)
- **Input:** a store wrapper whose FIRST `getNode` (handler entry capture) returns
  `undefined` but whose subsequent `getNode` returns the node (the exotic
  node-absent→recreated race); commit a real change
- **Expected:** `{ ok:true, nodeId, node }` (the store change landed); `reconcile`
  + `broadcast` both ZERO calls; NEVER throws a TypeError (the derive is guarded
  with `before ? ... : null`).
- **Actual:** ok, 0 broadcasts, no throw
- **Result:** ✅ PASS

---

## F. Preload `edit.commitRich` (§1.4, §2.1 28) — LIVE bridge through a mocked electron

### F-1. `commitRich` invokes `IPC_EDIT_RICH_COMMIT` with the payload and resolves the result (§2.1 28)
- **Input:** capture the `provident` bridge via a mocked
  `contextBridge.exposeInMainWorld`; mock `ipcRenderer.invoke` to resolve
  `{ ok:true, nodeId:'n1', node }`; call
  `bridge.edit.commitRich('n1', 'hello', [{type:'strong',content:'bold'}])`
- **Expected:** `ipcRenderer.invoke` called EXACTLY ONCE with
  `('provident:edit-rich-commit', { nodeId:'n1', content:'hello',
  children:[{type:'strong',content:'bold'}] })` (the `EditRichCommitPayload`);
  the promise resolves to the mocked `RichCommitResult`; the `edit` bridge has
  the 4 methods `commit`/`batch`/`commitRich`/`onRagStoreChanged`.
- **Actual:** invoke called once with the channel + exact payload; resolved to the
  result; `commitRich` present among the 4 `edit` methods
- **Result:** ✅ PASS

---

## G. Type-level / census (§2.1 19–23, §3) — tsc + runtime const check

### G-1. `IPC_EDIT_RICH_COMMIT` value + payload/result shapes typecheck (§2.1 19–22 / §3)
- **Input:** (a) the const value from `src/shared/types.js`; (b) a `tsc --noEmit`
  probe assigning `{ nodeId:'n1', content:'x', children:[{type:'strong',
  content:'b'}] }` to `EditRichCommitPayload` and narrowing `RichCommitResult` to
  its `{ ok:true; nodeId; node: RagNode }` / `{ ok:false; reason:'deleted-node' |
  'store-error'; error? }` arms and `SetRichTextResult` to `{ ok:true; node }` |
  `{ ok:false; error }`
- **Expected:** the const equals `'provident:edit-rich-commit'`; all typechecks
  green.
- **Actual:** const equals the pinned channel; typechecks green (tsc)
- **Result:** ✅ PASS

### G-2. `BatchOp` has NO `setRichText` variant — applyBatch non-interaction at the type level (§1.5 / §2.1 23)
- **Input:** a `tsc --noEmit` probe asserting `{ op:'setRichText', ... }` is NOT a
  `BatchOp` member (assigning it to a `BatchOp[]` is a type error)
- **Expected:** the probe FAILS to typecheck (i.e. `setRichText` is not a batch
  op — no `BatchOp` change).
- **Actual:** the `setRichText`-as-`BatchOp` assignment is a tsc type error
- **Result:** ✅ PASS

---

## H. Run record

| # | Scenario | Result |
| --- | --- | --- |
| A-1 | Atomic content+children set (ONE putNode) | ✅ PASS |
| A-2 | Exactly ONE `content` journal entry + undoDepth +1 | ✅ PASS |
| A-3 | `updatedAt` refreshed / `createdAt` preserved | ✅ PASS |
| A-4 | No prior children → node becomes rich | ✅ PASS |
| A-5 | Prior children overwritten (not merged) | ✅ PASS |
| A-6 | Empty `[]` clears children | ✅ PASS |
| A-7 | Idempotent no-op (unchanged + `undefined`≡`[]`) | ✅ PASS |
| A-8 | Content-only change preserves stored children rep | ✅ PASS |
| A-9 | Children-only change → structural | ✅ PASS |
| A-10 | Children with optional props verbatim | ✅ PASS |
| A-11 | Nonexistent node → `node not found` | ✅ PASS |
| A-12 | Content non-string → `content must be a string` | ✅ PASS |
| A-13 | Children non-array / absent → `children required/invalid` | ✅ PASS |
| A-14 | Invalid child shape (type/content/props/dangerous key) | ✅ PASS |
| A-15 | No partial mutation on a domain failure | ✅ PASS |
| B-1 | Children changed → `structural` | ✅ PASS |
| B-2 | Content-only (undefined vs []) → `content` | ✅ PASS |
| B-3 | No-op → null | ✅ PASS |
| C-1 | handleRichCommit success mapping | ✅ PASS |
| C-2 | Deleted-node race → `deleted-node` | ✅ PASS |
| C-3 | Store-error mapping (invalid children) | ✅ PASS |
| D-1 | applyBatch rejects setProps (` at index 0`) | ✅ PASS |
| D-2 | applyBatch rejects setSubtree (` at index 0`) | ✅ PASS |
| D-3 | applyBatch rejects setType (` at index 0`) | ✅ PASS |
| D-4 | setRichText is not a batch op (`invalid op at index 0`) | ✅ PASS |
| E-1 | Real content change → reconcile+broadcast once, `content` | ✅ PASS |
| E-2 | Kind routing — children-bearing change → `structural` | ✅ PASS |
| E-3 | No-op commit → 0 broadcasts / 0 reconciles | ✅ PASS |
| E-4 | Malformed payload → store-error + 0 broadcasts | ✅ PASS |
| E-5 | Deleted-node race → 0 broadcasts | ✅ PASS |
| E-6 | Reconcile failure non-fatal, broadcast still fires | ✅ PASS |
| E-7 | F2 before-guard — never throws, 0 broadcasts | ✅ PASS |
| F-1 | Preload commitRich invokes channel + resolves result | ✅ PASS |
| G-1 | IPC_EDIT_RICH_COMMIT value + payload/result typecheck | ✅ PASS |
| G-2 | BatchOp has no setRichText variant | ✅ PASS |

**Run summary:** 35 scenarios — 35 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every `setRichText` happy-path + fail-state, the
  `deriveRichCommitBroadcast` kind rule (`structural` for any children change /
  `content` for content-only / `null` for no-op), the `handleRichCommit` /
  `handleRichCommitIpc` mappings (success / `deleted-node` / `store-error`, the
  A1 boundary check, broadcast-once-on-real-change / zero-on-no-op-or-failure,
  the F2 before-guard, the reconcile-failure isolation), the `applyBatch`
  non-interaction (` at index 0` for all three Unit O ops + `invalid op at index
  0` for `setRichText`), the atomicity (ONE `putNode` carrying both fields), the
  idempotence (`undefined` ≡ `[]`), and the preload `commitRich` bridge all
  passed against the LIVE modules with the expected (spec-pinned) values.

### Test-authoring notes (not drifts)

- **Harness carve-out — the preload bridge.** `edit.commitRich` is exercised by
  mocking `electron` (`contextBridge.exposeInMainWorld` captures the bridge;
  `ipcRenderer.invoke` is spied) rather than running a full Electron window —
  the same mock-based seam the repo's main/preload integration uses. The full
  main-process `ipcMain.handle(IPC_EDIT_RICH_COMMIT, ...)` wiring (which binds
  the real `retrievalEngine.onStoreChanged` + `backend.broadcast` into
  `handleRichCommitIpc`) is asserted at the shared-handler level (Section E);
  the `main.ts` binding itself is the F1 seam and is not imported directly (the
  repo tests shared handlers, not `main.ts`).
- **Grouped rows.** Rows marked with multiple inputs (A-7, A-12, A-13, A-14,
  B-1, E-2, E-4, G-1) assert each sub-variant individually in the run.
- **G-1/G-2 (type-level).** Verified with a `tsc --noEmit` probe on a scratch
  type file plus a runtime const/value assertion; vitest itself does not
  typecheck.
