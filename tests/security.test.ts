// tests/security.test.ts — RED tests for the A1 MCP security gate & agent
// permissions unit (docs/specs/mcp-security.md). Imports the to-be-implemented
// pure module at src/main/security.js. These tests are RED because that module
// does not exist yet (module-not-found).
import { describe, it, expect } from 'vitest'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  authorized,
  applyPatch,
  type ToolGroup,
} from '../src/main/security.js'

const ALL: ReadonlySet<ToolGroup> = new Set(['read', 'dispatch', 'graph', 'code'])
const DEFAULT: ReadonlySet<ToolGroup> = new Set(['read', 'dispatch'])

describe('groupForTool — spec §2 table', () => {
  const table: Array<[string, ToolGroup]> = [
    ['provident.get_rendered_html', 'read'],
    ['provident.list_targets', 'read'],
    ['provident.get_node_state', 'read'],
    ['provident.code.get', 'read'],
    ['provident.code.validate', 'read'],
    ['provident.dispatch', 'dispatch'],
    ['provident.load', 'graph'],
    ['provident.op', 'graph'],
    ['provident.export', 'graph'],
    ['provident.validate', 'graph'],
    ['provident.teardown', 'graph'],
    ['provident.code.set', 'code'],
    ['provident.code.create', 'code'],
    ['provident.code.delete', 'code'],
    ['provident.code.load', 'code'],
  ]

  it.each(table)('maps %s → %s', (tool, group) => {
    expect(groupForTool(tool)).toBe(group)
  })

  it('returns null for an unknown tool name', () => {
    expect(groupForTool('provident.unknown')).toBeNull()
    expect(groupForTool('')).toBeNull()
    expect(groupForTool('nope')).toBeNull()
  })
})

describe('toolAllowed — spec §7', () => {
  it('allows a dispatch tool under the default set', () => {
    expect(toolAllowed('provident.dispatch', DEFAULT)).toBe(true)
  })

  it('disallows code.load under the default set', () => {
    expect(toolAllowed('provident.code.load', DEFAULT)).toBe(false)
  })

  it('never allows an unknown tool, even with all groups enabled', () => {
    expect(toolAllowed('provident.unknown', ALL)).toBe(false)
  })

  it('allows a read tool under the default set', () => {
    expect(toolAllowed('provident.get_rendered_html', DEFAULT)).toBe(true)
  })

  it('disallows a graph tool under the default set', () => {
    expect(toolAllowed('provident.load', DEFAULT)).toBe(false)
  })

  it('allows a code tool only when code is enabled', () => {
    expect(toolAllowed('provident.code.load', new Set(['read', 'dispatch', 'code']))).toBe(true)
    expect(toolAllowed('provident.code.set', new Set(['read', 'dispatch', 'code']))).toBe(true)
  })
})

describe('defaultSecurityConfig — spec §3', () => {
  it('enabled is exactly [read, dispatch] in order', () => {
    expect(defaultSecurityConfig().enabled).toEqual(['read', 'dispatch'])
  })

  it('token is null', () => {
    expect(defaultSecurityConfig().token).toBeNull()
  })
})

describe('authorized — spec §4 / §7', () => {
  it('no token → any request authorized', () => {
    expect(authorized({}, null)).toBe(true)
    expect(authorized({ authorization: 'Bearer whatever' }, null)).toBe(true)
  })

  it('non-null token, no headers → false', () => {
    expect(authorized({}, 'secret')).toBe(false)
  })

  it('Authorization: Bearer <token> → true', () => {
    expect(authorized({ authorization: 'Bearer secret' }, 'secret')).toBe(true)
  })

  it('Authorization: Bearer <wrong> → false', () => {
    expect(authorized({ authorization: 'Bearer wrong' }, 'secret')).toBe(false)
  })

  it('mcp-token header equal to token → true', () => {
    expect(authorized({ 'mcp-token': 'secret' }, 'secret')).toBe(true)
  })

  it('empty Authorization header with non-null token → false', () => {
    expect(authorized({ authorization: '' }, 'secret')).toBe(false)
  })

  it('scheme is case-insensitive', () => {
    expect(authorized({ authorization: 'bearer secret' }, 'secret')).toBe(true)
    expect(authorized({ authorization: 'BEARER secret' }, 'secret')).toBe(true)
  })
})

describe('applyPatch — spec §5 / §7', () => {
  it('enabling code on a default config → [read, dispatch, code]', () => {
    const cfg = defaultSecurityConfig()
    const next = applyPatch(cfg, { groups: ['code'] })
    expect(next.enabled).toEqual(['read', 'dispatch', 'code'])
  })

  it('a bogus group in the patch is rejected (config unchanged)', () => {
    const cfg = defaultSecurityConfig()
    const next = applyPatch(cfg, { groups: ['bogus'] })
    expect(next.enabled).toEqual(['read', 'dispatch'])
  })

  it('disabling a group is allowed (via disable)', () => {
    const cfg = defaultSecurityConfig()
    const next = applyPatch(cfg, { groups: ['read'], disable: ['dispatch'] })
    expect(next.enabled).toEqual(['read'])
  })

  it('groups is additive, disable removes', () => {
    const cfg = defaultSecurityConfig()
    const next = applyPatch(cfg, { groups: ['code'], disable: ['dispatch'] })
    expect(next.enabled).toEqual(['read', 'code'])
  })

  it('patch can set the token', () => {
    const cfg = defaultSecurityConfig()
    const next = applyPatch(cfg, { token: 'secret' })
    expect(next.token).toBe('secret')
  })

  it('returns a new config object (pure)', () => {
    const cfg = defaultSecurityConfig()
    const next = applyPatch(cfg, { groups: ['code'] })
    expect(next).not.toBe(cfg)
  })
})

describe('token alone does NOT enable code — spec §7', () => {
  it('code.load is false under the default group-set regardless of token', () => {
    expect(toolAllowed('provident.code.load', new Set(['read', 'dispatch']))).toBe(false)
  })
})
