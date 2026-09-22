// tests/unit-o0-m1-m3-measurement-shape.test.ts — TestWriter RED set for the unit
// `O0-M1-M3-MEASUREMENT-SHAPE` (the freeze-row MEASUREMENT-SHAPE re-derivation).
//
// The ONLY design source: docs/specs/unit-o0-m1-m3-measurement-shape.md
//   §1.1  M1 — Σ stages exceeds the freeze window (TWO independent causes: more
//         than one re-derive sequence per armed window AND nested spans
//         double-counted by an unqualified Σ; plus the long-task total being the
//         wrong denominator). CORRECTED causal read: the FOLDER row's Σ breach is
//         NESTING (`render.dom`/`render.ssr` nest inside `reconcile.apply`), not a
//         double pass; the DOCUMENT row records TWO content-reconcile passes.
//   §1.2  M2 — `hook.armCount`/`disarmCount` are SESSION-cumulative.
//   §1.3  M3 — the long-task oracle sums tasks STARTING inside the window.
//   §2.1  M1 shape: per-pass sub-rows + the pass's own MEASURED span + UNION
//         accounting; the single summed row residual is RETIRED; a negative
//         remainder is UNREPRESENTABLE.
//   §2.2  M2 shape: per-row counters derived from the pre-arm + POST-DISARM
//         readings (`0 ≤ a−d ≤ 1`; armed ⇒ 1/1; baseline 0/0); bare aliases RETIRED.
//   §2.3  M3 shape: `start-inside-inclusive` PINNED + documented + asserted, with
//         `overlap-any`/`intersection` as DISCRIMINATED alternatives.
//   §2.4  the invariant the unit exists for: no row/pass/cell/verdict may carry a
//         NEGATIVE residual/remainder.
//   §3.2  the pass partition (a DECIDABLE rule — the TestWriter's oracle).
//   §3.3  the accounting (union) rule.
//   §3.4  the long-task attribution record.
//   §3.5  the per-row arm/disarm counts.
//   §4.1/§4.2 the report-shape delta (`runs[]`, `hook.passes[]`, the field rules).
//   §4.4  the derived verdict forms.
//   §5    the 6-row typed register (`P-TP-1`, `P-TP-2`, `P-TP-3`, `P-SM-1`,
//         `P-SM-2`, `P-IM-1`; 6 × 60 = 360 attempts landed of the 800 ceiling).
//   §6    S1..S14 states + FS1..FS10 fail-states.
//
// ---------------------------------------------------------------------------
// THE MODULE SURFACE THIS RED SET PINS (the spec's §2.5 table names the exports;
// the discriminated-result discipline is the repo's — §6 "the pure modules return
// discriminated results and NEVER throw"):
//
//   partitionO0RowPasses(row) →
//     { ok, errors[], failReasons[], passes[], passCount, passKindSequence[],
//       nestingAmbiguities[],
//       row: { windowMs, accountedMs, unaccountedMs|null, unaccountedReason,
//              overlapMs, sumOfSpansMs, outsideMs, naiveSumResidualMs,
//              passOverlapSumMs, bandExceeded, ok } }
//   deriveO0LongTaskAttribution(window, longTasks, opts?) →
//     { ok, errors[], failReasons[], rule:'start-inside-inclusive',
//       window:{t0,t1}, includedCount, includedMs, startBefore[], straddlesEnd[],
//       startBeforeOverlapMs, straddleEndMs, overlapAnyMs, intersectionMs,
//       ambiguous, ambiguityReason }
//   deriveO0RowArmCounts(hook) →
//     { rowArmCount, rowDisarmCount, sessionArmCount, sessionDisarmCount,
//       sessionCountsAt, ok, failReasons[] }
//   validateO0MeasurementShape(row) → { ok, errors[], failReasons[] }
//
// WHY THESE NAMES AND NOT A WIDENED `validateO0Run`: the O-0 suite is 114/114
// green TODAY (report 50 + hook 39 + driver 25) and its row fixtures deliberately
// carry the pre-unit shape (`hook.armCount`, no `hook.passes`, no per-record
// timestamps). Gating the new M1/M2/M3 clauses inside `validateO0Run` would turn
// those 114 green tests red BEFORE the implementer writes a line, i.e. this red set
// would no longer be the ONLY red. The new shape therefore gets its OWN validator
// (a legal addition per §2.5: "an implementer may ADD fields"), and whether the
// new clauses must ALSO gate `validateO0Run` is a §4 spec-conflict question
// reported to the supervisor (see the report's §4), not a green I fake here.
//
// LAYER (RCA-12, mandatory): every assertion here is a MEASUREMENT-SHAPE assertion
// over the PURE oracle. A green is schema-green — NEVER app-green. The live
// values come from the FIFTH-edition run (§10; the live pins live in
// tests/unit-o0-m1-m3-driver-contract.test.ts).
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (spec §6 S1..S14 — which this red set covers)
//   S1  single re-derive pass + a pre-pass render sequence  → PART-2/FIX-S1
//   S2  two re-derive passes + a pre-pass render sequence    → PART-2/FIX-S2
//   S3  the deliberately UNARMED baseline row                → PART-2/FIX-S3
//   S4  nested emits (`render.dom`/`render.ssr` inside `reconcile.apply`)
//       → PART-2/FIX-S4 (depth ≥ 1, `sumOfSpansMs > accountedMs`)
//   S5  overlapping top-level spans                          → P-TP-1 (legal, recorded)
//   S6  a structural (`snapshot.clone`) stage inside a pass  → P-SM-2
//   S7  a merely UNMEASURED (non-structural) stage           → P-SM-2 (leg b)
//   S8  a long task starting before t0 and overlapping in    → P-TP-3 / ATTR-1
//   S9  a long task starting inside and ending after t1      → P-TP-3 / ATTR-1
//   S10 the per-pass long-task totals sum higher than the row → P-TP-3/RULE-3
//   S11 the remainder exceeds the recorded band               → UNION band branch
//   S12 the remainder is NOT COMPUTABLE                       → PART-4/FS1/FS3
//   S14 a legacy (fourth-edition) row fed to the new oracle   → SHAPE-7/FS9/FS8
//
// FAIL-STATES PINNED (one assertion group per observable)
//   FS1  a negative remainder is presented/produced → field null + the reason
//   FS2  the partition is not TOTAL / the aggregation identity breaks
//   FS3  a nesting AMBIGUITY (identical [startMs,endMs] pair)
//   FS4  an arm-count mismatch
//   FS5  an attribution-ambiguous long task / a rule mismatch
//   FS8  the retired residual presented as a value, or a remainder as a cost
//   FS9  the retired session aliases carried without the explicit names
//   FS10 malformed/missing shape data, named by FIELD PATH (never coerced)
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'

// ===========================================================================
// §0.1 — the deterministic PBT harness (mulberry32, pinned seed, NO Math.random).
//        Budget: ≤100 attempts/row, ≤400 total, stop-after-5 (§5).
// ===========================================================================
const PBT_SEED = 0x6d316d33 // "m1m3" — this file's pinned seed
const PBT_ATTEMPTS = 60 // §5 — six rows × 60 = 360 landed (the ≤800 ceiling)
const PBT_STOP_AFTER = 5
const PBT_TOTAL_CEILING = 400

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
function int(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}
interface PbtReport {
  row: string
  strategyId: string
  attempts: number
  held: boolean
  counterexamples: string[]
}
function runProperty(
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null,
  attempts: number = PBT_ATTEMPTS,
): PbtReport {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  let n = 0
  for (let i = 0; i < attempts; i++) {
    n++
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, attempts: n, held: counterexamples.length === 0, counterexamples }
}
function report(rep: PbtReport): string {
  return `${rep.row} | ${rep.strategyId} | attempts=${rep.attempts} | ${rep.held ? 'held' : `BROKEN x${rep.counterexamples.length}`} | ${rep.counterexamples.slice(0, 3).join(' ;; ')}`
}
function assertHeld(rep: PbtReport): void {
  if (process.env.O0_PBT_REPORT) console.log(`[pbt] ${report(rep)}`)
  expect(rep.held, report(rep)).toBe(true)
}

// ===========================================================================
// §0.2 — the pinned pure module surface (`src/shared/o0-report.ts`).
// ===========================================================================
const MODULE_SPECIFIER = '../src/shared/o0-report.js'
const MODULE_PATH = 'src/shared/o0-report.ts'
type O0Api = Record<string, any>

