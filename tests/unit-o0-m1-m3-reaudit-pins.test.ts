// tests/unit-o0-m1-m3-reaudit-pins.test.ts — the TestWriter RED set for the
// **§3b RE-AUDIT** findings over `O0-M1-M3-MEASUREMENT-SHAPE` (the fourth RCA-3
// adversarial pass, run over the LANDED oracle after the §13 fix cycle).
//
// The ONLY design sources: the unit spec `docs/specs/unit-o0-m1-m3-measurement-shape.md`
//   §2.1 (the pinned remainder `unaccountedMs = window.ms − |⋃(spans ∩ window)|`, and
//         the "null + a named reason" branch (iii)),
//   §3.2/§3.4 (§4.2's field rules: `records.indices` strictly increasing, disjoint
//         across passes, union `0..records-1`; `unaccountedMs` null ONLY with a reason),
//   §4.1 (`stages[]` = "the 11-id set, each once, per-id SUMS over records"),
//   §4.2 (the per-pass arithmetic + the aggregation identity + the totality rules),
//   §6    (`FS1`/`FS2`/`FS10`/`FS11`, and "a row whose `pass` is `true` while any `FS-n`
//         observable of this unit holds is a review finding").
//
// WHY THIS FILE AND NOT A WIDENED ASSERTION INSIDE AN EXISTING SUITE: no landed pin may
// be weakened or deleted (the red set of the three M1-M3 files + the two O-0 suites stay
// VERBATIM). This file adds the counterexamples the §3b pass found; the four affected
// §5 register rows are EXTENDED IN PLACE at the bottom of this file (§5 layer).
//
// The four MUST-FIX counterexamples, each a ONE-LINE BYPASS of the certifying oracle:
//   (1) the dropped `sessionCountsAt` reason  (`o0-report.ts:~2548` pushes to `failReasons`
//       WITHOUT `errors`, so `ok = errors.length === 0` stays `true`; the driver copies
//       `shape.failReasons` only when `!shape.ok` (`scripts/live-drive.mjs:~920-921`) ⇒
//       the reason is DROPPED from the report)                                  → RA-1
//   (2) the row's own `stages[]` is NEVER validated (`~:2716-2732` reads it only inside the
//       identity and `continue`s on a non-finite `ms`)                         → RA-2a..2d
//   (3) the per-pass layer is TRUSTED (no clause compares `hook.passes[].{window,
//       accountedMs,unaccountedMs,sumOfSpansMs,records.indices}` with
//       `partitionO0RowPasses(row).passes[i]`; `records.indices` totality is only
//       COUNT-checked at `~:2640-2644`)                                        → RA-3a..3c
//   (4) the `null` remainder escape (both strict clauses are gated on `isNonNeg`, and NO
//       row-level clause requires an `unaccountedReason`)                       → RA-4a/4b
//   plus the reviewer's four MISSING reds: an overstated declared remainder (RA-5), a
//   declared `windowMs` NARROWER than the derived one (RA-6) and the `legacyShape` reading
//   per row class (RA-7).
//
// LAYER (RCA-12): every assertion is a MEASUREMENT-SHAPE assertion over the PURE oracle —
// a green here is SCHEMA-green, never app-green.
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (one valid/happy-path state + one fail-state per pin)
//   ST0  the CONTROL row: legal by construction (partition-derived passes, per-id sums,
//        declared reconciliation, attribution, counts) — nothing else may fail on it   → RA-0
//   ST1  ST0 with `hook.sessionCountsAt` DELETED (1/1 armed, session 2/2)               → RA-1
//   ST2  `row.stages[render.dom].ms = null` with `unseparated:false` (11 ids, no reason) → RA-2a
//   ST3  `row.stages = []`                                                              → RA-2b
//   ST4  twelve `row.stages[]` entries (the closed 11 + a duplicated `render.dom`)       → RA-2c
//   ST5  a NEGATIVE `row.stages[render.dom].ms` (−5)                                    → RA-2d
//   ST6  pass 1 declaring `accountedMs = window.ms` / `unaccountedMs: 0` /
//        `sumOfSpansMs = window.ms` while its own records derive 200/450 ms              → RA-3a
//   ST7  pass 1's `records.indices = [2,2]` (duplicate; `count` kept consistent)        → RA-3b
//   ST8  pass 1's `records.indices = [2,99]` (index 3 dropped, a foreign index added)   → RA-3c
//   ST9  `reconciliation.unaccountedMs: null` with NO `unaccountedReason`               → RA-4a
//   ST10 the same, WITH a named structural reason (LEGAL per §2.1(iii)/S12)              → RA-4b
//   ST11 a declared remainder that OVERSTATES the derived one (+50 ms)                  → RA-5
//   ST12 a declared `windowMs` NARROWER than the derived one (−20 ms)                   → RA-6
//   ST13 three row CLASSES for `legacyShape`: NEW-shape (passes present); the no-passes
//        row carrying per-record timestamps (the ADV-8d class); a truly LEGACY
//        fourth-edition hook (bare aliases, no passes, no timestamps)                    → RA-7
//
// FAIL-STATES PINNED (§6 classes): FS10 (a missing value NAMED by field path — never
// imputed), FS11 (a measure may not be negative), FS2 (the partition/aggregation identity),
// FS1 (§2.1's remainder: null ONLY with a named reason), §4.2 (the pass arithmetic is
// DERIVED, never trusted).
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'

