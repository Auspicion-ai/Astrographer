// tests/unit-u-state-1a-content-reconcile.test.ts — Unit U-STATE-1a: the PURE
// content reconciler (`reconcileContentRoots`).
//
// TestWriter RED set written from docs/specs/unit-u-state-1a-content-reconcile.md
// §4 (states 1–12) + §5 (F1–F6) BEFORE any implementation. The module does NOT
// exist yet:
//
//   - `src/renderer/content-reconcile.ts` is ABSENT (RED — import fails).
//
// Behavior is derived from the spec ALONE; no implementation read. Once the
// Implementer lands the least code in `src/renderer/content-reconcile.ts`, the
// states below flip green.
import { describe, it, expect } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import {
  reconcileContentRoots,
  type MaterializedRoot,
  type ReconcileChange,
  type ReconcileInput,
  type ReconcileResult,
  type PreviousRoot,
} from '../src/renderer/content-reconcile.js'

// ---------------------------------------------------------------------------
// Fixtures — envelope nodes (NOT RagStore stubs; spec §3.4)
// ---------------------------------------------------------------------------

/** A content-root envelope node (`rag-<id>`), optionally with nested `rag-`
 *  doc-children. */
function root(ragNodeId: string, content = '', children: LegacyNodeData[] = []): LegacyNodeData {
  return {
    type: 'div',
    props: { id: `rag-${ragNodeId}` },
    content,
    children,
  }
}

