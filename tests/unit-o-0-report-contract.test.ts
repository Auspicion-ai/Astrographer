// tests/unit-o-0-report-contract.test.ts — TestWriter RED set for unit O-0
// ("per-stage freeze measurement — PRECONDITION ARTIFACT").
//
// Spec source (the ONLY design source): docs/specs/unit-o-0-per-stage-measurement.md
//   §2.2  the CLOSED 11-stage id set
//   §2.3  the two mandatory hit-tested gestures + the pinned folder-row pick
//   §2.4  the GPU-on/off + `display:block`-track ablation controls
//   §3    the harness surface (5 closed block names, the pinned CLI flags, the
//         corpus + seed `o0-2026-09-17`, the run commands, bundle identity)
//   §4    the report-shape contract (artifact, top-level schema, the `runs[]`
//         freeze row, the DERIVED verdict + the 4 falsifiability requirements)
//   §3.6b the seam re-derivation: the CALLER-level round trip (stages 1/3), the
//         optional main-side `snapshot.clone` refinement, the two recorder
//         instances, the union aggregation, the unseparated/structural rule and
//         the A-4 read count that stays UNMEASURED (never a "measured" 0)
//   §4.2  the finiteness rule R-2 (`longTaskTotalMs` is REQUIRED, non-negative
//         finite) — pinned by the P-IM-1 mode-4 row
//   §4.3  the H3 WINDOW-BOUND rule (`ms ≤ longTaskTotalMs + tolerance`), the
//         armed-window rule and the `structural:true` + `structuralReason` marker
//   §4.4  the two H2/H3 verdict forms (UNMEASURED read count; WINDOW-BOUND
//         VIOLATED — never a percentage above 100)
//   §5    the typed property register — P-IM-1, P-IM-2, P-SM-1, P-SM-2,
//         P-TP-1, P-TP-2, P-TP-3 (≤100 attempts/row, stop-after-5; this file
//         carries 7 of the 8 rows; P-HK-1 lives in unit-o-0-hook-contract)
//   §6    the states S1..S7 + S14..S17, the fail-states F1..F10 + F13a/F14/F17
//   §7    the §3a adversarial record (R-1: the R1 finding is REJECTED/withdrawn)
//   §8.1  the census (11 stages, 5 blocks, 8 register rows, 6 runs, 4 controls)
//   §11   the gate shape (the red set IS the property/pure-module red set)
//
// ---------------------------------------------------------------------------
// WHY THIS FILE IS RED: §5 requires the report schema + reconciliation helpers
// to be a PURE, node-testable module. That module DOES NOT EXIST yet:
//
//   *** src/shared/o0-report.ts — PINNED by this TestWriter (the spec §5 leaves
//   the path free; every export below is the contract the Implementer must
//   match EXACTLY). The module is imported lazily per test through a helper
//   that carries `@ts-expect-error` (vitest transpiles without typecheck), so a
//   missing module fails the individual row with "module does not exist"
//   instead of breaking collection of the whole file.
//
// The MEASUREMENT itself runs LIVE (§3) and can never run in node: every test
// here validates the REPORT SHAPE and its INVARIANTS — the RCA-12 split stated
// explicitly in §5 ("a property-green is schema-green, never app-green").
//
// The driver source-contract half lives in tests/unit-o-0-driver-contract.test.ts
// (the tests/live-drive-contract.test.ts convention: node-static assertions on
// the source text, never a claim about live behavior).
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (spec §6 S1..S7 — the states exercised below)
// ---------------------------------------------------------------------------
//   S1. Empty corpus (`--no-seed`, no store): the folder/document gesture rows
//       are unreachable → path 'missing'; the report is EMIT-ABLE and
//       pass:false. An empty corpus can never yield an O-0 pass (F8 census gate).
//   S2. Single document (the driver's seedCorpus: alpha.md + beta.md): the
//       report SHAPE is exercised end-to-end (stageCount === 11, longTasks
//       array, controls) with corpus.documents === 2; the QUANTITATIVE claim is
//       explicitly NOT made → pass:false on the census gate (F8).
//   S3. Operator corpus size (226 documents): the ONLY state in which the report
//       may be pass:true; stage table complete.
//   S4. Engine-absent boot (no gnosis-server): env.engine === 'absent'; every
//       local path behaves identically; no O-0 stage depends on engine presence.
//   S5. Collapsed / expanded pane set: the pane-set census (paneFrames) is
//       recorded per run; a paired control run with a DIFFERENT pane census
//       forces pass:false (F9).
//   S6. GPU-on leg / GPU-off leg: both legs present, `gpu` recorded per run; a
//       run whose `gpu` disagrees with the flag the driver passed forces
//       pass:false.
//   S7. Ablation applied / not applied: trackAblation.applied + the exact style
//       mutation; the paired runs differ only in that mutation; a missing
//       ablation row forces pass:false (F5/F9).
//   S14. A stage is STRUCTURALLY unmeasurable (no seam exists in the executing
//        bundle — the H2 class, §6 S14): ms:null + unseparated:true +
//        structural:true + a structuralReason naming the missing seam, and the
//        row's reason names it as STRUCTURAL — distinct from a merely unmeasured
//        stage (a seam exists but was not armed).
//   S15. The main-side refinement is ABSENT (`--connect`, a refused main-side
//        arm, or a bundle without the main seam, §6 S15): `snapshot.clone` stays
//        unseparated+structural while the CALLER-level `snapshot.pull` round trip
//        is still measured — the A-4 discriminator is answered.
//   S16. The window bound is VIOLATED (a stage larger than its freeze — the H3
//        class, §6 S16/§4.3): pass:false naming BOTH numbers; the row's verdict
//        is the WINDOW-BOUND VIOLATED string, NEVER a percentage (the live
//        1698.82% string is the exact defect this state removes).
//   S17. Inertness is measured but VACUOUS (§6 S17/F17b): a report whose runs
//        ARMED the hook but carries NO inertness comparison is pass:false with a
//        forcing reason naming §3.6(c); `driver.hookInertness: []` is legal ONLY
//        when no run armed the hook.
//
// FAIL-STATES PINNED (spec §6 FS F1..F10 — one `it` per forcing condition)
//   F1  stage id absent / stageCount ≠ 11  → pass:false + a failReasons line
//   F2  driver.build.verified !== true      → pass:false
//   F3  NaN / negative / string stage ms or counter → pass:false (raw printed)
//   F4  a stage cannot be separated         → ms:null + unseparated:true;
//       an IMPUTED ms on an unseparated stage forces pass:false; the
//       reconciliation fails with the unseparated ids named
//   F5  the track ablation is unavailable   → pass:false + mutation:null
//   F6  the display is unreachable / wrong  → driver-level ABORT, exit 2, no
//       artifact (asserted in the DRIVER contract file — a pure module cannot
//       observe a boot failure)
//   F7  the gesture was not hit-tested      → pass:false + the fallback named
//   F8  the corpus census disagrees with the claimed corpus → pass:false
//   F9  a control/ablation row is missing or its pairing is broken → pass:false
//   F10 a required top-level field is missing → the schema-error verdict
//       `O-0 REPORT INVALID: <field> missing` + pass:false
//   F13 a `stages[]` entry the row cannot use is named by its INDEX
//       (`stages[<i>]`), never through a coerced 'undefined' stage id (§3a
//       finding 2/§7 row 6)
//   F13a a stage EXCEEDS the freeze window it belongs to (H3) → pass:false
//       naming both the stage `ms` and `longTaskTotalMs + tolerance`, and the
//       WINDOW-BOUND VIOLATED verdict instead of a percentage
//   F14 a stage is structurally unmeasurable (structural:true + its recorded
//       reason) or double-recorded by the two recorder instances (§3.6b/S14)
//   F17a the driver's self-validation rejected a row the driver's inline rules
//       accepted (driver source-contract — see the driver contract file)
//   F17b a run armed the hook but the report carries NO inertness comparison
//       (the vacuous-arming fail-state, §6 S17)
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'

// ===========================================================================
// §0.1 — the deterministic PBT harness (mulberry32, pinned seed). NO Math.random().
//        Budget: ≤100 attempts/row, ≤400 total, stop-after-5 (§5).
// ===========================================================================
const PBT_SEED = 0x6f302d31 // "o0-1" — this file's pinned seed
const PBT_ATTEMPTS = 60 // §5 — the six report rows: 60 attempts each
/** §5 — `P-TP-3`'s allocation is **50** (the new row's own constant; the
 *  register budget is `60×6 + 40 + 50 = 470`, ≤100/row, ≤800 at the ceiling). */
const PTP3_ATTEMPTS = 50
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
/** Run a row's property over the seeded attempts; stop after 5 counterexamples.
 *  `attempts` defaults to the six report rows' 60; `P-TP-3` passes its own 50. */
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
/** The per-row report line the TestWriter returns to the supervisor (§5). */
function report(rep: PbtReport): string {
  return `${rep.row} | ${rep.strategyId} | attempts=${rep.attempts} | ${rep.held ? 'held' : `BROKEN x${rep.counterexamples.length}`} | ${rep.counterexamples.slice(0, 3).join(' ;; ')}`
}
function assertHeld(rep: PbtReport): void {
  // §5 — the per-row report line the TestWriter returns to the supervisor, emitted
  // only on request (`O0_PBT_REPORT=1`) so the default suite stays quiet.
  if (process.env.O0_PBT_REPORT) console.log(`[pbt] ${report(rep)}`)
  expect(rep.held, report(rep)).toBe(true)
}

// ===========================================================================
// §0.2 — the module surface (§5: the report schema + reconciliation helpers are
//        a PURE node-testable module). The path + every name below is PINNED by
//        this red set; the Implementer must match it exactly.
//
//        Re-pinned by the H3/H2 re-derivation (§4.3/§4.4/§5 P-TP-3/§6 S14-S17):
//          deriveO0WindowBound(run, opts?) →
//            { ok, violated, failReasons, toleranceMs, armWindowOk,
//              offenders: [{ stageId, ms, boundMs }] }
//          — the §5 P-TP-3 oracle: `violated:true` iff some SEPARATED stage has
//          `ms > longTaskTotalMs + hookToleranceMs` (default the recorded 40 ms
//          band) OR the armed window widens the freeze beyond that tolerance
//          (the arm starts before the freeze `o0:t0` / ends after `o0:t1`);
//            and `deriveO0StageVerdict` must emit §4.4's WINDOW-BOUND VIOLATED
//          string (no `%`, `pct === null`) INSTEAD of the percentage form when
//          that oracle fires.
// ===========================================================================
const MODULE_SPECIFIER = '../src/shared/o0-report.js'
const MODULE_PATH = 'src/shared/o0-report.ts'

interface O0StageShape { id: string; ms: number | null; unseparated: boolean; source: 'hook' | 'mark' | 'derived' }
interface O0RunShape {
  id: string
  block: string
  gesture: string
  target: string
  folderPath?: string | null
  documentId?: string | null
  path: string
  realInput?: boolean
  stageCount: number
  stages: O0StageShape[]
  longTasks: Array<{ start: number; duration: number }>
  longTaskTotalMs: number | null
  mutations: number | null
  wallMs: number | null
  gpu: boolean
  trackAblation: { applied: boolean; mutation: string | null }
  bundleVerified: boolean
  pass: boolean
  failReasons: string[]
  /** §4.3/§3.6b — the recorded hook block: the armed interval, the freeze
   *  interval it is judged against (P-TP-3(b)), the arm/disarm counts and the
   *  per-record instance attribution (`'renderer' | 'main'`). ADDITIVE row
   *  fields pinned by the red re-pin: §4.3's field list names
   *  `hook.armWindow`/`armCount`/`disarmCount`/`stageRecords` but no field for
   *  the freeze window or the arming flag, which §5 P-TP-3(b) and §6 S17 need. */
  hook?: {
    armed?: boolean
    armWindow?: { t0: number; t1: number; ms?: number }
    freezeWindow?: { t0: number; t1: number }
    armCount?: number
    disarmCount?: number
    stageRecords?: Array<{ stage: string; instance: 'renderer' | 'main' }>
    stageRowsSource?: string
  }
}
type O0Api = Record<string, any>