const MODULE_SPECIFIER = '../src/shared/o0-report.js'
const MODULE_PATH = 'src/shared/o0-report.ts'
type O0Api = Record<string, any>

async function loadO0(): Promise<O0Api> {
  try {
    // @ts-expect-error RED — the pure module is transpiled without typecheck from the test surface.
    return (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as O0Api
  } catch (e) {
    throw new Error(
      `RED — the pinned pure O-0 report module '${MODULE_PATH}' does not exist/imports uncleanly. Import error: ${String(e)}`,
    )
  }
}
const MISSING = (name: string): string =>
  `§2.5 pins the export \`${name}\` on ${MODULE_PATH} — the module does not export it`

const r3 = (v: number): number => Math.round(v * 1000) / 1000
const reasons = (r: any): string => JSON.stringify([...(r?.errors ?? []), ...(r?.failReasons ?? []), ...(r?.notes ?? [])])

// ===========================================================================
// §0 — the fixture. Built from the SPEC's arithmetic, never from the code's: a
// freeze window with a deliberate 250 ms GAP inside one pass (so the pass's own
// remainder is non-zero and the declared-vs-derived clause has something to see),
// and a second pass (the pre-pass render pair) so the partition is non-trivial.
// ===========================================================================
const WIN = { t0: 2000, t1: 2600 }
const RECORDS = [
  { index: 0, stage: 'render.dom', startMs: 2000, endMs: 2010, ms: 10 },
  { index: 1, stage: 'render.ssr', startMs: 2010, endMs: 2020, ms: 10 },
  { index: 2, stage: 'snapshot.pull', startMs: 2050, endMs: 2150, ms: 100 },
  { index: 3, stage: 'reconcile.apply', startMs: 2400, endMs: 2500, ms: 100 },
] as const
const LONG_TASKS = [{ start: 2100, duration: 100 }] as const
const BAND_HOOK = 40
const BAND_RECON = 50

/** ST0 — a row legal by construction: every derived field comes from the partition
 *  itself, so any red below is the MUTATION's, never fixture incoherence. `postStyle`
 *  is deliberately ABSENT (the validator treats "neither branch declared" as legal, and
 *  a present `postStyle` beside a `null` remainder is caught by its own clause —
 *  see RA-4's note). */
function shapeRow(api: O0Api, over: Record<string, any> = {}): Record<string, any> {
  const ids: string[] = api.O0_STAGE_IDS
  const row: Record<string, any> = {
    id: 'o0-reaudit-fixture-row',
    block: 'o0_folder_row',
    stageCount: ids.length,
    longTasks: [...LONG_TASKS],
    longTaskTotalMs: LONG_TASKS.reduce((a: number, t: any) => a + t.duration, 0),
    pass: true,
    failReasons: [],
    hook: {
      armed: true,
      records: RECORDS.length,
      freezeWindow: { ...WIN },
      armWindow: { t0: 1999, t1: 2600, ms: 601 },
      toleranceMs: BAND_HOOK,
      rowArmCount: 1,
      rowDisarmCount: 1,
      sessionArmCount: 2,
      sessionDisarmCount: 2,
      sessionCountsAt: { pre: { arm: 1, disarm: 1, at: 1999 }, post: { arm: 2, disarm: 2, at: 2600.5 } },
      stageRecordDetail: RECORDS.map((r) => ({ ...r })),
      ...(over.hook ?? {}),
    },
  }
  const part = api.partitionO0RowPasses(row)
  row.hook.passes = part.passes
  row.hook.passCount = part.passes.length
  row.hook.passKindSequence = part.passes.map((p: any) => p.kind)
  const sumFor = (sid: string): number =>
    r3(part.passes.reduce((a: number, p: any) => a + (p.stages.find((s: any) => s.id === sid)?.ms ?? 0), 0))
  row.stages = ids.map((id) => {
    const sum = sumFor(id)
    return {
      id,
      ms: sum === 0 ? null : sum,
      unseparated: sum === 0,
      source: id === 'post.style' ? 'derived' : 'hook',
      structural: false,
      structuralReason: null,
    }
  })
  row.hook.longTaskAttribution = api.deriveO0LongTaskAttribution(WIN, [...LONG_TASKS])
  row.reconciliation = {
    ok: false,
    openStructural: false,
    toleranceMs: BAND_RECON,
    naiveSumResidualNote: 'notAResidual',
    naiveSumResidualMs: part.row.naiveSumResidualMs,
    unaccountedSource: 'derived',
    unaccountedAttributable: false,
    passes: [],
    residual: null,
    retired: true,
    reason: null,
    note: 'the derived remainder is an accounting quantity, attributable:false, and is never a stage cost (§3.6b RUL-4 clause 5)',
    windowMs: part.row.windowMs,
    accountedMs: part.row.accountedMs,
    unaccountedMs: part.row.unaccountedMs,
    unaccountedReason: part.row.unaccountedReason,
    overlapMs: part.row.overlapMs,
    outsideMs: part.row.outsideMs,
    passOverlapSumMs: part.row.passOverlapSumMs,
    bandExceeded: part.row.bandExceeded,
  }
  for (const [k, v] of Object.entries(over)) if (k !== 'hook') row[k] = v
  return row
}
const passAt = (row: any, i: number): any => row.hook.passes[i]

// ===========================================================================
// §1 — RA-0: the CONTROL. If this fails, the fixture is incoherent and every red
// below is suspect (it is the falsifiable precondition of this file).
// ===========================================================================
describe('RA-0 — the CONTROL row is legal by construction (§2/§3/§4.2)', () => {
  it('RA-0 the unmutated fixture validates ok:true with an empty reason set, and its per-pass remainder is non-zero', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    const v = api.validateO0MeasurementShape(row)
    expect(v.ok, `CONTROL: the fixture must be legal — it returned ${reasons(v)}`).toBe(true)
    const part = api.partitionO0RowPasses(row)
    expect(part.passes.length, 'CONTROL: the fixture must partition into TWO passes (a pre-pass render pair + a re-derive pass)').toBe(2)
    expect(
      part.passes[1].unaccountedMs,
      'CONTROL: pass 1 must derive a NON-ZERO remainder (the 250 ms gap between its two top-level spans) so the declared-vs-derived clause has a counterexample to catch',
    ).toBe(250)
  })
})

