# Unit R — Traversal Disambiguation of Inline vs Doc-Children: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-r-traversal-inline-children.md` ONLY — no implementation
  reading of `src/main/traversal.ts`).
- **Source contract:** `docs/specs/unit-r-traversal-inline-children.md` §5.6
  (the 15 happy-path states) + §5.7 (the 8 fail-states) + §5.1 (the
  inline-children rendering in `buildSubtree` — the element shape, the authored
  ids, the ordering) + §5.2 (the disambiguation table) + §5.3
  (`collectSubtreeIds`) + §5.4 (`assignSubtreeRanges`) + §5.5 (the UNCHANGED
  textarea overlay + `rebuildBackRefs`) + §3a (the adversarial pins A1–A7 and
  the post-green findings F1–F6 the contract pins).
- **Modules under test:** `src/main/traversal.ts` (`buildTraversal` →
  `buildSubtree` — the inline-children rendering + the authored ids + the
  ordering; `collectSubtreeIds` — the inline-children collection;
  `assignSubtreeRanges` — the inline-children non-recursion; `rebuildBackRefs` —
  unchanged, routes through `buildTraversal`). Supporting modules imported for
  fixtures (NOT the implementation under test): `src/main/rag-store.ts`
  (`createJsonRagStore` — the live store the traversal reads), the
  `provident-ssr` types, `src/shared/dom-shim.js` (`installShim`/`mountEl`),
  `src/renderer/runtime.js` (`Runtime` — the render path used to assert the
  inline children appear in the markdown).
- **Harness:** a standalone scenario runner (bundled with esbuild, executed
  with node) that constructs a real `createJsonRagStore` against a temp-file
  JSON store, seeds the Unit R fixtures, and calls the live `buildTraversal` /
  `rebuildBackRefs`. Each scenario asserts the spec's expected output against
  the live result.
- **Run:** 27 scenarios — 27 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.6 Happy-path states (15)

Fixture helpers: `makeNode(id, overrides)` = a snapshot node
`{ id, type: 'p', content: 'content-<id>', ownedNodeIds: [], createdAt,
updatedAt, ...overrides }`; `makeEdge(id, kind, source, target, overrides)` = a
snapshot edge. A valid `RagNodeChild` is
`{ type: 'strong'|'em'|'a'|'img', content: string, props? }`. `seedRichDoc`
seeds a single-section document where `rich` is the ONLY section (the doc-head)
carrying the given inline `children` — single-section so `backRefs.size === 1`
and `lineMap.ranges.length === 1` (the disambiguation tests assert the inline
children do NOT add entries/ranges).

### H1. Inline-children rendering happy (§5.6 1)
- **Setup:** a fresh temp-file JSON store; `seedRichDoc(store, makeNode('rich',
  { children: [{ type: 'strong', content: 'bold' }] }))`.
- **Ops:** `buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })`.
- **Expected:** the `rich` subtree root's FIRST child is a
  `{ type: 'strong', content: 'bold', props: { id: 'inline-rich-0',
  'data-rag-node-id': 'rich' } }` element (in addition to the textarea overlay
  and the doc-children).

### H2. All four inline child types (§5.6 2)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type:
  'strong', content: 'b' }, { type: 'em', content: 'i' }, { type: 'a', content:
  'l', props: { href: 'https://x' } }, { type: 'img', content: '', props: { src:
  'x.png', alt: 'x' } }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the first four children are `strong`/`em`/`a`/`img` (same types
  as the `RagNodeChildType`), with `content` and the `props` merged — the `a`
  element carries `href: 'https://x'`; the `img` element carries `src: 'x.png'`
  and `alt: 'x'`.

### H3. Authored ids (§5.6 3)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }, { type: 'em', content: 'i' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the inline children's authored ids are `inline-rich-0` and
  `inline-rich-1` (0-based index within the node's `children` array), NOT
  `rag-`-prefixed (A1), and distinct from the textarea's `textarea-rich` id
  (A2).

### H4. Ordering (§5.6 4)
- **Setup:** a document with `head → rich → end` and `rich` carrying one inline
  `strong` child AND one `li1` doc-child (`doc-child` edge `order: 0`).
- **Ops:** `buildTraversal(...)`.
- **Expected:** the `rich` subtree root's `children` array is ordered
  `['inline-rich-0', 'textarea-rich', 'rag-li1']` — [inline children, textarea
  overlay, doc-children subtrees].

### H5. Node WITHOUT inline children (plain-text, the v1 default) (§5.6 5)
- **Setup:** `seedRichDoc(store, makeNode('rich'))` (no `children` field).
- **Ops:** `buildTraversal(...)`.
- **Expected:** NO inline children rendered (A4); the subtree root's `children`
  array is `['textarea-rich']` (the pre-Unit-R shape).

### H6. Empty `children` array (§5.6 6)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** NO inline children rendered (A3 — equivalent to no inline
  children); the subtree root's `children` array is `['textarea-rich']`.

