// tests/mcp-notify.test.ts — RED tests for the gated live-change-notification
// surface (docs/specs/live-notification-review.md N1-N7). The server must:
//   N1  map a renderer "app graph changed" notify into a resource-updated
//       notification (not a tool-list/list-changed — those are applyGatePatch-
//       only).
//   N2  stdio-only: a notify on the HTTP transport is a no-op (never a hang);
//       a notify on stdio reaches the server.
//   N5  gate-aware: a resource-updated for a `read`-gated URI is emitted only
//       when `read` is enabled.
import { describe, it, expect, vi } from 'vitest'
import { SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

function makeBackend(): McpBackend {
  return { invoke: async () => ({}) }
}

describe('N2 — stdio-only push (never a silent HTTP hang)', () => {
  it('an HTTP transport notify is a NO-OP and does not throw/hang', async () => {
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'http' })
    server.ensureServerRegistered()
    // must not throw, not hang, not reach the SDK send
    await expect(server.notifyGraphChanged()).resolves.toBe(false) // returns false = not delivered (http)
  })

  it('a stdio transport notify reaches the server (delivers resource-updated)', async () => {
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'stdio' })
    const sent = await server.connectMockTransport()
    await expect(server.notifyGraphChanged()).resolves.toBe(true)
    // N1 — the notify is a per-resource content update, NOT a tool/list-changed
    expect(sent.some((m) => m.method === 'notifications/resources/updated')).toBe(true)
    expect(sent.some((m) => m.method === 'notifications/tools/list_changed')).toBe(false)
  })
})

describe('N5 — gate-aware (a read-disabled gate emits no resource-updated)', () => {
  it('with read OFF, a stdio notify delivers nothing', async () => {
    const gate = new SecurityGate({ token: null, enabled: ['dispatch'] }) // read OFF
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'stdio', gate })
    server.ensureServerRegistered()
    await expect(server.notifyGraphChanged()).resolves.toBe(false)
  })

  it('with read ON, a stdio notify delivers', async () => {
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'stdio' })
    await server.connectMockTransport()
    await expect(server.notifyGraphChanged()).resolves.toBe(true)
  })
})
