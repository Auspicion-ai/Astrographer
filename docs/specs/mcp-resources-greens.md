# Green Scenarios — MCP Resources (gated read-group)

Status: **GREEN-SCENARIO SET** (2026-08-25). Each scenario is a behavior the
gated MCP resources claim (`docs/FORKER.md` §4 R1-R5 digest). The blind-test writer runs these
against the live `ProvidentMcpServer` (under the stub backend) and confirms each
PASSES. A failure is a doc bug OR an un-hardened regression — never a pass.

Tests: `tests/mcp-resources.test.ts` (R1-R5) + `tests/mcp-resources-adversarial.test.ts`
(A1-A4).

## G1 — R1 read-group gating

1. Default gate (`read` ON): the three resources are registered —
   `mcp://provident/app`, `mcp://provident/targets` (fixed URIs) +
   `mcp://provident/node/{nodeId}` (template).
2. Disabling `read` on the LIVE server disables all three resources
   (`resourceEnabled(...) === false`).
3. Re-enabling `read` restores them.
4. A non-read group toggle (e.g. `dispatch` off) does NOT affect the read
   resources.
5. A fresh server built with `read` OFF registers NO resources (the HTTP
   per-POST build path — no always-registered bypass door).

## G2 — R2 live re-gate.

`applyGatePatch` toggles the captured resource handles alongside the tools —
a `read`-off narrow takes effect on the running stdio server immediately.

## G3 — R4 node-template validation + isolation.

6. Reading `mcp://provident/node/{nodeId}` invokes `nodeState` over the backend
   (the app Runtime). A destroyed/unknown nodeId surfaces a clean error
   (`unresolved target`), never a stale/ghost snapshot.
7. Resources route ONLY through the app Runtime backend — never the isolated
   SecurePanels graph. The `mcp://provident/app` read invokes exactly
   `renderedHtml` (the app surface) and nothing else.

## G4 — R5 fresh snapshots + mimeType.

8. Reading `mcp://provident/app` invokes `renderedHtml` and returns the fresh
   snapshot (not a cache).
9. Each resource carries its declared `mimeType` (`text/html` for app,
   `application/json` for node/targets).

## G5 — A4 malformed/unknown URIs.

10. Reading an unregistered URI throws a clean `resource not found` (no 500
    stack).
