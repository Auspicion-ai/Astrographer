// tests/pd-store-security-journal.test.ts — UNIT `U-STORE-SECURITY-JOURNAL` (3b, the RH-3
// half of the SPLIT unit 3 of the store-adoption program, F2) — THE SURFACE/BYTE GUARD: the
// FOUR-member change-set census (§1.1); the DENIED-surface negative over §1.2's THIRTEEN rows;
// the `[H]` surface pins (the occurrence probe · the predicate boundary · the notify-callback
// re-home · the option's construction site); the `DENIED-1` POST-RE-AIM state (§7 row 11); and
// the park/layer-honesty row.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-store-security-journal.md
//     §0 R-1..R-9        the rulings this unit derives from — the CAP AUTHORITY is the ENGINE's
//                        `maxJournalLength` (the host trim is ILLEGAL) · the seam's subject is
//                        `Supervisor.journal.length`, NEVER `undoDepth` · THE DENIED SURFACE ·
//                        the burst re-home is INTENDED · the park is STRUCTURAL
//                        NON-EXERCISABILITY · the 14-row amendment set · the sequential order ·
//                        the package defect CATALOGUED, never patched
//     §0 S-P-1..S-P-5    the supersession pointer edges (S-P-3: 3a's `DENIED-1` item is
//                        DISCHARGED IN THIS COMMIT BY THE RE-AIM; S-P-5: the stale
//                        `mcp-endpoint.md` §3.6 cell is OUT OF SCOPE BY NAME)
//     §1.1 members 1-4   THE ONE ATOMIC COMMIT'S FOUR MEMBERS — `secure-panels.ts`'s additive
//                        `SecurePanelsOptions.maxJournalLength` + the `Supervisor` construction
//                        option + `journalDepth()` + the `syncConfig()` skip-if-unchanged
//                        guard; `renderer.ts`'s pane-construction option + THE BURST RE-HOME;
//                        `tests/pd-store-security-write.test.ts`'s `DENIED-1` RE-AIM; the
//                        unit's TWO new test files. A landing whose commit moves a DIFFERENT
//                        member set — in particular one that adds a FIFTH `src/**` cell — or
//                        that lands across more than one commit is §3 `F-1`.
//     §1.2 items 1-13    THE THIRTEEN DENIED ROWS — no `src/main/**` byte · no md5-pinned byte
//                        and no re-stated digest · no host trim (`journal.splice`/`journal =`/
//                        `undoStack =`/`redoStack =`/a ported `applyJournalCap`) · no second
//                        `condense()` · no new cap-authority constant · NO WIDENED notify
//                        predicate · no THIRD `refreshDebug` site and not the SPAN form of the
//                        probe · no `undoDepth` subject · no fake timers · no
//                        `node_modules/provident-ssr/**` byte · no MCP surface · NO PRODUCTION
//                        CALLER of `journalDepth()` · no `vitest.config.ts`/`foundation.lock`
//                        byte and no tracker content beyond this unit's own half
//     §2.2               `journalDepth(): number` — public, read-only, SYNCHRONOUS, `SecurePanels`'s
//                        own member, answering `this.supervisor.journal.length` and NOTHING else;
//                        a TEST/VISIBILITY seam of the `debugText()` class with NO production
//                        caller; exactly ONE parameter — none
//     §2.3               THE SETTLE PROTOCOL — the landed `drain()` (FIVE `setTimeout(…, 0)`
//                        awaits, crossing MACROTASK boundaries); `flush()`-alone, fake timers and
//                        a "microtask" claim are each OUTSIDE (the package defect `K-3`)
//     §2.4               THE BURST RE-HOME + THE PREDICATE BOUNDARY — the call MOVES into the
//                        notify callback; `'journal'` STAYS in `MUTATING_METHODS`; an `ok:true`
//                        reply NOT in the predicate reaches the callback NOT AT ALL
//     §2.5               THE PROBE — EXACTLY TWO `refreshDebug` CALL SITES in `renderer.ts`,
//                        counted BY SYMBOL over the COMMENT-FREE body; a THIRD fails; the SPAN
//                        form is REJECTED BY NAME
//     §2.6               THE `syncConfig()` VOLUME GUARD — its four properties and its OUTSIDE
//                        list; the MEASURED BASELINE (16 draws/call, 32 entries per mutating reply)
//     §3.1/§3.2          THE INVARIANT and the rules I-1..I-7
//     §3.3 F-1..F-12     the fail-states this guard's arms answer to
//     §4 RE-1..RE-6      the red set and the no-other-red rule with its pre-recorded exemption
//                        (`RE-6`, the landed `DENIED-1` red)
//     §5.1 P-SSJ-H-1/-2/-3  the `[H]` surface pins this guard's arms answer to
//     §5.2               the register's arithmetic, caps and honesty block
//     §6                 the layer ledger and the HONESTY/LIMITS block
//     §7 row 11          the `DENIED-1` RE-AIM — its three as-filed regexes ①②③, their
//                        dispositions (NULL / INVERTED / SCOPED) and THE RE-AIMED SURFACE
//     §8 gate 6 / §9 O-8 the NAMED park
//
// THE ARM CLASSIFICATION (recorded per arm, §4). Four classes, tracked distinctly:
//   RED-BY-ABSENCE     — the arm's subject module/surface does not exist at this head.
//   RED-BY-SHIM        — the arm's oracle runs against the landed substrate and reports the
//                        pinned property UNSATISFIED (the byte-scan instrument).
//   GREEN-ON-ARRIVAL   — the arm asserts a property ALREADY TRUE at this head (a
//                        negative/denied-surface pin, or a landed guard that stays green).
//                        Marked explicitly, never counted as a landing-driven red (§4's
//                        no-other-red rule); a landing that reddens one of these has NOT
//                        landed this unit.
//   GREEN              — the arm's property holds over its landed subject at this head AND is
//                        landing-driven. Reported `GREEN`, never conflated with a
//                        landing-driven red and never claimed as app-green.
//   SKIPPED            — the arm's substrate is absent (a named skip with its reason; a
//                        SKIPPED arm is NEVER a pass).
//
// ===========================================================================
// HEADER RECONCILIATION NOTES — RULING `A-3B-1` (2026-10-04, BY THE SUPERVISOR) + THE GATE-4
// ADVERSARIAL REMAND (2026-10-06)
// ===========================================================================
// REMANDED ARMS IN THIS FILE:
//   F-9 (the re-aim witness had no teeth) — `deniedOneReaimReading` is REBUILT BEHAVIOURALLY.
//        Every limb is now proven by driving a PLANTED FORGERY CORPUS through the LANDED guard's
//        own predicate (`deniedOneGuardProblems`), and limb 1 asserts the landed guard's SIX LIVE
//        `problems.push` sources are still present. THE REFERENCE PROBE IS REPRODUCED IN-FILE: the
//        supervisor stripped all six live limbs while keeping every COMMENT, and the prose-only
//        witness stayed 6/6 GREEN; the rebuilt witness REDDENS on exactly that strip (mutation-
//        proved). The corpus: (a) a REQUIRED `maxJournalLength: number`, (b) a positional second
//        argument, (c) a SECOND `new SecurePanels(` site, (d) `maxJournalLength` in
//        `MUTATING_METHODS`, (e) a THIRD `refreshDebug` occurrence.
//   F-7 (the word/window probe) — `burstRehomeReading` now walks the BALANCED body of the
//        `handleRequest` CALL's third argument and the chained reply `.then`, replacing the
//        `slice(indexOf('bridge.onRequest('), +1200)` window, the `[^}]*` brace-hostile
//        alternative and the `<= 2` semicolon budget.
// `A-3B-1` (recorded in the contract's §10 amendment ledger) re-aims FOUR limbs of the SIBLING
// register (`tests/store-security-journal-register.test.ts`) on the implementer's measured stop.
// ⟶ REMAND: `A-3B-1`'s premise (the D5 guard ALWAYS SKIPS) is SUPERSEDED IN PART — see the
// sibling register's re-taken readings; the landed state is reachable at 48 mutations.
// THIS file is a BYTE/SURFACE guard and is NOT one of the re-aimed rows; it is reconciled here
// only because its ARM CLASSIFICATION above recorded a head at which the unit's members were
// ABSENT, and that note is now STALE against the landed tree. The measured figures the ruling
// turns on, RE-CONFIRMED BY THIS PASS's own probe over the landed tree (reader: this TestWriter,
// at HEAD 62904ef + the implementer's uncommitted member set):
//   (i)   the engine's condense FIRES but the D5 size guard ALWAYS SKIPS on this pane —
//         `base 7622B >= pre-base journal 2312B` — the observed warn being verbatim
//         `condense-skipped-size at journal-12: base 7622B >= pre-base journal 2312B; no rewrite
//         (raise maxJournalLength)`, with `basePresent === false`.
//   (ii)  the warm-up `refresh()` draws 12; every subsequent UNCHANGED cycle draws 0.
//   (iii) MEASURED FURTHER BY THIS PASS: the LANDED condense IS reachable on this fixture at a
//         LARGER drive — 40 mutations skip (`journal 52 · undoDepth 52 · basePresent false`)
//         while 60 mutations LAND (`journalDepth() 1 · undoDepth 0 · basePresent true`).
// WHAT THE RE-AIM CHANGES IN THE SIBLING (and therefore what this guard's member-1④ and arm
// classes must NOT be read as contradicting):
//   RE-AIM ① `P-SSJ-IM-2` limb 1 — the `journalDepth() <= M` BOUND-CLAIM is WITHDRAWN AS
//            UNREACHABLE and re-cast to THE ATTEMPT READING (the cap is CONFIGURED at the pane's
//            Supervisor AND a condense was ATTEMPTED after the drive). Limb 2 (the uncapped
//            control, `M = undefined` => growth `> M`) is UNCHANGED as the anti-vacuity limb, and
//            the drive's `> M` floor is UNCHANGED. COUNTEREXAMPLE STILL CAUGHT: an UNCONFIGURED
//            pane (§3 F-2) or a drive that never triggers reddens it.
//   RE-AIM ② `P-SSJ-IM-3` state 2 and `P-SSJ-IM-4` OUTCOME A — re-aimed to the OBSERVABLE
//            OUTCOME: the SKIP (the equal `journalDepth()`/`undoDepth()` reading +
//            `basePresent === false` + the skip warn). OUTCOME B is KEPT. The landed/inequality
//            branch survives as the FORGED-BY-CONSTRUCTION control (b), never reported as a real
//            drive.
//   RE-AIM ③ `P-SSJ-SM-1` state 1 vs `P-SSJ-TP-1` class 2 — THE CONTRADICTION IS RULED: state
//            1's `>= 1` draw is re-scoped to the WARM-UP cycle (measured 12), state 3
//            (SUPPRESSED) keeps ZERO applies on a repeated UNCHANGED cycle (measured 0), and BOTH
//            are satisfiable by ONE guard. A row demanding `>= 1` on a steady-state unchanged
//            cycle is WRONG. `P-SSJ-TP-1` is NOT edited by `A-3B-1`.
// THIS FILE'S OWN ARMS are unaffected in FORM: the four-member change-set census (§1.1), the
// thirteen denied rows (§1.2), the `[H]` surface pins (§2.4/§2.5) and the park row (§8 gate 6)
// are all read from the landed bytes, so they track the landing automatically. The two arms that
// still redden at this head are OUTSIDE `A-3B-1`'s remit: arm 1 (the `DENIED-1` re-aim in the 3a
// guard is the IMPLEMENTER's in-commit act, §1.1 member 3 / §7 row 11) and arm 4 (the park
// artifact is an `OWED` close-out deliverable, §9 `O-8`).
//
// LAYER (RCA-12 / §6). `[T]`/`[H]` ONLY. **NOTHING here is app-green, envelope-green,
// store-green, engine-green or live-green.** This guard asserts BYTES and SURFACE — never
// module BEHAVIOUR (the register owns that). **NO DURABILITY CLAIM IS MADE OR ASSERTED
// ANYWHERE IN THIS FILE** (this unit moves no byte on any durability axis). **No claim is made
// that the notify callback's re-home is observable in a rendered-DOM reading** — that is the
// park's own reason.
//
// THE TWO FILES' DIVISION OF LABOUR (§1.1 member 4): this guard owns the BYTE/SURFACE pins and
// the DENIED-SURFACE negative; the sibling register
// (`tests/store-security-journal-register.test.ts`) owns the DRIVEN rows (the seam over a
// CONSTRUCTED pane, the cap's three limbs, the volume-guard machine and its totality, and the
// register's own `[H]` occurrence/predicate readings). The occurrence probe and the predicate
// boundary therefore appear in BOTH files BY DESIGN — each is the other's independent
// instrument (§4 RE-5 names both files for the same red).
//
// THE WALL: this file touches NOTHING but its own bytes. No `src/**` byte, no landed test file
// (the `DENIED-1` re-aim is the IMPLEMENTER's in-commit act per §1.1 member 3 / §7 row 11 — this
// guard only READS and PINS the re-aimed shape), no spec/tracker byte, no
// `vitest.config.ts`/`package.json` byte.
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

