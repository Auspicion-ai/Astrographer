// tests/module-transform.test.ts — RED tests for Unit U6: the render-transform
// wiring (M-r5). The CapabilityRouter (U4) has `applyTransforms(fragment)`
// (emit-only, composed in order, throwing transform contained). U6 wires it
// into the Runtime's render so the emitted fragment is transformed BEFORE both
// the DOM and SSR adapters consume it (parity — the MCP agent's ssrHtml must
// NOT diverge from the operator's DOM).
//
// Contract: docs/specs/module-import-proposal.md §4 (transform seam: "EMIT-ONLY
// on the rendered fragment, applied to BOTH the DOM and SSR adapters (parity);
// never touches Node/Supervisor") + docs/specs/module-feature-list.md §3
// (`module.transform(fn)`).
//
// These tests are RED because `RuntimeOptions` does NOT yet accept a
// `transformRouter` and the Runtime's render path does NOT apply
// `router.applyTransforms(fragment)` before the DOM/SSR adapters consume it.
// The Implementer makes this file green by wiring the transform seam into
// `src/renderer/runtime.ts` with NO changes to these tests.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'

beforeAll(() => {
  installShim()
})

function makeRuntime(router?: CapabilityRouter): Runtime {
  const runtime = new Runtime({
    mount: mountEl() as never,
    envelope: demoEnvelope() as never,
    ...(router !== undefined ? { transformRouter: router } : {}),
  })
  runtime.bootstrap()
  return runtime
}

function uppercaseRouter(): CapabilityRouter {
  const router = new CapabilityRouter()
  router.registerModule('format', (ctx: ModuleCtx) => {
    ctx.transform((fragment: string) => fragment.toUpperCase())
  })
  return router
}

describe('U6 — render-transform wiring into the Runtime render (M-r5)', () => {
  it('1. a Runtime constructed with a transform router reflects the transform in renderedHtml', () => {
    const runtime = makeRuntime(uppercaseRouter())
    const html = runtime.renderedHtmlResult()
    // the demo fragment contains lowercase text (e.g. "Counter", "Increment")
    expect(html.renderedHtml).toContain('COUNTER')
    expect(html.renderedHtml).toContain('INCREMENT')
    // and the original lowercase is gone (the fragment was uppercased)
    expect(html.renderedHtml).not.toContain('Increment')
  })

  it('2. the transform applies to BOTH the DOM view AND the SSR fragment (parity)', () => {
    const runtime = makeRuntime(uppercaseRouter())
    const html = runtime.renderedHtmlResult()
    expect(html.renderedHtml).toContain('COUNTER')
    expect(html.ssrHtml).toContain('COUNTER')
    // parity: both views are transformed identically (no divergence)
    expect(html.ssrHtml).not.toContain('Increment')
  })

  it('3. the transform is EMIT-ONLY — the graph is NOT mutated (listTargets content unchanged)', () => {
    const runtime = makeRuntime(uppercaseRouter())
    const { nodes } = runtime.listTargets()
    const counter = nodes.find((n) => n.propsId === 'counter')
    expect(counter).toBeDefined()
    // the Node content is the ORIGINAL lowercase "0" — the transform only
    // affects the emitted fragment, never the Node content
    expect(counter!.content).toBe('0')
    const inc = nodes.find((n) => n.cssId === 'inc')
    expect(inc).toBeDefined()
    expect(inc!.content).toBe('Increment (+1)')
  })

  it('4. a Runtime WITHOUT a transform router applies no transform (fragment unchanged)', () => {
    const runtime = makeRuntime()
    const html = runtime.renderedHtmlResult()
    expect(html.renderedHtml).toContain('Increment')
    expect(html.renderedHtml).toContain('Counter')
    expect(html.renderedHtml).not.toContain('INCREMENT')
  })
})

describe('U6 — transform composition + containment at the render seam', () => {
  it('5. two transforms compose in registration order in the rendered output', () => {
    const router = new CapabilityRouter()
    router.registerModule('a', (ctx: ModuleCtx) => {
      ctx.transform((fragment: string) => `${fragment}<!--A-->`)
    })
    router.registerModule('b', (ctx: ModuleCtx) => {
      ctx.transform((fragment: string) => `${fragment}<!--B-->`)
    })
    const runtime = makeRuntime(router)
    const html = runtime.renderedHtmlResult()
    // A registered before B → A's marker appears before B's marker
    const aIdx = html.renderedHtml.indexOf('<!--A-->')
    const bIdx = html.renderedHtml.indexOf('<!--B-->')
    expect(aIdx).toBeGreaterThan(-1)
    expect(bIdx).toBeGreaterThan(-1)
    expect(aIdx).toBeLessThan(bIdx)
  })

  it('6. a throwing transform does NOT crash the render — the original fragment is emitted', () => {
    const router = new CapabilityRouter()
    router.registerModule('bad', (ctx: ModuleCtx) => {
      ctx.transform(() => {
        throw new Error('transform blew up')
      })
    })
    const runtime = makeRuntime(router)
    expect(() => runtime.renderedHtmlResult()).not.toThrow()
    const html = runtime.renderedHtmlResult()
    // the original (untransformed) fragment is emitted
    expect(html.renderedHtml).toContain('Increment')
    expect(html.renderedHtml).toContain('Counter')
  })

  it('7. the transform applies to get_markdown too (parity across all MCP views)', () => {
    const runtime = makeRuntime(uppercaseRouter())
    const md = runtime.markdownResult()
    expect(md.markdown).toContain('COUNTER')
    expect(md.markdown).not.toContain('Increment')
  })
})
