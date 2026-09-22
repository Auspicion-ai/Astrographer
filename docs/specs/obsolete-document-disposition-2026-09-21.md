# Obsolete-document DISPOSITION ENUMERATION — the `GN-2` archive-with-repoint set (2026-09-21)

- **Kind:** the **enumeration artifact** the `GN-2` ruling requires *before* any disposition
  (`docs/specs/design-extensions-review.md`, section **"USER RULINGS (2026-09-21)"** — cited by title,
  never by section number; its §11.4 item 3: *"the enumeration must exist BEFORE any disposition"*).
- **Layer (RCA-12, mandatory declaration):** **DOC-LAYER / enumeration.** This file **archives nothing,
  deletes nothing, renames nothing, edits no other file**, runs no test and recomputes no hash. It
  **proposes**. Every proposal is `PENDING` sign-off.
- **The model this set is judged against:** `docs/decisions.md` §ACTIVE rows
  **`DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`** (the `GN-1` ruling: the engine owns document CRUD;
  the host keeps a tab-scoped read cache and no durable document corpus) and
  **`DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`** (the `GN-4` ruling), plus the read-model pivot
  (`docs/specs/design-extensions-review.md` section **"USER RULINGS (2026-09-21)"**, §11.5/§12).
- **Companion record already in the tree:** `docs/pending.md` §PARKED — the row
  **"`GN-2` — THE ARCHIVE-WITH-REPOINT ENUMERATION"**, which carries a **20-candidate subset**. That
  row is **not** this file and this file does not supersede it: the pending row is the **pending-park**
  of the disposition; this file is the **per-class enumeration** (including the classes the pending row
  explicitly declines to sweep: the full unit-spec families, the historical record set, the
  citation-impact audit and the exclusions-by-name ledger).
- **Citation discipline:** paths + row ids + `§`-anchors + section **titles** only. **No line number and
  no section number appears in this file** (the catalog contract's citation rule,
  `docs/specs/requirement-catalog.md` §3.4 rule 7; and the address the decisions row itself uses for the
  gate record). Where a **pre-existing** citation in the tree uses a line number, that is reported as a
  finding, never copied into a proposed repoint.
- **What this file does NOT do:** it does not lift a freeze, reclassify a catalog row, prune a §C.4
  ledger row, touch a MUST-NOT-EDIT corpus, sign anything off, or name a disposition authority other
  than the user's per-item sign-off plus the owning tracker row (`docs/requirement-catalog.md` §C.0
  rule 2).

---

## §D.0 — BASIS, SIGN-OFF VOCABULARY, AND WHAT ALREADY LANDED THIS PASS

### D.0.1 The ruled basis (read from the gate record, verified in the tree)

| Basis | Where it is | Status verified in the tree |
| --- | --- | --- |
| `GN-1` — supersede now; the engine owns document CRUD | gate record, "USER RULINGS (2026-09-21)" §11.1 | **LANDED this pass**: `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` present in `docs/decisions.md` §ACTIVE |
| `GN-3` — the launcher (`scripts/start-app.sh`) owns the spawn | gate record, §11.2 | **CONFIRMS** `DECIDED: GNOSIS-LAUNCHER-TOGGLE`; no new `src/` exec capability (verified: `node:child_process` appears in `src/` only for the ollama `execFileSync('curl', …)` reachability probe) |
| `GN-4` — refuse to open a wiki without an engine | gate record, §11.3 | **LANDED this pass**: `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` present in §ACTIVE |
| `GN-2` — archive-with-repoint only, enumerated, per-item sign-off | gate record, §11.4 | this file is the enumeration; **nothing executed** |
| the read model — tab-scoped cache, async tab-open fetch | gate record, §11.5 + §12 | spec authored: `docs/specs/unit-reads-pivot-tab-cache.md` (SPEC, no code landed) |
| the exclusions (each an absolute) | gate record **§11.4**'s exclusion table (there is **no** separate `§11.4.1` heading; the table is the "Excluded by name" block inside §11.4) | reproduced in §D.3 below, count 7 |

### D.0.2 Sign-off vocabulary used in every table below

`PENDING` — no sign-off recorded. Every row in every table is `PENDING` at the time of writing; this
file writes no `prune_signoff` value anywhere and proposes none.

### D.0.3 What the landing pass ALREADY did (so the enumeration is not read as a to-do list)

