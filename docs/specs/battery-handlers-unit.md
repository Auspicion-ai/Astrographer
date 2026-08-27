# Spec — Battery §5.5 Handler-Scenarios Matrix (anon/alice/main)

Status: **SPEC** (delegation gate for the §5.5 unit, next-steps #10, second
half). Source: `docs/specs/e2e-test-battery.md` §5.5 (the deferred full handler
matrix) + the upstream `demo/handlers-scenarios.js` fixture. The battery
currently covers §5.1/§5.2/§5.3/§5.4 + ONE §5.5 representative (counter `inc`).
This unit lands the full anon/alice/main handler matrix (S1a, S1b, S2..S10),
data-only ported from the upstream fixture.

Status: **LANDED (2026-08-23)** — the full anon/alice/main handler matrix
(S1a, S1b, S2..S10) is implemented + green (battery 184/184). Greens:
`docs/specs/battery-handlers-greens.md`. Adversarial findings: §3a below.

## 1. Scope

Port the upstream `handlers-scenarios.js` fixtures **data-only** (per AGENTS.md,
never modify `../Preempt-Providence/`) into this repo's test fixtures, and
extend the e2e battery runner with the §5.5 matrix. Data-only: the envelope
builders (`userAuthEnvelope`/`anonEnvelope`/`aliceEnvelope`/`mainEnvelope` +
the function-STRING handler body consts) are copied with a provenance header;
the upstream PAGE/builder half (`../dist/core/*`, the harness) is dropped.

The matrix (from the scoping review):
- **S1a anon** — `userAuth`(AUTH-SEAM) + `AuthInit`(after-compile). Load-phase
  drives: chip = "Sign In" (auth-main-btn); dropdown destroyed-but-retained.
- **S1b alice** — `AuthInit` + `Logout`. chip = "Profile ▼"; dropdown alive;
  a logout click destroys the dropdown (retention), page still renders. userData
  is `{username:'alice'}` (R8), and the logout control exists ONLY when userData
  is present.
- **S2** — `LoadComments`/`ClearComments` (load + click): 3 `.comment` injected,
  idempotent re-load (no dup), clear wired.
- **S3** — `WeatherHandler` (click, city arg): "Berlin 12°C"/"Madrid 24°C" +
  `temperature` + `is-cold`/`is-warm`.
- **S4** — `AddToCart` (click): `#cart-badge` = N after N clicks across both
  buttons.
- **S5** — `FilterList` (input, query arg): `.result-item` filtered (no
  accumulation on re-dispatch).
- **S6** — `SelectTab` (click): `is-active` shuffled tab/panel.
- **S7** — `SubmitNews` (submit, arg): `#form-status` msg + `input-error` class.
- **S8** — `VendorWidget` (load): pre-throw write lands ("vendor unavailable");
  **contained Error in dispatch `results`**.
- **S9** — `ShowToast`/`DismissToast` (click): `.toast` minted; dismiss destroys
  (retention slot).
- **S10** — `LoadPanel`+`TouchPanel` (load + click): content "loaded" +
  `.touched` on ONE node (append-with-override).

## 2. Deliverables

1. **`tests/fixtures/handlers-scenarios-data.mjs`** — the data-only port:
   the anon/alice/main envelope builders + the body consts, provenance header.
2. **`tests/e2e-battery.test.mjs`** — the §5.5 matrix (a sequence of
   `runScenario`s, teardown between mounts per the C4 no-external-reset rule):
   - load `anonEnvelope()` → drive the load-phase (`AuthInit` after-compile +
   `userAuth`) → assert S1a rendered HTML → teardown.
   - load `aliceEnvelope()` (userData alice) → assert the logout control is
   present (R8) + S1b rendered HTML → dispatch logout → assert the dropdown is
   destroyed + page still renders → teardown.
   - load `mainEnvelope()` → drive S2..S10 (per-event dispatches) → assert each
   rendered-HTML effect → export/validate/teardown.

## 3. Behavior (every state / fail-state)

