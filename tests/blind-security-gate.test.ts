// tests/blind-security-gate.test.ts — BLIND-TEST WRITER artifact (AGENTS.md item 10a).
//
// Produced from DOCUMENTATION ONLY:
//   docs/specs/mcp-security-greens.md        (G1..G10, scenarios 1-38 + Part 2)
//   docs/specs/mcp-server-gate-greens.md     (W1..W3, G4..G5)
//   docs/specs/mcp-security.md
//   docs/specs/mcp-security-gate.md
//   docs/specs/mcp-server-wiring.md
//   docs/specs/mcp-server-gate.md
//
// Imports ONLY the names the docs name. No implementation file was read.
import { describe, it, expect } from 'vitest'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  authorized,
  applyPatch,
  SecurityGate,
  type ToolGroup,
  type SecurityConfig,
} from '../src/main/security.js'
import {
  toolForName,
  registeredToolNames,
  ProvidentMcpServer,
  type McpBackend,
} from '../src/main/mcp-server.js'

/** The full tool-name list the MCP server registers (spec §2/§3/§5). */
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

/** W3 — the HTTP 401 contract: httpAuthorized(gate, headers) = gate.checkRequest(headers).ok. */
function httpAuthorized(
  gate: SecurityGate,
  headers: Record<string, unknown> | null | undefined,
): boolean {
  return gate.checkRequest(headers).ok
}

/** A gate with the given token (enabled defaults to read+dispatch). */
function gateWithToken(token: string): SecurityGate {
  return new SecurityGate({ token, enabled: ['read', 'dispatch'] })
}

const backend: McpBackend = { invoke: async () => ({}) }

describe('G1 — Tool-group mapping (spec §2)', () => {
  it('1. groupForTool("provident.dispatch") → "dispatch"', () => {
    expect(groupForTool('provident.dispatch')).toBe('dispatch')
  })
  it('2. groupForTool("provident.get_rendered_html") → "read"', () => {
    expect(groupForTool('provident.get_rendered_html')).toBe('read')
  })
  it('3. groupForTool("provident.code.load") → "code"', () => {
    expect(groupForTool('provident.code.load')).toBe('code')
  })
  it('4. groupForTool("provident.teardown") → "graph"', () => {
    expect(groupForTool('provident.teardown')).toBe('graph')
  })
  it('5. groupForTool("provident.code.get") → "read"', () => {
    expect(groupForTool('provident.code.get')).toBe('read')
  })
  it('6. groupForTool("provident.unknown") → null', () => {
    expect(groupForTool('provident.unknown')).toBeNull()
  })
  it('7. groupForTool("") → null; groupForTool("provident.code") → null (a prefix is not a tool)', () => {
    expect(groupForTool('')).toBeNull()
    expect(groupForTool('provident.code')).toBeNull()
  })
})

describe('G2 — Permission gate (spec §2/§3)', () => {
  it('8. toolAllowed("provident.dispatch", ["read","dispatch"]) → true', () => {
    expect(toolAllowed('provident.dispatch', ['read', 'dispatch'])).toBe(true)
  })
  it('9. toolAllowed("provident.get_rendered_html", ["read","dispatch"]) → true', () => {
    expect(toolAllowed('provident.get_rendered_html', ['read', 'dispatch'])).toBe(true)
  })
  it('10. toolAllowed("provident.code.load", ["read","dispatch"]) → false (code OFF by default)', () => {
    expect(toolAllowed('provident.code.load', ['read', 'dispatch'])).toBe(false)
  })
  it('11. toolAllowed("provident.teardown", ["read","dispatch"]) → false (graph OFF by default)', () => {
    expect(toolAllowed('provident.teardown', ['read', 'dispatch'])).toBe(false)
  })
  it('12. toolAllowed("provident.unknown", ["read","dispatch","graph","code"]) → false (unknown never allowed)', () => {
    expect(toolAllowed('provident.unknown', ['read', 'dispatch', 'graph', 'code'])).toBe(false)
  })
  it('13. toolAllowed accepts BOTH a Set and an array (F2 closed)', () => {
    expect(toolAllowed('provident.dispatch', new Set(['read', 'dispatch']))).toBe(true)
    expect(toolAllowed('provident.dispatch', ['read', 'dispatch'])).toBe(true)
  })
  it('14. Enabling code makes code.* allowed', () => {
    expect(toolAllowed('provident.code.load', ['read', 'dispatch', 'code'])).toBe(true)
  })
})

