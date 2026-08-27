# Contract — `module.*` extension system (versioned module/extension import)

**Status**: CONTRACT (2026-08-26, REVISED under architect decision (b), THIRD-PASS
READY-FOR-CODE). The three-agent gate ran three passes: pass 1 GO-CONDITIONAL,
pass 2 STILL-NOT-READY (M-r1 unbuildable), pass 3 — the architect chose **(b)
DROP ISOLATION, GATE-ONLY**, and the two remaining blockers (invocation two-gate +
honest labels) + four pins are folded into this contract. **U1 (module group +
two-gate predicate) LANDED 2026-08-26** (see §5); **U2 (persisted module store)
LANDED 2026-08-26** (see §6); **U3 (module manifest types + `module.install`/
`update`/`list` tools, MAIN-process) LANDED 2026-08-26** (see §3/§7 — the
`module.*` tools are MAIN-process, NOT renderer-backed); **U4 (capability router +
internal toolset) LANDED 2026-08-26** (see §4/§7b/§7); **U5 (image/binary MCP
tool-result channel, M-r4) LANDED 2026-08-26** (see §9 + the §7 seam row);
**U6 (emit-only render-transform wiring, M-r5) LANDED 2026-08-26** (see §4 + the
§7 seam row; tests `tests/module-transform.test.ts` 7);
**U7 (async-queue data-hook, M-r12) LANDED 2026-08-26** (see §4 + the §7 seam row;
tests `tests/module-queue.test.ts` 7; adversarial fixes H1 + M1, §4).
**U8 (module management pane, §4) LANDED 2026-08-26** (see §4 + the §7 seam row;
tests `tests/module-pane.test.ts` 7; adversarial F1 wiring fixed, F2 enable/disable
control residual → future pass).
**U9 (dynamic module-tool registration + invocation two-gate, §5) LANDED 2026-08-26**
(see §5/§7 — `router` in `McpServerOptions`, `allowedToolNames()` includes the
dynamic `module:<name>.<tool>` tools when `module` is enabled, `invokeTool`
(two-gate) + `invokeModuleTool` (standalone), `registerTools` now registers the
router's dynamic tools; tests `tests/module-dynamic.test.ts` 7; the §9 F1 note is
CLOSED — the DYNAMIC invocation path + live re-register are wired).

**The FULL `module.*` extension system (U1–U9) is LANDED 2026-08-26.**

## 1. What a "module/extension" is

A **module** is host-side add-on code (like a browser extension / plugin) that
adds OPTIONAL capability to the engine for future development. It is NOT a def
prototype (those are engine-internal); it is a host extension that registers
capabilities at the tool / data-hook / render-transform seams.

### Acceptance test cases

| Test case | Capability kind | What it does |
| --- | --- | --- |
| Screen capture MCP tool | **tool-provider** | Registers a module tool returning the rendered HTML as an image (M-r4 binary channel) |
| Vector embedding | **data-hook** | After render, walks nodes, extracts text/image refs, uploads to a remote vector DB (async-only, M-r12; offline mock in-scope) |
| Code formatter | **render-transform** | Wraps keyword/variable text in highlight spans (emit-only, M-r5) |

## 2. Loaded module contract (`ModuleManifest`)

```ts
interface ModuleManifest {
  name: string            // extension id
  version: string         // semver-ish
  capabilities: {
    tools?: string[]          // MCP tool names (namespaced `module:<name>.<tool>`)
    hooks?: string[]          // render/data hooks
    transforms?: string[]     // render transforms
  }
  entry?: string         // executable host-side JS (function-STRING) — REQUIRES the code group
  needsCode?: boolean    // true if entry carries executable code
  dependsOn?: Array<{ name: string; versionRange: string }>  // M-r9 deferred: documented, no resolver
}
```

## 3. Import / versioning / update / list contract

**`module.install`** `{ name, source, version?, force? }`:
- parse manifest → register capabilities in the router → update the persisted
  registry → report.
