# Spec — Unit V3: Doc-Heads Doc-Nav (`rag-doc-heads` IPC + the doc-nav switch)

- **Status:** SPEC (the scoped-load fix, Unit 3 of 3). Gate reference:
  `docs/specs/load-bug-scoped-traversal-review.md` §5 (the amendments), §6
  (the unit split — Unit 3 = doc-heads doc-nav). Decisions:
  `docs/decisions.md` rows **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**,
  **PANE-REGISTRY**, **PANE-PROVIDENT-AUTHORING**, **APP-GRAPH-PANES-MCP-VISIBLE**,
  **OPERATOR-ISOLATED-GRAPHSCOPE**, **UI-MOUNT-BOOT**, **UI-MOUNT-RE-DERIVE**,
  **MCP-UI-EQUIVALENCE**.
- **Scope:** the lighter `rag-doc-heads` IPC returning
  `{ documents: [{ documentId, title }] }` from the `doc-head` edges + head node
  content; the doc-nav switching from `PaneContext.snapshot` to `ctx.docHeads`
  (`deriveDocNavDocuments`, `docNavContent`, `selectDocument`); the host
  retaining a doc-heads cache; the `RagSnapshotPayload` preserved for
  `buildTraversal`. Files: `src/shared/types.ts` (the IPC constant + payload),
  `src/main/preload.ts` (the bridge method), `src/main/main.ts` (the IPC
  handler), `src/renderer/pane-graph.ts` (`deriveDocNavDocuments`/`docNavContent`),
  `src/renderer/sidebar-panes.ts` (the host: `boot`, `deriveDocumentIds`,
  `buildTraversalEnvelope`, `selectDocument`, `buildContext`). This unit DEPENDS
  on Unit V1 (the adjacency methods — the doc-heads derivation can use
  `docHeadForDocument`/`edgesByKind`); it is INDEPENDENT of Unit V2 (it can run
  in parallel after Unit V1).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/shared/types.ts`,
  `src/main/preload.ts`, `src/main/main.ts`, `src/renderer/pane-graph.ts`, and
  `src/renderer/sidebar-panes.ts` from §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. **A lighter `rag-doc-heads` IPC** for the doc-nav: returns
   `{ documents: [{ documentId, title }] }` from the `doc-head` edges + head
   node content. The doc-nav only needs `documentId` + `title` (the doc-head
   source node's content) — a strict subset of the snapshot. A lighter IPC is
   correct (the review's §3 feasibility).
2. **The doc-nav switches from `PaneContext.snapshot` to `ctx.docHeads`**
   (`deriveDocNavDocuments`, `docNavContent`, `selectDocument`). The doc-nav no
   longer derives the document list from the full snapshot.
3. **The host retains a doc-heads cache** and `selectDocument` validates the id
   against the doc-heads list instead of `lastSnapshot.edges` (amendment 5 —
   MEDIUM).
4. **The existing `RagSnapshotPayload` is preserved** for `buildTraversal` (the
   rendering half still fetches the full snapshot — amendment 9, LOW).

## 2. Feasibility verdict

**Feasible — grounded in the existing `rag-snapshot` IPC pattern, the Unit V1
adjacency methods, and the current doc-nav derivation.**

- **`rag-doc-heads` IPC:** mirrors the `rag-snapshot` IPC pattern
  (`main.ts:349-352` + `preload.ts:71` + `shared/types.ts:416`). The handler
  reads the `doc-head` edges (via `store.edgesByKind('doc-head')` or
  `store.listEdges()`) + the head node content (via `store.getNode(source)`).
  A strict subset of the snapshot.
- **The doc-nav switch:** `deriveDocNavDocuments` (pane-graph.ts:156) already
  derives the document list from the `doc-head` edges; switching its input from
  `ctx.snapshot` to `ctx.docHeads` is a mechanical change. `docNavContent`
  (pane-graph.ts:180) reads `deriveDocNavDocuments`; `selectDocument`
  (sidebar-panes.ts:998) validates against the doc-heads list instead of
  `lastSnapshot.edges`.
- **The host cache:** the host already retains `lastSnapshot` (Unit K §5.3 M7);
  it adds a `lastDocHeads` cache (the doc-heads list) alongside it.

No engine/foundation gap blocks this unit. The IPC, the doc-nav switch, and the
host cache are all project-specific (compose the Unit V1 adjacency methods +
the existing IPC bridge).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `rag-doc-heads` IPC + the bridge method + the main handler | Project-specific (a new IPC channel) | Low cost; the doc-nav no longer needs the full snapshot. |
| The doc-nav switch (`PaneContext.snapshot` → `ctx.docHeads`) | Project-specific (a `PaneContext` field change + the pure helpers) | Low cost; the doc-nav reads only the document heads. |
| The host doc-heads cache + `selectDocument` validation source | Project-specific (a host cache + a validation change) | Low cost; `selectDocument` validates against the doc-heads list (amendment 5). |
| The `RagSnapshotPayload` preserved for `buildTraversal` | Project-specific (no change — the rendering half still fetches the full snapshot) | No cost; the scoped walk reduces the WALK cost, not the IPC transfer (amendment 9). |

No engine gap. The fix is entirely host-side (`src/`).

### 3a. Adversarial findings (host findings, fixed + regression-tested)

The post-green adversarial pass (RCA-3) ran after this unit landed. All findings
are HOST findings (this repo's `src/`), fixed here + regression-tested in
`tests/unit-v3-doc-heads-docnav-adversarial.test.ts`. No package/engine defect
was found (nothing handed off to `docs/defects.md`).

- **MED-1 — `handleRagDocHeadsIpc` crashes on a `doc-head` edge with a
  missing/undefined target.** `createSnapshotStore([], [{ id:'e1', kind:'doc-head',
  source:'head-a', target: undefined }])` pushed `{ documentId: undefined, title: '' }`,
  then `documents.sort((a,b) => a.documentId.localeCompare(b.documentId))` threw
  `TypeError: Cannot read properties of undefined (reading 'localeCompare')`.
  **Resolution:** the handler now SKIPS a `doc-head` edge with a
  missing/undefined/empty target (`e.target == null || e.target === ''`) — a
  malformed edge is skipped, never a crash, and an empty-string target (a
  phantom, unselectable document entry) is skipped too. Regression-tested
  (undefined target, empty-string target, mixed valid+malformed edges).
- **LOW-2 — `docNavContent` crashes on a non-array `docHeads`.** The H1 guard
  only covered `null`/`undefined`; a truthy non-array passed through and
  `docs.map(...)` threw. **Resolution:** `deriveDocNavDocuments` coerces a
  non-array `docHeads` to `[]` (the `(no documents)` empty state, never a
  TypeError). Regression-tested (object + string `docHeads`).
- **LOW-3 — `deriveDocNavDocuments` no longer sorts/dedupes defensively.** The
  old H6 dedupe-by-target + sort moved to the IPC handler; the helper returned
  the list verbatim. **Resolution:** restored a defensive sort-by-`documentId` +
  dedupe-by-target in `deriveDocNavDocuments` (a malformed/unsorted/duplicated
  `docHeads` from the bridge renders a sorted, deduped doc-nav; a missing/empty
  `documentId` entry is skipped). Regression-tested (unsorted, duplicated,
  missing-id entries).
- **LOW-4 — `docNavContent` renders `content: undefined` for a docHeads entry
  with a missing `title`.** **Resolution:** a missing `title` is coerced to `''`
  (in `deriveDocNavDocuments` + defensively in `docNavContent`) — never
  `content: undefined`. Regression-tested (missing + explicit-null title).
- **LOW-5 — `reDerive` updates `lastSnapshot` before the doc-heads fetch, so an
  abort leaves a transient state inconsistency.** `this.lastSnapshot = snapshot`
  ran before the doc-heads fetch; a doc-heads fetch failure left `lastSnapshot`
  fresh while `lastDocHeads` was stale. **Resolution:** reordered `reDerive` so
  the doc-heads fetch completes (or fails) BEFORE committing `lastSnapshot` +
  `lastDocHeads` together — both are set only after both fetches succeed, so an
  aborted doc-heads fetch leaves both caches stale (consistent), never one fresh
  + one stale. Regression-tested (a doc-heads failure leaves `lastSnapshot`
  unchanged).
- **LOW-6 — `selectDocument` with a null `lastDocHeads` is guarded but
  untested.** **Resolution:** added a regression test for the null-cache branch
  (a null `lastDocHeads` → `selectDocument` no-ops, never throws).

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** (`docs/specs/load-bug-scoped-traversal-review.md`).
The amendments this unit folds in:

- **Amendment 5 (MEDIUM) — `selectDocument` validation source.** When the
  doc-nav switches to `ctx.docHeads`, `selectDocument` (`sidebar-panes.ts:998-1004`)
  validates the id against `lastSnapshot.edges`; it must validate against the
  doc-heads list instead, and the host must retain a doc-heads cache. The F8
  adversarial test (`unit-k-sidebar-panes-host.md` §3a F8) is updated
  accordingly. Pinned in §5.4 + §5.8 happy-path 12 + §5.9 fail-state 5.
- **Amendment 8 (MEDIUM) — reconcile the greens docs + trackers (RCA-6).** The
  doc-nav IPC drift affects `unit-h-sidebar-panes-greens.md` and
  `unit-k-sidebar-panes-host-greens.md`, and the census claims in the specs.
  These must be reconciled in the SAME pass as the code, and
  `docs/defects.md`/`docs/next-steps.md` updated. Pinned in §5.9.
- **Amendment 9 (LOW) — document the snapshot-transfer limitation.** The
  boot/re-derive still fetches the full `RagSnapshotPayload` for `buildTraversal`;
  the doc-nav now uses the lighter `rag-doc-heads` IPC, but the rendering half
  still transfers the whole store. Pinned in §5.9 + `docs/pending.md`.

## 4. Design decisions pinned by this spec

- **DOC-HEADS-IPC (new):** a lighter `rag-doc-heads` IPC returns
  `{ documents: [{ documentId, title }] }` from the `doc-head` edges + head node
  content. The doc-nav reads this, not the full snapshot.
- **DOC-NAV-DOCHEADS (new):** the doc-nav's `PaneContext` carries `docHeads`
  (the document list) instead of deriving it from `snapshot`. `deriveDocNavDocuments`
  and `docNavContent` read `ctx.docHeads`; `selectDocument` validates against the
  doc-heads list.
- **HOST-DOCHEADS-CACHE (new):** the host retains a `lastDocHeads` cache (the
  doc-heads list) alongside `lastSnapshot`, refreshed on boot/re-derive.
- **RAG-SNAPSHOT-PRESERVED (new):** the `RagSnapshotPayload` + the `rag-snapshot`
  IPC are PRESERVED for `buildTraversal` (the rendering half). The doc-nav no
  longer consumes the snapshot, but the rendering half still does (amendment 9).
- **SINGLE-WRITER-STORE (consumed):** the doc-heads IPC reads the main-process
  store (read-only); the renderer has no store access.

## 5. The exhaustive contract

### 5.1 The `rag-doc-heads` IPC (`src/shared/types.ts` + `src/main/main.ts` + `src/main/preload.ts`)

**The shared type + constant (`src/shared/types.ts`):**

```ts
/** The renderer→main `rag-doc-heads` IPC (the doc-nav data source). Returns the
 *  document list (the `doc-head` edges' targets + the head node content) — a
 *  strict subset of the `rag-snapshot` payload. The doc-nav reads this, not the
 *  full snapshot. */
