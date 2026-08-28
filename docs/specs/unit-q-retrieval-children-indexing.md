# Spec — Unit Q: Retrieval Indexing of Inline `children` Text

- **Status:** SPEC (the RICH-TEXT-EDITING-GATE must-fix "retrieval indexing of
  inline `children` text"). Gate reference: `docs/decisions.md` row
  **RICH-TEXT-EDITING-GATE** (the resolved design: inline `strong`/`em`/`a`/`img`
  are held by a NEW `children` field on `RagNode`, NOT separate RAG nodes —
  preserves one-chunk-per-subtree). This unit makes the retrieval layer
  (`src/main/retrieval.ts`, Unit E) index and render the inline `children` text
  that Unit M landed on the data model. It does NOT implement the traversal
  disambiguation of inline vs doc-children (Unit R) or paste-time sanitization
  (Unit S) — the remaining RICH-TEXT-EDITING-GATE must-fix items.
- **Scope:** the retrieval module `src/main/retrieval.ts` — a new `nodeText`
  helper that returns a node's FULL searchable text (`content` + every inline
  child's `content`, in order), the three index builders
  (`createLexicalIndex`/`updateLexicalIndex`/`addToLexicalIndex`) tokenizing
  `nodeText(node)` instead of `node.content`, and the `renderNode` markdown
  renderer (used by `assembleContext`/`buildMarkdown`) rendering the node's full
  text (content + inline children) so the assembled context markdown includes
  inline-children text. The `place` semantic-placement function is automatically
  covered (it scores via the index); the `retrieve` entry point and
  `createRetrieval` engine are UNCHANGED in shape. This unit does NOT touch the
  store (`src/main/rag-store.ts` — Unit M owns the `children` field), does NOT
  change the `Embedder` interface, and does NOT change the traversal.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the amended
  `src/main/retrieval.ts` (the new `nodeText` helper + the three index builders
  + the `renderNode`/`renderInlineText` markdown renderer) from §5.6/§5.7 before
  any implementation.

---

## 1. What the proposal asks

The RICH-TEXT-EDITING-GATE resolved design holds inline `strong`/`em`/`a`/`img`
on a NEW `children` field on `RagNode` (Unit M landed that field). The retrieval
layer (Unit E) currently indexes and renders `node.content` ONLY — it is blind to
the inline `children` text. This unit closes that gap so a query for text that
lives in an inline child matches the owning node, and so the assembled context
markdown includes the inline-children text:

1. **A `nodeText(node)` helper** that returns a node's FULL searchable text =
   `content` + the `content` of every inline child (in order). It must handle a
   node WITHOUT `children` (returns just `content`), an empty `children` array,
   and children with empty content.
2. **`createLexicalIndex`, `updateLexicalIndex`, `addToLexicalIndex` index
   `nodeText(node)` instead of `node.content`** — so a query for text that lives
   in an inline child matches the owning node.
3. **`renderNode` (in `buildMarkdown`, used by `assembleContext`) renders the
   node's full text** (content + inline children) so the assembled context
   markdown includes inline-children text. The exact markdown rendering of each
   child type is pinned: `strong` → `**text**`, `em` → `*text*`, `a` →
   `[text](href)`, `img` → `![alt](src)`. A node WITHOUT `children` renders
   UNCHANGED from today.
4. **`place` (semantic placement) is automatically covered** because it scores
   via the index — confirm and pin this.
5. **`retrieve` and `createRetrieval` are UNCHANGED in shape** — they already
   route through the index.

## 2. Feasibility verdict

**Feasible — a purely additive, backward-compatible change to the already-landed
`src/main/retrieval.ts` (Unit E).** The retrieval module already has the exact
machinery this needs:

- **The index builders already tokenize a per-node string.** `createLexicalIndex`
  (§5.1), `updateLexicalIndex` (§5.1), and `addToLexicalIndex` (§5.1) each call
  `tokenize(node.content)`. Swapping `node.content` for `nodeText(node)` is a
  one-line change per builder; the tokenization, TF/DF bookkeeping, and
  `averageDocumentLength` recomputation are unchanged.
- **`renderNode` already renders a per-node string.** The `buildMarkdown`/
  `assembleContext` renderer (§5.4) switches on `node.type` and embeds
  `n.content`. Swapping `n.content` for a `renderInlineText(n)` helper (content +
  inline-children markdown) is a mechanical change; the line→node map and the
  assembly bounds are unchanged.
- **`place` and `retrieve`/`createRetrieval` need NO change.** `place` scores the
  new content against existing nodes via `score` → the index; `retrieve`/
  `createRetrieval` route through the same index. Once the index covers
  `nodeText`, all three are automatically covered.
- **The data model is already landed (Unit M).** `RagNode.children?:
  RagNodeChild[]` and the `RagNodeChild` type (§5.1 of `unit-m-children-field.md`)
  are the exact inputs `nodeText`/`renderInlineText` read. The store validates
  `children` at write and skips malformed records at boot (Unit M §5.4), so the
  retrieval layer can assume a valid `RagNode`.

No engine/foundation gap blocks this unit. The `children` field is
**project-specific** (the RAG data model is host-side, per `docs/decisions.md`
ENGINE-GAP-HANDOFF). No handoff item is opened by this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `nodeText(node)` full-searchable-text helper | Project-specific (the retrieval module) | Low cost; the single source of the node's searchable text (content + inline children). |
| The three index builders tokenize `nodeText(node)` | Project-specific | Low cost; a query for inline-child text matches the owning node. |
| `renderNode`/`renderInlineText` render content + inline children | Project-specific | Low cost; the assembled context markdown includes inline-children text. |
| `place`/`retrieve`/`createRetrieval` coverage (no change) | Project-specific | Zero cost; they route through the index, which now covers inline children. |

No engine gap. The traversal disambiguation of inline vs doc-children (Unit R)
and paste-time sanitization (Unit S) are LATER slices (the remaining
RICH-TEXT-EDITING-GATE must-fix items) — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — a node WITHOUT `children` indexes identically to today.** `nodeText`
  on a node with no `children` returns `content` unchanged, so
  `createLexicalIndex`/`updateLexicalIndex`/`addToLexicalIndex` produce the
  SAME term frequencies, document frequencies, and `averageDocumentLength` as
  the pre-Unit-Q code for a plain-text node. The adversarial pass must confirm
  a plain-text node's index contribution is byte-identical to the Unit E
  behavior.
- **A2 — a node with an EMPTY `children` array indexes identically to today.**
  `nodeText` on a node with `children: []` returns `content` unchanged (the
  empty array contributes nothing). The adversarial pass must confirm `children:
  []` and no `children` field produce the same index contribution.
- **A3 — a child with EMPTY content contributes nothing to `nodeText`.** A child
  whose `content` is `''` is dropped from the space-joined text; it does not
  introduce a spurious token or a spurious word boundary. The adversarial pass
  must confirm an empty-content child does not change the owning node's index
  contribution.
- **A4 — the markdown for a node WITHOUT `children` is byte-identical to
  today.** `renderInlineText` on a node with no `children` returns `content`
  unchanged, so `assembleContext`'s markdown and line→node map for a plain-text
  node are unchanged. The adversarial pass must confirm a plain-text node's
  rendered markdown is byte-identical to the Unit E output.
- **A5 — an `a`/`img` child with a MISSING `props` renders with an EMPTY
  `href`/`src` (no throw).** `a` → `[text]()`, `img` → `![alt]()`. The
  adversarial pass must confirm a missing `props` (or a missing `href`/`src`
  key) does NOT throw and renders the empty-URL form.
- **A6 — the `nodeText` space-join treats adjacent content/child text as
  separate words.** `nodeText` joins `content` and each child's `content` with a
  single space, so `content: 'Hello'` + a `strong` child `'world'` indexes as
  `'Hello world'` (tokens `['hello', 'world']`), NOT `'Helloworld'` (token
  `['helloworld']`). The adversarial pass must confirm the space-join preserves
  word boundaries for tokenization.

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-28, Unit Q):** all findings are HOST findings,
fixed + regression-tested in the same pass:

