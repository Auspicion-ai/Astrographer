// tests/blind-loadbatch.test.ts — BLIND-TEST WRITER artifact (AGENTS.md item 10a).
//
// Produced from DOCUMENTATION ONLY:
//   docs/specs/mcp-endpoint.md §4.1 (code.* CRUD + code.loadBatch row)
//   docs/specs/loadbatch-review.md (B1-B8 reshapes)
//   docs/specs/loadbatch-proposal.md (the proposal)
//   docs/specs/mcp-endpoint.md §6.2 (tool groups)
//
// No implementation file was read.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { translateLegacy, serializeSlice, type LegacyInitialData } from 'provident-ssr'
import { groupForTool, toolAllowed, SecurityGate } from '../src/main/security.js'

beforeAll(() => {
  installShim()
})

function r(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

function withHooks(): LegacyInitialData {
  const env = demoEnvelope() as LegacyInitialData
  ;(env.template.root as { hooks?: string[] }).hooks = ['theme']
  return env
}

// ─── S1 ───────────────────────────────────────────────────────────────────────
// Docs (B5): code.loadBatch returns the re-derive LoadResult (census,
// renderedHtml, ssrHtml, warnings) + a per-op status array.
// PREDICT: a batch of N valid ops applies all N and returns a per-op status
// for each, plus the re-derive result.
describe('S1 — batch applies N ops and re-derives once', () => {
  it('applies 3 valid ops and returns per-op status + LoadResult', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    const res = runtime.codeLoadBatch([
      { op: 'create', path: 'template.root.hooks', entry: 'accent' },
      { op: 'create', path: 'template.root.hooks', entry: 'user' },
      { op: 'create', path: 'template.root.hooks', entry: 'debug' },
    ])
    // per-op status array: one entry per op
    expect(res.ops).toHaveLength(3)
    expect(res.ops.every((o: { status: string }) => o.status === 'applied')).toBe(true)
    // re-derive result fields (LoadResult)
    expect(res.census.inTree).toBeGreaterThan(0)
    expect(typeof res.renderedHtml).toBe('string')
    expect(typeof res.ssrHtml).toBe('string')
    expect(Array.isArray(res.warnings)).toBe(true)
    // verify the mutations actually landed
    expect(runtime.codeGet('template.root.hooks').value).toEqual([
      'theme',
      'accent',
      'user',
      'debug',
    ])
  })
})

// ─── S2 ───────────────────────────────────────────────────────────────────────
// Docs (B2): a batch applies to a clone; on ANY op failure the live envelope
// is UNTOUCHED (no half-applied state).
// PREDICT: a batch where op 1 is valid and op 2 is invalid throws, and op 1's
// change is NOT present afterward.
describe('S2 — all-or-nothing: failing op leaves envelope untouched', () => {
  it('op1 valid, op2 invalid → throws and op1 is NOT applied', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    // op1: valid — create on an array path
    // op2: invalid — create on a non-array path (template.root is an object)
    expect(() =>
      runtime.codeLoadBatch([
        { op: 'create', path: 'template.root.hooks', entry: 'accent' },
        { op: 'create', path: 'template.root', entry: {} },
      ]),
    ).toThrow()
    // envelope must be untouched — op1's change must NOT be present
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme'])
  })
})

// ─── S3 ───────────────────────────────────────────────────────────────────────
// Docs (B3): a later op can reference a path created by an earlier op in the
// same batch (ordering with dependencies).
// PREDICT: create an array entry, then set that entry's value in the same
// batch works.
describe('S3 — ordered with dependencies', () => {
  it('create then set referencing the created path works', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    const res = runtime.codeLoadBatch([
      { op: 'create', path: 'template.root.hooks', entry: 'accent' },
      { op: 'set', path: 'template.root.hooks[1]', value: 'accent-v2' },
    ])
    expect(res.ops).toHaveLength(2)
    expect(runtime.codeGet('template.root.hooks').value).toEqual([
      'theme',
      'accent-v2',
    ])
  })
})

// ─── S4 ───────────────────────────────────────────────────────────────────────
// Docs (B4): a malformed op (unknown kind / bad shape) is rejected.
// PREDICT: a batch with an unknown op kind throws, and the envelope is
// untouched.
describe('S4 — malformed op is rejected', () => {
  it('unknown op kind throws and envelope is untouched', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    expect(() =>
      runtime.codeLoadBatch([{ op: 'bogus', path: 'x' } as never]),
    ).toThrow()
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme'])
  })
})

// ─── S5 ───────────────────────────────────────────────────────────────────────
// Docs (B7): code.loadBatch throws "no envelope loaded" when there is no
// legacy envelope.
// PREDICT: after a doc load (which nullifies the envelope), a batch throws
// the no-envelope error.
describe('S5 — no-envelope case', () => {
  it('throws "no envelope loaded" after a doc load', () => {
    const runtime = r()
    // a doc load sets this.envelope = null per B7 / A1
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, {
      adapter: 'dom',
      persistence: false,
    })
    runtime.load({ kind: 'doc', doc })
    expect(() =>
      runtime.codeLoadBatch([{ op: 'set', path: 'x', value: 1 }]),
    ).toThrow(/no envelope/)
  })
})

// ─── S6 ───────────────────────────────────────────────────────────────────────
// Docs (B6): code.loadBatch is a code-group tool (OFF by default).
// PREDICT: under the default gate (read+dispatch), the tool is NOT allowed;
// after enabling code, it is.
describe('S6 — code-group gating', () => {
  it('groupForTool maps code.loadBatch to code', () => {
    expect(groupForTool('provident.code.loadBatch')).toBe('code')
  })

  it('toolAllowed returns false under default read+dispatch', () => {
    expect(toolAllowed('provident.code.loadBatch', ['read', 'dispatch'])).toBe(
      false,
    )
  })

  it('toolAllowed returns true after enabling code', () => {
    expect(
      toolAllowed('provident.code.loadBatch', ['read', 'dispatch', 'code']),
    ).toBe(true)
  })

  it('SecurityGate default excludes code, so the tool is not allowed', () => {
    const gate = new SecurityGate()
    expect(gate.enabled.has('code')).toBe(false)
  })
})
