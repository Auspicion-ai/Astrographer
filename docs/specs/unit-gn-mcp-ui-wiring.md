# Spec — Unit GN-MCP-UI: Gnosis MCP/UI Wiring — the `createEngineRagStore` Proxy into the MCP Server (`gnosis.*` Tools) + the GUI (Scoped Screens)

- **Status:** SPEC — **LANDED (2026-09-10)** — the wiring unit that threads the
  LANDED `createEngineRagStore` proxy (Unit GN, `docs/specs/unit-gn-engine-integration.md`)
  into the Astrographer app's MCP server (the new `gnosis.*` tools) and GUI
  (the scoped status + query screens), exercising D4 MCP-GUI parity. Proposal
  gate: **PASS — scoped per Architecture A1** with **9 required amendments**
  (all 9 are pinned in this spec — see §4). The proxy surface being wired is
  the retrieval trio + health (`ragQuery`/`ragStream`/`getEngineStatus` +
  `health`/`waitForReady`) from Unit GN §5.1; the D2 engine-absent behavior is
  Unit GN §5.6; the census is Unit GN §5.10. **This unit does NOT re-spec the
  proxy** — it specs the WIRING (the MCP tool surface, the security group, the
  main-process routing + audit log, the boot-time construction + `baseUrl`
  source, the D4 parity scope, the D2 surfacing, the security carve-out, and
  the contract-spec update).
- **Scope:** (1) the three `gnosis.*` MCP tools (`gnosis.query`/`gnosis.stream`/
  `gnosis.status`) registered in the `gnosis` tool group (read-only, default-off);
  (2) the `security.ts` `TOOL_GROUPS`/`VALID_GROUPS`/`ALL_TOOLS` changes; (3) the
  main-process routing + audit-log wiring in `mcp-server.ts`; (4) the
  `McpServerOptions.engineRagStore` injection + the boot-time proxy construction
  + the `baseUrl` env/config source; (5) the D4 parity scope (the three MCP tools
  + a status **operator pane** + a query **app-graph pane**, both provident-authored,
  with a NEW `EngineRagResult` render path); (6) the D2 engine-absent surfacing
  (typed MCP error + GUI unavailable state); (7) the security carve-out
  enumeration + the no-credential-arg test; (8) the contract-spec update
  (`mcp-endpoint.md` + `docs/decisions.md`). **Explicitly OUT of scope:** any
  change to the proxy itself (`src/main/engine-rag-store.ts` — Unit GN owns it),
  any new engine feature beyond the three tools + two screens, and any
  `waitForReady`-as-a-tool exposure (it is a shell-side convenience, NOT a D4
  parity feature — amendment 4).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the wiring (the `gnosis.*` MCP
  tools + the `security.ts` group + the main-process routing + the boot
  construction + the GUI panes) from §5.8/§5.9 before any implementation, and
  asserts the PBT register (§5.7) holds.

---

## 1. What the proposal asks

Unit GN landed the shell-side `createEngineRagStore` proxy — the HTTP/SSE wire
client that proxies the Gnosis engine's retrieval surface over the F2 wire
contract. That proxy is a **pure main-process module**; it has no MCP surface
and no GUI surface of its own. This unit **wires** it into the two surfaces the
Astrographer shell provides (D4 MCP-GUI parity, guide §9):

1. **MCP tools** — expose the retrieval trio + health as three `gnosis.*` MCP
   tools (`gnosis.query`/`gnosis.stream`/`gnosis.status`), gated behind a NEW
   `gnosis` tool group (read-only, default-off), main-process-routed, with
   `gnosis.query`/`gnosis.stream` recorded to the shared audit log.
2. **GUI screens** — a status/health **operator pane** (isolated GraphScope,
   the secure-panels pattern — keeps engine state out of `get_rendered_html`)
   and a query **app-graph pane** (like the existing search pane) gated
   fail-closed on the `gnosis` group, both provident-authored, with a NEW
   `EngineRagResult` render path (distinct from the local `RagResult`).
3. **Engine lifecycle** — construct the proxy at boot UNCONDITIONALLY (no I/O
   at construction) and inject it into `McpServerOptions`; the `baseUrl` comes
   from an env var (`PROVIDENT_ENGINE_BASE_URL`) + a config seam (a config
   value, NOT a credential). Do NOT await `waitForReady` at boot and do NOT
   expose it as a tool.
4. **D2 engine-absent** — surface `EngineUnavailable` consistently: the MCP
   tools throw the typed `EngineWireError` (code + §11 httpStatus); the GUI
   status pane shows an unavailable state. The happy path is tested with the
   proxy's injectable `fetch`/`sse` (mock transport); the engine-absent path is
   tested via connection-refused → `EngineUnavailable`.

**Explicitly OUT of scope (deferred):** any change to the proxy module itself
(Unit GN owns `src/main/engine-rag-store.ts`); any engine feature beyond the
three tools + two screens (D4 parity is scoped to this unit — amendment 5);
`waitForReady` as a tool (amendment 4); full `RagStore` CRUD routing (deferred
per the guide §4.6/§10.4).

## 2. Feasibility verdict

**Feasible — a pure wiring unit over the LANDED proxy; no engine/foundation gap.**

- **The proxy surface is frozen.** Unit GN §5.1 pins the 5-method proxy surface
  (`ragQuery`/`ragStream`/`getEngineStatus`/`health`/`waitForReady`), the typed
  error model (`EngineWireError`/`EngineUnavailable`/`EngineError`/
  `TraceUnavailable`/`ConflictError`), the `EngineRagResult`/`RagChunk`/
  `HealthReport` shapes, and the §11 HTTP-status map. This unit consumes them;
  there is no shape ambiguity.
- **The MCP tool-registration pattern is frozen.** `mcp-server.ts` already
  registers main-handled `rag.*`/`edit.*`/`code.template.*` tools through the
  `graph` array + the `registerTools` main-handled branch (~line 1977). The
  `gnosis.*` tools follow the SAME pattern (a new `graph`-array entry + a new
  main-handled branch + a `security.ts` group + an `ALL_TOOLS` row).
- **The security group pattern is frozen.** `security.ts` `TOOL_GROUPS`/
  `VALID_GROUPS` already carry the `rag`/`edit`/`code`/`module` groups; adding
  `'gnosis'` is a mechanical additive change.
- **The GUI pane pattern is frozen.** `pane-registry.ts` + `sidebar-panes.ts` +
  `pane-graph.ts` already implement the app-graph pane (search) + operator pane
  (settings) patterns; the two new screens follow them.
- **No engine/foundation gap.** The wiring composes the LANDED proxy + the
  existing MCP/security/pane machinery. The proxy's injectable `fetch`/`sse`
  make the happy path testable with a mock transport (amendment 6).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The three `gnosis.*` MCP tools + the `gnosis` group | Project-specific (shell-side; the proxy is already landed) | Low cost; the D4 MCP surface for the retrieval trio + health. |
