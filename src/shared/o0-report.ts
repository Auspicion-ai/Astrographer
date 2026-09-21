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
  return { ok: failReasons.length === 0, violated: failReasons.length > 0, failReasons, toleranceMs, armWindowOk, offenders }
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
  // §4.2/RUL-4 clause 4/§6 F18 — `ok` (SCHEMA validity) is NOT the verdict: the
  // structural family is a recorded FACT and is not gating. `gating` is every reason
  // OUTSIDE the family, and the status is derived from exactly that split.
  const family = [...new Set([...structural, ...derivedResidual])]
  const gating = failReasons.filter((m) => !family.includes(m))
  const derived = deriveO0ReportStatus({ ok: true, gating, failReasons: [...gating, ...family], structuralFamily: family })
  const ok = errors.length === 0 && gating.length === 0

  if (rep.pass === false && gating.length === 0 && family.length === 0) {
    err('the report records pass:false with no forcing reason (§4.3 fail-loud)')
  }
  if (rep.pass === true && gating.length > 0) {
    failReasons.push(
      `the report records pass:true but the harness derived ${gating.length} forcing condition(s) — a verdict is ` +
        `NEVER asserted true (§4.4/D-GP-UFA-3)`,
    )
  }
  if (rep.pass === true && family.length > 0 && gating.length === 0) {
    err(
      `report pass:true with ${family.length} recorded structural fact(s) — the status of such a report is ` +
        `"OPEN-structural", never "OK" (§4.2/RUL-4: OK ⇔ pass:true)`,
    )
  }
  // A report that DECLARES a status must declare the DERIVED one, and its `pass` must
  // agree with it (§4.2/RUL-4): `OK` ⇔ `pass:true`; `OPEN-structural` ⇔ a
  // `pass:false` whose every forcing reason is in the structural family.
  if (rep.status !== undefined && rep.status !== null) {
    if (rep.status !== derived.status) {
      err(
        `report status ${JSON.stringify(rep.status)} disagrees with the status the recorded reasons DERIVE (${derived.status}) — ` +
          `a status is COMPUTED from the reasons, never asserted (§4.4/D-GP-UFA-3/RUL-4)`,
      )
    }
    if (rep.pass !== (derived.status === 'OK')) {
      err(
        `report status ${JSON.stringify(rep.status)} contradicts pass:${String(rep.pass)} (§4.2/RUL-4: OK ⇔ pass:true, ` +
          `OPEN-structural ⇔ a pass:false whose reasons are all structural)`,
      )
    }
    // §3.6b RUL-4 clause 5 / §6 F18 — the reconciliation note is MANDATORY on the
    // OPEN-structural branch.
    if (derived.status === 'OPEN-structural' && (typeof rep.reconciliation?.note !== 'string' || rep.reconciliation.note === '')) {
      err(
        `report status is "OPEN-structural" without a reconciliation.note naming the structural stages, the non-computable ` +
          `residual and the no-imputation statement (§3.6b RUL-4 clause 5)`,
      )
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
  return {
    ok,
    errors,
    failReasons: [...gating, ...family],
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
