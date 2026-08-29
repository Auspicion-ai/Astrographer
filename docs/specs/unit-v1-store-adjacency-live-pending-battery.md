# Unit V1 — Store Adjacency: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent).
- **Source contract:** `docs/specs/unit-v1-store-adjacency.md` §5.1–§5.7, §3a.
- **Greens battery (blind-test, already run against the live MODULE):**
  `docs/specs/unit-v1-store-adjacency-greens.md` — 40 scenarios, 40 PASS.
- **Status:** **PARKED — NOT run against the live application.** The Unit V1
  adjacency surface is INTERNAL to the RAG store and is not exposed by any
  current MCP tool or UI control. This battery is the handoff for a LATER
  iteration of the live-scenario runner, to be executed once Units V2/V3 land
  and expose the adjacency behavior through the live MCP/UI surface.

---

## 1. Why this battery is parked (the live-surface assessment)

The Unit V1 deliverable adds to `src/main/rag-store.ts`:

- the shared PURE adjacency core (`buildAdjacencyIndex` + the 5 `*Index` query
  helpers),
- the 5 new `RagStore` interface methods (`edgesFrom`/`edgesTo`/`edgesByKind`/
  `edgesForDocument`/`docHeadForDocument`),
- the lazy O(E) index + invalidation across the 6 mutation paths,
- the quarantine exclusion,
- `createSnapshotStore(nodes, edges)` (the read-only adapter).

**Live-surface audit (this run):**

- **MCP tools** (`src/main/mcp-server.ts`): the `rag.*` group is
  `rag.query`, `rag.get_document`, `rag.list_nodes`, `rag.get_edges`,
  `rag.backlinks`. **None** of the five adjacency methods is registered or
  reachable. `rag.get_document` currently does its own inline node/edge scoping
  (`mcp-server.ts:150-192`) and does NOT call the adjacency methods.
- **IPC handlers** (`src/main/main.ts`): `IPC_EDIT_COMMIT`, `IPC_EDIT_BATCH`,
  `IPC_EDIT_RICH_COMMIT`, `IPC_RAG_QUERY`, `IPC_RAG_BACKLINKS`,
  `IPC_TEMPLATE_*`, `IPC_OPERATOR_SETTINGS_*`, `IPC_RAG_SNAPSHOT`. The
  `IPC_RAG_SNAPSHOT` handler returns a raw `{ nodes, edges }` snapshot — it does
  NOT expose any adjacency query.
- **Preload / renderer** (`src/main/preload.ts`, `src/renderer/*`): a grep for
  `edgesFrom|edgesTo|edgesByKind|edgesForDocument|docHeadForDocument|
  buildAdjacencyIndex|createSnapshotStore` across `src/` matches **only**
  `src/main/rag-store.ts`. No renderer pane, no bridge method, no traversal
  consumer references the adjacency surface.
- **App state:** the Astrographer Electron app is NOT running (no Electron
  process; MCP port 3787 not listening), so no live endpoint is available to
  probe even for the indirectly-exercising tools.

**Conclusion:** the adjacency methods are consumed ONLY by `buildTraversal`
(Unit V2) and the doc-nav (Unit V3), both of which are PENDING. The required
live MCP/UI surface does not exist yet. Per the live-runner contract, these
scenarios are **parked** (not failures) and recorded here for a later
iteration.

---

## 2. The live surfaces that WILL exercise the adjacency behavior (Units V2/V3)

Once Units V2/V3 land, the following live surfaces consume the Unit V1
adjacency methods. A later iteration of the live-scenario runner should drive
the scenarios through these surfaces:

