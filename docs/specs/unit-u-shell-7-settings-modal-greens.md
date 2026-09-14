# Blind-test Greens — Unit U-SHELL-7 — Settings Modal (C3, SHELL + toggle + re-mount)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-7-settings-modal.md` (§2.1 `createModalController`
  TOTAL/idempotent/involution/callback-order/fail-soft; §2.3 the `isOpen()`↔class
  XOR mirror as the single source of truth; §2.4 toggle/Escape/scrim affordances;
  §2.5 the re-parent of `#panes` + `#operator-panes` into `#settings-modal-body`;
  §2.6 `installSettingsModal` FAIL-SOFT + per-document idempotent; §2.8 the
  source-pinned listener/class/installer surface; §3a states 1–6 + §3b states
  7–14; §4 F1–F12; §5.7 PBT register P-IM-1…P-TP-3). **NO implementation read**
  for expectation logic: `src/renderer/modal-state.ts`,
  `src/renderer/renderer.ts`, `src/renderer/index.html` were NOT read for
  expectations — only the **source-pin surface** (the §2.8 literal-call layer) is
  statically asserted via `readFileSync`, per the house convention. Live module
  surfaces (`createModalController`, `installSettingsModal`) were discovered by
  **executing** the module under the dom-shim test harness
  (`src/shared/dom-shim.ts` — `installShim()` / `shimDocument` /
  `dispatchPointer('click'|'keydown')` / `getElementById` / `appendChild` /
  `className`), never by reading implementation.
