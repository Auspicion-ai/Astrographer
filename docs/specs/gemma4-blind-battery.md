# Blind-Test Battery — Document Clarity / Completeness / Code-Consistency (for a gemma4 agent)

Status: **BLIND-TEST BATTERY** (AGENTS.md item 10a + the upstream Preempt-
Providence blind-test pattern). You are the blind writer. Produce scenario code
BLINDLY — from the DOCUMENTATION ONLY — and PREDICT each outcome BEFORE running
it. You must NOT read the implementation (`src/**`) to learn behavior; only the
specs + green docs name the module surface you import.

## Your read-set (the documentation — read these ONLY)

- `docs/specs/runtime-host.md` + `docs/specs/runtime-host-greens.md`
- `docs/specs/battery-units-greens.md` (Units B/C/D)
- `docs/specs/battery-hooks-greens.md` + `docs/specs/battery-handlers-greens.md`
- `docs/specs/mcp-endpoint.md` (§3 tools + §4 code-CRUD), `docs/specs/e2e-test-battery.md` (§3)
- `docs/specs/debug-panel.md` + `docs/specs/debug-panel-greens.md`
- `docs/specs/ci-divergence-greens.md`

Do NOT read `src/renderer/runtime.ts`, `src/main/*.ts`, `tests/e2e-battery.test.mjs`,
or any `tests/` file except the named data fixtures. You may import the names the
docs name: `Runtime` (`src/renderer/runtime.js`), `installShim`/`mountEl`
(`src/shared/dom-shim.js`), `demoEnvelope` (`src/shared/demo-envelope.js`),
`pathForkCycleLegacyData`/`cycleMethodFor`/`CYCLE_METHODS`
(`src/shared/path-fork-cycle.js`), the fixture builders
(`tests/fixtures/hooks-scenarios-data.mjs`, `tests/fixtures/handlers-scenarios-data.mjs`).

## Your task

For EACH scenario below: (1) write the vitest test code BLINDLY (imports + the
exact assertions you believe the docs promise), (2) in a comment ABOVE the test,
PREDICT the outcome (`PASS` / `FAIL` + the exact value you expect), (3) run it,
(4) record the ACTUAL outcome. A mismatch between your prediction and the docs'
promise is a DOC-CLARITY finding; a mismatch between the docs' promise and the
live behavior is a CODE-CONSISTENCY finding. Record both types.

Create `tests/gemma4-blind-battery.test.ts`. Use `describe`/`it`/`expect`,
`beforeAll(installShim)`. After running, paste the full vitest output.

---

## Part 1 — Runtime host capabilities (from `runtime-host.md` / `runtime-host-greens.md`)

**S1. loadEnvelope census** — `new Runtime({mount, envelope: demoEnvelope()})`, then
`runtime.loadEnvelope(demoEnvelope())`. PREDICT the `census.inTree` (is it `> 1`?
an exact number? `registered >= inTree`?). Assert the relation you infer.

