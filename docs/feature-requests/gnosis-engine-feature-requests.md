# FEATURE REQUESTS → the **Gnosis engine** project (handover from Astrographer)

**Date:** 2026-09-16 · **Requester:** the Astrographer shell (a consumer of `gnosis-server`) ·
**Status:** OPEN — handed off; **the engine repo is never patched from here** (AGENTS.md item 7).
**Companion handoffs:** `docs/HANDOFF.md` (the index), `docs/defects.md` (the live rows with raw evidence),
`docs/specs/gnosis-enrichment-live-report-2026-09-15.md` (the gnosis live battery + findings),
`docs/specs/gnosis-offload-proposal.md` + `-review.md` (the architectural context for GR-6..GR-8),
`docs/pending.md` §"PARKED DESTINATION — the engine track".

> **Note on naming:** the consumer's specs sometimes write the engine as **"Gnosis"**; the sibling repo is
> `../Gnosis/` (binary `../Gnosis/target/debug/gnosis-server`, crate `gnosis`). "Knosis" is not the name of
> any component in this workspace — these requests are for that Gnosis engine.

**How each request is written:** *problem → live evidence (exact repro) → requested contract (proposed wire
shape) → acceptance criteria (testable) → downstream impact → priority*. Priorities: **P0** blocks a shipped
consumer path; **P1** blocks a planned consumer unit; **P2** quality/parity; **P3** destination/future.

---

## GR-1 — `POST /rag/query` must accept the F2 envelope (P0)

**Problem.** The engine's query route requires the F2 wire envelope; the shell's engine client posts a BARE
JSON body, so every engine query over POST fails and the failure is *masked* as a JSON-parse error.

**Live evidence (2026-09-16).**
- Shell side: `src/main/engine-rag-store.ts` `ragQuery` (~`:920`) sends `JSON.stringify({query, ...opts})`.
- Engine side: `Envelope::from_json` rejects it → **HTTP 400 `text/plain "request decode failed"`**.
- The shell's `decodeEnvelope` then `JSON.parse`s that text → the user-visible error
  `malformed envelope: invalid JSON` (the real status/body are discarded).
- The sibling SSE path is correct, so the two query surfaces disagree on the contract.

**Requested contract.** No engine change is strictly required if the envelope is the pinned contract —
**please confirm the envelope requirement is intentional and final**; the shell will fix its client. If you
prefer to ALSO tolerate a bare body for back-compat, say so explicitly (the shell would then need a
decision row). Expected request body:
```json
{ "schemaVersion": 1, "idFormat": "opaque-string-v1", "payload": { "query": "…", "mode": "flat", "topK": 5 } }
```

**Acceptance.** A POST with the envelope returns `200` + a `RagResult` payload; a bare body returns a
**structured** error (JSON, not `text/plain`) with the machine-readable code for a decode failure.

**Impact.** Astrographer `HOST-ENGINE-QUERY-POST-NO-ENVELOPE` (shell fix owed) +
`docs/specs/unit-gn-engine-integration.md:454` pins the wrong body and must be reconciled. Until this is
settled, the shell's engine-backed `rag.query` path is unusable.

---

## GR-2 — `POST /rag/query` must honour `mode` and `topK` (P0)

**Problem.** The POST query route drops the caller's retrieval `mode` and `topK`: it decodes only
`payload.query` and calls `store.rag_query(&query, &RagQueryOptions::default())`. Graph / vector / hybrid
retrieval and the caller's `topK` are therefore unreachable over the engine's own query endpoint, while the
SSE route honours both.

**Live evidence (2026-09-16, engine `state: Ready`, wiki `wiki-0`, document `doc-1` with a valid Provident
graph).** `POST /rag/query` with `mode` = `Flat`/`Vector`/`Graph`/`Hybrid` (and `topK` 3 vs 5) returned
**byte-identical** results — same `trace: {"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,…}}`, the same
two results (`n1` score `2.6384988372299447`, `n2` `0.5897495348410585`) and the same payload hash
`sha256 da99c04c…bb38` for all modes; `top_k` stayed `10` for every `topK`. `GET /rag/stream?mode=vector` →
`event: error` with `code:"vector_index_unavailable"`; `mode=graph` → a `Graph` trace; `mode=hybrid` →
`legs:["graph","vector","lexical"]`. So the modes are real — only the POST path loses them.

