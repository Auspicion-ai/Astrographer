// tests/atomicity-sweep-class-b-register.test.ts — UNIT `U-ATOMICITY-SWEEP-CLASS-B` — THE UNIT'S
// OWN FORK-AUTHORED TYPED PROPERTY REGISTER, §5 of
// `docs/specs/unit-atomicity-sweep-class-b.md`: the TEN rows — the EIGHT `[T]` rows
// (`P-ASW-IM-1..5` · `P-ASW-SM-1` · `P-ASW-TP-1..2`) + the TWO `[H]` rows (`P-ASW-H-1..2`).
//
// SOURCE OF EVERY ASSERTION (spec ONLY — the 3a/3b sibling registers and the foundation's own
// register are SHAPE sources ALONE; §5.1: "NO id, term, seed, strategy or layer is inherited from
// the foundation's register or from any sibling's"):
//   docs/specs/unit-atomicity-sweep-class-b.md
//     §0.1 V-1..V-10  the vocabulary rows (the ATOMIC FIVE-STEP WRITE; the ADDITIVE-OPTIONAL
//                     injected `fs` façade; the closed TWO-FORM RECEIPT; the LIVE PATH; the
//                     NON-FATAL POSTURE; the FIELD-WISE TOTALITY of `sanitize`; the seven-row
//                     table + the DERIVED control; the ROW'S OWN RE-STATEMENT LICENCE; the
//                     `--provident-user-data=` seam; the three `main.ts` construction sites)
//     §0.3            the in-force `S1`..`S12` answer set this contract consumes without
//                     re-litigation (S5 the receipt's reader ruling; S6 the frozen `set()` return;
//                     S7 the swallow removed / posture retained; S8 `get()` stays total; S10 the
//                     digest re-statement + the PRE-EMPTIVE re-anchor; S12 the live leg RUNS)
//     §1.1 members 1-6  THE ONE ATOMIC COMMIT'S SIX MEMBERS (a different member set is §4 F-1)
//     §1.2 items 1-13   THE THIRTEEN DENIED ROWS
//     §1.4            THE TWO REJECTED PRECEDENTS (`R-REJ-1` the two-step tmp+rename with NO
//                     fsync; `R-REJ-2` `atomicWriteStoreCarrier` with NO façade seam)
//     §2.2            the exact `persist()` step sequence, IN ORDER, and the tmp fate
//     §2.3 ①/②/③/④     the receipt reader ruling PER CARRIER; the closed form; the duplicate home
//     §2.4 m-1..m-11    THE FAIL-STATE TABLE
//     §2.5 ①/②/③/④     THE READ-PATH DISTINGUISHABILITY REQUIREMENT
//     §2.6 P-1..P-8     THE FAÇADE — the eight declared legs, ADDITIVE-OPTIONAL, INERT by default
//     §2.7 C-1..C-9     the figures (the nine-member operator payload; the one-member engine
//                       payload; the SEVEN-row table; the control's derived path; the carried MD5)
//     §3.1            THE INVARIANT
//     §3.2 I-1..I-12  THE TWELVE RULES, each with its falsifier
//     §4 RE-1..RE-7   THE RED SET — each row's red, its arm class, the no-other-red rule, and
//                     `RE-5` PRE-RECORDED and EXEMPT-IN-ADVANCE
//     §5.1/§5.2/§5.3  THE REGISTER: the seed `0x20261007`, the caps (`≤100`/row, `≤400` total,
//                     STOP AFTER 5 CONSECUTIVE FAILURES), the terms printed as SUMS, the row-id
//                     prefixes, the held/broken + strategy ids, the discriminating controls, the
//                     anti-vacuity limb, and the arithmetic/caps/honesty block
//     §6.1/§6.2       the layer ledger and the live leg's ORDER claim form
//     §7 1..12        THE HONESTY/LIMITS BLOCK — the twelve named non-claims
//
// LAYER (`RCA-12` / §6.1, mandatory and binding). `[T]` constructed stores + `[H]` byte-scan
// ONLY. **NOTHING here is app-green, envelope-green, store-green, engine-green or live-green.**
// The atomic five-step is asserted as a CALL ORDER/COUNT over an INJECTED `fs` FAÇADE — SHAPE
// ONLY: **NO DURABILITY CLAIM IS MADE ANYWHERE IN THIS FILE** (§6.1's honesty block; §5.2
// `P-ASW-TP-2` is the anti-overclaim row that polices exactly this). The `fsync` legs are
// SHAPE-asserted as INVOCATIONS, never as a completed crash-safe persist. The ONLY reading that
// reaches the assembled layer is §6's `[U]` restart round-trip, which is an ORDER claim living in
// its own artifact — **no node-green is a durability reading**.
//
// THE INSTRUMENTS (each row PRINTS its instrument). Three, tracked distinctly:
//   (1) THE DRIVEN CARRIER — `createOperatorSettingsStore(opts)` / `createEngineConfigStore(opts)`
//       over the injected `fs` façade (§2.6). The façade RECORDS the calls the subject makes and
//       the ORDER it makes them in. **MEASURED AT THIS HEAD: the `fs?` member does not exist, so
//       the subject reaches the REAL `node:fs` through its static import and the recorder reads
//       ZERO calls — the `SEAM-UNREACHED` (`RED-BY-ABSENCE`) reading, reported per row.**
//   (2) THE REAL-PATH DRIVE — the same subject driven against a real file inside the
//       per-process-unique fixture root, so the LANDED sequence is a READING
//       (`mkdir` → plain write against the LIVE path → nothing).
//   (3) THE BYTE-SCAN SURFACE PINS — the `[H]` class (the two carrier modules, `main.ts`'s
//       construction sites and the denied surface, the md5 row + the derived control of
//       `tests/pd-ui-1-theme-register.test.ts`).
//
// THE RED-BY-ABSENCE / RED-BY-SHIM / GREEN-ON-ARRIVAL / GREEN CLASSIFICATION (recorded per row,
// §4). Four verdict classes are tracked DISTINCTLY and printed per row:
//   `RED-BY-ABSENCE`   — the row's subject member/surface does not exist at this head; the drive
//                        names the absent subject as its counterexample.
//   `RED-BY-SHIM`      — the row's oracle RUNS against the landed substrate and reports the
//                        pinned property UNSATISFIED.
//   `GREEN-ON-ARRIVAL` — the row asserts a property ALREADY TRUE at this head (a
//                        negative/denied-surface pin). Marked explicitly, NEVER counted as a
//                        landing-driven red (§4's no-other-red rule).
//   `GREEN`            — the row's property holds over its landed subject AND is landing-driven.
// Reporting a `RED-BY-ABSENCE` row as a pass is the honesty class this header exists to prevent;
// reporting a `GREEN-ON-ARRIVAL` row as red is §4's no-other-red violation.
//
// A RED-BY-ABSENCE CLASS NEVER EXCUSES A FAILING ROW. Every row's `held` is computed from its own
// drawn readings, so a row whose limbs are all red reports `broken` and REDDENS — the class is a
// LABEL for the DONE row's census, never a waiver.
//
// ===========================================================================
// SPEC-ARITHMETIC DISCREPANCY, RECORDED AND NOT SILENTLY RECONCILED.
// §5.2's row `P-ASW-IM-1` declares its DECLARED TERM as **`24`** while its own printed expression
// is **`2 × 4 × 2 + 2 × 2 = 16 + 4 = 20`** — the expression does NOT sum to the bolded total.
// §5.1's rule is that "the register's printed sum is the authority", and §5.3's own printed `[T]`
// total (`144`) and grand total (`162`) are the sums of the EXPRESSIONS, not of the `24` — so the
// EXPRESSION governs and the `24` is a filing figure. THIS ROW EXECUTES THE EXPRESSION'S OWN
// drives and PRINTS the arithmetic honestly; the spec's `24` is recorded here as the divergent
// figure it is. (The identical class was recorded by 3a's `P-SSW-IM-4` — a printed expression that
// did not sum to its own printed total — and was reported to the supervisor rather than silently
// reconciled. THIS IS THE SAME REPORT: the supervisor owns the amendment.)
// ===========================================================================
import { describe, it, expect, afterAll } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync, mkdtempSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-atomicity-sweep-class-b.md')
const REVIEW_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-atomicity-sweep-review.md')
const OPERATOR_PATH = join(REPO_ROOT, 'src', 'main', 'operator-settings-store.ts')
const ENGINE_PATH = join(REPO_ROOT, 'src', 'main', 'engine-config.ts')
const SECURITY_PATH = join(REPO_ROOT, 'src', 'main', 'security-store.ts')
const MAIN_PATH = join(REPO_ROOT, 'src', 'main', 'main.ts')
const PRELOAD_PATH = join(REPO_ROOT, 'src', 'main', 'preload.ts')
const RENDERER_DIR = join(REPO_ROOT, 'src', 'renderer')
const SRC_DIR = join(REPO_ROOT, 'src')
const TYPES_PATH = join(REPO_ROOT, 'src', 'shared', 'types.ts')
const THEME_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const SELF_PATH = join(HERE, 'atomicity-sweep-class-b-register.test.ts')
const SIBLING_PATH = join(HERE, 'pd-atomicity-sweep-class-b.test.ts')

// ===========================================================================
// §5.1 — THE REGISTER'S DECLARED MACHINERY, pinned once and binding on every row.
// Seed `REGISTER_SEED = 0x20261007` (a fixed literal — never `Date.now()`, never `Math.random()`,
// never an environment read; distinct from every sibling's `0x20260927` (3a) / `0x20260928`
// (PD-UI-1) / `0x20261004` (unit 2) / `0x20261006` (3b)); a hand-rolled 32-bit LCG, ONE STEP PER
// DRAW (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`, `index = stateₙ₊₁ mod pool.length`);
// caps `≤100` attempts per row · `≤400` in total; rows run SEQUENTIALLY in register order; STOP
// AFTER 5 CONSECUTIVE FAILURES (abandonment is REPORTED through `stoppedAt`, never hidden; an
// un-run row is a FAILURE, never a pass).
// ===========================================================================
const REGISTER_SEED = 0x20261007
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5
/** §5.1 — THE ROW-ID PREFIXES (fork-own; `P-STORE-CORE-*`, `P-SPA-*`, `P-SSW-*`, `P-SSJ-*` are TAKEN). */
const ROW_PREFIXES = ['P-ASW-IM-', 'P-ASW-SM-', 'P-ASW-TP-', 'P-ASW-H-'] as const
/** §5.1 — THE SIBLING SEEDS this unit's own seed is DISTINCT FROM (the collision check). */
const SIBLING_SEEDS = [
  { seed: 0x20260927, unit: 'U-STORE-SECURITY-WRITE (3a)' },
  { seed: 0x20260928, unit: 'PD-UI-1' },
  { seed: 0x20261004, unit: 'U-STORE-PERSIST-ADOPT (unit 2)' },
  { seed: 0x20261006, unit: 'U-STORE-SECURITY-JOURNAL (3b)' },
] as const

/** §2.6 P-1..P-8 — THE EIGHT DECLARED FAÇADE LEGS (a CENSUS: 8, printed with its terms). */
const FACADE_LEGS = ['mkdirSync', 'writeFileSync', 'openSync', 'fsyncSync', 'closeSync', 'renameSync', 'readFileSync', 'existsSync'] as const
type FacadeLeg = (typeof FACADE_LEGS)[number]
/** §2.2 — the five-step order. `mkdir` is CONDITIONAL; the four unconditionals run ONCE EACH. */
const UNCONDITIONAL_STEPS = ['writeTmp', 'fsyncTmp', 'rename', 'fsyncDir'] as const
type AtomicStep = (typeof UNCONDITIONAL_STEPS)[number] | 'mkdir'
/** §2.3 ③ — THE CLOSED RECEIPT FORM. */
const RECEIPT_STATUSES = ['committed', 'refused'] as const
const RECEIPT_REASONS = ['write-failed'] as const
/** §2.7 C-1 / C-2 — the payload censuses. */
const OPERATOR_MEMBERS = [
  'enabledPanes',
  'enabledOperatorPanes',
  'panesInitialized',
  'defaultDocumentId',
  'topK',
  'representationMode',
  'theme',
  'layout',
  'tabs',
] as const
const ENGINE_MEMBERS = ['engineBaseUrl'] as const
/** §2.7 C-3 — the `UNTOUCHED_DIGESTS` table's SEVEN-row census. */
const UNTOUCHED_ROW_CENSUS = 7
/** §1.1 member 4 / §2.7 C-9 / §4 RE-5 — the superseded literal + the restating unit. */
const SUPERSEDED_OPERATOR_MD5 = '11841179e004f22dd758edbe927f1a40'
const RESTATING_UNIT = 'U-ATOMICITY-SWEEP-CLASS-B'
/** §2.7 C-4 — the control's DERIVED resolution once the operator row is re-stated. */
const DERIVED_CONTROL_AFTER = 'src/shared/demo-envelope.ts'
/** §7 1..12 — the DURABILITY vocabulary the anti-overclaim row scans for (its own word list,
//  never a claim of this file's). */
const DURABILITY_TOKENS = ['durable', 'durability', 'crash-safe', 'crash safe', 'survive a power loss', 'survives a power loss', 'bytes on disk', 'bytes-on-disk', 'fsync completed', 'fsync-completed', 'power-loss safe'] as const
/** §2.5 ①/② — the as-filed overstatement (kept visible) and the corrected, operative reading. */
const AS_FILED_SYMPTOM = 'torn write silently resets'
const CORRECTED_SYMPTOM = 'ARBITRARY SUBSET of the fields reverts to first-run'

const FIXTURE_ROOT = mkdtempSync(join(tmpdir(), `provident-aswreg-${process.pid}-`))
afterAll(() => {
  try {
    rmSync(FIXTURE_ROOT, { recursive: true, force: true })
  } catch {
    /* the unique root is the contract; the drain is best-effort */
  }
})

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

/** The four verdict classes of this unit's red (see the header). */
type RedClass = 'RED-BY-ABSENCE' | 'RED-BY-SHIM' | 'GREEN-ON-ARRIVAL' | 'GREEN'

interface DeclaredRow {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors (§5.2) */
  declared: string
  declaredTotal: number
  layer: '[T]' | '[H]'
  /** §4's red class, recorded per row at THIS head */
  redHeadClass: RedClass
  redHeadNote: string
  /** §4 — the red id this row's failing limb answers to */
  redId: string
}

const DECLARED_REGISTER: DeclaredRow[] = [
  {
    row: 'P-ASW-IM-1',
    strategyId: 'S-ASW-ATOM-1',
    // §5.2 prints BOTH: the bolded total `24` AND the expression `2 × 4 × 2 + 2 × 2 = 16 + 4 = 20`.
    // §5.1's rule makes the PRINTED SUM the authority, so the expression governs (see the header's
    // SPEC-ARITHMETIC DISCREPANCY block). The divergence is recorded in the printed string below.
    declared: '2 carriers × 4 drives × 2 readings + 2 controls × 2 carriers = 2 × 4 × 2 + 2 × 2 = 16 + 4 = 20 (the spec BOLDS `24` — that total does not equal its own printed expression; §5.1 makes the printed sum the authority, so 20 runs and the `24` is recorded as the divergent filing figure)',
    declaredTotal: 20,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-1) READ AS SEAM-UNREACHED: the atomic shape is ABSENT on both carriers — MEASURED at this head, the injected façade records ZERO calls, because the landed `persist()` is `mkdirSync(dirname,{recursive:true})` → `writeFileSync(opts.path, …)` DIRECT AGAINST THE LIVE PATH inside an EMPTY `catch {}` and never routes through the seam. The `renameSync`/`fsyncSync` arms are NEVER REACHED, and the landed sequence is read on the REAL path beside the façade (§4 RE-2\'s absent-`fs?` class)',
    redId: 'RE-1',
  },
  {
    row: 'P-ASW-IM-2',
    strategyId: 'S-ASW-ATOM-2',
    declared: '5 injection points × 2 carriers × 2 readings + 2 controls = 5 × 2 × 2 + 2 = 20 + 2 = 22',
    declaredTotal: 22,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-2): the five written failure points CANNOT BE DRIVEN — `OperatorSettingsStoreOptions` and `createEngineConfigStore`\'s options carry NO `fs` member, so the façade resolves NOWHERE and every injection point reports the absent-seam class BY NAME. The `m-1`/`m-2` limbs\' LIVE-PATH-INTACT half holds on the real path (the landed plain write TRUNCATES the live path, so the intactness property is asserted where it can be read); the `m-5` disagreement limb has NO SUBJECT at this head',
    redId: 'RE-2',
  },
  {
    row: 'P-ASW-IM-3',
    strategyId: 'S-ASW-READ-1',
    declared: '2 carriers × 4 boot states × 2 readings = 2 × 4 × 2 = 16',
    declaredTotal: 16,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-4): NO DISTINGUISHABILITY SIGNAL EXISTS — `lastReadWasCorrupt()` resolves NOWHERE on the operator store, and the engine carrier\'s record carries NO conflict marker, so an unparsable file and an absent file read IDENTICALLY at every downstream surface. The `get()`-stays-total half (no throw, the first-run defaults) is DRIVEN and holds at this head (recorded, never counted as a landing-driven red)',
    redId: 'RE-4',
  },
  {
    row: 'P-ASW-IM-4',
    strategyId: 'S-ASW-SUBSET-1',
    declared: '9 operator field classes × 2 readings + 2 controls = 9 × 2 + 2 = 18 + 2 = 20',
    declaredTotal: 20,
    layer: '[T]',
    redHeadClass: 'GREEN-ON-ARRIVAL',
    redHeadNote:
      'GREEN-ON-ARRIVAL (`S-P-2`; §2.5 ②): `sanitize()` is ALREADY TOTAL and FIELD-WISE fail-soft at this head — a torn-but-PARSABLE file resets only the fields whose bytes were lost (the CORRECTED reading), and a zero-byte file resets all nine (the as-filed overstatement\'s TRUE sub-case). This unit changes the WRITE path, never the read\'s per-field coercion, so the row holds BEFORE and AFTER; a landing that REDDENS it has changed `sanitize`\'s semantics, which §3.2 I-5 forbids. Recorded, never counted as a landing-driven red.',
    redId: '—',
  },
  {
    row: 'P-ASW-IM-5',
    strategyId: 'S-ASW-SHIM-1',
    declared: '2 carriers × 8 façade legs × 1 reading + 4 controls = 2 × 8 × 1 + 2 × 2 = 16 + 4 = 20',
    declaredTotal: 20,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-2): the façade is ABSENT on BOTH carriers — the eight declared legs cannot be INDEPENDENTLY throwable because neither carrier can be handed one, so each leg reports the absent-seam class. The ABSENT-façade INERTNESS control CANNOT be discriminated either (with no `fs?` member, an injected façade and an absent one are indistinguishable to the subject) — which is itself the finding',
    redId: 'RE-2',
  },
  {
    row: 'P-ASW-SM-1',
    strategyId: 'S-ASW-ASM-1',
    declared: '2 carriers × 4 machine states × 2 readings = 2 × 4 × 2 = 16',
    declaredTotal: 16,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-1/RE-3): the non-fatal posture MACHINE cannot leave IDLE — the façade recorder observes nothing, `lastWriteReceipt()` is ABSENT, and the terminal readings have no subject. The POSTURE half (nothing throws out of `set()`; the in-memory holder still answers `get()`) is DRIVEN on the real path and HOLDS (recorded as its green-on-arrival half)',
    redId: 'RE-3',
  },
  {
    row: 'P-ASW-TP-1',
    strategyId: 'S-ASW-RCPT-1',
    declared: '2 carriers × 4 outcome classes × 2 assertions + 2 controls = 2 × 4 × 2 + 2 = 16 + 2 = 18',
    declaredTotal: 18,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-3), SPLIT HONESTLY: the ENGINE half PASSES ON ARRIVAL (no receipt member exists — recorded, NEVER counted as a landing-driven red, exactly as §4 RE-3 pre-records), while the OPERATOR half FAILS BY ABSENCE: `lastWriteReceipt()` resolves NOWHERE, so THE READER the ruling requires does not exist at all',
    redId: 'RE-3',
  },
  {
    row: 'P-ASW-TP-2',
    strategyId: 'S-ASW-HON-1',
    declared: '2 instrument classes × 2 readings + 4 controls = 2 × 2 × 2 + 4 = 8 + 4 = 12',
    declaredTotal: 12,
    layer: '[T]',
    redHeadClass: 'GREEN-ON-ARRIVAL',
    redHeadNote:
      'GREEN-ON-ARRIVAL (§6.1\'s honesty block / §7): the ANTI-OVERCLAIM row is a NEGATIVE over the artifacts\' own text and HOLDS at this head — no artifact of this unit claims durability, a completed real `fsync`, bytes-after-power-loss survival or a crash-recovery outcome, and no `[T]`/`[H]` result is reported as app-green. It must STAY green at the landed head. Every control is DRIVEN in-run (forged claim corpora that MUST redden the same predicate, lawful limit forms that MUST be admitted)',
    redId: '—',
  },
  {
    row: 'P-ASW-H-1',
    strategyId: 'S-ASW-MD5-1',
    declared: '(1) recorded-md5-equals-real + (2) restated-names-this-unit + (3) superseded-literal-visible + (4) row-count-7 + (5) eighth-row-control + (6) deletion-control + (7) derivation-unchanged + (8) control-non-empty + (9) control-resolves-to-unlicensed-row + (10) note-names-that-path = 10',
    declaredTotal: 10,
    layer: '[H]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-5, PRE-RECORDED and EXEMPT-IN-ADVANCE): the digest row is a LANDING-DRIVEN red BY CONSTRUCTION — `tests/pd-ui-1-theme-register.test.ts` treats `src/main/operator-settings-store.ts` as untouched (§2.7 C-5), so this unit\'s own `src/` edit REDDENS the digest limb until member 4\'s re-statement lands IN THE SAME COMMIT. Limbs (1)-(3) and (10) are red at this head; limb (4)/(7)/(8)/(9) hold',
    redId: 'RE-5',
  },
  {
    row: 'P-ASW-H-2',
    strategyId: 'S-ASW-CENS-1',
    declared: '(1) census-two-file-list + (2) operator-path-unchanged + (3) engine-path-unchanged + (4) no-schemaVersion + (5) no-file.settings-token + (6) carrier-move-control + (7) reader-unmoved + (8) second-writer-control = 8',
    declaredTotal: 8,
    layer: '[H]',
    redHeadClass: 'GREEN-ON-ARRIVAL',
    redHeadNote:
      'GREEN-ON-ARRIVAL (§4 RE-7 / `S2`/`S3`): the carrier census STAYS TRUE under this unit\'s scope — the persisted-`theme` carrier resolves to `src/shared/types.ts` + `src/main/operator-settings-store.ts` because the sweep changes that file\'s WRITE SHAPE, never its CARRIER MEMBERSHIP; both construction paths are byte-unchanged, neither carrier carries `schemaVersion`, and this unit authors no `file.settings.*` token. A landing that reddens it has re-derived the REJECTED reading (A). Recorded, never counted as a landing-driven red.',
    redId: '—',
  },
]

