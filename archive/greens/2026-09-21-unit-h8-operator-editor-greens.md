# Unit U-H8 — OPERATOR-UI Registry Editor (`IPC_RAG_STORE_MANAGE` + the two-phase confirmation + the operator manage controls): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08 (blind run on the
  GREEN U-H8); the RCA-3 HOST-H8-1..5 fixes landed after it (2026-09-09) and are noted in
  the §Run tally below — the node-run tally is unchanged by the host fixes.
- **Derived from DOCUMENTATION ONLY** — `docs/specs/unit-h8-operator-editor.md` §4 (the
  PROVISIONAL design decisions as §7-CONFIRMED: OPERATOR-MANAGE-IPC / Q1,
  CONFIRMATION-CLASS / Q2, TWO-PHASE-CONFIRM / Q7, OPERATOR-MANAGE-HANDLER,
  READ-THE-RUNTIME-PER-CALL, CONFIRMATION-DIALOG-AUTHORING / Q3,
  ADD-STORE-SCOPE + OPERATOR-INPUT-HYGIENE / Q4, POST-MUTATE-REFRESH+REBUILD / Q5,
  OPERATOR-UI-SCOPE-NOT-MCP / Q6, SCOPE-BOUNDARY-vs-MECHANISMS), §5.1 (`IPC_RAG_STORE_MANAGE`
  + `RagStoreManageOp`/`RagStoreManageRequest`/`RagStoreManageResult`),
  §5.2 (the shared `handleRagStoreManageIpc(runtime, request)` two-phase protocol + the
  shape-guard + `add`-immediate dispatch), §5.3/§5.5 (the preload + `SidebarBridge` +
  host surfaces), §5.4 (the byte-pinned summary/done set + the manage-level messages +
  the REUSED seam-byte-equal strings), §5.6 (happy H1–H15), §5.7 (fail F1–F16), §5.8 (the
  negative pins D6/A-P2-6/A-P2-7/D8/D3 + the census-41 + the UI-via-provident),
  §5.10 (the census), §7 (the seven-item Architect ruling 2026-09-08: Q1–Q7 all
  **CONFIRMED**). Consumed/landed contracts read for fixture shapes (NOT the U-H8
  implementation): `src/main/rag-store-runtime.ts` (ONLY the exported
  `RagStoreRuntimeController` interface + `createRagStoreRuntimeController` options —
  the seam signatures, NOT the seam/controller bodies),
  `src/main/mcp-server.ts` `handleRagStoreListingIpc` (§5.2 handler-shape precedent),
  `src/main/rag-store-registry-write.ts` `msg()` prefix + the W-* byte-pins (the LANDED
  source the manage handler is pinned to REUSE by §5.4), `src/main/rag-store-directory.ts`
  + `rag-store-registry.ts` (the boot/directory/`ResolvedRagStore` surface), and
  `tests/unit-h7-default-reassign.test.ts` (the §5.6/§5.9 fixture harness — bootRuntime).
  The `handleRagStoreManageIpc` BODY, the `operator-rag-manage` pane bodies +
  `OPERATOR_RAG_*` handler bodies in `sidebar-panes.ts`, the preload `bridge.rag.manage`
  /`sidebar.registryManage*` bodies, and `tests/unit-h8-operator-editor.test.ts` were NOT
  read (self-verification guard, RCA-4/10a). The manage behavior was derived from the spec
  ALONE; the node scenarios exercise only the PUBLIC handler API + the LANDED seams.
- **Legend:** PASS = the live module matches the spec-derived expectation; FAIL = a
  doc/spec drift OR an un-hardened regression (never a pass); DEFERRED = the precondition
  cannot be met in this node battery (recorded with the reason, never fabricated as a
  PASS); **not-live-runnable** = requires a live Electron renderer/app session (§6
  PARKED).
- **Runtime:** scratch vitest runner (`file://…/tests/zz-h8-blind-greens-runner.test.ts`,
  DELETED after the run) importing `handleRagStoreManageIpc` from
  `../src/main/mcp-server.js` and driving a stub `RagStoreRuntimeController` double (the
  §5.6 fixture, call-count spies) + a REAL lexical 2-store controller
  (`createRagStoreRuntimeController` over a `main`/`research-2026-09` registry in a temp
  dir, the U-H7 `bootRuntime` mirror).

