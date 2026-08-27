# Speculative Feature List — Secure Module/Extension System + Management Pane

**Status**: SPECULATIVE / PLANNING (2026-08-26). The `module.*` extension system
passed the three-agent gate as GO-CONDITIONAL, then the second-pass gate returned
STILL-NOT-READY on the isolation requirement. The architect chose **(b) drop the
isolation claim, gate-only** (`docs/specs/module-import-review.md`), and the third
pass accepted the remaining blockers. This document
is the SPECULATIVE MAJOR-UPDATE feature list: the blockers, the required internal
toolset to build example modules WITHOUT allowing arbitrary external code, and the
additional module-management settings pane.

**Sources:** `docs/specs/module-import-proposal.md` (contract),
`docs/specs/module-import-review.md` (three-pass gate), `docs/decisions.md`.

## 1. The feature (what "modules/extensions" means here)

A **module** is host-side add-on capability (like a browser extension) that
registers at the tool / data-hook / render-transform seams. It is trusted-
equivalent to the `code` group (option b) — grant only to trusted modules.

### Acceptance test cases
| Test case | Capability | Notes |
| --- | --- | --- |
| Screen capture MCP tool | tool-provider | returns rendered HTML as image (M-r4 image channel) |
| Vector embedding | data-hook | after render, extracts text/image refs, uploads to vector DB (async-only) |
| Code formatter | render-transform | wraps keyword/variable text in highlight spans (emit-only) |

## 2. Secure-module blocker (the WALL)

**The blocker:** M-r1 "isolated realm" was **unbuildable** in this Electron
renderer. Under CSP `script-src 'self' 'unsafe-eval'`, a module `entry` materialized
via `new Function` binds to the renderer global scope — the SAME scope that holds
`window.provident.security` (the manual-UI self-grant channel). A true isolated
realm (ShadowRealm / sandboxed iframe / Worker) cannot synchronously mutate the
live Supervisor graph/DOM. So "isolate the module" and "module drives the live
graph" are mutually exclusive.

