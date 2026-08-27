// tests/mcp-server-gate.test.ts — RED tests for the A1-W4 MCP server gate unit
// (docs/specs/mcp-server-gate.md §2/§4). Imports `ProvidentMcpServer` /
// `McpBackend` from ../src/main/mcp-server.js and `SecurityGate` from
// ../src/main/security.js.
//
// The RED source: `ProvidentMcpServer` does NOT yet accept a `gate` option,
// and exposes NO `getGateConfig`, `applyGatePatch`, or `gate` accessor. So the
// `getGateConfig`/`applyGatePatch` tests fail with "is not a function", and the
// `gate` accessor assertions fail because `server.gate` is undefined. The
// `SecurityGate.toolAllowed` behavior itself is pre-existing and may PASS.
import { describe, it, expect } from 'vitest'
import { SecurityGate, type ToolGroup } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

/** Minimal backend stub — the gate unit does not exercise `invoke`, so a no-op
 *  satisfies the constructor's `backend` requirement. */
const backend: McpBackend = { invoke: async () => ({} ) }

describe('ProvidentMcpServer gate (spec §2/§4)', () => {
  it('default (no gate) → getGateConfig() is {token:null, enabled:["read","dispatch"]}', () => {
    const server = new ProvidentMcpServer({ backend })
    expect(server.getGateConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })

  it('getGateConfig() returns a COPY — mutating the returned enabled does not affect the server', () => {
    const server = new ProvidentMcpServer({ backend })
    const cfg = server.getGateConfig()
    cfg.enabled.push('code' as ToolGroup)
    cfg.token = 't'
    expect(server.getGateConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })

  it('a `gate` option carrying graph → getGateConfig().enabled includes graph', () => {
    const gate = new SecurityGate().apply({ groups: ['graph'] })
    const server = new ProvidentMcpServer({ backend, gate })
    expect(server.getGateConfig().enabled).toContain('graph')
  })

  it('applyGatePatch({groups:["code"]}) → enabled includes code, server gate is patched', () => {
    const server = new ProvidentMcpServer({ backend })
    const cfg = server.applyGatePatch({ groups: ['code'] })
    expect(cfg.enabled).toContain('code')
    expect(server.getGateConfig().enabled).toContain('code')
    expect(server.gate).toBeInstanceOf(SecurityGate)
    expect(server.gate.toolAllowed('provident.code.load')).toBe(true)
  })

  it('applyGatePatch with a bogus group leaves config unchanged', () => {
    const server = new ProvidentMcpServer({ backend })
    const cfg = server.applyGatePatch({ groups: ['bogus' as ToolGroup] })
    expect(cfg).toEqual({ token: null, enabled: ['read', 'dispatch'] })
    expect(server.getGateConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })

  it('the server gate gates the tool: provident.code.load denied under default, allowed after patch', () => {
    const server = new ProvidentMcpServer({ backend })
    // Default gate — a code-mutation tool is NOT allowed.
    expect(server.gate.toolAllowed('provident.code.load')).toBe(false)
    // After applyGatePatch, the same gate allows it.
    server.applyGatePatch({ groups: ['code'] })
    expect(server.gate.toolAllowed('provident.code.load')).toBe(true)
  })

  it('the server exposes the allowed tool names it will register (gated registration)', () => {
    const server = new ProvidentMcpServer({ backend })
    // Default gate → the read+dispatch subset only; no graph/code tools.
    const allowed = server.allowedToolNames()
    expect(allowed).toContain('provident.dispatch')
    expect(allowed).toContain('provident.get_rendered_html')
    expect(allowed).toContain('provident.list_targets')
    expect(allowed).toContain('provident.get_node_state')
    expect(allowed).toContain('provident.code.get')
    expect(allowed).toContain('provident.code.validate')
    expect(allowed).not.toContain('provident.load')
    expect(allowed).not.toContain('provident.code.load')
  })

  it('M1 — applyGatePatch narrows a LIVE server (the stdio re-gate): the RegisteredTool is disabled', () => {
    const server = new ProvidentMcpServer({ backend })
    // Establish the stdio server (or its registration) so there are live handles.
    server.ensureServerRegistered()
    // A running tool under the default gate.
    expect(server.registeredEnabled('provident.dispatch')).toBe(true)
    // Narrow: drop the dispatch group entirely.
    server.applyGatePatch({ disable: ['dispatch', 'read'] })
    expect(server.registeredEnabled('provident.dispatch')).toBe(false)
    // Re-enable: dispatch comes back.
    server.applyGatePatch({ groups: ['dispatch', 'read'] })
    expect(server.registeredEnabled('provident.dispatch')).toBe(true)
  })

  it('M1-widen — applyGatePatch REGISTERS newly-allowed tools on a LIVE server (spec §2 "registers any newly-allowed ones")', () => {
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    // default gate: code-mutation + graph tools are NOT registered
    expect(server.registeredEnabled('provident.code.load')).toBe(false)
    expect(server.registeredEnabled('provident.load')).toBe(false)
    // Widen: enable the code group on the LIVE server
    server.applyGatePatch({ groups: ['code'] })
    // the newly-allowed code tools are now registered + enabled on the live server
    expect(server.registeredEnabled('provident.code.load')).toBe(true)
    expect(server.registeredEnabled('provident.code.set')).toBe(true)
    // widen further to graph
    server.applyGatePatch({ groups: ['graph'] })
    expect(server.registeredEnabled('provident.load')).toBe(true)
    expect(server.registeredEnabled('provident.teardown')).toBe(true)
  })
})