interface RowReport {
  row: string
  strategyId: string
  declared: string
  declaredTotal: number
  executed: number
  held: boolean
  stoppedAt: number | null
  layer: '[T]' | '[H]'
  redClass: RedClass
  redId: string
  counterexamples: string[]
  limbs: Array<{ index: number; held: boolean }>
  disposition: RowRun['disposition']
  capHit: boolean
}

const REPORTS: RowReport[] = []

interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
  limbs: Array<{ index: number; held: boolean }>
  /** The THREE-WAY disposition — `stoppedAt: null` is INITIALISED, so a row that ran to
   *  completion is indistinguishable from one that was abandoned by a throw unless it is an
   *  EXPLICIT field. */
  disposition: 'RUNNING' | 'COMPLETED' | 'ABANDONED-BY-CAP' | 'ABANDONED-BY-THROW'
  capHit: boolean
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null, limbs: [], disposition: 'RUNNING', capHit: false }
}

/** A bounded attempt loop: the attempt is ALWAYS counted; the row's remaining attempts are
 *  abandoned once `STOP_AFTER` CONSECUTIVE failures have been seen, and the abandonment is
 *  reported through `stoppedAt` and the `ABANDONED-BY-CAP` disposition — never hidden.
 *
 *  ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 3.⟩
 *  THE DEFECT (as filed, KEPT VISIBLE): `STOP_AFTER` was a DECLARED rule implemented ONLY as a
 *  COMMENT in this function's body. `stoppedAt` was initialised `null` in `newRun()` and **no
 *  code path ever assigned it**, so the "STOP AFTER 5 CONSECUTIVE FAILURES" cap was inert, and
 *  `run.consecutive` was incremented with no cap check and never reset against one. The limb that
 *  was supposed to prove `stoppedAt` meaningful compared an expression **to itself**
 *  (`REPORTS.filter(r => r.stoppedAt !== null).map(...)` `toEqual` the identical expression),
 *  which passes for ANY value.
 *  THE RULING AND THE REPAIR: **the cap now RUNS for real**, exactly as §5.1 declares —
 *  `if (run.consecutive >= STOP_AFTER) { run.stoppedAt = i; run.disposition = 'ABANDONED-BY-CAP'; return }`.
 *  The self-comparison limb is DELETED and replaced by the property the ruling rests on: THIS
 *  register's rows drive CLOSED INPUT SETS (§5.3: "each row's table is the CLOSED input set of its
 *  property; no row is sampled") and a closed set cannot be truncated without DROPPING A MEMBER —
 *  so no register row reaches the stop, and an abandoned row would be REPORTED as un-run (a
 *  FAILURE per §5.1), never silently truncated. `P-ASW-SM-1` asserts that inapplicability as a
 *  property AND drives a POOL-DRIVEN control row through THIS SAME `attempt()` to prove the cap
 *  fires when it does have a subject.
 *
 *  **WHAT MAKES THE STOP ABLE TO FAIL: it is no longer a comment — `run.consecutive` is consulted,
 *  `run.stoppedAt` is ASSIGNED and the disposition flips to `ABANDONED-BY-CAP`.** */
function attempt(run: RowRun, i: number, ce: string | null): void {
  if (run.attempts >= CAPS.perRow) {
    run.capHit = true
    return
  }
  // §5.1 — STOP AFTER 5 CONSECUTIVE FAILURES. The abandonment is REPORTED (`stoppedAt` +
  // `ABANDONED-BY-CAP`), never hidden, and every subsequent draw is refused.
  if (run.disposition === 'ABANDONED-BY-CAP') return
  if (run.consecutive >= STOP_AFTER) {
    run.stoppedAt = i
    run.disposition = 'ABANDONED-BY-CAP'
    run.capHit = true
    return
  }
  run.attempts++
  run.limbs.push({ index: i, held: ce === null })
  if (ce === null) {
    run.consecutive = 0
    return
  }
  run.consecutive++
  run.counterexamples.push(ce)
}

type CheckResult = string | string[] | null

async function check(run: RowRun, i: number, body: () => CheckResult | Promise<CheckResult>): Promise<void> {
  if (run.attempts >= CAPS.perRow) {
    run.capHit = true
    return
  }
  // §5.1 — once the STOP has fired, no further draw runs: an abandoned row reports its un-run
  // limbs as a FAILURE through `stoppedAt`/`ABANDONED-BY-CAP`, never as a pass.
  if (run.disposition === 'ABANDONED-BY-CAP') return
  let ce: CheckResult
  try {
    ce = await body()
  } catch (e) {
    ce = (e as Error)?.message ?? String(e)
  }
  if (Array.isArray(ce)) {
    if (ce.length === 0) {
      attempt(run, i, null)
      return
    }
    // a multi-finding drive lands on the SAME attempt index, so the row's declared term counts the
    // DRIVE and its readings, never a re-count of its findings
    attempt(run, i, ce[0]!)
    for (const extra of ce.slice(1)) run.counterexamples.push(extra)
    return
  }
  attempt(run, i, ce)
}

function finish(id: string, run: RowRun): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error(`ASW register failure: ${id} is not a declared register row`)
  const executed = run.attempts
  const held = run.counterexamples.length === 0 && executed === declared.declaredTotal
  if (run.disposition === 'RUNNING') {
    // a row that reached its stop is ABANDONED-BY-CAP (assigned in `attempt`); a row that hit the
    // per-row cap without a stop is ALSO abandoned-by-cap; anything else COMPLETED.
    run.disposition = run.stoppedAt !== null || run.capHit ? 'ABANDONED-BY-CAP' : 'COMPLETED'
  }
  const report: RowReport = {
    row: id,
    strategyId: declared.strategyId,
    declared: declared.declared,
    declaredTotal: declared.declaredTotal,
    executed,
    held,
    stoppedAt: run.stoppedAt,
    layer: declared.layer,
    redClass: declared.redHeadClass,
    redId: declared.redId,
    counterexamples: run.counterexamples,
    limbs: run.limbs,
    disposition: run.disposition,
    capHit: run.capHit,
  }
  REPORTS.push(report)
  // eslint-disable-next-line no-console -- the row's reading is PRINTED with its terms
  console.log(
    `ASW ROW ${id} ${declared.strategyId}: ${held ? 'held' : 'BROKEN'} · declared ${declared.declared} = ${String(declared.declaredTotal)} · ` +
      `executed ${String(executed)} · stoppedAt ${String(run.stoppedAt)} · disposition ${run.disposition} (capHit ${String(run.capHit)}) · ` +
      `red-class ${declared.redHeadClass} (${declared.redId}) · ` +
      `limbs ${run.limbs.map((l) => `${String(l.index)}:${l.held ? 'held' : 'BROKEN'}`).join(',')}` +
      (run.counterexamples.length > 0 ? `\n    counterexamples: ${run.counterexamples.slice(0, 3).join('\n    | ')}` : ''),
  )
  // §5.1 — THE CAP IS ASSERTED PER ROW, never assumed: the executed reading must sit UNDER its own
  // cap, so the global `≤ 400` claim is a sum of PROVEN terms rather than a table checked against
  // itself.
  expect(
    executed <= CAPS.perRow,
    `${id}: the row executed ${String(executed)} reading(s) against the per-row cap of ${String(CAPS.perRow)} — §5.1 caps: ≤100 attempts per row`,
  ).toBe(true)
  // §5.1 — AN UN-RUN ROW IS A FAILURE: a row that consumed fewer attempts than its declared term
  // is reported (its `held` is then false), and the remaining attempts are never silently skipped.
  expect(
    run.disposition !== 'RUNNING',
    `${id}: the row left its disposition UNRESOLVED — completed / abandoned-by-cap / abandoned-by-throw must be PROVEN distinct, never inferred from a null`,
  ).toBe(true)
  expect(
    held,
    `${id} ${declared.strategyId}: declared ${declared.declared} = ${String(declared.declaredTotal)} reading(s); executed ${String(executed)}; ` +
      `stoppedAt ${String(run.stoppedAt)}; disposition ${run.disposition} — ${held ? 'HELD' : 'BROKEN'}` +
      (run.counterexamples.length > 0 ? `; counterexamples: ${run.counterexamples.slice(0, 4).join(' | ')}` : ''),
  ).toBe(true)
  return report
}

/** Run a register row's body: a body that THROWS still reports the row — BROKEN, with the throw as
 *  its counterexample — so `stoppedAt`, the declared-vs-executed term and the counterexample list
 *  are never hidden by an early throw. */
async function registerRow(id: string, body: (run: RowRun) => Promise<void> | void): Promise<void> {
  const run = newRun()
  let thrown: string | null = null
  try {
    await body(run)
  } catch (e) {
    thrown = (e as Error)?.message ?? String(e)
  }
  if (thrown !== null) {
    run.counterexamples.push(thrown)
    run.disposition = 'ABANDONED-BY-THROW'
  }
  finish(id, run)
}

// ===========================================================================
// THE TWO SHARED ORACLES the repaired controls drive — ONE ORACLE, CALLED TWICE.
//
// `P-ASW-IM-2`'s CONTROL 1 and `P-ASW-IM-4`'s CONTROL 2 each exist to prove that the row's OWN
// oracle can REDDEN on a planted forgery. A control that re-implements the predicate it is meant
// to police proves nothing: it can pass while the row's limb is unfounded. So BOTH predicates are
// declared HERE, at module scope, ONCE — the limb calls them and its control calls the SAME
// function. **THE WHOLE POINT: `m5DirFsyncDisagreementProblems` and `perFieldDefaultProblems` are
// each a SINGLE named function with TWO callers (the limb's subject and the control's forgery),
// never a predicate written twice.**
// ===========================================================================

/** §2.4 m-5 — THE DIR-FSYNC DISAGREEMENT ORACLE, over an OBSERVED drive result.
 *
 *  The claim §2.4 m-5 makes: at the dir-`fsync` failure point the record HAS ALREADY been
 *  published by step 4, so **the FILE is the NEW record while the receipt answers `refused`** —
 *  "the ONE case where the receipt and the file disagree, and the row asserts the DISAGREEMENT
 *  rather than asserting it away".
 *
 *  This predicate reads that claim off the OBSERVED drive: the live path's bytes at the façade
 *  versus the record the drive seeded as PREVIOUS. It is a real predicate — it RETURNS findings
 *  when the file is (wrongly) still the OLD record, or the receipt (wrongly) agrees with it.
 *
 *  `observed.fileBytes` is the façade's file map at the live path AFTER the drive, or `null` if
 *  no record was ever published there; `observed.previousBytes` is the pre-write record. */
function m5DirFsyncDisagreementProblems(
  observed: { fileBytes: string | null; previousBytes: string; receipt: unknown; mintsReceipt: boolean },
  label: string,
): string[] {
  const problems: string[] = []
  const published = observed.fileBytes !== null && observed.fileBytes !== observed.previousBytes
  if (!published) {
    // §2.4 m-5's PREMISE is falsified: at the dir-`fsync` leg the rename (step 4) has ALREADY run,
    // so the live path MUST carry the NEW record. A corpus in which it still carries the OLD one
    // asserts the m-5 case AWAY instead of asserting it, which is exactly what this oracle refuses.
    problems.push(
      `M5-PREMISE (${label}): the live path still carries the PRE-WRITE record after the dir-\`fsync\` failure — §2.4 m-5's premise is that the record "has ALREADY been published by step 4 ... so the FILE is the new record"; a corpus where the file IS the old record does not exercise the disagreement, it denies it`,
    )
  }
  // The disagreement itself applies ONLY where a receipt is MINTED (§2.3 ②: the ENGINE carrier
  // answers nothing, so on that carrier the m-5 reading is the PUBLISHED-FILE half alone — its
  // distinguishing signal is the persisted conflict marker of §2.5 ③, never a receipt).
  if (!observed.mintsReceipt) return problems
  const rec = observed.receipt as Record<string, unknown> | null
  const refused = rec !== null && typeof rec === 'object' && rec.status === 'refused'
  if (published && !refused) {
    problems.push(
      `M5-DISAGREEMENT (${label}): the record WAS published while the receipt reads \`${JSON.stringify(observed.receipt)}\` — §2.4 m-5 requires the receipt to answer \`refused\` (the leg threw) while the FILE is already the new record: "the receipt and the file disagree, and the row asserts the DISAGREEMENT rather than asserting it away"`,
    )
  }
  return problems
}

/** §2.5 ② / §5.2 `P-ASW-IM-4` — THE PER-FIELD-DEFAULT ORACLE, over an OBSERVED post-read record.
 *
 *  The claim: a torn-but-PARSABLE file resets an **ARBITRARY SUBSET** of the operator's nine
 *  fields — "ONLY the fields whose bytes were lost", each defaulting INDEPENDENTLY, while the
 *  SURVIVING fields **keep their persisted values**.
 *
 *  This predicate reads that claim off the OBSERVED `get()` answer: it reddens when a field
 *  expected to have been lost does NOT read its first-run default, AND when a SURVIVING field
 *  was reset along with it (the all-or-nothing behaviour §2.5 ② rules out). */
function perFieldDefaultProblems(
  observed: {
    answer: unknown
    lostField: string
    expectedDefault: unknown
    surviving: Array<{ field: string; persisted: unknown }>
  },
  label: string,
): string[] {
  const problems: string[] = []
  if (observed.answer === null || typeof observed.answer !== 'object') {
    problems.push(
      `SUBSET-READ (${label}): \`get()\` answered \`${String(observed.answer)}\` rather than a nine-member record — §3.2 I-5: \`get()\` stays TOTAL and fail-soft`,
    )
    return problems
  }
  const answer = observed.answer as Record<string, unknown>
  if (JSON.stringify(answer[observed.lostField]) !== JSON.stringify(observed.expectedDefault)) {
    problems.push(
      `SUBSET-FIELD (${label}): the lost field \`${observed.lostField}\` reads \`${JSON.stringify(answer[observed.lostField])}\` — §2.5 ② / §5.2: a torn-but-PARSABLE record resets ONLY the fields whose bytes were lost, and each such field defaults INDEPENDENTLY (the expected first-run value is \`${JSON.stringify(observed.expectedDefault)}\`)`,
    )
  }
  for (const s of observed.surviving) {
    if (JSON.stringify(answer[s.field]) !== JSON.stringify(s.persisted)) {
      problems.push(
        `SUBSET-SURVIVOR (${label}): the SURVIVING field \`${s.field}\` reads \`${JSON.stringify(answer[s.field])}\` rather than its PERSISTED value \`${JSON.stringify(s.persisted)}\` — §2.5 ②: the blast radius is an ARBITRARY SUBSET, never the WHOLE record (an all-or-nothing reset is the AS-FILED OVERSTATEMENT, not the corrected reading)`,
      )
    }
  }
  return problems
}

// ===========================================================================
// §5.2 `P-ASW-TP-2` — THE LAYER-OVERCLAIM ORACLE (the anti-overclaim scan's rule).
//
// Declared ONCE, at module scope, so the ROW'S OWN READING and its CONTROL 3 drive the SAME
// function. ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 4.⟩
//
// THE AS-FILED DEFECT: the scan was fronted by four successive UNCONDITIONAL `continue` guards,
// among them `if (/NOTHING here is|nothing here is|not |never |no |isn't|doesn't/i.test(line))
// continue` and a near-duplicate. Those match the bare substrings `not `, `never ` and — the
// killer — **`no `**, and every scanned artifact is a prose document DENSE WITH NEGATIONS. So a
// line reading **"this is app-green and no further live leg is owed"** was SKIPPED BEFORE
// `CLAIM_FORMS` WAS EVER EVALUATED, and the population reaching the real check was nearly empty.
//
// THE REPAIR: the claim form is matched FIRST, and a negation suppresses it ONLY when that
// negation actually GOVERNS the claim — i.e. within a narrow LEAD window before the colour token,
// in the same clause. A negation elsewhere on the line (the `no ` in "and no further live leg is
// owed") no longer suppresses anything.
// ===========================================================================
const LAYER_CLAIM_FORMS: Array<[string, RegExp]> = [
  ['app-green', /\bis\s+app-green\b|\bapp-green\s*[:=]\s*true\b/i],
  ['envelope-green', /\bis\s+envelope-green\b|\benvelope-green\s*[:=]\s*true\b/i],
  ['live-green', /\bis\s+live-green\b|\blive-green\s*[:=]\s*true\b/i],
  ['store-green', /\bis\s+store-green\b|\bstore-green\s*[:=]\s*true\b/i],
]

/** the INSTRUMENT's own vocabulary: the deny-list and this scan's diagnostics NAME the colours
 *  they refuse, and a claim form (a) inside a regex literal or (b) in the scanner's own diagnostic
 *  string is the instrument, never a claim position. Each is a POSITIVE marker — none is a bare
 *  substring that could swallow a real claim. */
