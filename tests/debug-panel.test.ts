// tests/debug-panel.test.ts — the Debug pane's live agent-visibility line,
// now hosted in the isolated SecurePanels graph (2026-08-25). The pane renders
// through `SecurePanels.refreshDebug(runtime)`, which sources the APP graph's
// census + SSR preview and writes it into the panes graph's `#status` node —
// provident-rendered (never hand-written DOM), and isolated from the MCP
// surface (the app Runtime, which the MCP endpoints read, does NOT include it).
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'

beforeAll(() => {
  installShim()
})

const noopBridge = {
  get: async () => ({ token: null, enabled: ['read', 'dispatch'] }),
  set: async (p: { token?: string | null; groups?: string[]; disable?: string[] }) => ({ token: null, enabled: ['read', 'dispatch'] }),
}

function installBridge() {
  ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: noopBridge } }
}

describe('debug panel — hosted by the isolated SecurePanels graph (SecurePanels.refreshDebug)', () => {
  it('writes the census line + SSR preview into the panes graph #status node', () => {
    installBridge()
    const mount = document.createElement('div')
    const panels = new SecurePanels(mount)
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    panels.refreshDebug(runtime)
    const statusNode = panels.debugText()
    expect(statusNode).toMatch(/inTree \d+ · registered \d+/)
    const lines = statusNode.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines[1].length).toBeGreaterThan(0)
    // the pane renders in ITS graph, never the app graph
    expect(runtime.renderedHtmlResult().renderedHtml).not.toContain('inTree')
  })
})
