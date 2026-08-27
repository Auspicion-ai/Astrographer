# Blind-test greens — U7: async-queue data-hook (M-r12)

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U7.
Produced from `docs/specs/module-import-proposal.md` §4 (hook seam: "async-queued
off the sync render path (M-r12); data-minimized snapshot") + §7/§7b +
`docs/specs/module-feature-list.md` §3/§5. Run by a fresh agent from the docs only.

## Contract under test (from the docs §4 + feature-list §3)

1. `ctx.uploadQueue()` returns an object with `enqueue` and `drain`.
2. `enqueue(item)` buffers synchronously; `drain(processor)` processes the
   buffered items in order (each item is passed to the processor).
3. The queue is BOUNDED (max 1000, drop-oldest) — enqueueing past 1000 drops the
   oldest; the buffer never exceeds 1000.
4. `drain` is ASYNC (returns a Promise) and does NOT block the sync render path;
   `enqueue` is synchronous.
5. A throwing processor is CONTAINED — it does not crash `drain`; later items
   still process.
6. An ASYNC processor that rejects is CONTAINED (awaited + caught — never an
   unhandled rejection); later items still process (H1 adversarial fix).
7. `uploadQueue()` returns the SAME queue per module ctx (M1 adversarial fix).

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| Q1 | Call `ctx.uploadQueue()` in a module entry | returns an object whose `enqueue` and `drain` are both functions |
| Q2 | `enqueue('node-a')`, `enqueue('node-b')`, then `await drain(processor)` | processor receives `'node-a'` then `'node-b'` (in order) |
| Q3 | `enqueue` 1001 items, then `await drain(processor)` | exactly 1000 items processed; the OLDEST (item 0) is dropped; the bound holds at 1000 |
| Q4 | `enqueue('x')`, then `drain(...)` returns a Promise; `enqueue('y')` while draining | `drain` returns a Promise instance; the synchronous `enqueue` does not throw; the processor ran |
| Q5 | `drain` with a processor that throws on the first item | `drain` resolves (does not reject); later items still process |
| Q6 | `drain` with an ASYNC processor that rejects on the first item | `drain` resolves; no unhandled rejection; later items still process |
| Q7 | Call `ctx.uploadQueue()` twice in one module | both calls return the SAME object (one queue per ctx) |

## Execution record (2026-08-26)

**Q1-Q7: PASS — verified by repo suite (7 tests).** The scenarios map 1:1 onto
`tests/module-queue.test.ts`:

| # | Repo test | Result |
| --- | --- | --- |
| Q1 | U7 `1. ctx.uploadQueue() returns an object with enqueue and drain` | PASS |
| Q2 | U7 `2. enqueue(item) buffers the item; drain() processes it (the processor receives the item)` | PASS |
| Q3 | U7 `3. the queue is BOUNDED — enqueueing past the max (1000) drops the oldest` | PASS |
| Q4 | U7 `4. drain is ASYNC (returns a Promise) and does NOT block the sync path (enqueue is synchronous)` | PASS |
| Q5 | U7 `5. a processor that throws does NOT crash drain — the error is contained and the queue continues` | PASS |
| Q6 | U7 `6. an ASYNC processor that rejects is contained — no unhandled rejection, later items still process (H1 adversarial fix)` | PASS |
| Q7 | U7 `7. uploadQueue() returns the SAME queue per module ctx (M1 adversarial fix)` | PASS |

The repo suite is authoritative (the same convention as the U5/U6 greens docs).
Trio green 2026-08-26: 639 tests / 2 skipped, typecheck clean, build clean.
