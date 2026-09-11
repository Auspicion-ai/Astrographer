# Spec — Unit A2: Document-CRUD D4 Wiring — the `gnosis.document.*` / `gnosis.wiki.*` MCP Tools + the GUI Document-Editor/Wiki Screens (the 11 §4.1 Document-CRUD Methods over the LANDED A1 Proxy)

- **Status:** **LANDED** — the FINAL MVP unit of the Gnosis
  CRUD-unblock roadmap (the roadmap `docs/specs/unblock-gnosis-remaining-endpoints.md`
  §6.2, A2). Proposal gate: the roadmap's §6.2 (PASS — the A2 deliverable = the
  **document-CRUD D4 wiring**: the `gnosis.document.*`/`gnosis.wiki.*` MCP tools +
  the GUI document-editor/wiki screens, over the LANDED A1
  `createEngineCrudRagStore` proxy). **Gated on (P3):** **A1-only for the unit**
  (the wiring consumes the LANDED A1 proxy surface); **P2 is required only for
  the live-scenario battery** — so **A2 is parallelizable with the live battery**.
  **Deferred-to-unit-spec (H2):** the **optimistic-concurrency 409 UX** is a
  REQUIRED deliverable of this spec (surface `ConflictError` on both surfaces).
  **Deferred-to-unit-spec (P4):** the **caller-side idempotency-key dedup/UX** for
  the duplicate-create risk is a REQUIRED deliverable of this spec (P1a's frozen
  wire carries NO idempotency-key field, so the dedup is caller-side). **The unit
  is LANDED (GREEN)** — the implementation landed + the tests pass (91 unit + 8
  props + 49 blind-greens); the TestWriter derived the red set from §5.8/§5.9
  ALONE, then the Implementer landed the least code to green. **Scoped re-derivation
  (2026-09-11, `HOST-GUI-DOCS-PANE-DEADLOCK`):** the `gnosisDocumentsContent`
  render contract is re-derived so the `gnosis-documents` pane's wiki selector
  renders whenever `state.wikis` is non-null, INDEPENDENT of `state.documents` —
  breaking the pane's chicken-and-egg deadlock (the all-unavailable guard no longer
  hides the wiki-selector `<li>` items that populate `documents`). The whole-pane
  `unavailable` is reserved for the no-wikis (engine-absent) case; a null
  `documents` with a non-null `wikis` renders the wiki selector + the empty
  document-list state, never a TypeError. See §3a H-6, §5.5, §5.8-20, §5.9-41, and
  the register row `P-IM-4`.
- **Scope:** (1) the **11 `gnosis.document.*`/`gnosis.wiki.*` MCP tools**
  (create/get/update/delete/publish/unpublish/archive/list documents;
  create/get/list wikis) — the **4 read-only** tools in the read-only `gnosis`
  group, the **7 mutating** tools in a NEW mutating default-off `gnosis-edit`
  group (H3); (2) the `security.ts` `TOOL_GROUPS`/`VALID_GROUPS`/`ALL_TOOLS`
  changes; (3) the main-process routing + the EXTENDED `handleGnosisTool` handler
  (the SAME handler as the retrieval trio — the `name.startsWith('gnosis.')`
  branch is extended to the document/wiki tools); (4) the
  `McpServerOptions.engineCrudRagStore` injection + the boot-time construction +
  the **shell-side `AuthorityStore`** (H3 RBAC caller threading) + the
  **caller-side `IdempotencyRegistry`** (P4 dedup); (5) the D4 parity scope (the
  GUI document-editor/wiki screens, provident-authored, with NEW
  `gnosisDocumentsContent`/`gnosisWikisContent` render paths); (6) the D2
  engine-absent surfacing (typed MCP error + GUI unavailable state) + the H1
  store-authority framing; (7) the optimistic-concurrency 409 UX (H2) on both
  surfaces; (8) the contract-spec update (`mcp-endpoint.md` + `docs/decisions.md`).
  **Explicitly OUT of scope:** any change to the A1 proxy itself
  (`src/main/engine-crud-rag-store.ts` — Unit A1 owns it), any change to the
  retrieval-trio proxy (`src/main/engine-rag-store.ts` — Unit GN owns it), any
  engine feature beyond the 11 document/wiki methods, and any RBAC **enforcement**
  semantics (the engine is the enforcer; A2 wires the shell's authority store to
  the engine's RBAC check, it does NOT re-implement enforcement).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the wiring (the 11 `gnosis.*` CRUD
  MCP tools + the `security.ts` `gnosis-edit` group + the extended main-process
  routing + the boot construction + the `AuthorityStore` + the `IdempotencyRegistry`
  + the GUI panes) from §5.8/§5.9 before any implementation, and asserts the PBT
  register (§5.7) holds.
- **Page-design note (repo divergence):** this repo has **NO
  `docs/skills/designing-pages.md`** (the `docs/skills/` directory is EMPTY — only
  `docs/skills/process-guardrails.md` is referenced by the sibling convention but
  does not exist here). Per the established sibling convention (roadmap §-header
  note; `docs/specs/unit-gn-mcp-ui-wiring.md` §5.5; `docs/specs/unit-a1-crud-routing-proxy.md`
  §-header note), **NO such skill update is made** and **no test-use-case coverage
  matrix / demo-page index is touched**. The two CRUD screens' page-design impact
  (provident authoring, the app-graph fail-closed gates, the 409 conflict state)
  is documented in THIS spec (§5.5/§5.6). The base instruction to update
  `docs/skills/designing-pages.md` only applies when that file exists; it does not.

**Spec-gate review record (2026-09-10):** the reviewer loop (architecture review +
change-analysis) returned **no MAJOR findings**; the 14 MINOR/INFO findings from
the first pass were all fixed in the spec. The re-review (architecture) returned
**4 MINOR + 2 INFO findings, all non-blocking, PARKED with this decision record**
(the reviewer loop is satisfied — the remainder is parked, not blocking):
1. **MINOR §5.9** — the `engine-not-spawned` fail-state is not enumerated (A1 §5.9
   fail-state 6 → `EngineUnavailable` 503, `cause: 'engine-not-spawned'`). The
   TestWriter derives it from the A1 proxy's fail-state surface (A1 §5.9); the A2
   §5.9 fail-state 32 covers `connection-refused` and the §5.1 throw patterns
   propagate the A1 proxy's typed `EngineUnavailable` (incl. `engine-not-spawned`).
2. **MINOR §5.1** — the `gnosis.document.update` `graph` inputSchema
   (`z.array(z.unknown())`) is looser than the A1 `Graph` type (`GraphNode[]`/
   `GraphEdge[]`). The graph is passed through opaque (P1a does not pin the inner
   shapes), so this is a schema-leniency note, not a defect; the Implementer may
   tighten to `z.array(z.record(z.string(), z.unknown()))`.
3. **MINOR §5.5** — the conflict state's "current revision" source is ambiguous
   (the `ConflictError` carries only code + httpStatus). The pane re-reads the
   document (`getDocument`) on a 409 to obtain the current revision, or shows the
   conflict message + a re-read prompt.
4. **MINOR §5.5** — the GUI idempotency framing: a fresh `requestId` per action
   means the dedup never fires for the GUI (it benefits the MCP retry path). The
   GUI provides a `requestId` for the mechanism; the dedup coverage is the MCP
   retry path.
5. **INFO §5.5** — the bridge wiring for the new `handleGnosisTool` params
   (`engineCrud`/`authorityStore`/`idempotency`, captured on the
   `ProvidentMcpServer` instance) is implicit; the TestWriter's red set covers the
   render helpers + the handler.
6. **INFO §5.4** — the `AuthorityStore.editors()` consumer is not pinned (the
   handler uses `callerCredential()`; `editors()` is a presentation surface for a
   future GUI editors list).
These parked findings are addressed in the TDD/adversarial/doc-review passes as
needed; none blocks delegation.

---

## 1. What the proposal asks

The roadmap §6.2 (A2) asks for the **document-CRUD D4 wiring**: thread the LANDED
A1 `createEngineCrudRagStore` proxy (the 11 §4.1 document-CRUD methods over the
frozen P1a wire) into the Astrographer MCP + GUI surfaces (D4 parity). It reuses
the Unit GN-MCP-UI wiring pattern (the `gnosis.*` tools + the `gnosis` group + the
`handleGnosisTool` main-process handler + the D4 GUI panes + the D2 engine-absent
surfacing) and the A1 proxy surface (the 11-method `EngineCrudRagStore`).

Concretely, the A2 deliverable:

1. **The 11 `gnosis.document.*`/`gnosis.wiki.*` MCP tools** — create/get/update/
   delete/publish/unpublish/archive/list documents; create/get/list wikis. The
   **4 read-only** tools (`gnosis.document.get`, `gnosis.document.list`,
   `gnosis.wiki.get`, `gnosis.wiki.list`) sit in the read-only `gnosis` group
   (the retrieval-trio group, Unit GN-MCP-UI); the **7 mutating** tools
   (`gnosis.document.create`, `gnosis.document.update`, `gnosis.document.delete`,
   `gnosis.document.publish`, `gnosis.document.unpublish`,
   `gnosis.document.archive`, `gnosis.wiki.create`) sit in a NEW mutating
   default-off `gnosis-edit` group (H3, per the RAG-EDIT-MCP-GROUPS pattern).
   Editing is NEVER a `code`-group op.
2. **The main-process routing** — the `name.startsWith('gnosis.')` routing branch
   is extended to the document/wiki tools; the SAME `handleGnosisTool` handler is
   extended to route them in MAIN against the LANDED A1 proxy (never routed to the
   renderer).
3. **RBAC caller threading (H3)** — the mutating tools present the caller's
   authority credential on each mutating call. The shell stores the authority of
   its human/agent users (the RBAC mapping of who may edit) in a NEW
   `AuthorityStore`; the handler resolves the caller's edit-authority credential
   and threads it into the mutating args' `caller` field (the engine is the RBAC
   enforcer).
4. **The optimistic-concurrency 409 UX (H2)** — surface `ConflictError` (409) on
   BOTH the MCP tools and the GUI document-editor screens.
5. **The caller-side idempotency dedup (P4)** — a NEW `IdempotencyRegistry`
   dedups the duplicate-create risk caller-side (P1a's wire has no idempotency-key
   field); the mutating create tools accept an optional `requestId` and a duplicate
   `requestId` returns the first result.
6. **The D4 parity scope** — the GUI document-editor/wiki screens (provident-
   authored, app-graph panes) reach every CRUD feature through the SAME
   `handleGnosisTool` handler via the bridge/IPC surface (MCP/UI equivalence).