| Live surface | Unit | Adjacency methods it consumes | How to drive it live |
| --- | --- | --- | --- |
| `rag.get_document` MCP tool (refactored onto `computeDocumentSubgraph`) | V2 | `edgesForDocument`, `edgesFrom`, `docHeadForDocument` | Call `rag.get_document { documentId }`; assert the returned `{ documentId, nodes, edges }` subgraph matches the adjacency-derived scoping. |
| `buildTraversal` scoped walk (via the renderer re-derive) | V2 | `edgesForDocument`, `edgesFrom`, `edgesByKind`, `docHeadForDocument` | After a `rag-store-changed` broadcast, read `provident.get_rendered_html` / `provident.get_markdown` and assert the rendered document subtree reflects the adjacency-derived traversal. |
| `rag-doc-heads` IPC (the doc-nav) | V3 | `docHeadForDocument`, `edgesByKind` | Invoke the `rag-doc-heads` IPC (or read the doc-nav pane) and assert the returned document-head list (documentId + title from the doc-head source node) matches `docHeadForDocument`/`edgesByKind`. |
| The doc-nav pane (renderer) | V3 | `docHeadForDocument`, `edgesByKind` | Read the rendered doc-nav pane (via `provident.get_rendered_html`) and assert the listed document heads match the adjacency-derived heads. |
| `edit.*` MCP tools + UI edit IPC (mutation → invalidation) | V2/V3 | the lazy-index invalidation (all 6 mutation paths) | Mutate via `edit.set_edge`/`edit.create_node`/`edit.delete_node`/`edit.import_markdown` (or the UI commit/batch IPC), then re-read `rag.get_document` / rendered HTML and assert the adjacency-derived result reflects the mutation. |

**Prerequisite for the later run:** the app must be running with the MCP server
reachable (stdio or HTTP on 127.0.0.1:3787), the `rag`/`edit` tool groups
enabled in the security gate, and a seeded RAG store.

---

## 3. The concrete live scenarios to run once Units V2/V3 land

Each row maps a parked greens scenario to the live surface + the concrete steps
a later iteration will follow. The "expected" column is the greens expectation
re-expressed as a live observable.

### 3.1 Shared PURE adjacency core (greens A1–A14)

These are pure functions with no live exposure. They are exercised **only
indirectly** through the consumers in §2. The happy-path semantics (A1–A10) are
observable through `rag.get_document` / the rendered traversal; the throw
patterns (A11–A14) are internal validation and are **not reachable** through
any live MCP/UI surface (the live surfaces validate their own inputs first).

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| A1 `buildAdjacencyIndex([])` all-empty | (indirect) `rag.get_document` on an empty store | Seed an empty store; call `rag.get_document { documentId }`. | Returns `{ documentId, nodes: [], edges: [] }` (no throw). |
| A2 `buildAdjacencyIndex(populated)` | (indirect) `rag.get_document` | Seed the §5.6 fixture; call `rag.get_document { documentId: 'doc' }`. | Returns the doc-flow edges scoped to `doc` + the global `doc-child` edge (the `document['doc']` set). |
| A3 `edgesFromIndex` happy | (indirect) `rag.get_document` / rendered traversal | Seed fixture; read the rendered document subtree. | The subtree's `doc-child` edges from `a` are present (the `from['a']` set). |
| A4 `edgesToIndex` happy | (indirect) rendered traversal | Seed fixture; read the rendered subtree. | The `to['d']` edges (`e5`,`e6`) are reflected in the traversal. |
| A5 `edgesByKindIndex` happy | (indirect) `rag.get_document` / doc-nav | Seed fixture; read the doc-nav / `rag.get_document`. | `doc-child` and `parent-child` edges are grouped correctly in the derived output. |
| A6 `edgesForDocumentIndex` happy | `rag.get_document` | Seed fixture; call `rag.get_document { documentId: 'doc' }`. | `edges` = `[e2,e3,e4,e5]` (doc-flow scoped by `documentIds` + the global `doc-child`). |
| A7 `docHeadForDocumentIndex` happy | `rag-doc-heads` IPC / doc-nav | Seed fixture; read the doc-nav. | The doc-nav lists `doc` with head `head` (title from the `head` node). |
| A8 `docHeadForDocumentIndex` no head | `rag-doc-heads` IPC / doc-nav | Seed a store with a document that has no `doc-head` edge. | The doc-nav does NOT list that document (no head). |
| A9 Multiple-heads first-wins | `rag-doc-heads` IPC / doc-nav | Seed two `doc-head` edges for `doc` (`head1`→`a`, `head2`→`b`). | The doc-nav lists `doc` with head `head1` (the FIRST in store order). |
| A10 Unmatched id → empty array | `rag.get_document` | Call `rag.get_document { documentId: 'ghost' }`. | Returns `{ documentId: 'ghost', nodes: [], edges: [] }` (no throw). |
| A11–A14 throw patterns | **NOT reachable live** | — | Internal validation; the live surfaces validate their own inputs. Parked as not-live-exercisable (documented, not a failure). |