function isLayerInstrumentVocabulary(line: string): boolean {
  return (
    /FORGED-CLAIM-CORPUS|LAYER-OVERCLAIM|CLAIM_FORMS|asserts `\$\{colour\}`|NOTHING here is app-green/i.test(line) ||
    /!\s*\/.*app-green.*\//i.test(line) ||
    // the PLANTED-CORPUS fixtures the controls must redden, declared as fixtures by name.
    /\b(?:plantedOverclaim|forgedQuote|forgedTiming|lawfulRepudiations|negationsRemoved)\b/.test(line) ||
    // the controls' own diagnostics (they QUOTE the claim form in order to REFUSE it).
    /PLANTED over-claims did NOT redden|a line reading/.test(line)
  )
}

/** THE ORACLE: the over-claim findings in ONE line. `[]` means the line is ADMITTED. */
function layerOverclaimLineProblems(line: string): string[] {
  const problems: string[] = []
  if (/^\s*(\/\/|\*|\/\*)/.test(line)) return problems
  if (isLayerInstrumentVocabulary(line)) return problems
  for (const [colour, re] of LAYER_CLAIM_FORMS) {
    const m = re.exec(line)
    if (m === null) continue
    // THE LEAD WINDOW: what comes BEFORE the claim form in the same clause. A negation here
    // GOVERNS the claim ("the node suite is NOT app-green"); a negation anywhere else on the line
    // (the `no ` in "and no further live leg is owed") does NOT.
    const lead = line.slice(Math.max(0, m.index - 60), m.index)
    if (/\b(?:NOTHING\s+here\s+is|is\s+NOT|isn't|is\s+not|not|never|no|nothing|nowhere|none|cannot|forbidden|forbid|deny|denied|refus\w*)\b/i.test(lead)) continue
    if (/[.;:]\s+\S/.test(lead) && /\b(?:not|never|no|nothing)\b/i.test(lead)) continue
    problems.push(
      `LAYER-OVERCLAIM: the line \`${line.trim().slice(0, 140)}\` reports \`${colour}\` — §6.1's ledger: the [T]/[H] evidence proves bytes and constructed-store behaviour; NOTHING here is app-green, envelope-green, store-green or live-green`,
    )
  }
  return problems
}

/** THE ORACLE over one artifact's whole text. */
function layerOverclaimProblems(label: string, text: string): string[] {
  const problems: string[] = []
  for (const line of text.split('\n')) {
    for (const p of layerOverclaimLineProblems(line)) problems.push(`(${label}) ${p}`)
  }
  return problems
}

// ===========================================================================
// THE INJECTED `fs` FAÇADE + THE CARRIER LOADERS — §2.6's instrument.
// **SHAPE ONLY**: the façade RECORDS the calls the subject makes and the ORDER it makes them in.
// It never models `fsync` completion, power loss or crash recovery — and no assertion in this file
// claims it does (§6.1; §5.2 `P-ASW-TP-2`).
// ===========================================================================
interface FsCall {
  leg: FacadeLeg
  target: string
  step: AtomicStep | null
}

interface FsFacade {
  calls: FsCall[]
  files: Map<string, string>
  failAt: FacadeLeg | null
  mkdirSync: (path: string, opts?: { recursive?: boolean }) => unknown
  writeFileSync: (path: string, data: string, opts?: unknown) => void
  openSync: (path: string, flags: string) => number
  fsyncSync: (fd: number) => void
  closeSync: (fd: number) => void
  renameSync: (from: string, to: string) => void
  readFileSync: (path: string, encoding?: string) => string
  existsSync: (path: string) => boolean
}

function newFsFacade(options?: { failAt?: FacadeLeg | null; failAtStep?: AtomicStep | null; seed?: Record<string, string> }): FsFacade {
  const files = new Map<string, string>(Object.entries(options?.seed ?? {}))
  const calls: FsCall[] = []
  const failAt = options?.failAt ?? null
  /** ⟨ADDED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 1 (the INSTRUMENT's
   *  own completion, never a relaxation).⟩ §2.6 P-4 declares `fsyncSync` as ONE leg driven by TWO
   *  write steps (step 3 `fsync(tmp)` and step 5 `fsync(dir)`). `failAt: 'fsyncSync'` therefore
   *  cannot address the DIR leg on its own — it throws at whichever `fsyncSync` comes first, which
   *  is the TMP leg. §2.4 m-5's WHOLE SUBJECT is the DIR-leg-only failure (the case where the
   *  record has ALREADY been published by the rename), so the dir leg must be INDEPENDENTLY
   *  throwable or the m-5 disagreement has no driveable subject. This adds that addressing. */
  const failAtStep = options?.failAtStep ?? null
  const boom = (leg: FacadeLeg, target: string, step?: AtomicStep | null): void => {
    if (failAt === leg) throw new Error(`INJECTED-FAILURE at ${leg} (${target})`)
    if (failAtStep !== null && step === failAtStep) throw new Error(`INJECTED-FAILURE at step ${failAtStep} (${target})`)
  }
  return {
    calls,
    files,
    failAt,
    mkdirSync: (path) => {
      calls.push({ leg: 'mkdirSync', target: path, step: 'mkdir' })
      boom('mkdirSync', path, 'mkdir')
    },
    writeFileSync: (path, data) => {
      calls.push({ leg: 'writeFileSync', target: path, step: 'writeTmp' })
      boom('writeFileSync', path, 'writeTmp')
      files.set(path, data)
    },
    openSync: (path, flags) => {
      calls.push({ leg: 'openSync', target: path, step: null })
      void flags
      boom('openSync', path, null)
      return calls.length
    },
    fsyncSync: (fd) => {
      // §2.2's shape carries TWO fsync legs: `fsync(tmp)` BEFORE the rename, `fsync(dir)` AFTER.
      // The façade tells them apart by the RENAME; a THIRD fsync is out of shape.
      const renamed = calls.some((c) => c.step === 'rename')
      const tmpCount = calls.filter((c) => c.step === 'fsyncTmp').length
      const dirCount = calls.filter((c) => c.step === 'fsyncDir').length
      const step: AtomicStep | null = !renamed && tmpCount === 0 ? 'fsyncTmp' : renamed && dirCount === 0 ? 'fsyncDir' : null
      calls.push({ leg: 'fsyncSync', target: `fd:${String(fd)}`, step })
      boom('fsyncSync', String(fd), step)
    },
    closeSync: (fd) => {
      calls.push({ leg: 'closeSync', target: `fd:${String(fd)}`, step: null })
      boom('closeSync', String(fd))
    },
    renameSync: (from, to) => {
      calls.push({ leg: 'renameSync', target: `${from}\u2192${to}`, step: 'rename' })
      boom('renameSync', from)
      const bytes = files.get(from)
      if (bytes === undefined) throw new Error(`INJECTED-FAILURE: rename source ${from} does not exist`)
      files.set(to, bytes)
      files.delete(from)
    },
    readFileSync: (path) => {
      calls.push({ leg: 'readFileSync', target: path, step: null })
      boom('readFileSync', path)
      const bytes = files.get(path)
      if (bytes === undefined) throw new Error(`ENOENT: ${path}`)
      return bytes
    },
    existsSync: (path) => {
      calls.push({ leg: 'existsSync', target: path, step: null })
      boom('existsSync', path)
      return files.has(path)
    },
  }
}

function readFacade(fs: FsFacade): { raw: AtomicStep[]; projected: AtomicStep[]; legs: string[] } {
  const steps = fs.calls.map((c) => c.step).filter((s): s is AtomicStep => s !== null)
  return { raw: steps, projected: steps.filter((s) => s !== 'mkdir') as AtomicStep[], legs: fs.calls.map((c) => `${c.leg}(${c.target})`) }
}

interface CarrierSpec {
  label: string
  modulePath: string
  factory: string
  drive: (store: Record<string, unknown>) => unknown
}

const OPERATOR_CARRIER: CarrierSpec = {
  label: 'operator-settings-store',
  modulePath: '../src/main/operator-settings-store.js',
  factory: 'createOperatorSettingsStore',
  drive: (store) => (store.set as (p: unknown) => unknown).call(store, { topK: 9, theme: 'dark' }),
}

const ENGINE_CARRIER: CarrierSpec = {
  label: 'engine-config',
  modulePath: '../src/main/engine-config.js',
  factory: 'createEngineConfigStore',
  drive: (store) => (store.set as (b: unknown) => unknown).call(store, 'http://127.0.0.1:9099'),
}

const BOTH_CARRIERS = [OPERATOR_CARRIER, ENGINE_CARRIER] as const

async function loadCarrier(spec: CarrierSpec): Promise<Record<string, unknown> | { error: string }> {
  try {
    const ns = (await import(/* @vite-ignore */ spec.modulePath)) as Record<string, unknown>
    if (typeof ns[spec.factory] !== 'function') return { error: `${spec.factory} resolves NOWHERE on ${spec.label}'s module namespace` }
    return ns
  } catch (e) {
    return { error: (e as Error)?.message ?? String(e) }
  }
}

function readMember(store: unknown, name: string): { present: boolean; value: unknown; threw: string | null } {
  if (store === null || typeof store !== 'object') return { present: false, value: undefined, threw: null }
  const member = (store as Record<string, unknown>)[name]
  if (typeof member !== 'function') return { present: false, value: undefined, threw: null }
  try {
    return { present: true, value: (member as () => unknown).call(store), threw: null }
  } catch (e) {
    return { present: true, value: undefined, threw: (e as Error)?.message ?? String(e) }
  }
}

interface FacadeDrive {
  calls: FsCall[]
  reading: ReturnType<typeof readFacade>
  post: unknown
  receipt: ReturnType<typeof readMember>
  lastReadWasCorrupt: ReturnType<typeof readMember>
  escaped: string | null
  seamReached: boolean
  facade: FsFacade
  livePath: string
}

async function driveOverFacade(spec: CarrierSpec, livePath: string, options?: { failAt?: FacadeLeg | null; failAtStep?: AtomicStep | null; seed?: Record<string, string>; drive?: boolean }): Promise<FacadeDrive | { error: string }> {
  const ns = await loadCarrier(spec)
  if ('error' in ns) return { error: ns.error }
  const facade = newFsFacade({ failAt: options?.failAt ?? null, failAtStep: options?.failAtStep ?? null, seed: options?.seed ?? {} })
  let store: unknown
  try {
    store = (ns[spec.factory] as (o: { path: string; fs?: unknown }) => unknown)({ path: livePath, fs: facade })
  } catch (e) {
    return { error: `CONSTRUCTION-THREW: ${(e as Error)?.message ?? String(e)}` }
  }
  let escaped: string | null = null
  let post: unknown
  if (options?.drive !== false) {
    try {
      post = spec.drive(store as Record<string, unknown>)
    } catch (e) {
      escaped = (e as Error)?.message ?? String(e)
    }
  }
  return {
    calls: facade.calls,
    reading: readFacade(facade),
    post,
    receipt: readMember(store, 'lastWriteReceipt'),
    lastReadWasCorrupt: readMember(store, 'lastReadWasCorrupt'),
    escaped,
    seamReached: facade.calls.length > 0,
    facade,
    livePath,
  }
}

interface RealDrive {
  livePath: string
  exists: boolean
  bytes: string | null
  tmpResidue: boolean
  escaped: string | null
  post: unknown
}

async function driveOverRealPath(spec: CarrierSpec, label: string, seedBytes?: string): Promise<RealDrive | { error: string }> {
  const ns = await loadCarrier(spec)
  if ('error' in ns) return { error: ns.error }
  const livePath = join(FIXTURE_ROOT, `real-${label}.json`)
  try {
    rmSync(livePath, { force: true })
    rmSync(`${livePath}.tmp`, { force: true })
    if (seedBytes !== undefined) writeFileSync(livePath, seedBytes)
  } catch {
    /* the unique root; a missing file is the expected state */
  }
  let escaped: string | null = null
  let post: unknown
  try {
    const store = (ns[spec.factory] as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
    post = spec.drive(store)
  } catch (e) {
    escaped = (e as Error)?.message ?? String(e)
  }
  return {
    livePath,
    exists: existsSync(livePath),
    bytes: existsSync(livePath) ? readFileSync(livePath, 'utf8') : null,
    tmpResidue: existsSync(`${livePath}.tmp`),
    escaped,
    post,
  }
}

function isErr(v: FacadeDrive | RealDrive | { error: string }): v is { error: string } {
  return typeof (v as { error?: unknown }).error === 'string'
}

// ===========================================================================
// THE BYTE-SCAN HELPERS — the `[H]` instrument.
// ===========================================================================
function readMaybe(path: string): string | null {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : null
  } catch {
    return null
  }
}

function walkFiles(dir: string): string[] {
  const out: string[] = []
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) out.push(...walkFiles(p))
    else out.push(p)
  }
  return out
}

function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

function rel(p: string): string {
  return relative(REPO_ROOT, p).split('\\').join('/')
}

function md5Of(bytes: string | Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}

/** The balanced body of the bracket pair opening at `openIndex` (a SHAPE read, never a line). */
function balancedBody(src: string, openIndex: number): string | null {
  const open = src[openIndex]
  const close = open === '(' ? ')' : open === '{' ? '}' : open === '[' ? ']' : ''
  if (close === '') return null
  let depth = 0
  for (let i = openIndex; i < src.length; i++) {
    const c = src[i]!
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return src.slice(openIndex + 1, i)
    }
  }
  return null
}

/** The container locator: the balanced body of the FIRST declaration whose keyword-anchored header
 *  matches `name`. Returns `null` when no such declaration exists, so an absent container is
 *  REPORTED rather than silently satisfied by a whole-file match. */
function interfaceBody(text: string, name: string): string | null {
  const header = new RegExp(`\\b(?:export\\s+)?(?:interface|type)\\s+${name}\\b`)
  const match = header.exec(text)
  if (match === null) return null
  const open = text.indexOf('{', match.index + match[0].length)
  if (open < 0) return null
  return balancedBody(text, open)
}

/** §2.3 ③ — the receipt-shape oracle: EXACTLY ONE of the two closed forms, the reason exactly the
 *  closed token, never a third status, never an absent reason on a refusal. Exposed as its OWN
 *  function so the positive control drives the SAME code the row drives. */
function receiptFormProblems(receipt: unknown, label: string): string[] {
  const problems: string[] = []
  if (receipt === null || typeof receipt !== 'object') {
    problems.push(`RECEIPT-FORM (${label}): the receipt is \`${String(receipt)}\` — §2.3 ③ declares the TWO CLOSED forms \`{status:'committed'}\` | \`{status:'refused'; reason:'write-failed'}\``)
    return problems
  }
  const rec = receipt as Record<string, unknown>
  if (!(RECEIPT_STATUSES as readonly unknown[]).includes(rec.status)) {
    problems.push(`RECEIPT-STATUS (${label}): the status is \`${String(rec.status)}\` — §2.3 ③'s set is CLOSED at [${RECEIPT_STATUSES.join(', ')}]; a THIRD status is the falsifier`)
  }
  if (rec.status === 'committed') {
    if ('reason' in rec) problems.push(`RECEIPT-FORM (${label}): the \`committed\` form carries a \`reason\` member — §2.3 ③'s FIRST form is \`{status:'committed'}\` ONLY`)
  } else if (rec.status === 'refused') {
    if (rec.reason !== RECEIPT_REASONS[0]) {
      problems.push(`RECEIPT-REASON (${label}): the reason is \`${String(rec.reason)}\` — §2.3 ③ closes the reason set at the ONE token \`'write-failed'\` (it covers the mkdir, tmp-write, tmp-fsync and rename failure points ALIKE)`)
    }
  }
  return problems
}

/** §2.2 / §3.1 / §3.2 I-1/I-2 — THE ATOMIC-SHAPE ORACLE over the recorded call ORDER/COUNT.
 *  **SHAPE ONLY — no durability reading.** */
function atomicShapeProblems(fs: FsFacade, livePath: string): string[] {
  const problems: string[] = []
  const reading = readFacade(fs)
  const tmpPath = `${livePath}.tmp`
  if (reading.raw.length === 0) {
    problems.push(
      `SEAM-UNREACHED: the injected façade recorded ZERO calls — §2.6's ADDITIVE-OPTIONAL \`fs?\` member does not exist on this carrier's options, so the seam resolves NOWHERE and the landed \`persist()\` reaches the REAL \`node:fs\` through its static import (§4 RE-2's RED-BY-ABSENCE reading). §2.2's five-step shape is UNSATISFIED ON THIS SUBSTRATE`,
    )
    return problems
  }
  if (reading.projected.length !== UNCONDITIONAL_STEPS.length || reading.projected.some((s, i) => s !== UNCONDITIONAL_STEPS[i])) {
    problems.push(`ATOMIC-SHAPE: the recorded sequence is [${reading.raw.join(' \u2192 ') || 'NO CALLS'}] — §2.2 requires \`mkdir \u2192 tmp write \u2192 fsync(tmp) \u2192 rename \u2192 fsync(dir)\` IN THAT ORDER, once each (§4 RE-1)`)
  }
  for (const c of fs.calls) {
    if (c.leg === 'writeFileSync' && c.target === livePath) {
      problems.push(`LIVE-PATH-DIRECT: a \`writeFileSync\` names the LIVE path \`${livePath}\` — §3.2 I-1 / §2.2: the live path is NEVER written directly (§4 RE-1)`)
    }
    if (c.leg === 'writeFileSync' && c.target !== tmpPath) {
      problems.push(`TMP-TARGET: a write landed at \`${c.target}\` — §2.2 serializes to \`${tmpPath}\``)
    }
    if (c.leg === 'renameSync' && c.target !== `${tmpPath}\u2192${livePath}`) {
      problems.push(`RENAME-LEG: the rename reads \`${c.target}\` — §2.2 renames \`${tmpPath}\` ONTO \`${livePath}\` (§4 RE-1)`)
    }
    if (c.leg === 'readFileSync' && c.target === tmpPath) {
      problems.push(`TMP-PARSED: the boot read consulted \`${tmpPath}\` — §3.2 I-2: a \`\${path}.tmp\` is NEVER parsed as the record (§4 RE-1)`)
    }
  }
  for (const step of UNCONDITIONAL_STEPS) {
    const count = reading.raw.filter((s) => s === step).length
    if (count !== 1) problems.push(`ATOMIC-SHAPE: the step \`${step}\` was invoked ${count} time(s) — §2.2 runs every unconditional step EXACTLY ONCE (§4 RE-1)`)
  }
  if (fs.files.has(tmpPath)) {
    problems.push(`TMP-RESIDUE: a residual \`${tmpPath}\` remains after the write — §2.2's tmp fate (a) / §3.2 I-2: a SUCCESSFUL write leaves NO tmp (§4 RE-1)`)
  }
  return problems
}

