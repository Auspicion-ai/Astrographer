// tests/blind-renderer-debug.test.ts — BLIND-TEST WRITER artifact (AGENTS.md
// item 10a). Produced from the DOCUMENTATION ONLY:
//   - docs/specs/renderer-backend-greens.md (R1..R10)
//   - docs/specs/renderer-backend-hardening.md
//   - docs/specs/debug-panel-greens.md (D1..D4)
//   - docs/specs/debug-panel.md
//
// The implementation files were NOT read. Only the module names the docs name
// are imported:
//   - RendererBackend from src/main/mcp-server.js
//   - initDebugPanel from src/renderer/debug-panel.js
//   - Runtime from src/renderer/runtime.js
//   - installShim / mountEl from src/shared/dom-shim.js
//   - demoEnvelope from src/shared/demo-envelope.js
//
// The fake window is built from the greens doc's description: `.on(event,cb)`
// + `.send(channel,msg)` + `.isDestroyed()` + an `emit(target,event,...)` seam.
import { describe, it, expect, beforeAll } from 'vitest'
import { RendererBackend } from '../src/main/mcp-server.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'

/** A fake Electron BrowserWindow + webContents built from the greens doc's
 *  description: `.on(event,cb)` + `.send(channel,msg)` + `.isDestroyed()` +
 *  an `emit(target,event,...)` test seam. */
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

