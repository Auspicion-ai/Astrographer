// tests/unit-o0-m1-m3-driver-contract.test.ts — TestWriter RED set for the
// `O0-M1-M3-MEASUREMENT-SHAPE` SOURCE CONTRACT (`scripts/live-drive.mjs`), the
// per-record timestamp contract (`src/shared/o0-hook.ts` §3.1) and the TWO
// artifact-level pins that can only be proven by the FIFTH LIVE RUN (§10/RCA-11).
//
// The ONLY design source: docs/specs/unit-o0-m1-m3-measurement-shape.md
//   §2.5 the affected fields/symbols table (the driver row assembly writes the new
//        fields; the drain returns the post-disarm reading; `o0RowPass` calls the
//        new pure oracles)
//   §3.1 the per-record timestamps (`startMs`/`endMs` on `O0HookRecord`)
//   §3.2/§3.3 the partition + the union accounting (`o0RowPass`)
//   §3.4 the long-task attribution record (`o0QuiesceAndDrain` + the row assembly)
//   §3.5 the per-row arm/disarm counts (`o0HookArm` pre-arm reading +
//        `o0QuiesceAndDrain` post-disarm reading)
//   §4.1/§4.2 the report-shape delta on every row
//   §10  acceptance 7/8 — the FIFTH-edition regeneration + the provably retired fields
//
// WHY THIS IS A NODE-STATIC / ARTIFACT TEST (the tests/live-drive-contract.test.ts
// convention): `scripts/live-drive.mjs` calls `main(process.argv.slice(2))` at
// module scope, so importing it would spawn/attach the Electron app. These are
// SOURCE-CONTRACT assertions ONLY — never a claim about live behavior.
//
// ---------------------------------------------------------------------------
// DEPENDENCY CLASSIFICATION (mandatory, per the DONE-row rule: a pin that can only
// be proven live must SAY SO rather than fake a green):
//
//   [IMPL]  the pin is satisfied by the IMPLEMENTER's driver/module change and is
//           provable in node right now (the source text, or the pure module).
//   [LIVE]  the pin is only provable by the FIFTH LIVE RUN (§10): neither the
//           source text nor the pure module can establish it. These pins read the
//           COMMITTED FIFTH-edition artifact and are RED until the live re-run
//           regenerates `docs/specs/unit-o-0-per-stage-breakdown.md` (RCA-11).
//           A green here on a FOURTH-edition artifact is impossible by
//           construction — that is the point of the pin.
//
// LAYER (RCA-12): a green here is a MEASUREMENT-SHAPE green (the oracle + the row
// assembly), never app-green.
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED
//   S1/S2  the folder (one pass) / document (two passes) row shapes — the driver
//          must be able to partition BOTH from the per-record timestamps.
//   S3     the deliberately unarmed baseline (rowArmCount 0 / rowDisarmCount 0).
//   S4     nested emits (`render.dom`/`render.ssr` inside `reconcile.apply`).
//   S13    the fifth-edition artifact regenerated (the live states, artefact-only).
//   S14    a legacy (fourth-edition) row: the retired fields are refused.
// FAIL-STATES PINNED: FS1 (no negative remainder), FS6 (a span outside the window),
//   FS8 (the retired residual), FS9 (the retired session aliases), FS10 (a record
//   without finite timestamps), F7 (the bundle identity on the fifth run).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const SPEC = 'docs/specs/unit-o0-m1-m3-measurement-shape.md'
const DRIVER_URL = new URL('../scripts/live-drive.mjs', import.meta.url)
const SRC = readFileSync(DRIVER_URL, 'utf8')
const HOOK_SRC = readFileSync(new URL('../src/shared/o0-hook.ts', import.meta.url), 'utf8')
const ARTIFACT_URL = new URL('../docs/specs/unit-o-0-per-stage-breakdown.md', import.meta.url)
let ARTIFACT = ''
try {
  ARTIFACT = readFileSync(ARTIFACT_URL, 'utf8')
} catch {
  ARTIFACT = ''
}

/** The span of ONE driver function (its declaration to the next top-level
 *  `function `/`async function `/`const ` declaration). */
function fnSpan(name: string): string {
  const at = SRC.indexOf(`function ${name}(`)
  if (at < 0) return ''
  const rest = SRC.slice(at)
  const next = rest.slice(1).search(/\n(?:async )?(?:function|const) [A-Za-z_$]/)
  return next < 0 ? rest : rest.slice(0, next + 1)
}
/** The row-assembly region of `o0FreezeRow` (the `hook: {` literal to its close). */
function hookLiteral(): string {
  const at = SRC.indexOf('async function o0FreezeRow(')
  if (at < 0) return ''
  const rest = SRC.slice(at)
  const next = rest.slice(1).search(/\n(?:async )?(?:function|const) [A-Za-z_$]/)
  const body = next < 0 ? rest : rest.slice(0, next + 1)
  const h = body.indexOf('hook: {')
  return h < 0 ? '' : body.slice(h)
}

