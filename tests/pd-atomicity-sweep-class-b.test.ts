// tests/pd-atomicity-sweep-class-b.test.ts — UNIT `U-ATOMICITY-SWEEP-CLASS-B` — THE PER-UNIT
// DRIVEN SUITE: the atomic five-step write on BOTH carriers over an INJECTED `fs` façade, the
// five failure legs, the tmp lifecycle, the live-path-never-written-directly rule, the READ-PATH
// DISTINGUISHABILITY requirement, the receipt/reader rules (including the engine carrier's
// NO-RECEIPT disposition), the denied-surface negative and the md5 re-statement limbs.
//
// SOURCE OF EVERY ASSERTION (spec ONLY — the 3a/3b sibling suites are SHAPE sources ALONE; no
// id, term, seed, fixture or strategy is inherited here — `docs/specs/unit-atomicity-sweep-class-b.md`
// §5.1: "NO id, term, seed, strategy or layer is inherited from the foundation's register or
// from any sibling's"):
//   docs/specs/unit-atomicity-sweep-class-b.md
//     §0.1 V-1..V-10  the vocabulary: the ATOMIC FIVE-STEP WRITE (call order/count asserted over
//                     an injected façade, NEVER a durability guarantee) · the ADDITIVE-OPTIONAL
//                     injected `fs` façade · the closed TWO-FORM RECEIPT · the LIVE PATH (never
//                     the tmp) · the NON-FATAL POSTURE (the RETENTION, never a silent absorber) ·
//                     the FIELD-WISE TOTALITY of `sanitize` · the seven-row `UNTOUCHED_DIGESTS`
//                     table + the DERIVED `UNRESTATED_CONTROL_PATH` · the row's own re-statement
//                     LICENCE · the `--provident-user-data=` seam · the three `main.ts`
//                     construction sites
//     §1.1 members 1-6  THE ONE ATOMIC COMMIT'S SIX MEMBERS. A landing that moves a DIFFERENT
//                     member set, or lands across more than one commit, is §4 `F-1`.
//     §1.2 items 1-13   THE THIRTEEN DENIED ROWS (no `src/renderer/**` byte; no preload byte; no
//                     `main.ts` byte; no payload move / no `file.settings.*` token; no
//                     `schemaVersion`; no carrier change; no `security-store.ts` byte; no
//                     declared-root extension; no MCP surface; no `scripts/**`/`vitest.config.ts`/
//                     `package.json`/lock byte; no `set()` return-shape change; no page-design
//                     artifact; no other unit's bytes)
//     §2.1 S-1..S-7     the two carriers' declared surfaces: `createOperatorSettingsStore` /
//                     `createEngineConfigStore` (signatures UNCHANGED; the OPTIONS type gains the
//                     optional member) · `get()` (UNCHANGED) · `set(…)` (RETURN SHAPE UNCHANGED) ·
//                     `lastWriteReceipt()` (NEW on the operator carrier, `null` ONLY before the
//                     first write attempt) · `lastReadWasCorrupt()` (NEW on the operator carrier) ·
//                     the façade (NEW on BOTH) · `OperatorSettingsWriteReceipt` (NEW, homed HERE,
//                     self-contained, NO import)
//     §2.1 params       the parameter-semantics rows: `opts.path` (a non-empty string; an EMPTY
//                       path / an uncreatable parent / a DIRECTORY answers the refusal path,
//                       NEVER a throw) · `opts.fs` (an object or absent ⇒ the real `node:fs`; a
//                       PARTIAL object is NOT a supported seam but is not a crash) · `patch`
//                       (unchanged domain) · `baseUrl` (unchanged domain) · both new members
//                       declare exactly ONE parameter — none
//     §2.2              THE WRITE: `mkdirSync(dirname,{recursive:true})` → tmp write →
//                       `fsync(tmp)` → `renameSync(tmp, path)` → `fsync(dir)`, IN ORDER, ONCE
//                       EACH; the tmp fate (no residue on success; a stale tmp OVERWRITTEN and
//                       NEVER parsed; the boot read reads the REAL PATH ONLY); the fd discipline
//     §2.3 ①/②/③/④      THE RECEIPT READER RULING, per carrier: the OPERATOR carrier MINTS
//                       `lastWriteReceipt()` (its reader); the ENGINE carrier MINTS NOTHING (its
//                       distinguishing signal is PERSISTED). The CLOSED two-form union and the
//                       CLOSED one-token reason set. NEITHER receipt type is imported from
//                       `src/main/security-store.ts`.
//     §2.4 m-1..m-11    THE FAIL-STATE TABLE — every documented fail-state, one row each
//     §2.5 ①/②/③/④      THE READ-PATH DISTINGUISHABILITY REQUIREMENT: the as-filed overstatement
//                       KEPT VISIBLE beside the CORRECTED reading (an ARBITRARY SUBSET reverts);
//                       the EXACT per-carrier disambiguation; and WHAT THIS IS NOT
//     §2.6 P-1..P-8     THE FAÇADE — the eight declared legs, ADDITIVE-OPTIONAL, INERT by default
//     §2.7 C-1..C-9     the figures: nine operator members · one engine member · the seven-row
//                       table · the control's derived path · the byte-identical carrier set
//     §3.1/§3.2         THE INVARIANT and the rules I-1..I-12
//     §4 RE-1..RE-7     THE RED SET — each limb's red, its arm class, and the no-other-red rule
//                       with `RE-5` PRE-RECORDED and EXEMPT-IN-ADVANCE
//     §5.1/§5.2/§5.3    the register's seed/terms/caps live in the SIBLING register file; THIS
//                       file carries the driven limbs those rows subscribe
//     §6.1/§6.2         the layer ledger and the live leg's ORDER claim form
//     §7 1..12          THE HONESTY/LIMITS BLOCK — the twelve named non-claims
//
// LAYER (`RCA-12` / §6.1, binding). `[T]` constructed stores + `[H]` byte-scan ONLY.
// **NO DURABILITY CLAIM IS MADE ANYWHERE IN THIS FILE.** The atomic five-step is asserted as a
// CALL ORDER/COUNT over an INJECTED `fs` FAÇADE — the `fsync` legs are asserted as INVOCATIONS,
// never as a completed crash-safe persist, never as a crash-recovery outcome, and never as bytes
// surviving a power loss. NOTHING here is app-green, envelope-green, store-green or live-green;
// the ONLY reading that reaches the assembled layer is §6's `[U]` restart round-trip, which is an
// ORDER claim (write → restart → observed) and lives in its own artifact, not in this file.
//
// THE WALL: this file touches NOTHING but its own bytes. No `src/**` byte, no landed test file
// (the md5 row is READ, never edited — its re-statement is the IMPLEMENTER's in-commit act per
// §1.1 member 4 / `O-4`), no spec/tracker byte, no `vitest.config.ts`/`package.json` byte.
//
// ===========================================================================
// RED-FIRST (`RCA-1`) — THE HEAD STATE THIS FILE IS WRITTEN AGAINST.
// `tests/atomicity-sweep-class-b-register.test.ts` owns the register rows and their declared
// terms; THIS file owns the driven limbs. At the pre-edit head:
//   · `src/main/operator-settings-store.ts` `persist()` is `mkdirSync(dirname,{recursive:true})`
//     → `writeFileSync(opts.path, …)` DIRECT AGAINST THE LIVE PATH inside a `try/catch` whose
//     `catch` is EMPTY. `OperatorSettingsStoreOptions` has no `fs` member.
//   · `src/main/engine-config.ts` is the BYTE-IDENTICAL DEFECT.
//   · `lastWriteReceipt` / `lastReadWasCorrupt` / `OperatorSettingsWriteReceipt` /
//     `OperatorSettingsFs` / `EngineConfigFs` resolve NOWHERE.
// Every limb that needs one of those reddens BY ABSENCE or BY SHIM, and the two carriers are
// driven through an ADAPTER that never mutates `src/**` (see `driveCarrier`).
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
const THEME_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const SELF_PATH = join(HERE, 'pd-atomicity-sweep-class-b.test.ts')

/** §1.1 member 4 / `S-P-3` / `O-4` — THE SUPERSEDED LITERAL the re-statement must keep VISIBLE,
 *  and the unit the re-statement's `restated` field must name. Both are the SPEC's own figures
 *  (`§2.7 C-9` records the superseded literal; `§1.1` member 4 records the unit name). */
const SUPERSEDED_OPERATOR_MD5 = '11841179e004f22dd758edbe927f1a40'
const RESTATING_UNIT = 'U-ATOMICITY-SWEEP-CLASS-B'

/** §2.7 `C-4` — the control's DERIVED resolution after this unit's re-statement. */
const DERIVED_CONTROL_AFTER = 'src/shared/demo-envelope.ts'

/** §2.6 P-1..P-8 — THE EIGHT DECLARED FAÇADE LEGS (a CENSUS: 8, printed with its terms). */
const FACADE_LEGS = ['mkdirSync', 'writeFileSync', 'openSync', 'fsyncSync', 'closeSync', 'renameSync', 'readFileSync', 'existsSync'] as const
type FacadeLeg = (typeof FACADE_LEGS)[number]

/** §2.2 — THE ATOMIC FIVE-STEP, IN ORDER. The `mkdir` leg is CONDITIONAL in 3a's landed shape
 *  (`mkdirSync(dirname, {recursive:true})` runs once but is projected out of the unconditional
 *  sequence exactly as the sibling register does); the four unconditionals run ONCE EACH. */
const UNCONDITIONAL_STEPS = ['writeTmp', 'fsyncTmp', 'rename', 'fsyncDir'] as const
type AtomicStep = (typeof UNCONDITIONAL_STEPS)[number] | 'mkdir'

/** §2.3 ③ — THE CLOSED RECEIPT FORM: two statuses, one reason token. */
const RECEIPT_STATUSES = ['committed', 'refused'] as const
const RECEIPT_REASONS = ['write-failed'] as const

/** §2.5 ① — THE AS-FILED OVERSTATEMENT, KEPT VISIBLE (never deleted). */
const AS_FILED_SYMPTOM = 'a torn write silently resets the operator\u2019s layout/tabs/theme'
/** §2.5 ② — THE CORRECTED, OPERATIVE READING. */
const CORRECTED_SYMPTOM = 'an ARBITRARY SUBSET of the fields reverts to first-run, silently, with no receipt'

/** §2.7 `C-1` — the operator payload is NINE members (a CENSUS: 9, printed with its terms). */
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

/** §2.7 `C-3` — the `UNTOUCHED_DIGESTS` table is SEVEN rows (a CENSUS: 7). */
const UNTOUCHED_ROW_CENSUS = 7

// ===========================================================================
// THE INSTRUMENTS (each limb PRINTS its instrument).
//   (1) THE INJECTED `fs` FAÇADE — a CALL RECORDER over the eight declared legs (§2.6). It
//       models NO durability, NO `fsync` completion and NO crash recovery; it records the calls
//       the subject makes and the ORDER it makes them in.
//   (2) THE BYTE-SCAN SURFACE PINS — the `[H]` class (the source modules, `main.ts`'s
//       construction sites, the denied surface, the md5 row of the theme register).
//   (3) THE REAL-`node:fs` ROUND TRIP — the ABSENT-façade inertness drive, taken inside a
//       per-process-unique temp root so no drive can mint a file in the working tree.
// ===========================================================================
const FIXTURE_ROOT = mkdtempSync(join(tmpdir(), `provident-asw-${process.pid}-`))
afterAll(() => {
  try {
    rmSync(FIXTURE_ROOT, { recursive: true, force: true })
  } catch {
    /* the unique root is the contract; the drain is best-effort */
  }
})

interface FsCall {
  leg: FacadeLeg
  /** what the leg was called ON (a path, or `fd:<n>`) */
  target: string
  step: AtomicStep | null
}

/** §2.6 — THE FAÇADE. Every declared leg is supplied (the complete-seam shape); each is
 *  INDEPENDENTLY throwable through `failAt`. */
