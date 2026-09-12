# Spec — Unit U-D6: `rag.query` / `rag-stream` Document Filters

- **Status:** SPEC (the query-filter half of the document directory/category
  slice — the SIXTH unit of the ratified U-D1…U-D7 decomposition; execution
  order U-D1 → U-D2 → U-D3 → U-D4 → U-D5 **∥ U-D6** → U-D7). Gate references:
  `docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-
  AMENDMENTS, RATIFIED 2026-09-11), `docs/specs/document-directory-category-
  review.md` (M8 + the U-D6 row in §5; §4 Q1/Q3/Q6/Q7; §6 tracker
  reconciliation), and the GATED parent
  `docs/specs/document-directory-category.md` §3.5. Sibling/precedent specs:
  `docs/specs/unit-ud1-document-metadata-fields.md` (the LANDED
  `RagNode.documentPath?`/`tags?` fields the filters read),
  `docs/specs/unit-ud4-doc-heads-tree.md` (the LANDED root-node read + the
  `[]` default discipline + `selectDocumentIdsByPathPrefix` — a DIFFERENT
  surface: payload entries, not store nodes), `docs/specs/unit-ud5-list-
  documents-tool.md` (the read tool + seam pattern), `docs/specs/unit-e-rag-
  index.md` / `docs/specs/unit-x-rag-provenance-traversal.md` (the pinned
  `RagQueryFilters`/`validateFilters`/`documentIdsForNode` + the `nodeKind`
  post-filter), `docs/specs/unit-gn-engine-integration.md` (the shared
  `RagQueryFilters` + the gnosis proxy's decode-only wire client), and
  `docs/specs/unit-m-children-field.md` (the spec FORMAT).
- **Scope:** EXACTLY two primary source sites — the local retrieval filter
  surface and its two MCP entry points. U-D6 adds TWO additive optional fields
  to the LOCAL filter surface and threads them through BOTH retrieval modes:
  1. `src/main/retrieval.ts` — a NEW **LOCAL-only extension type**
     `LocalRagQueryFilters extends RagQueryFilters` carrying
     `documentPathPrefix?: string[]` and `tags?: string[]`; the local option
     types (`RagQueryOptions.filters`, `WalkOptions.filters`,
     `RetrievalEngine.query`'s opts `filters`) widen to it; `validateFilters`
     (`:1157-1190`) validates the two fields; the flat-mode post-filter
     (`:1255-1257`) and the graph walk (`edgePassesFilters` `:1008-1016`, the
     seed map `:1267-1279`, the seed/target fact gates `:1051-1057`/`:1106-1112`)
     apply them using the EXISTING node→document mapping
     `documentIdsForNode` (`:900-915`).
  2. `src/main/mcp-server.ts` — the `rag.query` zod row (`:2176`) and the
     `rag-stream` zod row (`:2185`) accept the two fields inside `filters`;
     `validateRagQueryFilters` (`:163-198`) validates them; the LOCAL
     `args.filters` casts (`:280,305,331,338,406,424,443,448`) widen to
     `LocalRagQueryFilters`; `validateGnosisFilters` (`:512-541`) REJECTS the
     two local-only keys on the gnosis path (defense-in-depth); the `gnosis.*`
     zod rows (`:2215-2216`) are UNCHANGED.
  `src/main/engine-rag-store.ts` (the proxy's `EngineRagQueryOptions.filters` —
  stays `RagQueryFilters`; `:296`) and `src/main/query-audit.ts` (the audit
  entry's `filters` type — stays `RagQueryFilters | null`; the local value is a
  structural subtype and rides by reference with its extra keys) are UNCHANGED.
  This is the M8 gnosis non-pollution design (§5.4.2).
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **U-D7 — the tag write op `edit.set_doc_meta`.** The op, its `edit`-group
    gating, its validation/authorization caps, and path immutability are U-D7.
    U-D6 is READ-ONLY and adds **NO tool, NO write op, NO new MCP tool name**.
  - **ui-overhaul G2 — the doc-nav TREE rendering.** The provident-authored
    folder/leaf tree UI is G2 (ratified 2026-09-11). U-D6 authors no UI.
  - **No store/model/import/journal/traversal change.** U-D6 does not touch
    `RagNode`, `nodeSource`, the journal (U-D2), the importer (U-D3), the
    doc-heads handler (U-D4), `computeDocumentSubgraph`/`buildTraversal`, or any
    persisted format. No new node/edge kind, no new persisted section.
  - **No shared-type pollution / no gnosis feature.** The two fields are
    LOCAL-only: they are NOT added to the shared `RagQueryFilters`, NOT
    advertised by the `gnosis.*` schemas, and NOT serialized by the proxy
    (§5.4.2).
  - **No UI/IPC filter path.** The renderer `rag-query` IPC
    (`RagQueryPayload`, `types.ts:426-438`) carries no `filters` field and is
    UNCHANGED; `handleRagQueryIpc` (`mcp-server.ts:844-857`) forwards no
    `filters`. U-D6 changes neither `src/main/main.ts`, `src/main/preload.ts`,
    nor `src/shared/types.ts`.
- **TestWriter contract:** every method/API signature, filter shape, validation
  rule, application point, happy-path state, and fail-state below is derivable
  from this spec ALONE. The TestWriter writes the red set for
  `src/main/retrieval.ts` (the `LocalRagQueryFilters` type + the two validators'
  behavior via `ragQuery` + the flat/graph application via `ragQuery`) and
  `src/main/mcp-server.ts` (`validateRagQueryFilters`/`handleRagTool` +
  `validateGnosisFilters`/`handleGnosisTool` + the zod schemas) from
  §5.6/§5.7 BEFORE any implementation, into
  `tests/unit-ud6-query-document-filters.test.ts`. The retrieval behavior is
  testable WITHOUT Electron via direct `ragQuery(...)` calls (the
  `tests/unit-x-rag-provenance-traversal.test.ts` seam); the tool behavior via
  direct `handleRagTool(...)`/`handleGnosisTool(...)` calls (the
  `tests/unit-x-rag-provenance-traversal.test.ts:696` /
  `tests/unit-gn-mcp-ui-wiring.test.ts` seam); and the zod schema via the
  in-memory SDK harness pattern
  (`tests/embeddings-adversarial.test.ts:104-119`).

---

## 1. What the unit asks

The document directory/category slice landed the metadata model (U-D1:
`RagNode.documentPath?`/`tags?`), the journal invertibility (U-D2), the
path-qualified id scheme (U-D3), the doc-heads listing/tree (U-D4), and the
read-only listing tool (U-D5). The retrieval surface still ignores the metadata.
This unit makes retrieval **document-scoped** by extending the LOCAL
`rag.query`/`rag-stream` filter surface (M8/Q2/Q3/Q7):

1. **Two additive optional filter fields** on the LOCAL rag retrieval filter
   surface: `documentPathPrefix?: string[]` (match a document whose root
   `documentPath` starts with the prefix, element-wise) and `tags?: string[]`
   (match a document that carries the requested tags).
2. **`tags` semantics are AND** — a document matches only if it has EVERY
   requested tag; compared **case-sensitively** (consistent with U-D1/Q7). This
   is documented explicitly (§5.1).
3. **Both `rag.query` and `rag-stream` input schemas accept the two fields**
   (the zod `filters` object), and both handlers validate them.
4. **Both retrieval modes honor the filters**: flat mode filters the ranked
   candidate nodes by their owning document; graph mode filters the seed nodes,
   the traversed edges, and the resolved target nodes by document. The
   node→document mapping is the EXISTING `documentIdsForNode` (+ the edge's
   `documentIds`) — **no new mapping is invented** (§5.2).
5. **Malformed filters fail with the existing pattern/message**
   (`ragQuery: filters malformed` in `retrieval.ts`, `rag.query: filters
   malformed` in `mcp-server.ts`).
6. **Gnosis non-pollution (M8)**: the `RagQueryFilters` type is shared with the
   Gnosis proxy and echoed by `engine-rag-store.ts`/`query-audit.ts`. The
   `gnosis.*` schemas do NOT advertise the new local fields and the proxy does
   NOT serialize them. The mechanism is the **LOCAL-only extension type** plus
   an explicit gnosis-validator rejection and the default zod strip (§5.4.2).
7. **The filters are additive/optional**: omitting them (or passing `[]`)
   preserves today's behavior byte-for-byte — a BINDING acceptance criterion.

U-D6 adds NO tool and NO write op.

## 2. Feasibility verdict

**Feasible — a contained, additive change over already-landed state. No
engine/foundation gap; entirely host-side (`src/`).**

- **The filter surface is landed and small.** `RagQueryFilters`
  (`retrieval.ts:761-766`) is a 4-field optional shape; `validateFilters`
  (`:1157-1190`) is an explicit whitelist; the flat mode already has a
  `nodeKind` post-filter (`:1255-1257`) — the document filter is a parallel
  post-filter; the graph walk already filters edges through `edgePassesFilters`
  (`:1008-1016`) and gates targets by `nodeKind` (`:1051-1057`/`:1106-1112`). The
  two fields slot into each site without restructuring.
- **The node→document mapping is landed and suitable.**
  `documentIdsForNode(store, nodeId)` (`retrieval.ts:900-915`, exported Unit X)
  returns the owning document root id(s) for a node by iterating the
  `doc-head` edges' `documentIds` and testing membership in
  `computeDocumentSubgraph(store, d).docNodeIds`. The document ROOT node (id ===
  documentId) carries `documentPath`/`tags` (U-D1/U-D3/U-D4), read via
  `store.getNode(documentId)`. A RAG edge carries `documentIds?: string[]` (the
  owning document roots, `rag-store.ts:162`). **No new mapping is needed**
  (§5.2).
- **The parser/importer guarantee the root carries the metadata.** The
  `doc-head` edge is minted `{ source: sectionIds[0], target: documentId,
  documentIds: [documentId] }` (`markdown-parse.ts:602`) and the importer sets
  `documentPath` only on the node whose `id === documentId`
  (`markdown-import.ts:353-359`). So the id returned by `documentIdsForNode` IS
  the root node that carries the fields.
- **The type is shared with the proxy but not entangled.** `RagQueryFilters` is
  imported by `engine-rag-store.ts` (`:13`, used at `:296`) and echoed by
  `query-audit.ts` (`:18,23`); the gnosis zod rows (`mcp-server.ts:2215-2216`)
  declare their filter shape INLINE (they do not derive from the type). Adding
  an extension subtype in `retrieval.ts` leaves the proxy and the gnosis
  schemas untouched — the lowest-risk non-pollution approach (§5.4.2).
- **The house validation pattern is a type-strict schema + a value-strict
  handler.** The zod `filters` arrays are `z.array(z.string())`: the SDK seam
  REJECTS a non-array or a wrong member type with `-32602` (HOST-LIVE-ZOD-SEAM,
  `docs/defects.md`) before the handler runs; the handlers then enforce
  non-empty members (strict). EMPTY strings pass zod and are the only
  array-shape errors that reach the handler's `filters malformed` (the
  `topK`/`store` mirror already in the code).
- **The behavior is fully covered by two validators + a post-filter + the walk
  gates.** No new module, no new exported function, no new tool, no new
  persisted shape.

### RCA-10 check — NO conflict

The pinned decisions are verified against the actual code:

- **Node→document mapping (§5.2):** `documentIdsForNode` exists exactly as
  specified (`retrieval.ts:900-915`); `RagEdge.documentIds` exists
  (`rag-store.ts:162`); the doc-head edge populates it (`markdown-parse.ts:602`);
  the document root carries `documentPath`/`tags` (`rag-store.ts:113-121`). The
  pinned mapping is the landed code. **No conflict.**
- **Gnosis sharing (§5.4.2):** `RagQueryFilters` is imported by the proxy
  (`engine-rag-store.ts:13`) and serialized (`JSON.stringify` at `:920` and
  `:941`); the gnosis schemas are declared inline at `mcp-server.ts:2215-2216`.
  The LOCAL-only extension leaves all of this unchanged. **No conflict.**
- **The M8 line refs in the gate review were pre-landing** (`:2134,2142`; now
  reconciled to the actual post-landing refs under F4): after
  U-D5/U-MS2 the `rag.query`/`rag-stream` zod rows are at `mcp-server.ts:2176`
  and `:2185`. This is the documented line-ref drift (the review's line-ref
  notes), not a contract conflict — this spec uses the ACTUAL refs.

No `provident-ssr` engine seam is involved, so no `docs/defects.md` /
`docs/HANDOFF.md` item is expected from this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `documentPathPrefix?: string[]` + `tags?: string[]` on the LOCAL filter surface | Project-specific (the retrieval filter contract) | Low cost; document-scoped retrieval without a new tool or a traversal change. |
| The LOCAL-only extension type `LocalRagQueryFilters` | Project-specific (host type) | Zero runtime cost; structurally separates the local fields from the shared/proxy `RagQueryFilters` (the M8 non-pollution seam). |
| Flat-mode node→document post-filter | Project-specific | Low cost; reuses `documentIdsForNode`; parallel to the existing `nodeKind` post-filter. |
| Graph-mode seed/edge/target document gating | Project-specific | Low cost; extends `edgePassesFilters` + the fact gates; reuses the edge `documentIds`. |
| The two zod `filters` rows (`rag.query`/`rag-stream`) | Project-specific (the MCP input contract) | Low cost; makes the fields agent-addressable; the gnosis rows are untouched. |
| The two validators' array checks | Project-specific | Low cost; the existing fail pattern (`filters malformed`). |
| `validateGnosisFilters` rejection of the local-only keys | Project-specific (defense-in-depth) | Low cost; makes the non-pollution guarantee runtime-tight for direct (non-SDK) calls. |

No engine gap. U-D7 (`edit.set_doc_meta`) and ui-overhaul G2 are LATER units —
NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — **to be run after the unit lands**. The
known edge cases this unit's contract already pins (so the adversarial pass must
NOT regress them); the pass results are recorded at the end of this section:

- **A1 — omission / empty arrays are byte-equal.** `ragQuery` with no
  `filters`, `filters: {}`, `filters: { documentPathPrefix: [] }`,
  `filters: { tags: [] }`, and `filters: { documentPathPrefix: [],
  tags: [] }` MUST all return the byte-equal pre-U-D6 result (same `results`,
  `ranked`, `citations`, `trace`, `context`, `markdown`, `lineMap`, `k`). The
  adversarial pass must confirm empty is "no constraint", never "match
  nothing".
- **A2 — tags are AND + case-sensitive.** A document with `tags: ['A','b']`
  matches `tags: ['A']` and `tags: ['A','b']`, but NOT `tags: ['a']`,
  `tags: ['A','c']`, or `tags: ['a','b']`. The adversarial pass must confirm
  AND (not OR) and case-sensitivity.
- **A3 — multi-parent nodes match ANY owning document.** A node owned by
  documents D1 and D2 (CROSS-DOCUMENT-SHARED) passes a `tags` filter satisfied
  by EITHER. The adversarial pass must confirm `documentIdsForNode`'s full set
  (not just `docForNode`'s first element) is consulted.
- **A4 — a node with no owning document.** When a document constraint is
  active, a node `documentIdsForNode` returns `[]` for MUST be excluded (it
  cannot match). When no constraint is active it MUST be included (today's
  behavior).
- **A5 — malformed filter arrays.** `documentPathPrefix`/`tags` that are not
  arrays, or that contain a non-string/empty-string member, MUST throw the
  pinned message — never be silently coerced into a constraint or a no-op.
- **A6 — malformed/absent root fields.** A document root that is absent from
  `listNodes()` (missing/quarantined), or whose `documentPath`/`tags` are
  non-arrays (tampered), MUST be treated as `[]` — a non-empty path prefix
  therefore EXCLUDES it, an empty/none path prefix does not. NEVER throw.
- **A7 — gnosis non-pollution.** The `gnosis.*` schemas MUST NOT advertise the
  two local-only fields; the MCP path MUST strip them (the default zod strip);
  a DIRECT `handleGnosisTool(...)` call carrying them MUST be rejected by
  `validateGnosisFilters` BEFORE any proxy call (so nothing is serialized); the
  proxy (`engine-rag-store.ts`) MUST be unchanged and MUST NOT serialize them.
  The existing serialization pin
  (`tests/unit-gn-engine-integration.test.ts:818-840`) MUST stay green.
- **A8 — determinism + no mutation.** The filter arrays are read-only; a query
  MUST NOT mutate the caller's `documentPathPrefix`/`tags`. The application is
  deterministic (the same store + filters → the same result) and stable.
- **A9 — fan-out honors filters per store.** A `stores:'all'` flat fan-out MUST
  apply the document filter against EACH store's own node→document mapping
  (the filter is passed through `centry.engine.query`; the local subtype rides
  the same `filters` argument) — never the default store's mapping for another
  store.
- **A10 — unknown keys are still ignored locally.** An unknown filter KEY on
  the local path MUST remain ignored (the whitelist validators are unchanged in
  that respect); only the two known fields' SHAPE is validated. Unknown VALUES
  in known fields remain rejected.
- **A11 — flat/graph consistency.** For a store whose flat and graph modes
  resolve the same document set, the document filter MUST exclude/include the
  same documents in both modes (flat candidate filter ≡ graph seed/edge/target
  gating).

Any host finding is fixed here + regression-tested; any `provident-ssr` package
finding → `docs/defects.md`/`docs/HANDOFF.md` (none expected).

**Adversarial pass (RCA-3) — record (2026-09-11, post-green).** Findings, all
HOST-side (no `provident-ssr` package finding; no `docs/defects.md` /
`docs/HANDOFF.md` item):

- **F1 (HIGH — FIXED).** `edgeMatchesDocumentFilters` did not consult
  `hasDocumentFilters`, so a graph-mode crosslink whose owning-document set is
  EMPTY (both endpoints belong to no document) was REJECTED whenever `filters`
  was any non-undefined object — `{}`, `{ nodeKind: 'fact' }`,
  `{ documentPathPrefix: [] }`, `{ tags: [] }`. This violated the pinned
  "no constraint = true / byte-equal to pre-U-D6" rule (§5.2, §5.5.2, A1) and
  the flat/graph consistency rule (A11). **Fix:** `edgeMatchesDocumentFilters`
  now early-returns `true` when `!hasDocumentFilters(filters)` (the corrected
  §5.2 snippet), keeping byte-identical behavior for an ACTIVE constraint.
  Regression: `tests/unit-ud6-query-document-filters-adversarial.test.ts`
  (red-first: 2 failed → green). The active-constraint guard pins that an
  unowned node is still excluded under an active prefix/tags.
- **F2 (spec drift — CORRECTED).** §5.4.1 described the zod `filters` arrays
  as "lax" and claimed a wrong-member-type array is rejected by the HANDLER.
  Actual MCP-observable behavior: the zod schema is `z.array(z.string())` and
  the SDK seam rejects a non-array or a wrong member type with `-32602`
  (the house HOST-LIVE-ZOD-SEAM behavior, `docs/defects.md`); EMPTY strings
  pass zod and are the only array-shape errors that reach the handler's
  `rag.query: filters malformed`. §5.4.1 corrected.
- **F3 (accepted limitation — DEFERRED).** In graph mode, `trace`/`blockedBy`
  entries are built from `docForNode`/the walked edge endpoints and may name a
  node that belongs to a filtered-out document (e.g. the seed whose document is
  excluded, or a BROKEN/STALE edge endpoint). The spec pins filtering of
  `results` (seeds/edges/resolved targets), NOT of the diagnostic
  `trace`/`blockedBy`; this is out of scope and deferred (recorded in
  `docs/pending.md`). `trace`/`blockedBy` remain faithful provenance of what the
  walk attempted, not a filtered projection.
- **F4 (type consistency — FIXED).** The local audit casts in
  `src/main/mcp-server.ts` at `:338`/`:424` were `RagQueryFilters`; corrected to
  `LocalRagQueryFilters` to match §5.5.3 / §5.4.2. Type-only — no runtime
  change (the audit `QueryAuditEntry.filters` stays `RagQueryFilters | null` and
  the local value is a structural subtype).

### 3b. Proposal-review findings

The proposal-review gate returned **PROCEED-WITH-AMENDMENTS** for the document
directory/category proposal (`docs/decisions.md` row
**DOC-DIRECTORY-CATEGORY-GATE**, 2026-09-11;
`docs/specs/document-directory-category-review.md`). The amendments THIS unit
pins (each cross-referenced to the section that resolves it):

- **M8 — rag-scoped filter extension** (§5.1-§5.5): extend `RagQueryFilters`
  (`retrieval.ts:761`), `validateFilters` (`:1157-1190`), `validateRagQueryFilters`
  (`mcp-server.ts:163-198`), and the `rag.query`/`rag-stream` zod schemas. The
  type is shared with the Gnosis proxy (`engine-rag-store.ts:13,296`) and
  duplicated in the `gnosis.*` schemas (`:2215-2216`); ensure those do NOT
  advertise/serialize the new local fields. Document filters need a
  node→document mapping in both flat and graph modes. **RCA-10: the mapping
  exists (`documentIdsForNode`); the local-only extension type is the
  non-pollution mechanism — verified, no conflict.**
- **Q2/Q3/Q7 (consumed):** single `documentPath` + multi-valued `tags`;
  `tags` are case-sensitive (`A′` ≠ `a`); the fields are the root's persisted
  values (U-D1 normalization already applied).
- **Q6 (consumed):** the Gnosis mapping is **local-only v1** — a Gnosis `wiki`
  is a flat single-parent bucket with a single-string tag filter, so the local
  `documentPathPrefix`/`tags` do not round-trip. U-D6 deliberately does not
  extend the gnosis surface.
- **U-D6 row (§5)** (§1/§5.1-§5.5): `RagQueryFilters` `retrieval.ts:761`;
  `validateFilters` `:1157-1190`; `validateRagQueryFilters`
  `mcp-server.ts:163-198`; zod `:2176,2185`; node→document mapping; Gnosis
  non-pollution `:2215-2216`/`engine-rag-store.ts:296`. Primary fail-state
  coverage: malformed/unknown filter; tags semantics; empty prefix; gnosis
  rejects new fields.

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed, M8 + Q2/Q3/Q6/Q7 + the U-D6 row):**
  the two local-only filter fields, `tags` = AND + case-sensitive, the
  node→document mapping in both modes, and the gnosis non-pollution.
- **LEXICAL-FIRST-RETRIEVAL (consumed):** retrieval stays behind the same
  `ragQuery` engine; U-D6 only restricts the ranked/walked candidate set — no
  embedder/index change.
- **RAG-AUTHORITATIVE (consumed):** the filters read the PERSISTED root-node
  metadata (`documentPath`/`tags`); the result is a projection.
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** `rag.query`/`rag-stream`
  route through the SAME `ragQuery` engine as the UI `rag-query` IPC. U-D6 adds
  no filter field to the UI IPC (`RagQueryPayload`); the UI path simply does not
  use document filters (a documented asymmetry — the UI's search pane passes no
  `filters`).
- **RAG-EDIT-MCP-GROUPS (consumed):** U-D6 adds NO tool/group row; the
  `rag.query`/`rag-stream` schemas are widened inside their existing `rag`
  group.
- **ADJACENCY-INDEXED (consumed):** the mapping reads through
  `edgesByKind('doc-head')`/`getNode`/`listNodes` — the landed read surface; no
  new index.
- **New DECIDED row (recorded by the landing pass):**
  `DECIDED: LOCAL-QUERY-DOCUMENT-FILTERS` — the two document filters are
  LOCAL-only (extension type); `tags` AND + case-sensitive; both modes; gnosis
  unchanged.

### 4.1 The gnosis non-pollution approach (chosen) and the rejected alternative

- **CHOSEN — local-only extension type + unchanged gnosis schemas/proxy + an
  explicit gnosis-validator rejection.** The new fields live ONLY on
  `LocalRagQueryFilters` (a subtype defined in `retrieval.ts`). The shared
  `RagQueryFilters` keeps exactly 4 fields, so the proxy's
  `EngineRagQueryOptions.filters` (`engine-rag-store.ts:296`) cannot carry the
  new fields by type; the `gnosis.*` zod rows are untouched (they never
  advertise the fields, and zod's default object behavior strips unknown keys);
  and `validateGnosisFilters` rejects the two keys outright so a direct
  (non-SDK) `handleGnosisTool` call cannot reach `opts.filters` and be
  serialized. Three independent layers, zero gnosis code change.
- **REJECTED — add the fields to the shared `RagQueryFilters` and rely on the
  zod strip.** This would make the fields part of the proxy's
  `EngineRagQueryOptions.filters` type; a direct proxy call (tests, internal
  callers, or a future non-SDK path) could pass them and
  `JSON.stringify(opts.filters)` (`engine-rag-store.ts:920`/`:941`) WOULD
  serialize them onto the gnosis wire. Weaker guarantee, and it conflates the
  local and remote filter contracts. Not chosen.

  Rationale: the local-only subtype is the lowest-risk option grounded in the
  actual code because the proxy's filter type is compile-time separated AND the
  runtime paths are explicitly guarded, while the gnosis zod schemas and the
  proxy module stay byte-identical.

## 5. The exhaustive contract

### 5.1 The filter type(s) — the LOCAL-only extension

The shared `RagQueryFilters` (`retrieval.ts:761-766`) is **UNCHANGED** (4
fields). A NEW exported subtype carries the two local-only fields.

**The new type (pinned):**

```ts
// src/main/retrieval.ts — UNCHANGED (the shared base shape: the gnosis proxy's
// EngineRagQueryOptions.filters and the audit-entry base).
export interface RagQueryFilters {
  nodeKind?: 'content' | 'fact' | 'reference'
  edgeType?: 'link' | 'embed'
  target?: { documentId: string; nodeId: string }
  state?: 'FRESH' | 'RESOLVED' | 'STALE' | 'BROKEN'
}

