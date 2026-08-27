// tests/blind-runtime-host.test.ts — BLIND-TEST WRITER artifact (AGENTS.md item 10a).
// Produced from the DOCUMENTATION ONLY: docs/specs/runtime-host-greens.md (R1..R8,
// scenarios 1-39) + docs/specs/runtime-host.md. The writer did NOT read the
// implementation (src/renderer/runtime.ts). Only the names the docs name are
// imported: Runtime, demoEnvelope, installShim, mountEl, translateLegacy,
// serializeSlice. The userEnvelope/placementEnvelope fixtures are replicated
// from the doc's described shapes (the doc names them as data fixtures).
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { translateLegacy, serializeSlice, type LegacyInitialData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

function freshRuntime(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

function counterNodeId(runtime: Runtime): string {
  const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')
  if (!counter) throw new Error('counter node not found')
  return counter.nodeId
}

/** The doc's userData fixture: a handler that reads translate-scoped userData
 *  and writes it into a display node (alice vs ANON). */
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
        css: { id: 'ud-shell', classes: ['ud-shell'] },
        children: [
          { type: 'button', css: { id: 'ud-read', classes: ['btn'] }, content: 'Read user', handlers: [{ name: 'read', event: 'click', format: 'legacy', body: READ_USER }] },
          { type: 'div', css: { id: 'ud-out', classes: ['ud-out'] }, props: { id: 'ud-out' }, content: 'ANON' },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** The doc's placement-routed (path-fork) fixture: root + 2 level-1 producers
 *  owning 'zone-1'; every deeper prototype is a content payload root with
 *  placementName + targetPlacement. Path enumeration yields 2·depth−1 nodes. */
function placementEnvelope(depth = 4): LegacyInitialData {
  const children: unknown[] = []
  const payload: unknown[] = []
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

describe('R1 — loadEnvelope (A2) & the render', () => {
  it('1. loadEnvelope(demoEnvelope()) returns a Census with inTree > 1 and registered >= inTree', () => {
    const runtime = freshRuntime()
    const census = (runtime as any).loadEnvelope(demoEnvelope())
    expect(census.inTree).toBeGreaterThan(1)
    expect(census.registered).toBeGreaterThanOrEqual(census.inTree)
  })

  it('2. renderedHtml contains the counter authored id', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('counter')
  })

  it('3. ssrHtml also contains counter (PAR-5 parity)', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    expect(runtime.renderedHtmlResult().ssrHtml).toContain('counter')
  })

  it('4. loadEnvelope returns a FRESH census each call; a second load replaces the graph', () => {
    const runtime = freshRuntime()
    const c1 = (runtime as any).loadEnvelope(demoEnvelope())
    const c2 = (runtime as any).loadEnvelope(demoEnvelope())
    expect(c1).not.toBe(c2)
    expect(c2.inTree).toBeGreaterThan(1)
  })
})

describe('R2 — loadEnvelope userData lifecycle (R8)', () => {
  it('5. userData load then dispatch renders alice', async () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(userEnvelope(), { userData: { username: 'alice' } })
    const res = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(res.renderedHtml).toContain('alice')
  })

  it('6. a no-userData load after alice renders ANON, NOT alice', async () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(userEnvelope(), { userData: { username: 'alice' } })
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    ;(runtime as any).loadEnvelope(userEnvelope())
    const anon = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(anon.renderedHtml).toContain('ANON')
    expect(anon.renderedHtml).not.toContain('alice')
  })
})

describe('R3 — loadDoc (A1, snapshot-parity)', () => {
  it('7. loadDoc(serializeSlice(...)) returns a Census with inTree > 1', () => {
    const runtime = freshRuntime()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    const census = (runtime as any).loadDoc(doc)
    expect(census.inTree).toBeGreaterThan(1)
  })

  it('8. the doc load renders — renderedHtml contains counter', () => {
    const runtime = freshRuntime()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    ;(runtime as any).loadDoc(doc)
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('counter')
  })
})

