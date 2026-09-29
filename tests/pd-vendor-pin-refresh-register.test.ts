// tests/pd-vendor-pin-refresh-register.test.ts — unit `PD-VENDOR-PIN-REFRESH`
// (THE PIN REFRESH: the `PD-VENDOR` foundation pin re-stated to the foundation's
// current HEAD, in all four sites atomically, with no module byte changed): the
// `§4` TYPED PROPERTY REGISTER — all THREE rows, `P-IM-pd-pin-1` ·
// `P-SM-pd-pin-2` · `P-TP-pd-pin-3`, each with its DECLARED TERMS printed, its
// controls driven, and its `held`/`broken` verdict reported with its strategy id.
//
// ===========================================================================
// GATE-4 REMAND PASS — WHAT MOVED HERE, AND WHY (finding by finding)
// ===========================================================================
// This pass RE-DERIVES the register to the amended contract. The amendment is
// ANNOTATE-BESIDE (`RCA-8(c)`): every as-filed reading stays visible and NOTHING
// is deleted, so the superseded tables below are KEPT and explicitly marked.
//
//  · `A-3` (BLOCKING) — the register NO LONGER FREEZES A REAL FILE'S PROSE. As
//    authored, the seventh-site control asserted that
//    `tests/pd-vendor-manifest.test.ts` carries the abbreviated superseded literal
//    `8f193a8…f82459`, so an honest title refresh — the permission `§2` items 4–6
//    grant and `D-12` exercises — would have RED a row that was green, and the
//    failure would have blamed the CONTROL. The control's subject is now a
//    SYNTHETIC title text ALONE (`A-3` (iii) / `D-12`): the register never freezes
//    any real file's prose, and the ONLY real-file limb that may stay is the
//    DECLARATION COUNT (`A-3`'s closing sentence).
//  · `A-9` — every limb that reads THIS CONTRACT is anchored to a BOUNDED SECTION
//    REGION (`§4`'s header through `§5`'s, i.e. the table + `§4.1` + the attempt
//    tally) and to the ARITHMETIC. As authored, these limbs ran global regexes and
//    whole-file `toContain`s over the spec (the tally, the seed, the caps, the stop
//    rule, the ids and `/RED[\s\S]{0,600}?GREEN-ON-ARRIVAL/`), so a legitimate
//    amendment of the contract — the `§12` ledger included — red the suite and
//    blamed the contract for obeying its own amendment discipline.
//  · `A-5` — the `digestCommand` limb is strengthened from a bare `includes(pin)`
//    to EXACTLY ONE distinct 40-hex literal equal to the pin (a command carrying
//    BOTH literals, or a 64-hex string whose first 40 characters are the pin, now
//    FAILS), and the three per-file DECLARATION-COUNT terms are folded INTO row 2's
//    declared domain (they sat outside it, so `F-12`'s second declaration was
//    invisible). The four `A-5` negatives are driven.
//  · `A-6` — row 3's identity oracle now takes BYTES (a regular-file flag, the
//    vendored bytes, the blob bytes and the declared md5), never a path alone, so
//    every control drives THE SAME limb the real sweep drives. The four controls:
//    perturbed BYTES (not a bare `md5()` comparison), an absent blob naming the
//    path, a SYMLINKED fixture through the oracle's own regular-file limb, and a
//    PRESENT-BUT-DIFFERING blob md5 (a temp git tree whose committed blob differs).
//  · `A-7` — row 1 gains the monitor's CLI driven over a present, byte-equal,
//    NON-git foundation tree and over a tree with a BROKEN `.git`: the reading must
//    carry the byte-only disclaimer and must make NO revision-equality claim.
//    THE SEAM IS NOT FIXED HERE: the monitor is `scripts/**`, which `§1.2` item 7
//    forbids this unit to touch; its fix is the SEPARATE, NAMED gate `E-9`
//    (`PD-VENDOR-DRIFT-REVISION-STATUS`). This row's job is to make the seam
//    VISIBLE. Row 1 also drives `compareFoundation`'s OWN pin arm with an explicit
//    divergent `foundationRevision` (`A-10`), and `foundationRevision` is READ,
//    never edited (`§1.2` item 7's amended annotation).
//  · `A-10` — row 1's one-hex mutation POSITION and REPLACEMENT are drawn from the
//    pinned LCG (a family, never the as-filed fixed position `5`), with the
//    identity/no-op draw GUARDED and REPORTED; row 3's `2` LCG re-drives were moved
//    from two pools that were both permutations of the same fifteen onto a
//    PERTURBATION DOMAIN (which module × which byte), so the random terms buy
//    discrimination rather than zero coverage.
//  · `A-4` + `A-12` — `foundation.measuredAt` is FOLDED INTO row 2's domain (one
//    limb: present · `YYYY-MM-DD` · equal to the contract's declared refresh
//    reading, which is READ OUT OF the anchored `§4` region and never re-typed
//    here). The date's DAY is the refresh's LOCAL/REPO day and is AUTHORITATIVE
//    (`A-12`): nothing in this file reads a clock, and an `UTC` day that differs
//    does NOT move the literal. The AMENDED closure claim (this row's sites are the
//    three `PINNED_COMMIT` constants + `foundation.digestCommand`'s embedded
//    revision, with `foundation.measuredAt` read by its own limb and NEVER folded
//    into the 40-hex agreement) supersedes the as-filed "all four sites" phrasing,
//    which misstated the set (remand `R1`).
//
// ⟨RE-STATED ARITHMETIC (`A-4`, `A-5`, `A-6`, `A-7`, `A-10`) — the CURRENT
//   declaration, with the SUPERSEDED one kept visible:⟩
//   CURRENT:    `7` + `16` + `21` = `44` attempts — row 1
//     `7 = 1 real pair × 2 limbs + 1 comparator pin-arm drive + 4 controls`;
//     row 2 `16 = 3 + 3 + 1 + 1 + 2 + 6`; row 3 `21 = 15 × 1 + 4 + 2`.
//   SUPERSEDED (as filed, dated 2026-09-28): `4` + `6` + `20` = `30` attempts —
//     row 1 `1 real pair × 2 limbs + 2 controls`; row 2 `3 + 1 + 2`;
//     row 3 `15 × 1 + 3 + 2`. NO DECLARED TERM IS REDUCED by this re-derivation:
//     every as-filed term is kept and only the amended terms are added.
//
// ⟨DANGLING CITATIONS — A REMAND, NOT RESOLVED SILENTLY.⟩ The contract cites
//   `§12.0`…`§12.17` (the gate-4 amendment ledger) in 46 places, and two of its own
//   dispositions assert that ledger now EXISTS (`A-1` is recorded as discharged on
//   that basis). THE FILE CARRIES NO `§12` SECTION: it ends at `§11`
//   (`docs/specs/unit-pd-vendor-pin-refresh.md`, read in full this pass). Every
//   operative declaration this register reads is therefore taken from the AMENDED
//   CELLS THEMSELVES — `§1.1` item 3/4, `§2` items 3–6, `§3` item 1's annotation,
//   `§3` item 4's `F-12`/`F-13`, `§4`'s anchoring bullet, `§4.1`'s CURRENT
//   declarations and the amended tally, `§6` item 2's amendment — which are present,
//   complete and sufficient to derive every term below. The per-finding narrative
//   that `§12.x` would carry is NOT reachable; this register cites the finding ids
//   (`A-3`…`A-12`) and the section that carries each disposition.
//
// SOURCE OF EVERY OTHER ASSERTION (spec ONLY):
//   docs/specs/unit-pd-vendor-pin-refresh.md
//     §1.1          the ALLOWED change set — the four LITERAL sites (the manifest's
//                   `foundation.commit`, `foundation.digestCommand`,
//                   `foundation.measuredAt`, and the three `PINNED_COMMIT`
//                   constants) moved in ONE atomic restatement
//     §1.2          the DENIED surface (`src/**`, the monitor's BYTES,
//                   `vitest.config.ts`, `package.json`, every other test file, the
//                   adjacency) — and item 7's amended annotation: READING the
//                   monitor's exported `compareFoundation` is permitted, editing it
//                   never
//     §2 item 2     `digestCommand` EMBEDS the commit, so it moves with site 1
//     §2 items 4–6  the `PINNED_COMMIT` constants; a row TITLE is PROSE, never a site
//     §2 the STOP   if a refreshed-revision blob differs from the vendored bytes,
//                   the refresh is NOT this unit's act (a re-vendor decision)
//     §3 item 1     the three arms (`CLEAN`/`FAIL`/`SKIPPED`), their meanings, and
//                   the amended annotation: a `CLEAN` whose `revisionChecked` is not
//                   `true` is a BYTE-ONLY reading that proves NOTHING about the pin
//     §3 item 4     the documented fail-states `F-1`..`F-13` (`F-12` a second
//                   `PINNED_COMMIT` declaration; `F-13` an absent/ill-formed date)
//     §4 machinery  seed `0x20260928` (a fixed literal — never `Date.now()`, never
//                   `Math.random()`, never an environment read), a hand-rolled 32-bit
//                   LCG (stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²,
//                   index = stateₙ₊₁ mod pool.length), ≤100 attempts/row, ≤400 total,
//                   rows sequential in register order, STOP AFTER 5 CONSECUTIVE
//                   FAILURES, every row reporting `held`/`broken` with its strategy
//                   id, every row carrying a control whose expected outcome is the
//                   OPPOSITE of the row's verdict, terms printed as the sum of their
//                   own factors
//     §4.1          the THREE ROWS' CURRENT DECLARATIONS (`7` · `16` · `21`)
//     §6 item 2     the colours: the red head's one-red-of-three record AND the
//                   amendment's landed reading (the refresh landed; the two guards
//                   remain)
//     §6 items 3/5  `tests/pd-vendor-set.test.ts` §3.3 item 2 is READ-ONLY here; the
//                   `[T]`-side obligations (no `'electron'` mock, nothing a `G-9`
//                   pin freezes is read, census-stable titles, anchored spec limbs)
//     §8 `D-10`     the new file may mock nothing and reads no `G-9`-frozen file
//     §8 `D-12`     a register control may not freeze a REAL file's prose; a
//                   superseded literal is KEPT as an explicitly-annotated citation
//     §8 `D-13`     `measuredAt` is FOLDED INTO row 2's domain (not merely restated)
//
// ROW-ID DISCIPLINE (`§4`'s row-id note, binding): the three ids are
// TOKEN-QUALIFIED — `P-IM-pd-pin-1` · `P-SM-pd-pin-2` · `P-TP-pd-pin-3` — because the
// bare prefixes are occupied by the Phase-0 register (`P-IM-1`, `P-SM-1`/`P-SM-2`,
// `P-TP-1`/`P-TP-2`) and a bare `P-SM-1` is additionally the branch's carried baseline
// (`strat:stage-seam-schedule-single-active`). The ids are declared by the contract and
// are NOT renamed here.
//
// LAYER (`RCA-12`): `[T]`/`[D]` node-pure, source-text and instrument-read. This file
// renders nothing, imports no vendored module and mocks nothing. It is NOT app-green,
// NOT envelope-green and NOT live-green; the byte-identity it asserts proves the COPY
// matches the pin, never that any consumer works. Its one instrument read (the monitor
// CLI and the monitor's exported comparator) is an `EXECUTING-A-READ`.
//
// `G-9`/`X-9` PIN SAFETY (`F-7`/`F-8`, `D-10`): this file binds no vitest mock API in
// any form (never `'electron'`), and it reads no `G-9`-frozen file — not
// `vitest.config.ts`, not `package.json`, not `src/main/markdown-import.ts`, not the two
// `DEEP_ROWS` files, not the bridge-capture fixture. Its imports are `vitest` and
// `node:*` builtins alone, and the self-scan below asserts exactly that.
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const MONITOR_PATH = join(REPO_ROOT, 'scripts', 'foundation-drift.mjs')
const SET_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts')
const MANIFEST_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-manifest.test.ts')
const DRIFT_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-drift.test.ts')
const REGISTER_SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-pd-vendor-pin-refresh.md')
const FOUNDATION = resolve(REPO_ROOT, '..', 'Provident-Electron')
const FOUNDATION_DISPLAY = '../Provident-Electron'
const SELF_PATH = join(HERE, 'pd-vendor-pin-refresh-register.test.ts')

/** The three pin sites whose literal lives in a test file's `PINNED_COMMIT` constant
 *  (`§1.1` item 4, `§2` items 4–6). Each is READ as source text — never imported,
 *  never edited. */
const CONSTANT_SITES: Array<{ site: string; path: string }> = [
  { site: 'tests/pd-vendor-set.test.ts', path: SET_PIN_PATH },
  { site: 'tests/pd-vendor-manifest.test.ts', path: MANIFEST_PIN_PATH },
  { site: 'tests/pd-vendor-drift.test.ts', path: DRIFT_PIN_PATH },
]

// ===========================================================================
// §4 — SHARED MACHINERY, pinned once and binding on every row.
//
// Seed `0x20260928` — a fixed literal in this file: never `Date.now()`, never
// `Math.random()`, never an environment read. Where a row draws a pool member it is a
// hand-rolled 32-bit LCG, ONE STEP PER DRAW (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223)
// mod 2³²`), selecting a member by `index = stateₙ₊₁ mod pool.length`.
// ≤100 attempts per row; ≤400 in total; rows run sequentially in register order;
// STOP AFTER 5 CONSECUTIVE FAILURES (the running row's remaining attempts are
// abandoned, and the abandonment is REPORTED through `stoppedAt` — never hidden).
// ===========================================================================
const REGISTER_SEED = 0x20260928
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

/** The hex alphabet the `A-10` replacement draw selects from. */
const HEX_CHARS = '0123456789abcdef'

/** ⟨`A-10`⟩ A MUTATION DRAWN FROM THE PINNED LCG: the POSITION and the REPLACEMENT
 *  character are both drawn (one LCG step each), never the as-filed fixed position `5`.
 *  The identity/no-op draw is GUARDED — a replacement equal to the character it would
 *  overwrite is stepped to the next distinct character and the guard firing is REPORTED
 *  (`guarded: true`) rather than silently swallowed. */
function drawnMutation(literal: string, state: number): { state: number; literal: string; position: number; replacement: string; guarded: boolean } {
  const posDraw = lcgDraw(state, literal.length)
  const repDraw = lcgDraw(posDraw.state, HEX_CHARS.length)
  const position = posDraw.index
  let replacement = HEX_CHARS[repDraw.index]!
  let guarded = false
  if (replacement === literal[position]) {
    replacement = HEX_CHARS[(HEX_CHARS.indexOf(replacement) + 1) % HEX_CHARS.length]!
    guarded = true
  }
  return { state: repDraw.state, literal: literal.slice(0, position) + replacement + literal.slice(position + 1), position, replacement, guarded }
}

