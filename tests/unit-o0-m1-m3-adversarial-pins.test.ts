// tests/unit-o0-m1-m3-adversarial-pins.test.ts — the TestWriter RED set for the
// RCA-3 ADVERSARIAL FINDINGS recorded in
// docs/specs/unit-o0-m1-m3-measurement-shape.md **§13** (the unit was RE-OPENED).
//
// The ONLY design source: §13.1 (1)(2)(3) — the three MUST-FIX HOST gaps — and
// §13.2 (5)(7)(8) — the three SHOULD HOST gaps. Finding (4) (the live-gate text
// probe) is pinned in tests/unit-o0-m1-m3-driver-contract.test.ts; finding (6)
// (the config ceiling + the production importer) in
// tests/unit-v5-migration-contract.test.ts; finding (9) is a SPEC re-derivation
// (not a test's).
//
// Each pin is a COUNTEREXAMPLE taken from §13's own text, not a restatement:
//   O0-ROW-PASS-ASSERTED-NOT-DERIVED          §13.1 (1)  → ADV-1
//   O0-AGGREGATION-IDENTITY-DEMOTED           §13.1 (2)  → ADV-2
//   O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED §13.1 (3) → ADV-3
//   O0-MANDATORY-NOTE-CLAUSE-DODGEABLE        §13.2 (5)  → ADV-5
//   O0-UNION-BAND-FIELD-DRIFT                 §13.2 (7)  → ADV-7
//   O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS       §13.2 (8)  → ADV-8a..8d
//
// WHY THIS FILE AND NOT A WIDENED ASSERTION INSIDE THE EXISTING SUITE: every
// existing assertion in tests/unit-o0-m1-m3-measurement-shape.test.ts and
// tests/unit-o0-m1-m3-driver-contract.test.ts is KEPT VERBATIM (the remand may
// not weaken or delete a landed pin). This file adds the counterexamples; the
// six §5 register rows those counterexamples belong to are EXTENDED IN PLACE in
// the M1-M3 shape file (P-TP-1/P-TP-2/P-TP-3/P-SM-1/P-SM-2/P-IM-1).
//
// LAYER (RCA-12): every assertion is a MEASUREMENT-SHAPE assertion over the PURE
// oracle — a green here is SCHEMA-green, never app-green.
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (the state each pin needs, and the one it contrasts)
//   A1  a row whose record set is UNOPENABLE (no top-level snapshot.pull)   → ADV-1a
//   A2  the LEGAL empty/unarmed row (records 0, passes [])                  → ADV-1b
//   A3  a pass whose own failReasons[] is non-empty (forced row reason set)  → ADV-1c
//   A4  a per-id aggregation mismatch (records Σ 20 ms vs a declared 4 000)  → ADV-2
//   A5  a recorded startBeforeOverlapMs 0 vs a re-derived 50 ms              → ADV-3
//   A6  the OPEN-structural report (the PD3-style fixture) with `status` OK  → ADV-5 (control)
//   A7  the SAME report with `status` DELETED and the note missing           → ADV-5 (dodge)
//   A8  a row recording reconciliation.toleranceMs 200 with NO hook field    → ADV-7a
//   A9  a band-exceeded remainder (the outcome channel)                      → ADV-7b
//   A10 a pass window 300 ms outside the freeze window                       → ADV-8a
//   A11 a row whose own pass/failReasons pair is inconsistent                → ADV-8b
//   A12 a row declaring reconciliation.{windowMs,accountedMs,unaccountedMs}/
//       bandExceeded contradicting its own records                           → ADV-8c
//   A13 a legacy row (no hook.passes) fed to the new validator               → ADV-8d
//
// FAIL-STATES PINNED (§13's own class names)
//   FS1/§6  a negative/unrepresentable remainder
//   FS2     the aggregation identity (the M1-symptom oracle)
//   FS5     the attribution rule / recorded ≠ derived
//   FS6     the pass window against the freeze window + band
//   FS10    a missing value NAMED by field path, never imputed
//   §4.2    pass ⇔ no reason (row-level, the D-GP-UFA-3 derivation)
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

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
  `§2.5 pins the export \`${name}\` on ${MODULE_PATH} — the module does not export it (the M1/M2/M3 shape is unimplemented)`

const r3 = (v: number): number => Math.round(v * 1000) / 1000
/** §4.1 — a recorded band is a non-negative finite number (§2.4); a hand-written
 *  fixture must read the RECORDED one, never a default constant. */
const isNonNeg0 = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0

