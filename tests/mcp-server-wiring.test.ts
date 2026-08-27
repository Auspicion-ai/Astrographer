// tests/mcp-server-wiring.test.ts — RED tests for the A1-W2 MCP server wiring
// unit (docs/specs/mcp-server-wiring.md §2/§3/§4/§5). Imports the NEW pure
// functions `toolForName` / `registeredToolNames` from ../src/main/mcp-server.js
// and the existing `SecurityGate` from ../src/main/security.js.
//
// The `toolForName` / `registeredToolNames` tests are RED because those two
// functions do NOT exist on src/main/mcp-server.js yet (not exported → a
// TypeError at import/call time). The `httpAuthorized` assertions pin the
// pre-existing SecurityGate.checkRequest behavior (§4 contract) and may PASS
// immediately — they are regression pins, not the red source.
import { describe, it, expect } from 'vitest'
import { SecurityGate } from '../src/main/security.js'
import {
  toolForName,
  registeredToolNames,
} from '../src/main/mcp-server.js'

/** The full tool-name list the MCP server registers (spec §5): the current 4
 *  + the planned graph/code tools. Prefix `provident.` is part of the name. */
const ALL: string[] = [
  'provident.dispatch',
  'provident.get_rendered_html',
  'provident.list_targets',
  'provident.get_node_state',
  'provident.code.get',
  'provident.code.validate',
  'provident.load',
  'provident.op',
  'provident.export',
  'provident.validate',
  'provident.teardown',
  'provident.code.set',
  'provident.code.create',
  'provident.code.delete',
  'provident.code.load',
]

/** §4 — httpAuthorized(gate, headers) → gate.checkRequest(headers).ok. */
function httpAuthorized(
  gate: SecurityGate,
  headers: Record<string, unknown> | null | undefined,
): boolean {
  return gate.checkRequest(headers).ok
}

describe('toolForName (§2, §5)', () => {
  it("maps a 'provident.'-prefixed name to its registration name", () => {
    expect(toolForName('provident.dispatch')).toBe('dispatch')
  })

  it('throws for a name without the provident. prefix', () => {
    expect(() => toolForName('unknown')).toThrow()
  })

  it('strips the provident. prefix for an unknown tool name (membership is registeredToolNames job)', () => {
    expect(toolForName('provident.nope')).toBe('nope')
  })

  it('rejects an empty tool name after the prefix (fail-closed, F2)', () => {
    expect(() => toolForName('provident.')).toThrow()
    expect(() => toolForName('provident.  ')).toThrow()
  })

  it('rejects a double-prefixed name (fail-closed, F2)', () => {
    expect(() => toolForName('provident.provident.x')).toThrow()
  })

  it('rejects a non-string name (fail-closed, F2)', () => {
    expect(() => toolForName(null as never)).toThrow()
    expect(() => toolForName(42 as never)).toThrow()
  })
})

describe('registeredToolNames (§3, §5)', () => {
  it('default gate (read+dispatch) registers the read/dispatch tools', () => {
    const gate = new SecurityGate()
    const names = registeredToolNames(gate, ALL)
    expect(names).toContain('provident.dispatch')
    expect(names).toContain('provident.get_rendered_html')
    expect(names).toContain('provident.list_targets')
    expect(names).toContain('provident.get_node_state')
    expect(names).toContain('provident.code.get')
    expect(names).toContain('provident.code.validate')
  })

  it('default gate EXCLUDES the graph tools', () => {
    const gate = new SecurityGate()
    const names = registeredToolNames(gate, ALL)
    expect(names).not.toContain('provident.load')
    expect(names).not.toContain('provident.op')
    expect(names).not.toContain('provident.export')
    expect(names).not.toContain('provident.validate')
    expect(names).not.toContain('provident.teardown')
  })

  it('default gate EXCLUDES the code-mutation tools', () => {
    const gate = new SecurityGate()
    const names = registeredToolNames(gate, ALL)
    expect(names).not.toContain('provident.code.set')
    expect(names).not.toContain('provident.code.create')
    expect(names).not.toContain('provident.code.delete')
    expect(names).not.toContain('provident.code.load')
  })

  it('a tool whose group is allowed but unknown to the map never registers', () => {
    const gate = new SecurityGate()
    const names = registeredToolNames(gate, [...ALL, 'provident.unknown_tool'])
    expect(names).not.toContain('provident.unknown_tool')
  })

  it('dedupes the output so the SDK register loop never sees a duplicate (F3)', () => {
    const gate = new SecurityGate()
    const names = registeredToolNames(gate, [...ALL, 'provident.dispatch', 'provident.dispatch'])
    expect(names.filter((n) => n === 'provident.dispatch')).toHaveLength(1)
  })

  it('enabling graph/code registers those tools (§3)', () => {
    const gate = new SecurityGate().apply({ groups: ['graph', 'code'] })
    const names = registeredToolNames(gate, ALL)
    expect(names).toContain('provident.load')
    expect(names).toContain('provident.op')
    expect(names).toContain('provident.export')
    expect(names).toContain('provident.validate')
    expect(names).toContain('provident.teardown')
    expect(names).toContain('provident.code.set')
    expect(names).toContain('provident.code.create')
    expect(names).toContain('provident.code.delete')
    expect(names).toContain('provident.code.load')
  })
})

describe('httpAuthorized (§4) — pre-existing SecurityGate.checkRequest pins', () => {
  it('a gate with no token authorizes an empty header set', () => {
    const gate = new SecurityGate({ token: null, enabled: ['read'] })
    expect(httpAuthorized(gate, {})).toBe(true)
  })

  it('a gated token authorizes the matching Bearer header', () => {
    const gate = new SecurityGate({ token: 's', enabled: ['read'] })
    expect(httpAuthorized(gate, { authorization: 'Bearer s' })).toBe(true)
  })

  it('a gated token rejects a wrong Bearer header', () => {
    const gate = new SecurityGate({ token: 's', enabled: ['read'] })
    expect(httpAuthorized(gate, { authorization: 'Bearer wrong' })).toBe(false)
  })
})
