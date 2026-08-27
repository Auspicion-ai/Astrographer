// tests/module-dynamic.test.ts — RED tests for Unit U9 of the module.* extension
// system (docs/specs/module-import-proposal.md §5 dynamic registration + §9 F1
// note + docs/specs/module-feature-list.md §5 U9). This unit wires the
// CapabilityRouter's (U4) dynamic tools into the ProvidentMcpServer AND enforces
// the invocation two-gate (F1) at each call.
//
// These tests are RED because the server does NOT yet accept a router / register
// dynamic `module:<name>.<tool>` tools / enforce the invocation two-gate:
//   - `McpServerOptions` lacks a `router` option (the CapabilityRouter)
//   - `allowedToolNames()` returns only the STATIC `module.*` tools, never the
//     router's dynamic `module:<name>.<tool>` names (M-r3)
//   - the server has no `invokeTool` that applies `moduleToolAllowed` (the
//     invocation two-gate, F1) before dispatching to the router's handler
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'
import { SecurityGate } from '../src/main/security.js'

/** Minimal backend stub — the dynamic-module dispatch routes to the router, not
 *  the renderer backend, so a no-op satisfies the constructor requirement. */
const backend: McpBackend = { invoke: async () => ({}) }

/** A router with a registered executable capture.screenshot tool (U4). */
function routerWithCapture(): CapabilityRouter {
  const router = new CapabilityRouter()
  router.registerModule('capture', (ctx: ModuleCtx) => {
    ctx.tool('screenshot', (args: unknown) => ({ shot: args }))
  })
  return router
}

const both = () => new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'module', 'code'] })
const moduleOnly = () => new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'module'] })
const none = () => new SecurityGate()

describe('U9 — dynamic tool registration (M-r3, proposal §5)', () => {
  it('1. a server built with a router + module enabled lists the dynamic tool in allowedToolNames()', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: both(), router: routerWithCapture() })
    expect(server.allowedToolNames()).toContain('module:capture.screenshot')
  })

  it('2. under the default gate (module off) the dynamic tool is NOT in allowedToolNames()', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: none(), router: routerWithCapture() })
    expect(server.allowedToolNames()).not.toContain('module:capture.screenshot')
  })
})

describe('U9 — invocation two-gate (F1, proposal §5/§9)', () => {
  it('3. invoking with module AND code dispatches to the router handler (returns the result)', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: both(), router: routerWithCapture() })
    expect(server.invokeTool('module:capture.screenshot', { id: 7 })).toEqual({ shot: { id: 7 } })
  })

  it('4. invoking with module ONLY (no code) throws a clean error (the two-gate denies it)', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: moduleOnly(), router: routerWithCapture() })
    expect(() => server.invokeTool('module:capture.screenshot', { id: 7 })).toThrow()
  })

  it('5. invoking with NEITHER module nor code throws a clean error', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: none(), router: routerWithCapture() })
    expect(() => server.invokeTool('module:capture.screenshot', { id: 7 })).toThrow()
  })
})

describe('U9 — dynamic dispatch (§5)', () => {
  it('6. the dynamic tool dispatch returns the router handler result', () => {
    const router = routerWithCapture()
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: both(), router })
    const result = server.invokeTool('module:capture.screenshot', { a: 1, b: 'two' })
    expect(result).toEqual({ shot: { a: 1, b: 'two' } })
  })

  it('7. the dynamic tool is actually REGISTERED on the live server (F1 adversarial fix)', () => {
    const router = routerWithCapture()
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: both(), router })
    server.ensureServerRegistered()
    // the dynamic tool must be in the live registered map (not just allowedToolNames)
    expect(server.registeredEnabled('module:capture.screenshot')).toBe(true)
  })
})