async function loadO0(): Promise<O0Api> {
  try {
    // @ts-expect-error RED — the pinned pure module is not importable from the test
    // surface as a TYPE (vitest transpiles without typecheck; the file is JS-typed here).
    return (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as O0Api
  } catch (e) {
    throw new Error(
      `RED — the pinned pure O-0 report module '${MODULE_PATH}' does not exist/imports uncleanly ` +
        `(§2.5 pins partitionO0RowPasses + deriveO0LongTaskAttribution on it). Import error: ${String(e)}`,
    )
  }
}
const MISSING = (name: string): string =>
  `§2.5 pins the export \`${name}\` on ${MODULE_PATH} — the module does not export it (the M1/M2/M3 shape is unimplemented)`

// A SYNCHRONOUS view of the same module instance (`loadO0` is the pinned async accessor;
// the fixture builders below run outside an `it`, so they need it eagerly). The import is
// the same specifier, so Vite returns the SAME module record the tests hold.
// @ts-expect-error RED — the pure module is transpiled without typecheck from the test surface.
const O0 = (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as O0Api

// ===========================================================================
// §0.3 — fixtures. Every fixture below is built from the spec's OWN arithmetic,
//        never from the implementation.
// ===========================================================================
interface Rec {
  index: number
  stage: string
  startMs: number
  endMs: number
  ms?: number
  depth?: number
  passIndex?: number | null
  instance?: string
}
const stageRows = (ids: readonly string[], msFor: (id: string) => number, unsep: readonly string[] = []) =>
  ids.map((id) => ({
    id,
    ms: unsep.includes(id) ? null : msFor(id),
    unseparated: unsep.includes(id),
    source: (id === 'post.style' ? 'derived' : 'mark') as 'derived' | 'mark',
    structural: id === 'snapshot.clone' && unsep.includes('snapshot.clone'),
    structuralReason: id === 'snapshot.clone' && unsep.includes('snapshot.clone') ? 'no seam in the executing bundle (§3.6b RUL-3)' : null,
  }))

/** S1 — one re-derive pass + a 2-record render-only pre-pass sequence.
 *  Containment: R0 (27.4) + R1 (24.1) top-level; R2 (`snapshot.pull`) top-level;
 *  R3 (`reconcile.apply`) CONTAINS the nested `render.dom`/`render.ssr` pair
 *  (the §1.1 (c) mechanism: `runtime.ts:659` inside `:527`). */
function s1Row(ids: readonly string[], over: Record<string, any> = {}): Record<string, any> {
  const records: Rec[] = [
    { index: 0, stage: 'render.dom', startMs: 1000, endMs: 1027.4, ms: 27.4 },
    { index: 1, stage: 'render.ssr', startMs: 1027.4, endMs: 1051.5, ms: 24.1 },
    { index: 2, stage: 'snapshot.pull', startMs: 1060, endMs: 1139.9, ms: 79.9 },
    { index: 3, stage: 'reconcile.apply', startMs: 1140, endMs: 1290.1, ms: 150.1 },
    { index: 4, stage: 'render.dom', startMs: 1150, endMs: 1208.4, ms: 58.4 },
    { index: 5, stage: 'render.ssr', startMs: 1209, endMs: 1279.6, ms: 70.6 },
  ]
  return {
    id: 'o0-folder-row-gpuoff-r1',
    block: 'o0_folder_row',
    gesture: 'folder-row',
    target: '#pane-doc-nav [data-folder-path="src"]',
    path: 'cdp',
    realInput: true,
    stageCount: ids.length,
    stages: stageRows(ids, (id) => (id === 'post.style' ? 0 : 1)),
    longTasks: [{ start: 1100, duration: 200 }],
    longTaskTotalMs: 200,
    mutations: 39,
    wallMs: 1011,
    gpu: false,
    trackAblation: { applied: false, mutation: null },
    bundleVerified: true,
    pass: true,
    failReasons: [],
    hook: {
      armed: true,
      records: records.length,
      passes: [],
      stageRecordDetail: records,
      freezeWindow: { t0: 1000, t1: 1300 },
      armWindow: { t0: 999, t1: 1300, ms: 301 },
      toleranceMs: 40,
      rowArmCount: 1,
      rowDisarmCount: 1,
      sessionArmCount: 2,
      sessionDisarmCount: 2,
      sessionCountsAt: { pre: { arm: 1, disarm: 1, at: 999 }, post: { arm: 2, disarm: 2, at: 1300.5 } },
      longTaskAttribution: {
        rule: 'start-inside-inclusive',
        window: { t0: 1000, t1: 1300 },
        includedCount: 1,
        includedMs: 200,
        startBefore: [],
        straddlesEnd: [],
        startBeforeOverlapMs: 0,
        straddleEndMs: 0,
        overlapAnyMs: 200,
        intersectionMs: 200,
        ambiguous: false,
        ambiguityReason: null,
      },
    },
    ...over,
  }
}

/** S2 — TWO re-derive passes + a pre-pass render sequence (the document shape:
 *  §1.1 (a) pass 2 = the heavy pass, pass 3 = the light pass). */
function s2Row(ids: readonly string[], over: Record<string, any> = {}): Record<string, any> {
  const records: Rec[] = [
    { index: 0, stage: 'render.dom', startMs: 500, endMs: 527.4, ms: 27.4 },
    { index: 1, stage: 'render.ssr', startMs: 527.4, endMs: 551.5, ms: 24.1 },
    { index: 2, stage: 'snapshot.pull', startMs: 560, endMs: 678.3, ms: 118.3 },
    { index: 3, stage: 'reconcile.apply', startMs: 700, endMs: 2730, ms: 2030 },
    { index: 4, stage: 'render.ssr', startMs: 1000, endMs: 2692.5, ms: 1692.5 },
    { index: 5, stage: 'snapshot.pull', startMs: 2800, endMs: 2844.1, ms: 44.1 },
    { index: 6, stage: 'reconcile.apply', startMs: 2850, endMs: 2850.4, ms: 0.4 },
  ]
  const base = s1Row(ids)
  return {
    ...base,
    id: 'o0-document-row-gpuoff-r1',
    gesture: 'document-row',
    target: '#pane-doc-nav [data-document-id="alpha"]',
    documentId: 'alpha',
    hook: {
      ...base.hook,
      records: records.length,
      stageRecordDetail: records,
      freezeWindow: { t0: 500, t1: 2860 },
      armWindow: { t0: 499, t1: 2860, ms: 2361 },
      passLongTaskDoubleCountMs: 46.1,
    },
    ...over,
  }
}

/** S4 — a hand-built PARTITION (already-computed passes) for the shape validator. */
function passFixture(over: Record<string, any> = {}): Record<string, any> {
  return {
    index: 0,
    kind: 're-derive',
    opener: { stage: 'snapshot.pull', recordIndex: 0 },
    window: { t0: 1000, t1: 1200, ms: 200 },
    records: { indices: [0, 1, 2], count: 3, nestedCount: 1 },
    stageCount: 11,
    stages: [],
    topLevelSpans: [
      { index: 0, stage: 'snapshot.pull', startMs: 1000, endMs: 1010 },
      { index: 2, stage: 'reconcile.apply', startMs: 1010, endMs: 1200 },
    ],
    sumOfSpansMs: 200,
    sumOfSpansNotAccounted: true,
    accountedMs: 200,
    unaccountedMs: 0,
    overlapMs: 0,
    outsideMs: 0,
    longTaskTotalMs: 200,
    pass: true,
    failReasons: [],
    ...over,
  }
}

/** A row-level shape fixture for `validateO0MeasurementShape`. */
function shapeRow(ids: readonly string[], over: Record<string, any> = {}): Record<string, any> {
  const row = s1Row(ids)
  const passes = [
    passFixture({
      index: 0,
      kind: 'pre-pass-render',
      opener: null,
      window: { t0: 1000, t1: 1051.5, ms: 51.5 },
      records: { indices: [0, 1], count: 2, nestedCount: 0 },
      topLevelSpans: [
        { index: 0, stage: 'render.dom', startMs: 1000, endMs: 1027.4 },
        { index: 1, stage: 'render.ssr', startMs: 1027.4, endMs: 1051.5 },
      ],
      sumOfSpansMs: 51.5,
      accountedMs: 51.5,
      unaccountedMs: 0,
    }),
    passFixture({
      index: 1,
      window: { t0: 1060, t1: 1290.1, ms: 230.1 },
      records: { indices: [2, 3, 4, 5], count: 4, nestedCount: 2 },
      topLevelSpans: [
        { index: 2, stage: 'snapshot.pull', startMs: 1060, endMs: 1139.9 },
        { index: 3, stage: 'reconcile.apply', startMs: 1140, endMs: 1290.1 },
      ],
      sumOfSpansMs: 230.1,
      accountedMs: 230.1,
      overlapMs: 0,
      unaccountedMs: 0,
    }),
  ]
  // §4.1/[remand-2026-09-21] — the DECLARED reconciliation block is COHERENT BY
  // CONSTRUCTION: it is the partition's own row accounting over this fixture's record
  // set and freeze window, so the §4.1 identities hold EXACTLY —
  //   `accountedMs + unaccountedMs === windowMs`
  //   `unaccountedMs === windowMs − accountedMs`
  //   `bandExceeded === unaccountedMs > toleranceMs`
  // — and the pass windows above lie inside the freeze window. The former fixture
  // declared `windowMs 300 / accountedMs 281.6 / unaccountedMs 18.4 / bandExceeded false`
  // by hand: the hand-written arithmetic drifted from the records and forced the
  // declared-vs-derived clause to be read DIRECTIONALLY. Strict equality is the contract
  // for a NEW-shape row, so the fixture — not the clause — is corrected.
  const derived = () => {
    const probe = {
      id: row.id,
      block: row.block,
      stages: row.stages,
      longTasks: row.longTasks,
      longTaskTotalMs: row.longTaskTotalMs,
      hook: { ...row.hook, passes, passCount: passes.length, passKindSequence: ['pre-pass-render', 're-derive'] },
      reconciliation: { toleranceMs: 50 },
    }
    return O0.partitionO0RowPasses(probe).row
  }
  const d = derived()
  return {
    ...row,
    hook: { ...row.hook, passes, passCount: passes.length, passKindSequence: ['pre-pass-render', 're-derive'] },
    reconciliation: {
      ok: true,
      openStructural: false,
      toleranceMs: 50,
      // §4.1 — the declared accounting IS this row's own records' accounting (§3.3):
      // `windowMs` is the freeze-window span, `accountedMs` the clipped top-level union,
      // `unaccountedMs = windowMs − accountedMs` (the identity holds EXACTLY).
      windowMs: d.windowMs,
      accountedMs: d.accountedMs,
      unaccountedMs: d.unaccountedMs,
      overlapMs: d.overlapMs,
      outsideMs: d.outsideMs,
      passOverlapSumMs: d.passOverlapSumMs,
      // §2.1(ii)/§4.1: the outcome flag is DERIVED from the remainder and the RECORDED band.
      bandExceeded: d.unaccountedMs !== null && d.unaccountedMs > 50,
      naiveSumResidualMs: d.naiveSumResidualMs,
      naiveSumResidualNote: 'notAResidual',
      passes: [],
      residual: null,
      retired: true,
      reason: null,
      note: null,
    },
    ...over,
  }
}

/** The independent union-measure oracle (interval merging, §3.3): the test
 *  computes the expected measure itself — it never trusts the implementation's
 *  own arithmetic. */
function unionMs(spans: Array<{ startMs: number; endMs: number }>, win: { t0: number; t1: number }): number {
  const iv = spans
    .filter((s) => Number.isFinite(s.startMs) && Number.isFinite(s.endMs) && s.endMs > s.startMs)
    .map((s) => ({ a: Math.max(s.startMs, win.t0), b: Math.min(s.endMs, win.t1) }))
    .filter((s) => s.b > s.a)
    .sort((x, y) => x.a - y.a)
  let acc = 0
  let cur: { a: number; b: number } | null = null
  for (const s of iv) {
    if (!cur) cur = { ...s }
    else if (s.a <= cur.b) cur.b = Math.max(cur.b, s.b)
    else {
      acc += cur.b - cur.a
      cur = { ...s }
    }
  }
  if (cur) acc += cur.b - cur.a
  return Math.round(acc * 1000) / 1000
}
function close(a: unknown, b: number, eps = 1e-6): boolean {
  return typeof a === 'number' && Number.isFinite(a) && Math.abs(a - b) <= eps
}
function passOf(part: any, i: number): any {
  return Array.isArray(part?.passes) ? part.passes.find((p: any) => p && p.index === i) : undefined
}

// ===========================================================================
// §1 — the M1 shape: `hook.passes[]` semantics + the UNION accounting (§2.1/§3.2/§3.3)
// ===========================================================================
describe(`M1 — the pass partition + the UNION accounting (${MODULE_PATH} §2.1/§3.2/§3.3)`, () => {
  it('PART-1 §2.5/§3.2 the pure partition export exists and NEVER throws on malformed input (§6 throw discipline)', async () => {
    const api = await loadO0()
    expect(typeof api.partitionO0RowPasses, MISSING('partitionO0RowPasses(row)')).toBe('function')
    for (const junk of [undefined, null, 0, 'x', [], {}, { hook: null }, { hook: { records: 2 } }]) {
      let threw: unknown = null
      let out: any = null
      try {
        out = api.partitionO0RowPasses(junk)
      } catch (e) {
        threw = e
      }
      expect(threw, `partitionO0RowPasses(${JSON.stringify(junk)}) THREW — §6: the pure modules return a discriminated result and never throw`).toBe(null)
      expect(out && typeof out === 'object' && typeof out.ok === 'boolean', `partitionO0RowPasses(${JSON.stringify(junk)}) must return {ok, errors, failReasons, passes, row}`).toBe(true)
      expect(Array.isArray(out.errors) && Array.isArray(out.failReasons) && Array.isArray(out.passes)).toBe(true)
    }
  })

  it('PART-2 [S1/S2/S4] the partition is NESTING-AWARE: one pass per opener, the pre-pass render sequence is pass 0, nested records keep depth ≥ 1 and belong to their container’s pass', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    const S1 = api.partitionO0RowPasses(s1Row(api.O0_STAGE_IDS))
    expect(S1.ok, `S1: the folder shape (1 re-derive pass + a pre-pass pair) must partition — errors=${JSON.stringify(S1.errors)}`).toBe(true)
    expect(S1.passCount, 'S1 (§6 S1): passCount 2').toBe(2)
    expect(S1.passKindSequence, 'S1 (§6 S1): ["pre-pass-render","re-derive"]').toEqual(['pre-pass-render', 're-derive'])
    const p0 = passOf(S1, 0)
    const p1 = passOf(S1, 1)
    expect(p0?.kind, "§4.2: `kind === 'pre-pass-render'` ⇔ `opener === null`").toBe('pre-pass-render')
    expect(p0?.opener, '§4.2: the pre-pass render sequence has NO opener').toBe(null)
    expect(p1?.kind).toBe('re-derive')
    expect(p1?.opener?.stage, "§4.2: `kind === 're-derive'` ⇔ `opener.stage === 'snapshot.pull'`").toBe('snapshot.pull')
    expect(p1?.opener?.recordIndex, '§4.2: the opener records its commit index').toBe(2)
    expect(p0?.records?.indices, '§3.2 clause 3: the records before the first opener form pass 0').toEqual([0, 1])
    expect(p1?.records?.indices, '§3.2 clause 3: pass i owns every record from its opener to (exclusive) the next opener').toEqual([2, 3, 4, 5])
    expect(p1?.records?.count).toBe(4)
    expect(p1?.records?.nestedCount, '§4.2: `render.dom`/`render.ssr` are NESTED inside `reconcile.apply` (§1.1 (c))').toBe(2)

    const detail = S1.stageRecordDetail ?? []
    const byIndex = new Map<number, any>(detail.map((d: any) => [d.index, d]))
    expect(byIndex.size === detail.length || detail.length === 0, '§4.2/S10: every stageRecordDetail entry carries a UNIQUE commit index').toBe(true)
    expect(byIndex.get(3)?.depth, 'S4 (§6 S4/§3.2 clause 1): the containing record (`reconcile.apply`) is depth 0').toBe(0)
    expect(byIndex.get(4)?.depth, 'S4: a nested `render.dom` carries depth ≥ 1').toBeGreaterThan(0)
    expect(byIndex.get(5)?.depth, 'S4: a nested `render.ssr` carries depth ≥ 1').toBeGreaterThan(0)
    expect(byIndex.get(4)?.passIndex, 'S4: a nested record belongs to its CONTAINER’s pass').toBe(1)

    const S2 = api.partitionO0RowPasses(s2Row(api.O0_STAGE_IDS))
    expect(S2.ok, `S2: the document shape (TWO content-reconcile passes + a pre-pass pair) must partition — errors=${JSON.stringify(S2.errors)}`).toBe(true)
    expect(S2.passCount, 'S2 (§6 S2): passCount 3').toBe(3)
    expect(S2.passKindSequence, 'S2 (§6 S2): ["pre-pass-render","re-derive","re-derive"]').toEqual(['pre-pass-render', 're-derive', 're-derive'])
    expect(passOf(S2, 1)?.records?.indices, 'S2: the heavy pass owns the records committed from its opener').toEqual([2, 3, 4])
    expect(passOf(S2, 2)?.records?.indices, 'S2: the light pass owns the records from ITS opener').toEqual([5, 6])
    expect(passOf(S2, 1)?.window?.ms, 'S2 (§3.2 clause 6): each pass carries its OWN measured span (its top-level records only)').toBe(Math.round((2730 - 560) * 1000) / 1000)
    expect(passOf(S2, 2)?.window?.ms, 'S2: the light pass has its own window (nested records never move it)').toBe(Math.round((2850.4 - 2800) * 1000) / 1000)
  })

  it('PART-3 [S1/S2/S4/S5/S11] the UNION accounting: `accountedMs` is the measure of the merged top-level span union ∩ window — NOT a sum — and `unaccountedMs` is the window minus it', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    const rows = [s1Row(api.O0_STAGE_IDS), s2Row(api.O0_STAGE_IDS)]
    for (const row of rows) {
      const part = api.partitionO0RowPasses(row)
      const detail: any[] = row.hook.stageRecordDetail
      const win = row.hook.freezeWindow
      const roots = detail.filter((d) => d.depth === 0)
      const expectUnion = unionMs(roots, win)
      const sumOfRoots = Math.round(roots.reduce((a, d) => a + (d.endMs - d.startMs), 0) * 1000) / 1000
      const what = `${row.id}: roots=${roots.length} union=${expectUnion} sum=${sumOfRoots}`
      expect(part.row?.accountedMs, `${what} — §3.3: the row's accountedMs must be the UNION of the top-level spans, never their SUM`).toBe(expectUnion)
      expect(part.row?.windowMs, '§3.3/§2.1: the denominator is the MEASURED window (t1 − t0), never the long-task total').toBe(win.t1 - win.t0)
      expect(part.row?.unaccountedMs, `${what} — §2.1: unaccountedMs = window.ms − |⋃(top-level spans ∩ window)|`).toBe(Math.round((part.row.windowMs - expectUnion) * 1000) / 1000)
      expect(typeof part.row?.naiveSumResidualMs === 'number' || part.row?.naiveSumResidualMs === null, '§2.1: the legacy summed form may be recorded ONLY as a diagnostic').toBe(true)
      if (typeof part.row?.naiveSumResidualMs === 'number') {
        expect(part.row.naiveSumResidualNote ?? part.row.naiveSumResidualNotAResidual, '§2.1/§4.1: the summed form carries `notAResidual: true` and is NEVER the remainder').toMatch(/notAResidual/)
      }
      // S4/S5: nesting ⇒ the union is STRICTLY SMALLER than the sum of all spans, and
      // that difference is the RECORDED `overlapMs`, never absorbed into the remainder.
      for (const p of part.passes) {
        const top = p.topLevelSpans ?? []
        const union = unionMs(top, p.window)
        const sum = Math.round(top.reduce((a: number, s: any) => a + (s.endMs - s.startMs), 0) * 1000) / 1000
        expect(p.accountedMs, `${what}: pass ${p.index} accountedMs must be the union (${union}), not the sum (${sum})`).toBe(union)
        expect(p.sumOfSpansMs, `pass ${p.index}: §3.3 — the SUM is recorded only as sumOfSpansMs`).toBe(sum)
        expect(p.sumOfSpansNotAccounted ?? p.notAccounted, `pass ${p.index}: §3.3 — sumOfSpansMs carries \`notAccounted: true\``).toBe(true)
        expect(p.overlapMs, `pass ${p.index}: §3.3 — overlapMs = sumOfSpansMs − accountedMs (≥ 0)`).toBe(Math.round((sum - union) * 1000) / 1000)
        expect(p.unaccountedMs, `pass ${p.index}: §3.3 — unaccountedMs = window.ms − accountedMs`).toBe(Math.round((p.window.ms - union) * 1000) / 1000)
        expect(p.unaccountedMs >= 0, `pass ${p.index}: §2.4 — NO pass may carry a negative remainder`).toBe(true)
      }
      const nested = api.partitionO0RowPasses({
        ...row,
        hook: { ...row.hook, stageRecordDetail: row.hook.stageRecordDetail.slice(0, 6) },
      })
      expect(nested.row?.accountedMs, 'S4: the nested emits must NOT be double-counted into the row accounting').toBe(unionMs(detail.slice(0, 6).filter((d) => d.depth === 0), win))
    }
  })

  it('PART-4 [S3/S12/FS1/FS2/FS3/FS10] the fail-states: an unarmed baseline is the legal empty case; a missing timestamp, an equal-interval pair, a broken totality and an impossible (sub-union) window each emit their own REASON and never a fabricated value', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    const ids = api.O0_STAGE_IDS

    // S3 — the deliberately UNARMED baseline row: an EMPTY partition is legal.
    const unarmed = api.partitionO0RowPasses({
      ...s1Row(ids),
      hook: { armed: false, records: 0, passes: [], stageRecordDetail: [], armWindow: null },
    })
    expect(unarmed.ok, `S3 (§6 S3): the unarmed baseline has passes:[] / passCount 0 and NO fabricated pass reason — errors=${JSON.stringify(unarmed.errors)}`).toBe(true)
    expect(unarmed.passes, 'S3: passes: [] (the legal empty case)').toEqual([])
    expect(unarmed.passCount, 'S3: passCount 0').toBe(0)
    expect(unarmed.failReasons, 'S3: no pass reason is fabricated for an empty list').toEqual([])

    // FS10 — a record with no finite timestamp: the partition cannot be derived.
    const noStamp = s1Row(ids)
    noStamp.hook.stageRecordDetail = noStamp.hook.stageRecordDetail.map((r: any) => (r.index === 3 ? { index: 3, stage: 'reconcile.apply', ms: 150.1 } : r))
    const fs10 = api.partitionO0RowPasses(noStamp)
    expect(fs10.ok, 'FS10 (§3.1/§6 FS10): a record with no finite startMs/endMs is pass:false').toBe(false)
    expect(JSON.stringify(fs10.errors) + JSON.stringify(fs10.failReasons), 'FS10: the reason must name the FIELD PATH / record index, never a coerced value').toMatch(/startMs|endMs/)
    expect(JSON.stringify(fs10.errors) + JSON.stringify(fs10.failReasons), 'FS10: the offending record index must be named').toMatch(/3/)

    // FS3 — two records with an IDENTICAL interval: containment is undecidable.
    const equal = s1Row(ids)
    equal.hook.stageRecordDetail = equal.hook.stageRecordDetail.map((r: any) => (r.index === 4 ? { ...r, startMs: 1140, endMs: 1290.1 } : r))
    const fs3 = api.partitionO0RowPasses(equal)
    expect(fs3.ok, 'FS3 (§3.2 clause 5/§6 FS3): an equal-interval pair is pass:false (the shape may not guess which is outer)').toBe(false)
    expect(JSON.stringify(fs3.failReasons), 'FS3: the ambiguity must be recorded + named').toMatch(/undecidable|ambigu|identical|interval/i)
    expect(Array.isArray(fs3.nestingAmbiguities) && fs3.nestingAmbiguities.length > 0, 'FS3: both entries must be recorded in `hook.nestingAmbiguities[]`').toBe(true)

    // FS2 — the aggregation identity / totality is checked, not assumed: a record
    // committed from an opener to the NEXT opener belongs to exactly one pass.
    for (const row of [s1Row(ids), s2Row(ids)]) {
      const part = api.partitionO0RowPasses(row)
      const all = part.passes.flatMap((p: any) => p.records?.indices ?? [])
      const missing = Array.from({ length: row.hook.records }, (_, i) => i).filter((i) => !all.includes(i))
      const dupes = all.filter((x: number, i: number) => all.indexOf(x) !== i)
      expect(missing, `FS2/P-TP-2 (§3.2 clause 4): every record belongs to EXACTLY one pass — missing=${JSON.stringify(missing)}`).toEqual([])
      expect(dupes, `FS2/P-TP-2: no record appears in two passes — duplicates=${JSON.stringify(dupes)}`).toEqual([])
      const counted = part.passes.reduce((a: number, p: any) => a + (p.records?.count ?? 0), 0)
      expect(counted, '§3.2 clause 4: Σ pass.records.count === hook.records').toBe(row.hook.records)
    }

    // FS1 — the IMPOSSIBLE case: the window is drawn BELOW the span union. The
    // accounting cannot produce a negative remainder: the field is null + a reason.
    const impossible = s1Row(ids, { hook: { ...s1Row(ids).hook, freezeWindow: { t0: 1000, t1: 1100 } } })
    const fs1 = api.partitionO0RowPasses(impossible)
    expect(fs1.ok, 'FS1 (§2.1/§2.4): a window below the span union is a computation defect (pass:false)').toBe(false)
    expect(fs1.row?.unaccountedMs, 'FS1: the FIELD is emitted null — a negative number never reaches a field').toBe(null)
    expect(JSON.stringify(fs1.failReasons), 'FS1/§6: the reason must name the number, the row/pass and the FS1 class').toMatch(/negative/i)
    expect(JSON.stringify(fs1.failReasons), 'FS1/§6: the reason must name the union-accounting class (M1)').toMatch(/M1|union/i)
    expect(
      JSON.stringify({ e: fs1.errors, f: fs1.failReasons }),
      'FS1/§2.4: NO field/cell/verdict of the result may carry a negative remainder',
    ).not.toMatch(/unaccountedMs["':\s]+-\d/)
  })

  it('PART-5 §2.1/§4.2 the RETIRED fields: `postStyle.residual`/`reconciliation.residual` are null + `retired:true`, and EVERY pass carries the closed §4.2 arithmetic', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    const part = api.partitionO0RowPasses(s2Row(api.O0_STAGE_IDS))
    const KINDS = ['pre-pass-render', 're-derive']
    for (const p of part.passes) {
      expect(KINDS, `§4.2: \`kind\` is the closed 2-value set — got ${String(p.kind)}`).toContain(p.kind)
      for (const f of ['index', 'kind', 'opener', 'window', 'records', 'stageCount', 'stages', 'topLevelSpans', 'sumOfSpansMs', 'accountedMs', 'unaccountedMs', 'overlapMs', 'outsideMs', 'longTaskTotalMs', 'pass', 'failReasons']) {
        expect(Object.prototype.hasOwnProperty.call(p, f), `§4.2/P-IM-1: the pass sub-row must carry \`${f}\``).toBe(true)
      }
      expect(p.sumOfSpansMs >= p.accountedMs, '§4.2: `sumOfSpansMs ≥ accountedMs`').toBe(true)
      expect(p.overlapMs, '§4.2: `overlapMs = sumOfSpansMs − accountedMs` (≥ 0)').toBeGreaterThanOrEqual(0)
      expect(p.pass, `§4.2: \`pass = (failReasons.length === 0)\` — got pass=${String(p.pass)} with reasons=${JSON.stringify(p.failReasons)}`).toBe(Array.isArray(p.failReasons) && p.failReasons.length === 0)
    }
  })
})

