# Spec — Unit U-H8: The OPERATOR-UI Registry Editor — the `IPC_RAG_STORE_MANAGE` channel, the confirmation flow, and the provident-authored manage controls (D6 exemption)

> **STATE (2026-09-08): U-H8 IS THE SPEC FOR THE FINAL UNIT of the registry
> hot-apply slice — the OPERATOR-FACING editor. It is NOT LANDED; the §7 design
> questions (§7) MUST be arbitrated CONFIRMED by the Architect BEFORE the
> TestWriter derives the red set. All seven mechanism units are LANDED and are
> CONSUMED (NOT re-authored) here: U-H1 (write module), U-H2a/b (runtime controller
> `RagStoreRuntimeController` + closure rewiring — the accessors + `hotApply`),
> U-H5 (teardown primitives), U-H4 (`hotRemove`), U-H6 (`hotRename`), U-H7
> (`hotSetDefault`/`hotRenameDefault`). U-H8 ADDS ONLY: ONE D6-exempted operator IPC
> channel (`IPC_RAG_STORE_MANAGE`), the preload bridge method(s), the main-process
> handler that (a) reads the live projection per call (A-P2-1) and (b) runs the
> two-phase confirmation protocol, and the provident-authored operator manage
> controls + confirmation dialog in the OPERATOR isolated scope (`createIsolatedScope()`),
> NOT MCP-visible. U-H8 adds NO registry logic, NO MCP tool, NO census — it is the
> operator surface over the LANDED `hotApply add` / `hotRemove` / `hotRename` /
> `hotSetDefault` / `hotRenameDefault` seams. Gate reference:
> `docs/specs/registry-hot-apply-review.md` §2 **D6** (operator-UI IPC — the ONE
> exemption: the operator editor wiring; the five-seam gate untouched), **D3**
> (hot-remove = ORPHAN via operator control, confirmation required, no MCP path),
> **D7** (drain-then-teardown via the operator-controlled remove), **D8** (execution
> order … U-H7 (LANDED) → **U-H8** (FINAL)); **A-P2-6** (operator editor = UI IPC
> only, never `rag.list_stores`, no MCP census), **A-P2-7** (hot-remove = orphan via
> operator control, confirmation required, no MCP path); §5 (MCP-UI-EQUIVALENCE only
> with A-P2-1); §6 (live-scenario PARKED). Consumed dependencies: the five mechanism
> specs cited in §1/§4/§5.11 + the operator-UI precedents `docs/specs/unit-ms5-settings-listing.md`
> (the `IPC_RAG_STORE_LISTING` → the `currentStores()`+`statusOf` projection + the
> `operator-rag-stores` settings-pane section, the read path U-H8's manage UI sits
> beside), `docs/specs/unit-u1-editing-mode-setting.md` (the `IPC_OPERATOR_SETTINGS_CHANGED`
> button-toggle control + the `operatorSet` bridge + the `data-mode` handler-body
> convention), `docs/specs/unit-p-ipc-edit-batch.md` (the IPC/preload-bridge + shared
> `shared/types.ts` payload/result convention), `docs/specs/unit-ms3-store-qualified-broadcast.md`
> (the ONE shared broadcast payload declaration, cited not restated).**

- **Status: SPEC (NOT LANDED — 2026-09-08; the §7 rulings below are PROVISIONAL and
  MUST be arbitrated CONFIRMED before the TestWriter derives the red set).** The
  registry hot-apply/removal/rename slice, Unit **U-H8 of 8 — the FINAL unit** — the
  operator-facing surface that lets the OPERATOR (a human, NOT an agent) manage the
  registry at runtime over a NEW IPC channel (the ONE channel D6 exempts for the
  operator editor): list the current stores (the U-MS5 read path, consumed), add a
  store, remove/rename a store, change the default (and rename the default), each
  mutation routed through the LANDED hot-* seams with an explicit OPERATOR
  CONFIRMATION for the destructive class (remove — the D3 orphan; rename —
  destructive; setDefault/renameDefault — high-impact default change), over the NEW
  `IPC_RAG_STORE_MANAGE` channel. Every control + the confirmation dialog are
  rendered with the provident framework in the OPERATOR isolated scope
  (`createIsolatedScope()` — NOT MCP-visible, never exposed to `rag`/`edit` groups).
  **U-H8 CONSUMES the five mechanism seams; it ADDS NO registry logic** (it does NOT
  touch `rag-store-runtime.ts`, `rag-store-remove.ts`, `rag-store-default.ts`, or
  `rag-store-registry-write.ts`) — only the operator IPC + the preload bridge + the
  main handler + the renderer/operator-pane nodes. **It is the FIRST unit where a
  live app session is genuinely needed to exercise the operator UI end-to-end; the
  live-scenario gate is PARKED (§6) and a `unit-h8` LIVE-PENDING battery SHOULD be
  authored in a later live session.**

- **Scope:** files EDITED: `src/shared/types.ts` (the `IPC_RAG_STORE_MANAGE`
  constant + the `RagStoreManageOp`/`RagStoreManageRequest`/`RagStoreManageResult`
  types), `src/main/mcp-server.ts` (the shared exported `handleRagStoreManageIpc`
  handler — the `handleRagStoreListingIpc` precedent), `src/main/preload.ts` (the
  `bridge.rag.manage` method + the `sidebar.registryManage`/`registryManageDismiss`
  surface + the `installSidebar`/holder sync), `src/main/main.ts` (the
  `ipcMain.handle(IPC_RAG_STORE_MANAGE, ...)` wiring), `src/renderer/sidebar-panes.ts`
  (the `SidebarBridge.rag.manage` structural sync + the `registry-manage` settings
  section + the operator controls + the function-string handler bodies + the host
  `registryManage`/`registryManageDismiss` methods + the `pendingRegMgmt`/
  `registryManageError` host state). **UNTOUCHED:** `rag-store-runtime.ts`,
  `rag-store-remove.ts`, `rag-store-default.ts`, `rag-store-registry-write.ts`,
  `rag-store.ts`, `retrieval.ts`, `vector-boot.ts`, `vector-cache.ts`,
  `rag-store-directory.ts`, `rag-store-registry.ts`, `security.ts`. NO new MCP tool
  (D6/A-P2-6), NO `rag.list_stores` census tool, NO change to the five-seam gate, NO
  group-gate row, NO `RpcMethod`/`ALL_TOOLS`/`MUTATING_METHODS`/`TOOL_GROUPS` member
  (the MCP tool census stays **41**).

- **TestWriter contract:** every channel/method/payload/result/throw, happy-path
  state, and fail-state below is derivable from this spec ALONE (after the §7
  ruling). The red set is written into the SpecWriter-pinned file
  `tests/unit-h8-operator-editor.test.ts` (§5.9) in the house red-first order
  (RCA-1) — the new manage surface DOES NOT EXIST on the pre-U-H8 code (see §5.9).
  The shared `handleRagStoreManageIpc` handler + the shared `shared/types.ts`
  payload/result types + the `RagStoreRuntimeController` seams are all
  node-testable; the `ipcMain.handle` wiring + the `bridge.rag.manage` + the
  `sidebar.registryManage` methods + the operator-pane section ride the existing
  SidebarPanes host integration harness (`tests/sidebar-panes-host.test.ts`) + the
  `unit-ms5` listing harness (`tests/unit-ms5-settings-listing.test.ts`), mirroring
  the U1 (`tests/operator-settings-editing-mode.test.ts`,
  `tests/editing-mode-broadcast-host.test.ts`) + U-MS5 (`tests/unit-ms5-settings-listing.test.ts`)
  precedent. **The live-scenario battery stays PARKED (§6); a
  `tests/unit-h8-operator-editor-live-pending-battery.md` is RECOMMENDED (§6) but NOT
  authored now.**

---

## 1. What the unit does (the U-H8 slice)

Every mechanism spec pinned, consistently: "the operator trigger + confirmation
dialog + the operator-UI IPC channel that reads `runtime.getDefaultName()`/
`currentStores()`/`statusOf` and calls `hotRemove`/`hotRename`/`hotSetDefault` is
**U-H8**'s." U-H8 makes the seven LANDED mechanisms OPERATOR-DRIVABLE through the
UI. Concretely:

