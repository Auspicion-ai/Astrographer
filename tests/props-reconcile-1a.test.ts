// tests/props-reconcile-1a.test.ts — Unit U-STATE-1a: deterministic PROPERTY
// (PBT) backfill of the §5.7 Property register of
// docs/specs/unit-u-state-1a-content-reconcile.md.
//
// This file is the PBT backfill for the ALREADY-LANDED single-root reconciler
// surface (`reconcileContentRoots` + its pure helpers). The code is IMPLEMENTED
// — this suite is expected GREEN; any FAIL is a finding (do not weaken).
// Register rows asserted: P-IM-1, P-IM-2, P-SM-1, P-SM-2, P-TP-1, P-TP-2,
// P-TP-3 (IM ×2, SM ×2, TP ×3 = 7 rows ≤ 8).
//
// Scoping note (observable surface): the §5.7 register names the pure helpers
// `canonical` / `shapeOf` / `shapeProjection` / `projectionProps` /
// `asContentRoot` as they exist in `src/renderer/content-reconcile.ts`. Those
// helpers are PRIVATE (not exported) and the TestWriter contract forbids
// touching `src/`, so the transform/state rows P-TP-1 / P-TP-2 / P-TP-3 are
// observed through the PUBLIC `reconcileContentRoots` surface (bucket
// classification is a direct consequence of the canonical / shape projection),
// and P-TP-3 additionally drives the EXPORTED `plainRagId` helper directly
// (the documented addressing-key component of `asContentRoot`). No row reaches
// into the U-STATE-1e N-root surface (`reconcileDocumentRoots` /
// `DocumentRoot` / `NRootReconcile*`) — that is U-STATE-1e's register.
import { describe, expect, it } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import {
  reconcileContentRoots,
  type MaterializedRoot,
  type ReconcileChange,
} from '../src/renderer/content-reconcile.js'
import { plainRagId } from '../src/renderer/cross-document-shared.js'

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG + the attempt-loop convention (mulberry32, pinned
// seed, ≤100/row, ≤400 total, stop-after-5) — matching the sibling
// props-shell-integration / unit-ujr1-get-journal PBT gate.
// ---------------------------------------------------------------------------
const PBT_SEED = 0x51a1e1a1 // this unit's pinned seed (≤400 total budget)
const PBT_ATTEMPTS = 40 // 7 rows × 40 = 280 ≤ 400 total
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function randString(rng: () => number): string {
  return 'x' + Math.floor(rng() * 1e9).toString(36)
}
function runProperty(
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null,
): { row: string; strategyId: string; held: boolean; counterexamples: string[]; attempts: number } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, held: counterexamples.length === 0, counterexamples, attempts: PBT_ATTEMPTS }
}

