// src/shared/o0-report.ts — the PURE O-0 report schema + reconciliation helpers.
//
// Contract: docs/specs/unit-o-0-per-stage-measurement.md
//   §2.2 the CLOSED 11-stage id set     §3.1 the 5 closed block names
//   §3.3 the pinned CLI flags           §3.4 the operator corpus + seed
//   §4.2/§4.3 the report + freeze row   §4.4 the DERIVED verdict (never hard-coded)
//   §5 the 6 typed property-register rows (P-IM-1/2, P-SM-1/2, P-TP-1/2)
//   §6 the states S1..S7, the fail-states F1..F10, the throw patterns
//
// The MEASUREMENT runs LIVE (scripts/live-drive.mjs §3); this module validates the
// REPORT SHAPE and its invariants only — the RCA-12 split: a property-green is
// schema-green, never app-green. Every entry point returns a discriminated
// `{ ok, errors, failReasons }` result and NEVER throws on malformed input
// (§6 "throw patterns"): a malformed row is an ok:false with the field path named.
/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// §2.2 / §3.1 / §3.4 / §4.2 — the pinned constants (the report's join keys).
// ---------------------------------------------------------------------------
export const O0_STAGE_IDS: readonly string[] = [
  'snapshot.pull',
  'snapshot.clone',
  'docheads.pull',
  'traversal.build',
  'envelope.assemble',
  'shared.decorate',
  'reconcile.roots',
  'reconcile.apply',
  'render.dom',
  'render.ssr',
  'post.style',
]
export const O0_STAGE_COUNT = O0_STAGE_IDS.length // 11 (§8.1)
export const O0_BLOCK_NAMES: readonly string[] = [
  'o0_folder_row',
  'o0_document_row',
  'o0_gpu_control',
  'o0_track_ablation',
  'o0_repeat_determinism',
]
export const O0_SEED = 'o0-2026-09-17'
export const O0_OPERATOR_DOCUMENTS = 226
export const O0_GESTURE_PATHS: readonly string[] = ['cdp', 'native-fallback', 'missing', 'zero-box', 'off-viewport']
export const O0_ENGINE_STATES: readonly string[] = ['ready', 'absent']
export const O0_ARTIFACT = 'o-0-per-stage-breakdown'
export const O0_SPEC = 'docs/specs/unit-o-0-per-stage-measurement.md'
export const O0_UNIT = 'O-0'
export const O0_LAYER = 'assembled-renderer (RCA-12)'
/** §4.1 — the committed artifact the raw emitted JSON is embedded into. */
export const O0_ARTIFACT_DOC = 'docs/specs/unit-o-0-per-stage-breakdown.md'

export type O0StageSource = 'hook' | 'mark' | 'derived'
export interface O0Stage {
  id: string
  ms: number | null
  unseparated: boolean
  source: O0StageSource
}
export interface O0Result {
  ok: boolean
  errors: string[]
  failReasons: string[]
}

/** §4.3 — the 11-stage skeleton: every id present, nothing measured yet. */
export function buildO0StageSkeleton(): O0Stage[] {
  return O0_STAGE_IDS.map((id) => ({
    id,
    ms: null,
    unseparated: true,
    source: (id === 'post.style' ? 'derived' : 'hook') as O0StageSource,
  }))
}

// ---------------------------------------------------------------------------
// Small shared helpers.
// ---------------------------------------------------------------------------
function isNonNeg(v: any): boolean {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0
}
/** Number rendering for the pinned §4.4 verdict formulas (no trailing zeros). */
function o0Num(v: any): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'null'
  return String(Math.round(v * 100) / 100)
}
function stageList(run: any): any[] {
  return run && typeof run === 'object' && Array.isArray(run.stages) ? run.stages : []
}

// ---------------------------------------------------------------------------
// §2.3 / §5 P-TP-2 — the gesture-path rule: `realInput` is DERIVED (path === 'cdp').
// ---------------------------------------------------------------------------
export function deriveO0GesturePath(path: unknown): { path: string | null; realInput: boolean; pathRuleOk: boolean; known: boolean } {
  const p = typeof path === 'string' ? path : null
  const cdp = p === 'cdp'
  return { path: p, realInput: cdp, pathRuleOk: cdp, known: p !== null && O0_GESTURE_PATHS.includes(p) }
}

// ---------------------------------------------------------------------------
// §2.3 — the PINNED folder-row pick: largest child-row count, ties broken by
// lexicographic `data-folder-path` ascending (the `o0-2026-09-17` seed). It is
// input-order independent — a first-match pick would under-measure the operator
// corpus and make the artifact irreproducible. An empty corpus (S1) has no pick:
// null, never a throw.
// ---------------------------------------------------------------------------
export function pickO0FolderRow(rows: unknown): { folderPath: string; childRowCount: number } | null {
  const list = Array.isArray(rows) ? rows : []
  const candidates = list
    .filter((r: any) => r && typeof r === 'object' && typeof r.folderPath === 'string' && r.folderPath !== '')
    .map((r: any) => ({ folderPath: r.folderPath as string, childRowCount: isNonNeg(r.childRowCount) ? r.childRowCount : 0 }))
  if (candidates.length === 0) return null
  candidates.sort(
    (a, b) => b.childRowCount - a.childRowCount || (a.folderPath < b.folderPath ? -1 : a.folderPath > b.folderPath ? 1 : 0),
  )
  return { ...candidates[0] }
}

// ---------------------------------------------------------------------------
// §6 F4 — the run's `unseparatedStages: [<ids>]` (an ADDITIVE run field).
// ---------------------------------------------------------------------------
export function unseparatedStageIds(run: unknown): string[] {
  return stageList(run)
    .filter((s: any) => s && typeof s === 'object' && s.unseparated === true)
    .map((s: any) => String(s.id))
}

