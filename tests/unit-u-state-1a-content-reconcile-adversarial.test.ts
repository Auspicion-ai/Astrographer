// tests/unit-u-state-1a-content-reconcile-adversarial.test.ts — Unit U-STATE-1a
// ADVERSARIAL regression set (RCA-3, 2026-09-11).
//
// These pin the fixes for the adversarial findings against
// src/renderer/content-reconcile.ts. Written AFTER the adversarial review (RCA-3
// permits fix+regression); each is a red→green regression for a confirmed
// finding.
import { describe, it, expect } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { reconcileContentRoots } from '../src/renderer/content-reconcile.js'

function root(ragNodeId: string, content = '', children: LegacyNodeData[] = []): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${ragNodeId}` }, content, children }
}
function child(ragNodeId: string, content = ''): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${ragNodeId}` }, content }
}
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: [{ content: roots }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
function ids(list: { ragNodeId: string }[]): string[] {
  return list.map((r) => r.ragNodeId)
}

describe('U-STATE-1a adversarial regressions', () => {
  it('R1. a props-only change is detected by the fallback shape projection', () => {
    const prev = [{ type: 'div', props: { id: 'rag-a', className: 'A' }, content: 'x' } as unknown as LegacyNodeData]
    const next = envelope([
      { type: 'div', props: { id: 'rag-a', className: 'B' }, content: 'x' } as unknown as LegacyNodeData,
    ])
    const r = reconcileContentRoots({ previous: prev, next, change: null })
    expect(ids(r.replaced)).toEqual(['a'])
  })

  it('R1b. a runtime `data-*` marker alone does NOT report a change', () => {
    const prev = [{ type: 'div', props: { id: 'rag-a', 'data-doc-head': true }, content: 'x' } as unknown as LegacyNodeData]
    const next = envelope([
      { type: 'div', props: { id: 'rag-a' }, content: 'x' } as unknown as LegacyNodeData,
    ])
    const r = reconcileContentRoots({ previous: prev, next, change: null })
    expect(ids(r.kept)).toEqual(['a'])
    expect(ids(r.replaced)).toEqual([])
  })

  it('R2. a content-only change that REMOVES a nested doc-child is detected', () => {
    const prev = [root('a', '', [child('a-child')])]
    const next = envelope([root('a', '')])
    const r = reconcileContentRoots({ previous: prev, next, change: { kind: 'content', nodeIds: ['a-child'], edgeIds: [] } })
    expect(ids(r.replaced)).toEqual(['a'])
    expect(r.usedFallback).toBe(false) // a clean content change — the union catches it
  })

  it('R3. malformed envelope shapes never throw (F1 guard is the only throw)', () => {
    // non-array content
    expect(() =>
      reconcileContentRoots({ previous: [], next: { template: { root: { type: 'div' } }, content: {} } as never, change: null }),
    ).not.toThrow()
    // payload content not an array
    expect(() =>
      reconcileContentRoots({ previous: [], next: { template: { root: { type: 'div' } }, content: [{ content: {} }] } as never, change: null }),
    ).not.toThrow()
    // a root with non-array children
    const badChildren = { type: 'div', props: { id: 'rag-a' }, content: 'x', children: 'oops' } as unknown as LegacyNodeData
    expect(() =>
      reconcileContentRoots({ previous: [badChildren], next: envelope([root('a', 'x')]), change: null }),
    ).not.toThrow()
    // a null child entry
    const nullChild = { type: 'div', props: { id: 'rag-a' }, content: 'x', children: [null] } as unknown as LegacyNodeData
    expect(() =>
      reconcileContentRoots({ previous: [nullChild], next: envelope([root('a', 'x')]), change: null }),
    ).not.toThrow()
  })

  it('R4. a missing `content` on a valid-template envelope throws the documented guard', () => {
    expect(() =>
      reconcileContentRoots({ previous: [], next: { template: { root: { type: 'div' } } } as never, change: null }),
    ).toThrow()
  })

  it('R5. a structural change still honours a reported payload hit (union, not exclusive)', () => {
    // Same content + same subtree shape, but the payload reports `a` changed.
    const prev = [root('a', 'same')]
    const next = envelope([root('a', 'same')])
    const r = reconcileContentRoots({ previous: prev, next, change: { kind: 'structural', nodeIds: ['a'], edgeIds: [] } })
    expect(ids(r.replaced)).toEqual(['a'])
    expect(r.usedFallback).toBe(true)
  })

  it('R6. content/prop key order does not falsely report a change (canonical projection)', () => {
    const prev = [{ type: 'div', props: { id: 'rag-a', x: 1, y: 2 }, content: 'x' } as unknown as LegacyNodeData]
    const next = envelope([{ type: 'div', props: { id: 'rag-a', y: 2, x: 1 }, content: 'x' } as unknown as LegacyNodeData])
    const r = reconcileContentRoots({ previous: prev, next, change: null })
    expect(ids(r.kept)).toEqual(['a'])
  })

  it('R7. a null entry inside previous is ignored, not thrown', () => {
    const r = reconcileContentRoots({ previous: [null as never, root('a')], next: envelope([root('a')]), change: null })
    expect(ids(r.kept)).toEqual(['a'])
  })

  it('R8. an AUTHORED data-* change on a pane is detected (pane is replaced)', () => {
    // A `pane-` root whose only change is an authored `data-current` marker
    // (doc-nav current-highlight) must be replaced — adversarial finding 4.
    const prev = [{ type: 'div', props: { id: 'pane-doc-nav', 'data-current': 'docA' }, content: 'nav' } as unknown as LegacyNodeData]
    const next = envelope([
      { type: 'div', props: { id: 'pane-doc-nav', 'data-current': 'docB' }, content: 'nav' } as unknown as LegacyNodeData,
    ])
    const r = reconcileContentRoots({ previous: prev, next, change: { kind: 'content', nodeIds: [], edgeIds: [] } })
    expect(ids(r.replaced)).toEqual(['pane-doc-nav'])
  })

  it('R9. the runtime data-doc-head marker on a pane is still ignored (no false change)', () => {
    const prev = [{ type: 'div', props: { id: 'pane-doc-nav', 'data-doc-head': true }, content: 'nav' } as unknown as LegacyNodeData]
    const next = envelope([{ type: 'div', props: { id: 'pane-doc-nav' }, content: 'nav' } as unknown as LegacyNodeData])
    const r = reconcileContentRoots({ previous: prev, next, change: { kind: 'content', nodeIds: [], edgeIds: [] } })
    expect(ids(r.kept)).toEqual(['pane-doc-nav'])
  })
})