- **Two-gate (M-r2)**: an entry carrying executable JS requires `module` **AND**
  `code` groups. A pure-capability module (no entry) needs only `module`.
- **Version conflict (E-c1 / M-r9)**: same name+version → no-op; same name +
  different version → REJECT unless `force:true`. Downgrade requires `force`
  and validates the new capability set doesn't drop a bound one.

**`module.update`** — re-load + re-register a name at a new version.
**`module.list`** — read-only census of installed modules + versions + active flag.
**`module.disable` / `module.enable`** (M-r11, advisory) — active flag toggle.

**U3 LANDED 2026-08-26 — main-process handler (§3 matches the build):**
`module.install`/`update`/`list` are handled in MAIN by `handleModuleTool`
(`src/main/mcp-server.ts`) against the persisted node:fs store (U2), NOT routed
to the renderer. `module.install` honors E-c1 (same name+version → `no-op`;
different version → `rejected` unless `force:true`); `module.update` re-puts at
the new version; `module.list` returns the store census. The tools are gated by
the two-gate (module.install/update require `module` AND `code`; module.list
needs `module` only) in BOTH `registeredToolNames` (registration) and
`applyGatePatch` (live re-gate) — disabling `code` drops module.install/update.
The renderer Runtime is untouched (no module methods). `module.disable`/`enable`
(M-r11) are NOT yet tools in this unit — they are deferred (U9/pane, per §8).
The pane (§4, U8) renders the per-module `☑/☐` state + the `setDisabled` bridge
exists, but the enable/disable CONTROL is a future pass (F2 residual).
The `RpcMethod` union carries the `module.*` methods for completeness, but the
main-process handler does not route them over IPC to the renderer.

## 4. Capability router (the runtime seam) + containment

A router dispatches a capability name to its registered module. **M-r1 is
REPLACED by architect decision (b): DROP ISOLATION, GATE-ONLY.** A module is
NON-isolating — trusted-equivalent to the `code` group. The module `entry`
executes in the renderer global scope (no sandbox; the `new Function` under CSP
`unsafe-eval` cannot be isolated). The security boundary is the authorization
gate (`module` AND `code`, both OFF by default), NOT a process barrier.

The router still hands the module a reduced, declarative `ctx` (the internal
toolset, §7b) so the SANCTIONED path never passes the live `Runtime`/`Supervisor`/
bridge — but a hostile module writing raw `window` can reach
`window.provident.security` (accepted; trusted-equivalent to `code`). The toolset
is an **ergonomics/consistency layer, NOT a security boundary** (see §7b).

| Seam | Example | Containment |
| --- | --- | --- |
| tool | `module:capture.screenshot` | reduced data surface; no network unless declared |
| hook | after-render vector-embed | async-queued off the sync render path (M-r12); data-minimized snapshot |
| transform | highlight spans | EMIT-ONLY on the rendered fragment, applied to BOTH the DOM and SSR adapters (parity); never touches Node/Supervisor (M-r5) |

**U6 LANDED 2026-08-26 — read-time re-scope (adversarial finding):** the transform
is applied at READ time to the MCP views (`renderedHtml`, `ssrHtml`, `get_markdown`),
NOT to the operator's live DOM (the DomAdapter writes the untransformed fragment;
the prevMap diff stays consistent). This is a recorded contract amendment: the
parity guarantee is "all MCP agent-facing views are transformed identically"
(renderedHtml = ssrHtml = markdown), NOT "the operator's live DOM matches the
agent's view." A code-formatter/visual transform is agent-visible but not
operator-visible. The transform is emit-only (string-in/string-out, never touches
Node/Supervisor), composed in registration order, and a throwing transform is
contained (returns the original fragment).

