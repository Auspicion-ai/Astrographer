# Unit V3 — Doc-Heads Doc-Nav: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent).
- **Source contract:** `docs/specs/unit-v3-doc-heads-docnav.md` §5.1–§5.9, §3a.
- **Greens battery (blind-test, already run against the live MODULE):**
  `docs/specs/unit-v3-doc-heads-docnav-greens.md` — 36 scenarios, 36 PASS.
- **Status:** **PARKED — NOT run against the live application.** The Astrographer
  Electron app is NOT running (no Electron process; MCP port 3787 not listening),
  so no live MCP endpoint is reachable. This battery is the handoff for a LATER
  iteration of the live-scenario runner, to be executed once the app is running
  with the `read` group enabled and a seeded fixture with `doc-head` edges.

---

## 1. Why this battery is parked (the live-surface assessment)

The Unit V3 deliverable changes:

- `src/shared/types.ts` — the `IPC_RAG_DOC_HEADS` constant +
  `RagDocHeadsPayload` type.
- `src/main/main.ts` — the `ipcMain.handle(IPC_RAG_DOC_HEADS, ...)` handler
  (delegates to `handleRagDocHeadsIpc`).
- `src/main/preload.ts` — the `bridge.rag.docHeads()` method.
- `src/main/mcp-server.ts` — the shared `handleRagDocHeadsIpc(store)` handler.
- `src/renderer/pane-graph.ts` — `deriveDocNavDocuments`/`docNavContent` switch
  from `ctx.snapshot` to `ctx.docHeads`.
- `src/renderer/sidebar-panes.ts` — the host: `boot`/`reDerive`/`buildContext`/
  `buildTraversalEnvelope`/`selectDocument` + the `lastDocHeads` cache.

**Live-surface audit (this run):**

- **App state:** the Astrographer Electron app is NOT running. `ss` shows no
  listener on MCP port 3787 (the HTTP transport is not up), and no Electron app
  process is alive. The only MCP-related process is a stale
  `node dist/main/battery-host.mjs --mcp-transport=stdio` (a test harness
  spawned by the opencode desktop, running since Aug 27). That harness is NOT a
  usable live endpoint for this unit: it uses the stdio transport (not reachable
  via a port), it constructs `ProvidentMcpServer` with NO `ragStore` and NO
  `templateStore` (`battery-host.ts` passes only `backend, transport, port,
  gate`), and its gate enables only `['read','dispatch','graph','code']`. More
  importantly, the battery host boots a **root-only provident Runtime** (C3 —
  `rootOnlyEnvelope()`) with NO sidebar panes and NO renderer, so it does NOT
  mount the doc-nav pane and has NO renderer to exercise the `rag-doc-heads`
  IPC. The doc-nav pane + the `rag-doc-heads` IPC are renderer-side surfaces
  that only the real Electron app exposes.
- **The `rag-doc-heads` IPC** (`src/main/main.ts:314-316`): a renderer→main IPC
  (NOT an MCP tool). It is exercised through the renderer's
  `bridge.rag.docHeads()` (the preload method), which the host `boot`/`reDerive`
  call. Its observable live result is the rendered "Documents" pane (the
  doc-nav list).
- **The doc-nav pane** (the "Documents" list): a UI surface rendered through
  the provident graph. It is observable via `provident.get_rendered_html` /
  `provident.get_markdown` (the `read` group). The pane's `li` entries carry
  `data-document-id` + `data-current`; the empty state is a `(no documents)` `p`.
  `selectDocument` is driven by dispatching a `pane-doc-nav-select` event on a
  document `li` (the host binds that handler — Unit K §5.3 M2).

**Conclusion:** the live MCP/UI surface for this unit exists in the code (the
rendered "Documents" pane via the `read`-group rendered-document tools, and the
`rag-doc-heads` IPC via the renderer) but the app is NOT running, so no live
endpoint is available to probe. Per the live-runner contract, these scenarios
are **parked** (not failures) and recorded here for a later iteration.

---

## 2. The live surfaces that WILL exercise the Unit V3 behavior

| Live surface | Unit V3 behavior it exercises | How to drive it live |
| --- | --- | --- |
| The rendered "Documents" pane (doc-nav) via `provident.get_rendered_html` / `provident.get_markdown` | `deriveDocNavDocuments`/`docNavContent` (the doc list, the `data-document-id`/`data-current` props, the `(no documents)` empty state), the host `boot`/`reDerive`/`buildContext` (the `docHeads` in `PaneContext`), `selectDocument` (via a `pane-doc-nav-select` dispatch) | Read the rendered document and assert the doc-nav `ul`/`li` list matches the seeded `doc-head` edges; dispatch a select event on a document `li` and assert the current-document re-traversal. |
| The `rag-doc-heads` IPC via the renderer (`bridge.rag.docHeads()`) | `handleRagDocHeadsIpc` (the `{ documents: [{ documentId, title }] }` payload — happy, empty, dedupe, missing-head-node, malformed-target), the `bridge.rag.docHeads()` method | The host `boot`/`reDerive` call `bridge.rag.docHeads()`; its result populates `ctx.docHeads`, which the doc-nav pane renders. The IPC payload is observable through the rendered doc-nav list (the document ids + titles that appear). |

