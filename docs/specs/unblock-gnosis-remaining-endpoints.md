# Roadmap Spec — Unblock the Gnosis Remaining Endpoints: the full `RagStore` CRUD + Graph Surface (document CRUD + graph operations, D4 parity)

- **Status:** **ROADMAP / PLANNING SPEC — DRAFT (2026-09-10, REVISED for the
  document-CRUD MVP scope + the two binding decisions)** — a forward-looking
  feature-set enumeration (NOT a TDD unit spec, so **no Property register**). It
  enumerates the full feature set required to **unblock** the deferred Gnosis
  endpoints — the full `RagStore` CRUD + graph-operations surface — through the
  Astrographer MCP/UI (D4 parity), in addition to the shipped **retrieval trio +
  health**. **The MVP is scoped to document CRUD only** (Binding decision 2); the
  graph/fact/consistency/RAG-companion surfaces are recorded as **deferred
  follow-ons, NOT gates**. It is a planning/roadmap artifact: it names the units,
  the gating prerequisites, the gaps, and the costs-benefits. It does **NOT**
  author tests, implementation, or a Property register. It is **read-only** with
  respect to `src/` and `tests/`.
- **Format:** compile-horizon-review (status / what it asks / feasibility verdict /
  the units + gaps / costs-benefits), per the implementation guide's format.