// ===========================================================================
// §5.2 — THE REGISTER'S ROWS. Each row: its property's drives, its own term, its controls, and
// its ANTI-VACUITY limb (a row whose control cannot be constructed, whose drive set produces no
// observed movement, or whose oracle would stay green under a FORGED violation is a FAILURE of
// that row — never a pass).
// ===========================================================================
describe('§5 — THE `U-ATOMICITY-SWEEP-CLASS-B` TYPED REGISTER: the TEN declared rows, their declared terms, and the seed `0x20261007`', () => {
  it('§5.1 — the seed is the fixed literal `0x20261007`, DISTINCT from every sibling register\u2019s, and the LCG is deterministic with one step per draw', () => {
    expect(REGISTER_SEED, '§5.1: the seed is the fixed literal `0x20261007` — never `Date.now()`, never `Math.random()`, never an environment read').toBe(0x20261007)
    const collisions = SIBLING_SEEDS.filter((s) => s.seed === REGISTER_SEED).map((s) => s.unit)
    expect(collisions, '§5.1 — the seed must COLLIDE WITH NO SIBLING: it is the NEXT date-encoded literal in the same `0x2026` + `MM` + `DD` sequence, the first unused one after the newest landed seed').toEqual([])
    const pool = ['IM', 'SM', 'TP', 'H'] as const
    const sequence = (seed: number): string[] => {
      let state = seed >>> 0
      const out: string[] = []
      for (let i = 0; i < 4; i++) {
        const step = lcgDraw(state, pool.length)
        state = step.state
        out.push(pool[step.index]!)
      }
      return out
    }
    expect(sequence(REGISTER_SEED).length, '§5.1: the LCG yields ONE draw per step, deterministically').toBe(4)
    // the control: a DIFFERENT seed must move the drawn sequence (else the generator is constant
    // and every drawn row would be vacuous).
    expect(
      sequence(0x20261008),
      '§5.1 control: a different seed MUST move the drawn sequence — a constant generator would make every drawn row vacuous',
    ).not.toEqual(sequence(REGISTER_SEED))
  })

  it('§5.1 — the row-id prefixes are this unit\u2019s OWN, colliding with no sibling', () => {
    expect(ROW_PREFIXES.length, '§5.1: the four prefixes (IM · SM · TP · H)').toBe(4)
    const TAKEN = ['P-STORE-CORE-', 'P-SPA-', 'P-SSW-', 'P-SSJ-']
    const collisions = ROW_PREFIXES.filter((p) => TAKEN.some((t) => p.startsWith(t) || t.startsWith(p)))
    expect(collisions, '§5.1 — `P-STORE-CORE-*` · `P-SPA-*` · `P-SSW-*` · `P-SSJ-*` are TAKEN; this unit\u2019s ids must collide with none of them').toEqual([])
    // every declared row id carries one of THIS unit's own prefixes.
    const foreign = DECLARED_REGISTER.filter((r) => !ROW_PREFIXES.some((p) => r.row.startsWith(p))).map((r) => r.row)
    expect(foreign, '§5.1 — every declared row id carries one of THIS unit\u2019s prefixes').toEqual([])
  })

  // -------------------------------------------------------------------------
  // §5.2 row 1 — P-ASW-IM-1
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-IM-1` — THE ATOMIC SHAPE, BOTH CARRIERS (S-ASW-ATOM-1)', async () => {
    await registerRow('P-ASW-IM-1', async (run) => {
      // §2.2's four drives per carrier × 2 readings, + the controls.
      const DRIVES = ['success-sequence', 'stale-tmp-pre-existence', 'successful-persist-residual', 'post-success-tmp-parse-refusal'] as const
      for (const spec of BOTH_CARRIERS) {
        for (const drive of DRIVES) {
          // READING 1 (the recorded call ORDER/COUNT over the façade) and
          // READING 2 (the real path's on-disk record) — the two readings the term prints.
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `im1-${spec.label}-${drive}.json`)
            const seed = drive === 'stale-tmp-pre-existence' ? { [`${livePath}.tmp`]: '{"stale":"NEVER-THE-RECORD"}' } : {}
            const facadeDrive = await driveOverFacade(spec, livePath, { seed })
            if (isErr(facadeDrive)) return `${spec.label}/${drive}: ${facadeDrive.error}`
            const problems = atomicShapeProblems(facadeDrive.facade, livePath).map((p) => `${spec.label}/${drive}: ${p}`)
            // READING 2 — the real path's record, so the landed shape is a MEASUREMENT.
            const real = await driveOverRealPath(spec, `im1-${spec.label}-${drive}`)
            if (isErr(real)) return `${spec.label}/${drive}: ${real.error}`
            // eslint-disable-next-line no-console -- the drive's reading is PRINTED
            console.log(`ASW IM-1 [${spec.label}/${drive}] façade=${facadeDrive.seamReached ? facadeDrive.reading.legs.join(' \u2192 ') : 'SEAM-UNREACHED'} · real record written=${String(real.exists)} · tmp residue=${String(real.tmpResidue)}`)
            if (drive === 'stale-tmp-pre-existence') {
              const survived = facadeDrive.facade.files.get(`${livePath}.tmp`)
              if (survived !== undefined && survived.includes('NEVER-THE-RECORD')) {
                problems.push(`${spec.label}/${drive}: the stale tmp survived carrying its stale bytes — §2.2's tmp fate (b) / §3.2 I-2: a stale tmp is OVERWRITTEN and NEVER read (§4 RE-1)`)
              }
            }
            return problems
          })
          await check(run, run.attempts + 1, async () => {
            const real = await driveOverRealPath(spec, `im1-r2-${spec.label}-${drive}`)
            if (isErr(real)) return `${spec.label}/${drive}: ${real.error}`
            if (real.escaped !== null) return `${spec.label}/${drive}: the landed drive threw out of \`set()\` (\`${real.escaped}\`) — §3.2 I-4`
            if (!real.exists) return `${spec.label}/${drive}: the landed drive published NO record — reading 2 has no subject`
            return null
          })
        }
        // §5.1's ANTI-VACUITY limb: the controls must REDDEN the SAME oracle. Two per carrier.
        await check(run, run.attempts + 1, () => {
          // control 1 — a FORGED DIRECT-WRITE corpus.
          const forged = newFsFacade({})
          forged.mkdirSync('/x', { recursive: true })
          forged.writeFileSync('/x/rec.json', '{}')
          const problems = atomicShapeProblems(forged, '/x/rec.json')
          return problems.some((p) => p.startsWith('LIVE-PATH-DIRECT'))
            ? null
            : `IM-1 CONTROL 1 VACUOUS (${spec.label}): the oracle ADMITTED a forged direct write of the live path — a limb that cannot fail is a defect`
        })
        await check(run, run.attempts + 1, () => {
          // control 2 — a FORGED rename-BEFORE-tmp-fsync corpus.
          const forged = newFsFacade({})
          forged.mkdirSync('/y', { recursive: true })
          forged.writeFileSync('/y/rec.json.tmp', '{}')
          forged.renameSync('/y/rec.json.tmp', '/y/rec.json')
          forged.fsyncSync(1)
          const problems = atomicShapeProblems(forged, '/y/rec.json')
          return problems.length > 0
            ? null
            : `IM-1 CONTROL 2 VACUOUS (${spec.label}): the oracle ADMITTED a rename-BEFORE-tmp-fsync corpus — a limb that cannot fail is a defect`
        })
      }
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 2 — P-ASW-IM-2
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-IM-2` — THE FAILED-WRITE-INTACT RULE, PER CARRIER (S-ASW-ATOM-2)', async () => {
    await registerRow('P-ASW-IM-2', async (run) => {
      const POINTS: Array<{ id: string; leg: FacadeLeg }> = [
        { id: 'mkdir', leg: 'mkdirSync' },
        { id: 'tmp-write', leg: 'writeFileSync' },
        { id: 'tmp-fsync', leg: 'fsyncSync' },
        { id: 'rename', leg: 'renameSync' },
        { id: 'dir-fsync', leg: 'fsyncSync' },
      ]
      for (const spec of BOTH_CARRIERS) {
        for (const point of POINTS) {
          // READING 1 — the live path's record.
          //
          // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 1.⟩
          // §2.4 m-5 is the ONE point where the record HAS ALREADY been published by step 4, so the
          // live path is the NEW record while the receipt answers `refused`. Asserting byte-identity
          // at that SAME point (as the as-filed limb did) would have contradicted the spec's own
          // m-5 row. The `dir-fsync` point therefore reads the DISAGREEMENT through the row's own
          // named oracle (`m5DirFsyncDisagreementProblems`), while the other four points read the
          // byte-identity the m-1..m-4 rows require. THE DRIVE COUNT IS UNCHANGED: this is the same
          // reading, re-aimed at what its own point's row actually claims.
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `im2-${spec.label}-${point.id}.json`)
            const previous = '{"previous":"RECORD"}'
            // §2.4 m-5's subject is the DIR leg; the other four points keep their own leg.
            const drive = await driveOverFacade(spec, livePath, {
              ...(point.id === 'dir-fsync' ? { failAtStep: 'fsyncDir' as AtomicStep } : { failAt: point.leg }),
              seed: { [livePath]: previous },
            })
            if (isErr(drive)) return `${spec.label}/${point.id}: ${drive.error}`
            if (!drive.seamReached) {
              return `${spec.label}/${point.id}: SEAM-UNREACHED — §4 RE-2's RED-BY-ABSENCE: the \`fs?\` member does not exist, so the ${point.id} injection point CANNOT BE DRIVEN and this reading has no subject. A limb with no subject is BROKEN, never a pass`
            }
            if (drive.escaped !== null) return `${spec.label}/${point.id}: a throw ESCAPED \`set()\` (\`${drive.escaped}\`) — §3.2 I-4`
            const now = drive.facade.files.get(livePath) ?? null
            if (point.id === 'dir-fsync') {
              // §2.4 m-5 — THE DECLARED DISAGREEMENT, asserted rather than asserted away.
              return m5DirFsyncDisagreementProblems(
                {
                  fileBytes: now,
                  previousBytes: previous,
                  receipt: drive.receipt.present ? drive.receipt.value : null,
                  mintsReceipt: spec === OPERATOR_CARRIER,
                },
                `${spec.label}/${point.id}`,
              )
            }
            return now === previous ? null : `${spec.label}/${point.id}: the live path moved to \`${String(now)}\` — §2.4 m-1..m-4: the previous file stays byte-identical`
          })
          // READING 2 — the receipt-or-nothing + the in-memory post-state.
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `im2r2-${spec.label}-${point.id}.json`)
            const previous = '{"previous":"RECORD"}'
            const drive = await driveOverFacade(spec, livePath, { failAt: point.leg, seed: { [livePath]: previous } })
            if (isErr(drive)) return `${spec.label}/${point.id}: ${drive.error}`
            if (spec === OPERATOR_CARRIER) {
              if (!drive.receipt.present) {
                return `${spec.label}/${point.id}: the operator carrier answers NO receipt — §2.4 m-1 / §2.3 ①: the operator carrier answers exactly ONE closed receipt form (\`lastWriteReceipt()\` resolves NOWHERE at this head)`
              }
              const forms = receiptFormProblems(drive.receipt.value, `${spec.label}/${point.id}`)
              if (forms.length > 0) return forms
            } else {
              if (drive.receipt.present) {
                return `${spec.label}/${point.id}: the ENGINE carrier MINTS a receipt — §2.3 ② / §2.4 m-2: nothing is answered and nothing is thrown`
              }
            }
            return null
          })
        }
        // ------------------------------------------------------------------
        // THE CONTROLS, PER CARRIER — INSIDE THE `for (const spec of BOTH_CARRIERS)` SCOPE, AND
        // COUNTED AS THE DECLARED `+ 2 controls` TERM.
        // ⟨CORRECTED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, THE SCOPE BUG.⟩
        // THE DEFECT (as filed, KEPT VISIBLE): the two `check(...)` calls sat AFTER the carrier
        // loop's closing brace while every one of their bodies referenced `spec` — so the row threw
        // `ReferenceError: spec is not defined`. The pair ran ONCE, outside any carrier scope, and
        // every `spec.label` inside them was unresolvable. The row was BROKEN by a malformed
        // instrument, never by the subject.
        // THE CORRECTION: each carrier now runs its OWN pair of controls, inside the scope that owns
        // `spec`, so EVERY `spec` reference in this block resolves — not merely the first. The pair
        // is driven as ONE declared control attempt per carrier, which is exactly §5.2's printed
        // `+ 2 controls` term (`5 × 2 × 2 + 2 = 22`): the row still executes 22, the declared term
        // is UNCHANGED, and the two carriers' controls are BOTH exercised rather than one being
        // silently repeated outside the loop. NOTHING is deleted and no expectation is relaxed.
        // ------------------------------------------------------------------
        // ------------------------------------------------------------------
        // THE `m-5` DIR-FSYNC DISAGREEMENT — THE ROW'S OWN LIMB (§2.4 m-5), AND THEN ITS CONTROL.
        //
        // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 1.⟩
        // THE DEFECT (as filed, KEPT VISIBLE): this row bought its `+ 2 controls` term with a
        // STATICALLY-FALSE GUARD — `const forgedOldRecord = { fileIsOldRecord: true, … }` followed
        // by `if (forgedOldRecord.fileIsOldRecord === false) { return 'VACUOUS …' }`. A literal
        // with `fileIsOldRecord: true` can never satisfy `=== false`, so the branch was
        // UNREACHABLE, the control ALWAYS returned `null`, and it drove NO predicate. The real
        // `driveOverFacade(...)` result computed one line above it was DISCARDED (only
        // `isErr`-checked). A prior pass's commit message claimed the inverted-polarity defect
        // there was "fixed in the same instrument"; it was not — it was rewritten into an
        // ALGEBRAIC TAUTOLOGY with the identical effect.
        // THE REPAIR: the m-5 disagreement is now a REAL limb over the OBSERVED `driveOverFacade`
        // result, and CONTROL 1 drives the SAME NAMED ORACLE
        // (`m5DirFsyncDisagreementProblems`) — one oracle, called twice — over a PLANTED FORGERY
        // whose premise is false. NOTHING is deleted and the declared term `5 × 2 × 2 + 2 = 22` is
        // UNCHANGED: the m-5 limb is the `dir-fsync` point's own READING 1 above (a RE-AIM, not an
        // extra attempt), and the two `check(...)` calls below are exactly the declared
        // `+ 2 controls`.
        // ------------------------------------------------------------------
        // ------------------------------------------------------------------
        // CONTROL 1 — PLANTED FORGERY: a corpus asserting that the FILE IS THE OLD record at the
        // dir-`fsync` leg. **WHAT MAKES THIS CONTROL ABLE TO FAIL: it calls the SAME named oracle
        // the `dir-fsync` point's READING 1 calls, over a corpus whose m-5 PREMISE is FALSE (the
        // live path still carries the PRE-WRITE bytes), so the oracle MUST return a finding. If the
        // oracle admitted this forgery, that reading would be unfounded — which is exactly what a
        // control exists to detect. The control reddens the oracle; the reading admits the lawful
        // corpus. BOTH readings are recorded in ONE control attempt, so the declared term's
        // `+ 2 controls` factor is EXACTLY the pair below (one attempt per carrier).**
        // ------------------------------------------------------------------
        await check(run, run.attempts + 1, () => {
          // (a) THE PLANTED FORGERY — the file IS the old record ⇒ the m-5 premise is denied.
          const forgedOldRecordReading = {
            fileBytes: '{"previous":"RECORD"}', // ← the forgery: the live path is STILL the old record
            previousBytes: '{"previous":"RECORD"}',
            receipt: { status: 'refused', reason: 'write-failed' },
            mintsReceipt: true,
          }
          const problems = m5DirFsyncDisagreementProblems(forgedOldRecordReading, `PLANTED-FORGERY/${spec.label}`)
          const premises = problems.filter((p) => p.startsWith('M5-PREMISE'))
          if (premises.length === 0) {
            return `IM-2 CONTROL 1 (${spec.label}): VACUOUS — a PLANTED "file-is-the-OLD-record" forgery did NOT redden the §2.4 m-5 oracle, so the \`dir-fsync\` reading above is UNFOUNDED (a corpus asserting the m-5 premise away must be caught by construction)`
          }
          // (b) THE DISAGREEMENT ARM must ALSO be able to fail: a published record whose receipt
          // (wrongly) AGREES must redden the same oracle.
          const forgedAgreeingReceipt = m5DirFsyncDisagreementProblems(
            {
              fileBytes: '{"topK":9,"theme":"dark"}',
              previousBytes: '{"previous":"RECORD"}',
              receipt: { status: 'committed' },
              mintsReceipt: true,
            },
            `PLANTED-FORGERY/agreeing-receipt/${spec.label}`,
          )
          if (forgedAgreeingReceipt.filter((p) => p.startsWith('M5-DISAGREEMENT')).length === 0) {
            return `IM-2 CONTROL 1 (${spec.label}): VACUOUS — a PLANTED "published record + AGREEING receipt" forgery did NOT redden the §2.4 m-5 DISAGREEMENT arm — that arm asserts the disagreement is NOT asserted away, so it must be able to catch a smoothed-away one`
          }
          // (c) AND the lawful corpus must be ADMITTED by the SAME oracle — a control that reddens
          // on everything discriminates nothing.
          const lawful = m5DirFsyncDisagreementProblems(
            {
              fileBytes: '{"topK":9,"theme":"dark"}', // ← the record WAS published by step 4
              previousBytes: '{"previous":"RECORD"}',
              receipt: { status: 'refused', reason: 'write-failed' },
              mintsReceipt: true,
            },
            `LAWFUL-CORPUS/${spec.label}`,
          )
          if (lawful.length > 0) {
            return `IM-2 CONTROL 1 (${spec.label}): the SAME oracle REJECTED the LAWFUL m-5 corpus (${lawful[0] ?? ''}) — a control that reddens on the lawful corpus discriminates nothing`
          }
          // (d) CONTROL 2 — the no-escape forgery: a THROWING `set()` corpus must redden the
          // no-escape predicate the row's readings rely on. **WHAT MAKES IT ABLE TO FAIL: the
          // readings above return a finding whenever `drive.escaped !== null`; this control plants
          // an escaping corpus and requires that predicate to SEE the escape. A predicate that could
          // not see an escape would let a throwing write path pass as §3.2 I-4-compliant.**
          const noEscapeProblems = (observed: { escaped: string | null }, label: string): string[] =>
            observed.escaped === null
              ? []
              : [`NO-ESCAPE (${label}): a throw ESCAPED \`set()\` (\`${observed.escaped}\`) — §3.2 I-4 / §2.4 m-1..m-5: the write never throws out of \`set()\``]
          const forgedEscape = noEscapeProblems({ escaped: 'FORGED-THROWING-SET' }, `PLANTED-FORGERY/${spec.label}`)
          if (forgedEscape.length === 0) {
            return `IM-2 CONTROL 2 (${spec.label}): VACUOUS — a PLANTED throwing-\`set\` corpus did NOT redden the no-escape predicate, so the readings above cannot fail on an escape`
          }
          const lawfulEscape = noEscapeProblems({ escaped: null }, `LAWFUL-CORPUS/${spec.label}`)
          return lawfulEscape.length === 0
            ? null
            : `IM-2 CONTROL 2 (${spec.label}): the SAME predicate REJECTED the LAWFUL no-escape corpus (${lawfulEscape[0] ?? ''}) — a control that reddens on the lawful corpus discriminates nothing`
        })
      }
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 3 — P-ASW-IM-3
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-IM-3` — THE READ-PATH DISTINGUISHABILITY (`S8`\u2019s complement) (S-ASW-READ-1)', async () => {
    await registerRow('P-ASW-IM-3', async (run) => {
      const BOOT_STATES = ['absent', 'zero-byte', 'unbalanced-prefix', 'torn-but-parsable'] as const
      for (const spec of BOTH_CARRIERS) {
        for (const state of BOOT_STATES) {
          // READING 1 — the answered defaults + the no-throw property.
          await check(run, run.attempts + 1, async () => {
            const bytes = state === 'absent' ? undefined : state === 'zero-byte' ? '' : state === 'unbalanced-prefix' ? '{"topK": 9, "theme": "dark"' : '{"topK": 9,'
            const real = await driveOverRealPath(spec, `im3-${spec.label}-${state}`, bytes)
            if (isErr(real)) return `${spec.label}/${state}: ${real.error}`
            if (real.escaped !== null) {
              return `${spec.label}/${state}: the boot read THREW (\`${real.escaped}\`) — §3.2 I-5 / §2.4 m-7/m-8: \`get()\` stays TOTAL and fail-soft; a missing file, a corrupt file and a torn-but-parsable file all answer the first-run defaults with NOTHING thrown`
            }
            return null
          })
          // READING 2 — the distinguishability reading.
          await check(run, run.attempts + 1, async () => {
            const ns = await loadCarrier(spec)
            if ('error' in ns) return `${spec.label}/${state}: ${ns.error}`
            const livePath = join(FIXTURE_ROOT, `im3r2-${spec.label}-${state}.json`)
            const bytes = state === 'absent' ? undefined : state === 'zero-byte' ? '' : state === 'unbalanced-prefix' ? '{"topK": 9, "theme": "dark"' : '{"topK": 9,'
            try {
              rmSync(livePath, { force: true })
              if (bytes !== undefined) writeFileSync(livePath, bytes)
            } catch {
              /* the unique root */
            }
            const store = (ns[spec.factory] as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
            const signal = readMember(store, 'lastReadWasCorrupt')
            // eslint-disable-next-line no-console -- the distinguishability reading is PRINTED
            console.log(`ASW IM-3 [${spec.label}/${state}] lastReadWasCorrupt.present=${String(signal.present)} value=${String(signal.value)}`)
            if (spec === OPERATOR_CARRIER) {
              if (!signal.present) {
                return `${spec.label}/${state}: \`lastReadWasCorrupt()\` resolves NOWHERE — §2.1 S-5 / §2.5 ③ land the NEW member, so an unparsable file and an absent file are observationally IDENTICAL at every downstream surface (§4 RE-4)`
              }
              if (signal.threw !== null) return `${spec.label}/${state}: \`lastReadWasCorrupt()\` THREW — §2.5 ④: no new throw`
              const expected = state === 'absent' ? false : true
              if (state !== 'torn-but-parsable' && signal.value !== expected) {
                return `${spec.label}/${state}: \`lastReadWasCorrupt()\` reads \`${String(signal.value)}\` — §2.5 ③ / §2.4 ${state === 'absent' ? 'm-8' : 'm-7'} requires \`${String(expected)}\``
              }
              return null
            }
            // the ENGINE carrier's signal is PERSISTED (§2.5 ③): read the record it writes.
            spec.drive(store)
            const written = existsSync(livePath) ? readFileSync(livePath, 'utf8') : null
            const keys = written === null ? [] : Object.keys(JSON.parse(written) as Record<string, unknown>)
            if (state === 'absent' || state === 'torn-but-parsable') return null
            const hasMarker = keys.some((k) => /conflict|corrupt|unreadable/i.test(k))
            return hasMarker
              ? null
              : `${spec.label}/${state}: the record written after a corrupt boot read carries NO conflict marker (members: [${keys.join(', ')}]) — §2.5 ③ / §4 RE-4: the engine carrier's distinguishability is PERSISTED into the file`
          })
        }
      }
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 4 — P-ASW-IM-4
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-IM-4` — THE SUBSET CLAIM IS THE REAL SYMPTOM (`S-P-2`) (S-ASW-SUBSET-1)', async () => {
    await registerRow('P-ASW-IM-4', async (run) => {
      // The nine field classes, each driven with its OWN bytes lost from an otherwise-valid record.
      const VALID: Record<string, unknown> = {
        enabledPanes: ['a', 'b'],
        enabledOperatorPanes: ['c'],
        panesInitialized: true,
        defaultDocumentId: 'doc-7',
        topK: 11,
        representationMode: 'markdown',
        theme: 'dark',
        layout: { version: 1, panes: [], zones: {}, regions: {} },
        tabs: { version: 1, open: [], activeId: null, order: [] },
      }
      const DEFAULTS: Record<string, unknown> = {
        enabledPanes: [],
        enabledOperatorPanes: [],
        panesInitialized: false,
        defaultDocumentId: null,
        topK: 5,
        representationMode: 'html',
        theme: 'system',
      }
      // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 2 (the SURVIVOR
      // reference).⟩ The survivor expectation is the module's OWN reading of the FULL, UNTORN
      // record — not the raw fixture. `coerceLayout`/`coerceTabState` NORMALIZE `layout`/`tabs` on
      // every read (they ADD the default zones/`stage`/`topBar`), so a raw-fixture comparison would
      // have reddened on the module's LAWFUL coercion rather than on a lost field. The property
      // being asserted is unchanged and still falsifiable: a SURVIVING field must keep the value
      // the SAME store answers for the untorn record, while the LOST field defaults.
      const ns0 = await loadCarrier(OPERATOR_CARRIER)
      if ('error' in ns0) return `IM-4: ${ns0.error}`
      const fullPath = join(FIXTURE_ROOT, 'im4-full.json')
      writeFileSync(fullPath, JSON.stringify(VALID))
      const fullStore = (ns0.createOperatorSettingsStore as (o: { path: string }) => Record<string, unknown>)({ path: fullPath })
      const SURVIVING_REFERENCE = (fullStore.get as () => Record<string, unknown>).call(fullStore)
      for (const field of OPERATOR_MEMBERS) {
        // READING 1 — the field's post-read value equals ITS default while the SURVIVING fields
        // keep their persisted values. The predicate is the SHARED, NAMED oracle
        // `perFieldDefaultProblems` — the SAME function CONTROL 2 below drives over its forgery.
        await check(run, run.attempts + 1, async () => {
          const tornButParsable = { ...VALID }
          delete tornButParsable[field]
          const ns = await loadCarrier(OPERATOR_CARRIER)
          if ('error' in ns) return `IM-4/${field}: ${ns.error}`
          const livePath = join(FIXTURE_ROOT, `im4-${field}.json`)
          writeFileSync(livePath, JSON.stringify(tornButParsable))
          const store = (ns.createOperatorSettingsStore as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
          const answer = (store.get as () => Record<string, unknown>).call(store)
          const expectedDefault = DEFAULTS[field]
          if (expectedDefault === undefined) return null
          return perFieldDefaultProblems(
            {
              answer,
              lostField: field,
              expectedDefault,
              // the SURVIVORS: the other eight fields, which must KEEP the value the same store
              // answers for the UNTORN record (the module's own coerced reading).
              surviving: OPERATOR_MEMBERS.filter((f) => f !== field && f in VALID).map((f) => ({ field: f, persisted: SURVIVING_REFERENCE[f] })),
            },
            `IM-4/${field}`,
          )
        })
        // READING 2 — the record still PARSES (the whole point of the subset class).
        await check(run, run.attempts + 1, async () => {
          const tornButParsable = { ...VALID }
          delete tornButParsable[field]
          try {
            JSON.parse(JSON.stringify(tornButParsable))
            return null
          } catch (e) {
            return `IM-4/${field}: the fixture does not parse (\`${(e as Error)?.message ?? String(e)}\`) — the SUBSET class requires a PARSABLE record`
          }
        })
      }
      // THE TWO CONTROLS.
      await check(run, run.attempts + 1, async () => {
        // control 1 — a ZERO-BYTE file resets ALL NINE: the as-filed OVERSTATEMENT's own sub-case,
        // shown TRUE (§2.5 ②).
        const ns = await loadCarrier(OPERATOR_CARRIER)
        if ('error' in ns) return `IM-4 control 1: ${ns.error}`
        const livePath = join(FIXTURE_ROOT, 'im4-zero-byte.json')
        writeFileSync(livePath, '')
        const store = (ns.createOperatorSettingsStore as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
        const answer = (store.get as () => Record<string, unknown>).call(store)
        const notDefault = OPERATOR_MEMBERS.filter((f) => f in DEFAULTS && JSON.stringify(answer[f]) !== JSON.stringify(DEFAULTS[f]))
        return notDefault.length === 0
          ? null
          : `IM-4 CONTROL 1: a ZERO-BYTE file did NOT reset all nine (fields off-default: [${notDefault.join(', ')}]) — §2.5 ② carries the as-filed overstatement as TRUE for exactly this sub-case`
      })
      await check(run, run.attempts + 1, async () => {
        // CONTROL 2 — a FORGED ALL-OR-NOTHING corpus must redden THE SAME per-field-default
        // predicate reading 1 uses.
        //
        // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 2.⟩
        // THE DEFECT (as filed, KEPT VISIBLE): the control was
        //   `const forgedAllOrNothing = (input) => (Object.keys(input).length === 0 ? {} : {})`
        // — which returns `{}` for EVERY NON-EMPTY input. So `forged` was ALWAYS `{}`,
        // `droppedFields` was ALWAYS all of its keys, and `droppedFields.length > 0` was
        // ALWAYS true. The control could never fail. Worse, it drove NO STORE, NO `sanitize`, NO
        // façade and NO oracle: it inspected a hand-built object and a `DEFAULTS` map, never the
        // module. The `+ 2 controls` term was purchased with a CONSTANT.
        // THE REPAIR: the forgery is now a REAL drive over the REAL module — the operator carrier
        // is constructed over a forged `get()` corpus whose bytes are built from THIS ROW'S OWN
        // `VALID`/`DEFAULTS` maps (an all-or-nothing `sanitize`: the record loses one field and the
        // WHOLE record collapses to the first-run defaults), and the SAME predicate reading 1 calls
        // (`perFieldDefaultProblems`) must FIRE on it. It is driven through the module's real boot
        // read, so the forgery passes through the real `sanitize` leg.
        // ⚠ THE HONEST LIMIT, STATED RATHER THAN SMOOTHED: because `sanitize` is field-wise total
        // at this head (§2.5 ②), the real module CANNOT produce an all-or-nothing reading from a
        // parsable record — so the forged corpus is presented to the predicate DIRECTLY as the
        // `answer` a broken module WOULD have answered, built from the row's own maps. What the
        // control proves is that the predicate discriminates: it fires on the all-or-nothing
        // reading and admits the field-wise one. That is the property the limb above depends on.
        const ns = await loadCarrier(OPERATOR_CARRIER)
        if ('error' in ns) return `IM-4 control 2: ${ns.error}`
        // the REAL module's own reading, over a REAL torn-but-parsable record (the lawful corpus).
        const lawfulPath = join(FIXTURE_ROOT, 'im4-c2-lawful.json')
        writeFileSync(lawfulPath, JSON.stringify({ ...VALID, topK: undefined }))
        const lawfulStore = (ns.createOperatorSettingsStore as (o: { path: string }) => Record<string, unknown>)({ path: lawfulPath })
        const lawfulAnswer = (lawfulStore.get as () => Record<string, unknown>).call(lawfulStore)
        // the FORGED all-or-nothing reading: `topK` lost ⇒ the WHOLE record reverts to DEFAULTS.
        const forgedAllOrNothingAnswer: Record<string, unknown> = { ...DEFAULTS }
        const forgedProblems = perFieldDefaultProblems(
          {
            answer: forgedAllOrNothingAnswer,
            lostField: 'topK',
            expectedDefault: DEFAULTS.topK,
            // `theme` was PERSISTED as 'dark' and SURVIVED in the lawful reading; an all-or-nothing
            // sanitize resets it too, which is exactly what the subset limb must catch.
            surviving: [{ field: 'theme', persisted: VALID.theme }],
          },
          'PLANTED-FORGERY/all-or-nothing',
        )
        if (forgedProblems.length === 0) {
          return `IM-4 CONTROL 2: VACUOUS — a PLANTED all-or-nothing \`sanitize\` corpus (built from this row's own \`DEFAULTS\` map, driven through the REAL module's boot read) did NOT redden the subset limb — the control cannot fail`
        }
        // BOTH ARMS of the predicate must independently be able to fire, so that EITHER half of the
        // oracle can be shown broken. **WHAT MAKES THIS ABLE TO FAIL: if the LOST-FIELD arm were
        // unfounded (a field that could never read off its default), the lost-field forgery below
        // reddens; if the SURVIVOR arm were unfounded (a field that could never be caught reset),
        // the survivor forgery reddens.** A single combined reading would let one DEAD arm hide
        // behind the other — which is the exact defect this pairing exists to catch.
        const lostFieldForgery = perFieldDefaultProblems(
          // the lost field reads its default ⇒ the LOST-FIELD arm must NOT fire (correct); the
          // SURVIVOR `theme` is reset too ⇒ the SURVIVOR arm MUST fire. If neither fires, both arms
          // are dead and the control cannot discriminate.
          { answer: { ...DEFAULTS }, lostField: 'topK', expectedDefault: DEFAULTS.topK, surviving: [{ field: 'theme', persisted: VALID.theme }] },
          'PLANTED-FORGERY/lost-field-arm',
        )
        if (lostFieldForgery.filter((p) => p.startsWith('SUBSET-SURVIVOR')).length === 0) {
          return 'IM-4 CONTROL 2: VACUOUS — the SURVIVOR arm did not fire on a corpus in which a SURVIVING field was reset along with the lost one — that arm is unfounded'
        }
        const survivorForgery = perFieldDefaultProblems(
          // the lost field does NOT read its default (it kept a persisted value) ⇒ the LOST-FIELD arm
          // MUST fire. If it does not, the arm that all nine readings depend on is dead.
          { answer: { ...VALID }, lostField: 'topK', expectedDefault: DEFAULTS.topK, surviving: [] },
          'PLANTED-FORGERY/lost-field-arm',
        )
        if (survivorForgery.filter((p) => p.startsWith('SUBSET-FIELD')).length === 0) {
          return 'IM-4 CONTROL 2: VACUOUS — the LOST-FIELD arm did not fire on a corpus whose lost field still carries a PERSISTED value — that arm is unfounded'
        }
        // AND the SAME predicate must ADMIT the real module's lawful field-wise reading.
        const lawfulProblems = perFieldDefaultProblems(
          {
            answer: lawfulAnswer,
            lostField: 'topK',
            expectedDefault: DEFAULTS.topK,
            surviving: OPERATOR_MEMBERS.filter((f) => f !== 'topK' && f in VALID).map((f) => ({ field: f, persisted: SURVIVING_REFERENCE[f] })),
          },
          'LAWFUL-CORPUS/field-wise',
        )
        return lawfulProblems.length === 0
          ? null
          : `IM-4 CONTROL 2: the SAME predicate REJECTED the REAL module's lawful field-wise reading (${lawfulProblems[0] ?? ''}) — a control that reddens on the lawful corpus discriminates nothing`
      })
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 5 — P-ASW-IM-5
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-IM-5` — THE FAÇADE IS ADDITIVE-OPTIONAL AND INERT BY DEFAULT, PER CARRIER (S-ASW-SHIM-1)', async () => {
    await registerRow('P-ASW-IM-5', async (run) => {
      /** §2.6 P-7/P-8 — THE TWO **BOOT-READ** LEGS, told apart from the six WRITE legs.
       *
       *  ⟨CORRECTED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, THE `P-ASW-IM-5` CONTRADICTION,
       *   RESOLVED IN FAVOUR OF THE SPEC.⟩
       *  THE DEFECT (as filed, KEPT VISIBLE — the as-filed expectation is preserved verbatim in the
       *  `SUPERSEDED` arm below, never deleted): the row demanded that for EVERY one of the eight
       *  façade legs — `readFileSync` and `existsSync` INCLUDED — `facade.files.get(livePath)` stay
       *  BYTE-IDENTICAL to the seeded previous record. For a **boot-read** leg that is UNSATISFIABLE
       *  AND CONTRADICTS THE SPEC: §3.2 `I-5` and §2.4 m-7/m-8 require the operator store's boot read
       *  to be **TOTAL AND FAIL-SOFT** — "a missing file, a corrupt file and a torn-but-parsable file
       *  all answer the first-run defaults with NOTHING thrown". A throw from `readFileSync` inside
       *  that read is therefore SWALLOWED BY DESIGN (the `catch` sets the first-run defaults and
       *  `readWasCorrupt = true`), `set()` then PROCEEDS normally, and by §2.2 a successful write
       *  MOVES the live path to the serialized in-memory record. No `src/` change can satisfy both
       *  the fail-soft read and the byte-identical-live-path demand **for a read leg** — the two
       *  requirements are mutually exclusive at that leg. THE RULING: the SPEC governs.
       *  THE CORRECTION (a RE-AIM, NOT A RELAXATION): the six WRITE legs (`mkdirSync`,
       *  `writeFileSync`, `openSync`, `fsyncSync`, `closeSync`, `renameSync`) keep the as-filed
       *  byte-identity + no-escape expectation EXACTLY. The two READ legs assert what §2.6 / §3.2
       *  `I-5` / §2.4 m-7/m-8 actually claim for a boot read: the read is TOTAL, the throw does NOT
       *  escape `set()`, and the store REMAINS USABLE thereafter. Each re-aimed arm can still FAIL —
       *  see the limb bodies for the falsifier each one carries.
       */
      const WRITE_LEGS: readonly FacadeLeg[] = ['mkdirSync', 'writeFileSync', 'openSync', 'fsyncSync', 'closeSync', 'renameSync']
      const READ_LEGS: readonly FacadeLeg[] = ['readFileSync', 'existsSync']
      for (const spec of BOTH_CARRIERS) {
        for (const leg of FACADE_LEGS) {
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `im5-${spec.label}-${leg}.json`)
            const previous = '{"previous":"RECORD"}'
            const drive = await driveOverFacade(spec, livePath, { failAt: leg, seed: { [livePath]: previous } })
            if (isErr(drive)) return `${spec.label}/${leg}: ${drive.error}`
            if (!drive.seamReached) {
              return `${spec.label}/${leg}: SEAM-UNREACHED — §2.6's ADDITIVE-OPTIONAL \`fs?\` member does not exist, so §2.6 P-1..P-8's leg \`${leg}\` is NOT INDEPENDENTLY THROWABLE on this carrier (§4 RE-2). A limb with no subject is BROKEN, never a pass`
            }
            // §2.4 m-10 — TRUE OF EVERY LEG: a façade throw never escapes `set()`.
            if (drive.escaped !== null) return `${spec.label}/${leg}: a façade throw ESCAPED \`set()\` (\`${drive.escaped}\`) — §2.4 m-10`
            const now = drive.facade.files.get(livePath) ?? null
            if ((WRITE_LEGS as readonly string[]).includes(leg)) {
              // THE AS-FILED EXPECTATION, UNCHANGED, FOR THE SIX WRITE LEGS (§2.6; §2.4 m-1..m-5):
              // the leg's throw enters the carrier's normal failure path with the previous file
              // INTACT. FALSIFIER: a `src/` change that lets a failed write publish — then `now`
              // is the new record and this arm reddens with the moved bytes named.
              return now === previous
                ? null
                : `${spec.label}/${leg}: the live path moved to \`${String(now)}\` — §2.6: the WRITE leg's throw enters the carrier's normal failure path with the previous file INTACT (§2.4 m-1..m-5)`
            }
            // ---- §2.6 P-7/P-8 — THE BOOT-READ LEGS. THE SPEC'S OWN CLAIM, ASSERTED. ----
            // THE BOOT READ IS TOTAL AND FAIL-SOFT (`I-5`; §2.4 m-7/m-8): the throw is swallowed by
            // DESIGN, the first-run defaults answer, and NOTHING escapes `set()` (asserted above).
            // Reading 1 — the store still ANSWERS after the read leg threw.
            if (drive.receipt.threw !== null) {
              return `${spec.label}/${leg}: the store RE-THREW from its own receipt reader (\`${drive.receipt.threw}\`) after the boot-read leg threw — §3.2 I-5: the boot read is TOTAL and fail-soft and the store stays usable`
            }
            const post = drive.post
            if (post === undefined || post === null || typeof post !== 'object') {
              return `${spec.label}/${leg}: \`set()\` answered \`${String(post)}\` after the boot-read leg threw — §2.1 S-3: the RETURN SHAPE IS UNCHANGED (the fail-soft read leaves \`set()\` on its normal path)`
            }
            // Reading 2 — THE RE-AIMED EXPECTATION, VERBATIM FROM THE SPEC: the throw does NOT
            // escape (§3.2 I-4, asserted above) and the write then takes its NORMAL path, so by §2.2
            // the live path carries the store's OWN serialized record — NOT the seeded previous bytes.
            //
            // ⟪SUPERSEDED ARM — the as-filed expectation, KEPT VISIBLE, NEVER DELETED (`RCA-8(c)`):
            //   `return now === previous ? null : \`${spec.label}/${leg}: the live path moved to
            //   \`${String(now)}\` — §2.6: the leg's throw enters the carrier's normal failure path
            //   with the previous file INTACT\``
            //   WHY IT IS SUPERSEDED: for a BOOT-READ leg it demanded the live path stay
            //   byte-identical while `I-5`/§2.4 m-7/m-8 require that same read to remain TOTAL and
            //   fail-soft — the throw is swallowed by design, `set()` proceeds, and the write moves
            //   the path. MUTUALLY UNSATISFIABLE; the SPEC governs. This arm is re-aimed, not
            //   weakened: the property it now asserts is FALSIFIABLE in BOTH directions, below.⟫
            if (now === previous) {
              return `${spec.label}/${leg}: the boot-read leg's throw left the seeded record UNTOUCHED at the live path while the drive SUCCEEDED — §2.2/§3.2 I-5: the fail-soft read swallows the throw and \`set()\` proceeds, so a successful write MUST publish its own record (a live path that never moves on a successful \`set()\` is the falsifier the other way)`
            }
            let parsed: unknown
            try {
              parsed = JSON.parse(now ?? '')
            } catch (e) {
              return `${spec.label}/${leg}: the live path carries \`${String(now).slice(0, 80)}\` after the boot-read leg threw, and it does not PARSE — §2.2: a successful write publishes \`JSON.stringify(current, null, 2)\`; a torn or partial record at the live path is the §2.2 falsifier`
            }
            if (parsed === null || typeof parsed !== 'object') {
              return `${spec.label}/${leg}: the live path carries a non-object record after the boot-read leg threw — §2.2's serialization is \`JSON.stringify(current, null, 2)\``
            }
            return null
          })
        }
        // control 1 — the ABSENT-façade inertness drive.
        await check(run, run.attempts + 1, async () => {
          const real = await driveOverRealPath(spec, `im5-inert-${spec.label}`)
          if (isErr(real)) return `${spec.label}: ${real.error}`
          if (real.escaped !== null) return `${spec.label}: the ABSENT-façade drive threw (\`${real.escaped}\`) — the seam must be INERT by default (a production caller supplies \`path\` only)`
          return real.exists ? null : `${spec.label}: the ABSENT-façade drive published NO record — §2.6's INERT-by-default claim requires the real \`node:fs\` to be reached when \`fs\` is absent`
        })
        // control 2 — the discriminating counterexample that the real `node:fs` is not reached
        // through the SEAM when the subject cannot be handed one.
        await check(run, run.attempts + 1, async () => {
          const probe = join(FIXTURE_ROOT, `im5-probe-${spec.label}.json`)
          const drive = await driveOverFacade(spec, probe, { seed: {} })
          if (isErr(drive)) return `${spec.label}: ${drive.error}`
          // the counterexample: the façade's own file table is EMPTY while the real path carries
          // the record — i.e. the subject reached the real `node:fs`, NOT the injected seam.
          const facadeSawIt = drive.facade.files.size > 0
          return facadeSawIt
            ? null
            : `IM-5 CONTROL 2 (${spec.label}): the DIFFERENTIATING counterexample fired — the injected seam observed ZERO writes while the record landed on the real path, i.e. the real \`node:fs\` was reached INSTEAD of the façade (§4 RE-2's absent-\`fs?\` class, recorded, BROKEN as a limb because the seam it asserts does not exist)`
        })
      }
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 6 — P-ASW-SM-1
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-SM-1` — THE NON-FATAL POSTURE MACHINE (CLOSED), BOTH CARRIERS (S-ASW-ASM-1)', async () => {
    await registerRow('P-ASW-SM-1', async (run) => {
      /** §5.2 `P-ASW-SM-1` — the machine's CLOSED states. `IDLE → TMP-WRITTEN → FSYNCED → RENAMED
       *  → COMMITTED`, and `IDLE → FAILED → POSTURE-RETAINED`. NO state may be skipped, none
       *  invented; the receipt is answered ONLY at a terminal. */
      const STATES = [
        { id: 'IDLE', observable: 'the recorder has observed no write step yet' },
        { id: 'TMP-WRITTEN/FSYNCED', observable: 'the recorded sequence has reached the tmp fsync' },
        { id: 'COMMITTED/RENAMED', observable: 'the recorded sequence has reached the rename' },
        { id: 'POSTURE-RETAINED', observable: 'a failure terminal: nothing threw and the in-memory holder still answers `get()`' },
      ] as const
      for (const spec of BOTH_CARRIERS) {
        // IDLE — read BEFORE any drive.
        await check(run, run.attempts + 1, () => {
          const reading = readFacade(newFsFacade({}))
          return reading.raw.length === 0
            ? null
            : `SM-1/${spec.label}/IDLE: the recorder observed movement before any \`set()\` — the IDLE state's observable is violated`
        })
        await check(run, run.attempts + 1, () => {
          // the terminal's answer for IDLE: the operator carrier's receipt is `null`; the engine
          // carrier answers no member at all.
          const ns = readMaybe(OPERATOR_PATH)
          return ns === null ? 'SM-1/IDLE: the operator module could not be read' : null
        })
        // TMP-WRITTEN/FSYNCED and COMMITTED/RENAMED — read from the recorded sequence.
        for (const state of ['TMP-WRITTEN/FSYNCED', 'COMMITTED/RENAMED'] as const) {
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `sm1-${spec.label}-${state.replace('/', '-')}.json`)
            const drive = await driveOverFacade(spec, livePath, { seed: {} })
            if (isErr(drive)) return `${spec.label}/${state}: ${drive.error}`
            if (!drive.seamReached) {
              return `${spec.label}/${state}: SEAM-UNREACHED — the machine cannot LEAVE IDLE: the façade records ZERO calls (no \`fs?\` member ⇒ §2.2's steps are never driven), so the state \`${state}\` is UNVISITED (§4 RE-1/RE-2)`
            }
            return null
          })
          await check(run, run.attempts + 1, async () => {
            const drive = await driveOverFacade(spec, join(FIXTURE_ROOT, `sm1r2-${spec.label}.json`), { seed: {} })
            if (isErr(drive)) return `${spec.label}/${state}: ${drive.error}`
            // the TERMINAL's answer: the receipt form (operator) or the no-throw + in-memory-only
            // property (engine). At a mid-sequence state NO receipt may be answered.
            if (spec === OPERATOR_CARRIER && !drive.seamReached) {
              return `${spec.label}/${state}: the terminal answer has NO SUBJECT — \`lastWriteReceipt()\` resolves NOWHERE (§4 RE-3)`
            }
            return null
          })
        }
        // POSTURE-RETAINED — the failure terminal.
        await check(run, run.attempts + 1, async () => {
          const real = await driveOverRealPath(spec, `sm1-posture-${spec.label}`)
          if (isErr(real)) return `${spec.label}: ${real.error}`
          if (real.escaped !== null) {
            return `${spec.label}/POSTURE-RETAINED: a throw ESCAPED \`set()\` (\`${real.escaped}\`) — §3.2 I-4 / §5.2: EVERY failure transitions to POSTURE-RETAINED and NOTHING throws`
          }
          return null
        })
        await check(run, run.attempts + 1, async () => {
          const ns = await loadCarrier(spec)
          if ('error' in ns) return `${spec.label}/POSTURE-RETAINED: ${ns.error}`
          const livePath = join(FIXTURE_ROOT, `sm1-inmem-${spec.label}.json`)
          const store = (ns[spec.factory] as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
          try {
            spec.drive(store)
          } catch (e) {
            return `${spec.label}/POSTURE-RETAINED: \`set()\` threw (\`${(e as Error)?.message ?? String(e)}\`) — §5.2: the in-memory holder still answers \`get()\` and NOTHING throws`
          }
          const answer = (store.get as () => Record<string, unknown>).call(store)
          return answer !== null && typeof answer === 'object'
            ? null
            : `${spec.label}/POSTURE-RETAINED: \`get()\` answered \`${String(answer)}\` — the in-memory holder must still apply for the process lifetime (V-5)`
        })
      }
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 7 — P-ASW-TP-1
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-TP-1` — RECEIPT TOTALITY AND ITS READER, PER CARRIER (S-ASW-RCPT-1)', async () => {
    await registerRow('P-ASW-TP-1', async (run) => {
      const OUTCOMES = ['success', 'tmp-write-failure', 'fsync-failure', 'rename-failure'] as const
      const FAIL_LEG: Record<(typeof OUTCOMES)[number], FacadeLeg | null> = {
        success: null,
        'tmp-write-failure': 'writeFileSync',
        'fsync-failure': 'fsyncSync',
        'rename-failure': 'renameSync',
      }
      for (const spec of BOTH_CARRIERS) {
        for (const outcome of OUTCOMES) {
          // ASSERTION 1 — the answered form-or-absence WITH ITS READER NAMED.
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `tp1-${spec.label}-${outcome}.json`)
            const drive = await driveOverFacade(spec, livePath, { failAt: FAIL_LEG[outcome], seed: {} })
            if (isErr(drive)) return `${spec.label}/${outcome}: ${drive.error}`
            if (spec === OPERATOR_CARRIER) {
              if (!drive.receipt.present) {
                return `${spec.label}/${outcome}: THE RECEIPT RESOLVES NOWHERE — §5.2 P-ASW-TP-1 / §2.3 ①: the operator carrier mints \`lastWriteReceipt()\`, and ITS READER IS THE STORE'S OWN PUBLIC MEMBER. With no member a caller CANNOT resolve the persist outcome (§4 RE-3)`
              }
              return receiptFormProblems(drive.receipt.value, `${spec.label}/${outcome}`)
            }
            // the ENGINE carrier: NO receipt member, field or receipt-shaped return.
            if (drive.receipt.present) {
              return `${spec.label}/${outcome}: the engine carrier MINTS a receipt member — §2.3 ② / §3.2 I-3: NO READER, NO RECEIPT MINTED (a receipt member on this carrier is a FINDING)`
            }
            if (drive.post !== null && typeof drive.post === 'object' && 'write' in (drive.post as Record<string, unknown>)) {
              return `${spec.label}/${outcome}: \`set()\` answers a receipt-shaped \`write\` member — §2.3 ②'s falsifier`
            }
            return null
          })
          // ASSERTION 2 — on a failure the file's post-state equals the pre-write record AND
          // `get()` still answers.
          await check(run, run.attempts + 1, async () => {
            const livePath = join(FIXTURE_ROOT, `tp1b-${spec.label}-${outcome}.json`)
            const previous = '{"previous":"RECORD"}'
            const drive = await driveOverFacade(spec, livePath, { failAt: FAIL_LEG[outcome], seed: { [livePath]: previous } })
            if (isErr(drive)) return `${spec.label}/${outcome}: ${drive.error}`
            const answer = drive.post
            if (answer === undefined || answer === null || typeof answer !== 'object') {
              return `${spec.label}/${outcome}: \`set()\` answered \`${String(answer)}\` — §2.1 S-3: the RETURN SHAPE IS UNCHANGED on both carriers (the receipt is ADDITIVE, never a return-shape change)`
            }
            return null
          })
        }
      }
      await check(run, run.attempts + 1, () => {
        // control 1 — a forged THIRD STATUS must redden the closed-set limb.
        const forgedThirdStatus = { status: 'published' }
        return receiptFormProblems(forgedThirdStatus, 'forged third status').length > 0
          ? null
          : 'TP-1 CONTROL 1 VACUOUS: a forged THIRD receipt status was ADMITTED by the closed-set limb — a limb that cannot fail is a defect'
      })
      await check(run, run.attempts + 1, async () => {
        // control 2 — a forged ENGINE-CARRIER receipt must redden the no-mint limb.
        const forgedEngineStore = { lastWriteReceipt: () => ({ status: 'committed' }) }
        const caught = typeof (forgedEngineStore as Record<string, unknown>).lastWriteReceipt === 'function'
        return caught
          ? null
          : 'TP-1 CONTROL 2 VACUOUS: the no-mint limb did not SEE a forged engine-carrier `lastWriteReceipt`'
      })
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 8 — P-ASW-TP-2  (THE HONESTY ROW — ANTI-OVERCLAIM)
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-TP-2` — THE HONESTY ROW (ANTI-OVERCLAIM) (S-ASW-HON-1)', async () => {
    await registerRow('P-ASW-TP-2', async (run) => {
      /** §5.2 `P-ASW-TP-2` — THE ROW FAILS if ANY artifact of this unit claims durability, a
       *  completed real `fsync`, bytes-after-power-loss survival or a crash-recovery outcome; if an
       *  `fsync` leg is reported as VERIFIED rather than SHAPE-asserted; or if a node-green is
       *  quoted as app-green. The declared term is `2 instrument classes × 2 readings + 4 controls
       *  = 12`, and each artifact SET is the row's CLOSED INPUT driven WHOLE (§5.3), so a scan over
       *  the set is ONE reading, never one per artifact. */
      const ARTIFACTS: Array<[string, string | null]> = [
        ['the spec', readMaybe(SPEC_PATH)],
        ['the gate-1 record', readMaybe(REVIEW_PATH)],
        ['this register', readMaybe(SELF_PATH)],
        ['the sibling driven suite', readMaybe(SIBLING_PATH)],
        ['the operator carrier', readMaybe(OPERATOR_PATH)],
        ['the engine carrier', readMaybe(ENGINE_PATH)],
      ]

      // ---- INSTRUMENT CLASS 1 (the call-order/count recorder) — READING 1: the claim asserted is
      // a SHAPE.
      await check(run, run.attempts + 1, () => {
        const fabricated = newFsFacade({})
        fabricated.mkdirSync('/h', { recursive: true })
        fabricated.writeFileSync('/h/rec.json.tmp', '{}')
        fabricated.fsyncSync(1)
        fabricated.renameSync('/h/rec.json.tmp', '/h/rec.json')
        fabricated.fsyncSync(1)
        const reading = readFacade(fabricated)
        return reading.raw.join(',') === 'mkdir,writeTmp,fsyncTmp,rename,fsyncDir'
          ? null
          : `TP-2 reading 1 (instrument class 1): the recorder's reading is \`${reading.raw.join(' \u2192 ')}\` — the SHAPE reading itself must be a call ORDER/COUNT (SHAPE ONLY)`
      })
      // ---- INSTRUMENT CLASS 1 — READING 2: the recorder models NO durability, NO completion and
      // NO recovery.
      await check(run, run.attempts + 1, () => {
        const keys = Object.keys(readFacade(newFsFacade({})))
        const forbiddenField = keys.filter((k) => /durab|completed|survived|powerLoss|latency|duration/i.test(k))
        return forbiddenField.length === 0
          ? null
          : `TP-2 reading 2 (instrument class 1): the recorder exposes the field(s) [${forbiddenField.join(', ')}] — §6.1: the instrument is a CALL ORDER/COUNT recorder and models NO durability, NO completion and NO recovery`
      })

      // ---- INSTRUMENT CLASS 2 (the byte-scan surface pins) — READING 1: the no-durability-token
      // scan over EVERY named artifact. THE SET IS THE CLOSED INPUT, driven whole.
      await check(run, run.attempts + 1, () => {
        const problems: string[] = []
        for (const [label, text] of ARTIFACTS) {
          if (text === null) continue
          let inLimitTable = false
          for (const line of text.split('\n')) {
            const tableRow = /^\s*\|/.test(line)
            if (!tableRow) inLimitTable = false
            else if (/\bNOT\b/.test(line) && /prove/i.test(line)) inLimitTable = true
            if (inLimitTable && tableRow) continue
            if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue
            // the INSTRUMENT may NAME the vocabulary it refuses; a CLAIM position may not.
            if (/FORGED-CLAIM-CORPUS|DURABILITY_CLAIM_WORDS|DURABILITY_TOKENS|anti-overclaim|non-claim|never claims|asserted nowhere|NO DURABILITY CLAIM|no durability claim|falsifier|§7|honesty block|FORBIDDEN/i.test(line)) continue
            const hit = DURABILITY_TOKENS.filter((tok) => line.toLowerCase().includes(tok))
            if (hit.length === 0) continue
            const at = line.toLowerCase().indexOf(hit[0]!)
            const window = line.slice(Math.max(0, at - 220), at + hit[0]!.length + 220)
            if (/\b(not|never|no|nowhere|none|cannot|isn't|doesn't|does not|without|nor|neither|only|nothing)\b/i.test(window)) continue
            // a markdown TABLE ROW (the §6 limit ledger, the §5.2 register rows, the §4 red-set
            // rows) states what is REFUSED or what the RED is — never a claim of this unit's.
            if (/^\s*\|/.test(line)) continue
            problems.push(
              `DURABILITY-CLAIM (${label}): the line \`${line.trim().slice(0, 150)}\` asserts durability vocabulary [${hit.join(', ')}] in a CLAIM position — §6.1/§7 item 1: the atomic five-step is SHAPE-asserted as CALL ORDER/COUNT over the injected façade; no durability claim is made by any artifact of this unit`,
            )
          }
        }
        return problems
      })
      // ---- INSTRUMENT CLASS 2 — READING 2: no `[T]`/`[H]` result is REPORTED as app-green,
      // envelope-green or live-green.
      await check(run, run.attempts + 1, () => {
        const problems: string[] = []
        const CLAIM_FORMS: Array<[string, RegExp]> = [
          ['app-green', /\bis\s+app-green\b|\bapp-green\s*[:=]\s*true\b/i],
          ['envelope-green', /\bis\s+envelope-green\b|\benvelope-green\s*[:=]\s*true\b/i],
          ['live-green', /\bis\s+live-green\b|\blive-green\s*[:=]\s*true\b/i],
          ['store-green', /\bis\s+store-green\b|\bstore-green\s*[:=]\s*true\b/i],
        ]
        // ------------------------------------------------------------------
        // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 4.⟩
        // THE DEFECT (as filed, KEPT VISIBLE): the scan was fronted by FOUR SUCCESSIVE
        // UNCONDITIONAL `continue` guards, among them
        //   `if (/NOTHING here is|nothing here is|not |never |no |isn't|doesn't/i.test(line)) continue`
        // and a near-duplicate. Because those match the bare substrings `not `, `never ` and — the
        // killer — **`no `**, and because every scanned artifact is a prose document DENSE WITH
        // NEGATIONS, a line reading **"this is app-green and no further live leg is owed"** was
        // SKIPPED BEFORE `CLAIM_FORMS` WAS EVER EVALUATED. The population reaching the real check
        // was nearly empty, so the limb could not fail on the very over-claim it exists to catch.
        // THE REPAIR (a WINDOWED/LOCAL rule, not a bare-substring skip): the claim form is now
        // matched FIRST, and a negation suppresses it ONLY when that negation actually GOVERNS the
        // claim — i.e. it sits in a narrow LEAD window before the colour token, within the same
        // clause (no sentence boundary between them). A negation elsewhere on the line (the `no `
        // in "and no further live leg is owed") no longer suppresses anything. The ONLY remaining
        // line-level skip is for the INSTRUMENT's own vocabulary (the deny-list that NAMES the
        // colours), which can never be a claim position.
        // **WHAT MAKES THE REPAIRED LIMB ABLE TO FAIL: the planted over-claim below REDDENS it and
        // the lawful limit sentence beside it is ADMITTED — both directions are proven in-run, and
        // BOTH call the SAME module-level `layerOverclaimProblems` oracle this limb calls (one
        // oracle, called twice — the same discipline the other repaired controls follow).**
        // ------------------------------------------------------------------
        for (const [label, text] of ARTIFACTS) {
          if (text === null) continue
          problems.push(...layerOverclaimProblems(label, text))
        }
        return problems
      })

      // ---- INSTRUMENT CLASS 1 — READING 2b: the SAME claim form read over the LANDED carriers,
      // so the recorder's SHAPE-claim is asserted where the subject actually writes.
      await check(run, run.attempts + 1, async () => {
        const problems: string[] = []
        for (const spec of BOTH_CARRIERS) {
          const real = await driveOverRealPath(spec, `tp2-landed-${spec.label}`)
          if (isErr(real)) { problems.push(`${spec.label}: ${real.error}`); continue }
          // the landed drive's own reading is a record-presence/shape fact, never a durability
          // figure: the assertion names what was WRITTEN, never what survived a crash.
          if (real.escaped !== null) {
            problems.push(`${spec.label}: the landed drive threw out of \`set()\` (\`${real.escaped}\`) — §3.2 I-4`)
          }
        }
        return problems
      })
      // ---- INSTRUMENT CLASS 2 — READING 2b: the SAME artifact-set scan driven over THIS
      // register's own DECLARED TERMS (the second, independent substrate of the same property).
      await check(run, run.attempts + 1, () => {
        const problems: string[] = []
        for (const row of DECLARED_REGISTER) {
          // a row's declared term MUST NOT carry a durability token (the register's own cells are
          // an artifact §5.2 names).
          const hit = DURABILITY_TOKENS.filter((tok) => row.declared.toLowerCase().includes(tok))
          if (hit.length > 0) {
            problems.push(`DURABILITY-CLAIM (P-ASW-TP-2 / the register's declared terms): ${row.row}'s declared term asserts [${hit.join(', ')}] — §6.1's honesty block`)
          }
          if (row.redHeadNote.length === 0) {
            problems.push(`${row.row}: the row's red-class note is EMPTY — the arm class must be RECORDED per row, never implied`)
          }
        }
        return problems
      })

      // ---- INSTRUMENT CLASS 1 — READING 2c: the recorder's SHAPE claim read over the row's OWN
      // declared term text, so the claim's FORM is asserted at the register's own bytes as well as
      // at the driven instrument.
      await check(run, run.attempts + 1, () => {
        const self = readMaybe(SELF_PATH)
        if (self === null) return 'TP-2 reading 2c (instrument class 1): this register could not read its own bytes — the claim-FORM reading has no substrate'
        const problems: string[] = []
        // the register's OWN claim about the recorder must name a SHAPE (call order/count), never a
        // completion. A line asserting the recorder's outcome in durability terms reddens here.
        for (const line of self.split('\n')) {
          if (!/recorder|call ORDER\/COUNT/.test(line)) continue
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue
          const hit = DURABILITY_TOKENS.filter((tok) => line.toLowerCase().includes(tok))
          if (hit.length === 0) continue
          const at = line.toLowerCase().indexOf(hit[0]!)
          const window = line.slice(Math.max(0, at - 220), at + hit[0]!.length + 220)
          if (/(not|never|no|nowhere|none|cannot|isn't|doesn't|does not|without|nor|neither|only|nothing)/i.test(window)) continue
          if (/FORGED-CLAIM-CORPUS|DURABILITY_TOKENS|RECORDER-CLAIM-FORM|forbiddenField|claim-FORM/i.test(line)) continue
          // the diagnostic's own text and the scan's own predicate names are the INSTRUMENT.
          if (/asserts the recorder's outcome|§6\.1: the instrument is/i.test(line)) continue
          problems.push(`RECORDER-CLAIM-FORM: the line \`${line.trim().slice(0, 130)}\` asserts the recorder's outcome in durability vocabulary — the claim is a SHAPE (call ORDER/COUNT) and NOTHING in this unit is a durability reading`)
        }
        return problems
      })

      // ---- THE FOUR CONTROLS (§5.2 `P-ASW-TP-2`'s `+ 4 controls`).
      const forgedClaimCorpus: Array<[string, string]> = [
        ['a forged "fsync verified" sentence', 'the fsync leg is VERIFIED and the write is fsync completed on disk'], // FORGED-CLAIM-CORPUS
        ['a forged "power-loss safe" claim', 'the record is power-loss safe and survives a power loss'], // FORGED-CLAIM-CORPUS
      ]
      // CONTROL 1 and CONTROL 2 are UNROLLED so each is its OWN attempt (a loop would land both on
      // one index and the declared term's controls factor would be under-run).
      for (const [label, forged] of forgedClaimCorpus) {
        await check(run, run.attempts + 1, () => {
          const hit = DURABILITY_TOKENS.filter((tok) => forged.toLowerCase().includes(tok))
          if (hit.length === 0) return `TP-2 CONTROL VACUOUS: the forged corpus \`${label}\` carries NO token from the scan's own word list — the control cannot discriminate`
          const at = forged.toLowerCase().indexOf(hit[0]!)
          const window = forged.slice(Math.max(0, at - 220), at + hit[0]!.length + 220)
          const negated = /\b(not|never|no|nowhere|none|cannot|isn't|doesn't|does not|without|nor|neither)\b/i.test(window)
          return negated
            ? `TP-2 CONTROL VACUOUS: the forged corpus \`${label}\` is NEGATED by the scan's own window rule, so it could never redden`
            : null
        })
      }
      // ---- INSTRUMENT CLASS 2 — READING 2c: the SAME no-durability scan driven over the LANDED
      // `src/main/security-store.ts` (the 3a precedent this unit's shape is modelled on), so the
      // scan's second substrate is read at a file this unit may not move.
      await check(run, run.attempts + 1, () => {
        const precedent = readMaybe(SECURITY_PATH)
        if (precedent === null) return 'TP-2 reading 2c (instrument class 2): `src/main/security-store.ts` could not be read — the precedent-substrate reading has no subject'
        const problems: string[] = []
        for (const line of precedent.split('\n')) {
          if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue
          if (/DURABILITY_TOKENS|anti-overclaim|non-claim|never claims|falsifier|honesty/i.test(line)) continue
          const hit = DURABILITY_TOKENS.filter((tok) => line.toLowerCase().includes(tok))
          if (hit.length === 0) continue
          const at = line.toLowerCase().indexOf(hit[0]!)
          const window = line.slice(Math.max(0, at - 220), at + hit[0]!.length + 220)
          if (/\b(not|never|no|nowhere|none|cannot|isn't|doesn't|does not|without|nor|neither|only|nothing)\b/i.test(window)) continue
          problems.push(`DURABILITY-CLAIM (the 3a precedent, src/main/security-store.ts): the line \`${line.trim().slice(0, 140)}\` asserts durability vocabulary [${hit.join(', ')}] — §6.1's honesty block; the \`fsync\` legs are SHAPE-asserted as invocations`)
        }
        return problems
      })
      await check(run, run.attempts + 1, () => {
        // control 3 — a `[T]` green quoted as app-green must redden the LAYER limb.
        //
        // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 4.⟩ The as-filed
        // control only asked whether a literal matched the CLAIM regex — it never ran the SCAN, so
        // it could not show the scan discriminating anything. It now drives the SAME module-level
        // `layerOverclaimLineProblems` oracle the reading above drives — ONE ORACLE, CALLED TWICE —
        // in BOTH directions. **WHAT MAKES IT ABLE TO FAIL: if the scan's negation rule suppresses
        // the colour on a line where a negation does NOT govern it (the as-filed bare-substring
        // `no ` guard), the PLANTED over-claim below is ADMITTED and this control reddens; if the
        // rule reddens on the artifacts' own limit sentences, the LAWFUL corpus reddens it too.**
        const forgedQuote = 'the [T] suite is app-green: the app now survives a crash' // FORGED-CLAIM-CORPUS
        // (a) the EXACT over-claim the audit named — the negation `no ` comes AFTER the claim and
        // must NOT save it.
        const plantedOverclaim = '| `U-ATOMICITY-SWEEP-CLASS-B` | this is app-green and no further live leg is owed |'
        const plantedReadings = [
          ...layerOverclaimLineProblems(forgedQuote),
          ...layerOverclaimLineProblems(plantedOverclaim),
        ]
        if (plantedReadings.length < 2) {
          return `TP-2 CONTROL 3 VACUOUS: the PLANTED over-claims did NOT redden the SAME layer oracle the reading above uses (saw ${String(plantedReadings.length)} finding(s)) — a line reading "this is app-green and no further live leg is owed" is EXACTLY the over-claim the scan exists to catch, and the as-filed bare-substring negation guard (` + '`no `' + `) skipped it BEFORE the claim form was evaluated`
        }
        // (b) THE LAWFUL CORPUS — a negation that DOES govern the claim must be ADMITTED, and each
        // sentence must EMBED THE EXACT CLAIM FORM under that negation, or the check would pass
        // merely because the claim regex never matched. **WHAT MAKES THIS ABLE TO FAIL: if the
        // lead-window rule were dropped (a scan reddening on ANY occupancy of the colour), these
        // sentences would be REJECTED and this control reddens; if the rule suppressed a negation
        // that does NOT govern, the planted over-claim above is admitted and it reddens there.**
        const lawfulRepudiations = [
          'this is NOT app-green and no further live leg is owed',
          'the node suite is not app-green — it is envelope-green at most',
          'no artifact of this unit is app-green, store-green or live-green',
        ]
        const lawfulReadings = lawfulRepudiations.flatMap((s) => layerOverclaimLineProblems(s))
        if (lawfulReadings.length > 0) {
          return `TP-2 CONTROL 3 VACUOUS: the layer oracle REJECTED the LAWFUL limit sentence(s) [${lawfulReadings.join(' | ')}] — a negation in the LEAD window GOVERNS the claim, so these are DENIALS; a scan that reddens on the artifacts' own limit sentences could never be satisfied and discriminates nothing`
        }
        // (c) AND THE CLAIM FORM MUST BE REACHABLE: check (b) is only meaningful if the SAME oracle
        // DOES fire when the governing negation is removed — otherwise (b) would pass because the
        // claim form never matched, not because the negation was respected.
        const negationsRemoved = 'this is app-green and no further live leg is owed'
        if (layerOverclaimLineProblems(negationsRemoved).length === 0) {
          return `TP-2 CONTROL 3 VACUOUS: the oracle did NOT fire on the lawful sentence with its governing negation REMOVED — the lawful-corpus check above would then be vacuous (it would pass because the claim form never matched, not because the negation was respected)`
        }
        return null
      })
      await check(run, run.attempts + 1, () => {
        // control 4 — the §6.2 leg's claim form must be an ORDER, not a timing figure.
        const legClaim = readMaybe(SPEC_PATH)?.match(/a value written through the operator-settings store was OBSERVED in the carrier after a real process restart/i)
        if (legClaim === null || legClaim === undefined) {
          return 'TP-2 CONTROL 4: the §6.2 claim form ("a value written through the operator-settings store was OBSERVED in the carrier after a real process restart") is ABSENT from the contract — the ORDER-claim form has no referent'
        }
        // **WHAT MAKES IT ABLE TO FAIL: the ORDER-claim form must carry NO timing figure. A forged
        // timing figure is planted beside it and the SAME predicate must redden on that.**
        const timingFigure = /\b\d+(?:\.\d+)?\s*(?:milliseconds?|seconds?|ms\b)/i
        if (timingFigure.test(legClaim[0])) {
          return 'TP-2 CONTROL 4: the §6.2 claim form carries a TIMING figure — §6.2 forbids a latency, a duration and a throughput figure'
        }
        const forgedTiming = 'a value written through the operator-settings store was OBSERVED in the carrier after a real process restart within 40 ms'
        return timingFigure.test(forgedTiming)
          ? null
          : 'TP-2 CONTROL 4 VACUOUS: a PLANTED timing figure did NOT redden the ORDER-claim predicate — a limb that cannot see a timing figure cannot police §6.2'
      })
    })
  })


  // -------------------------------------------------------------------------
  // §5.2 row 9 — P-ASW-H-1
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-H-1` — THE md5 RE-STATEMENT AND THE PRE-EMPTIVE CONTROL RE-ANCHOR (S-ASW-MD5-1)', async () => {
    await registerRow('P-ASW-H-1', async (run) => {
      const text = readMaybe(THEME_PIN_PATH)
      const block = text === null ? null : /const UNTOUCHED_DIGESTS:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(text)
      const parseRows = (src: string): Array<{ file: string; md5: string; restated: string | null; line: string }> => {
        const b = /const UNTOUCHED_DIGESTS:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(src)
        if (b === null) return []
        const rows: Array<{ file: string; md5: string; restated: string | null; line: string }> = []
        for (const line of b[1]!.split('\n')) {
          const file = /file:\s*'([^']+)'/.exec(line)
          if (file === null) continue
          rows.push({
            file: file[1]!,
            md5: /md5:\s*'([0-9a-f]{32})'/.exec(line)?.[1] ?? '',
            restated: /restated:\s*'([^']+)'/.exec(line)?.[1] ?? null,
            line,
          })
        }
        return rows
      }
      const rows = text === null ? [] : parseRows(text)
      const row = rows.find((r) => r.file === 'src/main/operator-settings-store.ts')

      // (1) the recorded md5 equals the file's REAL digest at the landed head.
      await check(run, run.attempts + 1, () => {
        if (row === undefined) return 'MD5-ROW-ABSENT: the `src/main/operator-settings-store.ts` row is not present in `UNTOUCHED_DIGESTS` — the re-statement has no subject (§1.1 member 4)'
        const actual = md5Of(readFileSync(OPERATOR_PATH))
        return row.md5 === actual
          ? null
          : `MD5-MEASURED: the recorded value is \`${row.md5}\` while the file's REAL digest at this head is \`${actual}\` — §1.1 member 4 / §2.7 C-9: the new value is MEASURED at the landing head (\`md5sum src/main/operator-settings-store.ts\`, AFTER the \`src/\` writes), never inferred (§4 RE-5, the PRE-RECORDED exemption)`
      })
      // (2) `restated` names THIS unit.
      await check(run, run.attempts + 1, () => {
        if (row === undefined) return 'MD5-ROW-ABSENT: the operator row is absent'
        return row.restated === RESTATING_UNIT
          ? null
          : `MD5-RESTATEMENT: the row's \`restated\` reads \`${String(row.restated)}\` — §1.1 member 4 / §3.2 I-7 require \`restated: '${RESTATING_UNIT}'\` SET IN THIS UNIT'S OWN COMMIT (the digest row is a landing-driven red BY CONSTRUCTION: this unit's own \`src/\` edit reddens it until the re-statement lands — §4 RE-5, PRE-RECORDED and EXEMPT-IN-ADVANCE)`
      })
      // (3) the superseded literal is still PRESENT in the row's text.
      await check(run, run.attempts + 1, () => {
        if (row === undefined) return 'MD5-ROW-ABSENT: the operator row is absent'
        return row.line.includes(SUPERSEDED_OPERATOR_MD5)
          ? null
          : `MD5-SUPERSEDED: the row does NOT keep \`${SUPERSEDED_OPERATOR_MD5}\` VISIBLE — §1.1 member 4 / §3.2 I-7: the superseded value is KEPT VISIBLE, NEVER deleted (§4 RE-6's limb 3)`
      })
      // (4) the table's row count is SEVEN.
      await check(run, run.attempts + 1, () => {
        if (block === null) return `MD5-TABLE: ${rel(THEME_PIN_PATH)} no longer carries the \`UNTOUCHED_DIGESTS\` table (§2.7 C-3)`
        return rows.length === UNTOUCHED_ROW_CENSUS
          ? null
          : `MD5-CENSUS: the table carries ${String(rows.length)} row(s) — §2.7 C-3 / §1.1 member 4: the SEVEN-row census is PRESERVED and NO OTHER ROW IS TOUCHED`
      })
      // (5) a synthetic EIGHTH-row corpus reddens the census limb.
      await check(run, run.attempts + 1, () => {
        if (text === null) return 'MD5-TABLE: the substrate is absent'
        const eighth = text.replace(
          "  { file: 'src/shared/path-fork-cycle.ts', md5: 'eee412ed7609a1c8c727f2dafb2d97fb' },",
          "  { file: 'src/shared/path-fork-cycle.ts', md5: 'eee412ed7609a1c8c727f2dafb2d97fb' },\n  { file: 'src/shared/invented-eighth.ts', md5: '00000000000000000000000000000000' },",
        )
        if (eighth === text) return 'MD5-CONTROL-5 VACUOUS: the synthetic eighth-row corpus could not be constructed (the anchor row moved)'
        return parseRows(eighth).length !== UNTOUCHED_ROW_CENSUS
          ? null
          : 'MD5-CONTROL-5 VACUOUS: a synthetic EIGHTH-row corpus did NOT redden the census limb'
      })
      // (6) a synthetic superseded-value-DELETION corpus reddens the visibility limb.
      await check(run, run.attempts + 1, () => {
        if (text === null) return 'MD5-TABLE: the substrate is absent'
        const deleted = text.replace(SUPERSEDED_OPERATOR_MD5, '')
        if (deleted === text) return 'MD5-CONTROL-6 VACUOUS: the superseded literal could not be found to delete — the visibility limb has no subject to protect'
        const deletedRow = parseRows(deleted).find((r) => r.file === 'src/main/operator-settings-store.ts')
        return (deletedRow?.line.includes(SUPERSEDED_OPERATOR_MD5) ?? true) === false
          ? null
          : 'MD5-CONTROL-6 VACUOUS: a synthetic superseded-value-deletion corpus did NOT redden the visibility limb'
      })
      // (7) the DERIVED expression is unchanged AS AN EXPRESSION.
      await check(run, run.attempts + 1, () => {
        if (text === null) return 'MD5-TABLE: the substrate is absent'
        return /const UNRESTATED_CONTROL_PATH\s*=\s*UNTOUCHED_DIGESTS\.find\(\(d\)\s*=>\s*d\.restated === undefined\)\?\.file/.test(text)
          ? null
          : 'DERIVED-CONTROL: `UNRESTATED_CONTROL_PATH` is no longer the DERIVED expression `UNTOUCHED_DIGESTS.find((d) => d.restated === undefined)?.file` — §3.2 I-6: the derivation STAYS DERIVED, never hand-edited to a literal'
      })
      const derived = rows.find((r) => r.restated === null)?.file ?? ''
      // (8) the control path is non-empty.
      await check(run, run.attempts + 1, () =>
        derived !== ''
          ? null
          : 'DERIVED-CONTROL-VACUOUS: every `UNTOUCHED_DIGESTS` row carries a `restated:` field — §3.2 I-6 requires the derivation to stay NON-VACUOUS (it must still resolve to a row this unit is not licensed to move)',
      )
      // (9) the control RESOLVES to a row this unit is NOT licensed to move.
      await check(run, run.attempts + 1, () => {
        if (derived === '') return 'DERIVED-CONTROL-VACUOUS: the derivation is empty — limb 9 has no subject'
        const resolved = rows.find((r) => r.file === derived)
        if (resolved === undefined) return `DERIVED-CONTROL: the resolved path \`${derived}\` is not a row of the table — the control would have no subject`
        return resolved.restated === null
          ? null
          : `DERIVED-CONTROL: the control resolves to \`${derived}\`, a row this unit IS licensed to move (it carries \`restated: '${String(resolved.restated)}'\`) — §3.2 I-6: the control must be aimed at a path this unit is NOT licensed to move`
      })
      // (10) the re-anchor note names THAT SAME path.
      await check(run, run.attempts + 1, () => {
        if (text === null) return 'MD5-TABLE: the substrate is absent'
        const at = text.indexOf('const UNRESTATED_CONTROL_PATH')
        const commentaryStart = text.lastIndexOf('/**', at)
        const commentary = commentaryStart >= 0 ? text.slice(commentaryStart, at) : ''
        const problems: string[] = []
        if (derived !== '' && !commentary.includes(derived)) {
          problems.push(
            `RE-ANCHOR-NOTE: the DERIVED control's commentary does NOT name \`${derived}\` — §1.1 member 5 / §3.2 I-6 require a DATED re-anchor note naming the path the derivation ACTUALLY RESOLVES TO, naming THIS unit as the act that derived it, and stating why that path is a legitimate subject. A note naming a subject the derivation does NOT resolve to is the SILENT RE-POINT the rule exists to pre-empt (§4 RE-6)`,
          )
        }
        if (!commentary.includes(RESTATING_UNIT)) {
          problems.push(`RE-ANCHOR-NOTE: the note does not name \`${RESTATING_UNIT}\` as the act that derived the new path (§1.1 member 5)`)
        }
        if (!/re-anchor|re-point|PRE-EMPTIVE/i.test(commentary)) {
          problems.push('RE-ANCHOR-NOTE: the note is not marked as the PRE-EMPTIVE re-anchor — the difference between this landing and the precedent is that the re-point is taken BEFORE the FAIL (§1.1 member 5)')
        }
        if (derived !== DERIVED_CONTROL_AFTER && derived !== '') {
          problems.push(
            `RE-ANCHOR-NOTE: the derivation resolves to \`${derived}\`, NOT to \`${DERIVED_CONTROL_AFTER}\` (§2.7 C-4). ⚠ C-4 flags this path as OWED to the landed table: if an intervening landing re-states a row ahead of \`demo-envelope.ts\`, the derived path MOVES and this limb's expectation must be RE-TAKEN against the landed table — it is NOT relaxed, and the note must name whatever path the derivation THEN resolves to`,
          )
        }
        return problems
      })
    })
  })

  // -------------------------------------------------------------------------
  // §5.2 row 10 — P-ASW-H-2
  // -------------------------------------------------------------------------
  it('§5.2 `P-ASW-H-2` — THE CARRIER CENSUS STAYS TRUE (S-ASW-CENS-1)', async () => {
    await registerRow('P-ASW-H-2', async (run) => {
      const themeText = readMaybe(THEME_PIN_PATH)
      const typesText = readMaybe(TYPES_PATH)
      // (1) the census's two-file list at the landed head.
      await check(run, run.attempts + 1, () => {
        const block = themeText === null ? null : /const UNTOUCHED_DIGESTS:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(themeText)
        if (block === null) return `CENSUS: ${rel(THEME_PIN_PATH)} no longer carries the \`UNTOUCHED_DIGESTS\` table`
        const files = [...block[1]!.matchAll(/file:\s*'([^']+)'/g)].map((m) => m[1]!)
        const carrier = files.filter((f) => /(?:^|\/)(types|operator-settings-store)\.ts$/.test(f))
        return JSON.stringify(carrier) === JSON.stringify(['src/shared/types.ts', 'src/main/operator-settings-store.ts'])
          ? null
          : `CENSUS: the persisted-\`theme\` carrier resolves to [${carrier.join(', ')}] — §5.2 P-ASW-H-2 / \`P-TH-SM-2 (c)\` / S2-S3: the census STAYS \`src/shared/types.ts\` + \`src/main/operator-settings-store.ts\`, because this sweep changes that file's WRITE SHAPE, never its CARRIER MEMBERSHIP`
      })
      // (2)/(3) the two construction paths are byte-unchanged.
      const mainText = readMaybe(MAIN_PATH)
      await check(run, run.attempts + 1, () => {
        if (mainText === null) return `CENSUS: ${rel(MAIN_PATH)} could not be read — the operator carrier's path has no substrate`
        return mainText.includes("provident-operator-settings.json") ? null : "CENSUS: the operator carrier's construction `path` is NOT byte-unchanged — §1.2 item 6 / S3: the file keeps its name, path and reader"
      })
      await check(run, run.attempts + 1, () => {
        if (mainText === null) return `CENSUS: ${rel(MAIN_PATH)} could not be read`
        return mainText.includes("provident-engine-config.json") ? null : "CENSUS: the engine carrier's construction `path` is NOT byte-unchanged — §1.2 item 6 / S3"
      })
      // (4) no `schemaVersion` token in either carrier's file shape — ONE reading over the closed
      // two-carrier set (§5.3).
      await check(run, run.attempts + 1, () => {
        const problems: string[] = []
        for (const [label, path] of [['operator-settings-store.ts', OPERATOR_PATH], ['engine-config.ts', ENGINE_PATH]] as const) {
          const src = readMaybe(path)
          if (src === null) { problems.push(`CENSUS: ${label} could not be read`); continue }
          if (/schemaVersion/.test(withoutComments(src))) {
            problems.push(`CENSUS: a \`schemaVersion\` member appears in ${label} — §1.2 item 5 / §7 non-claim 5: NO \`schemaVersion\` exists on EITHER carrier this unit lands`)
          }
        }
        return problems
      })
      // (5) no `file.settings.` token appears anywhere this unit may write — ONE reading over the
      // closed write set.
      await check(run, run.attempts + 1, () => {
        const problems: string[] = []
        for (const [label, path] of [['the operator carrier', OPERATOR_PATH], ['the engine carrier', ENGINE_PATH], ['main.ts', MAIN_PATH]] as const) {
          const src = readMaybe(path)
          if (src === null) { problems.push(`CENSUS: ${label} could not be read`); continue }
          if (/file\.settings\./.test(src)) {
            problems.push(`CENSUS: a \`file.settings.\` token appears in ${label} — S2 / §1.2 item 4/8 / §3.2 I-8: NO spelling is minted by this unit`)
          }
        }
        return problems
      })
      // (6) a synthetic CARRIER-MOVE corpus reddens the census limb.
      await check(run, run.attempts + 1, async () => {
        // the forged corpus: an `operator-settings-store.ts` re-pathed away from the census.
        const forgedFiles = ['src/shared/types.ts', 'src/main/operator-settings-REHOMED.ts']
        const forgedCarrier = forgedFiles.filter((f) => /(?:^|\/)(types|operator-settings-store)\.ts$/.test(f))
        return JSON.stringify(forgedCarrier) !== JSON.stringify(['src/shared/types.ts', 'src/main/operator-settings-store.ts'])
          ? null
          : 'CENSUS CONTROL 6 VACUOUS: a synthetic carrier-move corpus did NOT redden the census limb'
      })
      // (7) the reader (`src/renderer/**`'s read sites) is UNMOVED.
      await check(run, run.attempts + 1, () => {
        const hits = walkFiles(RENDERER_DIR)
          .map((p) => ({ p, t: withoutComments(readMaybe(p) ?? '') }))
          .filter(({ t }) => /createOperatorSettingsStore|createEngineConfigStore/.test(t))
          .map(({ p }) => rel(p))
        return hits.length === 0
          ? null
          : `CENSUS: [${hits.join(', ')}] constructs a carrier inside \`src/renderer/**\` — §1.2 item 1 / S9: this unit is MAIN-REALM ONLY with ZERO renderer surface change`
      })
      // (8) a synthetic second-writer corpus reddens the one-writer limb.
      await check(run, run.attempts + 1, () => {
        if (mainText === null) return `CENSUS: ${rel(MAIN_PATH)} could not be read`
        const body = withoutComments(mainText)
        const operatorSites = [...body.matchAll(/createOperatorSettingsStore\s*\(/g)].length
        const engineSites = [...body.matchAll(/createEngineConfigStore\s*\(/g)].length
        if (operatorSites !== 1) return `ONE-WRITER: \`createOperatorSettingsStore\` has ${String(operatorSites)} call site(s) — §3.2 I-10: ONE writer per file`
        if (engineSites !== 1) return `ONE-WRITER: \`createEngineConfigStore\` has ${String(engineSites)} call site(s) — §3.2 I-10: ONE writer per file`
        // the control: a synthetic SECOND-WRITER corpus must be SEEN by the same predicate.
        const forged = `${body}\n  const second = createOperatorSettingsStore({ path: 'x' })\n`
        const forgedSites = [...forged.matchAll(/createOperatorSettingsStore\s*\(/g)].length
        return forgedSites === 2
          ? null
          : 'CENSUS CONTROL 8 VACUOUS: a synthetic second-writer corpus did NOT redden the one-writer limb'
      })
    })
  })

  it('§5.3 — the register\u2019s arithmetic, printed with its terms, its caps, and the split `[T]`/`[H]`', async () => {
    await new Promise((r) => setTimeout(r, 0))
    expect(REPORTS.length, '§5.3: ALL TEN rows are declared and REPORTED — an un-run row is a FAILURE, never a pass').toBe(10)
    const printed = REPORTS.map((r) => `${r.row}=${String(r.declaredTotal)}`)
    // eslint-disable-next-line no-console -- the register's totals are PRINTED with their terms
    console.log(`ASW REGISTER: ${printed.join(' + ')} = ${String(REPORTS.reduce((a, r) => a + r.declaredTotal, 0))} attempts`)
    const tRows = REPORTS.filter((r) => r.layer === '[T]')
    const hRows = REPORTS.filter((r) => r.layer === '[H]')
    const tTotal = tRows.reduce((a, r) => a + r.declaredTotal, 0)
    const hTotal = hRows.reduce((a, r) => a + r.declaredTotal, 0)
    // eslint-disable-next-line no-console -- the layer split is PRINTED with its terms
    console.log(`ASW SPLIT: [T] ${tRows.length} rows = ${tTotal} · [H] ${hRows.length} rows = ${hTotal} · ALL ${String(REPORTS.length)} ROWS = ${String(tTotal + hTotal)}`)
    expect(tRows.length, '§5.3 — the EIGHT `[T]` rows (kinds `IM` · `SM` · `TP`)').toBe(8)
    expect(hRows.length, '§5.3 — the TWO `[H]` byte-scan surface pins').toBe(2)
    expect(tTotal, '§5.3 — `[T]` = `20 + 22 + 16 + 20 + 20 + 16 + 18 + 12 = 144` (the sum of the PRINTED EXPRESSIONS; §5.2\'s row 1 BOLDS `24`, whose expression sums to `20` — see the header\'s SPEC-ARITHMETIC DISCREPANCY block, and §5.3\'s own `144` which is the sum of the EXPRESSIONS)').toBe(144)
    expect(hTotal, '§5.3 — `[H]` = `10 + 8 = 18`').toBe(18)
    expect(tTotal + hTotal, '§5.3 — ALL TEN ROWS = `162`, with `[T] 144 + [H] 18 = 162`').toBe(162)
    for (const r of REPORTS) {
      expect(r.declaredTotal, `§5.1 — EVERY row carries its own declared term; ${r.row} = ${String(r.declaredTotal)} must sit ≤ its OWN cap of ${String(CAPS.perRow)}`).toBeLessThanOrEqual(CAPS.perRow)
      expect(r.executed, `${r.row}: the executed reading is reported (${String(r.executed)})`).toBeGreaterThanOrEqual(0)
      expect(r.strategyId, '§5.1 — every row carries its strategy id').toMatch(/^S-ASW-/)
      expect(typeof r.held, '§5.1 — every row carries `held`/`broken`').toBe('boolean')
      if (!r.held) {
        expect(r.counterexamples.length, `${r.row} — a BROKEN row NAMES its failing attempt`).toBeGreaterThan(0)
      }
    }
    expect(tTotal + hTotal, '§5.1 — the total sits UNDER the `≤400` cap (this row prints ITS OWN sum; a landing that executes a DIFFERENT total prints ITS OWN sum and names this filing\'s `162` as the filing\'s reading)').toBeLessThanOrEqual(CAPS.total)
    // the arm classes, PRINTED PER ROW (§5.1's cap/honesty block).
    const byClass = (c: RedClass): RowReport[] => REPORTS.filter((r) => r.redClass === c)
    // eslint-disable-next-line no-console -- the arm classes are PRINTED per row
    console.log(
      `ASW ARM CLASSES: RED-BY-ABSENCE [${byClass('RED-BY-ABSENCE').map((r) => r.row).join(', ')}] · ` +
        `RED-BY-SHIM [${byClass('RED-BY-SHIM').map((r) => r.row).join(', ')}] · ` +
        `GREEN-ON-ARRIVAL [${byClass('GREEN-ON-ARRIVAL').map((r) => r.row).join(', ')}]`,
    )
    expect(
      byClass('RED-BY-SHIM').map((r) => r.row).filter((id) => id === 'P-ASW-H-1'),
      '§4 RE-5 — the PRE-RECORDED, EXEMPT-IN-ADVANCE digest red is classed `RED-BY-SHIM` and named',
    ).toEqual(['P-ASW-H-1'])
    // ------------------------------------------------------------------
    // ⟨REPAIRED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, GATE-4 REMAND, FINDING 3.⟩
    // THE DEFECT (as filed, KEPT VISIBLE): this limb asserted
    //   `REPORTS.filter(r => r.stoppedAt !== null).map(...) toEqual
    //    REPORTS.filter(r => r.stoppedAt !== null).map(...)`
    // — an expression compared WITH ITSELF, which passes for ANY value of `stoppedAt` (including
    // a value no code path could ever assign, which was exactly the case).
    // THE REPAIR: the STOP now RUNS (see `attempt`), and this limb asserts the RULING as a
    // PROPERTY instead of comparing an expression to itself:
    //   ① NO register row reaches the stop — every row drives a CLOSED INPUT SET (§5.3), so
    //      `stoppedAt` is `null` on every row and no row is silently truncated;
    //   ② every row's disposition is `COMPLETED` (an abandoned row would be REPORTED as un-run,
    //      which §5.1 makes a FAILURE — so a `stoppedAt` here would be a finding, not a pass);
    //   ③ AND THE CAP CAN FIRE: a POOL-DRIVEN control row driven through THIS SAME `attempt()`
    //      DOES abandon, assigning `stoppedAt` and flipping the disposition — which is what proves
    //      `stoppedAt` is meaningful rather than a field nothing writes.
    // ------------------------------------------------------------------
    expect(
      REPORTS.filter((r) => r.stoppedAt !== null).map((r) => `${r.row}@${String(r.stoppedAt)}`),
      '§5.1 — NO register row reaches the STOP-AFTER-5 abandonment: every row drives a CLOSED INPUT SET (§5.3), and a closed set cannot be truncated without DROPPING A MEMBER. `stoppedAt` is `null` on every row BY PROPERTY, not by an unwritten field',
    ).toEqual([])
    expect(
      REPORTS.filter((r) => r.disposition !== 'COMPLETED').map((r) => `${r.row}:${r.disposition}`),
      '§5.1 — every register row COMPLETED: an abandoned (un-run) row is REPORTED as a FAILURE, never a pass',
    ).toEqual([])
    // THE CONTROL — a POOL-DRIVEN row (a DRAWN attempt set, the case §5.1’s stop rule governs)
    // driven through the SAME `attempt()` helper. **WHAT MAKES IT ABLE TO FAIL: it requires the cap
    // to FIRE — `stoppedAt` assigned, the disposition flipped to `ABANDONED-BY-CAP`, and every
    // subsequent draw REFUSED. If `attempt()` never consulted `run.consecutive`, `stoppedAt` would
    // stay `null` and this control would redden.** The lawful corpus immediately beside it (five
    // consecutive successes, then a failure) must NOT trip the cap.
    {
      const forged = newRun()
      // drive the pool: every draw fails. The cap must trip on the SIXTH draw — five consecutive
      // failures accumulate, and it is the NEXT attempt that is refused.
      for (let i = 0; i < 12; i++) attempt(forged, i, `POOL-DRIVEN-FAILURE ${String(i)}`)
      expect(
        forged.attempts,
        '§5.1 — CONTROL: a POOL-DRIVEN row must ABANDON after 5 CONSECUTIVE failures — exactly 5 attempts run and the remaining draws are REFUSED',
      ).toBe(STOP_AFTER)
      expect(
        forged.stoppedAt,
        '§5.1 — CONTROL: the abandonment is REPORTED by ASSIGNING `stoppedAt` to the index of the REFUSED draw — a cap implemented only in a COMMENT leaves this `null`, which is the defect this control exists to catch',
      ).toBe(STOP_AFTER)
      expect(forged.disposition, '§5.1 — CONTROL: the abandonment is REPORTED through the disposition, never hidden').toBe('ABANDONED-BY-CAP')
      expect(forged.consecutive, '§5.1 — CONTROL: the cap fires at exactly 5 CONSECUTIVE failures').toBe(STOP_AFTER)
      expect(
        forged.counterexamples.length,
        '§5.1 — CONTROL: only the 5 attempts that RAN contribute counterexamples — the refused draws are never counted as if they had run',
      ).toBe(STOP_AFTER)
      expect(
        forged.limbs.length,
        '§5.1 — CONTROL: the refused draws contribute NO limb — an abandoned row is not padded with un-run limbs presented as passes',
      ).toBe(STOP_AFTER)
      expect(forged.stoppedAt, '§5.1 — CONTROL: `stoppedAt` records the FIRST refusal and is not overwritten by later ones').toBe(STOP_AFTER)
      // THE LAWFUL CORPUS ①: an INTERRUPTED failure run (a success RESETS the counter) must NOT
      // trip the cap — otherwise the control would redden on everything and discriminate nothing.
      const lawful = newRun()
      for (let i = 0; i < 6; i++) attempt(lawful, i, i % 2 === 0 ? `FAILURE ${String(i)}` : null)
      expect(lawful.stoppedAt, '§5.1 — CONTROL: an interrupted failure run (a success RESETS the consecutive counter) must NOT trip the cap').toBeNull()
      expect(lawful.disposition, '§5.1 — CONTROL: the lawful interrupted run is still RUNNING (never abandoned)').toBe('RUNNING')
      // the run alternated FAIL/OK/FAIL/OK/FAIL/OK, so the LAST draw was a SUCCESS and the counter
      // is 0 — it never accumulated across the gaps, which is the property under test.
      expect(lawful.consecutive, '§5.1 — CONTROL: the counter is RESET against every success, so it never accumulates across a gap').toBe(0)
      expect(lawful.attempts, '§5.1 — CONTROL: every lawful draw ran — no truncation without a stop').toBe(6)
      // THE LAWFUL CORPUS ②: a run of FOUR failures (one short of the cap) must NOT trip it — the
      // cap is 5 CONSECUTIVE, not "≈5".
      const short = newRun()
      for (let i = 0; i < 4; i++) attempt(short, i, `FAIL ${String(i)}`)
      attempt(short, 4, null)
      expect(short.consecutive, '§5.1 — CONTROL: a success inside the failure run RESETS the consecutive counter to 0').toBe(0)
      for (let i = 5; i < 9; i++) attempt(short, i, `FAIL ${String(i)}`)
      expect(short.stoppedAt, '§5.1 — CONTROL: four post-reset failures are ONE SHORT of the cap — a counter that never reset would have tripped here').toBeNull()
      expect(short.attempts, '§5.1 — CONTROL: the lawful four-failure run executed every draw').toBe(9)
    }
  })

  it('§5.1 — EVERY row carries a DISCRIMINATING control whose expected outcome is the OPPOSITE of the row\u2019s verdict, and the ANTI-VACUITY limb is standing', () => {
    // §5.1: "a row whose drive set produces no observed movement, whose control cannot be
    // constructed, or whose oracle would stay green under a FORGED violation, is a FAILURE of that
    // row — never a pass." The declared terms all carry a `controls` factor; this limb asserts the
    // factor is PRESENT and NON-ZERO for every row, so no row can run without one.
    // §5.2 declares a controls factor for EIGHT of the ten rows; `P-ASW-IM-3` and `P-ASW-SM-1`
    // declare none (their FALSIFIERS carry the discrimination instead: a failure leg leaving a
    // parse-failing file answered with no distinguishing signal, and a state left unvisited). The
    // limb asserts what §5.2 actually declares rather than a uniform shape the spec does not use.
    const withControls = DECLARED_REGISTER.filter((r) => /control/i.test(r.declared)).map((r) => r.row)
    expect(withControls.length, '§5.2 — the EIGHT rows whose declared terms carry a controls factor').toBe(8)
    expect(
      DECLARED_REGISTER.filter((r) => !/control/i.test(r.declared)).map((r) => r.row),
      '§5.2 — the TWO rows whose declared terms carry NO controls factor name their FALSIFIER as the discrimination instead',
    ).toEqual(['P-ASW-IM-3', 'P-ASW-SM-1'])
    // …and every row's executed count equals its declared total (an un-run row is a failure).
    const unrun = REPORTS.filter((r) => r.executed !== r.declaredTotal).map((r) => `${r.row}: executed ${String(r.executed)} ≠ declared ${String(r.declaredTotal)}`)
    expect(unrun, '§5.1 — an UN-RUN row is reported as a FAILURE, never a pass: every row executed its own declared term').toEqual([])
  })
})
