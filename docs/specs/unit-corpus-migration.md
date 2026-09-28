# UNIT `U-CORPUS-MIGRATION` — the operator-corpus cutover to engine authority (with a rollback story) — Spec

**Status:** **SPEC — authored; no code landed, no red set run.** This unit is the **P2 prerequisite
`U-CORPUS-MIGRATION`**: the *named migration unit* the design-extensions gate owes a future cutover
(`docs/specs/design-extensions-review.md` — the named ruling "the existing corpus (**226 docs /
6 102 nodes / 9 266 edges**) has **NO migration story** → any future cutover owes a **named migration
unit**", and the gate's **§3.6 F.3 item 9** "must NOT" clause — "must not edit the pinned corpora …
and must not re-seed the operator store (the
`O0_OPERATOR_DOCUMENTS = 226` census gate)"). It is **one unit, one spec, one red run, one green, one
adversarial pass, one doc review, one DONE row** (AGENTS.md item 3/RCA-1, item 2/RCA-2, item 10d/RCA-6).
Nothing in this file is app-green, envelope-green, store-green or live-green (RCA-12).

**Layer (RCA-12, mandatory declaration).** Three layers are declared **separately** because this
unit's subject spans them, and every DONE row must state which layer each verification covers:

| Sub-surface | Layer | What it is |
| --- | --- | --- |
| the plan / census / verification / rollback **decisions** (dry-run report shape, the verification checks, the rollback procedure) | **MAIN-PROCESS / STORE layer** | `RagStore` reads + pure functions over the two stores' public surfaces. Node-testable: a real `createJsonRagStore({path})` over a temp file (`mkdtempSync`) on BOTH sides, and a real source corpus built by `applyBatch`. |
| the **executed cutover** against a host-side target store | **MAIN-PROCESS / STORE layer** | driven through `applyBatch` + the source `persistenceFile`. Node-testable **end to end** on two temp files; the assembled app is not in the loop. |
| the **assembled app** (boot with the cutover registry, the renderer's re-traversal over the new authority, the operator-visible report/warning) and **the external engine leg** | **APP / ASSEMBLED layer + OUT-OF-REPO layer** | **structurally unassertable in node.** RCA-11 applies **in the strongest form**: this unit, if it ever runs for real, touches the **assembled app** *and* an **external process (the Gnosis engine)**. See §10.3 for what a green covers and what it does not. |

**Owes (§10):** its own TestWriter red run (RCA-1, **recorded** in the DONE row), an Implementer green,
the trio (`AGENTS.md` item 4), an RCA-3 adversarial pass recorded in §6a/§6b, RCA-4 blind greens by a
non-author, an item-10d documentation review, and a **§5.x typed Property register** (§5 — **6 rows**).

**Depends on (upstream of this spec).** The engine leg of this contract is **OWED UPSTREAM and does not
exist today** — §2.3 states exactly which capabilities are owed and to whom. The contract is therefore
spec'd **spec-first** (the `TAB-2` precedent: "spec-first; no code until the predicate is pinned",
`docs/specs/design-extensions-review.md` §3.3 C10): the **decision** half is landable now, the
**engine-destination execution** half is **BLOCKED** until the upstream handoff lands (§9).

**Citations.** Every citation below is `path` + symbol / row id / `§section`. **No line number appears
anywhere in this file**, and no citation points at `archive/**`, which is gitignored.

---

## 1. What this unit asks