/** U-D6 — the LOCAL-only additive document-metadata filter extension. These two
 *  fields are LOCAL retrieval only: they are NOT on the shared RagQueryFilters
 *  (the gnosis proxy's wire filter type) and are NOT advertised by the gnosis.*
 *  schemas (M8/Q6; §5.4.2). Read against the document ROOT node's persisted
 *  `documentPath`/`tags` (U-D1/U-D3/U-D4). */
export interface LocalRagQueryFilters extends RagQueryFilters {
  /** Match only documents whose root `documentPath` STARTS WITH this prefix,
   *  element-wise (case-sensitive). `[]` = no constraint (matches all). A
   *  prefix longer than the document's path never matches. */
  documentPathPrefix?: string[]
  /** Match only documents carrying EVERY requested tag — AND, case-sensitive
   *  (Q7). `[]` = no constraint (matches all). */
  tags?: string[]
}
```

**Field rules (pinned):**

- **`documentPathPrefix?: string[]`** — an array of non-empty strings when
  present. `[]` = no constraint. Match is element-wise on the document ROOT's
  `documentPath`: `prefix.length <= path.length` AND `prefix[i] === path[i]`
  for every `i` (case-sensitive).
- **`tags?: string[]`** — an array of non-empty strings when present. `[]` = no
  constraint. The match is **AND**: every requested tag must be present on the
  document ROOT's `tags`. Comparison is **case-sensitive** (`'A'` ≠ `'a'`,
  consistent with U-D1/Q7).
- **Both fields are OPTIONAL and ADDITIVE** — omitting them (or passing `[]`)
  preserves today's behavior byte-for-byte (the binding acceptance criterion).
- **The filters read the document ROOT's fields** — the node whose `id` is the
  documentId (U-D3), via `store.getNode(documentId)`. They NEVER read a
  non-root node's off-root fields (U-D1 stores/hashes them but ignores them
  semantically off-root) and NEVER split a `documentId` to derive a path.
- **The base `RagQueryFilters` is unchanged**, so the gnosis proxy's
  `EngineRagQueryOptions.filters` and the `QueryAuditEntry.filters` base stay
  4-field (§5.4.2). The audit entry records the local filter object BY
  REFERENCE, so its extra keys are echoed at runtime even though the
  `query-audit.ts` type stays the base (a structural-subtype assignment; no
  `query-audit.ts` change).

**The widened local option types (pinned):** `RagQueryOptions.filters`
(`retrieval.ts:830-838`; `filters` at `:833`), `WalkOptions.filters`
(`:868-871`; `filters` at `:870`), and
`RetrievalEngine.query`'s opts `filters` (`:587-597`; `filters` at `:595`; the
interface `:581-617`) change from
`RagQueryFilters` to `LocalRagQueryFilters`. `validateFilters` (`:1157`) and
`edgePassesFilters` (`:1008`) take `LocalRagQueryFilters`. Because
`LocalRagQueryFilters extends RagQueryFilters`, every existing caller that
passes a base-typed or base-literal filter still compiles (no ripple), and all
fields remain optional.

### 5.2 The node→document mapping (existing — no new mapping)

The filters use the **EXISTING** mapping, not a new one:

- **Node → owning document(s):** `documentIdsForNode(store, nodeId): string[]`
  (`retrieval.ts:900-915`) — the sorted document root ids whose
  `computeDocumentSubgraph` node set includes `nodeId`. A node with no owning
  document returns `[]`.
- **Document root → metadata:** `store.getNode(documentId)` returns the root
  node (id === documentId, U-D3) carrying `documentPath?`/`tags?` (U-D1).
- **Edge → owning document(s):** `RagEdge.documentIds?: string[]`
  (`rag-store.ts:162`) — the document roots that own/use the edge; when absent,
  fall back to the union of the two endpoint nodes' `documentIdsForNode`.

**Mapping rules (pinned):**

- **No new mapping is created** (M8). The helpers below are pure predicates that
  CALL the existing mapping; they do not build a parallel index.
- **A node matches when ANY of its owning documents matches.** For a multi-
  parent node (CROSS-DOCUMENT-SHARED), the full `documentIdsForNode` set is
  consulted — not just `docForNode`'s first element.
- **A node with no owning document matches only when NO document constraint is
  active.** With an active constraint it is excluded.
- **A missing/quarantined root or a tampered non-array field is treated as
  `[]`** (`Array.isArray` guards; U-D4's discipline) — never a throw. A
  non-empty `documentPathPrefix` therefore excludes it; a `tags` constraint
  excludes it (it has no tags).
- **An edge matches when ANY of its `documentIds` matches; absent
  `documentIds`, when ANY endpoint's owning document matches.**
- **With NO active document constraint (`hasDocumentFilters` false) an edge
  always matches** — byte-equal to omitted filters — even when its
  owning-document set is EMPTY (both endpoints unowned). An active constraint
  keeps the prior behavior (an unowned edge is excluded). (F1 fix.)
- **RCA-10 check:** this is the landed mapping; the doc-head edge carries
  `documentIds: [documentId]` (`markdown-parse.ts:602`) and the importer sets
  the root's fields (`markdown-import.ts:353-359`). **No conflict.**

**The helper predicates (pinned; module-private, NOT exported):**

```ts
// src/main/retrieval.ts — U-D6. PURE predicates over the EXISTING mapping.
/** True when a document-metadata constraint is active (a non-empty prefix or a
 *  non-empty tag list). */