const PANELS_PATH = join(REPO_ROOT, 'src', 'renderer', 'secure-panels.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const RENDERER_DIR = join(REPO_ROOT, 'src', 'renderer')
const MAIN_DIR = join(REPO_ROOT, 'src', 'main')
const SRC_DIR = join(REPO_ROOT, 'src')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-journal.md')
const PARK_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-journal-live-pending-battery.md')
const WRITE_SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-write.md')
const THEME_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const WRITE_GUARD_PATH = join(REPO_ROOT, 'tests', 'pd-store-security-write.test.ts')
const ENGINE_DIR = join(REPO_ROOT, 'node_modules', 'provident-ssr')
const ENGINE_SUPERVISOR = join(ENGINE_DIR, 'dist', 'core', 'supervisor.js')
const VITEST_CONFIG_PATH = join(REPO_ROOT, 'vitest.config.ts')
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const SELF_PATH = join(HERE, 'pd-store-security-journal.test.ts')
const REGISTER_PATH = join(HERE, 'store-security-journal-register.test.ts')

// ===========================================================================
// §1.1 / §2 / §7 — THE DECLARED CONTRACT, carried as literals so the arms compare the real
// bytes against the SPEC's declaration rather than against a re-reading of the same scan.
// ===========================================================================
/** §1.1 — THE FOUR-MEMBER CHANGE SET (`CENSUS`: 4, printed with its terms). */
const CHANGE_SET_MEMBERS = [
  'src/renderer/secure-panels.ts — the PANE JOURNAL (the additive optional `SecurePanelsOptions.maxJournalLength`; the pane `Supervisor` construction option; `journalDepth()`; the `syncConfig()` skip-if-unchanged guard)',
  'src/renderer/renderer.ts — the OPTION at the EXISTING pane construction site + THE BURST RE-HOME',
  'tests/pd-store-security-write.test.ts — THE `DENIED-1` RE-AIM',
  'tests/pd-store-security-journal.test.ts + tests/store-security-journal-register.test.ts — the unit\'s TWO new test files',
] as const
/** §1.1 member 4 — the two new files, by name. */
const NEW_TEST_FILES = ['pd-store-security-journal.test.ts', 'store-security-journal-register.test.ts'] as const
/** §1.2 — THE THIRTEEN DENIED ROWS (`CENSUS`: 13, printed with their terms). */
const DENIED_ROWS = [
  '1 — ANY byte of `src/main/**` (every store, gate, preload, IPC and settings file)',
  '2 — ANY md5-pinned byte: this unit moves NONE of the seven `UNTOUCHED_DIGESTS` rows and re-states no digest',
  '3 — a host-side trim: `journal.splice` / `journal =` / `undoStack =` / `redoStack =`, or a ported `applyJournalCap` analogue',
  '4 — a second `condense()` (no base-snapshot serialize, no D5 re-implementation, no `serializeSlice` call)',
  '5 — a NEW cap-authority constant (no independent pane-cap literal, no second threshold, no environment read)',
  '6 — a WIDENED notify predicate (`MUTATING_METHODS` gains no member, loses none; `focus` stays absent)',
  '7 — a THIRD `refreshDebug` site, and the SPAN form of the occurrence probe',
  '8 — an `undoDepth` subject (`undoDepth`/`undoStack`/`redoDepth`/`journalEntries().undoDepth`/`journalEntries().totalEntries`)',
  '9 — fake timers, a fixed tick-count settle, or a `flush()`-alone settle',
  '10 — any byte under `node_modules/provident-ssr/**` or `../Provident-Electron/**`',
  '11 — any MCP surface (a new tool/group/resource/RpcMethod/IPC key)',
  '12 — a production caller of `journalDepth()` (a TEST/VISIBILITY seam only)',
  '13 — `vitest.config.ts`; `vendor/foundation.lock.json`; the active trackers\' content beyond this unit\'s own half',
] as const
/** §7 row 11 — the SEVEN `UNTOUCHED_DIGESTS` rows this unit moves NONE of (`CENSUS`: 7, printed
 *  with their terms). `src/renderer/secure-panels.ts` and `src/renderer/renderer.ts` are NOT
 *  rows of that table, so this unit's two renderer edits move no pinned byte. */
const SEVEN_PINNED_FILES = [
  'src/shared/types.ts',
  'src/main/operator-settings-store.ts',
  'src/main/preload.ts',
  'src/renderer/sidebar-panes.ts',
  'src/shared/demo-envelope.ts',
  'src/shared/dom-shim.ts',
  'src/shared/path-fork-cycle.ts',
] as const
/** §2.4 / §7 row 11 — the notify predicate's seven landed members; `'journal'` STAYS a member
 *  and `focus` STAYS absent. */
const MUTATING_MEMBERS = ['dispatch', 'load', 'op', 'teardown', 'code.load', 'code.loadBatch', 'journal'] as const
const ABSENT_FROM_PREDICATE = ['focus', 'journalEntries', 'renderedHtml', 'listTargets', 'nodeState', 'export', 'validate'] as const
/** §2.2 / §2.3 — the seam's name and the settle's shape. */
const SEAM = 'journalDepth'
/** §2.3 — the landed `drain()` precedent's round count (`tests/blind-unit-ujr1-get-journal-greens.test.ts`). */
const DRAIN_ROUNDS = 5
/** §2.1(b) / §2.6 — THE MEASURED BASELINE the volume guard's falsifier answers to. */
const MEASURED_BASELINE_PER_CALL = 16
const MEASURED_BASELINE_PER_MUTATING_REPLY = 32
/** §6 — THE DURABILITY-VOCABULARY SET, carried as the INSTRUMENT'S OWN WORD LIST (the words
 *  the scan LOOKS FOR, never a claim of this file's). This unit moves no byte on any durability
 *  axis, so an over-claim in its prose is the falsifier. */
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
/** §6 — the FIVE layer/status tokens this unit's artifacts must NEVER claim. */
const FORBIDDEN_GREEN_TOKENS = ['app-green', 'envelope-green', 'store-green', 'engine-green', 'live-green'] as const
/** §8 gate 6 / §9 `O-8` — the park's required status spelling. */
const PARK_STATUS_TOKENS = ['OPEN', 'live-pending', 'NEVER green', 'NEVER DONE'] as const
/** §1.2 item 9 — the files the settle-protocol negative scans. THE REGISTER ONLY: this guard
 *  file CARRIES the forbidden spellings as its instrument's own needles, so a self-inclusive
 *  scan would redden on the tool that measures (see the row's note). */
const SETTLE_SCAN_TARGETS = ['store-security-journal-register.test.ts'] as const
/** §1.2 item 9 / §2.3 — the landed `drain()` precedent's OWN shape, the settle this unit's tests
 *  MUST use: the `setTimeout(…, 0)` loop, `DRAIN_ROUNDS` awaits. Read as a bound: `DRAIN_ROUNDS`
 *  is NOT a "fixed tick-count settle" — the forbidden object is a settle that CANNOT cross the
 *  condense's macrotask boundary, while a task-boundary loop is the mandated instrument. */
const DRAIN_PRECEDENT = /new Promise\(\(res\)\s*=>\s*setTimeout\(res,\s*0\)\)/

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed per arm for the DONE row.
// ===========================================================================
type ArmVerdict = 'RED-BY-ABSENCE' | 'RED-BY-SHIM' | 'GREEN-ON-ARRIVAL' | 'GREEN' | 'SKIPPED'
interface ArmRow {
  arm: string
  verdict: ArmVerdict
  limbs: string[]
  note: string
}
const ARM_VERDICTS: ArmRow[] = []

function recordArm(arm: string, problems: string[], verdict: ArmVerdict, note: string): void {
  const held = problems.length === 0
  ARM_VERDICTS.push({
    arm,
    // a GREEN-ON-ARRIVAL arm that still holds is reported GREEN-ON-ARRIVAL (its class is what
    // the DONE row records); an arm whose classified verdict is GREEN-ON-ARRIVAL but which
    // FAILS is reported as the red it observed, never as a green.
    verdict: held ? verdict : verdict === 'GREEN-ON-ARRIVAL' || verdict === 'GREEN' ? 'RED-BY-SHIM' : verdict,
    limbs: problems,
    note,
  })
}

function readMaybe(path: string): string | null {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : null
  } catch {
    return null
  }
}

/** The comment-free body of a source text — so a PROSE mention of a denied token is never
 *  mistaken for a USE of it. The landed precedent: `tests/pd-store-security-write.test.ts`'s
 *  `withoutComments` (§2.5's COMMENT EXCLUSION requirement). */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

/** Every file under a directory (recursive; files only). */
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

function srcFiles(): string[] {
  return walkFiles(SRC_DIR)
}

function md5Of(bytes: string | Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}

/** The INDENT-BALANCED body of the `interface <Name> { … }` declaration — never an
 *  `indexOf`-to-EOF or a `-1`-terminated slice (the sibling's `P-SSW-H-2` limb 4 remand class).
 *  Returns `null` when the declaration is absent, so an unreadable container is REPORTED rather
 *  than silently satisfied by a whole-file match. */
function interfaceBody(text: string, name: string): string | null {
  const at = text.indexOf(`interface ${name}`)
  if (at < 0) return null
  const open = text.indexOf('{', at)
  if (open < 0) return null
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return text.slice(open + 1, i)
    }
  }
  return null
}

// ===========================================================================
// §2.4 / §2.5 — THE OCCURRENCE PROBE (the `[H]` instrument). BY SYMBOL, over the
// COMMENT-FREE body; the SPAN form is REJECTED BY NAME (the foundation's `NEW-1`).
// ===========================================================================
/** Count `refreshDebug` OCCURRENCES in a source text, by SYMBOL over the comment-free body.
 *  `mode`:
 *    'symbol'  — every `refreshDebug` token (the property's own subject: the occurrence set
 *                is CLOSED at the call sites).
 *    'literal' — only the reply-site spelling `panels?.refreshDebug(`. §2.5's VACUITY note:
 *                a single-literal count reads `1` TODAY, so this mode is the probe's own
 *                demonstrated vacuity counterexample, never its oracle.
 *    'span'    — a windowed match (± N chars around the occurrence), the SPAN form REJECTED
 *                BY NAME (§1.2 row 7) because the notify site lies INSIDE the `replyRoute`
 *                span.
 */
function countRefreshDebug(text: string, mode: 'symbol' | 'literal' | 'span'): number {
  if (mode === 'span') {
    // the rejected form: a window that cannot tell the two sites apart from a span
    const spans = [...text.matchAll(/replyRoute[\s\S]{0,400}refreshDebug/g)]
    return spans.length
  }
  const body = withoutComments(text)
  if (mode === 'literal') return (body.match(/panels\?\.refreshDebug\s*\(/g) ?? []).length
  return (body.match(/\brefreshDebug\b/g) ?? []).length
}

// ===========================================================================
// ARM 1 — THE FOUR-MEMBER CHANGE-SET CENSUS (§1.1; §3 `F-1`).
// ===========================================================================
interface MemberReading {
  member: string
  subscribed: string[]
  problems: string[]
}

function changeSetReadings(): MemberReading[] {
  const readings: MemberReading[] = []

  // member 1 — `secure-panels.ts`'s four cells
  {
    const subscribed: string[] = []
    const problems: string[] = []
    const text = readMaybe(PANELS_PATH)
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.1 member 1): ${relative(REPO_ROOT, PANELS_PATH)} could not be read — the pane-journal member has no substrate`)
      readings.push({ member: '1 · `src/renderer/secure-panels.ts` — the PANE JOURNAL', subscribed, problems })
    } else {
      const body = withoutComments(text)
      // ① the ADDITIVE OPTIONAL option — read INSIDE the `SecurePanelsOptions` container only.
      // A bare `/maxJournalLength\??\s*:\s*number/` over the WHOLE body is NOT this subject: the
      // module ALREADY carries an unrelated `maxJournalLength?: number | null` inside the
      // `window.provident.security.set(patch)` DECLARATION (the bridge surface, not the pane
      // option), so a file-wide match reads PRESENT at this head and the limb is TRUE BY
      // CONSTRUCTION — it could never report §4 RE-3's absent-option class. The container IS
      // the subject, and it is read as a BRACE-BALANCED block (never an `indexOf`-to-EOF slice:
      // the sibling's `P-SSW-H-2` limb 4 remand class).
      const optionsBody = interfaceBody(body, 'SecurePanelsOptions')
      const option = optionsBody !== null && /maxJournalLength\??\s*:\s*number/.test(optionsBody)
      subscribed.push(`① \`SecurePanelsOptions.maxJournalLength?: number\` (additive-optional, read inside the container): ${option ? 'PRESENT' : 'ABSENT'}${optionsBody === null ? ' — the container itself is unreadable' : ''}`)
      if (!option) {
        problems.push(
          `MEMBER-1①: \`SecurePanelsOptions\` carries no \`maxJournalLength?: number\` member — §1.1 member 1① lands the ADDITIVE OPTIONAL option (never a positional second argument); at this head the option resolves NOWHERE (§4 RE-3)`,
        )
      }
      // the ADDITIVITY's own limb: the type must still be OPTIONAL (`?`), never required
      if (option && optionsBody !== null && !/maxJournalLength\?\s*:\s*number/.test(optionsBody)) {
        problems.push(
          'MEMBER-1①-ADDITIVITY: `maxJournalLength` is declared REQUIRED — §1.1 member 1① / §3.2 I-3: the option is OPTIONAL and additive; every landed ONE-ARGUMENT `new SecurePanels(` call site must compile and behave exactly as before (§3 `F-10`)',
        )
      }
      // ② the pane `Supervisor` construction option
      const construction = /new\s+Supervisor\s*\(\s*\{[\s\S]{0,300}?maxJournalLength/.test(body)
      subscribed.push(`② the pane \`Supervisor\` construction gains \`maxJournalLength\`: ${construction ? 'PRESENT' : 'ABSENT'}`)
      if (!construction) {
        problems.push(
          `MEMBER-1②: the pane \`Supervisor\` construction site does not carry \`maxJournalLength\` — §1.1 member 1② feeds it from \`opts.maxJournalLength\` (§4 RE-2: the cap is configured but NOT PLUMBED, §3 \`F-2\`)`,
        )
      }
      // ③ the new read-only seam
      const seam = new RegExp(`\\b${SEAM}\\s*\\(\\s*\\)\\s*:\\s*number`).test(body)
      subscribed.push(`③ \`${SEAM}(): number\`: ${seam ? 'PRESENT' : 'ABSENT'}`)
      if (!seam) {
        problems.push(
          `MEMBER-1③: \`${SEAM}()\` is not declared on \`SecurePanels\` — §1.1 member 1③ / §2.2 disclose the NEW public read-only SYNCHRONOUS seam; at this head the member resolves NOWHERE (§4 RE-1, the module-member-absent class)`,
        )
      }
      // ④ the `syncConfig()` skip-if-unchanged guard
      const guard = syncConfigGuardReading(text)
      subscribed.push(`④ the \`syncConfig()\` skip-if-unchanged guard: ${guard.present ? 'PRESENT' : 'ABSENT'} (${guard.evidence})`)
      if (!guard.present) {
        problems.push(
          `MEMBER-1④: \`syncConfig()\` carries no skip-if-unchanged guard at its mutation-building site — §1.1 member 1④ / §2.6 require the SECOND BOUND; at this head every \`state-slice\` draw is issued unconditionally (§4 RE-4: the steady-state draw count reads 16/32 against the guard's \`< 16\` claim)`,
        )
      }
      readings.push({ member: '1 · `src/renderer/secure-panels.ts` — the PANE JOURNAL', subscribed, problems })
    }
  }

  // member 2 — `renderer.ts`'s option + the burst re-home
  {
    const subscribed: string[] = []
    const problems: string[] = []
    const text = readMaybe(RENDERER_PATH)
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.1 member 2): ${relative(REPO_ROOT, RENDERER_PATH)} could not be read — the wiring member has no substrate`)
      readings.push({ member: '2 · `src/renderer/renderer.ts` — the OPTION + THE BURST RE-HOME', subscribed, problems })
    } else {
      const body = withoutComments(text)
      // ① the option at the EXISTING pane construction site
      const paneConstruction = /new\s+SecurePanels\s*\([\s\S]{0,200}maxJournalLength/.test(body)
      subscribed.push(`① the pane construction site carries the option: ${paneConstruction ? 'PRESENT' : 'ABSENT'}`)
      if (!paneConstruction) {
        problems.push(
          `MEMBER-2①: the pane construction site \`new SecurePanels(panesMount, …)\` does not carry \`maxJournalLength\` — §1.1 member 2① feeds it from the EXISTING boot local (NO new boot read); at this head the site still reads \`{ moduleRunner }\` (§4 RE-3)`,
        )
      }
      const positional = /new\s+SecurePanels\s*\(\s*[^,()]+,\s*[A-Za-z_$][\w$]*\s*\)/.test(body)
      subscribed.push(`①-ADDITIVITY no POSITIONAL second argument at any \`new SecurePanels(\`: ${positional ? 'VIOLATED' : 'HELD'}`)
      if (positional) {
        problems.push(
          `MEMBER-2①-POSITIONAL: a \`new SecurePanels(\` call site binds a bare identifier as its SECOND POSITIONAL argument — §1.1 member 1① forbids the positional form (the option is a named member of \`SecurePanelsOptions\`); §3.2 I-3 / §3 \`F-10\``,
        )
      }
      // ② THE BURST RE-HOME
      const rehome = burstRehomeReading(text)
      subscribed.push(`② the per-reply \`refreshDebug\` sits in the NOTIFY CALLBACK: ${rehome.inNotify ? 'PRESENT' : 'ABSENT'} (the reply \`.then\` reduced to \`bridge.sendReply(reply)\`: ${rehome.thenIsSendReplyOnly ? 'YES' : 'NO'})`)
      if (!rehome.inNotify) {
        problems.push(
          `MEMBER-2②: the per-reply \`refreshDebug\` call does not sit in the notify callback — §1.1 member 2② / §2.4 MOVE it into \`(p) => { bridge!.notify(p); panels?.refreshDebug(runtime) }\` and reduce the reply \`.then\` to \`bridge.sendReply(reply)\`; at this head the call still sits in the \`.then\` (§4 RE-5)`,
        )
      }
      if (!rehome.thenIsSendReplyOnly) {
        problems.push(
          `MEMBER-2②-THEN: the \`handleRequest\` reply \`.then\` still carries work beyond \`bridge.sendReply(reply)\` — §1.1 member 2② reduces it to the send alone (the burst is RE-HOMED, never duplicated; a duplicated call is ALSO a second site under the probe)`,
        )
      }
      readings.push({ member: '2 · `src/renderer/renderer.ts` — the OPTION + THE BURST RE-HOME', subscribed, problems })
    }
  }

  // member 3 — the `DENIED-1` re-aim, in the landed 3a guard
  {
    const subscribed: string[] = []
    const problems: string[] = []
    const text = readMaybe(WRITE_GUARD_PATH)
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.1 member 3): ${relative(REPO_ROOT, WRITE_GUARD_PATH)} could not be read — the re-aim member has no substrate`)
    } else {
      // ⟶ REMAND F-9: the witness is driven BEHAVIOURALLY against the landed guard's own
      // predicate with a planted forgery corpus. Prose alone satisfies nothing.
      const reaim = deniedOneReaimReading(text, readMaybe(PANELS_PATH), readMaybe(RENDERER_PATH))
      for (const line of reaim.evidence) subscribed.push(line)
      if (!reaim.transcriptionIntact) {
        problems.push(
          `RE-AIM-TRANSCRIPTION (F-9): the landed 3a guard's LIVE \`DENIED-1\` push source(s) are ABSENT — [${reaim.missingPushes.join(', ')}] — §7 row 11's re-aim is carried by LIVE assertions, never by comments. THE REFERENCE PROBE (the supervisor's, REPRODUCED BY THIS PASS): strip all six live \`problems.push(\`DENIED-1 (RE-AIMED …\`)\`/\`problems.push(\`DENIED-1-REAIM-SURFACE …\`)\` limbs while keeping every COMMENT, and the prose-only witness stayed GREEN. A witness with zero teeth must not report a disposition`,
        )
      }
      if (!reaim.corpusAllRedden) {
        problems.push(
          `RE-AIM-CORPUS (F-9): a planted forgery was ADMITTED by the landed predicate — [${reaim.corpusMisses.join(' | ')}] — §7 row 11 assigns the surviving limbs the REQUIRED/POSITIONAL form, the \`Runtime\`-option path, a SECOND pane-cap site, a widened \`MUTATING_METHODS\` and a THIRD \`refreshDebug\` site; each planted forgery must REDDEN the LANDED guard's own predicate (the register's \`bareInequalityForgeryProblems()\` precedent)`,
        )
      }
      if (!reaim.landedClean) {
        problems.push(
          `RE-AIM-CONTROL (F-9): the FORGERY CORPUS's negative control FAILED — the UNMODIFIED landed bytes redden the transcribed predicate, so the oracle is an ALWAYS-REDDEN and discriminates nothing (§2.5's positive-control requirement, applied to the re-aim witness)`,
        )
      }
      if (!reaim.asFiledKept) {
        problems.push(
          `RE-AIM-VISIBILITY: the as-filed wording of the three regexes is DELETED — §7 row 11 requires the as-filed wording KEPT VISIBLE beside the re-aim (\`RCA-8(c)\` annotate-beside; a deleted guard or an unrecorded re-aim is a finding, \`K-2\`)`,
        )
      }
    }
    readings.push({ member: '3 · `tests/pd-store-security-write.test.ts` — THE `DENIED-1` RE-AIM', subscribed, problems })
  }

  // member 4 — the two new test files
  {
    const subscribed: string[] = ['the presence of the unit\'s TWO new test files']
    const problems: string[] = []
    for (const name of NEW_TEST_FILES) {
      if (!existsSync(join(HERE, name))) {
        problems.push(`MEMBER-4: the unit's test file \`tests/${name}\` is ABSENT — §1.1 member 4 lands BOTH (a guard with no register, or a register with no guard, leaves the unit's own instruments half-filed)`)
      }
    }
    readings.push({ member: '4 · the unit\'s TWO new test files', subscribed, problems })
  }

  return readings
}

