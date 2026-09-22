# Unit M — The `children` Field on `RagNode`: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-m-children-field.md` ONLY — no implementation reading of
  `src/`).
- **Source contract:** `docs/specs/unit-m-children-field.md` §5.6 (the 12
  happy-path states) + §5.7 (the 10 fail-states) + §5.2/§5.3 (the hash-source
  and store-format additive rules the happy/fail states ride) + §5.4 (the
  shape-validation rules) + §5.5 (the journal snapshot rules) + §3a (the
  adversarial findings A1–A5 the contract pins).
- **Modules under test:** `src/main/rag-store.ts` (the `RagNode` interface +
  the `RagNodeChild`/`RagNodeChildType` types + `nodeSource`/`nodeHash` +
  `validateNodeShape` + the journal content-entry snapshot + the internal copy
  paths `toPublicNode`/`insertNode`/`setNodeFields`/`applyInverse`/
  `applyForward`). Supporting modules imported for fixtures (NOT the
  implementation under test): `node:crypto` (the SHA-256 hash helper).
- **Harness:** `tests/unit-m-children-field.test.ts`, executed with
  `npx vitest run tests/unit-m-children-field.test.ts`. The store is exercised
  through the real `createJsonRagStore` factory against a temp-file JSON store.
  The hash helpers `newNodeSource`/`newNodeHash` (the spec's amended field
  order `id, type, content, children, props, ownedNodeIds, createdAt,
  updatedAt`) and `oldNodeSource`/`oldNodeHash` (the pre-Unit-M order, no
  `children`) author persisted-file fixtures with a hash the post-Unit-M store
  will re-derive.
- **Run:** 22 scenarios — 22 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.6 Happy-path states (12)

Fixture helpers: `makeNode(id, overrides)` = a snapshot node
`{ id, type: 'p', content: 'content-<id>', ownedNodeIds: [], createdAt,
updatedAt, ...overrides }`; `makeEdge(id, source, target, overrides)` = a
snapshot edge `{ id, kind: 'parent-child', source, target, createdAt,
updatedAt, ...overrides }`. A valid `RagNodeChild` is
`{ type: 'strong'|'em'|'a'|'img', content: string, props? }`.

### H1. `children` field present on `RagNode` (§5.6 1)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'strong', content:
  'bold' }] }))`.
- **Expected:** the store accepts the node; the returned node's `children`
  equals `[{ type: 'strong', content: 'bold' }]` (the `RagNode` interface
  exposes `children?: RagNodeChild[]`).

### H2. `RagNodeChildType` closed union (§5.6 2)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [ { type: 'strong', content:
  'b' }, { type: 'em', content: 'i' }, { type: 'a', content: 'l', props: {
  href: 'https://x' } }, { type: 'img', content: '', props: { src: 'x.png',
  alt: 'x' } } ] }))`.
- **Expected:** all four members (`strong`/`em`/`a`/`img`) are accepted;
  `getNode('n1').children` equals the input array (the closed 4-member union).

### H3. Node create with `children` (§5.6 3)
- **Setup:** a fresh temp-file JSON store at `file`.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'strong', content:
  'bold' }] }))`.
- **Expected:** the returned node has `id: 'n1'` and `children` intact;
  `getNode('n1').children` equals the input; `listNodes()` has 1 entry; the
  file exists (written atomically).

### H4. Node update changing `children` (§5.6 4)
- **Setup:** a fresh temp-file JSON store at `file`; `putNode(makeNode('n1',
  { children: [{ type: 'strong', content: 'bold' }] }))`; capture `before =
  getNode('n1').updatedAt`.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'em', content:
  'italic' }] }))`.
- **Expected:** the node is replaced (`getNode('n1').children` equals the new
  array); `updatedAt` is refreshed (≠ `before`); a `content` journal entry is
  recorded with `before.children` = the old array and `after.children` = the
  new array; the on-disk `hash` equals `newNodeHash(stored)` (a `children`
  change → a new hash — `nodeSource` covers `children`).