| The main-process routing + audit-log wiring | Project-specific (extends the `mcp-server.ts:1977` branch) | Low cost; `gnosis.query`/`gnosis.stream` recorded like `rag.query`. |
| The `McpServerOptions.engineRagStore` injection + boot construction + `baseUrl` source | Project-specific (main.ts boot) | Low cost; the engine lifecycle seam. |
| The status operator pane + the query app-graph pane + the `EngineRagResult` render path | Project-specific (renderer, provident-authored) | Medium cost; the D4 GUI surface. |
| The D2 engine-absent surfacing (typed MCP error + GUI unavailable state) | Project-specific (consumes Unit GN §5.6) | Low cost; the D2 optional-engine contract. |
| The security carve-out + the no-credential-arg test | Project-specific (GUI-only boundary) | Low cost; the security surface. |
| The contract-spec update (`mcp-endpoint.md` + `decisions.md`) | Project-specific (doc) | Low cost; keeps the contract + decision records in sync. |

No engine gap. The proxy is landed; this unit only wires it. The server-host
binary crate and full CRUD routing remain deferred (guide §4.6/§10.4).

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.8/§5.9 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

**Adversarial findings (RCA-3 — all HOST, fixed + regression-tested):**

- **HOST-MAJOR-1 (FIXED) — `resolveEngineBaseUrl` omitted the config-seam source.** The §5.4 3-step priority (config seam → env `PROVIDENT_ENGINE_BASE_URL` → default) was implemented as env → default only, with a doc comment that claimed the seam "wins first" (a comment/code mismatch). **Fix:** added the operator-owned config seam `src/main/engine-config.ts` (a persisted, non-credential engine `baseUrl` store + the in-memory registry `setEngineConfigBaseUrl`/`getEngineConfigBaseUrl`), mounted at boot; `resolveEngineBaseUrl()` now reads the seam FIRST, then env, then the default. The default + env var name are unchanged. The doc comment now matches the code.
- **HOST-MAJOR-2 (FIXED) — the D4 GUI registration + fail-closed gating + bridge surface were not implemented.** Only the two pure render helpers existed. **Fix:** added `src/renderer/gnosis-panes.ts` (the `GnosisPanes` host — registers + enables the `gnosis-status` OPERATOR pane (isolated operator scope, MCP-invisible) + the `gnosis-query` APP-GRAPH pane, gates the query pane fail-closed on the `gnosis` group, reuses `gnosisStatusContent`/`gnosisQueryContent`, provident-authored data throughout); wired the bridge surface (`window.provident.sidebar.gnosisStatus`/`gnosisQuery` → `bridge.gnosis.status/query` → the `IPC_GNOSIS_STATUS`/`IPC_GNOSIS_QUERY` IPC → MAIN → the SAME `handleGnosisTool`); booted from `renderer.ts`. (The panes are registered by `GnosisPanes`, NOT by `SidebarPanes.registerPanes()`, so the Unit H census of exactly 5 panes stays intact.)
- **HOST-MINOR-3 (FIXED) — the pane handler must catch a rejected bridge call → the unavailable state.** **Fix:** `gnosisStatusPaneHandler` (exported from `src/renderer/pane-graph.ts`) awaits the `getEngineStatus` bridge and on a REJECTED bridge (the D2 `EngineUnavailable`) renders `gnosisStatusContent(ctx, null)` — never throws; `GnosisPanes.refreshStatus`/`submitQuery` also catch their bridge rejections and render the unavailable/empty state (never a crash).

**PBT audit (read-only, §5.7 register):**

- **ALL 8 ROWS HELD (2026-09-10):** the executed property layer ran under the
  pinned deterministic seed (≤100 attempts/row, ≤400 total, stop-after-5), and
  each of the 8 rows (P-IM-1 no-credential-args, P-IM-2 group default-off,
  P-IM-3 stream-collect, P-SM-1 audit-recording, P-SM-2 engine-absent
  cross-surface, P-TP-1 group-total, P-TP-2 ready-gate, P-TP-3 render-shape)
  recorded as **held**. The adversarial/read-only generator audit is recorded:
  **the P-IM-1 generator was HARDENED** (schema-key scan for credential fields
  `token`/`tls`/`ca`/`cert`/`key`/`apiKey` over all three `gnosis.*` tool
  schema key-sets), **the P-SM-2 generator was HARDENED** (GUI coverage: the
  same connection-refused transport asserted on BOTH the MCP tool AND the
  `gnosisStatusContent(ctx, null)` unavailable-state render), and **the P-TP-3
  generator was HARDENED** (the `EngineRagResult` render walks the key set and
  asserts NONE of `ranked`/`context`/`markdown`/`lineMap`/`k`).

### 3b. Package findings register (provident-ssr / Gnosis — recorded, never patched)

> Package/upstream findings from the post-green adversarial pass are recorded
> here and routed to `docs/defects.md` + `docs/HANDOFF.md` (never patched in
> this repo — the package code is upstream-owned).

- **NONE YET** (the register is EMPTY at the spec gate).

## 4. Design decisions pinned by this spec

The 9 required amendments from the proposal gate are pinned here (each is
expanded in §5):

- **A1 [blocking] GNOSIS-TOOL-NAMING-GROUP — the three tools are `gnosis.query`/
  `gnosis.stream`/`gnosis.status` (a `gnosis.*` prefix, NOT `rag.*`/`engine.*`).**
  A NEW `ToolGroup` union member `'gnosis'` (read-only, default-off) is added to
  `security.ts` `TOOL_GROUPS` + `VALID_GROUPS`, and the three names are added to
  `ALL_TOOLS` (§5.2).
- **A2 [blocking] GNOSIS-MAIN-ROUTING-AUDIT — the `mcp-server.ts:1977`
  main-handled branch is extended to route `gnosis.*` to a main-process handler;
  `gnosis.query`/`gnosis.stream` are recorded to the audit log (like `rag.query`);
  `gnosis.status` is read-only and does NOT record. An `engineRagStore?:
  EngineRagStore` option is added to `McpServerOptions` and threaded into
  `registerTools`/`invokeTool` like `retrievalEngine` (§5.3/§5.4).**
- **A3 [blocking] GNOSIS-STREAM-OVER-MCP — `gnosis.stream` collects the
  single-shot `AsyncIterable<RagChunk>` into an array and returns
  `{ chunks: RagChunk[] }`. The READY gate fires inside the tool call; a
  non-`Ready` state surfaces as the typed `EngineUnavailable` error.
  Premature-close `EngineUnavailable` and SSE teardown are handled by full
  consumption within the call. `gnosis.stream` is single-shot (at most one
  `result` then `done`), bounded by the proxy's `requestTimeoutMs` (10s
  default) (§5.1/§5.3).**
- **A4 [major] GNOSIS-ENGINE-LIFECYCLE — the proxy is constructed at boot
  UNCONDITIONALLY (construction does no I/O) and injected into
  `McpServerOptions`. The `baseUrl` source is an env var
  (`PROVIDENT_ENGINE_BASE_URL`) + a config seam (a config value, NOT a
  credential). Do NOT await `waitForReady` at boot and do NOT expose it as a
  tool (it is a shell-side convenience, NOT a D4 parity feature) (§5.4).**
- **A5 [major] GNOSIS-D4-PARITY-SCOPE — the first wiring unit is scoped to the
  three MCP tools + a status/health GUI screen + a query GUI screen. Do NOT
  require GUI+MCP for every engine feature in this unit. The status screen is
  an **operator pane** (isolated GraphScope, the secure-panels pattern — keeps
  engine state out of `get_rendered_html`); the query screen is an **app-graph
  pane** (like the existing search pane) gated fail-closed on the `gnosis`
  group. Both MUST be provident-authored data (envelope nodes/handler bodies),
  never hand-written DOM. The GUI needs a NEW render path for the
  `EngineRagResult` shape (distinct from the local `RagResult`) (§5.5).**