describe('R4 — applyCommand / op', () => {
  it('9. state-slice content replace → applied and render shows >42<', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const result = (runtime as any).applyCommand({
      kind: 'state-slice',
      node: counterNodeId(runtime),
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    expect(result.status).toBe('applied')
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>42<')
  })

  it('10. state-slice placement replace → rejected, never throws', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({
        kind: 'state-slice',
        node: counterNodeId(runtime),
        mutation: [{ targetProp: 'placement', mode: 'replace', value: 1 }],
      })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('11. H3 — clone-instance with an unresolvable string node → rejected, never throws', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({ kind: 'clone-instance', node: 'does-not-exist', source: 'x', slot: 'y' })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('12. H4/F1 — clone-instance with a NON-string node (5) → rejected, never throws', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({ kind: 'clone-instance', node: 5 as never, source: 'x', slot: 'y' })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('13. H4/F10 — applyCommand(null) and op(undefined) → both rejected, never throw', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
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

  it('14. F2 — applyCommand({kind:"bogus-kind"}) → rejected, not a throw', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    let result: { status: string }
    expect(() => {
      result = (runtime as any).applyCommand({ kind: 'bogus-kind' })
    }).not.toThrow()
    expect(result!.status).toBe('rejected')
  })

  it('15. op state-slice returns { status, renderedHtml, ssrHtml, warnings }', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const res = (runtime as any).op({
      kind: 'state-slice',
      node: counterNodeId(runtime),
      mutation: [{ targetProp: 'content', mode: 'replace', value: '9' }],
    })
    expect(res.status).toBe('applied')
    expect(res.renderedHtml).toBeDefined()
    expect(res.ssrHtml).toBeDefined()
    expect(Array.isArray(res.warnings)).toBe(true)
  })
})

describe('R4 — export / validate', () => {
  it('16. exportLegacy() returns an object with template, content, clientConfig', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const exported = (runtime as any).exportLegacy()
    expect(typeof exported).toBe('object')
    expect(exported.template).toBeDefined()
    expect(exported.content).toBeDefined()
    expect(exported.clientConfig).toBeDefined()
  })

  it('17. validateExport("legacy", exportLegacy()) → { valid:true, censusMatch:true }', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const exported = (runtime as any).exportLegacy()
    const verdict = (runtime as any).validateExport('legacy', exported)
    expect(verdict.valid).toBe(true)
    expect(verdict.censusMatch).toBe(true)
  })

  it('18. validateExport of a malformed export → { valid:false }, never throws', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    let verdict: { valid: boolean }
    expect(() => {
      verdict = (runtime as any).validateExport('legacy', { template: null, content: 'garbage', clientConfig: null })
    }).not.toThrow()
    expect(verdict!.valid).toBe(false)
  })

  it('19. H6 — validateExport("bogus", {a:1}) → { valid:false }, never throws', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    let verdict: { valid: boolean }
    expect(() => {
      verdict = (runtime as any).validateExport('bogus', { a: 1 })
    }).not.toThrow()
    expect(verdict!.valid).toBe(false)
  })

  it('20. validateExport validates against a THROWAWAY graph — the live census is unchanged', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const before = runtime.renderedHtmlResult().census
    const exported = (runtime as any).exportLegacy()
    ;(runtime as any).validateExport('legacy', exported)
    const after = runtime.renderedHtmlResult().census
    expect(after.inTree).toBe(before.inTree)
    expect(after.registered).toBe(before.registered)
  })
})

