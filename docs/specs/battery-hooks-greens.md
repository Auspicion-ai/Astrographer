# Green scenarios — Battery §5.3 hooks-scenarios (blind-test set)

Status: **GREEN (2026-08-23)** — verified against the live battery host by the
battery run (116 checks, 0 failures). This is the blind-test scenario set for
`docs/specs/battery-hooks-unit.md`: an agent who has NOT read the
implementation drives the scenario sequence from these steps against the live
host (`npm run build && node tests/e2e-battery.test.mjs`) and expects every
step to pass.

## Scenario set

### H1 — Load the hooks envelope (A2)

`provident.load { kind:'envelope', envelope: hooksScenariosEnvelope() }`

- Expect `census.inTree > 1` (22 nodes: root + theme/user/counter provider +
  readouts/controls/probes).
- Expect `renderedHtml` non-empty.
- Expect `warnings` is an array (R10).

### H2 — S1 theme switcher

- Dispatch `theme-light-btn` (click, `value:'light'`) → results non-empty (R7),
  status `applied`.
- `get_rendered_html` shows `themeName="light"` (the derived bake — NOT a bare
  substring, which the button label also contains).
- Dispatch `theme-dark-btn` (click, `value:'dark'`) → `themeName="dark"`.

### H3 — S2 user/session

- Dispatch `login-btn` (click, `value:'alice (admin)'`) → `sessionLabel="alice (admin)"`.
- Dispatch `logout-btn` (click) → `sessionLabel="guest"`.

### H4 — S3 live counter

- Dispatch `counter-inc-btn` (click, args `'1'`) then `'2'` → `count="2"`.

### H5 — consumer node_state

- `get_node_state { target:'theme-readout' }` → `states[0].bindings.theme === 'dark'`.
- The snapshot serializes (JSON-safe — the raw engine state would be circular).

### H6 — containment probes (the 4 verdicts)

- Dispatch `probe-name-btn` → `results[0].error.code === 'hook-name-unresolved'`.
- Dispatch `probe-mode-btn` → `results[0].error.code === 'hook-mode-blocked'`.
- Dispatch `probe-kind-btn` → `results[0].error.code === 'hook-kind-mismatch'` (R15).
- Dispatch `probe-seam-btn` → `results[0].status === 'applied'` (NOT an error);
  then dispatch `theme-light-btn` → `themeName="light"` — the SetTheme def seam
  was NOT clobbered (the functional proof; the root resolves to 0 states so a
  "no hook-SetTheme layer" string check would pass vacuously).

### H7 — export / validate / teardown (root-only restore)

- `provident.export { format:'legacy' }` → a legacy envelope.
- `provident.validate { kind:'legacy', export }` → `valid === true`,
  `censusMatch === true`.
- `provident.teardown` → `census.inTree === 1`; `get_rendered_html` is root-only
  (no counter). The next scenario boots clean (C4, no cross-scenario leak).

## Cross-scenario leak guard (adversarial hardening)

After H7 teardown, a subsequent scenario's mount must NOT contain any hooks
readout text (`themeName=`, `sessionLabel=`, `count=`) from this scenario —
the teardown restores a root-only graph (asserted by the runner's
`assertRootOnly`).