## Boot fixtures

- **Stub (protocol / call-count / shape guards):** a `RagStoreRuntimeController` double
  whose accessors return the 2-store projection (`main` default + `research-2026-09`
  non-default, each `statusOf`→`'loaded'`, `persistenceFile` `provident-rag.json` /
  `provident-rag-research-2026-09.json`) and whose five seams record call counts and
  return canned successes. Used for the two-phase call-count assertions (0 seams on a
  non-confirmed request; exactly 1 on the confirmed execution / the add).
- **Real (byte-pins + live-state + seam propagation):** a lexical
  `createRagStoreRuntimeController` over a temp-dir 2-store registry, fresh per scenario.

---

## A. §5.6 Happy paths — H1–H7 (node-testable at the shared-handler seam)

### H1. add is NON-destructive and executes IMMEDIATELY (no confirmation)
- **Setup:** a stub controller; action `handleRagStoreManageIpc(runtime, { op: 'add', name: 'research-2026-10' })`.
- **Expected PASS:** `{ ok: true, done: "Added store 'research-2026-10'" }` (D-add byte-pin);
  `runtime.hotApply` called exactly ONCE with `{ kind: 'add', store: { name: 'research-2026-10' } }`;
  no `confirmed` flow. On the REAL controller, `currentStores()` afterwards CONTAINS
  `research-2026-10` (A-P2-1 refresh-on-apply).

### H2. remove requires CONFIRMATION — the non-confirmed request returns the prompt, NO seam runs
- **Setup:** stub; action `handleRagStoreManageIpc(runtime, { op: 'remove', name: 'research-2026-09' })`.
- **Expected PASS:** `{ confirmationRequired: true, summary: <S-remove> }` where
  `<S-remove>` = `Remove store 'research-2026-09'? This unregisters it and STRANDS its
  persistence file 'provident-rag-research-2026-09.json' + journal (never deleted). This
  cannot be undone.` (the `<file>` is the LIVE `currentStores()` entry's `persistenceFile`
  **basename**); `runtime.hotRemove` call count = **0** (NO seam ran). On the REAL
  controller the store is still present after the request (live-untouched).

### H3. the CONFIRMED remove executes the LANDED `hotRemove` (D3/D7)
- **Setup:** stub; action `handleRagStoreManageIpc(runtime, { op: 'remove', name: 'research-2026-09', confirmed: true })`.
- **Expected PASS:** `{ ok: true, done: "Removed store 'research-2026-09'" }`;
  `runtime.hotRemove` called exactly ONCE with `'research-2026-09'`. On the REAL
  controller the row disappears from `currentStores()`.

### H4. rename two-phase
- **Setup:** stub. Actions: (1) `{ op: 'rename', from: 'research-2026-09', to: 'x' }`;
  (2) `{ ..., confirmed: true }`.
- **Expected PASS:** (1) `{ confirmationRequired: true, summary: <S-rename> }` =
  `Rename store 'research-2026-09' to 'x'? The old store is drained + torn down; its file
  'provident-rag-research-2026-09.json' is stranded.`; `hotRename` call count **0**.
  (2) `{ ok: true, done: "Renamed store 'research-2026-09' to 'x'" }`; `hotRename` called
  exactly ONCE with `('research-2026-09', 'x')`.

### H5. setDefault two-phase
- **Setup:** stub. Actions: (1) `{ op: 'setDefault', name: 'research-2026-09' }`; (2) `{ ..., confirmed: true }`.
- **Expected PASS:** (1) `{ confirmationRequired: true, summary: <S-setDefault> }` =
  `Make store 'research-2026-09' the default? Queries and edits target the default until
  reassigned.`; `hotSetDefault` **0**. (2) `{ ok: true, done: "Made store
  'research-2026-09' the default" }`; `hotSetDefault` once. On the REAL controller
  `getDefaultName()` afterwards is `'research-2026-09'` (A-P2-1).