**Requested contract.** Mirror `rag_stream_handler` in `rag_query_handler`: read `payload.topK` and
`payload.mode` (accept `flat|graph|vector|hybrid`, case-insensitively; an unknown value should be REJECTED
with a structured error rather than silently degrading) into `RagQueryOptions`.

**Acceptance (testable).** On a populated graph: the four modes produce **different traces and/or result
sets** (hash-inequality assertion), and `topK: 3` vs `5` changes `trace.top_k` and the result count.

**Impact.** Astrographer `GNOSIS-ENGINE-QUERY-MODE-IGNORED`; it also blocks the app's gnosis
graph/vector/hybrid retrieval parity and the parked offload track (GR-6).

---

## GR-3 — Build the vector index for the server's store; make `mode=vector` usable (P1)

**Problem.** `/engine/status` reports `vector: true, embedding: true` (the ollama provider is wired), but a
vector query fails: **no vector index is ever built for the server's store**, so `mode=vector` is
unreachable and `blocked_by`/`vector_index_unavailable` is the only outcome.

**Live evidence (2026-09-16).** `GET /rag/stream?query=x&mode=vector` →
`event: error / data: {"code":"vector_index_unavailable","message":"vector index is not built"}` while
`GET /engine/status` → `state: Ready`, `subsystems {store, graph, lexical, vector, embedding, reranker} = all true`, and the embedding provider was configured
(`GNOSIS_SERVER_OLLAMA_URL=http://127.0.0.1:11434`, `GNOSIS_SERVER_OLLAMA_MODEL=embeddinggemma`, verified
serving via `/api/embed` → 768-dim vectors). Nine probed enrichment/traversal paths answered **404**.

**Requested contract.** Build/adopt the vector index for the server's store at boot (and maintain it on
store changes), so `mode=vector` and `mode=hybrid`'s vector leg work. If the index is intentionally
operator-built, expose the build/kickoff + progress so the shell can drive it and report state honestly
(status should not report `vector: true` while the index is absent).

**Acceptance.** On a store with ≥1 content node: `mode=vector` returns ≥1 result whose score matches a
direct embedding similarity, and `/engine/status` distinguishes "provider wired" from "index built".

**Impact.** Astrographer `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`; the app's gnosis vector/hybrid legs and
any future engine-owned retrieval (GR-6).

---

## GR-4 — A bulk read (projection) route for nodes + edges + adjacency (P1)

**Problem.** The shell's document derivation needs the whole store's nodes + edges + adjacency in one read
(`buildTraversal` consumes `listNodes()`/`listEdges()` synchronously). The engine exposes **no bulk read**:
its routes are query/stream/status and document/wiki CRUD. Today the shell gets that data from its LOCAL
JSON store over IPC — so the engine cannot become the store source without this route.

**Live evidence.** Engine routes enumerated from `../Gnosis/src/bin/gnosis_server.rs`: `POST /rag/query`,
`GET /rag/stream`, `GET /engine/status`, `POST /documents`, `POST /documents/:id`,
`POST /documents/:id/update|publish|unpublish|archive`, `POST /wikis`, `GET /wikis/:id` — no
`/nodes`, `/edges`, `/adjacency`, or `/snapshot`. Shell side: `src/main/engine-rag-store.ts` implements only
5 methods (`ragQuery`, `ragStream`, `getEngineStatus`, `health`, `waitForReady`), while the shell's own
`RagStore` interface pins ~22 members including synchronous `listNodes`/`listEdges`/`edgesFrom`/`edgesTo`/
`edgesByKind`/`edgesForDocument`/`docHeadForDocument`/`journal`.

**Requested contract (two acceptable shapes — please state which you prefer).**
1. **Revisioned projection snapshot** (preferred): `GET /snapshot?store=…&revision=…` returning
   `{ "revision": <monotonic u64>, "nodes": [...], "edges": [...], "docHeads": [...] }` in the F2 envelope,
   with `revision` bumped on every committed write; a request for an older revision either returns the
   newest (with its revision) or a structured `stale_revision` error.
2. **Delta reads**: `GET /changes?since=<revision>` returning the committed change batches
   (`{kind, nodeIds, edgeIds, revision}`) so a consumer can maintain its own projection.

**Acceptance.** On a store with N nodes and E edges the route returns them in ONE response (no per-node
round-trips), the payload is deterministic for a given revision, and the revision advances exactly once per
committed write.