/** §2.6 — THE `syncConfig()` SKIP-IF-UNCHANGED GUARD's reading at its mutation-building site.
 *  The guard is a PROPERTY over the site, so this reader looks for the guard's own observable
 *  shape: a comparison of the drawn value against the node's CURRENT value between the mutation
 *  build and the `apply` call (an `if` guarded by an equality/`Object.is`/`===` test whose body
 *  skips the draw). Several legal spellings are accepted so a correct landing is not reddened
 *  for choosing a different comparator. */
function syncConfigGuardReading(text: string): { present: boolean; evidence: string } {
  const at = text.indexOf('private syncConfig(')
  if (at < 0) return { present: false, evidence: 'syncConfig() is not readable at its declared site' }
  // the balanced body of the method
  const open = text.indexOf('{', at)
  let depth = 0
  let end = -1
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  if (end < 0) return { present: false, evidence: 'syncConfig()\u2019s body has no balanced close' }
  const body = text.slice(open, end)
  // a skip-if-unchanged guard: a comparison of the drawn value against a CURRENT value, and an
  // `apply` that is conditioned on the comparison (never issued unconditionally).
  const compares = /(===|!==|Object\.is)\s*\(?/.test(body) && /(current|existing|prev|already|unchanged|next)\w*/i.test(body)
  const conditionalApply = /(if\s*\(|\.length\s*>\s*0|break|continue)/.test(body.slice(Math.max(0, body.lastIndexOf('mutation.length'))))
  const skipShape = /Object\.is|!==|===/.test(body) && /(unchanged|equal|sameValue|noop|no-op|skip|suppress|guard)/i.test(body + text.slice(Math.max(0, at - 400), at))
  const present = (compares && conditionalApply) || skipShape
  const evidence = present
    ? 'a comparison of the drawn value against the node\u2019s current value gates the draw'
    : 'no comparison against a current value gates the draw \u2014 the `mutation.length > 0` site issues the apply unconditionally'
  return { present, evidence }
}

/** ⟶ REMAND F-7 — THE NOTIFY-CALLBACK PLACEMENT, READ STRUCTURALLY.
 *
 *  THE DEFECT. The as-filed reader probed a `slice(indexOf('bridge.onRequest('), +1200)` with a
 *  `[^}]*`-bounded alternative and a `<= 2` semicolon budget:
 *    - the fixed 1200-char slice is a WINDOW, so a lawful edit that moves the re-home a little
 *      further down (a longer comment, a re-wrapped callback) can push the call OUT of the
 *      window and redden a CORRECT landing;
 *    - `[^}]*` cannot cross a `}` — the callback body's own inner braces — so the alternative was
 *      brace-hostile;
 *    - the `<= 2` semicolon budget is a PROXY for "the `.then` does nothing else", which is not
 *      the property: a `.then` with one statement plus a comment, or with a nested object
 *      literal, moves the count without moving the property.
 *  A reader with a word/window proxy and a punctuation budget is measuring the SHAPE OF THE
 *  SOURCE rather than the PLACEMENT of the call.
 *
 *  THE REPAIR (the house `balancedBody` pattern, the same instrument the sibling uses for
 *  `ipcMain.handle`): walk the BALANCED body of `handleRequest(runtime, req, <callback>)`'s THIRD
 *  argument and assert the call is INSIDE that argument's own braces; then walk the balanced body
 *  of the reply `.then`'s callback and assert it is ABSENT there. Balanced reads are immune to
 *  both a longer body and an inner brace, so a correct re-home stays green however it is wrapped.
 *  Returns `null` when a container is unreadable, so a missing container is REPORTED rather than
 *  silently satisfied by a whole-file match. */
function balancedBodyAt(src: string, openIndex: number): string | null {
  if (openIndex < 0 || openIndex >= src.length) return null
  const open = src[openIndex]!
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

/** The THIRD argument's balanced callback body of the `handleRequest(runtime, req, …)` CALL — the
 *  notify callback's own braces. `null` when the call or the third argument cannot be read.
 *
 *  THE CALL, NOT THE DEFINITION: `renderer.ts` declares `function handleRequest(runtime, req,
 *  notify)` and CALLS it once (`void handleRequest(runtime, req, (p) => { … })`), so a bare
 *  `indexOf('handleRequest(')` reads the DEFINITION and its third argument is a bare identifier
 *  with no braces — which would silently read `null` on a correct landing. The search therefore
 *  takes the LAST occurrence, and the caller's `readable` flag makes a miss explicit rather than
 *  silently false. */
function notifyCallbackBody(text: string): string | null {
  const at = text.lastIndexOf('handleRequest(')
  if (at < 0) return null
  const argList = balancedBodyAt(text, text.indexOf('(', at))
  if (argList === null) return null
  // split the argument list on TOP-LEVEL commas only, so a comma inside a nested call/object does
  // not shift the index
  let depth = 0
  const args: string[] = []
  let current = ''
  for (const ch of argList) {
    if (ch === '(' || ch === '{' || ch === '[') depth++
    else if (ch === ')' || ch === '}' || ch === ']') depth--
    if (ch === ',' && depth === 0) {
      args.push(current)
      current = ''
      continue
    }
    current += ch
  }
  args.push(current)
  if (args.length < 3) return null
  const third = args[2]!
  const brace = third.indexOf('{')
  if (brace < 0) return null
  return balancedBodyAt(third, brace)
}

/** The reply `.then(...)`'s balanced callback body — scoped to the `.then` chained onto the
 *  `handleRequest(...)` CALL (not an unrelated later chain elsewhere in the file). */
function replyThenBody(text: string): string | null {
  const callAt = text.lastIndexOf('handleRequest(')
  if (callAt < 0) return null
  // the call's own balanced argument list, then the chained `.then(` immediately after it
  const argList = balancedBodyAt(text, text.indexOf('(', callAt))
  if (argList === null) return null
  const closeParen = text.indexOf('(', callAt) + argList.length + 1
  const thenAt = text.indexOf('.then(', closeParen)
  if (thenAt < 0) return null
  const thenArgs = balancedBodyAt(text, text.indexOf('(', thenAt))
  if (thenArgs === null) return null
  const brace = thenArgs.indexOf('{')
  if (brace < 0) return null
  return balancedBodyAt(thenArgs, brace)
}

/** §2.4 / §1.1 member 2② — THE BURST RE-HOME's STRUCTURAL reading (F-7). */
function burstRehomeReading(text: string): { inNotify: boolean; thenIsSendReplyOnly: boolean; readable: boolean } {
  const notifyBody = notifyCallbackBody(text)
  const thenBody = replyThenBody(text)
  if (notifyBody === null || thenBody === null) {
    return { inNotify: false, thenIsSendReplyOnly: false, readable: false }
  }
  const inNotify = /\brefreshDebug\b/.test(withoutComments(notifyBody))
  const thenCode = withoutComments(thenBody)
  const thenIsSendReplyOnly = /bridge\.sendReply\(\s*reply\s*\)/.test(thenCode) && !/\brefreshDebug\b/.test(thenCode)
  return { inNotify, thenIsSendReplyOnly, readable: true }
}

// ===========================================================================
// §7 row 11 — THE `DENIED-1` RE-AIM: THE WITNESS IS BEHAVIOURAL, NOT PROSE.
//
// ⟶ REMAND F-9 (the audit's REFERENCE-PROVED finding). The as-filed reader was a WORD TEST:
//   `leg3Scoped` = a bare `/(Runtime-option|Runtime\b[\s\S]{0,60}option|SECOND pane-cap|second
//   pane-cap|SCOPED|scoped)/i`, `leg2Inverted` satisfied by the word `INVERT` in a COMMENT, and
//   `leg1Nulled` = `!leg1AsFiledLive || leg1Disposition` where `leg1Disposition` was a bare
//   `/NULL/i` word test. PROVEN, not asserted: the supervisor stripped ALL SIX live
//   `problems.push(\`DENIED-1 (RE-AIMED …\`)` / `problems.push(\`DENIED-1-REAIM-SURFACE …\`)`
//   limbs from `tests/pd-store-security-write.test.ts` while keeping every COMMENT — and this
//   file stayed 6/6 GREEN. So prose alone satisfied every limb: the witness had ZERO TEETH and
//   was reporting a disposition it had not earned.
//
// THE REPAIR. Every limb is now proven BEHAVIOURALLY, by the SAME instrument the register uses
// correctly (`bareInequalityForgeryProblems()`): a PLANTED FORGERY CORPUS is driven through the
// LANDED guard's OWN PREDICATE, and each planted member must REDDEN. The predicate below is a
// FAITHFUL TRANSCRIPTION of the landed arms at `tests/pd-store-security-write.test.ts` §1.2
// item 1 — and the FIRST limb asserts that transcription is still faithful (the live
// `problems.push` sources must still exist), so a stripped guard reddens HERE rather than
// silently satisfying a prose test.
//
// WHAT MAKES EACH LIMB FAIL (anti-vacuity, stated per limb):
//   ① TRANSCRIPTION-FIDELITY — fails if the landed guard's six live `DENIED-1` push sources are
//      not all present (i.e. the very strip the reference probe performed).
//   ②–⑥ THE CORPUS — each planted forgery fails if the transcribed predicate does NOT redden on
//      it, i.e. the moment the landed limb loses its discrimination.
//   ⑦ THE NEGATIVE CONTROL — the UNMODIFIED landed bytes must NOT redden (a predicate that
//      always reddens would be as vacuous as one that never does).
//   ⑧ THE AS-FILED VISIBILITY — fails if the superseded wording was deleted (annotate-beside).
// ===========================================================================
/** The FIVE planted forgeries (REQUIRED BY THE REMAND), each a MUTATION of the landed bytes so
 *  the corpus is built from the real files rather than hand-written. A corpus member whose
 *  substrate is ABSENT fails loudly — a control with no substrate is NEVER a pass. */
interface Forgery {
  label: string
  subject: 'panels' | 'renderer'
  build: (panels: string, renderer: string) => { planted: string; ok: boolean; why: string }
}

const DENIED_ONE_FORGERIES: Forgery[] = [
  {
    label: '(a) a REQUIRED `maxJournalLength: number` member',
    subject: 'panels',
    build: (panels) => {
      // THE SUBJECT IS THE CONTAINER: `secure-panels.ts` ALSO carries an unrelated
      // `maxJournalLength?: number | null` inside the `window.provident.security.set(patch)`
      // bridge DECLARATION (line 45), and a bare file-wide `replace` lands on THAT one (MEASURED
      // BY THIS PASS: a first-occurrence replace produced no REDDEN, because it forged the bridge
      // type rather than the option). The forgery must therefore make the `SecurePanelsOptions`
      // MEMBER required, which is the shape §7 row 11② denies.
      const at = panels.indexOf('interface SecurePanelsOptions')
      const end = at < 0 ? -1 : panels.indexOf('}', at)
      if (at < 0 || end < 0) return { planted: panels, ok: false, why: 'the `SecurePanelsOptions` container was not found' }
      const container = panels.slice(at, end)
      const reforged = container.replace(/maxJournalLength\s*\?\s*:\s*number/, 'maxJournalLength: number')
      if (reforged === container) {
        return { planted: panels, ok: false, why: 'the container carries no optional `maxJournalLength?: number` to make REQUIRED' }
      }
      const planted = panels.slice(0, at) + reforged + panels.slice(end)
      return { planted, ok: planted !== panels, why: 'the REQUIRED forgery did not change the bytes' }
    },
  },
  {
    label: '(b) a positional second argument at a `new SecurePanels(` site',
    subject: 'renderer',
    build: (_panels, renderer) => {
      const planted = renderer + '\nconst zzPos = new SecurePanels(mount, paneOptions)\n'
      const ok = /new\s+SecurePanels\s*\(\s*[^,()]+,\s*[A-Za-z_$][\w$]*\s*\)/.test(withoutComments(planted))
      return { planted, ok, why: 'the planted positional call site did not read as positional' }
    },
  },
  {
    label: '(c) a SECOND `new SecurePanels(` pane-construction site',
    subject: 'renderer',
    build: (_panels, renderer) => {
      const planted = renderer + '\nconst zzSecond = new SecurePanels(otherMount, { moduleRunner })\n'
      const sites = [...withoutComments(planted).matchAll(/new\s+SecurePanels\s*\(/g)].length
      return { planted, ok: sites > 1, why: 'the planted second site did not raise the site count' }
    },
  },
  {
    label: '(d) `maxJournalLength` as a literal `MUTATING_METHODS` member',
    subject: 'renderer',
    build: (_panels, renderer) => {
      const planted = renderer.replace(/new\s+Set\(\[([^\]]*)\]\)/, (m, inner: string) => m.replace(inner, inner + ", 'maxJournalLength'"))
      const m = /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(withoutComments(planted))
      const ok = m !== null && /maxJournalLength/.test(m[1]!)
      return { planted, ok, why: 'the planted member did not land inside the MUTATING_METHODS literal' }
    },
  },
  {
    label: '(e) a THIRD `refreshDebug` occurrence',
    subject: 'renderer',
    build: (_panels, renderer) => {
      const planted = renderer + '\nfunction zzThird() { panels?.refreshDebug(runtime) }\n'
      const n = [...withoutComments(planted).matchAll(/refreshDebug/g)].length
      return { planted, ok: n !== 2, why: 'the planted third occurrence did not move the count off 2' }
    },
  },
]

/** THE LANDED GUARD'S OWN PREDICATE, TRANSCRIBED — see the block comment above. Every spelling
 *  here is copied from the live arms of `tests/pd-store-security-write.test.ts` §1.2 item 1 so a
 *  planted forgery is judged by the SAME instrument the landed guard uses. */
function deniedOneGuardProblems(panelsText: string, rendererText: string): string[] {
  const problems: string[] = []
  const body = withoutComments(panelsText)
  // limb ② INVERTED — the REQUIRED form. The landed spelling is
  //   `maxJournalLength\s*:\s*number(?![?\s|])` AND `!` an optional declaration ANYWHERE:
  // a conjunction that is VACUOUS against the realistic forgery. MEASURED BY THIS PASS: making
  // the member REQUIRED reddens NEITHER conjunct — the lookahead `(?![?\s|])` is unsatisfiable
  // at the declaration position (the character AFTER `number` is `\n`, which `\s` matches, so
  // the negative lookahead fails and the regex reads FALSE), and the "no optional anywhere"
  // conjunct ALSO stays false because `secure-panels.ts` carries an UNRELATED
  // `maxJournalLength?: number` inside the `window.provident.security.set(patch)` bridge
  // DECLARATION (line 45) — so the landed limb is inert twice over.
  //
  // THE SUBJECT IS THE CONTAINER, exactly as member 1① above already reads it: the option is the
  // member of `SecurePanelsOptions`, and the bridge patch type is NOT that subject. The
  // transcription therefore carries the landed limb ALONGSIDE the container-scoped reading, and
  // the corpus decides. (Reported to the supervisor as finding F-13: the landed guard's REQUIRED
  // limb has no teeth as written.)
  //
  // ⟶ `F-13` REPAIRED IN THE GUARD (annotate-beside, `RCA-8(c)`): the landed 3a guard's limb ②
  // is NOW CONTAINER-SCOPED, and this transcription tracks it. The AS-FILED landed spelling is
  // KEPT VISIBLE verbatim below as `landedRequiredAsFiled` so a later reader can see what was
  // superseded; its INERTNESS is MEASURED, never asserted — an arm (see the F-13 controls in
  // `tests/pd-store-security-write.test.ts` arm 6, CONTROL 4) requires the as-filed spelling to
  // ADMIT the positive forgery the repaired one REDDENS.
  // AS FILED, KEPT VISIBLE:
  //   const landedRequired = /maxJournalLength\s*:\s*number(?![?\s|])/.test(body) && !/maxJournalLength\s*\?\s*:/.test(body)
  const landedRequiredAsFiled = /maxJournalLength\s*:\s*number(?![?\s|])/.test(body) && !/maxJournalLength\s*\?\s*:/.test(body)
  const optionsBody = interfaceBody(body, 'SecurePanelsOptions')
  // THE REPAIRED LANDED LIMB — the terminator asks for `?` or `|` on the member's own line, so
  // `maxJournalLength: number` + a newline reads REQUIRED (the as-filed `(?![?\s|])` read that
  // ordinary form as non-matching). `landedRequiredAsFiled` stays in the expression so a
  // REVERTED guard still reddens here — the transcription tracks the guard, not a wish.
  const member = optionsBody === null ? null : /(^|[\n;])\s*maxJournalLength\s*(\??)\s*:/.exec(optionsBody)
  const landedRequiredRepaired =
    optionsBody !== null && member !== null && member[2] !== '?' && !/^[ \t]*\|/.test(optionsBody.slice((member.index ?? 0) + member[0].length))
  if (landedRequiredAsFiled || landedRequiredRepaired) {
    problems.push('DENIED-1-REQUIRED: `SecurePanelsOptions.maxJournalLength` is a REQUIRED member — the option is ADDITIVE-OPTIONAL (§7 row 11②)')
  }
  const positional = /new\s+SecurePanels\s*\(\s*[^,()]+,\s*[A-Za-z_$][\w$]*\s*\)/.test(body)
  if (positional) problems.push('DENIED-1-POSITIONAL: a positional second argument binds at a `new SecurePanels(` site')
  const rbody = withoutComments(rendererText)
  const runtimeCapShape = /new\s+Runtime\s*\(\s*\{[\s\S]{0,400}?maxJournalLength[\s\S]{0,400}?SecurePanelsOptions/.test(rbody)
  if (runtimeCapShape) problems.push('DENIED-1-RUNTIME-CAP: the `Runtime`-option path carries a pane-cap spelling')
  const paneConstructionSites = [...rbody.matchAll(/new\s+SecurePanels\s*\(/g)].length
  if (paneConstructionSites > 1) problems.push('DENIED-1-SECOND-SITE: ' + String(paneConstructionSites) + ' `new SecurePanels(` pane-construction sites')
  const mutating = /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(rbody)
  if (mutating !== null && /maxJournalLength/.test(mutating[1]!)) {
    problems.push('DENIED-1-REAIM-SURFACE: `maxJournalLength` is a literal `MUTATING_METHODS` member (§1.2 row 6)')
  }
  const refreshSites = [...rbody.matchAll(/refreshDebug/g)].length
  if (refreshSites !== 2) problems.push('DENIED-1-REAIM-SURFACE: `renderer.ts` carries ' + String(refreshSites) + ' `refreshDebug` occurrence(s) (§1.2 row 7)')
  return problems
}

interface ReaimReading {
  transcriptionIntact: boolean
  corpusAllRedden: boolean
  landedClean: boolean
  asFiledKept: boolean
  evidence: string[]
  missingPushes: string[]
  corpusMisses: string[]
}

/** The SIX live `DENIED-1` push sources the landed re-aim must still carry. Each is a literal
 *  fragment of the landed guard's own bytes; a strip of ANY of them is the reference probe's
 *  mutation, and it reddens limb ① HERE rather than satisfying a prose test. */
const LANDED_REAIM_PUSH_SOURCES = [
  'DENIED-1 (RE-AIMED ②, INVERTED)',
  'DENIED-1 (RE-AIMED ③, SCOPED)',
  'DENIED-1-REAIM-SURFACE',
] as const

function deniedOneReaimReading(text: string, panelsText: string | null, rendererText: string | null): ReaimReading {
  const body = withoutComments(text)
  const evidence: string[] = []
  const missingPushes: string[] = []
  const corpusMisses: string[] = []

  // ① TRANSCRIPTION-FIDELITY — the landed re-aim's LIVE push sources (never its prose) must all
  // still be present, counted as `problems.push(` occurrences (a push inside a comment is NOT a
  // live source: `body` is comment-free, which is exactly what makes this behavioural).
  for (const src of LANDED_REAIM_PUSH_SOURCES) {
    const live = body.includes('problems.push(`' + src) || body.includes("problems.push('" + src)
    if (!live) missingPushes.push(src)
  }
  const transcriptionIntact = missingPushes.length === 0
  evidence.push(`① the landed re-aim's LIVE push sources are present [${LANDED_REAIM_PUSH_SOURCES.length - missingPushes.length}/${LANDED_REAIM_PUSH_SOURCES.length}]${missingPushes.length > 0 ? ' — MISSING: ' + missingPushes.join(' | ') : ''}`)

  // ②–⑥ THE CORPUS — each planted forgery must REDDEN the landed predicate.
  if (panelsText === null || rendererText === null) {
    corpusMisses.push('SUBSTRATE: the forgery corpus could not be built (a source file could not be read)')
  } else {
    for (const f of DENIED_ONE_FORGERIES) {
      const built = f.build(panelsText, rendererText)
      if (!built.ok) {
        corpusMisses.push(`${f.label} — NO SUBSTRATE: ${built.why}`)
        evidence.push(`   ${f.label}: NO SUBSTRATE (${built.why})`)
        continue
      }
      const driven = f.subject === 'panels'
        ? deniedOneGuardProblems(built.planted, rendererText)
        : deniedOneGuardProblems(panelsText, built.planted)
      const reddened = driven.length > 0
      evidence.push(`   ${f.label}: ${reddened ? 'REDDENS' : 'ADMITTED'} (${driven.join(' · ') || 'no finding'})`)
      if (!reddened) corpusMisses.push(`${f.label} — the landed predicate did NOT redden on the planted forgery`)
    }
  }
  const corpusAllRedden = corpusMisses.length === 0

  // ⑦ THE NEGATIVE CONTROL — the UNMODIFIED landed bytes must read CLEAN.
  let landedClean = false
  if (panelsText !== null && rendererText !== null) {
    const clean = deniedOneGuardProblems(panelsText, rendererText)
    landedClean = clean.length === 0
    evidence.push(`⑦ the UNMODIFIED landed bytes: ${landedClean ? 'CLEAN (the predicate is not an always-redden)' : 'REDDENED — ' + clean.join(' · ')}`)
  } else {
    evidence.push('⑦ the UNMODIFIED landed bytes: NO SUBSTRATE')
  }

  // ⑧ THE AS-FILED VISIBILITY (annotate-beside): the superseded wording stays in the file.
  const asFiledKept = (text.match(/DENIED-1/g) ?? []).length >= 2 && /journalDepth/.test(text)
  evidence.push(`⑧ the as-filed \`DENIED-1\` wording is kept VISIBLE: ${String(asFiledKept)}`)

  return { transcriptionIntact, corpusAllRedden, landedClean, asFiledKept, evidence, missingPushes, corpusMisses }
}

// ===========================================================================
// ARM 2 — THE DENIED-SURFACE NEGATIVE over §1.2's THIRTEEN ROWS (§1.2; §3 `F-1`).
// Every row is SUBSCRIBED separately, so a landing that reddens one names it. EVERY row here is
// a NEGATIVE over bytes that exist at this head ⇒ the class is GREEN-ON-ARRIVAL (§4's
// no-other-red rule: a landing that reddens one of these has NOT landed this unit).
// ===========================================================================
interface DeniedReading {
  row: string
  problems: string[]
}

function deniedSurfaceReadings(): DeniedReading[] {
  const out: DeniedReading[] = []
  const panels = readMaybe(PANELS_PATH)
  const renderer = readMaybe(RENDERER_PATH)

  // §1.2 item 1 — no `src/main/**` byte (3a's realm, LANDED). This unit's executable arms are
  // TWO test files under `tests/`; a bare SET-READ on `README.md` would be an uncheckable claim,
  // so — exactly as the sibling guard's §1.2 item 11 arm does for the foundation tree — the
  // reading is RECORDED from the WALL's own subject: this guard's change-set census names FOUR
  // members, and a `src/main/**` cell is NOT among them. The ROW is SUBSCRIBED (the artifact set
  // is read and printed) and it reddens if this unit's declared artifacts name a `src/main/**`
  // cell as a member.
  {
    const problems: string[] = []
    const namedMain = [...CHANGE_SET_MEMBERS, ...NEW_TEST_FILES].filter((m) => /src\/main\//.test(m))
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSJ arm 2 [denied row 1]: the unit's declared members name ${namedMain.length} \`src/main/**\` cell(s) — §1.2 item 1 denies ANY byte of \`src/main/**\` (3a's realm, LANDED; the SPLIT boundary); the row is read from the WALL's own subject (this guard's declared change set), because a bare set-read would not be a checkable instrument`,
    )
    if (namedMain.length > 0) {
      problems.push(`DENIED-1-MAIN: a declared member names a \`src/main/**\` cell (${namedMain.join('; ')}) — §1.2 item 1 denies ANY byte of \`src/main/**\``)
    }
    out.push({ row: '1 · ANY byte of `src/main/**`', problems })
  }

  // §1.2 item 2 — no md5-pinned byte and no re-stated digest
  {
    const problems: string[] = []
    const theme = readMaybe(THEME_PIN_PATH)
    if (theme === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 2): ${relative(REPO_ROOT, THEME_PIN_PATH)} could not be read — the digest-table row has no substrate`)
    } else {
      const at = theme.indexOf('const UNTOUCHED_DIGESTS')
      const tableEnd = at < 0 ? -1 : theme.indexOf(']', at)
      const table = at < 0 || tableEnd < 0 ? '' : theme.slice(at, tableEnd)
      const rows = [...table.matchAll(/file:\s*'([^']+)'[^}]*?(restated:\s*'([^']+)')?[^}]*\}/g)].map((m) => ({ file: m[1]!, restated: m[3] ?? null }))
      const files = rows.map((r) => r.file)
      const missing = SEVEN_PINNED_FILES.filter((f) => !files.includes(f))
      // eslint-disable-next-line no-console
      console.log(
        `PD-SSJ arm 2 [denied row 2]: \`UNTOUCHED_DIGESTS\` carries ${files.length} file row(s) [${files.join(', ')}] — §7 row 11 names SEVEN (\`CENSUS\`: ${SEVEN_PINNED_FILES.length}, printed with their terms); missing: [${missing.join(', ') || 'none'}]; rows carrying a \`restated:\` field: [${rows.filter((r) => r.restated !== null).map((r) => `${r.file}→${String(r.restated)}`).join(', ') || 'none'}]`,
      )
      if (missing.length > 0) {
        problems.push(`DENIED-2-SUBSTRATE: the seven-row \`UNTOUCHED_DIGESTS\` census does not resolve [${missing.join(', ')}] — the pinned-byte negative has no complete substrate (§7 row 11's \`CENSUS\`: 7)`)
      }
      // THIS UNIT RE-STATES NO DIGEST. §2.2 declares a `journalDepth(): number` member over a
      // pane whose `Supervisor` this unit FEEDS, and §1.1 member 1 edits `secure-panels.ts`
      // UNCONDITIONALLY — so this unit does not move a byte of the seven pinned files and owes
      // the table NO row naming it (`O-11`'s digest cells are the SUPERVISOR's shell-bearing
      // instrument; §7 row 11 (1) DISCHARGED the `preload.ts` re-statement with 3a's commit).
      // The limb is therefore an UNCONDITIONAL negative, never an anti-quated one — it reddens
      // the moment this unit's name appears on a pinned row.
      const restatedByThisUnit = rows.filter((r) => /U-STORE-SECURITY-JOURNAL/.test(String(r.restated)))
      if (restatedByThisUnit.length > 0) {
        problems.push(
          `DENIED-2-RESTATEMENT: a \`UNTOUCHED_DIGESTS\` row is re-stated by THIS unit (${restatedByThisUnit.map((r) => r.file).join(', ')}) — §1.2 item 2 / §7 row 11: this unit moves NONE of the seven rows and re-states NO digest (amendment row 1 belongs to 3a, and the digest cells here are \`O-11\`-owed to the supervisor, not authored)`,
        )
      }
      // the two renderer files this unit DOES edit must not be rows of that table
      for (const p of ['src/renderer/secure-panels.ts', 'src/renderer/renderer.ts']) {
        if (files.includes(p)) {
          problems.push(`DENIED-2-SUBJECT: ${p} IS a row of \`UNTOUCHED_DIGESTS\` — §7 row 11 states that the two renderer files this unit edits are NOT rows of that table (a pinned renderer byte would make this unit's own authorized edit a digest violation)`)
        }
      }
    }
    out.push({ row: '2 · ANY md5-pinned byte / no re-stated digest', problems })
  }

  // §1.2 item 3 — no host-side trim
  {
    const problems: string[] = []
    const hosts = [panels, renderer].filter((t): t is string => t !== null)
    if (hosts.length === 0) problems.push(`ABSTRACT-SUBJECT (§1.2 item 3): neither renderer file could be read — the host-trim negative has no substrate`)
    for (const [i, text] of hosts.entries()) {
      const where = i === 0 ? 'secure-panels.ts' : 'renderer.ts'
      const body = withoutComments(text)
      if (/\.journal\s*\.splice\s*\(/.test(body)) {
        problems.push(`DENIED-3: \`journal.splice(\` appears in ${where} — §1.2 item 3 / ruling (a) FORBID the host-side trim (the engine's \`condense()\` is ONE synchronous critical section over THREE structures; a host splice of \`journal\` alone desynchronizes \`undoStack\`/\`redoStack\` — the four hazards H1–H4)`)
      }
      if (/\bjournal\s*=(?!=)/.test(body)) {
        problems.push(`DENIED-3: a \`journal =\` assignment appears in ${where} — §1.2 item 3 forbids the host trim (§3.2 I-7: no \`journal\` byte is assigned, spliced or filtered anywhere in the diff)`)
      }
      if (/\bundoStack\s*=(?!=)/.test(body)) {
        problems.push(`DENIED-3: an \`undoStack =\` assignment appears in ${where} — §1.2 item 3 forbids it (the stack is the ENGINE's; hazard H3 is the mutually inconsistent story a host trim tells)`)
      }
      if (/\bredoStack\s*=(?!=)/.test(body)) {
        problems.push(`DENIED-3: a \`redoStack =\` assignment appears in ${where} — §1.2 item 3 forbids it (D6's \`redoStack = []\` belongs to the engine's condense alone)`)
      }
      if (/applyJournalCap/.test(body)) {
        problems.push(`DENIED-3: a ported \`applyJournalCap\` analogue appears in ${where} — §1.2 item 3 / §0 S-P-2: the RH-3 proposal's (a) shape is WITHDRAWN BY RULING and never ported`)
      }
    }
    out.push({ row: '3 · a host-side trim (`journal`/`undoStack`/`redoStack`)', problems })
  }

  // §1.2 item 4 — no second `condense()`
  {
    const problems: string[] = []
    const hosts = [panels, renderer].filter((t): t is string => t !== null)
    for (const [i, text] of hosts.entries()) {
      const where = i === 0 ? 'secure-panels.ts' : 'renderer.ts'
      const body = withoutComments(text)
      if (/\bcondense\s*\(/.test(body)) {
        problems.push(`DENIED-4: a \`condense(\` call/definition appears in ${where} — §1.2 item 4 forbids a SECOND \`condense()\`; the host rides the ENGINE's option, it never re-implements D5/D6`)
      }
      if (/\bserializeSlice\b/.test(body)) {
        problems.push(`DENIED-4: \`serializeSlice\` is reached from ${where} — §1.2 item 4 forbids the base-snapshot serialize (the round-trip recipe is the engine's alone)`)
      }
      if (/baseBytes|journalBytes/.test(body)) {
        problems.push(`DENIED-4: the D5 size-guard's own tokens (\`baseBytes\`/\`journalBytes\`) appear in ${where} — §1.2 item 4 forbids a re-implementation of the D5 guard`)
      }
    }
    out.push({ row: '4 · a second `condense()` / the D5 re-implementation', problems })
  }

  // §1.2 item 5 — no new cap-authority constant
  {
    const problems: string[] = []
    if (panels === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 5): ${relative(REPO_ROOT, PANELS_PATH)} could not be read — the cap-constant negative has no substrate`)
    } else {
      const body = withoutComments(panels)
      // a NEW pane-cap literal: a numeric constant named like a journal cap that is NOT
      // `this.maxJournalLength` (the operator's value IS the pane value — the IDENTITY).
      //
      // THE SUBJECT IS NARROWED TWICE, and both narrowings are §1.2 item 5's OWN wording
      // ("no independent pane-cap LITERAL, no second THRESHOLD, no ENVIRONMENT read"):
      //   (i)  a template-literal constant (a handler/body STRING) is EXCLUDED — the landed
      //        `JOURNAL_LENGTH_BODY` is a `function (ctx) { … }` source string, not a cap;
      //        a flat name-shaped scan reddens on it and could never be satisfied.
      //   (ii) the initializer must be a NUMERIC literal/threshold (never a body string, never
      //        `this.maxJournalLength`, the ONE lawful source).
      const capLiterals = [...body.matchAll(/^[ \t]*(?:const|let)\s+([A-Z_$][A-Z_0-9$]*)\s*(?::[^=]+)?=\s*([0-9][0-9_]*)[ \t]*$/gm)]
        .filter((m) => /(JOURNAL|CAP)/.test(m[1]!))
        .map((m) => `${m[1]}=${m[2]!.trim()}`)
      if (capLiterals.length > 0) {
        problems.push(`DENIED-5: ${relative(REPO_ROOT, PANELS_PATH)} declares a cap-named constant [${capLiterals.join(', ')}] — §1.2 item 5 / dossier §1 row 2 (the IDENTITY): the pane value IS the operator's \`maxJournalLength\`; no independent pane-cap literal, no second threshold, no environment read`)
      }
      if (/process\.env|import\.meta\.env/.test(body)) {
        problems.push(`DENIED-5: ${relative(REPO_ROOT, PANELS_PATH)} reads an ENVIRONMENT value — §1.2 item 5 forbids an environment read as the cap's source (the pane value IS the operator's \`maxJournalLength\`)`)
      }
    }
    out.push({ row: '5 · a NEW cap-authority constant', problems })
  }

  // §1.2 item 6 — the notify predicate is UNWIDENED
  {
    const problems: string[] = []
    if (renderer === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 6): ${relative(REPO_ROOT, RENDERER_PATH)} could not be read — the predicate negative has no substrate`)
    } else {
      const body = withoutComments(renderer)
      const m = /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(body)
      if (m === null) {
        problems.push(`DENIED-6: \`MUTATING_METHODS\` is not readable at its declared site — §2.4 pins the predicate; a dropped predicate is §3.2 I-4's falsifier (§3 \`F-8\`)`)
      } else {
        const members = m[1]!.split(',').map((s) => s.trim().replace(/^'|'$/g, '')).filter(Boolean)
        const gained = members.filter((x) => !(MUTATING_MEMBERS as readonly string[]).includes(x))
        const lost = (MUTATING_MEMBERS as readonly string[]).filter((x) => !members.includes(x))
        // eslint-disable-next-line no-console
        console.log(
          `PD-SSJ arm 2 [denied row 6]: \`MUTATING_METHODS\` reads [${members.join(', ')}] — §2.4's SEVEN are [${MUTATING_MEMBERS.join(', ')}]; gained [${gained.join(', ') || 'none'}] · lost [${lost.join(', ') || 'none'}]`,
        )
        if (gained.length > 0) {
          problems.push(`DENIED-6: \`MUTATING_METHODS\` GAINS [${gained.join(', ')}] — §1.2 item 6 / §2.4: the predicate is UNWIDENED; \`'journal'\` STAYS a member and \`focus\` STAYS absent (\`focus\` in the set is §3.2 I-4's named falsifier)`)
        }
        if (lost.length > 0) {
          problems.push(`DENIED-6-LOST: \`MUTATING_METHODS\` LOSES [${lost.join(', ')}] — §1.2 item 6 says the set gains no member AND loses none (\`'journal'\` STAYS: undo/redo genuinely mutates the app graph)`)
        }
      }
      for (const absent of ABSENT_FROM_PREDICATE) {
        const re = new RegExp(`MUTATING_METHODS\\s*=\\s*new\\s+Set\\(\\[[^\\]]*'${absent.replace(/\./g, '\\.')}'`)
        if (re.test(body)) {
          problems.push(`DENIED-6-ABSENT: \`'${absent}'\` is a \`MUTATING_METHODS\` member — §1.2 item 6 / §2.4 name it as ABSENT (a read-only method in the predicate would widen it, §3.2 I-4)`)
        }
      }
      // the predicate must still be CONSULTED (a dropped predicate is a different failure)
      if (!/MUTATING_METHODS\.has\(\s*req\.method\s*\)/.test(body)) {
        problems.push(`DENIED-6-DROPPED: the notify predicate is not consulted at the reply site (\`MUTATING_METHODS.has(req.method)\`) — §2.4's boundary is \`iff reply.ok && MUTATING_METHODS.has(req.method)\`; a dropped predicate is §3.2 I-4's falsifier (§3 \`F-8\`)`)
      }
    }
    out.push({ row: '6 · a WIDENED notify predicate', problems })
  }

  // §1.2 item 7 — no THIRD `refreshDebug` site; not the SPAN form
  {
    const problems: string[] = []
    if (renderer === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 7): ${relative(REPO_ROOT, RENDERER_PATH)} could not be read — the occurrence probe has no substrate`)
    } else {
      const symbolCount = countRefreshDebug(renderer, 'symbol')
      const commentFree = countRefreshDebug(renderer, 'symbol')
      const literal = countRefreshDebug(renderer, 'literal')
      // eslint-disable-next-line no-console
      console.log(
        `PD-SSJ arm 2 [denied row 7 — THE OCCURRENCE PROBE]: symbol count ${symbolCount} \`refreshDebug\` occurrence(s) · comment-free ${commentFree} · single-literal (\`panels?.refreshDebug(\`) ${literal} — §2.5 pins EXACTLY TWO CALL SITES by SYMBOL (a third fails); the single-literal count is VACUOUS today (\`1\`) and the SPAN form is REJECTED BY NAME (the notify site lies INSIDE the \`replyRoute\` span)`,
      )
      if (symbolCount !== 2) {
        problems.push(
          `DENIED-7: the probe counts ${symbolCount} \`refreshDebug\` occurrence(s) over the comment-free body of \`renderer.ts\` — §2.5 pins EXACTLY TWO CALL SITES (the boot site inside \`if (panels)\` + the notify-callback site); a THIRD site is §3 \`F-9\` (§4 RE-5: at this head the call has not yet moved into the notify callback)`,
        )
      }
      // the COMMENT EXCLUSION's own reading: an occurrence in a COMMENT must not move the count
      const withComment = renderer + '\n// a prose mention of refreshDebug here must not move the count\n'
      const afterComment = countRefreshDebug(withComment, 'symbol')
      if (afterComment !== symbolCount) {
        problems.push(`DENIED-7-COMMENT: a prose mention of \`refreshDebug\` inside a comment MOVED the probe's count (${symbolCount} → ${afterComment}) — §2.5's COMMENT EXCLUSION is the probe's own property (the count is a count of CALL SITES)`)
      }
      // the probe's own VACUITY DEMONSTRATION — §2.5 states the two sites have DIFFERENT
      // SPELLINGS (the boot site `panels.refreshDebug(runtime)` inside `if (panels)`, the reply
      // site `panels?.refreshDebug(runtime)`), so a single-literal count is VACUOUS as an
      // oracle. It reads `1` TODAY and `1` at the landed head — this is the counterexample the
      // probe's BY-SYMBOL form exists to avoid, NOT a landing-driven assertion (§2.5: "a
      // single-literal count reads 1 TODAY and would be vacuous"). The oracle is the SYMBOL
      // count above; the literal is printed for the reading and is asserted only to be a
      // READABLE number.
      // eslint-disable-next-line no-console
      console.log(
        `PD-SSJ [the probe's vacuity counterexample]: the single-literal count reads ${literal} — §2.5's BY-SYMBOL subject is REQUIRED precisely because the two sites spell differently; the literal count is the VACUOUS form (§4 RE-5: ${literal} TODAY and ${literal} at the landed head)`,
      )
    }
    out.push({ row: '7 · a THIRD `refreshDebug` site / the SPAN form', problems })
  }

  // §1.2 item 8 — no `undoDepth` subject
  {
    const problems: string[] = []
    if (panels === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 8): ${relative(REPO_ROOT, PANELS_PATH)} could not be read — the subject negative has no substrate`)
    } else {
      const body = withoutComments(panels)
      const forbidden = ['undoDepth', 'redoDepth', 'undoStack', 'redoStack', 'journalEntries', 'totalEntries']
      for (const token of forbidden) {
        const re = new RegExp(`\\b${token}\\b`)
        if (re.test(body)) {
          problems.push(`DENIED-8: \`${token}\` appears in ${relative(REPO_ROOT, PANELS_PATH)} — §1.2 item 8 / §0 R-3 / §2.2: the seam's subject is \`this.supervisor.journal.length\` and NOTHING ELSE (\`undoDepth\` is the stack \`condense()\` TRUNCATES — a seam reading it is §3 \`F-4\`)`)
        }
      }
    }
    out.push({ row: '8 · an `undoDepth` subject', problems })
  }

  // §1.2 item 9 — no fake timers / fixed tick-count / `flush()`-alone settle in THIS unit's TESTS
  //
  // THE SUBJECT IS THE REGISTER ONLY (the `[T]` file that DRIVES the settle). THIS guard file is
  // EXCLUDED BY SCOPE, and the exclusion is a correctness requirement rather than a convenience:
  // the token list this row scans for (`vi.useFakeTimers` · a fake-timer advance · the
  // word "microtask" beside "condense") is CARRIED IN THIS FILE AS THE INSTRUMENT — the words
  // the scan LOOKS FOR appear here in the scan's own needles, so a self-inclusive scan reddens
  // on the tool that measures and can never be satisfied by any correct landing (the same
  // self-reference the sibling guard resolves by scanning a SUBJECT rather than itself).
  // The guard's OWN settle discipline is covered instead by ASSERTS_DRAIN_PRECEDENT below,
  // which requires THIS file to carry the landed `drain()` loop.
  {
    const problems: string[] = []
    for (const name of SETTLE_SCAN_TARGETS) {
      const text = readMaybe(join(HERE, name))
      if (text === null) {
        problems.push(`ABSTRACT-SUBJECT (§1.2 item 9): \`tests/${name}\` could not be read — the settle-protocol negative has no substrate`)
        continue
      }
      const body = withoutComments(text)
      if (/vi\.useFakeTimers/.test(body)) {
        problems.push(`DENIED-9: \`vi.useFakeTimers\` appears in \`tests/${name}\` — §1.2 item 9 / §2.3: fake timers are OUTSIDE (the condense is a MACROTASK scheduled by \`setTimeout(…, 0)\`; a faked clock settles the wrong mechanism)`)
      }
      if (/advanceTimersByTime|runAllTimers|vi\.runAllTicks/.test(body)) {
        problems.push(`DENIED-9-TICKS: a fixed tick-count settle appears in \`tests/${name}\` — §2.3 forbids a fixed tick-count claim as the settle`)
      }
      // the settle helper MUST be the landed drain() loop: `DRAIN_ROUNDS` awaits of setTimeout(0)
      if (!new RegExp(`setTimeout\\([^)]*,\\s*0\\s*\\)`).test(body)) {
        problems.push(`DENIED-9-SETTLE: \`tests/${name}\` carries no \`setTimeout(…, 0)\` await — §2.3 pins the settle to the landed \`drain()\` precedent (a loop of \`await new Promise((res) => setTimeout(res, 0))\`)`)
      }
      // a flush()-ONLY settle: `await flush()` with no drain loop after it
      const flushOnly = /await\s+\w*\.?flush\(\)\s*;?\s*$/m.test(body) && !/setTimeout/.test(body)
      if (flushOnly) {
        problems.push(`DENIED-9-FLUSH: \`tests/${name}\` settles on \`flush()\` ALONE — §2.3: \`hasPendingWork()\` does NOT include \`condenseScheduled\`, so a bare \`flush()\` returns BEFORE the deferred condense has run (§3 \`F-5\`; the live trap \`K-3\`)`)
      }
      // no "microtask" claim about the condense (the package defect's trap)
      if (/condense[^.\n]{0,80}microtask|microtask[^.\n]{0,80}condense/i.test(body)) {
        problems.push(`DENIED-9-MICROTASK: \`tests/${name}\` calls the deferred condense a "microtask" — §2.3 / §0 R-9: the engine's comments and \`.d.ts\` say microtask while the code is \`setTimeout(…, 0)\`, a MACROTASK (\`ENGINE-CONDENSE-MICROTASK-COMMENT-CONTRADICTS-SETTIMEOUT\`; the comment is a TRAP, never a spec source)`)
      }
    }
    out.push({ row: '9 · fake timers / a fixed tick-count / a `flush()`-alone settle', problems })
  }

  // §1.2 item 10 — no engine byte
  {
    const problems: string[] = []
    if (!existsSync(ENGINE_SUPERVISOR)) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 10): ${relative(REPO_ROOT, ENGINE_SUPERVISOR)} is ABSENT — the engine-integrity arm has no substrate`)
    } else {
      // the engine is UNPATCHED: its bytes still carry the MACROTASK scheduling the unit rides,
      // and still carry the D5 guard, the three-structure rewrite and the microtask COMMENT the
      // catalogued defect names. A patched engine moves these readings.
      const engine = readMaybe(ENGINE_SUPERVISOR) ?? ''
      const markers: Array<[string, RegExp]> = [
        ['the `setTimeout(…, 0)` deferral', /setTimeout\([^)]*,\s*0\s*\)/],
        ['the `M + 1` trigger', /maxJournalLength !== undefined && this\.journal\.length > this\.maxJournalLength/],
        ['the D5 size-guard skip', /condense-skipped-size/],
        ['the three-structure rewrite', /this\.journal\.splice\(0, preLen, marker\)/],
        ['the POST-splice `baseIds`', /new Set\(this\.journal\.slice\(1\)\.map\(\(e\) => e\.id\)\)/],
        ['the microtask COMMENT (the catalogued defect, KEPT VISIBLE)', /a microtask|microtask — never an inline/],
      ]
      const missing: string[] = []
      for (const [label, re] of markers) {
        if (!re.test(engine)) missing.push(label)
        // eslint-disable-next-line no-console
        console.log(`PD-SSJ arm 2 [denied row 10 — engine integrity]: ${label}: ${re.test(engine) ? 'PRESENT (UNPATCHED)' : 'ABSENT'}`)
      }
      if (missing.length > 0) {
        problems.push(
          `DENIED-10: the vendored engine's bytes MOVED — [${missing.join('; ')}] no longer read as landed in ${relative(REPO_ROOT, ENGINE_SUPERVISOR)} — §1.2 item 10 / §0 R-9 / \`K-3\`: the package defect is CATALOGUED (\`ENGINE-CONDENSE-MICROTASK-COMMENT-CONTRADICTS-SETTIMEOUT\`), NEVER PATCHED; NO \`node_modules/provident-ssr/**\` BYTE MAY MOVE (§3 \`F-12\`)`,
        )
      }
    }
    out.push({ row: '10 · any byte under `node_modules/provident-ssr/**`', problems })
  }

  // §1.2 item 11 — no MCP surface
  {
    const problems: string[] = []
    const srcTexts = srcFiles().map((p) => ({ path: p, text: readMaybe(p) ?? '' }))
    if (srcTexts.length === 0) problems.push(`ABSTRACT-SUBJECT (§1.2 item 11): no \`src/**\` file was readable — the MCP-surface negative has no substrate`)
    const thisUnitTouches = (p: string): boolean =>
      /secure-panels\.ts$|renderer\.ts$/.test(p)
    const candidates = srcTexts.filter((t) => thisUnitTouches(t.path))
    let scanned = 0
    for (const { path, text } of candidates) {
      scanned++
      const body = withoutComments(text)
      // a NEW MCP tool/group/resource/RpcMethod would name a `provident.` tool or a resource URI
      const toolNames = [...body.matchAll(/['"`](provident\.[a-z][\w.]*)['"`]/g)].map((m) => m[1]!)
      const uris = [...body.matchAll(/['"`](mcp:\/\/[\w\-./]+)['"`]/g)].map((m) => m[1]!)
      const unexpectedTools = toolNames.filter((n) => !/provident\.(security|ready|focus)/.test(n))
      if (unexpectedTools.length > 0) {
        problems.push(`DENIED-11: ${relative(REPO_ROOT, path)} names an MCP tool \`${unexpectedTools.join(', ')}\` — §1.2 item 11 forbids ANY new MCP surface (tool/group/resource/\`RpcMethod\`/IPC key); 3b authors none`)
      }
      const unexpectedUris = uris.filter((u) => u !== 'mcp://provident/app')
      if (unexpectedUris.length > 0) {
        problems.push(`DENIED-11-RESOURCE: ${relative(REPO_ROOT, path)} names the resource URI(s) [${unexpectedUris.join(', ')}] — §1.2 item 11 forbids a new MCP resource; the landed push URI is the single \`mcp://provident/app\``)
      }
    }
    if (scanned === 0) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 11): no \`src/renderer/secure-panels.ts\`/\`renderer.ts\` byte was readable — the MCP-surface negative has no substrate`)
    }
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ arm 2 [denied row 11]: scanned ${scanned} of this unit's two renderer files for an MCP tool/resource spelling — §1.2 item 11 denies any new MCP surface`)
    out.push({ row: '11 · any MCP surface', problems })
  }

  // §1.2 item 12 — NO production caller of `journalDepth()`
  {
    const problems: string[] = []
    const files = srcFiles()
    if (files.length === 0) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 12): no \`src/**\` file was readable — the production-negative has no substrate`)
    }
    let scanned = 0
    const callers: string[] = []
    const declared = new RegExp(`\\b${SEAM}\\s*\\(\\s*\\)\\s*:\\s*number`)
    for (const p of files) {
      const text = readMaybe(p)
      if (text === null) continue
      scanned++
      const body = withoutComments(text)
      const calls = [...body.matchAll(new RegExp(`\\b${SEAM}\\s*\\(`, 'g'))].length
      if (calls === 0) continue
      const isDeclarationFile = declared.test(body)
      // the DECLARATION itself is the one occurrence a correct landing has in `src/**`
      if (!isDeclarationFile || calls > 1) {
        callers.push(`${relative(REPO_ROOT, p)} (${calls} occurrence(s)${isDeclarationFile ? ', the declaration + a call' : ''})`)
      }
    }
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSJ arm 2 [denied row 12 — THE PRODUCTION-NEGATIVE]: scanned ${scanned} \`src/**\` file(s) for a \`${SEAM}(\` call site — §1.2 item 12 / §0 R-3: the seam is a TEST/VISIBILITY accessor of the \`debugText()\` class with NO production caller; offenders: [${callers.join(', ') || 'none'}]`,
    )
    if (callers.length > 0) {
      problems.push(`DENIED-12: a PRODUCTION caller of \`${SEAM}()\` exists — [${callers.join(', ')}] — §1.2 item 12: the seam is a TEST/VISIBILITY accessor (the \`debugText()\` class) and is NEVER called from shipped wiring (§3.2 I-5: the pane's \`#status\` text derives from the APP runtime's census/SSR, never from the pane's own journal)`)
    }
    out.push({ row: '12 · a production caller of `journalDepth()`', problems })
  }

  // §1.2 item 13 — no `vitest.config.ts` / lock byte
  {
    const problems: string[] = []
    const vitest = readMaybe(VITEST_CONFIG_PATH)
    if (vitest === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 13): vitest.config.ts could not be read — the config-byte negative has no substrate`)
    } else if (/security|journal/i.test(vitest)) {
      problems.push(`DENIED-13: \`vitest.config.ts\` names a security/journal surface — §1.2 item 13 denies any byte of it (the unit changes no runner configuration)`)
    }
    const lock = readMaybe(LOCK_PATH)
    if (lock === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 13): ${relative(REPO_ROOT, LOCK_PATH)} could not be read — the lock-byte negative has no substrate`)
    } else if (/"journal|journalDepth|maxJournalLength/i.test(lock)) {
      problems.push(`DENIED-13-LOCK: the lock names a journal surface — §1.2 item 13 / \`R-4\`: the lock is NOT extended by this unit`)
    }
    out.push({ row: '13 · `vitest.config.ts` / `vendor/foundation.lock.json`', problems })
  }

  return out
}