/** §6 F4 — a stage that cannot be separated is emitted `ms:null` + `unseparated:true`,
 *  never imputed. It is reported as a non-gating CANDIDATE so that a `pass:false`
 *  row which names no reason still names its recorded observable (§4.3 fail-loud). */
function o0ImputationCandidates(run: any): string[] {
  return stageList(run)
    .filter((s: any) => s && typeof s === 'object' && s.unseparated === true && typeof s.ms === 'number')
    .map((s: any) => `stage ${String(s.id)} is declared unseparated with a non-null ms ${String(s.ms)} (§6 F4: an unseparated stage is emitted ms:null, never imputed)`)
}

// ---------------------------------------------------------------------------
// §4.3 — the freeze-row validator.
// ---------------------------------------------------------------------------
export function validateO0Run(runInput: unknown, ids: readonly string[] = O0_STAGE_IDS): O0Result & { warnings: string[] } {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  const errors: string[] = []
  const failReasons: string[] = []
  const warnings: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  const id = typeof run.id === 'string' && run.id !== '' ? run.id : '<run>'

  // --- §4.3 required row fields -------------------------------------------
  for (const f of ['id', 'block', 'gesture', 'target', 'path']) {
    if (typeof run[f] !== 'string' || run[f] === '') err(`run ${id}: ${f} missing (§4.3)`)
  }
  if (typeof run.block === 'string' && run.block !== '' && !O0_BLOCK_NAMES.includes(run.block)) {
    err(`run ${id}: block ${run.block} is not one of the closed 5 (${O0_BLOCK_NAMES.join(', ')}) — §3.1`)
  }
  if (typeof run.gesture === 'string' && run.gesture !== '' && !['folder-row', 'document-row'].includes(run.gesture)) {
    err(`run ${id}: gesture ${run.gesture} is not one of folder-row|document-row (§2.3/§4.3)`)
  }

  // --- §2.3 / §6 F7 / §5 P-TP-2: the gesture-path rule ---------------------
  const gesture = deriveO0GesturePath(run.path)
  if (!gesture.known) {
    err(`run ${id}: gesture path ${String(run.path)} is not one of ${O0_GESTURE_PATHS.join('|')} (§2.3)`)
  } else if (gesture.pathRuleOk !== true) {
    err(
      `gesture path ${String(run.path)} (not 'cdp') for ${String(run.target)} — hit=` +
        `${run.hit === undefined || run.hit === null ? 'null' : String(run.hit)} (§6 F7)`,
    )
  }
  if (typeof run.realInput !== 'boolean') {
    err(`run ${id}: realInput is ${String(run.realInput)} (expected a boolean, DERIVED from path === 'cdp' — §4.3)`)
  } else if (gesture.pathRuleOk && run.realInput === false) {
    err(
      `run ${id}: realInput false disagrees with path ${String(run.path)} for ${String(run.target)} — a recorded forgery; ` +
        `realInput is DERIVED: path === 'cdp' (§4.3/§5 P-TP-2)`,
    )
  } else if (!gesture.pathRuleOk && run.realInput === true) {
    err(
      `run ${id}: realInput true disagrees with path ${String(run.path)} for ${String(run.target)} — a recorded forgery; ` +
        `realInput is DERIVED: path === 'cdp' (§4.3/§5 P-TP-2)`,
    )
  }

  // --- §4.3 / §6 F1 / §5 P-IM-2: the stage set is TOTAL --------------------
  const stages = stageList(run)
  if (!Array.isArray(run.stages)) err(`run ${id}: stages is not an array (§4.3)`)
  const rowIds = stages.map((s: any) => (s && typeof s === 'object' ? s.id : undefined))
  const missing = ids.filter((sid) => !rowIds.includes(sid))
  const counts = new Map<string, number>()
  for (const sid of rowIds) if (typeof sid === 'string') counts.set(sid, (counts.get(sid) ?? 0) + 1)
  const duplicated = [...counts.keys()].filter((sid) => (counts.get(sid) ?? 0) > 1)
  const unknown = [...new Set(rowIds.filter((sid) => typeof sid !== 'string' || !ids.includes(sid)))].map(String)
  if (missing.length) {
    err(`stage ${missing.join(', ')} missing from run ${id} (stageCount ${String(run.stageCount)} ≠ ${ids.length}) — §4.3/F1`)
  }
  if (duplicated.length) err(`duplicate stage id ${duplicated.join(', ')} in run ${id} (each stage id appears exactly once — §4.3/F1)`)
  if (unknown.length) err(`unknown stage id ${unknown.join(', ')} in run ${id} (not in the closed §2.2 ${ids.length}-id set — F1)`)
  if (run.stageCount !== ids.length) err(`run ${id}: stageCount ${String(run.stageCount)} ≠ ${ids.length} (stageIds.length — §4.3/F1)`)

  // --- §4.3 / §6 F3 / §5 P-IM-1: stage values ------------------------------
  for (const s of stages) {
    if (!s || typeof s !== 'object') {
      err(`run ${id}: stage entry ${JSON.stringify(s)} is not an object (§4.3)`)
      continue
    }
    const sid = String(s.id)
    const legalValue = (s.ms === null && s.unseparated === true) || isNonNeg(s.ms)
    if (!legalValue) {
      err(`stage ${sid} ms is ${String(s.ms)} (expected a non-negative finite number or null + unseparated:true — §4.3/F3)`)
    }
    if (typeof s.unseparated !== 'boolean') err(`stage ${sid} unseparated is ${String(s.unseparated)} (expected a boolean — §4.3)`)
    if (s.source === 'derived' && sid !== 'post.style') {
      err(`stage ${sid} source=derived (only post.style is derived — a non-derived stage carrying a computed value is an imputation — §2.2/F4)`)
    } else if (!['hook', 'mark', 'derived'].includes(String(s.source))) {
      err(`stage ${sid} source ${String(s.source)} is not one of hook|mark|derived (§4.3)`)
    }
  }

  // --- §4.3 / §6 F3: the counters ------------------------------------------
  for (const f of ['longTaskTotalMs', 'mutations', 'wallMs']) {
    if (!(run[f] === null || isNonNeg(run[f]))) {
      err(`run ${id}: ${f} is ${String(run[f])} (expected a non-negative finite number or null — §4.3/F3)`)
    }
  }
  if (!Array.isArray(run.longTasks)) {
    err(`run ${id}: longTasks is not an array (§4.3)`)
  } else {
    run.longTasks.forEach((e: any, i: number) => {
      if (!e || typeof e !== 'object' || !isNonNeg(e.start) || !isNonNeg(e.duration)) {
        err(`run ${id}: longTasks[${i}] is ${JSON.stringify(e)} (expected {start,duration} non-negative finite numbers — §4.3)`)
      }
    })
  }
  if (typeof run.gpu !== 'boolean') err(`run ${id}: gpu is ${String(run.gpu)} (expected the recorded leg flag — §4.3/S6)`)
  const runIdLower = String(run.id ?? '').toLowerCase()
  if (/gpu-?off/.test(runIdLower) && run.gpu !== false) {
    err(`run ${id}: gpu ${String(run.gpu)} disagrees with the GPU-off leg its id names (§2.4/S6)`)
  }
  if (/gpu-?on/.test(runIdLower) && run.gpu !== true) {
    err(`run ${id}: gpu ${String(run.gpu)} disagrees with the GPU-on leg its id names (§2.4/S6)`)
  }

  // --- §4.3 / §6 F5: the track ablation is recorded, or a documented fail-state
  const ta = run.trackAblation
  if (!ta || typeof ta !== 'object') {
    err(`run ${id}: trackAblation is ${String(ta)} (expected {applied, mutation} — §4.3)`)
  } else {
    if (typeof ta.applied !== 'boolean') err(`run ${id}: trackAblation.applied is ${String(ta.applied)} (expected a boolean — §4.3)`)
    if (ta.mutation !== null && typeof ta.mutation !== 'string') {
      err(`run ${id}: trackAblation.mutation is ${String(ta.mutation)} (expected the exact style mutation or null — §4.3/F5)`)
    } else if (ta.applied === true && (ta.mutation === null || ta.mutation === '')) {
      err(`run ${id}: trackAblation mutation null with applied:true cannot be verified (the exact style mutation must be recorded — §2.4/F5)`)
    }
  }

  // --- §3.6 / §6 F2: the executing bundle identity is mandatory -------------
  if (run.bundleVerified !== true) {
    err(
      `run ${id}: executing bundle ≠ on-disk bundle (bundleVerified ${String(run.bundleVerified)}, served ` +
        `${String(run.build?.served ?? 'unverified')}) — §3.6/F2: the numbers are recorded but NOT accepted`,
    )
  }

  // --- §4.3 fail-loud: pass:false must name its forcing condition -----------
  const recorded = Array.isArray(run.failReasons)
    ? run.failReasons.filter((x: any) => typeof x === 'string' && x !== '')
    : []
  if (run.pass !== true && recorded.length === 0) {
    const candidates = o0ImputationCandidates(run)
    warnings.push(...candidates)
    err(
      `run ${id} records pass:false with no failReasons line (§4.3 fail-loud: a failing row must name its forcing condition)` +
        (candidates.length ? ` — candidate forcing condition(s): ${candidates.join('; ')}` : ''),
    )
  }

  return { ok: errors.length === 0, errors, failReasons, warnings }
}