**Impact.** This is the **only** route that lets the engine become the store source without the shell
calling the store interface (the architectural ruling chose exactly this boundary: the shell never reads the
engine store; it consumes a snapshot). Needed by GR-6/GR-7/GR-8. Also the cheapest way to unblock the
parked `source-switchable` work.

---

## GR-5 — A store-change notification / subscription route (P1)

**Problem.** The shell's coherence rule is "re-traverse on ANY committed store change". With an
engine-owned store there is **no notification channel**, so the renderer would have no trigger and its
envelope cache would go stale with no contract.

**Live evidence.** No subscription/notification route exists (the route list in GR-4); the shell's change
source today is its own main-process broadcast (`IPC_RAG_STORE_CHANGED`), which an engine writer does not
drive.

**Requested contract.** Either (a) `GET /changes` (poll, paired with GR-4 option 2) or (b) an SSE/WebSocket
`GET /events` streaming `{kind, nodeIds, edgeIds, revision}` frames — plus a documented **staleness
contract** (what a consumer may assume between a write and its notification). A monotonic `revision` on
every frame is required either way.

**Acceptance.** A consumer can, from a cold start, learn the current revision and then receive every
subsequent committed change in order, with a test proving no gap for two writes in the same commit batch.

**Impact.** Astrographer `docs/specs/gnosis-offload-proposal.md` amendment A12; without it the parked
engine track cannot satisfy `RAG-AUTHORITATIVE`/`CONTENT-EDIT-RE-TRAVERSAL`.

---

## GR-6 — Bulk markdown ingestion with progress, cancellation and a cap (P2, destination)

**Problem.** The shell's `edit.import_markdown` parses markdown (files + directory expansion), validates
doc-flow and applies the corpus as ONE atomic batch with a 512-file fail-loud cap and a one-shot
`IPC_IMPORT_RESULT`. The engine has **no markdown parser, no bulk-ingest route, no batch-atomic route and no
progress/cancel contract**, so moving that work to the engine (the user's stated incentive for splitting
document handling) is currently impossible.

**Live evidence.** Route list in GR-4 (no import/ingest route); the shell's atomicity + cap semantics live in
`src/main/markdown-import.ts` (`applyBatch`, `MAX_IMPORT_FILES = 512`) with the broadcast shape in
`src/shared/types.ts` (`ImportResultPayload`).

**Requested contract (if/when this track is scheduled).**
1. `POST /import` accepting either `{files:[paths]}` + a server-fixed corpus root, or
   `{markdown:[{documentId, text}]}` — with the engine owning the PARSE + doc-flow VALIDATE + APPLY.
2. **Atomicity preserved**: the whole corpus commits as one journal entry, or nothing does.
3. A **cap** with a structured fail-loud result (`{ok:false, reason:"cap-exceeded", cap:N}`), and
   **progress + cancellation** (chunked commits or an SSE progress stream).