- **Run file:** a throwaway `tests/__blind_u_shell_7_greens.test.ts` (vitest),
  **DELETED after the run**; no persistent `src/**` or `tests/**` change; no
  commit (the artifact is the only commit).
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_7_greens.test.ts`
  from the Astrographer repo root. **31 PASS / 0 FAIL / 2 NOT-TESTABLE** (both
  `it.todo`, browser-only).
- **Source under test (LIVE modules):** `src/renderer/modal-state.ts`
  (`createModalController` + `installSettingsModal`), driven under the dom-shim;
  `src/renderer/renderer.ts` (§2.8 source-pin — the `installSettingsModal(`
  caller in `main()`), `src/renderer/index.html` (§2.8 source-pin — the pinned
  ids + the `.settings-modal.is-closed { display:none }` CSS rule + the initial
  `is-closed` state class).
- **Result:** **31 PASS / 0 FAIL / 2 NOT-TESTABLE**. No package findings; no
  host regressions; no doc/spec drift observed.

## Legend

- **PASS** — observed behavior matches the spec contract (driven through the live
  modules / dom-shim, or statically source-pinned per §2.8).
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).
- **NT** — NOT-TESTABLE (recorded via `it.todo`, never a failure): requires a
  computed `display` / `getComputedStyle` (browser-only) or a real-DOM
  `getElementById → null` absent-element path the dom-shim cannot produce.

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| S1 | `createModalController({initialOpen:true})` → `isOpen()===true`, no callback at construction; `close()` flips + `onClose` once | §3a.1, §2.1 | PASS |
| S2 | default / no-arg / `{initialOpen:false}` → `isOpen()===false`, no callback | §3a.2, §2.1 | PASS |
| S3 | `toggle()` closed→open → flips `true`; `onOpen` then `onToggle` (order) | §3a.3, §2.1 | PASS |
| S4 | `toggle()` open→closed → flips `false`; `onClose` then `onToggle` (order) | §3a.4, §2.1 | PASS |
| S5 | `open()` on open is a no-op — state + `onOpen` + `onToggle` all unchanged | §3a.5, §2.1 | PASS |
| S6 | `close()` on closed is a no-op — state + `onClose` unchanged | §3a.6, §2.1 | PASS |
| F2 | THROWING `onOpen/onClose/onToggle` → fail-soft: transition completes, never throws | §4 F2, §2.1 | PASS |
| P-IM-1 | `createModalController` TOTAL over its option domain (incl. 250 generated shapes); non-boolean `initialOpen`→`false`; non-function callbacks→no-ops | §5.7 | PASS |
| P-SM-1 | 2-valued deterministic idempotent FLIP over `{open,close}`; `open();open()`==`open()`, `close();close()`==`close()`; equal sequences → equal traces | §5.7 | PASS |
| P-SM-2 | callbacks fire exactly on real transitions, in deterministic order; construction fires none; idempotent no-op fires none | §5.7 | PASS |
| P-TP-1 | `toggle()` is exactly the invert transform + involution (`S → ¬S → S`); always fires `onToggle` + exactly one of `{onOpen,onClose}` | §5.7 | PASS |
| P-TP-2 | `isOpen()` deterministic + side-effect-free (100× stable reads); deep-equal opts + identical sequences → identical traces | §5.7 | PASS |
| P-TP-3 | `isOpen()` maps 1:1 to the class mirror (test-built `applyMirror` on a shim frame); exactly one of `{is-open,is-closed}` after every transition; sibling class preserved; idempotent no-ops churn nothing | §5.7 | PASS |
| S7 | Toggle flips; Escape + Scrim close — same class mirror throughout | §3a.7 / §2.4 | PASS |
| S8 | Hidden by default — frame carries `is-closed`, no `is-open`, after install | §3b.8, §2.3 | PASS |
| S9 | Toggle `click` flips frame classes to `is-open` | §3b.9, §2.4 | PASS |
| S10 | `keydown` Escape flips open frame to `is-closed` | §3b.10, §2.4 | PASS |
| S11 | Scrim click closes; a click on the modal CONTENT does NOT close (F12) | §3b.11, §2.4/§4 F12 | PASS |
| S12 | Modal-body children are EXACTLY the two operator mounts `#panes` + `#operator-panes` (identity-asserted) | §3b.12, §2.5 | PASS |
| S13 | Single class-write per transition; idempotent Escape/scrim no-ops churn nothing (ADV2) | §3b.13, §2.3 | PASS |
| S14 | Initial state mirrored at install (reflects `initialOpen` default `false`) | §3b.14, §2.6 | PASS |
| F5 | DOUBLE-install idempotent — ONE toggle listener, ONE re-parent on the same document | §4 F5, §2.6 | PASS |
| F7/F11 | no DOM + absent `getElementById` → `installSettingsModal` no-op, never throws; pure controller unaffected | §4 F7/F11 | PASS |
| F8 | non-Escape keydown ignored (no close, never a throw) | §4 F8 | PASS |
| F3/F4 | Escape/scrim while already closed → idempotent no-op (no class write) | §4 F3/F4 | PASS |
| SP1 | `renderer.ts` — `installSettingsModal(` caller present in `main()` with the pinned `panes`/`operatorPanes` mounts object | §2.8, §2.6 | PASS |
| SP2 | `modal-state.ts` — `createModalController({initialOpen:false})` + the `isOpen()`-read class mirror (`is-open`/`is-closed` XOR) | §2.8.4 | PASS |
| SP3 | `modal-state.ts` — ONE toggle `click`→`toggle()`, ONE `keydown` routing `Escape`→`close()`, ONE direct scrim `click`→`close()` | §2.8.1–3 | PASS |
| SP4 | `modal-state.ts` — re-parent of `#panes` + `#operator-panes` via `appendChild` | §2.8.6, §2.5 | PASS |
| SP5 | `index.html` — pinned ids (`settings-modal`/`-toggle`/`-body`/`-scrim`) + `.settings-modal.is-closed { display:none }` rule | §2.2, §2.8 | PASS |
| SP6 | `index.html` — frame carries `settings-modal` + `is-closed` and the `is-open` state class (hidden by default) | §2.2, §2.3 | PASS |
| NT1 | computed `display` visibility (`#settings-modal.is-closed { display:none }` + `getComputedStyle`) | §2.3, §3b.8 | NT — browser-only |
| NT2 | F6 absent-frame fail-soft (real-DOM `getElementById → null`) | §4 F6 | NT — live-DOM-only |

---

## Coverage notes

**Pure / PBT (node-testable, §2.1 + §5.7):** the controller is pure and DOM-free
as spec'd — all deterministic, seeded (mulberry32, fixed seeds); the P-TP-3 row
uses the spec-authorized test-built `applyMirror` (reads `isOpen()` onto a shim
frame's class tokens) plus the live wiring's single-write behavior (S13).

**Wiring via the dom-shim (§3b / §2.7):** a shim `body` is authored with
`#settings-modal`, `#settings-modal-body`, `#settings-toggle`,
`#settings-modal-scrim`, `#panes`, `#operator-panes`; the LIVE
`installSettingsModal` is driven under `installShim()` and the results read back
through `shimDocument.getElementById(...)`. Affordances are driven with
`shimDocument.dispatchPointer('click', …)` / `dispatchPointer('keydown', {key})`.

**Re-parent assertion (§3b S12):** the dom-shim's `getElementById` returns an
element whose `.id` stays `''` (only the byId map key carries the id) — so the
modal-body children are asserted **by element identity** against the
resolve-by-id mounts, not by the `.id` attribute. This is a dom-shim harness
quirk, not an implementation drift.

**§2.8 source-pin:** `renderer.ts`, `modal-state.ts`, and `index.html` are
asserted via `readFileSync` literal checks (the house source-pin convention) —
never read for expectation logic. All six sub-surfaces pass.

## NOT-TESTABLE list (browser-only / live-DOM-only)

1. **NT1 — computed `display` visibility (§2.3 / §3b state 8 / the
   `#settings-modal.is-closed { display:none }` rule):** the rendered
   visibility + `getComputedStyle` are browser-only. The node-testable proxy —
   the `.is-open` XOR `.is-closed` class-token set (S8/S14/S13) — passes; the
   `.is-closed { display:none }` CSS text is source-pinned (SP5). **NOT-TESTABLE.**
2. **NT2 — F6 absent-frame fail-soft (§4 F6):** the "absent modal frame /
   toggle / body → no-op" branch requires a real `getElementById` that returns
   `null`; the dom-shim's `getElementById` never returns `null` (it mints a fresh
   element). The no-`document` branch (F7) and the absent-`getElementById`
   branch (F11) are node-driven PASS; the absent-*element* branch is
   live-DOM-only. **NOT-TESTABLE.**

## Tally

| Result | Count |
| --- | --- |
| **PASS** | **31** |
| **FAIL** | **0** |
| **NOT-TESTABLE** | **2** (`it.todo`, browser-only — never a failure) |

## Drift / notes

- **No doc-vs-code drift observed.** The live `installSettingsModal` +
  `createModalController` behave exactly per §2.1/§2.3/§2.5/§2.6; all §5.7
  propositions hold; every §2.8 source-pin literal is present.
- **One probe-script defect (self-corrected, not a spec drift):** the initial
  P-SM-2 fixed-trace called `open()` on a controller that was *closed* after two
  `toggle()`s (a genuine closed→open transition → `onOpen` correctly fired), not
  an idempotent no-op; the trace was corrected and re-ran PASS. The live
  controller is correct.
- **Dom-shim harness note (not a drift):** `getElementById` mints fresh elements
  with an empty `.id` attribute; the S12 re-parent assertion therefore checks
  element identity. No `provident-ssr` findings; no `docs/defects.md` /
  `docs/HANDOFF.md` addition required.
