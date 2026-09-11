# Unit A2 — Document-CRUD D4 Wiring (`gnosis.document.*` / `gnosis.wiki.*` MCP tools + the `gnosis-edit` group + the extended `handleGnosisTool` + the `AuthorityStore` + the `IdempotencyRegistry` + the GUI document-editor/wiki screens): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-10.**
- **Source contract:** `docs/specs/unit-a2-document-crud-wiring.md` — §5.1 (the 11
  `gnosis.document.*`/`gnosis.wiki.*` MCP tools + the body-construction rule),
  §5.2 (the `gnosis-edit` mutating default-off group + `security.ts`), §5.3 (the
  extended main-process `handleGnosisTool` + routing + audit + caller threading),
  §5.4 (`McpServerOptions.engineCrudRagStore` injection + boot construction + the
  `AuthorityStore` + the `IdempotencyRegistry`), §5.5 (the GUI document-editor/wiki
  screens + the `gnosisDocumentsContent`/`gnosisWikisContent` render paths), §5.6
  (D2 engine-absent surfacing), §5.7 (PBT register), §5.8/§5.9 (happy/fail states),
  §5.10 (census), §5.11 (cross-references). Consumes the LANDED A1 proxy surface
  pinned in `docs/specs/unit-a1-crud-routing-proxy.md` §5.1/§5.4/§5.6/§5.7/§5.8/§5.9
  (Unit A1 owns `src/main/engine-crud-rag-store.ts`); the P1a wire shapes + golden
  vectors are pinned in `../Gnosis/docs/specs/p1a-document-crud-wire.md` §4/§9
  (V-10..V-12); the server the client talks to is pinned in
  `../Gnosis/docs/specs/p2-gnosis-server.md` §5.2 (the 11 CRUD endpoints) / §7
  (status rendering + NEW-2) / §8 (RBAC `caller` threading).
- **Greens battery (blind-test, docs-only, already run against the LIVE MODULE):**
  `docs/specs/unit-a2-document-crud-wiring-greens.md` — **81 / 81 PASS, 0 FAIL**
  (33 G + 40 F + 8 P; the recorded run file
  `tests/blind-unit-a2-document-crud-wiring-greens.test.ts`, vitest). The greens
  exercise the wiring through the **real `createEngineCrudRagStore` proxy on a
  deterministic mock transport** (A6, §5.6) — NOT a live engine. Source under test:
  `src/main/mcp-server.js` (`handleGnosisTool`, `ProvidentMcpServer.ALL_TOOLS`,
  `registeredToolNames`), `src/main/security.js` (`groupForTool`,
  `defaultSecurityConfig`, `SecurityGate`), `src/main/engine-crud-rag-store.js`
  (`createEngineCrudRagStore`), `src/main/engine-rag-store.js` (the typed error
  model `EngineWireError`/`EngineUnavailable`/`EngineError`/`ConflictError`),
  `src/main/authority-store.js` (`createAuthorityStore`),
  `src/main/idempotency-registry.js` (`createIdempotencyRegistry`),
  `src/renderer/pane-graph.js` (`gnosisDocumentsContent`, `gnosisWikisContent`).
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-a1-crud-routing-proxy-live-pending-battery.md` and
  `docs/specs/unit-gn-mcp-ui-wiring-live-pending-battery.md` (the same
  surface-absence park shape). This battery is the handoff for a LATER iteration
  of the live-scenario runner, to be executed once the **Gnosis engine (the P2
  `gnosis-server` binary) is running on loopback** serving the 11 document-CRUD
  endpoints + `GET /engine/status`, the **Astrographer app runs with the A2 CRUD
  routing wired in**, and the **`gnosis`/`gnosis-edit` groups are enabled** in the
  shell's security settings.

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-10)

The A2 unit's live scenarios require the **Gnosis engine (the P2 server)** to be
running so the `gnosis.document.*`/`gnosis.wiki.*` MCP tools + the GUI
document-editor/wiki panes can be exercised against a **real engine**. The A2
spec §-header pins: "**P2 is required only for the live-scenario battery** — so
A2 is parallelizable with the live battery." The park is a **surface-absence
park**, verified live:

### 1.1 The A2 wiring IS landed (the module surface exists) — but nothing drives it live

- The A2 unit has landed: `src/main/authority-store.ts` (`createAuthorityStore`),
  `src/main/idempotency-registry.ts` (`createIdempotencyRegistry`),
  `src/renderer/gnosis-crud-panes.ts` + `src/renderer/pane-graph.ts`
  (`gnosisDocumentsContent`/`gnosisWikisContent`) all EXIST; `src/main/main.ts`
  imports `createEngineCrudRagStore` and constructs it **unconditionally at boot**
  (`const engineCrudRagStore = createEngineCrudRagStore({ baseUrl:
  resolveEngineBaseUrl() })`, no I/O); `src/main/mcp-server.ts` carries the 11
  `gnosis.document.*`/`gnosis.wiki.*` tool rows in `ALL_TOOLS` + the extended
  `handleGnosisTool` + the `name.startsWith('gnosis.')` routing branch threading
  `engineCrudRagStore`/`authorityStore`/`idempotency`.
- The blind-greens run file `tests/blind-unit-a2-document-crud-wiring-greens.test.ts`
  exists and the greens are **81/81 PASS at the module level** (mock transport).

### 1.2 No live Gnosis engine (the decisive probe) and no running app

- `ps aux | grep -iE 'gnosis|astrographer|electron'` → **no gnosis engine
  process** and **no Astrographer/Electron app process** (only unrelated
  Discord/OpenCode crashpad handlers).
- `ss -ltnp` → **no listener** on the engine's documented default
  `http://127.0.0.1:8080` (spec §5.4). `curl -sS http://127.0.0.1:8080/engine/status`
  → **`curl: (7) Failed to connect … Couldn't connect to server`** (refused).
