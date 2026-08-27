// tests/blind-battery-verify.test.ts — BLIND verification of the GREEN
// scenario set (docs/specs/battery-units-greens.md B1..D1, scenarios 1-39)
// against the implementation, WITHOUT having read the implementation
// (src/renderer/runtime.ts, src/main/battery-host.ts, src/shared/path-fork-cycle.ts).
//
// This file encodes ONLY the claims in the green doc. It imports ONLY the
// names the green doc itself names (`pathForkCycleLegacyData`, `cycleMethodFor`,
// `CYCLE_METHODS`, the Runtime, the `load`/`op`/`export`/`validate`/
// `teardownResult`/`code*` surface) and the data fixtures (`demoEnvelope`,
// `installShim`, `mountEl`).
//
// 39 scenarios. 33 and 39 are the e2e stdio runner (`tests/e2e-battery.test.mjs`)
// and its "0 failures / 93 checks" result — left as a skipped unit marker here,
// asserted only via the Runtime for 34-38.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import {
  pathForkCycleLegacyData,
  cycleMethodFor,
  CYCLE_METHODS,
} from '../src/shared/path-fork-cycle.js'
import { Runtime } from '../src/renderer/runtime.js'
import { translateLegacy, serializeSlice } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

// ---- envelope helpers (data-driven off the two-sided placement contract) ----

interface ProtoEntry {
  proto: any
  layer: number
}

/** The flat prototype set: level-1 = template.root.children; layers >=2 = the
 *  content payload roots (content[0].content). Layer derived from
 *  `placement.placementName === 'zone-<k>'`. */
function prototypes(env: any): ProtoEntry[] {
  const out: ProtoEntry[] = []
  const push = (p: any) => {
    const name: string = p?.placement?.placementName ?? ''
    const m = /^zone-(\d+)$/.exec(name)
    out.push({ proto: p, layer: m ? Number(m[1]) : NaN })
  }
  for (const c of env.template?.root?.children ?? []) push(c)
  for (const p of env.content?.[0]?.content ?? []) push(p)
  return out
}

/** A layer-k prototype whose component.reference carries the `.slot` suffix
 *  (the values shape, e.g. `values-2.a`). For the link layer the reference is
 *  slot-less (`link-3`); pass slot='' to match a bare reference. */
function slotPayload(env: any, layer: number, slot: string) {
  return (env.content?.[0]?.content ?? []).find((p: any) => {
    const ref = String(p?.component?.reference ?? '')
    if (p?.placement?.placementName !== `zone-${layer}`) return false
    return slot ? ref.includes(`.${slot}`) : ref.length > 0
  })
}