interface RowReport {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors */
  declared: string
  declaredTotal: number
  /** the EXECUTED term — read from the run, never copied from the declaration */
  executed: number
  held: boolean
  stoppedAt: number | null
  counterexamples: string[]
  bounded: string | null
  /** the per-attempt outcome record — which limbs held, in order */
  limbs: Array<{ index: number; held: boolean }>
}

const REPORTS: RowReport[] = []

/** ⟨RE-STATED (`A-4`…`A-10`)⟩ The declared register, in register order, each row's term
 *  printed as the sum of its own factors. `declared`/`declaredTotal` are the CURRENT
 *  (`§4.1`) declaration; `superseded*` are the AS-FILED readings, KEPT VISIBLE and
 *  explicitly marked — annotate-beside, `RCA-8(c)`. */
const DECLARED_REGISTER: Array<{
  row: string
  strategyId: string
  declared: string
  declaredTotal: number
  bounded: string | null
  colourAtLandedHead: string
  superseded: { declared: string; declaredTotal: number; colourAtRedHead: string; asFiledOn: string }
}> = [
  {
    row: 'P-IM-pd-pin-1',
    strategyId: 'strat:pd-pin-manifest-vs-head',
    declared: '1 real pair × 2 limbs + 1 comparator pin-arm drive + 4 controls',
    declaredTotal: 7,
    bounded: 'ON THE PRESENCE CONDITION',
    colourAtLandedHead: 'GREEN AT THE LANDED HEAD — the refresh landed: the manifest carries the tree’s HEAD (§1.1’s landed block)',
    superseded: {
      declared: '1 real pair × 2 limbs + 2 controls',
      declaredTotal: 4,
      colourAtRedHead: 'RED — the tree HEAD was d7b98b57… while the manifest pinned 8f193a8d…',
      asFiledOn: '2026-09-28',
    },
  },
  {
    row: 'P-SM-pd-pin-2',
    strategyId: 'strat:pd-pin-four-site-agreement',
    declared: '3 + 3 + 1 + 1 + 2 + 6',
    declaredTotal: 16,
    bounded: null,
    colourAtLandedHead: 'GREEN — the two guards held green-on-arrival and stay green through the refresh (F-1/F-2/F-12 guard)',
    superseded: {
      declared: '3 + 1 + 2',
      declaredTotal: 6,
      colourAtRedHead: 'GREEN-ON-ARRIVAL — all four sites carried the OLD literal consistently',
      asFiledOn: '2026-09-28',
    },
  },
  {
    row: 'P-TP-pd-pin-3',
    strategyId: 'strat:pd-pin-refreshed-blob-identity',
    declared: '15 × 1 + 4 + 2',
    declaredTotal: 21,
    bounded: null,
    colourAtLandedHead: 'GREEN — the fifteen vendored bytes equal the recorded commit’s blobs (blob object-ids identical at both revisions), so the row keeps its byte reason (F-3 guard)',
    superseded: {
      declared: '15 × 1 + 3 + 2',
      declaredTotal: 20,
      colourAtRedHead: 'GREEN-ON-ARRIVAL — the fifteen vendored bytes equalled the pinned revision’s blobs',
      asFiledOn: '2026-09-28',
    },
  },
]

interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
  /** each attempt's index and whether it HELD — so a report shows which CONTROLS were
   *  actually driven (a control that never ran can never make a row `held`). */
  limbs: Array<{ index: number; held: boolean }>
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null, limbs: [] }
}

/** A register row's bounded attempt loop. `check` returns a counterexample string, or
 *  `null` when the attempt HELD. The attempt is ALWAYS counted (so a broken row reports
 *  the drives it actually took — never a figure it did not read), the row's remaining
 *  attempts are abandoned once `STOP_AFTER` CONSECUTIVE failures have been seen, and the
 *  abandonment is reported through `stoppedAt`. */
function attempt(run: RowRun, i: number, ce: string | null): void {
  if (run.stoppedAt !== null) return
  if (run.attempts >= CAPS.perRow) return
  run.attempts++
  run.limbs.push({ index: i, held: ce === null })
  if (ce === null) {
    run.consecutive = 0
    return
  }
  run.consecutive++
  run.counterexamples.push(ce)
  if (run.consecutive >= STOP_AFTER && run.stoppedAt === null) run.stoppedAt = i
}

/** Report a row's verdict. The DECLARED term is printed from the table above and is
 *  NEVER reduced by an abandoned run; the EXECUTED count is read from the run. */
function finish(id: string, run: RowRun): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error(`PD-VENDOR-PIN-REFRESH register failure: ${id} is not a declared register row`)
  const executed = run.attempts
  const held = run.counterexamples.length === 0 && executed === declared.declaredTotal
  const report: RowReport = {
    row: id,
    strategyId: declared.strategyId,
    declared: declared.declared,
    declaredTotal: declared.declaredTotal,
    executed,
    held,
    stoppedAt: run.stoppedAt,
    counterexamples: run.counterexamples,
    bounded: declared.bounded,
    limbs: run.limbs,
  }
  REPORTS.push(report)
  expect(
    held,
    `${id} ${declared.strategyId}: declared ${declared.declared} = ${declared.declaredTotal} attempt(s); executed ${executed}; ` +
      `stoppedAt ${String(run.stoppedAt)} — ${held ? 'HELD' : 'BROKEN'}` +
      (run.counterexamples.length > 0 ? `; counterexamples: ${run.counterexamples.slice(0, 5).join(' | ')}` : ''),
  ).toBe(true)
  return report
}

// ===========================================================================
// The `[T]`-side readers. Every one of them reads a REAL file, drives a REAL `git`
// process or drives the monitor's OWN exported comparator: nothing is mocked and
// nothing is simulated. The monitor is READ, never edited (`§1.2` item 7's amended
// annotation: an `EXECUTING-A-READ, NEVER-AN-EDIT`).
// ===========================================================================
function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {
    throw new Error(`PD-VENDOR-PIN-REFRESH [T] read failure: ${path} — ${(e as Error).message}`)
  }
}

function md5(bytes: Buffer | string): string {
  return createHash('md5').update(bytes).digest('hex')
}

function readManifest(): Record<string, unknown> {
  return JSON.parse(readText(MANIFEST_PATH)) as Record<string, unknown>
}

function foundationBlock(): Record<string, unknown> {
  const foundation = readManifest().foundation
  if (foundation === null || typeof foundation !== 'object') {
    throw new Error(`PD-VENDOR-PIN-REFRESH contract failure [§2 item 1]: ${MANIFEST_PATH} carries no \`foundation\` object`)
  }
  return foundation as Record<string, unknown>
}

/** §2 item 1 / §3 item 3 — the manifest's own `foundation.commit` literal. */
function manifestCommit(): string {
  const commit = String(foundationBlock().commit ?? '')
  if (!/^[0-9a-f]{40}$/.test(commit)) {
    throw new Error(
      `PD-VENDOR-PIN-REFRESH contract failure [§2 item 1 / Phase-0 §2.2]: \`foundation.commit\` must be a full 40-hex literal; read "${commit}"`,
    )
  }
  return commit
}

/** §2 item 2 — the digest command, whose EMBEDDED commit makes it a pin site. */
function digestCommand(): string {
  const cmd = foundationBlock().digestCommand
  if (typeof cmd !== 'string' || cmd.trim() === '') {
    throw new Error(`PD-VENDOR-PIN-REFRESH contract failure [§2 item 2]: \`foundation.digestCommand\` must be the command recorded verbatim as run`)
  }
  return cmd
}

/** §2 item 3 / `D-13` — the manifest's own `measuredAt` value, as carried. */
function manifestMeasuredAt(): string {
  const value = foundationBlock().measuredAt
  return typeof value === 'string' ? value : ''
}

/** The pin's fifteen, READ OUT OF THE MANIFEST (`§4` row 3's domain is the pin's own
 *  set, so it is consumed, never re-typed). */
function pinnedFifteen(): string[] {
  const modules = readManifest().modules
  if (!Array.isArray(modules) || modules.length !== 15) {
    throw new Error(`PD-VENDOR-PIN-REFRESH contract failure [§2 item 1 / Phase-0 §2.1 item 1]: the manifest's \`modules\` array must carry EXACTLY fifteen members; read ${Array.isArray(modules) ? modules.length : 'not-an-array'}`)
  }
  return (modules as Array<Record<string, unknown>>).map((m) => String(m.name))
}

/** `§3` items 1/3 — the tree's OWN revision. A non-zero exit is returned with its
 *  stderr so a caller that must FAIL LOUDLY can name the exact error (`D-11`). */