interface FsFacade {
  calls: FsCall[]
  /** the in-memory file table: path → bytes */
  files: Map<string, string>
  /** the in-memory directory table */
  dirs: Set<string>
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

function newFsFacade(options?: { failAt?: FacadeLeg | null; seed?: Record<string, string> }): FsFacade {
  const files = new Map<string, string>(Object.entries(options?.seed ?? {}))
  const dirs = new Set<string>()
  const calls: FsCall[] = []
  // ⟨CORRECTED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, THE INJECTION MECHANISM.⟩
  // THE DEFECT (as filed, KEPT VISIBLE): this line read `const failAt = options?.failAt ?? null` and
  // the `boom` predicate CLOSED OVER THAT CONSTRUCTOR-TIME COPY, while the drive setters write
  // `facade.failAt` as a POST-CONSTRUCTION PROPERTY ASSIGNMENT (`driveCarrierWithPath` line ~1024:
  // `facade.failAt = options.failAt`). The façade therefore read the closure copy, NOT the mutable
  // property — SO NO LEG EVER THREW, every failure-leg drive SUCCEEDED, and the live path legitimately
  // moved. The limbs were measuring a drive that never took the leg under test.
  // THE CORRECTION: ONE SOURCE OF TRUTH — the property itself. `boom` reads `facade.failAt` at CALL
  // TIME, which is the SAME cell the setters write, so a constructor-supplied `failAt` and a
  // post-construction assignment are indistinguishable to the legs (as they must be: the drive uses
  // both spellings). THE LEG LIST AND THE SEEDING ARE UNCHANGED. This is NOT a relaxation: every
  // failure leg is still driven, and a limb whose expectation is forged reddens exactly as before.
  // THE INJECTION PREDICATE — ONE SOURCE OF TRUTH: it reads the façade's OWN mutable `failAt`
  // property at CALL TIME, so a constructor-supplied `failAt` and the post-construction assignment
  // `facade.failAt = …` (`driveCarrierWithPath`) BOTH reach the legs. Nothing else about the leg set
  // changed: the eight legs, their recorded targets and the seeding are exactly as filed.
  const boom = (leg: FacadeLeg, target: string): void => {
    if (facade.failAt === leg) throw new Error(`INJECTED-FAILURE at ${leg} (${target})`)
  }
  const facade: FsFacade = {
    calls,
    files,
    dirs,
    failAt: options?.failAt ?? null,
    mkdirSync: (path) => {
      calls.push({ leg: 'mkdirSync', target: path, step: 'mkdir' })
      boom('mkdirSync', path)
      dirs.add(path)
    },
    writeFileSync: (path, data) => {
      // The TMP WRITE leg (step 2). A write whose target is NOT `${path}.tmp` is the
      // LIVE-PATH-DIRECT reading (§3.2 `I-1`'s falsifier) — recorded under its own step name
      // so the shape oracle can SEE it rather than silently mis-classify it.
      calls.push({ leg: 'writeFileSync', target: path, step: 'writeTmp' })
      boom('writeFileSync', path)
      files.set(path, data)
    },
    openSync: (path, flags) => {
      calls.push({ leg: 'openSync', target: path, step: null })
      void flags
      boom('openSync', path)
      return calls.length
    },
    fsyncSync: (fd) => {
      // §2.2's shape carries TWO fsync legs: `fsync(tmp)` BEFORE the rename and `fsync(dir)`
      // AFTER it. The façade tells them apart by the RENAME; a THIRD fsync is out of shape and
      // is recorded under its own name so the oracle can see it.
      const renamed = calls.some((c) => c.step === 'rename')
      const tmpCount = calls.filter((c) => c.step === 'fsyncTmp').length
      const dirCount = calls.filter((c) => c.step === 'fsyncDir').length
      const step: AtomicStep | null = !renamed && tmpCount === 0 ? 'fsyncTmp' : renamed && dirCount === 0 ? 'fsyncDir' : null
      calls.push({ leg: 'fsyncSync', target: `fd:${String(fd)}`, step })
      boom('fsyncSync', String(fd))
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
      // The boot read's presence test — §2.5 ③'s ONE distinguishing leg. It is NOT throwable
      // on the real `node:fs` either, but the spec declares it an independently-driven leg
      // (§2.6 P-8), so the façade honours `failAt` here too.
      boom('existsSync', path)
      return files.has(path)
    },
  }
  return facade
}

interface FsReading {
  /** the recorded step sequence, `mkdir` projected out (it is CONDITIONAL, §2.2) */
  projected: AtomicStep[]
  /** every leg invoked, in order, with its target */
  legs: string[]
  /** the step sequence INCLUDING `mkdir` */
  raw: AtomicStep[]
}

function readFacade(fs: FsFacade): FsReading {
  const steps = fs.calls.map((c) => c.step).filter((s): s is AtomicStep => s !== null)
  return {
    raw: steps,
    projected: steps.filter((s) => s !== 'mkdir') as AtomicStep[],
    legs: fs.calls.map((c) => `${c.leg}(${c.target})`),
  }
}

/** §2.2 / §3.1's INVARIANT / §3.2 `I-1`/`I-2` — THE ATOMIC-SHAPE ORACLE over the recorded call
 *  ORDER/COUNT. **SHAPE ONLY — no durability reading.** Returns the violations it observed.
 *
 *  THE TWO READINGS THE ORACLE NAMES DISTINCTLY (§4's arm classes):
 *   · `SEAM-UNREACHED` — the recorder observed ZERO calls: the subject never routed through the
 *     injected façade at all (its `opts.fs` member does not exist and its `persist()` reaches
 *     the REAL `node:fs` through a static import). This is the `RED-BY-ABSENCE` reading and it
 *     is named, never smoothed into "no shape".
 *   · `LIVE-PATH-DIRECT` — the subject wrote the LIVE path rather than `${path}.tmp` (§3.2
 *     `I-1`'s falsifier). Read from a `writeFileSync` whose target is not the tmp. */
function atomicShapeProblems(fs: FsFacade, livePath: string): string[] {
  const problems: string[] = []
  const reading = readFacade(fs)
  const tmpPath = `${livePath}.tmp`
  if (reading.raw.length === 0) {
    problems.push(
      `SEAM-UNREACHED: the injected façade recorded ZERO calls — §2.6's ADDITIVE-OPTIONAL \`fs?\` member does not exist on this carrier's options, so the seam resolves NOWHERE and the landed \`persist()\` reaches the REAL \`node:fs\` through its static import. §2.2's five-step shape is therefore UNSATISFIED ON THIS SUBSTRATE (§4 RE-2's RED-BY-ABSENCE reading), and the landed sequence is read on the real path beside it`,
    )
    return problems
  }
  if (reading.projected.length !== UNCONDITIONAL_STEPS.length || reading.projected.some((s, i) => s !== UNCONDITIONAL_STEPS[i])) {
    problems.push(
      `ATOMIC-SHAPE: the recorded call sequence is [${reading.raw.join(' \u2192 ') || 'NO CALLS'}] — §2.2 requires the SHAPE \`mkdirSync(dirname,{recursive}) \u2192 tmp write \u2192 fsync(tmp) \u2192 renameSync(tmp, path) \u2192 fsync(dir)\` IN THAT ORDER, once each; the landed non-atomic shape records \`mkdir \u2192 plain write against the live path\` (§4 RE-1)`,
    )
  }
  // §3.2 `I-1` — THE LIVE-PATH RULE: the live path is NEVER written directly, and the ONLY
  // mutation of it is the rename.
  for (const c of fs.calls) {
    if (c.leg === 'writeFileSync' && c.target === livePath) {
      problems.push(
        `LIVE-PATH-DIRECT: a \`writeFileSync\` names the LIVE path \`${livePath}\` — §3.2 I-1 / §2.2: the live path is NEVER written directly (the only mutation is \`renameSync(tmp, path)\`); the old plain write is REPLACED, never kept beside the new shape (§4 RE-1; F-2)`,
      )
    }
  }
  // the tmp TARGET must be `${path}.tmp` — never the real path, never a third name
  for (const c of fs.calls.filter((x) => x.leg === 'writeFileSync')) {
    if (c.target !== tmpPath) {
      problems.push(`TMP-TARGET: a write landed at \`${c.target}\` — §2.2 serializes to \`${tmpPath}\` (the tmp write's ONLY lawful target)`)
    }
  }
  // the rename's SOURCE is the tmp and its TARGET is the live path
  for (const c of fs.calls.filter((x) => x.leg === 'renameSync')) {
    if (c.target !== `${tmpPath}\u2192${livePath}`) {
      problems.push(`RENAME-LEG: the rename reads \`${c.target}\` — §2.2 renames \`${tmpPath}\` ONTO \`${livePath}\` (§4 RE-1)`)
    }
  }
  // every unconditional step EXACTLY ONCE
  for (const step of UNCONDITIONAL_STEPS) {
    const count = reading.raw.filter((s) => s === step).length
    if (count !== 1) {
      problems.push(`ATOMIC-SHAPE: the step \`${step}\` was invoked ${count} time(s) — §2.2 runs every unconditional step EXACTLY ONCE (§4 RE-1)`)
    }
  }
  const mkdirCount = reading.raw.filter((s) => s === 'mkdir').length
  if (mkdirCount > 1) {
    problems.push(`ATOMIC-SHAPE: \`mkdirSync\` was invoked ${mkdirCount} times — §2.2's mkdir leg is CONDITIONAL and runs AT MOST once`)
  }
  // §2.2's tmp fate (a) — a SUCCESSFUL write leaves NO `${path}.tmp`
  if (fs.files.has(tmpPath)) {
    problems.push(`TMP-RESIDUE: a residual \`${tmpPath}\` remains after the write — §2.2's tmp fate (a) / §3.2 I-2: a SUCCESSFUL write leaves NO tmp (§4 RE-1)`)
  }
  // §3.2 `I-2` — the tmp is NEVER parsed as the record: the boot read's read targets are the
  // live path only.
  for (const c of fs.calls.filter((x) => x.leg === 'readFileSync')) {
    if (c.target === tmpPath) {
      problems.push(`TMP-PARSED: the boot read consulted \`${tmpPath}\` — §3.2 I-2 / §2.2: a \`${path0(tmpPath)}\` is NEVER parsed as the record, whatever valid-looking bytes it carries (§4 RE-1)`)
    }
  }
  return problems
}

function path0(p: string): string {
  return p.endsWith('.tmp') ? `${p.slice(0, -4)}.tmp` : p
}

// ===========================================================================
// THE CARRIER ADAPTERS (`§4 RE-2`'s RED-BY-ABSENCE / `§4 RE-1`'s RED-BY-SHIM instrument).
//
// THE CONSTRAINT, MEASURED AT THIS HEAD: the `fs?` member does NOT exist on either carrier's
// options, so the façade "resolves nowhere" — and the landed `persist()` reaches the REAL
// `node:fs` through a STATIC import, so handing it an injected object is INERT: the façade
// records **zero** calls while the REAL filesystem carries the write. THE DRIVE THEREFORE READS
// BOTH SUBSTRATES:
//   (a) THE FAÇADE'S RECORDER — the calls the subject made through the seam. At this head it
//       reads NO CALLS, which is the `RED-BY-ABSENCE` reading and is reported AS SUCH, never
//       silently treated as "the landed shape is unknown".
//   (b) THE REAL PATH BESIDE THE FAÇADE — the same subject driven against a real temp file, so
//       the landed sequence can be READ (`mkdir` → plain write against the LIVE path → nothing,
//       no tmp, no fsync, no rename). This is what makes the `RE-1` red a READING rather than a
//       claim about an unobservable.
// It NEVER writes a `src/**` byte and never mocks a module.
// ===========================================================================
interface DriveResult {
  calls: FsCall[]
  reading: FsReading
  /** the carrier's answer to `set(...)`, if it returned one */
  post: unknown
  /** `null` when the member resolves nowhere at this head */
  receipt: { present: boolean; value: unknown; threw: string | null }
  /** `null` when the member resolves nowhere at this head */
  lastReadWasCorrupt: { present: boolean; value: unknown; threw: string | null }
  /** a throw that escaped the drive (the carrier's own escape, never the adapter's) */
  escaped: string | null
  facade: FsFacade
  livePath: string
  /** the live path's bytes AT THE DRIVE'S START (the previous record) */
  previousBytes: string | null
  /** the live path's bytes AFTER the drive */
  bytesAfter: string | null
  /** §2.6 — the OPTIONS the subject was handed; `false` when `fs` never reached the subject */
  seamReached: boolean
}

/** THE REAL-PATH READING — the same subject driven against the REAL `node:fs` inside the
 *  per-process-unique fixture root. `§4 RE-1`'s landed-shape observation. */
interface RealDrive {
  livePath: string
  exists: boolean
  bytes: string | null
  /** whether a `${livePath}.tmp` survives the drive (the landed shape leaves NONE at all) */
  tmpResidue: boolean
  escaped: string | null
}

async function driveRealPath(spec: CarrierSpec, label: string): Promise<RealDrive | { error: string }> {
  const ns = await loadCarrier(spec)
  if ('error' in ns) return { error: ns.error }
  const livePath = join(FIXTURE_ROOT, `real-${label}.json`)
  try {
    rmSync(livePath, { force: true })
    rmSync(`${livePath}.tmp`, { force: true })
  } catch {
    /* the unique root; a missing file is the expected state */
  }
  let escaped: string | null = null
  try {
    const store = (ns[spec.factory] as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
    spec.drive(store, undefined, newFsFacade({}))
  } catch (e) {
    escaped = (e as Error)?.message ?? String(e)
  }
  return {
    livePath,
    exists: existsSync(livePath),
    bytes: existsSync(livePath) ? readFileSync(livePath, 'utf8') : null,
    tmpResidue: existsSync(`${livePath}.tmp`),
    escaped,
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

/** §2.6 P-1..P-8 — the façade-completeness reading: a leg that is not a function is REPORTED,
 *  so a partial seam can never silently under-drive a limb (§2.4 m-10). */
function facadeCompletenessProblems(fs: FsFacade): string[] {
  const problems: string[] = []
  for (const leg of FACADE_LEGS) {
    const value = (fs as unknown as Record<string, unknown>)[leg]
    if (typeof value !== 'function') {
      problems.push(`FACADE-MEMBER: the instrument's \`${leg}\` leg is ${typeof value} — §2.6 declares EIGHT legs (P-1..P-8)`)
    }
  }
  return problems
}

interface CarrierSpec {
  label: string
  modulePath: string
  factory: string
  /** the operator carrier's `set` takes a PATCH; the engine carrier's takes a baseUrl */
  drive: (store: Record<string, unknown>, serialized: unknown, fs: FsFacade) => unknown
  /** the serialized record a `set` should produce, asserted against the live file's bytes */
  expectedRecordIsObject: boolean
}

async function loadCarrier(spec: CarrierSpec): Promise<Record<string, unknown> | { error: string }> {
  try {
    const ns = (await import(/* @vite-ignore */ spec.modulePath)) as Record<string, unknown>
    if (typeof ns[spec.factory] !== 'function') return { error: `${spec.factory} resolves NOWHERE on ${spec.label}'s module namespace` }
    return ns
  } catch (e) {
    return { error: (e as Error)?.message ?? String(e) }
  }
}

/** Build a store over the injected façade and read its declared members. */
async function driveCarrier(
  spec: CarrierSpec,
  options: { failAt?: FacadeLeg | null; seed?: Record<string, string>; liveBytesBefore?: string | null; drive?: boolean },
): Promise<DriveResult | { error: string }> {
  const ns = await loadCarrier(spec)
  if ('error' in ns) return { error: ns.error }
  const livePath = join(FIXTURE_ROOT, `${spec.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`)
  const facade = newFsFacade({ failAt: options.failAt ?? null, seed: options.seed ?? {} })
  const previousBytes = facade.files.get(livePath) ?? null
  let store: unknown
  try {
    // `createEngineConfigStore` takes its options INLINE (`{ path }`); the operator factory takes
    // a named `OperatorSettingsStoreOptions`. Both are driven with the SAME option object so the
    // façade leg is the variable under test.
    store = (ns[spec.factory] as (o: { path: string; fs?: unknown }) => unknown)({ path: livePath, fs: facade })
  } catch (e) {
    return { error: `CONSTRUCTION-THREW: ${(e as Error)?.message ?? String(e)}` }
  }
  let escaped: string | null = null
  let post: unknown
  if (options.drive !== false) {
    try {
      post = spec.drive(store as Record<string, unknown>, undefined, facade)
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
    facade,
    livePath,
    previousBytes,
    bytesAfter: facade.files.get(livePath) ?? null,
    // §2.6 — `seamReached` is FALSE exactly when the subject never invoked a single façade leg:
    // its write (and its boot read) went to the REAL `node:fs` through the module's static
    // import, which is the `RED-BY-ABSENCE` reading for the `fs?` member (§4 RE-2).
    seamReached: facade.calls.length > 0,
  }
}

const OPERATOR_CARRIER: CarrierSpec = {
  label: 'operator-settings-store',
  modulePath: '../src/main/operator-settings-store.js',
  factory: 'createOperatorSettingsStore',
  drive: (store) => (store.set as (p: unknown) => unknown).call(store, { topK: 9, theme: 'dark' }),
  expectedRecordIsObject: true,
}

const ENGINE_CARRIER: CarrierSpec = {
  label: 'engine-config',
  modulePath: '../src/main/engine-config.js',
  factory: 'createEngineConfigStore',
  drive: (store) => (store.set as (b: unknown) => unknown).call(store, 'http://127.0.0.1:9099'),
  expectedRecordIsObject: true,
}

const BOTH_CARRIERS = [OPERATOR_CARRIER, ENGINE_CARRIER] as const

function isDriveError(v: DriveResult | { error: string }): v is { error: string } {
  return typeof (v as { error?: unknown }).error === 'string'
}

// ===========================================================================
// THE BYTE-SCAN HELPERS — the `[H]` instrument (a scan over the landed tree).
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

/** The comment-free body — so a PROSE mention of a denied token is never mistaken for a USE of
 *  it (the landed `withoutComments` precedent). */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

function relativePath(p: string): string {
  return relative(REPO_ROOT, p).split('\\').join('/')
}

/** The bare-md5 oracle — ONE reader, driven over the real files AND a synthetic corpus, so its
 *  discrimination is shown rather than asserted. */
function md5Of(bytes: string | Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}

/** Read the `UNTOUCHED_DIGESTS` table's rows as DATA (never by importing the test file, which
 *  would execute its suites). The parse is a SHAPE read of the table's own literal form. */
interface UntouchedRow {
  file: string
  md5: string
  restated: string | null
  line: string
}
function readUntouchedRows(): { rows: UntouchedRow[]; problem: string | null } {
  const text = readMaybe(THEME_PIN_PATH)
  if (text === null) return { rows: [], problem: `${relativePath(THEME_PIN_PATH)} could not be read — the re-statement's substrate is absent (§1.1 member 4)` }
  const block = /const UNTOUCHED_DIGESTS:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(text)
  if (block === null) return { rows: [], problem: `${relativePath(THEME_PIN_PATH)} no longer carries the \`UNTOUCHED_DIGESTS\` table (§2.7 C-3)` }
  const rows: UntouchedRow[] = []
  for (const line of block[1]!.split('\n')) {
    const file = /file:\s*'([^']+)'/.exec(line)
    if (file === null) continue
    const md5 = /md5:\s*'([0-9a-f]{32})'/.exec(line)?.[1] ?? ''
    const restated = /restated:\s*'([^']+)'/.exec(line)?.[1] ?? null
    rows.push({ file: file[1]!, md5, restated, line })
  }
  return { rows, problem: null }
}

/** §2.7 `C-4` / §3.2 `I-6` — THE DERIVED CONTROL PATH, re-derived HERE from the table's own rows
 *  by the SAME expression the register uses (`find((d) => d.restated === undefined)?.file`), so
 *  the limb reads the derivation rather than a copy of its answer. */
function derivedControlPath(rows: UntouchedRow[]): string {
  return rows.find((r) => r.restated === null)?.file ?? ''
}

// ===========================================================================
// §2.2 / §3.1 / §3.2 I-1/I-2 — THE ATOMIC SHAPE, BOTH CARRIERS (§4 RE-1, `RED-BY-SHIM`).
// ===========================================================================
describe('§2.2 — THE ATOMIC FIVE-STEP WRITE, BOTH CARRIERS (S-ASW-ATOM-1; §4 RE-1, RED-BY-SHIM)', () => {
  it('§3.1 THE INVARIANT / §3.2 I-1 — the ONLY byte-sequence reaching the live path is a completed tmp moved there by ONE renameSync; the live path is NEVER written directly', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      const drive = await driveCarrier(spec, {})
      if (isDriveError(drive)) {
        problems.push(`${spec.label}: ${drive.error}`)
        continue
      }
      // eslint-disable-next-line no-console -- the instrument is PRINTED per drive
      console.log(`ASW shape [${spec.label}] recorded over the injected façade: ${drive.reading.legs.join(' \u2192 ') || 'NO CALLS (the seam resolves nowhere — §4 RE-2)'}`)
      problems.push(...atomicShapeProblems(drive.facade, drive.livePath).map((p) => `${spec.label}: ${p}`))
    }
    expect(
      problems,
      '§3.1/§3.2 I-1/§2.2 — the atomic five-step shape holds on BOTH carriers, asserted as a CALL ORDER/COUNT over the injected façade (SHAPE ONLY — no durability claim)',
    ).toEqual([])
  })