// ---------------------------------------------------------------------------
// §5 P-SM-2 — the order-/ms-insensitive stage-id SET comparator (the determinism
// oracle: the set is deterministic, the ms values are FREE under the seed).
// ---------------------------------------------------------------------------
export function compareO0StageIdSets(a: unknown, b: unknown): { equal: boolean; aIds: string[]; bIds: string[] } {
  const setOf = (run: any): string[] => {
    const out: string[] = []
    for (const s of stageList(run)) {
      const sid = s && typeof s === 'object' && typeof s.id === 'string' ? s.id : null
      if (sid !== null && !out.includes(sid)) out.push(sid)
    }
    return out.sort()
  }
  const aIds = setOf(a)
  const bIds = setOf(b)
  return { equal: aIds.length === bIds.length && aIds.every((x, i) => x === bIds[i]), aIds, bIds }
}

// ---------------------------------------------------------------------------
// §4.2 / §8.1 — the artifact census derived from the emitted runs.
// ---------------------------------------------------------------------------
/** The control-row id a run is a leg of; the caller dedups: the §8.1 census of a
 *  full 4-block artifact is 4 controls[] rows (gpu-on, gpu-off,
 *  track-ablation-on, track-ablation-off). */
function o0ControlIdForRun(run: any): string | null {
  const id = typeof run?.id === 'string' ? run.id.toLowerCase() : ''
  const applied = run?.trackAblation?.applied === true
  if (/ablation/.test(id)) return /-?on$/.test(id) ? 'track-ablation-on' : 'track-ablation-off'
  if (/gpu-?off/.test(id)) return 'gpu-off'
  if (/gpu-?on/.test(id)) return 'gpu-on'
  if (run?.block === 'o0_track_ablation') return applied ? 'track-ablation-on' : 'track-ablation-off'
  return null
}
export function reconcileO0Census(runsInput: unknown): {
  runCount: number
  controlCount: number
  controlIds: string[]
  runsPerStage: Array<{ id: string; count: number }>
  stageIds: string[]
  complete: boolean
} {
  const runs = Array.isArray(runsInput) ? runsInput : []
  const runsPerStage = O0_STAGE_IDS.map((id) => ({
    id,
    count: runs.filter((r: any) => stageList(r).some((s: any) => s && s.id === id)).length,
  }))
  const controlIds = [...new Set(runs.map(o0ControlIdForRun).filter((x): x is string => x !== null))].sort()
  return {
    runCount: runs.length,
    controlCount: controlIds.length,
    controlIds,
    runsPerStage,
    stageIds: [...O0_STAGE_IDS],
    // §2.2: every stage id appears in EVERY freeze row ("a stage is never omitted").
    complete: runsPerStage.every((r) => r.count === runs.length),
  }
}

