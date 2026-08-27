# Blind-test greens — U4: capability router + internal toolset

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U4.
Produced from `docs/specs/module-import-proposal.md` §4 + §7b and
`docs/specs/module-feature-list.md` §3. Run by a fresh agent from the docs only.

## Contract under test (from the docs §4 + §7b)

1. A `CapabilityRouter` registers modules; each module's entry receives a reduced `ModuleCtx` (the internal toolset).
2. `ctx.tool(name, handler)` registers a tool namespaced `module:<name>.<tool>`.
3. `ctx.onRender(fn)` registers an after-render hook; `runHooks` calls it with a snapshot.
4. `ctx.transform(fn)` registers an emit-only transform; `applyTransforms` composes them in order.
5. A throwing transform is contained (returns the original fragment).
6. `ctx.captureView()` returns a string; `ctx.emit()` returns a Promise.
7. `invokeTool` on an unregistered tool throws a clean error.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| R1 | `registerModule('capture', entry)` with `ctx.tool('screenshot', h)` | `hasTool('module:capture.screenshot')` true |
| R2 | `invokeTool('module:capture.screenshot', args)` | returns handler result |
| R3 | tool namespaced `module:<name>.<tool>` (bare name not registered) | `hasTool('screenshot')` false |
| R4 | `ctx.onRender(fn)` → `runHooks('after-render', snap)` | fn called with snap |
| R5 | two modules same hook | both run, registration order |
| R6 | `ctx.transform(fn)` → `applyTransforms('hello')` | transformed |
| R7 | transforms compose in registration order | A then B |
| R8 | throwing transform | `applyTransforms` doesn't crash, returns original |
| R9 | `ctx.captureView()` | returns a string |
| R10 | `ctx.emit(node, event)` | returns a Promise |
| R11 | `listTools()` | all `module:<name>.<tool>` names |
| R12 | `invokeTool` unregistered | clean error |

## Execution record (completed 2026-08-26 — fresh agent, docs only)

**R1-R12: 12/12 PASS.** Throwaway script `/tmp/opencode/u4-blind.test.ts` (cleaned).
No repo files modified.

| # | Result |
| --- | --- |
| R1-R12 | **12/12 PASS** |