function hasDocumentFilters(filters: LocalRagQueryFilters | undefined): boolean {
  if (!filters) return false
  return (filters.documentPathPrefix !== undefined && filters.documentPathPrefix.length > 0) ||
         (filters.tags !== undefined && filters.tags.length > 0)
}

/** Element-wise, case-sensitive path prefix (empty prefix = true). */
function pathHasPrefix(path: string[], prefix: string[]): boolean {
  if (prefix.length > path.length) return false
  for (let i = 0; i < prefix.length; i++) if (path[i] !== prefix[i]) return false
  return true
}

/** True when the DOCUMENT ROOT `documentId` satisfies the active constraints.
 *  Reads the root's `documentPath`/`tags` (U-D1); a missing root / non-array
 *  field is `[]` (never throws). A missing ROOT (or `documentId === ''`) with a
 *  non-empty prefix or tags does not match. */
function documentMatchesDocumentFilters(
  store: RagStore, documentId: string, filters: LocalRagQueryFilters,
): boolean {
  const root = documentId === '' ? undefined : store.getNode(documentId)
  const path = root && Array.isArray(root.documentPath) ? root.documentPath : []
  const tags = root && Array.isArray(root.tags) ? root.tags : []
  if (filters.documentPathPrefix !== undefined && filters.documentPathPrefix.length > 0 &&
      !pathHasPrefix(path, filters.documentPathPrefix)) return false
  if (filters.tags !== undefined && filters.tags.length > 0 &&
      !filters.tags.every((t) => tags.includes(t))) return false
  return true
}

