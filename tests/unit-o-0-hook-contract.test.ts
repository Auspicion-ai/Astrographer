// tests/unit-o-0-hook-contract.test.ts — TestWriter RED set for the O-0
// MEASUREMENT-ONLY HOOK SEAM (§3.6 "Measurement-only hook allowance (the honest
// limit)"). One-pass REMAND addition for unit O-0.
//
// Spec source (the ONLY design source): docs/specs/unit-o-0-per-stage-measurement.md
//   §3.6  the hook allowance — a minimal measurement-only instrumentation hook
//         FOR STAGES 4-8 ONLY (traversal / assemble / decorate / reconcile: the
//         render-path stages a pure CDP probe cannot separate), under three
//         binding constraints:
//           (a) INERT WHEN UNARMED, changes no control flow;
//           (b) it may only record `performance.mark`/`performance.measure`
//               AROUND THE EXISTING CALL SITES — no reordering, no added work,
//               no removed work;
//           (c) an ARMED hook that changes timing is itself a falsifiable row
//               (§5 P-TP-1's "the hook is inert" clause): a hook-induced change
//               to the mutation count or the long-task total forces `pass:false`.
//   §2.2  the CLOSED 11-stage id set (stages 4-8 are ids 4..8 of it)
//   §4.3  `source: 'hook' | 'mark' | 'derived'` + the unseparated rule
//   §6 F4 a stage that cannot be separated is `ms:null` + `unseparated:true` —
//         NEVER imputed (the ban this file enforces on the aggregation helper)
//
// WHY THIS FILE IS RED (the delivered gap): the Implementer's page-side hook
// (`scripts/live-drive.mjs` `O0_HOOK_SOURCE` + `O0_BRIDGE_STAGES`) wraps the two
// PRELOAD-BRIDGE seams only (`rag.snapshot`, `rag.docHeads`), so stages 1 + 3 are
// measured and stages 4-8 are emitted `unseparated` in every row. The artifact
// therefore CANNOT discriminate the render-path stages — O-0's stated point ("the
// precondition artifact that says WHICH stage owns the freeze time") is not yet
// delivered. The seam below is what closes it.
//
// The pinned seam has TWO halves, and BOTH are pinned by this file:
//   (1) the PURE, node-testable recorder module `src/shared/o0-hook.ts` (§0.2) —
//       arm/disarm + around-call mark/measure recording + the stage-row
//       aggregation + the §3.6(c) inertness verdict. No side effects, no DOM, no
//       `window`, no global singleton: it is importable and testable in node.
//   (2) the SOURCE-CONTRACT pins (§B) that the five named call sites are
//       instrumented AROUND the existing call, without reordering. These are
//       node-static assertions on the source text (the
//       `tests/live-drive-contract.test.ts` convention — a source pin is NEVER a
//       claim about live behavior).
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (the recorder's state machine; one test per state)
// ---------------------------------------------------------------------------
//   H1. fresh / UNARMED: no records, no marks, no measures, counts 0.
//   H2. armed, stage ∈ the armed set: exactly one record + start/end marks +
//       one measure, wrapping the existing call (fn runs exactly once).
//   H3. armed, stage ∉ the armed set: fn still runs exactly once, NO record,
//       NO mark/measure, the record is counted as `dropped` (inert, never throws).
//   H4. armed, subset arm (`arm(['traversal.build'])`): only the subset records.
//   H5. disarmed after armed: back to the H1 behavior; counts preserved.
//   H6. re-entrant / nested recording (an inner hook stage inside an outer one):
//       two records in COMPLETION order; the outer's ms spans the inner's.
//   H7. a throwing instrumented call: the SAME error identity propagates
//       (the hook never swallows or rewraps), no record is committed.
//   H8. the observed PAYLOAD is frozen: recording neither mutates nor replaces it.
//   H9. the stage-row aggregation: 0 records ⇒ ms:null + unseparated:true;
//       1+ records ⇒ ms = the SUM over that stage's call sites (the `decorateShared`
//       4-call-site case) + unseparated:false + source:'hook'.
//  H10. the inertness verdict: identical pairs / mutation delta / long-task delta
//       inside + outside the recorded tolerance / malformed input.
//
// FAIL-STATES PINNED (§3.6's three constraints as forcing conditions)
//   FS1 arm/disarm are IDEMPOTENT (a double arm/disarm throws nothing and does
//       not double-count, clear records, or flip state).
//   FS2 a stage OUTSIDE the permitted stages 4-8 (§3.6: "for those stages only")
//       is REJECTED LOUDLY at construction/arm time
//       (`O0_HOOK_STAGE_NOT_ALLOWED: <id>`) — a mis-pinned stage is a config error.
//   FS3 record-time is INERT, never loud: a stage outside the armed set returns
//       `fn()`'s value untouched (no throw → no control-flow change, §3.6(a)).
//   FS4 a malformed/negative/non-finite record is REJECTED, never imputed into a
//       stage `ms` (§6 F4: the imputation ban).
//   FS5 the inertness verdict is FALSIFIABLE (§3.6(c)) and NAMES the offending
//       field; a malformed pair is not silently inert.
//   FS6 the returned `records()`/`state()` are COPIES (a caller cannot reach in
//       and mutate the recorder's internal state).
//
// LAYER (RCA-12): the module half is PURE/node (assertable here). The NUMERIC
// live proof — that an ARMED hook changes neither the DOM mutation count nor the
// long-task total on the real render path — belongs to the LIVE battery
// (`o0_repeat_determinism` against the executing bundle); this file pins only the
// pure verdict + the source/structure shape, per the remand instruction.
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'

// ===========================================================================
// §0.1 — the deterministic PBT harness (mulberry32, pinned seed). NO Math.random().
// ===========================================================================
const PBT_SEED = 0x6f306831 // "o0-h1" — this file's pinned seed
const PBT_ATTEMPTS = 40 // the hook rows: ≤100/row, ≤400 total (§5)
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
function runProperty(rowId: string, strategyId: string, check: (i: number, rng: () => number) => string | null): PbtReport {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  let attempts = 0
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    attempts++
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, attempts, held: counterexamples.length === 0, counterexamples }
}
function report(rep: PbtReport): string {
  return `${rep.row} | ${rep.strategyId} | attempts=${rep.attempts} | ${rep.held ? 'held' : `BROKEN x${rep.counterexamples.length}`} | ${rep.counterexamples.slice(0, 3).join(' ;; ')}`
}
function assertHeld(rep: PbtReport): void {
  // §5 — the per-row report line, emitted only on request (`O0_PBT_REPORT=1`).
  if (process.env.O0_PBT_REPORT) console.log(`[pbt] ${report(rep)}`)
  expect(rep.held, report(rep)).toBe(true)
}

// ===========================================================================
// §0.2 — the PINNED seam module surface. The path + every name below is pinned by
//        this red set; the Implementer must match it EXACTLY.
// ===========================================================================
const HOOK_MODULE_SPECIFIER = '../src/shared/o0-hook.js'
const HOOK_MODULE_PATH = 'src/shared/o0-hook.ts'
const REPORT_MODULE_SPECIFIER = '../src/shared/o0-report.js'

/** §3.6 — the hook is permitted for the render-path stages ONLY: ids 4-8 of the
 *  closed §2.2 set (traversal / assemble / decorate / reconcile). */