**Resolution (option b):** declare modules NON-isolating and gate-only. A module
with an executable entry requires `module` AND `code` (both OFF by default).
Documented as trusted-equivalent to `code` (arbitrary code execution). The
SecurePanels graph stays isolated at the GRAPH level (module tools route through
the app Runtime, which can't address the panes graph).

## 3. Required internal toolset to build example modules WITHOUT allowing arbitrary external code

The three example modules (capture / embed / format) are NOT arbitrary external
code. They are built from a curated INTERNAL TOOLSET — a set of declarative,
well-typed helpers the module system exposes, so an example module is assembled
from sanctioned primitives rather than raw `new Function` bodies. This is the
"GitHub-workflow" model: like a workflow YAML that can only run the actions GitHub
has already sandboxed/vetted, a module is a declarative spec over a fixed action
vocabulary.

| Toolset primitive | Kind | What it lets a module do | Safe because |
| --- | --- | --- | --- |
| `module.captureView()` | tool-provider helper | snapshot the rendered HTML fragment (to SVG/data-URI via M-r4) | read-only; produces an image result |
| `module.tool(name, handler)` | tool-provider | register a named tool (namespaced `module:<name>.<tool>`) | handler runs in the gated router; no self-grant |
| `module.onRender(fn)` | data-hook | after-render callback, receives a scoped read-only node snapshot | never the `Runtime`/`Supervisor`; minimized data surface |
| `module.emit(node, event)` | dispatch facade | drive a synthetic event on the app graph | routed through the app Runtime (SecurePanels unreachable) |
| `module.transform(fn)` | render-transform | rewrite the emitted fragment (emit-only) | pure; applied to both DOM + SSR; never graph-mutating |
| `module.uploadQueue()` | data-hook | bounded async queue for a declared-network module | async-queued off the sync render path; failure-isolated (M-r12) |
| `module.fetch(allowlist)` | network | constrained network access | CSP `connect-src` allowlist + manifest-declared; no arbitrary egress |

**The workflow-doc analogy:** the module API surface is the ONLY entry point a
module can call — it cannot reach `window.provident.security` through the router
because the router hands the module a reduced `ctx` and does NOT pass the live
`Runtime`/`Supervisor`/bridge. A module author builds a module purely from these
declared primitives, exactly as a GitHub workflow author writes YAML that can only
invoke vetted GitHub actions. The "no arbitrary external code" guarantee = the
module surface is closed and declarative.

**Caveat (honest):** because the module `entry` is materialized with `new Function`
(option b, no isolation), a module author who writes to the raw `window` global can
still reach `window.provident.security`. The toolset makes the SAFE path the only
documented/sanctioned path, and the two-gate (`module`+`code`) + OFF-by-default is
the trust boundary — same as `code.load`. This is accepted in option (b).

## 4. Additional module surface: management/settings pane

> The user requested: a config/settings pane that can be loaded into the
> SecurePanels for management.

A **module management pane** is added to the existing isolated SecurePanels graph
(`src/renderer/secure-panels.ts`) — the operator-only surface. It is authored as
provident data in the isolated panes graph (never visible to the MCP endpoints),
matching the project-wide UI constraint (all non-shell UI is provident-rendered).

**The pane provides (read via `window.provident.security`-style IPC, NOT MCP):**
| Control | Purpose |
| --- | --- |
| Installed module list + version | read-only census (`module.list`) |
| Enable/disable per module | `module.enable`/`module.disable` (M-r11) |
| Rollback to prior version | `module.rollback` (M-r11) |
| Network-permission per module | declares the `connect-src` CSP allowlist (M-r12/M-r7) |
| Quarantine status | show a module quarantined for failed hash / repeated crash (M-r10/M-r8) |
| Tool-group grant (module + code) | the two-gate toggles, manual-UI-only |

The pane is manual-UI-only: it drives the persisted module store via a new IPC
channel (`provident:module:get/set`), mirroring the existing `provident:security`
bridge. An agent NEVER reaches it over MCP (the module store is operator-owned).

**U8 LANDED 2026-08-26** (`src/renderer/secure-panels.ts` — the `module-pane`
section with `module-status` + `module-list` nodes; `refresh()` reads
`window.provident.module.get()`; `syncConfig` writes module status/list into the
pane graph; `src/shared/types.ts` `IPC_MODULE_GET`/`IPC_MODULE_SET_DISABLED`;
`src/main/preload.ts` `module` bridge; `src/main/main.ts` module store + IPC
handlers; tests `module-pane.test.ts` 7). **F1 (adversarial) fixed:** the real
IPC wiring is in place — the preload `module` bridge invokes
`IPC_MODULE_GET`/`IPC_MODULE_SET_DISABLED` and the main-process handlers build
the `{corrupt, quarantined, loaded, modules}` result from the store. **F2
residual (spec-drift gap, future pass):** the pane is DISPLAY-ONLY for
enable/disable — it renders the per-module `☑/☐` state and the `setDisabled`
bridge exists, but there is NO control wired to it yet (no click handler toggles
a module's disabled flag). The enable/disable CONTROL is a future pass; the
read-only census + status surface is complete.

## 5. Implementation roadmap (each unit through the TDD gate)

| Unit | Surface | Gate |
| --- | --- | --- |
| **U1** | `module` group + two-gate (`module` && `code`) + VALID_GROUPS/ToolGroup widening | M-r6 — **LANDED 2026-08-26** (gate 23 tests + store persistence) |
| **U2** | persisted `module-store` (fail-disabled/quarantine, hash-verified source) | M-r8 — **LANDED 2026-08-26** (`src/main/module-store.ts`, 12 tests) |
| **U3** | module manifest types + `module.install/update/list` tools | contract — **LANDED 2026-08-26** (`src/shared/types.ts` ModuleManifest/ModuleInstallPayload/ModuleInstallResult/ModuleListEntry + RpcMethod; `src/main/mcp-server.ts` `handleModuleTool` + ALL_TOOLS + two-gate in `registeredToolNames`/`applyGatePatch`; `moduleStore` in `McpServerOptions`; tests `module-tools.test.ts` 15). **Correction:** the `module.*` tools are MAIN-process (node:fs store) — NOT renderer-backed; the renderer Runtime has no module methods (the original roadmap's "Runtime backing" + "renderer switch" seams were dropped because the renderer bundle can't use node:fs). `module.disable`/`enable` remain deferred (M-r11 → U8 pane). |
| **U4** | capability router + the internal toolset (§3) | toolset — **LANDED 2026-08-26** (`src/renderer/extensions.ts` `CapabilityRouter` + `ModuleCtx`; tests `module-router.test.ts` 17; adversarial F1 hook containment, F2 namespace injectivity, F3 dup rejection, F4 non-function-handler rejection) |
| **U5** | `module.renderView` capture + image result channel | M-r4 — **LANDED 2026-08-26** (`src/main/mcp-server.ts` `imageResult` + the `maybeDigest`/`maybeDigestForTest` image-payload guard; `src/renderer/extensions.ts` `setCaptureProvider` + `ctx.captureView()` unicode-safe data-URI; tests `module-image.test.ts` 8; adversarial H1 unicode-safe base64, H2 live `maybeDigest` image bounding) |
| **U6** | emit-only render-transform (both DOM+SSR) | M-r5 — **LANDED 2026-08-26** (`src/renderer/runtime.ts` `RuntimeOptions.transformRouter`, applied at READ time to the MCP views `renderedHtml`/`ssrHtml`/`markdown` — the read-time re-scope per proposal §4, NOT the operator's live DOM; tests `module-transform.test.ts` 7) |
| **U7** | async-queue data-hook (vector-embed offline mock) | M-r12 — **LANDED 2026-08-26** (`src/renderer/extensions.ts` `ctx.uploadQueue()` returns a bounded (1000, drop-oldest) async queue, ONE per module ctx — M1 fix; async `drain` awaits async processors + contains rejections — H1 fix; tests `module-queue.test.ts` 7) |
| **U8** | module management pane in SecurePanels | §4 — **LANDED 2026-08-26** (`src/renderer/secure-panels.ts` module-pane + `refresh()`/`syncConfig`; `src/shared/types.ts` `IPC_MODULE_GET`/`IPC_MODULE_SET_DISABLED`; `src/main/preload.ts` `module` bridge; `src/main/main.ts` module store + IPC handlers; tests `module-pane.test.ts` 7; adversarial F1 wiring fixed, F2 enable/disable control residual → future pass) |
| **U9** | dynamic module-tool live re-register + namespacing | M-r3 — **LANDED 2026-08-26** (`src/main/mcp-server.ts` `McpServerOptions.router` + `invokeTool` (two-gate) + `invokeModuleTool` (standalone) + `allowedToolNames()` includes the router's dynamic `module:<name>.<tool>` tools (gated `module`) + `registerTools` registers the router's dynamic tools, routing each SDK call back through the two-gate — the §9 F1 dynamic-invocation residual is CLOSED; tests `module-dynamic.test.ts` 7) |

**The FULL `module.*` extension system (U1–U9) is LANDED 2026-08-26.** The only
residuals are the §4 F2 (pane enable/disable is DISPLAY-ONLY, no control wired)
and the §8 M-r9/M-r10/M-r11 deferred items.

## 8. Deferred (advisory, documented open in `docs/pending.md`)
- M-r9 downgrade model + module-to-module deps (manifest `dependsOn`, no resolver this pass)
- M-r10 undefined-capability error + module quarantine on crash
- M-r11 disable/enable/rollback (folded into pane §4, U8)
- M-r12 async-network off the sync render path

## 9. Trackers
- `docs/decisions.md` — MODULE-EXTENSIONS row → **FULL SYSTEM LANDED (U1–U9)** + architect decision (b)
- `docs/pending.md` — **MODULE-EXTENSIONS LANDED/RETIRED** row + deferred M-r9..M-r11 residuals
- This doc — the speculative major-update feature list
