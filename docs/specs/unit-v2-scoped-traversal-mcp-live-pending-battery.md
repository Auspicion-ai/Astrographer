# Unit V2 — Scoped Traversal + MCP Refactor: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent).
- **Source contract:** `docs/specs/unit-v2-scoped-traversal-mcp.md` §5.1–§5.7, §3a.
- **Greens battery (blind-test, already run against the live MODULE):**
  `docs/specs/unit-v2-scoped-traversal-mcp-greens.md` — 32 scenarios, 32 PASS.
- **Status:** **PARKED — NOT run against the live application.** The Astrographer
  Electron app is NOT running (no Electron process; MCP port 3787 not listening),
  so no live MCP endpoint is reachable. This battery is the handoff for a LATER
  iteration of the live-scenario runner, to be executed once the app is running
  with the `rag` group enabled and a seeded fixture.

---

## 1. Why this battery is parked (the live-surface assessment)

The Unit V2 deliverable changes:

- `src/main/traversal.ts` — the scoped `buildTraversal` walk (only the reachable
  subgraph from the head via `doc-head` → `next-section` → `doc-end` +
  `doc-child` + multi-parent `parent-child`), the shared
  `computeDocumentSubgraph(store, documentId)` helper, and the
  `rebuildBackRefs` adapter replacement (`createSnapshotStore`).
- `src/main/mcp-server.ts` — the `rag.get_document` MCP tool refactored onto
  `computeDocumentSubgraph` (the `{ documentId, nodes, edges }` contract
  preserved).
- `src/main/adjacency.ts` — the node-free pure adjacency core +
  `createSnapshotStore` (Unit V1, consumed here).
- the renderer's `buildTraversalEnvelope` adapter replacement.

**Live-surface audit (this run):**

- **App state:** the Astrographer Electron app is NOT running. `ss` shows no
  listener on MCP port 3787 (the HTTP transport is not up), and no Electron app
  process is alive. The only MCP-related process is a stale
  `node dist/main/battery-host.mjs --mcp-transport=stdio` (a test harness
  spawned by the opencode desktop, running since Aug 27). That harness is NOT a
  usable live endpoint for this unit: it uses the stdio transport (not
  reachable via a port), it constructs `ProvidentMcpServer` with NO `ragStore`
  (`battery-host.ts` passes only `backend, transport, port, gate`), and its gate
  enables only `['read','dispatch','graph','code']` — the `rag` group is
  default-off and NOT enabled. So `rag.get_document` is not registered there.
- **MCP tools** (`src/main/mcp-server.ts`): the `rag.*` group is
  `rag.query`, `rag.get_document`, `rag.list_nodes`, `rag.get_edges`,
  `rag.backlinks`. `rag.get_document` IS the refactored live surface for the
  document-subgraph contract (it calls `computeDocumentSubgraph`). It is
  registered only when the `rag` group is enabled in the security gate.
- **Rendered document** (`provident.get_rendered_html` / `provident.get_markdown`):
  the scoped `buildTraversal` walk is exercised through the rendered document —
  the envelope's content roots / backRefs / lineMap are the observable
  `materialized` set. These tools are in the `read` group.
- **Doc-nav (Unit V3):** the head-reachable materialization (the edit-surface
  shrink) is additionally observable through the doc-nav, which is PENDING
  (Unit V3). The rendered document already exposes the head-reachable set.

**Conclusion:** the live MCP/UI surface for this unit exists in the code
(`rag.get_document` + the rendered-document tools) but the app is NOT running,
so no live endpoint is available to probe. Per the live-runner contract, these
scenarios are **parked** (not failures) and recorded here for a later iteration.

---

## 2. The live surfaces that WILL exercise the Unit V2 behavior