### H5. Node WITHOUT `children` (plain-text, the v1 default) (§5.6 5)
- **Setup:** a fresh temp-file JSON store at `file`.
- **Ops:** `putNode(makeNode('n1', { content: 'plain' }))`; read the on-disk
  record; boot a fresh store from `file`.
- **Expected:** `getNode('n1').children` is `undefined`; the on-disk `hash`
  equals `oldNodeHash(stored)` (the pre-Unit-M format — a missing `children`
  serializes identically to `children: undefined`); the reloaded store has
  `status().corrupt === false`, `status().quarantined === []`, and
  `getNode('n1').content === 'plain'` (no quarantine — ADDITIVE).

### H6. Empty `children` array (§5.6 6)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [] }))`.
- **Expected:** valid; the node is stored; `getNode('n1').children` equals `[]`
  (an empty array is valid — equivalent to no inline children).

### H7. `children` with `props` (§5.6 7)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'a', content: 'link',
  props: { href: 'https://x' } }] }))`.
- **Expected:** valid; `getNode('n1').children` equals the input (the child's
  `props` round-trip).

### H8. Hash covers `children` (§5.6 8)
- **Setup:** two fresh temp-file JSON stores `a.json`/`b.json`; a shared base
  node `makeNode('n1', { content: 'x' })`.
- **Ops:** `putNode({ ...base, children: [{ type: 'strong', content: 'bold'
  }] })` into store A; `putNode(base)` into store B.
- **Expected:** the on-disk hashes differ (`hA !== hB`) — the only difference
  is the `children` field, so `nodeSource` must cover `children` (a `children`
  change → a new hash).

### H9. Additive load (existing record without `children`) (§5.6 9)
- **Setup:** a temp-file JSON store at `file` authored as a pre-Unit-M file:
  two nodes `n1`/`n2` with `hash: oldNodeHash(...)` (no `children` field),
  empty edges/journal, `cursor: 0`.
- **Ops:** boot a store from `file`.
- **Expected:** `status().corrupt === false`; `status().quarantined === []`;
  `status().loadedNodes` includes `n1` and `n2`; `getNode('n1').content ===
  'a'` (the re-derived hash matches the stored hash — no migration, no
  re-hash, no quarantine).

### H10. Round-trip with `children` (§5.6 10)
- **Setup:** a temp-file JSON store at `file`.
- **Ops:** store A `putNode(makeNode('n1', { children: [{ type: 'strong',
  content: 'bold' }] }))`; boot store B from `file`.
- **Expected:** store B has `status().corrupt === false`,
  `status().quarantined === []`, and `getNode('n1').children` equals the input
  (the `children` array survives the write → persist → boot → read cycle with
  a matching hash).

### H11. Journal content undo/redo with `children` (§5.6 11)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'strong', content:
  'bold' }] }))`; `putNode(makeNode('n1', { children: [{ type: 'em', content:
  'italic' }] }))`; `undo()`; then `redo()`.
- **Expected:** `undo()` restores the prior `children` (`strong`/`bold`);
  `redo()` re-applies the new `children` (`em`/`italic`) — the content edit
  that changes `children` is invertible.

### H12. Deep-copy on read (§5.6 12)
- **Setup:** a fresh temp-file JSON store; `putNode(makeNode('n1', { children:
  [{ type: 'strong', content: 'bold' }] }))`.
- **Ops:** `const first = getNode('n1')`; `first.children.push({ type: 'em',
  content: 'x' })`; `const second = getNode('n1')`.
- **Expected:** `second.children` equals `[{ type: 'strong', content: 'bold'
  }]` (mutating a returned node's `children` does NOT change the store — the
  store returns a copy, A3).

---

## B. §5.7 Fail-states (10)

### F1. `children` is a non-array (§5.7 1)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: { type: 'strong' } }))`;
  `putNode(makeNode('n2', { children: 'bold' }))`;
  `putNode(makeNode('n3', { children: 42 }))`.
- **Expected:** each `putNode` rejects with `Error('rag putNode: children
  required/invalid')`; `listNodes()` is `[]` (the store is unchanged).

### F2. A child is a non-object (§5.7 2)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [null] }))`;
  `putNode(makeNode('n2', { children: ['x'] }))`;
  `putNode(makeNode('n3', { children: [42] }))`;
  `putNode(makeNode('n4', { children: [[]] }))`.