// ===========================================================================
// §2 — RA-1: the dropped `sessionCountsAt` reason (finding 1)
// ===========================================================================
describe('RA-1 — a missing `sessionCountsAt` must FORCE `ok:false` (finding 1 / §2.2 / §6 FS10)', () => {
  it('RA-1 [ST1] a 1/1 armed row with session 2/2 and `sessionCountsAt` DELETED must NOT read ok:true', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    delete row.hook.sessionCountsAt // ST1 — the one-line bypass
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.failReasons?.length,
      'PRECONDITION (§2.2/FS10): the deleted reading must be NAMED — the reason is minted, so the pin is about the FORCING channel, not about silence',
    ).toBeGreaterThan(0)
    expect(
      v.ok,
      `§2.2/§6 FS10 [finding 1 — the dropped reason]: the row reads ok:${String(v.ok)} with ${String(
        v.failReasons?.length,
      )} failReasons[] while its own records carry NO hook.sessionCountsAt. The reason is minted into \`failReasons\` WITHOUT \`errors\`, so \`ok = errors.length === 0\` stays true — and the driver copies \`shape.failReasons\` ONLY when \`!shape.ok\` (scripts/live-drive.mjs:~920-921), so the reason is DROPPED from the report. A missing reading is an FS10 observable, so \`ok\` may not read true.`,
    ).toBe(false)
    expect(reasons(v), '§2.2/§6 FS10: the reason must name the field path `hook.sessionCountsAt` (the result\'s OWN reason channel)').toMatch(
      /sessionCountsAt/,
    )
  })
})