- **A6 [major] GNOSIS-D2-ENGINE-ABSENT — `EngineUnavailable` is surfaced
  consistently: the MCP tools throw the typed `EngineWireError` (code + §11
  httpStatus); the GUI status pane shows an unavailable state. The happy path
  MUST be tested with the proxy's injectable `fetch`/`sse` (mock transport);
  the engine-absent path is tested via connection-refused → `EngineUnavailable`
  (§5.6).**
- **A7 [minor] GNOSIS-SECURITY-CARVE-OUT — the GUI-only boundary is enumerated
  precisely (engine credentials: auth token, TLS `ca`/`cert`/`key`; Astral push
  creds; Firmament bridge auth). `baseUrl` is NOT a credential (env/CLI
  config). A test asserts no `gnosis.*` MCP tool's `inputSchema` accepts a
  credential arg (no `token`/`tls` fields) (§5.2/§5.7).**
- **A8 [minor] GNOSIS-HEALTH-AS-TOOL — `gnosis.status` is a TOOL in the
  `gnosis` group (default-off), NOT an `mcp://` resource (a resource would be
  gated on the `read` group, default-ON, leaking engine status) (§5.1/§5.2).**
- **A9 [minor] GNOSIS-CONTRACT-SPEC-UPDATE — the three `gnosis.*` tools are
  added to the endpoint spec's tool table + the `gnosis` group to the §6.2
  group table (default-off), and the `gnosis` group is recorded in
  `docs/decisions.md` (§5.11).**

## 5. The exhaustive contract

### 5.1 The three `gnosis.*` MCP tools

The three tools are registered in the `graph` array of `mcp-server.ts`
`registerTools` (the same pattern as the `rag.*`/`edit.*`/`code.template.*`
tools) and routed to a main-process handler (see §5.3). They are gated by the
`gnosis` group (default-off — §5.2). **A8:** `gnosis.status` is a TOOL, NOT an
`mcp://` resource.

**`gnosis.query`** — issue a REST `ragQuery` through the proxy and return the
proxy-specific `EngineRagResult`.

- **inputSchema (exact):**
  ```ts
  {
    query: z.string(),
    topK: z.number().optional(),
    mode: z.enum(['flat', 'graph', 'vector', 'hybrid']).optional(),
    maxHops: z.number().optional(),
    expand: z.enum(['none', 'parent']).optional(),
    maxParentContext: z.number().optional(),
    filters: z.object({
      nodeKind: z.enum(['content', 'fact', 'reference']).optional(),
      edgeType: z.enum(['link', 'embed']).optional(),
      target: z.object({ documentId: z.string(), nodeId: z.string() }).optional(),
      state: z.enum(['FRESH', 'RESOLVED', 'STALE', 'BROKEN']).optional(),
    }).optional(),
  }
  ```
  **A7:** the schema carries NO credential field — no `token`, no `tls`, no
  `ca`/`cert`/`key`, no `apiKey`. The `mode` union is the proxy's FULL four-member
  set (flat/graph/vector/hybrid — the Astrographer `rag.query` tool is flat/graph
  ONLY; the gnosis tool passes the engine's full mode set through).
- **Return shape:** the proxy-specific `EngineRagResult` (Unit GN §5.1 — `query`,
  `results[]`, `engine`, `citations[]`, `trace`, `blockedBy?`). NOT the local
  `RagResult` (no `ranked`/`context`/`markdown`/`lineMap`/`k`).
- **Throw pattern:** the proxy's typed `EngineWireError` (code + §11 httpStatus)
  propagates as the MCP tool error. A non-`Ready` observed state →
  `EngineUnavailable` (503). Connection-refused → `EngineUnavailable` (503,
  `cause: 'connection-refused'`). A malformed wire body → `EngineError` (502) /
  `TraceUnavailable` (502). A null engine → `Error('gnosis.query: no engine rag
  store configured')`.
- **Audit:** recorded (like `rag.query`) — §5.3.

**`gnosis.stream`** — collect the proxy's single-shot `AsyncIterable<RagChunk>`
into an array and return `{ chunks: RagChunk[] }`.

- **inputSchema (exact):** IDENTICAL to `gnosis.query` (the same args; no
  credential field — A7).
- **Return shape:** `{ chunks: RagChunk[] }` — the collected single-shot chunks
  in order: at most one `{type:'result', result: EngineRagResult}` or one
  `{type:'error', code, message}` then `{type:'done'}`. **A3:** the collection
  is a FULL consumption of the iterable within the tool call (the SSE teardown
  + premature-close `EngineUnavailable` are handled by the proxy's own
  consumption — the tool does NOT leave a half-open stream). Single-shot: at
  most one `result` then `done`, bounded by the proxy's `requestTimeoutMs`
  (10s default).
- **Throw pattern:** the READY gate fires INSIDE the tool call (the proxy's
  `ragStream` gate). A non-`Ready` observed state → the typed `EngineUnavailable`
  (503) surfaces as the MCP tool error (NOT as an error chunk — the gate is a
  tool-level throw). A premature close before `done` → `EngineUnavailable`
  (503, `cause: 'connection-refused'`). A malformed SSE frame → `EngineError`
  (502). A null engine → `Error('gnosis.stream: no engine rag store
  configured')`.
- **Audit:** recorded (like `rag.query`) — §5.3.

**`gnosis.status`** — issue a REST `getEngineStatus` through the proxy and
return the `HealthReport`.

- **inputSchema (exact):** `{}` (no args; no credential field — A7).
- **Return shape:** the `HealthReport` (Unit GN §5.1 — `schemaVersion`,
  `idFormat`, `state`, `version`, `subsystems`, `lastError`).
- **Throw pattern:** the proxy's typed `EngineWireError` propagates as the MCP
  tool error. Connection-refused → `EngineUnavailable` (503, `cause:
  'connection-refused'`). A malformed report → `EngineError` (502). A null
  engine → `Error('gnosis.status: no engine rag store configured')`.
- **Audit:** NOT recorded (read-only — §5.3).

**A8 (health as tool, not resource):** `gnosis.status` is a TOOL in the `gnosis`
group (default-off). It is NOT registered as an `mcp://` resource — a resource
would be gated on the `read` group (default-ON), leaking engine status to any
`read`-group agent. The `gnosis` group is the ONLY gate on engine status.

### 5.2 The `gnosis` tool group + the `security.ts` changes

**A1:** a NEW `ToolGroup` union member `'gnosis'` (read-only, default-off) is
added to `security.ts`.

- **`ToolGroup` union (line 3):** `'read' | 'dispatch' | 'graph' | 'code' |
  'module' | 'rag' | 'edit'` → **`'read' | 'dispatch' | 'graph' | 'code' |
  'module' | 'rag' | 'edit' | 'gnosis'`** (one new member).
- **`TOOL_GROUPS` map (lines 5–74):** three new rows:
  ```ts
  'gnosis.query': 'gnosis',
  'gnosis.stream': 'gnosis',
  'gnosis.status': 'gnosis',
  ```
- **`VALID_GROUPS` set (line 170):** `'gnosis'` is added (one new member).
- **`defaultSecurityConfig()` (line 118):** UNCHANGED — the default enabled set
  stays `['read', 'dispatch']`. **The `gnosis` group is default-OFF** (a
  human must enable it via the manual-UI settings pane, like `rag`/`edit`/
  `code`/`module`).
- **`ALL_TOOLS` (mcp-server.ts lines 1470–1529):** the three names are added:
  ```ts
  // Unit GN-MCP-UI (docs/specs/unit-gn-mcp-ui-wiring.md §5.2) — the `gnosis`
  // (read-only, default-off) tool group: the retrieval trio + health over the
  // LANDED createEngineRagStore proxy. Main-handled.
  'gnosis.query',
  'gnosis.stream',
  'gnosis.status',
  ```
- **`groupForTool` (security.ts lines 76–87):** UNCHANGED — the three exact-name
  rows in `TOOL_GROUPS` resolve to `'gnosis'` (the `module:` prefix branch is
  untouched). A `gnosis.*` name NOT in `TOOL_GROUPS` (e.g. a hypothetical
  `gnosis.other`) → `null` (fail-closed, never resolves to `gnosis`).

**A7 (security carve-out — the GUI-only boundary):** the following are
GUI-only at the shell (never MCP-tool args, never MCP-visible):

- **Engine credentials:** the proxy's `auth.token` (the bearer token sent as
  `Authorization: Bearer <token>`) and the TLS `ca`/`cert`/`key` options
  (Unit GN §5.1 `EngineRagStoreOptions.auth`). These are configured in the GUI
  (the D4 security-configuration carve-out, guide §8), NEVER accepted as an MCP
  tool argument.
