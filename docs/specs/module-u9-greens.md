# Unit U9 — Dynamic module-tool registration + invocation two-gate — GREEN SCENARIOS

Unit U9 is the final unit of the `module.*` extension system (U1–U9). It wires
the CapabilityRouter's (U4) DYNAMIC `module:<name>.<tool>` tools into the
`ProvidentMcpServer` AND enforces the invocation two-gate (the §9 F1 residual) at
each call. Contract: `docs/specs/module-import-proposal.md` §5 + §9; roadmap
`docs/specs/module-feature-list.md` §5 U9.

## What this unit adds (per the contract)

- `McpServerOptions.router` — the `CapabilityRouter` whose dynamic tools the
  server registers + invokes (`src/main/mcp-server.ts`).
- `allowedToolNames()` — includes the router's dynamic `module:<name>.<tool>`
  tools when the `module` group is enabled (registration gate).
- `invokeTool(toolName, args)` — the DYNAMIC invocation two-gate (F1): a
  module-only (no `code`) agent CANNOT run a dynamic module tool; a `both`
  agent's call dispatches to the router handler. Standalone `invokeModuleTool`
  routes the static `registerTools` SDK call path through the same two-gate.
- `registerTools` — REGISTERS the router's dynamic tools on the live server
  (F1 adversarial fix: they were listed but never registered), each SDK call
  routed back through the two-gate so it is checked at EVERY invocation.

## Scenarios

| # | Scenario | Setup | Expected (per code) |
| --- | --- | --- | --- |
| 1 | Dynamic tool in `allowedToolNames()` when `module` enabled | server with `router` (capture.screenshot registered) + gate `both` | `allowedToolNames()` CONTAINS `module:capture.screenshot` |
| 2 | Dynamic tool NOT in `allowedToolNames()` under default gate | server with `router` + default `SecurityGate()` (module off) | `allowedToolNames()` does NOT contain `module:capture.screenshot` |
| 3 | Invoke with `module` AND `code` dispatches | server with `router` + gate `both` | `invokeTool('module:capture.screenshot', { id: 7 })` returns the router handler result `{ shot: { id: 7 } }` |
| 4 | Invoke with `module` ONLY throws (two-gate denies) | server with `router` + gate `moduleOnly` (no code) | `invokeTool('module:capture.screenshot', …)` THROWS (requires module AND code) |
| 5 | Invoke with NEITHER throws | server with `router` + default gate | `invokeTool('module:capture.screenshot', …)` THROWS |
| 6 | Dynamic dispatch returns the router handler result | server with `router` + gate `both` | `invokeTool('module:capture.screenshot', { a: 1, b: 'two' })` returns `{ shot: { a: 1, b: 'two' } }` |
| 7 | Dynamic tool REGISTERED on the live server (F1 adversarial fix) | server with `router` + gate `both`, `ensureServerRegistered()` | `registeredEnabled('module:capture.screenshot')` is `true` (in the live registered map, not just `allowedToolNames`) |

## Execution record

**Verified by repo suite (7 tests)** — `tests/module-dynamic.test.ts` (7 tests,
all green) covers scenarios 1–7 in the full trio run.

## Verification

- `tests/module-dynamic.test.ts` — 7 tests (scenarios 1–7 above).
- Trio green (2026-08-26): **653 passed | 2 skipped**, typecheck clean, build clean.

## Residuals (not part of U9)

- F2 (spec-drift gap): the pane enable/disable control is DISPLAY-ONLY (no click
  handler toggles a module's disabled flag) — future pass.
- M-r9 (downgrade model + deps), M-r10 (undefined-capability error + quarantine
  on crash), M-r11 (disable/enable/rollback) — advisory, deferred.
