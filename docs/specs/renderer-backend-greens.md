# Green Scenarios — A2/A6 RendererBackend Lifecycle Hardening

Status: **GREEN-SCENARIO SET** — to be attempted during the blind-test loop.
Each scenario below is a behavior `docs/specs/renderer-backend-hardening.md`
claims; the blind-test agent runs it against the live `RendererBackend` (with a
fake webContents, no Electron) and confirms it PASSES. A failure is a doc bug OR
an un-hardened regression — never a pass.

Module under test: `src/main/mcp-server.ts` `RendererBackend` +
`RendererBackendOptions`. Tests: `tests/renderer-backend.test.ts`. The fake
window (`makeFakeWindow`) exposes `.on(event,cb)` + `.send(channel,msg)` +
`.isDestroyed()` + an `emit(target,event,...)` test seam.

## R1 — readiness timeout (A6)

1. `new RendererBackend({ readyTimeoutMs: 50 })` before `markReady`:
   `isReady()` → `false`; `await invoke(...)` rejects within ~500ms matching
   `/ready.*timeout|timeout.*ready/i`.
2. After `markReady()`: `isReady()` → `true`.

## R2 — happy path

3. After `markReady`, `invoke` sends `provident:invoke` over IPC
   (`fake.sent[0].channel === 'provident:invoke'`); `pendingCount()` → 1.
4. `handleReply({id, ok:true, value})` resolves the `invoke`; `pendingCount()`
   → 0.

## R3 — per-request timeout (A2)

5. `new RendererBackend({ invokeTimeoutMs: 30 })`, `markReady`, `invoke` (no
   reply) rejects after ~30ms matching `/invoke.*timeout|timeout.*invoke/i`;
   `pendingCount()` → 0.
6. A LATE `handleReply` for the timed-out id is a no-op (no throw).

## R4 — reload re-arm (A2)

7. The INITIAL `did-finish-load` (first load, F1) does NOT reset the gate —
   `isReady()` stays `true` + an in-flight `invoke` survives.
8. A SECOND `did-finish-load` (a reload) rejects in-flight `pending` with
   `/reload/i`; `pendingCount()` → 0; `isReady()` → `false`.
9. After a reload, `markReady()` re-arms; a new `invoke` succeeds.

## R5 — destroy (A2)

10. `closed`/`destroyed` reject all `pending` with `/destroy/i`;
    `pendingCount()` → 0; `isReady()` → `false`.
11. `closed` then `destroyed` both firing do NOT double-reset (F5 — idempotent;
    the second is a no-op on an empty map + already-closed gate).
12. After destroy, `invoke` rejects (gate closed) until a new `attachWindow` +
    `markReady`; then a new `invoke` succeeds.

## R6 — stale readyPromise awaiter (F2/F7)

13. An `invoke` awaiting the OLD `readyPromise` that gets reset mid-await is
    REJECTED with the reset reason (never hangs for `readyTimeoutMs`).

## R7 — timer hygiene (F3)

14. The readiness-timeout `setTimeout` is cleared on success — 50 successful
    `invoke`s leave no lingering `Timeout` resources past the timeout window.

## R8 — send-throw cleanup (F4)

15. A `webContents.send` that throws (a destroyed webContents) is caught; the
    `pending` entry is cleaned (`pendingCount()` → 0); the `invoke` rejects
    with `/destroy/i` (never a bare `Object has been destroyed`).

## R9 — attachWindow twice (F6)

16. `attachWindow(fake1)` then `attachWindow(fake2)`: a close on `fake1` does
    NOT reset the backend for `fake2` — `isReady()` stays `true`, an in-flight
    `invoke` to `fake2` survives + resolves.

## R10 — large payload digest (A2)

17. A `handleReply` value with `renderedHtml` > `largePayloadBytes` resolves
    with `{ census, digest, preview, truncated: true }` — NOT the full
    `renderedHtml`/`ssrHtml` (those fields are absent).

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/renderer-backend-hardening.md`
  (+ this file's claims) and runs each scenario against `RendererBackend` with a
  fake webContents, asserting PASS.
- The green set is the regression net for A2/A6 + the F1..F7 adversarial fixes
  (F1→7, F2/F7→13, F3→14, F4→15, F5→11, F6→16).