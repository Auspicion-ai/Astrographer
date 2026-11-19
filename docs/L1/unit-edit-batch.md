# `unit-edit-batch` — registering the MCP tool `edit.batch` (L1 contract)

**Closes** `docs/defects.md` → `MCP-EDIT-BATCH-NOT-REGISTERED` (HIGH, found by `B-5`'s
adversarial pass, `docs/L1/unit-b-5-pane-links.md` §7 `G5-04` / §9 `O-5`;
`docs/L2/shell-chrome/pane-links.md` `B5-F11`). **Unit id:** `edit-batch`. **Layer:** MCP surface
(main process), reached over the server's own `registerTools` path.

---

## §1 THE INVESTIGATION — is the primitive a complete batch writer, or was the tool never built?

**FINDING: the primitive is COMPLETE, and the tool was DESIGNED and never wired. Both halves of
the defect are real, and they are not the same half.**

**(a) The primitive is complete — verified against the code, not the citations.**

| Claim | Evidence |
| --- | --- |
| `applyBatch(ops: BatchOp[]): Promise<BatchResult>` is on the `RagStore` INTERFACE | `src/main/rag-store.ts:279` |
| the `BatchOp` union is CLOSED at 7 members | `:184-193` — `putNode` / `removeNode` / `putEdge` / `removeEdge` / `setProps` / `setSubtree` / `setType` |
| **every** member APPLIES (not type-only) | `:1244-1372` — `applyBatchOp` applies all seven; `setProps` MERGES (`:1309-1330`), `setSubtree` REPLACES (`:1331-1348`), `setType` is setType-class (`:1349-1369`) |
| atomic: all-or-nothing with snapshot/restore rollback | `:1375-1454` — per-op loop `:1399-1414`, rollback on a failed op `:1401-1411`, rollback on a throw `:1415-1425` |
| ONE `batch` journal entry + ONE persist on success | `:1451` `pushJournal({ kind: 'batch', ops, inverse, at })`, `:1452` `persist()`; the interior is write-deferred (`:1397`/`:1430`) so no per-op full-store write is possible |
| NEVER throws for a domain failure | `:215-217` `BatchResult` is discriminated; the throw arm is caught at `:1415` |
| serialized through the single-writer queue, re-entrant | `:1455-1458` (`inQueue` → sync, else `enqueue`) |
| a shared, Electron-free handler exists | `src/main/edit-ops.ts:440-448` `handleEditBatch(store, payload)` — payload guard + `store.applyBatch(payload.ops)`, result verbatim |
| a deterministic broadcast derivation exists | `src/main/edit-ops.ts:614-667` `deriveBatchBroadcast(ops, results, preBatchNodes)` → `{ kind, nodeIds, edgeIds }` |
| the UI path already routes through all three | `src/main/main.ts:1038-1067` — the `IPC_EDIT_BATCH` handler |

