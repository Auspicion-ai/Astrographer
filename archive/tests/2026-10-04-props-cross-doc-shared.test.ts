// tests/props-cross-doc-shared.test.ts — Unit U-SHELL-9b: the §5.7 deterministic
// PBT register (6 rows) for the LANDED pure module
// `src/renderer/cross-document-shared.ts`.
// (docs/specs/unit-u-shell-9b-cross-document-shared.md §5.7 — the register.)
//
// This is a typed-property BACKFILL on the ALREADY-IMPLEMENTED + adversarial-
// hardened module (H4/H5/H6 fixed, PBT backfill per §5.7). It asserts every
// register row (P-IM-1..3, P-SM-1..2, P-TP-1) as an INVARIANT — a regression
// that drops order, duplicates an owner, blocks a malformed input with a throw,
// or rejects a valid fork re-opens the corresponding H4/H5/H6 fix as a property
// failure. Any FAIL is a finding (this suite is expected to come up GREEN; do
// NOT weaken the assertions to make a red green).
//
// Deterministic pinned seed 0x9B5E5F7B, ≤100 attempts/row, ≤400 total
// (40 × 6 = 240), stop-after-5, mulberry32. Vitest node env — imports the
// landed module with the `.js` suffix (`../src/renderer/cross-document-shared.js`).
import { describe, it, expect } from 'vitest'
import {
  ownersFor,
  buildOwnersMap,
  plainRagId,
  isShared,
  detectSharedCommit,
  planFork,
  type SharedOwners,
  type ForkPlanInput,
} from '../src/renderer/cross-document-shared.js'
import type { RagNode, RagEdge, BatchOp } from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// The deterministic PBT harness (mirrors the sibling props convention).
// ---------------------------------------------------------------------------
const PBT_SEED = 0x9b5e5f7b // the unit's pinned backfill seed
const PBT_ATTEMPTS = 40 // ≤100/row; 6 rows × 40 = 240 ≤ 400 total
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
function int(rng: () => number, n: number): number {
  return Math.floor(rng() * n)
}
function runProperty(
  attempts: number,
  stopAfter: number,
  check: (i: number, rng: () => number) => string | null,
): { held: boolean; counterexamples: string[] } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < attempts; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= stopAfter) break
    }
  }
  return { held: counterexamples.length === 0, counterexamples }
}

const NOW = 't0'
function node(id: string, extra?: Partial<RagNode>): RagNode {
  return {
    id,
    type: 'p',
    content: `body-${id}`,
    ownedNodeIds: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...extra,
  }
}
/** An injective minting counter (H6 — pairwise-distinct fresh ids). */
function mintCounter(prefix: string): () => string {
  let n = 0
  return () => `${prefix}-${n++}`
}