1. **A single operator-UI mutating IPC channel (D6's ONE exemption).** `IPC_RAG_STORE_MANAGE`
   (`'provident:rag-store-manage'`) is a renderer→main `ipcRenderer.invoke`
   request/reply channel carrying a discriminated `RagStoreManageRequest` (`op:
   'add'|'remove'|'rename'|'setDefault'|'renameDefault'` + per-op payload). It is the
   ONLY new IPC channel U-H8 adds. It reads the LIVE projection per call
   (`runtime.getDefaultName()`/`currentStores()`/`statusOf`) — A-P2-1
   refresh-on-apply: a renderer pull after a mutation shows the fresh registry. It is
   NOT group-gated (the renderer is a trusted surface; the `rag`/`edit` groups gate
   the MCP agent path, not this operator IPC) and NOT MCP-visible.
2. **The two-phase confirmation protocol (D3/A-P2-7).** For the DESTRUCTIVE class
   (`remove` — the D3 orphan; `rename` — destructive; `setDefault`/`renameDefault` —
   high-impact default change) the handler's FIRST response to a non-confirmed
   request is `{ confirmationRequired: true, summary }`; ONLY after the operator
   explicitly sends the SAME op with `confirmed: true` does the handler invoke the
   LANDED seam (`hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault`). `add` is
   NON-destructive and executes immediately. If the operator confirms a NOW-STALE
   target (the store was removed concurrently), the seam's OWN rejection propagates
   (fail-closed, §5.7).
3. **The provident-authored operator manage controls + confirmation dialog (the
   project-wide all-UI-via-provident constraint).** A `registry-manage` section
   (`div#operator-rag-manage`) is appended in `settingsContent()` (the OPERATOR
   settings pane) beside the U-MS5 `operator-rag-stores` read-only listing: an
   add-store form (a name field + an "Add store" button), per-store action rows
   (Remove / Rename / Set default on NON-default rows; Rename-default on the default
   row), and a provident-authored confirmation strip (a summary + Confirm + Cancel)
   that appears when a destructive op is pending. Every control is authored as
   provident-ssr data (envelope nodes + function-string handler bodies reaching
   `window.provident.sidebar.registryManage`/`registryManageDismiss`), rendered in
   the operator isolated scope. **A control added as hand-written DOM/HTML, or a
   control rendered in the app graph, is a review finding** (PANE-PROVIDENT-AUTHORING
   + OPERATOR-ISOLATED-GRAPHSCOPE, `decisions.md`).
4. **Wiring + reconciliation (A-P2-1/A-P2-3).** The main handler resolves the runtime
   accessors per call; after a successful mutation the renderer re-fetches
   `bridge.rag.stores()` (the listing read path) + re-renders the operator pane, so
   a mutation is immediately reflected. NO new MCP tool is added (A-P2-6; the
   five-seam gate untouched). The renderer stays default-bound (UI-SELECTOR-DEFERRED);
   the operator editor is the ONLY registry-management surface (an agent uses the
   existing `edit.*`/`rag.*` MCP tools + this is operator-only).
5. **The MCP-UI / security boundary.** The operator editor lives in
   `createIsolatedScope()` and is NEVER MCP-visible: the app Runtime's
   `get_rendered_html`/`get_markdown`/`list_targets`/`get_node_state`/
   `provident.dispatch` read ONLY the app Runtime graph. An agent therefore CANNOT
   drive the operator editor via `provident.dispatch`. The channel is NOT group-gated,
   so a COMPROMISED trusted renderer could reach it (the accepted model, §5.8/F-MS5-4
   parity); there is NO agent escalation because no MCP tool/group-gate row routes to
   it.

This unit does NOT own: the write module (U-H1), the runtime controller + the
accessors (U-H2), hot-add (U-H3/U-H2a), teardown primitives (U-H5), `hotRemove`
(U-H4), `hotRename` (U-H6), `hotSetDefault`/`hotRenameDefault` (U-H7), the vector
re-warm, the `stores:"all"` fan-out (all UNTOUCHED).

## 2. Feasibility verdict

**Feasible — grounded entirely in the LANDED mechanisms + the LANDED operator-UI
precedents; no engine gap, no registry logic authored.**

- **The seams U-H8 calls are LANDED and operator-callable.** The runtime controller
  exposes `getDefaultName()`/`currentStores()`/`statusOf()` (read), `hotApply`
  (add — U-H2a), and the async `hotRemove`/`hotRename`/`hotSetDefault`/
  `hotRenameDefault` (U-H4/U-H6/U-H7). U-H8's main handler ONLY reads those accessors
  + invokes those seams; it adds no write/persist/teardown/vector logic.
- **The operator-UI IPC + pane patterns are LANDED and reusable.** The
  `provident:rag-store-listing` channel (U-MS5) is the exact read-side template for a
  `shared/types.ts` constant + a shared main-process handler exported from
  `mcp-server.ts` for node-testing + a `ipcMain.handle` wiring in `main.ts` + a
  `bridge.rag.*` preload method + the structural `SidebarBridge.rag.*` sync in
  `sidebar-panes.ts`. The `sidebar.operatorSet` + `onChanged` surface (Unit U1 / Unit
  K M2) is the exact template for the `sidebar.registryManage`/`registryManageDismiss`
  host methods the function-string handler bodies call. The operator settings-pane
  section authoring in `createIsolatedScope()` is already landed (U1/U-MS5).
- **The confirmation flow reuses seam validation (fail-closed for free).** Because
  each seam (`hotRemove`/`hotRename`/`hotSetDefault`) is authoritative and already
  throws the byte-pinned W-*/R-*/loader-F messages on a stale/unknown target, the
  confirm-execution step needs NO re-validation of its own — it invokes the seam and
  PROPAGATES whatever the seam rejects. The request-step pre-flight is advisory (a
  UX early-read), reusing the LANDED byte-equal messages.
- **The two-phase protocol is testable at the shared-handler seam (no Electron).**
  `handleRagStoreManageIpc(runtime, request)` is exported from `mcp-server.ts`,
  node-testable with a stub `RagStoreRuntimeController` (a runtime double whose
  `hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault`/`hotApply`/accessors are
  wired, mirroring the U-H7 test harness). The renderer/pane pieces ride the existing
  SidebarPanes host harness.

No engine gap — every change is host-side (`src/`), additive to LANDED contracts,
and node-testable at the shared-handler + harness seams.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `IPC_RAG_STORE_MANAGE` channel + the shared `shared/types.ts` types + the shared `handleRagStoreManageIpc` handler | Project-specific (the D6-exempted operator IPC — the first mutating operator-registry channel) | Low cost; the operator trigger the mechanism units deliberately deferred (every U-H4/U-H6/U-H7 spec's "U-H8" row). |
| The preload `bridge.rag.manage` + the `sidebar.registryManage`/`registryManageDismiss` surface | Project-specific (mirrors `bridge.rag.stores` + `sidebar.operatorSet`) | Low cost; the two structural declarations (`ProvidentBridge` `preload.ts` + `SidebarBridge` `sidebar-panes.ts`) MUST move in the SAME unit (the RCA-6 drift class, pinned by typecheck). |
| The main-process wiring `ipcMain.handle(IPC_RAG_STORE_MANAGE, ...)` | Project-specific (read-the-runtime-per-call, then dispatch) | Low cost; reuses the listing/doc-heads handler-home + wiring-shape conventions. |
| The provident-authored operator manage section + the confirmation strip | Project-specific (the page-design change — U-H4/U-H6/U-H7 deferred it here) | Medium cost (many controls + handler bodies + host state); satisfies the all-UI-via-provident constraint; the ONLY surface that can drive the registry. |
| The host `registryManage`/`registryManageDismiss` methods + the `pendingRegMgmt`/`registryManageError` state + the post-mutate listing re-fetch | Project-specific (the SidebarPanes host wiring) | Low-medium cost; the two-phase UX + the refresh-on-apply re-render. |
| The default-change app re-derive coupling (setDefault/renameDefault → `requestRebuild`) | Project-specific (a deliberate scope decision — §7 Q5) | Low cost; the app re-derives against the possibly-new default on the next normal re-derive; whether U-H8 triggers it directly is §7 Q5. |

No engine gap — the changes are entirely host-side (`src/`), node-testable at the
shared-handler + harness seams, and consume only LANDED seams + LANDED UI precedents.

### 3a. Adversarial findings (pre-registered — the U-H8 adversarial pass RUNS after the green, per RCA-3; placeholder + pre-registered probes)

The RCA-3 read-only adversarial pass on the U-H8 green runs BEFORE the unit is
reported done; host findings (ids `F-H8-*`) are fixed here + regression-tested; an
engine (provident-ssr) finding, should one ever surface, is a `docs/defects.md` +
`docs/HANDOFF.md` item, NEVER a package patch. **Pre-registered edge probes (the
adversarial pass MUST confirm on the landed code):**

- A NON-confirmed destructive request returns `{ confirmationRequired: true, summary }`
  and triggers NO seam invocation (a `hotRemove`-double spy's call count stays 0).
- A `confirmed: true` request for a store removed CONCURRENTLY between the
  confirmation prompt and the confirm propagates the seam's OWN rejection
  (W-remove-unknown for a stale remove; W-rename-unknown-from for a stale rename;
  W-set-default-unknown for a stale setDefault) — fail-closed, §5.7 F8.
- A `confirmed: true` on an `add` is rejected (`rag-store-manage: add does not require
  confirmation`) — add is non-destructive, no confirmation, no harm.
- An `op` outside the five-member union → `rag-store-manage: unknown op "<op>"`;
  a malformed request (missing `name`/`from`/`to`) → the manage arg message; live
  untouched, NO seam invocation.
- Removing the DEFAULT store at the request step is refused (`rag-store-manage: cannot
  remove the default store '<name>'`); renaming the default through `rename` is
  refused (the default-row Rename-default is the sanctioned seam).
- The runtime module `rag-store-runtime.ts` shows NO `\bIPC_[A-Z_]+\b` lexical match
  and NO `RpcMethod`/`ALL_TOOLS`/`MUTATING_METHODS`/`TOOL_GROUPS` member — U-H8 does
  NOT touch it, so the U-H2 N1/N2 + the D6a/D6b five-seam + the census-41 pins stay
  green (§5.8).
- **NO U-H8 change adds an MCP tool / `rag.list_stores` census / TOOL_GROUPS /
  group-gate row / page outside the provident graph** (D6/A-P2-6/A-P2-7/§5.8).
- A `provident.dispatch` (app Runtime) on the operator manage controls does NOTHING —
  they live in the isolated operator scope, NOT the app graph (§5.8).

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:
- **D6 (binding — the ONE exemption):** operator-UI IPC (the operator editor wiring),
  NO new MCP tool, the five-seam gate untouched. U-H8 adds EXACTLY the exempted
  `IPC_RAG_STORE_MANAGE` channel (§1/§4/§5.8).
- **D3 (binding):** hot-remove = ORPHAN via operator control, operator confirmation
  required, no MCP path. U-H8's confirmation protocol (§1/§4/§5).
- **D7 (binding):** drain-then-teardown via the operator-controlled remove — U-H8
  invokes the D7-satisfying `hotRemove` after confirmation, never the coarse
  `hotApply({kind:'remove'})` orphan (§4).
- **A-P2-6 (bound):** operator editor = UI IPC only, never `rag.list_stores`, no MCP
  census. U-H8 adds no census tool + no `RpcMethod`/`ALL_TOOLS` member (§5.8).
- **A-P2-7 (bound):** hot-remove = orphan via operator control, confirmation required,
  no MCP path. U-H8's confirmation protocol (§1/§4/§5).

## 4. Design decisions pinned by this spec (PROVISIONAL — §7 must rule CONFIRMED)

> All decisions below are P R O V I S I O N A L; the TestWriter derives the red set
> ONLY after the §7 rulings. The genuine either/or items are Q1 (one combined channel
> vs per-op channels), Q3 (confirmation-dialog authoring), Q4 (add-store UI scope),
> Q5 (the default-change app re-derive coupling), Q7 (the two-phase channel topology).
> The rest confirm the recommended reading.

- **OPERATOR-MANAGE-IPC (new — §7 Q1, resolve to ONE combined channel):** the
  renderer→main mutating channel is **`IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'`**,
  carrying the discriminated `RagStoreManageRequest` (`op: 'add'|'remove'|'rename'|'setDefault'|'renameDefault'`
  + per-op payload). One channel per OP-FAMILY is REJECTED (5 channels would bloat the
  IPC census for a single operator surface; the sibling convention — one listing
  channel, one settings channel, one settings-change broadcast — prefers a single
  `provident:*` channel per surface). The handler validates the op + dispatches to the
  per-op seam logic. §7 Q1.
- **CONFIRMATION-CLASS (new — D3/A-P2-7, §7 Q2):** the DESTRUCTIVE class requires
  confirmation: `remove` (the D3 orphan), `rename` (destructive), `setDefault` (the
  default change is high-impact), `renameDefault`. `add` is NON-destructive and
  executes immediately (no confirmation).
- **TWO-PHASE-CONFIRM (new — the D3 two-phase protocol, §7 Q7):** for a destructive
  request WITHOUT `confirmed: true`, the handler (a) reads the live projection for an
  advisory pre-flight, (b) returns `{ confirmationRequired: true, summary }` — NO seam
  call. For a destructive request WITH `confirmed: true`, the handler invokes the seam
  (`hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault`); the seam's OWN
  rejection propagates as `{ ok: false, error }` (fail-closed on a stale target), a
  success returns `{ ok: true, done }`. The confirm-execution step does NOT re-validate
  — the seam is authoritative.
- **OPERATOR-MANAGE-HANDLER (new):** the shared node-testable handler
  `handleRagStoreManageIpc(runtime: RagStoreRuntimeController, request: unknown):
  Promise<RagStoreManageResult>` is exported from `src/main/mcp-server.ts` (the
  `handleRagStoreListingIpc` precedent — a shared main-process IPC handler exported
  for direct unit testing even though the channel is NOT an MCP surface).
- **READ-THE-RUNTIME-PER-CALL (inherited — A-P2-1/A-P2-3):** the handler reads
  `runtime.getDefaultName()`/`currentStores()`/`statusOf(name)` per call (mirroring the
  U-H2b §5.8/B12 listing refresh-on-apply). After a mutation resolves, the accessors
  already reflect the fresh state, so a subsequent listing read + a subsequent manage
  request are immediately consistent (refresh-on-apply).
- **OPERATOR-MANAGE-PANE (new — §4/§5.5, the page-design change):** a
  `div#operator-rag-manage` section is appended in `settingsContent()` AFTER the U-MS5
  `operator-rag-stores` listing. It is authored as provident-ssr data (envelope nodes +
  function-string handler bodies), mounted in the OPERATOR isolated scope
  `createIsolatedScope()` (§5.5). **A manage control rendered outside the provident
  graph, or in the app graph, is a review finding.**
- **CONFIRMATION-DIALOG-AUTHORING (new — §7 Q3, resolve to a PROVIDENT-AUTHORED
  confirmation strip, NOT `window.confirm()`):** the confirmation is a
  provident-authored sub-control (a summary `p` + a Confirm button + a Cancel button),
  rendered inside the isolated operator scope when a destructive op is pending. A
  native `confirm()`/`window.alert` is REJECTED (it is outside the provident graph —
  invisible to `provident.dispatch`/`get_rendered_html`.
- **ADD-STORE-SCOPE (new — §7 Q4, resolve to a NAME-ONLY add form):** the add-store
  form is `RagStoreConfig = { name }` — a single name field; the write module derives
  the persistence file + corpus root. A config form (name + optional
  `persistenceFile`/`corpusRoot`) is REJECTED for U-H8 (an operator-facing convenience;
  derived defaults are the zero-config norm).
- **OPERATOR-INPUT-HYGIENE (new — §7 Q4 addendum):** the add/rename handler bodies
  TRIM the operator-typed name; a whitespace-only value is DROPPED (no dispatch). This
  is an operator-input hygiene rule at the UI boundary, DISTINCT from the seams (which
  accept a non-empty whitespace name per the unknown-non-empty-string contract) — the
  UI refuses to create a store named `'   '`.
- **POST-MUTATE-REFRESH + DEFAULT-RE-DERIVE (new — §7 Q5):** after a successful
  mutation, the host (a) clears the pending confirmation + re-fetches
  `bridge.rag.stores()` (the listing read path) + re-mounts the operator pane, and (b)
  for a DEFAULT-CHANGING op (`setDefault`/`renameDefault`) ALSO calls
  `this.editController.requestRebuild()` (the same dirty-guarded re-derive path as the
  settings broadcast) so the app re-derives against the possibly-new default store. For
  `add`/`remove`/`rename` it does NOT trigger an app re-derive (non-default content —
  the app content is unaffected). §7 Q5.
- **OPERATOR-UI-SCOPE-NOT-MCP (inherited — D6/A-P2-6, §5.8):** the operator editor is
  NOT MCP-visible (isolated scope), NOT group-gated (operator-only), and adds NO MCP
  census. An agent CANNOT drive it via `provident.dispatch`. The `IPC_RAG_STORE_MANAGE`
  channel is the D6-exempted operator IPC; it is NOT a five-seam gate seam (no
  `RpcMethod`, no `TOOL_GROUPS`/`ALL_TOOLS`/`MUTATING_METHODS` member, no
  renderer-switch method).
- **SCOPE-BOUNDARY-vs-MECHANISMS (consumed):** U-H8 CONSUMES `hotApply add` /
  `hotRemove` / `hotRename` / `hotSetDefault` / `hotRenameDefault` — it adds NO registry
  logic, only the operator surface + the IPC + the confirmation + the provident UI. It
  does NOT touch the runtime/write/rag-store-remove/rag-store-default modules.
- **Consumed decision rows (cite-only):** **PANE-PROVIDENT-AUTHORING**,
  **OPERATOR-ISOLATED-GRAPHSCOPE** (`decisions.md:36`), **UI-MOUNT-OPERATOR**
  (`:50`), **IPC-SURFACE-NOT-GROUP-GATED** (`:45`), **MCP-UI-EQUIVALENCE** (`:43`,
  preserved via A-P2-1), **UI-SELECTOR-DEFERRED** (`:112`), **RUNTIME-CONTROLLER** /
  **REFRESH-ON-APPLY** (U-H2), **HOT-REMOVE-DRAIN-THEN-TEARDOWN** (U-H4),
  **HOT-RENAME-DRAIN-THEN-TEARDOWN** (U-H6), **DEFAULT-REASSIGNMENT-HOT-SET-DEFAULT**
  (U-H7), **HOT-ADD-DELIVERED-BY-U-H2A** (U-H3).

## 5. The exhaustive contract

### 5.1 The shared types (`src/shared/types.ts` — the D6-exempted operator channel)

**New section — the operator-registry-manage IPC (placed immediately AFTER the U-MS5
store-listing block, `types.ts:581`, as a sibling `// ---- U-H8 ... ----` section):**

```ts
// ---- U-H8 operator-registry-manage IPC (docs/specs/unit-h8-operator-editor.md §5.1)
// The renderer→main `rag-store-manage` IPC — the operator-registry management
// channel (the review §2 D6's ONE operator-UI IPC exemption). Manual-UI ONLY: the
// MCP tool handlers NEVER route to this channel, so an agent cannot add/remove/
// rename/re-default a store (A-P2-6/A-P2-7). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED)
// and NOT a five-seam gate seam — no RpcMethod, no TOOL_GROUPS entry, no ALL_TOOLS
// row, no MUTATING_METHODS member. The DESTRUCTIVE ops (remove/rename/setDefault/
// renameDefault) require the two-phase confirmation (D3): a request WITHOUT
// `confirmed:true` returns `{ confirmationRequired: true, summary }` and invokes NO
// seam; a request WITH `confirmed:true` invokes the LANDED hot-* seam, whose own
// rejection propagates fail-closed on a stale target. `add` is NON-destructive and
// executes immediately.

export type RagStoreManageOp = 'add' | 'remove' | 'rename' | 'setDefault' | 'renameDefault'

export type RagStoreManageRequest =
  | { op: 'add'; name: string }                                          // non-destructive — executes immediately
  | { op: 'remove'; name: string; confirmed?: boolean }                  // D3 ORPHAN — confirmation required
  | { op: 'rename'; from: string; to: string; confirmed?: boolean }      // destructive — confirmation required
  | { op: 'setDefault'; name: string; confirmed?: boolean }              // high-impact — confirmation required
  | { op: 'renameDefault'; to: string; confirmed?: boolean }             // default rename — confirmation required

/** The `rag-store-manage` IPC RESULT. Three members:
 *  1. `{ confirmationRequired: true; summary }` — a destructive request WITHOUT
 *     `confirmed:true`; the UI prompts before the real execution. NO seam ran.
 *  2. `{ ok: true; done }` — a mutation succeeded; `done` is the byte-pinned
 *     operator-readable summary (§5.4). The live registry now reflects the change.
 *  3. `{ ok: false; error }` — a domain failure (a malformed request, an advisory
 *     request-step rejection, or a PROPAGATED seam rejection on the confirm step —
 *     e.g. a now-stale target). The live registry is UNCHANGED on a failure. */
export type RagStoreManageResult =
  | { confirmationRequired: true; summary: string }
  | { ok: true; done: string }
  | { ok: false; error: string }

export const IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'
```

**API rules (pinned):**

- **The channel name is `'provident:rag-store-manage'`** (`IPC_RAG_STORE_MANAGE`),
  the house `IPC_<NAME> = 'provident:<kebab-name>'` convention. It is a renderer→main
  `ipcRenderer.invoke` request/reply channel — NOT a fire-and-forget `send`, NOT a
  broadcast.
- **The request is the discriminated `RagStoreManageRequest`** — the `op` field names
  the seam; the per-op payload fields carry the target. No `shared/types.ts` type
  imports a registry/runtime symbol (JSON-safe, the Phase C seam).
- **The `confirmed` field is OPTIONAL** and meaningful only on the destructive ops; a
  `confirmed: true` on `add` is a domain failure (`rag-store-manage: add does not
  require confirmation`).
- **The channel is NOT group-gated** (`IPC-SURFACE-NOT-GROUP-GATED`) and **NOT added
  to `RpcMethod`** (`types.ts:262` stays the rag/edit method census), **NOT added to
  `security.ts`'s tool→group map**, **NOT added to `ALL_TOOLS`** (the MCP tool census
  stays **41**), **NOT added to `MUTATING_METHODS`/`TOOL_GROUPS`** — D6/A-P2-6 (§5.8).
- The type-level census: **1** new channel const, **3** new shared types
  (`RagStoreManageOp`, `RagStoreManageRequest`, `RagStoreManageResult`).

### 5.2 The shared main-process handler (`src/main/mcp-server.ts`)

A new exported handler, placed immediately AFTER `handleRagStoreListingIpc`
(`mcp-server.ts:588`) — the SAME home + the SAME doc-comment discipline (a shared
main-process IPC handler exported for direct unit testing even though this channel is
NOT an MCP surface, mirroring the listing/doc-heads precedent). It imports the
already-used `type RagStoreRuntimeController` (`mcp-server.ts:38`):

```ts
/** U-H8 §5.2 — the shared main-process handler for the mutating
 *  `rag-store-manage` IPC (the operator-registry editor, the review §2 D6 ONE
 *  exemption). Operates ONLY through the LANDED `RagStoreRuntimeController` seams —
 *  it READS `getDefaultName()`/`currentStores()`/`statusOf(name)` per call (A-P2-1)
 *  and invokes `hotApply({kind:'add'})`/`hotRemove`/`hotRename`/`hotSetDefault`/
 *  `hotRenameDefault`; it ADDS NO registry logic at all.
 *
 *  Two-phase confirmation (D3/A-P2-7): a DESTRUCTIVE op (remove/rename/setDefault/
 *  renameDefault) sent WITHOUT `confirmed:true` returns
 *  `{ confirmationRequired: true, summary }` and invokes NO seam; the SAME op sent
 *  with `confirmed:true` invokes the seam, whose OWN rejection PROPAGATES as
 *  `{ ok:false, error }` (fail-closed on a stale/removed target). `add` is
 *  non-destructive and executes immediately. A malformed request or an unknown op is
 *  a domain error (never a throw); the ONLY throw paths are the seams' own (which
 *  this handler catches and returns as `{ ok:false, error }`).
 */
export async function handleRagStoreManageIpc(
  runtime: RagStoreRuntimeController,
  request: unknown,
): Promise<RagStoreManageResult>
```

**The pinned behavior (the TestWriter derives every state from this + the body):

1. **Shape guard (never a throw for a malformed request):**
   - `if (!isObject(request)) return { ok: false, error: 'rag-store-manage: op required' }`.
   - `const op = request.op`; if `op` is not one of the five
     `RagStoreManageOp` members →
     `{ ok: false, error: 'rag-store-manage: unknown op "<op>"' }` (the `<op>`
     renders a non-string op via the runtime's `kindOf`-style capped JSON; a string
     op verbatim).
   - Per-op arity guard (a missing/empty required field →
     `'rag-store-manage: name required'` / `'rag-store-manage: from required'` /
     `'rag-store-manage: to required'`). A whitespace-only `name`/`from`/`to`
     from a NON-UI caller is a NON-EMPTY string and passes the shape guard (the
     module-wide unknown-non-empty-string contract); the UI's own trim hygiene is a
     separate boundary (§4 OPERATOR-INPUT-HYGIENE).
2. **`add` (non-destructive, immediate):**
   - `if (request.confirmed === true) return { ok: false, error: 'rag-store-manage: add does not require confirmation' }`.
   - Invoke the LANDED add seam: `const { loaded, delta } = runtime.hotApply({ kind: 'add', store: { name: request.name } })`.
   - On success return `{ ok: true, done: 'Added store "' + request.name + '"' }`.
   - On a synchronous throw/rejected promise (W-add-required / **W-add-existing** for
     an already-present store / loader-F / native-fs) catch + return
     `{ ok: false, error: <the seam's message> }`.
3. **Destructive request — REQUEST step (no `confirmed:true`):**
   - Read the live projection `const defaultName = runtime.getDefaultName()`,
     `const stores = runtime.currentStores()`, and `runtime.statusOf(name)` (per
     call — A-P2-1 refresh-on-apply).
   - **Advisory pre-flight** (reusing the LANDED byte-equal messages where the seam
     would produce them; a reject here returns `{ ok: false, error }` immediately,
     no confirmation is offered):
     - `remove`: a target missing → `{ ok: false, error:
       'rag-store-registry-write: cannot remove unknown store "<name>"' }` (byte-equal
       **W-remove-unknown**, locally-thrown). A target === the default →
       `{ ok: false, error: 'rag-store-manage: cannot remove the default store "<name>"' }`
       (manage-level — there is no clean seam early message for a default removal).
     - `rename`: `from` missing → **W-rename-unknown-from**
       (`'rag-store-registry-write: cannot rename unknown store "<from>"'`); `to`
       already present (or `from === to`) → **W-rename-target-exists**
       (`'rag-store-registry-write: store "<from>" cannot be renamed to "<to>": "<to>" already exists'`);
       `from === the default` → `{ ok: false, error: 'rag-store-manage: cannot rename
       the default store (use the default-row Rename-default)' }` (manage-level; the
       sanctioned default-rename folds into the `renameDefault` seam / the default row).
     - `setDefault`: `name` missing → **W-set-default-unknown**
       (`'rag-store-registry-write: cannot set unknown store "<name>" as default'`);
       `name === the default` → `{ ok: false, error: 'rag-store-manage: store "<name>" is already the default' }`
       (manage-level; the seam's `hotSetDefault` would be a `noop` — the operator UI
       hides the Set-default button on the default row, but a crafted request is
       refused).
     - `renameDefault`: `to` already present (or `to === the default`) →
       **W-rename-target-exists**
       (`'rag-store-registry-write: store "<defaultName>" cannot be renamed to "<to>": "<to>" already exists'`,
       `from =` the live default name).
   - If the pre-flight passes → **return `{ confirmationRequired: true, summary }`**
     with the byte-pinned summary (§5.4) built from the live projection. **NO seam is
     invoked** at this step.
4. **Destructive request — CONFIRM step (`confirmed: true`):**
   - Re-read the projection is NOT required (the seam is authoritative). Dispatch to
     the seam:
     - `remove` → `await runtime.hotRemove(request.name)`.
     - `rename` → `await runtime.hotRename(request.from, request.to)`.
     - `setDefault` → `await runtime.hotSetDefault(request.name)`.
     - `renameDefault` → `await runtime.hotRenameDefault(request.to)`.
   - On a REJECTION → `return { ok: false, error: <the seam's message> }` — this is
     the **fail-closed** boundary: a target removed between the prompt and the confirm
     makes the seam throw (W-remove-unknown / W-rename-unknown-from /
     W-set-default-unknown), which PROPAGATES byte-identically (§5.7 F8).
   - On success → `return { ok: true, done: <the byte-pinned done summary> }` (§5.4).

**Throw pattern (pinned):** the handler itself does NOT throw for a domain failure (a
malformed request, an advisory reject, a seam rejection → always `{ ok:false }`). The
ONLY possible rejections are the seams' own, which the handler catches into
`{ ok:false, error }`. The handler performs NO registry work itself beyond the
accessor reads + the seam invocations.

### 5.3 The preload bridge (`src/main/preload.ts`)

**Import (`preload.ts:7`):** add `IPC_RAG_STORE_MANAGE` + `type RagStoreManageRequest,
type RagStoreManageResult` to the `../shared/types.js` import.

**The `ProvidentBridge.rag` namespace (`preload.ts:63-88`):** add ONE method after
`stores()` (`:87`):

```ts
/** U-H8 — the operator-registry management surface (the review §2 D6 ONE exemption).
 *  Sends the `rag-store-manage` IPC to main, which validates the request, reads the
 *  live projection, runs the two-phase confirmation (a destructive op without
 *  `confirmed:true` returns `{ confirmationRequired: true, summary }`), and invokes
 *  the LANDED hot-* seams. Manual-UI only: never an MCP tool — an agent must not
 *  add/remove/rename/re-default a store (A-P2-6/A-P2-7). */
manage(request: RagStoreManageRequest): Promise<RagStoreManageResult>
```

and the implementation after `stores()` (`preload.ts:273-275`):

```ts
manage(request: RagStoreManageRequest): Promise<RagStoreManageResult> {
  return ipcRenderer.invoke(IPC_RAG_STORE_MANAGE, request)
}
```

**The `sidebar` surface + `installSidebar` (`preload.ts:122-141`):** add TWO methods
(the host-side methods the function-string handler bodies call — the `sidebar.operatorSet`
mirror):

```ts
sidebar: {
  // ... existing ...
  registryManage(request: RagStoreManageRequest): void   // U-H8 — the manage dispatch
  registryManageDismiss(): void                          // U-H8 — cancel/clear a pending confirmation
}
installSidebar(methods: { /* ...existing... */
  registryManage(request: RagStoreManageRequest): void
  registryManageDismiss(): void
}): void
```

with the `sidebarHolder` (`preload.ts:146-164`) + the `sidebar` implementation
(`preload.ts:343-352`) + the `installSidebar` body (`preload.ts:353-355`) gaining the
SAME two methods (delegating to the holder, no-op until installed).

### 5.4 The byte-pinned summary/done set + the message census

**Summary byte-pins (`{ confirmationRequired: true, summary }` — the operator-facing
prompt text; `<name>`/`<from>`/`<to>`/`<file>` render the values VERBATIM, the
write-module single-quote convention):**

| # | op | Exact `summary` |
| --- | --- | --- |
| S-remove | `remove` | `Remove store '<name>'? This unregisters it and STRANDS its persistence file '<file>' + journal (never deleted). This cannot be undone.` (`<file>` = the listing entry's `persistenceFile` basename, from the live `currentStores()` projection) |
| S-rename | `rename` | `Rename store '<from>' to '<to>'? The old store is drained + torn down; its file '<file>' is stranded.` |
| S-setDefault | `setDefault` | `Make store '<name>' the default? Queries and edits target the default until reassigned.` |
| S-renameDefault | `renameDefault` | `Rename the default store to '<to>'? It stays the default under the new name.` |

**Done byte-pins (`{ ok: true, done }`):**

| # | op | Exact `done` |
| --- | --- | --- |
| D-add | `add` | `Added store '<name>'` |
| D-remove | `remove` | `Removed store '<name>'` |
| D-rename | `rename` | `Renamed store '<from>' to '<to>'` |
| D-setDefault | `setDefault` | `Made store '<name>' the default` |
| D-renameDefault | `renameDefault` | `Renamed the default store to '<to>'` |

**Manage-level byte-pinned messages (handler-shape + advisory — NEW templates; the
seam-propagated ones REUSE the LANDED byte-equal strings, 0 new templates):**

| # | Trigger | Exact `error` |
| --- | --- | --- |
| M-manage-op | a non-object request / an `op` missing or outside the five-member union | `rag-store-manage: op required` / `rag-store-manage: unknown op "<op>"` |
| M-manage-name | a missing/empty `name` (add/remove/setDefault) | `rag-store-manage: name required` |
| M-manage-from | a missing/empty `from` (rename) | `rag-store-manage: from required` |
| M-manage-to | a missing/empty `to` (rename/renameDefault) | `rag-store-manage: to required` |
| M-add-confirm | `confirmed: true` on `add` | `rag-store-manage: add does not require confirmation` |
| M-remove-default | a `remove` of the DEFAULT | `rag-store-manage: cannot remove the default store '<name>'` |
| M-rename-default | a `rename` whose `from` is the DEFAULT | `rag-store-manage: cannot rename the default store (use the default-row Rename-default)` |
| M-setdefault-nop | a `setDefault` of the ALREADY-default | `rag-store-manage: store '<name>' is already the default` |

**PROPAGATED seam-byte-equal errors (reused verbatim, 0 new templates):** the
request-step advisory reuses **W-remove-unknown**, **W-rename-unknown-from**,
**W-rename-target-exists**, **W-set-default-unknown** (byte-equal, locally-thrown);
the confirm step PROPAGATES whatever the seam throws (W-remove-unknown,
W-rename-unknown-from, W-rename-target-exists, W-rename-default, R-rename-ids-present,
W-set-default-unknown, R-set-default-arg, the loader-F set, and native-fs errors) as
`{ ok:false, error }` — all byte-pinned at their LANDED source (§5.7 F8/F9).

### 5.5 The operator pane + host (`src/renderer/sidebar-panes.ts`)

**The `SidebarBridge.rag` structural sync (`sidebar-panes.ts:73-90`):** add the SAME
`manage(request: RagStoreManageRequest): Promise<RagStoreManageResult>` method AFTER
`stores()` — the canonical `ProvidentBridge` and the structural mirror MUST change in
the SAME unit or `tsc --noEmit` fails (the renderer bundle cannot import `preload.ts`);
the RCA-6 drift class, pinned by the typecheck leg of the trio. Also add
`registryManageRequest`/`RagStoreManageResult` to the structural `SidebarBridge.sidebar`
(optional — a `installSidebar`-typed structural mirror if present).

**The host state (`sidebar-panes.ts`, alongside `lastStoreListing` at `:317`):**

```ts
private pendingRegMgmt: { request: RagStoreManageRequest; summary: string } | null = null
private registryManageError: string | null = null
```

**The operator-pane section (appended in `settingsContent()` AFTER the U-MS5
`operator-rag-stores` div, §5.5 of the listing spec / `sidebar-panes.ts:901-907`):**

```ts
// U-H8 — the operator registry-management section (provident-authored; operator
// isolated scope; the ONLY registry-mutation surface — D6/A-P2-6).
const listing = this.lastStoreListing
const rows = (listing?.stores ?? []).map((s) => {
  const isDefault = s.default
  return {
    type: 'div', props: { id: `operator-rag-manage-row-${s.name}`, 'data-store': s.name },
    content: `${s.name}${isDefault ? ' (default)' : ''}`,
    children: [
      isDefault
        ? {
            // the default row — Rename-default (the sanctioned seam), never remove/set-default:
            type: 'div', props: { id: `operator-rag-manage-actions-${s.name}` },
            children: [
              { type: 'text', props: { id: 'operator-rag-manage-renamedefault-input', value: '' } },
              { type: 'button', props: { id: 'operator-rag-manage-renamedefault' }, content: 'Rename default',
                handlers: [{ name: 'operator-rag-manage-renamedefault', event: 'click', body: OPERATOR_RAG_RENAME_DEFAULT_BODY }] },
            ],
          }
        : {
            type: 'div', props: { id: `operator-rag-manage-actions-${s.name}` },
            children: [
              { type: 'button', props: { id: `operator-rag-manage-remove-${s.name}`, 'data-store': s.name }, content: 'Remove',
                handlers: [{ name: 'operator-rag-manage-remove', event: 'click', body: OPERATOR_RAG_REMOVE_BODY }] },
              { type: 'text', props: { id: `operator-rag-manage-rename-input-${s.name}`, value: '' } },
              { type: 'button', props: { id: `operator-rag-manage-rename-${s.name}`, 'data-store': s.name }, content: 'Rename',
                handlers: [{ name: 'operator-rag-manage-rename', event: 'click', body: OPERATOR_RAG_RENAME_BODY }] },
              { type: 'button', props: { id: `operator-rag-manage-setdefault-${s.name}`, 'data-store': s.name }, content: 'Set default',
                handlers: [{ name: 'operator-rag-manage-setdefault', event: 'click', body: OPERATOR_RAG_SET_DEFAULT_BODY }] },
            ],
          },
    ],
  }
})
// the add-store form:
const addForm = {
  type: 'div', props: { id: 'operator-rag-manage-add' },
  children: [
    { type: 'text', props: { id: 'operator-rag-manage-add-name', value: '' } },
    { type: 'button', props: { id: 'operator-rag-manage-add-submit' }, content: 'Add store',
      handlers: [{ name: 'operator-rag-manage-add', event: 'click', body: OPERATOR_RAG_ADD_BODY }] },
  ],
}
// the pending-confirmation strip (rendered ONLY when pendingRegMgmt !== null):
const confirmStrip = this.pendingRegMgmt === null ? null : {
  type: 'div', props: {
    id: 'operator-rag-manage-confirm',
    'data-op': this.pendingRegMgmt.request.op,
    'data-store': this.pendingRegMgmt.request.op === 'add' || this.pendingRegMgmt.request.op === 'remove' || this.pendingRegMgmt.request.op === 'setDefault'
      ? (this.pendingRegMgmt.request as { name?: string }).name ?? ''
      : '',
    'data-from': (this.pendingRegMgmt.request as { from?: string }).from ?? '',
    'data-to': (this.pendingRegMgmt.request as { to?: string }).to ?? '',
  },
  children: [
    { type: 'p', content: this.pendingRegMgmt.summary },
    { type: 'button', props: { id: 'operator-rag-manage-confirm-yes' }, content: 'Confirm',
      handlers: [{ name: 'operator-rag-manage-confirm', event: 'click', body: OPERATOR_RAG_CONFIRM_BODY }] },
    { type: 'button', props: { id: 'operator-rag-manage-confirm-no' }, content: 'Cancel',
      handlers: [{ name: 'operator-rag-manage-dismiss', event: 'click', body: OPERATOR_RAG_DISMISS_BODY }] },
  ],
}
// the error strip (rendered ONLY when registryManageError !== null):
const errorStrip = this.registryManageError === null ? [] : [{ type: 'p', props: { id: 'operator-rag-manage-error' }, content: this.registryManageError }]
// appended as an `operator-rag-manage` div AFTER the U-MS5 `operator-rag-stores` listing:
{
  type: 'div', props: { id: 'operator-rag-manage' },
  children: [{ type: 'h3', content: 'Manage RAG stores' }, addForm, { type: 'div', props: { 'data-store-rows': '' }, children: rows }, confirmStrip, ...errorStrip],
}
```

**Node contract (pinned):** the manage section is a `div#operator-rag-manage`; the
add-store form is `div#operator-rag-manage-add` (a `text` input
`#operator-rag-manage-add-name` + a `button#operator-rag-manage-add-submit`); one row
`div#operator-rag-manage-row-<name>` per store (content
`<name>` or `<name> (default)`); NON-default rows carry a `div#operator-rag-manage-actions-<name>`
with Remove/Rename/Set-default (ids `...-remove-<name>`, the rename `text`
`...-rename-input-<name>`, `...-rename-<name>`, `...-setdefault-<name>`), the DEFAULT
row carries only Rename-default (`#operator-rag-manage-renamedefault-input` +
`#operator-rag-manage-renamedefault`); the confirmation strip
`div#operator-rag-manage-confirm` (a `p` + `#operator-rag-manage-confirm-yes` +
`#operator-rag-manage-confirm-no`) renders ONLY when `pendingRegMgmt !== null`, the
`data-op`/`data-store`/`data-from`/`data-to` props carrying the pending request
(`data-store` present only for add/remove/setDefault, `data-to` for rename/renameDefault);
the error `p#operator-rag-manage-error` renders ONLY when `registryManageError !== null`.
**The `operator-*` id convention is maintained** (the `operator-enabled-panes` … /
`operator-rag-stores` / `operator-editing-mode` family). All nodes are provident
envelope data — NO hand-written HTML/DOM.

**The function-string handler bodies (the `window.provident.sidebar` convention, §3 of
the U1 spec):** read the target data from `ctx.node.props['data-*']` + the DOM input
values (the `TEMPLATE_ZONE_ADD_BODY` `getElementById(...).value` model), trim operator
input, and call `s.registryManage(...)`:

```ts
const OPERATOR_RAG_ADD_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return;
var el = document.getElementById('operator-rag-manage-add-name'); var name = el ? el.value : '';
if (name && String(name).trim() !== '') s.registryManage({ op: 'add', name: String(name).trim() });`
const OPERATOR_RAG_REMOVE_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return;
var name = ctx && ctx.node && ctx.node.props && ctx.node.props['data-store'];
if (name) s.registryManage({ op: 'remove', name: name });`
const OPERATOR_RAG_RENAME_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return;
var name = ctx && ctx.node && ctx.node.props && ctx.node.props['data-store'];
var el = name ? document.getElementById('operator-rag-manage-rename-input-' + name) : null; var to = el ? el.value : '';
if (name && to && String(to).trim() !== '') s.registryManage({ op: 'rename', from: name, to: String(to).trim() });`
const OPERATOR_RAG_SET_DEFAULT_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return;
var name = ctx && ctx.node && ctx.node.props && ctx.node.props['data-store'];
if (name) s.registryManage({ op: 'setDefault', name: name });`
const OPERATOR_RAG_RENAME_DEFAULT_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return;
var el = document.getElementById('operator-rag-manage-renamedefault-input'); var to = el ? el.value : '';
if (to && String(to).trim() !== '') s.registryManage({ op: 'renameDefault', to: String(to).trim() });`
// Reconstructs the CONFIRMED request from the confirmation strip's data-* props.
const OPERATOR_RAG_CONFIRM_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return;
var o = ctx && ctx.node && ctx.node.props; if (!o) return; var op = o['data-op'];
if (op === 'remove') s.registryManage({ op: 'remove', name: o['data-store'], confirmed: true });
else if (op === 'rename') s.registryManage({ op: 'rename', from: o['data-from'], to: o['data-to'], confirmed: true });
else if (op === 'setDefault') s.registryManage({ op: 'setDefault', name: o['data-store'], confirmed: true });
else if (op === 'renameDefault') s.registryManage({ op: 'renameDefault', to: o['data-to'], confirmed: true });`
const OPERATOR_RAG_DISMISS_BODY = `var s = window && window.provident && window.provident.sidebar; if (!s) return; s.registryManageDismiss();`
```

Each is registered in `bindHandlers()` via `registerHandlerDef(<name>, { name,
body: <HANDLER> })` (additive — the operator isolated scope uses the inline body;
the app graph registration is harmless), mirroring the U1
`OPERATOR_EDITING_MODE_TOGGLE_HANDLER` two-string representation.

**The host `installSidebarBridge()` (`sidebar-panes.ts:1089-1122`):** add to the
`methods` object:

```ts
registryManage: (request: RagStoreManageRequest) => void this.registryManage(request),
registryManageDismiss: () => void this.registryManageDismiss(),
```

**The host methods (installed via the sidebar surface, node-testable through the
harness):**

```ts
/** U-H8 — the operator-registry manage dispatch. Fires `bridge.rag.manage(request)`.
 *  A `{ confirmationRequired: true, summary }` result sets pendingRegMgmt + re-renders
 *  the operator pane (the provident-authored confirm strip appears); a `{ ok: true,
 *  done }` result clears the pending + re-fetches the listing + re-renders, AND for a
 *  default-changing op calls `requestRebuild()` (fresh app re-derive against the new
 *  default); a `{ ok: false, error }` result clears the pending + shows the error. */
private registryManage(request: RagStoreManageRequest): void {
  void this.bridge.rag.manage(request).then((res) => {
    if (res.confirmationRequired) {
      this.pendingRegMgmt = { request, summary: res.summary }
      this.registryManageError = null
      this.mountOperator()
    } else if (res.ok) {
      this.pendingRegMgmt = null
      this.registryManageError = null
      this.refreshRegistryManage()
      const op = request.op
      if (op === 'setDefault' || op === 'renameDefault') this.editController.requestRebuild()
    } else {
      this.pendingRegMgmt = null
      this.registryManageError = res.error
      this.mountOperator()
    }
  }).catch((e) => {
    // a bridge/rejection — leave the pending state + log (never a crash)
    console.error('[sidebar-panes] registry manage failed', e)
    this.pendingRegMgmt = null
    this.mountOperator()
  })
}

/** U-H8 — cancel/clear a pending confirmation without invoking any seam. */
private registryManageDismiss(): void {
  this.pendingRegMgmt = null
  this.registryManageError = null
  this.mountOperator()
}

/** U-H8 — re-fetch the read-only listing (refresh-on-apply) + re-render the pane. */
private refreshRegistryManage(): void {
  void this.bridge.rag.stores().then((p) => {
    this.lastStoreListing = p
    this.mountOperator()
  }).catch(() => {
    // keep the last-known listing (never a crash) — the F-MS5-3 non-abort discipline
  })
}
```

**Host contract (pinned):** `registryManage` fires the IPC and routes the result by
the discriminated member; `requestRebuild()` (the `setDefault`/`renameDefault` path)
goes through the edit controller's dirty-edit guard — a default-change re-derive while
a control is dirty is QUEUED, not lost (Unit D §5.2, the `requestRebuild` guard). The
pane re-renders via `mountOperator()` on every manage result. The controls are all in
the OPERATOR isolated scope (NEVER MCP-visible).

### 5.6 U-H8 happy-path states (TestWriter red set — valid paths)

The shared handler: a stub `RagStoreRuntimeController` double wired over a 2-or-3
store registry (`main` default + `research-2026-09` non-default) per the U-H7 fixture.
The pane: the SidebarPanes host harness with a stubbed `bridge.rag.manage` +
`bridge.rag.stores`.

1. **H1 — add (immediate, non-confirmed):**
   `handleRagStoreManageIpc(runtime, { op: 'add', name: 'research-2026-10' })` →
   `{ ok: true, done: 'Added store "research-2026-10"' }`; `runtime.hotApply` was called
   once with `{ kind: 'add', store: { name: 'research-2026-10' } }`; no `confirmed`
   flow.
2. **H2 — remove requires confirmation:** a NON-confirmed remove →
   `{ confirmationRequired: true, summary: 'Remove store "research-2026-09"? ...' }`;
   `runtime.hotRemove` call count = 0 (NO seam ran).
3. **H3 — confirmed remove executes (D3/D7):** the confirmed remove → `{ ok: true,
   done: 'Removed store "research-2026-09"' }`; `runtime.hotRemove` was called once with
   the name.
4. **H4 — rename two-phase:** NON-confirmed rename → `{ confirmationRequired: true,
   summary: 'Rename store "research-2026-09" to "x"? ...' }`; confirmed rename →
   `{ ok: true, done: 'Renamed store "research-2026-09" to "x"' }`; `runtime.hotRename`
   called once with `{ from, to }`.
5. **H5 — setDefault two-phase:** NON-confirmed setDefault → `{ confirmationRequired:
   true, summary: 'Make store "research-2026-09" the default? ...' }`; confirmed →
   `{ ok: true, done: 'Made store "research-2026-09" the default' }`; `runtime.hotSetDefault`
   called once.
6. **H6 — renameDefault two-phase:** NON-confirmed renameDefault → `{ confirmationRequired:
   true, summary: 'Rename the default store to "main-new"? ...' }`; confirmed →
   `{ ok: true, done: 'Renamed the default store to "main-new"' }`; `runtime.hotRenameDefault`
   called once with `{ to }`.
7. **H7 — the read-the-runtime-per-call (A-P2-1):** the handler calls
   `runtime.getDefaultName()`/`currentStores()`/`statusOf(name)` PER manage request
   (fresh projection); a request AFTER a mutation reflects the fresh live registry.
8. **H8 — `bridge.rag.manage(request)`:** sends the `IPC_RAG_STORE_MANAGE` IPC with the
   request and resolves the `RagStoreManageResult` (the `stores()` mirror).
9. **H9 — `sidebar.registryManage(request)` / `sidebar.registryManageDismiss()`:**
   installed through `installSidebar`; the handler bodies call them (the
   `sidebar.operatorSet`/`onChanged` mirror).
10. **H10 — the operator-manage section renders:** a `lastStoreListing` set →
    `settingsContent()` emits the `div#operator-rag-manage` with the add form, one row
    per store (the default row has Rename-default ONLY; non-default rows have
    Remove/Rename/Set-default), and NO confirmation strip when `pendingRegMgmt === null`.
11. **H11 — the add form end-to-end (harness):** typing `research-2026-10` into
    `#operator-rag-manage-add-name` + clicking `#operator-rag-manage-add-submit` →
    `sidebar.registryManage({ op: 'add', name: 'research-2026-10' })` → `bridge.rag.manage`
    → on `{ ok: true }` the host re-fetches `bridge.rag.stores()` + re-mounts (the new
    row appears).
12. **H12 — the remove confirm end-to-end (harness):** clicking
    `#operator-rag-manage-remove-research-2026-09` → `sidebar.registryManage({ op:'remove',
    name })` → `bridge.rag.manage` → on `{ confirmationRequired: true }` the host sets
    `pendingRegMgmt` + re-mounts (the confirm strip appears with the summary);
    clicking `#operator-rag-manage-confirm-yes` → `sidebar.registryManage({ op:'remove',
    name, confirmed: true })` → on `{ ok: true }` the host clears pending + re-fetches
    the listing (the row disappears).
13. **H13 — the confirm CANCEL:** with a pending remove, clicking
    `#operator-rag-manage-confirm-no` → `sidebar.registryManageDismiss()` → the pending
    is cleared, the confirm strip disappears, NO seam ran.
14. **H14 — the default-change drives an app re-derive (§7 Q5):** a confirmed
    `setDefault`/`renameDefault` success → the host calls `requestRebuild()` → the edit
    controller's dirty-guarded re-derive path → `reDerive` re-fetches the snapshot +
    re-loads the app graph against the NEW default.
15. **H15 — the manage section is in the OPERATOR isolated scope:** the controls are
    present in the operator graph (`#operator-panes`, `createIsolatedScope()`) and
    ABSENT from the app Runtime's MCP surface (`get_rendered_html`/`get_markdown`/
    `list_targets`/`get_node_state`/`provident.dispatch`).

### 5.7 U-H8 fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-closed** = the seam's OWN rejection propagates as `{ ok:false,
error }` (byte-pinned seam message) OR the manage-level domain error returns
`{ ok:false, error }`; **live-untouched** = NO seam invocation, the live registry (the
accessor state) unchanged. The handler NEVER throws for a domain failure.

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `handleRagStoreManageIpc(runtime, null)` / a non-object / a missing `op` | domain result | `{ ok:false, error: 'rag-store-manage: op required' }`; live-untouched; NO seam |
| F2 | `{ op: 'bogus' }` (outside the five-member union) | domain result | `{ ok:false, error: 'rag-store-manage: unknown op "bogus"' }`; live-untouched; NO seam |
| F3 | a missing/empty `name`/`from`/`to` | domain result | `rag-store-manage: name required` / `from required` / `to required`; live-untouched; NO seam |
| F4 | `{ op: 'add', name: 'x', confirmed: true }` | domain result | `{ ok:false, error: 'rag-store-manage: add does not require confirmation' }`; NO add |
| F5 | the add seam rejects (e.g. an ALREADY-PRESENT store) | fail-closed (seam-propagated) | `{ ok:false, error: 'rag-store-registry-write: store "<name>" already exists' }` (W-add-existing PROPAGATES); live-untouched |
| F6 | a NON-confirmed `remove`/`rename`/`setDefault`/`renameDefault` | NO seam | `{ confirmationRequired: true, summary }`; `runtime.hotRemove/hotRename/hotSetDefault/hotRenameDefault` call count = 0 |
| F7 | the ADVISORY request-step pre-flight rejects | domain result (no confirmation offered) | `remove` unknown → **W-remove-unknown**; `rename` unknown → **W-rename-unknown-from**; `rename` target-exists / equal-pair → **W-rename-target-exists**; `setDefault` unknown → **W-set-default-unknown**; each byte-equal + `{ ok:false, error }`; live-untouched; NO seam |
| F8 | the operator confirms a NOW-STALE target (removed concurrently between the prompt and the confirm) | fail-closed (seam rejection PROPAGATES) | a stale remove → `{ ok:false, error: 'rag-store-registry-write: cannot remove unknown store "<name>"' }`; a stale rename → W-rename-unknown-from; a stale setDefault → W-set-default-unknown; live-untouched (the concurrent removal is the authority) |
| F9 | a `remove` of the DEFAULT at the request step | domain result | `{ ok:false, error: 'rag-store-manage: cannot remove the default store "<name>"' }`; NO confirmation, NO seam |
| F9b | a `rename` whose `from` is the DEFAULT | domain result | `{ ok:false, error: 'rag-store-manage: cannot rename the default store (use the default-row Rename-default)' }`; NO confirmation |
| F10 | a `setDefault` of the ALREADY-default | domain result | `{ ok:false, error: 'rag-store-manage: store "<name>" is already the default' }`; NO confirmation (the default row hides the button; a crafted request is refused) |
| F11 | a `renameDefault` whose `to` already exists (or equals the current default) | domain result / seam-propagated | `{ ok:false, error: 'rag-store-registry-write: store "<defaultName>" cannot be renamed to "<to>": "<to>" already exists' }` (W-rename-target-exists, `from` = the live default name); live-untouched |
| F12 | a confirmed destructive op whose seam REJECTS for ANY reason (e.g. an R-rename-ids-present on a populated `from`; a native-fs failure; a W-rename-default for a legacy default rename) | fail-closed (seam rejection PROPAGATES) | `{ ok:false, error: <the seam's byte-pinned message> }`; live + disk untouched |
| F13 | the add input typed is whitespace-only (UI hygiene) | no dispatch | the add-body `trim() === ''` → NO `registryManage` call (no seam); the operator pane unchanged |
| F14 | a bridge failure in `registryManage` | no crash; pending cleared | the `.catch` logs + clears `pendingRegMgmt` + re-mounts; the prior registry is unchanged |
| F15 | a default-change re-derive while a control is DIRTY | QUEUED (not lost, not dropped) | `requestRebuild()` → the dirty-edit guard QUEUES the rebuild, which runs once the dirty control commits/clears (Unit D §5.2) |
| F16 | the app Runtime `provident.dispatch` targets an operator manage control | NO-OP (isolated scope) | the app Runtime does NOT see the manage controls — nothing dispatches (§5.8) |

### 5.8 Negative pins (D6 / A-P2-6 / A-P2-7 / D8 / D3 + the five-seam gate + the UI-via-provident constraint)

- **D6 / A-P2-6 — one new IPC, NO new MCP tool, NO census:** U-H8 adds EXACTLY the
  exempted `IPC_RAG_STORE_MANAGE` channel and NO tool. **NO `rag.list_stores` / `rag.manage`
  tool** is added to `ALL_TOOLS` (stays **41**), NO `RpcMethod` member (`types.ts:262`
  stays the rag/edit method census), NO `TOOL_GROUPS`/`ALL_TOOLS`/`MUTATING_METHODS`
  row, NO `security.ts` tool→group map entry. The five-seam gate (`mcp-endpoint.md`)
  is UNTOUCHED.
- **The operator editor isNOT MCP-visible (D6/A-P2-6):** the manage controls + the
  confirmation strip render in the OPERATOR isolated scope (`createIsolatedScope()` —
  `mountOperator()` → `buildOperatorEnvelope` → the `#operator-panes` mount,
  UI-MOUNT-OPERATOR). The app Runtime's `get_rendered_html`/`get_markdown`/
  `list_targets`/`get_node_state`/`provident.dispatch` read ONLY the app Runtime graph,
  so an AGENT cannot enumerate, read, list, or DISPATCH the operator editor. An agent
  uses the existing `edit.*`/`rag.*` MCP tools; this operator-only surface is
  unreachable over MCP. **A control authored OUTSIDE the provident graph, or inside the
  app graph, is a review finding** (PANE-PROVIDENT-AUTHORING +
  OPERATOR-ISOLATED-GRAPHSCOPE).
- **The channel is NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED):** the renderer is a
  trusted surface; F-MS5-4 parity — a COMPROMISED trusted renderer could reach
  `IPC_RAG_STORE_MANAGE`, but there is NO agent escalation (no MCP tool/group-gate row
  routes to it). Documented, no code.
- **D8/A-P2-7 — no MCP path for the remove/rename/default:** the destroy/rename re-default
  mutations are reachable ONLY via the operator manage control + the explicit
  confirmation — never `rag.list_stores` (A-P2-6), never an MCP census, never a
  group-gated seam. `hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault` remain
  programmatic seams with NO MCP/TOOL exposure.
- **D3 — remove STRANDS (never deletes):** the manage `remove` routes through the LANDED
  `hotRemove` (the D7 drain-then-teardown + the D3 ORPHAN strand); U-H8 itself imports
  NO `unlink`/`rm`/`rmdir` and performs NO deletion. The runtime/write modules keep
  their no-delete pins.
- **The five-seam-gate tools/census stay unchanged:** `edit.*` (7) + `rag.*` (5) = 12
  MCP tools + the renderer-switch/tool census stay at **41** (`ALL_TOOLS`). U-H8 adds
  nothing to `mcp-server.ts`'s MCP seams — it only EXPORTS an extra shared IPC handler
  (an additive host function, not a seam).
- **The runtime module `rag-store-runtime.ts` is UNTOUCHED:** U-H8 does NOT edit it, so
  the U-H2 **N1** (`no \b(teardown|close|destroy)\s*\(`) / **N2** (no-MCP/no-IPC/no-delete/
  0-console) pins + the U-H5 A-P2-8 grep + the `\bIPC_[A-Z_]+\b` absence are ALL
  preserved (U-H8 adds zero `IPC_*` constants there).
- **The UI-via-provident constraint (binding, project-wide):** a manage control or the
  confirmation dialog added as hand-written HTML/DOM, or rendered in the app graph, is
  a review finding. ALL controls are provident-authored envelope data + function-string
  handler bodies (§5.5).

### 5.9 Unit → file → test-file mapping + the red-set expectation

| Unit | File | Test file | Red-set expectation (RCA-1) |
| --- | --- | --- | --- |
| **U-H8** (this spec) | `src/shared/types.ts` (ADD `IPC_RAG_STORE_MANAGE` + `RagStoreManageOp`/`RagStoreManageRequest`/`RagStoreManageResult`) + `src/main/mcp-server.ts` (ADD the shared `handleRagStoreManageIpc`) + `src/main/preload.ts` (ADD `bridge.rag.manage` + `sidebar.registryManage`/`registryManageDismiss` + `installSidebar`/holder) + `src/main/main.ts` (ADD the `ipcMain.handle(IPC_RAG_STORE_MANAGE, ...)` wiring) + `src/renderer/sidebar-panes.ts` (ADD `SidebarBridge.rag.manage` + the `operator-rag-manage` section + the 7 handler bodies + the host `registryManage`/`registryManageDismiss`/`refreshRegistryManage` + `pendingRegMgmt`/`registryManageError`) | `tests/unit-h8-operator-editor.test.ts` (SpecWriter-pinned; the §5.2/§5.6 H1–H15 + §5.7 F1–F16 + §5.8 N-pin red set) | RED — the U-H8 operator surface does NOT EXIST on the pre-U-H8 code: (i) `IPC_RAG_STORE_MANAGE` is `undefined` (the constant import fails/undefined); (ii) `handleRagStoreManageIpc` is absent (`typeof === 'undefined'`); (iii) `bridge.rag.manage` is absent (`typeof undefined`); (iv) the `operator-rag-manage` section + the `OPERATOR_RAG_*` handler bodies + the host `registryManage`/`registryManageDismiss` do not exist in `sidebar-panes.ts`. The suite LOADS (the LANDED seams `hotApply`/`hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault` + the runtime accessors all EXIST), so the red is the MISSING MANAGE SURFACE (the channel marker + the absent handler + the absent bridge + the absent pane), NOT missing seams. |

- **Existing tests that STAY GREEN:** the full mechanism suites — `tests/unit-h2-runtime-controller.test.ts`,
  `tests/unit-h3`-equivalent (the U-H2 add-coverage), `tests/unit-h5-teardown.test.ts`,
  `tests/unit-h4-hot-remove.test.ts`, `tests/unit-h6-hot-rename.test.ts`,
  `tests/unit-h7-default-reassign.test.ts`, `tests/unit-h1-registry-write.test.ts`,
  `tests/unit-ms5-settings-listing.test.ts`; the host suites `tests/sidebar-panes-host.test.ts`,
  `tests/sidebar-panes.test.ts`, `tests/operator-settings-editing-mode.test.ts`,
  `tests/editing-mode-broadcast-host.test.ts`; the five-seam/census pins
  (`tests/mcp-server-wiring.test.ts`, `tests/security-gate.test.ts` — ALL_TOOLS stays
  41, `RpcMethod` unchanged). U-H8 does NOT touch `rag-store-runtime.ts` /
  `rag-store-remove.ts` / `rag-store-default.ts` / `rag-store-registry-write.ts`, so
  the N1/A-P2-8 grep + the D6a/D6b five-seam pins cannot regress.
- **Per RCA-2/RCA-5:** U-H8 runs its own TestWriter-red → Implementer-green →
  adversarial → blind-greens → doc-review cycle; the trio (`npm test` /
  `npm run typecheck` / `npm run build`) runs after the green. The §7 ruling is the
  gate BEFORE the TestWriter derives the red set. The live-scenario battery stays
  PARKED (§6) — but a `unit-h8` live-pending battery is RECOMMENDED because U-H8 is
  the FIRST unit where a live app session is genuinely needed to exercise the operator
  UI end-to-end.
- **Page-design note (repo divergence):** the task's page-design update references
  `docs/skills/designing-pages.md` + a test-use-case coverage matrix + a demo-page
  index. **This repo has NO `docs/skills/designing-pages.md`** (only
  `docs/skills/process-guardrails.md` exists in `docs/skills/`). Per the established
  unit-t/unit-u4 convention (`docs/specs/unit-t-markdown-import.md` line 883-884;
  `docs/specs/unit-u4-contenteditable-editor.md` §`"Page-design note"`), **NO such
  skill update is made**; U-H8's page-design impact (the operator manage section + the
  confirmation strip provident authoring + the isolated-scope MCP-invisibility) is
  documented in THIS spec (§1/§5.5/§5.8). U-H8 is the page-design change the U-H4/U-H6/
  U-H7 specs explicitly deferred ("the operator-UI editor + confirmation dialog is
  U-H8; the designing-pages skill ... are UNCHANGED by U-H4/U-H6/U-H7").

### 5.10 Census / numeric claims

- **New IPC channels:** **1** — `IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'`
  (the D6 exemption). The `IPC_RAG_STORE_LISTING` (read, U-MS5) + `IPC_OPERATOR_SETTINGS_CHANGED`
  (U1) are CONSUMED, not re-added.
- **New shared types:** **3** — `RagStoreManageOp`, `RagStoreManageRequest`,
  `RagStoreManageResult`.
- **New preload bridge methods:** **1** on `rag` (`manage(request)`); **2** on `sidebar`
  (`registryManage(request)`, `registryManageDismiss()`) + the `installSidebar`/holder
  sync (the `ProvidentBridge` + `SidebarBridge` structural pairs MUST move together).
- **New shared main handler:** **1** — `handleRagStoreManageIpc(runtime, request):
  Promise<RagStoreManageResult>` in `mcp-server.ts`.
- **New main IPC handler wiring:** **1** — `ipcMain.handle(IPC_RAG_STORE_MANAGE, ...)`.
- **New renderer handler bodies:** **7** — `OPERATOR_RAG_ADD_BODY`,
  `OPERATOR_RAG_REMOVE_BODY`, `OPERATOR_RAG_RENAME_BODY`,
  `OPERATOR_RAG_SET_DEFAULT_BODY`, `OPERATOR_RAG_RENAME_DEFAULT_BODY`,
  `OPERATOR_RAG_CONFIRM_BODY`, `OPERATOR_RAG_DISMISS_BODY` (+ the `registerHandlerDef`
  registrations).
- **New host methods:** **3** — `registryManage(request)`, `registryManageDismiss()`,
  `refreshRegistryManage()`. **New host fields:** **2** — `pendingRegMgmt`,
  `registryManageError`.
- **New byte-pinned message templates (manage-level):** **8** (M-manage-op ×2,
  M-manage-name/from/to ×3, M-add-confirm, M-remove-default, M-rename-default,
  M-setdefault-nop = 8). The seam-propagated messages REUSE the LANDED W-*/R-*/loader-F/
  fs strings (**0** new templates there); the summaries + done strings are **10** new
  operator-facing byte-pins (4 summary + 5 done + 1 add-done = `S-remove/S-rename/
  S-setDefault/S-renameDefault` + `D-add/D-remove/D-rename/D-setDefault/D-renameDefault`,
  9 total — the summary set is 4, the done set is 5).
- **New MCP tools / `RpcMethod` / `TOOL_GROUPS` / `MUTATING_METHODS` / `ALL_TOOLS`
  members / `security.ts` entries / store-census tools:** **0** — the MCP tool census
  stays **41** (D6/A-P2-6/§5.8).
- **New channel in `rag-store-runtime.ts` / `rag-store-remove.ts` /
  `rag-store-default.ts` / `rag-store-registry-write.ts`:** **0** (UNTOUCHED; the
  U-H2 N1/N2 + D6a/D6b + A-P2-8 pins stay green).
- **Files EDITED:** **5** — `src/shared/types.ts`, `src/main/mcp-server.ts`,
  `src/main/preload.ts`, `src/main/main.ts`, `src/renderer/sidebar-panes.ts`. Files
  ADDED (in `src/`): **0**. [+1 SpecWriter-pinned `tests/unit-h8-operator-editor.test.ts`.]
- **Seam invocations per manage request:** at most **1** (a NON-confirmed destructive
  request invokes 0; a confirmed destructive request invokes 1; an add invokes 1; a
  failed/domain request invokes 0).
- **Registry disk writes:** owned entirely by the LANDED seams (U-H1's write module —
  exactly the seam's ONE atomic write + re-load); U-H8 itself writes NOTHING.
- **`console.*` lines added by U-H8:** **1** (the `registryManage` `.catch`
  `console.error` — a failure-only line, mirroring `operatorSet`/`submitQuery`;
  the runtime keeps its 0-console census).

### 5.11 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D6** ("Operator-UI IPC (not
  group-gated), NO new MCP tool (the five-seam gate is untouched)" — this is the ONE
  exemption the operator editor lands), **D3** (hot-remove = ORPHAN via operator
  control, operator confirmation via the operator-UI control, NOT MCP; "data deletion is
  not a free op"), **D7** (drain-then-teardown via the operator-controlled remove),
  **D8** (execution order … U-H7 → **U-H8**), **A-P2-6** (operator editor = UI IPC only,
  never `rag.list_stores`), **A-P2-7** (hot-remove = orphan via operator control,
  confirmation required, no MCP path); §5 (MCP-UI-EQUIVALENCE preserved only with
  A-P2-1); §6 (live-scenario PARKED).
- **Consumed — the U-H2 runtime controller (the accessors + the add seam):**
  `docs/specs/unit-h2-runtime-controller.md` §4 (**RUNTIME-CONTROLLER**,
  **REFRESH-ON-APPLY**, **ATOMIC-APPLY**, **DEFAULT-STABLE-APPLY**,
  **REBUILD-ALL-OF-NON-DEFAULT**), §5.2 (`RagStoreRuntimeController` + the 10 method
  shape), the U-H2b §5.8/B12 (the listing reads `currentStores()`+`statusOf` per call);
  `src/main/rag-store-runtime.ts` (the accessors `hotApply` `:307`, `hotRemove` `:400`,
  `hotRename` `:449`, `hotSetDefault` `:511`, `hotRenameDefault` `:602`).
- **Consumed — the mechanism seams (each spec's deferred "U-H8" row):**
  `docs/specs/unit-h3-hot-add.md` §1/§4 (the `hotApply({kind:'add'})` U-H8 calls),
  `docs/specs/unit-h4-hot-remove.md` §5.4/§5.8 (the D7 drain-then-teardown `hotRemove`
  U-H8 calls AFTER confirmation), `docs/specs/unit-h6-hot-rename.md` §5.4/§5.8 (the D7
  `hotRename` U-H8 calls), `docs/specs/unit-h7-default-reassign.md` §5.4/§5.8 + §7 Q9
  (`hotSetDefault`/`hotRenameDefault` U-H8 calls + the "U-H8 owns the operator-UI
  trigger + confirmation + the accessor-backed IPC" split).
- **Consumed — the operator-UI precedents:** `docs/specs/unit-ms5-settings-listing.md`
  §5.1–§5.5 (the `IPC_RAG_STORE_LISTING` constant + `bridge.rag.stores()` + the
  `ipcMain.handle` wiring + the `operator-rag-stores` settings-pane section in
  `createIsolatedScope()` — the read path + the pane home U-H8's manage section sits
  beside), §5.5 (the F-MS5-3 non-abort listing-fetch discipline U-H8's
  `refreshRegistryManage` inherits); `docs/specs/unit-u1-editing-mode-setting.md` §1.4
  (the `sidebar.operatorSet` + the button-toggle `data-mode` handler body +
  `registerHandlerDef` + the OPERATOR-isolated-scope authoring — the template for U-H8's
  controls + the `registryManage` bridge); `docs/specs/unit-p-ipc-edit-batch.md` §5.1/§5.3
  (the IPC constant + payload type + `bridge.edit.batch` + `ipcMain.handle` convention);
  `docs/specs/unit-ms3-store-qualified-broadcast.md` §5.1 (the ONE shared broadcast
  payload declaration, cited not restated).
- **Page-design repo divergence (the designing-pages skill):**
  `docs/specs/unit-t-markdown-import.md` (line 883-884) + `docs/specs/unit-u4-contenteditable-editor.md`
  §"Page-design note" (§5.9) — this repo has NO `docs/skills/designing-pages.md`; no
  such update is made.
- **Test files (SpecWriter-pinned + the host harness):** `tests/unit-h8-operator-editor.test.ts`
  (NEW), `tests/sidebar-panes-host.test.ts`, `tests/unit-ms5-settings-listing.test.ts`,
  `tests/operator-settings-editing-mode.test.ts`, `tests/editing-mode-broadcast-host.test.ts`.
- **Decision rows (cite-only + NEW on landing):** PANE-PROVIDENT-AUTHORING,
  OPERATOR-ISOLATED-GRAPHSCOPE, UI-MOUNT-OPERATOR, IPC-SURFACE-NOT-GROUP-GATED,
  MCP-UI-EQUIVALENCE, UI-SELECTOR-DEFERRED, RUNTIME-CONTROLLER / REFRESH-ON-APPLY,
  HOT-ADD-DELIVERED-BY-U-H2A, HOT-REMOVE-DRAIN-THEN-TEARDOWN, HOT-RENAME-DRAIN-THEN-TEARDOWN,
  DEFAULT-REASSIGNMENT-HOT-SET-DEFAULT. U-H8 records a NEW row (**OPERATOR-EDITOR-IPC** /
  **REGISTRY-MANAGE-TWO-PHASE-CONFIRM**) on landing.

## 6. The live-scenario gate

**Live-scenario gate: PARKED (2026-09-08, per the user's instruction).** U-H8 is
node-testable via the shared handler + the SidebarPanes host harness (no live app
needed), BUT **U-H8 is the FIRST unit where a live app session is genuinely needed to
exercise the operator UI end-to-end** — a real operator clicking the manage controls in
the running app, driving the two-phase confirmation through the wired `main.ts` + a real
Electron renderer, and observing the stranded/removed/renamed/re-defaulted registry. A
**live-pending battery** (`tests/unit-h8-operator-editor-live-pending-battery.md`, the
`unit-v1`/`unit-ms1`-style) SHOULD be authored in a LATER live-app session. It is NOT
authored now (PARKED).

## 7. Design questions surfaced to the Architect (arbitrate BEFORE the TestWriter runs)

> The §7 convention (U-H4/U-H6/U-H7): the spec resolves PROVISIONALLY; the TestWriter
> derives the red set ONLY after the Architect rules CONFIRMED. **U-H8's genuine
> either/or items are Q1 (one combined channel vs per-op channels), Q3 (confirmation-
> dialog authoring), Q4 (add-store UI scope), Q5 (the default-change app re-derive
> coupling), Q7 (the two-phase channel topology) — these need a positive ruling, not an
> "as-written" confirmation.**

1. **The IPC surface — ONE combined `IPC_RAG_STORE_MANAGE` channel (op-discriminated)
   vs per-op channels. (RESOLVED provisionally to the ONE combined channel; needs a ruling.)**
   - The recommendation: a single `IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'`
     channel carrying the discriminated `RagStoreManageRequest` (`op:
     'add'|'remove'|'rename'|'setDefault'|'renameDefault'`), one preload
     `bridge.rag.manage(request)`, one main handler + wiring. This mirrors the sibling
     convention (one listing channel, one settings channel, one settings-change
     broadcast) and keeps the D6 exemption to EXACTLY ONE channel.
     The alternative — five per-op channels (`IPC_RAG_STORE_ADD`, `..._REMOVE`, ...) — is
     heavier (5 constants + 5 preload methods + 5 handlers) with no benefit for a single
     operator surface. **Confirm the single combined channel.**
2. **The confirmation class — which ops require confirmation. (RESOLVED provisionally:
   remove/rename/setDefault/renameDefault; `add` is NON-destructive and immediate. Confirm.)**
   - D3/A-P2-7 name remove (the D3 orphan) + the confirmation is mandatory for the
     destructive class; rename is destructive; the default change (setDefault/
     renameDefault) is high-impact. `add` (a new non-default store) is non-destructive
     and executes immediately. **Confirm add-immediate + the four-op confirmation class.**
3. **The confirmation-dialog authoring — a PROVIDENT-AUTHORED confirmation strip vs a
   native `window.confirm()`. (RESOLVED provisionally to the provident-authoring;
   needs a ruling.)**
   - The project-wide all-UI-via-provident constraint + the agentic/debugging surface
     (get_rendered_html/MCP visibility) require the confirmation to be a provident-
     authored sub-control in the isolated operator scope (a summary `p` + a Confirm
     button + a Cancel button). A native `confirm()`/`alert` is invisible to the
     provident graph + is NOT provident-authored → a review finding. **Confirm the
     provident-authored confirmation strip (NOT a native dialog).**
4. **The add-store UI scope — a NAME-ONLY add form vs a config form. (RESOLVED
   provisionally to the name-only form; needs a ruling.)**
   - The add form is `RagStoreConfig = { name }` (a single name field); the write module
     derives the persistence file + corpus root (the zero-config norm).
     The alternative — a config form exposing `persistenceFile`/`corpusRoot` — is an
     operator-power feature out of U-H8's scope. An operator-input TRIM hygiene rule
     (a whitespace-only name is dropped at the UI boundary) is folded in. **Confirm the
     name-only add + the trim hygiene.**
5. **The post-mutate app re-derive coupling — does a confirmed default-changing op
   trigger a `requestRebuild()`? (RESOLVED provisionally to YES for setDefault/
   renameDefault, NO for add/remove/rename; needs a ruling.)**
   - After a successful `setDefault`/`renameDefault`, the app should re-derive against
     the possibly-new default (the snapshot path reads `runtime.getDefaultStore()` per
     call — main.ts:463-465 — so the next re-derive reflects the new default). The
     recommendation: the host calls `requestRebuild()` (the dirty-guarded re-derive) for
     the default-changing ops only; `add`/`remove`/`rename` re-fetch + re-render the
     operator pane only (non-default content does not affect the app). The alternative —
     never re-derive on a manage op — leaves the app showing the OLD default until some
     unrelated trigger re-derives. **Confirm the setDefault/renameDefault re-derive.**
6. **The security / MCP-UI boundary — confirm the operator editor is isolated-scope +
   NOT group-gated + NOT MCP-visible, and the channel is the D6 exemption. (Confirm.)**
   - The manage controls + the confirmation strip live in `createIsolatedScope()`; the
     app Runtime's MCP surface never reads/dispatches them; NO new MCP tool/census/group
     row; the channel is NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED) and is the ONE
     exempted operator IPC. An agent CANNOT drive the operator editor via
     `provident.dispatch`. **Confirm the boundary** (the `RpcMethod`/`ALL_TOOLS`/
     `TOOL_GROUPS`/`MUTATING_METHODS` absence; the census stays 41).
7. **The two-phase topology — the SAME channel carries both the `confirmationRequired`
   prompt and the `confirmed` execution (two invokes over one channel) vs a SEPARATE
   confirmation channel. (RESOLVED provisionally to the same-channel two-phase; needs a
   ruling.)**
   - The recommendation: ONE channel; a non-confirmed destructive request returns
     `{ confirmationRequired: true, summary }` (invoking NO seam), and the operator's
     Confirm re-invokes the SAME channel with the op + `confirmed: true` (invoking the
     seam). The alternative — a second `IPC_RAG_STORE_MANAGE_CONFIRM` channel — adds a
     second channel + a duplicate of the op payload with no benefit. **Confirm the
     same-channel two-phase.**

**RCA-3 adversarial registration:** the adversarial pass MUST confirm the §3a probes on
the landed code — the non-confirmed destructive request invokes NO seam, the confirmed
stale-target rejection propagates the seam's message (fail-closed), the add-immediate
path, the isolated-scope MCP-invisibility, and the `RpcMethod`/`ALL_TOOLS`/`TOOL_GROUPS`/
`MUTATING_METHODS`/census-41 negative pins.

---

**Bottom line:** U-H8 is the FINAL unit of the registry hot-apply slice — the
operator-facing editor that makes the seven LANDED mechanisms OPERATOR-DRIVABLE: ONE
new `IPC_RAG_STORE_MANAGE` channel (the review D6 ONE exemption), the preload
`bridge.rag.manage` + `sidebar.registryManage`/`registryManageDismiss` surfaces, the
shared `handleRagStoreManageIpc` handler that reads the live projection per call
(A-P2-1) and runs the two-phase confirmation protocol (D3/A-P2-7), and the
provident-authored `registry-manage` settings-section + confirmation strip in the
OPERATOR isolated scope (`createIsolatedScope()`, NOT MCP-visible). U-H8 CONSUMES
`hotApply add` / `hotRemove` / `hotRename` / `hotSetDefault` / `hotRenameDefault`
(with ZERO new registry logic) and adds NO MCP tool / census / group-gate row — the
five-seam gate + the census-41 pins stay green. The operator editor is the ONLY
registry-management surface; an agent CANNOT drive it (`provident.dispatch` reads only
the app graph). **The five genuine §7 either/or items (Q1 the channel surface, Q3 the
confirmation authoring, Q4 the add-store scope, Q5 the default-change re-derive, Q7 the
two-phase topology) MUST be arbitrated CONFIRMED before the TestWriter derives the red
set; Q2/Q6 confirm the recommended reading.** U-H8 is the FIRST unit where a live app
session is genuinely needed (the operator UI end-to-end); the live-scenario gate is
PARKED (§6) and a `unit-h8` live-pending battery is RECOMMENDED.

---

### §7 Architect ruling (placeholder — the Architect must CONFIRM each item before the TestWriter derives the red set)

> Awaiting the Architect's CONFIRMED rulings on §7 items 1–7 (the record for the
> TestWriter). On confirmation, transcribe the rulings here (the U-H4/U-H6/U-H7
> pattern) + lock the H1–H15/F1–F16/N-pin red set + the census (§5.10) against the
> final ruling. The operator manage surface remains U-H8's sole deliverable; the
> mechanism seams stay untouched.

---

### §7 Architect ruling (2026-09-08, Gate Supervisor / Architect)

All seven §7 items **CONFIRMED** as provisionally resolved:

1. **Q1 — CONFIRMED.** ONE combined `IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'`
   channel carrying the discriminated `RagStoreManageRequest`
   (`op:'add'|'remove'|'rename'|'setDefault'|'renameDefault'` + per-op payload), one
   preload `bridge.rag.manage(request)` (the D6 exemption — EXACTLY ONE channel, as
   the operator-editor carve-out allows), one shared handler
   `handleRagStoreManageIpc(runtime, request)` in `mcp-server.ts` (the
   `handleRagStoreListingIpc` precedent) wired via `ipcMain.handle` in `main.ts`.
   New shared types `RagStoreManageOp`/`RagStoreManageRequest`/`RagStoreManageResult`. **CONFIRMED.**
2. **Q2 — CONFIRMED.** `add` is NON-destructive (executes immediately); `remove`/
   `rename`/`setDefault`/`renameDefault` are DESTRUCTIVE and REQUIRE the two-phase
   confirmation (D3/A-P2-7). **CONFIRMED.**
3. **Q3 — CONFIRMED.** The confirmation dialog is a PROVIDENT-authored strip (a summary
   `p` + Confirm/Cancel controls in the operator scope), NOT a native `confirm()` — a
   native dialog would be a non-graph UI element (a review finding per the project-wide
   UI constraint). Shown only when a destructive op is pending. **CONFIRMED.**
4. **Q4 — CONFIRMED.** The add-store form is NAME-ONLY (`#operator-rag-manage-add-name`
   text input + an "Add store" button) with trim hygiene, routed through the LANDED
   `hotApply({kind:'add'})` seam. **CONFIRMED.**
5. **Q5 — CONFIRMED.** `setDefault`/`renameDefault` → `requestRebuild()` (the default
   change re-derives the app graph); `add`/`remove`/`rename` → listing-refresh only
   (A-P2-3). **CONFIRMED.**
6. **Q6 — CONFIRMED.** The operator editor renders in `createIsolatedScope()` (operator
   scope), is NOT group-gated, and is NOT MCP-visible — an agent cannot drive it via
   `provident.dispatch`, and it is NOT exposed to the `rag`/`edit` groups (the
   U-MS5/U-H operator-scope precedent). NO new MCP tool / `RpcMethod` / TOOL_GROUPS /
   ALL_TOOLS member (census stays 41). **CONFIRMED.**
7. **Q7 — CONFIRMED.** Same-channel TWO-PHASE confirmation: a destructive request
   without `confirmed:true` → the handler reads the live projection and returns
   `{ confirmationRequired:true, summary }` (NO seam invoked); the Confirm re-invokes
   the SAME op with `confirmed:true` → the handler invokes the LANDED hot-* seam, whose
   own rejection propagates byte-identically as `{ ok:false, error }` (fail-closed on a
   now-stale/removed target). No second confirmation channel. **CONFIRMED.**

The TestWriter may derive U-H8's red set (the absent `IPC_RAG_STORE_MANAGE` +
`handleRagStoreManageIpc` + `bridge.rag.manage` + the `operator-rag-manage` section +
the `OPERATOR_RAG_*` bodies + `registryManage`/`registryManageDismiss`) against this
ruling; no further arbitration is required before the red run. The mechanism seams
(`rag-store-runtime.ts`/`rag-store-remove.ts`/`rag-store-default.ts`/
`rag-store-registry-write.ts`) stay UNTOUCHED. The live-pending battery
(`tests/unit-h8-operator-editor-live-pending-battery.md`, the `unit-ms1` style) is
RECOMMENDED — the slice's live gate is PARKED, but U-H8 is the first unit a live
session genuinely needs to exercise the operator UI end-to-end.