// ===========================================================================
// §2 — M3: the pinned long-task attribution rule + the two DISCRIMINATED alternatives
// ===========================================================================
describe(`M3 — the long-task attribution rule is PINNED and the alternatives are DISCRIMINATED (${MODULE_PATH} §2.3/§3.4)`, () => {
  /** The discriminating task list. Window [1000, 2000]:
   *   a  starts BEFORE t0 and overlaps IN  (start 900,  dur 200 → ends 1100)
   *   b  fully INSIDE                     (start 1100, dur 300 → ends 1400)
   *   c  straddles the END                (start 1900, dur 300 → ends 2200)
   *   d  fully INSIDE, ends exactly at t1 (start 2000, dur 0 is not a long task — use 1600/400)
   *   e  fully AFTER the window           (start 2500, dur 100)
   *  PINNED start-inside-inclusive = b + c + d = 300 + 300 + 400 = 1000 (a is
   *  excluded although it overlaps in 100 ms; e is excluded entirely) — the FULL
   *  duration of every start-inside task, §2.3/§3.4.
   *  The alternatives DIFFER: overlap-any = a+b+c+d = 1200 (a counts), and
   *  intersection = 100 + 300 + 100 + 400 = 900 (c and a clipped). Three
   *  pairwise-different totals are what makes the fixture discriminating (§5 P-TP-3). */
  const WIN = { t0: 1000, t1: 2000 }
  const TASKS = [
    { start: 900, duration: 200 }, // starts before t0, overlaps in
    { start: 1100, duration: 300 }, // fully inside
    { start: 1900, duration: 300 }, // starts inside, ends after t1
    { start: 1600, duration: 400 }, // fully inside, ends exactly at t1
    { start: 2500, duration: 100 }, // fully after
  ]
  const PINNED = 1000
  const OVERLAP_ANY = 1200
  const INTERSECTION = 900
  /** §3.4 pins `includedCount === longTasks.length`: the row's RECORDED list is the
   *  start-inside list (the excluded observations live in the attribution record's
   *  own `startBefore`/`straddlesEnd` arrays, §2.3). */
  const INCLUDED = TASKS.filter((t) => WIN.t0 <= t.start && t.start <= WIN.t1)

  it('ATTR-1 §2.3/§3.4 the pinned rule is `start-inside-inclusive` (t0 ≤ start ≤ t1, the FULL duration), and the two rejected alternatives are recorded as DIFFERENT totals', async () => {
    const api = await loadO0()
    expect(typeof api.deriveO0LongTaskAttribution, MISSING('deriveO0LongTaskAttribution(window, longTasks, opts?)')).toBe('function')
    const a = api.deriveO0LongTaskAttribution(WIN, TASKS)
    expect(a.rule, '§2.3/§4.4: the pinned rule must be RECORDED as `start-inside-inclusive`').toBe('start-inside-inclusive')
    expect(a.includedCount, '§2.3: includedCount is the count of tasks with t0 ≤ start ≤ t1').toBe(3)
    expect(a.includedMs, '§2.3/§5 P-TP-3: includedMs is the SUM OF THE FULL DURATIONS of the start-inside tasks').toBe(PINNED)
    expect(a.overlapAnyMs, '§2.3: overlapAnyMs is the total the REJECTED `overlap-any` rule would produce').toBe(OVERLAP_ANY)
    expect(a.intersectionMs, '§2.3: intersectionMs is the total the REJECTED `intersection` rule would produce').toBe(INTERSECTION)
    expect(
      new Set([a.includedMs, a.overlapAnyMs, a.intersectionMs]).size,
      `§5 P-TP-3/FIXTURE: the three rules must give PAIRWISE DIFFERENT totals on this list (got ${a.includedMs}/${a.overlapAnyMs}/${a.intersectionMs}) — a fixture whose alternatives coincide does not discriminate`,
    ).toBe(3)
    expect(a.startBefore?.length, '§2.3: the task starting before t0 is recorded under `startBefore`').toBe(1)
    expect(a.startBefore?.[0]?.overlapMs, '§2.3: `startBefore` carries the task’s overlap with the window').toBe(100)
    expect(a.straddlesEnd?.length, '§2.3: the task starting inside and ending after t1 is recorded under `straddlesEnd`').toBe(1)
    expect(a.straddleEndMs, '§2.3: straddleEndMs is the summed straddle overlap (2200 − 2000)').toBe(200)
    expect(a.startBeforeOverlapMs, '§2.3: startBeforeOverlapMs is the excluded tasks’ overlap').toBe(100)
    expect(a.ambiguous, '§2.3: a task starting before t0 with overlapMs > 0 makes the attribution AMBIGUOUS').toBe(true)
    expect(String(a.ambiguityReason ?? '').length, '§2.3/§6 FS5: an ambiguous row must carry a NON-EMPTY ambiguityReason naming the observed task(s) and the pinned rule').toBeGreaterThan(0)
    expect(a.ambiguityReason, '§2.3: the reason names the pinned rule').toMatch(/start-inside/i)
  })

  it('ATTR-2 §2.3 the boundary cases: `exactly-at-t0`/`exactly-at-t1` are INCLUDED (inclusive at BOTH endpoints), zero-duration/outside/empty lists behave', async () => {
    const api = await loadO0()
    if (typeof api.deriveO0LongTaskAttribution !== 'function') throw new Error(MISSING('deriveO0LongTaskAttribution(window, longTasks, opts?)'))
    const at0 = api.deriveO0LongTaskAttribution(WIN, [{ start: 1000, duration: 10 }])
    expect(at0.includedCount, '§2.3: a task starting EXACTLY at t0 is included (inclusive)').toBe(1)
    expect(at0.includedMs).toBe(10)
    const at1 = api.deriveO0LongTaskAttribution(WIN, [{ start: 2000, duration: 10 }])
    expect(at1.includedCount, '§2.3: a task starting EXACTLY at t1 is included (inclusive)').toBe(1)
    const before = api.deriveO0LongTaskAttribution(WIN, [{ start: 900, duration: 10 }])
    expect(before.includedCount, '§2.3: a task starting BEFORE t0 is EXCLUDED entirely, even where it overlaps the window').toBe(0)
    expect(before.includedMs).toBe(0)
    const after = api.deriveO0LongTaskAttribution(WIN, [{ start: 2500, duration: 10 }])
    expect(after.includedCount, '§2.3: a task starting after t1 is excluded').toBe(0)
    const empty = api.deriveO0LongTaskAttribution(WIN, [])
    expect(empty.ok, '§3.4: an EMPTY task list is legal (no long task observed)').toBe(true)
    expect([empty.includedCount, empty.includedMs, empty.overlapAnyMs, empty.intersectionMs], '§3.4: the empty list totals are all 0').toEqual([0, 0, 0, 0])
    expect(empty.ambiguous, '§2.3: an empty list is never ambiguous').toBe(false)
    const zero = api.deriveO0LongTaskAttribution(WIN, [{ start: 1200, duration: 0 }])
    expect(zero.includedCount, '§2.3: a zero-duration task inside the window is included and adds nothing').toBe(1)
    expect(zero.includedMs).toBe(0)
  })

  it('RULE-2 §3.4/S8/S9 the oracle is RE-DERIVED from the recorded list: `includedCount`/`includedMs` must agree with the row’s own `longTasks`/`longTaskTotalMs` (a mismatch is FS5)', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const ids = api.O0_STAGE_IDS
    const honest = shapeRow(ids)
    // §3.4: the row's recorded `longTasks` is the list the oracle counts — its length
    // must equal `includedCount` (the excluded tasks are recorded in the attribution
    // record's `startBefore`/`straddlesEnd`, §2.3).
    honest.longTasks = INCLUDED.map((t) => ({ ...t }))
    honest.longTaskTotalMs = PINNED
    honest.hook.longTaskAttribution = api.deriveO0LongTaskAttribution(WIN, TASKS)
    // [remand-2026-09-21b] — the attribution's window IS the row's freeze window (the
    // oracle re-derives from `hook.freezeWindow`, §3.4), and `shapeRow()` built the
    // DECLARED `reconciliation` triple from the SIBLING freeze window `{1000,1300}`
    // (`300 / 281.5 / 18.5`). Overriding `freezeWindow` with `WIN {1000,2000}` without
    // rebuilding the declared block left the declaration at `windowMs 300` while the
    // same records now derive `windowMs 1000 / accounted 281.5 / unaccounted 718.5` —
    // the declared-vs-derived clause (§4.1/§13.2 (8)(c)) correctly refused it. The
    // FIXTURE is corrected (the clause is not weakened): the declared triple +
    // `bandExceeded` are the DERIVED ones for THIS window, and the recorded band is
    // this fixture's own `reconciliation.toleranceMs 50` (718.5 > 50 ⇒ bandExceeded).
    honest.hook.freezeWindow = WIN
    const honestDerivedRow = api.partitionO0RowPasses({ ...honest, hook: { ...honest.hook, freezeWindow: WIN } }).row
    honest.reconciliation = {
      ...honest.reconciliation,
      windowMs: honestDerivedRow.windowMs,
      accountedMs: honestDerivedRow.accountedMs,
      unaccountedMs: honestDerivedRow.unaccountedMs,
      overlapMs: honestDerivedRow.overlapMs,
      outsideMs: honestDerivedRow.outsideMs,
      passOverlapSumMs: honestDerivedRow.passOverlapSumMs,
      naiveSumResidualMs: honestDerivedRow.naiveSumResidualMs,
      bandExceeded: honestDerivedRow.unaccountedMs !== null && honestDerivedRow.unaccountedMs > honest.reconciliation.toleranceMs,
    }
    const ok = api.validateO0MeasurementShape(honest)

    // FS5 — a total that equals the REJECTED alternative while claiming the pinned rule.
    const lying = { ...honest, longTaskTotalMs: OVERLAP_ANY }
    const bad = api.validateO0MeasurementShape(lying)
    expect(bad.ok, 'FS5 (§2.3): a `longTaskTotalMs` equal to the rejected `overlap-any` total while claiming the pinned rule is pass:false').toBe(false)
    expect(JSON.stringify(bad.failReasons), 'FS5/§6: the reason must name ALL THREE totals').toMatch(new RegExp(`${OVERLAP_ANY}`))
    expect(JSON.stringify(bad.failReasons), 'FS5/§6: the reason must name the pinned total').toMatch(new RegExp(`${PINNED}`))
    expect(JSON.stringify(bad.failReasons), 'FS5/§6: the reason must name the rejected alternative').toMatch(/overlap-any|intersection/i)

    // FS5 — a recorded list that disagrees with the recorded includedCount.
    const short = { ...honest, longTasks: INCLUDED.slice(0, 2).map((t) => ({ ...t })) }
    const bad2 = api.validateO0MeasurementShape(short)
    expect(bad2.ok, 'FS5 (§3.4): a recorded task list disagreeing with `includedCount` is pass:false').toBe(false)
    expect(JSON.stringify(bad2.failReasons), 'FS5: the disagreement must be named').toMatch(/includedCount|task list|disagrees/i)

    // FS5 — an excluded startBefore task whose overlap exceeds the band with NO reason.
    const muteAmbiguity = { ...honest, hook: { ...honest.hook, longTaskAttribution: { ...honest.hook.longTaskAttribution, ambiguityReason: null, ambiguous: false } } }
    const bad3 = api.validateO0MeasurementShape(muteAmbiguity)
    expect(bad3.ok, 'FS5 (§2.3/S8): an excluded `startBefore` task with overlapMs > the recorded band is legal ONLY together with a recorded ambiguityReason').toBe(false)
    expect(JSON.stringify(bad3.failReasons), 'FS5/§6: the reason names the pinned START-INSIDE-INCLUSIVE rule').toMatch(/start-inside-inclusive/i)

    // The honest leg is asserted LAST so that the three FS5 legs above have EXECUTED
    // before this red is reported (the counterexample must not mask them). §3.4/§2.3:
    // an S8/S9 row whose numbers AGREE with the pinned rule (includedMs ===
    // longTaskTotalMs, a recorded ambiguityReason) is legal and must validate.
    expect(ok.ok, `§3.4: an honest row (includedMs === longTaskTotalMs) must validate — errors=${JSON.stringify(ok.errors)}`).toBe(true)
  })

  it('FIX-TP3 [P-TP-3] `strat:o0-longtask-attribution`: the seven task classes over generated lists — the pinned total equals the start-inside sum EXACTLY, and a row whose total equals either rejected alternative is refused', async () => {
    const api = await loadO0()
    const rep = runProperty('P-TP-3', 'strat:o0-longtask-attribution', (_i, rng) => {
      if (typeof api.deriveO0LongTaskAttribution !== 'function') return MISSING('deriveO0LongTaskAttribution(window, longTasks, opts?)')
      const t0 = int(rng, 0, 500)
      const t1 = t0 + int(rng, 50, 400)
      const cls = int(rng, 0, 6)
      const lists: Array<Array<{ start: number; duration: number }>> = [
        [],
        [{ start: t0 - 20, duration: 40 }],
        [{ start: t0 + 10, duration: 30 }],
        [{ start: t1 - 10, duration: 60 }],
        [{ start: t1 + 20, duration: 30 }],
        [{ start: t0, duration: 5 }, { start: t1, duration: 5 }, { start: t0 - 5, duration: 20 }, { start: t1 - 5, duration: 25 }],
        [
          { start: t0 - 5, duration: 20 },
          { start: t0 + 5, duration: 20 },
          { start: t1 - 5, duration: 25 },
          { start: t1 + 5, duration: 20 },
        ],
      ]
      const list = lists[cls]
      const a = api.deriveO0LongTaskAttribution({ t0, t1 }, list)
      const what = `cls=${cls} win=[${t0},${t1}] list=${JSON.stringify(list)}`
      const inside = list.filter((e) => t0 <= e.start && e.start <= t1)
      const expectPinned = inside.reduce((s, e) => s + e.duration, 0)
      const expectOverlapAny = list.filter((e) => e.start <= t1 && e.start + e.duration > t0).reduce((s, e) => s + e.duration, 0)
      const expectIntersection = list.reduce((s, e) => s + Math.max(0, Math.min(e.start + e.duration, t1) - Math.max(e.start, t0)), 0)
      if (!a.ok) return `${what}: the oracle refused a legal list — errors=${JSON.stringify(a.errors)}`
      if (a.includedCount !== inside.length) return `${what}: includedCount ${a.includedCount} ≠ the start-inside count ${inside.length}`
      if (a.includedMs !== expectPinned) return `${what}: includedMs ${a.includedMs} ≠ the pinned start-inside sum ${expectPinned}`
      if (a.overlapAnyMs !== expectOverlapAny) return `${what}: overlapAnyMs ${a.overlapAnyMs} ≠ the rejected overlap-any total ${expectOverlapAny}`
      if (a.intersectionMs !== expectIntersection) return `${what}: intersectionMs ${a.intersectionMs} ≠ the rejected intersection total ${expectIntersection}`
      if (a.rule !== 'start-inside-inclusive') return `${what}: the rule must be RECORDED as the pinned one`
      const expectAmbiguous = a.startBeforeOverlapMs > 0 || a.straddleEndMs > 0
      if (a.ambiguous !== expectAmbiguous) return `${what}: ambiguous ${String(a.ambiguous)} (expected ${expectAmbiguous} from the recorded overlaps)`
      if (a.ambiguous && !String(a.ambiguityReason ?? '').length) return `${what}: an ambiguous attribution carried no ambiguityReason`
      if (typeof api.validateO0MeasurementShape !== 'function') return MISSING('validateO0MeasurementShape(row)')
      const honest = shapeRow(api.O0_STAGE_IDS)
      honest.hook = { ...honest.hook, freezeWindow: { t0, t1 }, longTaskAttribution: a }
      // §3.4 — the row's recorded `longTasks` is the list the oracle counts, so its
      // length must equal the attribution's `includedCount`: the START-INSIDE subset of
      // the drawn list (the excluded tasks stay recorded in `a.startBefore`/`a.straddlesEnd`).
      honest.longTasks = inside.map((e) => ({ ...e }))
      honest.longTaskTotalMs = expectPinned
      const v = api.validateO0MeasurementShape(honest)
      if (!v.ok) return `${what}: an honest row must validate — errors=${JSON.stringify(v.errors)}`
      if (expectOverlapAny !== expectPinned && expectOverlapAny !== expectIntersection) {
        const lying = { ...honest, longTaskTotalMs: expectOverlapAny }
        const bad = api.validateO0MeasurementShape(lying)
        if (bad.ok) return `${what}: a total equal to the REJECTED overlap-any total (${expectOverlapAny}) validated ok:true while claiming the pinned rule`
      }
      // §13.1 (3)/§3.4 — the recorded attribution TOTALS are TRUSTED today: an honest
      // row whose RECORDED `startBeforeOverlapMs` is forged to 0 while the recorded
      // `longTasks` list re-derives a positive overlap must be refused. The leg runs
      // only where no OTHER clause can fire (the inside list re-derives the same
      // includedCount), so a green here means the re-derivation clause is what moved.
      const honestDerived = api.deriveO0LongTaskAttribution({ t0, t1 }, honest.longTasks)
      if (honestDerived.includedCount === a.includedCount && a.startBeforeOverlapMs > 0) {
        const forged = {
          ...honest,
          hook: { ...honest.hook, longTaskAttribution: { ...a, startBefore: [], startBeforeOverlapMs: 0, straddleEndMs: 0, ambiguous: false, ambiguityReason: null } },
        }
        const vf = api.validateO0MeasurementShape(forged)
        if (vf.ok) {
          return `${what}: a row RECORDING startBeforeOverlapMs 0 while its recorded longTasks list re-derives ${a.startBeforeOverlapMs} ms validated ok:true — the recorded attribution is trusted, not re-derived (§3.4/§13.1 (3): recorded ≠ derived is pass:false, both numbers named)`
        }
      }
      return null
    })
    assertHeld(rep)
  })

  it('RULE-3 §2.3/S10 the per-pass totals are NOT required to sum to the row total (a straddling task is counted in both) and the double count is RECORDED', async () => {
    const api = await loadO0()
    if (typeof api.deriveO0LongTaskAttribution !== 'function') throw new Error(MISSING('deriveO0LongTaskAttribution(window, longTasks, opts?)'))
    // S10's shared counting needs the task to START INSIDE BOTH pass windows: under the
    // pinned start-inside-inclusive rule a task counted by two passes requires the two
    // pass windows to OVERLAP (a legal state — §3.3/S5: `passOverlapSumMs`/`passOverlaps`
    // record it), never a task "straddling" two DISJOINT windows (which the pinned rule
    // excludes from the second one entirely).
    const p1 = api.deriveO0LongTaskAttribution({ t0: 1000, t1: 1500 }, [{ start: 1400, duration: 300 }])
    const p2 = api.deriveO0LongTaskAttribution({ t0: 1300, t1: 2000 }, [{ start: 1400, duration: 300 }])
    expect([p1.includedMs, p2.includedMs], 'S10: the shared task is counted in FULL by BOTH passes (1400 starts inside each window under the pinned rule)').toEqual([300, 300])
    const row = api.deriveO0LongTaskAttribution({ t0: 1000, t1: 2000 }, [{ start: 1400, duration: 300 }])
    expect(row.includedMs, 'S10: the row total is 300 while the pass totals sum to 600 — mis-reading the difference as an error is itself a review finding').toBe(300)
    const shape = api.validateO0MeasurementShape(shapeRow(api.O0_STAGE_IDS, { hook: { ...shapeRow(api.O0_STAGE_IDS).hook, passLongTaskDoubleCountMs: 300 } }))
    expect(shape.ok, 'S10: a recorded `passLongTaskDoubleCountMs > 0` is LEGAL, never an error').toBe(true)
  })
})