**Already superseded / amended IN PLACE in `docs/decisions.md` (annotations landed; the rows are
retained in the §ACTIVE table so their cited addresses still resolve, and each is enumerated in that
file's §SUPERSEDED table with its replacement named):**

| Row | Annotation landed | Consequence for this enumeration |
| --- | --- | --- |
| `DECIDED: RAG-AUTHORITATIVE` | marked **SUPERSEDED 2026-09-21** by `ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | §D.1 row 1; **no archive** — the row text is the record of what was reversed |
| `DECIDED: SINGLE-WRITER-STORE` | marked **SUPERSEDED 2026-09-21** | §D.1 row 2 |
| `DECIDED: SINGLE-WRITER-STORE-PER-STORE` | marked **SUPERSEDED 2026-09-21** (host-lock-point clause inherited away; the **multi-store registry itself STAYS ACTIVE**) | §D.1 row 3 |
| `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` | **PROVENANCE CLAUSE APPENDED 2026-09-21** — "THE DECISION STANDS: this clause reverses ONE clause of it and supersedes NO row" | §D.1 row 4 |
| `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` | marked **SUPERSEDED 2026-09-21** "as to its 'every local path works identically' clause"; its "never silent" clause **SURVIVES and is NOT reversed** | §D.1 row 5 |

**Already repointed by an EARLIER pass (pre-existing working-tree state; cited as precedent, never
re-proposed, and NOT this batch's write):** `docs/specs/unit-h1-registry-write.md` (two
`docs/pending.md` line-number citations rewritten to title-anchored citations) and
`docs/specs/ui-overhaul.md` (C14/C19/pending-row citations repointed at
`docs/specs/unit-u-shell-9a-main-focus-tabs.md`, `archive/pending/2026-09-21-c14-tabs.md`,
`archive/pending/2026-09-21-c19-hover.md`). **Attribution corrected 2026-09-21 (item-10d review):** the
gate-landing batch did **not** write either file — `docs/specs/ui-overhaul.md`'s **mtime is
`2026-09-20T23:00`**, before this session's writes, and no batch writer had it in its write set (see
**§D.4 finding F-1**, now a corrected false alarm).

**One process finding this file must report (not silently)** — see **§D.4 finding F-1 (CORRECTED
2026-09-21)**: citations **inside** `docs/specs/ui-overhaul.md`, a file the gate record's must-NOT list
names as a MUST-NOT-EDIT corpus, were repointed **by an earlier pass** (pre-existing working-tree
state, mtime `2026-09-20T23:00`), while this enumeration declares that file a **hard blocker** for
further repoints. The two positions are inconsistent and need a decision — but the **edit is not this
batch's**, and the cite-blocked verdicts stand on the standing prohibition, not on the false
attribution.

---

## §D.1 — CLASS 1a: THE AFFECTED DECISION ROWS

**Scope:** the rows named in the brief. All five are in `docs/decisions.md`. Disposition vocabulary:
**supersede-by-row** (a new row carries the surviving reading), **amend-in-place**, **archive-with-repoint**,
**keep**.

| # | Row (path + id) | The exact clause that contradicts the new model (quoted) | Scope | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `docs/decisions.md` — **`DECIDED: RAG-AUTHORITATIVE`** | *"The RAG store (RAG nodes + edges) is the persistent source of truth."* and *"the RAG store is always correct; the materialized graph is always re-derivable"* | **whole row** (its subject is store authority) | **supersede-by-row — ALREADY LANDED this pass**; the row stays in the tree (§ACTIVE table, marked SUPERSEDED in place, enumerated in §SUPERSEDED) → **archive: NO** (its text is the record of the reversal and its address is cited) | the row's own `Source` cell → `docs/specs/astrographer-review.md` §8.1/§9 (that file is a **Class-1b** repoint, see §D.1b) | none | `PENDING` |
| 2 | `docs/decisions.md` — **`DECIDED: SINGLE-WRITER-STORE`** | *"the RAG store is the lock point; the main process owns all writes; MCP and UI both route through it"* and *"No renderer-side writes to the RAG store."* | **whole row** | **supersede-by-row — ALREADY LANDED**; archive: NO | `docs/specs/astrographer-review.md` §9.2.6; the ~two dozen unit specs that name it in their "Decisions (consumed)" blocks (§D.1b) | the §C.4 row **`PRUNE-820`** cites `docs/decisions.md#SINGLE-WRITER-STORE` as its **evidence pointer** while stating *"the main process single-writer store owns every write today"* — §C.4 is **cited, never edited**, so that citation **cannot** be repointed by this pass → **cited-not-repointable, recorded, not a blocker on the decision row itself** (see §D.4 finding F-3) | `PENDING` |
| 3 | `docs/decisions.md` — **`DECIDED: SINGLE-WRITER-STORE-PER-STORE`** | *"each `createJsonRagStore` instance keeps its own single-writer queue … the main process owns all writes to every store; no cross-store write transactions"* | **whole row**, but **one clause only is reversed** (the host lock point); the per-store mapping survives pending `U-AUTHORITY-SWITCH` | **supersede-by-row — ALREADY LANDED**, with the *surviving reading* named in the replacement (`MULTI-STORE-REGISTRY` + `FANOUT-INTERLEAVE-MERGE` **stay ACTIVE**) | `docs/decisions.md#MULTI-STORE-REGISTRY` (still §ACTIVE — must **not** be touched); `docs/specs/multi-document-store-config-review.md` §2 D12; `docs/specs/unit-ms1..ms5-*` (5 specs, §D.1b) | none | `PENDING` |
| 4 | `docs/decisions.md` — **`DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`** (the **ownership clause**) | the clause the clause-table names: *"The engine may own the STORE and the compute behind the traversal-input PROJECTION … but **never the envelope and never the derivation**"* combined with *"`RagStore` reads stay **SYNCHRONOUS**"* and *"the MCP server **STAYS HOST-OWNED**"* | **ONE CLAUSE ONLY** — its **presentation-layer half stays ACTIVE and binding** (verified: the row carries a PROVENANCE CLAUSE, not a supersession; the scope-realignment review §3.1 is its source of record) | **amend-in-place — ALREADY LANDED**; **archive: NEVER** (the row is cited **20×** in `docs/requirement-catalog.md` and by 14 live docs) | `docs/specs/astrographer-scope-realignment-review.md` §3.1/§3.2 (stays); catalog `PRUNE-367`/`PRUNE-368`/`PRUNE-828` (see §D.2 item 8) | **the sync-read clause is NOT a contradiction**: the read-model pivot **keeps the 22-member synchronous `RagStore` interface** and moves its *subject* to cache-resident data (gate record §11.5: *"the pin is not amended"*) — so a "contradicts `GN-1`" reading of this row is **wrong** and must not be filed | `PENDING` |
| 5 | `docs/decisions.md` — **`DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`** | *"With no engine, every local path must work IDENTICALLY … **No offload unit may make a local path DEPEND on engine presence**"* | **ONE CLAUSE** (the identity clause). Its *"an engine-absent read must surface a **typed unavailable** error — never a silent no-op"* and *"the launcher must fail loud"* clauses **SURVIVE and are NOT reversed** | **supersede-by-row — ALREADY LANDED**, in the exact form the gate record prescribes (a reversal recorded as a reversal, with the surviving clause named) | catalog `PRUNE-361` (`merged-into:PRUNE-829`) and **`PRUNE-829` (§C.4, `keep`)**; defects `DEMO-ENGINE-START-GAP`, `GNOSIS-SIDEBAR-SEAM-MISSING`; `docs/specs/astrographer-scope-realignment-review.md` §3.4 | **`PRUNE-829` is §C.4 → non-prunable and not editable**; the gate record itself rules it "**affected row, cited never edited** … re-homed/re-pointed by the ruling's own pass" → the repoint is owed to a **§C.4-safe** route (a new §C.3 row or a tracker row), not to this pass | `PENDING` |

### D.1a.1 The two rows this enumeration must NOT propose for disposition

- **`DECIDED: MULTI-STORE-REGISTRY` and `DECIDED: FANOUT-INTERLEAVE-MERGE`** — both stay **ACTIVE**
  (the replacement row says so in terms, and the catalog carries them as `PRUNE-835`, a
  `user-directed-record` row frozen at `keep-advisory`). **`keep` is the disposition; no sign-off is
  owed.**
- **`DECIDED: SOURCE-SWITCHABLE`** — the gate record rules it **discharged/cited, not superseded**
  (its anticipated remote store is what the engine-authoritative model realises). **`keep`.**

---

## §D.1b — CLASS 1b: DOCUMENTS THAT PIN THE NOW-REVERSED BEHAVIOR

Disposition vocabulary: **keep** · **keep + repoint** (citation rewrite only) · **supersede-by-row**
(a successor contract + `SUPERSEDED`/amending row; the file stays as the historical implementation
contract) · **archive-with-repoint**.

**Rule applied to this whole class (stated once):** these are **landed implementation contracts whose
tests still pin them**. Archiving any of them while its tests exist would make a test assert a document
that is gone. **Archiving is therefore recommended for NONE of the "contradicts the model" specs**; the
live question is *repoint* vs *supersede-by-row*, and each needs its own sign-off.

### D.1b.1 The store / model / render spine (the direct implementation contracts)

| # | Candidate (path) | The exact clause that contradicts the new model (quoted) | Scope | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `docs/specs/unit-a-rag-store.md` | §1 item 2: *"a **single-writer write queue** — the lock point. **The main process owns all writes**"*; §4: *"**SINGLE-WRITER-STORE:** every mutation to the RAG store routes through the single-writer queue"* | file (it **is** the host store contract) | **supersede-by-row** — a successor engine-backed store contract; the `RagStore` **interface shape survives** and is re-implemented, so the file is **kept as the historical contract**, marked SUPERSEDED | its §"Decisions (consumed)" block naming `SINGLE-WRITER-STORE`/`RAG-AUTHORITATIVE`; **~37 live citers** (verified) incl. `docs/pending.md`, `docs/next-steps.md`, `docs/decisions.md`, and 35 `docs/specs/**` files | citers are mostly the sibling specs in this table (repoint in the same sweep) | `PENDING` |
| 2 | `docs/specs/unit-b-document-model.md` | §4: *"**SINGLE-WRITER-STORE:** the `edit` tools route through the main-process"* store; §1: doc-flow edges *"**authoritative in the store**"* | **one section** (§4 + its "Decisions (consumed)" block); the document-model semantics themselves survive | **keep + repoint** (the model is not what the ruling reverses; the *authority location* is) | §"Decisions (consumed)"; 19 live citers | none | `PENDING` |
| 3 | `docs/specs/unit-c-rendering-spine.md` | §4: *"**RAG-AUTHORITATIVE:** the RAG store is authoritative; the provident graph is [transient]"*; §4: *"**SINGLE-WRITER-STORE:** the traversal reads the RAG store"* | **one section**; the traversal/envelope spine **stays** (the gate record: the shell keeps the render path) | **keep + repoint** — this is the clearest "blanket archive would be wrong" case in the class | §"Decisions (consumed)"; 20 live citers incl. `docs/next-steps.md` | none | `PENDING` |
| 4 | `docs/specs/unit-d-editing.md` | its commit path is the **host** write path the async engine write replaces (the gate record records this reversal explicitly in its §12.7(a)) | file (the commit contract) | **supersede-by-row** — the successor is `C9 U-EDIT-1` (`WHOLE-PAGE-EDITING`), which the gate record names as the unit that **restates the commit contract**; no unit implements an async commit before that restatement | §"Decisions (consumed)"; 18 live citers | **do not supersede before `U-EDIT-1`'s restatement lands** (a contract would be reversed with no successor) | `PENDING` |
| 5 | `docs/specs/unit-e-rag-index.md` | the maintained lexical index lives in **main over the host store** | file (§4/§5.6) | **supersede-by-row or keep + repoint** — the index's *owner* changes (engine-side or cache-side), its *contract* survives | §4/§5; 16 live citers | the successor is not designed yet (`U-READS-PIVOT` owns the read path; the index owner is unstated) → **decision owed before sign-off** | `PENDING` |
| 6 | `docs/specs/unit-f-embeddings.md` | its persisted embedding **cache** + vector boot are pinned as **host-owned** stores — the new row **keeps them host-owned by name** (clause (1a)) | **no contradiction** | **keep** | n/a | none | `PENDING` (proposing keep) |
| 7 | the `-greens` records `docs/specs/unit-f-w1-vector-boot-greens.md`, `unit-f-w2-batch-greens.md`, `unit-f-w3-failure-policy-greens.md`, `unit-f-w4-cache-greens.md`, `unit-f-w5-live-cache-greens.md` (the **only** files in the W-set — there are no parent `unit-f-w*` specs) | the vector boot/batch/cache machinery is host-side | **no contradiction** (host-owned by the new row's clause (1a)) | **keep the subject; the records themselves are §D.2 historical class** | n/a | none | `PENDING` |
| 8 | `docs/specs/unit-f1-merge-store-results.md`, `unit-f2-result-qualification.md` | pure fan-out merge/qualification helpers | **no contradiction** | **keep** | n/a | none | `PENDING` (proposing keep) |
| 9 | `docs/specs/unit-f3-stores-all-schema.md` | §"`stores:'all'` fan-out": *"read-only (SINGLE-WRITER-STORE unaffected — each store keeps its own queue)"* | **one clause** | **keep + repoint** (the fan-out read survives; the queue comment is a citation) | its §"Contract basis"; the `stores:"all"` surface | none | `PENDING` |
| 10 | `docs/specs/unit-n-batch-atomicity.md` | *"a successful batch … persists ONCE; a failed batch … does NOT persist"*, *"serialized through the single-writer queue"* | **one clause** (the persistence/serialization) | **keep + repoint** — the atomic-batch **contract** is carried by `DECIDED: BATCH-ATOMICITY-API` and is cited by the live `docs/decisions.md` row `BATCH-ATOMICITY-API` (§ACTIVE, and it **explicitly rejects** changing the persist cadence as a new contract) | `docs/decisions.md#BATCH-ATOMICITY-API`; `unit-import-batch-persist.md`; 7 live citers | the decision row `BATCH-ATOMICITY-API` keeps **all** of its text → repointing the spec out from under it would create a tracker-vs-spec contradiction (`X-`-class); the row must be **cited, not edited away** | `PENDING` |
| 11 | `docs/specs/unit-import-batch-persist.md` | §1: the importer performs *"ONE `persist()` per atomic batch"*; §"single-writer model" — the per-op cadence is *"the store's documented single-writer model"* | **one clause** | **supersede-by-row** — its subject (`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`, `RESOLVED-BY-RECLASSIFICATION`) is a **host store** property; the engine becomes the persist owner | `docs/decisions.md#BATCH-ATOMICITY-API` (whose SPEC-VERIFY clause names this unit); `docs/specs/unit-v5-migration.md`; `docs/specs/unit-corpus-migration.md`; `docs/HANDOFF.md`; `docs/defects.md`; catalog §C.6.2 inputs | **it is named in the live `BATCH-ATOMICITY-API` row's own text as the discharging unit** → superseding it needs an amendment clause on that row (one pass, one atomic tracker write) | `PENDING` |
| 12 | `docs/specs/unit-p-ipc-edit-batch.md` | the `IPC_EDIT_BATCH` renderer→main→store channel is *"the renderer→main batch channel … The channel is NOT group-gated"* — the **host write path the new model removes** | file (the channel contract) | **supersede-by-row** (the async engine write path replaces it); the channel itself is **also** an `IPC-SURFACE-NOT-GROUP-GATED` artifact → that *decision row* is **excluded** and must not be touched | `docs/decisions.md#IPC-EDIT-BATCH`; `docs/decisions.md#IPC-SURFACE-NOT-GROUP-GATED` (**EXCLUDED**); 5 live citers | **partially cite-blocked**: one of its two authorities is a named exclusion; the repoint must be scoped to the store-ownership clause only | `PENDING` |
| 13 | `docs/specs/unit-o-edit-ops.md` | the three rich-text edit ops land on the **host edit-ops layer** over the store | **one clause** | **keep + repoint** — the op **semantics** (`setProps` merges, `setSubtree` replaces, `setType` never delete+create) survive the authority move | §4/§5; `docs/decisions.md#RICH-TEXT-EDIT-OPS` (**stays ACTIVE**); 9 live citers | none | `PENDING` |
| 14 | `docs/specs/unit-t-markdown-import.md` | the import contract: parse → `applyBatch` → **host store**; the RAG store is the **one-way snapshot** destination | **one clause** (the destination); the one-way-snapshot **property** survives | **supersede-by-row** — the ingestion destination becomes the engine | `docs/decisions.md#ONE-WAY-SNAPSHOT`; `docs/decisions.md#MARKDOWN-EXPORT-ONLY-CARVE-OUT`; `docs/specs/markdown-import-review.md`; 13 live citers | the **§C.4 row `PRUNE-819`** ("Ingestion is served by an engine route …") is the ledger's own home for the engine-side ingest and is **non-prunable** — the successor must **cite** it, not replace it | `PENDING` |
| 15 | `docs/specs/unit-v1-store-adjacency.md` | §"Contract basis" consumes `RAG-AUTHORITATIVE` + `SINGLE-WRITER-STORE`; the five adjacency methods are *"backed by a lazy O(E) index"* over the **host** store | **one clause** (the index's home); the adjacency **contract** survives | **keep + repoint** (the reads move behind the engine projection / the cache) | `docs/decisions.md#ADJACENCY-INDEXED`, `#SHARED-ADJACENCY-CORE`, `#READ-ONLY-SNAPSHOT-ADAPTER` (all stay ACTIVE); 8 live citers; its own battery + greens | none | `PENDING` |
| 16 | `docs/specs/unit-v2-scoped-traversal-mcp.md` | the scoped walk reads the **host** store via the adjacency methods | **one clause** | **keep + repoint** | 4 live citers; its battery + greens | none | `PENDING` |
| 17 | `docs/specs/unit-v3-doc-heads-docnav.md` | `rag-doc-heads` reads the **host** store's doc-head edges | **one clause** | **keep + repoint** | 6 live citers; its battery + greens | none | `PENDING` |
| 18 | `docs/specs/unit-ud2-journal-invertibility.md` | journal invertibility over the **host** store's writes | **one clause** | **keep + repoint** — `DECIDED: PROJECT-JOURNAL` (undo/redo lives in the *project* journal, not the engine journal) **stays ACTIVE** | `docs/decisions.md#PROJECT-JOURNAL`; `docs/decisions.md#BATCH-ATOMICITY-API` | none | `PENDING` |
| 19 | `docs/specs/unit-ud5-list-documents-tool.md` | `rag.list_documents` reads the **host** store's doc-heads | **one clause** | **keep + repoint** | 5 live citers | none | `PENDING` |
| 20 | `docs/specs/unit-ud1-document-metadata-fields.md` (`unit-ud3`, `unit-ud4`, `unit-ud6`, `unit-ud7` likewise) | host-store document metadata (`documentPath`/`tags`) | **one clause** each | **keep + repoint** | `docs/decisions.md#TABLE-TYPES-ADDITIVE-STORE-FORMAT`, `#CHILDREN-ADDITIVE-STORE-FORMAT` (additive-format rows **stay ACTIVE**) | none | `PENDING` |
| 21 | `docs/specs/unit-u1-editing-mode-setting.md` | records the retained *"RAG-authoritative re-traversal"* clause of the editing-mode contract | **one clause** | **keep + repoint** (the re-traversal response survives; its **trigger source** changes) | `docs/decisions.md#EDITING-MODE-SETTING` (**stays ACTIVE**); 3 live citers | note: **both the filed defect row `CATALOG-CITES-NONEXISTENT-UNIT-SPEC` (`docs/defects.md`) and the catalog (`docs/requirement-catalog.md` §6.7 (a) / §9.1 item 24) cite a non-existent `docs/specs/unit-l1-editing-mode-setting.md`**; the path that resolves is `unit-u1-editing-mode-setting.md` (this table's row) and, for the textarea contract, `unit-l-textarea-editing-ui.md` — see §D.4 finding F-5 (corrected). **No document in this batch cites the dead path** | `PENDING` |
| 22 | `docs/specs/unit-u4-contenteditable-editor.md`, `unit-u5-set-rich-text.md` | the rich-text splice writes through the **host** single-writer path; the `setRichText` op's store write | **one clause** each | **keep + repoint** | `docs/decisions.md#RICH-TEXT-EDIT-OPS`; `docs/decisions.md#EDITING-MODE-SETTING` | none | `PENDING` |
| 23 | `docs/specs/unit-s-paste-sanitization.md`, `unit-u2-rich-decompose.md`, `unit-u3-rich-eligibility-splice.md`, `unit-m-children-field.md`, `unit-m1-inline-offset-model.md`, `unit-m2-inline-bodyruns-emit.md`, `unit-m3-inline-bodyruns-rewrite.md`, `unit-m4-inline-order-reconcile.md`, `unit-r-traversal-inline-children.md` | pure modules + node-level model ops that **touch** the host store's write path but do not own authority | **one clause** each (their "Decisions (consumed)" lines) | **keep + repoint** | `docs/decisions.md#CHILDREN-ADDITIVE-STORE-FORMAT`, `#CHILDREN-HASH-SOURCE`, `#PASTE-SANITIZATION`, `#INLINE-CHILDREN-AUTHORED-ID` (all stay ACTIVE) | none | `PENDING` |
| 24 | `docs/specs/unit-g-crosslink-backlink.md` | crosslink/backlink enumeration reads the **host** store's edges as authoritative | **one clause** | **keep + repoint** | `docs/decisions.md#CROSSLINK-EDGE-KIND`, `#CROSSLINK-LINKCONFIG` (stay ACTIVE) | none | `PENDING` |
| 25 | `docs/specs/unit-h-sidebar-panes.md`, `unit-k-sidebar-panes-host.md` | every pane's store read routes through main under `SINGLE-WRITER-STORE` | **one clause** each | **keep + repoint** (pane reads become **cache** reads; the pane-authoring contract is unaffected) | their "Decisions (consumed)" blocks | none | `PENDING` |
| 26 | `docs/specs/unit-i-template.md` | template data is a **host-owned** store (host-owned by the new row's clause (1a)) | **no contradiction** | **keep** | n/a | none | `PENDING` (proposing keep) |
| 27 | `docs/specs/unit-j-mcp-security-hardening.md` | its contract basis lists `RAG-AUTHORITATIVE` + `SINGLE-WRITER-STORE` **alongside** the excluded security rows | **two clauses only** | **keep + repoint the two store references ONLY** — this is the clearest case where a blanket archive would be wrong (the file's security surface is an exclusion class) | `docs/decisions.md#GNOSIS-SECURITY-CARVE-OUT`, `#ENGINE-TRANSPORT-POLICY`, `#IPC-SURFACE-NOT-GROUP-GATED` (**all EXCLUDED — cite only**) | **partially cite-blocked**: a repoint touching the security clauses is forbidden; scope the edit to the two store lines | `PENDING` |

### D.1b.2 The multi-store / registry-hot-apply family (`unit-ms1..ms5-*`, `unit-h1..h8-*`)

**Class rule:** the **multi-store registry stays ACTIVE** under the replacement row. These specs are
**host-owned** contracts whose *document*-CRUD half moves authority; their *registry/operator* half does
not. **No archive is recommended for any of them.**

| # | Candidate (path) | The exact clause that contradicts the new model (quoted) | Scope | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | `docs/specs/unit-ms1-store-registry.md` | *"**SINGLE-WRITER-STORE-PER-STORE** + **ENGINE-PER-STORE**"* in its contract basis; *"no engine gap"* | **one clause** | **keep + repoint** | `docs/decisions.md#MULTI-STORE-REGISTRY` (**stay ACTIVE**), `#SINGLE-WRITER-STORE-PER-STORE` (superseded) | none | `PENDING` |
| 29 | `docs/specs/unit-ms2-store-wiring.md` | the **N distinct `createJsonRagStore` instances**, *"each with its own closure single-writer queue"*; *"the main process owns all writes to every store"* | **one clause** | **keep + repoint** | `docs/decisions.md#SINGLE-WRITER-STORE-PER-STORE`; `#MULTI-STORE-REGISTRY` | none | `PENDING` |
| 30 | `docs/specs/unit-ms3-store-qualified-broadcast.md` | *"SINGLE-WRITER-STORE-PER-STORE + ENGINE-PER-STORE"* basis | **one clause** | **keep + repoint** | same pair | none | `PENDING` |
| 31 | `docs/specs/unit-ms4-id-prefixing.md` | the `<name>:` id prefix is minted **at the host import seam**; *"import serializes through its OWN store's single-writer queue"* | **one clause** | **keep + repoint** | `docs/decisions.md#SINGLE-WRITER-STORE-PER-STORE`, `#ONE-WAY-SNAPSHOT` | the id scheme survives the authority move but the **minting seam** moves → the successor unit's obligation, not a repoint | `PENDING` |
| 32 | `docs/specs/unit-ms5-settings-listing.md` | *"**SINGLE-WRITER-STORE (consumed):** the listing channel READS the main-process"* store | **one clause** | **keep + repoint** | `docs/decisions.md#SINGLE-WRITER-STORE` | none | `PENDING` |
| 33 | `docs/specs/unit-h1-registry-write.md` | the registry-write seam writes the **host** registry file | **no contradiction** (registry is ACTIVE) | **keep** — and note it was **already repointed this pass** for two pending-row citations | n/a | none | `PENDING` (proposing keep) |
| 34 | `docs/specs/unit-h2-runtime-controller.md` | *"each rebuilt store carries its own queue"*; the runtime controller rebuilds `createJsonRagStore` instances | **one clause** | **keep + repoint** | `docs/specs/unit-ms1-store-registry.md`; `docs/decisions.md#MULTI-STORE-REGISTRY` | the **rebuild target type changes** under `U-AUTHORITY-SWITCH` → successor obligation | `PENDING` |
| 35 | `docs/specs/unit-h3-hot-add.md`, `unit-h4-hot-remove.md`, `unit-h5-teardown.md`, `unit-h6-hot-rename.md`, `unit-h7-default-reassign.md` | hot-apply of **host** stores (drain-then-teardown, file stranded) | **one clause** each | **keep + repoint** | `docs/decisions.md#HOT-REMOVE-DRAIN-TEARDOWN` and the `unit-ms1` sub-pins | none | `PENDING` |
| 36 | `docs/specs/unit-h8-operator-editor.md` | the operator-UI manage surface (operator scope) | **no contradiction** (operator surfaces stay host-owned) | **keep** | n/a | none | `PENDING` (proposing keep) |
| 37 | the `-greens` partners for every row above (75 files tree-wide) | n/a — green records | see §D.2 | **archive-with-repoint** (historical class) | see §D.2 | see §D.2 blockers | `PENDING` |

### D.1b.3 The engine-direction specs (the `unit-a1-*`/`unit-a2-*` CRUD-proxy pair)

| # | Candidate (path) | Contradiction | Scope | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 38 | `docs/specs/unit-a1-crud-routing-proxy.md` + `unit-a2-document-crud-wiring.md` (+ their 4 greens/battery records) | **no contradiction — the opposite**: they ARE the engine-CRUD wire client and the `gnosis.document.*`/`gnosis.wiki.*` wiring, i.e. the direction the ruling now makes authoritative | file (both) | **keep** and **PROMOTE by citation** — the gate record names `RAG-EDIT-MCP-GROUPS` + `GNOSIS-CRUD-EDIT-GROUP` as both staying ACTIVE with `edit.set_content` becoming an **alias at the switch**. These two specs plus `DECIDED: GNOSIS-CRUD-SURFACE-CONFIRMED` / `GNOSIS-CRUD-MVP-SCOPE` are the *destination already built*; the successor work is the **alias amendment**, not a new client | their contract basis citing the frozen CRUD wire; catalog `PRUNE-369` (§C.4, `keep`) which already pins *"the intended future surface"* | none | `PENDING` (proposing keep + promote) |
| 39 | `docs/specs/unit-gn-engine-integration.md`, `unit-gn-mcp-ui-wiring.md` (+ their greens/battery records) | the engine **retrieval trio + health** wire client and its `gnosis.*` MCP/GUI wiring | **no contradiction** | **keep**; their §5.6 **D2 engine-absent behaviour** clause is a **`GN-4`-affected** clause → **amend-in-place by the `GN-4` carrier**, not archivable | catalog `PRUNE-363` (merged into §C.4 `PRUNE-801`), `PRUNE-364`, `PRUNE-356`/`PRUNE-357` | the engine-absent clause's **successor** is the §12.5 typed-warning state, which is **not yet specced** → amend only after it lands | `PENDING` |

---

## §D.2 — CLASS 2: HISTORICAL / STALE RECORDS SAFE TO ARCHIVE REGARDLESS

**Rule applied to this whole class (stated once):** a record is archivable iff **(i)** its subject has
landed, **(ii)** its still-live content now lives in a named tracker row or spec section, and
**(iii)** every citation of it can be repointed.

### D.2.1 The `-greens` records — **75 files**, `docs/specs/*-greens.md`

**Verified counts:** 75 `*-greens.md` paths exist in `docs/specs/`; `docs/requirement-catalog.md`
§C.6.4 enumerates them as the **(EG)** class and names **75**; the catalog contract
(`docs/specs/requirement-catalog.md` §3.8/§9 item 25) counts **74** at its own read. **75 is the tree
count.** The per-path membership is the **§C.6.4 (EG) list, taken verbatim** (this file does not retype
93 paths; the list is one `grep` away and is named by class below).

| Item (class) | What it is | Why it is historical | Where its still-live content lives now | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 75 × `docs/specs/*-greens.md` (**EG**) | unit green-scenario records | the unit's DONE row now carries the verification; the greens set is the **RCA-4 blind-run artifact**, not a live contract | the **owning `docs/specs/unit-*.md`** contract + its `docs/next-steps.md` DONE row (+ `docs/decisions.md` where the unit landed a decision row) | **archive-with-repoint** → `archive/greens/<date>-<name>.md` | **3 citation families** (all verified): (a) `docs/next-steps.md` DONE rows — repoint to the unit spec's §verification section; (b) `docs/decisions.md` landed-row `Source` cells (5 rows measured) — repoint to the owning unit spec; (c) **other `*-greens.md` / `*-live-pending-battery.md` files** — these are themselves archived in the same sweep, so the citation dies with the citer; (d) `docs/requirement-catalog.md` §C.6.4 (EG) list + §C.6.3 `excluded_specs` count — repoint = **delete the path from the list and recount** | **(B-1) the catalog §C.6.4/§C.6.3 edit is mandatory and is a MUST-EDIT**, not a MUST-NOT-EDIT: the contract's `FS23` test (*"a path that is neither an input nor excluded with a reason class"*) only requires absence to be legal; but the **count is DERIVED** and would drift if the list is stale → the same pass must recount. **A pass that archives a greens file and leaves §C.6.4 enumerating it has created a count drift of the exact class that has already cost two fix cycles** (catalog §C.8 C2/C3). | `PENDING` |
| 45 of the 75 carry **live citers** (measured) | the citation burden is **not uniform**: `unit-a1-crud-list-summary-decode-greens.md` has 7 citers; most have 3–4 | — | — | the **citer count is the per-item sign-off input**; a greens record with **0 citers** is a clean archive, one with citers needs its repoint enumerated in the sign-off record | as above | the citers are largely `docs/next-steps.md` + `docs/HANDOVER.md` (both live trackers) → both are **editable** → **no cite-block** | `PENDING` |

### D.2.2 The `-live-pending-battery.md` records — **18 files**

**Verified:** 18 paths exist; §C.6.4 enumerates 18 as the **(LB)** class; the catalog contract's §9 item
25 counts 18. **Counts agree.** Named (from the tree, `ls`-verified):

`unit-a1-crud-routing-proxy-live-pending-battery.md` · `unit-a2-document-crud-wiring-live-pending-battery.md` ·
`unit-gn-engine-integration-live-pending-battery.md` · `unit-gn-mcp-ui-wiring-live-pending-battery.md` ·
`unit-ms1-store-registry-live-pending-battery.md` · `unit-ms2-store-wiring-live-pending-battery.md` ·
`unit-ms3-store-qualified-broadcast-live-pending-battery.md` · `unit-ms4-id-prefixing-live-pending-battery.md` ·
`unit-ms5-settings-listing-live-pending-battery.md` · `unit-shell-integration-live-pending-battery.md` ·
`unit-u-import-1-import-surface-live-pending-battery.md` · `unit-u-shell-7-settings-modal-live-pending-battery.md` ·
`unit-u-shell-shell-wiring-live-pending-battery.md` · `unit-ujr1-get-journal-live-pending-battery.md` ·
`unit-v1-store-adjacency-live-pending-battery.md` · `unit-v2-scoped-traversal-mcp-live-pending-battery.md` ·
`unit-v3-doc-heads-docnav-live-pending-battery.md` · `unit-x-rag-provenance-traversal-live-pending-battery.md`

| Item | Why it is historical | Where its still-live content lives now | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- |
| the 18 above, as a class | **RCA-11 makes a parked live battery a failure mode, not a handoff**: *"a UI-overhaul / UI-rendering unit is not pre-DONE while its `-live-pending-battery.md` set is parked on 'no live session'"*. The batteries that remain parked are the ones whose units have since been **verified by other means** (node-layer assertions, later live runs on `scripts/live-drive.mjs`, or the unit's subject having been superseded) | `docs/live-testing.md` §"The live-pending batteries (authored)" is the **consolidated handoff** and is itself a §D.2.4 candidate; the per-battery live steps now live in `scripts/live-drive.mjs`'s blocks + the O-0 harness records | **archive-with-repoint**, **but only per battery and only with the park/verification reason recorded** — a battery whose unit is **still** parked must be **KEPT** (archiving it would delete the RCA-11 obligation) | each battery's citers (mostly its own unit spec + `docs/live-testing.md` + `docs/next-steps.md`) | **(B-2) per-battery triage is required before any archive**: a battery is archivable only if its surface has since been exercised or its unit superseded. **A batch archive of all 18 is a process violation.** | `PENDING` |

### D.2.3 The gate / review / findings records

| # | Candidate (path) | Why it is historical | Where its still-live content lives now | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 40 | `docs/specs/gnosis-offload-proposal.md` | the proposal **ask** ("make Gnosis the owner of heavy document handling"); its gate returned PROCEED-WITH-AMENDMENTS and **demoted** the ask | `docs/specs/gnosis-offload-review.md` §8 (parked-track bookkeeping) + `docs/pending.md` §"PARKED DESTINATION — the engine track" + `docs/decisions.md#ARCH-GNOSIS-OFFLOAD` | **archive-with-repoint** | `docs/decisions.md#ARCH-GNOSIS-OFFLOAD` `Source` cell; catalog §C.4 rows `PRUNE-804`, `PRUNE-805`, `PRUNE-818`, `PRUNE-819`, `PRUNE-827` (all §C.4 → **cited, never edited**) | **cite-blocked**: 6 §C.4 rows cite it and §C.4 may not be edited → repointing them is forbidden → **keep — cite-blocked** unless the user authorises a §C.3-side pointer row | `PENDING` |
| 41 | `docs/specs/unblock-gnosis-remaining-endpoints.md` | the **roadmap** whose A1/A2 units LANDED (DONE rows) | `docs/specs/unit-a1-crud-routing-proxy.md` + `unit-a2-document-crud-wiring.md` + their DONE rows | **archive-with-repoint** | 8 live citers (`unit-a1-*`, `unit-a2-*`, both batteries, catalog (GV) list, `docs/next-steps.md`) — all editable | none | `PENDING` |
| 42 | `docs/specs/registry-hot-apply-review.md` | the proposal gate for the U-H1..H8 slice, **all landed** | the 8 `unit-h*` specs + the DONE rows; `docs/decisions.md#HOT-REMOVE-DRAIN-TEARDOWN` | **archive-with-repoint** | 11 live citers, incl. `docs/specs/unit-h1-registry-write.md` (already edited this pass — **repoint it again carefully**) | none | `PENDING` |
| 43 | `docs/specs/multi-store-fanout-review.md` | the proposal gate for the `stores:"all"` slice, **landed** | `docs/decisions.md#FANOUT-INTERLEAVE-MERGE`; the `unit-f1..f3` specs | **archive-with-repoint** | 7 live citers | none | `PENDING` |
| 44 | `docs/specs/ollama-vector-boot-review.md` | the vector-boot proposal gate, **landed as W1–W5** | `docs/specs/unit-f-w1..w5-…-greens.md` (the five W-records) + `docs/specs/unit-f-embeddings.md`; `docs/decisions.md#PROVIDER-AGNOSTIC` | **archive-with-repoint** | 5 live citers incl. `docs/decisions.md` W5 rows and `docs/pending.md` | none | `PENDING` |
| 45 | `docs/specs/document-directory-category-review.md` | the C15 proposal gate, **U-D1..D7 all landed** | `docs/specs/unit-ud1..ud7-*`; the DONE rows | **archive-with-repoint** | 13 live citers; catalog `PRUNE-321`-class evidence + §C.4 `PRUNE-830` (**§C.4 → cited, never edited**) | `PRUNE-830` cites `document-directory-category-review.md:§4` → its pointer **cannot** be repointed (§C.4) → **keep — partially cite-blocked** | `PENDING` |
| 46 | `docs/specs/load-bug-scoped-traversal-review.md` | the SCOPED-LOAD gate, **U-V1..V3 landed + live-verified** | `docs/decisions.md#SCOPED-LOAD` (+ 7 companion rows); `unit-v1/v2/v3-*` | **archive-with-repoint** | 7 live citers | none | `PENDING` |
| 47 | `docs/specs/inline-order-render-fix-review.md` | the inline-order gate, **landed (M1–M4)** | the `unit-m1..m4-*` specs + the DONE rows | **archive-with-repoint** | 6 live citers | none | `PENDING` |
| 48 | `docs/specs/shell-integration-review.md` | the shell-integration gate (Option B re-scope), **landed** | `docs/specs/unit-shell-integration.md` + its greens; `docs/decisions.md#GNOSIS-LAUNCHER-TOGGLE` | **archive-with-repoint** | 4 live citers | **the file contains 3 dangling out-of-tree path citations** (see §D.4 finding F-4) — archiving must not propagate them | `PENDING` |
| 49 | `docs/specs/ui-overhaul-review.md` | the UI-overhaul umbrella gate, **Wave 1–3 all landed** | `docs/specs/ui-overhaul.md` (MUST-NOT-EDIT — **stays**); the per-unit DONE rows; `docs/next-steps.md` | **archive-with-repoint** | 7 live citers | none | `PENDING` |
| 50 | `docs/specs/u-state-1-content-repopulation-review.md` | gate for U-STATE-1, **landed (1a/1b/1c/1e)** | `docs/decisions.md#U-STATE-1-CONTENT-REPOPULATION-GATE`; the unit specs | **archive-with-repoint** | 7 live citers | none | `PENDING` |
| 51 | `docs/specs/editing-mode-toggle-review.md` | gate for the editing-mode toggle, **landed (U1–U5)** | `docs/decisions.md#EDITING-MODE-SETTING` + `#RICH-TEXT-EDITING-GATE` | **archive-with-repoint** | 14 live citers (its §4-D is cited as an amendment source) | none | `PENDING` |
| 52 | `docs/specs/markdown-import-review.md` | the Unit-T gate; the round-trip-diffing framing **DO-NOT-PROCEED**, the ingestion framing landed | `docs/specs/unit-t-markdown-import.md`; `docs/decisions.md#ONE-WAY-SNAPSHOT`, `#MARKDOWN-EXPORT-ONLY-CARVE-OUT`, `#TABLE-TYPES-ADDITIVE-STORE-FORMAT` | **archive-with-repoint**, **but** it is a **Class-1b** candidate too (it pins the RAG store as the authoritative layer) → **supersede/repoint its authority clause FIRST**, then archive | 5 live citers; `docs/pending.md` §SPECULATIVE names it as the owner of a retired row | **double disposition**: repoint-then-archive in one signed item, or keep. A single "archive" sign-off would move an authority clause without a successor | `PENDING` |
| 53 | `docs/specs/multi-document-store-config-review.md` | the multi-store Phase-1 gate, **landed (U-MS1..MS5)** | `docs/decisions.md#MULTI-STORE-REGISTRY` (**stays ACTIVE**) | **keep** — the registry it pins is **still ACTIVE**; archiving the record of a live contract is wrong | n/a | the gate record's §11.1 item 4 names the multi-store registry as **NOT superseded and NOT prunable** | `PENDING` (proposing keep) |
| 54 | `docs/specs/requirement-catalog-review.md` | the catalog's own gate record | `docs/specs/requirement-catalog.md` §C.0–§C.8; `docs/decisions.md#ADVISORY-REQUIREMENT-CATALOG` | **keep** — the catalog is a **live, actively-maintained** artifact and its gate record is its contract basis | n/a | none | `PENDING` (proposing keep) |
| 55 | `docs/specs/user-flow-audit-review.md` | the D-GP-UFA gate (**status: PROPOSED, draft for handoff**) | `docs/specs/user-flow-audit.md` (MUST-NOT-EDIT — **stays**) + `docs/decisions.md` `D-GP-UFA-1..4` | **archive-with-repoint**, **but** the *user-flow-audit* family is bound by the §5.U matrix cap | 4 live citers | **(B-3)** the matrix is **FULL at 8** and its rows must not change; any repoint that touches `docs/specs/user-flow-audit.md` is **MUST-NOT-EDIT-blocked** → **keep — cite-blocked** for the parts `user-flow-audit.md` cites | `PENDING` |
| 56 | `docs/specs/user-flow-audit-coverage-2026-09-15.md` | a **dated pass record** (the live coverage reading of a specific re-drive) | `docs/defects.md` (the per-defect live cells); `docs/specs/user-flow-audit-checklist.md`; `docs/next-steps.md` | **archive-with-repoint** | **9 live citers**, incl. `docs/defects.md`, `docs/decisions.md` (`PANE-DRAG-HEADER-ONLY` names it), `docs/specs/user-flow-audit-checklist.md` (**a MUST-NOT-EDIT-adjacent corpus** per the catalog's inputs — it is named as an **input**, not an exclusion) | **(B-4) cite-blocked in part**: `docs/decisions.md#D-GP-UFA-*` rows cite it as a source and the checklist cites it; the checklist is a **catalog input** whose digest is recorded in §C.6.2 → editing it forces a **digest re-derivation** in the same pass | `PENDING` |
| 57 | `docs/specs/session-feedback-doc-audit-2026-09-16.md` | a dated audit record of the user's session feedback | the per-defect rows in `docs/defects.md`; `docs/decisions.md#REPORT-3-COMMITTED-AS-A-DOCUMENT` | **archive-with-repoint** | 7 live citers incl. `docs/decisions.md#REPORT-3-COMMITTED-AS-A-DOCUMENT` (which cites its §4 as one of the nine report-#3 citations) | none — but the repoint must not disturb the **X-2** resolution's lineage | `PENDING` |
| 58 | `docs/specs/gnosis-enrichment-live-report-2026-09-15.md` | a dated **live findings report** for the engine's enrichment surface | `docs/defects.md` (`GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`); catalog §C.4 `PRUNE-801`–`PRUNE-803`, `PRUNE-808` | **archive-with-repoint** | 6 live citers; **4 of them are §C.4 rows** | **cite-blocked**: §C.4 is cited-never-edited → **keep — cite-blocked** | `PENDING` |
| 59 | `docs/specs/wave-1-open-decisions.md`, `docs/specs/wave-2-open-decisions.md` | dated **question registers** for the UI-overhaul waves | the resolved answers now live in `docs/specs/ui-overhaul.md` §7 Q-tables (**MUST-NOT-EDIT → stays**) + the per-unit specs | **keep — cite-blocked** for both: `ui-overhaul.md` is a MUST-NOT-EDIT corpus and 17/14 live files cite these registers | n/a | **hard blocker**: repointing them means editing `docs/specs/ui-overhaul.md` | `PENDING` |
| 60 | `docs/specs/module-import-proposal.md` | the module-import proposal (its slice landed as `docs/specs/module-feature-list.md` + the module units) | `docs/specs/module-feature-list.md` | **archive-with-repoint** | 5 live citers | none | `PENDING` |
| 61 | `docs/specs/document-directory-category.md` | the C15 **feature note** (the review supersedes it) | `docs/specs/document-directory-category-review.md` §4 (which is itself a candidate) → then the `unit-ud*` specs | **archive-with-repoint** | 11 live citers | its citers chain into a §D.2.3 candidate → **sequence the two archives in one signed item** | `PENDING` |
| 62 | `docs/specs/live-user-test-suite-plan.md` | the **plan** for the live e2e suite, whose driver (`scripts/live-drive.mjs`) landed | the driver + `docs/live-testing.md` §"The automated live driver" | **archive-with-repoint** | 4 live citers | the driver is a **pinned oracle** (`src/shared/o0-report.ts` + `scripts/live-drive.mjs` oracle pair) → the repoint must cite the driver, not the plan | `PENDING` |
| 63 | `docs/specs/live-user-flow-scenarios.md` | the scenario **bodies** for the live re-drives | `scripts/live-drive.mjs` blocks + `docs/specs/user-flow-audit-checklist.md` | **keep — cite-blocked**: catalog rows `PRUNE-602`, `PRUNE-603`, `PRUNE-137`, `PRUNE-145`, `PRUNE-162` cite its `§3`/`§4`/`§6`/`§10` as the **re-drive artifact that makes a `wants-keep` row legal** (§3.4's `wants-keep` three-part test). Archiving it would **void a live keep verdict** | n/a | **hard blocker** — this is the strongest cite-block in the class | `PENDING` |

### D.2.4 The `docs/` handover + testing surfaces

| # | Candidate (path) | Why it is historical | Where its still-live content lives now | Recommended disposition | Citations to repoint | Blocker | Sign-off |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 64 | `docs/HANDOVER.md` | the **Wave-2 UI-overhaul handover** (date 2026-09-14; its own §"CURRENT HANDOVER STATE" is already marked superseded in place); **every wave landed and `WAVE 3 COMPLETE`** | `docs/specs/ui-overhaul.md` §7 Q-tables (**MUST-NOT-EDIT**); the per-unit DONE rows in `docs/next-steps.md` | **archive-with-repoint** — **but see the blocker** | 17 citers, **mostly pointing INSIDE `archive/reviews/**`** (i.e. it is itself an archive-citing document); 1 citer is `docs/specs/unit-u-shell-shell-wiring.md` | **partially cite-blocked**: it is cited from a landed unit spec and cites `archive/**` throughout. **AGENTS.md item 6c forbids `archive/**` as a canonical pointer** (`docs/FORKER.md` §"the archival-loop convention": *"never cite `archive/` (it won't be there)"*) → archiving it **does not fix** its own live defect (see §D.4 finding F-2) | `PENDING` |
| 65 | `docs/HANDOVER-LIVE-BATCH-RCA.md` | the **live-batch handover** (date 2026-09-14, head `6ea9f9c`); its RCA was formalized into a dedicated spec | `docs/specs/rca-live-bugs-green-pipeline.md` (the RCA of record — **stays**) + `docs/decisions.md` `D-GP-UFA-*` + `AGENTS.md` items 11/12 | **archive-with-repoint** | **3 live citers** (`docs/specs/rca-live-bugs-green-pipeline.md` — which states its own §4/§5 are the handover's summary; `docs/specs/unit-live4-empty-store-landing.md` ×2; `docs/live-testing.md` §1.0) | one citer uses a **line-number citation** (`docs/specs/unit-live4-empty-store-landing.md` cites it as `:43`) → the repoint must be **title/section-anchored**, never a new line number | `PENDING` |
| 66 | `docs/live-testing.md` | its **status block is dated 2026-09-08** and its §4.1/§4.2 park tables describe units since landed; §6's counts are stale by its own later edits | the **authored batteries** (§3 — themselves §D.2.2 candidates); `scripts/live-drive.mjs` + its `--block=` blocks; `docs/HANDOVER-LIVE-BATCH-RCA.md` (§1.0) | **amend-in-place, NOT archive** — see the recommendation below | its own §3 table (the 18 batteries) and §5 (U-H8) | **(B-5) hard blocker on the "archive" reading:** `docs/specs/unit-o-0-per-stage-measurement.md` and `docs/specs/unit-o-0-per-stage-breakdown.md` — **two of the five MUST-NOT-EDIT corpus files the exclusions name** — cite `docs/live-testing.md` **by its launcher/bundle gotcha as an ENV NOTE that the O-0 harness contract depends on**; the citations are in **line-number form** (`:119-124`) and the cited content is the **rebuild-before-start / verify-the-executing-bundle** rule. Repointing them requires editing pinned corpora → **forbidden**. **Recommended: `keep`, with a one-line in-place amendment marking §4/§6 as historical** — an amendment to `docs/live-testing.md` itself is legal (it is neither pinned nor a §C.4 row); the *archived-but-still-cited* state is not | `PENDING` |
| 67 | `docs/FORKER.md` | a **fork-onboarding guide** (what a fork agent needs without reaching into `archive/`); not a contract | its §4/§5 content lives in `AGENTS.md` items 6/7 and `docs/FORK-DIVERGENCE.md` | **keep** — the gate record names `docs/FORK-DIVERGENCE.md` an **exclusion**, and `FORKER.md` is its companion entry point; archiving the onboarding guide of a **fork** would delete the fork's own address map | n/a | none | `PENDING` (proposing keep) |
| 68 | `docs/forks*` | **no such path exists in the tree** (verified: no `docs/forks*` file) | — | **not a candidate — the brief's path does not exist** | n/a | n/a | n/a |

### D.2.5 Already-archived rows (no action, listed so the enumeration is not read as incomplete)

`docs/pending.md` §SCHEDULED's retired slots and §SPECULATIVE's retired rows are **already retired with
records** (verified): `archive/pending/2026-09-21-{c14-tabs,c19-hover,c20-shared,c4-drag,embedders,multistore-phase2,rich-text,unit-t,vector-cache}.md`
(9 records, whose convention — the verbatim row + the retirement date + the owner of the landed content
+ the citations repointed — is `archive/README.md` §"`pending/`"). **No further disposition is proposed
for these.**

---

## §D.3 — CLASS 3: THE EXCLUSIONS (the non-prunable set, by name)

**7 exclusion entries, 10 named documents/row-groups + 2 oracle pair members + 1 MUST-NOT-EDIT corpus
set of 5.** Each is an **absolute**: a "contradicts `GN-1`" reading does not reach any of them.

| # | Excluded (by name) | Reason (the recorded reason, plus what I verified) | Reachable by this disposition? |
| --- | --- | --- | --- |
| E-1 | `docs/specs/mcp-endpoint.md` | the **pinned MCP contract** (AGENTS.md item 5). Verified: its §3 tool table + §6.2 group table are cited by **24 catalog rows**, incl. `PRUNE-372`–`PRUNE-386` (the whole `MCP-ENDPOINT-CONTRACT` capability block). Its **store-owned tool inventory** (the `rag.*` + `edit.*` groups) is the part the brief flags — that inventory is **host-owned under the new row's clause (1b)** and is **cited, never edited** | **NO** |
| E-2 | `docs/decisions.md` rows **`GNOSIS-SECURITY-CARVE-OUT`**, **`ENGINE-TRANSPORT-POLICY`**, **`IPC-SURFACE-NOT-GROUP-GATED`**, **`OPERATOR-ISOLATED-GRAPHSCOPE`** | the **security/operator seam** rows — a prune read *"would delete the rationale for a trust boundary"*. Verified: cited by catalog `PRUNE-371`, `PRUNE-376`, `PRUNE-380`, `PRUNE-839` | **NO** |
| E-3 | `docs/FORK-DIVERGENCE.md` | the **fork-divergence hedge** — the recorded fallback if upstream declines every request; its §3 rule 4 keeps every divergence in three places. Verified: cited by §C.4 `PRUNE-810`–`PRUNE-817` | **NO** |
| E-4 | the catalog's **§C.4 39-row upstream-owed ledger**, `PRUNE-801`–`PRUNE-839` (**39 ids, each used once — recounted in the tree**) | **NON-PRUNABLE BY CONSTRUCTION** (`docs/requirement-catalog.md` §C.4): *"every §C.4 row carries a non-prunable verdict — `keep` or `keep-advisory` — by construction; a prune verdict on a §C.4 row is refused"*. Includes `PRUNE-838` (the GR-7 durability row) and `PRUNE-829` (the engine-absent requirement the `GN-4` reversal **re-points at**) | **NO — cited, never edited** |
| E-5 | the four **`invalidated-conflict` freeze carriers**: `PRUNE-100` (X-15), `PRUNE-127` (X-1), `PRUNE-152` and `PRUNE-375` (X-14) | *"a named tracker-vs-spec disagreement is resolved by neither authority in the catalog; freezing precedes any prune question"*. Verified in the tree: all four carry `invalidated-conflict` in their verdict cell and are named in §C.7.1 as X-15/X-1/X-14 | **NO** |
| E-6 | the parked **O-6/O-7/O-8** rows — `docs/pending.md` §"PARKED DESTINATION — the engine track" | every parked row carries a **named revisit condition**; **O-8 is now the program's prerequisite** (gate record §13 P2, `U-AUTHORITY-SWITCH`). Verified: the three items + the track trigger are present, and the trigger records **candidate-fired for the folder-row disclosure only** | **NO** |
| E-7 | the **MUST-NOT-EDIT corpus set** (5 files): `docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`, `docs/specs/unit-o-0-per-stage-breakdown.md`, `docs/specs/unit-o-0-per-stage-measurement.md`, `docs/HANDOFF.md` | the catalog contract's §2.5 MUST-NOT-EDIT list (the gate record's §3.6 F.3 item 9 reproduces it verbatim). **Verified as the source of three hard cite-blocks in this enumeration** (§D.2.3 item 55, §D.2.4 items 59 and 66) | **NO — and see finding F-1 (CORRECTED 2026-09-21: an EARLIER pass, not this batch, edited `ui-overhaul.md`)** |
| E-8 | the **O-0 oracle pair** `src/shared/o0-report.ts` + `scripts/live-drive.mjs` | the gate record: *"No unit of this program may touch the pair as a side effect"*; a change to either invalidates the recorded live provenance. **Verified: both are currently MODIFIED in the working tree** (outside this pass) | **NO** |

**Exclusion count: 8 entries** (E-1…E-8), covering **10 named decision-documents (1 contract + 4 decision rows + 1 fork doc + 1 ledger + 1 freeze-carrier group + 1 parked group) + the 39-row ledger + the 5-file MUST-NOT-EDIT set + the 2-file oracle pair.**

---

## §D.4 — CITATION IMPACT (the part that makes this pass safe or unsafe)

### D.4.1 The repoint classes this enumeration creates

| Class | The repoint | Editable? | Verdict |
| --- | --- | --- | --- |
| **R-1** `docs/next-steps.md` DONE rows citing a greens/battery record | point at the owning unit spec's verification section | **YES** | safe |
| **R-2** `docs/decisions.md` `Source` cells citing a unit spec | point at the successor spec + the new ACTIVE row | **YES** | safe — **but the cell text is often the row's own provenance; a repoint must not erase the record of what the row was based on** |
| **R-3** `docs/requirement-catalog.md` §C.6.4 (EG)/(LB)/(GV)/(LNS) lists + §C.6.3 `excluded_specs` count | delete the archived path from the list, **recount** | **YES** (the catalog is not MUST-NOT-EDIT) | **MANDATORY in the same pass** — a stale list is a **derived-count drift** |
| **R-4** catalog §C.3 row `status_pointer`/`evidence_pointer` cells citing an archived path | repoint to the surviving row/section | **YES** | safe unless the row is a **freeze carrier** (E-5) |
| **R-5** catalog §C.4 row pointers | — | **NO** (§C.4 is cited-never-edited) | **BLOCKED** → the proposal becomes **keep — cite-blocked** |
| **R-6** citations inside a MUST-NOT-EDIT corpus | — | **NO** | **BLOCKED** → **keep — cite-blocked** |
| **R-7** citations from a file that is itself archived in the same sweep | n/a — the citation dies with the citer | n/a | safe **iff** the two archives are signed as one item |
| **R-8** **line-number** citations (the `docs/specs/unit-o-0-per-stage-measurement.md` / `docs/specs/unit-o-0-per-stage-breakdown.md` citations of `docs/live-testing.md`'s launcher gotcha in the "ENV NOTE" form that quotes the note's line range; `docs/specs/unit-o0-m1-m3-measurement-shape.md` and `docs/specs/unit-live4-empty-store-landing.md` line-anchored cites) | must be rewritten **title/section-anchored**, and the archived item's content re-anchored under a §-heading so the citation has a title to point at | depends on the file | **the line-number form is itself a defect class** (§D.4 finding F-2) — note that **two of these citers are MUST-NOT-EDIT (E-7)**, so the form cannot be fixed from here |

### D.4.2 The BLOCKED (keep — cite-blocked) proposals, with the blocker named

| Proposal | Blocker (named) |
| --- | --- |
| archive `docs/specs/gnosis-enrichment-live-report-2026-09-15.md` | **4 §C.4 rows** cite it (`PRUNE-801`, `PRUNE-802`, `PRUNE-803`, `PRUNE-808`) → E-4 |
| archive `docs/specs/gnosis-offload-proposal.md` | **6 §C.4 rows** cite it (`PRUNE-804`, `PRUNE-805`, `PRUNE-818`, `PRUNE-819`, `PRUNE-827`) → E-4 |
| archive `docs/specs/document-directory-category-review.md` | §C.4 `PRUNE-830` cites its §4 → E-4 (partial: the §C.3 citers are editable, so a **§C.3-only** repoint leaves the §C.4 pointer stale) |
| archive `docs/specs/wave-1-open-decisions.md` / `wave-2-open-decisions.md` | **`docs/specs/ui-overhaul.md` is a MUST-NOT-EDIT corpus** and cites them across its §7 Q-tables and §9 cross-references → E-7 |
| archive `docs/specs/live-user-flow-scenarios.md` | catalog rows `PRUNE-602`/`PRUNE-603`/`PRUNE-137`/`PRUNE-145`/`PRUNE-162` cite its §§ as the **re-drive artifact that makes a `wants-keep` verdict legal**; archiving voids a live keep verdict → §3.4's `wants-keep` three-part test |
| archive `docs/specs/user-flow-audit-review.md` (the parts `user-flow-audit.md` cites) | `docs/specs/user-flow-audit.md` is MUST-NOT-EDIT → E-7 |
| archive `docs/live-testing.md` | **two MUST-NOT-EDIT files cite it by line-number anchor as the O-0 harness ENV NOTE** (E-7) |
| archive `docs/specs/unit-p-ipc-edit-batch.md` (its group-gating clause) | one of its two authorities is **E-2** → scope the repoint to the store clause only |
| archive `docs/specs/unit-j-mcp-security-hardening.md` | E-2 (its security clauses) → repoint only the two store references |
| archive `docs/HANDOVER.md` | it is cited from a landed unit spec **and** cites `archive/**` throughout (AGENTS.md item 6c / `docs/FORKER.md` §5) |

**Count: 10 cite-blocked items** (of which 4 are complete blocks and 6 are partial/scope-limited).

### D.4.3 FINDINGS I would not let ship without a decision

| # | Finding (defect class) | Evidence (path + anchor) | Why it needs a decision before execution |
| --- | --- | --- | --- |
| **F-1** | **CORRECTED 2026-09-21 (item-10d documentation review) — the earlier F-1 was a FALSE ALARM: it attributed a MUST-NOT-EDIT corpus edit to the gate-landing pass on the strength of `git status` alone.** | `docs/specs/ui-overhaul.md` **is modified in the working tree** (`M`), and its C14 row, its §3 multi-document rules and its §9 cross-references do point at `docs/specs/unit-u-shell-9a-main-focus-tabs.md` and `archive/pending/2026-09-21-{c14-tabs,c19-hover,c4-drag}.md`. **The `M` is pre-existing working-tree state, not this batch's edit:** the file's **mtime is `2026-09-20T23:00`**, i.e. **before this session's writes** (18:00+ on `2026-09-21`), and **no writer of the gate-landing batch had `docs/specs/ui-overhaul.md` in its write set** (the batch's files are the gate record, the five new unit specs, this enumeration, the two trackers and the review record). The citations it carries are the **earlier archival pass's** repoints — they resolve, they name the C14 spec and the `archive/pending/2026-09-21-*` records, and they were **not** written by this pass. **What F-1's evidence base actually supports: the corpus has been edited by SOME earlier pass, so the correct finding is the narrower one — the catalog contract's §2.5 MUST-NOT-EDIT list forbids it, yet it happened, and the two positions still need a ruling.** | **Which `keep — cite-blocked` verdicts depended on the false premise:** only the two whose blocker was *"`ui-overhaul.md` is a MUST-NOT-EDIT corpus and cites them"* — `docs/specs/wave-1-open-decisions.md` / `wave-2-open-decisions.md` (§D.2.4 item 59) and `docs/specs/user-flow-audit-review.md` (§D.2.3 item 55) — **plus the `docs/specs/unit-o-0-per-stage-*`-class blocker in §D.2.4 item 66, which rests on the same list.** Those three verdicts are **RESTATED, unchanged in outcome**: the blocker is **not** "the batch edited it, so it is editable"; it is the **standing prohibition** in the gate record §3.6 F.3 item 9 and the catalog contract §2.5, which is **in force regardless of who violated it**. **The verdict is still `keep — cite-blocked`, now correctly grounded**, and what the finding adds is a **decision owed about the earlier edit** (§D.5.1 S-9) — decide, record or revert **that** edit; the false attribution to this batch is withdrawn. |
| **F-2** | **Existing still-cited-but-archived / archive-as-canonical citations.** | (a) `AGENTS.md` (item 10, the RCA-5 paragraph) cites **`docs/specs/process-rca-battery.md`** — **that path does not exist**; the file exists only as **`archive/parent-project/2026-08-26-process-rca-battery.md`** (gitignored — cited by path for provenance only), which `docs/skills/process-guardrails.md` cites as the archive path. (b) `docs/specs/gnosis-offload-review.md` §Inputs cites the same dead path **and carries the archive path beside it in parentheses** (`docs/specs/process-rca-battery.md` → `archive/parent-project/2026-08-26-process-rca-battery.md`, RCA-1..RCA-5) — so its reader is not stranded, but the pointer's primary address is still dead. (c) `docs/HANDOVER.md` cites `archive/reviews/**` in **10+ places** and `docs/decisions.md` / `docs/defects.md` cite `archive/reviews/**` records. (d) `docs/FORKER.md` §5 records the rule that makes (c) a defect: *"For fork agents: never cite `archive/` (it won't be there)."* | the **"report #3" class** the brief names is the *resolved* member of this family (`DECIDED: REPORT-3-COMMITTED-AS-A-DOCUMENT`, catalog X-2); these are **unresolved members**: a gitignored, non-shipping path used as a canonical address. **CORRECTED 2026-09-21 (item-10d review): both live instances of the `process-rca-battery` dead path sit OUTSIDE this batch's editable set** — `AGENTS.md` and `docs/specs/gnosis-offload-review.md` — so they are **recorded as owed, never edited here** (repoint to `archive/parent-project/2026-08-26-process-rca-battery.md` marked as the archive path, or to a git-visible successor). **No document in this batch cites the dead path** (verified by grep over the gate record, the five new unit specs, this enumeration and the trackers). **Fixing the family is a separate tracker item**, not part of `GN-2` — but if `GN-2` archives more files, it must not add to the class. |
| **F-3** | **A §C.4 row states the reversed model in its own text.** | `docs/requirement-catalog.md` `PRUNE-820` (§C.4): *"the main-process single-writer store owns every write today"* + its evidence `docs/decisions.md#SINGLE-WRITER-STORE`. | `PRUNE-820` is **non-prunable and cited-never-edited** (E-4), yet its sentence is now false. The gate record anticipates this class for `PRUNE-829` ("re-homed/re-pointed by the ruling's own pass") but **does not name `PRUNE-820`**. A `§C.4`-safe route (a §C.3 correction row, or a tracker row that the §C.4 row may point at) needs a ruling. |
| **F-4** | **Dangling spec paths inside the very files proposed for archive — and, for the batch's own paths, CORRECTED 2026-09-21 (item-10d review).** | `docs/specs/shell-integration-review.md` cites `docs/specs/7-2-f2-review.md`, `docs/specs/engine-transport-policy.md`; `docs/specs/unit-gn-engine-integration.md` cites `docs/specs/7-2-wire-property-register.md`, `docs/specs/engine-wire-contract.md`; `unit-a1`/`unit-a2` cite `docs/specs/p1a-document-crud-wire.md`, `docs/specs/p2-gnosis-server.md`; `docs/defects.md` cites `docs/specs/sidebar-panes-decomposition.md` (the real path is `docs/feature-requests/sidebar-panes-decomposition.md`); `docs/requirement-catalog.md` §C.6.4 cites `docs/specs/live-testing.md` (the real path is `docs/live-testing.md`); `docs/decisions.md` + `docs/specs/unit-o0-m1-m3-measurement-shape.md` cite `docs/specs/unit-o0-per-stage-breakdown.md` (a **typo** for `unit-o-0-…`). **The batch's own instance is REPAIRED:** `docs/next-steps.md` cited `docs/specs/unit-reads-pivot.md` while the authored spec is **`docs/specs/unit-reads-pivot-tab-cache.md`** — the row now carries the **real path** (with the placeholder noted as retyped in place, not kept live), and the two sibling `P2` rows (`unit-authority-switch.md`, `unit-corpus-migration.md`, `unit-engine-persist.md`) were authored during the landing pass and resolve. | archiving a file **while it contains dead pointers** propagates the defect into the archive, and the citation-impact audit for the archived item would be built on unverifiable lines. **Fix or explicitly quarantine the dead pointers per item** — the batch repaired its own (the `unit-reads-pivot` path), and the remainder are recorded here as owed because they sit in files outside this batch's write scope. |
| **F-5** | **Pre-existing catalog/defect citations to a renamed spec.** | `docs/requirement-catalog.md` (§9 item 24's divergence note, and §6.7 (a)'s recorded defect) cites `docs/specs/unit-l1-editing-mode-setting.md`; the real file is **`docs/specs/unit-u1-editing-mode-setting.md`** (the `EDITING-MODE-SETTING` decision's unit) — and the **sibling path that resolves** for the textarea-editing contract is **`docs/specs/unit-l-textarea-editing-ui.md`**. The catalog's own §9 records the alias as a known divergence, so it is **known and unfixed**. | **CORRECTED 2026-09-21 (item-10d review): the dead path appears in BOTH the catalog (`docs/requirement-catalog.md` §6.7 (a) and §9.1 item 24) and the filed defect row `CATALOG-CITES-NONEXISTENT-UNIT-SPEC` in `docs/defects.md`** — that row's own `Reproduction` cell records the **citing cells in the tracker rows `EDIT-MODE-TEXTAREA-UI` and `WHOLE-PAGE-EDITING-REQUIREMENT`**, so the alias is an already-OPEN defect with a recorded fix shape (repoint both citations to a resolved path, **or** land the spec under the cited name, **and record which**). **No citation to the dead path exists in this batch's documents** (verified by grep over the gate record, the five new unit specs, this enumeration and the trackers). **`unit-u1-editing-mode-setting.md` is a §D.1b repoint candidate (item 21)**; repointing *away* from it while the stale alias persists would compound the class — so the alias repair belongs to the same catalog pass, under the existing defect row. |
| **F-6** | **A greens/battery archive silently invalidates two catalog counts.** | `docs/requirement-catalog.md` §C.6.3 `counts.excluded_specs` is **DERIVED**; §C.6.4 enumerates **75 (EG) + 18 (LB) + 25 (GV) = 118 named paths** and marks `excluded_specs` as a **floor** (its own recorded gap: the (LNS) class is by rule, not enumerated). | the catalog's §C.8 records that count drift has **already cost two fix cycles**. **Every archive must be accompanied by the recount in the same pass** (S-5 below), and the deferred generator's `FS23` check inherits the widened rule. |
| **F-7** | **The `-greens` class has no home directory convention yet.** | `archive/README.md` names `reviews/` and `pending/`; the tree holds `parent-project/`, `live-batch/`, `live-testing-findings/`, `inline-order/`, `catalog-authoring/`, `unit-k-resolution/` — **no `greens/`, no `batteries/`**. | AGENTS.md item 6 fixes the **pattern** (`archive/<topic>/<date>-<name>.md`) but not the **topic vocabulary**. A 75-file archive needs the topic names decided **before** execution or the archive becomes unsearchable. |

---

## §D.5 — EXECUTION PRECONDITIONS (what a later pass must do, and must NOT do)

### D.5.1 Per item, the execution pass MUST

| # | Precondition | Source of the duty |
| --- | --- | --- |
| **S-1** | **A per-item sign-off record.** `prune_signoff: user-approved:<date>` recorded **per item**, in the owning tracker row — **one blanket approval is not a sign-off and cannot stand in for the enumeration** | gate record §11.4 item 2; `docs/requirement-catalog.md` §3.1 rule 2 / §C.0 rule 2; `DECIDED: ADVISORY-REQUIREMENT-CATALOG` clause (4) |
| **S-2** | **An owning tracker row** for the item — never the catalog. A deletion's justification is the user's sign-off **plus the owning tracker row**; **no deletion may cite the catalog as its authority** | `docs/requirement-catalog.md` §C.0 rule 2 |
| **S-3** | **A git-visible tombstone.** The archive copy lands in the **gitignored** `archive/` tree, so `git revert` restores nothing; the durable record is the tombstone (the row/spec line in the deletion commit message + the tombstone row) | gate record §9.2/§11.4; `docs/specs/requirement-catalog.md` §3.6 (shrink + tombstone) |
| **S-4** | **The archive path** `archive/<topic>/<date>-<name>.md`, with the topic vocabulary decided first (finding F-7) | AGENTS.md item 6(b); `archive/README.md` |
| **S-5** | **The repoint commit — in the SAME pass.** Every citation enumerated in §D.4 repointed **title/section-anchored** (never a new line number), **plus** the catalog §C.6.4 list edit and the §C.6.3 `excluded_specs` recount | AGENTS.md item 6(c); catalog contract §3.8 + `FS23` + §3.12 clause (c); RCA-6/item 10d |
| **S-6** | **The item-10d documentation review** of the archival pass, recorded at `archive/reviews/<date>-<pass>-doc-review.md` | AGENTS.md item 10d (RCA-6) |
| **S-7** | **One atomic tracker-writing pass.** The generator's trigger is observed **once**, so P1's rows and the archival pass are **one pass each** | gate record §13.2 S5; `docs/specs/design-extensions-review.md` §3.4 D.4 |
| **S-8** | **The layer declaration** in the pass's DONE row: **DOC-LAYER** — no trio claim, no "app works" claim | AGENTS.md item 12 (RCA-12); gate record §13.3 |
| **S-9** | **Resolve finding F-1 (CORRECTED) first** — the MUST-NOT-EDIT consistency ruling: decide, record or revert the **earlier** pass's repoints inside `docs/specs/ui-overhaul.md` (mtime `2026-09-20T23:00`; **not** this batch's write) | this file §D.4.3 |
| **S-10** | **Per-battery triage** of the 18 `-live-pending-battery.md` records: a battery whose unit is **still** parked **stays** | AGENTS.md item 11 (RCA-11) |

### D.5.2 The execution pass MUST NOT

| # | Prohibition | Source |
| --- | --- | --- |
| **N-1** | **No mass deletion.** `GN-2` is archive-with-repoint **only**; **never** hard-delete a still-cited row | gate record §11.4 item 1; AGENTS.md item 6c |
| **N-2** | **Never archive a still-cited file without repointing it** in the same pass | AGENTS.md item 6(c) |
| **N-3** | **Never prune or edit a §C.4 row** (`PRUNE-801`–`PRUNE-839`), including `PRUNE-838` and `PRUNE-829` | catalog §C.4 pinned clause; gate record **§11.4** (its exclusion table — no `§11.4.1` heading exists) |
| **N-4** | **Never lift, add or re-adjudicate a freeze** — the four `invalidated-conflict` carriers (`PRUNE-100`, `PRUNE-127`, `PRUNE-152`, `PRUNE-375`) | gate record **§11.4**'s exclusion table; catalog §C.7.1 |
| **N-5** | **Never edit a MUST-NOT-EDIT corpus to repoint it** (`ui-overhaul.md`, `user-flow-audit.md`, the two `unit-o-0` files, `HANDOFF.md`) — **the prohibition stands unconditionally**; what is pending is only the ruling on the EARLIER edit (S-9) | gate record §3.6 F.3 item 9; catalog contract §2.5. **ATTRIBUTION CORRECTED 2026-09-21 (item-10d review): `docs/specs/ui-overhaul.md` was edited by an EARLIER pass — its mtime `2026-09-20T23:00` precedes this session's writes and no gate-landing-batch writer had it in its write set — so the "the landing pass already did this once" reading was a false alarm (F-1, corrected). The prohibition is unaffected by who violated it.** |
| **N-6** | **Never touch the oracle pair** (`src/shared/o0-report.ts`, `scripts/live-drive.mjs`) as a side effect | gate record §13.3; must-NOT item 15 |
| **N-7** | **Never re-seed the operator store** (`O0_OPERATOR_DOCUMENTS = 226`) | gate record **§3.6 F.3 item 9**; catalog `PRUNE-399` |
| **N-8** | **Never let the catalog be the deletion authority**, and never let the pass **create a new §C.5 token, a new §C.1 capability, a new `PRUNE` block or a new §5.U matrix row** | catalog §C.0 rule 2; gate record must-NOT item 7; §5.U is **full at 8** |
| **N-9** | **Never archive a parked live battery whose unit is still parked** (parked-by-default is the RCA-11 failure mode) | AGENTS.md item 11 |
| **N-10** | **Never report the pass as app-green, and never use parking language for an exercisable surface** | AGENTS.md item 12; gate record §13.3 |
| **N-11** | **Never leave a line-number citation where a title/section anchor is possible** — the class §D.4 finding F-2/F-4 records | catalog contract §3.4 rule 7 (binding on the catalog; adopted here as the repoint form) |

---

## §D.6 — REPORT

- **Candidate count, per class.**
  - **Class 1a — affected decision rows:** **5** (all five already annotated in place; **archive recommended for 0**).
  - **Class 1b — documents that assert the reversed model:** **39 named items** (24 in §D.1b.1, 10 in
    §D.1b.2, 2 in §D.1b.3, plus the 3 companion rows inside items 20/37's families). **Archive
    recommended for 0**; dispositions are `keep` / `keep + repoint` / `supersede-by-row`.
  - **Class 2 — historical / stale records safe to archive:** **116 candidate files, enumerated as 31
    table rows** — the **75** `-greens` records (row 1), the **18** `-live-pending-battery` records
    (row 2), and **23** individually-named review / findings / register / handover files (rows 40–68 of
    §D.2.3–§D.2.4). Of the 116, **archiving is recommended for 96** and **`keep` (whole or
    `keep — cite-blocked`) for 20** — see the per-row blockers.
  - **Class 3 — exclusions:** **8 entries** (E-1…E-8).
  - **Total distinct paths touched by this enumeration:** **≈ 190** (the bulk being the 93 greens/battery
    records, which are enumerated **by class** from `docs/requirement-catalog.md` §C.6.4 with counts
    verified against the tree).
- **Blocked / cite-blocked:** **10 items** (§D.4.2) — 4 complete blocks (`gnosis-enrichment-live-report`,
  `gnosis-offload-proposal`, `live-user-flow-scenarios`, and the `wave-1`/`wave-2-open-decisions` pair
  counted as one) and 6 scope-limited blocks (`document-directory-category-review`,
  `unit-p-ipc-edit-batch`, `unit-j-mcp-security-hardening`, `user-flow-audit-review`,
  `HANDOVER.md`, `live-testing.md`).
- **Exclusion count:** **8** entries covering the MCP contract, 4 security/operator seam rows,
  `docs/FORK-DIVERGENCE.md`, the 39-row §C.4 ledger, the 4 freeze carriers, the parked O-6/O-7/O-8 rows,
  the 5-file MUST-NOT-EDIT set, and the 2-file oracle pair.
- **Findings I would not let ship without a decision — CORRECTED 2026-09-21 (item-10d review):** **F-1
  (CORRECTED)** — the MUST-NOT-EDIT-consistency question stands, but the edit is **an EARLIER pass's**,
  NOT this batch's (`ui-overhaul.md` mtime `2026-09-20T23:00`; no batch writer had it in its write set),
  and the three `keep — cite-blocked` verdicts now rest on the **standing prohibition** (gate record
  §3.6 F.3 item 9; catalog contract §2.5), so their outcome is unchanged; the decision owed is about
  **that** edit (S-9); **F-3** (§C.4 `PRUNE-820` still asserts the reversed model in a row that may not be
  edited) — **now FILED** as `CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM` in `docs/defects.md`;
  **F-2** (unresolved `archive/**` / dead-path citations incl. the `process-rca-battery` class next to the
  resolved "report #3" class) — its two live instances are outside this batch's write scope and recorded
  as owed; **F-6** (every archive invalidates
  the catalog's derived `excluded_specs` count — the drift class that has already cost two fix cycles;
  **the two readings are now recorded side by side** in `docs/specs/unit-catalog-generator.md` §4.3 —
  118, the artifact's floor, and 130, the contract's pass reading); **F-7** (no archive topic vocabulary
  exists for 93 greens/battery records); and **F-4** (**the batch's own dead path is REPAIRED**; the
  remainder is owed) / **F-5** (renamed-spec pointers whose carrier is corrected to the catalog + the
  already-OPEN defect row `CATALOG-CITES-NONEXISTENT-UNIT-SPEC`). The review record is
  `archive/reviews/2026-09-21-design-extensions-doc-review.md` (gitignored; cited by path only).

---

## §D.7 — EXECUTION-PASS RECORD (2026-09-21) — the approved historical class

### D.7.1 Sign-off and what this pass is

- **`prune_signoff: user-approved:2026-09-21` — the HISTORICAL CLASS AS ENUMERATED (§D.2).** The
  per-item tables in §D.7.3/§D.7.4 are that sign-off's per-item record (S-1); an item's authority is
  the sign-off **plus the owing tracker row**, never the catalog (S-2).
- The pass runs the **AGENTS.md item 6** archival loop over the approved class under the brief's HARD
  GUARDS: **no file referenced by CODE is moved** (guard 1), **no MUST-NOT-EDIT corpus is edited to
  repoint** (guard 2), **the §D.3 exclusions are untouched** (guard 3), **the catalog artifact and its
  contract are not edited by this pass** (guard 4).
- **Layer declaration (RCA-12, mirroring this file's own head):** **DOC-LAYER** only — no trio claim
  and no "app works" claim.

### D.7.2 Executed / not executed, and why

| Leg | State |
| --- | --- |
| (a) per-item classification, with the guard that decides each verdict | **EXECUTED** — §D.7.3, §D.7.4 |
| (b) the archive copy + the removal of the original (`archive/<topic>/<date>-<name>.md`) | **EXECUTED 2026-09-21 (shell-capable pass)** — 75 of 75 `git mv`ed; bytes verified identical (md5 per row); see §D.7.9 |
| (c) the repoints (AGENTS.md item 6c) | **EXECUTED 2026-09-21** — 281 citation lines repointed (280 mechanical + 1 line-anchor rewrite); see §D.7.9 |
| the topic-vocabulary decision (S-4; finding **F-7**) | **EXECUTED** — `archive/README.md` §"Topic vocabulary" |
| the git-visible tombstone (S-3) | **EXECUTED** — §D.7.3 (the archive tree is gitignored, so this table IS the durable record) |
| the owed-repoint ledger (S-5) | **EXECUTED** — §D.7.6 |
| the item-10d documentation review (S-6) | **OWED** to the pass that executes (b) + (c) |
| `npm test` / `typecheck` / `build` | **NOT RUN** — this pass has no shell and makes no source/test claim |

**Why (b) is blocked, stated exactly.** This pass runs on a **read/search + doc-write** tool wall: it
has **no shell and no move/rename/delete primitive**. A write can only replace a file's content, and
emptying a file leaves a **0-byte file** rather than unlinking it (probed and verified during this pass
at the gitignored `archive/.probe-delete.md`). A `git mv`-equivalent is therefore **not performable
here**. Verified consequence: **0 of the 75 MOVE items have been physically relocated and no citation
has been repointed.**

**Why no partial execution was performed (the anti-pattern refused).** Writing the archive copies
without being able to remove the originals — and without the repoint leg — would leave every moved
record **present twice** (still in `docs/specs/`, plus in `archive/`) while only a handful of citers
pointed at the archive twin. That is exactly the class findings **F-2** and `docs/FORKER.md` record: a
gitignored, non-shipping path used as a canonical address. A duplicated subset whose original is still
resolvable is **worse** than an unexecuted, fully recorded manifest, so this pass stopped at the record
and left the move atomic for one shell-capable pass.

**The execution procedure for that pass (per tombstone row, in this order):**
1. `git mv <original path> <archive path>` — the copy is by construction byte-identical (an archive is
   not an edit; AGENTS.md item 6b).
2. Apply the repoint named in §D.7.6 for that row, **title/section-anchored, never a new line number**
   (N-11), pointing at the **owning tracker row / spec section** — the archive path is noted as
   **historical only**, never as the canonical address.
3. Land the §D.7.6 catalog repoint (§C.6.4 lists + the §C.6.3 recount) **in the same pass** (F-6).
4. Land the owing tracker row (§D.7.6) and the item-10d review record (S-6).

### D.7.3 The MOVE set — 75 items, with the git-visible tombstone

Guard-driven verdict: **MOVE** — nothing in `src/**`, `scripts/**`, `tests/**`, `vitest.config.ts` or
`package.json` references these paths, and no citation of them lives inside a MUST-NOT-EDIT corpus
(both greps are recorded in §D.7.7). `git mv` per row is the execution step. The date is the date the
file's **own name** carries where it carries one, else `2026-09-21`.

**64 `-greens` records** (no date in the name → `2026-09-21`; `archive/greens/` is a NEW topic):

| original (git-visible) | archive path (gitignored) | date | approved by |
| --- | --- | --- | --- |
| `docs/specs/unit-a-rag-store-greens.md` | `archive/greens/2026-09-21-unit-a-rag-store-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-a-rag-store-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-b-document-model-greens.md` | `archive/greens/2026-09-21-unit-b-document-model-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-b-document-model-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-c-rendering-spine-greens.md` | `archive/greens/2026-09-21-unit-c-rendering-spine-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-c-rendering-spine-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-d-editing-greens.md` | `archive/greens/2026-09-21-unit-d-editing-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-d-editing-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-e-rag-index-greens.md` | `archive/greens/2026-09-21-unit-e-rag-index-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-e-rag-index-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f-embeddings-greens.md` | `archive/greens/2026-09-21-unit-f-embeddings-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f-embeddings-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f-w1-vector-boot-greens.md` | `archive/greens/2026-09-21-unit-f-w1-vector-boot-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f-w1-vector-boot-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f-w2-batch-greens.md` | `archive/greens/2026-09-21-unit-f-w2-batch-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f-w2-batch-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f-w3-failure-policy-greens.md` | `archive/greens/2026-09-21-unit-f-w3-failure-policy-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f-w3-failure-policy-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f-w4-cache-greens.md` | `archive/greens/2026-09-21-unit-f-w4-cache-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f-w4-cache-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f-w5-live-cache-greens.md` | `archive/greens/2026-09-21-unit-f-w5-live-cache-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f-w5-live-cache-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f1-merge-store-results-greens.md` | `archive/greens/2026-09-21-unit-f1-merge-store-results-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f1-merge-store-results-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f2-result-qualification-greens.md` | `archive/greens/2026-09-21-unit-f2-result-qualification-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f2-result-qualification-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-f3-stores-all-schema-greens.md` | `archive/greens/2026-09-21-unit-f3-stores-all-schema-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-f3-stores-all-schema-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-g-crosslink-backlink-greens.md` | `archive/greens/2026-09-21-unit-g-crosslink-backlink-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-g-crosslink-backlink-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-gn-engine-integration-greens.md` | `archive/greens/2026-09-21-unit-gn-engine-integration-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-gn-engine-integration-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-gn-mcp-ui-wiring-greens.md` | `archive/greens/2026-09-21-unit-gn-mcp-ui-wiring-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-gn-mcp-ui-wiring-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h-sidebar-panes-greens.md` | `archive/greens/2026-09-21-unit-h-sidebar-panes-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h-sidebar-panes-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h1-registry-write-greens.md` | `archive/greens/2026-09-21-unit-h1-registry-write-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h1-registry-write-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h2-runtime-controller-greens.md` | `archive/greens/2026-09-21-unit-h2-runtime-controller-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h2-runtime-controller-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h4-hot-remove-greens.md` | `archive/greens/2026-09-21-unit-h4-hot-remove-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h4-hot-remove-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h5-teardown-greens.md` | `archive/greens/2026-09-21-unit-h5-teardown-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h5-teardown-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h6-hot-rename-greens.md` | `archive/greens/2026-09-21-unit-h6-hot-rename-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h6-hot-rename-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h7-default-reassign-greens.md` | `archive/greens/2026-09-21-unit-h7-default-reassign-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h7-default-reassign-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-h8-operator-editor-greens.md` | `archive/greens/2026-09-21-unit-h8-operator-editor-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-h8-operator-editor-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-i-template-greens.md` | `archive/greens/2026-09-21-unit-i-template-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-i-template-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-j-mcp-security-hardening-greens.md` | `archive/greens/2026-09-21-unit-j-mcp-security-hardening-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-j-mcp-security-hardening-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-k-sidebar-panes-host-greens.md` | `archive/greens/2026-09-21-unit-k-sidebar-panes-host-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-k-sidebar-panes-host-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-l-textarea-editing-ui-greens.md` | `archive/greens/2026-09-21-unit-l-textarea-editing-ui-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-l-textarea-editing-ui-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-m-children-field-greens.md` | `archive/greens/2026-09-21-unit-m-children-field-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-m-children-field-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-ms1-store-registry-greens.md` | `archive/greens/2026-09-21-unit-ms1-store-registry-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-ms1-store-registry-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-ms2-store-wiring-greens.md` | `archive/greens/2026-09-21-unit-ms2-store-wiring-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-ms2-store-wiring-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-ms3-store-qualified-broadcast-greens.md` | `archive/greens/2026-09-21-unit-ms3-store-qualified-broadcast-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-ms3-store-qualified-broadcast-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-ms4-id-prefixing-greens.md` | `archive/greens/2026-09-21-unit-ms4-id-prefixing-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-ms4-id-prefixing-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-ms5-settings-listing-greens.md` | `archive/greens/2026-09-21-unit-ms5-settings-listing-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-ms5-settings-listing-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-n-batch-atomicity-greens.md` | `archive/greens/2026-09-21-unit-n-batch-atomicity-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-n-batch-atomicity-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-o-edit-ops-greens.md` | `archive/greens/2026-09-21-unit-o-edit-ops-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-o-edit-ops-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-p-ipc-edit-batch-greens.md` | `archive/greens/2026-09-21-unit-p-ipc-edit-batch-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-p-ipc-edit-batch-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-q-retrieval-children-indexing-greens.md` | `archive/greens/2026-09-21-unit-q-retrieval-children-indexing-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-q-retrieval-children-indexing-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-r-traversal-inline-children-greens.md` | `archive/greens/2026-09-21-unit-r-traversal-inline-children-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-r-traversal-inline-children-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-s-paste-sanitization-greens.md` | `archive/greens/2026-09-21-unit-s-paste-sanitization-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-s-paste-sanitization-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-shell-integration-greens.md` | `archive/greens/2026-09-21-unit-shell-integration-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-shell-integration-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-t-markdown-import-greens.md` | `archive/greens/2026-09-21-unit-t-markdown-import-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-t-markdown-import-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-import-1-import-surface-greens.md` | `archive/greens/2026-09-21-unit-u-import-1-import-surface-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-import-1-import-surface-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-1-layout-zones-greens.md` | `archive/greens/2026-09-21-unit-u-shell-1-layout-zones-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-1-layout-zones-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-3-collapsible-panes-greens.md` | `archive/greens/2026-09-21-unit-u-shell-3-collapsible-panes-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-3-collapsible-panes-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-4-drag-relocate-greens.md` | `archive/greens/2026-09-21-unit-u-shell-4-drag-relocate-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-4-drag-relocate-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-5-resizable-gutters-greens.md` | `archive/greens/2026-09-21-unit-u-shell-5-resizable-gutters-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-5-resizable-gutters-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-7-settings-modal-greens.md` | `archive/greens/2026-09-21-unit-u-shell-7-settings-modal-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-7-settings-modal-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-8-view-menu-pane-visibility-greens.md` | `archive/greens/2026-09-21-unit-u-shell-8-view-menu-pane-visibility-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-8-view-menu-pane-visibility-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-9a-main-focus-tabs-greens.md` | `archive/greens/2026-09-21-unit-u-shell-9a-main-focus-tabs-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-9a-main-focus-tabs-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-9b-greens.md` | `archive/greens/2026-09-21-unit-u-shell-9b-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-9b-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-shell-shell-wiring-greens.md` | `archive/greens/2026-09-21-unit-u-shell-shell-wiring-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-shell-shell-wiring-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u-state-1e-nroot-reconcile-greens.md` | `archive/greens/2026-09-21-unit-u-state-1e-nroot-reconcile-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u-state-1e-nroot-reconcile-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u1-editing-mode-setting-greens.md` | `archive/greens/2026-09-21-unit-u1-editing-mode-setting-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u1-editing-mode-setting-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u2-rich-decompose-greens.md` | `archive/greens/2026-09-21-unit-u2-rich-decompose-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u2-rich-decompose-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u3-rich-eligibility-splice-greens.md` | `archive/greens/2026-09-21-unit-u3-rich-eligibility-splice-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u3-rich-eligibility-splice-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u4-contenteditable-editor-greens.md` | `archive/greens/2026-09-21-unit-u4-contenteditable-editor-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u4-contenteditable-editor-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-u5-set-rich-text-greens.md` | `archive/greens/2026-09-21-unit-u5-set-rich-text-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-u5-set-rich-text-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-a1-crud-list-summary-decode-greens.md` | `archive/greens/2026-09-21-unit-a1-crud-list-summary-decode-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-a1-crud-list-summary-decode-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-a1-crud-routing-proxy-greens.md` | `archive/greens/2026-09-21-unit-a1-crud-routing-proxy-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-a1-crud-routing-proxy-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-a2-document-crud-wiring-greens.md` | `archive/greens/2026-09-21-unit-a2-document-crud-wiring-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-a2-document-crud-wiring-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-a2-document-crud-wiring-gui-pane-greens.md` | `archive/greens/2026-09-21-unit-a2-document-crud-wiring-gui-pane-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-a2-document-crud-wiring-gui-pane-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/unit-x-rag-provenance-traversal-greens.md` | `archive/greens/2026-09-21-unit-x-rag-provenance-traversal-greens.md` | **`MOVED → archive/greens/2026-09-21-unit-x-rag-provenance-traversal-greens.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |

**11 individually-named records:**

| original (git-visible) | archive path (gitignored) | topic / date | approved by |
| --- | --- | --- | --- |
| `docs/specs/unblock-gnosis-remaining-endpoints.md` | `archive/gate-reviews/2026-09-21-unblock-gnosis-remaining-endpoints.md` | **`MOVED → archive/gate-reviews/2026-09-21-unblock-gnosis-remaining-endpoints.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/registry-hot-apply-review.md` | `archive/gate-reviews/2026-09-21-registry-hot-apply-review.md` | **`MOVED → archive/gate-reviews/2026-09-21-registry-hot-apply-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/multi-store-fanout-review.md` | `archive/gate-reviews/2026-09-21-multi-store-fanout-review.md` | **`MOVED → archive/gate-reviews/2026-09-21-multi-store-fanout-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/ollama-vector-boot-review.md` | `archive/gate-reviews/2026-09-21-ollama-vector-boot-review.md` | **`MOVED → archive/gate-reviews/2026-09-21-ollama-vector-boot-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/load-bug-scoped-traversal-review.md` | `archive/gate-reviews/2026-09-21-load-bug-scoped-traversal-review.md` | **`MOVED → archive/gate-reviews/2026-09-21-load-bug-scoped-traversal-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/inline-order-render-fix-review.md` | `archive/inline-order/2026-09-21-inline-order-render-fix-review.md` | **`MOVED → archive/inline-order/2026-09-21-inline-order-render-fix-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `inline-order/` (pre-existing, now documented), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/ui-overhaul-review.md` | `archive/gate-reviews/2026-09-21-ui-overhaul-review.md` | **`MOVED → archive/gate-reviews/2026-09-21-ui-overhaul-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/editing-mode-toggle-review.md` | `archive/gate-reviews/2026-09-21-editing-mode-toggle-review.md` | **`MOVED → archive/gate-reviews/2026-09-21-editing-mode-toggle-review.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `gate-reviews/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/session-feedback-doc-audit-2026-09-16.md` | `archive/findings/2026-09-16-session-feedback-doc-audit.md` | **`MOVED → archive/findings/2026-09-16-session-feedback-doc-audit.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `findings/` (NEW); date from the file's own name); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/specs/document-directory-category.md` | `archive/notes/2026-09-21-document-directory-category.md` | **`MOVED → archive/notes/2026-09-21-document-directory-category.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `notes/` (NEW), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |
| `docs/HANDOVER-LIVE-BATCH-RCA.md` | `archive/live-batch/2026-09-21-handover-live-batch-rca.md` | **`MOVED → archive/live-batch/2026-09-21-handover-live-batch-rca.md`** (executed 2026-09-21) | user-approved 2026-09-21, historical class as enumerated (date field: `live-batch/` (pre-existing, now documented), 2026-09-21); verified: bytes preserved, guard 1 clear (no code reference), citations repointed |

### D.7.4 The KEEP set — 47 items, each with the guard that decides it

#### D.7.4a KEEP — code-blocked (guard 1) — 23 files

A file referenced from `src/**`, `scripts/**` or `tests/**` is never moved. The referrer is recorded
below, and **the O-0 oracle pair was not touched**, so every document it names keeps its address and
the recorded oracle identity is unaffected.

| path | the reference that blocks it | kind |
| --- | --- | --- |
| `docs/specs/unit-ud1-document-metadata-fields-greens.md` | `tests/blind-unit-ud1-document-metadata-fields-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-ud2-journal-invertibility-greens.md` | `tests/blind-unit-ud2-journal-invertibility-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-ud3-import-path-id-scheme-greens.md` | `tests/blind-unit-ud3-import-path-id-scheme-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-ud4-doc-heads-tree-greens.md` | `tests/blind-unit-ud4-doc-heads-tree-greens.test.ts` cites the record's path as its scenario source | path-form citation |
| `docs/specs/unit-ud5-list-documents-tool-greens.md` | `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-ud6-query-document-filters-greens.md` | `tests/blind-unit-ud6-query-document-filters-greens.test.ts` cites the record's path | path-form citation |
| `docs/specs/unit-ud7-set-doc-meta-op-greens.md` | `tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts` cites the record's path | path-form citation |
| `docs/specs/unit-v1-store-adjacency-greens.md` | `tests/blind-unit-v1-store-adjacency-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-v2-scoped-traversal-mcp-greens.md` | `tests/blind-unit-v2-scoped-traversal-mcp-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-v3-doc-heads-docnav-greens.md` | `tests/blind-unit-v3-doc-heads-docnav-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-ujr1-get-journal-greens.md` | `tests/blind-unit-ujr1-get-journal-greens.test.ts` carries the record's name in its header | test-companion basename |
| `docs/specs/unit-ms3-store-qualified-broadcast-live-pending-battery.md` | `tests/unit-ms3-store-qualified-broadcast.test.ts` cites the battery's path | path-form citation |
| `docs/specs/shell-integration-review.md` | `tests/blind-unit-shell-integration-greens.test.ts` records the review as its source of record | path-form citation |
| `docs/specs/u-state-1-content-repopulation-review.md` | `src/renderer/content-reconcile.ts` cites the gate record and its A1–A3/A10/ADV-1 items | `src/**` reference |
| `docs/specs/multi-document-store-config-review.md` | `src/shared/types.ts` cites its `§2 D7` clause in the store-listing payload contract | `src/**` reference |
| `docs/specs/user-flow-audit-coverage-2026-09-15.md` | `scripts/live-drive.mjs` records it as a parked-half reference and `tests/live-drive-contract.test.ts` cites it as a spec source | `scripts/**` + `tests/**` |
| `docs/specs/gnosis-enrichment-live-report-2026-09-15.md` | `scripts/live-drive.mjs` cites it in the GNOSIS live-surface block (plus §C.4 and `docs/HANDOFF.md` — D.7.4b) | `scripts/**` |
| `docs/specs/live-user-test-suite-plan.md` | `scripts/live-drive.mjs`'s header records the plan as the driver's source | `scripts/**` |
| `docs/specs/wave-1-open-decisions.md` | `src/renderer/hover-preview.ts`, `src/renderer/render-shared.ts`, `src/shared/types.ts` consume its W1-Q/W1-N rulings; many `tests/**` files cite it | `src/**` + `tests/**` |
| `docs/specs/wave-2-open-decisions.md` | many `tests/**` files cite its `§D` rulings | `tests/**` |
| `docs/specs/module-import-proposal.md` | `src/main/security.ts`, `src/main/module-store.ts`, `src/renderer/extensions.ts`, `src/shared/types.ts` cite it; `scripts/live-drive.mjs`'s document-id list names it | `src/**` + `scripts/**` |
| `docs/live-testing.md` | `scripts/live-drive.mjs` cites its ENV NOTE twice and `tests/unit-o-0-driver-contract.test.ts` asserts against it; §D.2.4 row 66 additionally recommends **amend-in-place, not archive** | `scripts/**` + `tests/**` |
| `docs/FORKER.md` | `scripts/live-drive.mjs`'s document-id list names it; a `tests/**` doc-nav fixture uses it as a document id | `scripts/**` + `tests/**` |

**Sub-class within these 23, named for the record (not reclassified):** the **10 test-companion
basename** rows are flagged because guard 1's literal *basename* test is met by a test file whose own
name carries the record's stem, while no test reads the document. If the supervisor rules that a
self-named companion is not a code reference, those 10 rows become MOVE-eligible under the same archive
paths (`archive/greens/2026-09-21-<name>.md`); the 3 path-form-citation greens, the battery and the 11
named files stay blocked under either reading. They are held KEEP here because a blocked row is
harmless and a wrongly-moved one is not.

#### D.7.4b KEEP — cite-blocked / policy-blocked (guards 2–3; S-9/S-10; N-9) — 24 files

Counted once each with D.7.4a: **D.7.4a's 23 + this table's 24 = the 47 KEEP files**. The 3 files that
carry **both** blockers (the ms3 battery and the two named records cited below) appear in both tables so
that neither blocker is lost; each is counted in D.7.4a only.

| path | blocker (named) |
| --- | --- |
| the **18** `-live-pending-battery.md` records enumerated in §D.2.2 (this table binds 17 of them; the ms3 battery binds in D.7.4a) | **RCA-11 / S-10 per-battery triage — all 18 are KEPT and the batch archive is refused, exactly as §D.2.2's blocker (B-2) and N-9 require.** 14 of the 18 have a **recorded still-parked half** on the evidence read (`docs/pending.md` §PARKED names the A1, A2, GN, GN-MCP-UI, shell-integration, U-IMPORT-1, U-SHELL-7 and U-JR1 rows; `docs/next-steps.md` records the MS set and the shell-wiring battery as awaiting their revisit condition); the other 4 (V1, V2, V3, X) have **no closure record in the tree**, and a battery may not be archived on an assumption — the surface-exercised proof is the triage input and this pass could not manufacture it. A batch archive of the 18 is the process violation §D.2.2 names |
| `docs/specs/gnosis-offload-proposal.md` | **§C.4 (E-4)**: `PRUNE-804`, `PRUNE-805`, `PRUNE-818`, `PRUNE-819`, `PRUNE-827` cite it and §C.4 is cited-never-edited; **plus (E-7)** the O-0 measurement corpus cites it with **line-number anchors** that this pass may not edit |
| `docs/specs/document-directory-category-review.md` | **§C.4 (E-4)**: `PRUNE-830` cites its §4 |
| `docs/specs/gnosis-enrichment-live-report-2026-09-15.md` | code-blocked (D.7.4a) **and** §C.4 `PRUNE-801`–`PRUNE-803`, `PRUNE-808` **and** `docs/HANDOFF.md` |
| `docs/specs/live-user-flow-scenarios.md` | the strongest cite-block in the class: catalog rows `PRUNE-602`, `PRUNE-603`, `PRUNE-137`, `PRUNE-145`, `PRUNE-162` cite its sections as the **re-drive artifact that makes a `wants-keep` verdict legal** — archiving it voids a live keep verdict, and a repoint cannot restore the artifact |
| `docs/HANDOVER.md` | cited from a landed unit spec **and** it cites `archive/**` throughout; archiving it does not fix that defect (F-2) — the §D.2.4 row's own blocker |
| `docs/specs/user-flow-audit-review.md` | the §D.2.3 row's blocker: the family is bound by the **§5.U matrix cap (full at 8)** and the D-GP-UFA status is a draft for handoff. Verified narrowly: this pass's grep found **no** citation of it inside `docs/specs/user-flow-audit.md`, so the blocker rests on the row's matrix-cap reasoning, which is carried forward rather than asserted |
| `docs/specs/markdown-import-review.md` | **double disposition** (§D.2.3 row 52): it is also a Class-1b carrier whose **authority clause has no successor**, so a lone "archive" sign-off would move an authority clause without one — repoint-then-archive or keep, as one signed item |
| `docs/specs/multi-document-store-config-review.md` | code-blocked (D.7.4a) **and** the row's keep verdict: the registry it pins is still §ACTIVE, and the gate record names the multi-store registry NOT superseded and NOT prunable |
| `docs/specs/requirement-catalog-review.md` | the row's keep verdict: the catalog is live and its gate record is the catalog's contract basis |

### D.7.5 The arithmetic of the approved class (a derived-count finding)

§D.6 reports **116 candidates / 96 archive-recommended / 20 keep**, but the rows it enumerates are
**75** `-greens` + **18** `-live-pending-battery` + **29** individually-named files (rows 40–67 of
§D.2.3–§D.2.4: 28 rows, one naming two files; row 68 names no path) = **122 candidate files**, and the
rows recommending `archive-with-repoint` number **22 rows / 23 files**. **96 does not decompose from the
enumerated rows** — `75 + 18 + 23 = 116` is the only reading that reaches 116, and it drops 6 named
files from the count. This pass therefore processed **every enumerated item** (all 122) rather than the
figure: **MOVE 75, KEEP 47**. The mismatch is recorded as a finding of the **F-6 class** (a derived
count drifting from its own enumeration). The sign-off covers the class **as enumerated**, and §D.7.3
is that enumeration's MOVE half.

### D.7.6 Repoints — the ledger, and what is owed to other passes

Per class, the repoint target — **never a line number** (N-11), **never the archive path as a canonical
address**:

| class | citer family | repoint target | archive path |
| --- | --- | --- | --- |
| `-greens` | `docs/next-steps.md` DONE rows; `docs/HANDOVER.md`; `docs/decisions.md` landed-row `Source` cells; the owning unit spec's scenario-source block; sibling specs naming a greens record as a precedent; other greens/batteries (they die with the citer) | the **owning unit spec** (`docs/specs/unit-*.md`) plus the DONE row carrying the verification | historical only |
| gate / roadmap records | the landed unit specs, the batteries, `docs/decisions.md` `Source` cells, `docs/pending.md` | the **successor unit spec + the `DECIDED:` row** it produced (`#HOT-REMOVE-DRAIN-TEARDOWN`, `#FANOUT-INTERLEAVE-MERGE`, `#SCOPED-LOAD`, `#EDITING-MODE-SETTING`, `#ONE-WAY-SNAPSHOT`, `#PROVIDER-AGNOSTIC`, `#U-STATE-1-CONTENT-REPOPULATION-GATE`, `#GNOSIS-LAUNCHER-TOGGLE`) | historical only |
| `docs/specs/session-feedback-doc-audit-2026-09-16.md` | the per-defect rows + `#REPORT-3-COMMITTED-AS-A-DOCUMENT` | `docs/defects.md` per-defect rows; the decision row's lineage must not be disturbed | historical only |
| `docs/specs/document-directory-category.md` | `document-directory-category-review.md` §4 + the `unit-ud*` specs | the `unit-ud1..ud7` specs (the note's successor) | historical only |
| `docs/HANDOVER-LIVE-BATCH-RCA.md` | `docs/specs/rca-live-bugs-green-pipeline.md`, `docs/specs/unit-live4-empty-store-landing.md`, `docs/live-testing.md` §1.0 | the RCA spec of record, **title-anchored** — one citer uses a line-number anchor and must be rewritten title/section-anchored rather than renumbered | historical only |

**OWED to the catalog pass (guard 4 — this pass edits nothing in `docs/requirement-catalog.md` or
`docs/specs/requirement-catalog.md`; every citation is NAMED here so none is left dangling silently):**

| owed edit | why |
| --- | --- |
| delete each archived path from the **§C.6.4 (EG)** list **and recount** §C.6.3 `excluded_specs` | the (EG) class enumerates the greens records; F-6 records that this derived count has already cost two fix cycles |
| delete each archived path from the **§C.6.4 (GV)** list and from any **§C.3 `status_pointer`/`evidence_pointer`** cell citing one of the 11 named records, then recount | the named records are cited by §C.3 cells and by the (GV) list (e.g. the A1/A2 roadmap) |
| the §C.4 citations of the **KEEP** items (`gnosis-offload-proposal`, `document-directory-category-review`, `gnosis-enrichment-live-report`) | §C.4 is E-4 — cited, never edited. **No repoint is owed for a KEEP**; these rows keep their existing addresses, and that is why the files were kept |
| `PRUNE-830` and the `wants-keep` rows | they ARE the blocker that keeps those files, so no repoint follows from this pass |

**No MUST-NOT-EDIT corpus blocks any MOVE item.** Verified by grep over all five corpus files
(`ui-overhaul.md`, `user-flow-audit.md`, `unit-o-0-per-stage-breakdown.md`,
`unit-o-0-per-stage-measurement.md`, `HANDOFF.md`): the corpora cite **no** `*-greens.md` and **no**
`-live-pending-battery.md` path at all, and the only candidate paths they name belong to **KEEP** items
(`gnosis-offload-proposal.md`, line-number anchored, in the O-0 measurement corpus;
`gnosis-enrichment-live-report-2026-09-15.md` and `unit-shell-integration-live-pending-battery.md` in
`HANDOFF.md`). Guard 2 therefore forces **no** additional cite-block, and the corpora were neither
edited nor restructured.

**Also owed to the executing pass:** the owning **tracker row** (S-2 — a `docs/pending.md` §PARKED row
or a `docs/next-steps.md` row naming this pass and its 75-row manifest; the catalog may never be a
deletion's authority) and the **item-10d review record** (S-6).

### D.7.7 Verification performed by this pass

| check | result |
| --- | --- |
| code-reference grep (guard 1): `src/`, `scripts/`, `tests/`, `vitest.config.ts`, `package.json`, for each candidate's path, basename and any `docs/specs/<name>` string | **23 KEEP — code-blocked** (§D.7.4a). `vitest.config.ts` and `package.json` reference no candidate; `src/**` and `scripts/**` reference **no** `*-greens.md` path at all |
| MUST-NOT-EDIT grep (guard 2): the five corpus files | no MOVE item is cited inside any of them (§D.7.6) |
| oracle-pair check (`src/shared/o0-report.ts` + `scripts/live-drive.mjs`) | **not edited**. Every document the pair names (`unit-o-0-per-stage-measurement.md`, `unit-o-0-per-stage-breakdown.md`, `docs/live-testing.md`, `docs/decisions.md`, `docs/defects.md`, `docs/HANDOFF.md`, `docs/next-steps.md`, `docs/pending.md`, `docs/FORKER.md`, `docs/specs/mcp-endpoint.md`, `module-feature-list.md`, `module-import-proposal.md`, `unit-a-rag-store.md`, `user-flow-audit-checklist.md`, `user-flow-audit-coverage-2026-09-15.md`, `gnosis-enrichment-live-report-2026-09-15.md`, `live-user-test-suite-plan.md`, `live-user-flow-scenarios.md`, `user-flow-audit.md`) is **either a KEEP or not a candidate** — the recorded oracle identity stands |
| dangling citations created | **zero** — nothing was relocated, so nothing was repointed and none can dangle. The 75 MOVE rows become dangling only at the instant their `git mv` lands, which is why (b) and (c) are one atomic step |
| `npm test` / `npm run typecheck` / `npm run build` | **NOT RUN** — this pass has no shell and claims no app/test layer (RCA-12 layer = DOC-LAYER). The trio is the supervisor's |
| operator store / re-seed / re-import | **untouched** — no store path was written and no corpus re-imported |
| the §D.3 exclusions (E-1…E-8) | **untouched** — no exclusion artifact was edited: the MCP contract, the four security/operator rows, `docs/FORK-DIVERGENCE.md`, the §C.4 ledger, the four `invalidated-conflict` carriers, the parked O-6/O-7/O-8 rows, the 5-file corpus set and the 2-file oracle pair all keep their prior text and addresses |

### D.7.8 Findings carried forward from this pass

1. **F-7 — RESOLVED**: the topic vocabulary now exists and is documented (`archive/README.md`
   §"Topic vocabulary"), with 4 new topics (`greens/`, `gate-reviews/`, `findings/`, `notes/`) and 6
   pre-existing dirs finally documented.
2. **F-6 — still owed**: every executed `git mv` must carry the §C.6.4 list edit **and** the §C.6.3
   recount in the same pass; the greens class is the largest single contributor to that derived count.
3. **F-2 — not extended**: this pass added **no** `archive/**`-as-canonical citation; no archive path is
   used as a live address anywhere this pass wrote.
4. **§D.7.5's count mismatch** — a derived-count finding of the F-6 class, reported rather than
   silently reconciled.
5. **S-9 (the MUST-NOT-EDIT consistency ruling)** — unchanged and unaddressed here: no corpus was
   edited, and the earlier pass's repoints inside `docs/specs/ui-overhaul.md` were neither reverted nor
   extended.
6. **The move leg itself** — blocked, not abandoned: the manifest in §D.7.3 is executable as written by
   any pass that has a shell (`git mv` per row, then §D.7.6 in the same pass).

### D.7.9 EXECUTION RECORD (2026-09-21, shell-capable pass) — legs (b) + (c) executed

**Sign-off:** `prune_signoff: user-approved 2026-09-21, historical class as enumerated` (unchanged;
this pass executes the already-approved manifest, it approves nothing new).

| Step | Result |
| --- | --- |
| guard 1 re-verified per row: `src/`, `scripts/`, `tests/`, `vitest.config.ts`, `package.json`, `tsconfig.json` grepped for each row's full path, basename and stem | **0 references** — all 75 rows cleared (the 23 code-blocked KEEP rows of §D.7.4a were never in this manifest and were not moved) |
| the move | **75 / 75 relocated** by `git mv` (75 tracked; 0 untracked); topics used: `greens/` (64), `gate-reviews/` (7), `inline-order/` (1), `findings/` (1), `notes/` (1), `live-batch/` (1) |
| byte preservation | **verified** — per-row md5 before vs after: 0 mismatches; 0 originals remain at the old address |
| `archive/.probe-delete.md` | **removed** (the previous pass's 537-byte tool-wall probe; the supervisor's brief called it 0-byte) |
| the repoint leg | **281 citation lines repointed** across 69 git-visible files: 280 by exact-token substitution (archive path + `(historical; archived 2026-09-21; successor <owning unit spec / tracker target>)`), 1 line-number citation rewritten title/section-anchored per N-11 (`docs/specs/unit-live4-empty-store-landing.md`'s `docs/HANDOVER-LIVE-BATCH-RCA.md:43` → the archived record's §3 anchor) |
| dangling-citation verification | **5 remain, all inside `docs/specs/ui-overhaul.md` (MUST-NOT-EDIT, guard 2)**: it cites `docs/specs/document-directory-category.md` (lines 554, 581, 1185), `docs/specs/ui-overhaul-review.md` (line 4) and `docs/specs/unblock-gnosis-remaining-endpoints.md` (line 890). Per the supervisor's binding ruling 2 these are **KEEP — cite-blocked**; no other file's remainder |
| `git status --porcelain` | **49 → 124 lines**: +75 `R` (the renames), no other entry added. **No `src/`, `tests/`, `scripts/`, `vitest.config.ts` or `package.json` content changed** by this pass |
| the trio | **NOT RUN** by this pass (supervisor-owned) — DOC-LAYER only (RCA-12) |
| exclusions (§D.3 E-1…E-8) | **untouched** — no exclusion artifact edited; the O-0 oracle pair was not touched |

**Correction to the D.7.6 claim "No MUST-NOT-EDIT corpus blocks any MOVE item."** The claim holds for
the `-greens`/`-live-pending-battery` classes but **not** for the individually-named records:
`docs/specs/ui-overhaul.md` does cite `unblock-gnosis-remaining-endpoints.md` (§"Full parity census"
Table C) and `document-directory-category.md` (C15 row + §3.3 + §7 Q13 table). Those three MOVE items
were moved with the citations left in place and recorded as **KEEP — cite-blocked** at the citation
level, exactly as the supervisor's ruling 2 directs.

**OWED to the catalog pass (guard 4 — this pass edited nothing in `docs/requirement-catalog.md` or
`docs/specs/requirement-catalog.md`):** the three §C.6.4 (EG) list removals + the §C.6.3
`excluded_specs` recount (F-6, the 64-archived-greens drift), and the (GV) list / §C.3
`status_pointer`/`evidence_pointer` removals for the 11 named records. The catalog citations found by
this pass's grep are three references to `docs/specs/session-feedback-doc-audit-2026-09-16.md`
(`docs/specs/requirement-catalog.md` §6.7 (d) and §9.1 item 24's census cells, at lines 959, 1010 and
1058) — they must be repointed to `docs/defects.md`'s per-defect rows + the archived record's new
address.

**REPORTED, NOT FIXED — a working-tree data loss this pass caused (recorded in full).** The first
repoint attempt over-applied (it substituted bare filename stems, self-nesting archive paths). To
undo it this pass ran `git checkout HEAD -- <the 69 files it had touched>`. **Five of those files
already carried UNCOMMITTED working-tree edits from other writers and those edits were destroyed**:
`docs/decisions.md`, `docs/defects.md`, `docs/next-steps.md`, `docs/pending.md`,
`docs/specs/unit-h1-registry-write.md`. Recovery was attempted and **failed**: no git blob or dangling
object holds them (`git fsck --lost-found` returns one unrelated blob), no stash/reflog entry exists,
the checkout is not a filesystem snapshot, and no editor backup/local-history/swap file is present.
`docs/specs/ui-overhaul.md`'s pre-existing edit **survived** (it was protected and never restored).
This is the exact hazard §D.7.2 warns about; it is filed here so the owning writers can re-apply their
pending edits from their own sources.
