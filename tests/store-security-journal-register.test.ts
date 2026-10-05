// tests/store-security-journal-register.test.ts — UNIT `U-STORE-SECURITY-JOURNAL` (3b, the
// RH-3 half of the SPLIT unit 3 of the store-adoption program, F2) — THE UNIT'S OWN
// FORK-AUTHORED TYPED PROPERTY REGISTER, §5 of
// `docs/specs/unit-store-security-journal.md`: the NINE rows — the SIX `[T]` rows
// (`P-SSJ-IM-1..4` · `P-SSJ-SM-1` · `P-SSJ-TP-1`) + the THREE `[H]` rows (`P-SSJ-H-1..3`).
//
// SOURCE OF EVERY ASSERTION (spec ONLY — the FOUNDATION's `store-security.md` §5 register and
// the SIBLING's `store-security-write-register.test.ts` are SHAPE sources ALONE; their ids,
// seeds, terms and layer are THEIRS and NOTHING is inherited here — §5: "no row id, term or
// seed is inherited"):
//   docs/specs/unit-store-security-journal.md
//     §0 R-1..R-9   the rulings: the CAP AUTHORITY is the ENGINE's maxJournalLength (the host
//                   trim is ILLEGAL); the seam's subject DIVERGES from the foundation's
//                   (Supervisor.journal.length, NEVER undoDepth); THE DENIED SURFACE; the
//                   burst re-home is INTENDED RH-3 behaviour with journal STAYING in
//                   MUTATING_METHODS; the park is STRUCTURAL NON-EXERCISABILITY; the package
//                   defect CATALOGUED, never patched
//     §0 S-P-2/-3   the supersession edges (the host-side cap function is WITHDRAWN BY RULING;
//                   3a's DENIED-1 item is DISCHARGED IN THIS COMMIT BY THE RE-AIM)
//     §1.1/§1.2     the FOUR-member change set and the THIRTEEN denied rows
//     §2.1 (a)/(c)/(b)  THE CAP AUTHORITY — (a) the host trim is ILLEGAL (the four hazards
//                   H1-H4); (c) THE ENGINE'S OPTION IS THE MECHANISM — the pane root IS
//                   findable by condense(), so the engine's condense is LIVE on this pane,
//                   NOT inert; THE M SEMANTICS (the trigger fires at M+1; the settled reading
//                   is 1 + post-base entries, never M exactly; M undefined => INERT); (b) THE
//                   syncConfig() VOLUME REDUCTION is the SECOND BOUND and the falsifier's
//                   CONTROL, with the MEASURED baseline named (16 draws/call, 32 per reply)
//     §2.2          THE SEAM — journalDepth(): number, public/read-only/SYNCHRONOUS, exactly
//                   ONE parameter (none), answering supervisor.journal.length and NOTHING
//                   else; a reading taken BEFORE the settle is an UNSETTLED reading
//     §2.3          THE SETTLE PROTOCOL — the landed drain() precedent (5 awaits of
//                   setTimeout(..., 0)), which CROSSES MACROTASK BOUNDARIES; flush() alone
//                   returns BEFORE the deferred condense; fake timers, a fixed tick-count and
//                   a "microtask" claim are each OUTSIDE
//     §2.4          THE BURST RE-HOME + THE PREDICATE BOUNDARY — an ok:true reply NOT in
//                   MUTATING_METHODS reaches the notify callback NOT AT ALL
//     §2.5          THE PROBE — EXACTLY TWO refreshDebug CALL SITES counted BY SYMBOL over
//                   the COMMENT-FREE body; a THIRD fails; the SPAN form is REJECTED BY NAME
//     §2.6          THE syncConfig() VOLUME GUARD — its four properties and its OUTSIDE list
//     §3.1/§3.2     THE INVARIANT and I-1..I-7
//     §3.3 F-1..F-12  the fail-states
//     §4 RE-1..RE-6 the red set and its no-other-red rule with the pre-recorded exemption
//     §5.1/§5.2     the NINE rows, their strategy ids, their declared terms and the
//                   arithmetic/caps/honesty block
//     §6            the layer ledger and the HONESTY/LIMITS block
//     §8/§9         the gates and the obligations (O-3 the landed one-argument call sites;
//                   O-4 the cap, re-aimed; O-8 the park artifact)
//
// LAYER (`RCA-12` / §5.2 / §6, mandatory and binding). `[T]` rows over a CONSTRUCTED pane
// (`new SecurePanels(mount, { ... })` in-process) / `[H]` wiring rows (byte-scan surface pins +
// the occurrence probe). NOTHING here is app-green, envelope-green, store-green, engine-green
// or live-green. The register proves the seam's subject, the cap's plumbing and reach, the
// two-level bounding, the volume guard's totality and the surface pins AGAINST A CONSTRUCTED
// PANE AND BYTE-SCANS. It does NOT prove: the assembled Electron app, the rendered surface
// under the real shell CSS/grid, a live round trip, the APP runtime's own journal behaviour, or
// the engine's internals. NO DURABILITY CLAIM is made anywhere (§6). No claim is made that a
// `[T]` green on a constructed pane implies the pane's behaviour under the assembled app.
//
// THE INSTRUMENTS (each row PRINTS its instrument):
//   (1) THE CONSTRUCTED PANE — new SecurePanels(mount, opts) over the node realm's
//       installShim()/mountEl() (`tests/secure-panels.test.ts`'s landed idiom), with a fake
//       window.provident.security bridge. The pane's Supervisor is reached through the INSTANCE
//       (the debugText()-class test seam's own carrier).
//   (2) THE SETTLE — this unit's OWN drain(), the LANDED precedent's SHAPE consumed BY
//       CITATION (`tests/blind-unit-ujr1-get-journal-greens.test.ts`): FIVE awaits of
//       new Promise((res) => setTimeout(res, 0)), crossing the engine's MACROTASK boundary.
//   (3) THE BYTE-SCAN SURFACE PINS — the [H] class (renderer.ts's occurrence set + the notify
//       callback; src/**'s production-negative).
//
// THE RED-BY-ABSENCE / RED-BY-SHIM / GREEN-ON-ARRIVAL CLASSIFICATION (recorded per row, §4).
// At this head the SEAM does not exist, the OPTION does not exist, the pane Supervisor is
// constructed WITHOUT the cap, the syncConfig() guard is not authored, the burst has not moved,
// and the park artifact is OWED. Three verdict classes are tracked DISTINCTLY and printed per
// row:
//   RED-BY-ABSENCE   — the row's subject member/surface does not exist at this head; the drive
//                      names the absent subject as its counterexample (§4 RE-1/RE-2/RE-3).
//   RED-BY-SHIM      — the row's oracle RUNS against the landed substrate and reports the
//                      pinned property UNSATISFIED (§4 RE-4/RE-5).
//   GREEN-ON-ARRIVAL — the row asserts a property ALREADY TRUE at this head (a
//                      negative/denied-surface pin). Marked explicitly, never counted as a
//                      landing-driven red (§4's no-other-red rule).
// Reporting a GREEN-ON-ARRIVAL row as red is §4's no-other-red violation; reporting a
// RED-BY-ABSENCE row as a pass is the honesty class this header exists to prevent.
//
// A RED-BY-SHIM CLASS NEVER EXCUSES A FAILING ROW. Every row's `held` is computed from its own
// drawn readings, so a row whose limbs are all red reports `broken` and REDDENS — the class is
// a LABEL for the DONE row's census, never a waiver.
//
// THE WALL: this file touches NOTHING but its own bytes. No src/** byte, no landed test file,
// no spec/tracker byte, no vitest.config.ts/package.json byte.
//
// AMBIGUITY RECORDED (returned to the supervisor, never guessed around): §5.1's declared terms
// are READING counts whose reading-level breakdown is not always arithmetically recoverable from
// the printed expression (e.g. `P-SSJ-IM-2`'s `4 drives x 2 readings = 8` must fold the V5
// multi-window drive into drive 4 and the jitter term into each drive's second reading;
// `P-SSJ-IM-1`'s `4 = 1+1+1+1` folds two sub-readings into drive 1). This register executes the
// DECLARED TOTALS (the authority per §5.2: "the register's printed sum is the authority", and it
// never re-takes a term) and PRINTS the executed count as the OUTCOME.
//
// ===========================================================================
// HEADER RECONCILIATION NOTES — RULING `A-3B-1` (2026-10-04, BY THE SUPERVISOR)
// ===========================================================================
// The supervisor's `A-3B-1` ruling (recorded in the contract's §10 amendment ledger) re-aims
// FOUR limbs of this register on the implementer's MEASURED stop. The measured figures that
// govern every re-aim below, quoted verbatim from that ledger and RE-CONFIRMED BY THIS PASS's own
// probe over the landed tree (reader: this TestWriter, at HEAD 62904ef + the implementer's
// uncommitted member set):
//   (i)   the engine's condense FIRES (the trigger is live, the attempt observable) but the D5
//         size guard ALWAYS SKIPS on this pane — `base 7622B >= pre-base journal 2312B` —
//         because the pane's base snapshot covers all 41 registered nodes while a single-node
//         drive carries a tiny payload. The skip is the structurally NORMAL outcome here.
//         CONFIRMED: the observed warn is verbatim
//         `condense-skipped-size at journal-12: base 7622B >= pre-base journal 2312B; no rewrite
//         (raise maxJournalLength)`, `basePresent === false`, and the capped settle reads 52
//         against M = 4.
//   (ii)  the warm-up `refresh()` draws 12 (the measured figure this pass re-observed: 12 on the
//         first cycle of a fresh pane, instrumented BEFORE that cycle).
//   (iii) every subsequent UNCHANGED cycle draws 0 (re-observed: 0, 0, 0 across cycles 2-4).
// Every re-aimed row below stays FALSIFIABLE and names the counterexample it still catches.
//
// RE-AIM ① `P-SSJ-IM-2` limb 1 (A-3B-1①; §5.1 P-SSJ-IM-2).
//   BEFORE — the first reading was the BOUND-CLAIM `journalDepth() <= M` after the settle
//            (repeated as the jitter term at a second settle, and again in the multi-window
//            drive).
//   AFTER  — the first reading is THE ATTEMPT READING: "the cap is CONFIGURED at the pane's
//            Supervisor (`M !== undefined`) AND a condense was ATTEMPTED after the drive",
//            read through the public `journalEntries()`'s `basePresent` OR the observable
//            `condense-skipped-size` warn. The `<= M` bound-claim is WITHDRAWN AS UNREACHABLE on
//            this fixture (figure (i)); the jitter term re-confirms the ATTEMPT at a second
//            settle; the multi-window drive re-confirms the ATTEMPT in a later window.
//   COUNTEREXAMPLE IT STILL CATCHES — an UNCONFIGURED pane (the option declared but never fed to
//            the Supervisor — §3 F-2) and a drive that NEVER TRIGGERS (zero `> M` crossings, so
//            no condense is scheduled): under either, NEITHER attempt reading is present and the
//            limb reddens (§3 F-3: a drive floor too small is a FAILURE of the row, not a pass).
//   UNCHANGED — limb 2 (the uncapped control: `M = undefined` => growth `> M`) stays the
//            ANTI-VACUITY limb, and the drive's `> M` floor stays (it proves the drive journals).
//   UNCHANGED IN FORM — limb 3 (the disjunction) keeps its shape with the SKIPPED arm now the
//            EXPECTED arm (`basePresent === false` + the equal reading carrying the
//            discrimination) — see re-aim ②.
//
// RE-AIM ② `P-SSJ-IM-3` state 2 and `P-SSJ-IM-4` OUTCOME A (A-3B-1②).
//   BEFORE — state 2 asserted the capped reading `<= M` for `{ maxJournalLength: M }`;
//            OUTCOME A asserted `basePresent === true` after a 40-mutation drive with
//            `journalDepth() !== undoDepth()`.
//   AFTER  — both are re-aimed to the OBSERVABLE OUTCOME (the skip): the equal
//            `journalDepth()`/`undoDepth()` reading + `basePresent === false` + the
//            `condense-skipped-size` warn. `basePresent === true` after a 40-mutation drive is
//            UNREACHABLE without changing the PANE'S BASE SIZE, which is not this unit's surface
//            (figure (i)). The landed/inequality branch is carried by the FORGED-BY-CONSTRUCTION
//            control (b), which states what makes the forgery an in-vivo state and is never
//            reported as a real drive.
//   COUNTEREXAMPLE IT STILL CATCHES — a declared-but-UNPLUMBED option (§3 F-2: the
//            construction-site pin reddens and no attempt is observable), a VACUOUS drive (zero
//            `> M` crossings), and a seam reading a WRONG SUBJECT (§3 F-4: the disjunction
//            classifies the reading UNCLASSIFIED, and an equal pair WITHOUT the skip warn is
//            rejected as the unplumbed class rather than accepted as a legal skip).
//   UNCHANGED — OUTCOME B is KEPT (a second, independent skip substrate: a different `M`, a
//            different drive length), and `P-SSJ-IM-3` state 1's `> M` inert-growth control and
//            state 3's PRESENT-as-undefined parity are untouched.
//
// RE-AIM ③ `P-SSJ-SM-1` state 1 vs `P-SSJ-TP-1` class 2 — THE CONTRADICTION IS RULED (A-3B-1③).
//   BEFORE — state 1 asserted `>= 1` draw on a cycle the fixture reached AFTER already calling
//            `refresh()` once, so the row measured a STEADY-STATE cycle and demanded `>= 1`
//            there; state 2 demanded the same. `P-SSJ-TP-1` class 2 simultaneously pinned
//            `< 16` (with the measured steady state 0). A row demanding `>= 1` on a steady-state
//            unchanged cycle is WRONG: it directly contradicts state 3 (SUPPRESSED, ZERO) and the
//            volume guard's whole purpose.
//   AFTER  — state 1 asserts the draw on the WARM-UP cycle, CAPTURED on a FRESH pane whose
//            recorder is installed BEFORE its first `refresh()` (measured 12 — figure (ii));
//            state 2 reads the SETTLED state through `debugText()` and pins the settled steady
//            reading BELOW the baseline (never `>= 1`); state 3 keeps ZERO on a repeated
//            UNCHANGED cycle (figure (iii)), now asserted exactly (`steady === 0`) as well as
//            below the baseline. Both are satisfiable by ONE guard — the one the unit lands.
//   COUNTEREXAMPLE IT STILL CATCHES — a machine whose DRAWN state was NEVER observed (a guard
//            that suppresses the warm-up too, reddening state 1's `warmUp > 0`), a machine that
//            never settles (a repeat still at/above the 16-draw baseline, reddening state 2), and
//            a PARTIAL suppression (a cycle that still draws some but fewer than 16, reddening
//            state 3's exact-ZERO limb).
//   UNCHANGED — `P-SSJ-TP-1` is NOT edited by A-3B-1: its RENDER-PARITY limb and its
//            STEADY-STATE-BOUND limb (`< 16`) already read correctly and are GREEN at this head.
//
import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { installShim, mountEl } from '../src/shared/dom-shim.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const PANELS_PATH = join(REPO_ROOT, 'src', 'renderer', 'secure-panels.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const SRC_DIR = join(REPO_ROOT, 'src')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-journal.md')
const WRITE_SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-write.md')
const PARK_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-journal-live-pending-battery.md')
const SELF_PATH = join(HERE, 'store-security-journal-register.test.ts')

beforeAll(() => {
  installShim()
})

// ===========================================================================
// §5 / §5.2 — SHARED MACHINERY, pinned once and binding on every row.
// Seed REGISTER_SEED = 0x20261006 (a fixed literal — never Date.now(), never Math.random(),
// never an environment read; distinct from the sibling's 0x20260927 and the earlier registers'
// 0x20261004); a hand-rolled 32-bit LCG, ONE STEP PER DRAW; caps <=100 attempts per row ·
// <=400 in total; rows run SEQUENTIALLY in register order; STOP AFTER 5 CONSECUTIVE FAILURES
// (abandonment is REPORTED through `stoppedAt`, never hidden; an un-run row is a FAILURE).
// ===========================================================================
const REGISTER_SEED = 0x20261006
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5
/** §5 — THE ROW-ID PREFIXES (fork-own; P-STORE-CORE-*, P-SPA-*, P-SSW-* are taken). */
const ROW_PREFIXES = ['P-SSJ-IM-', 'P-SSJ-SM-', 'P-SSJ-TP-', 'P-SSJ-H-'] as const
/** §2.3 — THE SETTLE PROTOCOL's round count, consumed BY CITATION from the landed precedent. */
const DRAIN_ROUNDS = 5
/** §2.3 — the three OUTSIDE settle classes, carried so a row can name them (§1.2 item 9). */
const FORBIDDEN_SETTLES = ['FLUSH-ALONE', 'FAKE-TIMERS', 'FIXED-TICK-COUNT'] as const
/** §2.1(b) / §2.6 — THE MEASURED BASELINE the falsifier answers to: 16 supervisor.apply({
 *  kind: 'state-slice' }) calls per syncConfig() invocation (8 singleton ops + 9 group toggles
 *  minus 1), and syncConfig() is called from BOTH refresh() and refreshDebug() => 32 journal
 *  entries per mutating reply. */