**SecurePanels graph isolation holds at the GRAPH level (not the JS level):**
module tools/hooks route THROUGH the app Runtime (the sanctioned router path),
which cannot address the panes graph (multi-graph isolation). Restated honestly
(third-pass label fix): **SecurePanels is not reachable through the sanctioned
module tool/hook path (the graph router)** — NOT a claim that a hostile module
running in the renderer main world cannot `document.getElementById('panes')`.
Module code is trusted-equivalent to `code` (grant only to trusted modules).

**U4 LANDED 2026-08-26 — capability router + internal toolset (§4 matches the
build):** `src/renderer/extensions.ts` implements `CapabilityRouter` +
`ModuleCtx` (the reduced, declarative ctx — never the live
Runtime/Supervisor/bridge). Tools are namespaced `module:<name>.<tool>`;
hooks + transforms run in registration order; `runHooks`/`applyTransforms`
contain a throwing hook/transform (a throwing hook is quarantined for the pass
and a later hook still runs; a throwing transform returns the ORIGINAL fragment,
never a partial/crashed render). `captureView()` snapshots the rendered fragment
(read-only); `emit` is a facade stub (the real dispatch routes through the app
Runtime in U9); `uploadQueue`/`fetch` are M-r12-deferred stubs (uploadQueue at U4's landing; now a real queue per §4 U7 LANDED, 2026-08-26). **Adversarial
hardening (F1–F4):** a throwing hook is contained (F1); module/tool names with
`.`/`:` are REJECTED (F2 namespace injectivity); a duplicate module name is
REJECTED, never a silent overwrite (F3); a non-function tool handler is rejected
at registration (F4). Tests `tests/module-router.test.ts` (17).

**U7 LANDED 2026-08-26 — bounded async-queue data-hook (§4 hook seam, M-r12):**
`ctx.uploadQueue()` now returns a REAL bounded async queue (was an M-r12-deferred
stub), ONE per module ctx. Enqueue is synchronous (buffers, never blocks the sync
render path); `drain(processor)` is async (returns a Promise), processes the
buffer in order, AWAITS each processor (H1 adversarial fix — an ASYNC processor
such as a remote vector upload is awaited, not fire-and-forget) and CONTAINS any
throwing/rejecting processor (a throwing item never crashes drain; later items
still process). The buffer is BOUNDED at 1000, drop-oldest (an 1001st enqueue
drops the oldest item). **M1 (adversarial fix):** `uploadQueue()` returns the
SAME queue object per module ctx — a module that captures it in a hook and calls
it again in a tool handler shares one buffer (no fragmented data loss). The
vector-embedding acceptance case is constrained to the offline/local-store mock
(no network). Tests `tests/module-queue.test.ts` (7).

## 5. Tool group & gating (M-r2, M-r3, M-r6)

- New `module` group, **OFF by default** (mirrors `graph`/`code`).
- `module.install`/`update` with executable `entry`: `module` **AND** `code` gates.
- **Invocation two-gate (third-pass fix):** invoking a module tool backed by an
  executable entry re-checks `module` **AND** `code` AT EACH CALL — not just at
  install. A `module`-granted (not `code`-granted) agent must NOT be able to run
  a module tool that is arbitrary code. `force` never bypasses authorization (it
  only bypasses the E-c1 version conflict).
- Post-install re-gating: disabling `code` re-gates the module tool's INVOCATION
  path (the module tool is not invoked without `code`). The already-materialized
  entry's own execution is not re-gated (documented limitation).
- `module.list`/`module.disable`/`module.enable`: `module` group only.
- Module tools namespaced `module:<name>.<tool>`; threaded through a module-group
  gate path with live re-register/deregister on group change.
- `module` added to `VALID_GROUPS`, `MUTATING_METHODS`, secure-panels GROUPS.
  **U1 (2026-08-26, landed):** `VALID_GROUPS` (`src/main/security.ts` + `security-store.ts`)
  and the secure-panels GROUPS (`secure-panels.ts`) now include `module`; the static
  `module.*` tools map to `module` in TOOL_GROUPS; `groupForTool` resolves the
  `module:` prefix (empty-rest denied). The invocation two-gate predicate
  (`moduleToolAllowed`) EXISTS and is unit-tested (`tests/module-security-gate.test.ts`)
  but — **U3 (2026-08-26): CLOSED for the STATIC `module.*` tools** — the two-gate
  is   now wired into the static `module.install`/`module.update` tools (registration
  in `registeredToolNames` + live re-gate in `applyGatePatch`, `mcp-server.ts`):
  disabling `code` drops module.install/update. **F1 CLOSED (U9, 2026-08-26):** the
  DYNAMIC `module:<name>.<tool>` invocation path (per-call `moduleToolAllowed`
  enforcement in `invokeTool`/`invokeModuleTool` + live re-register of the
  router's tools in `registerTools`) is now wired — a module-only (no `code`)
  agent CANNOT run a dynamic module tool, and the dynamic tools are listed in
  `allowedToolNames()` + registered on the live server when `module` is enabled.
  U1 does not modify `renderer.ts` `MUTATING_METHODS`.

## 6. Persisted store (M-r8, revised to fail-disabled)

**Fail-DISABLED + hash-verified** (per second-pass finding M-r8: a fail-CLOSED
store bricks boot for an optional capability; a fail-DISABLED/quarantine mode is
preferred):
```
{ name, version, capabilities, source, hash, installedAt, disabled?, quarantined? }
```
- `source` stored as a string + SHA-256 `hash`.
- **U2 LANDED 2026-08-26** (`src/main/module-store.ts` + `tests/module-store.test.ts`, 12 tests):
  - Persists a **bare array** of records (NOT `{modules:[]}`).
  - `put(record)` **derives `hash` from `source`** (never trusts a caller-supplied
    hash) and **validates its input** (rejects empty/non-string `name`/`version`/
    `source`); an empty source is rejected as meaningless.
  - **Atomic write** (`persist`): temp file + `renameSync` so a crash mid-write
    never leaves a truncated registry that boots fail-disabled.
  - `get`/`list`/`status`/`put`/`remove`/`setDisabled` surface; `disabled` flag
    persisted (a disabled module is NOT reported loaded).
- Boot: any entry whose source fails hash verification is **QUARANTINED** (kept
  in store, marked `quarantined`, NOT loaded) — surfaced via `status().quarantined`
  with a clear-recovery path (an operator reinstall/put clears it).
- A corrupt/missing store file **FAILS DISABLED**: boots to no-modules + a
  `corrupt` flag (in `status()`), NOT a hard boot failure.

## 7. Required implementation surface (the 6 seams + extras)

| Seam | File |
| --- | --- |
| Module types (manifest, registry entry, module tool) | `src/shared/types.ts` |
| Module registry + persisted store (fail-disabled/quarantine) | `src/main/module-store.ts` — **U2 LANDED 2026-08-26** |
 | Capability router + internal toolset (no isolation realm) | `src/renderer/extensions.ts` (new) — **U4 LANDED 2026-08-26** (`CapabilityRouter` + `ModuleCtx`; tests `module-router.test.ts` 17); **U6 LANDED 2026-08-26** — the emit-only transform seam is wired into the Runtime render (`src/renderer/runtime.ts` `RuntimeOptions.transformRouter`, applied at READ time in `renderedHtml`/`ssrHtml`/`markdown`; tests `module-transform.test.ts` 7); **U7 LANDED 2026-08-26** — the async-queue data-hook (`ctx.uploadQueue()` returns a bounded 1000/drop-oldest async queue, one per module ctx; async `drain` awaits + contains processors; tests `module-queue.test.ts` 7) |
| Tool group `module` + two-gate check | `src/main/security.ts` TOOL_GROUPS, `VALID_GROUPS` + `ToolGroup` union — **U1 LANDED 2026-08-26** |
| Dynamic tool registration + image channel | `src/main/mcp-server.ts` — **U5 LANDED 2026-08-26 (image channel only):** `imageResult` (data-URI → MCP image content block) + the `maybeDigest`/`maybeDigestForTest` payload guard extends to large IMAGE content (`src/main/mcp-server.ts`) + `setCaptureProvider`/`ctx.captureView()` unicode-safe data-URI (`src/renderer/extensions.ts`); tests `module-image.test.ts` 8. **U9 LANDED 2026-08-26 (dynamic registration):** `router` in `McpServerOptions`; `allowedToolNames()` includes the router's dynamic `module:<name>.<tool>` tools (gated `module`); `invokeTool` (two-gate) + `invokeModuleTool` (standalone); `registerTools` registers the router's dynamic tools, routing each SDK call back through the two-gate; tests `module-dynamic.test.ts` 7 |
| Module tool dispatch (`module.install/update/list` in MAIN) | `src/main/mcp-server.ts` — **U3 LANDED 2026-08-26** (`handleModuleTool` + the two-gate in `registeredToolNames`/`applyGatePatch` + `moduleStore` in `McpServerOptions`) |
| ~~Renderer switch + MUTATING_METHODS~~ — **SUPERSEDED (U3 correction): the `module.*` tools are MAIN-process (node:fs store); the renderer is NOT modified** | (no renderer change) |
| ~~Runtime backing~~ — **SUPERSEDED (U3 correction): the renderer Runtime has NO module methods** | (handled in main) |
| Battery dispatch | `src/main/battery-host.ts` |
| `module` in GROUPS/VALID_GROUPS | `src/renderer/secure-panels.ts`, `src/main/security-store.ts` |
| Module management pane (U8) | `src/renderer/secure-panels.ts` (module-pane section + `refresh()`/`syncConfig`), `src/shared/types.ts` (`IPC_MODULE_GET`/`IPC_MODULE_SET_DISABLED`), `src/main/preload.ts` (`module` bridge), `src/main/main.ts` (module store + IPC handlers) — **U8 LANDED 2026-08-26** (tests `module-pane.test.ts` 7; adversarial F1 wiring fixed, F2 enable/disable control residual → future pass) |
| Tests + fixtures | `tests/` (loadbatch pattern: functional + adversarial) |

## 7b. Internal toolset (the SANCTIONED authoring path — ergonomics, NOT a security boundary)

The internal toolset (`docs/specs/module-feature-list.md` §3) is the sanctioned
way to author a module — a curated set of declarative primitives a module
assembles from (the "GitHub-workflow" model). The example modules
(capture/embed/format) are built from these, not raw `new Function` bodies. The
toolset hands a reduced `ctx` (never the `Runtime`/`Supervisor`/bridge), so the
SANCTIONED path cannot self-grant.

**Honest-label fix (third pass):** under architect decision (b) the toolset is an
**ergonomics/consistency layer, NOT a security barrier.** It does NOT deliver
"WITHOUT allowing arbitrary external code" — a module `entry` is still a raw
`new Function` body and a hostile author can reach anything, including
`window.provident.security`. The toolset makes the SAFE path the only documented
one; the security boundary is the authorization gate (module + code, OFF by
default), NOT the toolset. A GitHub workflow runner hard-refuses non-vetted
actions; this toolset does not — it only makes the sanctioned path convenient.

**U4 LANDED 2026-08-26 — the toolset is implemented in `src/renderer/extensions.ts`**
as the `ModuleCtx` interface: `captureView()` / `tool(name, handler)` /
`onRender(fn)` / `emit(node, event, args?)` / `transform(fn)` /
`uploadQueue()` / `fetch(allowlist)`. The `tool`/`onRender`/`transform` methods
register into the `CapabilityRouter`; `emit` is a facade stub (U9 wires the live
graph); `uploadQueue` is a REAL bounded async queue (U7 LANDED 2026-08-26 — §4);
`fetch` is an M-r12-deferred stub. The toolset hands a
reduced `ctx` (never the `Runtime`/`Supervisor`/bridge), so the SANCTIONED path
cannot self-grant — matching the honest-label framing above.

## 8. Deferred (ADVISORY — documented open, not in this contract)

| ID | Item | Where |
| --- | --- | --- |
| M-r9 | Downgrade/upgrade model details + module-to-module deps | `docs/pending.md` |
| M-r10 | undefined-capability error + module quarantine on crash | `docs/pending.md` |
| M-r11 | disable/enable + rollback | `docs/pending.md` |
| M-r12 | async-network queue off the sync render path | **RESOLVED 2026-08-26 / U7 LANDED** — the bounded async queue itself; the declared-network CSP `connect-src` remain open |

## 9. Open notes

- **M-b1**: function bodies don't survive the serialize doc round-trip; module
  `entry` functions are host-side (never in the envelope). A module that writes
  envelope handler bodies must respect the existing write-gating (P-C3).
- **M-d2**: module capabilities are app-Runtime-scoped; SecurePanels is NOT
  reachable THROUGH the sanctioned module tool/hook (graph router) path — the
  app Runtime cannot address the panes graph. This is a GRAPH-level isolation,
  NOT a JS-level one (a hostile module running in the renderer main world can
  `document.getElementById('panes')`; it is trusted-equivalent to `code`).
- **F1 (CLOSED 2026-08-26 / U9)**: the invocation two-gate is now enforced in a
  live path for BOTH the STATIC `module.*` tools (`module.install`/`module.update`
  require `module` AND `code` at registration in `registeredToolNames` and at
  live re-gate in `applyGatePatch`) AND the DYNAMIC `module:<name>.<tool>` tools
  (per-call `moduleToolAllowed` enforcement in `invokeTool`/`invokeModuleTool`
  on the router + live registration/re-register of the router's tools in
  `registerTools`). A dynamic module-tool invocation's authorization is enforced
  by the two-gate in a live path; a module-only agent (no `code`) CANNOT run a
  dynamic module tool. (Adversarial fix, U3 static + U9 dynamic.)
- **M-cap**: a module-declared tool name must not collide with a built-in `provident.*`
  tool; namespace the `module:<name>.<tool>` prefix prevents this.
- **M-r4 payload guard (CLOSED 2026-08-26 / U5)**: the image/binary tool result
  extends the `maybeDigest`/`largePayloadBytes` guard so a large image payload
  does not cross the IPC boundary unbounded (same hazard `maybeDigest` prevents
  for HTML). **U5 LANDED 2026-08-26:** `maybeDigest` now also bounds an IMAGE
  `content` block (base64 `data` summed against `largePayloadBytes`; over-bound →
  `{digest, truncated:true}`, never the raw base64) — exposed for tests via
  `maybeDigestForTest` (`src/main/mcp-server.ts`). The tool-result formatter
  `imageResult(dataUri, mimeType?)` parses a `data:<mime>;base64,<data>` URI into
  the MCP `{type:'image', data, mimeType}` content block and throws a clean error
  on a non-data-URI (never crashes). **H1 (adversarial, U5):** `ctx.captureView()`
  builds a data-URI with a unicode-safe base64 (TextEncoder, not `btoa` — which
  throws on emoji/CJK in the captured fragment). **H2 (adversarial, U5):** the
  live `maybeDigest` path bounds a large image content block, not just the
  test-only `maybeDigestForTest`.
- **CSP `connect-src`**: the renderer CSP has no `connect-src`; a declared-network
  module (`module.fetch(allowlist)`) is currently blocked by `default-src 'self'`
  (fail-safe) but the CSP change for a declared network is a tracked open item.
- **`dependsOn`-on-quarantine (M-r9 deferral)**: a declared `dependsOn` on an
  absent/quarantined module is a NO-OP (never a load-time crash), documented until
  a resolver lands.