  it('§2.2 — the ORDER is the contract: mkdir \u2192 tmp write \u2192 fsync(tmp) \u2192 rename \u2192 fsync(dir), the tmp fsync BEFORE the rename and the dir fsync AFTER it', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      const drive = await driveCarrier(spec, {})
      if (isDriveError(drive)) {
        problems.push(`${spec.label}: ${drive.error}`)
        continue
      }
      const raw = drive.reading.raw
      if (raw.length === 0) {
        problems.push(
          `${spec.label}: the injected façade recorded NOTHING, so NO step of §2.2's order was observed — the seam resolves nowhere (§4 RE-2's RED-BY-ABSENCE) and \`fsync(tmp)\`, \`renameSync(tmp, path)\` and \`fsync(dir)\` are ALL unreached (§4 RE-1)`,
        )
        continue
      }
      const idx = (s: AtomicStep): number => raw.indexOf(s)
      if (idx('writeTmp') < 0) problems.push(`${spec.label}: no tmp write was recorded (§2.2 step 2)`)
      if (idx('fsyncTmp') < 0) problems.push(`${spec.label}: NO \`fsync(tmp)\` leg was recorded — §2.2 step 3 requires the tmp be fsync'ed BEFORE the rename (§4 RE-1)`)
      if (idx('rename') < 0) problems.push(`${spec.label}: NO \`renameSync(tmp, path)\` leg was recorded — §2.2 step 4 (§4 RE-1)`)
      if (idx('fsyncDir') < 0) problems.push(`${spec.label}: NO \`fsync(dir)\` leg was recorded — §2.2 step 5 skips the directory fsync (§4 RE-1)`)
      if (idx('writeTmp') >= 0 && idx('fsyncTmp') >= 0 && !(idx('writeTmp') < idx('fsyncTmp'))) {
        problems.push(`${spec.label}: the recorded order is [${raw.join(' \u2192 ')}] — §2.2 puts the tmp WRITE before its fsync (§4 RE-1)`)
      }
      if (idx('fsyncTmp') >= 0 && idx('rename') >= 0 && !(idx('fsyncTmp') < idx('rename'))) {
        problems.push(`${spec.label}: the recorded order is [${raw.join(' \u2192 ')}] — §2.2 requires \`fsync(tmp)\` BEFORE the rename (a rename without the tmp fsync is §4 RE-1's falsifier)`)
      }
      if (idx('rename') >= 0 && idx('fsyncDir') >= 0 && !(idx('rename') < idx('fsyncDir'))) {
        problems.push(`${spec.label}: the recorded order is [${raw.join(' \u2192 ')}] — §2.2 requires the PARENT DIRECTORY fsync AFTER the rename (§4 RE-1)`)
      }
    }
    expect(problems, '§2.2 — THE ORDER IS THE CONTRACT (the shape asserted as call order over the injected façade)').toEqual([])
  })

  it('§4 RE-1 / §3.2 I-1 — THE LANDED SHAPE, READ ON THE REAL PATH: the carriers write the LIVE path directly, with NO tmp, NO fsync and NO rename', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      const real = await driveRealPath(spec, `${spec.label}-landed`)
      if ('error' in real) {
        problems.push(`${spec.label}: ${real.error}`)
        continue
      }
      // eslint-disable-next-line no-console -- the landed reading is PRINTED, never inferred
      console.log(
        `ASW landed shape [${spec.label}] on the real path: record written = ${String(real.exists)}; published bytes = ${real.bytes === null ? 'NONE' : `${real.bytes.slice(0, 48)}…`}; tmp residue = ${String(real.tmpResidue)}; escaped = ${String(real.escaped)}`,
      )
      if (real.escaped !== null) {
        problems.push(`${spec.label}: the landed drive threw out of \`set()\` (\`${real.escaped}\`) — §3.2 I-4: the write never throws`)
      }
      if (!real.exists) {
        problems.push(`${spec.label}: the landed drive published NO record at the live path — §4 RE-1's landed reading has no subject`)
        continue
      }
      if (real.tmpResidue) {
        problems.push(`${spec.label}: the landed drive left a \`${relativePath(real.livePath)}.tmp\` — §2.2's tmp fate (a) is a property of the ATOMIC shape, which this carrier does not have (§4 RE-1)`)
      }
      // THE LANDED READING (§4 RE-1's red): the bytes at the live path ARE the serialized record,
      // published by the plain write — the byte-sequence §3.2 I-1 forbids, because NO tmp carried
      // it and NO rename moved it there. The reading is taken so the red rests on a measurement.
      let parsed: unknown
      try {
        parsed = JSON.parse(real.bytes!)
      } catch {
        problems.push(`${spec.label}: the landed record at the live path does not parse (\`${String(real.bytes).slice(0, 60)}\`) — §2.2's serialization is \`JSON.stringify(current, null, 2)\``)
        continue
      }
      if (parsed === null || typeof parsed !== 'object') {
        problems.push(`${spec.label}: the landed record is not a JSON object — §2.2's serialization is \`JSON.stringify(current, null, 2)\``)
      }
    }
    expect(problems, '§4 RE-1 — the landed shape is READ on the real path; the reading the atomic-shape red rests on').toEqual([])
  })

  it('§2.2 — the SERIALIZATION is NOT changed: the record the carrier publishes is its own `JSON.stringify(current, null, 2)` shape', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      // THE READING IS TAKEN WHERE THE LANDED SUBJECT ACTUALLY WRITES — the real path — so the
      // limb is a MEASUREMENT whether or not the seam resolves (§4 RE-1's honest instrument).
      const real = await driveRealPath(spec, `${spec.label}-serialization`)
      if ('error' in real) {
        problems.push(`${spec.label}: ${real.error}`)
        continue
      }
      if (real.bytes === null) {
        problems.push(`${spec.label}: the carrier published no bytes at the live path — §2.2 step 2's serialization has no reading`)
        continue
      }
      if (!/^\{\n {2}"/.test(real.bytes)) {
        problems.push(
          `${spec.label}: the serialized record does not read as \`JSON.stringify(current, null, 2)\` (\`${real.bytes.slice(0, 60)}…\`) — §2.2 item 2: the serialization is NOT changed by this unit`,
        )
      }
    }
    expect(problems, '§2.2 item 2 — the serialization is UNCHANGED (the two-space-indented object the carriers already wrote)').toEqual([])
  })

  it('§2.2 tmp fate (a) — a SUCCESSFUL write leaves NO \`\${path}.tmp\`; (b) a PRE-EXISTING stale tmp is OVERWRITTEN and NEVER read as input', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      // (a) read on the REAL path — the substrate where the landed subject writes.
      const real = await driveRealPath(spec, `${spec.label}-tmpfate`)
      if ('error' in real) {
        problems.push(`${spec.label}[real]: ${real.error}`)
      } else if (real.tmpResidue) {
        problems.push(`${spec.label}: a residual \`${relativePath(real.livePath)}.tmp\` remains after the drive — §2.2's tmp fate (a) / §3.2 I-2 (§4 RE-1)`)
      } else {
        // eslint-disable-next-line no-console -- the reading is PRINTED
        console.log(`ASW tmp-fate(a) [${spec.label}]: no tmp residue after the drive on the real path (record written = ${String(real.exists)})`)
      }
      // (b) a pre-existing STALE tmp carrying VALID-LOOKING bytes, over the injected substrate.
      const stalePath = join(FIXTURE_ROOT, `${spec.label}-stale.json`)
      const stale = await driveCarrierWithPath(spec, stalePath, { seed: { [`${stalePath}.tmp`]: '{"stale":"NEVER-THE-RECORD"}' } })
      if (isDriveError(stale)) {
        problems.push(`${spec.label}[stale]: ${stale.error}`)
        continue
      }
      const parsed = stale.facade.files.get(`${stale.livePath}.tmp`)
      if (parsed !== undefined && parsed.includes('NEVER-THE-RECORD')) {
        problems.push(
          `${spec.label}: the pre-existing stale \`${relativePath(stale.livePath)}.tmp\` survived the write carrying its stale bytes — §2.2's tmp fate (b) / §3.2 I-2: a stale tmp is OVERWRITTEN (§4 RE-1)`,
        )
      }
    }
    expect(problems, '§2.2 — the tmp fate: no residue on success; a stale tmp is overwritten (never parsed as input)').toEqual([])
  })
})

// §2.2 / §3.2 I-1 — THE LIVE PATH IS NEVER WRITTEN DIRECTLY (§4 RE-1/`RE-7`).
// THE STATIC HALF: the source's own write legs, read over the comment-free body.
// ===========================================================================
describe('§3.2 I-1 — THE LIVE-PATH RULE, read at the SOURCE (the static half of the atomic shape)', () => {
  const CARRIER_SOURCES: Array<[string, string]> = [
    ['operator-settings-store.ts', OPERATOR_PATH],
    ['engine-config.ts', ENGINE_PATH],
  ]

  it('§3.2 I-1 — NO carrier source writes `opts.path` directly: every write leg names `${opts.path}.tmp`', () => {
    const problems: string[] = []
    for (const [label, path] of CARRIER_SOURCES) {
      const text = readMaybe(path)
      if (text === null) {
        problems.push(`${label}: the module could not be read — §3.2 I-1's limb has no substrate`)
        continue
      }
      const body = withoutComments(text)
      // the DIRECT write shapes `I-1` names, by target expression
      for (const m of body.matchAll(/\b(writeFileSync|appendFileSync|truncateSync|createWriteStream)\s*\(\s*([A-Za-z_$][\w$.]*(?:\([^)]*\))?[^,)]*)/g)) {
        const target = m[2]!.trim()
        if (!/\.tmp/.test(target)) {
          problems.push(
            `${label}: a \`${m[1]}\` leg names \`${target}\` — §3.2 I-1: the live path is NEVER written directly; the ONLY mutation is \`renameSync(tmp, path)\` (§4 RE-1; F-2)`,
          )
        }
      }
    }
    expect(problems, '§3.2 I-1 — the live path is never written directly on EITHER carrier').toEqual([])
  })

  it('§3.2 I-4 / §2.4 m-1..m-2 — NO silent absorber survives: neither carrier carries an EMPTY `catch {}`', () => {
    const problems: string[] = []
    for (const [label, path] of CARRIER_SOURCES) {
      const text = readMaybe(path)
      if (text === null) {
        problems.push(`${label}: the module could not be read — the absorber limb has no substrate`)
        continue
      }
      const body = withoutComments(text)
      if (/catch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(body)) {
        problems.push(
          `${label}: the module carries an EMPTY \`catch {}\` — §3.2 I-4 / §2.4: the SILENT ABSORBER is REMOVED in BOTH carriers (a \`catch\` that discards the outcome with neither a receipt nor the §2.5 ③ record) (§4 RE-1)`,
        )
      }
    }
    expect(problems, '§3.2 I-4 — the silent absorber is removed in BOTH carriers').toEqual([])
  })

  it('§2.6 P-2 — the facade leg writes the TMP ONLY; no leg of the façade may write the live path', () => {
    const fs = newFsFacade({})
    const live = join(FIXTURE_ROOT, 'facade-leg-probe.json')
    fs.writeFileSync(`${live}.tmp`, '{"probe":true}')
    expect(fs.files.has(`${live}.tmp`), '§2.6 P-2 — the façade leg writes the tmp the subject names').toBe(true)
    expect(
      fs.files.has(live),
      '§2.6 P-2 — a façade write of the LIVE path is the defect the seam exists to detect; the instrument records the TARGET, so the oracle can name it',
    ).toBe(false)
    // …and the oracle SEEES a live-path write when one is forged (the leg is not vacuous).
    fs.writeFileSync(live, '{"forged":true}')
    expect(
      atomicShapeProblems(fs, live).some((p) => p.startsWith('LIVE-PATH-DIRECT')),
      'the shape oracle MUST redden on a forged direct write of the live path — a limb that cannot fail is a defect',
    ).toBe(true)
  })
})