- The `gnosis-server` `[[bin]]` crate EXISTS in the Gnosis workspace
  (`Cargo.toml`; `src/bin/gnosis_server.rs`), but **no server is running** — the
  P2 server host is not live.

**Conclusion:** the live surface required to exercise the 11 document/wiki MCP
tools + the GUI panes end-to-end (a running `gnosis-server` serving the CRUD
endpoints on loopback AND the running Astrographer app with the `gnosis`/
`gnosis-edit` groups enabled) is **not available**. Per the live-runner contract
these scenarios are **parked** (not failures) and recorded here. The greens
themselves are already **81/81 PASS against the live module** — the park is a
transport-surface + running-app absence, not a module regression.

---

## 2. The live surfaces that WILL exercise the A2 behavior (after the revisit condition)

| Live surface | A2 behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running `gnosis-server` binary bound to loopback (`127.0.0.1:<port>`), serving the 11 document-CRUD endpoints + `GET /engine/status` | The 11 `gnosis.document.*`/`gnosis.wiki.*` MCP-tool happy paths + the READY gate + D2 engine-absent over a real transport: `POST /documents`, `GET /documents/:id`, `POST /documents/:id/update`, `DELETE /documents/:id`, `POST /documents/:id/publish`, `POST /documents/:id/unpublish`, `POST /documents/:id/archive`, `GET /documents`, `POST /wikis`, `GET /wikis/:id`, `GET /wikis` | `tools/call` on the 11 document/wiki tools through the running app's MCP transport (or the IPC bridge → the same `handleGnosisTool`); or the real proxy with the injectable `fetch` pointed at the live endpoint |
| The engine's boot→READY lifecycle | READY observation + gating: each CRUD call issues a fresh `GET /engine/status`; non-`Ready` → `EngineUnavailable` (503) | Observe the live `GET /engine/status` across the engine's boot; drive each tool in each observed state |
| The engine's real transport failure modes | The `EngineUnavailable`/`EngineError` split: connection-refused, engine-not-spawned, non-2xx non-envelope body | Point the proxy at a dead port (refused), a non-spawned address (not-found), and a live-but-malformed server |
| The running Astrographer app (Electron; MCP server + D4 panes exposed) | The GUI document-editor/wiki panes (the wiki selector, the document list, the document editor, the 409 conflict state, the unavailable state, the no-edit-access state) | Drive the `gnosis-documents`/`gnosis-wikis` panes in the running app with the `gnosis`/`gnosis-edit` groups enabled |
| The live wire's RBAC `caller` threading | The encoded request envelope reflects the args type: mutating carries `caller`, read-only carries no `caller` | Observe the request envelope the server receives for a mutating vs a read-only call |

**Prerequisites for the later run (MANDATORY):**

