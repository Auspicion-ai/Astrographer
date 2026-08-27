// tests/runtime-battery.test.ts — Unit C: the Runtime's battery + code-CRUD
// surface (docs/specs/e2e-test-battery.md §3 + docs/specs/mcp-endpoint.md §4).
// The 5 graph tools + 6 code tools map to Runtime methods that consume the
// existing host capabilities (Unit A) + the envelope CRUD + warnings (R10).
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { pathForkCycleLegacyData } from '../src/shared/path-fork-cycle.js'
import { translateLegacy, serializeSlice, type LegacyInitialData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

function r(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

function rootOnlyEnvelope(): LegacyInitialData {
  return {
    template: { root: { type: 'app', props: { id: 'preempt-root' } } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

describe('Runtime battery surface (spec e2e-test-battery.md §3)', () => {
  it('load({kind:envelope}) returns census + both render views + warnings (R10)', () => {
    const runtime = r()
    const res = runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(res.census.inTree).toBeGreaterThan(1)
    expect(res.renderedHtml).toContain('counter')
    expect(res.ssrHtml).toContain('counter')
    expect(Array.isArray(res.warnings)).toBe(true)
  })

  it('load({kind:doc}) A1 — a serialized doc loads (snapshot-parity)', () => {
    const runtime = r()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    const res = runtime.load({ kind: 'doc', doc })
    expect(res.census.inTree).toBeGreaterThan(1)
  })

  it('load({kind:commands}) applies each command singly', () => {
    const runtime = r()
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const res = runtime.load({
      kind: 'commands',
      commands: [{ kind: 'state-slice', node: counter.nodeId, mutation: [{ targetProp: 'content', mode: 'replace', value: '7' }] }],
    })
    expect(res.renderedHtml).toContain('>7<')
  })

  it('load with an unknown kind throws', () => {
    expect(() => r().load({ kind: 'bogus' as never })).toThrow(/unknown load kind/)
  })

  it('op applies a single op and returns status + views + warnings', () => {
    const runtime = r()
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const res = runtime.op({ kind: 'state-slice', node: counter.nodeId, mutation: [{ targetProp: 'content', mode: 'replace', value: '9' }] })
    expect(res.status).toBe('applied')
    expect(res.renderedHtml).toContain('>9<')
    expect(res.warnings).toBeDefined()
  })

  it('export("legacy") returns the export + census; validate round-trips', () => {
    const runtime = r()
    const exp = runtime.export('legacy')
    expect(exp.export).toBeDefined()
    expect(exp.census.inTree).toBeGreaterThan(1)
    const verdict = runtime.validate('legacy', exp.export)
    expect(verdict.valid).toBe(true)
    expect(verdict.censusMatch).toBe(true)
  })

  it('teardownResult returns a root-only census (inTree === 1) + empty mount', async () => {
    const runtime = r()
    const res = await runtime.teardownResult()
    expect(res.census.inTree).toBe(1)
    // C3 — the mount shows one empty root element (root stays in-tree)
    expect(res.renderedHtml).not.toContain('counter')
    expect(res.renderedHtml).toContain('demo-shell')
  })

  it('R6 settle-gate — teardownResult drains pending work to quiescence (hasPendingWork === false after teardown)', async () => {
    const runtime = r()
    // generate pending pass-2 work via a dispatch, then teardown
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    await runtime.teardownResult()
    expect(runtime.hasPendingWork()).toBe(false)
    expect(runtime.renderedHtmlResult().census.inTree).toBe(1)
  })

  it('load of the cycle-variant envelope at d12 yields inTree === 23', () => {
    const runtime = r()
    const res = runtime.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(12) as unknown as LegacyInitialData })
    expect(res.census.inTree).toBe(23)
    expect(res.census.registered).toBe(23)
  })

  it('SSR fragment survives a graph reload (R13 — stale SSR adapter regression)', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: rootOnlyEnvelope() as never })
    runtime.bootstrap()
    // boot root-only (SSR = the root element)
    expect(runtime.renderedHtmlResult().ssrHtml).toContain('preempt-root')
    // load the demo → SSR must NOT collapse to empty (the stale-adapter bug)
    const res = runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(res.ssrHtml.length).toBeGreaterThan(0)
    expect(res.ssrHtml).toContain('counter')
    // and a SECOND load still renders SSR (the adapter is recreated each load)
    const res2 = runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(res2.ssrHtml.length).toBeGreaterThan(0)
    expect(res2.ssrHtml).toContain('counter')
  })
})