// ===========================================================================
// §2.4 — THE FAIL-STATE TABLE: THE FIVE WRITTEN FAILURE POINTS, BOTH CARRIERS
// (§4 RE-2, `RED-BY-ABSENCE` for the façade member itself).
// ===========================================================================
describe('§2.4 m-1..m-5 — THE FIVE FAILURE LEGS, BOTH CARRIERS (S-ASW-ATOM-2; §4 RE-2)', () => {
  /** The five written failure points, each driven by injecting a throw at its leg. Mapped to the
   *  façade legs §2.6 declares: mkdir → P-1; tmp write → P-2; tmp fsync → P-4 (the FIRST fsync);
   *  rename → P-6; dir fsync → P-4 (the SECOND fsync). */
  const FAILURE_POINTS: Array<{ m: string; leg: FacadeLeg; label: string }> = [
    { m: 'm-1/m-2', leg: 'mkdirSync', label: 'the `mkdirSync` leg' },
    { m: 'm-1/m-2', leg: 'writeFileSync', label: 'the tmp write' },
    { m: 'm-3', leg: 'fsyncSync', label: 'the tmp `fsync`' },
    { m: 'm-4', leg: 'renameSync', label: 'the `rename`' },
    { m: 'm-5', leg: 'fsyncSync', label: 'the directory `fsync`' },
  ]

  it('§2.4 m-1/m-2 — a failure at the mkdir or tmp-write leg leaves the PREVIOUS FILE byte-identical, throws NOTHING out of `set()`, and keeps `get()` at the in-memory post-state', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      for (const point of FAILURE_POINTS.filter((p) => p.leg === 'mkdirSync' || p.leg === 'writeFileSync')) {
        const livePath = join(FIXTURE_ROOT, `${spec.label}-${point.m.replace('/', '-')}-${point.leg}.json`)
        const previous = '{"previous":"RECORD"}'
        const seeded = await driveCarrierWithPath(spec, livePath, { failAt: point.leg, seed: { [livePath]: previous } })
        if (isDriveError(seeded)) {
          problems.push(`${spec.label}/${point.leg}: ${seeded.error}`)
          continue
        }
        if (seeded.escaped !== null) {
          problems.push(`${spec.label}/${point.m} at ${point.label}: a throw ESCAPED \`set()\` (\`${seeded.escaped}\`) — §3.2 I-4 / V-5: the write never throws out of \`set()\` (§4 RE-2)`)
        }
        if (seeded.bytesAfter !== previous) {
          problems.push(
            `${spec.label}/${point.m} at ${point.label}: the live path's bytes moved to \`${String(seeded.bytesAfter)}\` — §2.4 ${point.m}: the PREVIOUS FILE stays byte-identical (§4 RE-2)`,
          )
        }
      }
    }
    expect(problems, '§2.4 m-1/m-2 — the previous file stays intact and nothing escapes `set()` at the mkdir and tmp-write legs').toEqual([])
  })

  it('§2.4 m-3/m-4 — a failure at the tmp `fsync` or the `rename` leaves the previous file intact; a stale tmp may remain and is NEVER parsed as the record', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      for (const leg of ['fsyncSync', 'renameSync'] as const) {
        const livePath = join(FIXTURE_ROOT, `${spec.label}-${leg}.json`)
        const previous = '{"previous":"RECORD"}'
        const drive = await driveCarrierWithPath(spec, livePath, { failAt: leg, seed: { [livePath]: previous } })
        if (isDriveError(drive)) {
          problems.push(`${spec.label}/${leg}: ${drive.error}`)
          continue
        }
        if (drive.escaped !== null) {
          problems.push(`${spec.label}/${leg}: a throw ESCAPED \`set()\` (\`${drive.escaped}\`) — §3.2 I-4 (§4 RE-2)`)
        }
        if (drive.bytesAfter !== previous) {
          problems.push(`${spec.label}/${leg}: the live path's bytes moved to \`${String(drive.bytesAfter)}\` — §2.4 m-3/m-4: the previous file stays intact (§4 RE-2)`)
        }
        // §3.2 I-2 — a stale tmp is NEVER parsed as the record: no read leg may name it.
        for (const c of drive.calls.filter((x) => x.leg === 'readFileSync')) {
          if (c.target === `${livePath}.tmp`) {
            problems.push(`${spec.label}/${leg}: the boot read consulted the tmp — §3.2 I-2 (§4 RE-2)`)
          }
        }
      }
    }
    expect(problems, '§2.4 m-3/m-4 — the tmp-fsync and rename failures leave the previous file intact and never parse the tmp').toEqual([])
  })

  it('§2.4 m-5 — THE DECLARED DISAGREEMENT: a failure at the DIRECTORY `fsync` publishes the new record (step 4 already ran) while the receipt answers `refused`', async () => {
    const problems: string[] = []
    const operator = await driveCarrierWithPath(OPERATOR_CARRIER, join(FIXTURE_ROOT, 'operator-m5.json'), {
      failAt: 'fsyncSync',
      seed: {},
      failOnSecondFsync: true,
    })
    if (isDriveError(operator)) {
      problems.push(`operator/m-5: ${operator.error}`)
    } else {
      const read = readFacade(operator.facade)
      const renamed = read.raw.includes('rename')
      // eslint-disable-next-line no-console -- the reading is PRINTED (the disagreement is the assertion, not a smooth)
      console.log(
        `ASW m-5 [operator]: seam reached = ${String(operator.seamReached)}; rename recorded = ${String(renamed)}; livePath published = ${String(operator.facade.files.has(operator.livePath))}; receipt = ${JSON.stringify(operator.receipt.value)}`,
      )
      if (!operator.seamReached) {
        // THE HONEST READING FOR THIS HEAD (§4 RE-2): with no `fs?` member the façade is never
        // entered, so NO step of §2.2 — and therefore the directory-`fsync` point — is reachable
        // at all. The disagreement is UNOBSERVABLE rather than satisfied, and the `m-5`
        // disagreement limb is reported BROKEN by the absent seam (never a pass).
        problems.push(
          `operator/m-5: SEAM-UNREACHED — §2.4 m-5's disagreement limb has NO SUBJECT at this head: the \`fs?\` member does not exist, so the directory-\`fsync\` point (§2.2 step 5) is never reached and the DECLARED disagreement between the published file and the \`refused\` receipt cannot be driven (§4 RE-2/§4 RE-3). A limb with no subject is BROKEN, never a pass`,
        )
      } else if (renamed && operator.facade.files.has(operator.livePath)) {
        // THE DECLARED DISAGREEMENT (§2.4 m-5): the FILE is the new record while the receipt
        // answers `refused`. The row asserts the DISAGREEMENT rather than asserting it away.
        if (!operator.receipt.present) {
          problems.push(
            `operator/m-5: the receipt member resolves NOWHERE — §2.4 m-5 asserts the disagreement BETWEEN the file (published) and the receipt (\`refused\`); with no reader the disagreement is unobservable (§4 RE-3; §2.3 ①)`,
          )
        } else if (JSON.stringify(operator.receipt.value) !== JSON.stringify({ status: 'refused', reason: 'write-failed' })) {
          problems.push(
            `operator/m-5: the receipt reads \`${JSON.stringify(operator.receipt.value)}\` while the record IS published — §2.4 m-5 declares EXACTLY this disagreement (\`refused\` + the new file); the row asserts the DISAGREEMENT, never smooths it`,
          )
        }
      } else {
        problems.push(
          `operator/m-5: the drive did not reach the directory-\`fsync\` failure point (rename recorded = ${String(renamed)}, live path published = ${String(operator.facade.files.has(operator.livePath))}) — §2.4 m-5's disagreement limb has no subject`,
        )
      }
    }
    expect(problems, '§2.4 m-5 — the ONE case where the receipt and the file disagree is DECLARED and ASSERTED as a disagreement').toEqual([])
  })

  it('§2.4 m-2 — the ENGINE carrier mints NO receipt: nothing is answered and nothing is thrown on the same failure leg', async () => {
    const drive = await driveCarrierWithPath(ENGINE_CARRIER, join(FIXTURE_ROOT, 'engine-m2.json'), { failAt: 'writeFileSync', seed: {} })
    if (isDriveError(drive)) {
      expect(drive.error, `engine/m-2: ${drive.error}`).toBe('')
      return
    }
    expect(drive.escaped, '§2.4 m-2 — the engine carrier throws NOTHING out of `set()` on a write failure').toBeNull()
    expect(
      drive.receipt.present,
      '§2.3 ②/§3.2 I-3 — the ENGINE carrier must mint NO receipt member: a `lastWriteReceipt`/`lastWriteOutcome` member, a `write` field or any receipt-shaped return added to this carrier is a FINDING (a receipt with no reader)',
    ).toBe(false)
  })

  it('§2.4 m-10/m-11 — a PARTIALLY-injected façade and a `closeSync` that itself throws both reach the carrier\u2019s normal failure path, never a crash', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      // m-10 — ONE leg supplied, the others absent. A `TypeError` from the missing leg is the
      // fail-state (§2.4 m-10), NOT a supported partial seam.
      const ns = await loadCarrier(spec)
      if (!('error' in ns)) {
        const livePath = join(FIXTURE_ROOT, `${spec.label}-partial.json`)
        const partial = { mkdirSync: () => undefined }
        let escaped: string | null = null
        let store: unknown
        try {
          store = (ns[spec.factory] as (o: { path: string; fs?: unknown }) => unknown)({ path: livePath, fs: partial })
          if (spec === OPERATOR_CARRIER) (store as { set: (p: unknown) => unknown }).set({ topK: 3 })
          else (store as { set: (b: unknown) => unknown }).set('http://partial')
        } catch (e) {
          escaped = (e as Error)?.message ?? String(e)
        }
        if (escaped !== null) {
          problems.push(`${spec.label}/m-10: a PARTIAL façade made a throw ESCAPE \`set()\` (\`${escaped}\`) — §2.4 m-10: the missing leg's \`TypeError\` is caught by the SAME wrap and is NOT a crash`)
        }
        void store
      }
      // m-11 — a `closeSync` that itself throws must NOT replace the receipt with an escape.
      const closeless = await driveCarrierWithPath(spec, join(FIXTURE_ROOT, `${spec.label}-closethrow.json`), { failAt: 'closeSync', seed: {} })
      if (!isDriveError(closeless) && closeless.escaped !== null) {
        problems.push(`${spec.label}/m-11: a throwing \`closeSync\` made a throw ESCAPE \`set()\` (\`${closeless.escaped}\`) — §2.4 m-11: the original outcome stands and the write never throws`)
      }
    }
    expect(problems, '§2.4 m-10/m-11 — a partial seam and a throwing `closeSync` are fail-states, never escapes').toEqual([])
  })
})

/** `driveCarrier` with an EXPLICIT live path, so a drive can be seeded with a previous record
 *  at EXACTLY the path the carrier will write. `failOnSecondFsync` makes the SECOND `fsyncSync`
 *  call (the dir leg, §2.2 step 5) the one that throws — the `m-5` disagreement's instrument. */
async function driveCarrierWithPath(
  spec: CarrierSpec,
  livePath: string,
  options: { failAt?: FacadeLeg | null; seed?: Record<string, string>; failOnSecondFsync?: boolean },
): Promise<DriveResult | { error: string }> {
  const ns = await loadCarrier(spec)
  if ('error' in ns) return { error: ns.error }
  const facade = newFsFacade({ seed: options.seed ?? {} })
  if (options.failOnSecondFsync === true) {
    let seen = 0
    const original = facade.fsyncSync
    facade.fsyncSync = (fd: number) => {
      seen++
      if (seen === 2) {
        facade.calls.push({ leg: 'fsyncSync', target: `fd:${String(fd)}`, step: 'fsyncDir' })
        throw new Error('INJECTED-FAILURE at the directory fsync')
      }
      original(fd)
    }
  } else if (options.failAt != null) {
    facade.failAt = options.failAt
  }
  const previousBytes = facade.files.get(livePath) ?? null
  let store: unknown
  try {
    store = (ns[spec.factory] as (o: { path: string; fs?: unknown }) => unknown)({ path: livePath, fs: facade })
  } catch (e) {
    return { error: `CONSTRUCTION-THREW: ${(e as Error)?.message ?? String(e)}` }
  }
  let escaped: string | null = null
  let post: unknown
  try {
    post = spec.drive(store as Record<string, unknown>, undefined, facade)
  } catch (e) {
    escaped = (e as Error)?.message ?? String(e)
  }
  return {
    calls: facade.calls,
    reading: readFacade(facade),
    post,
    receipt: readMember(store, 'lastWriteReceipt'),
    lastReadWasCorrupt: readMember(store, 'lastReadWasCorrupt'),
    escaped,
    facade,
    livePath,
    previousBytes,
    bytesAfter: facade.files.get(livePath) ?? null,
    seamReached: facade.calls.length > 0,
  }
}