// ===========================================================================
// ARM 3 — THE `[H]` SURFACE PINS (§2.4/§2.5; §5.1 `P-SSJ-H-1`/`P-SSJ-H-2`): the occurrence
// probe's OWN readings and the predicate boundary's positive side, asserted from the landed
// bytes (the register drives the same subjects over a constructed pane).
// ===========================================================================
function surfacePinProblems(): string[] {
  const problems: string[] = []
  const renderer = readMaybe(RENDERER_PATH)
  if (renderer === null) {
    problems.push(`ABSTRACT-SUBJECT (§2.5): ${relative(REPO_ROOT, RENDERER_PATH)} could not be read — the surface pins have no substrate`)
    return problems
  }
  const body = withoutComments(renderer)

  // PIN 1 — the probe reads the two CALL SITES by SYMBOL (a third fails; see arm 2 row 7).
  const symbolCount = countRefreshDebug(renderer, 'symbol')
  // eslint-disable-next-line no-console
  console.log(`PD-SSJ arm 3 [P-SSJ-H-1]: the symbol count over the comment-free body reads ${symbolCount} (the pin is EXACTLY 2)`)
  if (symbolCount !== 2) {
    problems.push(`PROBE: the symbol count reads ${symbolCount} — §2.5 pins EXACTLY TWO \`refreshDebug\` call sites (a third is §3 \`F-9\`)`)
  }

  // PIN 2 — the COMMENT-FREE reading is the probe's own requirement, and the exclusion STANDS
  // as a property (a later comment added near the site must not be able to move the count).
  const withComment = renderer + '\n// refreshDebug is mentioned in prose here\n'
  if (countRefreshDebug(withComment, 'symbol') !== symbolCount) {
    problems.push(`PROBE-COMMENT-EXCLUSION: a prose occurrence in a comment moved the count — §2.5 requires the comment-free body (the landed \`withoutComments\` precedent)`)
  }

  // PIN 3 — the `replyRoute` hoist's OWN reading: the per-reply call sits in the notify
  // callback and NOT in the `.then`.
  const rehome = burstRehomeReading(renderer)
  // eslint-disable-next-line no-console
  console.log(`PD-SSJ arm 3 [P-SSJ-H-1 pin 3]: the notify-callback placement: ${String(rehome.inNotify)}; the reply \`.then\` reduced to \`bridge.sendReply(reply)\`: ${String(rehome.thenIsSendReplyOnly)}`)
  // ---------------------------------------------------------------------------------------
  // PIN 3's CLASS — READ THROUGH, DELIBERATELY NOT ASSERTED HERE.
  //
  // The notify-callback PLACEMENT is a RED-BY-ABSENCE fact at this head: §4 RE-5 records it by
  // name ("the occurrence probe reads the pre-re-home arrangement … the probe's notify-callback
  // limb resolves nowhere"), and the register's row `P-SSJ-H-1` reading 3 carries it among its
  // declared term. If BOTH files asserted it, a single landing-driven red would be COUNTED
  // TWICE (once per file), and the DONE row's red census would overstate the red set — the
  // honesty class §4's no-other-red rule polices. This file therefore RECORDS the reading,
  // asserts the parts that are live at this head (the symbol count, the comment exclusion and
  // both positive controls), and LEAVES THE PLACEMENT ASSERTION TO THE REGISTER — the same
  // division of labour §1.1 member 4 declares, and the same one the sibling register applies to
  // its `[H]` rows.
  // eslint-disable-next-line no-console
  console.log(
    `PD-SSJ arm 3 [P-SSJ-H-1 pin 3 — READ THROUGH, not asserted here]: the notify-callback placement reads ${String(rehome.inNotify)} at this head; §4 RE-5 records the PRE-RE-HOME arrangement — the register's \`P-SSJ-H-1\` reading 3 owns this assertion`,
  )
  // THE POSITIVE CONTROL IS KEPT (it is not vacuous): the forged PRE-RE-HOME arrangement must
  // MOVE the placement reading, so the register's reader is shown discriminating.
  const forgedPreRehome = renderer.replace(/panels\?\.refreshDebug\(runtime\)/g, 'void 0')
  if (forgedPreRehome === renderer) {
    problems.push(`PROBE-CONTROL-SUBSTRATE: the forged PRE-RE-HOME corpus could not be built — the reply-site spelling \`panels?.refreshDebug(runtime)\` is not present, so the placement control has no substrate (a control with no substrate is NEVER a pass)`)
  } else if (rehome.inNotify && burstRehomeReading(forgedPreRehome).inNotify) {
    problems.push(`PROBE-CONTROL-REHOME: the forged PRE-RE-HOME corpus still read as PLACED — the placement reader is not discriminating (§2.5's positive control)`)
  }

  // PIN 4 — THE POSITIVE CONTROL: a synthetic THIRD site must redden the same oracle, and the
  // PRE-RE-HOME arrangement (the call in the `.then`) must redden the placement limb.
  const forgedThird = renderer + '\nfunction zz() { panels?.refreshDebug(runtime) }\n'
  if (countRefreshDebug(forgedThird, 'symbol') === 2) {
    problems.push(`PROBE-CONTROL: a forged THIRD \`refreshDebug\` site did NOT move the symbol count — the oracle is not discriminating (a probe that cannot redden on a third site is VACUOUS, §2.5)`)
  }
  const forgedThen = renderer.replace(/(\(\s*p\s*\)\s*=>\s*\{[^}]*refreshDebug[^}]*\})/, '(p) => { bridge!.notify(p) }')
  if (forgedThen !== renderer && burstRehomeReading(forgedThen).inNotify) {
    problems.push(`PROBE-CONTROL-REHOME: the forged PRE-RE-HOME arrangement (the call removed from the notify callback) still read as PLACED — the placement limb is not discriminating (§2.5's positive control)`)
  }
  // THE SPAN FORM IS REJECTED BY NAME: it would redden the legitimate re-home, because the
  // notify site lies INSIDE the `replyRoute` span.
  const spanCount = countRefreshDebug(renderer, 'span')
  // eslint-disable-next-line no-console
  console.log(
    `PD-SSJ arm 3 [P-SSJ-H-1 — THE SPAN FORM, rejected by name]: the span reader (\`replyRoute … refreshDebug\`) reads ${spanCount} — §2.5 / the foundation's \`NEW-1\`: the SPAN form is OUTSIDE because the notify site lies INSIDE the \`replyRoute\` span, so it would redden the legitimate re-home`,
  )

  // PIN 5 — THE PREDICATE BOUNDARY's positive side (§2.4 / §5.1 `P-SSJ-H-2`): the predicate is
  // consulted at the reply site, and `'journal'` is a member while `focus` is absent.
  if (!/if\s*\(\s*reply\.ok\s*&&\s*MUTATING_METHODS\.has\(\s*req\.method\s*\)\s*\)/.test(body)) {
    problems.push(`PREDICATE: the notify emit is not gated by \`reply.ok && MUTATING_METHODS.has(req.method)\` — §2.4's predicate boundary; the register drives its two sides over the constructed pane (§5.1 \`P-SSJ-H-2\`)`)
  }
  return problems
}

