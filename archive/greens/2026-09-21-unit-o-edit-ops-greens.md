# Unit O — The Rich-Text Edit Ops (`setProps`/`setSubtree`/`setType`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-o-edit-ops.md` ONLY — no implementation reading of `src/`).
- **Source contract:** `docs/specs/unit-o-edit-ops.md` §5.7 (the 10 happy-path
  states) + §5.8 (the 8 fail-states) + §5.1 (the three op signatures + the
  `SetPropsResult`/`SetSubtreeResult`/`SetTypeResult` result types + the API
  rules) + §5.2/§5.3/§5.4 (the full `setProps`/`setSubtree`/`setType`
  behavior the happy/fail states ride) + §5.5 (the atomicity guarantee) + §5.6
  (the MCP/UI equivalence binding) + §3a (the adversarial findings A1–A7 the
  contract pins).
- **Modules under test:** `src/main/edit-ops.ts` (the three NEW rich-text edit
  ops `setProps`/`setSubtree`/`setType` + the three result types
  `SetPropsResult`/`SetSubtreeResult`/`SetTypeResult`). Supporting module
  imported for the store fixture (NOT the implementation under test):
  `src/main/rag-store.ts` (the `createJsonRagStore` factory + the `RagStore`
  interface + the `RagNode` shape the ops mutate).
- **Harness:** `tests/unit-o-edit-ops.test.ts`, executed with
  `npx vitest run tests/unit-o-edit-ops.test.ts`. The ops are pure async
  functions over the `RagStore` INTERFACE (Unit A §5.4 — SOURCE-SWITCHABLE), so
  they are exercised against the real `createJsonRagStore` factory on a
  temp-file JSON store exactly as the MCP handlers use them. All store mutating
  methods are queue-serialized and async, so every op call is awaited.
- **Run:** 18 scenarios — 18 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.7 Happy-path states (10)

Fixture helper: `makeNode(id, overrides)` = a snapshot node
`{ id, type: 'p', content: 'content-<id>', ownedNodeIds: [], createdAt,
updatedAt, ...overrides }`. A valid `RagNodeChild` is
`{ type: 'strong'|'em'|'a'|'img', content: string, props? }`. The `EditOpContext`
is `{ store }` where `store` is a `createJsonRagStore` instance.

### H1. `setProps` merge happy (§5.7 1)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { props: {
  'data-doc-head': true, b: 2 } }))`.
- **Ops:** `setProps({ store }, { nodeId: 'n1', props: { a: 1 } })`.
- **Expected:** `{ ok: true, node }`; `node.props` is `{ 'data-doc-head': true,
  b: 2, a: 1 }` (the `data-doc-head` marker and `b` are preserved — a MERGE, A1);
  `getNode('n1').props` reflects the merge; a `content` journal entry for `n1`
  is recorded (→ re-traversal).

### H2. `setProps` on a node with no props (§5.7 2)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1'))` (props
  undefined).
- **Ops:** `setProps({ store }, { nodeId: 'n1', props: { a: 1 } })`.
- **Expected:** `{ ok: true, node }`; `node.props` is `{ a: 1 }` (exactly
  `params.props` when the node had no props); `getNode('n1').props` is `{ a: 1 }`.

### H3. `setProps` empty props (§5.7 3)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { props: {
  'data-doc-head': true, b: 2 } }))`; capture `before = getNode('n1').props` and
  `journalBefore = journal().length`.
- **Ops:** `setProps({ store }, { nodeId: 'n1', props: {} })`.
- **Expected:** `{ ok: true, node }`; `node.props` equals `before` (an empty
  merge is a no-op on the props); `getNode('n1').props` equals `before`; a
  no-op `setProps` performs NO write and records NO journal entry
  (`journal().length` is unchanged — F1/F6).

### H4. `setSubtree` replace happy (§5.7 4)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { children:
  [{ type: 'strong', content: 'old' }] }))`.
- **Ops:** `setSubtree({ store }, { nodeId: 'n1', children: [{ type: 'em',
  content: 'new' }] })`.