// ===========================================================================
// §2.5 / §2.4 m-7/m-8/m-9 — THE READ-PATH DISTINGUISHABILITY (§4 RE-4, `RED-BY-ABSENCE`).
// ===========================================================================
describe('§2.5 — THE READ-PATH DISTINGUISHABILITY: a torn file is NOT indistinguishable from a fresh install (§4 RE-4)', () => {
  /** §2.5 ③ — the FOUR boot states the row's term enumerates. */
  const BOOT_STATES = ['absent', 'zero-byte', 'unbalanced-prefix', 'torn-but-parsable'] as const
  type BootState = (typeof BOOT_STATES)[number]

  function bootSeed(state: BootState, livePath: string): Record<string, string> {
    switch (state) {
      case 'absent':
        return {}
      case 'zero-byte':
        return { [livePath]: '' }
      case 'unbalanced-prefix':
        return { [livePath]: '{"topK": 9, "theme": "dark"' }
      case 'torn-but-parsable':
        return { [livePath]: '{"topK": 9,' }
    }
  }

  it('§2.5 ③ / §2.4 m-7/m-8 — the operator carrier\u2019s `lastReadWasCorrupt()` reads `true` IFF the file was PRESENT and unusable, and `false` for a first install', async () => {
    const problems: string[] = []
    for (const state of BOOT_STATES) {
      const livePath = join(FIXTURE_ROOT, `operator-boot-${state}.json`)
      const drive = await driveCarrierWithPath(OPERATOR_CARRIER, livePath, { seed: bootSeed(state, livePath) })
      if (isDriveError(drive)) {
        problems.push(`operator[${state}]: ${drive.error}`)
        continue
      }
      // eslint-disable-next-line no-console -- the reading is PRINTED per boot state
      console.log(`ASW boot-read [operator/${state}]: lastReadWasCorrupt.present=${String(drive.lastReadWasCorrupt.present)} value=${String(drive.lastReadWasCorrupt.value)}`)
      if (!drive.lastReadWasCorrupt.present) {
        problems.push(
          `operator[${state}]: \`lastReadWasCorrupt\` resolves NOWHERE on the store — §2.1 S-5 / §2.5 ③ land the NEW member \`(): boolean\`; the two cases therefore do NOT differ at the store boundary (§4 RE-4)`,
        )
        continue
      }
      const expected = state === 'absent' ? false : true
      if (state === 'torn-but-parsable') {
        // §2.5 ④ — DISCLOSED: a torn-but-PARSABLE file is NOT detectable as torn at this layer at
        // all. The limb asserts the DISCLOSED limit rather than claiming a detection the spec
        // refuses: the answer is either `false` (the disclosed honest limit) or `true`.
        // It MUST NOT throw.
        if (drive.lastReadWasCorrupt.threw !== null) {
          problems.push(`operator[${state}]: \`lastReadWasCorrupt()\` THREW (\`${drive.lastReadWasCorrupt.threw}\`) — §2.5 ④ / §3.2 I-5: no new throw, and the read stays total`)
        }
        continue
      }
      if (drive.lastReadWasCorrupt.value !== expected) {
        problems.push(
          `operator[${state}]: \`lastReadWasCorrupt()\` reads \`${String(drive.lastReadWasCorrupt.value)}\` — §2.5 ③ / §2.4 ${state === 'absent' ? 'm-8' : 'm-7'} requires \`${String(expected)}\` (${state === 'absent' ? 'an ABSENT record: the signal is NOT set' : 'an UNPARSABLE record: the signal IS set'}); a fresh install must be DISTINGUISHABLE FROM a corrupt file, which is the whole point`,
        )
      }
    }
    expect(problems, '§2.5 ③ — the operator carrier distinguishes absent from unparsable at the store boundary').toEqual([])
  })

  it('§2.4 m-8 / §3.2 I-5 — BOTH carriers answer the first-run defaults for every boot state with NOTHING thrown (`get()` stays TOTAL and fail-soft)', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      for (const state of BOOT_STATES) {
        const livePath = join(FIXTURE_ROOT, `${spec.label}-m8-${state}.json`)
        const drive = await driveCarrierWithPath(spec, livePath, { seed: bootSeed(state, livePath), drive: false } as never)
        // `driveCarrierWithPath` always drives; the boot read happens at CONSTRUCTION, so a
        // throw during construction is the failure this limb reads.
        if (isDriveError(drive)) {
          problems.push(`${spec.label}[${state}]: the construction threw — §3.2 I-5 / §2.4 m-7/m-8: \`get()\` stays TOTAL and fail-soft on both carriers (a missing file, a corrupt file and a torn-but-parsable file all answer the first-run defaults with NOTHING thrown); ${drive.error}`)
        }
      }
    }
    expect(problems, '§3.2 I-5 — `get()` stays total and fail-soft: no boot state throws on either carrier').toEqual([])
  })

  it('§2.4 m-9 — a stale `${path}.tmp` carrying VALID-LOOKING bytes, ALONE, is NEVER parsed as the record', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      // THE READING IS TAKEN ON THE REAL PATH: the landed carrier's boot read reaches the real
      // `node:fs` (its `fs?` seam resolves nowhere — §4 RE-2), so a tmp-left-alone fixture must be
      // driven there for the limb to have a subject at all.
      const livePath = join(FIXTURE_ROOT, `m9-${spec.label}.json`)
      const tmpPath = `${livePath}.tmp`
      try {
        rmSync(livePath, { force: true })
        rmSync(tmpPath, { force: true })
        writeFileSync(tmpPath, '{"topK": 424242, "theme": "dark"}')
      } catch (e) {
        problems.push(`${spec.label}[m-9]: the fixture could not be staged (${(e as Error)?.message ?? String(e)})`)
        continue
      }
      const ns = await loadCarrier(spec)
      if ('error' in ns) {
        problems.push(`${spec.label}[m-9]: ${ns.error}`)
        continue
      }
      let store: Record<string, unknown> | null = null
      try {
        store = (ns[spec.factory] as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
      } catch (e) {
        problems.push(`${spec.label}[m-9]: the construction threw (\`${(e as Error)?.message ?? String(e)}\`) — §3.2 I-5: the read stays total`)
        continue
      }
      // THE PROPERTY: the tmp was NEVER parsed as the record. The live path was ABSENT, so the
      // carrier must answer the FIRST-RUN DEFAULTS — never the tmp's bytes.
      const answer = (store.get as () => Record<string, unknown>).call(store)
      // eslint-disable-next-line no-console -- the reading is PRINTED
      console.log(`ASW m-9 [${spec.label}]: live path absent, stale tmp staged; get() = ${JSON.stringify(answer)}`)
      if (JSON.stringify(answer).includes('424242')) {
        problems.push(
          `${spec.label}: \`get()\` answered the STALE TMP's bytes (\`${JSON.stringify(answer)}\`) — §2.4 m-9 / §3.2 I-2: the boot read reads the REAL PATH ONLY; a \`\${path}.tmp\` carrying valid-looking bytes is NEVER parsed as the record (§4 RE-4)`,
        )
      }
      if (existsSync(livePath) && readFileSync(livePath, 'utf8').includes('424242')) {
        problems.push(`${spec.label}: the live path was PUBLISHED from the stale tmp's bytes — §2.4 m-9 / §3.2 I-2 (the tmp is never the record)`)
      }
      // …and over the façade substrate, the boot read's PRESENCE test is the ONE distinguishing
      // leg (§2.5 ③): it must have a reading, even though the seam resolves nowhere.
      const facadeDrive = await driveCarrierWithPath(spec, `${FIXTURE_ROOT}/${spec.label}-m9-facade.json`, { seed: {} })
      if (!isDriveError(facadeDrive) && !facadeDrive.seamReached) {
        // eslint-disable-next-line no-console -- the absent-seam reading is PRINTED, never hidden
        console.log(`ASW m-9 [${spec.label}] façade substrate: SEAM-UNREACHED (0 calls) — the boot read's presence leg is read on the real path above, and the missing \`fs?\` member is §4 RE-2's reading`)
      }
    }
    expect(problems, '§2.4 m-9 — the tmp is never parsed as the record on either carrier').toEqual([])
  })

  it('§2.5 ③ — the ENGINE carrier\u2019s distinguishing signal is PERSISTED: the record it writes carries an explicit conflict marker once a corrupt read has occurred', async () => {
    const livePath = join(FIXTURE_ROOT, 'engine-corrupt-marker.json')
    // drive 1: a CORRUPT record at boot → the conflict is recorded on the NEXT SUCCESSFUL write.
    const first = await driveCarrierWithPath(ENGINE_CARRIER, livePath, { seed: { [livePath]: '{"engineBaseUrl":' } })
    if (isDriveError(first)) {
      expect(first.error, `engine[conflict-marker]: ${first.error}`).toBe('')
      return
    }
    const bytes = first.facade.files.get(livePath) ?? null
    // eslint-disable-next-line no-console -- the reading is PRINTED
    console.log(`ASW engine conflict marker [after a corrupt read]: live record = ${String(bytes)}`)
    const marker = engineConflictMarker(bytes)
    expect(
      marker.present,
      `§2.5 ③ — the ENGINE carrier's distinguishability is PERSISTED: the record it writes after a corrupt boot read must carry an explicit conflict marker (readable by main at the NEXT boot without a member no caller would read, §2.3 ②). The written record reads \`${String(bytes)}\` and carries NO conflict marker (§4 RE-4)`,
    ).toBe(true)
    // …and a CLEAN boot does NOT mint the marker (the signal is caused, never unconditional).
    const cleanPath = join(FIXTURE_ROOT, 'engine-clean.json')
    const clean = await driveCarrierWithPath(ENGINE_CARRIER, cleanPath, { seed: { [cleanPath]: JSON.stringify({ engineBaseUrl: null }) } })
    if (!isDriveError(clean)) {
      expect(
        engineConflictMarker(clean.facade.files.get(cleanPath) ?? null).present,
        '§2.5 ③ — a CLEAN boot read must NOT set the conflict marker: the signal is minted by the corrupt read, never unconditionally',
      ).toBe(false)
    }
  })

  it('§2.5 ①/② — the as-filed OVERSTATEMENT is KEPT VISIBLE beside the CORRECTED reading, and the CORRECTED one governs', async () => {
    const spec = readMaybe(SPEC_PATH)
    expect(spec, `§2.5 / S-P-2: the contract ${relativePath(SPEC_PATH)} could not be read`).not.toBeNull()
    const text = spec!
    const problems: string[] = []
    const asFiled = /an ARBITRARY SUBSET of the fields reverts to first-run, silently, with no receipt/.test(text)
    const overstatement = /a torn write silently resets the operator.s layout\/tabs\/theme/.test(text)
    if (!asFiled) {
      problems.push(`§2.5 ②: the CORRECTED reading ("${CORRECTED_SYMPTOM}") is absent from the contract — the operative symptom has no referent`)
    }
    if (!overstatement) {
      problems.push(`§2.5 ① / S-P-2: the AS-FILED overstatement ("${AS_FILED_SYMPTOM}") is NOT kept visible — RCA-8(c) requires the as-filed print be kept beside the corrected one, never deleted`)
    }
    // …and the CORRECTED reading must be the one that GOVERNS: the contract must say so.
    if (!/the corrected one governs|corrected one governs/i.test(text)) {
      problems.push('§2.5 ②: the contract does not carry the "the corrected one governs" ruling beside the kept-visible overstatement')
    }
    // THE FALSIFIER (§2.5 ②): the overstatement is TRUE for the zero-byte/unbalanced sub-case and
    // FALSE as the general claim. The row asserts the PRECISE reading — a parsable-prefix file
    // resets an ARBITRARY SUBSET, not all nine.
    expect(problems, '§2.5 ①/② — both prints are carried and the corrected reading governs').toEqual([])
  })
})

/** §2.5 ③ — the ENGINE carrier's persisted conflict marker oracle. The marker is a property of
 *  the FILE and must be readable WITHOUT a store member, so the oracle reads the RECORD's own
 *  bytes. The spec does not mint a spelling for it; the oracle accepts any EXPLICIT conflict
 *  field (a `conflict`/`corrupt`/`readConflict`-shaped member) so it cannot be satisfied by an
 *  incidental value, and it NAMES what it looked for in its failure message. */
function engineConflictMarker(bytes: string | null): { present: boolean; note: string } {
  if (bytes === null) return { present: false, note: 'the live record is absent — no marker can be persisted' }
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes)
  } catch {
    return { present: false, note: `the live record does not parse (\`${bytes.slice(0, 80)}\`)` }
  }
  if (parsed === null || typeof parsed !== 'object') return { present: false, note: 'the live record is not an object' }
  const keys = Object.keys(parsed as Record<string, unknown>)
  const hit = keys.filter((k) => /conflict|corrupt|unreadable|readFailure|readFailed/i.test(k))
  return {
    present: hit.length > 0,
    note:
      hit.length > 0
        ? `the record carries the conflict marker member(s) [${hit.join(', ')}]`
        : `the record's members are [${keys.join(', ')}] — NONE is a conflict marker (\`conflict\`/\`corrupt\`/… )`,
  }
}

