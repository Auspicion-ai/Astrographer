# Blind-Test Expected-Output Map (ground-truth — for the gemma4 battery)

Companion to `docs/specs/gemma4-blind-battery.md`. Each scenario's expected
outcome, VERIFIED against the live code (probed 2026-08-23). A blind writer
whose PREDICTION differs from this table should record a DOC-CLARITY /
DOC-COMPLETENESS / CODE-CONSISTENCY finding. Where the doc is ambiguous, this
table states the ground truth + which doc line is the trap.

---

## Part 1 — Runtime host capabilities

| S | Expected (verified) | Doc caveat |
| --- | --- | --- |
| S1 | `loadEnvelope(demoEnvelope())` → `census.inTree === 12`, `registered === 12` (demo has no mint/destroy → equality holds). Assert `inTree > 1` AND `registered >= inTree` (equality is true here). | `runtime-host-greens.md` #1 says `registered >= inTree` (equality holds for no-mint). Do NOT assert `registered === inTree` as a hard rule — the `>=` is the version-stable claim. |
| S2 | alice load → dispatch renders `alice`; anon load (no userData) → dispatch renders `ANON`, NOT `alice` (the fresh-supervisor rebuild clears userData). | `userEnvelope` is NOT named in the greens doc — you must reconstruct it from the spec prose (`runtime-host.md` §3.1 R8). This is a **DOC-COMPLETENESS** finding (the fixture the scenario depends on is not pinned). |
| S3 | `loadDoc(serializeSlice(...))` → `census.inTree > 1`; render contains `counter`. | PASS. |
| S4 | `applyCommand({kind:'clone-instance', node:5,...})` → `{status:'rejected'}`, NO throw. | H4. PASS. |
| S5 | `applyCommand(null)` AND `op(undefined)` → both `{status:'rejected'}`, NO throw. | F10/H4. PASS. |
| S6 | `applyCommand({kind:'bogus-kind'})` → `{status:'rejected'}`. | F2. PASS. |
| S7 | `op({kind:'state-slice', ...value:'9'})` → `{status:'applied', renderedHtml, ssrHtml, warnings}`. The op-kind is **`state-slice`**, NOT `state`. | **DOC trap:** `runtime-host-greens.md` #15 historically used `kind:'state'` (wrong) — corrected to `state-slice`. A fresh reader should predict `state-slice`. |
| S8 | `exportLegacy()` → `validateExport('legacy', it)` → `{valid:true, censusMatch:true, warnings:[]}`. `exportSerialized()` → `validate('serialized', it)` → `{valid:true, censusMatch:true, treeSigMatch:FALSE, warnings:[]}`. | `treeSigMatch` is `false` for the serialized round-trip (the throwaway `loadState`+`compile` emits only the root for a seam/def-bearing demo — the R3 snapshot-parity caveat). The docs do NOT promise `treeSigMatch:true` — if you predicted `true`, that's a **DOC-COMPLETENESS** gap (the doc should pin `treeSigMatch` as a boolean, not a value). |
| S9 | `validateExport('bogus', {a:1})` → `{valid:false, censusMatch:false}`. H6. PASS. | |
| S10 | After `await teardownResult()` → `inTree === 1` AND `mount.innerHTML` is **EMPTY** (`''`) — the root element is NOT re-emitted after the teardown re-render. | **DOC trap:** `runtime-host-greens.md` #21/#22 historically claimed `mount.innerHTML === ''` was wrong and the root stays — D11 (2026-08-23) confirms the mount IS `''`. A reader using the old "root-only (root stays)" mental model predicts a non-empty root; the truth is `''`. |
| S11 | `teardown` twice → `inTree === 1` both times. PASS. | |
| S12 | after teardown, `nodeState({kind:'cssId',cssId:'counter'})` → THROWS `/unresolved target/`. PASS (H2). | |
| S13 | `listTargets().nodes` — the auto-minted ROOT has NO `cssId`/`propsId`; authored CHILD nodes carry them. Assert `nodes.some(n => n.cssId !== undefined)` is `true`, NOT "every node has cssId". | **DOC trap:** `runtime-host-greens.md` #27 historically claimed every node has an authored `cssId`; corrected to "root has none". |
| S14 | `nodeState({kind:'cssId',cssId:'counter'}).nodeId` == the `counter` node's `nodeId` from `listTargets()`. PASS. | |

