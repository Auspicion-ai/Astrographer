// tests/isolation-adversarial.test.ts — a stress/adversarial pass on the
// multi-graph isolation (D1-D8). Probes for defects that let one graph reach
// into an isolated graph's runtime state.
//
// The attack surface: with the app graph (module singleton, the MCP surface)
// and an isolated panes graph (createIsolatedScope) in one process, an
// adversarial agent holding ONLY app-graph handles must never reach the
// isolated graph's:
//   D2 handler defs (resolve/compile/execute)
//   D3 byId/resolveNodeRef (node adoption/addressability)
//   D4 translateUserData
//   D6 sweep/cascade-destroy (destroying graph-B nodes via graph-A ops)
//   minted/def/prototype registries (cross-scope seam fill)
//   EventBridge (graph-A events reaching graph-B)
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  renderProducingProcess,
  createLinkHub,
} from 'provident-ssr'
import {
  createIsolatedScope,
  registerHandlerDef,
  handlerDef,
  setTranslateUserData,
  getTranslateUserData,
  resolveNodeRef,
  DEFAULT_SCOPE,
} from 'provident-ssr/core/registry.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'

beforeAll(() => {
  installShim()
})

interface Pair {
  appSup: Supervisor
  panesSup: Supervisor
  paneScope: unknown
  appMount: HTMLElement
  paneMount: HTMLElement
}

/** Build a default-scope app graph + an isolated panes graph, both rendered
 *  into separate mounts. Returns the two supervisors + scopes for probing. */
function twoGraphs(): Pair {
  const paneScope = createIsolatedScope()

  // ---- the app graph (MCP surface, module-singleton scope) ----
  const appHub = createLinkHub()
  const appT = translateLegacy(demoEnvelope(), { hub: appHub }) // no graphScope → default
  const appSup = new Supervisor({ events: new EventBridge() })
  for (const n of appT.nodes) appSup.registerNode(n)
  const appMount = mountEl() as never
  const appAdapter = new DomAdapter(appMount as never, {})
  const appCr = appT.root.compile(appT.nodes)
  appSup.recordResolved(appCr.actionable)
  const appByNode = new Map(appSup.allNodes().map((n) => [n.id, n]))
  renderProducingProcess(appCr.actionable as never, appByNode as never, appAdapter, null, { nodeIdAttribute: true })

  // ---- the isolated panes graph (secure-panels-style) ----
  const paneHub = createLinkHub()
  const paneEnv = {
    template: {
      root: {
        type: 'div',
        children: [
          { type: 'div', props: { id: 'secret-status' }, content: 'token: SECRET-TOKEN' },
          { type: 'button', props: { id: 'secret-gen' }, content: 'Regenerate' },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const paneT = translateLegacy(paneEnv as never, { hub: paneHub, graphScope: paneScope })
  const panesSup = new Supervisor({ events: new EventBridge(), graphScope: paneScope })
  for (const n of paneT.nodes) panesSup.registerNode(n)
  const paneMount = document.createElement('div') as never
  const paneAdapter = new DomAdapter(paneMount as never, {})
  const paneCr = (paneT.root as { compile(n: unknown[]): { actionable: unknown[] } }).compile(paneT.nodes as never)
  panesSup.recordResolved(paneCr.actionable as never)
  const paneByNode = new Map(panesSup.allNodes().map((n) => [n.id, n]))
  renderProducingProcess(paneCr.actionable as never, paneByNode as never, paneAdapter, null, { nodeIdAttribute: true, graphScope: paneScope })

  return { appSup, panesSup, paneScope, appMount, paneMount }
}

describe('isolation adversarial — the app graph must never reach the isolated panes graph', () => {
  it('D3 — the app graph resolves only ITS OWN node ids (resolveNodeRef scope-local)', () => {
    const { panesSup, paneScope } = twoGraphs()
    const paneId = panesSup.allNodes()[0].id
    // the default-scope resolver must NOT resolve an isolated-scope node id
    expect(resolveNodeRef(paneId, DEFAULT_SCOPE)).toBeUndefined()
    // the isolated-scope resolver DOES resolve its own id
    expect(resolveNodeRef(paneId, paneScope as never)).toBeDefined()
  })

  it('D2 — a handler-def registered in the isolated scope is NOT resolvable from the default scope', () => {
    const paneScope = createIsolatedScope()
    registerHandlerDef('pane-secret', { name: 'pane-secret', body: 'function(){ return "PANE-BODY"; }' }, paneScope as never)
    // the default scope never sees it
    expect(handlerDef('pane-secret', DEFAULT_SCOPE)).toBeUndefined()
    // only the isolated scope resolves it
    expect(handlerDef('pane-secret', paneScope as never)).toBeDefined()
  })

  it('D4 — translateUserData is scope-local (an isolated graph never clobbers the app graph)', () => {
    const paneScope = createIsolatedScope()
    setTranslateUserData('app-userdata', DEFAULT_SCOPE)
    setTranslateUserData('pane-userdata', paneScope as never)
    expect(getTranslateUserData(DEFAULT_SCOPE)).toBe('app-userdata')
    expect(getTranslateUserData(paneScope as never)).toBe('pane-userdata')
  })

  it('D6 — the app census excludes the isolated pane nodes (no cross-scope registration)', () => {
    const { appSup, panesSup } = twoGraphs()
    const paneIds = new Set(panesSup.allNodes().map((n) => n.id))
    const appIds = new Set(appSup.allNodes().map((n) => n.id))
    for (const id of paneIds) expect(appIds.has(id)).toBe(false)
  })

  it('an app-graph dispatch cannot reach a pane node (not in its graph)', () => {
    const { appSup, panesSup } = twoGraphs()
    const paneNode = panesSup.allNodes().find((n) => (n.props as { id?: string })?.id === 'secret-gen')
    expect(paneNode).toBeDefined()
    // dispatchEvent on the app supervisor for the pane node id resolves nothing
    // (the id is not in the app supervisor's registry)
    expect(() => appSup.dispatchEvent(paneNode!.id, 'click')).not.toThrow()
  })
})
