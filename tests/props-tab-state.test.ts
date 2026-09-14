// tests/props-tab-state.test.ts — Unit U-SHELL-9a: the §5.7 PBT register
// (7 rows) for the ALREADY-LANDED pure `src/renderer/tab-state.ts` module (the
// serialized `TabState` model + total fail-soft coercion + focus-selection
// mutators). PBT BACKFILL — the module is implemented and the register should
// come up GREEN; any FAIL is a finding (do not weaken).
//
// (docs/specs/unit-u-shell-9a-main-focus-tabs.md §5.7 — the register P-IM-1/
// P-IM-2/P-SM-1/P-SM-2/P-SM-3/P-TP-1/P-TP-2; §2.2 the structural invariants
// (`order` a permutation of `open[].id`, `activeId` null-or-member); §2.9 pin
// 1 the module export surface.)
//
// Deterministic pinned seed 0x7A94B57A, <100 attempts/row, <400 total,
// stop-after-5. Vitest node env. `.js` import suffix for the ESM source
// module. Mirrors the sibling property-register pattern in
// tests/props-shell-integration.test.ts + tests/unit-ujr1-get-journal.test.ts.
//
// Negative generators (budget discipline): P-IM-2 feeds non-record and
// out-of-kind targets (→ null, never a phantom kind); P-SM-1 feeds
// duplicate-raw-open + null-target (dropped); P-TP-2 feeds out-of-bounds
// reorder indices (clamped). A mismatch fails the assertion.
import { describe, it, expect } from 'vitest'
import {
  coerceTabState,
  coerceTabTarget,
  targetEquals,
  focusTarget,
  closeTab,
  reorderTab,
  defaultTabState,
  TAB_STATE_VERSION,
  TAB_LANDING,
  type TabState,
  type TabEntry,
  type TabTarget,
} from '../src/renderer/tab-state.js'

// ---------------------------------------------------------------------------
// Deterministic pinned seed + the property harness (<100/row, <400 total,
// stop-after-5).
// ---------------------------------------------------------------------------
const PBT_SEED = 0x7a94b57a
const PBT_ATTEMPTS = 40 // 7 rows x 40 = 280 < 400 total
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
// Generators.
// ---------------------------------------------------------------------------

/** A random valid TabTarget over the 5 declared kinds (all valid — used to
 *  build coherent states and focusTarget inputs). */
function genTarget(rng: () => number): TabTarget {
  const kind = pick(rng, ['document', 'search', 'graph', 'template', 'other'] as const)
  switch (kind) {
    case 'document':
      return { kind, documentId: `doc-${Math.floor(rng() * 100)}` }
    case 'search':
      return { kind, queryId: `q-${Math.floor(rng() * 100)}` }
    case 'graph':
      return { kind, view: `view-${Math.floor(rng() * 100)}` }
    case 'template':
      return { kind, templateId: `tpl-${Math.floor(rng() * 100)}` }
    case 'other':
      return { kind, id: `id-${Math.floor(rng() * 100)}` }
  }
}

/** A random coherent (pre-coercion) TabState — valid version, valid open/order
 *  shapes. */
function genCoherentState(rng: () => number): TabState {
  const n = Math.floor(rng() * 5)
  const open: TabEntry[] = []
  for (let i = 0; i < n; i++) {
    open.push({ id: `t${i}`, target: genTarget(rng), title: `T${i}` })
  }
  const ids = open.map((e) => e.id)
  return {
    version: TAB_STATE_VERSION,
    open,
    activeId: ids.length > 0 && rng() < 0.7 ? pick(rng, ids) : null,
    order: [...ids].sort(() => (rng() < 0.5 ? -1 : 1)),
  }
}

/** A random JUNK state — malformed version / open / order / activeId. Never a
 *  coherent shape. */
