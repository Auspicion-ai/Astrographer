// tests/integration/shell-chrome/deps-adopt-engine-provider.test.ts — unit `E-1` `deps-adopt`'s
// RED row, authored BEFORE the dependency change (RCA-1) and RUN before it.
//
// WHY THIS ROW EXISTS: the unit takes `provident-ssr` `^0.5.1` → `^0.5.2` and adds
// `provident-storeroom` `^1.11.0` with no consumer. The bump is not hygiene — it discharges a
// FOUNDATION FINDING by adoption (D-20, D-9's never-patch rule): on 0.5.1 the compile emit gate at
// `dist/core/node.js` `if (hasAnyTarget && isResolutionParticipant(node) && !isSeamProvider(node))
// continue;` treats an AUTHORED provider consumed by name as a value holder and NOT an element, so
// the provider node is absent from `actionable` and from the rendered HTML. The foundation's
// zone-form-by-position (`../Provident-Electron/src/shared/demo-envelope.ts:780-822`) publishes a
// class from a ZONE node and consumes it into a PANE's `css.classes` — a pattern whose provider is
// authorable once the engine emits it.
//
// THE FIVE LIMBS (one `it` each):
//   A — the reason the bump exists, in its narrowest measurable form: a consumer standing under a
//       provider renders with the INHERITED class on ITS OWN element. (Measured on 0.5.1: the class
//       DOES arrive — resolution runs over the full slice and the dropped provider still
//       participates. See the row's report; this limb is green-on-arrival.)
//   B — THE PROVIDER IS AN ELEMENT: its own authored `css.id` and its own content marker reach the
//       rendered HTML. This is exactly what the `!isSeamProvider` skip deletes ⇒ RED on 0.5.1.
//   C — the walk still DISCRIMINATES BY POSITION: an outer and a nearer provider publish different
//       classes and the consumer reads the NEAREST one, never both. Without `C`, `A`/`B` would also
//       be satisfied by an engine that sprayed every provider's value everywhere.
//   D — DECLARATION / RESOLUTION / LOCK AGREEMENT: `package.json`, the installed packages, and the
//       lockfile root mirror + package entries all say the same two things, and the declaration
//       count moved by exactly one.
//   E — NO CONSUMER (D-20's ahead-of-consumer clause): no `src/**` file names `provident-storeroom`.
//       GREEN-ON-ARRIVAL as a negative, non-vacuous via a floor on the walked file count.
//
// WHAT THIS ROW DOES NOT DO: no network, no ollama, no electron, no spawn, no `git`; it writes
// nothing and reads only the repo it lives in. Limb `D`/`E` read files from a path built from THIS
// FILE's own location, so a missing substrate FAILS (ENOENT) instead of skipping.
//
// LAYER (RCA-12): `[T]` / envelope. `A`-`C` render through `SSRFragmentAdapter` under the
// layout-less DOM shim — they prove the ENGINE's emit/resolve behaviour, never app-green.
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { translateLegacy, Supervisor, EventBridge, SSRFragmentAdapter, renderProducingProcess } from 'provident-ssr'
import { installShim } from '../../../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const readJson = (relative: string) => JSON.parse(readFileSync(`${ROOT}${relative}`, 'utf8'))

/** Engine warnings collected across the three render limbs, reported by the row (never asserted —
 *  a warning is diagnosis, not a colour). */
const engineWarnings: unknown[] = []

/** The canonical producing loop `tests/engine-surfaces.test.ts` drives, reduced to one render: the
 *  legacy envelope in, the rendered HTML out. */
function renderEnvelope(templateRoot: Record<string, unknown>): string {
  const t = translateLegacy({
    template: { root: templateRoot },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  })
  const sup = new Supervisor({ events: new EventBridge() })
  for (const n of t.nodes) sup.registerNode(n)
  const cr = t.root.compile(t.nodes)
  sup.recordResolved(cr.actionable)
  const nodeById = new Map(t.nodes.map((n) => [n.id, n]))
  const adapter = new SSRFragmentAdapter()
  renderProducingProcess(cr.actionable as never, nodeById as never, adapter, null, undefined)
  engineWarnings.push(...((t.warnings ?? []) as unknown[]), ...((cr.warnings ?? []) as unknown[]))
  return adapter.toString()
}

afterAll(() => {
  // reported, never asserted: a warning is diagnosis, not a colour
  console.info(`[E-1] engine warnings across limbs A-C: ${engineWarnings.length}`)
})

