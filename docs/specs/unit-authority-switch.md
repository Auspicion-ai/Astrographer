# Unit U-AUTHORITY-SWITCH — the authority-switch / offline dual-path contract (O-8) — Spec

**Status:** **SPEC LANDED — RED SET OWED.** This unit is the **code-bearing contract** for the O-8
track item (*"who owns the persisted corpus during/after a cutover; split-brain + offline-write
reconciliation"*, `docs/pending.md` §"PARKED DESTINATION — the engine track", the **O-8** row) and it
is the **P2 prerequisite** `U-AUTHORITY-SWITCH` of the approved program
(`docs/specs/design-extensions-review.md` **§13 THE APPROVED PROGRAM (P0–P4)**, P2 row + **§13.2 The
sequencing rules (S1–S5)**). It is the unit that **lands the authority switch** whose arrival
**ends the temporary authority** of the local store pinned by the same record's
**§14.5 THE "TEMPORARY AUTHORITY + SUNSET" RULE**. No code is written from this file until a
TestWriter has run and **reported** the red set (`AGENTS.md` item 9 / RCA-1).

**This spec does NOT author the Gnosis-side work.** `U-ENGINE-PERSIST` (the engine's durable corpus,
the O-7 leg) is a **handoff to the sibling `../Gnosis` repo**, never a patch from here
(`AGENTS.md` item 7; the **O-7** pointer row in `docs/HANDOFF.md` §OPEN handoff items). This unit
**consumes** that unit's outcome as a prerequisite.

**Layer (RCA-12, mandatory declaration):** **SPLIT — `pure` + `engine-dependent/assembled`.** Stated
plainly, because a green here does not mean what a green elsewhere means:

- **PURE (node-testable, no engine, no Electron, no display).** The **authority state machine**, the
  **total routing resolver**, the **switch-condition evaluator**, the **migration-receipt validator**,
  the **reconciliation rule** and the **census comparison** are pure functions over plain data. A node
  red/green set covers these completely, and it is where the register's rows live.
- **ENGINE-DEPENDENT / ASSEMBLED (NOT node-assertable).** The real behaviors — the engine actually
  owning the corpus, a real cutover, a real engine death mid-session, a real rollback restore, and the
  two-writer surface — are properties of the **assembled app against a live Gnosis instance**. They
  are **structurally unassertable in node**: the dom-shim is layout-less/CSS-less, and there is no
  engine in the node suite. Per RCA-11 (the live-scenario battery is a **MANDATORY pre-DONE gate**, not
  parked-by-default) this unit's `-live-pending-battery.md` set must be **RUN against the app**
  (`scripts/live-drive.mjs`, CDP + MCP) **before** its DONE row — `docs/specs/design-extensions-review.md`
  **§13.3 Per-unit gate obligations** marks `P2 U-AUTHORITY-SWITCH` **live battery MANDATORY** and
  records why (*"the two-writer/split-brain surface is an assembled-app property, RCA-12"*).
- **WHAT A GREEN DOES NOT COVER.** A node green does **not** establish that the engine persists
  anything, that the migration moved the corpus, that no second writer exists in the running app, or
  that a rollback restored the corpus. It establishes the **contract's decision table** only. The DONE
  row must carry both layers separately, and the live reading unclaimed until it is run.
- **This unit is NOT UI-rendering.** It authors no pane, no control node and no CSS. Its one UI-adjacent
  consequence is the **surface state vocabulary** (§8 states 1–9) which the owning UI units render; the
  `docs/skills/designing-pages.md` skill file, its test-use-case coverage matrix and its demo-page index
  **do not exist in this tree** (verified by glob over `docs/skills/**`; the absence is recorded by
  `docs/specs/design-extensions-review.md` **§15** as an owed item), so **no skill update is possible
  or attempted by this unit** — the state vocabulary is pinned here and is the input to that skill when
  it is authored. This is recorded, not silently skipped.

**Contract regime (S2 — mandatory declaration).** This unit is the unit that **changes the regime**: it
starts in the **local-authoritative** regime and ends in the **engine-authoritative** regime, and its
own delivery is therefore the one place where **both regimes exist in one unit by construction**. That
is legal here and nowhere else: the two-regime prohibition
(`docs/specs/design-extensions-review.md` **§3.6 F.3** item 3, **§12.7(f)**, S2) is what this unit
**resolves**. Every other unit's DONE row still states one regime.

**Depends on (upstream of this spec):**

- **`U-ENGINE-PERSIST`** — **upstream, in the Gnosis repo: a HANDOFF, not app work.** It is the O-7
  leg and it is what makes *"the engine persists NOTHING today"* (`docs/HANDOFF.md` §OPEN handoff
  items, the **O-7** pointer row; the O-7 constraints cell in `docs/pending.md` §"PARKED DESTINATION —
  the engine track") stop being true. Its durability direction (`PRUNE-838` / GR-7, the
  `docs/requirement-catalog.md` §C.4 non-prunable ledger row) is the upstream owner's, cited never
  edited. **This unit cannot create it, cannot patch it and cannot fake it**: the switch's
  `enginePersistent` condition (§3.2) reads its evidence (V1, §9.1).
- **`U-CORPUS-MIGRATION`** — the sibling P2 unit that owns the **mechanics** of moving the operator
  corpus into the engine (§6 pins the boundary and the `MigrationReceipt` this unit reads).
- the **read model** — `docs/specs/design-extensions-review.md` **§12 THE READ MODEL (tab-scoped
  cache)** (residency, miss policy, eviction, the dirty machine, failure UX, `"persists"` semantics) and
  its unit `U-READS-PIVOT` (P2). This unit **routes** reads; it does not re-pin the cache.
- the **fence plan** — `docs/specs/design-extensions-review.md` **§14.2 THE RE-PLANNED FENCES**
  (verification V6, §9.1). `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` are
  **exempt by name** and **may not be re-derived by any `GN-*` unit**.
- the rulings: `docs/specs/design-extensions-review.md` **§11 USER RULINGS (2026-09-21)** — `GN-1`
  (§11.1, the engine owns document CRUD), `GN-3` (§11.2, the **launcher** owns the spawn — **no new
  exec capability enters `src/`**), `GN-4` (§11.3, **refuse to open a wiki without an engine**), and the
  read-model ruling (§11.5).
- the code this unit's contract is written against: `src/main/rag-store-runtime.ts`
  (`RagStoreRuntimeController`, `createRagStoreRuntimeController`), `src/main/rag-store-directory.ts`
  (`RagStoreDirectory`, `RagStoreEntry`, `resolveStoreArg`), `src/main/rag-store-registry.ts` +
  `src/main/rag-store-registry-write.ts` (`RegistryMutation`, `writeRegistryMutation`),
  `src/main/engine-rag-store.ts` (`EngineRagStore`, `EngineUnavailable`, `EngineWireError`,
  `ConflictError`), `src/main/engine-crud-rag-store.ts` (`EngineCrudRagStore`, `createEngineCrudRagStore`,
  `ENGINE_CRUD_ENDPOINTS`, `validateCrudResult`), `src/main/mcp-server.ts` (`handleRagTool`,
  `handleEditTool`, `handleGnosisTool`, the tool registrations), `src/main/security.ts`
  (`ToolGroup`, `groupForTool`, `SecurityGate`, `TOOL_GROUPS`), `src/main/main.ts` (the `ipcMain.handle`
  registrations), `src/main/preload.ts` (the `bridge` surface), `src/shared/types.ts` (the `IPC_*`
  constants + the payload interfaces).

**Blocks:** the **cutover unit** (the unit that actually moves document handling onto the engine, and
the one that may re-state the commit contract — `C9` `U-EDIT-1`, `docs/specs/design-extensions-review.md`
§3.3 C9 / **§12.7(a)**). **Nothing cuts over before this unit and its P2 siblings land**
(`docs/specs/design-extensions-review.md` **§13.1** P2, **§13.2 S4**, **§15** item 1).

**Must NOT do (the frozen boundaries this unit inherits, restated because they bound its work):**
re-open the closed **O-9**/**O-10** gates; re-schedule or touch the **frozen O-5 queue**
(`docs/next-steps.md` §NEXT QUEUE — the re-numbered order leading with O-5); edit the §C.4 ledger;
re-derive the fence; add an exec capability to `src/`; patch the Gnosis repo; re-seed
`O0_OPERATOR_DOCUMENTS = 226`.

---

## 1. What this unit asks

One question, in the record's own words: **who owns the persisted corpus during and after a cutover,
and what happens to a write on either side while the authority is moving?** (`docs/pending.md`
§"PARKED DESTINATION — the engine track", the O-8 row; `docs/HANDOFF.md` §OPEN handoff items, the O-8
pointer row, which records that *"without it the cutover would have two writers and no reconciliation
story"*).

Five deliverables:

   1. **The switch point** — the exact conditions under which authority moves, the ordered cutover
   sequence, and the state machine (local-authoritative → dual → engine-authoritative) **including the
   temporary-authority state with its sunset** (§3, §14 S1).
2. **Split-brain prevention** — the replacement of the single-writer rule, the two-revision rule, the
   local-write-during-cutover reconciliation, and a **total** read/write routing table per MCP tool and
   per renderer IPC (§4, §5).
3. **Offline / engine-loss during a session** — `GN-4` decides the boot case; this unit pins the
   mid-session death case, the retry policy, the cache's state and the fate of uncommitted edits (§8).
   4. **The surfaces that must NOT move** — the MCP server, the security seam, the operator stores, the
   vector cache and the multi-store registry, each with its rule and the reason the ruling leaves it in
   place (§7).
5. **The corpus-migration interface** — the boundary against `U-CORPUS-MIGRATION`: what this unit
   requires of it, and what it may not do itself (§6).

---

## 2. Feasibility verdict

**FEASIBLE, with one hard external dependency and one structural honesty bound.**

- **The contract is pure and derivable.** The authority state machine, the routing resolver, the
  switch-condition evaluator and the receipt validator are total functions over plain data; every state
  and every fail-state is enumerable and assertable in node. That is what makes the TestWriter's red set
  real rather than speculative.
- **The engine dependency is external and named.** The destination regime is **not reachable today**:
  the engine persists nothing (`docs/HANDOFF.md` O-7 pointer row) and `U-ENGINE-PERSIST` is a handoff.
  This unit therefore **pins the contract and the decision table now** and pins that the tables are
  **inert** until the conditions hold — an unverified switch is refused (`FS1`), never attempted.
- **The corpus is a real, singular object.** `226 documents / 6 102 nodes / 9 266 edges` in the local
  store (`provident-rag.json` in userData) — the record's §14.1 `C-1` row, sourced from the O-0
  artifact's own corpus row (`docs/pending.md` §"PARKED DESTINATION — the engine track",
  trigger (b)'s node-ceiling input). **`O0_OPERATOR_DOCUMENTS = 226` must not be re-seeded**
  (`docs/specs/design-extensions-review.md` §3.6 F.3 item 9, §13.3).
- **The honesty bound.** This unit **cannot** make the corpus durable, cannot verify `U-ENGINE-PERSIST`'s
  internals, and cannot assert an assembled-app property in node. It can only **refuse** to switch
  without evidence, and require the live battery before DONE. Stated, not hidden.

### 2.1 What this unit does NOT claim

- It does **not** claim the switch has happened. **No pass may describe the cutover as already done**
  (`docs/specs/design-extensions-review.md` §14.5 item 3).
- It does **not** claim engine persistence, migration completion, or a passing fence — those are
  **readings** carried by `U-ENGINE-PERSIST` / `U-CORPUS-MIGRATION` / the trio, cited as inputs (§9.1 V1–V7).
- It does **not** author the async commit contract. That belongs to `C9` `U-EDIT-1`
  (`docs/specs/design-extensions-review.md` §12.7(a)): **no unit may implement an async commit before
  that restatement lands**, and this spec therefore pins the commit's **routing and failure state**,
  never its wire shape.
- It does **not** re-pin the read model. Residency, the miss policy, eviction and the dirty machine are
  `docs/specs/design-extensions-review.md` §12; this unit consumes them.
- It does **not** change any MCP tool name, any tool schema, any group name, or the pinned MCP contract
  `docs/specs/mcp-endpoint.md` (**HOST-OWNED**, §7 item 1). The `edit.set_content`-becomes-an-alias
  clause is **explicitly not implied by `GN-1`** and is **not** authored here (§4.4).

### 2.2 Verified boundary facts (stated so the landing pass need not re-derive them)

- **Every document write today reaches ONE local store through ONE queue.** The MCP `edit.*` handlers
  take an optional `store` selector resolved by `resolveStoreArg` (`src/main/rag-store-directory.ts`),
  and with a directory injected the addressed entry's store serves the call
  (`SINGLE-WRITER-STORE-PER-STORE`, `docs/decisions.md` §ACTIVE); the renderer's three edit IPCs
  (`IPC_EDIT_COMMIT`, `IPC_EDIT_BATCH`, `IPC_EDIT_RICH_COMMIT`, `src/shared/types.ts`) call
  `runtime.getDefaultStore()` in their `ipcMain.handle` bodies (`src/main/main.ts`) and broadcast
  `IPC_RAG_STORE_CHANGED` with `store: runtime.getDefaultName()`.
- **The engine-side proxy is a SEPARATE interface, not a `RagStore`.** `createEngineCrudRagStore`
  (`src/main/engine-crud-rag-store.ts`) returns the **11-method** `EngineCrudRagStore`
  (`createDocument`/`getDocument`/`updateDocument`/`deleteDocument`/`publishDocument`/`unpublishDocument`/
  `archiveDocument`/`listDocuments`/`createWiki`/`getWiki`/`listWikis`, all **async**, all
  `Promise`-returning), with `ENGINE_CRUD_ENDPOINTS` bijective with the 11 methods; it is **not** a
  `RagStore` and the synchronous-read pin (`docs/decisions.md` §ACTIVE `ASTROGRAPHER-SCOPE-REALIGNMENT`)
  does not describe it. **No concrete type satisfies `GN-1` today** — the record's §3.2 B.1 item 3,
  marked SUPERSEDED-as-a-recommendation but **its facts adopted as the program's gates** (§11.1).
- **The engine's typed failure vocabulary already exists**: `EngineUnavailable`, `EngineError`,
  `WireError` subclasses / `EngineWireError`, `TraceUnavailable`, `ConflictError` and
  `ENGINE_HTTP_STATUS` live in `src/main/engine-rag-store.ts`; `ConflictError` is the 409 a stale
  `baseRevision` surfaces on `gnosis.document.update` (the `updateDocument` schema arg in
  `src/main/mcp-server.ts`). §8 reuses this vocabulary rather than inventing one.
- **The engine proxy reads and the engine CRUD proxy are registered as 31 MCP tools** in the
  `rag`/`edit`/`gnosis`/`gnosis-edit` groups: **8** `rag`-group (`rag.query`, `rag.get_document`,
  `rag.list_nodes`, `rag.get_edges`, `rag.backlinks`, `rag.list_documents`, `rag-stream`,
  `get_query_audit_log`), **9** `edit`-group (`edit.set_content`, `edit.create_node`,
  `edit.delete_node`, `edit.split_node`, `edit.merge_node`, `edit.set_edge`, `edit.import_markdown`,
  `edit.set_doc_meta`, and the `edit` group's own `edit.batch` IPC counterpart), **4** read-only
  `gnosis`-group CRUD tools (`gnosis.document.get`, `gnosis.document.list`, `gnosis.wiki.get`,
  `gnosis.wiki.list`) + the retrieval trio (`gnosis.query`, `gnosis.stream`, `gnosis.status`), and
  **7** mutating `gnosis-edit`-group tools (`gnosis.document.create`/`update`/`delete`/`publish`/
  `unpublish`/`archive`, `gnosis.wiki.create`). **§5's routing table is keyed on exactly this set and
  counts 31 tools** (`security.ts` `TOOL_GROUPS` is the group authority; `gnosis-edit` is in
  `security.ts` `VALID_GROUPS`, and the `gnosis`/`gnosis-edit` split is the A2 wiring's).
- **The state the renderer holds is the dirty machine of the read model**, not this unit's invention:
  `clean` / `uncommitted` / `commit-failed` / `closing-dirty` (`docs/specs/design-extensions-review.md`
  §12.4). §4.3 and §8 read it; they do not extend it.

### 2.3 HARD BOUNDARY — the MUST-NOT-EDIT list (verified, not cautious)

- `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` — **exempt by name**; a unit
  that cannot stay green under them is **not** an implementation of the ruling but a new proposal
  re-entering the gate (`docs/specs/design-extensions-review.md` §11.1 item 5, §14.2).
- `docs/specs/mcp-endpoint.md` — the pinned MCP contract; **host-side by contract**.
- the §C.4 39-row upstream-owed ledger (`PRUNE-801`–`PRUNE-839`) and the four `invalidated-conflict`
  freeze carriers — **cited, never edited**.
- `src/shared/o0-report.ts` + `scripts/live-drive.mjs` — the **oracle-identity pair**
  (`docs/specs/design-extensions-review.md` §13.3: *"No unit of this program may touch the pair as a
  side effect"*).
- the O-9/O-10 unit pins and the frozen O-5 queue.

---

## 3. THE SWITCH POINT

### 3.1 The authority states (the state machine's carrier)

The authority state is **one value per running app session**, exposed as a string union. The names are
pinned here because every routing cell, every fail-state and every DONE row refers to them.

| State | Name (pinned) | What it means, exactly | Who owns DOCUMENT writes |
| --- | --- | --- | --- |
| **S0** | **`local-authoritative`** | the host's local `RagStore` is the authority; the engine is optional (`GNOSIS-LAUNCHER-TOGGLE`), and an absent engine changes nothing about it | the host store (its per-store single-writer queue) |
| **S1** | **`dual`** | the migrated engine copy exists and verifies, and the **migration receipt is valid**; the host store is **still the write authority**; every committed local write is mirrored engine-side as a **shadow replica** until the cutover decision lands | the host store; the engine holds a **replica**, never an authority |
| **S2** | **`engine-authoritative`** | the engine owns document CRUD; the host keeps **only** the tab-scoped read cache of the read model; the local store is **frozen** (readable for rollback, never written) | the engine, through the 11-method `EngineCrudRagStore` proxy |
| **S3** | **`engine-authoritative-offline`** | S2 with the engine **unreachable mid-session**: reads are served only for **resident** cache entries; **all** document writes are refused with the typed vocabulary; the local store is **still frozen** | **nobody** — writes are refused, never redirected locally |

**Temporary authority (the record's pinned state, carried here).** *Until P2 lands, the local store is a
temporary authority with a recorded sunset condition; the contract says engine-authoritative while the
code still writes locally; that gap is RECORDED, never hidden*
(`docs/specs/design-extensions-review.md` **§13.2 S1** + **§14.5**). Pinned in this unit's terms:

- **`TEMPORARY-AUTHORITY-1` (the contract-level form).** Before P2 lands, the record's regime is
  engine-authoritative while the code's regime is S0. **This spec is an instance of that gap** and its
  DONE row must state it.
- **`TEMPORARY-AUTHORITY-2` (the runtime form).** S1 (`dual`) is itself a temporary authority: the
  engine holds a verified replica and is not yet the authority. **S1 has no other purpose** and may not
  be used as a steady state.
- **THE SUNSET CONDITION (pinned, verbatim in substance from §14.5 item 2):** *the local store's
  authority ends when `U-AUTHORITY-SWITCH` (O-8) lands and the authority-switch row records the
  cutover* — **from that point a surviving local document write is a fence violation, not a temporary
  authority.** Operationally: the sunset fires when the **`authority-switch` record** (§3.3) is written
  with `state: 'engine-authoritative'`. **The sunset is not a date and not a version** — it is that one
  record.

### 3.2 The switch conditions (all of them, each independently checkable)

The switch MAY NOT begin until **every** condition holds. Each condition is an input the evaluator reads
(the reading procedure is the V1–V7 checklist of **§9.1**; `FS1` is the refusal).

| # | Condition | What satisfies it | Fail-state if read as satisfied without it |
| --- | --- | --- | --- |
| **C1** | **engine present** | a health report from the LANDED proxy in state `Ready` (`EngineRagStore.health()` / `getEngineStatus()`, `src/main/engine-rag-store.ts`), on the loopback base the launcher exports (`GNOSIS-LAUNCHER-TOGGLE`, `docs/decisions.md` §ACTIVE) | `FS1` |
| **C2** | **engine persistent** | the `U-ENGINE-PERSIST` **durability evidence** (V1): a corpus written to the engine survives an engine restart and re-verifies by census (the O-7 pointer row's *"PERSISTENCE (the engine server persists NOTHING today)"* is the condition being discharged) | `FS1`, `FS16` |
| **C3** | **the migration is complete** | a **valid `MigrationReceipt`** (§6.2): `status: 'complete'`, `rollbackPoint` present, census equality against §9.1 V2, and **zero** unmigrated documents | `FS2` |
| **C4** | **the cache unit landed** | `U-READS-PIVOT` landed with its read-model red set green: residency ownership, the miss policy, the eviction rule and the boot sequence (`docs/specs/design-extensions-review.md` §12.2/§12.3/§12.6) | `FS1` |
| **C5** | **a revision/marker exists** | the engine's per-document revision is readable and monotonic (`Document.revision` on the 11-method proxy; the record's §14.4 pin — *"a cache cannot be made coherent without a revision/marker"*) | `FS1`, `FS6` |
| **C6** | **the authority-switch record exists** | the `authority-switch` record (§3.3) written **before** any state change (`FS5`: a state change without the record is the temporary-authority gap going hidden) | `FS5` |
| **C7** | **the rollback point verifies** | `MigrationReceipt.rollbackPoint` re-opens and census-matches the **pre-migration** corpus (V4) | `FS4` |
| **C8** | **the fence is green** | the trio's reading, run **not planned**, with the two fence files green **unchanged** (V6, §14.2's rule: *"No unit may report the fence green from a plan"*) | `FS15` |
| **C9** | **the routing table resolves** | §5's table is total for the session's state: every tool × state cell resolves to exactly one route (§5.1's totality rule) | `FS17` |
| **C10** | **the surfaces are unchanged** | §7's inventory re-verified: the MCP server, the security seam, the operator stores, the vector cache and the registry are **host-owned and unmodified** by the switch | `FS14` |

**Precedence (pinned, so a red set is deterministic).** The conditions are evaluated **in the order
C1 → C10**, and the **first** unmet condition is the one named in the refusal. A refusal **names the
conditions it checked and the one it failed on** — never a bare `false`.

### 3.3 The `authority-switch` record (the durable, citable marker)

The switch's state is **recorded in `docs/decisions.md`** as an ACTIVE row (the P1 obligation of the
program, `docs/specs/design-extensions-review.md` §13.1 P1(a)) and **mirrored at runtime** as a
read-only projection. The record's shape is pinned so that a test oracle can read it and so that no
later pass can describe the cutover loosely:

| Field | Type | Pinned contract |
| --- | --- | --- |
| `state` | `'local-authoritative' \| 'dual' \| 'engine-authoritative' \| 'engine-authoritative-offline'` | the §3.1 names, exactly |
| `since` | ISO-8601 timestamp | when this state was entered |
| `engineBase` | string | the loopback base the state was entered against (`resolveEngineBaseUrl()`'s resolved value; **never** a credential) |
| `migrationReceipt` | `MigrationReceipt` id/digest | the receipt C3/C7 read |
| `sunsetRecorded` | boolean | `true` **exactly when** `state === 'engine-authoritative'` (the §3.1 sunset firing) |
| `rollbackPoint` | string | the verifiable pre-migration location (the local store path + its digest) |
| `regime` | `'local-authoritative' \| 'engine-authoritative'` | the **contract** regime, which is `'engine-authoritative'` from P1 onward and **must be stated even while `state` is `'local-authoritative'`** (S1's whole point: the gap is recorded) |

**Rules.**
1. **The record is written FIRST**, before any state change (`FS5`).
2. **The record is the ONLY authority for the state** — no pass, no DONE row and no UI may infer the
   state from the engine's reachability alone.
3. **`regime` ≠ `state` is legal and is the temporary authority**; `regime === state` is the switch
   having happened. An `authority-switch` record whose `sunsetRecorded` is `true` while its `state` is
   not `engine-authoritative` is `FS5`.
4. **Reversibility (`docs/specs/design-extensions-review.md` §9.2):** the record is a git-visible doc
   row; the **rollback procedure (§9.3) rewrites it**, and a rollback that cannot state the prior state
   is `FS4`.
5. **The marker is observable at runtime** as a read-only projection consumed by the routing resolver
   (§5) and by the warning surface (§8). Its accessor name is pinned in §5.2.

### 3.4 The ordered cutover sequence (the exact order; each step's pre-step is named)

Every step is **abortable**, and an abort returns to the **previous** state with the receipt and the
rollback point intact — never forward.

| # | Step | Pre-step that must hold | On failure |
| --- | --- | --- | --- |
| **K0** | run the **pre-switch checklist** (§9.1 V1–V7) and record the readings | — | do not proceed; the failed reading is named |
| **K1** | write/refresh the `authority-switch` record in state **`local-authoritative`** with `regime: 'engine-authoritative'` (§3.3) | K0 all-green | abort (`FS5` if the record is skipped) |
| **K2** | enter **`dual`** and enable the **shadow replica** (every committed local write is mirrored engine-side) | C1–C3, C6, C7 | abort to S0; the mirror is disabled and the divergence is recorded |
| **K3** | run the **census + divergence read** (§9.2's pre-flip check): census equality again, and **zero** divergent document ids | K2 | abort to S0 (`FS2`); the divergent ids are named |
| **K4** | the **cutover decision gate**: the operator's explicit sign-off recorded on the `authority-switch` record | K3 | stay in `dual` (`FS18`: an unrecorded sign-off is not a sign-off) |
| **K5** | **flip the write routing** to engine-first (§5's `S2` column becomes live) and **freeze the local store** (read-only; never deleted) | K4 | abort to `dual` with routing reverted atomically; the partial flip is `FS3` |
| **K6** | run the **post-flip consistency check** (§9.2) — census equality through the engine, and the frozen local digest unchanged | K5 | **roll back** (§9.3) — never "fix forward" |
| **K7** | write the `authority-switch` record in state **`engine-authoritative`** with `sunsetRecorded: true` (the **sunset fires here**) | K6 | roll back |
| **K8** | run the **post-switch checks** (§9.2 items 4–10) and the **live battery** (RCA-11) | K7 | a failure of items 4–10 is a `FS` per §9.2; a live failure **rolls back** the unit's DONE claim |

**Pinned properties of the sequence.**
1. **It is atomic at K5.** The routing flip is one change: at no instant may a document write be
   attempted on **both** sides for the same state (`FS3`; register `P-AS-1`).
2. **It never deletes the local store.** The local store is the **rollback point** and stays on disk,
   frozen, for at least the retention window pinned by `U-CORPUS-MIGRATION` (`FS4` if the switch deletes
   it).
3. **It is never implicit.** No boot, no timer and no health-poll may advance the state
   (`FS13`: a state advance outside K0–K8).

### 3.5 The state-machine transitions (the closed set)

| From | To | Trigger | Guard |
| --- | --- | --- | --- |
| `local-authoritative` | `dual` | K2 | §3.2 C1–C3 + C6–C7 |
| `dual` | `engine-authoritative` | K5→K7 | K3, K4, K6 |
| `dual` | `local-authoritative` | abort (K2/K3/K5/K6) | the abort is recorded on the `authority-switch` record |
| `engine-authoritative` | `engine-authoritative-offline` | the engine becomes unreachable mid-session | §8.1 |
| `engine-authoritative-offline` | `engine-authoritative` | the engine returns `Ready` within the pinned retry bound (§8.3) | the resident cache is **re-verified**, never trusted blindly (§8.4) |
| `engine-authoritative-offline` | `local-authoritative` | **rollback only** (§9.3), never automatic | the operator's decision; the frozen local store must still verify |
| `engine-authoritative` | `local-authoritative` | **rollback only** (§9.3) | as above |

**There is no direct transition `local-authoritative → engine-authoritative`** (`FS2`/`FS3`: it would
skip the replica verification). **There is no transition out of `engine-authoritative-offline` into any
state that writes** except through `engine-authoritative` or the rollback.

---

## 4. SPLIT-BRAIN PREVENTION

### 4.1 The rule that replaces the single-writer rule

`DECIDED: SINGLE-WRITER-STORE`'s clause *"the main process owns all writes; MCP and UI both route
through it"* is **SUPERSEDED by the ruling** (`docs/specs/design-extensions-review.md` §11.1) and
`DECIDED: SINGLE-WRITER-STORE-PER-STORE` with it. The replacement, pinned here:

> **THE ONE-WRITER-PER-STATE RULE.** At every authority state there is **exactly one** component
> permitted to accept a document write, and it is named by the state: **S0/S1 → the local store's
> per-store single-writer queue** (the superseded rows' *mechanism* survives inside the one
> authority that is still local); **S2 → the engine**, through the 11-method `EngineCrudRagStore`
> proxy; **S3 → no component** (writes are refused). A write accepted by **two** authorities in the
> **same** state is a contract violation, not a race to be resolved.

What survives from the superseded rows, named so nothing is lost silently:

- **the lock-point property, per addressed store** — the local store's per-instance write queue
  (`SINGLE-WRITER-STORE-PER-STORE`) remains the mechanism **while that store is the authority**, i.e. in
  S0 and S1;
- **the MCP↔UI equivalence** — both surfaces reach the **same** authority through the **same** routing
  resolver (§5), so the equivalence is preserved by construction rather than by two parallel paths;
- **what does NOT survive** — the assumption that the lock point is always the main process, and the
  assumption that a document write is a local operation. `docs/specs/design-extensions-review.md` §11.1
  names the per-store mapping onto engine wikis as **this unit's work** (`SINGLE-WRITER-STORE-PER-STORE`
  supersession note).

**The per-store mapping (pinned).** A local registry store name maps to an engine-side identity by a
**1:1 total function** over the resolved registry (`src/main/rag-store-registry.ts`
`ResolvedRagStoreRegistry.stores` — *"the resolved stores in registry array order (no reordering)"*),
with the **default store** (`defaultStoreName`) mapped to the engine's **default wiki**. Pinned
properties: the mapping is **injective** (`FS4` on a collision); the **implicit** zero-config registry
(`implicitRegistry`, one entry `{'main'}` with the legacy `provident-rag.json`) maps to the **single
default wiki**; and **no cross-store transaction** is introduced (the superseded per-store row's
`no cross-store write transactions` clause is preserved, now with the engine as the writer).
**Registry identity is not corpus identity**: a registry mutation (hot add/remove/rename/set-default)
changes which engine identity a name maps to and therefore **requires a receipt for the new mapping**
(`FS2`). A `hotRemove`/`hotRename` while in S1/S2 is **refused** (`FS11`) — the multi-store registry is
host-owned (§7 item 6) but a store that has been cut over may not be un-registered under a live engine
authority without its own receipt.

### 4.2 When both sides hold a revision

**The two-revision rule (pinned).** Both sides carry a per-document revision: the engine's
(`Document.revision` on the 11-method proxy, the optimistic-concurrency field `gnosis.document.update`
requires as `baseRevision`) and the host's (`RagNode.updatedAt`, the local store's own stamp).

1. **Engine-side concurrency is the engine's 409** — a stale `baseRevision` surfaces `ConflictError`
   (`src/main/engine-rag-store.ts`; `ENGINE_HTTP_STATUS` gives it 409). **The host never retries a 409
   silently**: the conflict surfaces as a typed failure on the committing surface (the `commit-failed`
   state of the read model's dirty machine, §12.4) with the document id and the two revisions named.
2. **Host-side comparison is by revision, never by time** — `updatedAt` is **not** a concurrency token
   (two same-millisecond writes exist in the journaled store); a comparison that uses timestamps is
   `FS7`.
3. **Cross-side comparison is by the migration receipt's digest plus the per-document revision**, and is
   **only** performed at K3 and K6 (and at §9.2 item 2). It is **never** performed per read: a per-read
   cross-check would put an engine hop behind a synchronous read, which the read model forbids
   (`docs/specs/design-extensions-review.md` §12.2).
4. **A detected divergence in S1 is not resolved by picking a winner.** Pinned: the divergence is
   **recorded**, the shadow mirror is **stopped**, the state **aborts to `local-authoritative`**, and the
   switch may not be re-attempted until the divergent documents are reconciled **at the local store**
   (the authority of that state) under `U-CORPUS-MIGRATION`'s mechanics. Choosing the engine's revision
   while the local store is still the authority would be the split brain this rule exists to prevent.

### 4.3 The reconciliation rule for a local write during a cutover

**Pinned, and it is a rule about the SEQUENCE, not about conflict resolution:**

1. **A write committed by the local authority before the freeze (K5) is authoritative** and is the
   value the shadow replica must carry. If the mirror has not applied it at the moment of the flip, the
   flip **waits** for the mirror to drain — the flip is **not** allowed to proceed over an in-flight
   mirror (`FS3`).
2. **A write that arrives while the flip is in progress** is **routed by the pre-flip routing** until
   the flip atomically completes (K5's atomicity), so it can never be observed by both sides.
3. **A write that arrives after the freeze** in S2 targets the engine; if it reaches the local store it
   is **refused** with the typed vocabulary of §8.2 and is a **fence violation** (`FS16` — the sunset of
   §3.1 has fired).
4. **Uncommitted edits are never the switch's business.** The dirty machine is per-tab and
   cache-side (`docs/specs/design-extensions-review.md` §12.4); the cutover requires the **absence of
   `uncommitted` / `commit-failed` tabs** as a pre-step of K5 (`FS12`: a flip over a dirty tab). The
   flip **does not** commit for the user and **does not** discard for the user.
5. **A `closing-dirty` tab at the flip is a refusal, not a deferral** — the read model's deferred release
   (§12.3 item 3) resolves *before* the flip, because after the flip there is no local write left to
   resolve it against (`FS12`).

### 4.4 The `edit.set_content`-becomes-an-alias clause is NOT authored here

`RAG-EDIT-MCP-GROUPS` and `GNOSIS-CRUD-EDIT-GROUP` **both stay ACTIVE**, and `edit.set_content`'s
becoming an alias is *"explicitly not implied by `GN-1`"* (`docs/specs/design-extensions-review.md`
§11.1 item 2) — it owes an amendment to `RAG-EDIT-MCP-GROUPS` + `MCP-UI-EQUIVALENCE`. **This unit
therefore pins the routing COLUMN for `edit.*` tools (where a call goes) and explicitly does NOT pin a
tool-name alias, a group merge or a schema change.** A unit that wants the alias is a separate unit with
its own amendment; `FS17` catches a routing table that silently drops an `edit.*` tool instead.

---

## 5. THE READ/WRITE ROUTING TABLE (total — every tool, every state)

### 5.1 The totality rule (pinned)

**A single resolver is the only routing authority.** Pinned signature (the TestWriter's red set targets
it; the name is the contract):

```
resolveDocumentRoute(
  tool: DocumentToolName,          // the closed union of §5.2's registered names
  state: AuthorityState,           // 'local-authoritative' | 'dual' | 'engine-authoritative' | 'engine-authoritative-offline'
): DocumentRoute
```

`DocumentRoute` is a discriminated union with exactly these members, and they are the **only** legal
cells:

| Route | Meaning |
| --- | --- |
| `{kind:'host-store', store:'addressed'\|'default'}` | the local store of the resolved directory entry (or the default) serves the call |
| `{kind:'engine', target:'crud'\|'rag'}` | the engine proxy serves the call (`crud` = the 11-method `EngineCrudRagStore`, `rag` = the `EngineRagStore` retrieval proxy) |
| `{kind:'cache', store:'addressed'\|'default'}` | the tab-scoped read cache serves the read (§12.2) — **legality requires the document be resident** |
| `{kind:'unavailable', reason: UnavailableReason}` | a **typed** refusal; never a silent empty result |
| `{kind:'deferred', owner:'<unit>'}` | the call is a named other unit's contract (e.g. the async commit is `C9` `U-EDIT-1`'s) |

`UnavailableReason` is pinned as the closed set: `'engine-absent'`, `'engine-unreachable'`,
`'not-resident'`, `'load-failed'`, `'no-wiki-open'`, `'conflict'`, `'local-store-frozen'`.

**Totality.** For **every** `(tool, state)` pair the resolver returns **exactly one** route, and the
pair-set is **closed** — `FS17` is any undefined cell, any cell returning `undefined`/`null`, and any
tool registered but absent from the union. **Totality is the register row `P-AS-5`.** A cell is
**never** empty: an unusable path is `unavailable`/`deferred` with a named reason, which is a route, not
a hole.

### 5.2 The tool set (closed, and how it was derived)

The union `DocumentToolName` is the **31** registered MCP tools of the four document-handling groups
(§2.2's census; `security.ts` `TOOL_GROUPS` + `VALID_GROUPS` is the group authority; the names are the
registrations in `src/main/mcp-server.ts`: `handleRagTool` for `rag.*`/`rag-stream`/`get_query_audit_log`,
`handleEditTool` for `edit.*`, `handleGnosisTool` for `gnosis.*`). **No `provident.*` tool is in the
union** — the provident surface is the live graph and is untouched by the switch (§7 item 1).

Runtime marker accessor (pinned name): **`authoritySwitchState(): AuthorityState`** — a read-only
projection of the §3.3 record. It is the resolver's only state input; a resolver reading engine
reachability directly is `FS13`.

### 5.3 The table (per tool; the four state columns are the entire contract)

Legend: **H** = `host-store`, **E-c** = `engine`/`crud`, **E-r** = `engine`/`rag`, **K** = `cache`,
**U(x)** = `unavailable` with reason `x`, **D(u)** = `deferred`, owner `u`.

| # | Tool | Group | `local-authoritative` | `dual` | `engine-authoritative` | `engine-authoritative-offline` |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `rag.query` | rag | **H** (addressed) | **H** (addressed) | **E-r** | **U(engine-unreachable)** |
| 2 | `rag.get_document` | rag | **H** (addressed) | **H** (addressed) | **K** if resident, else **U(not-resident)** | **K** if resident, else **U(engine-unreachable)** |
| 3 | `rag.list_nodes` | rag | **H** (addressed) | **H** (addressed) | **K** if resident, else **U(not-resident)** | **K** if resident, else **U(engine-unreachable)** |
| 4 | `rag.get_edges` | rag | **H** (addressed) | **H** (addressed) | **K** if resident, else **U(not-resident)** | **K** if resident, else **U(engine-unreachable)** |
| 5 | `rag.backlinks` | rag | **H** (addressed) | **H** (addressed) | **K** (pane-class) if resident, else **U(not-resident)** | **K** if resident, else **U(engine-unreachable)** |
| 6 | `rag.list_documents` | rag | **H** (addressed) | **H** (addressed) | **K** (pane-class doc-heads) if populated, else **U(not-resident)** | **K** if populated, else **U(engine-unreachable)** |
| 7 | `rag-stream` | rag | **H** (addressed) | **H** (addressed) | **E-r** | **U(engine-unreachable)** |
| 8 | `get_query_audit_log` | rag | **H** (host audit log) | **H** | **H** — the audit log is **host-owned** (§7 item 4) | **H** |
| 9 | `edit.set_content` | edit | **H** (addressed) | **H** (addressed) | **D(U-EDIT-1)** commit path; the write lands **E-c** through it | **U(local-store-frozen)** |
| 10 | `edit.create_node` | edit | **H** (addressed) | **H** (addressed) | **D(U-EDIT-1)** / **E-c** | **U(local-store-frozen)** |
| 11 | `edit.delete_node` | edit | **H** (addressed) | **H** (addressed) | **D(U-EDIT-1)** / **E-c** | **U(local-store-frozen)** |
| 12 | `edit.split_node` | edit | **H** (addressed) | **H** (addressed) | **D(U-EDIT-1)** / **E-c** | **U(local-store-frozen)** |
| 13 | `edit.merge_node` | edit | **H** (addressed) | **H** (addressed) | **D(U-EDIT-1)** / **E-c** | **U(local-store-frozen)** |
| 14 | `edit.set_edge` | edit | **H** (addressed) | **H** (addressed) | **D(U-EDIT-1)** / **E-c** | **U(local-store-frozen)** |
| 15 | `edit.set_doc_meta` | edit | **H** (addressed) | **H** (addressed) | **E-c** (tags are document metadata on the engine document) | **U(local-store-frozen)** |
| 16 | `edit.import_markdown` | edit | **H** (addressed; the importer's corpus root per store) | **H** — and **refused into a cut-over store** (`FS11`) | **D(O-7)** — the engine's bulk-ingest route is the parked O-7 leg, so no ingest path exists under an engine authority yet; absent that route the cell is **U(no-wiki-open)** | **U(engine-unreachable)** |
| 17 | `gnosis.query` | gnosis | **E-r** (the proxy is present or the tool is unavailable) | **E-r** | **E-r** | **U(engine-unreachable)** |
| 18 | `gnosis.stream` | gnosis | **E-r** | **E-r** | **E-r** | **U(engine-unreachable)** |
| 19 | `gnosis.status` | gnosis | **E-r** (health) | **E-r** | **E-r** | **E-r** (health is the probe that detects S3; it never becomes unavailable) |
| 20 | `gnosis.document.get` | gnosis | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 21 | `gnosis.document.list` | gnosis | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 22 | `gnosis.wiki.get` | gnosis | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 23 | `gnosis.wiki.list` | gnosis | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 24 | `gnosis.document.create` | gnosis-edit | **E-c** (and it is the **only** document-create path the engine authorizes; in S0/S1 it is a *separate* corpus, see the rule below) | **E-c** | **E-c** | **U(engine-unreachable)** |
| 25 | `gnosis.document.update` | gnosis-edit | **E-c** (`baseRevision`; 409 on stale) | **E-c** | **E-c** | **U(engine-unreachable)** |
| 26 | `gnosis.document.delete` | gnosis-edit | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 27 | `gnosis.document.publish` | gnosis-edit | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 28 | `gnosis.document.unpublish` | gnosis-edit | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 29 | `gnosis.document.archive` | gnosis-edit | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 30 | `gnosis.wiki.create` | gnosis-edit | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |

**Row 31 (the count anchor):** the union also carries the **`edit.batch` IPC-only transaction
primitive** (there is no `edit.batch` MCP tool registration; the batch reaches the store through
`IPC_EDIT_BATCH` and `handleEditBatch`, and through `IPC_EDIT_BATCH`'s `ipcMain.handle` body in
`src/main/main.ts`). Pinned route: **H** in S0/S1, **D(U-EDIT-1)** in S2 (the async commit's batch
atomicity is that unit's restatement), **U(local-store-frozen)** in S3. **The union is 31 tools,
30 of them registered MCP tools + this IPC primitive.** A count that does not equal 31 is `FS17`.

**Rules that make the table a contract rather than a sketch.**

1. **S0/S1 are read-identical and write-identical for `rag.*`/`edit.*`.** The switch changes **nothing**
   for the local route before K5 — that is the whole content of the temporary authority.
2. **S1 differs from S0 in exactly one observable way**: the shadow replica (§4.1) exists and the
   census/divergence checks of K3 run. A behavioral difference visible to an MCP caller in S1 is
   `FS13`.
3. **`gnosis.document.*` writes in S0/S1 target the ENGINE's corpus, which is NOT yet the operator's
   wiki.** Pinned: they are legal (the tools are registered and gated), and they are **not** the
   operator corpus — they may not be used as a bypass to "pre-migrate" (`FS11`). **The one exception is
   the migration itself**, which is `U-CORPUS-MIGRATION`'s and is not an MCP tool.
4. **Engine-absent at boot is `GN-4`'s refusal (§8 states 1–3); engine-absent mid-session is S3.**
   In **S0/S1** an absent/unreachable engine changes nothing (§7 item 7's `ENGINE-ABSENT-DEGRADED-CONTRACT`
   reversal is **scoped to opening a wiki**, and the record retains what the reversal does **not**
   authorize: *"the gap is not a licence"*, §14.5 item 4).
5. **Every `unavailable` route is typed** — the refusal names the reason **and** the document/store id
   where one applies, and **never** renders as an empty result, an empty stage, or a `null` snapshot
   (`docs/specs/design-extensions-review.md` §12.2 item 3, §12.5 item 2 — those outcomes are fail-states
   there and are `FS9` here).
6. **`get_query_audit_log` never moves** (§7 item 4). A routing table that routes it engine-side is
   `FS14`.
7. **The table is data, not code-with-ifs.** It is a total map keyed `(tool, state)`; a fallback
   `default:` branch that returns a route not present in the table is `FS17` (it makes the table
   untestable and hides an undefined cell).
8. **A `deferred` cell is a route with a named owner, not a hole.** `D(U-EDIT-1)` (the commit-path
   restatement) and `D(O-7)` (the engine's bulk-ingest route, `IPC_IMPORT_RESULT`'s counterpart) each
   name the unit/leg that must land before the cell becomes a live route; until then the cell's
   behavior is its stated alternative (a typed `unavailable`), and the deferral **never** becomes a
   local write in S2/S3.

### 5.4 The renderer IPC routing table (every channel, every state)

The renderer reaches the same authorities through `src/main/preload.ts`'s `bridge` and the
`ipcMain.handle` bodies in `src/main/main.ts`. **MCP/UI equivalence is preserved by routing, not by
duplicating logic** (`MCP-UI-EQUIVALENCE`; the read model's §14.4 note that the pane-data class is
*"enumerable, not invented"*).

| # | Channel (`src/shared/types.ts`) | Bridge method (`src/main/preload.ts`) | `local-authoritative` | `dual` | `engine-authoritative` | `engine-authoritative-offline` |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `IPC_EDIT_COMMIT` | `bridge.edit.commit` | **H** — `runtime.getDefaultStore()` + `handleEditCommit` | **H** | **D(U-EDIT-1)** (the commit contract's owner) | **U(local-store-frozen)** |
| 2 | `IPC_EDIT_BATCH` | `bridge.edit.batch` | **H** — `handleEditBatch` | **H** | **D(U-EDIT-1)** | **U(local-store-frozen)** |
| 3 | `IPC_EDIT_RICH_COMMIT` | `bridge.edit.commitRich` | **H** — `handleRichCommitIpc` | **H** | **D(U-EDIT-1)** | **U(local-store-frozen)** |
| 4 | `IPC_RAG_STORE_CHANGED` (main→renderer broadcast) | `bridge.edit.onRagStoreChanged` | **H** — broadcast with `store: runtime.getDefaultName()` | **H** | **engine-originated**: the change notification is **GR-5**'s route (upstream-owed; `DN-1`'s blocker) | **none** (no write, so no change event) |
| 5 | `IPC_RAG_SNAPSHOT` | `bridge.rag.snapshot` | **H** — the snapshot pull, **default-store-bound** (`RagSnapshotPayload.store`) | **H** | **K** — the per-tab load built from `computeDocumentSubgraph`; the whole-store snapshot is **not** a resident structure (§12.1) | **K** for resident tabs, else **U(engine-unreachable)** |
| 6 | `IPC_RAG_QUERY` | `bridge.rag.query` | **H** (`handleRagQueryIpc` → the maintained engine) | **H** | **E-r** | **U(engine-unreachable)** |
| 7 | `IPC_RAG_BACKLINKS` | `bridge.rag.backlinks` | **H** (`enumerateLinks`) | **H** | **K** if resident, else **U(not-resident)** | **U(engine-unreachable)** |
| 8 | `IPC_RAG_DOC_HEADS` | `bridge.rag.docHeads` | **H** | **H** | **K** (pane-class) | **K** if populated, else **U(engine-unreachable)** |
| 9 | `IPC_RAG_JOURNAL` / `IPC_RAG_JOURNAL_OP` | the journal bridge | **H** — the project journal (`C16-CONSUMES-PROJECT-JOURNAL`) | **H** | **U(no-wiki-open)** — the project journal's fate under an engine authority is **`C9` `U-EDIT-1`'s** restatement (`D(U-EDIT-1)` where the journal survives) | **U(local-store-frozen)** |
| 10 | `IPC_RAG_STORE_LISTING` | `bridge.rag.stores` | **H** (**manual-UI only**; never an MCP tool) | **H** | **H** | **H** |
| 11 | `IPC_RAG_STORE_MANAGE` | the registry-management bridge | **H** | **H** — **refused while any addressed store is cut over** (`FS11`) | **H** for the registry; **refused** for a cut-over store | **H** for the registry |
| 12 | `IPC_GNOSIS_STATUS` / `IPC_GNOSIS_QUERY` | `bridge.gnosis.status` / `.query` | **E-r** | **E-r** | **E-r** | `status` **E-r**; `query` **U(engine-unreachable)** |
| 13 | `IPC_GNOSIS_DOCUMENTS` / `IPC_GNOSIS_WIKIS` | `bridge.gnosis.documents` / `.wikis` | **E-c** | **E-c** | **E-c** | **U(engine-unreachable)** |
| 14 | `IPC_OPERATOR_SETTINGS_GET` / `IPC_OPERATOR_SETTINGS_SET` / `IPC_OPERATOR_SETTINGS_CHANGED` | `bridge.operatorSettings` | **H** | **H** | **H** | **H** |
| 15 | `IPC_SECURITY_GET` / `IPC_SECURITY_SET` | `bridge.security` | **H** | **H** | **H** | **H** |
| 16 | `IPC_TEMPLATE_GET` / `IPC_TEMPLATE_VALIDATE` / `IPC_TEMPLATE_SET` / `IPC_TEMPLATE_CREATE` / `IPC_TEMPLATE_DELETE` / `IPC_TEMPLATE_RESET` / `IPC_TEMPLATE_CHANGED` | the template bridge | **H** | **H** | **H** | **H** |
| 17 | `IPC_IMPORT_RESULT` (main→renderer broadcast) | the import bridge | **H** | **H** | **D(O-7)** — the engine's bulk-ingest progress contract is the parked O-7 leg | **U(engine-unreachable)** |
| 18 | `IPC_PANE_CATALOG` / `IPC_PANE_VISIBILITY` | the pane bridges | **H** | **H** | **H** | **H** |
| 19 | `IPC_MODULE_*` / `IPC_INVOKE` / `IPC_REPLY` / `IPC_READY` / `IPC_NOTIFY` | the shell bridges | **H** | **H** | **H** | **H** |

**Rules.**
1. **Channels 14–16 and 18–19 never move in any state** (§7 items 2–6). Their row is `H` for the
   contract's lifetime; a state-dependent value there is `FS14`.
2. **The renderer's store addressing is the DEFAULT store today** — the three edit IPCs call
   `runtime.getDefaultStore()` and stamp `runtime.getDefaultName()` (verified). **The switch does not
   add renderer-side store selection**; the per-store mapping (§4.1) applies to the **addressed** default.
3. **No channel may be served by two authorities in one state** (the same one-writer rule as §4.1,
   `FS3`).
4. **A channel missing from this table** is `FS17` — the table's totality covers the IPC surface as
   well as the MCP surface.

---

## 6. THE CORPUS-MIGRATION INTERFACE (the boundary against `U-CORPUS-MIGRATION`)

**The sibling unit `U-CORPUS-MIGRATION` owns the MECHANICS of moving the operator corpus into the
engine.** This unit owns the **authority** question and therefore **reads** the migration's outcome and
**never performs** it. The record assigns the mechanics *and* the rollback story to that unit: *"`GN-1`'s
'persist' means documents … any future cutover owes the **named migration unit** with a rollback story"*
(`docs/specs/design-extensions-review.md` §3.1's named rulings, §3.2 B.4) and its P2 row pins that unit's
own gates (journal/undo, the corpus census, a **verifiable restore**, a **live battery** and a **rollback
red set**, §13.3).

### 6.1 What this unit REQUIRES of `U-CORPUS-MIGRATION` (the whole dependency, in five items)

| Id | Requirement | Why this unit cannot supply it |
| --- | --- | --- |
| **M1** | **a completed migration** — every document of the operator corpus is present engine-side, **nothing partially migrated** | the mechanics (parse → map → ingest) are that unit's; a partially migrated corpus is exactly what would make the switch lossy (`FS2`) |
| **M2** | **a rollback point** — a preserved, re-openable, digest-stamped pre-migration copy of the local corpus | this unit freezes and preserves the local store (§3.4's never-delete pin) but it does not **create** the point or its digest |
| **M3** | **a verification the switch READS** — a `MigrationReceipt` (§6.2) carrying the census, the digests, the revision markers and the receipt's own identity | §3.2's C3/C7 and §9.1's V2/V3/V4 must consume **evidence**, never an assertion |
| **M4** | **the migration lands through the SAME `applyBatch` path** the fence exercises, so `tests/import-render-no-duplicates.test.ts` is the migration's **accept criterion, not its casualty** | the fence's re-plan pins precisely that (`docs/specs/design-extensions-review.md` §14.2, first row) — and **no `GN-*` unit may re-derive the fence** |
| **M5** | **the corpus is not re-seeded and its census is not "fixed" to match** — `O0_OPERATOR_DOCUMENTS = 226` | `docs/specs/design-extensions-review.md` §3.6 F.3 item 9; a migration that changes the document count is `FS2` |

### 6.2 The `MigrationReceipt` (the interface type; pinned so an oracle can read it)

```
MigrationReceipt = {
  id: string                        // the receipt's identity
  status: 'complete' | 'partial' | 'failed'
  startedAt: string; completedAt: string
  sourceStore: string               // the registry name(s) migrated (the per-store mapping, §4.1)
  targetWiki: string                // the engine-side identity the source mapped to
  census:  { documents: number; nodes: number; edges: number }      // migrated
  expected:{ documents: number; nodes: number; edges: number }      // the pre-migration local census
  digest:  { corpus: string; perDocument: Array<{ documentId: string; digest: string }> }
  revisions: Array<{ documentId: string; revision: number }>        // the engine's base revisions
  unmigrated: string[]              // document ids NOT migrated (must be empty at 'complete')
  rollbackPoint: { path: string; digest: string; census: {...} }    // M2
}
```

**Pinned rules.**
1. **`status: 'complete'` requires `unmigrated` empty and `census` equal to `expected`** — anything
   else is `FS2`, whatever the migration reports.
2. **The receipt is the ONLY migration evidence the switch reads.** A switch that proceeds on *"the
   migration ran"* without a receipt is `FS2`.
3. **`rollbackPoint` is re-opened and counted at K0 (V4) and again at R1** — a receipt whose point does
   not verify is `FS4`.
4. **The receipt is `U-CORPUS-MIGRATION`'s artifact, cited never edited by this unit.**

### 6.3 What THIS unit must NOT do (the boundary, in the negative)

1. **It does not migrate, parse, ingest, map or re-index anything.** No engine-side write of document
   content happens under this unit except the §4.1 **shadow replica** of an already-committed local
   write — which is a replica of existing data, not a migration.
2. **It does not create, re-derive or repair the rollback point**, and it does not delete or truncate
   the local store. (It **freezes** it, §3.4.)
3. **It does not author the engine-side route.** `U-ENGINE-PERSIST` is the O-7 leg and is a **handoff**
   to `../Gnosis` (`AGENTS.md` item 7): bulk parse, batch-atomic ingest, progress/cancel/512-cap
   contract, the node-model mapping and durability are the engine repo's. A shell-side attempt to stand
   one up is a **new proposal**, not this unit's footnote.
4. **It does not re-plan or re-derive the fence** (M4; §2.3).
5. **It does not schedule, sequence or status-flip `U-CORPUS-MIGRATION`.** That unit's own DONE row,
   its own red set and its own live battery are its own (RCA-2).
6. **It does not treat the migration as an authority move.** A completed migration lands the state in
   **`dual`**, never in `engine-authoritative` (the replica is not an authority, §3.1; `FS2` on a
   direct S0 → S2 transition).

---

## 7. THE SURFACES THAT MUST NOT MOVE (each with its rule and its reason)

**The governing principle, stated once:** the ruling moves **document authority**, and `GN-1`'s
*"Astrographer persists no documents"* is read as **documents** — **never** as these stores
(`docs/specs/design-extensions-review.md` §3.2 B.4, §11.1 item 4). Each row below is therefore **not** a
casualty of the switch; it is an explicit exclusion the switch must preserve, and `FS14` is the check.

| # | Surface | Rule (exactly, in every state) | Reason it stays in place |
| --- | --- | --- | --- |
| **1** | **The MCP server itself** — transport, registration, gating, tool names/schemas (`src/main/mcp-server.ts`; the contract `docs/specs/mcp-endpoint.md`) | **The MCP server stays HOST-OWNED.** No tool is added, renamed, re-schema'd, regrouped or re-transported by this unit. The switch changes **where a tool's call goes**, never **what the tool is** (§5's resolver is the only change). | `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`'s MCP-server clause (the scope-realignment record §3.3's MCP-server row: *"STAYS HOST-OWNED"*), `AGENTS.md`'s shell carve-out naming the MCP server, and `docs/specs/mcp-endpoint.md` being **excluded by name** from `GN-2` (§11.4's exclusion table). |
| **2** | **The security group gate** — `SecurityGate`, `groupForTool`, `toolAllowed`, `authorized`, `applyPatch`, `defaultSecurityConfig`, `ToolGroup` (`src/main/security.ts`), and the persisted **`security-store`** (`src/main/security-store.ts`) | **Unchanged and host-owned in every state.** The switch adds **no group**, changes **no default**, and lets **no MCP tool** reach the gate's configuration (the manual-UI-only rule, `docs/specs/mcp-endpoint.md` §6.4). | The authority seam is the trust boundary: a prune read of it *"would delete the rationale for a trust boundary"* (§11.4). `GN-1`'s no-documents clause does not reach it (§11.1 item 4). |
| **3** | **The authority store** — `AuthorityStore`, `callerCredential`, `editors`, `createAuthorityStore` (`src/main/authority-store.ts`) | **Host-owned.** The engine's RBAC **consumes** a credential *derived from* this store (the `callerId` arg is identity, never a credential — the A2 registration text), so the derivation stays here and the store is never migrated, never replicated engine-side and never written by an engine-authoritative route. | Same seam row (§11.4's `GNOSIS-SECURITY-CARVE-OUT`), and the A2 note that the credential *"is derived from the AuthorityStore"* — a host-side derivation, not an engine-side one. |
| **4** | **The idempotency registry + the query audit** — `IdempotencyRegistry` (`get`/`set`/`createIdempotencyRegistry`) and `QueryAuditLog` (`record`/`list`/`clear`/`createQueryAuditLog`) | **Host-owned in every state.** `get_query_audit_log` is **H**-routed in all four states (§5.3 row 8); the idempotency key (`requestId` on the two create tools) remains a **host** registry even though the request goes engine-side. | §11.1 item 4's host-side store list; and the audit is a **host** accountability surface whose relocation would be an unrecorded authority move. |
| **5** | **The operator settings / template stores** — `OperatorSettingsStore` (`get`/`set`/`createOperatorSettingsStore`), `OperatorSettingsPatch`, the template store behind `IPC_TEMPLATE_*` | **Host-owned and always available**, **including when no engine exists** (§11.3's *"What it does NOT decide"* item 2: the operator surfaces are `UI-CONFIG-CARRIER` state and are not documents). The read model's `"persists"` semantics put tabs/targets/order here (`docs/specs/design-extensions-review.md` §12.6). | The ruling addresses **opening a wiki**, not the operator surfaces; and `UI-CONFIG-CARRIER` is the carrier the switch's own tab restoration reads. |
| **6** | **The vector cache** — `provident-vector-cache.json` (the vector boot/cache path in `src/main/vector-boot.ts` / `src/main/embeddings.ts`) | **Host-owned and untouched.** It is **not** in the read model's cache set (`docs/specs/design-extensions-review.md` §12.1: *"the vector cache … a separate host-owned store"*) and the switch does not move it. | Named in §11.1 item 4's host-side list; and the read model explicitly enumerates it as *not* part of the tab cache — so a unit that folds it into the cache would be creating a new cache class silently. |
| **7** | **The multi-store registry** — `src/main/rag-store-registry.ts` (`loadRagStoreRegistry`, `resolveRegistry`, `implicitRegistry`, `RAG_STORE_NAME_PATTERN`), `src/main/rag-store-registry-write.ts` (`writeRegistryMutation`, `RegistryMutation`), `src/main/rag-store-runtime.ts` (`createRagStoreRuntimeController` + `RagStoreRuntimeController`'s `hotApply`/`hotRemove`/`hotRename`/`hotSetDefault`/`hotRenameDefault`), `src/main/rag-store-directory.ts` (`buildRagStoreDirectory`, `resolveStoreArg`) | **Host-owned file, host-owned controllers, host-owned resolution.** The switch **consumes** the registry (the per-store mapping of §4.1) and **writes nothing** into it. A registry mutation on a **cut-over** store is **refused** while the engine is the authority (`FS11`); the file, its validation messages and its hot-apply contracts are otherwise unchanged. | `MULTI-STORE-REGISTRY` + the *"the multi-store registry stays ACTIVE"* pin (`docs/specs/design-extensions-review.md` §3.1's named rulings) and that record's §11.1 item 4, which lists the registry among the **NOT superseded and NOT prunable** rows (`FANOUT-INTERLEAVE-MERGE`, catalog `PRUNE-835`). |

**The engine-absent rule that survives the `GN-4` reversal (pinned, because it is easy to over-read).**
`GN-4` **reverses** `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`'s identity clause and **amends**
`DECIDED: GNOSIS-LAUNCHER-TOGGLE` (§11.3). What the reversal does **not** do:

1. it does **not** make the local paths *depend* on engine presence outside the document surfaces —
   **the local store boot, the operator stores, the security store, the vector cache and the registry
   all still work with no engine** (§7 rows 2–7 above);
2. it does **not** license a new local-authoritative feature: *"the gap is not a licence"*
   (§14.5 item 4);
3. it does **not** change the launcher's spawn ownership: **the launcher spawns; `src/` gains no exec
   capability** (§11.2; a shell-side spawn is a **new security seam and its own gated proposal**);
4. it retains the **typed** failure vocabulary: a warning that names the missing engine is a **typed**
   failure, never a silent empty stage (§11.3's closing consequence, §12.5 item 3).

---

## 8. OFFLINE / ENGINE-LOSS DURING A SESSION

### 8.1 The states a user can observe (the closed set; this is the UI-facing vocabulary)

| # | Surface state | When | What the user sees | What is functional |
| --- | --- | --- | --- | --- |
| 1 | **`engine-missing`** | boot/launcher reports no engine (the health poll fails / the launcher failed loud) | the app warns and **does not open a wiki** (`GN-4`) | the operator surfaces (§7 rows 2–7): settings, security, templates, the registry listing |
| 2 | **`wiki-refused`** | a wiki/tab open is attempted in `engine-missing` | a **typed** refusal naming the missing engine — the `EngineUnavailable` class of `src/main/engine-rag-store.ts` | as above |
| 3 | **`wiki-unavailable`** | a tab-open fetch fails for any other reason (engine returns a non-Ready state, a 5xx, a transport failure) | the **tab warning class** (`TAB-1`) + the typed detail (`docs/specs/design-extensions-review.md` §12.5 items 1–3) | resident tabs; the operator surfaces |
| 4 | **`engine-lost`** | the engine **dies mid-session** (S3 entered) | the warning surface + tabs remain readable **read-only**; every write attempt is refused with `U(engine-unreachable)` | resident reads only; the operator surfaces |
| 5 | **`engine-restoring`** | the bounded retry is in flight (§8.3) | a **pending**, typed state — **never a spinner that never resolves** (§12.5 item 2's enumerated forbidden outcome) | resident reads only |
| 6 | **`engine-restored`** | `waitForReady()` resolved and the resident cache is re-verified (§8.4) | normal operation resumes | everything |
| 7 | **`cutover-frozen`** | `dual` (pre-flip) or the rollback window | unchanged from S0 except the replica; no user-visible difference is permitted (§5.3 rule 2) | everything the local authority offers |
| 8 | **`switch-refused`** | a switch attempt failed a condition (§3.2) | the **named** condition, the readings checked, and the state is **unchanged** | everything the current state offers |
| 9 | **`local-frozen`** | `engine-authoritative` with the local store frozen | the local store is **not** presented as a document source anywhere | the engine route |

**Rule.** Each state is **observable and distinguishable**, and the four forbidden outcomes of
`docs/specs/design-extensions-review.md` §12.5 item 2 are **fail-states here too** (`FS9`): an empty
stage that looks like a document with no content; a `null` snapshot rendering the empty-state guard's
"(no documents)"; a swallowed rejection; a spinner that never resolves.

### 8.2 Mid-session engine death — the pinned behavior (the `GN-4` gap this unit must close)

`GN-4` decides the **boot/opening** case only, and the read model leaves the **boot-wide framing** to
this spec (`docs/specs/design-extensions-review.md` §11.3's *"What it does NOT decide"* item 1: *"the
read model pins the per-wiki/tab-open surfacing as the load-bearing case and leaves the boot-wide
framing to `U-AUTHORITY-SWITCH`'s spec"*). Pinned:

1. **The app does NOT freeze and does NOT exit.** The window stays live; the refusal is **per wiki/tab
   surfaces**, and the surfaces of §7 rows 2–7 stay usable. A whole-app freeze is `FS8`.
2. **The transition to S3 is prompt and observable.** The first failed engine call (any proxy call —
   the CRUD proxy's own READY observation gate, `getEngineStatus()` per call, the CRUD registration
   notes, plus `EngineUnavailable` on any transport failure) moves the state to
   `engine-authoritative-offline` and writes the §3.3 record's `state` accordingly (`FS5` if the state
   changes without the record).
3. **Reads: the resident cache serves them; nothing else does.** A read for a **resident** document
   returns normally **and is served from the cache, never from the local store** (the read model's
   §12.2 item 2 — *"it never triggers a silent local read of the persisted local store as a fallback"*).
   A read for a non-resident document is `U(engine-unreachable)` (or `U(not-resident)` if no fetch was
   ever attempted) — **never** an empty result.
4. **Writes: refused, with the typed vocabulary, always.** No write is redirected to the frozen local
   store, and no write is queued for later unless §8.3's bounded retry is explicitly in flight. **The
   local store is never re-promoted by an offline event** — that would be an automatic authority move,
   which is `FS13`.
5. **Uncommitted edits are preserved, never lost and never silently discarded.** A tab in
   `uncommitted` at the moment of death stays `uncommitted` (the read model's dirty machine, §12.4);
   the entry stays **resident** (it is the only copy of the user's text) and the eviction deferral of
   §12.3 item 3 applies. The user resolves it with **retry** or **discard**, exactly as
   `resolve-or-discard` pins; a silent discard or an eviction of a dirty entry is `FS8`.
6. **A commit that was IN FLIGHT when the engine died is atomic and reports honestly.** The commit goes
   engine-side; a transport failure means the write **did not land** (or landed and is unacknowledged —
   which is why §8.3's single retry must be **idempotent**). Pinned: the surface reports
   `commit-failed` + the typed reason; the tab shows the warning symbol; **the store is not claimed to
   have changed**. Optimistic-concurrency honesty (the engine's `baseRevision` + 409) is the mechanism
   that makes the unacknowledged case detectable: a retry carrying a stale `baseRevision` surfaces
   `ConflictError`, which is `U(conflict)` — **never** a silent overwrite.
7. **The local store is not consulted, not re-opened for writes, and not deleted.** It stays the frozen
   rollback point (§4 of §3.4's pinned properties).
8. **Tabs are not lost.** Open tabs / targets / order stay in `OperatorSettings` (§12.6) — the layout
   survives the outage even though the documents are unreachable.

### 8.3 The retry policy (bounded, named, and never a second authority)

1. **The engine's own probe is the mechanism**: `EngineRagStore.waitForReady()` (+ `health()` /
  `getEngineStatus()`) exists in `src/main/engine-rag-store.ts`; the **launcher** already health-polls
  (`GNOSIS-LAUNCHER-TOGGLE`). The shell must not invent a second orchestration path (§11.2's
  *"the shell remains a pure client"*).
2. **The shell's retry is bounded and backoff'd**, and it is a **reconnect**, not a re-authority: it
   may only restore **S2**. The bound is a named constant (the unit pins it in its own implementation;
   the contract pins only that the bound is **finite**, **announced** (state 5 of §8.1) and
   **stoppable**). An unbounded retry loop with no announced state is `FS8`.
3. **The CRUD proxy's `retry` option is the only write retry**, and it is **opt-in**:
   `createEngineCrudRagStore`'s `retry` with `maxRetries` default **0 (= off)**, backoff defaulted, and
   **only** on `createDocument`/`createWiki` (idempotent-by-requestId) — the A1 proxy's recorded
   behavior. **A retry on a non-idempotent mutation is `FS10`.**
4. **No retry may be issued with an unverified `baseRevision`** (§8.2 item 6).
5. **After the retry bound is exhausted**, the state **stays** `engine-authoritative-offline` until the
   engine returns or the operator rolls back (§9.3). It never falls back to a local write.

### 8.4 `engine-restored` — the re-verification (why the cache is not trusted blindly)

On a successful reconnect the transition is **`engine-authoritative-offline` → `engine-authoritative`**
and it is guarded:

1. **Re-verify the resident cache against the engine's revisions** for every resident document. A
   document whose engine revision is newer than the cache's is **re-fetched, not served stale**
   (`FS6`: serving a cache entry that fails verification).
2. **Re-verify the state record** — the `authority-switch` record's `state` is rewritten to
   `engine-authoritative` with the new `since` (§3.3 rule 1: the record is written on every change).
3. **Do NOT re-run the migration** and do **not** re-enter `dual`: the switch already happened. A
   reconnect that routes through `dual` is `FS13`.
4. **A verification failure is `wiki-unavailable`**, not a silent stale render (§12.5).

---

## 9. VERIFICATION OF THE SWITCH

### 9.1 The pre-switch checklist (the readings §3.2's conditions consume)

Each item is a **reading with a named source**, recorded on the switch's own record; **no item may be
asserted from a plan** (§14.2's rule: *"No unit may report the fence green from a plan"*).

| Id | Reading | Source / oracle | Feeds |
| --- | --- | --- | --- |
| **V1** | **the engine's persistence proof** — a corpus written to the engine is present after an engine **restart**, re-verified by census and by an id read back | `U-ENGINE-PERSIST`'s own artifact + the engine's health/CRUD routes; **never** authored or faked here | C2 |
| **V2** | **the corpus census equality** — `documents`, `nodes`, `edges` read from **both** sides and equal: the O-0 corpus claim is **226 documents / 6 102 nodes / 9 266 edges** (`docs/specs/design-extensions-review.md` §14.1 `C-1`; `docs/pending.md` §"PARKED DESTINATION — the engine track", trigger (b)'s input) | a **counted** comparison, per document and in total; **never** an assumed equality | C3, K3, K6 |
| **V3** | **the revision/consistency check** — for a sampled **and** for boundary documents, the engine's `revision` is readable, monotonic per document, and the engine's content digest matches the migrated local content digest | the 11-method proxy + the receipt's per-document digests | C5, C3 |
| **V4** | **the rollback point verifies** — `MigrationReceipt.rollbackPoint` re-opens read-only and census-matches the **pre-migration** corpus (V2's numbers, from the *prior* state) | a real re-open + count; the rollback drill of §9.3 | C7 |
| **V5** | **the cache unit's own red set is green** — residency, the miss policy, the five-state matrix, eviction, the dirty machine, `"persists"` semantics, the boot sequence (`docs/specs/design-extensions-review.md` §12.2/§12.3/§12.4/§12.6) | `U-READS-PIVOT`'s DONE row + its recorded red set | C4 |
| **V6** | **the fence reading** — the trio, **run**, with `tests/import-render-no-duplicates.test.ts` and `tests/traversal.test.ts` green **unchanged** and **not** re-derived | the trio's reading on the landing tree (a **reading**, never a claim; the last recorded one is `221 files / 4 988 passed / 58 skipped / 0 failed`, `docs/specs/design-extensions-review.md` §14.3) | C8 |
| **V7** | **the surfaces census** — §7's seven surfaces re-verified unmodified (the MCP tool/group census unchanged at 31 routed tools + the `provident.*` set; the security group set unchanged; the operator/security/idempotency/audit/vector/registry stores host-owned) | a **census**, counted from the registrations and the module surfaces | C10 |

**V2's identity is a pinned claim, not a re-derivation.** `O0_OPERATOR_DOCUMENTS = 226` **must not be
re-seeded** (`docs/specs/design-extensions-review.md` §3.6 F.3 item 9); a migration that changes the
document count to make the equality hold is `FS2`.

### 9.2 The post-switch checks (after K7; each is a fail-state on failure)

| # | Check | Fail-state |
| --- | --- | --- |
| 1 | the `authority-switch` record reads `engine-authoritative`, `sunsetRecorded: true`, with the receipt and rollback point present | `FS5` |
| 2 | **census equality through the ENGINE** (V2 repeated on the engine side) | `FS2` |
| 3 | **the frozen local digest is unchanged** from the moment of K5 — the local store was not written by the flip | `FS16` |
| 4 | **every `rag.*` read in S2 resolves `K` or a typed `unavailable`** — no cell falls back to the local store | `FS9`, `FS17` |
| 5 | **every document write in S2 goes engine-side exactly once** — one accepted write per commit, no local echo | `FS3` |
| 6 | **the 11-method CRUD proxy round-trips** — a document created, updated (`baseRevision` honored), archived and re-read through `gnosis.document.*` | `FS6` |
| 7 | **a stale `baseRevision` surfaces `ConflictError`** and is reported as `U(conflict)`, never overwritten | `FS7` |
| 8 | **an engine kill mid-session enters S3 with the state record updated**, the resident cache still readable, writes refused, and no local write | `FS13`, `FS8` |
| 9 | **the §7 surfaces are unchanged** (V7 repeated) and every §5.4 channel 14–19 row is still `H` | `FS14` |
| 10 | **the live battery passes** (RCA-11; the two-writer surface is an assembled-app property) | a live failure invalidates the DONE claim (§3.4 K8) |

### 9.3 The rollback procedure (with its OWN red set)

**Rollback is a first-class procedure, not an emergency `git revert`** — the migration moved the corpus,
and the local store is the only pre-migration copy.

**When rollback is mandatory:** K6 fails; a K8 item fails; a divergence is detected in S1; the live
battery fails; or the operator decides during the rollback window.

**The ordered procedure.**

| # | Step | Pinned requirement |
| --- | --- | --- |
| **R0** | **stop the writers** — enter the frozen state and refuse every document write with the typed vocabulary | no write may be accepted while the authority is ambiguous (`FS3`) |
| **R1** | **verify the rollback point** (V4 repeated) | a rollback against an unverified point is `FS4` |
| **R2** | **restore the prior authority's state exactly** — the local store is re-opened as the authority with its **pre-migration** census and content digests; the engine copy is **abandoned** (never written, never used as a merge source) | `FS18`: a rollback that leaves the local store short of its prior state, or leaves any state merged from the engine copy |
| **R3** | **rewrite the `authority-switch` record** to the prior `state` with `sunsetRecorded: false` and the rollback recorded (§3.3 rule 4) | `FS5` |
| **R4** | **re-verify the prior state's red set**: V2 at the pre-migration numbers, V4, V6 (the fence), and a real document open read from the **local** authority | `FS4`, `FS15` |
| **R5** | **state the regime gap in the DONE row** — after a rollback the contract's regime is engine-authoritative while the code is local again: `TEMPORARY-AUTHORITY-1` has been **restored**, and the sunset has **not** fired | a rollback whose DONE row claims the cutover happened is `FS5` |

**The rollback's own red set (pinned — the TestWriter authors these before the procedure is claimed to
work):** (a) restore-from-rollback-point yields the **exact** pre-migration census **and** the exact
per-document digests; (b) the frozen local store has **no** engine-originated write; (c) the state
record after rollback names the prior state and `sunsetRecorded:false`; (d) a rollback that runs after
K7 also re-verifies the fence (V6); (e) a rollback **after** the sunset must be explicitly allowed —
it is the one legal local write authority restoration, and it is legal **only** through R0–R5
(`FS13` otherwise).

---

## 10. §5.x Property register (PBT) — typed, ≤8 rows

Register convention (imported): rows typed **P-AS** (**A**uthority **S**witch) — never F-rows, never
`FS-n`; **≤8 rows, at most 100 attempts/row, the budget stated as Σ(attempts/row)**; **deterministic
pinned seed**; **stop-after-5** (at most 5 distinct counterexamples reported per row, then the row stops).
**Scope note (mandatory):** every row is scoped **PURE** — plain-data state, a plain-data receipt, a
plain-data route table — except `P-AS-7`, whose subject is a **real temp-file store** (still no engine,
no Electron, no DOM). Proposed file:
**`tests/unit-authority-switch-contract.test.ts`**. **Attempt status is filled at green time**
(`held` = zero counterexamples; `broken` = counterexamples recorded); this spec pins the rows, their
generators and their oracles, and records the allocation constants below as a **declared upper bound**.

| Row | T | Pinned invariant | Generator / strategy | Falsifiable oracle | Layer |
| --- | --- | --- | --- | --- | --- |
| `P-AS-1` | AS | **No write is accepted by two authorities in the same state.** For every state and every write-class tool (§5.3 rows 9–16, 24–30 + the `edit.batch` primitive), the resolution is to exactly ONE authority, and the state's writer-set has cardinality ≤ 1 (S0/S1 → the host store; S2 → the engine; S3 → the empty set). | `strat:writer-set` — draw `(tool, state)` over the **full 31 × 4 grid**; plus adversarial draws with a mocked host store and a mocked engine both instrumented with write counters. | the writer-set is computed from `resolveDocumentRoute` and asserted `≤ 1` for every draw; the **control draw** (a deliberately double-routed table) must produce a set of size 2 (proving the oracle discriminates). | pure |
| `P-AS-2` | AS | **A cutover never loses a committed document.** For any generated pre-cutover corpus (documents with revisions, digests and tags), running the K0–K7 sequence over a simulated engine replica yields **census equality** (documents/nodes/edges) and **per-document digest equality**; the count of documents `committed-lost` is 0 for every draw. | `strat:cutover` — draw corpus sizes `{0, 1, 2, 226}` × {empty, nodes-only, nodes+edges} × a mid-`dual` write that must be mirrored before the flip; the 226 draw is the pinned corpus size (a **declared** boundary, not a claim about the operator's own corpus in CI). | census + digest equality after K7; the **control draw** (a flip that skips the mirror drain) must report ≥1 lost document. | pure (simulated replica) |
| `P-AS-3` | AS | **A refused switch changes nothing.** For every draw of a broken condition set (each of C1–C10 individually unmet, plus the all-unmet case), the switch refuses, names **only** the first unmet condition in C1→C10 order, and the state, the receipt, the rollback point and the routing table are **all unchanged** (deep equality before/after). | `strat:refuse` — draw each single-condition failure × a pair-failure set; assert refusal identity as a deep compare of the pre/post world. | deep-equality of the whole world + the named condition equals the first unmet one; the **control draw** (all conditions met) must **proceed** (so the row cannot pass by refusing everything). | pure |
| `P-AS-4` | AS | **A rollback restores the prior authority's exact state.** For any post-K7 world, R0–R5 restore the pre-migration census, the per-document digests, the `authority-switch` record's prior `state` with `sunsetRecorded:false`, and re-verify the rollback point; the frozen local content is byte-identical to the moment of K5. | `strat:rollback` — draw pre-migration corpora × {rollback after K7, rollback after a K6 failure, rollback after a divergence in `dual`}. | exact equality on census + digests + the record; the **control draw** (a rollback from an unverified point) must FAIL the oracle (R1's guard). | pure (real temp file for the frozen digest) |
| `P-AS-5` | AS | **The routing table is TOTAL — every tool resolves in every state.** For the closed 31-tool union × the 4 states, `resolveDocumentRoute` returns exactly one member of the `DocumentRoute` union, `undefined`/`null` never occurs, and no cell is served by a default branch not present in §5.3/§5.4. | `strat:totality` — enumerate the full grid **exhaustively** (a census, not a sample) + a synthetic extra tool name that must be rejected as outside the union + a synthetic state string that must be rejected. | the grid has exactly 31 × 4 populated cells; each value is a legal union member; the synthetic tool/state draws must **throw or be refused**, never silently resolve. | pure |
| `P-AS-6` | AS | **The switch conditions are read, never assumed.** For the §3.2 condition set, the evaluator's verdict equals the AND of the individually-read conditions, and an unavailable reading (a missing evidence artifact, an unreadable receipt, an unreachable health probe) evaluates as **unmet** — never as `true`, never as a `undefined`-is-falsy accident. | `strat:conditions` — draw each condition as {met, unmet, **unreadable**} × the combinations of interest; the unreadable leg is the anti-vacuity leg. | the verdict equals `AND(readings)`; a counterexample prints which condition was assumed; the **control draw** (all met) proceeds. | pure |
| `P-AS-7` | AS | **An unverified switch never touches the store, and a verified one touches it exactly once.** Across the K0–K7 sequence, the **frozen local store** and the **engine replica** are each written only by the steps that own them: a refusal/abort performs **zero** writes on both sides, and the flip performs exactly one freeze write on the local side and zero content writes. | `strat:write-census` — instrument a real temp-file local store (write counter) + a fake engine (call counter) and drive the sequence through {refusal, abort at K2, abort at K3, full success}. | a refusal/abort ⇒ counters `{local:0, engine:0}`; success ⇒ the local freeze is the only local write and the engine receives the mirrored document ops exactly once each; the **control draw** (a per-op re-persist cadence) must trip the counter. | store (real temp file) |
| `P-AS-8` | AS | **The offline path never re-promotes the local store.** For any draw of an engine death (before/after a commit, during a fetch, during the flip), S3 yields **zero** local document writes, every write-class route is a typed `unavailable`, and the re-entry to S2 goes through the **cache re-verification** (§8.4) — never through `dual`. | `strat:offline` — draw the death points × {resident read, non-resident read, commit, tab open} + the reconnect leg. | zero local writes on every S3 draw; every write route is `unavailable` with a §5.1 reason; the reconnect draw performs the re-verify step and **no** `dual` re-entry; the **control draw** (a reconnect that routes through `dual`) must fail. | pure |

**Register count: 8 rows** (`P-AS-1`…`P-AS-8`) — **at the ≤8 cap, no padding.** Allocation (the
TestWriter's; a **declared upper bound**, never a claim that every attempt ran): **50 attempts/row × 8 =
400 attempts**, every row ≤ 100, **stop-after-5** in all rows — i.e. **the total is exactly at the
≤400 house ceiling with zero headroom**, which is why no ninth row is admissible and why the rows must
stop early rather than pad to the ceiling. **The honest no-pad rationale:** `P-AS-1` is the split-brain
property itself; `P-AS-2` is the corpus-loss property (the materialised `K2` risk, §14.1 `C-1`);
`P-AS-3` is the *"nothing happens on a refusal"* property that every gate needs and none of the others
covers; `P-AS-4` is the rollback's exactness (its own §9.3 red set is the unit-level counterpart);
`P-AS-5` is totality (the register's only census row); `P-AS-6` is the anti-vacuity row (an unreadable
condition must not read as met); `P-AS-7` is the write-census row that makes "no write happened"
falsifiable rather than asserted; `P-AS-8` is the offline row that closes the `GN-4` gap this unit
exists to close. Each row carries its own **control draw** so a 0-count cannot pass (`F2`'s discipline).

---

## 11. Fail-states (FS) — the exact observables

Every fail-state is **loud**: it names the state, the condition/route/record it violates, and the rule.
A switch that trips any of these is **not switched**.

| # | Fail-state | Observable + exact rule violated |
| --- | --- | --- |
| **FS1** | **The switch proceeds with an unmet §3.2 condition** | the conditions checked and the first unmet one are named; **§3.2 — all of C1–C10 hold, evaluated in order** |
| **FS2** | **The migration receipt is missing, `status !== 'complete'`, has no rollback point, or the census does not match** — including a migration that *changes* the document count to make the equality hold | the receipt id/digest, the missing field, and both census readings are printed; **§6.1/§6.2 + §9.1 V2/V3; `O0_OPERATOR_DOCUMENTS = 226` must not be re-seeded** |
| **FS3** | **Split brain — two authorities accepted a write in the same state**, or the flip was not atomic (a partial routing flip) | the two accepting components and the write are named; **§4.1's one-writer-per-state rule + §3.4's atomicity pin** |
| **FS4** | **The rollback point does not verify, or a store name maps to two engine identities (or two names to one), or the local store was deleted/overwritten** | the point/store ids and the digests are printed; **§4.1's injective mapping + §3.4's never-delete pin + §9.3 R1/R2** |
| **FS5** | **A state change without a written `authority-switch` record** — or `sunsetRecorded` true while `state` is not `engine-authoritative`, or a record whose `regime` is silent about the gap | the record, the state and the missing/contradictory field are named; **§3.3 rules 1–4 + §14 item 1 (the gap is RECORDED, never hidden; the record's own S1)** |
| **FS6** | **A stale read** — a cache entry served whose revision fails the §8.4 re-verification, or a frozen local read presented as current engine content | the document id, the cache revision and the engine revision are printed; **§8.4 item 1 + read model §12.2** |
| **FS7** | **A conflict resolved by clobbering** — a stale `baseRevision` overwritten, or a revision comparison performed by timestamp | the document id, both revisions and the mechanism used are named; **§4.2 — 409 surfaces as `ConflictError`; `updatedAt` is not a concurrency token** |
| **FS8** | **A silent degrade** — an app freeze/exit on engine loss; a swallowed rejection; a spinner that never resolves; a dirty tab evicted or silently discarded | the surface and the swallowed value are named; **§8.1's forbidden set (read model §12.5 item 2) + §8.2 item 5** |
| **FS9** | **A typed refusal rendered as an empty result** — an empty node list, an empty stage, a `null` snapshot reaching the "(no documents)" guard, or an `unavailable` reason dropped | the route, the reason and the rendering path are printed; **§5.3 rule 5 + read model §12.2 item 3** |
| **FS10** | **A retry on a non-idempotent mutation**, or a reconnecting client continuing the pre-reconnect sequence | the tool/method and the retry count are named; **§8.3 item 3 (the CRUD proxy's opt-in `retry` covers `createDocument`/`createWiki` only; `maxRetries` default 0)** |
| **FS11** | **A corpus-side bypass** — `gnosis.document.*` used to "pre-migrate" outside `U-CORPUS-MIGRATION`; an `edit.import_markdown` into a cut-over store; a `hotRemove`/`hotRename` (or any registry mutation) on a cut-over store under a live engine authority | the tool/store ids and the state are printed; **§5.3 rule 3 + §4.1's registry-identity rule + §7 item 7** |
| **FS12** | **The flip proceeds over a dirty tab** (`uncommitted` or `commit-failed`), or over a `closing-dirty` tab whose deferral has not resolved | the tab id and its dirty state are named; **§4.3 items 4–5 + read model §12.3 item 3/§12.4** |
| **FS13** | **An automatic authority move** — a boot/timer/health-poll advancing the state; an offline event re-promoting the local store; a reconnect routing through `dual`; a resolver reading engine reachability instead of `authoritySwitchState()` | the trigger, the from/to states and the record's absence are printed; **§3.4's never-implicit pin + §3.5's closed transition set + §8.2 item 4 + §8.4 item 3 + §5.2's accessor rule** |
| **FS14** | **A host-owned surface moved** — the MCP server/tool set/schema/group, the security gate + security store, the authority store, the idempotency registry, the query audit, the operator settings/template stores, the vector cache or the multi-store registry written/relocated/re-gated by the switch; `get_query_audit_log` routed engine-side; a state-dependent row on §5.4 channels 14–19 | the surface and the offending write/route are named; **§7 rows 1–7 (each with its reason) + §5.3 rule 6 + §5.4 rule 1** |
| **FS15** | **The fence re-derived** — `tests/import-render-no-duplicates.test.ts` or `tests/traversal.test.ts` edited, or reported green from a plan rather than a run | the file, the edit/absence of a run reading are named; **§14.2's re-plan rule ("No unit may report the fence green from a plan") + §2.3** |
| **FS16** | **A surviving local document write after the sunset** | the writer, the store and the post-sunset state are printed; **§3.1's sunset condition + §4.3 item 3 — it is a fence violation, not a temporary authority** |
| **FS17** | **The routing table is not total** — an undefined `(tool, state)` cell, a value outside the `DocumentRoute` union, a registered tool absent from the union, a §5.4 channel absent from its table, a count ≠ 31, or a default branch serving a route not in the table | the offending cell/tool/channel is named; **§5.1's totality rule + §5.3 row 31 + §5.4 rule 4 (register `P-AS-5`)** |
| **FS18** | **An unrecorded cutover sign-off, or a rollback that does not restore the prior state exactly** (a partial restore, a merge from the abandoned engine copy, or a DONE row claiming the cutover after a rollback) | the sign-off/gap and the failing equality are named; **§3.4 K4 + §9.3 R2/R5 (register `P-AS-3`/`P-AS-4`)** |

**Not a fail-state (legal, and must not be flagged):** a `regime` that differs from `state` (§3.3
rule 3 — that *is* the temporary authority); a refusal (a declined switch is the gate working, not a
defect); an `unavailable` route in S2/S3 (§5.1 — a typed refusal is a route); `D(U-EDIT-1)` cells while
the async-commit restatement is owed (§4.4); the local store present on disk but frozen (§3.4's
never-delete pin); a `gnosis.*` read in S0 (the engine corpus is a separate corpus, `FS11` only covers
using it as a migration bypass).

---

## 12. The unit's process

### 12.1 The cycle (mandatory, per `AGENTS.md` items 3/4/9/10 + RCA-1/RCA-2/RCA-3/RCA-4/RCA-6/RCA-11/RCA-12)

1. **spec** — this file (done).
2. **TestWriter red — RUN and REPORTED** (RCA-1; the delegation gate is `AGENTS.md` item 9: the spec
   exists **and** the red set is reported before any implementation). The red set must include, at
   minimum, the §10 register's rows (all 8) and the §5 totality census.
3. **Implementer green** — least code that makes it green; then the trio (`AGENTS.md` item 4):
   `npm test`, `npm run typecheck`, `npm run build`.
4. **Adversarial reviewer — read-only, MANDATORY** (RCA-3). Its target set is **named**, not generic:
   *the two-writer surface* (both sides instrumented, a write attempted during a flip), *a refusal that
   is silently a partial application*, *an unreadable condition read as met*, *a routing cell that falls
   back to the local store*, *a cache entry served stale after a reconnect*, *a registry mutation on a
   cut-over store*, *a rollback from an unverified point*, and *a malformed `MigrationReceipt`*. Host
   findings are fixed here and regression-tested; **package findings go to `docs/defects.md` +
   `docs/HANDOFF.md`**; **Gnosis-side findings go to the O-7/O-8 handoff rows** — never a patch.
   Findings are recorded in this spec's §12.3.
5. **The live battery — MANDATORY pre-DONE** (RCA-11; `docs/specs/design-extensions-review.md` §13.3
   marks this unit live-battery-mandatory). Run against the app (`scripts/live-drive.mjs` on a usable
   display): the switch refusal with no engine; the wiki-open refusal (`GN-4`); a mid-session engine
   kill; the resident-read-only floor; a refused write; a reconnect; and the two-writer census. **No
   parking language** — only a **structurally non-exercisable** surface may park, with the recorded
   reason. **The §5.U matrix is FULL at 8**: every live assertion enters as a **re-pin of an existing
   row** or an **extended row**; `MATRIX_ROWS` must not change (`docs/specs/design-extensions-review.md`
   §13.3, §7.4).
6. **Blind greens** (RCA-4) by an agent who did not implement, from the docs only.
7. **Item-10d documentation review — MANDATORY, read-only** (RCA-6, item 10d). It reconciles this spec's
   names/signatures/return shapes/throw patterns/census claims/section numbers against the build and the
   trackers, and fixes stale entries **in the same pass**. Record:
   **`archive/reviews/<date>-unit-authority-switch-doc-review.md`** (the exact path form pinned by
   `AGENTS.md` item 10d). It must check, at minimum: the **31-tool count** (§5.2/§5.3), the **`226 /
   6 102 / 9 266`** census claims, the `MigrationReceipt` field names (§6.2), the state names (§3.1),
   the `authority-switch` record fields (§3.3), and every cross-reference to
   `docs/specs/design-extensions-review.md` **§11 / §12 / §13 / §14.5** (the exact §11 title is
   `## 11. USER RULINGS (2026-09-21)`, and the titles are carried beside the numbers); the file was
   amended concurrently in this pass, so the 2026-09-21 item-10d documentation review re-resolved every
   section reference against it as landed.
8. **Trio**, recorded as the unit's green + the fence reading (V6).
9. **The DONE row** states: the **layer** (RCA-12 — pure vs engine-dependent/assembled, both), the
   **recorded red set** (RCA-1), the **contract regime** (S2 — and here, that this unit *is* the regime
   change), the **live reading**, the **adversarial record**, and the **doc-review path**. It also
   states the temporary-authority gap (`TEMPORARY-AUTHORITY-1`) until the sunset fires.

### 12.2 What this unit may and may not touch

- **May touch:** the new pure module(s) for the state machine / resolver / receipt validator + the
  routing wiring in `src/main/` (the resolver's consumers: the MCP handlers' `target` selection and the
  IPC handler bodies), the read-only state projection, and this spec + its test file + its DONE row.
- **May NOT touch:** the fence pair; `docs/specs/mcp-endpoint.md`; the §C.4 ledger; the
  oracle-identity pair; the O-9/O-10 pins; the O-5 queue; the Gnosis repo; any tool name/schema/group;
  the seven surfaces of §7.
- **May NOT restate the commit contract** — `C9` `U-EDIT-1` owns it (§4.4, §12.7(a)).

### 12.3 Adversarial findings

**None yet — the pass runs after this unit's green** (RCA-3). This section is filled by the adversarial
reviewer; each host finding is fixed in the same pass and regression-tested, and each finding names the
`FS` id it exercises.

---

## 13. Dependencies + sequencing

### 13.1 The dependency edges (exact)

| Edge | Kind | Detail |
| --- | --- | --- |
| **`U-ENGINE-PERSIST` → this unit** | **upstream, CROSS-REPO HANDOFF** | the engine's durable corpus (the O-7 leg). It is **not app work**: `docs/HANDOFF.md` O-7 pointer row (the engine persists NOTHING today), `PRUNE-838`/GR-7 (cited, never edited), and `AGENTS.md` item 7 (**do not patch Gnosis from here**). Feeds conditions C2 and readings V1. |
| **`U-CORPUS-MIGRATION` → this unit** | **sibling P2 unit, app-side** | it owns the migration **mechanics** (journal/undo, the corpus census, a verifiable restore — `docs/specs/design-extensions-review.md` §13.3's P2 row) and emits the `MigrationReceipt` (§6.2) this unit reads. Feeds C3, C7, V2, V4. |
| **`U-READS-PIVOT` → this unit** | **sibling P2 unit, app-side** | the read model (§12): residency, the miss policy, eviction, the dirty machine, `"persists"`, the boot sequence. Feeds C4 and V5; supplies the `K` routes of §5. |
| **this unit → the cutover unit** | **blocks** | the unit that moves document handling onto the engine (and re-states the commit contract — `C9` `U-EDIT-1`). **Nothing cuts over before P2 lands** (§13.1 P2, §13.2 S4, §15 item 1). |
| **this unit → `DN-1`** | **unblocks the reason, not the unit** | the engine-authoritative state makes a store-change notification a **real** need (GR-5); **`DN-1` stays PARKED with its GR-5 reason** (`docs/specs/design-extensions-review.md` §12.7(e)) — this unit must not quietly unpark it. |

### 13.2 What this unit does NOT re-open (the frozen boundaries)

- **the closed O-9 / O-10 gates** — re-expression, never re-spec (`docs/specs/design-extensions-review.md`
  §3.1 class (iv), §12.8's last row);
- **the frozen O-5 queue** — `docs/next-steps.md` §NEXT QUEUE's re-numbered order leads with O-5 and is
  **not** re-opened (§3.3 C, §6.2, §13's preamble);
- **the O-6 queue row** — query onto the engine is a **separate** parked item with its own state; this
  unit routes `rag.query` engine-side in S2/S3 **only** as the contract's routing column, and it
  **does not** schedule O-6 or claim its result-shape parity work;
- **`GN-2`'s disposition** — the enumeration + per-item sign-off is its own pass (§11.4); this unit
  archives nothing;
- **the §5.U matrix** — full at 8; assertions enter as re-pins or extended rows.

### 13.3 The order this unit sits in

`P0 (doc layer) → P1 (the ruling's rows: the three SUPERSEDED rows, the `ENGINE-ABSENT-DEGRADED-CONTRACT`
reversal, the launcher amendment, the handoff rows) → **P2 (this unit + `U-ENGINE-PERSIST` +
`U-CORPUS-MIGRATION` + `U-READS-PIVOT` + the fence plan) → P3 (the extension units) → P4 (parkings +
close-out)` — `docs/specs/design-extensions-review.md` §13.1. **This unit's own cycle never shares an
inline run with a sibling P2 unit** (RCA-2/RCA-5: one unit = one spec, one red run, one green, one
adversarial pass, one doc review, one DONE row).

---

## 14. The temporary-authority gap (restated where the contract is authored, so no pass can drop it)

1. **`TEMPORARY-AUTHORITY-1`** — until P2 lands, the **contract** reads engine-authoritative while the
   **code** is `local-authoritative`. **Every** P1 row and every P0–P2 unit DONE row states the gap
   (the contract's regime vs the code's regime). **This spec's own status block states it.**
2. **`TEMPORARY-AUTHORITY-2`** — the runtime `dual` state is a temporary authority with the same kind
   of sunset: it ends at K7 and may not be a steady state.
3. **The sunset condition** — *the local store's authority ends when `U-AUTHORITY-SWITCH` (O-8) lands
   and the authority-switch row records the cutover*; from that point a surviving local document write
   is a **fence violation** (`FS16`).
4. **No pass may describe the cutover as already done**, and no pass may describe the local store as the
   authority after the switch.
5. **The gap is not a licence** — it authorises no new local-authoritative feature and lowers no P2 gate.

---

## 15. Cross-references (symbols, row ids and §sections only — no line numbers)

| This spec | Points at |
| --- | --- |
| §3.1 the sunset / temporary authority | `docs/specs/design-extensions-review.md` §13.2 **S1** ("TEMPORARY AUTHORITY + SUNSET"), §14.5, §11.1's closing consequence |
| §3.2 C1–C10 | `docs/pending.md` §"PARKED DESTINATION — the engine track" (the O-8 row: *"PREREQUISITE of the track, not a tail unit"*); `docs/HANDOFF.md` §OPEN handoff items (the O-7 + O-8 pointer rows) |
| §4.1 the one-writer-per-state rule | `docs/decisions.md` §ACTIVE `SINGLE-WRITER-STORE` + `SINGLE-WRITER-STORE-PER-STORE` (**SUPERSEDED** by §11.1 — the *mechanism* is retained inside the remaining local authority); `src/main/rag-store-registry.ts` `ResolvedRagStoreRegistry`; `src/main/rag-store-runtime.ts` `RagStoreRuntimeController` |
| §4.2 the two-revision rule | `src/main/engine-rag-store.ts` `ConflictError` / `ENGINE_HTTP_STATUS`; `src/main/engine-crud-rag-store.ts` `updateDocument`'s `baseRevision`; `src/main/mcp-server.ts` `gnosis.document.update` |
| §4.3 the cutover reconciliation | `docs/specs/design-extensions-review.md` §12.3 item 3, §12.4 (the dirty machine) |
| §4.4 the alias clause NOT authored | `docs/specs/design-extensions-review.md` §11.1 item 2 (`RAG-EDIT-MCP-GROUPS` + `MCP-UI-EQUIVALENCE` amendments, **explicitly not implied by `GN-1`**) |
| §5.1 the resolver + route union | the read model's `K` class: `docs/specs/design-extensions-review.md` §12.1/§12.2 |
| §5.2/§5.3 the 31 tools | `src/main/mcp-server.ts` (the registrations + `handleRagTool`/`handleEditTool`/`handleGnosisTool`); `src/main/security.ts` `TOOL_GROUPS`/`VALID_GROUPS`; `src/main/rag-store-directory.ts` `resolveStoreArg` |
| §5.4 the IPC routing | `src/shared/types.ts` (the `IPC_*` constants); `src/main/preload.ts` (the `bridge`); `src/main/main.ts` (the `ipcMain.handle` bodies) |
| §7 rows 1–7 | `docs/specs/design-extensions-review.md` §11.1 item 4 + §11.4's exclusion table; `docs/specs/astrographer-scope-realignment-review.md` §3.3 (the AUTHORITY/SECURITY SEAM row + the MCP-server-ownership row); `docs/specs/mcp-endpoint.md` §6 |
| §7's engine-absent rule | `docs/specs/design-extensions-review.md` §11.2, §11.3, §14.5 item 4; `docs/specs/astrographer-scope-realignment-review.md` §3.4; the landed rows `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` + `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` clause (2); `docs/specs/unit-reads-pivot-tab-cache.md` §6.2 |
| §7 the offline states | `docs/specs/design-extensions-review.md` §12.5 (failure UX), §11.3 item 1 (the boot-wide framing is **this spec's**) |
| §9.1 V1–V7 | `docs/specs/design-extensions-review.md` §13.3, §14.1 `C-1`, §14.2 (the fence plan), §14.3 (the census readings) |
| §9.3 the rollback | `docs/specs/design-extensions-review.md` §9.2 (reversibility), §13.3's P2 `U-CORPUS-MIGRATION` row (the rollback red set) |
| §9 the register | the house PBT convention (`docs/specs/unit-import-batch-persist.md` §4, whose P-IM/P-SM/P-TP rows are the format precedent) |
| §10 the fail-states | `AGENTS.md` items 3/4/10; the RCA set |
| §13.1 the dependency edges | `docs/HANDOFF.md` §OPEN handoff items (O-7/O-8); `docs/requirement-catalog.md` §C.4 (`PRUNE-838`, cited never edited) |
| §13.2 the frozen boundaries | `docs/specs/design-extensions-review.md` §3.1 class (iv), §6.2, §7.4, §11.4, §12.8 |

---

## 16. Census / numeric claims (this spec's own claims, and which are derived)

| Claim | Value | Status |
| --- | --- | --- |
| **The routed MCP tool union** | **31** = 8 `rag`-group + 9 `edit`-group (8 registered `edit.*` tools + the group's own `edit.batch` IPC-only primitive, which is the union's 31st entry) + 7 `gnosis`-group read tools (3 retrieval/health + 4 CRUD) + 7 `gnosis-edit`-group mutating tools | **counted** from the registrations in `src/main/mcp-server.ts` + `security.ts` `TOOL_GROUPS`/`VALID_GROUPS` in this pass (the four groups carry **30** registered tools: 8 + 8 + 7 + 7); **recounted** by the 2026-09-21 item-10d documentation review |
| **The routing grid** | **31 × 4 = 124 cells**, 30 of them registered MCP tools and one IPC primitive | derived (a product, not a reading) |
| **The renderer IPC routing tables** | **19 rows** covering the `bridge` surface | counted from `src/main/preload.ts` + `src/shared/types.ts` in this pass |
| **The operator corpus** | **226 documents / 6 102 nodes / 9 266 edges** | **NOT this spec's reading** — it is the accepted O-0 artifact's corpus row as recorded by `docs/specs/design-extensions-review.md` §14.1 `C-1` and `docs/pending.md` §"PARKED DESTINATION — the engine track" (trigger (b)'s input). Quoted, **never re-derived**; `O0_OPERATOR_DOCUMENTS = 226` must not be re-seeded |
| **The suite reading** | `221 files / 4 988 passed / 58 skipped / 0 failed` | a **reading at a named pass**, quoted from `docs/specs/design-extensions-review.md` §14.3 — not re-run here |
| **The fence files** | **2** | named, exempt, re-planned (§14.2) |
| **The §5.U matrix** | **8 — FULL** | pinned; assertions enter as re-pins/extended rows; `MATRIX_ROWS` must not change |
| **The register** | **8 rows, 50 attempts/row, 400 attempts total** (a **declared upper bound**; stop-after-5; the rows stop early) | derived from the house cap (≤8 rows, ≤100/row, ≤400 total) |
| **The fail-states** | **18** (`FS1`–`FS18`) | counted |
| **The property rows** | **8** (`P-AS-1`–`P-AS-8`) | counted |
| **The §6 surfaces** | **7** | counted (the ruling's exclusion list) |

**The census rule this spec obeys** (`docs/specs/design-extensions-review.md` §14.3): every figure is a
**reading with a named source** or a **derived product**; nothing here was recomputed against a live
tree, and the mechanical re-read is owed to the item-10d review and to a shell-bearing pass.

---

## 17. Report to the supervisor (what the landing pass must be able to say)

- **Written:** this file — `docs/specs/unit-authority-switch.md`. **No other file was created or
  edited.**
- **What it pins:** the switch point (§3 — the four states including the temporary authority and its
  sunset, the ten conditions, the ordered K0–K8 sequence, the closed transition set); split-brain
  prevention (§4 — the one-writer-per-state rule replacing `SINGLE-WRITER-STORE`, the injective
  per-store→engine mapping, the two-revision rule, the local-write-during-cutover reconciliation); the
  **total** routing tables (§5 — **31 MCP tools × 4 states** + the 19-row renderer IPC table, resolved
  by one pinned resolver and fail-stated by `FS17`); offline/engine-loss (§8 — the nine observable
  states, the mid-session death behavior, the bounded retry, the reconnect re-verification, and the
  fate of uncommitted edits); the seven host-owned surfaces (§7, each with its rule and its reason);
  the migration interface (§6 — the `MigrationReceipt` + this unit's five requirements + the
  must-not-do list; the dependency edges are §13.1); verification
  (§9 — the V1–V7 checklist, the ten post-switch checks, the R0–R5 rollback with its own red set); the
  typed register (§10 — 8 rows, at the cap); the fail-states (§11 — `FS1`–`FS18`); the process (§12);
  the dependencies and sequencing (§13); the temporary-authority restatement (§14); and the census
  (§16).
- **Decisions pinned here that the architecture had not specified:** the state names + the two
  temporary-authority forms + the sunset's operational trigger; the *one-writer-per-state* replacement
  rule and the per-store→engine injective mapping; the two-revision rule's ban on timestamp comparison;
  the routing resolver's name/shape + totality + the 31-tool census + the `D(U-EDIT-1)` cells;
  the `authority-switch` record's field set; the atomicity of K5; the never-delete-the-local-store pin;
  the engine-loss state set + the bounded-retry/idempotency rules; the reconnect re-verification; the
  post-switch check list; the rollback procedure's red set; and `FS1`–`FS18`.
- **Owed, and NOT discharged here:** the TestWriter red run (RCA-1); the implementation; the trio; the
  RCA-3 adversarial pass; the RCA-11 live battery; the blind greens; the item-10d doc review record at
  `archive/reviews/<date>-unit-authority-switch-doc-review.md`; the DONE row; and the P1 rows (the
  supersessions, the reversal, the launcher amendment) this unit's contract assumes.
- **Layer:** **`pure` + engine-dependent/assembled** (RCA-12, stated in the status block). **Nothing in
  this pass is app-green, envelope-green, store-green or live-green** — this is a spec.