- **Expected:** `{ ok: true, node }`; `node.children` is `[{ type: 'em',
  content: 'new' }]` (the prior children are GONE — a full replace, no
  merge/append, A3); `getNode('n1').children` reflects the replace; a `content`
  journal entry for `n1` is recorded (→ re-traversal).

### H5. `setSubtree` empty children (§5.7 5)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { children:
  [{ type: 'strong', content: 'old' }] }))`.
- **Ops:** `setSubtree({ store }, { nodeId: 'n1', children: [] })`.
- **Expected:** `{ ok: true, node }`; `node.children` is `[]` (equivalent to no
  inline children); `getNode('n1').children` is `[]`.

### H6. `setSubtree` on a node with no children (§5.7 6)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1'))` (children
  undefined).
- **Ops:** `setSubtree({ store }, { nodeId: 'n1', children: [{ type: 'a',
  content: 'link', props: { href: 'https://x' } }] })`.
- **Expected:** `{ ok: true, node }`; `node.children` is the new array with the
  child's `props` intact (`{ type: 'a', content: 'link', props: { href:
  'https://x' } }`); `getNode('n1').children` reflects it.

### H7. `setType` happy (§5.7 7)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { type: 'p',
  content: 'text', children: [{ type: 'strong', content: 'bold' }], props: {
  'data-doc-head': true }, ownedNodeIds: ['n2'] }))`.
- **Ops:** `setType({ store }, { nodeId: 'n1', type: 'h1' })`.
- **Expected:** `{ ok: true, node }`; `node.type` is `'h1'`; `node.id` is `'n1'`
  (STABLE — no delete+create, A5); `node.content`/`node.children`/`node.props`/
  `node.ownedNodeIds` are ALL UNCHANGED; `getNode('n1')` reflects the type
  change with everything else preserved; a `structural` `node-update` journal
  entry is recorded (→ re-traversal).

### H8. `setType` to the same type (§5.7 8)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { type: 'p',
  content: 'text' }))`; capture `journalBefore = journal().length`.
- **Ops:** `setType({ store }, { nodeId: 'n1', type: 'p' })`.
- **Expected:** `{ ok: true, node }`; `node.type` is `'p'`; `node.content` is
  `'text'`; `getNode('n1').type` is `'p'`; a same-type `setType` is a NO-OP — it
  performs NO write and records NO journal entry (`journal().length` is
  unchanged — F1/F6).

### H9. Atomicity happy (§5.7 9)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { props: {
  b: 2 }, children: [{ type: 'strong', content: 'old' }] }))`.
- **Ops:** `setProps({ store }, { nodeId: 'n1', props: { a: 1 } })`; then
  `setSubtree({ store }, { nodeId: 'n1', children: [{ type: 'em', content: 'new'
  }] })`; then `setType({ store }, { nodeId: 'n1', type: 'h1' })`.
- **Expected:** each op applies as a SINGLE atomic edit — after each successful
  op, `getNode('n1')` reflects the FULL change (merged props / replaced children
  / new type); the journal gains exactly ONE new entry per op; `undoDepth()`
  increases by exactly 1 per op (A7).

### H10. MCP/UI equivalence happy (§5.7 10)
- **Setup:** two independent fresh temp-file JSON stores `a.json`/`b.json`; both
  `putNode(makeNode('n1', { props: { 'data-doc-head': true } }))`.
- **Ops:** the same op+params on both stores — `setProps({ store: A }, { nodeId:
  'n1', props: { a: 1 } })` and `setProps({ store: B }, ...)`; then the same for
  `setSubtree` and `setType`.
- **Expected:** the MCP tool and the UI path both route through the SAME op
  (§5.6 BINDING) — the two stores produce IDENTICAL resulting store state for
  each op (`ra.node.props` equals `rb.node.props`, `sa.node.children` equals
  `sb.node.children`, `ta.node.type` equals `tb.node.type`; the `getNode` state
  matches across stores).

---

## B. §5.8 Fail-states (8)

### F1. `setProps` nonexistent node (§5.8 1)
- **Setup:** a fresh temp-file JSON store (empty).
- **Ops:** `setProps({ store }, { nodeId: 'ghost', props: { a: 1 } })`.
- **Expected:** `{ ok: false, error: 'edit.set_props: node not found' }`; the
  store is unchanged (`listNodes()` is `[]`, `journal()` is `[]`).