- **Astral push creds** and **Firmament bridge auth** (the other D4 carve-out
  credential families, guide §8) — GUI-only, never MCP args.
- **`baseUrl` is NOT a credential** — it is env/CLI config (amendment 4,
  §5.4), not a GUI-only secret and not an MCP tool arg.

**The no-credential-arg test (A7):** a test asserts that NONE of the three
`gnosis.*` MCP tools' `inputSchema` accepts a credential arg — no `token`, no
`tls`, no `ca`/`cert`/`key`, no `apiKey` field in any of the three schemas
(§5.7 P-IM-1).

### 5.3 Main-process routing + audit-log wiring

**A2:** the `mcp-server.ts` main-handled branch (~line 1977, currently
`rag.*`/`get_query_audit_log`/`rag-stream`) is extended to route `gnosis.*` to a
main-process handler.

**The shared main-process handler (exported for direct unit testing):**

```ts
/** Unit GN-MCP-UI §5.3 — handle a `gnosis.*` tool in MAIN (the LANDED
 *  createEngineRagStore proxy). The gnosis tools are NOT routed to the
 *  renderer (the proxy is main-process). Exported for direct unit testing. */
export async function handleGnosisTool(
  engine: EngineRagStore | null,
  name: string,
  args: Record<string, unknown>,
  auditLog?: QueryAuditLog | null,
): Promise<unknown>
```

**Behavior (pinned):**

- **Null-engine guard:** `if (!engine) throw new Error(\`${name}: no engine rag
  store configured\`)` — mirrors the `rag.*` handler's top guard. The message
  uses the tool's own name (`gnosis.query:`/`gnosis.stream:`/`gnosis.status:`).
- **`gnosis.query`:** validates the args (the same field checks as `rag.query` —
  §5.1), then calls `engine.ragQuery(query, opts)` and returns the
  `EngineRagResult`. On success, records the audit entry (§5.3 audit). The
  proxy's typed `EngineWireError` propagates (the MCP tool error surfaces the
  code + §11 httpStatus).