describe('Runtime code-CRUD (mcp-endpoint.md §4)', () => {
  it('codeGet reads a deep envelope path', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = runtime.codeGet('template.root.children[1].children[2]')
    expect(res.value).toBeDefined()
  })

  it('codeGet("") returns the whole envelope', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = runtime.codeGet('')
    expect((res.value as { template?: { root?: unknown } }).template?.root).toBeDefined()
  })

  it('codeSet writes an envelope value', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = runtime.codeSet('template.root.hooks', ['theme', 'user'])
    expect(res.ok).toBe(true)
    expect(res.wrote).toEqual(['theme', 'user'])
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('codeCreate appends to an array', () => {
    const runtime = r()
    const env = demoEnvelope() as LegacyInitialData
    env.template.root.hooks = ['theme']
    runtime.load({ kind: 'envelope', envelope: env })
    const res = runtime.codeCreate('template.root.hooks', 'accent')
    expect(res.ok).toBe(true)
    expect(res.appendedAt).toBe(1)
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'accent'])
  })

  it('codeCreate on a non-array path throws', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(() => runtime.codeCreate('template.root', {})).toThrow(/not an array/)
  })

  it('codeDelete removes an array index', () => {
    const runtime = r()
    const env = demoEnvelope() as LegacyEnvelope
    env.template.root.hooks = ['theme', 'accent', 'user']
    runtime.load({ kind: 'envelope', envelope: env })
    const res = runtime.codeDelete('template.root.hooks', 1)
    expect(res.ok).toBe(true)
    expect(res.removed).toBe('accent')
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('codeValidate validates the current envelope (no handler-body invalid)', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = runtime.codeValidate()
    expect(res.valid).toBe(true)
    expect(Array.isArray(res.warnings)).toBe(true)
  })

  it('codeValidate of a malformed envelope returns valid:false (never throws)', () => {
    const runtime = r()
    const res = runtime.codeValidate({ template: null, content: 'garbage' })
    expect(res.valid).toBe(false)
  })

  it('codeLoad applies an edited envelope to the live graph', () => {
    const runtime = r()
    const env = demoEnvelope() as LegacyEnvelope
    env.template.root.hooks = ['theme']
    runtime.load({ kind: 'envelope', envelope: env })
    runtime.codeCreate('template.root.hooks', 'accent')
    const res = runtime.codeLoad()
    expect(res.census.inTree).toBeGreaterThan(1)
    expect(res.renderedHtml).toContain('counter')
  })

  it('A3-b — code.load teardown pin: codeLoad drains pending work (hasPendingWork === false) + clears prior userData', async () => {
    const runtime = r()
    // a userData-bearing load (alice), dispatch to confirm userData is seen
    const userEnv = userEnvelope()
    runtime.loadEnvelope(userEnv, { userData: { username: 'alice' } })
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('alice')
    // generate pending pass-2 work via a dispatch on the demo graph
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    // code.load re-derives the graph — the teardown it performs MUST drain
    runtime.codeSet('template.root.hooks', ['theme'])
    runtime.codeCreate('template.root.hooks', 'accent')
    runtime.codeLoad()
    expect(runtime.hasPendingWork()).toBe(false)
    // userData no-leak: codeLoad of an envelope with NO userData after an alice
    // load leaves no stale userData (the fresh-supervisor rebuild clears it).
    const anon = userEnvelope()
    runtime.loadEnvelope(anon)
    runtime.codeSet('template.root.hooks', ['x'])
    runtime.codeLoad()
    const after = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(after.renderedHtml).toContain('ANON')
    expect(after.renderedHtml).not.toContain('alice')
  })

  it('code.set errors when no legacy envelope is loaded (A1 doc load)', () => {
    const runtime = r()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    runtime.load({ kind: 'doc', doc })
    expect(() => runtime.codeSet('template.root.hooks', [])).toThrow(/no envelope/)
  })

  it('adversarial F8 — codeDelete with an out-of-range index throws (never a silent ok:true/undefined)', () => {
    const runtime = r()
    const env = demoEnvelope() as LegacyEnvelope
    env.template.root.hooks = ['theme', 'accent']
    runtime.load({ kind: 'envelope', envelope: env })
    expect(() => runtime.codeDelete('template.root.hooks', 99)).toThrow(/out of range/)
    // a negative index is equally invalid (splice from the end would corrupt)
    expect(() => runtime.codeDelete('template.root.hooks', -1)).toThrow(/out of range/)
    // the array is untouched by a rejected delete
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'accent'])
  })
})

