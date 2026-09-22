# Unit IMPORT-BATCH-PERSIST — the per-op import path + the batch persist invariant (`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`, `RESOLVED-BY-RECLASSIFICATION`) — Spec

**Status:** **DONE (2026-09-21) — LANDED GREEN.** The unit landed the **driver fix** (ONE
`await store.applyBatch(ops)`, result checked) + the **§2b `persistDeferred` structural seam**
in `src/main/rag-store.ts` + the failed-batch byte-identity oracle + the §4 register
(**8/8 rows `held`**, 460 attempts) and §5.1's pinned **3 000 ms** per-row budget. Readings
(the landed tree): the two `tests/import-render-no-duplicates.test.ts` rows **412 ms /
1 521 ms**; the §5.1 corpus rows **73 ms** (`docs/specs/ui-overhaul.md` — the row the budget
discriminates on) / **7 ms** (`docs/specs/user-flow-audit.md` — a regression canary); the
suite **217 files passed (217) · 4 905 passed · 58 skipped · 0 failed (4 963 total)**. It is
the **second half of the trio restoration** (the DEC-2 migration unit
`docs/specs/unit-v5-migration.md` is the first half). Deliverable: the import/apply path
performs **ONE `persist()` per atomic batch**,
with the batch's journal/atomicity/serialization semantics **preserved**, so the two
`tests/import-render-no-duplicates.test.ts` rows return **well inside the committed
15 000 ms budget** (`vitest.config.ts:12`); **as landed they return inside this unit's own
pinned 3 000 ms budget** (§5.1). *(Earlier status, provenance: `SCHEDULED — SPEC LANDED,
RED SET OWED`.)*