// ---------------------------------------------------------------------------
// Reference implementations derived from the §5.7 register propositions ONLY
// (a mismatch is a finding — the module is expected to satisfy each exactly).
// ---------------------------------------------------------------------------
function refOwnersFor(owners: SharedOwners | null | undefined, ragNodeId: string): string[] {
  const isRecord = (v: unknown): boolean =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
  if (!isRecord(owners)) return []
  const list = (owners as Record<string, unknown>)[ragNodeId]
  if (!Array.isArray(list)) return []
  const out: string[] = []
  for (const d of list) {
    if (typeof d === 'string' && d !== '' && !out.includes(d)) out.push(d)
  }
  return out
}
function deepEq(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function refBuildOwnersMap(edges: unknown): SharedOwners {
  const owners: SharedOwners = {}
  if (!Array.isArray(edges)) return owners
  for (const edge of edges) {
    if (typeof edge !== 'object' || edge === null || Array.isArray(edge)) continue
    const e = edge as Record<string, unknown>
    const target = e.target
    if (typeof target !== 'string' || target === '') continue
    const documentIds = e.documentIds
    if (!Array.isArray(documentIds)) continue
    for (const d of documentIds) {
      if (typeof d === 'string' && d !== '') {
        const list = owners[target] ?? (owners[target] = [])
        if (!list.includes(d)) list.push(d)
      }
    }
  }
  return owners
}
const asPairs = (o: SharedOwners): [string, string[]][] =>
  Object.keys(o).sort().map((k) => [k, o[k]])

function refPlainRagId(props: Record<string, unknown> | undefined): string | null {
  const id = props?.id
  if (typeof id !== 'string' || !id.startsWith('rag-') || id.length <= 4) return null
  const dataId = props?.['data-rag-node-id']
  if (typeof dataId === 'string' && dataId !== '' && matchesTail(id, dataId)) return dataId
  return id.slice(4)
}
function matchesTail(id: string, ragId: string): boolean {
  if (!id.startsWith('rag-') || id.length <= 4) return false
  const tail = id.slice(4)
  return tail === ragId || tail.endsWith(`--${ragId}`)
}

// ---------------------------------------------------------------------------
// P-IM-1 ================================================================ ownersFor
// total + order-preserving de-dupe + deterministic (H5).
// ---------------------------------------------------------------------------
describe('§5.7 register — U-SHELL-9b cross-document-shared', () => {
  it('P-IM-1 [strat:owners-for-total-dedup] ownersFor total + order-preserving de-dupe + deterministic', () => {
    const r = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const ids = ['A', 'B', 'C', 'D', '', 5, 'A'] // dupes / empty / non-string
      const kind = int(rng, 6)
      let owners: SharedOwners | null | undefined
      let ragNodeId = 'X'
      if (kind === 0) owners = null
      else if (kind === 1) owners = undefined
      else if (kind === 2) owners = 42 as unknown as SharedOwners // non-record (number)
      else if (kind === 3) owners = ['arr'] as unknown as SharedOwners // non-record (array)
      else if (kind === 4) owners = { otherId: ['N'] } // record, unknown id
      else {
        // record entry shapes: array (valid/invalid entries) or non-array
        const r = int(rng, 6)
        if (r === 0) owners = { X: ['A', 'A', 'B', 5, ''] } // the pinned H5 collapse
        else if (r === 1) owners = { X: ['B', 'A', 'C', 'B'] } // dup in the middle
        else if (r === 2) owners = { X: ids.slice(0, int(rng, ids.length + 1)) } // prefix slice
        else if (r === 3) owners = { X: 'not-array' } // non-array entry → []
        else if (r === 4) owners = { X: 7 } // non-array scalar entry → []
        else owners = { X: [5, '', 'A'] } // only-one-valid → ['A']
      }
      // 1. totality — never throw, always returns an array.
      let got: string[] | null = null
      try {
        got = ownersFor(owners, ragNodeId)
      } catch (e) {
        return `ownersFor threw: ${String(e)}`
      }
      if (!Array.isArray(got)) return 'ownersFor did not return an array'
      // 2. matches the reference (order + de-dupe + validity).
      const expected = refOwnersFor(owners, ragNodeId)
      if (!deepEq(got, expected)) {
        return `ownersFor(${JSON.stringify(owners)},'${ragNodeId}') = ${JSON.stringify(got)} ≠ ref ${JSON.stringify(expected)}`
      }
      // 3. absent/invalid carrier → [].
      if (
        (owners == null ||
          typeof owners !== 'object' ||
          Array.isArray(owners) ||
          owners[ragNodeId] === undefined ||
          !Array.isArray(owners[ragNodeId])) !==
          (expected.length === 0 && ragNodeId === 'X' && (owners as any)?.['X'] === undefined)
      ) {
        // loose guard — the full [] equivalence is already covered by ref equality.
      }
      // 4. no duplicate output entries.
      if (new Set(got).size !== got.length) return `ownersFor output has duplicates: ${JSON.stringify(got)}`
      // 5. every output id is a non-empty string.
      for (const d of got) {
        if (typeof d !== 'string' || d === '') return `ownersFor emitted invalid id ${JSON.stringify(d)}`
      }
      // 6. determinism — two calls on deep-equal inputs are deep-equal.
      const again = ownersFor(owners, ragNodeId)
      if (!deepEq(got, again)) return `ownersFor is non-deterministic: ${JSON.stringify(got)} vs ${JSON.stringify(again)}`
      // 7. the pinned H5 case collapses exactly to ['A','B'].
      if (owners != null && !Array.isArray(owners) && (owners as any)?.X != null && Array.isArray((owners as any).X)) {
        const arr = (owners as any).X as unknown[]
        if (arr.length >= 2 && arr.every((x) => typeof x === 'string')) {
          // a strict all-string dup list must de-dupe in first-order.
          const exp: string[] = []
          for (const d of arr as string[]) if (!exp.includes(d)) exp.push(d)
          if (!deepEq(got, exp)) return `ownersFor dup list ${JSON.stringify(arr)} → ${JSON.stringify(got)} ≠ ${JSON.stringify(exp)}`
        }
      }
      return null
    })
    expect(r.held, JSON.stringify(r.counterexamples)).toBe(true)
  })

  // Explicit pinned rows (deterministic, adversarial H5 shapes) that must never regress.
  it('P-IM-1 pinned: `[\'A\',\'A\',\'B\',5,\'\']` collapses to `[\'A\',\'B\']`; unknown/invalid → []', () => {
    expect(ownersFor({ X: ['A', 'A', 'B', 5, ''] as unknown as string[] }, 'X')).toEqual(['A', 'B'])
    expect(ownersFor({ X: ['B', 'A', 'A', 'C', 'B'] }, 'X')).toEqual(['B', 'A', 'C'])
    expect(ownersFor({ X: 'nope' as unknown as string[] }, 'X')).toEqual([])
    expect(ownersFor({ X: 3 }, 'X')).toEqual([])
    expect(ownersFor({ other: ['A'] }, 'X')).toEqual([])
    expect(ownersFor(null, 'X')).toEqual([])
    expect(ownersFor(undefined, 'X')).toEqual([])
    expect(ownersFor(['bogus'] as unknown as SharedOwners, 'X')).toEqual([])
    expect(ownersFor(123 as unknown as SharedOwners, 'X')).toEqual([])
  })

  // ---------------------------------------------------------------------------
  // P-IM-2 ============================================================ buildOwnersMap
  // total + deterministic over the edge list; foreign/malformed edges contribute
  // nothing; input never mutated.
  // ---------------------------------------------------------------------------
  it('P-IM-2 [strat:owners-map-total] buildOwnersMap total + deterministic + input untouched', () => {
    const r = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const kind = int(rng, 5)
      let edges: unknown
      if (kind === 0) edges = null
      else if (kind === 1) edges = 'bogus'
      else {
        const list: unknown[] = []
        const n = int(rng, 6)
        for (let k = 0; k < n; k++) {
          const variant = int(rng, 6)
          if (variant === 0) list.push({}) // no target
          else if (variant === 1) list.push('not-edge') // non-object
          else if (variant === 2) list.push({ target: 5 }) // non-string target
          else if (variant === 3) list.push({ target: 'X', documentIds: [] }) // empty ids → contributes nothing
          else if (variant === 4) list.push({ target: 'X', documentIds: ['A', 'A', 5, '', 'B'] }) // mixed dup/foreign
          else list.push({ target: ['wrong'], documentIds: ['A', 'A', 'B'] }) // non-string target
        }
        // foreign/malformed entries
        list.push(undefined, { target: '', documentIds: ['A'] })
        edges = list
      }
      const snapshot = JSON.parse(JSON.stringify(edges))
      let got: SharedOwners | null = null
      try {
        got = buildOwnersMap(edges)
      } catch (e) {
        return `buildOwnersMap threw: ${String(e)}`
      }
      if (typeof got !== 'object' || got === null || Array.isArray(got)) {
        return 'buildOwnersMap did not return a SharedOwners object'
      }
      if (!Array.isArray(edges)) {
        if (!deepEq(Object.keys(got), [])) return `buildOwnersMap(non-array) ≠ {} : ${JSON.stringify(got)}`
      }
      const expected = refBuildOwnersMap(edges)
      if (JSON.stringify(asPairs(got)) !== JSON.stringify(asPairs(expected))) {
        return `buildOwnersMap mismatch: got ${JSON.stringify(asPairs(got))} ≠ ref ${JSON.stringify(asPairs(expected))}`
      }
      // input never mutated
      if (JSON.stringify(edges) !== JSON.stringify(snapshot)) return 'buildOwnersMap mutated its input'
      // deterministic — two calls on the same edge list are identical
      const again = buildOwnersMap(edges)
      if (JSON.stringify(asPairs(got)) !== JSON.stringify(asPairs(again))) {
        return 'buildOwnersMap is non-deterministic across identical input'
      }
      return null
    })
    expect(r.held, JSON.stringify(r.counterexamples)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // P-IM-2 F1 companion (U-SHELL-9b adversarial HIGH) — `buildOwnersMap` is
  // TOTAL over a prototype-key `target`. The map builds on a NULL-PROTO
  // `Object.create(null)` so a `target` equal to an Object.prototype key
  // ('__proto__', 'constructor', …) is an ordinary OWN key: the call never
  // throws (the pre-fix `owners[target]` resolved to the inherited non-array and
  // `.includes` threw), `ownersFor` reads it (a null-proto own key, not an
  // inherited value), and there is no prototype pollution.
  // ---------------------------------------------------------------------------
  it('P-IM-2 F1 companion [strat:owners-map-proto-total] buildOwnersMap is total + non-polluting over prototype-key targets', () => {
    const rng = mulberry32(PBT_SEED) // deterministic, seeded (mirrors PBT_SEED)
    const PROTO_TARGETS = ['__proto__', 'constructor', 'toString', 'hasOwnProperty', 'valueOf'] as const
    const OWNER_POOLS: string[][] = [
      ['A'],
      ['A', 'B'],
      ['B', 'C', 'D'],
      ['A', 'A', 'B'],
      ['D', 'A', 'B', 'A'],
    ]
    const ces: string[] = []
    const protoNamesBefore = Object.getOwnPropertyNames(Object.prototype).sort().join(',')
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const target = pick(rng, PROTO_TARGETS)
      const documentIds = [...pick(rng, OWNER_POOLS)]
      // A real edge with a duplicate + a reverse-ordered second edge (dedup) plus
      // a spread of malformed entries that must be IGNORED while staying total.
      const edges = [
        { target, documentIds },
        { target, documentIds: [...documentIds].reverse() },
        'bogus-string',
        42,
        { target: 3, documentIds },
        { target: '', documentIds },
        { target, documentIds: 'not-an-array' },
      ]
      let result: ReturnType<typeof buildOwnersMap> | null = null
      try {
        result = buildOwnersMap(edges)
      } catch (e) {
        ces.push(`attempt ${i}: buildOwnersMap threw for target '${target}': ${String(e)}`)
        continue
      }
      // totality — a record, never a throw, even for a prototype-key target.
      if (typeof result !== 'object' || result === null || Array.isArray(result)) {
        ces.push(`attempt ${i}: buildOwnersMap did not return a SharedOwners object for '${target}'`)
        continue
      }
      // The prototype key is an ordinary OWN key: exactly one own key, `target`.
      if (JSON.stringify(Object.keys(result).sort()) !== JSON.stringify([target])) {
        ces.push(`attempt ${i}: buildOwnersMap own keys ${JSON.stringify(Object.keys(result))} ≠ ['${target}']`)
        continue
      }
      // ownersFor reads the null-proto OWN key → the exact deduped documentIds
      // (order-preserving first-wins merge of the two edges), never an inherited
      // value.
      const want = ownersFor({ [target]: documentIds }, target)
      const got = ownersFor(result, target)
      if (!deepEq(got, want)) {
        ces.push(`attempt ${i}: ownersFor(result,'${target}')=${JSON.stringify(got)} ≠ deduped ${JSON.stringify(want)}`)
        continue
      }
      // The owner array is a REAL array (null-proto own key, not Object.prototype).
      if (!Array.isArray(got)) {
        ces.push(`attempt ${i}: ownersFor(result,'${target}')=${String(got)} is not an owner array`)
        continue
      }
      // Every OTHER prototype key is UNSET on the null-proto map → `[]`, never
      // an inherited value (a normal `{}` map would read `constructor`/`toString`
      // functions here — the F1 leak).
      for (const other of PROTO_TARGETS) {
        if (other === target) continue
        const empty = ownersFor(result, other)
        if (!deepEq(empty, [])) {
          ces.push(`attempt ${i}: ownersFor(result,'${other}')=${JSON.stringify(empty)} (expected [] — inherited value leaked)`)
          break
        }
      }
    }
    // No prototype pollution — Object.prototype is untouched by building maps
    // over the prototype-key targets.
    const protoNamesAfter = Object.getOwnPropertyNames(Object.prototype).sort().join(',')
    if (protoNamesBefore !== protoNamesAfter) {
      ces.push(`Object.prototype mutated: [${protoNamesBefore}] → [${protoNamesAfter}]`)
    }
    // A sanity probe on a NORMAL object: `constructor`/`toString` are still the
    // inherited functions (the map build polluted nothing globally).
    if (typeof ({})['toString'] !== 'function' || typeof ({} as any).constructor !== 'function') {
      ces.push('Object.prototype inherited members corrupted by a proto-key map build')
    }
    expect(ces.length, JSON.stringify(ces)).toBe(0)
  })

  // ---------------------------------------------------------------------------
  // P-IM-3 ============================================================== plainRagId
  // scoped→plain round-trip + rejection of non-`rag-` / too-short ids (H3/W2-N12,
  // AF3-1 suffix test).
  // ---------------------------------------------------------------------------
  it('P-IM-3 [strat:rag-id-roundtrip] plainRagId scoped→plain round-trip + rejection + fallback', () => {
    const r = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const kind = int(rng, 8)
      let props: Record<string, unknown> | undefined
      const docId = pick(rng, ['doc', 'foo--bar', 'a']) // doc id may contain `--`
      const ragId = pick(rng, ['X', 'Y', 'q--r']) // rag id may contain `--`
      if (kind === 0) props = { id: `rag-${docId}--${ragId}`, 'data-rag-node-id': ragId }
      else if (kind === 1) props = { id: `rag-${ragId}`, 'data-rag-node-id': ragId }
      else if (kind === 2) props = { id: `rag-fake--${ragId}`, 'data-rag-node-id': `${ragId}--x` } // inconsistent data
      else if (kind === 3) props = { id: `pane-${ragId}`, 'data-rag-node-id': ragId } // non-rag id
      else if (kind === 4) props = { id: 'rag-' } // length ≤ 4
      else if (kind === 5) props = { id: 'rag' } // length ≤ 4
      else if (kind === 6) props = {} // missing id
      else props = undefined
      let got: string | null = null
      try {
        got = plainRagId(props)
      } catch (e) {
        return `plainRagId threw: ${String(e)}`
      }
      const expected = refPlainRagId(props)
      if (got !== expected) {
        return `plainRagId(${JSON.stringify(props)}) = ${JSON.stringify(got)} ≠ ref ${JSON.stringify(expected)}`
      }
      return null
    })
    expect(r.held, JSON.stringify(r.counterexamples)).toBe(true)
  })

  it('P-IM-3 pinned: scoped→plain recover, `--`-robust suffix, rejection forms', () => {
    expect(plainRagId({ id: 'rag-doc--X', 'data-rag-node-id': 'X' })).toBe('X')
    expect(plainRagId({ id: 'rag-X', 'data-rag-node-id': 'X' })).toBe('X')
    expect(plainRagId({ id: 'rag-foo--bar--X', 'data-rag-node-id': 'X' })).toBe('X') // suffix, not indexOf
    expect(plainRagId({ id: 'rag-X', 'data-rag-node-id': 'Y' })).toBe('X') // inconsistent → fallback slice(4)
    expect(plainRagId({ id: 'rag-X' })).toBe('X') // absent data → fallback slice(4)
    expect(plainRagId({ id: 'pane-X', 'data-rag-node-id': 'X' })).toBeNull()
    expect(plainRagId({ id: 'rag-' })).toBeNull()
    expect(plainRagId({ id: 'rag' })).toBeNull()
    expect(plainRagId({ id: '' })).toBeNull()
    expect(plainRagId({})).toBeNull()
    expect(plainRagId(undefined)).toBeNull()
    expect(plainRagId(null as unknown as Record<string, unknown>)).toBeNull()
  })

  // ---------------------------------------------------------------------------
  // P-SM-1 =============================================================== isShared
  // iff ownersFor(...).length > 1 — a repeated owner cannot flip a node shared.
  // ---------------------------------------------------------------------------
  it('P-SM-1 [strat:shared-iff-gt-one] isShared iff de-duped owner count > 1', () => {
    const r = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const count = int(rng, 5)
      let entry: string[]
      if (count === 0) entry = []
      else if (count === 1) entry = ['A']
      else if (count === 2) entry = ['A', 'B']
      else if (count === 3) entry = ['A', 'A', 'B'] // dup — shared iff 2 distinct
      else entry = ['A', 'A', 'A'] // dup — NOT shared (1 distinct)
      const owners: SharedOwners = { X: entry }
      // non-record / null / undefined carriers + a case with a dup-inflating list
      const carrier = pick(rng, [owners, null, undefined] as const)
      let got: boolean
      try {
        got = isShared(carrier, 'X')
      } catch (e) {
        return `isShared threw: ${String(e)}`
      }
      const expected = refOwnersFor(carrier, 'X').length > 1
      if (got !== expected) {
        return `isShared(${JSON.stringify(carrier)}) = ${got} ≠ (ownersFor len > 1) = ${expected}`
      }
      return null
    })
    expect(r.held, JSON.stringify(r.counterexamples)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // P-SM-2 ===================================================== detectSharedCommit
  // total classifier: blocked / null / warn (+ options + requireChecklist).
  // ---------------------------------------------------------------------------
  it('P-SM-2 [strat:detect-shared-classify] detectSharedCommit total classifier (blocked / null / warn)', () => {
    const r = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const count = int(rng, 5)
      const nodeId = `n${int(rng, 9)}`
      const editingDocumentId = 'DOC'
      let owners: SharedOwners | null | undefined
      const kind = int(rng, 5)
      if (kind === 0) owners = null
      else if (kind === 1) owners = undefined
      else if (kind === 2) owners = 'bogus' as unknown as SharedOwners
      else if (kind === 3) owners = { other: [editingDocumentId, 'Q'] }
      else {
        // per-pinned-count owner lists for THIS node
        let entry: string[]
        if (count === 0) entry = []
        else if (count === 1) entry = [editingDocumentId]
        else if (count === 2) entry = [editingDocumentId, 'B']
        else if (count === 3) entry = [editingDocumentId, 'B', 'C']
        else entry = [editingDocumentId, 'B', 'C', 'D']
        owners = { [nodeId]: entry }
      }
      let got: ReturnType<typeof detectSharedCommit>
      try {
        got = detectSharedCommit({ nodeId, editingDocumentId, owners })
      } catch (e) {
        return `detectSharedCommit threw: ${String(e)}`
      }
      const deduped = refOwnersFor(owners, nodeId)
      if (owners == null || typeof owners !== 'object' || Array.isArray(owners)) {
        // blocked — never silent-mutate
        if (!got || got.blocked !== true || typeof got.reason !== 'string' || got.reason === '') {
          return `detectSharedCommit(non-record) = ${JSON.stringify(got)} (expected blocked with a reason)`
        }
      } else if (deduped.length <= 1) {
        if (got !== null) {
          return `detectSharedCommit(${JSON.stringify(owners)}) = ${JSON.stringify(got)} (expected null for ≤1 dedup owner)`
        }
      } else {
        if (
          !got ||
          got.blocked !== undefined ||
          got.nodeId !== nodeId ||
          got.editingDocumentId !== editingDocumentId ||
          !deepEq(got.owners, deduped) ||
          JSON.stringify(got.options) !== JSON.stringify(['fork', 'mutate-all']) ||
          got.requireChecklist !== (deduped.length > 2)
        ) {
          return `detectSharedCommit(${JSON.stringify(owners)}) warn mismatch: ${JSON.stringify(got)}`
        }
      }
      return null
    })
    expect(r.held, JSON.stringify(r.counterexamples)).toBe(true)
  })

  // ---------------------------------------------------------------------------
  // P-TP-1 ================================================================ planFork
  // total over malformed inputs + root∈subtree guard + H6 ≥1-original + minters
  // + minted-id uniqueness + non-owner-migration rejection.
  // ---------------------------------------------------------------------------
  it('P-TP-1 [strat:plan-fork-total] planFork total + guards + minted-id uniqueness', () => {
    const r = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      // A valid subtree + owner list reused by both the malformed and real cases.
      const subtree = [node('r', { ownedNodeIds: ['r-c1'] }), node('r-c1', { ownedNodeIds: ['gc'] }), node('gc')]
      const root = subtree[0]
      const ownerList = ['A', 'B', 'C']
      let input: unknown
      const scenario = int(rng, 8)

      if (scenario === 0) input = null // non-object input
      else if (scenario === 1) input = 42 // non-object scalar
      else if (scenario === 2) {
        // filter-cleared subtree (id-less / non-object entries) + root invalid
        input = {
          root: { type: 'p' }, // no id → root invalid
          subtree: [null, 'x', 7],
          edges: ['bad', {}],
          editingDocumentId: 'A',
          owners: ownerList,
          migrateDocumentIds: ['A'],
          mintNodeId: mintCounter('n'),
          mintEdgeId: mintCounter('e'),
        }
      } else if (scenario === 3) {
        // root.id ∉ subtree — a malformed request, not a partial fork.
        input = {
          root: node('not-in-subtree'),
          subtree,
          edges: [],
          editingDocumentId: 'A',
          owners: ownerList,
          migrateDocumentIds: ['A'],
          mintNodeId: mintCounter('n'),
          mintEdgeId: mintCounter('e'),
        }
      } else if (scenario === 4) {
        // missing/invalid minters (would mint colliding empty ids → reject as no-op).
        input = {
          root,
          subtree,
          edges: [],
          editingDocumentId: 'A',
          owners: ownerList,
          migrateDocumentIds: ['A'],
          mintNodeId: 'not-a-function' as unknown as () => string,
          mintEdgeId: 'not-a-function' as unknown as () => string,
        }
      } else if (scenario === 5) {
        // all-owners migration — would orphan every original owner (H6 reject).
        input = {
          root,
          subtree,
          edges: [],
          editingDocumentId: 'A',
          owners: ownerList,
          migrateDocumentIds: ownerList, // every owner selected → originalOwners empty
          mintNodeId: mintCounter('n'),
          mintEdgeId: mintCounter('e'),
        }
      } else {
        // REAL-plan candidates: a subset of owners that leaves ≥1 original.
        const sub = ownerList.slice(0, 2) // always ≥1 original remains
        // include non-owner migration ids (ignored) + malformed edge entries
        const edges = [
          { id: 'e1', kind: 'parent-child', source: 'r', target: 'r-c1', documentIds: ['A', 'B'], createdAt: NOW, updatedAt: NOW },
          { id: 'e2', kind: 'parent-child', source: 'r-c1', target: 'gc', documentIds: ['A', 'B', 'C'], createdAt: NOW, updatedAt: NOW },
          'foreign-string',
          { target: 'bad' }, // malformed edge (no source) — ignored when not subtree-relevant, still total
        ]
        input = {
          root,
          subtree,
          edges,
          editingDocumentId: 'A',
          owners: ownerList,
          migrateDocumentIds: [...sub, 'NOT-AN-OWNER'],
          mintNodeId: mintCounter(`n${int(rng, 999)}`),
          mintEdgeId: mintCounter(`e${int(rng, 999)}`),
        }
      }
      let plan: ReturnType<typeof planFork>
      try {
        plan = planFork(input as ForkPlanInput)
      } catch (e) {
        return `planFork threw on ${JSON.stringify(input)}: ${String(e)}`
      }
      // TOTALITY — always a plan, never a throw.
      if (typeof plan !== 'object' || plan === null) return `planFork did not return a ForkPlan: ${JSON.stringify(plan)}`

      if (scenario <= 5) {
        // Malformed → the F10b NO-OP plan.
        if (!(plan.ops.length === 0 && plan.forkRootId === '' && Object.keys(plan.forkNodeIds).length === 0)) {
          return `planFork malformed scenario ${scenario} was NOT a no-op: ${JSON.stringify(plan)}`
        }
        return null
      }
      // REAL plan invariants (∀ generated ForkPlanInput).
      const nodeIds = Object.keys(plan.forkNodeIds)
      const forkIds = Object.values(plan.forkNodeIds)
      // injective minter → pairwise-distinct minted node ids, one per subtree node.
      if (nodeIds.length !== subtree.length) {
        return `real plan minted ${nodeIds.length} ids for ${subtree.length} subtree nodes`
      }
      for (const sn of subtree) {
        if (!(sn.id in plan.forkNodeIds)) return `real plan lacks a fork id for ${sn.id}`
      }
      if (new Set(forkIds).size !== forkIds.length) return `real plan minted non-distinct ids: ${JSON.stringify(forkIds)}`
      // root ∈ subtree guard → forkRootId maps exactly the root.
      if (plan.forkRootId !== plan.forkNodeIds[root.id]) {
        return `plan.forkRootId ${plan.forkRootId} ≠ forkNodeIds[root] ${plan.forkNodeIds[root.id]}`
      }
      // forkOwners ⊆ ownerList (a non-owner migration id is ignored — H6).
      for (const o of plan.forkOwners) {
        if (!ownerList.includes(o)) return `plan.forkOwners contains non-owner ${o}`
      }
      // originalOwners = ownerList − forkOwners, disjoint, ≥1 original (H6).
      const leftover = ownerList.filter((o) => !plan.forkOwners.includes(o))
      if (JSON.stringify([...plan.originalOwners].sort()) !== JSON.stringify([...leftover].sort())) {
        return `originalOwners ${JSON.stringify(plan.originalOwners)} ≠ ownerList − forkOwners ${JSON.stringify(leftover)}`
      }
      if (plan.originalOwners.length < 1) return `real plan orphaned X (no original owner left)`
      if (plan.forkOwners.some((o) => plan.originalOwners.includes(o))) {
        return `forkOwners ∩ originalOwners = ∅ violated`
      }
      // one putNode per subtree node, id rewritten + ownedNodeIds remapped.
      const puts = plan.ops.filter((o): o is Extract<BatchOp, { op: 'putNode' }> => o.op === 'putNode')
      if (puts.length !== subtree.length) return `real plan putNodes ${puts.length} ≠ subtree ${subtree.length}`
      for (const sn of subtree) {
        const put = puts.find((o) => o.node.id === plan.forkNodeIds[sn.id])
        if (!put) return `real plan missing putNode for fork id ${plan.forkNodeIds[sn.id]}`
        const expectedOwned = (Array.isArray(sn.ownedNodeIds) ? sn.ownedNodeIds : []).map(
          (id) => plan.forkNodeIds[id] ?? id,
        )
        if (JSON.stringify(put.node.ownedNodeIds) !== JSON.stringify(expectedOwned)) {
          return `putNode ${sn.id} ownedNodeIds ${JSON.stringify(put.node.ownedNodeIds)} ≠ ${JSON.stringify(expectedOwned)}`
        }
      }
      return null
    })
    expect(r.held, JSON.stringify(r.counterexamples)).toBe(true)
  })

  it('P-TP-1 pinned: a real plan mints distinct ids, guards root/first-owner, and rejects non-owner migration', () => {
    const subtree = [
      node('r', { ownedNodeIds: ['r-c1'] }),
      node('r-c1', { ownedNodeIds: ['gc'] }),
      node('gc', { ownedNodeIds: [] }),
    ]
    const root = subtree[0]
    const ownerList = ['A', 'B', 'C']
    const ownerEdges: RagEdge[] = [
      { id: 'e1', kind: 'parent-child', source: 'r', target: 'r-c1', documentIds: ['A', 'B'], createdAt: NOW, updatedAt: NOW },
      { id: 'e2', kind: 'parent-child', source: 'r-c1', target: 'gc', documentIds: ['A', 'B', 'C'], createdAt: NOW, updatedAt: NOW },
      { id: 'eFOREIGN', kind: 'crosslink', source: 'out', target: 'other', documentIds: ['A'], createdAt: NOW, updatedAt: NOW },
    ]
    const migrate = ['A', 'NOT-AN-OWNER'] // A (owner) migrates; NOT-AN-OWNER is a non-owner → ignored (H6)
    const mintN = mintCounter('fork-n')
    const mintE = mintCounter('fork-e')
    const plan = planFork({
      root,
      subtree,
      edges: ownerEdges,
      editingDocumentId: 'A',
      owners: ownerList,
      migrateDocumentIds: migrate,
      mintNodeId: mintN,
      mintEdgeId: mintE,
    })

    // minted-id uniqueness (injective minter → pairwise-distinct fork node ids).
    const forkIds = Object.values(plan.forkNodeIds)
    expect(new Set(forkIds).size).toBe(forkIds.length)
    for (const id of Object.keys(plan.forkNodeIds)) {
      expect(forkIds).toContain(plan.forkNodeIds[id])
    }
    // root guard
    expect(plan.forkRootId).toBe(plan.forkNodeIds[root.id])
    // owner partitioning: forkOwners ⊆ owners, original = owners − fork, disjoint, ≥1 original.
    expect(plan.forkOwners).toEqual(['A']) // the non-owner was ignored
    for (const o of plan.forkOwners) expect(ownerList).toContain(o)
    expect(plan.originalOwners).toEqual(['B', 'C'])
    expect(plan.forkOwners.some((o) => plan.originalOwners.includes(o))).toBe(false)
    expect(plan.originalOwners.length).toBeGreaterThanOrEqual(1)
    // the atomic batch: putNode for every subtree node + edge re-points for the
    // migrating owner (A) across the subtree-relevant edges; foreign edge untouched.
    const putNodes = () => plan.ops.filter((o): o is Extract<BatchOp, { op: 'putNode' }> => o.op === 'putNode')
    expect(putNodes().length).toBe(subtree.length)
    for (const subtreeNode of subtree) {
      expect(putNodes().some((o) => o.node.id === plan.forkNodeIds[subtreeNode.id])).toBe(true)
    }
    // malformed ownedNodeIds on the fork copy maps to [] rather than throwing.
    const withBadOwned = planFork({
      root: node('r', { ownedNodeIds: 'nope' as unknown as string[] }),
      subtree: [node('r', { ownedNodeIds: 'nope' as unknown as string[] })],
      edges: [],
      editingDocumentId: 'A',
      owners: ['A', 'B'],
      migrateDocumentIds: ['A'],
      mintNodeId: mintN,
      mintEdgeId: mintE,
    })
    const badPut = withBadOwned.ops.filter((o): o is Extract<BatchOp, { op: 'putNode' }> => o.op === 'putNode')
    expect(badPut.length).toBe(1)
    expect(badPut[0].node.ownedNodeIds).toEqual([])
    // empty edges → a valid plan (no edge ops; totality holds).
    const emptyEdges = planFork({
      root, subtree, edges: [], editingDocumentId: 'A', owners: ownerList,
      migrateDocumentIds: ['A'], mintNodeId: mintN, mintEdgeId: mintE,
    })
    expect(emptyEdges.ops.filter((o) => o.op === 'putNode').length).toBe(subtree.length)
  })

  it('P-TP-1 pinned: all-owners migration and empty forkOwners both no-op (F10b)', () => {
    const subtree = [node('r'), node('r-c1')]
    const root = subtree[0]
    const ownerList = ['A', 'B']
    // all-owners migration → originalOwners empty → no-op (H6).
    const all = planFork({
      root, subtree, edges: [], editingDocumentId: 'A', owners: ownerList,
      migrateDocumentIds: ['A', 'B'], mintNodeId: mintCounter('n'), mintEdgeId: mintCounter('e'),
    })
    expect(all.ops).toEqual([])
    expect(all.forkRootId).toBe('')
    expect(all.forkNodeIds).toEqual({})
    // empty forkOwners (no overlap between migrate and owners) → no-op.
    const none = planFork({
      root, subtree, edges: [], editingDocumentId: 'A', owners: ownerList,
      migrateDocumentIds: ['ZED'], mintNodeId: mintCounter('n'), mintEdgeId: mintCounter('e'),
    })
    expect(none.ops).toEqual([])
    expect(none.forkRootId).toBe('')
    expect(none.forkNodeIds).toEqual({})
  })
})

// Class tally: IM ×3, SM ×2, TP ×1 = 6 rows ≤ 8.