7. **The D2 engine-absent surfacing + H1 store authority** — the A2 screens ARE
   the document surface over the engine (NOT a second editor, NO sync to the
   shell's local store); when the engine is absent they surface `EngineUnavailable`
   (503). The local `createJsonRagStore` is the D2 fallback for the shell's OTHER
   (non-A2) document features, NOT a second editor for the A2 screens.

**Explicitly OUT of scope (deferred):** the graph/fact/consistency/RAG-companion
surfaces (A3–A5, P1b–P1e); the RBAC **enforcement** semantics (the engine is the
enforcer); any change to the A1 proxy or the retrieval-trio proxy; the server host
(P2, landed); the live-scenario battery (a separate artifact, gated on P2).

## 2. Feasibility verdict

**Feasible — a pure wiring unit over the LANDED A1 proxy; no engine/foundation gap.**

- **The proxy surface is frozen.** Unit A1 §5.1 pins the 11-method
  `EngineCrudRagStore` surface (`createDocument`/`getDocument`/`updateDocument`/
  `deleteDocument`/`publishDocument`/`unpublishDocument`/`archiveDocument`/
  `listDocuments`/`createWiki`/`getWiki`/`listWikis`), the typed args/result types,
  the typed error model (imported from `engine-rag-store.ts`), the golden-vector
  conformance (V-10..V-12), and the D2 engine-absent framing. This unit consumes
  them; there is no shape ambiguity.
- **The wiring pattern is frozen.** Unit GN-MCP-UI pinned the `gnosis.*` MCP tool
  registration, the `gnosis` group, the `handleGnosisTool` main-process handler,
  the `McpServerOptions.engineRagStore` injection + boot construction + the
  `baseUrl` source, the D4 GUI panes + the `EngineRagResult` render path, and the
  D2 engine-absent surfacing. A2 reuses all of these mechanically.
- **The security group pattern is frozen.** `security.ts` `TOOL_GROUPS`/
  `VALID_GROUPS` already carry the `rag`/`edit`/`code`/`module`/`gnosis` groups;
  adding `'gnosis-edit'` is a mechanical additive change (the RAG-EDIT-MCP-GROUPS
  mutating-group pattern).
- **The RBAC caller threading is a pure shell-side concern.** The A1 proxy's
  typed args already require `caller` on the 7 mutating methods (RBAC-CALLER-
  THREADING, A1 §5.4). A2 adds the shell-side `AuthorityStore` that resolves the
  caller's credential and threads it into the mutating args. The engine is the
  enforcer; A2 only wires the store to the check.
- **The 409 UX + idempotency dedup are pure shell-side concerns.** `ConflictError`
  (409) is already a typed error in the A1 proxy (imported from
  `engine-rag-store.ts`); A2 surfaces it on both surfaces. The idempotency dedup
  is a caller-side registry keyed by `requestId` (P1a's wire has no idempotency-key
  field, so the dedup is caller-side).
- **No engine/foundation gap.** The wiring composes the LANDED A1 proxy + the
  existing MCP/security/pane/bridge machinery. The A1 proxy's injectable `fetch`
  makes the happy path testable with a mock transport (the Unit GN-MCP-UI A6
  pattern).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The 11 `gnosis.document.*`/`gnosis.wiki.*` MCP tools + the `gnosis-edit` group | Project-specific (shell-side; the A1 proxy is already landed) | Low cost; the D4 MCP surface for the 11 §4.1 document-CRUD methods. |
| The extended main-process routing + the extended `handleGnosisTool` | Project-specific (extends the `mcp-server.ts` ~line 2229 `gnosis.` branch) | Low cost; the document/wiki tools route in MAIN against the A1 proxy. |
| The `McpServerOptions.engineCrudRagStore` injection + boot construction | Project-specific (main.ts boot) | Low cost; the CRUD engine lifecycle seam. |
| The shell-side `AuthorityStore` (H3 RBAC caller threading) | Project-specific (shell-side; the engine is the enforcer) | Low cost; wires the shell's authority mapping to the engine's RBAC check. |
| The caller-side `IdempotencyRegistry` (P4 dedup) | Project-specific (caller-side; P1a's wire has no idempotency-key field) | Low cost; the duplicate-create dedup/UX. |
| The GUI document-editor/wiki screens + the `gnosisDocumentsContent`/`gnosisWikisContent` render paths | Project-specific (renderer, provident-authored) | Medium cost; the D4 GUI surface. |
| The optimistic-concurrency 409 UX (H2) | Project-specific (surfaces the typed `ConflictError` on both surfaces) | Low cost; the required 409 UX. |
| The D2 engine-absent surfacing + the H1 store-authority framing | Project-specific (consumes A1 §5.6 + the roadmap H1) | Low cost; the D2 optional-engine contract + the store-authority framing. |
| The contract-spec update (`mcp-endpoint.md` + `decisions.md`) | Project-specific (doc) | Low cost; keeps the contract + decision records in sync. |

No engine gap. The A1 proxy is landed; this unit only wires it. The RBAC
**enforcement** semantics are engine-side (the engine is the enforcer); A2 wires
the shell's authority store to the engine's RBAC check, it does NOT re-implement
enforcement.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.8/§5.9 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

**Adversarial findings (RCA-3 — populated post-green, all HOST, fixed + regression-tested):**

- **H-1 (the D4-parity gap — the GUI panes did not expose the mutating CRUD
  actions):** the PURE render helpers emitted only the read-only wiki/document
  list items (with the select `handlers` bound); the mutating editor controls
  (create/update/delete/publish/unpublish/archive) were NOT reachable from the
  GUI. **Fixed** by binding the handler defs to the rendered nodes + rendering the
  editor controls: the `GnosisCrudPanes` host's `documentsContent`/`wikisContent`
  methods wrap the PURE render-helper output with the interactive controls
  (buttons carrying `handlers: [{ name, event, body }]` using the host's body
  strings — the existing `gnosis-panes.ts` pattern). Each mutating body passes the
  fixed operator `callerId` (`'operator'`); the create bodies pass a fresh
  `requestId` per action. **Regression-tested.**
- **H-2 (the no-edit-access state, §5.9-40):** when a mutating action is attempted
  with the `gnosis-edit` group OFF (or the caller has no edit authority), the pane
  must render a DISTINCT no-edit-access indicator (never the normal read-only
  content). **Fixed** in the `GnosisCrudPanes` host (the `noEditAccess` flag +
  the `data-gnosis-state: 'no-edit-access'` indicator). **Regression-tested.**
- **H-3 (`gnosis.document.update` silently defaulted the required
  `baseRevision`/`graph`):** the old code defaulted a missing `baseRevision` to 0
  and a missing `graph` to `{nodes:[],edges:[]}`. **Fixed** to throw — a missing
  `baseRevision`/`graph` is now a handler-side error
  (`Error('<tool>: baseRevision and graph required')`), never a silent default
  (§5.1 pins both as REQUIRED args). **Regression-tested.**
- **H-4 (`gnosis.document.list` silently nulled an invalid `state`):** the old
  code silently nulled a present-but-invalid `state` into a no-filter. **Fixed**
  to throw — a present-but-invalid `state` (not one of `Draft`/`Published`/
  `Archived`) is now a handler-side error (`Error('<tool>: invalid state')`),
  never a silent pass-through (§5.1 pins `state` as a closed enum). **Regression-tested.**
- **H-5 (the pane group-gate mutating-tool set was split/incomplete):** the old
  `MUTATING_DOC_TOOLS` set omitted `gnosis.wiki.create`, so the `gnosis-wikis`
  channel's mutating gate was incomplete. **Fixed** to ONE complete mutating-tool
  set (`MUTATING_TOOLS`, all 7 mutating document/wiki tools) that gates BOTH the
  `gnosisDocuments` and `gnosisWikis` channels. **Regression-tested.**
- **H-6 (`HOST-GUI-DOCS-PANE-DEADLOCK` — the documents-pane chicken-and-egg
  deadlock, live-confirmed 2026-09-11):** the PURE render helper
  `gnosisDocumentsContent` (in `src/renderer/pane-graph.ts`) returned the whole-pane
  `data-gnosis-state='unavailable'` whenever `state.wikis` was populated but
  `state.documents` was still `null` — the NORMAL state right after a refresh,
  before the user selected a wiki. Because the clickable wiki selector `<li>` items
  (the ONLY path that triggers `gnosis.document.list`, which sets `documents`) were
  rendered BELOW the all-unavailable guard, the pane was stuck in `unavailable` — a
  chicken-and-egg deadlock. The `gnosis-wikis` pane did NOT have this problem (its
  wiki list self-populates on boot, independent of any document state). **Fixed** by
  this scoped spec re-derivation (the `gnosisDocumentsContent` contract, §5.5/§5.7/
  §5.8-20/§5.9-41): the wiki selector renders whenever `state.wikis != null`
  (INDEPENDENT of `state.documents` — the `<li>` items keep the
  `gnosis-documents-select-wiki` click handler → `gnosis.document.list`); only the
  document-list/editor section shows the empty document-list state
  (`data-gnosis-docstate='empty'`) when `documents` is null or empty — NEVER the
  whole-pane `unavailable` while the wiki selector is available and NEVER a
  TypeError. The whole-pane `unavailable` (engine-absent) state is reserved for
  `state == null || state.wikis == null`. **Regression-tested.**

**PBT audit (read-only, §5.7 register):** the executed property layer ran under
the deterministic pinned seed `0xA2A2A2A2` (≤100 attempts/row, ≤400 total,
stop-after-5). The adversarial reviewer's read-only PBT audit (per-row
over-strength reasoning, generator-coverage check, prose counterexamples,
negative-generator requests) returned **all 8 register rows HELD** (P-IM-1,
P-IM-2, P-IM-3, P-SM-1, P-SM-2, P-SM-3, P-TP-1, P-TP-2) — no row broken, no
generator-coverage gap, no prose counterexample. **RE-BALANCED at the H-6
re-derivation:** the register is now **P-IM-1 (the merged §5.1 tool/method-mapping
family), P-IM-2, P-IM-3, P-IM-4 (the documents-pane render row), P-SM-1, P-SM-2,
P-SM-3, P-TP-2** (= 8 rows; the old `P-TP-1` bijection is merged into `P-IM-1`,
§5.7). The re-derivation re-runs the register under the same pinned seed
(`0xA2A2A2A2`).

### 3b. Package findings register (provident-ssr / Gnosis — recorded, never patched)

> Package/upstream findings from the post-green adversarial pass are recorded
> here and routed to `docs/defects.md` + `docs/HANDOFF.md` (never patched in
> this repo — the package code is upstream-owned).

- **NONE YET** (the register is EMPTY at the spec gate).

## 4. Design decisions pinned by this spec

The NEW decision rows this spec pins (each is expanded in §5):

- **GNOSIS-CRUD-EDIT-GROUP (new):** a NEW `ToolGroup` union member `'gnosis-edit'`
  (mutating, default-off) is added to `security.ts`, DISTINCT from the read-only
  `gnosis` group. The 7 mutating document/wiki tools sit in `gnosis-edit`; the 4
  read-only document/wiki tools sit in `gnosis`. Editing is NEVER a `code`-group
  op (§5.2).
- **GNOSIS-DOCUMENT-TOOLS (new):** the 11 `gnosis.document.*`/`gnosis.wiki.*` MCP
  tools (create/get/update/delete/publish/unpublish/archive/list documents;
  create/get/list wikis), main-process-routed through the SAME `handleGnosisTool`
  handler as the retrieval trio (§5.1/§5.3).
- **GNOSIS-RBAC-CALLER-STORE (new):** a NEW shell-side `AuthorityStore` maps a
  caller identity (a human/agent user) to their edit-authority credential (the
  opaque `caller` string the engine's RBAC check consumes). The mutating tools
  present the caller's authority credential on each mutating call; a caller with
  no edit authority is denied caller-side (§5.4).
- **GNOSIS-409-UX (new):** the optimistic-concurrency 409 UX (H2) surfaces
  `ConflictError` (409) on BOTH the MCP tools and the GUI document-editor screens
  (§5.5/§5.6).
- **GNOSIS-IDEMPOTENCY-DEDUP (new):** a NEW caller-side `IdempotencyRegistry`
  dedups the duplicate-create risk (P4). P1a's frozen wire carries NO
  idempotency-key field, so the dedup is caller-side: the mutating create tools
  accept an optional `requestId`; a duplicate `requestId` returns the first result
  (§5.4).

The CONSUMED decisions (already LANDED):

- **H1 — GNOSIS-SUPPLANTS-DOCUMENT-STORE (consumed):** the A2 document-CRUD
  screens ARE the document surface over the engine — NOT a second editor, NO sync
  to the shell's local store. The local `createJsonRagStore` is the D2 fallback
  for the shell's OTHER (non-A2) document features (§5.6).
- **H3 — GNOSIS-RBAC-EDIT-ENFORCEMENT (consumed):** the mutating tools sit in a
  separate mutating default-off group (`gnosis-edit`); the engine is the RBAC
  enforcer; A2 wires the shell's authority store to the engine's RBAC check (§5.4).
- **RAG-EDIT-MCP-GROUPS (consumed):** the mutating-group pattern (a separate
  mutating default-off group, distinct from the read-only group; editing is NEVER
  a `code`-group op) (§5.2).
- **GNOSIS-TOOL-NAMING-GROUP (consumed):** the `gnosis.*` prefix + the `gnosis`
  group pattern (Unit GN-MCP-UI) (§5.1/§5.2).
- **GNOSIS-MAIN-ROUTING-AUDIT (consumed):** the `name.startsWith('gnosis.')`
  main-process routing branch + the `handleGnosisTool` handler pattern (Unit
  GN-MCP-UI) (§5.3).
- **GNOSIS-D4-PARITY-SCOPE (consumed):** the D4 parity scope (every CRUD feature
  reachable through BOTH the GUI and the MCP surface; provident-authored panes)
  (§5.5).
- **GNOSIS-D2-ENGINE-ABSENT (consumed):** `EngineUnavailable` surfaced
  consistently across MCP + GUI (§5.6).
- **GNOSIS-SECURITY-CARVE-OUT (consumed):** the GUI-only boundary; NO `gnosis.*`
  tool `inputSchema` accepts a credential arg (no `token`/`tls`/`ca`/`cert`/`key`/
  `apiKey`). The `callerId` arg is an identity, NOT a credential (§5.1/§5.2).
- **GNOSIS-GUI-BRIDGE-IPC (consumed):** the GUI panes reach main via the bridge →
  IPC → the SAME `handleGnosisTool` handler (MCP/UI equivalence) (§5.5).
- **ENGINE-CRUD-WIRE-CLIENT (consumed):** the LANDED A1 `createEngineCrudRagStore`
  proxy surface (the 11-method `EngineCrudRagStore`) (§5.1/§5.3).
- **ENCODE+DECODE (consumed):** the A1 proxy's encode+decode surface (§5.1).
- **P4-IDEMPOTENCY-RETRY (consumed, A1 half):** the A1 bounded retry-on-
  `EngineUnavailable` for the mutating creates; A2 owns the caller-side
  idempotency-key dedup (§5.4).

## 5. The exhaustive contract

### 5.1 The 11 `gnosis.document.*` / `gnosis.wiki.*` MCP tools

The 11 tools are registered in the `graph` array of `mcp-server.ts` `registerTools`
(the same pattern as the `gnosis.query`/`gnosis.stream`/`gnosis.status` tools) and
routed to the SAME main-process `handleGnosisTool` handler (see §5.3). They are
gated by the `gnosis` group (read-only tools) or the `gnosis-edit` group (mutating
tools) — both default-off (§5.2). **A7:** NONE of the 11 tools' `inputSchema`
accepts a credential arg (no `token`/`tls`/`ca`/`cert`/`key`/`apiKey`). The
`callerId` arg on the mutating tools is the caller's **identity** (NOT a
credential — the credential is derived from the `AuthorityStore`, never accepted
as an arg).

**Tool-name → CRUD-method mapping (the §5.7 `P-IM-1` mapping family — total,
unambiguous, bijective):**

| MCP tool | CRUD method | mutating? | group |
| --- | --- | --- | --- |
| `gnosis.document.get` | `getDocument` | no | `gnosis` |
| `gnosis.document.list` | `listDocuments` | no | `gnosis` |
| `gnosis.wiki.get` | `getWiki` | no | `gnosis` |
| `gnosis.wiki.list` | `listWikis` | no | `gnosis` |
| `gnosis.document.create` | `createDocument` | **yes** | `gnosis-edit` |
| `gnosis.document.update` | `updateDocument` | **yes** | `gnosis-edit` |
| `gnosis.document.delete` | `deleteDocument` | **yes** | `gnosis-edit` |
| `gnosis.document.publish` | `publishDocument` | **yes** | `gnosis-edit` |
| `gnosis.document.unpublish` | `unpublishDocument` | **yes** | `gnosis-edit` |
| `gnosis.document.archive` | `archiveDocument` | **yes** | `gnosis-edit` |
| `gnosis.wiki.create` | `createWiki` | **yes** | `gnosis-edit` |

The 11 tool names are **pairwise distinct, non-empty, `gnosis.document.*`/
`gnosis.wiki.*`** strings (the §5.7 `P-IM-1` row). The mapping is a **bijection**
between the 11 tool names and the 11 CRUD methods (the §5.7 `P-IM-1` mapping
family — the bijection conjunct merged at the H-6 re-derivation).

**Body-construction rule (pinned — the MCP-args → A1-proxy-body mapping):** the
three body-carrying tools (`gnosis.document.create`, `gnosis.document.update`,
`gnosis.document.list`) build the A1 proxy's serde-frozen body from the MCP args
with the wire's **`null`-when-`None`** discipline (P1a §4.2 — `null` for absent
`Option` fields). Concretely:
- **`gnosis.document.create`** → `CreateDocumentRequest { title, tags, author }`:
  `title` = the required `title` arg; `tags` = the `tags` arg if present, else
  `null` (NEVER `[]` for an absent arg); `author` = the `author` arg if present,
  else `null`.
- **`gnosis.document.update`** → `UpdateDocumentRequest { baseRevision, graph,
  title, tags }`: `baseRevision` = the required `baseRevision` arg; `graph` = the
  required `graph` arg (passed through opaque — the node/edge inner shapes are not
  pinned by P1a); `title` = the `title` arg if present, else `null`; `tags` = the
  `tags` arg if present, else `null`.
- **`gnosis.document.list`** → `ListDocumentsFilter { state, tag, page, pageSize }`:
  `state` = the `state` arg if present, else `null`; `tag` = the `tag` arg if
  present, else `null`; `page` = the `page` arg if present, else `null`; `pageSize`
  = the `pageSize` arg if present, else `null`.
The absent-optional → `null` mapping is deterministic and derivable; the TestWriter
asserts the exact encoded body for each of the three tools.