const HOOK_STAGE_IDS = ['traversal.build', 'envelope.assemble', 'shared.decorate', 'reconcile.roots', 'reconcile.apply']
/** §2.2 — the ids a pure CDP probe CAN separate; the hook may NEVER claim them. */
const PROBE_STAGE_IDS = ['snapshot.pull', 'snapshot.clone', 'docheads.pull', 'render.dom', 'render.ssr', 'post.style']
/** §3.6b — the three CALLER-level seam ids (the H2 re-derivation): the shell’s
 *  own round trips, recorded by the renderer’s app-wide recorder inside the
 *  bundle (never by a page-side wrap of the frozen `provident.rag.*` props). */
const CALLER_SEAM_STAGE_IDS = ['snapshot.pull', 'snapshot.clone', 'docheads.pull']

interface O0HookRecord {
  stage: string
  ms: number
  startMark: string
  endMark: string
  measureName: string
}
interface O0HookPerf {
  now(): number
  mark(name: string): void
  measure(name: string, startMark: string, endMark: string): void
}
interface O0HookRecorder {
  isArmed(): boolean
  arm(stages?: readonly string[]): boolean
  disarm(): boolean
  record<T>(stage: string, fn: () => T): T
  records(): O0HookRecord[]
  state(): { armed: boolean; records: O0HookRecord[]; armCount: number; disarmCount: number; dropped: number }
  reset(): void
}
interface O0HookApi {
  O0_HOOK_STAGES: readonly string[]
  /** §3.6b — the ADDITIVE wider configuration constant (8 ids: 3 caller-level + 5 render-path). */
  O0_HOOK_SEAM_STAGES?: readonly string[]
  O0_HOOK_MARK_PREFIX: string
  O0_HOOK_STAGE_NOT_ALLOWED: string
  createO0HookRecorder(opts?: { stages?: readonly string[]; perf?: O0HookPerf }): O0HookRecorder
  stagesFromO0HookRecords(records: unknown, ids?: readonly string[]): { stages: any[]; measured: string[]; unseparated: string[] }
  deriveO0HookInertness(
    unarmed: unknown,
    armed: unknown,
    opts?: { longTaskToleranceMs?: number },
  ): { inert: boolean; deltaMutations: number; deltaLongTaskTotalMs: number; failReasons: string[] }
}

async function loadHook(): Promise<O0HookApi> {
  try {
    // @ts-expect-error RED: the pinned pure hook module does not exist yet (§3.6).
    return (await import(/* @vite-ignore */ HOOK_MODULE_SPECIFIER)) as O0HookApi
  } catch (e) {
    throw new Error(
      `RED — the pinned pure O-0 hook module '${HOOK_MODULE_PATH}' does not exist. ` +
        `Spec §3.6 permits a measurement-only hook for stages 4-8; without the pure recorder the ` +
        `seam has no node-testable surface and stages 4-8 stay unseparated (the artifact cannot ` +
        `discriminate). Import error: ${String(e)}`,
    )
  }
}
async function loadReport(): Promise<any> {
  try {
    // @ts-expect-error the report module is pinned by tests/unit-o-0-report-contract.test.ts
    return await import(/* @vite-ignore */ REPORT_MODULE_SPECIFIER)
  } catch (e) {
    throw new Error(`the pinned report module ${REPORT_MODULE_SPECIFIER} must exist (it landed in this unit): ${String(e)}`)
  }
}

/** A controllable perf port: `now()` walks a value list then clamps (so an extra
 *  sample never breaks the assertion, but the FIRST two samples are the pair). */
function fakePerf(nowValues: number[]) {
  const log: string[] = []
  let i = 0
  return {
    log,
    port: {
      now(): number {
        const v = nowValues[Math.min(i, nowValues.length - 1)]
        i++
        return v
      },
      mark(name: string): void {
        log.push(`mark:${name}`)
      },
      measure(name: string, s: string, e: string): void {
        log.push(`measure:${name}:${s}:${e}`)
      },
    } as O0HookPerf,
  }
}