// ===========================================================================
// §2.3 / §2.1 S-4/S-7 — THE RECEIPT, ITS READER, AND THE ENGINE CARRIER'S NO-RECEIPT
// DISPOSITION (§4 RE-3, `RED-BY-ABSENCE` on the operator; `GREEN-ON-ARRIVAL` on the engine).
// ===========================================================================
describe('§2.3 — THE RECEIPT READER RULING, PER CARRIER (§4 RE-3)', () => {
  it('§2.1 S-4 / §2.3 ① — the operator carrier MINTS `lastWriteReceipt()`: `null` ONLY before the first write attempt, then exactly ONE of the TWO CLOSED forms', async () => {
    const problems: string[] = []
    const livePath = join(FIXTURE_ROOT, 'operator-receipt.json')
    const ns = await loadCarrier(OPERATOR_CARRIER)
    if ('error' in ns) {
      problems.push(`operator: ${ns.error}`)
    } else {
      const facade = newFsFacade({})
      const store = (ns.createOperatorSettingsStore as (o: { path: string; fs?: unknown }) => Record<string, unknown>)({ path: livePath, fs: facade })
      const cold = readMember(store, 'lastWriteReceipt')
      if (!cold.present) {
        problems.push(
          'operator: `lastWriteReceipt()` resolves NOWHERE on the store — §2.1 S-4 / §2.3 ① land the NEW member `(): OperatorSettingsWriteReceipt | null`; THE READER IS THE STORE\'S OWN PUBLIC MEMBER (§4 RE-3)',
        )
      } else {
        if (cold.value !== null) {
          problems.push(`operator: \`lastWriteReceipt()\` reads \`${JSON.stringify(cold.value)}\` BEFORE the first write attempt — §2.1 S-4: \`null\` ONLY before the first write attempt (a cold, never-written store)`)
        }
        // ⟨CORRECTED 2026-10-07 — `U-ATOMICITY-SWEEP-CLASS-B`, THE MIS-COUNTED DRIVE.⟩
        // THE DEFECT (as filed, KEPT VISIBLE): the drive read `lastWriteReceipt()` a SECOND time with
        // NO `set()` between the two reads, and then called that second reading "after a performed
        // write". A cold store correctly answers `null` — so the arm reported `RECEIPT-FORM (after a
        // performed write): the receipt is \`null\``, which asserts something the drive never did. The
        // limb's NARRATION did not match its DRIVE; the `null`-only-before-the-first-write claim
        // itself is CORRECT and is preserved here UNCHANGED.
        // THE CORRECTION: the SECOND reading now follows an ACTUAL PERFORMED WRITE. The cold reading
        // is still taken FIRST and still demands `null`; `set()` is then DRIVEN through the store
        // over the injected façade, and only THEN is the receipt re-read and required to be exactly
        // one of the two CLOSED forms. FALSIFIER (both directions): (a) a store that answers a closed
        // form BEFORE any write reddens the cold limb; (b) a store whose receipt stays `null` after a
        // performed write reddens the second limb — the two arms cannot both be satisfied by a
        // constant answer, so neither is vacuous.
        let written = false
        try {
          ;(store.set as (p: unknown) => unknown).call(store, { topK: 9, theme: 'dark' })
          written = true
        } catch (e) {
          problems.push(
            `operator: the performed write THREW out of \`set()\` (\`${(e as Error)?.message ?? String(e)}\`) — §3.2 I-4 / V-5: the write never throws out of \`set()\``,
          )
        }
        if (written) {
          const after = readMember(store, 'lastWriteReceipt')
          const form = receiptFormProblems(after.present ? after.value : undefined, 'after a performed write')
          problems.push(...form)
        }
      }
    }
    expect(problems, '§2.3 ① — the operator receipt: `null` before the first attempt, then one closed form').toEqual([])
  })

  it('§2.3 ③ — THE CLOSED FORM: never a third status, never an absent `reason` on a refusal, never a re-spelled token', () => {
    const problems: string[] = []
    const good = [{ status: 'committed' }, { status: 'refused', reason: 'write-failed' }]
    for (const form of good) {
      problems.push(...receiptFormProblems(form, 'the closed form'))
    }
    // THE DISCRIMINATING CONTROLS — the same oracle over the forms it must REFUSE.
    const forged: Array<[string, unknown]> = [
      ['a THIRD status', { status: 'published' }],
      ['a refusal with NO reason', { status: 'refused' }],
      ['a re-spelled reason token', { status: 'refused', reason: 'io-error' }],
      ['a `committed` form carrying a `reason`', { status: 'committed', reason: 'write-failed' }],
      ['a bare string', 'committed'],
    ]
    const missed = forged.filter(([, form]) => receiptFormProblems(form, 'forged').length === 0).map(([label]) => label)
    expect(
      missed,
      '§2.3 ③ — the receipt-form oracle must REFUSE every form outside the closed two-form set; a control that cannot fail is a defect',
    ).toEqual([])
    expect(problems, '§2.3 ③ — the two closed forms both pass the oracle').toEqual([])
  })

  it('§2.3 ② / §3.2 I-3 — the ENGINE carrier mints NOTHING: no `lastWriteReceipt`, no `lastWriteOutcome`, no receipt-shaped return', async () => {
    const problems: string[] = []
    const ns = await loadCarrier(ENGINE_CARRIER)
    if ('error' in ns) {
      problems.push(`engine: ${ns.error}`)
    } else {
      const livePath = join(FIXTURE_ROOT, 'engine-noreceipt.json')
      const facade = newFsFacade({})
      const store = (ns.createEngineConfigStore as (o: { path: string; fs?: unknown }) => Record<string, unknown>)({ path: livePath, fs: facade })
      // eslint-disable-next-line no-console -- the disposition is PRINTED, never silent
      console.log(`ASW engine receipt disposition: NO READER — NO RECEIPT MINTED (§2.3 ②). The store's members are [${Object.keys(store).join(', ')}]`)
      for (const member of ['lastWriteReceipt', 'lastWriteOutcome', 'writeReceipt']) {
        if (typeof store[member] === 'function') {
          problems.push(
            `engine: the store mints \`${member}\` — §2.3 ② / §3.2 I-3: NO READER, NO RECEIPT MINTED; a receipt with no reader is a FINDING (the four disqualified candidates: no IPC return · no renderer surface · the registry is not a reader of the write · the in-memory holder is not a reader)`,
          )
        }
      }
      const post = (store.set as (b: unknown) => Record<string, unknown>).call(store, 'http://x')
      if (post !== null && typeof post === 'object' && 'write' in post) {
        problems.push('engine: `set()` answers a receipt-shaped `write` member — §2.3 ②\'s falsifier: a `write` field or any receipt-shaped return added to this carrier is a FINDING')
      }
    }
    expect(problems, '§2.3 ② — the engine carrier mints no receipt (its absence RECORDED as a disposition, never silent)').toEqual([])
  })

  it('§2.3 ④ / §3.2 I-11 — THE DUPLICATE-HOME RULE: `OperatorSettingsWriteReceipt` is declared in EXACTLY ONE of the two store modules, self-contained, and `src/main/security-store.ts` moves ZERO bytes', () => {
    const problems: string[] = []
    const operator = readMaybe(OPERATOR_PATH)
    const security = readMaybe(SECURITY_PATH)
    if (operator === null) problems.push(`duplicate-home: ${relativePath(OPERATOR_PATH)} could not be read — the receipt's declared home has no substrate`)
    if (security === null) problems.push(`duplicate-home: ${relativePath(SECURITY_PATH)} could not be read — the duplicate-home discrimination has no second subject`)
    if (operator !== null && security !== null) {
      const DECLARATION = /export\s+(?:type|interface)\s+OperatorSettingsWriteReceipt\s*=/
      if (!DECLARATION.test(operator)) {
        problems.push(
          `duplicate-home: \`OperatorSettingsWriteReceipt\` is declared NOWHERE in ${relativePath(OPERATOR_PATH)} — §2.1 S-7 / §2.3 ① board the type HERE, SELF-CONTAINED, EXPORTED, importing NOTHING (§4 RE-3)`,
        )
      }
      if (/import[^\n]*SecurityWriteReceipt|import[^\n]*SecurityStoreFs/.test(operator)) {
        problems.push(
          `duplicate-home: ${relativePath(OPERATOR_PATH)} imports a 3a identifier — §2.3 ④ / §3.2 I-11: NEITHER receipt type is IMPORTED from \`src/main/security-store.ts\`; the duplication is STRUCTURAL and is what the duplicate-home limb asserts`,
        )
      }
      const homes = [operator, security].filter((t) => DECLARATION.test(t)).length
      if (homes > 1) {
        problems.push(
          `duplicate-home: the identifier is DECLARED in BOTH store modules — §2.3 ④ requires EXACTLY ONE of \`${relativePath(OPERATOR_PATH)}\` and \`${relativePath(SECURITY_PATH)}\` (§3.2 I-11)`,
        )
      }
    }
    expect(problems, '§2.3 ④ / §3.2 I-11 — the receipt type has exactly one home and no import edge out of `security-store.ts`').toEqual([])
  })

  it('§2.6 — the FAÇADE is ADDITIVE-OPTIONAL on BOTH carriers, INERT by default, with exactly the EIGHT declared legs', () => {
    const problems: string[] = []
    const sources: Array<[string, string, string]> = [
      ['operator-settings-store.ts', OPERATOR_PATH, 'OperatorSettingsFs'],
      ['engine-config.ts', ENGINE_PATH, 'EngineConfigFs'],
    ]
    for (const [label, path, interfaceName] of sources) {
      const text = readMaybe(path)
      if (text === null) {
        problems.push(`${label}: the module could not be read — the façade limb has no substrate`)
        continue
      }
      const body = withoutComments(text)
      if (!new RegExp(`export\\s+interface\\s+${interfaceName}\\b`).test(body)) {
        problems.push(
          `${label}: no \`${interfaceName}\` declaration — §2.6 declares EACH CARRIER'S OWN façade (no import from \`security-store.ts\`; §3.2 I-11) (§4 RE-2)`,
        )
        continue
      }
      const declared = [...body.matchAll(new RegExp(`${interfaceName}[\\s\\S]*?\\{([\\s\\S]*?)\\n\\}`, 'g'))][0]?.[1] ?? ''
      const legs = [...declared.matchAll(/(\w+)\s*\(/g)].map((m) => m[1]!)
      const missing = FACADE_LEGS.filter((leg) => !legs.includes(leg))
      const extra = legs.filter((leg) => !(FACADE_LEGS as readonly string[]).includes(leg))
      if (missing.length > 0) {
        problems.push(`${label}: the \`${interfaceName}\` façade is missing the declared leg(s) [${missing.join(', ')}] — §2.6's set is the CLOSED eight (P-1..P-8)`)
      }
      if (extra.length > 0) {
        problems.push(`${label}: the \`${interfaceName}\` façade declares the extra leg(s) [${extra.join(', ')}] — §2.6: the declared legs are EXACTLY the \`node:fs\` legs the register drives, and no more`)
      }
      const options = interfaceBody(body, label === 'engine-config.ts' ? 'EngineConfigStoreOptions' : 'OperatorSettingsStoreOptions')
      if (options === null) {
        problems.push(`${label}: the OPTIONS container could not be located — the additive-optional member's subject is absent (§2.1 S-6)`)
      } else {
        const member = /(^|[\n;])\s*fs\s*(\??)\s*:/.exec(options.body)
        if (member === null) {
          problems.push(
            `${label}: the options carry NO \`fs\` member — §2.1 S-6 / §2.6 declare the injected façade ADDITIVE-OPTIONAL; ABSENT ⇒ the real \`node:fs\`, so the seam is INERT by default (§4 RE-2)`,
          )
        } else if (member[2] !== '?') {
          problems.push(`${label}: \`fs\` is declared REQUIRED — §2.6's falsifier: a REQUIRED \`fs\` is OUTSIDE the contract (a production caller supplies \`path\` only)`)
        }
      }
      if (/\bfs\s*:\s*(?:OperatorSettings|EngineConfig)Fs\b/.test(body)) {
        problems.push(`${label}: a REQUIRED \`fs\` annotation appears — §2.6 puts a REQUIRED \`fs\` OUTSIDE the contract (§4 RE-2)`)
      }
    }
    expect(problems, '§2.6 — the façade is additive-optional, inert by default, and carries the closed eight-leg set on both carriers').toEqual([])
  })

  it('§2.6 — the ABSENT-façade inertness control: with `fs` ABSENT both carriers reach the REAL `node:fs` and behave identically (the seam is INERT by default)', async () => {
    const problems: string[] = []
    for (const spec of BOTH_CARRIERS) {
      const ns = await loadCarrier(spec)
      if ('error' in ns) {
        problems.push(`${spec.label}: ${ns.error}`)
        continue
      }
      const livePath = join(FIXTURE_ROOT, `${spec.label}-inert.json`)
      let store: Record<string, unknown>
      try {
        store = (ns[spec.factory] as (o: { path: string }) => Record<string, unknown>)({ path: livePath })
      } catch (e) {
        problems.push(`${spec.label}: construction with 'path' ONLY threw (${(e as Error)?.message ?? String(e)}) — §2.6: a production caller supplies 'path' only and the seam is INERT by default`)
        continue
      }
      // the drive reaches the REAL filesystem inside the per-process-unique fixture root.
      try {
        if (spec === OPERATOR_CARRIER) (store.set as (p: unknown) => unknown).call(store, { topK: 7 })
        else (store.set as (b: unknown) => unknown).call(store, 'http://127.0.0.1:9111')
      } catch (e) {
        problems.push(`${spec.label}: the ABSENT-façade drive threw (\`${(e as Error)?.message ?? String(e)}\`) — the non-fatal posture is retained (§3.2 I-4)`)
        continue
      }
      if (!existsSync(livePath)) {
        problems.push(
          `${spec.label}: the ABSENT-façade drive published NO record at \`${relativePath(livePath)}\` — §2.6's INERT-by-default claim requires the real \`node:fs\` to be reached when \`fs\` is absent`,
        )
        continue
      }
      const onDisk = readFileSync(livePath, 'utf8')
      const residualTmp = existsSync(`${livePath}.tmp`)
      if (residualTmp) {
        problems.push(`${spec.label}: the ABSENT-façade drive left a residual \`${relativePath(livePath)}.tmp\` — §2.2's tmp fate (a) holds on the REAL path too (§4 RE-1)`)
      }
      // eslint-disable-next-line no-console -- the reading is PRINTED
      console.log(`ASW inert-façade [${spec.label}]: real path written = true; bytes = ${onDisk.slice(0, 48)}\u2026; residual tmp = ${String(residualTmp)}`)
    }
    expect(problems, '§2.6 — absent `fs` ⇒ the real `node:fs`, identical behaviour (the seam is inert by default)').toEqual([])
  })
})

// ===========================================================================
// §1.2 — THE DENIED-SURFACE NEGATIVE (§4 RE-7, `GREEN-ON-ARRIVAL`).
// ===========================================================================
describe('§1.2 — THE DENIED SURFACE, READ AT THE SOURCE (§4 RE-7)', () => {
  it('§3.2 I-10 — ONE writer per file: `src/main/main.ts` carries EXACTLY ONE construction site of each carrier, and no second writer of either path', () => {
    const text = readMaybe(MAIN_PATH)
    expect(text, `RED (${relativePath(MAIN_PATH)}): the wiring file does not exist`).not.toBeNull()
    const body = withoutComments(text!)
    const operatorSites = [...body.matchAll(/createOperatorSettingsStore\s*\(/g)].length
    const engineSites = [...body.matchAll(/createEngineConfigStore\s*\(/g)].length
    // eslint-disable-next-line no-console -- the census is PRINTED with its terms
    console.log(`ASW no-second-writer census: createOperatorSettingsStore sites = ${operatorSites}; createEngineConfigStore sites = ${engineSites}`)
    expect(operatorSites, '§3.2 I-10 — ONE writer per file: a SECOND `createOperatorSettingsStore` call site is the falsifier').toBe(1)
    expect(engineSites, '§3.2 I-10 — ONE writer per file: a SECOND `createEngineConfigStore` call site is the falsifier').toBe(1)
    // the two paths the carriers are minted at (§2.7 C-7 / S2/S3)
    expect(body, '§1.2 item 6 — the operator carrier keeps its name: `provident-operator-settings.json`').toContain("provident-operator-settings.json")
    expect(body, '§1.2 item 6 — the engine carrier keeps its name: `provident-engine-config.json`').toContain("provident-engine-config.json")
    // NO SECOND WRITER: no other module may mutate either path.
    const foreign = walkFiles(SRC_DIR)
      .map((p) => ({ p, text: withoutComments(readMaybe(p) ?? '') }))
      .filter(({ p }) => p !== MAIN_PATH && !/store\.ts$|engine-config\.ts$/.test(p))
      .filter(({ text: t }) => /provident-operator-settings\.json|provident-engine-config\.json/.test(t))
      .map(({ p }) => relativePath(p))
    expect(foreign, '§3.2 I-10 / §1.2 item 3 — NO SECOND WRITER: no module outside the carriers and `main.ts` names either path').toEqual([])
  })

  it('§1.2 item 5 / §2.1 — NO `schemaVersion` on EITHER carrier: the version machinery is the tier-1 carrier\u2019s', () => {
    const problems: string[] = []
    for (const [label, path] of [['operator-settings-store.ts', OPERATOR_PATH], ['engine-config.ts', ENGINE_PATH]] as const) {
      const text = readMaybe(path)
      if (text === null) {
        problems.push(`${label}: could not be read`)
        continue
      }
      if (/schemaVersion/.test(withoutComments(text))) {
        problems.push(`${label}: a \`schemaVersion\` member appears — §1.2 item 5 denies it on EITHER carrier's file (§7 non-claim 5)`)
      }
    }
    expect(problems, '§1.2 item 5 — no `schemaVersion` on either carrier').toEqual([])
  })

  it('§1.2 items 1/2/4/8/9 — no renderer byte, no preload byte, no `file.settings.*` token, no declared-root extension, no MCP surface', () => {
    const problems: string[] = []
    // item 4/8 — no `file.settings.` token is minted anywhere this unit may write.
    const carrierTexts = [readMaybe(OPERATOR_PATH) ?? '', readMaybe(ENGINE_PATH) ?? '', readMaybe(MAIN_PATH) ?? '']
    for (const [i, text] of carrierTexts.entries()) {
      if (/file\.settings\./.test(text)) {
        problems.push(`§1.2 item 4/8: a \`file.settings.\` token appears in carrier source #${String(i)} — S2/S4/§3.2 I-8: NO spelling is minted and the declared-root census is UNCHANGED`)
      }
    }
    // item 1 — no new renderer reach of either carrier (the reader census is UNMOVED).
    const rendererFiles = walkFiles(RENDERER_DIR)
    for (const p of rendererFiles) {
      const text = withoutComments(readMaybe(p) ?? '')
      if (/createOperatorSettingsStore|createEngineConfigStore/.test(text)) {
        problems.push(`§1.2 item 1: \`${relativePath(p)}\` constructs a carrier — §1.2 item 1 / S9: this unit is MAIN-REALM ONLY with ZERO renderer surface change`)
      }
    }
    // item 2 — the preload's `operatorSettings` sub-namespace carries NO new member.
    const preload = readMaybe(PRELOAD_PATH)
    if (preload === null) {
      problems.push(`§1.2 item 2: ${relativePath(PRELOAD_PATH)} could not be read — the preload-byte negative has no substrate`)
    } else {
      for (const forbidden of ['lastWriteReceipt', 'lastReadWasCorrupt', 'writeReceipt']) {
        if (preload.includes(forbidden)) {
          problems.push(`§1.2 item 2 / §3.2 I-9: \`${forbidden}\` appears in \`preload.ts\` — S6: the receipt is delivered on the STORE, not the channel; no preload byte moves`)
        }
      }
    }
    // item 9 — no MCP surface for either carrier.
    const mainBody = withoutComments(readMaybe(MAIN_PATH) ?? '')
    if (/ALL_TOOLS[\s\S]{0,400}operator(Settings|Config)|ALL_TOOLS[\s\S]{0,400}engineConfig\b/.test(mainBody)) {
      problems.push('§1.2 item 9 — an MCP surface names a carrier: both carriers are manual-UI / boot config, NEVER agent-addressable')
    }
    expect(problems, '§1.2 — the denied surface holds at this head').toEqual([])
  })

  it('§1.2 item 7 / §3.2 I-11 — `src/main/security-store.ts` is a SHAPE SOURCE, not an edit target', () => {
    const text = readMaybe(SECURITY_PATH)
    expect(text, `§1.2 item 7: ${relativePath(SECURITY_PATH)} could not be read`).not.toBeNull()
    expect(
      /export\s+type\s+SecurityWriteReceipt\s*=/.test(text!),
      '§1.2 item 7 / §3.2 I-11 — the 3a precedent\'s own receipt declaration is UNMOVED (a byte moved in `src/main/security-store.ts` is the falsifier)',
    ).toBe(true)
    expect(
      /export\s+interface\s+SecurityStoreFs\b/.test(text!),
      '§1.2 item 7 / §3.2 I-11 — the 3a precedent\'s own façade declaration is UNMOVED',
    ).toBe(true)
  })
})

// ===========================================================================
// §1.1 member 4 / §3.2 I-7 — THE md5 RE-STATEMENT AND THE PRE-EMPTIVE CONTROL RE-ANCHOR
// (§4 RE-5 `RED-BY-SHIM` — PRE-RECORDED AND EXEMPT-IN-ADVANCE — and §4 RE-6).
// ===========================================================================
describe('§1.1 member 4 / §3.2 I-7 — THE md5 RE-STATEMENT (§4 RE-5, the PRE-RECORDED EXEMPTION; §4 RE-6)', () => {
  it('§3.2 I-7 — the row carries `restated: \'U-ATOMICITY-SWEEP-CLASS-B\'` and the md5 MEASURED at the landing head', () => {
    const { rows, problem } = readUntouchedRows()
    expect(problem, `§1.1 member 4: the re-statement's substrate is absent — ${String(problem)}`).toBeNull()
    const row = rows.find((r) => r.file === 'src/main/operator-settings-store.ts')
    expect(row, '§1.1 member 4: the `src/main/operator-settings-store.ts` row is absent from `UNTOUCHED_DIGESTS` — the re-statement has no row').toBeDefined()
    // THE MEASURE-THEN-RECORD reading (`§2.7 C-9`): the recorded value must equal the file's
    // REAL digest at this head, never a copied figure.
    const actual = md5Of(readFileSync(OPERATOR_PATH))
    // eslint-disable-next-line no-console -- the digest reading is PRINTED, never inferred
    console.log(`ASW md5 row: recorded = ${row!.md5}; real = ${actual}; superseded visible = ${String(row!.line.includes(SUPERSEDED_OPERATOR_MD5))}; restated = ${String(row!.restated)}`)
    const problems: string[] = []
    if (row!.restated !== RESTATING_UNIT) {
      problems.push(
        `the row's \`restated\` reads \`${String(row!.restated)}\` — §1.1 member 4 / \`O-4\` / §3.2 I-7 require \`restated: '${RESTATING_UNIT}'\` SET IN THIS UNIT'S OWN COMMIT (the row is a landing-driven red by construction: this unit's own \`src/\` edit reddens the digest limb until the re-statement lands — §4 RE-5, PRE-RECORDED and EXEMPT-IN-ADVANCE)`,
      )
    }
    if (row!.md5 !== actual) {
      problems.push(
        `the recorded md5 reads \`${row!.md5}\` while the file's real digest is \`${actual}\` — §1.1 member 4 / §2.7 C-9: the new value is MEASURED at the landing head (md5sum src/main/operator-settings-store.ts, AFTER the \`src/\` writes), never inferred`,
      )
    }
    expect(problems, '§1.1 member 4 — the re-statement is set, names this unit, and carries the measured digest').toEqual([])
  })

  it('§3.2 I-7 / §2.7 C-9 — the superseded literal `11841179e004f22dd758edbe927f1a40` stays VISIBLE, NEVER deleted', () => {
    const { rows, problem } = readUntouchedRows()
    expect(problem, `§2.7 C-9: the table could not be read — ${String(problem)}`).toBeNull()
    const row = rows.find((r) => r.file === 'src/main/operator-settings-store.ts')
    expect(row, '§2.7 C-9: the operator row is absent — the superseded literal has no row to stay visible in').toBeDefined()
    expect(
      row!.line.includes(SUPERSEDED_OPERATOR_MD5),
      `§3.2 I-7 — the superseded value \`${SUPERSEDED_OPERATOR_MD5}\` is NOT visible on the row: §1.1 member 4 requires it KEPT VISIBLE, NEVER deleted (a deleted superseded literal is §3.2 I-7's falsifier; §4 RE-6's limb 3)`,
    ).toBe(true)
  })

  it('§2.7 C-3 / §1.1 member 4 — NO OTHER ROW of the table moves: the SEVEN-row census is PRESERVED', () => {
    const { rows, problem } = readUntouchedRows()
    expect(problem, `§2.7 C-3: the table could not be read — ${String(problem)}`).toBeNull()
    expect(rows.length, '§2.7 C-3 / §1.1 member 4 — the `UNTOUCHED_DIGESTS` table is SEVEN rows (a CENSUS: 7, printed with its terms); NO OTHER ROW IS TOUCHED').toBe(UNTOUCHED_ROW_CENSUS)
    // EVERY other row still equals its RECORDED digest (the teeth are not relaxed by the move).
    const moved = rows
      .filter((r) => r.file !== 'src/main/operator-settings-store.ts')
      .filter((r) => md5Of(readFileSync(join(REPO_ROOT, r.file))) !== r.md5)
      .map((r) => `${r.file}: recorded ${r.md5} \u2260 actual ${md5Of(readFileSync(join(REPO_ROOT, r.file)))}`)
    expect(moved, '§1.1 member 4 — NO OTHER ROW OF THE TABLE IS TOUCHED: every other pinned file still equals its RECORDED digest').toEqual([])
  })

  it('§3.2 I-6 — `UNRESTATED_CONTROL_PATH` STAYS DERIVED and NON-VACUOUS, and RESOLVES to `src/shared/demo-envelope.ts` (§4 RE-6)', () => {
    const theme = readMaybe(THEME_PIN_PATH)
    expect(theme, `§3.2 I-6: ${relativePath(THEME_PIN_PATH)} could not be read`).not.toBeNull()
    const problems: string[] = []
    // THE DERIVATION MUST STAY AN EXPRESSION — never hand-edited to a literal.
    const derivedExpression = /const UNRESTATED_CONTROL_PATH\s*=\s*UNTOUCHED_DIGESTS\.find\(\(d\)\s*=>\s*d\.restated === undefined\)\?\.file/
    if (!derivedExpression.test(theme!)) {
      problems.push(
        '§3.2 I-6 — `UNRESTATED_CONTROL_PATH` is no longer the DERIVED expression `UNTOUCHED_DIGESTS.find((d) => d.restated === undefined)?.file` (a hand-edited literal is §3.2 I-6\'s falsifier, and it is the silent re-point the rule exists to pre-empt)',
      )
    }
    const { rows } = readUntouchedRows()
    const resolved = derivedControlPath(rows)
    if (resolved === '') {
      problems.push('§3.2 I-6 — the derivation is VACUOUS: every row carries a `restated:` field, so the control has no subject')
    } else if (resolved !== DERIVED_CONTROL_AFTER) {
      problems.push(
        `§3.2 I-6 — the derivation resolves to \`${resolved}\`, NOT to \`${DERIVED_CONTROL_AFTER}\` (§2.7 C-4: once the operator row carries \`restated:\`, the FIRST un-re-stated row in table order is \`${DERIVED_CONTROL_AFTER}\`). ⚠ C-4 flags this as OWED to the landed table: if an intervening landing re-states a row ahead of \`demo-envelope.ts\`, the derived path moves and this limb's expectation must be re-taken — it is NOT relaxed`,
      )
    }
    if (resolved !== '' && !rows.some((r) => r.file === resolved)) {
      problems.push(`§3.2 I-6 — the resolved path \`${resolved}\` is not a row of the table: the control would have no subject`)
    }
    expect(problems, '§3.2 I-6 — the control stays derived, non-vacuous, and resolves to demo-envelope.ts').toEqual([])
  })

  it('§3.2 I-6 — the DERIVED control\u2019s dated re-anchor note names the path it ACTUALLY RESOLVES TO, and says why that path is a legitimate subject (§4 RE-6)', () => {
    const theme = readMaybe(THEME_PIN_PATH)
    expect(theme, `§3.2 I-6: ${relativePath(THEME_PIN_PATH)} could not be read`).not.toBeNull()
    const commentaryStart = theme!.lastIndexOf('/**', theme!.indexOf('const UNRESTATED_CONTROL_PATH'))
    const commentary = commentaryStart >= 0 ? theme!.slice(commentaryStart, theme!.indexOf('const UNRESTATED_CONTROL_PATH')) : ''
    const problems: string[] = []
    if (!commentary.includes(DERIVED_CONTROL_AFTER)) {
      problems.push(
        `§3.2 I-6 / §1.1 member 5 — the DERIVED control's commentary does NOT name \`${DERIVED_CONTROL_AFTER}\`: §1.1 member 5 requires a DATED re-anchor note naming the newly-derived path, naming THIS unit as the act that derived it, and stating why that path is a legitimate subject (a row this unit is NOT licensed to move). The note must name the path the derivation ACTUALLY resolves to — the silent re-point the rule exists to pre-empt`,
      )
    }
    if (!commentary.includes(RESTATING_UNIT)) {
      problems.push(`§1.1 member 5 — the re-anchor note does not name \`${RESTATING_UNIT}\` as the act that derived the new path`)
    }
    if (!/re-anchor|re-point|PRE-EMPTIVE/i.test(commentary)) {
      problems.push('§1.1 member 5 — the note is not marked as the PRE-EMPTIVE re-anchor (the difference between this landing and the precedent is that the re-point is taken BEFORE the FAIL)')
    }
    expect(problems, '§3.2 I-6 / §1.1 member 5 — the re-anchor note names the path the derivation actually resolves to').toEqual([])
  })

  it('§3.2 I-6 — a synthetic EIGHTH-row corpus and a synthetic superseded-value-deletion corpus both REDDEN these limbs (the anti-vacuity controls)', () => {
    const real = readMaybe(THEME_PIN_PATH)
    expect(real, 'the control\'s substrate must be readable, else the control proves nothing').not.toBeNull()
    // control 1: an EIGHTH row reddens the census limb (§5.2 P-ASW-H-1's limb 5).
    const eighth = real!.replace(
      "  { file: 'src/shared/path-fork-cycle.ts', md5: 'eee412ed7609a1c8c727f2dafb2d97fb' },",
      "  { file: 'src/shared/path-fork-cycle.ts', md5: 'eee412ed7609a1c8c727f2dafb2d97fb' },\n  { file: 'src/shared/invented-eighth.ts', md5: '00000000000000000000000000000000' },",
    )
    expect(eighth, 'the synthetic corpus must really differ from the file').not.toBe(real)
    const eighthRows = parseRowsFrom(eighth)
    expect(eighthRows.length, 'a synthetic EIGHTH-row corpus MUST redden the census limb (7 → 8)').not.toBe(UNTOUCHED_ROW_CENSUS)
    // control 2: a DELETED superseded literal reddens the visibility limb (§5.2 limb 6).
    const deleted = real!.replace(SUPERSEDED_OPERATOR_MD5, '')
    expect(deleted, 'the synthetic deletion corpus must really differ').not.toBe(real)
    const deletedRow = parseRowsFrom(deleted).find((r) => r.file === 'src/main/operator-settings-store.ts')
    expect(
      deletedRow?.line.includes(SUPERSEDED_OPERATOR_MD5) ?? true,
      'a synthetic superseded-value-DELETION corpus MUST redden the visibility limb',
    ).toBe(false)
    // control 3: a HAND-EDITED derivation reddens the stays-derived limb (§5.2 limb 7).
    const handEdited = real!.replace(/const UNRESTATED_CONTROL_PATH\s*=\s*UNTOUCHED_DIGESTS\.find\(\(d\)\s*=>\s*d\.restated === undefined\)\?\.file/, "const UNRESTATED_CONTROL_PATH = 'src/shared/demo-envelope.ts'")
    expect(handEdited, 'the synthetic hand-edit corpus must really differ').not.toBe(real)
    expect(
      /const UNRESTATED_CONTROL_PATH\s*=\s*UNTOUCHED_DIGESTS\.find\(\(d\)\s*=>\s*d\.restated === undefined\)\?\.file/.test(handEdited),
      'a synthetic HAND-EDITED derivation corpus MUST redden the stays-derived limb',
    ).toBe(false)
  })
})

/** Parse `UNTOUCHED_DIGESTS` rows out of an arbitrary source text — the SAME reader the limbs
 *  above use, driven over a synthetic corpus so the controls discriminate the oracle rather than
 *  a re-implementation of it. */
function parseRowsFrom(text: string): UntouchedRow[] {
  const block = /const UNTOUCHED_DIGESTS:[\s\S]*?= \[([\s\S]*?)\n\]/.exec(text)
  if (block === null) return []
  const rows: UntouchedRow[] = []
  for (const line of block[1]!.split('\n')) {
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

/** The container locator: the balanced body of the FIRST `interface`/`type` declaration whose
 *  keyword-anchored header matches `name` (the landed `F-13`-remand idiom, re-implemented here
 *  for this unit's own subject rather than imported). */
function interfaceBody(text: string, name: string): { body: string; openIndex: number } | null {
  const header = new RegExp(`\\b(?:export\\s+)?(?:interface|type)\\s+${name}\\b`)
  const match = header.exec(text)
  if (match === null) return null
  const open = text.indexOf('{', match.index + match[0].length)
  if (open < 0) return null
  const body = balancedBody(text, open)
  return body === null ? null : { body, openIndex: open }
}

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

/** §2.3 ③ / §3.2 I-4 — the receipt-shape oracle: EXACTLY ONE of the two closed forms, the reason
 *  exactly the closed token, never a third status, never an absent reason on a refusal. Shared by
 *  the row and by its controls so the control discriminates the SAME code the row drives. */
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
    if ('reason' in rec) {
      problems.push(`RECEIPT-FORM (${label}): the \`committed\` form carries a \`reason\` member — §2.3 ③'s FIRST form is \`{status:'committed'}\` ONLY`)
    }
  } else if (rec.status === 'refused') {
    if (rec.reason !== RECEIPT_REASONS[0]) {
      problems.push(`RECEIPT-REASON (${label}): the reason is \`${String(rec.reason)}\` — §2.3 ③ closes the reason set at the ONE token \`'write-failed'\` (covers the mkdir, tmp-write, tmp-fsync and rename failure points ALIKE)`)
    }
  }
  return problems
}

// ===========================================================================
// THE ANTI-OVERCLAIM / NO-DURABILITY PROSE ORACLE (§6.2, §7 items 1-4 and 12) — ONE reader,
// driven over real artifacts AND over a forged corpus, so its discrimination is SHOWN rather
// than asserted. A limb that cannot fail is a defect (§5.1's anti-vacuity rule).
//
// THE INSTRUMENT EXCLUSION. The scanner must be able to NAME the claim it refuses (that is how
// a falsifier is written) and must carry the vocabulary it searches for. A scanner that reddened
// on its own documentation could never be satisfied by ANY correct instrument — the same
// "oracle that cannot pass" failure class as a vacuity. So a line that names the prohibition, or
// that is part of the instrument's own corpus, is excluded BY MARK (`FORBIDDEN` / `non-claim` /
// `honesty` / the `FORGED-CLAIM-CORPUS` marker), never by being on a list of the author's words.
// ===========================================================================
/** The TIMING/DURATION claim pattern (§6.2's forbidden figures). Units are matched as STANDALONE
 *  measurement words (`5 ms`, `200 milliseconds`, `1.2 seconds`, `40 MB/s`) — never the bare
 *  letters `s`/`ms` touching an identifier, which is what makes the oracle discriminate a FIGURE
 *  from ordinary prose. */
const TIMING_CLAIM = /\b\d+(?:\.\d+)?\s*(?:milliseconds?|seconds?|minutes?|MB\/s|ops\/s|ms\b)/i

/** The DURABILITY vocabulary (§7 item 1's forbidden claim) — prose-shaped, never a
 *  SCREAMING-CASE literal only (the vacuity the sibling register's `G-1` remand names). */
const DURABILITY_CLAIM_WORDS = ['durable', 'durability', 'crash-safe', 'crash safe', 'power loss', 'fsync completed'] as const

/** The NEGATED/LIMIT forms the contract and this unit's artifacts lawfully use: a prohibition
 *  that NAMES what it forbids is not an assertion of it. */
const CLAIM_NEGATORS = /\b(not|never|no|nowhere|none|cannot|can't|isn't|doesn't|does not|without|nor|neither|only|nothing)\b/i

/** THE ORACLE — non-empty iff `line` asserts the pattern in a CLAIM position. `scope` names the
 *  artifact so the instrument's own corpus can be excluded by MARK. */
function claimPositionProblems(line: string, scope: 'instrument' | 'subject'): string[] {
  if (/^\s*(\/\/|\*|\/\*)/.test(line)) return []
  if (/FORBIDDEN|non-claim|honesty|FORGED-CLAIM-CORPUS|TIMING_CLAIM|DURABILITY_CLAIM_WORDS/.test(line)) return []
  // A ROW OF THE SPEC'S OWN REGISTER TABLE (§5.2) OR ITS RED-SET TABLE (§4): the `falsifier`
  // column states, per row, the violation the row exists to CATCH — e.g. "a rename without the
  // tmp `fsync`" — so the vocabulary there is the REFUSED form, never this unit's claim. The
  // exclusion is keyed off the row's own form (a markdown row carrying a `P-ASW-*` row id or an
  // `RE-*` red id), so a CLAIM written anywhere else in the artifact stays visible.
  if (/^\s*\|[^|]*\|\s*(?:\*\*)?`?(?:P-ASW-[\w-]+|RE-\d+)/.test(line)) return []
  if (/^\s*\|\s*(?:\*\*)?`?(?:P-ASW-[\w-]+|RE-\d+)/.test(line)) return []
  const problems: string[] = []
  const timing = TIMING_CLAIM.exec(line)
  if (timing !== null) {
    const window = line.slice(Math.max(0, timing.index - 200), timing.index + timing[0].length + 200)
    if (!CLAIM_NEGATORS.test(window)) {
      problems.push(
        `§6.2 / §7 item 12 (${scope}): the line \`${line.trim().slice(0, 140)}\` carries a TIMING/DURATION figure in a claim position — §6.2's claim form is an ORDER claim and every artifact of this unit FORBIDS a latency, a duration and a throughput figure`,
      )
    }
  }
  if (scope === 'subject') {
    for (const token of DURABILITY_CLAIM_WORDS) {
      const at = line.toLowerCase().indexOf(token)
      if (at < 0) continue
      const window = line.slice(Math.max(0, at - 200), at + token.length + 200)
      if (CLAIM_NEGATORS.test(window)) continue
      problems.push(
        `§7 item 1 (${scope}): the line \`${line.trim().slice(0, 140)}\` asserts durability vocabulary [${token}] in a CLAIM position — no durability claim is made by any artifact of this unit`,
      )
    }
  }
  return problems
}

/** Drive the oracle over one artifact's lines. */
function claimProblemsOver(text: string, scope: 'instrument' | 'subject'): string[] {
  const problems: string[] = []
  // A MARKDOWN LIMIT-LEDGER TABLE: a table whose HEADER row carries a negation (`What that layer
  // does NOT prove`). Every data row of THAT table is a LIMIT cell — the spec's §6 ledger states,
  // per deliverable, what its evidence does NOT cover, and a limit column is by construction the
  // spec's own HONESTY, never an over-claim. Keyed off the HEADER ROW and released at the table's
  // end (the first non-`|` line), so it can never excuse a claim written anywhere else.
  let inLimitTable = false
  for (const line of text.split('\n')) {
    const tableRow = /^\s*\|/.test(line)
    if (!tableRow) inLimitTable = false
    else if (/\|\s*\|?\s*/.test(line) && /\bNOT\b/.test(line) && /prove/i.test(line)) inLimitTable = true
    if (inLimitTable && tableRow) continue
    problems.push(...claimPositionProblems(line, scope))
  }
  return problems
}

// ===========================================================================
// §6.1 / §7 — THE LAYER LEDGER AND THE HONESTY BLOCK, ASSERTED OVER THIS FILE'S OWN BYTES.
// ===========================================================================
describe('§6.1 / §7 — THE LAYER STATEMENT: this suite is `[T]`/`[H]` and NOTHING here is app-green', () => {
  it('§6.1 / §7 1-3 — the file\u2019s own text states the layer and the non-claims, and asserts NO colour', () => {
    const text = readMaybe(SELF_PATH)
    expect(text, `§6.1: this suite could not read its own bytes — the layer statement has no substrate`).not.toBeNull()
    const self = text!
    const problems: string[] = []
    if (!/\bNO DURABILITY CLAIM IS MADE\b/.test(self)) {
      problems.push('§6.1 / §7 item 1 — the file does not carry its own no-durability statement (the honesty block is required, and the §7 non-claims are its referent)')
    }
    if (!/CALL ORDER\/COUNT over an INJECTED `fs` FAÇADE/.test(self)) {
      problems.push('§6.1 / §7 item 1 — the file does not state that every atomic claim is a CALL ORDER/COUNT over the injected façade')
    }
    if (!/\bNOTHING here is app-green\b/.test(self)) {
      problems.push('§7 item 2 — the file does not state that nothing here is app-green (the node suite is ENVELOPE-green at most, and the §6 `[U]` leg is a separate ORDER claim)')
    }
    // §7 item 4 is asserted by its OWN limb below (the forbidden-phrase reading).
  })

  it('§7 item 4 — the FORBIDDEN phrase "the atomicity row is fixed" appears in no CLAIM position (the defects row STAYS OPEN)', () => {
    const text = readMaybe(SELF_PATH)
    expect(text, '§7 item 4: this suite could not read its own bytes — the forbidden-phrase limb has no substrate').not.toBeNull()
    // THE PHASE, ASSEMBLED FROM PARTS so this limb's own bytes carry no literal it searches for:
    // a scanner must be able to NAME the phrase it refuses (that is how a falsifier is written),
    // and a scanner that reddened on its own diagnostic text could never be satisfied by any
    // correct instrument — the "oracle that cannot pass" class.
    const FORBIDDEN_PHRASE = ['the atomicity row', 'is fixed'].join(' ')
    const problems: string[] = []
    for (const line of text!.split('\n')) {
      if (!new RegExp(FORBIDDEN_PHRASE, 'i').test(line)) continue
      // a line that NAMES the phrase in order to forbid it is the INSTRUMENT, never a claim
      if (/FORBIDDEN|non-claim|honesty|FORBIDDEN_PHRASE/i.test(line)) continue
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue
      problems.push('§7 item 4 — the file carries the forbidden phrase in a CLAIM position: the defects row STAYS OPEN (clause (1) is answered only for these two carriers)')
    }
    // THE DISCRIMINATING CONTROL — the SAME predicate over a corpus that writes the phrase as a
    // CLAIM must redden, else the limb is vacuous.
    const forgedClaimCorpus = [`${FORBIDDEN_PHRASE} and closed: the sweep is complete`]
    const caught = forgedClaimCorpus.filter((line) => new RegExp(FORBIDDEN_PHRASE, 'i').test(line) && !/FORBIDDEN|non-claim|honesty|FORBIDDEN_PHRASE/i.test(line))
    expect(caught.length, '§7 item 4 — the forbidden-phrase limb must SEE a forged claim; a limb that cannot fail is a defect').toBe(1)
    expect(problems, '§7 item 4 — the forbidden phrase appears in no claim position').toEqual([])
  })

  it('§2.7 C-1/C-2 — the payload censuses are UNCHANGED: NINE operator members, ONE engine member', async () => {
    const operator: string[] = [...OPERATOR_MEMBERS]
    expect(operator.length, '§2.7 C-1 — the operator payload is NINE members (a CENSUS: 9, printed with its terms)').toBe(9)
    // …read from the store's OWN `get()` over a constructed instance, so the census is a reading
    // rather than a re-typed list.
    const drive = await driveCarrierWithPath(OPERATOR_CARRIER, join(FIXTURE_ROOT, 'operator-census.json'), { seed: {} })
    if (!isDriveError(drive)) {
      const post = drive.post as Record<string, unknown> | undefined
      if (post !== undefined && post !== null && typeof post === 'object') {
        const keys = Object.keys(post).sort()
        expect(keys, '§2.7 C-1 — `get()`/`set()` still answer EXACTLY the nine members (§3.2 I-5: the coercion rules and the defaults are UNCHANGED)').toEqual([...OPERATOR_MEMBERS].sort())
      }
    }
    const engineDrive = await driveCarrierWithPath(ENGINE_CARRIER, join(FIXTURE_ROOT, 'engine-census.json'), { seed: {} })
    if (!isDriveError(engineDrive)) {
      const post = engineDrive.post as Record<string, unknown> | undefined
      if (post !== undefined && post !== null && typeof post === 'object') {
        expect(Object.keys(post).sort(), '§2.7 C-2 — the engine payload is ONE member (`engineBaseUrl`); §2.1 S-3\u2019s return shape is UNCHANGED').toEqual(['engineBaseUrl'])
      }
    }
  })

  it('§3.2 I-5 — `get()` stays TOTAL: the coercion domain is UNCHANGED on both carriers (a junk patch/baseUrl never throws)', async () => {
    const problems: string[] = []
    // the operator carrier — a hostile patch corpus
    const operatorDrive = await driveCarrierWithPath(OPERATOR_CARRIER, join(FIXTURE_ROOT, 'operator-hostile.json'), { seed: {} })
    if (!isDriveError(operatorDrive)) {
      const ns = await loadCarrier(OPERATOR_CARRIER)
      if (!('error' in ns)) {
        const facade = newFsFacade({})
        const store = (ns.createOperatorSettingsStore as (o: { path: string; fs?: unknown }) => Record<string, unknown>)({ path: join(FIXTURE_ROOT, 'operator-hostile-2.json'), fs: facade })
        const set = store.set as (p: unknown) => unknown
        const hostile: Array<[string, unknown]> = [
          ['null', null],
          ['undefined', undefined],
          ['a number', 42],
          ['a string', 'junk'],
          ['an array', []],
          ['a junk-valued object', { topK: 'ten', theme: 'chartreuse', layout: 7, tabs: 'no', enabledPanes: [1, '', 'ok'] }],
        ]
        for (const [label, patch] of hostile) {
          try {
            set.call(store, patch)
          } catch (e) {
            problems.push(`operator: \`set(${label})\` THREW (\`${(e as Error)?.message ?? String(e)}\`) — §3.2 I-5 / §2.4 m-6: a non-object \`null\` \`undefined\` patch returns \`this.get()\` UNCHANGED and NEVER throws`)
          }
        }
      }
    }
    // the engine carrier — a hostile baseUrl corpus
    const nsEngine = await loadCarrier(ENGINE_CARRIER)
    if (!('error' in nsEngine)) {
      const facade = newFsFacade({})
      const store = (nsEngine.createEngineConfigStore as (o: { path: string; fs?: unknown }) => Record<string, unknown>)({ path: join(FIXTURE_ROOT, 'engine-hostile.json'), fs: facade })
      const set = store.set as (b: unknown) => { engineBaseUrl?: unknown }
      for (const [label, value] of [['null', null], ['undefined', undefined], ['empty string', ''], ['whitespace', '   '], ['a number', 9], ['junk object', {}]] as Array<[string, unknown]>) {
        try {
          const answer = set.call(store, value)
          if (answer?.engineBaseUrl !== null) {
            problems.push(`engine: \`set(${label})\` answered \`${JSON.stringify(answer)}\` — §2.1's \`baseUrl\` domain: a non-empty trimmed string survives; null/undefined/''/a number/junk coerces to \`null\` (the unset state)`)
          }
        } catch (e) {
          problems.push(`engine: \`set(${label})\` THREW (\`${(e as Error)?.message ?? String(e)}\`) — §3.2 I-5: the coercion domain is UNCHANGED and never throws`)
        }
      }
    }
    expect(problems, '§3.2 I-5 — both carriers\' coercion domains are unchanged and total').toEqual([])
  })

  it('§2.4 m-6 — a NON-OBJECT patch runs NO `persist()`: the receipt is NOT advanced (§3.2 I-3)', async () => {
    const ns = await loadCarrier(OPERATOR_CARRIER)
    if ('error' in ns) {
      expect(ns.error, `operator/m-6: ${String(ns.error)}`).toBe('')
      return
    }
    const livePath = join(FIXTURE_ROOT, 'operator-m6.json')
    const facade = newFsFacade({})
    const store = (ns.createOperatorSettingsStore as (o: { path: string; fs?: unknown }) => Record<string, unknown>)({ path: livePath, fs: facade })
    const before = facade.calls.length
    const cold = readMember(store, 'lastWriteReceipt')
    const answer = (store.set as (p: unknown) => unknown).call(store, null)
    const callsAfter = facade.calls.length
    expect(callsAfter, '§2.4 m-6 — a `null` patch ran a persist: NO `persist()` may run (no façade leg is invoked)').toBe(before)
    expect(answer, '§2.4 m-6 — a non-object patch must return `this.get()` UNCHANGED').toEqual((store.get as () => unknown).call(store))
    const after = readMember(store, 'lastWriteReceipt')
    if (after.present) {
      expect(
        after.value,
        '§2.4 m-6 / §3.2 I-3 — a NON-OBJECT patch must NOT advance the receipt (it still reports the previous write attempt; at a cold store that is `null`)',
      ).toEqual(cold.value)
    }
  })

  it('§6.2 / §7 item 12 — the FORBIDDEN live-claim forms: no latency, duration, throughput or crash-window figure is CLAIMED in this unit\u2019s artifacts', () => {
    const artifacts: Array<[string, string | null]> = [
      ['the spec', readMaybe(SPEC_PATH)],
      ['the gate-1 record', readMaybe(REVIEW_PATH)],
      ['this suite', readMaybe(SELF_PATH)],
    ]
    const problems: string[] = []
    for (const [label, text] of artifacts) {
      if (text === null) continue
      // THE INSTRUMENT'S OWN BYTES are scanned for TIMING figures only (its durability vocabulary
      // is the deny-list it must carry); every OTHER artifact is a SUBJECT, scanned in full.
      problems.push(...claimProblemsOver(text, label === 'this suite' ? 'instrument' : 'subject'))
    }
    // THE DISCRIMINATING CONTROL — the SAME oracle over a forged claim corpus (the
    // `FORGED-CLAIM-CORPUS` mark), so the limb is shown to redden rather than asserted to.
    const forgedClaimCorpus = [
      'the write completed in 3.2 ms under load', // FORGED-CLAIM-CORPUS
      'a restart took 1.5 seconds', // FORGED-CLAIM-CORPUS
      'the record is durable on disk', // FORGED-CLAIM-CORPUS
    ]
    const missed = forgedClaimCorpus.filter((line) => claimPositionProblems(line.replace(' // FORGED-CLAIM-CORPUS', ''), 'subject').length === 0)
    expect(missed, '§6.2/§7 item 1 — the claim oracle must SEE every forged claim form; an oracle that cannot fail is vacuous').toEqual([])
    // …and the LAWNFUL negated forms must stay ADMISSIBLE, else the row reddens on a correct landing.
    const lawful = ["no durability claim is made by this unit's artifacts", 'this is NOT a latency figure']
    const falsePositives = lawful.filter((line) => claimPositionProblems(line, 'subject').length > 0)
    expect(falsePositives, '§6.2 — a NEGATED/limit form the contract itself carries must stay ADMISSIBLE').toEqual([])
    expect(problems, '§6.2 / §7 item 12 — no timing figure is claimed in any artifact this suite reads').toEqual([])
  })
})
