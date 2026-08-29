# Unit V3 — Doc-Heads Doc-Nav: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-v3-doc-heads-docnav.md` ONLY — no implementation reading of
  the scenario content).
- **Source contract:** `docs/specs/unit-v3-doc-heads-docnav.md` §5.1–§5.9 (the
  `rag-doc-heads` IPC constant + payload + main handler + bridge method, the
  `PaneContext.docHeads` field, the doc-nav helpers
  `deriveDocNavDocuments`/`docNavContent`, the host `boot`/`reDerive`/
  `buildContext`/`buildTraversalEnvelope`/`selectDocument`, the `RagSnapshotPayload`
  preserved, §5.6 happy paths, §5.7 fail-states, §5.8 census) + §3a (the
  post-green adversarial findings MED-1, LOW-2..LOW-6, host-fixed +
  regression-tested).
- **Modules under test:** `src/main/mcp-server.ts` (`handleRagDocHeadsIpc`),
  `src/renderer/pane-graph.ts` (`deriveDocNavDocuments`, `docNavContent`),
  `src/renderer/sidebar-panes.ts` (the host: `boot`, `reDerive`, `buildContext`,
  `buildTraversalEnvelope`, `selectDocument`), `src/main/rag-store.ts` +
  `src/main/adjacency.ts` (`createJsonRagStore`, `createSnapshotStore`), the
  `rag-doc-heads` IPC constant + payload in `src/shared/types.ts`, and
  `src/main/traversal.ts` (`buildTraversal` — the amendment-4 adapter fail-state).
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The pure helpers (`handleRagDocHeadsIpc`,
  `deriveDocNavDocuments`, `docNavContent`) are exercised directly over
  `createSnapshotStore`/`createJsonRagStore` fixtures. The host scenarios
  (`boot`/`reDerive`/`buildContext`/`selectDocument`) run through a `SidebarPanes`
  harness with a mock bridge (the same harness pattern the Unit V3 test file
  uses), the `rag-doc-heads` fetch surfaced via `bridge.rag.docHeads()`. The
  preload bridge method itself is not node-importable (imports `electron`); its
  node-testable contract is the host boot calling `bridge.rag.docHeads()`.
- **Run:** 36 scenarios — 36 pass, 0 fail. No spec-vs-impl drift observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.6 Happy-path states (15 node-tested)