- Each envelope is a self-contained `LegacyInitialData` loadable via
  `provident.load {kind:'envelope'}` (A2 path), no external data files.
- The anon/alice envelopes carry userData via the `content[0].userData` payload
  (R8) — alice's logout control exists only when userData is truthy.
- The load-phase (`after-compile` + `load` events) is driven MANUALLY by the
  battery after each load (the battery host does NOT auto-run `after-compile`/
  `load` on load — `loadEnvelope` only compiles+renders).
- Each scenario's dispatch reflects its handler effect in `get_rendered_html`.
- The S8 containment surfaces as a contained `Error` in `dispatch.results`.
- After each scenario, teardown restores root-only (C3/C4) before the next mount.
- No cross-mount state leak: teardown clears the graph + userData (R8) so S2
  does not see S1's state.

## 3a. Adversarial findings (RCA-3 — post-green, read-only)

| # | Finding | Severity | Fix (host-side) | Regression |
| --- | --- | --- | --- | --- |
| F1 | A destroyed node's stale state re-emitted forever: the self-evicting sweep evicts a destroyed node from `allNodes()`, and `renderProducingProcess` keeps a state whose `nodeById` lookup is `undefined` — the destroyed toast (S9) kept rendering after dismiss. | HIGH | The Runtime's `render` prunes `prevStates` entries whose node is no longer in the registry (`src/renderer/runtime.ts`). | S9 dismiss destroys the toast (battery check). |
| F2 | A contained `Error` in `dispatch.results` serialized to `{}` over JSON (an `Error`'s own enumerable props are empty) — the S8 containment verdict was invisible to MCP. | MEDIUM | `dispatch` projects each `Error` result to `{error:{message,name}}`. | S8 dispatch results carry `vendor-down` (battery check). |
| F3 | `exportLegacy` included destroyed nodes, so a structurally-mutated seam/def-bearing envelope (S1a/S1b dropdown destroyed) failed the export→validate censusMatch. | MEDIUM | `exportLegacy` exports only in-tree, not-destroyed content nodes. | S1a/S1b export→validate round-trip (battery check). |

No package (`provident-ssr`) defect — all findings are host-side, none handed
off. The S1a/S1b/main envelopes are seam/def-bearing and structurally mutated,
so their export→validate `censusMatch` is relaxed per R3 (snapshot-parity
only); the export must still round-trip VALID.

## 4. Verify (the TestWriter's exact states)

- `anonEnvelope()`/`aliceEnvelope()`/`mainEnvelope()` are valid `LegacyInitialData`.
- After the S1a load + load-phase drive: rendered HTML shows the "Sign In"
  auth-main-btn; the dropdown is retained.
- After the S1b (alice) load: the logout control IS present; after a logout
  dispatch, the dropdown is destroyed + the page still renders.
- After the S2 load + drive: 3 `.comment` nodes; a re-load is idempotent (no dup).
- After S3: "Berlin 12°C"/"Madrid 24°C" + `is-cold`/`is-warm`.
- After S4 ×3 clicks: `#cart-badge` = 3.
- After S5: the filtered `.result-item` set; no accumulation on re-dispatch.
- After S6: the `is-active` tab/panel shuffled.
- After S7: the `#form-status` message + `input-error` class.
- After S8: the pre-throw write landed + a contained Error in `dispatch.results`.
- After S9: `.toast` minted; dismiss destroys (retention).
- After S10: content "loaded" + `.touched` on ONE node.
- After the matrix: teardown restores root-only.

## 5. Notes / process

- Data-only provenance: the fixture header cites the upstream source. Never
  modify `../Preempt-Providence/`.
- Per RCA-1..6, this is ONE unit: TestWriter red → Implementer green →
  adversarial → greens → documentation review (record to
  `archive/reviews/<date>-battery-handlers-doc-review.md` — the archive is gitignored; the record is provenance only, findings land in the active trackers).
- The battery runner gains more checks (recorded in the DONE row).
- Updating `docs/specs/e2e-test-battery.md` §5.5 status (PARTIAL → LANDED +
  count) is part of the documentation review.