- **F1 (LOW) — `renderInlineText` did not drop empty-content children.** A
  `strong` child with `content: ''` rendered `****`, an `em` rendered `**`, an
  `a` rendered `[]()`, an `img` rendered `![]()` — the same node contributed
  nothing to the index (`nodeText` filters `s !== ''`) but emitted empty markers
  into the assembled context markdown. Reachable through the store (the store
  validates `content` is a string but does not reject empty). Fixed:
  `renderInlineText` now skips an empty-content child (`if (c.content === '')
  continue`), consistent with `nodeText`. Regression-tested.
- **F2 (LOW) — `a`/`img` child with a non-string `href`/`src` rendered
  garbage.** `renderInlineText` interpolated `c.props?.href ?? ''` directly, so
  `props: { href: {} }` rendered `[text]([object Object])`. Reachable through the
  store (the store validates `props` is a plain object but not the `href`/`src`
  value types). Fixed: `href`/`src` are coerced to string (`typeof v ===
  'string' ? v : ''`), so a non-string value renders the empty-URL form.
  Regression-tested.
- **F3–F7 (INFORMATIONAL, no fix):** whitespace-only child content is kept by
  `nodeText`'s `s !== ''` filter (harmless — whitespace is a token boundary);
  newline-bearing child content produces multi-line markdown (the line→node map
  stays consistent); markdown-significant child content can break out of the
  pinned rendering (the author's own trusted content, not a security boundary);
  `pre`/`code` nodes with inline children render inert markers inside the code
  fence (per-spec); the index does not make `a`/`img` `href`/`src` searchable
  (content-only indexing, per-spec). None require a fix.

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

- **Q1 — inline `strong`/`em`/`a`/`img` are held by a NEW `children` field on
  `RagNode`, NOT separate RAG nodes** (§5.1 of `unit-m-children-field.md`): the
  retrieval layer indexes and renders that field's text on the OWNING node —
  one-chunk-per-subtree preserved (a query for inline-child text matches the
  owning node, not a phantom separate node).
- **Q2 — the retrieval indexing of inline `children` text must-fix** (§5.1/§5.2):
  the index builders tokenize `nodeText(node)` (content + inline children), so a
  query for text that lives in an inline child matches the owning node.
- **Q3 — the assembled context markdown includes inline-children text** (§5.3):
  `renderNode` renders content + inline children, so the context markdown a
  downstream agent reads includes the inline formatting text.
- **Q4 — `place`/`retrieve`/`createRetrieval` are UNCHANGED in shape** (§5.4/
  §5.5): they route through the index, which now covers inline children.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins inline
  `strong`/`em`/`a`/`img` on a NEW `children` field on `RagNode` (not separate
  RAG nodes — preserves one-chunk-per-subtree). This unit lands the retrieval
  indexing of inline `children` text must-fix.
- **LEXICAL-FIRST-RETRIEVAL (consumed):** retrieval is lexical-first (BM25/tf-idf)
  behind an interface-swappable `Embedder`. The index is the single scoring
  surface; indexing `nodeText(node)` makes the inline-children text searchable
  through the SAME index with NO interface change.
- **INDEX-CONSISTENT-WITH-EDITS (consumed, Unit E §4):** the lexical index is
  maintained incrementally on store changes. Because the index builders now
  tokenize `nodeText(node)`, a `children` edit (via `setSubtree`, Unit O) that
  changes a node's inline text updates the node's term frequencies exactly like a
  `content` edit — the incremental machinery is unchanged.
- **DETERMINISTIC-RETRIEVAL (consumed, Unit E §4):** no network egress, no
  randomness. `nodeText` and `renderInlineText` are pure and deterministic; the
  same node → the same searchable text and the same markdown.
- **NODETEXT-SPACE-JOIN (NEW):** `nodeText` joins `content` and each child's
  `content` with a single space (after dropping empty strings). Inline children
  are word-level formatting in prose, so a space separator preserves word
  boundaries for tokenization (A6). This is the INDEXING text; it is distinct
  from the MARKDOWN rendering (below), which concatenates directly.
- **RENDER-DIRECT-CONCAT (NEW):** `renderInlineText` concatenates `content` and
  each child's markdown DIRECTLY (no auto-inserted separator). The `content`
  field carries the author's intended whitespace (the rich-text machinery, Unit
  O, writes content + children such that direct concatenation reproduces the
  original text). This is the MARKDOWN rendering; it is distinct from the
  indexing text (above).