- **Authoritative sources (the contract set):**
  - `../Gnosis/docs/specs/gnosis.md` — §4.1 (document store CRUD), §4.2 (knowledge
    graph), §4.3 (fact/citation), §4.4 (consistency), §4.6 (query surfaces), §6
    (fail-states), §4.1.5 (`RagStore` seam), §4.6.2 (no engine MCP/GUI; the
    "engine is optional" framing).
  - `../Gnosis/docs/integrations/astrographer-interface-implementation.md` — §1/§2
    (ownership: server = separate thin binary crate; shell owns the client), §4
    (the API surface: §4.1 document store 11 methods, §4.2 knowledge graph 18
    methods, §4.3 fact/citation 6 methods, §4.4 consistency 4 methods, §4.5 RAG),
    §10.4 (CRUD routing deferred until the engine freezes CRUD wire shapes).
  - `../Gnosis/docs/specs/engine-wire-contract.md` — the F2 wire surface (retrieval
    trio + health ONLY), the §11 HTTP-status map, the golden vectors V-1..V-9,
    §14 (the later-units ownership list, incl. **item 4: "Full `RagStore` persistence
    CRUD routing"**).
  - `../Gnosis/src/store/mod.rs` — the `pub trait RagStore` (the 45-method surface).
  - `docs/specs/unit-gn-engine-integration.md` — the retrieval-trio client that
    shipped (Unit GN, LANDED).
  - `docs/specs/unit-gn-mcp-ui-wiring.md` — the retrieval-trio wiring unit (the
    `gnosis.*` tools + scoped GUI panes), **LANDED (2026-09-10)**.
  - `docs/decisions.md` — **GNOSIS-CRUD-SURFACE-CONFIRMED** (DECIDED/ACTIVE, 2026-09-10);
    `docs/pending.md` — the deferred CRUD row; the live-pending-battery handoff.
- **Binding decisions folded into this revision (2026-09-10):**
  - **H1 — store authority (REPLACES the prior H1 framing):** Gnosis **supplants**
    the existing document store of Astrographer. The A2 document-CRUD screens ARE
    the document surface over the engine — **NOT a second editor, NO sync to the
    shell's local store**. The local `createJsonRagStore` becomes the **D2 fallback**
    when the engine is absent (per the contract's "engine is optional" framing,
    gnosis.md §4.6.2). The intended architecture is that the RAG data container is
    the Provident graph, and **Gnosis IS the Provident graph engine** — pointing
    Astrographer at Gnosis is the correct architecture, not a divergence. (Verified:
    the local store is already graph-based — `RagNode` is "one knowledge-graph
    object. OWNS a subtree of provident nodes", `rag-store.ts:98` — so there is
    **NO drift/defect to record**.)
  - **MVP scope (document-CRUD only):** Astrographer MVP does not need
    community/fact access, only document. **IN MVP:** **P1a** (document-CRUD wire
    shapes, the 11 §4.1 methods), **P2** (`gnosis-server` binary crate hosting the
    retrieval trio + document-CRUD endpoints), **A1** (document-CRUD routing proxy
    client), **A2** (document CRUD D4 wiring). **DEFERRED (out of MVP, recorded as
    follow-ons, NOT gates):** **P1b** (graph wire /18), **P1c** (fact wire /6),
    **P1d** (consistency wire /4), **P1e** (RAG-companion wire /3), and **A3**
    (graph-ops wiring), **A4** (fact/citation wiring), **A5** (consistency wiring).
- **Output-owner role:** spec_writer / SPEC-DOC (this document); the TestWriter and
  Implementer roles are NOT invoked by a roadmap spec.
- **Page-design note (repo divergence):** this roadmap exposes GUI screens (full
  CRUD D4 parity), but **this repo has NO `docs/skills/designing-pages.md`** (only
  `docs/skills/process-guardrails.md` exists). Per the established sibling
  convention (`docs/specs/unit-t-markdown-import.md` §"Page-design note";
  `docs/specs/unit-u4-contenteditable-editor.md` §"Page-design note";
  `docs/specs/unit-h8-operator-editor.md` §"Page-design note";
  `docs/specs/unit-gn-mcp-ui-wiring.md` §5.5), **NO such skill update is made** and
  **no test-use-case coverage matrix / demo-page index is touched**. The page-design
  impact of the CRUD screens is documented in this spec (§7.6). (The base
  instruction to update `docs/skills/designing-pages.md` only applies when that file
  exists; it does not.)

---

## 1. Status

**DRAFT — ROADMAP/PLANNING — 2026-09-10 (REVISED for the document-CRUD MVP scope +
the two binding decisions).** This is a documentation deliverable only — no code, no
tests. It enumerates the **full feature set** required to **unblock** the deferred
Gnosis document-CRUD + graph-ops endpoints and route them through the Astrographer
MCP/UI (D4 parity). **The MVP is scoped to document CRUD only** (Binding decision
2): the graph/fact/consistency/RAG-companion surfaces are recorded as **deferred
follow-ons, NOT gates**.

**Current shipped / in-flight state (the baseline this roadmap builds on):**

| Layer | State | Source |
| --- | --- | --- |
| Gnosis engine lib + `RagStore` trait (45 methods) | **EXISTING, GREEN** | `../Gnosis/src/store/mod.rs` (the `pub trait RagStore`, 45 methods) |
| Gnosis F2 wire codecs (`src/wire/`) | **LANDED (GREEN, 360 tests)** — retrieval trio + health ONLY | `../Gnosis/docs/specs/engine-wire-contract.md` |
| Astrographer `createEngineRagStore` proxy | **LANDED (Unit GN, 70/70 + 63/63 blind-greens)** — retrieval trio + health wire client | `docs/specs/unit-gn-engine-integration.md` |
| Astrographer `gnosis.*` MCP tools + scoped GUI panes | **LANDED (2026-09-10)** — the retrieval trio + health wiring | `docs/specs/unit-gn-mcp-ui-wiring.md` |
| **Full `RagStore` CRUD routing + graph ops** | **DEFERRED / BLOCKED** — (1) no frozen CRUD wire shapes; (2) no `gnosis-server` binary crate | decision `GNOSIS-CRUD-SURFACE-CONFIRMED` (ACTIVE) |

**The two blockers (the reason this roadmap exists):**
1. **No frozen CRUD wire shapes.** The F2 wire contract froze ONLY the retrieval
   trio + health (`ragQuery`/`ragStream`/`getEngineStatus` + health). There are
   **NO frozen CRUD request/response wire shapes** — the shell must NOT invent
   them unilaterally (guide §4.6/§10.4; wire contract §2). Without frozen shapes
   the shell cannot route the CRUD surface. **The MVP freezes the document-CRUD
   shapes first (P1a, the 11 §4.1 methods); the graph/fact/consistency/RAG-companion
   shapes (P1b–P1e) are deferred follow-ons.**
2. **No `gnosis-server` binary crate.** The engine lib ships **no HTTP server**
   (wire contract §14; the live-pending-battery's decisive probe confirms no
   `gnosis-server` `[[bin]]` exists). There is no live engine endpoint for the CRUD
   surface to reach. **P2 hosts the retrieval trio + the document-CRUD endpoints in
   the MVP.**

**The decision that pins this roadmap's goal (ACTIVE):** `docs/decisions.md`
**GNOSIS-CRUD-SURFACE-CONFIRMED** — "the app's document/graph CRUD MCP/UI actions
ARE the intended future surface for the Gnosis `RagStore` CRUD routing (D4 parity
at the shell, via the proxy seam)." The current retrieval-trio wiring unit is the
**correct FIRST wiring increment**; the CRUD surface is a **SEPARATE, later unit**
gated on the Gnosis crate freezing the **45-method** `RagStore` CRUD wire shapes +
the `gnosis-server` binary crate. **This revision scopes the first CRUD increment
to document CRUD only (P1a + P2 + A1 + A2), per Binding decision 2.**

**The two binding decisions (2026-09-10) that this revision folds in:**
- **H1 — store authority:** Gnosis **supplants** the existing document store of
  Astrographer. The A2 document-CRUD screens ARE the document surface over the
  engine — NOT a second editor, NO sync to the shell's local store. The local
  `createJsonRagStore` becomes the **D2 fallback** when the engine is absent
  (gnosis.md §4.6.2). The RAG data container is the Provident graph, and **Gnosis
  IS the Provident graph engine** — pointing Astrographer at Gnosis is the correct
  architecture, not a divergence. (Verified: the local store is already
  graph-based — `rag-store.ts:98` — so there is **NO drift/defect to record**.)
- **MVP scope (document-CRUD only):** **IN MVP:** P1a, P2, A1, A2. **DEFERRED
  (follow-ons, NOT gates):** P1b–P1e and A3/A4/A5.

---

## 2. What the roadmap asks (the goal)

**Goal (MVP):** expose the **Gnosis document-CRUD surface** through the
Astrographer MCP/UI — the **`RagStore` document store** surface (§4.1 of the Gnosis
behavior contract, the 11 document/wiki methods) — achieving **D4 MCP-GUI parity**
at the shell, in **addition to** the already-shipped retrieval trio + health. **The
MVP is document CRUD only** (Binding decision 2): the graph/fact/consistency/
RAG-companion surfaces are **deferred follow-ons, NOT gates**.

Concretely, the roadmap unblocks (in the MVP):

1. **The frozen document-CRUD wire shapes (P1a).** A new Gnosis `src/wire/`
   extension freezing the **11 §4.1 document-CRUD request/response wire shapes**
   (extending the F2 envelope + error codec + §11 HTTP-status map), **including the
   REST endpoint-path ownership** (H4 — the document-CRUD endpoint paths are pinned
   in P1a so P2 and A1 consume the same paths). This is the **blocker** — without it
   the shell cannot route the document-CRUD surface.
2. **The `gnosis-server` binary crate (P2).** The deferred server host (axum/hyper/
   tower, loopback bind, the retrieval-trio + document-CRUD REST endpoints, the
   READY lifecycle) — the live engine endpoint the document-CRUD routing reaches.
3. **The Astrographer-side wiring units (A1 + A2).** After the two prerequisites:
   the document-CRUD routing proxy client (A1) + the document-CRUD MCP tools + GUI
   screens (A2, D4 parity).

**What is NOT in the MVP goal (deferred follow-ons, NOT gates):** the graph-ops
wiring (A3, §4.2), the fact/citation wiring (A4, §4.3), the consistency wiring
(A5, §4.4), and their wire units (P1b graph /18, P1c fact /6, P1d consistency /4,
P1e RAG-companion /3). Also NOT in the goal: the parked retrieval layers (F3
adaptive RAG routing, F4 community summaries, F5 LLM-generated dynamic graph
query), the RAG-evaluation harness (F6), the Astral push transport, the
Zodiac/Solomon/Firmament/Emerald interconnection edges, and RFC-4122 id adoption.

---

## 3. Feasibility verdict

**VERDICT: FEASIBLE-WITH-PREREQUISITES** (a gated sequence, not a feasibility
question). **The MVP (document CRUD) is the least-risk slice of the full surface.**

**Reasoning.**
- **The engine surface already exists.** The full 45-method `RagStore` trait is
  implemented and green in `../Gnosis/src/store/mod.rs` (document store §4.1,
  knowledge graph §4.2, fact/citation §4.3, consistency §4.4, RAG §4.5). Every CRUD
  method, signature, return shape, and fail-state is already pinned in the behavior
  contract (`../Gnosis/docs/specs/gnosis.md` §4.1–§4.6, §6 FS-1..FS-26). There is
  **no engine logic to invent** — only the wire serialization + server host + shell
  routing. **The MVP needs only the §4.1 document surface (11 methods).**
- **The wire codec + status map already cover the CRUD error taxonomy.** The F2
  `StoreError::wire_code()` table and the §11 HTTP-status map are **already total
  over all 21 StoreError variants**, including every document-CRUD fail-state
  (`DocumentNotFound` 404, `WikiNotFound` 404, `ValidationError` 400, `ConflictError`
  **409** mandated, `DocumentInUse` 409, `InvalidState` 409, `UnresolvedReference`
  422). The document-CRUD wire-extension therefore adds **request/response body
  codecs for the 11 §4.1 methods** — it does NOT add new wire codes or new HTTP
  statuses **within the `StoreError` taxonomy** (the "no new statuses" claim is
  qualified to the `StoreError` taxonomy — see NEW-2, §5.1).
- **The client + wiring patterns are frozen and replicable.** Unit GN pinned the
  decode-then-validate decoder, the `EngineRagStore` proxy surface, the loopback +
  auth/TLS policy, the D2 engine-absent framing, and the §11 map. Unit GN-MCP-UI
  pinned the `gnosis.*` MCP tool + GUI-pane + security-group + audit-log wiring.
  The document-CRUD wiring reuses all of these patterns mechanically.
- **The transport is the shell's decision (already made),** the server is a
  separate thin binary crate in the Gnosis workspace (guide §2) — the engine lib
  stays at zero new runtime deps.
- **The MVP is a strict subset.** Document CRUD (11 methods) is the smallest
  coherent D4 surface; it exercises the full wire/server/client/wiring stack once,
  and the deferred units (P1b–P1e, A3–A5) reuse the same stack mechanically.

**Gaps that gate finalization (NOT feasibility gaps — sequencing gaps):**
- The **document-CRUD wire-contract unit (P1a)** must land before any document-CRUD
  routing (the shell must not invent wire shapes).
- The **`gnosis-server` binary crate (P2)** must land before any document-CRUD live
  test / the live-scenario battery (the shell needs a live endpoint to route to).
- The shell-side **document-CRUD routing proxy client (A1)** is gated on P1a for the
  unit (P3 — P2 is required only for the live-scenario battery, so A1 is
  parallelizable with P2).

---

## 4. The full surface — the "remaining endpoints" (grouped by concern)

> This is the complete `RagStore` CRUD + graph method surface that the deferred
> routing must expose. Method counts match the implementation guide §4 (§4.1 = 11,
> §4.2 = 18, §4.3 = 6, §4.4 = 4; §4.5 = 6) = **45 `RagStore` trait methods**. The
> **retrieval trio + health** (§4.5: `ragQuery`/`ragStream`/`getEngineStatus` +
> health) already crossed the wire in Unit GN. The **"remaining endpoints"** =
> the 42 not-yet-wired methods: **39 CRUD + graph + facts + consistency** methods
> (§4.1–§4.4) plus the **3 remaining RAG-surface companions** (`bm25Search`,
> `vectorSearch`, `getProfileSummary`) that are not part of the trio.
>
> **MVP scope (Binding decision 2):** **§4.1 (document, 11 methods) is the MVP
> in-scope surface.** §4.2 (graph, 18), §4.3 (fact/citation, 6), §4.4 (consistency,
> 4), and the RAG companions (§4.5, 3) are **deferred follow-ons, NOT gates** — they
> are enumerated here as the complete reference, but they are NOT part of the MVP
> wire/server/client/wiring sequence.
>
> The authoritative per-method signature / return shape / fail-state tables are the
> Gnosis behavior contract `../Gnosis/docs/specs/gnosis.md` §4.1.3, §4.2.5–§4.2.9,
> §4.3.1–§4.3.4, §4.4.4, §4.5.4, §4.6.1 and the `RagStore` trait
> `../Gnosis/src/store/mod.rs`. This section names the **groups and the methods**;
> it does NOT re-derive each signature (that is the CRUD wire-contract unit's job,
> §5.1).

### 4.1 Document store (§4.1) — 11 methods — **MVP IN-SCOPE**
`createDocument`, `getDocument`, `updateDocument`, `deleteDocument`,
`publishDocument`, `unpublishDocument`, `archiveDocument`, `listDocuments`,
`createWiki`, `getWiki`, `listWikis`.
- **Key states/fail-states to freeze in the wire shapes:** the §4.1.1 state machine
  (`DRAFT→PUBLISHED→ARCHIVED`), §4.1.4 optimistic concurrency (`ConflictError`,
  HTTP **409** mandated), `listDocuments` pagination bounds, `WikiNotFound` /
  `DocumentNotFound` / `ValidationError` / `DocumentInUse` / `InvalidState` /
  `UnresolvedReference` (§4.4.3 publish gate).
- **This is the MVP wire unit (P1a), the MVP server surface (P2), and the MVP
  wiring surface (A1 + A2).**

### 4.2 Knowledge graph (§4.2) — 18 methods — **DEFERRED (follow-on, NOT a gate)**
`edgesFrom`, `edgesTo`, `edgesByKind`, `edgesForDocument`, `docHeadForDocument`,
`resolveReferences`, `addTriple`, `getTriples`, `queryTriples`, `declareCommunity`,
`getCommunity`, `listCommunities`, `updateCommunitySummary`, `setReferenceState`,
`resolveEntities`, `entityAliasCanonical`, `mergeFacts`, `getCommunityContext`.
- **Key states/fail-states to freeze (when P1b lands):** §4.2.5 adjacency methods;
  §4.2.6 topological `reference→fact` resolution (`CycleDetected`, `HopLimitExceeded`);
  §4.2.7.3 triple ops; §4.2.8 manual override (communities); §4.2.9 entity
  resolution / fact merge (`ConflictError`, the §4.3.2 minimum-citation invariant);
  `CommunityNotFound`.

### 4.3 Fact/citation (§4.3) — 6 methods — **DEFERRED (follow-on, NOT a gate)**
`getFact`, `createFact`, `listFacts`, `updateFact`, `proposeCandidateFact`,
`getQueryAuditLog`.
- **Key states/fail-states to freeze (when P1c lands):** §4.3.1 fact nodes /
  `factKey` uniqueness; §4.3.2 minimum-citation invariant (`fact requires at least
  one citation`); §4.3.2a candidate-fact pipeline (the deterministic fail-closed
  gate, the machine-actionable `Rejection` `{code, field, message}`, no partial
  commit); `getQueryAuditLog` (returns `QueryAuditEntry[]` — §4.3.4; engine-side
  recording, shell-side MCP/GUI panel is D4 parity).

### 4.4 Consistency (§4.4) — 4 methods — **DEFERRED (follow-on, NOT a gate)**
`getConsistencyReport`, `reSyncEmbed`, `reDeriveCommunity`, `communityState`.
- **Key states/fail-states to freeze (when P1d lands):** §4.4.2 reference states
  (`FRESH`/`STALE`/`RESOLVED`/`BROKEN`); §4.4.3 enforcement + re-sync + re-derive;
  §4.4.4 the consistency-report shape; §4.4.1a community staleness.

### 4.5 RAG / agent-memory (§4.5/§4.6.1) — 6 methods (trio already shipped)
`ragQuery` ⚡, `ragStream` ⚡, `getEngineStatus` ⚡, `bm25Search`, `vectorSearch`,
`getProfileSummary`.
- ⚡ = the **retrieval trio** — **ALREADY WIRED** (Unit GN + the GN-MCP-UI wiring
  unit, LANDED 2026-09-10). `bm25Search`/`vectorSearch`/`getProfileSummary` are
  **NOT** part of the trio and remain unwired — they are **deferred follow-ons
  (P1e), NOT gates**. **H5:** `vectorSearch` takes `&dyn EmbeddingProvider`
  (non-Serialize) — a deferred wire-shape obligation (the provider must be
  server-injected when P1e lands), NOT an MVP blocker.

**Method count reconciliation.**
- Full `RagStore` trait: **45** methods (§4.1 11 + §4.2 18 + §4.3 6 + §4.4 4 +
  §4.5 6). This is the "45-method CRUD wire shapes" figure in
  `GNOSIS-CRUD-SURFACE-CONFIRMED` and the guide §4. (The wire contract §1's "34
  methods" is an **older count from before the §4.2–§4.5 TestWriter surfaces
  landed**; the current trait is 45. The CRUD wire-contract unit (§5.1) must pin the
  true current count — a proofreader/staleness discipline.)
- CRUD + graph + facts + consistency (the D4 document/graph CRUD focus): **39**
  (§4.1–§4.4).
- Remaining-to-wire total (all 45 minus the 3-method trio): **42**.
- **MVP in-scope (document CRUD, §4.1):** **11** methods. **Deferred (follow-ons):**
  **31** (§4.2 18 + §4.3 6 + §4.4 4 + §4.5 companions 3).

---

## 5. The prerequisite units (the gating feature set) on the Gnosis side

These are the **blockers**. Neither can be shipped by the shell; both are
**Gnosis-workspace** work. They are the **inputs** to the Astrographer-side wiring
(§6). **NEW-1/RCA-5:** the CRUD wire-contract unit is **decomposed by concern**
(P1a–P1e); the MVP scope naturally satisfies this — **P1a (document /11) is the MVP
wire unit; P1b–P1e are deferred follow-ons.**

### 5.1 Prerequisite 1 — the document-CRUD wire-contract unit (P1a, the PRIMARY blocker)
**Unit:** a new Gnosis `src/wire/` extension (e.g. `src/wire/crud.rs` +
`src/wire/crud/*`), freezing the **11 §4.1 document-CRUD request/response wire
shapes** (the MVP wire unit). **It extends, does not replace, the F2 wire layer.**
The graph/fact/consistency/RAG-companion wire shapes are **deferred follow-ons**
(P1b–P1e), NOT part of this unit.

- **What it must pin (a full TDD unit — the TestWriter derives every state/fail-
  state):**
  - **Envelope/versioning.** Every CRUD request + response is wrapped in the F2
    `Envelope` (`{schemaVersion, idFormat, payload}`, `CURRENT_SCHEMA_VERSION=1`,
    `idFormat:"opaque-string-v1"`) — the UUID-v4 deferral seam is reused unchanged
    (ids cross as opaque strings). A CRUD request is a **request envelope** (a
    request method + args in `payload`); a CRUD response is a **response envelope**
    (the result body, or `{"code","message"}` error via the non-chunk codec).
  - **The request/response body codecs.** For the 11 §4.1 methods: the serde-frozen
    body shapes reuse the existing store types' serde output (snake_case field keys,
    PascalCase enum-unit values, id newtypes as bare strings, externally-tagged
    enums where applicable) — the F2 "body via serde, don't re-case" rule. New wire
    wrapper types (a CRUD request/response discriminator, e.g. a `"method"` field +
    the per-method request/response bodies) use camelCase at their top level, per F2
    §4.
  - **The CRUD request/response encode + decode.** `encode_crud_request(method,
    args) → Envelope`, `decode_crud_request(env) → (method, args)`;
    `encode_crud_response(result) → Envelope`, `decode_crud_response(env) →
    result | StoreError`. Round-trip identity for every method (mirroring F2 §6).
  - **decode-then-validate for CRUD responses.** A malformed CRUD response body →
    `EngineError` (502); a well-formed body failing a CRUD-specific invariant (e.g.
    `createDocument` must yield the documented `Document` shape / `revision`
    semantics) → the appropriate `ValidationFailure` outcome. The F2 precedence
    pattern (fail-fast on the discriminator, then the body) is reproduced.
  - **The error codec + §11 map are UNCHANGED (21 rows) — qualified to the
    `StoreError` taxonomy (NEW-2).** The existing `wire_code()` table and the §11
    HTTP-status map already cover every document-CRUD fail-state (§3). The CRUD unit
    reuses them verbatim and asserts exhaustiveness (a proofreader checks no new
    `StoreError` variant needs a new code — the current 21 are total). **NEW-2:** a
    **malformed CRUD request / unknown method is NOT a `StoreError` variant and has
    NO §11 row** — P1a must define the **server-side request-decode outcome** (e.g.
    **400/422, NOT 502**) and qualify the "no new statuses" claim to the `StoreError`
    taxonomy (the request-decode outcome is a transport-level status, not a
    `StoreError` wire code).
  - **REST endpoint-path ownership (H4).** P1a pins the **document-CRUD endpoint
    paths** so P2 (server) and A1 (client) consume the SAME paths. The pinned paths
    (the MVP set):
    - `POST /documents` — `createDocument`
    - `GET /documents/:id` — `getDocument`
    - `POST /documents/:id/update` — `updateDocument`
    - `POST /documents/:id/publish` — `publishDocument`
    - `POST /documents/:id/unpublish` — `unpublishDocument`
    - `POST /documents/:id/archive` — `archiveDocument`
    - `GET /documents` — `listDocuments`
    - `POST /wikis` — `createWiki`
    - `GET /wikis/:id` — `getWiki`
    - `GET /wikis` — `listWikis`
    (`deleteDocument` is a §4.1 method; its path is pinned by P1a alongside the
    above — the exact path is the wire contract's decision, and the shell does NOT
    invent it.) These become the shared `ENGINE_ENDPOINTS`-style constants consumed
    by both P2 and A1.
  - **SSE for the CRUD surface?** The F2 SSE framing (`event: result|done|error`,
    single-shot) is the `ragStream` transport. CRUD is request/response (no SSE
    surface); this roadmap keeps CRUD on the REST request/response codec and does
    NOT extend the SSE event schema. (Note this explicitly so the SSE contract stays
    retrieval-only.)
  - **Golden vectors.** New byte-exact vectors (V-10+, following F2 §12): a
    representative document-CRUD request envelope, a CRUD response envelope (e.g.
    `createDocument` → `Document` body), a CRUD error envelope (e.g.
    `ConflictError` → 409), round-trip identity samples across the document method
    families. These become the shared cross-repo conformance fixture (§7.5).
  - **A companion wire-property register** (the F2 `7-2-wire-property-register.md`
    pattern) — this IS a TDD wire unit, so its register is mandatory, but it is
    authored by the unit's own TestWriter, not by this roadmap.