// ===========================================================================
// ARM 4 — THE PARK / LAYER-HONESTY ROW (§8 gate 6; §9 `O-8`; §6's honesty block; §5.1
// `P-SSJ-H-3`). The anti-overclaim row: no artifact of this unit claims durability, app-green,
// envelope-green, store-green, engine-green or live-green.
// ===========================================================================
/** ⟶ THE FULL NEGATOR SET (§6 / the sibling `P-SSW-H-4` precedent). A negator within a BOUNDED
 *  WINDOW of the matched vocabulary makes the line a LIMIT/PROHIBITION, never an assertion.
 *
 *  `nothing` is the term this pass ADDED (the measured false-positive class 2): `NOTHING here is
 *  app-green, …` is the unit's OWN layer header, and an `isLimit` test built from
 *  `no|not|never|…` alone misses the word `NOTHING` — `\bno\b` cannot match inside `nothing`
 *  (`no` is not a word there). The windowed-negation rule replaces that lexical accident with a
 *  PRINCIPLED set. */
const NEGATORS = /\b(not|never|no|nowhere|none|cannot|can't|isn't|doesn't|does not|without|nor|neither|nothing)\b/i
/** BOUNDED (200 chars either side, never the whole artifact) so a POSITIVE claim riding near an
 *  unrelated negation elsewhere can never be excused. */
const NEGATION_WINDOW = 200

/** A comment continuation: the windowed-negation rule is stated over the SENTENCE, and these
 *  artifacts wrap their comments, so a sentence routinely straddles two physical lines (MEASURED:
 *  this file's layer header puts `NOTHING here is app-green, envelope-green,` on line N and the
 *  tail `envelope-green, store-green, engine-green or live-green.` on line N+1). A line-bounded
 *  reader cannot see a negation the AUTHOR wrote in the same sentence, so the window is computed
 *  over the JOINED COMMENT PARAGRAPH. The join is restricted to the `//`/`*`/`/*` comment forms
 *  (a comment continuation, never a crossing into code) and the marker is replaced by a space so
 *  tokens cannot fuse across the join. */
function joinCommentParagraphs(text: string): string {
  return text
    .split('\n')
    .map((line) => (/^\s*(\/\/|\*|\/\*)/.test(line) ? line.replace(/^\s*(\/\/|\*|\/\*+)?/, ' ') : '\n' + line))
    .join('\u0000')
    .split('\u0000')
    .join('')
}

/** Strip this file's OWN instrument vocabulary out of a text before scanning it for an
 *  over-claim. The DURABILITY word list, the FIVE green tokens and the PARK status tokens are
 *  carried HERE as the words the scan LOOKS FOR — a scan that did not exempt its own
 *  vocabulary would redden on the tool that measures, never on a claim (the sibling's
 *  `P-SSW-H-4` precedent, and the gate-7 proofread's own lesson: the row must discriminate a
 *  PLANTED claim from a LAWFUL limit sentence).
 *
 *  ⟶ FIX (c) — THE EXCLUSION IS QUOTE-FORM-AGNOSTIC (the measured false-positive class 3). The
 *  as-filed strip was BACKTICK-BOUNDED while the SIBLING register declares the same needles
 *  SINGLE-QUOTE-BOUNDED, so each file's strip missed the OTHER's carrier and both files' needles
 *  were read as claims. A quote form is an incidental spelling of the instrument's own byte, so
 *  the strip now covers BOTH forms (and the SCREAMING-CASE token). The exclusion stays
 *  DELIMITER-BOUNDED so a PROSE over-claim (`durable`, `crash-safe`, `app-green`) is still SEEN. */
function withoutInstrumentVocabulary(text: string): string {
  let out = text
  for (const token of [...DURABILITY_TOKENS, ...FORBIDDEN_GREEN_TOKENS, ...PARK_STATUS_TOKENS]) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // QUOTE-FORM-AGNOSTIC: a backtick-quoted or single-quoted spelling (the word-list literal, in
    // EITHER file's form) is the instrument's own byte — never a claim.
    out = out.replace(new RegExp('`' + escaped + '`', 'gi'), '⟨VOCAB⟩')
    out = out.replace(new RegExp("'" + escaped + "'", 'gi'), '⟨VOCAB⟩')
  }
  return out
}

