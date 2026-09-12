// tests/unit-u-state-1b-host-application.test.ts — Unit U-STATE-1b: the Runtime
// host application of the content reconciler.
//
// TestWriter RED set written from docs/specs/unit-u-state-1b-host-application.md
// §4 (states 1–8) + §5 (F1–F6) BEFORE any implementation. The methods do NOT
// exist yet:
//
//   - `runtime.materializedContentRoots()` (RED — not a function)
//   - `runtime.applyContentReconcile(...)` (RED — not a function)
//
// Behavior derived from the spec ALONE. Harness follows tests/runtime-host.test.ts.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

/** A `rag-` content root placed into the `main` zone. */
function ragRoot(ragNodeId: string, content: string): LegacyNodeData {
  return {
    type: 'div',
    props: { id: `rag-${ragNodeId}` },
    content,
    placement: { targetPlacement: ['main'] },
  }
}

/** A traversal-style envelope: template with a `main` container producer +
 *  one payload per content root. */
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'shell' },
        children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
      },
    },
    content: roots.map((r) => ({ content: [r] })),
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

type R = Runtime & {
  materializedContentRoots?: () => LegacyNodeData[]
  applyContentReconcile?: (i: unknown) => { applied: string[]; warnings: string[] }
}

function boot(roots: LegacyNodeData[]): R {
  const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope(roots) as never }) as R
  return runtime
}

describe('U-STATE-1b — §4 states', () => {
  it('1. boot → materializedContentRoots() returns the rag- roots', () => {
    const runtime = boot([ragRoot('docA', 'A'), ragRoot('docB', 'B')])
    const roots = (runtime as R).materializedContentRoots!()
    expect(roots.map((r) => (r.props as { id?: string }).id)).toEqual(['rag-docA', 'rag-docB'])
  })

  it('2. a content change edits only doc A; the zone node keeps its id', () => {
    const runtime = boot([ragRoot('docA', 'A'), ragRoot('docB', 'B')])
    const report = (runtime as R).applyContentReconcile!({
      result: {
        added: [],
        replaced: [{ cssId: 'rag-docA', ragNodeId: 'docA' }],
        removed: [],
        kept: [{ cssId: 'rag-docB', ragNodeId: 'docB' }],
        usedFallback: false,
      },
      next: envelope([ragRoot('docA', 'A-edited'), ragRoot('docB', 'B')]),
    })
    expect(report.applied).toContain('rag-docA')
    // doc B untouched; the rendered html still contains both roots
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('rag-docB')
  })

  it('3. a structural add attaches doc C without rebuilding A/B', () => {
    const runtime = boot([ragRoot('docA', 'A'), ragRoot('docB', 'B')])
    const report = (runtime as R).applyContentReconcile!({
      result: {
        added: [{ cssId: 'rag-docC', ragNodeId: 'docC' }],
        replaced: [],
        removed: [],
        kept: [{ cssId: 'rag-docA', ragNodeId: 'docA' }, { cssId: 'rag-docB', ragNodeId: 'docB' }],
        usedFallback: true,
      },
      next: envelope([ragRoot('docA', 'A'), ragRoot('docB', 'B'), ragRoot('docC', 'C')]),
    })
    expect(report.applied).toContain('rag-docC')
    // ADVERSARIAL AF-1 — a report of `applied` must mean the root actually
    // materialized (rendered), not merely registered. This assertion exposes
    // the attach path.
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('rag-docC')
  })

  it('4. a structural remove detaches doc B; A/C kept', () => {
    const runtime = boot([ragRoot('docA', 'A'), ragRoot('docB', 'B')])
    const report = (runtime as R).applyContentReconcile!({
      result: {
        added: [],
        replaced: [],
        removed: [{ cssId: 'rag-docB', ragNodeId: 'docB' }],
        kept: [{ cssId: 'rag-docA', ragNodeId: 'docA' }],
        usedFallback: true,
      },
      next: envelope([ragRoot('docA', 'A')]),
    })
    expect(report.applied).toContain('rag-docB')
    expect(runtime.renderedHtmlResult().renderedHtml).not.toContain('rag-docB')
  })

  it('5. an empty result is a no-op', () => {
    const runtime = boot([ragRoot('docA', 'A')])
    expect(() =>
      (runtime as R).applyContentReconcile!({
        result: { added: [], replaced: [], removed: [], kept: [{ cssId: 'rag-docA', ragNodeId: 'docA' }], usedFallback: false },
        next: envelope([ragRoot('docA', 'A')]),
      }),
    ).not.toThrow()
  })

  it('6. an added root missing from next → warning, no throw', () => {
    const runtime = boot([ragRoot('docA', 'A')])
    const report = (runtime as R).applyContentReconcile!({
      result: { added: [{ cssId: 'rag-missing', ragNodeId: 'missing' }], replaced: [], removed: [], kept: [], usedFallback: true },
      next: envelope([ragRoot('docA', 'A')]),
    })
    expect(report.warnings.length).toBeGreaterThan(0)
  })

  it('8. node identity is stable across a content change', () => {
    const runtime = boot([ragRoot('docA', 'A'), ragRoot('docB', 'B')])
    ;(runtime as R).applyContentReconcile!({
      result: { added: [], replaced: [{ cssId: 'rag-docA', ragNodeId: 'docA' }], removed: [], kept: [{ cssId: 'rag-docB', ragNodeId: 'docB' }], usedFallback: false },
      next: envelope([ragRoot('docA', 'A2'), ragRoot('docB', 'B')]),
    })
    expect((runtime as R).materializedContentRoots!().map((r) => (r.props as { id?: string }).id)).toContain('rag-docA')
  })
})

describe('U-STATE-1b — §5 fail-states', () => {
  it('F2. a result root absent from next is skipped with a warning', () => {
    const runtime = boot([ragRoot('docA', 'A')])
    const report = (runtime as R).applyContentReconcile!({
      result: { added: [{ cssId: 'rag-ghost', ragNodeId: 'ghost' }], replaced: [], removed: [], kept: [], usedFallback: true },
      next: envelope([ragRoot('docA', 'A')]),
    })
    expect(report.warnings.length).toBeGreaterThan(0)
  })

  it('F4. removing every root leaves the template/zone intact', () => {
    const runtime = boot([ragRoot('docA', 'A')])
    ;(runtime as R).applyContentReconcile!({
      result: { added: [], replaced: [], removed: [{ cssId: 'rag-docA', ragNodeId: 'docA' }], kept: [], usedFallback: true },
      next: envelope([]),
    })
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('zone:main')
  })

  it('reset. a full teardown clears the tracked content roots (adversarial #3)', () => {
    const runtime = boot([ragRoot('docA', 'A'), ragRoot('docB', 'B')])
    expect((runtime as R).materializedContentRoots!().length).toBeGreaterThan(0)
    runtime.teardown()
    expect((runtime as R).materializedContentRoots!().length).toBe(0)
  })
})