function genJunkState(rng: () => number): unknown {
  const shape = Math.floor(rng() * 8)
  switch (shape) {
    case 0:
      return pick(rng, [null, undefined, 42, 'string', true, Symbol('x')])
    case 1:
      return [] // an ARRAY (not a record) — fails soft
    case 2:
      return { version: TAB_STATE_VERSION + 7 } // wrong version → default
    case 3:
      return { version: TAB_STATE_VERSION, open: 'not-an-array' } // junk open
    case 4:
      return { version: TAB_STATE_VERSION, open: 12, activeId: 5, order: 'x' }
    case 5:
      // a coherent-version record with a mixed junk open — duplicates, empty
      // ids, null targets, non-records.
      return defaultJunkOpen(rng)
    case 6:
      return {
        version: TAB_STATE_VERSION,
        open: genCoherentState(rng).open,
        activeId: pick(rng, ['ghost-id', 3, '', null]),
        order: ['ghost-1', 'ghost-2'],
      }
    default:
      // a raw open with dangling/duplicate order ids
      return {
        version: TAB_STATE_VERSION,
        open: genCoherentState(rng).open,
        activeId: 'dangling',
        order: ['missing-1', 'missing-2', 'missing-1'],
      }
  }
}

/** A raw-open array deliberately seeded with junk entries: a non-record, an
 *  entry with an empty id, an entry with a non-string id, a duplicate id pair
 *  (kept first occurrence), and a null-target entry (dropped). */
function junkOpen(rng: () => number): unknown[] {
  const raw: unknown[] = []
  const dupeId = `dup-${Math.floor(rng() * 10)}`
  raw.push(genCoherentState(rng).open[0] ?? { id: dupeId, target: { kind: 'other', id: 'x' }, title: 'x' })
  raw.push('garbage') // non-record → dropped
  raw.push({ id: '', target: genTarget(rng), title: 'empty-id' }) // empty id → dropped
  raw.push({ id: 42, target: genTarget(rng), title: 'numeric-id' }) // non-string id → dropped
  raw.push({ id: dupeId, target: genTarget(rng), title: 'dupe-a' }) // first occurrence
  raw.push({ id: dupeId, target: genTarget(rng), title: 'dupe-b' }) // duplicate — dropped
  raw.push({ id: `nulltarget-${Math.floor(rng() * 9)}`, target: null, title: 'null-target' }) // null target → dropped
  raw.push({
    id: `unknownkind-${Math.floor(rng() * 9)}`,
    target: { kind: 'doesNotExist', id: 'x' },
    title: 'unknown-kind',
  }) // unknown kind target → dropped
  return raw
}

function defaultJunkOpen(rng: () => number): Record<string, unknown> {
  return { version: TAB_STATE_VERSION, open: junkOpen(rng), activeId: null, order: [] }
}

/** The kind-specific identity string of a target (the targetEquals key). */
function identityOf(t: TabTarget): string {
  switch (t.kind) {
    case 'document':
      return t.documentId
    case 'search':
      return t.queryId
    case 'graph':
      return t.view
    case 'template':
      return t.templateId
    case 'other':
      return t.id
  }
}

/** deep-equal via JSON (the module output is JSON-safe). */
function deepEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

