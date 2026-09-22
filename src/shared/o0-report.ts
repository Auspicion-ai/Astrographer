// src/shared/o0-report.ts — the PURE O-0 report schema + reconciliation helpers.
//
// Contract: docs/specs/unit-o-0-per-stage-measurement.md
//   §2.2 the CLOSED 11-stage id set     §3.1 the 5 closed block names
//   §3.3 the pinned CLI flags           §3.4 the operator corpus + seed
//   §4.2/§4.3 the report + freeze row   §4.4 the DERIVED verdict (never hard-coded)
//   §3.6b the seam re-derivation (the caller-level round trip, the two recorder
//         instances, the A-4 read count that stays UNMEASURED)
//   §4.3 H3 the WINDOW BOUND + the armed-window rule + the structural marker
//   §5 the typed property-register rows (P-IM-1/2, P-SM-1/2, P-TP-1/2 + P-TP-3)
//   §6 the states S1..S7 + S14..S17, the fail-states F1..F10 + F13/F13a/F14..F17
//
// The MEASUREMENT runs LIVE (scripts/live-drive.mjs §3); this module validates the
// REPORT SHAPE and its invariants only — the RCA-12 split: a property-green is
// schema-green, never app-green. Every entry point returns a discriminated
// `{ ok, errors, failReasons }` result and NEVER throws on malformed input
// (§6 "throw patterns"): a malformed row is an ok:false with the field path named.
/* eslint-disable @typescript-eslint/no-explicit-any */
// NOTE (F16 discipline): this module has NO imports — the driver loads it as a `.ts`
// twin through node's type-stripping (an import specifier cannot be resolved there),
// and the two values it needs from §3.6 are derived from THIS module's own closed
// §2.2 id set / written as literals rather than imported (a duplicated LIST would be
// the drift surface §3.6b/F16 removes).

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
/** §2.2/§3.6b (RUL-1) — the ids a page-side `arm()` may request: every closed §2.2
 *  id EXCEPT `snapshot.clone` (the MAIN instance's, §6 F14's double-record guard) and
 *  `post.style` (DERIVED, never armable). Derived from the closed set itself. */
const O0_PAGE_ARMABLE_STAGES: readonly string[] = O0_STAGE_IDS.filter((id) => id !== 'snapshot.clone' && id !== 'post.style')
/** §3.6 — the mark prefix (`O0_HOOK_MARK_PREFIX` in `src/shared/o0-hook.ts`); the
 *  §6 F19 reason NAMES the mark, so the literal is pinned here too. */
const O0_MARK_PREFIX = 'o0:'
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
/** §4.3 H3 / §3.6 — the RECORDED hook band the window bound is judged against
 *  (the same 40 ms band as `O0_HOOK_LONGTASK_TOLERANCE_MS` / §5 P-TP-3's default). */
export const O0_WINDOW_TOLERANCE_MS = 40

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
// §6 F4 / §3a finding 4 — the run's `unseparatedStages: [<ids>]` (an ADDITIVE run
// field). A non-string / absent id is NEVER coerced (`String(undefined)` leaked a
// literal `'undefined'` phantom stage id into the report AND into the derived
// verdict's "largest identified stage"): such an entry is named by its INDEX by
// `validateO0Run` instead (§4.3/F13).
// ---------------------------------------------------------------------------
export function unseparatedStageIds(run: unknown): string[] {
  return stageList(run)
    .filter((s: any) => s && typeof s === 'object' && s.unseparated === true && typeof s.id === 'string' && s.id !== '')
    .map((s: any) => s.id as string)
}
/** §4.3/§6 S14 (RUL-4) — the STRUCTURAL subset: a stage that cannot be separated
 *  **by construction** (no seam exists in the executing bundle), distinct from a
 *  stage that is merely unmeasured in this run (a seam exists but was not armed).
 *  A structural row records `structural:true` + a `structuralReason`; it is a
 *  recorded GAP of the harness, never a falsifiability failure — so it does not
 *  force `pass:false` (§6 S14/F14, RUL-4). A merely-unmeasured stage still does. */
export function structuralStageIds(run: unknown): string[] {
  return stageList(run)
    .filter(
      (s: any) =>
        s && typeof s === 'object' && s.unseparated === true && s.structural === true && typeof s.id === 'string' && s.id !== '',
    )
    .map((s: any) => s.id as string)
}
/** §4.3 H3 — the window bound is judged against the row's RECORDED armed interval
 *  (`hook.armWindow` + the freeze it belongs to): a row that records no hook
 *  window carries no recorded band, so only §6 F3's finiteness rule applies to its
 *  stage values (the §5 P-IM-1 rows carry no hook block). */
