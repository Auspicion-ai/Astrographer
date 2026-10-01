// tests/unit-u-state-w2n11-depth-safety.test.ts — W2-N11 (U-STATE-1a/1e) depth
// safety regression (docs/specs/wave-2-open-decisions.md §D W2-N11; spec
// U-STATE-1a/1e §9 L2).
//
// The pure reconciler's recursive `collectRagIds` / `shapeProjection` walks
// `children` with NO visited-set or depth cap, so a CIRCULAR or pathologically
// deep `children` graph throws `RangeError: Maximum call stack size exceeded`.
// Not reachable from a well-formed traversal envelope, but a hostile-input DoS
// surface. The fix mirrors the ADR-4 / TOK-F1 stack-safety discipline: a
// deterministic `MAX_RECONCILE_DEPTH` cap turns a hostile deep input into a
// bounded partial/truncated result instead of a throw.
//
// Asserts for BOTH the 1a single-root `reconcileContentRoots` and the 1e N-root
// `reconcileDocumentRoots`:
//   (a) a circular `children` structure never throws (bounded);
//   (b) a pathologically deep (50k-level) `children` chain never throws
//       (bounded).
import { describe, it, expect, beforeAll } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { reconcileContentRoots, reconcileDocumentRoots } from '../src/renderer/content-reconcile.js'
import { installShim } from '../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

// ---- hostile fixtures ----------------------------------------------------

/** A content root (`rag-x`) whose direct child graph is a CYCLE among NON-rag
 *  descendants (no `rag-` boundary is ever hit, so the raw recursion would walk
 *  c1 → c2 → c1 → … forever). */
function circularRagNode(): LegacyNodeData {
  const n1 = { type: 'div', props: {}, content: '' } as { type: string; props: Record<string, unknown>; content?: string; children?: unknown[] }
  const n2 = { type: 'div', props: {}, content: '' } as { type: string; props: Record<string, unknown>; content?: string; children?: unknown[] }
  n1.children = [n2]
  n2.children = [n1] // the cycle
  return { type: 'div', props: { id: 'rag-x' }, content: '', children: [n1] }
}

/** A content root (`rag-x`) leading into a pathologically deep chain (default
 *  50k levels) of NON-rag descendants. A raw recursive walk overflows the call
 *  stack; with the depth cap it must be bounded. */
function deepChainRagNode(depth = 50000): LegacyNodeData {
  let node: { type: string; props: Record<string, unknown>; content?: string; children?: unknown[] } = {
    type: 'div',
    props: {},
    content: 'leaf',
  }
  for (let i = 0; i < depth; i += 1) {
    node = { type: 'div', props: {}, content: '', children: [node] }
  }
  return { type: 'div', props: { id: 'rag-x' }, content: '', children: [node] }
}

/** A traversal-style envelope: one content payload per root, in render order. */
function envelope(root: LegacyNodeData): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: [{ content: [root] }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// The 1a reconcile forces the full-subgraph fallback (change = null), which is
// the hostile-worst path: it shape-compares the ENTIRE subtree (recursive
// `collectRagIds` + `shapeProjection`).

describe('W2-N11 — U-STATE-1a `reconcileContentRoots` depth safety', () => {
  it('(a) a circular children structure never throws (bounded, partial result)', () => {
    const root = circularRagNode()
    let result: unknown
    expect(() => {
      result = reconcileContentRoots({
        previous: [root],
        next: envelope(root),
        change: null,
      })
    }).not.toThrow()
    // Bounded + deterministic: the root is produced and classified (kept — the
    // truncated shapes match), never an uncaught RangeError.
    const r = result as { kept: { cssId: string }[] }
    expect(r.kept.some((k) => k.cssId === 'rag-x')).toBe(true)
  })

  it('(b) a 50k-level deep children chain never throws (bounded, partial result)', () => {
    const root = deepChainRagNode(50000)
    let result: unknown
    expect(() => {
      result = reconcileContentRoots({
        previous: [root],
        next: envelope(root),
        change: null,
      })
    }).not.toThrow()
    const r = result as { kept: { cssId: string }[] }
    expect(r.kept.some((k) => k.cssId === 'rag-x')).toBe(true)
  })
})

// The 1e N-root variant walks the same helpers (`collectRagIds` +
// `shapeProjection`) per document root; the N-root path must inherit the cap.

describe('W2-N11 — U-STATE-1e `reconcileDocumentRoots` depth safety', () => {
  it('(a) a circular children structure never throws (bounded, N-root)', () => {
    const root = circularRagNode()
    let result: unknown
    expect(() => {
      result = reconcileDocumentRoots({
        previous: [{ documentId: 'A', root }],
        next: [{ documentId: 'A', envelope: envelope(root) }],
        change: null,
        documentIds: ['A'],
      })
    }).not.toThrow()
    const r = result as { kept: { documentId: string; cssId: string }[] }
    expect(r.kept.some((k) => k.documentId === 'A' && k.cssId === 'rag-x')).toBe(true)
  })

  it('(b) a 50k-level deep children chain never throws (bounded, N-root)', () => {
    const root = deepChainRagNode(50000)
    let result: unknown
    expect(() => {
      result = reconcileDocumentRoots({
        previous: [{ documentId: 'A', root }],
        next: [{ documentId: 'A', envelope: envelope(root) }],
        change: null,
        documentIds: ['A'],
      })
    }).not.toThrow()
    const r = result as { kept: { documentId: string; cssId: string }[] }
    expect(r.kept.some((k) => k.documentId === 'A' && k.cssId === 'rag-x')).toBe(true)
  })
})
