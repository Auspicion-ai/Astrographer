# Unit Q — Retrieval Indexing of Inline `children` Text: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-q-retrieval-children-indexing.md` ONLY — no implementation
  reading of `src/main/retrieval.ts`).
- **Source contract:** `docs/specs/unit-q-retrieval-children-indexing.md` §5.6
  (the 20 happy-path states) + §5.7 (the 5 fail-states) + §5.1 (the `nodeText`
  helper rules) + §5.2 (the index-builder rules) + §5.3 (the markdown-renderer
  rules) + §5.4/§5.5 (the `place`/`retrieve`/`createRetrieval` coverage) + §3a
  (the adversarial pins A1–A6 the contract rides). Node shapes constructed per
  `docs/specs/unit-m-children-field.md` §5.1 (the `RagNode`/`RagNodeChild`/
  `RagNodeChildType` types).
- **Modules under test:** `src/main/retrieval.ts` (the `nodeText` helper, the
  three index builders `createLexicalIndex`/`updateLexicalIndex`/
  `addToLexicalIndex`, the `renderNode`/`renderInlineText` markdown renderer
  exercised through `assembleContext`, and the `place`/`retrieve`/
  `createRetrieval` coverage). Supporting module imported for fixtures (NOT the
  implementation under test): `src/main/rag-store.ts` (`createJsonRagStore` +
  the `RagNode`/`RagEdge` types — the store the `assembleContext`/`retrieve`/
  `createRetrieval` scenarios run against).
- **Harness:** a temporary vitest file (removed after the run) importing the
  live module via `import { nodeText, createLexicalIndex, updateLexicalIndex,
  addToLexicalIndex, removeFromLexicalIndex, createLexicalEmbedder,
  assembleContext, retrieve, createRetrieval } from
  '../src/main/retrieval.js'`, executed with `npx vitest run`. The store is
  exercised through the real `createJsonRagStore` factory against a temp-file
  JSON store. The embedder-dependent functions (`score`/`place`/`retrieve`/
  `RetrievalEngine.query`) are ASYNC (Unit F amendment) — the scenarios `await`
  them.
- **Run:** 25 scenarios — 25 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.6 Happy-path states (20)

Fixture helpers: `makeNode(id, overrides)` = a snapshot node
`{ id, type: 'p', content: 'content-<id>', ownedNodeIds: [], createdAt,
updatedAt, ...overrides }`. A valid `RagNodeChild` is
`{ type: 'strong'|'em'|'a'|'img', content: string, props? }` (Unit M §5.1).
`makeStore(nodes)` = a fresh temp-file JSON store with the given nodes
`putNode`'d.

### H1. `nodeText` — node WITHOUT `children` (§5.6 1)
- **Setup:** `n = makeNode('n1', { content: 'Hello world' })`.
- **Ops:** `nodeText(n)`.
- **Expected:** `'Hello world'` (content unchanged — the `?? []` yields an empty
  child list; the single-element join returns `content`).

### H2. `nodeText` — empty `children` array (§5.6 2)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [] })`.
- **Ops:** `nodeText(n)`.
- **Expected:** `'Hello'` (content unchanged — the empty array contributes
  nothing).

### H3. `nodeText` — children with content (§5.6 3)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`.
- **Ops:** `nodeText(n)`.
- **Expected:** `'Hello world'` (space-joined, in order).

### H4. `nodeText` — multiple children in order (§5.6 4)
- **Setup:** `n = makeNode('n1', { content: 'A', children: [{ type: 'strong',
  content: 'B' }, { type: 'em', content: 'C' }] })`.
- **Ops:** `nodeText(n)`.
- **Expected:** `'A B C'` (each child's content appended in array order,
  space-joined).

### H5. `nodeText` — child with empty content (§5.6 5)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: '' }] })`.
- **Ops:** `nodeText(n)`.
- **Expected:** `'Hello'` (the empty child is dropped by the `filter`; it
  contributes nothing and introduces no spurious word boundary — A3).

### H6. `nodeText` — empty content + children (§5.6 6)
- **Setup:** `n = makeNode('n1', { content: '', children: [{ type: 'strong',
  content: 'bold' }] })`.
- **Ops:** `nodeText(n)`.
- **Expected:** `'bold'` (empty `content` is dropped; the children's content is
  returned).

### H7. `createLexicalIndex` indexes inline-child text (§5.6 7)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`.
- **Ops:** `index = createLexicalIndex([n])`; read `index.termFrequencies` for
  `n1`; `embedder = createLexicalEmbedder(index)`; `await embedder.score('world',
  [n])`.