function treeRevision(): { status: number; revision: string | null; detail: string } {
  const r = spawnSync('git', ['-C', FOUNDATION, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
  const stdout = r.stdout ?? ''
  const stderr = r.stderr ?? ''
  const revision = r.status === 0 ? stdout.trim() : null
  const detail =
    r.status === 0
      ? `ok`
      : `${FOUNDATION_DISPLAY} (${FOUNDATION}) is ABSENT or is not a readable git repository — \`git -C ${FOUNDATION_DISPLAY} rev-parse HEAD\` failed with status ${String(r.status)}${r.error !== undefined ? ` (${(r.error as Error).message})` : ''}: ${stderr.trim()}`
  return { status: r.status ?? -1, revision, detail }
}

/** The equality limb's ORACLE, factored so a control can drive it against a synthetic
 *  manifest instead of the real one (`§4.1` row 1's negative control). */
function pinEqualityOracle(pinned: string, revision: string): string | null {
  return pinned === revision ? null : `the manifest's \`foundation.commit\` ${pinned} is NOT the adjacent tree's HEAD ${revision}`
}

// ---------------------------------------------------------------------------
// ⟨`A-9`⟩ THE ANCHORED CONTRACT READ. The spec file is read EXACTLY ONCE, and every
// limb that reads it takes a BOUNDED SECTION REGION — never a global regex or a
// whole-file `toContain` over the contract. A section is addressed by its own
// `## <n>.` header, so appending a dated amendment INSIDE it cannot red the suite,
// and a limb that loses its subject reports that instead of passing vacuously.
// ---------------------------------------------------------------------------
function specRegion(startHeading: string, endHeading: string): { text: string; detail: string } {
  const spec = readText(REGISTER_SPEC_PATH)
  const start = spec.indexOf(startHeading)
  if (start < 0) return { text: '', detail: `the contract carries no \`${startHeading}\` heading — the region has lost its subject` }
  const end = spec.indexOf(endHeading, start + startHeading.length)
  if (end < 0) return { text: '', detail: `the contract carries no \`${endHeading}\` heading after \`${startHeading}\` — the region has no upper bound` }
  const text = spec.slice(start, end)
  if (text.trim() === '') return { text: '', detail: `the region \`${startHeading}\` … \`${endHeading}\` is empty` }
  return { text, detail: `anchored region ${startHeading} … ${endHeading} (${text.length} chars)` }
}

/** The `§4` TABLE REGION: `§4`'s header through the ATTEMPT TALLY, closed by `§5`'s
 *  header — the region `§4`'s anchoring bullet (`A-9`) names. */
function registerRegion(): { text: string; detail: string } {
  return specRegion('## 4. The typed Property register', '## 5. The layer ledger')
}

/** The `§6` red-set region, for the colours limb. */
function redSetRegion(): { text: string; detail: string } {
  return specRegion('## 6. The red-set plan', '## 7. Verification')
}

/** ⟨`A-4` / `A-12` / `D-13`⟩ The contract's OWN declared refresh reading, READ OUT OF
 *  the anchored `§4` region (never re-typed in this file, so a dated amendment that
 *  moves the declaration moves this limb with it). The LAST declaration in the region
 *  governs, because `§4.1` says the amended block is the CURRENT one where the two
 *  differ. NOTHING about a UTC day is asserted here: `A-12` makes the refresh's
 *  LOCAL/REPO day authoritative, and this limb asserts only the SHAPE and the
 *  DECLARED equality, with no clock read anywhere in this file. */
function declaredRefreshReading(): { reading: string | null; detail: string } {
  const region = registerRegion()
  if (region.text === '') return { reading: null, detail: region.detail }
  const matches = [...region.text.matchAll(/declared refresh\s+reading[\s\S]{0,24}?(\d{4}-\d{2}-\d{2})/g)]
  if (matches.length === 0) {
    return {
      reading: null,
      detail: `${region.detail}: the region no longer carries a \`declared refresh reading (<YYYY-MM-DD>)\` clause, so the \`measuredAt\` limb has no declared subject (it must RED, never pass vacuously)`,
    }
  }
  return { reading: matches[matches.length - 1]![1]!, detail: `${region.detail}: the last declared refresh reading is ${matches[matches.length - 1]![1]!}` }
}

/** ⟨`A-4` / `D-13` / `F-13`⟩ The `measuredAt` LIMB: present · `YYYY-MM-DD` · equal to
 *  the contract's declared reading. An absent, ill-formed or uncoupled date is a RED. */
function measuredAtLimb(value: string, declared: string | null): string | null {
  if (declared === null) return `MEASURED-AT: the contract declares no refresh reading to compare against — this limb took no reading`
  if (value === '') return `MEASURED-AT: \`foundation.measuredAt\` is ABSENT or is not a string — the refresh's own reading is unrecorded (F-13)`
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `MEASURED-AT: \`foundation.measuredAt\` is "${value}", which is not the declared \`YYYY-MM-DD\` form (F-13)`
  if (value !== declared) return `MEASURED-AT: \`foundation.measuredAt\` is ${value} while the contract declares the refresh reading ${declared} — the date is uncoupled from the declared run (F-13)`
  return null
}

// ---------------------------------------------------------------------------
// ⟨`A-5`⟩ THE DECLARATION COUNT, THE CONSTANT LITERAL AND THE COMMAND LITERAL.
// ---------------------------------------------------------------------------

/** Comments stripped, so a PROSE mention of a path in a file's own header can never be
 *  mistaken for a READ of it, and a prose mention of a literal can never be mistaken
 *  for a `PINNED_COMMIT` DECLARATION.
 *
 *  ⟨DEFECT CORRECTED 2026-09-28 (this author's own instrument pass) — annotate-beside,
 *  nothing deleted:⟩ as first authored, this reader removed BLOCK comments with a
 *  block-comment regex over the WHOLE text. This file's header is written in `//`-style
 *  line comments that quote the contract's own markers, so the whole header — and with
 *  it the import block and the readers — fell INSIDE the first block-comment span and
 *  was deleted, which made the `F-8` self-scan read ZERO imports and report a false
 *  red. The block-comment arm is GONE: a line whose first non-blank characters are `//`
 *  is a COMMENT LINE and is dropped; every other line is kept verbatim. A `/* … *​/`
 *  block would still be scanned, which is the SAFE direction for an `F-8` scan (it can
 *  over-report, never under-report). */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*\/\//.test(line))
    .join('\n')
}

const PINNED_COMMIT_DECLARATION = /const\s+PINNED_COMMIT\s*=\s*'([0-9a-fA-F]{40})'/g

/** ⟨`A-5` / `F-12`⟩ A source text's `PINNED_COMMIT` DECLARATIONS: how many there are
 *  and which literal the first one carries. `count !== 1` is a FAIL-STATE (`F-12`: one
 *  file, two authorities) — the as-filed row checked this OUTSIDE its declared domain,
 *  which is exactly why a second declaration was invisible. */
function constantDeclarationsIn(site: string, text: string): { site: string; count: number; literal: string | null; how: string } {
  const body = withoutComments(text)
  const matches = [...body.matchAll(PINNED_COMMIT_DECLARATION)]
  const literal = matches.length > 0 ? matches[0]![1]!.toLowerCase() : null
  const how =
    matches.length === 0
      ? `${site}: no \`const PINNED_COMMIT = '<40 hex>'\` declaration found — this is a contract failure of the row, never a silent pass`
      : `${site}: ${matches.length} declaration(s); the first carries ${String(literal)}`
  return { site, count: matches.length, literal, how }
}

/** The same reader over an IN-MEMORY source text (the controls' subject). */
function pinnedConstantIn(site: string, text: string): { literal: string | null; how: string } {
  const read = constantDeclarationsIn(site, text)
  return { literal: read.literal, how: read.how }
}

/** An exact 40-hex literal — bounded on BOTH sides, so the first 40 characters of a
 *  64-hex string are NOT read as a commit literal. */
const EXACT_FORTY_HEX = /(?<![0-9a-fA-F])[0-9a-fA-F]{40}(?![0-9a-fA-F])/g

/** Every maximal hex run of ≥16 characters — used to REPORT a run longer than 40, so
 *  the 64-hex negative is named rather than silently unmatched. */
function hexRunsAtLeast16(text: string): string[] {
  return [...text.matchAll(/[0-9a-fA-F]{16,}/g)].map((m) => m[0])
}

function exactFortyHexLiterals(text: string): string[] {
  return [...new Set([...text.matchAll(EXACT_FORTY_HEX)].map((m) => m[0].toLowerCase()))]
}

/** ⟨`A-5`⟩ THE STRENGTHENED `digestCommand` LIMB: the command must carry EXACTLY ONE
 *  distinct 40-hex literal, and that literal must BE the pin. The as-filed bare
 *  `includes(pin)` was satisfied by a command carrying BOTH literals, and by a 64-hex
 *  string whose first 40 characters are the pin — in both cases the live command then
 *  fails with git's ambiguous-revision error while the register stayed green. */
function commandPinLimb(command: string, pin: string): string | null {
  const exact = exactFortyHexLiterals(command)
  const overlong = hexRunsAtLeast16(command).filter((run) => run.length > 40)
  if (exact.length !== 1) {
    return `DIGEST-COMMAND-LITERAL: \`foundation.digestCommand\` must carry EXACTLY ONE distinct 40-hex literal (the revision it was run at, §2 item 2); it carries ${exact.length}: [${exact.join(', ') || 'none'}]${
      overlong.length > 0 ? ` — and ${overlong.length} hex run(s) LONGER than 40 (${overlong.map((r) => `${r.slice(0, 8)}… ${r.length} hex`).join(', ')}), which name no commit git can resolve` : ''
    }`
  }
  if (exact[0] !== pin) {
    return `DIGEST-COMMAND-LITERAL: \`foundation.digestCommand\` carries the single 40-hex literal ${exact[0]}, which is NOT the pin ${pin} — a PARTIAL restatement (F-2)`
  }
  return null
}

/** ⟨`A-5` / `R1`⟩ THE ROW-LEVEL ORACLE — the SAME limbs the real row drives, factored so
 *  every control is a drive of the oracle rather than a proxy. The sites it drives are
 *  named exactly as `R1` requires: the three `PINNED_COMMIT` constants and
 *  `foundation.digestCommand`'s embedded revision; `foundation.measuredAt` is read by
 *  its OWN limb and is never folded into the 40-hex agreement. Every problem carries a
 *  LIMB TAG, so a control can assert WHICH limb fired. */
function restatementProblems(input: {
  pin: string
  declarations: Array<{ site: string; text: string }>
  command: string
  measuredAt: string
  declaredReading: string | null
}): string[] {
  const problems: string[] = []
  for (const declaration of input.declarations) {
    const read = constantDeclarationsIn(declaration.site, declaration.text)
    if (read.count !== 1) {
      problems.push(`DECLARATION-COUNT: ${declaration.site} carries ${read.count} \`PINNED_COMMIT\` declaration(s) — one file, ONE authority (F-12)`)
    }
    if (read.literal === null) problems.push(`CONSTANT-NOT-READ: ${read.how}`)
    else if (read.literal !== input.pin) {
      problems.push(`CONSTANT-LITERAL: ${declaration.site} carries ${read.literal}, which differs from the pin ${input.pin} — a PARTIAL restatement (F-1)`)
    }
  }
  const commandLimb = commandPinLimb(input.command, input.pin)
  if (commandLimb !== null) problems.push(commandLimb)
  const dateLimb = measuredAtLimb(input.measuredAt, input.declaredReading)
  if (dateLimb !== null) problems.push(dateLimb)
  return problems
}

// ---------------------------------------------------------------------------
// ⟨`A-6`⟩ THE BYTE-DRIVEN IDENTITY ORACLE. It takes BYTES and a regular-file FLAG —
// never a path alone — so every control drives the SAME limb the real sweep drives.
// ---------------------------------------------------------------------------
interface IdentitySubject {
  /** `src/shared/<name>.ts` — for the failure text only, never for the read */
  rel: string
  /** the vendored bytes; `null` when the vendored file is absent */
  vendoredBytes: Buffer | null
  /** the `lstat`-derived regular-file flag (`A-6`: `readFileSync` DEREFERENCES, so the
   *  symlink rule cannot be seen by a byte read) */
  vendoredIsRegularFile: boolean
  /** the blob's bytes at the RECORDED commit; `null` when the blob is absent */
  blobBytes: Buffer | null
  /** the git failure detail, so absence NAMES the path and the error */
  blobError?: string
  /** the manifest's declared md5 */
  declaredMd5: string
}

/** ⟨`A-6` / `F-3` — THE ROW THAT MUST NEVER BE RELAXED.⟩ This oracle compares the
 *  VENDORED bytes with the BLOB AT THE RECORDED COMMIT and with the manifest's declared
 *  md5. It is the only reader in this repo that does all three, which is why it catches
 *  the strongest surviving false-green: a foundation worktree checked out at the
 *  refreshed commit whose working-tree bytes were edited after checkout, with the
 *  vendored copies and the manifest md5 brought into agreement with the edit — `drift`
 *  reads `CLEAN` there, because neither of its comparisons reads the blob. */
function identityProblems(s: IdentitySubject): string[] {
  const problems: string[] = []
  if (!s.vendoredIsRegularFile) {
    problems.push(`[regular-file] ${s.rel}: the vendored path must be a REGULAR FILE (the symlink rule) — it is a symlink or otherwise not a regular file, and byte-identity is satisfied by a symlink that is not "copied in as source"`)
    return problems
  }
  if (s.vendoredBytes === null) {
    problems.push(`[absent] ${s.rel}: the vendored file does not exist — the pin's copy is missing`)
    return problems
  }
  const vendoredMd5 = md5(s.vendoredBytes)
  if (s.blobBytes === null) {
    problems.push(`[absent] ${s.rel}: NOT PRESENT at the recorded commit — \`git show <commit>:${s.rel}\` failed: ${s.blobError ?? '(no git error text)'}`)
    return problems
  }
  const blobMd5 = md5(s.blobBytes)
  if (vendoredMd5 !== s.declaredMd5) problems.push(`[vendored-md5] ${s.rel}: the vendored bytes' md5 is ${vendoredMd5} while the manifest declares ${s.declaredMd5}`)
  if (blobMd5 !== vendoredMd5) problems.push(`[blob≠vendored] ${s.rel}: the blob has md5 ${blobMd5} while the vendored bytes have ${vendoredMd5} — the refresh's byte-identity premise FAILS (STOP: §2)`)
  if (blobMd5 !== s.declaredMd5) problems.push(`[blob-md5] ${s.rel}: the blob has md5 ${blobMd5} while the manifest declares ${s.declaredMd5}`)
  return problems
}

/** The BLOB-ABSENCE oracle (`§4` row 3's second synthetic control), factored so the
 *  control can drive it over a FABRICATED module name: a module the recorded revision
 *  does not carry must fail and must NAME THE PATH. */
function blobAbsenceOracle(name: string, revision: string): string[] {
  const rel = `src/shared/${name}.ts`
  const blob = spawnSync('git', ['-C', FOUNDATION, 'show', `${revision}:${rel}`], { encoding: 'utf8' })
  if (blob.status === 0) return []
  return [`${rel}: NOT PRESENT at the recorded commit ${revision} — \`git -C ${FOUNDATION_DISPLAY} show ${revision}:${rel}\` failed with status ${String(blob.status)}: ${(blob.stderr ?? '').trim()}`]
}

/** The real subject for one module: the vendored bytes + flag, the blob at the RECORDED
 *  commit (or its absence, with the git error named), and the manifest's declared md5. */
function readIdentitySubject(name: string, declaredMd5: string, revision: string, vendoredOverride?: Buffer): IdentitySubject {
  const rel = `src/shared/${name}.ts`
  const vendoredPath = join(REPO_ROOT, 'src', 'shared', `${name}.ts`)
  let vendoredBytes: Buffer | null = null
  let vendoredIsRegularFile = false
  if (existsSync(vendoredPath)) {
    const st = lstatSync(vendoredPath)
    vendoredIsRegularFile = st.isFile()
    vendoredBytes = vendoredOverride ?? readFileSync(vendoredPath)
  }
  const blob = spawnSync('git', ['-C', FOUNDATION, 'show', `${revision}:${rel}`], { maxBuffer: 64 * 1024 * 1024 })
  const blobBytes = blob.status === 0 ? (blob.stdout as Buffer) : null
  const blobError = blob.status === 0 ? undefined : (blob.stderr ?? Buffer.alloc(0)).toString('utf8').trim()
  return { rel, vendoredBytes, vendoredIsRegularFile, blobBytes, blobError, declaredMd5 }
}

// ---------------------------------------------------------------------------
// ⟨`A-7` / `E-9`⟩ THE MONITOR'S BYTE-ONLY `CLEAN` — the SEAM, made VISIBLE. The oracle
// below is the honest CURRENT MINIMUM: it holds only when the reading carries the
// pin-arm disclaimer and makes NO revision-equality claim (a non-zero exit is accepted
// in its place, because a refusal claims nothing). IT IS NOT THE FIX: the monitor is
// `scripts/**`, which `§1.2` item 7 forbids this unit to touch, and the fix shape
// (a distinct byte-only label and/or refusing exit 0 without a revision read) belongs
// to the SEPARATE, NAMED gate `PD-VENDOR-DRIFT-REVISION-STATUS`.
// ---------------------------------------------------------------------------
function byteOnlySeamOracle(out: string, code: number): string | null {
  if (/EQUALS the manifest/i.test(out) || /revisionChecked\b[^\n]*\btrue\b/i.test(out)) {
    return `[pin-claim] the reading CLAIMS a revision equality while no revision was read: «${out.split('\n').slice(0, 3).join(' / ')}»`
  }
  if (code !== 0) return null
  if (!/DRIFT RESULT:/.test(out)) return `[no-reading] the drive took no reading at all (exit 0, no \`DRIFT RESULT:\` line): «${out.slice(0, 200)}»`
  if (!/NO revision reading was taken/i.test(out) && !/BYTE[- ]ONLY/i.test(out)) {
    return `[bare-pin-claim] the reading exits 0 and prints no byte-only disclaimer, so \`CLEAN\` is the whole story about the pin: «${out.split('\n')[0] ?? ''}»`
  }
  return null
}

// ---------------------------------------------------------------------------
// The temp-tree harness for the CLI drives: a temp "repo" carrying
// `scripts/foundation-drift.mjs` (a COPY, never the repo's file), a `node_modules`
// symlink, `vendor/foundation.lock.json`, `src/shared/<15>` and a `foundation/` sibling
// INSIDE the temp root (so the drive is hermetic and writes nothing under the
// adjacency). Every path it removes is a path it created.
// ---------------------------------------------------------------------------
interface TempRepo {
  root: string
  writeManifest(text: string): void
  writeVendored(name: string, bytes: string): void
  writeFoundation(name: string, bytes: string): void
  foundationDir(): string
  rm(): void
}

function makeTempRepo(): TempRepo {
  const root = mkdtempSync(join(tmpdir(), 'pd-pin-refresh-repo-'))
  for (const dir of ['scripts', 'vendor', 'src/shared', 'foundation/src/shared']) mkdirSync(join(root, dir), { recursive: true })
  if (existsSync(MONITOR_PATH)) writeFileSync(join(root, 'scripts', 'foundation-drift.mjs'), readFileSync(MONITOR_PATH))
  try {
    symlinkSync(join(REPO_ROOT, 'node_modules'), join(root, 'node_modules'), 'dir')
  } catch {
    /* node_modules is optional for a pure-node script */
  }
  return {
    root,
    writeManifest(text: string): void {
      writeFileSync(join(root, 'vendor', 'foundation.lock.json'), text)
    },
    writeVendored(name: string, bytes: string): void {
      writeFileSync(join(root, 'src', 'shared', `${name}.ts`), bytes)
    },
    writeFoundation(name: string, bytes: string): void {
      writeFileSync(join(root, 'foundation', 'src', 'shared', `${name}.ts`), bytes)
    },
    foundationDir(): string {
      return join(root, 'foundation')
    },
    rm(): void {
      rmSync(root, { recursive: true, force: true })
    },
  }
}

/** Run the monitor CLI with the temp repo as cwd. */
function runMonitorCli(repo: TempRepo): { code: number; out: string } {
  if (!existsSync(join(repo.root, 'scripts', 'foundation-drift.mjs'))) {
    return { code: -1, out: 'the monitor script was never written into the temp tree — the drive has no instrument' }
  }
  const r = spawnSync(process.execPath, ['scripts/foundation-drift.mjs'], { cwd: repo.root, encoding: 'utf8' })
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

/** A SYNTHETIC manifest whose every module's md5 is the digest of the synthetic
 *  vendored bytes, so a comparator drive is decided ONLY by the arm under test. Its
 *  `foundation.path` is `./foundation` — a sibling INSIDE a temp root — so every CLI
 *  drive is hermetic. */
function syntheticManifest(pin: string, body: (name: string) => string, foundationPath = './foundation', measuredAt = 'synthetic'): Record<string, unknown> {
  return {
    schema: 'foundation-lock/1',
    foundation: {
      path: foundationPath,
      remote: 'https://github.com/LittleKingsguard/Provident-Electron',
      ref: 'main',
      commit: pin,
      measuredAt,
      digestCommand: `git -C ${foundationPath} show ${pin}:src/shared/<name>.ts | md5sum`,
      byteIdentity: 'synthetic',
    },
    modules: pinnedFifteen().map((name) => ({
      name,
      source: `src/shared/${name}.ts`,
      vendored: `src/shared/${name}.ts`,
      md5: md5(body(name)),
      lineCount: 1,
      provenance: 'synthetic',
      proposalTableAgreement: 'REPRODUCED',
      excludedFromVendorSet: false,
      rowStatus: 'NONE (no wave owned yet)',
    })),
    moduleCount: 15,
  }
}

function bytesMap(body: (name: string) => string): Record<string, string> {
  return Object.fromEntries(pinnedFifteen().map((n) => [n, body(n)]))
}

function withTempDir<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  try {
    return fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** `§2` items 4–6 — a SYNTHETIC title text: a row TITLE carrying an abbreviated literal
 *  and NO declaration. `⟨A-3⟩` THIS synthetic text is the seventh-site control's SUBJECT
 *  (`D-12`): the register NEVER FREEZES A REAL FILE'S PROSE, so an honest refresh of a
 *  real title can never red this file. */
function synthesizedTitleText(abbreviated: string): string {
  return `it('§3.3 item 2 — foundation.commit equals the pinned revision ${abbreviated}', () => {\n})\n`
}

/** The abbreviation of a 40-hex literal, in the form the row titles use. */
function abbreviate(literal: string): string {
  return `${literal.slice(0, 8)}…${literal.slice(-6)}`
}

/** The seventh-site TRAP's reader: an abbreviated literal in a TITLE is PROSE, and the
 *  constant matcher must find NO declaration in a title-only text. */
function abbreviatedLiteralInATitle(text: string, abbreviated: string): boolean {
  const escaped = abbreviated.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escaped).test(text) && constantDeclarationsIn('⟨SYNTHETIC⟩ title-only text', text).count === 0
}

// ===========================================================================
// §4.1 row 1 — `P-IM-pd-pin-1` · `strat:pd-pin-manifest-vs-head`
//   THE MANIFEST'S PIN EQUALS THE ADJACENT TREE'S HEAD.
//   CURRENT (`§4.1`, amended by `A-10`/`A-7`): `7` = `1` real pair × `2` limbs
//   (`rev-parse` status, equality) + `1` MONITOR PIN-ARM COMPARATOR DRIVE + `4`
//   controls. `(bounded)` ON THE PRESENCE CONDITION: *"when the tree is present"* is a
//   PRECONDITION, so an absent/unreadable tree is `SKIPPED-as-FAILED` — the row FAILS
//   LOUDLY naming the path and the error. It NEVER skips and never passes vacuously
//   (`§3` item 1's `SKIPPED` row, `F-10`, `D-11`). The failure text names BOTH revisions
//   (`§6` item 2).
//   The controls: (c1) a synthetic manifest one hex character different, the POSITION
//   and REPLACEMENT drawn from the pinned LCG with the no-op draw GUARDED and REPORTED
//   (`A-10`); (c2) an INDEPENDENTLY PRODUCED revision read that must not be accepted;
//   (c3) a present, byte-equal, NON-git foundation tree driven through the monitor CLI
//   (`A-7`); (c4) the same against a BROKEN `.git`.
// ===========================================================================
describe('PD-VENDOR-PIN-REFRESH §4 P-IM-pd-pin-1 — the manifest’s pin equals the adjacent tree’s HEAD (strat:pd-pin-manifest-vs-head)', () => {
  it('P-IM-pd-pin-1 — the real HEAD read + the equality limb, the monitor’s own pin-arm comparator drive, the LCG-drawn one-hex control, an independent revision read, and the two non-git CLI controls (1 real pair × 2 limbs + 1 comparator drive + 4 controls = 7)', async () => {
    const run = newRun()
    const pinned = manifestCommit()
    let i = 0

    // ⟨limb 1⟩ the `rev-parse` STATUS — a real process, on the real tree. An absent or
    // unreadable tree is a COUNTEREXAMPLE here (the `SKIPPED-as-FAILED` arm): the row
    // fails loudly, names the path and the error, and never converts absence into a pass.
    const rev = treeRevision()
    attempt(run, i++, rev.status === 0 && rev.revision !== null && rev.revision !== '' ? null : `SKIPPED-as-FAILED [§3 item 1 / D-11]: ${rev.detail}`)

    // ⟨limb 2⟩ the EQUALITY — the full 40-hex pair, asserted as such. The message names
    // BOTH revisions, so a red reads as the pin fault it is, never as a collection error.
    const revision = rev.revision ?? ''
    attempt(
      run,
      i++,
      rev.revision === null
        ? `the equality limb has no subject: the tree's HEAD was not read (${rev.detail})`
        : pinEqualityOracle(pinned, revision),
    )

    // ⟨THE `1` COMPARATOR PIN-ARM DRIVE (`A-10`, `A-7`)⟩ — the monitor's OWN pin arm,
    // READ (never edited: `§1.2` item 7's amended annotation), driven with byte-equal
    // inputs and an EXPLICIT divergent `foundationRevision`. The attempt carries the
    // arm's own discrimination pair — CLEAN at the pin, NOT CLEAN off it — because a
    // single off-pin read would not show that the arm can read the pinned state at all.
    // THE AS-FILED CONTROLS DROVE A ONE-LINE `===` ORACLE INSTEAD, WHICH PROVED NOTHING
    // ABOUT THE INSTRUMENT.
    interface ComparatorReading {
      status: string
      reason?: string
      revisionChecked?: boolean
      differences?: Array<{ name: string; reason?: string }>
    }
    type Comparator = (input: {
      manifest: unknown
      vendoredBytes: Record<string, string> | null
      foundationBytes: Record<string, string> | null
      vendoredFlags?: Record<string, { symlink?: boolean }>
      foundationRevision?: string | null
    }) => ComparatorReading
    /** The comparator limb's OWN oracle, factored so its DISCRIMINATION is driven in the
     *  same attempt: the real pair (CLEAN at the pin, NOT CLEAN off it) must satisfy it,
     *  and two forgeries must NOT — an arm that reads `CLEAN` at byte-equal inputs at
     *  another revision, and an arm that fails the pinned state itself. */
    const comparatorPinArmOracle = (atPin: ComparatorReading, offPin: ComparatorReading, pin: string, divergent: string): string | null => {
      if (atPin.status !== 'CLEAN') {
        return `the pin arm does not read the declared CLEAN situation when the tree's revision IS the pin (read "${atPin.status}": ${String(atPin.reason ?? '')})`
      }
      if (offPin.status === 'CLEAN' || offPin.revisionChecked !== true) {
        return `the pin arm is REVISION-TOLERANT: byte-equal inputs at the divergent revision ${divergent} read "${offPin.status}" (revisionChecked ${String(offPin.revisionChecked)}) against the pin ${pin} — equal bytes at another commit are NOT the pinned state (R-7, D-3, F-4)`
      }
      return null
    }
    let compareFoundation: Comparator | null = null
    let comparatorDetail = ''
    try {
      const mod = (await import(/* @vite-ignore */ pathToFileURL(MONITOR_PATH).href)) as Record<string, unknown>
      const fn = mod.compareFoundation
      if (typeof fn === 'function') compareFoundation = fn as Comparator
      else comparatorDetail = 'the monitor exports no `compareFoundation` — the comparator drive has no instrument'
    } catch (e) {
      comparatorDetail = `the monitor could not be read at ${MONITOR_PATH}: ${(e as Error).message}`
    }
    const comparatorDrive = ((): string | null => {
      if (compareFoundation === null) {
        return `the monitor's own pin arm could not be driven: ${comparatorDetail} — the term is NOT executed, and it is reported rather than quietly dropped`
      }
      const body = (n: string): string => `${n}\n`
      const manifest = syntheticManifest(pinned, body)
      const bytes = bytesMap(body)
      const divergentDraw = drawnMutation(pinned, REGISTER_SEED ^ 0x5eed)
      const divergentRevision = divergentDraw.literal
      if (divergentRevision === pinned) return 'the comparator drive has no negative subject: the divergent-revision draw is the identity'
      // THE ORACLE'S OWN DISCRIMINATION, driven first: a tolerant forged reading and a
      // broken-at-pin forged reading MUST both be refused by the very limb the real pair
      // is then held against.
      const forgedTolerant = comparatorPinArmOracle({ status: 'CLEAN', revisionChecked: true }, { status: 'CLEAN', revisionChecked: false }, pinned, divergentRevision)
      if (forgedTolerant === null) return 'the comparator limb could not discriminate: it ACCEPTED a forged revision-tolerant reading (CLEAN at byte-equal inputs at another revision)'
      const forgedBrokenAtPin = comparatorPinArmOracle({ status: 'FAIL' }, { status: 'FAIL', revisionChecked: true }, pinned, divergentRevision)
      if (forgedBrokenAtPin === null) return 'the comparator limb could not discriminate: it ACCEPTED a forged reading that fails the pinned state itself'
      // THE NON-PINNED TEMP TREE (`A-7`): a REAL `git` tree at a commit that is NOT the
      // pin, whose fifteen committed bytes are EQUAL. Its own `rev-parse HEAD` is the
      // explicit `foundationRevision` the comparator is driven with, so the reading under
      // test is the audit's own construction: equal bytes, a different commit.
      const tempTreeRevision = withTempDir('pd-pin-refresh-nonpinned-', (dir): string => {
        const env = { ...process.env, GIT_AUTHOR_NAME: 'pd-pin-refresh', GIT_AUTHOR_EMAIL: 'pd-pin-refresh@example.invalid', GIT_COMMITTER_NAME: 'pd-pin-refresh', GIT_COMMITTER_EMAIL: 'pd-pin-refresh@example.invalid' }
        mkdirSync(join(dir, 'src', 'shared'), { recursive: true })
        for (const [name, value] of Object.entries(bytes)) writeFileSync(join(dir, 'src', 'shared', `${name}.ts`), value)
        const init = spawnSync('git', ['init', '-q', '.'], { cwd: dir, encoding: 'utf8', env })
        if (init.status !== 0) return ''
        if (spawnSync('git', ['add', '-A'], { cwd: dir, encoding: 'utf8', env }).status !== 0) return ''
        if (spawnSync('git', ['commit', '-q', '-m', 'equal bytes at a non-pinned commit'], { cwd: dir, encoding: 'utf8', env }).status !== 0) return ''
        const read = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8', env })
        const value = (read.stdout ?? '').trim()
        return read.status === 0 && /^[0-9a-f]{40}$/.test(value) ? value : ''
      })
      if (tempTreeRevision === '') return 'the non-pinned temp tree could not be built or its revision could not be read — the drive has no explicit divergent revision from a real tree'
      if (tempTreeRevision === pinned) return `the non-pinned temp tree reproduced the pin ${pinned} — the drive has no negative subject`
      const atPin = compareFoundation({ manifest, vendoredBytes: bytes, foundationBytes: bytes, foundationRevision: pinned })
      const atTempTree = compareFoundation({ manifest, vendoredBytes: bytes, foundationBytes: bytes, foundationRevision: tempTreeRevision })
      const atDrawnRevision = compareFoundation({ manifest, vendoredBytes: bytes, foundationBytes: bytes, foundationRevision: divergentRevision })
      return (
        comparatorPinArmOracle(atPin, atTempTree, pinned, tempTreeRevision) ??
        comparatorPinArmOracle(atPin, atDrawnRevision, pinned, divergentRevision)
      )
    })()
    attempt(run, i++, comparatorDrive)

    // ---- the FOUR CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----

    // ⟨CONTROL 1⟩ (`A-10`) a synthetic manifest whose `foundation.commit` is ONE HEX
    // CHARACTER different MUST fail the SAME oracle. The mutated POSITION and the
    // REPLACEMENT character are DRAWN from the pinned LCG — a family, never the as-filed
    // fixed position `5` — and the identity/no-op draw is GUARDED and REPORTED. The
    // synthetic manifest is round-tripped through a TEMP-DIR JSON file, so the control's
    // subject is a real artifact; the repo's manifest is only ever opened read-only.
    const mutation = drawnMutation(pinned, REGISTER_SEED)
    // eslint-disable-next-line no-console
    console.log(
      `PD-VENDOR-PIN-REFRESH A-10 draw: row-1 c1 mutation at LCG-drawn position ${mutation.position}, replacement '${mutation.replacement}' (no-op guard fired: ${mutation.guarded})`,
    )
    const control1 = withTempDir('pd-pin-refresh-manifest-', (dir): string | null => {
      if (mutation.literal === pinned) return 'CONTROL 1: the draw is the identity mutation — the control has no negative subject'
      const synthetic = syntheticManifest(mutation.literal, (n) => `${n}\n`)
      const syntheticPath = join(dir, 'foundation.lock.json')
      writeFileSync(syntheticPath, JSON.stringify(synthetic, null, 2))
      let syntheticPinned = ''
      try {
        syntheticPinned = String((JSON.parse(readFileSync(syntheticPath, 'utf8')) as { foundation: Record<string, unknown> }).foundation.commit ?? '')
      } catch (e) {
        return `CONTROL 1: the synthetic manifest could not be re-read: ${(e as Error).message}`
      }
      if (syntheticPinned !== mutation.literal) return `CONTROL 1: the synthetic manifest did not round-trip its LCG-drawn perturbation (${syntheticPinned})`
      if (pinEqualityOracle(syntheticPinned, pinned) === null) {
        return `CONTROL 1 could not discriminate: the oracle ACCEPTED the synthetic manifest's ${syntheticPinned} as ${pinned}`
      }
      if (pinEqualityOracle(pinned, pinned) !== null) return 'CONTROL 1 could not discriminate: the oracle rejects the pin against ITSELF, so the negative reading is vacuous'
      return null
    })
    attempt(run, i++, control1)

    // ⟨CONTROL 2⟩ a SECOND, INDEPENDENTLY PRODUCED revision read — a fresh `git init`
    // repo in a temp dir, committed and `rev-parse`d — MUST NOT be accepted as the pin.
    const control2 = withTempDir('pd-pin-refresh-revision-', (dir): string | null => {
      const env = { ...process.env, GIT_AUTHOR_NAME: 'pd-pin-refresh', GIT_AUTHOR_EMAIL: 'pd-pin-refresh@example.invalid', GIT_COMMITTER_NAME: 'pd-pin-refresh', GIT_COMMITTER_EMAIL: 'pd-pin-refresh@example.invalid' }
      const init = spawnSync('git', ['init', '-q', '.'], { cwd: dir, encoding: 'utf8', env })
      if (init.status !== 0) return `CONTROL 2: \`git init\` failed in ${dir}: ${(init.stderr ?? '').trim()}`
      writeFileSync(join(dir, 'probe.txt'), 'an independently produced revision\n')
      const add = spawnSync('git', ['add', 'probe.txt'], { cwd: dir, encoding: 'utf8', env })
      if (add.status !== 0) return `CONTROL 2: \`git add\` failed: ${(add.stderr ?? '').trim()}`
      const commit = spawnSync('git', ['commit', '-q', '-m', 'the control revision'], { cwd: dir, encoding: 'utf8', env })
      if (commit.status !== 0) return `CONTROL 2: \`git commit\` failed: ${(commit.stderr ?? '').trim()}`
      const read = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8', env })
      const syntheticRevision = (read.stdout ?? '').trim()
      if (read.status !== 0 || !/^[0-9a-f]{40}$/.test(syntheticRevision)) {
        return `CONTROL 2: the independent revision read yielded "${syntheticRevision}" (status ${String(read.status)})`
      }
      if (syntheticRevision === pinned) return `CONTROL 2 could not discriminate: the independent repo reproduced the pin ${pinned}`
      const accepted = pinEqualityOracle(pinned, syntheticRevision) === null
      return accepted ? `CONTROL 2 could not discriminate: the oracle ACCEPTED the independently produced revision ${syntheticRevision} as the pin ${pinned}` : null
    })
    attempt(run, i++, control2)

    // ⟨CONTROL 3 / 4⟩ (`A-7`, `E-9`) THE MONITOR CLI over a foundation tree that IS
    // present, whose fifteen bytes ARE equal, and which is NOT a git repository (c3) and
    // whose `.git` is BROKEN (c4). The oracle cannot pass on a bare pin claim: the
    // reading must carry the byte-only disclaimer and make NO revision-equality claim.
    // THE SEAM IS RECORDED, NOT FIXED — the monitor's fix is the SEPARATE, NAMED GATE
    // `PD-VENDOR-DRIFT-REVISION-STATUS` (the monitor is `scripts/**`, outside this unit’s
    // change set: `§1.2` item 7).
    const seamDrive = (brokenGit: boolean): string | null => {
      const repo = makeTempRepo()
      try {
        const body = (n: string): string => `${n}\n`
        repo.writeManifest(JSON.stringify(syntheticManifest(pinned, body), null, 2))
        for (const name of pinnedFifteen()) {
          repo.writeVendored(name, body(name))
          repo.writeFoundation(name, body(name))
        }
        const foundationDir = repo.foundationDir()
        let gitDiagnosis = 'no `.git` present at all (the tree is NOT a git repository)'
        if (brokenGit) {
          // a `.git` FILE carrying garbage: git reads it as a malformed gitfile, which is
          // NOT the "not a repository" cause the disclaimer asserts — the A-7 limb (a).
          writeFileSync(join(foundationDir, '.git'), 'this is not a gitfile\n')
          const probe = spawnSync('git', ['-C', foundationDir, 'rev-parse', 'HEAD'], { encoding: 'utf8' })
          gitDiagnosis = (probe.stderr ?? '').trim()
          if (probe.status === 0) return `CONTROL ${brokenGit ? 4 : 3} could not be driven: the broken-\`.git\` fixture still reads a revision (${(probe.stdout ?? '').trim()})`
          if (/not a git repository/i.test(gitDiagnosis) && !/invalid gitfile|fatal: (bad|corrupt)/i.test(gitDiagnosis)) {
            return `CONTROL 4 could not be driven: the fixture's git diagnosis «${gitDiagnosis}» is the MISSING-repository case, not the BROKEN-\`.git\` case it must exercise`
          }
        }
        const { code, out } = runMonitorCli(repo)
        const seam = byteOnlySeamOracle(out, code)
        if (seam !== null) return `CONTROL ${brokenGit ? 4 : 3} — the reading at this state is not a byte-only CLEAN with its disclaimer: ${seam}; git diagnosis: «${gitDiagnosis}»; exit ${code}`
        // …and the ORACLE'S OWN DISCRIMINATION, driven in the same attempt over two
        // forgeries: a `CLEAN` report with the disclaimer stripped (a BARE pin claim) and
        // a `CLEAN` report that asserts a revision equality. Both MUST be rejected, else
        // the limb above is vacuous.
        const forgedBare = `DRIFT RESULT: 15 checks, 0 differences — CLEAN\n  15 distinct vendored file(s) are byte-equal to this repo's copies.\n`
        const forgedClaim = `DRIFT RESULT: 15 checks, 0 differences — CLEAN\n  PIN ARM: the tree's own \`rev-parse HEAD\` was read and EQUALS the manifest's \`foundation.commit\`.\n`
        if (byteOnlySeamOracle(forgedBare, 0) === null) return `CONTROL ${brokenGit ? 4 : 3} could not discriminate: the oracle ACCEPTED a bare \`CLEAN\` with no disclaimer`
        if (byteOnlySeamOracle(forgedClaim, 0) === null) return `CONTROL ${brokenGit ? 4 : 3} could not discriminate: the oracle ACCEPTED a \`CLEAN\` that claims a revision equality`
        return null
      } finally {
        repo.rm()
      }
    }
    attempt(run, i++, seamDrive(false))
    attempt(run, i++, seamDrive(true))
    // eslint-disable-next-line no-console
    console.log(
      'PD-VENDOR-PIN-REFRESH A-7/E-9 SEAM (recorded, NOT fixed here): a foundation tree present with the pinned bytes and no readable `.git` reads `CLEAN`, exit 0, with the byte-only disclaimer. The fix is the SEPARATE, NAMED gate PD-VENDOR-DRIFT-REVISION-STATUS (a byte-only label and/or refusing exit 0 without a revision read); the monitor is scripts/**, which §1.2 item 7 forbids this unit to touch.',
    )

    finish('P-IM-pd-pin-1', run)
  })
})

// ===========================================================================
// §4.1 row 2 — `P-SM-pd-pin-2` · `strat:pd-pin-four-site-agreement`
//   THE PIN IS RESTATED IN ALL THE SITES THIS ROW DRIVES, ATOMICALLY.
//   CURRENT (`§4.1`, amended by `A-4`/`A-5`/`R1`/`R2`):
//   `16` = `3` constant reads + `3` per-file DECLARATION-COUNT terms + `1`
//   `digestCommand` limb (EXACTLY ONE distinct 40-hex literal, equal to the pin) + `1`
//   `measuredAt` limb + `2` LCG-drawn joint mutations + `6` controls.
//   THE SITES, NAMED (remand `R1`): `tests/pd-vendor-set.test.ts` ·
//   `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts` `PINNED_COMMIT`
//   · `foundation.digestCommand`'s embedded revision — with `foundation.measuredAt` read
//   by its OWN limb and NEVER folded into the 40-hex agreement. The as-filed prose said
//   "all four sites", which misstated the set; that phrasing is SUPERSEDED here.
//   NO `(bounded)`: the site set is closed. The row asserts AGREEMENT, never a specific
//   literal — `F-1`/`F-2`/`F-12`'s regression guard.
// ===========================================================================
describe('PD-VENDOR-PIN-REFRESH §4 P-SM-pd-pin-2 — the pin is restated in all the sites this row drives, atomically (strat:pd-pin-four-site-agreement)', () => {
  it('P-SM-pd-pin-2 — three `PINNED_COMMIT` constants, three declaration-count terms, the exactly-one-40-hex `digestCommand` limb, the `measuredAt` limb, two LCG-drawn joint mutations and six controls (3 + 3 + 1 + 1 + 2 + 6 = 16)', () => {
    const run = newRun()
    let i = 0

    const pinned = manifestCommit()
    const command = digestCommand()
    const declaredReadingResult = declaredRefreshReading()
    const declaredReading = declaredReadingResult.reading
    const measuredAt = manifestMeasuredAt()

    // ⟨the `3` constant reads + the `3` DECLARATION-COUNT terms (`A-5`, `F-12`)⟩ each
    // file is read ONCE as source text and drives TWO terms: which literal its
    // `PINNED_COMMIT` carries, and HOW MANY `PINNED_COMMIT` declarations it carries. As
    // filed, the count sat outside the declared domain, so a SECOND declaration carrying
    // a different literal was invisible.
    const reads = CONSTANT_SITES.map((s) => ({ ...s, read: constantDeclarationsIn(s.site, readText(s.path)) }))
    for (const r of reads) {
      attempt(
        run,
        i++,
        r.read.literal === null
          ? r.read.how
          : r.read.literal === pinned
            ? null
            : `${r.site}: \`PINNED_COMMIT\` is ${r.read.literal} while the manifest's \`foundation.commit\` is ${pinned} — a PARTIAL restatement (F-1): one site still names a different revision`,
      )
    }
    for (const r of reads) {
      attempt(
        run,
        i++,
        r.read.count === 1
          ? null
          : `${r.site}: carries ${r.read.count} \`PINNED_COMMIT\` declaration(s) — one file, ONE authority; a second declaration is a fail-state (F-12)`,
      )
    }

    // ⟨the `1` `digestCommand` limb (`A-5`)⟩ EXACTLY ONE distinct 40-hex literal, equal
    // to the pin. The cross-check tail legitimately names the fifteen PATHS; the revision
    // it names must be THE PIN — and it must be the ONLY commit-shaped literal there.
    attempt(run, i++, commandPinLimb(command, pinned))

    // ⟨the `1` `measuredAt` limb (`A-4`, `D-13`, `A-12`, `F-13`)⟩ present · `YYYY-MM-DD` ·
    // equal to the contract's declared refresh reading, READ OUT OF the anchored `§4`
    // region. The ONE attempt carries the limb's DISCRIMINATION TOO: an absent value, an
    // ill-formed value and an UNCOUPLED date must each be RED, and the declared value must
    // be ACCEPTED — otherwise the limb would be green about a date it never read. Nothing
    // here reads a clock and nothing here freezes a UTC day: the refresh's LOCAL/REPO day
    // is authoritative (`A-12`).
    const measuredAtAttempt = ((): string | null => {
      const real = measuredAtLimb(measuredAt, declaredReading)
      if (real !== null) return real
      if (declaredReading === null) return `MEASURED-AT: the contract declares no refresh reading (${declaredReadingResult.detail}) — the limb has no declared subject and can never discriminate`
      const uncoupled = declaredReading === '1970-01-01' ? '1970-01-02' : '1970-01-01'
      const negatives: Array<{ label: string; value: string; declared: string | null }> = [
        { label: 'an ABSENT date', value: '', declared: declaredReading },
        { label: 'a NON-`YYYY-MM-DD` date', value: '29-09-2026', declared: declaredReading },
        { label: 'an UNCOUPLED date', value: uncoupled, declared: declaredReading },
        { label: 'a date with NO declared reading to compare against', value: measuredAt, declared: null },
      ]
      for (const negative of negatives) {
        if (measuredAtLimb(negative.value, negative.declared) === null) {
          return `MEASURED-AT could not discriminate: the limb ACCEPTED ${negative.label} ("${negative.value}" against declared ${String(negative.declared)}) — a corrupted date would leave the register green (F-13)`
        }
      }
      return null
    })()
    attempt(run, i++, measuredAtAttempt)

    // ---- the synthetic corpus the remaining terms drive ----
    /** A synthetic CONSTANT SITE's source text, built from its parts so this file's own
     *  bytes carry no `PINNED_COMMIT` declaration of their own. `second` adds a SECOND
     *  declaration (the `F-12` negative). */
    const syntheticConstantText = (literal: string, second?: string): string =>
      'const PINNED_' + "COMMIT = '" + literal + "'\n" + (second === undefined ? '' : 'const PINNED_' + "COMMIT = '" + second + "'\n")
    const syntheticSiteName = (k: number): string => `⟨SYNTHETIC⟩ constant site ${k + 1}`
    const syntheticCommand = (literal: string): string => `git -C ${FOUNDATION_DISPLAY} show ${literal}:src/shared/<name>.ts | md5sum`
    const corpus = (literals: [string, string, string], commandLiteral: string, second?: { at: number; literal: string }): {
      declarations: Array<{ site: string; text: string }>
      command: string
    } => ({
      declarations: literals.map((literal, k) => ({
        site: syntheticSiteName(k),
        text: syntheticConstantText(literal, second !== undefined && second.at === k ? second.literal : undefined),
      })),
      command: syntheticCommand(commandLiteral),
    })
    const driveCorpus = (c: { declarations: Array<{ site: string; text: string }>; command: string }, pin: string, at = measuredAt): string[] =>
      restatementProblems({ pin, declarations: c.declarations, command: c.command, measuredAt: at, declaredReading })

    // ⟨the `2` LCG-DRAWN JOINT MUTATIONS (`A-5`, `A-10`)⟩ one of the synthetic sites’
    // literal AND/OR the command’s literal is mutated at an LCG-drawn position and
    // replacement, and the pair is driven together. Each joint mutation is driven across
    // the `1`/`2`/`3`-SITE CARDINALITY LADDER so the audit's "failing at every
    // cardinality" is exercised (`6` joint-mutation drives inside the `2` declared
    // terms — the term counts the two JOINT MUTATIONS, and this sentence says so).
    let state = REGISTER_SEED
    const cardinalityReport: string[] = []
    for (let draw = 0; draw < 2; draw++) {
      const steps: Array<{ cardinality: number; detail: string }> = []
      let ce: string | null = null
      for (let cardinality = 1; cardinality <= 3 && ce === null; cardinality++) {
        const base: [string, string, string] = [pinned, pinned, pinned]
        const details: string[] = []
        for (let k = 0; k < cardinality; k++) {
          if (k === 0) {
            const m = drawnMutation(pinned, state)
            state = m.state
            if (m.literal === pinned) {
              ce = `LCG draw ${draw + 1}: the site mutation is the identity — the joint mutation has no negative subject`
              break
            }
            base[k] = m.literal
            details.push(`site ${k + 1}: position ${m.position} → '${m.replacement}'${m.guarded ? ' (no-op guard fired)' : ''}`)
          } else {
            // the remaining cardinality steps reuse distinct LCG-drawn positions on the
            // SAME literal, so each step is a distinct multi-site mutation
            const m = drawnMutation(base[k - 1]!, state)
            state = m.state
            base[k] = m.literal
            details.push(`site ${k + 1}: position ${m.position} → '${m.replacement}'${m.guarded ? ' (no-op guard fired)' : ''}`)
          }
        }
        if (ce !== null) break
        const commandMutation = draw === 1 && cardinality === 3 ? drawnMutation(pinned, state) : null
        if (commandMutation !== null) state = commandMutation.state
        const commandLiteral = commandMutation === null ? pinned : commandMutation.literal
        const problems = driveCorpus(corpus(base, commandLiteral), pinned)
        if (problems.length === 0) {
          ce = `LCG draw ${draw + 1}, cardinality ${cardinality}: the oracle ACCEPTED a joint mutation (sites: ${details.join('; ')}${commandMutation !== null ? `; command literal → ${commandLiteral}` : ''}) — the agreement limb is vacuous at this cardinality`
        }
        steps.push({ cardinality, detail: details.join('; ') + (commandMutation !== null ? '; command literal mutated' : '') })
      }
      cardinalityReport.push(`draw ${draw + 1}: cardinalities ${steps.map((s) => s.cardinality).join(',')}`)
      attempt(run, i++, ce)
    }
    // eslint-disable-next-line no-console
    console.log(`PD-VENDOR-PIN-REFRESH A-5/A-10 joint mutations: ${cardinalityReport.join(' · ')} (6 joint-mutation drives inside the 2 declared terms)`)

    // ---- the SIX CONTROLS ----

    // ⟨CONTROL 1⟩ a CONSTANT site carrying ONE DIFFERENT CHARACTER MUST fail the same
    // oracle — driven through the REAL matcher over a synthetic source text.
    const divergent = drawnMutation(pinned, REGISTER_SEED ^ 0x1234)
    const control1 = (() => {
      if (divergent.literal === pinned) return 'CONTROL 1: the perturbation is the identity — the oracle has no negative subject'
      const read = pinnedConstantIn(syntheticSiteName(0), syntheticConstantText(divergent.literal))
      if (read.literal !== divergent.literal) return `CONTROL 1 could not be driven: the matcher read ${String(read.literal)} from a synthetic text carrying ${divergent.literal}`
      const problems = driveCorpus(corpus([divergent.literal, pinned, pinned], pinned), pinned)
      if (problems.length === 0) return `CONTROL 1 could not discriminate: the oracle ACCEPTED a site carrying ${divergent.literal} against the pin ${pinned}`
      return problems.some((p) => p.startsWith('CONSTANT-LITERAL')) ? null : `CONTROL 1 could not discriminate on the limb it names: the oracle reported «${problems.join(' | ')}»`
    })()
    attempt(run, i++, control1)

    // ⟨CONTROL 2⟩ the SAME oracle MUST ACCEPT a corpus in which EVERY site this row
    // drives carries a THIRD, ARBITRARY 40-hex value — so the row asserts AGREEMENT,
    // never a specific literal. The subject is a synthetic corpus; the repo's own files
    // are never rewritten and never driven with a divergent constant (`§1.2` item 5 /
    // `§6` item 3: the landed rows are never relaxed).
    const third = drawnMutation(drawnMutation(pinned, 7).literal, 11).literal
    const control2 = (() => {
      if (third === pinned || third === divergent.literal) return 'CONTROL 2: the third value is not distinct — the control has no subject'
      const accepted = driveCorpus(corpus([third, third, third], third), third)
      if (accepted.length > 0) return `CONTROL 2 could not discriminate: the oracle REJECTED a mutually consistent third value ${third} — ${accepted.join(' | ')}`
      // …and the AGREEMENT limb, the other way: ONE site moved off the third value MUST
      // be rejected by the same oracle, so the limb is shown to be load-bearing.
      const rejected = driveCorpus(corpus([third, divergent.literal, third], third), third)
      return rejected.some((p) => p.startsWith('CONSTANT-LITERAL'))
        ? null
        : `CONTROL 2 could not discriminate: the oracle accepted a site carrying ${divergent.literal} against the third value ${third} — the agreement limb is vacuous`
    })()
    attempt(run, i++, control2)

    // ⟨CONTROL 3⟩ and ⟨CONTROL 4⟩ (`A-5`/`R2`, `F-12`) a source text carrying TWO
    // `PINNED_COMMIT` declarations MUST fail — in EACH ORDER: `correct-first` (the first
    // declaration is the pin, the second is divergent) and `divergent-first`. The
    // correct-first order is the one the as-filed row could NOT see: its literal limb
    // matched while a second authority disagreed. Each control also shows the SAME text
    // with the second declaration removed IS accepted, so the count limb is load-bearing.
    const twoDeclarationControl = (order: 'correct-first' | 'divergent-first'): string | null => {
      const first = order === 'correct-first' ? pinned : divergent.literal
      const second = order === 'correct-first' ? divergent.literal : pinned
      const declarations = [
        { site: syntheticSiteName(0), text: syntheticConstantText(first, second) },
        { site: syntheticSiteName(1), text: syntheticConstantText(pinned) },
        { site: syntheticSiteName(2), text: syntheticConstantText(pinned) },
      ]
      const problems = restatementProblems({ pin: pinned, declarations, command: syntheticCommand(pinned), measuredAt, declaredReading })
      if (!problems.some((p) => p.startsWith('DECLARATION-COUNT'))) {
        return `CONTROL (${order}) could not discriminate: two \`PINNED_COMMIT\` declarations did NOT red the count limb; the oracle reported «${problems.join(' | ') || 'nothing'}»`
      }
      const accepted = driveCorpus(corpus([pinned, pinned, pinned], pinned), pinned)
      return accepted.length === 0
        ? null
        : `CONTROL (${order}) could not be driven: the same corpus WITHOUT the second declaration is rejected — «${accepted.join(' | ')}»`
    }
    attempt(run, i++, twoDeclarationControl('correct-first'))
    attempt(run, i++, twoDeclarationControl('divergent-first'))

    // ⟨CONTROL 5⟩ (`A-5`) a command carrying BOTH literals MUST fail: the bare
    // `includes(pin)` the row used to carry was satisfied by exactly this text, while the
    // live command then fails with git's ambiguous-revision error.
    const control5 = (() => {
      const other = drawnMutation(pinned, 23).literal
      const bothLiterals = `git -C ${FOUNDATION_DISPLAY} show ${pinned}:src/shared/<name>.ts || git -C ${FOUNDATION_DISPLAY} show ${other}:src/shared/<name>.ts | md5sum`
      const problems = driveCorpus({ ...corpus([pinned, pinned, pinned], pinned), command: bothLiterals }, pinned)
      if (!problems.some((p) => p.startsWith('DIGEST-COMMAND-LITERAL'))) {
        return `CONTROL 5 could not discriminate: a command carrying BOTH literals (${pinned} and ${other}) did not red the exactly-one-literal limb; the oracle reported «${problems.join(' | ') || 'nothing'}»`
      }
      if (driveCorpus(corpus([pinned, pinned, pinned], pinned), pinned).length > 0) return 'CONTROL 5 could not be driven: the single-literal command is itself rejected'
      return null
    })()
    attempt(run, i++, control5)

    // ⟨CONTROL 6⟩ (`A-5`) a 64-HEX string whose FIRST 40 characters ARE the pin MUST
    // fail: no commit git can resolve is named, and a boundary-free scan would have read
    // the first 40 characters as the pin.
    const control6 = (() => {
      const sixtyFour = `${pinned}${'0123456789abcdef01234567'}`
      if (sixtyFour.length !== 64 || !sixtyFour.startsWith(pinned)) return 'CONTROL 6: the 64-hex fixture is not the declared shape — the control has no subject'
      const problems = driveCorpus({ ...corpus([pinned, pinned, pinned], pinned), command: `git -C ${FOUNDATION_DISPLAY} show ${sixtyFour}:src/shared/<name>.ts | md5sum` }, pinned)
      if (!problems.some((p) => p.startsWith('DIGEST-COMMAND-LITERAL'))) {
        return `CONTROL 6 could not discriminate: a 64-hex literal whose first 40 characters are the pin did not red the limb; the oracle reported «${problems.join(' | ') || 'nothing'}»`
      }
      if (exactFortyHexLiterals(sixtyFour).length !== 0) return 'CONTROL 6 could not be driven: the boundary-bounded scan read a 40-hex literal out of a 64-hex run'
      return null
    })()
    attempt(run, i++, control6)

    // ⟨the SEVENTH-SITE TRAP (`§2` items 4–6), DRIVEN — RE-ANCHORED BY `A-3`⟩ a title is
    // PROSE, never a site. THE SUBJECT IS A SYNTHETIC TITLE TEXT ALONE (`D-12`): this
    // file no longer asserts anything about a REAL file's prose, so an honest title
    // refresh cannot red this register. Both the superseded and the refreshed
    // abbreviations are driven; the only real-file limb kept is the DECLARATION COUNT.
    const supersededAbbreviation = abbreviate('8f193a8d1446ed1e64c4ab6c569941e988f82459')
    const refreshedAbbreviation = abbreviate(pinned)
    expect(
      abbreviatedLiteralInATitle(synthesizedTitleText(supersededAbbreviation), supersededAbbreviation),
      '§2 items 4–6 / A-3: a SYNTHETIC row TITLE carrying the superseded abbreviated literal is PROSE — the constant matcher must find no declaration in a title-only text',
    ).toBe(true)
    expect(
      abbreviatedLiteralInATitle(synthesizedTitleText(refreshedAbbreviation), refreshedAbbreviation),
      '§2 items 4–6 / A-3: the REFRESHED abbreviation in a title is PROSE too — the control is not tied to any one literal, so a title refresh can never red it',
    ).toBe(true)
    expect(
      abbreviatedLiteralInATitle(synthesizedTitleText(refreshedAbbreviation) + syntheticConstantText(pinned), refreshedAbbreviation),
      '§2 items 4–6 / A-3: the same reader over a text that carries the abbreviation in a TITLE **and** a declaration must NOT report "prose only" — the limb discriminates a title from a declaration',
    ).toBe(false)
    for (const r of reads) {
      expect(
        r.read.count,
        `§1.1 item 4 / A-5: ${r.site} carries EXACTLY ONE \`PINNED_COMMIT\` CONSTANT DECLARATION (its count is declared as own bounded term above)`,
      ).toBe(1)
    }

    finish('P-SM-pd-pin-2', run)
  })
})

// ===========================================================================
// §4.1 row 3 — `P-TP-pd-pin-3` · `strat:pd-pin-refreshed-blob-identity`
//   THE BYTE-IDENTITY CLAIM SURVIVES THE REFRESH: at the RECORDED revision, each of the
//   fifteen modules is byte-equal to that revision's blob AND its md5 equals the
//   manifest's declared md5.
//   CURRENT (`§4.1`, amended by `A-6`): `21` = the fifteen modules × `1` (blob equality +
//   manifest-md5 equality, taken together in one attempt) + `4` controls (perturbed
//   BYTES; an absent blob naming the path; a SYMLINKED fixture driven through the
//   oracle's regular-file limb; a PRESENT-BUT-DIFFERING blob) + `2` LCG-drawn
//   PERTURBATION drives. NO `(bounded)`: the set is the pin's own fifteen, matched
//   exactly.
//   ⟨THE ONE ROW THAT MUST NEVER BE RELAXED.⟩ It is the only reader in this repo that
//   compares `git show <recorded commit>:src/shared/<name>.ts` against the VENDORED bytes
//   AND against the manifest's declared md5, and it is therefore the row that catches the
//   strongest surviving false-green: a worktree at the refreshed commit whose
//   working-tree bytes were edited after checkout, with the vendored copies and the
//   manifest brought into agreement — `drift` reads `CLEAN` there, because neither of its
//   comparisons reads the blob. Its controls are brought UP to its importance, never down.
// ===========================================================================
describe('PD-VENDOR-PIN-REFRESH §4 P-TP-pd-pin-3 — the fifteen are byte-equal to the recorded revision’s blobs and to the manifest’s md5s (strat:pd-pin-refreshed-blob-identity)', () => {
  it('P-TP-pd-pin-3 — fifteen modules × (blob equality + manifest md5 equality), four byte-driven controls and two LCG-drawn perturbation re-drives (15 × 1 + 4 + 2 = 21)', () => {
    const run = newRun()
    let i = 0

    const commit = manifestCommit()
    const modules = readManifest().modules as Array<Record<string, unknown>>
    const declaration = new Map<string, string>()
    for (const m of modules) declaration.set(String(m.name), String(m.md5 ?? ''))
    const fifteen = modules.map((m) => String(m.name))
    expect(fifteen.length, '§4 row 3: the pin’s domain is the manifest’s own fifteen').toBe(15)

    // §3 item 3's subject — the RECORDED commit's blob. A tree that cannot be read is a
    // COUNTEREXAMPLE naming the path and the error: absence is never a pass (`D-11`).
    const rev = treeRevision()
    const treeReadable = rev.status === 0 && rev.revision !== null
    if (!treeReadable) {
      attempt(run, 0, `the recorded revision ${commit} cannot be read from the adjacency: ${rev.detail} — the row FAILS LOUDLY rather than reporting bytes it did not compare`)
    }

    /** Drive the byte-driven identity oracle for one module against the RECORDED commit. */
    const drive = (name: string, vendoredOverride?: Buffer): string | null => {
      const declared = declaration.get(name)
      if (declared === undefined || !/^[0-9a-f]{32}$/.test(declared)) return `src/shared/${name}.ts: the manifest carries no 32-hex declared md5 for "${name}"`
      return identityProblems(readIdentitySubject(name, declared, commit, vendoredOverride)).join(' | ') || null
    }

    if (treeReadable) {
      // ⟨the `15` module attempts⟩
      for (const name of fifteen) attempt(run, i++, drive(name))

      // ---- the FOUR CONTROLS (each drives the SAME oracle the sweep drives: `A-6`) ----
      const probe = fifteen[0]!
      const probeDeclared = declaration.get(probe)!

      // ⟨CONTROL 1⟩ (`A-6`, re-derived) a module text perturbed by ONE BYTE, driven
      // THROUGH THE ORACLE — the as-filed control re-derived `md5(perturbed) !== declared`,
      // which tested `md5()` and not the oracle. The report must carry the
      // md5-inequality limb; the unperturbed subject must still hold, so the pair
      // discriminates.
      const control1 = (() => {
        const real = readFileSync(join(REPO_ROOT, 'src', 'shared', `${probe}.ts`))
        const index = Math.max(0, real.length - 2)
        const perturbed = Buffer.from(real)
        perturbed[index] = perturbed[index] === 0x0a ? 0x20 : perturbed[index]! ^ 0x01
        if (perturbed.equals(real)) return `CONTROL 1: the one-byte perturbation of ${probe} did not change the bytes`
        const problems = drive(probe, perturbed)
        if (problems === null) return `CONTROL 1 could not discriminate: the oracle ACCEPTED perturbed vendored bytes for ${probe}`
        if (!problems.includes('[vendored-md5]')) {
          return `CONTROL 1 could not discriminate on the md5-inequality limb: the oracle reported «${problems}»`
        }
        return drive(probe) === null ? null : `CONTROL 1 could not be driven: the UNPERTURBED subject for ${probe} is itself rejected — «${String(drive(probe))}»`
      })()
      attempt(run, i++, control1)

      // ⟨CONTROL 2⟩ a module MISSING at the recorded revision MUST fail, NAMING THE PATH.
      // The subject is a FABRICATED module name, so the limb is driven without touching
      // the vendored set (RETAINED as filed: it is its own oracle).
      const control2 = (() => {
        const absentName = '__pd_pin_refresh_absent_module__'
        const limb = blobAbsenceOracle(absentName, commit)
        if (limb.length === 0) return `CONTROL 2 could not discriminate: the oracle reported NO problem for the absent blob src/shared/${absentName}.ts at ${commit}`
        return limb.some((p) => p.includes(`src/shared/${absentName}.ts`)) ? null : `CONTROL 2 could not discriminate: the oracle did not NAME the absent path; it reported «${limb.join(' | ')}»`
      })()
      attempt(run, i++, control2)

      // ⟨CONTROL 3⟩ (`A-6`) a SYMLINKED fixture driven through the ORACLE'S OWN
      // regular-file limb — the as-filed control asserted a bare `lstatSync()` of a temp
      // symlink, a proxy. The symlink is created in the OS temp area and its dereferenced
      // bytes are EQUAL, which is exactly why no byte read can see it.
      const control3 = withTempDir('pd-pin-refresh-symlink-', (dir): string | null => {
        const link = join(dir, 'link.ts')
        try {
          symlinkSync(join(REPO_ROOT, 'src', 'shared', `${probe}.ts`), link)
        } catch (e) {
          return `CONTROL 3: the symlink could not be created in ${dir}: ${(e as Error).message}`
        }
        if (!lstatSync(link).isSymbolicLink()) return 'CONTROL 3: the created path is NOT reported as a symlink — the control has no subject'
        const real = readIdentitySubject(probe, probeDeclared, commit)
        const symlinked: IdentitySubject = { ...real, vendoredBytes: readFileSync(link), vendoredIsRegularFile: lstatSync(link).isFile() }
        const problems = identityProblems(symlinked)
        if (!problems.some((p) => p.startsWith('[regular-file]'))) {
          return `CONTROL 3 could not discriminate: the oracle did not fire its regular-file limb for a symlinked fixture; it reported «${problems.join(' | ') || 'nothing'}»`
        }
        // …and the same BYTES as a REGULAR FILE pass the limb, so the flag (never the
        // bytes) is what discriminates.
        const asRegular: IdentitySubject = { ...symlinked, vendoredIsRegularFile: true }
        const regularProblems = identityProblems(asRegular)
        return regularProblems.length === 0
          ? null
          : `CONTROL 3 could not be driven: the same bytes with the regular-file flag set are rejected — «${regularProblems.join(' | ')}»`
      })
      attempt(run, i++, control3)

      // ⟨CONTROL 4⟩ (`A-6`, NEW) a PRESENT-BUT-DIFFERING blob md5: a temp `git init` tree
      // whose COMMITTED blob differs from the vendored copy while both are present. This
      // is the branch the audit found had NO control at all, and it is the branch that
      // models the strongest false-green (a worktree edited after checkout): the vendored
      // bytes and the manifest still agree, and only a BLOB read can see it.
      const control4 = withTempDir('pd-pin-refresh-blob-', (dir): string | null => {
        const env = { ...process.env, GIT_AUTHOR_NAME: 'pd-pin-refresh', GIT_AUTHOR_EMAIL: 'pd-pin-refresh@example.invalid', GIT_COMMITTER_NAME: 'pd-pin-refresh', GIT_COMMITTER_EMAIL: 'pd-pin-refresh@example.invalid' }
        const rel = `src/shared/${probe}.ts`
        mkdirSync(join(dir, 'src', 'shared'), { recursive: true })
        const differing = Buffer.concat([readFileSync(join(REPO_ROOT, 'src', 'shared', `${probe}.ts`)), Buffer.from('\n// committed blob differs from the vendored copy\n')])
        writeFileSync(join(dir, rel), differing)
        const init = spawnSync('git', ['init', '-q', '.'], { cwd: dir, encoding: 'utf8', env })
        if (init.status !== 0) return `CONTROL 4: \`git init\` failed: ${(init.stderr ?? '').trim()}`
        const add = spawnSync('git', ['add', rel], { cwd: dir, encoding: 'utf8', env })
        if (add.status !== 0) return `CONTROL 4: \`git add\` failed: ${(add.stderr ?? '').trim()}`
        const commitRun = spawnSync('git', ['commit', '-q', '-m', 'a differing blob'], { cwd: dir, encoding: 'utf8', env })
        if (commitRun.status !== 0) return `CONTROL 4: \`git commit\` failed: ${(commitRun.stderr ?? '').trim()}`
        const revRun = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8', env })
        const tempRevision = (revRun.stdout ?? '').trim()
        if (revRun.status !== 0 || !/^[0-9a-f]{40}$/.test(tempRevision)) return `CONTROL 4: the temp tree's revision did not read (status ${String(revRun.status)})`
        const blob = spawnSync('git', ['-C', dir, 'show', `${tempRevision}:${rel}`], { maxBuffer: 64 * 1024 * 1024 })
        if (blob.status !== 0) return `CONTROL 4: \`git show\` failed in the temp tree: ${(blob.stderr ?? Buffer.alloc(0)).toString('utf8').trim()}`
        const blobBytes = blob.stdout as Buffer
        const real = readIdentitySubject(probe, probeDeclared, commit)
        if (real.vendoredBytes === null) return 'CONTROL 4: the real vendored bytes could not be read — the control has no subject'
        if (blobBytes.equals(real.vendoredBytes)) return 'CONTROL 4: the temp tree’s COMMITTED blob equals the vendored bytes — the fixture does not differ, so the control has no subject'
        const problems = identityProblems({ ...real, blobBytes })
        if (!problems.some((p) => p.startsWith('[blob≠vendored]'))) {
          return `CONTROL 4 could not discriminate: a PRESENT-BUT-DIFFERING blob did not fire the blob≠vendored limb; the oracle reported «${problems.join(' | ') || 'nothing'}»`
        }
        // …and the SAME blob with the vendored bytes SET EQUAL to it passes, so the
        // differing pair (and not the fixture) is what the limb reads.
        const equalised = identityProblems({ ...real, blobBytes, vendoredBytes: blobBytes, declaredMd5: md5(blobBytes) })
        return equalised.length === 0 ? null : `CONTROL 4 could not be driven: equal blob and vendored bytes are rejected — «${equalised.join(' | ')}»`
      })
      attempt(run, i++, control4)

      // ⟨the `2` LCG-DRAWN PERTURBATION RE-DRIVES (`A-10`)⟩ RE-DRAWN onto a PERTURBATION
      // DOMAIN — WHICH MODULE × WHICH BYTE — because the as-filed pair of pools were both
      // permutations of the same fifteen and therefore bought ZERO coverage. Each draw
      // selects a module, a byte position and a replacement byte from the pinned seed, and
      // the drive must be REFUSED by the oracle's md5-inequality limb.
      const reDriveLog: string[] = []
      let state = REGISTER_SEED
      for (let draw = 0; draw < 2; draw++) {
        const moduleDraw = lcgDraw(state, fifteen.length)
        state = moduleDraw.state
        const name = fifteen[moduleDraw.index]!
        const original = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`))
        const posDraw = lcgDraw(state, original.length)
        state = posDraw.state
        const repDraw = lcgDraw(state, 256)
        state = repDraw.state
        let replacement = repDraw.index
        let guarded = false
        if (replacement === original[posDraw.index]) {
          replacement = (replacement + 1) % 256
          guarded = true
        }
        const perturbed = Buffer.from(original)
        perturbed[posDraw.index] = replacement
        reDriveLog.push(`${name}@byte ${posDraw.index}→${replacement}${guarded ? ' (no-op guard fired)' : ''}`)
        const ce = ((): string | null => {
          if (perturbed.equals(original)) return `LCG re-drive ${draw + 1}: the byte perturbation is the identity — the drive has no subject`
          const problems = drive(name, perturbed)
          if (problems === null) return `LCG re-drive ${draw + 1} could not discriminate: the oracle ACCEPTED the perturbed bytes of ${name} at byte ${posDraw.index}`
          if (!problems.includes('[vendored-md5]')) return `LCG re-drive ${draw + 1} could not discriminate on the md5-inequality limb: «${problems}»`
          return null
        })()
        attempt(run, i++, ce)
      }
      // eslint-disable-next-line no-console
      console.log(`PD-VENDOR-PIN-REFRESH A-10 perturbation domain (row 3): ${reDriveLog.join(' · ')}`)
    } else {
      // The adjacency could not be read: the remaining declared attempts are ABANDONED. The
      // abandonment is REPORTED through the row's one counterexample (above) and through
      // the report line's `executed` vs `declared` mismatch — the DECLARED TERM IS NOT
      // REDUCED, and no attempt here reports a reading that was never taken. The row cannot
      // HOLD with a tree-absent counterexample, so absence is never a pass (`F-10`, `D-11`).
      void treeReadable
    }

    finish('P-TP-pd-pin-3', run)
  })
})

// ===========================================================================
// §4 — THE ARITHMETIC PRINTED WITH ITS TERMS, THE CAPS, THE ROW-ID STRATEGY
// DISCIPLINE, AND THE REGISTER REPORT.
// `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: a total that is not the sum of its own
// terms, or a total quoted without its terms, is a review finding.
// ===========================================================================
describe('PD-VENDOR-PIN-REFRESH §4 — the register arithmetic, the caps, the row-id discipline and the register report', () => {
  it('§4 tally — the three rows are authored in register order, each ≤100, the total 7 + 16 + 21 = 44 ≤ 400, every term printed as the sum of its own factors, with the as-filed 4 + 6 + 20 = 30 SUPERSEDED and KEPT visible', () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order').toEqual([
      'P-IM-pd-pin-1',
      'P-SM-pd-pin-2',
      'P-TP-pd-pin-3',
    ])
    expect(DECLARED_REGISTER.length, 'the register is EXACTLY three rows — the pin refresh’s entire falsifiable content (§4’s class tally)').toBe(3)
    for (const row of DECLARED_REGISTER) {
      expect(row.declaredTotal, `${row.row} must be ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    expect(
      DECLARED_REGISTER.map((r) => `${r.row}: ${r.declared} = ${r.declaredTotal}`),
      '§4.1: the CURRENT per-row terms, printed as the sum of their own factors',
    ).toEqual([
      'P-IM-pd-pin-1: 1 real pair × 2 limbs + 1 comparator pin-arm drive + 4 controls = 7',
      'P-SM-pd-pin-2: 3 + 3 + 1 + 1 + 2 + 6 = 16',
      'P-TP-pd-pin-3: 15 × 1 + 4 + 2 = 21',
    ])
    const total = DECLARED_REGISTER.reduce((a, r) => a + r.declaredTotal, 0)
    expect(total, '§4.1’s attempt tally, printed with its terms: `7` + `16` + `21` = `44`').toBe(44)
    expect(total, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
    // THE SUPERSEDED ARITHMETIC STAYS VISIBLE, and is NEVER REDUCED AWAY: the as-filed
    // term is carried on every row and its total is printed beside the current one.
    expect(
      DECLARED_REGISTER.map((r) => `${r.row}: ${r.superseded.declared} = ${r.superseded.declaredTotal}`),
      'the AS-FILED (superseded) per-row terms, kept visible (annotate-beside, RCA-8(c))',
    ).toEqual([
      'P-IM-pd-pin-1: 1 real pair × 2 limbs + 2 controls = 4',
      'P-SM-pd-pin-2: 3 + 1 + 2 = 6',
      'P-TP-pd-pin-3: 15 × 1 + 3 + 2 = 20',
    ])
    const supersededTotal = DECLARED_REGISTER.reduce((a, r) => a + r.superseded.declaredTotal, 0)
    expect(supersededTotal, 'the SUPERSEDED attempt tally, kept visible: `4` + `6` + `20` = `30`').toBe(30)
    // NO DECLARED TERM WAS REDUCED: every current term is ≥ its as-filed term, and the
    // two rows whose terms moved moved UP.
    for (const row of DECLARED_REGISTER) {
      expect(
        row.declaredTotal >= row.superseded.declaredTotal,
        `${row.row}: the re-derivation may not REDUCE a declared term (current ${row.declaredTotal} vs as-filed ${row.superseded.declaredTotal})`,
      ).toBe(true)
    }
  })

  it('§4 — every strategy id is the declared `strat:pd-pin-*` id, and every row id is TOKEN-QUALIFIED (`P-*‑pd-pin‑N`) — never a bare prefix, never the Phase-0 register’s ids', () => {
    for (const row of DECLARED_REGISTER) {
      expect(row.strategyId, `${row.row}: the strategy id is declared by §4`).toMatch(/^strat:pd-pin-[a-z-]+$/)
      expect(row.row, `${row.row}: the three ids are token-qualified on purpose — the bare prefixes are occupied by the Phase-0 register, and a bare \`P-SM-1\` is the branch’s carried baseline`).toMatch(/^P-(IM|SM|TP)-pd-pin-\d$/)
    }
    const ids = DECLARED_REGISTER.map((r) => r.row)
    for (const bare of ['P-IM-1', 'P-SM-1', 'P-SM-2', 'P-TP-1', 'P-TP-2']) {
      expect(ids, `the bare id ${bare} belongs to the Phase-0 register / the carried baseline and must not be re-used`).not.toContain(bare)
    }
    // the row set, ids and strategy ids also reach the CONTRACT's anchored region, so an
    // amendment that dropped one without re-declaring it is a loud failure here.
    const region = registerRegion()
    expect(region.text, `§4’s anchored region must be readable: ${region.detail}`).not.toBe('')
    for (const row of DECLARED_REGISTER) {
      expect(region.text, `§4: the anchored region declares the row id \`${row.row}\``).toContain(row.row)
      expect(region.text, `§4: the anchored region declares the strategy id \`${row.strategyId}\``).toContain(row.strategyId)
    }
  })

  it('§4 (the `A-9` ANCHOR) — the contract limb reads ONLY the bounded `§4` region, and asserts the CURRENT arithmetic: `7` + `16` + `21` = `44`, with the as-filed `4` + `6` + `20` = `30` reachable only through an explicitly-marked SUPERSEDED block', () => {
    const region = registerRegion()
    expect(region.text, `§4’s anchored region must be readable: ${region.detail}`).not.toBe('')
    // the machinery, read from the region the anchoring bullet names — NEVER from the
    // whole file, so appending a dated amendment cannot red this limb.
    expect(region.text, '§4: the region still pins the seed 0x20260928').toMatch(/0x20260928/)
    expect(region.text, '§4: the region still declares the per-row and total caps').toMatch(/≤100 attempts per row/)
    expect(region.text, '§4: the region still declares the total cap').toMatch(/≤400 in total/)
    expect(region.text, '§4: the region still declares the STOP rule').toMatch(/STOP AFTER 5[\s\S]{0,80}?CONSECUTIVE FAILURES/)
    // THE CURRENT TALLY, addressed by its own declared terms.
    expect(region.text, '§4.1: the region declares the CURRENT total `7` + `16` + `21` = `44`').toMatch(/CURRENT:\s*`7`\s*\+\s*`16`\s*\+\s*`21`\s*=\s*`44`/)
    expect(region.text, '§4.1: the region declares the CURRENT row-1 term').toMatch(/`7 = 1 real pair × 2 limbs \+ 1 comparator(?: pin-arm)? drive \+ 4 controls`/)
    expect(region.text, '§4.1: the region declares the CURRENT row-2 term').toMatch(/`16 = 3 \+ 3 \+ 1 \+ 1 \+ 2 \+ 6`/)
    expect(region.text, '§4.1: the region declares the CURRENT row-3 term').toMatch(/`21 = 15 × 1 \+ 4 \+ 2`/)
    // THE AS-FILED ARITHMETIC IS STILL VISIBLE (annotate-beside) AND IS NAMED SUPERSEDED —
    // never deleted, and NEVER LEFT AS THE LAST WORD. Each of the four limbs below can
    // fail: a region that dropped the as-filed line, that stopped naming it superseded, or
    // that put the current declaration before it would red here.
    const asFiledPattern = /`4`\s*\+\s*`6`\s*\+\s*`20`\s*=\s*`30`/g
    const asFiled = [...region.text.matchAll(asFiledPattern)]
    expect(asFiled.length, '§4: the AS-FILED tally `4` + `6` + `20` = `30` is KEPT VISIBLE in the region — a superseded reading is never deleted').toBeGreaterThan(0)
    const asFiledTally = region.text.search(/`4`\s*\+\s*`6`\s*\+\s*`20`\s*=\s*`30`\s*attempts/)
    expect(asFiledTally, '§4: the AS-FILED tally LINE itself is kept as filed (not merely quoted from elsewhere)').toBeGreaterThan(0)
    for (const match of asFiled) {
      const at = match.index ?? 0
      const window = region.text.slice(Math.max(0, at - 900), at + 2200)
      expect(
        /superseded/i.test(window),
        '§4 / A-9: every earlier arithmetic reading in the region must be explicitly NAMED superseded within its own neighbourhood, so it can never be read as the CURRENT declaration',
      ).toBe(true)
    }
    const currentAt = region.text.search(/CURRENT:\s*`7`\s*\+\s*`16`\s*\+\s*`21`\s*=\s*`44`/)
    expect(
      currentAt > asFiledTally,
      '§4.1: the CURRENT arithmetic is declared AFTER the as-filed tally line — the superseded reading is never the last word on the attempt tally',
    ).toBe(true)
    expect(
      region.text,
      '§4.1: the region NAMES the as-filed total superseded, rather than quietly dropping it',
    ).toMatch(/as-filed total `30` is SUPERSEDED/)
    // …and the whole-file adjacency regex the as-filed register ran is GONE (A-9): the
    // region-anchored reads above are the only contract limbs the arithmetic needs.
    const self = withoutComments(readText(SELF_PATH))
    const fragile = 'RED[\\s\\S]{0,600}?' + 'GREEN' + '-ON-ARRIVAL'
    expect(self.includes(fragile), 'A-9: the whole-file colour adjacency regex is removed from this register — it red on a legitimate amendment of the contract').toBe(false)
  })

  it('§4 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term, its `stoppedAt` and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(
      missing,
      'every declared register row must have RUN and reported — a row or term dropped from §4 without a contract amendment must be a LOUD failure, never a vacuous pass',
    ).toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · bounded ${r.bounded ?? 'NO'} · counterexamples ${r.counterexamples.length}` +
        ` · limbs ${r.limbs.map((l) => `${l.index}:${l.held ? 'held' : 'BROKEN'}`).join(',')}` +
        (r.counterexamples.length > 0 ? ` · ${r.counterexamples.slice(0, 3).join(' | ')}` : ''),
    )
    // the report is PRINTED into the run output, so the red run's reading is visible
    // eslint-disable-next-line no-console
    console.log('PD-VENDOR-PIN-REFRESH REGISTER REPORT\n' + lines.join('\n'))
    expect(REPORTS.length, 'all three rows reported').toBe(3)
    // THE DECLARED TERMS ARE NEVER REDUCED: the planned total reads each row's DECLARED
    // term even when a row was abandoned mid-run (`executed < declared`), so a silently
    // reduced term is a LOUD failure here rather than a quieter number.
    const planned = REPORTS.reduce((a, r) => a + (r.executed < r.declaredTotal ? r.declaredTotal : r.executed), 0)
    expect(
      planned,
      'the PLANNED total must equal the declared 7 + 16 + 21 = 44 — a row that STOP-AFTER-5 abandons reports the abandonment (`stoppedAt`) and its declared term is NOT reduced',
    ).toBe(44)
    // the report carries the row's own declared term, unmoved, and every row's verdict
    for (const r of REPORTS) {
      const declared = DECLARED_REGISTER.find((d) => d.row === r.row)!
      expect(r.declared, `${r.row}: the report prints the DECLARED term, never a reduced one`).toBe(declared.declared)
      expect(r.declaredTotal, `${r.row}: the report prints the DECLARED total`).toBe(declared.declaredTotal)
      expect(r.strategyId, `${r.row}: the report carries the row’s strategy id`).toBe(declared.strategyId)
    }
  })

  it('§6 item 5 / §8 `D-10` / `F-7` — this file mocks NOTHING and binds no vitest mock API, and its imports are `vitest` + `node:*` builtins alone', () => {
    const self = readText(SELF_PATH)
    // the import block is taken from the source BEFORE the first non-import statement, so
    // the census can never be emptied by the comment handling below.
    const importBlock = self.split(/^const /m)[0]!
    const imports = [...importBlock.matchAll(/^\s*import\b[^'\n]*from\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]!)
    expect(imports.length, 'the file carries import statements — a census that reads ZERO imports has lost its subject and must fail rather than pass vacuously').toBeGreaterThan(0)
    expect(
      [...new Set(imports)].sort(),
      'the file carries EXACTLY the declared import set: `vitest` + the six `node:*` builtins it uses — and NOTHING else',
    ).toEqual(['node:child_process', 'node:crypto', 'node:fs', 'node:os', 'node:path', 'node:url', 'vitest'])
    for (const spec of imports) {
      expect(spec === 'vitest' || spec.startsWith('node:'), `§8 \`D-10\` / \`F-8\`: this file imports only \`vitest\` and \`node:*\` builtins; it imports "${spec}"`).toBe(true)
    }
    const mockApis = ['vi' + '.mock', 'vi' + '.doMock', 'vi' + '.hoisted', 'vi' + '.stubGlobal', 'vi' + '.spyOn']
    for (const api of mockApis) {
      expect(self.includes(api), `\`F-7\` / \`D-10\`: this file must bind no vitest mock API in any form; it binds \`${api}\``).toBe(false)
    }
    const electronLiteral = ['electron', '-mock'].join('')
    expect(self.includes(`'${electronLiteral}'`), '§6 item 5 ①: the protected bridge-mock census pins the exact five-name set and this file must not join it').toBe(false)
    // the `G-9`/`X-9`-frozen files are not READ (`F-8`): asserted over the source with its
    // `//`-comment LINES dropped, so a prose mention in this file's header is not mistaken
    // for a read, while a read (a path literal in code) still reds the row.
    const frozenLiterals = ['vitest' + '.config.ts', 'src/main/markdown' + '-import.ts', 'tests/fixtures/v5-bridge' + '-capture-fixture.js', 'package' + '.json']
    const proseCode = withoutComments(self)
    const frozenSelfScan = [
      { subject: 'this file’s header prose (the comment-stripped reading)', text: proseCode },
      { subject: 'this file’s own declared reader set (the F-8 oracle, driven over a synthetic text)', text: frozenLiterals.join('\n') },
    ]
    for (const frozen of frozenLiterals) {
      expect(proseCode.includes(frozen), `§8 \`D-10\` / \`F-8\`: no \`G-9\`-frozen file may be READ; this file's code names ${frozen}`).toBe(false)
    }
    expect(
      frozenSelfScan[1]!.text.includes(frozenLiterals[0]!),
      '§8 `D-10` / `F-8`: the scan’s own subject is present, so the scan above is not vacuous (it is driven over the frozen literals themselves, and over this file’s comment-stripped source)',
    ).toBe(true)
    expect(proseCode.includes('pd-vendor-pin-refresh-register' + '.test.ts'), 'the only repo test file this file names in code is ITSELF (the F-8 self-scan’s own subject)').toBe(true)
  })

  it('§4 (the `A-9` ANCHOR, self-read) — the contract is READ EXACTLY ONCE in code and only through the region extractor, so no limb can regress to a whole-file regex over the spec', () => {
    const proseCode = withoutComments(readText(SELF_PATH))
    // the needle is built from its parts, so the scan does not count ITSELF
    const specReadNeedle = 'readText(REGISTER' + '_SPEC_PATH)'
    const reads = proseCode.split(specReadNeedle).length - 1
    expect(
      reads,
      `A-9: the contract must be read EXACTLY ONCE in code (inside the region extractor), so every limb that reads it is forced through a BOUNDED SECTION REGION. Found ${reads} read(s)`,
    ).toBe(1)
    expect(proseCode.includes('specRegion('), 'A-9: the region extractor is the only path to the contract text').toBe(true)
    expect(proseCode.includes('registerRegion('), 'A-9: the `§4` table region is the arithmetic limb’s anchor').toBe(true)
    // THE DISCRIMINATION: the same scan over a FORGED source with a second, unanchored
    // read of the spec reports 2, so the limb above can fail rather than pass vacuously.
    const forged = `${proseCode}\nconst leaked = ${specReadNeedle}\n`
    expect(forged.split(specReadNeedle).length - 1, 'A-9: the self-read limb discriminates — a second, unanchored read of the contract is counted').toBe(2)
  })

  it('§4’s shared machinery — the pinned seed drives a hand-rolled 32-bit LCG (one step per draw, `stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`, `index = stateₙ₊₁ mod pool.length`)', () => {
    const draws = (seed: number, poolSize: number, steps: number): number[] => {
      const out: number[] = []
      let state = seed
      for (let k = 0; k < steps; k++) {
        const step = lcgDraw(state, poolSize)
        state = step.state
        out.push(step.index)
      }
      return out
    }
    const first = draws(REGISTER_SEED, REGISTER_SEED, 3)
    expect(first, '§4: the LCG’s draws are DETERMINISTIC — the pinned seed yields this exact sequence, one step per draw, with no clock and no environment read').toEqual(draws(REGISTER_SEED, REGISTER_SEED, 3))
    let state = REGISTER_SEED
    for (let k = 0; k < 3; k++) {
      const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
      expect(next, '§4: one step is `stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`').toBe(lcgDraw(state, 1).state)
      expect(lcgDraw(state, REGISTER_SEED).index, '§4: the index is `stateₙ₊₁ mod pool.length`').toBe(next % REGISTER_SEED)
      state = next
    }
    expect(draws(REGISTER_SEED + 1, 15, 2), '§4: a different seed yields a different sequence (the seed is load-bearing)').not.toEqual(draws(REGISTER_SEED, 15, 2))
  })

  it('§4 row 3 (`A-10`) — the `2` LCG-drawn re-drives sample a PERTURBATION DOMAIN (which module × which byte), not two permutations of the same fifteen', () => {
    const fifteen = pinnedFifteen()
    // the as-filed form, kept visible: two pools that were both permutations of the
    // fifteen, so their draws could only ever re-drive an already-swept module.
    const asFiledPools: readonly string[][] = [fifteen, [...fifteen].reverse()]
    let asFiledState = REGISTER_SEED
    const asFiledPairs: string[] = []
    for (const pool of asFiledPools) {
      const draw = lcgDraw(asFiledState, pool.length)
      asFiledState = draw.state
      asFiledPairs.push(`${pool[draw.index]!}@module-only`)
    }
    expect(asFiledPairs.length, 'the as-filed pair of pools bought two module-only re-drives — recorded here as the SUPERSEDED shape').toBe(2)
    // the CURRENT form: the same two LCG steps, but each draw also selects a BYTE POSITION
    // and a REPLACEMENT byte, so the drive is a distinct perturbation, not a permutation.
    let state = REGISTER_SEED
    const drawsNow: string[] = []
    for (let k = 0; k < 2; k++) {
      const moduleDraw = lcgDraw(state, fifteen.length)
      state = moduleDraw.state
      const name = fifteen[moduleDraw.index]!
      const bytes = readFileSync(join(REPO_ROOT, 'src', 'shared', `${name}.ts`))
      const posDraw = lcgDraw(state, bytes.length)
      state = posDraw.state
      const repDraw = lcgDraw(state, 256)
      state = repDraw.state
      drawsNow.push(`${name}@byte:${posDraw.index}→${repDraw.index}`)
    }
    // eslint-disable-next-line no-console
    console.log(`PD-VENDOR-PIN-REFRESH A-10 domain: as-filed ${asFiledPairs.join(', ')} · current ${drawsNow.join(', ')}`)
    expect(drawsNow.length, '§4.1 row 3 declares TWO LCG-drawn perturbation re-drives').toBe(2)
    for (const draw of drawsNow) {
      expect(draw, 'the current draw names a MODULE AND A BYTE — the perturbation domain, not a module-only permutation').toMatch(/^[a-z-]+@byte:\d+→\d+$/)
    }
    const supersededDomain = DECLARED_REGISTER.find((r) => r.row === 'P-TP-pd-pin-3')!.superseded.declared
    expect(supersededDomain, 'the superseded row-3 term stays visible beside the current one').toBe('15 × 1 + 3 + 2')
  })

  it('§6 item 2 — the contract’s declared colours: the red head’s one-red-of-three record AND the amendment’s LANDED reading, each read from the bounded `§6` region (never a whole-file adjacency regex)', () => {
    const region = redSetRegion()
    expect(region.text, `§6’s anchored region must be readable: ${region.detail}`).not.toBe('')
    for (const row of DECLARED_REGISTER) {
      expect(region.text, `§6 item 2: the region records the row id \`${row.row}\``).toContain(row.row)
    }
    expect(region.text, '§6 item 2: the as-filed red-head record is KEPT VISIBLE (its colour vocabulary)').toMatch(/RED/)
    expect(region.text, '§6 item 2: the as-filed green-on-arrival record is KEPT VISIBLE').toMatch(/GREEN-ON-ARRIVAL/)
    expect(region.text, '§6 item 2 / A-1: the amendment records that the colours MOVED after the refresh landed (P-IM-pd-pin-1 is no longer RED)').toMatch(/no longer RED/)
    // the register's own declared colours at the LANDED head, and the superseded red-head
    // colours beside them (annotate-beside: the as-filed reading is not deleted).
    for (const row of DECLARED_REGISTER) {
      expect(row.colourAtLandedHead, `${row.row}: the landed head’s colour is recorded (the refresh landed; the carried baseline is the ONE remaining red, and it is not a row of this register)`).toMatch(/^GREEN/)
      expect(row.superseded.colourAtRedHead, `${row.row}: the SUPERSEDED red-head colour stays visible`).toMatch(/^(RED|GREEN-ON-ARRIVAL)/)
      expect(row.superseded.asFiledOn, `${row.row}: the superseded reading is DATED`).toBe('2026-09-28')
    }
  })
})
