# Spec — SecurePanels: the isolated Security/Debug pane graph

**Status**: LANDED (2026-08-25 — multi-graph isolation adoption). This spec
pins the shell's implementation of the upstream `GraphScope` isolation surface
(`../Preempt-Providence/docs/specs/multi-graph-isolation-spec.md`) for the
operator-only panes.

## 1. Purpose

The shell's project-wide constraint (AGENTS.md): every non-shell UI element
must be rendered with the provident framework. The Security Settings pane is
**manual-UI-only** (mcp-endpoint.md §6.4) — an agent must never grant itself
capabilities. Both the Security pane and the Debug pane are operator-only UI
that must NOT be reachable by the MCP surface.

Prior to this adoption, the panes were hand-written HTML/DOM in `index.html`
(`settings.ts`/`debug-panel.ts`), violating the constraint, AND they lived in
the same trust domain as the app. This spec renders them as provident data in a
**SECOND, ISOLATED graph** — its own `GraphScope`, so the MCP endpoints (which
read the app Runtime) can never see/dispatch them.

## 2. The isolated graph (D1-D8 contract)

`src/renderer/secure-panels.ts` — `SecurePanels(mount)` owns a second
provident graph:

- **Own `GraphScope`** — `createIsolatedScope()` (D1). The pane graph's
  registry sets (`registered`/`byId`/`contentNodes`/`defPrototypes`/
  `mintedByLayer`/`handlerDefs`/`translateUserData` + the sweep partition) are
  scope-local — no cross-graph addressability with the app Runtime's graph.
- **Own hub** — `createLinkHub()` (per-graph Links; D1 hub-keyed).
- **Own `Supervisor`** — `new Supervisor({ events: new EventBridge(), graphScope })` (D7 per-graph bridge).
- **Own `DomAdapter`** → its own root element (`#panes`).

The app `Runtime` (the MCP surface) boots its graph WITHOUT a `graphScope`
(module singleton = today's behavior, D8). The two graphs share nothing.

## 3. The panes (authored as provident data)

The envelope (function-STRING handler bodies, `translate.md` §2):

| Pane | Node ids | Behavior |
| --- | --- | --- |
| Security Settings | `settings-pane`, `security-status`, `token-input`, `token-clear`, `token-gen`, `toggle:<group>` | token status line; token input; Clear/Regenerate buttons; one toggle per group (`read`/`dispatch`/`graph`/`code`) |
| Debug / agent visibility | `debug-pane`, `status` | the app's census + SSR preview line |

Handlers call **`window.provident.security.get/set`** — the IPC bridge
(main→renderer→main). NEVER an MCP tool. A pane handler body is a
function-STRING that reaches `window.provident.security` and applies the
change over the main-process security store, then the `SecurePanels` host
re-fetches (`refresh()`) + re-renders.

`refreshDebug(runtime)` sources the APP graph's census + SSR preview into the
panes graph's `#status` node (the app graph is read; the pane graph is where
it renders).

## 4. Isolation guarantees (the security-critical acceptance criteria)

- **No cross-graph addressability**: the pane graph uses its own `GraphScope`,
  so `Runtime.dispatch`/`get_rendered_html`/`list_targets`/`get_markdown`/
  `get_node_state` (which read the app graph) NEVER see the security controls
  or the token value. Verified: the app `Runtime.renderedHtmlResult()` +
  `listTargets()` contain no pane content (D2 — handler-def resolution is
  scope-local; a graph-A consumer binding a pane handler name can never
  resolve/compile the pane's body).
- **Manual-UI-only by construction**: pane handlers call the IPC bridge
  (`window.provident.security`), never an MCP tool. An agent with MCP access
  cannot route to these handlers (they are in the isolated graph, and the IPC
  channel is main→renderer→main only — never registered as an MCP tool).

## 5. Verification

- `tests/secure-panels.test.ts` (4) — the isolated graph renders the security
  controls as provident data; the app Runtime never sees the pane content
  (isolation); a Regenerate handler + a group-toggle handler call the IPC
  bridge, never an MCP tool.
- `tests/debug-panel.test.ts` (1) — `SecurePanels.refreshDebug` writes the
  app's census + SSR preview into the panes graph `#status` node.
- `tests/blind-renderer-debug.test.ts` (D1.1/D1.3/D2.6/D3.8/D3.9) + the
  gemma4 blind battery (S30/S31) — the Debug pane's live line, via the panes
  graph.
- Trio + battery: green on `@littlekingsguard/provident-ssr@0.2.0-rc.2`.

## 5a. Adversarial pass (2026-08-25) — the isolation holds

A stress/adversarial pass probed every cross-scope leak vector (an agent
holding ONLY app-graph handles must never reach the isolated panes graph):

- `tests/isolation-adversarial.test.ts` (5) — **D3** `resolveNodeRef` is
  scope-local (the default scope cannot resolve an isolated node id); **D2**
  a handler-def registered in the isolated scope is NOT resolvable from the
  default scope; **D4** `translateUserData` is scope-local (no clobber); **D6**
  the app census excludes the isolated nodes; an app-graph `dispatchEvent` on a
  pane node id is a no-op (never reaches the pane).
- `tests/isolation-adversarial-e2e.test.ts` (5) — through the REAL MCP
  surfaces (`Runtime` + `SecurePanels`): **get_rendered_html** never contains
  pane content ('Loopback token'/'Regenerate'/'Security & agent permissions');
  **list_targets** exposes no pane props.id; an MCP `dispatch` to a pane
  css/props id throws `/unresolved target/`; a pane mutation (token regenerate)
  is invisible to the MCP surface; an app teardown does NOT destroy the pane
  graph (scope-partitioned sweep, D6); a shared minted-id collision resolves
  the APP node in the app scope, never the pane node (scope-local `byId`, D3).

**Verdict: no host defect, no package defect.** The D1-D8 isolation holds — an
agent with app-graph access cannot see, dispatch, or mutate the isolated panes.
Trio green on rc.2: 448 tests / 2 skipped, typecheck clean, build clean,
battery 184/184.

## 5b. Broad 0.1.x regression adversarial pass (2026-08-25) — no 0.2 regression

A broad-spectrum pass over the host's 0.1.x MCP/Runtime surface, hunting
regressions the 0.2 changes (scope threading across registry/serialize/ops/
supervisor + Feature 1a def-prototype round-trip + Feature 3 condensing + the
serialize derived-exclusion) might have introduced into the default (no-opt-in)
path the host runs.

`tests/0-2-regression-adversarial.test.ts` (5):
- **Round-trip intact** — `serializeSlice → loadDoc` preserves the full census
  on a plain demo (no derived/minted exclusion shrink); a fork-cycle envelope
  round-trips without census drift.
- **reRegisterDefPrototypes idempotent** — `loadDoc` twice is stable (no node
  accumulation).
- **clone-instance + teardown** — a minted clone lands in the target graph,
  then teardown cleans it to root-only (no leak).
- **two isolated graphs render independently** — each mounts only its own
  content (no cross-talk).
- The default (no-opt-in) path shares one module registry (D8) — the 0.1.x
  cross-graph byId contract is preserved.

**Verdict: no 0.2 regression found.** The host's 0.1.x surface (dispatch/
render/load/export/validate/teardown/clone-instance) behaves identically under
rc.2. Trio green: 453 tests / 2 skipped, typecheck clean, build clean, battery
184/184. (The R3.5 timing assertion is a pre-existing flake — passes in
isolation.)