/** True when a NODE passes: no constraint = true; otherwise ANY owning document
 *  (documentIdsForNode) matches. No owning document + a constraint = false. */
function nodeMatchesDocumentFilters(
  store: RagStore, nodeId: string, filters: LocalRagQueryFilters | undefined,
): boolean {
  if (!hasDocumentFilters(filters)) return true
  return documentIdsForNode(store, nodeId).some((d) => documentMatchesDocumentFilters(store, d, filters!))
}

/** True when an EDGE passes: no constraint = true; otherwise its `documentIds`
 *  (owning documents) match, or (absent `documentIds`) either endpoint's owning
 *  documents match. F1 fix — the `hasDocumentFilters` early return makes a
 *  present-but-empty constraint (`{}`, `{ nodeKind }`, `{ documentPathPrefix:
 *  [] }`, `{ tags: [] }`) byte-equal to omitted filters; an edge whose
 *  owning-document set is EMPTY (both endpoints unowned) is NOT rejected when no
 *  document constraint is active. */
function edgeMatchesDocumentFilters(
  store: RagStore, e: RagEdge, filters: LocalRagQueryFilters,
): boolean {
  if (!hasDocumentFilters(filters)) return true
  const docs = (e.documentIds && e.documentIds.length > 0)
    ? e.documentIds
    : [...documentIdsForNode(store, e.source), ...documentIdsForNode(store, e.target)]
  return docs.some((d) => documentMatchesDocumentFilters(store, d, filters))
}
```

- **Memoization (allowed, behavior-neutral):** because the document set and the
  filters are fixed for one `ragQuery` call, an implementation MAY memoize
  `documentMatchesDocumentFilters` per `documentId` within the call. The
  memoized result MUST equal the un-memoized result. This is an optimization
  only and is not required by the red set.

### 5.3 Validation (both validators)

**`validateFilters` (`retrieval.ts:1157-1190`) gains the two checks (pinned):**

```ts
// src/main/retrieval.ts — validateFilters, appended after the `target` block.
  if (filters.documentPathPrefix !== undefined) {
    if (!Array.isArray(filters.documentPathPrefix) ||
        !filters.documentPathPrefix.every((s) => typeof s === 'string' && s.length > 0)) {
      throw new Error('ragQuery: filters malformed')
    }
  }
  if (filters.tags !== undefined) {
    if (!Array.isArray(filters.tags) ||
        !filters.tags.every((s) => typeof s === 'string' && s.length > 0)) {
      throw new Error('ragQuery: filters malformed')
    }
  }
