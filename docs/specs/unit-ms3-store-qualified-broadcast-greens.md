# Unit MS3 — Store-Qualified Broadcast + Snapshot `store` + the Collapse: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date: 2026-09-05.**
- **Unit:** U-MS3 — `RagStoreChangedPayload` gains a REQUIRED `store: string`
  (the ONE collapsed shared declaration + the two compat re-exports), the four
  emission sites qualify the field (the MCP path node-testable; the three UI
  paths + the snapshot handler relegated), the broadcast-count invariants, the
  `RagSnapshotPayload.store` field, the store-agnostic derivation helpers, and
  the zero-config byte-equality rows.
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-ms3-store-qualified-broadcast.md` — §5.1 (the collapse +
  the REQUIRED `store` + the re-export fate of the three copies), §5.2 (the
  `RagSnapshotPayload.store` field), §5.3 (the four emission sites + the SEVEN
  `handleEditTool` payload-construction points + the legacy `''` sentinel +
  the two derive helpers' `Omit<…,'store'>`), §5.3a (the main.ts-side state
  expression map — NODE-TESTED vs TYPECHECK-LEVEL vs RELEGATED), §5.5 (the
  zero-config byte-equality rows incl. the ONE intentional delta), §5.6 (the
  broadcast-count invariants), §3a (the adversarial record F-MS3-1..F-MS3-6);
  `docs/specs/unit-ms2-store-wiring.md` §5.5 (the `(payload, storeName)`
  callback widening + the broadcast store value); `docs/decisions.md`
  **STORE-QUALIFIED-BROADCAST**. Format precedent (structure only):
  `docs/specs/unit-ms2-store-wiring-greens.md`.
- **DERIVED FROM DOCS ONLY — implementation unread.** No `src/**` file was
  opened and `tests/unit-ms3-store-qualified-broadcast.test.ts` was NOT
  opened. The scenarios were authored from the spec BEFORE execution; §B and
  the summary (§C) were filled in after. Runtime export-surface enumeration
  (`Object.keys` of the imported live modules) was used ONLY to locate the
  callable seams — never to read sources.
- **Module under test (the live seams, imported and CALLED, never read):**
  `src/shared/types.js` (the shared constants; the payload types are
  type-level), `src/main/mcp-server.js` (`handleEditTool` — the seven
  construction points, site 4), `src/main/edit-ops.js` (`deriveBatchBroadcast`,
  `deriveRichCommitBroadcast`), `src/main/rag-store.js`
  (`createJsonRagStore` — harness fixtures only).
- **RELEGATED (NOT node-imported, per §5.3a + the supervisor directive):**
  `src/main/main.ts` (sites 1–3 + the `rag-snapshot` handler — RELEGATED in
  the spec's §5.3a/§6 mapping) and `src/renderer/sidebar-panes.ts` (the host
  `lastStore` capture + the foreign-store drop guard + the R3 ordering — a UI
  host module; its guard states go to the live pending battery). `src/main/preload.ts`
  was probed and is NOT node-importable (Electron `contextBridge` at module
  top-level — the bridge surface + its compat re-export are TYPECHECK-LEVEL).
- **Harness:** ONE throwaway vitest runner
  `tests/tmp-blind-ms3-greens.test.ts` (a NEW file — never an edit of the
  SpecWriter-pinned unit test file), executed with the repo's own vitest
  (`npx vitest run tests/tmp-blind-ms3-greens.test.ts`, node environment,
  vitest v2.1.9). Every file-touching scenario uses a fresh `mkdtempSync` dir
  under `os.tmpdir()`; the real userData/repo files are never touched.
  Broadcasted payloads are captured via a spy `onStoreChanged(payload,
  storeName)` callback (the §5.7 happy-5 widened callback shape) — the
  harness never needs the engine reconcile. Message/structural/payload
  assertions are deep-equal with exact field sets. The runner was DELETED
  after the run — the repo ends with NO new test files; this document is the
  artifact.
- **TYPECHECK-LEVEL verification:** the REQUIRED-`store` + the collapse red is
  the trio's `npm run typecheck` leg (§5.3a). This run: `npm run typecheck`
  exited 0 (the whole `src` compiles — all three importers + `main.ts`'s
  typed literals hold). Additionally, a STANDALONE `tsc --noEmit` on the
  runner passed with its `@ts-expect-error` directives intact, proving the
  assertions are genuine (omitting `store` on `RagStoreChangedPayload` and on
  `RagSnapshotPayload` is a real compile error — the REQUIRED field; the
  `mcp-server.js` compat re-export `MCP.RagStoreChangedPayload` is usable).
- **Platform notes:** Linux host. Nothing was deferred for environment
  reasons; the only non-executed rows are the RELEGATED host/UI-path states
  (routed to the live pending battery per §5.3a + the directive), not
  environment deferrals.

---

## A. The scenario table (27 rows: 23 executable + 4 RELEGATED — authored from the spec before execution)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| S01 | §5.5 row 2 / §5.1 | The broadcast channel constant from the shared module | `'provident:rag-store-changed'` (byte-equal, unchanged) |
| S02 | §5.1 (TYPE-LEVEL) | `RagStoreChangedPayload` from `shared/types.ts` REQUIRES `store: string` — an object without `store` is a compile error (TS2741); with `store` it compiles | type-level: required |
| S03 | §5.1 / §5.2 (TYPE-LEVEL) | (a) `mcp-server.ts` compat re-exports `RagStoreChangedPayload` (the §5.1 re-export claim); (b) `RagSnapshotPayload.store` is REQUIRED the same discipline | type-level: both satisfied |
| S11 | §5.3 site 4 / §5.7 happy 5 | `handleEditTool` `edit.set_content`, default dir ⇒ broadcast `{kind:'content', nodeIds:['n1'], edgeIds:[], store:'main'}`, callback `storeName 'main'`, EXACTLY 1 | pinned payload + count |
| S12 | §5.3 / §5.7 happy 5 | `edit.create_node`, default ⇒ `{kind:'structural', nodeIds:[newId], edgeIds:[], store:'main'}`, 1 broadcast | pinned |
| S13 | §5.3 / F-MS3-3 / §5.7 happy 5 | `edit.delete_node` on an EXISTING node (`removed:true`) ⇒ `{kind:'structural', nodeIds:['n-del'], edgeIds:[], store:'main'}`, 1 broadcast | pinned |
| S14 | §5.3 F-MS3-3 / §5.6 | `edit.delete_node` on a MISSING node (`removed:false`, a no-op delete) ⇒ **ZERO** broadcasts | 0 |
| S15 | §5.3 / §5.7 happy 5 | `edit.split_node` ⇒ `{kind:'structural', nodeIds:[n0,n1], edgeIds:[e], store:'main'}` | pinned |
| S16 | §5.3 / §5.7 happy 5 | `edit.merge_node` ⇒ `{kind:'structural', nodeIds:[sourceId,targetId], edgeIds:[], store:'main'}` | pinned |
| S17 | §5.3 / §5.7 happy 5 | `edit.set_edge` ⇒ `{kind:'structural', nodeIds:[source,target], edgeIds:[edge.id], store:'main'}` | pinned |
| S18 | §5.3 / §5.7 happy 5 | `edit.import_markdown` ⇒ `{kind:'structural', nodeIds: documentIds, edgeIds:[], store:'main'}` | pinned |
| S19 | §5.3 / §5.7 happy 6 | Non-default `edit.set_content` (store:`'research-2026-09'`) ⇒ `store:'research-2026-09'`, callback `storeName` `'research-2026-09'` | pinned |
| S20 | §5.3 / §5.7 happy 6 | Non-default `edit.create_node` ⇒ `store:'research-2026-09'` | pinned |
| S21 | §5.3 S3 / §5.7 happy 6 | Legacy sentinel (dir `null`, store omitted) ⇒ `store:''`, `storeName:''` (`ref?.name ?? ''`) | pinned |
| S22 | §5.3 (explicit ≡ omitted) | Explicit `store:'main'` ≡ omitted — identical qualified payloads | pinned |
| S23 | §4 QUALIFIED-VALUE / §5.1 | The qualified value is the registry NAME (`'research-2026-09'`), NEVER the persistence file path | pinned |
| S31 | §5.6 UI/MCP exactly-once | A successful edit broadcasts EXACTLY ONCE (never twice) | 1 |
| S32 | §5.6 failed ⇒ 0 | A failed mutation broadcasts ZERO (the `store` field is irrelevant to the count) | 0 |
| S33 | §5.6 foreign-store | A FOREIGN-store edit still broadcasts EXACTLY ONCE (main does NOT suppress/filter — the drop is renderer-side) | 1 |
| S41 | §5.3 (edit-ops type-narrow) | `deriveBatchBroadcast` returns `{kind,nodeIds,edgeIds}` with NO `store` key (store-agnostic, `Omit<RagStoreChangedPayload,'store'>`) | pinned |
| S42 | §5.3 (edit-ops type-narrow) | `deriveRichCommitBroadcast` returns `{kind,nodeIds,edgeIds}` with NO `store` for a real change; `null` for a no-op | pinned |
| S51 | §5.5 row 1 (A4) | Zero-config broadcast = pre-U-MS3 kind/nodeIds/edgeIds UNCHANGED + the ONE intentional delta `store:'main'` (the exact field set `{kind,nodeIds,edgeIds,store}`) | pinned |
| S52 | §5.5 row 6 (A4) | MCP edit tool RESULTS carry NO `store` field (the broadcast payload is not a tool result — edit RESULTS unchanged) | pinned |
| R01 | §5.3a (RELEGATED) | Sites 1–3: the UI commit/batch/rich broadcast literals `{…, store:'main'}` (`main.ts`) + the §5.5 row-1 binding test | NOT-LIVE-EXERCISABLE — RELEGATED (main.ts inline `ipcMain.handle` bodies) → the typecheck guard + the live pending battery |
| R02 | §5.2/§5.7 happy 7 (RELEGATED) | The `rag-snapshot` handler returns `{nodes, edges, store:'main'}` zero-config | NOT-LIVE-EXERCISABLE — RELEGATED → the live pending battery |
| R03 | §5.4 + §5.7 happy 8–11 + §5.8 fails 2–5 (RELEGATED) | The host `lastStore` capture (boot + re-derive), the foreign-store drop guard (incl. the malformed/`null` fail-closed drops + the F-MS3-1 warn), the R3 capture-before-subscribe ordering, the W3/W4/W1 windows, the §5.5 row-5 byte-equal re-derive (`sidebar-panes.ts`) | NOT-LIVE-EXERCISABLE — host (UI) RELEGATED per the supervisor directive → the live pending battery |
| R04 | §5.6 UI counts + §5.8 fail 1/7 (RELEGATED) | The UI-path exactly-once/zero counts that ride the inline UI bodies; the §3a F-MS3-1 warn diagnostic | NOT-LIVE-EXERCISABLE / typecheck-level → the live pending battery + the trio's typecheck leg |

---

## B. RESULTS (the final recorded run, 2026-09-05)

Runner: `npx vitest run tests/tmp-blind-ms3-greens.test.ts` — **23/23 vitest
tests passed, exit 0** (~0.3 s). `npm run typecheck` (the trio's typecheck
leg): **exit 0** (whole `src` compiles). Standalone `tsc --noEmit` on the
runner: **exit 0** (the two REQUIRED-`store` `@ts-expect-error` assertions are
real, not stray). Tally: **23 PASS / 0 FAIL / 4 RELEGATED (routed to the live
pending battery, NOT counted as passes).**

| id | Result | Observed evidence (actual returned values / captured payloads / compile state) |
| --- | --- | --- |
| S01 | ✅ PASS | `IPC_RAG_STORE_CHANGED === 'provident:rag-store-changed'` (bytes exact) |
| S02 | ✅ PASS (type-level) | `RagStoreChangedPayload` exported from `shared/types.js`; the `@ts-expect-error` on `{kind:'content',nodeIds:['n1'],edgeIds:[]}` (no `store`) is REAL (tsc confirms the error); the object WITH `store:'main'` compiles. `npm run typecheck` exit 0 — the REQUIRED field + the typed literals hold. |
| S03 | ✅ PASS (type-level) | `MCP.RagStoreChangedPayload` (re-exported from `mcp-server.js`) is usable as a type; `RagSnapshotPayload` REQUIRES `store` (the `{nodes,edges}` form is a real compile error; `{nodes,edges,store:'main'}` compiles). `npm run typecheck` exit 0. |
| S11 | ✅ PASS | captured `[{payload:{"kind":"content","nodeIds":["n1"],"edgeIds":[],"store":"main"},"storeName":"main"}]`, length **1** — the set_content success broadcasts EXACTLY ONCE with `store:'main'` |
| S12 | ✅ PASS | `edit.create_node` ⇒ captured `[{payload:{"kind":"structural","nodeIds":[<newId>],"edgeIds":[],"store":"main"},"storeName":"main"}]`, length 1; `nodeIds` = the created node's id |
| S13 | ✅ PASS | `edit.delete_node` existing ⇒ `{ok:true, removed:true}`; captured `{kind:'structural', nodeIds:['n-del'], edgeIds:[], store:'main'}`, length **1** (the `removed:true` gate) |
| S14 | ✅ PASS | `edit.delete_node` missing ⇒ `{ok:true, removed:false}`; captured list length **0** — the no-op delete emits ZERO broadcasts (F-MS3-3; §5.6 "a failed mutation ⇒ 0") |
| S15 | ✅ PASS | `edit.split_node` ⇒ `{ok:true, nodes:[n0,n1], edge:{id}}`; captured `{kind:'structural', nodeIds:[n0.id,n1.id], edgeIds:[edge.id], store:'main'}`, length 1 |
| S16 | ✅ PASS | `edit.merge_node` ⇒ `{ok:true}`; captured `{kind:'structural', nodeIds:['n-src','n-tgt'], edgeIds:[], store:'main'}`, length 1 |
| S17 | ✅ PASS | `edit.set_edge` (kind `doc-child`) ⇒ `{ok:true}`; captured `{kind:'structural', nodeIds:['n-src','n-tgt'], edgeIds:[edge.id], store:'main'}`, length 1 |
| S18 | ✅ PASS | `edit.import_markdown` ⇒ `{ok:true, documentIds:['a'], nodeCount:3, edgeCount:5}`; captured `{kind:'structural', nodeIds:['a'], edgeIds:[], store:'main'}`, length 1 — `nodeIds` = `result.documentIds` |
| S19 | ✅ PASS | non-default `set_content` (store `'research-2026-09'`) ⇒ captured `[{payload:{"kind":"content","nodeIds":["r1"],"edgeIds":[],"store":"research-2026-09"},"storeName":"research-2026-09"}]`, length 1 — the NON-default store's edit carries THAT store's name |
| S20 | ✅ PASS | non-default `create_node` ⇒ `payload.store === 'research-2026-09'`, `kind:'structural'`, `storeName 'research-2026-09'`, length 1 |
| S21 | ✅ PASS | legacy (dir `null`, store omitted) ⇒ captured `{kind:'content', nodeIds:['n1'], edgeIds:[], store:''}` with `storeName:''` — the S3 legacy sentinel `ref?.name ?? ''` |
| S22 | ✅ PASS | explicit `store:'main'` ≡ omitted — the two captured payloads deep-equal (`{kind:'content',nodeIds:['n1'],edgeIds:[],store:'main'}`), the §5.3 equivalence |
| S23 | ✅ PASS | the qualified value is `'research-2026-09'` (the registry NAME), never the persistence path — `not.toContain(<tmp root>)` and no `/` — §4 QUALIFIED-VALUE |
| S31 | ✅ PASS | a successful `set_content` ⇒ captured length **1** (exactly once, never a second broadcast) — the field is additive |
| S32 | ✅ PASS | `set_content` on a missing node ⇒ `{ok:false,...}` and captured length **0** — the failed mutation broadcasts ZERO |
| S33 | ✅ PASS | a foreign-store (`'research-2026-09'`) `set_content` ⇒ captured length **1** with `store:'research-2026-09'` — main does NOT suppress/filter foreign-store broadcasts (the drop is renderer-side) |
| S41 | ✅ PASS | `deriveBatchBroadcast` returned `{"kind":"structural","nodeIds":["n-new"],"edgeIds":[]}` — keys EXACTLY `['edgeIds','kind','nodeIds']`, NO `store` (the helper is store-agnostic; its return type is the `Omit<RagStoreChangedPayload,'store'>` contract) |
| S42 | ✅ PASS | `deriveRichCommitBroadcast(before,after)` (a content change) returned `{kind:'content', nodeIds:['n1'], edgeIds:[]}` — keys EXACTLY `['edgeIds','kind','nodeIds']`, NO `store`; `deriveRichCommitBroadcast(before,before)` (no-op) returned `null` |
| S51 | ✅ PASS | zero-config `set_content` broadcast deep-equals `{kind:'content', nodeIds:['n1'], edgeIds:[], store:'main'}` and the field set is EXACTLY `['edgeIds','kind','nodeIds','store']` — pre-U-MS3 kind/nodeIds/edgeIds UNCHANGED + the ONE intentional delta (`store:'main'`, A4) |
| S52 | ✅ PASS | the `edit.set_content` RESULT (`{ok:true, node:{id:'n1',...}}`) contains NO `store` field (`JSON.stringify` has no `"store"`) — row 6: edit tool RESULTS unchanged; the broadcast payload is not a tool result |
| R01 | ⏸ NOT-LIVE-EXERCISABLE | sites 1–3 (`main.ts` inline `ipcMain.handle`) are RELEGATED per §5.3a — pinned red is the typecheck leg (green: `npm run typecheck` exit 0) + code-review + the live pending battery; NOT counted as a pass |
| R02 | ⏸ NOT-LIVE-EXERCISABLE | the `rag-snapshot` handler `store: 'plan.defaultName'` (`main.ts`) is RELEGATED — the `RagSnapshotPayload.store` REQUIRED field IS verified type-level (S03) + the repo typecheck; the handler's runtime `store:'main'` goes to the live pending battery |
| R03 | ⏸ NOT-LIVE-EXERCISABLE | the `sidebar-panes.ts` host guard states (lastStore capture, foreign-store drop, malformed/`null` fail-closed drops + the F-MS3-1 warn, R3 capture-before-subscribe, W1–W4, §5.5 row 5) are RELEGATED per the supervisor directive (UI host) — routed to the live pending battery; NOT counted as a pass |
| R04 | ⏸ NOT-LIVE-EXERCISABLE | the UI-path count invariants riding the inline UI bodies + the §5.8 fail-1/7 type-level reds are the typecheck/code-review/battery surface; NOT counted as a pass |

---

## C. Summary + findings

**23 PASS / 0 FAIL / 4 RELEGATED (routed to the live pending battery, NOT
counted as passes).** The recorded run: 23/23 vitest tests passed, exit 0
(~0.3 s); `npm run typecheck` (the §5.3a typecheck leg) exit 0; a standalone
`tsc --noEmit` on the runner exit 0 with its `@ts-expect-error` directives
intact (proving the REQUIRED-`store` compile errors are real). Every node
-exercisable §5.3 site-4 behavior, the §5.6 broadcast-count invariants, the
§5.3 `Omit<…,'store'>` derive-helper narrowing, and the §5.5/§5.6
byte-equality rows held byte-exact against the live modules.

### The derivation-sources declaration (RCA-4 item 10)

Scenarios were authored from `docs/specs/unit-ms3-store-qualified-broadcast.md`
(§5.1/§5.2/§5.3/§5.3a/§5.5/§5.6/§3a), `docs/specs/unit-ms2-store-wiring.md`
§5.5, and `docs/decisions.md` STORE-QUALIFIED-BROADCAST ONLY. No `src/**` source
was opened and `tests/unit-ms3-store-qualified-broadcast.test.ts` was NOT
opened. Runtime export-surface enumeration (`Object.keys`) served only to
locate the callable seams. The runner was deleted after the run — no new test
files remain in the repo.

### Findings requiring supervisor attention

1. **The renderer host guard states were RELEGATED by the supervisor directive,
   not run here.** The U-MS3 spec's §5.3a marks the host capture/guard as
   NODE-TESTED (it IS imported by the repo's own tests), but this blind run was
   explicitly instructed not to node-import the renderer and to route the host's
   guard states (the `lastStore` capture, the foreign-store drop, the
   malformed/`null` fail-closed drops with the F-MS3-1 warn, the R3
   capture-before-subscribe ordering, the W1–W4 windows, and the §5.5 row-5
   byte-equal re-derive) to the live pending battery. **Those states are therefore
   NOT live-exercised in this artifact** and must be covered by the live-scenario
   gate / the repo's host unit tests (`tests/sidebar-panes-host.test.ts`).
   The preload bridge (a `__proto__`-transparent pipe) and `main.ts` sites 1–3
   are likewise not node-run — their qualification is guarded by the §5.1
   typed-literal pin (the typecheck leg is green: exit 0) + the type-level
   REQUIRED-`store` assertions.
2. **No doc/spec or behavior drift found in the node-exercisable slice.** All 23
   node-testable scenarios passed byte-exact: the seven construction points'
   qualified payloads (`store:'main'` default / `'research-2026-09'` non-default
   / `''` legacy), the F-MS3-3 delete `removed`-gate (missing ⇒ 0 broadcasts), the
   exactly-once/zero count invariants incl. the foreign-store exactly-once (main
   does NOT filter), the store-agnostic derive helpers returning no `store` key
   (`Omit<…,'store'>`), and the A4 byte-equality rows (the ONE intentional
   `store:'main'` delta; edit tool RESULTS carry no `store`). The F-MS3-2
   `''`-sentinel legacy consequence is observed live (S21: `store:''` broadcast)
   and matches the §5.3 F-MS3-2 note.
3. **The broadcast channel constant is byte-equal** (`'provident:rag-store-changed'`,
   §5.5 row 2) — no channel change.
4. **The collapse is verified at the type level** (not by node execution): the
   shared `RagStoreChangedPayload` compiles with `store` REQUIRED, the
   `mcp-server.js` compat re-export is usable, and the whole `src` typechecks
   clean (exit 0). The spec's TYPECHECK-LEVEL classification (§5.3a) is correct.
   The preload.ts compat re-export is NOT node-probeable (Electron
   `contextBridge` — module top-level) and is covered by the typecheck leg only.
5. **The §5.9 census numbers are consistent** with the observed surface: 4
   emission sites (site 4 node-verified), 7 qualified construction points
   (all seven verified), 2 derivation helpers narrowed (both verified
   store-agnostic), 0 new IPC channels/tools/groups, and unchanged broadcast
   counts across every node-exercisable path.

### What held

The single collapsed shared type with REQUIRED `store` (type-level + every
emitted payload carries string `store`, never absent); the seven
construction points of site 4 qualified with the registry NAME (default
`'main'`, non-default `'research-2026-09'`, legacy `''`); the per-call
`storeName` callback widening (§5.7 happy 5); the exactly-once/zero
broadcast-count invariants incl. the delete `removed`-gate and the
foreign-store exactly-once; the store-agnostic derive helpers (no `store` key,
`null`-for-no-op); and the A4 byte-equality rows (kind/nodeIds/edgeIds
unchanged + the ONE intentional `store:'main'` delta; edit RESULTS carry no
`store`).