## 5. The exhaustive contract

### 5.1 The `nodeText` helper

A new exported helper in `src/main/retrieval.ts` that returns a node's FULL
searchable text = `content` + the `content` of every inline child (in order).

```ts
// src/main/retrieval.ts — the new nodeText helper. Returns the node's FULL
// searchable text: content + the content of every inline child (in order).
// Pure + deterministic. Reads the Unit M `children?: RagNodeChild[]` field.
export function nodeText(node: RagNode): string {
  if (node === null || node === undefined) throw new Error('nodeText: node required')
  return [node.content, ...(node.children ?? []).map((c) => c.content)]
    .filter((s) => s !== '')
    .join(' ')
}
```

**`nodeText` rules (pinned):**

- **Signature:** `nodeText(node: RagNode): string`. Returns a string.
- **A node WITHOUT `children`** → returns `content` unchanged (the `?? []`
  yields an empty child list; the single-element `[content]` join returns
  `content`). Backward-compatible with the pre-Unit-Q behavior.
- **An EMPTY `children` array** (`children: []`) → returns `content` unchanged
  (the empty array contributes nothing).
- **Children with content** → each child's `content` is appended in array order,
  space-joined. `content: 'Hello'` + `children: [{ type: 'strong', content:
  'world' }]` → `'Hello world'`.