*Stale-docstring note (carried, not fixed — outside this unit's write scope):*
`rag-store.ts:180-183` / `:189-190` / `:195-197` still read "their application is Unit O … a batch
containing one is a documented fail-state", and `unit-p-ipc-edit-batch.md` §5.2 repeats it.
`U-EDIT-1 (C9)` landed the application at `:1309-1369`; the comments are one landing behind the code
(annotated in that spec by this pass, §7 item 2).

**(b) The tool was never built.** `docs/specs/unit-p-ipc-edit-batch.md` §5.5 states it in the
spec's own words (`:471-473`): *"The MCP TOOL WIRING (adding `edit.batch` to `mcp-server.ts`) is
FORWARD-LOOKING — a later unit; this unit pins the channel-level contract and the tool→op mapping
below as the contract that later unit implements."* `§5.6 item 8` pins the equivalence row that
the later unit owes. `grep` over `src/main/mcp-server.ts` at this head: `edit.batch` appears
nowhere — not in `ALL_TOOLS` (`:1809-1891`), not in `TOOL_GROUPS` (`security.ts:5-100`), not in
the `registerTools` row table (`:2337-2346`), not in `handleEditTool`'s switch (`:1404-1512`).
Hence `MCP error -32602: Tool edit.batch not found` — the SDK's "not found", not a handler
failure.

**(c) What the citations get wrong, precisely.** Five `src/` sites say the UI batch goes through
"the SAME transaction primitive as the MCP `edit.batch` tool, MCP/UI equivalence"
(`edit-ops.ts:436`, `main.ts:1034`, `preload.ts:170`, `shared/types.ts:436`,
`sidebar-panes.ts:176`) — the *primitive* half is TRUE, the *tool* half was FALSE. Three spec
rows state the negation explicitly and therefore have to be repaired by this landing:
`unit-authority-switch.md:523-524` + `:1078` ("there is no `edit.batch` MCP tool registration",
the routed union's 31st entry is "the group's own `edit.batch` IPC-only primitive"),
`multi-document-store-config-review.md:151` ("no `edit.batch` MCP tool — IPC-only"),
`rebuild-drift-map-2026-09-21.md:502` ("9 `edit` (8 registered + the `edit.batch` IPC-only
primitive)").

## §2 THE ROUTE — (a) REGISTER, and why

**DECIDED: register the tool against the existing primitive.** The primitive covers the declared
contract **completely**: the contract's tool→op mapping is `edit.batch → applyBatch → BatchResult`
(`unit-p-ipc-edit-batch.md:478-480`), the result is returned verbatim, and the re-traversal is the
`rag-store-changed` broadcast once on success — every one of which `applyBatch` +
`handleEditBatch` + `deriveBatchBroadcast` already provide, byte-for-byte the path the UI uses.
Registering is therefore a **wiring act, not an invention**: it makes five true statements actually
true, instead of retiring a documented capability to fit a missing registration. Route (b)
(re-point + record the retirement) is rejected because nothing was dropped: the spec pins the tool
as a later unit's deliverable, and an agent planning on `edit.batch` is planning on exactly the
capability this repo already owns.

**No primitive completion is needed in `src/main/edit-ops.ts`** — it is NOT touched by this unit
(the shared handler, the payload guard and the derivation all exist and are already the UI path's).

**No new tool GROUP.** `edit` exists (`security.ts:3`, `VALID_GROUPS` `:196`) and already carries
eight `edit.*` rows. What is owed is one **membership row** `'edit.batch': 'edit'` in
`TOOL_GROUPS` — without it `groupForTool` answers `null`, `toolAllowed` is `false`,
`registeredToolNames` filters the name out of `allowedToolNames()`, and the tool registers nowhere
even with `edit` enabled: `B-1`'s unreachable-tool defect in a new place. `VALID_GROUPS` and the
`ToolGroup` union stay untouched.

## §3 THE BYTES (pinned)

1. **`src/main/security.ts`** — one row in `TOOL_GROUPS`, beside its siblings:
   `'edit.batch': 'edit'`. Nothing else changes (no group literal, no `VALID_GROUPS` entry).
2. **`src/main/mcp-server.ts` — `ALL_TOOLS`** gains `'edit.batch'` in the `edit` block
   (`:1851-1859`). The census moves **59 → 60**.
3. **`src/main/mcp-server.ts` — the `registerTools` row** (in the `graph` row table, beside
   `edit.set_doc_meta` `:2346`):
   - `name: 'edit.batch'`
   - `inputSchema: { ops: z.array(z.unknown()), store: z.string().optional() }` — **lax schema,
     strict handler** (the `U-MS2 §5.2` discipline and the `provident.code.loadBatch` precedent at
     `:2313`, whose `ops` is the same `z.array(z.unknown())`). The op payload is validated by
     `applyBatch`, whose typed domain result (`rag applyBatch: <reason> at index <i>`) must reach
     the agent **verbatim** — a per-op zod union would answer the SDK's own schema error instead
     and break `§5.5`'s "same batch, same result" equivalence. The trailing `store` is mandatory
     (`U-MS2 §5.2` requires it on **every** rag/edit schema; it is not new surface).
   - `ops` is **required**, with **no `.min(1)`**: an empty batch is a valid no-op
     (`{ ok: true, results: [] }`, `rag-store.ts:1379`) and a documented happy-path state
     (`unit-p §5.6.6`).
   - description (pinned): `Apply a batch of edit ops ATOMICALLY through the store's applyBatch
     transaction primitive: all or nothing, ONE batch journal entry, ONE persist, a mid-batch
     failure rolls back. Each op is a closed BatchOp member (putNode/removeNode/putEdge/removeEdge/
     setProps/setSubtree/setType) and a malformed or failing op returns { ok: false, error,
     failedIndex }. Requires edit group.`
4. **`src/main/mcp-server.ts` — `handleEditTool` gains `case 'edit.batch'`**, after
   `edit.set_doc_meta` and before `default`:
   - the ops value is passed **RAW** (`const ops = args.ops`) — the Finding-5 discipline every
     sibling case follows;
   - the call is `handleEditBatch(target, { ops: ops as BatchOp[] })` — the **same shared handler
     the IPC path calls**, never an inline `applyBatch` call, so the malformed-payload fail-state
     is byte-identical on both paths;
   - on `result.ok`, derive the payload **exactly as `main.ts:1044-1059` does** — capture
     `preBatchNodes` from `target.getNode(op.node.id)` for every `putNode` op **before** the call,
     then `deriveBatchBroadcast(ops, result.results, preBatchNodes)` — and `emit({ kind, nodeIds,
     edgeIds, store: storeName })` **once**. A failed/malformed batch emits **zero** times. An
     empty batch emits once with an empty payload, which is what the UI path does (equivalence
     beats a special case);
   - the `edit.` prefix already routes to the reconcile+broadcast callback (`:2432-2459`), so the
     retrieval-index reconcile and the renderer broadcast come for free; **no change there**.
5. **`src/main/edit-ops.ts` — NO CHANGE.** Say it out loud so a reviewer does not go looking.
6. **Tests.** `tests/unit/shell-chrome/edit-batch-register.test.ts` (the SEAMS census + the gate)
   and `tests/integration/shell-chrome/edit-batch.test.ts` (the SERVER path over the SDK's own
   in-memory transport — `client.callTool` — never a direct `handleEditTool` call).

## §4 ACCEPTANCE (what "registered" must mean)

- **A real result over the existing primitive.** `client.callTool({ name: 'edit.batch',
  arguments: { ops: […] } })` answers a `BatchResult` with one agreeing `BatchOpResult` per op and
  the write is observable through `store.getNode` / `store.journal()` — a tool that answers but
  writes nothing is the SAME defect (`B-5`'s lesson, and this unit's adversarial arm A1).
- **In the `edit` group, default-off.** With the default gate the name is ABSENT from
  `allowedToolNames()` and from `client.listTools()`; with `edit` enabled it is PRESENT in both.
  The gate refuses, never a handler throw.
- **A schema the MCP server accepts.** `tools/list` advertises `ops` (array, required) and `store`
  (string, optional); the row registers without an SDK throw.
- **A row that drives the server's own `registerTools` path.** The integration arm connects a real
  `Client` to `ensureServerRegistered()`'s server over `InMemoryTransport` and calls the tool —
  never `handleEditTool` directly (that is a unit arm only, for the fail-states).
- **A census shows it.** `ProvidentMcpServer.ALL_TOOLS` contains the name at **60** entries;
  `groupForTool('edit.batch') === 'edit'`; `toolAllowed('edit.batch', ['read','dispatch'])` is
  `false` and `toolAllowed('edit.batch', ['edit'])` is `true`. Reachability is proved, not assumed.

## §5 ADVERSARIAL ARMS (owed, RCA-3)

- **A1 — answers but writes nothing.** A batch whose op is valid but inert (`removeNode` of an
  absent id → `{ op: 'removeNode', removed: false }`): the tool must answer `ok: true` **and** the
  store must be provably unchanged (byte-equal read-back of the pre-seeded node, the node/edge
  census unmoved, **no journal entry beyond the transaction's own single `batch` record** — `+1`,
  because `applyBatch` lands one `batch` entry on every success path including a no-op
  (`rag-store.ts:1451`), so a literal "journal depth unchanged" would contradict the primitive —
  and the emitted payload still equal to `deriveBatchBroadcast`'s own answer, never a fabricated
  "wrote X"). *§5 was corrected during the red run: the first draft of this arm said "journal
  depth unchanged", which the primitive cannot satisfy.*
- **A2 — a batch that half-applies.** `[<valid putNode>, <putEdge to a nonexistent node>]` must
  leave the store **exactly** at its pre-batch bytes, journal depth unchanged, 0 persists,
  `{ ok: false, failedIndex: 1 }`, and **no** `rag-store-changed` emission.
- **A3 — a group the gate refuses.** With `edit` off, the tool is not in `tools/list` and not in
  `allowedToolNames()`; a direct SDK `callTool` for it is the SDK's not-found, never a write.
- **A4 — malformed ops.** `ops: 'nope'` / an absent `ops` (direct handler) → the
  `edit-batch: ops must be an array` domain result, no throw, no emission; `[{ op: 'bogus' }]` →
  `rag applyBatch: invalid op at index 0`.
- **A5 — store selector.** `store: 'nowhere'` fails loud BEFORE any write (`resolveStoreArg`),
  `store: ''`/`9` → the byte-pinned `store must be a non-empty string`, and a batch addressed at
  store X writes ONLY X (no foreign-store bleed).

## §6 THE RED SET (run and reported BEFORE the change)

Arms that answer "the tool is absent" at the pre-fix head: `ALL_TOOLS`/census (59, no
`edit.batch`), `groupForTool` → `null`, `allowedToolNames()` absence under `edit`,
`client.listTools()` absence, `client.callTool` → `-32602`, `handleEditTool` → `unknown edit
tool: edit.batch`, and the schema/handler rows. Every one is RED by measurement, not by
construction.

**Class-(b) obligations this landing OWES to other units' test files** (pinned literals, reported
not silently fixed): the `ALL_TOOLS` census `toHaveLength(59)` at
`tests/blind-unit-ud6-query-document-filters-greens.test.ts:537`,
`tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts:614`,
`tests/unit-h8-operator-editor.test.ts:1273`, and the captured `PRE_CHANGE_ALL_TOOLS` `toEqual`
fence at `tests/unit-app-harness-readiness.test.ts:746-749` — each owes **59 → 60**. They live
outside this unit's write scope and are reported to L0 as class-(b), the established class.

## §7 DOCUMENTATION ROWS THIS FIX MAKES TRUE OR REPAIRS

Named individually, because a bare "docs updated" hides an overstatement:

1. `docs/defects.md` — `MCP-EDIT-BATCH-NOT-REGISTERED`: OPEN → **FIXED**, with the route and the
   evidence.
2. `docs/specs/unit-p-ipc-edit-batch.md` §1 (`:34`) and §5.5 (`:471-474`) — "FORWARD-LOOKING — a
   later unit" is now **LANDED**; the mapping table and binding rules become the served contract
   (§5.6 item 8 is now exercisable through the MCP path). Plus §5.8's "New MCP tool
   (forward-looking): 1" census line, which is now MET rather than forward.
3. `docs/decisions.md` — the `IPC-EDIT-BATCH` row's "(forward-looking wiring)" parenthetical is
   corrected ("the MCP `edit.batch` tool — LANDED"), plus one `DECIDED: MCP-EDIT-BATCH-REGISTERED`
   row recording the route, the group membership (no new group), the lax-schema/strict-handler
   choice and the census 59 → 60.
4. `docs/specs/unit-authority-switch.md` `:523-528` (the count anchor) and `:1092-1093` (the census
   cells, incl. the grid) — the "there is no `edit.batch` MCP tool registration" clauses are
   annotated beside (pinned register rows are never rewritten): **the union stays 31 and the grid
   stays `31 × 4 = 124` — the 31st member's CLASS moved (IPC-only → registered), so the REGISTERED
   count moves 30 → 31 and `FS17`'s arm stays `31`.** (An earlier draft of that annotation said
   32/128; `8 + 9 + 7 + 7 = 31`, and the doc review caught it — the correction is recorded at the
   row.) The `edit.batch` ROUTE pin itself is unmoved — the tool reaches the same authority the
   primitive did.
5. `docs/specs/multi-document-store-config-review.md:151` — "no `edit.batch` MCP tool — IPC-only"
   annotated beside; the row's `12` is a count of the prefix families at ITS filing head, and at
   this head they read `rag.*`×6 + `edit.*`×9 = 15 (U-D5, U-D7 and this unit). Its real assertion —
   the five-seam gate is untouched — is confirmed still true.
6. `docs/specs/rebuild-drift-map-2026-09-21.md:502` (row `AS-9`) — same union correction: 31
   members / 124 cells UNMOVED, the 31st now registered.
7. `docs/specs/wave-2-open-decisions.md:135` (`W2-N13`) — "fork/mutate-all/cancel applied via the
   atomic `edit.batch`" re-pointed: that path is `bridge.edit.batch` → `IPC_EDIT_BATCH`, the UI
   channel; the MCP name is now a distinct, registered surface.
8. `docs/L1/unit-b-5-pane-links.md` §7 (`G5`'s `G5-04`), §8 (the restore-route amendment), §9
   (`O-5`) and `docs/L2/shell-chrome/pane-links.md` (`B5-F11`) — the finding's recorded state:
   closed by this landing, with the census that proves it. The limb's own bridge route is left
   alone: it was never the defect.
9. `docs/specs/post-division-local-elimination-inventory.md:612` — the `ALL_TOOLS` rows figure
   (fork 59 → **60**, delta 37 → 38), annotated beside.
10. `docs/next-steps.md` — a DONE row for this unit (red set, change set, gates, layers), plus the
    dated note on the `:2201` "forward-looking wiring" restatement.

## §8 ADVERSARIAL FINDINGS (registered — the RCA-3 pass, `role_l2_examiner`, read-only, 26 driven scenarios)

**THE THREE ARMS THIS UNIT EXISTS TO SURVIVE ALL HELD, measured over a real `Client` →
`InMemoryTransport` → `registerTools` path, with the store's own `getNode`/`listNodes`/`listEdges`/
`journal()`/persisted-JSON bytes read in the same run as the answer:**

- **A1 (answers but writes nothing) — HELD, no disagreement.** Nine scenarios (inert `removeNode`/
  `removeEdge`, `setProps`, `setType`, the same `putNode` twice, remove-then-re-add, a forward
  `putEdge` reference, a 500-op batch at **9 ms with exactly one emission**, and a
  `store`-addressed batch that wrote BETA and left ALPHA's file untouched). **No scenario produced
  an answer that disagreed with the store.**
- **A2 (a batch that half-applies) — HELD, atomic in all four shapes.** A dangling-edge failure at
  index 1, a failure at index 0 of three, a **2-edge cascade then a failure** (the edges came
  BACK), and a malformed `children` payload: every one answered `{ ok: false, failedIndex: n }`,
  left the counts and the journal at their pre-batch numbers, the persisted file **byte-equal**,
  and **zero** emissions.
- **A3 (a group the gate refuses) — HELD, by ABSENCE.** The default gate: `allowedToolNames()`
  excludes it, `tools/list` lists 9 tools without it, `callTool` answers `MCP error -32602: Tool
  edit.batch not found`, and the store stayed at 0 nodes / 0 journal / 0 emissions. After
  `applyGatePatch({ groups: ['edit'] })`: listed, and it WRITES. **No bypass exists**:
  `provident.op`, `provident.load`, `provident.code.loadBatch`, `provident.dispatch`, the module
  tools and all three `mcp://` resources were each driven and left the RAG store unmoved.

**FOUR FINDINGS ARE CARRIED, and NONE of them is this tool's own logic — every one lives in the
SHARED helper or the primitive the UI path already uses, so MCP and UI are wrong (or right) the
same way:**

1. **`deriveBatchBroadcast` emits an EMPTY `nodeIds` for three of the seven op members**
   (`edit-ops.ts:656-663`): a successful `[setProps]`/`[setSubtree]`/`[setType]` batch emits
   `{ kind: 'structural', nodeIds: [], edgeIds: [] }` while the store DID change — the helper's
   comment still assumes those ops "never reach a successful batch", which `rag-store.ts:1309-1369`
   falsifies. Consequence: the retrieval reconcile (`retrieval.ts:688-701`) iterates `nodeIds` only
   and reconciles nothing. **PRE-EXISTING, shared with the UI path, FILED as
   `docs/defects.md` `BATCH-BROADCAST-NAMES-NO-NODE-FOR-RICH-OPS` — not fixed here** (fixing it
   moves the UI path's payloads, another unit's pinned behaviour; the one-line shape is named in
   the row).
2. **A batch that changed nothing still journals and emits.** `[removeNode('<absent>')]` answers
   `removed: false`, yet lands a `batch` journal entry, rewrites the whole store file and emits one
   `structural` payload naming the ghost id. **NOT a defect of this unit and NOT of the tool: the
   emission is exactly what `main.ts`'s UI path does (this unit's equivalence claim requires it),
   and the journal/persist pair is `DECIDED: BATCH-ATOMICITY-API`'s own pinned "a successful batch
   lands a SINGLE `batch` journal entry and persists ONCE"** — with the empty batch as its one
   documented early return (`rag-store.ts:1379`, and `unit-p` §5.8's "an empty batch broadcasts 1
   time"). Changing either would be a supersession, not a fix. **RECORDED, not actioned.**
3. **A failing op that faults by throwing loses its index** (`failedIndex: -1` with
   `rag applyBatch: unexpected failure`): `ops: [null]`, `[<valid>, null]`, and a ~4500-deep
   `props` (measured: `RangeError: Maximum call stack size exceeded` out of the UNCAPPED recursive
   `hasDangerousKey` at `rag-store.ts:345-366` and `deepCopy`, which `rag-store.ts:41` IMPORTS from
   `src/main/adjacency.ts:26-36` — where `edit-ops.ts:62-66` caps at depth
   cap). All fail closed (nothing written, nothing persisted, 0 emissions), so this is diagnosis
   quality. **CARRIED to the same defect row.**
4. **The tool's schema makes `handleEditBatch`'s own payload guard unreachable through the SDK**
   (`ops: null`/`{}`/absent → the SDK's `-32602 Input validation error` before the handler runs).
   **The unit-pinned domain message `edit-batch: ops must be an array` is therefore the DIRECT
   handler's fail-state only** — which is what `tests/unit/shell-chrome/edit-batch-register.test.ts`
   U4(a) drives, and the case comment in `mcp-server.ts` has been corrected to say so. Nothing is
   written on either path.

**One app-layer note, not driven and not this unit's (finding 9 of the pass):** `IPC_EDIT_BATCH`
(`main.ts:1038`) applies a batch with no gate check, by design — `DECIDED: IPC-EDIT-BATCH` pins the
channel as **NOT group-gated** ("the renderer is a trusted surface; the `edit` group gates the MCP
agent path, not the UI IPC"). **RECORDED as the pinned design, not a finding.**

**LAYER of every reading above:** MCP-SURFACE / NODE. The renderer, the assembled app and the live
stdio/HTTP hop are NOT covered by this unit.

## §9 LAYERS (RCA-12 — what each gate can and cannot say)

- **MCP-surface / node (this unit's whole claim):** registration, group gating, schema, the
  `registerTools`→SDK `callTool` path, the atomic write, the rollback, the emission count. Asserted
  in-process over `InMemoryTransport`.
- **NOT claimed: the assembled/app layer.** No claim that a real Electron client with `edit`
  enabled over stdio/HTTP answers — that is a live layer, and this unit does not run one. The
  in-process SDK client is the strongest reachability this repo can assert without a spawned app.