// ===========================================================================
// §0 — the fixtures (built from the spec's OWN arithmetic, never from the code's)
// ===========================================================================
/** The §3.1 record set of the folder row (the M1-M3 shape file's S1 fixture): two
 *  render records on the pre-pass sequence, then a snapshot.pull + reconcile.apply
 *  with the nested render.dom/render.ssr pair inside the re-derive pass. */
const RECORDS = [
  { index: 0, stage: 'render.dom', startMs: 1000, endMs: 1027.4, ms: 27.4 },
  { index: 1, stage: 'render.ssr', startMs: 1027.4, endMs: 1051.5, ms: 24.1 },
  { index: 2, stage: 'snapshot.pull', startMs: 1060, endMs: 1139.9, ms: 79.9 },
  { index: 3, stage: 'reconcile.apply', startMs: 1140, endMs: 1290.1, ms: 150.1 },
  { index: 4, stage: 'render.dom', startMs: 1150, endMs: 1208.4, ms: 58.4 },
  { index: 5, stage: 'render.ssr', startMs: 1209, endMs: 1279.6, ms: 70.6 },
] as const
const WIN = { t0: 1000, t1: 1300 }

function hookSkeleton(over: Record<string, any> = {}): Record<string, any> {
  return {
    armed: true,
    records: RECORDS.length,
    freezeWindow: { ...WIN },
    armWindow: { t0: 999, t1: 1300, ms: 301 },
    toleranceMs: 40,
    rowArmCount: 1,
    rowDisarmCount: 1,
    sessionArmCount: 2,
    sessionDisarmCount: 2,
    sessionCountsAt: { pre: { arm: 1, disarm: 1, at: 999 }, post: { arm: 2, disarm: 2, at: 1300.5 } },
    ...over,
  }
}

/** A row for `partitionO0RowPasses`/`validateO0MeasurementShape` whose declared
 *  fields are DERIVED FROM THE PARTITION (passes, the per-id aggregation sums and
 *  the reconciliation accounting) so that every OTHER clause is satisfied and the
 *  pin under test is the only thing that can fail. */
function legalRow(api: O0Api, over: Record<string, any> = {}, records: readonly any[] = RECORDS, freeze = WIN): Record<string, any> {
  const ids: string[] = api.O0_STAGE_IDS
  const longTasks = over.longTasks ?? [{ start: 1100, duration: 200 }]
  const row: Record<string, any> = {
    id: 'o0-adv-fixture-row',
    block: 'o0_folder_row',
    stageCount: ids.length,
    longTasks,
    longTaskTotalMs: longTasks.reduce((a: number, t: any) => a + t.duration, 0),
    pass: true,
    failReasons: [],
    hook: hookSkeleton({ stageRecordDetail: records.map((r) => ({ ...r })), freezeWindow: { ...freeze } }),
    ...over,
  }
  // (1) the partition derives the passes; (2) the row's declared per-id sums are
  // set to the Σ over those passes (the §4.2 identity HOLDS on this fixture —
  // ADV-2 breaks it deliberately); (3) the reconciliation block is the partition's
  // OWN row accounting over THIS row's records and freeze window.
  //
  // [remand-2026-09-21, the architect's ruling] — the declared block is COHERENT BY
  // CONSTRUCTION, and the fixture derives it AFTER the row's final tolerance is in
  // place, so the declared triple satisfies the §4.1 identities EXACTLY:
  //   `accountedMs + unaccountedMs === windowMs` (both from the one partition),
  //   `unaccountedMs === windowMs − accountedMs`,
  //   `bandExceeded === unaccountedMs > toleranceMs` (the RECORDED band).
  // A hand-written declaration that drifts from the row's own records is what forced
  // the declared-vs-derived clause to be read DIRECTIONALLY; strict equality is the
  // contract for a NEW-shape row, so the FIXTURE is corrected, never the clause.
  // Declared-before-partition fields are taken from the row's own hook — the record
  // window a hook override supplies (ADV-8d deletes the passes from it) and the
  // RECORDED band (ADV-7a declares 200 ms) are the row's own, not re-invented here.
  const declaredToleranceMs = isNonNeg0(over.reconciliation?.toleranceMs)
    ? over.reconciliation.toleranceMs
    : isNonNeg0(over.hook?.toleranceMs)
      ? over.hook.toleranceMs
      : 50
  row.reconciliation = {
    ok: false,
    openStructural: false,
    toleranceMs: declaredToleranceMs,
    naiveSumResidualNote: 'notAResidual',
    unaccountedSource: 'derived',
    unaccountedAttributable: false,
    passes: [],
    residual: null,
    retired: true,
    reason: null,
    note: 'the derived remainder is an accounting quantity, attributable:false, and is never a stage cost (§3.6b RUL-4 clause 5)',
  }
  const part = api.partitionO0RowPasses(row)
  row.hook.passes = part.passes
  row.hook.passCount = part.passes.length
  row.hook.passKindSequence = part.passes.map((p: any) => p.kind)
  const sumFor = (sid: string): number =>
    r3(part.passes.reduce((a: number, p: any) => a + (p.stages.find((s: any) => s.id === sid)?.ms ?? 0), 0))
  row.stages = ids.map((id) => ({
    id,
    ms: id === 'post.style' ? 0 : sumFor(id),
    unseparated: false,
    source: id === 'post.style' ? 'derived' : 'mark',
    structural: false,
    structuralReason: null,
  }))
  row.hook.longTaskAttribution = api.deriveO0LongTaskAttribution(freeze, longTasks)
  row.reconciliation = {
    ...row.reconciliation,
    windowMs: part.row.windowMs,
    accountedMs: part.row.accountedMs,
    unaccountedMs: part.row.unaccountedMs,
    overlapMs: part.row.overlapMs,
    outsideMs: part.row.outsideMs,
    passOverlapSumMs: part.row.passOverlapSumMs,
    bandExceeded: part.row.bandExceeded,
    naiveSumResidualMs: part.row.naiveSumResidualMs,
  }
  return row
}

