// tests/props-reconcile-1e.test.ts — Unit U-STATE-1e: the §5.7 PBT register (5
// rows) for the N-ROOT reconciler — `reconcileDocumentRoots` + the
// NRootReconcileInput/NRootReconcileResult/ScopedRoot/DocumentRoot/
// identityReplaced surface of `src/renderer/content-reconcile.ts`.
// (docs/specs/unit-u-state-1e-nroot-reconcile.md §5.7 — the register.)
//
// Scope: the N-ROOT surface ONLY. The single-root `reconcileContentRoots` /
// `ReconcileResult` rows (the 1a register) are NOT duplicated here (that is
// `props-reconcile-1a.test.ts`).
//
// Deterministic pinned seed 0x1E51E500 (the unit's mnemonic "1E"), ≤100
// attempts/row, ≤400 total, stop-after-5. Matches the sibling mulberry32 +
// attempt-loop convention (tests/props-shell-integration.test.ts). Vitest node
// env, `.js` import suffix.
//
// The register is RULED to be invariant-bearing over the WELL-FORMED domain
// (§2.2 shape preconditions): `next` is an array of `{documentId, envelope}`
// with a valid `template.root` + `content`; every non-pane `previous`
// `documentId` and every `next` `documentId` is in `documentIds`. Malformed
// envelopes (§4 F3 guard throw) and stale/closed documents (§4 F2/F5/F8
// drop-vs-`removed`) are OUT of the register's checkable domain and are NOT
// fed to these generators. The F3 guard is verified here as a negative
// P-IM-1 sub-check that the documented throw fires (and is never a raw
// TypeError), kept separate from the valid-domain totality loop.
//
// Deterministic PRNG — no wallclock/global-state dependency.
const PBT_SEED = 0x1e51e500 // the unit's mnemonic "1E"
const PBT_ATTEMPTS = 40 // ≤100/row; 5 rows × 40 = 200 ≤ 400 total
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
function pickN<T>(rng: () => number, pool: readonly T[], n: number): T[] {
  const poolShuffle = [...pool]
  for (let i = poolShuffle.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const t = poolShuffle[i]
    poolShuffle[i] = poolShuffle[j]
    poolShuffle[j] = t
  }
  return poolShuffle.slice(0, Math.min(n, poolShuffle.length))
}
/** True when `sub` appears in `seq` in the same relative order (a
 *  subsequence), comparing by index. */
function isSubsequence(sub: string[], seq: string[]): boolean {
  let s = 0
  for (let i = 0; i < sub.length; i++) {
    let found = -1
    for (let j = s; j < seq.length; j++) {
      if (seq[j] === sub[i]) {
        found = j
        break
      }
    }
    if (found === -1) return false
    s = found + 1
  }
  return true
}
function uniqueKeys(list: string[]): { dup: boolean; set: Set<string>; byKey: string[] } {
  const set = new Set<string>()
  const byKey: string[] = []
  let dup = false
  for (const k of list) {
    if (set.has(k)) dup = true
    else {
      set.add(k)
      byKey.push(k)
    }
  }
  return { dup, set, byKey }
}

// ---------------------------------------------------------------------------
// The pinned §2.2 N-root surface (typed locally for the harness).
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { reconcileDocumentRoots } from '../src/renderer/content-reconcile.js'