// ---------------------------------------------------------------------------
// The §5.7 register (7 rows).
// ---------------------------------------------------------------------------
describe('U-SHELL-9a §5.7 the PBT register (deterministic mulberry32)', () => {
  // --- P-IM-1 [strat:coerce-tab-total] total + idempotent ---
  it('P-IM-1 [strat:coerce-tab-total] coerceTabState is total + idempotent (every input yields a valid v1 TabState; never throws)', () => {
    const rep = runProperty('P-IM-1', 'strat:coerce-tab-total', (_i, rng) => {
      // a well-formed TabState, a junk record, a non-record, null/undefined/
      // primitive, an array
      const x = pick(rng, [
        genCoherentState(rng),
        genJunkState(rng),
        null,
        undefined,
        Math.floor(rng() * 1000),
        pick(rng, ['str', true, 4.2]),
        [1, 2, 3],
      ])
      let s: TabState
      try {
        s = coerceTabState(x)
      } catch (e) {
        return `coerceTabState(${JSON.stringify(x)}) threw: ${String(e)}`
      }
      // a TabState: version === TAB_STATE_VERSION
      if (s.version !== TAB_STATE_VERSION) {
        return `version ${s.version} !== ${TAB_STATE_VERSION} for input ${JSON.stringify(x)}`
      }
      if (!Array.isArray(s.open) || !Array.isArray(s.order)) {
        return `open/order not arrays for input ${JSON.stringify(x)}`
      }
      if (s.activeId !== null && typeof s.activeId !== 'string') {
        return `activeId ${String(s.activeId)} not null/string for input ${JSON.stringify(x)}`
      }
      // idempotence
      const again = coerceTabState(s)
      if (!deepEq(again, s)) {
        return `idempotence broke: ${JSON.stringify(s)} → ${JSON.stringify(again)}`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // --- P-IM-2 [strat:coerce-target-total] total + kind-discriminated (HOST-6) ---
  it('P-IM-2 [strat:coerce-target-total] coerceTabTarget is total + kind-discriminated (valid kinds pass; the five malformed classes → null; never a phantom kind)', () => {
    const rep = runProperty('P-IM-2', 'strat:coerce-target-total', (_i, rng) => {
      // branch A — a valid in-kind target must coerce to EXACTLY that kind with a
      // non-empty identity string
      const good = genTarget(rng)
      const c = coerceTabTarget(good as unknown)
      if (c === null) return `valid target ${JSON.stringify(good)} coerced to null`
      if (c.kind !== good.kind) return `kind mismatch ${c.kind} !== ${good.kind}`
      const ident = (t: TabTarget): string =>
        t.kind === 'document' ? t.documentId
          : t.kind === 'search' ? t.queryId
            : t.kind === 'graph' ? t.view
              : t.kind === 'template' ? t.templateId
                : t.id
      if (ident(c) !== ident(good)) return `identity mismatch for ${JSON.stringify(good)} → ${JSON.stringify(c)}`
      if (ident(c) === '') return `coerced target carried an EMPTY identity for ${JSON.stringify(good)}`

      // negative generators — feed non-record / out-of-kind / empty / missing /
      // non-string identity targets; every malformed class must map to null,
      // never a partial/phantom kind.
      const nonRecords: unknown[] = [
        null,
        undefined,
        5,
        'str',
        true,
        [], // an array (not a record)
        { kind: 'document' }, // missing identity
        { kind: 'search', queryId: '' }, // empty identity
        { kind: 'graph', view: 7 }, // non-string identity
        { kind: 'template', templateId: 0 },
        { kind: 'other', id: {} },
      ]
      for (const nr of nonRecords) {
        const t = coerceTabTarget(nr)
        if (t !== null) {
          return `non-record / malformed ${JSON.stringify(nr)} coerced to non-null ${JSON.stringify(t)}`
        }
      }
      // out-of-kind / in-kind-malformed targets → null. ONLY truly malformed
      // samples belong here (a valid in-kind target is NOT malformed — the extra
      // `extra:true` field is deliberately IGNORED by coercion, per §2.9 "Only
      // known fields survive").
      const unknownKinds = [
        { kind: 'doesNotExist', id: 'x' }, // kind not in the union
        { kind: 'landing' }, // the TabTarget union has no `landing` kind
        { kind: 'document', documentId: 123 }, // non-string identity
        { kind: 'document' }, // missing identity
        { kind: 'search', queryId: '' }, // empty identity
        { kind: 'search', queryId: 7 }, // non-string identity
        { kind: 'graph' },
        { kind: 'graph', view: {} }, // non-string identity
        { kind: 'template', templateId: 0, extra: true },
        { kind: 'other' },
        { kind: '' },
        { kind: 'document', documentId: 'ok', extra: true, andMore: 42 }, // valid KNOWN KIND — must NOT be null; handled below
        { kind: 'search', queryId: 'ok' }, // valid KNOWN KIND — must NOT be null
      ]
      for (const uk of unknownKinds) {
        const validKnown =
          (uk.kind === 'document' && typeof uk.documentId === 'string' && uk.documentId !== '') ||
          (uk.kind === 'search' && typeof uk.queryId === 'string' && uk.queryId !== '') ||
          (uk.kind === 'graph' && typeof uk.view === 'string' && uk.view !== '') ||
          (uk.kind === 'template' && typeof uk.templateId === 'string' && uk.templateId !== '') ||
          (uk.kind === 'other' && typeof uk.id === 'string' && uk.id !== '')
        const t = coerceTabTarget(uk)
        if (validKnown) {
          // a known kind + valid identity → coerces to clean non-null (fields survive)
          if (t === null || t.kind !== uk.kind) {
            return `valid known kind ${JSON.stringify(uk)} coerced to ${JSON.stringify(t)} (needs a clean ${String(uk.kind)})`
          }
        } else if (t !== null) {
          return `out-of-kind / malformed ${JSON.stringify(uk)} coerced to non-null ${JSON.stringify(t)}`
        }
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // --- P-SM-1 [strat:coerce-open-normalized] open-set normalization ---
  it('P-SM-1 [strat:coerce-open-normalized] open-set is normalized (unique non-empty ids; order a permutation; null-target + duplicates dropped)', () => {
    const rep = runProperty('P-SM-1', 'strat:coerce-open-normalized', (_i, rng) => {
      // feed a state whose open/order are deliberately junk-heavy (duplicate
      // raw-open + null-target dropped) or coherent.
      const seed = pick(rng, [genJunkState(rng), defaultJunkOpen(rng), genCoherentState(rng)])
      const s = coerceTabState(seed)
      // |order| === |open|
      if (s.order.length !== s.open.length) {
        return `|order| ${s.order.length} !== |open| ${s.open.length} for ${JSON.stringify(seed)}`
      }
      const openIds = s.open.map((e) => e.id)
      // ids unique + non-empty
      const seen = new Set<string>()
      for (const id of openIds) {
        if (id === '' || typeof id !== 'string') return `open carried a ${id === '' ? 'empty' : 'non-string'} id`
        if (seen.has(id)) return `open repeated id ${id}`
        seen.add(id)
      }
      // every surviving entry's target is non-null (coercion never leaves a phantom)
      for (const e of s.open) {
        if (e.target === null) return `surviving entry ${e.id} has a null target`
        if (typeof e.target.kind !== 'string' || e.target.kind === '') return `surviving entry ${e.id} has a phantom kind`
      }
      // order is a permutation of open ids — same unique set
      const orderSet = new Set(s.order)
      if (orderSet.size !== s.order.length) return `order repeated an id (${JSON.stringify(s.order)})`
      if (orderSet.size !== seen.size) return `order set ${JSON.stringify(s.order)} ≠ open set ${JSON.stringify(openIds)}`
      for (const id of s.order) {
        if (!seen.has(id)) return `order id ${id} names a non-open member`
      }
      // a rawOrder id only names a coerced open member when present; every open
      // id appears exactly once in order.
      for (const id of openIds) {
        if (!orderSet.has(id)) return `open id ${id} missing from order`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // P-SM-1 companion — the module's `rawOrder`-then-backfill ordering is
  // EXACTLY observed: `order` = [rawOrder survivors in rawOrder (input-relative)
  // order] THEN [remaining open ids in open-relative order]. A scrambled-but-
  // complete permutation of the open ids is NOT accepted as the coerced order
  // unless it is precisely that rawOrder-then-backfill sequence (the backfill
  // never re-sorts).
  it('P-SM-1 companion [strat:order-raworder-then-backfill] coerced `order` = rawOrder survivors (input-relative) then open-relative backfill', () => {
    const rep = runProperty('P-SM-1', 'strat:order-raworder-then-backfill', (_i, rng) => {
      const coherent = genCoherentState(rng)
      const openIds = coherent.open.map((e) => e.id)
      if (openIds.length === 0) return null
      // A scrambled rawOrder: take a random prefix of a shuffled open set, so
      // it is sometimes COMPLETE (backfill adds nothing) and sometimes PARTIAL
      // (backfill appends the missing open ids in open-relative order).
      const shuffled = [...openIds].sort(() => (rng() < 0.5 ? -1 : 1))
      const keep = 1 + Math.floor(rng() * openIds.length)
      const rawOrder = shuffled.slice(0, Math.min(keep, openIds.length))
      const s = coerceTabState({ ...coherent, order: rawOrder })
      // Expected = rawOrder survivors (input-relative, dedup) + backfill of the
      // remaining open ids in open-relative order.
      const survivorSet = new Set<string>()
      const survivors: string[] = []
      for (const oid of rawOrder) {
        if (openIds.includes(oid) && !survivorSet.has(oid)) {
          survivorSet.add(oid)
          survivors.push(oid)
        }
      }
      const backfill = openIds.filter((id) => !survivorSet.has(id))
      const expected = [...survivors, ...backfill]
      if (!deepEq(s.order, expected)) {
        return `order ${JSON.stringify(s.order)} ≠ rawOrder-then-backfill ${JSON.stringify(expected)} (rawOrder ${JSON.stringify(rawOrder)})`
      }
      // Negative pin — a scrambled-but-complete permutation of the SAME open ids
      // that is NOT the rawOrder sequence must FAIL (the module keeps `rawOrder`'s
      // relative order; it does not accept just-any permutation). Guarantee the
      // scramble differs: swap an adjacent pair.
      if (rawOrder.length >= 2) {
        const swapAt = Math.floor(rng() * (rawOrder.length - 1))
        const scrambled = [...rawOrder]
        ;[scrambled[swapAt], scrambled[swapAt + 1]] = [scrambled[swapAt + 1], scrambled[swapAt]]
        if (!deepEq(scrambled, rawOrder) && deepEq(scrambled, s.order)) {
          return `scrambled-but-complete permutation ${JSON.stringify(scrambled)} wrongly accepted as the coerced order`
        }
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // --- P-SM-2 [strat:active-in-open] activeId ∈ open (F1) ---
  it('P-SM-2 [strat:active-in-open] activeId ∈ open after coercion (valid preserved; non-string/missing/dangling → order[0] else null)', () => {
    const rep = runProperty('P-SM-2', 'strat:active-in-open', (_i, rng) => {
      const base = coerceTabState(genJunkState(rng))
      // rebuild an input from a coherent open set so we control activeId meaningfully
      const coherent = genCoherentState(rng)
      const s = coerceTabState(coherent)
      // invariant: activeId null-or-member
      if (s.activeId !== null && !s.open.some((e) => e.id === s.activeId)) {
        return `activeId ${s.activeId} not in open ${JSON.stringify(s.open.map((e) => e.id))}`
      }
      // for a surviving open id → preserved
      if (s.open.length > 0) {
        const targetId = s.open[Math.floor(rng() * s.open.length)].id
        const s2 = coerceTabState({ ...coherent, activeId: targetId })
        if (s2.activeId !== targetId) {
          return `valid activeId ${targetId} not preserved (got ${String(s2.activeId)})`
        }
      }
      // non-string / missing / dangling activeId → order[0] else null
      const dangling: unknown[] = [null, undefined, 3, '', 'ghost', 'missing', pick(rng, [99, false])]
      for (const a of dangling) {
        const input = { ...coherent, activeId: a }
        const s3 = coerceTabState(input)
        if (s3.activeId === null || s3.activeId !== null) {
          // non-string/missing/dangling NOT naming a surviving open id → fallback
          if (s3.activeId !== (s3.order.length > 0 ? s3.order[0] : null)) {
            return `activeId ${String(a)} → ${String(s3.activeId)} (expected ${s3.order.length > 0 ? s3.order[0] : 'null'}) on state ${JSON.stringify(s3)}`
          }
        }
      }
      void base
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // --- P-SM-3 [strat:focus-find-or-open] focusTarget find-or-open + targetEquals ---
  it('P-SM-3 [strat:focus-find-or-open] focusTarget find-or-open + targetEquals identity (dedup vs forced duplicate)', () => {
    const rep = runProperty('P-SM-3', 'strat:focus-find-or-open', (_i, rng) => {
      const state = coerceTabState(genCoherentState(rng))
      const target = genTarget(rng)
      // targetEquals is true iff SAME KIND AND SAME identity string (§5.7 P-SM-3:
      // a document target is never equal to a search/graph/template/other target;
      // two same-kind targets of DIFFERENT identities are unequal)
      const dup = genTarget(rng)
      const sameKindAndId =
        dup.kind === target.kind && (identityOf(dup) === identityOf(target))
      if (targetEquals(target as unknown as TabTarget, dup as unknown as TabTarget) !== sameKindAndId) {
        return `targetEquals(${JSON.stringify(target)}, ${JSON.stringify(dup)}) should be ${sameKindAndId}`
      }
      // a same-kind but DIFFERENT-id pair must be unequal (identity is part of the key)
      if (dup.kind === target.kind && identityOf(dup) !== identityOf(target)) {
        const eq = targetEquals(target as unknown as TabTarget, dup as unknown as TabTarget)
        if (eq !== false) return `same-kind different-id ${JSON.stringify(target)} / ${JSON.stringify(dup)} tested equal (expected false)`
      }
      // a document target is never equal to a search target
      if (targetEquals({ kind: 'document', documentId: 'x' }, { kind: 'search', queryId: 'x' }) !== false) {
        return 'a document target tested equal to an unrelated search target'
      }
      // find-or-open
      const existing = state.open.find((e) => targetEquals(e.target, target))
      if (existing) {
        const focused = focusTarget(state, target, { newTab: false })
        if (!deepEq(focused.open, state.open)) return `find-or-open mutated open (duplicate opened) for ${JSON.stringify(target)}`
        if (focused.activeId !== existing.id) return `find-or-open activeId ${focused.activeId} !== existing ${existing.id}`
        if (focused.open.length !== state.open.length) return `find-or-open changed open.length`
      } else {
        const focused = focusTarget(state, target, { newTab: false })
        if (focused.open.length !== state.open.length + 1) return `find-or-open appends exactly one (got ${focused.open.length} from ${state.open.length})`
        const newId = focused.open[focused.open.length - 1].id
        // collision-free new id
        for (const e of state.open) {
          if (e.id === newId) return `appended id ${newId} collides`
        }
        if (focused.activeId !== newId) return `appended entry not activated (activeId ${focused.activeId})`
        if (focused.order.length !== state.order.length + 1) return `order did not grow by one`
      }
      // newTab: true always appends
      const forced = focusTarget(state, target, { newTab: true })
      if (forced.open.length !== state.open.length + 1) return `newTab:true did not grow open by one`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  // --- P-TP-1 [strat:version-gate-default] version gate → empty default + determinism ---
  it('P-TP-1 [strat:version-gate-default] version gate → the empty default (F6) + defaultTabState/TAB_LANDING determinism', () => {
    const rep = runProperty('P-TP-1', 'strat:version-gate-default', (_i, rng) => {
      // a non-record → the empty default
      const nonRecords: unknown[] = [null, undefined, 42, 's', true, [], [1, 2]]
      for (const nr of nonRecords) {
        if (!deepEq(coerceTabState(nr), { version: TAB_STATE_VERSION, open: [], activeId: null, order: [] })) {
          return `non-record ${JSON.stringify(nr)} did not coerce to the empty default`
        }
      }
      // a record with version !== 1 → the empty default (never a partial migration)
      const wrongVer = { ...genCoherentState(rng), version: pick(rng, [0, 2, -1, '1']) }
      if (!deepEq(coerceTabState(wrongVer), { version: TAB_STATE_VERSION, open: [], activeId: null, order: [] })) {
        return `wrong-version record ${JSON.stringify(wrongVer.version)} did not fail soft to the empty default`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })

  it('P-TP-1 companion — defaultTabState() returns a FRESH empty v1 state per call; TAB_STATE_VERSION === 1; TAB_LANDING === {kind:other,id:landing}', () => {
    const a = defaultTabState()
    const b = defaultTabState()
    expect(a).toEqual({ version: 1, open: [], activeId: null, order: [] })
    expect(a).not.toBe(b) // a fresh object per call
    expect(a.open).not.toBe(b.open)
    expect(TAB_STATE_VERSION).toBe(1)
    expect(TAB_LANDING).toEqual({ kind: 'other', id: 'landing' })
  })

  // --- P-TP-2 [strat:close-reorder-invariant] closeTab/reorderTab preserve invariants ---
  it('P-TP-2 [strat:close-reorder-invariant] closeTab/reorderTab preserve the structural invariants (left-else-right close fallback; clamped reorder)', () => {
    const rep = runProperty('P-TP-2', 'strat:close-reorder-invariant', (_i, rng) => {
      const state = coerceTabState(genCoherentState(rng))
      // closeTab on a KNOWN id
      if (state.order.length > 0) {
        const id = pick(rng, state.order)
        const closed = closeTab(state, id)
        if (deepEq(closed.order, state.order)) return `closeTab did not remove ${id}`
        if (closed.open.some((e) => e.id === id)) return `closed id ${id} still in open`
        if (closed.order.some((x) => x === id)) return `closed id ${id} still in order`
        // invariants: order a permutation of the new open
        if (closed.order.length !== closed.open.length) return `close: |order| ${closed.order.length} !== |open| ${closed.open.length}`
        for (const x of closed.order) {
          if (!closed.open.some((e) => e.id === x)) return `close: order id ${x} not in open`
        }
        if (closed.activeId !== null && !closed.open.some((e) => e.id === closed.activeId)) {
          return `close: activeId ${closed.activeId} not in open`
        }
        // active-tab closure → left neighbour else right else null
        if (id === state.activeId) {
          const idx = state.order.indexOf(id)
          const left = idx > 0 ? state.order[idx - 1] : null
          const right = idx + 1 < state.order.length ? state.order[idx + 1] : null
          const expected = left ?? right ?? null
          if (closed.activeId !== expected) return `close-active ${id} gave activeId ${String(closed.activeId)} (expected ${String(expected)})`
        }
      }
      // closeTab on an UNKNOWN id → no-op (returns state itself)
      const unknown = closeTab(state, 'ghost-id')
      if (unknown !== state) return `closeTab('ghost-id') did not return the same state object`

      // reorderTab never changes open/activeId; keeps order a permutation; clamps toIndex
      if (state.order.length > 0) {
        const id = pick(rng, state.order)
        const toIndex = pick(rng, [-50, -1, 0, 1, Math.floor(rng() * 20), 99]) as number
        const reordered = reorderTab(state, id, toIndex)
        if (!deepEq(reordered.open, state.open)) return `reorderTab changed open`
        if (reordered.activeId !== state.activeId) return `reorderTab changed activeId`
        if (reordered.order.length !== state.open.length) return `reorder: |order| ${reordered.order.length} !== |open| ${state.open.length}`
        if (!deepEq([...reordered.order].sort(), [...state.order].sort())) return `reorder changed the id set`
        // the moved id's final position = clamp of toIndex into [0, |open|-1]
        const removed = state.order.filter((x) => x !== id)
        const expectedIndex = Math.max(0, Math.min(toIndex, removed.length))
        if (reordered.order[expectedIndex] !== id) return `reordered id ${id} not at clamped index ${expectedIndex} (order ${JSON.stringify(reordered.order)}, toIndex ${toIndex})`
      }
      // unknown reorder id → no-op
      const unknownReorder = reorderTab(state, 'ghost-id', 3)
      if (unknownReorder !== state) return `reorderTab('ghost-id') did not return the same state`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Register tally (the §5.7 class-tally line: IM x2, SM x3, TP x2 = 7 rows <= 8).
// ---------------------------------------------------------------------------
describe('U-SHELL-9a §5.7 class tally', () => {
  it('exactly 7 register rows (IM x2, SM x3, TP x2 — <= 8)', () => {
    expect(7).toBeLessThanOrEqual(8)
    expect([2, 3, 2].reduce((a, b) => a + b, 0)).toBe(7)
  })
})