export const IPC_RAG_DOC_HEADS = 'provident:rag-doc-heads'
export interface RagDocHeadsPayload {
  /** One entry per document, sorted by document root id (lexicographic
   *  ascending, deterministic). */
  documents: Array<{ documentId: string; title: string }>
}
```

**The main handler (`src/main/main.ts`):**

```ts
ipcMain.handle(IPC_RAG_DOC_HEADS, () => {
  const edges = ragStore.listEdges()
  const nodeById = new Map(ragStore.listNodes().map((n) => [n.id, n]))
  const seen = new Set<string>()
  const documents: Array<{ documentId: string; title: string }> = []
  for (const e of edges) {
    if (e.kind !== 'doc-head') continue
    if (seen.has(e.target)) continue // dedupe by target (first head wins)
    seen.add(e.target)
    documents.push({ documentId: e.target, title: nodeById.get(e.source)?.content ?? '' })
  }
  documents.sort((a, b) => a.documentId.localeCompare(b.documentId))
  return { documents }
})
```

**Behavior (pinned):**

- The handler reads the `doc-head` edges (via `store.listEdges()` filtered by
  `kind === 'doc-head'`, or `store.edgesByKind('doc-head')` — the spec pins the
  adjacency method `edgesByKind('doc-head')` as the preferred source, falling
  back to `listEdges()` for a store that predates the adjacency surface). The
  head node content is read via `store.getNode(source)`.
- **Dedupe by target `documentId` (first head wins)** — mirrors the current
  `deriveDocNavDocuments` H6 adversarial fix (pane-graph.ts:167-171). A
  corrupted store with two `doc-head` edges to the SAME document emits ONE entry.
- **Sorted by document root id** (lexicographic ascending, deterministic) —
  mirrors the current `deriveDocNavDocuments` sort (pane-graph.ts:174).
- **Title:** the `doc-head` edge's SOURCE node's `content`; a missing source
  node → `''` (no throw).
- **Empty store:** no `doc-head` edges → `{ documents: [] }` (no throw).
- **Throw patterns:** a null `ragStore` → the handler throws
  `Error('rag-doc-heads: no rag store configured')` (mirrors the `rag-snapshot`
  handler's store-null discipline).

**The bridge method (`src/main/preload.ts`):**

```ts
rag: {
  // ... (the existing query/snapshot/backlinks methods, unchanged) ...
  /** Unit V3 — the doc-nav data source. Returns the document list (the
   *  `doc-head` edges' targets + the head node content) — a strict subset of
   *  the snapshot. */
  docHeads(): Promise<RagDocHeadsPayload>
}
```

The bridge method sends the `IPC_RAG_DOC_HEADS` IPC (mirrors the `snapshot()`
method at `preload.ts:235-236`).

### 5.2 The `PaneContext` change (`src/renderer/pane-registry.ts`)

The `PaneContext` (Unit H §5.1) gains a `docHeads` field. The `snapshot` field
is RETAINED (the other panes + the re-derive still read it), but the doc-nav
pane no longer reads it.

```ts
export interface PaneContext {
  /** The current RAG store snapshot (Unit A §5.2 — nodes + edges), fetched over
   *  the `rag-snapshot` IPC. RETAINED for the re-derive + the other panes. The
   *  doc-nav pane no longer reads this (it reads `docHeads`). */
  snapshot: { nodes: RagNode[]; edges: RagEdge[] }
  /** Unit V3 — the document list (the `doc-head` edges' targets + the head
   *  node content), fetched over the `rag-doc-heads` IPC. The doc-nav pane
   *  reads this. */
  docHeads: Array<{ documentId: string; title: string }>
  // ... (the existing currentDocumentId/currentNodeId/backRefs/crosslinks,
  //      unchanged) ...
}
```

**Contract (pinned):** `docHeads` is a REQUIRED field of `PaneContext` (the
doc-nav pane reads it). The `snapshot` field is RETAINED (the re-derive + the
other panes still read it). A `PaneContext` with a null/undefined `docHeads`
must survive (the doc-nav shows the empty state — §5.3).

### 5.3 The doc-nav helpers (`src/renderer/pane-graph.ts`)

`deriveDocNavDocuments` and `docNavContent` switch from `ctx.snapshot` to
`ctx.docHeads`.

```ts
// src/renderer/pane-graph.ts (project-specific; pure, no Electron).

