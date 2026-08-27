// tests/0.2-regression-adversarial.test.ts — a broad adversarial pass on the
// host's 0.1.x MCP/Runtime surface, hunting regressions introduced by the 0.2
// scope refactor (registry/serialize/ops/supervisor gained scope threading +
// Feature 1a def-prototype round-trip + Feature 3 condensing + the derived-
// exclusion serialize change). The host runs the default (no-opt-in) path, so
// the focus is: default-scope behavior must remain byte-identical to 0.1.x.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { pathForkCycleLegacyData } from '../src/shared/path-fork-cycle.js'
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  renderProducingProcess,
  createLinkHub,
  type LegacyInitialData,
} from 'provident-ssr'
import { createIsolatedScope } from 'provident-ssr/core/registry.js'

beforeAll(() => {
  installShim()
})

function r(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

function renderGraph(env: LegacyInitialData, scope: ReturnType<typeof createIsolatedScope>, mount: HTMLElement): void {
  const hub = createLinkHub()
  const t = translateLegacy(env, { hub, graphScope: scope })
  const sup = new Supervisor({ events: new EventBridge(), graphScope: scope })
  for (const n of t.nodes) sup.registerNode(n)
  const ad = new DomAdapter(mount, {})
  const cr = t.root.compile(t.nodes)
  sup.recordResolved(cr.actionable)
  renderProducingProcess(cr.actionable as never, new Map(sup.allNodes().map((n) => [n.id, n])) as never, ad, null, { graphScope: scope as never })
}

/** Convenience: render a single-child graph to a mount under an isolated scope. */
function renderGraphChild(child: unknown, scope: ReturnType<typeof createIsolatedScope>, mount: HTMLElement): void {
  renderGraph(
    { template: { root: { type: 'div', children: [child as never] } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } } as unknown as LegacyInitialData,
    scope,
    mount,
  )
}

describe('0.2 regression — the demo envelope round-trips intact (no shrink/double)', () => {
  it('serializeSlice → loadDoc round-trip preserves the full census (no derived/minted exclusion on a plain demo)', () => {
    const runtime = r()
    runtime.bootstrap()
    const before = runtime.renderedHtmlResult().census
    const rt = runtime.loadDoc(runtime.exportSerialized())
    expect(rt.inTree).toBe(before.inTree)
  })

  it('loadDoc round-trip TWICE is stable (reRegisterDefPrototypes idempotent — no accumulation)', () => {
    const runtime = r()
    runtime.bootstrap()
    const doc = runtime.exportSerialized()
    runtime.loadDoc(doc)
    const c1 = runtime.renderedHtmlResult().census
    runtime.loadDoc(runtime.exportSerialized())
    const c2 = runtime.renderedHtmlResult().census
    expect(c2.inTree).toBe(c1.inTree)
  })

  it('a fork-cycle envelope round-trips without census drift', () => {
    const runtime = r()
    runtime.bootstrap()
    const res = runtime.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(3) })
    const rt = runtime.loadDoc(runtime.exportSerialized())
    expect(rt.inTree).toBe(res.census.inTree)
  })
})

describe('0.2 regression — clone-instance + teardown (0.1.x managed channel)', () => {
  it('a clone-instance mint lands in the target graph, then teardown cleans it up (no leak)', () => {
    const runtime = r()
    runtime.bootstrap()
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const opRes = runtime.op({ kind: 'clone-instance', node: counter.nodeId, mutation: [] })
    expect(opRes.status).toBe('applied')
    runtime.teardown()
    expect(runtime.listTargets().nodes.length).toBe(1)
  })
})

describe('0.2 regression — two isolated graphs render independently (no cross-talk)', () => {
  it('graph ONE and graph TWO render only their own content to their own mounts', () => {
    const s1 = createIsolatedScope()
    const s2 = createIsolatedScope()
    const m1 = document.createElement('div')
    const m2 = document.createElement('div')
    renderGraphChild({ type: 'p', content: 'ONE' }, s1, m1)
    renderGraphChild({ type: 'p', content: 'TWO' }, s2, m2)
    expect(m1.innerHTML).toContain('ONE')
    expect(m1.innerHTML).not.toContain('TWO')
    expect(m2.innerHTML).toContain('TWO')
    expect(m2.innerHTML).not.toContain('ONE')
  })
})