/** The artifact's embedded per-leg JSON (the sixth edition's raw reports). */
function embeddedLegs(): Record<string, any> {
  const text = readFileSync(new URL('../docs/specs/unit-o-0-per-stage-breakdown.md', import.meta.url), 'utf8')
  const out: Record<string, any> = {}
  const re = /```json round-trip=(gpu-off|gpu-on)\n([\s\S]*?)\n```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out[m[1]] = JSON.parse(m[2])
  return out
}

// ===========================================================================
// §1 — ADV-1: `partition.row.pass` is DERIVED (§13.1 (1) / §4.2)
// ===========================================================================
describe(`O0-ROW-PASS-ASSERTED-NOT-DERIVED — row.pass ⇔ row.failReasons.length === 0 (§13.1 (1) / §4.2)`, () => {
  it('ADV-1a [A1] the UNOPENABLE record set (no top-level snapshot.pull) must NOT read `pass:true` while it carries reasons', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    // A1 — records exist (so the partition runs) but NO top-level snapshot.pull is
    // committed: §3.2 clause 2's UNOPENABLE branch pushes a failReason.
    const row = legalRow(api, {}, RECORDS.slice(0, 2))
    const part = api.partitionO0RowPasses(row)
    const reasons = [...(part.failReasons ?? []), ...(part.row?.failReasons ?? [])]
    expect(
      reasons.length,
      'precondition (§13.1 (1)): the UNOPENABLE record set must carry a reason — got an EMPTY reason set, so the fixture no longer exercises the branch',
    ).toBeGreaterThan(0)
    expect(
      part.row?.pass,
      `§4.2/§13.1 (1) [O0-ROW-PASS-ASSERTED-NOT-DERIVED]: row.pass is ASSERTED, not derived — the row reads pass:${String(
        part.row?.pass,
      )} with ${reasons.length} recorded reason(s): ${JSON.stringify(reasons.slice(0, 2))}. §4.2 pins row.pass ⇔ row.failReasons.length === 0, so an UNOPENABLE set may never return pass:true.`,
    ).toBe(false)
    expect(
      part.row?.pass === (part.row?.failReasons?.length === 0),
      `§4.2/D-GP-UFA-3 [O0-ROW-PASS-ASSERTED-NOT-DERIVED]: the row verdict must be DERIVED from its own reason set — got pass:${String(
        part.row?.pass,
      )} with ${String(part.row?.failReasons?.length)} reason(s)`,
    ).toBe(true)
  })

  it('ADV-1b [A2] the LEGAL empty/unarmed row must NOT read `pass:false` with `failReasons: []`', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    // A2 — the legal empty case (§3.2 clause 4): an unarmed row, records 0, no passes.
    const row = legalRow(api, { hook: hookSkeleton({ armed: false, records: 0, passes: [], stageRecordDetail: [] }) })
    const part = api.partitionO0RowPasses(row)
    expect(part.failReasons, 'precondition: no reason may be fabricated for the legal empty row (§3.2 clause 4)').toEqual([])
    expect(
      part.row?.failReasons,
      `§4.2 [O0-ROW-PASS-ASSERTED-NOT-DERIVED]: the legal empty row carries failReasons ${JSON.stringify(part.row?.failReasons)} — a reason set with no reason in it`,
    ).toEqual([])
    expect(
      part.row?.pass,
      `§4.2/D-GP-UFA-3 [O0-ROW-PASS-ASSERTED-NOT-DERIVED]: the LEGAL empty/unarmed row reads pass:${String(
        part.row?.pass,
      )} with failReasons:[] — the pair is unreadable under the pinned derivation row.pass ⇔ row.failReasons.length === 0 (and "pass:false with no reason" is the schema error §6 names)`,
    ).toBe(true)
  })

  it('ADV-1c [A3] a pass whose own `failReasons[]` is non-empty forces the row reason set AND the row verdict', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    // A3 — §4.2: "a pass with failReasons non-empty forces the row pass:false, i.e.
    // the row's reason set is non-empty". The partition derives its passes from the
    // RECORDS (a hand-supplied `hook.passes[]` is not its input), so the reachable
    // surface for a pass sub-row carrying its own reasons is the shape validator —
    // where a pass reason is today pushed into `failReasons[]` while `ok` stays true.
    const row = legalRow(api)
    row.hook.passes = row.hook.passes.map((p: any, i: number) =>
      i === 0 ? { ...p, pass: false, failReasons: ['the pass window is the recorded §6 FS12 shape failure (a deliberate pin fixture)'] } : p,
    )
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.failReasons?.length,
      '§4.2 [O0-ROW-PASS-ASSERTED-NOT-DERIVED]: a pass with a non-empty failReasons[] must FORCE the row reason set — got an empty failReasons[]',
    ).toBeGreaterThan(0)
    expect(
      v.ok,
      `§4.2/D-GP-UFA-3 [O0-ROW-PASS-ASSERTED-NOT-DERIVED]: a pass sub-row carrying failReasons (${JSON.stringify(
        row.hook.passes[0].failReasons,
      )}) left the shape at ok:${String(v.ok)} — the pass-level reason set must force the row verdict (the derivation, not an assertion)`,
    ).toBe(false)
    expect(JSON.stringify(v.failReasons), '§4.2: the forced reason must name the pass').toMatch(/pass\s*0/)
  })
})

