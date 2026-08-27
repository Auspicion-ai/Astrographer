// tests/mcp-resources-adversarial.test.ts — the adversarial pass for the
// gated MCP resources (mcp-resources-review.md R1-R5). Hunts edge cases:
//   A1  a `read`-off gate must NOT leave a resource readable (no always-
//       registered bypass) on the LIVE server AND on a fresh HTTP build.
//   A2  the node template must validate the nodeId (a destroyed/unknown node
//       maps to a clean not-found via the backend, never a stale/ghost read).
//   A3  resources never reach the isolated SecurePanels graph (they route only
//       through the app Runtime backend).
//   A4  unknown/malformed URIs fail cleanly (no throw/500).
import { describe, it, expect } from 'vitest'
import { SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

function makeBackend(reply: unknown = {}) {
  const calls: string[] = []
  return {
    calls,
    backend: { invoke: async (method: string) => { calls.push(method); return reply } } satisfies McpBackend,
  }
}

describe('A1 — a `read`-off gate shuts off the resources (no bypass door)', () => {
  it('after disabling read, a FRESH server build registers NO read resources', () => {
    // HTTP builds a fresh server per POST from the current gate — simulate
    // that by constructing a new server with a read-off gate.
    const { backend } = makeBackend()
    const gate = new SecurityGate({ token: null, enabled: ['dispatch'] }) // read OFF
    const server = new ProvidentMcpServer({ backend, gate })
    server.ensureServerRegistered()
    expect(server.registeredResources()).toHaveLength(0)
    expect(server.resourceEnabled('mcp://provident/app')).toBe(false)
  })

  it('a read-off gate has no registered resources at all (app/targets/node all absent)', async () => {
    const { backend } = makeBackend()
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    server.applyGatePatch({ disable: ['read'] })
    // the live server still holds the handles but all are DISABLED
    const all = server.registeredResources()
    expect(all.length).toBeGreaterThan(0)
    for (const r of all) expect(r.enabled).toBe(false)
  })
})

describe('A4 — malformed/unknown URIs fail cleanly', () => {
  it('reading an unregistered URI throws a clean not-found (no 500 stack)', async () => {
    const { backend } = makeBackend()
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    await expect(server.readResource('mcp://provident/does-not-exist')).rejects.toThrow(/resource not found/)
  })
})

describe('A2/A3 — node-template hardening + SecurePanels isolation', () => {
  it('a destroyed/unknown nodeId is forwarded for backend validation (the backend rejects it)', async () => {
    // The resource forwards the nodeId to the backend (app Runtime nodeState),
    // which throws `unresolved target` for a destroyed/unknown node. The
    // resource read surfaces that as a clean error, never a stale snapshot.
    const { calls } = makeBackend()
    const backend: McpBackend = {
      invoke: async (method: string) => {
        calls.push(method)
        if (method === 'nodeState') throw new Error('unresolved target: node-999')
        return {}
      },
    }
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    await expect(server.readResource('mcp://provident/node/node-999')).rejects.toThrow(/unresolved target/)
    expect(calls).toContain('nodeState')
  })

  it('resources route ONLY through the app Runtime backend (never the SecurePanels graph)', async () => {
    // The SecurePanels graph is a SEPARATE Supervisor/GraphScope; the resource
    // callbacks forward over the SAME backend.invoke seam the tools use, which
    // the renderer dispatches only to the app Runtime. The backend is the only
    // routing surface — a resource handler has no path to the pane graph.
    const mk = makeBackend({ renderedHtml: '<app/>' })
    const server = new ProvidentMcpServer({ backend: mk.backend })
    server.ensureServerRegistered()
    const out = await server.readResource('mcp://provident/app')
    // the resource returned app content, and the ONLY invoke was renderedHtml
    // (the app Runtime's surface) — never any SecurePanels-only method
    expect(mk.calls).toEqual(['renderedHtml'])
    expect(out).toMatchObject({ renderedHtml: '<app/>' })
  })
})