// ===========================================================================
// §3 — M2: the per-row arm/disarm counters (§2.2/§3.5)
// ===========================================================================
describe(`M2 — the arm/disarm counters are PER-ROW-bounded (${MODULE_PATH} §2.2/§3.5)`, () => {
  const counts = (pre: any, post: any) => ({ pre, post })
  const hookFor = (over: Record<string, any> = {}): Record<string, any> => ({
    armed: true,
    records: 6,
    armWindow: { t0: 999, t1: 1300, ms: 301 },
    freezeWindow: { t0: 1000, t1: 1300 },
    toleranceMs: 40,
    sessionArmCount: 2,
    sessionDisarmCount: 2,
    sessionCountsAt: counts({ arm: 1, disarm: 1, at: 999 }, { arm: 2, disarm: 2, at: 1300.5 }),
    rowArmCount: 1,
    rowDisarmCount: 1,
    ...over,
  })

  it('ARM-1 §2.2/§3.5 the derivation rule is pinned: `rowArmCount = post.arm − pre.arm`, `rowDisarmCount = post.disarm − pre.disarm` from the PRE-ARM and POST-DISARM readings', async () => {
    const api = await loadO0()
    expect(typeof api.deriveO0RowArmCounts, MISSING('deriveO0RowArmCounts(hook)')).toBe('function')
    const d = api.deriveO0RowArmCounts(hookFor())
    expect(d.rowArmCount, '§2.2: rowArmCount is the delta of the two recorded readings').toBe(1)
    expect(d.rowDisarmCount).toBe(1)
    expect(d.sessionArmCount, '§2.2: sessionArmCount is the handle’s CUMULATIVE armCount at the POST-DISARM reading').toBe(2)
    expect(d.sessionDisarmCount).toBe(2)
    expect(d.sessionCountsAt?.pre?.at, '§2.2: the pre reading carries its own `performance.now()` stamp').toBe(999)
    expect(d.sessionCountsAt?.post?.at, '§2.2: the post reading is taken AFTER the row’s own disarm').toBe(1300.5)
    expect(d.ok, `§2.2: the legal 1/1 row must derive ok — reasons=${JSON.stringify(d.failReasons)}`).toBe(true)

    // The one-reading-EARLY row (the §1.2 defect): the counts come from the PRE-disarm
    // reading, so the row's own disarm lands on the NEXT row → 1/0.
    const early = api.deriveO0RowArmCounts(hookFor({ sessionCountsAt: counts({ arm: 1, disarm: 1, at: 999 }, { arm: 2, disarm: 1, at: 1300.5 }) }))
    expect([early.rowArmCount, early.rowDisarmCount], '§2.2: the readings are what they are — the derivation never invents the missing disarm').toEqual([1, 0])
    expect(early.ok, 'FS4 (§2.2/§6 FS4): a row whose counts come from the PRE-disarm reading must be pass:false naming the reading order').toBe(false)
    expect(JSON.stringify(early.failReasons), 'FS4/§6: the reason names the POST-DISARM reading requirement').toMatch(/POST-DISARM|post-disarm|pre-arm/i)
    expect(JSON.stringify(early.failReasons), 'FS4/§6: the raw readings are printed').toMatch(/rowArmCount|sessionArmCount/)

    // A DOUBLE arm (2/1) and a negative delta (0/1) are both violations.
    for (const [arm, disarm, label] of [[2, 1, 'double-arm 2/1'], [1, 2, 'a−d = −1']] as const) {
      const bad = api.deriveO0RowArmCounts(hookFor({ sessionCountsAt: counts({ arm: 1, disarm: 1, at: 999 }, { arm: 1 + arm, disarm: 1 + disarm, at: 1300.5 }) }))
      expect(bad.ok, `FS4: ${label} must violate the per-row invariant (0 ≤ a−d ≤ 1)`).toBe(false)
    }
  })

  it('ARM-2 §2.2/S3 the branches: an UNARMED baseline is 0/0 with `pre == post`; an armed row with a completed drain is exactly 1/1', async () => {
    const api = await loadO0()
    if (typeof api.deriveO0RowArmCounts !== 'function') throw new Error(MISSING('deriveO0RowArmCounts(hook)'))
    const unarmed = api.deriveO0RowArmCounts({
      armed: false,
      records: 0,
      armWindow: null,
      sessionArmCount: 3,
      sessionDisarmCount: 3,
      sessionCountsAt: counts({ arm: 3, disarm: 3, at: 500 }, { arm: 3, disarm: 3, at: 600 }),
      rowArmCount: 0,
      rowDisarmCount: 0,
    })
    expect([unarmed.rowArmCount, unarmed.rowDisarmCount], '§2.2/S3: the deliberately UNARMED baseline reads exactly 0/0').toEqual([0, 0])
    expect(unarmed.ok, `S3: the unarmed baseline is legal — reasons=${JSON.stringify(unarmed.failReasons)}`).toBe(true)
    const armed = api.deriveO0RowArmCounts(hookFor({ sessionArmCount: 5, sessionDisarmCount: 5, sessionCountsAt: counts({ arm: 4, disarm: 4, at: 999 }, { arm: 5, disarm: 5, at: 1300.5 }) }))
    expect([armed.rowArmCount, armed.rowDisarmCount], '§2.2: an armed row whose drain completed reads exactly 1/1').toEqual([1, 1])
    expect(armed.ok).toBe(true)
  })

  it('ARM-3 FS4/§6 no imputation: a MISSING reading is named, never coerced to 0', async () => {
    const api = await loadO0()
    if (typeof api.deriveO0RowArmCounts !== 'function') throw new Error(MISSING('deriveO0RowArmCounts(hook)'))
    for (const junk of [undefined, null, {}, { armed: true }, { sessionCountsAt: null }, { sessionCountsAt: {} }, { sessionCountsAt: { pre: { arm: 1, disarm: 1, at: 1 } } }]) {
      let out: any = null
      let threw: unknown = null
      try {
        out = api.deriveO0RowArmCounts(junk)
      } catch (e) {
        threw = e
      }
      expect(threw, `§2.2 no-imputation: deriveO0RowArmCounts(${JSON.stringify(junk)}) threw — the pure module returns a discriminated result`).toBe(null)
      if (out?.ok === true) throw new Error(`§2.2 no-imputation: a hook with NO recorded readings validated ok:true (${JSON.stringify(junk)})`)
      const blob = JSON.stringify(out?.failReasons ?? [])
      expect(blob, `§6 FS4/FS10: the missing reading must be named by FIELD PATH, never coerced to 0 (input ${JSON.stringify(junk)})`).toMatch(/sessionCountsAt|reading|armCount/)
      expect(blob, `§6 FS10: a missing count is never treated as 0 — the reason must name the field, got ${blob}`).not.toMatch(/^\s*$/i)
    }
  })

  it('FIX-SM1 [P-SM-1] the per-row invariant `0 ≤ rowArmCount − rowDisarmCount ≤ 1`, `1/1` on every armed row, `0/0` on the baseline, and `session ≥ row` — over generated reading pairs', async () => {
    const api = await loadO0()
    const rep = runProperty('P-SM-1', 'strat:o0-arm-counts', (i, rng) => {
      if (typeof api.deriveO0RowArmCounts !== 'function') return MISSING('deriveO0RowArmCounts(hook)')
      if (typeof api.validateO0MeasurementShape !== 'function') return MISSING('validateO0MeasurementShape(row)')
      const mode = int(rng, 0, 7)
      // modes: 0 legal 1/1 | 1 one-reading-early 1/0 (a VIOLATION: an armed row with a
      //        completed drain must read exactly 1/1 — §2.2/P-SM-1, so `1/0` is the
      //        failure the invariant mandates, not a legal row) | 2 double-arm 2/1
      //        (also a VIOLATION: armed ⇒ 1/1) | 3 unarmed 0/0 | 4 pre stamp AFTER post |
      //        5 missing post reading | 6 armed but 0/0 (session < row) |
      //        7 legal 1/1 at a high session count
      const sessionBase = int(rng, 0, 40)
      let pre = { arm: sessionBase, disarm: sessionBase, at: 100 }
      let post = { arm: sessionBase + 1, disarm: sessionBase + 1, at: 200 }
      let armed = true
      let expectOk = true
      if (mode === 1) post = { arm: sessionBase + 1, disarm: sessionBase, at: 200 }
      else if (mode === 2) post = { arm: sessionBase + 2, disarm: sessionBase + 1, at: 200 }
      else if (mode === 3) {
        armed = false
        post = { arm: sessionBase, disarm: sessionBase, at: 200 }
      } else if (mode === 4) post = { arm: sessionBase + 1, disarm: sessionBase + 1, at: 50 }
      else if (mode === 5) post = null as any
      else if (mode === 6) post = { arm: sessionBase, disarm: sessionBase, at: 200 }
      if (mode === 1 || mode === 2 || mode === 4 || mode === 5 || mode === 6) expectOk = false
      const hook: any = {
        armed,
        records: armed ? 3 : 0,
        armWindow: armed ? { t0: 100, t1: 200, ms: 100 } : null,
        sessionCountsAt: { pre, post },
        sessionArmCount: post ? post.arm : undefined,
        sessionDisarmCount: post ? post.disarm : undefined,
      }
      const d = api.deriveO0RowArmCounts(hook)
      if (d.ok !== expectOk) {
        return `mode=${mode} pre=${JSON.stringify(pre)} post=${JSON.stringify(post)} → ok=${String(d.ok)} (expected ${expectOk}); reasons=${JSON.stringify(d.failReasons)}`
      }
      if (!expectOk) {
        if (!(Array.isArray(d.failReasons) && d.failReasons.length > 0)) return `mode=${mode}: a violation with no failReasons line`
        return null
      }
      const delta = d.rowArmCount - d.rowDisarmCount
      if (!(delta >= 0 && delta <= 1)) return `mode=${mode}: 0 ≤ a−d ≤ 1 violated (a=${d.rowArmCount} d=${d.rowDisarmCount})`
      if (armed && (d.rowArmCount !== 1 || d.rowDisarmCount !== 1)) return `mode=${mode}: an armed row with a completed drain must read exactly 1/1 (got ${d.rowArmCount}/${d.rowDisarmCount})`
      if (!armed && (d.rowArmCount !== 0 || d.rowDisarmCount !== 0)) return `mode=${mode}: the unarmed baseline must read 0/0 (got ${d.rowArmCount}/${d.rowDisarmCount})`
      if (!(d.sessionArmCount >= d.rowArmCount && d.sessionDisarmCount >= d.rowDisarmCount)) {
        return `mode=${mode}: session ≥ row violated (session ${d.sessionArmCount}/${d.sessionDisarmCount} vs row ${d.rowArmCount}/${d.rowDisarmCount})`
      }
      // FS9 — the row is built with the RETIRED bare aliases present: the shape must
      // refuse it, and the SAME row without them must validate.
      const base = shapeRow(api.O0_STAGE_IDS)
      const row = { ...base, hook: { ...base.hook, armed, armWindow: hook.armWindow, sessionCountsAt: hook.sessionCountsAt, sessionArmCount: d.sessionArmCount, sessionDisarmCount: d.sessionDisarmCount, rowArmCount: d.rowArmCount, rowDisarmCount: d.rowDisarmCount, armCount: 1, disarmCount: 1 } }
      const v = api.validateO0MeasurementShape(row)
      if (v.ok) return `mode=${mode}: a row carrying the RETIRED bare aliases (hook.armCount/hook.disarmCount) validated ok:true`
      if (!JSON.stringify(v.failReasons).match(/retired|armCount/i)) return `mode=${mode}: the FS9 reason does not name the retired aliases: ${JSON.stringify(v.failReasons)}`
      const clean = { ...row, hook: { ...row.hook } }
      delete clean.hook.armCount
      delete clean.hook.disarmCount
      const ok = api.validateO0MeasurementShape(clean)
      if (!ok.ok) return `mode=${mode}: the SAME row without the retired aliases must validate — errors=${JSON.stringify(ok.errors)}`
      // §13.2 (8)(b) — the row's OWN `pass`/`failReasons` pair is checked, not assumed:
      // the mirror direction (`pass:false` with an EMPTY reason set) is the schema error
      // §6 names and must be refused on this very shape.
      const silent = { ...clean, hook: { ...clean.hook }, pass: false, failReasons: [] }
      const vs = api.validateO0MeasurementShape(silent)
      if (vs.ok) {
        return `mode=${mode}: a row DECLARING pass:false with an EMPTY failReasons[] validated ok:true — the row's own verdict pair is never checked (§4.2/§4.3 fail-loud/§13.2 (8)(b))`
      }
      if (!/pass|failReasons|reason/i.test(JSON.stringify(vs.failReasons))) {
        return `mode=${mode}: the row-verdict reason does not name the pair: ${JSON.stringify(vs.failReasons)}`
      }
      return null
    })
    assertHeld(rep)
  })

  it('ARM-4 FS4/FS9 a row whose recorded per-row counts VIOLATE the invariant is refused, and the retired aliases can never satisfy the shape', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const base = shapeRow(api.O0_STAGE_IDS)
    for (const [a, d, label] of [[2, 1, '2/1'], [1, 0, '1/0 (the one-reading-early row)'], [0, 1, '0/1']] as const) {
      const row = { ...base, hook: { ...base.hook, rowArmCount: a, rowDisarmCount: d } }
      const v = api.validateO0MeasurementShape(row)
      expect(v.ok, `FS4 (§2.2/§6 FS4): a row recording ${label} violates 0 ≤ a−d ≤ 1 and must be pass:false`).toBe(false)
      expect(JSON.stringify(v.failReasons), `FS4: the reason must print the raw readings (${label})`).toMatch(/rowArmCount/)
    }
    // FS9 — a legacy row carrying ONLY the retired aliases: the shape names them.
    const legacy = { ...base, hook: { ...base.hook, armCount: 1, disarmCount: 1 } }
    delete legacy.hook.rowArmCount
    delete legacy.hook.rowDisarmCount
    delete legacy.hook.sessionArmCount
    delete legacy.hook.sessionDisarmCount
    delete legacy.hook.sessionCountsAt
    const v = api.validateO0MeasurementShape(legacy)
    expect(v.ok, 'FS9 (§2.2/S14): a row carrying the retired session aliases WITHOUT the explicit names is pass:false').toBe(false)
    expect(JSON.stringify(v.failReasons), 'FS9/§6: the pinned reason names the retired aliases and the replacement fields').toMatch(/rowArmCount/)
  })
})