// ---------------------------------------------------------------------------
// §5 P-TP-1 — reconciliation + the `post.style` RESIDUAL. The residual is
// COMPUTED from `longTaskTotalMs − Σ(named stages)`, never a timed probe, and any
// unseparated stage makes the reconciliation ok:false (an unmeasured stage cannot
// be reconciled away).
// ---------------------------------------------------------------------------
export function reconcileO0PostStyle(
  runInput: unknown,
  tolerance: unknown,
): O0Result & {
  postStyle: { ms: number | null; timed: false; source: 'derived'; residual: number | null; unseparated: boolean }
  residual: number | null
  sumMs: number
  unseparatedStages: string[]
  toleranceMs: number
} {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  const tol: any = tolerance && typeof tolerance === 'object' ? tolerance : {}
  const toleranceMs = isNonNeg(tol.reconcileMs) ? tol.reconcileMs : 0
  const stages = stageList(run)
  const unseparated = unseparatedStageIds(run)
  const sumMs = stages
    .filter((s: any) => s && typeof s === 'object' && s.unseparated !== true)
    .reduce((acc: number, s: any) => acc + (isNonNeg(s.ms) ? s.ms : 0), 0)
  const total = run.longTaskTotalMs
  const errors: string[] = []
  const failReasons: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  if (unseparated.length) {
    err(
      `unseparated stage(s) ${unseparated.join(', ')} cannot be reconciled ` +
        `(§5 P-TP-1/§6 F4: an unmeasured stage cannot be imputed away)`,
    )
  }
  if (!isNonNeg(total)) {
    err(
      `run ${String(run.id)}: longTaskTotalMs is ${String(total)} (the residual cannot be computed from a ` +
        `non-finite/non-negative total — §4.4/P-TP-1)`,
    )
  }
  const residual = isNonNeg(total) ? total - sumMs : null
  if (residual !== null && (residual < 0 || residual > toleranceMs)) {
    err(
      `longTaskTotalMs ${String(total)} − Σ(named stages) ${String(sumMs)} = residual ${String(residual)} is outside ` +
        `[0, ${String(toleranceMs)}] (tolerance ${String(tol.source ?? 'unrecorded')} — §5 P-TP-1)`,
    )
  }
  return {
    ok: errors.length === 0,
    errors,
    failReasons,
    residual,
    sumMs,
    unseparatedStages: unseparated,
    toleranceMs,
    // §2.2 stage 11 — DERIVED, never a timed probe: `timed:false` is pinned.
    postStyle: {
      ms: residual !== null && residual >= 0 && unseparated.length === 0 ? residual : null,
      timed: false,
      source: 'derived',
      residual,
      unseparated: unseparated.length > 0,
    },
  }
}

// ---------------------------------------------------------------------------
// §5 P-SM-1 / §6 F8 — the census validators.
// ---------------------------------------------------------------------------
export function validateO0Census(
  recordedInput: unknown,
  observedInput: unknown,
  claimedDocuments?: unknown,
): O0Result & { recorded: Record<string, unknown>; recomputed: { documents: unknown; nodes: unknown; edges: unknown } } {
  const recorded: any = recordedInput && typeof recordedInput === 'object' ? recordedInput : {}
  const observed: any = observedInput && typeof observedInput === 'object' ? observedInput : {}
  const errors: string[] = []
  const failReasons: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  for (const f of ['documents', 'nodes', 'edges'] as const) {
    if (recorded[f] !== observed[f]) {
      err(
        `corpus census mismatch: claimed ${f} ${String(recorded[f])} ≠ observed ${String(observed[f])} ` +
          `(nodes ${String(observed.nodes)}, edges ${String(observed.edges)}) — §5 P-SM-1: a disagreement is pass:false`,
      )
    }
  }
  if (claimedDocuments !== undefined && claimedDocuments !== null && recorded.documents !== claimedDocuments) {
    err(
      `corpus census mismatch: claimed ${String(claimedDocuments)} document(s), observed ${String(recorded.documents)} ` +
        `(nodes ${String(observed.nodes)}, edges ${String(observed.edges)}) — §6 F8`,
    )
  }
  return {
    ok: errors.length === 0,
    errors,
    failReasons,
    recorded: { documents: recorded.documents ?? null, nodes: recorded.nodes ?? null, edges: recorded.edges ?? null },
    // The census recomputed from the frozen payload fixture (the live read's own count).
    recomputed: { documents: observed.documents ?? null, nodes: observed.nodes ?? null, edges: observed.edges ?? null },
  }
}

/** §6 S2/S3 + F8 — the census GATE (a state verdict, never a schema error): only
 *  the claimed operator corpus may yield an O-0 pass. */
export function deriveO0CensusVerdict(
  censusInput: unknown,
  claimedDocuments: unknown,
): { pass: boolean; verdict: string; observed: { documents: unknown; nodes: unknown; edges: unknown }; claimed: unknown } {
  const census: any = censusInput && typeof censusInput === 'object' ? censusInput : {}
  const documents = census.documents ?? null
  const claimed = claimedDocuments ?? null
  const pass = claimed !== null && documents === claimed && isNonNeg(documents) && documents > 0
  return {
    pass,
    verdict: pass
      ? `the observed corpus census (${String(documents)} documents / ${String(census.nodes)} nodes / ${String(census.edges)} edges) matches the claimed operator corpus`
      : `corpus census mismatch: claimed ${String(claimed)} document(s), observed ${String(documents)} ` +
        `(nodes ${String(census.nodes)}, edges ${String(census.edges)}) — an empty/seed corpus can never yield an O-0 pass (§6 S1/S2/F8)`,
    observed: { documents, nodes: census.nodes ?? null, edges: census.edges ?? null },
    claimed,
  }
}