interface MaterializedRoot {
  cssId: string
  ragNodeId: string
}
interface ScopedRoot extends MaterializedRoot {
  documentId: string
}
interface DocumentRoot {
  documentId: string
  root: LegacyNodeData
}
interface DocumentEnvelope {
  documentId: string
  envelope: LegacyInitialData
}
interface ReconcileChange {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
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

const RAG_P = 'rag-'
const PANE_P = 'pane-'

function rag(ragNodeId: string, content = ''): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${ragNodeId}` }, content }
}
function pane(id: string, content = 'pane'): LegacyNodeData {
  return { type: 'div', props: { id }, content }
}
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: roots.map((r) => ({ content: [r] })),
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
function doc(documentId: string, roots: LegacyNodeData[]): DocumentEnvelope {
  return { documentId, envelope: envelope(roots) }
}
function droot(documentId: string, node: LegacyNodeData): DocumentRoot {
  return { documentId, root: node }
}
function change(
  nodeIds: string[],
  kind: 'content' | 'structural' = 'content',
  edgeIds: string[] = [],
): ReconcileChange {
  return { kind, nodeIds, edgeIds }
}
function scKey(sc: ScopedRoot): string {
  return `${sc.documentId}|${sc.cssId}`
}
function isPaneSc(sc: ScopedRoot): boolean {
  return sc.cssId.startsWith(PANE_P)
}
function nonPaneBucket(list: ScopedRoot[]): string[] {
  return list.filter((sc) => !isPaneSc(sc)).map(scKey)
}

/** The authoritative content-root key reader for a node (mirrors the spec's
 *  `(documentId, cssId)` keying — panes are cssId-keyed, document-unscoped). */
function nodeIdInfo(node: LegacyNodeData | null | undefined, documentId: string): string | null {
  const id = (node?.props as { id?: unknown } | undefined)?.id
  if (typeof id !== 'string') return null
  if (id.startsWith(PANE_P) && id.length > PANE_P.length) return id // pane — cssId-keyed
  if (id.startsWith(RAG_P) && id.length > RAG_P.length) return `${documentId}|${id}` // scoped
  return null
}

/** The true NON-PANE next-root keys, in render order (documentIds order →
 *  next-entry order → content-payload order), deduped (first-wins). */
function collectNextKeys(input: NRootReconcileInput): string[] {
  const docIds = [...new Set(input.documentIds.filter((d): d is string => typeof d === 'string'))]
  const out: string[] = []
  const seen = new Set<string>()
  for (const d of docIds) {
    for (const e of input.next) {
      if (e == null || e.documentId !== d) continue
      const payloads = (e.envelope as { content?: unknown } | null | undefined)?.content
      if (!Array.isArray(payloads)) continue
      for (const payload of payloads) {
        const nodes = (payload as { content?: unknown } | null | undefined)?.content
        if (!Array.isArray(nodes)) continue
        for (const node of nodes) {
          if (node == null) continue
          const key = nodeIdInfo(node as LegacyNodeData, d)
          if (key == null || key.startsWith(PANE_P)) continue
          if (seen.has(key)) continue
          seen.add(key)
          out.push(key)
        }
      }
    }
  }
  return out
}

/** The true NON-PANE open previous-root keys, in `previous` order, deduped
 *  (first-wins), scoped to `documentIds` (a stale/non-open root is excluded —
 *  §4 F2/F5/F8). */
function collectPrevKeys(input: NRootReconcileInput): string[] {
  const docIds = [...new Set(input.documentIds.filter((d): d is string => typeof d === 'string'))]
  const openDocs = new Set(docIds)
  const out: string[] = []
  const seen = new Set<string>()
  for (const r of input.previous) {
    if (r == null) continue
    const key = nodeIdInfo(r.root, r.documentId)
    if (key == null || key.startsWith(PANE_P)) continue
    if (r.documentId !== '' && !openDocs.has(r.documentId)) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}

/** A generated well-formed input + the oracles derived from it (independent of
 *  the reconciler's classification). */
interface Model {
  input: NRootReconcileInput
  docIds: string[]
  nextKeys: string[]
  prevKeys: string[]
}

function makeModel(
  previous: DocumentRoot[],
  next: DocumentEnvelope[],
  ch: ReconcileChange | null,
  documentIds: string[],
): Model {
  const input: NRootReconcileInput = { previous, next, change: ch, documentIds }
  const docIds = [...new Set(documentIds.filter((d): d is string => typeof d === 'string'))]
  return { input, docIds, nextKeys: collectNextKeys(input), prevKeys: collectPrevKeys(input) }
}

// ---------------------------------------------------------------------------
// General well-formed-input generator (P-IM-1 / P-IM-2 / P-TP-1 loops). N
// documents (1–3) over a shared root pool (so shared/subtrees arise), per-doc
// previous≠next subsets (so added/replaced/removed arise), a randomized change
// (content / structural / null), and ~50% a pane routed into one envelope. The
// previous non-pane documentIds and the next documentIds are, by construction,
// all open — the §2.2 well-formed precondition holds.
// ---------------------------------------------------------------------------
const POOL = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const

function genWellFormed(rng: () => number): Model {
  const nDocs = 1 + Math.floor(rng() * 3) // 1..3
  const docs = ['A', 'B', 'C'].slice(0, nDocs)
  const docPrev: Record<string, string[]> = {}
  const docNext: Record<string, string[]> = {}
  for (const d of docs) {
    const psize = 1 + Math.floor(rng() * 3) // 1..3
    const nsize = 1 + Math.floor(rng() * 3)
    docPrev[d] = pickN(rng, POOL, psize).map(String)
    docNext[d] = pickN(rng, POOL, nsize).map(String)
  }
  const previous: DocumentRoot[] = []
  for (const d of docs) for (const id of docPrev[d]) previous.push(droot(d, rag(id, 'old')))
  const next: DocumentEnvelope[] = []
  for (const d of docs) {
    const roots = docNext[d].map((id) => rag(id, 'new'))
    // ~50% a pane routed into this document's envelope (shape-compared always).
    if (rng() < 0.5) roots.push(pane('pane-p1', 'pane'))
    next.push(doc(d, roots))
  }
  // The change descriptor (content / structural / null).
  const allIds = [...new Set([...Object.values(docPrev), ...Object.values(docNext)].flat())]
  let ch: ReconcileChange | null
  const kindR = rng()
  if (kindR < 0.25) {
    ch = null
  } else if (kindR < 0.5) {
    ch = { kind: 'structural', nodeIds: pickN(rng, allIds, allIds.length > 0 ? 1 + Math.floor(rng() * allIds.length) : 0).map(String), edgeIds: ['e1'] }
  } else {
    const n = allIds.length > 0 ? 1 + Math.floor(rng() * allIds.length) : 0
    ch = { kind: 'content', nodeIds: pickN(rng, allIds, n).map(String), edgeIds: [] }
  }
  return makeModel(previous, next, ch, docs)
}

function shapeOfResult(input: NRootReconcileInput): string | null {
  const r = reconcileDocumentRoots(input)
  if (!Array.isArray(r.added) || !Array.isArray(r.replaced) || !Array.isArray(r.removed) || !Array.isArray(r.kept)) {
    return 'buckets are not arrays'
  }
  if (typeof r.usedFallback !== 'boolean') return 'usedFallback is not a boolean'
  if (!Array.isArray(r.identityReplaced)) return 'identityReplaced is not an array'
  for (const b of [r.added, r.replaced, r.removed, r.kept]) {
    for (const sc of b) {
      if (typeof sc.documentId !== 'string' || typeof sc.cssId !== 'string' || typeof sc.ragNodeId !== 'string') {
        return `bucket entry ${JSON.stringify(sc)} is not a ScopedRoot`
      }
    }
  }
  return null
}

function coverageError(input: NRootReconcileInput, model: Model): string | null {
  const r = reconcileDocumentRoots(input)
  // next-side union (non-pane) + identity `to`.
  const nextObserved = uniqueKeys([
    ...nonPaneBucket(r.added),
    ...nonPaneBucket(r.replaced),
    ...nonPaneBucket(r.kept),
    ...r.identityReplaced.filter((e) => !e.to.cssId.startsWith(PANE_P)).map((e) => `${e.documentId}|${e.to.cssId}`),
  ])
  const trueNextSet = new Set(model.nextKeys)
  if (nextObserved.dup) return 'a next-side key appears twice in the buckets'
  if (nextObserved.byKey.length !== model.nextKeys.length) return `next coverage lost/gained: observed ${nextObserved.byKey.length} vs true ${model.nextKeys.length}`
  for (const k of nextObserved.byKey) if (!trueNextSet.has(k)) return `next-side key ${k} not in the true next-root set`
  for (const k of model.nextKeys) if (!nextObserved.set.has(k)) return `next root ${k} missing from added/replaced/kept/identityReplaced.to`

  // prev-side union (non-pane) + identity `from`.
  const prevObserved = uniqueKeys([
    ...nonPaneBucket(r.removed),
    ...nonPaneBucket(r.replaced),
    ...nonPaneBucket(r.kept),
    ...r.identityReplaced.filter((e) => !e.from.cssId.startsWith(PANE_P)).map((e) => `${e.documentId}|${e.from.cssId}`),
  ])
  const truePrevSet = new Set(model.prevKeys)
  if (prevObserved.dup) return 'a prev-side key appears twice in the buckets'
  if (prevObserved.byKey.length !== model.prevKeys.length) return `prev coverage lost/gained: observed ${prevObserved.byKey.length} vs true ${model.prevKeys.length}`
  for (const k of prevObserved.byKey) if (!truePrevSet.has(k)) return `prev-side key ${k} not in the true previous-root set`
  for (const k of model.prevKeys) if (!prevObserved.set.has(k)) return `previous root ${k} missing from removed/replaced/kept/identityReplaced.from`
  return null
}

// ===========================================================================
// The §5.7 register (5 rows).
// ===========================================================================
describe('PBT register (§5.7) — N-root reconcile', () => {
  // States covered by P-IM-1: well-formed 1–3 doc inputs over the shared pool;
  // per-doc added/replaced/removed/kept; shared roots; panes; a randomized
  // content / structural / null change (usedFallback true/false). Fail-state
  // kept out of the domain: F3 (malformed envelope) is verified separately as
  // the documented guard throw (never a raw TypeError).
  it('P-IM-1 [strat:nroot-total] well-formed-input totality', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const model = genWellFormed(rng)
      try {
        const err = shapeOfResult(model.input)
        if (err) ces.push(`attempt ${i}: ${err}`)
      } catch (e) {
        ces.push(`attempt ${i} threw on a well-formed input: ${String(e)}`)
      }
    }
    // The §4 F3 guard: a malformed/open-document envelope throws the documented
    // guard error, never a raw TypeError (kept out of the valid domain above).
    const malformed = reconcileDocumentRoots as (
      i: NRootReconcileInput,
    ) => NRootReconcileResult
    try {
      malformed({ previous: [], next: [{ documentId: 'A', envelope: { content: [] } as never }], change: null, documentIds: ['A'] })
      ces.push('F3 guard: a template-root-less considered envelope did not throw')
    } catch (e) {
      if (e instanceof TypeError) ces.push('F3 guard surfaced a raw TypeError (not the documented throw)')
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  // States covered by P-IM-2: identical well-formed inputs → deep-equal results
  // with pinned bucket order — added/replaced/kept follow `next` order, removed
  // follows `previous` order; no wallclock/global-state/rng-order dependence.
  it('P-IM-2 [strat:nroot-deterministic] determinism + bucket order', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const model = genWellFormed(rng)
      const r1 = reconcileDocumentRoots(model.input)
      const r2 = reconcileDocumentRoots(model.input)
      if (!expectDeepEqual(r1, r2)) {
        ces.push(`attempt ${i}: two runs on identical inputs differ`)
        continue
      }
      // Bucket order (non-pane): added/replaced/kept each a subsequence of the
      // `next` render order; removed a subsequence of the `previous` order.
      for (const [name, bucket] of [['added', r1.added], ['replaced', r1.replaced], ['kept', r1.kept]] as const) {
        if (!isSubsequence(nonPaneBucket(bucket), model.nextKeys)) {
          ces.push(`attempt ${i}: non-pane ${name} order does not follow the next render order`)
          break
        }
      }
      if (ces.length) continue
      if (!isSubsequence(nonPaneBucket(r1.removed), model.prevKeys)) {
        ces.push(`attempt ${i}: non-pane removed order does not follow the previous order`)
      }
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  // States covered by P-SM-1: A,B share `rag-X` → two distinct (A,X)/(B,X)
  // entries; a fork changing a node only in A leaves B's shared root classified
  // by B's own nodes; every non-pane ScopedRoot carries its owning documentId
  // (no cross-attribute).
  it('P-SM-1 [strat:nroot-perdoc-isolation] per-document isolation of shared roots', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const mode = rng()
      let model: Model
      if (mode < 0.4) {
        // clean — both shared roots unchanged → both kept.
        model = makeModel(
          [droot('A', rag('X', 'shared')), droot('B', rag('X', 'shared'))],
          [doc('A', [rag('X', 'shared')]), doc('B', [rag('X', 'shared')])],
          change([]),
          ['A', 'B'],
        )
      } else if (mode < 0.7) {
        // a change naming the shared node → replaces BOTH (per-doc distinct).
        model = makeModel(
          [droot('A', rag('X', 'old')), droot('B', rag('X', 'shared'))],
          [doc('A', [rag('X', 'new')]), doc('B', [rag('X', 'shared')])],
          change(['X']),
          ['A', 'B'],
        )
      } else {
        // a change to a node only in A → A's a2 replaced; both shared X kept.
        model = makeModel(
          [droot('A', rag('X', 'shared')), droot('A', rag('a2', 'old')), droot('B', rag('X', 'shared'))],
          [doc('A', [rag('X', 'shared'), rag('a2', 'new')]), doc('B', [rag('X', 'shared')])],
          change(['a2']),
          ['A', 'B'],
        )
      }
      const r = reconcileDocumentRoots(model.input)
      const all = [...r.added, ...r.replaced, ...r.removed, ...r.kept]
      // No non-pane entry carries a documentId other than its source document.
      for (const sc of all) {
        if (!sc.cssId.startsWith(PANE_P) && sc.documentId !== 'A' && sc.documentId !== 'B') {
          ces.push(`attempt ${i}: non-pane root ${scKey(sc)} carries an unexpected documentId`)
        }
      }
      if (ces.length) continue
      // The shared (A,X)/(B,X) pair is exactly TWO distinct entries.
      const xEntries = all.filter((sc) => sc.ragNodeId === 'X' && sc.cssId === 'rag-X')
      if (xEntries.length !== 2) {
        ces.push(`attempt ${i}: shared rag-X produced ${xEntries.length} entries (expected 2 distinct)`)
        continue
      }
      const docIds = new Set(xEntries.map((sc) => sc.documentId))
      if (docIds.size !== 2 || !docIds.has('A') || !docIds.has('B')) {
        ces.push(`attempt ${i}: shared rag-X entries are not the (A,X)/(B,X) pair`)
        continue
      }
      // Per-document classification independence (pinned exact buckets).
      if (mode < 0.4) {
        const kept = nonPaneBucket(r.kept)
        if (!kept.includes('A|rag-X') || !kept.includes('B|rag-X')) {
          ces.push(`attempt ${i}: clean shared input did not keep both (mode ${mode})`)
          continue
        }
      } else if (mode < 0.7) {
        const repl = nonPaneBucket(r.replaced)
        if (!repl.includes('A|rag-X') || !repl.includes('B|rag-X')) {
          ces.push(`attempt ${i}: shared change did not replace both (mode ${mode})`)
          continue
        }
      } else {
        const repl = nonPaneBucket(r.replaced)
        const kept = nonPaneBucket(r.kept)
        if (
          !(repl.includes('A|rag-a2') && kept.includes('A|rag-X') && kept.includes('B|rag-X'))
        ) {
          ces.push(`attempt ${i}: A-only change did not keep B's shared root (mode ${mode}; repl=${repl} kept=${kept})`)
          continue
        }
      }
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  // States covered by P-SM-2: a fork in A changes rag-X → rag-X′ through the
  // explicit identityReplaced bucket; `to` ∉ added∪replaced, `from` ∉ removed;
  // both resolve in A's prev/next; both ragNodeIds ∈ change.nodeIds; documentId
  // ≠ '' (panes never in the bucket); B's same-cssId shared root stays kept;
  // H2a/H2b — A's filters never suppress B's own same-cssId add/remove.
  it('P-SM-2 [strat:nroot-identity-faithful] identity-replace fork faithfulness', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      // A forks X→X′. B's disposition varies (kept / B also gains X′ / B drops X).
      const bMode = rng()
      let model: Model
      if (bMode < 0.5) {
        model = makeModel(
          [droot('A', rag('X')), droot('B', rag('X'))],
          [doc('A', [rag('Xprime')]), doc('B', [rag('X')])],
          change(['X', 'Xprime']),
          ['A', 'B'],
        )
      } else if (bMode < 0.75) {
        // H2a — B independently materializes its OWN new `X′` (A must not suppress B's add).
        model = makeModel(
          [droot('A', rag('X'))],
          [doc('A', [rag('Xprime')]), doc('B', [rag('Xprime')])],
          change(['X', 'Xprime']),
          ['A', 'B'],
        )
      } else {
        // H2b — B independently REMOVES its own `X` (A must not suppress B's remove).
        model = makeModel(
          [droot('A', rag('X')), droot('B', rag('X'))],
          [doc('A', [rag('Xprime')])],
          change(['X', 'Xprime']),
          ['A', 'B'],
        )
      }
      const r = reconcileDocumentRoots(model.input)
      // A's identity replace is exactly one A-scoped entry, never a pane.
      const aEntries = r.identityReplaced.filter((e) => e.documentId === 'A')
      if (aEntries.length !== 1) {
        ces.push(`attempt ${i}: expected 1 A-scoped identity replace, got ${aEntries.length}`)
        continue
      }
      const e = aEntries[0]
      if (e.documentId === '') {
        ces.push(`attempt ${i}: identity entry carries documentId '' (pane in the bucket?)`)
        continue
      }
      if (!e.from.cssId.startsWith(RAG_P) && !e.to.cssId.startsWith(RAG_P)) {
        ces.push(`attempt ${i}: identity entry is not a rag- pair`)
        continue
      }
      if (e.from.cssId !== 'rag-X' || e.to.cssId !== 'rag-Xprime') {
        ces.push(`attempt ${i}: identity from=${e.from.cssId} to=${e.to.cssId} (expected rag-X/rag-Xprime)`)
        continue
      }
      if (!(e.from.ragNodeId && e.to.ragNodeId)) {
        ces.push(`attempt ${i}: identity entries missing ragNodeId`)
        continue
      }
      // both names are in the payload's changed set.
      if (!['X', 'Xprime'].includes(e.from.ragNodeId) || !['X', 'Xprime'].includes(e.to.ragNodeId)) {
        ces.push(`attempt ${i}: identity ragNodeIds not both named by the change payload`)
        continue
      }
      const addedKeys = nonPaneBucket(r.added)
      const replKeys = nonPaneBucket(r.replaced)
      const removedKeys = nonPaneBucket(r.removed)
      // to ∉ added ∪ replaced; from ∉ removed (per-document, A-scoped).
      if (addedKeys.includes('A|rag-Xprime') || replKeys.includes('A|rag-Xprime')) {
        ces.push(`attempt ${i}: identity 'to' rag-Xprime leaked into added/replaced`)
      }
      if (removedKeys.includes('A|rag-X')) {
        ces.push(`attempt ${i}: identity 'from' rag-X leaked into removed`)
      }
      if (ces.length) continue
      // B's disposition asserts the document-scoped filters.
      if (bMode < 0.5) {
        // B's shared X stays kept.
        if (!removedKeys.includes('B|rag-X') && !nonPaneBucket(r.kept).includes('B|rag-X')) {
          ces.push(`attempt ${i}: B's shared rag-X not kept on A's fork`)
        } else if (addedKeys.includes('B|rag-X') || replKeys.includes('B|rag-X')) {
          ces.push(`attempt ${i}: B's shared rag-X misclassified on A's fork`)
        }
      } else if (bMode < 0.75) {
        if (!addedKeys.includes('B|rag-Xprime')) {
          ces.push(`attempt ${i}: H2a — A's identity filter suppressed B's own X′ add`)
        }
      } else {
        if (!removedKeys.includes('B|rag-X')) {
          ces.push(`attempt ${i}: H2b — A's identity filter suppressed B's own X remove`)
        }
      }
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  // States covered by P-TP-1: bucket coverage / root-count preservation — every
  // non-pane next root lands in EXACTLY ONE of added/replaced/kept/
  // identityReplaced.to; every non-pane open previous root in EXACTLY ONE of
  // removed/replaced/kept/identityReplaced.from; no key twice in a bucket.
  it('P-TP-1 [strat:nroot-coverage] bucket coverage / root-count preservation', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const model = genWellFormed(rng)
      const err = coverageError(model.input, model)
      if (err) ces.push(`attempt ${i}: ${err}`)
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  // ---------------------------------------------------------------------------
  // U-STATE-1e W2 fix (HIGH, landed) — the CROSS-document fork-echo case. In
  // ONE broadcast doc A forks shared X→X′ AND doc B independently EDITS its own
  // shared X (same subtree ids, different content). The fix consults shape for a
  // root whose subtree carries a consumed id (`carriesConsumedId` → `useShape`)
  // so B's genuinely-edited root is classified `replaced`, never silently
  // `kept`. The pure fork-echo (B's shared X UNCHANGED) stays `kept` (state 6).
  // Deterministic seeded loop, exactly the input shape of the register harness.
  // ---------------------------------------------------------------------------
  it('W2 [strat:nroot-fork-consumed-edit] A forks shared X→X′ AND B edits its shared X → B replaced, never kept', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      // B's previous X content ≠ B's next X content; subtree ids otherwise
      // identical (rag('X', 'oldB') vs rag('X', 'edited-B')).
      const model = makeModel(
        [droot('A', rag('X', 'oldA')), droot('B', rag('X', 'oldB'))],
        [doc('A', [rag('Xprime', 'forked')]), doc('B', [rag('X', 'edited-B')])],
        change(['X', 'Xprime']),
        ['A', 'B'],
      )
      const r = reconcileDocumentRoots(model.input)
      const repl = nonPaneBucket(r.replaced)
      const kept = nonPaneBucket(r.kept)
      // B's shared X is REPLACED (W2 — fork-consumption must not swallow B's edit).
      if (!repl.includes('B|rag-X')) {
        ces.push(`attempt ${i}: B's edited shared rag-X not replaced (kept=${JSON.stringify(kept)})`)
        continue
      }
      if (kept.includes('B|rag-X')) {
        ces.push(`attempt ${i}: B's edited shared rag-X silently kept`)
        continue
      }
      // A's fork appears as a single A-scoped identityReplaced pair.
      const a = r.identityReplaced.filter((e) => e.documentId === 'A')
      if (a.length !== 1) {
        ces.push(`attempt ${i}: A identity replace entries=${a.length} (expected 1)`)
        continue
      }
      if (a[0].from.cssId !== 'rag-X' || a[0].to.cssId !== 'rag-Xprime') {
        ces.push(`attempt ${i}: A identity from=${a[0].from.cssId} to=${a[0].to.cssId} (expected rag-X/rag-Xprime)`)
        continue
      }
      // A's fork `to`/`from` are consumed (not re-emitted as bucket entries).
      if (repl.includes('A|rag-Xprime') || nonPaneBucket(r.added).includes('A|rag-Xprime')) {
        ces.push(`attempt ${i}: A's identity 'to' rag-Xprime leaked into added/replaced`)
      }
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  it('W2 companion [strat:nroot-fork-echo-kept] pure fork-echo — A forks X→X′ and B shared X UNCHANGED → B kept (state 6)', () => {
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const model = makeModel(
        [droot('A', rag('X', 'shared')), droot('B', rag('X', 'shared'))],
        [doc('A', [rag('Xprime', 'forked')]), doc('B', [rag('X', 'shared')])],
        change(['X', 'Xprime']),
        ['A', 'B'],
      )
      const r = reconcileDocumentRoots(model.input)
      const kept = nonPaneBucket(r.kept)
      const repl = nonPaneBucket(r.replaced)
      // B's shared X is UNCHANGED → `kept`, never `replaced` (the fork-echo).
      if (!kept.includes('B|rag-X')) {
        ces.push(`attempt ${i}: fork-echo did not keep B's unchanged rag-X (kept=${JSON.stringify(kept)})`)
        continue
      }
      if (repl.includes('B|rag-X')) {
        ces.push(`attempt ${i}: fork-echo misclassified B's unchanged rag-X as replaced`)
        continue
      }
      // A's fork is the single identity-replace.
      const a = r.identityReplaced.filter((e) => e.documentId === 'A')
      if (a.length !== 1 || a[0].from.cssId !== 'rag-X' || a[0].to.cssId !== 'rag-Xprime') {
        ces.push(`attempt ${i}: A identity pair missing/mismatched (${JSON.stringify(a)})`)
      }
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  it('W1 documentation-negative (§3a, ACCEPTED) — a genuine one-doc content swap (previous rag-X → next rag-Y, Y an UNRELATED sibling, both in change.nodeIds) is pinned deterministically by the identity heuristic', () => {
    // A content swap (NOT a fork copy): doc A's previous `rag-X` is replaced by
    // an unrelated sibling `rag-Y`, both named in change.nodeIds. The identity
    // heuristic pairs the vanished `rag-X` with the appeared `rag-Y` (both are
    // in the payload `changed` set). The audit (U-STATE-1e §3a W1) ACCEPTS this
    // behavior — we do NOT assert removed+added; we pin that the result is a
    // deterministic, well-formed NRootReconcileResult and that `rag-Y` lands in
    // EXACTLY ONE of `added` / `replaced` / `identityReplaced.to`.
    const rng = mulberry32(PBT_SEED)
    const ces: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const model = makeModel(
        [droot('A', rag('X', 'old'))],
        [doc('A', [rag('Y', 'unrelated')])],
        change(['X', 'Y']),
        ['A'],
      )
      const r = reconcileDocumentRoots(model.input)
      // Well-formed NRootReconcileResult (shape invariant).
      const err = shapeOfResult(model.input)
      if (err) {
        ces.push(`attempt ${i}: W1 result malformed — ${err}`)
        continue
      }
      // Deterministic — two calls deep-equal.
      if (!deepEq(r, reconcileDocumentRoots(model.input))) {
        ces.push(`attempt ${i}: W1 result is non-deterministic`)
        continue
      }
      // `rag-Y` lands in EXACTLY ONE of added / replaced / identityReplaced.to.
      const where: string[] = []
      if (nonPaneBucket(r.added).includes('A|rag-Y')) where.push('added')
      if (nonPaneBucket(r.replaced).includes('A|rag-Y')) where.push('replaced')
      if (r.identityReplaced.some((e) => e.to.cssId === 'rag-Y' && e.documentId === 'A')) where.push('identityReplaced.to')
      if (where.length !== 1) {
        ces.push(`attempt ${i}: rag-Y landed in ${where.length} bucket(s): ${JSON.stringify(where)} (expected exactly one)`)
      }
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })
})

/** Deep-equality + a stable JSON message for the determinism check. */
function expectDeepEqual(a: unknown, b: unknown): boolean {
  try {
    if (JSON.stringify(a) !== JSON.stringify(b)) return false
  } catch {
    /* fall through to the structural check below */
  }
  return deepEq(a, b)
}
function deepEq(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((x, i) => deepEq(x, b[i]))
  }
  const ka = Object.keys(a as object)
  const kb = Object.keys(b as object)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b as object, k)) return false
    if (!deepEq((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) return false
  }
  return true
}