async function loadO0(): Promise<O0Api> {
  try {
    // @ts-expect-error RED: the pinned pure module does not exist yet (§5).
    return (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as O0Api
  } catch (e) {
    throw new Error(
      `RED — the pinned pure O-0 report module '${MODULE_PATH}' does not exist (` +
        `spec §5 requires the report schema + reconciliation helpers to be a pure, node-testable module). ` +
        `Import error: ${String(e)}`,
    )
  }
}
/** The pinned stage-id list, read from the module (never hard-coded in the test). */
function idsOf(api: O0Api): string[] {
  const ids = api.O0_STAGE_IDS
  expect(Array.isArray(ids), `${MODULE_PATH} must export O0_STAGE_IDS as an array`).toBe(true)
  return [...ids] as string[]
}

// ===========================================================================
// §0.3 — the report fixtures (§4.2 top-level schema + §4.3 freeze row).
// ===========================================================================
const SEED = 'o0-2026-09-17'

function stagesFor(ids: readonly string[]): O0StageShape[] {
  return ids.map((id) => ({ id, ms: 1, unseparated: false, source: id === 'post.style' ? 'derived' : 'mark' }))
}
function runFor(ids: readonly string[], over: Partial<O0RunShape> = {}): O0RunShape {
  const stages = over.stages ?? stagesFor(ids)
  const base: O0RunShape = {
    id: 'o0-folder-row-gpuoff-r1',
    block: 'o0_folder_row',
    gesture: 'folder-row',
    target: '#pane-doc-nav [data-folder-path="src"]',
    folderPath: 'src',
    documentId: null,
    path: 'cdp',
    realInput: true,
    stageCount: ids.length,
    stages,
    longTasks: [{ start: 100, duration: 439 }, { start: 600, duration: 439 }],
    longTaskTotalMs: 878,
    mutations: 39,
    wallMs: 1011,
    gpu: false,
    trackAblation: { applied: false, mutation: null },
    bundleVerified: true,
    pass: true,
    failReasons: [],
  }
  return { ...base, ...over }
}
function reportFor(runs: O0RunShape[], ids: readonly string[], over: Record<string, any> = {}): Record<string, any> {
  const base: Record<string, any> = {
    artifact: 'o-0-per-stage-breakdown',
    spec: 'docs/specs/unit-o-0-per-stage-measurement.md',
    unit: 'O-0',
    date: '2026-09-17',
    layer: 'assembled-renderer (RCA-12)',
    commands: ['node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --o0-out=/tmp/o0-gpuoff.json'],
    driver: {
      build: { renderer: 'mtime+len', main: 'mtime+len', served: 'mtime+len', verified: true },
      gpuFlag: false,
      cliArgs: ['--connect', '--o0-out=/tmp/o0-gpuoff.json'],
      runMode: 'connect',
    },
    tolerance: { reconcileMs: 50, source: 'measured 2026-09-17' },
    corpus: { source: 'operator-store', documents: 226, nodes: 900, edges: 1200, seed: SEED },
    env: { mode: 'lexical', gpu: false, engine: 'ready', display: ':0', paneFrames: 6 },
    stageIds: [...ids],
    runs,
    controls: [
      { id: 'gpu-off', runRef: 'o0-folder-row-gpuoff-r1', pairedWith: 'o0-folder-row-gpuon-r1' },
      { id: 'gpu-on', runRef: 'o0-folder-row-gpuon-r1', pairedWith: 'o0-folder-row-gpuoff-r1' },
    ],
    verdicts: ['placeholder — the harness DERIVES these (§4.4), never hard-codes them'],
    pass: true,
  }
  return { ...base, ...over }
}
/** A paired GPU-on/off fixture (S6). */
function gpuPair(ids: readonly string[]): { off: O0RunShape; on: O0RunShape } {
  const off = runFor(ids, { id: 'o0-folder-row-gpuoff-r1', gpu: false })
  const on = runFor(ids, { id: 'o0-folder-row-gpuon-r1', gpu: true })
  return { off, on }
}
const OK_RUN = (msg: string, api: O0Api, run: O0RunShape) => {
  const r = api.validateO0Run(run)
  expect(r, `${msg}: validateO0Run must return a discriminated result`).toBeTypeOf('object')
  expect(r.ok, `${msg}: expected ok:true, got errors=${JSON.stringify(r.errors)}`).toBe(true)
  return r
}
const BAD_RUN = (msg: string, api: O0Api, run: O0RunShape, pathish: string | RegExp) => {
  const r = api.validateO0Run(run)
  expect(r.ok, `${msg}: expected ok:false (a forcing condition must not pass)`).toBe(false)
  expect(Array.isArray(r.errors) && r.errors.length > 0, `${msg}: an ok:false result must name the field path`).toBe(true)
  const blob = JSON.stringify({ errors: r.errors, failReasons: r.failReasons })
  expect(blob, `${msg}: the failure must NAME '${String(pathish)}' (the exact observable)`).toMatch(pathish)
  expect(Array.isArray(r.failReasons) && r.failReasons.length > 0, `${msg}: pass:false requires ≥1 failReasons line (§4.3 fail-loud)`).toBe(true)
  return r
}

describe(`O-0 report schema + reconciliation helpers (PURE module ${MODULE_PATH}) — state coverage S1..S7`, () => {
  // -------------------------------------------------------------------------
  // §2.2 / §8.1 — the CLOSED stage set (11 ids, in spec order).
  // -------------------------------------------------------------------------
  it('O0.1 [§2.2] O0_STAGE_IDS is the CLOSED spec-order 11-id set (the report stable join key)', async () => {
    const api = await loadO0()
    expect(idsOf(api), 'the closed stage id set (§2.2, census §8.1 = 11)').toEqual([
      'snapshot.pull', 'snapshot.clone', 'docheads.pull', 'traversal.build', 'envelope.assemble',
      'shared.decorate', 'reconcile.roots', 'reconcile.apply', 'render.dom', 'render.ssr', 'post.style',
    ])
    expect(api.O0_STAGE_IDS.length, 'stageCount is 11 (§8.1)').toBe(11)
  })

  it("O0.2 [§3.1/§8.1] the harness surface constants are pinned: 5 block names, seed 'o0-2026-09-17', corpus 226, 11-stage count", async () => {
    const api = await loadO0()
    expect(api.O0_BLOCK_NAMES, 'the 5 closed block names (§3.1, census §8.1)').toEqual([
      'o0_folder_row', 'o0_document_row', 'o0_gpu_control', 'o0_track_ablation', 'o0_repeat_determinism',
    ])
    expect(api.O0_SEED, "the pinned deterministic seed (§3.4)").toBe(SEED)
    expect(api.O0_OPERATOR_DOCUMENTS, 'the operator corpus census (§3.4)').toBe(226)
    expect(api.O0_STAGE_COUNT, 'the pinned stageCount (§4.3)').toBe(11)
    expect(typeof api.buildO0StageSkeleton === 'function', 'buildO0StageSkeleton must be exported').toBe(true)
    const skel = api.buildO0StageSkeleton()
    expect(skel.map((s: O0StageShape) => s.id), 'the skeleton is the 11 ids in spec order').toEqual(idsOf(api))
  })

  // -------------------------------------------------------------------------
  // S3 — operator corpus, valid report (the ONLY state that may pass).
  // -------------------------------------------------------------------------
  it('O0.3 [S3] 226-document operator corpus: a complete freeze row validates ok and the report is emit-able', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    OK_RUN('operator-corpus folder-row freeze (S3)', api, off)
    const rep = reportFor([off, on], ids)
    const v = api.validateO0Report(rep)
    expect(v.ok, `S3: expected ok:true, got errors=${JSON.stringify(v.errors)}`).toBe(true)
    expect(v.failReasons, 'a valid report has no forcing reason').toEqual([])
  })

  it('O0.4 [S2] single-document corpus (seedCorpus: 2 docs): shape is complete (stageCount 11, longTasks, controls) but the census gate forces pass:false', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    OK_RUN('S2 shape check (the row itself is structurally valid)', api, off)
    const rep = reportFor([off, on], ids, { corpus: { source: 'seed', documents: 2, nodes: 3, edges: 1, seed: SEED }, pass: false })
    const v = api.validateO0Report(rep)
    expect(v.ok, 'S2: the census gate must force the RUN verdict, not a schema error').toBe(false)
    expect(JSON.stringify(v.failReasons), 'S2/F8: the census mismatch must be named').toMatch(/corpus|census|documents/i)
    expect(api.deriveO0CensusVerdict({ documents: 2, nodes: 3, edges: 1 }, 226).pass, 'S2 can never be an O-0 pass (§6 S2/F8)').toBe(false)
    expect(api.deriveO0CensusVerdict({ documents: 226, nodes: 3, edges: 1 }, 226).pass, 'S3 clears the census gate').toBe(true)
  })

  // -------------------------------------------------------------------------
  // S1 — empty corpus is emit-able, always pass:false.
  // -------------------------------------------------------------------------
  it("O0.5 [S1/F7] empty corpus: the gesture row is unreachable (path 'missing') and can never yield a pass", async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const empty = runFor(ids, {
      id: 'o0-folder-row-empty-r1', path: 'missing', realInput: false, target: '#pane-doc-nav [data-folder-path]',
      folderPath: null, pass: false, failReasons: ['gesture path missing (not \'cdp\') for #pane-doc-nav [data-folder-path] — hit=null'],
    })
    const r = BAD_RUN('S1 empty corpus (§2.3: a non-cdp path forces pass:false)', api, empty, 'missing')
    expect(api.deriveO0GesturePath('missing').realInput, "S1: realInput is DERIVED from path === 'cdp' (§4.3)").toBe(false)
    expect(api.deriveO0GesturePath('missing').pathRuleOk, 'S1: the gesture-path rule fails for a non-cdp path').toBe(false)
    expect(r.failReasons.join(' '), 'S1/F7: the fallback path must be NAMED in the reason').toMatch(/missing/)
  })

  // -------------------------------------------------------------------------
  // S4 — engine-absent boot changes nothing about O-0.
  // -------------------------------------------------------------------------
  it("O0.6 [S4] engine-absent boot: env.engine 'absent' must not be a forcing condition (every local path behaves identically)", async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const rep = reportFor([off, on], ids, { env: { mode: 'lexical', gpu: false, engine: 'absent', display: ':0', paneFrames: 6 } })
    const v = api.validateO0Report(rep)
    expect(v.ok, `S4: engine-absent must validate exactly like engine-ready, got errors=${JSON.stringify(v.errors)}`).toBe(true)
  })

  // -------------------------------------------------------------------------
  // S5 — the pane-set census is recorded per run; a pairing that differs fails.
  // -------------------------------------------------------------------------
  it('O0.7 [S5/F9] the pane-set census is recorded per run, and a paired control with a different pane census forces pass:false', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const controls = [
      { id: 'gpu-off', runRef: off.id, pairedWith: on.id },
      { id: 'gpu-on', runRef: on.id, pairedWith: off.id },
    ]
    const same = api.validateO0Reports([off, on], { controls, tolerance: { reconcileMs: 50, source: 'measured 2026-09-17' }, ids })
    expect(same.ok, `S5: identical pane censuses must pair cleanly, errors=${JSON.stringify(same.errors)}`).toBe(true)
    const onDrifted = { ...on, paneFrames: 4 }
    const drifted = api.validateO0Reports([off, onDrifted], { controls, tolerance: { reconcileMs: 50, source: 'measured 2026-09-17' }, ids })
    expect(drifted.ok, 'S5/F9: a paired run with a different pane census must fail').toBe(false)
    expect(JSON.stringify(drifted.failReasons), 'S5/F9: the mismatching dimension (pane census) must be named').toMatch(/pane|paired runs differ/i)
  })

  // -------------------------------------------------------------------------
  // S6 — the GPU legs are both present and each run's flag is recorded.
  // -------------------------------------------------------------------------
  it("O0.8 [S6] both GPU legs present with the flag recorded per run; a run whose `gpu` disagrees with the driver's passed flag forces pass:false", async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const rep = reportFor([off, on], ids)
    const v = api.validateO0Report(rep)
    expect(v.ok, `S6: both legs + the per-run gpu flag must validate, errors=${JSON.stringify(v.errors)}`).toBe(true)
    expect([off.gpu, on.gpu], 'S6: the legs must actually differ (else the control is vacuous)').toEqual([false, true])
    const lying = runFor(ids, { id: 'o0-folder-row-gpuoff-r2', gpu: true }) // driver passed --no-gpu
    const bad = api.validateO0Report(reportFor([off, lying], ids, { driver: { ...rep.driver, gpuFlag: false }, pass: false }))
    expect(bad.ok, 'S6: a run gpu value disagreeing with the driver flag must fail').toBe(false)
  })

  // -------------------------------------------------------------------------
  // S7 — the ablation is recorded, and it is a delta against a paired run.
  // -------------------------------------------------------------------------
  it('O0.9 [S7] ablation applied/not applied: the exact style mutation is recorded and the pair differs only in that mutation', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const plain = runFor(ids, { id: 'o0-fold-ablation-off', block: 'o0_track_ablation', trackAblation: { applied: false, mutation: null } })
    const ablated = runFor(ids, {
      id: 'o0-fold-ablation-on', block: 'o0_track_ablation',
      trackAblation: { applied: true, mutation: 'stage grid cell: display:block (removes the 12698.7px grid track)' },
    })
    OK_RUN('S7 baseline (ablation not applied)', api, plain)
    OK_RUN('S7 ablated', api, ablated)
    const rep = reportFor([plain, ablated], ids, {
      controls: [
        { id: 'track-ablation-off', runRef: plain.id, pairedWith: ablated.id },
        { id: 'track-ablation-on', runRef: ablated.id, pairedWith: plain.id },
      ],
    })
    const v = api.validateO0Report(rep)
    expect(v.ok, `S7: an applied ablation + its paired baseline must validate, errors=${JSON.stringify(v.errors)}`).toBe(true)
    // F5: an ablation that cannot be applied is a DOCUMENTED FAIL-STATE, never a park.
    const missing = runFor(ids, { id: 'o0-fold-ablation-na', block: 'o0_track_ablation', trackAblation: { applied: false, mutation: null }, pass: false })
    const na = api.validateO0Report(reportFor([missing], ids, { controls: [], pass: false, commands: ['ablation leg only'] }))
    expect(na.ok, 'S7/F5: a comparison row emitted without its paired ablation control must fail').toBe(false)
    expect(JSON.stringify(na.failReasons), 'S7/F5/F9: the missing control row must be named').toMatch(/ablation|paired|control/i)
  })

  // -------------------------------------------------------------------------
  // §2.3 — the pinned folder-row pick (largest child-row count, ties →
  //        lexicographic data-folder-path ascending under the pinned seed).
  // -------------------------------------------------------------------------
  it('O0.10 [§2.3] the folder-row pick is PINNED: largest child-row count, ties broken lexicographically ascending', async () => {
    const api = await loadO0()
    const rows = [
      { folderPath: 'z-src/deep', childRowCount: 3 },
      { folderPath: 'a-src', childRowCount: 3 }, // tie with z-src/deep → 'a-src' wins
      { folderPath: 'm', childRowCount: 1 },
      { folderPath: 'b', childRowCount: 10 }, // largest → wins outright
    ]
    expect(api.pickO0FolderRow(rows).folderPath, 'the largest child-row count wins').toBe('b')
    expect(api.pickO0FolderRow(rows.filter((r) => r.folderPath !== 'b')).folderPath, 'a tie breaks lexicographic-ascending').toBe('a-src')
    expect(api.pickO0FolderRow([]), 'an empty corpus (S1) has no pick — null, never a throw').toBeNull()
    const shuffled = [...rows].reverse()
    expect(api.pickO0FolderRow(shuffled).folderPath, 'the pick is input-order independent (reproducible artifact)').toBe('b')
  })

  // -------------------------------------------------------------------------
  // §4.4 — the DERIVED verdict (never hard-coded), incl. the A-4 discriminator.
  // -------------------------------------------------------------------------
  it('O0.11 [§4.4] the verdict is DERIVED from the row: the largest identified stage formula, and the A-4 snapshot-read discriminator', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const run = runFor(ids, {
      stages: ids.map((id) => ({ id, ms: id === 'snapshot.pull' ? 412.5 : 10, unseparated: false, source: 'mark' })),
      longTaskTotalMs: 1000,
    })
    const v1 = api.deriveO0StageVerdict(run)
    expect(v1.largestStageId, 'the largest identified stage is derived from stages[].ms').toBe('snapshot.pull')
    expect(v1.verdict, 'the §4.4 formula is pinned: `stage <id> is <ms> ms of the <total> ms long task (<pct>%) on <gesture> — <id> is the largest identified stage`')
      .toMatch(/^stage snapshot\.pull is 412\.5 ms of the 1000 ms long task \(41\.25%\) on folder-row — snapshot\.pull is the largest identified stage$/)
    const v2 = api.deriveO0SnapshotVerdict(run, { documents: 226, nodes: 900, edges: 1200 })
    expect(v2.readCount, 'the A-4 discriminator counts whole-store reads in the row').toBe(1)
    expect(v2.verdict, 'the §4.4 A-4 formula is pinned, incl. the census triplet')
      .toMatch(/^the folder-row performed 1 whole-store IPC_RAG_SNAPSHOT read\(s\) totalling 412\.5 ms \(census 226 docs \/ 900 nodes \/ 1200 edges\)$/)
    // The cheap-variant answer: an unseparated snapshot.pull is NOT a read.
    const unsep = runFor(ids, { stages: ids.map((id) => ({ id, ms: id === 'snapshot.pull' ? null : 10, unseparated: id === 'snapshot.pull', source: 'mark' })) })
    expect(api.deriveO0SnapshotVerdict(unsep, { documents: 226, nodes: 900, edges: 1200 }).readCount, 'an unseparated snapshot.pull is not a counted read').toBe(0)
    const zero = runFor(ids, { stages: ids.map((id) => ({ id, ms: id === 'snapshot.pull' ? 0 : 10, unseparated: false, source: 'mark' })) })
    expect(api.deriveO0SnapshotVerdict(zero, { documents: 226, nodes: 900, edges: 1200 }).readCount, 'a zero-ms snapshot.pull IS the recorded A-4 proof (a non-zero read is separate)').toBe(0)
    // §4.4: a missing required field yields the schema-error verdict, never a false claim.
    const v3 = api.deriveO0Verdicts({ ...run, gesture: undefined } as never, { documents: 226, nodes: 900, edges: 1200 })
    expect(v3.ok, '§4.4: a row missing a required field must not produce a verdict').toBe(false)
    expect(v3.verdicts.join(' '), '§4.4: the schema-error verdict string is pinned').toMatch(/^O-0 REPORT INVALID: gesture missing$/)
  })

  it("O0.12 [§4.4/F7] the derived verdict is STILL emitted for an unproven gesture, naming the fallback path", async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const run = runFor(ids, { path: 'native-fallback', realInput: false, pass: false })
    const v = api.deriveO0StageVerdict(run)
    expect(v.ok, 'F7: the truth must be visible even in failure — a verdict is emitted, the ROW fails').toBe(true)
    expect(v.verdict, "F7: the fallback path must be named in the verdict").toMatch(/native-fallback/)
  })

  // -------------------------------------------------------------------------
  // §4.2 / F10 — the top-level schema.
  // -------------------------------------------------------------------------
  it('O0.13 [§4.2/F10] every required top-level field is enforced: a missing one yields `O-0 REPORT INVALID: <field> missing` + pass:false', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const full = reportFor([off, on], ids)
    const required = [
      'artifact', 'spec', 'unit', 'date', 'layer', 'commands', 'driver', 'tolerance',
      'corpus', 'env', 'stageIds', 'runs', 'controls', 'verdicts', 'pass',
    ]
    for (const field of required) {
      const partial = { ...full }
      delete partial[field]
      const v = api.validateO0Report(partial)
      expect(v.ok, `F10: dropping \`${field}\` must invalidate the report`).toBe(false)
      expect(v.verdicts.join(' '), `F10: the pinned schema-error verdict must name \`${field}\``)
        .toContain(`O-0 REPORT INVALID: ${field} missing`)
    }
    expect(api.validateO0Report(full).ok, 'the control case: the complete report validates').toBe(true)
  })

  it('O0.14 [§4.2/F2] bundle identity is MANDATORY: driver.build.verified !== true forces pass:false (a report is never a provisional pass)', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const full = reportFor([off, on], ids)
    const stale = reportFor([off, on], ids, {
      driver: { ...full.driver, build: { ...full.driver.build, verified: false, served: 'stale-hash' } },
      pass: true,
    })
    const v = api.validateO0Report(stale)
    expect(v.ok, 'F2: verified:false must invalidate the report').toBe(false)
    expect(JSON.stringify(v.failReasons), 'F2: the served-vs-disk mismatch must be named').toMatch(/bundle|verified|served/i)
    // Per-row too (§4.3 `bundleVerified`).
    BAD_RUN('F2: a freeze row measured against an unverified bundle', api, runFor(ids, { bundleVerified: false, pass: false }), 'bundle')
  })

  it('O0.15 [§4.2] the pinned constants appear verbatim: artifact id, spec path, unit, layer, seed and the corpus census', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const ok = api.validateO0Report(reportFor([off, on], ids))
    expect(ok.ok).toBe(true)
    for (const [field, bad] of [
      ['artifact', { artifact: 'o-0-summary' }],
      ['spec', { spec: 'docs/specs/other.md' }],
      ['unit', { unit: 'O-5' }],
      ['layer', { layer: 'node-envelope' }],
    ] as const) {
      const v = api.validateO0Report(reportFor([off, on], ids, bad))
      expect(v.ok, `§4.2: a wrong \`${field}\` value must invalidate the report`).toBe(false)
      expect(JSON.stringify(v.errors), `§4.2: the wrong \`${field}\` must be named`).toMatch(field)
    }
    expect(api.validateO0Report(reportFor([off, on], ids, { corpus: { source: 'operator-store', documents: 226, nodes: 900, edges: 1200, seed: 'random' } })).ok,
      "§3.4: the seed is the RECORDED constant 'o0-2026-09-17', never a random value").toBe(false)
  })

  // -------------------------------------------------------------------------
  // §8.1 census — the artifact's own row counts.
  // -------------------------------------------------------------------------
  it('O0.16 [§8.1] the artifact census is reconciled from the report: 6 runs and 4 controls in a full 4-block artifact', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const ids6 = ['o0-folder-row-gpuoff-r1', 'o0-document-row-gpuoff-r1', 'o0-folder-row-gpuon-r1', 'o0-document-row-gpuon-r1', 'o0-fold-ablation-off', 'o0-fold-ablation-on']
    const runs = ids6.map((id, i) => runFor(ids, { id, gesture: i % 2 === 0 ? 'folder-row' : 'document-row' }))
    const c = api.reconcileO0Census(runs)
    expect(c.runCount, '§8.1: 6 runs[] rows in a full 4-block artifact').toBe(6)
    expect(c.controlCount, '§8.1: 4 controls[] rows (gpu-on, gpu-off, track-ablation-on, track-ablation-off)').toBe(4)
    expect(c.runsPerStage.length, '§2.2: every stage id appears in EVERY freeze row').toBe(11)
    expect(c.runsPerStage.every((r: { count: number }) => r.count === runs.length), '§2.2: a stage is never omitted (§5 F4)').toBe(true)
  })
})