**The read-only tools (in the `gnosis` group):**

**`gnosis.document.get`** — issue a `getDocument` through the A1 proxy and return
the typed `Document`.

- **inputSchema (exact):** `{ documentId: z.string() }`.
- **Return shape:** the typed `Document` (A1 §5.1 — `documentId`, `wikiId`,
  `revision`, `state`, `graph`, `title`, `createdAt`, `updatedAt`, `tags`,
  `author`).
- **Throw pattern:** the proxy's typed `EngineWireError` propagates as the MCP
  tool error. `DocumentNotFound` → `EngineWireError` (404). A non-`Ready` observed
  state → `EngineUnavailable` (503). Connection-refused → `EngineUnavailable`
  (503, `cause: 'connection-refused'`). A malformed wire body → `EngineError`
  (502). A null CRUD engine → `Error('gnosis.document.get: no engine crud rag
  store configured')`.
- **Audit:** NOT recorded (read-only — the `QueryAuditLog` is query-specific; the
  CRUD tools do NOT record to it, §5.3).

**`gnosis.document.list`** — issue a `listDocuments` through the A1 proxy and
return the typed `DocumentList`.

- **inputSchema (exact):**
  ```ts
  {
    wikiId: z.string(),
    state: z.enum(['Draft', 'Published', 'Archived']).optional(),
    tag: z.string().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
  }
  ```
- **Return shape:** the typed `DocumentList` (A1 §5.1 — `items`, `total`, `page`,
  `pageSize`), whose **`items` are `DocumentSummary[]`** (the six-field §5.1
  summary — `documentId`, `wikiId`, `title`, `state`, `revision`, `updatedAt`),
  per the re-derived A1 contract (`HOST-CRUD-LIST-SUMMARY-DECODE`). A full
  `Document` is never on the list wire.
- **Throw pattern:** `WikiNotFound` → `EngineWireError` (404); `ValidationError`
  → `EngineWireError` (400) (a `page < 1` or `pageSize < 1` or `pageSize > 100`
  filter is a server-side `ValidationError`). A non-`Ready` observed state →
  `EngineUnavailable` (503). Connection-refused → `EngineUnavailable` (503,
  `cause: 'connection-refused'`). A malformed wire body → `EngineError` (502). A
  null CRUD engine → `Error('gnosis.document.list: no engine crud rag store
  configured')`. **H-4 (adversarial):** a present-but-invalid `state` (not one of
  `Draft`/`Published`/`Archived`) is a handler-side error
  (`Error('gnosis.document.list: invalid state')`), never a silent null.
- **Audit:** NOT recorded (read-only).

**`gnosis.wiki.get`** — issue a `getWiki` through the A1 proxy and return the
typed `Wiki`.

- **inputSchema (exact):** `{ wikiId: z.string() }`.
- **Return shape:** the typed `Wiki` (A1 §5.1 — `wikiId`, `name`).
- **Throw pattern:** `WikiNotFound` → `EngineWireError` (404). A non-`Ready`
  observed state → `EngineUnavailable` (503). Connection-refused →
  `EngineUnavailable` (503, `cause: 'connection-refused'`). A malformed wire body
  → `EngineError` (502). A null CRUD engine → `Error('gnosis.wiki.get: no engine
  crud rag store configured')`.
- **Audit:** NOT recorded (read-only).

**`gnosis.wiki.list`** — issue a `listWikis` through the A1 proxy and return the
typed `Wiki[]`.

- **inputSchema (exact):** `{}` (no args).
- **Return shape:** the typed `Wiki[]`.
- **Throw pattern:** a non-`Ready` observed state → `EngineUnavailable` (503).
  Connection-refused → `EngineUnavailable` (503, `cause: 'connection-refused'`).
  A malformed wire body → `EngineError` (502). A null CRUD engine →
  `Error('gnosis.wiki.list: no engine crud rag store configured')`. (`listWikis`
  has no `StoreError` fail-state — P1a §6.1.)
- **Audit:** NOT recorded (read-only).

**The mutating tools (in the `gnosis-edit` group):**

**`gnosis.document.create`** — issue a `createDocument` through the A1 proxy and
return the typed `Document`.

- **inputSchema (exact):**
  ```ts
  {
    callerId: z.string(),
    wikiId: z.string(),
    title: z.string(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    requestId: z.string().optional(),
  }
  ```
  **A7:** the schema carries NO credential field — no `token`, no `tls`, no
  `ca`/`cert`/`key`, no `apiKey`. The `callerId` is the caller's **identity** (NOT
  a credential); the edit-authority credential is derived from the `AuthorityStore`
  (§5.4), never accepted as an arg. The `requestId` is the caller-side
  idempotency key (P4, §5.4).
- **Return shape:** the typed `Document` (A1 §5.1). The A1 proxy validates
  `revision == 0` and `state == 'Draft'` (A1 §5.3).
- **Throw pattern:** `WikiNotFound` → `EngineWireError` (404); `ValidationError`
  → `EngineWireError` (400) (empty/overlong `title`). A non-`Ready` observed state
  → `EngineUnavailable` (503). Connection-refused → `EngineUnavailable` (503,
  `cause: 'connection-refused'`). A malformed wire body → `EngineError` (502). A
  null CRUD engine → `Error('gnosis.document.create: no engine crud rag store
  configured')`. **No-edit-authority** (the `callerId` resolves to no credential
  in the `AuthorityStore`) → `Error('gnosis.document.create: caller has no edit
  authority')` (a caller-side deny, §5.4).
- **Idempotency (P4):** a `requestId` that already has a cached result in the
  `IdempotencyRegistry` returns the cached result WITHOUT issuing a new
  `createDocument` (a duplicate-create dedup, §5.4).
- **Audit:** NOT recorded (the `QueryAuditLog` is query-specific; the CRUD tools
  do NOT record to it, §5.3).

**`gnosis.document.update`** — issue an `updateDocument` through the A1 proxy and
return the typed `Document`.

- **inputSchema (exact):**
  ```ts
  {
    callerId: z.string(),
    documentId: z.string(),
    baseRevision: z.number(),
    graph: z.object({ nodes: z.array(z.unknown()), edges: z.array(z.unknown()) }),
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }
  ```
  **A7:** no credential field. The `callerId` is the caller's identity.
- **Return shape:** the typed `Document` (A1 §5.1). The A1 proxy does NOT validate
  the `revision + 1` (a caller-side concern against the request's `baseRevision`,
  A1 §5.3).
- **Throw pattern:** `DocumentNotFound` → `EngineWireError` (404); `ValidationError`
  → `EngineWireError` (400) (invalid `graph`); **`ConflictError` → `ConflictError`
  (409)** (the optimistic-concurrency 409 UX, H2 — a stale `baseRevision`). A
  non-`Ready` observed state → `EngineUnavailable` (503). Connection-refused →
  `EngineUnavailable` (503, `cause: 'connection-refused'`). A malformed wire body
  → `EngineError` (502). A null CRUD engine → `Error('gnosis.document.update: no
  engine crud rag store configured')`. **No-edit-authority** → `Error('gnosis.document.update:
  caller has no edit authority')`. **H-3 (adversarial):** a missing
  `baseRevision`/`graph` is a handler-side error
  (`Error('gnosis.document.update: baseRevision and graph required')`), never a
  silent default.
- **Audit:** NOT recorded.

**`gnosis.document.delete`** — issue a `deleteDocument` through the A1 proxy and
return `void`.

- **inputSchema (exact):** `{ callerId: z.string(), documentId: z.string() }`.
  **A7:** no credential field.
- **Return shape:** `void` (the wire `result:null`).
- **Throw pattern:** `DocumentNotFound` → `EngineWireError` (404); `DocumentInUse`
  → `EngineWireError` (409) (delete integrity, gnosis.md §4.4.5). A non-`Ready`
  observed state → `EngineUnavailable` (503). Connection-refused →
  `EngineUnavailable` (503, `cause: 'connection-refused'`). A malformed wire body
  → `EngineError` (502). A null CRUD engine → `Error('gnosis.document.delete: no
  engine crud rag store configured')`. **No-edit-authority** → `Error('gnosis.document.delete:
  caller has no edit authority')`.
- **Audit:** NOT recorded.

**`gnosis.document.publish`** — issue a `publishDocument` through the A1 proxy
and return the typed `Document`.

- **inputSchema (exact):** `{ callerId: z.string(), documentId: z.string() }`.
  **A7:** no credential field.
- **Return shape:** the typed `Document` (A1 §5.1). The A1 proxy validates
  `state == 'Published'` (A1 §5.3).
- **Throw pattern:** `DocumentNotFound` → `EngineWireError` (404);
  `UnresolvedReference` → `EngineWireError` (422) (the publish gate, gnosis.md
  §4.4.3). A non-`Ready` observed state → `EngineUnavailable` (503).
  Connection-refused → `EngineUnavailable` (503, `cause: 'connection-refused'`). A
  malformed wire body → `EngineError` (502). A null CRUD engine →
  `Error('gnosis.document.publish: no engine crud rag store configured')`.
  **No-edit-authority** → `Error('gnosis.document.publish: caller has no edit
  authority')`.
- **Audit:** NOT recorded.

**`gnosis.document.unpublish`** — issue an `unpublishDocument` through the A1
proxy and return the typed `Document`.

- **inputSchema (exact):** `{ callerId: z.string(), documentId: z.string() }`.
  **A7:** no credential field.
- **Return shape:** the typed `Document` (A1 §5.1). The A1 proxy validates
  `state == 'Draft'` (A1 §5.3).
- **Throw pattern:** `DocumentNotFound` → `EngineWireError` (404); `InvalidState`
  → `EngineWireError` (409) (state is not `PUBLISHED`). A non-`Ready` observed
  state → `EngineUnavailable` (503). Connection-refused → `EngineUnavailable`
  (503, `cause: 'connection-refused'`). A malformed wire body → `EngineError`
  (502). A null CRUD engine → `Error('gnosis.document.unpublish: no engine crud
  rag store configured')`. **No-edit-authority** → `Error('gnosis.document.unpublish:
  caller has no edit authority')`.
- **Audit:** NOT recorded.

**`gnosis.document.archive`** — issue an `archiveDocument` through the A1 proxy
and return the typed `Document`.

- **inputSchema (exact):** `{ callerId: z.string(), documentId: z.string() }`.
  **A7:** no credential field.
- **Return shape:** the typed `Document` (A1 §5.1). The A1 proxy validates
  `state == 'Archived'` (A1 §5.3).
- **Throw pattern:** `DocumentNotFound` → `EngineWireError` (404); `InvalidState`
  → `EngineWireError` (409) (state is `ARCHIVED`). A non-`Ready` observed state →
  `EngineUnavailable` (503). Connection-refused → `EngineUnavailable` (503,
  `cause: 'connection-refused'`). A malformed wire body → `EngineError` (502). A
  null CRUD engine → `Error('gnosis.document.archive: no engine crud rag store
  configured')`. **No-edit-authority** → `Error('gnosis.document.archive: caller
  has no edit authority')`.
- **Audit:** NOT recorded.

**`gnosis.wiki.create`** — issue a `createWiki` through the A1 proxy and return
the typed `Wiki`.

- **inputSchema (exact):**
  ```ts
  {
    callerId: z.string(),
    name: z.string(),
    requestId: z.string().optional(),
  }
  ```
  **A7:** no credential field. The `requestId` is the caller-side idempotency key
  (P4, §5.4).
- **Return shape:** the typed `Wiki` (A1 §5.1 — `wikiId`, `name`).
- **Throw pattern:** `ValidationError` → `EngineWireError` (400) (empty/overlong
  `name`). A non-`Ready` observed state → `EngineUnavailable` (503).
  Connection-refused → `EngineUnavailable` (503, `cause: 'connection-refused'`). A
  malformed wire body → `EngineError` (502). A null CRUD engine →
  `Error('gnosis.wiki.create: no engine crud rag store configured')`.
  **No-edit-authority** → `Error('gnosis.wiki.create: caller has no edit
  authority')`.
- **Idempotency (P4):** a `requestId` that already has a cached result in the
  `IdempotencyRegistry` returns the cached result WITHOUT issuing a new
  `createWiki` (a duplicate-create dedup, §5.4).
- **Audit:** NOT recorded.

**A8 (health-as-tool, consumed):** the read-only document tools are TOOLS in the
`gnosis` group (default-off), NOT `mcp://` resources (a resource would be gated on
the default-ON `read` group, leaking document data). The `gnosis`/`gnosis-edit`
groups are the ONLY gates on the document/wiki surface.

### 5.2 The `gnosis-edit` mutating group + the `security.ts` changes

**H3 + RAG-EDIT-MCP-GROUPS:** a NEW `ToolGroup` union member `'gnosis-edit'`
(mutating, default-off) is added to `security.ts`, DISTINCT from the read-only
`gnosis` group.

- **`ToolGroup` union (line 3):** `'read' | 'dispatch' | 'graph' | 'code' |
  'module' | 'rag' | 'edit' | 'gnosis'` → **`'read' | 'dispatch' | 'graph' |
  'code' | 'module' | 'rag' | 'edit' | 'gnosis' | 'gnosis-edit'`** (one new
  member).
- **`TOOL_GROUPS` map (lines 5–89):** eleven new rows:
  ```ts
  // Unit A2 (docs/specs/unit-a2-document-crud-wiring.md §5.2) — the read-only
  // document/wiki tools in the `gnosis` group + the mutating document/wiki tools
  // in the NEW `gnosis-edit` (mutating, default-off) group. Editing is NEVER a
  // `code`-group op.
  'gnosis.document.get': 'gnosis',
  'gnosis.document.list': 'gnosis',
  'gnosis.wiki.get': 'gnosis',
  'gnosis.wiki.list': 'gnosis',
  'gnosis.document.create': 'gnosis-edit',
  'gnosis.document.update': 'gnosis-edit',
  'gnosis.document.delete': 'gnosis-edit',
  'gnosis.document.publish': 'gnosis-edit',
  'gnosis.document.unpublish': 'gnosis-edit',
  'gnosis.document.archive': 'gnosis-edit',
  'gnosis.wiki.create': 'gnosis-edit',
  ```
- **`VALID_GROUPS` set (line 185):** `'gnosis-edit'` is added (one new member).
- **`defaultSecurityConfig()` (line 133):** UNCHANGED — the default enabled set
  stays `['read', 'dispatch']`. **The `gnosis-edit` group is default-OFF** (a
  human must enable it via the manual-UI settings pane, like `rag`/`edit`/`code`/
  `module`/`gnosis`).
