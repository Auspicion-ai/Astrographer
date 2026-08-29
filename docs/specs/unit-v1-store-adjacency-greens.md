# Unit V1 — Store Adjacency: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-v1-store-adjacency.md`
  ONLY — §5.1–§5.7 + §3a adversarial resolutions; no implementation reading).
- **Source contract:** `docs/specs/unit-v1-store-adjacency.md` §5.1–§5.7, §3a.
- **Module under test:** `src/main/rag-store.ts` (`createJsonRagStore`,
  `createSnapshotStore`, `buildAdjacencyIndex`, the five `*Index` query helpers).
- **Method discipline:** the JSON store's mutating methods
  (`putNode`/`removeNode`/`putEdge`/`removeEdge`/`undo`/`redo`/`applyBatch`) are
  ASYNC — awaited. The adjacency methods (`edgesFrom`/`edgesTo`/`edgesByKind`/
  `edgesForDocument`/`docHeadForDocument`) and the shared-core helpers are
  synchronous. `createSnapshotStore`'s mutating methods throw synchronously.
- **Store path:** a unique temp path per scenario (`os.tmpdir()` + unique dir).
- **Fixture (spec §5.6 happy-path 2):** a doc-flow spine scoped to `'doc'`
  (`doc-head` e2, `next-section` e3, `doc-end` e4) + a global `doc-child` edge
  e5 (no `documentIds`) + two `parent-child` edges e1/e6. Store order = array
  order. Node ids: `head`, `a`, `b`, `c`, `d`.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. Shared PURE adjacency core (§5.1 / §5.6 happy 1–8 / §5.7 fail 1–5)

### A1. `buildAdjacencyIndex([])` → all-empty maps, no throw
- **Ops:** `buildAdjacencyIndex([])`.
- **Expected:** `from`/`to`/`kind`/`document`/`docHead` all empty (size 0), no throw.

### A2. `buildAdjacencyIndex(populated)` → maps populated in one O(E) pass
- **Ops:** `buildAdjacencyIndex(FIXTURE_EDGES)`.
- **Expected:** `from['a']` = `[e1,e3,e5]`, `from['b']` = `[e4,e6]`,
  `from['head']` = `[e2]`; `to['d']` = `[e5,e6]`, `to['c']` = `[e1]`;
  `kind['parent-child']` = `[e1,e6]`, `kind['doc-child']` = `[e5]`,
  `kind['doc-head']` = `[e2]`; `document['doc']` = `[e2,e3,e4,e5]` (doc-flow
  scoped by `documentIds` + ALL `doc-child`); `docHead['doc']` = `'head'`.

### A3. `edgesFromIndex` happy
- **Ops:** `edgesFromIndex(index, 'a')`.
- **Expected:** `[e1,e3,e5]` (store order).

### A4. `edgesToIndex` happy
- **Ops:** `edgesToIndex(index, 'd')`.
- **Expected:** `[e5,e6]`.

### A5. `edgesByKindIndex` happy
- **Ops:** `edgesByKindIndex(index, 'doc-child')` and `(index, 'parent-child')`.
- **Expected:** `[e5]` and `[e1,e6]` respectively.

### A6. `edgesForDocumentIndex` happy
- **Ops:** `edgesForDocumentIndex(index, 'doc')`.
- **Expected:** `[e2,e3,e4,e5]` (doc-flow scoped by `documentIds` + the global
  `doc-child` edge).

### A7. `docHeadForDocumentIndex` happy
- **Ops:** `docHeadForDocumentIndex(index, 'doc')`.
- **Expected:** `'head'`.

### A8. `docHeadForDocumentIndex` no head
- **Ops:** `docHeadForDocumentIndex(index, 'ghost')`.
- **Expected:** `undefined`.

### A9. Multiple-heads rule (first-wins, deterministic)
- **Setup:** two `doc-head` edges for `'doc'` (`head1`→`a`, `head2`→`b`).
- **Ops:** `docHeadForDocumentIndex(index, 'doc')`.
- **Expected:** `'head1'` (the FIRST in store order).