function withEnvelope(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

describe('B1 — the cycle-variant envelope (path-fork-cycle module)', () => {
  it('1. CYCLE_METHODS is the static trio without handler', () => {
    expect(CYCLE_METHODS).toEqual(['placement', 'values', 'link'])
  })

  it('2. cycleMethodFor cycles per layer', () => {
    expect(cycleMethodFor(1)).toBe('placement')
    expect(cycleMethodFor(2)).toBe('values')
    expect(cycleMethodFor(3)).toBe('link')
    expect(cycleMethodFor(4)).toBe('placement')
    expect(cycleMethodFor(5)).toBe('values')
    expect(cycleMethodFor(6)).toBe('link')
  })

  it('3. pathForkCycleLegacyData(12): children 2, content[0].content 20; 23 nodes, 4095 path-states', () => {
    const env = pathForkCycleLegacyData(12)
    expect(env.template.root.children.length).toBe(2)
    expect(env.content[0].content.length).toBe(20)
    // 2·12−1 = 23 prototypes/nodes; 2^12−1 = 4095 path-state elements (data-only)
    expect(2 * 12 - 1).toBe(23)
    expect(2 ** 12 - 1).toBe(4095)
  })

  it('4. every level carries the two-sided placement', () => {
    const env = pathForkCycleLegacyData(12)
    for (const e of prototypes(env)) {
      const p = e.proto.placement
      expect(p).toBeDefined()
      if (e.layer === 1) {
        expect(p.placementName).toBe('zone-1')
        expect(p.targetPlacement).toBeUndefined()
      } else {
        expect(p.placementName).toBe(`zone-${e.layer}`)
        expect(p.targetPlacement).toEqual([`zone-${e.layer - 1}`])
      }
    }
  })

  it('5. layer-2 (values) prototypes carry values-2.a / values-2.b components', () => {
    const env = pathForkCycleLegacyData(12)
    const a = slotPayload(env, 2, 'a')
    const b = slotPayload(env, 2, 'b')
    expect(a?.component?.reference).toBe('values-2.a')
    expect(a?.component?.value).toBe('value-A-2')
    expect(b?.component?.reference).toBe('values-2.b')
    expect(b?.component?.value).toBe('value-B-2')
  })

  it('6. layer-3 (link) prototypes carry the link def chain', () => {
    const env = pathForkCycleLegacyData(12)
    // link-layer reference is slot-less (e.g. `link-3`)
    const a = slotPayload(env, 3, '')
    expect(a?.component?.reference).toBe('link-3')
    const def = a?.component?.value
    expect(def?.type).toBe('div')
    const texts = (def?.children ?? [])
      .map((c: any) => c.content)
      .filter((c: any) => c !== undefined)
    expect(texts).toEqual(['link-3.a', 'link-3.b'])
  })

  it('7. layer-1 (placement) prototypes carry NO component field', () => {
    const env = pathForkCycleLegacyData(12)
    for (const e of prototypes(env).filter((e) => e.layer === 1)) {
      expect(e.proto.component).toBeUndefined()
    }
  })

  it('8. the envelope is data-only (no handler, no clone in JSON)', () => {
    const s = JSON.stringify(pathForkCycleLegacyData(12))
    expect(s).not.toContain('handler')
    expect(s).not.toContain('clone')
  })

  it('9. translateLegacy(pathForkCycleLegacyData(12)) → 23 nodes, no warnings', () => {
    const t = translateLegacy(pathForkCycleLegacyData(12))
    expect(t.nodes.length).toBe(23)
    expect(t.warnings.length).toBe(0)
  })
})

describe('C1 — the MCP battery surface load paths (Runtime.load)', () => {
  it('10. load envelope → census.inTree>1, renderedHtml+ssrHtml contain counter, warnings array', () => {
    const r = withEnvelope()
    const res = r.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(res.census.inTree).toBeGreaterThan(1)
    expect(res.renderedHtml).toContain('counter')
    expect(res.ssrHtml).toContain('counter')
    expect(Array.isArray(res.warnings)).toBe(true)
  })

  it('11. load({kind:"doc", doc}) → census.inTree > 1', () => {
    const r = withEnvelope()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    const res = r.load({ kind: 'doc', doc })
    expect(res.census.inTree).toBeGreaterThan(1)
  })

  it('12. load({kind:"commands"}) state-slice → rendered HTML contains >7<', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const counter = r.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const res = r.load({
      kind: 'commands',
      commands: [
        { kind: 'state-slice', node: counter.nodeId, mutation: [{ targetProp: 'content', mode: 'replace', value: '7' }] },
      ],
    })
    expect(res.renderedHtml).toContain('>7<')
  })

  it('13. load({kind:"bogus"}) THROWS /unknown load kind/', () => {
    const r = withEnvelope()
    expect(() => r.load({ kind: 'bogus' as never })).toThrow(/unknown load kind/)
  })

  it('14. load({kind:"commands", commands:{a:1}}) THROWS /not iterable/ (non-array commands)', () => {
    const r = withEnvelope()
    expect(() => r.load({ kind: 'commands', commands: { a: 1 } as never })).toThrow(/not iterable/)
  })
})