/** The over-claim scan: a PROSE sentence-of-record asserts a state this unit does not hold.
 *  The subject is a CLAIM shape — a durability verb/noun or a `<layer>-green` state asserted
 *  with an affirmative verb (is/are/now/landed/proven), not the mere presence of a word.
 *
 *  Three LAWFUL classes are EXEMPT, each by a PRINCIPLED rule (never phrase-patching):
 *    (a) WINDOWED NEGATION — a negator within `NEGATION_WINDOW` of the matched vocabulary in the
 *        joined comment paragraph ⇒ LIMIT/PROHIBITION (catches "no durability claim", "does NOT
 *        prove", and the class the as-filed `isLimit` MISSED: "**NOTHING** here is app-green, …").
 *    (b) A MARKDOWN LIMIT-LEDGER ROW — a table row under a header stating what the layer does NOT
 *        prove ⇒ a LIMIT CELL (the spec's §6 ledger). Keyed off the HEADER row and released at the
 *        table's end, so it can never excuse a claim written elsewhere.
 *    (c) THE INSTRUMENT'S OWN TOKEN CARRIERS — stripped quote-form-agnostically above.
 *  A POSITIVE claim still REDDENS. */
function overclaimProblems(text: string, where: string): string[] {
  const problems: string[] = []
  const joined = joinCommentParagraphs(withoutInstrumentVocabulary(text))
  // (b) A MARKDOWN LIMIT-LEDGER TABLE (see the header above).
  let inLimitTable = false
  // (d) THE INSTRUMENT'S OWN CONTROL CORPUS — the planted claims and lawful limits the mutation
  //     controls drive are CARRIED as literals, so their carrier lines must be exempt or the row
  //     reddens on its own falsifier corpus (a control that could not be written). The block is
  //     delimited by the `FORGED_CLAIM_CORPUS` declaration and its closing `]` line, keyed BY NAME
  //     so it can never excuse a claim outside the corpus. The scanned SUBJECTS (the spec, the
  //     park, the register) carry no such marker and therefore get NO exclusion at all.
  let inControlCorpus = false
  for (const line of joined.split('\n')) {
    if (line.includes('FORGED_CLAIM_CORPUS')) inControlCorpus = true
    if (inControlCorpus && /^\s*\]\s*$/.test(line)) inControlCorpus = false
    if (inControlCorpus) continue
    const tableRow = /^\s*\|/.test(line)
    if (!tableRow) {
      inLimitTable = false
    } else if (/\bnot\b/i.test(line) && /prove/i.test(line)) {
      inLimitTable = true
    }
    if (inLimitTable && tableRow) continue
    for (const token of [...DURABILITY_TOKENS, ...FORBIDDEN_GREEN_TOKENS]) {
      const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      if (!new RegExp(`\\b${escaped}\\b`, 'i').test(line)) continue
      // (a) WINDOWED NEGATION — the principled replacement for the as-filed `isLimit` list.
      const lower = line.toLowerCase()
      const at = lower.indexOf(token.toLowerCase())
      const window =
        at === -1
          ? lower
          : lower.slice(Math.max(0, at - NEGATION_WINDOW), Math.min(lower.length, at + token.length + NEGATION_WINDOW))
      if (NEGATORS.test(window)) continue
      if ((DURABILITY_TOKENS as readonly string[]).includes(token)) {
        problems.push(
          `HONESTY: ${where} asserts \`${token}\` in an AFFIRMATIVE line — §6's honesty block / §5.1 \`P-SSJ-H-3\`: NO DURABILITY CLAIM is made anywhere in this unit (it moves no byte on any durability axis, §1.2); the limit sentences are lawful, an affirmative claim is not`,
        )
      } else {
        problems.push(
          `HONESTY-GREEN: ${where} asserts \`${token}\` in an AFFIRMATIVE line — §6's honesty block: the layer is \`[T]\` over a CONSTRUCTED pane / \`[H]\` byte-scans ONLY; app/envelope/store/engine/live-green are NAMED NON-CLAIMS`,
        )
      }
    }
  }
  return problems
}