// ---------------------------------------------------------------------------
// §4.4 — the DERIVED verdicts (never asserted true, never hard-coded).
// ---------------------------------------------------------------------------
export function deriveO0StageVerdict(runInput: unknown): {
  ok: boolean
  verdict: string
  largestStageId: string | null
  ms: number | null
  totalMs: number | null
  pct: number | null
} {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  const identified = stageList(run).filter(
    (s: any) => s && typeof s === 'object' && s.id !== 'post.style' && s.unseparated !== true && isNonNeg(s.ms),
  )
  let largest: any = null
  for (const s of identified) if (largest === null || s.ms > largest.ms) largest = s // spec order wins a tie
  const totalMs = isNonNeg(run.longTaskTotalMs) ? run.longTaskTotalMs : null
  const ms = largest ? largest.ms : null
  const pct = ms !== null && totalMs !== null && totalMs > 0 ? Math.round((ms / totalMs) * 10000) / 100 : null
  const gestureName = typeof run.gesture === 'string' && run.gesture !== '' ? run.gesture : '<gesture>'
  // §4.4/F7 — the truth stays visible in failure: a row whose gesture path was not
  // proven (path !== 'cdp', OR a realInput that disagrees with it) still gets its
  // derived verdict, with the recorded path NAMED.
  const hitTested = deriveO0GesturePath(run.path).pathRuleOk && run.realInput === true
  const fallback = hitTested
    ? ''
    : ` — gesture path ${String(run.path)} with realInput ${String(run.realInput)}: the row is not hit-tested evidence (§6 F7)`
  const verdict = largest
    ? `stage ${String(largest.id)} is ${o0Num(ms)} ms of the ${o0Num(totalMs)} ms long task (${o0Num(pct)}%) on ` +
      `${gestureName} — ${String(largest.id)} is the largest identified stage${fallback}`
    : `stage <none> is null ms of the ${o0Num(totalMs)} ms long task (null%) on ${gestureName} — no identified stage${fallback}`
  return { ok: true, verdict, largestStageId: largest ? String(largest.id) : null, ms, totalMs, pct }
}

/** §4.4 + A-4 — the whole-store `IPC_RAG_SNAPSHOT` discriminator: how many
 *  whole-store reads the gesture performed, and their total ms. A zero-ms
 *  `snapshot.pull` is the recorded A-4 proof (no non-zero read); an
 *  `unseparated` one is NOT a counted read. */
export function deriveO0SnapshotVerdict(
  runInput: unknown,
  censusInput: unknown,
): { ok: boolean; verdict: string; readCount: number; readMs: number; stageSeparated: boolean } {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  const census: any = censusInput && typeof censusInput === 'object' ? censusInput : {}
  const snapshots = stageList(run).filter((s: any) => s && typeof s === 'object' && s.id === 'snapshot.pull')
  const reads = snapshots.filter((s: any) => s.unseparated !== true && isNonNeg(s.ms) && s.ms > 0)
  const readCount = reads.length
  const readMs = reads.reduce((acc: number, s: any) => acc + s.ms, 0)
  const gestureName = typeof run.gesture === 'string' && run.gesture !== '' ? run.gesture : '<gesture>'
  const verdict =
    `the ${gestureName} performed ${readCount} whole-store IPC_RAG_SNAPSHOT read(s) totalling ${o0Num(readMs)} ms ` +
    `(census ${o0Num(census.documents)} docs / ${o0Num(census.nodes)} nodes / ${o0Num(census.edges)} edges)`
  return { ok: true, verdict, readCount, readMs, stageSeparated: snapshots.some((s: any) => s.unseparated !== true) }
}

/** §4.4 — the per-row verdict pair, or the pinned schema-error verdict when a
 *  required field is absent (`O-0 REPORT INVALID: <field> missing` + pass:false). */
export function deriveO0Verdicts(
  runInput: unknown,
  censusInput: unknown,
): { ok: boolean; verdicts: string[]; errors?: string[]; failReasons?: string[] } {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  for (const f of ['gesture', 'path', 'id', 'block', 'target', 'stages', 'longTaskTotalMs']) {
    const v = run[f]
    if (v === undefined || v === null || v === '') {
      const m = `O-0 REPORT INVALID: ${f} missing`
      return { ok: false, verdicts: [m], errors: [m], failReasons: [m] }
    }
  }
  const stageVerdict = deriveO0StageVerdict(run)
  const snapshotVerdict = deriveO0SnapshotVerdict(run, censusInput)
  return { ok: true, verdicts: [stageVerdict.verdict, snapshotVerdict.verdict] }
}

// ---------------------------------------------------------------------------
// §4.2 / §6 F9 — the run-SET + controls[] validator (the paired control runs).
// ---------------------------------------------------------------------------
function o0IsComparisonLeg(run: any): boolean {
  if (!run || typeof run !== 'object') return false
  if (run.gpu === true) return true
  if (run.block === 'o0_track_ablation') return true
  if (run.block === 'o0_gpu_control') return true
  return /gpu-?(?:on|off)|ablation/i.test(String(run.id ?? ''))
}