/** A nested doc-child root inside a parent subtree. */
function child(ragNodeId: string, content = ''): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${ragNodeId}` }, content }
}

/** A non-RAG payload root (pane/overlay) — never reconciled (states 11). */
function paneRoot(id: string): LegacyNodeData {
  return { type: 'div', props: { id }, content: 'pane' }
}

function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: [{ content: roots }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function change(nodeIds: string[], kind: 'content' | 'structural' = 'content', edgeIds: string[] = []): ReconcileChange {
  return { kind, nodeIds, edgeIds }
}

function ids(list: MaterializedRoot[]): string[] {
  return list.map((r) => r.ragNodeId)
}

function run(input: ReconcileInput): ReconcileResult {
  return reconcileContentRoots(input)
}

// ---------------------------------------------------------------------------
// §4 — States (valid paths)
// ---------------------------------------------------------------------------

describe('U-STATE-1a — §4 states', () => {
  it('1. previous=[] + 2 next roots → added:2, others empty', () => {
    const next = envelope([root('a'), root('b')])
    const r = run({ previous: [], next, change: change([]) })
    expect(ids(r.added)).toEqual(['a', 'b'])
    expect(r.removed).toEqual([])
    expect(r.kept).toEqual([])
    expect(r.replaced).toEqual([])
  })

  it('2. identical previous/next with an empty content change → all kept', () => {
    const prev = [root('a'), root('b')]
    const next = envelope([root('a'), root('b')])
    const r = run({ previous: prev, next, change: change([]) })
    expect(ids(r.kept)).toEqual(['a', 'b'])
    expect(r.added).toEqual([])
    expect(r.removed).toEqual([])
    expect(r.replaced).toEqual([])
  })

  it('3. a changed root id → replaced; others kept', () => {
    const prev = [root('a'), root('b')]
    const next = envelope([root('a', 'edited'), root('b')])
    const r = run({ previous: prev, next, change: change(['a']) })
    expect(ids(r.replaced)).toEqual(['a'])
    expect(ids(r.kept)).toEqual(['b'])
  })

  it('4. a changed NESTED node → its containing root replaced', () => {
    const prev = [root('a', '', [child('a-child')])]
    const next = envelope([root('a', '', [child('a-child', 'edited')])])
    const r = run({ previous: prev, next, change: change(['a-child']) })
    expect(ids(r.replaced)).toEqual(['a'])
    expect(ids(r.kept)).toEqual([])
  })

  it('5. a root only in previous → removed; only in next → added', () => {
    const prev = [root('a'), root('b')]
    const next = envelope([root('b'), root('c')])
    const r = run({ previous: prev, next, change: change(['a', 'c'], 'structural') })
    expect(ids(r.removed)).toEqual(['a'])
    expect(ids(r.added)).toEqual(['c'])
    expect(ids(r.kept)).toEqual(['b'])
  })

  it('6. reorder of roots → all kept, order reflects next', () => {
    const prev = [root('a'), root('b')]
    const next = envelope([root('b'), root('a')])
    const r = run({ previous: prev, next, change: change([]) })
    expect(ids(r.kept)).toEqual(['b', 'a'])
    expect(r.replaced).toEqual([])
  })

  it('7. structural change with edgeIds → doc replaced + usedFallback true', () => {
    const prev = [root('a', '', [child('a-child')])]
    const next = envelope([root('a', '', [child('a-child', 'edited')])])
    const r = run({ previous: prev, next, change: change([], 'structural', ['e-1']) })
    expect(ids(r.replaced)).toEqual(['a'])
    expect(r.usedFallback).toBe(true)
  })

  it('8. change=null → full-subgraph comparison; usedFallback true', () => {
    const prev = [root('a', 'old')]
    const next = envelope([root('a', 'new')])
    const r = run({ previous: prev, next, change: null })
    expect(ids(r.replaced)).toEqual(['a'])
    expect(r.usedFallback).toBe(true)
  })

  it('9. a changed node in document A does NOT mark document B replaced', () => {
    const prev = [root('a'), root('b')]
    const next = envelope([root('a', 'edited'), root('b')])
    const r = run({ previous: prev, next, change: change(['a']) })
    expect(ids(r.kept)).toEqual(['b'])
    expect(ids(r.replaced)).toEqual(['a'])
  })

  it('10. a nested doc-child change marks its CONTAINING root replaced (buckets are per payload root, §3.1)', () => {
    const prev = [root('a', '', [child('a-child')])]
    const next = envelope([root('a', '', [child('a-child'), child('a-child2')])])
    const r = run({ previous: prev, next, change: change(['a-child2'], 'structural', ['e-2']) })
    // A nested doc-child is not a payload root — it is part of root `a`'s
    // subtree, so `a` is replaced and the child is NOT a separate bucket entry.
    expect(ids(r.replaced)).toEqual(['a'])
    expect(ids(r.added)).toEqual([])
    expect(ids(r.kept)).toEqual([])
  })

  it('11. pane roots (`pane-`) are content roots too — reconciled, not ignored (U-STATE-1b pane refresh)', () => {
    const prev = [paneRoot('pane-x'), root('a')]
    const next = envelope([paneRoot('pane-y'), root('a')])
    const r = run({ previous: prev, next, change: change([]) })
    // pane-x → removed, pane-y → added; the rag root a is kept
    expect(ids(r.removed)).toContain('pane-x')
    expect(ids(r.added)).toContain('pane-y')
    expect(ids(r.kept)).toEqual(['a'])
  })

  it('12. deterministic output — two runs deep-equal', () => {
    const prev = [root('a'), root('b')]
    const next = envelope([root('b', 'edited'), root('c')])
    const input: ReconcileInput = { previous: prev, next, change: change(['b', 'c'], 'structural', ['e-3']) }
    const r1 = run(input)
    const r2 = run(input)
    expect(r2).toEqual(r1)
  })
})

// ---------------------------------------------------------------------------
// §5 — Fail-states / edge cases
// ---------------------------------------------------------------------------

describe('U-STATE-1a — §5 fail-states', () => {
  it('F1. next null / missing content / missing template.root → documented guard error', () => {
    expect(() => run({ previous: [], next: null as never, change: null })).toThrow()
    expect(() =>
      run({ previous: [], next: { template: { root: { type: 'div' } }, content: [] } as never, change: null }),
    ).not.toThrow() // valid empty envelope is fine
    expect(() =>
      run({ previous: [], next: { content: [] } as never, change: null }),
    ).toThrow()
  })

  it('F2. a root with a non-string / missing props.id → skipped, no throw', () => {
    const bad = { type: 'div', props: { id: 42 }, content: 'x' } as unknown as LegacyNodeData
    const none = { type: 'div', content: 'x' } as unknown as LegacyNodeData
    const next = envelope([bad, none, root('a')])
    const r = run({ previous: [], next, change: change([]) })
    expect(ids(r.added)).toEqual(['a'])
  })

  it('F3. duplicate cssId within next → first wins, duplicate skipped', () => {
    const next = envelope([root('a', 'first'), root('a', 'second')])
    const r = run({ previous: [], next, change: change([]) })
    expect(ids(r.added)).toEqual(['a'])
  })

  it('F4. previous has a root absent from next AND a changed id → removed wins', () => {
    const prev = [root('gone'), root('a')]
    const next = envelope([root('a', 'edited')])
    const r = run({ previous: prev, next, change: change(['gone', 'a'], 'structural') })
    expect(ids(r.removed)).toEqual(['gone'])
    expect(ids(r.replaced)).toEqual(['a'])
  })

  it('F5. empty nodeIds + kind=content → no replace, fallback NOT triggered', () => {
    const prev = [root('a')]
    const next = envelope([root('a')])
    const r = run({ previous: prev, next, change: change([]) })
    expect(r.replaced).toEqual([])
    expect(r.usedFallback).toBe(false)
  })

  it('F6. malformed change (missing arrays) → treated as null → fallback, no throw', () => {
    const prev = [root('a', 'old')]
    const next = envelope([root('a', 'new')])
    const r = run({ previous: prev, next, change: { kind: 'content' } as never })
    expect(r.usedFallback).toBe(true)
    expect(ids(r.replaced)).toEqual(['a'])
  })
})