function parkHonestyProblems(): string[] {
  const problems: string[] = []
  // (1) the park artifact's PRESENCE + its status
  if (!existsSync(PARK_PATH)) {
    problems.push(
      `PARK-ABSENT: \`docs/specs/unit-store-security-journal-live-pending-battery.md\` does not exist — §8 gate 6 / §9 O-8: the park is NAMED (never parked-by-default, \`RCA-11\` clause (b)) and its artifact is owed with the landing; at this head the park artifact is OWED (§6's layer ledger: the live leg is \`[U]\` — a NAMED PARK)`,
    )
    return problems
  }
  const park = readMaybe(PARK_PATH) ?? ''
  const missingStatus = PARK_STATUS_TOKENS.filter((t) => !park.includes(t))
  // eslint-disable-next-line no-console
  console.log(`PD-SSJ arm 4 [P-SSJ-H-3 drive 1]: the park artifact reads ${park.split('\n').length} line(s); missing status token(s): [${missingStatus.join(', ') || 'none'}]`)
  if (missingStatus.length > 0) {
    problems.push(
      `PARK-STATUS: the park artifact does not carry [${missingStatus.join(', ')}] — §8 gate 6 / §9 O-8: it is marked \`OPEN / live-pending\` — NEVER green, NEVER DONE`,
    )
  }
  // (2) the park REASON: STRUCTURAL NON-EXERCISABILITY, never an absent session
  const reasonLine = park.split('\n').filter((l) => /reason|non-exercisab|park/i.test(l)).join('\n')
  if (!/structural/i.test(park)) {
    problems.push(
      `PARK-REASON: the park artifact does not name STRUCTURAL NON-EXERCISABILITY — §0 R-6 / §0 S-P-1 / the Status block: the reason is the structural identity of the two states ("stale because read-only" vs "stale because nothing changed" render IDENTICALLY), never an absent session`,
    )
  }
  if (/\bno (live )?session\b|\bno live session\b|\bnot run\b(?![\s\S]{0,80}structural)/i.test(reasonLine)) {
    problems.push(
      `PARK-REASON-SESSION: the park's reason reads as an ABSENT SESSION — §0 R-6 / \`RCA-11\` clause (b): parked-by-default is the failure mode the clause closes; the reason must be STRUCTURAL NON-EXERCISABILITY`,
    )
  }
  // (3) the no-durability / no-green token scan over this unit's artifacts
  const artifacts: Array<[string, string]> = []
  const specText = readMaybe(SPEC_PATH)
  if (specText !== null) artifacts.push([relative(REPO_ROOT, SPEC_PATH), specText])
  artifacts.push([relative(REPO_ROOT, PARK_PATH), park])
  const self = readMaybe(SELF_PATH)
  if (self !== null) artifacts.push([relative(REPO_ROOT, SELF_PATH), self])
  for (const name of NEW_TEST_FILES) {
    const t = readMaybe(join(HERE, name))
    if (t !== null && join(HERE, name) !== SELF_PATH) artifacts.push([`tests/${name}`, t])
  }
  for (const [where, text] of artifacts) problems.push(...overclaimProblems(text, where))
  // (3b) ⟶ THE MUTATION CONTROLS — the row's FALSIFIABILITY PROOF, driven here so the widening
  //      (fixes (a)/(b)/(c)) is shown to have NOT WEAKENED the property. The SAME predicate the
  //      scan above drives is re-driven over a PLANTED positive claim and over the LAWFUL limit
  //      lines it must keep admitting. A control that cannot fail is a finding; a widening that
  //      excused a real over-claim would be a WORSE one.
  //
  //      THE CORPUS IS THE INSTRUMENT'S OWN DATA (the sibling's `FORGED-CLAIM-CORPUS` precedent):
  //      the planted claims and the lawful limits below are CARRIED as literals — they must exist
  //      for the control to drive them — so every line of this block is a token carrier, never a
  //      claim of this unit's. It is marked and excluded BY NAME for exactly that reason; the
  //      SUBJECTS the scan polices (the spec, the park, the register) get no exclusion at all.
  const FORGED_CLAIM_CORPUS: Array<[string, string, boolean]> = [
    // [label, the planted artifact text, must it REDDEN?]
    ['the §6 over-claim the remand names', 'the write is crash-safe and durable on disk', true],
    ['an AFFIRMATIVE live-green claim', 'this unit is live-green and envelope-green', true],
    ['an AFFIRMATIVE app-green claim', 'the pane is app-green now', true],
    // the LAWFUL limits the widened predicate must keep ADMITTING (the false-positive classes)
    ['the §6 ledger LIMIT cell', '| Deliverable | The layer its evidence covers | What that layer does NOT prove |\n| --- | --- | --- |\n| the predicate boundary | **`[T]`/`[H]`** | app/envelope/store/engine/live-green |', false],
    ['a NOTHING-led limit line', 'NOTHING here is app-green, envelope-green, store-green, engine-green or live-green.', false],
    ['a quoted token carrier', "'durable',\n'crash-safe',", false],
  ]
  for (const [label, planted, mustRedden] of FORGED_CLAIM_CORPUS) {
    const driven = overclaimProblems(planted, 'the mutation control')
    const reddened = driven.length > 0
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ arm 4 [mutation control]: ${label} → ${reddened ? 'REDDENS' : 'ADMITTED'} (${String(driven.length)} finding(s)); required ${mustRedden ? 'REDDEN' : 'ADMIT'}`)
    if (mustRedden && !reddened) {
      problems.push(
        `CONTROL-VACUOUS (§6 / §5.1 \`P-SSJ-H-3\`): the anti-overclaim predicate ADMITTED the planted claim \`${planted}\` — the widening (the windowed negator set + the limit-table cell + the quote-form-agnostic carrier strip) has WEAKENED the property and can no longer see a real over-claim`,
      )
    }
    if (!mustRedden && reddened) {
      problems.push(
        `CONTROL-VACUOUS (§6 / §5.1 \`P-SSJ-H-3\`): the anti-overclaim predicate REDDENED on ${label} — \`${planted}\` is a LAWFUL limit/token-carrier the spec itself carries, so the row would redden on a correct landing`,
      )
    }
  }
  // (4) the LAYER statement's presence
  if (specText !== null) {
    const hasLayer = /\[T\][\s\S]{0,200}\[H\]/.test(specText) || /`\[T\]`[\s\S]{0,200}`\[H\]`/.test(specText)
    const hasHonesty = /HONESTY\/LIMITS|honesty block/i.test(specText)
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ arm 4 [P-SSJ-H-3 drive 4]: the spec's LAYER statement present: ${String(hasLayer)}; the HONESTY/LIMITS block present: ${String(hasHonesty)}`)
    if (!hasLayer) {
      problems.push(`LAYER: the spec carries no \`[T]\`/\`[H]\` layer statement — §6's layer ledger (\`RCA-12\`) requires each deliverable's layer named beside what that layer does NOT prove`)
    }
    if (!hasHonesty) {
      problems.push(`HONESTY-BLOCK: the spec carries no HONESTY/LIMITS block — §6's mandatory named non-claims`)
    }
  } else {
    problems.push(`ABSTRACT-SUBJECT (§6): ${relative(REPO_ROOT, SPEC_PATH)} could not be read — the layer/honesty row has no substrate`)
  }
  // (5) the `DENIED-1` re-aim's IN-COMMIT record
  const writeSpec = readMaybe(WRITE_SPEC_PATH)
  if (writeSpec === null) {
    problems.push(`ABSTRACT-SUBJECT (§7 row 11): ${relative(REPO_ROOT, WRITE_SPEC_PATH)} could not be read — the re-aim's in-commit record has no substrate`)
  } else {
    const reaimRecorded = /S-P-3|DISCHARGED IN THIS COMMIT|RE-AIM/i.test(writeSpec)
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ arm 4 [P-SSJ-H-3 drive 5]: the 3a spec records the \`DENIED-1\` re-aim in this commit: ${String(reaimRecorded)}`)
    if (!reaimRecorded) {
      problems.push(
        `RE-AIM-RECORD: \`docs/specs/unit-store-security-write.md\` carries no record of the \`DENIED-1\` re-aim — §7 row 11 / §0 S-P-3: the re-aim lands IN THIS UNIT'S OWN COMMIT with the red on record (\`K-2\`); a deleted guard or an unrecorded re-aim is a finding`,
      )
    }
  }
  return problems
}