// ===========================================================================
// FAIL-STATES F1..F5 (the pure-module half; F6 is driver-only — see the driver
// contract file — and F7..F10 have their own `it`s above).
// ===========================================================================
describe('O-0 §6 fail-states F1..F5 — every forcing condition is loud (§4.3: pass:false + a failReasons line)', () => {
  it('F1 [§4.3/§6] stage id absent or stageCount ≠ 11 → pass:false + the missing id named (never a silent skip)', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const missingOne = runFor(ids, { stages: stagesFor(ids).filter((s) => s.id !== 'shared.decorate') })
    const r1 = BAD_RUN('F1: a dropped stage entry', api, { ...missingOne, pass: false }, 'shared.decorate')
    expect(JSON.stringify(r1.errors), 'F1: the reason shape names the stage, the run id and the stageCount').toMatch(/stageCount|11/)
    BAD_RUN('F1: a wrong stageCount', api, runFor(ids, { stageCount: 10, pass: false }), 'stageCount')
    BAD_RUN('F1: an unknown extra stage id', api, runFor(ids, { stages: [...stagesFor(ids), { id: 'not.a.stage', ms: 1, unseparated: false, source: 'mark' }], pass: false }), 'not.a.stage')
    BAD_RUN('F1: a duplicated stage id', api, runFor(ids, { stages: [...stagesFor(ids), { id: 'render.dom', ms: 1, unseparated: false, source: 'mark' }], pass: false }), 'render.dom')
  })

  it('F3 [§4.3/§6] NaN / negative / string stage ms or counter → pass:false, raw value printed unformatted', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const bad = (ms: unknown) => runFor(ids, { stages: ids.map((id) => ({ id, ms: id === 'render.dom' ? (ms as number) : 1, unseparated: false, source: 'mark' })), pass: false })
    for (const v of [NaN, -1, '12' as unknown as number, -0.5]) {
      const r = BAD_RUN(`F3: stages[render.dom].ms = ${String(v)}`, api, bad(v), 'render.dom')
      expect(JSON.stringify(r.errors), `F3: the raw value ${String(v)} must appear unformatted`).toContain(String(v))
    }
    for (const [field, value] of [['longTaskTotalMs', NaN], ['longTaskTotalMs', -1], ['mutations', -1], ['wallMs', 'fast'], ['mutations', '39']] as const) {
      BAD_RUN(`F3: ${field} = ${String(value)}`, api, runFor(ids, { [field]: value as never, pass: false }), field)
    }
    OK_RUN('F3 control: null counters are allowed (an explicit unmeasured value, never a fabricated 0)', api, runFor(ids, { mutations: null, wallMs: null, longTaskTotalMs: 878 }))
  })

  it('F4 [§6] an unseparated stage is NOT a schema error (ms:null + unseparated:true) but an IMPUTED ms on one forces pass:false', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const unsep = runFor(ids, { stages: ids.map((id) => ({ id, ms: id === 'snapshot.clone' ? null : 1, unseparated: id === 'snapshot.clone', source: 'mark' })) })
    OK_RUN('F4: null+unseparated is the DOCUMENTED form, not an error', api, unsep)
    expect(api.unseparatedStageIds(unsep), 'F4: the run reports unseparatedStages[]').toEqual(['snapshot.clone'])
    BAD_RUN('F4: an imputed ms on an unseparated stage', api, runFor(ids, { stages: ids.map((id) => ({ id, ms: 1, unseparated: id === 'snapshot.clone', source: 'mark' })), pass: false }), 'snapshot.clone')
    BAD_RUN('F4: an unseparated stage with a non-null ms and no flag is an imputation', api, runFor(ids, { stages: ids.map((id) => ({ id, ms: id === 'render.ssr' ? 8 : 1, unseparated: false, source: 'derived' })) }), 'source')
  })

  it('F5 [§2.4/§6] an unavailable track ablation is a documented fail-state: applied:false + mutation:null + pass:false', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const na = runFor(ids, {
      id: 'o0-fold-ablation-na', block: 'o0_track_ablation',
      trackAblation: { applied: false, mutation: null }, pass: false,
      failReasons: ['track ablation unavailable: the stage cell is not a grid item in the executing bundle (#wiki-root computed display=grid)'],
    })
    const r = api.validateO0Run(na)
    expect(r.ok, 'F5: the row is a legitimate (failing) measurement, not a schema error').toBe(true)
    expect(r.failReasons, 'F5: the unavailability must be recorded').toBeTruthy()
    // An `applied:true` with no recorded mutation is an unverifiable ablation.
    BAD_RUN('F5: applied:true with mutation:null cannot be verified', api, runFor(ids, { trackAblation: { applied: true, mutation: null }, pass: false }), 'mutation')
  })
})

