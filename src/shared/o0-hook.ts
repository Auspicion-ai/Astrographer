// src/shared/o0-hook.ts — the PURE, node-testable MEASUREMENT-ONLY O-0 hook.
//
// Contract: docs/specs/unit-o-0-per-stage-measurement.md
//   §3.6 "Measurement-only hook allowance (the honest limit)" — the hook is
//        permitted for the render-path stages ONLY (ids 4-8 of the closed §2.2
//        set), under three binding constraints:
//          (a) INERT WHEN UNARMED and no control-flow change;
//          (b) marks ONLY around the EXISTING call sites — no reordering, no
//              added work, no removed work;
//          (c) an ARMED hook that changes the timing is itself a falsifiable row
//              (`deriveO0HookInertness`, §5 P-TP-1's "the hook is inert" clause).
//   §2.2 the CLOSED 11-stage id set (ids 4-8 are the hook's), §4.3 the stage row
//        (`source: 'hook' | 'mark' | 'derived'`) and §6 F4 — a stage that cannot
//        be separated is `ms:null` + `unseparated:true`, NEVER imputed.
//
// The module is side-effect-free on import: no `window`, no DOM, no global
// singleton — every `createO0HookRecorder()` value is independent (per-run
// state), and the unarmed path is a pass-through that emits nothing.
// The app-wide recorder the five instrumented call sites share is created
// LAZILY by `getO0HookRecorder()`; the page-side handle the driver arms
// (`window.__o0`) is exposed by the renderer, never by this module.
/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// §3.6 / §2.2 — the pinned constants (the hook's permitted stage set is ids 4-8).
// ---------------------------------------------------------------------------
export const O0_HOOK_STAGES: readonly string[] = [
  'traversal.build',
  'envelope.assemble',
  'shared.decorate',
  'reconcile.roots',
  'reconcile.apply',
]
/** §3.6(b) — every emitted mark/measure name is prefixed with this (the report's
 *  join key for the hook-recorded spans). */
export const O0_HOOK_MARK_PREFIX = 'o0:'
/** §3.6/§2.2 — the LOUD rejection of a stage outside ids 4-8 (a mis-pinned stage
 *  is a config error, never a silently inert recorder). */
export const O0_HOOK_STAGE_NOT_ALLOWED = 'O0_HOOK_STAGE_NOT_ALLOWED'
/** §6 F4 — the loud rejection of a record that cannot become a stage `ms`
 *  (malformed/negative/non-finite) — the imputation ban. */
export const O0_HOOK_RECORD_INVALID = 'O0_HOOK_RECORD_INVALID'
/** §3.6(c) — the recorded hook-inertness band for the long-task delta (`scripts/
 *  live-drive.mjs` records the same default). */
export const O0_HOOK_LONGTASK_TOLERANCE_MS = 40

export interface O0HookPerf {
  now(): number
  mark(name: string): void
  measure(name: string, startMark: string, endMark: string): void
}
/** §3.6(b) — ONE recorded span: the around-the-call mark pair + its measure. */
export interface O0HookRecord {
  stage: string
  ms: number
  startMark: string
  endMark: string
  measureName: string
}
export interface O0HookSnapshot {
  armed: boolean
  records: O0HookRecord[]
  armCount: number
  disarmCount: number
  dropped: number
}
export interface O0HookRecorder {
  isArmed(): boolean
  arm(stages?: readonly string[]): boolean
  disarm(): boolean
  record<T>(stage: string, fn: () => T): T
  records(): O0HookRecord[]
  state(): O0HookSnapshot
  reset(): void
}
/** §4.3 — one stage row: a recorded stage carries its summed ms, an unrecorded
 *  one is `ms:null` + `unseparated:true` (the imputation ban, §6 F4). */
export interface O0HookStageRow {
  id: string
  ms: number | null
  unseparated: boolean
  source: 'hook' | 'mark' | 'derived'
}
export interface O0HookStageSet {
  stages: O0HookStageRow[]
  measured: string[]
  unseparated: string[]
}
export interface O0HookInertness {
  inert: boolean
  deltaMutations: number
  deltaLongTaskTotalMs: number
  failReasons: string[]
}

