# Green scenarios — Adapter Parity Battery (blind-test set)

Status: **GREEN (2026-08-23)** — verified against the live battery host by
`node tests/adapter-parity-battery.test.mjs`. This is the blind-test scenario
set for `docs/specs/adapter-parity-battery.md`: an agent who has NOT read the
implementation drives the scenario sequence from these steps against the live
host (`npm run build && node tests/adapter-parity-battery.test.mjs`) and
expects the scenario results below.

## Scenario set

### S1 — static structural shape parity (P1 + P7)

Load the demo envelope (`demoEnvelope`: counter-card + echo-card, input +
handlers). `provident.get_rendered_html` →

- **P1 GREEN**: the structural digest (tag + attrs + text + children) of
  `renderedHtml` (DOM) EQUALS that of `ssrHtml` (SSR) — `treeSig` equal.
- **P7 GREEN**: the `data-node-id` set is equal across both views (normalized
  `node-N` → `node#`).
- **P4 (expected)**: the echo `input` is a VOID tag — neither view carries a
  `value` attribute.
- **P2 (expected — contract pin)**: the `inc` handler renders as an `onclick`
  attribute in the SSR fragment ONLY; the DOM binds a listener (no `onclick`
  attr in `innerHTML`).

### S2 — post-dispatch re-render parity

- Dispatch `inc` (click) → results non-empty (R7).
- **P1 GREEN**: post-dispatch structural digest equal; the counter advanced
  (`>1<`) in BOTH views.

### S3 — handler-arg echo parity

- Dispatch `echo-input` (input, args `['hello parity']`) → results non-empty.
- **P1 GREEN**: echo structural digest equal; `hello parity` in BOTH views.

### S4 — styles / cssDef parity (P3 — expected divergence)

- Load a `cssDef`-bearing envelope (`.parity-badge` rule under `css.cssDef`).
- **P3 pin**: the DOM `innerHTML` carries NO `<style id="preempt-dynamic-styles">`
  (the styles live in `document.head`); the SSR fragment PREFIXES it.
- **P1 GREEN**: the structural tree (styles stripped) is equal across views.

### S5 — removal / destroy persistence (P6 — the TRIAGE SUBJECT)

- Load an envelope with `keeper`, `doomed`, `nuke` (nuke destroys `doomed`).
- Dispatch `nuke` (click) → non-empty; `dirtied` includes the doomed node.
- **P6 — RESOLVED (provident-ssr 0.1.4)**: the SSR adapter now drops the
  destroyed element (parity recovered). The battery asserts the DOM collapse
  AND the SSR drop — **73 checks, 0 failures**. (The defect was recorded in
  `docs/defects.md` + `docs/HANDOFF.md` Round 5 and fixed upstream in 0.1.4;
  the battery's parity-recovered branch is now the green path.)

### S6 — stale-SSR-across-reload (P8, the R13 regression net)

- `provident.load` the demo envelope TWICE.
- **P8 GREEN**: the 2nd load's `ssrHtml` is non-empty and contains `counter` —
  the SSR re-emits (the host's `resetRenderState` re-creates the
  `SSRFragmentAdapter`); it does NOT collapse to empty.

### S7 — fork-arm / path-state structural parity (P9)

- Load a two-fork envelope (`fork-a`, `fork-b`).
- **P9 GREEN**: structural digest equal; both forks present in both views.

## Triage summary

- **Contract pins (documented, assert as-intended, no code change):** P2
  (handler attr in SSR only), P4 (form value/void-tag), P3 (styles live in
  head / SSR prefix).
- **Host green:** P1/P7/P8/P9 structural + data-node-id + reload-survival all
  pass.
- **Engine defect (upstream-owned, handed off):** P6 — `SSRFragmentAdapter`
  retained removed/destroyed elements in `ssr.toString()`. Repro: dispatch a
  destroy; the SSR kept the destroyed element + its siblings while the DOM
  dropped them. Root cause: `SSRFragmentAdapter.removeEl` only did
  `fragments.delete(wireKey(...))` — it never detached the fragment from its
  parent's `children` array nor rematerialized the owner, so the removed
  element survived serialization. **RESOLVED in provident-ssr 0.1.4** — the
  fix shape (splice the child out of its parent state's `children`, null the
  parent, purge `created`, rematerialize the parent) landed upstream
  (dist/core/adapters.js:397-424). The battery now reports parity recovered.