- **`gnosis.stream`:** validates the args (same checks), then calls
  `engine.ragStream(query, opts)`, **fully consumes** the `AsyncIterable<RagChunk>`
  into an array, and returns `{ chunks }`. On success, records the audit entry.
  The READY gate fires inside the tool call (the proxy's `ragStream` gate); a
  non-`Ready` state surfaces as the typed `EngineUnavailable` (a tool-level
  throw, NOT an error chunk). Premature-close `EngineUnavailable` + SSE
  teardown are handled by the full consumption within the call (A3).
- **`gnosis.status`:** calls `engine.getEngineStatus()` and returns the
  `HealthReport`. Does NOT record an audit entry (read-only).
- **Unknown `gnosis.*` name:** `throw new Error(\`unknown gnosis tool: ${name}\`)`.

**The routing branch (mcp-server.ts ~line 1989):** a NEW branch is added
alongside the `rag.`/`edit.`/`code.template.` branches:

```ts
if (name.startsWith('gnosis.')) {
  return text(await handleGnosisTool(engineRagStore, name, args, auditLog))
}
```

The `engineRagStore` is threaded into `registerTools` (a new parameter, like
`retrievalEngine`) and captured on the `ProvidentMcpServer` instance (a new
private field, like `retrievalEngine`). The `applyGatePatch` widen path
(mcp-server.ts line 1579) passes it through unchanged.

**Audit-log wiring (A2):** `gnosis.query` and `gnosis.stream` record to the
shared `QueryAuditLog` (the SAME log the `rag.query`/`rag-stream` handlers use),
with the SAME entry shape as `rag.query`:

```ts
auditLog.record({
  query,
  filters: (args.filters as RagQueryFilters) ?? null,
  mode: mode as 'flat' | 'graph' | 'vector' | 'hybrid',
  resultCount: <the result chunk's result.results.length, or 0 for an error chunk>,
  timestamp: new Date().toISOString(),
  requester: 'mcp',
})
```

- **`gnosis.query`:** `resultCount = result.results.length`.
- **`gnosis.stream`:** `resultCount` = the single `result` chunk's
  `result.results.length` (0 if the stream yielded an `error` chunk).
- **`gnosis.status`:** NO audit entry (read-only).
- **`QueryAuditEntry.mode` widening (additive):** the `mode` field type is
  widened from `'flat' | 'graph'` to `'flat' | 'graph' | 'vector' | 'hybrid'`
  (the gnosis tools pass the proxy's full four-member mode set). Existing
  `rag.query`/`rag-stream` entries stay byte-equal (their modes are flat/graph).
  This is the ONE change to `src/main/query-audit.ts` in this unit.
- **Skip-when-absent:** when `auditLog` is null/absent, the handlers skip
  recording (no throw) — the same discipline as `rag.query`.

### 5.4 `McpServerOptions.engineRagStore` injection + boot-time construction + `baseUrl` source

**A4:** the proxy is constructed at boot UNCONDITIONALLY (construction does no
I/O — Unit GN §5.1) and injected into `McpServerOptions`.

**`McpServerOptions` (mcp-server.ts lines 1349–1405):** a new optional field:

```ts
/** Unit GN-MCP-UI §5.4 — the LANDED createEngineRagStore proxy (the retrieval
 *  trio + health over the F2 wire contract). The `gnosis.*` tools are handled
 *  in MAIN against this proxy (never routed to the renderer). Injected like
 *  `retrievalEngine`. */
engineRagStore?: EngineRagStore
```

The `ProvidentMcpServer` constructor captures it (`this.engineRagStore =
opts.engineRagStore ?? null`), and `registerTools` gains a matching parameter
threaded through the `createServer` + `applyGatePatch` widen call sites.

**Boot-time construction (main.ts):** the proxy is constructed UNCONDITIONALLY
at boot:

```ts
const engineRagStore = createEngineRagStore({ baseUrl: resolveEngineBaseUrl() })
```

- **Construction does no I/O** (Unit GN §5.1 — the factory throws only on a
  null/missing/non-loopback `baseUrl`; it never contacts the engine).
- **Do NOT await `waitForReady` at boot** — the engine may be absent (D2); the
  boot must not block on it. The proxy is injected in its constructed (not
  necessarily READY) state; each RAG call observes READY itself (Unit GN §5.6).
- **Do NOT expose `waitForReady` as a tool** — it is a shell-side convenience
  (Unit GN §5.10), NOT a D4 parity feature.

**`baseUrl` source (A4):** resolved in this order:

1. **A config seam** — a config value (NOT a credential), e.g. an
   operator-settings/engine config value. When set, it wins.
2. **The env var `PROVIDENT_ENGINE_BASE_URL`** — e.g.
   `PROVIDENT_ENGINE_BASE_URL=http://127.0.0.1:8080`.
3. **A documented default** — `http://127.0.0.1:8080` (the guide §2 example
   bind; the exact port is configurable via the seam/env).

The resolved `baseUrl` MUST be a loopback address (the proxy throws at
construction on a non-loopback address — Unit GN §5.1). `baseUrl` is NOT a
credential (A7) — it is env/CLI config, not a GUI-only secret.

### 5.5 D4 parity scope (the GUI screens + the `EngineRagResult` render path)

**A5:** the first wiring unit is scoped to the three MCP tools + a status/health
GUI screen + a query GUI screen. Do NOT require GUI+MCP for every engine feature
in this unit.

**The status screen — an OPERATOR pane (the secure-panels pattern):**

- **Pane id:** `'gnosis-status'`; **scope:** `'operator'` (isolated
  `createIsolatedScope()` GraphScope, the `settings`-pane pattern — §5.4 of
  `unit-h-sidebar-panes.md`). It renders in the `#operator-panes` mount, NOT the
  app Runtime graph, so **engine state stays out of `get_rendered_html`** (an
  agent cannot read it, list it as a target, or dispatch on it).
- **Content:** a provident-authored `LegacyNodeData` section rendering the
  `HealthReport` (`state`, `version`, `subsystems` flags, `lastError`) + an
  **unavailable state** when the engine is absent (D2 — §5.6). A null report →
  the unavailable state (never a TypeError).
- **Data source:** a new bridge method (e.g. `bridge.gnosis.status()`) → an IPC
  → main → `engine.getEngineStatus()`. The operator pane's handler bodies reach
  the bridge via `window.provident.sidebar` (the M2 pattern) — NEVER an MCP tool.

**The query screen — an APP-GRAPH pane (the search-pane pattern):**

- **Pane id:** `'gnosis-query'`; **scope:** `'app-graph'` (renders in the app
  Runtime graph → MCP-visible, like the `search` pane). It is **gated fail-closed
  on the `gnosis` group** — the pane's handler checks the security settings (the
  M13 handler-gate pattern) and fails closed when the `gnosis` group is off.
- **Content:** a provident-authored `LegacyNodeData` subtree rendering the
  `EngineRagResult` (`query`, `results[]` with `documentId`/`nodeId`/`score`/
  `snippet`/`source`, `citations[]`, `trace` mode, `blockedBy?`). A null result →
  an empty state (never a TypeError).
- **Data source:** a new bridge method (e.g. `bridge.gnosis.query(query, opts?)`)
  → an IPC → main → `engine.ragQuery(...)`. The handler body reaches the bridge
  via `window.provident.sidebar` — NEVER an MCP tool.

**The NEW `EngineRagResult` render path (A5):** the GUI needs a render path for
the proxy-specific `EngineRagResult` shape, DISTINCT from the local `RagResult`
render path (`searchContent` renders `RagQueryResult` — `ranked`/`context`/
`markdown`/`lineMap`/`k`). A new pure render helper is added (e.g. in
`pane-graph.ts` or a new `gnosis-pane.ts` module):

```ts
/** Unit GN-MCP-UI §5.5 — the gnosis-query pane content: renders the
 *  proxy-specific EngineRagResult (query/results/citations/trace/blockedBy).
 *  DISTINCT from searchContent (which renders the local RagQueryResult). A null
 *  result → the empty state (never a TypeError). PURE. */
export function gnosisQueryContent(ctx: PaneContext, result: EngineRagResult | null): LegacyNodeData
```

And the operator status pane content:

```ts
/** Unit GN-MCP-UI §5.5 — the gnosis-status operator pane content: renders the
 *  HealthReport (state/version/subsystems/lastError) + the unavailable state
 *  when the engine is absent. A null report → the unavailable state. PURE. */
export function gnosisStatusContent(ctx: PaneContext, report: HealthReport | null): LegacyNodeData
```

**Provident-framework constraint (A5):** BOTH screens MUST be provident-authored
data (envelope nodes / handler bodies / component bindings) driven through the
producing graph — NEVER hand-written HTML/DOM in the renderer. A screen rendered
outside the provident graph is a review finding (the project-wide constraint,
AGENTS.md).

**Registration:** `GnosisPanes.registerPanes()` (`src/renderer/gnosis-panes.ts`)
registers + enables both panes (`'gnosis-status'` operator + `'gnosis-query'`
app-graph) and registers the handler defs via `registerHandlerDef` (the M2
pattern) in the same call — the M2-style separate `bindHandlers()` split does
not apply to this host.

**Page-design note (repo divergence — the sibling convention):** this unit adds
two GUI screens, but **`docs/skills/designing-pages.md` is UNCHANGED/absent** —
this repo has NO `docs/skills/designing-pages.md` (only
`docs/skills/process-guardrails.md` exists in `docs/skills/`). Per the
established unit-t/unit-u4/unit-h8 convention
(`docs/specs/unit-t-markdown-import.md` line 883-884;
`docs/specs/unit-u4-contenteditable-editor.md` §"Page-design note";
`docs/specs/unit-h8-operator-editor.md` §"Page-design note"), **NO such skill
update is made** and no test-use-case coverage matrix / demo-page index is
touched. The two screens' page-design impact (provident authoring, the
operator isolated-scope MCP-invisibility, the app-graph fail-closed gate) is
documented in THIS spec (§5.5/§5.6).

### 5.6 D2 engine-absent surfacing (typed MCP error + GUI unavailable state)

**A6:** `EngineUnavailable` is surfaced consistently across the MCP + GUI
surfaces.

- **MCP tools:** the `gnosis.*` tool handlers propagate the proxy's typed
  `EngineWireError` (code + §11 httpStatus). A connection-refused →
  `EngineUnavailable` (503, `cause: 'connection-refused'`); a non-`Ready`
  observed state → `EngineUnavailable` (503, `cause: 'not-ready'` /
  `'unavailable-state'`); a malformed wire body → `EngineError` (502) /
  `TraceUnavailable` (502). The MCP tool error surfaces the typed code +
  httpStatus (Unit GN §5.4).
- **GUI status pane:** when the engine is absent (the `getEngineStatus` bridge
  call rejects with `EngineUnavailable`), the `gnosis-status` operator pane
  shows the **unavailable state** (a provident-authored unavailable indicator),
  never a crash. The pane's handler catches the bridge rejection and renders
  the unavailable state.
- **GUI query pane:** when the engine is absent, the `gnosis-query` app-graph
  pane's handler fails closed (the `gnosis` group gate) and/or surfaces the
  `EngineUnavailable` as an empty/error state — never a crash.