// ---------------------------------------------------------------------------
// Small helpers (no DOM, no window).
// ---------------------------------------------------------------------------
function o0IsNonNeg(v: any): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
}
function o0Round(v: number): number {
  return Math.round(v * 1000) / 1000
}
/** The perf port: the ambient `performance` when it carries the full mark/measure
 *  surface, else a monotonic fallback (resolved LAZILY — no import side effect). */
function o0PerfPort(): O0HookPerf {
  const p: any = typeof globalThis !== 'undefined' ? (globalThis as any).performance : null
  if (p && typeof p.now === 'function' && typeof p.mark === 'function' && typeof p.measure === 'function') {
    // The ambient port IS the pinned shape; it is invoked method-style below, so
    // the receiver stays `performance` (no wrapper, and no emission here).
    return p as O0HookPerf
  }
  return { now: () => Date.now(), mark: () => {}, measure: () => {} }
}
/** §3.6/§2.2 — the loud stage-set validation: ids 4-8 ONLY. */
function o0AssertAllowed(requested: readonly string[], where: string): string[] {
  const list = Array.isArray(requested) ? [...requested] : []
  for (const id of list) {
    if (typeof id !== 'string' || !O0_HOOK_STAGES.includes(id)) {
      throw new Error(
        `${O0_HOOK_STAGE_NOT_ALLOWED}: ${String(id)} (${where}) — the measurement-only hook is permitted for the ` +
          `render-path stages ${O0_HOOK_STAGES.join(', ')} ONLY (§3.6/§2.2: a probe-separable stage is never claimed by the hook)`,
      )
    }
  }
  return list
}
function o0CopyRecords(records: readonly O0HookRecord[]): O0HookRecord[] {
  return records.map((r) => ({ stage: r.stage, ms: r.ms, startMark: r.startMark, endMark: r.endMark, measureName: r.measureName }))
}

// ---------------------------------------------------------------------------
// §3.6 — the recorder: arm/disarm + the around-the-call mark/measure recording.
// ---------------------------------------------------------------------------
export function createO0HookRecorder(opts: { stages?: readonly string[]; perf?: O0HookPerf } = {}): O0HookRecorder {
  const perf: O0HookPerf = opts.perf ?? o0PerfPort()
  /** The recorder's CONFIGURED armed set: `arm()` without an argument arms this
   *  (`{stages}` is the per-recorder default; bare `createO0HookRecorder()` uses
   *  the full permitted set of §3.6). */
  const configuredStages = o0AssertAllowed(opts.stages ?? O0_HOOK_STAGES, 'createO0HookRecorder')

  let armed = false
  let armedStages = new Set<string>(configuredStages)
  let armCount = 0
  let disarmCount = 0
  let dropped = 0
  let records: O0HookRecord[] = []

  return {
    isArmed(): boolean {
      return armed
    },
    /** §3.6(a)/FS1 — arm the recorder: a subset when one is given, else the
     *  recorder's CONFIGURED stage set (the default is the full permitted set). A
     *  redundant arm is a no-op that never clears the measurement window. */
    arm(stages?: readonly string[]): boolean {
      const requested = o0AssertAllowed(stages === undefined ? configuredStages : stages, 'arm')
      if (armed) return false
      armed = true
      armCount += 1
      armedStages = new Set<string>(requested)
      records = []
      dropped = 0
      return true
    },
    disarm(): boolean {
      if (!armed) return false
      armed = false
      disarmCount += 1
      return true
    },
    /** §3.6(a)/(b) — the ONE instrumented seam. Unarmed (or a stage outside the
     *  armed set) it is a pure pass-through: `fn()` once, no emission, no record,
     *  no throw. Armed it brackets the EXISTING call with the mark pair and
     *  commits the span on completion (a throw propagates untouched and commits
     *  nothing — the hook never swallows or rewraps). */
    record<T>(stage: string, fn: () => T): T {
      if (!armed || !armedStages.has(stage)) {
        if (armed) dropped += 1
        return fn()
      }
      const startMark = `${O0_HOOK_MARK_PREFIX}${stage}:start`
      const endMark = `${O0_HOOK_MARK_PREFIX}${stage}:end`
      const measureName = `${O0_HOOK_MARK_PREFIX}${stage}`
      const start = perf.now()
      perf.mark(startMark)
      const value = fn()
      perf.mark(endMark)
      perf.measure(measureName, startMark, endMark)
      const ms = o0Round(perf.now() - start)
      records.push({ stage, ms, startMark, endMark, measureName })
      return value
    },
    /** FS6 — a COPY: a caller can never reach into the recorder's state. */
    records(): O0HookRecord[] {
      return o0CopyRecords(records)
    },
    state(): O0HookSnapshot {
      return { armed, records: o0CopyRecords(records), armCount, disarmCount, dropped }
    },
    reset(): void {
      armed = false
      armedStages = new Set<string>(configuredStages)
      armCount = 0
      disarmCount = 0
      dropped = 0
      records = []
    },
  }
}

