# UNIT `U-READS-PIVOT` — the tab-scoped read cache + the async tab-open fetch — Spec

**Status:** **DRAFT — the contract for this unit; no code is delegated until this file exists.
This unit is the P2 PREREQUISITE named `U-READS-PIVOT`** (`docs/specs/design-extensions-review.md`
**§11 USER RULINGS (2026-09-21)**, the `GN-1` ruling at **§11.1** and the read-model ruling at
**§11.5** — the gate record that closes the proposal gate on
`docs/feature-requests/design-extensions-2026-09-21.md`; the program phase is **§13.1 P2** and the
unit's own gate obligations are **§13.3**). **Nothing here authorizes a build:**
the delegation gate (`AGENTS.md` item 9) is satisfied by this file **plus** a TestWriter red set that
has been RUN and REPORTED (RCA-1, §8).

**Layer (RCA-12, mandatory declaration):** **HOST/MAIN-PROCESS (pure, node-assertable)** *for the
cache module and its typed failure surface*, **plus ASSEMBLED/RENDERER** *for the tab-open loading
state and the tab-level warning*, **plus ENGINE-DEPENDENT** *for the tab-open fetch itself*.
**Nothing in this unit is APP-GREEN from a node-suite green** (§9): the node suite sees the pure
cache, never the assembled tab surface and never the engine hop.

**The pinned ruling this unit implements (verbatim, 2026-09-21):**

> *"Host read cache exists only for currently tab-owned documents and pane data. Opening a new tab
> requires an async call to Gnosis to load the data into cache."*

**Source of record for the read model:** `docs/specs/design-extensions-review.md`
**§11 USER RULINGS (2026-09-21)** — the ruling above, at **§11.5**, plus the disposition of
`GN-1` (**§11.1**) / `GN-4` (**§11.3**) — and **§12 THE READ MODEL (tab-scoped cache)** (the
cache/residency/fetch/eviction/commit shape this spec derives from).
**Both are cited by their real section reference (§11, §12) AND by title** — the titles are retained
so a reader resolves them by heading text even if the numbers move; that file was being amended
concurrently when this spec was authored, and **a line number is a citation that must not appear in a
spec** (`docs/specs/requirement-catalog.md` §3.4 rule 7). **Every citation in this file is
`path` + symbol / row id / `§section`.**

**§5.x PBT property register — 8 rows** (the register table is §7), classes `P-IM` ×3 / `P-SM` ×3 /
`P-TP` ×2, a pinned
deterministic seed, a **≤100-attempts-per-row / ≤400-total** budget with **stop-after-5** reporting,
and per-row `held`/`broken` verdicts produced by a **read-only** PBT audit that did not author the
rows (`AGENTS.md` RCA-3).

**Provenance / inputs.** The reviewed proposal and its gate verdict:
`docs/feature-requests/design-extensions-2026-09-21.md` (§2.9 the `GN-1`…`GN-4` block; §3 the
candidate-collision table) and `docs/specs/design-extensions-review.md` (the landing record; its
**§11 USER RULINGS (2026-09-21)** — `GN-1` at §11.1, `GN-3` at §11.2, `GN-4` at §11.3, `GN-2` at
§11.4, the read-model ruling at §11.5 — and **§12 THE READ MODEL (tab-scoped cache)** are the
authority for every pin below). The reversed exclusion:
`docs/specs/astrographer-scope-realignment-review.md` §3.3 (the WRITE PATH row, excluded by name) and
§3.4 (the degraded-mode contract). The seam: `docs/specs/gnosis-offload-review.md`
(shape **Alt C**; the only crossing; the landing order O-0 → O-5 → O-9+O-3 → O-10 → O-1 → O-2; and
amendment **A-5**, which parks the `revision` field + stale-drop rule in the parked seam spec).
`docs/decisions.md` rows: `ENGINE-ABSENT-DEGRADED-CONTRACT` (recorded 2026-09-17; **as of 2026-09-21
its "every local path works IDENTICALLY" clause is SUPERSEDED** by the landed
`DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`, while its **"never silent" clause survives and is
not reversed** — see §6.2),
`ASTROGRAPHER-SCOPE-REALIGNMENT` (ACTIVE), `UI-CONFIG-CARRIER` (ACTIVE), `WHOLE-PAGE-EDITING`
(recorded REQUIREMENT, not yet implemented). Format conventions:
`docs/specs/requirement-catalog.md` (§5 FS register + the citation discipline),
`docs/specs/unit-a1-crud-routing-proxy.md` §5.7 (the typed §5.x register shape),
`docs/specs/unit-shell-integration.md` §5.7 (the budget/stop-after-5 wording).

**What this unit does NOT do (stated once, binding throughout).**

1. **It does not change the `RagStore` interface** (`src/main/rag-store.ts` `interface RagStore`) —
   not one member, not one signature. `docs/specs/gnosis-offload-review.md` §7 **A-9** forbids it by
   name, and `docs/specs/astrographer-scope-realignment-review.md` §7.2 lists
   `src/main/traversal.ts` and the interface itself as MUST-NOT-BUNDLE.
2. **It does not add the `revision` field to `RagSnapshotPayload`.** That field is parked by
   `docs/specs/gnosis-offload-review.md` §7 **A-5** and owes the decision row
   `SNAPSHOT-REVISION-AUTHORITY` (OWED). The staleness rule is therefore pinned **conditionally**
   (§3.4 Rule A / §4.2 Rule B) against a shape that does not exist yet.
3. **It does not write the commit contract.** The commit path's full contract belongs to the
   `WHOLE-PAGE-EDITING` carrier unit (**`U-EDIT-1`**, `ST-1`/`ST-3`/`ST-4`/`ST-5`/`ST-6` — the gate
   record's unit-decomposition table, `docs/specs/design-extensions-review.md` **§3.3 C** item **C9**;
   the reversal itself is **§12.7(a)**; `docs/decisions.md` `WHOLE-PAGE-EDITING`). This unit pins only
   **what the reversal makes possible and what the cache must do around a commit** (§6).
4. **It does not reverse anything about engine absence.** `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`
   was **REVERSED as to its "every local path works IDENTICALLY" clause** by `GN-4`
   (`docs/specs/design-extensions-review.md` **§11.3**; landed as the ACTIVE row `DECIDED:
   ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` in `docs/decisions.md`), and its **"never silent" clause
   SURVIVES and is not reversed** there. This unit pins the read cache's engine-absent surface (§6.2)
   **inside** the ruling's refusal boundary and changes no local path's presence-independence.
5. **It does not touch the operator corpus** — no re-import, no re-seed, no live derive
   (`O0_OPERATOR_DOCUMENTS = 226`, `scripts/live-drive.mjs`).

---

## 1. What this unit asks

Turn the host's "the renderer pulls the whole store" read model into a **tab-scoped read cache**:

1. **a cache whose contents are exactly the documents of currently-open tabs + the pane data those
   tabs need** (§2), keyed by `(store, kind, id)`;
2. **a synchronous read surface served from that cache**, whose **miss is a typed failure** — never
   an empty result (§4);
3. **an async tab-open fetch** to the engine that loads a tab's document into the cache, with a
   loading state and a tab-level warning on failure (§5);
4. **eviction + lifetime rules** bound to the tab set, with a memory bound and a typed over-bound
   failure (§6.1);
5. **the read-side half of the reversed commit exclusion** — an async engine write hop is now
   permitted, the cache is not applied optimistically, and the successor unit is named (§6.3);
6. **the engine-absent surface of the cache** (§6.2), and the **red-set/blast-radius plan** against
   the standing test fence (§8).

**Why the unit exists at all, in one line.** The pinned ruling makes a **tab's document residency a
precondition of reading it**, which is only implementable if a read that has no resident data says so
in a typed way: today the store answers every read from a whole-store in-memory map, so "not resident"
has no representation, and the failure mode this unit exists to prevent is the one the ruling names —
a stage that renders **empty** because a fetch never happened.

---

## 2. THE CACHE MODEL (pinned)

### 2.1 What is in the cache (contents — a closed set)

The cache holds **only** the following, and nothing else. Each entry kind is a **`CacheKind`**:

| `CacheKind` | Holds | Ownership test (when it is resident) | Current producer today |
| --- | --- | --- | --- |
| `documents` | the nodes + edges + doc-flow edges of **one document** in **one store** (the document's own RAG subtree as read by `computeDocumentSubgraph` / `buildTraversal`) | an **open tab** whose `TabTarget.kind === 'document'` and whose `documentId` equals the key's `id` (any tab, active or not) | `IPC_RAG_SNAPSHOT` (`src/main/main.ts` handler; `RagSnapshotPayload`), scoped by O-1/O-2's units (`docs/specs/gnosis-offload-review.md` §3) |
| `docnav` | the **document-navigator listing** for one store (the doc-head-derived rows) | **always resident while any tab is open in that store** (the doc-nav is a pane, not a tab, and the ruling's "pane data" clause covers it) | `IPC_RAG_DOC_HEADS` (`RagDocHeadsPayload`, `src/shared/types.ts`) |
| `search` | the results of **one opened search** (`TabTarget.kind === 'search'`'s `queryId`) | an **open tab** whose `TabTarget.kind === 'search'` and whose `queryId` equals the key's `id` | `rag.query` (local `src/main/retrieval.ts` `retrieve`/`ragQuery`, or the engine proxy) |
| `crosslinks` | the crosslink/backlink wiring for one document | a **resident** `documents` entry for the same `(store, id)` | `IPC_RAG_BACKLINKS` (`RagBacklinksPayload`) + `rebuildBackRefs` (`src/main/traversal.ts`) |
| `docheads` | the doc-head index for one document (`docHeadForDocument`'s answer + the doc-head node) | a **resident** `documents` entry for the same `(store, id)` | the store adjacency read `docHeadForDocument` + `edgesByKind('doc-head')` |
| `templates` | the operator-facing template/operator data a tab needs to render | **always resident** while the operator settings surface is loaded (`UI-CONFIG-CARRIER` is operator-scoped; this is the ruling's "as applicable") | `IPC_TEMPLATE_GET` / the operator-settings carrier |

**Explicitly NOT in the cache (each is a review finding if cached):** the whole store's
`listNodes()`/`listEdges()`; any document no open tab names; any document owned by a **closed** tab's
document id; the operator security/authority/idempotency/audit stores
(`docs/specs/astrographer-scope-realignment-review.md` §3.3's AUTHORITY/SECURITY SEAM row — host-owned
by contract); the vector/embedding cache (`src/main/vector-cache.ts` — its own owner); the project
journal; and **anything for a store other than the store a tab is bound to**.

### 2.2 The key (pinned, and why it is a tuple)

```ts
type CacheKind = 'documents' | 'docnav' | 'search' | 'crosslinks' | 'docheads' | 'templates'

/** The opaque composite key. NEVER a bare document id. */
interface TabCacheKey {
  /** The registry-resolved store name (RagSnapshotPayload.store; `'main'` zero-config). */
  store: string
  kind: CacheKind
  /** `documents`/`crosslinks`/`docheads` → the document id; `docnav` → the store listing scope;
   *  `search` → the tab's queryId; `templates` → the template/operator id. */
  id: string
}
```

**Pinned:** the `store` dimension is **REQUIRED and first**. Rationale recorded so a later pass does
not "simplify" it: `RagSnapshotPayload.store` is REQUIRED
(`docs/specs/unit-ms3-store-qualified-broadcast.md`) precisely because the multi-store registry stays
ACTIVE (`DECIDED: MULTI-STORE-REGISTRY` / `SINGLE-WRITER-STORE-PER-STORE`), and a cache keyed by
document id alone would alias two stores' identically-named ids. A bare-id key is `FS4`.

### 2.3 "Owned by a tab" — the exact predicate (pinned as a pure function)

`TabTarget` is a **5-member union** (`src/renderer/tab-state.ts`):

| `TabTarget.kind` | Owns (cache entries) | Notes pinned here |
| --- | --- | --- |
| `document` | `documents`, `crosslinks`, `docheads` for `documentId`; contributes to `docnav` residency | the ruling's "tab-owned documents" case; the tab is the **only** thing that can make a document resident |
| `search` | `search` for its `queryId` (`TabSearchParams`, `src/renderer/tab-state.ts`) | **results are DERIVED (re-run), never stored** per that module's own comment — so a `search` entry is a **memoized result of one run**, evicted with its tab, and never a second source of truth for `rag.query` |
| `graph` | `documents` for each document the view renders | the `kind` is declared but PARKED in `tab-state.ts`; this unit pins the rule, not an implementation: when a `graph` tab is open, the documents it renders are its owned set, and **the set must be explicit** — a `graph` target that does not name its documents makes **no** document resident (`FS5`) |
| `template` | `templates` for `templateId` | — |
| `other` (incl. the landing tab `TAB_LANDING`) | **nothing** | the landing/wikis listing is `{ kind:'other', id:'landing' }` by construction (`TAB_LANDING`, `src/renderer/tab-state.ts`); a landing tab owns no document, so **a landing-only tab set leaves the `documents` cache empty** and every document read is a typed miss (§6.2) |

**The residency predicate (PURE, and the seam that enforces residency):**

```ts
/** The set of CacheKeys the CURRENT TabState makes resident. PURE — no I/O, no engine. */
type ResidentKeySet = ReadonlySet<string>   // TabCacheKey serialized canonically
function residentKeys(state: TabState, ctx: { stores: string[] }): ResidentKeySet
```

**Who guarantees residency, per call path (pinned — this is the seam statement the task requires):**

| Call path | Residency guarantee |
| --- | --- |
| **the render path** (the stage/document render, `assembleAppGraphEnvelope`, `translateLegacy` admission, `content-reconcile`) | the render path **may only touch a document that is resident**. It never triggers a fetch, and it never reads the cache directly: it consumes the **already-traversed envelope** a tab load produced. The enforcement seam is **`buildTraversal`'s input**: the traversal input for a tab is built from that tab's resident entry, and a traversal input that names a non-resident document is a **typed `CacheMiss`** (`FS6`) |
| **the pane path** (doc-nav, search pane, crosslinks pane, doc-heads) | the pane resolves its key through `residentKeys(state, ctx)` **before** reading; a non-resident key → a typed miss, and the pane renders its **own** unavailable/warning state, never an empty list (the `P-IM-4` shape of `docs/specs/unit-a2-document-crud-wiring.md`: the pane stays renderable and DEADLOCK-FREE, and "empty" and "unavailable" are distinct states) |
| **the tab-open path** | the only path allowed to make something resident, and the only path allowed to be async (§5) |
| **the MCP surface** (`provident.list_targets` / `get_rendered_html` / `get_markdown` / the `rag.*` tools) | **unchanged by construction**: the MCP surface reads the host store / the app graph, not this cache. **Accept criterion:** the post-change MCP censuses for the focused document are unchanged (`docs/specs/gnosis-offload-review.md` §3's O-1 accept criterion) — an MCP-visible omission is a FAIL, not a perf win |

### 2.4 Persistence: it is in-memory only, and that is what "persists" means for `GN-1`

**Pinned:** the cache is **in-memory, main-process, and never serialized to disk.** No new store file,
no new `OperatorSettings` slice, no `SerializedRenderDoc`.

Therefore, the `GN-1` sentence *"Astrographer persists NO documents other than the data owned by the
current tabs"* is read as follows — and this reading is **binding on every later pass**:

- **Tabs' own state persists** — `open`, `activeId`, `order` and each tab's `TabSearchParams` serialize
  through the existing carrier (`TabState`, `src/renderer/tab-state.ts`; `UI-CONFIG-CARRIER`,
  `docs/decisions.md`), so the tab SET survives a restart.
- **Document data does NOT persist** — a restart reconstructs the tab set and then **re-fetches** each
  document (§5). A restart that renders a document without an engine call is a fail-state (`FS7`).
- **The cache is not a durable store** — it holds no record the store does not already hold, writes
  nothing back to disk, and is not a second writer. A cache write-back to disk is `FS8`.

**Consequence recorded so it is not re-derived:** `GN-1`'s persistence clause is a **stated
destination, not current behaviour** — it is the ruling at `docs/specs/design-extensions-review.md`
**§11.1** (`GN-1`), landed as the ACTIVE row `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` clause (2)
in `docs/decisions.md` — read against the SUPERSEDED-BY-RULING alternative at **§3.2 B — the
precedence architecture for `GN-1`…`GN-4`**. (The architecture's working destination-row name,
`DECIDED: ENGINE-OWNERSHIP-DESTINATION-UNSCHEDULED`, was **replaced, never minted**: §16 records that
R5's row is replaced by the ruling's rows.) **This unit does not land that destination; it
lands a cache that is compatible with it** and lands no durability.

---

## 3. THE SYNC-READ CONTRACT

### 3.1 The verified member census of `RagStore` (pinned — a NEW reading, and a CORRECTION)

**Read this pass** from `src/main/rag-store.ts` `interface RagStore` (the interface block, counted
symbol-by-symbol — **the interface is the source of record for the count; the list below IS the
count**):

| Class | Count | Members |
| --- | --- | --- |
| **members total** | **22** | the interface block |
| **SYNCHRONOUS reads** | **13** | `getNode` · `listNodes` · `getEdge` · `listEdges` · `status` · `journal` · `undoDepth` · `redoDepth` · `edgesFrom` · `edgesTo` · `edgesByKind` · `edgesForDocument` · `docHeadForDocument` |
| **ASYNC (mutations, the queue, batch, undo/redo, teardown)** | **9** | `putNode` · `removeNode` · `putEdge` · `removeEdge` · `undo` · `redo` · `enqueue` · `applyBatch` · `teardown` |

**The pinned sync-read count for this unit is 13, not 16.** The `16` figure appeared in
`docs/decisions.md` `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` ("22 members, 16 synchronous reads / 6
async") and was repeated in `docs/specs/astrographer-scope-realignment-review.md` §3.1 and in
`docs/specs/gnosis-offload-review.md` §3 (the O-1 row). **The count in the interface block is 22 = 13
+ 9**, and the `16`/`6` split was never derivable from it: the interface declares **13** synchronous
reads (§3.1's list) and **9** async members. **A future pass must not re-derive this by copying either
figure: count the members in `src/main/rag-store.ts` `interface RagStore`.** The correction was
**discharged in the batch's editable documents by the 2026-09-21 item-10d documentation review**
(`archive/reviews/2026-09-21-design-extensions-doc-review.md`), which repointed
`docs/decisions.md`'s provenance clause, the gate record (§3.2 B.1 item 3, §11.5, §12.2, §14.1 C-5,
§16) and `docs/specs/unit-corpus-migration.md` §11.1. **Two carriers remain OWED** because they sit in
another pass's write scope — `docs/specs/astrographer-scope-realignment-review.md` §3.1 and
`docs/specs/gnosis-offload-review.md` §3 (the O-1 row) — and are recorded as owed in the review above
rather than left silent.

### 3.2 Which members a resident cache can serve (the exact list)

**Pinned:** the cache serves **exactly the 13 synchronous reads of §3.1, and no other member.** The
mapping is total over the read set:

| `RagStore` read | Served from | Scope |
| --- | --- | --- |
| `getNode(id)` | `documents` (or `docheads` for a doc-head node) | resident document only — a node id outside the resident subtree is a typed miss |
| `listNodes()` | `documents` | **the resident document's subtree, NOT the whole store** (this is the ruling's whole point) |
| `getEdge(id)` / `listEdges()` | `documents` | the resident document's edges (incl. its doc-flow edges) |
| `edgesFrom` / `edgesTo` | `documents` + the `crosslinks` entry | the resident document's edge set |
| `edgesByKind(kind)` | `documents` + `crosslinks` | resident scope, with `doc-child` edges scoped per `buildAdjacencyIndex`'s rule (a global `doc-child` edge is scoped to every known document key) |
| `edgesForDocument(documentId)` | `documents` | requires a resident `documents` entry for `documentId` |
| `docHeadForDocument(documentId)` | `docheads` | requires a resident `documents`/`docheads` entry |
| `status()` | live store status for the tab's store | never memoized across a mutation |
| `journal()` / `undoDepth()` / `redoDepth()` | live (not cached data) | the project journal is **not** cache content; the cache may memoize nothing here |

**Pinned:** the cache **never answers a mutation** (the 9 async members), and it **is not a
`RagStore`**. A type that satisfies `RagStore` by delegating reads to the cache and writes to the
engine is a **different proposal** (`docs/specs/gnosis-offload-review.md` §3's O-1 row: "No concrete
type satisfies `GN-1` today"; the `createEngineCrudRagStore` proxy is **not** a `RagStore` —
11 methods, `src/main/engine-crud-rag-store.ts` `interface EngineCrudRagStore`).

### 3.3 The cache-miss policy — a DEFINED TYPED FAILURE (never a silent empty result)

```ts
/** The typed cache-miss failure. Mirrors the existing typed-error discipline of
 *  src/main/engine-rag-store.ts (`EngineWireError` → `EngineUnavailable`/`Error` etc.):
 *  an `Error` subclass carrying a machine-readable discriminator, thrown — never returned as
 *  an empty value. */
export class CacheMiss extends Error {
  readonly code: 'cache_miss'
  readonly missed: { store: string; kind: CacheKind; id: string }
  constructor(missed: { store: string; kind: CacheKind; id: string }, message?: string)
}
export class CacheOverBound extends Error {
  readonly code: 'cache_over_bound'
  readonly bound: { maxEntries: number; maxBytes: number }
  readonly attempted: { store: string; kind: CacheKind; id: string }
  constructor(bound: CacheOverBound['bound'], attempted: CacheOverBound['attempted'], message?: string)
}
```

**Pinned rules.**

1. **A miss is thrown, not returned as `undefined`/`[]`/`0`.** A read whose key is not resident
   **throws `CacheMiss`** naming the full key. `FS1`. (Rationale: `undefined` is already a legal
   value for `getNode`, `getEdge` and `docHeadForDocument`, so a silent miss would be
   indistinguishable from "absent" — the exact ambiguity that lets an empty stage ship.)
2. **The message names the key and the resident set size** — e.g.
   `` `cache miss: ${store}/${kind}/${id} (resident: ${n})` `` — so a fail-state report is
   self-locating without a debugger.
3. **The class shape MIRRORS `EngineUnavailable`** (`src/main/engine-rag-store.ts`): an `Error`
   subclass with a `name`, a `code` discriminator and structured fields, constructed by the module
   that owns the failure. `CacheMiss` is a **cache-layer** error; it must never be conflated with
   `EngineUnavailable` (which is an **engine-layer** error, §6.2), and a caller distinguishes them by
   `instanceof`.
4. **Every read path that can miss is enumerated** (`FS6`/`FS13`): the traversal input build, the
   doc-nav build, the search-pane build, the crosslinks build, the doc-heads build, and the
   stage-render admission. A read path added later that can miss without a typed outcome is a
   review finding.
5. **The cache never returns another store's data** (`FS4`): a key whose `store` does not match the
   tab's bound store is a miss, not a fallback.
6. **Nothing in the read path is async.** No `await`, no promise, no microtask deferral may appear
   between a caller and a resident read — the `RagStore` reads stay synchronous
   (`docs/specs/gnosis-offload-review.md` §3's O-1 row; `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`).
   The async half lives **only** in the tab-open fetch (§4) and in the commit hop (§6.3).

### 3.4 The stale-resident rule

**Pinned:** a cached entry carries a `revision` slot. **The rule is conditional on a field that does
not exist today**, and this spec does not add it (§"What this unit does NOT do" item 2):

- **Today** `RagSnapshotPayload` (`src/shared/types.ts`) is `{ store, nodes, edges }` — **no
  `revision`** (verified; the `IPCRagSnapshot` handler in `src/main/main.ts` returns exactly those
  three fields). Its absence is recorded **OWED** (`SNAPSHOT-REVISION-AUTHORITY`;
  `docs/specs/gnosis-offload-review.md` §7 A-5; engine requests **GR-4**/**GR-5**).
- **Rule A (revision present):** when the payload carries a numeric `revision`, an entry loaded at
  revision `r` is **stale** if a later-observed revision `r' > r` exists for the same key. A stale
  entry **is not served**: it is marked non-resident and the read throws `CacheMiss` (`FS2`), and the
  owning tab enters its loading/warning state until a re-fetch lands (§4.3/§4.4).
- **Rule B (revision absent — the state of the tree today):** staleness cannot be *detected* by
  revision, so the **in-flight ordering token** is the only discriminator: two concurrent fetches for
  one key are resolved by a monotonically increasing **request generation** per key, and the older
  response is **dropped** (`FS3`). A dropped response must not overwrite a newer entry. **This is not
  a substitute for revision** and must be recorded as a partial guarantee: revision-based staleness is
  **OWED**, and a later pass may not claim it is implemented.

---

## 4. THE TAB-OPEN FETCH (async, and the only async read path)

### 4.1 Trigger and request/response shape

**Trigger (pinned):** a tab **becomes needful of data** on exactly two events —
(a) a tab is opened (`openTab`/`focusTarget` in `src/renderer/tab-state.ts`, or `focusTarget` when it
appends a new entry), and (b) a tab becomes **active** (`activeId` changes) **and its keys are not
resident**. A tab that is merely **open** but inactive is still **owned**, and its documents stay
resident (the ruling says *currently tab-owned*, not *currently active*).

**Pinned:** a tab whose `TabState` entry is restored at boot triggers the fetch **too** — the tab set
persists (`UI-CONFIG-CARRIER`) and the document data does not (§2.4), so boot is a fetch trigger.

**Request/response shape — VERIFIED, and it REUSES `RagSnapshotPayload`.**

| Aspect | Pin |
| --- | --- |
| **The payload type** | `RagSnapshotPayload` (`src/shared/types.ts`) — **reused verbatim**; `{ store, nodes, edges }` with `store` REQUIRED and `nodes[].children?` additive/optional. **This unit adds no field** (the `revision` field is OWED and parked: §3.4, §"does NOT do" item 2) |
| **The carrier** | the existing `IPC_RAG_SNAPSHOT` channel (`IPC_RAG_SNAPSHOT = 'provident:rag-snapshot'`), whose handler in `src/main/main.ts` today returns the whole store read through the O-0 recorder. **The unit MUST narrow this handler** to be **tab-scoped**: it takes the requested scope and returns only the resident keys' data. A whole-store return on a tab-open path is `FS9` |
| **Scope of one call** | **exactly the missing keys of the triggering tab** — one `documents` key (plus its `crosslinks`/`docheads`), or one `search` key. A fetch that loads the whole store is `FS9` |
| **Store binding** | the call carries the tab's `store` (`RagSnapshotPayload.store`); a response whose `store` differs from the requested store is **discarded** and is `FS10` |
| **Decode-then-validate** | the returned payload is validated at the boundary in the discipline of `src/main/engine-rag-store.ts` (`decodeEnvelope` → `decodeRagResult`): a malformed payload is a **typed** failure (§5.4), never a partial load |
| **Engine hop** | the fetch is served by the engine store when the engine is READY; the shell-side path that reads the local store remains the same synchronous read (§3.2). The engine READY gate's typed failure is `EngineUnavailable` (`src/main/engine-rag-store.ts`), already the shape to reuse |

### 4.2 The stale-drop rule (in-flight ordering)

**Pinned:** per key, the cache holds a **request generation** counter. A response is accepted only if
its generation is the current one; an older response is dropped **silently at the wire layer and
loudly in the report** — the drop is recorded (a counter + the dropped generation) so a test can
assert it (`FS3`). With `revision` present (§3.4 Rule A), the revision comparison is applied **in
addition**: a response whose revision is older than the resident entry's is dropped.

### 4.3 The loading state the stage renders

**Pinned (assembled layer — the renderer owns this):** the tab surface has a **4-state machine**, and
the state is a **provident-authored** part of the app graph (`AGENTS.md`'s project-wide UI constraint —
a UI element outside the graph is a review finding):

| State | When | The stage shows |
| --- | --- | --- |
| `idle` | the tab's keys are all resident | the document |
| `loading` | a fetch for the tab is in flight and none of its keys is resident | a **loading** state, authored in the graph, carrying a stable `data-*` marker (e.g. `data-tab-load-state="loading"`) and the tab id |
| `loaded` | the fetch landed and the keys are resident | the document |
| `warning` | the fetch failed (`CacheMiss` is impossible here; the failures are `EngineUnavailable`/decode/over-bound/engine-absent) | a **tab-level warning** (§5.4) |

**Pinned:** `loading` is **not** an empty stage. A `loading` stage that renders zero content without
the loading marker is `FS11`. A `warning` stage that renders zero content without the warning marker
is `FS11` too.

### 4.4 The failure UX — the `TAB-1` class, never a silent empty stage

**Pinned:** a failed tab-open fetch surfaces a **tab-level warning in the tab** — the `TAB-1` class
(`docs/feature-requests/design-extensions-2026-09-21.md` §2.8 item `TAB-1`: *"A document whose commit
failed shows a WARNING SYMBOL in its tab"*). This unit **extends that class to the load failure**,
and the extension is pinned so `TAB-1`'s owner (`U-TAB-MERGE`, `TAB-1`/`TAB-2`) does not re-invent a
second warning affordance:

1. the warning is **in the tab** (the strip), authored in the graph, with a stable marker and the tab
   id — the same affordance `TAB-1` names;
2. the stage renders its **warning state** with a **retry affordance** (an explicit user action);
3. **no automatic retry loop**: a failed fetch does not re-issue without a user action (`FS12`);
4. the warning **never** degrades to an empty stage on re-render, and a subsequent successful retry
   clears both the marker and the tab class.

---

## 5. EVICTION + LIFETIME (pinned)

### 5.1 The lifetime rules

| Event | Rule |
| --- | --- |
| **a tab closes** (`closeTab`, `src/renderer/tab-state.ts`) | every key **only that tab** owned is evicted **synchronously**, in the same turn as the state change. A key owned by **another open tab** stays resident and is **NOT** re-fetched when that tab is activated (`FS14`). An unknown-id close is a no-op and evicts nothing |
| **the active tab switches** | **nothing is evicted.** The cache holds all open tabs' documents. Switching to a tab whose keys are resident is **synchronous** and performs **zero** engine calls (`FS15`) |
| **a document changes on the engine** | the change notification arrives as the existing broadcast (`IPC_RAG_STORE_CHANGED`, `RagStoreChangedPayload`, `src/shared/types.ts`; store-qualified). **Pinned: invalidate-then-re-fetch, but NEVER over a dirty tab.** For an entry whose owning tab is **clean**, the key is marked **non-resident immediately** (so a read in the window between broadcast and re-fetch is a typed `CacheMiss`, never stale data) and a re-fetch is issued. For an entry whose owning tab is **dirty** (uncommitted or commit-failed), **invalidations are deferred** and the tab's merge decision belongs to `TAB-2`/`U-TAB-MERGE` (`FS16`). A foreign-store broadcast is dropped before the renderer subscription (`DECIDED: STORE-QUALIFIED-BROADCAST`) and must not invalidate this store's cache (`FS10`) |
| **a tab has uncommitted edits** (`ST-4` / `TAB-2` dirty states) | the tab is **dirty** (`clean` / `uncommitted` / `commit-failed` — the three-state machine owned by `U-TAB-MERGE`, `docs/specs/design-extensions-review.md` **§3.5 E — verification per unit class**, the `C10` row). **A dirty entry is PINNED**: it is never evicted by the memory bound, never invalidated by a foreign change, and never replaced by a fetch response. **Its rendered text is served from the live edit state**, so a read of a dirty document reflects the user's uncommitted text — it is not the store's value and must be labelled as uncommitted by the surface that uses it |
| **the store is torn down** (`teardown()`, `src/main/rag-store.ts`) | the cache is **emptied** (not merely invalidated): every key becomes non-resident and every read throws `CacheMiss`; a subsequent tab-open fetch may repopulate. The cache itself never throws from `teardown` (`FS17`) |
| **the app quits / the process ends** | nothing is written. See §2.4 (`FS8`) |

### 5.2 The bound (memory policy) and its failure mode

**Pinned constants (this unit's own, so the bound is testable and not a vibe):**

| Bound | Value | Why |
| --- | --- | --- |
| `MAX_RESIDENT_ENTRIES` | **64** entries | an open tab set of ~10 documents × ~6 entry kinds fits comfortably; 64 is the pinned figure for the red set to assert |
| `MAX_RESIDENT_BYTES` | **32 MiB** of estimated entry size | the corpus the O-0 track measures is 226 docs / 6 102 nodes / 9 266 edges; a per-document slice is far below this, so a breach means the cache is holding more than the tab set |

**Eviction policy (deterministic, in this order):**

1. **never** evict an entry whose owning tab is **dirty** (`FS18`);
2. **never** evict an entry whose owning tab is the **active** tab;
3. evict entries owned **only** by **inactive, clean** tabs, **least-recently-used** (an access
   counter is bumped on every served read, and by the tab's own render);
4. if steps 1–3 cannot free enough room, the fetch that would breach the bound fails with
   **`CacheOverBound`** (`FS19`) and the requesting tab enters its `warning` state — **never** a
   silent drop, never a partial entry, never a degraded (truncated) document.

**Pinned:** a partial/truncated entry is never stored: an entry is resident **whole** or **absent**
(`FS19`).

---

## 6. THE COMMIT PATH, THE ENGINE-ABSENT STATE, AND THE REVERSAL

### 6.1 The ruling reverses the scope-realignment exclusion (recorded explicitly)

`docs/specs/astrographer-scope-realignment-review.md` §3.3's WRITE PATH row excludes
`src/main/edit-ops.ts` / `doc-flow.ts` / `rich-decompose.ts` / `paste-sanitize.ts` **by name**, with
the reason recorded verbatim: *"commit-on-blur editing cannot be async-chunked behind an engine hop"*.
`docs/specs/design-extensions-review.md` **§3.6 F.3 item 3** records
that exclusion as the concrete hazard of a two-regime landing; **the 2026-09-21 ruling makes the engine
write hop mandatory** (`§11.1`; restated at **§12.7(a)** as the recorded reversal), so **that exclusion
is REVERSED for the write path, and the reversal is recorded here** (a spec is where a reversal becomes
implementable; `docs/decisions.md`'s `SUPERSEDED` row is
owed by the successor unit, below).

**The unit that must restate the commit contract: `WHOLE-PAGE-EDITING`.** Its carrier is **`U-EDIT-1`**
(`ST-1` non-live-markdown half, `ST-3`, **`ST-4`**, `ST-5`, `ST-6` —
`docs/specs/design-extensions-review.md` **§3.3 C — the unit decomposition**, item `C9`;
`docs/decisions.md` `WHOLE-PAGE-EDITING`). `ST-4` must name the in-house module `src/main/rich-decompose.ts`
`decomposeRichHtml` (the same section's C9 condition). **`U-EDIT-1` owes:** the whole-document /
per-text-node **diff granularity**, the **one `applyBatch` = one invertible `batch` journal entry**
rule (`DECIDED: PROJECT-JOURNAL` / `C16-CONSUMES-PROJECT-JOURNAL`), the failed-commit rollback, and
the `SUPERSEDED` rows against `EDITING-MODE-SETTING` / `FORM-CONTROL-EDITING` **at its own landing**.
**This unit pins only the read-side envelope of that contract** (§6.3) so the two do not run over two
regimes (the hazard the design-extensions record names by id).

### 6.2 The engine-absent behaviour (pinned — INSIDE the `GN-4` refusal boundary)

**The binding ruling, stated exactly.** `GN-4` is **a reversal, already landed as an ACTIVE row**:
`DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` (2026-09-21, `docs/decisions.md`) — *with no engine
found the app starts, warns that **no wiki can be opened**, and **opens no wiki***; it supersedes the
*"every local path must work IDENTICALLY"* clause of `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` while
that row's **"engine-absent reads are never silent"** clause **survives and is not reversed**
(`docs/specs/design-extensions-review.md` **§11.3**, whose "what it does NOT decide" item 1 leaves the
**boot-wide vs per-wiki** framing to `U-AUTHORITY-SWITCH`, and **§12.5** item 3, which retains the
**typed** surfacing obligation). **This spec does not re-rule the framing and does not claim it**: the
**boot-wide** decision is `U-AUTHORITY-SWITCH`'s (**§11.3** item 1; see that spec's §8.2 and its §15
cross-reference row, "the boot-wide framing is this spec's"), and
what this unit pins is the **cache/read behaviour under WHICHEVER framing lands**. So:

1. **a DOCUMENT tab is never served a fabricated document with no engine** — under the **per-wiki /
   tab-open** framing its tab-open is **REFUSED**; under a **boot-wide** framing the refusal has already
   happened before any tab exists. Either way the cache contributes **no** document surface: **no
   document is fabricated, no empty stage is rendered in its place**, and the refusal is a **defined,
   typed outcome** (`FS22`, carrying the tab-level warning marker — `TAB-1`'s class, §4.4) rather than a
   silent degrade. **A document surface produced without an engine is the fail-state, whichever
   boundary the refusal lands on**;
2. the refusal's typed vocabulary is the **existing** one — `EngineUnavailable`
   (`src/main/engine-rag-store.ts`), whose `cause` discriminates `connection-refused` /
   `engine-not-spawned` / `not-ready` / `unavailable-state` (all four verified in the class);
3. **the tab strip, `TabState` and the operator surfaces are unaffected** — the app **starts** and does
   not exit (`§11.3`: the app warns and opens no wiki; the operator/settings surfaces are not
   documents, `§11.3` "what it does NOT decide" item 2). A **restored** tab set therefore shows its
   tabs with each document tab in the **warning** state until an engine is found;
4. **a landing-only tab set** (the `other`/`TAB_LANDING` target) owns no document, so nothing is
   refused: it renders its landing/wikis listing with the doc-nav in its **unavailable** state — it
   does **not** invent a document to load;
5. **every read of a non-resident key throws `CacheMiss`** — the cache-miss policy is unchanged by
   engine absence, and the pane surfaces render their **unavailable** state **distinctly** from their
   **empty** state (`P-IM-4`'s shape: "empty" and "unavailable" are different states and both are
   renderable, deadlock-free and TypeError-free);
6. **no silent fallback** to a whole-store read, to an empty stage, or to an empty list (`FS1`,
   `FS13`). The engine-absent path is **never** quieter than the engine-present path (`§11.3`'s
   surviving clause).

**Pinned:** the launcher's "always check whether an engine is running and launch one if not" (`GN-3`)
is a **launcher** action (`scripts/start-app.sh --mode=gnosis`; `DECIDED: GNOSIS-LAUNCHER-TOGGLE`),
never a `src/` capability: `src/` has no process-spawn capability and must not gain one here.

### 6.3 The commit sequence the cache must support (the read-side envelope)

**Pinned: NO optimistic local apply. No partial write. The engine is the ack.**

| Step | What happens |
| --- | --- |
| 1 | the stage holds the user's text as the tab's **uncommitted** state; the **cache is NOT modified** — an optimistic cache write would create a second writer over engine-owned document data (`DECIDED: SINGLE-WRITER-STORE`'s spirit) and would make a failed commit indistinguishable from a successful one |
| 2 | the edit is decomposed (the `U-EDIT-1` contract) and committed as an **async engine call** — one `updateDocument`-class call on the engine CRUD surface (`src/main/engine-crud-rag-store.ts` `EngineCrudRagStore.updateDocument`, wire method `updateDocument`, endpoint `POST /documents/:id/update`), carrying `baseRevision` — i.e. **the commit hop now exists** (the reversal, §6.1) |
| 3 | the tab moves `uncommitted → committing` (a state the successor unit's three-state machine carries; for this unit it is observable as "a commit is in flight") |
| 4 | **success:** the returned `Document` (with its new `revision`, `src/main/engine-crud-rag-store.ts` `interface Document`) **replaces the cache entry**, the tab becomes `clean`, the warning marker (if any) clears, and the rendered text now equals the committed text |
| 5 | **failure:** the cache entry is **exactly what it was before step 2** — byte-identical (`P-SM-1`), **no partial write**, no revision bump — the tab becomes `commit-failed`, and the **tab-level warning** appears (`TAB-1`'s class). The user's text is **not discarded** |
| 6 | **a commit is never auto-retried**; a retry is an explicit user action. A retry re-issues the whole commit (idempotency is the successor unit's concern; the `retry` option on `EngineCrudRagStoreOptions` is opt-in and off by default) |

**Pinned:** the commit path must **not** be chunked behind the engine hop in a way that loses the
user's text between chunks — the whole commit is one call whose failure leaves the pre-commit state
intact (step 5). This is the **only** commit-shape clause this unit pins; the diff granularity,
rollback mechanics and journal entry belong to `U-EDIT-1` (§6.1).

---

## 7. §5.x TYPED PROPERTY REGISTER (8 rows; P-IM / P-SM / P-TP)

**Shared machinery (pinned once, binding on every row).**

- **Seed:** deterministic, pinned `0x7ABCACE1` (a fixed literal in the harness; never `Date.now()`,
  never a random default, never an environment read).
- **Budget:** **≤100 attempts per row, ≤400 attempts total**, allocated as **44 × 7 + 92 = 400**
  (row `P-SM-1` carries the 92, because the commit-safety domain has the widest case space).
  **Stop-after-5:** each row reports at most **5 distinct held-or-broken cases**; a `broken` row
  reports the counterexample, the shrink, and the failing generator class.
- **Reporting:** each row lands `held` or `broken` with its attempt count; the audit is **read-only**
  and performed by an agent that did not author the rows (RCA-3 / item 10 `d`).
- **Class meaning (this unit's usage):** `P-IM` = an invariant of the module's own data model;
  `P-SM` = a safety property over a state transition; `P-TP` = a totality/determinism property.
- **The generator must never be weakened to make a row pass**, and each row's negative generator is
  named inside the row (`docs/specs/unit-a1-crud-routing-proxy.md`'s P-IM-4 precedent).

| # | Class | Invariant | Strategy | Oracle (what a draw asserts) |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | IM | **No non-resident read is served.** For ANY query over any `(store, kind, id)` domain, a read resolves to a value **deep-equal to the loaded payload** or throws `CacheMiss` — **never** `undefined`/`[]`/`0`/a partial entry. | `strat:no-nonresident-read` — generate a resident key set, then a query mix over `resident ∪ non-resident ∪ cross-store ∪ malformed (empty id, `__proto__`, unknown kind)` keys | every resident query returns the loaded value; every non-resident query throws `CacheMiss` naming the full key; **no draw returns a falsy/empty value for a non-resident key**; the negative generator is the "empty `[]` return" case, which must FAIL the row |
| **`P-IM-2`** | IM | **The cache returns copies.** Mutating a returned node/edge array or object never changes the cache's stored entry (a second read is unchanged). | `strat:returned-value-aliasing` — draw a resident entry, read it, mutate every returned array/object field in place, read again | the second read deep-equals the first; no returned value aliases internal state (mirroring the store's own `deepCopy`-on-read discipline, `src/main/adjacency.ts`) |
| **`P-IM-3`** | IM | **The key is store-scoped.** Two identical ids under different stores never collide; a cross-store read never returns the other store's entry. | `strat:key-store-scoping` — draw two stores whose document ids are identical, load both, read each, then attempt a cross-store read | each read returns its own store's payload; the cross-store read is a `CacheMiss` (never a fallback); a bare-id key (no store) is rejected as malformed |
| **`P-SM-1`** | SM | **A failed commit never mutates the cache.** For any pre-commit entry and any failing engine response (5xx / `EngineUnavailable` / `ConflictError` / malformed), the post-failure entry is **deep-equal** to the pre-commit entry, no revision is bumped, no partial write exists, and the tab is `commit-failed` with its text preserved. | `strat:commit-failure-atomicity` — draw a resident entry + a generated failing response over the whole `EngineErrorCode` set (`src/main/engine-rag-store.ts`) and the transport-failure causes | for every draw: entry deep-equal before/after; `revision` unchanged; the rendered/held text still present; the tab state is the failure state; the success path (an ack) is the discriminating control and MUST change the entry |
| **`P-SM-2`** | SM | **Dirty-edit preservation.** Across ANY eviction pressure, tab-close event and foreign change notification driven by the draw, an entry owned by a dirty tab is **never** evicted, never invalidated, and never replaced; and an entry owned by an inactive clean tab may be evicted without affecting any dirty entry. | `strat:dirty-entry-pinned` — draw a tab set with clean/dirty/commit-failed tabs, an eviction pressure past `MAX_RESIDENT_ENTRIES`, a close of each tab, and a foreign-store + same-store change broadcast | after every draw: every dirty tab's key is still resident with an unchanged entry; the close of a dirty tab's own tab is the ONE legal removal (and it preserves the edit state on the tab, §5.1); a foreign-store broadcast invalidated nothing; a same-store broadcast invalidated only clean entries |
| **`P-SM-3`** | SM | **No optimistic apply / no silent success.** The cache entry is unchanged between commit-start and commit-ack, and no path marks a tab clean without an engine ack. | `strat:no-optimistic-apply` — draw a commit, then observe the cache **mid-flight** (before the promise settles) and after each of the success/failure outcomes | mid-flight: entry deep-equals pre-commit; failure: tab is not clean and the marker is set; success: entry equals the decoded `Document` and the tab is clean; no draw yields "clean with an unchanged entry" (which would be an uncommitted write reported as committed) |
| **`P-TP-1`** | TP | **The engine-absent surface is typed and total.** For ANY read or fetch attempted with no engine, the outcome is a typed failure (`CacheMiss` for a read, `EngineUnavailable` for a fetch) — never a resolved empty value, never a hang, never a native `TypeError`, and the tab/loading state is observable. | `strat:engine-absent-total` — draw the query mix of `P-IM-1` plus a fetch, with the engine store injected as absent (`connection-refused`/`engine-not-spawned`/`not-ready`/`unavailable-state`) | every read throws `CacheMiss`; every fetch rejects with `EngineUnavailable` carrying one of the four pinned causes; the load state is `warning` (not `loading`, not `idle`); the "resolved `[]`" case must FAIL the row |
| **`P-TP-2`** | TP | **Fetch idempotence + generation monotonicity.** Loading a key twice with the same payload leaves the cache deep-equal after the second load (idempotent), and a response from an older generation is dropped (never overwrites a newer entry). | `strat:fetch-idempotent-monotone` — draw a key, load it, load it again with an equal payload; then draw out-of-order response pairs (newer-then-older) | the double load leaves the same entry (and only the first load is observable as a state change); the older-generation response never overwrites the newer entry and increments the recorded drop counter |

**Class tally:** IM ×3 (`P-IM-1`..3), SM ×3 (`P-SM-1`..3), TP ×2 (`P-TP-1`..2) = **8 rows ≤ 8** ✔.
**Budget tally:** 44 × 7 + 92 = **400 attempts total**, every row ≤ 100 ✔, stop-after-5 ✔.

---

## 8. FAIL-STATES (FS ids) AND THE UNIT'S PROCESS

### 8.1 Fail-states (each is loud: it names the key/the id/the rule it violates)

| # | Fail-state | Observable + exact rule violated |
| --- | --- | --- |
| **`FS1`** | **A non-resident read served as an empty/`undefined` value** (the silent-empty defect) | the key and the returned value are printed with "silent miss"; a non-resident read must **throw `CacheMiss`** (**§3.3 rule 1**) |
| **`FS2`** | **A stale entry served** after a later revision was observed | the key, the resident revision and the observed revision are printed; **§3.4 Rule A** (a stale entry is marked non-resident and the read throws) |
| **`FS3`** | **A stale response accepted** (an older fetch generation overwrote a newer entry) | both generations, the key, and the recorded drop counter are printed; **§4.2** |
| **`FS4`** | **An unscoped/cross-store key** (a bare document id as a key, or a read returning another store's entry) | the key and the store are printed; **§2.2 / §3.3 rule 5** |
| **`FS5`** | **A `graph` (or otherwise non-document) tab made a document resident without naming it** | the tab id and the unexpected resident key are printed; **§2.3's `graph` row** |
| **`FS6`** | **A read path can miss without a typed outcome** (a path not enumerated in §3.3 rule 4, or a call that reaches a non-resident key without `CacheMiss`) | the call site and the key are printed; **§3.3 rule 4 / §2.3's enforcement table** |
| **`FS7`** | **A restart rendered a document with no fetch** (residency claimed from persisted state) | the document id and the boot path are printed; **§2.4** (document data does not persist) |
| **`FS8`** | **The cache was serialized to disk** (a new store file, an `OperatorSettings` slice, or any write-back) | the artifact path is printed; **§2.4** (in-memory only; the cache is not a durable store) |
| **`FS9`** | **A whole-store fetch/read on a tab-open path** (a snapshot that loads more than the triggering tab's missing keys) | the returned node/edge counts and the tab are printed; **§4.1's "Scope of one call"** |
| **`FS10`** | **A foreign-store payload accepted** (a response/broadcast whose `store` differs from the requested/tab-bound store) | both store names are printed; **§4.1's store binding / §5.1's foreign-broadcast rule** |
| **`FS11`** | **A silent empty stage** — a `loading`/`warning` state with no marker, or zero content with neither | the tab id, the state and the missing marker are printed; **§4.3 / §4.4** |
| **`FS12`** | **A failed fetch auto-retried** (a retry loop with no user action) | the tab id and the retry count are printed; **§4.4 rule 3** |
| **`FS13`** | **A pane read rendered an empty list where the state is unavailable** (the empty/unavailable conflation) | the pane, the key and the rendered state are printed; **§2.3's pane path / §6.2 item 4** |
| **`FS14`** | **A shared key evicted or re-fetched on a tab close** (a key still owned by another open tab) | the key and the two tab ids are printed; **§5.1's tab-close rule** |
| **`FS15`** | **An engine call on a tab switch to a resident tab** | the tab id and the fetch count are printed; **§5.1's switch rule** |
| **`FS16`** | **A dirty entry invalidated or replaced by a change broadcast / a fetch response** | the key, the tab's dirty state and the offending event are printed; **§5.1's change + dirty rules** |
| **`FS17`** | **The cache throws from `teardown`** (or survives teardown with keys resident) | the key(s) still resident (or the thrown error) are printed; **§5.1's teardown rule** (emptied, never throws) |
| **`FS18`** | **An eviction removed a dirty entry or the active tab's entry** | the key and the tab state are printed; **§5.2 steps 1–2** |
| **`FS19`** | **A partial/truncated entry stored, or an over-bound breach silently ignored** | the key, the bound and the attempted size are printed; **§5.2** (an entry is whole or absent; a breach is `CacheOverBound`) |
| **`FS20`** | **A commit path applied a local/optimistic write** (a mutation before the engine ack, or a disk write) | the key, the mutated field and the phase are printed; **§6.3 steps 1/5** |
| **`FS21`** | **A `CacheMiss` conflated with `EngineUnavailable`** (the engine-layer error surfaced as a cache miss or the reverse) | both classes and the call site are printed; **§3.3 rule 3 / §6.2 item 5** |
| **`FS22`** | **A document tab opened with no engine found** (the `GN-4` refusal bypassed — a document surface fabricated, the refusal untyped, or a silent empty stage in its place) | the tab id, the engine state and the rendered outcome are printed; **§6.2 item 1 / `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` / `docs/specs/design-extensions-review.md` §11.3** |

### 8.2 The unit's process (binding; RCA-1/RCA-2/RCA-3/RCA-6/RCA-11/RCA-12)

1. **This spec** (`U-READS-PIVOT`) — the contract. **No code before a TestWriter red set.** ✔ (this file)
2. **TestWriter RED, RUN and REPORTED** (`AGENTS.md` item 3 / RCA-1). The red set is derived from
   §2–§7 of this file: cache module totality + the 13-read mapping + `CacheMiss`/`CacheOverBound` +
   residency predicate + eviction/bound + fetch ordering + the engine-absent surface + the commit
   envelope + **this file's 22 fail-states as named assertions** (`FS1`…`FS22`) + the §7 register
   rows. The report is recorded verbatim in the unit's DONE row ("TestWriter red: N failing
   (method does not exist)" shape). **The red set must include the fence suites (§8.3) as green
   controls** — writing them into the red set as failures is `FS`-adjacent and is a review finding.
3. **Implementer GREEN** — the least code that makes the recorded red set pass, **on its own cycle**
   (RCA-2: this unit's cycle never shares an inline run with `U-EDIT-1`/`U-TAB-MERGE`/`O-1`/`O-2`.
   It is `PREREQUISITE`, not bundled).
4. **The trio** (`AGENTS.md` item 4): `npm test`, `npm run typecheck`, `npm run build` — reported as
   this unit's green, with the re-derived suite list named.
5. **READ-ONLY adversarial pass** (RCA-3), hunting at minimum: a silent miss; a stale entry; a
   cross-store leak; an unfetched read reaching a renderer; a dirty-entry eviction; a whole-store
   fetch; an engine-absent surface that is quieter than the present one; and the register's negative
   generators. Its findings are recorded in **this file's §8.1 table** (the checkset) and every
   host-side finding is fixed here + regression-tested. **Its PBT-audit half reports each §7 row
   `held`/`broken` with its attempt count (stop-after-5).**
6. **RCA-4 blind greens** by an agent that did not implement: a `-greens.md` artifact derived from
   **this spec only** (no implementation read), run against the modules.
7. **item-10d documentation review** (RCA-6), recorded at
   **`archive/reviews/<date>-unit-reads-pivot-doc-review.md`**: it reconciles every symbol,
   signature, return shape, throw pattern and census claim here against the actual build (notably the
   **§3.1 member census** and the `CacheMiss`/`CacheOverBound` shapes), reconciles the active trackers,
   reconciles cross-references and section numbers (including the two citations into
   `docs/specs/design-extensions-review.md`, which are now carried as **real section references
   (§11 / §12), with their titles retained** as the readable address), and **fixes stale entries in the
   same pass**. The §3.1
   `16`-vs-`13` correction **is DISCHARGED by the 2026-09-21 item-10d documentation review** in the
   batch's own editable documents (`docs/decisions.md` `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`,
   `docs/specs/design-extensions-review.md` §3.2 B.1 item 3 / §11.5 / §12.2 / §14.1 C-5 / §16,
   `docs/specs/unit-corpus-migration.md` §11.1); the same figure in
   `docs/specs/astrographer-scope-realignment-review.md` §3.1 and
   `docs/specs/gnosis-offload-review.md` §3 (O-1 row) sits in another pass's write scope and is
   **recorded as owed there, never left silent** (`archive/reviews/2026-09-21-design-extensions-doc-review.md`).
8. **The DONE row** states the unit, the date, **the layer** (RCA-12) and the recorded red set.

### 8.3 The live battery mandate — decided explicitly (RCA-11 / RCA-12)

**This unit CHANGES RENDERED BEHAVIOUR** (a tab now has a `loading` state, a tab-level warning
marker, and a per-tab fetch on open), so **the live battery is MANDATORY — not parked, not
recommended.** Per RCA-11, parking is legal only for a structurally non-exercisable surface **with the
recorded park reason**; there is no such surface here: the renderer surface and the tab strip are
reachable through `scripts/live-drive.mjs`'s MCP + CDP path.

**What the live battery asserts (in `scripts/live-drive.mjs`'s existing block discipline; a new block
is an oracle-identity change — `docs/specs/requirement-catalog.md` §2.2 fact 3 — and must be recorded
as such with its own live re-run, never as an incidental edit):**

1. **Boot with NO engine:** the app **starts** and refuses to open a wiki (`DECIDED:
   ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`); a tab set restored from the persisted carrier shows its
   tabs with each **document** tab rendering the **warning** marker and the stage rendering its
   **warning** state (**not** an empty stage, **not** a spinner forever, **not** a fabricated
   document); a doc-nav/pane shows its **unavailable** state, distinct from **empty**; and **zero**
   document reads succeeded silently. *(This is the discriminator the node suite cannot see — RCA-12.)*
   The **boot-wide vs per-wiki** boundary itself is `U-AUTHORITY-SWITCH`'s to assert; this block
   asserts the **cache/render** half (no fabricated document surface, `FS22`).
2. **Boot with the engine READY** (launcher-spawned): opening a document tab performs **one**
   scoped fetch; the stage renders the document; a second activation of the same tab performs **zero**
   additional fetches (the count is read from the instrumented fetch counter, not inferred from
   timing).
3. **The tab-close residency census:** open two tabs over one document; close one; the remaining tab
   renders **without** a fetch and with **no** warning marker (the shared-key rule, `FS14`).
4. **The dirty-edit preservation check:** with an uncommitted edit in an inactive tab, a new tab open
   past the entry bound evicts **clean** entries only; the dirty tab re-activates **without a fetch**
   and its text is intact.
5. **The warning-not-silent check:** force a fetch failure (the harness's typed failure injection);
   the tab shows the warning marker and the stage shows the retry affordance; **no auto-retry** is
   observed over a recorded window.
6. **The MCP-parity census** (`provident.list_targets` / `get_rendered_html` / `get_markdown`) for
   the opened document is **unchanged** against the pre-change baseline (§2.3's last row).
7. **The painted-state check for every visible claim:** the loading/warning markers are asserted as
   **painted** geometry/DOM presence, never computed-style-only (`proxyPASS:true` is invalid —
   `DECIDED: D-GP-UFA-2`), and the §5.U matrix stays U-1..U-8 (`docs/specs/gnosis-offload-review.md`
   §7 A-6: **re-pin an existing row or enter as an extended row — a unit cannot claim a slot**).

### 8.4 Blast radius — the RED-SET PLAN (what must stay green, and what may not be re-derived)

**The fence (EXEMPT BY NAME — the unit may NOT re-derive it).**
`tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` **must stay green unchanged**.
The exemption is recorded in `docs/specs/design-extensions-review.md` **§3.1 A — gate scope: five
classes, five artifacts** / **§3.6 F — the architecture's verdict, its conditions, and what it must
NOT do** (the test-fence ruling: the fence "must stay green unchanged" and "may not be re-derived by
any `GN-*` unit"), and in
`docs/specs/gnosis-offload-review.md` §3 (the O-1 and O-2 rows). **A unit that cannot stay green under
the fence is not an implementation of this ruling but a new proposal re-entering the proposal gate
(`AGENTS.md` item 8).**

**The blast-radius census (a READING, with the method recorded — recount, never copy).** The count is
of **test files under `tests/**` that import a touched module** (`src/main/rag-store.ts`,
`rag-store-registry.ts`, `rag-store-registry-write.ts`, `traversal.ts`, `retrieval.ts`,
`adjacency.ts`), scanned by import statement, `await import(...)`, `vi.mock(...)` and
`createSnapshotStore` usage:

| Family | Files (this reading) | Why it is in the blast radius |
| --- | --- | --- |
| **store family** (`rag-store.ts` + the two registry modules) | **≈74** | the member census (§3.1) is quoted across the corpus; the cache must not change any member |
| **traversal family** (`traversal.ts`) | **23** | `buildTraversal` is the seam the residency guarantee is stated against (§2.3) |
| **retrieval family** (`retrieval.ts`) | **≈30** | the search cache entry (`search` kind) wraps its results; the read surface must not perturb it |
| **adjacency family** (`adjacency.ts`, `createSnapshotStore`) | **≈20** | the read-only adapter is how the store is faked in the renderer-facing suites; a cache that changes its shape breaks the seam |
| **registry family** (`rag-store-registry*.ts`) | **≈8** | the `store` key dimension (§2.2) is registry-sourced |
| **the fence** | **2** *(exempt by name)* | `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` |

**Where the fence's replacement guarantee lives (pinned).** The fence is not replaced: it is the
**standing regression fence for the data layer's rendered output**. This unit's own guarantee lives in
**new** suites —
`tests/unit-reads-pivot-tab-cache.test.ts` (the cache model, §2/§3), its `-adversarial.test.ts`
(§8.1's `FS` ids), and its `-pbt-generators.test.ts` (§7's register) — and in the **live blocks**
(§8.3). **Pinned rule:** if the fence cannot stay green under this unit's diff, the unit stops and
re-enters the proposal gate; the fence is **never** re-derived, never edited, and never cited as this
unit's green.

**Pinned red-set obligations (RCA-1's recorded set must contain all four).**

1. the cache module's totality + the `CacheMiss`/`CacheOverBound` surface (**red**: the module does not
   exist / the error classes do not exist);
2. the **13-read mapping** (§3.2) asserted against the real `RagStore` member set, with the
   non-resident direction (**red**: today every read answers from the whole-store map);
3. the residency predicate + eviction/bound + fetch ordering (**red**: no resident-key concept exists);
4. the **engine-absent typed surface** (**red**: today a read with no engine still answers locally
   and silently — the `FS13` class).

**What this unit may NOT re-derive (named).** The fence suites; `docs/specs/mcp-endpoint.md`; the
4 746-suite's data-layer cross-section as a *whole* (only the four obligations above are re-derived);
the `§5.U` matrix (`MATRIX_ROWS` must not change); `scripts/live-drive.mjs`'s `BLOCKS`/`MATRIX_ROWS`
literals except for this unit's own new live block, recorded as an **oracle-identity change** with its
own re-run (`docs/specs/gnosis-offload-review.md` §6, `docs/specs/requirement-catalog.md` §2.2 fact 3).

### 8.5 Cross-references and the census claims of THIS file (so item 10d can recount them)

| Claim in this file | Kind | Recount method |
| --- | --- | --- |
| `RagStore` = 22 members / 13 sync reads / 9 async | **DERIVED (this pass's reading)** | count the member declarations in `src/main/rag-store.ts` `interface RagStore` |
| the 13-read list of §3.2 | **DERIVED** | the same block |
| the fence = 2 files, exempt by name | **PINNED (quoted)** | `docs/specs/design-extensions-review.md` §3.1 A (gate scope) / §3.6 F (the verdict + the must-NOT list) |
| the blast-radius family figures | **DERIVED reading** | re-run the import scan over `tests/**` (the method is stated in §8.4); the figures are **approximations and must be recounted, never copied** |
| `MAX_RESIDENT_ENTRIES = 64` / `MAX_RESIDENT_BYTES = 32 MiB` | **PINNED (this unit's choice)** | this file; a change is an amendment to this spec, never a silent constant |
| the register = 8 rows / 44 × 7 + 92 = 400 | **DERIVED** | count §7's row table and sum the budget |
| `RagSnapshotPayload` has no `revision` | **DERIVED (verified)** | `src/shared/types.ts` `interface RagSnapshotPayload` + the `IPC_RAG_SNAPSHOT` handler in `src/main/main.ts` |

---

## 9. LAYER + HONESTY (which verification covers which layer)

| Layer | What is verified there | What is NOT | How |
| --- | --- | --- | --- |
| **PURE / ENVELOPE (node, `npm test`)** | the cache model, the key/kind union, the 13-read mapping, `CacheMiss`/`CacheOverBound` shapes and messages, the residency predicate, eviction/bound/ordering, the commit **envelope** (no optimistic apply, failure leaves the entry deep-equal), the engine-absent **typed** surface, and all 8 §7 register rows | anything rendered; anything engine-hop-dependent; any timing | `tests/unit-reads-pivot-tab-cache.test.ts` + `-adversarial` + `-pbt-generators` |
| **ASSEMBLED / RENDERER** | the tab state machine's rendered markers (`loading`/`loaded`/`warning`), the tab-level warning, the pane unavailable-vs-empty distinction, and the graph authorship of those elements | the actual paint (the dom-shim is layout-less/CSS-less — RCA-12) | the new node assembly tests for the envelope shape **plus** the live battery (§8.3 items 1/5/7) |
| **ENGINE-DEPENDENT** | the tab-open hop: one scoped call, the READY gate's typed failure, the store binding, the commit hop's ack path | the engine's own correctness (that is the Gnosis repo's; no patch here — `AGENTS.md` item 7) | the live battery (§8.3 item 2) + injected-failure node tests for the typed outcomes |
| **APP-GREEN** | **nothing in this spec.** | — | RCA-12: a node-suite green is **ENVELOPE-green, not APP-GREEN**. **No part of this unit is app-green until the live path is exercised** (§8.3) **and** the item-10d review has run. |

**Honesty bounds recorded here so a later pass cannot over-claim:**

1. **This spec adds no `revision` and therefore does not deliver revision-based staleness.** §3.4's
   Rule A is conditional on a field the tree does not have; Rule B (the generation token) is a
   partial guarantee. `SNAPSHOT-REVISION-AUTHORITY` stays **OWED**.
2. **This spec does not deliver engine-owned document CRUD** — no member of `RagStore` changes, the
   `GN-1` destination stays a stated destination (`docs/specs/design-extensions-review.md` **§3.2 B —
   the precedence architecture for `GN-1`…`GN-4`**, read as the SUPERSEDED-BY-RULING alternative; the
   binding form is `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`), and the `16`/`13` correction is a
   **doc-layer** finding, not a code change.
3. **This spec does not restate the commit contract** — it pins the read-side envelope only (§6.3) and
   names `WHOLE-PAGE-EDITING` (`U-EDIT-1`, §3.3 C9 / §12.7(a)) as the owner.
4. **No live run was performed by this spec's author.** Every live figure in §8.3 is an **owed
   assertion**, not a measurement; the oracle hashes before/after and the §5.U re-pin are owed to a
   shell-bearing pass.
5. **Both citations into `docs/specs/design-extensions-review.md` are now REAL section references —
   §11 (USER RULINGS) and §12 (THE READ MODEL) — with their titles retained**; they were authored
   BY TITLE while that file was being amended concurrently, and the 2026-09-21 item-10d review
   resolved them against the file as it now stands (both titles exist at those headings, §8.2 item 7).

---

## 10. Report to the supervisor (what this spec's landing pass must be able to say)

1. **Written:** `docs/specs/unit-reads-pivot-tab-cache.md` (this file) — the `U-READS-PIVOT` contract.
2. **The sync-read count is 13** (22 members = 13 sync + 9 async), a **correction** of the `16`/`6`
   figures carried by `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`,
   `docs/specs/astrographer-scope-realignment-review.md` §3.1 and
   `docs/specs/gnosis-offload-review.md` §3; the correction's **editable** repoints are discharged by
   the 2026-09-21 item-10d review (§8.2 item 7) and the **two carriers outside this pass's write
   scope** remain owed there.
3. **The miss/failure shape is typed:** `CacheMiss` (`code:'cache_miss'`, the full key) and
   `CacheOverBound` (`code:'cache_over_bound'`, the bound + the attempted key) — `Error` subclasses
   mirroring `EngineUnavailable` (`src/main/engine-rag-store.ts`); a silent empty result is `FS1`.
4. **The register is 8 rows** (P-IM-1..3, P-SM-1..3, P-TP-1..2), seed `0x7ABCACE1`, budget
   `44 × 7 + 92 = 400`, stop-after-5, `held`/`broken` per row.
5. **The fence statement:** `tests/import-render-no-duplicates.test.ts` +
   `tests/traversal.test.ts` **stay green unchanged and may not be re-derived**; if this unit cannot
   stay green under them it re-enters the proposal gate.
6. **Decisions this spec had to pin** (each recorded with its rationale, so no later pass re-derives
   it): the `CacheKind` closed set + the `(store, kind, id)` key; the `TabTarget`-kind ownership
   predicate (incl. `graph` naming its documents, and landing owning nothing); in-memory-only with
   **tabs persist / document data does not**; the 13-member read mapping; the typed-miss + over-bound
   classes; the residency seam (`buildTraversal`'s input + `residentKeys`); reuse of
   `RagSnapshotPayload` **verbatim** with the tab-snapshot handler narrowed; the conditional
   stale-drop (Rule A/B) with `revision` left OWED; the 4-state tab machine + the `TAB-1`-class
   warning with no auto-retry; invalidate-then-re-fetch **never over a dirty tab**; the bound
   (64 entries / 32 MiB) with a pinned eviction order; **no optimistic apply** on commit + the named
   successor `U-EDIT-1` (`WHOLE-PAGE-EDITING`, `ST-4`); the engine-absent cache surface inside the
   landed `GN-4` refusal (`DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` — the **boot-wide vs
   per-wiki** framing is `U-AUTHORITY-SWITCH`'s, and this spec pins only that **no document surface is
   fabricated**: §6.2 item 1 / `FS22`);
   **the live battery is MANDATORY** (RCA-11) with the §8.3 assertion list; and the layer split
   (pure vs assembled vs engine-dependent) with **nothing app-green** in this spec.