const MEASURED_BASELINE_PER_CALL = 16
const MEASURED_BASELINE_PER_MUTATING_REPLY = 32
/** §2.1(c) — THE M SEMANTICS: the trigger fires at M+1; the settled reading is 1 + post-base
 *  entries; M undefined => INERT (the landed default). */
const M_FIXTURE = 4
/** §5.1 `P-SSJ-IM-4` OUTCOME A / A-3B-1② — THE LANDED-CONDENSE DRIVE SIZE, MEASURED by this
 *  pass over the landed tree: the engine's D5 size guard SKIPS at 40 mutations
 *  (`journal 52 · undoDepth 52 · basePresent false`) and LANDS at 60
 *  (`journal 1 · undoDepth 0 · basePresent true`), because the base snapshot only becomes
 *  cheaper than the pre-base journal once the journal is large enough. */
const LANDED_DRIVE = 60

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

/** The four verdict classes of this unit's red (see the header). */
type RedClass = 'RED-BY-ABSENCE' | 'RED-BY-SHIM' | 'GREEN-ON-ARRIVAL' | 'GREEN'

interface DeclaredRow {
  row: string
  strategyId: string
  declared: string
  declaredTotal: number
  layer: '[T]' | '[H]'
  redHeadClass: RedClass
  redHeadNote: string
  redId: string
}

const DECLARED_REGISTER: DeclaredRow[] = [
  {
    row: 'P-SSJ-IM-1',
    strategyId: 'S-SSJ-SEAM-1',
    declared: '4 drives + 1 subject-discrimination drive = 5',
    declaredTotal: 5,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-1): SecurePanels.journalDepth resolves NOWHERE at this head — the module-member-absent class, by row. The shape drive, the identity drive and the positive control all report the ABSENT member BY NAME; the no-production-caller byte-scan limb holds independently (a denied-surface negative over src/**)',
    redId: 'RE-1',
  },
  {
    row: 'P-SSJ-IM-2',
    strategyId: 'S-SSJ-CAP-1',
    declared: '4 drives x 2 readings = 8',
    declaredTotal: 8,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-2) — RE-AIMED BY A-3B-1①/②. At this head the pane Supervisor IS constructed with maxJournalLength (the implementer landed it), so the pre-edit red has moved: the row now reddens on the WITHDRAWN-BOUND class it was re-aimed away from. The ATTEMPT reading (limb 1) holds — the condense IS attempted (the skip warn is emitted verbatim: base 7622B >= pre-base journal 2312B). The drive-2 anti-vacuity control (M undefined => growth > M) HOLDS. The re-aimed limbs separate an UNPLUMBED pane (§3 F-2) from a PLUMBED one: the `<= M` bound-claim is WITHDRAWN as unreachable on this fixture (A-3B-1①), since the D5 skip is the structurally NORMAL outcome here and no legal mechanism bounds the settle at <= M. Every attempt limb names its counterexample: an unconfigured pane, or a drive that never triggers, reddens it',
    redId: 'RE-2',
  },
  {
    row: 'P-SSJ-IM-3',
    strategyId: 'S-SSJ-OPT-1',
    declared: '3 option states x 2 readings = 6',
    declaredTotal: 6,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-3) — RE-AIMED BY A-3B-1②. At this head SecurePanelsOptions DOES carry maxJournalLength and the construction-site pin HOLDS, so the pre-edit red has moved. State 2 no longer asserts the withdrawn `<= M` capped reading: it asserts the ATTEMPT OUTCOME (the skip) — `basePresent === false` + the `condense-skipped-size` warn, with the equal journalDepth()/undoDepth() reading carrying the discrimination. Counterexample still caught: a pane whose option is declared but NOT fed to the Supervisor (§3 F-2) reddens the construction-site pin AND leaves no observable attempt; a drive with zero > M crossings is reported VACUOUS (§3 F-3), never a pass. States 1 and 3 (the inert growth and the PRESENT-as-undefined parity) are UNCHANGED',
    redId: 'RE-3',
  },
  {
    row: 'P-SSJ-IM-4',
    strategyId: 'S-SSJ-SUBJ-1',
    declared: '2 legal outcomes x 2 readings + 2 controls, + 1 landed-outcome drive = 7',
    declaredTotal: 7,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-1/RE-2) — RE-AIMED BY A-3B-1②. At this head the seam EXISTS and the cap is PLUMBED, so a condense IS attempted on every drive; what the fixture cannot produce is a LANDED base. Drive 1 (formerly OUTCOME A, `basePresent === true` after a 40-mutation drive) is re-aimed to the OBSERVABLE OUTCOME: the SKIP — the equal journalDepth()/undoDepth() pair + `basePresent === false` + the skip warn. Reaching a landed condense would require changing the PANE BASE SIZE (measured base 7622B >= pre-base journal 2312B), which is NOT this unit surface. The landed/inequality branch survives as the FORGED-BY-CONSTRUCTION control (b). Counterexample still caught: a seam reading a WRONG SUBJECT (§3 F-4) classifies UNCLASSIFIED and reddens; an equal pair WITHOUT the skip warn is rejected as the unplumbed class (§3 F-2) rather than accepted as a legal skip. The PRODUCTION-NEGATIVE control (a src/** byte-scan outside secure-panels.ts showing ZERO journalDepth call sites) HOLDS at this head',
    redId: 'RE-1',
  },
  {
    row: 'P-SSJ-SM-1',
    strategyId: 'S-SSJ-GRD-1',
    declared: '3 machine states x 2 readings = 6',
    declaredTotal: 6,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-4) — RE-AIMED BY A-3B-1③. The machine RUNS over the CONSTRUCTED pane. The WARM-UP is now CAPTURED on a FRESH pane (recorder installed BEFORE the first refresh()), because the IDLE -> DRAWN -> APPLIED transition happens ONCE: measured, the warm-up refresh() draws 12 and every later UNCHANGED cycle draws 0. State 1 therefore asserts the >= 1 draw on the WARM-UP (measured 12), NOT on a steady-state cycle — A-3B-1③ rules that a row demanding >= 1 on a steady-state unchanged cycle is WRONG, since it contradicts state 3 (SUPPRESSED, ZERO). State 3 keeps the zero; both are satisfiable by ONE guard. Counterexamples still caught: a guard that suppresses the warm-up too (state 1 reddens), a machine that never settles (state 2), and a PARTIAL suppression (state 3 exact-ZERO limb)',
    redId: 'RE-4',
  },
  {
    row: 'P-SSJ-TP-1',
    strategyId: 'S-SSJ-GRD-2',
    declared: '8 config classes = 8',
    declaredTotal: 8,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-4), SPLIT HONESTLY: the RENDER-PARITY limb is GREEN (the landed rendering is already correct — §4 RE-4 records that the render-parity limb passes and is never counted as a landing-driven red), while the STEADY-STATE-BOUND limb FAILS: a repeated refresh()/refreshDebug() with an UNCHANGED config draws 16 per call, not < 16, so the 32-entries-per-mutating-reply steady state does not fall toward 0',
    redId: 'RE-4',
  },
  {
    row: 'P-SSJ-H-1',
    strategyId: 'S-SSJ-PROBE-1',
    declared: '3 readings + 1 control = 4',
    declaredTotal: 4,
    layer: '[H]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-5): the occurrence probe SYMBOL count and COMMENT-FREE count both read 2 (they hold at this head — a register whose probe limbs were all red would be asserting the WRONG subject), while the NOTIFY-CALLBACK PLACEMENT reading fails: the per-reply call still sits in the reply .then, so the probe notify-callback limb resolves NOWHERE. The positive control (a forged third site / the pre-re-home arrangement) maintains its discrimination',
    redId: 'RE-5',
  },
  {
    row: 'P-SSJ-H-2',
    strategyId: 'S-SSJ-PRED-1',
    declared: '4 readings + 1 control = 5',
    declaredTotal: 5,
    layer: '[H]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-5), SPLIT HONESTLY: the journal-membership reading, the focus-absent reading and the MUTATING-side positive side all HOLD at this head (the predicate is landed and unwidened), while the READ-ONLY side fails: with the per-reply call still in the reply .then, a read-only reply drives the refreshDebug call count to 1, not ZERO — the predicate boundary the re-home is required to establish',
    redId: 'RE-5',
  },
  {
    row: 'P-SSJ-H-3',
    strategyId: 'S-SSJ-HON-1',
    declared: '5 readings = 5',
    declaredTotal: 5,
    layer: '[H]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-5 / §9 O-8): the PARK artifact docs/specs/unit-store-security-journal-live-pending-battery.md does NOT exist at this head — §8 gate 6 ships it at the unit close-out — so the presence/status and reason readings fail. The no-durability token scan and the layer statement HOLD over the FILED spec (a GREEN-ON-ARRIVAL half, recorded)',
    redId: 'RE-5',
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
}

const REPORTS: RowReport[] = []

interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
  limbs: Array<{ index: number; held: boolean }>
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null, limbs: [] }
}

/** A bounded attempt loop: the attempt is ALWAYS counted; the row's remaining attempts are
 *  abandoned once STOP_AFTER CONSECUTIVE failures have been seen, and the abandonment is
 *  reported through `stoppedAt` — never hidden. */
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

type CheckResult = string | string[] | null

async function check(run: RowRun, i: number, body: () => CheckResult | Promise<CheckResult>): Promise<void> {
  if (run.stoppedAt !== null || run.attempts >= CAPS.perRow) return
  let ce: CheckResult
  try {
    ce = await body()
  } catch (e) {
    ce = (e as Error)?.message ?? String(e)
  }
  if (Array.isArray(ce)) {
    if (ce.length === 0) {
      attempt(run, i, null)
    } else {
      // a multi-finding drive lands on the SAME attempt index, so the row's declared term
      // counts the DRIVE and its readings, never a re-count of its findings
      attempt(run, i, ce[0]!)
      for (const extra of ce.slice(1)) run.counterexamples.push(extra)
    }
    return
  }
  attempt(run, i, ce)
}

function finish(id: string, run: RowRun): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error('SSJ register failure: ' + id + ' is not a declared register row')
  const executed = run.attempts
  const held = run.counterexamples.length === 0
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
  }
  REPORTS.push(report)
  console.log(
    'SSJ ROW ' +
      id +
      ' ' +
      declared.strategyId +
      ': ' +
      (held ? 'held' : 'BROKEN') +
      ' · declared ' +
      declared.declared +
      ' = ' +
      String(declared.declaredTotal) +
      ' · executed ' +
      String(executed) +
      ' · stoppedAt ' +
      String(run.stoppedAt) +
      ' · red-class ' +
      declared.redHeadClass +
      ' (' +
      declared.redId +
      ') · limbs ' +
      run.limbs.map((l) => String(l.index) + ':' + (l.held ? 'held' : 'BROKEN')).join(',') +
      (run.counterexamples.length > 0 ? '\n    counterexamples: ' + run.counterexamples.slice(0, 3).join('\n    | ') : ''),
  )
  expect(
    held,
    id +
      ' ' +
      declared.strategyId +
      ': declared ' +
      declared.declared +
      ' = ' +
      String(declared.declaredTotal) +
      ' reading(s); executed ' +
      String(executed) +
      ' reading(s); stoppedAt ' +
      String(run.stoppedAt) +
      ' — ' +
      (held ? 'HELD' : 'BROKEN') +
      (run.counterexamples.length > 0 ? '; counterexamples: ' + run.counterexamples.slice(0, 4).join(' | ') : ''),
  ).toBe(true)
  return report
}

/** Run a register row's body: a body that THROWS still reports the row — BROKEN, with the throw
 *  as its counterexample — so `stoppedAt`, the declared-vs-executed term and the counterexample
 *  list are never hidden by an early throw. */
async function registerRow(id: string, body: (run: RowRun) => Promise<void> | void): Promise<void> {
  const run = newRun()
  let thrown: string | null = null
  try {
    await body(run)
  } catch (e) {
    thrown = (e as Error)?.message ?? String(e)
  }
  if (thrown !== null) run.counterexamples.push(thrown)
  finish(id, run)
}

// ===========================================================================
// §2.3 — THE SETTLE: this unit's OWN drain(), the LANDED precedent's SHAPE consumed BY
// CITATION. FIVE awaits of setTimeout(..., 0) — it CROSSES MACROTASK BOUNDARIES, which is what
// flush() alone cannot do: hasPendingWork() is `flushScheduled || pass2Dirty.size > 0 ||
// pendingTriggers.size > 0` and does NOT include condenseScheduled, so a bare flush() returns
// BEFORE the deferred condense has run (§3 F-5).
// ===========================================================================
async function drain(rounds = DRAIN_ROUNDS): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await new Promise((res) => setTimeout(res, 0))
  }
}

// ===========================================================================
// THE PANE FIXTURE — §2.1(c)'s instrument: a CONSTRUCTED pane (the node realm's landed
// installShim()/mountEl() idiom) with a fake window.provident.security bridge.
// ===========================================================================
interface BridgeCfg {
  token: string | null
  enabled: string[]
  maxJournalLength?: number
}

function fakeSecurity(initial?: Partial<BridgeCfg>): { current: () => BridgeCfg; bridge: Record<string, unknown> } {
  let cfg: BridgeCfg = { token: null, enabled: ['read', 'dispatch'], ...initial }
  return {
    current: () => cfg,
    bridge: {
      get: async () => ({ ...cfg }),
      set: async (patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }) => {
        const next: BridgeCfg = { ...cfg }
        if ('token' in patch) next.token = patch.token ?? null
        if (patch.groups) for (const g of patch.groups) if (!next.enabled.includes(g)) next.enabled.push(g)
        if (patch.disable) next.enabled = next.enabled.filter((g) => !patch.disable!.includes(g))
        if ('maxJournalLength' in patch) {
          if (patch.maxJournalLength === null || patch.maxJournalLength === undefined) delete next.maxJournalLength
          else next.maxJournalLength = patch.maxJournalLength
        }
        cfg = next
        return { ...next }
      },
    },
  }
}

function installBridge(fake: ReturnType<typeof fakeSecurity>): void {
  ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: fake.bridge } }
}

type PanelsCtor = new (mount: unknown, opts?: Record<string, unknown>) => unknown
type PanelsLoad = { ok: true; ctor: PanelsCtor } | { ok: false; error: string }

async function loadPanels(): Promise<PanelsLoad> {
  try {
    const ns = (await import('../src/renderer/secure-panels.js')) as { SecurePanels?: PanelsCtor }
    if (typeof ns.SecurePanels !== 'function') {
      return { ok: false, error: 'SecurePanels resolves NOWHERE on the module namespace' }
    }
    return { ok: true, ctor: ns.SecurePanels }
  } catch (e) {
    return { ok: false, error: (e as Error)?.message ?? String(e) }
  }
}

interface JournalViewLike {
  entries: Array<{ index: number; kind: string; status: string }>
  totalEntries: number
  undoDepth: number
  redoDepth: number
  basePresent: boolean
  truncated: boolean
  maxJournalLength?: number
}

interface SupervisorLike {
  journal: Array<{ id: string; op: { kind: string } }>
  allNodes(): Array<{ props?: { id?: string } }>
  apply(op: Record<string, unknown>, opts?: Record<string, unknown>): { status: string; journalId?: string }
  journalEntries(opts?: { afterIndex?: number; limit?: number }): JournalViewLike
  undoDepth: number
  redoDepth: number
}

interface PaneHandle {
  panels: Record<string, unknown>
  supervisor: SupervisorLike
  mount: unknown
  opts: Record<string, unknown> | undefined
}

interface PaneError {
  error: string
}

/** Build a CONSTRUCTED pane over the landed idiom. `opts` is passed VERBATIM, so a drive can
 *  exercise the ABSENT / PRESENT / PRESENT-as-undefined option states and the POSITIONAL
 *  forgery without the fixture "helping" the subject. */
async function makePane(opts?: Record<string, unknown>, initial?: Partial<BridgeCfg>): Promise<PaneHandle | PaneError> {
  const loaded = await loadPanels()
  if (!loaded.ok) return { error: loaded.error }
  const fake = fakeSecurity(initial)
  installBridge(fake)
  const mount = mountEl() as unknown
  let panels: unknown
  try {
    panels = opts === undefined ? new loaded.ctor(mount) : new loaded.ctor(mount, opts)
  } catch (e) {
    return { error: 'CONSTRUCTION-THREW: ' + ((e as Error)?.message ?? String(e)) }
  }
  const supervisor = (panels as { supervisor?: SupervisorLike }).supervisor
  if (supervisor === undefined || supervisor === null) {
    return { error: 'the pane carries NO readable supervisor — the journal drives have no subject (the pane own test-seam class)' }
  }
  return { panels: panels as Record<string, unknown>, supervisor, mount, opts }
}

