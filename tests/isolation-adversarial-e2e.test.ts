// tests/isolation-adversarial-e2e.test.ts — the adversarial pass driven
// through the ACTUAL MCP-facing surfaces: the app `Runtime` (what
// `provident.dispatch`/`get_rendered_html`/`list_targets` read) vs the
// isolated `SecurePanels` graph. An agent holding ONLY the app Runtime must
// never see, dispatch, or mutate the isolated panes, and the panes' own
// mutations must never leak into the app graph.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { translateLegacy, createLinkHub } from 'provident-ssr'
import { createIsolatedScope, resolveNodeRef, DEFAULT_SCOPE } from 'provident-ssr/core/registry.js'

beforeAll(() => {
  installShim()
})

function fakeSecurity() {
  let cfg = { token: null, enabled: ['read', 'dispatch'] }
  return {
    current: () => cfg,
    bridge: {
      get: async () => ({ ...cfg }),
      set: async (patch: { token?: string | null; groups?: string[]; disable?: string[] }) => {
        const next: typeof cfg = { ...cfg }
        if ('token' in patch) next.token = patch.token ?? null
        if (patch.groups) for (const g of patch.groups) if (!next.enabled.includes(g)) next.enabled.push(g)
        if (patch.disable) next.enabled = next.enabled.filter((g) => !patch.disable!.includes(g))
        cfg = next
        return { ...next }
      },
    },
  }
}

async function makePair() {
  const fake = fakeSecurity()
  ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: fake.bridge } }
  const app = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
  app.bootstrap()
  const paneMount = document.createElement('div')
  const panels = new SecurePanels(paneMount)
  await panels.refresh()
  return { app, panels, fake, paneMount }
}

describe('isolation adversarial (real Runtime + SecurePanels) — MCP surface vs isolated panes', () => {
  it('the app Runtime NEVER exposes pane content via get_rendered_html / list_targets', async () => {
    const { app, paneMount } = await makePair()
    const html = app.renderedHtmlResult().renderedHtml
    // none of the pane strings leak into the MCP HTML surface
    expect(html).not.toContain('Loopback token')
    expect(html).not.toContain('Regenerate')
    expect(html).not.toContain('Security & agent permissions')
    const targets = app.listTargets().nodes
    // no pane node id is addressable from the app graph
    const paneIds = ['settings-pane', 'token-gen', 'token-clear', 'security-status', 'debug-pane']
    for (const id of paneIds) {
      expect(targets.some((n) => n.propsId === id)).toBe(false)
    }
    // the pane content IS in the panes mount (its own graph)
    expect((paneMount as unknown as { innerHTML: string }).innerHTML).toContain('Loopback token')
  })

  it('an MCP dispatch to a pane css/props id throws unresolved (the app graph cannot address the pane)', async () => {
    const { app } = await makePair()
    await expect(app.dispatch({ target: { kind: 'cssId', cssId: 'token-gen' }, event: 'click' })).rejects.toThrow(/unresolved target/)
    await expect(app.dispatch({ target: { kind: 'cssId', cssId: 'security-status' }, event: 'click' })).rejects.toThrow(/unresolved target/)
  })

  it('a pane mutation (token regenerate) is NOT visible to the app MCP surface', async () => {
    const { app, panels, fake, paneMount } = await makePair()
    await panels.refresh()
    await panels.dispatch('token-gen')
    // the pane graph + the IPC bridge reflect the new token
    expect(fake.current().token).toBeTruthy()
    expect((paneMount as unknown as { innerHTML: string }).innerHTML).toContain('••••')
    // but the app MCP surface never sees it
    expect(app.renderedHtmlResult().renderedHtml).not.toContain('••••')
    expect(app.renderedHtmlResult().renderedHtml).not.toContain(fake.current().token!)
  })

  it('D6 — an app teardown does NOT destroy the isolated pane graph (scope-partitioned sweep)', async () => {
    const { app, paneMount, panels } = await makePair()
    // the app graph tears down to root-only
    await app.teardownResult()
    // the pane graph survives intact
    expect((paneMount as unknown as { innerHTML: string }).innerHTML).toContain('Loopback token')
    expect((paneMount as unknown as { innerHTML: string }).innerHTML).toContain('Regenerate')
    // the pane graph is still functional
    await panels.dispatch('token-gen')
    expect((paneMount as unknown as { innerHTML: string }).innerHTML).toContain('••••')
  })

  it('same-minted-id collision: the app graph never adopts the pane node for a shared id (scope-local byId)', () => {
    const appHub = createLinkHub()
    const paneHub = createLinkHub()
    const paneScope = createIsolatedScope()
    const appEnv = { template: { root: { type: 'div', props: { id: 'root-a' } } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const paneEnv = { template: { root: { type: 'div', props: { id: 'root-b' } } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } }
    const appT = translateLegacy(appEnv as never, { hub: appHub })
    const paneT = translateLegacy(paneEnv as never, { hub: paneHub, graphScope: paneScope })
    // both roots may share a minted id (module-level nodeSeq); if they do, the
    // app's scope must still resolve its OWN root, not the pane's
    const paneRootId = (paneT.root as { id: string }).id
    const resolvedFromApp = resolveNodeRef(paneRootId, DEFAULT_SCOPE)
    // if the app minted the same id, the app's scope holds the APP node, not the pane node
    const appRoot = appT.root as { id: string }
    if (resolvedFromApp) {
      expect((resolvedFromApp as { id: string }).id).toBe(appRoot.id)
      expect(resolvedFromApp).not.toBe(paneT.root)
    }
    expect(resolveNodeRef(paneRootId, paneScope as never)).toBe(paneT.root)
  })
})