- **`ALL_TOOLS` (mcp-server.ts lines 1673–1746):** the eleven names are added:
  ```ts
  // Unit A2 (docs/specs/unit-a2-document-crud-wiring.md §5.2) — the 11
  // document/wiki CRUD tools over the LANDED createEngineCrudRagStore proxy.
  // Main-handled. 4 read-only in `gnosis`; 7 mutating in `gnosis-edit`.
  'gnosis.document.get',
  'gnosis.document.list',
  'gnosis.wiki.get',
  'gnosis.wiki.list',
  'gnosis.document.create',
  'gnosis.document.update',
  'gnosis.document.delete',
  'gnosis.document.publish',
  'gnosis.document.unpublish',
  'gnosis.document.archive',
  'gnosis.wiki.create',
  ```
- **`groupForTool` (security.ts lines 91–102):** UNCHANGED — the eleven exact-name
  rows in `TOOL_GROUPS` resolve to `'gnosis'` (read-only) or `'gnosis-edit'`
  (mutating). A `gnosis.*` name NOT in `TOOL_GROUPS` (e.g. a hypothetical
  `gnosis.document.other`) → `null` (fail-closed, never resolves to a group).

**Five-seam-gate reconciliation (pinned — the `gnosis-edit` group is NOT a
renderer seam):** the `gnosis.*` document/wiki tools are **main-handled MCP tools**
(never renderer-routed), so the `gnosis-edit` group gates the **MCP agent path
only** and requires NO `RpcMethod` union member, NO renderer-switch method, and NO
`MUTATING_METHODS` member (the same discipline as the STORE-LISTING-IPC "NOT a
five-seam gate seam" note — `docs/specs/unit-ms5-settings-listing.md`). The relevant
seams are `TOOL_GROUPS` + `ALL_TOOLS` + the main-handled `gnosis.` routing branch
(§5.3), all covered here. The GUI panes' mutating actions are gated by the
renderer-side M13 handler gate (the `gnosis`/`gnosis-edit` group checks in the pane
handlers), NOT by the IPC (the renderer→main IPC is NOT group-gated per
IPC-SURFACE-NOT-GROUP-GATED). A later agent must NOT "fix" the missing `RpcMethod`/
`MUTATING_METHODS` members — they are deliberately absent.

**A7 (security carve-out — the GUI-only boundary, extended to the CRUD tools):**
the following are GUI-only at the shell (never MCP-tool args, never MCP-visible):

- **Engine credentials:** the proxy's `auth.token` (the bearer token sent as
  `Authorization: Bearer <token>`) and the TLS `ca`/`cert`/`key` options (A1 §5.1
  `EngineCrudRagStoreOptions.auth`). These are configured in the GUI (the D4
  security-configuration carve-out), NEVER accepted as an MCP tool argument.
- **The RBAC edit-authority credential** (the `caller` string the engine's RBAC
  check consumes): NEVER accepted as an MCP tool argument. It is derived from the
  shell's `AuthorityStore` (§5.4), never passed by the caller.
- **Astral push creds** and **Firmament bridge auth** (the other D4 carve-out
  credential families) — GUI-only, never MCP args.
- **`baseUrl` is NOT a credential** — it is env/CLI config (Unit GN-MCP-UI §5.4),
  not a GUI-only secret and not an MCP tool arg.

**The no-credential-arg test (A7, extended):** a test asserts that NONE of the 11
`gnosis.document.*`/`gnosis.wiki.*` MCP tools' `inputSchema` accepts a credential
arg — no `token`, no `tls`, no `ca`/`cert`/`key`, no `apiKey` field in any of the
11 schemas (§5.7 P-IM-2). The `callerId` arg is an identity, NOT a credential.

### 5.3 Main-process routing + the extended `handleGnosisTool`

**The routing branch (mcp-server.ts ~line 2229):** the existing
`name.startsWith('gnosis.')` branch is EXTENDED to route the document/wiki tools.
The branch dispatches to the SAME `handleGnosisTool` handler, which is EXTENDED to
handle the 11 document/wiki tool names.

**The extended main-process handler (exported for direct unit testing):**

```ts
/** Unit A2 §5.3 — handle a `gnosis.*` tool in MAIN. The retrieval trio
 *  (`gnosis.query`/`gnosis.stream`/`gnosis.status`) route against the LANDED
 *  `EngineRagStore` proxy (`engine`); the 11 document/wiki tools route against
 *  the LANDED `EngineCrudRagStore` proxy (`engineCrud`). The mutating document/
 *  wiki tools resolve the caller's edit-authority credential from the
 *  `AuthorityStore` and thread it into the mutating args' `caller` field; the
 *  mutating create tools dedup via the `IdempotencyRegistry`. Exported for
 *  direct unit testing. */
export async function handleGnosisTool(
  engine: EngineRagStore | null,
  name: string,
  args: Record<string, unknown>,
  auditLog?: QueryAuditLog | null,
  engineCrud?: EngineCrudRagStore | null,
  authorityStore?: AuthorityStore | null,
  idempotency?: IdempotencyRegistry | null,
): Promise<unknown>
```

**Behavior (pinned):**

- **Null-engine guards (pinned — the top-level guard is REMOVED):** the current
  `handleGnosisTool` (mcp-server.ts:529) has a top-level `if (!engine) throw …`
  guard BEFORE the switch. A2 **removes that top-level guard** and moves the
  `if (!engine)` check INTO the retrieval-trio cases (`gnosis.query`/`gnosis.stream`/
  `gnosis.status`), so the document/wiki cases are gated ONLY on `engineCrud`. This
  is REQUIRED: a document/wiki tool with a null retrieval engine (but a present CRUD
  engine) must NOT throw the retrieval-engine error, and the fail-states 1–11 (null
  CRUD engine) must be reachable even when the retrieval engine is also null. The
  retrieval-trio cases guard `if (!engine) throw new Error(\`${name}: no engine rag
  store configured\`)` (unchanged); the document/wiki cases guard `if (!engineCrud)
  throw new Error(\`${name}: no engine crud rag store configured\`)`. The message
  uses the tool's own name.
- **Signature-change impact (pinned):** the extended `handleGnosisTool` signature
  (adding `engineCrud?`/`authorityStore?`/`idempotency?`) is backward-compatible
  (the new params are optional), but the existing call site (`mcp-server.ts:2230`)
  and the existing GN-MCP-UI unit tests for `handleGnosisTool` MUST be updated to
  pass the new params (or rely on the optional defaults). The TestWriter accounts
  for this in the red set.
- **`gnosis.document.get`:** validates the args (the `documentId` field), then
  calls `engineCrud.getDocument({ documentId })` and returns the typed `Document`.
  The proxy's typed `EngineWireError` propagates (the MCP tool error surfaces the
  code + §11 httpStatus).
- **`gnosis.document.list`:** validates the args (the `wikiId` + the optional
  `state`/`tag`/`page`/`pageSize` fields), builds the `ListDocumentsFilter` body,
  then calls `engineCrud.listDocuments({ wikiId, body })` and returns the typed
  `DocumentList` (whose `items` are `DocumentSummary[]`, per the re-derived A1
  `HOST-CRUD-LIST-SUMMARY-DECODE` contract — A1 §5.1/§5.2). **H-4
  (adversarial):** a present-but-invalid `state` is rejected
  (`Error('<tool>: invalid state')`), never silently nulled.
- **`gnosis.wiki.get`:** validates the args (the `wikiId` field), then calls
  `engineCrud.getWiki({ wikiId })` and returns the typed `Wiki`.
- **`gnosis.wiki.list`:** calls `engineCrud.listWikis({})` and returns the typed
  `Wiki[]`.
- **`gnosis.document.create`:** validates the args (the `callerId`/`wikiId`/
  `title` + the optional `tags`/`author`/`requestId` fields), resolves the caller's
  edit-authority credential from the `AuthorityStore` (§5.4), then — if the
  `requestId` is present and already cached in the `IdempotencyRegistry` under the
  `(callerId, requestId)` pair — returns the cached result WITHOUT issuing a new
  `createDocument` (P4 dedup); otherwise calls
  `engineCrud.createDocument({ caller, wikiId, body })` and returns the typed
  `Document`, caching the result under the `(callerId, requestId)` pair (if
  present).
- **`gnosis.document.update`:** validates the args (the `callerId`/`documentId`/
  `baseRevision`/`graph` + the optional `title`/`tags` fields), resolves the caller
  credential, then calls `engineCrud.updateDocument({ caller, documentId, body })`
  and returns the typed `Document`. A `ConflictError` (409) propagates as the MCP
  tool error (the optimistic-concurrency 409 UX, H2). **H-3 (adversarial):** a
  missing `baseRevision`/`graph` is a handler-side error
  (`Error('<tool>: baseRevision and graph required')`), never a silent default.
- **`gnosis.document.delete`:** validates the args (the `callerId`/`documentId`
  fields), resolves the caller credential, then calls
  `engineCrud.deleteDocument({ caller, documentId })` and returns `void`.
- **`gnosis.document.publish`:** validates the args (the `callerId`/`documentId`
  fields), resolves the caller credential, then calls
  `engineCrud.publishDocument({ caller, documentId })` and returns the typed
  `Document`.
- **`gnosis.document.unpublish`:** validates the args (the `callerId`/`documentId`
  fields), resolves the caller credential, then calls
  `engineCrud.unpublishDocument({ caller, documentId })` and returns the typed
  `Document`.
- **`gnosis.document.archive`:** validates the args (the `callerId`/`documentId`
  fields), resolves the caller credential, then calls
  `engineCrud.archiveDocument({ caller, documentId })` and returns the typed
  `Document`.
- **`gnosis.wiki.create`:** validates the args (the `callerId`/`name` + the
  optional `requestId` fields), resolves the caller credential, then — if the
  `requestId` is present and already cached in the `IdempotencyRegistry` under the
  `(callerId, requestId)` pair — returns the cached result WITHOUT issuing a new
  `createWiki` (P4 dedup); otherwise calls
  `engineCrud.createWiki({ caller, name })` and returns the typed `Wiki`, caching
  the result under the `(callerId, requestId)` pair (if present).
- **Unknown `gnosis.*` name:** `throw new Error(\`unknown gnosis tool: ${name}\`)`
  (unchanged).

**The routing branch (mcp-server.ts ~line 2229):** the existing branch is extended
to thread the CRUD proxy + the authority store + the idempotency registry:

```ts
if (name.startsWith('gnosis.')) {
  return text(await handleGnosisTool(engineRagStore, name, args, auditLog, engineCrudRagStore, authorityStore, idempotency))
}
```

The `engineCrudRagStore`/`authorityStore`/`idempotency` are threaded into
`registerTools` (new parameters, like `engineRagStore`) and captured on the
`ProvidentMcpServer` instance (new private fields). The `applyGatePatch` widen
path passes them through unchanged.

**Audit-log wiring:** the CRUD tools do **NOT** record to the `QueryAuditLog`. The
`QueryAuditLog` is query-specific (`{query, filters, mode, resultCount, timestamp,
requester}` — gnosis.md §4.3.4); the document/wiki tools are NOT queries and do
NOT fit that shape. The security surface for the mutating CRUD tools is the
`gnosis-edit` group gate + the RBAC caller check (§5.4), NOT the query audit log.
This is a deliberate scope decision (the audit log stays query-specific; the CRUD
security surface is the group gate + the RBAC caller check).

### 5.4 `McpServerOptions.engineCrudRagStore` injection + boot construction + the `AuthorityStore` + the `IdempotencyRegistry`

**`McpServerOptions` (mcp-server.ts lines 1526–1596):** three new optional fields:

```ts
/** Unit A2 §5.4 — the LANDED createEngineCrudRagStore proxy (the 11 §4.1
 *  document-CRUD methods over the frozen P1a wire). The `gnosis.document.*`/
 *  `gnosis.wiki.*` tools are handled in MAIN against this proxy (never routed
 *  to the renderer). Injected like `engineRagStore`. */
engineCrudRagStore?: EngineCrudRagStore
/** Unit A2 §5.4 — the shell-side authority store (H3): maps a caller identity
 *  (a human/agent user) to their edit-authority credential (the opaque `caller`
 *  string the engine's RBAC check consumes). The mutating document/wiki tools
 *  resolve the caller's credential from this store. */
authorityStore?: AuthorityStore
/** Unit A2 §5.4 — the caller-side idempotency registry (P4): dedups the
 *  duplicate-create risk (P1a's wire has no idempotency-key field). The
 *  mutating create tools cache their results under a `requestId`. */
idempotency?: IdempotencyRegistry
```

The `ProvidentMcpServer` constructor captures them (`this.engineCrudRagStore =
opts.engineCrudRagStore ?? null`, etc.), and `registerTools` gains matching
parameters threaded through the `createServer` + `applyGatePatch` widen call sites.

**Boot-time construction (main.ts):** the CRUD proxy is constructed UNCONDITIONALLY
at boot (construction does no I/O — A1 §5.1):

```ts
const engineCrudRagStore = createEngineCrudRagStore({ baseUrl: resolveEngineBaseUrl() })
const authorityStore = createAuthorityStore(loadAuthorityMapping())
const idempotency = createIdempotencyRegistry({ maxEntries: 100 })
```

- **Construction does no I/O** (A1 §5.1 — the factory throws only on a
  null/missing/non-loopback `baseUrl`; it never contacts the engine).
- **Do NOT await `waitForReady` at boot** — the engine may be absent (D2); the
  boot must not block on it. Each CRUD call observes READY itself (A1 §5.6).
- **The `baseUrl` source** is the SAME `resolveEngineBaseUrl()` (the config seam →
  env `PROVIDENT_ENGINE_BASE_URL` → default `http://127.0.0.1:8080`, Unit
  GN-MCP-UI §5.4). The resolved `baseUrl` MUST be loopback (the proxy throws at
  construction on a non-loopback address — A1 §5.1).
- **The `AuthorityStore` mapping source (pinned):** the `callerId → credential`
  mapping is a **boot-time, in-memory** mapping loaded by `loadAuthorityMapping()`
  from the shell's operator settings (the same operator-settings store that holds
  the engine `baseUrl` config seam — `src/main/engine-config.ts`). It is NOT a
  credential store (the credentials are opaque application-level strings, not
  secrets); it is the shell's "who may edit" RBAC mapping (H3). The mapping is
  populated at boot from the operator settings and is immutable for the process
  lifetime (a change requires a restart — the same boot-time-only discipline as
  the registry). A callerId with no entry (or a null/empty credential) has NO edit
  authority.

**The shell-side `AuthorityStore` (H3 — GNOSIS-RBAC-CALLER-STORE; module
`src/main/authority-store.ts`):**