**Mock-transport happy-path testing (A6):** the happy path MUST be tested with
the proxy's injectable `fetch`/`sse` (mock transport) — the TestWriter injects
a mock `fetch`/`sse` into `createEngineRagStore` (Unit GN §5.1) so the wiring
tests exercise the real proxy against a deterministic mock transport, NOT a live
engine.

**Engine-absent testing (A6):** the engine-absent path is tested via
connection-refused → `EngineUnavailable` — the TestWriter injects a
connection-refused `fetch` (e.g. `throwingFetch('ECONNREFUSED')`, the Unit GN
greens pattern) and asserts the MCP tool throws `EngineUnavailable` (503) and
the GUI status pane shows the unavailable state.

### 5.7 Property register (PBT)

This is a CODE-BEARING unit, so the register is mandatory. Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §6/FS-n rows. **At most 8 rows.** Each row: id, the invariant it
pins, the generator/strategy that exercises it, and the deterministic pinned
seed + attempt budget (≤100 attempts/row, ≤400 total, stop-after-5). The
register is genuinely invariant-bearing (the `gnosis.*` tool schemas reject
credential args; the `gnosis` group is default-off; `gnosis.stream` collects
single-shot chunks deterministically; the audit-log records `gnosis.query`/
`gnosis.stream` but not `gnosis.status`; the D2 engine-absent surfacing is
consistent across MCP + GUI; the tool-name → group mapping is total/
unambiguous).

| Property-id | Class | Invariant | Strategy-id | Observable-as-property |
|---|---|---|---|---|
| `P-IM-1` | IM | **The `gnosis.*` tool schemas reject credential args.** NONE of the three `gnosis.*` MCP tools' `inputSchema` accepts a credential field — no `token`, no `tls`, no `ca`/`cert`/`key`, no `apiKey` (A7). | `strat:no-credential-args` | ∀ `tool ∈ {gnosis.query, gnosis.stream, gnosis.status}`: the tool's `inputSchema` has NO key in `{token, tls, ca, cert, key, apiKey}`. |
| `P-IM-2` | IM | **The `gnosis` group is default-off + `VALID_GROUPS` membership.** The default security config does NOT enable `gnosis`; `VALID_GROUPS` includes `'gnosis'`. (The tool-name → group mapping totality is P-TP-1's invariant, NOT this row's — the two rows are de-overlapped.) | `strat:group-default-off` | `defaultSecurityConfig().enabled` does NOT include `'gnosis'`; `VALID_GROUPS` includes `'gnosis'`. |
| `P-IM-3` | IM | **`gnosis.stream` collects single-shot chunks deterministically.** A single-shot chunk sequence (result+done or error+done) collects to the SAME array in order; the collection is a full consumption (no partial result committed). | `strat:stream-collect` | ∀ generated single-shot sequence `S` (one `result` or one `error`, then `done`): collecting the proxy's `ragStream` iterable over `S` yields exactly `S` in order. |
| `P-SM-1` | SM | **The audit-log records `gnosis.query`/`gnosis.stream` but not `gnosis.status`.** A `gnosis.query`/`gnosis.stream` call appends an audit entry; a `gnosis.status` call does NOT. | `strat:audit-recording` | ∀ generated `gnosis.query`/`gnosis.stream` call: the audit log gains exactly one entry (requester `'mcp'`); ∀ generated `gnosis.status` call: the audit log is UNCHANGED. |
| `P-SM-2` | SM | **The D2 engine-absent surfacing is consistent across MCP + GUI.** A connection-refused engine surfaces as `EngineUnavailable` (503) on the MCP tool AND as the unavailable state on the GUI status pane. | `strat:engine-absent` | ∀ generated connection-refused transport: the MCP tool throws `EngineUnavailable` (503, `cause: 'connection-refused'`); the GUI status pane renders the unavailable state. |
| `P-TP-1` | TP | **The tool-name → group mapping is total/unambiguous.** Every `gnosis.*` tool name resolves to exactly one group (`gnosis`); a `gnosis.*` name NOT in `TOOL_GROUPS` resolves to `null` (fail-closed, never a wrong group). | `strat:group-total` | ∀ `name ∈ {gnosis.query, gnosis.stream, gnosis.status}`: `groupForTool(name) === 'gnosis'`; ∀ generated unknown `gnosis.<other>` name: `groupForTool(name) === null`. |
| `P-TP-2` | TP | **`gnosis.stream` READY-gate determinism.** A non-`Ready` observed state → the typed `EngineUnavailable` (a tool-level throw); a `Ready` state → the collected chunks. The gate is a deterministic function of the observed state. | `strat:ready-gate` | ∀ generated `state ∈ {Ready, Starting, Degraded, Unavailable}`: `Ready` → the tool returns `{chunks}`; else → the tool throws `EngineUnavailable` (503). |
| `P-TP-3` | TP | **The `EngineRagResult` render path is distinct from the local `RagResult`.** The GUI query pane renders the proxy-specific `EngineRagResult` shape (`query`/`results`/`engine`/`citations`/`trace`/`blockedBy`), NOT the local `RagResult` fields (`ranked`/`context`/`markdown`/`lineMap`/`k`). | `strat:render-shape` | ∀ generated `EngineRagResult`: `gnosisQueryContent` renders the proxy-specific fields and does NOT reference `ranked`/`context`/`markdown`/`lineMap`/`k`. |

**Class tally:** IM ×3, SM ×2, TP ×3 = **8 rows ≤ 8** ✔.

**PBT-gate note (determinism/seeding):** the TestWriter's executed property layer
runs under the test runner with a **deterministic pinned seed**, **≤100
generated cases per register row**, **≤400 total cases** across the unit's whole
property layer, **stop-after-5** (report ≤5 distinct held/broken
counterexamples per row), and records each row as **held** or **broken** together
with its `Strategy-id`. The adversarial reviewer then reads this register with
the executed artifacts and performs a read-only PBT audit (per-row
over-strength reasoning, generator-coverage check, prose counterexamples,
negative-generator requests); reviewers never run generators.

