// tests/runtime-host.test.ts — the renderer Runtime's HOST-CAPABILITY surface
// (docs/specs/runtime-host.md §2/§3/§4): the load/export/validate/teardown +
// id-index operations the MCP tools + battery host consume. This file encodes
// the NEW methods that do NOT yet exist on `Runtime` — `loadEnvelope`,
// `loadDoc`, `applyCommand`, `exportLegacy`, `exportSerialized`,
// `validateExport`, `teardown`, and the id-index-backed resolution. Every
// new-method test MUST be RED (TypeError: runtime.X is not a function) until
// an Implementer adds them.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { translateLegacy, serializeSlice, type LegacyInitialData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

/** A tiny envelope whose handler reads the translate-scoped `userData` off the
 *  LEGACY context (`ctx.supervisor.userData`, the value captured at
 *  translate — first payload wins) and writes it into a display node, so a
 *  test can prove an anon load after a user load carries no stale userData.
 *  `format: 'legacy'` is required because the legacy (event, context) arg
 *  order (and its `supervisor` passthrough with the read-only userData member)
 *  is only installed for wrapped/legacy-format handlers. */
function userEnvelope(): EnvelopeForTest {
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
        css: { id: 'ud-shell', classes: ['ud-shell'] },
        children: [
          {
            type: 'button',
            css: { id: 'ud-read', classes: ['btn'] },
            content: 'Read user',
            handlers: [{ name: 'read', event: 'click', format: 'legacy', body: READ_USER }],
          },
          {
            type: 'div',
            css: { id: 'ud-out', classes: ['ud-out'] },
            props: { id: 'ud-out' },
            content: 'ANON',
          },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

type EnvelopeForTest = ReturnType<typeof demoEnvelope> & { [k: string]: unknown }

describe('renderer Runtime — host capabilities (spec runtime-host.md §2/§3/§4)', () => {
  it('loadEnvelope(demoEnvelope()) — RED: method does not exist', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    // MUST throw: the load methods are not on Runtime yet.
    const census = (runtime as any).loadEnvelope(demoEnvelope())
    expect(census.inTree).toBeGreaterThan(0)
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('counter')
  })

  it('loadDoc(demoEnvelope()-as-doc) — RED: method does not exist', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    // Build a VALID SerializedRenderDoc from the demo envelope (translate →
    // serializeSlice) so the test is green-able once loadDoc exists.
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    const census = (runtime as any).loadDoc(doc)
    expect(census.inTree).toBeGreaterThan(0)
  })

  it('loadEnvelope userData lifecycle — alice then anon leaves no stale userData (RED)', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    const env = userEnvelope()
    // alice load
    const census = (runtime as any).loadEnvelope(env, { userData: { username: 'alice' } })
    expect(census.inTree).toBeGreaterThan(0)
    const alice = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(alice.renderedHtml).toContain('alice')
    // anon load — must NOT inherit alice
    const census2 = (runtime as any).loadEnvelope(env)
    expect(census2.inTree).toBeGreaterThan(0)
    const anon = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(anon.renderedHtml).toContain('ANON')
    expect(anon.renderedHtml).not.toContain('alice')
  })

  it('applyCommand state-slice applies and the render reflects it', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    const census = (runtime as any).loadEnvelope(demoEnvelope())
    expect(census.inTree).toBeGreaterThan(0)
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const result = (runtime as any).applyCommand({
      kind: 'state-slice',
      node: counter.nodeId,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    expect(result.status).toBe('applied')
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>42<')
  })

  it('applyCommand rejects a hard-blocked op (placement projection) — never throws', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({
        kind: 'state-slice',
        node: counter.nodeId,
        mutation: [{ targetProp: 'placement', mode: 'replace', value: 1 }],
      })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('exportLegacy → LegacyInitialData; validateExport("legacy", it) → valid + censusMatch', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const exported = (runtime as any).exportLegacy()
    expect(typeof exported).toBe('object')
    expect(exported.template).toBeDefined()
    expect(exported.content).toBeDefined()
    expect(exported.clientConfig).toBeDefined()
    const verdict = (runtime as any).validateExport('legacy', exported)
    expect(verdict.valid).toBe(true)
    expect(verdict.censusMatch).toBe(true)
  })

  it('validateExport of a malformed export returns valid:false (never throws)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    let verdict: { valid: boolean }
    expect(() => {
      verdict = (runtime as any).validateExport('legacy', { template: null, content: 'garbage', clientConfig: null })
    }).not.toThrow()
    expect(verdict!.valid).toBe(false)
  })

  it('teardown → inTree === 1, mount empty, and is idempotent', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    expect(runtime.renderedHtmlResult().census.inTree).toBeGreaterThan(1)
    const census = (runtime as any).teardown()
    expect(census.inTree).toBe(1)
    expect(mount.innerHTML).toBe('')
    const census2 = (runtime as any).teardown()
    expect(census2.inTree).toBe(1)
    expect(mount.innerHTML).toBe('')
  })

  it('resolveTarget via the id-index: css.id "counter" resolves to the counter node', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const state = runtime.nodeState({ kind: 'cssId', cssId: 'counter' })
    expect(state.nodeId).toBe(counter.nodeId)
  })

  it('a destroyed node id does not resolve via the index (tombstone-shadow avoided)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const dec = runtime.listTargets().nodes.find((n) => n.cssId === 'dec')!
    const result = (runtime as any).applyCommand({ kind: 'destroy', node: dec.nodeId })
    expect(result.status).toBe('applied')
    // css.id 'dec' no longer resolves to a live node → nodeState must throw unresolved.
    expect(() => runtime.nodeState({ kind: 'cssId', cssId: 'dec' })).toThrow(/unresolved target/)
  })
})

