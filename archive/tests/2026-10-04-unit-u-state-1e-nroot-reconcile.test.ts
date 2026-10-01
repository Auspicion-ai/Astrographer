// tests/unit-u-state-1e-nroot-reconcile.test.ts — Unit U-STATE-1e: the N-root
// multi-document reconcile + per-root identity replace.
//
// TestWriter RED set written from docs/specs/unit-u-state-1e-nroot-reconcile.md
// §2 (contract) + §3 (states 1–10) + §4 (F1–F8) + the H1/H2/L adversarial
// findings BEFORE the ratified implementation. All fixtures are authored from
// the spec ALONE.
//
// RE-ANCHORED 2026-09-12 (first): `next` is ONE traversal envelope PER OPEN
// DOCUMENT; `DocumentRoot.root` is the previous root NODE (`LegacyNodeData`);
// `identityReplaced` is the explicit bucket.
//
// THIRD re-anchor 2026-09-12 (this pass — the adversarial resolution): the
// ratified §2.2 contract is now:
//
//   1. The result buckets (`added`/`replaced`/`removed`/`kept`) are
//      `ScopedRoot[]` = `{ cssId, ragNodeId, documentId }` — every bucket entry
//      carries its owning `documentId` (panes use `''`). Assertions read the
//      `(documentId, cssId)` key, not `cssId` alone.
//   2. Roots are keyed by `(documentId, cssId)`. A cross-document swap/move is
//      PER-DOCUMENT: A removes its own id + adds the newcomer; B does the
//      mirror — never a single global `kept`/`added`/`removed` (the state-9
//      drift pin is corrected here).
//   3. The identity `consumed`/`identTo`/`identFrom` filters are
//      DOCUMENT-SCOPED: A's identity replace must not suppress B's own
//      same-cssId add (H2a/P10) or remove (H2b/P11).
//   4. Duplicate `documentIds` are de-duped before the ordered traverse (L1).
//   5. Single-root no-regression holds for NON-identity changes; an identity
//      replace deliberately diverges into `identityReplaced`, NOT
//      `removed` + `added` (L3).
//   6. H3 (the host apply ignores `documentId`) stays deferred/documented —
//      the reconciler half is pinned here; the per-document id-namespace/mount
//      is U-SHELL-9b's.
//
// The `nroot` seam resolves the (per this contract, not-yet-ratified) export:
// a missing export, or an export that still returns the pre-amendment UN-SCOPED
// buckets, is reported as the RED implementation failure.
//
// ---------------------------------------------------------------------------
// Behavior derived from the spec ALONE.
//
// SPEC AMBIGUITIES flagged (NOT invented around; see the TestWriter report):
//
//  R1. `DocumentRoot.root` carries the previous root NODE (`LegacyNodeData`),
//      so the N-root reconciler receives the previous subtree and can
//      shape-compare exactly as 1a does. A clean content change classifies by
//      the `change.nodeIds` payload + the `(documentId, cssId)` set difference
//      AND the landed shape-compare; a `structural`/edge-bearing change runs
//      the full-subgraph fallback; a `null`/malformed change is the fallback
//      too. Single-root no-regression (state 8) is therefore expressible in
//      full, including the shape-only case where old and new are IDENTICAL.
//
//  R2. Panes (`pane-<id>`) "are not document-scoped" and are "reconciled
//      separately": they are keyed by `cssId` ONLY and their bucket entries
//      carry `documentId: ''`, never the envelope's document (F7). The exact
//      pane carrier scope is the host's (U-STATE-1b/1c); the reconciler half is
//      `cssId`-keyed and `''`-scoped.
//
//  R3. Identity-replace detection: a document whose previous root vanished and
//      whose next root is new, with the `change` payload naming BOTH, is
//      emitted as `identityReplaced` (not `removed` + `added`). The red set
//      pins that linkage (state 6); a fabricated id change without a payload
//      link is not pinned here.
//
//  R4. §4 F6 (a fork batch fails mid-commit → no partial mutation) and §3 state
//      10 (`loadEnvelope` 0×) are HOST/store concerns, asserted at the host
//      seam as far as the pinned surface allows.
// ---------------------------------------------------------------------------
import { describe, it, expect, beforeAll, vi } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { reconcileContentRoots } from '../src/renderer/content-reconcile.js'
import * as reconcile from '../src/renderer/content-reconcile.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// Spec §2.2 RATIFIED shape, mirrored locally (the module's export is RED).
// ---------------------------------------------------------------------------
interface MaterializedRoot {
  cssId: string
  ragNodeId: string
}
/** §2.2 — every result bucket entry carries its owning document (panes `''`). */
interface ScopedRoot extends MaterializedRoot {
  documentId: string
}
interface DocumentRoot {
  documentId: string
  root: LegacyNodeData
}
interface ReconcileChange {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}
interface DocumentEnvelope {
  documentId: string
  envelope: LegacyInitialData
}
interface NRootReconcileInput {
  previous: DocumentRoot[]
  next: DocumentEnvelope[]
  change: ReconcileChange | null
  documentIds: string[]
}
interface NRootReconcileResult {
  added: ScopedRoot[]
  replaced: ScopedRoot[]
  removed: ScopedRoot[]
  kept: ScopedRoot[]
  usedFallback: boolean
  identityReplaced: { documentId: string; from: MaterializedRoot; to: MaterializedRoot }[]
}
interface NRootModule {
  reconcileDocumentRoots(input: NRootReconcileInput): NRootReconcileResult
}