| Live surface | Unit V2 behavior it exercises | How to drive it live |
| --- | --- | --- |
| `rag.get_document` MCP tool (refactored onto `computeDocumentSubgraph`) | the document-subgraph contract (`{ documentId, nodes, edges }`), the shared `computeDocumentSubgraph` derivation, the unknown-id `nodes: []` case, the missing-`documentId` throw | Call `rag.get_document { documentId }`; assert the returned subgraph matches the spec. |
| `provident.get_rendered_html` / `provident.get_markdown` (the rendered document) | the scoped `buildTraversal` walk — the envelope content roots / backRefs / lineMap (the observable `materialized` set), the doc-head marker, duplicate subtrees, doc-child nesting, the edit-surface shrink | After a `rag-store-changed` broadcast (or on boot), read the rendered document and assert the materialized subtree reflects the scoped walk. |
| The doc-nav (Unit V3, PENDING) | the head-reachable materialization (the edit-surface shrink) | Read the doc-nav pane / `rag-doc-heads` IPC and assert the listed document heads match the head-reachable set. |

**Prerequisite for the later run:** the app must be running with the MCP server
reachable (stdio or HTTP on 127.0.0.1:3787), the `rag` group enabled in the
security gate (the `read` group for the rendered-document tools), and a seeded
RAG store (the §5.6 fixtures).

---

## 3. The concrete live scenarios to run once the app is running

Each row maps a parked greens scenario to the live surface + the concrete steps
a later iteration will follow. The "expected" column is the greens expectation
re-expressed as a live observable.

### 3.1 The scoped `buildTraversal` walk (greens A1–A14)