```

**`validateRagQueryFilters` (`mcp-server.ts:163-198`) gains the same two checks**
(the `f` record form; message `rag.query: filters malformed`):

```ts
// src/main/mcp-server.ts — validateRagQueryFilters, appended after the f.target block.
  if (f.documentPathPrefix !== undefined) {
    if (!Array.isArray(f.documentPathPrefix) ||
        !f.documentPathPrefix.every((s) => typeof s === 'string' && (s as string).length > 0)) {
      throw new Error('rag.query: filters malformed')
    }
  }
  if (f.tags !== undefined) {
    if (!Array.isArray(f.tags) ||
        !f.tags.every((s) => typeof s === 'string' && (s as string).length > 0)) {
      throw new Error('rag.query: filters malformed')
    }
  }
```

**`validateGnosisFilters` (`mcp-server.ts:512-541`) gains the rejection
(defense-in-depth; pinned):**

```ts
// src/main/mcp-server.ts — validateGnosisFilters, appended after the t check.
  // U-D6 §5.4.2 — the two LOCAL-only document filters are NOT part of the gnosis
  // wire filter contract. Reject them outright so a direct (non-SDK)
  // handleGnosisTool call cannot serialize them onto the engine wire.
  if (f.documentPathPrefix !== undefined || f.tags !== undefined) {
    throw new Error(`${prefix}: filters malformed`)
  }