## 5c. rc.3 refresh — ISO-ADV-D engine defect (2026-08-25)

Refreshed to `@littlekingsguard/provident-ssr@0.2.0-rc.3` (the upstream
ISOLATION-A/B/C fixes). The rc.3 cross-graph-target guard surfaced a NEW
engine defect — **ISO-ADV-D (X13)**: `translateNodeData`'s `data.children`
recursion (translate.ts:1046) drops the `graphScope` arg, so every CHILD of an
isolated graph's root is constructed with `graphScope = null` → falls into
`DEFAULT_SCOPE` (the app/MCP graph's scope). This is an isolation LEAK (the
pane controls are resolvable/addressable from the app graph) AND it breaks the
rc.3 guard (a `state-slice` on a mis-scoped child is rejected
`cross-graph-target`, so the pane cannot mutate its own controls).

**Host impact**: the SecurePanels group-toggle + token-status writes fail on
rc.3. **BLOCKED** until the upstream threads `graphScope` into the
`data.children` recursion. Filed upstream (`docs/defects.md` ISO-ADV-D +
`docs/HANDOFF.md` Round 7).

## 5d. rc.4 refresh — ISO-ADV-D RESOLVED (2026-08-25)

The upstream fixed ISO-ADV-D in `@littlekingsguard/provident-ssr@0.2.0-rc.4`
(commit `d1691cd`) — threaded `graphScope` into `translateNodeData`'s
`data.children` recursion (translate.ts:1046). Re-verified on rc.4:

- `tests/secure-panels.test.ts` (group-toggle) + `tests/isolation-adversarial-e2e.test.ts`
  (pane mutation/teardown) pass again.
- `tests/isolation-adv-d.test.ts` (1, new) — an isolated graph's CHILD now
  carries the scope: NOT resolvable from the default/app scope (the leak is
  closed), resolvable from its own isolated scope.

Trio green on rc.4: 453 tests / 2 skipped, typecheck clean, build clean,
battery 184/184.

## 5e. Repeat adversarial pass (rc.4) — construction-path exhaustion + cross-scope (2026-08-25)

Re-ran the isolation adversarial pass on rc.4, adding the upstream's
"construction-path exhaustion" check (AGENTS.md item 11a — assert `graphScope`
on EVERY node each distinct construction site produces) plus deeper
cross-scope probes:

- `tests/construction-exhaustion.test.ts` (5) — `graphScope` is threaded at
  every construction site: ROOT + nested `data.children` (depth-2), CONTENT
  payload children, DEF-children prototypes, `loadState` seeds, and
  `clone-instance` copies all carry the isolated scope.
- `tests/construction-exhaustion2.test.ts` (2) — an isolated graph's child is
  NOT addressable from a default-scope supervisor; a render with a MISMATCHED
  scope does not def-fill from the isolated scope (no cross-graph brand leak).

**Verdict: no defect found on rc.4.** The ISO-ADV-D fix holds across every
construction path (no residual mis-scoped node), and the cross-scope seams stay
closed. Trio green on rc.4: 461 tests / 2 skipped, typecheck clean, build
clean, battery 184/184.