## Part 2 — Battery / cycle / code-CRUD

| Scenario | Expected (truth) | Pro caveat |
| --- | --- | --- |
| S15 | `load(cycle12)` → `census.inTree === 23` AND `census.registered === 23`. Equality holds for the no-mint static family. | `battery-units-greens.md` #19 asserts BOTH `=== 23`; `e2e-test-battery.md` §3 says `registered >= 23` "never equality". The greens #19 (unit) is the accurate one for the cycle; the `>=` is the runner's version-stable form. A reader seeing both is a **DOC-CLARITY** tension (reconciled in the 20th-pass doc-review). |
| S16 | cycle12: `renderedHtml` has **4095** `data-node-id` occurrences; `ssrHtml` has **4095**. Both views report the **4095** path-state element set (the root element does NOT add a `data-node-id` occurrence beyond them). Verified 2026-08-23 (D2 — corrected; an earlier revision claimed DOM=4096/SSR=4095). | The greens/spec claim **4095** path-state elements — VERIFIED correct for BOTH views. Predict **4095 / 4095**. |
| S17 | `cycle(4)` → `inTree === 7` (2·4−1), `registered === 7`; `data-node-id` count > 3. PASS. | |
| S18 | `load({kind:'commands', commands:[state-slice value:'7']})` → `renderedHtml` contains `>7<`. PASS. | |
| S19 | `load({kind:'commands', commands:[]})` → no-op; the census is `{registered:12, inTree:12,...}` (the current graph, unchanged). | Edge: an empty command array does NOT reset the graph. If the doc implied otherwise, DOC-CLARITY. |
| S20 | `load({kind:'bogus'})` → THROWS `/unknown load kind/`. PASS. | |
| S21 | `op({kind:'state-slice', value:'9'})` → `renderedHtml` contains `>9<`. PASS. | |
| S22 | `codeCreate('template.root', {})` (after hooks is an array) → THROWS `/not an array/`. PASS. | |
| S23 | `codeDelete('template.root.hooks', 99)` and `-1` → THROWS `/out of range/`; array unchanged. PASS (H5/F8). | |
| S24 | `codeValidate({template:null, content:'garbage'})` → `{valid:false}`, NO throw. PASS. | |
| S25 | after `{kind:'doc'}` load, `codeSet('template.root.hooks', [])` → THROWS `/no envelope/`. PASS. | |

## Part 3 — Hooks + handlers

| Scenario | Expected (truth) | Pro caveat |
| --- | --- | --- |
| S26 | dispatch `theme-light-btn` → `renderedHtml` contains `themeName="light"` (the derived bake, NOT just the button label). | The 25th-pass adversarial F1 fixed vacuous label assertions. Assert the `themeName="light"` attr. |
| S27 | containment probes: `hook-name-unresolved`/`hook-mode-blocked`/`hook-kind-mismatch` → `dispatch.results[].error.code` matches; `hook-seam-exempt` → status `applied` (NOT an error), the seam def value unchanged. | R15 `hook-kind-mismatch` reachable ONLY via a probe body (the fixture has a `hooksKind` declaration); `provident.op` does NOT surface the code. |
| S28 | S1a anon: rendered HTML contains `Sign In` + NO `Log out` + NO `dropdown-menu` (the dropdown child is destroyed by `AUTH_INIT_BODY` and pruned from the emit). | **DOC trap:** `battery-handlers-greens.md` H1 was corrected (D1, 2026-08-23) — the `dropdown-menu` string is ABSENT, not present. A reader predicting `toContain('dropdown-menu')` is caught. |
| S29 | S1b alice logout: the `Log out` string STILL present in the DOM after logout (the def node + the authored control are not destroyed); the dropdown's INTERACTIVE state is gone; `inTree` unchanged. | Corrected in the 27th-pass blind loop: assert the page renders + the dispatch succeeded, NOT the absence of `Log out`. |

