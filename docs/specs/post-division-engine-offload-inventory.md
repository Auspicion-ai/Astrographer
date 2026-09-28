# POST-DIVISION ENGINE-OFFLOAD INVENTORY — what the expanded Gnosis engine now owns, what the fork-side graphing work it replaces, and which tests pin it

**Date:** 2026-09-22 · **Pass kind:** READ-ONLY INVENTORY (**one** write: this file) · **Branch:**
`post-division-rebuild` at `b6791e0` · **Layer (RCA-12, mandatory): DOC-LAYER / inventory record — NOT
app-green, NOT envelope-green, NOT store-green, NOT engine-green, NOT live-green.** Every engine claim below
is either a **quoted tracker reading** (the Gnosis file is named) or a **read-from-source claim** (the Rust or
TypeScript file is named); **no `cargo` command and no `npm test` was run by this pass**, so nothing here is a
measurement of my own. A Rust `cargo test` green is **engine-green** and is *never* app-green.

**The three trees read (read-only, no writes anywhere else):**

| Tree | What was read | Layer of the reading |
| --- | --- | --- |
| `/media/ryanr/Shared Files/Projects/Astrographer` (`post-division-rebuild` @ `b6791e0`) | `src/main/**`, `src/renderer/**`, `src/shared/types.ts`, `tests/**` (import graphs + the path-pinned source contracts), `scripts/**`, `package.json`, `vitest.config.ts`, `docs/next-steps.md` (the P2 block), `docs/HANDOFF.md`, `docs/specs/design-extensions-review.md` §13–§14, `docs/specs/test-pruning-disposition-2026-09-21.md`, `docs/specs/rebuild-drift-map-2026-09-21.md` | fork-local / **envelope + assembled** source reads; test claims are **grep readings**; suite figures are **quoted recorded readings** |
| `/media/ryanr/Shared Files/Projects/Gnosis` (Rust engine) | `src/server.rs` (`route_bijection()`), `src/bin/gnosis_server.rs` (`fn router`), `src/wire/*.rs`, `docs/specs/gnosis-gr-inbound-review.md`, `docs/specs/gnosis-grq-inbound-review.md`, `docs/specs/u4-cursor-paged-reads.md`, `docs/specs/durable-store-spec.md`, `docs/specs/engine-wire-contract.md` §4.x/§11/§14.x, `docs/specs/p1a-document-crud-wire.md`, `docs/specs/p2-gnosis-server.md` §5.x/§9.5.x, `docs/specs/a2-override-routes-spec.md`, `docs/specs/engine-transport-auth-spec.md`, `docs/specs/f4-community-context-spec.md`, `docs/specs/4-1…4-5` + `4-2/4-3/4-4` property registers, `docs/greens/**`, `docs/next-steps.md` §OPEN/§DONE, `docs/pending.md`, `docs/decisions.md`, `docs/HANDOFF.md`, `docs/integrations/astrographer-interface-implementation.md` | **engine-side** spec/tracker/source reads — **engine-green is the trackers' recorded green, not a re-measurement** |
| `/media/ryanr/Shared Files/Projects/Astrographer/docs/feature-requests/` | `gnosis-engine-feature-requests.md` (`GR-1..GR-9`), `gnosis-engine-prerequisites.md` (`GRQ-1..GRQ-11`) | the fork's own upstream ask — a **request record**, never evidence about the engine |

**Citation discipline (binding).** Every claim cites a `path` + **symbol** / **row id** / **§section**. **No
line number is used as an address in this file.** Anything not read is marked **UNVERIFIED**. Where Gnosis's
own trackers record an item as pending / parked / refused, this file says so and quotes it — **it does not
claim a landed capability the engine's trackers record as pending.**

**The authority for the division.** `docs/decisions.md` `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (`GN-1`,
ACTIVE — *"Supersede now — engine owns document CRUD"*) supersedes `RAG-AUTHORITATIVE` / `SINGLE-WRITER-STORE` /
`SINGLE-WRITER-STORE-PER-STORE`; `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` (`GN-4`) **reverses**
`ENGINE-ABSENT-DEGRADED-CONTRACT`'s identity clause; `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE) rules that *"a
test whose subject the specs supersede is **ARCHIVED, not adapted**"*; and
`docs/specs/design-extensions-review.md` §13.2 **S1** pins the sunset rule. The product-owner instruction this
branch executes is quoted verbatim in `docs/specs/test-pruning-disposition-2026-09-21.md` §9.1.

**This file pairs with** `docs/specs/rebuild-drift-map-2026-09-21.md` (the *other four* units — `C9`, `C11`,
`U-READS-PIVOT`, `U-AUTHORITY-SWITCH`). This file covers the **engine-delegation half**; the two must be read
together (they share the P2 chain, §5 below).

---

## 0. THE ONE FINDING THE SUPERVISOR NEEDS FIRST (stated plainly, not softened)

> **The engine's landed graph surface does NOT compute any fork-side graph DERIVATION. It provides a DATA
> read (`GET /wikis/:id/nodes`, `GET /wikis/:id/edges`), a CHANGE feed (`GET /changes`), and four graph
> MUTATIONS (`POST /graph/…`). It does NOT compute subtrees, subtree ranges, back-refs, doc-flow verdicts,
> doc-head trees, crosslink/backlink sets, layout, or markdown rendering — and several of those reads are
> **REFUSED, not parked**.**

Consequences, each cited:

1. **`buildTraversal` is explicitly ruled to STAY in-process.** `docs/specs/design-extensions-review.md`
   §14.2: *"`buildTraversal` **stays in-process** … and the ruling moves **where the data comes FROM**,
   never where the traversal runs. Its input contract is unchanged."* A rebuild that deletes
   `src/main/traversal.ts` **contradicts a standing fence pin**, and the file is additionally **path-pinned**
   (§6). This is the single largest correction this inventory makes to a naive "delete the graphing files"
   plan.
2. **The engine's read routes are DELIBERATELY CLOSED for the community/traversal/provenance family.**
   `docs/specs/engine-wire-contract.md` §14.4 clause 4(a) and `docs/specs/a2-override-routes-spec.md` §10
   clause 4(a) read: *"the traversal/community reads (`getCommunity`/`listCommunities`/`getCommunityContext`/
   `communityState`/`reDeriveCommunity`) … are **lib-visible and deliberately UNROUTED**."* `getCommunityContext`
   is **engine-green at the lib level** (`docs/specs/f4-community-context-spec.md`, LANDED 2026-09-09) and
   **unrouted** — so no fork-side consumer can use it. **An engine capability that is green in Gnosis is NOT
   proof the app consumes it**, and where the app has no client seam the correct unit is a **fork-side
   adoption unit, not an elimination.**
3. **The revision/marker the fork's read model needs is REFUSED, not parked.** `docs/decisions.md`
   `GNOSIS-CHANGE-CURSOR` + `docs/specs/engine-wire-contract.md` §4.6: *"`GET /snapshot?revision=…` and a
   `stale_revision` error are **REFUSED, not parked**"*; `docs/pending.md` GR-4 reads *"PARKED = REFUSED per
   the gate-1 review"*. The landed substitute is an **opaque change cursor** valid for *"cache invalidation,
   resync and de-dup"* only — explicitly **not** cache validation, optimistic concurrency or state
   reconstruction, and **process-lifetime monotonic only**.
4. **The fork's trackers are STALE against Gnosis's own.** `docs/next-steps.md` (fork, P2 block) and
   `docs/HANDOFF.md` (`O-7 ENGINE PERSISTENCE … the engine server persists NOTHING today`) still read as
   though durability had not landed, while Gnosis's own trackers read **`D-D1` / `D-D2` — DONE — LANDED-GREEN
   + ALL GATES RUN (2026-09-22)** (`docs/next-steps.md` §OPEN / §DONE, Gnosis; `docs/decisions.md`
   `DURABLE-STORE-LANDED`). **This is the highest-value tracker correction the rebuild owes**, and it changes
   §5's blocker analysis (the durability leg is no longer the held one — the **ingest/record-copy** leg is).
5. **Two landed wire additions are invisible to the fork.** `grep -rn "resultVersion\|commitToken" src/ tests/`
   over the fork returns **nothing**: the app's CRUD client neither sends nor reads the engine's folded
   mutating payload (`{method, resultVersion: 2, result, commitToken}` — `src/wire/crud.rs`
   `RESULT_VERSION_TOKENED` / `encode_crud_response_with_token`), and `decodeCrudResponse`
   (`src/main/engine-crud-rag-store.ts`) checks **exactly one of `result`/`error`** and never checks
   `resultVersion`. Likewise `src/main/engine-rag-store.ts`'s `HealthReport` type has **no `durability`** field,
   so the engine's new `durability` axis (`src/wire/status.rs` `HealthReport.durability`; values
   `"durable" | "in-memory" | "disabled"`) is decoded-and-discarded. **These are silent-drift hazards, not
   eliminations** (§4 PD-ENG-13, PD-ENG-12).

---

## 1. THE GNOSIS SURFACE INVENTORY AS IT STANDS NOW