- **Expected:** the node's `termFrequencies` include `'hello'` AND `'world'`
  (each count 1); a query `'world'` gives `n1` a score > 0 (the owning node
  matches — a query for inline-child text matches the owning node).

### H8. `updateLexicalIndex` re-indexes inline-child text (§5.6 8)
- **Setup:** `n1 = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`; `index = createLexicalIndex([n1])`.
- **Ops:** `n2 = makeNode('n1', { content: 'Hello', children: [{ type: 'strong',
  content: 'moon' }] })`; `updateLexicalIndex(index, n2)`.
- **Expected:** the node's TF drops `'world'` and gains `'moon'`; DF recomputed
  (`documentFrequencies.get('moon') === 1`, `documentFrequencies.get('world')`
  undefined) — a `children` edit re-tokenizes `nodeText(node)` exactly like a
  `content` edit.

### H9. `addToLexicalIndex` indexes inline-child text (§5.6 9)
- **Setup:** `index = createLexicalIndex([])`.
- **Ops:** `n = makeNode('n1', { content: 'Hello', children: [{ type: 'strong',
  content: 'world' }] })`; `addToLexicalIndex(index, n)`.
- **Expected:** the node's TF includes `'hello'` AND `'world'`; DF incremented
  (`documentFrequencies.get('world') === 1`); `documentCount` incremented
  (`=== 1`).