describe(`O0-M1-M3 §2.5/§3.2/§3.3 [IMPL] — the driver emits the pass partition + the UNION accounting (${SPEC})`, () => {
  it('M1D-1 §2.5 the driver imports and calls the TWO new pure oracles; `o0RowPass` keeps the ONE implementation (no driver mirror)', () => {
    expect(SRC, 'the driver must import the pinned report twin (`src/shared/o0-report.ts`) — §3.6b/§2.5').toMatch(/src\/shared\/o0-report\.ts/)
    const region = fnSpan('o0RowPass')
    expect(region, '`o0RowPass` not found — §2.5 pins it as the call site of the new pure oracles').not.toBe('')
    for (const fn of ['partitionO0RowPasses', 'deriveO0LongTaskAttribution', 'deriveO0RowArmCounts']) {
      expect(
        region,
        `§2.5: \`o0RowPass\` must call the pure oracle \`${fn}\` — a second in-driver implementation of the partition/accounting/attribution is the drift surface the O-0 §3.6b mirror DELETION closed (one implementation, one contract)`,
      ).toMatch(new RegExp(`${fn}\\s*\\(`))
    }
    expect(
      SRC,
      'the driver must not carry an in-driver mirror of the partition/union accounting (the `o0StagesFromHookRecords` precedent: the mirror is DELETED, not audited — O-0 §3.6b/F16)',
    ).not.toMatch(/function\s+o0(?:PassPartition|UnionAccount|LongTaskAttribution|RowArmCounts)\s*\(/)
  })

  it('M1D-2 §2.5/§4.1/§4.2 [IMPL] every freeze row carries `hook.passes[]`, `hook.passCount`, `hook.passKindSequence`, `hook.passOverlaps[]`, `hook.passLongTaskDoubleCountMs` and `hook.nestingAmbiguities[]`', () => {
    const hook = hookLiteral()
    expect(hook, 'the `hook: {` literal inside `o0FreezeRow` was not found').not.toBe('')
    for (const f of ['passes', 'passCount', 'passKindSequence', 'passOverlaps', 'passLongTaskDoubleCountMs', 'nestingAmbiguities']) {
      expect(
        hook,
        `§4.1/§4.2: the row assembly must write \`hook.${f}\` — the pass sub-rows are the M1 shape and a row without them reintroduces the summed-residual defect`,
      ).toMatch(new RegExp(`\\b${f}\\b`))
    }
    expect(
      hook,
      '§3.2/§3.3: the row assembly must read the per-record detail carrying the timestamps (`startMs`/`endMs`) the partition is derived from',
    ).toMatch(/stageRecordDetail/)
  })

  it('M1D-3 §3.1 [IMPL] the driver carries the per-record `startMs`/`endMs`/`depth`/`passIndex`/`index` through `o0StageRecordDetail`', () => {
    const region = fnSpan('o0StageRecordDetail')
    expect(region, '`o0StageRecordDetail` not found — §2.5/§4.1 pin it as the per-record detail site').not.toBe('')
    for (const f of ['index', 'startMs', 'endMs', 'depth', 'passIndex']) {
      expect(
        region,
        `§3.1/§4.1: \`o0StageRecordDetail\` must carry \`${f}\` per entry — without the timestamps the partition is positionally underivable from the NON-unique mark names (§3.1/FS10)`,
      ).toMatch(new RegExp(`\\b${f}\\b`))
    }
  })

  it('M1D-4 §2.1/§4.1 [IMPL] the SUM-format row residual is RETIRED: `postStyle.residual` is emitted `null` + `retired:true` + `retiredBy`, and the naive form survives ONLY as a `notAResidual` diagnostic', () => {
    const postStyle = fnSpan('o0ApplyPostStyle')
    expect(postStyle, '`o0ApplyPostStyle` not found — §2.5 pins it as the post-style row assembler').not.toBe('')
    expect(
      postStyle,
      '§2.1/§4.1/FS8: `postStyle.residual` is RETIRED to `null` — the legacy `longTaskTotalMs − Σ(named stages)` may never be emitted as a residual (it is the negative number this unit exists to remove)',
    ).not.toMatch(/residual\s*:\s*residual\b/)
    expect(postStyle, '§2.1: the retired field carries the recorded marker `retired: true`').toMatch(/retired\s*:\s*true/)
    expect(postStyle, '§2.1: `retiredBy` names the unit').toMatch(/retiredBy\s*:\s*['"]O0-M1-M3-MEASUREMENT-SHAPE/)
    expect(
      SRC,
      '§2.1: the legacy summed formula may be recorded ONLY as a diagnostic carrying `notAResidual: true` (`reconciliation.naiveSumResidualMs`)',
    ).toMatch(/naiveSumResidualMs|notAResidual/)
    expect(
      SRC,
      '§2.1/§4.1: `reconciliation.residual` is RETIRED to `null` — the honest remainder is `reconciliation.unaccountedMs`',
    ).toMatch(/unaccountedMs/)
    expect(
      SRC,
      '§1.1 (d)/§2.1: the emitted reason must attribute the failure to the MEASUREMENT SHAPE, not to the structural stage alone — the reader must be able to tell the two independent causes apart',
    ).toMatch(/unaccounted|union/i)
  })

  it('M1D-5 §3.2/§3.3/§4.1 [IMPL] the union accounting is the MERGE of the top-level spans (never a sum), and the row records the measured window, the union measure, the remainder, `overlapMs`, `outsideMs` and the band', () => {
    const hook = hookLiteral()
    const recon = SRC.slice(Math.max(0, SRC.indexOf('reconciliation:')), SRC.indexOf('reconciliation:') + 2000)
    expect(recon, '§4.1: the row assembly must emit the `reconciliation` block with the new remainder fields').not.toBe('')
    for (const f of ['windowMs', 'accountedMs', 'unaccountedMs', 'overlapMs', 'outsideMs', 'passes', 'bandExceeded']) {
      expect(
        recon,
        `§4.1: \`reconciliation.${f}\` must be emitted — the row-level remainder is the AUTHORITATIVE quantity and its inputs must be visible`,
      ).toMatch(new RegExp(`\\b${f}\\b`))
    }
    expect(
      SRC,
      '§2.1: the remainder must be computed as `window − union`, never `longTaskTotalMs − Σ(named)` (the retired denominator)',
    ).toMatch(/unaccountedMs\s*[:=][\s\S]{0,120}(windowMs|window\.ms|accountedMs)/)
    expect(
      SRC,
      '§3.3/FS1: the driver must carry the FS1 reason shape — a negative remainder is unrepresentable and the reason names the number',
    ).toMatch(/negative/i)
    expect(
      SRC,
      '§3.3/FS6: a top-level span outside the freeze window is recorded (`outsideMs`/`outsideOffenders`) — the H3 window-bound rule extended to the new span data',
    ).toMatch(/outsideMs|outsideOffenders/)
    expect(
      hook,
      '§4.1: `hook.freezeWindow` must remain the RECORDED `o0:t0`/`o0:t1` pair (the row-level window the union is intersected with)',
    ).toMatch(/freezeWindow/)
  })
})

describe(`O0-M1-M3 §2.2/§3.5 [IMPL] — the driver derives the per-row arm/disarm counts from the pre-arm and POST-DISARM readings (${SPEC})`, () => {
  it('M2D-1 §3.5 `o0HookArm` returns the PRE-ARM reading and the drain returns the POST-DISARM reading (with its stamp)', () => {
    const arm = fnSpan('o0HookArm')
    const drain = fnSpan('o0QuiesceAndDrain')
    expect(arm, '`o0HookArm` not found — §3.5 pins it as the pre-arm reading site').not.toBe('')
    expect(drain, '`o0QuiesceAndDrain` not found — §1.2/§3.5 pin it as the post-disarm reading site').not.toBe('')
    expect(
      drain,
      '§1.2/§3.5: the drain evaluate must read the handle AFTER the row’s own `disarm()` (the `after` reading the code already takes) — a per-row count derived from the PRE-disarm reading lands on the NEXT row (the M2 defect)',
    ).toMatch(/disarm\s*\(\s*\)[\s\S]{0,200}?read\s*\(/)
    expect(
      drain,
      '§1.2/§3.5: today ONLY `after.disarmedAt` is consumed — the post-disarm READING (`after.arm` / `after.disarm`) must be returned so `rowArmCount = post.arm − pre.arm` is derivable',
    ).toMatch(/after\.arm|after\.disarm/)
    expect(
      arm,
      '§3.5: `o0HookArm` must RETURN the pre-arm reading (the session counts + a `performance.now()` stamp taken immediately before `arm()`) — it returns no reading today, so the per-row delta is underivable',
    ).toMatch(/(read\s*\(\s*\)|armCount|sessionCountsAt)[\s\S]{0,400}?return/)
    expect(SRC, '§2.2: the post-disarm reading carries its `performance.now()` stamp (`sessionCountsAt.post.at`)').toMatch(/sessionCountsAt/)
    expect(SRC, '§2.2: the derivation is the delta of the two readings').toMatch(/rowArmCount|rowDisarmCount/)
    expect(SRC, '§2.2: the session counters stay LABELED session-scoped').toMatch(/sessionArmCount|sessionDisarmCount/)
  })

  it('M2D-2 §2.2/FS9 [IMPL] the bare `hook.armCount`/`hook.disarmCount` aliases are NO LONGER EMITTED as readings', () => {
    const hook = hookLiteral()
    expect(hook, 'the `hook: {` literal was not found').not.toBe('')
    expect(
      hook,
      '§2.2/FS9: the row assembly still emits the bare `armCount: drained?.hook?.armCount ?? 0` alias — a field whose name implies a per-row count while carrying a SESSION total IS the M2 defect; emit `hook.rowArmCount`/`hook.rowDisarmCount` + `hook.sessionArmCount`/`hook.sessionDisarmCount` instead',
    ).not.toMatch(/\barmCount\s*:/)
    expect(
      hook,
      '§2.2/FS9: the bare `disarmCount` alias is still emitted as a reading',
    ).not.toMatch(/\bdisarmCount\s*:/)
    for (const f of ['rowArmCount', 'rowDisarmCount', 'sessionArmCount', 'sessionDisarmCount', 'sessionCountsAt']) {
      expect(hook, `§2.2/§4.1: the row assembly must write \`hook.${f}\``).toMatch(new RegExp(`\\b${f}\\b`))
    }
  })
})

describe(`O0-M1-M3 §2.3/§3.4 [IMPL] — the driver records the PINNED long-task attribution rule (${SPEC})`, () => {
  it('M3D-1 §2.3/§3.4 the attribution record is emitted on every row with the pinned rule, the window, the included count/total and BOTH rejected alternatives', () => {
    const hook = hookLiteral()
    expect(hook, '§2.3/§4.1: the row assembly must write `hook.longTaskAttribution`').toMatch(/longTaskAttribution/)
    const drain = fnSpan('o0QuiesceAndDrain')
    expect(
      drain,
      '§3.4: the primary oracle (`longTaskTotalMs`) keeps its start-inside-inclusive meaning and its value — the attribution record must be RE-DERIVED from the SAME observed task list the oracle consumes (an under-strong attribution is a §3a finding)',
    ).toMatch(/longTaskTotalMs|deriveO0LongTaskAttribution/)
    expect(
      drain,
      '§2.3: the pinned filter is `t0 ≤ start ≤ t1` with the FULL duration — the rule must be documented at its site, not only implemented',
    ).toMatch(/start-inside|start-inside-inclusive/)
    expect(SRC, '§2.3/§4.4: the rejected alternatives (`overlap-any`, `intersection`) are recorded for DISCRIMINATION only').toMatch(/overlapAnyMs|intersectionMs/)
  })
})

describe(`O0-M1-M3 §3.1 [IMPL] — the additive per-record timestamps on O0HookRecord (${SPEC} §3.1/§2.5)`, () => {
  it('HKD-1 §3.1 `startMs`/`endMs` are recorded fields copied through `o0CopyRecords`, and the published handle projection is NOT widened', () => {
    expect(HOOK_SRC, '§3.1: `O0HookRecord` must carry `startMs`').toMatch(/startMs\s*:\s*number/)
    expect(HOOK_SRC, '§3.1: `O0HookRecord` must carry `endMs`').toMatch(/endMs\s*:\s*number/)
    const copyAt = HOOK_SRC.indexOf('function o0CopyRecords(')
    expect(copyAt, '`o0CopyRecords` not found — §3.1 pins it as the copy-through site').toBeGreaterThan(-1)
    const copy = HOOK_SRC.slice(copyAt, copyAt + 900)
    expect(copy, '§3.1: `startMs` must be copied through `o0CopyRecords`').toMatch(/startMs/)
    expect(copy, '§3.1: `endMs` must be copied through `o0CopyRecords`').toMatch(/endMs/)
    expect(HOOK_SRC, '§3.1: the commit takes `start` before the body and `perf.now()` at commit — the two stamps are the record’s own span').toMatch(/const start = perf\.now\(\)/)
    // F15/§3a(iii) — the page-side published projection must NOT be widened by the
    // additive fields (the O-0 `window.__o0recorder` projection stays exactly
    // {arm, disarm, isArmed, records, state}).
    const pub = HOOK_SRC.slice(Math.max(0, HOOK_SRC.indexOf('__o0recorder') - 800), HOOK_SRC.indexOf('__o0recorder') + 900)
    expect(pub, '§3a(iii): the published projection must stay the O-0 5-key handle — `startMs`/`endMs` must NOT be added to it').not.toMatch(/startMs|endMs/)
  })
})

// ===========================================================================
// [LIVE] — the pins only a real run can prove (§10 acceptance 1/2/4/5/7/8,
// RCA-11). They read the COMMITTED artifact: on a legacy-edition artifact they
// are RED BY CONSTRUCTION and the failure message says exactly that.
//
// ---------------------------------------------------------------------------
// O0-LIVE-GATE-EDITION-PROBE (§13.1 (4) + F7-3, TESTWRITER-REMAND) — WHAT
// CHANGED HERE.
// The landed edition probe was a WHOLE-FILE token match (`/SIXTH|sixth
// edition/i`). The committed artifact is now the **SEVENTH** edition — its
// banner line 3 reads “This is the **SEVENTH live run** … runs 1-6 are
// SUPERSEDED by this revision” — and it still RECORDS the sixth edition as a
// superseded run (“run 6’s (SIXTH)”), so the whole-file probe passed **BY
// PROSE**: it read a superseded-edition sentence, never the file’s own edition
// claim (artifact §11.3/F7-3). The gate is now:
//   LIVE-1   the BANNER-ONLY provenance probe: the `>`-quoted STATUS BANNER’s
//            OWN edition statement (`This is the <ORDINAL> live run`) must be
//            the committed edition (SEVENTH), and the banner must name its
//            superseded run set (`runs 1-6 are SUPERSEDED`) — cross-checked
//            arithmetically against the edition ordinal, so a banner that says
//            “SEVENTH” while naming the wrong superseded set is RED too;
//   LIVE-1B  the DISCRIMINATION proof for that probe: the SAME probe oracle over
//            (i) the THIRD edition’s banner (git `HEAD`, fixture) and (ii) a
//            one-token mutation of THIS banner’s identity word must both be RED;
//   LIVE-2   the PER-LEG + PER-ROW structural pin (UNCHANGED — the live gate the
//            eighth run turns green; §10.9/§11.2): `JSON.parse` each leg’s
//            embedded JSON, then PER ROW run `validateO0MeasurementShape(row)`
//            and `partitionO0RowPasses(row)` and assert the DEC-1-accepted form
//            (the field set, the derived row verdict, the per-id aggregation
//            identity, non-negative measures, the retired fields);
//   LIVE-3   the per-row DISCRIMINATION proof: the SAME pin over a superseded
//            edition’s leg JSON obtained from git history must be RED (a pin
//            that cannot fail on a superseded edition is not evidence);
//   LIVE-4   the outcome-channel pin (§13.2 (7)).
// The edition pin is PROVENANCE, so it must be REPOINTED whenever the artifact
// is deliberately regenerated (an EIGHTH live run ⇒ `EXPECTED_EDITION =
// 'EIGHTH'` + the banner’s own set must read `runs 1-7`): a provenance pin that
// could not fail on a wrong edition is not evidence (§13.1 (4)).
//
// WHICH EDITION IS COMMITTED, AND HOW THE OTHER WAS OBTAINED (stated per the
// remand): the artifact `docs/specs/unit-o-0-per-stage-breakdown.md` is the
// **SEVENTH** edition (banner line 3; run date 2026-09-21; both legs
// `status:"FAIL"` — the harness-order defect F7-1 recorded in its §11.1), and
// its banner itself records that **runs 1-6 are SUPERSEDED**. The artifact
// committed at `HEAD` is the **THIRD** edition (banner: “THIRD (and closing)
// live run”, renderer `1789952537561+678270+a25b03a9`). The FIFTH (FAIL) and
// SIXTH banners are obtainable only from the current artifact’s git history, so
// HEAD’s THIRD edition — extracted with `git show
// HEAD:docs/specs/unit-o-0-per-stage-breakdown.md` into
// `tests/fixtures/o0-artifact-third-edition-banner.json` (head region; blob +
// headSha256 + edition recorded in the fixture’s `provenance`) and into
// `tests/fixtures/o0-artifact-third-edition-legs.json` for the per-row pin — is
// the real older edition BOTH discrimination proofs use.
// ===========================================================================
const LEGACY_LEGS_URL = new URL('./fixtures/o0-artifact-third-edition-legs.json', import.meta.url)
const LEGACY_BANNER_URL = new URL('./fixtures/o0-artifact-third-edition-banner.json', import.meta.url)

/** The edition the COMMITTED artifact must be — the ONE token a regenerated
 *  artifact forces a repoint of (a wrong/older edition must be RED). */
const EXPECTED_EDITION = 'NINTH'
const EXPECTED_ORDINAL = 9
const ORDINAL_BY_WORD: Record<string, number> = {
  FIRST: 1, SECOND: 2, THIRD: 3, FOURTH: 4, FIFTH: 5, SIXTH: 6, SEVENTH: 7, EIGHTH: 8, NINTH: 9, TENTH: 10,
}

/** The artifact’s `>`-quoted STATUS BANNER — the leading blockquote block, and
 *  the ONLY region an edition probe may read: every `SEVENTH`/`SIXTH` occurrence
 *  outside it is a superseded edition’s prose (§13.1 (4)/F7-3). */
function statusBanner(text: string): string {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => /^>/.test(l))
  if (start < 0) return ''
  const out: string[] = []
  for (let i = start; i < lines.length && /^>/.test(lines[i]); i += 1) out.push(lines[i].replace(/^>\s?/, ''))
  return out.join('\n')
}

/** The edition/provenance probe as an ORACLE (the `rowShapeViolations` pattern):
 *  it returns violations instead of throwing, so the SAME probe can be applied to
 *  a superseded edition’s banner as the discrimination proof (LIVE-1B). */
function bannerEditionViolations(text: string): string[] {
  const v: string[] = []
  const banner = statusBanner(text)
  if (banner.trim() === '') {
    return ['the artifact carries no `>`-quoted STATUS BANNER — an edition probe reading anything else is reading superseded-edition prose (§13.1 (4))']
  }
  const norm = banner.replace(/\s+/g, ' ').trim()
  const id = norm.match(/This is the \*{0,2}([A-Za-z]+)\*{0,2}(?: \([^)]*\))? live run\*{0,2}/i)
  if (!id) {
    v.push('the banner does not state its OWN edition (`This is the <ORDINAL> live run`) — an edition probe satisfied outside the banner is satisfied by a superseded edition’s sentence, which is the F7-3 false pass')
    return v
  }
  const word = id[1].toUpperCase()
  const ordinal = ORDINAL_BY_WORD[word]
  if (ordinal === undefined) {
    v.push(`the banner’s edition word \`${word}\` is not an ordinal this probe can order (FIRST..TENTH) — the pin must be repointed when the artifact is regenerated`)
    return v
  }
  if (word !== EXPECTED_EDITION) {
    v.push(`the banner states \`This is the ${word} live run\` — the committed artifact must be the ${EXPECTED_EDITION} edition (repoint EXPECTED_EDITION only when the artifact is deliberately regenerated)`)
  }
  const superseded = norm.match(/[Rr]uns (\d+)-(\d+) are SUPERSEDED/)
  if (!superseded) {
    v.push('the banner does not name its superseded run set (`runs 1-N are SUPERSEDED`) — the committed banner names runs 1-6, and a supersession paragraph OUTSIDE the banner is not the banner’s own statement')
  } else {
    const lo = Number(superseded[1])
    const hi = Number(superseded[2])
    if (lo !== 1) v.push(`the banner’s superseded set starts at run ${lo} — every earlier run is superseded, so the set starts at 1`)
    if (hi !== ordinal - 1) {
      v.push(`the banner states \`runs ${lo}-${hi} are SUPERSEDED\` while describing itself as the ${word} live run — the ${word} edition supersedes every earlier run, so its set is 1..${ordinal - 1}, not 1..${hi}`)
    }
    if (hi !== EXPECTED_ORDINAL - 1) {
      v.push(`the banner’s superseded set ends at run ${hi} — the ${EXPECTED_EDITION} edition must name runs 1-${EXPECTED_ORDINAL - 1} SUPERSEDED`)
    }
  }
  return v
}

function artifactLegs(text: string): Record<string, any> {
  const out: Record<string, any> = {}
  const re = /```json round-trip=(gpu-off|gpu-on)\n([\s\S]*?)\n```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out[m[1]] = JSON.parse(m[2])
  return out
}

type O0Api = Record<string, any>
async function loadO0(): Promise<O0Api> {
  // @ts-expect-error RED — the pure module is transpiled without typecheck from the test surface.
  return (await import(/* @vite-ignore */ '../src/shared/o0-report.js')) as O0Api
}

/** The per-row shape pin (the replaced text probe), as an oracle: it returns the
 *  violations rather than throwing, so the SAME pin can be applied to a
 *  superseded edition as the discrimination proof (LIVE-3). */
function rowShapeViolations(api: O0Api, row: any, leg: string): string[] {
  const v: string[] = []
  const at = `${leg} / ${String(row?.id)}`
  for (const f of ['passes', 'longTaskAttribution', 'rowArmCount', 'rowDisarmCount', 'sessionArmCount', 'sessionDisarmCount', 'sessionCountsAt', 'unaccountedMs', 'accountedMs', 'windowMs']) {
    const present =
      f === 'unaccountedMs' || f === 'accountedMs' || f === 'windowMs'
        ? row?.reconciliation?.[f] !== undefined
        : row?.hook?.[f] !== undefined
    if (!present) v.push(`${at}: the row does not carry \`${f}\` (the new measurement shape is not present on this row)`)
  }
  if (row?.hook?.armCount !== undefined || row?.hook?.disarmCount !== undefined) {
    v.push(`${at}: the row carries the RETIRED bare hook.armCount/hook.disarmCount alias (FS9)`)
  }
  if (row?.postStyle?.residual !== null && row?.postStyle?.residual !== undefined) v.push(`${at}: postStyle.residual is ${String(row.postStyle.residual)} (FS8 — retired to null)`)
  if (row?.reconciliation?.residual !== null && row?.reconciliation?.residual !== undefined) v.push(`${at}: reconciliation.residual is ${String(row.reconciliation.residual)} (FS8 — retired to null)`)
  for (const [label, val] of [['reconciliation.unaccountedMs', row?.reconciliation?.unaccountedMs]] as const) {
    if (typeof val === 'number' && val < 0) v.push(`${at}: ${label} is negative (${val}) — §2.4/FS11`)
  }
  let part: any = null
  try {
    part = api.partitionO0RowPasses(row)
  } catch (e) {
    v.push(`${at}: partitionO0RowPasses threw (${String(e)}) — the pure oracle NEVER throws (§6)`)
    return v
  }
  if (part.row?.pass !== (part.row?.failReasons?.length === 0)) {
    v.push(
      `${at}: row.pass ${String(part.row?.pass)} ≠ (row.failReasons.length === 0) with ${String(part.row?.failReasons?.length)} reason(s) — §4.2/O0-ROW-PASS-ASSERTED-NOT-DERIVED`,
    )
  }
  const passes = Array.isArray(row?.hook?.passes) ? row.hook.passes : []
  for (const p of passes) {
    if (p?.pass !== (p?.failReasons?.length === 0)) v.push(`${at}: pass ${String(p?.index)} pass/failReasons disagree (§4.2)`)
  }
  // the per-id aggregation identity (§4.2 — the M1-symptom oracle): the row’s
  // declared per-id ms must equal the Σ over the passes’ own per-id sums.
  for (const s of Array.isArray(row?.stages) ? row.stages : []) {
    if (s?.id === 'post.style' || typeof s?.ms !== 'number') continue
    const sum = Math.round(passes.reduce((a: number, q: any) => a + (q?.stages?.find((x: any) => x?.id === s.id)?.ms ?? 0), 0) * 1000) / 1000
    if (Math.abs(sum - s.ms) > 0.001) v.push(`${at}: the per-id aggregation identity fails for ${String(s.id)}: row ${s.ms} ≠ Σ passes ${sum} (§4.2/§6 FS2)`)
  }
  let shape: any = null
  try {
    shape = api.validateO0MeasurementShape(row)
  } catch (e) {
    v.push(`${at}: validateO0MeasurementShape threw (${String(e)}) — the pure oracle NEVER throws (§6)`)
    return v
  }
  if (shape.ok !== true) {
    v.push(`${at}: validateO0MeasurementShape(row).ok is ${String(shape.ok)} — errors=${JSON.stringify(shape.errors).slice(0, 240)}`)
  }
  if (!Array.isArray(shape.errors) || shape.errors.length !== 0) {
    v.push(`${at}: the accepted form must carry an EMPTY errors[] — got ${JSON.stringify(shape.errors).slice(0, 240)}`)
  }
  return v
}

describe(`O0-M1-M3 §10 [LIVE] — the SEVENTH-edition artifact: the banner provenance probe + the per-leg/per-row parsed shape pin (RCA-11 + §13.1 (4))`, () => {
  it('LIVE-1 §10.7/S13 the STATUS BANNER is the SEVENTH edition and names runs 1-6 SUPERSEDED (banner-scoped — the whole-file probe passed by prose, F7-3)', () => {
    expect(ARTIFACT, `the committed artifact docs/specs/unit-o-0-per-stage-breakdown.md must exist`).not.toBe('')
    // The edition probe is BANNER-ONLY provenance (§13.1 (4)/F7-3): the landed
    // `/SIXTH|sixth edition/i` probe read a whole file whose own edition is the
    // SEVENTH, so it passed on a superseded-edition sentence ("run 6's (SIXTH)")
    // and never read the seventh banner's own claim. It is repointed to the
    // banner's OWN statement + the superseded run set the banner names.
    const banner = statusBanner(ARTIFACT)
    expect(
      banner,
      '§10.7/S13: the artifact must open with a `>`-quoted **STATUS BANNER** — the only region whose edition statement is the file’s OWN identity (every `SEVENTH`/`SIXTH` occurrence below it is superseded-edition prose). Without it there is nothing banner-scoped to read.',
    ).toMatch(/STATUS BANNER/)
    const violations = bannerEditionViolations(ARTIFACT)
    expect(
      violations,
      `§10.7/S13 [LIVE]: the STATUS BANNER must be the ${EXPECTED_EDITION} edition (its own statement \`This is the ${EXPECTED_EDITION} live run\`) AND must name runs 1-${EXPECTED_ORDINAL - 1} SUPERSEDED — the committed artifact is the SEVENTH edition (§11.3/F7-3). Violations: ${violations.join(' | ')}. Repoint EXPECTED_EDITION/EXPECTED_ORDINAL ONLY when the artifact is deliberately regenerated (an EIGHTH live run ⇒ 'EIGHTH' + \`runs 1-7 are SUPERSEDED\`); regenerate with the recorded command shape: \`npm run build\` → the GPU-OFF leg → the GPU-ON leg → the trio.`,
    ).toEqual([])
    // SCOPE PROOF (§13.1 (4)): the probe reads the banner blockquote, never the
    // whole file and never the §13.2 supersession table — the whole-file form is
    // exactly what passed by prose.
    expect(banner, '§13.1 (4): the probe region must be the banner blockquote — the §13.2 supersession table is OUT of it').not.toMatch(/\| edition \| date \|/)
    expect(
      banner.length < ARTIFACT.length,
      '§13.1 (4): the edition probe must read a strict SUBSET of the artifact (its banner), never the whole file — a whole-file token match is satisfied by any superseded-edition sentence (§11.3/F7-3)',
    ).toBe(true)
    expect(ARTIFACT, '§10.7/FS7: the artifact must record the bundle identity with `verified: true`').toMatch(/"verified"\s*:\s*true/)
  })

  it('LIVE-1B §13.1 (4)/F7-3 [LIVE] DISCRIMINATION: the SAME banner probe is RED on the THIRD edition’s banner (git HEAD) and on a one-token mutation of this banner’s identity word', () => {
    const legacy = JSON.parse(readFileSync(LEGACY_BANNER_URL, 'utf8'))
    expect(legacy.provenance?.source, 'the discrimination fixture records its provenance (the git command that produced it)').toMatch(/git show HEAD:docs\/specs\/unit-o-0-per-stage-breakdown\.md/)
    expect(legacy.provenance?.edition, 'the fixture must state WHICH superseded edition it is (a pin whose negative is unknown is not evidence)').toMatch(/THIRD/)
    const head = String(legacy.head ?? '')
    expect(statusBanner(head), 'the fixture must carry the THIRD edition’s `>`-quoted banner — the region the probe reads').toMatch(/STATUS BANNER/)
    const real = bannerEditionViolations(head)
    expect(
      real.length,
      '§13.1 (4)/F7-3: the banner probe did NOT discriminate — it PASSED on the THIRD edition’s banner (git `HEAD`). A provenance pin that cannot fail on an older edition is not evidence.',
    ).toBeGreaterThan(0)
    expect(
      real.join(' | '),
      'the discrimination red must name the EDITION identity / the superseded run set — never a generic mismatch',
    ).toMatch(new RegExp(`must be the ${EXPECTED_EDITION} edition|superseded run set`, 'i'))
    // The synthetic negative: the SAME committed banner with ONLY its own identity
    // word swapped must be RED, and the superseded-set arithmetic must flag the
    // now-inconsistent set too (a banner that is merely RELABELLED is caught).
    // The swap derives from the banner’s CURRENT word (never a hardcoded one), so
    // this negative keeps working across regenerations.
    const currentWord = ARTIFACT.match(/\*\*([A-Za-z]+) live\b/)?.[1] ?? ''
    const swappedWord = currentWord.toUpperCase() === 'THIRD' ? 'FOURTH' : 'THIRD'
    const relabelled = ARTIFACT.replace(new RegExp(`\\*\\*${currentWord} live`), `**${swappedWord} live`)
    expect(relabelled, `the mutation must apply (the banner’s identity word \`${currentWord}\`) — the banner’s own statement is the pinned \`**<ORDINAL> live run\` phrase`).not.toBe(ARTIFACT)
    const mutated = bannerEditionViolations(relabelled)
    expect(mutated.length, '§13.1 (4): relabelling ONLY the banner’s edition word must make the probe RED').toBeGreaterThan(0)
    expect(mutated.join(' | '), 'the relabelled-banner red must name the edition mismatch').toMatch(new RegExp(`must be the ${EXPECTED_EDITION} edition`))
  })

  it('LIVE-2 §10.1/§10.8 [LIVE] every row of BOTH legs parses and carries the new shape (the replaced whole-file probe, per row)', async () => {
    const api = await loadO0()
    const legs = artifactLegs(ARTIFACT)
    expect(Object.keys(legs).sort(), '§12/§10.1: the artifact must embed BOTH legs’ raw JSON under the `json round-trip=` fences').toEqual(['gpu-off', 'gpu-on'])
    const violations: string[] = []
    for (const [name, leg] of Object.entries(legs)) {
      // the DEC-1-accepted leg triple (§10.9/§12.9) — asserted PER LEG, never by prose.
      expect(leg.status, `§10.9 [LIVE] ${name}: the report must read status:"OPEN-structural"`).toBe('OPEN-structural')
      expect(leg.pass, `§10.9 [LIVE] ${name}: the report must read pass:false (DEC-1 kept, never relabelled "OK")`).toBe(false)
      expect(leg.driver?.selfValidation?.ok, `§10.1/§12.9 [LIVE] ${name}: driver.selfValidation.ok must be true`).toBe(true)
      expect(leg.driver?.selfValidation?.errors, `§10.1/§12.9 [LIVE] ${name}: selfValidation.errors must be EMPTY`).toEqual([])
      expect(leg.driver?.selfValidation?.gatingReasons, `§12.9 [LIVE] ${name}: selfValidation.gatingReasons must be EMPTY (the accepted form has NO gating reason)`).toEqual([])
      expect(Array.isArray(leg.runs) && leg.runs.length > 0, `§10.1 [LIVE] ${name}: the leg must carry its freeze rows`).toBe(true)
      for (const row of leg.runs) violations.push(...rowShapeViolations(api, row, name))
    }
    expect(
      violations,
      `§10.1/§10.8 [LIVE]: the per-row parsed shape pin found ${violations.length} violation(s) — the accepted form is NOT present on every row of both legs (the whole-file text probe could not see this; §13.1 (4)/§13.5)`,
    ).toEqual([])
    // The whole-file negative probes are KEPT (their per-row form is asserted above).
    expect(ARTIFACT, '§10.8/FS9 [LIVE]: the artifact still carries `"armCount"` as a READING').not.toMatch(/"armCount"\s*:\s*\d/)
    expect(ARTIFACT, '§10.8/FS8 [LIVE]: the artifact still carries a NUMERIC `"residual"`').not.toMatch(/"residual"\s*:\s*-?\d/)
    expect(ARTIFACT, '§10.2/FS1 [LIVE]: NO row/pass/cell/verdict may carry a NEGATIVE `unaccountedMs`').not.toMatch(/"unaccountedMs"\s*:\s*-\d/)
    expect(ARTIFACT, '§10.9/P-SM-2 [LIVE]: the DEC-1 visibility invariant — the report must read `status:"OPEN-structural"`, never relabelled "OK"').toMatch(/OPEN-structural/)
    expect(ARTIFACT, '§10.9/FS9 [LIVE]: the report must NOT claim `"status": "OK"`').not.toMatch(/"status"\s*:\s*"OK"/)
  })

  it('LIVE-3 §13.1 (4) [LIVE] DISCRIMINATION: the SAME per-row pin is RED on the THIRD-edition leg JSON (git history) — the pin reads content, never prose', async () => {
    const api = await loadO0()
    const legacy = JSON.parse(readFileSync(LEGACY_LEGS_URL, 'utf8'))
    expect(legacy.provenance?.source, 'the discrimination fixture records its provenance (the git command that produced it)').toMatch(/git show HEAD:docs\/specs\/unit-o-0-per-stage-breakdown\.md/)
    expect(legacy.provenance?.edition, 'the fixture must state WHICH superseded edition it is (a pin whose negative is unknown is not evidence)').toMatch(/THIRD/)
    const reds: string[] = []
    let rows = 0
    for (const [name, leg] of Object.entries(legacy.legs ?? {})) {
      for (const row of (leg as any).runs ?? []) {
        rows += 1
        const v = rowShapeViolations(api, row, `legacy:${name}`)
        if (v.length > 0) reds.push(`${row.id} (${v.length} violation(s)): ${v[0]}`)
      }
    }
    expect(rows, 'the superseded edition must contribute rows (an empty negative is a vacuous discrimination)').toBeGreaterThan(0)
    expect(
      reds.length,
      `§13.1 (4): the per-row pin did NOT discriminate — ${reds.length} of ${rows} superseded-edition row(s) passed the pin. The current-edition green in LIVE-2 means nothing unless the identical pin is RED on a superseded edition’s JSON.`,
    ).toBe(rows)
    expect(reds[0], 'the discrimination red must name a missing measurement-shape field / retired field (never a generic mismatch)').toMatch(/`passes`|longTaskAttribution|rowArmCount|armCount|residual/)
  })

  it('LIVE-4 §13.2 (7) [LIVE] the per-row outcome channel: a band-exceeded row never puts its outcome into `partition.failReasons`', async () => {
    const api = await loadO0()
    const legs = artifactLegs(ARTIFACT)
    const offenders: string[] = []
    let bandRows = 0
    for (const [name, leg] of Object.entries(legs)) {
      for (const row of leg.runs ?? []) {
        const part = api.partitionO0RowPasses(row)
        if (part.row?.bandExceeded !== true) continue
        bandRows += 1
        for (const m of part.row?.outcomeReasons ?? []) {
          if (part.failReasons?.includes(m)) offenders.push(`${name}/${row.id}: the outcome entered partition.failReasons — ${String(m).slice(0, 120)}`)
          if (part.row?.failReasons?.includes(m)) offenders.push(`${name}/${row.id}: the outcome entered row.failReasons — ${String(m).slice(0, 120)}`)
        }
      }
    }
    expect(bandRows, 'the committed (seventh) edition records band-exceeded rows (the outcome class this pin is about) — an empty set is a vacuous pin').toBeGreaterThan(0)
    expect(
      offenders,
      `§13.2 (7) [O0-UNION-BAND-FIELD-DRIFT]: a consumer that greps \`failReasons\` as the FORCING channel meets the row OUTCOME again — the F5-1 gate the sixth run removed is reintroducible from the artifact the live pins read.`,
    ).toEqual([])
  })
})