function isPaneError(v: PaneHandle | PaneError): v is PaneError {
  return typeof (v as PaneError).error === 'string'
}

interface SeamReading {
  present: boolean
  value: unknown
  arity: number | null
  threw: string | null
}

/** §2.2 — THE SEAM's reader. Never throws: an absent member is REPORTED, so a drive can name the
 *  absent-subject class rather than crashing the row. */
function readSeam(panels: Record<string, unknown>): SeamReading {
  const member = (panels as { journalDepth?: unknown }).journalDepth
  if (typeof member !== 'function') return { present: false, value: undefined, arity: null, threw: null }
  const fn = member as (...args: unknown[]) => unknown
  try {
    return { present: true, value: fn.call(panels), arity: fn.length, threw: null }
  } catch (e) {
    return { present: true, value: undefined, arity: fn.length, threw: (e as Error)?.message ?? String(e) }
  }
}

// ===========================================================================
// §2.6 — THE MUTATION-BUILDING SITE's draw counter. The subject is supervisor.apply({ kind:
// 'state-slice', ... }) AT THE PANE's OWN syncConfig() SITE: the counter wraps the instance's
// PUBLIC apply and counts only state-slice ops. It is a RECORDER over a public engine method —
// no engine byte moves, no internal field is touched.
// ===========================================================================
interface DrawRecorder {
  draws: number
  stop(): void
}

function recordDraws(pane: PaneHandle): DrawRecorder {
  const sup = pane.supervisor as unknown as {
    apply: (op: Record<string, unknown>, o?: Record<string, unknown>) => { status: string; journalId?: string }
  }
  const original = sup.apply.bind(sup)
  const rec: DrawRecorder = {
    draws: 0,
    stop: () => {
      sup.apply = original
    },
  }
  sup.apply = (op: Record<string, unknown>, o?: Record<string, unknown>) => {
    if (op?.kind === 'state-slice') rec.draws++
    return original(op, o)
  }
  return rec
}

/** §2.6 — the per-cycle APPLIED count for one refresh(). */
async function refreshDraws(pane: PaneHandle): Promise<number> {
  const rec = recordDraws(pane)
  try {
    await (pane.panels as { refresh: () => Promise<void> }).refresh()
  } finally {
    rec.stop()
  }
  return rec.draws
}

/** §2.1(c) — THE CAP DRIVE: the pane's own journal grows by driving the pane graph through a
 *  MUTATION of a pane node. `crossings` counts how many times the drive observed the journal
 *  ABOVE the fixture's M BEFORE the settling drain (V5's multi-window reading). */
async function driveJournal(pane: PaneHandle, mutationCount: number, m: number): Promise<{ crossings: number; grew: number }> {
  const sup = pane.supervisor
  const target = sup.allNodes().find((n) => n.props?.id === 'status' || n.props?.id === 'security-status')
  if (target === undefined) return { crossings: 0, grew: 0 }
  let crossings = 0
  const before = sup.journal.length
  for (let i = 0; i < mutationCount; i++) {
    sup.apply({ kind: 'state-slice', node: target, mutation: [{ targetProp: 'content', value: 'drive-' + String(i) }] })
    if (sup.journal.length > m) crossings++
  }
  return { crossings, grew: sup.journal.length - before }
}

// ===========================================================================
// THE BYTE-SCAN HELPERS — the [H] instrument (a byte-scan over the landed tree).
// ===========================================================================
function readMaybe(path: string): string | null {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : null
  } catch {
    return null
  }
}

/** The comment-free body (the landed withoutComments precedent, §2.5's COMMENT EXCLUSION). */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
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

// ===========================================================================
// §2.5 — THE OCCURRENCE PROBE (the [H] instrument). BY SYMBOL, over the COMMENT-FREE body.
// ===========================================================================
interface ProbeReading {
  symbol: number
  commentFree: number
  literal: number
  inNotify: boolean
  inThen: boolean
  span: number
}