describe('G3 — Defaults (spec §3)', () => {
  it('15. defaultSecurityConfig() → { token: null, enabled: ["read","dispatch"] }', () => {
    expect(defaultSecurityConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })
  it('16. Two calls return independent objects', () => {
    const a = defaultSecurityConfig()
    const b = defaultSecurityConfig()
    a.enabled.push('code' as ToolGroup)
    expect(b.enabled).toEqual(['read', 'dispatch'])
  })
})

describe('G4 — Token authorization (spec §4 + F1/F6)', () => {
  it('17. authorized({}, null) → true (no token ⇒ open)', () => {
    expect(authorized({}, null)).toBe(true)
  })
  it('18. authorized({}, "secret") → false', () => {
    expect(authorized({}, 'secret')).toBe(false)
  })
  it('19. authorized({ authorization: "Bearer secret" }, "secret") → true', () => {
    expect(authorized({ authorization: 'Bearer secret' }, 'secret')).toBe(true)
  })
  it('20. authorized({ authorization: "Bearer wrong" }, "secret") → false', () => {
    expect(authorized({ authorization: 'Bearer wrong' }, 'secret')).toBe(false)
  })
  it('21. authorized({ authorization: "bearer secret" }, "secret") → true (scheme case-insensitive)', () => {
    expect(authorized({ authorization: 'bearer secret' }, 'secret')).toBe(true)
  })
  it('22. authorized({ "mcp-token": "secret" }, "secret") → true', () => {
    expect(authorized({ 'mcp-token': 'secret' }, 'secret')).toBe(true)
  })
  it('23. authorized({ authorization: "" }, "secret") → false (empty header)', () => {
    expect(authorized({ authorization: '' }, 'secret')).toBe(false)
  })
  it('24. F1: authorized({ authorization: ["Bearer x","Extra"] }, "secret") → false (never throws)', () => {
    expect(() => authorized({ authorization: ['Bearer x', 'Extra'] }, 'secret')).not.toThrow()
    expect(authorized({ authorization: ['Bearer x', 'Extra'] }, 'secret')).toBe(false)
  })
  it('25. F1: authorized({ authorization: 42 }, "secret") → false (no crash)', () => {
    expect(() => authorized({ authorization: 42 }, 'secret')).not.toThrow()
    expect(authorized({ authorization: 42 }, 'secret')).toBe(false)
  })
  it('26. F6: empty token admits nothing — authorized({authorization:"Bearer "}, "") → false; authorized({"mcp-token":""}, "") → false', () => {
    expect(authorized({ authorization: 'Bearer ' }, '')).toBe(false)
    expect(authorized({ 'mcp-token': '' }, '')).toBe(false)
  })
})

describe('G5 — applyPatch (spec §5 + F3/F4/F5)', () => {
  it('27. Enabling code: applyPatch(default, { groups: ["code"] }).enabled → ["read","dispatch","code"]', () => {
    const d = defaultSecurityConfig()
    expect(applyPatch(d, { groups: ['code'] }).enabled).toEqual(['read', 'dispatch', 'code'])
  })
  it('28. Additive + disable: applyPatch(default, { groups: ["code"], disable: ["dispatch"] }).enabled → ["read","code"]', () => {
    const d = defaultSecurityConfig()
    expect(applyPatch(d, { groups: ['code'], disable: ['dispatch'] }).enabled).toEqual(['read', 'code'])
  })
  it('29. Disable-only: applyPatch(default, { disable: ["dispatch"] }).enabled → ["read"]', () => {
    const d = defaultSecurityConfig()
    expect(applyPatch(d, { disable: ['dispatch'] }).enabled).toEqual(['read'])
  })
  it('30. A bogus group rejects the whole patch unchanged (same enabled array)', () => {
    const d = defaultSecurityConfig()
    const r = applyPatch(d, { groups: ['bogus' as ToolGroup] })
    expect(r.enabled).toEqual(['read', 'dispatch'])
  })
  it('31. F4: applyPatch(default, { disable: {} }) does NOT throw; config unchanged', () => {
    const d = defaultSecurityConfig()
    expect(() => applyPatch(d, { disable: {} as never })).not.toThrow()
    expect(applyPatch(d, { disable: {} as never }).enabled).toEqual(['read', 'dispatch'])
  })
  it('32. F4: applyPatch(default, { groups: "code" }) (string) does NOT throw; config unchanged', () => {
    const d = defaultSecurityConfig()
    expect(() => applyPatch(d, { groups: 'code' as never })).not.toThrow()
    expect(applyPatch(d, { groups: 'code' as never }).enabled).toEqual(['read', 'dispatch'])
  })
  it('33. F3: applyPatch(default, { token: 123 }) → config unchanged (non-string token rejected)', () => {
    const d = defaultSecurityConfig()
    const r = applyPatch(d, { token: 123 as never })
    expect(r.token).toBeNull()
    expect(r.enabled).toEqual(['read', 'dispatch'])
  })
  it('34. F6: applyPatch(default, { token: "" }) → config unchanged (empty token rejected)', () => {
    const d = defaultSecurityConfig()
    const r = applyPatch(d, { token: '' })
    expect(r.token).toBeNull()
    expect(r.enabled).toEqual(['read', 'dispatch'])
  })
  it('35. F5: applyPatch(default, {}) returns a NEW object whose enabled is a FRESH array (no aliasing)', () => {
    const d = defaultSecurityConfig()
    const r = applyPatch(d, {})
    expect(r).not.toBe(d)
    expect(r.enabled).not.toBe(d.enabled)
    expect(r.enabled).toEqual(['read', 'dispatch'])
  })
  it('36. applyPatch(default, { token: "s" }) sets the token and PRESERVES the enabled list', () => {
    const d = defaultSecurityConfig()
    const r = applyPatch(d, { token: 's' })
    expect(r.token).toBe('s')
    expect(r.enabled).toEqual(['read', 'dispatch'])
  })
})

describe('G7 — SecurityGate: construction & defaults', () => {
  it('1. new SecurityGate().enabled ⊇ {read,dispatch}, excludes graph/code; token null', () => {
    const g = new SecurityGate()
    expect(g.token ?? g.config.token).toBeNull()
    expect(g.enabled.has('read')).toBe(true)
    expect(g.enabled.has('dispatch')).toBe(true)
    expect(g.enabled.has('graph')).toBe(false)
    expect(g.enabled.has('code')).toBe(false)
  })
  it('2. new SecurityGate(config) copies the caller config (no aliasing)', () => {
    const caller: SecurityConfig = { token: 's', enabled: ['read', 'code'] }
    const g = new SecurityGate(caller)
    caller.token = 'mutated'
    caller.enabled.push('graph')
    expect(g.config.token).toBe('s')
    expect(g.config.enabled).toEqual(['read', 'code'])
  })
  it('3. defaultSecurityConfig() twice → independent objects', () => {
    const a = defaultSecurityConfig()
    const b = defaultSecurityConfig()
    a.enabled.push('code' as ToolGroup)
    expect(b.enabled).toEqual(['read', 'dispatch'])
  })
})

describe('G8 — checkRequest (the token gate)', () => {
  it('4. new SecurityGate().checkRequest({}) → {ok:true} (no token ⇒ open)', () => {
    expect(new SecurityGate().checkRequest({})).toEqual({ ok: true })
  })
  it('5. new SecurityGate({token:"s",enabled}).checkRequest({authorization:"Bearer s"}) → {ok:true}', () => {
    expect(new SecurityGate({ token: 's', enabled: ['read', 'dispatch'] }).checkRequest({ authorization: 'Bearer s' })).toEqual({ ok: true })
  })
  it('6. checkRequest({authorization:"Bearer wrong"}) → {ok:false, reason:"unauthorized"}', () => {
    expect(new SecurityGate({ token: 's', enabled: ['read', 'dispatch'] }).checkRequest({ authorization: 'Bearer wrong' })).toEqual({
      ok: false,
      reason: 'unauthorized',
    })
  })
  it('7. checkRequest({authorization:["Bearer s"]}) → {ok:false} (never throws — F1)', () => {
    const g = new SecurityGate({ token: 's', enabled: ['read', 'dispatch'] })
    expect(() => g.checkRequest({ authorization: ['Bearer s'] })).not.toThrow()
    expect(g.checkRequest({ authorization: ['Bearer s'] })).toEqual({ ok: false, reason: 'unauthorized' })
  })
  it('8. F-gate: checkRequest(null) and checkRequest(undefined) → {ok:false}, never throws', () => {
    const g = new SecurityGate({ token: 's', enabled: ['read', 'dispatch'] })
    expect(() => g.checkRequest(null)).not.toThrow()
    expect(() => g.checkRequest(undefined)).not.toThrow()
    expect(g.checkRequest(null)).toEqual({ ok: false, reason: 'unauthorized' })
    expect(g.checkRequest(undefined)).toEqual({ ok: false, reason: 'unauthorized' })
  })
  it('9. F-key: uppercase keys authenticate — { Authorization: "Bearer s" } → {ok:true}; { "MCP-Token": "s" } → {ok:true}', () => {
    const g = new SecurityGate({ token: 's', enabled: ['read', 'dispatch'] })
    expect(g.checkRequest({ Authorization: 'Bearer s' })).toEqual({ ok: true })
    expect(g.checkRequest({ 'MCP-Token': 's' })).toEqual({ ok: true })
  })
  it('10. F6: checkRequest({authorization:"Bearer "}) with token:"" → {ok:false}', () => {
    expect(new SecurityGate({ token: '', enabled: ['read', 'dispatch'] }).checkRequest({ authorization: 'Bearer ' })).toEqual({
      ok: false,
      reason: 'unauthorized',
    })
  })
})

describe('G9 — SecurityGate.toolAllowed', () => {
  it('11. new SecurityGate().toolAllowed("provident.dispatch") → true', () => {
    expect(new SecurityGate().toolAllowed('provident.dispatch')).toBe(true)
  })
  it('12. new SecurityGate().toolAllowed("provident.code.load") → false (code OFF default)', () => {
    expect(new SecurityGate().toolAllowed('provident.code.load')).toBe(false)
  })
  it('13. new SecurityGate().toolAllowed("provident.unknown") → false', () => {
    expect(new SecurityGate().toolAllowed('provident.unknown')).toBe(false)
  })
  it('14. apply({groups:["code"]}).toolAllowed("provident.code.load") → true AND original still denies (purity)', () => {
    const g = new SecurityGate()
    expect(g.apply({ groups: ['code'] }).toolAllowed('provident.code.load')).toBe(true)
    expect(g.toolAllowed('provident.code.load')).toBe(false)
  })
})

describe('G10 — SecurityGate.apply (the immutable patch)', () => {
  it('15. g.apply({groups:["code"]}).config.enabled → ["read","dispatch","code"]; original g.config.enabled unchanged', () => {
    const g = new SecurityGate()
    const ng = g.apply({ groups: ['code'] })
    expect(ng.config.enabled).toEqual(['read', 'dispatch', 'code'])
    expect(g.config.enabled).toEqual(['read', 'dispatch'])
  })
  it('16. g.apply({token:"x"}) returns a NEW object (!== g); original keeps its old token', () => {
    const g = new SecurityGate({ token: 'old', enabled: ['read', 'dispatch'] })
    const ng = g.apply({ token: 'x' })
    expect(ng).not.toBe(g)
    expect(ng.config.token).toBe('x')
    expect(g.config.token).toBe('old')
  })
  it('17. g.apply({token:""}) → unchanged (empty token rejected — F6)', () => {
    const g = new SecurityGate({ token: 's', enabled: ['read', 'dispatch'] })
    const ng = g.apply({ token: '' })
    expect(ng.config.token).toBe('s')
    expect(ng.config.enabled).toEqual(['read', 'dispatch'])
  })
  it('18. g.apply({groups:"code"}) / {disable:{}} / {groups:["bogus"]} → same config, never throw (F3/F4)', () => {
    const g = new SecurityGate()
    expect(() => g.apply({ groups: 'code' as never })).not.toThrow()
    expect(() => g.apply({ disable: {} as never })).not.toThrow()
    expect(() => g.apply({ groups: ['bogus' as ToolGroup] })).not.toThrow()
    expect(g.apply({ groups: 'code' as never }).config.enabled).toEqual(['read', 'dispatch'])
    expect(g.apply({ disable: {} as never }).config.enabled).toEqual(['read', 'dispatch'])
    expect(g.apply({ groups: ['bogus' as ToolGroup] }).config.enabled).toEqual(['read', 'dispatch'])
  })
  it('19. g.apply({}).config.enabled is a DIFFERENT array reference than the original (no aliasing — F5)', () => {
    const g = new SecurityGate()
    const ng = g.apply({})
    expect(ng.config.enabled).not.toBe(g.config.enabled)
    expect(ng.config.enabled).toEqual(['read', 'dispatch'])
  })
  it('20. The config getter returns a fresh array each call; pushing to it does not affect the gate', () => {
    const g = new SecurityGate()
    const a = g.config.enabled
    const b = g.config.enabled
    expect(a).not.toBe(b)
    a.push('code' as ToolGroup)
    expect(g.config.enabled).toEqual(['read', 'dispatch'])
  })
})

describe('W1 — toolForName (spec §2/§5)', () => {
  it('1. toolForName("provident.dispatch") → "dispatch"', () => {
    expect(toolForName('provident.dispatch')).toBe('dispatch')
  })
  it('2. toolForName("provident.code.load") → "code.load" (two-part keeps sub-path)', () => {
    expect(toolForName('provident.code.load')).toBe('code.load')
  })
  it('3. toolForName("nope") → THROWS (must be under provident. prefix)', () => {
    expect(() => toolForName('nope')).toThrow()
  })
  it('4. toolForName("provident.nope") → "nope" (prefix stripped; known-ness is registeredToolNames concern)', () => {
    expect(toolForName('provident.nope')).toBe('nope')
  })
  it('5. F2/fail-closed: toolForName("provident.") and toolForName("provident.  ") → THROWS', () => {
    expect(() => toolForName('provident.')).toThrow()
    expect(() => toolForName('provident.  ')).toThrow()
  })
  it('6. F2: toolForName("provident.provident.x") (double prefix) → THROWS', () => {
    expect(() => toolForName('provident.provident.x')).toThrow()
  })
  it('7. F2: toolForName(null) and toolForName(42) → THROWS', () => {
    expect(() => toolForName(null as never)).toThrow()
    expect(() => toolForName(42 as never)).toThrow()
  })
})

describe('W2 — registeredToolNames (spec §2/§3/§5)', () => {
  it('includes the read+dispatch tools under a default gate', () => {
    const names = registeredToolNames(new SecurityGate(), ALL)
    expect(names).toContain('provident.dispatch')
    expect(names).toContain('provident.get_rendered_html')
    expect(names).toContain('provident.list_targets')
    expect(names).toContain('provident.get_node_state')
    expect(names).toContain('provident.code.get')
    expect(names).toContain('provident.code.validate')
  })
  it('excludes the graph and code-mutation tools under a default gate', () => {
    const names = registeredToolNames(new SecurityGate(), ALL)
    for (const g of ['provident.load', 'provident.op', 'provident.export', 'provident.validate', 'provident.teardown']) {
      expect(names).not.toContain(g)
    }
    for (const c of ['provident.code.set', 'provident.code.create', 'provident.code.delete', 'provident.code.load']) {
      expect(names).not.toContain(c)
    }
  })
  it('enabling graph+code registers all 15', () => {
    const gate = new SecurityGate().apply({ groups: ['graph', 'code'] })
    const names = registeredToolNames(gate, ALL)
    expect(names).toHaveLength(15)
    for (const n of ALL) expect(names).toContain(n)
  })
  it('a tool allowed-but-unknown to the map never registers', () => {
    const gate = new SecurityGate()
    const names = registeredToolNames(gate, [...ALL, 'provident.unknown_tool'])
    expect(names).not.toContain('provident.unknown_tool')
  })
  it('F3/dedup — duplicates collapse to a single entry', () => {
    const names = registeredToolNames(new SecurityGate(), [...ALL, 'provident.dispatch', 'provident.dispatch'])
    expect(names.filter((n) => n === 'provident.dispatch')).toHaveLength(1)
  })
  it('a gate with an empty enabled set → []', () => {
    const gate = new SecurityGate().apply({ disable: ['read', 'dispatch'] })
    expect(registeredToolNames(gate, ALL)).toEqual([])
  })
})

describe('W3 — the HTTP 401 contract (checkRequest(headers).ok)', () => {
  it('no token ⇒ open: httpAuthorized(new SecurityGate({token:null,...}), {}) → true', () => {
    expect(httpAuthorized(new SecurityGate({ token: null, enabled: ['read', 'dispatch'] }), {})).toBe(true)
  })
  it('correct token: httpAuthorized(gate, {authorization:"Bearer s"}) → true', () => {
    expect(httpAuthorized(gateWithToken('s'), { authorization: 'Bearer s' })).toBe(true)
  })
  it('wrong token: httpAuthorized(gate, {authorization:"Bearer wrong"}) → false', () => {
    expect(httpAuthorized(gateWithToken('s'), { authorization: 'Bearer wrong' })).toBe(false)
  })
  it('gated token with no header → false', () => {
    expect(httpAuthorized(gateWithToken('s'), {})).toBe(false)
  })
  it('F-key: upper-cased key authenticates → httpAuthorized(gate, { Authorization: "Bearer s" }) → true', () => {
    expect(httpAuthorized(gateWithToken('s'), { Authorization: 'Bearer s' })).toBe(true)
  })
})

describe('G4 — ProvidentMcpServer gate plumbing (spec mcp-server-gate.md §2/§4)', () => {
  it('new ProvidentMcpServer({backend}).getGateConfig() → {token:null, enabled:["read","dispatch"]}', () => {
    const server = new ProvidentMcpServer({ backend })
    expect(server.getGateConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })
  it('getGateConfig() returns a COPY — mutating it does not change the server gate', () => {
    const server = new ProvidentMcpServer({ backend })
    const cfg = server.getGateConfig()
    cfg.enabled.push('code' as ToolGroup)
    cfg.token = 't'
    expect(server.getGateConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })
  it('a gate carrying graph → getGateConfig().enabled includes graph', () => {
    const server = new ProvidentMcpServer({
      backend,
      gate: new SecurityGate().apply({ groups: ['graph'] }),
    })
    expect(server.getGateConfig().enabled).toContain('graph')
  })
  it('applyGatePatch({groups:["code"]}) → enabled includes code AND server gate allows code.load', () => {
    const server = new ProvidentMcpServer({ backend })
    server.applyGatePatch({ groups: ['code'] })
    expect(server.getGateConfig().enabled).toContain('code')
    expect(server.gate.toolAllowed('provident.code.load')).toBe(true)
  })
  it('applyGatePatch({groups:["bogus"]}) → config unchanged (rejected, never throw)', () => {
    const server = new ProvidentMcpServer({ backend })
    expect(() => server.applyGatePatch({ groups: ['bogus' as ToolGroup] })).not.toThrow()
    expect(server.getGateConfig()).toEqual({ token: null, enabled: ['read', 'dispatch'] })
  })
  it('Gated registration — allowedToolNames() includes the read+dispatch 6 and excludes graph/code', () => {
    const server = new ProvidentMcpServer({ backend })
    const allowed = server.allowedToolNames()
    for (const n of ['provident.dispatch', 'provident.get_rendered_html', 'provident.list_targets', 'provident.get_node_state', 'provident.code.get', 'provident.code.validate']) {
      expect(allowed).toContain(n)
    }
    for (const n of ['provident.load', 'provident.op', 'provident.export', 'provident.validate', 'provident.teardown', 'provident.code.load']) {
      expect(allowed).not.toContain(n)
    }
  })
  it('a default-gate server does NOT allow provident.code.load; after applyGatePatch it → true', () => {
    const server = new ProvidentMcpServer({ backend })
    expect(server.gate.toolAllowed('provident.code.load')).toBe(false)
    server.applyGatePatch({ groups: ['code'] })
    expect(server.gate.toolAllowed('provident.code.load')).toBe(true)
  })
})

describe('G5 — M1: stdio re-gate (applyGatePatch on the LIVE server)', () => {
  it('ensureServerRegistered() then registeredEnabled("provident.dispatch") → true', () => {
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    expect(server.registeredEnabled('provident.dispatch')).toBe(true)
  })
  it('applyGatePatch({disable:["dispatch","read"]}) → registeredEnabled("provident.dispatch") → false', () => {
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    server.applyGatePatch({ disable: ['dispatch', 'read'] })
    expect(server.registeredEnabled('provident.dispatch')).toBe(false)
  })
  it('re-enabling applyGatePatch({groups:["dispatch","read"]}) → registeredEnabled("provident.dispatch") → true', () => {
    const server = new ProvidentMcpServer({ backend })
    server.ensureServerRegistered()
    server.applyGatePatch({ disable: ['dispatch', 'read'] })
    server.applyGatePatch({ groups: ['dispatch', 'read'] })
    expect(server.registeredEnabled('provident.dispatch')).toBe(true)
  })
})