### F2. `setProps` non-object props (§5.8 2)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { props: {
  b: 2 } }))`; capture `journalBefore = journal().length`.
- **Ops:** `setProps({ store }, { nodeId: 'n1', props: <bad> })` for each bad
  value in `['x', 42, true, null, [1, 2]]`.
- **Expected:** each returns `{ ok: false, error: 'edit.set_props: props must be
  an object' }`; the store is unchanged (`getNode('n1').props` is `{ b: 2 }`,
  `journal().length` is `journalBefore` — the failed op added no entry).

### F3. `setProps` dangerous-key props (§5.8 3)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { props: {
  b: 2 } }))`; capture `journalBefore = journal().length`.
- **Ops:** `setProps({ store }, { nodeId: 'n1', props: <bad> })` for each bad
  value in `[JSON.parse('{"__proto__": {}}'), { constructor: {} }, { prototype:
  {} }]`.
- **Expected:** each returns `{ ok: false, error: 'edit.set_props: props
  contains a dangerous key' }`; the store is unchanged — no uncaught store
  throw, no pollution (`getNode('n1').props` is `{ b: 2 }`, `journal().length`
  is `journalBefore`) (A2).

### F4. `setSubtree` nonexistent node (§5.8 4)
- **Setup:** a fresh temp-file JSON store (empty).
- **Ops:** `setSubtree({ store }, { nodeId: 'ghost', children: [] })`.
- **Expected:** `{ ok: false, error: 'edit.set_subtree: node not found' }`; the
  store is unchanged (`listNodes()` is `[]`, `journal()` is `[]`).

### F5. `setSubtree` malformed children (non-array) (§5.8 5)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { children:
  [{ type: 'strong', content: 'old' }] }))`; capture `journalBefore =
  journal().length`.
- **Ops:** `setSubtree({ store }, { nodeId: 'n1', children: <bad> })` for each
  bad value in `[{}, 'x', 42]`.
- **Expected:** each returns `{ ok: false, error: 'edit.set_subtree: children
  required/invalid' }`; the store is unchanged (`getNode('n1').children` is
  `[{ type: 'strong', content: 'old' }]`, `journal().length` is `journalBefore`).

### F6. `setSubtree` malformed children (invalid child) (§5.8 6)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { children:
  [{ type: 'strong', content: 'old' }] }))`; capture `journalBefore =
  journal().length`.
- **Ops:** `setSubtree({ store }, { nodeId: 'n1', children: <bad> })` for each
  bad child array: a `span` type, an unknown type, a non-string type, a missing
  content, a non-string content, a null/array/non-object child `props`, a
  dangerous key in a child's `props`, and a dangerous key on the child itself.
- **Expected:** each returns `{ ok: false, error: 'edit.set_subtree: children
  required/invalid' }`; the store is unchanged (`getNode('n1').children` is
  `[{ type: 'strong', content: 'old' }]`, `journal().length` is `journalBefore`)
  (A4, the Unit M §5.4 validation).

### F7. `setType` nonexistent node (§5.8 7)
- **Setup:** a fresh temp-file JSON store (empty).
- **Ops:** `setType({ store }, { nodeId: 'ghost', type: 'h1' })`.
- **Expected:** `{ ok: false, error: 'edit.set_type: node not found' }`; the
  store is unchanged (`listNodes()` is `[]`, `journal()` is `[]`).

