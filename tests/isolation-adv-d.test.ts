import { describe, it, expect, beforeAll } from 'vitest'
import { installShim } from '../src/shared/dom-shim.js'
import { translateLegacy, createLinkHub } from 'provident-ssr'
import { createIsolatedScope, resolveNodeRef, scopeOf, DEFAULT_SCOPE } from 'provident-ssr/core/registry.js'

beforeAll(() => { installShim() })

describe('ISO-ADV-D fix verify', () => {
  it('an isolated graph child now carries the scope (not DEFAULT_SCOPE)', () => {
    const scope = createIsolatedScope()
    const hub = createLinkHub()
    const env = { template: { root: { type: 'div', children: [{ type: 'label', props: { id: 'secret-toggle' } }] } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const t = translateLegacy(env as never, { hub, graphScope: scope })
    const child = t.nodes.find((n) => (n.props as any)?.id === 'secret-toggle')!
    // the child now carries the isolated scope
    expect(scopeOf(child)).toBe(scope)
    // NOT resolvable from the app (default) scope — the leak is closed
    expect(resolveNodeRef((child as any).id, DEFAULT_SCOPE)).toBeUndefined()
    // resolvable from its own isolated scope
    expect(resolveNodeRef((child as any).id, scope)).toBe(child)
  })
})
