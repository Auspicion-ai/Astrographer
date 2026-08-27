# Blind-test greens — U1: `module` group + two-gate (security foundation)

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U1.
Produced from `docs/specs/module-import-proposal.md` §5 + §9 and
`docs/specs/module-import-review.md` (third-pass). Execution to be run by a
fresh agent from the docs only (no implementation read).

## Contract under test (from the docs)

1. `module` is a valid `ToolGroup`, OFF by default.
2. Static `module.*` tools (`module.install/update/list/disable/enable`) map to the `module` group.
3. A dynamic `module:<name>.<tool>` name resolves to `module` via prefix.
4. `moduleToolAllowed` (the invocation two-gate): a `module:` tool backed by an
   executable entry requires `module` AND `code`; a pure-capability (non-executable)
   module tool needs `module` only; `executable` defaults true (fail-closed).
5. `module` persists through the security store.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| M1 | `defaultSecurityConfig()` | `module` NOT in enabled |
| M2 | `SecurityGate().apply({groups:['module']})` | gate has `module` enabled |
| M3 | `groupForTool('module.install')` | `'module'` |
| M4 | `groupForTool('module:capture.screenshot')` | `'module'` (prefix) |
| M5 | `toolAllowed('module.list', ['module'])` | true |
| M6 | `toolAllowed('module.list', default)` | false |
| M7 | `moduleToolAllowed('module:x', ['module'], {executable:true})` | false (needs code) |
| M8 | `moduleToolAllowed('module:x', ['module','code'], {executable:true})` | true |
| M9 | `moduleToolAllowed('module:x', ['module'], {executable:false})` | true |
| M10 | `moduleToolAllowed('provident.dispatch', ['module'], {executable:true})` | false |
| M11 | `moduleToolAllowed('module:', ['module','code'], {executable:true})` | false (empty rest) |
| M12 | `moduleToolAllowed('module:x', {} as never)` | false (malformed enabled, never throws) |
| M13 | security store: `set({groups:['module']})` → reload → `module` persisted | true |

## Execution record (completed 2026-08-26 — fresh agent, docs only)

**M1-M13: 13/13 PASS.** Throwaway script `/tmp/opencode/u1-blind.test.ts` (cleaned).
No repo files modified.

**Build-gap finding (confirms F1, the unwired invocation gate):** the build emits a
single `dist/main/main.cjs` Electron bootstrap; the security modules are tree-shaken
in and NOT exported, and `moduleToolAllowed` appears 0 times in the bundle — it is
dead code because nothing calls it. The predicate is unit-tested and passes, but it is
NOT wired into a module-tool dispatch path (that is the U9 unit). This is the F1 flag
the U1 doc-review recorded; wiring lands with U9, not U1.

| # | Result |
| --- | --- |
| M1-M13 | **13/13 PASS** |