**Route table (read from source, not from a tracker).** `src/server.rs` → `pub fn route_bijection()` returns
**22 rows**; `src/bin/gnosis_server.rs` → `fn router` mounts **19** `.route(` registrations. The count is a
**growth invariant, not a fixed count** (`docs/specs/p2-gnosis-server.md` §5.2 clause 5: *"no fixed row count
is part of the invariant"*); the pre-U1 "exactly 14 rows" clause was **deleted** by unit `U1`. The count
census is asserted per unit (`docs/specs/a2-override-routes-spec.md` §4.1–§4.3 moved 13 sites; the
`U5-INDEX-AVAILABILITY AMENDMENT RECORD` moved the `.route(` count `18 ⇒ 19`).

| # | (verb, path) | handler | pinned by (spec + §/row) | request | response | status (tracker row, quoted) |
| --- | --- | --- | --- | --- | --- | --- |
| 1–11 | the **P1a CRUD family** — `POST /documents`, `GET /documents/:id`, `POST /documents/:id/update`, `DELETE /documents/:id`, `POST /documents/:id/publish`, `POST /documents/:id/unpublish`, `POST /documents/:id/archive`, `GET /documents`, `POST /wikis`, `GET /wikis/:id`, `GET /wikis` | `crud_handler` | `docs/specs/p1a-document-crud-wire.md` §4.2/§4.3/§7; `ENGINE_ENDPOINTS` (`src/wire/crud.rs`, **11** rows); `p2` §5.2 row `P-IM-3` | F2 envelope, `payload = {method, args}` | F2 envelope, `payload = {method, result}` (+ the D-D1 fold on the **7 mutating** methods) | **DONE** — Gnosis `docs/next-steps.md` §DONE rows *"§7.2 P1a document-CRUD wire contract"* and *"§7.2 P2 `gnosis-server` binary crate"*. The four **read** routes carrying a `GET` body are **PARKED** (`docs/pending.md`, the *"four CRUD READ routes carry a request body"* row) |
| 12 | `POST /rag/query` | `rag_query_handler` | `p2` §5.1/§5.3; F2 §4.5; register rows `P-IM-4`…`P-SM-4` | F2 envelope, `payload` = 14 camelCase option keys (`query`,`mode`,`topK`,`wikiId`,…) | F2 envelope with a **bare `RagResult`** (not the SSE chunk) | **DONE** — §DONE row *"U2 — the query POST contract"* |
| 13 | `GET /rag/stream` | `rag_stream_handler` | `p2` §5.1/§5.4; F2 §4.4; `P-IM-49`/`P-SM-13`/`P-TP-11`; `docs/specs/sse-response-surface.md` §4.1–§4.3 | query params only: `?query=&topK=&mode=` | `200 text/event-stream`, frames `result`/`done`/`error` | **DONE** — §DONE row *"`SSE-RESPONSE-SURFACE`"* (*"GREEN at every layer"*; live 18 PASS / 0 FAIL / 0 PARKED) |
| 14 | `GET /engine/status` | `engine_status_handler` | `p2` §5.1/§5.8; F2 §9; `P-SM-7` | none | `HealthReport` — **7** top-level keys (the six pre-D-D1 keys **+ `durability`**) | **DONE** — §DONE rows *"U3 — status honesty"* and *"`D-D1`"* |
| 15 | `GET /changes` | `changes_feed_handler` | `docs/specs/u4-cursor-paged-reads.md` §2.3; F2 §4.7; `p2` §5.6; `P-IM-30`/`P-IM-32` | **no request-side cursor** — the handler's own doc records *"the feed has no request-side cursor today"* | SSE: frame 1 `event: cursor`, then one `event: change` per committed journal entry | **DONE (code)** — §DONE row *"U4"*; battery row **`R-L8` PARKED** *"for the durable/live-bin half only"* |
| 16 | `GET /wikis/:id/nodes` | `list_wiki_nodes_handler` | `u4-cursor-paged-reads.md` §2.2; `p2` §5.7; `P-IM-27`/`P-IM-28`/`P-IM-29` | `?page=&page_size=&cursor=` | plain JSON, exactly **6** fields: `items`,`total`,`page`,`page_size`,`cursor`,`watermark` | **DONE (code)** — §DONE row *"U4"* |
| 17 | `GET /wikis/:id/edges` | `list_wiki_edges_handler` | same as 16 | same as 16 | same as 16 | **DONE (code)** — §DONE row *"U4"* |
| 18 | `POST /graph/communities` | `declare_community_handler` | `docs/specs/a2-override-routes-spec.md` §2.2 row 1/§3.2; `OVERRIDE_ENDPOINTS` (`src/wire/graph.rs`); F2 §14.4; `P-IM-38`…`P-IM-43` | override envelope: `caller` **+ required `authorship`** + `nodeIds`/`summary`/`wikiId` | `{method, resultVersion:2, result, commitToken}` | **DONE** — §DONE row *"`A2`"*; live **`R-L9` EXECUTED — 22 PASS / 0 FAIL / 0 PARKED** |
| 19 | `POST /graph/communities/:id/summary` | `update_community_summary_handler` | §2.2 row 2 + note 4 (**`:id` is never read**; `args.communityId` is authoritative) | `caller`,`authorship`,`communityId`,`summary` | same shape | **DONE** — §DONE `A2` |
| 20 | `POST /graph/entities/resolve` | `resolve_entities_handler` | §2.2 row 3; §3.4 note 1/2 | `caller`,`authorship`,`entityIds`,`canonicalId?`,`wikiId` | 4-key body incl. `authorship` + token | **DONE** — §DONE `A2` |
| 21 | `POST /graph/facts/merge` | `merge_facts_handler` | §2.2 row 4; §6.2 retry pin | `caller`,`authorship`,`factKeys`,`canonicalKey`,`wikiId` | `FactWireBody` + token | **DONE** — §DONE `A2` |
| 22 | `POST /engine/maintenance` | `engine_maintenance_handler` | `docs/specs/u5-index-availability.md` §4.1/§4.5; F2 **§14.6**; `P-IM-52`/`P-SM-15`/`P-TP-13` | **no body, no parameter** | `200 {"code":"index_rebuilt",…}` or an existing 503 | **DONE (code)** — §DONE row *"`U5-INDEX-AVAILABILITY`"*; **its live gate is OUTSTANDING** (`R-L11` is *"CONTRACT-ONLY — NOT EXECUTED"*, §OPEN row). F2 §14.6: it is **OPERATOR-ONLY** and *"not part of any consumer interface"* |

**Error surface.** The §11 map is **22 rows** (`src/server.rs` `server_status`; `src/wire/error.rs`
`wire_code`/`code_table`/`from_wire`), the 22nd being `persistence_unavailable` ⇒ **503**, added by D-D1
(`docs/decisions.md` `ENGINE-COMMIT-FAILURE-OUTCOME (§11's FIRST GROWTH: a 22nd row)`, ACTIVE). Pre-existing
rows still binding on the fork's client: `not_found`/`wiki_not_found` → 404, `validation_error` → 400,
`conflict` → **409 (FS-4 mandated)**, `doc_in_use`/`invalid_state` → 409, `unresolved_reference`/`hop_limit_exceeded`
→ 422, `engine_unavailable` → 503 (FS-8), `engine_error`/`trace_unavailable` → 502, `cycle_detected` → 409,
`embedding_unavailable`/`vector_index_unavailable`/`lexical_index_unavailable`/`reranker_unavailable` → 503,
`compression_failed`/`hyde_generation_failed`/`multi_query_expansion_failed`/`sub_task_dag_failed` → 500,
`community_not_found` → 404. **Transport-level codes are NOT §11 rows**: `invalid_json`/`invalid_envelope`/
`unsupported_schema_version`/`unknown_id_format` → 400, `unknown_method` → 422, `resync_required` → **400**
(U4; *"not a `StoreError::wire_code()`, not a §11 row"*), `unauthenticated` → **401** (AUTH). There is **no
`stale_revision` code and no `decode_failed` code** (F2 §11 pre-fold rule; `p2` §5.2 closing clause).

**Auth (unit `AUTH`, LANDED 2026-09-27).** `src/auth.rs` — a per-boot **32-byte** CSPRNG secret rendered as
**64 lower-case hex** and handed over as **one framed stdout line** (`gnosis-server: transport token: <hex>`)
**before the bind**; presentation is `Authorization: Bearer <token>`; enforcement is **ONE outermost
per-request layer** over the whole router with **only `GET /engine/status` exempt**, so a token-less
`POST /graph/nope` is **401, never 404**; the refusal body is `{"code":"unauthenticated","message":…}`,
byte-identical across all failing presentations. **Boundary:** *transport authentication → ENGINE; policy
authorization stays SHELL* (`docs/decisions.md` `GNOSIS-ENGINE-TRANSPORT-AUTH` + `GNOSIS-RBAC-EDIT-ENFORCEMENT`,
amended not deleted). Tracker: §OPEN row *"CLOSED — `AUTH` IS LANDED AND DONE (2026-09-27)"*; live `R-L10`
**EXECUTED — 53 PASS / 0 FAIL / 0 PARKED**. `docs/pending.md`: the AUTH residual **R-A** (the launcher may
redirect the token line to a world-readable file; operator terminal scrollback) is **accepted**, with *"no
engine-side mitigation exists"*.

**Durability (D-D1 + D-D2, LANDED 2026-09-22).** `docs/specs/durable-store-spec.md` — the on-disk format, the
atomic commit **temp → `fsync` → `rename`** inside the mutation's existing critical section, recovery = `open`
(recover-or-refuse, fail-closed on corruption), retention/compaction with a **persisted floor**, the persisted
derived index + its validation key with the M-1…M-6 mismatch table, the commit token, and the **fifth**
configuration read **`GNOSIS_SERVER_STORE_PATH`** (`src/bin/gnosis_server.rs` `store_config`). Registered
values: `DURABLE_JOURNAL_RETENTION_MAX_ENTRIES = 256` (format-internal). Trackers: §OPEN rows **`D-D1`** and
**`D-D2`** both read *"DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22)"*; `docs/decisions.md`
`DURABLE-STORE-LANDED` + `DURABLE-RETENTION-TRIM-LANDED`. **Carried, named (not landed):** `G-3`/`G-4` (the
format's own design gaps), the writer-actor / rebuild vehicle, the power-cut `fsync`/`rename` proof (`G-7` —
*"a spawn cannot cut power"*), and the **feed-side resync-refusal bytes** (*"sub-observable … structural
because the change feed takes no request-side cursor"*).

**Store / property registers (engine-green, lib-level).** `docs/specs/4-1-store-property-register.md`
(§4.1 document store), `4-2-graph-property-register.md` (§4.2 knowledge graph **+ its §7.5 F4 section**),
`4-3-facts-property-register.md`, `4-4-consistency-property-register.md`,
`4-5-retrieval-property-register.md` — each with its `docs/greens/*-greens.md` counterpart. `4-3`'s status
line reads *"all 8 rows are now `[GREEN]`/`[GREEN — held]` … no `[PENDING *Hn*]` row remains"*; the §DONE
*"PBT-gate retrofit"* row reads **40/40 property rows HELD** across `props_store 12 · props_graph 13 ·
props_facts 14 · props_consistency 12 · props_retrieval 8`, with **`§4.5 P-IM-2` genuinely BROKEN**
(`rrf_fuse` `f64` non-associativity) then **host-fixed**. `docs/specs/7-2-wire-property-register.md` is the F2
register (its greens file's heading still prints a *dated* "21-variant" figure; the post-fold count is **22**,
`docs/specs/dd2-retention-trim-greens.md` `g12`).

**Retrieval — routed vs not.**

| capability | routed? | evidence |
| --- | --- | --- |
| `ragQuery` / `ragStream` / `getEngineStatus` | **routed** | rows 12–14 above |
| `bm25Search` | **NOT routed** | `src/store/mod.rs` trait decl only; `p2` §5.9 / F2 §16 record that `LexicalIndexUnavailable` *"is only surfaced via the `bm25_search` API"* and *"FS-15 is unreachable on the `ragQuery` surface"* |
| `vectorSearch` | **NOT routed** | same; reachable only as a **leg** inside `rag_query`/`rag_stream` (`mode=vector`) |
| `getProfileSummary` | **NOT routed** | lib-level green only (`docs/greens/4-5-retrieval-greens.md` §4.5.4) |
| `getQueryAuditLog` | **NOT routed** | lib-level only; audit log is **non-durable** (decision `F6-EVAL-RE-SCOPED`) |

**Journal / undo.** There is **NO undo route and NO journal-read route** anywhere in the 22 rows or in any
spec §; the nearest authorizing tracker row is `docs/pending.md`'s *"Route growth beyond U4"* (**PARKED**,
trigger = *"a named consumer need for the route **plus** an amendment unit"*). The journal is exposed
**indirectly, as a change feed** (`GET /changes`, row 15) reading `Store::change_cursor()`,
`Store::retention_floor()` and `Store::journal_entries_after(seq)`; the `#[doc(hidden)]` **test-only** seam
pair `retention_floor_advance`/`cursor_retention` is not a production surface. **Replay is refused:** F2 §4.7
— *"There is **no retained replay log** and **no `?since=` backfill**"*, and `P-IM-32` asserts a `?since=`
param is **ignored, never honoured**.

**Community / neighbourhood reads.** `Store::get_community_context` is **engine-green at the lib level and
UNROUTED** (`docs/specs/f4-community-context-spec.md`; decision `F4-COMMUNITY-RETRIEVAL`; the *"LANDED
(2026-09-09)"* row in `docs/pending.md`). Its spec §records fail-state **`CommunityNotFound` only**.
`P-IM-43` is the **asserted negative**: *"the route surface is CLOSED … no row's path resolves to
`getCommunity`/`listCommunities`/`getCommunityContext`/`communityState`/`reDeriveCommunity`."* The
consumer-side consequence is stated by the engine itself (F2 §14.4 clause 4): a cold-starting shell **cannot
read provenance** for a record it did not write — *"it must read provenance **only from what a WRITE
returns**"*.

**Where the fork's client stands against this surface (read from the fork's source).**

| engine surface | fork client seam today | evidence |
| --- | --- | --- |
| `/rag/query`, `/rag/stream`, `/engine/status` | **present** — `src/main/engine-rag-store.ts` `ENGINE_ENDPOINTS` (3 rows) + `createSseClient` + `decodeHealthReport` | read |
| the 11 P1a CRUD routes | **present** — `src/main/engine-crud-rag-store.ts` `ENGINE_CRUD_ENDPOINTS` (11 rows) | read |
| **`GET /changes`** | **ABSENT** — no `/changes` occurrence anywhere under `src/` | grep reading |
| **`GET /wikis/:id/nodes` / `…/edges`** (the paged reads) | **ABSENT** — the app's `RagStore` reads are synchronous and local | grep reading + the `RagStore` interface |
| **the four `POST /graph/…` override routes** | **ABSENT** — no occurrence of `declareCommunity`/`updateCommunitySummary`/`resolveEntities`/`mergeFacts` route wiring under `src/` | grep reading |
| **`commitToken` / `resultVersion: 2`** | **ABSENT** — `grep -rn "resultVersion\|commitToken" src/ tests/` returns **nothing** | grep reading |
| **`durability` on `HealthReport`** | **decoded-and-discarded** — the fork's `HealthReport` type (`src/main/engine-rag-store.ts`) has no such field; `decodeHealthReport` is total over its known keys and tolerates unknown ones | read |
| **the AUTH Bearer hand-over** | **partial** — `src/main/engine-transport.ts` `headers()` sends `authorization: Bearer <token>` when given a token; **no seam reads a token from the engine's stdout hand-over line** | read (`headers`) + grep (`token` sources) |

> **The rule this table exists to enforce:** an engine capability that is **green in Gnosis** and has **no
> fork-side client seam** is a **fork-side adoption unit, not an elimination**. Five of the eight rows above
> are that case.

---

## 2. THE `GR-1..GR-9` REQUEST SET — STATUS, EACH WITH THE GNOSIS FILE THAT SAYS SO

The fork's filing is `docs/feature-requests/gnosis-engine-feature-requests.md` (**filed 2026-09-16**;
`docs/HANDOFF.md` carries it as the *"GNOSIS-ENGINE FEATURE-REQUEST HANDOVER PREPARED"* row and — critically —
`docs/HANDOFF.md`'s **`GR INVENTORY STATUS`** row already records that *"`…/gnosis-engine-feature-requests.md`
§GR-1..§GR-9 still presents all nine items as **open problems**, while the engine's side records **landed**
work and **re-shaped** verdicts for the same items"*). **The request document is therefore NOT a status
source: only Gnosis's own trackers are.** Every verdict below cites Gnosis.

| GR | what the app asked for | **Gnosis's recorded verdict** | verdict source (Gnosis) |
| --- | --- | --- | --- |
| **GR-1** | `POST /rag/query` must accept the F2 envelope (P0) | **PROCEED-WITH-AMENDMENTS, engine half only — LANDED.** The envelope requirement is *"intentional and final"*, so the bare POST body was the **consumer's** defect; bare-body tolerance is **REFUSED**. The engine's residual (a structured JSON decode body) **landed in U2**. | `docs/specs/gnosis-gr-inbound-review.md` §"Per-GR verdict table" GR-1 row + §"Validity findings" items 6/8; landing: the §DONE *"U2"* row and F2 §documenting the decode-error body |
| **GR-2** | `POST /rag/query` must honour `mode` and `topK` (P0) | **PROCEED-WITH-AMENDMENTS — LANDED (U2).** Confirmed a real silent defect, then fixed: `mode`/`topK` flow through the shared decoder; the mode rule is **case-insensitive** over `flat\|graph\|vector\|hybrid`, absent → Flat, unknown → **400 `validation_error`** (never silent degradation). **Zero consumer work.** | `gnosis-gr-inbound-review.md` GR-2 row + §"Validity findings" item 1; `docs/specs/gnosis-grq-inbound-review.md` §4 GRQ-7 row (*"**already fixed** … its live repro **predates U2**"*) |
| **GR-3** | build the vector index for the server's store; make `mode=vector` usable (P1) | **SPLIT, both halves now landed as re-shaped.** The **status-honesty** half **LANDED (U3)** (flags derived at read time; `reranker:false`; the false-claim class removed). The **boot index build** half **LANDED (U5)**, with a follow-up `U6` making it **honest** (`vector_index_is_fresh` equality predicate; a stale index **refuses loudly FS-14 ⇒ 503**). The **"maintain on store changes"** half is **PARKED** on the held-off `WRITER-ACTOR-JOURNAL` writer, and its **availability** residual is recorded as **`U5-ADV-1`, still OPEN** (the operator-only repair route `POST /engine/maintenance` landed, but *"the failed-boot / `Degraded` class and the absent-or-unreachable-provider class both stay FS-8 for the process's life"*; *"every change-triggered vehicle stays withdrawn"*). | `gnosis-gr-inbound-review.md` GR-3 row + §"Validity findings" item 2; §DONE rows *"U3"*, *"U5"*, *"U6"*, *"`U5-INDEX-AVAILABILITY`"*; `docs/pending.md` rows *"GR-3 vector-index maintenance on store changes"* + *"The U5 honesty/freshness follow-up unit"* |
| **GR-4** | a **revisioned bulk projection snapshot** (`GET /snapshot?revision=…`, `stale_revision`) (P1) | **PARK-WITH-TRIGGER — and the revisioned half is REFUSED, not parked.** The **bulk read** half was **re-shaped as `U4`** (paginated, wiki-scoped, **cursor-tagged** reads) and **LANDED GREEN**. The revisioned projection is **REFUSED**: *"the engine owns **no consumer-visible store-wide revision** … a consumer-held projection keyed on it is a **second source of truth** … `SHARDED-RWLOCK-STORE` forecloses a point-in-time read across shards."* Re-open trigger = **two conjuncts** (a demonstrated stale-read need per-document `revision` cannot serve **and** a possible point-in-time store-wide read). | `gnosis-gr-inbound-review.md` GR-4 row + §"Validity findings" item 9 + §"The four rulings" 1/2; `docs/pending.md` GR-4 row (*"PARKED = REFUSED per the gate-1 review"*); landing: §DONE row *"U4"* |
| **GR-5** | a store-change notification / subscription route + a staleness contract (P1) | **PROCEED-WITH-AMENDMENTS (re-shaped) — LANDED as `U4`.** Re-shaped from a **revision** to an **opaque change cursor** (= the committed journal `seq`, +1 per committed entry, **process-lifetime monotonic**, scope **cache invalidation / resync / de-dup ONLY**). *"`JournalEntry` is `{seq, op, base_revision, timestamp}` … with **no ids/kind**, and the 'two writes in one commit batch' acceptance presumes a **batching primitive that does not exist**"* — the landed `U4` extended the journal with `kind` + affected ids and added `GET /changes`. **No `stale_revision` wire code.** | `gnosis-gr-inbound-review.md` GR-5 row + §"Validity findings" items 4/10 + ruling 1; `docs/specs/u4-cursor-paged-reads.md` §0.1/§2.3; §DONE row *"U4"* |
| **GR-6** | bulk markdown ingestion with progress, cancellation, a cap and per-document path segments (P2, destination) | **PARK-WITH-TRIGGER; the `{files:[paths]}` variant is REJECTED.** Confirmed absent (no parser, no route, no batch primitive; `Document` has **no path field**). The requested contract is *"self-contradictory"*; the document-`path` half **collides with the FROZEN P1a `Document` body** (`docs/specs/p1a-document-crud-wire.md`, `P-IM-2`); `{files:[paths]}` *"would grant the engine a filesystem-read capability"*. Re-filed by `GRQ-5`/`GRQ-6`; **the trigger is UNDISCHARGED** and the re-filing *"leaves the trigger UNDISCHARGED (it restates the one-commit-vs-chunked contradiction and resolves neither half)"*. | `gnosis-gr-inbound-review.md` GR-6 row + §"Validity findings" item 12; `docs/specs/gnosis-grq-inbound-review.md` §4 GRQ-5/GRQ-6 + §11 + §15.5 condition 8; `docs/pending.md` rows GR-6a/GR-6b |
| **GR-7** | server-side persistence for the engine store (P2, destination) | **PARK-WITH-TRIGGER → later AUTHORIZED → LANDED-GREEN.** The gate parked it and coupled it to the consumer's O-8 amendment; the user's later ruling (*"The shell doesn't own it."*) made that conjunct **MOOT, not unmet**, and `D-D1` + `D-D2` **landed** (*"the durable store exists"*; *"the row's three-conjunct trigger is DISCHARGED"*). **One premise of the original request was refuted:** *"There is **no persistence abstraction** in the crate — no trait with 'no disk implementation', no seam to fill in."* | `gnosis-gr-inbound-review.md` GR-7 row + §"Validity findings" item 11; `docs/specs/gnosis-grq-inbound-review.md` §4 GRQ-1 row + §7(i) + §14 POST-RECORD UPDATE 3; `docs/pending.md` GR-7 row (the D-D1 AUTHORIZATION AMENDMENT + the SUPERVISOR *"RESOLVED / LANDED"* note); `docs/decisions.md` `DURABLE-STORE-LANDED`; §OPEN/§DONE rows `D-D1`, `D-D2` |
| **GR-8** | the enrichment/traversal routes the parked F4-LLM integration needs (P3, destination) | **PARK-WITH-TRIGGER → later UNPARKED by user instruction → the two ENGINE halves LANDED; the row is CLOSED.** The four trait methods `declare_community`/`update_community_summary`/`resolve_entities`/`merge_facts` were *"implemented but **unrouted**"*; the provenance mechanism *"was **unlanded**"*. **`A1` landed the provenance mechanism and `A2` landed the four `POST /graph/…` routes** (`route_bijection()` `17 ⇒ 21`; `ENGINE_ENDPOINTS` stays **11**; §11's map stays **22** rows), with live `R-L9` **22 PASS / 0 FAIL / 0 PARKED**. **What is UNCHANGED: the text-generation seam stays ruled OUT**, and the **traversal/community READS stay UNROUTED** (F2 §14.4 clause 4(a)). *"Whether this row's status word should now read CLOSED is a row-level tracker decision"* → resolved by the supervisor's row-level decision. | `gnosis-gr-inbound-review.md` GR-8 row (with the DOC REVIEW gate (`A2`) supersession marker); `docs/pending.md` GR-8 row (the user-instruction UNPARK + the CLOSED row-level decision); §DONE rows *"`A1`"*, *"`A2`"*; F2 §14.4 |
| **GR-9** | mutating-surface authorization for a machine caller (P3, quality) | **REJECT as an engine deliverable — already answered.** *"REFUTED as an engine gap. The observed `caller has no edit authority` is **shell-side fail-closed** from an empty authority mapping, not an engine refusal; the engine has **no** denial code, discards `caller` after the decode layer, and its mutating methods take **no `caller` param**."* C5 + `GNOSIS-RBAC-EDIT-ENFORCEMENT` place the gate in the **SHELL**; *"Do NOT author an engine authority contract."* **Later narrowed, not reversed:** unit `AUTH` landed **transport authentication** while the engine remains *"an **authorizing** nobody"*. A2's four routes **do** now require an `authorship` argument — an engine-side **presence/equality** guard, explicitly *"no new variant, no new row"*, **not** rank arbitration. | `gnosis-gr-inbound-review.md` GR-9 row + §"Validity findings" item 7 + §"Boundary table"; `docs/decisions.md` `GNOSIS-RBAC-EDIT-ENFORCEMENT`; `docs/specs/a2-override-routes-spec.md` §5.3 item 4; F2 §14.4 clause 2/4(d) |

### 2.1 `GRQ-1..GRQ-11` — the P2 prerequisite re-filing (filed 2026-09-21)

The fork re-filed its P2 prerequisites as `docs/feature-requests/gnosis-engine-prerequisites.md` (11 requests
in 5 groups; census *"OWED 7 / REQUESTED 4"*, *"P0 3 / P1 6 / P2 2"*). Gnosis's gate record is
`docs/specs/gnosis-grq-inbound-review.md`. Its verdict counts: **VALID-AMENDED ×7** (`GRQ-1,2,3,5,6,8,9`) ·
**DUPLICATE-ALREADY-RULED ×2** (`GRQ-4,10`) · **OVERSTATED ×2** (`GRQ-7,11`) · **UNSUPPORTED ×0**, and
**§2.1 records that 7 of the 11 are re-filings of already-adjudicated items and that *"No GRQ supplies new
evidence for disturbing a standing ruling."*** Two engine-state claims the filing made were **falsified**, and
a later pass must not repeat them: (a) the two *"OPEN engine-side defect rows"* it names by id —
`GNOSIS-ENGINE-QUERY-MODE-IGNORED` and `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` — *"do not exist under those
names in this repo's `docs/defects.md`"*; (b) `GRQ-7`'s *"live repro"* is **stale**.

> **The GRQ set's most consequential finding for THIS rebuild is §7(i), the *durable-authority fork*:**
> *"the set assumes the engine becomes the durable authority … without filing it."* Gnosis's answer, and the
> user's: **Q1 = (A), the engine becomes the durable authority**; **Q2's O-8 precondition conjunct was later
> superseded as MOOT** by the user's *"The shell doesn't own it."* ruling. **That is the contract half of the
> division this branch executes — and it is exactly what makes the fork's own `U-AUTHORITY-SWITCH` /
> `U-CORPUS-MIGRATION` / `U-READS-PIVOT` chain (§5) the gating work.**

---

## 3. WHAT THE ENGINE DOES **NOT** PROVIDE (read off the route table and the trackers)

Each row is a **capability the fork cannot offload**, with its authority. Nothing here is a guess.

| # | not provided | authority |
| --- | --- | --- |
| N-1 | any **bulk snapshot / revisioned projection** | F2 §4.6 *"Refused alternatives"*; `docs/decisions.md` `GNOSIS-CHANGE-CURSOR`; `docs/pending.md` GR-4 |
| N-2 | `stale_revision`, `decode_failed` wire codes | F2 §11 pre-fold rule; `p2` §5.2 closing clause |
| N-3 | any **retained replay log** / `?since=` backfill / feed budget / throttle | F2 §4.7; register `P-IM-32` |
| N-4 | any **undo / revert / journal-read** route | no such row exists in the 22-row table or in any spec § — **refused by absence**; nearest authorizing tracker row is `docs/pending.md`'s PARKED *"Route growth beyond U4"* |
| N-5 | **community / traversal / provenance READS** on the wire | F2 §14.4 clause 4(a); `docs/specs/a2-override-routes-spec.md` §10 clause 4(a); the asserted negative `P-IM-43` |
| N-6 | any **fact-writing** route (`createFact`/`updateFact`/`proposeCandidateFact`) | F2 §14.4 clause 4(b): *"the only wire path to a `Fact` is `POST /graph/facts/merge`"* |
| N-7 | `setReferenceState`, `declareSegment`, `addTriple` routes | F2 §14.4 clause 4(c) |
| N-8 | any **rank / authority arbitration** or `InsufficientAuthority` code | F2 §14.4 clause 4(d): *"the lock is RESERVED"*; `docs/decisions.md` `AUTHORSHIP-SOURCE-PROPERTY`, `RESERVED-ERRVARIANTS-DISCIPLINE` |
| N-9 | **engine-side RBAC / policy authorization** | `docs/decisions.md` `GNOSIS-RBAC-EDIT-ENFORCEMENT` |
| N-10 | an **edge/adjacency query route** (`edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/`docHeadForDocument`) — the only edge read is the wiki-wide paged `GET /wikis/:id/edges` | the 22-row table (read); the `RagStore` trait methods are not routed |
| N-11 | **bulk markdown ingest**, a batch-atomic route, progress/cancel, a `{files:[paths]}` variant, per-document `path` segments | `docs/pending.md` GR-6a/GR-6b; `docs/specs/gnosis-grq-inbound-review.md` §7(iii) |
| N-12 | a **record-copy route accepting caller-supplied ids** (the `U-CORPUS-MIGRATION` prerequisite) | `docs/specs/gnosis-grq-inbound-review.md` §4 GRQ-6; folded into GR-6a's UNDISCHARGED trigger |
| N-13 | **consumer query-result-shape parity** (`ranked`/`context`/`markdown`/`lineMap`/`k`) | F2 **§14.1**: *"**REFUSED**: the engine does NOT emit the consumer's … field set … The engine's result shape is canonical and is **final**"* |
| N-14 | any **text-generation seam** (LLM community summaries) | `docs/pending.md` GR-8: *"the **text-generation seam stays ruled OUT**"* |
| N-15 | a **full sub-task DAG** (`subTaskDag` *"decomposes nothing"*; `SubTaskDagFailed` RESERVED) | `docs/pending.md`; `docs/decisions.md` `SUB-TASK-DAG-VALIDATED-ONLY` |
| N-16 | a non-degradable **compressor** leg (`CompressionFailed` RESERVED) and a **cross-encoder reranker** (`RerankerUnavailable` RESERVED) | `docs/pending.md`; `docs/decisions.md` `RESERVED-ERRVARIANTS-DISCIPLINE`; `docs/greens/4-5-retrieval-greens.md` §4.5.3 |
| N-17 | **change-triggered index maintenance** / a writer actor / an incremental rebuild | `docs/pending.md` GR-3 row + the `U5-INDEX-AVAILABILITY` rider: *"every change-triggered vehicle stays withdrawn"*; `docs/decisions.md` `OPERATOR-TRIGGERED-DERIVED-RE-DERIVATION` |
| N-18 | an **honest `last_error`** for the failed-build `Degraded` state (`U5-ADV-3`) | `docs/pending.md`: *"SCHEDULED, NOT YET AUTHORIZED (2026-09-22)"*; `docs/defects.md` `U5-ADV-3` **OPEN** |
| N-19 | a **config-file layer** (env vars only; the fork's `provides`-style config has no engine counterpart) | `docs/pending.md`: *"TRIGGER FIRED, NOT SETTLED … the durability units `D-D1` + `D-D2` have LANDED and did not settle it"* |
| N-20 | `POST /engine/maintenance` **as a consumer interface**, and a live-executed `R-L11` | F2 **§14.6** (*"OPERATOR-ONLY … not part of any consumer interface"*); §OPEN row `U5-INDEX-AVAILABILITY` (*"`R-L11` is CONTRACT-ONLY — NOT EXECUTED"*) |

**Summary counts (this pass's read).** **Engine-green, on the wire:** 14 unit families / **22 routes** (P1a CRUD
×11, the retrieval trio, `U2`, `U3`, `U4` ×3 routes, `U5` + `U5-INSTALL-SEAM-EPOCH` + `U5-INDEX-AVAILABILITY` ×1
route, `U6`, `A1`, `A2` ×4 routes, `AUTH`, `D-D1`, `D-D2`, `SSE-RESPONSE-SURFACE`). **Green only as
lib/accessor (NOT on the wire):** `getCommunityContext`, `bm25Search`, `vectorSearch`, `getProfileSummary`,
`getQueryAuditLog`, the `edgesFrom`/`edgesTo`/… family. **Pending/open residuals:** `U5-ADV-1`'s availability
half, `U5-ADV-3`, `U5-ADV-5`, `P-9`'s fired trigger, the `T1–T10` negative-generator obligation. **Parked
with a trigger:** route growth beyond U4; the *"U4 lands consumer-less"* row; GR-3's maintenance/capacity half;
GR-6a/GR-6b; the config-surface question; the CRUD-read `GET`-body divergence. **Refused:** `snapshot?revision=`
+ `stale_revision`; `decode_failed`; the replay log / `?since=`; query-result parity; engine-side RBAC;
`{files:[paths]}`; and the community/traversal/provenance read surface as a closed class. **Live-parked:**
`R-L8` (the durable/live-bin half), the feed-side refusal bytes, `R-L11`.

---

## 4. THE DELEGATED-FUNCTION CANDIDATE LIST (`PD-ENG-1..PD-ENG-19`, 31 modules)

**Classification vocabulary (closed set, as specified):**

| class | meaning in this file |
| --- | --- |
| **`DELETE-WHOLE-FILE`** | the engine's landed surface fully replaces the module and **no fork-side consumer survives** |
| **`DELETE-SUBSET-KEEP-ADAPTER`** | the module's **engine-replaced half** goes; a thin adapter stays because a second consumer (the client, the renderer, or an explicit fence pin) needs it |
| **`PARTIALLY-SHARED-KEEP`** | the module stays; **its DATA SOURCE changes** (local store → engine route) and/or it grows the landed routes' seam |
| **`NOT-IN-SCOPE`** | the engine's landed surface does **not** replace it — either because no route computes it, because the route class is **REFUSED**, or because a standing ruling pins it in-process |
| **`BLOCKED-ON-ENGINE`** | the elimination is correct in principle but **cannot land before the authority-switch chain** (§5) — and at least one conjunct of that chain is an **unlanded engine capability** |

**One mechanical fact that applies to every `ARCHIVE` row in §6 (stated once here, never hidden):**
`docs/specs/test-pruning-disposition-2026-09-21.md` §0 reads **`ARCHIVE-READY IS EMPTY. 0 of 224 files.`** —
*"There is no file in the suite whose subject feature has been removed from the code. The decision-level
obsolescence … is **contract-layer only**."* **Every `DELETE-*` classification below therefore carries a named
owning unit, and nothing is archivable today.**

---

### PD-ENG-1 — `src/main/retrieval.ts` (the local retrieval stack)

| field | value |
| --- | --- |
| **symbols to eliminate** | `retrieve`, `ragQuery`, `createRetrieval` (+ the `RetrievalEngine` impl), `createLexicalIndex`, `updateLexicalIndex`, `addToLexicalIndex`, `removeFromLexicalIndex`, `createLexicalEmbedder`, `selectTopK`, `assembleContext`, `walkReferenceGraph`, `expandParentContext`, `buildCitations`, `buildFlatTrace`, `qualifyStoreResult`, `documentIdsForNode`, `RAG_ENGINE_ID`, `DEFAULT_STOPWORDS`, `PLACEMENT_MIN_SCORE`, `SNIPPET_MAX_LENGTH`, `tokenize`, `nodeText` |
| **what it does today** | the **fork's own RAG engine**: a lexical index over `RagNode`s, an embedder seam, top-K selection, context assembly with inline-children rendering, a graph walk, the `RagResult`/`RagTrace` shape, and the local `ragQuery` the `mcp-server` tool path calls via `createRetrieval(...).query()` |
| **engine route/spec that replaces it** | `POST /rag/query` (F2 §4.5, 14 option keys, `mode ∈ flat\|graph\|vector\|hybrid`, case-insensitive, unknown ⇒ 400) + `GET /rag/stream` (`p2` §5.4) + `GET /engine/status`. The engine's **own** trace/result shapes are pinned in F2 §4.5 and are **canonically final** (F2 §14.1 **REFUSES** consumer-shape parity) |
| **consumer map — `src/**` importers** | `src/main/mcp-server.ts` (the MCP tool path), `src/main/vector-boot.ts`, `src/main/rag-store-directory.ts`, `src/main/rag-store-runtime.ts`, `src/main/merge-store-results.ts` (`RAG_ENGINE_ID`), `src/main/query-audit.ts`, `src/main/embeddings.ts` (`PLACEMENT_MIN_SCORE`), `src/main/engine-rag-store.ts`, `src/main/rag-store-remove.ts`, `src/shared/types.ts` (`LocalRagQueryFilters`), `src/renderer/sidebar-panes.ts`, `src/renderer/pane-graph.ts` (types) |
| **consumer map — `tests/**` importers** | `tests/retrieval.test.ts`, `tests/retrieval-adversarial.test.ts`, `tests/unit-f1-merge-store-results.test.ts`, `tests/unit-f2-result-qualification.test.ts`, `tests/unit-f3-stores-all-schema.test.ts`, `tests/unit-q-retrieval-children-indexing.test.ts`, `tests/unit-x-rag-provenance-traversal.test.ts`, `tests/unit-ud6-query-document-filters-adversarial.test.ts`, `tests/blind-unit-ud6-query-document-filters-greens.test.ts`, `tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts`, `tests/blind-unit-ud5-list-documents-tool-greens.test.ts`, `tests/unit-ms5-settings-listing.test.ts`, `tests/unit-h8-operator-editor.test.ts`, `tests/mcp-security-hardening.test.ts`, `tests/embeddings*.test.ts` (5), `tests/vector-boot*.test.ts` (2), `tests/unit-gn-engine-integration.test.ts` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` — prose references to the retrieval stage/the host; **no import** |
| **config coupling** | none by path; reachable from the **main** bundle via `mcp-server.ts` and `main.ts → rag-store-*`; `dist/renderer` receives the `LocalRagQueryFilters` **type** only (erased) |
| **dependency-ordered change list** | (1) the corpus/authority chain (§5) lands, so the engine's store is the authority; (2) `U-READS-PIVOT` lands the read cache (it owns the async-fetch-on-tab-open model); (3) the fork's `mcp-server` `rag.query` path is repointed to the engine client; (4) the local stack is archived **with** its tests in the same unit (REBUILD-ARCHIVE-POLICY); (5) `tests/retrieval.test.ts` / `-adversarial` / `unit-q-*` archive; (6) the fence pair is re-read (§6) |
| **classification** | **`BLOCKED-ON-ENGINE`** — the engine **has** landed the replacement surface (GR-2/GR-3/GR-5 all landed; `ragQuery`/`ragStream`/status are routed), **but** the local stack cannot be deleted while the fork's local store is the **temporary authority** (`§13.2` **S1**), because the local `ragQuery` is the only reader of the local store's lexical index. The chain's engine leg is **not** fully landed: `U-CORPUS-MIGRATION`'s engine prerequisite (N-12, a record-copy route with caller-supplied ids) is **PARKED on GR-6a's UNDISCHARGED trigger**. **Reason:** elimination is correct, sequencing is gated |

---

### PD-ENG-2 — `src/main/embeddings.ts` (the fork's embedding providers + vector index)

| field | value |
| --- | --- |
| **symbols to eliminate** | `createOllamaEmbedProvider`, `createRemoteEmbedProvider`, `createVectorIndex`, `updateVectorIndex`, `addToVectorIndex`, `removeFromVectorIndex`, `cosineSimilarity`, `createVectorEmbedder`, `parsePositiveIntEnv`, `BATCH_CHUNK_SIZE`, `isOllamaAvailable`, `createMockEmbedder` |
| **what it does today** | the fork's **own** embedding stack: an Ollama provider (`/api/embed`), a remote provider, a content-addressed vector index with batched embed, cosine similarity, and the `Embedder` that the local retrieval engine scores with. Reads `PROVIDENT_EMBEDDING_DIMENSION` / `PROVIDENT_EMBEDDING_TIMEOUT_MS` (set by `scripts/start-app.sh`) |
| **engine route/spec that replaces it** | the engine's **own** embedding provider + vector index, built at boot and made honest — `docs/specs/p2-gnosis-server.md` §9.5.5 (**U5** boot build) and §9.5.6 (**U6** the freshness predicate `vector_index_is_fresh`), plus the `embedding`/`vector` **subsystem flags** derived at read time (`get_engine_status`). The engine's provider config is its **own** env surface (`GNOSIS_SERVER_OLLAMA_URL` / `GNOSIS_SERVER_OLLAMA_MODEL`) |
| **consumer map — `src/**` importers** | `src/main/vector-boot.ts`, `src/main/rag-store-directory.ts`, `src/main/rag-store-default.ts`, `src/main/rag-store-runtime.ts`, `src/main/main.ts` |
| **consumer map — `tests/**` importers** | `tests/embeddings.test.ts`, `tests/embeddings-adversarial.test.ts`, `tests/embeddings-batch.test.ts`, `tests/embeddings-failure-policy.test.ts`, `tests/embeddings-ollama-integration.test.ts`, `tests/vector-boot.test.ts`, `tests/vector-boot-adversarial.test.ts`, `tests/vector-cache.test.ts`, `tests/live-embed-cache.test.ts` |
| **`scripts/**` refs** | `scripts/start-app.sh` sets `PROVIDENT_EMBEDDING_*` (module-adjacent env, not a module reference) |
| **config coupling** | `main.ts` reads the two `PROVIDENT_EMBEDDING_*` vars via `parsePositiveIntEnv`; no build-alias coupling |
| **dependency-ordered change list** | (1) the corpus/authority chain lands; (2) the engine is the vector authority (U5/U6 landed); (3) `vector-boot.ts`'s promotion path is retired; (4) the provider + index modules archive with `tests/embeddings*.test.ts` + `tests/vector-boot*.test.ts`; (5) the `PROVIDENT_EMBEDDING_*` env block in `scripts/start-app.sh` is replaced by the engine's (`GNOSIS_SERVER_*`) — a **launcher** change, and `GN-3` pins the launcher as the spawn owner |
| **classification** | **`BLOCKED-ON-ENGINE`** — the engine's vector stack is **landed and honest** (`U5`/`U6`; §DONE rows), so the fork's duplicate provider/index is redundant *in principle*; but it serves the **local** store's retrieval, and `U-CORPUS-MIGRATION`'s engine leg is **PARKED** (N-12). **Reason:** sequencing, not a missing engine capability — the missing conjunct is the **ingest/record-copy** route, not the vector one |

---

### PD-ENG-3 — `src/main/vector-cache.ts`

| field | value |
| --- | --- |
| **symbols** | `createVectorCache`, `contentHashOf`, `createSingleTextMemoizer`, `CACHE_WRITE_DEBOUNCE_MS` |
| **what it does today** | a **content-addressed on-disk memo** of embedding vectors (`provident-vector-cache.json` in userData, written by `rag-store-default.ts`/`rag-store-directory.ts`), plus a debounced write and a single-text memoizer used by `createVectorEmbedder` at `persistMisses: false` |
| **engine route/spec that replaces it** | the engine **persists its own derived index and its validation key** on disk (D-D1, `docs/specs/durable-store-spec.md`; the M-1…M-6 mismatch table; `docs/specs/dd2-retention-trim-greens.md`), so a fork-side vector cache has no role once the engine owns the corpus and the index |
| **consumer map — `src/**`** | `src/main/rag-store-default.ts`, `src/main/rag-store-directory.ts`, `src/main/vector-boot.ts`, `src/main/embeddings.ts` |
| **consumer map — `tests/**`** | `tests/vector-cache.test.ts`, `tests/live-embed-cache.test.ts` |
| **`scripts/**`** | none |
| **config coupling** | the cache path is hard-coded per store in `rag-store-default.ts` / `rag-store-directory.ts`; no alias |
| **dependency-ordered change list** | follows PD-ENG-2 exactly (it is a child of the fork's embedding stack); archive `tests/vector-cache.test.ts` + `tests/live-embed-cache.test.ts` in the same unit; delete the userData cache-file path from the two store modules' config |
| **classification** | **`BLOCKED-ON-ENGINE`** — same chain and same missing conjunct as PD-ENG-2. **Reason:** the engine's durability **did** land (D-D1), which removes the *durability* objection this file previously had; what remains is the **corpus-migration** gate |

---

### PD-ENG-4 — `src/main/vector-boot.ts`

| field | value |
| --- | --- |
| **symbols** | `createVectorBootController`, `warmUpEmbeddingProvider`, `VECTOR_BOOT_WARMUP_TEXT`, `VectorBootPhase`, `PromotionReport` |
| **what it does today** | the fork's **own boot-time** vector promotion: warm-up embed, a background index build, a `pending → promoted` phase machine, a live-delta reconcile hook, and the teardown cancel |
| **engine route/spec that replaces it** | the engine's **boot vector-index build** (`build_boot_vector_index`, `p2` §9.5.5 / `U5`), the **install-seam epoch invariant** (`compose_boot_indexes` verify-before-install, `U5-INSTALL-SEAM-EPOCH`), the **freshness predicate** (`U6`, §9.5.6), and the **operator-only** repair route `POST /engine/maintenance` (`U5-INDEX-AVAILABILITY`, F2 §14.6). The engine's own `Degraded`/`vector:false`/FS-14 outcomes are pinned |
| **consumer map — `src/**`** | `src/main/main.ts`, `src/main/rag-store-default.ts`, `src/main/rag-store-runtime.ts`, `src/main/retrieval.ts`, `src/main/rag-store-directory.ts` |
| **consumer map — `tests/**`** | `tests/vector-boot.test.ts`, `tests/vector-boot-adversarial.test.ts` (**the latter reads `src/main/embeddings.ts` as source text** — a path pin, §6), `tests/unit-h8-operator-editor.test.ts`, `tests/unit-ms5-settings-listing.test.ts` |
| **`scripts/**`** | `scripts/live-drive.mjs` (boot/vector rows in prose) |
| **config coupling** | reached from the `main` bundle entry only |
| **dependency-ordered change list** | (1) corpus/authority chain; (2) the engine's boot build is the only build (U5/U6 landed); (3) `vector-boot.ts` and its controller archive with `tests/vector-boot*.test.ts`; (4) `releaseDefaultVectorBoot`/`createDefaultVectorBoot` (`src/main/rag-store-default.ts`) go with it — and those two are **path-pinned** by `tests/unit-h8-operator-editor.test.ts`, so the pin must be re-derived first (§6) |
| **classification** | **`BLOCKED-ON-ENGINE`** — **plus one honest caveat:** the engine's own boot build carries an **open availability residual** (`docs/pending.md`: *"the **availability gap** — bounded by a restart … recorded, not closed"*; `U5-ADV-1` stays **OPEN**). So deleting the fork's boot controller would remove a fork-side recovery path **before** the engine's equivalent is complete. **Reason:** blocked on the chain **and** on `U5-ADV-1` |

---

### PD-ENG-5 — `src/main/traversal.ts`

| field | value |
| --- | --- |
| **symbols** | PUBLIC: `buildTraversal`, `computeDocumentSubgraph`, `rebuildBackRefs`, `CROSSLINK_LINK_CONFIG`, `TraversalInput`, `TraversalResult`, `LineNodeMap`, `CrosslinkWiring`, `DocumentSubgraph`. **PRIVATE (not consumable at all): `assignSubtreeRanges`, `renderSubtreeMarkdown`, `renderEnvelopeMarkdown`, `collectSubtreeIds`, `buildInterleavedChildren`, `buildTraversalBody`, `renderTemplateLines`** |
| **what it does today** | the fork's **subtree assembly**: validates doc-flow, walks the adjacency, assigns subtree ranges, re-derives back-refs, renders the subtree markdown, and authors the provident **envelope** (the `TraversalResult` the sidebar panes consume). It is the seam the O-0 stage `traversal.build` instruments |
| **engine route/spec that replaces it** | **NONE.** No engine route computes a subtree, a subtree range, a back-ref set, or rendered markdown; the only graph reads are the paged `GET /wikis/:id/nodes` + `GET /wikis/:id/edges`, which supply **data**, not derivation. The engine's own F2 §14.1 **REFUSES** consumer-shape parity (`markdown`/`lineMap`/`k` are *"canonically final"* against emitting them). **And a standing ruling pins this in-process:** `docs/specs/design-extensions-review.md` §14.2 — *"`buildTraversal` **stays in-process** … the ruling moves **where the data comes FROM**, never where the traversal runs. Its input contract is unchanged."* |
| **consumer map — `src/**`** | `src/renderer/sidebar-panes.ts` (`buildTraversal` — a **value** import, so it is in `dist/renderer`), `src/main/retrieval.ts` (`computeDocumentSubgraph` inside `documentIdsForNode`), `src/main/mcp-server.ts` (`computeDocumentSubgraph` in `rag.get_document`), `src/main/adjacency.ts` (`createSnapshotStore` consumed by `rebuildBackRefs`), `src/main/doc-flow.ts` (`validateDocFlow` consumed by `buildTraversalBody`) — and the type-only consumers `src/renderer/pane-registry.ts`, `src/renderer/pane-graph.ts` |
| **consumer map — `tests/**`** | **23 test files** name `buildTraversal` — among them `tests/traversal.test.ts` (**the §14.2 FENCE — PROTECTED**), `tests/traversal-e2e.test.ts`, `tests/import-render-no-duplicates.test.ts` (**the second FENCE — PROTECTED**), `tests/unit-v2-scoped-traversal-mcp.test.ts` + `-adversarial` + `tests/blind-unit-v2-scoped-traversal-mcp-greens.test.ts`, `tests/unit-r-traversal-inline-children.test.ts`, `tests/sidebar-panes*.test.ts` (3), `tests/template.test.ts`, `tests/unit-v3-doc-heads-docnav*.test.ts`, `tests/blind-unit-v3-doc-heads-docnav-greens.test.ts`, `tests/unit-ms5-settings-listing.test.ts`, `tests/unit-h8-operator-editor.test.ts`, `tests/unit-u-shell-9b-*` (4), `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`, `tests/single-editable-surface.test.ts`, `tests/edit-adversarial.test.ts`, `tests/lookback-adversarial.test.ts`, `tests/page-editor-host.test.ts`, `tests/page-diff-production-commit.test.ts`, `tests/crosslink-backlink.test.ts`. `computeDocumentSubgraph`: only `tests/unit-v2-scoped-traversal-mcp.test.ts` + `-adversarial` name it. `rebuildBackRefs`: `tests/integration-adversarial.test.ts` + `tests/unit-r-traversal-inline-children.test.ts` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` — **cites the path and the stage name**: the O-0 seam map carries `'traversal.build': 'buildTraversal'` and names `src/main/traversal.ts` as the instrumented seam of that stage. **A prose/harness coupling on a path** |
| **config coupling** | reachable from the **renderer** entry (`renderer.ts → sidebar-panes.ts`) **and** the main bundle — a dual-bundle value import |
| **dependency-ordered change list** | **THIS CANDIDATE HAS NO ELIMINATION ORDER.** A rebuild that intends to delete it must first (a) take a **gate ruling** to amend §14.2's `buildTraversal`-stays-in-process pin — *"a unit that 'adjusts' the fence is **re-entering this gate**"* (§11.1 item 5, §14.2 **S3**); (b) rewrite `tests/unit-o-0-hook-contract.test.ts`'s **source-text pin** on the file (§6); (c) rewrite `scripts/live-drive.mjs`'s O-0 seam map; (d) re-derive the two **fence** tests. **What IS independently deletable is the dead-export subset:** `rebuildBackRefs` has **zero `src/**` callers** and `CROSSLINK_LINK_CONFIG` has **zero `src/**` consumers** — both are export-only, consumed by tests alone, and neither is an engine-offloaded function. `assignSubtreeRanges`/`renderSubtreeMarkdown` are **not exported at all**, so nothing can consume or delete them separately |
| **classification** | **`NOT-IN-SCOPE`** — pinned in-process by a standing ruling, path-pinned by a test **and** cited by the live driver, and **replaced by no engine route**. The dead-export subset (`rebuildBackRefs`, `CROSSLINK_LINK_CONFIG`) is a **hygiene** deletion, **not** an engine offload, and is not this rebuild's charter. **Reason:** the engine owns the **data source**, never the traversal |

---

### PD-ENG-6 — `src/main/adjacency.ts`

| field | value |
| --- | --- |
| **symbols** | `buildAdjacencyIndex`, `edgesFromIndex`, `edgesToIndex`, `edgesByKindIndex`, `edgesForDocumentIndex`, `docHeadForDocumentIndex`, `createSnapshotStore`, `deepCopy`, `DANGEROUS_KEYS`, `RAG_EDGE_KINDS`, `AdjacencyIndex`, `requireNonEmptyString` |
| **what it does today** | the **pure** adjacency index (no `node:fs`, deliberately renderer-safe) that answers the entire `edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/`docHeadForDocument` family, plus `createSnapshotStore` — a read-only in-memory `RagStore` the renderer builds from an IPC snapshot |
| **engine route/spec that replaces it** | **the read half has no route.** N-10: the only edge read on the wire is the wiki-wide paged `GET /wikis/:id/edges`; the per-node `edgesFrom`/`edgesTo`/`edgesByKind` queries are **lib-visible and unrouted**, and the community/traversal read class is **REFUSED, not parked** (N-5). So the engine can supply the **edges**, never the **index** |
| **consumer map — `src/**`** | `src/main/rag-store.ts` (re-exports the whole helper set; the JSON store's adjacency methods delegate to the `*Index` helpers), `src/main/traversal.ts` (`createSnapshotStore` in `rebuildBackRefs`), `src/renderer/sidebar-panes.ts` (`createSnapshotStore` in `buildTraversalEnvelope`) |
| **consumer map — `tests/**`** | the `*Index`/`deepCopy`/`RAG_EDGE_KINDS` surface: `tests/unit-v1-store-adjacency.test.ts`, `tests/unit-v1-store-adjacency-adversarial.test.ts`, `tests/blind-unit-v1-store-adjacency-greens.test.ts` (all three via the `rag-store.ts` re-export). `createSnapshotStore`: **23 files** — incl. `tests/sidebar-panes*.test.ts` (3), `tests/unit-v3-doc-heads-docnav*.test.ts` (2 + 1 blind), `tests/unit-ud4-doc-heads-tree-adversarial.test.ts`, `tests/blind-unit-ud4-doc-heads-tree-greens.test.ts`, `tests/blind-unit-ud5-list-documents-tool-greens.test.ts`, `tests/unit-ms5-settings-listing.test.ts`, `tests/unit-h8-operator-editor.test.ts`, `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`, `tests/unit-defect-resolution.test.ts`, `tests/edit-adversarial.test.ts`, `tests/crosslink-backlink.test.ts`, `tests/page-editor-host.test.ts`, `tests/page-commit-failure-visibility.test.ts`, `tests/page-commit-scope-ack-race.test.ts`, `tests/page-commit-tab-ownership.test.ts`, `tests/unit-stage-active-tab-display*.test.ts` (4), `tests/stage-active-tab-display-adversarial.test.ts`, `tests/unit-u-shell-9b-*` |
| **`scripts/**`** | none |
| **config coupling** | none; dual-bundle (renderer value + main via `traversal.ts`) |
| **dependency-ordered change list** | (1) the read model lands (`U-READS-PIVOT`); (2) the paged node/edge reads are consumed through the client + a bounded cache (`SHELL-2`, the **consumer obligation owed upstream** per `GNOSIS-ASYNC-CONSUMPTION-AUTHORITY`); (3) `createSnapshotStore`'s **input** changes from the local IPC snapshot to the engine-backed cache; (4) `buildAdjacencyIndex` and the `*Index` helpers **stay** as the client-side index (there is nothing to replace them with) |
| **classification** | **`PARTIALLY-SHARED-KEEP`** — the engine replaces the **edges' provenance**, never the index. **Reason:** no route computes adjacency; the per-node edge queries are routed **nowhere** and the read class is refused |

---

### PD-ENG-7 — `src/main/backlinks.ts`

| field | value |
| --- | --- |
| **symbols** | `enumerateLinks`, `listBacklinks`, `listOutlinks`, `documentOf`, `LinkEntry`, `BacklinkResult`, `LinkScope` |
| **what it does today** | computes cross-document / intra-document / unscoped **backlink and outlink sets** for a node, over the store's crosslink edges, and scopes them by document ownership |
| **engine route/spec that replaces it** | **NONE.** The engine's `GRAPH-OWNS-RELATION-AND-MERGE` decision makes the engine the owner of **relation** facts, but the **read** surface for them is closed: F2 §14.4 clause 4(a) + `docs/specs/a2-override-routes-spec.md` §10 clause 4(a) — *"no read route returns provenance: the traversal/community reads … are **lib-visible and deliberately UNROUTED** — the route surface is closed."* `enumerateLinks` is therefore a **client-side derivation over data** the engine can only supply in bulk |
| **consumer map — `src/**`** | **one** consumer: `src/main/mcp-server.ts` (the `rag.backlinks` IPC handler + the tool handler). `BacklinkResult` is additionally imported as a **type** by `src/shared/types.ts` (as `RagBacklinksResult`), `src/main/mcp-server.ts`, `src/renderer/pane-graph.ts`, `src/renderer/sidebar-panes.ts` |
| **consumer map — `tests/**`** | `tests/sidebar-panes.test.ts`, `tests/sidebar-panes-host.test.ts`, `tests/sidebar-panes-adversarial.test.ts`, `tests/crosslink-backlink.test.ts`, `tests/unit-v3-doc-heads-docnav.test.ts` + `-adversarial` + `tests/blind-unit-v3-doc-heads-docnav-greens.test.ts`, `tests/unit-ms5-settings-listing.test.ts`, `tests/unit-h8-operator-editor.test.ts`, `tests/unit-live8-toolbar-undo-refresh.test.ts`, `tests/unit-u-parity-c18-advanced-search.test.ts`, `tests/unit-u-parity-c19-hover-preview.test.ts`, `tests/unit-u-parity-docnav.test.ts` |
| **`scripts/**`** | none |
| **config coupling** | none; main bundle via `mcp-server.ts` |
| **dependency-ordered change list** | (1) `U-READS-PIVOT`'s cache carries the crosslink edges; (2) `enumerateLinks` is **re-sourced**, not deleted; (3) `documentOf`/`listBacklinks`/`listOutlinks` have **zero external `src` callers** (internal + tests only) — a dead-export subset, deletable independently of any engine change |
| **classification** | **`PARTIALLY-SHARED-KEEP`** — **re-source the data, keep the derivation.** A **fork-side adoption unit** is what this needs (the landed routes do not cover it), not an elimination. **Reason:** the read route the fork needs is explicitly **REFUSED** as a closed surface |

---

### PD-ENG-8 — `src/main/doc-flow.ts`

| field | value |
| --- | --- |
| **symbols** | `validateDocFlow`, `DocFlowVerdict` |
| **what it does today** | validates a document's **shape** — the fork's doc-flow verdict over a node/edge set — and is called by `buildTraversalBody` and by `markdown-import.ts` per document |
| **engine route/spec that replaces it** | **the engine has no doc-flow route today.** `GR-6` asked the engine to own *"the **PARSE** + doc-flow **VALIDATE** + **APPLY**"*, and Gnosis's gate record **PARKED** it: `docs/pending.md` GR-6a — *"PARKED … the requested contract is self-contradictory"*; `docs/specs/gnosis-grq-inbound-review.md` §11 — *"the engine's text governs; the trigger is **UNDISCHARGED**"* |
| **consumer map — `src/**`** | `src/main/traversal.ts` (`buildTraversalBody`), `src/main/markdown-import.ts` (per-document verdict) |
| **consumer map — `tests/**`** | `tests/doc-flow.test.ts` (the only file whose subject it is), `tests/unit-t-markdown-parse.test.ts`, `tests/unit-v2-scoped-traversal-mcp.test.ts` + `-adversarial`, `tests/blind-unit-v2-scoped-traversal-mcp-greens.test.ts` |
| **`scripts/**`** | none |
| **config coupling** | main bundle via `traversal.ts` / `markdown-import.ts` |
| **dependency-ordered change list** | (1) **GR-6a's trigger must be discharged** — an accepted engine spec resolving **one-commit-vs-chunked** + a **cap** + a **§11 fail-state allocation** (`docs/pending.md` GR-6a); (2) then a fork-side unit repoints the import path to the engine's ingest route; (3) `tests/doc-flow.test.ts` archives in that unit; (4) `tests/unit-v2-*` re-derive (they assert the scoped traversal, not doc-flow) |
| **classification** | **`BLOCKED-ON-ENGINE`** — **and the block is the strongest in this file's set:** the engine's ingest route is **PARKED with an UNDISCHARGED trigger**, the `{files:[paths]}` variant is **REJECTED**, and there is *"no commit-batching primitive"* on the engine side at all. **Reason:** the replacing capability does not exist and its park cannot be fired from the fork |

---

### PD-ENG-9 — `src/main/merge-store-results.ts`

| field | value |
| --- | --- |
| **symbols** | `mergeStoreResults`, `StoreResultInput` |
| **what it does today** | the fork's **cross-store fan-out** (`stores:"all"`): a rank-based interleave of per-store result sets, driven by the multi-store registry |
| **engine route/spec that replaces it** | **NONE.** The engine serves **one** store per server; there is no multi-store route, no cross-wiki fan-out route, and no `stores` parameter on the wire (F2 §4.5's 14 option keys carry `wikiId`, not a store list). The fork-side registry (`src/main/rag-store-registry*.ts`, `module-store.ts`) is a **host** concept with no engine counterpart |
| **consumer map — `src/**`** | `src/main/mcp-server.ts` (both `stores:"all"` paths), `src/main/retrieval.ts` (`qualifyStoreResult`'s param type) |
| **consumer map — `tests/**`** | `tests/unit-f1-merge-store-results.test.ts`, `tests/unit-f2-result-qualification.test.ts` |
| **`scripts/**`** | none |
| **config coupling** | main bundle via `mcp-server.ts` |
| **dependency-ordered change list** | (1) decide the fork's store model under `GN-1` (**does the fork still have >1 store, or is the engine's wiki the unit?**) — that is `U-AUTHORITY-SWITCH`'s registry work, **not** an engine delegation; (2) only then does the fan-out have or lack a subject |
| **classification** | **`NOT-IN-SCOPE`** — *for the engine-delegation half*. The engine has no route for it and its model (one store per server) does not express the fork's registry. **A note for the drift-map's owner:** the *registry* half is `U-AUTHORITY-SWITCH`'s, and that unit **re-derives** the registry suites (`docs/next-steps.md` §OPEN item 3 names 17 suites) — so the fan-out's fate is decided there, not here |

---

### PD-ENG-10 — `src/main/query-audit.ts`

| field | value |
| --- | --- |
| **symbols** | `createQueryAuditLog`, `QueryAuditEntry`, `QueryAuditLog` |
| **what it does today** | the fork's **in-memory, bounded** query audit ring (`maxEntries`) used by the MCP/RAG surface |
| **engine route/spec that replaces it** | **NONE.** The engine has `get_query_audit_log` at the **lib level only** — it is **NOT routed** (§1's retrieval table), and it is **non-durable** by decision (`docs/decisions.md` `F6-EVAL-RE-SCOPED`). The engine's own audit trail is **not** a wire surface |
| **consumer map — `src/**`** | `src/main/main.ts` (direct), type-only `src/main/mcp-server.ts` |
| **consumer map — `tests/**`** | `tests/unit-gn-mcp-ui-wiring.test.ts`, `tests/unit-a2-document-crud-wiring.test.ts`, `tests/unit-x-rag-provenance-traversal.test.ts`, `tests/unit-f3-stores-all-schema.test.ts`, `tests/blind-unit-ud5-list-documents-tool-greens.test.ts` |
| **`scripts/**`** | none |
| **config coupling** | main bundle |
| **dependency-ordered change list** | none available — a repoint would first need a **route** the engine does not expose and whose absence is not filed as a fork ask |
| **classification** | **`NOT-IN-SCOPE`** — no route, and the engine's audit log is explicitly non-durable. **Reason:** an unrouted lib accessor is not an offload target |

---

### PD-ENG-11 — `src/main/authority-store.ts` + `src/main/idempotency-registry.ts`

| field | value |
| --- | --- |
| **symbols** | `createAuthorityStore`, `AuthorityStore` · `createIdempotencyRegistry`, `IdempotencyRegistry` |
| **what each does today** | the fork's **authority mapping** (which operator/caller may mutate) and its **idempotency registry** (de-duping retried mutations). The authority store is precisely the *"empty authority mapping"* whose fail-closed behaviour produced the error `GR-9` filed |
| **engine route/spec that replaces it** | **NONE — and this is a REFUSAL, not a park.** `GR-9` was **REJECTED as an engine deliverable**: *"C5 + decision `GNOSIS-RBAC-EDIT-ENFORCEMENT` place the authorization gate in the **SHELL**"*, and *"**Do NOT author an engine authority contract.**"* The engine remains *"an **authorizing** nobody"* — it authenticates transport (AUTH) and drops `caller` before dispatch. F2 §14.4 clause 4(d): *"no rank arbitration exists, nothing is refused for a low rank, and no authority error code exists."* The idempotency registry has no engine route either |
| **consumer map — `src/**`** | `authority-store.ts`: `src/main/main.ts` (direct), type-only `src/main/mcp-server.ts`. `idempotency-registry.ts`: `src/main/main.ts` (direct), type-only `src/main/mcp-server.ts` |
| **consumer map — `tests/**`** | both: `tests/unit-a2-document-crud-wiring.test.ts` + `tests/blind-unit-a2-document-crud-wiring-greens.test.ts` (both via **dynamic** `import(...)`) |
| **`scripts/**`** | `scripts/live-drive.mjs` exercises the `PROVIDENT_OPERATOR_CREDENTIAL` gate in its gnosis rows (prose) |
| **config coupling** | `main.ts` direct construction |
| **dependency-ordered change list** | **KEEP.** The one thing that *changed* on the engine side is that the four `POST /graph/…` routes now require an `authorship` argument (`declaration`/`system`) — an engine-side **presence + equality** guard, *"no new variant, no new row"*, **not** rank arbitration. The fork's authority store remains the **only** policy gate |
| **classification** | **`NOT-IN-SCOPE`** — **the engine's refusal makes this file MORE load-bearing, not less.** Deleting it would delete the fork's only mutation-authorization gate. **Reason:** `GR-9` REJECT; RBAC stays shell-side |

---

### PD-ENG-12 — `src/main/engine-rag-store.ts` (the retrieval/health client)

| field | value |
| --- | --- |
| **symbols present** | `ENGINE_ENDPOINTS` (**3** rows), `createEngineRagStore`, `createSseClient`, `decodeEnvelope`, `decodeRagResult`, `decodeChunk`, `decodeError`, `decodeHealthReport`, `parseSseFrame`, `decodeSseChunk`, `wireCodeToError`, `ENGINE_HTTP_STATUS`, the `EngineWireError`/`EngineUnavailable`/`EngineError`/`TraceUnavailable`/`ConflictError` classes, and the `EngineRagResult`/`HealthReport`/`RagChunk`/`Envelope` types |
| **what it does today** | the fork's **wire client for the retrieval trio + health**, with decode-then-validate, the 21-row HTTP-status map, the SSE frame parser, and the typed error model that `engine-transport.ts` and `engine-crud-rag-store.ts` **import rather than redefine** |
| **what the engine's landed surface adds that this module lacks** | (a) **`durability` on `HealthReport`** — the engine's `HealthReport` is now **7** top-level keys (`src/wire/status.rs`; values `"durable" \| "in-memory" \| "disabled"`, a **read-time projection**); the fork's type has **no such field** and `decodeHealthReport` is **total over its known keys**, so the signal is decoded-and-discarded; (b) the **AUTH Bearer hand-over** (the engine hands a 64-hex token over stdout before the bind; the fork has no seam that reads it — only `engine-transport.ts` `headers()` can *send* one); (c) the four `POST /graph/…` routes and the three U4 routes, which have **no client at all** |
| **consumer map — `src/**`** | `src/main/main.ts` (direct), `src/main/preload.ts`, `src/main/mcp-server.ts`, `src/main/engine-crud-rag-store.ts`, `src/main/engine-transport.ts` (**a pinned import cycle**: `engine-transport` imports `EngineWireError`/`EngineUnavailable` back), `src/renderer/pane-graph.ts`, `src/renderer/gnosis-panes.ts`, `src/renderer/renderer.ts` (inline dynamic import of `HealthReport`) |
| **consumer map — `tests/**`** | `tests/unit-gn-engine-integration.test.ts`, `tests/blind-unit-gn-engine-integration-greens.test.ts`, `tests/unit-gn-mcp-ui-wiring.test.ts`, `tests/blind-unit-gn-mcp-ui-wiring-greens.test.ts`, `tests/unit-shell-integration.test.ts`, `tests/props-shell-integration.test.ts`, `tests/blind-unit-shell-integration-greens.test.ts`, `tests/unit-a1-crud-routing-proxy.test.ts`, `tests/props-a1-crud-routing-proxy.test.ts`, `tests/unit-a2-document-crud-wiring.test.ts`, `tests/props-a2-document-crud-wiring.test.ts`, `tests/blind-unit-a2-document-crud-wiring-greens.test.ts`, `tests/engine-crud-real-transport.test.ts`, `tests/unit-f3-stores-all-schema.test.ts`, `tests/page-commit-failure-visibility.test.ts`, `tests/blind-unit-ud6-query-document-filters-greens.test.ts` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` drives the `gnosis.status`/`gnosis.query`/`gnosis.wiki.list`/`gnosis.document.*`/`gnosis.stream` tool surfaces and cites the module for the `HealthReport`/D2 error shape |
| **config coupling** | dual-bundle: the renderer receives `ConflictError` as a **value** via `pane-graph.ts`/`gnosis-crud-panes.ts` |
| **dependency-ordered change list** | (1) **adopt `durability`** into the `HealthReport` type + `decodeHealthReport` (additive; the engine's F2 §9 permission already allows it) — a **fork-side client unit**, no engine change; (2) add the **AUTH token hand-over** seam — a **launcher-owned** read of the engine's stdout line (`GN-3` makes the launcher the spawn owner), then thread it into `createEngineFetch`/`createCrudFetch`; (3) add the four `/graph/…` + three U4 routes' clients (or their own module); (4) then the REWRITE set of §6 lands |
| **classification** | **`PARTIALLY-SHARED-KEEP` — and GROW.** It is the fork's half of the division; it is **never** an elimination. **Reason:** five landed engine capabilities have **no fork-side seam** (§1's table) — each is a **fork-side adoption unit** |

---

### PD-ENG-13 — `src/main/engine-crud-rag-store.ts` (the CRUD client)

| field | value |
| --- | --- |
| **symbols present** | `createEngineCrudRagStore` (the **11-method** proxy), `ENGINE_CRUD_ENDPOINTS` (**11** rows), `encodeCrudRequest`, `decodeCrudRequest`, `validateCrudResult`, `decodeCrudResponse`, and the `Document`/`DocumentList`/`Wiki`/`*Args`/`CrudMethod`/`CrudResult`/`CrudValidationFailure` types |
| **what it does today** | the fork's **document-CRUD wire client** over the frozen P1a shapes: encode request envelope → decode response envelope → **decode-then-validate** → typed error; RBAC `caller` threading (7 mutating methods require it, 4 read-only carry none); a fresh `getEngineStatus` READY gate per call; the loopback `baseUrl` enforcement; and a bounded opt-in retry |
| **what the engine's landed surface adds that this module lacks** | the **folded mutating payload**: the engine now emits `{method, resultVersion: 2, result, commitToken}` for the **7** mutating methods (`src/wire/crud.rs` `RESULT_VERSION_TOKENED`, `is_mutating`, `encode_crud_response_with_token`, `decode_crud_response_versioned`). The fork's `decodeCrudResponse` requires **exactly one of `result`/`error`** and **never checks `resultVersion`**; `grep -rn "resultVersion\|commitToken" src/ tests/` returns **nothing**. So the fork **silently accepts a versioned payload as unversioned** and **discards the commit token** — the very token the engine's `ENGINE-COMMIT-TOKEN` / `DURABLE-STORE-LANDED` decisions make the restore-semantics handle |
| **consumer map — `src/**`** | `src/main/main.ts` (direct), `src/main/mcp-server.ts`, `src/renderer/pane-graph.ts`, `src/renderer/gnosis-crud-panes.ts` |
| **consumer map — `tests/**`** | `tests/unit-a1-crud-routing-proxy.test.ts`, `tests/props-a1-crud-routing-proxy.test.ts`, `tests/unit-a2-document-crud-wiring.test.ts`, `tests/props-a2-document-crud-wiring.test.ts`, `tests/blind-unit-a2-document-crud-wiring-greens.test.ts`, `tests/unit-shell-integration.test.ts`, `tests/props-shell-integration.test.ts`, `tests/blind-unit-shell-integration-greens.test.ts`, `tests/engine-crud-real-transport.test.ts` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` (the gnosis CRUD rows) |
| **config coupling** | main bundle (direct); the wire types are re-imported by the renderer |
| **dependency-ordered change list** | (1) adopt `resultVersion` + `commitToken` in the decoder and the result type (a **fork-side client unit** — the engine's fold already landed); (2) decide what the token is *for* on the fork side (the engine pins its scope: **restore semantics**, `ENGINE-COMMIT-TOKEN`; the fork's parked `U-AUTHORITY-SWITCH` is where a commit contract belongs, and `docs/specs/design-extensions-review.md` §12.7(a) rules that **only the `WHOLE-PAGE-EDITING` unit may restate the commit contract**); (3) then the REWRITE set of §6 lands |
| **classification** | **`PARTIALLY-SHARED-KEEP` — and GROW, with a named hazard.** The **silent-acceptance** of `resultVersion: 2` is a live drift risk: a future fold to `resultVersion: 3` would be read as if unversioned. This is a **defect-class finding for the rebuild's tracker pass**, not an elimination. **Reason:** the client is the fork's half; it must adopt, not vanish |

---

### PD-ENG-14 — `src/main/engine-transport.ts` (+ `src/main/engine-config.ts`)

| field | value |
| --- | --- |
| **symbols** | `isLoopbackHost`, `assertLoopback`, `transportError`, `createEngineFetch`, `createCrudFetch`, `fetchWithTimeout`, `headers` · `createEngineConfigStore`, `setEngineConfigBaseUrl`, `getEngineConfigBaseUrl`, `EngineConfig` |
| **what each does today** | the fork's transport layer: the loopback assertion, the undici-dispatcher TLS application (`auth.tls` `{ca,cert,key}`), the `authorization: Bearer <token>` header when a token is supplied, an abort-timeout fetch, and the per-store engine base-url config store (read from `PROVIDENT_ENGINE_BASE_URL`/`provident-engine-config.json` by the launcher) |
| **what the engine's landed surface adds** | (a) the **AUTH hand-over** (`src/auth.rs`: the 64-hex token on the child's stdout **before the bind**) — the fork's `headers()` can send a Bearer token but **nothing reads the engine's declared one**; (b) the engine now **owns the store path** (`GNOSIS_SERVER_STORE_PATH`, D-D1 §8A.2 C-1…C-4) — so the fork's config store must give up any writer-ownership assumption (`docs/HANDOFF.md` carries the replacement upstream row: *"the engine owns the durable store and its format; the shell adopts the interface + configuration surface and drops its writer-ownership assumption"*) |
| **consumer map — `src/**`** | `engine-transport.ts`: `src/main/engine-rag-store.ts`, `src/main/engine-crud-rag-store.ts` (its **only** consumers). `engine-config.ts`: `src/main/main.ts`, `src/main/mcp-server.ts` |
| **consumer map — `tests/**`** | `engine-transport.ts`: `tests/unit-shell-integration.test.ts`, `tests/props-shell-integration.test.ts`, `tests/blind-unit-shell-integration-greens.test.ts` (all **dynamic imports** — the only three). `engine-config.ts`: named by the shell-integration/ms5 suites |
| **`scripts/**` refs** | `scripts/start-app.sh` sets `PROVIDENT_ENGINE_BASE_URL` and reads `provident-engine-config.json`; `scripts/live-drive.mjs` references the D2 engine-absent path in prose |
| **config coupling** | **not** imported by `main.ts`/`standalone.ts` directly — reached only through the two proxies |
| **dependency-ordered change list** | (1) the launcher reads the engine's stdout token line and passes it in (launcher-owned per `GN-3`); (2) `createEngineFetch`/`createCrudFetch` thread it; (3) the config store's `baseUrl` half stays, its store-path half is retired in favour of `GNOSIS_SERVER_STORE_PATH`; (4) the three shell-integration suites re-derive |
| **classification** | **`PARTIALLY-SHARED-KEEP` — and GROW.** **Reason:** AUTH landed engine-side with **no fork-side token source**; the adoption is a fork-side unit |

---

### PD-ENG-15 — `src/main/rag-store.ts` + the `rag-store-*.ts` family + `src/main/module-store.ts`

| field | value |
| --- | --- |
| **symbols** | `src/main/rag-store.ts`: `createJsonRagStore`, the **22-member `RagStore` interface** (13 synchronous reads + 9 async: `getNode`/`listNodes`/`getEdge`/`listEdges`/`status`/`journal`/`undoDepth`/`redoDepth`/`edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/`docHeadForDocument` — `putNode`/`removeNode`/`putEdge`/`removeEdge`/`applyBatch`/`undo`/`redo`/`teardown`), the `BatchOp`/`BatchResult`/`JournalEntry`/`RagNode`/`RagEdge` types, and its **re-export of the whole `adjacency.ts` helper set**. Plus `rag-store-registry.ts`, `rag-store-registry-write.ts`, `rag-store-directory.ts`, `rag-store-default.ts`, `rag-store-remove.ts`, `rag-store-runtime.ts`, `module-store.ts` |
| **what it does today** | the fork's **entire local document/graph store**: the JSON persistence file (`provident-rag.json` in userData), the single-writer queue, the atomic full-store write, the journal with undo/redo, batch application, the store registry + hot-apply runtime, and the module registry |
| **engine route/spec that replaces it** | **the whole 11-route P1a CRUD family + all four `POST /graph/…` mutations + `GET /wikis/:id/nodes`/`edges` + `GET /changes`.** This is the division's centre of gravity: `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (`GN-1`) **supersedes** `RAG-AUTHORITATIVE` / `SINGLE-WRITER-STORE` / `SINGLE-WRITER-STORE-PER-STORE`, and the engine now **owns the durable store and its format** (D-D1/D-D2 landed; the O-8 conjunct made **MOOT** by the user's *"The shell doesn't own it."*). The engine's own `undo` equivalent is **absent** (N-4) — `GET /changes` is a feed, not an undo |
| **consumer map — `src/**`** | **~31 direct importers** (this pass's grep reading), among them every store module in the family plus `main.ts`, `mcp-server.ts`, `edit-ops.ts`, `markdown-import.ts`, `markdown-parse.ts`, `page-diff.ts`, `paste-sanitize.ts`, `rich-decompose.ts`, `preload.ts`, `adjacency.ts`, `backlinks.ts`, `doc-flow.ts`, `retrieval.ts`, `embeddings.ts`, `traversal.ts`, `vector-boot.ts`, `engine-rag-store.ts` (types), `src/shared/types.ts`, `src/renderer/cross-document-shared.ts`, `src/renderer/sidebar-panes.ts` |
| **consumer map — `tests/**`** | **~55 test files** (the broadest fan-in in the repo) — `docs/specs/design-extensions-review.md` §14.3 records the wider reading: ***"~120 of 221 test files import the data layer directly (259 direct import statements)"*** over `src/main/{rag-store,retrieval,traversal,adjacency,doc-flow,edit-ops,markdown-import,merge-store-results,engine-rag-store,engine-crud-rag-store}` — *"an approximation, never a census claim"*. Two of them are **PROTECTED** by path/contract: `tests/unit-v5-migration-contract.test.ts` (reads `src/main/markdown-import.ts`) and `tests/unit-import-batch-persist-contract.test.ts` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` (the store's corpus census + the fence); `scripts/start-app.sh` (`--corpus-root`) |
| **config coupling** | the store path is constructed in `rag-store-default.ts`/`rag-store-directory.ts` and by `main.ts`; no build alias |
| **dependency-ordered change list** | **THIS IS THE CHAIN, IN ORDER — `docs/specs/design-extensions-review.md` §13.1 P2 + §13.2 S1/S4 + §14.1 C-1, and `docs/next-steps.md`'s P2 block:** `U-ENGINE-PERSIST` → `U-AUTHORITY-SWITCH` → `U-CORPUS-MIGRATION` → `U-READS-PIVOT`, with the §14.2 fence plan landing **with** `U-READS-PIVOT`. Then, per unit, the §6 dispositions; then the journal/undo half is a **named open question** (the engine has no undo — N-4). **Nothing cuts over before those land** (§13.2 **S4**: *"the prerequisites are gates, not tails"*) |
| **classification** | **`BLOCKED-ON-ENGINE`** — **and this is the load-bearing one.** It is the *correct* elimination (the engine owns the durable corpus and the CRUD surface, and `GN-1` supersedes the single-writer store), and it is **gated twice**: (a) the fork's own chain, whose **engine leg is not complete** — `U-CORPUS-MIGRATION` needs a **record-copy route with caller-supplied ids** that is **PARKED** (N-12, GR-6a) and `U-ENGINE-PERSIST`'s ingest half needs **GR-6a** too; and (b) the **sunset rule S1** with the corpus-loss condition **C-1** (*"the operator corpus is **226 documents / 6 102 nodes / 9 266 edges** … **LOST at the next restart**"*) — the least reversible action in the whole program. **Reason:** correct elimination, hard-gated |

---

### PD-ENG-16 — `src/main/markdown-import.ts` + `src/main/markdown-parse.ts`

| field | value |
| --- | --- |
| **symbols** | `markdown-import.ts`: the production importer — the batch builder + the **ONE `applyBatch`** call + `MAX_IMPORT_FILES`; `markdown-parse.ts`: `parseMarkdown`; plus `src/main/import-directory.ts` and `src/main/edit-ops.ts` as satellites |
| **what it does today** | parses markdown (files + directory expansion), validates doc-flow per document, and applies the corpus as **ONE atomic `applyBatch`** with a **512-file fail-loud cap** and a one-shot `IPC_IMPORT_RESULT` |
| **engine route/spec that replaces it** | **NONE — PARKED with an UNDISCHARGED trigger.** `GR-6` asked for `POST /import` with engine-owned PARSE + doc-flow VALIDATE + APPLY, atomicity, a cap, progress/cancel and per-document `path`. Gnosis: *"CONFIRMED absent (no parser, no route, no batch primitive …)"*; the `{files:[paths]}` variant is **REJECTED**; the `path` half **collides with the FROZEN P1a `Document` body** (`P-IM-2`); and the one-commit-vs-chunked contradiction is **unresolved** |
| **consumer map — `src/**`** | `main.ts`, `mcp-server.ts`, `edit-ops.ts`, `import-directory.ts`, `doc-flow.ts` |
| **consumer map — `tests/**`** | `tests/unit-t-markdown-import.test.ts`, `tests/unit-t-markdown-parse.test.ts`, `tests/batch-atomicity.test.ts`, `tests/import-render-no-duplicates.test.ts` (**FENCE — PROTECTED**), `tests/unit-import-batch-persist-contract.test.ts`, `tests/unit-v5-migration-contract.test.ts` (**PROTECTED — reads this file as source text**), `tests/loadbatch.test.ts`, `tests/loadbatch-adversarial.test.ts`, `tests/unit-u-import-1-import-surface.test.ts`, `tests/blind-unit-ud3-import-path-id-scheme-greens.test.ts` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` drives the `edit.import_markdown` live path; `scripts/start-app.sh` has `--corpus-root` |
| **config coupling** | `MAX_IMPORT_FILES = 512` is a module literal; the importer's batch-op **order** (all `putNode` before all `putEdge`) is asserted as a source contract |
| **dependency-ordered change list** | **NOT AVAILABLE.** `docs/pending.md` GR-6a's trigger is a **single conjunctive sentence** — *"an accepted spec resolving one-commit-vs-chunked + a cap + a §11 fail-state allocation"* — and Gnosis records it **UNDISCHARGED**; `GRQ-5`/`GRQ-6`'s re-filing *"resolves neither half"*. **The fork cannot fire this trigger.** A second gate applies even if it fires: `src/main/markdown-import.ts` is **path- and content-pinned** by `tests/unit-v5-migration-contract.test.ts` (§6) |
| **classification** | **`BLOCKED-ON-ENGINE` + `PROTECTED`** (the second label governs the file today). **Reason:** the replacing route does not exist, its trigger cannot be fired from the fork, and the file is immovable without rewriting its pinning test |

---

### PD-ENG-17 — `src/renderer/cross-document-shared.ts`

| field | value |
| --- | --- |
| **symbols** | `ownersFor`, `isShared`, `buildOwnersMap`, `detectSharedCommit`, `planFork`, `planMutateAll`, `scopeDocumentIds`, `plainRagId`, `applySharedSubtreeDecoration`, `ownersBoxContent`, `sharedCommitStripContent`, `sharedCommitNoticeContent`, and the `SHARED_COMMIT_*` ids/handlers |
| **what it does today** | the fork's **cross-document shared-node** behaviour: an owners map over the crosslink edges, a shared-commit detection with a fork/mutate-all choice, the rendered commit strip/notice, and the document-namespace scoping |
| **engine route/spec that replaces it** | **NONE.** Cross-document sharing is a fork-side **ownership presentation** concept over crosslink edges; the engine's `GRAPH-OWNS-RELATION-AND-MERGE` makes it the owner of the **relation**, and its provenance read is **UNROUTED** (N-5). There is no engine route for `ownedNodeIds`/`owners`, and the `RagSnapshotPayload` node field `ownedNodeIds` is a **fork** contract (`docs/specs/design-extensions-review.md` §14.4) |
| **consumer map — `src/**`** | **one** module consumes all of these: `src/renderer/sidebar-panes.ts`. `plainRagId` additionally: `src/renderer/sidebar-panes.ts`, `src/renderer/content-reconcile.ts`. **`ownersBoxContent` + the whole `SHARED_COMMIT_*` id/handler set have ZERO external `src` references** (internal + tests only) |
| **consumer map — `tests/**`** | `tests/unit-u-shell-9b-cross-document-shared.test.ts`, `tests/props-cross-doc-shared.test.ts`, `tests/unit-u-shell-9b-blind-greens.test.ts`, `tests/unit-u-shell-9b-h1-optionc-interception.test.ts`, `tests/unit-u-shell-9b-h2-c20-materialization.test.ts`, `tests/unit-u-shell-9b-h3-doc-namespace.test.ts`, `tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts`, `tests/props-reconcile-1a.test.ts` |
| **`scripts/**`** | none |
| **config coupling** | renderer bundle only; `SHARED_COMMIT_STRIP_ID` etc. are envelope ids consumed by `pane-graph.ts`'s assembly |
| **dependency-ordered change list** | none available for an engine offload; the dead-export subset is deletable independently if the rebuild's hygiene pass wants it |
| **classification** | **`NOT-IN-SCOPE`** — no engine route computes or exposes cross-document ownership. **Reason:** it is presentation over edges the engine can only supply in bulk |

---

### PD-ENG-18 — `src/renderer/gnosis-panes.ts` + `src/renderer/gnosis-crud-panes.ts`

| field | value |
| --- | --- |
| **symbols** | `GnosisPanes`, `GnosisBridge`, `GnosisPanesOptions`, `GnosisOnChanged` · `GnosisCrudPanes`, `GnosisCrudBridge`, `GnosisCrudPanesOptions`, `GnosisCrudOnChanged` |
| **what each does today** | the two **renderer panes** over the engine: the status/query pane set and the document/wiki CRUD pane set, each with an `onChanged` refresh hook and a bridge to the preload surface |
| **engine route/spec that replaces it** | **NONE — these ARE the fork's consumer of the engine**, so they are the adoption surface, not an elimination. They currently cover `/engine/status` + `/rag/query` and the 11 CRUD routes only |
| **consumer map — `src/**`** | both are imported by the renderer entry `src/renderer/renderer.ts` (values). `gnosis-crud-panes.ts` additionally consumes `src/renderer/pane-graph.ts`'s `gnosisDocumentsContent`/`gnosisWikisContent`; `gnosis-panes.ts` consumes `gnosisStatusContent`/`gnosisQueryContent` |
| **consumer map — `tests/**`** | `tests/unit-u-shell-6-hover-affordance.test.ts` (both), `tests/unit-u-parity-partials.test.ts` (crud panes), `tests/unit-a2-document-crud-wiring.test.ts` (**reads `src/renderer/gnosis-crud-panes.ts` as source text — a path pin**, §6) |
| **`scripts/**` refs** | `scripts/live-drive.mjs` — the gnosis-pane rows drive rendered DOM, and the UF-GNOSIS-* rows drive the CRUD panes. **This is the assembled/app layer**, RCA-12 |
| **config coupling** | renderer bundle entry |
| **dependency-ordered change list** | (1) the client gains the missing seams (§4 PD-ENG-12/13/14); (2) `GnosisPanes` grows the `durability` display and the paged-read/change-feed consumers; (3) `GnosisCrudPanes` grows the `commitToken` handling and the four `/graph/…` surfaces; (4) only then can any pane-level test re-derive |
| **classification** | **`PARTIALLY-SHARED-KEEP` — and GROW.** **Reason:** they are the fork's half; deleting them would delete the engine's UI surface (`D4 MCP-GUI parity` — *"Every engine feature must be reachable through **both** the GUI and the MCP surface"*, `docs/integrations/astrographer-interface-implementation.md` §9) |

---

### PD-ENG-19 — `src/renderer/pane-graph.ts` + `src/renderer/layout-state.ts` (the "projection / layout-projection" half)

| field | value |
| --- | --- |
| **symbols** | `pane-graph.ts`: `assembleAppGraphEnvelope`, `enabledZonePaneCounts`, `paneSubtreeRoot`, `buildOperatorEnvelope`, `deriveDocNavDocuments`, `docNavContent`, `crosslinksContent`, `searchContent`, `landingContent`, `searchTabContent`, `gnosisDocumentsContent`, `gnosisWikisContent`, the `PANE_*`/`DOC_NAV_*`/`SEARCH_*`/`PAGE_EDIT_*` id/handler constants (~62 exports). `layout-state.ts`: `deriveLayout`, `coerceLayout`, `defaultLayout` |
| **what it does today** | the fork's **assembled app-graph envelope**: the zone/pane/placement model, the sidebar pane renderers (doc-nav, crosslinks, search, landing), the operator envelope, the page-edit surface, and the layout state derivation. **This is DOM assembly, not graph derivation** |
| **engine route/spec that replaces it** | **NONE.** The engine is a headless backend with *"no MCP surface and no GUI surface"* (`docs/integrations/astrographer-interface-implementation.md` §1 / §4.6.2 of `docs/specs/gnosis.md`); the shell *"provides the GUI + MCP surfaces that **proxy** Gnosis's API"*. **No engine route touches layout, zones, panes or the envelope.** The name *"projection"* in the fork's own docs refers to the **page-content projection** (`page-diff.ts`/`paste-sanitize.ts`/`rich-decompose.ts`) and, separately, to `RagSnapshotPayload` |
| **consumer map — `src/**`** | `src/renderer/sidebar-panes.ts` (14 names), `src/renderer/content-reconcile.ts`, `src/renderer/runtime.ts`, `src/renderer/gnosis-panes.ts`, `src/renderer/gnosis-crud-panes.ts`; `layout-state.ts`: `pane-graph.ts`, `sidebar-panes.ts`, `renderer.ts` |
| **consumer map — `tests/**`** | **the broadest test fan-in in the repo** — incl. `tests/props-pane-graph.test.ts`, `tests/representation-mode.test.ts`, `tests/template.test.ts`, `tests/sidebar-panes*.test.ts` (3), `tests/single-editable-surface.test.ts`, `tests/unit-v3-doc-heads-docnav*.test.ts`, `tests/blind-unit-v3-…`, `tests/unit-u-shell-1/3/4/6/9a/9b` suites, `tests/unit-u-parity-*` (3), `tests/unit-live8-…`, `tests/unit-live11-bridge-seams.test.ts`, `tests/unit-ms5-…`, `tests/unit-h8-…`, `tests/unit-gn-mcp-ui-wiring.test.ts`, `tests/blind-unit-a2-…`, `tests/unit-a2-…`, `tests/unit-stage-active-tab-display*.test.ts` (4) + `tests/stage-active-tab-display-adversarial.test.ts`, `tests/edit-adversarial.test.ts`, `tests/props-a2-…` |
| **`scripts/**` refs** | `scripts/live-drive.mjs` — the rendered-DOM rows and the `envelope.assemble` stage |
| **config coupling** | renderer bundle entry; **`assembleAppGraphEnvelope` is the O-0 stage `envelope.assemble` and IS path-pinned** (§6) |
| **dependency-ordered change list** | none for an engine offload; the only movement is the **`RagSnapshotPayload` seam** (`src/shared/types.ts`) that feeds it — which is `U-READS-PIVOT`'s and `C9`/`ST-*`'s territory (`docs/specs/rebuild-drift-map-2026-09-21.md`), not this half's |
| **classification** | **`NOT-IN-SCOPE`** — the engine has no rendering surface; this is the **assembled/renderer** layer per RCA-12 and belongs to the drift map's units. **Reason:** no engine route, and a path pin |

---

## 5. HARD BLOCKERS, STATED PLAINLY

**Read for this section:** fork `docs/next-steps.md` — the **P2 block** (items 44–49: the four units, *"each now **SPEC LANDED**, no code landed, no red set run"*, and *"Status of the set: no P2 unit has landed code, no red set, no DONE row"*), the **SUNSET RULE + CORPUS-LOSS CONDITION** paragraph (S1/§14.5 + C-1), and `docs/specs/design-extensions-review.md` **§13.1 P2**, **§13.2 S1–S5**, **§14.1 C-1..C-8**, **§14.2**.

### 5.1 The prerequisite chain, as the fork records it

> **`U-ENGINE-PERSIST` → `U-AUTHORITY-SWITCH` → `U-CORPUS-MIGRATION` → `U-READS-PIVOT`** (`docs/next-steps.md`, the *"WHAT THE QUEUE LEADS WITH NEXT"* row: *"the **P2 prerequisite chain** per `docs/specs/design-extensions-review.md` **§13**"*). **§13.2 S4 — *"the prerequisites are gates, not tails. `O-8` is the track's **PREREQUISITE, not a tail unit**"*; S2 — *"no unit runs over two contract regimes"*.**

| unit | code-bearing? | spec | its **engine** leg — what it still needs | engine leg status (Gnosis's own tracker) |
| --- | --- | --- | --- | --- |
| **`U-ENGINE-PERSIST`** (the `O-7` leg) | *"engine-side (**handoff**) + any host-side client seam"* | `docs/specs/unit-engine-persist.md` — LANDED, no code | **durability** (landed) **+ bulk atomic ingest with a cap/progress** (GR-6a) | **durability LANDED** (§OPEN/§DONE rows `D-D1`, `D-D2`: *"DONE — LANDED-GREEN + ALL GATES RUN"); **ingest PARKED, trigger UNDISCHARGED** (`docs/pending.md` GR-6a) |
| **`U-AUTHORITY-SWITCH`** (the `O-8` unit) | **YES** | `docs/specs/unit-authority-switch.md` — LANDED, no code | **a store-change notification route + adjacency reads + the single-writer/authority-switch contract** (fork `docs/HANDOFF.md`'s `O-8` pointer row) | **the notification route LANDED** (U4's `GET /changes` + the cursor); **adjacency reads LANDED as paged wiki-wide** (`GET /wikis/:id/nodes`/`edges`); **the notification/adjacency half is therefore engine-satisfied**; the **single-writer/authority-switch contract is a FORK decision** (Gnosis's `GNOSIS-ASYNC-CONSUMPTION-AUTHORITY` makes the engine's async surface authoritative and `SHELL-2` a **consumer obligation owed upstream**) |
| **`U-CORPUS-MIGRATION`** | **YES** | `docs/specs/unit-corpus-migration.md` — LANDED, no code | **a record-copy route with caller-supplied ids** (the unit's own §2.3 names this as the *"not-yet-filed"* fourth upstream capability → later filed as `GRQ-6`) | **NOT LANDED — PARKED.** `docs/specs/gnosis-grq-inbound-review.md` §4 GRQ-6 + §11: *"the record-copy route, **same trigger as GR-6a/6b**"*, and **GR-6a's trigger is UNDISCHARGED**. The fork's own record agrees: `docs/specs/unit-corpus-migration.md` §10.3 — *"The engine leg's only truthful status today is **BLOCKED** (`FS-CM-1`). There is nothing to be green about."* |
| **`U-READS-PIVOT`** | **YES** | `docs/specs/unit-reads-pivot-tab-cache.md` — LANDED, no code | **a revision or an equivalent coherence marker on `RagSnapshotPayload`** | **REFUSED engine-side.** `docs/decisions.md` `GNOSIS-CHANGE-CURSOR` + F2 §4.6: *"`GET /snapshot?revision=…` and a `stale_revision` error are **REFUSED, not parked**"*. The landed substitute is the **opaque change cursor**, explicitly not valid for cache validation. The fork records the field as **OWED** (§14.4) and the *"cursor-vs-revision difference"* as *"a recorded open question for its spec"* |

### 5.2 Which delegations in THIS rebuild are gated, and which are independent

**GATED by the chain (all of PD-ENG-1, 2, 3, 4, 8, 15, 16 — seven candidates, the whole elimination set):**

| gate | the delegation it holds | authority |
| --- | --- | --- |
| **S1 — the sunset rule** | *every* elimination that removes a **local store read or write** path | `docs/specs/design-extensions-review.md` §13.2 **S1**: *"**Until P2 lands, the local store is a TEMPORARY authority with a recorded sunset condition** … No pass may state the contract as if the cutover had already happened."* And the sunset fires **only** on `U-AUTHORITY-SWITCH`'s landing |
| **C-1 — the corpus-loss condition** | the local store's own replacement (PD-ENG-15), the importer (PD-ENG-16), and everything that reads them | §14.1 **C-1** + `docs/next-steps.md`: *"the engine persists NOTHING today (O-7 unmet) ⇒ without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` first, the operator corpus is **LOST at the next restart**. The corpus is **226 documents / 6 102 nodes / 9 266 edges** … This is the **least reversible action in the whole input**."* — **the first conjunct is now stale (D-D1 landed); the second is NOT (GR-6a parked)** |
| **`U-CORPUS-MIGRATION`'s engine leg (`FS-CM-1`)** | the corpus move itself, hence the authority switch's cutover, hence every local-store deletion | `docs/specs/unit-corpus-migration.md` §10.3 (*"BLOCKED (`FS-CM-1`)"*); `docs/specs/gnosis-grq-inbound-review.md` §4 GRQ-6 + §11; `docs/pending.md` GR-6a |
| **S4 — gates, not tails** | the *sequencing* of every one of the seven | §13.2 **S4** |
| **S2 — one regime per unit** | delegation of any of the seven *before* the switch's regime is declared: *"a unit that cannot declare one regime **cannot be delegated**"* | §13.2 **S2** |
| **the §14.2 fence plan** | any unit whose work touches `tests/traversal.test.ts` / `tests/import-render-no-duplicates.test.ts` | §14.2 + **S3** (*"a unit that 'adjusts' the fence is **re-entering this gate**"*) |

**INDEPENDENT of the chain (the fork-side adoption work — these are NOT eliminations):**

| independent work item | why it is independent | evidence |
| --- | --- | --- |
| **adopt `durability` into the client's `HealthReport`** | purely additive on the client; the engine's F2 §9 permission already allows the field; it does **not** touch the store, the corpus, or the authority | §1's client table; `src/main/engine-rag-store.ts` `HealthReport`/`decodeHealthReport`; F2 §9 |
| **adopt `resultVersion` / `commitToken` in the CRUD decoder** | the fold **already landed** engine-side; the client-side read is additive; the *meaning* (a commit contract) belongs to `C9` per §12.7(a) | `src/wire/crud.rs` `RESULT_VERSION_TOKENED`; §1's client table |
| **build the AUTH token hand-over seam** | engine-side AUTH landed; the launcher owns the spawn (`GN-3`); the fork's `headers()` already sends a Bearer | `src/auth.rs`; `docs/decisions.md` `GNOSIS-ENGINE-TRANSPORT-AUTH`; `scripts/start-app.sh` |
| **add clients for `GET /changes` and the paged reads** | both routes **landed** (U4); the fork has **no** seam — a pure adoption | §1's client table; `docs/specs/u4-cursor-paged-reads.md` |
| **add clients for the four `POST /graph/…` routes** | **landed** (`A2`, live 22/0/0) | `docs/specs/a2-override-routes-spec.md`; §DONE row `A2` |
| **`U-READS-PIVOT`'s spec-ready node-testable slice** (the cache + miss policy + residency flip) | its blockers are *"recorded and mitigated inside its own spec"* (`Rule A conditional` / `Rule B partial`) and it contributes **zero archive moves** | `docs/specs/rebuild-drift-map-2026-09-21.md` §6.2 rank 1 |
| **`U-AUTHORITY-SWITCH`'s node-testable slice** (the resolver + the record + the state machine + the routing tables) | *"a large, node-testable slice that does not require the engine"* | `docs/specs/rebuild-drift-map-2026-09-21.md` §6.2 rank 2 |

**The blunt answer the supervisor asked for:**

> **An engine-offload rebuild CANNOT proceed independently of the authority-switch prerequisite chain. It is GATED by it.** Seven of the twenty-two candidates — **every candidate that would actually delete fork-local code** — are `BLOCKED-ON-ENGINE`, and the gating conjunct that is *not* yet satisfied is **`U-CORPUS-MIGRATION`'s engine leg (a record-copy route with caller-supplied ids), which is PARKED on GR-6a's UNDISCHARGED trigger and which the fork cannot fire.** The engine's **durability** leg, by contrast, **has landed** (D-D1/D-D2) — so the fork's `C-1`/`O-7` "the engine persists NOTHING" wording is **stale and must be corrected**, and the real remaining engine block is the **ingest/record-copy** route (and, separately, the **REFUSED** revision marker that `U-READS-PIVOT` needs).
>
> **What CAN start now — and what the rebuild should therefore do first — is the six-item INDEPENDENT adoption set above** (the landed-routes clients + the two decoder adoptions + the token seam + the two node-testable slices). Those are **additive fork-side units**, they eliminate **nothing**, and they are the only work in this half that the chain does not gate.

---

## 6. THE TESTS IMPLICATED

**The mechanical facts first (read, not assumed):**

| fact | reading | source |
| --- | --- | --- |
| `tests/` today | **201** `*.test.ts` + **3** `*.test.mjs`, plus `tests/fixtures/` (5 entries) | this pass's glob/ls reading |
| `archive/tests/` today | **41** files, all `2026-09-21-<original-basename>.test.ts` | this pass's ls reading |
| the last recorded trio reading | *"`npm test` (`npx vitest run`) = **1 failed file / 200 passed (201 files) · 1 failed test / 4190 passed / 45 skipped (4236 tests)**; `npm run typecheck` = exit 0; `npm run build` = exit 0"* — the one red is the defect row `PANE-TOGGLE-STAGE-COLLAPSE` | **quoted** from the fork's `docs/next-steps.md` CURRENT WORK / DONE rows (2026-09-22). **Not re-run by this pass** |
| `ARCHIVE-READY` | **`0 of 224 files`** — *"There is no file in the suite whose subject feature has been removed from the code."* | **quoted** `docs/specs/test-pruning-disposition-2026-09-21.md` §0 |
| **already-archived files — DO NOT RE-ARCHIVE** | `2026-09-21-rag-store.test.ts`, `…-rag-store-adversarial.test.ts`, `…-unit-ud1-document-metadata-fields.test.ts`, `…-unit-ud1-…-adversarial.test.ts`, `…-unit-ud2-journal-invertibility.test.ts`, `…-unit-ud3-import-path-id-scheme.test.ts`, `…-unit-ud3-…-adversarial.test.ts`, `…-unit-ud4-doc-heads-tree.test.ts`, `…-unit-ud5-list-documents-tool.test.ts`, `…-unit-ud6-query-document-filters.test.ts`, `…-unit-ud7-set-doc-meta-op.test.ts`, `…-unit-ujr1-get-journal.test.ts`, `…-unit-h7-default-reassign.test.ts` — plus 28 more (41 total) | this pass's `ls archive/tests/` reading; the disposition's archive list is `docs/specs/test-pruning-disposition-2026-09-21.md` §9 + the fork's DONE row *"ARCHIVE-FOR-REBUILD PASS"* |

> **Note for the rebuild:** the two files that pin the fork's **local store** most directly —
> `tests/rag-store.test.ts` and `tests/rag-store-adversarial.test.ts` — are **ALREADY ARCHIVED**
> (`archive/tests/2026-09-21-*`). `PD-ENG-15`'s elimination therefore does **not** owe their archive; it owes
> their **replacement** through the owning unit's own cycle (`DECIDED: REBUILD-ARCHIVE-POLICY`: *"no archived
> file may be restored except through its owning unit's cycle with a **fresh red set**"*).

### 6.1 The classed set (engine-delegated behavior only)

**Class definitions used here:** **`ARCHIVE`** = its subject is the delegated/obsoleted behavior; archived (not adapted) in the **same unit** that lands the elimination — none is archivable today (§0's reading). **`REWRITE`** = its assertions must be **re-derived** against the engine-backed behavior (the subject survives; the mechanism changes). **`KEEP`** = it pins behavior the division leaves unchanged. **`PROTECTED`** = it **path-pins** a `src/**` file by reading its text, or it is one of the two §14.2 **fence** files — **immovable without rewriting the pin itself**, and `PROTECTED` **overrides** every other class.

| class | files | why |
| --- | --- | --- |
| **`ARCHIVE`** (14) | `tests/traversal-e2e.test.ts` · `tests/crosslink-backlink.test.ts` · `tests/crosslink-backlink-adversarial.test.ts` · `tests/unit-v1-store-adjacency.test.ts` · `tests/unit-v1-store-adjacency-adversarial.test.ts` · `tests/blind-unit-v1-store-adjacency-greens.test.ts` · `tests/unit-v2-scoped-traversal-mcp.test.ts` · `tests/unit-v2-scoped-traversal-mcp-adversarial.test.ts` · `tests/blind-unit-v2-scoped-traversal-mcp-greens.test.ts` · `tests/unit-v3-doc-heads-docnav.test.ts` · `tests/unit-v3-doc-heads-docnav-adversarial.test.ts` · `tests/blind-unit-v3-doc-heads-docnav-greens.test.ts` · `tests/unit-r-traversal-inline-children.test.ts` · `tests/doc-flow.test.ts` | each pins a **fork-local graph derivation** whose data source the engine replaces (`PD-ENG-5/6/7/8`) — but **no rewrite is owed while the derivation stays in-process** (§14.2); these become `ARCHIVE` **only if** a gate ruling moves `buildTraversal`. **Owning unit today: none** — every one of these is a §14.2 fence-adjacent pin, so **none moves before §14.2's ruling** |
| **`REWRITE`** (28) | `tests/unit-gn-engine-integration.test.ts` · `tests/blind-unit-gn-engine-integration-greens.test.ts` · `tests/unit-gn-mcp-ui-wiring.test.ts` · `tests/blind-unit-gn-mcp-ui-wiring-greens.test.ts` · `tests/unit-shell-integration.test.ts` · `tests/props-shell-integration.test.ts` · `tests/blind-unit-shell-integration-greens.test.ts` · `tests/unit-a1-crud-routing-proxy.test.ts` · `tests/props-a1-crud-routing-proxy.test.ts` · `tests/unit-a2-document-crud-wiring.test.ts` · `tests/props-a2-document-crud-wiring.test.ts` · `tests/blind-unit-a2-document-crud-wiring-greens.test.ts` · `tests/engine-crud-real-transport.test.ts` · `tests/sidebar-panes.test.ts` · `tests/sidebar-panes-host.test.ts` · `tests/sidebar-panes-adversarial.test.ts` · `tests/unit-ms5-settings-listing.test.ts` · `tests/page-diff.test.ts` · `tests/page-diff-production-commit.test.ts` · `tests/page-commit-failure-visibility.test.ts` · `tests/page-commit-scope-ack-race.test.ts` · `tests/page-commit-tab-ownership.test.ts` · `tests/unit-stage-active-tab-display.test.ts` · `tests/unit-stage-active-tab-display-blind-contradictions.test.ts` · `tests/unit-stage-active-tab-display-contract-holes.test.ts` · `tests/unit-stage-active-tab-display-pbt-generators.test.ts` · `tests/stage-active-tab-display-adversarial.test.ts` · `tests/template.test.ts` | the **engine client seam** grows (`durability`, `resultVersion`/`commitToken`, the token hand-over, the paged reads, the change feed, the four `/graph/…` routes), so the suites that pin the client's shapes and the `RagSnapshotPayload` seam must re-derive. **Owning units: PD-ENG-12/13/14's adoption units + `U-READS-PIVOT`** |
| **`KEEP`** (21) | `tests/retrieval.test.ts` · `tests/retrieval-adversarial.test.ts` · `tests/unit-q-retrieval-children-indexing.test.ts` · `tests/unit-f1-merge-store-results.test.ts` · `tests/unit-f2-result-qualification.test.ts` · `tests/unit-f3-stores-all-schema.test.ts` · `tests/unit-x-rag-provenance-traversal.test.ts` · `tests/embeddings.test.ts` · `tests/embeddings-adversarial.test.ts` · `tests/embeddings-batch.test.ts` · `tests/embeddings-failure-policy.test.ts` · `tests/embeddings-ollama-integration.test.ts` · `tests/vector-boot.test.ts` · `tests/vector-cache.test.ts` · `tests/live-embed-cache.test.ts` · `tests/unit-u-shell-9b-cross-document-shared.test.ts` · `tests/props-cross-doc-shared.test.ts` · `tests/unit-u-shell-6-hover-affordance.test.ts` · `tests/unit-u-parity-partials.test.ts` · `tests/integration-adversarial.test.ts` · `tests/lookback-adversarial.test.ts` | **explicit HOLD-UNTIL-IMPLEMENTED**: its subject is live and still exercised in `src/`, so archiving it **reddens the suite from the moment the move lands** (`docs/specs/test-pruning-disposition-2026-09-21.md` §6 — *"archiving a `HOLD-UNTIL-IMPLEMENTED` file is not 'pruning the development chain'"*). These move **only** when PD-ENG-1/2/3/4/15's owning units land |
| **`PROTECTED`** (16) | **path-pinned source contracts:** `tests/unit-v5-migration-contract.test.ts` · `tests/unit-o-0-hook-contract.test.ts` · `tests/unit-o0-m1-m3-measurement-shape.test.ts` · `tests/unit-o0-m1-m3-driver-contract.test.ts` · `tests/unit-o0-m1-m3-adversarial-pins.test.ts` · `tests/unit-h8-operator-editor.test.ts` · `tests/unit-a2-document-crud-wiring.test.ts` · `tests/unit-gn-mcp-ui-wiring.test.ts` · `tests/unit-ms5-settings-listing.test.ts` · `tests/vector-boot-adversarial.test.ts` · `tests/unit-import-batch-persist-contract.test.ts` · `tests/unit-u2-rich-decompose.test.ts` · `tests/unit-s-paste-sanitization.test.ts` · `tests/unit-u-edit-1-property-register.test.ts` · **the two §14.2 fences:** `tests/traversal.test.ts` · `tests/import-render-no-duplicates.test.ts` | see §6.2 |

### 6.2 The path-pin ledger (what each `PROTECTED` file pins, and what a rebuild must rewrite first)

`tests/unit-v5-migration-contract.test.ts` is the decisive one. Its **mechanism is a source-text read**
(`readFileSync` + a TS-parser comment-blanking helper + regex/substring assertions), not an import — so a file
it reads is **immovable without rewriting this test**. It pins:

| pinned path | what is asserted |
| --- | --- |
| **`src/main/markdown-import.ts`** | carries **ONE** `.applyBatch(` call; carries **no** `.putNode(`/`.putEdge(` call; carries the `op: 'putNode'` **and** `op: 'putEdge'` literals; and **all `putNode` ops precede all `putEdge` ops** |
| **`vitest.config.ts`** | `testTimeout` is a **number**, `>= 15_000` **and** `<= 15_000` (an exact ceiling); no `clearMocks`/`restoreMocks`/`mockReset`/`isolate`/`pool`/`poolOptions` override |
| **`package.json`** | `scripts.test` and `scripts['test:watch']` do not match `/--testTimeout/` |
| **`docs/specs/ui-overhaul.md`** | used as the **Class-C import corpus** (imported through one `applyBatch`), so its census is a pinned figure |
| **`tests/unit-import-batch-persist-contract.test.ts`** | still contains `'P-TP-4'` and `/strat:per-op-cadence/` |
| **`tests/unit-u2-rich-decompose.test.ts`** and **`tests/unit-s-paste-sanitization.test.ts`** | their ADR-4 / Tokenizer-F1 rows keep depth exactly `10000`, `.not.toThrow()`, `result!.ok).toBe(true)`, no `catch(`, no skipped row, no per-row `{ timeout:` |
| **the derived bridge-mock census** (every `tests/**/*.test.ts` containing the `'electron'` mock factory) | the census is **non-empty** and its base names are **exactly** `template-adversarial.test.ts`, `unit-live11-bridge-seams.test.ts`, `unit-u5-rich-commit-ipc.test.ts`, `unit-v5-bridge-capture.test.ts`, `unit-wave-1-bridge-wiring.test.ts`; each keeps `beforeEach(` + `invokeMock.mockReset()`; **no call-history reads** |
| **`tests/fixtures/v5-bridge-capture-fixture.js`** | imported by value (the synthetic old/conforming texts are the discrimination proof) |
| itself | it must not re-introduce a bare per-op `store.putNode(`/`store.putEdge(` timing pin |

`tests/unit-o-0-hook-contract.test.ts` pins by the same mechanism: **`src/main/traversal.ts`** (must import the pinned hook module, must **not** inline `performance.mark`/`measure`, and `buildTraversal` must carry the `.record('traversal.build', () => …)` wrapper **enclosing** the `input == null` guard), **`src/renderer/pane-graph.ts`** (the `envelope.assemble` wrapper on `assembleAppGraphEnvelope`), **`src/renderer/sidebar-panes.ts`**, **`src/renderer/content-reconcile.ts`**, **`src/renderer/runtime.ts`**. `tests/unit-o0-m1-m3-*` pin `src/shared/o0-report.ts` + `src/shared/o0-hook.ts`. Other path reads (named so the rebuild does not discover them as a red suite): `tests/unit-a2-document-crud-wiring.test.ts` reads `src/renderer/gnosis-crud-panes.ts`, `src/main/mcp-server.ts`, `src/main/main.ts`; `tests/unit-gn-mcp-ui-wiring.test.ts` reads `src/main/mcp-server.ts`, `src/main/main.ts`; `tests/unit-h8-operator-editor.test.ts` reads `src/main/rag-store-runtime.ts`, `src/main/rag-store-remove.ts`, `src/main/rag-store-default.ts`, `src/main/rag-store-registry-write.ts`, `src/renderer/sidebar-panes.ts`; `tests/unit-ms5-settings-listing.test.ts` reads `src/renderer/sidebar-panes.ts`; `tests/vector-boot-adversarial.test.ts` reads `src/main/embeddings.ts`; `tests/unit-u-edit-1-property-register.test.ts` reads the `RagSnapshotPayload` seam.

**The two fence files (exempt by name, `PROTECTED` by an explicit plan, not by a path read):**
`tests/traversal.test.ts` and `tests/import-render-no-duplicates.test.ts`. §14.2's re-plan reads: *"**Pinned:
the fence stays GREEN UNCHANGED in P2**"* for both. **A rebuild that reddens either is not implementing the
ruling — it is re-entering the gate.** The fence must be **run** (trio) as `U-READS-PIVOT`'s and
`U-CORPUS-MIGRATION`'s regression reading, and *"**No unit may report the fence green from a plan**"* — the
last recorded reading is `221 files / 4 988 passed / 58 skipped / 0 failed` (a **dated** reading; the current
tree's reading is the 201-file one in §6's table).

### 6.3 Files deliberately NOT classified here

The wider cross-section that asserts **store state and file shape** — `docs/specs/design-extensions-review.md`
§14.3's *"~120 of 221 test files import the data layer directly (259 direct import statements)"* — is
**`U-AUTHORITY-SWITCH`'s re-derivation set**, which that unit's spec *"names **by file**"* (§14.2's *"the
re-derivation set (NOT a fence)"* row; the fork's `docs/next-steps.md` §OPEN items 3 and 4 name **17** and **6**
suites respectively). This file does **not** duplicate that list, and it **does not** re-classify a file the
drift map's four units already own.

---

## 7. THE `src/**` FILES IMPLICATED (the union, named)

**The candidate set (31 modules, grouped under 19 candidate ids `PD-ENG-1..PD-ENG-19`):**
`src/main/traversal.ts` · `src/main/adjacency.ts` · `src/main/backlinks.ts` · `src/main/doc-flow.ts` ·
`src/main/retrieval.ts` · `src/main/merge-store-results.ts` · `src/main/vector-cache.ts` ·
`src/main/embeddings.ts` · `src/main/vector-boot.ts` · `src/main/engine-transport.ts` ·
`src/main/engine-config.ts` · `src/main/engine-crud-rag-store.ts` · `src/main/engine-rag-store.ts` ·
`src/main/authority-store.ts` · `src/main/idempotency-registry.ts` · `src/main/query-audit.ts` ·
`src/main/rag-store.ts` · `src/main/rag-store-registry.ts` · `src/main/rag-store-registry-write.ts` ·
`src/main/rag-store-directory.ts` · `src/main/rag-store-default.ts` · `src/main/rag-store-remove.ts` ·
`src/main/rag-store-runtime.ts` · `src/main/module-store.ts` · `src/main/markdown-import.ts` ·
`src/main/markdown-parse.ts` · `src/renderer/cross-document-shared.ts` · `src/renderer/gnosis-panes.ts` ·
`src/renderer/gnosis-crud-panes.ts` · `src/renderer/pane-graph.ts` · `src/renderer/layout-state.ts`.

**The consumer-only set (14 further files, de-duplicated against the above):**
`src/main/main.ts` · `src/main/mcp-server.ts` · `src/main/preload.ts` · `src/main/standalone.ts` ·
`src/main/edit-ops.ts` · `src/main/import-directory.ts` · `src/main/battery-host.ts` ·
`src/renderer/renderer.ts` · `src/renderer/sidebar-panes.ts` · `src/renderer/pane-registry.ts` ·
`src/renderer/content-reconcile.ts` · `src/renderer/runtime.ts` · `src/shared/types.ts` ·
`src/shared/o0-hook.ts`.

**Total `src/**` files implicated: 45** (31 candidate modules + 14 consumer-only; the union is de-duplicated —
the `rag-store-*` family and `module-store.ts` are candidates **and** consumers, and `pane-graph.ts` /
`layout-state.ts` appear once each, under the projection/layout half). **Build coupling:** the five esbuild
entries are `src/main/main.ts` (cjs), `src/main/preload.ts` (cjs), `src/main/standalone.ts` (esm),
`src/main/battery-host.ts` (esm), `src/renderer/renderer.ts` (esm); `tsconfig.json` `include: src/**/*.ts`
typechecks every file regardless of reachability; **no `package.json`/`tsconfig`/`vitest.config`/esbuild alias
names any candidate module by path** — the coupling is bundle-root reachability only. **`src/specs/` does not
exist**; specs live in `docs/specs/` (167 files).

**Total `tests/**` files implicated: 79 classed in §6.1** (14 `ARCHIVE` + 28 `REWRITE` + 21 `KEEP` + 16
`PROTECTED`), **plus** the wider 120-file data-layer cross-section owned by `U-AUTHORITY-SWITCH`'s
re-derivation set (§6.3) and the 41 already-archived files under `archive/tests/` (§6's table, which must
**not** be re-archived).

**`scripts/**` references (all four files in the directory):** `scripts/live-drive.mjs` (the only one that
matters — it **cites `src/main/traversal.ts` by path** in the O-0 seam map, drives the `gnosis.*` tool
surfaces, asserts `bundle.verified` against `dist/main/main.cjs`, and spawns via `scripts/start-app.sh`; it
**imports no `src/` module** — it talks MCP + CDP); `scripts/start-app.sh` (**spawns the engine** with
`--mode=gnosis`, sets `PROVIDENT_ENGINE_BASE_URL`/`PROVIDENT_EMBEDDING_*`, reads
`provident-engine-config.json`); `scripts/electron-divergence.mjs` (**no** candidate-module reference);
`scripts/mcp-cli.mjs` (**no** candidate-module reference).

---

## 8. REPORT / LAYER

- **Written:** this file — `docs/specs/post-division-engine-offload-inventory.md`. **The only write of this
  pass.** No `src/**`, `scripts/**`, `tests/**`, `archive/**`, tracker or other spec file was created, edited,
  moved or deleted; **no test, build, `cargo` or app/server command was run.**
- **Layer (RCA-12):** **DOC-LAYER / inventory record.** Every engine claim is a **spec/tracker/source read of
  the Gnosis tree**; every fork claim is a **source read or grep reading**; the two suite figures are **quoted
  recorded readings** from the fork's own `docs/next-steps.md`, and the census figures are **quoted** from
  `docs/specs/design-extensions-review.md` §14.3 / `docs/specs/test-pruning-disposition-2026-09-21.md`.
  **Nothing here is app-green, envelope-green, store-green, engine-green or live-green**, and nothing here
  proves the assembled app works.
- **The candidate count by classification.** **By candidate id (19):** `PARTIALLY-SHARED-KEEP` **6**
  (PD-ENG-6, 7, 12, 13, 14, 18) · `NOT-IN-SCOPE` **6** (PD-ENG-5, 9, 10, 11, 17, 19) · `BLOCKED-ON-ENGINE`
  **7** (PD-ENG-1, 2, 3, 4, 8, 15, 16) · `DELETE-WHOLE-FILE` **0** · `DELETE-SUBSET-KEEP-ADAPTER` **0**.
  **By module (31):** `PARTIALLY-SHARED-KEEP` **8** · `NOT-IN-SCOPE` **8** · `BLOCKED-ON-ENGINE` **15** ·
  `PROTECTED` **2** of the blocked set (`src/main/traversal.ts`, `src/main/markdown-import.ts` — a **label**,
  not a class). **No candidate is a clean whole-file deletion, and that is the finding** — the engine owns the
  **data and the mutations**, never the fork's **derivation or its rendering**.
- **The engine split:** **landed / on the wire: 22 routes** across 14 unit families; **landed / NOT on the
  wire: 5 capabilities** (`getCommunityContext`, `bm25Search`, `vectorSearch`, `getProfileSummary`,
  `getQueryAuditLog`) plus the whole `edgesFrom`/`edgesTo`/… family; **parked: 6** (GR-3's maintenance/capacity
  half, GR-4, GR-6a, GR-6b, the config surface, route growth beyond U4); **refused: 6** (the revisioned
  snapshot + `stale_revision`, `decode_failed`, the replay log / `?since=`, query-result parity, engine-side
  RBAC, `{files:[paths]}`); **rejected as an engine deliverable: 1** (`GR-9`); **live-parked: 3** (`R-L8`,
  the feed-side refusal bytes, `R-L11`).
- **The `GR-n` verdicts, one line each:** **GR-1 LANDED** (envelope final; the fork's bare body was the
  defect; the decode body landed in U2) · **GR-2 LANDED** (U2; zero consumer work) · **GR-3 SPLIT-LANDED**
  (U3 honesty + U5 boot build + U6 freshness; the *maintenance* half PARKED on the writer actor; `U5-ADV-1`
  OPEN) · **GR-4 REFUSED (not parked) for the revisioned projection; the bulk-read half LANDED as U4's paged
  wiki-scoped reads** · **GR-5 LANDED** (re-shaped to the opaque change cursor + `GET /changes`, U4; no
  `stale_revision`) · **GR-6 PARKED, trigger UNDISCHARGED; `{files:[paths]}` REJECTED; `path` collides with
  the frozen P1a `Document`** · **GR-7 LANDED** (D-D1 + D-D2; the O-8 conjunct made MOOT by *"The shell
  doesn't own it."*) · **GR-8 ENGINE HALVES LANDED** (A1 provenance + A2's four `POST /graph/…` routes, live
  22/0/0) **— the text-generation seam stays ruled OUT and the traversal/community READS stay UNROUTED** ·
  **GR-9 REJECTED as an engine deliverable** (RBAC stays SHELL; AUTH landed transport authentication only).
- **The top three risks.** **(1) The elimination half is gated, and by an engine capability that is PARKED.**
  All seven `BLOCKED-ON-ENGINE` candidates queue behind `U-CORPUS-MIGRATION`, whose engine leg is a
  **record-copy route with caller-supplied ids** parked on **GR-6a's UNDISCHARGED trigger** — a trigger the
  fork cannot fire. **An engine-offload rebuild cannot proceed independently of the authority-switch chain:
  it is gated by it.** What can proceed now is the six-item **adoption** set (§5.2) — additive work that
  eliminates nothing. **(2) The fork's trackers are stale against Gnosis's, in the direction that hides
  progress and mis-sizes the blocker.** `docs/next-steps.md`'s P2 block, `docs/HANDOFF.md`'s `O-7 ENGINE
  PERSISTENCE` row and `docs/specs/design-extensions-review.md` §14.1 **C-1** all still read *"the engine
  persists NOTHING today"* / *"there is no engine durability"*, while Gnosis's own trackers read `D-D1` +
  `D-D2` **LANDED-GREEN** and GR-7's three-conjunct trigger **DISCHARGED**. Correcting that is the
  **highest-value tracker pass** the rebuild owes, and it materially changes which conjunct is the real
  blocker (the **ingest/record-copy** route, not persistence). **(3) Two landed wire additions are invisible
  and silently mis-decoded by the fork's client.** `grep -rn "resultVersion\|commitToken" src/ tests/` returns
  nothing, and `decodeCrudResponse` (`src/main/engine-crud-rag-store.ts`) never checks `resultVersion`, so the
  engine's **folded mutating payload** (`src/wire/crud.rs` `RESULT_VERSION_TOKENED`) is accepted as if
  unversioned and its **commit token is discarded** — while the engine's `durability` axis
  (`src/wire/status.rs`) is decoded-and-dropped by `decodeHealthReport` (`src/main/engine-rag-store.ts`). Both
  are **fork-side adoption defects**, both are **independent of the chain**, and both should be filed as
  tracker rows rather than discovered later as live drift.
- **What this pass did NOT do:** it did not author any unit's spec, did not run a red set, did not run the
  trio, did not move or archive a file, did not re-derive any census, and did not patch either repo. Every
  figure is cited or read.
