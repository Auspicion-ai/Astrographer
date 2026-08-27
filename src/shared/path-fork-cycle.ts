// src/shared/path-fork-cycle.ts — the CYCLE variant of the static
// path-fork family (docs/specs/e2e-test-battery.md §5.1.x). The upstream
// static trio has no cycle variant (the runtime form's `handler` mechanism is
// clone-recursion, which the static model has no equivalent of); this module is
// the NEW deliverable — a data-only cycle across the three STATIC-capable
// methods with zero handlers and zero clones.
//
// Topology = the path-fork base: root + 2 prototypes per layer 1..depth−1
// (2·(depth−1) prototypes, 2·depth−1 nodes). Level-1 prototypes are
// template.root.children; layers ≥ 2 are content payload roots. Every level
// carries the TWO-sided placement contract (`placementName: zone-<k>` +
// `targetPlacement: zone-<k−1>` for k ≥ 2).
//
// The mechanism CYCLES per layer: layer k's prototypes get method
// `cycle[(k−1) % 3]` where `cycle = ['placement', 'values', 'link']`.
// `handler` is EXCLUDED (a static handler-layer expansion is a category
// error — the derived family has no after-compile expansion).
//
// Census (identical to the trio): 2·depth−1 nodes / 2^depth − 1 path-state
// elements. d12: 23 nodes / 4095 elements. ONE compilePath pass, zero ops.
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'

export type CycleMethod = 'placement' | 'values' | 'link'

/** The per-layer mechanism cycle (index 0 = layer 1). `handler` is excluded. */
export const CYCLE_METHODS: CycleMethod[] = ['placement', 'values', 'link']

export function cycleMethodFor(level: number): CycleMethod {
  return CYCLE_METHODS[(level - 1) % CYCLE_METHODS.length]
}

/** The css property a level's nodes carry (1-based level) — demo-only helper,
 *  minimal so the census/render is version-stable (mirrors the trio's
 *  per-level distinct property). */
export function cssPropForLevel(level: number): string {
  const props = ['background-color', 'border-style', 'border-width']
  return props[(level - 1) % props.length]
}

/** Distinct css for a level + sibling slot ('a' first / 'b' second). */
export function levelCss(level: number, slot: 'a' | 'b'): { classes: string[]; style: string } {
  const prop = cssPropForLevel(level)
  const value = slot === 'a' ? '10px' : '20px'
  return { classes: ['fs-node'], style: `${prop}: ${value}; --stress-depth: ${level};` }
}

/** The component-def for a LINK layer — re-types the consumer's children (div
 *  type, def content) at emit time. Pure JSON data riding as the prototype's
 *  `component.value` (the fork-stress link shape, static-adapted). */
export function linkDefForLevel(level: number) {
  return {
    type: 'div',
    label: `component: link-${level} — prototype linked as children`,
    childLayersSuffix: `L${level}:link`,
    childOffset: 0,
    children: [
      { bind: 'a', type: 'div', content: `link-${level}.a`, css: levelCss(level, 'a'), props: { 'stress:kind': `link:${level}`, 'data-depth': String(level) } },
      { bind: 'b', type: 'div', content: `link-${level}.b`, css: levelCss(level, 'b'), props: { 'stress:kind': `link:${level}`, 'data-depth': String(level) } },
    ],
  }
}

/** The CYCLE-variant legacy envelope: 2·(depth−1) prototypes, 2·depth−1
 *  nodes, 2^depth−1 path-state elements. Every prototype carries the two-sided
 *  placement; the per-layer component field follows the CYCLE_METHODS cycle.
 *  No handler bodies, no clone-instance — pure per-layer DATA. */
export function pathForkCycleLegacyData(depth = 12): LegacyInitialData {
  const children: LegacyNodeData[] = []
  const payload: LegacyNodeData[] = []
  for (let k = 1; k <= depth - 1; k += 1) {
    const method = cycleMethodFor(k)
    for (const slot of ['a', 'b'] as const) {
      const proto: LegacyNodeData = {
        type: slot === 'a' ? 'div' : 'span',
        props: {
          id: `p${k}${slot}`,
          'stress:layer': k,
          'stress:slot': slot,
          'data-depth': String(k),
        },
        css: levelCss(k, slot),
        placement: {
          placementName: `zone-${k}`,
          ...(k >= 2 ? { targetPlacement: [`zone-${k - 1}`] } : {}),
        },
      }
      if (method === 'values') {
        proto.component = { reference: `values-${k}.${slot}`, value: `value-${slot.toUpperCase()}-${k}` }
      } else if (method === 'link') {
        proto.component = { reference: `link-${k}`, value: linkDefForLevel(k) }
      }
      if (k === 1) children.push(proto)
      else payload.push(proto)
    }
  }
  return {
    template: { root: { type: 'app', props: { id: 'path-root' }, children } },
    content: [{ metadata: { title: 'static cycle-derived prototypes' }, content: payload }],
    clientConfig: { runInstantiation: false, runMonitoring: true },
  }
}