// ===========================================================================
// §2 — ADV-2: the per-id aggregation identity is FORCING (§13.1 (2) / §4.2/FS2)
// ===========================================================================
describe(`O0-AGGREGATION-IDENTITY-DEMOTED — the per-id identity is FORCING, not a note (§13.1 (2) / §4.2/§6 FS2)`, () => {
  it('ADV-2 [A4] records summing to 20 ms for `render.ssr` against a DECLARED 4 000 ms ⇒ NOT ok, and the reasons name the identity', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    // A4 — the reviewer's counterexample (§13.1 (2)): the fixture's render.ssr Σ is
    // 24.1 + 70.6 = 94.7 ms; the row DECLARES 4 000 ms. (The spec's own counterexample
    // reads "records summing to 20 ms vs a declared 4 000 ms" for the same clause.)
    const row = legalRow(api)
    const declared = 4000
    row.stages = row.stages.map((s: any) => (s.id === 'render.ssr' ? { ...s, ms: declared } : s))
    const sum = r3(
      row.hook.passes.reduce((a: number, p: any) => a + (p.stages.find((s: any) => s.id === 'render.ssr')?.ms ?? 0), 0),
    )
    const v = api.validateO0MeasurementShape(row)
    const part = api.partitionO0RowPasses(row)
    const reasons = [...(v.failReasons ?? []), ...(part.failReasons ?? []), ...(part.row?.failReasons ?? [])]
    expect(
      v.ok && part.row?.pass,
      `§4.2/§6 FS2 [O0-AGGREGATION-IDENTITY-DEMOTED]: the per-id aggregation identity is DEMOTED to a non-forcing note — row.stages[render.ssr].ms ${declared} ≠ Σ over passes ${sum} yet the shape reads ok:${String(
        v.ok,
      )} / row.pass:${String(part.row?.pass)}. §6 FS2 carries the reason \`the per-id aggregation identity fails for …\` as FORCING, and the identity is the ONLY oracle tying the recorded per-id sums to the record list (the M1 symptom class).`,
    ).toBe(false)
    const blob = JSON.stringify(reasons)
    expect(blob, '§6 FS2: the reason must name the ID (`render.ssr`)').toMatch(/render\.ssr/)
    expect(blob, '§6 FS2: the reason must name the DECLARED row value (4 000 / 4000)').toMatch(/4000|4 000/)
    expect(blob, '§6 FS2: the reason must name the Σ over the passes (94.7)').toMatch(/94\.7/)
  })
})