function o0CheckControls(
  runs: any[],
  controlsInput: unknown,
  ctx: { crossArtifactControlPairs?: unknown },
): { errors: string[]; failReasons: string[]; notes: string[] } {
  const controls = Array.isArray(controlsInput) ? (controlsInput as any[]) : []
  const errors: string[] = []
  const failReasons: string[] = []
  const notes: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  const byId = new Map<any, any>()
  for (const r of runs) if (r && typeof r === 'object' && typeof r.id === 'string') byId.set(r.id, r)
  const crossPairs = Array.isArray(ctx.crossArtifactControlPairs) ? (ctx.crossArtifactControlPairs as any[]) : []
  for (const c of controls) {
    if (!c || typeof c !== 'object' || typeof c.id !== 'string' || c.id === '') {
      err(`a controls[] entry ${JSON.stringify(c)} carries no control id (§4.2/§8.1)`)
      continue
    }
    const cross = c.pairedWithStatus === 'cross-artifact' || crossPairs.includes(c.id)
    const target = typeof c.runRef === 'string' ? byId.get(c.runRef) : undefined
    if (typeof c.runRef !== 'string' || c.runRef === '') err(`control ${c.id}: runRef missing (§4.2)`)
    else if (!target) err(`control ${c.id} references run ${c.runRef} which is not in runs[] (§4.2/F9)`)
    if (typeof c.pairedWith !== 'string' || c.pairedWith === '') {
      err(`control ${c.id}: pairedWith missing — a comparison row emitted without its paired counterpart (§4.2/F9)`)
      continue
    }
    if (c.pairedWith === c.runRef) {
      err(`control ${c.id} pairs run ${c.runRef} with itself (§4.2/F9)`)
    } else if (!byId.get(c.pairedWith)) {
      if (cross) {
        notes.push(
          `control ${c.id} is paired CROSS-ARTIFACT with run ${c.pairedWith} (the counterpart leg's freeze row is emitted ` +
            `by the paired invocation — the pairing is verified only in the merged §4.2 report)`,
        )
      } else {
        err(
          `control ${c.id} is paired with run ${c.pairedWith} which is not in runs[] — a comparison row emitted without ` +
            `its paired ${c.id} control row (§6 F9)`,
        )
      }
    } else if (!cross && !controls.some((x) => x && x.runRef === c.pairedWith && x.pairedWith === c.runRef)) {
      err(`control ${c.id} pairing is not reciprocal: no control row pairs run ${c.pairedWith} back to ${c.runRef} (§6 F9)`)
    }
    // The control's dimension must agree with the run it names (§2.4/S6/S7).
    if (target) {
      const applied = target.trackAblation?.applied
      if (c.id === 'gpu-on' && target.gpu !== true) err(`control gpu-on names run ${c.runRef} with gpu=${String(target.gpu)} (§2.4/S6)`)
      if (c.id === 'gpu-off' && target.gpu !== false) err(`control gpu-off names run ${c.runRef} with gpu=${String(target.gpu)} (§2.4/S6)`)
      if (c.id === 'track-ablation-on' && applied !== true) {
        err(`control track-ablation-on names run ${c.runRef} with trackAblation.applied=${String(applied)} (§2.4/S7)`)
      }
      if (c.id === 'track-ablation-off' && applied === true) {
        err(`control track-ablation-off names run ${c.runRef} with trackAblation.applied=true (§2.4/S7)`)
      }
    }
  }
  // §6 F9 totality: every comparison leg carries its control row. A leg's
  // non-primary rows are covered by the leg's control row (`legRuns`).
  for (const r of runs) {
    if (!o0IsComparisonLeg(r)) continue
    const covered = controls.some(
      (c) => c && (c.runRef === r.id || (Array.isArray(c.legRuns) && c.legRuns.includes(r.id))),
    )
    if (!covered) {
      err(
        `comparison row ${String(r.id)} (block ${String(r.block)}, gpu ${String(r.gpu)}) emitted without its paired control ` +
          `row — §6 F9: a comparison run is never emitted unpaired`,
      )
    }
  }
  // Paired runs must differ ONLY in the controlled dimension (§6 F9).
  const seen = new Set<string>()
  for (const c of controls) {
    if (!c || typeof c !== 'object' || typeof c.runRef !== 'string' || typeof c.pairedWith !== 'string') continue
    const a = byId.get(c.runRef)
    const b = byId.get(c.pairedWith)
    if (!a || !b || a === b) continue
    const key = [c.runRef, c.pairedWith].sort().join('|')
    if (seen.has(key)) continue
    seen.add(key)
    const dims: Array<[string, unknown, unknown]> = [
      [
        'gesture target',
        `${String(a.gesture)}|${String(a.target)}|${String(a.folderPath ?? '')}|${String(a.documentId ?? '')}`,
        `${String(b.gesture)}|${String(b.target)}|${String(b.folderPath ?? '')}|${String(b.documentId ?? '')}`,
      ],
      ['pane census', a.paneFrames ?? null, b.paneFrames ?? null],
    ]
    for (const [dim, av, bv] of dims) {
      if (av !== bv) {
        err(`paired runs differ in ${dim}: run ${String(a.id)} ${JSON.stringify(av)} vs run ${String(b.id)} ${JSON.stringify(bv)} (§6 F9)`)
      }
    }
    if (/^gpu-/.test(String(c.id)) && a.gpu === b.gpu) {
      err(`paired runs carry the SAME gpu flag (${String(a.gpu)}) — the GPU control is vacuous (§2.4/S6)`)
    }
    if (/^track-ablation-/.test(String(c.id)) && a.trackAblation?.applied === b.trackAblation?.applied) {
      err(`paired runs carry the SAME trackAblation.applied (${String(a.trackAblation?.applied)}) — the ablation is vacuous (§2.4/S7)`)
    }
  }
  return { errors, failReasons, notes }
}