// ===========================================================================
// §A — the PURE recorder: arm/disarm + around-call recording (§3.6 a/b/c)
// ===========================================================================
describe('§A the pure measurement-only hook recorder (src/shared/o0-hook.ts)', () => {
  it('H1/FS-A0 a fresh recorder is UNARMED with no records and zero counts — and it is not a global singleton', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    expect(r.isArmed(), 'a fresh recorder must be UNARMED (§3.6(a))').toBe(false)
    expect(r.records(), 'an unarmed recorder has no records').toEqual([])
    expect(r.state()).toMatchObject({ armed: false, armCount: 0, disarmCount: 0, dropped: 0 })
    // No global state: arming one recorder must never arm another.
    const other = api.createO0HookRecorder()
    r.arm()
    expect(other.isArmed(), 'arming one recorder armed a DIFFERENT one (global singleton — §3.6 requires per-run state)').toBe(false)
    expect(other.records()).toEqual([])
  })

  it('H1 §3.6(a) INERT WHEN UNARMED: record() runs the call exactly once, emits NO mark/measure and commits NO record', async () => {
    const api = await loadHook()
    const { log, port } = fakePerf([100, 145])
    const r = api.createO0HookRecorder({ perf: port })
    let calls = 0
    const out = r.record('traversal.build', () => {
      calls++
      return 'payload'
    })
    expect(calls, 'the unarmed hook must still run the instrumented call exactly once').toBe(1)
    expect(out, 'the unarmed hook must return the call’s value unchanged').toBe('payload')
    expect(log, `an unarmed hook emitted mark/measure calls: ${JSON.stringify(log)}`).toEqual([])
    expect(r.records()).toEqual([])
    expect(r.state().dropped, 'an unarmed record is not a `dropped` (armed) miss').toBe(0)
  })

  it('H2 §3.6(b) ARMED: exactly one record + start/end marks + one measure, wrapping the EXISTING call (fn runs once, value returned)', async () => {
    const api = await loadHook()
    const { log, port } = fakePerf([100, 145])
    const r = api.createO0HookRecorder({ perf: port })
    expect(r.arm(), 'the first arm() must report the unarmed→armed transition').toBe(true)
    let calls = 0
    const out = r.record('traversal.build', () => {
      calls++
      log.push('fn')
      return { ok: true }
    })
    expect(calls, 'an armed hook must not add or duplicate work: fn runs exactly once').toBe(1)
    expect(out, 'the armed hook must return the call’s value unchanged').toEqual({ ok: true })
    const p = api.O0_HOOK_MARK_PREFIX
    expect(log, `the marks must BRACKET the existing call in order (got ${JSON.stringify(log)})`).toEqual([
      `mark:${p}traversal.build:start`,
      'fn',
      `mark:${p}traversal.build:end`,
      `measure:${p}traversal.build:${p}traversal.build:start:${p}traversal.build:end`,
    ])
    const recs = r.records()
    expect(recs.map((x) => x.stage)).toEqual(['traversal.build'])
    expect(recs[0].ms, 'ms must be the end−start span (145−100)').toBe(45)
    expect(recs[0].startMark).toBe(`${p}traversal.build:start`)
    expect(recs[0].endMark).toBe(`${p}traversal.build:end`)
    expect(recs[0].measureName).toBe(`${p}traversal.build`)
  })

  it('H3/FS3 §3.6(a) an ARMED recorder stays inert for a stage outside the armed set: fn runs once, no record, no mark, counted as dropped, NEVER throws', async () => {
    const api = await loadHook()
    const { log, port } = fakePerf([1, 2])
    const r = api.createO0HookRecorder({ stages: ['traversal.build'], perf: port })
    r.arm()
    let calls = 0
    const out = r.record('envelope.assemble', () => {
      calls++
      return 7
    })
    expect(calls, 'an unarmed-in-effect stage must still run exactly once').toBe(1)
    expect(out, 'the value must pass through untouched (no control-flow change)').toBe(7)
    expect(log, 'a stage outside the armed set must emit no mark/measure').toEqual([])
    expect(r.records()).toEqual([])
    expect(r.state().dropped, 'an armed miss must be counted as `dropped` (never silently attributed)').toBe(1)
  })

  it('H4 arm(subset) arms exactly the requested subset of the permitted stages', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    expect(r.arm(['traversal.build'])).toBe(true)
    let outer = 0
    r.record('reconcile.apply', () => {
      outer++
    })
    expect(outer, 'a non-armed stage must still run').toBe(1)
    expect(r.records()).toEqual([])
    expect(r.state().dropped).toBe(1)
    r.record('traversal.build', () => 1)
    expect(r.records().map((x) => x.stage), 'the armed subset must record').toEqual(['traversal.build'])
  })

  it('H5/FS1 disarm() is idempotent and arm()/disarm() never double-count or clear records', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    expect(r.arm()).toBe(true)
    expect(r.arm(), 'a DOUBLE arm must report no transition (idempotent)').toBe(false)
    r.record('shared.decorate', () => 1)
    expect(r.arm(), 'a third arm must still be a no-op').toBe(false)
    expect(r.records().length, 'a redundant arm must NOT clear the records').toBe(1)
    expect(r.state().armCount, 'armCount counts real transitions only').toBe(1)
    expect(r.disarm()).toBe(true)
    expect(r.disarm(), 'a DOUBLE disarm must report no transition (idempotent)').toBe(false)
    expect(r.state()).toMatchObject({ armed: false, armCount: 1, disarmCount: 1 })
    expect(r.records().length, 'a redundant disarm must NOT clear the records').toBe(1)
    const before = r.records().length
    r.record('shared.decorate', () => 1)
    expect(r.records().length, 'after disarm the recorder is inert again (H1)').toBe(before)
    // A re-arm starts a clean measurement window.
    r.arm()
    expect(r.records(), 'arm() must start a clean window').toEqual([])
    expect(r.state().dropped, 'dropped resets with the window').toBe(0)
  })

  it('H6 re-entrant recording: nested hook stages produce two records in COMPLETION order', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    r.arm()
    const inner = r.record('shared.decorate', () => r.record('reconcile.roots', () => 'deep'))
    expect(inner).toBe('deep')
    expect(r.records().map((x) => x.stage), 'records must be committed in completion order (inner first)').toEqual([
      'reconcile.roots',
      'shared.decorate',
    ])
  })

  it('H7 a THROWING instrumented call propagates the SAME error (never swallowed/rewrapped) and commits no record', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    r.arm()
    const boom = new Error('buildTraversal: store required')
    let caught: unknown = null
    try {
      r.record('traversal.build', () => {
        throw boom
      })
    } catch (e) {
      caught = e
    }
    expect(caught, 'the hook must not swallow the error (that would change control flow, §3.6(a))').toBe(boom)
    expect(r.records(), 'a failed call is not a measurement').toEqual([])
  })

  it('H8 §3.6(b) recording NEVER mutates or replaces the payload it observes (frozen input survives)', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    r.arm()
    const payload = Object.freeze({ id: 'envelope-1', zones: Object.freeze([1, 2, 3]), meta: Object.freeze({ depth: 2 }) } as any)
    const snapshot = JSON.stringify(payload)
    const out = r.record('envelope.assemble', () => payload)
    expect(out, 'the payload identity must be preserved (the hook decorates nothing)').toBe(payload)
    expect(JSON.stringify(out), 'the payload must be byte-identical after recording').toBe(snapshot)
    expect(Object.isFrozen(out), 'the payload must not be replaced by a thawed copy').toBe(true)
  })

  it('FS6 records()/state() hand back COPIES — a caller cannot mutate the recorder’s internal state', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    r.arm()
    r.record('reconcile.apply', () => 1)
    const a = r.records()
    a.push({ stage: 'forged', ms: 1, startMark: '', endMark: '', measureName: '' })
    a.length = 0
    expect(r.records().length, 'records() returned the live internal array').toBe(1)
    const s = r.state()
    s.records.push({ stage: 'forged', ms: 1, startMark: '', endMark: '', measureName: '' })
    s.armed = false
    expect(r.records().length, 'state().records returned the live internal array').toBe(1)
    expect(r.isArmed(), 'state() returned a live view of the armed flag').toBe(true)
  })

  it('reset() returns the recorder to the H1 state (unarmed, empty, zeroed)', async () => {
    const api = await loadHook()
    const r = api.createO0HookRecorder()
    r.arm()
    r.record('reconcile.apply', () => 1)
    r.disarm()
    r.reset()
    expect(r.state()).toMatchObject({ armed: false, armCount: 0, disarmCount: 0, dropped: 0 })
    expect(r.records()).toEqual([])
    expect(r.isArmed()).toBe(false)
  })

  it('FS2 §3.6/§3.6b "for those stages only": a stage outside the permitted seam set is REJECTED LOUDLY at construction AND at arm time', async () => {
    const api = await loadHook()
    expect(
      api.O0_HOOK_STAGES,
      'the permitted hook stage set must be EXACTLY stages 4-8 (traversal/assemble/decorate/reconcile)',
    ).toEqual(HOOK_STAGE_IDS)
    // §3.6b RE-DERIVATION (the H2 re-pin, §3.6b's "The recorder's permitted stage
    // set widens BY CONSTRUCTION"): the CONFIGURABLE seam set is
    // `O0_HOOK_SEAM_STAGES` = the three caller-level seams + the five render-path
    // ids, and "the construction/arm-time guard (O0_HOOK_STAGE_NOT_ALLOWED)
    // accepts exactly this set". `snapshot.pull` is therefore REMOVED from this
    // row's rejected list — the caller-level wrap
    // (`getO0HookRecorder().record('snapshot.pull', …)` in sidebar-panes.ts)
    // cannot be configured otherwise. The invariant is UNCHANGED and still loud
    // for every id OUTSIDE the widened set (`render.ssr`/`render.dom`/`post.style`
    // remain probe stages the hook may never claim).
    const SEAM_STAGES: readonly string[] = Array.isArray((api as any).O0_HOOK_SEAM_STAGES)
      ? (api as any).O0_HOOK_SEAM_STAGES
      : HOOK_STAGE_IDS
    for (const seamStage of CALLER_SEAM_STAGE_IDS) {
      let seamMsg = ''
      try {
        api.createO0HookRecorder({ stages: [seamStage] })
      } catch (e) {
        seamMsg = String((e as Error).message)
      }
      expect(
        seamMsg,
        `§3.6b: a recorder must be CONFIGURABLE for the caller-level seam '${seamStage}' (the seam set is ${SEAM_STAGES.join(', ')}) — the app-wide recorder wraps that shell call site, and a refused configuration makes the measured round trip unreportable`,
      ).toBe('')
    }
    for (const bad of ['render.dom', 'render.ssr', 'post.style', 'not.a.stage']) {
      let msg = ''
      try {
        api.createO0HookRecorder({ stages: [bad] })
      } catch (e) {
        msg = String((e as Error).message)
      }
      expect(msg, `createO0HookRecorder({stages:['${bad}']}) must throw §3.6's loud rejection`).toMatch(/O0_HOOK_STAGE_NOT_ALLOWED/)
      expect(msg, `the rejection must NAME the offending stage '${bad}'`).toContain(bad)
    }
    const r = api.createO0HookRecorder()
    let armMsg = ''
    try {
      r.arm(['render.ssr'])
    } catch (e) {
      armMsg = String((e as Error).message)
    }
    expect(armMsg, 'arm() with a non-permitted stage must throw the same loud rejection (a mis-pinned stage is a config error)').toMatch(
      /O0_HOOK_STAGE_NOT_ALLOWED/,
    )
    expect(armMsg).toContain('render.ssr')
  })
})

