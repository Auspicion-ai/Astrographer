# Unit K — Failing-Test Resolution Tracker

Hard tracking doc for the 9 failing tests in
`tests/sidebar-panes-host.test.ts` (49 active pass / 7 skipped). **Rule: never re-consider an
option already marked `✗ DEAD END`.** Each row is one considered option; a row
is either `✗ DEAD END` (proven not to work / not viable) or `✓ SELECTED` (the
chosen fix). Only `✓ SELECTED` and unmarked options are actionable.

Status legend: `✗ DEAD END` = proven/decided not viable — do not revisit.
`✓ SELECTED` = the fix to implement. `? OPEN` = not yet decided.

**RESOLVED (2026-08-27):** all 9 failing tests are now GREEN. The `? OPEN`
items (#1/#2/#4) were resolved by a coordinated contract change (decision
landed 2026-08-27): the host owns the current-document/node state (M5 — the
host determines which document is loaded + displayed), and `buildContext`/
`buildTemplateContext` read host-owned state + retained pane data (populated by
boot). The pre-boot snapshot/template assertions now `await boot()` first (per
spec §5.6, the snapshot/template are "set by the boot/re-derive"). The
`PaneContext.snapshot` type was widened to `RagSnapshotPayload | null` (M1
empty-snapshot guard) so the host's nullable `lastSnapshot` assigns cleanly.
Files changed: `src/renderer/sidebar-panes.ts` (host-owned state), `renderer.ts`
(removed `docState`), `pane-registry.ts` + `pane-graph.ts` (snapshot type),
`tests/sidebar-panes-host.test.ts`, `docs/specs/unit-k-sidebar-panes-host.md`.
Trio green (1257 pass). The suite is now **49 active pass / 7 skipped** (49/49
pass — the 7 skipped are the Electron/DOM-dependent §5.8 16-20 + §5.9 10-11
cases, verified by code review / the e2e battery).

---

## 1. buildContext (§5.8.2, M7) — `ctx.snapshot` is `null`, expected `validSnapshot()`

The test calls `buildContext()` WITHOUT `boot()` and expects `ctx.snapshot` to
equal the bridge's snapshot. The host's `lastSnapshot` is `null` (only set by
boot/re-derive).

| # | Option | Status |
| --- | --- | --- |
| 1a | `buildContext` reads `this.lastSnapshot` (null without boot) | ✗ DEAD END — test fails (confirmed: `expected null to deeply equal …`) |
| 1b | Host constructor fetches the snapshot (async) | ✗ DEAD END — constructor is sync; the test is sync; the mock `rag.snapshot` is async |
| 1c | `buildContext` reads the snapshot synchronously from the bridge | ✗ DEAD END — `bridge.rag.snapshot` is async, no sync accessor exists |
| 1d | **Host constructor fetches the snapshot + template and stores them; `buildContext`/`buildTemplateContext` read the stored values** | ? OPEN — needs empirical check: does the constructor's async fetch resolve before the sync `buildContext()` call? (Likely NO — see 1b.) |
| 1e | **The test's `makeHarness` is expected to be awaited / the host is expected to have the snapshot pre-boot** | ? OPEN — verify by reading the harness + test intent; if the harness does not await, this is a spec-vs-test contract tension to resolve (decision, not a code fix) |

## 2. buildTemplateContext (§5.8.3, M8/M12) — `ctx.template` is the default, expected `customTemplate()`

Same root cause as #1: the host's `this.template` is `DEFAULT_CONTENT_WINDOW_TEMPLATE`
because `boot()` was not called.

| # | Option | Status |
| --- | --- | --- |
| 2a | `buildTemplateContext` reads `this.template` (default without boot) | ✗ DEAD END — test fails (confirmed: `expected { root: { type: 'div', … } } to deeply equal { root: { type: 'section', … } }`) |
| 2b | Host constructor fetches the template (async) | ✗ DEAD END — same as 1b |
| 2c | **Host constructor fetches the snapshot + template and stores them; `buildTemplateContext` reads the stored template** | ? OPEN — same as 1d |

## 3. loadAppGraph (§5.9.4) — null `runtime` throws `TypeError`, expected the assemble guard error

`loadAppGraph(null, traversalEnvelope())` calls `runtime.loadEnvelope` on null.

| # | Option | Status |
| --- | --- | --- |
| 3a | `loadAppGraph` checks `runtime == null` and throws `Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')` | ✓ SELECTED — clear, matches the test + spec §5.9.4 |

## 4. selectDocument (§5.8.11, M5/M6) — `buildContext().currentDocumentId` is `null` after `selectDocument('doc-a')`

