// tests/mcp-resources.test.ts — RED tests for the gated MCP resources
// (docs/specs/mcp-resources-review.md R1-R5). The server must:
//   R1  register resources only when their group (`read`) is allowed — never
//       always-registered (a `read`-off human grant must shut off the reads).
//   R2  capture + live re-gate the resource handles alongside the tools.
//   R3  wire registration into both transport builds (via createServer).
//   R4  node-template reads validate in-tree/not-destroyed; never the
//       SecurePanels graph.
//   R5  always-fresh snapshots + per-resource mimeType.
import { describe, it, expect } from 'vitest'
import { SecurityGate, type ToolGroup } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

/** A backend that records the invoked methods + returns a configurable reply. */
function makeBackend() {
  const calls: string[] = []
  let reply: unknown = {}
  return {
    calls,
    setReply: (r: unknown) => { reply = r },
    backend: {
      invoke: async (method: string) => { calls.push(method); return reply },
    } satisfies McpBackend,
  }
}

describe('MCP resources — read-group gating (R1/R2)', () => {
  it('default (read ON) → the three resources are registered', () => {
    const { backend } = makeBackend()
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    const uris = server.registeredResources().map((r) => r.uri)
    expect(uris).toContain('mcp://provident/app')
    expect(uris).toContain('mcp://provident/targets')
    expect(server.registeredResources().some((r) => r.uriTemplate === 'mcp://provident/node/{nodeId}')).toBe(true)
  })

  it('R1 — disabling `read` disables the resources on the LIVE server (never always-registered)', () => {
    const { backend } = makeBackend()
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true)
    server.applyGatePatch({ disable: ['read'] })
    expect(server.resourceEnabled('mcp://provident/app')).toBe(false)
    server.applyGatePatch({ groups: ['read'] })
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true)
  })

  it('R1 — a non-read group toggle does NOT affect resource registration (dispatch off keeps reads)', () => {
    const { backend } = makeBackend()
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    server.applyGatePatch({ disable: ['dispatch'] })
    expect(server.resourceEnabled('mcp://provident/app')).toBe(true)
  })
})

describe('MCP resources — reads forward over the backend (R4/R5)', () => {
  it('reading mcp://provident/app invokes renderedHtml and returns the snapshot', async () => {
    const mk = makeBackend()
    mk.setReply({ renderedHtml: '<app/>', ssrHtml: '<app/>', census: { inTree: 1 } })
    const server = new ProvidentMcpServer({ backend: mk.backend })
    server.ensureServerRegistered()
    const out = await server.readResource('mcp://provident/app')
    expect(mk.calls).toContain('renderedHtml')
    expect(out).toMatchObject({ renderedHtml: '<app/>' })
  })

  it('reading the node template mcp://provident/node/{nodeId} invokes nodeState', async () => {
    const mk = makeBackend()
    mk.setReply({ nodeId: 'node-1', states: [], census: { inTree: 1 } })
    const server = new ProvidentMcpServer({ backend: mk.backend })
    server.ensureServerRegistered()
    const out = await server.readResource('mcp://provident/node/node-1')
    expect(mk.calls).toContain('nodeState')
    expect(out).toMatchObject({ nodeId: 'node-1' })
  })

  it('reading mcp://provident/targets invokes listTargets', async () => {
    const mk = makeBackend()
    mk.setReply({ nodes: [] })
    const server = new ProvidentMcpServer({ backend: mk.backend })
    server.ensureServerRegistered()
    await server.readResource('mcp://provident/targets')
    expect(mk.calls).toContain('listTargets')
  })
})