// ===========================================================================
// §3 — RA-2: the row's own `stages[]` is never validated (finding 2)
// ===========================================================================
describe('RA-2 — `row.stages[]` must carry the closed 11-id set, each once, finite, non-negative (finding 2 / §4.1/§4.2/§6 FS10/FS11)', () => {
  it('RA-2a [ST2] eleven ids with one `ms` NULLED and `unseparated:false` must FAIL, naming the field path', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    row.stages = row.stages.map((s: any) => (s.id === 'render.dom' ? { ...s, ms: null, unseparated: false } : s))
    expect(row.stages.length, 'PRECONDITION: the closed 11-id set is still carried (so the failure is the nulled ms, not a size error)').toBe(11)
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.1/§4.2/§6 FS10 [finding 2 — the row's stages[] is never validated]: row.stages[render.dom] reads ms:null with unseparated:false (the contract is \`ms:null ⇔ unseparated\`), yet the shape reads ok:${String(
        v.ok,
      )}. The validator reads row.stages[] ONLY inside the per-id aggregation identity and \`continue\`s on a non-finite ms (~:2716-2732), so a nulled ms skips EVERY identity comparison.`,
    ).toBe(false)
    expect(reasons(v), '§4.1/§4.2/§6 FS10: the reason must name the field path (`row.stages` and the id)').toMatch(/row\.stages/)
  })

  it('RA-2b [ST3] `row.stages = []` must FAIL (the closed 11-id set is required on the row)', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    row.stages = []
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.1/§4.2/§6 FS10 [finding 2]: the row carries \`stages: []\` — the §4.1 field is "the 11-id set, each once, per-id SUMS over records" — yet the shape reads ok:${String(
        v.ok,
      )}. An empty stages[] satisfies every identity comparison vacuously (each find() returns undefined, so the identity continues to the next id).`,
    ).toBe(false)
    expect(reasons(v), '§4.2/§6 FS10: the reason must name `row.stages` and the id COUNT (expected 11, carried 0)').toMatch(/row\.stages/)
  })

  it('RA-2c [ST4] twelve `row.stages[]` entries (the closed 11 + a duplicate) must FAIL, naming the count and the duplicate', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    row.stages = [...row.stages, { ...row.stages.find((x) => x.id === 'render.dom') }]
    expect(row.stages.length, 'PRECONDITION: twelve entries are carried').toBe(12)
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.2/P-IM-2/§6 FS10 [finding 2]: the row's stages[] carries 12 ids (the closed 11 + a duplicated \`render.dom\`) while \`row.stageCount\` is 11, yet the shape reads ok:${String(
        v.ok,
      )}. The closed-set clause is applied to a PASS's stages[] only; the ROW's is never count-checked.`,
    ).toBe(false)
    const blob = reasons(v)
    expect(blob, '§4.2: the reason must name the carried count (12) / the closed set size (11)').toMatch(/12/)
    expect(blob, '§4.2: the reason must name the DUPLICATED id (`render.dom`)').toMatch(/render\.dom/)
  })

  it('RA-2d [ST5] a NEGATIVE `row.stages[].ms` must FAIL (a measure is non-negative by construction)', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    row.stages = row.stages.map((s: any) => (s.id === 'render.dom' ? { ...s, ms: -5 } : s))
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§2.4/§6 FS11 [finding 2]: row.stages[render.dom].ms is −5 — a stage ms is a MEASURE and is non-negative by construction — yet the shape reads ok:${String(
        v.ok,
      )}. \`isNonNeg(rs.ms)\` is false, so the identity comparison is SKIPPED rather than reported.`,
    ).toBe(false)
    expect(reasons(v), '§6 FS11: the reason must name the field path (`row.stages` + the id) and the value').toMatch(/row\.stages/)
  })
})