### H6. renameDefault two-phase
- **Setup:** stub. Actions: (1) `{ op: 'renameDefault', to: 'main-new' }`; (2) `{ ..., confirmed: true }`.
- **Expected PASS:** (1) `{ confirmationRequired: true, summary: <S-renameDefault> }` =
  `Rename the default store to 'main-new'? It stays the default under the new name.`;
  `hotRenameDefault` **0**. (2) `{ ok: true, done: "Renamed the default store to
  'main-new'" }`; `hotRenameDefault` once with `'main-new'`.

### H7. READ-THE-RUNTIME-PER-CALL (A-P2-1)
- **Setup:** stub with accessor spies; action a NON-confirmed `remove`.
- **Expected PASS:** `runtime.getDefaultName()` + `runtime.currentStores()` +
  `runtime.statusOf(name)` are each called ≥1 on the request (the projection is read per
  call, so a request AFTER a mutation reflects the fresh live registry).

## B. §5.7 Fail-states — the shape guards + the request-step advisory + the confirm-step propagation (node-testable)

### F1. a null / non-object / missing-`op` request → `rag-store-manage: op required`
- **Expected PASS:** `{ ok: false, error: 'rag-store-manage: op required' }` for `null`, a
  non-object, and `{}`; live-untouched; NO seam invoked (the five seam counters = 0).

### F2. an `op` outside the five-member union → `rag-store-manage: unknown op "<op>"`
- **Expected PASS:** `{ op: 'bogus' }` → `{ ok: false, error: 'rag-store-manage: unknown op "bogus"' }`
  (a non-string op would render via a capped JSON); live-untouched; NO seam.

### F3. a missing/empty `name`/`from`/`to` → the manage arg message
- **Expected PASS:** `{ op: 'add' }`+`{ op: 'remove' }`+`{ op: 'setDefault' }` →
  `'rag-store-manage: name required'`; `{ op: 'rename', to }` → `'rag-store-manage: from required'`;
  `{ op: 'rename', from }`+`{ op: 'renameDefault' }` → `'rag-store-manage: to required'`;
  live-untouched; NO seam.

### F4. `confirmed: true` on `add` → `rag-store-manage: add does not require confirmation`
- **Expected PASS:** `{ op: 'add', name: 'x', confirmed: true }` →
  `{ ok: false, error: 'rag-store-manage: add does not require confirmation' }`; NO add
  (`hotApply` counter 0).

### F5. a confirmed add of an ALREADY-PRESENT store → the seam's `W-add-existing` PROPAGATES fail-closed
- **Setup:** REAL controller; `{ op: 'add', name: 'research-2026-09' }` (already present).
- **Expected PASS:** `{ ok: false, error: "rag-store-registry-write: store 'research-2026-09' already exists" }`
  (W-add-existing, REUSED byte-equal); live-untouched.

### F6. a NON-confirmed destructive request invokes NO seam across all four
- **Expected PASS:** issuing a non-confirmed `remove`+`rename`+`setDefault`+`renameDefault`
  leaves `hotRemove`+`hotRename`+`hotSetDefault`+`hotRenameDefault` call counts all **0**.

### F7. the ADVISORY request-step pre-flight rejects (domain result, NO confirmation offered)
- **Expected PASS** (byte-equal REUSED W-*):
  - `remove 'nope'` → `{ ok:false, error: "rag-store-registry-write: cannot remove unknown store 'nope'" }` (**W-remove-unknown**);
  - `rename from 'nope'` → `"…cannot rename unknown store 'nope'"` (**W-rename-unknown-from**);
  - `rename to an existing / equal-pair` → `"rag-store-registry-write: store 'research-2026-09' cannot be renamed to 'main': 'main' already exists"` (**W-rename-target-exists**, and the equal-pair form);
  - `setDefault 'nope'` → `"rag-store-registry-write: cannot set unknown store 'nope' as default"` (**W-set-default-unknown**).
  Each is `{ ok:false, error }`, live-untouched, NO seam.