// ===========================================================================
// §3 — ADV-3: the attribution fields are RE-DERIVED (§13.1 (3) / §3.4/FS5)
// ===========================================================================
describe(`O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED — recorded ≠ derived is forcing (§13.1 (3) / §3.4/§6 FS5)`, () => {
  const before50 = [{ start: 950, duration: 100 }, { start: 1100, duration: 20 }]

  it('ADV-3 [A5] a task starting 50 ms before the window with a RECORDED `startBeforeOverlapMs: 0` / `startBefore: []` must FAIL', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    if (typeof api.deriveO0LongTaskAttribution !== 'function') throw new Error(MISSING('deriveO0LongTaskAttribution(window, longTasks, opts?)'))
    // A5 — the reviewer's counterexample: a 50 ms task starting before the window, a
    // 20 ms inside task, and a RECORDED attribution claiming overlap 0.
    const row = legalRow(api, { longTasks: before50 })
    const derived = api.deriveO0LongTaskAttribution(WIN, before50)
    expect(derived.startBeforeOverlapMs, 'precondition (§3.4): the re-derived start-before overlap of the fixture must be 50 ms').toBe(50)
    row.hook.longTaskAttribution = {
      ...derived,
      includedCount: 1,
      includedMs: 20,
      startBefore: [],
      straddlesEnd: [],
      startBeforeOverlapMs: 0,
      straddleEndMs: 0,
      ambiguous: false,
      ambiguityReason: null,
    }
    row.longTaskTotalMs = 20
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§3.4/§6 FS5 [O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED]: the recorded attribution is TRUSTED — a row whose RECORDED startBeforeOverlapMs is 0 while the recorded longTasks list re-derives 50 ms validated ok:true. §3.4 forbids an excluded observation being silently absent from the record (recorded ≠ derived is pass:false, both numbers named).`,
    ).toBe(false)
    const blob = JSON.stringify(v.failReasons)
    expect(blob, '§6 FS5: the reason must name the FIELD (`startBeforeOverlapMs`)').toMatch(/startBeforeOverlapMs/)
    expect(blob, '§6 FS5: the reason must name BOTH numbers (the recorded 0 and the derived 50)').toMatch(/50/)
  })

  it('ADV-3b [A5] the ambiguity record is NOT self-certifiable: a recorded `ambiguous:true` cannot cure the recorded/derived mismatch', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    const row = legalRow(api, { longTasks: before50 })
    const derived = api.deriveO0LongTaskAttribution(WIN, before50)
    row.hook.longTaskAttribution = {
      ...derived,
      includedCount: 1,
      includedMs: 20,
      startBefore: [],
      straddlesEnd: [],
      startBeforeOverlapMs: 0,
      straddleEndMs: 0,
      ambiguous: true,
      ambiguityReason: 'the attribution under the pinned rule is ambiguous (a self-certified statement the record must not be able to make)',
    }
    row.longTaskTotalMs = 20
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§3.4/§6 FS5 [O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED]: a DECLARED ambiguity:true + reason let the row certify itself — the recorded 0 still contradicts the re-derived 50 ms and the row validated ok:true`,
    ).toBe(false)
  })
})

// ===========================================================================
// §5 — ADV-5: the mandatory-note clause is not dodgeable (§13.2 (5) / §3.6b RUL-4)
// ===========================================================================
describe(`O0-MANDATORY-NOTE-CLAUSE-DODGEABLE — a missing reconciliation.note is forcing whether or not \`status\` is declared (§13.2 (5))`, () => {
  it('ADV-5 [A6/A7] the sixth-edition leg with `status` DELETED and the note missing must be ok:false with the note reason', async () => {
    const api = await loadO0()
    if (typeof api.validateO0Report !== 'function') throw new Error(MISSING('validateO0Report(rep)'))
    const legs = embeddedLegs()
    const leg = legs['gpu-off']
    expect(leg, 'precondition: the committed artifact must carry the gpu-off leg JSON (the SIXTH edition)').toBeTruthy()
    // A6 — the control: the clause IS forcing on a report that DECLARES status.
    const declared = JSON.parse(JSON.stringify(leg))
    delete declared.reconciliation.note
    const control = api.validateO0Report(declared)
    expect(
      control.ok,
      'precondition (§13.2 (5)): a report that DECLARES `status` and carries no `reconciliation.note` must already be refused — the gate exists only on the declared branch',
    ).toBe(false)
    expect(JSON.stringify(control.failReasons), 'precondition: the note reason names `reconciliation.note`').toMatch(/reconciliation\.note/)
    // A7 — the DODGE: the same report with `status` deleted (and `reconciliation`
    // still absent from REQUIRED, per §13.2 (5)) short-circuits the first conjunct.
    const dodged = JSON.parse(JSON.stringify(leg))
    delete dodged.status
    delete dodged.reconciliation.note
    const v = api.validateO0Report(dodged)
    expect(
      v.ok,
      `§3.6b RUL-4 clause 5/§13.2 (5) [O0-MANDATORY-NOTE-CLAUSE-DODGEABLE]: DELETING the declared \`status\` dodges the mandatory-note clause — the report validated ok:true with the note missing. The clause must be gated on the DERIVED status (or status/reconciliation must be REQUIRED), so a missing note is a forcing reason regardless of what the report declares.`,
    ).toBe(false)
    expect(
      JSON.stringify(v.failReasons),
      '§13.2 (5): the note reason must be in failReasons[] — the FORCING channel (§4.3 fail-loud)',
    ).toMatch(/reconciliation\.note/)
  })
})