// ===========================================================================
// §4 — RA-3: the per-pass layer is TRUSTED (finding 3)
// ===========================================================================
describe('RA-3 — the declared pass layer must be re-derived, never trusted (finding 3 / §2.1/§4.2)', () => {
  it('RA-3a [ST6] a pass declaring `accountedMs = window.ms` / `unaccountedMs: 0` while its records derive a 250 ms remainder must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    const derived = api.partitionO0RowPasses(row).passes[1]
    expect(derived.unaccountedMs, 'PRECONDITION (§2.1): the records of pass 1 derive a 250 ms remainder').toBe(250)
    const w = passAt(row, 1).window.ms
    // ST6 — the one-line bypass: the DECLARED pass arithmetic is internally coherent
    // (`accountedMs = window.ms`, `unaccountedMs = 0`, `sumOfSpansMs = accountedMs`,
    // `overlapMs = sumOfSpansMs − accountedMs = 0`) but contradicts the pass's OWN records.
    passAt(row, 1).accountedMs = w
    passAt(row, 1).unaccountedMs = 0
    passAt(row, 1).sumOfSpansMs = w
    passAt(row, 1).overlapMs = 0
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§2.1/§4.2 [finding 3 — the per-pass layer is TRUSTED]: pass 1 DECLARES accountedMs ${String(
        w,
      )} (= window.ms) / unaccountedMs 0 while its own records derive accountedMs ${String(
        derived.accountedMs,
      )} / unaccountedMs ${String(
        derived.unaccountedMs,
      )} — yet the shape reads ok:${String(v.ok)}. No clause compares hook.passes[].{window,accountedMs,unaccountedMs,sumOfSpansMs} with partitionO0RowPasses(row).passes[i], so a pass may publish any internally coherent arithmetic.`,
    ).toBe(false)
    const blob = reasons(v)
    expect(blob, '§4.2: the reason must name the pass sub-row (`hook.passes[1]` or `pass 1`)').toMatch(/hook\.passes\[1\]|pass 1/)
    expect(blob, '§4.2: the reason must name the declared/derived remainder fields').toMatch(/accountedMs|unaccountedMs/)
  })

  it('RA-3b [ST7] a pass whose `records.indices` DUPLICATE an index (count kept consistent) must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    // ST7 — `[2,2]`: `count` 2 === indices.length 2, so the ONLY landed check (the count
    // check at ~:2640-2644) is satisfied while the set is neither strictly increasing
    // nor a disjoint union of 0..n−1 (index 3 is dropped).
    passAt(row, 1).records = { indices: [2, 2], count: 2, nestedCount: 0 }
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.2 [finding 3]: pass 1's records.indices read [2,2] — §4.2 pins "a strictly increasing run of commit indices, disjoint across passes, whose union must be 0..records-1" — yet the shape reads ok:${String(
        v.ok,
      )}. \`records.indices\` totality is only COUNT-checked (~:2640-2644).`,
    ).toBe(false)
    expect(reasons(v), '§4.2: the reason must name the field path `records.indices`').toMatch(/records\.indices/)
  })

  it('RA-3c [ST8] a pass whose `records.indices` are NOT the union `0..n−1` (one dropped, one foreign) must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    // ST8 — `[2,99]`: strictly increasing, but index 3 is dropped and 99 does not exist,
    // while `hook.records` (4) and the count check are both satisfied.
    passAt(row, 1).records = { indices: [2, 99], count: 2, nestedCount: 0 }
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.2 [finding 3]: the passes' index sets union to {0,1,2,99} while the row carries 4 records (0..3) — §4.2 pins the union as 0..records-1 with the passes DISJOINT — yet the shape reads ok:${String(
        v.ok,
      )}.`,
    ).toBe(false)
    expect(reasons(v), '§4.2: the reason must name `records.indices` and the missing/foreign index').toMatch(/records\.indices/)
  })
})

// ===========================================================================
// §5 — RA-4: the `null` remainder escape (finding 4)
// ===========================================================================
describe('RA-4 — a `null` row remainder is legal ONLY with a named reason (finding 4 / §2.1(iii)/§6 FS1)', () => {
  it('RA-4a [ST9] `reconciliation.unaccountedMs: null` WITHOUT a row-level `unaccountedReason` must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    // ST9 — the one-line bypass. Both strict declared-vs-derived clauses are gated on
    // `isNonNeg`, so a `null` remainder skips them; and no row-level clause requires the
    // reason the pass-level clause requires (`hook.passes[i].unaccountedReason`).
    row.reconciliation = { ...row.reconciliation, unaccountedMs: null }
    delete row.reconciliation.unaccountedReason
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§2.1(iii)/§6 FS1 [finding 4 — the null remainder escape]: reconciliation.unaccountedMs is null with NO named reason while the row's own records derive ${String(
        api.partitionO0RowPasses(row).row.unaccountedMs,
      )} ms unaccounted — yet the shape reads ok:${String(
        v.ok,
      )}. §2.1(iii) permits the null form ONLY "for a named structural reason", and the pass-level clause already enforces exactly that; the row-level channel has no such clause.`,
    ).toBe(false)
    expect(reasons(v), '§2.1(iii)/§6 FS1/FS10: the reason must name the missing field path (`reconciliation.unaccountedReason`)').toMatch(
      /unaccountedReason/,
    )
  })

  it('RA-4b [ST10] the SAME null remainder WITH a named structural reason is LEGAL (§2.1(iii)/S12) — the null form is not forbidden, only unreasoned', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    row.reconciliation = {
      ...row.reconciliation,
      unaccountedMs: null,
      unaccountedReason:
        'the record set carries no finite top-level span inside the freeze window — the union accounting has no computable remainder (§2.1(iii)/S12)',
    }
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§2.1(iii)/S12: a \`null\` remainder WITH a named structural reason is the pinned legal branch (outcome (iii): "the remainder is not computable for a named structural reason → null + the reason") — the fix for RA-4a must require the REASON, never forbid the null form. Got ${reasons(
        v,
      )}`,
    ).toBe(true)
    expect(typeof row.reconciliation.unaccountedReason, 'PRECONDITION: the named reason is present').toBe('string')
  })
})