### H10. `renderNode` — `strong` child (§5.6 10)
- **Setup:** `n = makeNode('n1', { content: 'Hello ', children: [{ type:
  'strong', content: 'world' }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the assembled markdown contains `'Hello **world**'` (the `p`
  node renders content + the `strong` child's `**…**` markdown).

### H11. `renderNode` — `em` child (§5.6 11)
- **Setup:** `n = makeNode('n1', { content: '', children: [{ type: 'em',
  content: 'note' }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown contains `'*note*'`.

### H12. `renderNode` — `a` child (§5.6 12)
- **Setup:** `n = makeNode('n1', { content: '', children: [{ type: 'a',
  content: 'link', props: { href: 'https://x' } }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown contains `'[link](https://x)'`.

### H13. `renderNode` — `img` child (§5.6 13)
- **Setup:** `n = makeNode('n1', { content: '', children: [{ type: 'img',
  content: 'alt', props: { src: 'pic.png' } }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown contains `'![alt](pic.png)'` (the child's `content`
  is the alt text).

### H14. `renderNode` — node WITHOUT `children` (§5.6 14)
- **Setup:** `n = makeNode('n1', { content: 'Hello' })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown is `'Hello'` (byte-identical to the Unit E output —
  A4).

### H15. `renderNode` — `a`/`img` with missing `props` (§5.6 15)
- **Setup:** `n = makeNode('n1', { content: '', children: [{ type: 'a', content:
  'text' }, { type: 'img', content: 'alt' }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown contains `'[text]()'` and `'![alt]()'` (a missing
  `props`/`href`/`src` renders the empty-URL form — NO throw, A5).

### H16. `place` automatically covered (§5.6 16)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`; `index = createLexicalIndex([n])`;
  `embedder = createLexicalEmbedder(index)`.
- **Ops:** `await embedder.place('world', [n], [])`.
- **Expected:** `{ ok: true, targetNodeId: 'n1', ... }` — a new section whose
  content matches text in an inline child of an existing node → `place` returns
  that node as the placement target (the index now covers the inline child).

### H17. `retrieve` returns the owning node (§5.6 17)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`; `makeStore([n])`; `index =
  createLexicalIndex([n])`; `embedder = createLexicalEmbedder(index)`.
- **Ops:** `await retrieve(store, embedder, index, 'world', {})`.
- **Expected:** `n1` appears in `ranked` (score > 0, not filtered by the score-0
  drop) and in `context` — a query matching inline-child text returns the owning
  node.

### H18. `createRetrieval` maintains the index over inline children (§5.6 18)
- **Setup:** `n1 = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`; `makeStore([n1])`; `index =
  createLexicalIndex([n1])`; `embedder = createLexicalEmbedder(index)`; `engine
  = createRetrieval(store, embedder)`.
- **Ops:** `n2 = makeNode('n1', { content: 'Hello', children: [{ type: 'strong',
  content: 'moon' }] })`; `await store.putNode(n2)`; `engine.onStoreChanged(
  'content', ['n1'], [])`; `await engine.query('moon', {})`.
- **Expected:** `n1` appears in `ranked` (score > 0) — a `children` edit routed
  through `onStoreChanged` reconciles the node's inline-child tokens (via
  `updateLexicalIndex`/`addToLexicalIndex`).

### H19. `renderNode` — empty-content child dropped (§5.6 19, F1 regression)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: '' }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown is `'Hello'` and does NOT contain `'****'` — the
  empty-content child is SKIPPED (no `****`/`**`/`[]()`/`![]()` markers,
  consistent with `nodeText`'s empty-string filter).

### H20. `renderNode` — non-string `href`/`src` coerced to empty URL (§5.6 20, F2 regression)
- **Setup:** `n = makeNode('n1', { content: '', children: [{ type: 'a', content:
  'text', props: { href: {} } }] })`; `makeStore([n])`.
- **Ops:** `assembleContext(store, [{ nodeId: 'n1', score: 1 }], { maxNodes: 50,
  maxDepth: 3 })`.
- **Expected:** the markdown contains `'[text]()'` and does NOT contain
  `'[object Object]'` — a non-string `href`/`src` is coerced to the empty-URL
  form (no garbage).

---

## B. §5.7 Fail-states (5)

### F1. `nodeText(null)` / `nodeText(undefined)` (§5.7 1)
- **Setup:** none.
- **Ops:** `nodeText(null)`; `nodeText(undefined)`.
- **Expected:** each throws `Error('nodeText: node required')`.

### F2. `createLexicalIndex` null/undefined `nodes` (§5.7 2)
- **Setup:** none.
- **Ops:** `createLexicalIndex(null)`; `createLexicalIndex(undefined)`.
- **Expected:** each throws `Error('createLexicalIndex: nodes required')`
  (UNCHANGED from Unit E §5.1).

### F3. `updateLexicalIndex`/`addToLexicalIndex` null/undefined `index` or `node` (§5.7 3)
- **Setup:** `n = makeNode('n1', { content: 'x' })`; `index =
  createLexicalIndex([n])`.
- **Ops:** `updateLexicalIndex(null, n)`; `updateLexicalIndex(undefined, n)`;
  `updateLexicalIndex(index, null)`; `addToLexicalIndex(null, n)`; `addToLexicalIndex(index, null)`.
- **Expected:** each throws `Error('lexical index: index/node required')`
  (UNCHANGED from Unit E §5.1).

### F4. `removeFromLexicalIndex` null/undefined `index` or non-string `nodeId` (§5.7 4)
- **Setup:** `n = makeNode('n1', { content: 'x' })`; `index =
  createLexicalIndex([n])`.
- **Ops:** `removeFromLexicalIndex(null, 'n1')`;
  `removeFromLexicalIndex(undefined, 'n1')`;
  `removeFromLexicalIndex(index, 42)`.
- **Expected:** each throws `Error('lexical index: index/nodeId required')`
  (UNCHANGED from Unit E §5.1).

### F5. Out-of-contract inputs are NOT fail-states (§5.7 5)
- **Setup:** `n = makeNode('n1', { content: 'Hello', children: [{ type:
  'strong', content: 'world' }] })`.
- **Ops:** `nodeText(n)`.
- **Expected:** NO throw is asserted for a malformed node (non-string `content`,
  non-array `children`, invalid child `type`) — these are unreachable through
  the store (Unit M §5.4) and `nodeText`/`renderInlineText` assume a valid
  `RagNode` and do NOT re-validate. The scenario confirms a valid node works
  (`nodeText(n) === 'Hello world'`). This is a negative-contract confirmation,
  not a throw assertion.

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `nodeText` — node WITHOUT `children` (§5.6 1) | ✅ PASS |
| H2 | `nodeText` — empty `children` array (§5.6 2) | ✅ PASS |
| H3 | `nodeText` — children with content (§5.6 3) | ✅ PASS |
| H4 | `nodeText` — multiple children in order (§5.6 4) | ✅ PASS |
| H5 | `nodeText` — child with empty content (§5.6 5) | ✅ PASS |
| H6 | `nodeText` — empty content + children (§5.6 6) | ✅ PASS |
| H7 | `createLexicalIndex` indexes inline-child text (§5.6 7) | ✅ PASS |
| H8 | `updateLexicalIndex` re-indexes inline-child text (§5.6 8) | ✅ PASS |
| H9 | `addToLexicalIndex` indexes inline-child text (§5.6 9) | ✅ PASS |
| H10 | `renderNode` — `strong` child (§5.6 10) | ✅ PASS |
| H11 | `renderNode` — `em` child (§5.6 11) | ✅ PASS |
| H12 | `renderNode` — `a` child (§5.6 12) | ✅ PASS |
| H13 | `renderNode` — `img` child (§5.6 13) | ✅ PASS |
| H14 | `renderNode` — node WITHOUT `children` (§5.6 14) | ✅ PASS |
| H15 | `renderNode` — `a`/`img` with missing `props` (§5.6 15) | ✅ PASS |
| H16 | `place` automatically covered (§5.6 16) | ✅ PASS |
| H17 | `retrieve` returns the owning node (§5.6 17) | ✅ PASS |
| H18 | `createRetrieval` maintains the index over inline children (§5.6 18) | ✅ PASS |
| H19 | `renderNode` — empty-content child dropped (§5.6 19, F1 regression) | ✅ PASS |
| H20 | `renderNode` — non-string `href`/`src` coerced to empty URL (§5.6 20, F2 regression) | ✅ PASS |
| F1 | `nodeText(null)`/`nodeText(undefined)` throws (§5.7 1) | ✅ PASS |
| F2 | `createLexicalIndex` null/undefined `nodes` throws (§5.7 2) | ✅ PASS |
| F3 | `update`/`add` null/undefined `index` or `node` throws (§5.7 3) | ✅ PASS |
| F4 | `removeFromLexicalIndex` null/undefined `index` or non-string `nodeId` throws (§5.7 4) | ✅ PASS |
| F5 | Out-of-contract inputs are NOT fail-states (§5.7 5) | ✅ PASS |

**Run summary:** 25 scenarios — 25 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-q-retrieval-children-indexing.md` §5.6/§5.7 (plus the §5.1
  `nodeText` rules, the §5.2 index-builder rules, the §5.3 markdown-renderer
  rules, the §5.4/§5.5 `place`/`retrieve`/`createRetrieval` coverage, and the
  §3a adversarial pins A1–A6) passed against the live `src/main/retrieval.ts`.
  `nodeText` returns content + inline-child content space-joined, dropping empty
  strings (§5.6 1–6); the three index builders tokenize `nodeText(node)` so a
  query for inline-child text matches the owning node (§5.6 7–9, 16–18);
  `renderNode`/`renderInlineText` render content + inline children with the
  pinned `strong`→`**…**`/`em`→`*…*`/`a`→`[…](href)`/`img`→`![alt](src)`
  markdown, a node WITHOUT `children` renders byte-identically, and a missing
  `props`/`href`/`src` renders the empty-URL form without throwing (§5.6 10–15);
  the F1/F2 adversarial regression scenarios confirm an empty-content child is
  dropped (no `****`/`**`/`[]()`/`![]()` markers) and a non-string `href`/`src`
  coerces to the empty-URL form (no `[object Object]` garbage) (§5.6 19–20);
  `place`/`retrieve`/`createRetrieval` are unchanged in shape and automatically
  covered (§5.6 16–18); and every documented fail-state throws the pinned error
  (§5.7 1–4), with the out-of-contract inputs correctly NOT asserted as throws
  (§5.7 5). No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H10–H15, H19–H20 (renderer).** `renderNode`/`renderInlineText` are
  module-private (used by `buildMarkdown`/`assembleContext`), so the renderer
  scenarios are exercised through the exported `assembleContext` against a real
  temp-file store with a single seed node — the assembled markdown is the
  rendered node. H19/H20 are the F1/F2 adversarial regression scenarios (an
  empty-content child is dropped; a non-string `href`/`src` coerces to the
  empty-URL form).
- **H16 (place).** `place` is exercised through the exported `createLexicalEmbedder`
  (the `Embedder` interface's `place`), which scores via the index — the
  automatic-coverage claim (§5.4) is confirmed by a new section whose content
  matches an inline child returning the owning node.
- **H17/H18 (retrieve/createRetrieval).** Both run against a real temp-file
  store; H18 routes a `children` edit through `onStoreChanged` (via `putNode` +
  `engine.onStoreChanged`) to confirm the incremental index reconciles the
  inline-child tokens.
- **F5 (out-of-contract).** Per §5.7 5, a TestWriter must NOT assert a throw for
  a malformed node — the scenario confirms the negative contract (a valid node
  works; no throw asserted), not a throw.