// ===========================================================================
// §7 — ADV-7: the union band comes from the RECORDED tolerance (§13.2 (7))
// ===========================================================================
describe(`O0-UNION-BAND-FIELD-DRIFT — the band is the RECORDED tolerance and the outcome channel stays OUT of failReasons (§13.2 (7))`, () => {
  it('ADV-7a [A8] a row recording `reconciliation.toleranceMs: 200` (and no `hook.reconcileToleranceMs`) must be banded at 200 ms', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    // A8 — the drift: the band is read from `hook.reconcileToleranceMs`, a field NO
    // producer emits, while the report records `reconciliation.toleranceMs`.
    const row = legalRow(api, {}, RECORDS, { t0: 1000, t1: 1401 })
    row.reconciliation = { ...row.reconciliation, toleranceMs: 200 }
    const part = api.partitionO0RowPasses(row)
    expect(
      part.row?.toleranceMs,
      `§13.2 (7) [O0-UNION-BAND-FIELD-DRIFT]: the oracle banded the row at ${String(
        part.row?.toleranceMs,
      )} ms while the row RECORDS reconciliation.toleranceMs 200 ms — the band must come from the recorded tolerance (ONE authoritative band: the band the oracle uses and the band the report declares are two readings that can drift).`,
    ).toBe(200)
    expect(
      part.row?.bandExceeded,
      `§13.2 (7): with the RECORDED 200 ms band the remainder (${String(
        part.row?.unaccountedMs,
      )} ms) is INSIDE the band — bandExceeded must be false; it read ${String(part.row?.bandExceeded)} (the oracle used a default constant instead of the recorded tolerance)`,
    ).toBe(false)
    expect(part.row?.outcomeReasons, '§13.2 (7): an inside-the-band remainder carries NO outcome reason').toEqual([])
  })

  it('ADV-7b [A9] a band-exceeded remainder stays OUT of `partition.failReasons` (the F5-1 gate is not reintroducible)', async () => {
    const api = await loadO0()
    if (typeof api.partitionO0RowPasses !== 'function') throw new Error(MISSING('partitionO0RowPasses(row)'))
    // A9 — the sixth run's own state: FOUR of six rows record bandExceeded:true.
    const row = legalRow(api, {}, RECORDS, { t0: 1000, t1: 1401 })
    const part = api.partitionO0RowPasses(row)
    expect(part.row?.bandExceeded, 'precondition: the fixture remainder must exceed the recorded 50 ms band').toBe(true)
    expect(part.row?.outcomeReasons?.length, 'precondition: the outcome must be REPORTED in its own labeled channel').toBeGreaterThan(0)
    const outcome = part.row.outcomeReasons[0]
    expect(
      part.failReasons.includes(outcome),
      `§13.2 (7) [O0-UNION-BAND-FIELD-DRIFT]: \`partition.failReasons\` carries the row OUTCOME (band-exceeded) statement — a consumer that greps failReasons as the forcing channel REINTRODUCES the F5-1 gate the sixth run removed. Offending line: ${JSON.stringify(
        outcome,
      ).slice(0, 140)}`,
    ).toBe(false)
    expect(
      part.row?.failReasons?.includes(outcome),
      '§13.2 (7): the row-level reason set must not carry the outcome statement either (the outcome is its own labeled channel)',
    ).toBe(false)
    expect(part.row?.pass, '§2.1(ii)/RUL-11: a band-exceeded remainder is a MEASUREMENT OUTCOME — the row stays pass:true (0 shape reasons)').toBe(true)
  })
})