```ts
/** Unit A2 §5.4 — the shell-side authority store (H3). Maps a caller identity
 *  (a human/agent user) to their edit-authority credential (the opaque `caller`
 *  string the engine's RBAC check consumes). The engine is the RBAC enforcer;
 *  this store is the shell's mapping of WHO may edit. */
export interface AuthorityStore {
  /** Resolve the caller's edit-authority credential for a mutating CRUD call.
   *  Returns the credential string, or null if the caller has no edit
   *  authority (the mutating call is denied caller-side). */
  callerCredential(callerId: string): string | null
  /** The set of caller identities that have edit authority. */
  editors(): string[]
}

/** Create the authority store from a mapping of callerId → credential. A
 *  callerId with no entry (or a null/empty credential) has NO edit authority. */
export function createAuthorityStore(
  mapping: Record<string, string>,
): AuthorityStore
```

**Caller-credential threading (pinned):** for a mutating document/wiki tool call,
the handler resolves the caller's credential via
`authorityStore.callerCredential(callerId)`. If the result is `null` (the caller
has no edit authority), the mutating call is **denied caller-side** — the handler
throws `Error(\`${name}: caller has no edit authority\`)` and does NOT issue the
proxy call. If the result is a non-null credential string, the handler threads it
into the mutating args' `caller` field (the A1 proxy's typed args require `caller`
on the 7 mutating methods — A1 §5.4). The credential is NEVER accepted as an MCP
arg (A7); it is always derived from the store. A null/absent `authorityStore` →
the caller has NO edit authority (fail-closed: every mutating call is denied).

**The caller-side `IdempotencyRegistry` (P4 — GNOSIS-IDEMPOTENCY-DEDUP; module
`src/main/idempotency-registry.ts`):**

```ts
/** Unit A2 §5.4 — the caller-side idempotency registry (P4). P1a's frozen wire
 *  carries NO idempotency-key field, so the dedup is caller-side: the mutating
 *  create tools cache their results under a (callerId, requestId) key; a
 *  duplicate (callerId, requestId) returns the first result WITHOUT issuing a
 *  new create. Bounded (LRU). */
export interface IdempotencyRegistry {
  /** Look up a prior result for a (callerId, requestId) pair. Returns the
   *  cached result, or undefined if the pair is new. */
  get(callerId: string, requestId: string): unknown | undefined
  /** Record a completed result for a (callerId, requestId) pair. */
  set(callerId: string, requestId: string, result: unknown): void
}

/** Create the registry. Bounded by `maxEntries` (default 100) with LRU
 *  eviction — never unbounded. */
export function createIdempotencyRegistry(opts?: { maxEntries?: number }): IdempotencyRegistry
```

**Idempotency-dedup behavior (pinned):** for a mutating create tool
(`gnosis.document.create`/`gnosis.wiki.create`) with a `requestId` arg, the
handler checks `idempotency.get(callerId, requestId)` FIRST (the key is the
`(callerId, requestId)` PAIR — a caller can never receive another caller's cached
result, and a caller reusing their OWN `requestId` gets their own first result). If
a cached result exists, the handler returns it WITHOUT issuing a new proxy call (a
duplicate-create dedup). If no cached result exists, the handler issues the proxy
call and, on success, caches the result under the `(callerId, requestId)` pair via
`idempotency.set(callerId, requestId, result)`. A `requestId` that is absent → no
dedup (a fresh create). A null/absent `idempotency` → no dedup (a fresh create
each time). The registry is bounded (LRU, `maxEntries` default 100) — never
unbounded. The dedup is caller-side ONLY (the wire carries no idempotency-key
field; the A1 proxy's bounded retry-on-`EngineUnavailable` is the A1 half of P4,
this registry is the A2 half).

**Residual duplicate risk (pinned limitation):** the dedup caches ONLY on success.
A create that commits server-side but whose response is lost (a connection drop
after commit → `EngineUnavailable`) is never cached, so a retry with the same
`requestId` re-issues the create → a duplicate. This is INHERENT to the caller-side
approach (the wire carries no idempotency-key field, so the engine cannot dedup);
the A2 dedup is a best-effort duplicate-create guard, NOT a transactional
idempotency guarantee. The A2 unit does NOT over-claim this.

**RBAC-strength note (pinned):** the `callerId` is caller-supplied (an MCP arg),
so the RBAC strength depends on the `callerId → credential` mapping in the
`AuthorityStore`. Any MCP caller who knows a valid `callerId` obtains that
identity's credential. This is INHERENT to the design (the engine is the enforcer;
the credential is opaque); the A2 unit wires the store to the check, it does NOT
re-implement enforcement.

### 5.5 D4 parity scope (the GUI document-editor/wiki screens + the render paths)

**A5 (consumed):** every CRUD feature is reachable through BOTH the GUI and the
MCP surface (D4 parity). The GUI screens are provident-authored (all-UI-via-
provident constraint — a pane rendered outside the graph is a review finding).

**The document screen — an APP-GRAPH pane (the search-pane pattern):**

- **Pane id:** `'gnosis-documents'`; **scope:** `'app-graph'` (renders in the app
  Runtime graph → MCP-visible, like the `search` pane). It is **gated fail-closed
  on the `gnosis` group** for the read-only actions and **fail-closed on the
  `gnosis-edit` group** for the mutating actions (the M13 handler-gate pattern).
- **Content:** a provident-authored `LegacyNodeData` subtree rendering the
  document surface: a **wiki selector** (listWikis/getWiki), a **document list**
  (listDocuments), and a **document editor** (getDocument/createDocument/
  updateDocument/deleteDocument/publishDocument/unpublishDocument/archiveDocument).
  **H-6 / `HOST-GUI-DOCS-PANE-DEADLOCK` (re-derived):** the wiki selector renders
  whenever `state.wikis` is non-null, INDEPENDENT of `state.documents`; a null
  `documents` shows the empty document-list state (`data-gnosis-docstate='empty'`);
  the whole-pane `unavailable` (engine-absent) is reserved for a null `state`/null
  `wikis`. A null result → the empty/unavailable state (never a TypeError).
- **Data source:** a new bridge method (e.g. `bridge.gnosis.documents(tool, args)`)
  → an IPC → main → the SAME `handleGnosisTool` handler (MCP/UI equivalence). The
  handler body reaches the bridge via `window.provident.sidebar` — NEVER an MCP
  tool.

**The wiki screen — an APP-GRAPH pane (the search-pane pattern):**

- **Pane id:** `'gnosis-wikis'`; **scope:** `'app-graph'` (renders in the app
  Runtime graph → MCP-visible). It is **gated fail-closed on the `gnosis` group**
  for the read-only actions and **fail-closed on the `gnosis-edit` group** for the
  mutating actions.
- **Content:** a provident-authored `LegacyNodeData` subtree rendering the wiki
  surface: a **wiki list** (listWikis), a **wiki view** (getWiki), and a **wiki
  create** (createWiki). A null result → an empty state (never a TypeError).
- **Data source:** a new bridge method (e.g. `bridge.gnosis.wikis(tool, args)`) →
  an IPC → main → the SAME `handleGnosisTool` handler.

**The NEW render paths (A5):** the GUI needs render paths for the typed
`Document`/`DocumentList`/`Wiki`/`Wiki[]` shapes, DISTINCT from the local
`RagResult` render path. Two new pure render helpers are added (e.g. in
`pane-graph.ts` or a new `gnosis-crud-pane.ts` module):

```ts
/** Unit A2 §5.5 — the gnosis-documents pane content: renders the document
 *  surface (wiki selector + document list + document editor) over the typed
 *  Document/DocumentList/Wiki shapes. RE-DERIVED (H-6,
 *  HOST-GUI-DOCS-PANE-DEADLOCK — live-confirmed 2026-09-11): the wiki selector
 *  renders whenever `state.wikis != null` — INDEPENDENT of `state.documents`;
 *  only the document-list/editor section shows the empty document-list state
 *  (`data-gnosis-docstate='empty'`) when `state.documents` is null or empty —
 *  NEVER the whole-pane `unavailable` while the wiki selector is available and
 *  NEVER a TypeError. The whole-pane `unavailable` (engine-absent) state is
 *  reserved for `state == null || state.wikis == null`; the `conflict` (409)
 *  state is checked FIRST. A null result → the empty/unavailable state (never a
 *  TypeError). PURE. */
export function gnosisDocumentsContent(
  ctx: PaneContext,
  state: {
    wikis: Wiki[] | null
    documents: DocumentList | null
    document: Document | null
    conflict: ConflictError | null
  },
): LegacyNodeData

/** Unit A2 §5.5 — the gnosis-wikis pane content: renders the wiki surface (wiki
 *  list + wiki view + wiki create) over the typed Wiki/Wiki[] shapes. A null
 *  result → the empty state (never a TypeError). PURE. */
export function gnosisWikisContent(
  ctx: PaneContext,
  state: { wikis: Wiki[] | null; wiki: Wiki | null },
): LegacyNodeData
```

**`gnosisDocumentsContent` contract (re-derived by H-6, `HOST-GUI-DOCS-PANE-DEADLOCK`):
the wiki-selector-ALWAYS rule.** The PURE helper returns a `LegacyNodeData` subtree
(provident-authored data — NEVER hand-written DOM) over the typed
`Document`/`DocumentList`/`Wiki`/`ConflictError` shapes. The return shape must
remain `LegacyNodeData`; the select `<li>` items keep the `handlers` field bound
(the `gnosis-documents-select-wiki` / `gnosis-documents-select-doc` click handlers,
hardcoded as module constants — the PURE helper cannot receive them as args). The
guard order and the state mapping are PINNED:

1. **`state != null && state.conflict != null` → the whole-pane `conflict` state**
   (`data-gnosis-state='conflict'` — the H2 409 message + the re-read/current-
   revision prompt). **CHECKED FIRST** (unchanged): a `ConflictError` surfaces the
   conflict UX even when the cached `wikis`/`documents` are null (a re-read
   prompt). A null `state` at this point (a `conflict` field on a null `state`
   dereference is impossible) still falls through to guard 2.
2. **`state == null || state.wikis == null` → the whole-pane `unavailable` state**
   (`data-gnosis-pane='documents'`, `data-gnosis-state='unavailable'`). This is the
   **engine-absent** branch (unchanged in shape): no engine / no wiki data at all.
   After this guard, **`state.wikis` is non-null** — the wiki selector path is
   reachable.
3. **Otherwise (wikis present) — render the wiki selector ALWAYS, INDEPENDENT of
   `state.documents`/`state.document`:** the `Wikis` heading + the `ul` of `li`
   items, ONE `li` per `state.wikis` entry, each carrying
   `props['data-wiki-id'] = w.wikiId`, `content: w.name`, and
   `handlers: [{name:'gnosis-documents-select-wiki', event:'click', body:<the select-wiki body>}]`
   (the body calls `window.provident.sidebar.gnosisDocuments('gnosis.document.list',
   { wikiId })`). These `<li>` items are the **ONLY path that triggers
   `gnosis.document.list`** (which populates `state.documents`) — rendering them
   whenever `wikis` is present is precisely what defuses the deadlock: a user can
   always click a wiki to populate the document list. The wiki selector must NOT be
   gated on `state.documents`.
4. **The Documents section renders as either (a) the empty doc-list state or (b)
   the populated doc-list/editor, selected by `state.documents`:**
   - **(a) `state.documents` is null OR `state.documents.items` is empty → the
     EMPTY document-list state:** the `Documents` heading + an empty-state
     indicator (a `p` such as `'(No documents — select a wiki)'`) carrying
     `props['data-gnosis-docstate'] = 'empty'`. This branch MUST NOT dereference a
     null `documents` (never a TypeError — the `?.items ?? []` null-result rule)
     and MUST NOT return the whole-pane `unavailable` while the wiki selector is
     available.
   - **(b) `state.documents` is non-null and non-empty → the populated doc-list /
     editor:** the `Documents` heading + the `ul` of doc `li` items, ONE `li` per
     `state.documents.items` entry, each carrying `props['data-document-id']`,
     `props['data-revision']`, `content: `${d.title} (${d.state})``, and the
     `gnosis-documents-select-doc` click handler (`gnosis.document.get`); plus the
     document-editor fields when `state.document` is present (the `Document: …`
     title + the `Revision: … — state: …` fields, per the existing render).
**The `data-gnosis-state` attribute semantics:** the all-unavailable branch
(guard 2) now covers ONLY the no-wikis (engine-absent) case; the populated/empty
documents pane carries NO `data-gnosis-state` on the pane root — the documents
section's empty distinction is pinned by `data-gnosis-docstate='empty'` on its
empty-state indicator (consistent with the pane conventions; the `conflict` state
is `data-gnosis-state='conflict'`, the no-wikis is `data-gnosis-state='unavailable'`).

**The optimistic-concurrency 409 UX (H2 — GNOSIS-409-UX):** the `gnosis-documents`
pane renders a **conflict state** when an `updateDocument` action surfaces a
`ConflictError` (409). The conflict state shows the conflict message + the current
revision, prompting the user to re-read and re-apply (gnosis.md §4.1.4). The pane
catches the `ConflictError` from the bridge call and renders the conflict state —
never a crash. The MCP `gnosis.document.update` tool surfaces the same
`ConflictError` (409) as the typed MCP tool error (the two surfaces are
equivalent — MCP/UI equivalence).

**Provident-framework constraint (A5):** BOTH screens MUST be provident-authored
data (envelope nodes / handler bodies / component bindings) driven through the
producing graph — NEVER hand-written HTML/DOM in the renderer. A screen rendered
outside the provident graph is a review finding (the project-wide constraint,
AGENTS.md).

**Registration:** a NEW host (e.g. `GnosisCrudPanes`, `src/renderer/gnosis-crud-panes.ts`)
registers + enables both panes (`'gnosis-documents'` + `'gnosis-wikis'`, both
app-graph) and registers the handler defs via `registerHandlerDef` (the M2
pattern) in the same call. The panes are registered by `GnosisCrudPanes`, NOT by
`SidebarPanes.registerPanes()` (which unit-h pins to the 5 original panes), so the
Unit H census stays intact.

**GUI caller identity (pinned):** the mutating actions on the `gnosis-documents`/
`gnosis-wikis` panes route through the SAME `handleGnosisTool`, which requires a
`callerId` to resolve the edit-authority credential. The GUI's `callerId` is a
**fixed, configured operator identity** — the same operator identity that owns the
operator settings (the `AuthorityStore` maps it to the operator's edit-authority
credential). The pane's mutating handler bodies pass this fixed `callerId` (a
constant, e.g. `'operator'`) to the bridge; the operator is the human who enabled
the `gnosis-edit` group in the settings pane. This is a single-operator shell (the
Astrographer app is a local single-user app), so a fixed operator identity is the
correct GUI caller source. The GUI create actions (`gnosis.document.create`/
`gnosis.wiki.create`) generate a fresh `requestId` per action (e.g. a monotonic or
random id) so the caller-side idempotency dedup applies to the GUI path too.