// ===========================================================================
// §6 — RA-5/RA-6: the reviewer's two missing declared-vs-derived reds
// ===========================================================================
describe('RA-5/RA-6 — the declared accounting must EQUAL the derived accounting (both directions)', () => {
  it('RA-5 [ST11] a declared remainder that OVERSTATES the derived one must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    const derived = api.partitionO0RowPasses(row).row
    expect(derived.unaccountedMs, 'PRECONDITION: the fixture derives a numeric remainder').toBe(380)
    row.reconciliation = { ...row.reconciliation, unaccountedMs: (derived.unaccountedMs as number) + 50 }
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.1/§13.2 (8)(c): the row DECLARES reconciliation.unaccountedMs ${String(
        row.reconciliation.unaccountedMs,
      )} while its own records derive ${String(derived.unaccountedMs)} — an OVERSTATEMENT is a second reading of the same quantity (time the records account for) and must be a forcing reason in BOTH directions.`,
    ).toBe(false)
    expect(reasons(v), '§4.1: the reason must name `reconciliation.unaccountedMs` and both numbers').toMatch(/unaccountedMs/)
  })

  it('RA-6 [ST12] a declared `windowMs` NARROWER than the derived one must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    const derived = api.partitionO0RowPasses(row).row
    expect(derived.windowMs, 'PRECONDITION: the fixture derives a 600 ms window').toBe(600)
    row.reconciliation = { ...row.reconciliation, windowMs: derived.windowMs - 20 }
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§4.1/§13.2 (8)(c): the row DECLARES reconciliation.windowMs ${String(
        row.reconciliation.windowMs,
      )} while its freeze window/record set derives ${String(
        derived.windowMs,
      )} — a declared denominator NARROWER than the derived one rescales every ratio taken against it and must be a forcing reason.`,
    ).toBe(false)
    expect(reasons(v), '§4.1: the reason must name `reconciliation.windowMs` and both numbers').toMatch(/windowMs/)
  })
})