// ---------------------------------------------------------------------------
// Envelope fixtures — envelope nodes, NOT RagStore stubs (spec §3.4).
// ---------------------------------------------------------------------------
function cn(
  id: unknown,
  extras: { content?: unknown; children?: LegacyNodeData[]; props?: Record<string, unknown> } = {},
): LegacyNodeData {
  const props = extras.props ? { id, ...extras.props } : { id: id as string }
  return { type: 'div', props: props as Record<string, unknown>, content: extras.content ?? 'c', children: extras.children ?? [] }
}
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: [{ content: roots }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
/** The documented `asContentRoot` classification (mirrors content-reconcile.ts
 *  §2.7 + the pane rule), used to compute EXPECTED bucket entries from the
 *  exported `plainRagId` helper. */
function expectedContentRoot(node: LegacyNodeData): MaterializedRoot | null {
  const props = node.props as Record<string, unknown> | undefined
  const id = props?.id
  if (typeof id !== 'string') return null
  if (id.startsWith('pane-') && id.length > 'pane-'.length) return { cssId: id, ragNodeId: id }
  if (id.startsWith('rag-') && id.length > 'rag-'.length) {
    const ragNodeId = plainRagId(props) ?? id.slice('rag-'.length)
    return { cssId: id, ragNodeId }
  }
  return null
}
function deepEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
function cssIds(list: MaterializedRoot[]): string[] {
  return list.map((m) => m.cssId)
}

describe('U-STATE-1a §5.7 the PBT register (deterministic mulberry32)', () => {
  // -------------------------------------------------------------------------
  // Class: IM (input-model)
  // -------------------------------------------------------------------------
  it('P-IM-1 [strat:reconcile-total-deterministic] `reconcileContentRoots` is total on well-formed input + deep-equal on repeat', () => {
    const rep = runProperty('P-IM-1', 'strat:reconcile-total-deterministic', (_i, rng) => {
      // Build a well-formed `next` envelope: `template.root` + a `content`
      // payload carrying 1–4 content roots (rag-* / pane-*, optional nested
      // rag doc-child, optional authored `data-rag-node-id`).
      const nextRoots: LegacyNodeData[] = []
      const n = 1 + Math.floor(rng() * 4)
      for (let k = 0; k < n; k++) {
        const doc = rng() < 0.6
        const id = (doc ? 'rag-' : 'pane-') + randString(rng)
        const props: Record<string, unknown> = {}
        if (doc && rng() < 0.4) props['data-rag-node-id'] = id.slice(4)
        const children: LegacyNodeData[] = rng() < 0.4 ? [cn('rag-' + randString(rng), { content: 'child' })] : []
        nextRoots.push(cn(id, { props, children }))
      }
      const next = envelope(nextRoots)
      // `previous`: a mix of shared next roots + prev-only roots + NON-CONTENT
      // junk (missing id, non-string id, inline, null, non-array) — the
      // register's totality holds for ANY `previous` roots array.
      const previous: LegacyNodeData[] = []
      for (const r of nextRoots) if (rng() < 0.6) previous.push(r)
      for (let k = 0; k < Math.floor(rng() * 3); k++) previous.push(cn('rag-' + randString(rng), { content: 'prev-only' }))
      if (rng() < 0.3) previous.push(cn('inline-' + randString(rng)))
      if (rng() < 0.2) previous.push({ type: 'div', props: {}, content: 'no-id' })
      if (rng() < 0.2) previous.push({ type: 'div', props: { id: 42 }, content: 'num' })
      if (rng() < 0.1) previous.push(null as unknown as LegacyNodeData)
      // `change`: a valid change OR null OR a malformed descriptor (F6 — the
      // register says a well-formed input never throws / always returns).
      const sid = randString(rng)
      const change = pick(rng, [
        null,
        { kind: 'content', nodeIds: [], edgeIds: [] },
        { kind: 'content', nodeIds: [sid], edgeIds: [] },
        { kind: 'content', nodeIds: [], edgeIds: [sid] },
        { kind: 'structural'.length === 'structural'.length ? 'structural' : 'structural', nodeIds: [], edgeIds: [sid] },
        { kind: 'content' as 'content', nodeIds: 'bad', edgeIds: [] },
        { kind: 'nonsense' as 'content', nodeIds: [], edgeIds: [] },
      ] as ReconcileChange[])

      let r1: { added: unknown; replaced: unknown; removed: unknown; kept: unknown; usedFallback: unknown } | null = null
      let r2: typeof r1 = null
      try {
        const input = { previous, next, change }
        r1 = reconcileContentRoots(input)
        r2 = reconcileContentRoots(input)
      } catch (e) {
        return `totality violated for a WELL-FORMED next — threw ${String(e)}`
      }
      // Result shape: {added,replaced,removed,kept} arrays of {cssId,ragNodeId}
      // + usedFallback a boolean (spec §2).
      for (const key of ['added', 'replaced', 'removed', 'kept'] as const) {
        const arr = r1![key]
        if (!Array.isArray(arr)) return `${key} is not an array`
        for (const m of arr as unknown[]) {
          const o = m as Record<string, unknown>
          if (typeof o.cssId !== 'string' || typeof o.ragNodeId !== 'string') {
            return `${key} entry not {cssId:string,ragNodeId:string}: ${JSON.stringify(m)}`
          }
        }
      }
      if (typeof r1.usedFallback !== 'boolean') return `usedFallback not a boolean`
      // Determinism — two immediate calls deep-equal.
      if (!deepEq(r1, r2)) return `determinism violated: first=${JSON.stringify(r1)} second=${JSON.stringify(r2)}`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  it('P-IM-2 [strat:reconcile-idempotent] same envelope as `previous` + a no-op content change → all `kept`, other buckets empty', () => {
    const rep = runProperty('P-IM-2', 'strat:reconcile-idempotent', (_i, rng) => {
      const roots: LegacyNodeData[] = []
      const n = 1 + Math.floor(rng() * 4)
      for (let k = 0; k < n; k++) {
        const doc = rng() < 0.6
        const id = (doc ? 'rag-' : 'pane-') + randString(rng)
        const props: Record<string, unknown> = {}
        if (doc && rng() < 0.3) props['data-rag-node-id'] = id.slice(4)
        const children: LegacyNodeData[] = rng() < 0.3 ? [cn('rag-' + randString(rng))] : []
        roots.push(cn(id, { props, children }))
      }
      const next = envelope(roots)
      const previous = roots.slice() // identical nodes (shapes equal)
      const input = {
        previous,
        next,
        change: { kind: 'content' as const, nodeIds: [], edgeIds: [] },
      }
      let r: ReturnType<typeof reconcileContentRoots>
      try {
        r = reconcileContentRoots(input)
      } catch (e) {
        return `threw ${String(e)}`
      }
      if (r.added.length !== 0 || r.replaced.length !== 0 || r.removed.length !== 0) {
        return `non-empty buckets under idempotence: ${JSON.stringify({ added: r.added, replaced: r.replaced, removed: r.removed })}`
      }
      if (r.usedFallback !== false) return `usedFallback=${r.usedFallback} (clean content expected false)`
      // kept = all of R in `next` order, with faithful {cssId, ragNodeId}.
      const want = roots
        .map((nd) => expectedContentRoot(nd))
        .filter((m): m is MaterializedRoot => m != null)
        .map((m) => `${m.cssId}=${m.ragNodeId}`)
        .join('|')
      const got = r.kept.map((m) => `${m.cssId}=${m.ragNodeId}`).join('|')
      if (got !== want) return `kept=[${got}] != expected [${want}]`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Class: SM (state-model)
  // -------------------------------------------------------------------------
  it('P-SM-1 [strat:reconcile-bucket-partition] lossless, non-duplicating four-bucket partition (content roots only)', () => {
    const rep = runProperty('P-SM-1', 'strat:reconcile-bucket-partition', (_i, rng) => {
      const pool = Array.from({ length: 6 }, (_, k) => (rng() < 0.5 ? 'rag-' : 'pane-') + 's' + k)
      const prevSel = new Set(pool.filter(() => rng() < 0.6))
      const nextSel = new Set(pool.filter(() => rng() < 0.6))
      const shuffle = (arr: string[]): string[] => [...arr].sort((a, b) => rng() - rng())
      const previous = shuffle([...prevSel]).map((pid) => cn(pid, { props: rng() < 0.3 && pid.startsWith('rag-') ? { 'data-rag-node-id': pid.slice(4) } : {} }))
      const nextRoots = shuffle([...nextSel]).map((pid) => cn(pid, { props: rng() < 0.3 && pid.startsWith('rag-') ? { 'data-rag-node-id': pid.slice(4) } : {} }))
      const next = envelope(nextRoots)
      const sid = randString(rng)
      const change = pick(rng, [
        null,
        { kind: 'content', nodeIds: [], edgeIds: [] },
        { kind: 'content', nodeIds: pool.filter(() => rng() < 0.5).map((pid) => pid.slice(4)), edgeIds: [] },
        { kind: 'content', nodeIds: [], edgeIds: [sid] },
      ])

      let r: ReturnType<typeof reconcileContentRoots>
      try {
        r = reconcileContentRoots({ previous, next, change })
      } catch (e) {
        return `threw ${String(e)}`
      }
      const buckets: Array<{ name: string; arr: MaterializedRoot[] }> = [
        { name: 'added', arr: r.added },
        { name: 'replaced', arr: r.replaced },
        { name: 'removed', arr: r.removed },
        { name: 'kept', arr: r.kept },
      ]
      // (1) pairwise cssId-disjoint across the four buckets.
      const owned = new Map<string, string>()
      for (const b of buckets) {
        for (const m of b.arr) {
          if (owned.has(m.cssId)) return `cssId ${m.cssId} appears in both ${owned.get(m.cssId)} and ${b.name}`
          owned.set(m.cssId, b.name)
        }
      }
      // (2) no loss — every prev∪next cssId is covered exactly once.
      const expected = new Set([...prevSel, ...nextSel])
      for (const pid of expected) if (!owned.has(pid)) return `cssId ${pid} lost (no bucket)`
      const covered = new Set(owned.keys())
      for (const pid of covered) if (!expected.has(pid)) return `cssId ${pid} in a bucket but not prev∪next`
      // (3) count discipline: added=next-only, removed=prev-only, replaced+kept=shared.
      const nextOnly = [...nextSel].filter((pid) => !prevSel.has(pid)).length
      if (r.added.length !== nextOnly) return `added ${r.added.length} != nextOnly ${nextOnly}`
      const prevOnly = [...prevSel].filter((pid) => !nextSel.has(pid)).length
      if (r.removed.length !== prevOnly) return `removed ${r.removed.length} != prevOnly ${prevOnly}`
      const sharedCount = [...nextSel].filter((pid) => prevSel.has(pid)).length
      if (r.replaced.length + r.kept.length !== sharedCount) return `replaced+kept ${r.replaced.length + r.kept.length} != shared ${sharedCount}`
      const sharedIds = [...nextSel].filter((pid) => prevSel.has(pid))
      // (4) membership: every next-only → added, every prev-only → removed,
      //     every shared → replaced ∪ kept, each exactly once.
      for (const pid of nextSel) if (!prevSel.has(pid) && !r.added.some((m) => m.cssId === pid)) return `next-only ${pid} not in added`
      for (const pid of prevSel) if (!nextSel.has(pid) && !r.removed.some((m) => m.cssId === pid)) return `prev-only ${pid} not in removed`
      for (const pid of sharedIds)
        if (!r.replaced.some((m) => m.cssId === pid) && !r.kept.some((m) => m.cssId === pid)) return `shared ${pid} not in replaced|kept`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  it('P-SM-2 [strat:reconcile-no-cross-contamination] a changed id in A\'s subtree never marks unrelated shared B `replaced`', () => {
    const rep = runProperty('P-SM-2', 'strat:reconcile-no-cross-contamination', (_i, rng) => {
      const a = 'a' + randString(rng)
      const b = 'b' + randString(rng)
      const aNested = a + '-c'
      // Two disjoint SHARED root subtrees. A carries a nested `rag-` doc-child
      // (its id is part of A's subtree collection).
      const prevA = cn(`rag-${a}`, { children: [cn(`rag-${aNested}`)] })
      const prevB = cn(`rag-${b}`, { content: 'B' + randString(rng) })
      const next = envelope([prevA, prevB])
      const previous = [prevA, prevB]
      // Clean content change: kind 'content', empty edgeIds, usedFallback false.
      // The changed id (`aNested`) lives ONLY in A's subtree — not B's.
      const change = { kind: 'content' as const, nodeIds: [aNested], edgeIds: [] }
      let r: ReturnType<typeof reconcileContentRoots>
      try {
        r = reconcileContentRoots({ previous, next, change })
      } catch (e) {
        return `threw ${String(e)}`
      }
      if (r.usedFallback !== false) return `usedFallback=${r.usedFallback} (clean content expected false)`
      const cssA = `rag-${a}`
      const cssB = `rag-${b}`
      if (!r.replaced.some((m) => m.cssId === cssA)) return `target ${cssA} (whose subtree contains the changed id) was not replaced`
      if (r.replaced.some((m) => m.cssId === cssB)) return `unrelated ${cssB} wrongly replaced (cross-contamination)`
      if (!r.kept.some((m) => m.cssId === cssB)) return `unrelated ${cssB} not kept`
      if (r.kept.some((m) => m.cssId === cssA)) return `target ${cssA} kept (should be replaced)`
      if (r.added.some((m) => m.cssId === cssA || m.cssId === cssB)) return `shared root landed in added`
      if (r.removed.some((m) => m.cssId === cssA || m.cssId === cssB)) return `shared root landed in removed`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // -------------------------------------------------------------------------
  // Class: TP (transform)
  // -------------------------------------------------------------------------
  it('P-TP-1 [strat:canonical-normal-form] key-order-insensitive + undefined→null canonical shape comparison', () => {
    const rep = runProperty('P-TP-1', 'strat:canonical-normal-form', (_i, rng) => {
      const facet = pick(rng, ['keyorder', 'undefnull'] as const)
      const base: Record<string, unknown> = { arr: [1, 2, 3], o: { q: 1, r: 2 }, s: 'x', n: null, t: { d: 4, c: 5 } }
      // Re-key insertion order ONLY (array order preserved — canonical maps
      // arrays element-wise and does NOT sort them; a shuffled array WOULD be a
      // real shape change, so we must not re-order arrays).
      const rekey = (v: unknown): unknown => {
        if (Array.isArray(v)) return v.map(rekey)
        if (v && typeof v === 'object') {
          const keys = Object.keys(v as Record<string, unknown>)
          const out: Record<string, unknown> = {}
          for (const k of [...keys].reverse()) out[k] = rekey((v as Record<string, unknown>)[k])
          return out
        }
        return v
      }
      let contentA: unknown
      let contentB: unknown
      if (facet === 'keyorder') {
        contentA = rekey(base)
        contentB = rekey(rekey(base))
      } else {
        // undefined canonicalizes to null — structurally-equal under canonical.
        contentA = { a: 1, b: undefined }
        contentB = { a: 1, b: null }
      }
      const prev = [cn('rag-x', { props: { className: 'A' }, content: contentA })]
      const next = envelope([cn('rag-x', { props: { className: 'A' }, content: contentB })])
      let r: ReturnType<typeof reconcileContentRoots>
      try {
        r = reconcileContentRoots({ previous: prev, next, change: null })
      } catch (e) {
        return `threw ${String(e)}`
      }
      // change=null → the full-subgraph fallback shape comparison runs; the
      // canonical sorted-key + undefined→null normal form makes these equal.
      if (!r.kept.some((m) => m.cssId === 'rag-x')) return `canonically-equal nodes not kept (facet ${facet})`
      if (r.replaced.some((m) => m.cssId === 'rag-x')) return `canonically-equal nodes reported replaced (facet ${facet})`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  it('P-TP-2 [strat:shape-projection-runtime-excluded] runtime `data-*` markers excluded, authored props retained (AF1 R1/R1b)', () => {
    const rep = runProperty('P-TP-2', 'strat:shape-projection-runtime-excluded', (_i, rng) => {
      // `facet` picks which feature DIFFERS between prev and next. `runtime`
      // differs only in `data-node-id`; `head` differs ONLY in the other runtime
      // marker `data-doc-head` (and the authored `id` — excluded from the props
      // projection and ALSO the cssId key, so a keyed pair's id can never differ;
      // a different authored id is a different root → added/removed, never a
      // false `replaced`). A leak of either runtime marker (or a re-included id)
      // would mis-mark the pair `replaced`; the projection must exclude them.
      const facet = pick(rng, ['runtime', 'authdata', 'authplain', 'content', 'head'] as const)
      const diffAt = pick(rng, ['root', 'child'] as const)
      // runtime markers + authored props (incl. authored data-*) on both nodes;
      // the DIFFERING feature depends on `facet`.
      const mkNode = (applyDiff: boolean): LegacyNodeData => {
        const rootProps: Record<string, unknown> = { className: 'A' }
        const childProps: Record<string, unknown> = { className: 'A' }
        const set = (at: 'root' | 'child', key: string, v: unknown): void => {
          ;(at === 'root' ? rootProps : childProps)[key] = v
        }
        // runtime-minted markers on both sides (projection EXCLUDES them).
        set('root', 'data-doc-head', 'h')
        set('root', 'data-node-id', 'n-root')
        set('child', 'data-doc-head', 'hc')
        set('child', 'data-node-id', 'n-child')
        // authored props on both sides (projection RETAINS them).
        set('root', 'data-current', 'nav')
        set('root', 'data-document-id', 'doc1')
        set('child', 'data-current', 'child-nav')
        if (!applyDiff) {
          return cn('rag-x', { props: rootProps, content: 'base', children: [cn('rag-yc', { props: childProps, content: 'child' })] })
        }
        if (facet === 'runtime') {
          // differ ONLY in a runtime marker → excluded → equal shape.
          if (diffAt === 'root') set('root', 'data-node-id', 'n-root-CHANGED')
          else set('child', 'data-node-id', 'n-child-CHANGED')
        } else if (facet === 'head') {
          // differ ONLY in the OTHER runtime marker `data-doc-head` → excluded →
          // equal shape (the pre-fix projection included it and mis-marked).
          if (diffAt === 'root') set('root', 'data-doc-head', 'h-CHANGED')
          else set('child', 'data-doc-head', 'hc-CHANGED')
        } else if (facet === 'authdata') {
          // differ in an AUTHORED data-* marker → retained → different shape.
          if (diffAt === 'root') set('root', 'data-current', 'focus')
          else set('child', 'data-current', 'child-focus')
        } else if (facet === 'authplain') {
          // differ in an authored non-runtime prop.
          if (diffAt === 'root') set('root', 'className', 'B')
          else set('child', 'className', 'B')
        }
        const rootContent = facet === 'content' && diffAt === 'root' ? 'base-CHANGED' : 'base'
        const childContent = facet === 'content' && diffAt === 'child' ? 'child-CHANGED' : 'child'
        if (facet === 'content') {
          return cn('rag-x', { props: rootProps, content: rootContent, children: [cn('rag-yc', { props: childProps, content: childContent })] })
        }
        return cn('rag-x', { props: rootProps, content: rootContent, children: [cn('rag-yc', { props: childProps, content: childContent })] })
      }
      const expectSame = facet === 'runtime' || facet === 'head'
      const prev = [mkNode(false)]
      const next = envelope([mkNode(true)])
      let r: ReturnType<typeof reconcileContentRoots>
      try {
        r = reconcileContentRoots({ previous: prev, next, change: null })
      } catch (e) {
        return `threw ${String(e)}`
      }
      if (expectSame) {
        if (!r.kept.some((m) => m.cssId === 'rag-x')) return `runtime-marker-only diff not kept (facet ${facet}, at ${diffAt})`
        if (r.replaced.some((m) => m.cssId === 'rag-x')) return `runtime-marker-only diff reported replaced (facet ${facet}, at ${diffAt})`
      } else {
        if (!r.replaced.some((m) => m.cssId === 'rag-x')) return `included authored prop / content diff not detected (facet ${facet}, at ${diffAt})`
        if (r.kept.some((m) => m.cssId === 'rag-x')) return `included authored prop / content diff wrongly kept (facet ${facet}, at ${diffAt})`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  it('P-TP-3 [strat:content-root-id-roundtrip] `asContentRoot`/`plainRagId` id scoping: rag-/pane- recovery, null skip', () => {
    // Part A — the EXPORTED `plainRagId` helper (the documented key component
    // of `asContentRoot`): plain / data-prop / doc-scoped recovery + null skip.
    const repA = runProperty('P-TP-3', 'strat:content-root-id-roundtrip', (_i, rng) => {
      const kind = pick(rng, [
        'ragplain',
        'ragdata',
        'ragscoped',
        'raginconsistent',
        'pane',
        'other',
        'noid',
        'numnonstring',
      ] as const)
      const id = 'zz' + randString(rng)
      let props: Record<string, unknown>
      let expected: string | null
      switch (kind) {
        case 'ragplain':
          props = { id: `rag-${id}` }
          expected = id
          break
        case 'ragdata':
          props = { id: `rag-${id}`, 'data-rag-node-id': id }
          expected = id
          break
        case 'ragscoped': {
          const d = 'doc' + id
          props = { id: `rag-${d}--${id}`, 'data-rag-node-id': id }
          expected = id
          break
        }
        case 'raginconsistent':
          props = { id: `rag-${id}`, 'data-rag-node-id': id + 'X' }
          expected = id // falls back to id.slice(4) when the data id is inconsistent
          break
        case 'pane':
          props = { id: `pane-${id}` }
          expected = null
          break
        case 'other':
          props = { id: `inline-${id}` }
          expected = null
          break
        case 'noid':
          props = {}
          expected = null
          break
        case 'numnonstring':
          props = { id: 42 }
          expected = null
          break
      }
      const got = plainRagId(props)
      if (got !== expected) return `plainRagId(${JSON.stringify(props)}) = ${String(got)} expected ${String(expected)}`
      return null
    })
    expect(repA.held, `${repA.row} ${repA.strategyId} ${JSON.stringify(repA.counterexamples)}`).toBe(true)

    // Part B — `asContentRoot` observable through the reconcile BUCKETS: rag- /
    // pane- roots recovered with faithful ragNodeId, malformed/non-content nodes
    // skipped (F2 — never emitted, never a throw).
    const repB = runProperty('P-TP-3', 'strat:content-root-id-roundtrip', (_i, rng) => {
      const d = 'd' + Math.floor(rng() * 999).toString(36)
      const specimens: Array<{ node: LegacyNodeData; expect: MaterializedRoot | null }> = [
        { node: cn('rag-aa'), expect: { cssId: 'rag-aa', ragNodeId: 'aa' } },
        { node: cn('rag-bb', { props: { 'data-rag-node-id': 'bb' } }), expect: { cssId: 'rag-bb', ragNodeId: 'bb' } },
        { node: cn(`rag-${d}--cc`, { props: { 'data-rag-node-id': 'cc' } }), expect: { cssId: `rag-${d}--cc`, ragNodeId: 'cc' } },
        { node: cn('rag-ee', { props: { 'data-rag-node-id': 'eeX' } }), expect: { cssId: 'rag-ee', ragNodeId: 'ee' } },
        { node: cn('pane-pp'), expect: { cssId: 'pane-pp', ragNodeId: 'pane-pp' } },
        { node: cn(`pane-${d}2`), expect: { cssId: `pane-${d}2`, ragNodeId: `pane-${d}2` } },
        // non-content / malformed nodes — skipped, never a throw.
        { node: cn('inline-ii'), expect: null },
        { node: cn('zone:main'), expect: null },
        { node: { type: 'div', props: {}, content: 'no-id' }, expect: null },
        { node: { type: 'div', props: { id: 42 }, content: 'num' }, expect: null },
        { node: { type: 'div', props: { id: 'rag-' }, content: 'bare-prefix' }, expect: null },
      ]
      const ordered = [...specimens].sort(() => rng() - rng())
      const next = envelope(ordered.map((s) => s.node))
      let r: ReturnType<typeof reconcileContentRoots>
      try {
        r = reconcileContentRoots({ previous: [], next, change: null })
      } catch (e) {
        return `threw ${String(e)} (a malformed node caused a throw)`
      }
      if (r.usedFallback !== true) return `usedFallback=${r.usedFallback} (change=null expected true)`
      const want = ordered.filter((s) => s.expect != null).map((s) => s.expect as MaterializedRoot)
      if (!deepEq(r.added, want)) return `added ${JSON.stringify(r.added)} != expected ${JSON.stringify(want)}`
      if (r.replaced.length !== 0 || r.removed.length !== 0 || r.kept.length !== 0) return `non-content nodes leaked into other buckets`
      return null
    })
    expect(repB.held, `${repB.row} ${repB.strategyId} ${JSON.stringify(repB.counterexamples)}`).toBe(true)
  })
})