### H7. Disambiguation — inline children NOT in `materialized` (§5.6 7)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** `backRefs.size === 1` (one entry for `rich`); no backRefs key is
  `inline-`-prefixed (the inline children are NOT added to `materialized`).

### H8. Disambiguation — inline children get NO backRefs entry (§5.6 8)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** `backRefs.size === 1`; `backRefs.get('rich')!.length >= 3` (the
  node's entry INCLUDES the inline children's minted node ids — root + inline +
  textarea); there is NO separate entry keyed by an inline child's id.

### H9. Disambiguation — inline children get NO lineMap range (§5.6 9)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'bold' }] }))`.
- **Ops:** `buildTraversal(...)`; render via `Runtime.loadEnvelope`.
- **Expected:** `lineMap.ranges.length === 1`; the single range's `ragNodeId` is
  `rich` (no range keyed by an inline child's id); the inline content `bold`
  appears in the rendered markdown (part of the node's OWN lines).

### H10. `collectSubtreeIds` collects inline children (§5.6 10)
- **Setup:** two stores — `with` (`rich` with one inline `strong` child) and
  `without` (same `rich`, plain text).
- **Ops:** `buildTraversal(...)` on both.
- **Expected:** `withResult.backRefs.get('rich')!.length > withoutResult.backRefs.get('rich')!.length` — the inline children's minted node ids are collected into the node's OWN subtree (they are NOT `rag-`-prefixed, so they are descended into).

### H11. `assignSubtreeRanges` does NOT recurse inline children (§5.6 11)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'bold' }] }))`.
- **Ops:** `buildTraversal(...)`; render via `Runtime.loadEnvelope`.
- **Expected:** `lineMap.ranges.length === 1` with `ragNodeId === 'rich'` (no
  separate range minted for an inline child); the inline content `bold` is part
  of the node's OWN markdown lines.

### H12. Doc-children still disambiguated (§5.6 12)
- **Setup:** a document with `head → rich → end` and `rich` carrying one inline
  `strong` child AND one `li1` doc-child.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the `rich` subtree root's children are ordered
  `['inline-rich-0', 'textarea-rich', 'rag-li1']`; `backRefs` has one entry for
  `rich` (including the inline, excluding `li1`) + one for `li1`; `lineMap` has
  one range for `rich` + one for `li1` (the doc-children are separate RAG
  subtree roots).

### H13. Textarea overlay UNCHANGED (§5.6 13)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the `rich` subtree root still has a `textarea` child with
  `id: 'textarea-rich'`, `value: 'content-rich'` (bound to `node.content`),
  `data-rag-node-id: 'rich'`, NO `readOnly` prop, and the
  `rag-textarea-input`/`rag-textarea-blur` handlers (Unit L §5.1 — UNCHANGED).

### H14. `rebuildBackRefs` unchanged (§5.6 14)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `rebuildBackRefs(store.listNodes(), store.listEdges(), 'main')`.
- **Expected:** the returned map has a `rich` entry whose length `>= 3` (the
  inline children's minted node ids are in the owning node's entry — inherited
  via `buildTraversal`).

### H15. Fallback path (§5.6 15)
- **Setup:** a document with a `next-section` cycle (`head → rich → head`) that
  forces the family-pre-order fallback (`nestDocChildren: false`); `rich`
  carries one inline `strong` child.
- **Ops:** `buildTraversal(...)` (must NOT throw).
- **Expected:** the `rich` subtree root's FIRST child is still the inline
  `strong` element with `id: 'inline-rich-0'` (the inline-children rendering is
  independent of `nestDocChildren`).

---

## B. §5.7 Fail-states (8)

### F1. An inline child authored id is NOT `rag-`-prefixed (§5.7 1, A1)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the inline children's authored ids are NOT `rag-`-prefixed (a
  `rag-`-prefixed child would be treated as a doc-child subtree root by
  `collectSubtreeIds`/`assignSubtreeRanges`).

### F2. An inline child authored id is distinct from the textarea's `textarea-<ragId>` id (§5.7 2, A2)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the inline child's authored id is NOT `textarea-rich` (no
  collision with the textarea overlay's id).

### F3. An inline child is NOT added to `materialized` (§5.7 3, A6)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** no backRefs key and no lineMap range is `inline-`-prefixed (the
  `materialized` set contains ONLY RAG subtree roots, never an inline child).

### F4. An inline child does NOT mint a backRefs entry (§5.7 4, A6)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** `backRefs.size === 1`; no backRefs key is `inline-`-prefixed (one
  entry per RAG object, never an inline child).