1. The **Gnosis engine (the P2 `gnosis-server` binary) must be running**, bound
   to **loopback** (`127.0.0.1` per the LOOPBACK-AUTH-TLS policy), serving the 11
   document-CRUD endpoints + `GET /engine/status` (the P2 server spec §5.2/§6).
2. The **Astrographer app must run with the A2 CRUD routing** wired in (the
   `createEngineCrudRagStore` boot construction + the extended `handleGnosisTool`
   + the GUI panes).
3. The **`gnosis` and `gnosis-edit` groups must be enabled** in the shell's
   security settings (both default-off; enable via the manual-UI settings pane).
4. The **operator callerId `'operator'` must have edit authority** in the
   `AuthorityStore` (the boot-time `loadAuthorityMapping()` must map `'operator'`
   to a non-null credential) so the 7 mutating tools pass the caller-side RBAC
   check.

---

## 3. The concrete live probes to run once the engine is running + the app is up

The "expected" column re-expresses the greens/spec expectation as a live
observable. A live result that CONTRADICTS the greens or the spec is a finding
(a regression or a doc/spec drift) — never a pass.

### 3.1 P0 — the live endpoint must be reachable (proves the engine is live)

| Step | Expected |
| --- | --- |
| `curl -sS http://127.0.0.1:<port>/engine/status` | A `HealthReport` JSON (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `state` ∈ `{Ready,Starting,Degraded,Unavailable}`, `version`, `subsystems` (6 flags), `lastError`). If the port is refused/not-found, the engine is not live ⇒ re-park. |
| `curl -sS -X POST http://127.0.0.1:<port>/documents -d '<V-10 request envelope>'` | A V-11-style response envelope (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `payload` = the `createDocument` result body). |

### 3.2 Class L1 — the 11 `gnosis.document.*`/`gnosis.wiki.*` MCP-tool happy paths (greens G1–G11)

Each probe drives the tool through the running app's MCP transport (`tools/call`)
or the IPC bridge → the SAME `handleGnosisTool` handler, against a **Ready**
engine. The mutating tools pass `callerId:'operator'` (which must resolve to a
credential in the `AuthorityStore`). The expected typed result is the
snake→camel projection of the wire body (§5.2).

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **G1** | `gnosis.document.get` with a well-formed `documentId` | Resolves to the typed `Document` (`documentId`, `wikiId`, `revision`, `state`, `graph`, `title`, `createdAt`, `updatedAt`, `tags`, `author`). |
| **G2** | `gnosis.document.list` with a well-formed `wikiId` + optional filters | Resolves to the typed `DocumentList` (`items`, `total`, `page`, `pageSize`). |
| **G3** | `gnosis.wiki.get` with a well-formed `wikiId` | Resolves to the typed `Wiki` (`wikiId`, `name`). |
| **G4** | `gnosis.wiki.list` (no args) | Resolves to the typed `Wiki[]`. |
| **G5** | `gnosis.document.create` with `callerId:'operator'` + a well-formed `wikiId`/`title` | Resolves to the typed `Document` (`revision:0`, `state:'Draft'`). |
| **G6** | `gnosis.document.update` with `callerId:'operator'` + a well-formed `documentId`/`baseRevision`/`graph` | Resolves to the typed `Document`. |
| **G7** | `gnosis.document.delete` with `callerId:'operator'` + a well-formed `documentId` | Resolves to `void` (the wire `result:null`). |
| **G8** | `gnosis.document.publish` with `callerId:'operator'` + a well-formed `documentId` | Resolves to the typed `Document` (`state:'Published'`). |
| **G9** | `gnosis.document.unpublish` with `callerId:'operator'` + a well-formed `documentId` | Resolves to the typed `Document` (`state:'Draft'`). |
| **G10** | `gnosis.document.archive` with `callerId:'operator'` + a well-formed `documentId` | Resolves to the typed `Document` (`state:'Archived'`). |
| **G11** | `gnosis.wiki.create` with `callerId:'operator'` + a well-formed `name` | Resolves to the typed `Wiki`. |

### 3.3 Class L2 — the body-construction rule over the live wire (greens G12–G14)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **G12** | `gnosis.document.create` with NO `tags`/`author` args | The request envelope the server receives carries the body `{ title, tags:null, author:null }` (the `null`-when-`None` discipline — NEVER `[]` for an absent arg). |
| **G13** | `gnosis.document.update` with NO `title`/`tags` args | The request envelope carries the body `{ base_revision, graph, title:null, tags:null }`. |
| **G14** | `gnosis.document.list` with NO optional filters | The request envelope carries the body `{ state:null, tag:null, page:null, page_size:null }`. |

