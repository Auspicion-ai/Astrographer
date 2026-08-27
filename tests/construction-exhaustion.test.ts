// tests/construction-exhaustion.test.ts — the upstream "construction-path
// exhaustion" adversarial check (AGENTS.md item 11a): for the graphScope value
// threaded through N sites, assert it on EVERY node each DISTINCT construction
// site produces (root, data.children, def-children, content-children, clone,
// loadState seed, re-mint). This is the gap that missed ISO-ADV-D.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  renderProducingProcess,
  createLinkHub,
  loadState,
  reconcileParentTargets,
  Node,
  serializeSlice,
} from 'provident-ssr'
import { createIsolatedScope, scopeOf } from 'provident-ssr/core/registry.js'

beforeAll(() => { installShim() })

function assertAllScoped(nodes: Array<{ id: string }>, scope: unknown, label: string) {
  for (const n of nodes) {
    expect(scopeOf(n as never)).toBe(scope), `${label}: node ${(n as any).id}`
  }
}

describe('construction-path exhaustion — graphScope threaded at EVERY construction site', () => {
  it('ROOT + data.children (nested, depth-2) all carry the scope', () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = {
      template: { root: { type: 'div', children: [
        { type: 'p', props: { id: 'c1' }, children: [{ type: 'span', props: { id: 'g1' } }] },
        { type: 'p', props: { id: 'c2' } },
      ] } },
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
    const t = translateLegacy(env as never, { hub, graphScope: scope })
    // root + all children + grandchildren
    assertAllScoped(t.nodes, scope, 'translateLegacy children')
    const g1 = t.nodes.find((n) => (n.props as any)?.id === 'g1')
    const c2 = t.nodes.find((n) => (n.props as any)?.id === 'c2')
    expect(g1).toBeDefined()
    expect(c2).toBeDefined()
  })

  it('CONTENT-children (content payload) all carry the scope', () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = {
      template: { root: { type: 'div' } },
      content: [{ content: [{ type: 'p', props: { id: 'payload-1' } }, { type: 'p', props: { id: 'payload-2' } }] }],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
    const t = translateLegacy(env as never, { hub, graphScope: scope })
    assertAllScoped(t.nodes, scope, 'content-children')
    const p1 = t.nodes.find((n) => (n.props as any)?.id === 'payload-1')
    expect(p1).toBeDefined()
  })

  it('DEF-children (a component def value with children) all carry the scope', () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = {
      template: {
        root: { type: 'div', component: [{ reference: 'card', target: 'children' }] },
        children: [{ type: 'card' }],
      },
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
    // translate the def provider — the def-children prototype construction site
    const t = translateLegacy(env as never, { hub, graphScope: scope })
    assertAllScoped(t.nodes, scope, 'def-children')
  })

  it('loadState SEED all carry the scope', () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = { template: { root: { type: 'div', children: [{ type: 'p', props: { id: 'seed1' } }] } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const t1 = translateLegacy(env as never, { hub, graphScope: scope })
    const doc = serializeSlice(t1.root, t1.nodes, { adapter: 'dom', persistence: false })
    const seeds = loadState(doc)
    const nodes = seeds.map((s) => new Node(s, hub, undefined, false, scope))
    reconcileParentTargets(nodes)
    assertAllScoped(nodes, scope, 'loadState seed')
  })

  it('clone-instance lands in the supervisor scope', () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = { template: { root: { type: 'div', children: [{ type: 'p', props: { id: 'clone-src' } }] } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const t = translateLegacy(env as never, { hub, graphScope: scope })
    const sup = new Supervisor({ events: new EventBridge(), graphScope: scope })
    for (const n of t.nodes) sup.registerNode(n)
    const src = t.nodes.find((n) => (n.props as any)?.id === 'clone-src')
    const res = sup.apply({ kind: 'clone-instance', node: src, mutation: [] })
    expect(res.status).toBe('applied')
    // the copy must be in the supervisor's scope
    const copies = sup.allNodes().filter((n) => n !== src && n !== t.root)
    assertAllScoped(copies, scope, 'clone-instance')
  })
})