### F8. `setType` invalid type (§5.8 8)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { type: 'p',
  content: 'text' }))`; capture `journalBefore = journal().length`.
- **Ops:** `setType({ store }, { nodeId: 'n1', type: <bad> })` for each bad value
  in `['span', 'bogus', 42, null]`.
- **Expected:** each returns `{ ok: false, error: 'edit.set_type: invalid type'
  }`; the store is unchanged (`getNode('n1').type` is `'p'`,
  `getNode('n1').content` is `'text'`, `journal().length` is `journalBefore`)
  (A6).

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `setProps` merge happy (§5.7 1) | ✅ PASS |
| H2 | `setProps` on a node with no props (§5.7 2) | ✅ PASS |
| H3 | `setProps` empty props (no-op) (§5.7 3) | ✅ PASS |
| H4 | `setSubtree` replace happy (§5.7 4) | ✅ PASS |
| H5 | `setSubtree` empty children (§5.7 5) | ✅ PASS |
| H6 | `setSubtree` on a node with no children (§5.7 6) | ✅ PASS |
| H7 | `setType` happy (§5.7 7) | ✅ PASS |
| H8 | `setType` to the same type (no-op) (§5.7 8) | ✅ PASS |
| H9 | Atomicity happy (§5.7 9) | ✅ PASS |
| H10 | MCP/UI equivalence happy (§5.7 10) | ✅ PASS |
| F1 | `setProps` nonexistent node (§5.8 1) | ✅ PASS |
| F2 | `setProps` non-object props (§5.8 2) | ✅ PASS |
| F3 | `setProps` dangerous-key props (§5.8 3) | ✅ PASS |
| F4 | `setSubtree` nonexistent node (§5.8 4) | ✅ PASS |
| F5 | `setSubtree` malformed children (non-array) (§5.8 5) | ✅ PASS |
| F6 | `setSubtree` malformed children (invalid child) (§5.8 6) | ✅ PASS |
| F7 | `setType` nonexistent node (§5.8 7) | ✅ PASS |
| F8 | `setType` invalid type (§5.8 8) | ✅ PASS |

**Run summary:** 18 scenarios — 18 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-o-edit-ops.md` §5.7/§5.8 (plus the §5.1 op signatures + API
  rules, the §5.2/§5.3/§5.4 full behavior, the §5.5 atomicity guarantee, the
  §5.6 MCP/UI equivalence binding, and the §3a adversarial pins A1–A7) passed
  against the live `src/main/edit-ops.ts`. The three ops `setProps`/
  `setSubtree`/`setType` exist and are exported from the edit-ops module and
  return the discriminated `SetPropsResult`/`SetSubtreeResult`/`SetTypeResult`
  (§5.1); `setProps` MERGES — preserving the `data-doc-head` marker and other
  existing props (§5.7 1/2/3, §5.2, A1); `setSubtree` replaces the WHOLE
  `children` array — no merge/append (§5.7 4/5/6, §5.3, A3); `setType` changes
  `type` while preserving id/content/children/props/ownedNodeIds with a STABLE
  node id — never delete+create (§5.7 7/8, §5.4, A5); each op is a single atomic
  edit with ONE journal entry and `undoDepth()` +1 (§5.7 9, §5.5, A7); the same
  op with the same params produces identical store state across stores (§5.7 10,
  §5.6); every documented fail-state returns `{ ok: false, error }` with the
  store unchanged and no journal pollution (§5.8 1–8, A2/A4/A6). No spec-vs-impl
  drift was observed.

### Test-authoring notes (not drifts)

- **H10 (MCP/UI equivalence).** The two-independent-stores test (same initial
  node, same op+params on each) is the direct node-testable proxy for the §5.6
  "same op reachable via MCP tool and UI IPC" claim — the MCP tool and the UI
  path both route through the SAME op, so identical params must produce
  identical store state. The MCP tool WIRING itself (`edit.set_props`/
  `edit.set_subtree`/`edit.set_type` in `mcp-server.ts`) is forward-looking (a
  later unit, §5.6 F2) and is NOT exercised here.
- **H3/H8 (no-op `setProps`/`setType`).** The `journal().length`-unchanged
  assertion is the direct node-testable proxy for the §5.7 3/8 "no-op performs
  NO write and records NO journal entry" claim (F1/F6).
- **F3/F6 (dangerous-key props).** The `JSON.parse('{"__proto__": {}}')` form
  is used so the test exercises a real own `__proto__` key (an object literal
  would set the prototype instead) — proving the op's prototype-pollution guard
  returns a domain result rather than an uncaught store throw (A2/A4).
- **Census 6→9 (§5.9).** The three ops are imported and exercised successfully
  against the live module, consistent with the §5.9 census 6→9 claim (the 6
  existing ops plus the 3 new rich-text ops = 9). The exact total-op count is a
  §5.9 numeric claim verified by the successful import/use of all three new ops;
  the full census enumeration is not re-derived here (no implementation
  reading).
