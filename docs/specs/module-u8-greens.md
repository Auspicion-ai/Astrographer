# Blind-test greens — U8: module management pane (SecurePanels)

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U8.
Produced from `docs/specs/module-feature-list.md` §4 (the management pane) +
`docs/specs/module-import-proposal.md` §6 (the store status shape) + §5 U8 row.
Run by a fresh agent from the docs only.

## Contract under test (from the docs §4 + proposal §6)

1. The pane is authored as provident data in the isolated SecurePanels graph
   (`src/renderer/secure-panels.ts`), manual-UI-only (never MCP).
2. The pane reads the module store over a NEW IPC bridge
   (`window.provident.module.get`), mirroring the existing `window.provident.security`
   bridge. The main process owns the module store.
3. `module.get()` returns the store status + modules:
   `{ corrupt, quarantined, loaded, modules }` where each module is
   `{ name, version, capabilities, disabled?, quarantined? }` (proposal §6).
4. The pane renders a `module-list` node showing each module's name + version
   (and quarantine status).
5. `syncConfig` writes the module status + list into the pane graph nodes
   (`module-status` / `module-list`).
6. `module.setDisabled(name, disabled)` toggles a module's disabled flag in the
   store (a disabled module is NOT reported loaded — proposal §6).
7. The real IPC bridge shape is wired (F1 adversarial fix): the main-process
   handler builds the `{corrupt, quarantined, loaded, modules}` result from the
   store.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| P1 | `IPC_MODULE_GET` is exported from `src/shared/types.js` | equals `'provident:module:get'` |
| P2 | `IPC_MODULE_SET_DISABLED` is exported from `src/shared/types.js` | equals `'provident:module:set-disabled'` |
| P3 | `module.get()` on a store with `capture@1.0.0` + `embed@0.2.0` | `corrupt:false`, `quarantined:[]`, `loaded:['capture','embed']`, `modules` array with `capture` (version `1.0.0`, capabilities, not disabled/quarantined) |
| P4 | `SecurePanels.refresh()` with a module bridge | the pane HTML contains `module-list`, the module name `capture`, and version `1.0.0` |
| P5 | `syncConfig` after `refresh()` with two modules | the pane HTML contains both names (`capture`, `embed`) + both versions (`1.0.0`, `0.2.0`) |
| P6 | `module.setDisabled('capture', true)` | `store.status().loaded` no longer contains `capture`; the returned `loaded` excludes it; the `capture` module has `disabled:true` |
| P7 | The real IPC bridge result shape (F1 fix) | the main-process handler builds `{corrupt, quarantined, loaded, modules}` from the store — `corrupt:false`, `loaded` contains `capture`, `modules[0]` is `{name:'capture', version:'1.0.0', ...}` |

## Execution record (2026-08-26)

**P1-P7: PASS — verified by repo suite (7 tests).** The scenarios map 1:1 onto
`tests/module-pane.test.ts`:

| # | Repo test | Result |
| --- | --- | --- |
| P1 | `1. IPC_MODULE_GET is exported from src/shared/types.js` | PASS |
| P2 | `1b. IPC_MODULE_SET_DISABLED is exported from src/shared/types.js` | PASS |
| P3 | `2. get() returns the store status + modules (corrupt/quarantined/loaded + name/version/capabilities/disabled/quarantined)` | PASS |
| P4 | `3. the pane envelope renders a module-list node with per-module enable/disable toggles` | PASS |
| P5 | `4. syncConfig writes the module list + quarantine status into the pane graph nodes` | PASS |
| P6 | `5. setDisabled(name, true) toggles a module disabled in the store (dropped from loaded)` | PASS |
| P7 | `6. the real IPC bridge shape is wired (F1 adversarial fix) — the module bridge result matches the store` | PASS |

The repo suite is authoritative (the same convention as the U5/U6/U7 greens docs).
Trio green 2026-08-26: 646 tests / 2 skipped, typecheck clean, build clean.

## Adversarial findings (recorded in `docs/specs/module-feature-list.md` §4)

- **F1 (fixed):** the real IPC wiring is in place — the preload `module` bridge
  invokes `IPC_MODULE_GET`/`IPC_MODULE_SET_DISABLED` and the main-process
  handlers build the `{corrupt, quarantined, loaded, modules}` result from the
  store.
- **F2 (residual, spec-drift gap — future pass):** enable/disable is
  DISPLAY-ONLY — the pane renders the per-module `☑/☐` state and the
  `setDisabled` bridge exists, but NO control is wired to it yet (no click
  handler toggles a module's disabled flag). The enable/disable CONTROL is a
  future pass; the read-only census + status surface is complete.