### A10. Unmatched id → empty array (no throw)
- **Ops:** `edgesFromIndex(index,'ghost')`, `edgesToIndex(index,'ghost')`,
  `edgesByKindIndex(index,'crosslink')`, `edgesForDocumentIndex(index,'ghost')`.
- **Expected:** each `[]`.

### A11. `buildAdjacencyIndex` null/undefined/non-array edges
- **Ops:** `buildAdjacencyIndex(null)`, `(undefined)`, `(42)`.
- **Expected:** each throws `Error('buildAdjacencyIndex: edges must be an array')`.

### A12. null/undefined index → throws `<helper>: index required`
- **Ops:** each helper with a `null` index.
- **Expected:** `edgesFromIndex: index required`, `edgesToIndex: index required`,
  `edgesByKindIndex: index required`, `edgesForDocumentIndex: index required`,
  `docHeadForDocumentIndex: index required`.

### A13. non-string/empty-string arg → throws `<helper>: <arg> must be a non-empty string`
- **Ops:** `edgesFromIndex(index,'')`/`(index,null)`, `edgesToIndex(index,'')`/
  `(index,null)`, `edgesForDocumentIndex(index,'')`/`(index,null)`,
  `docHeadForDocumentIndex(index,'')`/`(index,null)`.
- **Expected:** `edgesFromIndex: source must be a non-empty string`,
  `edgesToIndex: target must be a non-empty string`,
  `edgesForDocumentIndex: documentId must be a non-empty string`,
  `docHeadForDocumentIndex: documentId must be a non-empty string`.

### A14. `edgesByKindIndex` invalid kind
- **Ops:** `edgesByKindIndex(index, 'bogus')`.
- **Expected:** throws `Error('edgesByKindIndex: invalid kind')`.

---

## B. JSON store adjacency methods (§5.2 / §5.6 happy 9–11 / §5.7 fail 6–7)

### B1. `edgesFrom` happy — fresh shallow copies, store order
- **Setup:** seeded JSON store.
- **Ops:** `edgesFrom('a')`.
- **Expected:** `[e1,e3,e5]`; two calls return distinct arrays; mutating a
  returned edge's `order` does not affect the store (shallow-copy discipline).

### B2. `edgesTo` happy
- **Ops:** `edgesTo('d')`.
- **Expected:** `[e5,e6]`.

### B3. `edgesByKind` happy
- **Ops:** `edgesByKind('doc-child')`, `edgesByKind('parent-child')`.
- **Expected:** `[e5]`, `[e1,e6]`.

### B4. `edgesForDocument` happy
- **Ops:** `edgesForDocument('doc')`.
- **Expected:** `[e2,e3,e4,e5]`.

### B5. `docHeadForDocument` happy
- **Ops:** `docHeadForDocument('doc')`.
- **Expected:** `'head'`.

### B6. Unmatched id → empty array / undefined (no throw)
- **Ops:** `edgesFrom('ghost')`, `edgesTo('ghost')`, `edgesByKind('crosslink')`,
  `edgesForDocument('ghost')`, `docHeadForDocument('ghost')`.
- **Expected:** `[]`, `[]`, `[]`, `[]`, `undefined`.

### B7. non-string/empty-string arg → throws `rag <method>: <arg> must be a non-empty string`
- **Ops:** `edgesFrom('')`/`(null)`, `edgesTo('')`/`(null)`,
  `edgesForDocument('')`/`(null)`, `docHeadForDocument('')`/`(null)`.
- **Expected:** `rag edgesFrom: source must be a non-empty string`,
  `rag edgesTo: target must be a non-empty string`,
  `rag edgesForDocument: documentId must be a non-empty string`,
  `rag docHeadForDocument: documentId must be a non-empty string`.

### B8. `edgesByKind` invalid kind
- **Ops:** `edgesByKind('bogus')`.
- **Expected:** throws `Error('rag edgesByKind: invalid kind')`.

---

## C. Lazy O(E) index + invalidation across all 6 mutation paths (§5.3 / §5.6 happy 14)

### C1. `putEdge` invalidates
- **Setup:** store with `a`,`c`; `edgesFrom('a')` builds the index (empty).
- **Ops:** `await putEdge(e1 a→c)`; then `edgesFrom('a')`.
- **Expected:** `[e1]` (index rebuilt after the mutation).

