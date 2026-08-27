# Blind-test greens — U3: `module.*` MCP tool surface

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U3.
Produced from `docs/specs/module-import-proposal.md` §3 + §5. Run by a fresh
agent from the docs only (no implementation read).

## Contract under test (from the docs §3 + §5)

1. `module.install`/`update`/`list` are MCP tools, handled in MAIN (node:fs store).
2. `module.install`: same name+version → no-op; different version → rejected unless `force:true`.
3. `module.list` returns name/version/capabilities (NOT source).
4. Two-gate: `module.install`/`update` require `module` AND `code`; `module.list` needs `module` only.
5. Disabling `code` re-gates `module.install`/`update` (drops them).

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| M1 | `handleModuleTool(store,'module.install',{name,source,version})` | `status:'installed'`; module.list includes it |
| M2 | same name+version again | `status:'no-op'` |
| M3 | same name, different version | `status:'rejected'`; original version kept |
| M4 | same name, different version, `force:true` | `status:'installed'`; new version |
| M5 | malformed (missing name/source) | clean error, never crash |
| M6 | `module.list` | name/version/capabilities, NOT source |
| M7 | `module.update` | `status:'updated'`; new version in list |
| M8 | `module.install/update/list` in `ALL_TOOLS` | present |
| M9 | default gate | none of the three allowed |
| M10 | `applyGatePatch({groups:['module']})` | `module.list` allowed; install/update NOT |
| M11 | `applyGatePatch({groups:['module','code']})` | all three allowed |
| M12 | `applyGatePatch({disable:['code']})` after module+code | install/update drop; list stays |

## Execution record (completed 2026-08-26 — fresh agent, docs only)

**M1-M12: 12/12 PASS.** Throwaway script `/tmp/opencode/u3-blind.test.ts` (cleaned).
No repo files modified.

| # | Result |
| --- | --- |
| M1-M12 | **12/12 PASS** |