`selectDocument` sets `this._currentDocumentId`, but `buildContext` reads the
accessor `() => docState.currentDocumentId` (still null).

| # | Option | Status |
| --- | --- | --- |
| 4a | `buildContext` reads the accessor; `selectDocument` sets `this._currentDocumentId` | ✗ DEAD END — disconnected (confirmed: `expected null to be 'doc-a'`) |
| 4b | `buildContext` reads `this._currentDocumentId` | ✗ DEAD END — breaks the buildContext test (#1) which sets `docState.currentDocumentId` directly and expects it to flow through |
| 4c | **`selectDocument` updates the value the accessor reads** | ? OPEN — the host only has the accessor `() => docState.currentDocumentId`; it cannot write `docState`. Verify whether the host is expected to hold its own state that `buildContext` reads, OR whether the accessor is meant to be a getter/setter pair. |

## 5. submitQuery (§5.8.12, M10/M13) — `bridge.rag.query` not called with `('foo', 5)`

`submitQuery` is async and awaits `security.get()` before calling
`bridge.rag.query`; the test asserts synchronously after `submitQuery('foo')`.

| # | Option | Status |
| --- | --- | --- |
| 5a | Async `submitQuery` awaits `security.get()` then calls `bridge.rag.query` | ✗ DEAD END — assertion runs before the async body completes (confirmed: `expected "spy" to be called with arguments: [ 'foo', 5 ]`) |
| 5b | **Host caches security at boot; `submitQuery` checks the cached value synchronously and calls `bridge.rag.query` synchronously** | ✓ SELECTED — matches the M13 gate tests (rag ON → call; rag OFF → fail-closed, both synchronous) |

## 6. template-zone-add (§5.8.14, M16) — `bridge.template.create` not called with `('aside')`

Same async-gate root cause as #5.

| # | Option | Status |
| --- | --- | --- |
| 6a | Async `templateAdd` awaits `security.get()` then calls `bridge.template.create` | ✗ DEAD END — assertion runs before the async body completes |
| 6b | **Host caches security at boot; `templateAdd` checks the cached value synchronously and calls `bridge.template.create` synchronously** | ✓ SELECTED — same as 5b |

## 7. template-reset (§5.8.15, M16) — `bridge.template.reset` not called

Same async-gate root cause as #5/#6.

| # | Option | Status |
| --- | --- | --- |
| 7a | Async `templateReset` awaits `security.get()` then calls `bridge.template.reset` | ✗ DEAD END |
| 7b | **Host caches security at boot; `templateReset` checks the cached value synchronously and calls `bridge.template.reset` synchronously** | ✓ SELECTED — same as 5b |

## 8. template-zone-remove (M16) — `bridge.template.delete` not called with `('aside')`

Same async-gate root cause as #5/#6/#7.

| # | Option | Status |
| --- | --- | --- |
| 8a | Async `templateRemove` awaits `security.get()` then calls `bridge.template.delete` | ✗ DEAD END |
| 8b | **Host caches security at boot; `templateRemove` checks the cached value synchronously and calls `bridge.template.delete` synchronously** | ✓ SELECTED — same as 5b |

## 9. operatorSet (§5.8.27, M9) — the operator scope re-render does not change

`operatorSet` updates `lastOperatorSettings` + calls `renderOperator()`, but
`renderOperator` re-compiles the SAME `operatorNodes` (built at mount with the
OLD settings), so the output is unchanged.

| # | Option | Status |
| --- | --- | --- |
| 9a | `renderOperator` re-compiles the same `operatorNodes` | ✗ DEAD END — stale content (confirmed: `expected '<div data-node-id="node-1999" id="ope…' not to be '<div data-node-id="node-1999" id="ope…'`) |
| 9b | **`operatorSet` re-builds the operator envelope (re-calls `buildOperatorEnvelope` → `settingsContent()` with the new `lastOperatorSettings`) and re-renders** | ✓ SELECTED — the settings pane's `render` reads `lastOperatorSettings`; re-building the envelope re-invokes it with the new value |

---

## Summary of actionable fixes

- **#3**: `loadAppGraph` throws the guard error on null `runtime`.
- **#5/#6/#7/#8**: cache security at boot; make the pane handlers synchronous, checking the cached value (M13 gate).
- **#9**: `operatorSet` re-builds the operator envelope + re-renders.
- **#1/#2/#4**: OPEN — need empirical verification of the harness/test intent (see 1d/1e, 2c, 4c). Do NOT re-derive; run the test / read the harness to decide.
