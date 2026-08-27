# Blind-test greens — `provident.journal` (journal reversibility endpoint)

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a). Produced from the
DOCUMENTATION ONLY — `docs/specs/mcp-endpoint.md` §3.6, `docs/FORKER.md` §4
(J1-J8 digest), and the upstream engine spec
`../Preempt-Providence/docs/specs/undo-redo-report.md`. No implementation reading. **Execution
COMPLETED 2026-08-26** — B1-B10 all PASS against the live modules (10 tests,
throwaway script in `/tmp/opencode/` cleaned up). **Adversarial gaps 4-10
closed 2026-08-26** — 7 adversarial tests added to `tests/journal-endpoint.test.ts`
(19 total); gaps 1,2,3,11,12 deferred (pending.md).

## Contract under test (from the docs)

1. `provident.journal` takes `{ action: 'undo'|'redo'|'replay' }`.
2. It drives the engine's `Supervisor.undo()`/`redo()`/`replay()` and re-renders.
3. Returns `{ status, scheduledDirtied, stackTopKind?, redoTopKind?, baseBoundary, renderedHtml, ssrHtml, warnings }`.
4. `status` is `'applied'` | `'no-op'` | `'base-boundary'`.
5. `undo` after a `state-slice` reverts the value; `redo` re-applies; `replay` re-runs.
6. `undo` with an empty stack → `status:'no-op'` (never throws).
7. A malformed/non-string action → throws `unknown journal action`.
8. The tool is in the `graph` group (OFF by default); enabled when `graph` is granted.
9. The server registers `provident.journal` only when `graph` is enabled.

## Scenarios

| # | Scenario | Expected (from docs) |
| --- | --- | --- |
| B1 | `journal('undo')` after a `state-slice` on the counter content | `status:'applied'`; the rendered HTML no longer contains the post-op value |
| B2 | `journal('redo')` after the undo | `status:'applied'`; the rendered HTML contains the post-op value again |
| B3 | `journal('replay')` after a `state-slice` | `status:'applied'`; the rendered HTML contains the post-op value |
| B4 | `journal('undo')` with an empty stack | `status:'no-op'`; never throws |
| B5 | `journal('bogus')` / `journal(undefined)` / `journal(null)` / `journal(42)` | throws `unknown journal action` |
| B6 | `SecurityGate` default (read+dispatch) | `provident.journal` NOT allowed |
| B7 | `SecurityGate` with `graph` granted | `provident.journal` allowed |
| B8 | `ProvidentMcpServer` default gate | `allowedToolNames()` does NOT include `provident.journal` |
| B9 | `ProvidentMcpServer` after `applyGatePatch({groups:['graph']})` | `allowedToolNames()` includes `provident.journal` |
| B10 | The journal result shape | has `status`, `scheduledDirtied`, `renderedHtml`, `ssrHtml`, `warnings`, `baseBoundary` |

## Runner (throwaway — NOT committed)

A fresh agent writes a throwaway script in `/tmp/opencode/` importing the real
`Runtime` (`src/renderer/runtime.js`), `SecurityGate`/`ProvidentMcpServer`
(`src/main/*.js`), the DOM shim (`src/shared/dom-shim.js` `installShim()`/
`mountEl()`), and the demo envelope (`src/shared/demo-envelope.js`
`demoEnvelope()`), then runs B1-B10 and records pass/fail. A FAIL is a doc/spec
drift OR an un-hardened regression — never a pass.

## Execution record (completed 2026-08-26)

Command: `npx vitest run --config /tmp/opencode/vitest-blind.config.ts`

Output: `✓ journal-blind-test.ts (10 tests) 21ms | Tests 10 passed (10)`

| # | Result | Notes |
| --- | --- | --- |
| B1 | **PASS** | `journal('undo')` after `state-slice` → `status:'applied'`; rendered HTML no longer contains the post-op value |
| B2 | **PASS** | `journal('redo')` after undo → `status:'applied'`; rendered HTML contains the post-op value again |
| B3 | **PASS** | `journal('replay')` after `state-slice` → `status:'applied'`; rendered HTML contains the post-op value |
| B4 | **PASS** | `journal('undo')` with empty stack → `status:'no-op'`; never throws |
| B5 | **PASS** | `journal('bogus')` / `undefined` / `null` / `42` → throws `unknown journal action` |
| B6 | **PASS** | `SecurityGate` default (read+dispatch) → `provident.journal` NOT in allowed tools |
| B7 | **PASS** | `SecurityGate` with `graph` granted → `provident.journal` allowed |
| B8 | **PASS** | `ProvidentMcpServer` default gate → `allowedToolNames()` does NOT include `provident.journal` |
| B9 | **PASS** | `ProvidentMcpServer` after `applyGatePatch({groups:['graph']})` → `allowedToolNames()` includes `provident.journal` |
| B10 | **PASS** | Journal result shape has `status`, `scheduledDirtied`, `baseBoundary`, `renderedHtml`, `ssrHtml`, `warnings` |

## Adversarial findings (closed 2026-08-26)

| Gap | Scenario | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| GAP 4 | `replay` clears redo stack | `redo` after `replay` → `no-op` | `no-op` | **PASS** |
| GAP 5 | Double-undo (non-idempotent, J7) | Two undoes invert two different ops | First undoes most recent, second undoes previous | **PASS** |
| GAP 6 | Dispatch handler side effects ARE undoable | `undo` after `dispatch('inc')` → `applied` (reverses handler's internal state-slice) | `applied` | **PASS** |
| GAP 7 | Id index coherence after mixed destroy+undo | `listTargets()` returns consistent data after undo cycle | Non-empty list, all nodes have truthy nodeId, destroyed node absent | **PASS** |
| GAP 8 | Fail-closed gate (graph disabled) | `provident.journal` NOT in `allowedToolNames()` | Not in list | **PASS** |
| GAP 9 | Journal after `teardown` → stacks emptied | `undo` → `no-op` | `no-op` | **PASS** |
| GAP 10 | Journal after `load` (re-derive) → stacks emptied | `undo` → `no-op` | `no-op` | **PASS** |

### Deferred adversarial gaps (recorded in pending.md)

| Gap | Scenario | Why deferred |
| --- | --- | --- |
| GAP 1 | `base-boundary` status after condense | Latent — host never sets `maxJournalLength` |
| GAP 2 | `scheduledDirtied` contents after undo | Lower value — return shape test asserts keys exist |
| GAP 3 | `stackTopKind` / `redoTopKind` after ops | Lower value — return shape test asserts keys exist |
| GAP 11 | Zod boundary rejects malformed input | Lower value — runtime guard catches what zod misses |
| GAP 12 | Renderer destruction mid-flight | Hard to test (async race); defer to A2 hardening |