- **Gate it depends on:** none (frozen store types already exist). It ships
  standalone in the Gnosis workspace.
- **It unblocks:** the shell-side document-CRUD routing proxy client (§6.1) and the
  golden-vector conformance for the document-CRUD shapes (§7.5). It is the PRIMARY
  blocker named in `GNOSIS-CRUD-SURFACE-CONFIRMED`.
- **Deferred wire units (follow-ons, NOT gates):** **P1b** (graph wire /18, §4.2),
  **P1c** (fact wire /6, §4.3), **P1d** (consistency wire /4, §4.4), **P1e**
  (RAG-companion wire /3, §4.5). **H5:** `vectorSearch` takes `&dyn EmbeddingProvider`
  (non-Serialize) — a **deferred wire-shape obligation** recorded for P1e (the
  provider must be server-injected when P1e lands), NOT an MVP blocker.

### 5.2 Prerequisite 2 — the `gnosis-server` binary crate (P2)
**Unit:** a new thin `[[bin]]` crate (e.g. `gnosis-server`) in the Gnosis workspace,
depending on the engine lib + axum/hyper/tower (guide §2). The **engine lib stays at
zero new runtime deps**. **In the MVP, P2 hosts the retrieval trio + the
document-CRUD endpoints (the §4.1 surface).**