### F5. An inline child does NOT mint a lineMap range (§5.7 5, A6/A7)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** `lineMap.ranges.length === 1`; no range's `ragNodeId` is
  `inline-`-prefixed (one range per RAG object, never an inline child).

### F6. `collectSubtreeIds` does NOT descend into a `rag-`-prefixed inline child (§5.7 6, A1)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b' }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the inline children are collected into the node's OWN subtree —
  `backRefs.get('rich')!.length >= 3` (root + inline + textarea), with no
  separate entry keyed by an inline child's id.

### F7. `assignSubtreeRanges` does NOT recurse into a `rag-`-prefixed inline child (§5.7 7, A1)
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'bold' }] }))`.
- **Ops:** `buildTraversal(...)`; render via `Runtime.loadEnvelope`.
- **Expected:** `lineMap.ranges.length === 1` with `ragNodeId === 'rich'` (no
  spurious range minted for an inline child); the inline content `bold` is part
  of the node's OWN markdown lines.

### F8. A malformed `children` array is rejected at write (store-level, Unit M) (§5.7 8)
- **Setup:** a fresh temp-file JSON store.
- **Ops:** `putNode` with a non-array `children`; with a `span` child; with a
  non-string child `content`.
- **Expected:** each `putNode` rejects (throws) — the store's write-time
  validation (Unit M §5.4) rejects a malformed `children` array at write, so a
  malformed `children` array never reaches `buildSubtree` (the traversal reads
  only validated nodes from the store).

---

## C. §3a Adversarial pins (4)

### A-F1/F2. Multi-parent duplicate RAG node with inline children renders the inline children in EACH copy (duplicate inline ids — DOCUMENTED KNOWN BEHAVIOR)
- **Setup:** a document where `shared` (with one inline `strong` child) has TWO
  `parent-child` parents (`a`, `b`).
- **Ops:** `buildTraversal(...)`.
- **Expected:** two duplicate subtrees for `shared` (one per parent); EACH copy
  renders the inline child with the SAME authored id `inline-shared-0` and
  `data-rag-node-id: 'shared'` (duplicate ids across the envelope — mirrors the
  `rag-shared` subtree-root collision; DOCUMENTED KNOWN BEHAVIOR, no functional
  consequence — inline children are never looked up by id).

### A-F3. A node with MANY inline children (20) → all inline ids distinct + ordered, and the node's lineMap range still covers all their markdown lines
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: 20 strong
  children `bold-0`…`bold-19` }))`.
- **Ops:** `buildTraversal(...)`; render via `Runtime.loadEnvelope`.
- **Expected:** the inline ids are `inline-rich-0`…`inline-rich-19` (distinct,
  ordered); the node's lineMap range still covers all their markdown lines (each
  `bold-i` line index is within `[startLine, endLine)`).

