// tests/module-queue.test.ts — RED tests for Unit U7: the async-queue data-hook
// (M-r12). Contract: docs/specs/module-import-proposal.md §4 (hook seam:
// "async-queued off the sync render path (M-r12); data-minimized snapshot") +
// docs/specs/module-feature-list.md §3 (`module.uploadQueue()`).
//
// These tests are RED because `src/renderer/extensions.ts` currently stubs
// `uploadQueue()` as `() => ({ enqueue: () => {} })` — a no-op with NO `drain`
// and a no-op `enqueue`. The Implementer makes this file green by wiring
// `ctx.uploadQueue()` to a real bounded, failure-isolated async queue with NO
// changes to these tests.
import { describe, it, expect } from 'vitest'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'

/** Build a fresh router and capture the queue returned by ctx.uploadQueue(). */
function makeQueue(): { enqueue: (item: unknown) => void; drain: (processor: (item: unknown) => void) => Promise<void> } {
  const router = new CapabilityRouter()
  let queue: { enqueue: (item: unknown) => void; drain: (processor: (item: unknown) => void) => Promise<void> } | undefined
  router.registerModule('embed', (ctx: ModuleCtx) => {
    queue = ctx.uploadQueue() as { enqueue: (item: unknown) => void; drain: (processor: (item: unknown) => void) => Promise<void> }
  })
  if (!queue) throw new Error('uploadQueue() returned nothing')
  return queue
}

describe('U7 — async-queue data-hook: bounded queue (M-r12, proposal §4 + feature-list §3)', () => {
  it('1. ctx.uploadQueue() returns an object with enqueue and drain', () => {
    const queue = makeQueue()
    expect(typeof queue.enqueue).toBe('function')
    expect(typeof queue.drain).toBe('function')
  })

  it('2. enqueue(item) buffers the item; drain() processes it (the processor receives the item)', async () => {
    const queue = makeQueue()
    const received: unknown[] = []
    queue.enqueue('node-a')
    queue.enqueue('node-b')
    await queue.drain((item: unknown) => {
      received.push(item)
    })
    expect(received).toEqual(['node-a', 'node-b'])
  })

  it('3. the queue is BOUNDED — enqueueing past the max (1000) drops the oldest; the buffer never exceeds the bound', async () => {
    const queue = makeQueue()
    const received: unknown[] = []
    for (let i = 0; i < 1001; i += 1) queue.enqueue(i)
    await queue.drain((item: unknown) => {
      received.push(item)
    })
    // the oldest (0) is dropped; the bound holds at 1000 items.
    expect(received.length).toBe(1000)
    expect(received).not.toContain(0)
    expect(received).toContain(1000)
  })

  it('4. drain is ASYNC (returns a Promise) and does NOT block the sync path (enqueue is synchronous)', async () => {
    const queue = makeQueue()
    let processed = false
    queue.enqueue('x')
    const p = queue.drain(() => {
      processed = true
    })
    expect(p).toBeInstanceOf(Promise)
    // enqueue is synchronous: it returns immediately and buffers without awaiting.
    expect(() => queue.enqueue('y')).not.toThrow()
    await p
    expect(processed).toBe(true)
  })
})

describe('U7 — async-queue data-hook: failure isolation (M-r12)', () => {
  it('5. a processor that throws does NOT crash drain — the error is contained and the queue continues', async () => {
    const queue = makeQueue()
    const received: unknown[] = []
    queue.enqueue('a')
    queue.enqueue('b')
    // a throwing processor must not reject drain / crash the queue.
    await expect(
      queue.drain((item: unknown) => {
        if (item === 'a') throw new Error('processor boom')
        received.push(item)
      }),
    ).resolves.toBeUndefined()
    // the queue continued past the throwing item.
    expect(received).toContain('b')
  })

  it('6. an ASYNC processor that rejects is contained — no unhandled rejection, later items still process (H1 adversarial fix)', async () => {
    const queue = makeQueue()
    const received: unknown[] = []
    queue.enqueue('a')
    queue.enqueue('b')
    await expect(
      queue.drain(async (item: unknown) => {
        if (item === 'a') throw new Error('async processor boom')
        received.push(item)
      }),
    ).resolves.toBeUndefined()
    expect(received).toContain('b')
  })

  it('7. uploadQueue() returns the SAME queue per module ctx (M1 adversarial fix)', () => {
    const router = new CapabilityRouter()
    let q1: unknown
    let q2: unknown
    router.registerModule('embed', (ctx: ModuleCtx) => {
      q1 = ctx.uploadQueue()
      q2 = ctx.uploadQueue()
    })
    expect(q1).toBe(q2)
  })
})