// ===========================================================================
// §4 — P-SM-2: the DEC-1 separation discipline under the NEW shape
// ===========================================================================
describe(`P-SM-2 — the DEC-1 separation discipline holds UNDER the new shape (§2.1 clause 5/§9/§10.9)`, () => {
  const SEAM = 'no seam in the executing bundle (src/main/main.cjs:IPC_RAG_SNAPSHOT has no transport — §3.6b RUL-3)'
  function openStructuralRow(ids: readonly string[], over: Record<string, any> = {}): Record<string, any> {
    const row = shapeRow(ids)
    row.stages = stageRows(ids, (id) => (id === 'post.style' ? 0 : 5), ['snapshot.clone', 'post.style'])
    row.stages = row.stages.map((s: any) => (s.id === 'snapshot.clone' ? { ...s, structural: true, structuralReason: SEAM } : s))
    row.hook = { ...row.hook, rendererArmed: true }
    row.pass = false
    row.failReasons = [
      `stage snapshot.clone is structurally unseparated — ${SEAM} (§6 S14)`,
      'stage post.style is unseparated as the DERIVED residual (§2.2 id 11)',
    ]
    return {
      ...row,
      postStyle: {
        ms: null,
        unseparated: true,
        source: 'derived',
        timed: false,
        derived: true,
        derivedNote: 'post.style is DERIVED (§2.2 id 11)',
        attributable: false,
        residual: null,
        retired: true,
        retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)',
      },
      reconciliation: {
        ...row.reconciliation,
        ok: false,
        openStructural: true,
        // [remand-2026-09-21, the architect's ruling] — `unaccountedMs` stays the
        // DECLARED-AND-COHERENT remainder inherited from `shapeRow` (the row's own
        // records' accounting), so the §4.1 identity `accountedMs + unaccountedMs ===
        // windowMs` and the `bandExceeded` outcome hold EXACTLY. The former hand-written
        // `54.8` on a `300 / 281.6` declaration was incoherent (it also contradicted the
        // recorded 50 ms band with `bandExceeded:false`) and is exactly what forced the
        // declared-vs-derived clause to be read directionally: the FIXTURE is corrected,
        // the strict clause is not weakened.
        bandExceeded: row.reconciliation.bandExceeded,
        unaccountedSource: 'derived',
        unaccountedAttributable: false,
        residual: null,
        retired: true,
        reason: 'unseparated stage(s) snapshot.clone, post.style cannot be reconciled (§5 P-TP-1/§6 F4)',
        note: `snapshot.clone is structurally unseparated (${SEAM}); the post.style residual therefore cannot be computed ... no value was imputed (§3.6b RUL-4)`,
      },
      status: 'OPEN-structural',
      ...over,
    }
  }

  it('DEC1-1 §2.1 clause 5/§10.9 the row-level `post.style` stays ms:null + unseparated + attributable:false while `snapshot.clone` is structurally unseparated — and the remainder is NOT the post.style value', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = openStructuralRow(api.O0_STAGE_IDS)
    const v = api.validateO0MeasurementShape(row)
    expect(v.ok, `§2.1 clause 5: the OPEN-structural row must be SCHEMA-VALID — errors=${JSON.stringify(v.errors)}`).toBe(true)
    expect(row.postStyle.ms, '§2.1 clause 5: `postStyle.ms` stays exactly null').toBe(null)
    expect(row.postStyle.unseparated, '§2.1 clause 5: `unseparated: true`').toBe(true)
    expect(row.postStyle.attributable, '§2.1 clause 5: `attributable: false` — a remainder is never attributable').toBe(false)
    expect(row.postStyle.residual, '§2.1: `postStyle.residual` is RETIRED to null').toBe(null)
    expect(row.postStyle.retired, '§2.1: the retired field carries the recorded marker `retired: true`').toBe(true)
    expect(row.postStyle.retiredBy, '§2.1: `retiredBy` names the unit').toMatch(/O0-M1-M3-MEASUREMENT-SHAPE/)
    expect(row.reconciliation.residual, '§2.1: `reconciliation.residual` is RETIRED to null').toBe(null)
    expect(row.status, '§9: the DEC-1 visibility invariant — the report stays `OPEN-structural`, never quietly `"OK"`').toBe('OPEN-structural')

    // [remand-2026-09-21, the architect's ruling] — the DECLARED reconciliation block is
    // INTERNALLY COHERENT and agrees with the DERIVED accounting under STRICT equality:
    // the `ok:true` above is pinned on a row whose declared triple satisfies
    // `accountedMs + unaccountedMs === windowMs` and whose `bandExceeded` is the correct
    // outcome for the RECORDED band. This pin is what lets the declared-vs-derived clause
    // be STRICT: a fixture that drifts (the former hand-written
    // `300 / 281.6 / 18.4 / bandExceeded:false`) now fails HERE, at its own arithmetic,
    // instead of silently licensing a directional allowance in the validator.
    const derived = api.partitionO0RowPasses(row).row
    const decl = row.reconciliation
    expect(
      decl.windowMs,
      '§4.1: the declared window is the row’s own measured freeze window (not a hand-written constant)',
    ).toBe(derived.windowMs)
    expect(decl.accountedMs, '§3.3/§4.1: the declared union measure AGREES with the derived union measure (≤ the recorded 0.1 ms granularity)').toBeCloseTo(derived.accountedMs, 3)
    expect(decl.unaccountedMs, '§4.1: the declared remainder AGREES with the derived remainder').toBeCloseTo(derived.unaccountedMs as number, 3)
    expect(
      Math.round((decl.accountedMs + decl.unaccountedMs) * 1000) / 1000,
      '§4.1/[remand-2026-09-21]: the declared identity `accountedMs + unaccountedMs === windowMs` holds EXACTLY',
    ).toBe(decl.windowMs)
    expect(
      decl.bandExceeded,
      `§2.1(ii): bandExceeded is DERIVED from the declared remainder ${String(decl.unaccountedMs)} ms and the recorded ${String(decl.toleranceMs)} ms band`,
    ).toBe(decl.unaccountedMs > decl.toleranceMs)

    // The two directions of the separation discipline: the computed remainder is a
    // DERIVED accounting quantity and may never be quoted as a cost.
    const laundered = openStructuralRow(api.O0_STAGE_IDS, {
      reconciliation: { ...openStructuralRow(api.O0_STAGE_IDS).reconciliation, unaccountedSource: 'measured', note: 'the remainder is the style/layout cost' },
    })
    const bad = api.validateO0MeasurementShape(laundered)
    expect(bad.ok, 'FS8 (§2.1/§6 FS8): a remainder presented as a style/layout cost is pass:false').toBe(false)
    expect(JSON.stringify(bad.failReasons), 'FS8: the reason names the field and the laundering').toMatch(/style|layout|derived|attributable/i)

    const numericResidual = openStructuralRow(api.O0_STAGE_IDS, { postStyle: { ...openStructuralRow(api.O0_STAGE_IDS).postStyle, residual: 54.8 } })
    const bad2 = api.validateO0MeasurementShape(numericResidual)
    expect(bad2.ok, 'FS8 (§2.1/§6 FS8): a NON-NULL `postStyle.residual` is pass:false — the legacy field may never carry the new remainder').toBe(false)
    expect(JSON.stringify(bad2.failReasons), 'FS8: the reason names the RETIRED field and points at `reconciliation.unaccountedMs`').toMatch(/RETIRED|retired/i)
  })

  it('FIX-SM2 [P-SM-2] the DEC-1 discipline over generated rows: a structural stage in pass 1, a merely-unmeasured stage, all-measured, and a band-exceeded remainder', async () => {
    const api = await loadO0()
    const rep = runProperty('P-SM-2', 'strat:o0-dec1-discipline', (i, rng) => {
      if (typeof api.validateO0MeasurementShape !== 'function') return MISSING('validateO0MeasurementShape(row)')
      const mode = int(rng, 0, 3)
      // 0 a structural stage in pass 1 | 1 a merely unmeasured (non-structural) stage |
      // 2 all stages measured (the DERIVED remainder inside the recorded band) |
      // 3 the laundered variant
      const ids = api.O0_STAGE_IDS
      const row = openStructuralRow(ids)
      if (mode === 0 || mode === 3) {
        /* the structural branch as-is */
      } else if (mode === 1) {
        row.stages = stageRows(ids, () => 5).map((s: any) => (s.id === 'traversal.build' ? { ...s, ms: null, unseparated: true, structural: false, structuralReason: null } : s))
        row.failReasons = ['stage traversal.build is unmeasured in this run (the seam exists but the recorder was not armed — §6 S14)']
      } else {
        row.stages = stageRows(ids, () => 1)
        row.postStyle = { ...row.postStyle, ms: 54.8, unseparated: false }
        // [remand-2026-09-21b] — the DECLARED accounting is rebuilt from the PARTITION,
        // never hand-written. The former block declared `{bandExceeded:true,
        // unaccountedMs:54.8}` on a row whose own records derive `windowMs 300 /
        // accounted 281.5 / unaccounted 18.5` (with the RECORDED `toleranceMs 50`): the
        // hand-written `54.8` was neither the window minus the union nor a band outcome,
        // so the declared-vs-derived clause (§4.1/§13.2 (8)(c)) correctly refused it.
        // This fixture's own record set leaves 18.5 ms unaccounted, which is INSIDE the
        // recorded 50 ms band, and this fixture's `toleranceMs` is NOT touched to force a
        // band breach (a manufactured breach would be a second incoherence): the mode is
        // therefore "all stages measured, remainder inside the recorded band", and its
        // `bandExceeded` is the derived outcome `18.5 > 50 === false`.
        const d = api.partitionO0RowPasses(row).row
        row.reconciliation = {
          ...row.reconciliation,
          ok: false,
          openStructural: false,
          windowMs: d.windowMs,
          accountedMs: d.accountedMs,
          unaccountedMs: d.unaccountedMs,
          overlapMs: d.overlapMs,
          outsideMs: d.outsideMs,
          passOverlapSumMs: d.passOverlapSumMs,
          naiveSumResidualMs: d.naiveSumResidualMs,
          bandExceeded: d.unaccountedMs !== null && d.unaccountedMs > row.reconciliation.toleranceMs,
          reason:
            d.unaccountedMs !== null && d.unaccountedMs > row.reconciliation.toleranceMs
              ? `unaccounted ${String(d.unaccountedMs)} ms > the recorded ${String(row.reconciliation.toleranceMs)} ms band`
              : `unaccounted ${String(d.unaccountedMs)} ms inside the recorded ${String(row.reconciliation.toleranceMs)} ms band (the §4.1 identity holds exactly)`,
        }
        row.status = 'FAIL'
      }
      if (mode === 3) {
        row.reconciliation = { ...row.reconciliation, note: 'the remainder is the measured style/layout/paint cost' }
        const bad = api.validateO0MeasurementShape(row)
        if (bad.ok) return 'mode=3: a remainder presented as a style/layout/paint cost validated ok:true (FS8)'
      } else {
        const v = api.validateO0MeasurementShape(row)
        if (!v.ok) return `mode=${mode}: the OPEN-structural branch must stay schema-valid — errors=${JSON.stringify(v.errors)}`
        if (row.postStyle.ms !== null && mode !== 2) return `mode=${mode}: postStyle.ms must stay null while a stage is unseparated (got ${String(row.postStyle.ms)})`
        if (row.postStyle.attributable !== false) return `mode=${mode}: attributable must stay false (got ${String(row.postStyle.attributable)})`
        if (row.postStyle.residual !== null) return `mode=${mode}: the retired residual must stay null (got ${String(row.postStyle.residual)})`
      }
      // P-SM-2 holds on EVERY draw: the visible remainder is labeled derived + attributable:false.
      if (mode !== 3) {
        if (row.reconciliation.unaccountedSource !== 'derived') return `mode=${mode}: the computed remainder must be labeled \`derived\` (got ${String(row.reconciliation.unaccountedSource)})`
        if (row.reconciliation.unaccountedAttributable !== false) return `mode=${mode}: the computed remainder must be \`attributable:false\``
        // §13.2 (8)(a)/(c) — the two validator clauses the adversarial pass found
        // missing. The two legs ALTERNATE by draw so neither is dead code (the row
        // oracle returns the FIRST counterexample, so a fixed order would starve one).
        if (i % 2 === 0) {
          // (c) a DECLARED reconciliation contradicting the DERIVED accounting.
          const drifted = { ...row, hook: { ...row.hook }, reconciliation: { ...row.reconciliation, windowMs: 9999 } }
          const vd = api.validateO0MeasurementShape(drifted)
          if (vd.ok) {
            return `mode=${mode}: a row DECLARING reconciliation.windowMs 9999 while its freeze window is ${String(row.hook.freezeWindow.t1 - row.hook.freezeWindow.t0)} ms validated ok:true — the declared accounting is never checked against the derived one (§4.1/§13.2 (8)(c))`
          }
          if (!/reconciliation\./i.test(JSON.stringify(vd.failReasons))) {
            return `mode=${mode}: the declared-accounting reason does not name the FIELD PATH: ${JSON.stringify(vd.failReasons)}`
          }
        } else {
          // (a) a pass window 300 ms OUTSIDE the freeze window (FS6's pass-window half).
          // The DETACHED pass owns NO record and declares no per-id ms, so the FS12
          // coverage clauses and the aggregation identity stay quiet by construction.
          const basePass = row.hook.passes[0]
          const detached = {
            ...basePass,
            index: row.hook.passes.length,
            kind: 'pre-pass-render',
            opener: null,
            window: { t0: 700, t1: 710, ms: 10 },
            records: { indices: [], count: 0, nestedCount: 0 },
            topLevelSpans: [],
            sumOfSpansMs: 0,
            accountedMs: 0,
            unaccountedMs: 10,
            overlapMs: 0,
            outsideMs: 0,
            longTaskTotalMs: 0,
            stages: basePass.stages.map((s: any) => ({ ...s, ms: null, unseparated: true })),
            pass: true,
            failReasons: [],
          }
          const withDetached = { ...row, hook: { ...row.hook, passes: [...row.hook.passes, detached] } }
          withDetached.hook.passCount = withDetached.hook.passes.length
          const vw = api.validateO0MeasurementShape(withDetached)
          if (vw.ok) {
            return `mode=${mode}: a pass window [700, 710] sitting 300 ms OUTSIDE the freeze window [${String(row.hook.freezeWindow.t0)}, ${String(row.hook.freezeWindow.t1)}] validated ok:true — a pass window is never checked against the freeze window/band (§6 FS6/§13.2 (8)(a))`
          }
          if (!/pass|window|freeze/i.test(JSON.stringify(vw.failReasons))) {
            return `mode=${mode}: the pass-window reason names neither the pass nor the window/band: ${JSON.stringify(vw.failReasons)}`
          }
        }
      }
      return null
    })
    assertHeld(rep)
  })
})