/** Resolve the (currently mis-shaped) N-root reconciler. A missing export, or an
 *  export that still returns the pre-amendment UN-SCOPED buckets, is the
 *  expected RED; each such test fails with this message, not a raw TypeError. */
function nroot(input: NRootReconcileInput): NRootReconcileResult {
  const fn = (reconcile as unknown as Partial<NRootModule>).reconcileDocumentRoots
  if (typeof fn !== 'function') {
    throw new Error(
      'reconcileDocumentRoots is not implemented (U-STATE-1e RED — needs the Implementer)',
    )
  }
  const result = fn(input)
  const scoped = [
    ...(result.added ?? []),
    ...(result.replaced ?? []),
    ...(result.removed ?? []),
    ...(result.kept ?? []),
  ]
  if (scoped.some((r) => typeof (r as { documentId?: unknown }).documentId !== 'string')) {
    throw new Error(
      'reconcileDocumentRoots does not return ScopedRoot buckets (U-STATE-1e RED — needs the Implementer)',
    )
  }
  return result
}

// ---------------------------------------------------------------------------
// Fixtures — envelope nodes (NOT RagStore stubs; the 1a §3.4 precedent).
// ---------------------------------------------------------------------------

/** A document content root (`rag-<id>`), optionally with nested doc-children. */
function rag(ragNodeId: string, content = '', children: LegacyNodeData[] = []): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${ragNodeId}` }, content, children }
}

/** A pane content root (`pane-<id>`) — an app-graph pane. */
function pane(id: string, content = 'pane'): LegacyNodeData {
  return { type: 'div', props: { id }, content }
}

/** The traversal-style envelope: one content payload per root, in render order
 *  (the `buildTraversal` push shape). */
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: roots.map((r) => ({ content: [r] })),
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** A previously materialized, document-scoped root (spec §2.2 `DocumentRoot`).
 *  `.root` is the previous root NODE (`LegacyNodeData`), scoped by `documentId`
 *  — so the landed content shape-compare (and single-root no-regression) holds.
 *  The result buckets are `ScopedRoot` descriptors carrying `documentId`. */
function droot(documentId: string, node: LegacyNodeData): DocumentRoot {
  return { documentId, root: node }
}

/** A per-open-document traversal envelope (spec §2.2 `next` entry). */
function doc(documentId: string, roots: LegacyNodeData[]): DocumentEnvelope {
  return { documentId, envelope: envelope(roots) }
}

function change(
  nodeIds: string[],
  kind: 'content' | 'structural' = 'content',
  edgeIds: string[] = [],
): ReconcileChange {
  return { kind, nodeIds, edgeIds }
}

function ids(list: MaterializedRoot[]): string[] {
  return list.map((r) => r.ragNodeId)
}

/** The §2.2 `(documentId, cssId)` key — the unambiguous N-root identity. */
function keys(list: ScopedRoot[]): string[] {
  return list.map((r) => `${r.documentId}|${r.ragNodeId}`)
}

function run(input: NRootReconcileInput): NRootReconcileResult {
  return nroot(input)
}

// ===========================================================================
// §3 — States (valid paths)
// ===========================================================================

describe('U-STATE-1e — §3 states', () => {
  it('1. two document ids materialized → both roots returned; neither is a pane', () => {
    const previous = [droot('A', rag('a')), droot('B', rag('b'))]
    const next = [doc('A', [rag('a')]), doc('B', [rag('b')])]
    const r = run({ previous, next, change: change([]), documentIds: ['A', 'B'] })
    expect(keys(r.kept)).toEqual(['A|a', 'B|b'])
    expect(r.added).toEqual([])
    expect(r.replaced).toEqual([])
    expect(r.removed).toEqual([])
    for (const e of [...r.kept, ...r.added, ...r.replaced, ...r.removed]) {
      expect(e.cssId.startsWith('pane-')).toBe(false)
    }
  })

  it('2. a content change editing A → only A replaced; B kept; template/zone not bucketed', () => {
    const previous = [droot('A', rag('a')), droot('B', rag('b'))]
    const next = [doc('A', [rag('a', 'edited')]), doc('B', [rag('b')])]
    const r = run({ previous, next, change: change(['a']), documentIds: ['A', 'B'] })
    expect(keys(r.replaced)).toEqual(['A|a'])
    expect(keys(r.kept)).toEqual(['B|b'])
    expect(r.added).toEqual([])
    expect(r.removed).toEqual([])
    const all = [...r.kept, ...r.added, ...r.replaced, ...r.removed]
    expect(all.some((e) => e.cssId === 'root' || e.cssId === 'zone:main')).toBe(false)
  })

  it('3. a structural change adding document C → C attaches; A/B kept', () => {
    const previous = [droot('A', rag('a')), droot('B', rag('b'))]
    const next = [doc('A', [rag('a')]), doc('B', [rag('b')]), doc('C', [rag('c')])]
    const r = run({
      previous,
      next,
      change: change(['c'], 'structural', ['e-doc-c']),
      documentIds: ['A', 'B', 'C'],
    })
    expect(keys(r.added)).toEqual(['C|c'])
    expect(keys(r.kept)).toEqual(['A|a', 'B|b'])
    expect(r.replaced).toEqual([])
    expect(r.removed).toEqual([])
    expect(r.usedFallback).toBe(true)
  })

  it('4. a structural change removing document B → B destroyed; A/C kept', () => {
    const previous = [droot('A', rag('a')), droot('B', rag('b')), droot('C', rag('c'))]
    const next = [doc('A', [rag('a')]), doc('C', [rag('c')])]
    const r = run({
      previous,
      next,
      change: change(['b'], 'structural', ['e-doc-b']),
      documentIds: ['A', 'C'],
    })
    expect(keys(r.removed)).toEqual(['B|b'])
    expect(keys(r.kept)).toEqual(['A|a', 'C|c'])
    expect(r.usedFallback).toBe(true)
  })

  it('5a. a shared RAG node in A and B is TWO distinct roots — a change replaces both (per-document envelopes, §8)', () => {
    const previous = [droot('A', rag('X')), droot('B', rag('X'))]
    const next = [doc('A', [rag('X')]), doc('B', [rag('X')])]
    const r = run({ previous, next, change: change(['X']), documentIds: ['A', 'B'] })
    // A cssId-only key would collapse the two `(A, rag-X)`/`(B, rag-X)` roots.
    expect(keys(r.replaced)).toEqual(['A|X', 'B|X'])
    expect(r.kept).toEqual([])
  })

  it('5b. a change to a node only in A leaves B’s shared root kept', () => {
    const previous = [droot('A', rag('X')), droot('A', rag('a2')), droot('B', rag('X'))]
    const next = [doc('A', [rag('X'), rag('a2', 'edited')]), doc('B', [rag('X')])]
    const r = run({ previous, next, change: change(['a2']), documentIds: ['A', 'B'] })
    expect(keys(r.replaced)).toEqual(['A|a2'])
    // Both shared `rag-X` roots (A's and B's) stay kept.
    expect(keys(r.kept)).toEqual(['A|X', 'B|X'])
  })

  it('6. per-root identity replace: a fork in A changes rag-X → rag-X′; B’s rag-X kept unchanged', () => {
    const previous = [droot('A', rag('X')), droot('B', rag('X'))]
    const next = [doc('A', [rag('Xprime')]), doc('B', [rag('X')])]
    const r = run({ previous, next, change: change(['X', 'Xprime']), documentIds: ['A', 'B'] })
    expect(r.identityReplaced).toHaveLength(1)
    expect(r.identityReplaced[0].documentId).toBe('A')
    expect(r.identityReplaced[0].from.cssId).toBe('rag-X')
    expect(r.identityReplaced[0].to.cssId).toBe('rag-Xprime')
    // B's original root is untouched — the identity change is A-only.
    expect(keys(r.kept)).toEqual(['B|X'])
    expect(r.replaced).toEqual([])
  })

  it('7. usedFallback: clean content false; structural/edge-bearing/null true', () => {
    const previous = [droot('A', rag('a'))]
    const next = [doc('A', [rag('a', 'e')])]
    expect(run({ previous, next, change: change(['a']), documentIds: ['A'] }).usedFallback).toBe(false)
    expect(
      run({ previous, next, change: change(['a'], 'structural'), documentIds: ['A'] }).usedFallback,
    ).toBe(true)
    expect(
      run({ previous, next, change: change(['a'], 'content', ['e-1']), documentIds: ['A'] }).usedFallback,
    ).toBe(true)
    expect(run({ previous, next, change: null, documentIds: ['A'] }).usedFallback).toBe(true)
  })

  it('8. single-root no-regression: N-root result equals reconcileContentRoots for one document', () => {
    const prevNode = rag('a', 'old')
    const nextEnv = envelope([rag('a', 'new')])
    const next = [{ documentId: 'A', envelope: nextEnv }]
    const ch = change(['a'])
    const n = run({ previous: [droot('A', prevNode)], next, change: ch, documentIds: ['A'] })
    const s = reconcileContentRoots({ previous: [prevNode], next: nextEnv, change: ch })
    expect(ids(n.added)).toEqual(ids(s.added))
    expect(ids(n.replaced)).toEqual(ids(s.replaced))
    expect(ids(n.removed)).toEqual(ids(s.removed))
    expect(ids(n.kept)).toEqual(ids(s.kept))
    expect(n.usedFallback).toBe(s.usedFallback)
    // Every single-root bucket entry is scoped to the one document.
    expect(
      [...n.kept, ...n.added, ...n.replaced, ...n.removed].every((e) => e.documentId === 'A'),
    ).toBe(true)

    // A full-subgraph (change=null) single-root case matches too.
    const n2 = run({ previous: [droot('A', prevNode)], next, change: null, documentIds: ['A'] })
    const s2 = reconcileContentRoots({ previous: [prevNode], next: nextEnv, change: null })
    expect(ids(n2.replaced)).toEqual(ids(s2.replaced))
    expect(n2.usedFallback).toBe(s2.usedFallback)
  })

  it('9. determinism: two runs deep-equal; a cross-document swap is PER-DOCUMENT (keyed by (documentId, cssId))', () => {
    // A: a→b, B: b→a. Per-document: A removes `a` + adds `b`; B removes `b` +
    // adds `a`. A cssId-only/global key would instead report a global
    // `kept=['b','a']` (the corrected drift pin).
    const previous = [droot('A', rag('a')), droot('B', rag('b'))]
    const next = [doc('A', [rag('b')]), doc('B', [rag('a')])]
    const input: NRootReconcileInput = { previous, next, change: change([]), documentIds: ['A', 'B'] }
    const r1 = run(input)
    const r2 = run(input)
    expect(r2).toEqual(r1)
    expect(keys(r1.added)).toEqual(['A|b', 'B|a'])
    expect(keys(r1.removed)).toEqual(['A|a', 'B|b'])
    expect(r1.kept).toEqual([])

    // `removed` follows `previous`'s order.
    const r3 = run({
      previous: [droot('A', rag('a')), droot('A', rag('a2')), droot('B', rag('b'))],
      next: [doc('A', []), doc('B', [rag('b')])],
      change: change(['a', 'a2'], 'structural', ['e-x']),
      documentIds: ['A', 'B'],
    })
    expect(keys(r3.removed)).toEqual(['A|a', 'A|a2'])
  })

  it('10. the content path calls loadEnvelope 0 times (C10)', () => {
    const hostRoot = (ragNodeId: string, content: string): LegacyNodeData => ({
      type: 'div',
      props: { id: `rag-${ragNodeId}` },
      content,
      placement: { targetPlacement: ['main'] },
    })
    const hostEnvelope = (roots: LegacyNodeData[]): LegacyInitialData => ({
      template: {
        root: {
          type: 'div',
          props: { id: 'shell' },
          children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
        },
      },
      content: roots.map((r) => ({ content: [r] })),
      clientConfig: { runInstantiation: true, runRendering: true },
    })

    const spy = vi.spyOn(
      Runtime.prototype as unknown as { loadEnvelope: (...a: unknown[]) => unknown },
      'loadEnvelope',
    )
    try {
      const runtime = new Runtime({
        mount: mountEl() as never,
        envelope: hostEnvelope([hostRoot('docA', 'A'), hostRoot('docB', 'B')]) as never,
      })
      const hostNext = hostEnvelope([hostRoot('docA', 'A2'), hostRoot('docB', 'B')])
      const result = run({
        previous: [droot('A', hostRoot('docA', 'A')), droot('B', hostRoot('docB', 'B'))],
        next: [
          doc('A', [hostRoot('docA', 'A2')]),
          doc('B', [hostRoot('docB', 'B')]),
        ],
        change: change(['docA']),
        documentIds: ['A', 'B'],
      })
      ;(runtime as unknown as { applyContentReconcile: (i: unknown) => unknown }).applyContentReconcile({
        result,
        next: hostNext,
      })
      expect(spy).not.toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
  })
})

// ===========================================================================
// §4 — Fail-states / edge cases
// ===========================================================================

describe('U-STATE-1e — §4 fail-states', () => {
  it('F1. a documentId in documentIds absent from next → no roots for it, never throws (set difference)', () => {
    const input: NRootReconcileInput = {
      previous: [],
      next: [doc('B', [rag('b')])],
      change: change([]),
      documentIds: ['A', 'B'],
    }
    expect(() => run(input)).not.toThrow()
    const r = run(input)
    expect(keys(r.added)).toEqual(['B|b'])
    // No phantom root for the doc absent from next.
    expect([...r.added, ...r.replaced, ...r.removed, ...r.kept].some((e) => e.ragNodeId === 'a')).toBe(false)
  })

  it('F2. an empty documentIds → no-op result (the boot/empty-store full load is A7)', () => {
    const r = run({ previous: [], next: [], change: null, documentIds: [] })
    expect(r.added).toEqual([])
    expect(r.replaced).toEqual([])
    expect(r.removed).toEqual([])
    expect(r.kept).toEqual([])
    expect(r.identityReplaced).toEqual([])
  })

  it('F3. a malformed next / missing template.root / missing content → documented guard throw (1a F1)', () => {
    expect(() =>
      run({ previous: [], next: null as never, change: null, documentIds: ['A'] }),
    ).toThrow()
    expect(() =>
      run({
        previous: [],
        next: [{ documentId: 'A', envelope: { content: [] } as never }],
        change: null,
        documentIds: ['A'],
      }),
    ).toThrow()
    expect(() =>
      run({
        previous: [],
        next: [{ documentId: 'A', envelope: { template: { root: { type: 'div' } } } as never }],
        change: null,
        documentIds: ['A'],
      }),
    ).toThrow()
    // A valid template.root + content:[] is the empty-store envelope — fine.
    expect(() =>
      run({ previous: [], next: [doc('A', [])], change: null, documentIds: ['A'] }),
    ).not.toThrow()
  })

  it('F4. duplicate (documentId, cssId) in previous → first wins, deterministic', () => {
    const previous = [droot('A', rag('a', 'first')), droot('A', rag('a', 'second'))]
    const next = [doc('A', [rag('a', 'first')])]
    const r = run({ previous, next, change: change([]), documentIds: ['A'] })
    expect(keys(r.kept)).toEqual(['A|a'])
    const r2 = run({ previous, next, change: change([]), documentIds: ['A'] })
    expect(r2).toEqual(r)
  })

  it('F5. a rag- root in an envelope for a non-open document → never emitted (no phantom document)', () => {
    const r = run({
      previous: [],
      next: [doc('A', [rag('a')]), doc('B', [rag('ghost')])],
      change: change([]),
      documentIds: ['A'],
    })
    expect(keys(r.added)).toEqual(['A|a'])
    expect([...r.kept, ...r.replaced, ...r.removed].some((e) => e.ragNodeId === 'ghost')).toBe(false)
  })

  it('F6. the reconciler sees no change event on a failed fork batch → fallback, no partial mutation', () => {
    // The store atomicity (BATCH-ATOMICITY-API) is a HOST/store concern; the
    // reconciler-visible contract is that no `rag-store-changed` payload arrives
    // (change=null) and the reconcile is a coherent full-subgraph pass.
    const r = run({
      previous: [droot('A', rag('a', 'old'))],
      next: [doc('A', [rag('a', 'new')])],
      change: null,
      documentIds: ['A'],
    })
    expect(r.usedFallback).toBe(true)
    expect(keys(r.replaced)).toEqual(['A|a'])
  })

  it('F7. a pane- root is reconciled separately (cssId-keyed, shape-compared always), never attributed to a document', () => {
    const previous: DocumentRoot[] = [
      droot('A', rag('a')),
      { documentId: '', root: pane('pane-x') },
    ]
    const next = [doc('A', [rag('a'), pane('pane-x', 'new')])]
    const r = run({ previous, next, change: change([]), documentIds: ['A'] })
    // A pane is refreshed even on a clean content change (the 1a pane rule)...
    const paneEntry = r.replaced.find((e) => e.cssId === 'pane-x')
    expect(paneEntry).toBeDefined()
    // ...and is never attributed to the envelope's document (pane scope = '').
    expect(paneEntry?.documentId).toBe('')
    // ...but never an identity-replaced document root.
    expect(
      r.identityReplaced.every(
        (e) => !e.from.cssId.startsWith('pane-') && !e.to.cssId.startsWith('pane-'),
      ),
    ).toBe(true)
  })

  it('F8. a mounted document not in documentIds (stale) → dropped; never kept/added', () => {
    const r = run({
      previous: [droot('A', rag('a')), droot('B', rag('b'))],
      next: [doc('A', [rag('a')])],
      change: change([]),
      documentIds: ['A'],
    })
    expect(keys(r.kept)).toEqual(['A|a'])
    expect(ids(r.kept)).not.toContain('b')
    expect(ids(r.added)).not.toContain('b')
  })

  // -- Blind-test FAIL regressions (greens §FAIL: F2/F5/F8) -----------------
  // A previous root whose non-empty `documentId` is NOT in `documentIds` must
  // be excluded from the N-root set entirely (no-op for an empty documentIds,
  // no phantom document, dropped-not-removed for a stale mount). Panes
  // (`documentId: ''`) keep the prior classification.

  it('F2reg. empty documentIds with a previous root → no-op result (all buckets empty)', () => {
    const r = run({
      previous: [droot('A', rag('X'))],
      next: [doc('A', [rag('X')])],
      change: change([]),
      documentIds: [],
    })
    expect(r.added).toEqual([])
    expect(r.replaced).toEqual([])
    expect(r.removed).toEqual([])
    expect(r.kept).toEqual([])
    expect(r.identityReplaced).toEqual([])
  })

  it('F5reg. a previous root scoped to a non-open document → never emitted in any bucket', () => {
    const r = run({
      previous: [droot('Z', rag('X')), droot('A', rag('a'))],
      next: [doc('A', [rag('a')])],
      change: change([]),
      documentIds: ['A'],
    })
    const all = [...r.added, ...r.replaced, ...r.removed, ...r.kept]
    expect(all.some((e) => e.ragNodeId === 'X')).toBe(false)
    expect(keys(r.kept)).toEqual(['A|a'])
  })

  it('F8reg. a previous root whose documentId ∉ documentIds is dropped, not removed', () => {
    const r = run({
      previous: [droot('A', rag('a')), droot('B', rag('b'))],
      next: [doc('A', [rag('a')])],
      change: change([]),
      documentIds: ['A'],
    })
    expect(keys(r.kept)).toEqual(['A|a'])
    expect(keys(r.removed)).toEqual([])
    const all = [...r.added, ...r.replaced, ...r.removed, ...r.kept]
    expect(all.some((e) => e.ragNodeId === 'b')).toBe(false)
  })
})

// ===========================================================================
// §2.2 — Adversarial regressions (H1/H2 cross-document correctness; L1/L3)
// ===========================================================================

describe('U-STATE-1e — §2.2 adversarial regressions', () => {
  it('H1a. a root moving A → B is removed from A and added to B (never global kept)', () => {
    const previous = [droot('A', rag('X'))]
    const next = [doc('B', [rag('X')])]
    const r = run({ previous, next, change: change([]), documentIds: ['A', 'B'] })
    expect(keys(r.removed)).toEqual(['A|X'])
    expect(keys(r.added)).toEqual(['B|X'])
    expect(r.kept).toEqual([])
  })

  it('H1b. A drops a shared X (next has only B) → (A,X) removed; (B,X) kept, not replaced', () => {
    const previous = [droot('A', rag('X')), droot('B', rag('X'))]
    const next = [doc('B', [rag('X')])]
    const r = run({ previous, next, change: change([]), documentIds: ['A', 'B'] })
    expect(keys(r.removed)).toEqual(['A|X'])
    expect(keys(r.kept)).toEqual(['B|X'])
    expect(ids(r.replaced)).not.toContain('X')
  })

  it('H2a (P10). A identity-replaces X→X′; B’s new X′ is still added (filters are document-scoped)', () => {
    const previous = [droot('A', rag('X'))]
    const next = [doc('A', [rag('Xprime')]), doc('B', [rag('Xprime')])]
    const r = run({ previous, next, change: change(['X', 'Xprime']), documentIds: ['A', 'B'] })
    // A's identity replace must not suppress B's own `X′` add.
    expect(keys(r.added)).toEqual(['B|Xprime'])
    expect(r.identityReplaced).toHaveLength(1)
    expect(r.identityReplaced[0].documentId).toBe('A')
    expect(r.identityReplaced[0].to.cssId).toBe('rag-Xprime')
  })

  it('H2b (P11). A identity-replaces X→X′; B’s vanished X is still removed (filters are document-scoped)', () => {
    const previous = [droot('A', rag('X')), droot('B', rag('X'))]
    const next = [doc('A', [rag('Xprime')])]
    const r = run({ previous, next, change: change(['X', 'Xprime']), documentIds: ['A', 'B'] })
    // A's identity replace must not suppress B's own `X` removal.
    expect(keys(r.removed)).toEqual(['B|X'])
    expect(r.identityReplaced).toHaveLength(1)
    expect(r.identityReplaced[0].documentId).toBe('A')
    expect(r.identityReplaced[0].from.cssId).toBe('rag-X')
  })

  it('L1. duplicate documentIds (A,A) are de-duped → one bucket entry, no duplicates', () => {
    const previous = [droot('A', rag('a'))]
    const next = [doc('A', [rag('a')])]
    const r = run({ previous, next, change: change([]), documentIds: ['A', 'A'] })
    expect(keys(r.kept)).toEqual(['A|a'])
    expect(r.kept).toHaveLength(1)
    expect(keys(r.added)).toEqual([])
    expect(keys(r.removed)).toEqual([])
  })

  it('L3. single-root no-regression for non-identity; identity diverges into identityReplaced (not removed+added)', () => {
    // Non-identity single-root: N-root equals reconcileContentRoots.
    const prevNode = rag('a', 'old')
    const nextEnv = envelope([rag('a', 'new')])
    const next = [doc('A', [rag('a', 'new')])]
    const ch = change(['a'])
    const n = run({ previous: [droot('A', prevNode)], next, change: ch, documentIds: ['A'] })
    const s = reconcileContentRoots({ previous: [prevNode], next: nextEnv, change: ch })
    expect(ids(n.added)).toEqual(ids(s.added))
    expect(ids(n.replaced)).toEqual(ids(s.replaced))
    expect(ids(n.removed)).toEqual(ids(s.removed))
    expect(ids(n.kept)).toEqual(ids(s.kept))
    expect(n.usedFallback).toBe(s.usedFallback)
    expect(
      [...n.kept, ...n.added, ...n.replaced, ...n.removed].every((e) => e.documentId === 'A'),
    ).toBe(true)

    // Identity single-root: the pair is identityReplaced, NOT removed + added.
    const ni = run({
      previous: [droot('A', rag('X'))],
      next: [doc('A', [rag('Xprime')])],
      change: change(['X', 'Xprime']),
      documentIds: ['A'],
    })
    expect(ni.identityReplaced).toHaveLength(1)
    expect(ni.identityReplaced[0].documentId).toBe('A')
    expect(ni.removed).toEqual([])
    expect(ni.added).toEqual([])
  })
})