// ===========================================================================
// §3a ADVERSARIAL REGRESSION SET (RCA-3) — host findings on
//      src/shared/o0-report.ts, pinned by the post-green adversarial pass on
//      unit O-0. One `it` per finding, each naming the defect site (file:line)
//      and the exact counterexample shape. These are RED until the Implementer
//      applies the finding's fix shape; they are ADDITIVE (no existing row,
//      no existing assertion is weakened, deleted or re-numbered).
// ===========================================================================
describe('O-0 §3a adversarial regression (RCA-3 host findings on src/shared/o0-report.ts)', () => {
  // ---------------------------------------------------------------------------
  // R1 — WITHDRAWN (architect's ruling **R-1**, spec §7 row 1: the adversarial
  // finding 1 is **REJECTED BY COUNTER-EVIDENCE** and "must not be re-pinned").
  // The rejected claim was: `validateO0Run` accepting a `pass:false` row that
  // carries a genuine `failReasons` line is a defect. It is NOT: such a row is a
  // legitimate FAILING MEASUREMENT (§4.3), and requiring `ok:false` there would
  // destroy the distinction between "the measurement failed" and "the report is
  // malformed". The surviving row `F5` (`:594`-ish, ablation unavailable ⇒
  // `ok:true`) states the correct contract and STANDS. The real defect class is
  // the INVERTED shape, pinned in its place below.
  // ---------------------------------------------------------------------------
  it('R1-WITHDRAWN [§4.3/§7 row 1 — finding 1 REJECTED by counter-evidence, R-1] a pass:false row with GENUINE failReasons is schema-VALID; pass:false with an EMPTY failReasons is not', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    // (a) the CORRECT contract (what `F5` states): a row that declares itself
    // failed and names why is a legitimate failing measurement, never a schema
    // error — the row-level verdict propagates to the report (§4.3, R-1).
    const failing = runFor(ids, {
      pass: false,
      failReasons: ['stage traversal.build ms 1768.7 exceeds the freeze it belongs to (110 ms + 40 ms tolerance) — §4.3/F13a'],
      hook: { armWindow: { t0: 1000, t1: 1110, ms: 110 }, freezeWindow: { t0: 1000, t1: 1110 } },
    })
    const okRow = api.validateO0Run(failing)
    expect(
      okRow.ok,
      'a pass:false row carrying a GENUINE failReasons line must validate ok:true — it is a FAILING MEASUREMENT, not a malformed report (§4.3, the architect ruling R-1 recorded in §7 row 1). ' +
        `errors=${JSON.stringify(okRow.errors)}`,
    ).toBe(true)
    // (b) the real defect class — the INVERTED shape (a row that declares failure
    // and names nothing) — is already caught and stays caught.
    const mute = api.validateO0Run(runFor(ids, { pass: false, failReasons: [] }))
    expect(mute.ok, 'a pass:false row with an EMPTY failReasons IS a schema error (§4.3 fail-loud)').toBe(false)
    expect(JSON.stringify(mute.failReasons), 'the reason must name the missing failReasons line').toMatch(/failReasons|pass:false/i)
    // (c) and the row-level verdict still propagates to the REPORT (§4.3/R-1:
    // `o0DeriveReportPass` pushes every row's reasons into `driver.failReasons`,
    // and the report-level validator propagates the row's own failing verdict).
    const rep = api.validateO0Report(reportFor([failing], ids, { controls: [], pass: false }))
    expect(rep.ok, 'a report containing a FAILING measurement row cannot itself be ok (§4.3)').toBe(false)
    expect(JSON.stringify(rep.failReasons), 'the report-level reason must name the failing RUN (its verdict propagates, never absorbed)').toContain(failing.id)
  })

  it('R2 [§3a finding 2 / §7 row 6 — src/shared/o0-report.ts:202-218] a `stages[]` entry the row cannot use is NAMED BY ITS INDEX — the row is already ok:false, so the pin is the INDEX, not the ok value', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    // The value loop skips a non-object entry before the id check and the ids are
    // String()-coerced, so the row's shape was reported through a coerced
    // ('undefined') stage id rather than the entry's own index — the reader cannot
    // construct the §4.4 falsifiability counterexample ("delete one stages[]
    // entry") from the reason. NOTE (the reviewer's re-pin): a null entry already
    // makes the row ok:false for ANOTHER reason, so asserting `ok` here proves
    // nothing; the pinned observable is the INDEX NAMING.
    const withNull = runFor(ids, { stages: [...stagesFor(ids), null] as unknown as O0StageShape[], stageCount: 11 })
    const r = api.validateO0Run(withNull)
    expect(r.ok, 'the null entry is already rejected (not the pin) — the pin below is the INDEX NAMING').toBe(false)
    expect(
      JSON.stringify(r.errors),
      'the offending entry must be named by its INDEX (stages[11]) — the reader must be able to point at the entry §4.4 requires as the counterexample',
    ).toMatch(/stages\[11\]/)
    expect(JSON.stringify(r.errors), 'the reason must not route the entry through a coerced stage id (§7 row 6)').not.toMatch(/stage undefined/)
    // The same for an entry that is an object but carries no id at all: today the
    // reason reads `stage undefined ms is 1 …` — the phantom id the fix removes.
    const idless = runFor(ids, {
      stages: [...stagesFor(ids), { ms: 1, unseparated: false, source: 'mark' }] as unknown as O0StageShape[],
      stageCount: 11,
    })
    const r2 = api.validateO0Run(idless)
    expect(r2.ok, 'an id-less stage entry must not leave the row valid').toBe(false)
    expect(JSON.stringify(r2.errors), 'the id-less entry must be named by its INDEX (stages[11])').toMatch(/stages\[11\]/)
    expect(
      JSON.stringify(r2.errors),
      "no `'undefined'` phantom stage id may reach the reason (String(s.id) on an id-less entry — §7 row 6/§6 F13)",
    ).not.toMatch(/stage undefined/)
  })

  it('R3 [finding 3 — src/shared/o0-report.ts:399-404] postStyle.ms === null ⇒ postStyle.unseparated === true; Σ(named) > total with all stages separated ⇒ ok:false AND postStyle.unseparated === true', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const TOL = 50
    // (b) Σ(named) > longTaskTotalMs with EVERY stage separated (negative residual).
    const over = ids.map((id) => ({ id, ms: id === 'post.style' ? 0 : 999, unseparated: false, source: (id === 'post.style' ? 'derived' : 'mark') as 'derived' | 'mark' }))
    const r = api.reconcileO0PostStyle(runFor(ids, { stages: over, longTaskTotalMs: 100 }), { reconcileMs: TOL, source: 'measured 2026-09-17' })
    expect(r.ok, 'a negative residual is outside [0, tolerance] and must be ok:false').toBe(false)
    expect(
      r.postStyle.unseparated,
      'Σ(named) > total with every stage separated must make post.style UNSEPARATED — the driver twin puts post.style into unseparatedStages on exactly this branch (scripts/live-drive.mjs:879-890)',
    ).toBe(true)
    expect(r.postStyle.ms, 'post.style must not carry a value when it is not separated').toBe(null)
    // (c) the unreconciled case is explained by the RESIDUAL — not by a phantom
    // unseparated stage (no stage id other than the derived post.style may be claimed).
    expect(
      r.unseparatedStages.filter((id: string) => id !== 'post.style'),
      'the residual is the explanation: no real stage may be reported unseparated when all 11 were separated',
    ).toEqual([])
    expect(JSON.stringify(r.failReasons), 'the ok:false reason must NAME the residual (§5 P-TP-1)').toMatch(/residual/i)
    // (a) the COUPLING, on the other unreconciled branch (a non-finite total).
    const noTotal = api.reconcileO0PostStyle(runFor(ids, { longTaskTotalMs: -1 }), { reconcileMs: TOL, source: 'measured 2026-09-17' })
    expect(noTotal.postStyle.ms, 'a null residual yields postStyle.ms null').toBe(null)
    expect(noTotal.postStyle.unseparated, 'postStyle.ms === null ⇒ postStyle.unseparated === true (the exact shape the validator rejects)').toBe(true)
  })

  it('R4 [finding 4 — src/shared/o0-report.ts:285-297 / :121-125 / :472-502] a duplicated id in EITHER run makes the set comparison false, and a non-string id never reaches unseparatedStageIds or the derived verdicts', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const a = runFor(ids)
    // (a) run B = the 11 ids PLUS a duplicate (stageCount 12): the comparator
    // de-dupes, so equal:true hides a stage-set divergence.
    const dup = runFor(ids, {
      stages: [...stagesFor(ids), { id: 'render.dom', ms: 0, unseparated: false, source: 'mark' }],
      stageCount: 12,
    })
    expect(
      api.compareO0StageIdSets(a, dup).equal,
      'run B carries render.dom TWICE and still compares equal:true — the stage-id SET comparator de-dupes both sides (a duplicate id is a set violation, §4.3/F1)',
    ).toBe(false)
    expect(api.compareO0StageIdSets(dup, a).equal, 'the comparator must be symmetric on a duplicated id').toBe(false)
    // (b) an entry with a missing id: String(undefined) leaks into the report as a
    // stage id ('undefined') and into the derived verdict as the "largest stage".
    const idless = runFor(ids, {
      stages: [...stagesFor(ids).slice(0, 10), { ms: null, unseparated: true, source: 'mark' }] as unknown as O0StageShape[],
    })
    const unsep = api.unseparatedStageIds(idless)
    expect(unsep, "unseparatedStageIds emitted the STRING 'undefined' (String(s.id) on an id-less entry)").not.toContain('undefined')
    expect(unsep.filter((id: string) => !ids.includes(id)), 'every reported unseparated id must be a real §2.2 stage id').toEqual([])
    const withIdless = runFor(ids, {
      stages: [...stagesFor(ids).map((s) => ({ ...s, ms: s.id === 'render.dom' ? 12 : 10 })), { ms: 999, unseparated: false, source: 'mark' }] as unknown as O0StageShape[],
    })
    const v = api.deriveO0StageVerdict(withIdless)
    expect(v.largestStageId, 'the id-less entry (ms 999) must never be picked as an identified stage').toBe('render.dom')
    expect(v.verdict, 'the derived verdict must not name `undefined` as a stage id').not.toMatch(/undefined/)
  })
})