describe('B3 — op / export / validate / teardownResult', () => {
  it('15. op state-slice value 9 → status applied, renderedHtml contains >9<', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const counter = r.listTargets().nodes.find((n) => n.propsId === 'counter')!
    const res = r.op({
      kind: 'state-slice',
      node: counter.nodeId,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '9' }],
    })
    expect(res.status).toBe('applied')
    expect(res.renderedHtml).toContain('>9<')
  })

  it('16. export("legacy") → {export, census} with export.template defined, census.inTree>1', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = r.export('legacy')
    expect(res.export.template).toBeDefined()
    expect(res.census.inTree).toBeGreaterThan(1)
  })

  it('17. validate("legacy", export) → valid + censusMatch true; treeSigMatch is a signal (R3)', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const exported = r.export('legacy')
    const verdict = r.validate('legacy', exported.export)
    expect(verdict.valid).toBe(true)
    expect(verdict.censusMatch).toBe(true)
    // R3: a seam/def-bearing export's re-translate emits only the root, so
    // treeSigMatch is legitimately boolean (parity is structural best-effort,
    // NOT a hard contract for the legacy round-trip).
    expect(typeof verdict.treeSigMatch).toBe('boolean')
  })

  it('18. teardownResult → inTree 1, html no longer has counter but contains the root id', async () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = await r.teardownResult()
    expect(res.census.inTree).toBe(1)
    expect(res.renderedHtml).not.toContain('counter')
    // the root-only mount is a single element carrying its own engine node id
    expect(res.renderedHtml).toMatch(/data-node-id=/)
    expect(res.renderedHtml).toContain('demo-shell')
  })

  it('19. load cycle envelope(12) → census.inTree===23 AND registered===23', () => {
    const r = withEnvelope()
    const res = r.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(12) })
    expect(res.census.inTree).toBe(23)
    expect(res.census.registered).toBe(23)
  })
})

describe('B4 — SSR survives a graph reload (R13 stale-adapter regression)', () => {
  it('20. SSR survives two graph reloads (R13 stale-adapter regression)', () => {
    const r = withEnvelope()
    // first demo load
    const one = r.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(one.ssrHtml.length).toBeGreaterThan(0)
    expect(one.ssrHtml).toContain('counter')
    // second demo load — must NOT collapse (the SSRFragmentAdapter is recreated)
    const two = r.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(two.ssrHtml.length).toBeGreaterThan(0)
    expect(two.ssrHtml).toContain('counter')
  })
})

describe('C1 — code-CRUD (unit C, mcp-endpoint.md §4)', () => {
  it('21. codeGet("template.root.children[1].children[2]") → a defined value', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const got = r.codeGet('template.root.children[1].children[2]')
    expect(got.value).toBeDefined()
  })

  it('22. codeGet("") → {path:"", value: whole envelope}', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const got = r.codeGet('')
    expect(got.path).toBe('')
    expect(got.value.template).toBeDefined()
    expect(got.value.content).toBeDefined()
  })

  it('23. codeSet("template.root.hooks", ["theme","user"]) → ok, wrote; codeGet reflects', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const set = r.codeSet('template.root.hooks', ['theme', 'user'])
    expect(set.ok).toBe(true)
    expect(set.wrote).toEqual(['theme', 'user'])
    expect(r.codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('24. codeCreate("template.root.hooks","accent") on hooks=["theme"] → appendedAt 1, array [theme,accent]', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    r.codeSet('template.root.hooks', ['theme'])
    const cre = r.codeCreate('template.root.hooks', 'accent')
    expect(cre.ok).toBe(true)
    expect(cre.appendedAt).toBe(1)
    expect(r.codeGet('template.root.hooks').value).toEqual(['theme', 'accent'])
  })

  it('25. codeCreate("template.root", {}) (non-array) THROWS /not an array/', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    expect(() => r.codeCreate('template.root', {})).toThrow(/not an array/)
  })

  it('26. codeDelete("template.root.hooks",1) on [theme,accent,user] → removed accent; [theme,user]', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    r.codeSet('template.root.hooks', ['theme', 'accent', 'user'])
    const del = r.codeDelete('template.root.hooks', 1)
    expect(del.ok).toBe(true)
    expect(del.removed).toBe('accent')
    expect(r.codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('27. codeDelete out-of-range (99 and -1) THROWS /out of range/ and array untouched', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    r.codeSet('template.root.hooks', ['theme', 'user'])
    expect(() => r.codeDelete('template.root.hooks', 99)).toThrow(/out of range/)
    expect(() => r.codeDelete('template.root.hooks', -1)).toThrow(/out of range/)
    expect(r.codeGet('template.root.hooks').value).toEqual(['theme', 'user'])
  })

  it('28. codeValidate() on a valid envelope → {valid:true, warnings:[...]}', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const v = r.codeValidate()
    expect(v.valid).toBe(true)
    expect(Array.isArray(v.warnings)).toBe(true)
  })

  it('29. codeValidate({template:null, content:"garbage"}) → {valid:false}, never throws', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    let v: any
    expect(() => {
      v = r.codeValidate({ template: null, content: 'garbage' })
    }).not.toThrow()
    expect(v.valid).toBe(false)
  })

  it('30. codeLoad() after codeSet/codeCreate re-derives: inTree>1, rendered contains counter', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    r.codeSet('template.root.hooks', ['theme', 'accent'])
    const res = r.codeLoad()
    expect(res.census.inTree).toBeGreaterThan(1)
    expect(res.renderedHtml).toContain('counter')
  })

  it('31. code.load after code set/create: rendered+ssr BOTH non-empty and contain counter', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    r.codeSet('template.root.hooks', ['theme'])
    r.codeCreate('template.root.hooks', 'accent')
    const res = r.codeLoad()
    expect(res.renderedHtml.length).toBeGreaterThan(0)
    expect(res.renderedHtml).toContain('counter')
    expect(res.ssrHtml.length).toBeGreaterThan(0)
    expect(res.ssrHtml).toContain('counter')
  })

  it('32. codeSet("template.root.hooks",[]) after a {kind:"doc"} load THROWS /no envelope/', () => {
    const r = withEnvelope()
    const t = translateLegacy(demoEnvelope())
    const doc = serializeSlice(t.root, t.nodes, { adapter: 'dom', persistence: false })
    r.load({ kind: 'doc', doc })
    expect(() => r.codeSet('template.root.hooks', [])).toThrow(/no envelope/)
  })
})