// ===========================================================================
// §8 — ADV-8: the validator gaps + the `passIndex` imputation (§13.2 (8))
// ===========================================================================
describe(`O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS — the three missing clauses + no imputation (§13.2 (8))`, () => {
  it('ADV-8a [A10] a pass window 300 ms OUTSIDE the freeze window must be refused (FS6’s pass-window half)', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    // A10 — a single re-derive pass owns the whole record set (so every top-level
    // record IS covered by a pass window — the FS12 coverage clause stays quiet),
    // plus a RECORDLESS pass whose window sits 300 ms outside the freeze window.
    const row = legalRow(api, {}, RECORDS.slice(2))
    const detached = {
      ...row.hook.passes[0],
      index: 1,
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
      stages: row.hook.passes[0].stages.map((s: any) => ({ ...s, ms: null, unseparated: true })),
      pass: true,
      failReasons: [],
    }
    row.hook.passes = [...row.hook.passes, detached]
    row.hook.passCount = row.hook.passes.length
    row.hook.passKindSequence = row.hook.passes.map((p: any) => p.kind)
    const v = api.validateO0MeasurementShape(row)
    expect(
      v.ok,
      `§6 FS6/§13.2 (8)(a) [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS]: a pass window [700, 710] sitting 300 ms OUTSIDE the freeze window [1000, 1300] validated ok:true — the validator never checks a pass window against the freeze window/band (FS6's pass-window half).`,
    ).toBe(false)
    const blob = JSON.stringify(v.failReasons)
    expect(blob, '§6 FS6: the reason must name the pass (index 1)').toMatch(/pass\s*1|passes\[1\]/)
    expect(blob, '§6 FS6: the reason must name the freeze window / the outside measure').toMatch(/freeze|window/i)
  })

  it('ADV-8b [A11] the row’s own `pass`/`failReasons` pair must be consistent', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    // A11 leg 1 — `pass:true` beside a NON-EMPTY failReasons (the §6 rule).
    const claiming = legalRow(api, { pass: true, failReasons: ['stage snapshot.clone is structurally unseparated (§6 S14)'] })
    const v1 = api.validateO0MeasurementShape(claiming)
    expect(
      v1.ok,
      '§4.2/§6/§13.2 (8)(b) [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS]: a row recording `pass:true` with a NON-EMPTY `failReasons[]` validated ok:true — the validator never checks the row’s own pass/failReasons consistency (a `pass:true` beside any FS-n observable is a review finding).',
    ).toBe(false)
    expect(JSON.stringify(v1.failReasons), '§6: the reason must name the row verdict pair').toMatch(/pass|failReasons/i)
    // A11 leg 2 — `pass:false` with an EMPTY failReasons (the mirror schema error).
    const silent = legalRow(api, { pass: false, failReasons: [] })
    const v2 = api.validateO0MeasurementShape(silent)
    expect(
      v2.ok,
      '§4.2/§4.3 fail-loud/§13.2 (8)(b): a row recording `pass:false` with `failReasons: []` validated ok:true — the mirror of the clause (a verdict must be loud in BOTH directions).',
    ).toBe(false)
    expect(JSON.stringify(v2.failReasons), '§4.3: the reason must name the silent verdict').toMatch(/pass|failReasons|reason/i)
  })

  it('ADV-8c [A12] the DECLARED reconciliation accounting must agree with the DERIVED accounting', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    // [remand-2026-09-21, the architect's ruling] — FIRST the fixture's own arithmetic.
    // A12 is a COUNTEREXAMPLE, so it can only be read on a row whose declaration is
    // otherwise coherent: the `legalRow` declaration must satisfy the §4.1 identities
    // EXACTLY and must agree with the DERIVED accounting under STRICT equality (the
    // NEW-shape contract). This pin is why the declared-vs-derived clause may be strict
    // — the fixture is coherent, so a directional allowance has nothing left to excuse.
    const baseline = legalRow(api)
    const derivedRow = api.partitionO0RowPasses(baseline).row
    const decl = baseline.reconciliation
    expect(decl.windowMs, '§4.1: the declared window IS the row’s own freeze window').toBe(derivedRow.windowMs)
    expect(decl.windowMs, '§4.1: `windowMs` is the freeze-window span of THIS row’s records').toBe(
      baseline.hook.freezeWindow.t1 - baseline.hook.freezeWindow.t0,
    )
    expect(decl.accountedMs, '§3.3/§4.1: the declared union measure agrees with the DERIVED one (≤ the recorded 0.1 ms granularity)').toBeCloseTo(derivedRow.accountedMs, 3)
    expect(decl.unaccountedMs, '§4.1: the declared remainder agrees with the DERIVED remainder').toBeCloseTo(derivedRow.unaccountedMs as number, 3)
    expect(
      Math.round((decl.accountedMs + decl.unaccountedMs) * 1000) / 1000,
      '§4.1/[remand-2026-09-21]: the declared identity `accountedMs + unaccountedMs === windowMs` holds EXACTLY',
    ).toBe(Math.round(decl.windowMs * 1000) / 1000)
    expect(
      decl.bandExceeded,
      `§2.1(ii): bandExceeded is DERIVED from the declared remainder ${String(decl.unaccountedMs)} ms and the RECORDED ${String(decl.toleranceMs)} ms band`,
    ).toBe(decl.unaccountedMs > decl.toleranceMs)
    // §3.2 clause 6 — the pass windows are inside the freeze window (the fixture's own
    // pass partition is inside it by construction; a drift here is the FS6 fixture class).
    for (const p of baseline.hook.passes) {
      expect(p.window.t0, `§3.2 clause 6: pass ${String(p.index)} opens inside the freeze window`).toBeGreaterThanOrEqual(baseline.hook.freezeWindow.t0)
      expect(p.window.t1, `§3.2 clause 6: pass ${String(p.index)} closes inside the freeze window`).toBeLessThanOrEqual(baseline.hook.freezeWindow.t1)
    }
    // A12 — declared unaccountedMs: 0 / accountedMs = the whole window while the
    // records derive a remainder (the reviewer's counterexample: "a row declaring
    // accountedMs 9999 on a 100 ms window ⇒ ok:true").
    const declared0 = legalRow(api)
    const derivedUnaccounted = declared0.reconciliation.unaccountedMs
    declared0.reconciliation = { ...declared0.reconciliation, accountedMs: declared0.reconciliation.windowMs, unaccountedMs: 0 }
    const v1 = api.validateO0MeasurementShape(declared0)
    expect(
      v1.ok,
      `§4.1/§13.2 (8)(c) [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS]: the row DECLARES reconciliation.accountedMs ${String(
        declared0.reconciliation.accountedMs,
      )} / unaccountedMs 0 while its own records derive ${String(derivedUnaccounted)} ms unaccounted — validated ok:true. The declared reconciliation must be checked against the DERIVED accounting.`,
    ).toBe(false)
    expect(JSON.stringify(v1.failReasons), '§4.1: the reason must name the declared field path').toMatch(/reconciliation\.(accountedMs|unaccountedMs|windowMs)/)

    const badWindow = legalRow(api)
    badWindow.reconciliation = { ...badWindow.reconciliation, windowMs: 9999 }
    const v2 = api.validateO0MeasurementShape(badWindow)
    expect(
      v2.ok,
      `§4.1/§13.2 (8)(c): a row declaring reconciliation.windowMs 9999 on a ${String(
        badWindow.hook.freezeWindow.t1 - badWindow.hook.freezeWindow.t0,
      )} ms window validated ok:true — the declared window must be the DERIVED record window.`,
    ).toBe(false)
  })

  it('ADV-8d [A13] a legacy row (no `hook.passes`) is refused BY CLASS with NO imputed `passIndex`', async () => {
    const api = await loadO0()
    if (typeof api.validateO0MeasurementShape !== 'function') throw new Error(MISSING('validateO0MeasurementShape(row)'))
    // A13 — the imputation: `else if (!Array.isArray(hook.passes) && !hasOpeners)
    // d.passIndex = 0` writes a FABRICATED passIndex into the row's own entries.
    const row = legalRow(api)
    const hook = { ...row.hook }
    for (const f of ['passes', 'passCount', 'passKindSequence']) delete hook[f]
    hook.stageRecordDetail = hook.stageRecordDetail.map((d: any) => {
      const copy: any = { ...d }
      delete copy.passIndex
      delete copy.depth
      return copy
    })
    row.hook = hook
    const v = api.validateO0MeasurementShape(row)
    expect(v.legacyShape, '§2.5a RUL-8/§6 S14: a row with no hook.passes[] is LEGACY-shaped and refused BY CLASS').toBe(true)
    const imputed = hook.stageRecordDetail.filter((d: any) => d.passIndex !== undefined)
    expect(
      imputed.map((d: any) => d.passIndex),
      `§13.2 (8)(d)/§6 FS10 [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS]: the validator IMPUTED \`passIndex\` onto ${imputed.length} of the row's own entries (${
        JSON.stringify(imputed.map((d: any) => d.passIndex))
      }) — an absent passIndex on a no-passes row is a REPORTED missing value, never 0 (the partition's derived value must never be overwritten with a fabricated index).`,
    ).toEqual([])
    expect(
      JSON.stringify(v.errors) + JSON.stringify(v.failReasons),
      '§6 FS10: the missing `passIndex` must be NAMED by field path (never coerced to 0)',
    ).toMatch(/passIndex/)
  })
})