### C2. `removeEdge` invalidates
- **Setup:** store with `a`,`c`, edge `e1`; `edgesFrom('a')` = `[e1]`.
- **Ops:** `await removeEdge('e1')`; then `edgesFrom('a')`.
- **Expected:** `[]`.

### C3. `removeNode` cascade invalidates
- **Setup:** store with `a`,`c`, edge `e1` (a→c); `edgesFrom('a')` = `[e1]`.
- **Ops:** `await removeNode('a')`; then `edgesFrom('a')`, `edgesTo('c')`.
- **Expected:** `[]`, `[]` (the cascaded edge is dropped).

### C4. `applyBatch` invalidates
- **Setup:** store with `a`,`c`; `edgesFrom('a')` = `[]`.
- **Ops:** `await applyBatch([{op:'putEdge', edge:e1}])`; then `edgesFrom('a')`.
- **Expected:** `result.ok === true`; `edgesFrom('a')` = `[e1]`.

### C5. `undo` invalidates
- **Setup:** store with `a`,`c`, edge `e1`; `edgesFrom('a')` = `[e1]`.
- **Ops:** `await undo()` (undoes the edge-add); then `edgesFrom('a')`.
- **Expected:** `[]`.

### C6. `redo` invalidates
- **Setup:** store with `a`,`c`, edge `e1`; after `undo()` `edgesFrom('a')` = `[]`.
- **Ops:** `await redo()`; then `edgesFrom('a')`.
- **Expected:** `[e1]`.

---

## D. Quarantine exclusion (§5.3 / §5.6 happy 15)

### D1. A quarantined edge is NOT returned by any adjacency query
- **Setup:** store writes `a`,`c`, edge `e1` (doc-child); the on-disk edge is
  tampered (its `order` changed) WITHOUT updating the stored hash; a fresh store
  reloads from the file.
- **Ops:** `status()`, `listEdges()`, `edgesByKind('doc-child')`,
  `edgesFrom('a')`, `edgesTo('c')`, `edgesForDocument('doc')`.
- **Expected:** `status().quarantined` contains `e1`; `listEdges()` = `[]`;
  every adjacency query returns `[]` (the quarantined edge is excluded).

---

## E. `createSnapshotStore(nodes, edges)` read-only adapter (§5.4 / §5.6 happy 12–13 / §5.7 fail 8–9)

### E1. Parity (amendment 3) — identical results vs the JSON store
- **Setup:** a JSON store seeded with the fixture; a snapshot store over the
  same `listNodes()`/`listEdges()`.
- **Ops:** `edgesFrom('a')`, `edgesTo('d')`, `edgesByKind('doc-child')`,
  `edgesForDocument('doc')`, `docHeadForDocument('doc')` on both.
- **Expected:** the snapshot adapter returns IDENTICAL results to the JSON store
  (it delegates to the SAME pure functions).

### E2. Read methods behave as a read-only store
- **Setup:** snapshot over the fixture nodes/edges.
- **Ops:** `getNode('a')`/`getNode('ghost')`, `listNodes()`, `getEdge('e1')`/
  `getEdge('ghost')`, `listEdges()`, `status()`, `journal()`, `undoDepth()`,
  `redoDepth()`.
- **Expected:** `getNode('a')` defined (content `content-a`), `getNode('ghost')`
  undefined; `listNodes()` = the 5 fixture ids; `getEdge('e1')` defined
  (source `a`), `getEdge('ghost')` undefined; `listEdges()` = the 6 fixture ids;
  `status()` = `{ corrupt:false, quarantined:[], loadedNodes:<ids>,
  loadedEdges:<ids> }`; `journal()` = `[]`; `undoDepth()`/`redoDepth()` = `0`.

### E3. Empty nodes/edges → a valid empty adapter (no throw)
- **Ops:** `createSnapshotStore([], [])`; `listNodes()`, `listEdges()`,
  `status()`, `edgesFrom('a')`, `docHeadForDocument('doc')`.