### 3.4 Class L3 — the `gnosis-edit` group + the security gate over the live app (greens G15–G19)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **G15** | With the `gnosis` group enabled (but `gnosis-edit` OFF), `tools/call` on the 4 read-only tools | The 4 read-only tools (`gnosis.document.get`/`list`, `gnosis.wiki.get`/`list`) are registered and callable. |
| **G16** | With `gnosis-edit` OFF (default), `tools/call` on a mutating tool (e.g. `gnosis.document.create`) | The mutating tool is NOT registered / the call is denied (the `gnosis-edit` group is default-off). |
| **G17** | Enable BOTH `gnosis` and `gnosis-edit`; `tools/call` on the 4 read-only + the 7 mutating tools | All 11 tools are registered and callable (the invocation-level gate grants them). |
| **G18** | `tools/call` on a `gnosis.*` name NOT in `TOOL_GROUPS` (e.g. `gnosis.document.other`) | The tool is not registered / resolves to no group (fail-closed). |
| **G19** | `tools/list` with `gnosis`/`gnosis-edit` OFF vs ON | `ALL_TOOLS` includes all 11 names; `registeredToolNames` excludes all 11 when both groups are off, includes the 4 read-only with `gnosis` on, includes the 7 mutating with `gnosis-edit` on. |

### 3.5 Class L4 — the extended `handleGnosisTool` routing + audit + caller threading over the live wire (greens G20–G23)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **G20** | A `gnosis.document.get` call with a non-null audit log | The `QueryAuditLog` gains NO entry (the CRUD tools do NOT record to it). |
| **G21** | A read-only `gnosis.document.get` call; observe the request envelope the server receives | The envelope's `args` has NO `caller` key. |
| **G22** | A mutating `gnosis.document.create` call with `callerId:'operator'`; observe the request envelope | The envelope's `args.caller` equals the resolved credential from the `AuthorityStore` (the A1 proxy's typed args require `caller` on the 7 mutating methods). |
| **G23** | `tools/call` on an unknown `gnosis.*` name (e.g. `gnosis.frobnicate`) | Throws `Error('unknown gnosis tool: gnosis.frobnicate')`. |

