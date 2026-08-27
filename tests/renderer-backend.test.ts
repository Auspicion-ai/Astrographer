// tests/renderer-backend.test.ts — RED tests for the A2/A6 RendererBackend
// lifecycle hardening unit (docs/specs/renderer-backend-hardening.md §2/§3/§4).
//
// These tests are RED because the current `RendererBackend`
// (src/main/mcp-server.ts) does NOT implement the spec surface:
//   - constructor takes NO options (`RendererBackendOptions` does not exist)
//   - NO readiness timeout (`readyPromise` never times out → invoke hangs)
//   - NO per-request timeout (`pending` entries live forever)
//   - NO reload/destroy re-arm (`attachWindow` does not wire events)
//   - NO large-payload digest
//   - NO `isReady()` / `pendingCount()` test seams
//
// The tests construct `RendererBackend` with a FAKE webContents-like object
// (no Electron import) passed via `attachWindow(fake)`. The fake exposes
// `.on(event, cb)` + `.send(channel, msg)` + `.isDestroyed()` so the reload/
// destroy hooks (once wired by the Implementer) can be simulated by emitting
// `did-finish-load` / `closed` / `destroyed` on the fake.
import { describe, it, expect } from 'vitest'
import { RendererBackend } from '../src/main/mcp-server.js'

/** A fake Electron BrowserWindow + webContents. Captures event handlers
 *  registered via `.on(...)` and IPC sends via `.send(...)`, and lets the
 *  test emit events (reload/destroy) through `emit(...)`. */
interface FakeWindow {
  win: object
  sent: Array<{ channel: string; msg: unknown }>
  emit: (target: 'win' | 'wc', event: string, ...args: unknown[]) => void
  setDestroyed: (v: boolean) => void
}

function makeFakeWindow(): FakeWindow {
  const winHandlers = new Map<string, Set<(...args: unknown[]) => void>>()
  const wcHandlers = new Map<string, Set<(...args: unknown[]) => void>>()
  const sent: Array<{ channel: string; msg: unknown }> = []
  let destroyed = false
  const win = {
    isDestroyed: () => destroyed,
    on: (event: string, cb: (...args: unknown[]) => void) => {
      if (!winHandlers.has(event)) winHandlers.set(event, new Set())
      winHandlers.get(event)!.add(cb)
    },
    webContents: {
      isDestroyed: () => destroyed,
      on: (event: string, cb: (...args: unknown[]) => void) => {
        if (!wcHandlers.has(event)) wcHandlers.set(event, new Set())
        wcHandlers.get(event)!.add(cb)
      },
      send: (channel: string, msg: unknown) => {
        sent.push({ channel, msg })
      },
    },
  }
  const emit = (target: 'win' | 'wc', event: string, ...args: unknown[]) => {
    const set = target === 'win' ? winHandlers.get(event) : wcHandlers.get(event)
    set?.forEach((cb) => cb(...args))
  }
  return { win, sent, emit, setDestroyed: (v: boolean) => { destroyed = v } }
}