**Reserved-variant discipline applied.** The generator restriction is
**well-formedness on the wiring side**: never generate a credential arg for a
`gnosis.*` tool (that is the P-IM-1 invariant, not a fail-state), never generate
a `gnosis.*` name outside the three pinned names (that is the P-TP-1
fail-closed case), and never generate a non-single-shot stream (that is the
proxy's own fail-state, Unit GN §5.9 — NOT an invariant row here).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`gnosis.query` happy:** a `gnosis.query` call with a well-formed query +
   opts → the handler calls `engine.ragQuery` and returns the `EngineRagResult`
   (the proxy-specific shape). The audit log gains one entry (requester `'mcp'`).
2. **`gnosis.query` with the full mode set:** a `gnosis.query` with
   `mode: 'vector'`/`'hybrid'` → the handler passes the mode through to the
   proxy (the four-member union) and returns the `EngineRagResult` with the
   corresponding `EngineVectorTrace`/`EngineHybridTrace`.
3. **`gnosis.stream` happy:** a `gnosis.stream` call → the handler fully
   consumes the single-shot iterable and returns `{ chunks: [{type:'result',
   result}, {type:'done'}] }` in order. The audit log gains one entry.
4. **`gnosis.stream` error-then-done:** a stream yielding
   `[{type:'error',code,message},{type:'done'}]` → the handler returns
   `{ chunks: [...] }` with the error chunk + done (resultCount 0 in the audit).
5. **`gnosis.status` happy:** a `gnosis.status` call → the handler calls
   `engine.getEngineStatus()` and returns the `HealthReport` (state `'Ready'`,
   all subsystems true, `lastError: null`). The audit log is UNCHANGED.
6. **`gnosis.status` Degraded:** a `gnosis.status` call when the engine reports
   `Degraded` → returns the `HealthReport` with `state: 'Degraded'` + a non-null
   `lastError` (a faithful projection — observing Degraded is NOT an error).
7. **Boot construction happy:** `createEngineRagStore({ baseUrl })` at boot →
   constructs without network I/O; the proxy is injected into `McpServerOptions`
   as `engineRagStore`. `waitForReady` is NOT awaited at boot and NOT exposed as
   a tool.
8. **`baseUrl` resolution happy:** the boot resolves `baseUrl` from the config
   seam → env `PROVIDENT_ENGINE_BASE_URL` → the default `http://127.0.0.1:8080`.
9. **Group registration happy:** the three `gnosis.*` tools register ONLY when
   the `gnosis` group is enabled; `groupForTool` returns `'gnosis'` for each;
   `defaultSecurityConfig().enabled` does NOT include `'gnosis'`.
10. **GUI status pane happy:** the `gnosis-status` operator pane renders the
    `HealthReport` (state/version/subsystems/lastError) as provident-authored
    data in the isolated GraphScope (NOT MCP-visible).
11. **GUI query pane happy:** the `gnosis-query` app-graph pane renders the
    `EngineRagResult` via the NEW `gnosisQueryContent` render path (distinct
    from `searchContent`), gated fail-closed on the `gnosis` group.
12. **Mock-transport happy:** the wiring tests inject a mock `fetch`/`sse` into
    `createEngineRagStore` and exercise the real proxy against the deterministic
    mock transport (no live engine).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`gnosis.query` with a null engine** → throws
   `Error('gnosis.query: no engine rag store configured')`.
2. **`gnosis.stream` with a null engine** → throws
   `Error('gnosis.stream: no engine rag store configured')`.
3. **`gnosis.status` with a null engine** → throws
   `Error('gnosis.status: no engine rag store configured')`.
4. **`gnosis.query` with an empty query** → throws
   `Error('gnosis.query: query must be a non-empty string')`.
5. **`gnosis.query` with a bad `topK`** (non-integer, <1, or >50) → throws
   `Error('gnosis.query: topK must be an integer in [1, 50]')`.
6. **`gnosis.query` with a bad `mode`** (outside the four-member union) → throws
   `Error('gnosis.query: mode must be "flat", "graph", "vector", or "hybrid"')`.
7. **`gnosis.query` with a bad `maxHops`** (non-integer, <1, or >5) → throws
   `Error('gnosis.query: maxHops must be an integer in [1, 5]')`.
8. **`gnosis.query` with a bad `expand`** (outside `none`/`parent`) → throws
   `Error('gnosis.query: expand must be "none" or "parent"')`.
9. **`gnosis.query` with a bad `maxParentContext`** (non-positive integer) →
   throws `Error('gnosis.query: maxParentContext must be a positive integer')`.
10. **`gnosis.query` with a malformed `filters`** → throws
    `Error('gnosis.query: filters malformed')` (the same shape checks as
    `rag.query`).
11. **`gnosis.query` connection-refused** → the MCP tool throws
    `EngineUnavailable` (503, `cause: 'connection-refused'`).
12. **`gnosis.query` when the observed state is not `Ready`** → the MCP tool
    throws `EngineUnavailable` (503, `cause: 'not-ready'` for
    `'Starting'`/`'Degraded'`, `cause: 'unavailable-state'` for `'Unavailable'`).
13. **`gnosis.query` with a malformed wire body** → the MCP tool throws
    `EngineError` (502) / `TraceUnavailable` (502) (the proxy's decode-then-
    validate outcomes).
14. **`gnosis.stream` when the observed state is not `Ready`** → the MCP tool
    throws `EngineUnavailable` (503) — the READY gate fires INSIDE the tool call
    (a tool-level throw, NOT an error chunk).
15. **`gnosis.stream` with a premature close before `done`** → the MCP tool
    throws `EngineUnavailable` (503, `cause: 'connection-refused'`); no partial
    result is committed (the full consumption within the call handles the SSE
    teardown).
16. **`gnosis.stream` with an empty query** → throws
    `Error('gnosis.stream: query must be a non-empty string')`.
17. **`gnosis.stream` with a bad `topK`** (non-integer, <1, or >50) → throws
    `Error('gnosis.stream: topK must be an integer in [1, 50]')`.
18. **`gnosis.stream` with a bad `mode`** (outside the four-member union) →
    throws `Error('gnosis.stream: mode must be "flat", "graph", "vector", or
    "hybrid"')`.
19. **`gnosis.stream` with a bad `maxHops`** (non-integer, <1, or >5) → throws
    `Error('gnosis.stream: maxHops must be an integer in [1, 5]')`.
20. **`gnosis.stream` with a bad `expand`** (outside `none`/`parent`) → throws
    `Error('gnosis.stream: expand must be "none" or "parent"')`.
21. **`gnosis.stream` with a bad `maxParentContext`** (non-positive integer) →
    throws `Error('gnosis.stream: maxParentContext must be a positive integer')`.
22. **`gnosis.stream` with a malformed `filters`** → throws
    `Error('gnosis.stream: filters malformed')` (the same shape checks as
    `rag.query`).
23. **`gnosis.stream` with a malformed SSE frame** → the MCP tool throws
    `EngineError` (502).
24. **`gnosis.status` connection-refused** → the MCP tool throws
    `EngineUnavailable` (503, `cause: 'connection-refused'`).
25. **`gnosis.status` with a malformed health report** → the MCP tool throws
    `EngineError` (502).
26. **Unknown `gnosis.*` name** → the handler throws
    `Error('unknown gnosis tool: <name>')`.
27. **A `gnosis.*` name NOT in `TOOL_GROUPS`** → `groupForTool` returns `null`
    (fail-closed — never resolves to `gnosis`).
28. **GUI status pane engine-absent** → the `gnosis-status` operator pane shows
    the unavailable state (the bridge rejection is caught, never a crash).
29. **GUI query pane engine-absent / group-off** → the `gnosis-query` app-graph
    pane fails closed (the `gnosis` group gate) and/or surfaces the
    `EngineUnavailable` as an empty/error state — never a crash.

**`gnosis.stream` validation note (F4):** the `gnosis.stream` validation
fail-states (16–22) mirror the `gnosis.query` validation fail-states (4–10)
with the `gnosis.stream:` prefix — the two tools share the IDENTICAL
`inputSchema` (§5.1), so the same field checks apply and the same messages are
thrown with the tool's own name prefix.

**Pinned non-throws:** observing a `Degraded` state via `gnosis.status` is NOT
an error (the proxy reports it faithfully). A `gnosis.status` call does NOT
record an audit entry (read-only). The boot construction does NOT await
`waitForReady` and does NOT block on an absent engine.

### 5.10 Census / numeric claims

- **New MCP tools:** **3** (`gnosis.query`, `gnosis.stream`, `gnosis.status`).
- **New `ToolGroup` union member:** **1** (`'gnosis'`).
- **New `TOOL_GROUPS` rows:** **3** (one per `gnosis.*` tool).
- **New `VALID_GROUPS` members:** **1** (`'gnosis'`).
- **New `ALL_TOOLS` rows:** **3** (the three `gnosis.*` names).
- **New `McpServerOptions` field:** **1** (`engineRagStore?: EngineRagStore`).
- **New main-process handler:** **1** (`handleGnosisTool`).
- **New main-handled routing branch:** **1** (`name.startsWith('gnosis.')`).
- **Audit-log recording:** `gnosis.query` + `gnosis.stream` record; `gnosis.status`
  does NOT. **2** recording tools, **1** non-recording tool.
- **`QueryAuditEntry.mode` widening:** `'flat' | 'graph'` → `'flat' | 'graph' |
  'vector' | 'hybrid'` (additive; existing entries byte-equal).
- **New GUI panes:** **2** (`gnosis-status` operator, `gnosis-query` app-graph).
- **New render helpers:** **2** (`gnosisQueryContent`, `gnosisStatusContent`).
- **New bridge methods:** **2** (`gnosis.status`, `gnosis.query`).
- **`baseUrl` default:** `http://127.0.0.1:8080` (config seam → env
  `PROVIDENT_ENGINE_BASE_URL` → default).
- **PBT register:** **8 rows** (IM ×3, SM ×2, TP ×3), ≤100 attempts/row, ≤400
  total, stop-after-5, deterministic pinned seed.
- **Test-count expectation:** the TestWriter's red set covers §5.8 (12 happy
  states) + §5.9 (29 fail-states) + the PBT register (§5.7). The exact count is
  the TestWriter's; the spec pins the state surface, not the count.

