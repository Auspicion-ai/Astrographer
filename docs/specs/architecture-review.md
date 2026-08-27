# Top-Level Architecture — change-analysis review (step 3 of the three-agent gate)

Status: **change-analysis review of the Provident-Electron top-level
architecture** (process model + MCP surface + the battery host + the headless
mode). Synthesizes the step-1 validity and step-2 critique outputs; my own
re-read of every cited site confirms both steps' line references and claims.
No files changed by this document. Companion context:
`docs/specs/mcp-endpoint.md` (§1-6), `docs/specs/e2e-test-battery.md` (+
review), `docs/decisions.md`, `docs/pending.md`, the source in `src/{main,
renderer,shared}`, the installed `provident-ssr@0.1.3` dist, and the upstream
`../Preempt-Providence` docs/specs (trusted-backend gate, Phase-B pins).

## 1. The architecture under review (recap)

- **Process model**: Electron main (CJS) owns the MCP server (stdio +
  Streamable HTTP) + an IPC bridge (`RendererBackend`, queues until
  `provident:ready`); the renderer (ESM) owns the Runtime (provident-ssr
  graph + `DomAdapter` render + `SSRFragmentAdapter` mirror); a preload
  contextBridge is the only renderer→main channel. Forced by `DomAdapter`'s
  hard DOM requirement (REQ-GAP-6) + the package's ESM-only constraint.
- **MCP surface**: 15 `provident.*` tools, all IMPLEMENTED (Unit C LANDED).
  Grouping (per `src/main/security.ts` `TOOL_GROUPS`): `read` =
  `get_rendered_html`/`list_targets`/`get_node_state`/`code.get`/`code.validate`
  (5); `dispatch` = `dispatch` (1); `graph` = `load`/`op`/`export`/`validate`/
  `teardown` (5); `code` = `code.set`/`create`/`delete`/`load` (4). 6 tools are
  live under the default gate (`read`+`dispatch`); `graph`/`code` are OFF
  (manual grant). The `code.*` tools edit the ENVELOPE outside the live graph
  and re-load to materialize.
- **Battery host**: a second Node process running the SAME Runtime under the
  DOM shim, spawned over stdio; single process, no external reset (C4),
  teardown-only; one Electron-run as the divergence check (R13).
- **Headless/SSR-only mode** (un-parked): an `SSRFragmentAdapter`-only
  producing process (no DOM).

## 2. Verdict

**VALID-AS-STATED — the architecture is implementable on existing surfaces and
sound at the seams it has built. APPROVED-WITH-RESHAPE**: the critique's
findings are all at the two trust boundaries the design never names (the
eval gate reachable by an unauthenticated peer; the renderer treated as a
never-reloading singleton with unbounded payloads) — none violates an engine
pin, all are host-side hardening, and the reshapes A1..A6 below are REQUIRED
to trust the shipped renderer as more than an integration artifact.

## 3. Feasibility

- **VALID (step 1, all `[PASSES]`)**: every `provident-ssr@0.1.3` surface the
  architecture names exists and is confirmed in the installed dist — the
  Supervisor (`dispatchEvent`, `dispatchAndReport`, `flush`, `hasPendingWork`,
  `takePass2States`, `getResolvedStates`, `allNodes`, `getNode`, `registerNode`,
  `recordResolved`, `runPhase`, `journal`), the ten `apply` ops, and
  `translateLegacy`/`loadState`/`reverseTranslate`/`serializeSlice`/
  `dropPayload`/`Node`/`createLinkHub`/`reconcileParentTargets`/
  `renderProducingProcess(renderOptions)`/`EventBridge`/`DomAdapter`/
  `SSRFragmentAdapter`. The envelope fields the code-CRUD writes (`hooks`,
  `handlers[].body`, `component`, `props`/`css`/`content`) are real
  `LegacyInitialData` fields. The process split is forced correctly. The
  concrete "requires what doesn't exist" list is entirely HOST-SIDE work (the
  Runtime battery methods, the 11 additive tools, the `battery-host`, the
  cycle-variant data module) — no package gap.