**Prerequisite for the later run:** the app must be running with the MCP server
reachable (stdio or HTTP on 127.0.0.1:3787), the `read` group enabled in the
security gate (for the rendered-document tools), and a seeded RAG store with
`doc-head` edges (the §5.6 fixtures). The `rag-doc-heads` IPC is NOT group-gated
(the renderer is a trusted surface), so no `rag` group is needed for the doc-nav
to render.

---

## 3. The concrete live scenarios to run once the app is running

Each row maps a parked greens scenario to the live surface + the concrete steps
a later iteration will follow. The "expected" column is the greens expectation
re-expressed as a live observable.

### 3.1 The `rag-doc-heads` IPC payload (greens A1–A5, D1)

Exercised through the **rendered "Documents" pane** (the doc-nav list is the
observable of the `bridge.rag.docHeads()` result). The IPC handler
(`handleRagDocHeadsIpc`) runs in main; the renderer's `bridge.rag.docHeads()`
returns its payload, which the host stores in `lastDocHeads` and renders.

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| A1 `rag-doc-heads` IPC happy | rendered doc-nav pane | Seed a store with two `doc-head` edges (`head-b→doc-b`, `head-a→doc-a`), head nodes carrying `content: 'Doc B'`/`'Doc A'`; boot the app; read the rendered document. | The doc-nav pane lists `doc-a` ("Doc A") then `doc-b` ("Doc B") — sorted by document root id ascending, titles from the head node content. |
| A2 `rag-doc-heads` IPC empty store | rendered doc-nav pane | Seed a store with no `doc-head` edges; boot; read the rendered document. | The doc-nav pane shows the `(no documents)` empty state (no throw). |
| A3 `rag-doc-heads` IPC dedupe | rendered doc-nav pane | Seed two `doc-head` edges to the SAME document (`head-a→doc-a`, `head-a2→doc-a`); boot; read the rendered document. | The doc-nav pane lists `doc-a` ONCE (first head wins). |
| A4 `rag-doc-heads` IPC missing head node | rendered doc-nav pane | Seed a `doc-head` edge whose source node is missing from the store; boot; read the rendered document. | The doc-nav pane lists the document with an EMPTY title (no throw). |
| A5 `bridge.rag.docHeads()` | rendered doc-nav pane | Boot the app with a seeded store; read the rendered document. | The boot calls `bridge.rag.docHeads()` (the bridge sends the `IPC_RAG_DOC_HEADS` IPC and returns the `RagDocHeadsPayload`); the doc-nav pane renders the returned document list. |
| D1 (MED-1) malformed target skipped | rendered doc-nav pane | Seed a `doc-head` edge with a missing/undefined/empty target + a valid edge; boot; read the rendered document. | The malformed edge is SKIPPED (no crash); the valid edge's document renders; the doc-nav pane is sorted, never a `TypeError`. |

### 3.2 The doc-nav helpers (greens A6–A9, D2–D4)

