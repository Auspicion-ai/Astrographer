# Spec — Battery §5.3 Hooks-Scenarios (data port + containment probes)

Status: **LANDED (2026-08-23)** (battery §5.3 hooks-scenarios unit, next-steps #10). Source:
the upstream `demo/hooks-scenarios.js` fixture. The battery currently covers
§5.1/§5.2/§5.4/one §5.5 handler; this unit adds the full hooks-scenarios block:
the `theme`/`user`/`counter` value-provider envelope, the consumer readouts,
the four hook containment codes (R15 `hook-kind-mismatch` included), driven
over `provident.dispatch`.

## 1. Scope

Port the upstream hooks fixture **data-only** (per AGENTS.md, never modify the
upstream `../Preempt-Providence/` folder) into this repo's test fixtures, and
extend the e2e battery runner with the §5.3 scenario. Data-only: only the
envelope builder (`hooksScenariosEnvelope()`) + the function-STRING handler
body consts are copied (with a provenance header); the upstream PAGE/builder
half (`../dist/core/*`, the harness) is dropped.

The containment codes surface in `dispatch.results[].error.code` via the
`clientAPI.apply` return (the state-slice hooks gate, provident-ssr 0.1.3):

| Code | Trigger | Result |
| --- | --- | --- |
| `hook-name-unresolved` | `clientAPI.apply(root, [{targetProp:'hooks.nosuch', mode:'replace', value:'x'}])` — a name with no source/duplex anchor | `{status:'rejected', error:{code}}` in `dispatch.results` |
| `hook-mode-blocked` | `apply(root, [{targetProp:'hooks.theme', mode:'append', value:'x'}])` — non-`replace` mode | `{status:'rejected', error:{code}}` |
| `hook-seam-exempt` | `apply(root, [{targetProp:'hooks.SetTheme', mode:'replace', value:'x'}])` — a seam/def-shaped (`{name,body}`) provider name | NOT an error — `status:'applied'` + `console.warn`; the layer never lands (assert via `get_node_state` that the value did NOT change) |
| `hook-kind-mismatch` (R15) | a scalar write to a name DECLARED non-`value` kind via `hooksKind: {name:'component'}` | `{status:'rejected', error:{code}}` |

## 2. Deliverables

1. **`tests/fixtures/hooks-scenarios-data.mjs`** — the data-only port:
   - `hooksScenariosEnvelope()` (the theme/user/counter provider envelope,
     pure object builder, no imports).
   - The handler body consts (`SetTheme`/`Login`/`Logout`/`CounterTick` etc. as
     function-STRING data).
   - A provenance header citing the upstream source file + date.
   - **Probe handlers added** (this repo-authored, provenance-noted) that trigger
     the 3 rejection codes + the R15 `hook-kind-mismatch` and RETURN the
     `clientAPI.apply` result, so the code surfaces in `dispatch.results`.
   - A `hooksKind` field on a declared `'component'`-kind name (to reach R15).
2. **`tests/e2e-battery.test.mjs`** — a §5.3 `runScenario`:
   - `provident.load {kind:'envelope', envelope: hooksScenariosEnvelope()}`.
   - Dispatch the 6 controls (theme-light/dark, login, logout, counter-inc/dec)
     → assert the readouts update in `get_rendered_html` (themeName bake,
     session readout, counter badge).
   - Assert `provident.get_node_state` on the consumers shows the resolved
     `bindings.*`.
   - Dispatch the containment probes → assert `results[].error.code` is the
     expected code (hook-name-unresolved / hook-mode-blocked /
     hook-kind-mismatch); assert hook-seam-exempt leaves the layer NOT landed.
   - Export/validate/teardown (root-only restore).

## 3. Behavior (every state / fail-state)

- The hooks envelope is a self-contained `LegacyInitialData` — loadable via
  `provident.load {kind:'envelope'}` (the A2 path), no external data files.
- A consumer's readout reflects the provider's `hooks.<name>` value after a
  control dispatch (themeName bake, sessionLabel, count).
- The 3 rejection codes appear in `dispatch.results[].error.code` (via the
  probe bodies' returned apply result), NEVER a throw.
- `hook-kind-mismatch` is reachable ONLY via a probe body (the fixture has no
  `hooksKind` declaration by default — the §5.3 data adds one). It does NOT
  surface via `provident.op` (that path drops the error code).
- `hook-seam-exempt` is `status:'applied'` (NOT an error) — the assert is that
  the layer did NOT land (the seam def value is unchanged), not a code.
- After teardown, the mount is root-only (C3/C4).

## 4. Verify (the TestWriter's exact states)

- `hooksScenariosEnvelope()` is a valid `LegacyInitialData` (`translateLegacy`
  succeeds with 0 warnings).
- A dispatch on the theme-light control → `get_rendered_html` contains the
  light themeName.
- A dispatch on counter-inc ×2 → the counter badge shows `2`.
- `get_node_state` on a consumer shows `bindings.*` with the resolved value.
- A probe dispatch for each of hook-name-unresolved / hook-mode-blocked /
  hook-kind-mismatch → `dispatch.results[].error.code` matches.
- A probe for hook-seam-exempt → status `applied` AND the layer value unchanged.
- After teardown → `inTree === 1` + empty mount.

## 5. Notes / process

- Data-only provenance: the fixture header cites the upstream source. Never
  modify `../Preempt-Providence/`.
- Per RCA-1..6, this is ONE unit: TestWriter red → Implementer green →
  adversarial → greens → documentation review (record to
  `archive/reviews/<date>-battery-hooks-doc-review.md` — the archive is gitignored; the record is provenance only, findings land in the active trackers).
- The battery runner gains ~N checks (recorded in the DONE row).
- Updating the spec's `docs/specs/e2e-test-battery.md` §5.3 status note
  (PARTIAL → LANDED) is part of the documentation review.

## 6. Status

**LANDED (2026-08-23).** Full per-unit cadence (RCA-1..6): TestWriter red →
Implementer green → adversarial → greens → documentation review.

## 3a. Adversarial findings (RCA-3)

| # | Finding | Verdict | Fix |
| --- | --- | --- | --- |
| F1 | The readout assertions (`html.includes('light')` / `'dark'` / `'guest'`) passed VACUOUSLY — the button labels ("Set **light** theme", "Log in as alice") contain those words, not just the rendered readout. | host-side (battery assertion hygiene) | Assert the DERIVED attribute bake (`themeName="light"`, `sessionLabel="guest"`, `count="2"`) instead of a bare substring. Regression-asserted in the §5.3 checks. |
| H1 | `get_node_state` on a component-bearing node THREW `Converting circular structure to JSON` over MCP: the engine's resolved `CompiledState.anchors` carry live circular `Node`/`Link` refs, and `text()`'s naive `JSON.stringify` rejected them — violating the `types.ts:71` "JSON-safe" contract. | host-side (`src/renderer/runtime.ts`) | `nodeState` now projects each state into a JSON-safe snapshot (anchors → `{role, target, value?}` plain data; bindings/census verbatim). 2 regression tests in `tests/runtime-host.test.ts`. |
| F3 | The seam-exempt "layer did NOT land" assertion was VACUOUS — the root provider resolves to **0 states**, so a `!includes('hook-SetTheme')` string check always passed. | host-side (battery assertion) | Replaced with a FUNCTIONAL proof: after the seam-exempt probe, dispatch `theme-light` and assert the `theme` readout flips — proving the SetTheme def seam was NOT clobbered. |

No package (`provident-ssr`) defect found — all findings are host-side
(`src/`) + fixed here, none handed off.