// ---------------------------------------------------------------------------
// The app-wide recorder the five instrumented call sites share (created LAZILY:
// importing this module has no side effect). It is the value the renderer
// exposes for the driver's page-side hook (`window.__o0`); unarmed it is a
// pass-through, and a refused/absent arm leaves the stage `unseparated`.
// ---------------------------------------------------------------------------
let appRecorder: O0HookRecorder | null = null
export function getO0HookRecorder(): O0HookRecorder {
  if (appRecorder === null) appRecorder = createO0HookRecorder()
  return appRecorder
}

// ---------------------------------------------------------------------------
// §4.3 + §6 F4 — armed records → the stage rows: a recorded stage's ms is the SUM
// over its call sites (the `decorateShared` 4-call-site case — a single site
// would under-report), and every unrecorded stage is `ms:null` +
// `unseparated:true` (never imputed from another stage).
// ---------------------------------------------------------------------------
export function stagesFromO0HookRecords(recordsInput: unknown, ids: readonly string[] = O0_HOOK_STAGES): O0HookStageSet {
  if (!Array.isArray(recordsInput)) {
    throw new Error(
      `${O0_HOOK_RECORD_INVALID}: the hook record set must be an array (got ${JSON.stringify(recordsInput) ?? String(recordsInput)}) — ` +
        `§6 F4: a malformed record set is never imputed into a stage ms`,
    )
  }
  const sums = new Map<string, number>()
  for (const raw of recordsInput as any[]) {
    const r: any = raw && typeof raw === 'object' ? raw : null
    if (r === null) throw new Error(`${O0_HOOK_RECORD_INVALID}: ${JSON.stringify(raw)} is not a hook record object (§4.3)`)
    if (typeof r.stage !== 'string' || !O0_HOOK_STAGES.includes(r.stage)) {
      throw new Error(
        `${O0_HOOK_RECORD_INVALID}: stage ${JSON.stringify(r.stage)} is not one of the permitted hook stages ` +
          `${O0_HOOK_STAGES.join(', ')} (§3.6: ids 4-8 ONLY — a record cannot attribute a probe stage)`,
      )
    }
    if (!o0IsNonNeg(r.ms)) {
      throw new Error(
        `${O0_HOOK_RECORD_INVALID}: stage ${r.stage} ms is ${String(r.ms)} (expected a non-negative finite number — ` +
          `§6 F4: an unmeasured stage is ms:null + unseparated:true, never an imputed value)`,
      )
    }
    sums.set(r.stage, o0Round((sums.get(r.stage) ?? 0) + r.ms))
  }
  const requested = Array.isArray(ids) ? ids : O0_HOOK_STAGES
  const stages: O0HookStageRow[] = requested.map((id) => {
    const ms = sums.get(id)
    if (ms === undefined) {
      // §4.3 — the source names where the value WOULD come from: `hook` for a
      // permitted hook stage, `derived` for the §2.2 stage 11 residual, `mark`
      // for a stage only the CDP probe can separate.
      const source: O0HookStageRow['source'] = O0_HOOK_STAGES.includes(id) ? 'hook' : id === 'post.style' ? 'derived' : 'mark'
      return { id, ms: null, unseparated: true, source }
    }
    return { id, ms, unseparated: false, source: 'hook' as const }
  })
  return {
    stages,
    measured: stages.filter((s) => !s.unseparated).map((s) => s.id),
    unseparated: stages.filter((s) => s.unseparated).map((s) => s.id),
  }
}