A cutover makes the **Gnosis engine** the authority for the operator's persisted corpus. Today the
authority is a local JSON file per store (`createJsonRagStore` over each registry entry's
`persistenceFile`), and the engine **persists nothing** (`docs/HANDOFF.md` O-7 pointer row: "the engine
has **NO markdown parser, NO bulk route, NO progress contract, and NO persistence**"; §PARKED
DESTINATION O-7's `Recorded constraints` cell). **⟨CORRECTED 2026-09-28 (`X-7`) — THE PREMISE OF THIS SENTENCE IS STALE AND THE UNIT'S OWN BLOCKER IS NOT: the *"NO persistence"* half is answered engine-side (`D-D1`+`D-D2` = DONE, LANDED-GREEN + ALL GATES RUN 2026-09-22; `GR-7`'s trigger DISCHARGED — `../Gnosis/docs/next-steps.md` §DONE rows; `../Gnosis/docs/pending.md` `GR-7`; `docs/decisions.md` `DURABLE-STORE-LANDED`) — ENGINE-green, never app-green, and UNVERIFIED LIVE from this repo. What stands is the other half: **NO markdown parser, NO bulk route, NO progress contract** — the INGEST half — plus this unit's own owed capability, the record-copy route with caller-supplied ids (`GR-6a`/`GRQ-6`, PARKED, trigger UNDISCHARGED). §10.3's `BLOCKED (FS-CM-1)` reading is therefore UNCHANGED and re-sourced.⟩** A cutover without a migration story and without a
rollback story is the single least-reversible action in the design-extensions input
(`docs/specs/design-extensions-review.md` §9.2, the reversibility row "An operator-corpus cutover"):
"the local corpus is a whole-store JSON file whose rewrite is a one-way operation on the operator's
data".

This unit pins, **before any code**:

1. **What migrates and what does not** (§3) — documents, nodes, edges, doc-flow edges, the doc-head
   marker prop, `documentPath`/`tags` metadata, and the **exact id scheme**; and the disposition of the
   **project journal**, the **operator settings / template / security stores**, and the **vector cache**.
2. **The mechanics** (§4) — the route (which **does not exist upstream for an engine destination**, and
   which is **record copy, NOT markdown re-import** — §4.2), ordering, atomicity, the progress/cancel
   contract (**owed upstream for the engine leg**), the 512-file cap's reach, and the **idempotency** rule.
3. **Verification** (§5) — census equality, a per-document content-hash diff, doc-flow/doc-head
   integrity, retrieval parity, and what a FAILURE does.
4. **The rollback story** (§7) — the retained artifact and where it lives, the retention window, the
   procedure and **its own verification**, and the "never two authorities live" rule.
5. **The dry-run/rehearsal** (§8) — a non-destructive mode and the operator-facing report shape.
6. **The typed §5.x Property register** (§5) — 6 rows, at the ≤8 cap.
7. **Fail-states** (§6) with FS ids, and the unit process (§10).

**What this unit does NOT do** (each a review finding if present): it does **not** re-derive the fence
suites; it does **not** touch the O-0 oracle pair; it does **not** re-seed the operator store; it does
**not** patch the engine; it does **not** supersede `RAG-AUTHORITATIVE` / `SINGLE-WRITER-STORE` /
`SINGLE-WRITER-STORE-PER-STORE` / `ASTROGRAPHER-SCOPE-REALIGNMENT` (§9.3).

---

## 2. The contract

### 2.1 The four obligations a cutover must satisfy

| # | Obligation | Why it is non-negotiable |
| --- | --- | --- |
| **O1** | **The census is preserved exactly** — 226 documents / 6 102 nodes / 9 266 edges, measured **per store**, with the **same ids**. | The census is an **oracle** (`src/shared/o0-report.ts` `O0_OPERATOR_DOCUMENTS = 226`) and the ids are load-bearing for every edge endpoint, every `documentIds` entry, every `documentPath`/`tags` row and every `ownedNodeIds` declaration. |
| **O2** | **No id is re-minted.** A migration that re-mints (e.g. by re-parsing markdown) changes every id and silently orphans every reference. | `STORE-ID-PREFIX` (`docs/decisions.md`) pins the `<name>:` minting seam; `MIGRATION-LEGACY-PATH` pins the legacy file name. A re-mint is a **different corpus**, not a migrated one. |
| **O3** | **All-or-nothing, and the source is never touched.** A failure leaves the source byte-identical and the target at its pre-migration state. | `BATCH-ATOMICITY-API` (`docs/decisions.md`) is the primitive; `IMPORT-BATCH-PERSIST`'s invariant "NO PER-OP FULL-STORE WRITE INSIDE A BATCH" is the cadence. |
| **O4** | **A rollback restores the exact prior state, and no rollback leaves two authorities live.** | The corpus is the operator's data; `ENGINE-ABSENT-DEGRADED-CONTRACT` and `SINGLE-WRITER-STORE` are only meaningful if exactly one authority is live at a time. |

### 2.2 The route: **the shell cannot be the destination, and the engine has no route yet**

Verified against the tree this pass (cite by symbol):

- The engine client `src/main/engine-rag-store.ts` `EngineRagStore` is a **retrieval-trio + health
  proxy only** — `ragQuery` / `ragStream` / `getEngineStatus` / `health` / `waitForReady`. **There is no
  write, ingest, bulk, or commit method on it**, and `ENGINE_ENDPOINTS` names no ingest path.
- `docs/HANDOFF.md` O-7 pointer row states the engine's gap in terms: **no markdown parser, no bulk
  route, no progress contract, no persistence**, and that "the shell's single atomic `applyBatch` + its
  512-file fail-loud cap + the one-shot `IPC_IMPORT_RESULT` all have no engine equivalent".
- `docs/specs/design-extensions-review.md` §3.2 B.1 reason 1: superseding the local authority
  **now** turns the corpus into a **restart-loss condition**; §3.2 B.1 reason 2: **O-8 is the track's
  PREREQUISITE, not a tail unit.**

**Therefore:** the route to an **engine destination is OWED UPSTREAM and does not exist**. §2.3
enumerates it by name. §4.2 pins the route for a **host-side (JSON-store) destination**, which is the
**reference target** the contract is verified against and which exists today. A green against the
reference target is a **STORE-layer green for the migration MECHANISM only** — it is *never* evidence
that the engine leg works (§10.3).

### 2.3 The capabilities OWED UPSTREAM (the engine project `../Gnosis` — never patched from here)

| Upstream id | Capability this contract requires | Source of record |
| --- | --- | --- |
| **`U-ENGINE-PERSIST` / GR-7** | **Server-side persistence for the engine store**: a durable corpus that survives a restart, with atomic commit semantics and a stated meaning for a revision across a restore. | `docs/HANDOFF.md` O-7 pointer row; `docs/feature-requests/gnosis-engine-feature-requests.md` §GR-7; catalog ledger `PRUNE-807` / `PRUNE-838`; `docs/specs/design-extensions-review.md` §3.2 B.1 |
| **`O-7` / GR-6 (the bulk ingest route)** | **A bulk markdown parse + a doc-flow validate + a bulk/batch-ATOMIC ingest route** with a **progress/cancel contract** and a **cap**, plus the node-model mapping. | `docs/HANDOFF.md` O-7 pointer row; `docs/pending.md` §PARKED DESTINATION row **O-7**; `docs/feature-requests/gnosis-engine-feature-requests.md` §GR-6; catalog ledger `PRUNE-806` / `PRUNE-819` |
| **`O-8` / GR-4 + GR-5 (the authority switch)** | **The single-writer / authority-switch contract** (who owns the persisted corpus during and after a cutover; split-brain + offline-write reconciliation), a **store-change notification route** with a monotonic marker, and **one bulk read** of a store's nodes/edges/adjacency with stable identity. | `docs/HANDOFF.md` O-8 pointer row; `docs/pending.md` §PARKED DESTINATION row **O-8** (the `PREREQUISITE` clause); catalog ledger `PRUNE-804` / `PRUNE-805` / `PRUNE-820`; `docs/specs/design-extensions-review.md` §3.2 B.1 |
| **a host→engine record-copy route** | **A route that accepts host-authored records with CALLER-SUPPLIED ids** (not only markdown files it parses itself). Without it, **O2 cannot be honoured**: a parser-side ingest re-mints ids. | derived from O-7's gap statement + obligation **O2** (§2.1); this request is **not yet filed** and §9.1 records it as owed |

**`docs/HANDOFF.md` is cited, never edited, by this unit** (`docs/specs/design-extensions-review.md`
§5.2, the `docs/HANDOFF.md` row: "no row is owed … the O-7/O-8 pointer rows already exist and are
**cited, never edited**"). This unit **does not patch the Gnosis repo**.

### 2.4 The decision this unit PINS — the route for the reference target

> **PINNED (`DECISION-CORPUS-MIGRATION-ROUTE`):** the migration to a **host-side (JSON-store)**
> destination is an **exact record copy**: `listNodes()` + `listEdges()` are read from the source store
> and written to the destination as **ONE `applyBatch`** — **all `{op:'putNode'}` ops first, then all
> `{op:'putEdge'}` ops** (the `importMarkdownCorpus` op-construction order, referential integrity
> preserved). The migration **NEVER re-parses markdown** and **never calls `importMarkdownCorpus`**.

**Why not reuse `importMarkdownCorpus` (verified, three independent reasons).**
1. **It re-mints every id.** `parseMarkdown` mints node ids (`` `${documentId}:${type}:${n}` `` per
   `STORE-ID-PREFIX`'s own description); the resulting ids are **not** the source's ids. That violates
   **O2** and orphans every edge endpoint, `documentIds` entry, `ownedNodeIds` declaration and
   `documentPath`/`tags` row.
2. **It drops record-level fields the corpus carries.** The source records carry `nodeKind`,
   `children[]` (with the Unit M1 `offset` run slots), `documentPath`, `tags`, `props` (incl. the
   doc-head marker prop), `ownedNodeIds`, `edgeType`, `state`, `order`, `documentIds`, and the
   `createdAt`/`updatedAt` pair. A parse-from-markdown path re-derives its own values for these; a
   record copy preserves them.
3. **Its `nodeCount`/`edgeCount` are the BATCH SIZE, not the store totals** (`ImportMarkdownResult`'s
   own doc-comment). The census check (§5.1) requires **store totals**, so an import result could not
   discharge it.

**Why the destination's content hashes are correct by construction.** The destination writes through
`applyBatch` → `applyBatchOp` → `insertNode`/`insertEdge`, which compute `nodeHash(base)` /
`edgeHash(base)` from `nodeSource`/`edgeSource` **at write time**. Because the record copy supplies the
source's exact field values, the destination's derived hash is **byte-equal to the source store's
derived hash** for every record — which is exactly what the destination's **boot re-verification**
re-checks (`load`, the stored-hash-mismatch → `quarantined` branch). A migration that mutated any
hashed field would produce a **silently quarantined destination**, which is why §5.2 asserts the hash
equality rather than assuming it. Note the fixed field order of `nodeSource`/`edgeSource`: a record
copied through the public `RagNode`/`RagEdge` shape reproduces it, and the **public copies already
normalize** the two fields that could otherwise diverge (`toPublicNode`/`toPublicEdge` carry
`documentPath`/`tags` post-normalization and default `edgeType`/`state`); the migration MUST read the
source through the **public** surface, never through the store file directly.

---

## 3. What migrates, and what does NOT

### 3.1 MIGRATES (per addressed store)

| Artifact in the source store | Migrates as | Conservation rule |
| --- | --- | --- |
| **Documents** (document root nodes) | the source's document-root `RagNode` records, with their `documentPath`/`tags` | **count preserved exactly**; the document-id set is preserved **exactly** (§3.3) |
| **Nodes** (`RagNode[]`) | `{op:'putNode'}` ops, one per record, **ids unchanged** | count preserved exactly; every hashed field preserved verbatim (§2.4) |
| **Edges** (`RagEdge[]`) | `{op:'putEdge'}` ops, one per record, **ids unchanged** | count preserved exactly; `kind`/`order`/`documentIds`/`edgeType`/`state` preserved verbatim |
| **Doc-flow edges** (`doc-head` / `next-section` / `doc-end`) | ordinary edges in the copy (they ARE store records) | the **doc-flow verdict** is re-established and asserted after the write (§5.3) — `validateDocFlow` returns `{ok:true, order}` for every document on the destination |
| **`doc-child` edges** | ordinary edges in the copy | `order` preserved (it is a hashed field); nesting acyclicity asserted on the destination |
| **`crosslink` edges** | ordinary edges in the copy | `edgeType`/`state` preserved |
| **The doc-head marker prop** | the node's `props` (the marker is a **convention** inside `props`) | preserved verbatim; §5.3 asserts the head node of every document still carries it |
| **`documentPath` + `tags` metadata** | the node's own fields | preserved verbatim. Note the normalization: `[]` normalizes to **absent** and `tags` is trimmed/deduped (`normalizeDocumentPath`/`normalizeTags`) — the rule is **the destination's normalized form equals the source's normalized form**, which is what the public surface already reports |
| **`ownedNodeIds`** | the node's own field | preserved verbatim (deduped by `validateNodeShape`); **explicitly NOT authoritative** — the runtime back-reference map is (`SUBTREE-OWNERSHIP`: it is the last-traversal snapshot). It migrates as a **snapshot**, and no verification depends on it |
| **`createdAt` / `updatedAt`** | preserved verbatim on the copies | **the copy must not refresh them.** The batch's inverse/redo fidelity already pins verbatim restoration for a `putNode` **update**; a migration that `putNode`-ed into a **pre-existing** destination record would refresh `updatedAt`. Hence §4.3's **EMPTY-TARGET precondition**: the destination must be empty (or the run aborts), so every op is a **create** and no `updatedAt` refresh is reachable |

### 3.2 DOES NOT migrate — the three pinned exclusions

**(a) The project journal and its undo/redo cursors — DECISION: RESET, with the operator warned, and the
pre-migration journal ARCHIVED inside the retained rollback artifact.**

The source file carries `RagStoreFile.journal: JournalEntry[]` + `RagStoreFile.cursor: number` — the
**PROJECT JOURNAL** (`DECIDED: PROJECT-JOURNAL`, `docs/decisions.md`; consumed by C16 per
`DECIDED: C16-CONSUMES-PROJECT-JOURNAL`). **Pinned decision and its reasoning:**

- **It cannot be carried as history.** The engine's `JournalView` reader
  (`DECIDED: JOURNAL-READ-VIA-PACKAGE`) reads the **engine Supervisor's** journal, which
  `C16-CONSUMES-PROJECT-JOURNAL` explicitly **rejects** as the C16 source ("the engine journal is wiped
  by boot / `loadEnvelope` / a template or operator re-derive, while the project journal persists").
  Reading the engine's journal as if it were the project journal would **violate a user ruling**.
- **It cannot be carried as records either.** `applyBatch`'s `BatchOp` union is **CLOSED at 7 members**
  (`BATCH-ATOMICITY-API`) and **a successful batch lands as exactly ONE `batch` journal entry**
  (`docs/specs/unit-n-batch-atomicity.md` §5.4/§5.9). There is **no primitive that restores a
  caller-supplied journal array**, and adding one is a **new contract** (a new decision row, a durability
  story, a boot-validator story) — out of scope here.
- **So the pinned disposition is RESET:** after a successful migration the destination's journal is
  **exactly one entry**, `kind === 'batch'`, with `undoDepth() === 1` and `redoDepth() === 0`, and the
  destination's `cursor === 1`. `undo()` on the fresh destination restores the **pre-migration EMPTY
  destination** state (not the source's history).
- **The operator is WARNED**, in the report (§8.2) and in the pre-cutover warning, that **undo/redo
  history does not cross the cutover**; the source's journal **is preserved verbatim inside the retained
  rollback artifact** (§7.1) and is readable by a manual inspection of that file. **The history is
  archived, not destroyed** — that is the whole mitigation.
- **The `batch` entry's inverse is retained as the in-target rollback path** (§7.4): the single entry's
  `inverse` ops restore the empty-destination state, so an in-session `undo()` is a legal, verified
  rollback leg (it is a *different* leg from the file-level rollback of §7.2 and both are specified).

**(b) The operator settings / template / security stores — DO NOT MIGRATE AT ALL.**

`OperatorSettings` (`src/main/operator-settings-store.ts` `createOperatorSettingsStore` — the
`enabledPanes`/`enabledOperatorPanes`/`panesInitialized`/`defaultDocumentId`/`topK`/`editingMode`/
`theme`/`layout`/`tabs` slice), the template store, the security store, the authority store, the
idempotency registry and the query-audit log are **host-owned by contract**
(`docs/specs/design-extensions-review.md` §3.1: "the **security/operator stores stay host-owned**
(`security-store`, `authority-store`, `idempotency-registry`, `query-audit`, `OperatorSettings`, the
vector cache — per `docs/specs/astrographer-scope-realignment-review.md` §3.3's AUTHORITY/SECURITY SEAM
row and `docs/specs/mcp-endpoint.md`'s 'host-side by contract')"). They are **not document storage**:
they carry operator state and security authority, not corpus records.
**One narrow exception, pinned as a READ:** `OperatorSettings.defaultDocumentId` **may need re-pointing**
iff the cutover changes a document id. Under §3.3's id-preservation rule **no document id changes**, so
**no `OperatorSettings` write is owed by a conforming migration** — and a migration that *does* write it
is a review finding (it would mean an id changed).

**(c) The vector cache — DECISION: REUSED, never re-derived; the file is retained with the rollback
artifact; the destination's hits/misses are reported.**

`createVectorCache` persists `provident-vector-cache.json` in `userData`, keyed by the four-field tuple
`(kind, model, dimension, contentHash)` where `contentHash = contentHashOf(text)` — the lowercase-hex
SHA-256 of the **exact embedded text** (`DECIDED: VECTOR-CACHE-CONTENT-HASH-KEY`; spec
`docs/specs/unit-f-embeddings.md` §5.13). Pinned:

- **Not re-derivable to the same key.** The engine's node model may chunk differently from the shell's
  `RagNode.content`, so the destination's embedded text (and hence `contentHash`) is **not** guaranteed
  to equal the source's. A re-derive would therefore produce a **different key space**, not a
  repopulation of the same entries.
- **So: the cache is a HOST-SIDE artifact that is simply LEFT IN PLACE and retained.** It is **not**
  written by the migration (no `set`/`prune`/`flush` call), **not** deleted, and **not** re-derived. If
  the tuple matches and the embedded text matches, the destination gets **hits for free**; otherwise it
  **misses and re-embeds**, which is the documented invalidation rule ("hash mismatch (content changed)
  OR key mismatch (provider/model/dimension changed) → re-embed"). Both outcomes are legal; neither is a
  migration failure.
- **Reported:** the dry-run and the post-migration report carry a `vectorCache` cell naming the file, the
  observed provider tuple, and whether it was **retained** — plus the post-run embedding **hits/misses**
  if the leg was exercised (§8.2, §8.3). A `0`-read on a leg that must have read is a **vacuous oracle**
  (the `FS8`-class control), so every census row over this cell carries a **failing control** (§5).
- **A cache file is NOT an authority.** Leaving it in place cannot create a second authority: it holds
  vectors, not nodes/edges.

### 3.3 The exact id scheme — PINNED, no exceptions

> **`DECISION-CORPUS-MIGRATION-ID-PRESERVATION`.** For an addressed store `S` with registry name
> `name(S)`:
>
> - **`name(S)` is the default store** (`MIGRATION-LEGACY-PATH` / `default: true`): every node id, edge
>   id and `documentIds` entry in the destination is **byte-identical** to the source's. The destination's
>   document-id set **equals** the source's.
> - **`name(S)` is a NON-default store** (`STORE-ID-PREFIX`): the destination's ids are the source's with
>   **exactly the `<name>:` prefix applied** where the source minted its id from a document id, and
>   **the destination's document-id set equals the source's set mapped by that same prefix** — which is
>   `importMarkdownCorpus`'s own §5.2 step 4g mint, reproduced as a **mapping**, not re-derived by a
>   parser. **The prefix is applied ONCE** (`<name>:<id>`, never `<name>:<name>:<id>`), and is applied to
>   **document ids only** — `edit.create_node`-minted ids (`n-${randomUUID()}`) are already globally
>   unique and are **not** prefixed by the import seam, so they migrate **verbatim**.
> - **`MULTI-STORE-REGISTRY` is unaffected**: the registry file `provident-rag-stores.json` shape
>   `{version:1, stores: RagStoreConfig[]}`, the per-entry `persistenceFile`, the `corpusRoot`
>   containment root, the derivation `derivePersistenceFile` (`main` → `provident-rag.json`, else
>   `provident-rag-<name>.json`), Pass A–D validation, the collision key (casefolded on
>   `CASE_INSENSITIVE_FS_PLATFORMS` = `darwin`/`win32`), and the registry-file self-collision guard all
>   stay **byte-unchanged**. The migration **reads** the registry and **never** rewrites it outside §7.3's
>   single authority row.
> - **`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`'s accepted per-op cadence note is HONOURED, not re-litigated.**
>   That row is `RESOLVED-BY-RECLASSIFICATION` with residual (b) = the **ACCEPTED per-op cadence**
>   ("one atomic + durable write = one full-store `persist()` per bare op … an accepted, recorded
>   characteristic, not a defect"; `docs/specs/unit-import-batch-persist.md` §7.6, whose **revisit
>   condition** is "if a per-op path ever needs to be cheap, **batch it** or add an explicit non-durable
>   mode"). The migration **batches** — that is precisely the sanctioned route — and it performs
>   **EXACTLY ONE `persist()` per migrated store** (the §2b invariant, pinned by `P-TP-4`/`P-IM-1`). A
>   migration that loops the per-op API over the corpus is a **review finding** (it re-opens the accepted
>   cadence without the revisit trigger firing, and it is `O(N × store size)`).
> - **The prefix's own namespace reservation (A1) still applies at the destination's import seam**
>   (`importMarkdownCorpus` §5.4's `documentId collides with a registered store name` rejection). The
>   migration **does not** bypass it: a destination documentId that collides with a registered store name
>   is a **fail-state** (§6, `FS-CM-9`), never a silent rewrite.

---

## 4. The migration mechanics

### 4.1 The API (the contract shape the TestWriter derives from)

```ts
// PROPOSED module: src/main/corpus-migration.ts (a NEW main-process module; no Electron import —
// every node-testable caller supplies paths explicitly, the vector-cache/operator-settings idiom).

/** The authority the destination represents. `'host-store'` is the reference target (a JSON store);
 *  `'engine'` is the cutover destination and is BLOCKED on the upstream set (§2.3) — it is
 *  representable here so the plan/report shape does not change when the engine route lands. */
export type MigrationAuthority = 'host-store' | 'engine'

export interface CorpusMigrationOptions {
  /** The authority the destination represents. */
  authority: MigrationAuthority
  /** The store being migrated, addressed by REGISTRY NAME (never by path). The registry is read
   *  through `loadRagStoreRegistry`; the addressed entry supplies `persistenceFile`/`corpusRoot`. */
  store: string
  /** The registry file path (`provident-rag-stores.json` in userData). */
  registryPath: string
  /** REQUIRED when `authority === 'engine'`: the engine base URL. Absent/rejected ⇒ the plan's
   *  `blocked` list names the missing upstream capability (never a silent fallback). */
  engineBaseUrl?: string
  /** The retained rollback artifact's directory (default: a sibling `provident-rag-rollback/`
   *  directory next to the store's `persistenceFile`). */
  rollbackDir?: string
}

/** One verification check's outcome. */
export interface MigrationCheckResult {
  check:
    | 'census-documents' | 'census-nodes' | 'census-edges'
    | 'content-hash-per-document'
    | 'doc-head' | 'doc-flow' | 'id-preservation'
    | 'retrieval-parity'
  ok: boolean
  /** The check's own reading (a count, a digest, a list of differing ids). NEVER a bare boolean. */
  observed: string
  expected: string
}

/** The dry-run plan + report (the SAME shape for both; `executed` is the discriminator). */
export interface CorpusMigrationReport {
  /** `'dry-run'` = nothing was written. `'aborted'` = a check failed; the source is untouched.
   *  `'already-migrated'` = the idempotency probe matched; nothing was written. `'migrated'` = success. */
  status: 'dry-run' | 'aborted' | 'already-migrated' | 'migrated'
  authority: MigrationAuthority
  store: string
  /** The source store's `persistenceFile` (verbatim from the registry). */
  sourcePath: string
  /** The retained artifact's path (present iff an artifact was written). */
  rollbackArtifact?: string
  /** Every census claim, per store (documents / nodes / edges) + the source file's `version`. */
  census: { documents: number; nodes: number; edges: number; version: number }
  /** The id scheme actually applied: `'identity'` (default store) or `'prefix:<name>'`. */
  idScheme: 'identity' | `prefix:${string}`
  /** `'reset'` (the pinned decision, §3.2a) + the `undoDepth` the destination will hold. */
  journal: { disposition: 'reset'; destinationUndoDepthAfter: 1; operatorWarned: boolean }
  /** The vector cache's disposition (§3.2c). */
  vectorCache: { path: string; tupleObserved: boolean; disposition: 'retained' }
  /** The 512-file cap check — `ok:false` + the count when the corpus's document count exceeds
   *  `MAX_IMPORT_FILES` (the cap reaches a corpus ADDRESSED AS A FILE LIST, §4.5). */
  cap: { cap: number; documents: number; ok: boolean }
  /** The capability gaps that BLOCK an execution (empty ⇒ executable). */
  blocked: string[]
  checks: MigrationCheckResult[]
  /** The destination store's own status after the run (`loadedNodes`/`loadedEdges`/`quarantined`/
   *  `corrupt`) — the "silently quarantined destination" guard (§2.4). */
  destinationStatus?: { corrupt: boolean; quarantined: number; loadedNodes: number; loadedEdges: number }
  /** The persist census: the number of full-store writes the run performed (must be ≤ 1 per store). */
  persists: number
  /** The one-shot progress/result broadcast actually emitted (0 or 1; §4.4). */
  broadcasts: number
}

export interface CorpusMigrationResult {
  ok: boolean
  report: CorpusMigrationReport
}

/** The pure + read-only rehearsal. NEVER writes: not the destination, not the source, not the
 *  registry, not the rollback directory, not the vector cache. The ONLY filesystem writes it may
 *  perform are inside a TEMP directory it creates and removes itself. */
export function planCorpusMigration(opts: CorpusMigrationOptions): CorpusMigrationReport

/** The execution. Aborts (status `'aborted'`) if the plan's `blocked` list is non-empty, if any
 *  precondition fails, or if any verification check fails AFTER the write — in which case the
 *  destination is left at its PRE-migration state (§6.1). */
export async function runCorpusMigration(opts: CorpusMigrationOptions): Promise<CorpusMigrationResult>
```

**Signature rules (pinned):**

- `planCorpusMigration` is **SYNCHRONOUS** and **NEVER throws for a domain failure**: every domain
  condition (unknown store name, corrupt registry, an engine authority without a base URL, an
  over-cap corpus, an unreadable source file) is reported as `status:'dry-run'` (or `'aborted'`) with a
  populated `blocked` list and an `FS-CM-*` code. A **thrown** error is reserved for a **caller**
  error: `opts` null/undefined, a non-string/empty `store` or `registryPath`
  (`Error('corpus migration: store required')` / `Error('corpus migration: registryPath required')`).
- `runCorpusMigration` is **ASYNC** and returns a discriminated result. It **never throws for a domain
  failure** (the `applyBatch`/`importMarkdownCorpus` discipline). A rejection is reserved for a caller
  error (the same two guards). **`ok === false` is ALWAYS accompanied by a report whose `checks` name
  the failing check.**
- **Neither function mutates its `opts` object**, and neither returns a live reference into the store
  (the `getNode`/`listNodes` shallow-copy discipline).
- **Routability:** the destination store instance for the reference target is constructed by
  `createJsonRagStore({ path: <destination persistenceFile> })` — **never** by re-reading the source
  file's raw JSON. The migration reads the **public surface** (`listNodes()`/`listEdges()`/`status()`),
  which is the only reading that reproduces `nodeSource`/`edgeSource` exactly (§2.4).

### 4.2 The op construction (pinned, in this order)

1. `const source = createJsonRagStore({ path: sourcePersistenceFile })` — the addressed registry
   entry's `persistenceFile`, verbatim (no normalization; the registry preserves the operator string).
2. **Read the census from the SOURCE and record it BEFORE anything else** — `status()`
   (`loadedNodes`/`loadedEdges`), the document-root set, the source file's `version`.
3. `const ops: BatchOp[] = [...nodes.map(n => ({op:'putNode', node:n})), ...edges.map(e => ({op:'putEdge', edge:e}))]`
   where `nodes = source.listNodes()` and `edges = source.listEdges()`. **ALL node ops precede ALL edge
   ops** (referential integrity: every edge's endpoints exist before the edge is applied — the
   `importMarkdownCorpus` construction).
4. `const res = await destination.applyBatch(ops)`; **`res.ok` MUST be checked** and a `{ok:false}`
   result is a **loud** failure carrying `res.error` + `res.failedIndex` (the `P-SM-2`/§2a discipline —
   a batch that silently fails must never produce a green; and `applyBatch`'s own contract is that a
   **domain** failure returns `{ok:false, error, failedIndex}` rather than throwing).
5. Run the verification battery (§5) and persist the report + ledger entry (§8.3).

**`res.failedIndex` maps onto the corpus deterministically:** `failedIndex < nodes.length` names a
**node** (`nodes[failedIndex]`); `failedIndex >= nodes.length` names an **edge**
(`edges[failedIndex - nodes.length]`). The report must name the offending record id.

### 4.3 Ordering, atomicity, and the preconditions

**Ordering (pinned):** the order of §4.2 is the **only** legal order. Nodes-then-edges is required by
referential integrity; within each group the **source's store order** is preserved verbatim
(`[...nodes.values()]`/`[...edges.values()]` — the file's own array order), because the destination's
file order is the source's file order and any re-ordering makes a byte-diff of the `nodes`/`edges`
arrays impossible to interpret. `P-TP-1` (§5) proves the persist count is **order-independent**, but the
**file order** is pinned for the diff oracle.

**Atomicity (pinned):** the whole corpus of one store is **ONE `applyBatch`**, therefore:

- **all-or-nothing** — any op failure rolls the destination's in-memory state back to the pre-batch
  snapshot, does **NOT** pollute the destination's journal and does **NOT** persist;
- **exactly ONE `persist()`** — the §2b invariant "NO PER-OP FULL-STORE WRITE INSIDE A BATCH", whose
  landed seam is the `persistDeferred` guard in `src/main/rag-store.ts` (cite by symbol);
- **exactly ONE destination journal entry**, `kind === 'batch'` (§3.2a);
- **one queued write unit** — no other write interleaves, and the batch is re-entrant (`inQueue`).

**Preconditions (each a named fail-state, §6; a violation ABORTS before any write):**

| Id | Precondition | Fail-state |
| --- | --- | --- |
| **P-AUTHORITY** | the authority is `'host-store'` (executable today) or `'engine'` **with every §2.3 capability present** | `FS-CM-1` (blocked upstream) |
| **P-REGISTRY** | the registry loads with `implicit:false` and `corrupt:false` and the addressed `store` name resolves | `FS-CM-2` / `FS-CM-3` |
| **P-EMPTY-TARGET** | the destination is **EMPTY** — `status().loadedNodes.length === 0 && status().loadedEdges.length === 0 && journal().length === 0` — OR the idempotency probe (`§4.6`) returns `already-migrated`, in which case the run is a **no-op**. An **absent** destination file is the normal first-run case (`missing: true` ⇒ `failed-missing`, "NOT an error state") | `FS-CM-4` (non-empty, non-matching target) |
| **P-SOURCE-HEALTHY** | the source's `status().corrupt === false`; **`status().quarantined.length === 0`**; the source file's `version === 1` | `FS-CM-5` |
| **P-READ-ONLY-SOURCE** | the source's `persistenceFile` is **not** the destination's path (a same-file migration would overwrite the source through the destination) | `FS-CM-6` |
| **P-CAP** | the corpus's **document count** ≤ `MAX_IMPORT_FILES` (512) when the corpus is addressed **as a file list** — §4.5 | `FS-CM-7` |

**A quarantined source record is a HARD abort, not a warning.** Migrating a store with quarantined
records would silently shrink the census (quarantined records are excluded from `listNodes`/`listEdges`
and from `status().loadedNodes`/`loadedEdges`), so the census check would compare a *lossy* source
against the destination and could even pass. The operator must clear the quarantine first (the
documented clear path is a re-put/clear surfaced via `status().quarantined`).

### 4.4 The progress/cancel contract — **OWED UPSTREAM for the engine leg; pinned here for both legs**

**The host-side leg has no engine hop**, so its progress surface is the **existing one-shot broadcast**:
the migration emits **at most ONE** result broadcast on completion (`0` on abort/dry-run, `1` on a
terminal outcome — the `IMPORT-RESULT-BROADCAST` shape, "one-shot", per `docs/HANDOFF.md` O-7's own
comparison). **`broadcasts ≤ 1` is asserted** (§5), and a `0`-read on a successful run is a **vacuous
oracle failure**, so the assertion carries a control draw.

**The engine leg's progress/cancel contract does NOT exist** and is **OWED UPSTREAM**:

- The shell's engine client (`src/main/engine-rag-store.ts` `EngineRagStore`/`ENGINE_ENDPOINTS`) exposes
  **no progress and no cancel surface** — only `ragStream`'s SSE frames, which are a *query* stream, not
  an ingest stream.
- `docs/HANDOFF.md` O-7 pointer row names the owed capability in terms: **"a bulk/batch-ATOMIC ingest
  route with a progress/cancel/cap contract"**, and `docs/pending.md` §PARKED DESTINATION O-7 records
  the same ("NO progress contract").
- **The pinned requirement this unit imposes on that owed route** (so it is testable when it lands): a
  **monotonic progress marker** (documents applied / total), a **`cancelled` terminal state**, and — the
  load-bearing one — **a cancellation must be an atomic abort: a cancelled ingest leaves NO partial
  corpus on the engine, exactly as a failed batch leaves NO partial store.** The engine leg may **not**
  be spec'd as "cancel ⇒ whatever landed stays landed"; that shape would violate **O3**. Until the route
  exists, the engine leg reports `FS-CM-1` with `blocked: ['O-7 ingest route (progress/cancel)',
  'U-ENGINE-PERSIST (GR-7)', 'O-8 authority switch (GR-4/GR-5)', 'record-copy route with caller-supplied ids']`.

### 4.5 The 512-file import cap — its exact reach

The cap is `MAX_IMPORT_FILES = 512` in `src/main/import-directory.ts`, enforced **per directory read**
(`expandImportDirectory`, fail-loud `{ok:false, reason:'cap-exceeded', cap, count}` with `count` = the
FULL matching count) **and re-enforced on the aggregate** (`resolveImportSelection`, whose
`cap-exceeded` from any expanded directory **poisons the whole resolution**). Pinned:

- **The cap reaches a corpus ADDRESSED AS A FILE LIST** — i.e. the File → Import… path
  (`IMPORT-FS`) and any migration that re-imports from files. It is **fail-loud, never a silent
  truncate**.
- **The record-copy route of §2.4 does NOT pass through the file expansion at all** — it copies
  **records**, not files — so the cap is **not** the binding constraint on it. The migration **still
  reports the cap cell** (`cap.documents`, `cap.ok`) in its plan/report and **still fails `FS-CM-7`** when
  the corpus's **document count** exceeds 512 **and** the run is file-addressed. Rationale: the census —
  226 documents — sits **below** the cap today, so the cell is a **regression canary** (an operator
  corpus that grows past 512 documents must be told), and hiding it would let a future re-import leg
  inherit a landmine.
- **The cap is NOT raised, NOT lowered, and NOT bypassed.** `IMPORT-FILE-COUNT-CAP` is a decision row;
  a migration that "needs" a different cap is a **new proposal**, not this unit.

### 4.6 Idempotency — a re-run must not duplicate

> **`DECISION-CORPUS-MIGRATION-IDEMPOTENCY` (PINNED).** A re-run is a **no-op** if and only if the
> destination ALREADY EQUALS the source on the migration's identity triple: **(a)** the destination's
> document-id set equals the source's (mapped by the pinned id scheme, §3.3), **(b)** the destination's
> node count equals the source's `status().loadedNodes.length` AND the destination's edge count equals
> the source's `status().loadedEdges.length`, and **(c)** every destination node's **derived
> content-hash set** equals the source's (§5.2). In that case `runCorpusMigration` returns
> `status:'already-migrated'`, `ok:true`, **`persists: 0`**, **`broadcasts: 0`**, and **writes
> nothing** — not the destination, not the source, not the registry, not the rollback directory.
>
> **Any other non-empty destination is `FS-CM-4` (abort), NOT a merge and NOT a re-import.** The
> migration has **no upsert mode, no dedup mode and no per-id reconciliation**: a partial destination
> (a prior run that failed *after* its persist, an operator's manual edit, a second corpus) is an
> **operator problem to resolve explicitly** (empty the destination and re-run, or roll back — §7).
>
> **No new idempotency store is created.** The probe reads the two stores' public surfaces; it does
> **not** mint an `IdempotencyRegistry` row, a marker file, or a lock file. (An `idempotency-registry`
> exists in the repo for a different subject and is **not** reused here.)

**The anti-duplication rule, stated as what it forbids:** a re-run must **never** produce
`<name>:<name>:<id>`, never a second `batch` entry per document, never a second copy of the corpus under
fresh ids, and never a doubled census. §6's `FS-CM-10` is the duplication fail-state.

---

## 5. Verification — the checks, and what a FAILURE does

### 5.1 The four-check battery (all run on the DESTINATION, read through the destination's public surface)

| Id | Check | Exact oracle |
| --- | --- | --- |
| **V1 — census equality** | **documents / nodes / edges** | `documents: destination document-id set === source document-id set (mapped per §3.3)`; `nodes: destination.status().loadedNodes.length === source.status().loadedNodes.length` **and** the id-sets are equal; `edges: destination.status().loadedEdges.length === source.status().loadedEdges.length` **and** the id-sets are equal. For the operator corpus the expected readings are **226 / 6 102 / 9 266** — the O-0 census claim (`src/shared/o0-report.ts` `O0_OPERATOR_DOCUMENTS = 226`; the node/edge counts as stated by `docs/specs/design-extensions-review.md` §3.1's named ruling). **The check must assert the SOURCE's own count, not the literal 226** — the literals are the operator-corpus *instance*, and the census gate forbids re-seeding it (§9.4). |
| **V2 — the per-document content-hash diff** | a **per-document set digest** on each side, compared exactly | For each document `d`: **(a)** collect its nodes (the document-root node plus the nodes reachable through the document's doc-flow/`doc-child`/`parent-child` edges — one pinned traversal, the same traversal on both sides); **(b)** for each node compute the **`nodeSource`-derived SHA-256** — i.e. the record's own hash, obtainable by re-deriving `nodeSource` over the **public** `RagNode` copy (the migration's own helper; it MUST NOT read the store file's stored `hash` field for this); **(c)** sort the `(id, derived-hash)` pairs by **id, ascending codepoint order** and digest the concatenation; **(d)** the destination's digest must equal the source's **byte-for-byte**. The check reports, on failure, the **first differing document id** and the **first differing node id** within it — never a bare `false`. |
| **V3 — doc-head + doc-flow integrity** | `validateDocFlow(nodes, edges, documentId)` on the destination, for **every** document | every document returns `{ok:true, order}` (`src/main/doc-flow.ts` `validateDocFlow`). **Four distinct violation classes are named, not collapsed:** `cycle` (incl. `duplicate next-section`), `missing-node`, `missing-head` (incl. `multiple heads`), `missing-end`. The check reports the **class + `detail` + the document id**. Additionally: `docHeadForDocument(documentId)` on the destination returns **the same head node id** as the source's `docHeadForDocument(documentId)` — the head-identity half — and the head node still carries the **doc-head marker prop** in its `props` (§3.1). |
| **V4 — retrieval parity** | a **query result-set comparison** | A pinned list of **≥ 3** probe queries (one single-term, one multi-term phrase, one term that must miss) is run against **both** the source and the destination through the **same** local retrieval leg (`createRetrieval` over each store, **lexical** mode unless the corpus has a built vector index — the mode is **recorded in the report**). For each query the compared quantity is the **RESULT ID SET** of the top-K window at the **local default top-K (`topK` 5, the `OperatorSettings` first-run default)** and, as a second window, at **`topK` 10**: the sets must be **equal as sets**. **Rank order is NOT compared**, and **scores are NOT compared** — scores are provider- and chunking-dependent, so a score comparison would be an unfalsifiable oracle. The check reports the query, the mode, both windows, and the symmetric difference. |

**Cross-cutting check:** **V5 — id preservation** (the §3.3 rule, asserted independently of the census):
the destination's `documentIds` and node/edge ids are the source's **mapped exactly**; the check reports
the **first** id that differs and whether the difference is a **re-mint**, a **missing prefix**, or a
**double prefix** (the three distinguishable failure shapes, each named in the report).

### 5.2 The hash-equality assertion (why V2 is not merely a count check)

V2's per-node derived hash covers exactly the fields `nodeSource` enumerates: `id`, `type`, `content`,
`nodeKind`, `children` (including each child's `offset`), `documentPath`, `tags`, `props`,
`ownedNodeIds`, `createdAt`, `updatedAt`. **Two consequences the TestWriter must assert:**

1. **`createdAt`/`updatedAt` are unchanged by the copy** (the record-copy path preserves them verbatim;
   P-EMPTY-TARGET is what makes this reachable — a `putNode` over a *pre-existing* destination record
   would refresh `updatedAt` and break the hash equality).
2. **The destination is NOT silently quarantined.** `destinationStatus.quarantined === 0` and
   `destinationStatus.corrupt === false` on a successful run. A destination whose `nodeHash` mismatch
   fired at boot would otherwise present as a *smaller* census that a naive count check might attribute
   to the source.

### 5.3 What a FAILURE does (pinned — never a partial switch)

> **`DECISION-CORPUS-MIGRATION-FAILURE = ABORT + RESTORE + NEVER PARTIALLY SWITCH`.**

1. **Pre-write failures** (any §4.3 precondition, any `blocked` entry): **nothing is written.** The
   report carries `status:'aborted'`, `persists: 0`, `broadcasts: 0`. The source is untouched **by
   construction** — the migration holds the source open **READ-ONLY** and its only writes are to the
   destination and the rollback directory.
2. **A failed `applyBatch`** (`res.ok === false`): the batch's own rollback already restored the
   destination's in-memory state; the destination's file is **byte-identical** to its pre-migration
   state (the failed-batch byte-identity oracle, `P-IM-2`/`FS3` of
   `docs/specs/unit-import-batch-persist.md`). The report names `res.error` + `res.failedIndex` + the
   offending record id.
3. **A post-write verification failure** (V1–V5 fails after a successful `applyBatch`): the destination
   **IS NOT KEPT**. The run must **restore the destination to its pre-migration state** — because the
   destination was EMPTY by precondition, the restore is **`teardown()` the destination store, remove the
   destination file** (leaving the absent-file first-run state rather than an empty-but-present file, so
   the §4.6 probe cannot later mistake it for a migrated store), and then **return
   `status:'aborted'`** with the failing check named and `persists` reported. **A restoration that
   itself fails is a loud `FS-CM-11`** and must leave the destination file **named in the report** so the
   operator can remove it manually.
4. **NO PARTIAL SWITCH, EVER.** The pinned invariant: **the authority switch and the migration are ONE
   operator action with ONE terminal state.** At no point may the running app serve reads from a
   partially-migrated destination, and at no point may the source and the destination both be
   registry-live. Concretely: `runCorpusMigration` **does not** write the registry (§7.3 is a separate,
   operator-confirmed step), so a failed migration cannot have switched anything; and a successful
   migration reports `status:'migrated'` with the completed verification battery attached **before** any
   authority row is written.
5. **A failure NEVER silently degrades to "keep the local authority and continue".** The failure is
   surfaced (the report + the operator-facing warning); the authority remains the source **because the
   switch never happened**, not because a failure was swallowed.

### 5.4 §5.x Property register (PBT) — **typed, 6 rows, at the ≤8 cap**

Register convention (imported from `docs/specs/unit-import-batch-persist.md` §4 and
`docs/specs/unit-v5-migration.md` §4): rows are typed **P-IM** (input-model) / **P-SM** (state-model) /
**P-TP** (transform) — **never F-rows, never §6/`FS-CM-n`**. **≤8 rows**, **≤100 attempts/row**, budget
stated as **Σ(attempts/row)** and **NEVER as a fixed total**; **stop-after-5** on every row (a row stops
as soon as 5 attempts have run without a counterexample). Proposed file:
**`tests/unit-corpus-migration-contract.test.ts`**.

| Row | T | Pinned invariant | Generator / strategy | Falsifiable oracle | Layer covered |
| --- | --- | --- | --- | --- | --- |
| **P-IM-1** | IM | **A migration is ALL-OR-NOTHING.** For any generated corpus whose k-th op is invalid (a `putEdge` whose endpoint is absent from the generated node set, a malformed node record, a `null` op), `applyBatch` returns `{ok:false, failedIndex:k}` and the destination is **exactly at its pre-migration state**: the file bytes are **byte-identical**, the journal/cursor are unchanged, and `status()` is unchanged. | `strat:failed-migration` — draw `k ∈ {0, mid, N−1}` × failure mode `∈ {putEdge-missing-endpoint, malformed-node, null-op, setProps (unsupported in the closed union)}`; each draw seeds a **NON-EMPTY destination** (so the file is non-trivial and the byte comparison discriminates) and reads its bytes first. | the **first failing draw's** `{ok:false}` with `failedIndex === k` **for a deterministic domain failure**, and `failedIndex === -1` for the `null`-op draw (the landed catch-all: `'rag applyBatch: unexpected failure'` — a negative index means the op loop threw, and it is asserted as such, never coerced to `k`) AND `readFileSync(dest)` before **===** after (byte equality) AND `persistCount === 0` AND `journal()` unchanged; a counterexample prints `k`, the mode, `failedIndex`, and the byte-length delta. | store (real temp fs) |
| **P-SM-1** | SM | **A re-run is IDEMPOTENT.** For any generated corpus migrated once, a **second** `runCorpusMigration` with the same options returns `status:'already-migrated'` with **`persists === 0`**, and leaves the destination file **byte-identical**: no `<name>:<name>:` id, no doubled census, no second `batch` entry. | `strat:rerun` — draw `{1,2,7,200}`-op corpora × `{immediate re-run, re-run after teardown() + reboot over the same path, re-run after an undo()}`; fresh temp dir per draw. | `status === 'already-migrated'` AND `persists === 0` AND destination file bytes before**===**after AND `listNodes()`/`listEdges()` id-sets equal to the first run's; a counterexample prints the doubled ids (the `^<name>:<name>:` matcher) and the census delta. | state-model (real temp fs) |
| **P-SM-2** | SM | **The census is preserved EXACTLY, and the ids are preserved exactly (§3.3).** For any generated corpus, the destination's document/node/edge **id sets** equal the source's **mapped by the pinned scheme** (`identity` for a default store; `<name>:` applied **exactly once** to document ids for a non-default store). | `strat:census` — draw corpora with generated document roots, their doc-flow chains (`doc-head`/`next-section`/`doc-end`), `doc-child` nesting, `documentPath`/`tags`, `children[]` with `offset` slots, and `crosslink` edges; draw store `{default, non-default}` × `{docs-shaped, p-shaped}` node ids. | set-equality of all three id sets (the mapped expectation computed **from the source's own ids**, never from a literal) AND `documents.nodes.edges` counts equal; a counterexample prints the first differing id and classifies it (re-mint / missing-prefix / double-prefix). | state-model |
| **P-TP-1** | TP | **A failed migration leaves the SOURCE untouched.** For any generated failure (precondition abort, `applyBatch` failure, post-write verification failure), the source's file is **byte-identical** to its pre-run bytes, its journal/cursor are unchanged, and no write of any kind targeted the source path. | `strat:source-untouched` — draw the §P-IM-1 failure modes × the three abort classes; each draw reads the source bytes before and after, and installs a write-count observer over the **source path only**. | source bytes before**===**after AND `writesToSourcePath === 0`; the **failing control** is a draw that writes to the source path **deliberately** and must be counted `≥ 1` (proving the observer discriminates — a `0`-reading on a must-write path is a **vacuous oracle** and fails the row). | transform (real temp fs) |
| **P-TP-2** | TP | **A rollback restores the EXACT prior state, and no rollback leaves two authorities live.** For any successful generated migration, restoring from the retained artifact reproduces the source **byte-for-byte** (the file is the source file, so the check is byte equality + re-derived `nodeSource` hash equality + the source's `undoDepth`/`redoDepth`), AND after the restore the registry's live binding for the addressed name points at **exactly one** file — never both, never neither. | `strat:rollback` — draw corpora × `{restore-from-archive, restore-after-two-migrations, restore-with-the-archived-file-absent}`; each draw reads the registry's resolved `persistenceFile` for the addressed name before and after. | restored store's `status()` census === the pre-migration census AND restored file bytes === the archived bytes AND the registry resolves the addressed name to **exactly one** path AND `persistenceFile !== rollbackArtifact`; the absent-archive draw must **fail loudly** (`FS-CM-12`), never succeed vacuously. | transform + registry read |
| **P-TP-3** | TP | **No document id changes, and the doc-head/doc-flow integrity survives the copy.** For any generated corpus, no destination document id is absent from the source's mapped id set, the **head node id** per document is unchanged (`docHeadForDocument` both sides), `validateDocFlow` returns `{ok:true}` for every document on the destination, and the single `batch` journal entry with `undoDepth() === 1` / `redoDepth() === 0` is present. | `strat:docflow` — draw corpora with `{single-section, multi-section chain, nested doc-child, shared-node multi-owner documentIds}` × `{default, non-default}` store; include a draw with a **deliberately broken** source doc-flow (a missing `doc-end`) that must produce an abort, not a migrated store. | per-document head-id equality AND `validateDocFlow(...).ok === true` for every document AND `journal().at(-1).kind === 'batch'` AND `undoDepth() === 1` AND `redoDepth() === 0`; the broken-source draw must abort with `FS-CM-8`. | state-model |

**Register count: 6 rows** (`P-IM-1`, `P-SM-1`, `P-SM-2`, `P-TP-1`, `P-TP-2`, `P-TP-3`) — **under the
≤8 cap, and under the ≤400 total budget**. Budget: **30 attempts/row → Σ = 180 attempts ≤ 400**
(every row ≤ 100), **stop-after-5** on each. **The 180 figure is a DECLARED UPPER BOUND, never a claim
that every attempt ran** — with stop-after-5 the held attempts are well under it. Each row's census
carries its own **failing control** (the `FS8` discipline): a `0`-reading on a path that must write/read
**fails** the row rather than passing vacuously. `held` = **zero counterexamples**; a row that ends
`broken` is a **spec-level finding** (§6b), not a pass.

**Scope note (mandatory, so a reviewer does not read the rows as contradicting §4.3).** `P-IM-1` is
scoped to the **store-level batch invariant the migration rides** — the `applyBatch` all-or-nothing
contract over a **seeded** destination — exactly as `P-IM-2` of
`docs/specs/unit-import-batch-persist.md` §4 is scoped to a seeded store ("each draw first seeds a
NON-EMPTY store (so the file is non-trivial)"). It therefore drives `applyBatch` **directly**, not
`runCorpusMigration`, and does **not** relax §4.3's `P-EMPTY-TARGET` precondition, which governs the
migration entry point and is a §6 fail-state (`FS-CM-4`), not a register row. Every **other** row is
scoped to the migration entry point itself.

**Honest no-pad rationale (mandatory).** The register is 6 rows, not 8, because **two candidate rows
were dropped as unable to fail**:
- a *separate* "the destination is not quarantined" row is **subsumed by V2/§5.2** (`quarantined === 0`
  is asserted there, and a hash-mismatch cannot survive a `nodeSource`-derived equality check);
- a *separate* "the cap is not exceeded" row over the 226-document corpus **cannot fail** on the
  operator instance (226 < 512) — it is a **canary**, so it lives in the **report cell** (§4.5,
  `cap.ok`) and is asserted only for a **generated over-cap draw**, which `P-SM-2`'s strategy covers.
Padding a register with rows that cannot fail is itself a finding.

---

## 6. Fail-states (FS ids) and throw patterns

### 6.1 The fail-states

| FS id | Fail-state | Exact observable |
| --- | --- | --- |
| **FS-CM-1** | **The authority is `'engine'` and the upstream capability set is incomplete** (no ingest route / no persistence / no authority-switch contract / no record-copy route with caller-supplied ids). | `status:'aborted'`, `blocked` lists **every** missing capability by name (§2.3), `persists: 0`, nothing written. **This is the unit's CURRENT state for the engine leg** — the abort is the *correct* today-behaviour, never a silent local fallback (the **surviving** discipline of `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`, whose "never a silent no-op" clause **survives** its 2026-09-21 partial supersession by `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` — `docs/specs/design-extensions-review.md` §11.3: engine-absent is **typed and explicit**, never a silent no-op). |
| **FS-CM-2** | The registry file is absent **or** corrupt (`loadRagStoreRegistry` → `implicit:true`). | `status:'aborted'` + the registry state named (`implicit`/`corrupt`). A synthesized implicit registry must **never** be silently trusted as the operator's registry — the implicit entry maps to the legacy `provident-rag.json` and would migrate the **wrong** file without saying so. |
| **FS-CM-3** | The addressed `store` name is not in the resolved registry. | `status:'aborted'` + the requested name + the resolved names list. (The message shape is the migration's own; it is **not** `resolveStoreArg`'s tool-arg error.) |
| **FS-CM-4** | **The destination is non-empty and fails the §4.6 idempotency probe.** Includes the partial-destination case (a prior run that failed after its persist, an operator's manual edit, a second corpus). | `status:'aborted'`, `persists: 0`, the destination's census + the source's census both printed, and the probe's failing clause named (`a`/`b`/`c`). |
| **FS-CM-5** | The source is corrupt, is not `version: 1`, or carries **quarantined** records. | `status:'aborted'` + `status().corrupt` + `status().quarantined.length` + the quarantined ids. |
| **FS-CM-6** | The source's `persistenceFile` **is** the destination's path. | `status:'aborted'`, both paths printed, **no write attempted**. |
| **FS-CM-7** | The corpus's document count exceeds `MAX_IMPORT_FILES` on a **file-addressed** corpus. | `status:'aborted'` + `{cap: 512, documents: N, ok: false}` (the `cap-exceeded` shape: **the FULL count**, never a truncated one). |
| **FS-CM-8** | A **post-write** verification failure (`V1`–`V5`). | `status:'aborted'` + the failing check in `checks` with its `observed`/`expected` + the destination **restored** (§5.3 item 3) + `persists` reported. |
| **FS-CM-9** | A destination documentId collides with a **registered store name** (the A1 prefix-namespace rejection). | `status:'aborted'` + the offending documentId + the colliding store name; **no rewrite, no silent rename.** |
| **FS-CM-10** | **A re-run produced duplication.** Any of: a destination id matching `^<name>:<name>:`, a doubled census, a second `batch` entry, or a doubled document-id set. | the run **fails loudly**, printing the first duplicated id and both counts — and the check is asserted **independently of `status`** (so a run that returned `'migrated'` while duplicating is caught). |
| **FS-CM-11** | The **restoration itself** failed (the destination could not be returned to its pre-migration state). | `status:'aborted'` + `destinationStatus` + the **destination path named for manual removal**. Never swallowed. |
| **FS-CM-12** | A **rollback** was requested and the retained artifact is absent/unreadable/corrupt. | the rollback **fails loudly** naming the artifact path; it must **never** fall back to "leave the current authority in place and continue" silently, and it must **never** substitute a re-import. |
| **FS-CM-13** | A **rollback would leave two authorities live** (the registry would resolve the addressed name to a path while the engine authority is also live, or the restored file is re-registered under a second name). | the rollback **refuses** (`FS-CM-13`) and names **both** live authorities; no write is performed. |
| **FS-CM-14** | The destination journal is **not** the pinned shape (`journal().length === 1 && kind === 'batch' && undoDepth() === 1 && redoDepth() === 0`). | `status:'aborted'` — this catches a migration that "carried" the source's journal entries (the §3.2a violation). |

### 6.2 Throw patterns (pinned)

- `planCorpusMigration` / `runCorpusMigration` — **never throw for a domain failure**; every
  `FS-CM-*` above is a **report** (`status:'aborted'`), not a rejection.
- `runCorpusMigration` **rejects** only for a caller error (`opts` null/undefined; a non-string/empty
  `store` or `registryPath`) — the `Error('corpus migration: store required')` /
  `Error('corpus migration: registryPath required')` pair.
- `applyBatch` — never throws for a domain failure (the closed-union never-throws contract); a `persist()`
  failure inside it is **swallowed** (non-fatal), which is why the report carries **`destinationStatus`**
  and the boot-round-trip check rather than trusting `ok:true` alone.
- `createJsonRagStore` — throws `Error('rag store: path required')` for a bad path; a **corrupt/missing**
  store file never throws (fail-disabled boot).
- `putNode`/`putEdge` — throw for shape/reference violations. The migration **must not** be written on
  the per-op API (that would both re-open the accepted cadence and convert a domain failure into a
  throw).

---

## 7. The rollback story

### 7.1 The retained artifact — what it is, where it lives, how long

> **`DECISION-CORPUS-MIGRATION-ROLLBACK-ARTIFACT` (PINNED).**

- **What it is:** the **pre-migration `persistenceFile`, copied byte-for-byte** — including its
  `version`, its `nodes`/`edges` arrays **with their stored `hash` fields**, its `journal` array and its
  `cursor`. It is **not** a re-serialized/rewritten store (a rewrite would change the hashes' source
  strings and break the boot re-verification). The copy is made **before** the destination is written
  and **after** every precondition (§4.3) passes, so an aborted run leaves **no** artifact.
- **Where it lives:** `<rollbackDir>/<store>-<UTC-timestamp>.json`, where `rollbackDir` defaults to a
  sibling directory of the store's `persistenceFile` named `provident-rag-rollback/`. The **basename**
  carries the store name and a UTC timestamp (`YYYY-MM-DDTHHMMSSZ`), so two migrations of the same store
  never collide and the artifact is self-describing. The copy uses the **atomic temp+rename** idiom
  (write `<artifact>.tmp`, then `renameSync`) so a crash mid-copy cannot leave a truncated artifact.
- **How long:** the artifact is retained **until an operator-confirmed successful cutover**, defined
  precisely as: **(a)** the migration reports `status:'migrated'`, **(b)** the §7.2 rollback procedure's
  own verification (§7.4) passes **if it is exercised**, and **(c)** the operator has confirmed the
  cutover. It is **not** retained by a timer and **not** deleted by the migration itself: **the
  migration never deletes a rollback artifact** (it has no removal primitive for them). Retention is an
  **operator** action recorded in the ledger (§8.3). Rationale: the corpus file is the *only* durable
  copy of the corpus while the engine persists nothing (§2.2) — deleting the artifact on a timer would
  recreate the restart-loss condition with a delay. **⟨CORRECTED 2026-09-28 (`X-7`): *"the engine persists nothing"* is STALE (engine-side `D-D1`+`D-D2` LANDED-GREEN, `GR-7` trigger DISCHARGED — ENGINE-green, UNVERIFIED LIVE here). The RATIONALE still holds and is strengthened: the corpus file is the only durable copy **this app actually reads and writes today** because NO CUTOVER HAS HAPPENED and this repo has not verified the engine's durability live — so the artifact-retention rule below is UNCHANGED.⟩**
- **A second artifact is retained too:** the **vector cache is NOT copied into the artifact** (§3.2c — it
  is left in place, so a rollback finds it exactly where it was). The **report + ledger entry** are the
  third retained thing (§8.3).

### 7.2 The rollback procedure (pinned, in order)

1. **Stop the app.** No `RagStore` may hold the store file open (the single-writer model; a rollback is
   a file-level operation, and two writers on one file is exactly what `SINGLE-WRITER-STORE` forbids).
2. **Assert exactly one authority is live, and that it is the one being retired.** Read the registry
   (`loadRagStoreRegistry`); resolve the addressed name's `persistenceFile`. If the resolved path is
   **not** the destination the migration wrote, the registry has drifted — **refuse** (`FS-CM-13`) and
   name both.
3. **Verify the artifact** (`FS-CM-12` guard): it exists, it parses, its `version === 1`, and it
   satisfies `validateNodeShape`/`validateEdgeShape` for every record (i.e. a fresh
   `createJsonRagStore` over the artifact reports `corrupt:false` and `quarantined.length === 0`).
4. **Copy the artifact back over the addressed `persistenceFile`** with the atomic temp+rename idiom —
   **not** a delete-then-write (a crash between the two would leave **no** corpus).
5. **Re-bind the authority, writing `persistenceFile` only.** If the cutover had re-pointed the
   addressed name's `persistenceFile` at the destination, the rollback re-points it back — through the
   registry write module `persistRagStoreRegistry` (validation-first, atomic temp+fsync+rename), **never**
   by hand-editing JSON.
6. **Never leave two authorities live** (§7.3) — asserted in step 2 and re-asserted after step 5.
7. **Run the rollback's OWN verification** (§7.4) — a rollback that is not verified is a **second**
   unverified rewrite of the operator's corpus.
8. **Record the rollback** in the ledger (§8.3): the artifact used, the timestamp, the verified census,
   and the operator confirmation.

### 7.3 The "never two authorities live" rule — pinned

> **`DECISION-CORPUS-MIGRATION-SINGLE-AUTHORITY` (PINNED).** At every instant the operator corpus has
> **exactly one** live authority. Concretely:

1. **The cutover is ONE registry write.** The authority switch is the addressed store's
   `persistenceFile` (re-pointed to the engine's authority descriptor — today the engine's authority is
   represented by the owed O-8 contract, §2.3) **plus**, for a host-side destination, nothing else. It is
   written by **`persistRagStoreRegistry`** (validate-first, atomic temp+fsync+rename, fail-loud) as a
   **single** mutation, and it is applied to the live directory only through the runtime controller's
   `hotApply`/the boot path (`syncLiveToLoaded`, `buildLexicalEntry`) — **never** by constructing a
   second store over the same data.
2. **The retained artifact is NEVER registry-reachable.** The rollback artifact's path is **not** a
   registry entry, is **not** a `persistenceFile`, and must **not** be registered under a second store
   name to be readable. Reading it requires an explicit path (a manual inspection or a rollback) — the
   registry is the only live-binding mechanism, and the artifact is outside it.
   *The structural guard:* the artifact lives in its own `prune`-free directory, and `resolveRegistry`'s
   Pass-D **registry-file self-collision guard** (plus its F13 store-store collision check) already fails
   loud if any entry resolves onto a colliding path — so "register the artifact to look at it" is a
   **rejected** shape, not a tolerated one.
3. **A rollback that would produce two live authorities REFUSES.** `FS-CM-13` — it writes nothing and
   names both authorities. (The two shapes it refuses: the engine authority is still live while the
   local file is restored *and registered*; and the restored file is registered under a second name.)
4. **The engine and the local store are never both writable.** The whole point of O-8
   (`docs/HANDOFF.md` O-8 pointer row: "who owns the persisted corpus during and after a cutover;
   split-brain + offline-write reconciliation"; `SINGLE-WRITER-STORE`'s "the main process owns all
   writes" has **no engine-side counterpart** today) is that one side is **authoritative** and the other
   is **retired**. A migration cannot create the second writer, so **the migration does not begin until
   O-8's contract exists** (`FS-CM-1`).
5. **The degraded-mode rule, read against the 2026-09-21 ruling.** `ENGINE-ABSENT-DEGRADED-CONTRACT`
   required that with no engine **every local path works identically**, and that an engine-absent read is
   **typed-unavailable, never a silent no-op**. **The first half no longer holds** — `GN-4` reversed it
   (landed as `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`: with no engine the app starts, warns
   and **opens no wiki**; `docs/specs/design-extensions-review.md` **§11.3**) — while the **second half
   SURVIVES and binds**. This unit therefore pins that the **cutover is not
   `ENGINE-ABSENT`-legal**: a cutover whose engine authority is the *only* authority contradicts that
   contract unless the engine's own durability (GR-7) and the O-8 degraded path exist. Until they do, the
   local store **stays** the authority as the **temporary authority** (the supersession of
   `RAG-AUTHORITATIVE` is **LIVE** — `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` owns document CRUD —
   but the **sunset has not fired** because `U-AUTHORITY-SWITCH` has not landed and recorded the cutover:
   `docs/specs/design-extensions-review.md` §13.2 S1 / §14.5; `docs/next-steps.md`'s sunset rule).

### 7.4 The rollback's OWN verification

A rollback is verified by the **same battery as the forward migration**, run against the **restored**
store as the destination-of-record:

1. **Census equality** vs the **ledger-recorded pre-migration census** (§8.3) — documents / nodes /
   edges.
2. **Byte equality** of the restored file against the retained artifact (the strongest check: the
   artifact IS the source file, so any difference is a write-path defect).
3. **Per-document content-hash diff** (`V2`) against the ledger-recorded digests.
4. **Doc-head + doc-flow integrity** (`V3`) — every document `{ok:true}`, head ids unchanged.
5. **Retrieval parity** (`V4`) against the **ledger-recorded** source-side result sets (the source is no
   longer live, so the parity oracle is replayed from the ledger — this is why the ledger records the
   result sets rather than only a boolean).
6. **Journal restoration:** the restored store's `undoDepth()`/`redoDepth()` equal the ledger-recorded
   pre-migration values (which, by §3.2a, is where the operator's history lives).
7. **Exactly one authority live** (§7.3).

**A rollback that fails any of 1–7 is a third rewrite of the corpus, not a restoration** — it must
**stop and surface** (`FS-CM-12`-class), never "try again".

---

## 8. The dry-run / rehearsal, and the operator-facing report

### 8.1 The dry-run mode

`planCorpusMigration` (§4.1) is the rehearsal. Pinned properties:

- **NON-DESTRUCTIVE, by construction:** it makes **no write** to the destination, the source, the
  registry, the rollback directory, or the vector cache. Its only filesystem writes are inside a temp
  directory it creates and removes itself.
- **It performs the FULL census and verification computation that can be computed without a
  destination:** the source census, the document-id set, the planned id scheme, the doc-flow verdicts
  (**on the source** — a broken source doc-flow is reported here, before any execution), the cap check,
  the vector-cache tuple read, and the `blocked` capability list.
- **It reports what a run WOULD do, not what it hopes to do:** `checks` contains the checks that are
  **computable on the source alone** (`V3`-on-source, `V5`'s expected mapping, `cap`), and **names
  explicitly** that `V1`/`V2`/`V4` are **destination-side** checks that a dry run **cannot** discharge
  (a dry run must never present a source-side reading as a destination-side pass — that is the
  `proxyPASS` anti-pattern, `DECIDED: D-GP-UFA-2`).
- **`status:'dry-run'` always, `persists: 0` always, `broadcasts: 0` always** — even when `blocked` is
  empty and every computable check passes.
- **It is the operator's go/no-go input.** A dry run whose `blocked` list is non-empty, or whose
  `checks` contain a failing source-side check, is a **NO-GO** and must say so in the report.

### 8.2 The operator-facing report shape (the pinned fields and their readings)

The operator report is the **`CorpusMigrationReport`** of §4.1, rendered as a **stable, ordered,
human-readable block** (the migration's own artifact; the D4-pane rendering of it is **not** part of this
unit — see §10.5). Every field carries a **reading**, never an adjective. Required content, in order:

| Section | Contents |
| --- | --- |
| **1. Authority** | `authority` (`host-store` \| `engine`), the addressed `store` name, the `sourcePath`, and — for `engine` — the `blocked` capability list verbatim |
| **2. Census** | `documents` / `nodes` / `edges` (the **source's** readings) + the source file's `version` |
| **3. Id scheme** | `identity` or `prefix:<name>`, **plus the count of ids the scheme touched** (the document ids), so the operator can see the namespace consequence |
| **4. Journal disposition** | `reset` + `destinationUndoDepthAfter: 1` + the **warning line** in plain words: the undo/redo history does **not** cross the cutover, and the pre-migration journal is archived in the retained artifact at `<path>` |
| **5. Vector cache** | the file path, whether the tuple was observed, `disposition: 'retained'`, and (post-run) the embedding hits/misses reading |
| **6. Cap** | `512` / the document count / `ok` |
| **7. Checks** | one line per check: id, `ok`, `observed`, `expected` |
| **8. Destination status** | `corrupt`, `quarantined`, `loadedNodes`, `loadedEdges` — with `quarantined` explicitly called out as a **failure** if non-zero |
| **9. Persist + broadcast census** | `persists` (must be ≤ 1 per store) and `broadcasts` (0 or 1) |
| **10. Rollback artifact** | the path, the timestamp, and the retention statement ("retained until an operator-confirmed successful cutover; the migration never deletes it") |
| **11. Verdict** | exactly one of `DRY-RUN — nothing written` / `ALREADY MIGRATED — nothing written` / `ABORTED — <the failing FS-CM id>` / `MIGRATED — verification passed` |

**Report honesty rules (pinned, each a review finding if violated):**
(a) a report may not print a **destination-side** check as passing when no destination was written;
(b) a report may not omit a **failing** check (the report is the failure surface — §5.3);
(c) a report may not state a **count** it did not read (every number is a `status()`/`validateDocFlow`/
`listNodes` reading, never a literal — except the 512 cap and the 226-document census *claim*, which are
labelled as claims);
(d) a report may not claim the **engine leg** works — the engine leg's only truthful report today is
`ABORTED — FS-CM-1`.

### 8.3 The migration ledger (the durable record the rollback reads)

The migration writes **one ledger entry** per run, as a **doc-layer artifact** under
`docs/specs/` — the unit's own ledger file, `docs/specs/unit-corpus-migration-ledger.md` — carrying:

- the store name, the authority, the source path, the destination authority descriptor, the UTC
  timestamp, and the destination/rollback-artifact paths;
- the **pre-migration census** and the **per-document digests** (so §7.4's rollback verification can
  replay them after the source is no longer live);
- the **source-side retrieval result sets** for the pinned probe queries at both top-K windows (the `V4`
  replay oracle);
- the pre-migration `undoDepth()`/`redoDepth()`;
- the check battery's outcome, the persist/broadcast census, and the operator confirmation lines
  (cutover confirmed · rollback exercised · retention ended).

**Why a ledger and not a hidden state file:** the ledger is the artifact the *rollback* depends on, and
`AGENTS.md` item 6 gives docs the archival duty; a hidden JSON marker would be a **new store** outside the
registry (and a second status authority, which R6 of the requirement-catalog contract exists to
prevent). **The ledger is a ledger, never an authority** — it records readings and MUST NOT be consulted
as the source of truth for a live store (that would be a status authority).

---

## 9. Dependencies, and what this unit must NOT do

### 9.1 Dependencies (upstream of any execution)

| Dependency | Status | What it gates |
| --- | --- | --- |
| **`U-ENGINE-PERSIST` (the Gnosis handoff) — GR-7 server-side durability** | **OWED — AMENDED 2026-09-28 (`X-7`): the DURABILITY leg is NO LONGER owed by the engine — its own trackers record `D-D1`+`D-D2` DONE, LANDED-GREEN + ALL GATES RUN (2026-09-22), and `GR-7`'s trigger DISCHARGED (ENGINE-green only; UNVERIFIED LIVE from this repo). What remains owed to THIS unit is the INGEST / RECORD-COPY route (`GR-6a`/`GRQ-6`, PARKED, trigger UNDISCHARGED), which is what keeps §10.3's `FS-CM-1` BLOCKED. The as-written citation (`docs/HANDOFF.md` O-7 pointer row, "the engine persists nothing today") is kept as the dated record and is the STALE half.** | the existence of an engine authority at all |
| **`O-7` / GR-6 bulk ingest (parse + doc-flow validate + atomic commit + progress/cancel/cap)** | **OWED** — no route exists (`docs/pending.md` §PARKED DESTINATION O-7; `src/main/engine-rag-store.ts` `EngineRagStore` has no write method) | the engine destination leg |
| **`O-8` / GR-4 + GR-5 authority switch + change notification + bulk read** | **OWED** — "PREREQUISITE of the track, not a tail unit" (`docs/pending.md` §PARKED DESTINATION O-8) | §7.3's single-authority rule; without it the cutover has **two writers and no reconciliation story** |
| **the record-copy route with CALLER-SUPPLIED ids** | **OWED — and not yet filed.** §2.3's fourth row: a markdown-parsing ingest **cannot** honour id preservation (**O2**) | honouring §3.3 for an engine destination |
| **`U-AUTHORITY-SWITCH`'s boundary** | **OWED** — the authority-switch contract is O-8's subject; this unit **consumes** its boundary and **does not define it** | §7.3 (exactly one live authority) |

**This unit is BLOCKED for execution and is spec-first by design** (the `TAB-2` precedent,
`docs/specs/design-extensions-review.md` §3.3 C10: "no code until the predicate is pinned"). Its
**landable halves today** are: the plan/report/ledger contract, the dry-run, and the verification
battery over a **host-side reference destination** (which exists and is node-testable). Its
**engine-destination execution** half is `FS-CM-1`-aborted until the upstream set lands.

### 9.2 What this unit must NOT do (each a review finding)

1. **It must NOT re-derive the fence suites.** `tests/import-render-no-duplicates.test.ts` and
   `tests/traversal.test.ts` are **EXEMPT BY NAME** and "must stay green unchanged"
   (`docs/specs/design-extensions-review.md` §3.1's named ruling: the fence "may not be re-derived by any
   `GN-*` unit — a unit that cannot stay green under the fence is not a `GN-*` implementation of `GN-1`
   but a **new proposal re-entering this gate**"). This unit's red set is authored in its **own** contract
   file; it edits **neither** fenced file, and it must leave both green **unchanged**.
2. **It must NOT touch the O-0 oracle pair** — `src/shared/o0-report.ts` + `scripts/live-drive.mjs`. "A
   change to EITHER file **invalidates the recorded live provenance (RCA-11)** and forces another live
   run → §3b re-audit → doc review" (`docs/specs/design-extensions-review.md` §6.2). The doc-layer/plan
   half has **no reason** to touch either; the mechanical **before/after hash re-read** of the pair is
   owed to a shell-bearing pass and must be reported in the DONE row.
3. **It must NOT re-seed the operator store.** The `O0_OPERATOR_DOCUMENTS = 226` census gate
   (`src/shared/o0-report.ts`; asserted by the O-0 report-contract test) and the gate's "must not …
   re-seed the operator store" item forbid: a re-import, a re-seed, a live derive against the operator's
   `persistenceFile`, or a migration run against the operator's real corpus as a *test fixture*. **Every
   test uses a temp-dir corpus** (`mkdtempSync` + generated or fixture corpora); the operator corpus is
   read **never** as part of `npm test`.
4. **It must NOT re-derive `O0_OPERATOR_DOCUMENTS`, `MAX_IMPORT_FILES`, the `version` literals, or the
   census figures.** They are **claims/canaries** read from their owners, never re-pinned here.
5. **It must NOT patch the Gnosis repo or `node_modules/provident-ssr`**; a new engine gap it discovers
   is a `docs/defects.md` row + a `docs/HANDOFF.md` pointer row (`AGENTS.md` item 7).
6. **It must NOT supersede an ACTIVE decision row, and it must NOT re-supersede the rows the `GN-1`
   ruling already superseded.** `MULTI-STORE-REGISTRY`, `PROJECT-JOURNAL`,
   `C16-CONSUMES-PROJECT-JOURNAL`, `VECTOR-CACHE-CONTENT-HASH-KEY`, `BATCH-ATOMICITY-API` and
   `IMPORT-BATCH-PERSIST`'s accepted cadence all **stay ACTIVE as written**. **The rows this unit must
   NOT touch because the 2026-09-21 ruling already moved them:** `RAG-AUTHORITATIVE`,
   `SINGLE-WRITER-STORE` and `SINGLE-WRITER-STORE-PER-STORE` are **SUPERSEDED by `DECIDED:
   ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`**, `ASTROGRAPHER-SCOPE-REALIGNMENT` is **AMENDED** (its
   presentation-layer half stays ACTIVE), and `ENGINE-ABSENT-DEGRADED-CONTRACT` is **partially superseded
   by `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`** (its "never silent" clause survives) — all
   landed in `docs/decisions.md`, none re-adjudicated here. The cutover's own recording belongs to the
   O-8 authority-switch unit, not here.
7. **It must NOT add a capability to `src/` that spawns or connects to the engine from a new seam.**
   `GNOSIS-LAUNCHER-TOGGLE` owns the spawn ("the shell remains a pure client; the launcher does the
   orchestration"; `src/` has **no** process-spawn capability — the only `node:child_process` use is the
   ollama `execFileSync('curl', …)` probe in `src/main/embeddings.ts`). A shell-side spawn is a **new
   gated proposal**.
8. **It must NOT prune, archive or delete a catalog row, a defect row or a tracker row.** This unit
   writes its own spec + ledger + tracker rows; §C.4 is untouched and no deletion cites anything
   (`docs/specs/design-extensions-review.md` §3.6 F.3 items 5/7).
9. **It must NOT report any of this as app-green — and, for this unit, not as engine-green either.**
   See §10.3.

### 9.3 Decisions this spec pins (the rows a landing pass owes)

The **choices pinned here, which had no owner before this file** (each owes a `DECIDED:` row when the
unit lands — this spec **does not** write `docs/decisions.md`):

| Pinned id | The choice |
| --- | --- |
| `DECISION-CORPUS-MIGRATION-ROUTE` | §2.4 — record copy through **ONE `applyBatch`** (nodes then edges); **never** a markdown re-import; never a raw-file read |
| `DECISION-CORPUS-MIGRATION-ID-PRESERVATION` | §3.3 — identity for the default store; the `<name>:` prefix applied **exactly once** to document ids for a non-default store; **no id is re-minted**; the accepted per-op cadence is **honoured, not re-litigated** |
| `DECISION-CORPUS-MIGRATION-JOURNAL-RESET` | §3.2a — the project journal is **RESET** (one `batch` entry), the operator is **warned**, the pre-migration journal is **archived** in the retained artifact; the engine's journal is **not** substituted (that would reverse `C16-CONSUMES-PROJECT-JOURNAL`) |
| `DECISION-CORPUS-MIGRATION-VECTOR-CACHE-RETAINED` | §3.2c — the cache is **left in place / retained**, never re-derived by the migration, never deleted; hits-or-misses are both legal and are **reported** |
| `DECISION-CORPUS-MIGRATION-IDEMPOTENCY` | §4.6 — a re-run is a **no-op iff** the destination already equals the source on the identity triple; **any other non-empty destination aborts**; no new idempotency store |
| `DECISION-CORPUS-MIGRATION-FAILURE` | §5.3 — **ABORT + RESTORE + NEVER PARTIALLY SWITCH** |
| `DECISION-CORPUS-MIGRATION-ROLLBACK-ARTIFACT` | §7.1 — the byte-for-byte pre-migration `persistenceFile` (+ version) in `provident-rag-rollback/`, retained until an operator-confirmed cutover, **never deleted by the migration** |
| `DECISION-CORPUS-MIGRATION-SINGLE-AUTHORITY` | §7.3 — exactly one live authority; the artifact is never registry-reachable; a two-authority rollback **refuses** |

### 9.4 Trackers this unit's landing pass touches (owed, not written here)

- **`docs/decisions.md`** — the eight rows of §9.3 (one row each; `DECIDED:` / ACTIVE, no `SUPERSEDED`).
- **`docs/pending.md`** — a **PARKED** row for the engine-destination leg, with **the named blocking
  fact** (the upstream set of §9.1) and its **revisit condition** (the O-7/O-8 pointer rows close).
- **`docs/defects.md`** — one row for the **not-yet-filed** upstream request (the record-copy route with
  caller-supplied ids, §2.3's fourth row) plus any RCA-3 host findings.
- **`docs/HANDOFF.md`** — a **pointer row** for that fourth upstream capability, filed in the O-7/O-8
  pointer-row shape (the existing O-7/O-8 rows are **cited, never edited**).
- **`docs/next-steps.md`** — the DONE row, stating the **layer** (§Layer) and the **recorded red set**
  (RCA-1), with the engine leg marked BLOCKED.
- **`docs/specs/design-extensions-review.md`** — **README-ONLY relationship: NONE.** That file was
  being amended concurrently when this spec was authored; this unit **cites it by section reference
  (§3.x/§9.2/§13/§14) and edits nothing in it**, and the 2026-09-21 item-10d documentation review
  confirmed every citation against the file as landed.

---

## 10. The unit process

### 10.1 The gate order (spec → red → green → adversarial → doc review → trio)

| Step | Owner | Deliverable |
| --- | --- | --- |
| **1. Spec** | SpecDoc | **this file** (+ §5's register + §6's FS ids). **Done.** |
| **2. TestWriter RED (RECORDED)** | TestWriter | `tests/unit-corpus-migration-contract.test.ts` authored **from this spec alone**, run, and the red set **reported verbatim** (which §5 register rows and §6 fail-states are red on arrival, and why — the module does not exist). **RCA-1: the red run is REPORTED in the DONE row before any implementation.** No implementation accompanies the red set. |
| **3. Implementer GREEN** | Implementer | the least code that turns the red set green (`src/main/corpus-migration.ts` per §4.1 + the ledger writer). Re-runs the trio. |
| **4. Adversarial (RCA-3, MANDATORY)** | read-only adversarial agent | edge cases / unauthorized access / malformed inputs — recorded in §6a/§6b below. Host findings fixed here + regression-tested; a package/engine finding → `docs/defects.md` + `docs/HANDOFF.md`, **never patched**. |
| **5. Blind greens (RCA-4)** | an agent who did NOT implement | the green-scenario artifact authored from **this spec + §5** only, run against the live module. A failure is doc/spec drift OR an un-hardened regression — **never a pass**. |
| **6. Item-10d documentation review (RCA-6)** | read-only doc reviewer | reconciles **this spec** + its greens + the active trackers against the build: method names/signatures/return shapes/throw patterns, the census claims (226 / 6 102 / 9 266 / 512), cross-references and section numbers, the layer declaration, the test count. Record appended at `archive/reviews/<date>-unit-corpus-migration-doc-review.md` (gitignored; cited by path only). |
| **7. Trio (AGENTS.md item 4)** | Implementer | `npm test` · `npm run typecheck` · `npm run build` — all green, with the readings in the DONE row. |

### 10.2 The layer declaration and the live-battery mandate (RCA-11)

**Layer (restated for the DONE row): MAIN-PROCESS / STORE layer for the plan, the reference-destination
execution, the verification battery and the rollback file operations; APP/ASSEMBLED + OUT-OF-REPO for
the engine leg and the operator-visible surface.**

**The live-battery mandate, stated plainly (§10.3), and the recorded park reason for anything parked
(§10.4).** RCA-11 forbids "parked by default": a battery may be parked **only** for a **structurally
non-exercisable** surface **with the recorded park reason**.

### 10.3 What a green covers, and what it does NOT (RCA-11/12 — stated plainly)

**A green of this unit covers:**

1. the **plan/report/ledger contract** (§4.1, §8) — pure and node-testable;
2. the **reference-destination migration mechanism** (§2.4/§4.2) over **two temp files**: the
   all-or-nothing batch, the single `persist()`, the census/id/hash/doc-flow checks, the idempotency
   probe, the abort/restore paths, and the file-level rollback — all on the **STORE layer**, asserted
   through the store's public surface;
3. the **register** (§5) `held` and the **fail-states** (§6) loud.

**A green of this unit does NOT cover — and must never be reported as covering:**

1. **The engine leg.** No `EngineRagStore` write route exists (§2.3). **There is nothing to be green
   about**: a green here says *nothing* about whether an engine can accept, atomically commit, persist,
   or re-serve the corpus. The engine leg's only truthful status today is **BLOCKED (`FS-CM-1`)**.
2. **The assembled app.** The dom-shim is layout-less/CSS-less; the **runtime stage↔app-graph assembly**
   and the **live persistence round-trip** are structurally unassertable in node (RCA-12). Whether the
   boot with a cutover registry actually serves reads from the new authority, whether the renderer
   re-traverses correctly after the switch, and whether the operator-visible warning/report paints —
   **none** of that is asserted by this unit's node suite.
3. **The operator's real corpus.** Every test uses a temp corpus (§9.2 item 3). A green says nothing
   about the real 226/6 102/9 266 instance beyond the *shape* of the checks.
4. **Retrieval parity in the engine's mode space.** `V4` is run on the **local** retrieval leg against a
   **host-side** destination. Parity across the engine's `/rag/query` (whose `mode`/`topK` are separately
   defective — `GNOSIS-ENGINE-QUERY-MODE-IGNORED`) is **out of reach** and is not claimed.

**Therefore the DONE row must read**, in substance: *"STORE-layer green for the migration mechanism over
a host-side reference destination; the engine leg is BLOCKED on the §9.1 upstream set; the assembled-app
and live surfaces are NOT covered (RCA-12)."*

### 10.4 What is PARKED, and with what reason

| Surface | Park reason (recorded — RCA-11b) | Revisit condition |
| --- | --- | --- |
| **The engine-destination live battery** | **Structurally non-exercisable: the route does not exist.** There is no engine ingest endpoint, no engine persistence, and no engine authority switch (§2.3). This is a **missing capability**, distinct from a missing session. | The §9.1 upstream set lands (a `gnosis-server` serving a bulk-atomic ingest route with progress/cancel + durability, and the O-8 authority-switch contract). |
| **The assembled-app boot after a cutover** | **Structurally non-exercisable in node** (RCA-12: the node suite cannot see the assembly/round-trip), **and** not runnable today because a cutover cannot be produced without the engine. | The engine leg lands; then a live run (`scripts/live-drive.mjs`, the proven harness — spawn mode + MCP + CDP, census 226) boots the app with a cutover registry and asserts the boot/landing + a persisted read. |
| **A cross-store migration battery** | **Out of scope by construction:** a migration spans **one addressed store**; there is **no cross-store atomicity primitive** (`applyBatch` is per-store — `SINGLE-WRITER-STORE-PER-STORE`; `docs/pending.md`'s scratch-store-promotion row records the same gap). | A cross-store atomicity story exists (`docs/pending.md` §DEFERRED "Scratch-store promotion (cross-store copy)"'s revisit condition). |

**No other surface may be parked.** The plan/report, the reference-destination mechanism, the
verification battery and the rollback are **node-testable today** and therefore **not parkable**.

### 10.5 Page design

This unit has **no page-design surface**: its operator report (§8.2) is a **text/report artifact**, and
the D4-pane rendering of a migration report is **not** specified here (it would be its own unit under
`PARITY`/`SETTINGS-MODAL-THEME`, and the §5.U matrix is **full at 8** — `docs/specs/design-extensions-review.md`
§7.4: a live assertion must **re-pin an existing row or enter as an extended row**, never claim a slot).
**`docs/skills/designing-pages.md` does not exist in this tree** (only `docs/skills/process-guardrails.md`),
so no page-design skill update, no test-use-case coverage matrix and no demo-page index entry are owed —
recorded here rather than silently skipped (the `docs/specs/unit-import-batch-persist.md` §7.5 item 5
precedent). If that skill is created before this unit lands, this unit's report shape (§8.2) is an
**extended row**, never a new matrix slot.

---

## 6a. Adversarial findings (RCA-3) — to be recorded after the green

**Status: NOT YET RUN** (this pass authors the contract only). The pass is **MANDATORY** per RCA-3 and
its findings land **here**, in this section, with host findings fixed + regression-tested in the same
pass. The named work list this unit's subject invites (so the adversarial agent does not have to
re-derive it):

1. a source store whose file is a **FIFO/device** or a **directory** (the `statSync().isFile()` probe and
   the corrupt path);
2. a source store with **quarantined** records (must abort — the lossy-census hazard §4.3);
3. a destination whose path is the **source's** path, or whose path is the **registry file** itself (the
   Pass-D self-collision guard);
4. a destination that is **non-empty but census-equal** (the idempotency probe's clause (c) — the
   hash set — must do the work the counts cannot);
5. a **prefix** applied twice (`<name>:<name>:`) or a non-default store's id that already carries
   another store's prefix;
6. a **prototype-pollution** payload inside `props`/`children`/`ownedNodeIds` travelling through the
   copy (the store's own guards must still reject it);
7. a **corrupt/unreadable rollback artifact**, a **truncated** artifact (the atomic copy), and a
   rollback whose registry binding has **drifted**;
8. a **concurrent** bare `putNode` racing the migration batch on the destination (serialization), and a
   **second migration** enqueued while the first runs;
9. a **read-only destination directory** between the batch and its `persist()` (the non-fatal persist
   path — which is why the report carries `destinationStatus` + a boot round-trip);
10. a corpus whose **document count exceeds the cap** while file-addressed, and a corpus with an
    **empty document** (a document root with no `next-section` chain);
11. the **journal-shape** attack: a destination whose journal somehow carries >1 entry (must be
    `FS-CM-14`).

## 6b. Proposal-review findings

**Not a three-agent gate** (AGENTS.md item 8): this is a **new unit inside an already-reviewed
architecture** — the design-extensions gate's named ruling that "any future cutover owes a **named
migration unit**" (`docs/specs/design-extensions-review.md` §3.1's named rulings + §3.2 B.4).
It changes **no MCP contract clause** and supersedes **no** ACTIVE decision row (§9.2 item 6), so the
item-8 carve-out ("not to fixes inside a documented contract's shape") is the wrong shape here too — the
correct characterization is **a new unit spec derived from a gated architecture** (the
`docs/specs/design-extensions-review.md` **§3.3 C** — the unit-decomposition table — style decomposition), whose review findings are the
**gate's own conditions**: the "must NOT" set of §9.2 (items 1–9), the §5 register's honest no-pad
rationale, and §10.3's layer statement. **A spec that claims a three-agent gate it did not run is a
finding; this section records that it did not.**

---

## 11. Census / numeric claims, and cross-references

### 11.1 Census (the numeric claims of THIS spec)

| Claim | Value | Source |
| --- | --- | --- |
| The operator corpus — documents | **226** | `src/shared/o0-report.ts` `O0_OPERATOR_DOCUMENTS = 226` (asserted by the O-0 report-contract test); the design-extensions gate's named ruling |
| The operator corpus — nodes | **6 102** | `docs/specs/design-extensions-review.md` §3.1's named ruling |
| The operator corpus — edges | **9 266** | same |
| The import file cap | **512** | `src/main/import-directory.ts` `MAX_IMPORT_FILES` |
| The store file `version` | **1** | `RagStoreFile.version` (`docs/specs/unit-a-rag-store.md` §5.2); a non-`1` version is corrupt |
| Journal entries in the destination after a migration | **1** (`kind:'batch'`) | §3.2a; `docs/specs/unit-n-batch-atomicity.md` §5.4 |
| `persist()` calls per migrated store | **exactly 1** | §2.4/§4.3; `BATCH-ATOMICITY-API`; `docs/specs/unit-import-batch-persist.md` §2b/§5.1 |
| `persist()` calls a failed migration performs on the destination | **0** | §5.3; Unit N §5.5 |
| `persist()` calls an `already-migrated` re-run performs | **0** | §4.6 |
| Result broadcasts a run emits | **≤ 1** (0 on abort/dry-run) | §4.4 |
| `RagStore` reads stay **synchronous** | all of them (22 members: **13 sync reads / 9 async** — recounted in `src/main/rag-store.ts` `interface RagStore` by the 2026-09-21 item-10d doc review; the `16`/`6` split was a miscount) | `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` (the pin the gate re-affirms: "`RagStore` reads stay SYNCHRONOUS"); `docs/specs/unit-reads-pivot-tab-cache.md` §3.1 |
| `BatchOp` union members | **7** (closed) | `BATCH-ATOMICITY-API` |
| `RagStore` mutating methods on the destination | the batch is **1** write unit | Unit N §5.6 |
| §5 register rows | **6** (≤8 cap) — `P-IM-1`, `P-SM-1`, `P-SM-2`, `P-TP-1`, `P-TP-2`, `P-TP-3` | §5.4 |
| §5 register budget | **30/row → Σ 180 attempts** declared upper bound (≤400; per-row ≤100), stop-after-5 | §5.4 |
| §6 fail-states | **14** (`FS-CM-1`…`FS-CM-14`) | §6.1 |
| Pinned decisions this spec owes rows for | **8** | §9.3 |
| Owes upstream capabilities | **4** (`U-ENGINE-PERSIST`/GR-7 · O-7/GR-6 · O-8/GR-4+GR-5 · the record-copy route) | §2.3/§9.1 |
| Parked surfaces | **3**, each with its recorded park reason | §10.4 |
| The cap's headroom on the operator corpus | **226 / 512** — a **canary**, not a binding constraint on the record-copy route | §4.5 |

### 11.2 Cross-references (every load-bearing citation, by `path` + symbol / row id / `§section`)

- **`docs/specs/design-extensions-review.md`** — the named ruling "the existing corpus (226 docs /
  6 102 nodes / 9 266 edges) has NO migration story → any future cutover owes a named migration unit"
  and "the multi-store registry stays ACTIVE", "the security/operator stores stay host-owned", the
  test-fence exemption, and the named `GN-*`/corpus rulings (§3.1); the parked-destination reading and
  the three verified reasons (§3.2 B.1); the migration/rollback obligation (§3.2 B.4); the
  `TAB-2`-style "spec-first; no code until the predicate is pinned" discipline and the unit-decomposition
  shape (§3.3 C); the gate's condition 9/10 (the layer declaration + the recorded zero-row exemption
  precedent) and the "must NOT" list (**§3.6 F.3** — "not edit the pinned corpora or re-seed the operator
  store"; "not report any of it as app-green"); the oracle-identity hazard (§6.2, §7.2); the §5.U matrix
  cap (§7.4); the reversibility row "An operator-corpus cutover … **NO**" (§9.2). **Citations into that
  file are now real section references (§3.1, §3.2 B.1/B.4, §3.3 C, §3.6 F.3, §6.2, §7.2, §7.4, §9.2,
  §10.2/§10.4, §13.1–§13.3, §14.1, §14.2) with their titles retained**; this unit was authored while
  that file was being amended concurrently and now points at it as it stands (verified by the
  2026-09-21 item-10d documentation review).
- **`docs/pending.md`** — §"PARKED DESTINATION — the engine track (ARCH-GNOSIS-OFFLOAD O-6/O-7/O-8)":
  the **O-7** row (`Recorded constraints`: no parser/bulk route/progress contract/persistence; the
  shell's `applyBatch` + 512 cap + one-shot `IPC_IMPORT_RESULT` have no engine equivalent; the
  `BATCH-ATOMICITY-API` reference), the **O-8** row (`PREREQUISITE`, not a tail unit; the
  `SINGLE-WRITER-STORE` amendment + the `--user-data-dir`/settings-persistence clause), the **O-6** row
  (result-shape parity), and the **track trigger** (a)/(b)/(c) with the "A CANDIDATE IS NOT A FIRED
  TRIGGER" rule; §SCHEDULED's landed-unit provenance; §DEFERRED's "Scratch-store promotion (cross-store
  copy)" revisit condition; §DEFERRED's multi-store Phase-1 containment limitation (a `corpusRoot: '/'`
  makes containment vacuous).
- **`docs/HANDOFF.md`** — the **O-7 INGESTION-ONTO-THE-ENGINE** pointer row; the **O-8 AUTHORITY
  SWITCH / OFFLINE DUAL-PATH** pointer row; the GR-1..GR-9 ledger paragraph; the "Do NOT patch the
  Gnosis repo from this project" instruction. **Cited, never edited.**
- **`docs/specs/requirement-catalog.md`** — the contract shape this spec matches: the layer declaration
  + the recorded zero-row register exemption (the header block), §3.1 (the non-authority rule), §3.2 (the
  closed 16-capability partition), §3.3 (the 13-field row schema), §3.4 (the frozen vocabularies + the
  citation discipline: no line numbers), §3.5–§3.5.3 (pointer addressing + the owning-row test), §3.6
  (verdict rules), §3.7 (the conflict/waiver ledger), §3.8 (the manifest), §3.10 (the closure duty), §9 +
  §9.1 (amendments). Plus `docs/requirement-catalog.md` §C.0 rules 1–5 (the non-authority rule), §C.1's
  ordered boundary list (B1…B16) and the two relevant discriminators for this unit's eventual rows
  (`UPSTREAM-OWED` by "who must change"; `ENGINEERING-ONLY` by observability), §C.4's non-prunable
  ledger (`PRUNE-801`–`PRUNE-839`, cited never edited), §C.5–§C.8 (the frozen vocabularies, the manifest
  counts, the conflicts, the change log).
- **`docs/specs/unit-a-rag-store.md`** — §5.2 (the persisted `RagStoreFile` shape `{version, nodes,
  edges, journal, cursor}`), §5.3 (the `RagStore` interface + `createJsonRagStore`), §5.4 (the full
  `RagStore` interface, incl. the adjacency + `teardown` members), §5.5 (the single-writer queue + the
  `inQueue` re-entrancy), §5.6 (the project journal + invertible entries), §5.7 (the atomic temp+rename
  write, the fail-disabled boot, the hash-verified source + quarantine, the non-fatal persist failure,
  and the documented asymmetry that **journal entries are not hash-verified**), §5.9 (the documented
  fail-states), §5.10 (the census: the default `maxJournalLength` **1000**, the `version`, the hash).
- **`docs/specs/unit-n-batch-atomicity.md`** — §5.1 (the `applyBatch` API + the closed `BatchOp`/
  `BatchOpResult`/`BatchResult` types), §5.2 (atomicity), §5.3 (rollback), §5.4 (the single `batch`
  journal entry + the inverse mapping), §5.5 (the single persist; "a failed batch does not persist at
  all"), §5.6 (re-entrancy), §5.7/§5.8 (happy paths + fail-states), §5.9 (the census: `persist()` calls
  per successful batch = 1, per failed batch = 0; `undoDepth()` +1).
- **`docs/specs/unit-import-batch-persist.md`** — §2b (the invariant "NO PER-OP FULL-STORE WRITE INSIDE
  A BATCH" + the `persistDeferred` seam), §2d (the decision rows the fix must not break), §2e (the
  forbidden shortcuts, incl. the vacuous-oracle guard `F2`), §3 (the S/FS shape this spec's §6 follows),
  §4 (the register convention + the census-instrument + the control-draw discipline), §5.1 (the pinned
  budget shape), §7.6 (**the ACCEPTED per-op cadence NOTE** + its revisit condition — honoured at §3.3),
  §7.5 (the honest-limits precedent for §10.5's "the skill does not exist" note).
- **`docs/specs/unit-v5-migration.md`** — §3.4 Pin 4 (the import-path mechanism / the driver
  source-contract anti-regression pin), §4 (the register convention), §9 (its adjacent-unit boundary —
  the precedent for a unit naming its sibling and splitting the cycle).
- **`docs/specs/astrographer-scope-realignment-review.md`** — §3.3 (the AUTHORITY/SECURITY SEAM row:
  the security/operator stores are host-owned), §3.4 (`ENGINE-ABSENT-DEGRADED-CONTRACT`), §7.3(e) ("O-8's
  authority-switch prerequisite remains unmet"), §7.1 (the frozen shell queue, which this unit does **not**
  re-open).
- **`docs/decisions.md`** — `RAG-AUTHORITATIVE`, `SINGLE-WRITER-STORE`, `SINGLE-WRITER-STORE-PER-STORE`,
  `PROJECT-JOURNAL`, `C16-CONSUMES-PROJECT-JOURNAL`, `JOURNAL-READ-VIA-PACKAGE`, `BATCH-ATOMICITY-API`,
  `IPC-EDIT-BATCH`, `MULTI-STORE-REGISTRY`, `MIGRATION-LEGACY-PATH` (as described in the
  `MULTI-STORE-REGISTRY` row), `STORE-ID-PREFIX` (incl. the A1 reservation + the U-MS4 landed
  resolution (a)), `VECTOR-CACHE-CONTENT-HASH-KEY`, `ONE-WAY-SNAPSHOT`, `CONTENT-EDIT-RE-TRAVERSAL`,
  `ENGINE-ABSENT-DEGRADED-CONTRACT`, `GNOSIS-LAUNCHER-TOGGLE`, `ARCH-GNOSIS-OFFLOAD`,
  `ASTROGRAPHER-SCOPE-REALIGNMENT`, `RAG-EDIT-MCP-GROUPS`, `IMPORT-FILE-COUNT-CAP`,
  `IMPORT-RESULT-BROADCAST`, `IMPORT-NO-SYMLINK-FOLLOW`.
- **`src/main/rag-store.ts`** — `createJsonRagStore`, the `RagStore` interface, `RagStoreFile`,
  `nodeSource`/`edgeSource` + `nodeHash`/`edgeHash`, `validateNodeShape`/`validateEdgeShape`,
  `normalizeDocumentPath`/`normalizeTags`, `load` (the `version !== 1` / non-regular-file /
  parse-failure corrupt paths + the hash-mismatch quarantine + the edge-endpoint quarantine cascade),
  `toPublicNode`/`toPublicEdge`, `applyBatch`/`applyBatchSync`/`applyBatchOp`, `insertNode`/`insertEdge`/
  `removeNodeInternal`/`setNodeFields`/`setEdgeFields`, `pushJournal`, `persist` (+ the `persistDeferred`
  guard), `status`, `journal`, `undo`/`redo`/`undoDepth`/`redoDepth`, `teardown`, `enqueue`,
  `edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/`docHeadForDocument`. **Cite by symbol.**
- **`src/main/markdown-import.ts`** — `importMarkdownCorpus`, `ImportMarkdownParams`,
  `ImportMarkdownResult` (**`nodeCount`/`edgeCount` are the BATCH SIZE, not store totals**),
  `ImportStoreContext` (`name`/`isDefault`/`reservedNames`), the §5.2 op construction (all `putNode`
  ops, then all `putEdge` ops), the corpus-root containment seam, the `<name>:` mint, the A1
  prefix-namespace rejection. **Cite by symbol.**
- **`src/main/import-directory.ts`** — `MAX_IMPORT_FILES` (512), `expandImportDirectory`,
  `resolveImportSelection`, `buildImportDialogOptions` (the cap's fail-loud `cap-exceeded` shape).
- **`src/main/rag-store-registry.ts`** — `loadRagStoreRegistry`, `resolveRegistry` (Passes A–D + the
  registry-file self-collision guard), `implicitRegistry`, `derivePersistenceFile`,
  `RAG_STORE_NAME_PATTERN`, `CASE_INSENSITIVE_FS_PLATFORMS`, `RagStoreConfig`, `ResolvedRagStore`,
  `LoadedRagStoreRegistry` (`implicit`/`corrupt`).
- **`src/main/rag-store-registry-write.ts`** — `persistRagStoreRegistry`, `writeRegistryMutation`,
  `applyRegistryMutation`, `RegistryMutation`, `RegistryDelta`. **The only legal authority-switch write
  path (§7.3).**
- **`src/main/rag-store-runtime.ts`** / `src/main/rag-store-directory.ts` — `hotApply`, `hotRemove`,
  `hotRename`, `hotSetDefault`, `hotRenameDefault`, `syncLiveToLoaded`, `buildLexicalEntry`,
  `defaultPersistenceFile`, `resolveStoreArg`, `buildRagStoreDirectory`, `storeLoadStatus`
  (`'loaded'` / `'failed-corrupt'` / `'failed-missing'`).
- **`src/main/doc-flow.ts`** — `validateDocFlow`, `DocFlowVerdict` (`cycle` / `missing-node` /
  `missing-head` / `missing-end`), and its Rules 1–6 (the head-first order, the multiple-heads violation,
  the duplicate `next-section` violation, the `doc-child` nesting cycle, the missing-end terminal rule).
- **`src/main/adjacency.ts`** — `buildAdjacencyIndex`, `edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`/
  `edgesForDocumentIndex`/`docHeadForDocumentIndex`, `createSnapshotStore`, `deepCopy`, `DANGEROUS_KEYS`,
  `RAG_EDGE_KINDS`.
- **`src/main/vector-cache.ts`** — `createVectorCache`, `VectorCache`, `CacheKey`, `contentHashOf`,
  `createSingleTextMemoizer`, `CACHE_WRITE_DEBOUNCE_MS`, the pinned load/write logs.
- **`src/main/operator-settings-store.ts`** — `createOperatorSettingsStore`, `OperatorSettings`,
  `OperatorSettingsPatch`, the `sanitize` coercion rules.
- **`src/main/engine-rag-store.ts`** — `EngineRagStore` (the **absence of any write/ingest method** is
  the load-bearing reading), `ENGINE_ENDPOINTS`, `EngineRagStoreOptions`, `EngineRagQueryOptions`,
  `EngineUnavailable`, `EngineWireError`. **Cite by symbol.**
- **`src/shared/o0-report.ts`** — `O0_OPERATOR_DOCUMENTS = 226`. **Cited, NEVER touched** (§9.2 item 2).
- **`scripts/live-drive.mjs`** — the proven live harness (spawn mode + MCP + CDP, the census gate).
  **Cited, NEVER touched** (§9.2 item 2).
- **`tests/import-render-no-duplicates.test.ts`** + **`tests/traversal.test.ts`** — the **fence suites,
  exempt by name**, left green unchanged (§9.2 item 1).
- **`AGENTS.md`** — item 2/RCA-5 (per-unit delegation), item 3/RCA-1 (red first, recorded), item 4 (the
  trio), item 5 (specs + `DECIDED:` rows), item 6 (the archival loop + the active trackers), item 7 (the
  defect/handoff duty), item 8 (the proposal gate + its carve-out), item 9 (the delegation gate), item
  10/RCA-4 (blind greens) + item 10d/RCA-6 (the doc review), item 11/RCA-11 (the live-battery mandate +
  the recorded park reason), item 12/RCA-12 (the layer statement).

---

## 12. The gate shape (how this unit is accepted)

- **Delivery kind:** **one new main-process module** (`src/main/corpus-migration.ts`), **one new
  contract test file** (`tests/unit-corpus-migration-contract.test.ts` — the §5 register + the §6
  fail-states), **one ledger doc** (`docs/specs/unit-corpus-migration-ledger.md`), its tracker rows
  (§9.4), and this spec. **No registry format change, no `RagStore` interface change, no `BatchOp` union
  change, no new IPC channel, no new MCP tool, no `src/` write to the oracle pair, no edit to the fence
  suites.**
- **Delegability (AGENTS.md item 9):** (a) **this spec exists** ✓; (b) a **TestWriter has RUN and
  reported the red set** — **NOT YET**. Until (b) is discharged the unit is **not delegable**, and the
  DONE row must carry the red set verbatim (RCA-1).
- **Gate items, in order (§10.1):** spec → red (recorded) → green → **RCA-3 adversarial** (§6a) →
  RCA-4 blind greens → **item-10d doc review** (RCA-6) → the trio. Each recorded in the unit's DONE row
  with its **layer**.
- **Blocking status:** the **engine-destination leg is BLOCKED** on §9.1's upstream set, and its park is
  recorded with its reason (§10.4). The **plan/dry-run + reference-destination mechanism + rollback**
  legs are **not** blocked and are not parkable (§10.4's closing sentence).