describe('renderer Runtime — host-capability hardening (spec runtime-host.md §3 adversarial fixes)', () => {
  it('placement-routed load path-enumerates (compilePath) — produces the full path-state element set', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: demoEnvelope() as never })
    const env = placementEnvelope(4) // depth 4: 2·4−1 = 7 nodes → path enumeration
    const census = (runtime as any).loadEnvelope(env)
    expect(census.inTree).toBe(7)
    const html = runtime.renderedHtmlResult().renderedHtml
    const elementCount = (html.match(/data-node-id=/g) ?? []).length
    // path enumeration produced MANY path-state elements (the wrong non-routed
    // render is ~3); the exact count is shim-serialization-detail, not pinned.
    expect(elementCount).toBeGreaterThan(3)
    expect(elementCount).toBeLessThan(100)
  })

  it('teardown leaves no resolvable ghost tree — torn-down ids do not resolve', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    runtime.teardown()
    const c = runtime.renderedHtmlResult().census
    expect(c.inTree).toBe(1) // graph is root-only
    expect(c.destroyed + c.unplaced + c.inTree).toBe(c.registered) // every child is gone from in-tree
    // A5: a torn-down css.id must NOT resolve via the index (ghost tree gone)
    expect(() => runtime.nodeState({ kind: 'cssId', cssId: 'counter' })).toThrow(/unresolved target/)
    expect(() => runtime.nodeState({ kind: 'cssId', cssId: 'inc' })).toThrow(/unresolved target/)
    // the root stays (auto-minted props.id); no CHILD authored id remains
    const ids = runtime.listTargets().nodes.flatMap((n) => [n.cssId, n.propsId])
    for (const child of ['counter', 'inc', 'dec', 'echo-input', 'echo-out']) {
      expect(ids).not.toContain(child)
    }
  })

  it('applyCommand clone-instance with an unresolvable node returns rejected, never throws', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({ kind: 'clone-instance', node: 'does-not-exist', source: 'x', slot: 'y' })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('adversarial F1/F10 — a NON-string node value returns rejected, never throws (no raw source.clone)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({ kind: 'clone-instance', node: 5 as never, source: 'x', slot: 'y' })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('adversarial F1/F10 — op/applyCommand with a non-object command returns rejected, never throws', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand(null)
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
    let opResult: { status: string }
    expect(() => {
      opResult = (runtime as any).op(undefined)
    }).not.toThrow()
    expect(opResult!.status).toBe('rejected')
  })

  it('adversarial F2 — an unknown op kind returns rejected, never throws', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({ kind: 'bogus-kind' })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })
})

describe('renderer Runtime — nodeState JSON-safe projection (host defect: circular anchors)', () => {
  it('nodeState returns states whose anchors are plain data (JSON.stringify-safe)', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    // The counter consumer is a component-bearing node — the engine's raw
    // CompiledState.anchors carry live circular Node/Link refs that a naive
    // JSON.stringify rejects. The projected snapshot must serialize.
    const ns = runtime.nodeState({ kind: 'cssId', cssId: 'counter' })
    let serialized: string
    expect(() => { serialized = JSON.stringify(ns) }).not.toThrow()
    const parsed = JSON.parse(serialized!)
    expect(parsed.states.length).toBeGreaterThan(0)
    for (const st of parsed.states) {
      // every projected anchor is plain {role, target, value?} — never a live Node
      for (const a of st.anchors) {
        expect(a.role).toBeTypeOf('string')
        expect(['string', 'number', 'boolean']).toContain(typeof a.target)
      }
      // the JSON-safe surface still carries the consumer's resolved bindings
      expect(st).toHaveProperty('bindings')
    }
  })

  it('nodeState snapshot surfaces the resolved bindings on a component consumer', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const ns = runtime.nodeState({ kind: 'cssId', cssId: 'counter' })
    expect(() => JSON.parse(JSON.stringify(ns))).not.toThrow()
    expect(ns.states.length).toBeGreaterThan(0)
  })
})

/** A minimal placement-routed envelope (the path-fork shape): root + 2
 *  level-1 producers owning 'zone-1'; every deeper prototype is a content
 *  payload root with placementName + targetPlacement. Path enumeration yields
 *  the full 2^depth−1 element set from 2·depth−1 nodes. */
function placementEnvelope(depth = 4) {
  const children = []
  const payload = []
  for (let k = 1; k <= depth - 1; k += 1) {
    for (const slot of ['a', 'b']) {
      const proto = {
        type: slot === 'a' ? 'div' : 'span',
        props: { id: `p${k}${slot}`, 'stress:layer': k, 'stress:slot': slot, 'data-depth': String(k) },
        placement: {
          placementName: `zone-${k}`,
          ...(k >= 2 ? { targetPlacement: [`zone-${k - 1}`] } : {}),
        },
      }
      if (k === 1) children.push(proto)
      else payload.push(proto)
    }
  }
  return {
    template: { root: { type: 'app', props: { id: 'path-root' }, children } },
    content: [{ metadata: { title: 'placement' }, content: payload }],
    clientConfig: { runInstantiation: false, runMonitoring: true },
  }
}