```

**Validation rules (pinned):**

- **`documentPathPrefix`/`tags`, when present, MUST be arrays whose every member
  is a non-empty string.** Otherwise the pinned throw fires. `[]` is VALID (no
  constraint).
- **A non-array** (object/string/number/boolean/null) → throw.
- **A member that is not a string, or an empty string** → throw. (A
  whitespace-only `'  '` is a non-empty string and is therefore VALID — the
  local filter does not trim; U-D1 trims stored tags, and the comparison is
  against those normalized values.)
- **Unknown filter KEYS remain ignored** by both local validators (the
  whitelist is extended, not replaced) — today's leniency is preserved; a stray
  key is not a constraint and not a throw (A10).
- **Unknown VALUES in known fields** (e.g. `nodeKind: 'bogus'`) remain the
  existing fail-state (unchanged).
- **The fail message is EXACTLY** `ragQuery: filters malformed` for the
  retrieval validator and `rag.query: filters malformed` for the MCP validator
  (the existing strings). The gnosis validator uses `${prefix}: filters
  malformed` (the existing gnosis string).
- `validateFilters` is invoked by `ragQuery` at `:1229`; the MCP validator is
  invoked for BOTH `rag.query` (`:251`) and `rag-stream` (`:380`).

### 5.4 Schema edits + gnosis non-pollution

#### 5.4.1 The `rag.query` / `rag-stream` zod rows

The `filters` object in the `rag.query` row (`mcp-server.ts:2176`) and the
`rag-stream` row (`:2185`) each gain TWO optional array fields. Every other
field is UNCHANGED (the rows are otherwise byte-identical).

**The amended `filters` fragment (pinned, identical in both rows):**

```ts
filters: z.object({
  nodeKind: z.enum(['content', 'fact', 'reference']).optional(),
  edgeType: z.enum(['link', 'embed']).optional(),
  target: z.object({ documentId: z.string(), nodeId: z.string() }).optional(),
  state: z.enum(['FRESH', 'RESOLVED', 'STALE', 'BROKEN']).optional(),
  // U-D6 §5.4.1 — the LOCAL document filters (type-strict schema: the SDK seam
  // rejects a non-array / wrong member type with -32602; the handler then
  // validates non-empty members — the topK/store mirror).
  documentPathPrefix: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
}).optional()
```

**Rules (pinned):**

- **The zod arrays are TYPE-STRICT** (`z.array(z.string())`): the SDK input-schema
  seam rejects a non-array or a wrong member type with `-32602` (the house
  HOST-LIVE-ZOD-SEAM behavior — `docs/defects.md`) BEFORE the handler runs, so
  `rag.query: filters malformed` is NOT emitted for a type error. An EMPTY
  string is a valid zod `z.string()` member and passes the schema, so `['']`
  reaches the handler and fails there (`rag.query: filters malformed`; note `[]`
  is valid and means "no constraint"). Direct (non-SDK) handler calls still see
  every shape, including non-arrays/wrong member types, and throw the pinned
  message.
- **`rag.query` and `rag-stream` carry the SAME two fields** (same schema;
  `rag-stream` returns `[{type:'error',error}]` on a handler failure per Unit X
  §5.8 — the `rag.query:`-prefixed message).
- **The `stores:'all'` fan-out inherits the fields** — the existing fan-out
  passes `filters: args.filters` to each `centry.engine.query`, so each store's
  flat result is filtered against that store's own mapping (A9). No fan-out code
  change.
- **`ALL_TOOLS`/`TOOL_GROUPS`/`RpcMethod` are UNCHANGED** — no new tool, no new
  group row, no new IPC method.

#### 5.4.2 The gnosis non-pollution design (M8/Q6)

The chosen three-layer design (§4.1):

1. **Local-only type (compile-time).** The two fields exist ONLY on
   `LocalRagQueryFilters`. The shared `RagQueryFilters` stays 4 fields; the
   proxy's `EngineRagQueryOptions.filters` (`engine-rag-store.ts:296`) stays
   `RagQueryFilters`, so the proxy type cannot express the fields.
2. **The `gnosis.*` zod rows are UNCHANGED (`mcp-server.ts:2215-2216`).** They
   advertise only `nodeKind`/`edgeType`/`target`/`state`. Zod's default
   `z.object` behavior **STRIPS unknown keys**, so an agent that sends
   `filters: { documentPathPrefix: [...] }` to `gnosis.query`/`gnosis.stream`
   has the key removed before `handleGnosisTool` runs; `validateGnosisFilters`
   never sees it and the proxy never receives it.
3. **`validateGnosisFilters` REJECTS the two keys** (§5.3) so a DIRECT
   (non-SDK) `handleGnosisTool` call carrying them fails with
   `${prefix}: filters malformed` BEFORE `opts()`/the proxy call — the fields
   can never reach `EngineRagQueryOptions.filters` and thus are never
   serialized by `JSON.stringify(opts.filters)` (`engine-rag-store.ts:920`,
   `:941`).

**Pinned consequences:**

- **`src/main/engine-rag-store.ts` is UNCHANGED.** The serialization pin
  (`tests/unit-gn-engine-integration.test.ts:818-840`) stays green.
- **The `gnosis.*` schemas do NOT advertise the fields** (no schema edit).
- **A probe of the gnosis wire cannot observe the fields** — either stripped
  (MCP) or rejected (direct) before the proxy.
- **The gnosis decode path is unaffected** — it consumes wire responses and has
  no encode surface; nothing here changes.
- **The audit log:** the local `rag.query`/`rag-stream` handlers record the
  local `LocalRagQueryFilters` object (with its extra keys) by reference into
  the shared `QueryAuditLog`; `query-audit.ts` is UNCHANGED (its
  `QueryAuditEntry.filters` stays `RagQueryFilters | null`; the local value is a
  structural subtype). The gnosis handlers record their own base filters
  unchanged. The `get_query_audit_log` payload therefore echoes the local
  filters' extra keys at runtime (types hide them).

### 5.5 The flat + graph application points

#### 5.5.1 Flat mode (`retrieval.ts:1240-1263`)

After the existing `nodeKind` post-filter (`:1255-1257`), add the document
post-filter (pinned):

```ts
    if (opts.filters?.nodeKind !== undefined) {
      results = results.filter((r) => store.getNode(r.nodeId)?.nodeKind === opts.filters!.nodeKind)
    }
    // U-D6 §5.5.1 — the local document-metadata filter: a candidate passes when
    // ANY of its owning documents satisfies BOTH the path prefix and the tags.
    if (hasDocumentFilters(opts.filters)) {
      results = results.filter((r) => nodeMatchesDocumentFilters(store, r.nodeId, opts.filters))
    }
```

**Flat rules (pinned):**

- **Only `results` is filtered** — `ranked`/`context`/`markdown`/`lineMap` are
  UNCHANGED (matching the `nodeKind` post-filter's existing behavior; the flat
  mode's appended hits remain the full ranked set). (This mirrors the existing
  `nodeKind` post-filter exactly: it also filters only `results`.)
- **A node matches via ANY owning document** (`nodeMatchesDocumentFilters`).
- **No owning document + an active constraint → excluded.**
- Empty/omitted filters → `hasDocumentFilters` false → NO filter (byte-equal,
  A1).

#### 5.5.2 Graph mode (`retrieval.ts:1051-1057`, `:1106-1112`, `:1264-1289`)

Graph mode applies the document filter at THREE points (all reusing the
existing mapping):

1. **Seed selection.** Filter `ranked` before mapping to seeds (pinned):

```ts
    // U-D6 §5.5.2 — restrict the graph seeds to matching documents (the same
    // owning-document predicate as flat mode).
    const graphRanked = hasDocumentFilters(opts.filters)
      ? ranked.filter((s) => nodeMatchesDocumentFilters(store, s.nodeId, opts.filters))
      : ranked
    const seeds = graphRanked.map((s) => {
      const node = store.getNode(s.nodeId)
      return { documentId: docForNode(store, s.nodeId), nodeId: s.nodeId, score: s.score,
               snippet: node ? snippetOf(node) : '', source: 'local' as const }
    })
```

2. **Edge traversal.** `edgePassesFilters` (`:1008-1016`) gains the document
   check (pinned):

```ts
function edgePassesFilters(store: RagStore, e: RagEdge, filters: LocalRagQueryFilters | undefined): boolean {
  if (!filters) return true
  if (filters.edgeType !== undefined && e.edgeType !== filters.edgeType) return false
  if (filters.state !== undefined && e.state !== filters.state) return false
  if (filters.target !== undefined && (e.target !== filters.target.nodeId || docForNode(store, e.target) !== filters.target.documentId)) return false
  // U-D6 §5.5.2 — the edge's owning document(s) must match.
  if (!edgeMatchesDocumentFilters(store, e, filters)) return false
  return true
}
```

3. **Resolved target nodes.** Both fact-target gates gain the node predicate
   (pinned) — the seed gate (`:1051-1057`) and the walked target gate
   (`:1106-1112`):

```ts
    // seed gate
    if (seedNode && seedNode.nodeKind === 'fact') {
      if ((filters?.nodeKind === undefined || filters.nodeKind === 'fact') &&
          nodeMatchesDocumentFilters(store, current, filters)) {
        addTarget(seed); resolved = true
      }
    }
    // walked target gate
    if (targetNode && targetNode.nodeKind === 'fact') {
      if ((filters?.nodeKind === undefined || filters.nodeKind === 'fact') &&
          nodeMatchesDocumentFilters(store, target, filters)) {
        addTarget({ documentId: docForNode(store, target), nodeId: target, score: seed.score,
                    snippet: snippetOf(targetNode), source: 'local' as const })
        resolved = true
      }
    }