- **A child with EMPTY content** (`content: ''`) → dropped by the `filter`; it
  contributes nothing and does not introduce a spurious word boundary (A3).
- **Empty `content` + children** → returns the children's content. `content: ''`
  + `children: [{ type: 'strong', content: 'bold' }]` → `'bold'`.
- **The space-join** preserves word boundaries for tokenization (A6): adjacent
  content/child text is treated as separate words. `content: 'Hello'` + a child
  `'world'` → `'Hello world'` (tokens `['hello', 'world']`), NOT `'Helloworld'`.
- **Determinism:** the same node → the same string. Pure (no state, no I/O).
- **Assumes a valid `RagNode`:** `content` is a string and `children` is
  `RagNodeChild[] | undefined` per the Unit M store contract (§5.4 of
  `unit-m-children-field.md`). The store validates these at write and skips
  malformed records at boot, so a malformed node is OUT OF CONTRACT (see §5.7
  fail-state 5) — `nodeText` does not re-validate.

**Fail-state:**

- `nodeText(null)` / `nodeText(undefined)` → throws
  `Error('nodeText: node required')`.

### 5.2 The index builders tokenize `nodeText(node)`

`createLexicalIndex`, `updateLexicalIndex`, and `addToLexicalIndex` must index
`nodeText(node)` instead of `node.content`, so a query for text that lives in an
inline child matches the owning node.

**The amended index builders (pinned):**

```ts
// src/main/retrieval.ts — the three index builders. Each tokenizes
// nodeText(node) (content + inline children) instead of node.content.
// The TF/DF bookkeeping, documentCount, and averageDocumentLength recomputation
// are UNCHANGED from Unit E.

// createLexicalIndex (boot): tokenize nodeText(node) per node.
for (const node of nodes) {
  const tf = new Map<string, number>()
  for (const t of tokenize(nodeText(node))) tf.set(t, (tf.get(t) ?? 0) + 1)
  // ... unchanged TF/DF/documentCount/averageDocumentLength bookkeeping ...
}

// updateLexicalIndex (content/children edit): re-tokenize nodeText(node).
for (const t of tokenize(nodeText(node))) newTF.set(t, (newTF.get(t) ?? 0) + 1)
// ... unchanged DF increment/decrement + averageDocumentLength recomputation ...

// addToLexicalIndex (node add): tokenize nodeText(node).
for (const t of tokenize(nodeText(node))) tf.set(t, (tf.get(t) ?? 0) + 1)
// ... unchanged DF increment + documentCount increment + averageDocumentLength ...
```

**Index-builder rules (pinned):**

- **`createLexicalIndex(nodes)`** tokenizes `nodeText(node)` for each node
  (instead of `node.content`). `documentCount = nodes.length`;
  `averageDocumentLength = totalTokens / documentCount` (0 if empty), where
  `totalTokens` now includes inline-child tokens. A node whose inline children
  carry tokens contributes those tokens to the index.
- **`updateLexicalIndex(index, node)`** re-tokenizes `nodeText(node)` (instead of
  `node.content`). A `children` edit (via `setSubtree`, Unit O) that changes a
  node's inline text updates the node's term frequencies exactly like a `content`
  edit — the incremental machinery is unchanged (INDEX-CONSISTENT-WITH-EDITS).