describe('RendererBackend — A2/A6 lifecycle hardening (RED)', () => {
  it('1. readiness timeout — invoke before markReady rejects within readyTimeoutMs; isReady()===false', async () => {
    const backend = new RendererBackend({ readyTimeoutMs: 50 })
    expect(backend.isReady()).toBe(false)
    const start = Date.now()
    await expect(backend.invoke('renderedHtml', {})).rejects.toThrow(/ready.*timeout|timeout.*ready/i)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500) // ~50ms timeout, well under 500ms
    expect(backend.isReady()).toBe(false)
  }, 2000)

  it('2. happy path — markReady; isReady()===true; invoke sends; handleReply resolves; pendingCount drops to 0', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    expect(backend.isReady()).toBe(false)
    backend.markReady()
    expect(backend.isReady()).toBe(true)

    const p = backend.invoke('renderedHtml', {})
    // the request was sent over IPC
    await new Promise((r) => setTimeout(r, 5))
    expect(fake.sent.length).toBe(1)
    expect(fake.sent[0].channel).toBe('provident:invoke')
    const req = fake.sent[0].msg as { id: number; method: string }
    expect(backend.pendingCount()).toBe(1)

    backend.handleReply({ id: req.id, ok: true, value: { ok: true } })
    await expect(p).resolves.toEqual({ ok: true })
    expect(backend.pendingCount()).toBe(0)
  })

  it('3. per-request timeout — invoke (no reply) rejects after invokeTimeoutMs; pendingCount===0; late handleReply is a no-op', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ invokeTimeoutMs: 30 })
    backend.attachWindow(fake.win as never)
    backend.markReady()

    // capture `start` BEFORE `invoke` — the measured window must include the
    // FULL 30ms timeout (the earlier failure captured start after a 5ms tick,
    // so the window collapsed under load and the `>= 25` bound was flaky).
    const start = Date.now()
    const p = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    expect(fake.sent.length).toBe(1)
    const req = fake.sent[0].msg as { id: number }
    expect(backend.pendingCount()).toBe(1)

    await expect(p).rejects.toThrow(/invoke.*timeout|timeout.*invoke/i)
    const elapsed = Date.now() - start
    // comfortably below the 30ms timeout but proves the reject was NOT immediate
    expect(elapsed).toBeGreaterThanOrEqual(20) // ~30ms
    expect(elapsed).toBeLessThan(500)
    expect(backend.pendingCount()).toBe(0)

    // a LATE reply for the dead id is a no-op — must not throw, must not
    // resolve a dead promise (already rejected).
    expect(() => backend.handleReply({ id: req.id, ok: true, value: { late: true } })).not.toThrow()
  }, 2000)

  it('4. reload re-arm — a RELOAD did-finish-load rejects in-flight; pendingCount===0; isReady()===false; markReady re-arms; new invoke succeeds', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    expect(backend.isReady()).toBe(true)

    // the INITIAL did-finish-load is the first load, NOT a reload (F1) — skip.
    fake.emit('wc', 'did-finish-load')
    expect(backend.isReady()).toBe(true)

    const p = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    expect(backend.pendingCount()).toBe(1)

    // a SECOND did-finish-load is a RELOAD — rejects in-flight + re-arms.
    fake.emit('wc', 'did-finish-load')

    await expect(p).rejects.toThrow(/reload/i)
    expect(backend.pendingCount()).toBe(0)
    expect(backend.isReady()).toBe(false)

    // a NEW invoke before re-arm must not succeed (gate closed) — it should
    // reject on the readiness timeout (use a short one via a fresh backend? no,
    // re-arm the same backend).
    backend.markReady()
    expect(backend.isReady()).toBe(true)

    const p2 = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    const req2 = fake.sent[1].msg as { id: number }
    backend.handleReply({ id: req2.id, ok: true, value: { ok: 2 } })
    await expect(p2).resolves.toEqual({ ok: 2 })
  })

  it('5. destroy — closed/destroyed rejects all pending; isReady()===false; subsequent invoke rejects until new window + markReady', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ readyTimeoutMs: 30 })
    backend.attachWindow(fake.win as never)
    backend.markReady()

    const p1 = backend.invoke('renderedHtml', {})
    const p2 = backend.invoke('listTargets', {})
    await new Promise((r) => setTimeout(r, 5))
    expect(backend.pendingCount()).toBe(2)

    // simulate window closed
    fake.emit('win', 'closed')

    await Promise.all([
      expect(p1).rejects.toThrow(/destroy/i),
      expect(p2).rejects.toThrow(/destroy/i),
    ])
    expect(backend.pendingCount()).toBe(0)
    expect(backend.isReady()).toBe(false)

    // gate stays CLOSED: a subsequent invoke rejects (readiness timeout) until
    // a new window attaches + markReady.
    await expect(backend.invoke('renderedHtml', {})).rejects.toThrow(/ready.*timeout|timeout.*ready/i)

    // re-attach a new window + markReady re-opens the gate
    const fake2 = makeFakeWindow()
    backend.attachWindow(fake2.win as never)
    backend.markReady()
    expect(backend.isReady()).toBe(true)
    const p3 = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    const req3 = fake2.sent[0].msg as { id: number }
    backend.handleReply({ id: req3.id, ok: true, value: { ok: 3 } })
    await expect(p3).resolves.toEqual({ ok: 3 })
  }, 2000)

  it('6. large payload digest — handleReply with renderedHtml > largePayloadBytes resolves with { census, digest, preview, truncated: true }', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ largePayloadBytes: 1000 })
    backend.attachWindow(fake.win as never)
    backend.markReady()

    const big = 'x'.repeat(5000)
    const p = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    const req = fake.sent[0].msg as { id: number }

    backend.handleReply({
      id: req.id,
      ok: true,
      value: { renderedHtml: big, ssrHtml: big, census: { registered: 1, inTree: 1, unplaced: 0, destroyed: 0, prototypes: 1 } },
    })

    const resolved = await p
    // spec §3: the returned value is replaced with { census, digest, preview, truncated: true }
    expect(resolved).toEqual(
      expect.objectContaining({
        truncated: true,
        census: expect.any(Object),
        digest: expect.any(String),
        preview: expect.any(String),
      }),
    )
    // the full payload must NOT be serialized over IPC (no renderedHtml field)
    expect(resolved).not.toHaveProperty('renderedHtml')
    expect(resolved).not.toHaveProperty('ssrHtml')
  })

  // ---- adversarial hardening (F1..F6) ----

  it('F1 — the INITIAL did-finish-load (first load) does NOT reset the gate (only a RELOAD does)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    // the renderer signals ready first
    backend.markReady()
    expect(backend.isReady()).toBe(true)
    // the initial load's did-finish-load fires AFTER markReady — must NOT tear
    // down the gate (it is the first load, not a reload).
    fake.emit('wc', 'did-finish-load')
    expect(backend.isReady()).toBe(true)
    // a subsequent invoke still works (the gate is armed)
    const p = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    expect(fake.sent.length).toBe(1)
    const req = fake.sent[0].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: 1 } })
    await expect(p).resolves.toEqual({ ok: 1 })
  })

  it('F2/F7 — a caller awaiting the OLD readyPromise is released by a post-reset markReady (no stale-closure hang)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ readyTimeoutMs: 2000 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    // the initial load (first did-finish-load) is NOT a reload (F1)
    fake.emit('wc', 'did-finish-load')
    // start an invoke, then a RELOAD (second did-finish-load) before it sends
    const p = backend.invoke('renderedHtml', {})
    // the invoke is racing the readyPromise which is already resolved, so it
    // passes the gate quickly; the point is a reset must not strand it.
    fake.emit('wc', 'did-finish-load') // a reload (the 2nd)
    // the invoke should reject with the reload reason, NOT hang for 2s.
    await expect(p).rejects.toThrow(/reload|destroy/i)
    // re-arm + a new invoke succeeds
    backend.markReady()
    const p2 = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    const req = fake.sent[fake.sent.length - 1].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: 2 } })
    await expect(p2).resolves.toEqual({ ok: 2 })
  }, 3000)

  it('F3 — the readiness-timeout setTimeout is cleared on success (no timer leak)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ readyTimeoutMs: 50 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const before = process.getActiveResourcesInfo?.().filter((r: string) => r === 'Timeout').length ?? 0
    for (let i = 0; i < 50; i++) {
      const p = backend.invoke('renderedHtml', {})
      await new Promise((r) => setTimeout(r, 1))
      const req = fake.sent[fake.sent.length - 1].msg as { id: number }
      backend.handleReply({ id: req.id, ok: true, value: { ok: i } })
      await p
    }
    await new Promise((r) => setTimeout(r, 80)) // past the 50ms readyTimeout
    const after = process.getActiveResourcesInfo?.().filter((r: string) => r === 'Timeout').length ?? 0
    // the leaked readiness timers would still be pending; allow the per-request
    // timers (cleared on reply) + the baseline. A leak of ~50 would blow past.
    expect(after - before).toBeLessThan(10)
  })

  it('F4 — a destroyed webContents.send throws are caught + the pending entry is cleaned (no dangling)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    // make send throw (simulating a destroy between the check and the send)
    ;(fake.win as { webContents: { send: unknown } }).webContents.send = () => {
      throw new Error('Object has been destroyed')
    }
    await expect(backend.invoke('renderedHtml', {})).rejects.toThrow(/destroy/i)
    expect(backend.pendingCount()).toBe(0)
  })

  it('F5 — closed then destroyed both firing do NOT double-reset / orphan the gate (idempotent reset)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    fake.emit('win', 'closed')
    fake.emit('win', 'destroyed')
    await expect(p).rejects.toThrow(/destroy/i)
    expect(backend.pendingCount()).toBe(0)
    expect(backend.isReady()).toBe(false)
    // re-arm works after the double-fire
    backend.markReady()
    expect(backend.isReady()).toBe(true)
  })

  it('F6 — attachWindow twice: the FIRST window close does NOT reset the backend for the SECOND', async () => {
    const fake1 = makeFakeWindow()
    const fake2 = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake1.win as never)
    backend.markReady()
    backend.attachWindow(fake2.win as never)
    // fake2 is now the attached window; fake1 closing must NOT reset
    const p = backend.invoke('renderedHtml', {})
    await new Promise((r) => setTimeout(r, 5))
    expect(fake2.sent.length).toBe(1)
    fake1.emit('win', 'closed')
    // the backend is still ready + the in-flight call to fake2 survives
    expect(backend.isReady()).toBe(true)
    expect(backend.pendingCount()).toBe(1)
    const req = fake2.sent[0].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: 9 } })
    await expect(p).resolves.toEqual({ ok: 9 })
  })

  it('A2-harden — handleReset rejects the readiness gate WITHOUT an unhandled-rejection (no awaiting invoke)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    // no invoke is awaiting the gate — a reset must NOT leak an unhandled rejection
    const unhandled: unknown[] = []
    const onUnhandled = (e: unknown): void => { unhandled.push(e) }
    process.on('unhandledRejection', onUnhandled)
    try {
      fake.emit('win', 'closed') // rejectReady fires with nobody awaiting
      fake.emit('win', 'destroyed')
      await new Promise((r) => setTimeout(r, 20))
      // an orphaned-rejection would surface here as an unhandledRejection event
      expect(unhandled.length).toBe(0)
    } finally {
      process.off('unhandledRejection', onUnhandled)
    }
  })
})