### 5.11 Cross-references

- **The proxy being wired (the authoritative surface):**
  `docs/specs/unit-gn-engine-integration.md` — §5.1 (the proxy surface:
  `ragQuery`/`ragStream`/`getEngineStatus`/`health`/`waitForReady`; the
  `EngineRagResult`/`RagChunk`/`HealthReport` shapes; the typed error model),
  §5.4 (the §11 HTTP-status map + `EngineWireError`), §5.6 (D2 engine-absent),
  §5.10 (census). This unit consumes the proxy; it does NOT re-spec it.
- **The implementation guide:**
  `../Gnosis/docs/integrations/astrographer-interface-implementation.md` — §2
  (the transport decision), §4.6 (the retrieval trio — the scoped deliverable),
  §5 (the HTTP-status map), §7 (D2 engine-absent behavior), §8 (loopback +
  auth/TLS — the D4 carve-out), §9 (D4 MCP-GUI parity), §10 (the checklist).
- **The MCP endpoint spec (the contract to update — A9):**
  `docs/specs/mcp-endpoint.md` — §3 (the tool table — the three `gnosis.*` tools
  are added), §6.2 (the group table — the `gnosis` group is added, default-off).
- **The security tool groups:** `src/main/security.ts` — `TOOL_GROUPS`/
  `VALID_GROUPS`/`defaultSecurityConfig`/`groupForTool` (the `'gnosis'` group is
  added).
- **The MCP server:** `src/main/mcp-server.ts` — `McpServerOptions` (the
  `engineRagStore` field), `ALL_TOOLS` (the three names), `registerTools` (the
  `gnosis.*` branch + the threaded `engineRagStore`), the ~line 1977 main-handled
  branch.
- **The renderer pane pattern:** `src/renderer/pane-registry.ts` (the
  `PaneScope`/`PaneDefinition`/`PaneRegistry`), `src/renderer/sidebar-panes.ts`
  (the host's `registerPanes`/`bindHandlers`/`mountOperator`), `src/renderer/
  pane-graph.ts` (the `searchContent`/`settingsContent` patterns + the new
  `gnosisQueryContent`/`gnosisStatusContent`).
- **The Astrographer conventions:** `docs/specs/unit-h-sidebar-panes.md` §5.4
  (the operator isolated-scope pattern), `docs/specs/unit-k-sidebar-panes-host.md`
  §5.3/§5.4 (the pane registration + operator mount), `docs/specs/unit-j-mcp-security-hardening.md`
  §5.2 (the five-seam gate invariants — the `gnosis` group follows the same
  pattern).
- **Decision rows to add when the unit lands (A9):** `docs/decisions.md` —
  **GNOSIS-TOOL-NAMING-GROUP**, **GNOSIS-MAIN-ROUTING-AUDIT**,
  **GNOSIS-STREAM-OVER-MCP**, **GNOSIS-ENGINE-LIFECYCLE**, **GNOSIS-D4-PARITY-SCOPE**,
  **GNOSIS-D2-ENGINE-ABSENT**, **GNOSIS-SECURITY-CARVE-OUT**,
  **GNOSIS-HEALTH-AS-TOOL**, **GNOSIS-CONTRACT-SPEC-UPDATE**; consumed
  **ENGINE-WIRE-CLIENT** (Unit GN). **D4-MCP-GUI-PARITY is a guide §9 concept,
  NOT a `docs/decisions.md` row** — it does not exist in `docs/decisions.md`
  (verified: no `D4-MCP-GUI-PARITY` row there). The A9 contract-spec update
  must NOT chase a phantom `D4-MCP-GUI-PARITY` decision row; the guide §9
  parity concept is referenced only as a guide cross-reference (§5.11), never
  as a decisions.md row to add or consume.

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for the wiring from §5.8/§5.9, and asserts the
PBT register (§5.7) holds. The red set (recorded in the next-steps DONE row for
this unit):

- **The `gnosis.*` MCP tools:** the happy states 1–6 + the fail-states 1–26
  (null engine 1–3, arg validation 4–10 + 16–22, connection-refused 11/24,
  not-ready gate 12/14, malformed wire body 13, premature close 15, malformed
  SSE frame 23, unknown name 26).
- **The `gnosis` group + `security.ts`:** the happy state 9 + the fail-state 27
  (the group is default-off; the tool-name → group mapping is total/
  unambiguous; a `gnosis.*` name NOT in `TOOL_GROUPS` → `null`).
- **The main-process routing + audit log:** the happy states 1, 3, 5 (the audit
  records `gnosis.query`/`gnosis.stream`, not `gnosis.status`) + the PBT
  register P-SM-1.
- **The `McpServerOptions.engineRagStore` injection + boot construction + the
  `baseUrl` source:** the happy states 7, 8 (construction does no I/O; the
  `baseUrl` resolution order; `waitForReady` NOT awaited at boot / NOT a tool).
- **The D4 parity scope (the GUI panes + the `EngineRagResult` render path):**
  the happy states 10, 11 + the fail-states 28, 29 (the status pane's
  unavailable state; the query pane's fail-closed gate; the `EngineRagResult`
  render path is distinct from the local `RagResult`).
- **The D2 engine-absent surfacing:** the fail-states 11, 14, 15, 24, 28, 29
  (connection-refused → `EngineUnavailable` on the MCP tool + the GUI status
  pane's unavailable state) + the PBT register P-SM-2.
- **The security carve-out + the no-credential-arg test:** the PBT register
  P-IM-1 (no `gnosis.*` tool's `inputSchema` accepts a credential arg).
- **The PBT register (§5.7):** the 8 invariant rows (deterministic pinned seed,
  ≤100 attempts/row, ≤400 total, stop-after-5).
- **The mock-transport happy path:** the happy state 12 (the wiring tests inject
  a mock `fetch`/`sse` into `createEngineRagStore` and exercise the real proxy
  against the deterministic mock transport).
