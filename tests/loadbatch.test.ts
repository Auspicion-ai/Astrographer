// tests/loadbatch.test.ts — RED tests for `code.loadBatch` (docs/specs/
// loadbatch-review.md B1-B8). The Runtime must:
//   B2  all-or-nothing: a batch applies to a clone; on any op failure the live
//       envelope is UNTOUCHED (no half-applied state).
//   B3  ordering with dependencies: a later op can reference a path created by
//       an earlier op in the same batch.
//   B4  a pinned op schema (set/create/delete); a malformed op is rejected.
//   B5  return = LoadResult + per-op status.
//   B7  the no-envelope case throws "no envelope loaded".
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { translateLegacy, serializeSlice, type LegacyInitialData } from 'provident-ssr'

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

describe('code.loadBatch — B2 all-or-nothing atomicity', () => {
  it('a valid batch applies all ops + re-derives once', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    const res = runtime.codeLoadBatch([
      { op: 'create', path: 'template.root.hooks', entry: 'accent' },
      { op: 'create', path: 'template.root.hooks', entry: 'user' },
    ])
    expect(res.ops).toHaveLength(2)
    expect(res.ops.every((o) => o.status === 'applied')).toBe(true)
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'accent', 'user'])
    expect(res.census.inTree).toBeGreaterThan(0)
  })

  it('B2 — a batch with a failing op leaves the envelope UNTOUCHED (no half-applied state)', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    // op 1 is valid, op 2 is invalid (create on a non-array path)
    expect(() =>
      runtime.codeLoadBatch([
        { op: 'create', path: 'template.root.hooks', entry: 'accent' },
        { op: 'create', path: 'template.root', entry: {} },
      ]),
    ).toThrow()
    // the FIRST op must NOT have been applied — the envelope is untouched
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme'])
  })
})

describe('code.loadBatch — B3 ordering with dependencies', () => {
  it('a later op can reference a path created by an earlier op in the same batch', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    // create a handler array, then set its first element's body
    const res = runtime.codeLoadBatch([
      { op: 'create', path: 'template.root.hooks', entry: 'accent' },
      { op: 'set', path: 'template.root.hooks[1]', value: 'accent-v2' },
    ])
    expect(res.ops).toHaveLength(2)
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'accent-v2'])
  })
})

describe('code.loadBatch — B4 schema + B5 return shape', () => {
  it('B4 — a malformed op (unknown op kind) is rejected', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    expect(() => runtime.codeLoadBatch([{ op: 'bogus', path: 'x' } as never])).toThrow(/unknown op/)
  })

  it('B5 — the return carries the LoadResult fields + per-op status', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: withHooks() })
    const res = runtime.codeLoadBatch([{ op: 'create', path: 'template.root.hooks', entry: 'accent' }])
    expect(res).toHaveProperty('census')
    expect(res).toHaveProperty('renderedHtml')
    expect(res).toHaveProperty('ssrHtml')
    expect(res).toHaveProperty('warnings')
    expect(res.ops).toEqual([{ op: 'create', path: 'template.root.hooks', status: 'applied' }])
  })
})

describe('code.loadBatch — B7 no-envelope case', () => {
  it('throws "no envelope loaded" when there is no legacy envelope (A1 doc load)', () => {
    const runtime = r()
    // a doc load sets this.envelope = null
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    runtime.load({ kind: 'doc', doc })
    expect(() => runtime.codeLoadBatch([{ op: 'set', path: 'x', value: 1 }])).toThrow(/no envelope/)
  })
})