export function validateO0Reports(runsInput: unknown, opts: any = {}): O0Result & { notes: string[]; runs: unknown[] } {
  const runs = Array.isArray(runsInput) ? (runsInput as any[]) : []
  const ids = Array.isArray(opts.ids) && opts.ids.length ? (opts.ids as string[]) : O0_STAGE_IDS
  const errors: string[] = []
  const failReasons: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  if (!Array.isArray(runsInput) || runs.length === 0) err('validateO0Reports requires a non-empty runs[] set (§4.2)')
  if (!opts.tolerance || typeof opts.tolerance !== 'object' || !isNonNeg(opts.tolerance.reconcileMs)) {
    err('tolerance.reconcileMs is required for the paired-run reconciliation (§4.2/P-TP-1)')
  }
  runs.forEach((r, i) => {
    const v = validateO0Run(r, ids)
    for (const e of v.errors) errors.push(`runs[${i}]: ${e}`)
    for (const e of v.failReasons) failReasons.push(`runs[${i}]: ${e}`)
  })
  const ctl = o0CheckControls(runs, opts.controls, { crossArtifactControlPairs: opts.crossArtifactControlPairs })
  errors.push(...ctl.errors)
  failReasons.push(...ctl.failReasons)
  return { ok: errors.length === 0 && failReasons.length === 0, errors, failReasons, notes: ctl.notes, runs }
}