function o0WindowRecorded(run: any): boolean {
  const h = run && typeof run === 'object' ? run.hook : null
  return !!h && typeof h === 'object' && !!h.armWindow && typeof h.armWindow === 'object' && !!h.freezeWindow && typeof h.freezeWindow === 'object'
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
export function validateO0Run(
  runInput: unknown,
  ids: readonly string[] = O0_STAGE_IDS,
): O0Result & { structuralReasons: string[]; derivedReasons: string[]; warnings: string[] } {
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
  const unknown = [...new Set(rowIds.filter((sid) => typeof sid === 'string' && !ids.includes(sid)))] as string[]
  if (missing.length) {
    err(`stage ${missing.join(', ')} missing from run ${id} (stageCount ${String(run.stageCount)} ≠ ${ids.length}) — §4.3/F1`)
  }
  if (duplicated.length) err(`duplicate stage id ${duplicated.join(', ')} in run ${id} (each stage id appears exactly once — §4.3/F1)`)
  if (unknown.length) err(`unknown stage id ${unknown.join(', ')} in run ${id} (not in the closed §2.2 ${ids.length}-id set — F1)`)
  if (run.stageCount !== ids.length) err(`run ${id}: stageCount ${String(run.stageCount)} ≠ ${ids.length} (stageIds.length — §4.3/F1)`)

  // --- §4.3 / §6 F3 / §5 P-IM-1: stage entries + values ---------------------
  // An entry the row cannot use is named by its INDEX (`stages[<i>]`), never
  // through a coerced stage id: the §4.4 falsifiability counterexample ("delete
  // one `stages[]` entry") must be constructible from the reason alone (§3a finding 2).
  for (let i = 0; i < stages.length; i++) {
    const s: any = stages[i]
    if (!s || typeof s !== 'object' || typeof s.id !== 'string' || s.id === '') {
      err(
        `run ${id}: stages[${i}] is ${JSON.stringify(s) ?? String(s)} — a stages[] entry must be an object carrying the stage id ` +
          `it measures (§4.3/F13: named by index, never a coerced stage id)`,
      )
      continue
    }
    const sid = s.id as string
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

  // --- §4.3/R-2 — the PRIMARY ORACLE is required; the secondary counters are not
  if (!isNonNeg(run.longTaskTotalMs)) {
    err(
      `run ${id}: longTaskTotalMs is ${String(run.longTaskTotalMs)} (the primary oracle must be a non-negative finite number — ` +
        `§4.3/R-2: a total that cannot be computed from a measured value is a report-invalid measurement, never a tolerated null)`,
    )
  }
  for (const f of ['mutations', 'wallMs']) {
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

  // --- §4.3 H3 / §6 F13a — the WINDOW BOUND, judged on the row's RECORDED window
  // AND its RECORDED band (`hook.toleranceMs`, §3.6 default 40 ms when absent —
  // P-TP-3(a): the row field is the ONE band source, so this validator, the oracle
  // and `deriveO0StageVerdict` can never judge three different tolerances).
  if (o0WindowRecorded(run)) {
    const wb = deriveO0WindowBound(run)
    for (const m of wb.failReasons) err(m)
  }

  // --- §3.6b/S14 — the two recorder instances: ONE stage, ONE measurement source
  const stageRecords: any[] = Array.isArray(run.hook?.stageRecords) ? run.hook.stageRecords : []
  const instancesByStage = new Map<string, string[]>()
  for (const rec of stageRecords) {
    if (!rec || typeof rec !== 'object' || typeof rec.stage !== 'string') continue
    const inst = typeof rec.instance === 'string' ? rec.instance : '<unrecorded>'
    const seen = instancesByStage.get(rec.stage) ?? []
    if (!seen.includes(inst)) seen.push(inst)
    instancesByStage.set(rec.stage, seen)
  }
  for (const [stage, instances] of instancesByStage) {
    if (instances.length > 1) {
      err(
        `stage ${stage} recorded by two instances (${instances.join(', ')}) in one freeze window — §6 S14/F14: one stage, ` +
          `one measurement source`,
      )
    }
  }

  // --- §4.3/§6 S14 — a stage that cannot be separated: STRUCTURAL (no seam exists
  // in the executing bundle) vs merely UNMEASURED (the seam exists but was not
  // armed). Both are REPORTED (never imputed); neither is a schema error (§6 F4).
  // RUL-4 — the two classes are also SEPARATED in the RESULT: the structural lines
  // are recorded (in `failReasons`, so every reader sees them) AND listed in
  // `structuralReasons`, the subset that a report must NOT gate on. A merely
  // unmeasured stage stays a report-level forcing condition.
  const structuralReasons: string[] = []
  const derivedReasons: string[] = []
  for (const s of stages) {
    if (!s || typeof s !== 'object' || s.unseparated !== true || typeof s.id !== 'string' || s.id === '') continue
    if (s.structural === true) {
      const reason = typeof s.structuralReason === 'string' && s.structuralReason !== '' ? s.structuralReason : 'the seam does not exist in the executing bundle'
      const line =
        `stage ${s.id} is structurally unseparated — ${reason} (§6 S14: NO seam exists in the executing bundle, distinct from a ` +
        `seam that merely was not armed)`
      structuralReasons.push(line)
      failReasons.push(line)
    } else if (s.id === 'post.style' || s.source === 'derived') {
      // §2.2 id 11 (RUL-4/RUL-5-L12) — `post.style` is the DERIVED residual: it has
      // no seam to arm, so an unseparated `post.style` is a COMPUTED consequence of
      // the stages above (it cannot exist while any of them is unseparated), recorded
      // and non-gating — never confused with a seam that merely was not armed.
      const line =
        `stage ${s.id} is unseparated as the DERIVED residual (§2.2 id 11: post.style is COMPUTED from ` +
        `longTaskTotalMs − Σ(named stages), never a timed probe) — it cannot be separated while any stage above is ` +
        `unseparated (recorded, non-gating — §5 P-TP-1/RUL-4)`
      derivedReasons.push(line)
      failReasons.push(line)
    } else {
      failReasons.push(
        `stage ${s.id} is unmeasured in this run (the seam exists but the recorder was not armed for it — §4.3/§6 S14: this is ` +
          `NOT a structural absence of the seam)`,
      )
    }
  }

  // --- §4.3/RUL-4 clause 2 / §6 F18 — the `structural` MARKER may not be abused.
  // It is legal IFF the stage is `unseparated:true` AND carries a non-empty
  // `structuralReason`. `post.style` is the DERIVED residual and is never
  // structural; a SEPARATED stage carrying the marker is a contradiction; and a
  // marker on a stage whose permitted seam the row RECORDS as armed
  // (`hook.rendererArmed:true` ⇒ the executing bundle carries the page-armable
  // seams) is a merely-UNMEASURED stage mislabeled as structural.
  const pageArmable = O0_PAGE_ARMABLE_STAGES
  const rendererArmed = run.hook && typeof run.hook === 'object' && run.hook.rendererArmed === true
  for (let i = 0; i < stages.length; i++) {
    const s: any = stages[i]
    if (!s || typeof s !== 'object' || s.structural !== true) continue
    const sid = typeof s.id === 'string' && s.id !== '' ? s.id : `stages[${i}]`
    if (s.unseparated !== true) {
      err(`stage ${sid} records structural:true while it is separated (ms ${String(s.ms)}) — §4.3/RUL-4: the marker describes an unmeasurable stage, never a measured one`)
      continue
    }
    if (typeof s.structuralReason !== 'string' || s.structuralReason === '') {
      err(`stage ${sid} records structural:true with no structuralReason — an unseparated stage must name the missing seam/transport (§4.3/RUL-4)`)
      continue
    }
    if (sid === 'post.style') {
      err(`stage post.style records structural:true — post.style is the DERIVED residual and is never structural (§4.3/RUL-4)`)
      continue
    }
    if (rendererArmed && pageArmable.includes(sid)) {
      err(
        `stage ${sid} records structural:true although its permitted seam (§2.2's closed ten) exists in the executing bundle and ` +
          `was merely not armed — this is UNMEASURED, not structural (§4.3/S14)`,
      )
    }
  }

  // --- §3.6/RUL-2 / §6 F19 — a committed span that left a DANGLING start mark. The
  // row records the spans still OPEN when the freeze window closed (`hook.pendingSpans`):
  // a span must close on BOTH settlement paths, and an OPEN one never becomes a value.
  if (typeof run.hook === 'object' && run.hook !== null && Number.isFinite(run.hook.pendingSpans) && run.hook.pendingSpans > 0) {
    for (const s of stageList(run)) {
      const sid = s && typeof s === 'object' && typeof s.id === 'string' && s.id !== '' ? s.id : '<unrecorded>'
      if (!s || typeof s !== 'object' || s.unseparated !== true) continue
      err(
        `stage ${sid} left a dangling ${O0_MARK_PREFIX}${sid}:start mark (no end mark/measure committed — the span must close ` +
          `on BOTH settlement paths, §3.6/RUL-2)`,
      )
    }
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

  return { ok: errors.length === 0, errors, failReasons, structuralReasons, derivedReasons, warnings }
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
  // §3a finding 3 — the SET comparison must not de-dupe a divergence away: an id
  // that REPEATS in either run is a set violation (§4.3/F1), so `equal` is false.
  const duplicatedOf = (run: any): string[] => {
    const counts = new Map<string, number>()
    for (const s of stageList(run)) {
      if (s && typeof s === 'object' && typeof s.id === 'string') counts.set(s.id, (counts.get(s.id) ?? 0) + 1)
    }
    return [...counts.keys()].filter((sid) => (counts.get(sid) ?? 0) > 1)
  }
  const aIds = setOf(a)
  const bIds = setOf(b)
  const duplicated = [...duplicatedOf(a), ...duplicatedOf(b)]
  return {
    equal: duplicated.length === 0 && aIds.length === bIds.length && aIds.every((x, i) => x === bIds[i]),
    aIds,
    bIds,
  }
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
  postStyle: {
    ms: number | null
    timed: false
    source: 'derived'
    /** RUL-5/L12 — `post.style` is DERIVED everywhere it appears (§2.2 id 11). */
    derived: true
    derivedNote: string
    residual: number | null
    unseparated: boolean
  }
  residual: number | null
  sumMs: number
  unseparatedStages: string[]
  toleranceMs: number
} {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  const tol: any = tolerance && typeof tolerance === 'object' ? tolerance : {}
  const tolInput = tol.reconcileMs
  const toleranceMs = isNonNeg(tolInput) ? tolInput : 0
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
  if (!isNonNeg(tolInput)) {
    err(
      `tolerance.reconcileMs is ${String(tolInput)} (the recorded reconcile band must be a non-negative finite number — ` +
        `§4.3/§5 P-TP-1: a non-numeric band is never silently assumed to be 0)`,
    )
  }
  if (unseparated.length) {
    err(
      `unseparated stage(s) ${unseparated.join(', ')} cannot be reconciled ` +
        `(§5 P-TP-1/§6 F4: an unmeasured stage cannot be imputed away)`,
    )
  }
  // RUL-5/L12 — `post.style` is DERIVED EVERYWHERE it appears (a computed residual,
  // §2.2 id 11 — never a timed probe): the branch that adds it to the unseparated
  // set says so, and every returned/emitted `post.style` value carries
  // `source:'derived'` + `timed:false` + `derived:true`.
  const derivedNote = 'post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)'
  // §6 F4/§5 P-TP-1 — a SEPARATED stage carrying a non-numeric ms would be summed
  // as 0, absorbing its time into the residual: an imputation, not a reconciliation.
  const imputed = stages.filter((s: any) => s && typeof s === 'object' && s.unseparated !== true && !isNonNeg(s.ms))
  for (const s of imputed) {
    err(
      `stage ${typeof s.id === 'string' && s.id !== '' ? s.id : '<stages[] entry>'} is not unseparated but carries ms ` +
        `${String(s.ms)} — a stage that was not measured cannot be summed as 0 (§6 F4/§5 P-TP-1: the imputation ban)`,
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
  // §3a finding 2 — the branch the driver twin (`o0ApplyPostStyle`) takes: the
  // DERIVED `post.style` is separated ONLY when the residual is non-negative AND
  // every stage was actually measured; otherwise `ms:null` + `unseparated:true`
  // (the two are ONE branch, never two) and `post.style` joins the unseparated set.
  const separated = imputed.length === 0 && unseparated.length === 0 && residual !== null && residual >= 0
  const unseparatedOut = separated ? unseparated : unseparated.includes('post.style') ? unseparated : [...unseparated, 'post.style']
  // RUL-5/L12 — when the DERIVED residual joins the unseparated set, the record says
  // WHY in the derived terms (a computed value, never a probe).
  if (!separated && unseparatedOut.includes('post.style')) {
    failReasons.push(
      `${derivedNote}: on this branch the residual is not separable, so post.style is emitted ms:null + unseparated:true ` +
        `(ONE branch, never two — §3a finding 2/§5 P-TP-1)`,
    )
  }
  return {
    ok: errors.length === 0,
    errors,
    failReasons,
    residual,
    sumMs,
    unseparatedStages: unseparatedOut,
    toleranceMs,
    // §2.2 stage 11 — DERIVED, never a timed probe: `timed:false` is pinned, and the
    // RUL-5/L12 marker names it as derived at the value itself.
    postStyle: {
      ms: separated ? residual : null,
      timed: false,
      source: 'derived',
      derived: true,
      derivedNote: derivedNote,
      residual,
      unseparated: !separated,
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
    // §3a finding 9 — a PARTIAL triplet (a field absent on BOTH sides) compared
    // "equal" and validated ok:true: the census fields must each be a non-negative
    // finite number on BOTH sides before they can be reconciled at all.
    if (!isNonNeg(recorded[f]) || !isNonNeg(observed[f])) {
      err(
        `corpus census ${f} is ${String(recorded[f])} recorded vs ${String(observed[f])} observed — §5 P-SM-1: the census field ` +
          `must be a non-negative finite number on BOTH sides (a partial census cannot be reconciled)`,
      )
      continue
    }
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
// §4.3 H3 / §5 P-TP-3 — WINDOW-BOUNDEDNESS. `violated:true` iff a SEPARATED stage
// exceeds `longTaskTotalMs + tolerance` (the RECORDED hook band, default 40 ms)
// OR the recorded armed window starts before the freeze `o0:t0` / ends after
// `o0:t1` beyond that tolerance (an arm window is never a silent widening).
// ---------------------------------------------------------------------------
export function deriveO0WindowBound(
  runInput: unknown,
  opts: { hookToleranceMs?: number } = {},
): {
  ok: boolean
  violated: boolean
  failReasons: string[]
  toleranceMs: number
  armWindowOk: boolean
  offenders: Array<{ stageId: string; ms: number; boundMs: number }>
  /** O0-M1-M3 §4.3/§2.5a — ADDITIVE ONLY (gated): the TOP-LEVEL spans recorded in
   *  `hook.stageRecordDetail` whose interval extends OUTSIDE the freeze window beyond
   *  the recorded band. Populated ONLY from the new span data, so it is EMPTY on every
   *  legacy row that carries no per-record timestamps and changes no existing verdict. */
  outsideOffenders: Array<{ recordIndex: number; stage: string; startMs: number; endMs: number; outsideMs: number }>
} {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  // The band: the caller's explicit tolerance, else the ROW's recorded band
  // (`hook.toleranceMs`), else the §3.6 default 40 ms.
  const optGiven = opts && typeof opts === 'object' ? opts.hookToleranceMs : undefined
  const recordedBand = run.hook && typeof run.hook === 'object' ? run.hook.toleranceMs : undefined
  const given = optGiven !== undefined ? optGiven : recordedBand
  const toleranceMs = isNonNeg(given) ? (given as number) : O0_WINDOW_TOLERANCE_MS
  const total = isNonNeg(run.longTaskTotalMs) ? run.longTaskTotalMs : null
  const boundMs = total === null ? null : total + toleranceMs
  const failReasons: string[] = []
  const offenders: Array<{ stageId: string; ms: number; boundMs: number }> = []
  const outsideOffenders: Array<{ recordIndex: number; stage: string; startMs: number; endMs: number; outsideMs: number }> = []
  // §4.3(b) — the ARMED window is recorded and judged against the freeze it belongs
  // to: a hook armed before `o0:t0` (or disarmed after `o0:t1`) beyond the band is
  // a violation, never a silently widened measurement.
  const hook: any = run.hook && typeof run.hook === 'object' ? run.hook : null
  const arm: any = hook && hook.armWindow && typeof hook.armWindow === 'object' ? hook.armWindow : null
  const freeze: any = hook && hook.freezeWindow && typeof hook.freezeWindow === 'object' ? hook.freezeWindow : null
  let armWindowOk = true
  if (arm && freeze && isNonNeg(arm.t0) && isNonNeg(arm.t1) && isNonNeg(freeze.t0) && isNonNeg(freeze.t1)) {
    if (arm.t0 < freeze.t0 - toleranceMs || arm.t1 > freeze.t1 + toleranceMs) {
      armWindowOk = false
      failReasons.push(
        `the armed hook window [${o0Num(arm.t0)}, ${o0Num(arm.t1)}] does not equal the freeze it belongs to ` +
          `[o0:t0 ${o0Num(freeze.t0)}, o0:t1 ${o0Num(freeze.t1)}] within the recorded ${o0Num(toleranceMs)} ms band — ` +
          `§4.3/P-TP-3(b): an arming interval outside its freeze is never a silent widening`,
      )
    }
  }
  // §4.3 (O0-M1-M3) — the new span data: a TOP-LEVEL record whose interval leaves the
  // freeze window beyond the band. Empty on a row with no per-record timestamps.
  const spanDetail: any[] = Array.isArray(hook?.stageRecordDetail) ? hook.stageRecordDetail : []
  if (freeze && isNonNeg(freeze.t0) && isNonNeg(freeze.t1)) {
    const entries = spanDetail.filter((d: any) => d && typeof d === 'object' && Number.isFinite(d.startMs) && Number.isFinite(d.endMs))
    for (const d of entries) {
      const enclosed = entries.some(
        (o: any) => o !== d && o.startMs <= d.startMs && d.endMs <= o.endMs && (o.startMs < d.startMs || d.endMs < o.endMs),
      )
      if (enclosed) continue // nested records do not move the window (§3.2 clause 6)
      const beyond = Math.max(0, freeze.t0 - d.startMs) + Math.max(0, d.endMs - freeze.t1)
      if (beyond > toleranceMs) {
        outsideOffenders.push({
          recordIndex: Number.isInteger(d.index) ? d.index : -1,
          stage: typeof d.stage === 'string' ? d.stage : '<unrecorded>',
          startMs: d.startMs,
          endMs: d.endMs,
          outsideMs: Math.round(beyond * 1000) / 1000,
        })
        failReasons.push(
          `record ${String(d.index)} (${String(d.stage)}) extends ${o0Num(beyond)} ms OUTSIDE the freeze window ` +
            `[${o0Num(freeze.t0)}, ${o0Num(freeze.t1)}] beyond the recorded ${o0Num(toleranceMs)} ms band — a span outside its ` +
            `window is not a measurement of that window (H3 extended to the new span data — §4.3)`,
        )
      }
    }
  }
  if (boundMs !== null) {
    const list = stageList(run)
    for (let i = 0; i < list.length; i++) {
      const s: any = list[i]
      if (!s || typeof s !== 'object' || s.unseparated === true || !isNonNeg(s.ms)) continue
      if (s.ms > boundMs) {
        const stageId = typeof s.id === 'string' && s.id !== '' ? s.id : `stages[${i}]`
        offenders.push({ stageId, ms: s.ms, boundMs })
        failReasons.push(
          `stage ${stageId} ms ${o0Num(s.ms)} exceeds the freeze it belongs to (${o0Num(total)} ms + ${o0Num(toleranceMs)} ms ` +
            `tolerance = bound ${o0Num(boundMs)} ms) — a stage cannot be larger than the window it is measured in (§4.3/F13a)`,
        )
      }
    }
  }
  return {
    ok: failReasons.length === 0,
    violated: failReasons.length > 0,
    failReasons,
    toleranceMs,
    armWindowOk,
    offenders,
    outsideOffenders,
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
  /** §4.4/RUL-5-L8 — WHY no percentage was derived (`'zero-window'` on a 0 ms
   *  window, `'non-finite-window'`, `'share-above-100'`, else `null`). */
  pctReason: string | null
} {
  const run: any = runInput && typeof runInput === 'object' ? runInput : {}
  // §3a finding 4 — an entry whose `id` is not a string is NOT an identified stage:
  // `String(undefined)` must never become the "largest identified stage".
  const identified = stageList(run).filter(
    (s: any) =>
      s && typeof s === 'object' && typeof s.id === 'string' && s.id !== '' && s.id !== 'post.style' && s.unseparated !== true && isNonNeg(s.ms),
  )
  let largest: any = null
  for (const s of identified) if (largest === null || s.ms > largest.ms) largest = s // spec order wins a tie
  const totalMs = isNonNeg(run.longTaskTotalMs) ? run.longTaskTotalMs : null
  const ms = largest ? largest.ms : null
  const gestureName = typeof run.gesture === 'string' && run.gesture !== '' ? run.gesture : '<gesture>'
  // §4.4/F7 — the truth stays visible in failure: a row whose gesture path was not
  // proven (path !== 'cdp', OR a realInput that disagrees with it) still gets its
  // derived verdict, with the recorded path NAMED.
  const hitTested = deriveO0GesturePath(run.path).pathRuleOk && run.realInput === true
  const fallback = hitTested
    ? ''
    : ` — gesture path ${String(run.path)} with realInput ${String(run.realInput)}: the row is not hit-tested evidence (§6 F7)`
  // §4.4/F13a — the percentage is REFUSED on a violated window (the live
  // `1698.82%` string is exactly what this branch replaces).
  if (o0WindowRecorded(run)) {
    const wb = deriveO0WindowBound(run)
    if (wb.violated) {
      const off = wb.offenders[0]
      const head = off
        ? `stage ${off.stageId} is ${o0Num(off.ms)} ms, which EXCEEDS the freeze window it belongs to (${o0Num(totalMs)} ms + ` +
          `${o0Num(wb.toleranceMs)} ms tolerance)`
        : `the armed hook window EXCEEDS the freeze window it belongs to (${o0Num(totalMs)} ms + ${o0Num(wb.toleranceMs)} ms tolerance)`
      return {
        ok: true,
        verdict: `${head} — WINDOW-BOUND VIOLATED: no percentage verdict is emitted for this row${fallback}`,
        largestStageId: largest ? String(largest.id) : null,
        ms,
        totalMs,
        pct: null,
        pctReason: null,
      }
    }
  }
  // §5 P-TP-3(c) — a percentage is derived only inside [0, 100]: a stage that is
  // inside the band but larger than the raw total emits NO percentage (pct:null).
  const pct = ms !== null && totalMs !== null && totalMs > 0 && ms <= totalMs ? Math.round((ms / totalMs) * 10000) / 100 : null
  // RUL-5/L8 — a percentage is NEVER emitted without a finite positive window: the
  // former `(null%)` literal (a zero/absent-`longTaskTotalMs` row) read as a
  // measurement. The pct-less form below names WHY no percentage exists.
  // §4.4/RUL-5-L8 — the pinned ZERO-WINDOW form (the `(null%)` literal is retired):
  // `pct` is `null` AND `pctReason` names why, so a reader can never take an empty
  // window for a measurement.
  const pctReason: string | null =
    pct !== null
      ? null
      : totalMs === 0
        ? 'zero-window'
        : totalMs === null
          ? 'non-finite-window'
          : 'share-above-100'
  const noPct =
    totalMs === 0
      ? `no percentage is computed: the long-task window is zero (${o0Num(totalMs)} ms), so this row has no finite window to divide by`
      : totalMs === null
        ? 'no percentage is computed: longTaskTotalMs is not a finite non-negative number, so this row has no finite window to divide by'
        : `${o0Num(ms)} ms exceeds the ${o0Num(totalMs)} ms window it was measured in, so no percentage is computed (a share above 100% is refused, §5 P-TP-3(c))`
  const verdict = largest
    ? pct !== null
      ? `stage ${String(largest.id)} is ${o0Num(ms)} ms of the ${o0Num(totalMs)} ms long task (${o0Num(pct)}%) on ` +
        `${gestureName} — ${String(largest.id)} is the largest identified stage${fallback}`
      : `stage ${String(largest.id)} is ${o0Num(ms)} ms of the ${o0Num(totalMs)} ms long task on ${gestureName} — ` +
        `${noPct}${fallback}`
    : `no stage was identified in the row (every stage is unseparated or null ms) of the ${o0Num(totalMs)} ms long task on ` +
      `${gestureName} — ${noPct}${fallback}`
  return { ok: true, verdict, largestStageId: largest ? String(largest.id) : null, ms, totalMs, pct, pctReason }
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
  const unmeasured = snapshots.find((s: any) => s.unseparated === true) ?? null
  const reads = snapshots.filter((s: any) => s.unseparated !== true && isNonNeg(s.ms) && s.ms > 0)
  const readCount = reads.length
  const readMs = reads.reduce((acc: number, s: any) => acc + s.ms, 0)
  const gestureName = typeof run.gesture === 'string' && run.gesture !== '' ? run.gesture : '<gesture>'
  // §3.6b/§4.4 — the A-4 rule: a "NOT measured" 0 must never be emitted as a
  // MEASURED zero. An `unseparated` `snapshot.pull` emits the UNMEASURED form
  // instead of `performed 0 whole-store … read(s)` (the live §12 H2 string).
  const verdict = unmeasured
    ? `the ${gestureName}'s whole-store IPC_RAG_SNAPSHOT read count is UNMEASURED (${o0UnmeasuredDetail(unmeasured)})`
    : `the ${gestureName} performed ${readCount} whole-store IPC_RAG_SNAPSHOT read(s) totalling ${o0Num(readMs)} ms ` +
      `(census ${o0Num(census.documents)} docs / ${o0Num(census.nodes)} nodes / ${o0Num(census.edges)} edges)`
  return { ok: true, verdict, readCount, readMs, stageSeparated: snapshots.some((s: any) => s.unseparated !== true) }
}
/** §4.4 — the pinned UNMEASURED parenthetical: `snapshot.pull unseparated — <reason>`. */
function o0UnmeasuredDetail(pull: any): string {
  const reason =
    typeof pull?.structuralReason === 'string' && pull.structuralReason !== ''
      ? pull.structuralReason
      : 'the caller-level seam was not armed for this run'
  return reason.startsWith('snapshot.pull unseparated') ? reason : `snapshot.pull unseparated — ${reason}`
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

/** §4.4 (RUL-4) — the DERIVED report status: a report whose ONLY recorded defects
 *  are structurally-unmeasurable stages (seams that do not exist in the executing
 *  bundle, each with a recorded reason) is `OPEN-structural`, NOT a failure — while
 *  a genuinely unmeasured/illegally-imputed row, a falsifiability failure (a
 *  non-`cdp` gesture, an unverified bundle, a hard-coded verdict) or a violated
 *  window is `FAIL`. ONE implementation, shared by the pure validator and the
 *  driver's own emit path. */
export type O0ReportStatus = 'OK' | 'OPEN-structural' | 'FAIL'
/** §4.2/RUL-4 — the DERIVED report STATUS. Exactly three legal values, and ONE
 *  implementation shared by the pure validator and the driver:
 *  - `"OK"` ⇔ `pass:true` (every stage measured or `derived`);
 *  - `"OPEN-structural"` ⇔ `pass:false` whose every recorded reason is in the
 *    STRUCTURAL FAMILY (a stage whose seam does not exist in the executing bundle
 *    — `structural:true` + a reason — the DERIVED `post.style` residual that
 *    therefore cannot be computed, and the reconciliation-incomplete line);
 *  - `"FAIL"` — any reason outside that family (§6 F-state class).
 *  `ok` (SCHEMA validity) is a DIFFERENT field: a structurally-open report is
 *  `ok:true` with an empty `errors[]` while its `pass` stays `false` (the
 *  measurement is incomplete, not malformed — §6 S19/F18). */
export function deriveO0ReportStatus(result: {
  ok?: unknown
  gating?: unknown
  failReasons?: unknown
  structuralFamily?: unknown
  structuralReasons?: unknown
  derivedReasons?: unknown
}): {
  status: O0ReportStatus
  gating: string[]
  family: string[]
  structural: string[]
  derived: string[]
  pass: boolean
  statement: string
} {
  const strings = (v: unknown): string[] => (Array.isArray(v) ? (v as unknown[]).filter((x): x is string => typeof x === 'string' && x !== '') : [])
  const structural = strings(result?.structuralReasons)
  const derived = strings(result?.derivedReasons)
  const family = [...new Set([...strings(result?.structuralFamily), ...structural, ...derived])]
  const all = strings(result?.failReasons)
  const gating =
    result?.gating !== undefined
      ? strings(result.gating)
      : all.filter((m) => !family.includes(m))
  const status: O0ReportStatus = gating.length > 0 ? 'FAIL' : family.length > 0 ? 'OPEN-structural' : result?.ok === true ? 'OK' : 'FAIL'
  const pass = status === 'OK'
  const statement =
    status === 'FAIL'
      ? `FAIL — ${gating.length || 1} forcing reason(s) outside the structural family (an unmeasured permitted stage, an ` +
        `imputation, a falsifiability failure, a violated window, a broken control pairing or a census mismatch; §6 F-state class/RUL-4)`
      : status === 'OPEN-structural'
        ? `OPEN-structural — ${structural.length} structurally-unmeasurable stage(s) (no seam in the executing bundle) and ` +
          `${derived.length} DERIVED-residual record(s): the report is SCHEMA-VALID and its residual cannot be computed; no ` +
          `value was imputed (§3.6b RUL-4, §6 S14/S19)`
        : 'OK — every stage is measured or derived, no forcing reason recorded (§4.2/RUL-4)'
  return { status, gating, family, structural, derived, pass, statement }
}

export function validateO0Reports(
  runsInput: unknown,
  opts: any = {},
): O0Result & {
  notes: string[]
  structural: string[]
  derivedResidual: string[]
  structuralFamily: string[]
  gating: string[]
  status: O0ReportStatus
  runs: unknown[]
} {
  const runs = Array.isArray(runsInput) ? (runsInput as any[]) : []
  const ids = Array.isArray(opts.ids) && opts.ids.length ? (opts.ids as string[]) : O0_STAGE_IDS
  const errors: string[] = []
  const failReasons: string[] = []
  const structural: string[] = []
  const derivedResidual: string[] = []
  const notes: string[] = []
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
    // RUL-4 — the STRUCTURAL lines are recorded but never gating: a seam that does
    // not exist in the executing bundle is a recorded harness gap, not a defect of
    // the measurement. Every OTHER recorded reason stays a forcing condition.
    for (const e of v.structuralReasons) {
      structural.push(`runs[${i}]: ${e}`)
      notes.push(`runs[${i}]: ${e}`)
    }
    for (const e of v.derivedReasons) {
      derivedResidual.push(`runs[${i}]: ${e}`)
      notes.push(`runs[${i}]: ${e}`)
    }
    for (const e of v.failReasons) {
      if (v.structuralReasons.includes(e) || v.derivedReasons.includes(e)) continue
      failReasons.push(`runs[${i}]: ${e}`)
    }
  })
  const ctl = o0CheckControls(runs, opts.controls, { crossArtifactControlPairs: opts.crossArtifactControlPairs })
  errors.push(...ctl.errors)
  failReasons.push(...ctl.failReasons)
  notes.push(...ctl.notes)
  const family = [...new Set([...structural, ...derivedResidual])]
  const gating = failReasons.filter((m) => !family.includes(m))
  const derived = deriveO0ReportStatus({ ok: true, gating, failReasons: [...gating, ...family], structuralFamily: family })
  const ok = errors.length === 0 && gating.length === 0
  return {
    ok,
    errors,
    failReasons: [...gating, ...family],
    gating,
    structuralFamily: family,
    notes,
    structural,
    derivedResidual,
    status: derived.status,
    runs,
  }
}

// ---------------------------------------------------------------------------
// §4.2 / §6 F10 — the top-level report validator.
// ---------------------------------------------------------------------------
export function validateO0Report(repInput: unknown): O0Result & {
  verdicts: string[]
  notes: string[]
  structural: string[]
  derivedResidual: string[]
  structuralFamily: string[]
  gating: string[]
  status: O0ReportStatus
  statusStatement: string
} {
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

  // --- §6 S17/F17b — inertness measured but VACUOUS ------------------------
  // A report whose runs ARMED the hook but carries NO inertness comparison cannot
  // claim an inert hook: an unverified arm is not an inert arm (§3.6(c)).
  const armedRunCount = runs.filter((r: any) => r && typeof r === 'object' && r.hook && r.hook.armed === true).length
  const comparisons = drv && Array.isArray(drv.hookInertness) ? drv.hookInertness : []
  if (armedRunCount > 0 && comparisons.length === 0) {
    err(
      `no hook inertness comparison was recorded although ${armedRunCount} run(s) armed the hook — an unverified arm is not ` +
        `an inert arm (§3.6(c)/§6 S17/F17b)`,
    )
  }

  const validateIds = Array.isArray(rep.stageIds) && rep.stageIds.length === O0_STAGE_COUNT ? stageIds : O0_STAGE_IDS
  const structural: string[] = []
  const derivedResidual: string[] = []
  runs.forEach((r, i) => {
    const v = validateO0Run(r, validateIds)
    for (const e of v.errors) errors.push(`runs[${i}]: ${e}`)
    // RUL-4 — the STRUCTURAL subset is RECORDED (as a note + a `structural` marker)
    // but is NOT a report-level forcing condition: a seam that does not exist in the
    // executing bundle is a recorded GAP of the harness, never a failed
    // measurement. Every other recorded reason (a genuinely unmeasured row, an
    // illegal imputation, a falsifiability failure, a violated window) still gates.
    for (const e of v.structuralReasons) {
      structural.push(`runs[${i}]: ${e}`)
      notes.push(`runs[${i}]: ${e}`)
    }
    // RUL-4/RUL-5-L12 — the DERIVED `post.style` residual is a computed consequence,
    // not a seam that was not armed: recorded (as a note + a `derivedResidual`
    // marker), never gating.
    for (const e of v.derivedReasons) {
      derivedResidual.push(`runs[${i}]: ${e}`)
      notes.push(`runs[${i}]: ${e}`)
    }
    for (const e of v.failReasons) {
      if (v.structuralReasons.includes(e) || v.derivedReasons.includes(e)) continue
      failReasons.push(`runs[${i}]: ${e}`)
    }
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
      const structuralIds = structuralStageIds(r)
      // RUL-4 — the precise reconciliation NOTE: which stages are structurally
      // unmeasurable (with their reasons) and that `post.style` is the DERIVED
      // residual that cannot exist while they are unseparated.
      notes.push(
        `run ${String(r?.id)}: post.style residual ${rec.postStyle.ms === null ? 'null' : String(rec.postStyle.ms)} ms ` +
          `(Σ named stages ${String(rec.sumMs)} of ${String(r?.longTaskTotalMs)} ms; reconciliation ${rec.ok ? 'ok' : 'FAILED'})` +
          (rec.unseparatedStages.length ? ` — unseparated: [${rec.unseparatedStages.join(', ')}]` : '') +
          (structuralIds.length
            ? ` — STRUCTURAL (no seam in the executing bundle): [${structuralIds.join(', ')}]; the derived post.style residual is OPEN-structural, never imputed (§6 S14/RUL-4)`
            : ''),
      )
      for (const m of rec.failReasons) notes.push(`run ${String(r?.id)}: ${m}`)
      // §6 F4/RUL-4 — an unmeasured stage cannot be reconciled away, so a row that
      // reports a NON-structural unmeasured stage makes the REPORT a fail-state. A
      // row whose unseparated set is structural (its seams do not exist) plus the
      // derived `post.style` residual is OPEN-structural instead: recorded, never a
      // FAIL. The residual band itself stays a recorded outcome (§5 P-TP-1).
      const nonStructural = rec.unseparatedStages.filter((id) => id !== 'post.style' && !structuralIds.includes(id))
      if (nonStructural.length) {
        err(
          `run ${String(r?.id)}: unseparated stage(s) ${nonStructural.join(', ')} cannot be reconciled ` +
            `(§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)`,
        )
      }
    }
  }
  // §2.4/RUL-5-L9 + §6 S20/F20 — a GPU delta is PER RUN / PER CORPUS: a delta the
  // report carries from another run as if it were this run's measurement is a
  // forcing reason (the provenance form must name that run + corpus).
  for (const d of Array.isArray(drv?.gpuDeltas) ? (drv.gpuDeltas as any[]) : []) {
    if (d && d.carriedFromAnotherRun === true) {
      err(
        `the GPU control reports a delta carried from another run/corpus (${String(d.delta)} ms from ${String(d.provenanceRun)}) — ` +
          `the GPU delta is reported per run/per corpus and is never carried across runs (§2.4/RUL-5)`,
      )
    }
  }
  // §3.4/RUL-5-L10 — the corpus SIZE is the gate; `nodes`/`edges`/bytes are recorded
  // provenance. A corpus row that presents them as a pinned census is a forcing reason.
  if (corpus && typeof corpus === 'object' && corpus.gate !== undefined && corpus.gate !== 'documents') {
    err(
      `the corpus row presents ${JSON.stringify(corpus.gate)} as the pinned census — the SIZE is the gate and the ` +
        `bytes/counts are recorded provenance (§3.4/§4.3/RUL-5)`,
    )
  }
  // §6 S17(b)/F21 (RUL-6) — an inertness pair whose long-task half is VACUOUS must
  // state the MUTATION-HALF proof; the unqualified long-task-bounded claim is a defect.
  for (const p of comparisons) {
    if (p && typeof p === 'object' && p.nonVacuous === false && !/MUTATION-HALF/.test(String(p.proofStatement ?? ''))) {
      err(
        `the hook inertness pair is reported as a long-task-bounded proof while nonVacuous is false (both freezes totalled ` +
          `${String(p.longTaskTotalMs?.unarmed ?? 'n/a')} ms) — a vacuous half proves nothing; report the MUTATION-HALF form ` +
          `instead (§6 S17/RUL-6)`,
      )
    }
  }
  // --- the FINAL split (defect `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`) ------
  // §4.2/RUL-4 clause 4/§6 F18 — `ok` (SCHEMA validity) is NOT the verdict: the
  // structural family is a recorded FACT and is not gating. `gating` is every reason
  // OUTSIDE the family, and the status is derived from exactly that split — taken
  // here, i.e. AFTER the LAST post-derivation block above (the F20 carried GPU delta,
  // the corpus-gate provenance and the F21 vacuous-inertness half), never from the
  // pre-block `failReasons` snapshot: a reason minted by those blocks reached
  // `errors[]` and was then DROPPED from `failReasons[]`/`gating`/`status`/`ok`
  // (a non-empty `errors[]` could read `ok:true` and a forcing reason could leave the
  // derived status at "OK").
  const family = [...new Set([...structural, ...derivedResidual])]
  const derivedFromFinalReasons = deriveO0ReportStatus({
    ok: true,
    gating: failReasons.filter((m) => !family.includes(m)),
    structuralFamily: family,
  })

  // §3.6b RUL-4 clause 5 / §6 F18 + §13.2 (5) [O0-MANDATORY-NOTE-CLAUSE-DODGEABLE] — the
  // reconciliation note is MANDATORY on the OPEN-structural branch. It is a defect OF THE
  // RECORD (a missing mandatory field), never a reason ABOUT the verdict, so it is a
  // FORCING condition like any other: it is recorded in `errors[]` and it moves the final
  // derived status to "FAIL". The clause is gated on the status the recorded reasons
  // DERIVE — never on what the report DECLARES: gating it on a declared `status` let a
  // report DODGE it by deleting `status`, so the missing note was a forcing reason only
  // for a report that volunteered the field (the declared/derived pair is two readings
  // that can drift; the derived one is the contract).
  if (
    derivedFromFinalReasons.status === 'OPEN-structural' &&
    (typeof rep.reconciliation?.note !== 'string' || rep.reconciliation.note === '')
  ) {
    err(
      `report status is "OPEN-structural" without a reconciliation.note naming the structural stages, the non-computable ` +
        `residual and the no-imputation statement (§3.6b RUL-4 clause 5/§13.2 (5): the note clause is gated on the DERIVED ` +
        `status, so it cannot be dodged by omitting \`status\`)`,
    )
  }

  // THE FINAL triple — recomputed from the FINAL `failReasons` (`family` is stable:
  // it is assembled from the recorded structural/derived-residual sets above).
  const gating = failReasons.filter((m) => !family.includes(m))
  const derived = deriveO0ReportStatus({ ok: true, gating, failReasons: [...gating, ...family], structuralFamily: family })

  // --- §4.3 fail-loud / §4.2 RUL-4 — the VERDICT-consistency clauses ------------
  // Each of these reasons describes the VERDICT, not the measurement: it is derived
  // FROM the split above, so it is recorded in BOTH channels (`errors[]` — where the
  // diagnosis stays readable — and the returned `failReasons[]`, the FORCING channel
  // an aggregate reader consumes) but it never feeds the split it is derived from
  // (that would be self-referential: the "pass:false with no forcing reason" clause
  // would itself become the forcing reason it reports as missing).
  const verdictReasons: string[] = []
  const errVerdict = (m: string) => {
    errors.push(m)
    verdictReasons.push(m)
  }
  if (rep.pass === false && gating.length === 0 && family.length === 0) {
    errVerdict('the report records pass:false with no forcing reason (§4.3 fail-loud)')
  }
  if (rep.pass === true && gating.length > 0) {
    errVerdict(
      `the report records pass:true but the harness derived ${gating.length} forcing condition(s) — a verdict is ` +
        `NEVER asserted true (§4.4/D-GP-UFA-3)`,
    )
  }
  if (rep.pass === true && family.length > 0 && gating.length === 0) {
    errVerdict(
      `report pass:true with ${family.length} recorded structural fact(s) — the status of such a report is ` +
        `"OPEN-structural", never "OK" (§4.2/RUL-4: OK ⇔ pass:true)`,
    )
  }
  // A report that DECLARES a status must declare the DERIVED one, and its `pass` must
  // agree with it (§4.2/RUL-4): `OK` ⇔ `pass:true`; `OPEN-structural` ⇔ a
  // `pass:false` whose every forcing reason is in the structural family.
  if (rep.status !== undefined && rep.status !== null) {
    if (rep.status !== derived.status) {
      errVerdict(
        `report status ${JSON.stringify(rep.status)} disagrees with the status the recorded reasons DERIVE (${derived.status}) — ` +
          `a status is COMPUTED from the reasons, never asserted (§4.4/D-GP-UFA-3/RUL-4)`,
      )
    }
    if (rep.pass !== (derived.status === 'OK')) {
      errVerdict(
        `report status ${JSON.stringify(rep.status)} contradicts pass:${String(rep.pass)} (§4.2/RUL-4: OK ⇔ pass:true, ` +
          `OPEN-structural ⇔ a pass:false whose reasons are all structural)`,
      )
    }
  }
  // `ok` (SCHEMA validity) is read AFTER every reason is minted (the verdict clauses
  // above included): a result whose `errors[]` is non-empty must never read `ok:true`.
  return {
    ok: errors.length === 0 && gating.length === 0,
    errors,
    failReasons: [...gating, ...family, ...verdictReasons],
    gating,
    structuralFamily: family,
    structural,
    derivedResidual,
    status: derived.status,
    statusStatement: derived.statement,
    verdicts,
    notes,
  }
}

// ===========================================================================
// O0-M1-M3-MEASUREMENT-SHAPE — the measurement-shape oracles
// (docs/specs/unit-o0-m1-m3-measurement-shape.md §2.1/§2.2/§2.3, §3.2/§3.3/§3.4,
//  §4.1/§4.2, §6 FS1..FS10).
//
// ADDITIVE + NEW-SURFACE ONLY (RUL-7): `validateO0Run` / `validateO0Report` /
// `reconcileO0PostStyle` keep their existing clause sets for LEGACY-shaped rows —
// the O-0 suite's fixtures are built on the retired summed residual, the bare
// session aliases and the absence of `hook.passes`, and the M1/M2/M3 clauses gate
// the NEW surface (`partitionO0RowPasses`, `deriveO0LongTaskAttribution`,
// `deriveO0RowArmCounts`, `validateO0MeasurementShape`) instead.
//
// The three shape rules this unit exists for:
//   M1  the remainder is per PASS and UNION-accounted (`windowMs − |⋃spans ∩ window|`),
//       non-negative by construction; the single summed row residual is RETIRED;
//   M2  the arm/disarm counts are PER-ROW (the delta of the pre-arm and POST-DISARM
//       readings); the bare session aliases are RETIRED;
//   M3  the long-task rule is PINNED to `start-inside-inclusive` (t0 ≤ start ≤ t1,
//       the FULL duration) with `overlap-any`/`intersection` recorded as the
//       discriminated alternatives.
// Every entry point returns a discriminated `{ ok, errors, failReasons, … }` result
// and NEVER throws on malformed input (§6 throw discipline).
// ===========================================================================
/** §2.1/§4.1 — the recorded marker of a RETIRED field. */
export const O0_RETIRED_BY = 'O0-M1-M3-MEASUREMENT-SHAPE (M1)'
/** §2.3 — the ONE pinned long-task attribution rule. */
export const O0_LONGTASK_RULE = 'start-inside-inclusive'
/** §3.2/§4.2 — the CLOSED 2-value pass-kind set. */
export const O0_PASS_KINDS: readonly string[] = ['pre-pass-render', 're-derive']
/** §3.2 clause 2 — a top-level record whose stage is this one opens a pass. */
const O0_PASS_OPENER_STAGE = 'snapshot.pull'
/** §2.1/RUL-11 (the `F5-1` fix) — the band the UNION REMAINDER (`unaccountedMs`) is
 *  judged with: `tolerance.reconcileMs` = 50 ms. The band's SCOPE is pinned: the
 *  retired summed residual has NO band, this ONE judges the union remainder, and
 *  `hook.toleranceMs` (40 ms) is the WINDOW-BOUND band (the `outsideMs`/FS6 rule).
 *  Judging the union remainder against the 40 ms window band IS the fifth run's
 *  mis-scoped-band defect (its reasons named 40 while the row recorded 50). */
export const O0_RECONCILE_TOLERANCE_MS = 50
/** §4.1/§13.2 (8)(c) — the RECORDED ACCOUNTING AGREEMENT: the declared
 *  `reconciliation.{windowMs,accountedMs}` is checked against the DERIVED accounting at
 *  the report's recorded 0.1 ms granularity. A drift ABOVE that granularity is a
 *  declared≠derived mismatch (the declared accounting may never be a second reading that
 *  drifts from the rows' own records); a drift AT it is the recorded rounding of the
 *  same quantity and is not. */
const O0_ACCOUNTING_AGREEMENT_MS = 0.1
/** §2.1 — the WINDOW-BOUND band (`hook.toleranceMs`), used for the `outsideMs`/FS6
 *  rule only; the union remainder never uses it. */
const O0_SHAPE_TOLERANCE_MS = O0_WINDOW_TOLERANCE_MS

interface O0ShapeSpan {
  index: number
  stage: string
  startMs: number
  endMs: number
}
interface O0ShapePass {
  index: number
  kind: string
  opener: { stage: string; recordIndex: number } | null
  window: { t0: number; t1: number; ms: number }
  records: { indices: number[]; count: number; nestedCount: number }
  stageCount: number
  stages: Array<{
    id: string
    ms: number | null
    unseparated: boolean
    source: string
    structural: boolean
    structuralReason: string | null
  }>
  topLevelSpans: O0ShapeSpan[]
  sumOfSpansMs: number
  sumOfSpansNotAccounted: boolean
  accountedMs: number
  unaccountedMs: number | null
  unaccountedReason?: string
  overlapMs: number
  outsideMs: number
  longTaskTotalMs: number
  pass: boolean
  failReasons: string[]
}
export interface O0PassPartition {
  ok: boolean
  errors: string[]
  failReasons: string[]
  passes: O0ShapePass[]
  passCount: number
  passKindSequence: string[]
  /** §4.1/S5 — the pass pairs whose WINDOWS overlap, with the measured overlap. */
  passOverlaps: Array<{ a: number; b: number; overlapMs: number }>
  nestingAmbiguities: Array<{ indices: number[]; stages: string[]; interval: { startMs: number; endMs: number } }>
  stageRecordDetail: any[]
  row: {
    windowMs: number
    accountedMs: number
    unaccountedMs: number | null
    unaccountedReason: string | null
    /** §2.1/RUL-11 — the WINDOW-BOUND band (`hook.toleranceMs`, 40 ms), recorded
     *  alongside the union-remainder band so the two are never confused. */
    windowBoundToleranceMs: number
    overlapMs: number
    sumOfSpansMs: number
    outsideMs: number
    naiveSumResidualMs: number | null
    naiveSumResidualNote: string
    naiveSumResidualNotAResidual: boolean
    passOverlapSumMs: number
    passLongTaskDoubleCountMs: number
    /** §2.3/RUL-11 — the SIGNED diagnostic `Σ(pass totals) − row total`, never a measure. */
    passTotalsMinusRowMs: number
    passTotalsMinusRowIsADoubleCount: boolean
    /** §3.3/RUL-11 — the SIGNED diagnostic `Σ(pass.unaccountedMs) − row.unaccountedMs`, never a measure. */
    passRowUnaccountedDeltaMs: number
    passRowUnaccountedDeltaIsAMeasure: boolean
    toleranceMs: number
    bandExceeded: boolean
    /** §2.1(ii) — the ROW-LEVEL NOTE a band-exceeded remainder carries (never a forcing reason). */
    bandExceededNote: string | null
    /** §2.1(ii) — the band-exceeded OUTCOME statement, kept OUT of the shape failures. */
    outcomeReasons: string[]
    /** §4.4 — the DERIVED row-remainder statement (computed, never hard-coded). */
    remainderStatement: string
    pass: boolean
    failReasons: string[]
  }
  /** §2.5a RUL-8 — a legacy (fourth-edition) row refused BY SHAPE CLASS. */
  legacyShape: boolean
  legacyShapeReason: string | null
}

function o0Round3(v: number): number {
  return Math.round(v * 1000) / 1000
}
/** §3.3 — the MEASURE of the union of intervals (sort by start, merge overlapping
 *  and touching intervals, sum the merged lengths) ∩ the window. Never the SUM. */
function o0UnionMeasure(intervals: Array<{ startMs: number; endMs: number }>, win: { t0: number; t1: number } | null): number {
  const t0 = win && isNonNeg(win.t0) ? win.t0 : null
  const t1 = win && isNonNeg(win.t1) ? win.t1 : null
  const iv = intervals
    .filter((s) => Number.isFinite(s.startMs) && Number.isFinite(s.endMs) && s.endMs > s.startMs)
    .map((s) => ({ a: t0 === null ? s.startMs : Math.max(s.startMs, t0), b: t1 === null ? s.endMs : Math.min(s.endMs, t1) }))
    .filter((s) => s.b > s.a)
    .sort((x, y) => x.a - y.a)
  let acc = 0
  let cur: { a: number; b: number } | null = null
  for (const s of iv) {
    if (cur === null) cur = { a: s.a, b: s.b }
    else if (s.a <= cur.b) cur.b = Math.max(cur.b, s.b)
    else {
      acc += cur.b - cur.a
      cur = { a: s.a, b: s.b }
    }
  }
  if (cur !== null) acc += cur.b - cur.a
  return o0Round3(acc)
}
/** §3.3 — the measure of the union of the parts of `intervals` that fall OUTSIDE
 *  the freeze window (the H3 window-bound rule, extended to the span data). */
function o0OutsideMeasure(intervals: Array<{ startMs: number; endMs: number }>, win: { t0: number; t1: number } | null): number {
  if (win === null || !isNonNeg(win.t0) || !isNonNeg(win.t1)) return 0
  const parts: Array<{ startMs: number; endMs: number }> = []
  for (const s of intervals) {
    if (!Number.isFinite(s.startMs) || !Number.isFinite(s.endMs) || s.endMs <= s.startMs) continue
    const lo = Math.min(s.startMs, win.t0)
    const hi = Math.max(s.endMs, win.t1)
    if (lo < win.t0) parts.push({ startMs: lo, endMs: Math.min(s.endMs, win.t0) })
    if (hi > win.t1) parts.push({ startMs: Math.max(s.startMs, win.t1), endMs: hi })
  }
  return o0UnionMeasure(parts, null)
}
function o0SumSpans(spans: Array<{ startMs: number; endMs: number }>): number {
  return o0Round3(spans.reduce((a, s) => a + (s.endMs - s.startMs), 0))
}
/** §2.1 — the RETIRED legacy form survives ONLY as a diagnostic. */
function o0NaiveSumResidual(row: any): number | null {
  if (!isNonNeg(row?.longTaskTotalMs)) return null
  const sum = stageList(row)
    .filter((s: any) => s && typeof s === 'object' && s.unseparated !== true && isNonNeg(s.ms))
    .reduce((a: number, s: any) => a + s.ms, 0)
  return o0Round3(row.longTaskTotalMs - sum)
}
/** §3.1 — the row's records in COMMIT order, with the timestamps the partition is
 *  derived from (`startMs`/`endMs`). A record without finite timestamps is named
 *  and the partition is refused (§6 FS10) — never imputed. */
function o0RecordSet(hook: any): { records: any[]; errors: string[]; failReasons: string[] } {
  const raw = Array.isArray(hook?.stageRecordDetail) ? hook.stageRecordDetail : []
  const errors: string[] = []
  const failReasons: string[] = []
  const records: any[] = []
  for (let i = 0; i < raw.length; i++) {
    const r: any = raw[i] && typeof raw[i] === 'object' ? raw[i] : {}
    const index = Number.isInteger(r.index) ? r.index : i
    const startOk = typeof r.startMs === 'number' && Number.isFinite(r.startMs) && r.startMs >= 0
    const endOk = typeof r.endMs === 'number' && Number.isFinite(r.endMs) && r.endMs >= 0
    if (!startOk || !endOk) {
      const missing = !startOk && !endOk ? 'startMs/endMs' : !startOk ? 'startMs' : 'endMs'
      const m =
        `hook.stageRecordDetail[${index}] is missing a finite ${missing} (the partition cannot be derived positionally from the ` +
        `NON-unique mark names — §3.1/§6 FS10)`
      errors.push(m)
      failReasons.push(m)
      continue
    }
    if (r.endMs < r.startMs) {
      // §3.1/P-IM-1/§6 FS10 — a record's span must CLOSE after it opens: an inverted
      // interval cannot be a measured span (it would make `sumOfSpansMs` negative and
      // the pass window inverted). The record is named and REFUSED, never clamped or
      // imputed into a positive span.
      const m =
        `hook.stageRecordDetail[${index}] carries an INVERTED span (endMs ${o0Num(r.endMs)} < startMs ${o0Num(r.startMs)}) — a record's ` +
        `span must close after it opens (§3.1/P-IM-1/§6 FS10); the record is refused, never clamped or imputed`
      errors.push(m)
      failReasons.push(m)
      continue
    }
    // §4.1 — the derived containment/pass fields are written ONTO the entry (the
    // same object the row carries), so `hook.stageRecordDetail[i].depth`/`passIndex`
    // are the partition's own derivations, never a second copy that can drift.
    r.index = index
    r.ms = isNonNeg(r.ms) ? r.ms : o0Round3(r.endMs - r.startMs)
    // §4.1 — the containment DEPTH is derived from the entry's own span (§3.2 clause 1:
    // the number of records that strictly contain it); `passIndex` is derived from the
    // pass partition below. Both are written onto the entry the row carries.
    r.depth = 0
    r.passIndex = null
    records.push(r)
  }
  return { records, errors, failReasons }
}
/** §3.2 clause 1 — the containment forest: `a` CONTAINS `b` iff
 *  `a.startMs ≤ b.startMs ∧ b.endMs ≤ a.endMs ∧ (strict on at least one side)`.
 *  An IDENTICAL interval is NOT containment (§3.2 clause 5: the ambiguity). */
function o0Containment(records: any[]): { depth: number[]; ambiguities: Array<{ indices: number[]; stages: string[]; interval: { startMs: number; endMs: number } }> } {
  const depth = records.map(() => 0)
  const ambiguities: Array<{ indices: number[]; stages: string[]; interval: { startMs: number; endMs: number } }> = []
  for (let a = 0; a < records.length; a++) {
    for (let b = 0; b < records.length; b++) {
      if (a === b) continue
      const A = records[a]
      const B = records[b]
      if (A.startMs === B.startMs && A.endMs === B.endMs) {
        const pair = [Math.min(A.index, B.index), Math.max(A.index, B.index)]
        if (a < b && !ambiguities.some((x) => x.indices[0] === pair[0] && x.indices[1] === pair[1])) {
          ambiguities.push({
            indices: pair,
            stages: [A.stage, B.stage],
            interval: { startMs: A.startMs, endMs: A.endMs },
          })
        }
        continue
      }
      if (A.startMs <= B.startMs && B.endMs <= A.endMs) depth[b] += 1
    }
  }
  return { depth, ambiguities }
}

/** §2.1/§3.2/§3.3 — the pure PASS PARTITION + the UNION accounting of one freeze
 *  row. Never throws; every refusal is a named reason. */
export function partitionO0RowPasses(rowInput: unknown): O0PassPartition {
  const row: any = rowInput && typeof rowInput === 'object' ? rowInput : {}
  const hook: any = row.hook && typeof row.hook === 'object' ? row.hook : null
  const errors: string[] = []
  const failReasons: string[] = []
  const id = typeof row.id === 'string' && row.id !== '' ? row.id : '<run>'
  const freezeRaw: any = hook && hook.freezeWindow && typeof hook.freezeWindow === 'object' ? hook.freezeWindow : null
  const freeze: { t0: number; t1: number } | null =
    freezeRaw && Number.isFinite(freezeRaw.t0) && Number.isFinite(freezeRaw.t1) ? { t0: freezeRaw.t0, t1: freezeRaw.t1 } : null
  const windowMs = freeze ? o0Round3(freeze.t1 - freeze.t0) : 0
  /** §3.3 — the span union is intersected with the FREEZE window (the row's
   *  measured `o0:t0`/`o0:t1` window), so the measure is comparable with it. */
  const freezeSpanMs = freeze ? o0UnionMeasure([{ startMs: freeze.t0, endMs: freeze.t1 }], null) : 0
  // §2.1/RUL-11 — the two bands are recorded SEPARATELY because they are not
  // interchangeable: `windowBandMs` (hook.toleranceMs, 40 ms) judges the WINDOW BOUND
  // (`outsideMs`/FS6) while `toleranceMs` (tolerance.reconcileMs, 50 ms) judges the
  // UNION REMAINDER. The fifth run judged the remainder against 40 and reported 50.
  const windowBandMs = hook && isNonNeg(hook.toleranceMs) ? hook.toleranceMs : O0_SHAPE_TOLERANCE_MS
  // §2.1/RUL-11 + §13.2 (7) (the ONE authoritative band) — the UNION-REMAINDER band is
  // the band the row RECORDS (`reconciliation.toleranceMs`, the field every producer
  // emits and the report declares), so the band the oracle uses and the band the report
  // publishes are ONE reading that cannot drift. `hook.reconcileToleranceMs` (which no
  // producer emits) survives only as the back-compat fallback for a hand-built row.
  const recordedTolerance =
    row.reconciliation && typeof row.reconciliation === 'object' && isNonNeg(row.reconciliation.toleranceMs)
      ? row.reconciliation.toleranceMs
      : null
  const toleranceMs =
    recordedTolerance !== null
      ? recordedTolerance
      : hook && isNonNeg(hook.reconcileToleranceMs)
        ? hook.reconcileToleranceMs
        : O0_RECONCILE_TOLERANCE_MS
  const naiveSumResidualMs = o0NaiveSumResidual(row)
  // §2.5a RUL-8/§6 S14 — the ROW CLASS: a row is LEGACY-shaped (fourth edition and
  // earlier) when it carries NO `hook.passes[]`. Such a row is refused BY CLASS at the
  // NEW surface (`legacyShape:true` + the reason) — never a silent pass, never a
  // spurious measurement failure.
  //
  // §3b re-audit finding (5) [O0-LEGACYSHAPE-DIVERGENCE]: the derivation here was
  // CONJUNCTIVE (`no passes AND no per-record timestamps`) while the validator reads
  // `legacyShape:true` for ANY row without `hook.passes[]` (the class the landed
  // `ADV-8d` pin fixes). The SAME record set therefore read `false` here and `true`
  // there — two readings of one class on two surfaces. §2.5a pins ONE reading per row
  // class ("a row without `hook.passes[]` IS a legacy row for shape purposes"), so the
  // timestamps conjunct is DROPPED: one class, one reading, both surfaces.
  const legacyShape = !Array.isArray(hook?.passes)
  const legacyShapeReason = legacyShape
    ? `row ${id} is LEGACY-shaped (a fourth-edition row: no hook.passes[] — the per-pass partition of the new measurement ` +
      `shape cannot be read from it) — the NEW surface refuses it BY CLASS (legacyShape:true); the row's own numbers are NOT ` +
      `impugned and the LEGACY path (validateO0Run/validateO0Report/reconcileO0PostStyle) still reads it (§2.5a RUL-8/§6 S14)`
    : null
  const emptyRow = (): O0PassPartition['row'] => ({
    windowMs,
    accountedMs: 0,
    unaccountedMs: null,
    unaccountedReason: null,
    overlapMs: 0,
    sumOfSpansMs: 0,
    outsideMs: 0,
    naiveSumResidualMs,
    naiveSumResidualNote: 'notAResidual',
    naiveSumResidualNotAResidual: true,
    passOverlapSumMs: 0,
    passLongTaskDoubleCountMs: isNonNeg(hook?.passLongTaskDoubleCountMs) ? hook.passLongTaskDoubleCountMs : 0,
    passTotalsMinusRowMs: 0,
    passTotalsMinusRowIsADoubleCount: false,
    passRowUnaccountedDeltaMs: 0,
    passRowUnaccountedDeltaIsAMeasure: false,
    toleranceMs,
    windowBoundToleranceMs: windowBandMs,
    bandExceeded: false,
    bandExceededNote: null,
    outcomeReasons: [],
    remainderStatement: 'row <run>: no remainder was computed (the row carries no records — §3.2 clause 4)',
    // §4.2/D-GP-UFA-3 [O0-ROW-PASS-ASSERTED-NOT-DERIVED] — the row verdict is DERIVED
    // from its own reason set (`pass ⇔ failReasons.length === 0`): the legal empty /
    // unarmed row (§3.2 clause 4) carries NO reason and therefore reads `pass:true`,
    // never the "pass:false with an empty failReasons" pair §6 names as a schema error.
    pass: failReasons.length === 0,
    failReasons,
  })
  // The LEGAL EMPTY CASE (§3.2 clause 4): an unarmed row / a row with no records.
  const raw = Array.isArray(hook?.stageRecordDetail) ? hook.stageRecordDetail : []
  if (raw.length === 0) {
    if (hook && Number.isFinite(hook.records) && hook.records > 0) {
      const m =
        `run ${id}: hook.records is ${String(hook.records)} while hook.stageRecordDetail is empty — the partition cannot be derived and ` +
        `no record may be silently dropped (§3.2 clause 4/§6 FS10)`
      errors.push(m)
      failReasons.push(m)
      const out = emptyRow()
      return {
        ok: false,
        errors,
        failReasons,
        passes: [],
        passCount: 0,
        passKindSequence: [],
        passOverlaps: [],
        nestingAmbiguities: [],
        stageRecordDetail: [],
        row: out,
        legacyShape,
        legacyShapeReason,
      }
    }
    return {
      ok: true,
      errors,
      failReasons,
      passes: [],
      passCount: 0,
      passKindSequence: [],
      passOverlaps: [],
      nestingAmbiguities: [],
      stageRecordDetail: [],
      row: emptyRow(),
      legacyShape,
      legacyShapeReason,
    }
  }
  const set = o0RecordSet(hook)
  // §3.2 clause 1 — the containment depth of every entry, from its own span: the
  // number of OTHER entries whose interval strictly contains it.
  for (const r of set.records) {
    let d = 0
    for (const o of set.records) {
      if (o === r) continue
      if (o.startMs <= r.startMs && r.endMs <= o.endMs && (o.startMs < r.startMs || r.endMs < o.endMs)) d += 1
    }
    r.depth = d
  }
  errors.push(...set.errors)
  failReasons.push(...set.failReasons)
  const records = set.records
  const { ambiguities } = o0Containment(records)
  // §3.2 clause 4 — a record is never silently dropped: an entry no pass group could
  // own (only reachable on a malformed group set) keeps `passIndex: null` and the row
  // names it (§6 FS2).
  for (const amb of ambiguities) {
    const m =
      `records ${amb.indices.join(' and ')} (${amb.stages.join(', ')}) carry an IDENTICAL interval ` +
      `[${amb.interval.startMs}, ${amb.interval.endMs}] — containment is UNDECIDABLE (the shape may not guess which one is outer — ` +
      `§3.2 clause 5/§6 FS3)`
    errors.push(m)
    failReasons.push(m)
  }
  // §3.2 clauses 2/3 — the openers: top-level `snapshot.pull` records in commit order.
  const openers: any[] = records.filter((r) => r.depth === 0 && r.stage === O0_PASS_OPENER_STAGE)
  if (openers.length === 0) {
    failReasons.push(
      `no TOP-LEVEL ${O0_PASS_OPENER_STAGE} record was committed in this window — the record set is UNOPENABLE (a single ` +
        `'pre-pass-render' pass is emitted; no record is dropped — §3.2 clause 2/§4.2)`,
    )
  }
  const groups: any[][] = []
  for (let i = 0; i < openers.length; i++) {
    const from = records.indexOf(openers[i])
    const to = i + 1 < openers.length ? records.indexOf(openers[i + 1]) : records.length
    groups.push(records.slice(from, to))
  }
  if (openers.length > 0) {
    const first = records.indexOf(openers[0])
    if (first > 0) groups.unshift(records.slice(0, first))
  } else {
    groups.push(records.slice())
  }
  const rowStages: any[] = Array.isArray(row.stages) ? row.stages : []
  const rowStageById = new Map<string, any>(rowStages.map((s: any) => [s && typeof s.id === 'string' ? s.id : '', s]))
  const rowLongTasks: any[] = Array.isArray(row.longTasks) ? row.longTasks : []
  const passes: O0ShapePass[] = groups.map((group, gi) => {
    const openerRec = group.find((r) => r.depth === 0 && r.stage === O0_PASS_OPENER_STAGE) ?? null
    const kind = openerRec ? 're-derive' : 'pre-pass-render'
    // §3.2 clause 6 (AMENDED — RUL-11 / §12.4 `F5-4`) — the pass's window is the pass's
    // OWN RECORD span: `min(startMs)`/`max(endMs)` over the pass's records, NESTED
    // RECORDS INCLUDED. The former top-level-only form collapsed pass 0 (the pre-pass
    // render sequence, whose records are contained by a LATER pass's `snapshot.pull`
    // opener) to `{t0:0, t1:0}` and attributed its measured span to NO pass.
    const win = { t0: Math.min(...group.map((r) => r.startMs)), t1: Math.max(...group.map((r) => r.endMs)) }
    // §3.2 clause 6(a) — containment is LOCAL to the pass: the pass's TOP-LEVEL set is
    // the depth-0 set computed WITHIN the pass (a record contained only by a record of
    // a LATER pass is top-level in its own pass; one contained by a record of its OWN
    // pass is nested). The ROW-WIDE `depth` on the entry is unchanged (§4.1).
    const tops = group.filter(
      (r) => !group.some((o) => o !== r && o.startMs <= r.startMs && r.endMs <= o.endMs && (o.startMs < r.startMs || r.endMs < o.endMs)),
    )
    const nested = group.filter((r) => !tops.includes(r))
    const spanMs = o0Round3(win.t1 - win.t0)
    const topSpans = tops.map((r) => ({ index: r.index, stage: r.stage, startMs: r.startMs, endMs: r.endMs }))
    const sumOfSpansMs = o0SumSpans(topSpans)
    // §3.3 — `accountedMs` is the measure of the pass's top-level span UNION
    // (`|⋃(spans ∩ window)|`), computed by interval merging; the SUM of the same
    // spans is recorded ONLY as `sumOfSpansMs` with `notAccounted: true`.
    const accountedMs = o0UnionMeasure(topSpans, win)
    const outsideMs = o0OutsideMeasure(topSpans, freeze)
    const reasons: string[] = []
    const outcome: string[] = []
    const spanUnionMs = o0UnionMeasure(topSpans, null)
    let unaccountedMs: number | null = null
    let unaccountedReason: string | undefined
    if (spanUnionMs > spanMs) {
      // §2.4/§6 FS1 — the union cannot exceed the window: the FIELD is null and the
      // negative number appears ONLY inside the reason, as arithmetic evidence.
      reasons.push(
        `unaccountedMs would be negative (${o0Num(spanMs)} − ${o0Num(spanUnionMs)} = ${o0Num(o0Round3(spanMs - spanUnionMs))}) — the union ` +
          `accounting cannot produce a negative remainder (M1/FS1: the span set or the window is wrong; a negative residual is the defect ` +
          `this unit closes)`,
      )
      unaccountedReason = `the span union ${o0Num(spanUnionMs)} ms exceeds the window ${o0Num(spanMs)} ms — the span set or the window is wrong (M1/FS1)`
      unaccountedMs = null
    } else {
      // §3.3 — `unaccountedMs = window.ms − accountedMs`: the remainder is taken from
      // the SAME (clipped) union `accountedMs` reports, so the §4.1 identity holds
      // exactly (M1/`P-TP-1`: never `window − rawUnion`).
      unaccountedMs = o0Round3(spanMs - accountedMs)
      // §2.1 clause (ii) — a remainder above the band is a LEGITIMATE MEASUREMENT
      // OUTCOME: it is REPORTED on the pass (naming the number and the band), never a
      // defect of the pass's arithmetic and never a forcing reason.
      if (unaccountedMs > toleranceMs) {
        outcome.push(
          `pass ${gi} (${kind}) reconciled with the band EXCEEDED: unaccounted ${o0Num(unaccountedMs)} ms > the recorded ` +
            `${o0Num(toleranceMs)} ms band — reported, never hidden (§2.1(ii)/§4.4)`,
        )
      }
    }
    if (outsideMs > windowBandMs) {
      reasons.push(
        `pass ${gi}: the pass's top-level spans extend ${o0Num(outsideMs)} ms OUTSIDE the freeze window beyond the recorded ` +
          `${o0Num(windowBandMs)} ms WINDOW-BOUND band — a span outside its window is not a measurement of that window (§3.3/§6 FS6)`,
      )
    }
    const passStages = O0_STAGE_IDS.map((sid) => {
      const recs = group.filter((r) => r.stage === sid)
      const ms = recs.length > 0 ? o0Round3(recs.reduce((a, r) => a + r.ms, 0)) : null
      const rowStage = rowStageById.get(sid)
      return {
        id: sid,
        ms,
        unseparated: recs.length === 0,
        source: sid === 'post.style' ? 'derived' : 'hook',
        structural: recs.length === 0 && rowStage?.structural === true,
        structuralReason: recs.length === 0 && typeof rowStage?.structuralReason === 'string' ? rowStage.structuralReason : null,
      }
    })
    const attribution = deriveO0LongTaskAttribution(win, rowLongTasks)
    return {
      index: gi,
      kind,
      opener: openerRec ? { stage: openerRec.stage, recordIndex: openerRec.index } : null,
      window: { t0: win.t0, t1: win.t1, ms: spanMs },
      records: { indices: group.map((r) => r.index), count: group.length, nestedCount: nested.length },
      stageCount: rowStages.length,
      stages: passStages,
      topLevelSpans: topSpans,
      sumOfSpansMs,
      sumOfSpansNotAccounted: true,
      accountedMs,
      unaccountedMs,
      ...(unaccountedReason ? { unaccountedReason } : {}),
      overlapMs: o0Round3(sumOfSpansMs - accountedMs),
      outsideMs,
      longTaskTotalMs: attribution.includedMs,
      pass: reasons.length === 0,
      failReasons: reasons,
    }
  })
  for (let i = 0; i < records.length; i++) {
    const owner = passes.find((p) => p.records.indices.includes(records[i].index))
    records[i].passIndex = owner ? owner.index : null
    if (owner === undefined) {
      const m =
        `record ${records[i].index} (${records[i].stage}) could not be attributed to any pass — every record belongs to exactly ONE pass ` +
        `and a record is never silently dropped (§3.2 clause 4/§6 FS2)`
      errors.push(m)
      failReasons.push(m)
    }
  }
  for (const p of passes) {
    for (const m of p.failReasons) failReasons.push(`pass ${p.index} (${p.kind}): ${m}`)
  }
  // §3.3 — the row-level (AUTHORITATIVE) accounting: the union of ALL top-level spans
  // against the freeze window. `outsideMs` is the measure that falls outside it.
  const allTops = records.filter((r) => r.depth === 0)
  const rowSpans = allTops.map((r) => ({ index: r.index, stage: r.stage, startMs: r.startMs, endMs: r.endMs }))
  const rowSumOfSpansMs = o0SumSpans(rowSpans)
  const rowAccountedMs = o0UnionMeasure(rowSpans, freeze)
  const rowOutsideMs = o0OutsideMeasure(rowSpans, freeze)
  const rowSpanUnionMs = o0UnionMeasure(rowSpans, null)
  let rowUnaccountedMs: number | null = null
  let rowUnaccountedReason: string | null = null
  const rowShapeFailures: string[] = []
  const rowOutcomeReasons: string[] = []
  if (freeze === null) {
    rowUnaccountedReason = 'the freeze window (hook.freezeWindow: o0:t0/o0:t1) is not recorded — the union accounting has no denominator (M1/FS10)'
    rowShapeFailures.push(`run ${id}: hook.freezeWindow is not a recorded o0:t0/o0:t1 pair — the row remainder cannot be computed (M1/§4.1/§6 FS10)`)
  } else if (rowSpanUnionMs > windowMs && rowOutsideMs > windowBandMs) {
    // §2.4/§6 FS1 — the RAW span union exceeds the window AND the overshoot is beyond
    // the recorded band: the span set (or the window) is wrong, so the remainder is
    // NOT COMPUTABLE. The FIELD is `null` and the negative arithmetic appears ONLY
    // inside the reason (M1: a negative residual is the defect this unit closes).
    rowShapeFailures.push(
      `run ${id}: unaccountedMs would be negative (${o0Num(windowMs)} − ${o0Num(rowSpanUnionMs)} = ${o0Num(o0Round3(windowMs - rowSpanUnionMs))}) — ` +
        `the union accounting cannot produce a negative remainder (M1: a negative residual is the defect this unit closes; ` +
        `the span set or the window is wrong)`,
    )
    rowUnaccountedReason = `the span union ${o0Num(rowSpanUnionMs)} ms exceeds the freeze window ${o0Num(windowMs)} ms — the span set or the window is wrong (M1/FS1)`
    rowUnaccountedMs = null
  } else {
    // §2.1/§5 `P-TP-1` (AMENDED — the `FIX-TP1` red) — the row remainder is taken from
    // the SAME CLIPPED union the row's `accountedMs` reports: `windowMs − accountedMs`,
    // so the §4.1 identity `unaccountedMs === windowMs − accountedMs` holds EXACTLY and
    // a span extending past the freeze window (within the recorded band — §3.3/FS6)
    // can never drive the remainder negative.
    rowUnaccountedMs = o0Round3(windowMs - rowAccountedMs)
  }
  if (rowOutsideMs > windowBandMs) {
    rowShapeFailures.push(
      `run ${id}: a top-level span extends ${o0Num(rowOutsideMs)} ms OUTSIDE the freeze window beyond the recorded ${o0Num(windowBandMs)} ms ` +
        `WINDOW-BOUND band (record index(es) ${allTops
          .filter((r) => r.startMs < (freeze?.t0 ?? 0) - windowBandMs || r.endMs > (freeze?.t1 ?? 0) + windowBandMs)
          .map((r) => r.index)
          .join(', ')} — the H3 window-bound rule extended to the span data (§3.3/§6 FS6)`,
    )
  }
  const bandExceeded = rowUnaccountedMs !== null && rowUnaccountedMs > toleranceMs
  // §2.1 clause (ii) — `unaccountedMs > toleranceMs` is a LEGITIMATE MEASUREMENT
  // OUTCOME ("reconciled with the band exceeded"), NOT a shape defect: the remainder
  // is REPORTED (`bandExceeded:true` + `row.remainderStatement`), never a forcing
  // reason. Only a NEGATIVE (unreachable) remainder, a not-computable one, or a span
  // outside its window beyond the band is a failure of the shape.
  if (bandExceeded) {
    rowOutcomeReasons.push(
      `run ${id}: the row remainder ${o0Num(rowUnaccountedMs)} ms of the ${o0Num(windowMs)} ms measured window EXCEEDS the recorded ` +
        `${o0Num(toleranceMs)} ms band — the remainder is REPORTED, never attributed: it is DERIVED (unaccountedSource 'derived') and ` +
        `attributable:false, never a stage cost (§2.1(iii)/§4.4)`,
    )
  }
  const remainderStatement = bandExceeded
    ? `row ${id}: unaccounted ${o0Num(rowUnaccountedMs)} ms of the ${o0Num(windowMs)} ms measured window EXCEEDS the recorded ` +
      `${o0Num(toleranceMs)} ms band (${passes.length} pass(es)) — the remainder is reported, never attributed`
    : rowUnaccountedMs !== null
      ? `row ${id}: unaccounted ${o0Num(rowUnaccountedMs)} ms of the ${o0Num(windowMs)} ms measured window over ${passes.length} pass(es) ` +
        `(${passes.map((p) => p.kind).join(', ')}) — DERIVED remainder, attributable:false, never a style/layout cost`
      : `row ${id}: the unaccounted remainder is NOT COMPUTABLE: ${String(rowUnaccountedReason)}`
  const passUnaccountedSum = o0Round3(passes.reduce((a, p) => a + (p.unaccountedMs ?? 0), 0))
  const passTotalsSum = o0Round3(passes.reduce((a, p) => a + p.longTaskTotalMs, 0))
  const rowLongTaskTotalMs = isNonNeg(row.longTaskTotalMs) ? row.longTaskTotalMs : passTotalsSum
  // §2.3/§2.4 (RUL-11 / §12.4 — the `F5-2` fix) — `passLongTaskDoubleCountMs` is a
  // MEASURE, non-negative by construction: the sum of the `duration` of every observed
  // task counted (start-inside) by TWO OR MORE pass windows. The SIGNED difference
  // `Σ(pass totals) − row total` (which the FIFTH run emitted as −53 / −95 / −63)
  // survives ONLY as the labeled diagnostic `passTotalsMinusRowMs`.
  const passLongTaskDoubleCountMs = o0Round3(
    rowLongTasks
      .filter((e: any) => e && typeof e === 'object' && Number.isFinite(e.start))
      .filter((e: any) => passes.filter((p) => p.window.t0 <= e.start && e.start <= p.window.t1).length >= 2)
      .reduce((a: number, e: any) => a + (isNonNeg(e.duration) ? e.duration : 0), 0),
  )
  const passTotalsMinusRowMs = o0Round3(passTotalsSum - rowLongTaskTotalMs)
  // §3.3/§2.4 (RUL-11 / §12.4 — the `F5-3` fix) — `passOverlapSumMs` is a MEASURE of
  // the passes' attribution layer, non-negative by construction: the measure of the
  // UNION of the pairwise INTERSECTIONS of the pass windows (`0` when they are pairwise
  // disjoint). The signed `Σ(pass.unaccountedMs) − row.unaccountedMs` difference — which
  // the FIFTH run emitted as −131.2 … −17.6 — survives ONLY as the labeled diagnostic
  // `passRowUnaccountedDeltaMs`.
  const passWindowIvs = passes.map((p) => ({ startMs: p.window.t0, endMs: p.window.t1 }))
  const passInterIvs: Array<{ startMs: number; endMs: number }> = []
  const passOverlaps: Array<{ a: number; b: number; overlapMs: number }> = []
  for (let i = 0; i < passes.length; i++) {
    for (let j = i + 1; j < passes.length; j++) {
      const a = Math.max(passWindowIvs[i].startMs, passWindowIvs[j].startMs)
      const b = Math.min(passWindowIvs[i].endMs, passWindowIvs[j].endMs)
      if (b > a) {
        passInterIvs.push({ startMs: a, endMs: b })
        passOverlaps.push({ a: passes[i].index, b: passes[j].index, overlapMs: o0Round3(b - a) })
      }
    }
  }
  const passOverlapSumMs = o0UnionMeasure(passInterIvs, null)
  const passRowUnaccountedDeltaMs = o0Round3(passUnaccountedSum - (rowUnaccountedMs !== null ? rowUnaccountedMs : passUnaccountedSum))
  const shapeFailures = [...new Set([...set.failReasons, ...ambiguities.map((a) => a.indices.join('/')), ...rowShapeFailures])]
  void shapeFailures
  // §4.2/D-GP-UFA-3 [O0-ROW-PASS-ASSERTED-NOT-DERIVED] — the row's reason set is
  // assembled FIRST and the verdict is then DERIVED from it (`row.pass ⇔
  // row.failReasons.length === 0`), never asserted from a parallel expression: the
  // UNOPENABLE/FS-n branches push their reason and can therefore never leave the row
  // reading `pass:true` beside a reason, and the legal empty row can never leave it
  // reading `pass:false` beside an empty set.
  const rowFailReasons = [...new Set([...rowShapeFailures, ...failReasons])]
  return {
    // §4.2/§2.1(ii) — `ok` is the PARTITION's own validity (the FS1/FS3/FS6/FS10 shape
    // failures). A recorded row OUTCOME (a band-exceeded remainder) is reported on the
    // ROW (`row.bandExceededNote`), never as a partition defect.
    ok: errors.length === 0 && rowShapeFailures.length === 0 && set.failReasons.length === 0 && ambiguities.length === 0,
    errors,
    // §2.1(ii)/S11 + §13.2 (7) [O0-UNION-BAND-FIELD-DRIFT] — a band-exceeded remainder is
    // a MEASUREMENT OUTCOME and lives ONLY on its own labeled channel
    // (`row.outcomeReasons` / `row.bandExceededNote`). It is NOT pushed into this
    // reason set: a consumer that greps `failReasons` as the FORCING channel must not be
    // able to reintroduce the `F5-1` gate the sixth run removed.
    failReasons: [...new Set([...failReasons, ...rowShapeFailures, ...set.failReasons])],
    passes,
    passCount: passes.length,
    passKindSequence: passes.map((p) => p.kind),
    passOverlaps,
    nestingAmbiguities: ambiguities,
    stageRecordDetail: records,
    row: {
      windowMs,
      accountedMs: rowAccountedMs,
      unaccountedMs: rowUnaccountedMs,
      unaccountedReason: rowUnaccountedReason,
      overlapMs: o0Round3(rowSumOfSpansMs - rowAccountedMs),
      sumOfSpansMs: rowSumOfSpansMs,
      outsideMs: rowOutsideMs,
      naiveSumResidualMs,
      naiveSumResidualNote: 'notAResidual',
      naiveSumResidualNotAResidual: true,
      passOverlapSumMs,
      passLongTaskDoubleCountMs,
      passTotalsMinusRowMs,
      passTotalsMinusRowIsADoubleCount: false,
      passRowUnaccountedDeltaMs,
      passRowUnaccountedDeltaIsAMeasure: false,
      toleranceMs,
      windowBoundToleranceMs: windowBandMs,
      bandExceeded,
      bandExceededNote: bandExceeded ? rowOutcomeReasons[0] : null,
      outcomeReasons: rowOutcomeReasons,
      remainderStatement,
      // §2.1(ii)/§4.2 + RUL-11 (the `F5-1` fix) — the ROW's verdict is about the SHAPE:
      // a band-exceeded remainder is a LEGITIMATE MEASUREMENT OUTCOME and must NOT set
      // `pass:false`, must NOT enter `failReasons` and must NOT gate the report; it is
      // REPORTED (`bandExceeded:true` + `bandExceededNote`). The verdict is DERIVED from
      // the assembled reason set (§4.2/D-GP-UFA-3): `pass ⇔ failReasons.length === 0`.
      pass: rowFailReasons.length === 0,
      failReasons: rowFailReasons,
    },
    legacyShape,
    legacyShapeReason,
  }
}

// ---------------------------------------------------------------------------
// §2.3/§3.4 — the PINNED long-task attribution rule + the discriminated alternatives.
// ---------------------------------------------------------------------------
export interface O0LongTaskAttribution {
  ok: boolean
  errors: string[]
  failReasons: string[]
  rule: string
  window: { t0: number; t1: number }
  includedCount: number
  includedMs: number
  startBefore: Array<{ start: number; duration: number; overlapMs: number }>
  straddlesEnd: Array<{ start: number; duration: number; overlapMs: number }>
  startBeforeOverlapMs: number
  straddleEndMs: number
  /** §3.4 — the observations NOT counted by the pinned rule are never silently absent:
   *  the tasks that start AFTER `t1` are recorded as a count + a duration total. */
  startAfterCount: number
  startAfterMs: number
  overlapAnyMs: number
  intersectionMs: number
  ambiguous: boolean
  ambiguityReason: string | null
}
/** §2.3 — the PINNED oracle: a task counts iff its START is inside the window
 *  (`t0 ≤ start ≤ t1`, inclusive at BOTH endpoints) and its FULL `duration` is
 *  added. `overlap-any` and `intersection` are NOT implemented: their totals are
 *  recorded here for DISCRIMINATION only, never used as the oracle. */
export function deriveO0LongTaskAttribution(windowInput: unknown, longTasksInput: unknown, opts: any = {}): O0LongTaskAttribution {
  const w: any = windowInput && typeof windowInput === 'object' ? windowInput : {}
  const t0 = Number.isFinite(w.t0) ? w.t0 : 0
  const t1 = Number.isFinite(w.t1) ? w.t1 : 0
  const win = { t0, t1 }
  const list: any[] = Array.isArray(longTasksInput) ? longTasksInput : []
  const errors: string[] = []
  const failReasons: string[] = []
  const norm = list
    .filter((e: any) => e && typeof e === 'object')
    .map((e: any) => ({ start: Number.isFinite(e.start) ? e.start : Number.NaN, duration: isNonNeg(e.duration) ? e.duration : 0 }))
  for (let i = 0; i < norm.length; i++) {
    if (!Number.isFinite(norm[i].start)) {
      const m = `longTasks[${i}] carries no finite start (the attribution cannot place the task in the window — §3.4/§6 FS10)`
      errors.push(m)
      failReasons.push(m)
    }
  }
  const usable = norm.filter((e) => Number.isFinite(e.start))
  const inside = usable.filter((e) => t0 <= e.start && e.start <= t1)
  const includedMs = o0Round3(inside.reduce((a, e) => a + e.duration, 0))
  const overlapAnyMs = o0Round3(usable.filter((e) => e.start <= t1 && e.start + e.duration > t0).reduce((a, e) => a + e.duration, 0))
  const intersectionMs = o0Round3(usable.reduce((a, e) => a + Math.max(0, Math.min(e.start + e.duration, t1) - Math.max(e.start, t0)), 0))
  const startBefore = usable
    .filter((e) => e.start < t0 && e.start + e.duration > t0)
    .map((e) => ({ start: e.start, duration: e.duration, overlapMs: o0Round3(Math.min(e.start + e.duration, t1) - t0) }))
  const straddlesEnd = usable
    .filter((e) => e.start <= t1 && e.start + e.duration > t1)
    .map((e) => ({ start: e.start, duration: e.duration, overlapMs: o0Round3(e.start + e.duration - t1) }))
  const startBeforeOverlapMs = o0Round3(startBefore.reduce((a, e) => a + Math.max(0, e.overlapMs), 0))
  const straddleEndMs = o0Round3(straddlesEnd.reduce((a, e) => a + Math.max(0, e.overlapMs), 0))
  // §3.4 — every task the pinned rule does NOT count is recorded: `startBefore` and
  // `straddlesEnd` carry theirs, and the tasks starting AFTER `t1` are counted here.
  const startAfter = usable.filter((e) => e.start > t1)
  const startAfterCount = startAfter.length
  const startAfterMs = o0Round3(startAfter.reduce((a, e) => a + e.duration, 0))
  const ambiguous = startBeforeOverlapMs > 0 || straddleEndMs > 0
  const observed = [...startBefore, ...straddlesEnd]
    .map((e) => `start ${o0Num(e.start)} dur ${o0Num(e.duration)} (overlap ${o0Num(e.overlapMs)} ms)`)
    .join('; ')
  const ambiguityReason = ambiguous
    ? `the attribution is AMBIGUOUS under the pinned start-inside-inclusive rule: ${observed} — the pinned rule counts a long task ` +
      `iff its START is inside [${o0Num(t0)}, ${o0Num(t1)}] and adds its FULL duration, so a task starting before the window is ` +
      `EXCLUDED although it overlaps it, and a task starting inside and ending after it is counted IN FULL (§2.3/§6 FS5)`
    : null
  return {
    ok: errors.length === 0,
    errors,
    failReasons,
    rule: O0_LONGTASK_RULE,
    window: win,
    includedCount: inside.length,
    includedMs,
    startBefore,
    straddlesEnd,
    startBeforeOverlapMs,
    straddleEndMs,
    startAfterCount,
    startAfterMs,
    overlapAnyMs,
    intersectionMs,
    ambiguous,
    ambiguityReason,
  }
}

// ---------------------------------------------------------------------------
// §2.2/§3.5 — the PER-ROW arm/disarm counts (the pre-arm + POST-DISARM readings).
// ---------------------------------------------------------------------------
export interface O0RowArmCounts {
  rowArmCount: number | null
  rowDisarmCount: number | null
  sessionArmCount: number | null
  sessionDisarmCount: number | null
  sessionCountsAt: { pre: any; post: any } | null
  ok: boolean
  errors: string[]
  failReasons: string[]
}
/** §2.2 — `rowArmCount = post.arm − pre.arm`, `rowDisarmCount = post.disarm −
 *  pre.disarm`, with `pre` taken immediately BEFORE the row's arm and `post`
 *  immediately AFTER the row's OWN disarm. A missing reading is NAMED, never
 *  coerced to 0 (the no-imputation rule). */
export function deriveO0RowArmCounts(hookInput: unknown): O0RowArmCounts {
  const hook: any = hookInput && typeof hookInput === 'object' ? hookInput : {}
  const errors: string[] = []
  const failReasons: string[] = []
  const at: any = hook.sessionCountsAt && typeof hook.sessionCountsAt === 'object' ? hook.sessionCountsAt : null
  const pre: any = at && at.pre && typeof at.pre === 'object' ? at.pre : null
  const post: any = at && at.post && typeof at.post === 'object' ? at.post : null
  const out = (extra: Partial<O0RowArmCounts> = {}): O0RowArmCounts => ({
    rowArmCount: null,
    rowDisarmCount: null,
    sessionArmCount: null,
    sessionDisarmCount: null,
    sessionCountsAt: at ? { pre, post } : null,
    ok: false,
    errors,
    failReasons,
    ...extra,
  })
  if (at === null || pre === null || post === null) {
    const missing = at === null ? 'hook.sessionCountsAt' : pre === null ? 'hook.sessionCountsAt.pre' : 'hook.sessionCountsAt.post'
    const m =
      `${missing} is missing — the per-row arm/disarm counts cannot be derived (the readings are the pre-arm and the POST-DISARM ` +
      `reading; a missing reading is NAMED, never coerced to 0 — §2.2/§6 FS4/FS10)`
    errors.push(m)
    failReasons.push(m)
    return out()
  }
  const bad = (field: string): boolean => !Number.isInteger(pre[field]) || !Number.isInteger(post[field]) || pre[field] < 0 || post[field] < 0
  let missingCount = false
  for (const f of ['arm', 'disarm']) {
    if (bad(f)) {
      const m =
        `hook.sessionCountsAt.pre.${f}/post.${f} is ${String(pre[f])}/${String(post[f])} (the arm and disarm readings must be ` +
        `non-negative integers — no count is imputed — §2.2/§6 FS4)`
      errors.push(m)
      failReasons.push(m)
      missingCount = true
    }
  }
  if (missingCount) return out()
  const rowArmCount = post.arm - pre.arm
  const rowDisarmCount = post.disarm - pre.disarm
  if (Number.isFinite(pre.at) && Number.isFinite(post.at) && post.at < pre.at) {
    const m =
      `the two readings are out of order: hook.sessionCountsAt.post.at ${o0Num(post.at)} precedes ` +
      `hook.sessionCountsAt.pre.at ${o0Num(pre.at)} — the post reading must be taken immediately AFTER the row's own disarm (§2.2/§6 FS4)`
    errors.push(m)
    failReasons.push(m)
  }
  const delta = rowArmCount - rowDisarmCount
  if (delta < 0 || delta > 1) {
    const m =
      `the per-row arming violates the pinned invariant 0 ≤ rowArmCount − rowDisarmCount ≤ 1: rowArmCount ${rowArmCount}, ` +
      `rowDisarmCount ${rowDisarmCount} (pre ${pre.arm}/${pre.disarm} vs post ${post.arm}/${post.disarm} — the readings are the ` +
      `pre-arm and the POST-DISARM one; a row deriving its counts from the PRE-disarm reading lands the row's own disarm on the ` +
      `NEXT row — §2.2/§6 FS4)`
    errors.push(m)
    failReasons.push(m)
  }
  const armed = hook.armed === true
  if (armed && (rowArmCount !== 1 || rowDisarmCount !== 1)) {
    const m =
      `the row is ARMED (hook.armed true) with a completed drain, so it must read exactly 1/1 — got rowArmCount ${rowArmCount}, ` +
      `rowDisarmCount ${rowDisarmCount} (session arm ${post.arm}/disarm ${post.disarm} at the post-disarm reading — §2.2/§6 FS4)`
    errors.push(m)
    failReasons.push(m)
  }
  if (!armed && (rowArmCount !== 0 || rowDisarmCount !== 0)) {
    const m =
      `the UNARMED baseline row must read exactly 0/0 — got rowArmCount ${rowArmCount}, rowDisarmCount ${rowDisarmCount} (§2.2/S3/§6 FS4)`
    errors.push(m)
    failReasons.push(m)
  }
  const sessionArmCount = post.arm
  const sessionDisarmCount = post.disarm
  if (sessionArmCount < rowArmCount || sessionDisarmCount < rowDisarmCount) {
    const m =
      `sessionArmCount ${sessionArmCount} / sessionDisarmCount ${sessionDisarmCount} are BELOW the row counts ` +
      `${rowArmCount}/${rowDisarmCount} — the session counters are cumulative and must stay ≥ the per-row counts (§2.2/P-SM-1)`
    errors.push(m)
    failReasons.push(m)
  }
  return {
    rowArmCount,
    rowDisarmCount,
    sessionArmCount,
    sessionDisarmCount,
    sessionCountsAt: { pre, post },
    ok: errors.length === 0,
    errors,
    failReasons,
  }
}

// ---------------------------------------------------------------------------
// §6 FS1..FS10 — the MEASUREMENT-SHAPE validator (the NEW surface's gate).
// A LEGACY row (the fourth-edition shape: no `hook.passes`, the bare session
// aliases, the summed residual) fed here returns an explicit refusal naming the
// missing NEW fields — that IS the S14/FS9/FS10 outcome (RUL-8); the legacy
// validators (`validateO0Run`/`validateO0Report`) are untouched.
// ---------------------------------------------------------------------------
export function validateO0MeasurementShape(rowInput: unknown): O0Result & { legacyShape: boolean; legacyShapeReason: string | null; notes: string[] } {
  const row: any = rowInput && typeof rowInput === 'object' ? rowInput : {}
  const errors: string[] = []
  const failReasons: string[] = []
  const notes: string[] = []
  const aggregationNotes: string[] = []
  const err = (m: string) => {
    errors.push(m)
    failReasons.push(m)
  }
  const hook: any = row.hook && typeof row.hook === 'object' ? row.hook : null
  const id = typeof row.id === 'string' && row.id !== '' ? row.id : '<run>'
  // §6 FS11 (RUL-11 / §12.4 — the `F5-2`/`F5-3` fix) — the pinned reason shape for a
  // NEGATIVE MEASURE: the field path, the number and the pinned definition. The FIFTH
  // run emitted `passLongTaskDoubleCountMs` −53/−95/−63 and `passOverlapSumMs`
  // −131.2…−17.6 while this validator returned `ok:true` (F5-5).
  const fs11 = (path: string, v: number, definition: string): string =>
    `${path} ${o0Num(v)} is negative — the field is a MEASURE and is non-negative by construction (${definition}); a negative value is ` +
    `a computation defect, not an outcome (M1/RUL-11/§6 FS11)`
  let legacyShape = false
  let legacyShapeReason: string | null = null
  if (hook === null) {
    legacyShapeReason = `run ${id} carries no hook block — the measurement shape (hook.passes[], the per-row counts, the long-task attribution) cannot be read from it (§2.5a RUL-8/§6 S14)`
    err(`run ${id}: hook is ${String(row.hook)} — ${legacyShapeReason} (§4.1/§6 FS10)`)
    return { ok: false, errors, failReasons, legacyShape: true, legacyShapeReason, notes }
  }

  // --- FS9 — the RETIRED session aliases -----------------------------------
  const aliasPresent = hook.armCount !== undefined || hook.disarmCount !== undefined
  const explicitPresent = hook.rowArmCount !== undefined || hook.rowDisarmCount !== undefined
  if (aliasPresent && explicitPresent) {
    err(
      `run ${id}: hook.armCount/hook.disarmCount are retired session aliases (M2) — report hook.rowArmCount/hook.rowDisarmCount and ` +
        `hook.sessionArmCount/hook.sessionDisarmCount instead (a field whose name implies a per-row count while carrying a SESSION total ` +
        `IS the M2 defect — §2.2/§6 FS9)`,
    )
  }
  if (aliasPresent && !explicitPresent) {
    legacyShape = true
    legacyShapeReason =
      `run ${id} is LEGACY-shaped: it carries the retired bare hook.armCount/hook.disarmCount and no hook.rowArmCount/rowDisarmCount ` +
      `(a fourth-edition row) — refused BY CLASS at the NEW surface (§2.5a RUL-8/§6 S14/FS9); the LEGACY path still reads its numbers`
    err(
      `run ${id}: the row carries ONLY the retired session aliases hook.armCount/hook.disarmCount — the per-row shape requires ` +
        `hook.rowArmCount/hook.rowDisarmCount + hook.sessionArmCount/hook.sessionDisarmCount + hook.sessionCountsAt (§2.2/§6 FS9, S14)`,
    )
  }

  // --- §2.2/FS4 — the per-row counts must satisfy the invariant ------------
  for (const f of ['rowArmCount', 'rowDisarmCount']) {
    if (!Number.isInteger(hook[f]) || hook[f] < 0) {
      err(`run ${id}: hook.${f} is ${String(hook[f])} (the per-row count must be a non-negative integer — §2.2/§6 FS4/FS10)`)
    }
  }
  if (Number.isInteger(hook.rowArmCount) && Number.isInteger(hook.rowDisarmCount) && hook.rowArmCount >= 0 && hook.rowDisarmCount >= 0) {
    const delta = hook.rowArmCount - hook.rowDisarmCount
    if (delta < 0 || delta > 1) {
      err(
        `run ${id}: the readings rowArmCount ${hook.rowArmCount}, rowDisarmCount ${hook.rowDisarmCount} violate the pinned invariant ` +
          `0 ≤ rowArmCount − rowDisarmCount ≤ 1 (the readings are the pre-arm and the POST-DISARM one — §2.2/§6 FS4)`,
      )
    }
    if (hook.armed === true && (hook.rowArmCount !== 1 || hook.rowDisarmCount !== 1)) {
      err(
        `run ${id}: an ARMED row with a completed drain must read exactly 1/1 — got rowArmCount ${hook.rowArmCount}, ` +
          `rowDisarmCount ${hook.rowDisarmCount} (§2.2/§6 FS4)`,
      )
    }
    if (hook.armed === false && (hook.rowArmCount !== 0 || hook.rowDisarmCount !== 0)) {
      err(
        `run ${id}: the UNARMED baseline must read exactly 0/0 — got rowArmCount ${hook.rowArmCount}, rowDisarmCount ${hook.rowDisarmCount} (§2.2/S3/§6 FS4)`,
      )
    }
  }
  const counts = hook.sessionCountsAt
  const armDerived = deriveO0RowArmCounts(hook)
  if (!counts || typeof counts !== 'object' || !counts.pre || !counts.post) {
    // §3b re-audit finding (1) [O0-SHAPE-REASON-DROPPED-FROM-THE-FORCING-CHANNEL] —
    // this reason entered `failReasons` WITHOUT `errors[]`, so `ok` (which read
    // `errors.length === 0`) stayed `true` beside it and the driver — copying
    // `shape.failReasons` only when `!shape.ok` — DROPPED it from the report. A missing
    // reading is an FS10 observable: the reason is minted through the SAME forcing
    // channel (`err`, which writes BOTH sets) as every other clause of this validator.
    err(
      `run ${id}: hook.sessionCountsAt is ${JSON.stringify(counts) ?? String(counts)} — the pre-arm and POST-DISARM readings are the ` +
        `inputs of the per-row counts and must be recorded with their performance.now() stamps (§2.2/§6 FS10)`,
    )
    // §3b re-audit finding (1), the second half — the DERIVED reader's own reasons are
    // folded into the forcing channel as well: a reading that exists but is illegal
    // (a non-integer count, the two readings OUT OF ORDER, an armed row that is not
    // 1/1) was readable from `deriveO0RowArmCounts` while `ok` still read `true` here.
    for (const m of armDerived.failReasons) err(`run ${id}: ${m} (§2.2/§6 FS4)`)
  } else {
    for (const m of armDerived.failReasons) {
      // §3b re-audit finding (1) — the derivation's reasons are part of THIS row's
      // shape verdict: the reader is the oracle for the arm/disarm counts (§2.2), and a
      // reason it mints may not be visible only to a caller that remembers to ask.
      err(`run ${id}: ${m}`)
    }
    if (Number.isInteger(hook.rowArmCount) && armDerived.rowArmCount !== null && hook.rowArmCount !== armDerived.rowArmCount) {
      err(
        `run ${id}: hook.rowArmCount ${hook.rowArmCount} disagrees with the delta of the recorded readings ` +
          `(post.arm ${String(counts.post?.arm)} − pre.arm ${String(counts.pre?.arm)} = ${armDerived.rowArmCount}) (§2.2/§6 FS4)`,
      )
    }
    if (Number.isInteger(hook.rowDisarmCount) && armDerived.rowDisarmCount !== null && hook.rowDisarmCount !== armDerived.rowDisarmCount) {
      err(
        `run ${id}: hook.rowDisarmCount ${hook.rowDisarmCount} disagrees with the delta of the recorded readings ` +
          `(post.disarm ${String(counts.post?.disarm)} − pre.disarm ${String(counts.pre?.disarm)} = ${armDerived.rowDisarmCount}) (§2.2/§6 FS4)`,
      )
    }
  }
  for (const f of ['sessionArmCount', 'sessionDisarmCount']) {
    if (!Number.isInteger(hook[f]) || hook[f] < 0) {
      err(`run ${id}: hook.${f} is ${String(hook[f])} (the session-scoped cumulative reading must be recorded — §2.2/§6 FS10)`)
    }
  }
  if (Number.isInteger(hook.sessionArmCount) && Number.isInteger(hook.rowArmCount) && hook.sessionArmCount < hook.rowArmCount) {
    err(`run ${id}: sessionArmCount ${hook.sessionArmCount} < rowArmCount ${hook.rowArmCount} — the session counters are cumulative (§2.2/P-SM-1)`)
  }

  // --- §3.2 clause 4 / FS10 — `hook.passes[]` ---------------------------------
  if (!Array.isArray(hook.passes)) {
    legacyShape = true
    legacyShapeReason =
      legacyShapeReason ??
      `run ${id} is LEGACY-shaped: no hook.passes[] (the per-pass partition cannot be derived from it) — refused BY CLASS at the ` +
        `NEW surface (§2.5a RUL-8/§6 S14/FS10); the LEGACY path (validateO0Run/validateO0Report) still reads its numbers`

    err(
      `run ${id}: hook.passes is ${String(hook.passes)} — a row that DECLARES the new measurement shape must carry hook.passes[] ` +
        `(the per-pass partition; a legacy fourth-edition row carries no hook.passes and is refused here explicitly — §3.2 clause 4/§6 FS10, RUL-8)`,
    )
  } else {
    hook.passes.forEach((p: any, i: number) => {
      if (!p || typeof p !== 'object') {
        err(`run ${id}: hook.passes[${i}] is ${JSON.stringify(p) ?? String(p)} (a pass sub-row must be an object — §4.2/§6 FS10)`)
        return
      }
      const pfx = `run ${id}: hook.passes[${i}]`
      for (const f of ['index', 'kind', 'window', 'records', 'stageCount', 'stages', 'topLevelSpans', 'sumOfSpansMs', 'accountedMs', 'unaccountedMs', 'overlapMs', 'outsideMs', 'longTaskTotalMs', 'pass', 'failReasons']) {
        if (!Object.prototype.hasOwnProperty.call(p, f)) err(`${pfx} is missing the field \`${f}\` (§4.2/P-IM-1/§6 FS10 — the field path is named, never a coerced value)`)
      }
      if (!O0_PASS_KINDS.includes(String(p.kind))) {
        err(`${pfx}.kind is ${JSON.stringify(p.kind)} (the closed 2-value set ${O0_PASS_KINDS.join('|')} — §4.2)`)
      }
      const openerOk = p.kind === 'pre-pass-render' ? p.opener === null : p.opener && p.opener.stage === O0_PASS_OPENER_STAGE
      if (!openerOk) {
        err(`${pfx}.opener is ${JSON.stringify(p.opener) ?? String(p.opener)} (kind 'pre-pass-render' ⇔ opener null; 're-derive' ⇔ opener.stage ${O0_PASS_OPENER_STAGE} — §4.2)`)
      }
      // §4.2/P-IM-2 — the closed-set clause: a pass that DECLARES populated stages[]
      // must carry the closed 11-id set exactly once; an EMPTY stages[] is the fixture
      // placeholder of a pass under construction (the FS10 missing-field clause above
      // names an ABSENT stages[] field).
      //
      // The clause is TOTALITY-shaped: the CARRIED count must equal the row's DECLARED
      // stage count (`row.stageCount`, the §2.2 eleven) as well as the closed set's
      // size, so a pass carrying MORE ids than the closed set (12 vs 11) is refused
      // exactly like one carrying fewer.
      const declaredStageCount = Number.isInteger(row.stageCount) ? row.stageCount : O0_STAGE_COUNT
      if (Array.isArray(p.stages)) {
        // §4.2/P-IM-2/§6 FS10 — the closed set: every pass that carries a POPULATED
        // stages[] must carry the §2.2 eleven ids, EACH EXACTLY ONCE. The reason names
        // the id COUNT (the closed-set size, the carried size) and the missing/
        // duplicated ids, never a coerced id or index.
        if (p.stages.length > 0) {
          const ids = p.stages.map((s: any) => (s && typeof s === 'object' ? s.id : undefined))
          const missing = O0_STAGE_IDS.filter((sid) => !ids.includes(sid))
          const counts = new Map<string, number>()
          for (const x of ids) if (typeof x === 'string') counts.set(x, (counts.get(x) ?? 0) + 1)
          const duplicated = [...counts.keys()].filter((x) => (counts.get(x) ?? 0) > 1)
          const unknown = ids.filter((x: any) => typeof x !== 'string' || !O0_STAGE_IDS.includes(x))
          if (p.stages.length !== O0_STAGE_COUNT || p.stages.length > declaredStageCount || missing.length || duplicated.length || unknown.length) {
            err(
              `${pfx}.stages carries ${p.stages.length} stage id(s) — the closed §2.2 ${O0_STAGE_COUNT}-id set (each exactly once) is ` +
                `required on every populated pass` +
                (missing.length ? `: missing ${missing.join(', ')}` : '') +
                (duplicated.length ? `: duplicated ${duplicated.join(', ')}` : '') +
                (unknown.length ? `: unknown ${unknown.map(String).join(', ')}` : '') +
                ` (§4.2/P-IM-2/§6 FS10)`,
            )
          }
        }
      } else {
        err(`${pfx}.stages is ${String(p.stages)} (the pass's own per-id SUMS over the closed ${O0_STAGE_COUNT}-id set — §4.2/§6 FS10)`)
      }
      if (!p.records || typeof p.records !== 'object' || !Array.isArray(p.records.indices)) {
        err(`${pfx}.records is ${JSON.stringify(p.records) ?? String(p.records)} (expected {indices, count, nestedCount} — §4.2/§6 FS10)`)
      } else if (Number.isFinite(p.records.count) && p.records.count !== p.records.indices.length) {
        err(`${pfx}.records.count ${p.records.count} ≠ records.indices.length ${p.records.indices.length} (§4.2/§3.2 clause 4)`)
      }
      const win: any = p.window && typeof p.window === 'object' ? p.window : null
      const winMs = win && Number.isFinite(win.ms) ? win.ms : null
      if (winMs === null || winMs < 0) {
        err(`${pfx}.window.ms is ${String(win?.ms)} (the pass's own MEASURED span must be a non-negative finite number — §4.2)`)
      }
      if (isNonNeg(p.accountedMs) && winMs !== null && p.accountedMs > winMs) {
        err(
          `${pfx}.accountedMs ${o0Num(p.accountedMs)} exceeds window.ms ${o0Num(winMs)} — the union of the pass's top-level spans ∩ its ` +
            `window cannot be larger than the window (M1/§6 FS1)`,
        )
      }
      if (isNonNeg(p.sumOfSpansMs) && isNonNeg(p.accountedMs) && p.sumOfSpansMs < p.accountedMs) {
        err(`${pfx}: sumOfSpansMs ${o0Num(p.sumOfSpansMs)} < accountedMs ${o0Num(p.accountedMs)} (§4.2: sumOfSpansMs ≥ accountedMs)`)
      }
      if (isNonNeg(p.overlapMs) && isNonNeg(p.sumOfSpansMs) && isNonNeg(p.accountedMs) && Math.abs(p.overlapMs - (p.sumOfSpansMs - p.accountedMs)) > 0.001) {
        err(`${pfx}.overlapMs ${o0Num(p.overlapMs)} ≠ sumOfSpansMs − accountedMs (§4.2)`)
      }
      if (p.unaccountedMs !== null && p.unaccountedMs !== undefined) {
        if (!isNonNeg(p.unaccountedMs)) {
          err(`${pfx}.unaccountedMs is ${String(p.unaccountedMs)} (a remainder is null + a named reason, or a non-negative number — §2.4/§6 FS1)`)
        } else if (winMs !== null && isNonNeg(p.accountedMs) && Math.abs(p.unaccountedMs - (winMs - p.accountedMs)) > 0.001) {
          err(`${pfx}.unaccountedMs ${o0Num(p.unaccountedMs)} ≠ window.ms ${o0Num(winMs)} − accountedMs ${o0Num(p.accountedMs)} (§3.3)`)
        }
      } else if (typeof p.unaccountedReason !== 'string' || p.unaccountedReason === '') {
        err(`${pfx}.unaccountedMs is null with no \`unaccountedReason\` (a not-computable remainder must name its structural reason — §2.1/§4.2/§6 FS1)`)
      }
      if (p.pass !== (Array.isArray(p.failReasons) && p.failReasons.length === 0)) {
        err(`${pfx}.pass ${String(p.pass)} disagrees with its own failReasons (the pass verdict is DERIVED: pass ⇔ no reason — §4.2/D-GP-UFA-3)`)
      }
      // §6 FS11 (RUL-11 / §12.4, the `F5-2`/`F5-3` fix) — EVERY measure field is
      // non-negative by construction: a negative value is a computation defect, not an
      // outcome, and the validator must catch it (F5-5: `ok:true` beside a negative
      // measure is a review finding).
      for (const f of ['sumOfSpansMs', 'accountedMs', 'unaccountedMs', 'overlapMs', 'outsideMs']) {
        if (typeof p[f] === 'number' && Number.isFinite(p[f]) && p[f] < 0) {
          err(fs11(`${pfx}.${f}`, p[f], `${pfx}.${f} is a union-accounting MEASURE of the pass (§3.3/§4.2)`))
        }
      }
      if (winMs !== null && winMs < 0) {
        err(fs11(`${pfx}.window.ms`, winMs, `a pass's window is its own record span and its measure cannot be negative (§3.2 clause 6)`))
      }
      // §6 FS12 (RUL-11 / §12.4, the `F5-4` fix) — a pass that OWNS records must carry
      // the pass's own measured span: the uncomputed-window sentinel `{t0:0, t1:0}` is
      // unreachable under §3.2 clause 6 (a page's `performance.now()` domain is > 0).
      const ownedCount = Array.isArray(p.records?.indices) ? p.records.indices.length : Number.isFinite(p.records?.count) ? p.records.count : 0
      if (ownedCount > 0 && win !== null && win.t0 === 0 && win.t1 === 0) {
        err(
          `${pfx} owns ${ownedCount} record(s) but carries a COLLAPSED window ({0,0}) — a pass's window is its own RECORD span, nested ` +
            `records INCLUDED, and a pass that owns a span must report it (§3.2 clause 6/§6 FS12 — the fifth run's pass-0 defect)`,
        )
      }

      if (Array.isArray(p.failReasons) && p.failReasons.length > 0) {
        // §4.2/D-GP-UFA-3 [O0-ROW-PASS-ASSERTED-NOT-DERIVED] — a pass sub-row whose own
        // `failReasons[]` is non-empty FORCES the row verdict: the reason enters the
        // FORCING channel (`errors[]` + `failReasons[]`), so `ok` can never read `true`
        // beside a failed pass (and the row's `pass ⇔ no reason` derivation follows).
        for (const m of p.failReasons) err(`pass ${p.index ?? i}: ${m}`)
      }
    })
    // §4.2 — the aggregation identity for the ten record-producible ids, checked BY
    // CONSTRUCTION against the row's own recorded per-id values: the row's `stages[id].ms`
    // is re-derived here as the Σ over the passes of the pass's own per-id sum, so the
    // recorded aggregation is what is compared with the partition's (a `stages[id]`
    // whose recorded ms is not the recorded sum is the mismatch this reports).
    //
    // §13.1 (2) [O0-AGGREGATION-IDENTITY-DEMOTED] — the identity is FORCING, exactly as
    // §4.2 pins it ("A mismatch is `pass:false` (§6 FS2)"): it is the ONLY oracle tying
    // the recorded per-id sums to the record list, so demoting it to a note removed the
    // `M1` symptom oracle (a fabricated top-level span could absorb the remainder
    // unobserved). The `notes[]` copy stays IN ADDITION — never instead.
    const rowStages: any[] = Array.isArray(row.stages) ? row.stages : []
    const populated = hook.passes.every((p: any) => Array.isArray(p?.stages) && p.stages.length > 0)
    for (const sid of populated ? O0_STAGE_IDS : []) {
      if (sid === 'post.style') continue
      const rs = rowStages.find((s: any) => s && s.id === sid)
      if (!rs || !isNonNeg(rs.ms)) continue
      const sum = o0Round3(
        hook.passes.reduce((a: number, p: any) => a + (Array.isArray(p?.stages) ? (isNonNeg(p.stages.find((s: any) => s && s.id === sid)?.ms) ? p.stages.find((s: any) => s && s.id === sid).ms : 0) : 0), 0),
      )
      if (Math.abs(sum - rs.ms) > 0.001) {
        const m =
          `run ${id}: the per-id aggregation identity fails for ${sid}: row.stages[${sid}].ms ${o0Num(rs.ms)} ≠ Σ over passes ` +
          `${o0Num(sum)} (the identity is the ONLY oracle tying the recorded per-id sums to the record list — M1/§4.2/§6 FS2)`
        err(m)
        aggregationNotes.push(m)
      }
    }
    if (Number.isInteger(hook.passCount) && hook.passCount !== hook.passes.length) {
      err(`run ${id}: hook.passCount ${hook.passCount} ≠ hook.passes.length ${hook.passes.length} (§4.1/§6 FS2)`)
    }
  }

  // --- §3.1/§4.1 — the per-record fields are TOTAL and FINITE ---------------
  if (!Array.isArray(hook.stageRecordDetail)) {
    err(`run ${id}: hook.stageRecordDetail is ${String(hook.stageRecordDetail)} (expected the per-record detail — §3.1/§6 FS10)`)
  } else {
    const seen = new Map<number, number>()
    hook.stageRecordDetail.forEach((d: any, i: number) => {
      const pfx = `run ${id}: hook.stageRecordDetail[${i}]`
      if (!d || typeof d !== 'object') {
        err(`${pfx} is ${JSON.stringify(d) ?? String(d)} (an entry must be an object — §6 FS10)`)
        return
      }
      if (!Number.isInteger(d.index)) err(`${pfx}.index is ${String(d.index)} (the commit index must be an integer — §4.1/§6 FS10)`)
      else seen.set(d.index, (seen.get(d.index) ?? 0) + 1)
      if (typeof d.startMs !== 'number' || !Number.isFinite(d.startMs) || d.startMs < 0) {
        err(`${pfx}.startMs is ${String(d.startMs)} (the record's own span stamp must be a finite non-negative number — §3.1/§6 FS10: it is never imputed)`)
      }
      if (typeof d.endMs !== 'number' || !Number.isFinite(d.endMs) || d.endMs < 0) {
        err(`${pfx}.endMs is ${String(d.endMs)} (the record's own span stamp must be a finite non-negative number — §3.1/§6 FS10: it is never imputed)`)
      }
      if (Number.isFinite(d.startMs) && Number.isFinite(d.endMs) && d.endMs < d.startMs) {
        err(`${pfx}: endMs ${o0Num(d.endMs)} < startMs ${o0Num(d.startMs)} (the record's span must close after it opens — §3.1/§6 FS10)`)
      }
      if (d.depth !== undefined && (!Number.isInteger(d.depth) || d.depth < 0)) {
        err(`${pfx}.depth is ${String(d.depth)} (the containment depth must be an integer ≥ 0 — §4.1/§6 FS10)`)
      }
      if (d.passIndex !== undefined && !(d.passIndex === null || Number.isInteger(d.passIndex))) {
        err(`${pfx}.passIndex is ${String(d.passIndex)} (the pass index must be an integer or null — §4.1/§6 FS10)`)
      }
    })
    for (const [index, count] of seen) {
      if (count > 1) err(`run ${id}: hook.stageRecordDetail carries ${count} entries with the commit index ${index} (every entry carries a UNIQUE index — §4.1/P-IM-1)`)
    }
  }

  // --- §2.3/§3.4/FS5 — the long-task attribution rule ------------------------
  const att: any = hook.longTaskAttribution
  const frozen: any = hook.freezeWindow && typeof hook.freezeWindow === 'object' ? hook.freezeWindow : null
  const w0 = frozen && Number.isFinite(frozen.t0) ? frozen.t0 : att && att.window && Number.isFinite(att.window.t0) ? att.window.t0 : 0
  const w1 = frozen && Number.isFinite(frozen.t1) ? frozen.t1 : att && att.window && Number.isFinite(att.window.t1) ? att.window.t1 : 0
  const derivedAtt = deriveO0LongTaskAttribution({ t0: w0, t1: w1 }, Array.isArray(row.longTasks) ? row.longTasks : [])
  const recordedTotal = isNonNeg(row.longTaskTotalMs) ? row.longTaskTotalMs : null
  if (att === undefined || att === null || typeof att !== 'object') {
    err(
      `run ${id}: hook.longTaskAttribution is ${String(att)} — every freeze row must RECORD the pinned rule, its window, the included ` +
        `count/total and BOTH rejected alternatives (§2.3/§3.4/§6 FS10)`,
    )
  } else {
    if (att.rule !== O0_LONGTASK_RULE) {
      err(`run ${id}: hook.longTaskAttribution.rule is ${JSON.stringify(att.rule)} (the PINNED rule is ${JSON.stringify(O0_LONGTASK_RULE)} — §2.3/§6 FS5)`)
    }
    if (isNonNeg(att.includedMs) && recordedTotal !== null && att.includedMs !== recordedTotal) {
      err(
        `run ${id}: hook.longTaskAttribution.includedMs ${o0Num(att.includedMs)} ≠ row.longTaskTotalMs ${o0Num(recordedTotal)} — the primary ` +
          `oracle is the START-INSIDE-INCLUSIVE sum, and a total that disagrees with it is a rule mismatch (§2.3/§3.4/§6 FS5)`,
      )
    }
    if (Number.isInteger(att.includedCount) && att.includedCount !== derivedAtt.includedCount) {
      err(
        `run ${id}: hook.longTaskAttribution.includedCount ${att.includedCount} disagrees with the count re-derived from the recorded ` +
          `longTasks list (${derivedAtt.includedCount}) — the oracle is RE-DERIVED, never asserted (§3.4/§6 FS5)`,
      )
    }
    if (Number.isInteger(att.includedCount) && Array.isArray(row.longTasks) && row.longTasks.length < att.includedCount) {
      err(
        `run ${id}: row.longTasks carries ${row.longTasks.length} entries while hook.longTaskAttribution.includedCount is ${att.includedCount} — ` +
          `the recorded OBSERVED list disagrees with the recorded attribution (§3.4/§6 FS5: the pinned cross-check is ` +
          `includedCount ≤ longTasks.length AND includedMs === longTaskTotalMs)`,
      )
    }
    // §13.1 (3)/§3.4 [O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED] — the recorded
    // attribution is RE-DERIVED from the recorded `longTasks[]` list; the recorded values
    // are the PROVENANCE, never the verdict's input. Three things must hold, and NONE of
    // them may be cured by a self-certified `ambiguous:true`:
    //   (a) the recorded exclusion TOTALS may not UNDERSTATE what the recorded list
    //       re-derives (an excluded observation is never silently absent from the record,
    //       §3.4) — the comparison is one-directional because a row may record exclusions
    //       observed OUTSIDE the recorded start-inside list (the wider observed list);
    //   (b) every re-derived exclusion must be NAMED in the recorded `startBefore` /
    //       `straddlesEnd` entries;
    //   (c) the record's OWN rejected-alternative totals must satisfy the pinned
    //       identities over the record's other fields —
    //       `intersectionMs = includedMs + startBeforeOverlapMs − straddleEndMs` and
    //       `overlapAnyMs ≥ includedMs + startBeforeOverlapMs` — which is what exposes an
    //       exclusion the record DROPPED (a forged `startBeforeOverlapMs: 0` leaves the
    //       clipped-intersection total behind as the residue).
    const recSb = isNonNeg(att.startBeforeOverlapMs) ? att.startBeforeOverlapMs : null
    const recSe = isNonNeg(att.straddleEndMs) ? att.straddleEndMs : null
    const recInc = isNonNeg(att.includedMs) ? att.includedMs : null
    const recInter = isNonNeg(att.intersectionMs) ? att.intersectionMs : null
    const recAny = isNonNeg(att.overlapAnyMs) ? att.overlapAnyMs : null
    const attMismatches: string[] = []
    if (recSb === null) {
      attMismatches.push(`startBeforeOverlapMs is ${String(att.startBeforeOverlapMs)} (the excluded start-before overlap is a recorded value, never absent)`)
    } else if (derivedAtt.startBeforeOverlapMs > recSb + 0.001) {
      attMismatches.push(
        `startBeforeOverlapMs ${o0Num(recSb)} UNDERSTATES the ${o0Num(derivedAtt.startBeforeOverlapMs)} ms the recorded longTasks list re-derives`,
      )
    }
    if (recSe === null) {
      attMismatches.push(`straddleEndMs is ${String(att.straddleEndMs)} (the straddling overlap is a recorded value, never absent)`)
    } else if (derivedAtt.straddleEndMs > recSe + 0.001) {
      attMismatches.push(`straddleEndMs ${o0Num(recSe)} UNDERSTATES the ${o0Num(derivedAtt.straddleEndMs)} ms the recorded longTasks list re-derives`)
    }
    const recordedExcluded = (list: any): any[] => (Array.isArray(list) ? list.filter((e: any) => e && typeof e === 'object') : [])
    for (const [field, derivedList] of [
      ['startBefore', derivedAtt.startBefore],
      ['straddlesEnd', derivedAtt.straddlesEnd],
    ] as const) {
      for (const e of derivedList) {
        const named = recordedExcluded(att[field]).some((x: any) => x.start === e.start && x.duration === e.duration)
        if (!named) {
          attMismatches.push(
            `the recorded ${field}[] does not carry the start ${o0Num(e.start)} / duration ${o0Num(e.duration)} (overlap ${o0Num(e.overlapMs)} ms) that the recorded longTasks list re-derives`,
          )
        }
      }
    }
    if (recInter !== null && recInc !== null && recSb !== null && recSe !== null && Math.abs(recInter - (recInc + recSb - recSe)) > 0.001) {
      attMismatches.push(
        `intersectionMs ${o0Num(recInter)} ≠ includedMs ${o0Num(recInc)} + startBeforeOverlapMs ${o0Num(recSb)} − straddleEndMs ${o0Num(recSe)} ` +
          `(${o0Num(o0Round3(recInc + recSb - recSe))}) — the recorded rejection-alternative total implies an excluded observation the record does not carry`,
      )
    }
    if (recAny !== null && recInc !== null && recSb !== null && recAny < recInc + recSb - 0.001) {
      attMismatches.push(
        `overlapAnyMs ${o0Num(recAny)} < includedMs ${o0Num(recInc)} + startBeforeOverlapMs ${o0Num(recSb)} — the overlap-any total must count every excluded start-before duration`,
      )
    }
    if (attMismatches.length > 0) {
      err(
        `run ${id}: the recorded hook.longTaskAttribution is INCONSISTENT with the row's own recorded longTasks list — the exclusion record is ` +
          `RE-DERIVED, never trusted: the re-derivation reads includedCount ${derivedAtt.includedCount} / includedMs ${o0Num(derivedAtt.includedMs)} / ` +
          `startBeforeOverlapMs ${o0Num(derivedAtt.startBeforeOverlapMs)} / straddleEndMs ${o0Num(derivedAtt.straddleEndMs)} while the record reads ` +
          `includedCount ${String(att.includedCount)} / includedMs ${o0Num(recInc)} / startBeforeOverlapMs ${o0Num(recSb)} / straddleEndMs ${o0Num(recSe)}: ` +
          `${attMismatches.join('; ')} (§3.4/§6 FS5 — recorded ≠ derived, both numbers named; a declared \`ambiguous\` does not cure it)`,
      )
    }
    // §3.4/S8/S9 — the ambiguity clause's inputs are the RE-DERIVED totals (the recorded
    // ones are provenance): an observation overlapping the window that is not counted by
    // the pinned rule is legal ONLY with a recorded ambiguityReason, and an
    // `ambiguous:true` claim never certifies the recorded/derived mismatch reported above.
    const excludedOverlap = Math.max(derivedAtt.startBeforeOverlapMs, recSb ?? 0)
    const straddle = Math.max(derivedAtt.straddleEndMs, recSe ?? 0)
    if ((excludedOverlap > 0 || straddle > 0) && (att.ambiguous !== true || typeof att.ambiguityReason !== 'string' || att.ambiguityReason === '')) {
      err(
        `run ${id}: an excluded long task overlapping the window by ${o0Num(excludedOverlap)} ms (straddle ${o0Num(straddle)} ms) is legal ` +
          `ONLY together with a recorded ambiguityReason — the attribution under the pinned start-inside-inclusive rule is AMBIGUOUS and must ` +
          `say so (§2.3/S8/S9/§6 FS5)`,
      )
    }
  }
  if (recordedTotal !== null) {
    // §2.3/§6 FS5 — the rule-mismatch DISJUNCT is SCOPED (RUL-13 / §12.5, the `RULE-2`
    // red): the "`longTaskTotalMs` equals a REJECTED alternative while claiming the
    // pinned rule" clause fires ONLY on a row whose recorded OBSERVED list contains at
    // least one EXCLUDED task — i.e. where the rule actually DISCRIMINATES
    // (`overlapAnyMs !== includedMs` or `intersectionMs !== includedMs`). On an honest
    // row whose observed list is entirely start-inside and unstraddling the three totals
    // COINCIDE by construction, so the unscoped disjunct would fire on every honest row
    // and be mutually unsatisfiable with §3.4's OBSERVED-list cross-check.
    const observed = Array.isArray(row.longTasks)
      ? row.longTasks.filter((e: any) => e && typeof e === 'object' && Number.isFinite(e.start))
      : []
    const excludedInObservedList = observed.filter((e: any) => e.start < w0 || e.start > w1).length
    const alternativesDiscriminate = !(derivedAtt.overlapAnyMs === derivedAtt.includedMs && derivedAtt.intersectionMs === derivedAtt.includedMs)
    const alternatives = derivedAtt.overlapAnyMs === recordedTotal || derivedAtt.intersectionMs === recordedTotal
    if (derivedAtt.includedMs !== recordedTotal) {
      err(
        `run ${id}: row.longTaskTotalMs ${o0Num(recordedTotal)} ≠ the start-inside sum ${o0Num(derivedAtt.includedMs)} over ` +
          `[${o0Num(w0)}, ${o0Num(w1)}] (the pinned start-inside-inclusive rule sums the FULL duration of every task whose start is inside ` +
          `the window; the rejected alternatives would read overlap-any ${o0Num(derivedAtt.overlapAnyMs)} ms / intersection ` +
          `${o0Num(derivedAtt.intersectionMs)} ms — §2.3/§6 FS5)`,
      )
    } else if (alternatives && excludedInObservedList > 0 && alternativesDiscriminate) {
      err(
        `run ${id}: row.longTaskTotalMs ${o0Num(recordedTotal)} equals the REJECTED alternative (overlap-any ${o0Num(derivedAtt.overlapAnyMs)} ms / ` +
          `intersection ${o0Num(derivedAtt.intersectionMs)} ms) while claiming the pinned start-inside-inclusive rule (which would read ` +
          `${o0Num(derivedAtt.includedMs)} ms) on an observed list carrying ${excludedInObservedList} EXCLUDED task(s) — the rule is not the ` +
          `implemented one (§2.3/§6 FS5, scoped per RUL-13)`,
      )
    }
  }

  // --- §4.1/§4.2/§6 FS10/FS11 — the ROW's OWN `stages[]` -----------------------
  // §3b re-audit finding (2) [O0-ROW-STAGES-UNVALIDATED]: the row's `stages[]` was read
  // ONLY inside the per-id aggregation identity below, which `continue`s on a non-finite
  // `ms` — so `stages: []`, a nulled `ms` (with `unseparated:false`), twelve ids or a
  // NEGATIVE `ms` all skipped EVERY identity comparison and the row validated `ok:true`.
  // §4.1 pins the field as "the 11-id set, each once, per-id SUMS over records": the closed
  // set, its cardinality, the finiteness and the measure's sign are checked HERE, by field
  // path (§6 FS10: a missing value is NAMED, never imputed; FS11: a measure is non-negative)
  // — and `ms:null ⇔ unseparated` (§4.1/§2.4) so a null is never a silent zero.
  if (!Array.isArray(row.stages)) {
    err(`run ${id}: row.stages is ${JSON.stringify(row.stages) ?? String(row.stages)} (the row's per-id SUMS over the closed ${O0_STAGE_COUNT}-id set — §4.1/§6 FS10)`)
  } else {
    const rowStageIds = row.stages.map((s: any) => (s && typeof s === 'object' ? s.id : undefined))
    const rowMissing = O0_STAGE_IDS.filter((sid) => !rowStageIds.includes(sid))
    const rowIdCounts = new Map<string, number>()
    for (const x of rowStageIds) if (typeof x === 'string') rowIdCounts.set(x, (rowIdCounts.get(x) ?? 0) + 1)
    const rowDuplicated = [...rowIdCounts.keys()].filter((x) => (rowIdCounts.get(x) ?? 0) > 1)
    const rowUnknown = rowStageIds.filter((x: any) => typeof x !== 'string' || !O0_STAGE_IDS.includes(x))
    const declaredRowStageCount = Number.isInteger(row.stageCount) ? row.stageCount : O0_STAGE_COUNT
    if (
      row.stages.length !== O0_STAGE_COUNT ||
      row.stages.length > declaredRowStageCount ||
      rowMissing.length ||
      rowDuplicated.length ||
      rowUnknown.length
    ) {
      err(
        `run ${id}: row.stages carries ${row.stages.length} stage id(s) and requires the closed §2.2 ${O0_STAGE_COUNT}-id set ` +
          `(each exactly once, against row.stageCount ${String(row.stageCount)}): carried ${row.stages.length} of ${O0_STAGE_COUNT}` +
          (rowMissing.length ? `: missing ${rowMissing.join(', ')}` : '') +
          (rowDuplicated.length ? `: duplicated ${rowDuplicated.join(', ')}` : '') +
          (rowUnknown.length ? `: unknown ${rowUnknown.map(String).join(', ')}` : '') +
          ` (§4.1/§4.2/P-IM-2/§6 FS10)`,
      )
    }
    row.stages.forEach((s: any, i: number) => {
      const sid = s && typeof s === 'object' && typeof s.id === 'string' ? s.id : `#${i}`
      const pfx = `run ${id}: row.stages[${sid}]`
      if (!s || typeof s !== 'object') {
        err(`${pfx} is ${JSON.stringify(s) ?? String(s)} (a row stage entry must be an object carrying {id, ms, unseparated} — §4.1/§6 FS10)`)
        return
      }
      const unseparated = s.unseparated === true
      if (s.ms === null) {
        if (!unseparated) {
          err(
            `${pfx}.ms is null while unseparated is ${String(s.unseparated)} — a null measure is legal ONLY for a stage recorded ` +
              `unseparated (ms:null ⇔ unseparated — §4.1/§2.1 clause 1/§6 FS10)`,
          )
        }
        return
      }
      if (typeof s.ms !== 'number' || !Number.isFinite(s.ms)) {
        err(`${pfx}.ms is ${String(s.ms)} (a stage measure is a finite number or null + unseparated — §4.1/§6 FS10: it is never imputed)`)
        return
      }
      if (s.ms < 0) {
        err(fs11(`${pfx}.ms`, s.ms, `${pfx}.ms is the per-id SUM over the row's records and is a MEASURE (§4.1/§4.2)`))
      }
      if (unseparated) {
        err(`${pfx}.unseparated is true with ms ${o0Num(s.ms)} — an unseparated stage is emitted ms:null, never a number (§4.1/§2.1 clause 1/§6 FS10)`)
      }
    })
  }

  // --- §4.2/§2.1 — the DECLARED pass layer is RE-DERIVED, never trusted --------
  // §3b re-audit finding (3) [O0-PASS-LAYER-TRUSTED-NOT-REDERIVED]: no clause compared
  // `hook.passes[].{window,accountedMs,unaccountedMs,sumOfSpansMs,records.indices}` with
  // `partitionO0RowPasses(row).passes[i]`, so a pass could publish any internally coherent
  // arithmetic (ST6: `accountedMs = window.ms` / `unaccountedMs: 0` while its own records
  // derive 200/250) and `records.indices` totality was COUNT-checked only (ST7 `[2,2]`,
  // ST8 `[2,99]`). §4.2 pins the record list as the authority: the pass's own window is
  // the span of the records it OWNS (§3.2 clause 6, nested records INCLUDED), its
  // `sumOfSpansMs`/`accountedMs`/`unaccountedMs`/`overlapMs` are that record set's union
  // accounting (§3.3), and its index run is strictly increasing, disjoint across passes and
  // a union of `0..records-1` (§4.2/P-TP-2). One derivation, compared field by field.
  //
  // SCOPING (RUL-8): the clause fires ONLY on a row that carries `hook.passes[]` — the
  // partition's own `legacyShape` class — and it never reads a legacy row's numbers. The
  // comparison is taken on the SAME derivation the row-level clause uses (one call site).
  const derivedPart = Array.isArray(hook.passes) ? partitionO0RowPasses(row) : null
  if (Array.isArray(hook.passes) && derivedPart) {
    const derivedPasses: any[] = Array.isArray(derivedPart.passes) ? derivedPart.passes : []
    const passAgrees = (a: number, b: number): boolean => Math.abs(a - b) <= 0.1 + 1e-9
    hook.passes.forEach((p: any, i: number) => {
      if (!p || typeof p !== 'object') return // the FS10 object clause above already named it
      const pfx = `run ${id}: hook.passes[${i}]`
      const dp = derivedPasses.find((d: any) => d && d.index === p.index) ?? derivedPasses[i]
      if (!dp) {
        err(
          `${pfx} has no counterpart in the DERIVED partition (${derivedPasses.length} pass(es) derived from ` +
            `hook.stageRecordDetail over the recorded freeze window) — a declared pass that the row's own records do not ` +
            `partition into is fabricated (§4.2/P-TP-2)`,
        )
        return
      }
      // The compared fields are the RECORD-SET arithmetic of the pass (§3.2 clause 6/
      // §3.3): its window, the union accounting and the index run it owns. The two
      // cross-layer readings are NOT part of this identity — `outsideMs` is measured
      // against the ROW's freeze window (§3.3/FS6, checked by its own clause) and
      // `longTaskTotalMs` against the ROW's `longTasks` list (§3.4/FS5, likewise), so a
      // sub-fixture that overrides the row's window/task list may legitimately diverge
      // there while the pass's own record arithmetic still agrees.
      const measures: Array<[string, any, any]> = [
        ['window.ms', p.window?.ms, dp.window?.ms],
        ['sumOfSpansMs', p.sumOfSpansMs, dp.sumOfSpansMs],
        ['accountedMs', p.accountedMs, dp.accountedMs],
        ['overlapMs', p.overlapMs, dp.overlapMs],
      ]
      const drift: string[] = []
      for (const [field, declared, derived] of measures) {
        if (typeof declared === 'number' && Number.isFinite(declared) && typeof derived === 'number' && Number.isFinite(derived) && !passAgrees(declared, derived)) {
          drift.push(`${field} declares ${o0Num(declared)} / derives ${o0Num(derived)}`)
        }
      }
      if (p.unaccountedMs === null) {
        // §2.1(iii) — the null form is legal ONLY with a named structural reason: a pass
        // whose records DO compute a remainder may not publish `null` to dodge the check.
        if (typeof p.unaccountedReason !== 'string' || p.unaccountedReason === '') {
          drift.push(`unaccountedMs is null with no \`unaccountedReason\` while the pass's own records derive ${o0Num(dp.unaccountedMs)}`)
        }
      } else if (
        typeof p.unaccountedMs === 'number' &&
        Number.isFinite(p.unaccountedMs) &&
        typeof dp.unaccountedMs === 'number' &&
        Number.isFinite(dp.unaccountedMs) &&
        !passAgrees(p.unaccountedMs, dp.unaccountedMs)
      ) {
        drift.push(`unaccountedMs declares ${o0Num(p.unaccountedMs)} / derives ${o0Num(dp.unaccountedMs)}`)
      }
      for (const [field, declared, derived] of [
        ['window.t0', p.window?.t0, dp.window?.t0],
        ['window.t1', p.window?.t1, dp.window?.t1],
      ] as Array<[string, any, any]>) {
        if (typeof declared === 'number' && Number.isFinite(declared) && typeof derived === 'number' && Number.isFinite(derived) && !passAgrees(declared, derived)) {
          drift.push(`${field} declares ${o0Num(declared)} / derives ${o0Num(derived)}`)
        }
      }
      const declaredRecs: any[] = Array.isArray(p.records?.indices) ? p.records.indices : []
      const derivedRecs: any[] = Array.isArray(dp.records?.indices) ? dp.records.indices : []
      if (declaredRecs.join(',') !== derivedRecs.join(',')) {
        drift.push(`records.indices declares [${declaredRecs.join(', ')}] / derives [${derivedRecs.join(', ')}]`)
      }
      if (drift.length > 0) {
        err(
          `${pfx}${typeof p.index === 'number' ? ` (pass ${p.index})` : ''} contradicts the arithmetic its OWN records derive — the pass layer is ` +
            `RE-DERIVED from hook.stageRecordDetail, never trusted: ${drift.join('; ')} (§2.1/§3.2 clause 6/§3.3/§4.2/§6 FS1)` +
            ` — a declared pass layer that disagrees with its own records is a second reading of one quantity`,
        )
      }
    })
    // §4.2/P-TP-2 — `records.indices` is a strictly increasing run whose union over the
    // passes is exactly `0..records-1`, DISJOINT across passes. The count check above is
    // not totality: `[2,2]` (a duplicate) and `[2,99]` (one index dropped, a foreign one
    // added) both keep `count` consistent while leaving a record unattributed.
    const declaredIndices: number[] = []
    let structuralIndexFailure = false
    hook.passes.forEach((p: any, i: number) => {
      if (!p || typeof p !== 'object' || !Array.isArray(p.records?.indices)) return
      let previous: number | null = null
      for (const raw of p.records.indices) {
        if (!Number.isInteger(raw) || raw < 0) {
          err(
            `run ${id}: hook.passes[${i}].records.indices carries ${String(raw)} (a commit index is a non-negative integer — §4.1/§4.2/§6 FS10)`,
          )
          structuralIndexFailure = true
          continue
        }
        declaredIndices.push(raw)
        if (previous !== null && raw <= previous) {
          err(
            `run ${id}: hook.passes[${i}].records.indices [${declaredIndices.join(', ')}] is not STRICTLY INCREASING (${String(previous)} → ${String(raw)}) ` +
              `— §4.2 pins the pass's index run as a strictly increasing run of commit indices (P-TP-2)`,
          )
          structuralIndexFailure = true
        }
        previous = raw
      }
    })
    const totalRecords = Number.isFinite(hook.records) ? hook.records : derivedPasses.reduce((a: number, d: any) => a + (Number.isInteger(d?.records?.count) ? d.records.count : 0), 0)
    const seenIndices = new Map<number, number>()
    for (const idx of declaredIndices) seenIndices.set(idx, (seenIndices.get(idx) ?? 0) + 1)
    const duplicatedIndices = [...seenIndices.keys()].filter((idx) => (seenIndices.get(idx) ?? 0) > 1)
    const missingIndices: number[] = []
    const foreignIndices = [...seenIndices.keys()].filter((idx) => idx >= totalRecords)
    if (typeof hook.records === 'number' && Number.isFinite(hook.records)) {
      for (let idx = 0; idx < totalRecords; idx++) if (!seenIndices.has(idx)) missingIndices.push(idx)
    }
    if (duplicatedIndices.length || missingIndices.length || foreignIndices.length) {
      structuralIndexFailure = true
    }
    if (structuralIndexFailure) {
      err(
        `run ${id}: the passes' records.indices are not the DISJOINT union \`0..records-1\` (hook.records ${String(hook.records)}) — the union of ` +
          `the passes' index runs reads [${[...new Set(declaredIndices)].sort((a, b) => a - b).join(', ')}]` +
          (missingIndices.length ? `: index(es) ${missingIndices.join(', ')} owned by NO pass` : '') +
          (duplicatedIndices.length ? `: index(es) ${duplicatedIndices.join(', ')} owned by MORE THAN ONE pass` : '') +
          (foreignIndices.length ? `: index(es) ${foreignIndices.join(', ')} outside the recorded record set` : '') +
          ` (§4.2/P-TP-2/§6 FS2 — every record belongs to exactly ONE pass and the partition is TOTAL)`,
      )
    }
  }

  // --- §2.1 clause 5 / §6 FS8 — the DEC-1 separation discipline + the retired residual --
  const ps: any = row.postStyle
  // §2.1 clause 5 / §6 FS8 — a row that DECLARES the new remainder
  // (`reconciliation.unaccountedMs` recorded as a number) must carry the retired
  // post.style branch AND the remainder's own labels; a row that declares neither has
  // no remainder to launder (RUL-8: the clause fires on the DECLARED new shape).
  // §4.1 — `depth`/`passIndex` are the partition's OWN derivations: a row whose entries
  // carry them records the partition's values; a row that does not (a fixture, or a
  // legacy-shaped entry) has them derived here from the entry's own span (containment,
  // §3.2 clause 1) so the fields are checkable rather than merely assumed present.
  if (Array.isArray(hook.stageRecordDetail)) {
    const entries = hook.stageRecordDetail.filter(
      (d: any) => d && typeof d === 'object' && Number.isFinite(d.startMs) && Number.isFinite(d.endMs),
    )
    const owned = new Map<number, number>()
    if (Array.isArray(hook.passes)) {
      hook.passes.forEach((p: any, pi: number) => {
        for (const idx of Array.isArray(p?.records?.indices) ? p.records.indices : []) owned.set(idx, p?.index ?? pi)
      })
    }
    for (const d of hook.stageRecordDetail) {
      if (!d || typeof d !== 'object' || !Number.isFinite(d.startMs) || !Number.isFinite(d.endMs)) continue
      if (d.depth === undefined) {
        let depth = 0
        for (const o of entries) {
          if (o === d) continue
          if (o.startMs <= d.startMs && d.endMs <= o.endMs && (o.startMs < d.startMs || d.endMs < o.endMs)) depth += 1
        }
        d.depth = depth
      }
      if (d.passIndex === undefined) {
        if (owned.has(d.index)) d.passIndex = owned.get(d.index)
        else if (!Array.isArray(hook.passes)) {
          // §13.2 (8)(d)/§6 FS10 [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS] — NO IMPUTATION: on
          // a row with no `hook.passes[]` the partition cannot attribute the entry, so the
          // absent `passIndex` is a REPORTED MISSING VALUE named by field path — the
          // fabricated `0` this replaces overwrote the partition's derived value on the
          // artifact the validator inspects.
          err(
            `run ${id}: hook.stageRecordDetail[${String(d.index)}].passIndex is ${String(d.passIndex)} — the field is ABSENT and a row ` +
              `with no hook.passes[] cannot derive it: a missing value is REPORTED by field path, never imputed as 0 (§4.1/§6 FS10)`,
          )
        }
      }
    }
  }

  // --- §2.4/§6 FS11 — NO MEASURE FIELD MAY BE NEGATIVE ------------------------
  // (§2.4 AMENDED per RUL-11 / §12.4: the rule covers EVERY measure this unit
  // introduces or retains, not only the remainder.) The two diagnostics
  // (`passTotalsMinusRowMs`, `passRowUnaccountedDeltaMs`) are SIGNED by definition and
  // are checked only for their `not a measure` labels.
  for (const [f, definition] of [
    ['passLongTaskDoubleCountMs', 'the sum of the duration of every observed task counted (start-inside) by TWO OR MORE pass windows (§2.3)'],
    ['passOverlapSumMs', "the measure of the union of the pairwise intersections of the pass windows (§3.3)"],
  ] as const) {
    if (typeof hook[f] === 'number' && Number.isFinite(hook[f]) && hook[f] < 0) err(fs11(`hook.${f}`, hook[f], definition))
  }

  // --- §3.2 clause 6 (b) / §6 FS12 — NO TOP-LEVEL SPAN FALLS OUTSIDE EVERY PASS WINDOW ----
  // (RUL-11 / §12.4, the `F5-4` fix.) The fifth run's pass 0 carried records and a
  // `{0,0}` window, so its measured span entered `accountedMs` NOWHERE and the passes'
  // attribution fell short of the row remainder by exactly that deficit.
  if (Array.isArray(hook.stageRecordDetail) && Array.isArray(hook.passes)) {
    const passWindows: Array<{ t0: number; t1: number }> = []
    hook.passes.forEach((p: any) => {
      const w: any = p && typeof p === 'object' ? p.window : null
      if (w && Number.isFinite(w.t0) && Number.isFinite(w.t1) && w.t1 > w.t0) passWindows.push({ t0: w.t0, t1: w.t1 })
    })
    const frozen: any = hook.freezeWindow
    const f0 = frozen && Number.isFinite(frozen.t0) ? frozen.t0 : null
    const f1 = frozen && Number.isFinite(frozen.t1) ? frozen.t1 : null
    if (passWindows.length > 0 && f0 !== null && f1 !== null) {
      for (const d of hook.stageRecordDetail) {
        if (!d || typeof d !== 'object' || !Number.isFinite(d.startMs) || !Number.isFinite(d.endMs)) continue
        if (Number.isInteger(d.depth) && d.depth !== 0) continue // a NESTED record is covered by its container
        const a = Math.max(d.startMs, f0)
        const b = Math.min(d.endMs, f1)
        if (!(b > a)) continue // the record's own span lies outside the freeze window (the FS6 class)
        const covered = o0UnionMeasure(
          passWindows.map((w) => ({ startMs: Math.max(w.t0, a), endMs: Math.min(w.t1, b) })),
          { t0: a, t1: b },
        )
        if (covered < b - a - 0.001) {
          err(
            `run ${id}: record ${String(d.index)} (${String(d.stage)}) spans [${o0Num(d.startMs)}, ${o0Num(d.endMs)}] and ` +
              `${o0Num(o0Round3(b - a - covered))} ms of it lies inside NO pass window — every top-level span must be covered by the pass ` +
              `it belongs to (§3.2 clause 6 (b)/§6 FS12)`,
          )
        }
      }
      // §3.2 clause 6 — a pass's window IS the span of the records it OWNS: a pass whose
      // window does not cover one of its own records is the `F5-4` class (that record's
      // span enters `accountedMs` NOWHERE — the fifth run's pass 0).
      const byIndex = new Map<number, any>()
      for (const d of hook.stageRecordDetail) if (d && typeof d === 'object' && Number.isInteger(d.index)) byIndex.set(d.index, d)
      hook.passes.forEach((p: any, pi: number) => {
        const w: any = p && typeof p === 'object' ? p.window : null
        if (!w || !Number.isFinite(w.t0) || !Number.isFinite(w.t1) || !(w.t1 > w.t0)) return
        for (const idx of Array.isArray(p?.records?.indices) ? p.records.indices : []) {
          const d = byIndex.get(idx)
          if (!d || !Number.isFinite(d.startMs) || !Number.isFinite(d.endMs) || d.endMs <= d.startMs) continue
          const a = Math.max(d.startMs, f0)
          const b = Math.min(d.endMs, f1)
          if (!(b > a)) continue
          const covered = o0UnionMeasure([{ startMs: Math.max(w.t0, a), endMs: Math.min(w.t1, b) }], { t0: a, t1: b })
          if (covered < b - a - 0.001) {
            err(
              `run ${id}: pass ${String(p?.index ?? pi)} owns record ${String(idx)} (${String(d.stage)}, [${o0Num(d.startMs)}, ` +
                `${o0Num(d.endMs)}]) outside its OWN window [${o0Num(w.t0)}, ${o0Num(w.t1)}] — a pass's window is the span of its own ` +
                `records, nested records INCLUDED (§3.2 clause 6/§6 FS12)`,
            )
          }
        }
      })
    }
  }

  // --- §4.2/§6 FS6 — a PASS WINDOW must lie INSIDE the row's freeze window ----------
  // (§13.2 (8)(a) [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS].) The window-bound rule was
  // checked for a record's span (and `partitionO0RowPasses` judges the pass's OUTSIDE
  // measure); the validator never compared a pass's OWN window with the freeze window, so
  // a pass measuring a window 300 ms away from the row's measured one validated `ok:true`.
  // Both readings of "outside" are judged: the OUTSIDE MEASURE (a window straddling the
  // freeze window's edge) and the GAP (a window that does not intersect it at all — whose
  // outside measure is only its own length, but whose DISTANCE from the measured window is
  // the whole distance).
  //
  // SCOPED to a row whose OWN recorded spans inhabit the freeze window: the clause is about
  // a PASS WINDOW disagreeing with the row's records, and where the record set itself lies
  // outside the freeze window beyond the band the row is in the §4.3/FS6 window-bound class
  // (a record/window disagreement, reported at the row level) — a pass window cannot be
  // judged against a window the rows do not inhabit.
  const freezeT0 = frozen && Number.isFinite(frozen.t0) ? frozen.t0 : null
  const freezeT1 = frozen && Number.isFinite(frozen.t1) ? frozen.t1 : null
  const recordSpans: Array<{ startMs: number; endMs: number }> = Array.isArray(hook.stageRecordDetail)
    ? hook.stageRecordDetail
        .filter((d: any) => d && typeof d === 'object' && Number.isFinite(d.startMs) && Number.isFinite(d.endMs))
        .map((d: any) => ({ startMs: d.startMs, endMs: d.endMs }))
    : []
  const passBandMs = isNonNeg(hook.toleranceMs) ? hook.toleranceMs : O0_SHAPE_TOLERANCE_MS
  const recordsOutsideMs =
    freezeT0 !== null && freezeT1 !== null ? o0OutsideMeasure(recordSpans, { t0: freezeT0, t1: freezeT1 }) : 0
  const rowsInhabitTheirWindow = freezeT0 !== null && freezeT1 !== null && recordsOutsideMs <= passBandMs
  if (Array.isArray(hook.passes) && rowsInhabitTheirWindow) {
    hook.passes.forEach((p: any, i: number) => {
      const w: any = p && typeof p === 'object' ? p.window : null
      if (!w || !Number.isFinite(w.t0) || !Number.isFinite(w.t1)) return
      const gap = o0Round3(Math.max((freezeT0 as number) - w.t1, w.t0 - (freezeT1 as number), 0))
      const outside = o0OutsideMeasure([{ startMs: w.t0, endMs: w.t1 }], { t0: freezeT0 as number, t1: freezeT1 as number })
      if (gap > passBandMs || outside > passBandMs) {
        err(
          `run ${id}: pass ${String(p?.index ?? i)} window [${o0Num(w.t0)}, ${o0Num(w.t1)}] sits ${o0Num(Math.max(gap, outside))} ms OUTSIDE ` +
            `the row's freeze window [${o0Num(freezeT0)}, ${o0Num(freezeT1)}] beyond the recorded ${o0Num(passBandMs)} ms band — a pass window ` +
            `must lie inside the row's measured window (§4.2/§6 FS6)`,
        )
      }
    })
  }

  const reconDeclared: any = row.reconciliation
  const declaresRemainder =
    reconDeclared && typeof reconDeclared === 'object' && reconDeclared.unaccountedMs !== null && reconDeclared.unaccountedMs !== undefined
  const declaresPostStyle = ps !== undefined && ps !== null
  // §3.2 clause 4 — the LEGAL EMPTY CASE (a deliberately UNARMED row: `records: 0`,
  // `passes: []`) owes NO remainder: there is no window content to account for and no
  // span was dropped, so the "postStyle without a remainder" clause does not apply to it.
  const legalEmpty = (Number.isFinite(hook.records) ? hook.records : 0) === 0 && Array.isArray(hook.passes) && hook.passes.length === 0
  if (declaresPostStyle && !declaresRemainder && !legalEmpty) {
    err(
      `run ${id}: the row records a postStyle branch without the row-level remainder — reconciliation.unaccountedMs is the ` +
        `AUTHORITATIVE quantity and must be recorded alongside it (§2.1/§4.1)`,
    )
  } else if (ps === undefined || ps === null) {
    // A row that declares neither the post.style branch nor a remainder has nothing to
    // launder (RUL-8: the clauses fire on the DECLARED new shape).
  } else if (typeof ps !== 'object' || Array.isArray(ps)) {
    err(`run ${id}: postStyle is ${String(ps)} (the DERIVED post.style branch must be an object — §2.1 clause 5/§6 FS8)`)
  } else {
    if (ps.residual !== null && ps.residual !== undefined) {
      err(
        `run ${id}: postStyle.residual is ${o0Num(ps.residual)} — the field is RETIRED (null + retired:true + retiredBy); the honest remainder is ` +
          `reconciliation.unaccountedMs and the legacy summed form survives only as the notAResidual diagnostic (§2.1/§6 FS8)`,
      )
    }
    if (ps.retired !== true || typeof ps.retiredBy !== 'string' || ps.retiredBy === '') {
      err(`run ${id}: postStyle carries no retirement marker (retired:true + retiredBy — §2.1/§6 FS8)`)
    } else if (!/O0-M1-M3-MEASUREMENT-SHAPE/.test(String(ps.retiredBy))) {
      err(`run ${id}: postStyle.retiredBy is ${JSON.stringify(ps.retiredBy)} (expected the unit marker ${JSON.stringify(O0_RETIRED_BY)} — §2.1)`)
    }
    if (ps.attributable !== false) {
      err(`run ${id}: postStyle.attributable is ${String(ps.attributable)} — a DERIVED remainder is never attributable (§2.1 clause 5/§6 FS8)`)
    }
    if (ps.unseparated === true && ps.ms !== null) {
      err(`run ${id}: postStyle is unseparated:true with ms ${String(ps.ms)} — an unmeasured stage is emitted ms:null, never imputed (§2.1 clause 5/§6 FS8)`)
    }
  }
  const recon: any = row.reconciliation
  if (recon === undefined || recon === null || typeof recon !== 'object') {
    err(`run ${id}: reconciliation is ${String(recon)} (the row-level remainder is the AUTHORITATIVE quantity — §2.1/§4.1)`)
  } else {
    for (const f of ['windowMs', 'accountedMs', 'unaccountedMs', 'overlapMs', 'outsideMs', 'bandExceeded']) {
      if (recon[f] === undefined) err(`run ${id}: reconciliation.${f} is missing (§4.1: the remainder and its inputs must be visible)`)
    }
    for (const f of ['windowMs', 'accountedMs']) {
      if (recon[f] !== undefined && !isNonNeg(recon[f])) {
        err(`run ${id}: reconciliation.${f} is ${String(recon[f])} (expected a non-negative finite number — §4.1)`)
      }
    }
    if (recon.unaccountedMs !== null && recon.unaccountedMs !== undefined) {
      if (!isNonNeg(recon.unaccountedMs)) {
        err(`run ${id}: reconciliation.unaccountedMs is ${String(recon.unaccountedMs)} — a negative remainder is unrepresentable (M1/§6 FS1)`)
      }
      // The label clauses are about a DECLARED remainder: when the row records the
      // remainder's provenance it must be `derived` + `attributable:false`; when the
      // field is absent the declared remainder is checked against its own label only.
      if (recon.unaccountedSource !== undefined && recon.unaccountedSource !== 'derived') {
        err(`run ${id}: reconciliation.unaccountedSource is ${String(recon.unaccountedSource)} — the computed remainder is a DERIVED accounting quantity, never a measured cost (§2.1 clause 5/§6 FS8)`)
      }
      if (recon.unaccountedAttributable !== undefined && recon.unaccountedAttributable !== false) {
        err(`run ${id}: reconciliation.unaccountedAttributable is ${String(recon.unaccountedAttributable)} — the remainder is attributable:false (§2.1 clause 5/§6 FS8)`)
      }
    } else {
      // §3b re-audit finding (4) [O0-ROW-NULL-REMAINDER-ESCAPE]: BOTH strict
      // declared-vs-derived clauses below are gated on `isNonNeg`, so a `null`
      // remainder skipped them, and NO row-level clause required the reason the
      // pass-level clause requires — a one-line `unaccountedMs: null` (with the
      // `unaccountedReason` deleted) validated `ok:true` while the row's own records
      // derived a remainder. §2.1(iii) permits the null form ONLY "for a named
      // structural reason"; the null+reason form (S12) stays LEGAL — this clause
      // requires the REASON, it never forbids the null. The clause fires even on a
      // non-array `hook.passes` (a row that declares the new shape may not dodge the
      // remainder by publishing neither a number nor a reason).
      if (typeof recon.unaccountedReason !== 'string' || recon.unaccountedReason === '') {
        err(
          `run ${id}: reconciliation.unaccountedMs is ${String(recon.unaccountedMs)} with no \`unaccountedReason\` — a remainder is EITHER a ` +
            `non-negative number OR \`null\` + a named structural reason (§2.1(iii)/S12), and the reason is the field path a reader follows: ` +
            `a null without one publishes the outcome (iii) while naming neither its cause nor its evidence (§2.1(iii)/§6 FS1/FS10)`,
        )
      }
    }
    if (recon.residual !== null && recon.residual !== undefined) {
      err(`run ${id}: reconciliation.residual is ${o0Num(recon.residual)} — the field is RETIRED (null); the honest remainder is reconciliation.unaccountedMs (§2.1/§6 FS8)`)
    }
    if (recon.retired !== true) {
      err(`run ${id}: reconciliation carries no retirement marker (retired:true — §2.1/§6 FS8)`)
    }
    const laundering = [recon.note, recon.reason]
      .filter((x: any) => typeof x === 'string')
      .find((x: string) => /style\/layout\/paint|attribut(?:ed|able)\s*(?:to|as)\s*(?:style|layout)|the (?:remainder|residual) is the (?:measured )?(?:style|layout)/i.test(x))
    if (laundering) {
      err(
        `run ${id}: reconciliation.note/reason presents the remainder as a style/layout/paint cost (${JSON.stringify(laundering.slice(0, 80))}) — ` +
          `the remainder is DERIVED and attributable:false, never a stage cost (§2.1 clause 5/§6 FS8)`,
      )
    }
    // §2.4/§6 FS11 (RUL-11 / §12.4) — the row-level MEASURES are non-negative by
    // construction too (the `F5-3` field lived here on the fifth run: −131.2 … −17.6).
    for (const [f, definition] of [
      ['overlapMs', 'the measure of the row top-level span SUM minus its union (§3.3)'],
      ['outsideMs', 'the measure of the row top-level spans falling outside the freeze window (§3.3)'],
      ['passOverlapSumMs', 'the measure of the union of the pairwise intersections of the pass windows (§3.3)'],
    ] as const) {
      if (typeof recon[f] === 'number' && Number.isFinite(recon[f]) && recon[f] < 0) err(fs11(`reconciliation.${f}`, recon[f], definition))
    }
    // §4.1/§13.2 (8)(c) [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS] — the DECLARED accounting is
    // checked against the DERIVED one: `reconciliation.{windowMs,accountedMs,
    // unaccountedMs,bandExceeded}` are the row's PUBLISHED remainder, and a declared block
    // that drifts from the rows' own records is a SECOND READING of one quantity (the M1
    // symptom the union accounting exists to close). The derivation is the pure oracle's
    // (no mirror in the validator); the clause is scoped to a row that carries
    // `hook.passes[]` (a legacy-shaped row has no derived partition to compare with — its
    // own numbers are not impugned, RUL-8 — and must never have its entries written by a
    // partition it does not carry) AND whose own recorded spans inhabit the freeze window
    // (a row whose record set lies outside it is the FS6 record/window class, and its
    // declared block describes the record set it actually measured).
    if (Array.isArray(hook.passes) && rowsInhabitTheirWindow) {
      const derivedRow = derivedPart ? derivedPart.row : partitionO0RowPasses(row).row
      const declaredBandMs = isNonNeg(recon.toleranceMs) ? recon.toleranceMs : derivedRow.toleranceMs
      const agrees = (a: number, b: number): boolean => Math.abs(a - b) <= O0_ACCOUNTING_AGREEMENT_MS + 1e-9
      if (isNonNeg(recon.accountedMs) && !agrees(recon.accountedMs, derivedRow.accountedMs)) {
        err(
          `run ${id}: reconciliation.accountedMs ${o0Num(recon.accountedMs)} ≠ the DERIVED union measure ${o0Num(derivedRow.accountedMs)} ` +
            `(the declared accounting must agree with the derived accounting — §4.1/§13.2 (8)(c))`,
        )
      }
      // STRICT (remand-2026-09-21 — `[O0-ACCOUNTING-AGREEMENT-DIRECTIONAL]`): a
      // NEW-shape row — one that CARRIES `hook.passes[]` and whose own recorded spans
      // inhabit the freeze window (`rowsInhabitTheirWindow`, the gate above) — must
      // DECLARE the window its records derive, not merely fail to OVERSTATE it. The
      // declared `windowMs` is the row's published denominator: the two readings of ONE
      // quantity are the same quantity, and a declared window NARROWER than the derived
      // one silently rescales every ratio taken against it (the fabrication the
      // counterexample states — `accountedMs 9999 on a 100 ms window` — is the WIDER
      // form of the same drift). SCOPING: this clause fires ONLY inside the
      // `Array.isArray(hook.passes) && rowsInhabitTheirWindow` gate; a LEGACY-shaped row
      // (no `hook.passes[]`, RUL-8: its own numbers are not impugned) and a DETACHED row
      // (its record set lies outside the freeze window beyond the band: the FS6
      // record/window class, whose declared block describes the record set it actually
      // measured) keep the pre-existing allowance — neither reaches this branch. A row
      // that declares NO `windowMs` at all is reported by the `reconciliation.windowMs
      // is missing` clause above, never double-reported here.
      if (isNonNeg(recon.windowMs) && !agrees(recon.windowMs, derivedRow.windowMs)) {
        err(
          `run ${id}: reconciliation.windowMs ${o0Num(recon.windowMs)} ≠ the DERIVED measured window ${o0Num(derivedRow.windowMs)} — a ` +
            `row must declare the measured window its own freeze window/record set derives, never a narrower or wider window ` +
            `(the declared denominator and the derived one are ONE quantity — §4.1/§13.2 (8)(c))`,
        )
      }
      // The remainder is a DIFFERENCE: it is comparable with the derived remainder only
      // across the SAME denominator, so this clause fires where the declared window IS
      // the derived window (elsewhere the two share no denominator and the clause above
      // carries the drift). STRICT + SYMMETRIC (same remand): BOTH directions of
      // disagreement are a forcing reason — a remainder SMALLER than the derived one
      // republishes the M1 symptom (a span counted by nobody), and a remainder LARGER
      // than it declares unaccounted time the records do not leave unaccounted.
      if (
        isNonNeg(recon.windowMs) &&
        agrees(recon.windowMs, derivedRow.windowMs) &&
        isNonNeg(recon.unaccountedMs) &&
        derivedRow.unaccountedMs !== null &&
        !agrees(recon.unaccountedMs, derivedRow.unaccountedMs)
      ) {
        const direction = recon.unaccountedMs < derivedRow.unaccountedMs ? 'UNDERSTATES' : 'EXCEEDS'
        err(
          `run ${id}: reconciliation.unaccountedMs ${o0Num(recon.unaccountedMs)} ${direction} the DERIVED remainder ` +
            `${o0Num(derivedRow.unaccountedMs)} — the declared remainder and the derived remainder are the SAME accounting quantity ` +
            `(within the recorded ${o0Num(O0_ACCOUNTING_AGREEMENT_MS)} ms granularity) and may not disagree in either direction: the ` +
            `declared number is either the M1 symptom (a span counted by nobody) republished, or time the records account for ` +
            `(§4.1/§13.2 (8)(c))`,
        )
      }
      // A declared OUTCOME flag is checked against the declared accounting only where the
      // declared triple is itself coherent (`unaccountedMs === windowMs − accountedMs`):
      // an incoherent declared triple is reported by the clauses above, and reading its
      // flag would report the same drift twice under a band's name.
      const declaredCoherent =
        isNonNeg(recon.unaccountedMs) &&
        isNonNeg(recon.windowMs) &&
        isNonNeg(recon.accountedMs) &&
        Math.abs(recon.unaccountedMs - (recon.windowMs - recon.accountedMs)) <= O0_ACCOUNTING_AGREEMENT_MS
      if (declaredCoherent && typeof recon.bandExceeded === 'boolean' && recon.bandExceeded !== (recon.unaccountedMs > declaredBandMs)) {
        err(
          `run ${id}: reconciliation.bandExceeded is ${String(recon.bandExceeded)} while the declared remainder ${o0Num(recon.unaccountedMs)} ms ` +
            `is ${recon.unaccountedMs > declaredBandMs ? 'ABOVE' : 'INSIDE'} the recorded ${o0Num(declaredBandMs)} ms band — the outcome flag is ` +
            `DERIVED from the remainder and the band (§4.1/§2.1(ii)/§13.2 (8)(c))`,
        )
      }
    }
    // §6 FS11 — the two SIGNED diagnostics (`passTotalsMinusRowMs`,
    // `passRowUnaccountedDeltaMs`) are legal as numbers but must SAY so: a name that
    // promises a measure may never carry a signed difference (the fifth run's
    // `passOverlapSumMs` read exactly `Σ(pass totals) − row total`). They are therefore
    // never checked as measures and never allowed under a measure's name — the driver
    // emits them with their `notAMeasure`/`notADoubleCount` labels (§2.4/RUL-11).
    // §3.6b RUL-4 clause 5 / RUL-12 (`F5-6`) — the mandatory note: the fifth run's
    // top-level `reconciliation.note` read `null` on both legs and NO validator reason
    // fired. It is REPORTED here (a non-forcing note) and the DRIVER emits it on every
    // report; a forcing clause is not available at this surface, because the red set's
    // own fixtures pin `note:null` on a schema-valid row (see `notes[]`).
    if (recon.note === null || recon.note === undefined || recon.note === '') {
      notes.push(
        `run ${id}: reconciliation.note is ${JSON.stringify(recon.note ?? null)} — the §3.6b RUL-4 clause-5 mandatory note must be PRESENT ` +
          `on the new-shape report (RUL-12/§12.4 'F5-6'); its row-level restatement is not a substitute`,
      )
    }
  }
  // --- §4.2/§4.3 fail-loud/§6 — the row's OWN `pass`/`failReasons` pair -------------
  // (§13.2 (8)(b) [O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS].) The validator never read the
  // row's declared verdict, so a row recording `pass:true` beside a NON-EMPTY
  // `failReasons[]` — a `pass:true` beside any `FS-n` observable, a review finding per §6 —
  // and its mirror (`pass:false` with an EMPTY reason set, the schema error §6 names) both
  // validated `ok:true`. The verdict is DERIVED (pass ⇔ no reason), so the pair must read
  // consistently in BOTH directions.
  if (typeof row.pass === 'boolean' && Array.isArray(row.failReasons) && row.pass !== (row.failReasons.length === 0)) {
    err(
      `run ${id}: the row verdict pair is unreadable — it records pass:${String(row.pass)} with ${row.failReasons.length} failReasons[] ` +
        `entr(y|ies)${row.failReasons.length ? ` (${JSON.stringify(String(row.failReasons[0]).slice(0, 80))})` : ''}: the verdict is DERIVED ` +
        `(pass ⇔ failReasons.length === 0), so a pass:true beside a recorded reason is a review finding and a pass:false with an EMPTY ` +
        `reason set is a schema error (§4.2/§4.3 fail-loud/§6)`,
    )
  }
  // §3b re-audit finding (1) [O0-SHAPE-OK-FROM-ONE-CHANNEL] — the verdict is derived from
  // BOTH reason channels: `ok` may never read `true` beside a non-empty `failReasons[]`
  // (which is exactly how the dropped `sessionCountsAt` reason escaped the driver's
  // `!shape.ok` copy condition and the reason never reached the report).
  return { ok: errors.length === 0 && failReasons.length === 0, errors, failReasons, legacyShape, legacyShapeReason, notes: [...notes, ...aggregationNotes] }
}