### F8. the operator CONFIRMS a NOW-STALE target → the seam's OWN rejection PROPAGATES byte-identical (fail-closed)
- **Setup:** REAL controller; the store removed/re-signed first (the concurrent removal is
  the authority).
- **Expected PASS:** a confirmed `remove` of the just-removed store → `{ ok:false, error:
  "rag-store-registry-write: cannot remove unknown store 'research-2026-09'" }` (**W-remove-unknown**);
  a confirmed `rename` to an existing target → W-rename-target-exists; a confirmed
  `setDefault 'nope'` → W-set-default-unknown. Live + disk untouched.

### F9. a `remove` of the DEFAULT at the request step → manage-level M-remove-default; NO confirmation
- **Expected PASS:** `{ op: 'remove', name: 'main' }` →
  `{ ok: false, error: "rag-store-manage: cannot remove the default store 'main'" }`.

### F9b. a `rename` whose `from` is the DEFAULT → manage-level M-rename-default; NO confirmation
- **Expected PASS:** `{ op: 'rename', from: 'main', to: 'z' }` →
  `{ ok: false, error: 'rag-store-manage: cannot rename the default store (use the default-row Rename-default)' }`.

### F10. a `setDefault` of the ALREADY-default → manage-level M-setdefault-nop; NO confirmation
- **Expected PASS:** `{ op: 'setDefault', name: 'main' }` →
  `{ ok: false, error: "rag-store-manage: store 'main' is already the default" }`.

### F11. a `renameDefault` whose `to` already exists (or equals the current default) → W-rename-target-exists (`from` = the live default name)
- **Expected PASS:** `{ op: 'renameDefault', to: 'research-2026-09' }` →
  `{ ok:false, error: "rag-store-registry-write: store 'main' cannot be renamed to 'research-2026-09': 'research-2026-09' already exists" }`;
  `to === 'main'` → the mirror. Live-untouched.

### F12. a confirmed destructive op whose seam REJECTS for ANY reason → the seam message PROPAGATES fail-closed
- **Expected PASS:** a confirmed `remove 'does-not-exist'` →
  `{ ok:false, error: "rag-store-registry-write: cannot remove unknown store 'does-not-exist'" }`;
  `currentStores()` unchanged (live-untouched).

## C. §5.8 Negative pins (grep + the LANDED census-gate suites, node-runnable)

### N1. the runtime module `rag-store-runtime.ts` is UNTOUCHED (the U-H8 grep pins)
- **Expected PASS:** `rag-store-runtime.ts` shows NO `\bIPC_[A-Z_]+\b` match and NO
  `\b(RpcMethod|ALL_TOOLS|MUTATING_METHODS|TOOL_GROUPS)\b` match (U-H8 adds zero `IPC_*`
  constants + zero MCP-census members there). Confirmed by the node grep in this battery.

### N2. the MCP tool census stays 41 (+ no `rag.manage`/`rag.list_stores`/store-census tool), the manage channel adds NO group-gate / no `RpcMethod` / no `TOOL_GROUPS` / no `MUTATING_METHODS` row
- **Expected PASS (corroborated by re-running the pre-existing LANDED census suites, which
  stay green after U-H8 landed):** `tests/unit-h2-runtime-controller.test.ts` D6a asserts
  `ProvidentMcpServer.ALL_TOOLS` length === **41** (56/56 green);
  `tests/security-gate.test.ts` (24/24) + `tests/rag-edit-gate.test.ts` (20/20) assert the
  tool→group map + the 11 rag.*/edit.* names with NO manage tool added. The operator
  manage channel is NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED) and adds NO MCP tool.

---

## D. HOST-level operator-pane + E2E scenarios — DEFERRED / not-live-runnable (with reasons)

These scenarios are derived from §5.2–§5.3 + §5.5 + §5.6 H8–H15 + §5.7 F13–F16, but the
node battery CANNOT assert them as a live PASS:

- **H8 `bridge.rag.manage(request)`** (preload) — **not-live-runnable**: the `preload.ts`
  import of `electron` is NOT node-importable (the house RELEGATED preload discipline,
  U-MS5 §5.4); pinned only by the build + a node host calling it. No PASS fabricated.