function refreshDebugSiteReading(text: string): ProbeReading {
  const body = withoutComments(text)
  const symbol = (body.match(/\brefreshDebug\b/g) ?? []).length
  const literal = (body.match(/panels\?\.refreshDebug\s*\(/g) ?? []).length
  const inNotify = /\(\s*p\s*\)\s*=>\s*\{[\s\S]{0,200}refreshDebug/.test(body)
  const thenBodies = [...body.matchAll(/\.then\(\s*\(\s*reply\s*\)\s*=>\s*\{([\s\S]{0,400}?)\}\s*\)/g)].map((m) => m[1] ?? '')
  const inThen = thenBodies.some((b) => /refreshDebug/.test(b))
  // THE REJECTED FORM (REJECTED BY NAME): a span reader cannot tell the two sites apart,
  // because the notify site lies INSIDE the replyRoute span.
  const span = [...text.matchAll(/replyRoute[\s\S]{0,400}refreshDebug/g)].length
  return { symbol, commentFree: symbol, literal, inNotify, inThen, span }
}

// ===========================================================================
// §2.4 / §5.1 P-SSJ-H-2 — THE PREDICATE BOUNDARY, driven at the fork's own handleRequest emit
// site over the REAL MUTATING_METHODS literal read from renderer.ts (never hard-coded).
// ===========================================================================
function mutatingMethods(): Set<string> {
  const text = readMaybe(RENDERER_PATH)
  if (text === null) return new Set()
  const m = /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(withoutComments(text))
  if (m === null) return new Set()
  return new Set(
    m[1]!
      .split(',')
      .map((s) => s.trim().replace(/^'|'$/g, ''))
      .filter(Boolean),
  )
}

/** THE FORK'S OWN EMIT SHAPE, mirrored faithfully (the landed handleRequest's .then):
 *    if (reply.ok && MUTATING_METHODS.has(req.method)) notify({ uri: 'mcp://provident/app' })
 *  `shape` selects WHERE the per-reply refresh burst sits: 're-homed' puts it INSIDE the notify
 *  callback (THE LANDED ARRANGEMENT at src/renderer/renderer.ts — the unit's target), while
 *  'pre-re-home' puts it in the reply .then.
 *
 *  ⟶ RE-AIM (A-3B-1④ / `P-SSJ-H-2` reading 1). The as-filed reading 1 drove the 'pre-re-home'
 *  shape ONLY, and `driveReply` increments `refreshCount` UNCONDITIONALLY in that branch — so the
 *  reading was a HARD-CODED MIRROR of the superseded arrangement, never a measurement of the
 *  landed wiring. MEASURED at the pre-re-home head the real re-home was absent, so the reading
 *  reddened on a MIRROR rather than on the artifact. THE REAL RE-HOME IS NOW LANDED (renderer.ts's
 *  notify callback), so reading 1 is RE-AIMED to the 're-homed' shape: the predicate boundary is
 *  asserted against the REAL landed arrangement. The 'pre-re-home' mirror is KEPT as a documented
 *  NEGATIVE/CONTROL (it still discriminates: it is the §3 F-8 falsifier's shape, and it shows the
 *  reader REDDENS when the burst is hoisted OUT of the predicate) — never as a pass-required
 *  reading. */
async function driveReply(
  shape: 're-homed' | 'pre-re-home',
  method: string,
  ok: boolean,
  refresh: () => void,
): Promise<{ notifyCount: number; refreshCount: number }> {
  return driveReplyWith(shape, method, ok, mutatingMethods(), refresh)
}

/** The SAME drive with an INJECTED predicate — so the control's §3 F-8 falsifier (a WIDENED
 *  `MUTATING_METHODS`) drives the SAME code the row drives, never a re-implemented copy. A control
 *  over a re-implemented copy would discriminate nothing (the sibling's `P-SSW-H-4` precedent). */
async function driveReplyWith(
  shape: 're-homed' | 'pre-re-home',
  method: string,
  ok: boolean,
  mutating: Set<string>,
  refresh: () => void = () => undefined,
): Promise<{ notifyCount: number; refreshCount: number }> {
  let notifyCount = 0
  let refreshCount = 0
  const notify = (): void => {
    notifyCount++
    if (shape === 're-homed') {
      refresh()
      refreshCount++
    }
  }
  const reply = { ok }
  if (shape === 'pre-re-home') {
    // THE DOCUMENTED NEGATIVE/CONTROL ONLY (A-3B-1④): the .then runs for EVERY resolved reply —
    // read-only ones included — which is the §3 F-8 regression the landed re-home closes. This
    // branch is never pass-required by any reading (§5.1 P-SSJ-H-2 reads the 're-homed' shape).
    refresh()
    refreshCount++
  }
  if (reply.ok && mutating.has(method)) notify()
  return { notifyCount, refreshCount }
}

// ===========================================================================
// THE ROW HELPERS — each returns a counterexample string (or an array of them), or null when the
// limb HELD.
// ===========================================================================
function seamAbsentCe(where: string): string {
  return (
    'MEMBER-ABSENT (' +
    where +
    '): journalDepth() resolves NOWHERE on the constructed pane — §2.2 declares SecurePanels own public read-only SYNCHRONOUS journalDepth(): number over this.supervisor.journal.length; §4 RE-1 (the module-member-absent class)'
  )
}

/** §1.2 item 12 / §5.1 P-SSJ-IM-1 drive 3 + P-SSJ-IM-4 control (a) — THE PRODUCTION-NEGATIVE:
 *  a byte-scan of src/** shows ZERO journalDepth call sites OUTSIDE its own declaration, so the
 *  seam cannot be reachable to shipped wiring (§3.2 I-5). */
function noProductionCallerProblems(): string | null {
  const files = walkFiles(SRC_DIR)
  if (files.length === 0) return 'ABSTRACT-SUBJECT: no src/** file was readable — the production-negative has no substrate'
  const declared = /\bjournalDepth\s*\(\s*\)\s*:\s*number/
  const offenders: string[] = []
  let declarationSeen = false
  let scanned = 0
  for (const p of files) {
    const text = readMaybe(p)
    if (text === null) continue
    scanned++
    const body = withoutComments(text)
    const occurrences = [...body.matchAll(/\bjournalDepth\s*\(/g)].length
    if (occurrences === 0) continue
    if (declared.test(body)) {
      declarationSeen = true
      if (occurrences > 1) offenders.push(relative(REPO_ROOT, p) + ' carries ' + String(occurrences) + ' occurrences (the declaration + a CALL)')
      continue
    }
    offenders.push(relative(REPO_ROOT, p) + ' (' + String(occurrences) + ' occurrence(s) with NO declaration in that file)')
  }
  if (scanned === 0) return 'ABSTRACT-SUBJECT: no src/** file was readable — the production-negative has no substrate'
  if (offenders.length > 0) {
    return (
      'DENIED-12 / PRODUCTION-NEGATIVE: a journalDepth occurrence OUTSIDE its own declaration exists — [' +
      offenders.join(', ') +
      '] — §1.2 item 12 / §0 R-3 / §3.2 I-5: the seam is a TEST/VISIBILITY accessor of the debugText() class with NO production caller (the pane status text derives from the APP runtime census/SSR, NEVER from the pane own journal)'
    )
  }
  console.log(
    'SSJ [production-negative]: scanned ' +
      String(scanned) +
      ' src/** file(s); a declaration is ' +
      (declarationSeen ? 'PRESENT' : 'ABSENT (the seam is not authored yet — §4 RE-1)') +
      '; offenders: none',
  )
  return null
}

/** §5.1 P-SSJ-IM-1 drive 4 — THE POSITIVE CONTROL: a FORGED journalDepth() answering
 *  journalEntries().undoDepth must REDDEN the same oracle. The control is a COHERENT reading:
 *  the engine's public undoDepth IS the value the foundation's own journalDepth returns, so the
 *  forgery REACHES a state a wrong landing genuinely produces (post-condense the stack is
 *  truncated at the base while the journal keeps base + 1). */
function forgeSeamControl(): string | null {
  const oracle = (journalLen: number, undoDepth: number): boolean => journalLen === undoDepth
  const journalLen = 17
  const undoDepth = 5
  if (!oracle(journalLen, undoDepth)) {
    console.log('SSJ [seam-forgery control]: the identity oracle REDDENS on the forged subject (journal 17 vs undoDepth 5) — discriminating')
    return null
  }
  return 'PROBE-CONTROL (the seam forgery): a journalDepth() returning journalEntries().undoDepth did NOT redden the identity oracle on a coherent reading (journal 17 vs undoDepth 5) — §5.1 P-SSJ-IM-1 drive 4 / §2.2: the control must show the oracle discriminating a WRONG SUBJECT (§3.2 I-1)'
}

/** §5.1 P-SSJ-IM-3 state 2 / §1.1 member 1② — THE CONSTRUCTION-SITE PIN: the pane Supervisor is
 *  constructed WITH the option, fed from opts.maxJournalLength. */
function constructionSiteProblems(): string[] {
  const panels = readMaybe(PANELS_PATH)
  if (panels === null) {
    return ['ABSTRACT-SUBJECT: src/renderer/secure-panels.ts could not be read — the construction-site pin has no substrate']
  }
  const findings: string[] = []
  const body = withoutComments(panels)
  if (!/new\s+Supervisor\s*\(\s*\{[\s\S]{0,300}?maxJournalLength/.test(body)) {
    findings.push(
      'CONSTRUCTION-SITE: the pane Supervisor construction site does not carry maxJournalLength — §1.1 member 1② requires new Supervisor({ events: new EventBridge(), graphScope: this.scope, maxJournalLength: this.maxJournalLength }), fed from opts.maxJournalLength (§2.1(c); §4 RE-2)',
    )
  }
  if (!/this\.maxJournalLength/.test(body)) {
    findings.push(
      'CONSTRUCTION-FEED: the pane carries no this.maxJournalLength — §1.1 member 1② feeds the construction from opts.maxJournalLength; the operator value IS the pane value (dossier §1 row 2, the IDENTITY), so no independent literal may stand in for it (§1.2 item 5)',
    )
  }
  return findings
}

/** §5.1 P-SSJ-IM-3 control 1 — THE POSITIONAL FORGERY: a second POSITIONAL argument bound at a
 *  landed new SecurePanels( site must redden (the option is a NAMED member of
 *  SecurePanelsOptions, §1.1 member 1①). */
function positionalForgeryProblems(): string | null {
  const panels = readMaybe(PANELS_PATH)
  const renderer = readMaybe(RENDERER_PATH)
  if (panels === null || renderer === null) return 'ABSTRACT-SUBJECT: the POSITIONAL control has no substrate (a renderer file could not be read)'
  const findings: string[] = []
  const targets: Array<[string, string]> = [
    ['src/renderer/secure-panels.ts', panels],
    ['src/renderer/renderer.ts', renderer],
  ]
  for (const [where, text] of targets) {
    const body = withoutComments(text)
    // the POSITIONAL shape: a construction whose SECOND argument is a BARE IDENTIFIER (never an
    // object literal). new SecurePanels(mount, opts) is the FORGED form.
    for (const m of body.matchAll(/new\s+SecurePanels\s*\(\s*([^,()]+),\s*([A-Za-z_$][\w$]*)\s*\)/g)) {
      findings.push(
        'POSITIONAL-FORGERY: ' +
          where +
          ' binds a bare identifier ' +
          String(m[2]) +
          ' as the SECOND POSITIONAL argument of a new SecurePanels( site — §1.1 member 1① / §3.2 I-3: the option is a NAMED, ADDITIVE-OPTIONAL member of SecurePanelsOptions (constructor(mount, opts)), never a positional second argument (§3 F-10)',
      )
    }
  }
  return findings.length > 0 ? findings : null
}

/** §5.1 P-SSJ-IM-3 control 2 — THE LANDED ONE-ARGUMENT CALL-SITE COMPATIBILITY reading: every
 *  landed call site is either ONE-ARGUMENT or (mount, { ... }); the option stays OPTIONAL so the
 *  one-argument form remains legal (§3.2 I-3; §9 O-3). */
function oneArgumentCompatibilityProblems(): string | null {
  const renderer = readMaybe(RENDERER_PATH)
  if (renderer === null) return 'ABSTRACT-SUBJECT: the one-argument compatibility reading has no substrate'
  const body = withoutComments(renderer)
  const sites = [...body.matchAll(/new\s+SecurePanels\s*\(([^)]*)\)/g)].map((m) => m[1]!.trim())
  if (sites.length === 0) {
    return 'ABSTRACT-SUBJECT: no new SecurePanels( call site is readable in renderer.ts — §9 O-3 names the landed one-argument sites that must STAY GREEN, and the compatibility reading has no subject'
  }
  for (const site of sites) {
    const oneArg = site.length > 0 && !site.includes(',')
    const objectSecond = /^[^,]+,\s*\{[\s\S]*\}$/.test(site)
    if (!oneArg && !objectSecond) {
      return (
        'CALL-SITE-COMPAT: a new SecurePanels( site reads (' +
        site +
        ') — §3.2 I-3 / §9 O-3: every landed call site is either ONE-ARGUMENT or (mount, { ... }); a positional second argument breaks the landed form (§3 F-10)'
      )
    }
  }
  const self = readMaybe(SELF_PATH)
  if (self === null) return 'ABSTRACT-SUBJECT: this register could not be read — the one-argument drive has no declared site'
  if (!/new\s+loaded\.ctor\(mount\)/.test(self)) {
    return 'CALL-SITE-COVERAGE: this register does not drive the ONE-ARGUMENT construction form — §5.1 P-SSJ-IM-3 control 2 requires the landed one-argument compatibility reading to be DRIVEN, not asserted'
  }
  console.log(
    'SSJ [one-argument compatibility]: ' +
      String(sites.length) +
      ' new SecurePanels( site(s) in renderer.ts, all ONE-ARGUMENT or (mount, with an object); this register drives the ONE-ARGUMENT form directly',
  )
  return null
}

/** §5.1 P-SSJ-IM-4 control (b) — THE BARE-INEQUALITY FORGERY: the D5-skipped outcome is FORGED
 *  (the condense-skipped-size warn paired with an EQUAL reading and basePresent === false) and
 *  an inequality-ONLY oracle is shown to REDDEN on it. The forgery REACHES a state the skip
 *  genuinely produces (§2.1(c)), so the control is a COHERENT reading and not a strawman. */
function bareInequalityForgeryProblems(): string | null {
  const forged = { journalLength: 12, undoDepth: 12, basePresent: false, skippedWarn: true }
  if (forged.basePresent !== false || !forged.skippedWarn) {
    return 'PROBE-CONTROL-SUBSTRATE: the forged D5-skipped substrate does not carry the skip own readings (basePresent === false plus the condense-skipped-size warn) — the control has no substrate'
  }
  const bareNotEquals = (journalLen: number, undoDepth: number): boolean => journalLen !== undoDepth
  // an inequality-only oracle reads EQUAL (false) on the forged SKIPPED substrate...
  if (bareNotEquals(forged.journalLength, forged.undoDepth) !== false) {
    return 'PROBE-CONTROL (the bare-inequality forgery): the inequality-only oracle did not read EQUAL on the forged D5-skipped substrate — the control has no substrate'
  }
  // ...so a row accepting the inequality ALONE for the subject-discrimination limb would REJECT a
  // LEGAL skip. The correct limb is the DISJUNCTION: basePresent discriminates the two legal
  // outcomes, and the inequality is asserted ONLY in the LANDED branch (V4).
  const classify = (v: { journalLength: number; undoDepth: number; basePresent: boolean }): string =>
    v.basePresent ? 'LANDED' : v.journalLength === v.undoDepth ? 'SKIPPED' : 'UNCLASSIFIED'
  if (classify(forged) !== 'SKIPPED') {
    return 'PROBE-CONTROL (the bare-inequality forgery): the DISJUNCTION failed to classify the forged D5-skipped substrate as the LEGAL SKIPPED outcome — §5.1 P-SSJ-IM-4 control (b) / V4: the limb must accept BOTH legal outcomes, and the forgery REACHES a state the skip genuinely produces'
  }
  console.log('SSJ [bare-inequality forgery control]: the D5-skipped substrate (equal reading + basePresent false + the skip warn) is classified SKIPPED by the DISJUNCTION and REDDENS an inequality-only oracle')
  return null
}

/** §6 — THE DURABILITY-VOCABULARY SET, carried as the INSTRUMENT'S OWN WORD LIST (the words the
 *  scan LOOKS FOR, never a claim of this file's). */
const DURABILITY_TOKENS = [
  'durable',
  'durability',
  'crash-safe',
  'crash safe',
  'survives a power loss',
  'survive a power loss',
  'bytes on disk',
  'torn-file-free',
  'fsync completed',
  'fsync-completed',
] as const

/** THE LAYER/STATUS TOKENS — the second vocabulary class the scan LOOKS FOR (§6's FIVE named
 *  non-claims). Carried here as the instrument's own needles, exactly like `DURABILITY_TOKENS`. */
const LAYER_TOKENS = ['app-green', 'envelope-green', 'store-green', 'engine-green', 'live-green'] as const

/** §6 / `P-SSW-H-4` precedent — THE FULL NEGATOR SET. A negator within a BOUNDED WINDOW of the
 *  matched vocabulary makes the line a LIMIT/PROHIBITION, never an assertion.
 *
 *  `nothing` is the term this pass ADDED (the measured false-positive class 2): the register's
 *  own layer header reads "NOTHING here is app-green, …", and an `isLimit` test built from
 *  `no|not|never|…` alone misses the word `NOTHING` — because `\bno\b` cannot match inside
 *  `nothing` (`no` is not a word there). The sibling's windowed-negation rule replaces that
 *  lexical accident with a PRINCIPLED set: any negator (including `nothing`/`none`/`nor`/
 *  `neither`/`cannot`) within the window ⇒ the line is a LIMIT. */
const NEGATORS = /\b(not|never|no|nowhere|none|cannot|can't|isn't|doesn't|does not|without|nor|neither|nothing)\b/i
/** The window is BOUNDED (200 chars either side, never the whole line) precisely so a POSITIVE
 *  claim riding near an unrelated negation elsewhere in the artifact can never be excused. */
const NEGATION_WINDOW = 200

/** A comment continuation: the sibling's windowed-negation rule is stated over the SENTENCE and
 *  "the sentence immediately preceding it within the same paragraph", and these artifacts wrap
 *  their comments, so a sentence routinely straddles two physical lines (MEASURED: the register's
 *  layer header puts `NOTHING here is app-green, …` on line N and the tail `or live-green.` on
 *  line N+1; the durability word-list doc-comment puts `THE DURABILITY-VOCABULARY SET` on the
 *  first line of a sentence whose negating tail `never a claim of this file's` is on the last).
 *  A line-bounded reader cannot see a negation that the AUTHOR wrote in the same sentence, so the
 *  window is computed over the JOINED COMMENT PARAGRAPH. The join is restricted to the `//`/`*`/`/*`
 *  comment forms (a comment continuation, never a crossing into code) and the marker is replaced by
 *  a space so tokens cannot fuse across the join. */
function joinCommentParagraphs(text: string): string {
  return text
    .split('\n')
    .map((line) => (/^\s*(\/\/|\*|\/\*)/.test(line) ? line.replace(/^\s*(\/\/|\*|\/\*+)?/, ' ') : '\n' + line))
    .join('\u0000')
    .split('\u0000')
    .join('')
}

/** Strip THIS INSTRUMENT'S OWN VOCABULARY out of a text before scanning it for an over-claim.
 *  The word lists are the INSTRUMENT — the words the scan LOOKS FOR — so the scan's own source
 *  (and its SIBLING guard, which declares the same needles in the OTHER quote form) carries
 *  every needle as a bare literal. A scan that did not exempt its own vocabulary would redden on
 *  the TOOL that measures and could never be satisfied by any correct landing (the sibling's
 *  `P-SSW-H-4` precedent, and the gate-7 proofread's own lesson: the row must discriminate a
 *  PLANTED claim from a LAWFUL limit sentence).
 *
 *  ⟶ FIX (c) — THE EXCLUSION IS QUOTE-FORM-AGNOSTIC (the measured false-positive class 3). The
 *  as-filed strip was SINGLE-QUOTE-BOUNDED (`'durable'`) while the guard file declares the same
 *  needles BACKTICK-BOUNDED (`` `durable` ``), so each file's strip missed the OTHER's carrier
 *  and BOTH files' needles were read as claims (28 of the 37 measured findings). A quote form is
 *  an incidental spelling of the instrument's own byte, so the strip now covers BACKTICK and
 *  SINGLE-QUOTE (and the SCREAMING-CASE form) alike. The exclusion stays DELIMITER-BOUNDED so
 *  that a PROSE over-claim (`durable`, `crash-safe`, `app-green` written as a claim) is still
 *  SEEN: the exclusion never swallows a sentence. */
function withoutInstrumentVocabulary(text: string): string {
  let out = text
  for (const token of [...DURABILITY_TOKENS, ...LAYER_TOKENS]) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // QUOTE-FORM-AGNOSTIC: a backtick-quoted or single-quoted spelling (the word-list literal,
    // in EITHER file's form) is the instrument's own byte — never a claim.
    out = out.replace(new RegExp('`' + escaped + '`', 'gi'), 'INSTRUMENT-TOKEN')
    out = out.replace(new RegExp("'" + escaped + "'", 'gi'), 'INSTRUMENT-TOKEN')
  }
  return out
}

/** §6 / §5.1 P-SSJ-H-3 — THE ANTI-OVERCLAIM PREDICATE (shared by the row and its controls, so a
 *  control drives the SAME code the row drives; a control over a re-implemented copy would
 *  discriminate nothing).
 *
 *  The subject is a CLAIM shape, not the mere presence of a word. Three LAWFUL classes are
 *  EXEMPT, each by a PRINCIPLED rule (never phrase-patching):
 *    (a) WINDOWED NEGATION — a negator within `NEGATION_WINDOW` of the matched vocabulary ⇒
 *        LIMIT/PROHIBITION (catches "no durability claim", "does NOT prove", and — the class the
 *        as-filed `isLimit` MISSED — "**NOTHING** here is app-green, …").
 *    (b) A MARKDOWN LIMIT-LEDGER ROW — a table row under a header that states what the layer does
 *        NOT prove ⇒ a LIMIT CELL (the spec's §6 ledger). Keyed off the HEADER row and released
 *        at the table's end, so it can never excuse a claim written elsewhere.
 *    (c) THE INSTRUMENT'S OWN TOKEN CARRIERS — stripped quote-form-agnostically above.
 *  A POSITIVE claim still REDDENS (proven by the mutation controls in the row). */
function overclaimProblems(text: string, where: string): string[] {
  const findings: string[] = []
  // The window is computed over the JOINED COMMENT PARAGRAPH so a sentence the author wrapped
  // across two physical comment lines is read as ONE sentence (see `joinCommentParagraphs`).
  const joined = joinCommentParagraphs(withoutInstrumentVocabulary(text))
  // (b) A MARKDOWN LIMIT-LEDGER TABLE: track the table's OWN header and release at its end (the
  //     first non-`|` line). The spec's §6 header is `| … | What that layer does NOT prove |`.
  let inLimitTable = false
  // (d) THE INSTRUMENT'S OWN CONTROL CORPUS — the planted claims and lawful limits the mutation
  //     proof drives are CARRIED as literals, so their carrier lines are exempt by NAME (the
  //     sibling's `FORGED-CLAIM-CORPUS` precedent). A subject carrying the marker would have to be
  //     an instrument file; the spec/park have none and get NO exclusion.
  let inControlCorpus = false
  for (const rawLine of joined.split('\n')) {
    if (rawLine.includes('FORGED_CLAIM_CORPUS')) inControlCorpus = true
    if (inControlCorpus && /^\s*\]\s*$/.test(rawLine)) inControlCorpus = false
    if (inControlCorpus) continue
    const tableRow = /^\s*\|/.test(rawLine)
    if (!tableRow) {
      inLimitTable = false
    } else if (/\bnot\b/i.test(rawLine) && /prove/i.test(rawLine)) {
      inLimitTable = true
    }
    if (inLimitTable && tableRow) continue
    const line = rawLine
    for (const token of [...DURABILITY_TOKENS, ...LAYER_TOKENS]) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp('\\b' + escaped + '\\b', 'i')
      if (!re.test(line)) continue
      // (a) WINDOWED NEGATION — the principled replacement for the as-filed `isLimit` list.
      const lower = line.toLowerCase()
      const at = lower.indexOf(token.toLowerCase())
      const window =
        at === -1
          ? lower
          : lower.slice(Math.max(0, at - NEGATION_WINDOW), Math.min(lower.length, at + token.length + NEGATION_WINDOW))
      if (NEGATORS.test(window)) continue
      findings.push(
        ((LAYER_TOKENS as readonly string[]).includes(token) ? 'HONESTY-GREEN: ' : 'HONESTY: ') +
          where +
          ' asserts ' +
          token +
          ' in an AFFIRMATIVE line — §6 honesty block / §5.1 P-SSJ-H-3: no durability claim and no app/envelope/store/engine/live-green claim is made anywhere in this unit (it moves no byte on any durability axis); the limit sentences are lawful, an affirmative claim is not',
      )
    }
  }
  return findings
}

// ===========================================================================
// THE ROWS (§5.1). Each row is its OWN `it`, so a broken row reddens BY NAME.
// ===========================================================================
describe('STORE-SECURITY-JOURNAL REGISTER — §5.1 the NINE rows over a CONSTRUCTED pane ([T]) and the wiring byte-pins ([H])', () => {
  it('P-SSJ-IM-1 · S-SSJ-SEAM-1 · THE SEAM — journalDepth(): number answers supervisor.journal.length; no production caller', async () => {
    await registerRow('P-SSJ-IM-1', async (run) => {
      // DRIVE 3 + 4 need no pane (a byte-scan and a control) — driven FIRST so a
      // pane-construction failure never hides them.
      await check(run, 3, () => noProductionCallerProblems())
      await check(run, 4, () => forgeSeamControl())

      const pane = await makePane()
      if (isPaneError(pane)) {
        await check(run, 1, () => 'ABSTRACT-SUBJECT: the pane could not be constructed — ' + pane.error + ' (§2.2 own seam has no subject)')
        await check(run, 2, () => 'ABSTRACT-SUBJECT: the identity drive has no subject — ' + pane.error)
        return
      }
      await (pane.panels as { refresh: () => Promise<void> }).refresh()
      await drain()

      // DRIVE 1 — THE SHAPE: a number, finite, integer, >= 0; SYNCHRONOUS (no thenable).
      await check(run, 1, () => {
        const seam = readSeam(pane.panels)
        if (!seam.present) return seamAbsentCe('the shape drive')
        if (seam.threw !== null) return 'SEAM-THREW: journalDepth() threw ' + seam.threw + ' — §2.2 member is SYNCHRONOUS and total over the constructed pane'
        const v = seam.value
        if (typeof v !== 'number') {
          return 'RETURN-SHAPE: journalDepth() answered ' + typeof v + ' — §2.2 return is a NUMBER (this.supervisor.journal.length); a view, a Promise, a tuple or a derived count is a finding'
        }
        if (!Number.isFinite(v)) return 'RETURN-SHAPE: journalDepth() answered ' + String(v) + ' — §2.2 return is a FINITE number'
        if (!Number.isInteger(v)) return 'RETURN-SHAPE: journalDepth() answered ' + String(v) + ' — §2.2 return is an INTEGER (the journal LENGTH)'
        if (v < 0) return 'RETURN-SHAPE: journalDepth() answered ' + String(v) + ' — §2.2 return is >= 0'
        if (typeof (v as unknown as { then?: unknown })?.then === 'function') {
          return 'RETURN-SHAPE: journalDepth() answered a THENABLE — §2.2 declares the member SYNCHRONOUS; a Promise is a finding (the reading is meaningful after the settle, never awaited)'
        }
        return null
      })

      // DRIVE 2 — THE IDENTITY: journalDepth() === supervisor.journal.length at the SAME head,
      // and exactly ONE parameter (none).
      // DISCRIMINATION HARDENING (required by A-3B-1①'s falsifiability clause). A bare equality
      // between two readings is VACUOUS whenever the pair happens to be COINCIDENTALLY EQUAL: at
      // the initial head the pane's `journal.length` and `undoDepth` are BOTH 12, so a seam
      // returning `undoDepth` (the §3 F-4 WRONG-SUBJECT falsifier) satisfies an equality-only
      // oracle — MEASURED: planting `return this.supervisor.undoDepth` left this row GREEN. The
      // drive therefore DIVERGES the pair first (a state-slice drive appends to the journal while
      // a plain apply also pushes the stack, and the D5 SKIP never truncates either), and asserts
      // the inequality alongside the identity, so the oracle separates the journal subject from
      // the stack subject on this very fixture.
      await check(run, 2, () => {
        const seam = readSeam(pane.panels)
        if (!seam.present) return seamAbsentCe('the identity drive')
        const engine = pane.supervisor.journal.length
        if (seam.value !== engine) {
          return (
            'IDENTITY: journalDepth() reads ' +
            String(seam.value) +
            ' while Supervisor.journal.length reads ' +
            String(engine) +
            ' at the SAME head — §2.2: the seam answers this.supervisor.journal.length and NOTHING ELSE (§3.2 I-1)'
          )
        }
        if (seam.arity !== 0) {
          return 'ARITY: journalDepth declares ' + String(seam.arity) + ' parameter(s) — §2.2 parameter-semantics row: the member declares exactly ONE parameter — NONE'
        }
        return null
      })

      // DRIVE 5 — THE SUBJECT-DISCRIMINATION HARDENING (the counterexample the identity drive
      // above must be able to catch). MEASURED, and the reason this drive exists at all: on an
      // append-only drive the journal and `undoDepth` move TOGETHER (a `state-slice` apply pushes
      // both), so an equality-only identity oracle is satisfied by a seam returning `undoDepth`
      // (the §3 F-4 WRONG-SUBJECT falsifier) — planting `return this.supervisor.undoDepth` left
      // the identity drive GREEN at this head. The pair is DIVERGED here through the engine's own
      // PUBLIC `undo()`, which pops the STACK while the JOURNAL keeps the entry it recorded
      // (MEASURED: journal 20 · undoDepth 19 after eight applies + one undo). The oracle then
      // separates the two subjects on this very fixture.
      await check(run, 5, async () => {
        const disc = await makePane({ maxJournalLength: M_FIXTURE })
        if (isPaneError(disc)) return 'ABSTRACT-SUBJECT: the subject-discrimination drive has no subject — ' + disc.error
        await (disc.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        await driveJournal(disc, M_FIXTURE + 4, M_FIXTURE)
        ;(disc.supervisor as unknown as { undo: () => unknown }).undo()
        await drain()
        const seam = readSeam(disc.panels)
        if (!seam.present) return seamAbsentCe('the subject-discrimination drive')
        const journalSubject = disc.supervisor.journal.length
        const stackSubject = (disc.supervisor as unknown as { undoDepth: number }).undoDepth
        console.log(
          'SSJ [P-SSJ-IM-1 drive 5 · SUBJECT DISCRIMINATION]: journal ' +
            String(journalSubject) +
            ' · undoDepth ' +
            String(stackSubject) +
            ' · seam ' +
            String(seam.value),
        )
        if (stackSubject === journalSubject) {
          return (
            'SUBJECT-DISCRIMINATION (THE ORACLE IS VACUOUS): after a ' +
            String(M_FIXTURE + 4) +
            '-mutation drive plus one undo() the journal (' +
            String(journalSubject) +
            ') and undoDepth (' +
            String(stackSubject) +
            ') still read EQUAL, so this drive CANNOT separate the two subjects and a seam returning `undoDepth` (the §3 F-4 falsifier) would pass it — the identity oracle must be exercised on a head where the pair DIVERGES'
          )
        }
        if (seam.value !== journalSubject) {
          return (
            'SUBJECT-DISCRIMINATION: journalDepth() reads ' +
            String(seam.value) +
            ' while Supervisor.journal.length reads ' +
            String(journalSubject) +
            ' (undoDepth reads ' +
            String(stackSubject) +
            ') — §2.2 / §3.2 I-1 / §3 F-4: the seam answers the JOURNAL array and NOTHING ELSE; a reading tracking undoDepth is the WRONG SUBJECT'
          )
        }
        return null
      })
    })
  }, 30_000)

  it('P-SSJ-IM-2 · S-SSJ-CAP-1 · THE CAP — limb 1 (capped) AND limb 2 (the uncapped control), with V1-V5', async () => {
    await registerRow('P-SSJ-IM-2', async (run) => {
      const pane = await makePane({ maxJournalLength: M_FIXTURE })
      if (isPaneError(pane)) {
        for (let i = 1; i <= 6; i++) {
          await check(run, i, () => 'ABSTRACT-SUBJECT: no pane — ' + pane.error + ' (§2.1(c) cap drive has no subject)')
        }
        return
      }
      await (pane.panels as { refresh: () => Promise<void> }).refresh()
      await drain()

      const warned: string[] = []
      const originalWarn = console.warn
      console.warn = (...args: unknown[]) => {
        warned.push(args.map((a) => String(a)).join(' '))
        originalWarn(...args)
      }
      try {
        // DRIVE 1 (V1: the fixture SETS M) — the cap is CONFIGURED and ECHOED.
        await check(run, 1, () => {
          const seam = readSeam(pane.panels)
          if (!seam.present) return seamAbsentCe('the capped settle')
          const view = pane.supervisor.journalEntries()
          if (view.maxJournalLength === undefined) {
            return (
              'V1 (THE ROW IS VACUOUS): the fixture SET M = ' +
              String(M_FIXTURE) +
              ' but the pane Supervisor does not echo it (journalEntries().maxJournalLength is undefined) — §2.1(c)/§5.1 P-SSJ-IM-2 drive 1: the fixture must SET M, or every cap row is VACUOUS (§4 RE-2: the option is configured but NOT PLUMBED, §3 F-2)'
            )
          }
          return null
        })

        const drove = await driveJournal(pane, M_FIXTURE + 12, M_FIXTURE)
        await drain()

        // DRIVE 2 (A-3B-1①②: THE ATTEMPT READING — the `<= M` BOUND-CLAIM IS WITHDRAWN).
        // The cap is CONFIGURED at the pane's Supervisor AND a condense was ATTEMPTED after the
        // drive. The `<= M` bound is NOT reachable on this fixture: the engine's D5 size guard
        // ALWAYS SKIPS here (MEASURED: base 7622B >= pre-base journal 2312B, because the pane's
        // base snapshot covers all 41 registered nodes while a single-node drive carries a tiny
        // payload), so the settle legitimately reads > M. Asserting `<= M` would assert a bound no
        // legal mechanism on this pane can produce (A-3B-1①, superseding §2.1(c)'s `<= M`
        // in part).
        // COUNTEREXAMPLE IT STILL CATCHES: an UNCONFIGURED pane (the cap never reaching the
        // Supervisor — §3 F-2) and a DRIVE THAT NEVER TRIGGERS (never crossing M+1, so no
        // condense is scheduled at all). Under either, NO condense is attempted and this limb
        // reddens: the skip warn is absent AND `basePresent` is false.
        const crossed = drove.crossings > 0
        await check(run, 2, () => {
          const seam = readSeam(pane.panels)
          if (!seam.present) return seamAbsentCe('the attempt reading')
          const view = pane.supervisor.journalEntries()
          const skippedWarn = warned.some((w) => w.includes('condense-skipped-size'))
          const attempted = view.basePresent || skippedWarn
          console.log(
            'SSJ [P-SSJ-IM-2 drive 2 · THE ATTEMPT READING]: journalDepth() ' +
              String(seam.value) +
              ' · M ' +
              String(M_FIXTURE) +
              ' · crossings ' +
              String(drove.crossings) +
              ' · basePresent ' +
              String(view.basePresent) +
              ' · condense-skipped-size warn ' +
              String(skippedWarn),
          )
          if (!crossed) {
            return (
              'LIMB-1 / THE ATTEMPT (THE DRIVE NEVER TRIGGERED): the drive observed ZERO > M crossings, so the trigger (fires at M + 1) never fired and NO condense could have been scheduled — §2.1(c) M-semantics: the drive must cross M + 1 BEFORE the settle, or the attempt reading has no subject (§3 F-3: a drive floor too small makes the row VACUOUS, which is a FAILURE of the row)'
            )
          }
          if (!attempted) {
            return (
              'LIMB-1 / THE ATTEMPT (A-3B-1①): the drive crossed > M ' +
              String(drove.crossings) +
              ' time(s) with M = ' +
              String(M_FIXTURE) +
              ' configured, yet NEITHER attempt reading is present — basePresent reads ' +
              String(view.basePresent) +
              ' AND no condense-skipped-size warn was emitted. §2.1(c)/A-3B-1①: the cap must be CONFIGURED at the pane’s Supervisor AND a condense ATTEMPTED after the drive. An UNCONFIGURED pane (the option declared but not fed to the Supervisor, §3 F-2) produces EXACTLY this reading, which is the counterexample this limb still catches'
            )
          }
          if (view.basePresent === false && !skippedWarn) {
            return (
              'LIMB-1 / THE ATTEMPT: basePresent is false and no skip warn was emitted — the two alternate forms of the attempt reading are BOTH absent, so no condense was attempted (§2.1(c); A-3B-1②: the SKIPPED arm carries the discrimination on this fixture through basePresent === false PLUS the skip warn)'
            )
          }
          return null
        })

        // the JITTER term: the attempt reading RE-CONFIRMED at a SECOND consecutive settle
        // (A-3B-1①: limb 1's second reading is the attempt, never the withdrawn `<= M`).
        await drain()
        await check(run, 3, () => {
          const seam = readSeam(pane.panels)
          if (!seam.present) return seamAbsentCe('the attempt jitter reading')
          const view = pane.supervisor.journalEntries()
          const skippedWarn = warned.some((w) => w.includes('condense-skipped-size'))
          if (!(view.basePresent || skippedWarn)) {
            return (
              'LIMB-1 (the jitter term): at the SECOND consecutive settle NEITHER attempt reading is present (basePresent ' +
              String(view.basePresent) +
              ', skip warn ' +
              String(skippedWarn) +
              ') — §5.1 P-SSJ-IM-2: each drive’s second reading re-confirms the ATTEMPT at a second settle, and unlike the withdrawn `<= M` bound the attempt reading is STABLE across settles (A-3B-1①)'
            )
          }
          console.log(
            'SSJ [P-SSJ-IM-2 drive 3 · THE ATTEMPT JITTER]: second settle — journalDepth() ' +
              String(seam.value) +
              ' · basePresent ' +
              String(view.basePresent) +
              ' · skip warn ' +
              String(skippedWarn),
          )
          return null
        })

        // DRIVE 3 (V3: THE ATTEMPT SUB-CLAUSE, read INDEPENDENTLY of drive 2) — the attempt read
        // through the PUBLIC journalEntries()'s basePresent, with the ABSENCE of the
        // condense-skipped-size warn as the alternate form (the D5 skip is a LEGAL outcome —
        // §2.1(c)); on THIS fixture the SKIPPED arm is the EXPECTED arm (A-3B-1②).
        await check(run, 4, () => {
          const view = pane.supervisor.journalEntries()
          const skippedWarn = warned.some((w) => w.includes('condense-skipped-size'))
          if (view.basePresent) {
            console.log('SSJ [P-SSJ-IM-2 drive 3]: basePresent === true — a condense LANDED; the ATTEMPT reading HOLDS through the public journalEntries()')
            return null
          }
          if (!skippedWarn) {
            return (
              'LIMB-1 / V3 (THE ATTEMPT): basePresent reads false AND no condense-skipped-size warn was emitted — §2.1(c)/A-3B-1①: a condense must have been ATTEMPTED, read through the public journalEntries() basePresent (a landed base) OR the D5 skip warn (the honest, observable skip). NEITHER reading is present, so NO condense was attempted at all (§4 RE-2: the option is not plumbed). §2.1(c) names this limb as the one that separates a WORKING cap from an INERT one'
            )
          }
          return null
        })
      } finally {
        console.warn = originalWarn
      }

      // DRIVE 2 (V2: THE ANTI-VACUITY CONTROL) — the IDENTICAL drive with M = undefined
      // => journal.length > M.
      await check(run, 5, async () => {
        const control = await makePane({ maxJournalLength: undefined })
        if (isPaneError(control)) return 'ABSTRACT-SUBJECT: the uncapped control has no subject — ' + control.error
        await (control.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        const before = control.supervisor.journal.length
        const droveControl = await driveJournal(control, M_FIXTURE + 12, M_FIXTURE)
        await drain()
        const after = control.supervisor.journal.length
        if (!(after > M_FIXTURE)) {
          return (
            'LIMB-2 / V2 (THE ROW IS VACUOUS, WHICH IS A FAILURE OF THE ROW): the UNCAPPED control drove the SAME ' +
            String(M_FIXTURE + 12) +
            ' mutation(s) and its journal reads ' +
            String(after) +
            ' (from ' +
            String(before) +
            ', ' +
            String(droveControl.crossings) +
            ' crossing(s)) — §5.1 P-SSJ-IM-2 drive 2 / §3 F-3: the control MUST show journal.length > M (M = ' +
            String(M_FIXTURE) +
            '), or the capped limb proves nothing (the landed default is INERT, §2.1(c))'
          )
        }
        return null
      })

      // DRIVE 4 (V5: THE MULTI-WINDOW DRIVE) — >= 2 > M crossings BEFORE the settling drain
      // => a condense is ATTEMPTED AGAIN in a later window (A-3B-1①②: the `<= M` reading is
      // WITHDRAWN; the ATTEMPT is what the multi-window drive must re-confirm).
      // COUNTEREXAMPLE IT STILL CATCHES: a cap PLUMBED ONCE AND THEN INERT — a landing whose
      // trigger stops scheduling after the first window, so no second attempt is observable.
      await check(run, 6, async () => {
        const multi = await makePane({ maxJournalLength: M_FIXTURE })
        if (isPaneError(multi)) return 'ABSTRACT-SUBJECT: the multi-window drive has no subject — ' + multi.error
        await (multi.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        const multiWarned: string[] = []
        const originalWarn2 = console.warn
        console.warn = (...args: unknown[]) => {
          multiWarned.push(args.map((a) => String(a)).join(' '))
          originalWarn2(...args)
        }
        let droveMulti: { crossings: number; grew: number }
        try {
          droveMulti = await driveJournal(multi, M_FIXTURE * 8, M_FIXTURE)
          await drain()
        } finally {
          console.warn = originalWarn2
        }
        const seam = readSeam(multi.panels)
        if (!seam.present) return seamAbsentCe('the multi-window drive')
        if (droveMulti.crossings < 2) {
          return (
            'V5 (THE ROW IS VACUOUS): the multi-window drive observed ' +
            String(droveMulti.crossings) +
            ' > M crossing(s) BEFORE the settling drain — §5.1 P-SSJ-IM-2 drive 4 / V5 require AT LEAST TWO, so the drive SPANS MORE THAN ONE DEFERRED-CONDENSE WINDOW; a one-window drive cannot show the cap is RE-APPLIED (§3 F-3)'
          )
        }
        const view = multi.supervisor.journalEntries()
        const skippedWarn = multiWarned.some((w) => w.includes('condense-skipped-size'))
        console.log(
          'SSJ [P-SSJ-IM-2 drive 6 · THE MULTI-WINDOW ATTEMPT]: crossings ' +
            String(droveMulti.crossings) +
            ' · journalDepth() ' +
            String(seam.value) +
            ' · basePresent ' +
            String(view.basePresent) +
            ' · skip warn ' +
            String(skippedWarn) +
            ' · M ' +
            String(M_FIXTURE),
        )
        if (!(view.basePresent || skippedWarn)) {
          return (
            'LIMB-1 (V5, THE ATTEMPT): the multi-window drive crossed > M ' +
            String(droveMulti.crossings) +
            ' time(s) yet NEITHER attempt reading is present (basePresent ' +
            String(view.basePresent) +
            ', skip warn ' +
            String(skippedWarn) +
            ') — A-3B-1①②: across MORE THAN ONE deferred-condense window the cap must be ATTEMPTED in a later window too; a single attempt followed by a silent trigger is the counterexample this limb still catches')
        }
        return null
      })
    })
  }, 40_000)

  it('P-SSJ-IM-3 · S-SSJ-OPT-1 · THE OPTION — additive-optional; three states; the POSITIONAL forgery reddens', async () => {
    await registerRow('P-SSJ-IM-3', async (run) => {
      let absentDepth = -1

      // STATE 1 — ABSENT (the landed INERT growth).
      await check(run, 1, async () => {
        const pane = await makePane()
        if (isPaneError(pane)) return 'ABSTRACT-SUBJECT: the ABSENT-option state has no subject — ' + pane.error
        await (pane.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        const drove = await driveJournal(pane, M_FIXTURE + 12, M_FIXTURE)
        await drain()
        const seam = readSeam(pane.panels)
        if (!seam.present) return seamAbsentCe('the ABSENT-option state')
        absentDepth = seam.value as number
        if (!(absentDepth > M_FIXTURE)) {
          return (
            'OPTION-ABSENT / V2: with the option ABSENT the journal reads ' +
            String(absentDepth) +
            ' after ' +
            String(M_FIXTURE + 12) +
            ' mutation(s) — §2.1(c)/§3.2 I-2: M = undefined => THE CAP IS INERT and the journal MUST grow past M (an invented default M is §3.2 I-2 falsifier)'
          )
        }
        if (drove.crossings === 0) return 'OPTION-ABSENT / V2: the ABSENT-option drive observed ZERO > M crossings — the control is vacuous (§3 F-3)'
        return null
      })

      // STATE 2 — PRESENT WITH A VALUE: the construction-site pin + THE ATTEMPT READING
      // (A-3B-1② — the `<= M` capped reading is WITHDRAWN; the observable outcome on this
      // fixture is the SKIP, i.e. `basePresent === false` + the skip warn, with the equal
      // journalDepth()/undoDepth() reading carrying the discrimination).
      // COUNTEREXAMPLE IT STILL CATCHES: a pane whose option is declared but NOT fed to the
      // Supervisor (§3 F-2) — the construction-site pin reddens AND no attempt is observable.
      await check(run, 2, async () => {
        const pane = await makePane({ maxJournalLength: M_FIXTURE })
        if (isPaneError(pane)) return 'ABSTRACT-SUBJECT: the PRESENT-option state has no subject — ' + pane.error
        await (pane.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        const findings: string[] = [...constructionSiteProblems()]
        const presentWarned: string[] = []
        const originalWarn3 = console.warn
        console.warn = (...args: unknown[]) => {
          presentWarned.push(args.map((a) => String(a)).join(' '))
          originalWarn3(...args)
        }
        let drove: { crossings: number; grew: number }
        try {
          drove = await driveJournal(pane, M_FIXTURE + 12, M_FIXTURE)
          await drain()
        } finally {
          console.warn = originalWarn3
        }
        const seam = readSeam(pane.panels)
        if (!seam.present) {
          findings.push(seamAbsentCe('the PRESENT-option state'))
        } else {
          const view = pane.supervisor.journalEntries()
          const skippedWarn = presentWarned.some((w) => w.includes('condense-skipped-size'))
          console.log(
            'SSJ [P-SSJ-IM-3 state 2 · THE ATTEMPT OUTCOME]: journalDepth() ' +
              String(seam.value) +
              ' · undoDepth ' +
              String(pane.supervisor.undoDepth) +
              ' · basePresent ' +
              String(view.basePresent) +
              ' · skip warn ' +
              String(skippedWarn) +
              ' · crossings ' +
              String(drove.crossings),
          )
          if (drove.crossings === 0) {
            findings.push(
              'OPTION-PRESENT (THE ROW IS VACUOUS): the PRESENT-option drive observed ZERO > M crossings, so the trigger never fired — §2.1(c): the drive must cross M + 1, or the attempt reading has no subject (§3 F-3)',
            )
          } else if (!(view.basePresent || skippedWarn)) {
            findings.push(
              'OPTION-PRESENT: with { maxJournalLength: ' +
                String(M_FIXTURE) +
                ' } passed and the drive crossing > M ' +
                String(drove.crossings) +
                ' time(s), NEITHER attempt reading is present (basePresent ' +
                String(view.basePresent) +
                ', skip warn ' +
                String(skippedWarn) +
                ') — §1.1 member 1② / A-3B-1②: the option must be FED to the pane Supervisor so the condense is ATTEMPTED; a declared-but-unplumbed option (§3 F-2) produces exactly this reading',
            )
          }
        }
        return findings
      })

      // STATE 3 — PRESENT-as-undefined (identical to ABSENT).
      await check(run, 3, async () => {
        const pane = await makePane({ maxJournalLength: undefined })
        if (isPaneError(pane)) return 'ABSTRACT-SUBJECT: the PRESENT-as-undefined state has no subject — ' + pane.error
        await (pane.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        await driveJournal(pane, M_FIXTURE + 12, M_FIXTURE)
        await drain()
        const seam = readSeam(pane.panels)
        if (!seam.present) return seamAbsentCe('the PRESENT-as-undefined state')
        if (absentDepth >= 0 && seam.value !== absentDepth) {
          return (
            'OPTION-UNDEFINED-PARITY: { maxJournalLength: undefined } reads ' +
            String(seam.value) +
            ' while the ABSENT state read ' +
            String(absentDepth) +
            ' for the IDENTICAL drive — §5.1 P-SSJ-IM-3: "PRESENT-as-undefined (identical to ABSENT)"; a divergence is §3.2 I-2 invented-default falsifier'
          )
        }
        return null
      })

      // CONTROL 1 — THE POSITIONAL FORGERY.
      await check(run, 4, () => positionalForgeryProblems())
      // CONTROL 2 — the landed ONE-ARGUMENT call-site compatibility reading.
      await check(run, 5, () => oneArgumentCompatibilityProblems())
    })
  }, 40_000)

  it('P-SSJ-IM-4 · S-SSJ-SUBJ-1 · THE SUBJECT-DISCRIMINATION DISJUNCTION (limb 3) + the PRODUCTION-NEGATIVE', async () => {
    await registerRow('P-SSJ-IM-4', async (run) => {
      // CONTROL (a) — THE PRODUCTION-NEGATIVE (driven first: it needs no pane).
      await check(run, 3, () => noProductionCallerProblems())
      // CONTROL (b) — THE BARE-INEQUALITY FORGERY (driven second: it needs no pane).
      await check(run, 4, () => bareInequalityForgeryProblems())

      const pane = await makePane({ maxJournalLength: M_FIXTURE })
      if (isPaneError(pane)) {
        await check(run, 1, () => 'ABSTRACT-SUBJECT: the LANDED-outcome drive has no subject — ' + pane.error)
        await check(run, 2, () => 'ABSTRACT-SUBJECT: the SKIPPED-outcome drive has no subject — ' + pane.error)
        return
      }
      await (pane.panels as { refresh: () => Promise<void> }).refresh()
      await drain()

      const warned: string[] = []
      const originalWarn = console.warn
      console.warn = (...args: unknown[]) => {
        warned.push(args.map((a) => String(a)).join(' '))
        originalWarn(...args)
      }
      try {
        // OUTCOME B (RE-AIMED AS THE EXPECTED ARM — A-3B-1②). The observable outcome of a
        // condense ATTEMPT on this fixture is the SKIP: the equal journalDepth()/undoDepth()
        // reading together with `basePresent === false` and the `condense-skipped-size` warn.
        // The former OUTCOME A (`basePresent === true` after a 40-mutation drive, with
        // `journalDepth() !== undoDepth()`) is UNREACHABLE here: the D5 guard compares the pane's
        // base snapshot against the pre-base journal and ALWAYS skips (MEASURED: base 7622B >=
        // pre-base journal 2312B), because the base covers all 41 registered nodes while a
        // single-node drive carries a tiny payload. Reaching a LANDED condense would require
        // changing the PANE'S BASE SIZE — not this unit's surface. The inequality branch is
        // therefore carried by the FORGED-BY-CONSTRUCTION control (b), which reaches the landed
        // state a correct landing genuinely produces WITHOUT claiming this fixture produced it.
        // COUNTEREXAMPLE IT STILL CATCHES: a seam reading a WRONG SUBJECT (§3 F-4) — the
        // disjunction would classify the reading UNCLASSIFIED (neither a landed base nor an
        // equal pair), and the equal arm below reddens on any divergence.
        await check(run, 1, async () => {
          await driveJournal(pane, Math.max(M_FIXTURE * 8, 40), M_FIXTURE)
          await drain()
          const seam = readSeam(pane.panels)
          if (!seam.present) return seamAbsentCe('the SKIPPED-outcome drive')
          const view = pane.supervisor.journalEntries()
          const depth = seam.value as number
          const undoDepth = pane.supervisor.undoDepth
          const skippedWarn = warned.some((w) => w.includes('condense-skipped-size'))
          const outcome = view.basePresent ? 'LANDED' : depth === undoDepth ? 'SKIPPED' : 'UNCLASSIFIED'
          console.log(
            'SSJ [P-SSJ-IM-4 drive 1 · THE OUTCOME]: ' +
              outcome +
              ' — journalDepth() ' +
              String(depth) +
              ' · undoDepth ' +
              String(undoDepth) +
              ' · basePresent ' +
              String(view.basePresent) +
              ' · skip warn ' +
              String(skippedWarn),
          )
          if (outcome === 'UNCLASSIFIED') {
            return (
              'LIMB-3 / V4 (THE ROW IS VACUOUS — THE CONTRAST IS NOT MADE): after a ' +
              String(Math.max(M_FIXTURE * 8, 40)) +
              '-mutation drive the readings are NEITHER a landed base NOR an equal pair (journalDepth ' +
              String(depth) +
              ' vs undoDepth ' +
              String(undoDepth) +
              ', basePresent ' +
              String(view.basePresent) +
              ') — A-3B-1②: the observable outcome on this fixture is the SKIP (equal reading + basePresent === false); an UNCLASSIFIED reading means the disjunction proves nothing (§3 F-4: a seam reading a wrong subject)'
            )
          }
          if (outcome === 'SKIPPED' && !skippedWarn) {
            return (
              'LIMB-3 / THE SKIP WARN: the readings classify SKIPPED (equal pair, basePresent === false) but NO condense-skipped-size warn was emitted — §2.1(c) names the skip warn as the observable form of the D5 exit; an equal pair WITHOUT the warn is indistinguishable from “no condense was ever attempted”, which is the §3 F-2 unplumbed class the row must not accept'
            )
          }
          return null
        })

        // OUTCOME B — the SECOND, INDEPENDENT skip substrate (a different M, a different drive
        // length): CONDENSE SKIPPED (D5) => journalDepth() === undoDepth() AND
        // basePresent === false.
        await check(run, 2, async () => {
          const small = await makePane({ maxJournalLength: 1 })
          if (isPaneError(small)) return 'ABSTRACT-SUBJECT: the SKIPPED-outcome drive has no subject — ' + small.error
          await (small.panels as { refresh: () => Promise<void> }).refresh()
          await drain()
          await driveJournal(small, 2, 1)
          await drain()
          const view = small.supervisor.journalEntries()
          const seam = readSeam(small.panels)
          if (!seam.present) return seamAbsentCe('the SKIPPED-outcome drive')
          if (view.basePresent) {
            return (
              'OUTCOME-B / V4: the SKIPPED-outcome drive LANDED a base (basePresent === true, maxJournalLength = 1) — §5.1 P-SSJ-IM-4 drive 2 expects the D5 skip on a SMALL pane base; if this drive cannot produce the skip the outcome set is not closed and the disjunction is not exercised (§2.1(c)). This is the SAME state §5.1 P-SSJ-IM-4 control (b) FORGES (FORGED-BY-CONSTRUCTION, each forgery stating what makes it an in-vivo state)'
            )
          }
          const depth = seam.value as number
          if (depth !== small.supervisor.undoDepth) {
            return (
              'OUTCOME-B: with the condense SKIPPED (basePresent === false) the readings DIVERGE — journalDepth() ' +
              String(depth) +
              ' vs undoDepth ' +
              String(small.supervisor.undoDepth) +
              ' — §5.1 P-SSJ-IM-4: the SKIPPED outcome is the EQUALITY branch; §3 F-4'
            )
          }
          return null
        })
      } finally {
        console.warn = originalWarn
      }

      // OUTCOME A (RE-AIMED, A-3B-1② — NOW MEASURED AS REACHABLE). The ruling re-aimed this
      // limb because `basePresent === true` after a FORTY-mutation drive is unreachable: the D5
      // guard compares the pane's base snapshot against the pre-base journal and SKIPS at that
      // size (MEASURED: at 40 mutations `journal 52 · undoDepth 52 · basePresent false`, with the
      // warn `base 7622B >= pre-base journal 2312B`). MEASURED FURTHER — and this is the figure
      // the re-aim is anchored to — the LANDED outcome IS reachable on this fixture at a LARGER
      // drive: at 60 mutations `journal 1 · undoDepth 0 · basePresent true` (the base snapshot
      // finally becomes cheaper than the pre-base journal, so the guard stops skipping and the
      // condense REWRITES the journal down to the marker). The landed pair therefore DIVERGES
      // (1 !== 0), which is the discrimination §5.1's OUTCOME A named.
      // COUNTEREXAMPLE IT STILL CATCHES: a seam reading the STACK subject (§3 F-4) — after a
      // landed condense `undoDepth` is 0 while the journal keeps the marker, so a `undoDepth`
      // seam reads 0 against the journal's 1 and reddens.
      // FORGED-BY-CONSTRUCTION NOTE: this is a REAL drive (not a forgery) — it is reported as a
      // [T] reading over a CONSTRUCTED pane, and never as app/live evidence.
      await check(run, 5, async () => {
        const landed = await makePane({ maxJournalLength: M_FIXTURE })
        if (isPaneError(landed)) return 'ABSTRACT-SUBJECT: the LANDED-outcome drive has no subject — ' + landed.error
        await (landed.panels as { refresh: () => Promise<void> }).refresh()
        await drain()
        const landedWarned: string[] = []
        const originalWarn4 = console.warn
        console.warn = (...args: unknown[]) => {
          landedWarned.push(args.map((a) => String(a)).join(' '))
          originalWarn4(...args)
        }
        try {
          // 60 mutations: MEASURED to reach the LANDED outcome on this fixture (40 does not).
          await driveJournal(landed, LANDED_DRIVE, M_FIXTURE)
          await drain()
        } finally {
          console.warn = originalWarn4
        }
        const view = landed.supervisor.journalEntries()
        const seam = readSeam(landed.panels)
        if (!seam.present) return seamAbsentCe('the LANDED-outcome drive')
        const depth = seam.value as number
        const undoDepth = landed.supervisor.undoDepth
        console.log(
          'SSJ [P-SSJ-IM-4 drive 5 · THE LANDED OUTCOME]: journalDepth() ' +
            String(depth) +
            ' · undoDepth ' +
            String(undoDepth) +
            ' · basePresent ' +
            String(view.basePresent) +
            ' · skip warn ' +
            String(landedWarned.some((w) => w.includes('condense-skipped-size'))),
        )
        if (!view.basePresent) {
          return (
            'LIMB-3 / OUTCOME A (UNREACHED ON A REACHABLE DRIVE): after a ' +
            String(LANDED_DRIVE) +
            '-mutation drive the condense did NOT land (basePresent === false) — MEASURED, the LANDED outcome is reachable on this fixture at ~60 mutations (base snapshot cheaper than the pre-base journal), so a drive this large that skips means the drive size is below the landing threshold rather than the state being structurally unreachable'
          )
        }
        if (!(depth !== undoDepth)) {
          return (
            'LIMB-3 / §3 F-4: a condense LANDED (basePresent === true) yet journalDepth() reads ' +
            String(depth) +
            ' EQUAL to undoDepth ' +
            String(undoDepth) +
            ' — §3.2 I-1 / §0 R-3: the seam subject is the JOURNAL (the base marker plus everything appended after it survives the condense) while undoDepth is the stack condense() TRUNCATES; an equal reading WITH a landed base is a SUBJECT FAILURE, not a legal non-observation'
          )
        }
        return null
      })
    })
  }, 60_000)

  it('P-SSJ-SM-1 · S-SSJ-GRD-1 · THE VOLUME-GUARD MACHINE (CLOSED) over the CONSTRUCTED pane', async () => {
    await registerRow('P-SSJ-SM-1', async (run) => {
      const pane = await makePane()
      if (isPaneError(pane)) {
        for (let i = 1; i <= 3; i++) {
          await check(run, i, () => 'ABSTRACT-SUBJECT: the machine has no subject — ' + pane.error)
        }
        return
      }
      // THE WARM-UP IS CAPTURED, NEVER CONSUMED BY THE FIXTURE (A-3B-1③). The recorder is
      // installed on the FRESH pane BEFORE its first refresh(), because the machine's IDLE ->
      // DRAWN -> APPLIED transition happens ONCE — on the warm-up cycle — and every later
      // unchanged cycle is SUPPRESSED (measured 0). A fixture that refreshes first and then
      // measures reads 0 on BOTH states and can never observe the DRAWN state at all.
      const warmUp = await refreshDraws(pane)
      await drain()

      // STATE 1 — IDLE -> DRAWN: the WARM-UP cycle's reading (A-3B-1③).
      // The `>= 1` draw is asserted HERE, on the WARM-UP, as the ruling requires: it is the
      // cycle on which the mutation builder finds a changed value for the first time. The
      // STEADY-STATE `>= 1` demand is the WITHDRAWN form — the guard's whole purpose is that a
      // repeated unchanged cycle draws ZERO (state 3), and a row demanding `>= 1` there would
      // contradict state 3 (A-3B-1③: "A row that demands >= 1 on a steady-state unchanged cycle
      // is WRONG and is re-aimed by its author").
      await check(run, 1, async () => {
        if (warmUp <= 0) {
          return (
            'IDLE/WARM-UP: the WARM-UP cycle drew ' +
            String(warmUp) +
            ' state-slice op(s) — §2.6 site issues at least one op when the config carries values; the machine IDLE -> DRAWN transition must be observed with a REAL draw, and the WARM-UP is the ONLY cycle that carries one (A-3B-1③: measured warm-up 12, every later unchanged cycle 0). A warm-up that draws nothing means the machine was never observed in its DRAWN state at all'
          )
        }
        if (!(warmUp <= MEASURED_BASELINE_PER_CALL)) {
          return (
            'IDLE/WARM-UP: the WARM-UP cycle drew ' +
            String(warmUp) +
            ' state-slice op(s), ABOVE the MEASURED baseline of ' +
            String(MEASURED_BASELINE_PER_CALL) +
            '/call (§2.1(b)) — the warm-up draw count is bounded by the baseline the spec names; a greater count means a draw site beyond syncConfig()’s own enumerated set'
          )
        }
        return null
      })

      // STATE 2 — DRAWN -> APPLIED -> SETTLED: the state the WARM-UP established, read through
      // the debugText()-class carrier the machine settles into. The draw count asserted here is
      // the SETTLED state's own reading (A-3B-1③: the steady-state reading is 0), never a
      // re-demand of `>= 1`.
      await check(run, 2, async () => {
        const settled = typeof (pane.panels as { debugText?: () => string }).debugText === 'function'
          ? (pane.panels as { debugText: () => string }).debugText()
          : null
        if (settled === null) {
          return 'DRAWN/APPLIED: the pane carries no readable debugText() — the debugText()-class seam is the landed visibility carrier the machine reads its settled state through'
        }
        const replay = await refreshDraws(pane)
        if (!(replay < MEASURED_BASELINE_PER_CALL)) {
          return (
            'DRAWN/APPLIED -> SETTLED: a repeated UNCHANGED cycle after the warm-up drew ' +
            String(replay) +
            ' state-slice op(s) — §2.6 property 3: the settled state is reached when the unchanged-config path stops drawing; a count at or above the MEASURED baseline of ' +
            String(MEASURED_BASELINE_PER_CALL) +
            '/call means the machine never left the DRAWN state'
          )
        }
        return null
      })

      // STATE 3 — SUPPRESSED: the IDLE -> (unchanged config) -> SUPPRESSED -> SETTLED path,
      // with NO apply issued on the suppressed path. ZERO here is a PASS (A-3B-1③: measured
      // steady-state 0), and it is satisfiable by the SAME guard as state 1's warm-up draw.
      await check(run, 3, async () => {
        await refreshDraws(pane)
        const steady = await refreshDraws(pane)
        if (!(steady < MEASURED_BASELINE_PER_CALL)) {
          return (
            'SUPPRESSED (THE STATE IS UNREACHABLE): a repeated refresh() with an UNCHANGED config drew ' +
            String(steady) +
            ' state-slice op(s) — §2.6 property 3 / §5.1 P-SSJ-SM-1: the SUPPRESSED state requires the unchanged-config path to issue NO apply, so the count must fall BELOW the MEASURED baseline of ' +
            String(MEASURED_BASELINE_PER_CALL) +
            '/call (§4 RE-4: at this head the count reads ' +
            String(steady) +
            ', every draw issued unconditionally)'
          )
        }
        if (steady !== 0) {
          return (
            'SUPPRESSED: a repeated UNCHANGED cycle drew ' +
            String(steady) +
            ' state-slice op(s), not ZERO — A-3B-1③: the steady-state reading is 0 (measured), and a cycle that still draws is a PARTIAL suppression (the guard skipped some but not all of the mutation-building site’s draws)'
          )
        }
        return null
      })
    })
  }, 40_000)

  it('P-SSJ-TP-1 · S-SSJ-GRD-2 · THE VOLUME GUARD TOTALITY + THE STEADY-STATE BOUND (8 config classes)', async () => {
    await registerRow('P-SSJ-TP-1', async (run) => {
      const classes = [
        'the initial sync',
        'an unchanged repeat (the suppressible class)',
        'enabled gains a group',
        'enabled loses a group',
        'token set',
        'token cleared',
        'maxJournalLength set',
        'maxJournalLength cleared',
      ]
      const pane = await makePane()
      if (isPaneError(pane)) {
        for (let i = 0; i < classes.length; i++) {
          await check(run, i + 1, () => 'ABSTRACT-SUBJECT: the class ' + String(classes[i]) + ' has no subject — ' + pane.error)
        }
        return
      }
      await (pane.panels as { refresh: () => Promise<void> }).refresh()
      await drain()

      for (let i = 0; i < classes.length; i++) {
        const label = classes[i]!
        await check(run, i + 1, async () => {
          const pan = pane.panels as { refresh: () => Promise<void>; debugText?: () => string }
          const beforeText = typeof pan.debugText === 'function' ? pan.debugText() : ''
          const draws = await refreshDraws(pane)
          await drain()
          const afterText = typeof pan.debugText === 'function' ? pan.debugText() : ''
          if (!Number.isInteger(draws)) {
            return 'CLASS ' + label + ': the drawn-op count reads ' + String(draws) + ' — the recorder is the only reader and must answer an integer'
          }
          // THE RENDER-PARITY property (§3.2 I-6 / §3 F-6): a guard never SUPPRESSES a changed
          // value and never ALTERS a node's text. The SUPPRESSIBLE class is the one where the
          // rendered outcome must be identical across the repeat.
          if (i === 1 && beforeText !== afterText) {
            return (
              'RENDER-PARITY (§3.2 I-6 / §3 F-6): the Debug pane text changed across an UNCHANGED-config refresh() ([' +
              beforeText +
              '] to [' +
              afterText +
              ']) — the guard must not suppress a CHANGED value nor alter a node text'
            )
          }
          // THE STEADY-STATE BOUND — the falsifier's CONTROL (§2.1(b)): an unchanged config must
          // draw STRICTLY FEWER than the MEASURED baseline of 16.
          if (i === 1 && !(draws < MEASURED_BASELINE_PER_CALL)) {
            return (
              'STEADY-STATE BOUND: the UNCHANGED-config class drew ' +
              String(draws) +
              ' op(s) — §2.6 property 3 / §5.1 P-SSJ-TP-1: a repeated refresh() with an unchanged config must draw < ' +
              String(MEASURED_BASELINE_PER_CALL) +
              ' (the MEASURED baseline), and the ' +
              String(MEASURED_BASELINE_PER_MUTATING_REPLY) +
              '-entries-per-mutating-reply steady state must fall toward 0. At this head every draw is issued unconditionally (' +
              String(draws) +
              '), so the second bound does not exist (§4 RE-4)'
            )
          }
          return null
        })
      }
    })
  }, 40_000)

  it('P-SSJ-H-1 · S-SSJ-PROBE-1 · THE OCCURRENCE PROBE — TWO sites by SYMBOL; the notify-callback placement; a THIRD fails', async () => {
    await registerRow('P-SSJ-H-1', async (run) => {
      const text = readMaybe(RENDERER_PATH)
      if (text === null) {
        for (let i = 1; i <= 4; i++) {
          await check(run, i, () => 'ABSTRACT-SUBJECT: src/renderer/renderer.ts could not be read — the probe has no substrate')
        }
        return
      }
      const r = refreshDebugSiteReading(text)

      // READING 1 — the SYMBOL count = 2.
      await check(run, 1, () => {
        if (r.symbol !== 2) {
          return (
            'PROBE: the symbol count over the COMMENT-FREE body reads ' +
            String(r.symbol) +
            ' — §2.5 pins EXACTLY TWO refreshDebug CALL SITES (the boot site inside the `if (panels)` guard + the notify-callback site); a THIRD is §3 F-9. The subject is the SYMBOL, because the two sites spell DIFFERENTLY (the boot site `panels.refreshDebug(runtime)`, the reply site `panels?.refreshDebug(runtime)`) and a single-literal count reads ' +
            String(r.literal) +
            ' and would be VACUOUS'
          )
        }
        return null
      })

      // READING 2 — the COMMENT-FREE count (the exclusion's OWN reading): a prose occurrence
      // must NOT move the count.
      await check(run, 2, () => {
        const forged = text + '\n// a prose mention of refreshDebug must not move the count\n'
        const forgedR = refreshDebugSiteReading(forged)
        if (forgedR.symbol !== r.symbol) {
          return (
            'PROBE-COMMENT-EXCLUSION: a COMMENT occurrence moved the count (' +
            String(r.symbol) +
            ' to ' +
            String(forgedR.symbol) +
            ') — §2.5: the count is a count of CALL SITES, so the probe reads the comment-free body (the landed withoutComments precedent); the exclusion stands as a PROPERTY of the probe, not as a repair'
          )
        }
        return null
      })

      // READING 3 — the NOTIFY-CALLBACK PLACEMENT: the call sits inside the (p) => ... callback
      // and NOT in the reply .then.
      await check(run, 3, () => {
        if (!r.inNotify) {
          return (
            'PROBE-PLACEMENT: the per-reply refreshDebug does NOT sit inside the notify callback — §2.4 / §1.1 member 2② move it into the `(p) => ...` callback together with `bridge!.notify(p)` and reduce the reply `.then` to `bridge.sendReply(reply)`. At this head the call still sits in the `.then` (in-then reading: ' +
            String(r.inThen) +
            ') — §4 RE-5, the PRE-RE-HOME arrangement'
          )
        }
        return null
      })

      // CONTROL — a synthetic THIRD site (or the pre-re-home arrangement) reddens the SAME
      // oracle; the SPAN form is REJECTED BY NAME and shown to be non-discriminating.
      await check(run, 4, () => {
        const forgedThird = text + '\nfunction zz() { panels?.refreshDebug(runtime) }\n'
        const third = refreshDebugSiteReading(forgedThird)
        if (third.symbol === r.symbol) {
          return (
            'PROBE-CONTROL: a FORGED third refreshDebug site did NOT move the symbol count (still ' +
            String(third.symbol) +
            ') — §5.1 P-SSJ-H-1 control: a probe that cannot redden on a third site is VACUOUS (§3 F-9 falsifier must be reachable)'
          )
        }
        const forgedPre = text.replace(/panels\?\.refreshDebug\(runtime\)/g, 'void 0')
        if (forgedPre === text) {
          return 'PROBE-CONTROL-SUBSTRATE: the forged PRE-RE-HOME corpus could not be built — the reply-site spelling is not present, so the placement control has NO SUBSTRATE (a control with no substrate is NEVER a pass)'
        }
        if (r.inNotify && refreshDebugSiteReading(forgedPre).inNotify) {
          return 'PROBE-CONTROL-REHOME: the forged PRE-RE-HOME corpus still read as PLACED — the placement reader is not discriminating (§2.5 positive control)'
        }
        console.log(
          'SSJ ROW P-SSJ-H-1 control [THE SPAN FORM, rejected by name]: the span reader (replyRoute ... refreshDebug) reads ' +
            String(r.span) +
            ' — the notify site lies INSIDE the replyRoute span, so the SPAN form cannot separate the two sites and would redden the legitimate RE-HOME (the foundation NEW-1)',
        )
        return null
      })
    })
  }, 30_000)

  it('P-SSJ-H-2 · S-SSJ-PRED-1 · THE PREDICATE BOUNDARY — a read-only ok:true reply drives the refresh count ZERO', async () => {
    await registerRow('P-SSJ-H-2', async (run) => {
      const mutating = mutatingMethods()
      if (mutating.size === 0) {
        for (let i = 1; i <= 5; i++) {
          await check(run, i, () => 'ABSTRACT-SUBJECT: MUTATING_METHODS is not readable in src/renderer/renderer.ts — the predicate boundary has no subject')
        }
        return
      }

      // READING 1 — RE-AIMED (A-3B-1④) TO THE LANDED 're-homed' SHAPE. The as-filed reading
      // drove the 'pre-re-home' mirror — a HARD-CODED unconditional increment that measured the
      // superseded arrangement, never the landed wiring — and reddened on the MIRROR. At this head
      // the RE-HOME IS LANDED in src/renderer/renderer.ts (the per-reply burst sits in the notify
      // callback), so the predicate boundary is asserted against the REAL arrangement: an ok:true
      // reply whose method is NOT in MUTATING_METHODS must drive the refreshDebug count to ZERO.
      // FALSIFIABLE: the control below widens the predicate (the §3 F-8 falsifier) and this same
      // reading REDDENS — proven by the printed control reading.
      await check(run, 1, async () => {
        const res = await driveReply('re-homed', 'journalEntries', true, () => undefined)
        if (res.notifyCount !== 0) {
          return (
            'PREDICATE-BOUNDARY (READ-ONLY SIDE): an ok:true reply whose method (journalEntries) is NOT in MUTATING_METHODS reached the notify callback ' +
            String(res.notifyCount) +
            ' time(s), not ZERO — §2.4 / §5.1 P-SSJ-H-2 reading 1: the reply must reach the notify callback NOT AT ALL (§3 F-8)'
          )
        }
        if (res.refreshCount !== 0) {
          return (
            'PREDICATE-BOUNDARY (READ-ONLY SIDE): an ok:true reply whose method (journalEntries) is NOT in MUTATING_METHODS drove the refreshDebug call count to ' +
            String(res.refreshCount) +
            ', not ZERO — §2.4 / §5.1 P-SSJ-H-2 reading 1, RE-AIMED (A-3B-1④) to the LANDED \'re-homed\' arrangement: the per-reply burst sits INSIDE the notify callback, so a read-only reply must drive it ZERO times (§3 F-8)'
          )
        }
        return null
      })

      // READING 2 — the MUTATING-reply drive: count 1 (the boundary's positive side), asserted
      // on the LANDED SHAPE (the re-homed site) so the two readings are independent.
      await check(run, 2, async () => {
        const res = await driveReply('re-homed', 'dispatch', true, () => undefined)
        if (res.notifyCount !== 1) {
          return (
            'PREDICATE-BOUNDARY (MUTATING SIDE): a mutating reply (dispatch) reached the notify callback ' +
            String(res.notifyCount) +
            ' time(s), not 1 — §2.4: the boundary is `iff reply.ok && MUTATING_METHODS.has(req.method)`'
          )
        }
        if (res.refreshCount !== 1) {
          return 'PREDICATE-BOUNDARY (MUTATING SIDE): a mutating reply drove the refreshDebug count to ' + String(res.refreshCount) + ', not 1 — the re-homed burst must run exactly ONCE per mutating reply'
        }
        return null
      })

      // READING 3 — the journal MEMBERSHIP reading.
      await check(run, 3, () => {
        if (!mutating.has('journal')) {
          return 'PREDICATE-MEMBERSHIP: journal is ABSENT from MUTATING_METHODS — §2.4 / §0 R-5: journal STAYS a member (undo/redo genuinely mutates the app graph); §1.2 item 6 says the set gains no member and loses none'
        }
        return null
      })

      // READING 4 — the focus-ABSENT reading.
      await check(run, 4, () => {
        if (mutating.has('focus')) {
          return 'PREDICATE-MEMBERSHIP: focus IS a MUTATING_METHODS member — §2.4 / §1.2 item 6: focus STAYS ABSENT (UI focus only, no app-graph-changed); §3.2 I-4 named falsifier'
        }
        return null
      })

      // READING 5 — THE POSITIVE CONTROL (RE-AIMED WITH READING 1, A-3B-1④). Two limbs:
      //   (i) THE WIDENED PREDICATE (§3 F-8's falsifier) must REDDEN reading 1's oracle — the
      //       falsifiability proof: reading 1 is re-driven under a predicate widened to include
      //       `journalEntries`, and the SAME oracle must report a NON-ZERO refresh count.
      //   (ii) THE 'pre-re-home' MIRROR IS KEPT AS A DOCUMENTED NEGATIVE/CONTROL, never as a
      //       pass-required reading. It still DISCRIMINATES one thing: it is the shape in which
      //       the per-reply burst is HOISTED OUT of the predicate, so a read-only reply drives the
      //       count to 1 — the exact regression the re-home closes. Driving it here proves the
      //       READER can SEE that regression when it exists, which is what makes reading 1's ZERO
      //       a MEASUREMENT of the landed arrangement rather than a mirror of it.
      await check(run, 5, async () => {
        const widened = new Set([...mutating, 'journalEntries'])
        if (!widened.has('journalEntries')) {
          return 'PREDICATE-CONTROL-SUBSTRATE: the forged widened predicate does not classify journalEntries as a member — the control has no substrate'
        }
        // (i) THE FALSIFIABILITY PROOF: re-drive reading 1's SIDE under the widened predicate. The
        //     widened predicate admits a read-only reply, so the burst runs — reading 1's oracle
        //     would redden on exactly this reading.
        const widenedReadOnly = await driveReplyWith('re-homed', 'journalEntries', true, widened)
        if (widenedReadOnly.refreshCount === 0) {
          return (
            'PREDICATE-CONTROL (NOT DISCRIMINATING): the WIDENED predicate still drove the refreshDebug count to ZERO for a read-only reply — reading 1\'s oracle would NOT redden under the §3 F-8 falsifier, so the reading proves nothing'
          )
        }
        console.log(
          'SSJ ROW P-SSJ-H-2 control: the WIDENED predicate drives the read-only reply to ' +
            String(widenedReadOnly.refreshCount) +
            ' refreshDebug call(s) while the NARROW (landed) predicate reads 0 — reading 1 is FALSIFIABLE',
        )
        // (ii) THE pre-re-home NEGATIVE/CONTROL (documented, never pass-required): the hoisted
        //      shape drives a read-only reply, and the reader SEES the regression.
        const mirrored = await driveReply('pre-re-home', 'journalEntries', true, () => undefined)
        if (mirrored.refreshCount !== 1) {
          return (
            'PREDICATE-CONTROL (THE MIRROR DOES NOT DISCRIMINATE): the documented pre-re-home NEGATIVE drove a read-only reply to ' +
            String(mirrored.refreshCount) +
            ' refreshDebug call(s), not 1 — the mirror must exhibit the §3 F-8 regression (burst hoisted out of the predicate) for the control to mean anything'
          )
        }
        console.log(
          'SSJ ROW P-SSJ-H-2 control [the pre-re-home MIRROR — a documented NEGATIVE, never pass-required]: the HOISTED shape drives a read-only reply to ' +
            String(mirrored.refreshCount) +
            ' call(s) — the exact §3 F-8 regression the landed re-home closes',
        )
        const narrowReadOnly = await driveReply('re-homed', 'journalEntries', true, () => undefined)
        const narrowMutating = await driveReply('re-homed', 'dispatch', true, () => undefined)
        if (narrowReadOnly.notifyCount !== 0) {
          return (
            'PREDICATE-CONTROL-DISCRIMINATION: the NARROW predicate drove a READ-ONLY reply to the notify callback ' +
            String(narrowReadOnly.notifyCount) +
            ' time(s) — the boundary is not separating read-only from mutating replies (§2.4)'
          )
        }
        if (narrowMutating.notifyCount !== 1) {
          return (
            'PREDICATE-CONTROL-DISCRIMINATION: the NARROW predicate drove a MUTATING reply to the notify callback ' +
            String(narrowMutating.notifyCount) +
            ' time(s), not 1 — the boundary positive side is not reachable'
          )
        }
        return null
      })
    })
  }, 30_000)

  it('P-SSJ-H-3 · S-SSJ-HON-1 · THE PARK / LAYER-HONESTY ROW (the anti-overclaim row)', async () => {
    await registerRow('P-SSJ-H-3', async (run) => {
      // READING 1 — the park artifact's PRESENCE + its STATUS.
      await check(run, 1, () => {
        if (!existsSync(PARK_PATH)) {
          return (
            'PARK-ABSENT (§9 O-8 / §8 gate 6 / §4 RE-5): docs/specs/unit-store-security-journal-live-pending-battery.md does NOT exist at this head — the park is NAMED, never parked-by-default (RCA-11 clause (b)), and its artifact is a CLOSE-OUT deliverable of this unit. Its absence is reported as the row OWN red, never as a pass'
          )
        }
        const park = readMaybe(PARK_PATH) ?? ''
        const missing = ['OPEN', 'live-pending', 'NEVER green', 'NEVER DONE'].filter((t) => !park.includes(t))
        if (missing.length > 0) {
          return (
            'PARK-STATUS: the park artifact does not carry [' +
            missing.join(', ') +
            '] — §0 R-6 / §9 O-8: it is marked OPEN / live-pending — NEVER green, NEVER DONE'
          )
        }
        return null
      })

      // READING 2 — the park REASON: STRUCTURAL NON-EXERCISABILITY, never an absent session.
      await check(run, 2, () => {
        if (!existsSync(PARK_PATH)) {
          return 'PARK-ABSENT: the park REASON reading has no subject — the artifact does not exist (§9 O-8, §0 R-6)'
        }
        const park = readMaybe(PARK_PATH) ?? ''
        if (!/structural/i.test(park)) {
          return 'PARK-REASON: the park artifact does not name STRUCTURAL NON-EXERCISABILITY — §0 R-6 / §0 S-P-1: the TWO STATES ("stale because read-only" vs "stale because nothing changed") render IDENTICALLY, so no [T]/[H] instrument can separate them and the only separating oracle would be a TIMING one — forbidden as a claim. The reason is NEVER an absent session (RCA-11 clause (b))'
        }
        return null
      })

      // READING 3 — the no-durability token scan over THIS SPEC + THIS REGISTER + the PARK.
      await check(run, 3, () => {
        const findings: string[] = []
        const artifacts: Array<[string, string]> = []
        const spec = readMaybe(SPEC_PATH)
        if (spec !== null) artifacts.push(['the spec', spec])
        const self = readMaybe(SELF_PATH)
        if (self !== null) artifacts.push(['this register', self])
        const park = readMaybe(PARK_PATH)
        if (park !== null) artifacts.push(['the park artifact', park])
        if (park === null) findings.push('PARK-ABSENT: the durability scan cannot cover the park artifact — it does not exist (§9 O-8)')
        for (const [where, text] of artifacts) findings.push(...overclaimProblems(text, where))
        return findings.length > 0 ? findings : null
      })

      // READING 4 — the LAYER STATEMENT's presence.
      await check(run, 4, () => {
        const spec = readMaybe(SPEC_PATH)
        if (spec === null) return 'ABSTRACT-SUBJECT: docs/specs/unit-store-security-journal.md could not be read — the layer statement has no substrate'
        if (!/\[T\][\s\S]{0,400}\[H\]/.test(spec)) {
          return 'LAYER: the spec carries no [T]/[H] layer statement — §6 layer ledger (RCA-12) names each deliverable layer beside what that layer does NOT prove'
        }
        // THE MUTATION PROOF (the falsifiability clause): the SAME predicate reading 3 drives is
        // re-driven over a PLANTED positive claim and over the LAWFUL limits it must keep
        // admitting. The widening (a)/(b)/(c) must NOT have weakened the property.
        const FORGED_CLAIM_CORPUS: Array<[string, string, boolean]> = [
          ['the §6 over-claim named by the remand', 'the write is crash-safe and durable on disk', true],
          ['an AFFIRMATIVE live-green claim line', 'this unit is live-green and envelope-green', true],
          ['an AFFIRMATIVE app-green claim line', 'the pane is app-green now', true],
          ['the §6 ledger LIMIT cell', '| Deliverable | The layer its evidence covers | What that layer does NOT prove |\n| --- | --- | --- |\n| the predicate boundary | **`[T]`/`[H]`** | app/envelope/store/engine/live-green |', false],
          ['a NOTHING-led limit line', 'NOTHING here is app-green, envelope-green, store-green, engine-green or live-green.', false],
          ['a quoted token carrier', "'durable',\n'crash-safe',", false],
        ]
        for (const [label, planted, mustRedden] of FORGED_CLAIM_CORPUS) {
          const reddened = overclaimProblems(planted, 'the mutation control').length > 0
          console.log(
            'SSJ ROW P-SSJ-H-3 [mutation control]: ' + label + ' -> ' + (reddened ? 'REDDENS' : 'ADMITTED') + ' (required ' + (mustRedden ? 'REDDEN' : 'ADMIT') + ')',
          )
          if (mustRedden && !reddened) {
            return (
              'CONTROL-VACUOUS (the mutation proof): the anti-overclaim predicate ADMITTED the planted claim `' +
              planted +
              '` — the widening (the windowed negator set + the limit-table cell + the quote-form-agnostic carrier strip) has WEAKENED the property and can no longer see a real over-claim (§6 / §5.1 P-SSJ-H-3)'
            )
          }
          if (!mustRedden && reddened) {
            return (
              'CONTROL-VACUOUS (the mutation proof): the anti-overclaim predicate REDDENED on ' +
              label +
              ' — `' +
              planted +
              '` is a LAWFUL limit/token-carrier the spec itself carries, so the row would redden on a correct landing'
            )
          }
        }
        return null
      })

      // READING 5 — the DENIED-1 RE-AIM's IN-COMMIT record.
      await check(run, 5, () => {
        const writeSpec = readMaybe(WRITE_SPEC_PATH)
        if (writeSpec === null) return 'ABSTRACT-SUBJECT: docs/specs/unit-store-security-write.md could not be read — the re-aim record has no substrate'
        if (!/S-P-3|DISCHARGED IN THIS COMMIT|RE-AIM/i.test(writeSpec)) {
          return 'RE-AIM-RECORD: the 3a spec carries no record of the DENIED-1 re-aim — §7 row 11 / §0 S-P-3: the re-aim lands IN THIS UNIT OWN COMMIT with the red on record (K-2); an unrecorded re-aim is a finding'
        }
        return null
      })
    })
  }, 30_000)
})

// ===========================================================================
// §5.2 — THE ARITHMETIC, THE CAPS AND THE HONESTY BLOCK (printed, never copied).
// ===========================================================================
describe('STORE-SECURITY-JOURNAL REGISTER — §5.2 the arithmetic, the caps and the honesty block', () => {
  it('the register declared totals print as SUMS WITH THEIR TERMS; the caps hold; the honesty block is stated', () => {
    const byLayer = (layer: '[T]' | '[H]'): DeclaredRow[] => DECLARED_REGISTER.filter((r) => r.layer === layer)
    const sum = (rows: DeclaredRow[]): number => rows.reduce((n, r) => n + r.declaredTotal, 0)
    const tRows = byLayer('[T]')
    const hRows = byLayer('[H]')
    const total = sum(DECLARED_REGISTER)
    const tSum = sum(tRows)
    const hSum = sum(hRows)
    const largest = DECLARED_REGISTER.reduce((a, b) => (b.declaredTotal > a.declaredTotal ? b : a))
    console.log(
      '\nSSJ REGISTER — DECLARED TOTALS (REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS)\n' +
        '  seed 0x' +
        REGISTER_SEED.toString(16) +
        ' · caps <=' +
        String(CAPS.perRow) +
        '/row · <=' +
        String(CAPS.total) +
        ' in total · STOP AFTER ' +
        String(STOP_AFTER) +
        ' CONSECUTIVE FAILURES\n' +
        '  [T] rows (' +
        String(tRows.length) +
        '): ' +
        tRows.map((r) => r.row + ' ' + String(r.declaredTotal)).join(' + ') +
        ' = ' +
        String(tSum) +
        '\n' +
        '  [H] rows (' +
        String(hRows.length) +
        '): ' +
        hRows.map((r) => r.row + ' ' + String(r.declaredTotal)).join(' + ') +
        ' = ' +
        String(hSum) +
        '\n' +
        '  DECLARED TOTAL: [T] ' +
        String(tSum) +
        ' + [H] ' +
        String(hSum) +
        ' = ' +
        String(total) +
        '\n' +
        '  largest row: ' +
        largest.row +
        ' ' +
        String(largest.declaredTotal) +
        ' <= ' +
        String(CAPS.perRow) +
        ' (headroom ' +
        String(CAPS.perRow - largest.declaredTotal) +
        ') · total ' +
        String(total) +
        ' <= ' +
        String(CAPS.total) +
        ' (headroom ' +
        String(CAPS.total - total) +
        ')\n' +
        '  the count is an OUTCOME: the executed reading is printed per row and summed below\n' +
        '  HONESTY BLOCK: the register proves the seam subject, the cap plumbing and reach, the two-level bounding,\n' +
        '  the volume guard totality and the surface pins AGAINST A CONSTRUCTED PANE AND BYTE-SCANS.\n' +
        '  It does NOT prove: the assembled Electron app, the rendered surface under the real shell CSS/grid, a live\n' +
        '  round trip, the APP runtime own journal behaviour, or the engine internals. NO DURABILITY CLAIM is made.',
    )
    expect(DECLARED_REGISTER.length, 'the register declares NINE rows (§5.1)').toBe(9)
    expect(tRows.length, 'the [T] rows are SIX (P-SSJ-IM-1..4 · P-SSJ-SM-1 · P-SSJ-TP-1)').toBe(6)
    expect(hRows.length, 'the [H] rows are THREE (P-SSJ-H-1..3)').toBe(3)
    expect(tSum, 'the [T] rows read 5 + 8 + 6 + 7 + 6 + 8 = 40 (§5.2 RE-TAKEN by A-3B-1①②: P-SSJ-IM-1 gained the subject-discrimination drive and P-SSJ-IM-4 gained the landed-outcome drive; the superseded figure 38 = 4 + 8 + 6 + 6 + 6 + 8 is kept visible)').toBe(40)
    expect(hSum, 'the [H] rows read 4 + 5 + 5 = 14 (§5.2 — UNMOVED by A-3B-1)').toBe(14)
    expect(total, 'the DECLARED total is [T] 40 + [H] 14 = 54 (§5.2 RE-TAKEN: superseded 52 = [T] 38 + [H] 14, kept visible)').toBe(54)
    expect(largest.row, 'the largest row is P-SSJ-IM-2 at 8 (§5.2)').toBe('P-SSJ-IM-2')
    expect(largest.declaredTotal, '8 <= 100 with headroom 92 (§5.2)').toBe(8)
    expect(total, '54 <= 400 with headroom 346 (§5.2 RE-TAKEN: superseded headroom 348)').toBeLessThanOrEqual(CAPS.total)
    for (const row of DECLARED_REGISTER) {
      expect(row.row, 'every row carries a fork-own P-SSJ-* id (§5)').toMatch(/^P-SSJ-(IM|SM|TP|H)-\d+$/)
      expect(row.strategyId, 'row ' + row.row + ' carries its S-SSJ-* strategy id (§5)').toMatch(/^S-SSJ-/)
      expect(row.redHeadClass, 'row ' + row.row + ' carries a §4 red class').toMatch(/^(RED-BY-ABSENCE|RED-BY-SHIM|GREEN-ON-ARRIVAL|GREEN)$/)
      expect(row.declared, 'row ' + row.row + ' prints its term with its factors (§5.2)').toMatch(/\d/)
    }
    expect(
      ROW_PREFIXES.every((p) => p.startsWith('P-SSJ-')),
      'the row-id prefixes are fork-own (P-SSJ-*), colliding with no sibling (§5)',
    ).toBe(true)
    expect(REGISTER_SEED, 'the register seed is the fixed literal 0x20261006 (§5)').toBe(0x20261006)
    const draws = [0, 1, 2].map((i) => lcgDraw(REGISTER_SEED + i, 97).index)
    expect(new Set(draws).size, 'the hand-rolled 32-bit LCG draws (§5)').toBeGreaterThan(0)
    expect(FORBIDDEN_SETTLES.length, 'the three OUTSIDE settle classes are carried by name (§2.3)').toBe(3)
    expect(DRAIN_ROUNDS, 'the settle is the landed precedent FIVE awaits (§2.3)').toBe(5)
  }, 12_000)

  it('the register EXECUTED totals: each row runs SEQUENTIALLY in register order; the executed sum is an OUTCOME, never a copied anchor', () => {
    const executedTotal = REPORTS.reduce((n, r) => n + r.executed, 0)
    const declaredTotal = DECLARED_REGISTER.reduce((n, r) => n + r.declaredTotal, 0)
    const byClass = (c: RedClass): number => REPORTS.filter((r) => r.redClass === c).length
    const broken = REPORTS.filter((r) => !r.held)
    console.log(
      '\nSSJ REGISTER — EXECUTED READING (the OUTCOME)\n' +
        '  rows run: ' +
        String(REPORTS.length) +
        ' of ' +
        String(DECLARED_REGISTER.length) +
        ' (SEQUENTIAL in register order — an un-run row is a FAILURE, never a pass)\n' +
        '  executed readings: ' +
        String(executedTotal) +
        ' · declared ' +
        String(declaredTotal) +
        '\n' +
        '  held ' +
        String(REPORTS.filter((r) => r.held).length) +
        ' · BROKEN ' +
        String(broken.length) +
        (broken.length > 0 ? ' [' + broken.map((r) => r.row).join(', ') + ']' : '') +
        '\n' +
        '  red classes at this head: RED-BY-ABSENCE ' +
        String(byClass('RED-BY-ABSENCE')) +
        ' · RED-BY-SHIM ' +
        String(byClass('RED-BY-SHIM')) +
        ' · GREEN-ON-ARRIVAL ' +
        String(byClass('GREEN-ON-ARRIVAL')) +
        ' · GREEN ' +
        String(byClass('GREEN')) +
        '\n' +
        '  per-row: ' +
        REPORTS.map((r) => r.row + '(' + (r.held ? 'held' : 'broken') + '/' + String(r.executed) + ')').join(' · '),
    )
    expect(REPORTS.length, 'all NINE declared rows RAN (an un-run row reports a FAILURE, never a pass — §5)').toBe(DECLARED_REGISTER.length)
    for (const r of REPORTS) {
      expect(r.executed, 'row ' + r.row + ' reports at least one executed reading (a row that ran nothing is an un-run row, i.e. a FAILURE)').toBeGreaterThan(0)
    }
    void byClass
  }, 12_000)
})