**App-graph MCP-visibility vs the group gating (pinned):** the `gnosis-documents`/
`gnosis-wikis` panes are `scope: 'app-graph'`, so their rendered document/wiki
content is **MCP-visible via the default-ON `read`-group tools** (`get_rendered_html`/
`get_markdown`/`list_targets`/`get_node_state`) regardless of the `gnosis`/
`gnosis-edit` groups (default-off). This is the established APP-GRAPH-PANES-MCP-VISIBLE
pattern (the `gnosis-query` pane has the same asymmetry). The `gnosis`/`gnosis-edit`
group gating applies to the panes' **actions** (the M13 handler gate — a mutating
action fails closed when the `gnosis-edit` group is off), NOT to the content's
MCP-readability. This exposure is INTENDED for the primary document surface (H1) —
an agent can READ the document/wiki content via the `read` group, but cannot
MUTATE it without the `gnosis-edit` group.

**Handler-def census impact (pinned):** the new `GnosisCrudPanes` registers its
handler defs via `registerHandlerDef` (the M2 pattern). The resulting handler-def
census delta (the number of new `gnosis-documents-*`/`gnosis-wikis-*` handler defs)
is reconciled in the doc-review pass (the sibling GN-MCP-UI spec tracked the same
census). The app-graph handler-def census grows by the new CRUD-pane handler defs;
the operator-scope handler defs are separate (INLINE-ONLY, never globally
registered).

**Page-design note (repo divergence — the sibling convention):** this unit adds
two GUI screens, but **`docs/skills/designing-pages.md` is UNCHANGED/absent** —
this repo has NO `docs/skills/designing-pages.md` (the `docs/skills/` directory is
EMPTY). Per the established sibling convention (roadmap §-header note;
`docs/specs/unit-gn-mcp-ui-wiring.md` §5.5; `docs/specs/unit-a1-crud-routing-proxy.md`
§-header note), **NO such skill update is made** and no test-use-case coverage
matrix / demo-page index is touched. The two screens' page-design impact
(provident authoring, the app-graph fail-closed gates, the 409 conflict state) is
documented in THIS spec (§5.5/§5.6).

### 5.6 D2 engine-absent surfacing + H1 store authority

**A6 (consumed):** `EngineUnavailable` is surfaced consistently across the MCP +
GUI surfaces.

- **MCP tools:** the document/wiki tool handlers propagate the proxy's typed
  `EngineWireError` (code + §11 httpStatus). A connection-refused →
  `EngineUnavailable` (503, `cause: 'connection-refused'`); a non-`Ready` observed
  state → `EngineUnavailable` (503, `cause: 'not-ready'` / `'unavailable-state'`);
  a malformed wire body → `EngineError` (502). The MCP tool error surfaces the
  typed code + httpStatus (A1 §5.4).
- **GUI document/wiki panes:** when the engine is absent (the bridge call rejects
  with `EngineUnavailable`), the `gnosis-documents`/`gnosis-wikis` panes show the
  **unavailable state** (a provident-authored unavailable indicator), never a
  crash. The panes' handlers catch the bridge rejection and render the unavailable
  state.

**H1 (store authority — GNOSIS-SUPPLANTS-DOCUMENT-STORE, consumed):** the A2
document-CRUD screens ARE the document surface over the engine — **NOT a second
editor, NO sync to the shell's local store**. When the engine is absent, the A2
screens surface `EngineUnavailable` (503) — they do **NOT** fall back to the local
`createJsonRagStore` (that would be a second editor / a sync). The local
`createJsonRagStore` is the **D2 fallback** for the shell's OTHER (non-A2)
document features (cross-link, the local-first store), which continue to work
without the engine (gnosis.md §4.6.2). The A2 screens are the PRIMARY document
surface over the engine; the D2 fallback is a shell-level concern for the OTHER
document features, NOT a second editor for the A2 screens.

**Mock-transport happy-path testing (A6):** the happy path MUST be tested with the
A1 proxy's injectable `fetch` (mock transport) — the TestWriter injects a mock
`fetch` into `createEngineCrudRagStore` (A1 §5.1) so the wiring tests exercise the
real proxy against a deterministic mock transport, NOT a live engine.

**Engine-absent testing (A6):** the engine-absent path is tested via
connection-refused → `EngineUnavailable` — the TestWriter injects a
connection-refused `fetch` (e.g. `throwingFetch('ECONNREFUSED')`, the Unit GN
greens pattern) and asserts the MCP tool throws `EngineUnavailable` (503) and the
GUI panes show the unavailable state.

### 5.7 Property register (PBT)

This is a CODE-BEARING unit, so the register is mandatory. Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §6/FS-n rows. **At most 8 rows.** Each row: id, the invariant it
pins, the generator/strategy that exercises it, and the deterministic pinned seed
+ attempt budget (≤100 attempts/row, ≤400 total, stop-after-5). The register is
genuinely invariant-bearing (the §5.1 tool/method mapping is total/unambiguous/
bijective — the merged `P-IM-1`; the mutating tool schemas reject credential args;
the caller credential threading is deterministic; the `gnosis-edit` group is
default-off; the 409 UX is consistent across MCP + GUI; the idempotency dedup is
deterministic; the `gnosisDocumentsContent` documents-pane render is total +
deadlock-free (H-6 / `HOST-GUI-DOCS-PANE-DEADLOCK`, `P-IM-4`); the D2 engine-absent
surfacing is consistent across MCP + GUI).

| Property-id | Class | Invariant | Strategy-id | Observable-as-property |
|---|---|---|---|---|
| `P-IM-1` | IM | **The §5.1 tool/method mapping is total, unambiguous, and bijective.** (RE-BALANCED at the H-6 re-derivation: the old `P-TP-1` tool→method-bijection invariant is MERGED into this row so a render-property row `P-IM-4` can be added within the 8-row budget.) The 11 document/wiki tool names are pairwise-distinct non-empty `gnosis.document.*`/`gnosis.wiki.*` strings, the tool-name → group mapping is total/unambiguous (the 4 read-only tools resolve to `'gnosis'`; the 7 mutating tools resolve to `'gnosis-edit'`; a `gnosis.*` name NOT in `TOOL_GROUPS` resolves to `null`, fail-closed), AND the tool-name → CRUD-method mapping is a bijection (the 11 names map to the 11 §5.1 CRUD methods, one tool per method, one method per tool). | `strat:crud-tool-mapping-total` | ∀ `name ∈ {gnosis.document.get, gnosis.document.list, gnosis.wiki.get, gnosis.wiki.list}`: `groupForTool(name) === 'gnosis'`; ∀ `name ∈ {gnosis.document.create, gnosis.document.update, gnosis.document.delete, gnosis.document.publish, gnosis.document.unpublish, gnosis.document.archive, gnosis.wiki.create}`: `groupForTool(name) === 'gnosis-edit'`; ∀ generated unknown `gnosis.<other>` name: `groupForTool(name) === null`; the 11 names are pairwise distinct + non-empty; ∀ distinct `(tool_a, method_a), (tool_b, method_b)` in the §5.1 mapping: `tool_a != tool_b`, `method_a != method_b`, the mapping has exactly 11 rows, one per CRUD method. |
| `P-IM-2` | IM | **The 11 document/wiki tool schemas reject credential args.** NONE of the 11 tools' `inputSchema` accepts a credential field — no `token`, no `tls`, no `ca`/`cert`/`key`, no `apiKey` (A7). The `callerId` arg is an identity, NOT a credential. | `strat:crud-no-credential-args` | ∀ `tool ∈ {the 11 document/wiki tools}`: the tool's `inputSchema` has NO key in `{token, tls, ca, cert, key, apiKey}`. |
| `P-IM-3` | IM | **The caller credential threading is deterministic.** For **any** mutating document/wiki tool call with a `callerId` that has edit authority, the handler resolves the credential from the `AuthorityStore` and threads it into the mutating args' `caller` field (the encoded request carries the credential); for a `callerId` with NO edit authority, the mutating call is denied caller-side (no proxy call is issued). | `strat:crud-caller-threaded` | ∀ mutating `(tool, callerId)` with `authorityStore.callerCredential(callerId) != null`: the encoded request's `args.caller == authorityStore.callerCredential(callerId)`; ∀ mutating `(tool, callerId)` with `authorityStore.callerCredential(callerId) == null`: the handler throws `Error('<tool>: caller has no edit authority')` and issues NO proxy call. |
| `P-IM-4` | IM | **The `gnosisDocumentsContent` documents-pane render is total + deadlock-free over its input states.** (NEW at the H-6 re-derivation — the pure render helper IS property-testable, `state → LegacyNodeData`, so it earns a register row.) For ANY generated `state` over the `wikis ∈ {null, empty, populated}` × `documents ∈ {null, empty, populated}` × `document ∈ {null, present}` × `conflict ∈ {null, set}` grid: (a) `state.conflict != null` → the whole-pane conflict state (checked first); (b) `state == null || state.wikis == null` → the whole-pane `unavailable` (engine-absent); (c) otherwise (wikis present, documents null/empty/populated) the render ALWAYS emits the wiki selector `<li>` items (one per wiki, `data-wiki-id` + the `gnosis-documents-select-wiki` click handler, INDEPENDENT of `documents`) and renders the documents section as the EMPTY document-list state (`data-gnosis-docstate='empty'`) when `documents` is null or empty — NEVER the whole-pane `unavailable` while the wiki selector is available and NEVER a TypeError. | `strat:documents-pane-render-total` | ∀ generated `state` per the grid: `gnosisDocumentsContent(ctx, state)` returns a `LegacyNodeData` that satisfies (a)/(b)/(c); in case (c) with `documents == null` or `documents.items == []`, the returned subtree contains the `gnosis-documents-select-wiki` handler + the empty-state `data-gnosis-docstate='empty'`, and NEVER the `data-gnosis-state='unavailable'` on the pane root NOR a thrown TypeError (case (c) `documents == null` does NOT dereference `.items`/`.map`). |
| `P-SM-1` | SM | **The `gnosis-edit` group is default-off + `VALID_GROUPS` membership.** The default security config does NOT enable `gnosis-edit`; `VALID_GROUPS` includes `'gnosis-edit'`. (The tool-name → group mapping totality is P-IM-1's invariant, NOT this row's.) | `strat:crud-group-default-off` | `defaultSecurityConfig().enabled` does NOT include `'gnosis-edit'`; `VALID_GROUPS` includes `'gnosis-edit'`. |
| `P-SM-2` | SM | **The optimistic-concurrency 409 UX is consistent across MCP + GUI.** A `ConflictError` (409) surfaces as the typed error on the MCP `gnosis.document.update` tool AND as the conflict state on the GUI `gnosis-documents` pane. | `strat:crud-409-ux` | ∀ generated `ConflictError` (409) from the A1 proxy: the MCP tool throws `ConflictError` (409); the GUI pane renders the conflict state (never a crash). |
| `P-SM-3` | SM | **The idempotency dedup is deterministic + caller-scoped.** A duplicate `(callerId, requestId)` returns the first result WITHOUT issuing a new create; a new `(callerId, requestId)` issues a fresh create and caches the result; a caller can NEVER receive another caller's cached result. | `strat:crud-idempotency-dedup` | ∀ generated `(callerId, requestId)` + create result: `idempotency.get(callerId, requestId)` after a first create returns the cached result; a second create with the SAME `(callerId, requestId)` returns the cached result and issues NO new proxy call; a NEW `(callerId, requestId)` issues a fresh create; `idempotency.get(otherCaller, requestId)` is `undefined` (never another caller's result). |
| `P-TP-2` | TP | **The D2 engine-absent surfacing is consistent across MCP + GUI for the CRUD tools.** A connection-refused engine surfaces as `EngineUnavailable` (503) on the MCP document/wiki tools AND as the unavailable state on the GUI panes. | `strat:crud-engine-absent` | ∀ generated connection-refused transport: the MCP document/wiki tool throws `EngineUnavailable` (503, `cause: 'connection-refused'`); the GUI panes render the unavailable state. |

**Class tally:** IM ×4 (P-IM-1 the merged §5.1-mapping family, P-IM-2, P-IM-3, P-IM-4 the documents-pane render row), SM ×3, TP ×1 (P-TP-2) = **8 rows ≤ 8** ✔.

**Register re-balance decision (H-6, recorded):** the pure render helper
`gnosisDocumentsContent` is CODE-BEARING and property-testable (`state →
LegacyNodeData`), so it earns a register row per the house rule (a zero-row
exemption is NOT taken — the helper IS an executable `state → LegacyNodeData`
surface). To stay within the **at-most-8** budget, the old `P-TP-1` (tool →
CRUD-method bijection) invariant was **merged into `P-IM-1`** (both characterize the
§5.1 tool/method mapping family — totality/unambiguous-ness + bijection), freeing a
slot for the new **`P-IM-4`** documents-pane-render row. The executed property layer
must therefore assert the merged `P-IM-1` observable (which now includes the
method-bijection conjunct) in place of the retired `P-TP-1`, and the new `P-IM-4`
grid. All 8 rows stay within the ≤100 attempts/row / ≤400 total / stop-after-5
budget under the pinned seed `0xA2A2A2A2`.

**PBT-gate note (determinism/seeding):** the TestWriter's executed property layer
runs under the test runner with a **deterministic pinned seed** (`0xA2A2A2A2` —
the unit's mnemonic "A2"), **≤100 generated cases per register row**, **≤400
total cases** across the unit's whole property layer, **stop-after-5** (report ≤5
distinct held/broken counterexamples per row), and records each row as **held** or
**broken** together with its `Strategy-id`. The adversarial reviewer then reads
this register with the executed artifacts and performs a read-only PBT audit
(per-row over-strength reasoning, generator-coverage check, prose
counterexamples, negative-generator requests); reviewers never run generators.
**Post-green result:** the executed property layer (the props test file) ran under
the pinned seed and the adversarial PBT audit returned **all 8 rows HELD** (§3a).