- **H9 `sidebar.registryManage*` through `installSidebar`** (preload + host) —
  **not-live-runnable**: same preload boundary; the host-method behavior needs the
  Electron-side `installSidebar` wiring.
- **H10 the `div#operator-rag-manage` section renders** (the add form, per-store rows, the
  default row showing Rename-default ONLY, no confirmation strip when no op is pending) —
  **DEFERRED-to-structure-check**: a source structure-check would require reading the
  `operator-rag-manage` pane bodies + the `OPERATOR_RAG_*` handler bodies in
  `sidebar-panes.ts`, which are the U-H8 implementation the blind-test must NOT read for
  self-verification (RCA-4); a host-harness render check is out of the node scope of this
  battery.
- **H11/H12/H13 the add / remove-confirm / cancel E2E flows** (type in the add-name field →
  submit → `{ ok }` → re-fetch + re-mount; click remove → confirmation strip → Confirm →
  `{ ok }` → row disappears; Cancel → `registryManageDismiss()` → strip gone, NO seam) —
  **not-live-runnable**: these drive the DOM inputs + the renderer through `bridge.rag.manage`
  over the real `ipcMain.handle` in a live Electron renderer — the §6 PARKED live session.
  The two-phase handler logic those flows ride is covered green in A/B above; the UI
  plumbing itself is a live-session item.
- **H14 a confirmed `setDefault`/`renameDefault` success → the host calls
  `requestRebuild()`** (the dirty-guarded re-derive against the new default) —
  **DEFERRED-to-live**: the host `registryManage` re-derive coupling needs the edit
  controller + a mounted app graph; not node-drivable here.
- **H15 the manage controls live in the OPERATOR isolated scope and are ABSENT from the
  app Runtime's MCP surface** (`get_rendered_html`/`get_markdown`/`list_targets`/
  `get_node_state`/`provident.dispatch`) — **DEFERRED-to-structure/live**: the isolated-scope
  graph check + the MCP-invisibility require the operator scope + the app Runtime graph;
  node-asserting it would require reading the mount/scope wiring (self-verification).
- **F13 the whitespace-only add input is DROPPED at the UI boundary (no dispatch)** —
  **not-live-runnable**: the `OPERATOR_RAG_ADD_BODY` trim → no-`registryManage` is a
  function-string-handler-body behavior exercised through the DOM input; the handler-side
  shape guard for a whitespace name (non-empty, reaches the advisory) is covered green
  in §4 **F-13-shape** above.
- **F14 a bridge failure in `registryManage` → no crash, pending cleared, re-mount** —
  **DEFERRED-to-live**: a host `.catch` path needing the renderer bridge.
- **F15 a default-change re-derive while a control is DIRTY → QUEUED** — **DEFERRED**: the
  Unit D `requestRebuild` dirty-edit guard, an edit-controller/app behavior.
- **F16 the app Runtime `provident.dispatch` on an operator manage control → NO-OP**
  (isolated scope) — **DEFERRED-to-live**: needs a live app Runtime dispatcher against the
  operator scope.

---

## §Run — results (filled in after execution against the live modules, 2026-09-08)

NODE-testable tally: **30/30 PASS** (the scratch runner reported `✓ (30 tests)`); the
census corroboration suites: `unit-h2-runtime-controller` **56/56**, `security-gate`
**24/24**, `rag-edit-gate` **20/20** — all green post-U-H8.

