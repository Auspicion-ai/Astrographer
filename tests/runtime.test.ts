// tests/runtime.test.ts — the renderer Runtime's MCP-facing surface, verified
// against a DOM shim (the upstream adapters.test.ts pattern). This exercises
// the Phase B synthetic-event contract end-to-end from the Electron shell's
// side: producing-process-keeps-graph, css.id → node targeting, dispatch
// mutates the graph + re-renders, SSR re-emit parity, and the shared 0.1.1
// dispatch-report surface (Supervisor.dispatchAndReport + requestId dedup +
// the opt-in data-node-id render option).
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'

beforeAll(() => {
  installShim()
})

describe('renderer Runtime — MCP-facing provident-ssr surface (provident-ssr 0.1.1)', () => {
  it('bootstraps the demo envelope into the mount and emits both DOM + SSR views', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const html = runtime.renderedHtmlResult()
    expect(html.renderedHtml).toContain('counter')
    expect(html.renderedHtml).toContain('Increment')
    expect(html.ssrHtml).toContain('counter')
    expect(html.census.inTree).toBeGreaterThan(0)
  })

  it('emits the opt-in data-node-id on every rendered element (DOM + SSR)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const html = runtime.renderedHtmlResult()
    // the root carries its engine nodeId (REQ-GAP-3/A2: element → data-node-id
    // → Supervisor node → compiled state, for agent traceability)
    expect(html.renderedHtml).toMatch(/data-node-id="node-\d+"/)
    expect(html.ssrHtml).toMatch(/data-node-id="node-\d+"/)
    // every emitted element carries it (count == element count), both views
    const domCount = (html.renderedHtml.match(/data-node-id=/g) ?? []).length
    const ssrCount = (html.ssrHtml.match(/data-node-id=/g) ?? []).length
    expect(domCount).toBeGreaterThan(8)
    expect(ssrCount).toBe(domCount)
  })

  it('lists dispatch targets with authored css.id + props.id + handlers', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const { nodes } = runtime.listTargets()
    const inc = nodes.find((n) => n.cssId === 'inc')
    expect(inc).toBeDefined()
    expect(inc!.type).toBe('button')
    expect(inc!.handlers.some((h) => h.event === 'click')).toBe(true)
    const counter = nodes.find((n) => n.propsId === 'counter')
    expect(counter).toBeDefined()
  })

  it('synthetic dispatch by css.id mutates the graph and re-renders both views', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const before = runtime.renderedHtmlResult()
    expect(before.renderedHtml).toContain('>0<')
    const result = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    expect(result.results).toEqual([undefined])
    expect(result.dirtied.length).toBeGreaterThan(0)
    expect(result.renderedHtml).toContain('>1<')
    expect(result.ssrHtml).toContain('>1<')
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>1<')
  })

  it('reports the dirtied node id of the mutated counter (the shared dispatch-report surface)', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const { nodes } = runtime.listTargets()
    const counter = nodes.find((n) => n.propsId === 'counter')!
    const result = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    expect(result.dirtied).toContain(counter.nodeId)
  })

  it('synthetic input dispatch carries args[0] as event.value (echo)', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const result = await runtime.dispatch({
      target: { kind: 'cssId', cssId: 'echo-input' },
      event: 'input',
      args: ['hello mcp'],
    })
    expect(result.results).toEqual([undefined])
    expect(result.renderedHtml).toContain('hello mcp')
    expect(result.ssrHtml).toContain('hello mcp')
  })

  it('bare-string targets resolve css.id then nodeId; unknown targets throw', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const { nodes } = runtime.listTargets()
    const incNodeId = nodes.find((n) => n.cssId === 'inc')!.nodeId
    const byString = await runtime.dispatch({ target: incNodeId, event: 'click' })
    expect(byString.renderedHtml).toContain('>1<')
    await expect(
      runtime.dispatch({ target: { kind: 'cssId', cssId: 'does-not-exist' }, event: 'click' }),
    ).rejects.toThrow(/unresolved target/)
  })

  it('requestId idempotency is engine-owned: a duplicate returns the first report without re-firing', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const first = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click', requestId: 'r1' })
    const second = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click', requestId: 'r1' })
    // the duplicate ECHOES the first caller's report (idempotent-echo semantics)
    expect(second.renderedHtml).toBe(first.renderedHtml)
    expect(second.dirtied).toEqual(first.dirtied)
    // the counter did NOT advance a second time
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>1<')
    expect(runtime.renderedHtmlResult().renderedHtml).not.toContain('>2<')
  })

  it('nodeState returns the resolved pass-2 states for a target', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const { nodes } = runtime.listTargets()
    const counter = nodes.find((n) => n.propsId === 'counter')!
    const state = runtime.nodeState(counter.nodeId)
    expect(state.nodeId).toBe(counter.nodeId)
    expect(state.states.length).toBeGreaterThan(0)
    expect(state.census.inTree).toBeGreaterThan(0)
  })
})