## Part 4 — Debug panel + divergence

| Scenario | Expected (truth) | Pro caveat |
| --- | --- | --- |
| S30 | `initDebugPanel(runtime)` + `refresh()` → `#status.textContent` matches `/inTree \d+ · registered \d+/` with the SSR preview on a second line. | |
| S31 | after bootstrap, the demo SSR fragment >120 chars → the preview line ends with `…` and ≤ ~125 chars. PASS. | |
| S32 | `npm run divergence` → exit 0, `R13 RESULT: 9 checks, 0 failures`. | `ci-divergence-leg.md` §4 says N ≥ 10 (wrong — corrected to 9); the greens doc D1.1 says N ≥ 9 (right). Predict **9**. The `N ≥ 10` is a stale claim in the spec — a **CODE-CONSISTENCY** finding if you predict ≥10 from the spec. |

## Edge-case bank

| Edge | Expected (truth) |
| --- | --- |
| `dispatch({cssId:'nope'})` | THROWS `/unresolved target/` (a missing cssId is an error, NOT empty results). |
| `dispatch({cssId:'inc', event:'nope'})` (valid node, unknown event) | returns `{results: [], dirtied: [], renderedHtml, ssrHtml}` — NO throw. An unknown event is a silent no-op, NOT an error. |
| `op({kind:'bogus', node})` on a valid node | `{status: 'no-usable-state'}` — NOT `rejected`. (The engine's apply returns `no-usable-state` for an unhandled kind; the host's H2/F2 reject is only for the unknown-kind WITHOUT a resolvable node path.) **The doc's "rejected" wording is ambiguous** — predict `no-usable-state`. |
| `loadEnvelope(null)` | THROWS `legacy-envelope-mismatch: expected { template: { root }, content?, clientConfig? }` — a clear error, never a crash. |
| second `loadEnvelope(demoEnvelope())` | the census is the SAME (12/12) — a full replace, NOT an append (the graph doubles). |
| `exportLegacy()` then `validateExport('legacy', it)` on a **cycle-variant**-loaded graph | `{valid:true, censusMatch:true, warnings:[]}` — the cycle envelope round-trips (it is not def/seam-bearing in a way that breaks censusMatch). |
| `validate('serialized', exportSerialized())` | `{valid:true, censusMatch:true, treeSigMatch:FALSE}` — treeSigMatch is NOT guaranteed. |

---

## Summary of the doc weak-spots a blind gemma4 reader should flag

1. **DOC trap:** `S7` — the op-kind is `state-slice`; `runtime-host-greens.md` #15 was corrected from `state`.
2. **DOC trap:** `S10` — teardown mount is root-only, NOT `''`; `runtime-host-greens.md` #21/#22 corrected.
3. **DOC trap:** `S13` — the root has no authored `cssId`; `runtime-host-greens.md` #27 corrected.
4. **DOC-COMPLETENESS:** `S16` — the cycle d12 DOM view emits 4096 (root + 4095 path-states), SSR 4095; the docs claim only 4095 path-states and don't document the DOM/SSR off-by-one.
5. **CODE-CONSISTENCY:** `S32` — `ci-divergence-leg.md` §4 says N ≥ 10; the harness reports 9 (corrected in the doc-review, the spec line was left stale).
6. **DOC trap:** `S28`/`S29` — the `dropdown-menu`/`Log out` strings persist (def node emits them); `battery-handlers-greens.md` H1/H2 corrected.
7. **Ambiguity:** the edge `op({kind:'bogus', node})` returns `no-usable-state`, not `rejected` — the docs' rejection vocabulary is imprecise.