// ===========================================================================
// §A2 — the pure stage-row aggregation (§4.3 source:'hook'; §6 F4 imputation ban)
// ===========================================================================
describe('§A2 stagesFromO0HookRecords — armed records → O0 stage rows (never imputed)', () => {
  it('H9 zero records ⇒ every hook stage is ms:null + unseparated:true + source:hook (§6 F4)', async () => {
    const hook = await loadHook()
    const out = hook.stagesFromO0HookRecords([])
    expect(out.stages.map((s: any) => s.id)).toEqual(HOOK_STAGE_IDS)
    for (const s of out.stages) {
      expect(s.ms, `stage ${s.id} must be ms:null when no record exists`).toBe(null)
      expect(s.unseparated, `stage ${s.id} must be unseparated when no record exists`).toBe(true)
      expect(s.source).toBe('hook')
    }
    expect(out.measured).toEqual([])
    expect(out.unseparated).toEqual(HOOK_STAGE_IDS)
  })

  it('H9 a recorded stage is SEPARATED: ms = the SUM over its call sites (the 4-site `decorateShared` case), source:hook', async () => {
    const hook = await loadHook()
    const rec = (stage: string, ms: number) => ({ stage, ms, startMark: `o0:${stage}:start`, endMark: `o0:${stage}:end`, measureName: `o0:${stage}` })
    const out = hook.stagesFromO0HookRecords([
      rec('shared.decorate', 12.5),
      rec('shared.decorate', 7.25),
      rec('shared.decorate', 0.25),
      rec('traversal.build', 3),
    ])
    const by = (id: string) => out.stages.find((s: any) => s.id === id)
    expect(by('shared.decorate').ms, 'a multi-call-site stage must SUM its call sites (a single site would under-report)').toBe(20)
    expect(by('shared.decorate').unseparated).toBe(false)
    expect(by('shared.decorate').source).toBe('hook')
    expect(by('traversal.build').ms).toBe(3)
    expect(by('envelope.assemble').ms, 'an unrecorded stage stays unseparated — never imputed').toBe(null)
    expect(by('envelope.assemble').unseparated).toBe(true)
    expect(out.measured.sort()).toEqual(['shared.decorate', 'traversal.build'])
    expect(out.unseparated.sort()).toEqual(['envelope.assemble', 'reconcile.apply', 'reconcile.roots'])
  })

  it('H9 an explicit id list (the 11-stage merged row) yields exactly those ids, hook stages measured and the rest unseparated', async () => {
    const hook = await loadHook()
    const reportApi = await loadReport()
    const ids: string[] = [...reportApi.O0_STAGE_IDS]
    const out = hook.stagesFromO0HookRecords(
      [{ stage: 'reconcile.apply', ms: 4, startMark: 's', endMark: 'e', measureName: 'm' }],
      ids,
    )
    expect(out.stages.map((s: any) => s.id)).toEqual(ids)
    const by = (id: string) => out.stages.find((s: any) => s.id === id)
    expect(by('reconcile.apply').ms).toBe(4)
    expect(by('reconcile.apply').unseparated).toBe(false)
    expect(by('snapshot.pull').ms, 'a probe stage the hook never measured must stay unseparated (never imputed from another stage)').toBe(null)
    expect(by('post.style').unseparated, 'post.style is DERIVED (§2.2 stage 11), never hook-measured').toBe(true)
  })

  it('FS4 an off-set or malformed record is REJECTED, never imputed into a stage ms (§6 F4)', async () => {
    const hook = await loadHook()
    const cases: any[] = [
      null,
      'not-an-array',
      [{ stage: 'traversal.build' }], // no ms
      [{ stage: 'traversal.build', ms: NaN }],
      [{ stage: 'traversal.build', ms: -1 }],
      [{ stage: 'traversal.build', ms: '12' }],
      [{ ms: 5 }], // no stage
      [{ stage: 'render.dom', ms: 5 }], // a probe stage (§3.6: stages 4-8 only)
      [{ stage: 'not.a.stage', ms: 5 }],
    ]
    for (const bad of cases) {
      let msg = ''
      try {
        hook.stagesFromO0HookRecords(bad)
      } catch (e) {
        msg = String((e as Error).message)
      }
      expect(msg, `a malformed/off-set record set must be REJECTED loudly (got no throw for ${JSON.stringify(bad)})`).toMatch(
        /O0_HOOK_RECORD_INVALID/,
      )
    }
  })
})