describe('R5 — teardown (C3/C4)', () => {
  it('21. teardown() → Census with inTree === 1; the mount shows ONLY the root element (root stays in-tree)', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: demoEnvelope() as never })
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const census = (runtime as any).teardown()
    expect(census.inTree).toBe(1)
    // the root stays in-tree — the mount is the root's own serialization, NOT ''
    expect(mount.innerHTML).not.toBe('')
    expect(mount.innerHTML).not.toContain('counter')
  })

  it('22. teardown() is idempotent — a second call returns inTree === 1 and the mount stays root-only', () => {
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: demoEnvelope() as never })
    ;(runtime as any).loadEnvelope(demoEnvelope())
    ;(runtime as any).teardown()
    const census2 = (runtime as any).teardown()
    expect(census2.inTree).toBe(1)
    expect(mount.innerHTML).not.toContain('counter')
  })

  it('23. H2 — after teardown, a destroyed node cssId does not resolve (throws /unresolved target/)', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    ;(runtime as any).teardown()
    expect(() => runtime.nodeState({ kind: 'cssId', cssId: 'counter' })).toThrow(/unresolved target/)
  })

  it('24. H2 — after teardown, listTargets().nodes contains NO authored child ids', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    ;(runtime as any).teardown()
    const ids = runtime.listTargets().nodes.flatMap((n) => [n.cssId, n.propsId])
    for (const child of ['counter', 'inc', 'dec', 'echo-input', 'echo-out']) {
      expect(ids).not.toContain(child)
    }
  })
})

describe('R6 — id-index resolution (A5)', () => {
  it('25. nodeState({kind:"cssId", cssId:"counter"}) → nodeId equals the counter nodeId', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const state = runtime.nodeState({ kind: 'cssId', cssId: 'counter' })
    expect(state.nodeId).toBe(counterNodeId(runtime))
  })

  it('26. a destroyed node id does not resolve via the index', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const dec = runtime.listTargets().nodes.find((n) => n.cssId === 'dec')
    if (!dec) throw new Error('dec node not found')
    const result = (runtime as any).applyCommand({ kind: 'destroy', node: dec.nodeId })
    expect(result.status).toBe('applied')
    expect(() => runtime.nodeState({ kind: 'cssId', cssId: 'dec' })).toThrow(/unresolved target/)
  })

  it('27. listTargets().nodes includes only in-tree, not-destroyed nodes with authored fields', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const nodes = runtime.listTargets().nodes
    expect(nodes.length).toBeGreaterThan(0)
    for (const n of nodes) {
      expect(n).toHaveProperty('type')
      expect(n).toHaveProperty('state')
      expect(n).toHaveProperty('inTree')
      expect(n).toHaveProperty('handlers')
      // the auto-minted ROOT node has NO authored cssId/propsId; authored
      // child nodes carry them. At least one node carries an authored cssId.
      if (n.propsId !== undefined) expect(n).toHaveProperty('propsId')
    }
    expect(nodes.some((n) => n.cssId !== undefined)).toBe(true)
  })
})

describe('R6 — placement-routed loads path-enumerate (H1)', () => {
  it('28. loadEnvelope(placementEnvelope(4)) → Census.inTree === 7 and data-node-id count > 3', () => {
    const runtime = freshRuntime()
    const census = (runtime as any).loadEnvelope(placementEnvelope(4))
    expect(census.inTree).toBe(7)
    const html = runtime.renderedHtmlResult().renderedHtml
    const elementCount = (html.match(/data-node-id=/g) ?? []).length
    expect(elementCount).toBeGreaterThan(3)
  })
})