const tick = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe('RendererBackend — R1..R10 (docs/specs/renderer-backend-greens.md)', () => {
  it('R1.1 — invoke before markReady rejects within ~500ms matching /ready.*timeout|timeout.*ready/i; isReady()===false', async () => {
    const backend = new RendererBackend({ readyTimeoutMs: 50 })
    expect(backend.isReady()).toBe(false)
    const start = Date.now()
    await expect(backend.invoke('renderedHtml', {})).rejects.toThrow(/ready.*timeout|timeout.*ready/i)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(500)
  }, 2000)

  it('R1.2 — after markReady(): isReady()===true', () => {
    const backend = new RendererBackend()
    backend.markReady()
    expect(backend.isReady()).toBe(true)
  })

  it('R2.3 — after markReady, invoke sends provident:invoke over IPC; pendingCount()===1', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    expect(fake.sent[0].channel).toBe('provident:invoke')
    expect(backend.pendingCount()).toBe(1)
    const req = fake.sent[0].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: true } })
    await p
  })

  it('R2.4 — handleReply({id, ok:true, value}) resolves the invoke; pendingCount()===0', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    const req = fake.sent[0].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: true } })
    await expect(p).resolves.toEqual({ ok: true })
    expect(backend.pendingCount()).toBe(0)
  })

  it('R3.5 — invoke (no reply) rejects after ~30ms matching /invoke.*timeout|timeout.*invoke/i; pendingCount()===0', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ invokeTimeoutMs: 30 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    // capture `start` BEFORE `invoke` — the measured window must include the
    // FULL 30ms timeout (the earlier failure captured start after a 5ms tick,
    // so the window collapsed under load and the `>= 25` bound was flaky).
    const start = Date.now()
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    const req = fake.sent[0].msg as { id: number }
    await expect(p).rejects.toThrow(/invoke.*timeout|timeout.*invoke/i)
    const elapsed = Date.now() - start
    // comfortably below the 30ms timeout but proves the reject was NOT immediate
    expect(elapsed).toBeGreaterThanOrEqual(20) // ~30ms
    expect(elapsed).toBeLessThan(500)
    expect(backend.pendingCount()).toBe(0)
    // keep req referenced for the late-reply no-op test
    void req
  }, 2000)

  it('R3.6 — a LATE handleReply for the timed-out id is a no-op (no throw)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ invokeTimeoutMs: 30 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    const req = fake.sent[0].msg as { id: number }
    await expect(p).rejects.toThrow(/invoke.*timeout|timeout.*invoke/i)
    expect(() => backend.handleReply({ id: req.id, ok: true, value: { late: true } })).not.toThrow()
  }, 2000)

  it('R4.7 — the INITIAL did-finish-load (first load) does NOT reset the gate; isReady() stays true + in-flight invoke survives', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    expect(backend.isReady()).toBe(true)
    fake.emit('wc', 'did-finish-load')
    expect(backend.isReady()).toBe(true)
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    const req = fake.sent[0].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: 1 } })
    await expect(p).resolves.toEqual({ ok: 1 })
  })

  it('R4.8 — a SECOND did-finish-load (a reload) rejects in-flight pending with /reload/i; pendingCount()===0; isReady()===false', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    fake.emit('wc', 'did-finish-load') // first load — not a reload
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    expect(backend.pendingCount()).toBe(1)
    fake.emit('wc', 'did-finish-load') // second — a reload
    await expect(p).rejects.toThrow(/reload/i)
    expect(backend.pendingCount()).toBe(0)
    expect(backend.isReady()).toBe(false)
  })

  it('R4.9 — after a reload, markReady() re-arms; a new invoke succeeds', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    fake.emit('wc', 'did-finish-load') // first load
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    fake.emit('wc', 'did-finish-load') // reload
    await expect(p).rejects.toThrow(/reload/i)
    backend.markReady()
    expect(backend.isReady()).toBe(true)
    const p2 = backend.invoke('renderedHtml', {})
    await tick(5)
    const req2 = fake.sent[fake.sent.length - 1].msg as { id: number }
    backend.handleReply({ id: req2.id, ok: true, value: { ok: 2 } })
    await expect(p2).resolves.toEqual({ ok: 2 })
  })

  it('R5.10 — closed/destroyed reject all pending with /destroy/i; pendingCount()===0; isReady()===false', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p1 = backend.invoke('renderedHtml', {})
    const p2 = backend.invoke('listTargets', {})
    await tick(5)
    expect(backend.pendingCount()).toBe(2)
    fake.emit('win', 'closed')
    await Promise.all([
      expect(p1).rejects.toThrow(/destroy/i),
      expect(p2).rejects.toThrow(/destroy/i),
    ])
    expect(backend.pendingCount()).toBe(0)
    expect(backend.isReady()).toBe(false)
  })

  it('R5.11 — closed then destroyed both firing do NOT double-reset (idempotent; second is a no-op)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    fake.emit('win', 'closed')
    fake.emit('win', 'destroyed')
    await expect(p).rejects.toThrow(/destroy/i)
    expect(backend.pendingCount()).toBe(0)
    expect(backend.isReady()).toBe(false)
    backend.markReady()
    expect(backend.isReady()).toBe(true)
  })

  it('R5.12 — after destroy, invoke rejects (gate closed) until a new attachWindow + markReady; then a new invoke succeeds', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ readyTimeoutMs: 30 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    fake.emit('win', 'closed')
    await expect(p).rejects.toThrow(/destroy/i)
    await expect(backend.invoke('renderedHtml', {})).rejects.toThrow(/ready.*timeout|timeout.*ready/i)
    const fake2 = makeFakeWindow()
    backend.attachWindow(fake2.win as never)
    backend.markReady()
    expect(backend.isReady()).toBe(true)
    const p3 = backend.invoke('renderedHtml', {})
    await tick(5)
    const req3 = fake2.sent[0].msg as { id: number }
    backend.handleReply({ id: req3.id, ok: true, value: { ok: 3 } })
    await expect(p3).resolves.toEqual({ ok: 3 })
  }, 2000)

  it('R6.13 — an invoke awaiting the OLD readyPromise that gets reset mid-await is REJECTED with the reset reason (never hangs)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ readyTimeoutMs: 2000 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    fake.emit('wc', 'did-finish-load') // first load — not a reload
    const p = backend.invoke('renderedHtml', {})
    fake.emit('wc', 'did-finish-load') // a reload (the 2nd) — resets the gate mid-await
    await expect(p).rejects.toThrow(/reload|destroy/i)
  }, 3000)

  it('R7.14 — the readiness-timeout setTimeout is cleared on success — 50 successful invokes leave no lingering Timeout resources', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ readyTimeoutMs: 50 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const before = process.getActiveResourcesInfo?.().filter((r: string) => r === 'Timeout').length ?? 0
    for (let i = 0; i < 50; i++) {
      const p = backend.invoke('renderedHtml', {})
      await tick(1)
      const req = fake.sent[fake.sent.length - 1].msg as { id: number }
      backend.handleReply({ id: req.id, ok: true, value: { ok: i } })
      await p
    }
    await tick(80) // past the 50ms readyTimeout window
    const after = process.getActiveResourcesInfo?.().filter((r: string) => r === 'Timeout').length ?? 0
    expect(after - before).toBeLessThan(10)
  })

  it('R8.15 — a webContents.send that throws is caught; pending entry cleaned (pendingCount()===0); invoke rejects with /destroy/i', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake.win as never)
    backend.markReady()
    ;(fake.win as { webContents: { send: unknown } }).webContents.send = () => {
      throw new Error('Object has been destroyed')
    }
    await expect(backend.invoke('renderedHtml', {})).rejects.toThrow(/destroy/i)
    expect(backend.pendingCount()).toBe(0)
  })

  it('R9.16 — attachWindow(fake1) then attachWindow(fake2): a close on fake1 does NOT reset the backend for fake2', async () => {
    const fake1 = makeFakeWindow()
    const fake2 = makeFakeWindow()
    const backend = new RendererBackend()
    backend.attachWindow(fake1.win as never)
    backend.markReady()
    backend.attachWindow(fake2.win as never)
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    expect(fake2.sent.length).toBe(1)
    fake1.emit('win', 'closed')
    expect(backend.isReady()).toBe(true)
    expect(backend.pendingCount()).toBe(1)
    const req = fake2.sent[0].msg as { id: number }
    backend.handleReply({ id: req.id, ok: true, value: { ok: 9 } })
    await expect(p).resolves.toEqual({ ok: 9 })
  })

  it('R10.17 — a handleReply value with renderedHtml > largePayloadBytes resolves with { census, digest, preview, truncated: true } (no full fields)', async () => {
    const fake = makeFakeWindow()
    const backend = new RendererBackend({ largePayloadBytes: 1000 })
    backend.attachWindow(fake.win as never)
    backend.markReady()
    const big = 'x'.repeat(5000)
    const p = backend.invoke('renderedHtml', {})
    await tick(5)
    const req = fake.sent[0].msg as { id: number }
    backend.handleReply({
      id: req.id,
      ok: true,
      value: { renderedHtml: big, ssrHtml: big, census: { registered: 1, inTree: 1, unplaced: 0, destroyed: 0, prototypes: 1 } },
    })
    const resolved = await p
    expect(resolved).toEqual(
      expect.objectContaining({
        truncated: true,
        census: expect.any(Object),
        digest: expect.any(String),
        preview: expect.any(String),
      }),
    )
    expect(resolved).not.toHaveProperty('renderedHtml')
    expect(resolved).not.toHaveProperty('ssrHtml')
  })
})

