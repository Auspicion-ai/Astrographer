# Green Scenarios — A1 MCP Server Wiring + Gate (Units A1-W2/W4/W5)

Status: **GREEN-SCENARIO SET** — to be attempted during the blind-test loop
(upstream AGENTS.md item 10 / subagents.md). Each scenario below is a behavior
`docs/specs/mcp-server-wiring.md` (+ `mcp-server-gate.md`) claims; the
blind-test agent runs it against the live module and confirms it PASSES. A
blind-test failure is a doc bug OR an un-hardened regression — never a pass.

Modules under test: `src/main/mcp-server.ts` (`toolForName`,
`registeredToolNames`, `ProvidentMcpServer`) + `src/main/security.ts`
(`SecurityGate`). The pure functions + the server are testable without
Electron (a stub `McpBackend` satisfies the constructor). These encode the
A1-W2 wiring contract + the A1-W4/W5 gate + the M1 stdio re-gate + the M2
stub/registration agreement.

## W1 — toolForName (spec §2/§5)

1. `toolForName('provident.dispatch')` → `'dispatch'`.
2. `toolForName('provident.code.load')` → `'code.load'` (a two-part name keeps
   its sub-path).
3. `toolForName('nope')` → THROWS (a registered tool must be under the
   `provident.` prefix).
4. `toolForName('provident.nope')` → `'nope'` (the prefix is stripped; whether
   it's a KNOWN tool is `registeredToolNames`'s concern).
5. **F2/fail-closed** — `toolForName('provident.')` and `toolForName('provident.  ')`
   (empty/whitespace rest) → THROWS.
6. **F2** — `toolForName('provident.provident.x')` (double prefix) → THROWS.
7. **F2** — `toolForName(null)` and `toolForName(42)` → THROWS.

## W2 — `registeredToolNames` (spec §2/§3/§5)

`ALL` = the full 15-name list (`provident.dispatch`, `get_rendered_html`,
`list_targets`, `get_node_state`, `code.get`, `code.validate`, `load`, `op`,
`export`, `validate`, `teardown`, `code.set`, `code.create`, `code.delete`,
`code.load`).

- `registeredToolNames(new SecurityGate(), ALL)` includes the `read`+`dispatch`
  tools: `dispatch`, `get_rendered_html`, `list_targets`, `get_node_state`,
  `code.get`, `code.validate`.
- The same call EXCLUDES the `graph` tools (`load`, `op`, `export`, `validate`,
  `teardown`) and the `code`-mutation tools (`code.set`, `code.create`,
  `code.delete`, `code.load`).
- `registeredToolNames(new SecurityGate().apply({groups:['graph','code']}), ALL)`
  includes all 15 (every graph + code tool now registers).
- A tool whose group is allowed but unknown to the map (`provident.unknown_tool`)
  NEVER registers.
- **F3/dedup** — `registeredToolNames(gate, [...ALL, 'provident.dispatch',
  'provident.dispatch'])` contains `'provident.dispatch'` exactly once.
- `registeredToolNames` with a gate whose `enabled` is empty → `[]`.

## W3 — the HTTP 401 contract (§4 — `gate.checkRequest(headers).ok`)

There is no separately-exported `httpAuthorized`; the contract is
`gate.checkRequest(headers).ok` (the `SecurityGate` surface). The
`httpAuthorized(gate, headers)` used below is the test-local helper
(`tests/mcp-server-wiring.test.ts`) = `gate.checkRequest(headers).ok`.

- `httpAuthorized(new SecurityGate({token:null,...}), {})` → `true` (no token ⇒ open).
- `httpAuthorized(new SecurityGate({token:'s',...}), {authorization:'Bearer s'})`
  → `true`.
- `httpAuthorized(new SecurityGate({token:'s',...}), {authorization:'Bearer wrong'})`
  → `false`.
- `httpAuthorized(new SecurityGate({token:'s',...}), {})` → `false` (a gated
  token with no header rejects).
- **F-key** — `httpAuthorized(gateWithToken('s'), { Authorization: 'Bearer s' })`
  (upper-cased key) → `true`.

## G4 — `ProvidentMcpServer` gate plumbing (spec mcp-server-gate.md §2/§4)

- `new ProvidentMcpServer({backend}).getGateConfig()` →
  `{ token:null, enabled:['read','dispatch'] }` (the default gate).
- `getGateConfig()` returns a COPY — mutating the returned `enabled`/`token`
  does NOT change the server gate.
- `new ProvidentMcpServer({backend, gate: new SecurityGate().apply({groups:['graph']})}).getGateConfig().enabled`
  includes `graph`.
- `applyGatePatch({groups:['code']})` → `getGateConfig().enabled` includes
  `code` AND the server's `gate.toolAllowed('provident.code.load')` → `true`.
- `applyGatePatch({groups:['bogus']})` → config unchanged (rejected, never throw).
- **Gated registration** — `new ProvidentMcpServer({backend}).allowedToolNames()`
  includes `dispatch`/`get_rendered_html`/`list_targets`/`get_node_state`/
  `code.get`/`code.validate` and EXCLUDES `load`/`op`/`export`/`validate`/
  `teardown`/`code.load`.
- A default-gate server does NOT allow `provident.code.load`
  (`server.gate.toolAllowed('provident.code.load')` → `false`); after
  `applyGatePatch({groups:['code']})` it → `true`.

## G5 — M1: stdio re-gate (applyGatePatch on the LIVE server)

- `server.ensureServerRegistered()` then `server.registeredEnabled('provident.dispatch')`
  → `true`.
- `server.applyGatePatch({ disable:['dispatch','read'] })` → the DISABLED tool's
  live handle is off: `server.registeredEnabled('provident.dispatch')` → `false`.
- Re-enabling `server.applyGatePatch({ groups:['dispatch','read'] })` →
  `registeredEnabled('provident.dispatch')` → `true` again.

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/mcp-server-wiring.md` +
  `docs/specs/mcp-server-gate.md` (+ this file's claims) and runs each scenario
  against the modules, asserting PASS.
- A scenario that FAILS is a defect OR a doc/spec drift — record it, never edit.
- The green set is the regression net for the wiring/gate contract + the
  M1/M2 adversarial fixes (M1→G5, F2→W1 5–7, F3→W2 dedup, F-gate→G3 5).