- **Expected:** `[]`, `[]`, `{ corrupt:false, quarantined:[], loadedNodes:[],
  loadedEdges:[] }`, `[]`, `undefined`.

### E4. null/undefined/non-array nodes or edges → throws
- **Ops:** `createSnapshotStore(null,[])`, `(undefined,[])`, `(42,[])`,
  `([],null)`, `([],undefined)`, `([],42)`.
- **Expected:** each throws `Error('createSnapshotStore: nodes/edges must be arrays')`.

### E5. Mutating methods throw (fail-closed)
- **Ops:** `putNode`, `removeNode`, `putEdge`, `removeEdge`, `undo`, `redo`,
  `enqueue`, `applyBatch` on an empty snapshot.
- **Expected:** each throws `Error('createSnapshotStore: read-only')`.

---

## F. Adversarial resolutions (§3a: MED-1..LOW-6)

### F1. MED-1 — snapshot captures an immutable view
- **Setup:** snapshot over `[a,b]`/`[e1 doc-child]`; then the caller mutates the
  source arrays (`push c`, `push e2`, `e1.source='zzz'`).
- **Ops:** `listNodes()`, `listEdges()`, `getNode('c')`, `getEdge('e2')`,
  `edgesFrom('a')`, `edgesFrom('zzz')`, `edgesTo('b')`, `edgesTo('c')`,
  `edgesByKind('doc-child')`.
- **Expected:** the mutation is NOT reflected — `['a','b']`, `['e1']`,
  `undefined`, `undefined`, `['e1']`, `[]`, `['e1']`, `[]`, `['e1']` (read and
  adjacency methods stay consistent on the captured view).

### F2. MED-2 — duplicate `documentIds` are deduped (parity)
- **Setup:** a `doc-head` edge with `documentIds:['doc','doc']`.
- **Ops:** `buildAdjacencyIndex` → `document['doc']`, `docHead['doc']`; a JSON
  store and a snapshot adapter over the same raw edge → `edgesForDocument('doc')`.
- **Expected:** the edge appears ONCE in `document['doc']`; `docHead['doc']` =
  `'a'`; both stores return `['e1']` (identical — parity).

### F3. MED-3 — global `doc-child` scoping (documented limitation)
- **Setup:** edges `[doc-head e1 for 'doc', doc-child e2 (global)]`.
- **Ops:** `buildAdjacencyIndex` → `document['doc']`, `document['ghost']`.
- **Expected:** `document['doc']` = `[e1,e2]` (the global doc-child is scoped to
  a document in `docKeys`); `document['ghost']` is `undefined` (a document with
  no doc-flow edge is NOT in `docKeys`, so the global doc-child is not returned
  for it — documented limitation: a valid document always has a `doc-head`).

### F4. LOW-4 — throw-message parity between the two stores
- **Ops:** `edgesFrom('')`/`(null)`, `edgesTo('')`/`(null)`,
  `edgesForDocument('')`/`(null)`, `docHeadForDocument('')`/`(null)`,
  `edgesByKind('bogus')` on an empty snapshot.
- **Expected:** the snapshot adapter throws the `rag <method>` prefix messages
  (identical to the JSON store): `rag edgesFrom: source must be a non-empty
  string`, `rag edgesTo: target must be a non-empty string`, `rag
  edgesForDocument: documentId must be a non-empty string`, `rag
  docHeadForDocument: documentId must be a non-empty string`, `rag edgesByKind:
  invalid kind`.

### F5. LOW-5 — `docHeadForDocument` trusts its input (documented limitation)
- **Setup:** snapshot over `[a]` with a `doc-head` edge `ghost-head→a` for `'doc'`.
- **Ops:** `docHeadForDocument('doc')`, `getNode('ghost-head')`.
- **Expected:** `'ghost-head'` (the dangling source id is returned — the adapter
  is a read-only projection, not a validating store); `getNode('ghost-head')` is
  `undefined`.

### F6. LOW-6 — no-op mutations do not corrupt the adjacency index
- **Setup:** store with `a`,`b`, edge `e1`; `edgesFrom('a')` = `[e1]`.
- **Ops:** `await removeEdge('ghost')`, `await removeNode('ghost')`,
  `await applyBatch([])`; then `edgesFrom('a')`.