// ===========================================================================
// §5 — P-IM-1: the new per-record / per-pass fields are TOTAL and FINITE
// ===========================================================================
describe(`P-IM-1 — the new shape fields are TOTAL and FINITE (${MODULE_PATH} §3.1/§4.1/§4.2/FS10)`, () => {
  const entry = (over: Record<string, any> = {}): Record<string, any> => ({ index: 0, stage: 'render.dom', ms: 5, startMs: 10, endMs: 15, depth: 0, passIndex: 0, ...over })

  it('IM1-1 §3.1/§4.1 `stageRecordDetail[i]` carries a unique `index`, finite `startMs`/`endMs` with `endMs ≥ startMs`, an integer `depth ≥ 0` and an integer-or-null `passIndex`, and `endMs − startMs` agrees with `ms`', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api.O0_STAGE_IDS)
    const ok = api.validateO0MeasurementShape(row)
    expect(ok.ok, `§3.1: the pinned record fields ('index'/'startMs'/'endMs'/'depth'/'passIndex') must be present and legal — errors=${JSON.stringify(ok.errors)}`).toBe(true)
    const detail = row.hook.stageRecordDetail
    for (const d of detail) {
      expect(Number.isFinite(d.startMs) && Number.isFinite(d.endMs), `§3.1: record ${d.index} must carry finite timestamps`).toBe(true)
      expect(d.endMs >= d.startMs, `§3.1/S10: \`endMs ≥ startMs\` on record ${d.index}`).toBe(true)
      expect(Number.isInteger(d.depth) && d.depth >= 0, `§4.1: record ${d.index} \`depth\` must be an integer ≥ 0`).toBe(true)
      expect(d.passIndex === null || Number.isInteger(d.passIndex), `§4.1: record ${d.index} \`passIndex\` must be an integer or null`).toBe(true)
    }
    const indices = detail.map((d: any) => d.index)
    expect(new Set(indices).size, '§4.1/P-IM-1: every `stageRecordDetail` entry carries a UNIQUE `index`').toBe(indices.length)
  })

  it('IM1-2 §4.2/FS10 a pass missing a required field, or carrying 10/12 stage ids, is pass:false NAMING THE FIELD PATH — never a coerced id or index', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const ids = api.O0_STAGE_IDS
    const good = api.validateO0MeasurementShape(shapeRow(ids))
    expect(good.ok, `IM1-2 baseline: the complete row must validate — errors=${JSON.stringify(good.errors)}`).toBe(true)
    for (const drop of ['kind', 'window', 'stages', 'records', 'accountedMs']) {
      const row = shapeRow(ids)
      row.hook.passes = row.hook.passes.map((p: any, i: number) => (i === 1 ? Object.fromEntries(Object.entries(p).filter(([k]) => k !== drop)) : p))
      const v = api.validateO0MeasurementShape(row)
      expect(v.ok, `FS10 (§4.2): a pass missing \`${drop}\` must be pass:false`).toBe(false)
      expect(JSON.stringify(v.errors) + JSON.stringify(v.failReasons), `FS10: the reason must name the MISSING FIELD PATH (\`${drop}\`), not a coerced value`).toMatch(drop)
    }
    for (const n of [10, 12]) {
      const row = shapeRow(ids)
      // `ids.slice(0, n)` is NOT the 12-id case: the closed set has 11 ids, so a slice
      // of 12 yields the legal 11 (the fixture would assert a failure the row does not
      // commit). The 12-id pass is BUILT: the closed set + a repeated id, i.e. the pass
      // carries 12 entries that do not satisfy "the closed 11-id set, each once" (§4.2).
      const carried = n === 12 ? [...ids.slice(0, 11), 'post.style'] : ids.slice(0, n)
      row.hook.passes = row.hook.passes.map((p: any, i: number) => (i === 1 ? { ...p, stages: carried.map((id) => ({ id, ms: 1, unseparated: false, source: 'mark' })) } : p))
      const v = api.validateO0MeasurementShape(row)
      expect(v.ok, `FS10 (§4.2): a pass carrying ${n} stage ids must be pass:false (the closed 11-id set)`).toBe(false)
      expect(JSON.stringify(v.errors) + JSON.stringify(v.failReasons), `FS10: the reason must name the id COUNT (${n})`).toMatch(new RegExp(`${n}`))
    }
    const noPasses = shapeRow(ids)
    noPasses.hook = Object.fromEntries(Object.entries(noPasses.hook).filter(([k]) => k !== 'passes'))
    const v = api.validateO0MeasurementShape(noPasses)
    expect(v.ok, 'FS10 (§3.1): `hook.passes` absent means the per-pass partition cannot be derived — pass:false).').toBe(false)
    expect(JSON.stringify(v.errors) + JSON.stringify(v.failReasons), 'FS10: the reason names the missing field `hook.passes`').toMatch(/passes/)
  })

  it('FIX-IM1 [P-IM-1] every illegal `{startMs,endMs}`/`depth`/`passIndex` value is named; a legal row returns ok:true with an EMPTY errors[]', async () => {
    const api = await loadO0()
    const rep = runProperty('P-IM-1', 'strat:o0-shape-fields', (_i, rng) => {
      if (typeof api.validateO0MeasurementShape !== 'function') return MISSING('validateO0MeasurementShape(row)')
      const ids = api.O0_STAGE_IDS
      const row = shapeRow(ids)
      const detail = row.hook.stageRecordDetail.map((d: any) => ({ ...d }))
      const target = detail[2]
      const kind = int(rng, 0, 9)
      // 0 NaN startMs | 1 Infinity endMs | 2 negative startMs | 3 endMs < startMs |
      // 4 missing startMs | 5 depth −1 | 6 depth '1' | 7 passIndex 'x' | 8 legal |
      // 9 a LEGACY row (no hook.passes[]) — the NO-IMPUTATION leg (§13.2 (8)(d))
      let legal = false
      if (kind === 0) target.startMs = NaN
      else if (kind === 1) target.endMs = Infinity
      else if (kind === 2) target.startMs = -1
      else if (kind === 3) {
        target.startMs = 20
        target.endMs = 10
      } else if (kind === 4) delete target.startMs
      else if (kind === 5) target.depth = -1
      else if (kind === 6) target.depth = '1'
      else if (kind === 7) target.passIndex = 'x'
      else if (kind === 9) {
        // §13.2 (8)(d)/§6 FS10 — a LEGACY row (no hook.passes[]) fed to the new
        // validator: refused BY CLASS (legacyShape:true), and the ABSENT `passIndex`
        // on its entries is a REPORTED missing value, NEVER an imputed 0.
        for (const f of ['passes', 'passCount', 'passKindSequence']) delete row.hook[f]
        row.hook.stageRecordDetail = detail.map((d: any) => {
          const c: any = { ...d }
          delete c.passIndex
          delete c.depth
          return c
        })
        const vLegacy = api.validateO0MeasurementShape(row)
        if (!vLegacy.legacyShape) return 'kind=9: a row carrying no hook.passes[] must be refused BY CLASS (legacyShape:true — §2.5a RUL-8/§6 S14)'
        const imputed = row.hook.stageRecordDetail.filter((d: any) => d.passIndex !== undefined)
        if (imputed.length > 0) {
          return `kind=9: the validator IMPUTED passIndex ${JSON.stringify(imputed.map((d: any) => d.passIndex))} onto the row's own entries — an absent passIndex on a no-passes row is a REPORTED missing value, never 0 (§13.2 (8)(d)/§6 FS10)`
        }
        const blobLegacy = JSON.stringify(vLegacy.errors) + JSON.stringify(vLegacy.failReasons)
        if (!blobLegacy.includes('passIndex')) return `kind=9: the missing passIndex was not named by FIELD PATH: ${blobLegacy}`
        return null
      } else legal = true
      row.hook.stageRecordDetail = detail
      const v = api.validateO0MeasurementShape(row)
      if (legal) {
        if (!v.ok) return `a legal row must validate ok:true with an empty errors[] — got ${JSON.stringify(v.errors)}`
        if (Array.isArray(v.errors) && v.errors.length !== 0) return `a legal row must carry an EMPTY errors[] — got ${JSON.stringify(v.errors)}`
        return null
      }
      if (v.ok) return `kind=${kind}: an illegal field value validated ok:true (the field must be named and the row refused)`
      const field = ['startMs', 'endMs', 'startMs', 'endMs', 'startMs', 'depth', 'depth', 'passIndex'][kind]
      const blob = JSON.stringify(v.errors) + JSON.stringify(v.failReasons)
      if (!blob.includes(field)) return `kind=${kind}: the reason does not name the FIELD PATH \`${field}\`: ${blob}`
      if (kind === 4 && /\bstartMs["':\s]+0\b/.test(blob)) return `kind=4: a missing startMs was IMPUTED as 0 — §P-IM-1 forbids imputation: ${blob}`
      return null
    })
    assertHeld(rep)
  })
})