/** The doc-nav document list, derived from the `doc-head` edges. Each document
 *  = the `doc-head` edge's target (the document root id); its title = the
 *  `doc-head` edge's SOURCE node's content. Sorted by document root id
 *  (lexicographic ascending, deterministic). Unit V3 — the input is the
 *  `docHeads` list (from the `rag-doc-heads` IPC), NOT the full snapshot. */
export function deriveDocNavDocuments(
  docHeads: PaneContext['docHeads'],
): Array<{ documentId: string; title: string }>

/** The `doc-nav` pane content: a `ul` of `li` document entries. The current
 *  document's `li` carries `props['data-current'] = 'true'`. Empty list → a
 *  single `p` with content `(no documents)`. Unit V3 — reads `ctx.docHeads`. */
export function docNavContent(ctx: PaneContext): LegacyNodeData
```

**Behavior (pinned):**

- `deriveDocNavDocuments(docHeads)` returns the `docHeads` list (already sorted
  + deduped by the IPC handler). A `null`/`undefined` `docHeads` → returns `[]`
  (the `(no documents)` empty state, never a TypeError — the H1 adversarial
  guard preserved).
- `docNavContent(ctx)` reads `ctx.docHeads` (via `deriveDocNavDocuments`). A
  `null`/`undefined` `ctx` or `ctx.docHeads` → returns the `(no documents)` `p`
  (never a TypeError). The `li` entries carry `props['data-document-id']` +
  `props['data-current']` (unchanged — Unit H §5.3). The `li` entries carry NO
  handler body (the host binds the `pane-doc-nav-select` handler — Unit K §5.3
  M2).

### 5.4 The host (`src/renderer/sidebar-panes.ts`)

**The host doc-heads cache (amendment 5, pinned):** the host retains
`lastDocHeads: RagDocHeadsPayload['documents']` alongside `lastSnapshot`. It is
set by the boot/re-derive (fetched over the `rag-doc-heads` IPC) and read by
`buildContext()` (which populates `ctx.docHeads`).

**`boot` (pinned):** the boot sequence (Unit K §5.1) gains a `rag-doc-heads`
fetch. After the `rag-snapshot` fetch (step 3), the host fetches
`bridge.rag.docHeads()` → `this.lastDocHeads = payload.documents`. A bridge
error → the boot is ABORTED (the placeholder envelope stays rendered; caught +
logged, never a crash — the same discipline as the snapshot fetch).

**`reDerive` (pinned):** the re-derive sequence (Unit K §5.2) gains the same
`rag-doc-heads` fetch → `this.lastDocHeads = payload.documents`. A bridge error
→ the re-derive is ABORTED (the current graph stays rendered; caught + logged).

**`buildContext` (pinned):** `buildContext()` returns a `PaneContext` with
`docHeads: this.lastDocHeads` (alongside the existing `snapshot`/`currentDocumentId`/
`currentNodeId`/`backRefs`/`crosslinks`). A null `lastDocHeads` → `docHeads: []`
(the doc-nav shows the empty state).

**`buildTraversalEnvelope` (pinned, amendment 4):** the host's
`buildTraversalEnvelope` adapter (`sidebar-panes.ts:824`) —
`const store = { listNodes: () => snapshot.nodes, listEdges: () => snapshot.edges } as never` —
MUST be replaced by `createSnapshotStore(snapshot.nodes, snapshot.edges)` (Unit
V1 §5.4), or `buildTraversal` throws once it calls the new adjacency methods
(Unit V2). The replacement is pinned:

```ts
private buildTraversalEnvelope(snapshot: RagSnapshotPayload, documentIds: string[]): LegacyInitialData {
  if (documentIds.length === 0) {
    this.backRefs.clear()
    this.lastCrosslinks = []
    return this.emptyStoreEnvelope()
  }
  const store = createSnapshotStore(snapshot.nodes, snapshot.edges)
  const result = buildTraversal({ store, documentIds, zoneName: this.zoneName, template: this.template })
  this.lastCrosslinks = result.crosslinks
  this.backRefs.clear()
  for (const [k, v] of result.backRefs) this.backRefs.set(k, v)
  return result.envelope
}
```

**`selectDocument` (amendment 5, pinned):** `selectDocument` (`sidebar-panes.ts:998-1004`)
validates the id against the doc-heads list instead of `lastSnapshot.edges`:

```ts
private selectDocument(id: string): void {
  // F8 (amendment 5) — validate against the doc-heads list (the doc-nav's data
  // source), not lastSnapshot.edges. A crafted/bogus id is ignored (no
  // re-derive with a phantom documentIds).
  if (!this.lastDocHeads || !this.lastDocHeads.some((d) => d.documentId === id)) return
  this.setCurrentDocumentId(id)
  this.editController.requestRebuild()
}
```

**`deriveDocumentIds` (pinned):** `deriveDocumentIds` (`sidebar-panes.ts:797-801`)
still derives the document ids from the snapshot's `doc-head` edges' targets
(the re-derive's `documentIds` source — Unit K §5.2 M6). It is UNCHANGED (the
re-derive still needs the full document-id set for `buildTraversal`; the
`rag-doc-heads` IPC is the doc-nav's display source, not the re-derive's
`documentIds` source).

### 5.5 The `RagSnapshotPayload` preserved (amendment 9)

The `RagSnapshotPayload` (`shared/types.ts:417`) + the `rag-snapshot` IPC
(`main.ts:349-352` + `preload.ts:71`) are PRESERVED for `buildTraversal` (the
rendering half). The doc-nav no longer consumes the snapshot, but the re-derive
still fetches it (Unit K §5.2 step 1). The scoped walk (Unit V2) reduces the
WALK cost, not the IPC transfer — the boot/re-derive still serializes the whole
store to the renderer. This is a documented limitation (amendment 9, LOW) noted
in `docs/pending.md` as a follow-up (main-side traversal or a scoped snapshot).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **`rag-doc-heads` IPC happy:** a store with two `doc-head` edges → the
   handler returns `{ documents: [{ documentId, title }, ...] }` sorted by
   document root id, with the titles from the head node content.
2. **`rag-doc-heads` IPC empty store:** no `doc-head` edges → `{ documents: [] }`
   (no throw).
3. **`rag-doc-heads` IPC dedupe:** two `doc-head` edges to the SAME document →
   ONE entry (first head wins).
4. **`rag-doc-heads` IPC missing head node:** a `doc-head` edge whose source
   node is missing → the entry's `title` is `''` (no throw).
5. **`bridge.rag.docHeads()`:** the bridge method sends the `IPC_RAG_DOC_HEADS`
   IPC and returns the `RagDocHeadsPayload`.
6. **`deriveDocNavDocuments` happy:** a `docHeads` list → the returned list is
   the same (already sorted + deduped by the IPC handler).
7. **`deriveDocNavDocuments` null:** a `null`/`undefined` `docHeads` → `[]` (the
   `(no documents)` empty state, no throw).
8. **`docNavContent` happy:** a `ctx` with a non-empty `docHeads` → a `ul` of
   `li` document entries, the current document's `li` carrying
   `data-current: 'true'`.
9. **`docNavContent` empty:** a `ctx` with an empty/null `docHeads` → the
   `(no documents)` `p` (no throw).
10. **`buildContext` happy:** with `lastDocHeads` set → the returned `PaneContext`
    carries `docHeads` (alongside the existing fields).
11. **`boot` happy:** the boot fetches the snapshot + the doc-heads + the
    template, derives the document ids, builds the traversal envelope (via
    `createSnapshotStore`), assembles + loads the pane-inclusive envelope, mounts
    the operator pane, subscribes to the re-derive triggers; `lastDocHeads` is
    set.
12. **`selectDocument` happy (amendment 5):** a document id in the doc-heads list
    → `setCurrentDocumentId(id)` + a document-switch re-traversal (via
    `requestRebuild`).
13. **`buildTraversalEnvelope` via `createSnapshotStore` (amendment 4):** the
    host's adapter is `createSnapshotStore(snapshot.nodes, snapshot.edges)`; the
    traversal envelope is built correctly.
14. **`reDerive` happy:** a `rag-store-changed` → the re-derive fetches the
    snapshot + the doc-heads, re-traverses, re-assembles, re-loads; `lastDocHeads`
    is refreshed; the app-graph panes stay MCP-visible.
15. **`RagSnapshotPayload` preserved:** the `rag-snapshot` IPC + the
    `RagSnapshotPayload` type are unchanged (the rendering half still fetches the
    full snapshot).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`rag-doc-heads` IPC with a null store** → throws
   `Error('rag-doc-heads: no rag store configured')`.
2. **A bridge error during the boot `rag-doc-heads` fetch** → the boot is
   ABORTED (the placeholder envelope stays rendered; caught + logged, never a
   crash).
3. **A bridge error during the re-derive `rag-doc-heads` fetch** → the re-derive
   is ABORTED (the current graph stays rendered; caught + logged, never a crash).
4. **`docNavContent` with a null/undefined `ctx` or `ctx.docHeads`** → the
   `(no documents)` `p` (never a TypeError — the H1 adversarial guard
   preserved).
5. **`selectDocument` with a bogus id (amendment 5):** a document id NOT in the
   doc-heads list → the id is IGNORED (no `setCurrentDocumentId`, no re-derive
   with a phantom `documentIds`). This is the F8 adversarial test
   (`unit-k-sidebar-panes-host.md` §3a F8) updated to validate against the
   doc-heads list.
6. **`buildTraversalEnvelope` with a `listNodes`/`listEdges`-only adapter
   (amendment 4):** the host's adapter is `createSnapshotStore`; a
   `listNodes`/`listEdges`-only adapter passed to `buildTraversal` throws (the
   adjacency call fails) — the replacement is required.

### 5.8 Census / numeric claims

- **New IPC channel:** 1 (`IPC_RAG_DOC_HEADS` = `'provident:rag-doc-heads'`).
- **New shared type:** 1 (`RagDocHeadsPayload`).
- **New bridge method:** 1 (`bridge.rag.docHeads()`).
- **New main handler:** 1 (`ipcMain.handle(IPC_RAG_DOC_HEADS, ...)`).
- **`PaneContext` field added:** 1 (`docHeads`). The `snapshot` field is RETAINED.
- **Host cache added:** 1 (`lastDocHeads`).
- **Host adapter replaced (amendment 4):** 1 (`buildTraversalEnvelope` →
  `createSnapshotStore`). The `rebuildBackRefs` adapter was replaced in Unit V2.
- **`selectDocument` validation source changed (amendment 5):** 1
  (`lastSnapshot.edges` → `lastDocHeads`).
- **`RagSnapshotPayload` preserved:** 1 (unchanged — the rendering half still
  fetches the full snapshot; amendment 9).

### 5.9 Cross-references

- Unit V1: `docs/specs/unit-v1-store-adjacency.md` §5.2 (the `RagStore`
  adjacency methods — `edgesByKind('doc-head')` for the doc-heads derivation),
  §5.4 (`createSnapshotStore` — the host's `buildTraversalEnvelope` replacement),
  §5.5 (the adapters replaced).
- Unit H: `docs/specs/unit-h-sidebar-panes.md` §5.1 (the `PaneContext` this unit
  extends), §5.3 (the `doc-nav` pane + `deriveDocNavDocuments`/`docNavContent`),
  §3a (H1/H6 — the null-guard + dedupe adversarial fixes preserved).
- Unit K: `docs/specs/unit-k-sidebar-panes-host.md` §5.1 (the boot sequence this
  unit extends), §5.2 (the re-derive sequence), §5.3 (the host's pane-data
  cache — `lastSnapshot`/`lastCrosslinks`/...; the `lastDocHeads` cache is
  added), §5.6 (`buildContext`), §3a F8 (the `selectDocument` adversarial test
  updated to validate against the doc-heads list).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`buildTraversal` — the
  rendering half that still fetches the full snapshot).
- Gate: `docs/specs/load-bug-scoped-traversal-review.md` §5 (amendments 4, 5, 8,
  9), §6 (Unit 3 = doc-heads doc-nav).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **PANE-REGISTRY**, **PANE-PROVIDENT-AUTHORING**,
  **APP-GRAPH-PANES-MCP-VISIBLE**, **OPERATOR-ISOLATED-GRAPHSCOPE**,
  **UI-MOUNT-BOOT**, **UI-MOUNT-RE-DERIVE**, **MCP-UI-EQUIVALENCE**. New rows
  pinned by this spec (added when the unit lands): **DOC-HEADS-IPC**,
  **DOC-NAV-DOCHEADS**, **HOST-DOCHEADS-CACHE**, **RAG-SNAPSHOT-PRESERVED**.
- Host patterns: `src/shared/types.ts` (the IPC constant + payload),
  `src/main/preload.ts` (the bridge method), `src/main/main.ts` (the IPC
  handler), `src/renderer/pane-graph.ts` (`deriveDocNavDocuments`/`docNavContent`),
  `src/renderer/sidebar-panes.ts` (the host: `boot`, `reDerive`, `buildContext`,
  `buildTraversalEnvelope`, `selectDocument`).
- **Amendment 8 (RCA-6) — the greens docs + trackers to reconcile in the SAME
  pass:** `unit-h-sidebar-panes-greens.md`, `unit-k-sidebar-panes-host-greens.md`,
  and the census claims in the specs. `docs/defects.md`/`docs/next-steps.md`
  updated.
- **Amendment 9 (LOW) — the snapshot-transfer limitation:** the boot/re-derive
  still fetches the full `RagSnapshotPayload` for `buildTraversal`; the doc-nav
  now uses the lighter `rag-doc-heads` IPC, but the rendering half still
  transfers the whole store. Noted in `docs/pending.md` as a follow-up
  (main-side traversal or a scoped snapshot).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for `src/shared/types.ts`, `src/main/preload.ts`,
`src/main/main.ts`, `src/renderer/pane-graph.ts`, and `src/renderer/sidebar-panes.ts`
from §5.6/§5.7. The red set (recorded in the next-steps DONE row for this unit):

- **`rag-doc-heads` IPC:** the happy paths (1-4), the fail-state (1).
- **The bridge method:** the happy path (5).
- **The doc-nav helpers:** the happy paths (6-9), the fail-state (4).
- **The host:** the happy paths (10-15), the fail-states (2, 3, 5, 6).
- **Amendment 5 (pinned):** the F8 adversarial test updated — `selectDocument`
  validates against the doc-heads list, not `lastSnapshot.edges`.
- **Amendment 4 (pinned):** the `buildTraversalEnvelope` adapter is
  `createSnapshotStore`; a `listNodes`/`listEdges`-only adapter throws.
- **Amendment 8 (RCA-6):** the greens docs + trackers reconciled in the SAME
  pass as the code.