// ===========================================================================
// §A3 — the §3.6(c) inertness verdict (falsifiable, names the offending field)
// ===========================================================================
describe('§A3 deriveO0HookInertness — §3.6(c) an armed hook that changes the numbers forces pass:false', () => {
  const pair = (mutations: number, longTaskTotalMs: number) => ({ mutations, longTaskTotalMs })

  it('H10 identical armed/unarmed numbers ⇒ inert:true, zero deltas, no failReasons', async () => {
    const hook = await loadHook()
    const v = hook.deriveO0HookInertness(pair(39, 878), pair(39, 878))
    expect(v.inert).toBe(true)
    expect(v.deltaMutations).toBe(0)
    expect(v.deltaLongTaskTotalMs).toBe(0)
    expect(v.failReasons).toEqual([])
  })

  it('FS5 ANY mutation-count change forces inert:false in BOTH directions, and the reason NAMES `mutations`', async () => {
    const hook = await loadHook()
    for (const d of [1, -1, 12]) {
      const v = hook.deriveO0HookInertness(pair(39, 878), pair(39 + d, 878))
      expect(v.inert, `Δmutations=${d} must not be inert (§3.6(c))`).toBe(false)
      expect(v.deltaMutations).toBe(d)
      expect(JSON.stringify(v.failReasons), 'the failReasons must NAME the offending field `mutations`').toContain('mutations')
    }
  })

  it('FS5 the long-task delta is judged against the RECORDED band: |Δ| ≤ 40 is inert, > 40 forces inert:false naming `longTaskTotalMs`', async () => {
    const hook = await loadHook()
    expect(hook.deriveO0HookInertness(pair(39, 878), pair(39, 918)).inert, 'Δ=+40 (the band edge, inclusive) must be inert').toBe(true)
    expect(hook.deriveO0HookInertness(pair(39, 878), pair(39, 838)).inert, 'Δ=−40 must be inert').toBe(true)
    const over = hook.deriveO0HookInertness(pair(39, 878), pair(39, 919))
    expect(over.inert, 'Δ=+41 must NOT be inert (§3.6(c))').toBe(false)
    expect(JSON.stringify(over.failReasons), 'the reason must NAME `longTaskTotalMs`').toContain('longTaskTotalMs')
    const under = hook.deriveO0HookInertness(pair(39, 878), pair(39, 837))
    expect(under.inert, 'Δ=−41 must NOT be inert').toBe(false)
    const loose = hook.deriveO0HookInertness(pair(39, 878), pair(39, 1000), { longTaskToleranceMs: 200 })
    expect(loose.inert, 'an explicit tolerance override must be honoured').toBe(true)
  })

  it('FS5 a malformed pair is never silently inert (a missing/NaN counter cannot pass the inertness gate)', async () => {
    const hook = await loadHook()
    for (const bad of [null, undefined, {}, { mutations: 39 }, { mutations: NaN, longTaskTotalMs: 878 }, { mutations: 39, longTaskTotalMs: 'x' }, { mutations: -1, longTaskTotalMs: 878 }]) {
      const v = hook.deriveO0HookInertness(bad as any, pair(39, 878))
      expect(v.inert, `a malformed unarmed pair must not be inert: ${JSON.stringify(bad)}`).toBe(false)
      expect(v.failReasons.length, 'a malformed pair must carry a failReasons line').toBeGreaterThan(0)
    }
  })

  it('P-HK-1 [strat:o0-hook-inert] the inertness oracle holds over generated run pairs (Δmutations must be 0; |ΔlongTask| ≤ tolerance)', async () => {
    const hook = await loadHook()
    // §3a finding 12 — added draws: {mutations: NaN} against an unarmed pair, the
    // zero-counter state, an ABSENT tolerance (the documented default 40) and a
    // NON-NUMERIC tolerance (never silently defaulted to 0). Mode is indexed by the
    // attempt so every mode runs inside the 40-attempt budget; mode 0 is the original.
    const MODE_COUNT = 6
    const rep = runProperty('P-HK-1', 'strat:o0-hook-inert', (i, rng) => {
      const mode = i % MODE_COUNT
      const tol = [0, 10, 40, 120][int(rng, 0, 3)]
      const m0 = int(rng, 0, 200)
      const l0 = int(rng, 100, 2000)
      const dm = int(rng, 0, 6) - 3
      const dl = int(rng, 0, 8) * 10 - 40
      let unarmed: any = { mutations: m0, longTaskTotalMs: l0 }
      let armed: any = { mutations: m0 + dm, longTaskTotalMs: l0 + dl }
      let opts: any = { longTaskToleranceMs: tol }
      let legal = dm === 0 && Math.abs(dl) <= tol
      let named: string | null = dm !== 0 ? 'mutations' : 'longTaskTotalMs'
      let expDm: number | null = dm
      let expDl: number | null = dl
      if (mode === 1) {
        unarmed = { mutations: NaN, longTaskTotalMs: l0 }; legal = false; named = 'mutations'; expDm = null; expDl = null
      } else if (mode === 2) {
        unarmed = { mutations: 0, longTaskTotalMs: 0 }; armed = { mutations: 0, longTaskTotalMs: 0 }
        legal = true; named = null; expDm = 0; expDl = 0
      } else if (mode === 3) {
        unarmed = { mutations: 0, longTaskTotalMs: 0 }; armed = { mutations: 0, longTaskTotalMs: 41 }
        opts = { longTaskToleranceMs: 40 } // the recorded band, explicitly
        legal = false; named = 'longTaskTotalMs'; expDm = 0; expDl = 41
      } else if (mode === 4) {
        // The §3.6(c) band is RECORDED as 40 ms (src/shared/o0-hook.ts:45): an absent
        // tolerance must resolve to that documented default, not to 0.
        const d = int(rng, 0, 1) === 0 ? 40 : 41
        armed = { mutations: m0, longTaskTotalMs: l0 + d }
        opts = {}
        legal = d <= 40
        named = legal ? null : 'longTaskTotalMs'
        expDm = 0
        expDl = d
      } else if (mode === 5) {
        armed = { mutations: m0, longTaskTotalMs: l0 }
        opts = { longTaskToleranceMs: '40' }
        legal = false
        named = 'longTaskToleranceMs'
        expDm = null
        expDl = null
      }
      const v = hook.deriveO0HookInertness(unarmed, armed, opts)
      if (v.inert !== legal) {
        return `mode=${mode} unarmed=${JSON.stringify(unarmed)} armed=${JSON.stringify(armed)} opts=${JSON.stringify(opts)} → inert=${v.inert} (expected ${legal})`
      }
      if (!legal) {
        if (!(Array.isArray(v.failReasons) && v.failReasons.length > 0)) return `non-inert with no failReasons line (mode=${mode} opts=${JSON.stringify(opts)})`
        if (named !== null && !JSON.stringify(v.failReasons).includes(named)) {
          return `mode=${mode}: the offending field '${named}' is not named in ${JSON.stringify(v.failReasons)}`
        }
      } else if (v.failReasons.length !== 0) {
        return `an inert pair carried failReasons ${JSON.stringify(v.failReasons)} (mode=${mode})`
      }
      if (expDm !== null && expDl !== null && (v.deltaMutations !== expDm || v.deltaLongTaskTotalMs !== expDl)) {
        return `mode=${mode}: deltas must be the signed differences (got Δmut=${v.deltaMutations} Δlong=${v.deltaLongTaskTotalMs}, expected ${expDm}/${expDl})`
      }
      return null
    })
    assertHeld(rep)
  })
})

// ===========================================================================
// §B — SOURCE-CONTRACT pins (node-static; NEVER a live claim). The five named
//      call sites must be instrumented AROUND the existing call, in order.
// ===========================================================================
function src(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}
/** RED-safe read: a not-yet-existing pinned path yields '' so the assertion fails
 *  with its own explanatory message instead of an ENOENT. */
function srcOrEmpty(path: string): string {
  try {
    return src(path)
  } catch {
    return ''
  }
}
/** The instrumented-wrap shape: `<recorder>.record('<stage>', () => …)` — the
 *  recorder call is the OUTER wrapper of the existing work (no reordering). */
function wrapRe(stage: string): RegExp {
  return new RegExp(`\\.record\\(\\s*['"\`]${stage.replace(/\./g, '\\.')}['"\`]\\s*,\\s*\\(\\s*\\)\\s*=>`)
}
/** The function/method body span from its declaration to the NEXT top-level
 *  `export ` / `  private ` / `  public ` declaration after it. */
function bodyOf(source: string, decl: string, stops: string[]): string {
  const at = source.indexOf(decl)
  if (at < 0) return ''
  let end = source.length
  for (const s of stops) {
    const i = source.indexOf(s, at + decl.length)
    if (i >= 0 && i < end) end = i
  }
  return source.slice(at, end)
}