describe('Runtime battery — adversarial hardening (H7..H13, 2026-08-23)', () => {
  it('H7 — codeDelete on an out-of-range or malformed PATH index is rejected (never a silent ok:true/undefined)', () => {
    const runtime = r()
    const env = demoEnvelope() as LegacyEnvelope
    env.template.root.hooks = ['theme', 'accent', 'user']
    runtime.load({ kind: 'envelope', envelope: env })
    expect(() => runtime.codeDelete('template.root.hooks[99]')).toThrow(/out of range/)
    // a negative path index is rejected (malformed path grammar — rejected, not silent)
    expect(() => runtime.codeDelete('template.root.hooks[-1]')).toThrow(/malformed path/)
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['theme', 'accent', 'user'])
  })

  it('H8 — codeDelete never double-splices when the path selected an array element + index is also given', () => {
    const runtime = r()
    const env = demoEnvelope() as LegacyEnvelope
    // hooks[1] is itself an array; deleting hooks[1] with an index arg must NOT
    // splice inside it (the path already selected the element)
    env.template.root.hooks = ['x', ['inner0', 'inner1'], 'z']
    runtime.load({ kind: 'envelope', envelope: env })
    // path selected element [1] (an array) → delete that element, ignore the index arg
    const res = runtime.codeDelete('template.root.hooks[1]', 0)
    expect(res.removed).toEqual(['inner0', 'inner1'])
    expect(runtime.codeGet('template.root.hooks').value).toEqual(['x', 'z'])
  })

  it('H9 — a malformed path (unbalanced bracket) is rejected, never writes a garbage key', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(() => runtime.codeSet('template.root.children]', 'GARBAGE')).toThrow(/malformed path/)
    expect(() => runtime.codeSet('template.root.children[0', 'GARBAGE')).toThrow(/malformed path/)
    // no garbage key was written
    const root = runtime.codeGet('template.root').value as Record<string, unknown>
    expect(root.children).toBeDefined()
    expect('children]' in root).toBe(false)
    expect('children[0' in root).toBe(false)
  })

  it('H10 — validate with a bogus kind returns valid:false (never a silent serialized parse)', () => {
    const runtime = r()
    const verdict = runtime.validate('bogus' as never, {})
    expect(verdict.valid).toBe(false)
    expect(verdict.censusMatch).toBe(false)
  })

  it('H11 — op with a plain-object node/source is rejected (not a .clone() TypeError)', () => {
    const runtime = r()
    const res = runtime.op({ kind: 'clone-instance', source: { foo: 1 }, slot: 'y' })
    expect(res.status).toBe('rejected')
    const res2 = runtime.op({ kind: 'clone-instance', node: { foo: 1 }, source: 'x', slot: 'y' })
    expect(res2.status).toBe('rejected')
  })

  it('H12 — op state-slice without mutation is rejected (no unhandled TypeError)', () => {
    const runtime = r()
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const result = runtime.op({ kind: 'state-slice', node: counter.nodeId })
    expect(result.status).toBe('rejected')
  })

  it('H13 — codeLoad rejects a structurally-invalid edited envelope (children set to a scalar)', () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    runtime.codeSet('template.root.children', 'GARBAGE')
    expect(() => runtime.codeLoad()).toThrow(/invalid/)
    // the live graph is NOT silently torn down to root-only
    expect(runtime.renderedHtmlResult().census.inTree).toBeGreaterThan(1)
  })

  it('H4/F10 — a non-array commands value is rejected (never a silent per-key apply)', () => {
    const runtime = r()
    // a plain object is not iterable → throws (never a silent per-key apply)
    expect(() => runtime.load({ kind: 'commands', commands: { a: 1 } as never })).toThrow(/not iterable|is not iterable/)
    // a primitive is likewise rejected
    expect(() => runtime.load({ kind: 'commands', commands: 5 as never })).toThrow()
  })
})

type LegacyEnvelope = LegacyInitialData & { template: { root: { hooks?: string[] } } }

/** A tiny envelope whose handler reads translate-scoped `userData` and writes
 *  it into a display node (mirrors runtime-host.test.ts's userEnvelope). */
function userEnvelope(): LegacyInitialData {
  const READ_USER = `function (event, context) {
    const ud = context.supervisor && context.supervisor.userData;
    const all = context.tree.allNodes();
    const node = all.find(function (n) { return n && n.props && n.props.id === 'ud-out'; });
    if (!node) return;
    const v = (ud && ud.username) ? String(ud.username) : 'ANON';
    context.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: v }]);
  }`
  return {
    template: {
      root: {
        type: 'div',
        css: { id: 'ud-shell' },
        children: [
          { type: 'button', css: { id: 'ud-read' }, props: { id: 'ud-read' }, content: 'Read user', handlers: [{ name: 'read', event: 'click', format: 'legacy', body: READ_USER }] },
          { type: 'div', css: { id: 'ud-out' }, props: { id: 'ud-out' }, content: 'ANON' },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