// ===========================================================================
// §5 — THE TYPED PROPERTY REGISTER. The register is **8 rows** (§5/§8.1):
//      P-IM-1, P-IM-2, P-SM-1, P-SM-2, P-TP-1, P-TP-2 + the new **P-TP-3**
//      (window-boundedness, H3) here, and P-HK-1 in
//      tests/unit-o-0-hook-contract.test.ts. Budget `60×6 + 40 + 50 = 470`
//      attempts (≤100/row, ≤800 at the ceiling), stop-after-5, each row
//      reporting held/broken + its strategy id.
//
// §3a generator additions (RCA-3 findings 6-11): the ROW invariants below are
// unchanged; each row gains DRAW MODES so the generator actually covers the
// states the row text names ("every stage ms AND every counter"). A mode that
// exposes a real defect is reported as a BROKEN row with its counterexample.
// ===========================================================================
describe('O-0 §5 property register (the 8-row register; this file 7 rows, seeded, ≤100 attempts/row, stop-after-5)', () => {
  it('P-IM-1 [strat:o0-stage-values] every stage ms and counter is a non-negative finite number, or an explicit null with unseparated:true', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const VALUES: unknown[] = [null, 0, 0.1, 1, 1e3, 1e6, NaN, -1, '12']
    // §3a finding 6 — the row text pins "every stage ms AND every counter", but every
    // draw only perturbed a stage value. Mode list (indexed by the attempt, so all
    // modes run inside the 60-attempt budget):
    //   0 stage-value (the original draw)  1 longTaskTotalMs=NaN   2 longTaskTotalMs=-1
    //   3 longTaskTotalMs='878'            4 longTaskTotalMs=null  5 mutations=NaN
    //   6 mutations=-1                     7 mutations='39'        8 wallMs absent
    //   9 stage ms=Infinity               10 stage ms=null + unseparated:true (LEGAL)
    const MODE_COUNT = 11
    const rep = runProperty('P-IM-1', 'strat:o0-stage-values', (i, rng) => {
      const mode = i % MODE_COUNT
      let run: O0RunShape
      let legal: boolean
      let named: string | null = null
      let detail = ''
      if (mode === 0) {
        const idx = int(rng, 0, ids.length - 1)
        const v = VALUES[int(rng, 0, VALUES.length - 1)]
        const unsep = rng() < 0.5
        run = runFor(ids, {
          stages: ids.map((id, k) => ({
            id, ms: k === idx ? (v as number) : int(rng, 0, 500),
            unseparated: k === idx ? unsep : false,
            source: 'mark',
          })),
          pass: true,
        })
        legal = (v === null && unsep) || (typeof v === 'number' && Number.isFinite(v) && v >= 0)
        named = legal ? null : ids[idx]
        detail = `stage=${ids[idx]} value=${String(v)} unseparated=${unsep}`
      } else if (mode === 1) {
        run = runFor(ids, { longTaskTotalMs: NaN }); legal = false; named = 'longTaskTotalMs'; detail = 'longTaskTotalMs=NaN'
      } else if (mode === 2) {
        run = runFor(ids, { longTaskTotalMs: -1 }); legal = false; named = 'longTaskTotalMs'; detail = 'longTaskTotalMs=-1'
      } else if (mode === 3) {
        run = runFor(ids, { longTaskTotalMs: '878' as unknown as number }); legal = false; named = 'longTaskTotalMs'; detail = "longTaskTotalMs='878'"
      } else if (mode === 4) {
        // §4.4 — `deriveO0Verdicts` treats a null longTaskTotalMs as a MISSING required
        // field (`O-0 REPORT INVALID: longTaskTotalMs missing` + pass:false), so the row
        // validator cannot accept it as a legal MEASUREMENT total. (The §4.3 `or null`
        // form stays legal for the counters the F3 null-control covers — mutations/wallMs.)
        run = runFor(ids, { longTaskTotalMs: null }); legal = false; named = 'longTaskTotalMs'; detail = 'longTaskTotalMs=null'
      } else if (mode === 5) {
        run = runFor(ids, { mutations: NaN }); legal = false; named = 'mutations'; detail = 'mutations=NaN'
      } else if (mode === 6) {
        run = runFor(ids, { mutations: -1 }); legal = false; named = 'mutations'; detail = 'mutations=-1'
      } else if (mode === 7) {
        run = runFor(ids, { mutations: '39' as unknown as number }); legal = false; named = 'mutations'; detail = "mutations='39'"
      } else if (mode === 8) {
        run = runFor(ids, { wallMs: undefined }); legal = false; named = 'wallMs'; detail = 'wallMs absent'
      } else if (mode === 9) {
        run = runFor(ids, {
          stages: ids.map((id) => ({ id, ms: id === 'envelope.assemble' ? Infinity : 1, unseparated: false, source: 'mark' })),
          pass: true,
        })
        legal = false; named = 'envelope.assemble'; detail = 'stages[envelope.assemble].ms=Infinity'
      } else {
        // The LEGAL explicit-unmeasured form: ms:null WITH unseparated:true (§6 F4).
        run = runFor(ids, {
          stages: ids.map((id) => ({ id, ms: id === 'render.ssr' ? null : 1, unseparated: id === 'render.ssr', source: 'mark' })),
          pass: true,
        })
        legal = true; detail = 'stages[render.ssr]={ms:null,unseparated:true}'
      }
      const r = api.validateO0Run(run)
      // The oracle: ok:false IFF the value is not (≥0 finite) AND not (null ∧ unseparated).
      if (r.ok !== legal) {
        return `mode=${mode} ${detail} → ok=${r.ok} (expected ${legal}); errors=${JSON.stringify(r.errors)}`
      }
      if (!legal) {
        if (!(Array.isArray(r.failReasons) && r.failReasons.length > 0)) return `mode=${mode} ${detail}: an illegal value produced no failReasons line`
        if (named !== null && !JSON.stringify(r.errors).includes(named)) {
          return `mode=${mode} ${detail}: the malformed field '${named}' is not NAMED with its field path: ${JSON.stringify(r.errors)}`
        }
      }
      return null
    })
    assertHeld(rep)
  })

  it('P-IM-2 [strat:o0-stage-set] the stage set is TOTAL: exactly the 11 ids, each once, stageCount 11 — and the controls[] set is total too', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const rep = runProperty('P-IM-2', 'strat:o0-stage-set', (i, rng) => {
      // §3a finding 7 — the generator had no draw where `missing` and `extra` are BOTH
      // non-empty (duplicate + removal), and no reversed-order legal row. Modes 0..13 keep
      // their original meaning; 14/15 are the additions (modulus widened 14 → 16).
      const mode = i % (ids.length + 5)
      let run = runFor(ids)
      if (mode < ids.length) run = runFor(ids, { stages: stagesFor(ids).filter((s) => s.id !== ids[mode]), pass: true })
      else if (mode === ids.length) run = runFor(ids, { stages: [...stagesFor(ids), { id: ids[int(rng, 0, 10)], ms: 1, unseparated: false, source: 'mark' }], pass: true })
      else if (mode === ids.length + 1) run = runFor(ids, { stages: [...stagesFor(ids).slice(0, 10), { id: 'unknown.stage', ms: 1, unseparated: false, source: 'mark' }], pass: true })
      else if (mode === ids.length + 3) {
        // A duplication PLUS a removal in the same row: `missing` and `extra` are both
        // non-empty, and BOTH must be named (§6 F1 "never a silent skip").
        const dropped = ids[int(rng, 0, ids.length - 1)]
        const dup = ids[(ids.indexOf(dropped) + 1) % ids.length]
        run = runFor(ids, {
          stages: [...stagesFor(ids).filter((s) => s.id !== dropped), { id: dup, ms: 1, unseparated: false, source: 'mark' }],
          pass: true,
        })
      } else if (mode === ids.length + 4) {
        // A reversed-order LEGAL row: the stage SET is a set, so order must not matter.
        run = runFor(ids, { stages: [...stagesFor(ids)].reverse(), pass: true })
      }
      if (mode === ids.length + 2) {
        // A comparison run emitted without its paired control row (F9 / the totality rule).
        const a = runFor(ids, { id: 'o0-folder-row-gpuoff-r1', gpu: false })
        const b = runFor(ids, { id: 'o0-folder-row-gpuon-r1', gpu: true })
        const v = api.validateO0Reports([a, b], { controls: [{ id: 'gpu-on', runRef: b.id, pairedWith: a.id }], tolerance: { reconcileMs: 50, source: 'measured 2026-09-17' }, ids })
        if (v.ok) return 'an unpaired comparison run (gpu-on without gpu-off) validated ok:true'
        if (!(Array.isArray(v.failReasons) && v.failReasons.length > 0)) return 'an unpaired control produced no failReasons line'
        return null
      }
      const r = api.validateO0Run(run)
      const rowIds = run.stages.map((s) => s.id)
      const missing = ids.filter((id) => !rowIds.includes(id))
      const extra = [...new Set(rowIds.filter((id) => !ids.includes(id) || rowIds.filter((x) => x === id).length > 1))]
      const legal = missing.length === 0 && extra.length === 0 && run.stageCount === 11
      if (r.ok !== legal) return `mode=${mode} missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)} stageCount=${run.stageCount} → ok=${r.ok} (expected ${legal})`
      if (!legal && !(Array.isArray(r.failReasons) && r.failReasons.length > 0)) return `mode=${mode}: a non-total stage set produced no failReasons line`
      // Every divergence must be NAMED (both the missing and the extra/duplicated id).
      for (const id of [...missing, ...extra]) {
        if (!JSON.stringify(r.errors).includes(id)) return `mode=${mode}: the divergent stage id '${id}' is not named: ${JSON.stringify(r.errors)}`
      }
      return null
    })
    assertHeld(rep)
  })

  it('P-SM-1 [strat:o0-census] the census fields agree with the observed corpus: a perturbed field forces pass:false naming that field', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const OBSERVED = { documents: 226, nodes: 900, edges: 1200 }
    // §3a finding 8 — the generator only perturbed ONE field of a COMPLETE triplet, so a
    // partial object (a MISSING field on both sides) compared "equal" and validated ok:true.
    // Modes: 0 perturbed ±1 (the original) | 1 partial on BOTH sides | 2 nodes:null |
    //        3 string number | 4 absent field on the recorded side | 5 claimedDocuments mismatch.
    const MODES = 6
    const rep = runProperty('P-SM-1', 'strat:o0-census', (i, rng) => {
      const mode = i % MODES
      let recorded: Record<string, unknown> = { ...OBSERVED }
      let observed: Record<string, unknown> = { ...OBSERVED }
      let claimed: unknown = OBSERVED.documents
      let named: RegExp = /documents/
      let legal: boolean
      if (mode === 0) {
        const field = ['documents', 'nodes', 'edges'][int(rng, 0, 2)] as 'documents' | 'nodes' | 'edges'
        const perturb = rng() < 0.5 ? -1 : 1
        const same = rng() < 0.25 // one in four draws keeps the value identical
        recorded = { ...OBSERVED, [field]: same ? OBSERVED[field] : OBSERVED[field] + perturb }
        named = new RegExp(field)
        legal = recorded.documents === OBSERVED.documents && recorded.nodes === OBSERVED.nodes && recorded.edges === OBSERVED.edges
      } else if (mode === 1) {
        recorded = { documents: 226 }; observed = { documents: 226 }; legal = false; named = /nodes|edges/
      } else if (mode === 2) {
        recorded = { documents: 226, nodes: null, edges: 1200 }; legal = false; named = /nodes/
      } else if (mode === 3) {
        recorded = { documents: '226', nodes: 900, edges: 1200 }; legal = false; named = /documents/
      } else if (mode === 4) {
        recorded = { documents: 226, edges: 1200 }; legal = false; named = /nodes/
      } else {
        // §6 F8 — the claimedDocuments path (the `--o0-corpus` claim vs the observation).
        recorded = { documents: 2, nodes: 3, edges: 1 }; observed = { documents: 2, nodes: 3, edges: 1 }
        claimed = 226; legal = false; named = /document/i
      }
      const v = api.validateO0Census(recorded, observed, claimed)
      if (v.ok !== legal) return `mode=${mode} recorded=${JSON.stringify(recorded)} observed=${JSON.stringify(observed)} claimed=${String(claimed)} → ok=${v.ok} (expected ${legal}); errors=${JSON.stringify(v.errors)}`
      if (!legal && !named.test(JSON.stringify(v.failReasons))) return `mode=${mode}: the offending/missing field is not named: ${JSON.stringify(v.failReasons)}`
      if (!legal && !(Array.isArray(v.failReasons) && v.failReasons.length > 0)) return `mode=${mode}: a census disagreement produced no failReasons line`
      if (legal && v.recomputed && (v.recomputed.documents !== observed.documents || v.recomputed.nodes !== observed.nodes || v.recomputed.edges !== observed.edges)) {
        return `recomputed census drifted from the frozen payload fixture: ${JSON.stringify(v.recomputed)}`
      }
      return null
    })
    assertHeld(rep)
    // The state-machine half (§6 S2/S3) is a census gate, not a schema error.
    expect(api.deriveO0CensusVerdict({ documents: 2, nodes: 3, edges: 1 }, 226).pass, 'S2 (2 docs) can never pass').toBe(false)
    expect(api.deriveO0CensusVerdict({ documents: 226, nodes: 3, edges: 1 }, 226).pass, 'S3 (226 docs) passes').toBe(true)
  })

  it('P-SM-2 [strat:o0-determinism] the stage-id SET is deterministic; the ms values are FREE under the pinned seed', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const rep = runProperty('P-SM-2', 'strat:o0-determinism', (_i, rng) => {
      const scramble = () => ids.map((id) => ({ id, ms: int(rng, 1, 900), unseparated: false, source: 'mark' as const }))
      // §3a finding 9 — the generator never drew a DUPLICATE id, an unknown extra id, or an
      // all-zero row, so the set oracle was never exercised against a multiset divergence.
      // Modes: 0 identical sets / free ms | 1 reversed order | 2 one id dropped |
      //        3 B = the 11 ids + a DUPLICATE (ms 0) | 4 B carries an extra unknown id |
      //        5 ms exactly 0 in both runs (a legal, zero-valued re-run).
      const mode = int(rng, 0, 5)
      const zero = () => ids.map((id) => ({ id, ms: 0, unseparated: false, source: 'mark' as const }))
      let a = runFor(ids, { id: 'o0-repeat-a', stages: mode === 5 ? zero() : scramble(), longTaskTotalMs: 878 })
      let b = runFor(ids, { id: 'o0-repeat-b', stages: mode === 5 ? zero() : scramble(), longTaskTotalMs: mode === 5 ? 0 : 1200 })
      if (mode === 1) b = runFor(ids, { id: 'o0-repeat-b', stages: [...scramble()].reverse(), longTaskTotalMs: 1200 })
      if (mode === 2) {
        // The mode-2 row's ONE pinned difference is a SINGLE absent stage id.
        // The draw MUST happen exactly once, BEFORE the filter: drawing inside the
        // predicate re-draws for EVERY element (mulberry32 advances per call), so
        // on some seeds nothing was removed (an 11-stage row isomorphic to mode 0)
        // or several ids were removed — the row then no longer exercised the set
        // oracle at all. The ROW was well-formed; the GENERATOR was buggy.
        const dropped = ids[int(rng, 0, ids.length - 1)]
        const thinned = scramble().filter((s) => s.id !== dropped)
        if (thinned.length !== ids.length - 1 || !ids.includes(dropped)) {
          return `GENERATOR BUG: mode 2 must drop exactly one id (drew ${dropped}; ${ids.length} → ${thinned.length} stages)`
        }
        b = runFor(ids, { id: 'o0-repeat-b', stages: thinned, longTaskTotalMs: 1200 })
      }
      if (mode === 3) {
        const dup = ids[int(rng, 0, ids.length - 1)]
        b = runFor(ids, {
          id: 'o0-repeat-b',
          stages: [...scramble(), { id: dup, ms: 0, unseparated: false, source: 'mark' as const }],
          longTaskTotalMs: 1200,
        })
      }
      if (mode === 4) {
        b = runFor(ids, {
          id: 'o0-repeat-b',
          stages: [...scramble(), { id: 'not.a.stage', ms: 0, unseparated: false, source: 'mark' as const }],
          longTaskTotalMs: 1200,
        })
      }
      const expectSame = mode === 0 || mode === 1 || mode === 5
      const sameSet = JSON.stringify([...a.stages.map((s) => s.id)].sort()) === JSON.stringify([...b.stages.map((s) => s.id)].sort())
      const va = api.validateO0Run(a)
      const vb = api.validateO0Run(b)
      const oracleHolds = va.ok && vb.ok && sameSet
      const setEq = (() => {
        const s = api.compareO0StageIdSets(a, b)
        return s && typeof s.equal === 'boolean' ? s.equal : null
      })()
      if (setEq === null) return 'compareO0StageIdSets must return a boolean `equal` (the order-insensitive oracle)'
      if (setEq !== sameSet) {
        return `mode=${mode}: compareO0StageIdSets said equal=${setEq} for sameSet=${sameSet} (a duplicated/extra id must make the SET comparison false — the id SET must not be de-duped into agreement)`
      }
      if (expectSame && !(va.ok && vb.ok)) return `mode=${mode}: a re-run with identical ids + different ms/order must PASS (ms is free): errorsA=${JSON.stringify(va.errors)} errorsB=${JSON.stringify(vb.errors)}`
      if (!expectSame && vb.ok) return `mode=${mode}: a set-divergent/duplicated re-run validated ok:true (the set oracle must catch it)`
      if (oracleHolds !== expectSame) return `mode=${mode}: determinism oracle held=${oracleHolds} (expected ${expectSame})`
      return null
    })
    assertHeld(rep)
  })

  it('P-TP-1 [strat:o0-reconcile] the post.style residual is COMPUTED and any unseparated stage makes the reconciliation ok:false', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const TOL = 50
    // §3a finding 10 — added modes: the band edge (residual === tolerance), tolerance 0,
    // a NON-NUMERIC tolerance, a SEPARATED stage carrying ms:null (silently summed as 0),
    // and Σ(named) > total with every stage separated (the post.style/unseparated coupling).
    // Modes 0..4 keep their original meaning; 5..10 are the additions.
    const rep = runProperty('P-TP-1', 'strat:o0-reconcile', (_i, rng) => {
      const mode = int(rng, 0, 10) // all-separated | one unseparated | sum > total | sum ≪ total |
      // negative residual | band edge | tol 0 / residual 0 | tol 0 / residual > 0 |
      // non-numeric tolerance | separated stage with ms:null | sum > total (all separated)
      const total = int(rng, 100, 2000)
      let stages: O0StageShape[]
      let rowTotal: number | null = total
      let tolerance: Record<string, unknown> = { reconcileMs: TOL, source: 'measured 2026-09-17' }
      let expectOk: boolean
      let expectReason: RegExp | null = null
      let expectNamedStage: string | null = null
      if (mode <= 4) {
        const nSep = ids.length - 1
        const base = mode === 2 ? Math.ceil((total + int(rng, 1, 500)) / nSep) : mode === 3 ? 1 : Math.floor((total - TOL + int(rng, 1, TOL)) / nSep)
        stages = ids.map((id, k) => {
          if (mode === 1 && k === ids.length - 1) return { id, ms: ids[k] === 'post.style' ? 0 : 0, unseparated: true, source: 'mark' as const }
          return { id, ms: id === 'post.style' ? 0 : Math.max(0, base), unseparated: false, source: 'derived' as const }
        })
        rowTotal = mode === 4 ? -1 : total
        const sum = stages.filter((s) => !s.unseparated).reduce((acc, s) => acc + (s.ms ?? 0), 0)
        const residual = (rowTotal as number) - sum
        expectOk = mode !== 1 && mode !== 4 && residual >= 0 && residual <= TOL
      } else if (mode === 5) {
        // The band EDGE, inclusive: total 150, Σ 100 → residual === tolerance (50).
        stages = ids.map((id) => ({ id, ms: id === 'post.style' ? 0 : 10, unseparated: false, source: 'mark' as const }))
        rowTotal = 150
        expectOk = true
      } else if (mode === 6) {
        // tolerance 0 with a residual of exactly 0 is still inside the band.
        stages = ids.map((id) => ({ id, ms: id === 'post.style' ? 0 : 9, unseparated: false, source: 'mark' as const }))
        rowTotal = 90
        tolerance = { reconcileMs: 0, source: 'measured 2026-09-17' }
        expectOk = true
      } else if (mode === 7) {
        // tolerance 0 with ANY positive residual is outside the band and NAMES the residual.
        stages = ids.map((id) => ({ id, ms: id === 'post.style' ? 0 : 9, unseparated: false, source: 'mark' as const }))
        rowTotal = 100
        tolerance = { reconcileMs: 0, source: 'measured 2026-09-17' }
        expectOk = false
        expectReason = /residual/i
      } else if (mode === 8) {
        // A NON-NUMERIC tolerance cannot be assumed: §6's throw pattern pins "a malformed
        // row is an ok:false with the field path named" (never a silent tolerance of 0).
        stages = ids.map((id) => ({ id, ms: id === 'post.style' ? 0 : 9, unseparated: false, source: 'mark' as const }))
        rowTotal = 90
        tolerance = { reconcileMs: '50', source: 'measured 2026-09-17' }
        expectOk = false
        expectReason = /tolerance|reconcileMs/i
      } else if (mode === 9) {
        // A SEPARATED stage carrying ms:null: summing it as 0 absorbs its time into the
        // residual — an imputation, not a reconciliation (§6 F4's ban, §5 P-TP-1).
        stages = ids.map((id) => ({ id, ms: id === 'envelope.assemble' ? (null as unknown as number) : id === 'post.style' ? 0 : 10, unseparated: false, source: 'mark' as const }))
        rowTotal = 100
        expectOk = false
        expectNamedStage = 'envelope.assemble'
      } else {
        // Σ(named) > total with EVERY stage separated (negative residual).
        stages = ids.map((id) => ({ id, ms: id === 'post.style' ? 0 : 999, unseparated: false, source: 'mark' as const }))
        rowTotal = 100
        expectOk = false
        expectReason = /residual/i
      }
      const run = runFor(ids, { stages, longTaskTotalMs: rowTotal as number })
      const r = api.reconcileO0PostStyle(run, tolerance)
      const named = stages.filter((s) => s.unseparated).map((s) => s.id)
      if (mode === 1 && (r.ok || !JSON.stringify(r.failReasons).match(/unseparated/))) {
        return `an unseparated stage (${named.join(',')}) did not make the reconciliation fail: ok=${r.ok} reasons=${JSON.stringify(r.failReasons)}`
      }
      if (r.ok !== expectOk) return `mode=${mode} total=${String(rowTotal)} stages=${JSON.stringify(stages.map((s) => s.ms))} → ok=${r.ok} (expected ${expectOk}); reasons=${JSON.stringify(r.failReasons)}`
      if (!r.ok && !(Array.isArray(r.failReasons) && r.failReasons.length > 0)) return `mode=${mode}: ok:false with no failReasons line`
      if (expectReason && !expectReason.test(JSON.stringify(r.failReasons))) {
        return `mode=${mode}: the reason does not name the offending field (${String(expectReason)}): ${JSON.stringify(r.failReasons)}`
      }
      if (expectNamedStage && !JSON.stringify(r.failReasons).includes(expectNamedStage)) {
        return `mode=${mode}: a separated stage with a non-numeric ms must be NAMED: ${JSON.stringify(r.failReasons)}`
      }
      // §3a finding 3(a) — THE COUPLING, over every draw: the derived post.style may not
      // be emitted `ms:null` with `unseparated:false` (the shape the §4.3 validator rejects,
      // and the branch on which the driver twin puts post.style into unseparatedStages).
      if (r.postStyle.ms === null && r.postStyle.unseparated !== true) {
        return `mode=${mode}: postStyle={ms:null, unseparated:${String(r.postStyle.unseparated)}} — a null post.style residual is NOT a separated stage (residual=${String(r.residual)}, tolerance=${String(r.toleranceMs)})`
      }
      if (r.postStyle !== undefined && r.postStyle !== null && mode !== 1) {
        if (typeof r.postStyle.ms === 'number' && r.postStyle.ms < 0) return `the derived post.style residual is negative: ${r.postStyle.ms}`
        if (r.postStyle.timed === true || r.postStyle.source === 'mark') return 'post.style must be DERIVED (never a timed probe — §2.2 stage 11)'
      }
      return null
    })
    assertHeld(rep)
  })

  it('P-TP-2 [strat:o0-gesture-path] pass ⇒ (path === \'cdp\' ∧ realInput === true); every non-cdp path fails and NAMES the path', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const PATHS = ['cdp', 'native-fallback', 'missing', 'zero-box', 'off-viewport'] as const
    // §3a finding 11 — the generator only drew KNOWN path strings and boolean realInput,
    // so the malformed-path / malformed-realInput fail-states were never exercised.
    // Modes: 0 the original draw | 1 path undefined | 2 path 0 | 3 path null |
    //        4 realInput 'true' (string) | 5 path undefined + realInput 'true' (both malformed).
    const MODES = 6
    const rep = runProperty('P-TP-2', 'strat:o0-gesture-path', (i, rng) => {
      const mode = i % MODES
      let path: unknown = PATHS[int(rng, 0, PATHS.length - 1)]
      let realInput: unknown = mode === 4 ? 'true' : rng() < 0.5
      if (mode === 1) { path = undefined; realInput = false }
      if (mode === 2) { path = 0; realInput = false }
      if (mode === 3) { path = null; realInput = false }
      if (mode === 5) { path = undefined; realInput = 'true' }
      const run = runFor(ids, { path, realInput, pass: true } as unknown as Partial<O0RunShape>)
      const r = api.validateO0Run(run)
      const oracle = api.deriveO0GesturePath(path)
      if (oracle.realInput !== (path === 'cdp')) return `deriveO0GesturePath('${String(path)}').realInput=${oracle.realInput} (must be path === 'cdp')`
      if (oracle.pathRuleOk !== (path === 'cdp')) return `deriveO0GesturePath('${String(path)}').pathRuleOk=${oracle.pathRuleOk}`
      const legal = path === 'cdp' && realInput === true
      if (r.ok !== legal) {
        return `mode=${mode} path=${String(path)} realInput=${String(realInput)} → ok=${r.ok} (expected ${legal}); errors=${JSON.stringify(r.errors)}`
      }
      if (!legal) {
        if (!(Array.isArray(r.failReasons) && r.failReasons.length > 0)) return `mode=${mode}: no failReasons line`
        if (!JSON.stringify(r.failReasons).includes('path')) return `mode=${mode}: the malformed path is not NAMED in the reasons: ${JSON.stringify(r.failReasons)}`
        if (mode >= 4 && !JSON.stringify(r.failReasons).includes('realInput')) {
          return `mode=${mode}: a non-boolean realInput (${String(realInput)}) must be NAMED (§4.3: realInput is DERIVED from path === 'cdp'): ${JSON.stringify(r.failReasons)}`
        }
        if (typeof path === 'string' && !JSON.stringify(r.failReasons).includes(path)) {
          return `path=${path}: the path is not NAMED in the reasons: ${JSON.stringify(r.failReasons)}`
        }
        // The verdict is STILL emitted, naming the fallback (F7).
        const v = api.deriveO0StageVerdict(run)
        if (!v.ok) return `mode=${mode}: the derived verdict must still be emitted (§4.4/F7)`
        if (typeof path === 'string' && !String(v.verdict).includes(path)) return `mode=${mode}: the derived verdict must still name the path (§4.4/F7)`
      }
      return null
    })
    assertHeld(rep)
  })

  // -------------------------------------------------------------------------
  // §5 P-TP-3 — WINDOW-BOUNDEDNESS (the H3 re-derivation; 50 attempts, its own
  // constant, strategy id `strat:o0-window-bound`). This is the row whose
  // counterexample class is unique: "the arithmetic was internally consistent but
  // the measurement was taken over the wrong interval" (§5's P-TP-3 rationale).
  // -------------------------------------------------------------------------
  it('P-TP-3 [strat:o0-window-bound] WINDOW-BOUNDEDNESS: no separated stage exceeds total + tol, the armed window never widens the freeze, and no percentage is derived from a violated window (H3)', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const OFFENDER = 'traversal.build'
    // Generated values EXACTLY as §5's row text pins them:
    //   stage ms ∈ {0, tol, tol+0.1, total, total+1, total×20}
    //   longTaskTotalMs ∈ {0, 10, 110, 2283}; tolerance ∈ {0, 40}
    //   armWindow starting 5 / 50 / 250 ms BEFORE `o0:t0`, plus the equal-window pair
    // `i % 4` (not a random draw) guarantees all four arming deltas are exercised
    // inside the 50-attempt budget, including the legal equal-window pair.
    const TOTALS = [0, 10, 110, 2283]
    const ARM_BEFORE = [0, 5, 50, 250]
    const rep = runProperty(
      'P-TP-3',
      'strat:o0-window-bound',
      (i, rng) => {
        // RED-on-arrival guard: the pinned §5 P-TP-3 oracle does not exist yet, so
        // the row reports its counterexample instead of throwing away the attempts.
        if (typeof api.deriveO0WindowBound !== 'function') {
          return '§5 P-TP-3 pins the window-bound oracle `deriveO0WindowBound(run, opts)` — the module does not export it (the H3 rule is unimplemented)'
        }
        const total = TOTALS[int(rng, 0, TOTALS.length - 1)]
        const tol = [0, 40][int(rng, 0, 1)]
        const msChoices = [0, tol, tol + 0.1, total, total + 1, total * 20]
        const ms = msChoices[int(rng, 0, msChoices.length - 1)]
        const armBefore = ARM_BEFORE[i % ARM_BEFORE.length]
        const FREEZE_T0 = 1000
        const stages = ids.map((id) => ({
          id,
          ms: id === OFFENDER ? ms : 0,
          unseparated: false,
          source: (id === 'post.style' ? 'derived' : 'mark') as 'derived' | 'mark',
        }))
        const row = runFor(ids, {
          stages,
          longTaskTotalMs: total,
          pass: false,
          failReasons: [`window-bound candidate: ${OFFENDER} ms ${String(ms)} of total ${String(total)} + tol ${String(tol)}`],
          hook: {
            armed: true,
            // §4.3/P-TP-3(b) — the armed interval is RECORDED and judged against the
            // freeze interval (the recorded `o0:t0`/`o0:t1` marks). ADDITIVE field
            // pair pinned by this red set (see §0.2/§4.3: the spec names
            // `hook.armWindow` but no freeze-window field).
            armWindow: { t0: FREEZE_T0 - armBefore, t1: FREEZE_T0 + total, ms: total + armBefore },
            freezeWindow: { t0: FREEZE_T0, t1: FREEZE_T0 + total },
            armCount: 1,
            disarmCount: 1,
          },
        })
        const bound = total + tol
        const stageViolation = ms > bound
        const armViolation = armBefore > tol
        const expectViolated = stageViolation || armViolation
        const wb = api.deriveO0WindowBound(row, { hookToleranceMs: tol })
        const what = `total=${total} tol=${tol} ${OFFENDER}=${ms} armBefore=${armBefore} bound=${bound}`
        if (wb.violated !== expectViolated) {
          return `${what} → violated=${String(wb.violated)} (expected ${expectViolated}); reasons=${JSON.stringify(wb.failReasons)}`
        }
        if (expectViolated) {
          if (!(Array.isArray(wb.failReasons) && wb.failReasons.length > 0)) return `${what}: a violated window produced no failReasons line`
          const blob = JSON.stringify(wb.failReasons)
          // §5 P-TP-3: the reason carries BOTH the stage ms AND the total + tol bound.
          if (stageViolation && (!blob.includes(String(ms)) || !blob.includes(String(bound)))) {
            return `${what}: the reason must NAME BOTH numbers (the stage ms ${String(ms)} and the bound ${String(bound)}): ${blob}`
          }
          if (stageViolation) {
            const off = Array.isArray(wb.offenders) ? wb.offenders : []
            if (!off.some((o: any) => o && o.stageId === OFFENDER && o.ms === ms && o.boundMs === bound)) {
              return `${what}: offenders must carry {stageId, ms, boundMs} for the offending stage: ${JSON.stringify(off)}`
            }
          }
          // §4.4/P-TP-3(c): the percentage verdict is REFUSED on the violated branch —
          // the harness emits the WINDOW-BOUND VIOLATED string instead and the derived
          // `pct` is never emitted above 100 (the live `1698.82%` string, §12 H3).
          const v = api.deriveO0StageVerdict(row)
          if (!/WINDOW-BOUND VIOLATED/.test(String(v.verdict))) {
            return `${what}: the row's verdict must be the WINDOW-BOUND VIOLATED form, got ${JSON.stringify(v.verdict)}`
          }
          if (String(v.verdict).includes('%')) return `${what}: the violated branch must emit NO percentage: ${JSON.stringify(v.verdict)}`
          if (v.pct !== null && v.pct !== undefined) return `${what}: pct must be null on the violated branch (got ${String(v.pct)})`
          // A row CLAIMING pass while its own window is violated can never validate.
          const claiming = api.validateO0Run({ ...row, pass: true, failReasons: [] })
          if (claiming.ok) return `${what}: a row claiming pass:true under a window-bound violation validated ok:true`
        } else {
          if (wb.failReasons && wb.failReasons.length) return `${what}: an IN-BOUND row must carry no window-bound reason: ${JSON.stringify(wb.failReasons)}`
          if (wb.armWindowOk !== true) return `${what}: the equal-window pair must report armWindowOk true (got ${String(wb.armWindowOk)})`
          const vIn = api.deriveO0StageVerdict(row)
          if (String(vIn.verdict).includes('WINDOW-BOUND')) return `${what}: an in-bound row must NOT emit the window-bound verdict: ${JSON.stringify(vIn.verdict)}`
          // §5 P-TP-3(c) — a pct is never EMITTED outside [0,100]: an in-bound row whose
          // largest stage still exceeds the total (the tol band allows it) must refuse the
          // percentage (`pct: null`) rather than print >100%.
          if (vIn.pct !== null && vIn.pct !== undefined && !(vIn.pct >= 0 && vIn.pct <= 100)) {
            return `${what}: an in-bound row emitted pct=${String(vIn.pct)} (outside [0,100] — §5 P-TP-3(c): no percentage may be derived above 100%)`
          }
        }
        return null
      },
      PTP3_ATTEMPTS,
    )
    assertHeld(rep)
    expect(rep.attempts, '§5: P-TP-3 is allocated 50 attempts (its own constant)').toBe(PTP3_ATTEMPTS)
  })
})