- **`addToLexicalIndex(index, node)`** tokenizes `nodeText(node)` (instead of
  `node.content`).
- **`removeFromLexicalIndex(index, nodeId)`** is UNCHANGED — it removes a node's
  term frequencies by node id; it does not read node text.
- **A query for text that lives in an inline child matches the owning node:** the
  owning node's term frequencies now include the inline-child tokens, so a query
  containing those tokens gives the owning node a BM25 score > 0 (and it is NOT
  filtered by `retrieve`'s score-0 drop, §5.5).
- **Backward compatibility:** a plain-text node (no `children`) indexes
  identically to the pre-Unit-Q code (A1); a node with `children: []` indexes
  identically too (A2).

**Fail-states (UNCHANGED from Unit E §5.1):**

- `createLexicalIndex` with null/undefined `nodes` → throws
  `Error('createLexicalIndex: nodes required')`.
- `updateLexicalIndex`/`addToLexicalIndex` with a null/undefined `index` or
  `node` → throws `Error('lexical index: index/node required')`.
- `removeFromLexicalIndex` with a null/undefined `index` or a non-string `nodeId`
  → throws `Error('lexical index: index/nodeId required')`.

### 5.3 The markdown renderer (`renderNode`/`renderInlineText`)

`renderNode` (in `buildMarkdown`, used by `assembleContext`) must render the
node's full text (content + inline children) so the assembled context markdown
includes inline-children text. A node WITHOUT `children` renders UNCHANGED from
today.

**The amended renderer (pinned):**

```ts
// src/main/retrieval.ts — the amended renderer. A new module-private
// renderInlineText helper produces the node's full inline markdown (content +
// inline children). renderNode embeds renderInlineText(n) instead of n.content.
// A node WITHOUT children renders byte-identically to the Unit E output.

function renderInlineText(n: RagNode): string {
  let text = n.content
  for (const c of n.children ?? []) {
    // F1 — skip empty-content children (consistent with nodeText's empty-string
    // filter): a `strong` child with content '' must not render `****`, an `em`
    // `**`, an `a` `[]()`, an `img` `![]()`.
    if (c.content === '') continue
    switch (c.type) {
      case 'strong': text += `**${c.content}**`; break
      case 'em':     text += `*${c.content}*`;   break
      // F2 — coerce href/src to string: a non-string value (e.g. `{}`) must not
      // coerce to garbage like `[object Object]`; it renders the empty-URL form.
      case 'a':      text += `[${c.content}](${typeof c.props?.href === 'string' ? c.props.href : ''})`; break
      case 'img':    text += `![${c.content}](${typeof c.props?.src === 'string' ? c.props.src : ''})`; break
    }
  }
  return text
}

function renderNode(n: RagNode): string {
  switch (n.type) {
    case 'h1': return `# ${renderInlineText(n)}`
    case 'h2': return `## ${renderInlineText(n)}`
    case 'h3': return `### ${renderInlineText(n)}`
    case 'h4': return `#### ${renderInlineText(n)}`
    case 'h5': return `##### ${renderInlineText(n)}`
    case 'h6': return `###### ${renderInlineText(n)}`
    case 'li': return `- ${renderInlineText(n)}`
    case 'blockquote': return `> ${renderInlineText(n)}`
    case 'pre': return `\`\`\`\n${renderInlineText(n)}\n\`\`\``
    case 'code': return `\`${renderInlineText(n)}\``
    default: return renderInlineText(n)
  }
}
```

**Markdown-rendering rules (pinned):**

- **`renderInlineText(n)`** returns `n.content` + the markdown of each inline
  child, in array order, concatenated DIRECTLY (no auto-inserted separator —
  RENDER-DIRECT-CONCAT; the `content` field carries the author's intended
  whitespace).
- **Child-type markdown (pinned):**
  - `strong` → `**${c.content}**`
  - `em` → `*${c.content}*`
  - `a` → `[${c.content}](${c.props?.href ?? ''})`
  - `img` → `![${c.content}](${c.props?.src ?? ''})` (the child's `content` is
    the alt text)
- **A node WITHOUT `children`** → `renderInlineText` returns `content` unchanged,
  so `renderNode` produces byte-identical markdown to the Unit E output (A4).
- **An `a`/`img` child with a MISSING `props` (or a missing `href`/`src` key)**
  → renders with an EMPTY URL: `a` → `[text]()`, `img` → `![alt]()` — NO throw
  (A5).
- **An EMPTY-content child is SKIPPED (F1):** `renderInlineText` drops a child
  whose `content` is `''` (`if (c.content === '') continue`), consistent with
  `nodeText`'s empty-string filter — no `****`/`**`/`[]()`/`![]()` markers leak
  into the assembled markdown.
- **A NON-STRING `href`/`src` is coerced to the empty-URL form (F2):**
  `renderInlineText` renders `typeof c.props?.href === 'string' ? c.props.href :
  ''` (and the same for `src`), so a non-string value (e.g. `{}`) renders
  `[text]()`/`![alt]()` — no `[object Object]` garbage.
- **`buildMarkdown`/`assembleContext` are UNCHANGED** in structure: they call
  `renderNode(n)` per context node, split on `\n`, and build the line→node map.
  Only the per-node rendered string changes (it now includes inline children).
- **Determinism:** the same node → the same markdown. Pure (no state, no I/O).
- **Assumes a valid `RagNode`:** `children` is `RagNodeChild[] | undefined` and
  each child's `type` is one of the closed `RagNodeChildType` union per the Unit
  M store contract. A child with an invalid type is OUT OF CONTRACT (the store
  never produces one — see §5.7 fail-state 5); the `switch` has no matching case
  and the child contributes no markdown.

### 5.4 `place` (semantic placement) — automatically covered

The `place` function (the `Embedder`'s semantic-placement decision) is
automatically covered by the index change — NO code change to `place`.

**`place` coverage (pinned):**

- `place(content, nodes, edges)` scores the new section's `content` against all
  existing nodes via `score(content, nodes)` (Unit E §5.2), which reads the
  index's `termFrequencies`/`documentFrequencies`/`documentCount`/
  `averageDocumentLength`.
- Because the index now covers `nodeText(node)` (content + inline children), a
  new section whose content matches text in an inline child of an existing node
  gives that node a score > 0 → `place` returns it as the placement target.
- **No change to `place`'s signature, return shape, or throw pattern.** The
  `PlacementDecision` union, the `PLACEMENT_MIN_SCORE` threshold, the
  `empty-content`/`no-match` reasons, and the edge-kind selection are UNCHANGED
  from Unit E §5.2.
- **The `content` argument to `place` is the NEW section's plain text** (not a
  node with children), so `place` itself never calls `nodeText` — it only
  benefits from the index covering the EXISTING nodes' inline children.

### 5.5 `retrieve` and `createRetrieval` — unchanged in shape

The `retrieve` entry point and the `createRetrieval` engine are UNCHANGED in
shape — they already route through the index.

**`retrieve` (pinned):**

- Signature, return shape (`RetrievalResult`), defaults (`k=5`, `maxNodes=50`,
  `maxDepth=3`), the score-0 `ranked` filter, and the throw patterns are UNCHANGED
  from Unit E §5.5.
- It calls `selectTopK` → `embedder.score` → the index. Because the index now
  covers `nodeText(node)`, a query for inline-child text gives the owning node a
  score > 0, so it survives the score-0 filter and appears in `ranked`/`context`.

**`createRetrieval` (pinned):**

- Signature, return shape (`RetrievalEngine`), construction
  (`createLexicalIndex(store.listNodes())`), `query`, and `onStoreChanged` are
  UNCHANGED from Unit E §5.6.
- `onStoreChanged` reconciles the index via `updateLexicalIndex`/`addToLexicalIndex`/
  `removeFromLexicalIndex` — which now tokenize `nodeText(node)`, so a `children`
  edit (via `setSubtree`, Unit O) is reconciled exactly like a `content` edit.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **`nodeText` — node WITHOUT `children`:** `nodeText({ id, type: 'p', content:
   'Hello world', ownedNodeIds: [], createdAt, updatedAt })` → `'Hello world'`
   (content unchanged).
2. **`nodeText` — empty `children` array:** `nodeText({ ..., content: 'Hello',
   children: [], ... })` → `'Hello'` (content unchanged).
3. **`nodeText` — children with content:** `nodeText({ ..., content: 'Hello',
   children: [{ type: 'strong', content: 'world' }], ... })` → `'Hello world'`
   (space-joined, in order).
4. **`nodeText` — multiple children in order:** `nodeText({ ..., content: 'A',
   children: [{ type: 'strong', content: 'B' }, { type: 'em', content: 'C' }],
   ... })` → `'A B C'`.
5. **`nodeText` — child with empty content:** `nodeText({ ..., content: 'Hello',
   children: [{ type: 'strong', content: '' }], ... })` → `'Hello'` (the empty
   child contributes nothing).
6. **`nodeText` — empty content + children:** `nodeText({ ..., content: '',
   children: [{ type: 'strong', content: 'bold' }], ... })` → `'bold'`.
7. **`createLexicalIndex` indexes inline-child text:** a node with
   `content: 'Hello'` + a `strong` child `'world'` → the index's
   `termFrequencies` for that node include `'hello'` AND `'world'`; a query
   `'world'` matches the owning node (score > 0).
8. **`updateLexicalIndex` re-indexes inline-child text:** a node's `children`
   change from `[{ type: 'strong', content: 'world' }]` to `[{ type: 'strong',
   content: 'moon' }]` → the node's TF drops `'world'` and gains `'moon'`; DF and
   `averageDocumentLength` recomputed.
9. **`addToLexicalIndex` indexes inline-child text:** a new node with inline
   children → its TF includes the inline-child tokens; DF incremented;
   `documentCount` incremented.
10. **`renderNode` — `strong` child:** `assembleContext` on a `p` node with
    `content: 'Hello '` + a `strong` child `'world'` → the markdown contains
    `'Hello **world**'`.
11. **`renderNode` — `em` child:** a `p` node with an `em` child `'note'` → the
    markdown contains `'*note*'`.
12. **`renderNode` — `a` child:** a `p` node with an `a` child `'link'` and
    `props: { href: 'https://x' }` → the markdown contains `'[link](https://x)'`.
13. **`renderNode` — `img` child:** a `p` node with an `img` child `'alt'` and
    `props: { src: 'pic.png' }` → the markdown contains `'![alt](pic.png)'`.
14. **`renderNode` — node WITHOUT `children`:** a plain-text `p` node with
    `content: 'Hello'` → the markdown is `'Hello'` (byte-identical to the Unit E
    output).
15. **`renderNode` — `a`/`img` with missing `props`:** an `a` child with no
    `props` → the markdown contains `'[text]()'`; an `img` child with no `props`
    → the markdown contains `'![alt]()'` (NO throw).
16. **`place` automatically covered:** a new section whose content matches text
    in an inline child of an existing node → `place` returns that node as the
    placement target (`{ ok: true, targetNodeId, ... }`).
17. **`retrieve` returns the owning node:** a query matching inline-child text →
    the owning node appears in `ranked` (score > 0, not filtered) and `context`.
18. **`createRetrieval` maintains the index over inline children:** a `children`
    edit routed through `onStoreChanged` → the index reconciles the node's
    inline-child tokens (via `updateLexicalIndex`/`addToLexicalIndex`).
19. **`renderNode` — empty-content child dropped (F1 regression):** a `p` node
    with `content: 'Hello'` + a `strong` child `content: ''` → the markdown is
    `'Hello'` (the empty-content child is SKIPPED — no `****`/`**`/`[]()`/`![]()`
    markers, consistent with `nodeText`'s empty-string filter).
20. **`renderNode` — non-string `href`/`src` coerced to the empty-URL form (F2
    regression):** an `a` child with `props: { href: {} }` → the markdown
    contains `'[text]()'` (no `[object Object]` garbage); an `img` child with
    `props: { src: {} }` → the markdown contains `'![alt]()'`.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`nodeText(null)` / `nodeText(undefined)`** → throws
   `Error('nodeText: node required')`.
2. **`createLexicalIndex` null/undefined `nodes`** → throws
   `Error('createLexicalIndex: nodes required')` (UNCHANGED from Unit E §5.1).
3. **`updateLexicalIndex`/`addToLexicalIndex` null/undefined `index` or `node`**
   → throws `Error('lexical index: index/node required')` (UNCHANGED from Unit E
   §5.1).
4. **`removeFromLexicalIndex` null/undefined `index` or non-string `nodeId`** →
   throws `Error('lexical index: index/nodeId required')` (UNCHANGED from Unit E
   §5.1).
5. **Out-of-contract inputs are NOT fail-states of this unit:** a malformed node
   (non-string `content`, a non-array `children`, a child with an invalid `type`)
   is never produced by the store (Unit M §5.4 validates `children` at write and
   skips malformed records at boot). `nodeText`/`renderInlineText` assume a valid
   `RagNode` and do NOT re-validate. A TestWriter must NOT assert a throw for
   these — they are unreachable through the store. (A non-array `children` would
   cause an unhandled `.map` TypeError in `nodeText`; this is an unhandled crash
   on an out-of-contract input, NOT a documented fail-state.)

### 5.8 Census / numeric claims

- **New exported function:** 1 — `nodeText(node: RagNode): string`.
- **New module-private helper:** 1 — `renderInlineText(n: RagNode): string`.
- **Index-builder sites changed:** 3 — `createLexicalIndex`, `updateLexicalIndex`,
  `addToLexicalIndex` (each now tokenizes `nodeText(node)` instead of
  `node.content`).
- **Markdown-renderer sites changed:** 1 — `renderNode` (each case now embeds
  `renderInlineText(n)` instead of `n.content`).
- **Child-type markdown renderings:** 4 — `strong` → `**…**`, `em` → `*…*`,
  `a` → `[…](href)`, `img` → `![alt](src)`.
- **`nodeText` join:** a single space (`' '`), after dropping empty strings.
- **`renderInlineText` join:** direct concatenation (no separator).
- **Functions UNCHANGED in shape:** 3 — `place`, `retrieve`, `createRetrieval`
  (they route through the index, which now covers inline children).
- **`removeFromLexicalIndex`:** UNCHANGED (removes by node id; does not read node
  text).
- **`Embedder` interface:** UNCHANGED (no signature change to `score`/`place`/
  `onStoreChanged`).
- **`RagNode`/`RagNodeChild`/`RagNodeChildType`:** UNCHANGED (Unit M owns the data
  model; this unit only reads `children`).
- **`RagNodeType` union members:** 18 — UNCHANGED (Unit M §5.8; no `span` added).

### 5.9 Cross-references

- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNode.children?:
  RagNodeChild[]` field + the `RagNodeChild`/`RagNodeChildType` types this unit
  reads), §5.4 (the write-time `children` validation — the store never produces a
  malformed node, so `nodeText`/`renderInlineText` assume a valid `RagNode`),
  §5.6/§5.7 (the happy-path/fail-state format this spec mirrors).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.1 (the index builders this unit
  amends — `createLexicalIndex`/`updateLexicalIndex`/`addToLexicalIndex` now
  tokenize `nodeText(node)`), §5.2 (the `Embedder` interface + `place` — unchanged
  in shape, automatically covered), §5.4 (the `renderNode`/`buildMarkdown`/
  `assembleContext` renderer this unit amends), §5.5 (the `retrieve` entry point —
  unchanged in shape), §5.6 (the `createRetrieval` engine — unchanged in shape),
  §5.8/§5.9 (the happy-path/fail-state format this spec mirrors).
- Unit O: `docs/specs/unit-o-edit-ops.md` §5.3 (the `setSubtree` op that replaces
  a node's inline `children` — a `children` edit is reconciled by the index via
  `updateLexicalIndex`/`addToLexicalIndex`, which now tokenize `nodeText(node)`).
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  this unit pins: inline `strong`/`em`/`a`/`img` on a NEW `children` field, NOT
  separate RAG nodes; the "retrieval indexing of inline `children` text"
  must-fix).
- Decisions: `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL** (the index is
  the single scoring surface — indexing `nodeText(node)` makes inline-children
  text searchable with no interface change), **CHILDREN-ADDITIVE-STORE-FORMAT**,
  **CHILDREN-HASH-SOURCE** (the Unit M data-model decisions this unit consumes).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — traversal disambiguation of inline vs doc-children (Unit R), paste-time
  sanitization (Unit S) — LATER slices, NOT this unit).
- Host patterns: `src/main/retrieval.ts` (the `nodeText` helper, the three index
  builders, the `renderNode`/`renderInlineText` renderer — the amendment sites),
  `src/main/rag-store.ts` (the `RagNode`/`RagNodeChild` types this unit reads —
  Unit M).