**Reserved-variant discipline applied.** The tool set (11 document/wiki names) and
the method set (11 CRUD methods) are **closed** — there are no reserved
tools/methods. The generator restriction is **well-formedness on the wiring side**:
never generate a credential arg for a document/wiki tool (that is the P-IM-2
invariant, not a fail-state), never generate a `gnosis.*` name outside the 11
pinned names (that is the P-IM-1 fail-closed case), never generate a `ConflictError`
that is not a real 409 (that is the proxy's own fail-state, A1 §5.9 — NOT an
invariant row here), and never generate a non-`EngineUnavailable` transport error
(that is the proxy's own fail-state, A1 §5.9 — NOT an invariant row here). The unit
has **no** reserved fail-variant rows (no `FS-*` rows) by the invariant-only rule.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`gnosis.document.get` happy:** a `gnosis.document.get` call with a well-formed
   `documentId` → the handler calls `engineCrud.getDocument` and returns the typed
   `Document`.
2. **`gnosis.document.list` happy:** a `gnosis.document.list` call with a
   well-formed `wikiId` + optional filters → the handler calls
   `engineCrud.listDocuments` and returns the typed `DocumentList` whose `items`
   are `DocumentSummary[]` (the re-derived A1 §5.1 summary — six fields).
3. **`gnosis.wiki.get` happy:** a `gnosis.wiki.get` call with a well-formed
   `wikiId` → the handler calls `engineCrud.getWiki` and returns the typed `Wiki`.
4. **`gnosis.wiki.list` happy:** a `gnosis.wiki.list` call → the handler calls
   `engineCrud.listWikis` and returns the typed `Wiki[]`.
5. **`gnosis.document.create` happy:** a `gnosis.document.create` call with a
   `callerId` that has edit authority + a well-formed `wikiId`/`title` → the
   handler resolves the caller credential, calls `engineCrud.createDocument`, and
   returns the typed `Document` (`revision:0`, `state:'Draft'`).
6. **`gnosis.document.update` happy:** a `gnosis.document.update` call with a
   `callerId` that has edit authority + a well-formed `documentId`/`baseRevision`/
   `graph` → the handler resolves the caller credential, calls
   `engineCrud.updateDocument`, and returns the typed `Document`.
7. **`gnosis.document.delete` happy:** a `gnosis.document.delete` call with a
   `callerId` that has edit authority + a well-formed `documentId` → the handler
   resolves the caller credential, calls `engineCrud.deleteDocument`, and returns
   `void`.
8. **`gnosis.document.publish` happy:** a `gnosis.document.publish` call with a
   `callerId` that has edit authority + a well-formed `documentId` → the handler
   resolves the caller credential, calls `engineCrud.publishDocument`, and returns
   the typed `Document` (`state:'Published'`).
9. **`gnosis.document.unpublish` happy:** a `gnosis.document.unpublish` call with a
   `callerId` that has edit authority + a well-formed `documentId` → the handler
   resolves the caller credential, calls `engineCrud.unpublishDocument`, and
   returns the typed `Document` (`state:'Draft'`).
10. **`gnosis.document.archive` happy:** a `gnosis.document.archive` call with a
    `callerId` that has edit authority + a well-formed `documentId` → the handler
    resolves the caller credential, calls `engineCrud.archiveDocument`, and
    returns the typed `Document` (`state:'Archived'`).
11. **`gnosis.wiki.create` happy:** a `gnosis.wiki.create` call with a `callerId`
    that has edit authority + a well-formed `name` → the handler resolves the
    caller credential, calls `engineCrud.createWiki`, and returns the typed `Wiki`.
12. **Group registration happy:** the 4 read-only document/wiki tools register ONLY
    when the `gnosis` group is enabled; the 7 mutating document/wiki tools register
    ONLY when the `gnosis-edit` group is enabled; `groupForTool` returns `'gnosis'`
    for the read-only tools and `'gnosis-edit'` for the mutating tools;
    `defaultSecurityConfig().enabled` does NOT include `'gnosis-edit'`.
13. **Boot construction happy:** `createEngineCrudRagStore({ baseUrl })` at boot →
    constructs without network I/O; the proxy is injected into `McpServerOptions`
    as `engineCrudRagStore`; the `AuthorityStore` + the `IdempotencyRegistry` are
    injected alongside. `waitForReady` is NOT awaited at boot.
14. **Caller-credential threading happy:** a mutating document/wiki tool call with
    a `callerId` that has edit authority → the encoded request's `args.caller`
    equals the resolved credential from the `AuthorityStore`.
15. **Idempotency dedup happy:** a `gnosis.document.create`/`gnosis.wiki.create`
    call with a `requestId` that already has a cached result → the handler returns
    the cached result WITHOUT issuing a new proxy call.
16. **GUI document pane happy:** the `gnosis-documents` app-graph pane renders the
    document surface (wiki selector + document list + document editor) as
    provident-authored data, gated fail-closed on the `gnosis`/`gnosis-edit`
    groups.
17. **GUI wiki pane happy:** the `gnosis-wikis` app-graph pane renders the wiki
    surface (wiki list + wiki view + wiki create) as provident-authored data, gated
    fail-closed on the `gnosis`/`gnosis-edit` groups.
18. **GUI 409 conflict state happy:** an `updateDocument` action on the
    `gnosis-documents` pane that surfaces a `ConflictError` (409) → the pane
    renders the conflict state (the conflict message + the current revision),
    never a crash.
19. **Mock-transport happy:** the wiring tests inject a mock `fetch` into
    `createEngineCrudRagStore` and exercise the real proxy against the
    deterministic mock transport (no live engine).
20. **GUI document pane wiki-selector-ALWAYS (the docs-pane deadlock fix, H-6 /
    `HOST-GUI-DOCS-PANE-DEADLOCK`):** `gnosisDocumentsContent(ctx, { wikis:[<Wiki>],
    documents:null, document:null, conflict:null })` → renders a subtree that
    includes the wiki selector `<li>` items (each carrying `data-wiki-id` + the
    `gnosis-documents-select-wiki` click handler → `gnosis.document.list`) AND the
    empty document-list state (`data-gnosis-docstate='empty'`) — a null `documents`
    with a non-null `wikis` shows the wiki selector + the empty doc-list, NEVER the
    whole-pane `unavailable` and NEVER a TypeError. The `<li>` items are the ONLY
    path that triggers `gnosis.document.list` (populating `documents`), so this
    breaks the deadlock.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`gnosis.document.get` with a null CRUD engine** → throws
   `Error('gnosis.document.get: no engine crud rag store configured')`.
2. **`gnosis.document.list` with a null CRUD engine** → throws
   `Error('gnosis.document.list: no engine crud rag store configured')`.
3. **`gnosis.wiki.get` with a null CRUD engine** → throws
   `Error('gnosis.wiki.get: no engine crud rag store configured')`.
4. **`gnosis.wiki.list` with a null CRUD engine** → throws
   `Error('gnosis.wiki.list: no engine crud rag store configured')`.
5. **`gnosis.document.create` with a null CRUD engine** → throws
   `Error('gnosis.document.create: no engine crud rag store configured')`.
6. **`gnosis.document.update` with a null CRUD engine** → throws
   `Error('gnosis.document.update: no engine crud rag store configured')`.
7. **`gnosis.document.delete` with a null CRUD engine** → throws
   `Error('gnosis.document.delete: no engine crud rag store configured')`.
8. **`gnosis.document.publish` with a null CRUD engine** → throws
   `Error('gnosis.document.publish: no engine crud rag store configured')`.
9. **`gnosis.document.unpublish` with a null CRUD engine** → throws
   `Error('gnosis.document.unpublish: no engine crud rag store configured')`.
10. **`gnosis.document.archive` with a null CRUD engine** → throws
    `Error('gnosis.document.archive: no engine crud rag store configured')`.
11. **`gnosis.wiki.create` with a null CRUD engine** → throws
    `Error('gnosis.wiki.create: no engine crud rag store configured')`.
12. **A mutating document/wiki tool with a `callerId` that has NO edit authority**
    → throws `Error('<tool>: caller has no edit authority')` (a caller-side deny;
    NO proxy call is issued). This applies to all 7 mutating tools.
13. **A mutating document/wiki tool with a null/absent `authorityStore`** → throws
    `Error('<tool>: caller has no edit authority')` (fail-closed: no caller has
    edit authority when the store is absent).
14. **`gnosis.document.get` with a `DocumentNotFound`** → the MCP tool throws
    `EngineWireError` (404).
15. **`gnosis.document.list` with a `WikiNotFound`** → the MCP tool throws
    `EngineWireError` (404).
16. **`gnosis.document.list` with a `ValidationError`** (a `page < 1` or
    `pageSize < 1` or `pageSize > 100` filter) → the MCP tool throws
    `EngineWireError` (400).
17. **`gnosis.wiki.get` with a `WikiNotFound`** → the MCP tool throws
    `EngineWireError` (404).
18. **`gnosis.document.create` with a `WikiNotFound`** → the MCP tool throws
    `EngineWireError` (404).
19. **`gnosis.document.create` with a `ValidationError`** (empty/overlong `title`)
    → the MCP tool throws `EngineWireError` (400).
20. **`gnosis.document.update` with a `DocumentNotFound`** → the MCP tool throws
    `EngineWireError` (404).
21. **`gnosis.document.update` with a `ValidationError`** (invalid `graph`) → the
    MCP tool throws `EngineWireError` (400).
22. **`gnosis.document.update` with a `ConflictError`** (a stale `baseRevision`) →
    the MCP tool throws `ConflictError` (409) — the optimistic-concurrency 409 UX
    (H2).
23. **`gnosis.document.delete` with a `DocumentNotFound`** → the MCP tool throws
    `EngineWireError` (404).
24. **`gnosis.document.delete` with a `DocumentInUse`** → the MCP tool throws
    `EngineWireError` (409) (delete integrity, gnosis.md §4.4.5).
25. **`gnosis.document.publish` with a `DocumentNotFound`** → the MCP tool throws
    `EngineWireError` (404).
26. **`gnosis.document.publish` with an `UnresolvedReference`** → the MCP tool
    throws `EngineWireError` (422) (the publish gate, gnosis.md §4.4.3).
27. **`gnosis.document.unpublish` with a `DocumentNotFound`** → the MCP tool throws
    `EngineWireError` (404).
28. **`gnosis.document.unpublish` with an `InvalidState`** → the MCP tool throws
    `EngineWireError` (409).
29. **`gnosis.document.archive` with a `DocumentNotFound`** → the MCP tool throws
    `EngineWireError` (404).
30. **`gnosis.document.archive` with an `InvalidState`** → the MCP tool throws
    `EngineWireError` (409).
31. **`gnosis.wiki.create` with a `ValidationError`** (empty/overlong `name`) → the
    MCP tool throws `EngineWireError` (400).
32. **A document/wiki tool connection-refused** → the MCP tool throws
    `EngineUnavailable` (503, `cause: 'connection-refused'`).
33. **A document/wiki tool when the observed state is not `Ready`** → the MCP tool
    throws `EngineUnavailable` (503, `cause: 'not-ready'` for `'Starting'`/
    `'Degraded'`, `cause: 'unavailable-state'` for `'Unavailable'`).
34. **A document/wiki tool with a malformed wire body** → the MCP tool throws
    `EngineError` (502) (the A1 proxy's decode-then-validate outcomes).
35. **A document/wiki tool with a well-formed body failing a CRUD-specific
    invariant** → the MCP tool throws `EngineError` (502) naming the
    `CrudValidationFailure` variant (the A1 proxy's validation outcomes — e.g. a
    `createDocument` result with `revision != 0` → `UnexpectedRevision`).
36. **Unknown `gnosis.*` name** → the handler throws
    `Error('unknown gnosis tool: <name>')`.
37. **A `gnosis.*` name NOT in `TOOL_GROUPS`** → `groupForTool` returns `null`
    (fail-closed — never resolves to a group).
38. **GUI document/wiki pane engine-absent** — the NO-WIKIS case
    (`state == null || state.wikis == null`) → the `gnosis-documents`/`gnosis-wikis`
    panes show the whole-pane unavailable state (the bridge rejection is caught,
    never a crash). DISTINCT from §5.8-20/§5.9-41: a non-null `wikis` with a null
    `documents` is NOT the engine-absent case and does NOT show the whole-pane
    unavailable.
39. **GUI document/wiki pane group-off** → the panes fail closed (the
    `gnosis`/`gnosis-edit` group gates) and/or surface the `EngineUnavailable` as
    an empty/error state — never a crash.
40. **GUI document pane no-edit-authority** → a mutating action on the
    `gnosis-documents` pane with a caller that has no edit authority → the pane
    shows the no-edit-access state (the caller-side deny is surfaced, never a
    crash).
41. **GUI document pane with a null `documents` but a non-null `wikis` (the
    `HOST-GUI-DOCS-PANE-DEADLOCK` regression, H-6):**
    `gnosisDocumentsContent(ctx, { wikis:[<Wiki>], documents:null, document:null,
    conflict:null })` → renders the wiki selector `<li>` items + the empty
    document-list state (`data-gnosis-docstate='empty'`), NEVER a TypeError (a null
    `documents` MUST NOT be dereferenced via `.map`) and NEVER the whole-pane
    `unavailable` while the wiki selector is available.

**Pinned non-throws / type-level guarantees:**

- A mutating document/wiki tool always threads the caller's credential (the
  `AuthorityStore` resolves it; the A1 proxy's typed args require `caller` on the
  7 mutating methods). The client never emits a mutating request without `caller`.
- A read-only document/wiki tool never carries `caller` (the read-only args have
  no `caller` field).
- The CRUD tools do NOT record to the `QueryAuditLog` (it is query-specific; the
  CRUD security surface is the group gate + the RBAC caller check).
- The A2 screens do NOT fall back to the local `createJsonRagStore` (H1 — no
  second editor, no sync); they surface `EngineUnavailable` when the engine is
  absent.
- The idempotency dedup is caller-side ONLY (the wire carries no idempotency-key
  field); a `requestId` that is absent → a fresh create each time.

### 5.10 Census / numeric claims

- **New MCP tools:** **11** (`gnosis.document.get`, `gnosis.document.list`,
  `gnosis.wiki.get`, `gnosis.wiki.list`, `gnosis.document.create`,
  `gnosis.document.update`, `gnosis.document.delete`, `gnosis.document.publish`,
  `gnosis.document.unpublish`, `gnosis.document.archive`, `gnosis.wiki.create`).
- **New `ToolGroup` union member:** **1** (`'gnosis-edit'`).
- **New `TOOL_GROUPS` rows:** **11** (one per document/wiki tool).
- **New `VALID_GROUPS` members:** **1** (`'gnosis-edit'`).
- **New `ALL_TOOLS` rows:** **11** (the 11 document/wiki names). **The `ALL_TOOLS`
  census is now 55 (44 pre-A2 + 11 A2)** — verified against
  `ProvidentMcpServer.ALL_TOOLS` (`src/main/mcp-server.ts`).
- **New `McpServerOptions` fields:** **3** (`engineCrudRagStore?: EngineCrudRagStore`,
  `authorityStore?: AuthorityStore`, `idempotency?: IdempotencyRegistry`).
- **Extended main-process handler:** **1** (`handleGnosisTool` gains the CRUD
  proxy + the authority store + the idempotency registry params + the 11
  document/wiki cases).
- **New main-handled routing branch:** **0** (the existing
  `name.startsWith('gnosis.')` branch is EXTENDED, not duplicated).
- **New GUI panes:** **2** (`gnosis-documents`, `gnosis-wikis`, both app-graph).
- **New render helpers:** **2** (`gnosisDocumentsContent`, `gnosisWikisContent`).
- **New bridge methods:** **2** (`gnosis.documents`, `gnosis.wikis`).
- **New IPC channels:** **2** (`IPC_GNOSIS_DOCUMENTS`, `IPC_GNOSIS_WIKIS`).
- **New authority store:** **1** (`AuthorityStore` + `createAuthorityStore`, module
  `src/main/authority-store.ts`).
- **New idempotency registry:** **1** (`IdempotencyRegistry` +
  `createIdempotencyRegistry`, `maxEntries` default 100, LRU, module
  `src/main/idempotency-registry.ts`).
- **Mutating tools (require the caller credential):** **7** (`gnosis.document.create`,
  `gnosis.document.update`, `gnosis.document.delete`, `gnosis.document.publish`,
  `gnosis.document.unpublish`, `gnosis.document.archive`, `gnosis.wiki.create`).
- **Read-only tools (no caller):** **4** (`gnosis.document.get`,
  `gnosis.document.list`, `gnosis.wiki.get`, `gnosis.wiki.list`).
- **CRUD-reachable `StoreError` variants surfaced:** **7** (`DocumentNotFound`,
  `WikiNotFound`, `ValidationError`, `ConflictError`, `DocumentInUse`,
  `InvalidState`, `UnresolvedReference`) — the A1 proxy's reachable set (A1 §5.4).
- **`ConflictError` = 409 (mandated, H2):** the optimistic-concurrency 409 UX
  surfaces `ConflictError` (409) on BOTH the MCP `gnosis.document.update` tool AND
  the GUI `gnosis-documents` pane.
- **PBT register:** **8 rows** (IM ×4, SM ×3, TP ×1 — the §5.1 mapping-family
  `P-IM-1` merged from the retired `P-TP-1`, the documents-pane render `P-IM-4`
  added at the H-6 re-derivation), ≤100 attempts/row, ≤400
  total, stop-after-5, deterministic pinned seed `0xA2A2A2A2`. **Post-green: all
  8 rows HELD** (the adversarial PBT audit, §3a).
- **Test counts (LANDED + re-derived):** the unit's red set covered §5.8 (**19
  happy states; now 20 with §5.8-20 the wiki-selector-ALWAYS row**) +
  §5.9 (**40 fail-states + the pinned non-throws; now 41 with §5.9-41 the
  `HOST-GUI-DOCS-PANE-DEADLOCK` regression**) + the PBT register (§5.7; now IM ×4
  with the `P-IM-4` documents-pane render row). The
  LANDED test files: **91 unit tests** (`tests/unit-a2-document-crud-wiring.test.ts`),
  **8 props tests** (`tests/props-a2-document-crud-wiring.test.ts`), and **49
  blind-greens tests** (`tests/blind-unit-a2-document-crud-wiring-greens.test.ts`,
  covering the 81 greens scenarios — 33 G + 40 F + 8 P). All green.