### 3.2 JSON store adjacency methods (greens B1–B8)

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| B1 `edgesFrom` happy (fresh copies) | (indirect) rendered traversal | Seed fixture; read the rendered subtree. | The `from['a']` edges (`e1`,`e3`,`e5`) are reflected in the traversal. |
| B2 `edgesTo` happy | (indirect) rendered traversal | Seed fixture; read the rendered subtree. | The `to['d']` edges (`e5`,`e6`) are reflected. |
| B3 `edgesByKind` happy | (indirect) `rag.get_document` / doc-nav | Seed fixture; read the doc-nav / `rag.get_document`. | `doc-child`/`parent-child` edges grouped correctly. |
| B4 `edgesForDocument` happy | `rag.get_document` | Seed fixture; call `rag.get_document { documentId: 'doc' }`. | `edges` = `[e2,e3,e4,e5]`. |
| B5 `docHeadForDocument` happy | `rag-doc-heads` IPC / doc-nav | Seed fixture; read the doc-nav. | `doc` listed with head `head`. |
| B6 Unmatched id → empty/undefined | `rag.get_document` | Call `rag.get_document { documentId: 'ghost' }`. | `{ documentId: 'ghost', nodes: [], edges: [] }` (no throw). |
| B7/B8 throw patterns | **NOT reachable live** | — | Internal validation; the live surfaces validate their own inputs. Parked as not-live-exercisable. |

### 3.3 Lazy O(E) index + invalidation across the 6 mutation paths (greens C1–C6)

These are exercised live by mutating through the `edit.*` MCP tools (or the UI
edit IPC) and then re-reading an adjacency-consuming surface.

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| C1 `putEdge` invalidates | `edit.set_edge` → `rag.get_document` | Seed `a`,`c`; read `rag.get_document` (no edge); call `edit.set_edge { kind:'doc-child', source:'a', target:'c' }`; re-read `rag.get_document`. | The new edge appears in the returned subgraph (index rebuilt). |
| C2 `removeEdge` invalidates | `edit.delete_node`/`edit.set_edge` → `rag.get_document` | Seed `a`,`c` + edge `e1`; read (edge present); remove the edge; re-read. | The edge is gone from the returned subgraph. |
| C3 `removeNode` cascade invalidates | `edit.delete_node` → `rag.get_document` | Seed `a`,`c` + edge `e1` (a→c); read (edge present); `edit.delete_node { nodeId:'a' }`; re-read. | The cascaded edge is dropped from the subgraph. |
| C4 `applyBatch` invalidates | `edit.import_markdown` (or UI `edit-batch` IPC) → `rag.get_document` | Seed `a`,`c`; read (no edge); import a corpus that adds the edge; re-read. | The new edge appears (batch applied + index rebuilt). |
| C5 `undo` invalidates | `edit.*` + undo → `rag.get_document` | Seed `a`,`c` + edge `e1`; read (edge present); undo the edge-add; re-read. | The edge is gone. |
| C6 `redo` invalidates | `edit.*` + undo + redo → `rag.get_document` | After C5's undo, redo; re-read. | The edge is back. |

### 3.4 Quarantine exclusion (greens D1)

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| D1 Quarantined edge excluded | `rag.get_document` / rendered traversal | Seed a store; tamper an on-disk edge's `order` without updating its hash; reload the store; read `rag.get_document` / rendered HTML. | The quarantined edge is NOT in the returned subgraph / rendered output. |

### 3.5 `createSnapshotStore` read-only adapter (greens E1–E5)