- **What it must provide:**
  - **Loopback bind** to `127.0.0.1` (loopback-only by contract; the shell owns
    bind/auth/TLS policy — section §7.2).
  - **The REST + SSE endpoints.** The **retrieval trio + health** endpoints already
    pinned in `ENGINE_ENDPOINTS` (`POST /rag/query`, `GET /rag/stream` SSE, `GET
    /engine/status`) — the server host is the transport reality for the F2 wire
    surface — PLUS the **document-CRUD REST endpoints** for the 11 §4.1 methods
    (§4.1/§5.1), each accepting the request envelope and returning the response
    envelope (or the §11-mapped error). **The endpoint paths are consumed from P1a
    (H4)** — the server does NOT invent them.
  - **The READY lifecycle.** Construct `Arc<Store>` → build `DerivedIndexes` → wire
    the embedding provider → transition to `READY`; expose `getEngineStatus`
    (`READY`/`STARTING`/`DEGRADED`/`UNAVAILABLE` + subsystems). The boot wiring is
    engine-internal; the shell only observes READY.
  - **The HTTP-status rendering** of the §11 map server-side (the server maps the
    returned `StoreError` to the HTTP status + wire code). **NEW-2:** the server
    ALSO renders the **request-decode outcome** (a malformed request envelope /
    unknown method → **400/422, NOT 502**) — a transport-level status distinct from
    the `StoreError` taxonomy.
  - **An end-to-end transport test** (the §7.2 F2 benefit) against the real server:
    the `EngineUnavailable`/`EngineError` split over a live transport, plus the
    document-CRUD round-trips.