**S2. userData no-leak** — the `userEnvelope()` shape is described in
`runtime-host-greens.md` R2 (#5-6). Load it with `{userData:{username:'alice'}}`,
dispatch the read button, then load it WITHOUT userData, dispatch again. PREDICT
the second dispatch renders `ANON`, not `alice`. (Edge: is `userEnvelope` itself
named in the greens doc, or must you reconstruct it from the spec's prose?)

**S3. loadDoc snapshot-parity** — `loadDoc(serializeSlice(translateLegacy(demoEnvelope()).root, ...nodes, {adapter:'dom', persistence:false}))`. PREDICT `census.inTree > 1` and that the render shows `counter`.

**S4. applyCommand reject — non-string node** — `applyCommand({kind:'clone-instance', node:5, source:'x', slot:'y'})`. PREDICT `{status:'rejected'}` with NO throw (H4).

**S5. applyCommand non-object command** — `applyCommand(null)` and `op(undefined)`. PREDICT both → `{status:'rejected'}`, never throw (F10/H4).

**S6. applyCommand unknown kind** — `applyCommand({kind:'bogus-kind'})`. PREDICT `{status:'rejected'}`.

**S7. op applied shape** — `op({kind:'state-slice', node:<counterNodeId>, mutation:[{targetProp:'content', mode:'replace', value:'9'}]})`. PREDICT `{status:'applied', renderedHtml, ssrHtml, warnings}`. NOTE: the spec's op-kind vocabulary (`runtime-host.md`) — is it `state-slice` or `state`? (This is a clarity probe.)

**S8. export + validate round-trip** — `exportLegacy()` then `validateExport('legacy', it)`. PREDICT `{valid:true, censusMatch:true}`. Also `exportSerialized()` → `validate('serialized', it)` — PREDICT whether `treeSigMatch` is `true` or `false` (the docs may or may not claim it).

**S9. validateExport bogus kind** — `validateExport('bogus', {a:1})`. PREDICT `{valid:false, censusMatch:false}` (H6).

**S10. teardown mount state** — after `teardown()` (or `await teardownResult()`), PREDICT `census.inTree === 1` AND whether `mount.innerHTML === ''` (EMPTY) or root-only (the root element stays). (This probes the root-persistence contract — the 20th-pass doc-review fixed this.)

**S11. teardown idempotent** — call `teardown` twice. PREDICT `inTree === 1` both times.

**S12. destroyed cssId unresolved** — after teardown, `nodeState({kind:'cssId',cssId:'counter'})`. PREDICT it THROWS `/unresolved target/`.

**S13. listTargets authored ids** — after `loadEnvelope(demoEnvelope())`, `listTargets().nodes`. PREDICT: does EVERY node carry an authored `cssId`/`propsId`, or does the auto-minted root have none? (This is the #27 clarity probe.)

**S14. id-index resolution** — `nodeState({kind:'cssId',cssId:'counter'})`.nodeId == the counter node's `nodeId` from `listTargets()`. PREDICT equal.

---

## Part 2 — Battery / cycle / code-CRUD (from `battery-units-greens.md`)

**S15. cycle census d12** — `runtime.load({kind:'envelope', envelope: pathForkCycleLegacyData(12)})`. PREDICT `census.inTree === 23` AND `census.registered === 23` (the greens claim BOTH; note the spec's "registered >= inTree never equality" tension).

**S16. cycle d12 element count — DOM vs SSR** — `load(cycle12)`. PREDICT the number of `data-node-id` occurrences in `renderedHtml` AND in `ssrHtml`. The greens doc says 4095 path-state elements. PREDICT whether the DOM view counts 4095 or 4096 (does the ROOT element add one in the DOM view but not the SSR view?).

**S17. cycle depth-4 census** — `pathForkCycleLegacyData(4)` → PREDICT `inTree === 7` (2·4−1) and the `data-node-id` count > 3 (placement-routed path-enumeration).

**S18. load commands (A3)** — `load({kind:'commands', commands:[{kind:'state-slice', node:<counterNodeId>, mutation:[{targetProp:'content', mode:'replace', value:'7'}]}]})`. PREDICT `renderedHtml` contains `>7<`.

**S19. load empty commands** — `load({kind:'commands', commands:[]})`. PREDICT the census (should be a no-op — the graph is unchanged). (Edge: what is `inTree` after a no-op command load on a fresh demo?)

**S20. load unknown kind** — `load({kind:'bogus'})`. PREDICT throws `/unknown load kind/`.

**S21. op state-slice render** — `op({kind:'state-slice', ...value:'9'})` → `renderedHtml` contains `>9<`.

**S22. codeCreate non-array** — after `codeSet('template.root.hooks', [...])`, `codeCreate('template.root', {})`. PREDICT throws `/not an array/`.

**S23. codeDelete out-of-range** — `codeDelete('template.root.hooks', 99)` (and `-1`). PREDICT throws `/out of range/`, array untouched.

**S24. codeValidate malformed** — `codeValidate({template:null, content:'garbage'})`. PREDICT `{valid:false}` NO throw.

**S25. codeSet with no envelope (doc load)** — after a `{kind:'doc'}` load, `codeSet('core.root.hooks', [])`. PREDICT throws `/no envelope/`.

---

## Part 3 — battery hooks + handlers (from `battery-hooks-greens.md` / `battery-handlers-greens.md`)

**S26. hooks readout bake** — load `hooksScenariosEnvelope()`, dispatch `theme-light-btn`, read `renderedHtml`. PREDICT it contains `themeName="light"` (the derived bake, NOT just the button label).

**S27. hooks containment probes** — dispatch the probe controls for `hook-name-unresolved` / `hook-mode-blocked` / `hook-kind-mismatch` (R15) / `hook-seam-exempt`. PREDICT the rejection codes appear in `dispatch.results[].error.code` (and the seam-exempt is `applied` NOT an error).

**S28. handlers S1a anon** — load `userAuthEnvelope(anon)`, drive `AuthInit`. PREDICT the rendered HTML contains `Sign In` and NO `Log out`. (Edge: does it ALSO contain `dropdown-menu` — because the component-def node emits it? The greens doc H1/H2 was corrected to note this — does the doc you read make it clear?)

**S29. handlers S1b alice logout** — load `userAuthEnvelope({username:'alice'})`, drive `AuthInit` then `s1b-logout` click. PREDICT: after logout, is `Log out` string absent or still present in the DOM (the def node emits it)? And `inTree`?

---

## Part 4 — Debug panel + divergence (from `debug-panel-greens.md` / `ci-divergence-greens.md`)

**S30. debug-panel census line** — `initDebugPanel(runtime)` then `refresh()`. PREDICT `#status.textContent` matches `/inTree \d+ · registered \d+/` with an SSR preview on a new line.

**S31. debug-panel truncated preview** — after bootstrap, the demo SSR fragment is >120 chars. PREDICT the preview line ends with `…` and is ≤ ~125 chars.

**S32. divergence harness** — `npm run divergence` → PREDICT exit 0, `R13 RESULT: 9 checks, 0 failures` (the doc says N ≥ 9 — do you predict 9 or ≥10?).

---

## The edge-case bank (include each as its own scenario with a prediction)

- `dispatch` to a MISSING `cssId` (`{kind:'cssId',cssId:'nope'}`) → PREDICT: throws `/unresolved node target/` OR returns empty results?
- `dispatch` with an **unknown event** (`event:'nope'` on a valid node) → PREDICT: empty `results`/`dirtied` OR a throw?
- `op` with a **bogus kind** on a valid node → PREDICT `{status:'rejected'}` OR `{status:'no-usable-state'}`? (Does the doc name `no-usable-state` or `rejected`?)
- `loadEnvelope(null)` → PREDICT throws `legacy-envelope-mismatch` (never a crash).
- A **second `loadEnvelope(demoEnvelope())`** after the first → PREDICT the census is the SAME (a full replace, not an append).
- `exportLegacy()` then `validateExport('legacy', it)` on a **cycle-variant-loaded** graph → PREDICT `valid:true, censusMatch:true` (or does the def/seam-bearing cycle envelope fail censusMatch per R3?).
- `validate('serialized', exportSerialized())` → PREDICT `valid:true, censusMatch:true, treeSigMatch:false` (or true?).

---

## Report format

1. For EVERY scenario, show: the code you wrote blindly, the PREDICTION line, and the RUN result (PASS/FAIL).
2. Classify each mismatch:
   - **DOC-CLARITY**: the doc's prose was ambiguous / self-contradictory / named a surface or value it did not pin (quote the doc line).
   - **DOC-COMPLETENESS**: the doc omitted a scenario/edge/return-shape that the code actually exposes.
   - **CODE-CONSISTENCY**: the doc's claim contradicts the live behavior (quote the doc claim vs the observed output).
3. Rank the most confusing doc sections by what a fresh reader would trip on.