**This is its OWN unit, never bundled with the migration unit** (RCA-2/RCA-5:
`docs/specs/unit-v5-migration.md` §2c item 7 forbids any `src/` edit inside that unit, and
that unit's §9 names this one as its adjacent, separately-specified sibling). Each unit
owns its own spec → red report → green → adversarial → doc-review cycle and its own DONE
row.

**Layer (RCA-12, mandatory declaration):** **MAIN-PROCESS / STORE layer** —
`src/main/rag-store.ts` (+ the test driver that exercises it). This layer is
**node-testable by construction**: the seam is a real `createJsonRagStore({ path })` over a
**temp file** (`mkdtempSync`), a real corpus parsed by the real `parseMarkdown`, and the
persist cadence observed through the store's own file writes. **What only a live run can
add:** whether the *assembled app's* import gesture (the MCP `edit.import_markdown`
round trip over IPC + the renderer's re-traversal) feels fast — i.e. the main-process
thread's blocking time as the renderer experiences it, and the `HEAVY-OPS-FREEZE-THE-PAGE`
long-task budget. This unit claims **store-green**, never app-green: the single-writer
queue, the journal and the on-disk file are all inside the main process and are asserted
here; the rendered/assembled surface is not (no UI, no Electron, no DOM in this unit's
oracles).

**Depends on (upstream of this spec):**
- the defect row **`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`** (`docs/defects.md:27-28`;
  refined + verified in this pass — §1; **status moved to RESOLVED-BY-RECLASSIFICATION
  2026-09-21 by the amendment pass** — the residual is this unit's test-driver fix + the
  ACCEPTED per-op cadence);
- the diagnosis that produced it (the probe pass 2026-09-21 / the DEC-2 Class-C split,
  reproduced in `docs/specs/unit-v5-migration.md` §1.1 Class C, §7.2(6), §9);
- the pinned contract decisions the fix must not break: **BATCH-ATOMICITY-API**
  (`docs/decisions.md:75`), **IPC-EDIT-BATCH** (`:77`), **SINGLE-WRITER-STORE** (`:34`),
  **CONTENT-EDIT-RE-TRAVERSAL** (`:31`) — each checked in §2d;
- the committed budget **`vitest.config.ts:12` `testTimeout: 15_000`** (the migration
  unit's §2b) — the acceptance budget this unit is measured against.

**Delivered by:** a **test-side driver correction** (§2a) + the **store-side regression
pins** that make the invariant structural (§2b/§2c) + this unit's own contract test file
(§3/§4). **No UI change, no new IPC channel, no new MCP tool, no `BatchOp` union change.**

**AMENDMENT (2026-09-21 — the Pin-4 contract amendment; the architect's ruling on the
blocking conflict):** `tests/unit-v5-migration-contract.test.ts`'s **Pin 4** (the Class-C
timing guard) originally timed a **bare per-op loop** (5 640 per-op store calls → 19 264 ms
against its **5 000 ms PIN as authored**; the budget **as landed is 3 000 ms**). §2b keeps the per-op cadence unchanged and §2c item 1 **forbids**
changing it, so **no admissible change can bring that bare loop under budget — and none
should**: the per-op cadence (each op atomic + durable = one full-store `persist()`) **is the
store's documented single-writer model**, and the bare per-op loop's `O(store-size)` cost is an
**accepted, recorded characteristic** of that model, **not a defect**. The unit's real,
**verified** finding stands: the **production importer was ALREADY batched** (1 persist per
import — §1.1/§1.2) and the measured slow path was the **TEST DRIVER's** per-op loop.
**RULING:** Pin 4's intent is *"the import path must not silently return to per-edge
persist"*; it is **re-pointed** — by the TestWriter, concurrently with this amendment — to
measure the **import path's own mechanism** (**ONE `applyBatch`**) against its pinned budget,
with the anti-regression intent carried by the **DRIVER SOURCE-CONTRACT pin** (`P-SM-2` /
`FS4`). A separate **NOTE** (§7.6, pinned by the register's `P-TP-4`) records the **accepted**
per-op cadence. **Consequence: this unit's own acceptance is the DRIVER fix (ONE `applyBatch`,
1 persist for any N/order) + the failed-batch byte-identity oracle + the two
`import-render-no-duplicates` rows inside the pinned budget — and it no longer claims to turn
Pin 4 green by accelerating a bare per-op loop** (§5.2 item 6, §7.1, §7.2, §7.6).

---

## 1. The defect, VERIFIED against the tree (the causal audit this pass ran)

### 1.1 What the defect row claimed vs. what the code does

The row as filed attributes the 18.3-19.2 s to the **import/apply stage falling back to
the per-op `putEdge` path**. **That attribution is WRONG, and this pass corrects it.**
Verified by reading the three files end to end:

1. **The production importer of record already performs ONE persist per corpus.**
   `src/main/markdown-import.ts` builds one `BatchOp[]` (`:379-385`: ALL `putNode` ops,
   then ALL `putEdge` ops) and calls **`await ctx.store.applyBatch(ops)`** (`:387`) — once.
   `applyBatch` (`src/main/rag-store.ts:1344`) → `applyBatchSync` (`:1274`), whose per-op
   applier **`applyBatchOp` (`:1200`) is documented non-journaling, non-persisting**
   (`:1193-1194`); the single `pushJournal({kind:'batch', …})` (`:1340`) + **one
   `persist()` (`:1341`)** happen once, after the loop. **The production `edit.import_markdown`
   path therefore costs exactly 1 persist today — there is no fallback.**
2. **The `edit.batch` MCP path also already batches:** `src/main/edit-ops.ts:442`
   `return store.applyBatch(payload.ops)` (the `IPC_EDIT_BATCH` handler; decision
   IPC-EDIT-BATCH).
3. **The 5 640 persists came from the TEST DRIVER (pre-fix).**
   `tests/import-render-no-duplicates.test.ts`'s
   `importFile` helper (the pre-fix body at `:48-55`; **as landed the helper is `:55-74` and
   applies the corpus in ONE `await store.applyBatch(ops)` at `:65`, result checked `:68-72`**)
   drove the store's **per-op public API**:
   `:52` `for (const n of parsed.nodes) await store.putNode(n)` and
   `:53` `for (const e of parsed.edges) await store.putEdge(e)`.
   `putNode` → `putNodeSync` (`src/main/rag-store.ts:1038`) → `persist()` (`:1068`) — one
   per node; `putEdge` → `putEdgeSync` (`:1135`) → `persist()` (`:1171`) — one per edge.
   At the probe's corpus (`docs/specs/ui-overhaul.md`, 1 895 nodes / 3 745 edges) that is
   **1 895 + 3 745 = 5 640 `persist()` calls for one import**, each serializing the
   **whole growing store** (`:792-808`: `JSON.stringify(payload, null, 2)` → temp file →
   `renameSync`). The test file's own header documents this driver as "the same path
   `edit.import_markdown` uses for the parse/validate/apply stages" (`:46-47`) — that note
   is **inaccurate for the apply stage**, which is the whole defect.
4. **`putNode`/`putEdge` are genuinely per-op APIs and their in-tree production callers
   are single-record ops.** The row's evidence cites the 22 `ctx.store.putNode/putEdge`
   sites in `src/main/edit-ops.ts` (`:166`/`:197`/`:207`/`:239`/`:252`/`:266`/`:307`/`:313`/
   `:323`/`:333`/`:387`/`:401`/`:473`/`:494`/`:518`/`:592`/`:712` + the `removeNode`/
   `removeEdge` sites). Each is **one record per MCP edit op** (`set_content`, `create_node`,
   `set_edge`, `set_props`, …): one op = one persist is the *contract* of a single write,
   not a redundant write. **No in-tree production caller loops the plain API over a
   corpus** (verified: the only `src/` `applyBatch` callers are `markdown-import.ts:387`
   and `edit-ops.ts:442`; the only loops over `putNode`/`putEdge` in `src/` are the
   `edit-ops.ts` `split_node`/`merge_node` re-link loops at `:313-335`, bounded by the
   node's own edge count).

**Corrected defect statement (the row is edited in this pass to say this):** the **cost
and the red rows are real and measured**; the **cause is the test driver's per-op loop**,
not a store-internal fallback inside the batch path. The **store-side risk** the row named
is real but **hypothetical today**: any *future* multi-record caller of the plain API (a
bulk edit, a large paste commit, a re-index) pays `O(records × store size)`, and the
synchronous `JSON.stringify` of the whole corpus lands on the main process's thread.

### 1.2 The verified `persist()` call census (derived by reading the code, not by running it)

| Fact | Value | Source (symbol → line, verified this pass) |
| --- | --- | --- |
| `persist()` call sites in the store implementation | **7** | `putNodeSync` `:1068` · `removeNodeSync` `:1092` · `putEdgeSync` `:1171` · `removeEdgeSync` `:1184` · `applyBatchSync` `:1341` · `undoSync` `:1375` · `redoSync` `:1388` |
| `persist()` body | full-store serialize + atomic replace | `:792-808` (`mkdirSync` · `JSON.stringify(payload, null, 2)` where `payload = {version, nodes, edges, journal, cursor}` · `writeFileSync(${path}.tmp)` · `renameSync(tmp, path)`; **failures swallowed** by `catch {}` at `:805-807`) |
| Persists per **corpus import via `markdown-import.ts`** (batched) | **exactly 1** | `markdown-import.ts:387` → `applyBatch` `:1344` → `applyBatchSync` `:1274` → one `persist()` `:1341` |
| Persists per **corpus import via `edit.batch` (`IPC_EDIT_BATCH`)** | **exactly 1** | `edit-ops.ts:442` → the same `applyBatchSync` |
| Persists per **corpus import through the `import-render-no-duplicates` test driver today** | **5 640** = 1 895 + 3 745 (**the pre-fix reading; AS LANDED the driver applies the corpus in ONE `applyBatch` ⇒ exactly 1 persist**) | `tests/import-render-no-duplicates.test.ts:52-53` (the pre-fix per-op loop — now a comment) → `putNodeSync`/`putEdgeSync` → `:1068`/`:1171` |
| Persists per **single MCP edit op** | **1** (the contract of a single write) | `edit-ops.ts:166-712` (22 call sites) |
| Persists per **failed batch** | **0** | `applyBatchSync` returns `{ok:false, …}` at `:1304`/`:1319` before the `:1341` persist; the rollback restores nodes/edges/journal/cursor |
| Persists per **empty batch** | **0** | `applyBatchSync:1278` returns `{ok:true, results:[]}` before the snapshot/persist |
| Persists per **undo/redo** | **1** each | `:1375`/`:1388` (unchanged by this unit) |
| Journal entries per **successful batch** of N ops | **1** | `pushJournal({kind:'batch', …})` `:1340` (vs N entries on the per-op path) |
| Nodes/edges in the store file after the same import, batch vs per-op | **identical sets**; the **file** is NOT byte-identical | the `BATCH-ATOMICITY-API` row (`docs/decisions.md:75`) pins ONE `batch` journal entry vs N entries → `journal` + `cursor` differ by construction (§4 `P-TP-2` states this exactly) |

**Honest scope note:** the census above is derived **by reading the code** (this role runs
no `npm`, no vitest, no app). The **timings** in §1.1 (18.3-19.2 s rows; 2 879/16 818 ms
`putNode`/`putEdge`; parse 7 ms; traversal 404 ms) are the **probe's/TestWriter's
measurements reproduced**, not re-measured here. Every **file/symbol/line** citation was
re-verified against the tree this pass.

---

## 2. What the proposal asks / the contract

### 2a. The correction the red rows need (the causal fix)

**Contract:** the two rows' **driver** must use the store's atomic batch path — the same
path the production importer uses — so a corpus import performs **ONE `persist()`**:

- `tests/import-render-no-duplicates.test.ts` `importFile` (as landed `:55-74`; the
  **old** per-op loops were at `:52-53` — that anchor is now a comment, so cite the helper
  by SYMBOL) replaces its two
  per-op loops with **ONE** `await store.applyBatch(ops)` (**`:65` as landed**) where
  `ops` = ALL `{op:'putNode', node}` (`parsed.nodes` order) then ALL
  `{op:'putEdge', edge}` (`parsed.edges` order) — the **exact** construction
  `markdown-import.ts:379-385` uses (referential integrity: every edge's endpoints exist
  before the edge). The **result is checked** (`:68-72` as landed): `res.ok !== true` fails
  the row loudly, surfacing `res.error` + `res.failedIndex`.
- **The assertions are NOT relaxed.** `nodeIds` (`parsed.nodes.map(n => n.id)`), the
  per-`rag-<id>` census (`payloadRagIdCounts`), the rendered-DOM id census and the two
  `.toBeGreaterThan(...)` sanity bounds (in the per-file envelope row and the rendered-DOM
  row — cite by symbol, the line bounds drift) stay byte-identical. The
  file's own documented subject (the 1-1 duplication contract) is unchanged. **Verified as
  landed: ZERO assertions were touched by this unit's driver change.**
- **The result must be checked:** `const res = await store.applyBatch(ops)` and the test
  must fail loudly if `res.ok !== true` (a batch that silently fails would make the row
  vacuous — `counts.size`/`ids.length` bounds are the backstop, but the explicit check is
  the pinned form). On failure the row must surface `res.error` + `res.failedIndex`.
- **The test-only driver fix is NOT the production fix, and is insufficient alone.** It is
  the **causal** fix for the two red rows (they are test-side work); the store-side half
  (§2b) is what keeps the invariant from regressing. A fix that ONLY edits the test while
  leaving the invariant unpinned is a review finding (§2e F1).

### 2b. The store-side contract — the invariant, named seam, and what must NOT change

**The invariant (the pinned name):**

> **NO PER-OP FULL-STORE WRITE INSIDE A BATCH.** While an atomic batch is being applied,
> the store must perform **zero** full-store writes; exactly **ONE** `persist()` occurs
> after the batch's single journal entry lands. The **persist count of a batch is
> independent of N** (the op count) and **independent of op ORDER**.

**The named seam (exactly one of these two; the implementer picks ONE and records which):**

- **Seam (a) — the existing deferral, made a checked precondition (RECOMMENDED, and the
  seam this spec pins by default).** `applyBatchSync`'s per-op applier `applyBatchOp`
  (`:1200`) already performs no journaling and no persistence; this unit adds an
  **explicitly scoped internal guard** so the property is *structural* rather than
  *incidental*: an internal `persistDeferred` (or equivalent) flag set for the duration of
  the `applyBatchSync` op loop, with `persist()` a **no-op while that flag is set** (and
  the batch's own `:1341` call made after the flag clears, or exempted). A per-op
  `persist()` reached inside the loop is thereby **impossible**, not merely absent. **The
  seam is a STRUCTURAL GUARD**: it makes an **already-true invariant explicit** by
  construction — it is **not a cadence change, it changes no timing, and it cannot bring a
  bare per-op loop under any budget**. Outside a batch, `putNode`/`putEdge`/`removeNode`/
  `removeEdge` keep **exactly** their current behaviour: **one full-store `persist()` per
  call** (`:1068`/`:1092`/`:1171`/`:1184`), with `persist()`'s body (`:792-808`) and the
  per-op `persist()` cadence **byte-for-byte unchanged** — that cadence IS the store's
  documented single-writer durability model (§7.6, accepted characteristic). The seam's
  subject is the **batch's interior only**.
- **Seam (b) — a new deferred-persist API** (e.g. an internal `runDeferred(fn)` / a
  `deferredOps` entry point that coalesces N per-op calls into one persist at the end).
  **Only acceptable if the per-op public semantics stay unchanged for a caller that does
  not opt in**, and the unit then **OWES a new decision row** (`docs/decisions.md`) pinning
  the coalescing window (§6). Seam (b) is not required by the measured defect and is
  **not** recommended.

**Semantics that MUST be preserved (each an oracle in §4 or a pin in §3):**

1. **Journal atomicity:** a successful batch still lands as **exactly ONE** `kind:'batch'`
   journal entry (`:1340`) carrying the applied forward ops + the reverse-ordered inverse
   ops; `undoDepth()` advances by **1** (not N); `undo()` of a corpus import restores the
   **pre-import** state; `redo()` re-applies it.
2. **Failed batch = no visible change:** on any op failure the nodes/edges/journal/cursor
   are restored from the snapshot (`:1296-1304`, `:1309-1319`) and **`persist()` is not
   called** — the file on disk stays **untouched**. `applyBatch` **never throws** for a
   domain failure: `{ok:false, error, failedIndex}` (`:212`).
3. **Single-writer serialization:** the batch remains **one write unit** in the queue —
   `applyBatch` keeps the `if (inQueue) return applyBatchSync(ops); return enqueue(…)`
   re-entrancy pattern (`:1344-1347`), no other write interleaves, and no deadlock.
4. **Non-fatal persist failure:** a failed disk write inside `persist()` stays swallowed
   (`catch {}` `:805`) — the in-memory store and the returned `{ok:true}` are unaffected
   (Unit A §5.7 / Unit N §5.5 discipline; unchanged).
5. **Reads/persist shape unchanged:** `persist()`'s payload shape (`{version:1, nodes,
   edges, journal, cursor}`), the atomic temp+rename write, and the boot/load path are
   **untouched**.

### 2c. Explicitly OUT of scope (each a review finding if it appears)

| # | Forbidden | Why |
| --- | --- | --- |
| 1 | Any change to the **per-op** `putNode`/`putEdge`/`removeNode`/`removeEdge` persist cadence (i.e. making a bare `putNode` stop persisting, or adding a debounce/timer) | It silently changes the durability contract of **every** single MCP edit op (`edit-ops.ts`, 22 call sites) and of `undo`/`redo`; it would need its own decision row + a durability story. The measured defect does not require it. |
| 2 | **Removing/lowering** the committed `testTimeout: 15_000` (`vitest.config.ts:12`) or sizing it to this unit's rows | `docs/specs/unit-v5-migration.md` §2b C-8 pins 15 000 ms as the ONLY test-timeout knob. |
| 3 | A **per-file/per-row `describe`-wide timeout** that replaces the committed budget | The committed budget is the reviewable policy; row-local `it(..., {timeout})` on the two existing rows would hide the fix's effect (§3 instead puts the budget assertion in this unit's own contract test). |
| 4 | Editing `docs/specs/unit-v5-migration.md`'s pins, or landing any part of the migration unit here | RCA-2/RCA-5: one unit, one cycle; that unit's §2c item 7 forbids `src/` edits in the migration diff. |
| 5 | Relaxing, renaming, skipping or `.only`-ing any existing row to get green | §2a: the assertions are not relaxed; a green obtained by weakening the pin is a review finding. |
| 6 | Any `BatchOp` union change, new IPC channel, new MCP tool, or `RagStore` interface change | The store's batch primitive already exists (`BATCH-ATOMICITY-API`, closed at 7 members). |
| 7 | Fixing only the test driver with no store-side pin (§2b seam + §4 rows) | The import path's mechanism stays unguarded (the driver source-contract pin is what carries the intent — §7.2/`P-SM-2`); §2a's insufficiency clause. |

### 2d. Interaction with the existing pinned decisions (checked)

| Decision | Does it constrain this fix? | Verified reading |
| --- | --- | --- |
| **BATCH-ATOMICITY-API** (`docs/decisions.md:75`) | **YES — it IS the fix's contract.** It already pins "a successful batch … persists ONCE; a failed batch … does NOT persist", the single `batch` journal entry, the never-throws discriminated result, and the re-entrant single-writer routing. This unit **implements** that pinned contract on the path that was bypassing it and **pins it structurally**. | The row's terms were re-read this pass; nothing in this spec adds to or weakens them. **No new decision row is owed for this** (§6). |
| **IPC-EDIT-BATCH** (`:77`) | **YES — constrains the blast radius, and is satisfied by construction.** It pins the renderer→main batch channel as atomic via `applyBatch` with "one batch journal entry, one persist" and "a successful non-empty batch broadcasts `rag-store-changed` EXACTLY ONCE". This unit changes neither `handleEditBatch` (`edit-ops.ts:442`) nor the broadcast derivation, so the IPC path's guarantees are inherited untouched. §2b(3) (queue serialization) is the property that keeps this honest. | `deriveBatchBroadcast`/the handler are not touched by this spec; the broadcast count follows from the batch count, unchanged. |
| **SINGLE-WRITER-STORE** (`:34`) | **YES — it is the property the fix must not break.** "The main process owns all writes; the store is the lock point." §2b(3) pins that the batch stays ONE queued write unit; a fix that made per-op writes interleave (e.g. fire-and-forget async persists) would break it. Also `SINGLE-WRITER-STORE-PER-STORE` (`:119`): one queue per store instance — a batch is per-store, never cross-store. | Confirmed: `applyBatchSync` runs inside one `enqueue` closure; the unit adds no cross-store or async-write path. |
| **CONTENT-EDIT-RE-TRAVERSAL** (`:31`) | **NO — it does not constrain the shape of this fix, but it does bound what a fix may promise.** It pins that a store change re-traverses (content or structural), and that `edit.set_content` journals a `content` entry. A batch of `putNode`/`putEdge` ops journals **one `batch` entry** — so the re-traversal trigger and the journal *shape* the renderer sees are unchanged; the undo **granularity** a user sees for a corpus import collapses from N steps to 1 (already pinned by BATCH-ATOMICITY-API; recorded here as an accepted consequence, not a new decision). | The renderer's response is `rag-store-changed`-driven and count-based, not journal-shape-based (IPC-EDIT-BATCH's A4); no re-traversal contract changes. |

### 2e. Forbidden-shortcut findings (each of the 7 §2c items is a review finding; plus)

- **F1** — a green obtained by editing ONLY the test driver without the §2b seam + §4 rows
  (§2a insufficiency clause).
- **F2** — a **persist-count oracle that cannot fail**: a "1 persist" claim derived from a
  `vi.fn()` that nothing observes, or a `spy` installed after the store module was
  imported, or a census that passes when the write count is 0 (an empty scan is a FAILURE,
  not a vacuous pass — `docs/specs/user-flow-audit.md:90-91`). The §3 pins therefore
  require a **non-zero** count of the real writes + a **failing-control draw**.
- **F3** — the byte/set-equivalence oracle (§4 `P-TP-2`) asserted on the **whole store
  file** (which CANNOT be equal across drivers because the journal granularity differs by
  design) — the oracle must be scoped to the node/edge payload exactly as §4 states.

---

## 3. States, fail-states and throw patterns

### S — states (every state the TestWriter must derive)

| Id | State | Observable |
| --- | --- | --- |
| **S1** | **Corpus import via `applyBatch` (the happy path)** — a real `parseMarkdown` of `docs/specs/ui-overhaul.md` + one `applyBatch(ops)` of all node ops then all edge ops | `{ok:true, results}` with `results.length === ops.length`; `listNodes()`/`listEdges()` sizes match the batch's distinct ids; **`persist()` ran exactly once**; the store file exists and is non-empty; the journal has exactly ONE new `batch` entry; `undoDepth()` = 1 |
| **S2** | **The same import through the CORRECTED test driver** (`tests/import-render-no-duplicates.test.ts` after §2a) | both rows green; identical `nodeIds`; identical per-`rag-<id>` census; identical rendered-DOM id census; wall clock **< the pinned per-row budget** (§5) |
| **S3** | **Batch of N = 1** (boundary: a batch is still ONE persist — it does not become two) | 1 persist; 1 journal entry; node present |
| **S4** | **Empty batch** (`applyBatch([])`) | `{ok:true, results:[]}`; **0 persists**; journal unchanged; file mtime unchanged |
| **S5** | **Failed batch** (e.g. a `putEdge` whose target node is absent, or `setProps` — unsupported in the closed union) | `{ok:false, error, failedIndex}`; **0 persists**; nodes/edges/journal/cursor restored; a second read of the file is byte-identical to the pre-batch read (the "byte-identical on failure" oracle) |
| **S6** | **Persist failure is non-fatal** (a read-only store directory) | the batch still returns `{ok:true, results}`; no throw; the in-memory store reflects the batch; the file may be stale (documented) |
| **S7** | **Re-entrancy**: `applyBatch` called from INSIDE a queued write (`inQueue === true`) | runs directly, completes (no deadlock), still 1 persist for the batch |
| **S8** | **Serialization**: a `putNode` racing an in-flight batch | the plain write is queued **after** the batch's single persist; final file contains both; the batch's persist count is still 1 |
| **S9** | **Undo/redo of a batch** | `undo()` restores the pre-import state (**1** persist from `undoSync` `:1375`, not N); `redo()` re-applies it (1 persist, `:1388`); `undoDepth()` 1 → 0 → 1 |
| **S10** | **Corpus import with a large N (the measured corpus)** — the row of record | 1 persist; row within budget; the store file's `nodes`/`edges` arrays are set-equal to the per-op driver's (the `P-TP-2` oracle scoped per `F3`) |
| **S11** | **Second corpus file** (`docs/specs/user-flow-audit.md`, the same file's second `SPEC_FILES` entry) | same as S1/S10 at its own (smaller) size; its node/edge census is **measured by the red run** (this spec does not assume it) |

### FS — fail-states (each loud, each with an exact observable)

| Id | Fail-state | Exact observable |
| --- | --- | --- |
| **FS1** | A per-op full-store write INSIDE the batch | the write-count observer records **> 1** rename to the store path during one `applyBatch` → the row fails naming the observed count and N |
| **FS2** | The batch's single persist is LOST (a "deferred" flag never cleared, so the file is never written) | the store file's size/mtime is unchanged after a successful batch → the row fails (and `status()`/a fresh store over the same path shows 0 nodes — an independent read) |
| **FS3** | A failed batch leaves a visible change | the file bytes differ from the pre-batch read, OR the journal/cursor advanced, OR the write count is non-zero → fail |
| **FS4** | The test driver regresses to the per-op loop | the driver census pin (§4 `P-SM-2`, a source-contract read of `tests/import-render-no-duplicates.test.ts`) fails naming the offending file; independently the two rows' wall clock re-enters the seconds range and the budget row fails. **After the 2026-09-21 Pin-4 re-point (§7.2) this source-contract row — NOT a red timing pin on the bare per-op loop — is the ANTI-REGRESSION PIN OF RECORD for the Class-C intent** ("the import path must not silently return to per-edge persist"). |
| **FS5** | `applyBatch` throws for a domain failure | `await store.applyBatch([badOp])` rejects → fail (the pinned contract is the discriminated result) |
| **FS6** | The batch stops being ONE journal entry (e.g. the per-op journaling path is used inside the loop) | `journal()` after a 2-op batch has 2 entries, or the new entry's `kind !== 'batch'` → fail |
| **FS7** | A batch op's inverse/redo fidelity breaks (the `edge-update`/`edge-retarget`/`doc-flow-role-change` collapse noted in `unit-v5-migration.md` §7.2(6)(c)) | `undo()` does not restore the exact pre-batch node/edge set (set-equality over the public copies) → fail |
| **FS8** | The write-count oracle is vacuous (0 counted writes on a path that must write) | the "control" half of every census row: a per-op `putNode` on the same instrumented store must count exactly 1 write — a control draw reading 0 fails the row (`F2`) |

### Throw patterns (pinned)

- `applyBatch(ops)` — **NEVER throws** for a domain failure (non-array ops, malformed op,
  unsupported rich-text op, referential failure, mid-batch failure): returns
  `{ok:false, error, failedIndex}` (`src/main/rag-store.ts:204-212`, `:1276`, `:1304`,
  `:1319`).
- `putNode`/`putEdge` — **throw** for shape/reference violations
  (`rag putNode: <field> required/invalid` `:1040`; `rag putEdge: source/target node not
  found or quarantined` `:1142`). **Unchanged by this unit** (and a reason the driver
  correction must check `result.ok` instead of relying on a throw — §2a).
- `persist()` — never throws (swallowed `catch {}` `:805-807`); a persist failure is
  invisible to the caller (S6).
- Mutations after `teardown()` — throw `rag store: torn down` (`:777`). **Unchanged.**

---

## 4. §5.x Property register (PBT) — typed, ≤8 rows

Register convention (imported): rows typed **P-IM** (input-model), **P-SM** (state-model),
**P-TP** (transform) — **never F-rows, never §6/FS-n**; **≤8 rows, at most 100
attempts/row** (per-row ceiling; the budget is stated as `Σ(attempts/row)`, never as a
fixed total). **Scope note (mandatory):** every row is scoped to the **MAIN-PROCESS /
STORE layer** — a real `createJsonRagStore` over a temp file, driven through the public
`RagStore` surface. Rows are **pure** in the sense that they need no Electron/DOM/display;
they do touch a real temp filesystem (the layer's own subject), and they run under
`npm test`. Proposed file: **`tests/unit-import-batch-persist-contract.test.ts`**.

| Row | T | Pinned invariant | Generator / strategy | Falsifiable oracle | Layer covered |
| --- | --- | --- | --- | --- | --- |
| `P-IM-1` | IM | **A batch of N ops performs exactly ONE full-store write, for every N.** The persist count of `applyBatch(ops)` is `1` independent of `N = ops.length` (including `N = 1` and a large N), and the write is the LAST thing to happen (no write before the batch's journal entry lands). | `strat:batch-size` — draw `N ∈ {1, 2, 7, 40, 200, 1 895}` over generated well-formed `putNode`/`putEdge` ops (nodes first, then edges referencing them; ids unique per draw), each draw on a **fresh temp dir + fresh store**; `N = 1` is the boundary and `N = 1 895` the scale draw (the large draw may be capped by the row's own budget). | the instrumented `fs` observer (§3 instrument) returns `persistCount === 1` for **every** draw; the failing controls are (a) a draw driven through the per-op loop whose count must be `N` (proves the counter discriminates, `F2`/`FS8`) and (b) a draw where the count must be non-zero. | store (real temp fs) |
| `P-IM-2` | IM | **A failed batch performs ZERO visible persists and leaves the file byte-identical.** For any generated batch whose k-th op is invalid (missing endpoint, unknown op kind, `null` op), `applyBatch` returns `{ok:false, failedIndex:k}` and the store file's **bytes** after the call equal the bytes before it (and the write count is 0). | `strat:failed-batch` — draw `k ∈ {0, mid, N-1}` × failure mode `∈ {putEdge-missing-target, unsupported setProps, null op, malformed node}`; each draw first seeds a NON-EMPTY store (so the file is non-trivial) and reads its bytes. | oracle: `readFileSync(path)` before === after (byte equality) AND `persistCount === 0` AND `ok === false` AND `failedIndex === k`; a counterexample prints `k`, the failure mode and the byte-length delta. | store (real temp fs) |
| `P-SM-1` | SM | **The resulting node/edge payload is set-equal across the two drivers** (the equivalence oracle, **scoped** per `F3`). For any generated corpus-like input applied on a **fresh** store, the batch driver and the per-op driver produce **identical node sets and identical edge sets** (compared on the public copies: `{id,type,content,nodeKind,children,documentPath,tags,props,ownedNodeIds,createdAt,updatedAt}` and the `RagEdge` shape), modulo the documented differences the batch path pins (ONE `batch` journal entry vs N entries; `undoDepth()` 1 vs N; never-throw vs throw; the `edge-update`/`edge-retarget`/`doc-flow-role-change` inverse collapse for UPDATE ops). | `strat:driver-equivalence` — draw generated inputs × `{nodes-only, nodes+edges, one node updated twice}`; each draw builds TWO fresh stores (one per driver) from the same input and compares serialized public sets. **The whole-file byte comparison is a stated NON-goal** (`F3`): the files legitimately differ in `journal`/`cursor`. | oracle: set-equality of `listNodes()`/`listEdges()` (ordered by id, serialized) plus `journal().at(-1).kind === 'batch'` on the batch side and `journal().length === ops.length` on the per-op side — i.e. the oracle asserts BOTH the equality AND the pinned difference (so the row cannot pass by comparing the wrong thing). | store (transform pair) |
| `P-SM-2` | SM | **The red rows' driver uses the batch path (source contract), and the per-op loop is absent.** Over **the driver file only** (`tests/import-render-no-duplicates.test.ts`; its source contract is the `ADDED (unit IMPORT-BATCH-PERSIST §2a)` block — symbol-anchored, `~:200-235` as landed, and cited by SYMBOL because the file's line numbers drift with every added block), the driver contains an `applyBatch(` call and **zero** `store.putNode(`/`store.putEdge(` calls inside a loop; and the same check against a synthetic file TEXT carrying the old pattern **fails** (the negative half). **This unit's own register adds NO row over this unit's new contract file's electron-mock census** — the 5-file 'electron'-mocking census is the MIGRATION unit's `P-SM-2`/Pin 1 (`tests/unit-v5-migration-contract.test.ts` + `tests/unit-v5-bridge-capture.test.ts`), a different subject. | `strat:driver-census` — a real read of the driver file + synthetic draws: the old pattern text, the new pattern text, an empty file (an empty scan is a FAILURE, `F2`), and a file that loops a DIFFERENT store method. | oracle: `ok:true` iff the real file passes both checks AND the file set is non-empty; the negative draws must all fail the same checks (proving the row discriminates); every failure names the file + the construct. | test-source contract (pure) |
| `P-TP-1` | TP | **The persist count is INDEPENDENT OF OP ORDER.** For the same multiset of ops, any permutation that preserves referential integrity (all `putNode` ops before the `putEdge` ops that need them) yields **exactly 1** persist and an identical final node/edge set. | `strat:order-permutation` — draw permutations of the node ops and of the edge ops (including reverse order, interleaved-with-an-update-at-the-end, and the pinned nodes-then-edges order); each draw on a fresh store. | oracle: `persistCount === 1` for every permutation AND `listNodes()`/`listEdges()` set-equal to the pinned-order draw's; a counterexample prints the permutation index + the count. | transform (real temp fs) |
| `P-TP-2` | TP | **The batch preserves the atomicity contract end to end: ONE journal entry, undo restores the pre-batch state exactly, redo re-applies it, and the whole unit is ONE queued write.** For any generated batch, `journal().at(-1).kind === 'batch'`, `undoDepth()` advances by exactly 1, `undo()` returns the pre-batch node/edge set (set-equality), `redo()` re-applies it, and the three persist calls involved (`batch`, `undo`, `redo`) are each exactly 1. | `strat:batch-atomicity` — draw `{single putNode, node+edge, N nodes, remove ops mixed in}` × `{undo once, undo+redo, undo twice}`; fresh store per draw. | oracle: the count/journal/state triple above; a counterexample prints the entry kind, `undoDepth()` before/after, and the first differing id between the pre-batch and post-undo sets. | transform (state-model) |
| `P-TP-3` | TP | **The persisted file is a faithful image of the in-memory store after a batch, and a boot over that file observes it.** For any generated batch, re-opening a store on the SAME path yields the same node/edge sets, the same journal length and the same `undoDepth()` — i.e. the single persist really captured the whole batch (the "single persist is not a lost persist" oracle, `FS2`). | `strat:boot-roundtrip` — draw a batch (node+edge, then a second batch), persist, `teardown()`, then `createJsonRagStore({path})` again and compare sets + `status()` census. | oracle: node/edge set-equality + `undoDepth()` equality + `status().corrupt === false`; a counterexample prints the differing census fields. | transform (boot round trip) |
| `P-TP-4` | TP | **The per-op public contract is UNCHANGED for a caller that does not batch** (the anti-regression companion of §2c item 1): a bare `putNode`/`putEdge`/`removeNode`/`removeEdge` each performs exactly 1 persist, and `N` bare calls perform exactly `N` writes. | `strat:per-op-cadence` — draw `N ∈ {1, 2, 5}` × op kind, on a fresh store; plus the boundary draw where a per-op call happens immediately after a batch on the same store (count 1 more). | oracle: `persistCount === N` (+1 for the post-batch draw) — this row is the one that FAILS if the implementer chooses §2c item 1's forbidden cadence change; a counterexample prints the op kind and the count. | transform (regression pin) |

**Register count: 8 rows** (`P-IM-1`, `P-IM-2`, `P-SM-1`, `P-SM-2`, `P-TP-1`, `P-TP-2`,
`P-TP-3`, `P-TP-4`) — **at the ≤8 cap**. Budget: the TestWriter allocates **60
attempts/row** for the seven store rows and **40** for `P-SM-2` (a source-contract row
whose draws are file-level, not op-level) → **60×7 + 40 = 460 attempts ≤ 800 at the
ceiling (8 × 100)**, every row ≤ 100, with stop-after-5; **the 460 figure is a DECLARED
UPPER BOUND, never a claim that every attempt ran** — the rows stop early (stop-after-5, and
the store rows draw from bounded ladders), so **the held attempts are ≪ 400** as executed.
**As landed the register is 8/8 `held`** (`held` = zero counterexamples), each row's own
census carrying the FS8 control draw. The allocation constants are
recorded in the new test file's own constant (`PBT_ATTEMPTS = 60`, `PSM2_ATTEMPTS = 40`; the `PBT_ATTEMPTS` convention,
`tests/unit-o-0-report-contract.test.ts`).

**Census instrument (pinned, so the oracle is not vacuous — `F2`):** the persist count is
observed by intercepting the store's **real** writes: `vi.mock('node:fs', …)` preserving
the real module and wrapping **`writeFileSync`** and **`renameSync`** with counters that
delegate to the real implementations. `persist()` (`src/main/rag-store.ts:792-808`) writes
`${path}.tmp` then renames it onto `${path}` — so **a rename onto the store path counts as
one persist**. The instrument must be installed **before `src/main/rag-store.js` is
imported** (`rag-store.ts:32` imports the bound names from `node:fs`), and **every census
row must carry the §FS8 control draw** (a per-op call must count 1) so a 0-reading cannot
pass. *(An acceptable equivalent instrument, recorded by the TestWriter if used: a
`fs.watch`-counted observer of renames onto the store path, provided it also carries the
control draw.)*

**Honest no-pad rationale (mandatory):**

- **`P-TP-4` is a REGRESSION row, not a new-contract row.** It exists because the most
  tempting wrong fix (§2c item 1: stop persisting on a bare `putNode`) would make every
  other row in this register green while silently weakening the durability contract of the
  **22** single-record `edit-ops.ts` call sites. A register that could not catch that would
  be pandering.
- **The other 7 rows are not padding either, by measurement:** `P-IM-1`/`P-TP-1` are the
  causal invariant (count independent of N, count independent of order); `P-IM-2` is the
  atomicity-preservation oracle that the RCA-2 split could otherwise lose; `P-SM-1` is the
  equivalence oracle **scoped honestly** (set-equality, NOT whole-file bytes — `F3`);
  `P-SM-2` is the only row that can catch a test-driver regression; `P-TP-2`/`P-TP-3` cover
  the two ways the fix could look right and still be wrong (a lost persist; a batch that is
  no longer one journal entry).

---

## 5. Acceptance (testable) — the pins the TestWriter authors

### 5.1 The budget pinned by this unit

**Measured baseline (the red set's first reading, from the TestWriter's run): the two
`tests/import-render-no-duplicates.test.ts` rows take 18.3-19.2 s.** The committed suite
budget is **15 000 ms** (`vitest.config.ts:12`, the migration unit's §2b C-8).

**This spec pins:**

| Pin | Value | Rationale |
| --- | --- | --- |
| **Per-op persist bound** | **exactly 1 `persist()`** for a corpus import (any N; any order) | the causal invariant (§2b); asserted by the §4 census rows |
| **Per-row wall-clock budget** | **3 000 ms per row** — asserted **in this unit's own contract test file**, not by shrinking the two rows | a ~6× margin under the 15 000 ms committed budget and a ~6× reduction from the measured 18.3-19.2 s; derived from the measured components — the import's non-persist cost is parse **7 ms** + traversal **404 ms** at the probe's corpus, so post-fix the import row should land in the low hundreds of ms; 3 000 ms leaves room for the 2.2× load variance RUL-3 names (`unit-v5-migration.md` §1.1) while still failing loudly if the path returns to per-op persistence (which reads 18 s, not 3 s) |
| **Row-level total** | the two rows **complete inside the committed 15 000 ms** (green with no row-local timeout override, with a recorded wall-clock reading) | AGENTS.md item 4's `npm test` leg; §2c item 3 |
| **The re-pointed migration pin's budget** | **3 000 ms** — ONE number for both pins (this unit's §5.1 row and the migration unit's §3.4 Pin 4) on the same corpus and the same mechanism — asserted against the **import path's own mechanism (ONE `applyBatch`)**, **never** against a bare per-op loop | the TestWriter re-pointed `tests/unit-v5-migration-contract.test.ts` §3.4 Pin 4 concurrently with this amendment (the architect's ruling): Pin 4's intent is "the import path must not silently return to per-edge persist", and the per-op cadence is ACCEPTED (§7.6), so the pin may not be turned into a red timing pin on the bare per-op loop. **As landed** the pin carries `PIN4_BUDGET_MS = 3_000` (5 000 ms was the budget *as authored*; the TestWriter unified it with this unit's §5.1) |
| **Full-suite budget** | **`npm test` = 0 failed** with re-baselined counts committed in the DONE row | the trio's acceptance; this unit's rows are the last 2 of the 22. **AS LANDED: 217 files passed (217) · 4 905 passed · 58 skipped · 0 failed (4 963 total), exit 0** |
| **As-landed readings (§5.1's own rows)** | **73 ms** (`docs/specs/ui-overhaul.md` — the row the budget DISCRIMINATES on) / **7 ms** (`docs/specs/user-flow-audit.md` — already fast, so a regression CANARY only), both vs the pinned **3 000 ms**; the two `import-render-no-duplicates` rows **412 ms / 1 521 ms**; a return to per-edge persist reads **19 486 ms** on `ui-overhaul.md` (6.5× over the budget — the reading the budget exists to catch) | the §5.1 budget rows in `tests/unit-import-batch-persist-contract.test.ts` (`BUDGET_MS = 3_000`); the remand fix (c) records WHICH row discriminates, rather than implying both do |

**Why 3 000 ms and not tighter:** the budget's job is to fail when the path regresses to
`O(records × store size)`, not to benchmark the machine. A tighter bound (e.g. 1 000 ms)
would be a flaky tripwire under suite load and would tempt a future pass to delete it; a
looser one (e.g. 10 000 ms) would sit inside the committed 15 000 ms budget and could mask
a partial regression.

### 5.2 The acceptance checklist (all must hold before DONE) — **ALL LANDED 2026-09-21**

1. **§2a LANDED:** the two rows drive `applyBatch` and check `result.ok`
   (`tests/import-render-no-duplicates.test.ts:65`; the check `:68-72`); no assertion
   relaxed (the two rows' asserted sets/bounds are unchanged); both green; each row's wall
   clock **recorded**: **412 ms / 1 521 ms**, both **< 3 000 ms**
   (`P-SM-2` + the budget row).
2. **§2b LANDED (seam (a), the recommended one):** the named seam is
   **`persistDeferred`** — `src/main/rag-store.ts:807` (the declaration), `:809` (the
   `persist()` early-return), set at `:1313` (the batch op loop), cleared in a `finally` at
   `:1346`; the invariant "no per-op full-store write inside a batch" is thereby
   **structural** (a per-op `persist()` reached inside the loop is a no-op by construction),
   and the batch's own persist after the flag clears is unchanged.
3. **§4 register LANDED** in `tests/unit-import-batch-persist-contract.test.ts`, with the
   census instrument + control draw (§4's instrument note) and the `PBT_ATTEMPTS`/`PSM2_ATTEMPTS`
   allocation recorded; the red set was run and reported first (RCA-1). **As landed: 8/8 rows
   `held`** (460 declared upper-bound attempts; held attempts ≪ 400).
4. **The persist census is asserted:** **exactly 1** `persist()` per corpus import
   (both `SPEC_FILES`), **0** for a failed batch, **N** for N bare per-op writes — the
   §4 rows `P-IM-1`/`P-IM-2`/`P-TP-4`, each carrying the FS8 control draw.
5. **The O-0 suites stay green** — the **3** O-0 contract test files present in this tree
   (`tests/unit-o-0-report-contract.test.ts`, `tests/unit-o-0-hook-contract.test.ts`,
   `tests/unit-o-0-driver-contract.test.ts`; verified by name — the "four O-0 contract
   files" phrasing elsewhere in the trackers is one too many). **As landed the O-0 reading is
   106/106** (report-contract 44 + hook-contract 39 + driver-contract 23), and this unit
   touches no O-0 file.
6. **The migration pins stay green** — **as landed: all 4 pins green**, including Pin 4
   (`§3.4`) in its **RE-POINTED** form: it measures the **import path's own mechanism**
   (**ONE `applyBatch`** on the corpus) against its pinned **3 000 ms** budget, **not** a bare
   per-op loop. **This unit never claimed to turn Pin 4 green by accelerating the bare per-op
   loop** (impossible by design and forbidden by §2c item 1). **This unit's own acceptance
   was:** (a) the **DRIVER fix** (ONE `applyBatch`, **1 persist for any N and any order** —
   `P-SM-2`'s source contract + the census rows + the two `import-render-no-duplicates` rows
   inside the pinned budget); (b) the **failed-batch byte-identity oracle** (`P-IM-2` /
   `FS3`); and (c) the §2b seam. **The anti-regression half of Pin 4's intent stays carried by
   `P-SM-2`/`FS4`** (§7.2).
7. **`npm test` = 0 failed** (repo-wide), `npm run typecheck` = 0, `npm run build` clean —
   the trio (AGENTS.md item 4). **AS LANDED: `npx vitest run` = 217 files passed (217) ·
   4 905 passed · 58 skipped · 0 failed (4 963 total), exit 0; typecheck exit 0; build exit 0
   (5 bundles)** — green only after the migration unit's classes A + B AND this unit's DRIVER
   fix both landed (RCA-2: separate cycles).
8. **Adversarial pass (RCA-3) + documentation review (RCA-6/10d) recorded** — §3a/§3b below.
9. Seam (b) was **NOT** chosen (seam (a) landed), so **no new decision row is owed** (§6).

---

## §3a / §3b — Adversarial findings (RCA-3) — **both LANDED**

**§3a — Adversarial findings (host-side).** **LANDED** — the read-only adversarial sub-agent
ran AFTER this unit's green (edge cases / unauthorized access / malformed inputs); its
findings are recorded in the unit's adversarial + documentation-review records
(`archive/reviews/2026-09-21-unit-import-batch-persist-doc-review.md`) and in the active
trackers. The edges this unit's subject invited were named at spec time as the pass's work
list: (a) a batch whose ops reference records removed out-of-band; (b) a batch
whose `putEdge` target is quarantined; (c) a batch containing `null`/`undefined`/prototype-
key ops; (d) a batch interleaved with bare per-op writes from inside the queue
(re-entrancy + serialization); (e) a store whose directory becomes read-only between the
batch and its persist (non-fatal path, S6); (f) a batch large enough to exceed
`maxJournalLength` in one entry (the cap drops OLDEST entries — a batch entry is not
special-cased); (g) a second `applyBatch` on the same store while the first is enqueued.

**§3b — Proposal-review findings.** **NOT APPLICABLE as a three-agent gate** (AGENTS.md item
8): this is a fix inside a documented contract's shape — the `RagStore` batch contract —
not a change to the MCP contract. The findings that stood in for the gate are §1's
**causal correction** (the defect row's attribution was wrong) and §2c's 7 forbidden
shortcuts, each a review finding if present. **The documentation review (RCA-6/item 10d)
record is `archive/reviews/2026-09-21-unit-import-batch-persist-doc-review.md`** (verdict
`PASS-WITH-FIXES` → `RECONCILED`).

---

## 6. The decision-row ruling (docs/decisions.md)

**No new decision row is owed by this spec, and `docs/decisions.md` gains none** —
provided the implementer takes the **recommended seam (a)**. Every contract this fix
touches is **already pinned**:

- "a successful batch persists ONCE; a failed batch does not persist; ONE `batch` journal
  entry; never throws for a domain failure; serialized through the single-writer queue" —
  **BATCH-ATOMICITY-API** (`docs/decisions.md:75`, landed with Unit N and its spec
  `docs/specs/unit-n-batch-atomicity.md` §5.4/§5.5/§5.6);
- "one `batch` journal entry, one persist" on the renderer IPC path —
  **IPC-EDIT-BATCH** (`:77`);
- the lock-point property the fix must preserve — **SINGLE-WRITER-STORE** (`:34`) /
  `SINGLE-WRITER-STORE-PER-STORE` (`:119`).

The **provenance note appended to DEC-2's cell** (`docs/decisions.md:15`, added by the
migration unit's §8) already points a reader at `docs/specs/unit-v5-migration.md` for the
Class-C diagnosis; this spec is the correction of record for the classification, and the
**defect row + `docs/pending.md` + `docs/next-steps.md` are edited in this pass** (§7.3).

**Conditional obligation:** if the implementer instead takes **seam (b)** (a new
deferred/coalescing persist API whose semantics a caller can opt into — i.e. a *new*
contract), that **is** a decision this repo has not recorded, and the unit **owes a
`DECIDED:` row** naming the coalescing unit of work, its durability boundary, and its
interaction with `undo`/`redo`. The unit may not ship seam (b) without it.

---

## 7. Census + cross-references + the migration dependency

### 7.1 Census (the numeric claims of THIS spec)

| Deliverable / claim | Count |
| --- | --- |
| `persist()` call sites in the store implementation | **7** (`putNodeSync`, `removeNodeSync`, `putEdgeSync`, `removeEdgeSync`, `applyBatchSync`, `undoSync`, `redoSync` — cite by symbol; the lines drift) |
| Persists per corpus import **today, production path** (`markdown-import.ts` → `applyBatch`) | **1** |
| Persists per corpus import **today, the red test driver** (**pre-fix reading**) | **5 640** (1 895 `putNode` + 3 745 `putEdge`) |
| Persists per corpus import **after this unit** (both paths) | **1** — **as landed the driver's ONE `applyBatch` performs exactly 1 persist** |
| Persists for a **failed** batch / an **empty** batch | **0** / **0** |
| Persists per **single MCP edit op** (22 `edit-ops.ts` call sites) | **1** (unchanged — §2c item 1 / `P-TP-4`) |
| Journal entries per successful batch of N ops | **1** (vs N on the per-op path) |
| The red rows this unit turns green | **2** (`tests/import-render-no-duplicates.test.ts` — the per-`SPEC_FILES` envelope row and the rendered-DOM row). **As landed: both green at 412 ms / 1 521 ms** |
| The migration pin this unit's work is measured by — **RE-POINTED** 2026-09-21 by the TestWriter (architect's ruling) | **1** (`tests/unit-v5-migration-contract.test.ts` §3.4 **Pin 4**, budget **3 000 ms** as landed) — re-pointed from a **bare per-op loop** to the **import path's own mechanism (ONE `applyBatch`)**; the anti-regression intent is carried by the DRIVER SOURCE-CONTRACT pin (`P-SM-2`/`FS4`), never by a red timing pin on the accepted per-op cadence (§7.6) |
| Rows of the `SUITE-RED-AFTER-VITEST5-ELECTRON44` Class C | **2** (this unit) — classes A **18** + B **2** are the migration unit's |
| Pinned per-row wall-clock budget | **3 000 ms** (§5.1) |
| Pinned per-op persist bound | **exactly 1** (§5.1) |
| New §4 register rows | **8** (at the ≤8 cap) — budget `60×7 + 40 = 460` (≤800) |
| New §3 states / fail-states | **11** (S1-S11) / **8** (FS1-FS8) |
| New test files | **1** proposed (`tests/unit-import-batch-persist-contract.test.ts`) + **1** edited (`tests/import-render-no-duplicates.test.ts`) |
| `src/` change surface | **1** file (`src/main/rag-store.ts`, the §2b seam only) |
| Forbidden shortcuts | **7** (§2c) + **3** findings (§2e) |

### 7.2 The migration unit's dependency note (bidirectional, stated in both units — AMENDED 2026-09-21)

- `docs/specs/unit-v5-migration.md` **§9** names this unit as the adjacent Class-C
  import-path unit and pins that it is **not** part of the migration unit (§2c item 7);
- that unit's **§3.4 Pin 4** is the **Class-C timing guard**. **As authored** the row was
  literally named **`RED-UNTIL-§9`** and drove **exactly the per-op loop**
  (symbol-anchored: the two `for … await store.putNode/ putEdge` loops) against
  `docs/specs/ui-overhaul.md` with a **5 000 ms budget as authored** — **that reading is
  provenance only; the budget as LANDED is 3 000 ms** (unified with this unit's §5.1, one
  number for both pins on the same corpus);
- **THE CONFLICT AND THE RULING (2026-09-21).** That bare per-op loop cannot be brought
  under any sub-second budget by any admissible change: §2b keeps the per-op cadence unchanged and §2c
  item 1 **forbids** changing it, and the cadence is the store's documented single-writer
  durability model (each op atomic + durable = one full-store `persist()`; measured
  **19 264 ms** for the 5 640-call corpus loop vs the pinned budget). So the pin was not a
  fixable defect signal but an **unfalsifiable red**. **RULING: Pin 4 is RE-POINTED**
  (by the TestWriter, concurrently) **to measure the import path's own mechanism — ONE
  `applyBatch` — against the pinned budget**, and the **anti-regression intent** ("the
  import path must not silently return to per-edge persist") is carried by the **DRIVER
  SOURCE-CONTRACT pin** (`P-SM-2` / `FS4`), which reads
  `tests/import-render-no-duplicates.test.ts` as a **source contract** and fails if the
  per-op loop returns. **The bare per-op cadence is ACCEPTED and recorded as a NOTE
  (§7.6), pinned by the register's `P-TP-4` (per-op cadence = N persists for N bare
  calls) — NEVER as a red timing pin.**
- **What this unit was required to record — ALL LANDED (2026-09-21):** (a) the driver fix
  (**ONE `applyBatch`,
  1 persist for any N/order**) — the row of record for this unit; (b) the re-pointed Pin 4
  measured on the **import path's mechanism**; (c) the accepted per-op cadence NOTE (§7.6)
  with `P-TP-4` as its pin. **A green obtained by making the bare per-op loop cheap (a
  deferred/batched per-op cadence) is a review finding** — §2c item 1, `P-TP-4`, `FS4`.
- **The trio is green only after BOTH units land** (migration: classes A + B; this unit:
  the driver fix → `npm test` 0 failed) — **both landed, and the trio IS green:
  `npx vitest run` 217 files passed (217) / 4 905 pass / 58 skip / 0 failed (4 963), exit 0;
  typecheck 0; build 0 (5 bundles); O-0 suites 106/106.**

### 7.3 Trackers edited in this pass

| Tracker | Change |
| --- | --- |
| `docs/defects.md` (`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`) | **status → RESOLVED-BY-RECLASSIFICATION (2026-09-21, the amendment pass)** — NOT a fix and NOT a silent close: the row is reframed to the verified call path (production import **already batched**, 1 persist per import; the measured slow path is the **TEST DRIVER's** per-op loop), its residual is split into (a) the **test-driver fix** — this unit's work — and (b) the **ACCEPTED per-op characteristic** with its revisit condition (if a per-op path ever needs to be cheap, **batch it or add an explicit non-durable mode**), and it no longer reads as a production hot-path defect. **APPENDED 2026-09-21 (the doc-review pass): residual (a) is now LANDED** — `importFile` = ONE `applyBatch`, result checked; the `persistDeferred` seam at `src/main/rag-store.ts:807/809/1313/1346` — **residual (b) remains the ACCEPTED per-op cadence with its revisit condition**. Cite the row by id: its line anchors drift. |
| `docs/pending.md` (SCHEDULED row `RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`) | label + status → **SCHEDULED — SPEC LANDED** at the amendment pass; **RETIRED 2026-09-21 (the doc-review pass)** — the SCHEDULED section now carries ONE pointer line to the unit DONE rows in `docs/next-steps.md` + DEC-2's provenance (a landed row is never left as a SCHEDULED row). |
| `docs/next-steps.md` | a CURRENT WORK **DONE row** (driver fix + the `persistDeferred` seam; 8/8 register rows held, 460 attempts; the two rows 412 ms / 1 521 ms; §5.1 73 ms / 7 ms vs the pinned 3 000 ms; layer: main-process/store — never app-green) + the NEXT QUEUE renumbering that retired items (1) and (1b). |
| `docs/specs/unit-v5-migration.md` | **§3.4 Pin 4 re-pointed** (import path's mechanism, ONE `applyBatch`; **budget 3 000 ms as landed**), with the anti-regression intent moved to the driver source-contract pin and the accepted per-op cadence recorded as a NOTE (no red timing pin); the §1.1 Class-C classification, §2b/§2c wording, §5 S10/F9, §7.1 census, §9 and §10 item 5 are corrected to match, and the spec is **DONE (2026-09-21)**. |
| `docs/decisions.md` | **no row** (§6): seam (b) was NOT chosen and seam (a) landed, so the conditional obligation never fired. |

### 7.4 Cross-references (every load-bearing citation, re-verified this pass)

- **`src/main/rag-store.ts`** — `:32` the `node:fs` imports (`writeFileSync`/`renameSync`);
  `:204-212` `BatchResult` + the never-throw contract; `:246-297` the `RagStore` interface
  (`putNode` `:251`, `putEdge` `:258`, `applyBatch` `:268-274`, the pinned doc-comment
  "persists ONCE … no persist happens"); `:776-789` `enqueue`; `:792-808` `persist()`
  (**`:807` the `persistDeferred` declaration + `:809` its early-return — the §2b seam as
  landed**); `:811-820` `pushJournal`; `:881-915` `applyBatchOpInternal` (non-journaling,
  non-persisting); `:1038`/`:1068` `putNodeSync`+persist; `:1092` `removeNodeSync`+persist;
  `:1135`/`:1171` `putEdgeSync`+persist; `:1184` `removeEdgeSync`+persist; `:1193-1194` the
  batch-deferral comment; `:1200-1272` `applyBatchOp`; `:1274-1343` `applyBatchSync`
  (snapshot `:1282-1287`, rollback `:1296-1304`, catch-rollback `:1309-1319`, **`:1313`
  `persistDeferred = true`**, single journal
  entry `:1340`, single persist `:1341`, **`:1346` `persistDeferred = false` in the
  `finally`**); `applyBatch` (the re-entrant
  routing); `undoSync`/`redoSync` (+ their persists).
  **Cite the seam by SYMBOL (`persistDeferred`) where a line is unstable.**
- **`src/main/markdown-import.ts`** — the batch build (all `putNode` ops, then all
  `putEdge` ops); `await ctx.store.applyBatch(ops)` (once); the `{ok:false}` return.
- **`src/main/edit-ops.ts`** — the `IPC_EDIT_BATCH` handler's `return store.applyBatch(payload.ops)`
  plus the per-record `putNode`/`putEdge` sites (22 of them) and the
  `removeNode`/`removeEdge` sites — **cite by symbol; the 22-site census is the load-bearing
  fact, not the line numbers**.
- **`tests/import-render-no-duplicates.test.ts`** — the two `SPEC_FILES`; `freshStore`
  (temp dir + real store); `importFile` = **ONE `await store.applyBatch(ops)` at `:65`** with
  the success check `:68-72` (**the old per-op loop at `:52-53` is GONE**); the per-file
  envelope row (its `.toBeGreaterThan(...)` sanity bounds) and the rendered-DOM row (bounds
  `:165` as landed). The source-contract block added by this unit is
  `ADDED (unit IMPORT-BATCH-PERSIST §2a)` **(`~:200-235` as landed — symbol-anchored)**.
  **Note: the row bounds cited in the spec's first pass (`:129-130`/`:165`) and the old
  `:52-53` anchors are DEAD — `:52-53` is now a comment.**
- **`tests/unit-v5-migration-contract.test.ts`** — §3.4 **Pin 4**, the Class-C timing guard,
  **as landed**: the `describe` title
  `Pin 4 (§3.4, re-pointed) — the import path's own mechanism (ONE applyBatch) stays inside
  the pinned budget`, with `PIN4_BUDGET_MS = 3_000`, the corpus
  `docs/specs/ui-overhaul.md`, the §2a op construction driving ONE `store.applyBatch(ops)`,
  `res.ok` checked, and the row's `it` timeout `15_000`; the accepted-cadence **NOTE-pin**
  sits beside it and cross-references register `P-TP-4`.
  **The pre-re-point anchors (`:368-399`, the row name `RED-UNTIL-§9`, the bare per-op
  driver `:387-388`, the budget `5 000` at `:390`) are PROVENANCE ONLY — the pin is cited by
  its `describe`/subject (Pin 4 / the import-path mechanism), never by that range.**
- **`tests/unit-import-batch-persist-contract.test.ts`** — this unit's contract file as
  landed: `BUDGET_MS = 3_000`, `PBT_ATTEMPTS = 60`, `PSM2_ATTEMPTS = 40`, the §5.1 budget
  `describe` over both `SPEC_FILES`, and the 8-row register `describe` (each census row
  carrying its FS8 control draw).
- **`vitest.config.ts`** — `:12` `testTimeout: 15_000` (the committed budget; the migration
  unit's §2b C-8).
- **`docs/decisions.md`** — `:75` BATCH-ATOMICITY-API; `:77` IPC-EDIT-BATCH; `:34`
  SINGLE-WRITER-STORE; `:119` SINGLE-WRITER-STORE-PER-STORE; `:31`
  CONTENT-EDIT-RE-TRAVERSAL; `:40` SOURCE-SWITCHABLE; `:15` DEC-2.
- **`docs/specs/unit-n-batch-atomicity.md`** — §5.4 (single `batch` entry), §5.5
  (**single persist**; "a failed batch does not persist at all"), §5.6 (re-entrancy),
  §5.9 (the census: "`persist()` calls per successful batch: exactly 1 … a failed batch
  calls `persist()` 0 times").
- **`docs/specs/unit-v5-migration.md`** — §1.1 Class C (the diagnosis, **corrected
  2026-09-21**: the driver's per-op loop, not a production fallback), §2c item 7 (the
  no-`src/`-edit boundary), §3.4 Pin 4 (**re-pointed** to the import path's mechanism), §5
  (S10/F9), §7.1 (the Class-C census), §7.2(6) (the batch path is not a verified drop-in:
  journal granularity, never-throws, collapsed structural ops), §9 (this unit, named), §10
  item 5 (the Class-C dependency clause).
- **`docs/specs/unit-a-rag-store.md`** — §5.5 (the single-writer queue + `inQueue`
  re-entrancy), §5.6 (the journal), §5.7 (the atomic temp+rename write + the non-fatal
  persist failure).
- **`docs/defects.md`** — this row (reframed + **RESOLVED-BY-RECLASSIFICATION** in
  the amendment pass; **residual (a) APPENDED as LANDED 2026-09-21**);
  `SUITE-RED-AFTER-VITEST5-ELECTRON44` (Classes A/B/C for
  context; its Class-C cell **corrected** from "a GENUINE PRODUCTION HOT PATH" to the
  test-driver loop; the row is now **FIXED (2026-09-21)**). **Both rows are cited by id —
  their line anchors drift.**
- **`AGENTS.md`** — item 2/RCA-5 (per-unit delegation), item 3/RCA-1 (red first), item 4
  (the trio), item 6 (tracker reconciliation), item 9 (the delegation gate), item 10d/RCA-6
  (the per-unit doc review), item 11/RCA-12 (the layer statement), item 12/RCA-12 (the
  rendered-DOM layer).

### 7.5 What could NOT be verified at this pass (honest limits)

1. **No timing was re-measured.** This role runs no `npm`/vitest/app (§1.2's note): the
   18.3-19.2 s rows, the 2 879/16 818 ms `putNode`/`putEdge`, parse 7 ms and traversal
   404 ms are **reproduced from the probe/TestWriter**, not re-derived. The
   **19 264 ms** figure in the amendment banner (§Status) is the **architect's ruling
   record** of the bare per-op loop's reading, reproduced as given — not re-measured here.
2. **The `user-flow-audit.md` corpus census (nodes/edges) is NOT stated here.** Only
   `ui-overhaul.md`'s numbers are recorded (1 895/3 745/116 139 bytes, from the probe); the
   second `SPEC_FILES` entry's census is **owed from the red run** (S11).
3. **This spec's own line citations are symbol-anchored where the tree drifts.** Lines are
   given as read this pass; where a line is unstable the symbol is named. The
   **documentation review (RCA-6)** re-pins them after the greens. **This applies with full
   force to Pin 4: the TestWriter's concurrent re-point changes its anchors, so Pin 4 is
   cited by subject (`§3.4` / the import-path mechanism), never by `:368-399`.**
4. **The re-pointed Pin 4's final text was NOT authored by this role and was NOT read here
   at spec time — it has SINCE LANDED** (`tests/unit-v5-migration-contract.test.ts`, the
   `describe` titled `Pin 4 (§3.4, re-pointed) — the import path's own mechanism (ONE
   applyBatch) stays inside the pinned budget`), with `PIN4_BUDGET_MS = 3_000` — the
   TestWriter unified the budget with this unit's §5.1 (5 000 ms was the budget as authored).
   This spec pins its **subject** (the import
   path's mechanism = ONE `applyBatch`) and its **budget** (**3 000 ms as landed**).
5. **`docs/skills/designing-pages.md` does not exist in this tree** (only
   `docs/skills/process-guardrails.md`), and this unit's subject is the main-process/store
   layer — **no page design, no demo-page index, no coverage matrix is owed** (§Layer).

### 7.6 NOTE (ACCEPTED CHARACTERISTIC) — the per-op `persist()` cadence is NOT a red timing pin

**Recorded here so the amendment cannot be re-litigated by a later pass as a defect.**

- **What is accepted:** a **bare** per-op call (`putNode`/`putEdge`/`removeNode`/`removeEdge`
  outside a batch) performs **one atomic + durable write = one full-store `persist()`**
  (`:1068`/`:1092`/`:1171`/`:1184` → `persist()` `:792-808`), so a caller that loops the
  plain API over N records pays **`O(N × store size)`**. This `O(store-size)` cost per op
  **IS the store's documented single-writer durability model** (one op = one atomic durable
  write; `SINGLE-WRITER-STORE` `docs/decisions.md:34`) — **an accepted, recorded
  characteristic, not a defect.**
- **What is NOT accepted:** a **production** caller that loops that API over a corpus. The
  production importer does not (§1.1: `markdown-import.ts:387` = ONE `applyBatch`, 1
  persist), `edit.batch` does not (`edit-ops.ts:442`), and the 22 `edit-ops.ts` per-op sites
  are **single-record ops**. The only corpus-scale per-op loop in this tree was the **TEST
  DRIVER** (the pre-fix per-op loop in `tests/import-render-no-duplicates.test.ts` — now
  replaced by ONE `applyBatch`) — this unit's work (§2a).
- **The pin:** the register's **`P-TP-4`** (§4) pins this cadence as a **regression row**
  (`N` bare calls ⇒ exactly `N` persists). It is the pin of record for the cadence — **there
  is no red timing pin on the bare per-op loop, and none may be authored**: with §2c item 1
  forbidding a cadence change, such a pin is **unfalsifiable by construction** (5 640 calls
  → 19 264 ms vs any sub-second budget).
- **Revisit condition (recorded):** if a **per-op path ever needs to be cheap**, the fix is
  to **batch it** (the existing `applyBatch` primitive) **or to add an explicit
  non-durable mode** (which would be a NEW contract and would owe a `DECIDED:` row in
  `docs/decisions.md` — §6's conditional obligation, seam (b)). It is **never** to make a
  bare per-op call silently non-durable.

---

## 8. The gate shape (how this unit is accepted)

- **Delivery kind:** **test + a minimal `src/` change.** One edited test file
  (`tests/import-render-no-duplicates.test.ts` — the §2a driver), one new contract test file
  (`tests/unit-import-batch-persist-contract.test.ts` — the §4 register + the §5.1 budget +
  the census instrument), and the §2b seam in `src/main/rag-store.ts`. **No new module, no
  new interface method, no IPC/tool change, no tracker-shaped artifact document.**
- **Delegability (AGENTS.md item 9):** (a) **this spec exists** ✓; (b) a **TestWriter RAN
  and reported the red set** ✓ (which of the §4 rows were red on arrival, the
  two rows' wall-clock red readings, the re-pointed **Pin 4**'s reading on the **import
  path's mechanism**, and the driver source-contract pin's red reading) — the unit was then
  delegated and **LANDED (2026-09-21)**.
- **Gate items:** §5.2's 9 items, in order, each recorded in the unit's DONE row — plus
  **RCA-3** (the adversarial pass, §3a) and **RCA-6/10d** (the documentation review). Both
  are **LANDED**: the record is
  **`archive/reviews/2026-09-21-unit-import-batch-persist-doc-review.md`** (hyphens, the
  tree's convention).
- **Process split (RCA-2/RCA-5):** this unit's red→green→adversarial→doc-review cycle was
  **its own**, never shared with the migration unit's run; the trio is claimed green only
  after both landed — **and, per the 2026-09-21 ruling, only after this unit's DRIVER fix
  landed** (the re-pointed Pin 4 and the two `import-render-no-duplicates` rows could not be
  greened by any store-side change alone). **Both landed; the trio is green
  (217 files passed (217) / 4 905 pass / 58 skip / 0 failed (4 963), exit 0; typecheck 0;
  build 0).**