Exercised through the **rendered document** (`provident.get_rendered_html` /
`provident.get_markdown`). The envelope's content roots (the `materialized`
set), the backRefs keys, and the lineMap ranges are the live observables.

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| A1 Single doc / single zone | rendered document | Seed `root, H(h1,'Title')` + `doc-head H→root`, `doc-end H→root`; read the rendered document. | One container producer (`main`); one content root for H with `data-doc-head=true`; backRefs has one entry; lineMap one range. |
| A2 Multiple docs / one zone | rendered document | Seed `root1,H1,root2,H2` (two docs); read the rendered document. | One container producer; two content roots (`rag-H1`, `rag-H2`); backRefs two entries; lineMap two ranges. |
| A3 Valid doc-flow / doc-head marker | rendered document | Seed `root,H,A,B,E` + valid flow; read the rendered document. | H's subtree root carries `data-doc-head=true`; A/B/E do NOT. |
| A4 Doc-flow cycle → fallback | rendered document | Seed `root,H,A,B,E` with a `next-section` cycle (`B→A`); read the rendered document. | No throw; the envelope still renders content payloads (family-pre-order fallback). |
| A5 Multi-parent → duplicate subtrees | rendered document | Seed `root,H,A,B,E,M` with `parent-child A→M`, `parent-child B→M`; read the rendered document. | M materialized as TWO duplicate content roots (`rag-M`); backRefs has one entry for M. |
| A6 Doc-child nesting (ul + 4 li) | rendered document | Seed `root,H,UL,LI1..LI4,E` with `doc-child UL→LI*` (order 0–3); read the rendered document. | The UL content root is a `ul` with the four `li` doc-children at their `order` positions; backRefs 7 entries; lineMap 4 li ranges. |
| A7 E2E cross-document shared node (B/C → A → D) | rendered document | Seed `B-root,C-root,B-head,B-use,C-head,C-use,A,D` (B/C → A → D); read the rendered document. | A materialized as TWO duplicate roots (`rag-A`); D in both documents (two `rag-D` roots); backRefs one entry for A. |
| A8 Doc-child cycle → fallback (no infinite loop) | rendered document | Seed `root,H,A,B,E` with `doc-child A→B`, `doc-child B→A`; read the rendered document. | Terminates (no hang); no throw; content renders via the family-pre-order fallback. |
| A9 Edit-surface shrink (node not reachable from head dropped) | rendered document (+ doc-nav, Unit V3) | Seed `root,H,A,B,E,STRAY,X` with `next-section STRAY→X` (STRAY in the doc's node set but NOT reachable from the head); read the rendered document. | H/A/B/E materialized; STRAY and X are NOT in the content roots / backRefs (the accepted edit-surface change). |
| A10 Null/undefined input throws | **NOT reachable live** | — | Internal validation; the live surfaces validate their own inputs first. Parked as not-live-exercisable. |
| A11 listNodes/listEdges-only adapter throws | **NOT reachable live** | — | Internal adapter enforcement; the live app uses `createSnapshotStore`. Parked as not-live-exercisable. |
| A12 Empty document → no ContentPayload | rendered document | Seed only a `root` node (no content, no edges); read the rendered document. | No throw; the container producer (`main`) still renders; no content payload for the empty document. |
| A13 Doc-flow missing-head → fallback | rendered document | Seed `root,A,B` with `next-section A→B`, `doc-end B→root` (no `doc-head`); read the rendered document. | No throw; content renders via the family-pre-order fallback. |
| A14 HARD PRECONDITION — targetPlacement has a container | rendered document | Seed `root,H,A` + valid flow; read the rendered document. | Every content root's `targetPlacement` zone has a matching container producer in the template root. |

### 3.2 `computeDocumentSubgraph` (greens B1–B6)

Exercised through the **`rag.get_document` MCP tool** (the tool calls
`computeDocumentSubgraph` and returns its `docNodeIds`/`edges`).

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| B1 Happy — doc root + flow + transitive doc-children | `rag.get_document` | Seed `root,H,A,B,E,LI` + valid flow + `doc-child A→LI`; call `rag.get_document { documentId:'root' }`. | `nodes` = `[root,H,A,B,E,LI]`; `edges` = the scoped doc-flow edges + the `doc-child` edge. |
| B2 Empty document | `rag.get_document` | Seed only `root`; call `rag.get_document { documentId:'root' }`. | `{ documentId:'root', nodes:[root], edges:[] }`. |
| B3 Unknown document id | `rag.get_document` | Seed `root`; call `rag.get_document { documentId:'ghost' }`. | `{ documentId:'ghost', nodes:[], edges:[] }` (no crash). |
| B4 Malformed — `doc-head` edge with a missing target | `rag.get_document` | Seed `H` + `doc-head H→missing-root`; call `rag.get_document { documentId:'root' }`. | No crash; the closure adds `H`/`missing-root` to the node set (the `validateDocFlow` fallback handles the missing node downstream). |
| B5 Null/undefined store throws | **NOT reachable live** | — | Internal validation; the live `rag.get_document` never passes a null store (the `handleRagTool` top guard fires first). Parked as not-live-exercisable. |
| B6 Non-string/empty-string documentId throws | **NOT reachable live** | — | Internal validation; the live `rag.get_document` validates `documentId` before calling `computeDocumentSubgraph` (the tool's own guard fires first — see C4). Parked as not-live-exercisable. |

### 3.3 The `rag.get_document` MCP refactor (greens C1–C5)

Exercised **directly** through the `rag.get_document` MCP tool.

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| C1 Happy — `{ documentId, nodes, edges }` | `rag.get_document` | Seed `root,H,A,LI` + valid flow + `doc-child A→LI`; call `rag.get_document { documentId:'root' }`. | Returns `{ documentId:'root', nodes:[root,H,A,LI], edges:[scoped doc-flow + doc-child] }`. |
| C2 Empty document | `rag.get_document` | Seed only `root`; call `rag.get_document { documentId:'root' }`. | `{ documentId:'root', nodes:[root], edges:[] }`. |
| C3 Unknown document id | `rag.get_document` | Seed `root`; call `rag.get_document { documentId:'ghost' }`. | `{ documentId:'ghost', nodes:[], edges:[] }` — NOT `[<doc root>]`. |
| C4 Missing/empty documentId throws | `rag.get_document` | Call `rag.get_document {}` and `rag.get_document { documentId:'' }`. | Each throws `Error('rag.get_document: documentId required')`. |
| C5 Null store throws | **NOT reachable live** | — | Internal validation; the live app always has a store configured. Parked as not-live-exercisable. |

### 3.4 Cross-cutting amendments (greens D1–D7)

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| D1 `materialized`-set equivalence | rendered document (+ doc-nav, Unit V3) | Seed `root,H,A,B,E` + valid flow; read the rendered document. | The materialized content-root set is exactly `{H,A,B,E}` (the doc root is the container, not a content root); backRefs keys are the same set. |
| D2 Single-source identity (traversal == MCP node set) | `rag.get_document` + rendered document | Seed `root,H,A,LI` + valid flow + `doc-child A→LI`; call `rag.get_document { documentId:'root' }` AND read the rendered document. | The `rag.get_document` node set equals the traversal's `docNodeIds` (the SINGLE shared derivation — neither re-derives inline). |
| D3 Adapter replacement (createSnapshotStore; only-adapter throws) | **NOT reachable live** | — | Internal adapter enforcement; the live app uses `createSnapshotStore`. Parked as not-live-exercisable. |
| D4 `rag.get_document` identical result (contract) | `rag.get_document` | Seed `root,H,A,LI` + valid flow + `doc-child A→LI`; call `rag.get_document { documentId:'root' }`. | `nodes` = the store's nodes whose id is in `docNodeIds`; `edges` = the doc-flow edges scoped by `documentId` + the `doc-child` edges among the document's nodes — the exact `{ documentId, nodes, edges }` contract. |
| D5 `validateDocFlow` pre-scoping verdict match | **NOT reachable live** | — | Internal validation; `validateDocFlow` is not exposed by any MCP/UI surface. Parked as not-live-exercisable. |
| D6 `rebuildBackRefs` via `createSnapshotStore` | **NOT reachable live** | — | Internal adapter construction; not exposed by any MCP/UI surface. Parked as not-live-exercisable. |
| D7 `rebuildBackRefs` empty-snapshot path | **NOT reachable live** | — | Internal adapter construction; not exposed by any MCP/UI surface. Parked as not-live-exercisable. |

---

## 4. Parked-scenario census

- **Total greens scenarios:** 32.
- **Parked for a later live run (exercisable once the app is running with the
  `rag` group enabled + a seeded fixture):**
  - via `rag.get_document`: C1, C2, C3, C4, D2, D4, and B1, B2, B3, B4
    (indirectly — the tool returns the `computeDocumentSubgraph` result) = **10**.
  - via the rendered document (`provident.get_rendered_html`/`get_markdown`):
    A1, A2, A3, A4, A5, A6, A7, A8, A9, A12, A13, A14, D1 = **13**.
  - via the doc-nav (Unit V3, PENDING — head-reachable materialization): A3, A9,
    D1 (overlap with the rendered document; the doc-nav is an additional
    observable once Unit V3 lands).
  - **Total live-exercisable:** 23 (A1–A9, A12–A14, B1–B4, C1–C4, D1, D2, D4).
- **Parked as NOT live-exercisable (internal validation / adapter construction,
  no live surface will ever reach them):** A10, A11, B5, B6, C5, D3, D5, D6, D7
  = **9**. These are documented here so a later iteration does not re-attempt
  them live; they are covered by the module-level greens (already PASS) and are
  not a failure.
- **Total parked:** 32. **Run live this iteration:** 0.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger:** execute this battery when the Astrographer Electron app is
   running and the MCP server is reachable (stdio or HTTP on 127.0.0.1:3787).
   The `rag.get_document` scenarios (C1–C4, B1–B4, D2, D4) can run as soon as the
   app is up with the `rag` group enabled. The rendered-document scenarios
   (A1–A9, A12–A14, D1) need the `read` group enabled. The doc-nav scenarios
   (A3, A9, D1 head-reachable materialization) additionally need Unit V3.
2. **Prerequisites:** app running; `rag` + `read` tool groups enabled in the
   security gate; a seeded RAG store (the §5.6 fixtures). For the rendered-document
   scenarios, ensure a `rag-store-changed` broadcast (or a boot) has re-derived
   the graph before reading `provident.get_rendered_html`/`get_markdown`.
3. **A live result that CONTRADICTS the greens is a finding** (a real regression
   or a doc/spec drift) — never a pass. Report it to the supervisor.
4. **The 9 not-live-exercisable scenarios** (A10, A11, B5, B6, C5, D3, D5, D6,
   D7) should be recorded as "covered by module-level greens; not reachable
   through the live MCP/UI surface" — they are NOT failures and NOT re-attempted
   live.
5. **Doc-staleness:** when this battery is executed, reconcile it against the
   actual repo/build state (the V2/V3 specs may renumber sections or rename
   surfaces) before running.