// ===========================================================================
// §W — the H2/H3 re-derivation pins (§3.6b, §4.3 window bound + structural
//      marker, §4.4's two further verdict forms, §6 S14-S17 / F13a/F14/F17).
//      ADDITIVE: no register row is renumbered, weakened or folded.
// ===========================================================================
describe('O-0 §3.6b/§4.3 (H3) — the window bound, the structural marker and the UNMEASURED read count', () => {
  const TOL = 40 // §3.6 — the recorded hook band (`O0_HOOK_LONGTASK_TOLERANCE_MS`)
  const FREEZE_T0 = 1000

  /** §4.3 — a row with ONE offending separated stage inside a recorded freeze window. */
  const windowRow = (api: O0Api, ids: readonly string[], opts: { ms: number; total: number; armBefore?: number; pass?: boolean; reason?: string }) => {
    const armBefore = opts.armBefore ?? 0
    return runFor(ids, {
      stages: ids.map((id) => ({
        id,
        ms: id === 'traversal.build' ? opts.ms : 0,
        unseparated: false,
        source: (id === 'post.style' ? 'derived' : 'mark') as 'derived' | 'mark',
      })),
      longTaskTotalMs: opts.total,
      pass: opts.pass ?? false,
      failReasons: opts.reason ? [opts.reason] : [],
      hook: {
        armed: true,
        armWindow: { t0: FREEZE_T0 - armBefore, t1: FREEZE_T0 + opts.total, ms: opts.total + armBefore },
        freezeWindow: { t0: FREEZE_T0, t1: FREEZE_T0 + opts.total },
        armCount: 1,
        disarmCount: 1,
      },
    })
  }

  it('W1 [§4.3 H3/§6 F13a] a separated stage whose ms exceeds `longTaskTotalMs + tolerance` is a window-bound violation naming BOTH numbers, and the report can never be ok', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const row = windowRow(api, ids, { ms: 400, total: 100 })
    const wb = api.deriveO0WindowBound(row, { hookToleranceMs: TOL })
    expect(wb.violated, '§4.3: 400 ms inside a 100 ms freeze exceeds 100 + 40 — a violation').toBe(true)
    const blob = JSON.stringify(wb.failReasons)
    expect(blob, 'the reason must NAME the stage ms (400)').toContain('400')
    expect(blob, 'the reason must NAME the bound (total 100 + tol 40 = 140)').toContain('140')
    expect(
      blob,
      "§6 F13a pins the reason shape: `stage <id> ms <ms> exceeds the freeze it belongs to (<total> ms + <tol> ms tolerance)`",
    ).toMatch(/exceeds the freeze|WINDOW-BOUND/i)
    // The tolerance parameter is honored (the same row is IN-BOUND at 400 ms of tolerance).
    expect(api.deriveO0WindowBound(row, { hookToleranceMs: 400 }).violated, 'the recorded band is a PARAMETER (§5 P-TP-3: tolerance ∈ {0,40})').toBe(false)
    // §4.3 — the bound is against the freeze the stage BELONGS to: a row CLAIMING
    // pass:true while violating it can never validate, and it cannot be part of an
    // ok report (the report folds the row's forcing reasons in).
    const claiming = api.validateO0Run({ ...row, pass: true, failReasons: [] })
    expect(claiming.ok, '§4.3: the window bound forces pass:false — a row claiming pass:true under it must be ok:false').toBe(false)
    const rep = api.validateO0Report(reportFor([{ ...row, pass: true, failReasons: [] }], ids, { controls: [], pass: true }))
    expect(rep.ok, 'a report containing a window-bound violation can never be ok').toBe(false)
    expect(JSON.stringify(rep.failReasons), 'the violation survives into the report-level reasons').toMatch(/exceeds the freeze|WINDOW-BOUND/i)
  })

  it('W2 [§4.4 F13a — the LIVE counterexample, §12 H3] `traversal.build 1768.7 ms inside a 110 ms window` is REFUSED: WINDOW-BOUND VIOLATED, never a `1698.82%`-style string', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    // The fixture reproduces the live pass's own H3 row (§12 H3 / §12.3): a stage
    // larger than its freeze, which the harness printed as `1698.82%`.
    const live = windowRow(api, ids, { ms: 1768.7, total: 110 })
    const wb = api.deriveO0WindowBound(live, { hookToleranceMs: TOL })
    expect(wb.violated, '1768.7 ms exceeds 110 + 40 = 150 — the live H3 violation').toBe(true)
    const blob = JSON.stringify(wb.failReasons)
    expect(blob, 'both numbers must be named (1768.7 and 150)').toMatch(/1768\.7/)
    expect(blob, 'both numbers must be named (the bound 150)').toContain('150')
    const v = api.deriveO0StageVerdict(live)
    expect(
      String(v.verdict),
      '§4.4 pins the replacement verdict form: `… WINDOW-BOUND VIOLATED: no percentage verdict is emitted for this row`',
    ).toMatch(/WINDOW-BOUND VIOLATED/)
    expect(String(v.verdict), 'no `%` may appear on the violated branch (this is the `1698.82%` string it replaces)').not.toContain('%')
    expect(v.pct, 'the derived pct is refused, not clamped').toBeNull()
    expect(
      String(v.verdict),
      'the verdict must still be DERIVED from the row and name the offending stage',
    ).toMatch(/traversal\.build/)
    // An IN-BOUND row keeps the §4.4 percentage form, with 0 ≤ pct ≤ 100.
    const inBound = windowRow(api, ids, { ms: 110, total: 110 })
    const vOk = api.deriveO0StageVerdict(inBound)
    expect(vOk.verdict, 'an in-bound row emits the percentage form').toMatch(/is the largest identified stage/)
    expect(vOk.pct, 'an in-bound row can carry a percentage').toBe(100)
  })

  it('W3 [§4.3/P-TP-3(b)/§6 S16] the armed window is RECORDED and an arm that starts before the freeze `o0:t0` (beyond tolerance) violates the bound — `hook.armWindow` is never a silent widening', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    // (a) the equal-window pair is legal and RECORDS its interval (§4.3: the armed
    // window EQUALS the freeze window — armed at/after `o0:t0`, disarmed at `o0:t1`).
    const equal = windowRow(api, ids, { ms: 10, total: 110, armBefore: 0 })
    expect(equal.hook?.armWindow, '§4.3: the row records the actual interval as hook.armWindow {t0,t1,ms}').toBeTruthy()
    expect(api.deriveO0WindowBound(equal, { hookToleranceMs: TOL }).violated, 'an equal window is in-bound').toBe(false)
    expect(api.deriveO0WindowBound(equal, { hookToleranceMs: TOL }).armWindowOk, 'an equal window reports armWindowOk:true').toBe(true)
    // (b) 5 ms of widening is inside the recorded 40 ms band; 50 ms is NOT.
    expect(api.deriveO0WindowBound(windowRow(api, ids, { ms: 10, total: 110, armBefore: 5 }), { hookToleranceMs: TOL }).violated,
      'a 5 ms overhang sits inside the recorded 40 ms band').toBe(false)
    const wide = windowRow(api, ids, { ms: 10, total: 110, armBefore: 50 })
    const wb = api.deriveO0WindowBound(wide, { hookToleranceMs: TOL })
    expect(wb.violated, 'an arm window starting 50 ms before `o0:t0` (band 40) is a violation, never a silent widening').toBe(true)
    expect(wb.armWindowOk, 'the arm-window half of the oracle is reported separately').toBe(false)
    expect(JSON.stringify(wb.failReasons), 'the arm-window reason must name the interval (the freeze t0)').toMatch(/arm|window|t0/i)
    // (c) and a row claiming pass:true under a widened window can never validate.
    expect(api.validateO0Run({ ...wide, pass: true, failReasons: [] }).ok, 'the widened window forces pass:false (§4.3 H3)').toBe(false)
    // (d) 250 ms before t0 is a violation at EVERY tolerance in the register's set {0,40}.
    for (const tol of [0, 40]) {
      expect(api.deriveO0WindowBound(windowRow(api, ids, { ms: 0, total: 2283, armBefore: 250 }), { hookToleranceMs: tol }).violated,
        `a 250 ms pre-arm violates the bound at tolerance ${tol}`).toBe(true)
    }
  })

  it('W4 [§4.3/§6 S14/F14] a STRUCTURALLY unmeasurable stage is named as structural (with its recorded seam) and is never conflated with a merely unmeasured one — and a stage double-recorded by the two instances is rejected', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const SEAM = 'no main-side seam: the IPC_RAG_SNAPSHOT handler is not instrumented in the executing bundle'
    const withStage = (id: string, over: Record<string, unknown>, reason: string) =>
      runFor(ids, {
        stages: ids.map((sid) =>
          sid === id
            ? ({ id: sid, ms: null, unseparated: true, source: 'mark', ...over } as unknown as O0StageShape)
            : ({ id: sid, ms: 1, unseparated: false, source: sid === 'post.style' ? 'derived' : 'mark' } as O0StageShape),
        ),
        pass: false,
        failReasons: [reason],
      })
    // (a) S14 — structural: no seam EXISTS in the executing bundle (the H2 class).
    const structural = withStage(
      'snapshot.clone',
      { structural: true, structuralReason: SEAM },
      `stage snapshot.clone is structurally unseparated — ${SEAM} (§6 S14)`,
    )
    const rs = api.validateO0Run(structural)
    const sBlob = JSON.stringify({ errors: rs.errors, failReasons: rs.failReasons })
    expect(sBlob, '§6 S14/F14: the reason must name it as STRUCTURAL').toMatch(/structurally unseparated/)
    expect(sBlob, 'the recorded structuralReason (the missing seam) must be carried into the reason').toContain('IPC_RAG_SNAPSHOT')
    expect(sBlob, 'the offending stage id must be named').toContain('snapshot.clone')
    // (b) the merely-UNMEASURED case (a seam exists but was not armed, §4.3): the
    // two must NOT be conflated — the reason may not claim structural.
    const unmeasured = withStage(
      'reconcile.roots',
      { structural: false, structuralReason: null },
      'stage reconcile.roots is unmeasured in this run (the seam exists but the recorder was not armed for it) — §4.3/§6 S14',
    )
    const ru = api.validateO0Run(unmeasured)
    const uBlob = JSON.stringify({ errors: ru.errors, failReasons: ru.failReasons })
    expect(uBlob, 'a merely-unmeasured stage must be named as unmeasured (§4.3/S14)').toMatch(/unmeasured/i)
    expect(uBlob, 'the two branches must not be conflated: an unmeasured stage is NOT structural').not.toMatch(/structurally/i)
    expect(api.unseparatedStageIds(structural), 'the unseparated ids are recorded (§6 F4)').toEqual(['snapshot.clone'])
    // (c) §3.6b/S14 — BOTH recorder instances recording the SAME stage id in one
    // freeze window is `pass:false`: one stage, one measurement source.
    const doubled = runFor(ids, {
      pass: false,
      failReasons: ['stage snapshot.pull recorded by two instances (renderer, main) in one freeze window'],
      hook: {
        armed: true,
        stageRecords: [
          { stage: 'snapshot.pull', instance: 'renderer' },
          { stage: 'snapshot.pull', instance: 'main' },
        ],
      },
    })
    const rd = api.validateO0Run(doubled)
    const dBlob = JSON.stringify({ errors: rd.errors, failReasons: rd.failReasons })
    expect(dBlob, '§6 S14 pins the reason: `stage <id> recorded by two instances (renderer, main) in one freeze window`').toMatch(/two instances/)
    expect(dBlob, 'the double-recorded stage id must be named').toContain('snapshot.pull')
    expect(rd.ok, 'a double-recorded stage cannot validate').toBe(false)
    // The union aggregation still attributes each record to its instance.
    expect(
      (doubled.hook?.stageRecords ?? []).every((r) => r.instance === 'renderer' || r.instance === 'main'),
      '§3.6b: hook.stageRecords[] must carry, per record, the instance it came from',
    ).toBe(true)
  })

  it('W5 [§4.4/§3.6b — the A-4 rule] an unseparated `snapshot.pull` emits the UNMEASURED read verdict — never a `performed 0` string that reads as a measured zero', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const CENSUS = { documents: 226, nodes: 10170, edges: 18758 }
    const REASON = 'snapshot.pull unseparated — the caller-level seam in src/renderer/sidebar-panes.ts is absent in the executing bundle'
    const unsep = runFor(ids, {
      stages: ids.map((id) =>
        id === 'snapshot.pull'
          ? ({ id, ms: null, unseparated: true, source: 'mark', structural: true, structuralReason: REASON } as unknown as O0StageShape)
          : ({ id, ms: 1, unseparated: false, source: id === 'post.style' ? 'derived' : 'mark' } as O0StageShape),
      ),
      pass: false,
      failReasons: [`stage snapshot.pull is structurally unseparated — ${REASON}`],
    })
    const v = api.deriveO0SnapshotVerdict(unsep, CENSUS)
    expect(
      String(v.verdict),
      '§4.4 pins the replacement form: `the <gesture>\'s whole-store IPC_RAG_SNAPSHOT read count is UNMEASURED (snapshot.pull unseparated — <reason>)`',
    ).toMatch(/read count is UNMEASURED/)
    expect(String(v.verdict), 'the reason must be carried (the seam that is missing)').toMatch(/unseparated/)
    expect(
      String(v.verdict),
      'a "not measured" 0 must NEVER be emitted as a measured zero — the live `performed 0 whole-store … read(s)` string is exactly what this rule refuses (§12 H2)',
    ).not.toMatch(/performed 0 whole-store/)
    expect(v.readCount, 'the counted reads stay 0 (no read was OBSERVED) — the VERDICT is what must say UNMEASURED').toBe(0)
    // The MEASURED zero is a different, legal verdict: a separated `snapshot.pull`
    // with ms 0 is the recorded A-4 proof of "no non-zero read" (§2.3/§4.4).
    const measuredZero = runFor(ids, {
      stages: ids.map((id) =>
        id === 'snapshot.pull'
          ? ({ id, ms: 0, unseparated: false, source: 'hook' } as O0StageShape)
          : ({ id, ms: 1, unseparated: false, source: id === 'post.style' ? 'derived' : 'mark' } as O0StageShape),
      ),
    })
    const vz = api.deriveO0SnapshotVerdict(measuredZero, CENSUS)
    expect(vz.verdict, 'a MEASURED zero read keeps the §4.4 `performed 0 … read(s)` form').toMatch(/performed 0 whole-store/)
    expect(vz.stageSeparated, 'the separated snapshot.pull is recorded as measured').toBe(true)
    // The measured CALLER-level round trip is the A-4 discriminator (§3.6b): a
    // non-zero round-trip read is the recorded proof the folder disclosure reads.
    const read = runFor(ids, {
      stages: ids.map((id) =>
        id === 'snapshot.pull'
          ? ({ id, ms: 412.5, unseparated: false, source: 'hook' } as O0StageShape)
          : ({ id, ms: 1, unseparated: false, source: id === 'post.style' ? 'derived' : 'mark' } as O0StageShape),
      ),
    })
    expect(api.deriveO0SnapshotVerdict(read, CENSUS).verdict, 'the caller-level round trip is counted at the CALLER seam (§3.6b)').toMatch(
      /performed 1 whole-store IPC_RAG_SNAPSHOT read\(s\) totalling 412\.5 ms/,
    )
  })

  it('W6 [§6 S17/F17b] a report whose runs ARMED the hook but carries NO inertness comparison is pass:false with a forcing reason naming §3.6(c) — an empty `hookInertness` is legal ONLY when nothing armed', async () => {
    const api = await loadO0()
    const ids = idsOf(api)
    const { off, on } = gpuPair(ids)
    const armed = [
      runFor(ids, { id: off.id, gpu: false, hook: { armed: true, armCount: 1, disarmCount: 1 } }),
      runFor(ids, { id: on.id, gpu: true, hook: { armed: true, armCount: 1, disarmCount: 1 } }),
    ]
    const base = reportFor(armed, ids)
    // (a) the vacuous case: the repeat block was not in `--block`, so the runs armed
    // the hook and no inertness pair exists (§12 finding 12 — exactly this shape).
    const vacuous = api.validateO0Report(
      reportFor(armed, ids, { driver: { ...base.driver, hookInertness: [] }, pass: false }),
    )
    expect(vacuous.ok, '§6 S17/F17b: `driver.hookInertness: []` with armed runs is a report-level fail-state').toBe(false)
    const blob = JSON.stringify(vacuous.failReasons)
    expect(blob, 'F17 pins the reason text: `no hook inertness comparison was recorded although <n> run(s) armed the hook`').toMatch(
      /no hook inertness comparison was recorded/i,
    )
    expect(blob, 'the forcing reason must name the runs that armed the hook (§6 S17)').toMatch(/armed the hook|2 run/i)
    expect(blob, 'the reason must name the §3.6(c) rule it enforces (an unverified arm is not an inert arm)').toMatch(/3\.6\s*\(c\)/)
    // (b) the legal case: NO run armed the hook ⇒ an empty comparison is legal.
    const noArm = reportFor(
      [runFor(ids, { id: off.id, gpu: false }), runFor(ids, { id: on.id, gpu: true })],
      ids,
      { driver: { ...base.driver, hookInertness: [] } },
    )
    expect(api.validateO0Report(noArm).ok, "§6 S17: an empty `hookInertness` is legal when no run armed the hook").toBe(true)
    // (c) the recorded comparison: an armed report carrying an inert pair is not
    // forced by the vacuity rule.
    const compared = api.validateO0Report(
      reportFor(armed, ids, {
        driver: {
          ...base.driver,
          hookInertness: [{ baselineRun: off.id, armedRun: on.id, inert: true, setEqual: true, deltaMutations: 0, deltaLongTaskTotalMs: 0, toleranceMs: 40 }],
        },
      }),
    )
    expect(
      JSON.stringify(compared.failReasons),
      '§6 S17: an armed report WITH a recorded comparison must not be forced by the vacuity rule',
    ).not.toMatch(/no hook inertness comparison/i)
  })
})