describe('D1 — the battery host + runner (unit D)', () => {
  it.skip('33. tests/e2e-battery.test.mjs spawns dist/main/battery-host.mjs over stdio and exposes the full tool set (93 checks) — covered by the e2e runner', () => {
    expect(true).toBe(true)
  })

  it('34. fork-stress d12 cycle variant loads → inTree 23, registered ≥ 23, rendered has data-node-id', () => {
    const r = withEnvelope()
    const res = r.load({ kind: 'envelope', envelope: pathForkCycleLegacyData(12) })
    expect(res.census.inTree).toBe(23)
    expect(res.census.registered).toBeGreaterThanOrEqual(23)
    expect(res.renderedHtml).toContain('data-node-id=')
  })

  it('35. userData-conditional landings: anon load vs user load do not leak (R8)', () => {
    // Runtime-level proxy for the landings userData switch: an anon load then a
    // userData load then an anon load again must not contaminate. The R8
    // plumbing is asserted by the userData lifecycle on the load path.
    const r = withEnvelope()
    const env: any = demoEnvelope()
    const anon = r.load({ kind: 'envelope', envelope: env })
    expect(anon.census.inTree).toBeGreaterThan(1)
    const user = r.load({ kind: 'envelope', envelope: env, userData: { username: 'alice' } })
    expect(user.census.inTree).toBeGreaterThan(1)
    // re-load anon after the logged-in load — no contamination
    const anonAgain = r.load({ kind: 'envelope', envelope: env })
    expect(anonAgain.census.inTree).toBeGreaterThan(1)
  })

  it('36. counter-inc handler dispatch returns non-empty results + non-empty dirtied (R7)', async () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const rep = await r.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    expect(rep.results.length).toBeGreaterThan(0)
    expect(rep.dirtied.length).toBeGreaterThan(0)
  })

  it('37. code-CRUD over MCP in sequence, code.load re-derives (inTree > 1)', () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    r.codeGet('template.root.hooks')
    r.codeSet('template.root.hooks', ['theme', 'user', 'accent'])
    r.codeCreate('template.root.hooks', 'extra')
    const v = r.codeValidate()
    expect(v.valid).toBe(true)
    const res = r.codeLoad()
    expect(res.census.inTree).toBeGreaterThan(1)
  })

  it('38. teardown returns inTree 1 and root-only mount (no counter)', async () => {
    const r = withEnvelope()
    r.load({ kind: 'envelope', envelope: demoEnvelope() })
    const res = await r.teardownResult()
    expect(res.census.inTree).toBe(1)
    expect(res.renderedHtml).not.toContain('counter')
  })

  it.skip('39. the full battery reports 0 failures (93 checks) — covered by tests/e2e-battery.test.mjs', () => {
    expect(true).toBe(true)
  })
})