// ===========================================================================
// §4 — THE RED-SET ANCHOR: the two landed-red facts this guard's arms answer to, read from
// their own subjects (never asserted from memory).
// ===========================================================================
function redSetAnchorProblems(): string[] {
  const problems: string[] = []
  // RE-6 (the PRE-RECORDED exemption): 3a's §1.2 item 1 arm is STILL LIVE at this head.
  const writeGuard = readMaybe(WRITE_GUARD_PATH)
  if (writeGuard === null) {
    problems.push(`RED-ANCHOR: ${relative(REPO_ROOT, WRITE_GUARD_PATH)} could not be read — the pre-recorded re-aim red has no substrate`)
  } else {
    const live = /if\s*\(\s*\/\\bjournalDepth\\s\*\\\(\/\.test\(body\)\s*\)/.test(withoutComments(writeGuard))
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSJ [RE-6 anchor]: the landed 3a guard's §1.2 item 1 arm is ${live ? 'STILL LIVE (the pre-recorded RE-6 red — it trips on 3b\'s authorized edit)' : 'RE-AIMED (RE-6 discharged in this commit)'}`,
    )
  }
  return problems
}

// ===========================================================================
// THE ARMS
// ===========================================================================
describe('PD-STORE-SECURITY-JOURNAL arm 1 — THE FOUR-MEMBER CHANGE-SET CENSUS (§1.1; §3 `F-1`)', () => {
  it('arm 1 — every member\'s own cell is subscribed (§1.1 members 1-4)', () => {
    const readings = changeSetReadings()
    const problems = readings.flatMap((r) => r.problems)
    for (const r of readings) {
      // eslint-disable-next-line no-console
      console.log(
        `PD-SSJ arm 1 [${r.member}]: ${r.problems.length === 0 ? 'SUBSCRIBED' : 'REDDENED'}\n    ${r.subscribed.join('\n    ')}${r.problems.length > 0 ? `\n    ${r.problems.join('\n    | ')}` : ''}`,
      )
    }
    recordArm(
      '1 · the FOUR-member change set',
      problems,
      'RED-BY-ABSENCE',
      'RECONCILED AGAINST THE LANDED TREE (A-3B-1 header notes; the as-filed note below is KEPT VISIBLE, annotate-beside RCA-8(c)). AS FILED at the pre-edit head: "the unit\'s four members are ABSENT at this head — `journalDepth()` resolves NOWHERE, `SecurePanelsOptions` has no `maxJournalLength`, the pane `Supervisor` is constructed without the option, the `syncConfig()` guard is not authored, the burst still sits in the `.then`, and the landed `DENIED-1` regexes are still AS FILED (the pre-recorded RE-6)". AT THIS HEAD: members 1 (option + Supervisor option + journalDepth + the syncConfig guard), 2 (the pane-construction option + the burst re-home) and 4 (both test files) are LANDED and read SUBSCRIBED; member 3 is the `DENIED-1` re-aim INSIDE the landed 3a guard, which is the IMPLEMENTER\'s in-commit act (§1.1 member 3 / §7 row 11) and is OUTSIDE A-3B-1\'s remit — so this arm is the ONLY residual red arm here and it is the pre-recorded RE-6 class, never a re-aim row',
    )
    expect(problems, `arm 1: ${problems.join(' | ') || 'all FOUR members of §1.1 subscribe'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-JOURNAL arm 2 — THE DENIED-SURFACE NEGATIVE over §1.2\'s THIRTEEN ROWS (§1.2; §3 `F-1`)', () => {
  it('arm 2 — all THIRTEEN denied rows read separately (rows 1/12 are RECORDED readings — see their console lines)', () => {
    const readings = deniedSurfaceReadings()
    const problems = readings.flatMap((r) => r.problems)
    for (const r of readings) {
      // eslint-disable-next-line no-console
      console.log(`PD-SSJ arm 2 [${r.row}]: ${r.problems.length === 0 ? 'held' : 'REDDENED'}${r.problems.length > 0 ? `\n    ${r.problems.join('\n    | ')}` : ''}`)
    }
    expect(readings.length, 'all THIRTEEN of §1.2\'s denied rows are subscribed (a row that is not read hides a denial)').toBe(13)
    recordArm(
      '2 · the THIRTEEN denied rows',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL (already true at this head): §1.2\'s DENIED surface is a NEGATIVE over bytes that exist now — no `src/main/**` cell, no digest re-statement, no host trim, no second `condense()`, no new cap constant, an unwidened predicate, two (not three) `refreshDebug` sites, no `undoDepth` subject, no fake timers, the engine UNPATCHED, no MCP surface, no production caller, no `vitest.config.ts`/lock byte. Never counted as a landing-driven red (§4); a landing that reddens one has NOT landed this unit',
    )
    expect(problems, `arm 2: ${problems.join(' | ') || 'every denied surface still reads as denied'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-JOURNAL arm 3 — THE `[H]` SURFACE PINS (§2.4/§2.5; §5.1 `P-SSJ-H-1`/`P-SSJ-H-2`)', () => {
  it('arm 3 — the occurrence probe (2 sites by SYMBOL, a third fails, the span form rejected) and the predicate boundary', () => {
    const problems = surfacePinProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ arm 3: ${problems.length} finding(s)${problems.length > 0 ? `\n    ${problems.join('\n    | ')}` : ''}`)
    recordArm(
      '3 · the `[H]` surface pins',
      problems,
      'RED-BY-SHIM',
      'RED-BY-SHIM (§4 RE-5): the occurrence probe reads the PRE-RE-HOME arrangement — the per-reply call still sits in the reply `.then`, so the probe\'s notify-callback limb resolves NOWHERE at this head (the symbol count itself reads its pre-re-home value; the re-home is what makes the placement limb green)',
    )
    expect(problems, `arm 3: ${problems.join(' | ') || 'the occurrence probe and the predicate boundary hold'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-JOURNAL arm 4 — THE PARK / LAYER-HONESTY ROW (§8 gate 6; §9 `O-8`; §6; §5.1 `P-SSJ-H-3`)', () => {
  it('arm 4 — the park artifact, its STRUCTURAL reason, the no-durability/no-green scan, the layer statement and the re-aim record', () => {
    const problems = parkHonestyProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ arm 4: ${problems.length} finding(s)${problems.length > 0 ? `\n    ${problems.join('\n    | ')}` : ''}`)
    // THE CLASS IS EARNED, NEVER DECLARED. A recordArm verdict of GREEN-ON-ARRIVAL asserts that
    // the arm's limbs are NEGATIVES already true at this head. Here they are NOT: the park
    // artifact is ABSENT (an `OWED` close-out deliverable, §9 `O-8`), so a blind
    // GREEN-ON-ARRIVAL label would be the exact over-claim this row exists to police. The class
    // is therefore COMPUTED from the reading.
    const parkAbsent = problems.some((pr) => pr.startsWith('PARK-ABSENT'))
    recordArm(
      '4 · the park / layer-honesty row',
      problems,
      parkAbsent ? 'RED-BY-ABSENCE' : 'GREEN-ON-ARRIVAL',
      parkAbsent
        ? 'RED-BY-ABSENCE (§4 RE-5 / §9 O-8): the park artifact `docs/specs/unit-store-security-journal-live-pending-battery.md` does NOT exist at this head — §8 gate 6 ships it at the unit\'s CLOSE-OUT, so its absence is this row\'s own landing-driven red; the no-durability/no-green scan and the layer statement DO hold at this head and are printed as their own readings, never as the class'
        : 'GREEN-ON-ARRIVAL: the park artifact is present with its status and its STRUCTURAL reason, the no-durability/no-green scan holds over every artifact, and the layer statement is present — all NEGATIVES already true (§6\'s honesty block)',
    )
    expect(problems, `arm 4: ${problems.join(' | ') || 'the park/layer-honesty row holds'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed verbatim for the DONE row.
// ===========================================================================
describe('PD-STORE-SECURITY-JOURNAL — the arm-verdict report and the head anchor', () => {
  it('the arm-verdict report: the FOUR arm-verdict REPORTS with their verdict classes — at this head 1 RED-BY-ABSENCE (arm 1) · 1 RED-BY-SHIM (arm 3) · 2 (arm 2, arm 4) classified GREEN-ON-ARRIVAL', () => {
    // eslint-disable-next-line no-console
    console.log(
      '\nPD-STORE-SECURITY-JOURNAL GUARD — ARM-VERDICT REPORT (the RED RUN at the pre-edit head)\n' +
        ARM_VERDICTS.map((v) => `  arm ${v.arm}: ${v.verdict} — ${v.note}${v.limbs.length > 0 ? `\n      limbs: ${v.limbs.slice(0, 3).join('\n      | ')}` : ''}`).join('\n') +
        '\nEND PD-STORE-SECURITY-JOURNAL ARM-VERDICT REPORT',
    )
    expect(ARM_VERDICTS.length, 'all FOUR arm-verdict reports (arm 1 · arm 2 · arm 3 · arm 4) — every guard arm reports its reading, and a report that does not cover them all hides a classification').toBe(4)
    const byClass = (c: ArmVerdict): number => ARM_VERDICTS.filter((v) => v.verdict === c).length
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSJ arm classes at this head: RED-BY-ABSENCE ${byClass('RED-BY-ABSENCE')} · RED-BY-SHIM ${byClass('RED-BY-SHIM')} · GREEN-ON-ARRIVAL ${byClass('GREEN-ON-ARRIVAL')} · GREEN ${byClass('GREEN')} · SKIPPED ${byClass('SKIPPED')}`,
    )
    expect(byClass('GREEN-ON-ARRIVAL') + byClass('GREEN'), 'the GREEN-ON-ARRIVAL/GREEN arms are EXPLICITLY MARKED as such — a negative/denial arm already true at this head is never counted as a landing-driven red (§4)').toBeGreaterThanOrEqual(1)
    expect(byClass('RED-BY-ABSENCE') + byClass('RED-BY-SHIM'), 'the landing-driven reds are the arms whose subject this unit creates (arm 1\'s four members, arm 3\'s re-home) — reported RED, never as green (§4 RE-1..RE-5)').toBeGreaterThan(0)
    expect(byClass('GREEN'), 'no arm is unconditionally GREEN at this head — a GREEN here would mean the arm lost its subject (§4)').toBe(0)
    // the sibling register must exist (member 4); its PRESENCE is this guard's own reading.
    expect(existsSync(REGISTER_PATH), `the sibling register (\`tests/${relative(HERE, REGISTER_PATH)}\`) is member 4 of §1.1's change set and must exist`).toBe(true)
  }, 12_000)

  it('the §4 red-set anchor: the pre-recorded RE-6 landed red is READ from its own subject (recorded, never scored)', () => {
    const problems = redSetAnchorProblems()
    // THE CLASS IS READ-THROUGH, DELIBERATELY: the PRE-RECORDED `RE-6` red is §4's OWN exemption
    // and is already a counted landing-driven red inside arm 1's member-3 cell (the re-aim has
    // not landed). Asserting it a SECOND time here would double-count one red under two ids —
    // exactly the overstatement §4's no-other-red rule exists to prevent. This block therefore
    // reports the reading and asserts only that its SUBJECT is readable (the anchor exists), so
    // the DONE row can cite it without the census moving.
    // eslint-disable-next-line no-console
    console.log(`PD-SSJ red-set anchor (RE-6): ${problems.length === 0 ? 'the landed `DENIED-1` red is READ from its own subject (see the console line above) — §4\'s PRE-RECORDED exemption, counted ONCE, in arm 1 member 3' : problems.join(' | ')}`)
    expect(problems, `red-set anchor: ${problems.join(' | ') || 'the pre-recorded RE-6 red has a readable subject'}`).toEqual([])
  }, 12_000)
})