describe('deps-adopt (E-1): the provident-ssr bump and the provider-as-element it buys', () => {
  it('A — the consumer standing under a provider renders with the inherited class on its own element', () => {
    const html = renderEnvelope({
      type: 'div',
      css: { id: 'zone-top' },
      component: { reference: 'zone-format', value: ['pane-in-top'] },
      content: 'ZONE-MARKER',
      children: [
        {
          type: 'div',
          css: { id: 'pane-a' },
          component: { reference: 'zone-format', target: 'css.classes' },
          content: 'PANE-MARKER',
        },
      ],
    })
    // ONE regex, over the html, binding the class to the SAME element that carries the marker: a
    // document-wide substring check would pass on a class written on any other node.
    expect(html).toMatch(/<([a-z][a-z0-9]*)\b(?=[^>]*\bclass="[^"]*\bpane-in-top\b)[^>]*>PANE-MARKER<\/\1>/)
  })

  it('B — the authored provider is an ELEMENT: its own css.id and its own content reach the render', () => {
    const html = renderEnvelope({
      type: 'div',
      css: { id: 'zone-top' },
      component: { reference: 'zone-format', value: ['pane-in-top'] },
      content: 'ZONE-MARKER',
      children: [
        {
          type: 'div',
          css: { id: 'pane-a' },
          component: { reference: 'zone-format', target: 'css.classes' },
          content: 'PANE-MARKER',
        },
      ],
    })
    // the provider's own content: absent iff the provider was dropped from `actionable`
    expect(html).toContain('ZONE-MARKER')
    // and it is an element with the id its author gave it, not a bare value holder
    expect(html).toMatch(/<([a-z][a-z0-9]*)\b(?=[^>]*\bid="zone-top")[^>]*>ZONE-MARKER/)
  })

  it('C — the walk discriminates by position: nearest provider wins, the outer one never leaks', () => {
    const html = renderEnvelope({
      type: 'div',
      css: { id: 'zone-outer' },
      component: { reference: 'zone-format', value: ['pane-in-outer'] },
      content: 'OUTER-MARKER',
      children: [
        {
          type: 'div',
          css: { id: 'zone-inner' },
          component: { reference: 'zone-format', value: ['pane-in-inner'] },
          content: 'INNER-MARKER',
          children: [
            {
              type: 'div',
              css: { id: 'pane-a' },
              component: { reference: 'zone-format', target: 'css.classes' },
              content: 'PANE-MARKER',
            },
          ],
        },
      ],
    })
    // the NEAREST provider's class, on the consumer's own element
    expect(html).toMatch(/<([a-z][a-z0-9]*)\b(?=[^>]*\bclass="[^"]*\bpane-in-inner\b)[^>]*>PANE-MARKER<\/\1>/)
    // the OUTER provider's class reached nothing: one name, one nearest hit
    expect(html).not.toContain('pane-in-outer')
  })

  it('D — declaration, resolution and lock agree, and the declaration count moved by exactly one', () => {
    const pkg = readJson('package.json') as { dependencies: Record<string, string> }
    const lock = readJson('package-lock.json') as {
      packages: Record<string, { version?: string; dependencies?: Record<string, string> }>
    }
    const ssrInstalled = readJson('node_modules/provident-ssr/package.json') as { version: string }
    // throws ENOENT if the install did not resolve it — a missing substrate FAILS, never skips
    const storeroomInstalled = readJson('node_modules/provident-storeroom/package.json') as { version: string }
    expect(pkg.dependencies['provident-ssr']).toBe('^0.5.2')
    expect(pkg.dependencies['provident-storeroom']).toBe('^1.11.0')
    expect(ssrInstalled.version).toBe('0.5.2')
    expect(storeroomInstalled.version).toBe('1.11.0')
    // the lock's ROOT MIRROR equals the declarations — read against `pkg`, never re-spelled here
    const mirror = lock.packages[''].dependencies ?? {}
    expect(mirror['provident-ssr']).toBe(pkg.dependencies['provident-ssr'])
    expect(mirror['provident-storeroom']).toBe(pkg.dependencies['provident-storeroom'])
    // and the two resolved entries carry the versions the install actually landed
    expect(lock.packages['node_modules/provident-ssr'].version).toBe('0.5.2')
    expect(lock.packages['node_modules/provident-storeroom'].version).toBe('1.11.0')
    // THE AUTHORITY COUNT: the four pre-existing declarations plus exactly one addition
    expect(Object.keys(pkg.dependencies).length).toBe(5)
  })

  it('E — no consumer: nothing under src/ names provident-storeroom (green, and non-vacuous)', () => {
    const walk = (dir: string): string[] => {
      const found: string[] = []
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`
        if (entry.isDirectory()) found.push(...walk(path))
        else if (entry.name.endsWith('.ts')) found.push(path)
      }
      return found
    }
    const sources = walk(`${ROOT}src`)
    // non-vacuity: an empty or shallow walk cannot satisfy the negative below
    expect(sources.length).toBeGreaterThan(50)
    const importers = sources.filter((file) => readFileSync(file, 'utf8').includes('provident-storeroom'))
    expect(importers).toEqual([])
  })
})