// ===========================================================================
// §7 — RA-7: the `legacyShape` field must read the SAME for the same record set
// across BOTH surfaces (one reading per row class)
// ===========================================================================
describe('RA-7 — `legacyShape` is ONE reading per row class, on BOTH surfaces (§2.5a RUL-8/§6 S14)', () => {
  it('RA-7a [ST13-NEW] a NEW-shape row (hook.passes[] present, no retired aliases) reads legacyShape:false on BOTH surfaces', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    const p = api.partitionO0RowPasses(row)
    const v = api.validateO0MeasurementShape(row)
    expect(p.legacyShape, '§2.5a RUL-8: a row carrying hook.passes[] is a NEW-shape row').toBe(false)
    expect(v.legacyShape, '§2.5a RUL-8: the same row is NEW-shaped at the validator').toBe(false)
  })

  it('RA-7b [ST13-LEGACY] a truly legacy fourth-edition hook (bare aliases, no passes, no timestamps) reads legacyShape:true on BOTH surfaces', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    row.hook = { armed: true, records: 0, armCount: 1, disarmCount: 1, toleranceMs: BAND_HOOK }
    const p = api.partitionO0RowPasses(row)
    const v = api.validateO0MeasurementShape(row)
    expect(p.legacyShape, '§2.5a/§6 S14: the fourth-edition class is refused BY CLASS at the partition').toBe(true)
    expect(v.legacyShape, '§2.5a/§6 S14: and at the validator').toBe(true)
  })

  it('RA-7c [ST13-NO-PASSES] a row with per-record timestamps but NO `hook.passes[]` must read the SAME `legacyShape` on both surfaces (the reviewer\'s `false` vs `true`)', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = shapeRow(api)
    for (const f of ['passes', 'passCount', 'passKindSequence']) delete row.hook[f]
    const p = api.partitionO0RowPasses(row)
    const v = api.validateO0MeasurementShape(row)
    expect(
      p.legacyShape === v.legacyShape,
      `§2.5a [finding — the legacyShape DIVERGENCE]: the SAME record set reads legacyShape ${String(
        p.legacyShape,
      )} at partitionO0RowPasses and ${String(
        v.legacyShape,
      )} at validateO0MeasurementShape. §2.5a pins ONE reading per row class: "a row without hook.passes[] IS a legacy row for shape purposes" (iii), and the landed ADV-8d pin fixes this class's reading at \`true\` — so the partition's conjunctive derivation (no passes AND no per-record timestamps) is the drifted one.`,
    ).toBe(true)
    expect(
      p.legacyShape,
      '§2.5a (iii)/§6 S14/ADV-8d: a row with no `hook.passes[]` is LEGACY for shape purposes — the class reading is `true`, and the validator already returns it',
    ).toBe(true)
  })
})

// ===========================================================================
// §8 — the §5 REGISTER LAYER (EXTENDED IN PLACE for the four affected rows).
// Each sweep is a per-row property over a SEEDED generator of the counterexample
// class; the register convention is unchanged (≤100 attempts/row, stop-after-5,
// budget stated). 4 rows × 8 attempts = 32 additional attempts.
// ===========================================================================
const PBT_SEED = 0x3b3b3b3b // the §3b re-audit's own pinned seed
const PBT_ATTEMPTS = 8
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A register sweep: `mutate` builds a variant of the counterexample class from a
 *  deterministic draw and returns its label; the sweep counts the draws the oracle
 *  wrongly ACCEPTED (`ok:true` beside the class's `FS-n` observable). */
function sweep(mutate: (row: any, rng: () => number) => string, api: O0Api): { attempts: number; held: number; broken: number; first: string | null } {
  const rng = mulberry32(PBT_SEED)
  let attempts = 0
  let broken = 0
  let first: string | null = null
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    attempts += 1
    const row = shapeRow(api)
    const label = mutate(row, rng)
    const v = api.validateO0MeasurementShape(row)
    if (v.ok) {
      broken += 1
      if (first === null) first = `draw ${i} — ${label}`
      if (broken >= PBT_STOP_AFTER) break
    }
  }
  return { attempts, held: attempts - broken, broken, first }
}