// ===========================================================================
// §6 — P-TP-1 / P-TP-2: the union accounting + the partition totality as GENERATED rows
// ===========================================================================
describe(`P-TP-1 / P-TP-2 — the generated rows (§5: the register's M1 core)`, () => {
  it('FIX-TP1 [P-TP-1] `strat:o0-union-accounting`: disjoint spans, a nested pair, a partial overlap, two overlapping passes, an empty pass, a span past the window and the IMPOSSIBLE (sub-union) window', async () => {
    const api = await loadO0()
    const rep = runProperty('P-TP-1', 'strat:o0-union-accounting', (_i, rng) => {
      if (typeof api.partitionO0RowPasses !== 'function') return MISSING('partitionO0RowPasses(row)')
      const mode = int(rng, 0, 6)
      const ids = api.O0_STAGE_IDS
      const row = s1Row(ids)
      const win = { t0: 1000, t1: 1000 + int(rng, 1, 400) }
      const a0 = int(rng, 0, 200)
      const aDur = int(rng, 1, 120)
      const detail: any[] = [{ index: 0, stage: 'snapshot.pull', startMs: win.t0 + a0, endMs: win.t0 + a0 + aDur, ms: aDur }]
      if (mode === 1) {
        // the nested pair (the §1.1 (c) mechanism): a child strictly inside the parent
        detail.push({ index: 1, stage: 'reconcile.apply', startMs: win.t0 + a0, endMs: win.t0 + a0 + aDur + 100, ms: aDur + 100 })
        detail.push({ index: 2, stage: 'render.dom', startMs: win.t0 + a0 + 10, endMs: win.t0 + a0 + aDur, ms: aDur - 10 })
      } else if (mode === 2) {
        // a partially overlapping TOP-LEVEL pair
        detail.push({ index: 1, stage: 'render.ssr', startMs: win.t0 + a0 + Math.floor(aDur / 2), endMs: win.t0 + a0 + aDur + 50, ms: 50 })
      } else if (mode === 3) {
        // two passes whose windows overlap
        detail.push({ index: 1, stage: 'snapshot.pull', startMs: win.t0 + a0 + 5, endMs: win.t0 + a0 + aDur + 60, ms: aDur + 55 })
      } else if (mode === 5) {
        // a span extending past the freeze window (FS6 territory: recorded, not silently dropped)
        detail.push({ index: 1, stage: 'reconcile.apply', startMs: win.t0 + a0, endMs: win.t1 + 30, ms: win.t1 + 30 - (win.t0 + a0) })
      } else if (mode === 6 && detail[0].endMs > win.t1) {
        detail[0].endMs = win.t1 + 5
      }
      row.hook.stageRecordDetail = detail
      row.hook.records = detail.length
      row.hook.freezeWindow = win
      const part = api.partitionO0RowPasses(row)
      const what = `mode=${mode} win=[${win.t0},${win.t1}] detail=${JSON.stringify(detail.map((d) => [d.startMs, d.endMs]))}`
      const expectUnion = unionMs(detail, win)
      if (!part.ok) {
        if (!(Array.isArray(part.failReasons) && part.failReasons.length > 0)) return `${what}: a failing partition carried no failReasons line`
        if (part.row && typeof part.row.unaccountedMs === 'number' && part.row.unaccountedMs < 0) return `${what}: a NEGATIVE remainder reached the field (${part.row.unaccountedMs}) — §2.4`
        return null
      }
      if (part.row.unaccountedMs < 0) return `${what}: negative remainder ${part.row.unaccountedMs}`
      if (part.row.accountedMs !== expectUnion) return `${what}: accountedMs ${part.row.accountedMs} ≠ the union ${expectUnion}`
      // §2.1 — the pinned row remainder is `windowMs − |⋃(ALL top-level spans ∩ the freeze
      // window)|` (the clipped union, the same one `row.accountedMs` reports); §4.1's own
      // arithmetic shows the identity `unaccountedMs === windowMs − accountedMs`.
      if (part.row.unaccountedMs !== Math.round((part.row.windowMs - part.row.accountedMs) * 1000) / 1000) {
        return `${what}: unaccountedMs ${part.row.unaccountedMs} ≠ windowMs ${part.row.windowMs} − accountedMs ${part.row.accountedMs} (the §4.1 identity)`
      }
      if (part.row.unaccountedMs !== Math.round((part.row.windowMs - expectUnion) * 1000) / 1000) {
        return `${what}: unaccountedMs ${part.row.unaccountedMs} ≠ window − union (${part.row.windowMs} − ${expectUnion})`
      }
      for (const p of part.passes) {
        if (p.sumOfSpansMs < p.accountedMs) return `${what}: pass ${p.index} sumOfSpansMs ${p.sumOfSpansMs} < accountedMs ${p.accountedMs} — §4.2`
        if (p.overlapMs !== Math.round((p.sumOfSpansMs - p.accountedMs) * 1000) / 1000) return `${what}: pass ${p.index} overlapMs ≠ sum − accounted`
        if (p.unaccountedMs !== Math.round((p.window.ms - p.accountedMs) * 1000) / 1000) return `${what}: pass ${p.index} unaccountedMs ≠ window.ms − accountedMs`
      }
      // §2.1(iii)/S11 + §13.2 (7) — a band-exceeded remainder is a LEGITIMATE OUTCOME
      // and is REPORTED on its OWN labeled channel (`row.outcomeReasons` /
      // `row.bandExceededNote`), never inside the forcing reason set (a consumer that
      // greps `failReasons` as the forcing channel must not be able to reintroduce the
      // `F5-1` gate the sixth run removed). The pin still requires the outcome to be
      // PRESENT and to name the number and the band — repointed, never weakened.
      if (part.row.bandExceeded === true && !(Array.isArray(part.row.outcomeReasons) && part.row.outcomeReasons.some((m: string) => /band/i.test(m)))) {
        return `${what}: bandExceeded:true with no OUTCOME-channel line naming the number and the band — §2.1(iii)/S11/§13.2 (7)`
      }
      // §4.2/§13.1 (1) — the row verdict is DERIVED: pass ⇔ no reason.
      if (part.row.pass !== (part.row.failReasons.length === 0)) {
        return `${what}: row.pass ${String(part.row.pass)} ≠ (row.failReasons.length === 0) with ${part.row.failReasons.length} reason(s) — the row verdict is ASSERTED, not derived (§4.2/O0-ROW-PASS-ASSERTED-NOT-DERIVED)`
      }
      if (part.row.bandExceeded === true) {
        const outcome = part.row.outcomeReasons[0]
        if (!outcome) return `${what}: bandExceeded:true with an EMPTY outcomeReasons[] — §13.2 (7)`
        if (part.failReasons.includes(outcome)) return `${what}: the row OUTCOME entered partition.failReasons — the F5-1 gate is reintroducible (§13.2 (7))`
        if (part.row.failReasons.includes(outcome)) return `${what}: the row OUTCOME entered row.failReasons (§13.2 (7))`
      }
      return null
    })
    assertHeld(rep)
  })

  it('FIX-TP2 [P-TP-2] `strat:o0-pass-partition`: one opener, two openers, records before the first opener, a depth-2 chain, an unopenable set, an equal-interval pair, a missing timestamp and the empty (unarmed) list', async () => {
    const api = await loadO0()
    const rep = runProperty('P-TP-2', 'strat:o0-pass-partition', (_i, rng) => {
      if (typeof api.partitionO0RowPasses !== 'function') return MISSING('partitionO0RowPasses(row)')
      const mode = int(rng, 0, 7)
      const ids = api.O0_STAGE_IDS
      const row = s1Row(ids)
      const detail: any[] = [
        { index: 0, stage: 'render.dom', startMs: 500, endMs: 505, ms: 5 },
        { index: 1, stage: 'snapshot.pull', startMs: 600, endMs: 610, ms: 10 },
      ]
      if (mode === 1) detail.push({ index: 2, stage: 'snapshot.pull', startMs: 700, endMs: 710, ms: 10 })
      else if (mode === 2) detail.push({ index: 2, stage: 'reconcile.apply', startMs: 620, endMs: 640, ms: 20 })
      else if (mode === 3) {
        // a depth-2 chain: 620–660 ⊃ 625–655 ⊃ 630–650
        detail.push({ index: 2, stage: 'reconcile.apply', startMs: 620, endMs: 660, ms: 40 })
        detail.push({ index: 3, stage: 'render.dom', startMs: 625, endMs: 655, ms: 30 })
        detail.push({ index: 4, stage: 'render.ssr', startMs: 630, endMs: 650, ms: 20 })
      } else if (mode === 4) detail.splice(1, 1) // an unopenable set: no snapshot.pull at all
      else if (mode === 5) detail.push({ index: 2, stage: 'render.ssr', startMs: 500, endMs: 505, ms: 5 }) // equal interval
      else if (mode === 6) detail.push({ index: 2, stage: 'traversal.build', startMs: 620, ms: 20 } as any) // missing endMs
      else if (mode === 7) {
        row.hook.stageRecordDetail = []
        row.hook.records = 0
        row.hook.armed = false
      }
      if (mode !== 7) {
        row.hook.stageRecordDetail = detail
        row.hook.records = detail.length
      }
      // §4.2 FIXTURE CONSISTENCY (two clauses the fixture itself must honour):
      //  (a) the row's `stages[id].ms` is the per-id SUM over its own records (the
      //      aggregation identity `row.stages[id].ms === Σ over passes pass.stages[id].ms`
      //      is checked below and can only be evaluated on a row that satisfies it);
      //  (b) the freeze window CONTAINS the row's spans: `s1Row`'s window (1000-1300)
      //      would make the drawn 500-660 spans an FS6 window-bound violation, i.e. the
      //      fixture would fail its own "legal partition" leg for the wrong reason.
      const msOf = (sid: string) =>
        Math.round(detail.filter((d) => typeof d === 'object' && d && d.stage === sid).reduce((a: number, d: any) => a + (Number.isFinite(d.ms) ? d.ms : 0), 0) * 1000) / 1000
      row.stages = stageRows(ids, msOf)
      row.hook.freezeWindow = { t0: 500, t1: 1300 }
      const part = api.partitionO0RowPasses(row)
      const what = `mode=${mode} detail=${JSON.stringify(detail.map((d) => [d.index, d.startMs, d.endMs]))}`
      // §13.1 (1)/§4.2 — the row verdict is DERIVED on EVERY draw of this row (all 8
      // modes, the UNOPENABLE set and the legal empty list included).
      if (part.row.pass !== (part.row.failReasons.length === 0)) {
        return `${what}: row.pass ${String(part.row.pass)} ≠ (row.failReasons.length === 0) with failReasons=${JSON.stringify(part.row.failReasons.slice(0, 2))} — the row verdict is ASSERTED, not derived (§4.2/O0-ROW-PASS-ASSERTED-NOT-DERIVED)`
      }
      if (mode === 7) {
        if (!part.ok) return `${what}: the empty (unarmed) list is the LEGAL empty case — got errors=${JSON.stringify(part.errors)}`
        if (part.passCount !== 0 || part.passes.length !== 0) return `${what}: an empty list must yield passes:[] + passCount 0`
        if (part.failReasons.length !== 0) return `${what}: no pass reason may be fabricated for an empty list`
        return null
      }
      if (mode === 4) {
        // No opener: ONE pre-pass-render pass, a NAMED reason, and NEVER a dropped record.
        if (part.passCount !== 1) return `${what}: a set with no opener must form ONE pre-pass-render pass (got ${part.passCount})`
        if (part.passes[0].kind !== 'pre-pass-render') return `${what}: kind must be 'pre-pass-render' (opener null)`
        const covered = part.passes.flatMap((p: any) => p.records.indices)
        if (covered.length !== detail.length) return `${what}: a record was DROPPED (covered ${covered.length} of ${detail.length}) — §3.2 clause 4`
        return null
      }
      if (mode === 5 || mode === 6) {
        if (part.ok) return `${what}: an equal-interval pair / a missing timestamp must be pass:false`
        const blob = JSON.stringify(part.failReasons) + JSON.stringify(part.errors)
        if (mode === 5 && !/undecidable|ambigu/i.test(blob)) return `${what}: FS3 reason missing: ${blob}`
        if (mode === 6 && !/endMs|startMs/.test(blob)) return `${what}: FS10 must name the missing timestamp: ${blob}`
        if (mode === 6 && !blob.includes('2')) return `${what}: FS10 must name the record index: ${blob}`
        const neg = JSON.stringify(part).match(/"unaccountedMs":-\d/)
        if (neg) return `${what}: a negative remainder appeared: ${neg[0]}`
        return null
      }
      if (!part.ok) return `${what}: the legal partition must validate (errors=${JSON.stringify(part.errors)})`
      const all = part.passes.flatMap((p: any) => p.records.indices)
      const expect = Array.from({ length: detail.length }, (_, i) => i)
      if (JSON.stringify([...all].sort((a: number, b: number) => a - b)) !== JSON.stringify(expect)) {
        return `${what}: the passes' index sets must cover 0..${detail.length - 1} exactly once (got ${JSON.stringify(all)})`
      }
      if (part.passCount !== part.passes.length) return `${what}: passCount ≠ passes.length`
      if (part.passes[0].kind !== 'pre-pass-render' || part.passes[0].opener !== null) return `${what}: pass 0 must be the pre-pass-render sequence (opener null)`
      // §4.2: kinds ⇔ openers
      for (const p of part.passes) {
        if (p.kind === 'pre-pass-render' && p.opener !== null) return `${what}: pass ${p.index} kind/opener disagree`
        if (p.kind === 're-derive' && p.opener?.stage !== 'snapshot.pull') return `${what}: pass ${p.index} re-derive opener must be a snapshot.pull`
      }
      if (mode === 3) {
        const d = row.hook.stageRecordDetail
        const byIdx = new Map(d.map((x: any) => [x.index, x]))
        if (!(byIdx.get(3).depth >= 1 && byIdx.get(4).depth >= 2)) return `${what}: a depth-2 chain must report depths 1 and 2 (got ${byIdx.get(3).depth}/${byIdx.get(4).depth})`
        if (byIdx.get(4).passIndex !== byIdx.get(3).passIndex) return `${what}: a nested record must belong to its container's pass`
      }
      // the per-id aggregation identity (§4.2) for the ten record-producible ids
      const rowMs = new Map(row.stages.map((s: any) => [s.id, s.ms]))
      for (const id of api.O0_STAGE_IDS) {
        if (id === 'post.style') continue
        const sum = Math.round(part.passes.reduce((a: number, p: any) => a + (p.stages.find((s: any) => s.id === id)?.ms ?? 0), 0) * 1000) / 1000
        if (typeof rowMs.get(id) === 'number' && sum !== Math.round((rowMs.get(id) as number) * 1000) / 1000) {
          return `${what}: the aggregation identity fails for ${id}: row ${String(rowMs.get(id))} ≠ Σ passes ${sum}`
        }
      }
      return null
    })
    assertHeld(rep)
  })
})

// ===========================================================================
// §7 — the accounting of the register budget itself (§5: 6 rows × 60 = 360)
// ===========================================================================
describe('O0-M1-M3 §5 — the register budget is stated, not implied', () => {
  it('BUDGET §5 the six rows land 6 × 60 = 360 attempts (≤100/row, ≤400 total, stop-after-5)', () => {
    const ROWS = ['P-TP-1', 'P-TP-2', 'P-TP-3', 'P-SM-1', 'P-SM-2', 'P-IM-1']
    expect(ROWS.length, '§5/census §8.1: the register is 6 rows').toBe(6)
    expect(PBT_ATTEMPTS, '§5: 60 attempts per row').toBe(60)
    expect(ROWS.length * PBT_ATTEMPTS, '§5: 6 × 60 = 360 landed of the 800 ceiling').toBe(360)
    expect(PBT_ATTEMPTS <= 100).toBe(true)
    expect(ROWS.length * PBT_ATTEMPTS <= PBT_TOTAL_CEILING, '§5: the total stays under the 400 budget').toBe(true)
    expect(PBT_STOP_AFTER, '§5: stop-after-5 in every row').toBe(5)
  })
})