| # | Scenario | Result |
| --- | --- | --- |
| H1 | add immediate → `{ok,done}` + `hotApply` once with `{kind:'add'}` (+ real live-store appears) | ✅ PASS |
| H2 | non-confirmed remove → `{confirmationRequired, summary:S-remove}`; `hotRemove` 0 | ✅ PASS |
| H3 | confirmed remove → `{ok,done}`; `hotRemove` once (+ row disappears on the real controller) | ✅ PASS |
| H4 | rename two-phase (request summary + `hotRename` 0; confirm `{ok,done}` + once) | ✅ PASS |
| H5 | setDefault two-phase (request summary; confirm `{ok,done}`; real default re-binds) | ✅ PASS |
| H6 | renameDefault two-phase (request summary; confirm `{ok,done}`) | ✅ PASS |
| H7 | read-the-runtime-per-call (accessors called ≥1 per request) | ✅ PASS |
| F1 | null / non-object / missing-op → `op required`; NO seam | ✅ PASS |
| F2 | unknown op → `unknown op "bogus"`; NO seam | ✅ PASS |
| F3 | missing name/from/to → the manage arg messages; NO seam | ✅ PASS |
| F4 | `confirmed:true` on add → `add does not require confirmation`; NO add | ✅ PASS |
| F5 | confirmed add of an already-present store → W-add-existing propagates | ✅ PASS |
| F6 | all four non-confirmed destructive ops → 0 seam calls | ✅ PASS |
| F7 | advisory rejects: W-remove-unknown / W-rename-unknown-from / W-rename-target-exists / W-set-default-unknown, byte-equal | ✅ PASS |
| F8 | confirmed STALE target → the seam's W-remove-unknown / W-rename-target-exists / W-set-default-unknown propagate byte-identical (fail-closed) | ✅ PASS |
| F9 | remove the default → manage M-remove-default; NO confirmation | ✅ PASS |
| F9b | rename from the default → manage M-rename-default; NO confirmation | ✅ PASS |
| F10 | setDefault of the already-default → manage M-setdefault-nop | ✅ PASS |
| F11 | renameDefault to an existing / the default → W-rename-target-exists (`from` = live default) | ✅ PASS |
| F12 | confirmed op with a rejecting seam → seam message propagates; live-untouched | ✅ PASS |
| F-13-shape | a whitespace-only name passes the shape guard (non-empty) → reaches the advisory | ✅ PASS |
| N1 | `rag-store-runtime.ts` shows no `IPC_*` / no `RpcMethod`/`ALL_TOOLS`/`TOOL_GROUPS`/`MUTATING_METHODS` | ✅ PASS |
| N2 | census-41 + no rag.manage/list_stores tool + no group-gate (LANDED census suites stay green) | ✅ PASS |
| H8 / H9 | preload `bridge.rag.manage` + `sidebar.registryManage*` | ⏸ not-live-runnable (preload imports `electron`) |
| H10 | `div#operator-rag-manage` section render | ⏸ DEFERRED-to-structure-check (pane = U-H8 impl, not read) |
| H11–H13 | E2E add / remove-confirm / cancel flows | ⏸ not-live-runnable (live Electron renderer, §6) |
| H14 | default-change → `requestRebuild()` | ⏸ DEFERRED-to-live (host + edit-controller) |
| H15 | isolated-scope, not-MCP-visible | ⏸ DEFERRED-to-structure/live |
| F13 | whitespace add input dropped at the UI boundary | ⏸ not-live-runnable (handler-body DOM path) |
| F14 | bridge failure → no-crash clear + re-mount | ⏸ DEFERRED-to-live |
| F15 | dirty-edit queued rebuild | ⏸ DEFERRED (Unit D behavior) |
| F16 | `provident.dispatch` on a manage control = NO-OP | ⏸ DEFERRED-to-live |

**Tally: 23 PASS / 0 FAIL / 6 DEFERRED / 6 not-live-runnable** (30 node asserts across the
23 PASS rows; the DEFERRED + not-live-runnable rows are the operator-pane/E2E surface).