// ---------------------------------------------------------------------------
// §4.2 / §6 F10 — the top-level report validator.
// ---------------------------------------------------------------------------
export function validateO0Report(repInput: unknown): O0Result & { verdicts: string[]; notes: string[] } {
  const rep: any = repInput && typeof repInput === 'object' ? repInput : {}
  const errors: string[] = []
  const failReasons: string[] = []
  const verdicts: string[] = []
  const notes: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  const invalid = (field: string) => {
    const m = `O-0 REPORT INVALID: ${field} missing`
    errors.push(m)
    failReasons.push(m)
    verdicts.push(m)
  }

  // --- §6 F10: the required top-level fields -------------------------------
  const REQUIRED = [
    'artifact', 'spec', 'unit', 'date', 'layer', 'commands', 'driver', 'tolerance',
    'corpus', 'env', 'stageIds', 'runs', 'controls', 'verdicts', 'pass',
  ]
  for (const f of REQUIRED) if (rep[f] === undefined || rep[f] === null) invalid(f)

  // --- §4.2: the pinned identity constants --------------------------------
  for (const [f, want] of [
    ['artifact', O0_ARTIFACT],
    ['spec', O0_SPEC],
    ['unit', O0_UNIT],
    ['layer', O0_LAYER],
  ] as const) {
    if (rep[f] !== want) err(`${f} is ${JSON.stringify(rep[f])} (pinned: ${JSON.stringify(want)} — §4.2)`)
  }
  if (typeof rep.date !== 'string' || rep.date === '') err('date must be the recorded YYYY-MM-DD run date (§4.2)')
  if (!Array.isArray(rep.commands) || rep.commands.length === 0) err('commands must record the exact §3.5 run command(s) used (§4.2)')
  if (!Array.isArray(rep.verdicts) || rep.verdicts.length === 0) err('verdicts must be a non-empty array of the DERIVED verdicts (§4.2/§4.4)')
  if (rep.pass !== true && rep.pass !== false) err(`pass is ${String(rep.pass)} (expected a boolean — §4.2)`)

  // --- §2.2: stageIds is the closed 11-id set ------------------------------
  const stageIds = Array.isArray(rep.stageIds) ? (rep.stageIds as string[]) : []
  if (!Array.isArray(rep.stageIds) || rep.stageIds.length !== O0_STAGE_COUNT) {
    err(`stageIds must be the closed §2.2 set of ${O0_STAGE_COUNT} ids (got ${JSON.stringify(rep.stageIds)})`)
  } else {
    const missing = O0_STAGE_IDS.filter((id) => !stageIds.includes(id))
    const extra = stageIds.filter((id) => !O0_STAGE_IDS.includes(id))
    if (missing.length || extra.length) err(`stageIds is not the closed §2.2 set: missing ${missing.join(', ')} extra ${extra.join(', ')}`)
  }

  // --- §3.5/§3.6: the driver provenance + the mandatory bundle identity (F2) --
  const drv = rep.driver
  if (!drv || typeof drv !== 'object') {
    err('driver missing (§4.2)')
  } else {
    const build = drv.build
    if (!build || typeof build !== 'object') {
      err('driver.build missing (§3.6: the executing bundle identity is mandatory)')
    } else {
      for (const f of ['renderer', 'main', 'served']) {
        if (typeof build[f] !== 'string' || build[f] === '') err(`driver.build.${f} missing (§3.6)`)
      }
      if (build.verified !== true) {
        err(
          `driver.build.verified is ${String(build.verified)} — executing bundle ≠ on-disk bundle (renderer/served ` +
            `${String(build.served)}) — §3.6/F2: the numbers are recorded but NOT accepted`,
        )
      }
    }
    if (typeof drv.gpuFlag !== 'boolean') err(`driver.gpuFlag is ${String(drv.gpuFlag)} (the flag actually used must be recorded — §2.4/S6)`)
    if (!Array.isArray(drv.cliArgs)) err('driver.cliArgs must record the exact arguments used (§3.5)')
    if (typeof drv.runMode !== 'string' || drv.runMode === '') err('driver.runMode missing (§3.5)')
  }

  // --- §4.2/P-TP-1: the tolerance -----------------------------------------
  const tol = rep.tolerance
  if (!tol || typeof tol !== 'object' || !isNonNeg(tol.reconcileMs) || typeof tol.source !== 'string' || tol.source === '') {
    err('tolerance.reconcileMs + tolerance.source are required (§4.2/§5 P-TP-1)')
  }

  // --- §3.4/§6 F8: the corpus census --------------------------------------
  const corpus = rep.corpus
  if (!corpus || typeof corpus !== 'object') {
    err('corpus missing (§4.2)')
  } else {
    for (const f of ['documents', 'nodes', 'edges']) {
      if (!isNonNeg(corpus[f])) err(`corpus.${f} is ${String(corpus[f])} (expected a non-negative finite number — §4.2)`)
    }
    if (corpus.seed !== O0_SEED) {
      err(`corpus.seed is ${JSON.stringify(corpus.seed)} (the RECORDED constant ${JSON.stringify(O0_SEED)}, not a random value — §3.4)`)
    }
    const claimed = isNonNeg(corpus.claimedDocuments) ? corpus.claimedDocuments : O0_OPERATOR_DOCUMENTS
    if (isNonNeg(corpus.documents) && corpus.documents !== claimed) {
      err(
        `corpus census mismatch: claimed ${String(claimed)} document(s), observed ${String(corpus.documents)} ` +
          `(§6 F8: the quantitative claim must be at operator size)`,
      )
    }
  }

  // --- §6 S4/S5/S6: the env ------------------------------------------------
  const env = rep.env
  if (!env || typeof env !== 'object') {
    err('env missing (§4.2)')
  } else {
    if (!O0_ENGINE_STATES.includes(env.engine)) {
      err(`env.engine ${JSON.stringify(env.engine)} is not one of ${O0_ENGINE_STATES.join('|')} (§4.2/S4) — engine-absence is NOT a forcing condition`)
    }
    if (typeof env.gpu !== 'boolean') err('env.gpu missing (§4.2/S6)')
    else if (drv && typeof drv.gpuFlag === 'boolean' && env.gpu !== drv.gpuFlag) {
      err(`env.gpu ${String(env.gpu)} disagrees with driver.gpuFlag ${String(drv.gpuFlag)} (§2.4/S6: the recorded leg must be the flag the driver passed)`)
    }
    if (!isNonNeg(env.paneFrames)) err(`env.paneFrames is ${String(env.paneFrames)} (the pane-set census must be recorded — §4.2/S5)`)
    if (typeof env.mode !== 'string' || env.mode === '') err('env.mode missing (§4.2)')
  }

  // --- §4.3: every freeze row ----------------------------------------------
  const runs = Array.isArray(rep.runs) ? (rep.runs as any[]) : []
  if (!Array.isArray(rep.runs) || runs.length === 0) err('runs must be a non-empty array of §4.3 freeze rows (§4.2)')
  const validateIds = Array.isArray(rep.stageIds) && rep.stageIds.length === O0_STAGE_COUNT ? stageIds : O0_STAGE_IDS
  runs.forEach((r, i) => {
    const v = validateO0Run(r, validateIds)
    for (const e of v.errors) errors.push(`runs[${i}]: ${e}`)
    for (const e of v.failReasons) failReasons.push(`runs[${i}]: ${e}`)
    // A freeze row that fails its OWN falsifiability requirements cannot be part
    // of a passing report — the row's verdict is propagated, never absorbed.
    if (r && typeof r === 'object' && r.pass === false) {
      err(
        `run ${String(r?.id ?? `runs[${i}]`)} recorded pass:false (${Array.isArray(r.failReasons) ? r.failReasons.length : 0} ` +
          `failReasons line(s)) — a failing freeze row cannot be part of a passing report (§4.3 fail-loud)`,
      )
    }
  })

  // --- §6 F9: the controls[] pairing ---------------------------------------
  const ctl = o0CheckControls(runs, rep.controls, {
    crossArtifactControlPairs: Array.isArray(drv?.crossArtifactControlPairs) ? drv.crossArtifactControlPairs : [],
  })
  errors.push(...ctl.errors)
  failReasons.push(...ctl.failReasons)
  notes.push(...ctl.notes)

  // --- §4.4: the DERIVED verdicts ------------------------------------------
  const censusTriplet =
    corpus && typeof corpus === 'object' ? { documents: corpus.documents, nodes: corpus.nodes, edges: corpus.edges } : {}
  for (const r of runs) {
    for (const v of deriveO0Verdicts(r, censusTriplet).verdicts) verdicts.push(v)
  }
  // --- §5 P-TP-1: the residual reconciliation is RECORDED per freeze row but is
  // NOT a report-level forcing condition: §5 P-TP-1 is its own row
  // (`reconcileO0PostStyle`) and §6 F4 pins that an unseparated stage is "NOT a
  // schema error" — the row stays ok:true and the residual is reported as a note.
  if (tol && typeof tol === 'object') {
    for (const r of runs) {
      const rec = reconcileO0PostStyle(r, tol)
      notes.push(
        `run ${String(r?.id)}: post.style residual ${rec.postStyle.ms === null ? 'null' : String(rec.postStyle.ms)} ms ` +
          `(Σ named stages ${String(rec.sumMs)} of ${String(r?.longTaskTotalMs)} ms; reconciliation ${rec.ok ? 'ok' : 'FAILED'})` +
          (rec.unseparatedStages.length ? ` — unseparated: [${rec.unseparatedStages.join(', ')}]` : ''),
      )
      for (const m of rec.failReasons) notes.push(`run ${String(r?.id)}: ${m}`)
      // §6 F4 — an unmeasured stage cannot be reconciled away, so a row that
      // reports an unseparated stage makes the REPORT a fail-state (the residual
      // band itself stays a recorded outcome, never a report-level forcing
      // condition: §5 P-TP-1 is its own row).
      if (rec.unseparatedStages.length) {
        err(
          `run ${String(r?.id)}: unseparated stage(s) ${rec.unseparatedStages.join(', ')} cannot be reconciled ` +
            `(§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)`,
        )
      }
    }
  }
  if (rep.pass === false && failReasons.length === 0) {
    err('the report records pass:false with no forcing reason (§4.3 fail-loud)')
  }
  if (rep.pass === true && failReasons.length > 0) {
    failReasons.push(
      `the report records pass:true but the harness derived ${failReasons.length} forcing condition(s) — a verdict is ` +
        `NEVER asserted true (§4.4/D-GP-UFA-3)`,
    )
  }
  return { ok: errors.length === 0 && failReasons.length === 0, errors, failReasons, verdicts, notes }
}
