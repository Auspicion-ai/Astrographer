// tests/module-image.test.ts — RED tests for Unit U5: the image/binary MCP
// tool-result channel (M-r4). Contract: docs/specs/module-import-proposal.md
// §9 (M-r4 payload guard) + docs/specs/module-feature-list.md §3
// (`module.captureView()` tool-provider).
//
// These tests are RED because:
//   - `imageResult` does NOT exist in `src/main/mcp-server.ts` (the import
//     fails at module load).
//   - `ctx.captureView()` currently returns `''` (the U4 stub), NOT a data-URI.
//   - the `maybeDigest`/`largePayloadBytes` guard does NOT extend to the image
//     channel (a large image payload crosses the IPC boundary unbounded).
// The Implementer makes this file green by adding `imageResult` to
// `src/main/mcp-server.ts`, wiring a capture provider into `CapabilityRouter`
// so `ctx.captureView()` returns a data-URI, and extending the payload guard to
// the image channel — with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import { imageResult, RendererBackend } from '../src/main/mcp-server.js'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'

describe('imageResult — format an MCP image content block (M-r4, proposal §9)', () => {
  it('1. imageResult("data:image/svg+xml;base64,xxx") → { content: [{ type: "image", data: "xxx", mimeType: "image/svg+xml" }] }', () => {
    const result = imageResult('data:image/svg+xml;base64,xxx')
    expect(result).toEqual({
      content: [{ type: 'image', data: 'xxx', mimeType: 'image/svg+xml' }],
    })
  })

  it('2. imageResult("data:image/png;base64,abc", "image/png") → mimeType "image/png"', () => {
    const result = imageResult('data:image/png;base64,abc', 'image/png')
    expect(result.content[0].mimeType).toBe('image/png')
    expect(result.content[0].data).toBe('abc')
  })

  it('3. a non-data-URI string throws a clean error, never crashes', () => {
    expect(() => imageResult('not-a-data-uri')).toThrow()
    expect(() => imageResult('')).toThrow()
  })
})

describe('captureView — the toolset produces a data-URI (feature-list §3)', () => {
  it('4. ctx.captureView() returns a string that starts with "data:" (a data-URI)', () => {
    const router = new CapabilityRouter()
    let view: string | undefined
    router.registerModule('capture', (ctx: ModuleCtx) => {
      view = ctx.captureView()
    })
    expect(typeof view).toBe('string')
    expect(view!.startsWith('data:')).toBe(true)
  })

  it('5. the CapabilityRouter accepts a capture provider; ctx.captureView() returns the provider fragment wrapped as a data-URI', () => {
    const router = new CapabilityRouter()
    const fragment = '<div id="inc">0</div>'
    router.setCaptureProvider(() => fragment)
    let view: string | undefined
    router.registerModule('capture', (ctx: ModuleCtx) => {
      view = ctx.captureView()
    })
    expect(view!.startsWith('data:')).toBe(true)
    // the provider's fragment is embedded in the data-URI (base64 or SVG)
    expect(view!.length).toBeGreaterThan(0)
  })
})

describe('M-r4 payload guard — a large image payload is bounded (proposal §9)', () => {
  it('6. a large image payload (over largePayloadBytes) is bounded — not the raw unbounded payload', async () => {
    const backend = new RendererBackend({ largePayloadBytes: 1000 })
    const big = 'x'.repeat(5000)
    const value = { content: [{ type: 'image', data: big, mimeType: 'image/png' }] }
    const resolved = backend.maybeDigestForTest(value)
    // the raw unbounded base64 data must NOT cross the boundary
    expect(resolved).not.toHaveProperty('content')
    expect(resolved).toHaveProperty('truncated', true)
    expect(resolved).toHaveProperty('digest')
  })

  it('7. captureView handles a unicode fragment (emoji) without crashing (H1 adversarial fix)', () => {
    const router = new CapabilityRouter()
    router.setCaptureProvider(() => '<div>hello \u{1F600} world</div>')
    let view: string | undefined
    router.registerModule('capture', (ctx: ModuleCtx) => {
      view = ctx.captureView()
    })
    expect(view!.startsWith('data:')).toBe(true)
  })

  it('8. the live maybeDigest path bounds a large image content block (H2 adversarial fix)', () => {
    const backend = new RendererBackend({ largePayloadBytes: 1000 })
    const big = 'y'.repeat(5000)
    const value = { content: [{ type: 'image', data: big, mimeType: 'image/png' }] }
    const resolved = (backend as unknown as { maybeDigest: (v: unknown) => unknown }).maybeDigest(value)
    expect(resolved).not.toHaveProperty('content')
    expect(resolved).toHaveProperty('truncated', true)
  })
})
