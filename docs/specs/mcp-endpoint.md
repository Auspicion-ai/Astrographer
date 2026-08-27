# Spec — MCP Endpoint Contract (Provident-Electron)

Status: LANDED (2026-08-21). This repo's behavior contract (AGENTS.md item 5):
full synthetic-event access + rendered-HTML visibility for MCP endpoints, for
agentic use and debugging exposure. It implements the upstream project's
parked **Phase C** (cross-process MCP/Electron endpoint —
`../Preempt-Providence/docs/pending.md`, decisions.md EVENT-DISPATCH-WIRING
Phase C) as a CONSUMER: no engine, no adapter, no render change.

## 1. Scope

An Electron shell ("Provident-Electron") runs the provident-ssr producing
process (the Phase B contract's P1 pattern) in the renderer, mounts the demo
into the DOM (`DomAdapter`) and mirrors the same op stream into an
`SSRFragmentAdapter`. An MCP server in the main process exposes the app to
agents over two transports. The MCP tools are the "endpoints": the
read/dispatch surface (§3), the code-authoring CRUD surface (§4 — edit the
envelope that drives the graph, e.g. hooks/handler bodies, then re-load).

The producing graph is authoritative: a synthetic event mutates the graph
(Phase A `Supervisor.dispatchEvent` + the flush); the HTML is a view
(re-emitted on demand). This is the Phase B graph-canon / fragment-is-a-view
pin — the HTML never "reacts" on its own.

## 2. Transports

| Transport | Selector | Binding |
| --- | --- | --- |
| Streamable HTTP (default) | `--mcp-transport=http` / `PROVIDENT_MCP_TRANSPORT=http` | `http://127.0.0.1:<port>/mcp` (default 3787; `--mcp-port` / `PROVIDENT_MCP_PORT`) |
| stdio | `--mcp-transport=stdio` / `PROVIDENT_MCP_TRANSPORT=stdio` | the process's stdin/stdout (JSON-RPC) |

Notes:
- The HTTP transport requires `globalThis.crypto` (Node ≥19 / Electron ≥20
  embedded Node). The plain-Node dev shell (v18) cannot serve the HTTP path —
  verified inside Electron only. stdio is the plain-Node fallback.
- The main process is bundled CJS (`main.cjs`) because Electron's ESM main
  cannot `require()` CJS node builtins (the MCP SDK needs them).
- The HTTP transport is STATELESS: a fresh McpServer + transport per POST
  (the SDK's canonical stateless pattern); GET/DELETE → 405.
- The renderer's CSP must allow `'unsafe-eval'` — provident-ssr instantiates
  function-STRING handler bodies via `new Function` at translate; a strict CSP
  silently skips every string-body handler (REQ-GAP-7).

## 3. Tools (the MCP surface)

| Tool | Input | Returns |
| --- | --- | --- |
| `provident.dispatch` | `{ target, event, args?, requestId? }` | `{ results, dirtied, renderedHtml, ssrHtml }` (the engine's `dispatchAndReport` derives `dirtied`; a duplicate `requestId` echoes the first report — no separate `deduplicated` field is surfaced) |
| `provident.get_rendered_html` | `{}` | `{ renderedHtml, ssrHtml, census }` |
| `provident.get_markdown` | `{}` | `{ markdown, census }` (0.2 Feature 2 — the simplified text-only output document for agentic consumers) |
| `provident.list_targets` | `{}` | `{ nodes: [{ nodeId, cssId?, propsId?, type, content, state, inTree, handlers }] }` |
| `provident.get_node_state` | `{ target }` | `{ nodeId, states, census }` |
| `provident.journal` | `{ action: 'undo'\|'redo'\|'replay' }` | `{ status, scheduledDirtied, stackTopKind?, redoTopKind?, baseBoundary, renderedHtml, ssrHtml, warnings }` (the engine's `UndoRedoReport` surfaced faithfully — docs/FORKER.md §4 J2/J3) |

### 3.1 `provident.dispatch`

Synthetic-event access (the goal #1 surface). Semantics (imported Phase A/B +
the 0.1.1 shared dispatch-report surface, ssr-synthetic-event.md §3):

- **target** — the Phase B two-vocabulary addressability:
  `{ kind: 'cssId', cssId }` (ergonomic, authored), `{ kind: 'nodeId',
  nodeId }` / `{ kind: 'wire', wire }` (authoritative), or a bare string
  resolved css.id → props.id → nodeId. Host-side resolution only
  (REQ-GAP-2); an unknown/unresolvable target → the tool throws
  `unresolved target: {…}` (a missing cssId is an ERROR, never empty results;
  D10, 2026-08-23).
- **event / args** — `Supervisor.dispatchAndReport(nodeId, event, options,
  ...args)` (the shared engine surface). `args` MUST be an ARRAY (spread into
  the call) of structured-clone-safe JSON (the Phase C concern); the handler's
  first-arg semantics depend on the handler's authored convention
  (REQ-GAP-1: modern `(ctx, value)` default vs `format: 'legacy'`). A non-array
  `args` (e.g. a bare string) is spread into its characters — the first char
  becomes `event.value` (D7, 2026-08-23).
- **flush-before-response** — `dispatchAndReport` awaits the engine's public
  `flush()` internally (deterministic settle; no host tick loop), then derives
  `dirtied = apply().dirtied ∪ keys(takePass2States())` (bounded,
  non-draining).
- **re-render** — the host then refreshes its render baseline from the
  NON-draining resolved store (`getResolvedStates` for each dirtied id) and
  re-emits through the canonical `renderProducingProcess` loop (REQ-GAP-5/8,
  with the opt-in `nodeIdAttribute` threaded) against BOTH adapters — the
  response carries the fresh `renderedHtml` (live `#app`) + `ssrHtml` (SSR
  re-emit).
- **dirtied** — engine-derived (see above); a duplicate `requestId` echoes the
  first caller's report.
- **requestId** — idempotency is ENGINE-owned: `dispatchAndReport`'s opt-in
  bounded LRU dedup (ssr-synthetic-event.md §3.3) — a duplicate within the
  window (same requestId AND same (target, event)) returns the FIRST caller's
  report. No host-side dedup.

### 3.2 `provident.get_rendered_html`

Rendered-HTML visibility (goal #2 surface). Returns the live DOM innerHTML of
the mount, the SSR fragment re-emitted from the SAME graph (PAR-5 parity
view), and a node/compile census (registered / in-tree / unplaced / destroyed
/ prototypes) for debugging exposure. Every emitted element carries
`data-node-id="<engine nodeId>"` (the opt-in `nodeIdAttribute` render option,
REQ-GAP-3/A2) in BOTH views — so an agent reading the HTML can trace each
element back to its producing graph node (element → `data-node-id` →
`Supervisor` node → compiled state → `provident.dispatch`/`get_node_state`).

### 3.3 `provident.get_markdown`

Rendered-markdown visibility (0.2 Feature 2 — the simplified output document
for agentic consumers). Re-emits the CURRENT graph through a fresh
`MarkdownAdapter` (the DomAdapter/SSRFragmentAdapter family's text-only
member) and returns the markdown text + the census. The adapter is a pure
op-stream consumer (D15) — it renders the same actionable set the DOM/SSR
views use, but emits markdown text.

- **Non-interactive (ruling 15/16)**: `on:*` AND `data:*` props (incl. the
  opt-in `data-node-id`) are DROPPED — the markdown output carries no event
  surface and no element→node mapping. For element→node tracing use
  `get_rendered_html` (the DOM/SSR surface).
- **Text-only**: headings/lists/emphasis/links map to markdown constructs;
  `css:classes`/`css:style` are dropped (emphasis comes from the element
  TYPE, D5).
- **On request (ruling 14)**: a fresh `MarkdownAdapter` per call (D10 —
  instance-bound prevMap; never a stale one). The host chooses the adapter at
  emit; nothing is embedded by default.
- **Empty graph → `''`** (D11).

### 3.4 `provident.list_targets`

The addressable vocabulary for `provident.dispatch` + debugging: every live
node's nodeId, authored css.id, authored props.id, type, content, state,
in-tree flag, and declared handlers (event/phase/name). Exposes both id
vocabularies per node (REQ-GAP-3).

### 3.5 `provident.get_node_state`

The node's pass-2 resolved compiled states (read-only snapshot via
`supervisor.getResolvedStates`) + the census. For an agent inspecting why a
node resolved/unresolved after a dispatch.

### 3.6 `provident.journal` (journal reversibility — undo/redo/replay)

> **Implementation status (2026-08-26): LANDED.** The journal reversibility
> endpoint (docs/FORKER.md §4 J3-J8) is implemented: the `graph`-group
> tool drives the engine's `Supervisor.undo()`/`redo()`/`replay()` (provident-ssr
> 0.2.1 `UndoRedoReport` surface) and re-renders. Tests `tests/journal-endpoint.test.ts`
> (19) + the adversarial destroy-undo/malformed-action/replay-clears-redo/double-undo/
> dispatch-not-undoable/id-index-coherence/fail-closed-gate/teardown-load-no-op pins.
> **Note**: `base-boundary` status is latent — the host never sets `maxJournalLength`,
> so condense never fires and `_restoreBase` never runs (pending.md GAP 1).

The engine's journal surface (`Supervisor.undo()`/`redo()`/`replay()`) is
exposed to agents as a single `provident.journal` tool with a discriminated
`action` input. It mutates the app graph and re-renders both views.

- **action** — `'undo'` (invert the top of the undo stack), `'redo'` (re-apply
  the undone op, no-journal), `'replay'` (re-run the journal in order). A
  malformed/non-string action is rejected at the zod boundary + the Runtime
  (`unknown journal action`).
- **status** — the engine's `UndoRedoReport.status`: `'applied'` (real work
  ran), `'no-op'` (empty stack / unresolved / terminal-destroy), or
  `'base-boundary'` (undoStack empty because truncated at the condensed base).
- **scheduledDirtied** — the markPass2-SCHEDULED (pending-flush) set from the
  engine report. The host AWAITS the flush + drains pass-2 before re-rendering
  (upstream undo-redo-report §2.5), so the returned `renderedHtml`/`ssrHtml` reflect the
  settled post-op state.
- **stackTopKind / redoTopKind** — the post-op undo/redo stack tops (the next
  undoable/redoable op kind), if any.
- **baseBoundary** — true when the undo cursor sits at the condensed base
  (further undo is a guarded no-op).
- **G14 per-kind contract** — undo is EXACT for `state-slice`/`attach`/
  `rows-mint`, a PINNED NO-OP for `destroy`, and a DOCUMENTED NO-OP for
  `detach`/`move`/`clone-instance`/`layer-apply`/`placement-attach`/`rows-clear`
  (ops.md §6). The tool surfaces the engine's report verbatim — a no-op is
  never silent. **Package finding (UNDO-REDO-DESTROY-STATUS)**: the engine
  currently reports `status:'applied'` for a destroy-undo (a pinned no-op) with
  an empty `scheduledDirtied`; recorded in `docs/defects.md` + `docs/HANDOFF.md`.
- **J3 — base-restore** — a replay/undo/redo that hits the condensed `base`
  marker triggers a quiet graph-REPLACE (fresh seed objects). The host rebuilds
  its `nodes`/`rootNode` caches + id index from the live graph before
  re-rendering, so export/validate/shapeSig stay coherent.
- **J7 — no requestId** — undo/redo/replay take no payload and are intrinsically
  non-idempotent (a double-undo undoes two ops). No `requestId` field.
- **J8 — app-Runtime-only** — the tool targets the app Runtime's single
  `Supervisor`, never the isolated SecurePanels graph.
- **Live-change notification** — `journal` is in `MUTATING_METHODS`, so the
  `resources/updated` push fires after a successful journal op (stdio-only).

### 3.7 MCP resources (read-only `mcp://` URIs)

> **Implementation status (2026-08-25): LANDED.** The gated read-group
> resources (`docs/FORKER.md` §4 R1-R5 digest) are implemented: the
> three URIs below are registered on the MCP server, gated with the `read`
> tool group (R1 — never always-registered), live re-gated on `applyGatePatch`
> (R2), registered in both transport builds (R3), node-template reads validate
> in-tree + never reach the isolated SecurePanels graph (R4), always-fresh +
> per-resource mimeType (R5). Tests: `tests/mcp-resources.test.ts` +
> `tests/mcp-resources-adversarial.test.ts`.

Alongside the tools, an agent can READ rendered state declaratively via `mcp://`
URIs (the SDK's resource surface). Each resource mirrors a `read`-group tool and
is registered ONLY when the `read` group is allowed — a human disabling `read`
shuts off the resources too (R1, no always-registered bypass door).

| Resource (URI) | Mirrors | mimeType | Notes |
| --- | --- | --- | --- |
| `mcp://provident/app` | `provident.get_rendered_html` | `text/html` | always-fresh; a large read may return `{census,digest,preview,truncated}` |
| `mcp://provident/targets` | `provident.list_targets` | `application/json` | concrete node URIs are discoverable only here (`resources/list` lists the template, not concrete nodes) |
| `mcp://provident/node/{nodeId}` | `provident.get_node_state` | `application/json` | template; the nodeId is validated against the live in-tree graph |

The resource read callbacks forward over the SAME `RendererBackend` IPC the
tools use (main → renderer → app Runtime) — never the isolated SecurePanels
graph (R4). Reads are always-fresh point-in-time snapshots; a client must not
cache a resource URI's content across a dispatch. The companion
live-change-notification row is LANDED 2026-08-25 as the invalidation answer: a
stdio-only, app-Runtime-sourced `notifications/resources/updated` after a
mutating app-graph op (see §8 Non-goals).

## 4. Code / data CRUD (the authoring surface — OUTSIDE the live graph)

The tools above READ the live graph + DISPATCH into it. This section adds a
**code-authoring CRUD** layer that operates on the **envelope** (the data
source of truth), NOT the live `Supervisor` graph — so an agent can
**create / read / update / delete** the functions and data (e.g. handler
bodies, `hooks.<name>` providers, component bindings) and then **re-load** the
envelope to materialize the change. This is "manipulating the code" without
touching graph internals — the graph is re-derived from the edited envelope via
the existing load path.

The envelope is JSON-safe (P-E6). Code (`handler`/`hook` bodies) rides as
function-STRING data (the legacy envelope format, translate.md §2) — bodies are
`new Function`-instantiated at translate, so a CRUD-edited body is recompiled on
the next load. This is the SAME data-authoring surface the upstream demos use
(`demo/handlers-scenarios.js`, `demo/hooks-scenarios.js` — handler bodies and
the `hooks: ['name', …]` declaration live in the envelope).

### 4.1 Tools (additive)

| Tool | Input | Returns | Semantics |
| --- | --- | --- | --- |
| `provident.code.get` | `{ path }` | the current envelope subtree/entry at `path` (or the whole envelope) | read the code/data as-is (raw JSON) |
| `provident.code.set` | `{ path, value }` | `{ ok, path, wrote }` | set the envelope value at `path` (string/object/array — includes a handler `{ name, event, phase, body, format }` entry, a `hooks` field, a `component` binding, a `props`/`css`/`content` value) |
| `provident.code.create` | `{ path, entry, ... }` | `{ ok, path, appendedAt }` | append a new entry to an ARRAY at `path` (e.g. push a new handler to `root.handlers`, a new component binding to `root.component`, a new content node to `content[0].content`) |
| `provident.code.delete` | `{ path, index? }` | `{ ok, removed }` | delete an entry at `path` (an array index, a `props.<key>`, a `hooks` member, a `component` binding) |
| `provident.code.validate` | `{ envelope? }` | `{ valid, warnings, shape }` | schema-validate an envelope (the current one or a proposed one): run the translate/`loadState`-boundary checks (envelope-mismatch, node-shape, handler format, hooks shape) and report `TranslatedTree.warnings` — WITHOUT building the graph |
| `provident.code.load` | `{ envelope? }` | `{ census, renderedHtml, ssrHtml, warnings }` | apply an edited envelope to the LIVE graph (the A2 `load` path — teardown the current content first, then translate/register/compile/render the new envelope) |
| `provident.code.loadBatch` | `{ ops }` | `{ census, renderedHtml, ssrHtml, warnings, ops }` | stage N `code.*` envelope ops (`[{op:'set'|'create'|'delete', path, value?/entry?/index?}]`) and re-derive ONCE. **All-or-nothing** (B2): the ops apply to a clone; on any failure the live envelope is untouched. **Ordered with dependencies** (B3): a later op can reference a path created by an earlier op. **Schema-validated** (B4): a malformed op is rejected. Returns the re-derive `LoadResult` + a per-op status array (B5). Throws "no envelope loaded" when there is no legacy envelope (B7). `code`-group (OFF by default). |

`path` is a JSON-pointer-style string into the envelope, e.g.
`template.root.children[0].handlers`, `template.root.hooks`,
`content[0].content[2]`, `template.root.component[0]`.

### 4.2 The example the user named — manipulating hooks

`hooks` live on a node as the authored `hooks: ['name', …]` field
(hooks-map-review §7 / hooks-map.md — the value-provider slot; the hook WRITE is
a runtime `clientAPI.apply(id, [{targetProp:'hooks.<name>', …}])`, but the
DECLARATION + the provider binding live in the envelope). The CRUD surface lets
an agent:

1. `code.get { path: 'template.root.hooks' }` → `['theme','user','counter']`
2. `code.create { path: 'template.root.hooks', entry: 'accent' }` →
   append a declared hook name
3. `code.set { path: 'template.root.component[2].reference', value: 'accent' }`
   (or create the provider `component` binding with a `value`)
4. `code.set { path: 'template.root.handlers[3].body', value: "<function src>" }`
   — author/edit the handler body (function-STRING data)
5. `code.validate` → re-translate the edited envelope; confirm the new handler
   compiles + no `handler-body-eval-blocked`/`handler-body-invalid` warnings
6. `code.load` → apply the edited envelope; the new `hooks` provider + handler
   are live in the graph (the existing `provident.dispatch`/`get_rendered_html`
   then drive/read it)

### 4.3 Ownership / pins

- **P-C1 — CRUD edits the envelope, never the graph directly.** The live
  `Supervisor` is untouched until `code.load` re-derives it. This keeps the
  managed-channel pin (mutation only via `clientAPI.apply`) for RUNTIME writes
  and gives CRUD a separate, authoring-only surface. (The runtime hook WRITE is
  the graph-side `clientAPI.apply`; the envelope-side DECLARATION is
  `code.*`.)
- **P-C2 — re-load is the apply step.** `code.load` tears down the current
  graph (the battery's teardown path, per-child destroy + `dropPayload` +
  userData clear + settle-gate) then re-translates the edited envelope. This is
  an explicit "apply my edit" — the CRUD edits are staged until a `code.load`.
- **P-C3 — bodies are function-STRING data; CSP `'unsafe-eval'` is required**
  to materialize them at translate (REQ-GAP-7). The CRUD surface stores the
  string; the renderer's `new Function` (with the `'unsafe-eval'` CSP carve-out)
  instantiates it on load. A body that fails to evaluate surfaces as
  `handler-body-eval-blocked`/`handler-body-invalid` in `code.validate`/`load`
  `warnings` (R10).
- **P-C4 — schema-validated at the boundary.** `code.validate` (and `code.load`
  on write) run the same `translate`/`loadState` schema checks the framework
  enforces (envelope-mismatch, NodeSchema-shape, `hooks`/`hooksKind` closed
  unions, handler phase/format) — a malformed edit is rejected with the
  framework's own codes, never applied silently.
- **P-C5 — authoring is a bounded unit.** The CRUD tools are pure envelope
  manipulation (no graph, no render, no journal). The BLAST RADIUS is the
  envelope + one `code.load` re-derive.

### 4.4 Why this is NOT a package gap

Every field the CRUD touches (`hooks`, `handlers[].body`, `component` bindings,
`props`/`css`/`content`, the envelope top shape) is an EXISTING envelope field
(translate.md §1/§4, hooks-map.md). CRUD is host-side envelope editing + the
existing `translateLegacy`/`loadState` load path — no `provident-ssr` change.
If a host wants a richer authoring UX it may offer templated `code.create`
entry shapes, but the underlying surface is pure envelope JSON.

## 5. Process layout

```
┌─ main (CJS bundle) ──────────────────────────────┐
│  MCP server (McpServer)                           │
│    ├─ transport: stdio  (StdioServerTransport)    │
│    └─ transport: http   (StreamableHttpServer...) │
│  RendererBackend (IPC bridge, queues until ready) │
│  BrowserWindow (loads dist/renderer/index.html)   │
└───────────────┬───────────────────────────────────┘
                │ ipcMain/ipcRenderer: provident:invoke/reply/ready
┌───────────────▼───────────────────────────────────┐
│─ preload (contextBridge: window.provident) ───────┤
└───────────────┬───────────────────────────────────┘
┌───────────────▼──────────── renderer (ESM) ───────┐
│  Runtime: translateLegacy → Supervisor+EventBridge │
│           → register → compile → recordResolved    │
│           → DomAdapter render + SSRFragmentAdapter │
│  dispatch / renderedHtml / listTargets / nodeState │
└────────────────────────────────────────────────────┘
```

IPC payloads (`src/shared/types.ts`): `RpcRequest { id, method, payload }` /
`RpcReply { id, ok, value|error }` on `provident:invoke` /
`provident:reply`; `provident:ready` gates the backend until the renderer
boots. All payloads are JSON-safe (structured-clone).

## 6. Security & agent permissions (design — the A1 trust gate + manual-UI settings)

The architecture review (`archive/parent-project/2026-08-26-architecture-review.md`) made A1 **critical**
and A2..A6 required. This section is the design for MCP security + agent
permissions + the **manual-UI-only settings controls** a human operator uses to
set them up.

### 6.1 The threat model (why a gate is mandatory)

The engine's function-SOURCE security model is explicit: `new Function` executes
arbitrary code at translate and the renderer performs NO authorization of its
own — the backend/DB layer that accepts loadable handler definitions MUST gate
writes to admin/trusted-developer only (upstream translate.md, handlers.md). In
this architecture that "backend/DB layer" IS the MCP server. Without a gate:

- the renderer's eval gate (code-authoring → `new Function`) is reachable by ANY
  peer on loopback stdio or `127.0.0.1:<port>` — full renderer-context code
  execution with no authentication;
- `dispatch`/`load`/`export`/`teardown` mutate graph/state — lower-risk (no eval)
  but still destructive, and reachable by the same peer.

The manual-UI settings are how the HUMAN sets up the gate; the gate is OFF-by-
default for anything a human hasn't explicitly enabled.

### 6.2 Tool groups (the permission unit)

Every tool belongs to a GROUP; a group is enabled/disabled as a unit. A tool
whose group is disabled is not registered / not listed / returns an error.

| Group | Tools | Risk | Default |
| --- | --- | --- | --- |
| `read` | `get_rendered_html`, `get_markdown`, `list_targets`, `get_node_state`, `code.get`, `code.validate` | read-only (no mutation, no eval for `code.get`/`validate`* ) | **ON** |
| `dispatch` | `provident.dispatch` | mutates the graph (handler args, no eval) | **ON** |
| `graph` | `load`, `op`, `export`, `validate`, `teardown`, `journal` | mutates/re-derives the graph + the envelope re-load + journal reversibility | **OFF** (manual) |
| `code` | `code.set`, `code.create`, `code.delete`, `code.load` | WRITES + re-loads (eval via `new Function` on load) | **OFF** (manual) |

\* `code.validate` may eval a proposed body to check it compiles — treat it as
`code`-group when the body is evaluated; `code.get`/`code.validate`(shape-only)
are `read`. Split `code.validate` into `validate-shape` (read) vs `validate-eval`
(code) if a stricter split is wanted.

The `read` + `dispatch` defaults give an agent passive observation + synthetic
event driving of the ALREADY-LOADED graph (the stated "full synthetic-event
access + rendered-HTML visibility" goal) with NO capability to add code or
re-build the graph. Enabling `graph`/`code` is an explicit human grant.

### 6.3 The auth token

- Optional **loopback bearer token** for the HTTP transport: `--mcp-token`
  / `PROVIDENT_MCP_TOKEN`. When set, every HTTP MCP request must carry
  `Authorization: Bearer <token>` (or the SDK's `MCP-Token` header); a request
  without it is rejected (401) BEFORE any tool runs. stdio is spawn-local
  (the parent is the agent launcher) so it is not token-gated — stdio and the
  manual grant are the trusted path for code-authoring.
- A token alone does NOT enable `code`/`graph` — those need the group grant
  (below). Token = authentication (who); group = authorization (what).

### 6.4 Manual-UI-only settings controls

> **Implementation status (2026-08-25): LANDED.** The `SecurityGate` primitive +
> the MCP server gating + the HTTP 401 + the stdio re-gate (M1) + **the manual-UI
> Settings pane** are all implemented:
> - persistence (`src/main/security-store.ts` — a JSON store in userData, loaded
>   on boot, write-through);
> - the IPC bridge (`provident:security:get`/`set` via `ipcMain.handle`),
>   exposed to the renderer only through `window.provident.security` (preload);
> - the renderer Settings pane — **since 2026-08-25 rendered as provident data
>   in an ISOLATED graph** (`src/renderer/secure-panels.ts` + `#panes` —
>   `createIsolatedScope()` GraphScope, own Supervisor + DomAdapter, so the MCP
>   endpoints never see/dispatch it). Token show/clear/regenerate + one toggle
>   per tool group, re-wiring the LIVE MCP server on change + persisting. See
>   `archive/parent-project/2026-08-26-secure-panels.md`;
> - the MCP server is built from the persisted config on boot (default
>   `read`+`dispatch` ON / `graph`+`code` OFF / token null on first run).
> The settings surface is **manual-UI-only by construction**: the IPC channel is
> main→renderer→main, the MCP tool handlers never route to it, AND the pane
> lives in an isolated graph the MCP endpoints cannot read/dispatch.

The MCP security + agent permissions are configured **manually by the human
operator in the app UI only** — never via an MCP tool (an agent must not be
able to grant itself capabilities). A dedicated **Settings pane** in the
renderer (a "manual-UI-only" surface, reachable by the human in the Electron
window, NOT exposed over MCP):

- **Token**: show/clear the current loopback token; a button to regenerate
  (a random bearer token) — write-through to the main-process config.
- **Agent permission toggles**: one switch per tool group (`read` / `dispatch`
  / `graph` / `code`) reflecting the LIVE enabled set; toggling updates the
  running MCP server + persists.
- **Status**: whether the MCP server is up, which transport(s), the port, and
  which groups are currently enabled.
- **Persistence**: the settings are stored (a local JSON in userData, or
  Electron `settings`); reload/restart restores them. The DEFAULT on first run
  is `read`+`dispatch` ON, `graph`+`code` OFF.

Design: the renderer settings pane talks to main over IPC
(`provident:security:get` / `provident:security:set` — the preload exposes
`window.provident.security.get()`/`.set(patch)`). Main owns the config +
re-wires the MCP server tool-gating on change. The settings surface is
**manual-UI-only by construction**: the IPC channel is main→renderer→main and
the MCP tool handlers never route to it.

### 6.5 The A1..A6 host-side hardening (folded in)

> **Implementation status (2026-08-25):** A1 + A4 (`code.loadBatch`) + A5 + the A6
> stateless-HTTP idempotency half ARE landed. A2 (RendererBackend lifecycle
> timeouts), A3 (permanent CI divergence leg — the R13
> `scripts/electron-divergence.mjs` exists as a one-off, not a CI leg), and the
> A6 readiness-timeout half are NOT yet implemented. This section is the DESIGN
> for the remaining hardening.

- **A1** (above): the `code`/`graph` groups are OFF by default; `--mcp-allow`
  can pre-enable at launch; the manual UI is the operator gate. `dispatch` is
  lower-risk (structured-clone args, no eval) but is a documented trust grant.
- **A2**: RendererBackend per-request timeouts + reload re-arm (reject `pending`
  on `webContents.destroyed`/`did-finish-load` and re-ready the bridge); no
  silent demo-rebind — a reload resets the graph and the agent is told.
- **A3**: the Electron divergence check becomes a repeatable CI leg; `code.load`
  teardown IS `provident.teardown` (userData clear + settle-gate).
- **A4**: `code.load` is a **whole-graph teardown + translate + compile +
  render** per edit — NON-incremental (O(graph) per `code.load`, not O(edit)).
  The prior view is DESTROYED then rebuilt (a render discontinuity: the agent
  sees a fresh root-only mount, then the new graph's render — there is no
  in-place diff). The cost is O(nodes) translate + O(path-states) compile +
  O(elements) emit; for a 4095-element tree this is the ~2.8s enumeration pass,
  not a small patch. Documented here; `code.loadBatch`/write buffer (stage N
  edits, one re-derive) **LANDED 2026-08-25** — `provident.code.loadBatch(ops[])`,
  all-or-nothing clone-then-validate-then-commit, ordered-with-dependencies,
  pinned op schema, `LoadResult` + per-op status return, six-site `code`-group
  registration, no-envelope case, honest framing (round-trips + atomicity, NOT
  re-derive cost). Tests `tests/loadbatch.test.ts` + `tests/loadbatch-adversarial.test.ts`;
  edits accumulate on the envelope until an explicit `code.load`.
- **A5**: index authored css.id/props.id once at load (a Map rebuilt on
  load/teardown), not per-call `allNodes().find`.
- **A6**: readiness timeout on the backend; the stateless-HTTP idempotency
  consequence (fresh server per POST; dedup is per-supervisor, not per-session)
  is documented.

## 7. Pins (this repo)

- P-E1 **No package edit**: `node_modules/provident-ssr/` and
  `../Preempt-Providence/` are never modified; every gap lands in
  `docs/defects.md` + `docs/HANDOFF.md`.
- P-E2 **Graph-canon, fragment-is-a-view**: dispatch mutates the graph; the
  returned HTML is freshly re-emitted. Never "the HTML reacts".
- P-E3 **Two transports, one tool surface**: stdio and HTTP expose identical
  tools.
- P-E4 **Idempotent dispatch**: `requestId` dedup is ENGINE-owned (the 0.1.1
  opt-in bounded LRU — a duplicate echoes the first report). Exact echo within
  the window; best-effort under pressure (a dropped entry re-fires).
- P-E5 **Flush before response**: `dispatchAndReport` awaits the engine
  `flush()` internally; no result is returned before the apply cascade
  settled and the re-render ran.
- P-E6 **JSON-safe boundary**: args/results never carry live objects or
  functions (structured-clone discipline).
- P-E7 **Authored ids exposed**: `list_targets` reports css.id and props.id
  per node (both id vocabularies), so an agent can choose a target.
- P-E8 **data-node-id present (opt-in)**: every rendered element carries its
  engine nodeId in DOM and SSR views (the host opted in); presence is a
  renderer decision, never a reader assumption (ssr-synthetic-event.md §4).
- P-E9 **Envelope-authoring surface is host-side CRUD over the existing
  envelope fields** (no package change): `code.*` reads/writes the envelope
  JSON and re-loads via the existing `translateLegacy`/`loadState` path (the
  battery's A2/A1 load). No graph mutation except through the normal load/
  dispatch channels. Function bodies ride as string data (P-C3) — a hook
  provider, a `handlers[].body`, a `component` binding are all authored by
  `code.*`, materialized by `new Function` on load.

## 8. Non-goals

- No engine/adapter/render change (upstream-owned; REQ-GAP-1..6 are the
  catalogue, not this repo's fixes).
- No browser hydration path (browsers get real DOM events + hydration;
  render.md §7). Real DOM events are wired through the same `DomAdapter.onEvent`
  seam, but the MCP surface is synthetic-event + read.
- **Server push is stdio-only and content-level.** A live-change notification
  (`notifications/resources/updated` for `mcp://provident/app`) is delivered
  ONLY on the stdio transport (the HTTP transport is stateless — a fresh server
  per POST, no session — so a notify there is a no-op, never a hang). It fires
  after an app-graph MUTATING operation (dispatch/load/op/teardown/code.load),
  sourced ONLY from the app Runtime re-render (never the isolated SecurePanels
  graph — an operator action must not leak to the agent through the push). The
  current surface remains pull-based read-after-dispatch + this best-effort
  stdio-only push (see §3.6).

## 9. Verification

- `tests/runtime.test.ts` (9) pins the Runtime's MCP-facing operations against
  a DOM shim: bootstrap render, the opt-in `data-node-id` on every element
  (DOM = SSR), target listing, css.id dispatch mutation + re-render of both
  views, engine-derived `dirtied`, `event.value` echo, bare-string + unknown
  targets, engine-owned `requestId` dedup echo, node state.
- `tests/markdown-endpoint.test.ts` (4) pins the 0.2 MarkdownAdapter endpoint
  (`provident.get_markdown`): the live graph renders as markdown text
  (non-interactive — no `on:`/`data-node-id`), a dispatch mutation reflects in
  the markdown, and the def-prototype round-trip (Feature 1a) re-registers on a
  serialized-doc load.
- `tests/engine-surfaces.test.ts` (5) pins the adopted 0.1.1 shared surfaces
  directly (parity with the upstream contract): `dispatchAndReport`
  {results, dirtied} after an awaited flush, opt-in bounded `requestId` dedup
  (echo; a different key re-fires), `flush()` deterministic settle, the
  `data-node-id` opt-in (DOM + SSR), and the REQ-GAP-8 `renderOptions` threading.
- `tests/mcp-stdio-e2e.test.mjs` drives the standalone MCP server (builds
  `dist/main/standalone.mjs`) over BOTH transports with the official SDK
  client: the tools list + respond (stdio and Streamable HTTP).
- `tests/runtime-battery.test.ts` (28) pins the Runtime's battery + code-CRUD
  surface (the 5 graph tools + 6 code-CRUD tools backing methods +
  `warnings` R10 + the SSR-survives-reload regression + the H4/H5/H6
  adversarial fixes + the R6 settle-gate quiescence). `tests/path-fork-cycle.test.ts` (9) pins the cycle-variant
  envelope. `tests/e2e-battery.test.mjs` drives the battery host
  (`dist/main/battery-host.mjs`) end-to-end: 93 checks green across the 4
  fork-stress d12 variants + landings + handlers + code-CRUD. `scripts/electron-divergence.mjs`
  is the R13 real-DOM-vs-shim divergence check (9/9 green).
- Real-Electron end-to-end (0.1.1, verified 2026-08-21): the SDK client talks
  to the running app over HTTP → IPC → renderer graph. `data-node-id` on all
  12 elements (DOM = SSR); `provident.dispatch` on `inc` mutated the graph and
  re-rendered both views with engine-derived `dirtied` (`["node-5","node-3",
  "node-1"]`); the engine `requestId` dedup echoed the first report (counter
  stopped at 2); `event.value` echo landed; node state works.
- The full trio (test + typecheck + build) is the completion gate (AGENTS.md
  item 4).