### 5.11 Cross-references

- **The roadmap (the A2 scope + binding decisions):**
  `docs/specs/unblock-gnosis-remaining-endpoints.md` — §6.2 (A2), §6.1 (A1), §7
  (auth/TLS + RBAC handoff), §8 (the execution order), §11 (cross-refs).
- **The A1 proxy surface (the client A2 consumes):**
  `docs/specs/unit-a1-crud-routing-proxy.md` — §5.1 (the factory + the 11-method
  proxy surface + the exact method signatures/args/result types), §5.2 (golden
  vectors V-10..V-12), §5.3 (decode-then-validate), §5.4 (RBAC caller threading),
  §5.6 (READY observation + D2 engine-absent), §5.7 (the PBT register format),
  §5.8/§5.9 (happy/fail states), §5.10 (census), §5.11 (cross-refs). The
  implementation is `src/main/engine-crud-rag-store.ts`.
- **The wiring pattern A2 reuses (the retrieval-trio wiring unit, LANDED):**
  `docs/specs/unit-gn-mcp-ui-wiring.md` — §5.1 (the `gnosis.*` tools + the `gnosis`
  group), §5.2 (tool naming + group), §5.3 (`handleGnosisTool` main routing +
  audit), §5.4 (boot injection + `resolveEngineBaseUrl`), §5.5 (the D4 GUI panes +
  `GnosisPanes` + the provident-authoring convention), §5.6 (D2 engine-absent
  surfacing), §5.7 (PBT register), §5.8/§5.9 (happy/fail states), §5.11
  (cross-refs). The implementation: `src/main/mcp-server.ts`, `src/main/security.ts`,
  `src/main/engine-config.ts`, `src/renderer/gnosis-panes.ts`, `src/shared/types.ts`.
- **The frozen wire contract (the shapes A2's tools pass through):**
  `../Gnosis/docs/specs/p1a-document-crud-wire.md` — §4 (the request/response
  envelopes + per-method args/result shapes), §6.1 (the CRUD-reachable `StoreError`
  set), §6.2 (NEW-2 request-decode outcome), §7 (endpoint paths), §8 (the RBAC
  `caller` shape), §9 (golden vectors V-10..V-12), §10 (valid/happy + fail states
  per function + the CRUD-specific validation invariants).
- **The server spec (the endpoints A2's tools reach):**
  `../Gnosis/docs/specs/p2-gnosis-server.md` — §5.2 (the 11 CRUD endpoints), §7
  (status rendering + NEW-2), §8 (RBAC `caller` threading), §10 (valid/fail states
  per endpoint).
- **The behavior contract:** `../Gnosis/docs/specs/gnosis.md` — §4.1 (the document
  store), §4.1.1 (the DRAFT→PUBLISHED→ARCHIVED state machine), §4.1.4 (optimistic
  concurrency, `ConflictError` = 409), §4.4.3 (the publish gate,
  `UnresolvedReference`), §4.4.5 (delete integrity, `DocumentInUse`), §6
  (FS-1..FS-26), §4.6.2 (no engine MCP/GUI; the "engine is optional" framing).
- **The MCP endpoint spec (the contract to update):**
  `docs/specs/mcp-endpoint.md` — **§6.2** (the group table — the `gnosis-edit`
  group is added, default-off). **NOTE (the A9 convention, consumed):** the 11
  document/wiki tools are **NOT** appended to `mcp-endpoint.md` §3 (the base
  `provident.*` tool table) — per the LANDED `GNOSIS-CONTRACT-SPEC-UPDATE` (A9)
  decision, the app-specific tools (`rag.*`/`edit.*`/`module.*`/`gnosis.*`) are
  recorded in their unit spec + `docs/decisions.md`, NOT in the §3 `provident.*`
  table (doing so would be structurally inconsistent). The `gnosis-edit` group IS
  added to §6.2 (default-off), and the 11 tools are recorded in THIS spec + the new
  decision rows.
- **The security tool groups:** `src/main/security.ts` — `TOOL_GROUPS`/
  `VALID_GROUPS`/`defaultSecurityConfig`/`groupForTool` (the `'gnosis-edit'` group
  is added).
- **The MCP server:** `src/main/mcp-server.ts` — `McpServerOptions` (the
  `engineCrudRagStore`/`authorityStore`/`idempotency` fields), `ALL_TOOLS` (the 11
  names), `registerTools` (the extended `gnosis.` branch + the threaded CRUD
  proxy), the ~line 2229 main-handled branch.
- **The renderer pane pattern:** `src/renderer/pane-registry.ts` (the
  `PaneScope`/`PaneDefinition`/`PaneRegistry`), `src/renderer/sidebar-panes.ts`
  (the host's `registerPanes`/`bindHandlers`/`mountOperator`), `src/renderer/
  pane-graph.ts` (the `gnosisStatusContent`/`gnosisQueryContent` patterns + the
  new `gnosisDocumentsContent`/`gnosisWikisContent`).
- **The Astrographer conventions:** `docs/specs/unit-h-sidebar-panes.md` §5.4 (the
  operator isolated-scope pattern), `docs/specs/unit-k-sidebar-panes-host.md`
  §5.3/§5.4 (the pane registration + operator mount), `docs/specs/unit-j-mcp-security-hardening.md`
  §5.2 (the five-seam gate invariants — the `gnosis-edit` group follows the same
  pattern).
- **Decision rows to add when the unit lands:** `docs/decisions.md` —
  **GNOSIS-CRUD-EDIT-GROUP**, **GNOSIS-DOCUMENT-TOOLS**, **GNOSIS-RBAC-CALLER-STORE**,
  **GNOSIS-409-UX**, **GNOSIS-IDEMPOTENCY-DEDUP**; consumed **GNOSIS-SUPPLANTS-DOCUMENT-STORE**
  (H1), **GNOSIS-RBAC-EDIT-ENFORCEMENT** (H3), **RAG-EDIT-MCP-GROUPS**,
  **GNOSIS-TOOL-NAMING-GROUP**, **GNOSIS-MAIN-ROUTING-AUDIT**, **GNOSIS-D4-PARITY-SCOPE**,
  **GNOSIS-D2-ENGINE-ABSENT**, **GNOSIS-SECURITY-CARVE-OUT**, **GNOSIS-GUI-BRIDGE-IPC**,
  **ENGINE-CRUD-WIRE-CLIENT**, **ENCODE+DECODE**, **P4-IDEMPOTENCY-RETRY**.
  **D4-MCP-GUI-PARITY is a guide §9 concept, NOT a `docs/decisions.md` row** — it
  does not exist in `docs/decisions.md` (verified: no `D4-MCP-GUI-PARITY` row
  there). The contract-spec update must NOT chase a phantom `D4-MCP-GUI-PARITY`
  decision row; the guide §9 parity concept is referenced only as a guide
  cross-reference, never as a decisions.md row to add or consume.

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for the wiring from §5.8/§5.9, and asserts the
PBT register (§5.7) holds. The red set (recorded in the next-steps DONE row for
this unit):

- **The 11 `gnosis.document.*`/`gnosis.wiki.*` MCP tools:** the happy states 1–11
  + the fail-states 1–35 (null CRUD engine 1–11, no-edit-authority 12–13, the
  per-method `StoreError` fail-states 14–31, connection-refused 32, not-ready gate
  33, malformed wire body 34, CRUD validation failure 35).
- **The `gnosis-edit` group + `security.ts`:** the happy state 12 + the fail-state
  37 (the group is default-off; the tool-name → group mapping is total/
  unambiguous; a `gnosis.*` name NOT in `TOOL_GROUPS` → `null`).
- **The main-process routing + the extended `handleGnosisTool`:** the happy states
  1–11 + the fail-states 1–11, 36 (the document/wiki tools route in MAIN against
  the A1 proxy; the retrieval trio cases are unchanged; an unknown `gnosis.*` name
  → `Error('unknown gnosis tool: <name>')`).
- **The `McpServerOptions.engineCrudRagStore` injection + boot construction + the
  `AuthorityStore` + the `IdempotencyRegistry`:** the happy states 13, 14, 15
  (construction does no I/O; the caller-credential threading; the idempotency
  dedup) + the fail-states 12, 13 (no-edit-authority; null/absent authority store).
- **The D4 parity scope (the GUI document-editor/wiki screens + the render paths):**
  the happy states 16, 17, 18, **20** + the fail-states 38, 39, 40, **41** (the
  panes' unavailable state — now the no-wikis/engine-absent case only; the
  fail-closed gates; the 409 conflict state; the no-edit-access state; the
  `HOST-GUI-DOCS-PANE-DEADLOCK` regression — a null `documents` with a non-null
  `wikis` renders the wiki selector + the empty doc-list, never a TypeError) +
  the PBT register P-IM-4 (the total/deadlock-free documents-pane render).
- **The optimistic-concurrency 409 UX (H2):** the happy state 18 + the fail-state
  22 (a `ConflictError` (409) surfaces on the MCP `gnosis.document.update` tool
  AND as the conflict state on the GUI `gnosis-documents` pane) + the PBT register
  P-SM-2.
- **The caller-side idempotency dedup (P4):** the happy state 15 + the PBT register
  P-SM-3 (a duplicate `requestId` returns the first result; a new `requestId`
  issues a fresh create).
- **The D2 engine-absent surfacing + the H1 store authority:** the fail-states
  32, 33, 38, 39 (connection-refused → `EngineUnavailable` on the MCP tool + the
  GUI panes' unavailable state; the A2 screens do NOT fall back to the local
  `createJsonRagStore`) + the PBT register P-TP-2.
- **The security carve-out + the no-credential-arg test:** the PBT register P-IM-2
  (no document/wiki tool's `inputSchema` accepts a credential arg).
- **The PBT register (§5.7):** the 8 invariant rows (deterministic pinned seed
  `0xA2A2A2A2`, ≤100 attempts/row, ≤400 total, stop-after-5).
- **The mock-transport happy path:** the happy state 19 (the wiring tests inject a
  mock `fetch` into `createEngineCrudRagStore` and exercise the real proxy
  against the deterministic mock transport).

## 7. What the spec does NOT do (constraints honored)

- This is a **TDD unit spec** — it includes the §5.x Property register (PBT gate)
  but does **NOT** author the property tests (the TestWriter does) and does
  **NOT** author implementation.
- It does **NOT** touch `src/` or `tests/` — it writes **only** the spec file.
- It does **NOT** change the A1 proxy (`src/main/engine-crud-rag-store.ts` — Unit
  A1 owns it) or the retrieval-trio proxy (`src/main/engine-rag-store.ts` — Unit
  GN owns it). It consumes their surfaces.
- It does **NOT** change the frozen document-CRUD wire shapes (P1a) — the tools
  pass through the A1 proxy's encode+decode surface; the wire carries NO
  idempotency-key field (the dedup is caller-side).
- It does **NOT** re-implement the RBAC **enforcement** semantics (the engine is
  the enforcer); A2 wires the shell's `AuthorityStore` to the engine's RBAC check.
- It does **NOT** add an SSE surface for CRUD (CRUD is request/response; the SSE
  event schema stays retrieval-only).
- It does **NOT** author the graph/fact/consistency/RAG-companion surfaces (A3–A5,
  P1b–P1e — deferred follow-ons) or the live-scenario battery (a separate artifact,
  gated on P2).
- It does **NOT** update `docs/skills/designing-pages.md` (the file does not exist
  in this repo — the `docs/skills/` directory is EMPTY) and does **NOT** touch a
  test-use-case coverage matrix / demo-page index (the sibling convention).

---