- **Expected:** each rejects with `Error('rag putNode: children
  required/invalid')`; `listNodes()` is `[]`.

### F3. A child has an invalid `type` (§5.7 3)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'span', content: 'x'
  }] }))`; `putNode(makeNode('n2', { children: [{ type: 'bogus', content: 'x'
  }] }))`; `putNode(makeNode('n3', { children: [{ type: 42, content: 'x' }]
  }))`.
- **Expected:** each rejects with `Error('rag putNode: children
  required/invalid')` — a `span` type, an unknown type, and a non-string type
  are all rejected (A5); `listNodes()` is `[]`.

### F4. A child has a missing or non-string `content` (§5.7 4)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'strong' }] }))`;
  `putNode(makeNode('n2', { children: [{ type: 'strong', content: 42 }] }))`.
- **Expected:** each rejects with `Error('rag putNode: children
  required/invalid')`; `listNodes()` is `[]`.

### F5. A child has a null/array/non-object `props` (§5.7 5)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'a', content: 'x',
  props: null }] }))`; `putNode(makeNode('n2', { children: [{ type: 'a',
  content: 'x', props: [] }] }))`; `putNode(makeNode('n3', { children: [{
  type: 'a', content: 'x', props: 'href' }] }))`.
- **Expected:** each rejects with `Error('rag putNode: children
  required/invalid')`; `listNodes()` is `[]`.

### F6. A child's `props` contains a dangerous key (§5.7 6)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode(makeNode('n1', { children: [{ type: 'a', content: 'x',
  props: { __proto__: {} } }] }))`; `putNode(makeNode('n2', { children: [{
  type: 'a', content: 'x', props: { constructor: {} } }] }))`;
  `putNode(makeNode('n3', { children: [{ type: 'a', content: 'x', props: {
  prototype: {} } }] }))`.
- **Expected:** each rejects with `Error('rag putNode: children
  required/invalid')` — the prototype-pollution guard (A4); `listNodes()` is
  `[]`.

### F7. A persisted record with a malformed `children` array at boot (§5.7 7)
- **Setup:** a temp-file JSON store at `file` authored with a node `n1` whose
  `children` is `[{ type: 'span', content: 'x' }]` and `hash: newNodeHash(n1)`.
- **Ops:** boot a store from `file`.
- **Expected:** `status().corrupt === false`; `status().loadedNodes` does NOT
  include `n1`; `status().quarantined` does NOT include `n1`;
  `getNode('n1')` is `undefined` (the record is SKIPPED, never loaded — A2).

### F8. A persisted record whose `children` was tampered at boot (§5.7 8)
- **Setup:** a temp-file JSON store at `file` authored with a node `n1` whose
  `children` is `[{ type: 'strong', content: 'bold' }]` but whose `hash` was
  computed WITHOUT `children` (`oldNodeHash` — the pre-Unit-M format, i.e. the
  `children` was added/tampered without a hash update).
- **Ops:** boot a store from `file`.
- **Expected:** `status().quarantined` includes `n1`; `status().loadedNodes`
  does NOT include `n1`; `getNode('n1')` is `undefined` (the hash-verified
  source discipline — A1).

### F9. A journal content entry with a malformed `children` snapshot at boot (§5.7 9)
- **Setup:** a temp-file JSON store at `file` authored with a `content` journal
  entry whose `before.children` is `[{ type: 'span', content: 'x' }]` (a
  malformed snapshot).
- **Ops:** boot a store from `file`.
- **Expected:** `status().corrupt === false`; `store.journal()` is `[]` (the
  entry is SKIPPED — the `isContentSnapshot` validator rejects it).

### F10. A journal structural entry carrying a node with a malformed `children` array at boot (§5.7 10)
- **Setup:** a temp-file JSON store at `file` authored with a `structural`
  journal entry whose `op` is `{ op: 'node-add', node: badNode }` where
  `badNode.children` is `[{ type: 'span', content: 'x' }]`.
- **Ops:** boot a store from `file`.
- **Expected:** `status().corrupt === false`; `store.journal()` is `[]` (the
  entry is SKIPPED — the `isRagNode` validator rejects it).

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `children` field present on `RagNode` (§5.6 1) | ✅ PASS |
| H2 | `RagNodeChildType` closed union (§5.6 2) | ✅ PASS |
| H3 | Node create with `children` (§5.6 3) | ✅ PASS |
| H4 | Node update changing `children` (§5.6 4) | ✅ PASS |
| H5 | Node WITHOUT `children` (plain-text, v1 default) (§5.6 5) | ✅ PASS |
| H6 | Empty `children` array (§5.6 6) | ✅ PASS |
| H7 | `children` with `props` (§5.6 7) | ✅ PASS |
| H8 | Hash covers `children` (§5.6 8) | ✅ PASS |
| H9 | Additive load (existing record without `children`) (§5.6 9) | ✅ PASS |
| H10 | Round-trip with `children` (§5.6 10) | ✅ PASS |
| H11 | Journal content undo/redo with `children` (§5.6 11) | ✅ PASS |
| H12 | Deep-copy on read (§5.6 12) | ✅ PASS |
| F1 | `children` is a non-array (§5.7 1) | ✅ PASS |
| F2 | A child is a non-object (§5.7 2) | ✅ PASS |
| F3 | A child has an invalid `type` (§5.7 3) | ✅ PASS |
| F4 | A child has a missing or non-string `content` (§5.7 4) | ✅ PASS |
| F5 | A child has a null/array/non-object `props` (§5.7 5) | ✅ PASS |
| F6 | A child's `props` contains a dangerous key (§5.7 6) | ✅ PASS |
| F7 | Persisted record with a malformed `children` array at boot (§5.7 7) | ✅ PASS |
| F8 | Persisted record whose `children` was tampered at boot (§5.7 8) | ✅ PASS |
| F9 | Journal content entry with a malformed `children` snapshot at boot (§5.7 9) | ✅ PASS |
| F10 | Journal structural entry with a malformed `children` node at boot (§5.7 10) | ✅ PASS |

**Run summary:** 22 scenarios — 22 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-m-children-field.md` §5.6/§5.7 (plus the §5.2/§5.3 hash and
  additive rules, the §5.4 validation rules, the §5.5 journal rules, and the
  §3a adversarial pins A1–A5) passed against the live `src/main/rag-store.ts`.
  The `children` field is present and optional (§5.6 1/5), the closed
  `RagNodeChildType` union accepts exactly `strong`/`em`/`a`/`img` and rejects
  `span` (§5.6 2, §5.7 3), `nodeSource` covers `children` in the fixed field
  order so a `children` change → a new hash (§5.6 4/8), the store-format load
  is additive (existing records without `children` boot clean, §5.6 5/9), a
  record with `children` round-trips (§5.6 10), the journal content snapshot
  carries before/after `children` and undo/redo restores them (§5.6 4/11),
  `children` is deep-copied on read (§5.6 12), and every malformed/tampered
  `children` shape is rejected at write (throw) and skipped/quarantined at boot
  (§5.7 1–10). No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H8 (hash covers `children`).** The two-store comparison (same node, only
  the `children` field differs) is the direct node-testable proxy for the
  §5.2 "a `children` change → a new hash" claim — the on-disk hashes must
  differ.
- **H9 (additive load).** The pre-Unit-M file is authored with `oldNodeHash`
  (the pre-Unit-M `nodeSource` order, no `children`) so the post-Unit-M store
  re-derives the SAME hash — the ADDITIVE guarantee (§5.2/§5.3).
- **F8 (tampered `children`).** The stored hash is authored with `oldNodeHash`
  while the node carries a `children` array — the `children` was added without
  a hash update, so the boot re-verification must quarantine it (A1).
- **F7/F9/F10 (malformed at boot).** The malformed `children` shapes are
  authored with a `newNodeHash` (so the record is NOT quarantined for a hash
  mismatch) — the SKIP must come from `validateNodeShape`/`isContentSnapshot`/
  `isRagNode`, not from the hash check (A2).
