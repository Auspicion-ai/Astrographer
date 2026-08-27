# Spec — A3: Permanent CI Divergence Leg + `code.load` Teardown Pin

Status: **SPEC** (delegation gate for the A3 reshape unit). Source:
`docs/specs/architecture-review.md` §4 A3. The R13 one-shot Electron divergence
check (`scripts/electron-divergence.mjs`) proved the DOM shim matches the real
DOM for the 12-element counter. A3 makes it a **repeatable, self-verifying CI
leg** (not a one-shot a developer runs manually) + pins `code.load`'s teardown
== `provident.teardown` so the authoring surface and the battery's C3/C4
invariants cannot drift.

## 1. Scope

Two parts:

1. **A3-a — a repeatable divergence harness** — promote
   `scripts/electron-divergence.mjs` into a `tests/`-resident script that:
   - is runnable via `npm run divergence` (a package.json script);
   - boots the real Electron app (headless, offscreen) + the DOM-shim battery
     host, drives the SAME minimal scenario (bootstrap + a `dispatch` + a
     3–4-deep path-fork render), compares structural surfaces (census, SSR
     `data-node-id` set, nodeId vocabulary, dirtied ids, counter content,
     non-empty dispatch), and exits non-zero on any divergence;
   - asserts `hasPendingWork() === false` after teardown in BOTH runtimes;
   - is HERMETIC (no network, no display; uses Electron's offscreen/`show:false`
     mode + a temp userData dir).
2. **A3-b — `code.load` teardown == `provident.teardown` pin** — the authoring
   surface's `code.load` re-derives the graph via `loadEnvelope` (which tears
   down first). The pin: `code.load` of a NEW envelope leaves the graph in the
   SAME root-only-then-loaded state as a `provident.teardown` followed by a
   `provident.load`; specifically, after a `code.load`, `hasPendingWork()` is
   false + the prior graph's userData is cleared (no leak into the new load).

## 2. The surface

- `scripts/electron-divergence.mjs` (rewritten/extended) — driven by
  `npm run divergence`; the existing 9-check comparison + the new
  `hasPendingWork()`-after-teardown assertion for both runtimes.
- `package.json` — a `"divergence"` script.
- `tests/code-load-teardown-pin.test.ts` — a vitest unit pinning A3-b against
  the Runtime (no Electron): `codeLoad` after a `codeSet` → `hasPendingWork()
  === false`; `codeLoad` of a fresh envelope after a userData-bearing load →
  no stale userData.

## 3. Behavior (every state / fail-state)

- `npm run divergence` exits 0 only if EVERY structural check matches AND both
  runtimes report `hasPendingWork() === false` after teardown; any mismatch →
  exit 1 with a per-check report.
- The divergence harness does NOT depend on a display (`show: false` +
  offscreen rendering; `webPreferences` matches the app).
- A3-b: after `codeLoad()` (no explicit teardown), the Runtime's
  `hasPendingWork()` → false (the `loadEnvelope` path's settle-gate drains).
- A3-b: a `loadEnvelope(env, {userData:{u}})` then a `codeLoad(otherEnv)` (no
  userData) → the new graph's dispatch sees NO `u` (the prior userData does not
  leak into the `code.load` re-derive; the fresh-supervisor rebuild clears it).

## 4. Verify (states)

- `npm run divergence` → exit 0, report `N/N checks green` (N = 9 — the
  structural comparison checks). The R6 settle-gate (`hasPendingWork() ===
  false`) is asserted at the Runtime unit level (`tests/runtime-battery.test.ts`
  A3-b), NOT in the divergence harness (there is no MCP tool for it).
- `tests/code-load-teardown-pin.test.ts`:
  - `runtime.codeLoad()` after a `codeSet` → `hasPendingWork() === false` +
    `census.inTree > 1`.
  - `loadEnvelope(env, {userData:{username:'alice'}})` dispatch (sees alice) →
    `codeLoad(otherEnv)` (no userData) → a dispatch on the same handler shape
    sees `ANON`, NOT `alice`.

## 5. Notes

- A3-a is a harness/test-script change, NOT application code. It MUST remain
  hermetic (no network, temp userData) so a CI runner can execute it.
- A3-b is a host-side pin (the `code.load`/`loadEnvelope` path already clears
  userData via the fresh-supervisor rebuild; the pin makes that a regression
  net, not an assumption).