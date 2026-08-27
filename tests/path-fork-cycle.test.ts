// tests/path-fork-cycle.test.ts — Unit B: the CYCLE-variant static envelope
// (docs/specs/e2e-test-battery.md §5.1.x + src/shared/path-fork-cycle.ts). The
// upstream static trio (placement/values/link) has no cycle variant; this is
// the NEW data-only module that cycles the three STATIC-capable mechanisms per
// layer with zero handlers and zero clones.
import { describe, it, expect } from 'vitest'
import { pathForkCycleLegacyData, cycleMethodFor, CYCLE_METHODS } from '../src/shared/path-fork-cycle.js'
import { translateLegacy } from 'provident-ssr'
import type { LegacyNodeData } from 'provident-ssr'

const C = 'content'

describe('pathForkCycleLegacyData — the cycle-variant static envelope (§5.1.x)', () => {
  it('CYCLE_METHODS is the static trio without handler', () => {
    expect(CYCLE_METHODS).toEqual(['placement', 'values', 'link'])
    expect(CYCLE_METHODS).not.toContain('handler')
  })

  it('cycleMethodFor cycles per layer across the three methods', () => {
    expect(cycleMethodFor(1)).toBe('placement')
    expect(cycleMethodFor(2)).toBe('values')
    expect(cycleMethodFor(3)).toBe('link')
    expect(cycleMethodFor(4)).toBe('placement')
    expect(cycleMethodFor(5)).toBe('values')
    expect(cycleMethodFor(6)).toBe('link')
  })

  it('d12 produces 2·depth−1 = 23 prototypes/nodes (census contract)', () => {
    const env = pathForkCycleLegacyData(12)
    // level-1 prototypes are template.root.children (2); layers 2..11 are
    // content payload roots (2 per layer × 10 = 20); + root = 23
    const rootChildren = env.template.root.children ?? []
    const payloadCount = (env.content?.[0]?.content ?? []).length
    expect(rootChildren.length).toBe(2)
    expect(payloadCount).toBe(20)
    // the census is 2·depth−1 nodes → 2^depth − 1 = 4095 path-state elements
    expect(2 * 12 - 1).toBe(23)
    expect(2 ** 12 - 1).toBe(4095)
  })

  it('every level carries the two-sided placement contract (placementName + targetPlacement for k≥2)', () => {
    const env = pathForkCycleLegacyData(5)
    const l1 = env.template.root.children ?? []
    expect(l1[0].placement?.placementName).toBe('zone-1')
    expect(l1[0].placement?.targetPlacement).toBeUndefined()
    const content = env.content?.[0]?.content ?? []
    const l2 = content.filter((c) => (c.props as Record<string, unknown>)?.['stress:layer'] === 2)
    expect(l2.length).toBe(2)
    expect(l2[0].placement?.placementName).toBe('zone-2')
    expect(l2[0].placement?.targetPlacement).toEqual(['zone-1'])
  })

  it('layer 2 (values) carries the fork-stress values component shape', () => {
    const env = pathForkCycleLegacyData(4)
    const l2 = (env.content?.[0]?.content ?? []).filter((n) => (n.props as Record<string, unknown>)?.['stress:layer'] === 2)
    const a = l2.find((n) => (n.props as Record<string, unknown>)?.['stress:slot'] === 'a')!
    expect(a.component?.reference).toBe('values-2.a')
    expect(a.component?.value).toBe('value-A-2')
    const b = l2.find((n) => (n.props as Record<string, unknown>)?.['stress:slot'] === 'b')!
    expect(b.component?.value).toBe('value-B-2')
  })

  it('layer 3 (link) carries the fork-stress link def (type div, def content)', () => {
    const env = pathForkCycleLegacyData(4)
    const l3 = (env.content?.[0]?.content ?? []).filter((n) => (n.props as Record<string, unknown>)?.['stress:layer'] === 3)
    expect(l3.length).toBe(2)
    expect(l3[0].component?.reference).toBe('link-3')
    const def = l3[0].component?.value as { type?: string; children?: LegacyNodeData[] }
    expect(def?.type).toBe('div')
    expect(def?.children?.length).toBe(2)
    expect(def?.children?.[0]?.content).toBe('link-3.a')
    expect(def?.children?.[1]?.content).toBe('link-3.b')
  })

  it('layer 1 (placement) has NO component field', () => {
    const env = pathForkCycleLegacyData(4)
    for (const child of env.template.root.children ?? []) {
      expect(child.component).toBeUndefined()
    }
  })

  it('the envelope has zero handlers and zero clones (data-only — the pin)', () => {
    const env = pathForkCycleLegacyData(6)
    const countHandlers = (nodes: LegacyNodeData[]): number =>
      nodes.reduce((acc, n) => acc + (Array.isArray(n.handlers) ? n.handlers.length : 0), 0)
    expect(countHandlers(env.template.root.children ?? [])).toBe(0)
    expect(countHandlers(env.content?.[0]?.content ?? [])).toBe(0)
    // no handler mechanism anywhere
    expect(JSON.stringify(env)).not.toContain('handler')
    expect(JSON.stringify(env)).not.toContain('clone')
  })

  it('translates via translateLegacy to a 23-node graph at d12 (census contract)', () => {
    const env = pathForkCycleLegacyData(12)
    const translated = translateLegacy(env)
    expect(translated.nodes.length).toBe(23)
    expect(translated.warnings ?? []).toEqual([])
  })
})