Fixture helpers: `N(id, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. A valid
one-document snapshot = one `doc-head` edge → document root `doc-a` with head
node `head-a` (`content: 'Doc A'`). An empty snapshot = `{ nodes: [], edges: [] }`.

### A1. `rag-doc-heads` IPC happy (§5.6 1)
- **Setup:** a store with two `doc-head` edges (`head-b→doc-b`, `head-a→doc-a`),
  head nodes carrying `content: 'Doc B'` / `'Doc A'`.
- **Ops:** `handleRagDocHeadsIpc(store)`.
- **Expected:** `{ documents: [{ documentId:'doc-a', title:'Doc A' },
  { documentId:'doc-b', title:'Doc B' }] }` — sorted by document root id
  (lexicographic ascending), titles from the head node content.

### A2. `rag-doc-heads` IPC empty store (§5.6 2)
- **Setup:** a store with no `doc-head` edges.
- **Ops:** `handleRagDocHeadsIpc(store)`.
- **Expected:** `{ documents: [] }` (no throw).

### A3. `rag-doc-heads` IPC dedupe (§5.6 3)
- **Setup:** two `doc-head` edges to the SAME document (`head-a→doc-a`,
  `head-a2→doc-a`), different source nodes.
- **Ops:** `handleRagDocHeadsIpc(store)`.
- **Expected:** ONE entry `{ documentId:'doc-a', title:'Doc A' }` (first head
  wins).

### A4. `rag-doc-heads` IPC missing head node (§5.6 4)
- **Setup:** a `doc-head` edge whose source node is missing from the store.
- **Ops:** `handleRagDocHeadsIpc(store)`.
- **Expected:** the entry's `title` is `''` (no throw).

### A5. `bridge.rag.docHeads()` (§5.6 5)
- **Setup:** a `SidebarPanes` harness whose mock bridge exposes
  `rag.docHeads()` returning a `RagDocHeadsPayload`.
- **Ops:** `host.boot(runtime)`.
- **Expected:** the boot calls `bridge.rag.docHeads()` (the bridge method sends
  the `IPC_RAG_DOC_HEADS` IPC and returns the `RagDocHeadsPayload` — the
  node-testable contract; the preload method itself is verified by code review).

### A6. `deriveDocNavDocuments` happy (§5.6 6)
- **Setup:** a `docHeads` list (already sorted + deduped by the IPC handler).
- **Ops:** `deriveDocNavDocuments(docHeads)`.
- **Expected:** the returned list is the same (already sorted + deduped).

### A7. `deriveDocNavDocuments` null (§5.6 7)
- **Ops:** `deriveDocNavDocuments(null)` / `deriveDocNavDocuments(undefined)`.
- **Expected:** `[]` (the `(no documents)` empty state, no throw).

### A8. `docNavContent` happy (§5.6 8)
- **Setup:** a `ctx` with a non-empty `docHeads` (`doc-a`, `doc-b`) and
  `currentDocumentId: 'doc-b'`.
- **Ops:** `docNavContent(ctx)`.
- **Expected:** a `ul` with two `li` document entries sorted by root id ascending
  (doc-a, doc-b); each `li` carries `data-document-id`; the current document's
  `li` carries `data-current: 'true'`.

### A9. `docNavContent` empty (§5.6 9)
- **Setup:** a `ctx` with an empty `docHeads`.
- **Ops:** `docNavContent(ctx)`.
- **Expected:** a single `p` with content `(no documents)` (no throw).

### A10. `buildContext` happy (§5.6 10)
- **Setup:** a harness with `lastDocHeads` set (boot with a doc-heads payload).
- **Ops:** `host.boot(runtime)`; `host.buildContext()`.
- **Expected:** the returned `PaneContext` carries `docHeads` (alongside the
  existing `snapshot`/`currentDocumentId`/`currentNodeId`/`backRefs`/`crosslinks`).

### A11. `boot` happy (§5.6 11)
- **Setup:** a harness with a valid snapshot + a doc-heads payload.
- **Ops:** `host.boot(runtime)`.
- **Expected:** the boot fetches the snapshot + the doc-heads + the template,
  derives the document ids, builds the traversal envelope (via
  `createSnapshotStore`), assembles + loads the pane-inclusive envelope, mounts
  the operator pane, subscribes to the re-derive triggers; `lastDocHeads` is set
  (buildContext carries it).

### A12. `selectDocument` happy (amendment 5) (§5.6 12)
- **Setup:** a harness booted with a doc-heads list containing `doc-a`.
- **Ops:** `sidebar.selectDocument('doc-a')`.
- **Expected:** `setCurrentDocumentId('doc-a')` + a document-switch re-traversal
  (via `requestRebuild` — the `onRebuild` callback fires).

### A13. `buildTraversalEnvelope` via `createSnapshotStore` (amendment 4) (§5.6 13)
- **Setup:** a harness with a valid one-document snapshot.
- **Ops:** `host.boot(runtime)`.
- **Expected:** the host's adapter is `createSnapshotStore(snapshot.nodes,
  snapshot.edges)`; the traversal envelope is built correctly (the boot renders
  the RAG content — `Doc A` appears in the rendered HTML).

### A14. `reDerive` happy (§5.6 14)
- **Setup:** a harness booted with a valid snapshot + doc-heads.
- **Ops:** `host.reDerive()`.
- **Expected:** the re-derive fetches the snapshot + the doc-heads, re-traverses,
  re-assembles, re-loads; `lastDocHeads` is refreshed (the doc-heads fetch is
  called again); the app-graph panes stay MCP-visible.

### A15. `RagSnapshotPayload` preserved (amendment 9) (§5.6 15)
- **Setup:** the `rag-snapshot` IPC constant + the `RagSnapshotPayload` type.
- **Ops:** inspect `IPC_RAG_SNAPSHOT`; a harness boot.
- **Expected:** `IPC_RAG_SNAPSHOT === 'provident:rag-snapshot'` (unchanged); the
  host still fetches the full snapshot at boot (the rendering half).

---

## B. §5.7 Fail-states (6 node-tested)

### B1. `rag-doc-heads` IPC with a null store (§5.7 1)
- **Ops:** `handleRagDocHeadsIpc(null)`.
- **Expected:** throws `Error('rag-doc-heads: no rag store configured')`.

### B2. Bridge error during the boot `rag-doc-heads` fetch (§5.7 2)
- **Setup:** a harness whose `bridge.rag.docHeads()` rejects.
- **Ops:** `host.boot(runtime)`.
- **Expected:** the boot is ABORTED (the placeholder envelope stays rendered —
  no `pane-doc-nav`, no `Doc A` in the rendered HTML; caught + logged, never a
  crash).

### B3. Bridge error during the re-derive `rag-doc-heads` fetch (§5.7 3)
- **Setup:** a harness booted successfully; the next `bridge.rag.docHeads()`
  rejects.
- **Ops:** `host.reDerive()`.
- **Expected:** the re-derive is ABORTED (the current graph stays rendered —
  `pane-doc-nav` still in the rendered HTML; caught + logged, never a crash).

### B4. `docNavContent` with a null/undefined `ctx` or `ctx.docHeads` (§5.7 4)
- **Ops:** `docNavContent(null)`, `docNavContent({ docHeads: null })`,
  `docNavContent({ docHeads: undefined })`.
- **Expected:** the `(no documents)` `p` (never a TypeError — the H1 adversarial
  guard preserved).

### B5. `selectDocument` with a bogus id (amendment 5) (§5.7 5)
- **Setup:** a harness booted with a doc-heads list containing `doc-a`.
- **Ops:** `sidebar.selectDocument('bogus')`.
- **Expected:** the id is IGNORED (no `setCurrentDocumentId`, no re-derive with
  a phantom `documentIds` — `currentDocumentId` stays null, `onRebuild` not
  called). This is the F8 adversarial test updated to validate against the
  doc-heads list.

### B6. `buildTraversalEnvelope` with a `listNodes`/`listEdges`-only adapter (amendment 4) (§5.7 6)
- **Setup:** a `{ listNodes, listEdges }`-only adapter over a one-document
  snapshot.
- **Ops:** `buildTraversal({ store: listOnly, documentIds: ['doc-a'], zoneName: 'main' })`.
- **Expected:** throws (the adjacency call fails) — the `createSnapshotStore`
  replacement is required.

---

## C. §5.8 Census / numeric claims (9 node-tested)

### C1. New IPC channel — 1
- **Expected:** `IPC_RAG_DOC_HEADS === 'provident:rag-doc-heads'`.

### C2. New shared type — 1
- **Expected:** `RagDocHeadsPayload` is exported (the `{ documents:
  [{ documentId, title }] }` shape; the constant is the runtime witness).

### C3. New bridge method — 1
- **Expected:** the host boot calls `bridge.rag.docHeads()` (the node-testable
  contract of the preload method).

### C4. New main handler — 1
- **Expected:** `handleRagDocHeadsIpc` is a function on `mcp-server.ts`.

### C5. `PaneContext` field added — 1 (`docHeads`); `snapshot` RETAINED
- **Expected:** `buildContext()` returns a `PaneContext` carrying `docHeads`
  alongside the retained `snapshot`.

### C6. Host cache added — 1 (`lastDocHeads`)
- **Expected:** the boot/re-derive set `lastDocHeads` (buildContext carries it).

### C7. Host adapter replaced (amendment 4) — 1
- **Expected:** the host's `buildTraversalEnvelope` uses `createSnapshotStore`
  (the boot renders the RAG content); a `listNodes`/`listEdges`-only adapter
  throws (B6).

### C8. `selectDocument` validation source changed (amendment 5) — 1
- **Expected:** `selectDocument` validates against the doc-heads list, not
  `lastSnapshot.edges` — an id in the snapshot edges but NOT in the doc-heads
  list is IGNORED.

### C9. `RagSnapshotPayload` preserved — 1
- **Expected:** `IPC_RAG_SNAPSHOT === 'provident:rag-snapshot'` (unchanged — the
  rendering half still fetches the full snapshot; amendment 9).

---

## D. §3a Adversarial resolutions (host, fixed + regression-tested) — 6 node-tested

### D1 (MED-1). `handleRagDocHeadsIpc` skips a `doc-head` edge with a missing/undefined/empty target
- **Setup:** a store with a `doc-head` edge whose target is `undefined`; a store
  with an empty-string target; a mix of valid + malformed edges.
- **Ops:** `handleRagDocHeadsIpc(store)`.
- **Expected:** a malformed edge is SKIPPED, never a crash, and an empty-string
  target (a phantom, unselectable document entry) is skipped too — the valid
  edges are emitted sorted, never a `TypeError` from sorting a `undefined`
  `documentId`.

### D2 (LOW-2). `docNavContent` coerces a non-array `docHeads` to `[]`
- **Setup:** a `ctx` with a truthy non-array `docHeads` (an object; a string).
- **Ops:** `docNavContent(ctx)`.
- **Expected:** the `(no documents)` `p` (never a TypeError from `docs.map`).

### D3 (LOW-3). `deriveDocNavDocuments` sorts + dedupes defensively
- **Setup:** an unsorted `docHeads`; a duplicated `docHeads`; a `docHeads` with a
  missing/empty `documentId` entry.
- **Ops:** `deriveDocNavDocuments(docHeads)`.
- **Expected:** sorted by `documentId` (lexicographic ascending), deduped by
  target (first head wins), a missing/empty `documentId` entry skipped — a
  malformed/unsorted/duplicated `docHeads` renders a sorted, deduped doc-nav.

### D4 (LOW-4). `docNavContent` coerces a missing `title` to `''`
- **Setup:** a `docHeads` entry with a missing `title`; an entry with an explicit
  `null` `title`.
- **Ops:** `docNavContent(ctx)`.
- **Expected:** the `li` content is `''` (never `content: undefined`).

### D5 (LOW-5). `reDerive` commits `lastSnapshot` + `lastDocHeads` together
- **Setup:** a harness booted with a valid snapshot + doc-heads; the next
  snapshot fetch returns a DIFFERENT snapshot but the doc-heads fetch fails.
- **Ops:** `host.reDerive()`.
- **Expected:** the re-derive aborts and NEITHER cache is committed —
  `lastSnapshot` is UNCHANGED (stays consistent with the stale `lastDocHeads`),
  never one fresh + one stale.

### D6 (LOW-6). `selectDocument` with a null `lastDocHeads` no-ops
- **Setup:** a harness whose boot doc-heads fetch FAILS → `lastDocHeads` stays
  null.
- **Ops:** `sidebar.selectDocument('doc-a')`.
- **Expected:** `selectDocument` no-ops, never throws (`currentDocumentId` stays
  null, `onRebuild` not called).

---

## E. Run record

| # | Scenario | Result |
| --- | --- | --- |
| A1 | `rag-doc-heads` IPC happy | ✅ PASS |
| A2 | `rag-doc-heads` IPC empty store | ✅ PASS |
| A3 | `rag-doc-heads` IPC dedupe | ✅ PASS |
| A4 | `rag-doc-heads` IPC missing head node | ✅ PASS |
| A5 | `bridge.rag.docHeads()` | ✅ PASS |
| A6 | `deriveDocNavDocuments` happy | ✅ PASS |
| A7 | `deriveDocNavDocuments` null | ✅ PASS |
| A8 | `docNavContent` happy | ✅ PASS |
| A9 | `docNavContent` empty | ✅ PASS |
| A10 | `buildContext` happy | ✅ PASS |
| A11 | `boot` happy | ✅ PASS |
| A12 | `selectDocument` happy (amendment 5) | ✅ PASS |
| A13 | `buildTraversalEnvelope` via `createSnapshotStore` (amendment 4) | ✅ PASS |
| A14 | `reDerive` happy | ✅ PASS |
| A15 | `RagSnapshotPayload` preserved (amendment 9) | ✅ PASS |
| B1 | `rag-doc-heads` IPC null store | ✅ PASS |
| B2 | Boot doc-heads fetch error → boot aborted | ✅ PASS |
| B3 | Re-derive doc-heads fetch error → re-derive aborted | ✅ PASS |
| B4 | `docNavContent` null/undefined ctx/docHeads | ✅ PASS |
| B5 | `selectDocument` bogus id (amendment 5) | ✅ PASS |
| B6 | `buildTraversalEnvelope` listNodes/listEdges-only adapter throws | ✅ PASS |
| C1 | New IPC channel (1) | ✅ PASS |
| C2 | New shared type (1) | ✅ PASS |
| C3 | New bridge method (1) | ✅ PASS |
| C4 | New main handler (1) | ✅ PASS |
| C5 | `PaneContext.docHeads` added; `snapshot` retained | ✅ PASS |
| C6 | Host cache `lastDocHeads` (1) | ✅ PASS |
| C7 | Host adapter replaced (amendment 4) | ✅ PASS |
| C8 | `selectDocument` validation source changed (amendment 5) | ✅ PASS |
| C9 | `RagSnapshotPayload` preserved | ✅ PASS |
| D1 | (MED-1) `handleRagDocHeadsIpc` skips malformed target | ✅ PASS |
| D2 | (LOW-2) `docNavContent` non-array `docHeads` → `[]` | ✅ PASS |
| D3 | (LOW-3) `deriveDocNavDocuments` sort + dedupe | ✅ PASS |
| D4 | (LOW-4) `docNavContent` missing title → `''` | ✅ PASS |
| D5 | (LOW-5) `reDerive` commits caches together | ✅ PASS |
| D6 | (LOW-6) `selectDocument` null `lastDocHeads` no-ops | ✅ PASS |

**Run summary:** 36 scenarios — 36 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-v3-doc-heads-docnav.md` §5.1–§5.9 + §3a passed against the
  live modules. The `rag-doc-heads` IPC handler (`handleRagDocHeadsIpc` — happy,
  empty-store, dedupe, missing-head-node, null-store), the doc-nav helpers
  (`deriveDocNavDocuments`/`docNavContent` — happy, null/non-array, missing-title,
  sort/dedupe), the host (`boot`/`reDerive`/`buildContext`/`selectDocument` —
  happy + fail + the doc-heads validation source), the amendment-4
  `createSnapshotStore` adapter, the amendment-9 `RagSnapshotPayload` preserved,
  every census claim (§5.8), and the §3a adversarial hardening (MED-1, LOW-2..LOW-6)
  match the spec. No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **A5 / C3 (the preload bridge method).** `src/main/preload.ts` imports
  `electron` and is not node-importable. The node-testable contract is the host
  boot calling `bridge.rag.docHeads()` (the bridge method sends the
  `IPC_RAG_DOC_HEADS` IPC and returns the `RagDocHeadsPayload`); the preload
  method itself is verified by code review, per the Unit V3 test-file convention.
- **A13 / B6 (amendment 4).** The `buildTraversalEnvelope` → `createSnapshotStore`
  adapter was already in place from Unit V2; the happy path (the boot renders the
  RAG content) and the fail-state (a `listNodes`/`listEdges`-only adapter throws)
  are GREEN verification tests, not red.
- **A15 / C9 (amendment 9).** The `RagSnapshotPayload` + the `rag-snapshot` IPC
  are preserved for `buildTraversal`; the doc-nav no longer consumes the
  snapshot, but the re-derive still fetches it (the rendering half).