### 3.6 Class L5 — the `AuthorityStore` + the `IdempotencyRegistry` over the live app (greens G24–G28)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **G24** | `createAuthorityStore({ operator:'user:operator' })` | `callerCredential('operator')` returns `'user:operator'`; `callerCredential('unknown')` returns `null`; `editors()` returns `['operator']`. |
| **G25** | `createIdempotencyRegistry({ maxEntries: 2 })` | `get`/`set` round-trip; the registry is bounded (LRU eviction, never unbounded). |
| **G26** | `gnosis.document.create` with a `requestId` that already has a cached result | Returns the cached result WITHOUT issuing a new proxy call (the engine's CRUD-request count stays at 1). |
| **G27** | Caller A creates with `requestId:'r1'`; caller B with the SAME `requestId:'r1'` | Caller B issues a fresh create (the dedup is caller-scoped — a caller can NEVER receive another caller's cached result). |
| **G28** | `createEngineCrudRagStore({ baseUrl:'http://127.0.0.1:8080', fetch:<throws-if-called> })` | Constructs WITHOUT calling `fetch` (construction does NOT contact the engine); `waitForReady` is NOT awaited at boot. |

### 3.7 Class L6 — the GUI document-editor/wiki panes over the live app (greens G29–G33, F38–F40)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **G29** | The `gnosis-documents` pane rendering a live wiki list + document list + a document | The rendered subtree shows the wiki name, the document title, and the document fields; never throws. |
| **G30** | The `gnosis-wikis` pane rendering a live wiki list + a wiki | The rendered subtree shows the wiki name; never throws. |
| **G31** | The `gnosis-documents` pane on a 409 `ConflictError` (a stale `baseRevision` on `gnosis.document.update`) | The pane renders the conflict state (the conflict message), never a crash. |
| **G32** | The `gnosis-documents` pane with a null result | The empty state, never a TypeError. |
| **G33** | The `gnosis-wikis` pane with a null result | The empty state, never a TypeError. |
| **F38** | The `gnosis-documents`/`gnosis-wikis` panes when the engine is absent (stopped) | The unavailable state (the bridge rejection is caught, never a crash). |
| **F39** | The panes when the `gnosis`/`gnosis-edit` group is OFF | Fail-closed (the group gates) and/or surface `EngineUnavailable` as an empty/error state — never a crash. |
| **F40** | A mutating action on the `gnosis-documents` pane with a caller that has no edit authority | The pane shows the no-edit-access state (the caller-side deny is surfaced, never a crash). |

### 3.8 Class L7 — the engine-dependent fail-states over a real transport (greens F14–F35, F32–F33)

These fail-states require a live engine (or a live-but-malformed server) to
produce the underlying `StoreError`/transport conditions. Each is driven through
the same `handleGnosisTool` handler; the expected typed error is the greens/spec
outcome.

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| **F14** | `gnosis.document.get` on a non-existent `documentId` | `EngineWireError` (404, `document_not_found`). |
| **F15** | `gnosis.document.list` on a non-existent `wikiId` | `EngineWireError` (404, `wiki_not_found`). |
| **F16** | `gnosis.document.list` with a `page < 1` / `pageSize < 1` / `pageSize > 100` filter | `EngineWireError` (400, `validation_error`). |
| **F17** | `gnosis.wiki.get` on a non-existent `wikiId` | `EngineWireError` (404, `wiki_not_found`). |
| **F18** | `gnosis.document.create` on a non-existent `wikiId` | `EngineWireError` (404, `wiki_not_found`). |
| **F19** | `gnosis.document.create` with an empty/overlong `title` | `EngineWireError` (400, `validation_error`). |
| **F20** | `gnosis.document.update` on a non-existent `documentId` | `EngineWireError` (404, `document_not_found`). |
| **F21** | `gnosis.document.update` with an invalid `graph` | `EngineWireError` (400, `validation_error`). |
| **F22** | `gnosis.document.update` with a stale `baseRevision` | `ConflictError` (409) — the optimistic-concurrency 409 UX (H2). |
| **F23** | `gnosis.document.delete` on a non-existent `documentId` | `EngineWireError` (404, `document_not_found`). |
| **F24** | `gnosis.document.delete` on a document that is in use | `EngineWireError` (409, `document_in_use`). |
| **F25** | `gnosis.document.publish` on a non-existent `documentId` | `EngineWireError` (404, `document_not_found`). |
| **F26** | `gnosis.document.publish` on a document with an unresolved reference | `EngineWireError` (422, `unresolved_reference`). |
| **F27** | `gnosis.document.unpublish` on a non-existent `documentId` | `EngineWireError` (404, `document_not_found`). |
| **F28** | `gnosis.document.unpublish` on a document not in the `PUBLISHED` state | `EngineWireError` (409, `invalid_state`). |
| **F29** | `gnosis.document.archive` on a non-existent `documentId` | `EngineWireError` (404, `document_not_found`). |
| **F30** | `gnosis.document.archive` on a document already `ARCHIVED` | `EngineWireError` (409, `invalid_state`). |
| **F31** | `gnosis.wiki.create` with an empty/overlong `name` | `EngineWireError` (400, `validation_error`). |
| **F32** | A document/wiki tool when the engine is connection-refused (stopped) | `EngineUnavailable` (503, `cause:'connection-refused'`). |
| **F33** | A document/wiki tool when the observed state is `Starting`/`Degraded`/`Unavailable` | `EngineUnavailable` (503, `cause:'not-ready'` for `Starting`/`Degraded`; `cause:'unavailable-state'` for `Unavailable`). |
| **F34** | A document/wiki tool against a server emitting a malformed wire body | `EngineError` (502). |
| **F35** | A `createDocument` result with `revision != 0` | `EngineError` (502) naming the `UnexpectedRevision` `CrudValidationFailure` variant. |

### 3.9 Class L8 — the caller-side deny + null-engine fail-states (greens F1–F13, F36–F37)

These are module-level pure fail-states (no live engine required) — they were
already verified against the live module in the greens run and are NOT parked for
the transport run. They are listed here for completeness; re-verify only if a
belt-and-suspenders cross-check is wanted:

- **F1–F11** — each of the 11 tools with a null `engineCrud` → throws
  `Error('<tool>: no engine crud rag store configured')` using the tool's own name.
- **F12** — a mutating tool with a `callerId` that resolves to no credential →
  `Error('<tool>: caller has no edit authority')`; NO proxy call is issued.
- **F13** — a mutating tool with `authorityStore = null` → `Error('<tool>: caller
  has no edit authority')` (fail-closed).
- **F36** — unknown `gnosis.*` name → `Error('unknown gnosis tool: <name>')`
  (covered by G23).
- **F37** — a `gnosis.*` name NOT in `TOOL_GROUPS` → `null` (fail-closed; covered
  by G18).

### 3.10 Module-level pure scenarios — already verified against the live module (NOT re-attempted live)

These are pure encode/decode/validate/factory/render functions with **no network
I/O**; they were already verified against the live modules in the greens run and
do NOT require a live engine+server. They are NOT parked for the transport run:

- **Body-construction rule:** G12, G13, G14 (the `null`-when-`None` discipline —
  verifiable via the pure encode round-trip).
- **Security/group mapping:** G15, G16, G17, G18, G19 (the `gnosis-edit` group +
  `TOOL_GROUPS`/`VALID_GROUPS`/`ALL_TOOLS`/`registeredToolNames`).
- **Audit + caller threading (pure round-trip):** G20, G21, G22 (the read-only
  tools never carry `caller`; the mutating tools always thread the resolved
  credential — verifiable via the pure encode round-trip).
- **Stores + boot construction:** G24, G25, G28 (the `AuthorityStore` +
  `IdempotencyRegistry` + no-I/O construction).
- **Idempotency dedup:** G26, G27 (caller-scoped dedup — verifiable via the pure
  registry round-trip).
- **GUI render helpers:** G29, G30, G31, G32, G33, F38, F39, F40 (the
  `gnosisDocumentsContent`/`gnosisWikisContent` render paths + the conflict/
  empty/unavailable/no-edit-access states — verifiable via the pure render
  helpers).
- **Caller-side deny + null-engine fail-states:** F1–F13, F36, F37.

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 81 (33 G + 40 F + 8 P — all PASS at the module
  level, `docs/specs/unit-a2-document-crud-wiring-greens.md`).
- **Parked for the later live run (require a live engine + the running app's
  MCP/UI surface):**
  - The 11 MCP-tool happy paths over a real transport: **G1–G11** (11).
  - The body-construction rule over the live wire: **G12, G13, G14** (3).
  - The `gnosis-edit` group + security gate over the live app: **G15–G19** (5).
  - The extended `handleGnosisTool` routing + audit + caller threading over the
    live wire: **G20, G21, G22, G23** (4).
  - The `AuthorityStore` + `IdempotencyRegistry` over the live app: **G24–G28** (5).
  - The GUI document-editor/wiki panes over the live app: **G29–G33, F38, F39,
    F40** (8).
  - The engine-dependent fail-states over a real transport: **F14–F35, F32, F33**
    (24).
  - **Total parked: 60 scenario ids** (G1–G33 = 33; F14–F35 = 22; F32, F33 = 2;
    F38, F39, F40 = 3).
- **Run live this iteration: 0** (the engine is not running and the app is not up).
- **Module-level pure (already verified against the live modules in the greens;
  no engine/app required — NOT parked):** G12–G14 (body rule), G15–G19 (security),
  G20–G22 (audit/caller), G24–G28 (stores/boot/dedup), G29–G33 + F38–F40 (GUI
  render helpers), F1–F13 + F36 + F37 (caller-side deny + null-engine) = **21
  scenario ids** (the overlap with the parked set is the live-wire re-verification
  of the same behavior; the pure module-level verification is already green).
- **Not a failure:** the module is green (81/81); the park is a
  **transport-surface + running-app absence** — the Gnosis engine (the P2
  `gnosis-server` binary) is not running and the Astrographer app is not up this
  iteration.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the **Gnosis engine (the P2
   `gnosis-server` binary) is running** on **loopback** (`127.0.0.1`), serving the
   11 document-CRUD endpoints + `GET /engine/status`, AND the **Astrographer app
   runs with the A2 CRUD routing** wired in, AND the **`gnosis`/`gnosis-edit`
   groups are enabled** in the shell's security settings. The live check that
   ends the park: `curl http://127.0.0.1:<port>/engine/status` returns a
   `HealthReport` JSON AND `POST /documents` returns a V-11-style envelope AND the
   app's MCP/UI surface exposes the 11 document/wiki tools.
2. **P0 first:** re-run the §3.1 reachability probe. If the endpoint is
   refused/not-found, the engine is not live and the battery re-parks.
3. **Constraints to honor (recorded):**
   - **Loopback bind:** the engine MUST bind to `127.0.0.1` (LOOPBACK-AUTH-TLS).
     The A1 proxy throws at construction on a non-loopback `baseUrl`
     (`Error('engine crud rag store: baseUrl must be loopback')`).
   - **`gnosis-edit` group enabled:** the 7 mutating tools register ONLY when the
     `gnosis-edit` group is enabled (default-off); the 4 read-only tools register
     when the `gnosis` group is enabled. Enable both via the manual-UI settings /
     security config before driving the tools through the app.
   - **Operator edit authority:** the operator callerId `'operator'` must have
     edit authority in the `AuthorityStore` (the boot-time `loadAuthorityMapping()`
     must map `'operator'` to a non-null credential). A callerId with no entry (or
     a null/empty credential) has NO edit authority and is denied caller-side.
   - **P1a wire shapes:** the engine MUST serve the pinned 11 paths
     (`POST /documents`, `GET /documents/:id`, `POST /documents/:id/update`,
     `DELETE /documents/:id`, `POST /documents/:id/publish`,
     `POST /documents/:id/unpublish`, `POST /documents/:id/archive`,
     `GET /documents`, `POST /wikis`, `GET /wikis/:id`, `GET /wikis`) and emit
     the frozen shapes — the versioned envelope
     (`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":…}`), the
     request envelope (`{"method","args"}`), the response envelope
     (`{"method","result"}` or `{"method","error":{"code","message"}}`), and the
     `HealthReport` (6 fields, 6 subsystem flags, `state` PascalCase).
   - **Envelope-in-body transport:** the request envelope is the **JSON request
     body** for ALL methods (POST/GET/DELETE) — the `gnosis-server` `crud_handler`
     extracts the body and parses it via `Envelope::from_json` for every CRUD
     endpoint regardless of HTTP verb (a GET-with-body is the established
     transport; the server does not read a query param).
   - **`:id` substitution:** the client replaces the `:id` placeholder with the
     URL-encoded `documentId`/`wikiId` from the args; the path id and the
     envelope's id must agree.
   - **Golden vectors as the conformance target:** the engine's responses should
     reproduce the wire contract §9 vectors **V-10..V-12** byte-exactly; the
     proxy's encode/decode functions reproduce them (V-10 = request encode;
     V-11 = response decode; V-12 = error decode).
   - **READY gating:** each CRUD call issues a fresh `GET /engine/status` and
     gates on `state == Ready`; a non-`Ready` state → `EngineUnavailable`
     (503, `cause:'not-ready'` for `Starting`/`Degraded`,
     `cause:'unavailable-state'` for `Unavailable`).
   - **D2 engine-absent:** connection-refused → `EngineUnavailable` (503,
     `cause:'connection-refused'`); engine-not-spawned → `EngineUnavailable`
     (503, `cause:'engine-not-spawned'`).
   - **RBAC `caller` threading:** mutating requests carry `caller`; read-only
     requests carry no `caller` (the type-level guarantee holds over the live
     wire).
   - **CRUD tools do NOT audit:** the document/wiki tools do NOT record to the
     `QueryAuditLog` (the security surface is the group gate + the RBAC caller
     check, NOT the query audit log).
4. **MCP/UI parity:** once the app runs, drive the same scenarios through
   `tools/call` on the 11 document/wiki tools for full MCP/UI feature parity, and
   assert the GUI panes render per §3.7.
5. **A live result that CONTRADICTS the greens or spec §5.1–§5.11 is a finding**
   (a real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor. Byte-pinned messages: assert the exact strings (the null-engine
   guards, the `caller has no edit authority` deny, the `unknown gnosis tool`
   message, the `EngineUnavailable` `cause`/httpStatus values, the
   `EngineError`/`ConflictError` outcomes).
6. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec section numbers, byte-pinned strings, the live tool
   list — new tools may have landed) and the trackers (`docs/next-steps.md`,
   `docs/pending.md`). The greens' harness notes carry over for any direct-proxy
   probing.