Exercised through the **rendered "Documents" pane** (`deriveDocNavDocuments` /
`docNavContent` produce the pane's `ul`/`li`/`p`).

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| A6 `deriveDocNavDocuments` happy | rendered doc-nav pane | Seed a store with two `doc-head` edges; boot; read the rendered document. | The doc-nav pane lists the documents already sorted + deduped (the IPC handler's output). |
| A7 `deriveDocNavDocuments` null | rendered doc-nav pane | Boot with a store whose doc-heads fetch returns an empty list (or a null `lastDocHeads`); read the rendered document. | The doc-nav pane shows the `(no documents)` empty state (no throw). |
| A8 `docNavContent` happy | rendered doc-nav pane | Seed two documents (`doc-a`, `doc-b`); set the current document to `doc-b`; read the rendered document. | The doc-nav pane is a `ul` with two `li` entries sorted by root id ascending (doc-a, doc-b); each `li` carries `data-document-id`; the current document's `li` carries `data-current: 'true'`. |
| A9 `docNavContent` empty | rendered doc-nav pane | Boot with an empty doc-heads list; read the rendered document. | The doc-nav pane is a single `p` with content `(no documents)` (no throw). |
| D2 (LOW-2) non-array `docHeads` → `[]` | rendered doc-nav pane | (Not directly seedable live — the IPC always returns an array.) Covered by the module-level greens; the live doc-nav pane shows the empty state when `docHeads` is empty. | The `(no documents)` `p` (never a `TypeError`). |
| D3 (LOW-3) sort + dedupe defensively | rendered doc-nav pane | Seed a store with unsorted/duplicated `doc-head` edges; boot; read the rendered document. | The doc-nav pane renders a sorted, deduped list (the defensive sort/dedupe in `deriveDocNavDocuments`). |
| D4 (LOW-4) missing title → `''` | rendered doc-nav pane | Seed a `doc-head` edge whose head node has no content; boot; read the rendered document. | The doc-nav `li` content is `''` (never `content: undefined`). |

### 3.3 The host (greens A10–A15, B5, D5, D6)

Exercised through the **rendered "Documents" pane** + a **`pane-doc-nav-select`
dispatch** (the host binds that handler to `selectDocument`).

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| A10 `buildContext` happy | rendered doc-nav pane | Boot with a doc-heads payload; read the rendered document. | The doc-nav pane renders the `docHeads` list (the `PaneContext.docHeads` field is populated alongside the retained `snapshot`). |
| A11 `boot` happy | rendered doc-nav pane | Boot with a valid snapshot + a doc-heads payload; read the rendered document. | The doc-nav pane renders the document list; the RAG content renders (the traversal envelope built via `createSnapshotStore`); `lastDocHeads` is set. |
| A12 `selectDocument` happy (amendment 5) | rendered doc-nav pane + dispatch | Boot with a doc-heads list containing `doc-a`; dispatch a `pane-doc-nav-select` event on the `doc-a` `li`. | `setCurrentDocumentId('doc-a')` + a document-switch re-traversal (the rendered document re-derives to `doc-a`'s content; the `doc-a` `li` carries `data-current: 'true'`). |
| A13 `buildTraversalEnvelope` via `createSnapshotStore` (amendment 4) | rendered doc-nav pane | Boot with a valid one-document snapshot; read the rendered document. | The RAG content renders (`Doc A` appears in the rendered HTML) — the host's adapter is `createSnapshotStore`. |
| A14 `reDerive` happy | rendered doc-nav pane | Boot with a valid snapshot + doc-heads; trigger a `rag-store-changed` re-derive (e.g. an `edit.*` mutation); read the rendered document. | The doc-nav pane refreshes (the doc-heads fetch is called again); the app-graph panes stay MCP-visible. |
| A15 `RagSnapshotPayload` preserved (amendment 9) | rendered doc-nav pane | Boot; read the rendered document. | The RAG content still renders (the rendering half still fetches the full snapshot); `IPC_RAG_SNAPSHOT === 'provident:rag-snapshot'` (unchanged). |
| B5 `selectDocument` bogus id (amendment 5) | rendered doc-nav pane + dispatch | Boot with a doc-heads list containing `doc-a`; dispatch a `pane-doc-nav-select` event with a bogus id (`'bogus'`). | The id is IGNORED (no re-derive with a phantom `documentIds`; `currentDocumentId` stays null; the rendered document does not change). |
| D5 (LOW-5) `reDerive` commits caches together | rendered doc-nav pane | (Not directly seedable live — requires a doc-heads fetch failure mid-re-derive.) Covered by the module-level greens; the live observable is that a failed re-derive leaves the current graph rendered. | The re-derive aborts; the current graph (incl. the doc-nav pane) stays rendered; never one fresh + one stale cache. |
| D6 (LOW-6) `selectDocument` null `lastDocHeads` no-ops | rendered doc-nav pane + dispatch | Boot with a doc-heads fetch that fails (so `lastDocHeads` stays null); dispatch a `pane-doc-nav-select` event. | `selectDocument` no-ops, never throws (`currentDocumentId` stays null; the rendered document does not change). |

### 3.4 Census / numeric claims (greens C1–C9)

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| C1 New IPC channel (1) | **static / code review** | Inspect `src/shared/types.ts`. | `IPC_RAG_DOC_HEADS === 'provident:rag-doc-heads'`. |
| C2 New shared type (1) | **static / code review** | Inspect `src/shared/types.ts`. | `RagDocHeadsPayload` is exported (`{ documents: [{ documentId, title }] }`). |
| C3 New bridge method (1) | rendered doc-nav pane | Boot; read the rendered document. | The host boot calls `bridge.rag.docHeads()` (the node-testable contract of the preload method); the doc-nav pane renders its result. |
| C4 New main handler (1) | **static / code review** | Inspect `src/main/mcp-server.ts`. | `handleRagDocHeadsIpc` is a function on `mcp-server.ts`. |
| C5 `PaneContext.docHeads` added; `snapshot` retained | rendered doc-nav pane | Boot; read the rendered document. | The doc-nav pane renders the `docHeads` list; the RAG content still renders (the `snapshot` is retained). |
| C6 Host cache `lastDocHeads` (1) | rendered doc-nav pane | Boot; read the rendered document. | The doc-nav pane renders the doc-heads list (the boot/re-derive set `lastDocHeads`). |
| C7 Host adapter replaced (amendment 4) | rendered doc-nav pane | Boot with a valid snapshot; read the rendered document. | The RAG content renders (the host's `buildTraversalEnvelope` uses `createSnapshotStore`). |
| C8 `selectDocument` validation source changed (amendment 5) | rendered doc-nav pane + dispatch | Boot with a doc-heads list containing `doc-a`; dispatch a `pane-doc-nav-select` event with an id in the snapshot edges but NOT in the doc-heads list. | The id is IGNORED (validated against the doc-heads list, not `lastSnapshot.edges`). |
| C9 `RagSnapshotPayload` preserved | **static / code review** | Inspect `src/shared/types.ts`. | `IPC_RAG_SNAPSHOT === 'provident:rag-snapshot'` (unchanged). |

### 3.5 Fail-states (greens B1–B4, B6)

| Greens | Live surface | Concrete live steps | Expected (live) |
| --- | --- | --- | --- |
| B1 `rag-doc-heads` IPC null store | **NOT reachable live** | — | Internal validation; the live app always has a store configured. Parked as not-live-exercisable. |
| B2 Boot doc-heads fetch error → boot aborted | **NOT reachable live** | — | Requires a bridge error injection during boot; not reachable through the live MCP/UI surface. Parked as not-live-exercisable. |
| B3 Re-derive doc-heads fetch error → re-derive aborted | **NOT reachable live** | — | Requires a bridge error injection during re-derive; not reachable through the live MCP/UI surface. Parked as not-live-exercisable. |
| B4 `docNavContent` null/undefined ctx/docHeads | **NOT reachable live** | — | Internal null-guard; the live doc-nav pane always receives a valid `PaneContext`. Parked as not-live-exercisable. |
| B6 `buildTraversalEnvelope` listNodes/listEdges-only adapter throws | **NOT reachable live** | — | Internal adapter enforcement; the live app uses `createSnapshotStore`. Parked as not-live-exercisable. |

---

## 4. Parked-scenario census

- **Total greens scenarios:** 36.
- **Parked for a later live run (exercisable once the app is running with the
  `read` group enabled + a seeded fixture with `doc-head` edges):**
  - via the rendered "Documents" pane (`provident.get_rendered_html` /
    `get_markdown`): A1, A2, A3, A4, A5, A6, A7, A8, A9, A10, A11, A12, A13,
    A14, A15, D1, D2, D3, D4, D5, D6 = **21**.
  - via a `pane-doc-nav-select` dispatch (the host's `selectDocument`): A12, B5,
    D6, C8 (overlap with the rendered pane; the dispatch is the driver) = **4**.
  - via static / code review (census constants + types): C1, C2, C4, C9 = **4**.
  - **Total live-exercisable:** 25 (A1–A15, D1–D6, C1, C2, C4, C9).
- **Parked as NOT live-exercisable (internal validation / bridge-error injection,
  no live surface will ever reach them):** B1, B2, B3, B4, B6 = **5**. These are
  documented here so a later iteration does not re-attempt them live; they are
  covered by the module-level greens (already PASS) and are not a failure.
- **Census scenarios C3, C5, C6, C7, C8** are exercised through the rendered
  doc-nav pane (the observable of the host behavior), not statically — they are
  counted in the 21 rendered-pane scenarios above.
- **Total parked:** 36. **Run live this iteration:** 0.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger:** execute this battery when the Astrographer Electron app is
   running and the MCP server is reachable (stdio or HTTP on 127.0.0.1:3787).
   The rendered-document scenarios (A1–A15, D1–D6) need the `read` group enabled
   (for `provident.get_rendered_html`/`get_markdown`). The `rag-doc-heads` IPC
   is NOT group-gated (the renderer is a trusted surface), so the doc-nav pane
   renders without the `rag` group.
2. **Prerequisites:** app running; `read` tool group enabled in the security
   gate; a seeded RAG store with `doc-head` edges (the §5.6 fixtures). For the
   `selectDocument` scenarios (A12, B5, D6, C8), dispatch a `pane-doc-nav-select`
   event on a document `li` (the host binds that handler — Unit K §5.3 M2).
3. **A live result that CONTRADICTS the greens is a finding** (a real regression
   or a doc/spec drift) — never a pass. Report it to the supervisor.
4. **The 5 not-live-exercisable scenarios** (B1, B2, B3, B4, B6) should be
   recorded as "covered by module-level greens; not reachable through the live
   MCP/UI surface" — they are NOT failures and NOT re-attempted live.
5. **Doc-staleness:** when this battery is executed, reconcile it against the
   actual repo/build state (the V3 spec may renumber sections or rename
   surfaces) before running.
