# Green Scenarios — A3 CI Divergence Leg + `code.load` Teardown Pin

Status: **GREEN-SCENARIO SET** — to be attempted during the blind-test loop.
Each scenario below is a behavior `docs/specs/ci-divergence-leg.md` claims; the
blind-test agent runs it against the live harness/units and confirms it
PASSES. A failure is a doc bug OR an un-hardened regression — never a pass.

## D1 — the repeatable divergence harness (A3-a)

1. `npm run divergence` builds + runs `scripts/electron-divergence.mjs`; it
   exits 0 only if EVERY structural check matches (census inTree, census
   registered, dirtied ids normalized, SSR fragment structural, data-node-id
   set, nodeId vocabulary, counter increment in BOTH, non-empty dispatch
   results) — `R13 RESULT: N checks, 0 failures` with N ≥ 9.
2. The harness drives the REAL Electron app (real DOM) over stdio + the
   DOM-shim battery host with the SAME demo envelope + dispatch, then compares.
3. The harness is hermetic (no network; a `--mcp-transport=stdio` spawn; the
   client disconnect ends stdin → the app exits, no lingering process).
4. A mismatch on any check → exit 1 with a per-check `✗` report.

## D2 — the `code.load` teardown pin (A3-b, Runtime unit)

5. After a dispatch that generates pass-2 work, `codeLoad()` (a re-derive)
   leaves `hasPendingWork() === false` (the teardown-then-load drains — the
   `loadEnvelope` path's destroy cascade is settled).
6. `loadEnvelope(env, {userData:{username:'alice'}})` (dispatch sees alice) →
   `codeLoad(otherEnv)` (no userData) → a dispatch on the same handler shape
   sees `ANON`, NOT `alice` (the fresh-supervisor rebuild clears userData; no
   leak into the `code.load` re-derive).
7. `code.load`'s teardown IS `provident.teardown`: after a `codeLoad`, the
   graph is in the SAME root-only-then-loaded state as a `provident.teardown`
   followed by a `provident.load` (the census reflects the new load, not a
   half-torn-down mix).

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/ci-divergence-leg.md` (+ this
  file's claims) and runs `npm run divergence` + the `tests/runtime-battery
  .test.ts` A3-b unit, asserting PASS.
- The green set is the regression net for A3: D1→1–4 (the divergence harness),
  D2→5–7 (the code.load teardown pin).