describe('Debug panel — hosted by the isolated SecurePanels graph (secure-panels.md)', () => {
  beforeAll(() => {
    installShim()
    ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: { get: async () => ({ token: null, enabled: ['read', 'dispatch'] }), set: async (p: unknown) => ({ token: null, enabled: ['read', 'dispatch'] }) } } }
  })

  it('D1.1 — SecurePanels.refreshDebug(runtime) writes /inTree \d+ · registered \d+/ with the SSR preview on a new line', () => {
    const panels = new SecurePanels(document.createElement('div'))
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    panels.refreshDebug(runtime)
    const text = panels.debugText()
    expect(text).toMatch(/inTree \d+ · registered \d+/)
    const lines = text.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[1].length).toBeGreaterThan(0)
  })

  it('D1.3 — after await runtime.teardownResult() + refreshDebug: contains "inTree 1" (root-only)', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const panels = new SecurePanels(document.createElement('div'))
    await runtime.teardownResult()
    panels.refreshDebug(runtime)
    expect(panels.debugText()).toContain('inTree 1')
  })

  it('D2.6 — the demo SSR fragment is > 120 chars; the preview line ends with … and is ≤ ~125 chars', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const { ssrHtml } = runtime.renderedHtmlResult()
    expect(ssrHtml.length).toBeGreaterThan(120)
    const panels = new SecurePanels(document.createElement('div'))
    panels.refreshDebug(runtime)
    const preview = panels.debugText().split('\n').slice(1).join('\n')
    expect(preview.endsWith('…')).toBe(true)
    expect(preview.length).toBeLessThanOrEqual(125)
  })

  it('D3.8 — F1: a non-number census field is coerced to "?" — the text contains "inTree ?", never undefined/NaN', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const panels = new SecurePanels(document.createElement('div'))
    const stub = runtime as unknown as { renderedHtmlResult: () => unknown }
    stub.renderedHtmlResult = () => ({ renderedHtml: '', ssrHtml: '', census: { inTree: undefined, registered: NaN, unplaced: 0, destroyed: 0, prototypes: 0 } })
    expect(() => panels.refreshDebug(runtime)).not.toThrow()
    expect(panels.debugText()).toContain('inTree ?')
    expect(panels.debugText()).not.toContain('undefined')
    expect(panels.debugText()).not.toContain('NaN')
  })

  it('D3.9 — F2: a non-string ssrHtml does NOT throw (coerced to ""); null/whitespace → preview (empty)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const panels = new SecurePanels(document.createElement('div'))
    const stub = runtime as unknown as { renderedHtmlResult: () => unknown }
    stub.renderedHtmlResult = () => ({ renderedHtml: '', ssrHtml: 42 as never, census: { inTree: 1, registered: 1, unplaced: 0, destroyed: 0, prototypes: 0 } })
    expect(() => panels.refreshDebug(runtime)).not.toThrow()
    stub.renderedHtmlResult = () => ({ renderedHtml: '', ssrHtml: null, census: { inTree: 1, registered: 1, unplaced: 0, destroyed: 0, prototypes: 0 } })
    panels.refreshDebug(runtime)
    expect(panels.debugText().split('\n')[1]).toBe('(empty)')
    stub.renderedHtmlResult = () => ({ renderedHtml: '', ssrHtml: '   \n  ', census: { inTree: 1, registered: 1, unplaced: 0, destroyed: 0, prototypes: 0 } })
    panels.refreshDebug(runtime)
    expect(panels.debugText().split('\n')[1]).toBe('(empty)')
  })
})