`createSnapshotStore` is consumed by `buildTraversal` (Unit V2) and the host's
`buildTraversalEnvelope` (Unit V3). Its behavior is exercised live through the
rendered traversal (the walk runs against a snapshot store).

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| E1 Parity (amendment 3) | rendered traversal vs `rag.get_document` | Seed a store; read the rendered traversal (snapshot-backed) and `rag.get_document` (JSON-store-backed). | The two surfaces produce IDENTICAL document subgraphs (the adapter delegates to the SAME pure functions). |
| E2 Read methods | rendered traversal / doc-nav | Seed a store; read the rendered output. | The snapshot-backed traversal reflects the fixture nodes/edges; `status` shows no corruption/quarantine. |
| E3 Empty adapter | rendered traversal on an empty store | Seed an empty store; read the rendered output. | No throw; empty document subgraph. |
| E4/E5 construction throws / fail-closed | **NOT reachable live** | — | Internal adapter validation; the live surfaces never construct an invalid snapshot. Parked as not-live-exercisable. |

### 3.6 Adversarial resolutions (greens F1–F6)

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| F1 MED-1 immutable snapshot view | rendered traversal | Seed a store; read the rendered traversal; mutate the store via `edit.*`; re-read. | The rendered traversal reflects the NEW store state (the snapshot is a captured view, rebuilt on re-derive). |
| F2 MED-2 duplicate `documentIds` deduped | `rag.get_document` | Seed a `doc-head` edge with `documentIds:['doc','doc']`; call `rag.get_document { documentId:'doc' }`. | The edge appears ONCE in the returned subgraph. |
| F3 MED-3 global `doc-child` scoping | `rag.get_document` | Seed a `doc-head` edge for `doc` + a global `doc-child` edge; call `rag.get_document { documentId:'doc' }`. | The global `doc-child` edge is scoped into `doc`'s subgraph. |
| F4 LOW-4 throw-message parity | **NOT reachable live** | — | Internal validation. Parked as not-live-exercisable. |
| F5 LOW-5 `docHeadForDocument` trusts input | `rag-doc-heads` IPC / doc-nav | Seed a snapshot with a `doc-head` edge whose source is absent from the nodes; read the doc-nav. | The doc-nav lists the dangling head id (the adapter is a read-only projection). |
| F6 LOW-6 no-op mutations keep index correct | `edit.*` no-op → `rag.get_document` | Seed `a`,`b` + edge `e1`; read (edge present); perform a no-op mutation (e.g. `edit.delete_node` on a ghost id); re-read. | The edge is still present (no correctness regression). |

---

## 4. Parked-scenario census

- **Total greens scenarios:** 40.
- **Parked for a later live run (indirectly exercisable once V2/V3 land):**
  A1–A10, B1–B6, C1–C6, D1, E1–E3, F1–F3, F5, F6 = **31**.
- **Parked as NOT live-exercisable (internal validation / adapter construction,
  no live surface will ever reach them):** A11–A14, B7–B8, E4–E5, F4 = **9**.
  These are documented here so a later iteration does not re-attempt them live;
  they are covered by the module-level greens (already PASS) and are not a
  failure.
- **Total parked:** 40. **Run live this iteration:** 0.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger:** execute this battery after Unit V2 (`buildTraversal`
   scoped walk + the `rag.get_document` refactor) and/or Unit V3 (`rag-doc-heads`
   IPC + the doc-nav switch) land, when the app is running and the MCP server is
   reachable.
2. **Prerequisites:** app running (stdio or HTTP on 127.0.0.1:3787); `rag` +
   `edit` tool groups enabled in the security gate; a seeded RAG store (the §5.6
   fixture). For the mutation scenarios, drive `edit.*` MCP tools (or the UI
   edit IPC) and re-read the adjacency-consuming surface.
3. **A live result that CONTRADICTS the greens is a finding** (a real regression
   or a doc/spec drift) — never a pass. Report it to the supervisor.
4. **The 9 not-live-exercisable scenarios** (A11–A14, B7–B8, E4–E5, F4) should
   be recorded as "covered by module-level greens; not reachable through the
   live MCP/UI surface" — they are NOT failures and NOT re-attempted live.
5. **Doc-staleness:** when this battery is executed, reconcile it against the
   actual repo/build state (the V2/V3 specs may renumber sections or rename
   surfaces) before running.