```

**Graph rules (pinned):**

- **All three gates use the same owning-document predicate**, so flat and graph
  modes agree for the same document set (A11).
- **An edge is gated on its OWN `documentIds`** when present (the owning
  documents per CROSS-DOCUMENT-SHARED), else on the endpoint nodes' owning
  documents — both via `documentMatchesDocumentFilters`.
- **A target that resolves no matching node does not throw** — the walk may
  then populate `blockedBy` (a valid state, unchanged semantics).
- **Empty/omitted filters → no gating at all (byte-equal, A1).**
- **ACCEPTED LIMITATION (F3, deferred): `trace`/`blockedBy` are NOT filtered.**
  The spec pins filtering of the resolved `results` (seeds/edges/targets), NOT of
  the diagnostic `trace`/`blockedBy`. In graph mode a `trace` or `blockedBy`
  entry may therefore name a node whose owning document was filtered out (e.g.
  the excluded seed, or a BROKEN/STALE edge endpoint). This is faithful
  provenance of what the walk attempted, not a filtered projection; it is out of
  scope for U-D6 and recorded in `docs/pending.md` for a future unit.

#### 5.5.3 The audit + fan-out paths

- **Audit (`mcp-server.ts:302-312,335-344,421-431,445-454`):** unchanged shape;
  the local `filters` cast widens to `LocalRagQueryFilters`, so the recorded
  object carries the two extra keys at runtime. `query-audit.ts` is UNCHANGED
  (§5.4.2).
- **Fan-out (`mcp-server.ts:267-316,396-433`):** the local `filters` cast
  widens; each `centry.engine.query({ filters })` receives the local filters and
  applies them against its own store (A9). No fan-out logic change.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Type surface:** `LocalRagQueryFilters` exposes `documentPathPrefix?:
   string[]` and `tags?: string[]` (and the inherited base fields); the shared
   `RagQueryFilters` still exposes exactly the 4 base fields (no local fields).
2. **Omission is byte-equal:** `ragQuery(store, embedder, index, q, {})` and
   `{ filters: {} }` return the same result as the pre-U-D6 build (no
   filtering).
3. **Empty prefix = all:** `filters: { documentPathPrefix: [] }` returns the
   same `results` as no filter.
4. **Empty tags = all:** `filters: { tags: [] }` returns the same `results` as
   no filter.
5. **Flat path prefix:** with documents `a/x` (`documentPath: ['a']`) and `b/y`
   (`documentPath: ['b']`), `mode:'flat', filters:{ documentPathPrefix:['a'] }`
   keeps only nodes owned by `a/x`.
6. **Flat exact/deep prefix:** `documentPathPrefix:['a','b']` matches a
   document whose path is `['a','b']` or starts with it; a prefix longer than
   the path matches nothing.
7. **Flat tags AND:** a document with `tags:['x','y']` matches `tags:['x']`,
   `tags:['y']`, and `tags:['x','y']`; it does NOT match `tags:['x','z']`.
8. **Flat combined:** `{ documentPathPrefix:['a'], tags:['x'] }` requires BOTH.
9. **Tags case-sensitive:** a document with `tags:['X']` matches `tags:['X']`
   but not `tags:['x']`.
10. **Multi-parent node:** a node owned by `D1` (`tags:['x']`) and `D2`
    (`tags:['y']`) passes `tags:['x']` and `tags:['y']` (ANY owning doc).
11. **No owning document:** with an active constraint, a node whose
    `documentIdsForNode` is `[]` is excluded from the flat `results`; with no
    constraint it is present.
12. **Graph mode honors the filter:** with `mode:'graph'`, a non-matching seed
    is not walked, a non-matching crosslink edge is not traversed, and a
    non-matching fact target is not added.
13. **Graph edge via `documentIds`:** an edge whose `documentIds` names a
    matching document is traversed; one whose `documentIds` names only
    non-matching documents is not.
14. **MCP `rag.query` accepts the fields:** `handleRagTool(store, 'rag.query',
    { query, filters: { documentPathPrefix:['a'], tags:['x'] } }, ...)` returns
    the filtered result (the handler validates + forwards).
15. **MCP `rag-stream` accepts the fields:** `handleRagTool(store, 'rag-stream',
    { query, filters: {...} }, ...)` returns `[{type:'result',result},
    {type:'done'}]` with the filter applied; a malformed filter returns
    `[{type:'error',error:'rag.query: filters malformed'}]`.
16. **Fan-out honors per-store:** a `stores:'all'` `rag.query` with a document
    filter returns each store's matching results only.
17. **Audit echoes the local filters:** with an injected `auditLog`, a
    `rag.query` call with the new fields records an entry whose `filters`
    carries `documentPathPrefix`/`tags` (by reference).
18. **The zod schemas advertise the fields:** the `rag.query` and `rag-stream`
    SDK rows' `filters` schema accepts `{ documentPathPrefix: [...], tags: [...] }`
    (in-memory SDK harness).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **Malformed local `filters` container:** a non-object (`42`, `[]`, `null`)
   → `ragQuery: filters malformed` (UNCHANGED).
2. **`documentPathPrefix` non-array:** an object/string/number → `ragQuery:
   filters malformed`.
3. **`documentPathPrefix` non-string/empty member:** `[1]`, `['']`, `[null]`,
   `[{}]` → `ragQuery: filters malformed`.
4. **`tags` non-array:** → `ragQuery: filters malformed`.
5. **`tags` non-string/empty member:** `[1]`, `['']`, `[null]` → `ragQuery:
   filters malformed`.
6. **Unknown value in a known field:** `nodeKind:'bogus'` etc. → `ragQuery:
   filters malformed` (UNCHANGED).
7. **MCP `rag.query` malformed filters:** `handleRagTool(store, 'rag.query',
   { query, filters: { documentPathPrefix:'a' } })` throws exactly `rag.query:
   filters malformed`.
8. **MCP `rag-stream` malformed filters:** the same input returns EXACTLY
   `[{ type: 'error', error: 'rag.query: filters malformed' }]` (the Unit X
   §5.8 error chunk), never a thrown tool error.
9. **Unknown filter KEY on the local path is IGNORED (documented leniency):**
   `filters: { documentPathPrefix:['a'], bogus:1 }` does NOT throw; `bogus` is
   not a constraint (A10). Only the two KNOWN fields' shapes are validated.
10. **Gnosis MCP strip:** a `gnosis.query`/`gnosis.stream` call whose `filters`
    carries `documentPathPrefix`/`tags` has those keys stripped by the zod
    schema (not advertised); the proxy receives only the 4 base fields and the
    call behaves as a no-document-filter query.
11. **Gnosis direct rejection:** a DIRECT `handleGnosisTool(engine,
    'gnosis.query', { query, filters: { documentPathPrefix:['a'] } })` throws
    `${name}: filters malformed` BEFORE any proxy call (the engine's
    `ragQuery` is never invoked; nothing is serialized). Same for `tags` and
    for `gnosis.stream`.
12. **Gnosis serialization regression:** the existing
    `filters=%7B...%7D` serialization pin
    (`tests/unit-gn-engine-integration.test.ts:818-840`) stays green; the proxy
    (`engine-rag-store.ts`) is byte-identical.
13. **Missing/quarantined document root:** a node whose owning document root is
    absent from `listNodes()` (or whose `documentPath`/`tags` are non-arrays) is
    treated as `[]`; with a non-empty prefix or tags constraint it is excluded,
    and nothing throws (A6).
14. **No owning document under an active constraint:** excluded (A4) — never a
    throw and never accidentally included via `docForNode`'s `''`.
15. **Empty prefix / empty tags is NOT a fail-state:** `[]` is valid and means
    "no constraint" (A1).
16. **`ALL_TOOLS` unchanged:** `ProvidentMcpServer.ALL_TOOLS` is still 56
    (U-D6 adds no tool).

### 5.8 Census / numeric claims

- **Shared `RagQueryFilters` fields:** 4 → **4** (UNCHANGED —
  `nodeKind`/`edgeType`/`target`/`state`). The gnosis proxy's wire filter type
  is unchanged.
- **`LocalRagQueryFilters` new fields:** **2** — `documentPathPrefix`,
  `tags` (both optional `string[]`).
- **New exported types (`retrieval.ts`):** **1** — `LocalRagQueryFilters`.
- **New exported functions:** **0** (the four predicates are module-private).
- **`validateFilters` new checks:** **2**. **`validateRagQueryFilters` new
  checks:** **2**. **`validateGnosisFilters` new checks:** **1** (the
  local-only-key rejection).
- **zod `filters` fields:** `rag.query` 4 → **6** (+2); `rag-stream` 4 → **6**
  (+2); `gnosis.query` 4 → **4** (UNCHANGED); `gnosis.stream` 4 → **4**
  (UNCHANGED).
- **New MCP tools:** **0** (`ALL_TOOLS` stays **56**). **New TOOL_GROUPS
  rows:** **0**. **New `RpcMethod` members:** **0**. **New IPC channels /
  bridge methods:** **0**. **New write ops/edit ops:** **0**.
- **New `AuditEntry`/result fields:** **0** (the audit's `filters` is a
  passthrough reference; `query-audit.ts` is UNCHANGED). **New broadcast
  shapes:** **0**.
- **New `RagNode`/`RagEdge` fields:** **0** (U-D1 landed `RagNode.documentPath`/
  `tags`; `RagEdge.documentIds` predates U-D6). **New
  store/journal/traversal/persisted-format changes:** **0**.
- **Source files changed:** **2** — `src/main/retrieval.ts`,
  `src/main/mcp-server.ts`. UNCHANGED: `src/main/engine-rag-store.ts`,
  `src/main/query-audit.ts`, `src/main/main.ts`, `src/main/preload.ts`,
  `src/shared/types.ts`, `src/shared/document-tree.ts`, and the renderer.
- **Node→document mapping:** the EXISTING `documentIdsForNode`
  (`retrieval.ts:900-915`) + `RagEdge.documentIds`; **0** new mappings.
- **`tags` semantics:** AND, case-sensitive (`Q7`); `documentPathPrefix`
  element-wise, case-sensitive.

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` (M8 + the U-D6
  row in §5; Q1/Q3/Q6/Q7; §6 tracker reconciliation) and `docs/decisions.md`
  row **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` §3.5 (the
  `filters` extension + Q6 local-only gnosis mapping), §3.7 (the read-only
  migration discipline the root fields follow).
- **Precedent / consumed (LANDED):** `docs/specs/unit-ud1-document-metadata-
  fields.md` §5.1 (`documentPath`/`tags`; trimmed/case-sensitive/deduped tags;
  `[]`→omitted), §5.3 (copy paths). The root carries the fields; the filters
  read them.
- **Consumed (LANDED):** `docs/specs/unit-ud3-import-path-id-scheme.md` §5.3
  (the path-qualified `/`-joined `documentId`), §5.4 (root-only `documentPath`
  set); `docs/specs/unit-ud4-doc-heads-tree.md` §5.1-§5.2 (the root read +
  `[]` default; `selectDocumentIdsByPathPrefix` — a payload-entry surface
  DISTINCT from U-D6's store-node filters); `docs/specs/unit-x-rag-provenance-
  traversal.md` §5.2-§5.6 (the `RagQueryFilters` shape, `validateFilters`,
  `documentIdsForNode`, the graph walk, the `nodeKind` post-filter, the audit
  log); `docs/specs/unit-e-rag-index.md` §5 (the `ragQuery` engine).
- **Gnosis (consumed; UNCHANGED):** `docs/specs/unit-gn-engine-integration.md`
  §5.1 (`EngineRagQueryOptions.filters` imports `RagQueryFilters`; the proxy is
  decode-only, no encode surface), §5.5 (the `filters` serialization). The
  `gnosis.*` MCP rows: `src/main/mcp-server.ts:2215-2216`.
- **Hardening (consumed):** `docs/specs/unit-j-mcp-security-hardening.md` §5.2
  (the `rag` group is read-only + default-off; U-D6 adds no tool/group/gate
  seam), §5.5 (the main-handled read-tool seam set — U-D6 adds NO seam).
- **Decisions:** `docs/decisions.md` rows **DOC-DIRECTORY-CATEGORY-GATE**,
  **LEXICAL-FIRST-RETRIEVAL**, **RAG-AUTHORITATIVE**, **MCP-UI-EQUIVALENCE**,
  **RAG-EDIT-MCP-GROUPS**, **ADJACENCY-INDEXED**, **CROSS-DOCUMENT-SHARED**
  (multi-parent nodes; `documentIds` on edges), **UI-SELECTOR-DEFERRED**
  (unaffected). New row on landing: **LOCAL-QUERY-DOCUMENT-FILTERS**.
- **Downstream units (NOT this spec):** U-D7 (`edit.set_doc_meta`), ui-overhaul
  G2 (the doc-nav tree UI).
- **Host patterns:** `src/main/retrieval.ts:761-766` (`RagQueryFilters`),
  `:830-838`/`:868-871` (`RagQueryOptions`/`WalkOptions`), `:900-915`
  (`documentIdsForNode`), `:1008-1016` (`edgePassesFilters`), `:1051-1057`/
  `:1106-1112` (the fact gates), `:1157-1190` (`validateFilters`),
  `:1240-1289` (flat/graph), `src/main/mcp-server.ts:163-198`
  (`validateRagQueryFilters`), `:200-507` (`handleRagTool`), `:512-541`
  (`validateGnosisFilters`), `:2176,2185` (the zod rows),
  `:2215-2216` (gnosis rows), `src/main/engine-rag-store.ts:296,920,941`
  (the proxy filter type + serialization), `src/main/query-audit.ts:23`
  (the audit-entry `filters`), `src/main/rag-store.ts:150-165` (`RagEdge`),
  `src/main/markdown-parse.ts:602` (the doc-head edge `documentIds`).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set from §5.6/§5.7 BEFORE any implementation. The
realized red set (recorded in the next-steps DONE row for this unit) is **24
tests** — narrower than §5.6's full state list (the coverage gap is stated
below):

- **`src/main/retrieval.ts` (the type + the behavior via `ragQuery`):** §5.6
  states 1-9, 11-13 (the type surface, omission/empty byte-equality, flat
  path/tags/AND/case/no-doc, graph seeds/edges/targets) + §5.7 states 1-6, 9,
  13-15 (malformed container/arrays/unknown-value; unknown-key leniency; missing
  root; no-owning-doc; empty = no constraint) — all WITHOUT Electron via direct
  `ragQuery(store, embedder, index, ...)` (constructing a `RagStore`, a lexical
  embedder, and a lexical index, and seeding
  `doc-head`/`doc-child`/`crosslink` edges + root metadata as Unit X's tests
  do).
- **`src/main/mcp-server.ts` (validators + handlers + schemas):** §5.6 states
  14-15, 18 (the MCP `rag.query`/`rag-stream` acceptance, the zod rows) + §5.7
  states 7-8, 10-12, 16 (the MCP fail messages, the gnosis strip/reject, the
  serialization regression, `ALL_TOOLS` unchanged) — via direct
  `handleRagTool(...)`/`handleGnosisTool(...)` calls and the in-memory SDK
  harness for the zod schema.
- **§5.6.10 / §5.6.16 / §5.6.17 coverage gap (recorded):** §5.6.10
  (multi-parent node) is NOT in the landed 24-test red set — it is covered only
  as the blind-greens S6 scenario. §5.6.16 (fan-out per-store) and §5.6.17
  (audit echo) are NOT covered by any U-D6 test — they are on the greens
  artifact's "non-blind-constructible" list. Behavior is verified by the other
  paths: fan-out rides the unchanged `filters: args.filters` pass-through (A9),
  and the audit echo is a structural-subtype by-reference pass-through; neither
  is exercised with the new fields.
- **Sanctioned existing-test ripples:** NONE expected. `ALL_TOOLS` stays 56;
  the `RagQueryFilters`/`QueryAuditEntry`/`EngineRagQueryOptions` shapes are
  unchanged; the gnosis serialization pin is untouched. If the `RetrievalEngine`
  opts type widening surfaces a compile-only ripple in an existing test, it is
  a sanctioned type-only fix (no assertion change) and must be listed in the
  DONE row.
- **Post-green gates (per AGENTS.md):** the adversarial pass (§3a) records its
  findings in this spec; the blind-greens writer produces a scenario artifact
  from this spec + `docs/specs/unit-ud6-query-document-filters-greens.md`
  (created with the greens); the documentation review reconciles this spec, the
  trackers, and the `RagQueryFilters`/gnosis references.