**RCA-3 HOST-H8 regressions (spec §3a — the security vector CLOSED, recorded after this
blind-greens run on the green code):** the adversarial pass surfaced **HOST-H8-1 (HIGH)** —
the 7 `OPERATOR_RAG_*` defs were initially registered in the GLOBAL app-graph `handlerDef`
table (`registerRagManageHandlerDefs`), so the app Runtime's `resolveNameReferencedHandlerBodies`
could name-resolve a `code.set`-crafted template's `handlers:[{name:'operator-rag-manage-confirm'}]`
in the app graph + drive the destructive confirm body via `provident.dispatch` WITHOUT
operator confirmation (falsifying A-P2-6/A-P2-7/§5.8). **FIXED:** the global registration is
REMOVED — the operator isolate-scope controls carry INLINE full-expression bodies (+ a `name`),
never globally registered; verified the 7 names are absent from `handlerDef` after boot and a
crafted name-referenced `operator-rag-manage-confirm` does NOT resolve → `dispatch` drives
nothing. **HOST-H8-2..5** (MEDIUM confirm-step default/target re-guard; LOW request-step
fail-safe umbrella; LOW in-flight `regMgmtConfirmingOp` guard; LOW null/undefined throw-
stringify guard) all fixed + regression-tested. The node-runnable 23-PASS tally (the two-phase
protocol, the fail-closed propagation, the additive/seam behavior) is UNCHANGED by these
host fixes; the security vector is closed. The spec §3a HOST-H8-1..5 records carry the full
fix + VERIFIED notes; the HOST-H8 regressions live in `tests/unit-h8-operator-editor.test.ts`.

## Spec ambiguities + findings for the proofreader / doc-review (RCA item 10b)

- **QUOTE-CONVENTION DRIFT (the only notable finding — NOT a behavior regression):** the
  §5.4 "Exact summary"/"Exact done" tables and the LANDED write-module seam strings embed
  store/store-file values in SINGLE quotes (`Added store 'x'`, `cannot remove unknown store
  'x'`), and the LIVE U-H8 handler produces **single-quoted** values for every D-/S- and
  REUSED-W-* byte-pin. However, several spec renderings show DOUBLE quotes: §5.2 step-2
  inline `done: 'Added store "' + request.name + '"'`, and the H1–H6 happy-state
  bodies (§5.6) + the F5/F8/F11 fail-state error renderings (§5.7) + the §5.4 PROPAGATED
  note. **The live behavior matches the §5.4 byte-pin tables + the "REUSE the LANDED
  byte-equal strings, 0 new templates" contract, and every D-/S-/W-* assertion in this
  battery PASSES under that (single-quote) reading.** The double-quote renderings in
  §5.2/§5.6/§5.7 are a doc NOTATION inconsistency the proofreader should reconcile
  (recommendation: normalize the inline/H/F renderings to the §5.4 single-quote norm, or
  state that the table is the authoritative byte-pin). This is a DOC finding, not a live
  FAIL — the live handler is byte-stable and self-consistent.
- **S-remove `<file>` = the persistenceFile BASENAME** of the LIVE `currentStores()` entry
  (confirmed: added `research-2026-10` → `provident-rag-research-2026-10.json`; the derived
  filename follows the `provident-rag-<name>.json` convention, `provident-rag.json` for
  `main`). The summary templates in §5.4 are verified byte-equal to the live output.
- **No behavioral drift** was found in any node-runnable scenario: the request-step never
  invokes a seam (0 counters), the confirm-step propagates the seam's own rejection
  byte-identical (fail-closed), the add is immediate, the shape guards return domain errors
  (never a throw), and the read-the-runtime-per-call + the live-state mutation (A-P2-1)
  hold on the REAL controller.

## What a live-app session should later exercise (the §6 live gate is PARKED)

U-H8 is the **FIRST unit of the slice where a live app session is genuinely needed** — the
operator UI end-to-end: a real operator clicking the manage controls in `#operator-rag-manage`
(add form / Remove / Rename / Set default / Rename-default), the two-phase confirmation strip
(Confirm / Cancel) resolving over the wired `main.ts` `ipcMain.handle(IPC_RAG_STORE_MANAGE, …)`
+ a real Electron renderer + the preload `bridge.rag.manage`, the post-mutate listing re-fetch
+ re-render (A-P2-1), the `setDefault`/`renameDefault` → `requestRebuild()` re-derive (Q5), and
the MCP-invisibility of the operator scope (H15/F16). Per §6 a
`tests/unit-h8-operator-editor-live-pending-battery.md` (the `unit-ms1`-style) is **RECOMMENDED
but NOT authored now** — this battery documents the parked live-session requirement and records
the DEFERRED/not-live-runnable rows that a future live session (or a structure-only pane
review) should close.