- **CRITIQUE (step 2)** — 8 findings (1 critical, 4 high, 2 medium, 1 low),
  all sustained below.

## 4. The required reshapes (costs-benefits + must-NOT-do)

| # | Reshape | Why (evidence) | Cost / benefit |
| --- | --- | --- | --- |
| **A1** | **Put the trust gate where the trust actually is.** Make the code-authoring surface (`code.*`, and by policy `dispatch`) **opt-in** via a `--mcp-allow`-class flag / optional loopback token, and rewrite the "function-source handlers are trusted app data" claim (decisions.md CSP-UNSAFE-EVAL) so it is an explicit, *authenticated* grant. The engine's `new Function` trusted-backend gate is now reachable by any unauthenticated peer on loopback. | critique F1 (critical) | small host code + doc; restores the upstream trusted-backend assumption this arch currently discards |
| **A2** | **Harden the RendererBackend lifecycle + payload discipline.** Per-request timeouts on the pending map; a `did-finish-load`/`destroyed` hook that rejects/clears `pending` and re-arms readiness; no hardcoded-demo rebind on reload without an explicit "reload resets the graph" contract; bounded/`digest`-based large results so a 4096-element render never serializes ~180MB over IPC (mirror the battery's census+hash64 as a first-class tool output). | critique F2/F3/F8 | host hardening + a few spec pins |
| **A3** | **Make the two-runtime divergence check a permanent CI leg, not a one-shot.** A repeatable Electron subset (bootstrap + a dispatch + a 3-4-deep path-fork render) on every CI, or gate the shim's trust per-shape; pin `code.load`'s teardown == `provident.teardown` (userData clear + settle-gate) so the authoring surface and the battery's C3/C4 invariants cannot drift. | critique F4/F5 | small CI + one spec pin |
| **A4** | **Document the non-incremental cost of `code.load`** (a whole-graph teardown + translate + compile + render per edit) and optionally stage a `code.loadBatch`/write buffer; note the render discontinuity (prior view destroyed then rebuilt). | critique F6 (medium) | doc / optional batch surface |
| **A5** | **Index authored css.id/props.id once at load** (a Map rebuilt on load/teardown) instead of per-call `allNodes().find`; document that minted-nodeId dispatch after teardown is tombstone-undefined. | critique F7 (medium) | small host code |
| **A6** | **Readiness timeout + explicit stateless-HTTP idempotency consequence** (fresh server per POST; dedup is per-supervisor, not per-session). | critique F8 (low) | small host + doc |

Explicit must-NOT-do (adopted from critique): NO permissive default for the
code surface (keep `code.*` off unless opted-in); NO unbounded result payloads
as the default tool output; do NOT treat the one-shot Electron-run as
sufficient (make it repeatable).

## 5. Addendum — the security/permissions design (fed back into the loop)

The A1..A6 reshapes were applied into the design (`docs/specs/mcp-endpoint.md`
§6 "Security & agent permissions", 2026-08-22). The A1 trust gate is now a
concrete design, not an abstract requirement:

- **Tool groups** (`read` / `dispatch` / `graph` / `code`) are the permission
  unit; `read`+`dispatch` ON by default (passive observation + synthetic-event
  driving of the already-loaded graph), `graph`+`code` OFF (mutation / re-load /
  eval) — gated by a human.
- **Loopback bearer token** (HTTP transport): authentication (who), separate
  from the group grant (authorization / what). stdio is spawn-local (the
  trusted path for code-authoring) and not token-gated.
- **Manual-UI-only settings controls**: a renderer Settings pane (the human's
  Electron window) configures the token + group toggles; it is NOT reachable
  over MCP (an agent cannot grant itself capabilities). Persisted via IPC to
  main's config.

The loop verdict is unchanged: VALID-AS-STATED / APPROVED-WITH-RESHAPE. A1 is
the gate the `code.*` surface must clear before it ships beyond a local test;
A2/A3/A4/A5/A6 ride the same design.