// ---------------------------------------------------------------------------
// §3.6(c) / §5 P-TP-1 — the hook-inertness verdict: an ARMED hook that changes
// the mutation count (Δmutations must be 0) or the long-task total beyond the
// RECORDED tolerance is NOT inert, and the reason NAMES the offending field. A
// malformed pair is never silently inert (it cannot pass the gate).
// ---------------------------------------------------------------------------
function o0CounterPair(input: unknown, label: string, failReasons: string[]): { mutations: number; longTaskTotalMs: number } | null {
  const p: any = input && typeof input === 'object' ? input : null
  if (p === null) {
    failReasons.push(`the ${label} run's counters are ${String(input)} (expected {mutations, longTaskTotalMs} — §3.6(c))`)
    return null
  }
  let ok = true
  for (const f of ['mutations', 'longTaskTotalMs']) {
    if (!o0IsNonNeg(p[f])) {
      failReasons.push(
        `the ${label} run's ${f} is ${String(p[f])} (expected a non-negative finite number — a missing/NaN counter cannot ` +
          `pass the hook-inertness gate, §3.6(c)/§4.3 F3)`,
      )
      ok = false
    }
  }
  return ok ? { mutations: p.mutations, longTaskTotalMs: p.longTaskTotalMs } : null
}
export function deriveO0HookInertness(
  unarmedInput: unknown,
  armedInput: unknown,
  opts: { longTaskToleranceMs?: number } = {},
): O0HookInertness {
  const failReasons: string[] = []
  const given = opts && typeof opts === 'object' ? opts.longTaskToleranceMs : undefined
  const tolerance = given === undefined ? O0_HOOK_LONGTASK_TOLERANCE_MS : given
  if (!o0IsNonNeg(tolerance)) {
    failReasons.push(
      `longTaskToleranceMs is ${String(given)} (expected a non-negative finite number — the §3.6(c) band must be RECORDED, never assumed)`,
    )
    return { inert: false, deltaMutations: Number.NaN, deltaLongTaskTotalMs: Number.NaN, failReasons }
  }
  const unarmed = o0CounterPair(unarmedInput, 'unarmed', failReasons)
  const armed = o0CounterPair(armedInput, 'armed', failReasons)
  if (unarmed === null || armed === null) {
    return { inert: false, deltaMutations: Number.NaN, deltaLongTaskTotalMs: Number.NaN, failReasons }
  }
  const deltaMutations = o0Round(armed.mutations - unarmed.mutations)
  const deltaLongTaskTotalMs = o0Round(armed.longTaskTotalMs - unarmed.longTaskTotalMs)
  if (deltaMutations !== 0) {
    failReasons.push(
      `the armed hook changed the DOM mutation count: Δmutations=${deltaMutations} (unarmed ${unarmed.mutations} vs armed ` +
        `${armed.mutations}) — §3.6(c): the mutation count must be identical, so a hook-induced change forces pass:false`,
    )
  }
  if (Math.abs(deltaLongTaskTotalMs) > (tolerance as number)) {
    failReasons.push(
      `the armed hook changed the long-task total: ΔlongTaskTotalMs=${deltaLongTaskTotalMs} ms exceeds the recorded tolerance ` +
        `${String(tolerance)} ms (unarmed ${unarmed.longTaskTotalMs} vs armed ${armed.longTaskTotalMs}) — §3.6(c) forces pass:false`,
    )
  }
  return { inert: failReasons.length === 0, deltaMutations, deltaLongTaskTotalMs, failReasons }
}