### A-F4. An inline child whose own props carry `id: rag-foo` + `data-rag-node-id: other` → the authored `inline-<ragId>-<index>` id and the owning ragId take precedence
- **Setup:** `seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong',
  content: 'b', props: { id: 'rag-foo', 'data-rag-node-id': 'other' } }] }))`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the inline child's authored id is `inline-rich-0` and its
  `data-rag-node-id` is `rich` (the authored id + owning ragId take precedence
  over the child's own props — the A5 merge discipline); the disambiguation is
  NOT broken (the child's `id: 'rag-foo'` does NOT make it a doc-child subtree
  root — `backRefs.size === 1`, one `rich` range).

### A-F6. Fallback path (nestDocChildren: false) with a node carrying BOTH inline children AND doc-children → inline children still render, doc-children become separate sections
- **Setup:** a document with a `next-section` cycle (forces the family-pre-order
  fallback); `rich` carries one inline `strong` child AND one `li1` doc-child.
- **Ops:** `buildTraversal(...)` (must NOT throw).
- **Expected:** the `rich` subtree root's FIRST child is still the inline
  `strong` element (`id: 'inline-rich-0'`); the doc-child `li1` becomes a
  SEPARATE section (its own ContentPayload with root id `rag-li1`).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Inline-children rendering happy (§5.6 1) | ✅ PASS |
| H2 | All four inline child types (§5.6 2) | ✅ PASS |
| H3 | Authored ids `inline-<ragId>-<index>` (§5.6 3) | ✅ PASS |
| H4 | Ordering [inline, textarea, doc-children] (§5.6 4) | ✅ PASS |
| H5 | Node WITHOUT inline children (children: undefined) (§5.6 5) | ✅ PASS |
| H6 | Empty `children` array (§5.6 6) | ✅ PASS |
| H7 | Inline children NOT in `materialized` (§5.6 7) | ✅ PASS |
| H8 | Inline children get NO backRefs entry (§5.6 8) | ✅ PASS |
| H9 | Inline children get NO lineMap range (§5.6 9) | ✅ PASS |
| H10 | `collectSubtreeIds` collects inline children (§5.6 10) | ✅ PASS |
| H11 | `assignSubtreeRanges` does NOT recurse inline children (§5.6 11) | ✅ PASS |
| H12 | Doc-children still disambiguated (§5.6 12) | ✅ PASS |
| H13 | Textarea overlay UNCHANGED (§5.6 13) | ✅ PASS |
| H14 | `rebuildBackRefs` unchanged (§5.6 14) | ✅ PASS |
| H15 | Fallback path — inline children STILL rendered (§5.6 15) | ✅ PASS |
| F1 | Inline child id NOT `rag-`-prefixed (§5.7 1, A1) | ✅ PASS |
| F2 | Inline child id distinct from textarea id (§5.7 2, A2) | ✅ PASS |
| F3 | Inline child NOT added to `materialized` (§5.7 3, A6) | ✅ PASS |
| F4 | Inline child does NOT mint a backRefs entry (§5.7 4, A6) | ✅ PASS |
| F5 | Inline child does NOT mint a lineMap range (§5.7 5, A6/A7) | ✅ PASS |
| F6 | `collectSubtreeIds` does NOT descend into a `rag-`-prefixed inline child (§5.7 6, A1) | ✅ PASS |
| F7 | `assignSubtreeRanges` does NOT recurse into a `rag-`-prefixed inline child (§5.7 7, A1) | ✅ PASS |
| F8 | Malformed `children` rejected at write (store-level, Unit M) (§5.7 8) | ✅ PASS |
| A-F1/F2 | Multi-parent duplicate renders inline children in EACH copy (duplicate ids — known behavior) (§3a) | ✅ PASS |
| A-F3 | 20 inline children — distinct + ordered ids, lineMap range covers all lines (§3a) | ✅ PASS |
| A-F4 | Inline child's own `id`/`data-rag-node-id` props do NOT break the disambiguation (§3a) | ✅ PASS |
| A-F6 | Fallback path with BOTH inline + doc-children — inline still render, doc-children separate (§3a) | ✅ PASS |

**Run summary:** 27 scenarios — 27 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-r-traversal-inline-children.md` §5.6/§5.7 (plus the §5.1
  rendering rules, the §5.2 disambiguation table, the §5.3/§5.4
  `collectSubtreeIds`/`assignSubtreeRanges` behavior, the §5.5 UNCHANGED textarea
  + `rebuildBackRefs`, and the §3a adversarial pins A1–A7/F1–F6) passed against
  the live `src/main/traversal.ts`. `buildSubtree` renders the node's inline
  `children` as child elements of the subtree root with the authored id
  `inline-<ragId>-<index>` (§5.6 1–3), ordered [inline children, textarea
  overlay, doc-children subtrees] (§5.6 4), a node with `children: undefined` or
  `children: []` renders NO inline children (§5.6 5/6), the inline children are
  NOT in `materialized`/backRefs/lineMap but their minted node ids ARE in the
  owning node's entry and their lines ARE in the owning node's range (§5.6
  7–11), doc-children remain separate RAG subtree roots (§5.6 12), the textarea
  overlay is UNCHANGED (§5.6 13), `rebuildBackRefs` routes through
  `buildTraversal` (§5.6 14), the fallback path still renders the inline
  children (§5.6 15), and every fail-state pin holds (§5.7 1–8, §3a). No
  spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H8/H10/F6 (backRefs entry growth).** The `>= 3` bound (root + inline +
  textarea for one inline child) is the direct node-testable proxy for the §5.3
  "the inline children's minted node ids are part of the owning node's entry"
  claim — the entry must grow by the inline children's minted ids.
- **H9/H11/F7 (lineMap).** The single-range assertion (one range for the RAG
  node, none keyed by an inline child) plus the markdown-contains check is the
  direct proxy for the §5.4 "the inline children are part of the node's OWN
  lines" claim.
- **H14 (rebuildBackRefs).** The `rebuildBackRefs(nodes, edges, 'main')` call
  shape is taken from the §5.5 "routes through `buildTraversal`" contract; the
  entry-growth assertion confirms the inline children are inherited into the
  owning node's entry.
- **F8 (malformed `children`).** This is a store-level fail-state (Unit M §5.4)
  — the traversal reads only validated nodes, so the assertion is that the store
  rejects the malformed shapes at write (the traversal never sees them).
- **A-F1/F2 (duplicate inline ids).** The duplicate-id behavior is asserted as
  PRESENT (each copy renders `inline-shared-0`), not as an error — the §3a
  documented known behavior (mirrors the `rag-<id>` subtree-root collision; no
  functional consequence).