4. A document **path/segment model** carried on ingest (the shell's navigator needs `path` per document to
   render a directory tree; today the shell's store returns `path: []` for everything).

**Acceptance.** Importing a 200-file corpus: one commit, one result, progress observable during the run,
cancellation leaves no partial commit, and over-cap input imports NOTHING with a machine-readable reason;
each imported document carries its path segments.

**Impact.** Astrographer parked track O-7 (`docs/pending.md`) + the navigator tree work
(`DOC-NAV-NOT-A-TREE`). **Not required by any measured freeze** — parked with an external trigger.

---

## GR-7 — Server-side persistence for the engine store (P2, destination)

**Problem.** The engine's server constructs an **in-memory** store and persists nothing, so an engine-owned
corpus would not survive a restart and there is no "who owns the durable corpus" answer.

**Live evidence.** `../Gnosis/src/bin/gnosis_server.rs:324` → `let store = Arc::new(Store::new());` with
only `--port` in the CLI; the store trait's persistence seam is a trait with no disk implementation shipped
in the server binary.

**Requested contract.** A durable store for the server (path/config via env or CLI), with load-at-boot and
write-through/atomic-commit semantics, and a documented answer for a concurrent local store (who is
authoritative, how a reconciliation happens, and what the revision means across a restore).

**Acceptance.** Write a document + graph, restart the server, and read the same revision back; an injected
write failure leaves the previous revision intact (no torn store).

**Impact.** The prerequisite for the parked authority switch (Astrographer `docs/pending.md` O-8, decision
`SINGLE-WRITER-STORE` amendment) — without it the engine cannot own the corpus.

---

## GR-8 — Route the enrichment / traversal surfaces the consumer needs (P3, destination)

**Problem.** The enrichment surfaces the parked **F4-LLM** integration would drive
(`declareCommunity`/`updateCommunitySummary`/`resolveEntities`/`mergeFacts`) are **not routed** on the
server — nine probed traversal/community/enrichment paths returned 404. There is also no text-generation
provider seam (the wired ollama provider is embed-only), so LLM-mediated enrichment cannot run at all.

**Live evidence.** 404s on the probed enrichment/traversal paths (`docs/specs/gnosis-enrichment-live-report-2026-09-15.md`); the shell verified both ollama models serving
(`embeddinggemma` + `gemma4:e4b-it-q8_0`) but neither project has a text-generation consumer.

**Requested contract.** Route the enrichment surfaces the suite needs (a minimal MVP: community declare +
summary update + entity resolve + fact merge), each with the existing manual-override-authoritative
semantics, and state whether a text-generation provider seam is in scope (if yes, shape it like the
embedding provider: provider-agnostic, configurable).

**Acceptance.** Each routed surface answers a well-formed request with a typed result and rejects malformed
input with a structured error; an end-to-end enrichment pass over a small corpus is reproducible.

**Impact.** Astrographer parked F4-LLM integration + `docs/pending.md` engine-track row; no measured
consumer freeze depends on it.

---

## GR-9 — Mutating-surface authorization for a machine caller (P3, quality)

**Problem.** The shell's document-CRUD path through the engine is refused (`caller has no edit authority`)
in the configurations exercised, and there is no documented contract for what a machine caller must present
to be allowed to mutate (the shell's bulk ingest would need it). **Note (engine-repo context):** the engine's
own `docs/HANDOFF.md` records that RBAC enforcement was re-scoped to the SHELL (the P2 server threads
`caller` through request decoding only). This request therefore asks for the **documented caller contract +
the structured denial code**, NOT for new engine-side enforcement.

**Live evidence.** `gnosis.document.update` via the shell's engine path → `caller has no edit authority`;
`docs/decisions.md` `GNOSIS-RBAC-EDIT-ENFORCEMENT` (consumer side).

**Requested contract.** A documented caller/authority model for the mutating routes (what a caller presents,
what authority is required per route, and how a service/machine caller is provisioned), plus a structured
error code for a denial (already present — please document the contract, not just the code).

**Acceptance.** A documented happy path where a provisioned machine caller performs a mutation, and a
documented denial path with its code.

**Impact.** Needed if the engine ever owns writes (GR-6/GR-7); informational today.

---

## Appendix A — how these were discovered (so they are reproducible)

Consumer-side battery: `docs/specs/gnosis-enrichment-live-report-2026-09-15.md` (the rows UF-GNOSIS-1..6
with raw payloads), `docs/specs/gnosis-offload-proposal.md` §3.1/§3.2 (the architecture ruling) and
`docs/specs/gnosis-offload-review.md` (the change-impact analysis). Engine start used here:
```bash
GNOSIS_SERVER_OLLAMA_URL=http://127.0.0.1:11434 GNOSIS_SERVER_OLLAMA_MODEL=embeddinggemma \
  ../Gnosis/target/debug/gnosis-server --port 8080
curl -s http://127.0.0.1:8080/engine/status         # → state: Ready, all subsystems true
```

## Appendix B — what the consumer will do when each request lands

| Request | Consumer-side follow-up (already tracked) |
| --- | --- |
| GR-1, GR-2 | fix the shell's engine client envelope + reconcile `unit-gn-engine-integration.md:454`; then re-enable the engine query path |
| GR-3 | re-run the gnosis live battery's vector/hybrid rows; clear `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT` |
| GR-4, GR-5 | implement the parked offload track's snapshot consumer (the `RagSnapshotPayload {…, revision}` seam) |
| GR-6, GR-7 | schedule the parked authority-switch unit (O-8) before O-6/O-7 |
| GR-8 | un-park the F4-LLM integration |
| GR-9 | document the caller contract in the consumer's gnosis spec |