- **Gate it depends on:** PREREQUISITE 1 (§5.1) — the server hosts the
  document-CRUD endpoints, so the document-CRUD wire shapes must be frozen first
  (order: wire contract → server; the server can host the retrieval trio in
  parallel, but not the document-CRUD endpoints).
- **It unblocks:** the shell-side **live endpoint** + the **live-scenario battery**
  (the parked `unit-gn-engine-integration-live-pending-battery.md` revisit condition
  §5.1 — "the `gnosis-server` binary crate exists and builds, a live Gnosis engine is
  running behind it, and the server serves the F2 wire contract on loopback") +
  the shell document-CRUD routing (§6.1). This is the second blocker named in
  `GNOSIS-CRUD-SURFACE-CONFIRMED`.

---

## 6. The Astrographer-side wiring units (after the prerequisites)

These are the shell units that thread the frozen CRUD wire + the server into the MCP
and GUI surfaces (D4 parity), per concern. **Every CRUD feature is reachable through
BOTH the GUI and the MCP surface** (D4 parity, guide §9/§4.6.2). Each is a separate
unit (per the RCA-5 "multi-unit deliverable is split per unit" gate), each with its
own spec → TestWriter-red → Implementer-green → adversarial → blind-greens →
documentation-review cycle. **MVP scope (Binding decision 2): A1 (document-CRUD
routing) + A2 (document CRUD D4 wiring) are IN MVP; A3/A4/A5 are deferred
follow-ons, NOT gates.**

### 6.1 The document-CRUD routing proxy client (A1, the new wire client surface)
**Unit:** extend the LANDED `engine-rag-store.ts` (or a sibling
`src/main/engine-crud-rag-store.ts`) to route the **11 §4.1 document-CRUD methods**
over the frozen document-CRUD wire (`§5.1`). It reuses Unit GN's decode-then-validate,
the §11 HTTP-status map, the typed `EngineWireError` model, loopback + auth/TLS, READY
observation, and D2 engine-absent framing. It is the **same client discipline** as
the retrieval trio, applied to document CRUD.
- **New endpoint paths** (pinned constants, mirroring `ENGINE_ENDPOINTS`) — one per
  document method family, **consumed from P1a (H4)** (e.g. `POST /documents`,
  `GET /documents/:id`, `POST /documents/:id/update`, `POST /documents/:id/publish`,
  `POST /documents/:id/unpublish`, `POST /documents/:id/archive`, `GET /documents`,
  `POST /wikis`, `GET /wikis/:id`, `GET /wikis` — EXACTLY as P1a pins; the shell does
  NOT invent them).
- **Gated on (P3):** **P1a-only for the unit** (the client routes the frozen
  document-CRUD shapes); **P2 is required only for the live-scenario battery** — so
  **A1 is parallelizable with P2**.
- **Deferred-to-unit-spec (P4):** **idempotency/retry for mutating creates** is a
  required deliverable of the A1/A2 unit specs (NOT a baseline blocker).

### 6.2 Document CRUD wiring (A2, D4 parity) — 11 methods (§4.1) — **MVP IN-SCOPE**
**Unit:** the `gnosis.document.*` / `gnosis.wiki.*` MCP tools (create/get/update/
delete/publish/unpublish/archive/list documents; create/get/list wikis) + the GUI
document-editor/wiki screens. Optimistic concurrency (`ConflictError`, 409) is the
key fail-state to surface on both surfaces.
- **H1 (store authority):** the A2 document-CRUD screens ARE the document surface
  over the engine — **NOT a second editor, NO sync to the shell's local store**.
  The local `createJsonRagStore` becomes the **D2 fallback** when the engine is
  absent (gnosis.md §4.6.2). The RAG data container is the Provident graph, and
  **Gnosis IS the Provident graph engine** — pointing Astrographer at Gnosis is the
  correct architecture, not a divergence. (Verified: the local store is already
  graph-based — `rag-store.ts:98` — so there is **NO drift/defect to record**.)
- **H3 (mutating default-off security group + RBAC edit-access enforcement):** the
  mutating `gnosis.document.*` tools are gated behind a **separate mutating
  default-off security group** (per the RAG-EDIT-MCP-GROUPS pattern), **distinct
  from the read-only `gnosis` group** (the retrieval-trio group, Unit GN-MCP-UI).
  The read-only document tools (`getDocument`/`listDocuments`/`getWiki`/
  `listWikis`) may sit in the read-only `gnosis` group; the mutating tools
  (`createDocument`/`updateDocument`/`deleteDocument`/`publishDocument`/
  `unpublishDocument`/`archiveDocument`/`createWiki`) sit in the NEW mutating group
  (e.g. `gnosis-edit`), default-off, through the five-seam gate. Editing is NEVER a
  `code`-group op. **RBAC edit-access enforcement (the intended RBAC locking):**
  Gnosis accepts a **credential** on the mutating CRUD calls to confirm whether the
  caller has edit access to make the given change — the engine is the RBAC
  **enforcer**. Astrographer **stores the authority of its human/agent users** (the
  RBAC mapping of who may edit) and presents the caller's authority credential on
  each mutating call. This is distinct from the transport auth (token/TLS, GUI-only
  per the A7 carve-out): the RBAC credential is the caller's edit-authority, checked
  by the engine against the intended RBAC locking. The P1a wire contract must pin the
  RBAC credential shape; the A2 unit must wire the shell's authority store to the
  engine's RBAC check.
- **Deferred-to-unit-spec (H2):** the **optimistic-concurrency 409 UX** is a required
  deliverable of the A2 unit spec (NOT a baseline blocker).
- **Deferred-to-unit-spec (P4):** **idempotency/retry for mutating creates** is a
  required deliverable of the A1/A2 unit specs (NOT a baseline blocker).

### 6.3 Graph-ops wiring (A3, D4 parity) — 18 methods (§4.2) — **DEFERRED (follow-on, NOT a gate)**
**Unit:** the `gnosis.graph.*` MCP tools (adjacency, reference resolution, triple
ops, community declaration, entity resolution / fact merge) + the GUI graph/
traversal/community/enrichment screens. Manual override (§4.2.8) is the pinned
feature; `CycleDetected`/`HopLimitExceeded`/`CommunityNotFound` on both surfaces.
**Deferred with P1b.**

### 6.4 Fact/citation wiring (A4, D4 parity) — 6 methods (§4.3) — **DEFERRED (follow-on, NOT a gate)**
**Unit:** the `gnosis.fact.*` MCP tools (get/create/list/update facts,
propose-candidate-fact, get-query-audit-log) + the GUI facts table / audit panel.
The deterministic candidate gate's `Rejection` `{code, field, message}` is surfaced
machine-actionably on both surfaces. (The audit-log **recording** is engine-side; the
MCP `get_query_audit_log` tool + GUI audit panel are shell-side D4 parity.)
**Deferred with P1c.**
- **Deferred-to-unit-spec (P6):** **`getQueryAuditLog` coexistence with the shell's
  local audit log** is a required deliverable of the A4 unit spec (deferred with A4,
  NOT a baseline blocker).

### 6.5 Consistency wiring (A5, D4 parity) — 4 methods (§4.4) — **DEFERRED (follow-on, NOT a gate)**
**Unit:** the `gnosis.consistency.*` MCP tools (get-report, re-sync embed,
re-derive community, community-state) + the GUI consistency-panel screen (the
explainability surface, §4.4.4). `UnresolvedReference`/`InvalidState` on both
surfaces. **Deferred with P1d.**

### 6.6 Remaining RAG-surface companions (deferred follow-on, NOT a gate)
`bm25Search`/`vectorSearch`/`getProfileSummary` are part of the 45-method wire
surface (§5.1) but OUT of the §4.1–§4.4 CRUD focus. This roadmap records them as
**deferred follow-ons (P1e)** — the trio is the retrieval surface already wired; the
companions are NOT mandated for the MVP. **H5:** `vectorSearch` takes
`&dyn EmbeddingProvider` (non-Serialize) — a deferred wire-shape obligation (the
provider must be server-injected when P1e lands), NOT an MVP blocker.

---

## 7. Cross-cutting concerns

### 7.1 The §11 HTTP-status mapping for the CRUD error taxonomies
The existing 21-row §11 map is **already total over all CRUD error variants** (§3).
The CRUD wiring reuses it verbatim (`ConflictError` = **409** mandated, FS-4;
`DocumentInUse`/`InvalidState`/`CycleDetected` = 409; `UnresolvedReference`/
`HopLimitExceeded` = 422; the not-found family = 404; `ValidationError` = 400). The
CRUD wire-contract unit asserts exhaustiveness; **no new statuses are introduced
within the `StoreError` taxonomy** (NEW-2). **NEW-2:** a **malformed CRUD request /
unknown method is NOT a `StoreError` variant and has NO §11 row** — P1a defines the
**server-side request-decode outcome** (e.g. **400/422, NOT 502**) as a
transport-level status, distinct from the `StoreError` taxonomy.

### 7.2 Auth/TLS (the GUI-only carve-out)
The wire is **loopback-only by contract** (guide §8). The shell owns bind/auth/TLS.
The D4 security-configuration carve-out (engine credentials, TLS/secret management,
Astral push creds, Firmament bridge auth) remains **GUI-only at the shell** and is
**blocked from MCP access** (the Unit GN-MCP-UI §5.2 pattern). `baseUrl` is **NOT a
credential** (env/CLI config). No `gnosis.*` CRUD MCP tool accepts a credential arg.

### 7.3 D2 engine-absent behavior for CRUD — **REFRAmed (H1 + the D2 reframe)**
**Pointing Astrographer at Gnosis is NOT a local-first violation** because Gnosis
and Astrographer are intended to be **shipped together and run on the same machine**
— the engine is a **co-shipped local process, not a remote dependency** (the D2
reframe). Engine-absent = **UNAVAILABLE** (D2, guide §7). The document-CRUD routing
surfaces `EngineUnavailable` (503) for every engine-backed CRUD call when the engine
is absent/unreachable. **H1 (store authority):** Gnosis **supplants** the existing
document store of Astrographer — the A2 document-CRUD screens ARE the document
surface over the engine, NOT a second editor, NO sync to the shell's local store.
The local `createJsonRagStore` becomes the **D2 fallback** when the engine is absent
(per the contract's "engine is optional" framing, gnosis.md §4.6.2) — the shell's
local-first store and cross-link features continue to work without the engine, but
they are the **fallback**, not the primary document surface. `DEGRADED` remains a
distinct state (core store/graph/lexical still work; a non-core subsystem may be
down).

### 7.4 The live-scenario battery
The parked `unit-gn-engine-integration-live-pending-battery.md` (32 of 63 greens
rows parked) has a **revisit condition**: the `gnosis-server` binary crate exists and
builds, a live Gnosis engine runs behind it, and the server serves the F2 wire
contract on loopback. **PREREQUISITE 2 (§5.2) ends the park**: `curl
http://127.0.0.1:<port>/engine/status` returns a `HealthReport` JSON AND `POST
/rag/query` returns a V-5-style envelope. The battery must also be **extended** for
the **document-CRUD live round-trips** once the document-CRUD endpoints exist (the
MVP scope). The graph/fact/consistency live round-trips are deferred with their
units (A3/A4/A5).

### 7.5 Golden-vector byte-exact conformance for the new CRUD shapes
The F2 golden vectors V-1..V-9 are the shared cross-repo conformance artifact (guide
§11). The document-CRUD wire-contract unit adds **new document-CRUD golden vectors
(V-10+)**; the shell's document-CRUD client must consume them **byte-for-byte**
(ideally as a standalone JSON fixture in the Gnosis repo), and the
`schemaVersion`/`idFormat` handshake makes a wire-contract change fail loudly on the
shell side. Both repos run conformance against the same fixture. The deferred wire
units (P1b–P1e) add their own vectors when they land.

### 7.6 Cross-repo drift control
- **The cross-repo fixture** (golden vectors) is the shared artifact (guide §11).
- **Section-number reconciliation** (RCA-6/doc-review discipline): the guide's §4
  API-surface grouping (11/18/6/4/6 = 45) is the authoritative method-count source;
  the wire contract §1's "34 methods" is a stale count that the CRUD wire-contract
  unit's doc-review must reconcile to **45**.
- The `GNOSIS-CRUD-SURFACE-CONFIRMED` decision row stays **ACTIVE** until the CRUD
  surface lands; the `docs/pending.md` deferred-CRUD row + the
  `unit-gn-engine-integration-live-pending-battery.md` park are updated when
  PREREQUISITES 1 + 2 land.
- **Page-design divergence:** this repo has NO `docs/skills/designing-pages.md`
  (§-header note); the CRUD GUI screens' page-design impact is documented in the
  relevant wiring-unit specs (per the sibling convention), NOT in a designing-pages
  skill.

---

## 8. The execution order / dependency graph

**MVP sequence (Binding decision 2): P1a → P2 → A1 → A2.** The deferred units
(P1b–P1e, A3–A5) are shown as follow-ons, NOT gates.

```
[MVP]
[P1a] document-CRUD wire-contract unit (Gnosis src/wire/ extension)  ← PRIMARY BLOCKER
     │  freezes the 11 §4.1 document-CRUD request/response shapes,
     │  pins the REST endpoint paths (H4), reuses the F2 envelope/error/§11 map,
     │  defines the request-decode outcome (NEW-2), adds V-10+ vectors
     ▼
[P2]  gnosis-server binary crate (Gnosis, axum/hyper/tower)           ← SECOND BLOCKER
     │  loopback bind; retrieval-trio endpoints host the F2 wire;
     │  document-CRUD REST endpoints host the frozen shapes (paths from P1a);
     │  READY lifecycle
     ▼
[A1]  document-CRUD routing proxy client (Astrographer engine-rag-store.ts surface)
     │  routes the 11 §4.1 methods over the frozen wire
     │  (P3: gated on P1a-only for the unit → parallelizable with P2;
     │   P2 required only for the live-scenario battery)
     ▼
[A2]  Document CRUD wiring (§4.1) — 11 methods — MCP tools + GUI  [D4]  ← MVP
     │  H1 store authority; H3 mutating default-off security group
     │
     ├─ Live-scenario battery (revisit + extend the parked battery for document CRUD)
     └─ (follow-ons, NOT gates) P1b–P1e + A3/A4/A5 + the RAG companions
```

- **What unblocks what:** P1a unblocks A1 (the shell must not invent wire shapes);
  P2 unblocks A1's live endpoint + the live battery (and is ordered after P1a because
  the document-CRUD endpoints host the frozen shapes; the retrieval-trio host can
  land in parallel); A1 unblocks A2 (the document-CRUD wiring consumes the same
  client surface). **P3:** A1 is gated on **P1a-only for the unit** (P2 only for the
  live-scenario battery), so **A1 is parallelizable with P2**.
- **Deferred follow-ons (NOT gates):** P1b (graph wire /18) → A3 (graph-ops wiring);
  P1c (fact wire /6) → A4 (fact/citation wiring); P1d (consistency wire /4) → A5
  (consistency wiring); P1e (RAG-companion wire /3) → the RAG-companion wiring. Each
  deferred wiring unit is **independent of the others** and can be delegated per unit
  (RCA-5 hard gate — never one inline pass).
- **The retrieval-trio wiring unit (`unit-gn-mcp-ui-wiring`)** is the **current
  first wiring increment** and is INDEPENDENT of this roadmap — it is **LANDED
  (2026-09-10)**; the document-CRUD units are the SEPARATE, later sequence.

---

## 9. Costs / benefits + risks

### 9.1 Costs
| Cost | Effort | Notes |
| --- | --- | --- |
| A new **document-CRUD wire-contract unit (P1a)** (Gnosis `src/wire/` extension, ~11 request/response body codecs + decode-then-validate + the request-decode outcome (NEW-2) + the endpoint-path pinning (H4) + V-10+ golden vectors + a property register) | Medium | The MVP blocker. Reuses the F2 envelope/error/§11 map (no new `StoreError` codes/statuses). Smaller than the full 45-method wire unit (P1b–P1e are deferred). |
| A **`gnosis-server` binary crate (P2)** (axum/hyper/tower, loopback bind, REST + SSE endpoints, READY lifecycle, e2e transport test) | Medium | A new `[[bin]]` in the Gnosis workspace; the engine **lib** stays at zero new runtime deps (only the bin gains axum/tower). |
| The **Astrographer document-CRUD wiring (A1 + A2)** (the proxy-client surface + MCP tools + GUI screens) | Medium (split across A1–A2) | Reuses the Unit GN/Unit GN-MCP-UI patterns mechanically; 11 document methods across 2 D4 units. |
| **Cargo.lock impact** | Low-Medium | The `gnosis-server` bin introduces new dev/runtime crates (axum/hyper/tower) into the Gnosis Cargo.lock — a reviewable dependency addition scoped to the bin, not the lib. |
| **Deferred follow-ons (P1b–P1e, A3–A5)** | Deferred (NOT in the MVP cost) | Recorded as follow-ons; they reuse the MVP wire/server/client/wiring stack mechanically when they land. |

### 9.2 Benefits
- **The app's document CRUD MCP/UI actions get a real Gnosis surface** — the
  intended future surface confirmed by `GNOSIS-CRUD-SURFACE-CONFIRMED`. The
  Astrographer shell stops exposing only the retrieval trio over the proxy seam and
  exposes the **document-CRUD** surface (D4 parity) in the MVP.
- **H1 (store authority):** Gnosis supplants the document store — the A2
  document-CRUD screens ARE the document surface over the engine (no second editor,
  no sync to the shell's local store). The RAG data container is the Provident
  graph, and Gnosis IS the Provident graph engine — the correct architecture, not a
  divergence.
- **D2 engine-absent degrades** without losing the shell's local-first store (the
  `createJsonRagStore` fallback), and pointing at Gnosis is NOT a local-first
  violation (Gnosis ships together with Astrographer on the same machine).
- **The live-scenario battery un-parks** (P2) and the end-to-end
  `EngineUnavailable`/`EngineError` split is confirmed over a real transport.
- **Cross-repo drift is controlled** by the shared golden-vector fixture (V-1..V-9 +
  V-10+).
- **The MVP is a strict subset** — document CRUD (11 methods) exercises the full
  wire/server/client/wiring stack once; the deferred units reuse it mechanically.

### 9.3 Risks
| Risk | Likelihood / Impact | Mitigation |
| --- | --- | --- |
| **CRUD wire-shape invention** (the shell invents request/response shapes the engine does not freeze) | Low-High (it is the explicit blocker) | P1a (the document-CRUD wire-contract unit) MUST land before any routing; the shell never routes un-frozen shapes (guide §4.6/§10.4 hard rule). |
| **Endpoint-path divergence** (P2 and A1 invent different paths) | Medium | H4 — P1a pins the document-CRUD endpoint paths; P2 and A1 consume the SAME paths. |
| **`Cargo.lock` impact of the server crate** (axum/hyper/tower in the Gnosis workspace) | Medium-Low | Scope the new deps to the `gnosis-server` bin; the engine lib stays at zero new runtime deps. Reviewable in the bin's Cargo.toml. |
| **D4 parity scope creep** (mandating GUI+MCP for EVERY engine feature beyond the MVP) | Medium | The MVP scopes D4 to the document-CRUD concern (§4.1); the graph/fact/consistency/RAG-companion surfaces (A3–A5, P1b–P1e) and parked surfaces (F3/F4/F5/F6) are explicitly deferred follow-ons, NOT gates. |
| **Method-count drift** (the guide §4's 45 vs the wire contract §1's stale 34) | Medium-High (doc-drift) | The CRUD wire-contract unit's doc-review (RCA-6) reconciles to 45; the proofreader catches stale counts. |
| **`communityState`/`communityContext` vs the §4.4.4-report tension** (community staleness surfaced independently of the reference-typed report) | Medium (deferred) | Already resolved in the store (`CommunityState` accessor + `getCommunityContext`); the CRUD wire shapes carry the store's resolved types verbatim. Deferred with P1b/P1d. |
| **Request-decode outcome ambiguity** (a malformed request / unknown method mis-mapped to 502) | Medium | NEW-2 — P1a defines the server-side request-decode outcome (400/422, NOT 502) as a transport-level status distinct from the `StoreError` taxonomy. |

---

## 10. Output / owner

- **Spec file:** `docs/specs/unblock-gnosis-remaining-endpoints.md` (this document).
- **Author-role:** spec_writer / SPEC-DOC. **Read-only** with respect to `src/` and
  `tests/` — no code, no tests, no Property register.
- **Hand-off to:** the Gnosis-side TestWriter/Implementer for PREREQUISITE 1 (§5.1,
  P1a), PREREQUISITE 2 (§5.2, P2), and the Astrographer-side TestWriter/Implementer
  for the wiring units A1–A2 (§6). The deferred units (P1b–P1e, A3–A5) are recorded
  as follow-ons, NOT handed off in the MVP. **RBAC handoff (H3):** Gnosis accepts a
  credential on the mutating CRUD calls to enforce the intended RBAC edit-access
  locking (the engine is the RBAC enforcer); Astrographer stores the authority of its
  human/agent users and presents the caller's authority credential on each mutating
  call. The P1a wire contract must pin the RBAC credential shape; the A2 unit must
  wire the shell's authority store to the engine's RBAC check.
- **Trackers to update when the roadmap is consumed (per the doc-flow gate):**
  `docs/decisions.md` (keep `GNOSIS-CRUD-SURFACE-CONFIRMED` ACTIVE → flip to LANDED
  family as the CRUD units land; record the H1 store-authority + MVP-scope + RBAC
  edit-access binding decisions), `docs/pending.md` (the CRUD deferral row + the
  live-battery park), `docs/next-steps.md` (the new-unit work queue).

## 11. Cross-references

- `../Gnosis/docs/specs/gnosis.md` — §4.1–§4.6 (the behavior surface), §6 (FS-1..FS-26),
  §4.6.2 (no engine MCP/GUI; the "engine is optional" framing).
- `../Gnosis/docs/integrations/astrographer-interface-implementation.md` — §1/§2 (the
  server/client ownership), §4 (the API surface + method groups), §10.4 (CRUD
  deferral).
- `../Gnosis/docs/specs/engine-wire-contract.md` — §4–§12 (the F2 wire + golden
  vectors + §11 map), §14 (the later-units ownership list, item 4 = "Full `RagStore`
  persistence CRUD routing").
- `../Gnosis/src/store/mod.rs` — the `pub trait RagStore` (the 45-method surface).
- `src/main/rag-store.ts` — the local `createJsonRagStore` (the D2 fallback; `RagNode`
  is "one knowledge-graph object. OWNS a subtree of provident nodes", line 98).
- `docs/specs/unit-gn-engine-integration.md` — the LANDED retrieval-trio proxy.
- `docs/specs/unit-gn-mcp-ui-wiring.md` — the retrieval-trio wiring unit, **LANDED
  (2026-09-10)**, independent of this roadmap; the `gnosis` (read-only, default-off)
  group pattern (H3's mutating-group counterpart).
- `docs/specs/unit-gn-engine-integration-live-pending-battery.md` — the parked live
  battery (revisit condition = P2).
- `docs/decisions.md` — `GNOSIS-CRUD-SURFACE-CONFIRMED`, `ENGINE-WIRE-CLIENT`,
  `TRANSPORT-HTTP-SSE-LOOPBACK`, `WAIT-FOR-READY-SHELL-CONVENIENCE`,
  `RAG-EDIT-MCP-GROUPS` (the H3 mutating-group pattern).
- `docs/pending.md` — the deferred-CRUD row.
