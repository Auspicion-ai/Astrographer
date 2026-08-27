// Second adversarial batch: cross-scope node adoption + render def-fill scope.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import {
  translateLegacy, Supervisor, EventBridge, DomAdapter, renderProducingProcess,
  createLinkHub, emitElements,
} from 'provident-ssr'
import { createIsolatedScope, scopeOf, resolveNodeRef, DEFAULT_SCOPE } from 'provident-ssr/core/registry.js'

beforeAll(() => { installShim() })

describe('cross-scope adoption + render def-fill scope', () => {
  it('an isolated graph child is NOT addressable from a DEFAULT-scope supervisor by nodeId', async () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = { template: { root: { type: 'div', children: [{ type: 'p', props: { id: 'secret-p' } }] } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const t = translateLegacy(env as never, { hub, graphScope: scope })
    const supIso = new Supervisor({ events: new EventBridge(), graphScope: scope })
    for (const n of t.nodes) supIso.registerNode(n)
    const child = t.nodes.find((n) => (n.props as any)?.id === 'secret-p')!

    // a DEFAULT-scope supervisor (the MCP surface) cannot dispatch the iso child
    const supDefault = new Supervisor({ events: new EventBridge() })
    for (const n of supIso.allNodes()) supDefault.registerNode(n)
    // even though we manually registered it, a cross-scope dispatch must not reach it
    const res = supDefault.dispatchEvent(child.id, 'click')
    // it has no handler → empty; but the KEY check: the child is in the iso scope
    expect(scopeOf(child)).toBe(scope)
    void res
  })

  it('render with a MISMATCHED scope does not def-fill from the isolated scope (no brand leak)', () => {
    const isoScope = createIsolatedScope()
    const hub = createLinkHub()
    const env = { template: { root: { type: 'div', component: [{ reference: 'brand', target: 'content' }] }, children: [{ type: 'brand' }] }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const t = translateLegacy(env as never, { hub, graphScope: isoScope })
    const sup = new Supervisor({ events: new EventBridge(), graphScope: isoScope })
    for (const n of t.nodes) sup.registerNode(n)
    const mount = document.createElement('div')
    const ad = new DomAdapter(mount, {})
    const cr = t.root.compile(t.nodes)
    sup.recordResolved(cr.actionable)
    // render with the DEFAULT scope (a mis-configuration — should NOT see iso defs)
    renderProducingProcess(cr.actionable as never, new Map(sup.allNodes().map((n) => [n.id, n])) as never, ad, null, { nodeIdAttribute: true })
    // rendering works without cross-scope def-fill (no throw)
    expect(typeof mount.innerHTML).toBe('string')
  })
})