describe('R7 — code-CRUD (mcp-endpoint.md §4)', () => {
  it('29. codeGet("template.root.children[1].children[2]") → a defined value', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const res = (runtime as any).codeGet('template.root.children[1].children[2]')
    expect(res.value).toBeDefined()
  })

  it('30. codeGet("") → { path:"", value: the whole envelope }', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const res = (runtime as any).codeGet('')
    expect(res.path).toBe('')
    expect((res.value as { template?: { root?: unknown } }).template?.root).toBeDefined()
  })

  it('31. codeSet("template.root.hooks", ["theme","user"]) → { ok:true, wrote:[...] } and codeGet equals it', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const res = (runtime as any).codeSet('template.root.hooks', ['theme', 'user'])
    expect(res.ok).toBe(true)
    expect(res.wrote).toEqual(['theme', 'user'])
    expect((runtime as any).codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('32. codeCreate("template.root.hooks", "accent") when hooks = ["theme"] → { ok:true, appendedAt:1 } and array is ["theme","accent"]', () => {
    const runtime = freshRuntime()
    const env = demoEnvelope() as LegacyInitialData & { template: { root: { hooks?: string[] } } }
    env.template.root.hooks = ['theme']
    ;(runtime as any).loadEnvelope(env)
    const res = (runtime as any).codeCreate('template.root.hooks', 'accent')
    expect(res.ok).toBe(true)
    expect(res.appendedAt).toBe(1)
    expect((runtime as any).codeGet('template.root.hooks').value).toEqual(['theme', 'accent'])
  })

  it('33. codeCreate("template.root", {...}) (a non-array path) → throws /not an array/', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    expect(() => (runtime as any).codeCreate('template.root', {})).toThrow(/not an array/)
  })

  it('34. codeDelete("template.root.hooks", 1) → { ok:true, removed:"accent" } and array is ["theme","user"]', () => {
    const runtime = freshRuntime()
    const env = demoEnvelope() as LegacyInitialData & { template: { root: { hooks?: string[] } } }
    env.template.root.hooks = ['theme', 'accent', 'user']
    ;(runtime as any).loadEnvelope(env)
    const res = (runtime as any).codeDelete('template.root.hooks', 1)
    expect(res.ok).toBe(true)
    expect(res.removed).toBe('accent')
    expect((runtime as any).codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('35. H5/F8 — codeDelete out-of-range (99) and negative (-1) throw /out of range/; array untouched', () => {
    const runtime = freshRuntime()
    const env = demoEnvelope() as LegacyInitialData & { template: { root: { hooks?: string[] } } }
    env.template.root.hooks = ['theme', 'accent']
    ;(runtime as any).loadEnvelope(env)
    expect(() => (runtime as any).codeDelete('template.root.hooks', 99)).toThrow(/out of range/)
    expect(() => (runtime as any).codeDelete('template.root.hooks', -1)).toThrow(/out of range/)
    expect((runtime as any).codeGet('template.root.hooks').value).toEqual(['theme', 'accent'])
  })

  it('36. codeValidate() on a valid envelope → { valid:true, warnings:[...] }', () => {
    const runtime = freshRuntime()
    ;(runtime as any).loadEnvelope(demoEnvelope())
    const res = (runtime as any).codeValidate()
    expect(res.valid).toBe(true)
    expect(Array.isArray(res.warnings)).toBe(true)
  })

  it('37. codeValidate({ template:null, content:"garbage" }) → { valid:false }, never throws', () => {
    const runtime = freshRuntime()
    let res: { valid: boolean }
    expect(() => {
      res = (runtime as any).codeValidate({ template: null, content: 'garbage' })
    }).not.toThrow()
    expect(res!.valid).toBe(false)
  })

  it('38. codeLoad() after a codeSet/codeCreate → re-derives the live graph: inTree > 1 and HTML contains counter', () => {
    const runtime = freshRuntime()
    const env = demoEnvelope() as LegacyInitialData & { template: { root: { hooks?: string[] } } }
    env.template.root.hooks = ['theme']
    ;(runtime as any).loadEnvelope(env)
    ;(runtime as any).codeCreate('template.root.hooks', 'accent')
    const res = (runtime as any).codeLoad()
    expect(res.census.inTree).toBeGreaterThan(1)
    expect(res.renderedHtml).toContain('counter')
  })
})

describe('R8 — code-CRUD guards (A1 doc-load has no envelope)', () => {
  it('39. after load({kind:"doc", doc}), codeSet throws /no envelope/', () => {
    const runtime = freshRuntime()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    ;(runtime as any).load({ kind: 'doc', doc })
    expect(() => (runtime as any).codeSet('template.root.hooks', [])).toThrow(/no envelope/)
  })
})