describe('§B source-contract: the five stages 4-8 call sites are instrumented without reordering', () => {
  const IMPORTS = /from\s+['"]\.\.\/shared\/o0-hook\.js['"]/

  it('B0 §3.6 the pinned module exports the permitted stage set — exactly stages 4-8 of the closed §2.2 set, and never a probe stage', async () => {
    const hook = await loadHook()
    const reportApi = await loadReport()
    const all: string[] = [...reportApi.O0_STAGE_IDS]
    const hookStages: string[] = [...hook.O0_HOOK_STAGES]
    for (const id of hookStages) {
      expect(all.includes(id), `the hook stage '${id}' is not in the closed §2.2 set (${all.join(', ')})`).toBe(true)
    }
    for (const id of PROBE_STAGE_IDS) {
      expect(hookStages.includes(id), `'${id}' is probeable by CDP and must NOT be in the hook set (§3.6: stages 4-8 ONLY)`).toBe(false)
    }
    expect(hookStages).toEqual(HOOK_STAGE_IDS)
  })

  it('B1 §3.6 every instrumented module imports the PINNED pure recorder (no inlined marks at the call sites)', () => {
    const files = [
      'src/main/traversal.ts',
      'src/renderer/pane-graph.ts',
      'src/renderer/sidebar-panes.ts',
      'src/renderer/content-reconcile.ts',
      'src/renderer/runtime.ts',
    ]
    for (const f of files) {
      const s = src(f)
      expect(
        IMPORTS.test(s),
        `${f} does not import the pinned hook module '${HOOK_MODULE_PATH}' — the stage it owns cannot be separated (§3.6)`,
      ).toBe(true)
      expect(
        /performance\.(mark|measure)\s*\(/.test(s),
        `${f} inlines performance.mark/performance.measure directly — §3.6(b) permits marks ONLY through the measurement-only recorder (an inlined probe is unarmed-state untestable)`,
      ).toBe(false)
    }
  })

  it('B2 §2.2 stage 4 `traversal.build` wraps the EXISTING buildTraversal body (src/main/traversal.ts:325) — no work reordered or removed', () => {
    const s = src('src/main/traversal.ts')
    expect(
      s,
      "src/main/traversal.ts `buildTraversal` (:325) is not instrumented: no `.record('traversal.build', () => …)` wrapper — §3.6 forbids any other shape (reordering) and stage 4 stays unseparated",
    ).toMatch(wrapRe('traversal.build'))
    const body = bodyOf(s, 'export function buildTraversal(', ['\nexport function ', '\nexport const ', '\nexport interface '])
    expect(body.length, 'buildTraversal must still exist').toBeGreaterThan(0)
    expect(body, 'the recorded wrapper must ENCLOSE the existing function body (the `input == null` guard must survive — no work removed)').toMatch(
      /input\s*==\s*null/,
    )
    expect(body, 'the wrapper must be inside buildTraversal, not a duplicate call added elsewhere').toMatch(/\.record\(\s*['"`]traversal\.build['"`]/)
  })

  it('B3 §2.2 stage 5 `envelope.assemble` wraps assembleAppGraphEnvelope (src/renderer/pane-graph.ts:329)', () => {
    const s = src('src/renderer/pane-graph.ts')
    expect(
      s,
      "src/renderer/pane-graph.ts `assembleAppGraphEnvelope` (:329) is not instrumented: no `.record('envelope.assemble', () => …)` wrapper — stage 5 stays unseparated",
    ).toMatch(wrapRe('envelope.assemble'))
    const body = bodyOf(s, 'export function assembleAppGraphEnvelope(', ['\nexport function ', '\nexport const ', '\nexport interface '])
    expect(body, 'the existing `input == null || input.registry == null` guard must survive (no work removed)').toMatch(/input\s*==\s*null/)
    expect(body).toMatch(/\.record\(\s*['"`]envelope\.assemble['"`]/)
  })

  it('B4 §2.2 stage 6 `shared.decorate` wraps the EXISTING decorateShared (src/renderer/sidebar-panes.ts:1492) and its 4 call sites are NOT multiplied', () => {
    const s = src('src/renderer/sidebar-panes.ts')
    expect(
      s,
      "src/renderer/sidebar-panes.ts `decorateShared` (:1492, called at :1512/:1568/:1647/:2491) is not instrumented: no `.record('shared.decorate', () => …)` wrapper — stage 6 stays unseparated",
    ).toMatch(wrapRe('shared.decorate'))
    // §3.6(b): no work added/removed — the call sites must not be duplicated or dropped.
    const calls = s.match(/this\.decorateShared\(/g) ?? []
    expect(calls.length, `the decorateShared CALL SITES changed count (found ${calls.length}, §3.6(b) requires the existing 4) — work was added or removed`).toBe(4)
    const body = bodyOf(s, 'private decorateShared(', ['\n  private ', '\n  public ', '\n  protected ', '\n}'])
    expect(body, 'the existing applySharedSubtreeDecoration call must remain INSIDE the recorded wrapper').toMatch(/applySharedSubtreeDecoration\(/)
    expect(body).toMatch(/\.record\(\s*['"`]shared\.decorate['"`]/)
  })

  it('B5 §2.2 stage 7 `reconcile.roots` wraps reconcileDocumentRoots (src/renderer/content-reconcile.ts:421)', () => {
    const s = src('src/renderer/content-reconcile.ts')
    expect(
      s,
      "src/renderer/content-reconcile.ts `reconcileDocumentRoots` (:421) is not instrumented: no `.record('reconcile.roots', () => …)` wrapper — stage 7 stays unseparated",
    ).toMatch(wrapRe('reconcile.roots'))
    const body = bodyOf(s, 'export function reconcileDocumentRoots(', ['\nexport function ', '\nexport const ', '\nexport interface '])
    expect(body, 'the existing loud guard must survive (the hook reorders/removes no work)').toMatch(/reconcileDocumentRoots: next envelopes array required/)
    expect(body).toMatch(/\.record\(\s*['"`]reconcile\.roots['"`]/)
  })

  it('B6 §2.2 stage 8 `reconcile.apply` wraps applyContentReconcile (src/renderer/runtime.ts:480)', () => {
    const s = src('src/renderer/runtime.ts')
    expect(
      s,
      "src/renderer/runtime.ts `applyContentReconcile` (:480) is not instrumented: no `.record('reconcile.apply', () => …)` wrapper — stage 8 stays unseparated",
    ).toMatch(wrapRe('reconcile.apply'))
    const body = bodyOf(s, '  applyContentReconcile(', ['\n  private ', '\n  public ', '\n  protected ', '\n}'])
    expect(body, 'the existing `result/next required` guard must survive').toMatch(/result\/next required/)
    expect(body).toMatch(/\.record\(\s*['"`]reconcile\.apply['"`]/)
  })

  it('B7 §3.6(a) the recorder’s UNARMED path emits no mark/measure: the armed guard precedes every emission in src/shared/o0-hook.ts', () => {
    const s = srcOrEmpty(HOOK_MODULE_PATH)
    expect(s.length, `the pinned pure recorder '${HOOK_MODULE_PATH}' does not exist (§3.6's hook has no node-testable seam)`).toBeGreaterThan(0)
    const guard = s.search(/if\s*\(\s*!?\s*(?:!\s*)?(?:this\.)?(?:armed|isArmed)/)
    const firstEmit = s.search(/\.(?:mark|measure)\s*\(/)
    expect(guard, 'no armed/unarmed guard found in the recorder (the unarmed path is not inert-testable, §3.6(a))').toBeGreaterThan(-1)
    expect(firstEmit, 'the recorder never calls the perf port mark/measure — §3.6(b) requires the marks').toBeGreaterThan(-1)
    expect(
      guard < firstEmit,
      'the armed guard must PRECEDE the first mark/measure emission (§3.6(a): inert when unarmed — an unarmed path that reaches the emission is not inert)',
    ).toBe(true)
    expect(s, 'the recorder must be side-effect-free at module scope (no global singleton / no `window.__o0 =` assignment)').not.toMatch(/window\.__o0\s*=/)
  })

  it('B8 §3.6(c) the driver carries the stages 4-8 seam map + keeps the armed-vs-unarmed inertness comparison, and forces pass:false', () => {
    const d = src('scripts/live-drive.mjs')
    const seamMap = /\{[^{}]*['"`]traversal\.build['"`][^{}]*:[^{}]*['"`]envelope\.assemble['"`][^{}]*:[^{}]*['"`]shared\.decorate['"`][^{}]*:[^{}]*['"`]reconcile\.roots['"`][^{}]*:[^{}]*['"`]reconcile\.apply['"`][^{}]*:[^{}]*\}/.test(d)
    expect(
      seamMap,
      'the driver’s page-side hook maps ONLY the two bridge seams (`O0_BRIDGE_STAGES`), so stages 4-8 are emitted `unseparated` in every row — the artifact cannot discriminate (§3.6). A stage→seam map naming all five stages 4-8 is required.',
    ).toBe(true)
    expect(/deltaMutations|Δmutations/.test(d), 'the o0_repeat_determinism block must keep comparing the armed vs unarmed mutation counts').toBe(
      true,
    )
    expect(/inert/.test(d), 'a hook-induced change must force pass:false (§3.6(c))').toBe(true)
  })

  // -------------------------------------------------------------------------
  // §B9 — §3a finding 5 (src/renderer/runtime.ts:75-77): the PAGE-GLOBAL handle.
  // The module-scope assignment published the FULL recorder (`arm`/`disarm`/
  // `record`/`reset`) to every page script; the fix shape is hardening — publish
  // ONLY the sanctioned 5-key projection, installed lazily (never at module
  // scope). This is a STRUCTURAL assertion: the live proof of the seam belongs
  // to the live battery (o0_repeat_determinism), per the remand note.
  // -------------------------------------------------------------------------
  it('B9 §3a finding 5 — window.__o0recorder is a HARDENED projection (no record/reset) installed from INSIDE a function, never at module scope', () => {
    const RUNTIME = 'src/renderer/runtime.ts'
    const source = src(RUNTIME)
    const sf = ts.createSourceFile(RUNTIME, source, ts.ScriptTarget.Latest, true)
    const refs: any[] = []
    const walk = (node: any): void => {
      if (ts.isPropertyAccessExpression(node) && node.name && (node as any).name.text === '__o0recorder') refs.push(node)
      ts.forEachChild(node, walk)
    }
    walk(sf)
    expect(
      refs.length,
      `no reference to the page-global recorder handle \`window.__o0recorder\` exists in ${RUNTIME} — §3.6 pins the renderer's arm target (the driver's page-side hook cannot arm the recorder without it)`,
    ).toBeGreaterThan(0)
    // The PUBLISH site (an `=` assignment, not a guard read).
    const publishes = refs.filter(
      (n) => ts.isBinaryExpression(n.parent) && n.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken && n.parent.left === n,
    )
    expect(publishes.length, 'there must be exactly ONE publish site for the handle (a re-publish could clobber a running measurement)').toBe(1)
    const assign: any = publishes[0].parent
    // (a) NEVER at module scope: the handle is installed lazily, from inside a function.
    const enclosing = ((): any => {
      let a: any = publishes[0].parent
      while (a) {
        if (ts.isFunctionDeclaration(a) || ts.isFunctionExpression(a) || ts.isArrowFunction(a) || ts.isMethodDeclaration(a)) return a
        a = a.parent
      }
      return null
    })()
    expect(
      enclosing !== null,
      `${RUNTIME}:75-77 assigns the handle at MODULE SCOPE (a top-level \`if (typeof window !== 'undefined')\` block) — the fix shape installs it lazily, from inside a function (first arm), so importing the renderer never publishes a page-global handle`,
    ).toBe(true)
    // (b) the published value is the sanctioned PROJECTION — never the full recorder.
    const value: any = assign.right
    expect(
      ts.isObjectLiteralExpression(value),
      `${RUNTIME} publishes \`${String(value?.getText?.(sf) ?? '').slice(0, 60)}\` — the published value must be the HARDENED projection OBJECT LITERAL {arm, disarm, isArmed, records, state}`,
    ).toBe(true)
    const keys = value.properties.map((p: any) => (p.name && p.name.text) || '<computed>').sort()
    expect(
      keys,
      'the published handle must expose exactly the sanctioned 5 keys: `record` and `reset` must NOT be reachable from the page-global handle (a page script must not be able to commit or wipe a measurement)',
    ).toEqual(['arm', 'disarm', 'isArmed', 'records', 'state'])
    // (c) no renderer-side access outside the sanctioned site.
    const srcFiles: string[] = []
    const collect = (dir: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = `${dir}/${e.name}`
        if (e.isDirectory()) collect(p)
        else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx')) srcFiles.push(p)
      }
    }
    collect('src')
    const offenders = srcFiles.filter((f) => f !== RUNTIME && src(f).includes('__o0recorder'))
    expect(
      offenders,
      `only ${RUNTIME} may reference \`__o0recorder\` (the sanctioned publish site) — a renderer-side reader/writer of the handle is an unauthorized measurement surface`,
    ).toEqual([])
  })
})

// ===========================================================================
// §B10 — §3.6b (the H2 RE-DERIVATION): the caller-level seams for stages 1-3.
//
// THE PROBLEM THE LIVE PASS PROVED: `window.provident.rag.snapshot` /
// `.docHeads` are `contextBridge` function properties with
// `{writable:false, configurable:false}` (probed live — §12 H2), so a page-script
// wrap silently does not take and stages 1-3 came back `unseparated` in EVERY
// leg (`hook.wraps: []`). NO page-side wrap can ever separate them: the seam must
// move into code the shell ALREADY executes. The shell OWNS the call, so a
// `record()` wrap at the shell's own call site measures the WHOLE round trip
// (call → IPC → main handler → store read → structured clone → resolution) with
// the same inertness discipline as the five render-path stages, and the A-4
// discriminator is answered at that CALLER level (§3.6b).
//
// `src/main/main.ts`'s `IPC_RAG_SNAPSHOT` handler then carries the SECOND,
// independent recorder instance — the OPTIONAL refinement that splits the round
// trip's inside (store read + serialization) from its outside (IPC + await). It
// is never a precondition for the A-4 discriminator: without it,
// `snapshot.clone` stays `ms:null` + `unseparated:true` + `structural:true`
// (§6 S14/S15) while `snapshot.pull` is still measured.
// ===========================================================================
describe('§B10 source-contract (§3.6b): the CALLER-level seams for stages 1/2/3', () => {
  const CALLER_SEAM_STAGES = ['snapshot.pull', 'snapshot.clone', 'docheads.pull']

  it('B10 §3.6b/§2.2 1 & 3 the SHELL’S OWN call sites are instrumented: `src/renderer/sidebar-panes.ts` records the `snapshot()` / `docHeads()` round trips around the EXISTING bridge calls', () => {
    const s = srcOrEmpty('src/renderer/sidebar-panes.ts')
    expect(s.length, 'src/renderer/sidebar-panes.ts must exist (the shell’s re-derive body)').toBeGreaterThan(0)
    // The whole ROUND TRIP is the recorded span: the wrap must ENCLOSE the bridge
    // call (a wrap added NEXT TO the call measures nothing — §3.6(b) "around the
    // existing call sites, no reordering, no added/removed work").
    expect(
      s,
      "`snapshot.pull` is not instrumented at the shell's own call site: no `.record('snapshot.pull', () => …this.bridge.rag.snapshot()…)` wrapper — §3.6b moves the seam to the CALLER (the page-side wrap of `provident.rag.snapshot` can never take, §12 H2), so the A-4 read count stays UNMEASURED",
    ).toMatch(/\.record\(\s*['"`]snapshot\.pull['"`][\s\S]{0,200}?this\.bridge\.rag\.snapshot\(\)/)
    expect(
      s,
      "`docheads.pull` is not instrumented at the shell's own call site: no `.record('docheads.pull', () => …this.bridge.rag.docHeads()…)` wrapper — §3.6b requires the same caller-level round trip on the doc-heads payload",
    ).toMatch(/\.record\(\s*['"`]docheads\.pull['"`][\s\S]{0,200}?this\.bridge\.rag\.docHeads\(\)/)
    // §3.6(b): no work added or removed — the pre-existing call sites stay 2 each
    // (the re-derive body + the boot body), never multiplied by the wrap.
    const snapCalls = s.match(/this\.bridge\.rag\.snapshot\(\)/g) ?? []
    const docCalls = s.match(/this\.bridge\.rag\.docHeads\(\)/g) ?? []
    expect(snapCalls.length, '§3.6(b): the `snapshot()` CALL SITES changed count (the wrap must move no work)').toBe(2)
    expect(docCalls.length, '§3.6(b): the `docHeads()` CALL SITES changed count (the wrap must move no work)').toBe(2)
    // The renderer’s APP-WIDE recorder is the instance that owns these two seams
    // (the same one the five render-path stages use) — never a new ad-hoc one.
    expect(
      /getO0HookRecorder\(\)[\s\S]{0,120}?\.record\(\s*['"`](?:snapshot|docheads)\./.test(s),
      '§3.6b: stages 1/3 belong to the RENDERER app-wide recorder (`getO0HookRecorder()`), the same instance that owns the render path — a separate ad-hoc recorder would double-count the union',
    ).toBe(true)
  })

  it('B10 §3.6b the recorder’s permitted stage set widens BY CONSTRUCTION (8 seam ids) while the render-path set stays the five ids 4-8', async () => {
    const hook = await loadHook()
    const reportApi = await loadReport()
    const all: string[] = [...reportApi.O0_STAGE_IDS]
    // `O0_HOOK_SEAM_STAGES` = the ids a recorder instance may be CONFIGURED for:
    // the three caller-level seams + the five render-path ids (§3.6b, §8.1).
    const seams: string[] = Array.isArray(hook.O0_HOOK_SEAM_STAGES) ? [...hook.O0_HOOK_SEAM_STAGES] : []
    expect(
      seams,
      "the ADDITIVE wider configuration constant `O0_HOOK_SEAM_STAGES` is missing — §3.6b: \"the only permitted change to §3.6's landed module: an ADDITIVE wider configuration constant plus the render-path subset\"",
    ).toEqual(all.filter((id) => CALLER_SEAM_STAGES.includes(id) || HOOK_STAGE_IDS.includes(id)))
    expect(seams, '§8.1: the seam set is 3 caller-level + 5 render-path = 8 of the 11 closed ids').toHaveLength(8)
    // The render-path SUBSET — the only stages a PAGE-SIDE `arm()` may request —
    // is unchanged (§3.6b's boundary; B0 pins the landed name B0 uses, and
    // §3.6b names it `O0_RENDER_HOOK_STAGES`: both denote ids 4-8, so either name
    // satisfies this row).
    const renderPath = (hook as any).O0_RENDER_HOOK_STAGES ?? hook.O0_HOOK_STAGES
    expect(renderPath, '§3.6b: the render-path subset stays EXACTLY the five ids 4-8 (a page script may arm the render path, never widen its own seam set)').toEqual(
      HOOK_STAGE_IDS,
    )
    // The two sets are distinct constants, not one widened one: the seam set must
    // not have become the page-side armable set.
    expect(seams).not.toEqual(renderPath)
  })

  it('B10 §3.6b the ONE pinned aggregation call accepts the union of BOTH instances’ records with the full 11-id list', async () => {
    const hook = await loadHook()
    const reportApi = await loadReport()
    const ids: string[] = [...reportApi.O0_STAGE_IDS]
    // §3.6b: "`stagesFromO0HookRecords(records, ids)` takes the union of both
    // instances' records for the freeze window and emits exactly the ids it is
    // given … for the merged 11-row freeze table it is called with the full
    // `O0_STAGE_IDS` list". A caller-level record (`snapshot.pull`) must therefore
    // be a LEGAL record when the ids list asks for it — today the record guard
    // rejects it (`O0_HOOK_RECORD_INVALID`, ids 4-8 only), which would make the
    // measured round trip unreportable.
    let out: any = null
    let msg = ''
    try {
      out = hook.stagesFromO0HookRecords([{ stage: 'snapshot.pull', ms: 412.5 }], ids)
    } catch (e) {
      msg = String((e as Error).message)
    }
    expect(msg, `§3.6b: a recorded \`snapshot.pull\` round trip must be aggregated, not rejected — got ${msg}`).toBe('')
    const pull = (out?.stages ?? []).find((s: any) => s.id === 'snapshot.pull')
    expect(pull?.ms, '§3.6b: the caller-level round trip’s ms is the A-4 discriminator’s number').toBe(412.5)
    expect(pull?.unseparated, 'a recorded stage is SEPARATED (§4.3)').toBe(false)
    expect(out?.stages?.length, 'the aggregation emits exactly the ids it is given (§3.6b)').toBe(11)
  })

  it('B10 §3.6b the MAIN-side refinement: the `IPC_RAG_SNAPSHOT` handler carries a SECOND, independent recorder instance for `snapshot.clone`', () => {
    const s = srcOrEmpty('src/main/main.ts')
    expect(s.length, 'src/main/main.ts must exist').toBeGreaterThan(0)
    expect(
      /from\s+['"]\.\.\/shared\/o0-hook\.js['"]/.test(s),
      'src/main/main.ts does not import the pinned hook module — §3.6b: the main-side refinement needs its own recorder instance',
    ).toBe(true)
    expect(
      s,
      '§3.6b: the main-side instance must be an INDEPENDENT `createO0HookRecorder()` — "a second, separate main-side instance …, not the app-wide singleton" (`getO0HookRecorder()`)',
    ).toMatch(/createO0HookRecorder\s*\(/)
    expect(
      s,
      '§3.6b: the main-side instance must NOT be the app-wide singleton (`getO0HookRecorder()` is the RENDERER’s app-wide recorder; the main process needs its own instance)',
    ).not.toMatch(/getO0HookRecorder\s*\(/)
    expect(
      s,
      "`snapshot.clone` is not instrumented inside the `IPC_RAG_SNAPSHOT` handler: no `.record('snapshot.clone', () => …)` wrap — §3.6b: the main-side span covers the store read + serialization into the IPC reply (the round trip’s INSIDE)",
    ).toMatch(/\.record\(\s*['"`]snapshot\.clone['"`]/)
    // The recorded span must still be the handler’s own work (§3.6(b): no work
    // reordered/added/removed) — the store read and the reply payload stay.
    const at = s.indexOf('ipcMain.handle(IPC_RAG_SNAPSHOT')
    const handler = at < 0 ? '' : s.slice(at, at + 700)
    expect(handler, 'the §3.6b wrap must be INSIDE the IPC_RAG_SNAPSHOT handler, not beside it').toMatch(/\.record\(\s*['"`]snapshot\.clone['"`]/)
    expect(handler, '§3.6(b): the handler’s existing store read must survive inside the recorded span').toMatch(/listNodes\(\)/)
    expect(handler, '§3.6(b): the handler’s existing edge read must survive inside the recorded span').toMatch(/listEdges\(\)/)
    expect(s, '§3.6b: the doc-heads handler (`IPC_RAG_DOC_HEADS`) is the same path and must still be reachable').toMatch(/IPC_RAG_DOC_HEADS/)
  })
})
