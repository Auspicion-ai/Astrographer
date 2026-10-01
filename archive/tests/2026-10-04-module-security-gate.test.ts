// tests/module-security-gate.test.ts — RED tests for Unit U1 of the module.*
// extension system (docs/specs/module-import-proposal.md §5 + M-r2/M-r3/M-r6,
// and the third-pass invocation two-gate fix). Imports from ../src/main/security.js.
//
// These tests are RED because the `module` group surface does NOT exist yet:
//   - `ToolGroup` (line 3) lacks `'module'`
//   - `VALID_GROUPS` (line 95) lacks `module`
//   - `TOOL_GROUPS` has no `module.*` / `module:` prefix mapping
//   - `moduleToolAllowed` is not exported
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  SecurityGate,
  moduleToolAllowed,
  type ToolGroup,
} from '../src/main/security.js'

const defaultCfg = () => defaultSecurityConfig()
const enabledOf = (g: SecurityGate): ToolGroup[] => [...g.enabled]

describe('module group validity — OFF by default, VALID when granted (§5, M-r6)', () => {
  it('defaultSecurityConfig() does NOT include module (OFF by default)', () => {
    expect(defaultCfg().enabled).not.toContain('module')
  })

  it('new SecurityGate().apply({groups:["module"]}) enables module (module is a VALID group)', () => {
    const next = new SecurityGate().apply({ groups: ['module'] })
    expect(enabledOf(next)).toContain('module')
  })
})

describe('static module.* tools → module group (§5)', () => {
  it('groupForTool("module.install") === "module"', () => {
    expect(groupForTool('module.install')).toBe('module')
  })

  it('groupForTool("module.update") === "module"', () => {
    expect(groupForTool('module.update')).toBe('module')
  })

  it('groupForTool("module.list") === "module"', () => {
    expect(groupForTool('module.list')).toBe('module')
  })

  it('groupForTool("module.disable") === "module"', () => {
    expect(groupForTool('module.disable')).toBe('module')
  })

  it('groupForTool("module.enable") === "module"', () => {
    expect(groupForTool('module.enable')).toBe('module')
  })

  it('module.install is DENIED by default, ALLOWED after module granted', () => {
    expect(toolAllowed('module.install', defaultCfg().enabled)).toBe(false)
    expect(toolAllowed('module.install', ['module'])).toBe(true)
  })

  it('module.list is DENIED by default, ALLOWED after module granted (list is module-only)', () => {
    expect(toolAllowed('module.list', defaultCfg().enabled)).toBe(false)
    expect(toolAllowed('module.list', ['module'])).toBe(true)
  })
})

describe('dynamic module: prefix namespace (M-r3)', () => {
  it('groupForTool("module:capture.screenshot") === "module" (prefix, NOT exact-name)', () => {
    expect(groupForTool('module:capture.screenshot')).toBe('module')
  })

  it('groupForTool("module:embed.collect") === "module"', () => {
    expect(groupForTool('module:embed.collect')).toBe('module')
  })

  it('a NON-module tool is NOT caught by the module prefix matcher', () => {
    expect(groupForTool('provident.dispatch')).not.toBe('module')
    expect(groupForTool('foo:bar')).not.toBe('module')
  })
})

describe('moduleToolAllowed — the invocation two-gate (third-pass blocking fix)', () => {
  it('executable module + module granted, code OFF ⇒ FALSE', () => {
    expect(moduleToolAllowed('module:capture.screenshot', ['module'], { executable: true })).toBe(false)
  })

  it('executable module + module AND code ⇒ TRUE', () => {
    expect(moduleToolAllowed('module:capture.screenshot', ['module', 'code'], { executable: true })).toBe(true)
  })

  it('pure-capability module + module only ⇒ TRUE (no code needed)', () => {
    expect(moduleToolAllowed('module:embed.collect', ['module'], { executable: false })).toBe(true)
  })

  it('pure-capability module + module AND code ⇒ TRUE', () => {
    expect(moduleToolAllowed('module:embed.collect', ['module', 'code'], { executable: false })).toBe(true)
  })

  it('module group OFF (only read/dispatch) ⇒ FALSE even if executable', () => {
    expect(moduleToolAllowed('module:capture.screenshot', ['read', 'dispatch'], { executable: true })).toBe(false)
  })

  it('a NON-module tool is NOT gated by the module two-gate ⇒ FALSE', () => {
    expect(moduleToolAllowed('provident.dispatch', ['module'], { executable: true })).toBe(false)
  })

  it('adversarial: empty enabled array ⇒ FALSE (never granted)', () => {
    expect(moduleToolAllowed('module:x', [], { executable: true })).toBe(false)
  })

  it('adversarial: empty tool name is NOT module-prefixed ⇒ FALSE', () => {
    expect(moduleToolAllowed('', ['module', 'code'], { executable: true })).toBe(false)
  })

  it('adversarial: undefined executable defaults FAIL-CLOSED to executable (requires code)', () => {
    // A module tool that could carry code is treated as executable when the
    // flag is not provided — the SAFEST default (deny unless code is granted).
    expect(moduleToolAllowed('module:x', ['module'], { executable: undefined as never })).toBe(false)
    expect(moduleToolAllowed('module:x', ['module', 'code'], { executable: undefined as never })).toBe(true)
  })

  it('adversarial: malformed enabled (non-iterable object) FAILS CLOSED, never throws (F3)', () => {
    expect(moduleToolAllowed('module:x', {} as never)).toBe(false)
    expect(moduleToolAllowed('module:x', null as never)).toBe(false)
    expect(moduleToolAllowed('module:x', undefined as never)).toBe(false)
  })

  it('adversarial: `module:` with an empty rest is malformed and denied (F4)', () => {
    expect(groupForTool('module:')).toBeNull()
    expect(moduleToolAllowed('module:', ['module', 'code'], { executable: true })).toBe(false)
  })
})
