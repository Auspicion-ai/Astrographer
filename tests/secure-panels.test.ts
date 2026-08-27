// tests/secure-panels.test.ts — the RED set for the SecurePanels isolated
// graph (multi-graph isolation adoption, 2026-08-25).
//
// Contract (docs/specs/secure-panels.md):
//   SecurePanels(mount, opts?) — an owner of a SECOND provident graph (its own
//   `createIsolatedScope()` + hub + Supervisor + DomAdapter) that renders the
//   operator-only Security Settings pane + Debug pane as provident data.
//
// Isolation guarantees (the security-critical acceptance criteria):
//   - the pane graph uses its OWN GraphScope, so it is NOT addressable from the
//     app Runtime's graph (MCP `dispatch`/`get_rendered_html`/`list_targets`
//     never see it).
//   - pane handlers call the IPC bridge (window.provident.security), NEVER an
//     MCP tool — an agent cannot drive the security controls.
//
// TDD: these are written FIRST from the spec and EXPECTED to fail (module
// not found). The Implementer runs next (least code to green), then the
// adversarial pass.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'

beforeAll(() => {
  installShim()
})

/** A fake window.provident.security bridge (the renderer's IPC surface). */
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

function installBridge(fake: ReturnType<typeof fakeSecurity>) {
  ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: fake.bridge } }
}

describe('SecurePanels — the isolated security/debug pane graph', () => {
  it('renders the security settings controls as provident data (token input, gen/clear, group toggles)', async () => {
    const mount = mountEl() as never
    const fake = fakeSecurity()
    installBridge(fake)
    const panels = new SecurePanels(mount as never)
    await panels.refresh()
    const html = (mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('Security')
    expect(html).toContain('Loopback token')
    expect(html).toContain('Regenerate')
    expect(html).toContain('Clear')
    // every pane element carries the data-node-id (traceable, but in ITS graph)
    expect(html).toMatch(/data-node-id=/)
  })

  it('the pane graph is ISOLATED — the app Runtime never sees it (no cross-graph addressability)', async () => {
    const mount = mountEl() as never
    const paneMount = document.createElement('div') as never
    const fake = fakeSecurity()
    installBridge(fake)
    const panels = new SecurePanels(paneMount)
    await panels.refresh()
    // The app Runtime boots the DEMO graph only — its rendered HTML + targets
    // must NOT contain any security-pane content.
    const app = new Runtime({ mount, envelope: demoEnvelope() as never })
    app.bootstrap()
    expect(app.renderedHtmlResult().renderedHtml).not.toContain('Loopback token')
    expect(app.renderedHtmlResult().renderedHtml).not.toContain('Regenerate')
    const targets = app.listTargets().nodes
    expect(targets.some((n) => (n.content as string | undefined)?.includes('Regenerate'))).toBe(false)
    // The pane's own graph shows the controls.
    expect((paneMount as unknown as { innerHTML: string }).innerHTML).toContain('Regenerate')
  })

  it('a pane handler (Regenerate) calls the IPC bridge.set, never an MCP tool', async () => {
    const mount = document.createElement('div') as never
    const fake = fakeSecurity()
    installBridge(fake)
    const panels = new SecurePanels(mount)
    await panels.refresh()
    expect(fake.current().token).toBe(null)
    await panels.dispatch('token-gen')
    expect(fake.current().token).toBeTruthy()
  })

  it('a pane handler (group toggle) calls the IPC bridge.set', async () => {
    const mount = document.createElement('div') as never
    const fake = fakeSecurity()
    installBridge(fake)
    const panels = new SecurePanels(mount)
    await panels.refresh()
    expect(fake.current().enabled).toEqual(['read', 'dispatch'])
    await panels.dispatch('toggle:graph')
    expect(fake.current().enabled).toContain('graph')
    await panels.dispatch('toggle:graph')
    expect(fake.current().enabled).not.toContain('graph')
  })
})