describe('§5 register (EXTENDED) — the four affected rows, per-row attempt/held/broken', () => {
  it('P-IM-1 (EXTENDED) the row-level `stages[]` totality/finiteness: every draw of a mutated row.stages[] is REFUSED', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const out = sweep((row, rng) => {
      const variant = Math.floor(rng() * 4)
      if (variant === 0) {
        row.stages = row.stages.slice(0, 10)
        return 'row.stages carries 10 of the closed 11 ids'
      }
      if (variant === 1) {
        row.stages = [...row.stages, { ...row.stages[0] }]
        return 'row.stages carries 12 ids (the closed 11 + a duplicated id)'
      }
      if (variant === 2) {
        row.stages = row.stages.map((s: any, i: number) => (i === 0 ? { ...s, ms: null, unseparated: false } : s))
        return 'row.stages[0].ms is null with unseparated:false'
      }
      row.stages = row.stages.map((s: any, i: number) => (i === 0 ? { ...s, ms: -1 } : s))
      return 'row.stages[0].ms is negative'
    }, api)
    expect(
      out.broken,
      `§5 P-IM-1 (EXTENDED) [finding 2]: ${String(out.broken)}/${String(
        out.attempts,
      )} attempts BROKEN (${String(out.held)} held) — a mutated row.stages[] was ACCEPTED (ok:true). First broken draw: ${String(out.first)}`,
    ).toBe(0)
  })

  it('P-TP-2 (EXTENDED) the per-pass `records.indices` totality: every draw of a non-total index set is REFUSED', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const out = sweep((row, rng) => {
      const variant = Math.floor(rng() * 3)
      const p1 = row.hook.passes[1]
      if (variant === 0) {
        p1.records = { indices: [2, 2], count: 2, nestedCount: 0 }
        return "pass 1 records.indices = [2,2] (duplicated; 'count' kept consistent)"
      }
      if (variant === 1) {
        p1.records = { indices: [2, 99], count: 2, nestedCount: 0 }
        return 'pass 1 records.indices = [2,99] (index 3 dropped, a foreign index added)'
      }
      p1.records = { indices: [3, 2], count: 2, nestedCount: 0 }
      return 'pass 1 records.indices = [3,2] (not strictly increasing)'
    }, api)
    expect(
      out.broken,
      `§5 P-TP-2 (EXTENDED) [finding 3]: ${String(out.broken)}/${String(
        out.attempts,
      )} attempts BROKEN (${String(out.held)} held) — a pass whose records.indices are duplicated / foreign / out of order was ACCEPTED. First broken draw: ${String(
        out.first,
      )}`,
    ).toBe(0)
  })

  it('P-TP-1 (EXTENDED) the per-pass declared accounting: every draw of a pass arithmetic contradicting its own records is REFUSED', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const out = sweep((row, rng) => {
      const p1 = row.hook.passes[1]
      const w = p1.window.ms
      const variant = Math.floor(rng() * 2)
      if (variant === 0) {
        p1.accountedMs = w
        p1.unaccountedMs = 0
        p1.sumOfSpansMs = w
        p1.overlapMs = 0
        return `pass 1 declares accountedMs = window.ms (${String(w)}) / unaccountedMs 0 while its records derive 200/250`
      }
      p1.accountedMs = w - 10
      p1.unaccountedMs = 10
      p1.sumOfSpansMs = Math.max(p1.sumOfSpansMs, w - 10)
      p1.overlapMs = r3(p1.sumOfSpansMs - p1.accountedMs)
      return `pass 1 declares accountedMs ${String(p1.accountedMs)} / unaccountedMs 10 while its records derive 200/250`
    }, api)
    expect(
      out.broken,
      `§5 P-TP-1 (EXTENDED) [finding 3]: ${String(out.broken)}/${String(
        out.attempts,
      )} attempts BROKEN (${String(out.held)} held) — a pass declaring an internally coherent arithmetic its own records contradict was ACCEPTED. First broken draw: ${String(
        out.first,
      )}`,
    ).toBe(0)
  })

  it('P-SM-1 (EXTENDED) the per-row reading channel: every draw with a missing/illegal `sessionCountsAt` is REFUSED', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const out = sweep((row, rng) => {
      const variant = Math.floor(rng() * 3)
      if (variant === 0) {
        delete row.hook.sessionCountsAt
        return 'hook.sessionCountsAt is DELETED (1/1 armed, session 2/2)'
      }
      if (variant === 1) {
        row.hook.sessionCountsAt = { pre: { arm: 1, disarm: 1, at: 1999 } }
        return 'hook.sessionCountsAt.post is missing'
      }
      row.hook.sessionCountsAt = { pre: { arm: 1, disarm: 1, at: 2601 }, post: { arm: 2, disarm: 2, at: 2600.5 } }
      return 'the two readings are OUT OF ORDER (post.at precedes pre.at)'
    }, api)
    expect(
      out.broken,
      `§5 P-SM-1 (EXTENDED) [finding 1]: ${String(out.broken)}/${String(
        out.attempts,
      )} attempts BROKEN (${String(out.held)} held) — a row with a missing or illegal sessionCountsAt reading was ACCEPTED (ok:true) while its reason was minted into the non-forcing channel. First broken draw: ${String(
        out.first,
      )}`,
    ).toBe(0)
  })

  it('BUDGET (EXTENDED) the four extended rows land 4 × 8 = 32 attempts (stop-after-5), inside the ≤100/row ceiling', () => {
    expect(PBT_ATTEMPTS).toBeLessThanOrEqual(100)
    expect(4 * PBT_ATTEMPTS).toBe(32)
    expect(PBT_STOP_AFTER).toBe(5)
  })
})
