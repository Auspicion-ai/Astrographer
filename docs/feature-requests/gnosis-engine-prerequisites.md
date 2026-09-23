# FEATURE REQUESTS → the **Gnosis engine** project (handover from Astrographer) — the P2 prerequisite set

**Date:** 2026-09-21 · **Requester:** the Astrographer shell · **Target project:** the **Gnosis engine**,
the adjacent repo `../Gnosis` (NOT a dependency, NOT vendored) · **Status:** OPEN — filed; **the upstream
project is never patched from this repo** (AGENTS.md item 7).

**This document changes no code in this repo.** It writes one file plus one index row. No `src/**`,
`tests/**`, `scripts/**`, `docs/specs/**`, `docs/decisions.md`, `docs/defects.md`, `docs/pending.md` or
`docs/next-steps.md` byte is touched by this pass, and **nothing in `../Gnosis/**` is read-modified,
generated or patched**.

**Filing convention (this document's own rules, stated so no later pass has to infer them):**

1. **Indexed from `docs/HANDOFF.md`.** The index row is in `docs/HANDOFF.md` §"OPEN handoff items" →
   the single row **`GNOSIS-ENGINE-PREREQUISITES (the P2 prerequisite set)`**. Every request id below
   (`GRQ-n`) is named in that one row; the row is the index, this file is the set — the
   **GR-1..GR-9 precedent**.
2. **Never a patch.** Every item here is an **upstream-owned change** recorded as a handoff. Editing
   `../Gnosis/**` from this repo is a **process violation, not a fix** (`docs/specs/unit-engine-persist.md`
   §2.4; `docs/HANDOFF.md` head, "**Do NOT patch the Gnosis repo from this project.**").
3. **Never a `docs/defects.md` row set for an engine item.** A gap against the **engine** is a handoff.
   The engine-side defect rows that already exist (`docs/defects.md` `GNOSIS-ENGINE-QUERY-MODE-IGNORED`,
   `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`) are **cited here by id**, never duplicated and never
   extended by this document. **No new `docs/defects.md` row is filed by this pass** — the app-side
   prerequisite units are unbuilt-by-design, not defects (`docs/specs/unit-engine-persist.md` §13).
4. **Counted, never asserted.** The set is **11 requests (`GRQ-1`..`GRQ-11`) in 5 groups** (§1–§5) +
   **2 recorded disagreements** (§6) + **1 non-engine parked row** (§7). Adding a twelfth request is a new
   filing pass, not a liberty of this one.

**Verification discipline.** Every `file:line` and every `§section` below was **re-read in this tree on
2026-09-21** (read-only pass, no shell). No line is cited from memory, and every sibling-repo
(`../Gnosis`) claim is **cited to the record that read it** (`docs/HANDOFF.md`'s GR-inventory row), never
re-derived — the sibling repo is not readable from this role. Where a cited line is a **live reading**
(the GNOSIS-ENGINE-QUERY-MODE-IGNORED / HOST-ENGINE-QUERY-POST-NO-ENVELOPE repros) it is labelled a
reading and not re-run here.

**Priority vocabulary (this file's):** **P0** blocks a shipped or immediately-next consumer path;
**P1** blocks a planned P2 unit; **P2** blocks a later unit or a quality/parity goal; **P3**
destination/future. **Status vocabulary:** **OWED** = the engine-side change the record already names as
owed; **REQUESTED** = this document asks for a shape the engine's own record has not yet ruled on
(or has ruled **against**, in which case the disagreement is recorded in §6, never smoothed over).

**The consumer-side pointer set (cited, never duplicated):** `docs/HANDOFF.md`'s surviving rows —
**`O-7 INGESTION-ONTO-THE-ENGINE`** (`docs/HANDOFF.md:56`), **`O-8 AUTHORITY SWITCH / OFFLINE DUAL-PATH`**
(`docs/HANDOFF.md:58`), **`O-7 ENGINE PERSISTENCE — the blocker the `GN-1` ruling makes load-bearing`**
(`docs/HANDOFF.md:72`), **`GR-5 THE STORE-CHANGE NOTIFICATION ROUTE`** (`docs/HANDOFF.md:74`),
**`GR INVENTORY STATUS`** (`docs/HANDOFF.md:76`), **`THE DURABILITY DIRECTION`** (`docs/HANDOFF.md:78`) —
plus the request inventory `docs/feature-requests/gnosis-engine-feature-requests.md` (`## GR-4`, `## GR-5`,
`## GR-6`, `## GR-7`, `## GR-9`). **The parked rows are `docs/pending.md` §"PARKED DESTINATION — the engine
track" (`docs/pending.md:142`, rows O-6/O-7/O-8 at :150/:151/:152 + the P2 pointers at :154).**

---

## 0. Why this set exists, and the chain it unblocks

The user's ruling `GN-1` (`DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`) makes the **engine the owner of
document CRUD**, and the engine **persists nothing today**. Its recorded consequence is explicit:

- **`docs/specs/design-extensions-review.md` §14.1 row C-1** (:1610): *"The engine persists NOTHING today
  (O-7 unmet) ⇒ without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` first, the operator corpus is LOST at
  the next restart."* The corpus is **226 documents / 6 102 nodes / 9 266 edges**; `PRUNE-838`/GR-7 is an
  upstream-owed, non-prunable ledger row and no migration unit exists.
- **`docs/specs/design-extensions-review.md` §14.1 row C-8** (:1617): *"A user without the engine binary
  can open NO wiki."*
- **`docs/specs/design-extensions-review.md` §13.3 P2 row** (:1582): `P2 U-ENGINE-PERSIST` is
  engine-side (**handoff**) + any host-side client seam; **"the durability direction (`PRUNE-838`) is the
  upstream owner's"**; `P2 U-CORPUS-MIGRATION` (:1584) owes the **rollback red set** and must not re-seed
  `O0_OPERATOR_DOCUMENTS = 226`.
- **`docs/specs/design-extensions-review.md` §13.2 S1** (:1548) / **§14.5** (:1675): until P2 lands the
  local store is a **TEMPORARY authority with a recorded sunset**; the gap is recorded, never hidden, and
  **no pass may describe the cutover as already done**. **S4** (:1559): *"the prerequisites are gates, not
  tails."*

**The app-side half exists as specs and is BLOCKED on this document's set** (all SPEC, no code):
`docs/specs/unit-engine-persist.md` (**8** upstream-owed items, `§2.2` at :98, each detailed in `§3`
:142–:313; the boundary rule `§2.3` at :119; the never-patch rule `§2.4` at :131),
`docs/specs/unit-corpus-migration.md` (**`§2.3`** at :103 — the owed capability table — **`§3.2`/`§3.3`**
at :170/:242 — the exclusions and the exact id scheme; its **`§9.1`** dependency table at :856 reports
the engine leg **`FS-CM-1`-aborted**, *"This is the unit's CURRENT state for the engine leg"*, :630),
and `docs/specs/unit-authority-switch.md` (**`§2.3` HARD BOUNDARY / MUST-NOT-EDIT list** at :200).

**Layer (RCA-12, mandatory declaration for this file): DOC-LAYER only.** A request doc proves nothing at
runtime; no green in this repo at any layer can prove that the engine persists anything
(`docs/specs/unit-engine-persist.md` §10.2 :865 — the mandatory wording, and §10.3's layer table :889).

---

## 1. GROUP 1 — persistence and the write/commit contract (2 requests)

### GRQ-1 · `ENGINE-DURABLE-STORE` — the durable store (format, atomic commit, crash recovery)

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **OWED** (owned; direction recorded, unit **not authorized to start**) |
| **Priority** | **P0** — the `GN-1` ruling is unimplementable without it |
| **Symptom** | The engine server's store is **in-memory**: nothing is written to disk, so an engine-owned corpus does not survive a restart. The server constructs `Store::new()` with only `--port` in the CLI and there is **no persistence implementation — and no persistence abstraction in the crate at all**. |
| **Evidence (verified)** | `docs/specs/unit-engine-persist.md` §3.1 (:150) = O-1, citing GR-7 (`docs/feature-requests/gnosis-engine-feature-requests.md` `## GR-7`, :188) · `docs/HANDOFF.md:56` (O-7 pointer row: *"NO markdown parser, NO bulk route, NO progress contract, and NO persistence"*) · `docs/HANDOFF.md:58` · `docs/HANDOFF.md:72` (the corpus-loss condition: 226 / 6 102 / 9 266) · `docs/HANDOFF.md:78` (the durability-direction status note) · `docs/pending.md:151` (O-7 `Recorded constraints`) · `docs/specs/design-extensions-review.md` §14.1 C-1 (:1610) · `docs/requirement-catalog.md` §C.4 rows `PRUNE-807` and `PRUNE-838`. **Sibling record, cited via `docs/HANDOFF.md:78` and `docs/specs/unit-engine-persist.md` §3.1 (not re-read from this role):** `../Gnosis/docs/decisions.md` `ENGINE-DURABLE-CORPUS-DIRECTION` = **DIRECTION ONLY / NOT ACTIVE**, scope *format / atomic commit / crash recovery / store-scope revision semantics*, trigger = *the consumer's `O-8`/`SINGLE-WRITER-STORE` amendment recorded + a durability design + a scheduled consumer unit*. |
| **Requested interface (one-liner)** | A server-owned durable store with a path/config knob (env or CLI) — load-at-boot, **atomic commit** (a failed write leaves the previous revision intact: no torn store), and documented **crash recovery**. |
| **Fix shape (engine-owned)** | Implement the store the user scheduled in direction: on-disk format, atomic commit (temp+rename or a journal), crash recovery, load-at-boot, and a documented answer to *what a revision means across a restore*. Config via env/CLI; no change to the existing route set is required by this item alone. |
| **Fallback if upstream declines** | The app keeps the **local JSON store as the TEMPORARY authority** (`docs/specs/design-extensions-review.md` §13.2 S1 / §14.5) and the cutover stays fenced: `U-AUTHORITY-SWITCH` does not land, `docs/specs/unit-corpus-migration.md`'s engine leg stays `FS-CM-1`-aborted (:467/:630), and the parked row `docs/pending.md:151` (O-7) **stays PARKED with its own trigger set unchanged** (a candidate is not a fired trigger, :184). |
| **Revisit condition** | The engine records either (a) a durability design unit **scheduled/started**, or (b) a refusal. On (a), this request's shape is reconciled against the design unit's own format decisions before any consumer unit is scheduled; on (b), rows GRQ-2/GRQ-6/GRQ-7 lose their engine owner and the corpus-loss condition C-1 is restated as a permanent constraint. |

### GRQ-2 · `ENGINE-COMMIT-CONTRACT` — what a committed write returns

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **OWED** |
| **Priority** | **P0** (the client cannot make a write idempotent or report a durable commit without it) |
| **Symptom** | Even once a store is durable, the wire says **nothing about what a committed write returns** (which revision/change token the write produced) and nothing about what a **failed** write leaves behind. The document-CRUD wire carries no commit-result shape at all. |
| **Evidence (verified)** | `docs/specs/unit-engine-persist.md` §3.2 (:173) = O-2: *"the client's typed results are `Document`/`DocumentList`/`Wiki` only — `src/main/engine-crud-rag-store.ts` `CrudResult`"*; the frozen CRUD wire is the sibling `p1a-document-crud-wire.md` (cite: `docs/specs/unit-engine-persist.md` §3.2 + §14 :1040) · the one wire-visible change token is the **change cursor**, explicitly **process-lifetime monotonic**: a consumer **MUST NOT persist it across a restart** (`../Gnosis/docs/specs/engine-wire-contract.md` §4.6, pinned by `GNOSIS-CHANGE-CURSOR`; cited in `docs/specs/unit-engine-persist.md` §4.3 item 1 :444) · per-document `revision` is the concurrency token; a stale `baseRevision` surfaces `ConflictError` = 409 (`src/main/engine-crud-rag-store.ts`, `docs/specs/unit-authority-switch.md` §2.2 :181) · the app-side consequence is recorded as retry rule: **no other mutating call may be auto-retried** because the request is not idempotent without this contract (`docs/specs/unit-engine-persist.md` §5.4 :585, the ambiguous-commit rule :590). |
| **Requested interface (one-liner)** | A documented commit contract: a committed write's result **carries the assigned per-document `revision` and the commit's change token**; a rejected commit carries a **structured error** and leaves the prior revision intact — and the contract states **what the token means across a restore**. |
| **Fix shape (engine-owned)** | Document and implement the commit result on every mutating route (at minimum `create`/`update`/`delete` and the ingest of §2): the assigned revision, the commit token, and the failure shape. The **restore-semantics half belongs to GRQ-1's owner**; the cursor half to `GNOSIS-CHANGE-CURSOR`'s owner. |
| **Fallback if upstream declines** | The client keeps the conservative rule it already has: **only `createDocument`/`createWiki` retry** (bounded, on `EngineUnavailable` only) and **an ambiguous commit is never auto-retried** (`docs/specs/unit-engine-persist.md` §5.4 rows :582/:583/:585 + the pinned ambiguous-commit rule :590). The cost is explicit: no engine write can be reported as durably committed from a timeout, and no other mutating route may ever be retried. |
| **Revisit condition** | The contract is documented (either on the wire or as a refusal with reasons), or the consumer's `U-READS-PIVOT`/`U-AUTHORITY-SWITCH` passes need it to adjudicate a token — whichever the engine answers first. |

---

## 2. GROUP 2 — the health surface, the persistence self-report, and the coherence marker (2 requests)

### GRQ-3 · `ENGINE-DURABILITY-SELF-REPORT` — the health payload must say whether the store is durable

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **OWED** — and the **smallest item that unblocks the app-side half** (the one item with **no existing GR id**: its H2 row is its **GR-10 candidate**, `docs/specs/unit-engine-persist.md` §13 :997) |
| **Priority** | **P0** — without it every app probe is permanently `not-persistent` |
| **Symptom** | `/engine/status` reports `state` + **six subsystem booleans** and **says nothing about durability**. An `in-memory` engine and a durable one are **indistinguishable** to the consumer: today's engine reports `state: Ready` with `subsystems.store: true` while persisting nothing. **Any gate built on the existing report would certify an engine that loses the corpus.** |
| **Evidence (verified)** | `docs/specs/unit-engine-persist.md` §3.3 (:197) = O-3, with the app-side decoder fact: `src/main/engine-rag-store.ts` `decodeHealthReport` (:633) is total over exactly six subsystem keys — `store / graph / lexical / vector / embedding / reranker` — and no durability key; the wire contract's `HealthReport` declares the same closed set (`../Gnosis/docs/specs/engine-wire-contract.md` `## 9. status.rs — health`, cited at `docs/specs/unit-engine-persist.md` §14 :1039) · the live condition is recorded in `docs/HANDOFF.md:72` and `docs/specs/design-extensions-review.md` §14.1 C-1 (:1610) · **load-bearing for the unit:** `docs/specs/unit-engine-persist.md` §3.3's closing reason (:217) and §15 item 1 (:1091) — the app-side classifier's `healthy` state is **unreachable** until this lands, so the refusal contract can never be exercised green. |
| **Requested interface (one-liner)** | An **additive top-level `durability` field** on the health payload with a closed, **truth-telling** value set — `'durable' | 'in-memory'` (plus `'disabled'` if a store can be present-but-disabled) — reported truthfully: **an in-memory store must NOT report durable**. |
| **Fix shape (engine-owned)** | Add the field to the status payload; keep it **additive** (the app's decoder reads the keys it knows and rejects none, so no existing consumer breaks). The **health-report owner** implements it; the durability design unit (GRQ-1) is **co-owner**, because the report must reflect the store the design lands. |
| **Fallback if upstream declines** | The app's reading is **fail-closed** and stays correct-but-blocked: any value other than the exact string `'durable'` — an unknown string, a non-string, or an **absent field** — classifies `not-persistent` with cause `durability-absent` (`docs/specs/unit-engine-persist.md` §4.1 rows 5–7 :386 + §15 item 1 :1091). Consequence, stated plainly: the app **can never open a wiki through the engine path**, and `U-ENGINE-PERSIST` is “spec-pinned but permanently unschedulable” in that respect (§3.3 :217). The launcher keeps its `--require-durable=auto` default: field absent ⇒ loud warning + continue, not a hard gate (`§6.5` item 4 :692). |
| **Revisit condition** | The field appears in the payload (then the app-side classifier's `healthy` path becomes reachable and the P2 unit can run its live battery), **or** the engine confirms it will never report durability — in which case the app's refusal becomes permanent and the boot-wide decision is handed back to `U-AUTHORITY-SWITCH`. |

### GRQ-4 · `ENGINE-SNAPSHOT-REVISION-MARKER` — the cache-coherence marker on the snapshot payload

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) — see **ownership, stated because it is disputed**: the marker is a **prerequisite of `U-READS-PIVOT`** and its **engine-side shape is owned by the engine's cursor owner**; the **seam it rides is host-side** (`RagSnapshotPayload`, `src/shared/types.ts` `IPC_RAG_SNAPSHOT` :480, interface :481 — `{store, nodes, edges}`, **three** fields, `revision` **absent**). |
| **Status** | **REQUESTED** (the engine's own record has **ruled against** the naive revisioned framing — §6(a); this request asks for the marker in whatever token the engine will honour) |
| **Priority** | **P1** — `docs/specs/design-extensions-review.md` §14.4 (:1657) pins it as **a PREREQUISITE of `U-READS-PIVOT`** |
| **Symptom** | The consumer's tab-open fetch is built on a snapshot seam **that carries no coherence marker**, so **the app cannot tell a stale snapshot from a fresh one** — a cache cannot be made coherent without a revision/marker. |
| **Evidence (verified)** | `src/shared/types.ts` `RagSnapshotPayload` (:481) declares exactly `store`/`nodes`/`edges` — **read this pass** — so **`revision` is OWED**; `docs/specs/design-extensions-review.md` §14.4 (:1657) records the correction + the pin (§14.4's own pin: *"the revision field (or an equivalent marker) is a PREREQUISITE of `U-READS-PIVOT`, and §11.5's 'what it does NOT decide' records it"*) · the engine-side route is **GR-4** (`docs/feature-requests/gnosis-engine-feature-requests.md` :101), whose inbound review **reframes the read as paginated cursor-tagged pages and refuses the revisioned-projection framing** (§14.4 :1667–1668, `PRUNE-804`) · the engine's wire contract **refuses** `GET /snapshot?revision=…` and a `stale_revision` error (`../Gnosis/docs/specs/engine-wire-contract.md` §4.6, cited at `docs/specs/unit-engine-persist.md` §3.7 :281) · the parked consumer design (`RagSnapshotPayload {nodes, edges, store, revision}` + a stale-drop rule) is recorded in `docs/HANDOFF.md:74` · **`SNAPSHOT-REVISION-AUTHORITY` remains OWED** (`docs/specs/gnosis-offload-review.md` §11 item 3 :563, which states the `revision` field + stale-drop implementation stay owed). |
| **Requested interface (one-liner)** | **One monotonic marker on the snapshot/projection payload** — either the engine's real cursor or a store-scope revision — with the consumer's stale-drop rule restated in **that** token's terms, plus the documented meaning of a **token repeat across a restart**. |
| **Fix shape (engine-owned)** | Settle the token question **once**, with the consumer: (a) a bulk projection route whose coherence token is the engine's **real cursor**, with paginated cursor-tagged pages + a resume token and the not-comparable-cursor behaviour pinned; **or** (b) a documented position on why a revision is required. **No `stale_revision` wire code** if the answer is the cursor (`docs/HANDOFF.md:74`). |
| **Fallback if upstream declines** | The app keeps the **whole-store snapshot pull over IPC into its own traversal build** (what it runs today; `PRUNE-804`'s recorded local hedge) and `U-READS-PIVOT` stays **blocked on its marker** — the read model's cache cannot be made coherent, so the P2 read-pivot unit is not schedulable. The `revision`/marker item stays parked exactly as `docs/specs/gnosis-offload-review.md` §11 item 3 (:563) records it: **OWED**, not dropped. |
| **Revisit condition** | The engine answers the token question (cursor or revision, with the restart semantics), or the consumer's `U-READS-PIVOT` spec is written and names the marker it will accept — which then becomes this request's acceptance shape. |

---

## 3. GROUP 3 — bulk ingest (2 requests)

### GRQ-5 · `ENGINE-BULK-INGEST` — bulk/batch-atomic ingest with progress, cancellation and a cap

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **OWED** (GR-6; the parked destination's core row) |
| **Priority** | **P1** — gates the engine destination leg of `U-CORPUS-MIGRATION` |
| **Symptom** | The engine has **no bulk/batch-atomic ingest route, no progress contract and no cancel**, so a corpus cannot be handed over as one atomic unit with observable progress. |
| **Evidence (verified)** | `docs/specs/unit-engine-persist.md` §3.4 (:222) = O-4 · GR-6 (`docs/feature-requests/gnosis-engine-feature-requests.md` :158) · `docs/HANDOFF.md:56` (*"the shell's single atomic `applyBatch` + its 512-file fail-loud cap + the one-shot `IPC_IMPORT_RESULT` all have no engine equivalent"*) · `docs/pending.md:151` (O-7 constraints cell) · `docs/specs/unit-corpus-migration.md` §2.3 (:108) and §4.4 (:446 *"The engine leg's progress/cancel contract does NOT exist and is OWED UPSTREAM"*) · the shell-side-only surfaces are `src/main/markdown-import.ts` (`applyBatch`, `MAX_IMPORT_FILES = 512`) with the broadcast shape `ImportResultPayload` (`src/shared/types.ts`, `IPC_IMPORT_RESULT`) · `docs/requirement-catalog.md` §C.4 rows `PRUNE-806`, `PRUNE-819` · the engine's route set today is `/rag/query`, `/rag/stream`, `/engine/status` (+ the document/wiki CRUD routes) — the app's engine client names exactly three retrieval endpoints and no ingest path (`src/main/engine-rag-store.ts` `ENGINE_ENDPOINTS` :76, **read this pass**), and `docs/HANDOFF.md:54` records the 9 probed enrichment/traversal paths answering **404**. |
| **Requested interface (one-liner)** | `POST /import` accepting `{files:[paths]}` (server-fixed corpus root) **or** `{markdown:[{documentId, text}]}`, with progress + cancellation and a structured over-cap result. |
| **Fix shape (engine-owned)** | The whole corpus commits as **one journal entry or nothing**; a **cap** with a fail-loud structured result (`{ok:false, reason:"cap-exceeded", cap:N}`); **progress + cancellation** (chunked commits or an SSE progress stream) where **cancellation leaves no partial commit** — the pinned requirement the consumer imposes is a **monotonic progress marker** (documents applied / total) and a **`cancelled` terminal state** whose abort is atomic (`docs/specs/unit-corpus-migration.md` §4.4 :463–467: *"cancel ⇒ whatever landed stays landed" is forbidden*); plus the **document path/segment model** carried on ingest. |
| **Fallback if upstream declines** | The shell keeps its own path: the single atomic `applyBatch` + the 512-file fail-loud cap + the one-shot `IPC_IMPORT_RESULT`, and the migration's engine leg stays `FS-CM-1`-aborted with the `blocked` list **naming every missing capability** (`docs/specs/unit-corpus-migration.md` :467, the exact four-element list; :630 *"This is the unit's CURRENT state for the engine leg"*). `docs/pending.md:151` (O-7) stays PARKED. |
| **Revisit condition** | An ingest route exists with an atomicity + progress/cancel contract, then `U-CORPUS-MIGRATION`'s engine leg can be re-planned against it; or the parked row's trigger set (a)/(b)/(c) fires (`docs/pending.md:156`). |

### GRQ-6 · `ENGINE-INGEST-RECORD-COPY` — accept host-authored records with **caller-supplied ids**

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **OWED — and NOT YET FILED anywhere else** (`docs/specs/unit-corpus-migration.md` §2.3 :110 records it as owed and unfiled; §9.1 :863 repeats it) |
| **Priority** | **P1** — without it the migration **cannot honour id preservation**, which is a stated obligation |
| **Symptom** | The owed ingest shapes (GRQ-5) accept **markdown the engine parses itself**. A parser-side ingest **re-mints ids**, so a migrated corpus would be **a different corpus** — every edge endpoint, `documentIds` entry, `ownedNodeIds` declaration and `documentPath`/`tags` row silently orphaned. The engine has **no route that accepts host-authored records with caller-supplied ids**. |
| **Evidence (verified)** | `docs/specs/unit-corpus-migration.md` §2.3 row 4 (:110: *"derived from O-7's gap statement + obligation **O2** … this request is **not yet filed** and §9.1 records it as owed"*) · §2.1 obligation **O2** (:79, *"No id is re-minted"*) · §2.4 (:124) — the three verified reasons `importMarkdownCorpus` cannot be the route (it re-mints every id; it drops record-level fields; its `nodeCount`/`edgeCount` are the batch size) · §3.3 (:242) — `DECISION-CORPUS-MIGRATION-ID-PRESERVATION`, incl. the prefix-applied-once rule and the `n-${randomUUID()}` verbatim case · §9.1's dependency table row 4 (:863) · GR-6's own scoping (`docs/feature-requests/gnosis-engine-feature-requests.md` :158–:187) covers parse-and-validate, not record copy. |
| **Requested interface (one-liner)** | A route accepting **host-authored records** — nodes/edges with **caller-supplied ids** (and their hashed fields: `nodeKind`, `children[]` with `offset`, `documentPath`, `tags`, `props`, `ownedNodeIds`, `edgeType`, `state`, `order`, `documentIds`, `createdAt`/`updatedAt`) — committed atomically, **never re-parsed and never re-minted**. |
| **Fix shape (engine-owned)** | Extend the ingest surface (or add a sibling route) that takes records rather than files: caller-supplied ids are preserved **byte-identically**; referential integrity is the caller's obligation but the route must reject a dangling endpoint loudly; the whole copy is one atomic commit (`GRQ-5`'s atomicity contract applies unchanged). **The prefix question is the consumer's** (§3.3 — the `<name>:` mapping is reproduced as a mapping, not re-derived by a parser). |
| **Fallback if upstream declines** | The corpus can only be carried **by re-import**, which is a **different corpus** — so the migration's id-preservation obligation (O2) is abandoned and the whole cutover is re-opened as a new proposal (a re-mint changes the census, orphans every reference and would re-seed the operator store, which §3.6 F.3 item 9 forbids). The reference target remains the **host-side JSON store** (`§2.4`), which **does** honour O2, and the engine leg stays `FS-CM-1`. |
| **Revisit condition** | The route exists (then §3.3's prefix mapping is exercised against it), or the engine refuses record copy — in which case the consumer must re-rule on whether a re-minted corpus is acceptable, which is a **user** decision, not a spec liberty. |

---

## 4. GROUP 4 — the query route and the document-CRUD wire gaps (3 requests)

### GRQ-7 · `ENGINE-QUERY-MODE-TOP-K` — `POST /rag/query` must honour `mode` and `topK`

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **OWED** — an existing engine-side defect row; **cited, never duplicated** (`docs/defects.md` `GNOSIS-ENGINE-QUERY-MODE-IGNORED`, **OPEN**, row at `docs/defects.md:71`, and indexed in `docs/HANDOFF.md:52`) |
| **Priority** | **P1** — the parked O-6 row's own blocker list |
| **Symptom** | The engine's `POST /rag/query` **drops the caller's retrieval `mode` and `topK`**: `Flat`/`Vector`/`Graph`/`Hybrid` return **byte-identical** results with a `Flat` trace and `top_k: 10`. (The SSE `GET /rag/stream` path **does** honour both — the two legs exist; only the POST path loses them.) |
| **Evidence (verified)** | `docs/defects.md:71` (`GNOSIS-ENGINE-QUERY-MODE-IGNORED`, live repro with the exact scores and the four-mode equality) · `docs/HANDOFF.md:52` (the handoff row repeating the sibling-repo symbol: `../Gnosis/src/bin/gnosis_server.rs` `rag_query_handler` vs `rag_stream_handler`, the fix shape already in the same file) · `docs/pending.md:150` (O-6's blocker list) · `docs/specs/design-extensions-review.md` §14.1-adjacent blocker set is restated at `docs/pending.md:154` (*"O-6 has NO P2 counterpart — the query route stays blocked by `HOST-ENGINE-QUERY-POST-NO-ENVELOPE` + `GNOSIS-ENGINE-QUERY-MODE-IGNORED` + result-shape parity"*). **The live reading is the defect row's, not re-run here.** |
| **Requested interface (one-liner)** | In `rag_query_handler`, map `payload.mode`/`payload.topK` into `RagQueryOptions` exactly as `rag_stream_handler` already does. |
| **Fix shape (engine-owned)** | Mirror the SSE handler's mapping (the fix shape already exists in the same file); keep the trace's `mode`/`top_k` faithful to the request. |
| **Fallback if upstream declines** | The app's engine query path serves **flat-only** retrieval over POST; the graph/vector/hybrid legs stay reachable **only** over SSE (`GET /rag/stream`), and the parked O-6 row (`docs/pending.md:150`) **stays PARKED** — its blocker list is unchanged by a refusal, and `docs/pending.md:154` records that **O-6 has no P2 counterpart**. |
| **Revisit condition** | `mode`/`topK` are honoured over POST (then the O-6 blocker list loses one entry and it is re-read), or the engine documents that POST is deliberately flat-only (then the consumer's parity goal is restated as SSE-only). |

### GRQ-8 · `ENGINE-QUERY-RESULT-SHAPE-PARITY` — `ranked/context/markdown/lineMap/k` on the engine's answer

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **REQUESTED** (the consumer's parity ask; the engine's answer today is a **proxy-specific** result shape by consumer decision) |
| **Priority** | **P2** — the third entry in the parked O-6 blocker list |
| **Symptom** | The engine's query answer **carries none of the consumer's result fields** — `ranked`/`context`/`markdown`/`lineMap`/`k` are missing engine-side, so engine results cannot feed the consumer's ranked-result render path or its line-map consumers without a translation layer. |
| **Evidence (verified)** | `docs/pending.md:150` (O-6: *"result-shape parity (`ranked/context/markdown/lineMap/k` are missing engine-side)"*) · `docs/pending.md:154` (O-6 has no P2 counterpart and the parity gap is one of its three blockers) · the consumer-side decision that **keeps the two shapes distinct today**: `DECIDED: ENGINE-RAG-RESULT-TRACE` (`docs/decisions.md` row, cited at `docs/specs/unit-gn-engine-integration.md` :1123 / §5.2 :374) — *"The wire body carries none of the local fan-out's `ranked`/`context`/`markdown`/`lineMap`/`k` fields … The proxy therefore returns the proxy-specific `EngineRagResult`"* · the consumer's render separation is asserted in the landed spec `docs/specs/unit-gn-mcp-ui-wiring.md` `P-TP-3` (:613) and in the battery `docs/specs/unit-gn-mcp-ui-wiring-live-pending-battery.md` (S6 :177, S34 :202) · the local shape's own definition: `src/main/retrieval.ts` `RagQueryResult` (`{query, ranked, context, markdown, lineMap, k}`, per `docs/specs/unit-ms2-store-wiring.md` :779) · the proposal-level statement is `docs/specs/gnosis-offload-proposal.md` :129. |
| **Requested interface (one-liner)** | Either the engine returns the **parity block** (`ranked`/`context`/`markdown`/`lineMap`/`k`, defined per the consumer's contract) or it documents that the parity is the **consumer's** translation duty — the answer must be explicit, because the parked row's trigger reads on it. |
| **Fix shape (engine-owned)** | If the engine will emit parity: define `ranked` (ordered hits with id+score) and `lineMap` (the line→node map) on the wire, and add `context`/`markdown`/`k`; reuse the consumer's pinned semantics as the reference (`docs/specs/unit-x-rag-provenance-traversal.md` §4, `docs/specs/unit-f2-result-qualification.md` §4) rather than inventing a third vocabulary. If it will not: a one-paragraph documented refusal naming the translation owner. |
| **Fallback if upstream declines** | The consumer keeps the **proxy-specific `EngineRagResult`** and its distinct render path (`DECIDED: ENGINE-RAG-RESULT-TRACE`, `unit-gn-mcp-ui-wiring.md` `P-TP-3`) — engine queries render in the dedicated `gnosis-query` pane and **never** feed the local `ranked` render path. The parked O-6 row stays PARKED and the parity gap stays recorded in its blocker list. |
| **Revisit condition** | The engine emits parity (then the O-6 blocker list is re-read and the translation layer can be retired as its own unit), or it refuses in terms (then the O-6 row's third blocker becomes a **permanent** consumer-side translation duty and `docs/pending.md:150` is re-read accordingly). |

### GRQ-9 · `ENGINE-CRUD-WIRE-DOC` — document the document-CRUD wire's remaining gaps (and who owns each)

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) for the documentation half — **the envelope fix itself is HOST-side** (§6(b)) |
| **Status** | **REQUESTED** (documentation; the envelope requirement is recorded as **intentional and final** on the engine side, `docs/HANDOFF.md:76`) |
| **Priority** | **P2** |
| **Symptom** | The consumer's engine client is a **11-method CRUD proxy** (`docs/specs/unit-engine-persist.md` §12 :957 — 7 mutating / 4 read-only) and its read methods issue a **GET-with-a-body** that **Node/undici rejects** and Electron/Chromium permits — a **transport-RUNTIME divergence** the app adjudicates in-app, not a wire defect. Meanwhile the POST query path's **envelope requirement** is final on the engine side, so the consumer's bare-body POST is a **consumer defect**. Both halves are recorded, but the **engine's side of the divergence is not documented in one place**. |
| **Evidence (verified)** | `docs/HANDOFF.md:76` (GR-inventory row, delta (a): *"the envelope requirement is **intentional and final** on the engine side, so the consumer's bare-body POST is a **consumer defect already recorded here** (`docs/defects.md` `HOST-ENGINE-QUERY-POST-NO-ENVELOPE`); the engine's residual obligation is only the structured-JSON decode-error body"*) · the consumer defect rows, **cited not duplicated**: `docs/defects.md:68` (`HOST-ENGINE-QUERY-POST-NO-ENVELOPE`, OPEN) and the host-side GET-with-body finding `docs/HANDOFF.md:143–150` (recorded as a HOST confirm-in-app item, `HOST-GET-WITH-BODY-SSE-CRUD`, **NOT** a handoff item) · the frozen CRUD wire is the sibling `p1a-document-crud-wire.md` (cited at `docs/specs/unit-engine-persist.md` §14 :1040) · `docs/specs/unit-engine-persist.md` §3.2 (:179) records that no commit-result shape exists on this wire (that is GRQ-2). |
| **Requested interface (one-liner)** | One documented paragraph in the engine's CRUD wire spec naming, per read route, **whether a GET-with-a-body is supported** and **what a decode error returns** (a structured JSON body, not `text/plain`). |
| **Fix shape (engine-owned)** | Documentation only: state the envelope requirement per route (it is already final), state the GET-with-body posture explicitly, and return a **structured JSON decode-error body** so the consumer can stop masking a deterministic 400 as a JSON-parse failure. **No enforcement change is requested.** |
| **Fallback if upstream declines** | The app keeps the two host-side adjudications it already has and keeps its own error mapping (`src/main/engine-transport.ts` `createCrudFetch` for GET-with-body; the consumer-side envelope fix for POST). The `HOST-GET-WITH-BODY-SSE-CRUD` finding stays a **confirm-in-app** host item, and `HOST-ENGINE-QUERY-POST-NO-ENVELOPE` stays the recorded consumer defect until its own fix lands here. |
| **Revisit condition** | The wire doc states the per-route posture (then the consumer's client can be written against it without a trial-and-error pass), or the engine restructures the read routes so the divergence disappears — either answer closes this request. |

---

## 5. GROUP 5 — markers and notifications (2 requests)

### GRQ-10 · `ENGINE-CHANGE-NOTIFICATION` — the store-change notification route (GR-5)

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) |
| **Status** | **REQUESTED** — **and the request is known to collide with the engine's own ruled shape**; the disagreement is recorded in §6(a), never smoothed over |
| **Priority** | **P1** — `DN-1` (the doc-nav auto-update row) is PARKED on it |
| **Symptom** | With an engine-owned store the app has **no trigger to re-traverse**, so its rendered envelope goes stale with **no contract**: there is no monotonic change marker and no documented staleness contract to listen to. |
| **Evidence (verified)** | `docs/specs/unit-engine-persist.md` §3.6 (:256) = O-6 · GR-5 (`docs/feature-requests/gnosis-engine-feature-requests.md` :135) · `docs/HANDOFF.md:74` (the notification-route row: the request's assumed `{kind, nodeIds, edgeIds, revision}` frame + the collision, and the three things the consumer actually needs) · `docs/HANDOFF.md:58` (O-8 pointer row: notification + adjacency + single-writer contract) · `docs/pending.md:152` (O-8 `Recorded constraints`) · `docs/specs/design-extensions-review.md` §12.7(e)'s `DN-1` park (cited at `docs/specs/unit-engine-persist.md` §3.6 :262) · `docs/requirement-catalog.md` §C.4 row `PRUNE-805` (:891 — *"re-shaped to an opaque change cursor rather than a revision"*) and row `PRUNE-624` (:857 — the document pane row **PARKED on GR-5**, *"the park reason is recorded here so the row is never read as absent behavior"*) · the engine's own cursor discipline is `../Gnosis/docs/specs/engine-wire-contract.md` §4.7 (`GET /changes`, staleness/reconnect contract) and §4.6 (process-lifetime monotonic), cited at `docs/specs/unit-engine-persist.md` §14 :1038. |
| **Requested interface (one-liner)** | A poll route or an SSE feed streaming change frames **with a monotonic token per frame**, **plus a documented staleness contract** (what a consumer may assume between a write and its notification, and what a token repeat across a restart means for a cache). |
| **Fix shape (engine-owned)** | The route **as the engine rules it** — cursor-bearing, **no `stale_revision` wire code** — with: (1) a cursor-first frame on every connection; (2) frames may be lost (not a durable log); (3) the **ids/kind** the GR-5 acceptance presumes on the journal entry, which the engine's `JournalEntry` shape does **not** carry today; and (4) the staleness contract in terms (`docs/HANDOFF.md:74`'s three asks). |
| **Fallback if upstream declines** | The app's **own main-process store-change broadcast** remains the coherence trigger for the local (temporary-authority) store, and **`DN-1` stays PARKED with its GR-5 reason** (`PRUNE-624` :857, `docs/specs/unit-engine-persist.md` §3.6 :262). The rendered envelope is re-derived on explicit user action only; no staleness contract is claimed. |
| **Revisit condition** | A notification route exists (then `DN-1` is re-read against its shape and the stale-drop rule is restated in the returned token's terms), or the engine refuses — in which case `DN-1`'s park reason is restated as permanent and the read model's coherence story is handed to `U-READS-PIVOT` as an explicit non-goal. |

### GRQ-11 · `ENGINE-CURSOR-RESTART-SEMANTICS` — what a change token means across a restart

| Field | Content |
| --- | --- |
| **Target project** | the Gnosis engine (`../Gnosis`) — the `GNOSIS-CHANGE-CURSOR` owner, co-owned with the durability unit (GRQ-1) for the restore half |
| **Status** | **OWED** (the discipline is pinned; its **cross-restart meaning is unstated**) |
| **Priority** | **P1** — the consumer's cache rules are written against this answer |
| **Symptom** | The engine's one wire-visible change token is **process-lifetime monotonic**: it **may repeat across restarts until a durable store exists**, and a consumer **MUST NOT** persist it and compare it to the next process's cursor. The consumer therefore cannot use the token for anything across a restart — and whether that changes **once a durable store exists** (GRQ-1) is **not stated**. |
| **Evidence (verified)** | `docs/HANDOFF.md:74` (ask (2): *"what a cursor repeat across a restart means for a consumer's cache"*) · `docs/HANDOFF.md:78` (the durability-direction note: the direction is **not authorized**, and this document asks the engine to record which half of the trigger is now satisfied so the two sides' trigger texts do not drift) · `docs/specs/unit-engine-persist.md` §3.2 (:184) and §4.3 item 1 (:444) (the consumer's pinned reading: cache in memory, **never** persist a token, **never** compare across a restart) · the same rule pinned as a fail-state on this side: `docs/specs/unit-engine-persist.md` `FS-22` (§9 :828) · the cursor's scope is documented engine-side as **cache invalidation / resync / de-dup only** — *"explicitly not valid for cache validation, optimistic concurrency or state reconstruction"* (`docs/HANDOFF.md:74`) · `docs/requirement-catalog.md` §C.4 `PRUNE-805` (:891) and `PRUNE-807` (:893). |
| **Requested interface (one-liner)** | A one-paragraph statement of the cursor's **meaning across a restart**: whether it stays process-lifetime monotonic after a durable store lands, and what an equal/lesser token after a restart means to a consumer's cache. |
| **Fix shape (engine-owned)** | Documentation (the token's semantics), not a new route: the answer is a clause in the wire contract's §4.6 next to the existing refusal of `GET /snapshot?revision=…`. If the answer changes once durability lands, it is stated **with** GRQ-1's design. |
| **Fallback if upstream declines** | The consumer's rule stands **as-is and permanently**: the token is held **in memory for the process lifetime only**, never persisted, never compared across a restart (`docs/specs/unit-engine-persist.md` §4.3 item 1 / `FS-22`). A refusal costs the consumer nothing it has today — it only means the cache can never use a token across a restart, which is already the pinned reading. |
| **Revisit condition** | The semantics are stated, or a durable store lands (GRQ-1) — at which point the question is re-asked with the store's restore behaviour known. |

---

## 6. RECORDED DISAGREEMENTS (stated, never silently adjudicated by this document)

**(a) The coherence token: `revision` vs an opaque cursor — the two records contradict each other.**
`docs/specs/design-extensions-review.md` **§14.4** (:1657, :1671) pins that the `revision` field *"or an
equivalent marker"* is a **PREREQUISITE of `U-READS-PIVOT`** and treats GR-4's revisioned
projection-snapshot route as the read model's transport (`docs/specs/design-extensions-review.md` §13.3's
P2 obligations name it). The **engine's own inbound verdict** — cited at `docs/HANDOFF.md:76` and
reflected in `PRUNE-804`/`PRUNE-805` — **refuses** the revisioned projection framing and re-shapes GR-5 to
an **opaque change cursor**, because there is **no consumer-visible store-wide revision**, the derived-index
`epoch` bumps on propagation/state-annotation mutations (phantom changes), and `SHARDED-RWLOCK-STORE`
means no point-in-time read across shards. **This document does not choose between them.** GRQ-4 therefore
asks for *"one monotonic marker — cursor or revision"* and GRQ-10 asks for the route *as the engine rules
it*; the adjudication is owned by **`U-READS-PIVOT`** (`docs/specs/unit-engine-persist.md` §4.3 item 4 :453:
*"OPEN QUESTION, recorded not resolved"*) and by the engine's cursor owner. **Both records are cited; neither
is overridden.**

**(b) GR-9 / O-8: who owns the machine-caller authority contract — OWED to the engine, or REFUSED by it?**
`docs/specs/unit-engine-persist.md` **§2.2** (:112) lists **O-8** = *"the machine-caller authority contract
(documented, with its denial code)"*, owned by **GR-9**, and **§3.8** (:297) files it as an upstream-owed
item with an AGENTS.md item-7 row (`docs/HANDOFF.md` §13 row **H3**, :992). The **engine's side REFUSES it
as an engine deliverable**: *"GR-9 is REFUSED as an engine deliverable (the authorization gate stays in the
SHELL — do not author an engine authority contract)"* (`docs/HANDOFF.md:76`, reading
`../Gnosis/docs/specs/gnosis-gr-inbound-review.md`'s verdict table), and `docs/requirement-catalog.md`
§C.4 `PRUNE-809` (:895) carries the same tension inside one row — *"Owning project: **Gnosis engine** (the
request's target) — the engine's own gate record refuses it as an engine deliverable and places the
authorization gate in the shell"* — with a recorded local hedge (the shell's fail-closed authority
mapping). **This document does not pick a winner and files no GRQ row for it.** What it records: the
consumer's H3 row and `PRUNE-809` say **OWED to the engine**; the engine's inbound verdict says **REFUSED,
shell-owned**; the item is marked **"Informational for this unit"** by `docs/specs/unit-engine-persist.md`
§3.8 (:311) and is a prerequisite of any engine **write** path, not of the client seam. **Reconciliation is
owed to a pass with authority in both repos** (the consumer's tracker cannot adjudicate the sibling's
verdict, and this pass has no shell and does not touch `../Gnosis`).

**(c) A third, adjacent tension, recorded for the same reason (not a request):** the durability **direction**
is recorded as **DIRECTION ONLY / NOT ACTIVE** with a trigger, while the consumer's P2 program schedules
`U-ENGINE-PERSIST` and the parked pointers assert **no new trigger** (`docs/HANDOFF.md:78`;
`docs/pending.md:154`). The resolution asked for is **documentary only**: that the engine's next read of its
trigger records which half is now satisfied (the ownership half **is** recorded on this side via
`DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`; the `O-8`/`U-AUTHORITY-SWITCH` half **remains owed**), so the
two sides' trigger texts do not drift apart. **No go-ahead is claimed by this document.**

---

## 7. NOT AN ENGINE REQUEST — the O-0 `snapshot.clone` parked row (recorded so it is not misread)

`docs/pending.md:104` (row **"O-0 `snapshot.clone` — the main-side transport channel"**) names itself
*"its own unit (an engine/host seam, its own spec + red set per RCA-2, its own gate)"*, and the task context
that produced this document referred to it as an O-0/S-snapshot-clone row. **It is NOT an engine-handoff
item and no GRQ id is minted for it**: it is a **HOST-side** main→renderer channel (the main recorder's
records out of the main process), parked by **user DEC-1** (`docs/decisions.md`
`O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED`), whose constraint is that every O-0 report keeps showing
`status:"OPEN-structural"` and that no unit quotes the `post.style` residual as a style/layout number.
**Recorded here for completeness and to prevent a later pass from filing it upstream by mistake.** The
`docs/defects.md` side of it (`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`,
`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`) stays where it is, untouched.

---

## 8. Census (readings and counts of this document, never claims about the engine)

| Item | Figure | Status of the figure |
| --- | --- | --- |
| Requests in this document | **11 `GRQ-n` ids** | counted off the section headings: Group 1 **2** (GRQ-1, GRQ-2) · Group 2 **2** (GRQ-3, GRQ-4) · Group 3 **2** (GRQ-5, GRQ-6) · Group 4 **3** (GRQ-7, GRQ-8, GRQ-9) · Group 5 **2** (GRQ-10, GRQ-11) = **11** |
| Groups | **5** | §1 persistence/commit · §2 health + coherence marker · §3 ingest · §4 query + CRUD wire · §5 markers/notifications |
| Upstream-owed (`OWED`) | **7** | GRQ-1, GRQ-2, GRQ-3, GRQ-5, GRQ-6, GRQ-7, GRQ-11 |
| Requested (`REQUESTED`) | **4** | GRQ-4, GRQ-8, GRQ-9, GRQ-10 |
| `P0` / `P1` / `P2` split | **3 / 6 / 2** | P0: GRQ-1, GRQ-2, GRQ-3 · P1: GRQ-4, GRQ-5, GRQ-6, GRQ-7, GRQ-10, GRQ-11 · P2: GRQ-8, GRQ-9 |
| Recorded disagreements | **2** (+1 adjacent note) | §6(a) revision-vs-cursor · §6(b) GR-9/O-8 ownership · §6(c) the durability trigger text |
| Non-engine rows recorded | **1** | §7 (the O-0 `snapshot.clone` host-side park) |
| The app-side items this set blocks | **8 owed items + 9 app-side deliverables** | `docs/specs/unit-engine-persist.md` §2.1 :84 / §2.2 :98 (the counted split **9 · 8 · 17**, §12 :945) |
| The corpus at stake | **226 documents / 6 102 nodes / 9 266 edges** | a **reading** (`docs/specs/design-extensions-review.md` §14.1 C-1; `O0_OPERATOR_DOCUMENTS = 226`, `src/shared/o0-report.ts`) — **never re-seeded** |
| Existing engine-side defect rows cited | **2 OPEN** | `docs/defects.md:71` `GNOSIS-ENGINE-QUERY-MODE-IGNORED` · `docs/defects.md:69` `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` (cited, never duplicated; **no new row filed by this pass**) |
| Source enumerations this set collects (never invents) | **6** | `docs/specs/unit-engine-persist.md` §2.2/§3 · `docs/specs/unit-corpus-migration.md` §2.2/§2.3/§3.2/§3.3/§9.1 · `docs/specs/unit-authority-switch.md` §2.3 · `docs/pending.md` §"PARKED DESTINATION" + §PARKED · `docs/specs/gnosis-offload-review.md` §11 · `docs/specs/design-extensions-review.md` §13/§14.1/§14.4 |