- **Expected:** after each no-op, `edgesFrom('a')` = `[e1]` (no correctness
  regression; the index stays correct).

---

## Run record

| # | Scenario | Result |
| --- | --- | --- |
| A1 | `buildAdjacencyIndex([])` all-empty | ✅ PASS |
| A2 | `buildAdjacencyIndex(populated)` | ✅ PASS |
| A3 | `edgesFromIndex` happy | ✅ PASS |
| A4 | `edgesToIndex` happy | ✅ PASS |
| A5 | `edgesByKindIndex` happy | ✅ PASS |
| A6 | `edgesForDocumentIndex` happy | ✅ PASS |
| A7 | `docHeadForDocumentIndex` happy | ✅ PASS |
| A8 | `docHeadForDocumentIndex` no head | ✅ PASS |
| A9 | Multiple-heads first-wins | ✅ PASS |
| A10 | Unmatched id → empty array | ✅ PASS |
| A11 | `buildAdjacencyIndex` bad edges throw | ✅ PASS |
| A12 | null index → `index required` | ✅ PASS |
| A13 | non-string arg → `must be a non-empty string` | ✅ PASS |
| A14 | `edgesByKindIndex` invalid kind | ✅ PASS |
| B1 | JSON `edgesFrom` happy (fresh copies) | ✅ PASS |
| B2 | JSON `edgesTo` happy | ✅ PASS |
| B3 | JSON `edgesByKind` happy | ✅ PASS |
| B4 | JSON `edgesForDocument` happy | ✅ PASS |
| B5 | JSON `docHeadForDocument` happy | ✅ PASS |
| B6 | JSON unmatched id → empty/undefined | ✅ PASS |
| B7 | JSON non-string arg → `rag <method>` throw | ✅ PASS |
| B8 | JSON `edgesByKind` invalid kind | ✅ PASS |
| C1 | `putEdge` invalidates | ✅ PASS |
| C2 | `removeEdge` invalidates | ✅ PASS |
| C3 | `removeNode` cascade invalidates | ✅ PASS |
| C4 | `applyBatch` invalidates | ✅ PASS |
| C5 | `undo` invalidates | ✅ PASS |
| C6 | `redo` invalidates | ✅ PASS |
| D1 | Quarantine exclusion | ✅ PASS |
| E1 | Snapshot parity (amendment 3) | ✅ PASS |
| E2 | Snapshot read methods | ✅ PASS |
| E3 | Snapshot empty adapter | ✅ PASS |
| E4 | Snapshot bad construction throws | ✅ PASS |
| E5 | Snapshot mutating methods fail-closed | ✅ PASS |
| F1 | MED-1 immutable snapshot view | ✅ PASS |
| F2 | MED-2 duplicate `documentIds` deduped | ✅ PASS |
| F3 | MED-3 global `doc-child` scoping | ✅ PASS |
| F4 | LOW-4 throw-message parity | ✅ PASS |
| F5 | LOW-5 `docHeadForDocument` trusts input | ✅ PASS |
| F6 | LOW-6 no-op mutations keep index correct | ✅ PASS |

**Run summary:** 40 scenarios — 40 pass, 0 fail.

### Findings

- **No spec-vs-impl drift and no regression found.** Every scenario derived from
  `docs/specs/unit-v1-store-adjacency.md` §5.1–§5.7 + §3a passed against the live
  module. The 5 adjacency methods on the JSON store, the lazy O(E) index +
  invalidation across all 6 mutation paths, the quarantine exclusion,
  `createSnapshotStore` (read methods + fail-closed mutating methods + parity
  with the JSON store), and all six adversarial resolutions (MED-1..LOW-6) behave
  exactly as the spec documents.
- **Amendment 4 (the two inline adapters replaced) is NOT exercised here** — it
  is pinned in the spec (§5.5) but the replacement lands in Unit V2/V3. This
  battery covers the `createSnapshotStore` surface that Unit V2 will consume; the
  adapter-replacement contract is out of scope for this unit's greens.
