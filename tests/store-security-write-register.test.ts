// tests/store-security-write-register.test.ts — UNIT `U-STORE-SECURITY-WRITE`
// (3a, the FIRST half of the SPLIT unit 3 of the store-adoption program, F2) — THE
// UNIT'S OWN FORK-AUTHORED TYPED PROPERTY REGISTER, §5 of
// `docs/specs/unit-store-security-write.md`: the THIRTEEN rows — the NINE `[T]` rows
// (`P-SSW-IM-1..6` · `P-SSW-SM-1` · `P-SSW-TP-1..2`) + the FOUR `[H]` rows
// (`P-SSW-H-1..4`).
//
// SOURCE OF EVERY ASSERTION (spec ONLY — the FOUNDATION's `store-security.md` §5.5.1
// register, `8` rows / `50 = 6 + 4 + 4 + 8 + 6 + 8 + 8 + 6`, is the SHAPE source ALONE;
// its ids, seed, terms and layer are THAT project's and are never copied here §5):
//   docs/specs/unit-store-security-write.md
//     §0 R-1..R-7   the rulings this unit derives from (the SPLIT 3a/3b; the foundation's
//                   contract as the SHAPE source; the type's home DIVERGENT to
//                   `src/shared/types.ts` (`K-1`); `VALID_GROUPS` NOT re-opened (`K-3`,
//                   NINE); THE DENIED SURFACE (§1.2); the sequential landing order; the
//                   layer split `[H]`-shim/`[T]` with NO durability claim of any kind)
//     §0 S-P-1..-7  the supersession pointer edges — S-P-1 (the swallow's doc-comment →
//                   the receipt), S-P-2 (`set()`'s return UNMOVED; only the CHANNEL
//                   response + the preload's DECLARED resolution widen), S-P-3 (the
//                   `preload.ts` md5 row re-stated in THIS unit's own commit)
//     §1.1          the SIX-member change set (the store's write discipline; the receipt
//                   type's home; the `IPC_SECURITY_SET` return's additive `write` member;
//                   the TWO preload declarations; the md5 re-statement; THIS + the
//                   sibling guard): a different member set is §3 `F-1`
//     §1.2          the ELEVEN DENIED rows (no `src/renderer/**` byte — that is 3b's; no
//                   `VALID_GROUPS` change; no `SecuritySettings` widening; no second
//                   `securityStore.set(` call site; no new refusal site; no MCP surface)
//     §2.1 S-1..S-5 the store's declared surface: `createSecurityStore` (UNCHANGED
//                   signature; the `fs?` façade ADDITIVE-OPTIONAL) · `get()` (a FRESH
//                   copy, UNCHANGED) · `set(patch)` (RETURN SHAPE UNCHANGED — a receipt
//                   return is the PRICED, NOT-TAKEN alternative) · `lastWriteReceipt()`
//                   (NEW; `null` ONLY before the first write attempt) · `SecurityStoreFs`
//                   (the injected façade: `renameSync` · `fsyncSync` · `mkdirSync` · the
//                   tmp write + the read/`existsSync` legs; ABSENT ⇒ real `node:fs`)
//     §2.1 params   the parameter-semantics rows: an EMPTY `path` answers `refused`; a
//                   non-array `groups`/`disable` is IGNORED (never a throw);
//                   `token` non-empty-string-or-null (`''` CLEARS; `undefined` KEEPS);
//                   `maxJournalLength` positive-and-floored-or-undefined (`0`/negative/
//                   `NaN`/`null` CLEAR; `undefined` KEEPS)
//     §2.2          `SecurityWriteReceipt = {status:'committed'} | {status:'refused';
//                   reason:'write-failed'}` — TWO CLOSED FORMS, the reason set CLOSED at
//                   the ONE token; NEVER a member of the store's refusal union (`K-2`);
//                   its home is `src/shared/**`; `SecuritySettings` NOT widened
//     §2.3          `VALID_GROUPS` is exactly NINE (`read` · `dispatch` · `graph` · `code`
//                   · `module` · `rag` · `edit` · `gnosis` · `gnosis-edit`), UNCHANGED
//     §2.4 items 1-6 the atomic five-step write IN ORDER (`mkdirSync(dirname,{recursive})`
//                   → tmp write → `fsync(tmp)` → `renameSync(tmp, path)` → `fsync(dir)`;
//                   the tmp fsync BEFORE the rename, the DIRECTORY fsync AFTER it); the
//                   TMP FATE (no residual tmp after a success; a stale tmp OVERWRITTEN and
//                   NEVER read as input; the boot read reads the REAL path ONLY); the
//                   receipt REPLACING the swallow; the SET return `{...updated, write:
//                   lastWriteReceipt()}`; the fail-states (each failure point leaves the
//                   previous file intact; a refusal CLEARS NOTHING, EMITS NOTHING)
//     §2.5          the TWO `security.set` declaration sites, BOTH widened to
//                   `SecuritySettings & { write: SecurityWriteReceipt }`
//     §3.1          THE INVARIANT — the live gate and the in-memory settings ALWAYS agree;
//                   the file may lag and the REFUSED RECEIPT is its SOLE carrier
//     §3.2 I-1..I-7 the rules: the FAILED-WRITE-INTACT rule; THE TMP FATE; the boot read's
//                   corrupt-at-read-back posture UNCHANGED; RECEIPT TOTALITY; the reason is
//                   never a third token; the sanitize semantics UNCHANGED; the NINE census
//     §3.3 1..3     THE THREE OBSERVABILITY LEGS — (1) the additive member; (2) the two
//                   preload declarations; (3) A REGISTER LEG DRIVING `IPC_SECURITY_SET`
//                   DIRECTLY at its real site, because EVERY renderer `set()` call site
//                   DISCARDS the resolution (`secure-panels.ts`'s four handler bodies are
//                   fire-and-forget) — a register whose receipt rows are all
//                   renderer-driven is a FINDING
//     §4 RE-1..RE-5 THE RED SET — every landing-driven row RED at this unit's own head
//                   (the member-absent / wrong-sequence / façade-absent / surface-absent
//                   classes), and §4's no-other-red rule with its pre-recorded exemptions
//     §5.1/§5.2     the thirteen rows, their strategy ids, their declared terms, the
//                   arithmetic, the caps and the honesty block
//
// LAYER (RCA-12 / §5.2 / §6, mandatory and binding). `[T]`/`[H]` ONLY. **NOTHING here is
// app-green, envelope-green, store-green, engine-green or live-green.** The atomic
// five-step write is asserted as a CALL ORDER/COUNT over an INJECTED `fs` façade — SHAPE
// ONLY: **NO DURABILITY CLAIM IS MADE ANYWHERE IN THIS FILE** (§6's honesty block; §5.1
// `P-SSW-H-4` is the anti-overclaim row that polices exactly this). The `fsync` legs are
// SHAPE-asserted as invocations, never as a completed crash-safe persist.
//
// THE INSTRUMENTS (each row PRINTS its instrument). Three, tracked distinctly:
//   (1) THE DRIVEN STORE — `createSecurityStore(opts)` over an INJECTED `fs` façade
//       (`§2.1 S-5`), the façade RECORDING the calls the subject makes and the ORDER it
//       makes them in. The store module imports `node:fs` and `node:path` ONLY (§2.1
//       `S-1`), so it is importable in the node realm — the façade is the INJECTION, not
//       a module mock.
//   (2) THE BYTE-SCAN SURFACE PINS — the `[H]` class (`src/main/preload.ts`'s two
//       declarations; `src/shared/types.ts`'s receipt home; `src/main/main.ts`'s SET
//       return; the md5 row of `tests/pd-ui-1-theme-register.test.ts`).
//   (3) THE REGISTER LEG DRIVING `IPC_SECURITY_SET` DIRECTLY (§3.3 leg 3) — driven at the
//       handler's SUBSTRATE (`src/main/main.ts`'s registration block), never through a
//       renderer call site.
//
// THE `RED-BY-SHIM` / `RED-BY-ABSENCE` / `GREEN-ON-ARRIVAL` CLASSIFICATION (recorded per
// row, §4). At this head the module HAS no `lastWriteReceipt()`, the `SecurityStoreOptions`
// facade member `fs` is absent, the write is the landed NON-atomic `mkdirSync` + plain
// `writeFileSync` inside a swallowing `catch`, `SecurityWriteReceipt` is declared NOWHERE,
// and the preload's two declarations are un-widened. Four verdict classes are therefore
// tracked DISTINCTLY and printed per row:
//   `RED-BY-ABSENCE`   — the row's subject member/surface does not exist at this head; the
//                        drive names the absent subject as its counterexample.
//   `RED-BY-SHIM`      — the row's oracle RUNS against the injected façade and reports the
//                        pinned property UNSATISFIED. The injected façade IS this unit's
//                        declared `RED-BY-SHIM` instrument (ruling (vi)/§0 R-7): with the
//                        façade ABSENT from `SecurityStoreOptions` the four arms cannot be
//                        independently driven, and each arm's own drive reports the
//                        absent-subject class BY NAME — the shim can never make a missing
//                        production surface green.
//   `GREEN-ON-ARRIVAL` — the row asserts a property ALREADY TRUE at this head (a
//                        negative/denied-surface pin, or the landed sanitize semantics).
//                        Marked explicitly, never counted as a landing-driven red (§4's
//                        no-other-red rule).
//   `GREEN`            — the row's property holds over the subscribed subject at this head
//                        AND is landing-driven (the census/pin rows whose subject IS
//                        landed). Reported `GREEN`, never conflated with a landing-driven
//                        red and never claimed as app-green.
// Reporting a `RED-BY-SHIM` row as a pass is the honesty class this header exists to
// prevent; reporting a `GREEN-ON-ARRIVAL` row as red is §4's no-other-red violation.
//
// THE WALL: this file touches NOTHING but its own bytes. No `src/**` byte, no landed test
// file, no spec/tracker byte, no `vitest.config.ts`/`package.json` byte.
//
// ===========================================================================
// THE HEADER RECONCILIATION NOTE — `A-3A-2` ① (2026-10-04), THE RE-AIMs TO THIS FILE
// (`RCA-8(c)` ANNOTATE-BESIDE: the as-filed text is KEPT VISIBLE above and this block is
// the OPERATIVE disposition; `A-3A-1` stands as filed and `A-3A-2` ① EXTENDS it to the
// limbs the first re-aim wall did not reach — the same author-role class).
//
// THE DRIFT THIS CLOSES. `A-3A-1` ① (superseding §1.1 member 2 / §2.2 IN PART) moved
// `SecurityWriteReceipt`'s home to **`src/main/security-store.ts`** — SELF-CONTAINED,
// EXPORTED, `readonly`, NO import — and left **`src/shared/types.ts` NOT MOVED BY THIS
// UNIT** (its four landed digest pins stay untouched). The §2.2 shared-home limbs in THIS
// file were not re-aimed with that ruling, so they still asserted the AS-FILED home.
//
// ① `P-SSW-H-1` PIN 1 (`receiptHomeProblems`'s `RECEIPT-HOME` limb) — **RE-AIMED.**
//    BEFORE: `/export\s+type\s+SecurityWriteReceipt\s*=/` demanded over `src/shared/types.ts`.
//    AFTER:  the SAME demand over `src/main/security-store.ts` (the RULED home); the
//    declaration-form pin `RECEIPT-FORM` reads the RULED home's declaration. The pin's
//    counterexample is UNCHANGED IN KIND: a landing that declares the type NOWHERE (this
//    head) still reddens it by absence — and it now also reddens a landing that declares it
//    only in the superseded shared home, which is exactly the drift the ruling names.
//
// ② `P-SSW-H-1` PIN 2 — **THE AS-FILED `RECEIPT-HOME-COLLISION` LIMB IS WITHDRAWN AS
//    ANTI-QUATED** (`A-3A-2` ①: "it asserted the superseded home by forbidding the ruled
//    one"). The withdrawn limb read:
//      "`RECEIPT-HOME-COLLISION`: `SecurityWriteReceipt` is named in
//       `src/main/security-store.ts` — §2.2/`K-1` homes it in `src/shared/**`…"
//    It could not survive the ruling: the home it forbade IS the ruled home.
//    **ITS INTENT IS PRESERVED AS THE `RECEIPT-HOME-DUPLICATE` LIMB** — the identifier must
//    be DECLARED in **EXACTLY ONE** of the two files (`src/shared/types.ts` /
//    `src/main/security-store.ts`), and a declaration in BOTH reddens it. The FALSIFIER
//    SURVIVES, re-aimed; only WHICH file the declaration names changed, per the ruling.
//    • STILL CAUGHT: the type declared in the RULED home WHILE the as-filed shared
//      declaration is LEFT IN PLACE — two competing homes for one type (the dirty-state
//      class this re-aim exists to make visible; ONE home is the preserved property).
//    • DELIBERATELY DEADENED: "the identifier appears in the store module" — now REQUIRED.
//    • SUBJECT = the DECLARATION form (`export type|interface SecurityWriteReceipt =`), NOT a
//      bare mention: `src/main/preload.ts` lawfully names the identifier in its TWO widened
//      returns (§3.3 leg 2), so a bare-occurrence count would redden on a lawful surface.
//    • THE POSITIVE CONTROL IS RE-AIMED WITH ITS PIN: the forged DUPLICATE-DECLARATION corpus
//      (the ruled home + a leftover shared declaration) must trip the oracle, AND the forged
//      RULED-ONLY corpus (the ruling's own mandated layout) must NOT.
//
// ③ THE TERMS ARE UNMOVED: `P-SSW-H-1` stays `3 pins + 1 control = 4`; the register's
//    arithmetic stays `78` with `P-SSW-IM-4` at its RULED `10`; the seed `0x20260927` and the
//    caps (`≤100`/row · `≤400` total) are unmoved. NO PROPERTY IS WEAKENED: "exactly one home,
//    and it is the declared one" holds before and after.
// ===========================================================================
import { describe, it, expect, afterAll } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-write.md')
const STORE_PATH = join(REPO_ROOT, 'src', 'main', 'security-store.ts')
const TYPES_PATH = join(REPO_ROOT, 'src', 'shared', 'types.ts')
const MAIN_PATH = join(REPO_ROOT, 'src', 'main', 'main.ts')
const PRELOAD_PATH = join(REPO_ROOT, 'src', 'main', 'preload.ts')
const THEME_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const SELF_PATH = join(HERE, 'store-security-write-register.test.ts')
/** THE REGISTER'S SUBJECT PATH (§2.1's `path` parameter). It lives under the OS TEMP root, NOT
 *  under the repo: the drives assert a SHAPE over an INJECTED façade, but two rows legitimately
 *  reach the REAL `node:fs` (the ABSENT-façade inertness control and §1.2 item 9's scans of the
 *  landed tree), and a repo-relative subject would let a driven `set()` mint `userData/…` inside
 *  the working tree. The subject is a path the drives never require to exist.
 *
 *  `⟶ RE-AIM ④ (the `A-3A-1` ④ RULING — THE INTER-FILE CONTAMINATION FIX).` `P-SSW-IM-4`
 *  control 2 asserts `existsSync(realPath) === false` as its discriminator (a REAL file beside
 *  the injected one would mean the real `fs` was reached). The AS-FILED fixture root was the
 *  FIXED literal `<tmpdir>/provident-ssw-register/…`, and `P-SSW-IM-4` control 1 drives the
 *  store over the REAL `node:fs` — so a `set()` there could MINT a real file at that path and
 *  LEAVE IT BEHIND. Running the sibling guard (`tests/pd-store-security-write.test.ts`) in the
 *  SAME process then found the residue and reddened `P-SSW-IM-4` for a reason that had nothing
 *  to do with the unit's properties: the row's verdict depended on WHICH FILES ran before it.
 *  A row whose outcome depends on invocation order is not falsifiable against its own property.
 *
 *  THE FIX: the fixture root is PER-PROCESS-UNIQUE (`<tmpdir>/provident-ssw-register-<pid>-
 *  <per-process uid>`), so no two processes — and no two files in one process — can share it,
 *  AND it is DRAINED at teardown (`afterAll`), so a same-process re-invocation starts clean
 *  either way. The row is now STABLE UNDER EITHER INVOCATION: alone, or after a sibling that
 *  reaches the real `fs`. */
const REGISTER_FIXTURE_ROOT = join(
  tmpdir(),
  `provident-ssw-register-${process.pid}-${(process.hrtime.bigint() % 1000000n).toString(36)}`,
)
const REGISTER_SUBJECT_PATH = join(REGISTER_FIXTURE_ROOT, 'provident-security.json')
const SRC_DIR = join(REPO_ROOT, 'src')

// `⟶ RE-AIM ④ (cont.)` — THE TEARDOWN DRAIN. The fixture root is per-process-unique (above),
// and it is REMOVED at teardown so the row can never depend on a previous run's residue —
// under EITHER invocation order (this file alone, or this file after a sibling that reaches
// the real `node:fs`). A drain failure is silent by design (the root is under the OS temp dir
// and a concurrent process may hold it); the PROPERTY that matters — no cross-file
// contamination — is carried by the unique root, and the drain is the belt to that brace.
afterAll(async () => {
  try {
    const { rmSync } = await import('node:fs')
    rmSync(REGISTER_FIXTURE_ROOT, { recursive: true, force: true })
  } catch {
    /* the unique root is the contract; the drain is best-effort */
  }
})

// ===========================================================================
// §5 / §5.2 — SHARED MACHINERY, pinned once and binding on every row.
// Seed `REGISTER_SEED = 0x20260927` (a fixed literal — never `Date.now()`, never
// `Math.random()`, never an environment read; distinct from the sibling registers'
// `0x20261004`); a hand-rolled 32-bit LCG, ONE STEP PER DRAW
// (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`, `index = stateₙ₊₁ mod pool.length`);
// caps ≤100 attempts per row · ≤400 in total; rows run SEQUENTIALLY in register order;
// STOP AFTER 5 CONSECUTIVE FAILURES (abandonment is REPORTED through `stoppedAt`, never
// hidden; an un-run row is a FAILURE, never a pass).
// ===========================================================================
const REGISTER_SEED = 0x20260927
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

/** The four verdict classes of this unit's red (see the header). */
type RedClass = 'RED-BY-ABSENCE' | 'RED-BY-SHIM' | 'GREEN-ON-ARRIVAL' | 'GREEN'

interface DeclaredRow {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors (§5.1/§5.2) */
  declared: string
  declaredTotal: number
  layer: '[T]' | '[H]'
  /** §4's red class, recorded per row at THIS head */
  redHeadClass: RedClass
  redHeadNote: string
  /** §4 — the red id this row's failing limb answers to (`RE-1`..`RE-5`) */
  redId: string
}

const DECLARED_REGISTER: DeclaredRow[] = [
  {
    row: 'P-SSW-IM-1',
    strategyId: 'S-SSW-ATOM-1',
    declared: '3 drives × 2 readings = 6',
    declaredTotal: 6,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-2): THE ATOMIC SHAPE IS ABSENT — the landed persist() records `mkdir → plain write` over the injected facade (no tmp, no fsync, no rename), so the call-order recorder observes the WRONG sequence and the rename/fsync arms are never reached; the residual-tmp and stale-tmp limbs report the absent tmp leg',
    redId: 'RE-2',
  },
  {
    row: 'P-SSW-IM-2',
    strategyId: 'S-SSW-ATOM-2',
    declared: '3 injection points × 2 readings + 2 controls = 8',
    declaredTotal: 8,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-3): the four facade arms cannot be DRIVEN — `SecurityStoreOptions` carries no `fs` member, so the facade resolves NOWHERE; each injection-point drive reports the absent-subject class BY NAME (the real `node:fs` is what the landed store reaches regardless of the injected facade)',
    redId: 'RE-3',
  },
  {
    row: 'P-SSW-IM-3',
    strategyId: 'S-SSW-TMP-1',
    declared: '3 boot states × 2 readings = 6',
    declaredTotal: 6,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-3): the boot read cannot be driven over the INJECTED facade (no `fs` member) — the three boot states (valid real file · a valid-looking tmp ALONE · a corrupt real file) report the absent-facade class; the corrupt/default posture is separately DRIVEN over the real `node:fs` in a temp dir, where the landed behavior is GREEN-ON-ARRIVAL (never counted as a landing-driven red)',
    redId: 'RE-3',
  },
  {
    row: 'P-SSW-IM-4',
    strategyId: 'S-SSW-SHIM-1',
    // §5.1 declares this row's term as `8 = 4 façade arms × 2 readings + 2 controls`. That
    // printed expression does NOT sum to its own printed total (4 × 2 + 2 = 10, not 8). The
    // row EXECUTES the expression's own drives (4 × 2 readings + 2 controls) and PRINTS the
    // arithmetic honestly; `§5.2`'s rule is that the register's printed sum is the authority
    // and that each term is printed as its drives + controls — so the term below prints what
    // RUNS, and the SPEC's `8` is recorded as the divergent figure it is (a spec-arithmetic
    // discrepancy, reported to the supervisor rather than silently reconciled).
    declared: '4 facade arms × 2 readings + 2 controls = 10 (the spec prints `= 8` — that printed expression does not sum to its own total: 4 × 2 + 2 = 10)',
    declaredTotal: 10,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 RE-3): the facade is ABSENT — the four arms (`mkdirSync` · the tmp write · `fsyncSync` · `renameSync`) cannot be INDEPENDENTLY throwable because the store cannot be handed one; each arm reports the absent-seam class, and the ABSENT-facade inertness control cannot be discriminated either',
    redId: 'RE-3',
  },
  {
    row: 'P-SSW-IM-5',
    strategyId: 'S-SSW-CENS-1',
    declared: '4 drives = 4',
    declaredTotal: 4,
    layer: '[T]',
    redHeadClass: 'GREEN-ON-ARRIVAL',
    redHeadNote:
      'GREEN-ON-ARRIVAL (ruling (vii)/`K-3`; §3.2 I-7): `VALID_GROUPS` is ALREADY exactly NINE at this head (verified by read, printed with its terms) and this unit RE-OPENS nothing — the row holds BEFORE and AFTER, and a landing that reddens it has committed §3 `F-1` (a five-member set is the falsifier). Recorded, never counted as a landing-driven red.',
    redId: '—',
  },
  {
    row: 'P-SSW-IM-6',
    strategyId: 'S-SSW-CENS-2',
    declared: '5 drives = 5',
    declaredTotal: 5,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-1): the no-second-writer / no-second-refusal-site censuses are DRIVEN over the real tree and hold at this head — but the RECEIPT-HOME limb fails: `SecurityWriteReceipt` resolves NOWHERE (`src/main/security-store.ts` carries no such declaration at this head — THE RULED HOME per `A-3A-2` ① / `A-3A-1` ①; `src/shared/types.ts` IS NOT MOVED by this unit), so the limb that pins the type\'s home and the offender set is unsatisfied BY ABSENCE',
    redId: 'RE-1',
  },
  {
    row: 'P-SSW-SM-1',
    strategyId: 'S-SSW-ASM-1',
    declared: '3 machine states × 2 terminals = 6',
    declaredTotal: 6,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-1): the atomic-write MACHINE cannot leave IDLE — `lastWriteReceipt()` is ABSENT, so no terminal receipt exists at any of the three states; every state × terminal drive reports the absent member by name (the receipt is answered ONLY at a terminal, and there are no terminals to read)',
    redId: 'RE-1',
  },
  {
    row: 'P-SSW-TP-1',
    strategyId: 'S-SSW-RCPT-1',
    declared: '4 outcome classes × 2 assertions = 8',
    declaredTotal: 8,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-1): RECEIPT TOTALITY has no subject — after a `set()` the store answers NO receipt on `lastWriteReceipt()` (member absent) and the SET handler\'s return carries NO `write` member; all four outcome classes report the absent form on BOTH surfaces',
    redId: 'RE-1',
  },
  {
    row: 'P-SSW-TP-2',
    strategyId: 'S-SSW-SAN-1',
    declared: '8 patch classes = 8',
    declaredTotal: 8,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-4 — SPLIT, stated honestly): the POST-STATE limbs are GREEN-ON-ARRIVAL (the landed sanitize semantics are exactly what §2.1\'s parameter rows declare — recorded, never counted as a landing-driven red), while the RECEIPT-EXISTENCE limb fails by absence (no `lastWriteReceipt()` member) — RE-4 is therefore recorded as the row\'s ONE landing-driven red, with its green-on-arrival half named',
    redId: 'RE-4',
  },
  {
    row: 'P-SSW-H-1',
    strategyId: 'S-SSW-PRE-1',
    declared: '3 pins + 1 control = 4',
    declaredTotal: 4,
    layer: '[H]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-5): the receipt\'s HOME is absent — `SecurityWriteReceipt` is declared NOWHERE in `src/main/security-store.ts` (THE RULED HOME per `A-3A-2` ① / `A-3A-1` ①) at this head — and BOTH `security.set` declaration sites in `src/main/preload.ts` read the CURRENT, UN-WIDENED text, so the byte-scan reports the un-widened declaration at both sites. The RE-AIMED duplicate-home limb is GREEN-ON-ARRIVAL at this head (ZERO declaration homes: `src/shared/types.ts` IS NOT MOVED, so a single home cannot be duplicated) — recorded, never counted as a landing-driven red',
    redId: 'RE-5',
  },
  {
    row: 'P-SSW-H-2',
    strategyId: 'S-SSW-IPC-1',
    declared: '2 outcome classes × 2 readings + 1 renderer-discard reading = 5',
    declaredTotal: 5,
    layer: '[H]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-5): THE THIRD OBSERVABILITY LEG (§3.3 leg 3) is driven at the handler\'s SUBSTRATE — the `IPC_SECURITY_SET` registration block in `src/main/main.ts` reads `return updated`, carrying NO additive `write` member — so both outcome-class readings fail; the renderer-discard negative (a renderer-driven row CANNOT observe the receipt) is DRIVEN and holds at this head',
    redId: 'RE-5',
  },
  {
    row: 'P-SSW-H-3',
    strategyId: 'S-SSW-MD5-1',
    declared: '3 pins + 1 control = 4',
    declaredTotal: 4,
    layer: '[H]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 RE-5 / §4\'s PRE-RECORDED AMENDMENT-ROW-1 EXEMPTION; `O-2`): the `src/main/preload.ts` row of `tests/pd-ui-1-theme-register.test.ts`\'s `UNTOUCHED_DIGESTS` is EXPECTED RED from the preload\'s widening until the re-statement lands IN THE SAME COMMIT — the row must not yet carry `restated: \'U-STORE-SECURITY-ADOPT\'`; it reads the superseded `U-STORE-PERSIST-ADOPT` and the un-moved md5 literal `f24ea717a5f8f93a3ac490334611d22a`',
    redId: 'RE-5',
  },
  {
    row: 'P-SSW-H-4',
    strategyId: 'S-SSW-HON-1',
    declared: '2 instrument classes × 2 readings = 4',
    declaredTotal: 4,
    layer: '[H]',
    redHeadClass: 'GREEN-ON-ARRIVAL',
    redHeadNote:
      'GREEN-ON-ARRIVAL (§6\'s honesty block): the ANTI-OVERCLAIM row — no artifact of this unit claims durability, real-`fsync` completion or bytes-on-disk-after-a-crash. The property is a NEGATIVE over the artifacts\' own text and holds at this head; it must STAY green at the landed head (a durability token appearing in an assertion text, a DONE row or the park artifact reddens it)',
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

/** A bounded attempt loop: `check` yields a counterexample string or `null` when the attempt
 *  HELD. The attempt is ALWAYS counted; the row's remaining attempts are abandoned once
 *  `STOP_AFTER` CONSECUTIVE failures have been seen, and the abandonment is reported through
 *  `stoppedAt` — never hidden. */
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

async function check(run: RowRun, i: number, body: () => string | null | Promise<string | null>): Promise<void> {
  if (run.stoppedAt !== null || run.attempts >= CAPS.perRow) return
  let ce: string | null
  try {
    ce = await body()
  } catch (e) {
    ce = (e as Error)?.message ?? String(e)
  }
  attempt(run, i, ce)
}

function finish(id: string, run: RowRun): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error(`SSW register failure: ${id} is not a declared register row`)
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
    layer: declared.layer,
    redClass: declared.redHeadClass,
    redId: declared.redId,
    counterexamples: run.counterexamples,
    limbs: run.limbs,
  }
  REPORTS.push(report)
  // eslint-disable-next-line no-console
  console.log(
    `SSW ROW ${id} ${declared.strategyId}: ${held ? 'held' : 'BROKEN'} · declared ${declared.declared} = ${declared.declaredTotal} · ` +
      `executed ${executed} · stoppedAt ${String(run.stoppedAt)} · red-class ${declared.redHeadClass} (${declared.redId}) · ` +
      `limbs ${run.limbs.map((l) => `${l.index}:${l.held ? 'held' : 'BROKEN'}`).join(',')}` +
      (run.counterexamples.length > 0 ? `\n    counterexamples: ${run.counterexamples.slice(0, 3).join('\n    | ')}` : ''),
  )
  expect(
    held,
    `${id} ${declared.strategyId}: declared ${declared.declared} = ${declared.declaredTotal} attempt(s); executed ${executed}; stoppedAt ${String(run.stoppedAt)} — ${held ? 'HELD' : 'BROKEN'}${
      run.counterexamples.length > 0 ? `; counterexamples: ${run.counterexamples.slice(0, 3).join(' | ')}` : ''
    }`,
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
  if (thrown !== null) attempt(run, run.attempts + 1, thrown)
  finish(id, run)
}

// ===========================================================================
// §2 / §2.1 / §2.3 — THE REGISTER'S TYPED VOCABULARY (closed token sets the rows drive;
// each is the SPEC's own, carried here so a third receipt status, a re-spelled reason
// token or an invented atomic step can never be typed into a row).
// ===========================================================================
/** §2.2 — the receipt's CLOSED status pair. A third status is §3.2 I-4's falsifier. */
const RECEIPT_STATUSES = ['committed', 'refused'] as const
/** §2.2 / §3.2 I-5 — THE REASON SET IS CLOSED AT THE ONE TOKEN. */
const RECEIPT_REASONS = ['write-failed'] as const
/** §2.3 / ruling (vii) — THE NINE-MEMBER CENSUS, printed with its terms. */
const NINE_GROUPS = ['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit'] as const
/** §2.4 item 1 — the atomic five-step SHAPE, in order. The `mkdir` step is CONDITIONAL
 *  (`if needed`) and is therefore asserted as `0..1` occurrences, never exactly once
 *  (§2.4 item 2 asserts ONE AT MOST, never a required one). */
const ATOMIC_STEPS = ['mkdir', 'writeTmp', 'fsyncTmp', 'rename', 'fsyncDir'] as const
type AtomicStep = (typeof ATOMIC_STEPS)[number]
/** §2.1 `S-5` — THE FOUR FAÇADE ARMS. The spec names the throwable arms as
 *  `renameSync` · `fsyncSync` · `mkdirSync` · the tmp write. */
const FACADE_ARMS = ['mkdirSync', 'tmpWrite', 'fsyncSync', 'renameSync'] as const
type FacadeArm = (typeof FACADE_ARMS)[number]
/** §2.1 — THE STORE'S REFUSAL UNION tokens (the STORE's own; `K-2`). The receipt's
 *  `'write-failed'` token is NEVER a member (`§2.2`; §3.2 I-5). */
const STORE_REFUSAL_TOKENS = ['undeclared-name', 'tier-filter-miss', 'secure-refused', 'cap-exceeded', 'no-such-anchor'] as const
/** §3.3 leg 3 / §1.2 item 9 — the refused-receipt spelling this unit must NEVER introduce
 *  as a STORE union member or a new refusal site. Built from PARTS so THIS FILE'S OWN
 *  BYTES carry no forbidden literal while the scan still searches for it (the `H-9`
 *  zero-spelling scan of §5.1 `P-SSW-IM-6` drive 4). */
const SECURE_REFUSED_TOKEN = ['secure', 'refused'].join('-')
/** §1.2 item 9 / §2.2 — the receipt's reason token, likewise assembled from parts so the
 *  needle never appears as a literal in this file's own bytes. */
const WRITE_FAILED_TOKEN = ['write', 'failed'].join('-')
/** §6 — THE DURABILITY-VOCABULARY SET, carried as the INSTRUMENT'S OWN WORD LIST (the
 *  words the scan LOOKS FOR, never a claim of this file's). See `P-SSW-H-4` below for the
 *  re-aim that made this row falsifiable: the AS-FILED set was the four SCREAMING-CASE
 *  literals `DURABLE-ON-DISK` · `CRASH-SAFE-ON-DISK` · `BYTES-ON-DISK-AFTER-CRASH` ·
 *  `FSYNC-COMPLETED-ON-DISK`, which appear in NO artifact of this unit, so the row could
 *  never redden; the OPERATIVE subject is the PROSE-SHAPED over-claim. */
const DURABILITY_TOKENS = ['durable', 'durability', 'crash-safe', 'crash safe', 'survives a power loss', 'survive a power loss', 'bytes on disk', 'torn-file-free', 'fsync completed', 'fsync-completed'] as const
/** §2.5 — the widened return type's spelling, assembled so the needle is exact. */
const WIDENED_RETURN = ['SecuritySettings', ' & { write: ', 'SecurityWriteReceipt', ' }'].join('')
/** §1.1 member 5 / `S-P-3` — the md5 literal the re-statement must keep VISIBLE, and the
 *  unit name the re-statement must carry. */
const SUPERSEDED_PRELOAD_MD5 = 'f24ea717a5f8f93a3ac490334611d22a'
const RESTATING_UNIT = 'U-STORE-SECURITY-WRITE'
const RESTATEMENT_TARGET_UNIT = 'U-STORE-SECURITY-ADOPT'
const CURRENT_RESTATING_UNIT = 'U-STORE-PERSIST-ADOPT'

// ===========================================================================
// THE BYTE-SCAN HELPERS — the durable `[H]` instrument (the substrate exists at every head;
// red-by-absence where the subject does not).
// ===========================================================================
function readMaybe(path: string): string | null {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : null
  } catch {
    return null
  }
}

function srcFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(p)
    }
  }
  walk(SRC_DIR)
  return out
}

/** THE STORE MODULE'S IMPORT CLOSURE — the `fs`-façade injectability reading (§2.1 `S-5`).
 *  `src/main/security-store.ts` imports `node:*` ONLY, which is what makes the module
 *  importable in the node realm AND is the precondition of the injection being a FAÇADE
 *  rather than a module mock. */
function storeModuleProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(STORE_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, STORE_PATH)} does not exist — the store has no principal edit target (§2.1)`)
    return problems
  }
  const specifiers = [...text.matchAll(/^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]!)
  const foreign = specifiers.filter((s) => !s.startsWith('node:') && !s.startsWith('./') && !s.startsWith('../'))
  if (foreign.length > 0) {
    problems.push(`MODULE-CLOSURE: the store imports the non-node specifier(s) [${foreign.join(', ')}] — the injected fs facade is a FAÇADE over \`node:fs\`, never a module mock (§2.1 S-5)`)
  }
  if (!specifiers.includes('node:fs')) {
    problems.push(`MODULE-CLOSURE: the store does not import \`node:fs\` — §2.4's atomic five-step write and the boot read are fs operations (§2.4 item 1)`)
  }
  return problems
}

// ===========================================================================
// THE INJECTED FS FAÇADE + THE INJECTED PATH — §2.1 `S-5`'s instrument.
// **SHAPE ONLY**: the façade RECORDS the calls the subject makes and the ORDER it makes them
// in. It never models fsync completion, power loss or crash recovery — and no assertion in
// this file claims it does (§6's honesty block; §5.1 `P-SSW-H-4`).
//
// THE FAÇADE'S SHAPE is the CLOSED surface §2.1 `S-5` declares: `renameSync` · `fsyncSync` ·
// `mkdirSync` · the tmp write, plus the read/`existsSync` legs the boot read uses. Every
// member is supplied (the real-store shape), and each of the four arms is throwable
// INDEPENDENTLY through `failAt`.
// ===========================================================================
interface FsCall {
  step: AtomicStep | 'writeTmp'
  target: string
}

interface FsFacade {
  calls: FsCall[]
  /** the in-memory file table the façade serves: path → bytes */
  files: Map<string, string>
  /** the arm that FAILS when the façade reaches it (null = nothing fails) */
  failAt: FacadeArm | null
  mkdirSync: (dir: string, opts?: { recursive?: boolean }) => void
  writeFileSync: (path: string, data: string, opts?: unknown) => void
  openSync: (path: string, flags: string) => number
  fsyncSync: (fd: number) => void
  closeSync: (fd: number) => void
  renameSync: (from: string, to: string) => void
  readFileSync: (path: string, enc?: string) => string
  existsSync: (path: string) => boolean
}

function newFsFacade(options?: { failAt?: FacadeArm | null; seed?: Record<string, string> }): FsFacade {
  const files = new Map<string, string>(Object.entries(options?.seed ?? {}))
  const calls: FsCall[] = []
  const failAt = options?.failAt ?? null
  const boom = (arm: FacadeArm, target: string): void => {
    if (failAt === arm) throw new Error(`INJECTED-FAILURE at ${arm} (${target})`)
  }
  const dirs = new Set<string>()
  return {
    calls,
    files,
    failAt,
    mkdirSync: (dir) => {
      calls.push({ step: 'mkdir', target: dir })
      boom('mkdirSync', dir)
      dirs.add(dir)
    },
    writeFileSync: (path, data) => {
      // The TMP WRITE leg (§2.4 item 1's step 2). The REAL path is never a tmp target — a
      // `writeFileSync` whose path is NOT `${path}.tmp` is the ABSENT-TMP reading the shape
      // oracle names.
      calls.push({ step: 'writeTmp', target: path })
      boom('tmpWrite', path)
      files.set(path, data)
    },
    openSync: (path, flags) => {
      void path
      void flags
      return 1
    },
    fsyncSync: (fd) => {
      // §2.4 item 2's shape carries TWO fsync legs: `fsync(tmp)` BEFORE the rename and
      // `fsync(dir)` AFTER it. The façade tells them apart by the RENAME. A THIRD fsync is
      // out of shape and is recorded under its own step so the oracle can see it.
      const renamed = calls.some((c) => c.step === 'rename')
      const tmpCount = calls.filter((c) => c.step === 'fsyncTmp').length
      const dirCount = calls.filter((c) => c.step === 'fsyncDir').length
      if (!renamed && tmpCount === 0) calls.push({ step: 'fsyncTmp', target: `fd:${String(fd)}` })
      else if (renamed && dirCount === 0) calls.push({ step: 'fsyncDir', target: `fd:${String(fd)}` })
      else calls.push({ step: 'fsyncTmp', target: `EXTRA-FSYNC:${String(fd)}` })
      boom('fsyncSync', String(fd))
    },
    closeSync: (fd) => {
      void fd
    },
    renameSync: (from, to) => {
      calls.push({ step: 'rename', target: `${from}→${to}` })
      boom('renameSync', from)
      const bytes = files.get(from)
      if (bytes === undefined) throw new Error(`INJECTED-FAILURE: rename source ${from} does not exist`)
      files.set(to, bytes)
      files.delete(from)
    },
    readFileSync: (path) => {
      const bytes = files.get(path)
      if (bytes === undefined) throw new Error(`ENOENT: ${path}`)
      return bytes
    },
    existsSync: (path) => files.has(path),
  }
}

/** The store's declared façade member set (§2.1 `S-5`), used by the ABSENT/PRESENT seam
 *  reading. Carried so a façade missing an fs leg is reported rather than silently
 *  under-driving a row. */
const FACADE_MEMBERS = ['mkdirSync', 'writeFileSync', 'openSync', 'fsyncSync', 'closeSync', 'renameSync', 'readFileSync', 'existsSync'] as const

function facadeCompletenessProblems(fs: FsFacade): string[] {
  const problems: string[] = []
  for (const member of FACADE_MEMBERS) {
    const value = (fs as unknown as Record<string, unknown>)[member]
    if (typeof value !== 'function') {
      problems.push(`FACADE-MEMBER: the instrument's \`${member}\` leg is ${typeof value} — §2.1 S-5's façade supplies \`renameSync\` · \`fsyncSync\` · \`mkdirSync\` · the tmp write AND the read/\`existsSync\` legs the boot read uses`)
    }
  }
  return problems
}

// ===========================================================================
// §2.4 items 1-2 — THE ATOMIC-SHAPE ORACLE over the recorded call ORDER/COUNT.
// **SHAPE ONLY — never a durability reading** (§6's honesty block).
// ===========================================================================
function atomicShapeProblems(fs: FsFacade, realPath: string): string[] {
  const problems: string[] = []
  const steps: string[] = fs.calls.map((c) => c.step)
  // the shape is projected onto the unconditional steps (`mkdir` is `if needed`)
  const projected = steps.filter((s) => s !== 'mkdir')
  const expected: AtomicStep[] = ['writeTmp', 'fsyncTmp', 'rename', 'fsyncDir']
  if (projected.length !== expected.length || projected.some((s, i) => s !== expected[i])) {
    problems.push(
      `ATOMIC-SHAPE: the recorded call sequence is [${steps.join(' → ') || 'NO CALLS'}] — §2.4 item 1 requires the SHAPE \`mkdirSync(dirname,{recursive}) → tmp write → fsync(tmp) → renameSync(tmp, path) → fsync(dir)\` IN THAT ORDER (§4 RE-2); the landed non-atomic shape records \`mkdir → plain write\``,
    )
  }
  const mkdirCount = steps.filter((s) => s === 'mkdir').length
  if (mkdirCount > 1) {
    problems.push(`ATOMIC-SHAPE: \`mkdirSync\` was invoked ${mkdirCount} times — the mkdir leg is CONDITIONAL and runs at most once (§2.4 item 1)`)
  }
  for (const step of expected) {
    const count = steps.filter((s) => s === step).length
    if (count > 1) problems.push(`ATOMIC-SHAPE: the step \`${step}\` was invoked ${count} times — every unconditional step runs EXACTLY ONCE (§2.4 item 2)`)
  }
  // the tmp TARGET must be `${path}.tmp` — never the real path, never a third name
  const tmpWrites = fs.calls.filter((c) => c.step === 'writeTmp')
  for (const w of tmpWrites) {
    if (w.target !== `${realPath}.tmp`) {
      problems.push(`TMP-TARGET: a write landed at \`${w.target}\` — §2.4 item 1 serializes to \`${realPath}.tmp\` and the real path is ONLY ever reached by the atomic rename (§4 RE-2)`)
    }
  }
  // the rename's SOURCE is the tmp and its TARGET is the real path
  for (const c of fs.calls.filter((x) => x.step === 'rename')) {
    if (c.target !== `${realPath}.tmp→${realPath}`) {
      problems.push(`RENAME-LEG: the rename reads \`${c.target}\` — §2.4 item 1 renames \`${realPath}.tmp\` ONTO \`${realPath}\` (§4 RE-2)`)
    }
  }
  // (a) a SUCCESSFUL write leaves NO residual tmp (§2.4 item 3(a); §3.2 I-2)
  if (fs.files.has(`${realPath}.tmp`)) {
    problems.push(`TMP-RESIDUE: a residual \`${relative(REPO_ROOT, realPath)}.tmp\` remains after the write — a successful write leaves NO tmp file (§2.4 item 3(a); I-2; §4 RE-2)`)
  }
  return problems
}

/** §2.4 item 3(c) / §3.2 I-2 — the boot read's subject. The REAL path only: a `${path}.tmp`
 *  carrying valid-looking bytes is NEVER parsed as the record. */
function bootReadProblems(fs: FsFacade, realPath: string): string[] {
  const problems: string[] = []
  const tmp = `${realPath}.tmp`
  if (fs.files.has(tmp)) {
    problems.push(`TMP-PARSED: the boot read's substrate carries a read target at \`${relative(REPO_ROOT, tmp)}\` — §2.4 item 3(c)/I-2 forbid a tmp being parsed as the record`)
  }
  if (!fs.files.has(realPath)) {
    problems.push(`BOOT-REAL-PATH: the real path \`${relative(REPO_ROOT, realPath)}\` carries no record — §2.4 item 3(c) reads the REAL path ONLY (§4 RE-3)`)
  }
  return problems
}

// ===========================================================================
// §2.1 — THE DYNAMIC-IMPORT SUBJECT LOADER (the red-by-absence instrument; §4 RE-1).
// The store module imports `node:*` only, so it RESOLVES in the node realm; `fs?`'s
// presence on `SecurityStoreOptions` is a TYPE-level surface the runtime cannot read, and
// the drive therefore SUBSCRIBES it through the façade's own effect (see the row).
// ===========================================================================
interface StoreSurface {
  createSecurityStore?: (opts: unknown) => unknown
}
type StoreLoad = { ok: true; ns: StoreSurface } | { ok: false; error: string }

async function loadStore(): Promise<StoreLoad> {
  try {
    return { ok: true as const, ns: (await import('../src/main/security-store.js')) as StoreSurface }
  } catch (e) {
    return { ok: false as const, error: (e as Error)?.message ?? String(e) }
  }
}

/** The receipt shape's oracle (§2.2 / §3.2 I-4/I-5): EXACTLY ONE of the two closed forms,
 *  the reason exactly the closed token, and never a third status. */
function receiptFormProblems(receipt: unknown, label: string): string[] {
  const problems: string[] = []
  if (receipt === null || typeof receipt !== 'object') {
    problems.push(`RECEIPT-FORM (${label}): the receipt is \`${String(receipt)}\` — §2.2 declares the TWO CLOSED forms \`{status:'committed'}\` | \`{status:'refused'; reason:'write-failed'}\` (§3.2 I-4)`)
    return problems
  }
  const rec = receipt as Record<string, unknown>
  if (!RECEIPT_STATUSES.includes(rec.status as (typeof RECEIPT_STATUSES)[number])) {
    problems.push(`RECEIPT-STATUS (${label}): the status is \`${String(rec.status)}\` — §2.2's set is CLOSED at [${RECEIPT_STATUSES.join(', ')}]; a third status is §3.2 I-4's falsifier`)
  }
  if (rec.status === 'committed') {
    if ('reason' in rec) {
      problems.push(`RECEIPT-FORM (${label}): the \`committed\` form carries a \`reason\` member — §2.2's FIRST form is \`{status:'committed'}\` ONLY (§3.2 I-4)`)
    }
  } else if (rec.status === 'refused') {
    if (rec.reason !== RECEIPT_REASONS[0]) {
      problems.push(`RECEIPT-REASON (${label}): the reason is \`${String(rec.reason)}\` — §3.2 I-5 closes the reason set at the ONE token (a store union token, an \`undefined\` or a second spelling is the falsifier)`)
    }
  }
  return problems
}

/** §2.2/§3.2 I-5 — the receipt's reason token is NEVER a member of the STORE's refusal union
 *  (`K-2`), nor is any store refusal token re-spelled as a receipt reason. `STORE_REFUSAL_TOKENS`
 *  is carried as the typed vocabulary so the scan names what it refuses. */
function storeUnionProblems(text: string | null): string[] {
  const problems: string[] = []
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, STORE_PATH)} could not be read — the store-union membership limb has no substrate`)
    return problems
  }
  const body = withoutComments(text)
  // `⟶ RULING A-3A-1 ①/② (the token's subject NARROWED; `C-3`)`: §3.2 `I-5` forbids the receipt's
  // reason token as a member of THE STORE'S REFUSAL **UNION** — NEVER as the receipt's own
  // declared FORM. §2.1 `S-4`/§2.2 require the store to LAND the very spelling
  // `{ status: 'refused'; reason: 'write-failed' }`, so a flat "the string appears in the
  // module" scan reddens on the unit's OWN mandated surface. The subject is therefore the
  // UNION-MEMBER question: a `| 'write-failed'` arm, or a `type/interface *Refusal* = …` whose
  // declaration carries it. The receipt forms stay lawful.
  const unionArm = new RegExp(`\\|\\s*'${WRITE_FAILED_TOKEN}'|'${WRITE_FAILED_TOKEN}'\\s*\\|`)
  const unionDecl = new RegExp(`(?:type|interface)\\s+\\w*[Rr]efusal\\w*\\s*=[^\\n]*'${WRITE_FAILED_TOKEN}'`)
  if (unionArm.test(body) || unionDecl.test(body)) {
    problems.push(
      `STORE-UNION-COLLISION: the receipt's reason token appears inside ${relative(REPO_ROOT, STORE_PATH)} AS A UNION MEMBER — §2.2/§3.2 I-5: it is NEVER a member of the store's refusal union (\`K-2\`); the channel's tokens are the channel's (the receipt's own declared FORM is lawful — A-3A-1 ①/②)`,
    )
  }
  for (const token of STORE_REFUSAL_TOKENS) {
    // likewise narrowed: a store refusal token as a UNION ARM is the collision `K-2` names.
    const tokenArm = new RegExp(`\\|\\s*'${token}'|'${token}'\\s*\\|`)
    if (tokenArm.test(body)) {
      problems.push(`STORE-UNION: a store refusal token \`'${token}'\` appears as a UNION ARM in the store module — recorded for the DONE row (§2.1 S-4's refusal union is the STORE's; \`K-2\`; the subject is the union membership per A-3A-1 ②)`)
    }
  }
  return problems
}

/** The comment-stripping reader the store-union scan consumes. */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

/** §2.1 `S-4` — `lastWriteReceipt()`'s oracle: the member's PRESENCE, its `null`ability
 *  before the first write attempt, and the receipt it answers after one. */
function lastWriteReceiptProblems(store: unknown, label: string): string[] {
  const problems: string[] = []
  if (store === null || typeof store !== 'object') {
    problems.push(`STORE-SURFACE (${label}): the factory answered \`${String(store)}\` — §2.1 S-1 declares \`SecurityStore\` (§4 RE-1)`)
    return problems
  }
  const member = (store as Record<string, unknown>).lastWriteReceipt
  if (typeof member !== 'function') {
    problems.push(
      `MEMBER-ABSENT (${label}): \`lastWriteReceipt()\` reads \`${typeof member}\` on the store — §2.1 S-4 declares the NEW member \`(): SecurityWriteReceipt | null\`; at this head it resolves NOWHERE (§4 RE-1, the module-member-absent class)`,
    )
  }
  return problems
}

// ===========================================================================
// §3.3 leg 3 — THE REGISTER LEG DRIVING `IPC_SECURITY_SET` DIRECTLY at its real site.
// Because EVERY renderer `set()` call site DISCARDS the resolution (`secure-panels.ts`'s
// four handler bodies are fire-and-forget), a renderer-driven row CANNOT observe the
// receipt — the leg is therefore driven at the handler's SUBSTRATE in `src/main/main.ts`.
// ===========================================================================
/** The balanced body of the bracket pair opening at `open` (a SHAPE read, never a line). */
function balancedBody(src: string, openIndex: number): string | null {
  const open = src[openIndex]
  const close = open === '(' ? ')' : open === '{' ? '}' : open === '[' ? ']' : ''
  if (close === '') return null
  let depth = 0
  let i = openIndex
  while (i < src.length) {
    const c = src[i]!
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return src.slice(openIndex + 1, i)
    }
    i++
  }
  return null
}

interface HandlerSite {
  /** the registered handler's body text, or null when the registration is absent */
  body: string | null
  /** the call expression's own text (the registration's second argument onward) */
  call: string | null
  at: number
}

/** The `IPC_SECURITY_SET` registration site read out of the REAL `src/main/main.ts` bytes. */
function securitySetHandlerSite(): HandlerSite {
  const text = readMaybe(MAIN_PATH)
  if (text === null) return { body: null, call: null, at: -1 }
  const at = text.indexOf('ipcMain.handle(IPC_SECURITY_SET')
  if (at < 0) return { body: null, call: null, at: -1 }
  const open = text.indexOf('(', at)
  const call = balancedBody(text, open)
  return { body: call, call, at }
}

/** §2.4 item 4 / §3.3 leg 1 — the handler's return answers the additive record
 *  `{ ...updated, write: <store>.lastWriteReceipt() }`. */
function setResponseProblems(): string[] {
  const problems: string[] = []
  const site = securitySetHandlerSite()
  if (site.call === null) {
    problems.push(`HANDLER-ABSENT: ${relative(REPO_ROOT, MAIN_PATH)} carries no readable \`ipcMain.handle(IPC_SECURITY_SET\` registration — §1.1 member 3's additive return has no site (§3.3 leg 1)`)
    return problems
  }
  const call = site.call
  const additive = /return\s*\{[^}]*\.\.\.\s*updated[^}]*write\s*:/.test(call) && call.includes('lastWriteReceipt(')
  if (!additive) {
    const returned = [...call.matchAll(/return\s+([^\n]+)/g)].map((m) => m[1]!.trim())
    problems.push(
      `SET-RESPONSE: the handler's return reads [${returned.join(' | ') || 'no readable return'}] — §2.4 item 4 requires \`{ ...updated, write: securityStore.lastWriteReceipt() }\`; the un-widened return carries NO \`write\` member, so the receipt is UNREACHABLE on the channel response (§4 RE-5; §3.3 leg 1)`,
    )
  }
  return problems
}

/** §3.3 leg 3 — the RENDERER-DISCARD NEGATIVE: every renderer `set()` call site discards
 *  the resolution, so a renderer-driven row is shown UNABLE to observe the receipt.
 *
 *  AS-FILED (STRUCTURALLY VACUOUS — the `A-3A-1` ③ RE-AIM): the body was read as
 *  `panels.slice(at, panels.indexOf('\n`', at))`. The `'\n`'` terminator does NOT occur in
 *  `secure-panels.ts` — a handler body ends with a backtick IMMEDIATELY after a `}` line
 *  (`` }` ``), never on its own line — so `indexOf` returned `-1` and EVERY slice ran to EOF
 *  (~17–18 KB of the whole module). The `\bawait\b|\.then\(` scan therefore matched text
 *  ANYWHERE in the file after the first body, so the limb was TRUE BY CONSTRUCTION: it would
 *  have passed even if all four bodies genuinely awaited or `.then`-ed their `s.set(...)`
 *  resolution. No renderer change could ever have reddened it.
 *
 *  RE-AIMED: the body is extracted with a BOUNDED, CORRECT reader — the template literal that
 *  FOLLOWS `const <NAME> = ` is read to its OWN closing backtick (the sibling register's
 *  indent-balanced/nesting-aware idiom, applied to the template-literal delimiter after its
 *  `H-6` remand), so each slice contains EXACTLY that handler body and nothing else. The limb
 *  is now falsifiable: a body that DOES observe the receipt — `await s.set(...)`,
 *  `return s.set(...)` or `s.set(...).then(...)` — reddens it (and so does a body whose
 *  reader cannot find its closing backtick, which is reported BY NAME rather than silently
 *  sweeping to EOF).
 */
function rendererDiscardProblems(): string[] {
  const problems: string[] = []
  const panels = readMaybe(join(REPO_ROOT, 'src', 'renderer', 'secure-panels.ts'))
  if (panels === null) {
    problems.push(`ABSTRACT-SUBJECT: src/renderer/secure-panels.ts could not be read — the renderer-discard negative has no substrate (§3.3 leg 3)`)
    return problems
  }
  const bodies = ['TOKEN_GEN_BODY', 'TOKEN_CLEAR_BODY', 'TOGGLE_BODY', 'JOURNAL_LENGTH_BODY']
  for (const name of bodies) {
    const at = panels.indexOf(`const ${name} =`)
    if (at < 0) {
      problems.push(`RENDERER-SITE: the handler body \`${name}\` is not readable at its declared site — §3.3 names the four fire-and-forget bodies`)
      continue
    }
    const body = readTemplateLiteralBody(panels, at)
    if (body === null) {
      // an unbounded/unterminated read is REPORTED, never silently swept to EOF (the exact
      // failure mode this re-aim closes)
      problems.push(
        `RENDERER-BODY-UNTERMINATED: the body \`${name}\` has no readable closing template-literal delimiter after its declared site — the discard limb cannot read a BOUNDED body, and an EOF-sweeping slice would make this limb TRUE BY CONSTRUCTION (§3.3 leg 3)`,
      )
      continue
    }
    if (/\bawait\b|\breturn\s+s\.set\(|\.then\(/.test(body)) {
      problems.push(`RENDERER-DISCARD: the body \`${name}\` AWAITS or RETURNS its \`s.set(...)\` resolution — §3.3 leg 3's premise is that EVERY renderer set() call site DISCARDS the promise (a renderer-driven row cannot observe the receipt)`)
    }
    if (!/\bs\.set\(/.test(body)) {
      problems.push(`RENDERER-SITE: the body \`${name}\` carries no \`s.set(\` call — §3.3 leg 3 names it as one of the four discarded-resolution sites`)
    }
  }
  return problems
}

/** The BOUNDED body of the template literal that follows `const <NAME> = ` at `declAt`:
 *  the text between that declaration's opening backtick and its OWN closing backtick.
 *  Returns `null` when either delimiter is absent — so an unterminated read is NAMED, never
 *  silently replaced by a slice that runs to EOF. */
function readTemplateLiteralBody(src: string, declAt: number): string | null {
  const open = src.indexOf('`', declAt)
  if (open < 0) return null
  // the closing backtick: the next UNESCAPED one. Handler bodies are template literals, so an
  // embedded `\`` would be escaped; an unescaped backtick always terminates.
  let k = open + 1
  while (k < src.length) {
    if (src[k] === '\\') {
      k += 2
      continue
    }
    if (src[k] === '`') return src.slice(open + 1, k)
    k++
  }
  return null
}

// ---------------------------------------------------------------------------
// `P-SSW-H-1` limb 2 — THE SECURITY-SCOPED DECLARATION-SITE READER (the A-3A-1 ③ RE-AIM).
//
// AS-FILED: the oracle was `/^\s*set\(patch:[^)]*\):\s*Promise<([^>]*)>/gm` over the WHOLE
// of `src/main/preload.ts`. The file declares TWO `set(` families — `security.set` AND the
// UNRELATED `operator.set(patch: OperatorSettingsPatch)` (both the interface declaration and
// the bridge implementation), so the surface read FOUR return types and the limb reported
// `PRELOAD-SITES: … number 4` against a spec that declares EXACTLY TWO (`§2.5`). The
// count was a property of the FILE'S OTHER SUB-NAMESPACE, never of this unit's subject.
//
// RE-AIMED: the subject is the SECURITY sub-namespace's own `set` declarations ONLY,
// identified by ANCHORING each match inside a `security: { … }` block (the same
// indent-balanced, nesting-aware `readSecurityLikeBlock` idiom the sibling register adopted
// after its own `H-6` remand), plus the §2.5 RETURN FAMILY check. The count therefore reads
// the security declaration sites and NOTHING ELSE.
//
// THE PROPERTY IS NOT WEAKENED — the limb still reddens on all three as-filed
// counterexamples, each named:
//   (i)   A THIRD SECURITY-SHAPED DECLARATION (a second `security: { … set(patch…) }` block,
//         or a third `set(patch: { token?: … })` inside the security block) — the count
//         moves off TWO regardless of the other sub-namespace.
//   (ii)  AN UN-WIDENED SECURITY DECLARATION (either site reading `Promise<SecuritySettings>`)
//         — the §2.5 return-family pin fails at that site.
//   (iii) A PARTIAL widening (one site widened, the other not) — the asymmetry pin fails.
// The DISCRIMINATION is preserved by construction: `operator.set` is EXCLUDED BY SCOPE, so
// adding/removing `operator.set` can no longer move (or mask) this limb — while any
// SECURITY-shaped third site, or any un-widened security site, still reddens it.
// ---------------------------------------------------------------------------

/** The security sub-namespace's OWN declaration sites: every `set(patch: …): Promise<…>`
 *  match that sits INSIDE a `security: {` block. An INDENT-BALANCED, nesting-aware read —
 *  never an `indexOf`-to-EOF or a `-1`-terminated slice (the `P-SSW-H-2` limb 4 remand class). */
function securitySetDeclarationSites(text: string): Array<{ returnType: string; anchor: string }> {
  const sites: Array<{ returnType: string; anchor: string }> = []
  // (a) the SECURITY blocks: `security: {` at ANY indent, brace-balanced, order-independent
  const blocks: string[] = []
  const lines = text.split('\n')
  for (let n = 0; n < lines.length; n++) {
    if (!/^\s*security\s*:\s*\{\s*$/.test(lines[n]!)) continue
    const indent = (lines[n]!.match(/^ */)?.[0] ?? '').length
    let depth = 0
    const body: string[] = []
    for (let k = n; k < lines.length; k++) {
      const line = lines[k]!
      for (const ch of line) {
        if (ch === '{') depth++
        else if (ch === '}') depth--
      }
      if (k > n) {
        if (depth === 0 && /^\s*\}[;,]?\s*$/.test(line) && (line.match(/^ */)?.[0] ?? '').length <= indent) break
        body.push(line)
      }
    }
    blocks.push(body.join('\n'))
  }
  // (b) the declarations INSIDE those blocks
  for (const block of blocks) {
    for (const m of block.matchAll(/(?:^|\n)(\s*)set\(patch:[^)]*\):\s*Promise<([^>]*)>/g)) {
      sites.push({ returnType: m[2]!, anchor: `set(patch:…)` })
    }
  }
  return sites
}

/** `§2.5` — the DECLARED widened return family. The pin is stated as the security return
 *  family (`SecuritySettings & { write: SecurityWriteReceipt }`), and the widening token is
 *  the discriminator: an un-widened site reads the bare `SecuritySettings`. */
const WIDENED_SECURITY_RETURN_FAMILY = 'SecuritySettings'
const WIDENING_TOKEN_RE = /SecurityWriteReceipt/

/** §3.3 leg 2 / §2.5 — the TWO `security.set` declaration sites, BOTH widened. */
function preloadDeclarationProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(PRELOAD_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, PRELOAD_PATH)} could not be read — the two-declaration limb has no substrate (§2.5)`)
    return problems
  }
  const sites = securitySetDeclarationSites(text)
  const returns = sites.map((s) => s.returnType)
  // the SECURITY-scoped sites must number EXACTLY TWO (§2.5: the `ProvidentBridge` interface
  // declaration AND the bridge implementation). The unrelated `operator.set` family is
  // OUT OF SCOPE BY CONSTRUCTION, so it can neither inflate nor mask this count.
  if (sites.length !== 2) {
    problems.push(
      `PRELOAD-SITES: the surfaced ` +
        '`security.set`' +
        ` declaration sites number ${sites.length} [${returns.map((r) => `\`${r.trim()}\``).join(', ') || 'NONE'}] — §2.5 declares EXACTLY TWO, INSIDE the \`security:\` sub-namespace (the \`ProvidentBridge\` interface declaration AND the bridge implementation); a widened INTERFACE without the widened IMPLEMENTATION is a \`tsc\` failure, and the reverse is unreachable to the renderer. The count is SECURITY-scoped: the unrelated \`operator.set(patch: OperatorSettingsPatch)\` family is excluded by scope and can neither inflate nor mask it (§4 RE-5)`,
    )
  }
  for (const site of sites) {
    const ret = site.returnType.trim()
    // the WIDENING pin: the token is the discriminator (an un-widened site reads the bare family)
    if (!WIDENING_TOKEN_RE.test(ret)) {
      problems.push(
        `PRELOAD-UNWIDENED: a SECURITY declaration site reads \`Promise<${ret}>\` — §2.5 widens BOTH to \`Promise<${WIDENED_SECURITY_RETURN_FAMILY} & { write: ${'SecurityWriteReceipt'} }>\`; the current text is the UN-WIDENED declaration (§4 RE-5; §3.3 leg 2)`,
      )
      continue
    }
    // and the RETURN-FAMILY pin: the widened site must still resolve the security family
    if (!ret.includes(WIDENED_SECURITY_RETURN_FAMILY)) {
      problems.push(
        `PRELOAD-RETURN-FAMILY: a widened SECURITY declaration site reads \`Promise<${ret}>\` — §2.5's widened return is the SECURITY family with the additive member (\`${WIDENED_SECURITY_RETURN_FAMILY} & { write: … }\`); a site resolving a DIFFERENT family is not this unit's §2.5 declaration (§3.3 leg 2)`,
      )
    }
  }
  if (sites.length === 2 && !sites.every((s) => WIDENING_TOKEN_RE.test(s.returnType))) {
    problems.push(`PRELOAD-PARTIAL: only ONE of the two declaration sites is widened — §2.5's FALSIFIER is exactly this asymmetry (§3.3 leg 2)`)
  }
  return problems
}

/** §2.2 / §1.1 member 2 — the receipt's HOME, AS RE-AIMED BY RULING `A-3A-2` ①:
 *  **declared in `src/main/security-store.ts` (THE RULED HOME — `A-3A-1` ①,
 *  SELF-CONTAINED + EXPORTED, with NO import) and in `src/shared/types.ts` NOT AT
 *  ALL** (`src/shared/types.ts` IS NOT MOVED BY THIS UNIT — its four landed digest
 *  pins stay UNTOUCHED). The identifier is declared in **EXACTLY ONE** of the two
 *  files; a declaration in **BOTH** is the `DUPLICATE-HOME` collision this limb
 *  reddens on.
 *
 *  `⟶ RULING A-3A-2 ① (2026-10-04, BY THE SUPERVISOR — THE HOME LIMBS FOLLOW THE
 *  RULED HOME; the `A-3A-1` ① drift, CLOSED; `RCA-8(c)` ANNOTATE-BESIDE).` See the
 *  file's header reconciliation block for the withdrawal of the as-filed
 *  `RECEIPT-HOME-COLLISION` limb and what replaced it. */
function receiptHomeProblems(): string[] {
  const problems: string[] = []
  const types = readMaybe(TYPES_PATH)
  const store = readMaybe(STORE_PATH)
  if (store === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, STORE_PATH)} could not be read — the receipt's home pin has no substrate (§2.2)`)
  } else {
    if (!/export\s+type\s+SecurityWriteReceipt\s*=/.test(store)) {
      problems.push(
        `RECEIPT-HOME: \`SecurityWriteReceipt\` is declared NOWHERE in ${relative(REPO_ROOT, STORE_PATH)} — \`A-3A-2\` ① / \`A-3A-1\` ① / §1.1 member 2 / §2.2 home it HERE: SELF-CONTAINED (NO import), EXPORTED, the ` +
          '`readonly`' +
          ` discriminated union of the TWO CLOSED forms (§4 RE-5)`,
      )
    } else {
      const decl = /export\s+type\s+SecurityWriteReceipt\s*=\s*([^\n]*)/.exec(store)?.[1] ?? ''
      if (!decl.includes(`'${RECEIPT_STATUSES[0]}'`) || !decl.includes(`'${RECEIPT_STATUSES[1]}'`) || !decl.includes(`'${WRITE_FAILED_TOKEN}'`)) {
        problems.push(`RECEIPT-FORM: the declared type reads \`${decl.trim()}\` — §2.2's declaration is the TWO CLOSED forms with the reason set CLOSED at the ONE token`)
      }
    }
  }
  // ---- PIN 2, RE-AIMED: THE DUPLICATE-HOME LIMB -------------------------------------------
  // THE AS-FILED PIN 2 (`RECEIPT-HOME-COLLISION`) IS **WITHDRAWN AS ANTI-QUATED** by `A-3A-2`
  // ①: it FORBADE the identifier in `src/main/security-store.ts` — i.e. it asserted the
  // SUPERSEDED shared home by forbidding the RULED one. Its INTENT ("one home, no duplicate
  // declaration") is PRESERVED, re-aimed at the discrimination that survives the move: the
  // identifier is declared in **EXACTLY ONE** of the two files.
  //   • COUNTEREXAMPLE it still catches: the pre-`A-3A-1`-dirty-state class — the type
  //     declared in `src/main/security-store.ts` (per the ruling) WHILE the as-filed
  //     `export type SecurityWriteReceipt = …` in `src/shared/types.ts` is LEFT IN PLACE. That
  //     is TWO competing homes for one type — a real defect, still named, still red.
  //   • COUNTEREXAMPLE it DEADENS: "the identifier appears in the store module" — which the
  //     RULING now REQUIRES; that is exactly why the limb had to move.
  // The DECLARATION form (not a bare mention) is the subject — the ruling's own §3.3 leg 2
  // has `src/main/preload.ts` carry `SecurityWriteReceipt` in its WIDENED RETURN at two sites,
  // and a bare-occurrence count would redden on that lawful surface.
  const DECLARATION = /export\s+(?:type|interface)\s+SecurityWriteReceipt\s*=/
  const homes: string[] = []
  if (store !== null && DECLARATION.test(store)) homes.push(relative(REPO_ROOT, STORE_PATH))
  if (types !== null && DECLARATION.test(types)) homes.push(relative(REPO_ROOT, TYPES_PATH))
  if (homes.length > 1) {
    problems.push(
      `RECEIPT-HOME-DUPLICATE: \`SecurityWriteReceipt\` is DECLARED in ${homes.map((h) => `\`${h}\``).join(' AND ')} — \`A-3A-2\` ① requires EXACTLY ONE home for the type, \`src/main/security-store.ts\`; §1.1 member 2's as-filed shared home is superseded and \`src/shared/types.ts\` IS NOT MOVED. Two competing declarations of the SAME type is the duplicate-home collision this limb reddens on (the as-filed "named in the store module" prohibition is WITHDRAWN AS ANTI-QUATED — it asserted the superseded home by forbidding the ruled one)`,
    )
  }
  return problems
}

/** §1.1 member 5 / `S-P-3` / `O-2` — THE md5 RE-STATEMENT row's oracle, read from the
 *  LANDED pin file's own bytes (this row NEVER edits that file; §4's pre-recorded
 *  amendment-row-1 exemption is what makes it RED at this head). */
function md5RowProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(THEME_PIN_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, THEME_PIN_PATH)} could not be read — the md5 row has no substrate (§1.1 member 5)`)
    return problems
  }
  const rowAt = text.indexOf(`file: 'src/main/preload.ts'`)
  if (rowAt < 0) {
    problems.push(`MD5-ROW-ABSENT: the \`src/main/preload.ts\` row is not present in ${relative(REPO_ROOT, THEME_PIN_PATH)}'s \`UNTOUCHED_DIGESTS\` — the re-statement's row has no subject (§1.1 member 5)`)
    return problems
  }
  const line = text.slice(text.lastIndexOf('\n', rowAt) + 1, text.indexOf('\n', rowAt))
  const restated = /restated:\s*'([^']+)'/.exec(line)?.[1] ?? ''
  if (restated !== RESTATEMENT_TARGET_UNIT) {
    problems.push(
      `MD5-RESTATEMENT: the row's \`restated\` reads \`${restated}\` — §1.1 member 5 / \`S-P-3\`/\`O-2\` require \`restated: '${RESTATEMENT_TARGET_UNIT}'\` set in THIS unit's own commit (at this head it still reads \`${CURRENT_RESTATING_UNIT}\`; §4's pre-recorded amendment-row-1 exemption) (§4 RE-5; §5.1 P-SSW-H-3)`,
    )
  }
  if (!line.includes(SUPERSEDED_PRELOAD_MD5)) {
    problems.push(`MD5-SUPERSEDED-VISIBLE: the row does not carry the superseded literal \`${SUPERSEDED_PRELOAD_MD5}\` — §1.1 member 5 requires it KEPT VISIBLE, NEVER deleted (§5.1 P-SSW-H-3)`)
  }
  const md5 = /md5:\s*'([^']+)'/.exec(line)?.[1] ?? ''
  const actual = (() => {
    try {
      return createHash('md5').update(readFileSync(PRELOAD_PATH)).digest('hex')
    } catch {
      return ''
    }
  })()
  if (md5 !== actual) {
    problems.push(
      `MD5-MEASURED: the recorded md5 \`${md5}\` does not equal the file's real digest \`${actual}\` (\`node:crypto\` md5, MEASURED at this head) — the re-statement records the md5 MEASURED at the landing head, never inferred (§5.1 P-SSW-H-3)`,
    )
  }
  return problems
}

/** §5.1 `P-SSW-H-3` control 4 — `UNRESTATED_CONTROL_PATH` stays DERIVED from the table and
 *  NON-VACUOUS: the derivation must still resolve to a non-empty, un-re-stated path. */
function unrestatedControlProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(THEME_PIN_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, THEME_PIN_PATH)} could not be read — the derived-control limb has no substrate`)
    return problems
  }
  const tableAt = text.indexOf('const UNTOUCHED_DIGESTS')
  const tableEnd = text.indexOf(']', tableAt)
  if (tableAt < 0 || tableEnd < 0) {
    problems.push(`DERIVED-CONTROL: \`UNTOUCHED_DIGESTS\` is not readable in ${relative(REPO_ROOT, THEME_PIN_PATH)} — the derivation's subject is absent`)
    return problems
  }
  const rows = [...text.slice(tableAt, tableEnd).matchAll(/\{\s*file:\s*'([^']+)'([^}]*)\}/g)].map((m) => ({
    file: m[1]!,
    restated: /restated:\s*'([^']+)'/.exec(m[2] ?? '')?.[1] ?? undefined,
  }))
  const derived = rows.find((r) => r.restated === undefined)?.file ?? ''
  if (derived === '') {
    problems.push(`DERIVED-CONTROL-VACUOUS: every \`UNTOUCHED_DIGESTS\` row carries a \`restated:\` field — §1.1 member 5 / amendment row 2 require the derivation to stay NON-VACUOUS (it must still resolve to a row this unit is not licensed to move)`)
  }
  return problems
}

// ===========================================================================
// §5.1 `P-SSW-H-4` — THE NO-DURABILITY / LAYER HONESTY ROW (the anti-overclaim row).
//
// `⟶ RE-AIM ⑤ (THE GATE-4 `G-1` REMAND — `P-SSW-H-4` WAS VACUOUS; `RCA-8(c)`
// ANNOTATE-BESIDE: the as-filed text is KEPT HERE VERBATIM and the block below is the
// OPERATIVE disposition).`
//
// THE VACUITY, MEASURED (not argued). The AS-FILED row had TWO readings and BOTH were
// true-by-construction:
//   (i)  `durabilityClaimProblems()` required one of the four SCREAMING-CASE literals
//        (`DURABLE-ON-DISK` etc.) to appear VERBATIM. MEASURED at the remand head over the
//        three artifacts it read (this register · the sibling guard · the spec) AND over the
//        greens artifact and the store module: the ONLY line in the whole unit carrying any
//        of the four is this file's own `const DURABILITY_TOKENS = [...]` vocabulary
//        declaration — which the scanner SKIPS BY NAME (`line.includes('DURABILITY_TOKENS')`).
//        So the reading's counterexample set was EMPTY BY CONSTRUCTION: no edit to a DONE
//        row, a greens artifact, a park artifact or an assertion text could ever redden it.
//   (ii) the second reading (`/NO DURABILITY CLAIM FROM A CALL-COUNT/` inside the spec's §6)
//        asserted a clause the SPEC IS REQUIRED TO CARRY (§6's mandatory honesty block), so it
//        too was true by construction — it policed the contract's own prose, not the unit's.
//   MEANWHILE the REAL over-claim class passed GREEN: an ordinary-English durability
//   assertion in a DONE row, a greens artifact or a park artifact — e.g.
//   *"the write is now crash-safe and durable on disk"* — carries NONE of the four literals,
//   so the as-filed scan could not see it (PROVEN by the control below).
//
// THE OPERATIVE SUBJECT: a CASE-INSENSITIVE PROSE pattern over the CLAIM-BEARING lines of
// the artifacts this row POLICES (this register · the sibling guard · the spec · the
// greens artifact · the store module), with an EXPLICIT ALLOW-LIST for the NEGATED forms the
// spec legitimately uses (`NO DURABILITY CLAIM`, `not durability`, `shape only`,
// `never claims`, …) — because a prohibition that NAMES what it forbids is not an assertion
// of it. The allow-list is the reason the REAL artifacts (which only NEGATE) stay GREEN.
//
// THE ROW NOW REDDENS ON ITS REAL COUNTEREXAMPLE: a durability assertion in a CLAIM
// position. The control below forges exactly the sentence the remand names and REQUIRES the
// same production predicate to reject it — a control that cannot fail is the finding this
// re-aim exists to close, and the as-filed predicate is MEASURED against the same forged
// line so the vacuity is a printed reading rather than an argument.
// ===========================================================================
/** The NEGATED forms the spec and this unit's artifacts legitimately use: a line carrying one
 *  of these is a PROHIBITION or a LIMIT, never an assertion. Case-insensitive, and matched as
 *  phrases (never as a bare `no`, so `no residual tmp` cannot silently excuse a claim). */
const DURABILITY_NEGATIONS = [
  'no durability claim',
  'durability is not',
  'shape only',
  'never claims',
  'never as a completed',
  'never as a durable',
  'no claim',
  'claims nowhere',
  'claim nowhere',
  'asserted nowhere',
  'nothing here is',
  'does not prove',
  'never a durability',
  'without a durability',
  'falsifier',
  'anti-overclaim',
  'no durability',
  'durability is asserted',
  'is not durability',
  'no durability-based',
  // THE LIMIT-LEDGER COLUMN: the spec's §6 table states, per deliverable, "what that layer
  // does NOT prove" — `durability; crash recovery; …` is the NEGATED reading of the row, i.e.
  // the spec's own HONESTY, and it is the clause this whole row exists to keep honest.
  'not prove',
  'does not prove',
] as const

/** The four AS-FILED literals, kept VISIBLE and still run as a SECOND limb: an artifact that
 *  spells one of them in a claim position is the `RCA-8(c)`-named over-claim shape. */
const AS_FILED_DURABILITY_LITERALS = ['DURABLE-ON-DISK', 'CRASH-SAFE-ON-DISK', 'BYTES-ON-DISK-AFTER-CRASH', 'FSYNC-COMPLETED-ON-DISK'] as const

/** The row's shared PROSE predicate: case-insensitive durability vocabulary in a CLAIM
 *  position. Exposed as its OWN function so the positive control drives the SAME code the row
 *  drives — a control over a re-implemented copy would discriminate nothing.
 *
 *  `scope` names the artifact so the INSTRUMENT ITSELF can be excluded: this register must
 *  CARRY the vocabulary (it is the word list the scan looks for, and this row's prose
 *  DISCUSSES the over-claim by naming it), and a scanner that reddened on its own vocabulary
 *  is an oracle that cannot pass — as useless as one that cannot fail. The exclusion is
 *  narrowed to the shape a vocabulary/prohibition must have (a quoted pool entry, an
 *  ALL-CAPS denial, an SCREAMING-CASE token, or a negated/limit form); every OTHER line —
 *  including a `//` or `*` comment — is a CLAIM POSITION, which is where the GATE-4 `G-1`
 *  remand's over-claim class lives ("a DONE row, a greens artifact or a park artifact"). */
function durabilityClaimLine(line: string, scope: 'instrument' | 'subject'): string | null {
  const lower = line.toLowerCase()
  const prose = DURABILITY_TOKENS.filter((t) => lower.includes(t.toLowerCase()))
  const literal = AS_FILED_DURABILITY_LITERALS.filter((t) => line.includes(t))
  if (prose.length === 0 && literal.length === 0) return null
  // (a) THE WORD LIST ITSELF and its own cited forms — the INSTRUMENT, never a claim.
  if (line.includes('DURABILITY_TOKENS') || line.includes('AS_FILED_DURABILITY_LITERALS') || line.includes('DURABILITY_NEGATIONS')) return null
  // (b) THE PREDICATE'S OWN NAME — a line that NAMES the oracle is discussing the instrument
  //     (this file's re-aim block, the row's comments, the row's own diagnostic text), never
  //     asserting a durability outcome. A claim would not need to name the scanner.
  if (line.includes('durabilityClaim') || line.includes('DURABILITY-CLAIM')) return null
  if (scope === 'instrument') {
    // THE INSTRUMENT'S OWN PROSE. This file and the sibling guard ARE the anti-overclaim
    // instrument: they must be able to NAME the claim they refuse (that is how a falsifier is
    // written) and they must carry the word list they scan with. A scanner that reddened on its
    // own documentation could never be satisfied by ANY correct instrument — the same
    // "oracle that cannot pass" failure class as the vacuity this re-aim closes. The exclusion
    // is therefore TOTAL for the two instrument files and rests on a MEASURED property rather
    // than on a wording: no `[H]`/`[T]` CLAIM of this unit lives in a test file — the unit's
    // claims live in the DONE row, the greens artifact, the park artifact and the spec, and
    // THOSE are scanned as SUBJECTS below with no exclusion at all.
    return null
  }
  // (c) THE FALSIFIER LIST — the assertions this row refuses by name, and the ADMIT corpus the
  //     control drives, are CARRIED here as DATA (they must exist for the control to drive
  //     them); they are marked as such and are the instrument's corpus, not this unit's claim.
  if (line.includes('FORGED-CLAIM-CORPUS') || line.includes('NEGATED-FORM-CORPUS')) return null
  // (d) THE NEGATED/LIMIT FORMS the spec legitimately uses (a prohibition that names what it
  //     forbids is not an assertion of it) — an explicit phrase allow-list, never a bare `no`.
  if (DURABILITY_NEGATIONS.some((n) => lower.includes(n))) return null
  // (e) A MARKDOWN TABLE CELL that continues a "what that layer does NOT prove" header — the
  //     spec's §6 limit ledger wraps its cells, so the NEGATION sits on the header row and the
  //     words ("durability; crash recovery; …") on the next physical line. Tracked by the
  //     caller (`durabilityClaimProblems`) since it is a POSITION property of the artifact.
  // (f) THE NON-CRASH SENSE of `durable`: two pre-existing landings use it for something other
  //     than a survival claim on the WRITE —
  //       • the byte-scan-helper line calls the `[H]` instrument "durable" meaning it ENDURES
  //         across heads (a claim about the instrument's availability);
  //       • the store's step-5 comment says the *rename* "is durable at the directory level",
  //         which is the `fsync(dir)` leg's DESIGN RATIONALE in production code, not a node
  //         evidence claim — §2.4 item 2 requires exactly that leg, so reddening here would
  //         make the row unsatisfiable by the declared implementation.
  //     BOTH are recorded in the DONE row as the two lines in the unit where this vocabulary
  //     appears outside an anti-claim position, so the reading is honest rather than invisible.
  if (lower.includes('durable `[h]` instrument') || lower.includes('durable instrument')) return null
  if (/^[ \t]*(\/\/|\*|\/\*)/.test(line) && /\bis durable at the directory level\b/i.test(line)) return null
  return `the line \`${line.trim().slice(0, 160)}\` asserts durability vocabulary [${[...prose, ...literal].join(', ')}] in a CLAIM position — §6's honesty block: every atomic claim is a CALL ORDER/COUNT over the injected façade; a real \`fsync\` completion, a crash-safe write or bytes-on-disk-after-a-power-loss is asserted NOWHERE in node evidence (the NEGATED forms the spec uses are allow-listed; this line is not one of them)`
}

function durabilityClaimProblems(): string[] {
  const problems: string[] = []
  const artifacts: Array<[string, 'instrument' | 'subject', string | null]> = [
    ['this register', 'instrument', readMaybe(SELF_PATH)],
    ['the sibling guard', 'instrument', readMaybe(join(HERE, 'pd-store-security-write.test.ts'))],
    ['the spec', 'subject', readMaybe(SPEC_PATH)],
    // the artifacts the AS-FILED row did NOT police although §5.1's own text names them
    // ("no durability token appears in any assertion text, DONE row or park artifact")
    ['the greens artifact', 'subject', readMaybe(join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-write-greens.md'))],
    ['the store module', 'subject', readMaybe(STORE_PATH)],
  ]
  for (const [label, scope, text] of artifacts) {
    if (text === null) continue // an artifact not yet authored has no claim to police
    // A MARKDOWN LIMIT-LEDGER CELL: a table whose HEADER row carries a negation (`What that
    // layer does NOT prove`). Every data row of THAT table is a limit cell — the spec's §6
    // ledger states, per deliverable, what its evidence does NOT cover, and a limit column is
    // by construction the spec's own HONESTY, never an over-claim. Keyed off the HEADER ROW and
    // released at the table's end (the first non-`|` line) — so this can never excuse a claim
    // written anywhere else in the artifact.
    let inLimitTable = false
    for (const line of text.split('\n')) {
      const tableRow = /^\s*\|/.test(line)
      if (!tableRow) {
        inLimitTable = false
      } else if (/\|\s*\|?\s*/.test(line) && /\bNOT\b/.test(line) && /prove/i.test(line)) {
        inLimitTable = true
      }
      if (inLimitTable && tableRow) continue
      const problem = durabilityClaimLine(line, scope)
      if (problem !== null) problems.push(`DURABILITY-CLAIM (${label}): ${problem}`)
    }
  }
  return problems
}

/** §5.1 `P-SSW-H-4` — the layer classification: the `[H]` rows are reported
 *  `RED-BY-SHIM`/byte-scan and NEVER as app-green, envelope-green or live-green. The scan is
 *  anchored to a CLAIM SHAPE (a positive assertion of the colour), never to a mention — the
 *  register's own deny-list names every colour BECAUSE it forbids them. */
function layerHonestyProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(SELF_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: this register could not be read — the layer-honesty limb has no substrate`)
    return problems
  }
  const claimPatterns: Array<[string, RegExp]> = [
    ['app-green', /\bis\s+app-green\b|\bapp-green\s*=\s*true\b|\bapp-green:\s*true\b/i],
    ['envelope-green', /\bis\s+envelope-green\b|\benvelope-green\s*=\s*true\b/i],
    ['live-green', /\bis\s+live-green\b|\blive-green\s*=\s*true\b/i],
    ['store-green', /\bis\s+store-green\b|\bstore-green\s*=\s*true\b/i],
  ]
  for (const line of text.split('\n')) {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue // the header's deny-list is PROSE, not a claim
    // the SCANNER'S OWN code is the instrument, never a claim: a line that builds this very
    // finding, or that carries the denial vocabulary the instrument enforces, is excluded BY
    // NAME — otherwise the oracle reddens on its own diagnostic text (an oracle that cannot
    // pass is as useless as one that cannot fail).
    if (/LAYER-OVERCLAIM|claimPatterns|layerHonestyProblems|app-green:/.test(line)) continue
    if (/asserts `\$\{label\}`/.test(line)) continue
    for (const [label, re] of claimPatterns) {
      if (re.test(line)) {
        problems.push(`LAYER-OVERCLAIM: this register asserts \`${label}\` in \`${line.trim().slice(0, 140)}\` — §6's layer ledger: the evidence is \`[H]\`-shim/\`[T]\` ONLY; NOTHING here is app-green, envelope-green, store-green, engine-green or live-green`)
      }
    }
  }
  return problems
}

// ===========================================================================
// §2.3 — the NINE-member census, the sanitize admission, and the POSITIVE CONTROL.
// ===========================================================================
function nineMemberProblems(store: unknown, label: string): string[] {
  const problems: string[] = []
  if (store === null || typeof store !== 'object') {
    problems.push(`STORE-SURFACE (${label}): the factory answered \`${String(store)}\` — the census has no subject (§4 RE-1)`)
    return problems
  }
  const surface = store as Record<string, unknown>
  if (typeof surface.set !== 'function' || typeof surface.get !== 'function') {
    problems.push(`STORE-SURFACE (${label}): the store's \`set\`/\`get\` members are not both callable — §2.1 S-2/S-3 declare them (§4 RE-1)`)
    return problems
  }
  const set = surface.set as (p: unknown) => { enabled?: unknown }
  const post = set.call(store, { groups: [...NINE_GROUPS] })
  const enabled = Array.isArray(post?.enabled) ? (post.enabled as string[]) : []
  const missing = NINE_GROUPS.filter((g) => !enabled.includes(g))
  if (missing.length > 0) {
    problems.push(`NINE-CENSUS: \`set({groups: [all nine]})\` dropped [${missing.join(', ')}] — §2.3 requires the sanitize filter to ADMIT every one of the NINE; restoring five would silently drop \`rag\`/\`edit\`/\`gnosis\`/\`gnosis-edit\` (§4 RE-1)`)
  }
  const withUnknown = set.call(store, { groups: ['unknown-tenth'] }) as { enabled?: unknown }
  const after = Array.isArray(withUnknown?.enabled) ? (withUnknown.enabled as string[]) : []
  if (after.includes('unknown-tenth')) {
    problems.push(`NINE-CENSUS: an unknown group was ADMITTED — §2.3's filter rejects an unknown tenth (§4 RE-1)`)
  }
  return problems
}

/** §5.1 `P-SSW-IM-5` control 4 — the POSITIVE CONTROL: a five-member set must REDDEN the
 *  same oracle. The control drives the oracle's OWN predicate over a forged census, so it
 *  fires only when the oracle MISSES the foundation's five-member clause. */
function fiveMemberControlProblems(): string[] {
  const problems: string[] = []
  const FOUNDATION_FIVE = ['read', 'dispatch', 'graph', 'code', 'module']
  const forgedStore = {
    set(patch: { groups?: string[] }) {
      const enabled = ['read', 'dispatch', ...(patch.groups ?? []).filter((g) => FOUNDATION_FIVE.includes(g))]
      return { enabled: [...new Set(enabled)] }
    },
    get() {
      return { token: null, enabled: ['read', 'dispatch'] }
    },
  }
  const driven = nineMemberProblems(forgedStore, 'the five-member POSITIVE CONTROL')
  if (driven.length === 0) {
    problems.push(
      `CONTROL-VACUOUS (P-SSW-IM-5 control 4): the NINE-census oracle ACCEPTED a FIVE-member set — the foundation's clause (\`store-security.md\` §2.1 item 6) is what this control forges, and the oracle MUST redden it (§5.1; ruling (vii))`,
    )
  }
  return problems
}

// ===========================================================================
// §1.1 / §2.1 — the census helpers the `P-SSW-IM-6` row drives.
// ===========================================================================
function setCallSiteProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(MAIN_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the no-second-writer census has no substrate (§1.2 item 7)`)
    return problems
  }
  const writes = text.match(/\bsecurityStore\.set\(/g) ?? []
  if (writes.length !== 1) {
    problems.push(`SECOND-WRITER: \`securityStore.set(\` occurs ${writes.length} times in ${relative(REPO_ROOT, MAIN_PATH)} — §1.2 item 7 denies a second call site (the landed count-1 guards read \`1\`) (§5.1 P-SSW-IM-6)`)
  }
  const patches = text.match(/\.applyGatePatch\(/g) ?? []
  if (patches.length !== 1) {
    problems.push(`MOVED-REGATE: \`.applyGatePatch(\` occurs ${patches.length} times in ${relative(REPO_ROOT, MAIN_PATH)} — amendment rows 3+4 LEAVE-ALONE; a moved call is denied (§1.2 item 7)`)
  }
  if (!(text.indexOf('gatePatchFromStoreResult(') < text.indexOf('.applyGatePatch('))) {
    problems.push(`REGATE-FEED: the live re-gate is not fed by \`gatePatchFromStoreResult(\` before the call — the landed guard reads that order (§2.4 item 4)`)
  }
  return problems
}

/** `§2.2`/`K-1`/`O-3` — NO new `src/main/**` importer of `security-store.js`: the receipt's
 *  home is `src/shared/types.ts`, so `NEG-SECOND-WRITER`'s offender set stays EMPTY. The
 *  scan is MODULE-IDENTITY based (a renamed/aliased binding is caught by the same limb).
 *
 *  `⟶ RE-AIM ⑨ (THE GATE-4 `G-7` REMAND — THE OFFENDER PREDICATE WAS STRICTLY WEAKER THAN THE
 *  INSTRUMENT IT RE-ASSERTS).` AS-FILED, the closing loop pushed TWO offender classes:
 *    (1) `reached.has(id)` — the module-IDENTITY closure (a module importing the store, or
 *        importing a module that does), and
 *    (2) `mod.binds` — a regex for `\bcreateSecurityStore\b` over the whole text minus `import`
 *        lines.
 *  The LANDED scanner (`tests/unit-app-harness-readiness-register.test.ts`'s
 *  `securityStoreImporters`, the instrument this row claims to re-assert) additionally applies
 *  its `referencedNames(mod)` fallback: the store-writer NAME SET (`STORE_WRITER_NAMES` =
 *  `['createSecurityStore']`) screened against the module body with import lines stripped. The
 *  as-filed copy DROPPED that third class, so it was a re-implementation that could not see
 *  everything the landed instrument sees — a copy weaker than its original is a finding in
 *  itself.
 *
 *  RESTORED: the predicate now runs ALL THREE classes, in the landed order (identity → bound →
 *  referenced). The reason it MATTERS at this head is worth stating exactly, because the
 *  as-filed `binds` regex is not merely narrower — it is BOTH OVER- and UNDER-inclusive:
 *    • OVER-INCLUSIVE: `\bcreateSecurityStore\b` matches the identifier ANYWHERE in the body,
 *      including an `export { createSecurityStore as makeStore } from './security-store.js'`
 *      RE-EXPORT HOP — so a pure carrier module with no store binding of its own is reported as
 *      an offender, firing the row on a shape that is not a second writer.
 *    • UNDER-INCLUSIVE: it misses nothing the landed fallback catches at THIS head, because
 *      `STORE_WRITER_NAMES` contains the same single name — so the restored class is
 *      deliberately a SUPERSET-BY-CONSTRUCTION of the as-filed one, and a future widening of
 *      the landed name set is picked up here AUTOMATICALLY rather than needing a second edit.
 *  The predicate is therefore parameterized over a DIRECTORY and a MODE so the control below
 *  drives the very same code over a synthetic corpus (an injected tree, never the real one). */
const STORE_WRITER_NAMES = ['createSecurityStore'] as const

/** The names a module REFERENCES as an identifier — import lines excluded, so a binding
 *  DECLARATION is never mistaken for a use (the landed scanner's own reader). */
function referencedWriterNames(text: string): string[] {
  const body = text.replace(/^\s*import[^\n]*$/gm, '')
  return STORE_WRITER_NAMES.filter((n) => new RegExp(`\\b${n}\\b`).test(body))
}

function securityStoreImporters(dir: string): string[] {
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts'))
  const moduleId = (name: string): string => name.replace(/\.(ts|tsx|js|mjs|cjs)$/, '')
  const parsed = new Map<string, { imports: string[]; text: string }>()
  for (const f of files) {
    const text = readFileSync(join(dir, f), 'utf8')
    const imports = [...text.matchAll(/^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm)].map((m) =>
      moduleId(m[1]!.replace(/^\.\//, '')),
    )
    for (const m of text.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) imports.push(moduleId(m[1]!.replace(/^\.\//, '')))
    parsed.set(moduleId(f), { imports, text })
  }
  // THE CLOSURE (class 1) — a fixed point over the import graph, seeded with the store module.
  const reached = new Set<string>([moduleId('security-store.ts')])
  let grew = true
  while (grew) {
    grew = false
    for (const [id, mod] of parsed) {
      if (reached.has(id)) continue
      if (mod.imports.some((imp) => reached.has(imp))) {
        reached.add(id)
        grew = true
      }
    }
  }
  const offenders: string[] = []
  for (const [id, mod] of parsed) {
    if (id === 'main' || id === 'security-store') continue
    if (reached.has(id)) {
      offenders.push(`${id}.ts imports the security store (module identity: security-store.ts)`)
      continue
    }
    // class 2 — a BOUND writer name (`import { createSecurityStore } from …`)
    const bound = [...mod.text.matchAll(/^\s*import\s+[^'"]*?from\s*['"][^'"]+['"]/gm)]
      .flatMap((d) => d[0]!.slice(0, d[0]!.indexOf('from')).split(/[{},\s]+/).map((t) => t.trim()))
      .filter((t) => t !== '' && t !== 'as' && t !== '*' && (STORE_WRITER_NAMES as readonly string[]).includes(t))
    // class 3 — THE RESTORED `referencedNames` FALLBACK (a bare reference with no import clause,
    // and any FUTURE name added to `STORE_WRITER_NAMES` — the landed scanner's own closure).
    const referenced = referencedWriterNames(mod.text)
    if (bound.length > 0 || referenced.length > 0) {
      offenders.push(`${id}.ts receives the store: ${[...bound, ...referenced].join(', ')}`)
    }
  }
  return offenders
}

function secondWriterClosureProblems(): string[] {
  const problems: string[] = []
  const dir = join(REPO_ROOT, 'src', 'main')
  if (!existsSync(dir)) {
    problems.push(`ABSTRACT-SUBJECT: src/main does not exist — the module-identity scan has no substrate (\`O-3\`)`)
    return problems
  }
  const offenders = securityStoreImporters(dir)
  if (offenders.length > 0) {
    problems.push(`NEG-SECOND-WRITER: the offender set is NOT empty — [${offenders.join(' | ')}]; §2.2/\`K-1\` home the receipt in \`src/shared/types.ts\` precisely so NO new \`src/main/**\` importer appears (\`O-3\`)`)
  }
  return problems
}

/** §5.1 `P-SSW-IM-6` control 5 — the DISCRIMINATION PROOF: a synthetic second importer must
 *  redden the SAME module-identity oracle. Driven over an injected module map (never over
 *  the real tree), so the control is MEASURED rather than asserted.
 *
 *  `⟶ RE-AIM ⑨ (THE GATE-4 `G-7` REMAND).` The as-filed control forged TWO modules and re-wrote
 *  the closure INLINE (`reached`) rather than driving `securityStoreImporters` — so it proved a
 *  property of a COPY, not of the row's oracle, and it could not fail if the row's predicate
 *  drifted. RE-AIMED: the corpus is written to a temp dir and the ROW'S OWN
 *  `securityStoreImporters(dir)` is driven over it. The corpus carries the three evasions the
 *  landed scanner names — a plain second writer, an ALIASED import, and a RE-EXPORT HOP carrier
 *  — so the predicate's restored `referencedNames` class and its identity closure are both
 *  exercised by the code the row runs. */
function secondWriterControlProblems(): string[] {
  const problems: string[] = []
  // the fixture lives OUTSIDE the repo tree (its own temp dir), exactly as the landed scanner's
  // own control does — so the synthetic corpus can never be mistaken for real `src/**` bytes.
  const dir = join(tmpdir(), `ssw-neg-second-writer-${process.pid}-${(process.hrtime.bigint() % 1000000n).toString(36)}`)
  let madeDir = false
  try {
    const { mkdirSync, writeFileSync, rmSync } = require('node:fs') as typeof import('node:fs')
    mkdirSync(dir, { recursive: true })
    madeDir = existsSync(dir)
    if (!madeDir) {
      problems.push(`CONTROL-VACUOUS (P-SSW-IM-6 control 5): the synthetic corpus directory could not be created — the discrimination proof has no substrate (§5.1)`)
      return problems
    }
    // (a) THE STORE MODULE and its ONE sanctioned writer
    writeFileSync(join(dir, 'security-store.ts'), 'export function createSecurityStore() {}\n', 'utf8')
    writeFileSync(join(dir, 'main.ts'), "import { createSecurityStore } from './security-store.js'\nexport const store = createSecurityStore\n", 'utf8')
    // (b) THE RE-EXPORT HOP: a carrier that re-exports the factory and binds nothing itself
    writeFileSync(join(dir, 're-exporter.ts'), "export { createSecurityStore as makeStore } from './security-store.js'\n", 'utf8')
    // (c) THE HOP CONSUMER: imports the carrier (NOT the store module) — reachable only through
    //     the identity closure, and carrying NONE of the writer NAMES in its own bytes
    writeFileSync(join(dir, 'evil-hop.ts'), "import { makeStore } from './re-exporter.js'\nexport const made = makeStore({ path: 'x' })\n", 'utf8')
    // (d) THE BARE REFERENCE: the name with NO import clause — the restored `referencedNames`
    //     class the as-filed predicate re-implemented AWAY
    writeFileSync(join(dir, 'evil-bare.ts'), "export const made = createSecurityStore({ path: 'x' })\n", 'utf8')
    // (e) THE ALIASED IMPORT: the writer renamed at the import — catches by MODULE IDENTITY, not
    //     by the binding name (the landed scanner's own named evasion)
    writeFileSync(join(dir, 'evil-alias.ts'), "import { createSecurityStore as makeStore } from './security-store.js'\nexport const made = makeStore\n", 'utf8')

    const offenders = securityStoreImporters(dir)
    if (offenders.length === 0) {
      problems.push(
        `CONTROL-VACUOUS (P-SSW-IM-6 control 5): the module-identity oracle did NOT catch a synthetic second writer of \`security-store.js\` — the corpus carries a direct importer, an ALIASED/re-exported binding and a bare reference, and the landed scanner's closure must see every one (the GATE-4 \`G-7\` remand restores the \`referencedNames\` class the as-filed copy dropped) (§5.1)`,
      )
      return problems
    }
    // THE RESTORED CLASS IS PROVEN SPECIFICALLY. `evil-bare.ts` carries the writer NAME with NO
    // import clause — it is caught ONLY by the restored `referencedNames` fallback, which the
    // as-filed copy of this predicate DROPPED (it re-implemented the class as a `binds` regex and
    // then never applied it to this shape).
    const caught = (id: string): boolean => offenders.some((o) => o.startsWith(`${id}.ts`))
    if (!caught('evil-bare')) {
      problems.push(
        `CONTROL-VACUOUS (P-SSW-IM-6 control 5): the oracle did NOT catch \`evil-bare.ts\`, which REFERENCES the writer name with NO import clause — exactly the \`referencedNames\` class the landed scanner carries and the as-filed copy of this predicate DROPPED, so the restored predicate is weaker than its original (the GATE-4 \`G-7\` finding) (§5.1)`,
      )
    }
    if (!caught('evil-alias')) {
      problems.push(
        `CONTROL-VACUOUS (P-SSW-IM-6 control 5): the oracle did NOT catch \`evil-alias.ts\`, whose binding is RENAMED (\`import { createSecurityStore as makeStore } from './security-store.js'\`) — MODULE IDENTITY, not the binding name, is what the landed limb refuses (§5.1)`,
      )
    }
    // ---- THE NAMED LIMIT (REPORTED, NEVER SMOOTHED): THE RE-EXPORT HOP ----------------------
    // `re-exporter.ts` carries `export { createSecurityStore as makeStore } from './security-store.js'`.
    // BOTH the landed scanner and this predicate build their closure from IMPORT clauses only —
    // `^\s*import … from '…'` and `^\s*import '…'` — and an `export … from` clause matches
    // NEITHER (a re-export is not an import). So a consumer that imports the re-exporter does NOT
    // enter the closure by identity. What catches the CARRIER at this head is the
    // `referencedNames`/bound class over its own body (it names `createSecurityStore`), which is
    // what the assertion below measures — and a HOP whose carrier re-spelled the name away would
    // be missed by both. That residual gap is recorded HERE, in the reading, rather than asserted
    // as a property that does not hold: the row is `P-SSW-IM-6`'s copy re-asserting the landed
    // instrument, and it may not claim a closure the instrument it copies does not have.
    const hopCarrierCaught = caught('re-exporter')
    // eslint-disable-next-line no-console
    console.log(
      `SSW P-SSW-IM-6 control 5 — the synthetic corpus offender set: [${offenders.join(' | ')}]\n` +
        `    the RE-EXPORT CARRIER \`re-exporter.ts\` caught: ${hopCarrierCaught ? 'YES (by the referencedNames class over its own body)' : 'NO'}\n` +
        `    NAMED LIMIT (recorded, not smoothed): an \`export … from\` clause is not an import, so the closure sees the carrier only via its NAMED reference — a re-export that re-spelled the name would evade BOTH the landed scanner and this predicate`,
    )
    if (!hopCarrierCaught) {
      problems.push(
        `CONTROL-VACUOUS (P-SSW-IM-6 control 5): the oracle did NOT catch the RE-EXPORT CARRIER \`re-exporter.ts\` (its body NAMES \`createSecurityStore\` in an \`export … from\` clause) — the \`referencedNames\` class is what catches it at this head, and its absence means the restored predicate is weaker than the landed instrument (§5.1; the GATE-4 \`G-7\` finding)`,
      )
    }
  } catch (e) {
    problems.push(`CONTROL-VACUOUS (P-SSW-IM-6 control 5): the synthetic corpus could not be driven (${(e as Error).message}) — the discrimination proof has no substrate (§5.1)`)
  } finally {
    if (madeDir) {
      try {
        const { rmSync } = require('node:fs') as typeof import('node:fs')
        rmSync(dir, { recursive: true, force: true })
      } catch {
        /* best-effort: the corpus is outside the repo tree and never asserted on afterwards */
      }
    }
  }
  return problems
}

/** §5.1 `P-SSW-IM-6` drive 4 — the ZERO-SPELLING scan: this unit's diff spells the refused
 *  token NOWHERE and adds NO store-union member (§1.2 item 9; `K-2`).
 *
 *  `⟶ RULING A-3A-1 ② (THE TOKEN'S SCAN SUBJECT IS NARROWED; `C-3`, IMPLEMENTER-SIDE — recorded
 *  here because THIS limb is the scan's carrier).` The invariant §3.2 `I-5` is about **THE
 *  STORE'S REFUSAL UNION**, NOT about every occurrence of the string anywhere in `src/main/**`.
 *  The AS-FILED limb scanned the whole tree flatly and therefore reddened on the two sites that
 *  are LAWFUL BY NAME:
 *    • `src/main/main.ts`'s landed `StoreChannelRefusal` vocabulary (unit 2's, commit
 *      `1479e50`) — the CHANNEL's own closed set, reconciled by that unit's `K-1`; and
 *    • `src/main/security-store.ts`'s OWN receipt declaration (§2.1 `S-4`'s
 *      `{ status: 'refused'; reason: 'write-failed' }`), which IS the receipt's form and is not
 *      a union member at all.
 *  THE OPERATIVE SUBJECT is therefore: **the adopted store module's UNION TYPE + this unit's
 *  diff**, with `main.ts`'s pre-existing unit-2 vocabulary **EXEMPT BY NAME**. The limb still
 *  reddens on its real counterexample: a **`'write-failed'` member added to the store's refusal
 *  UNION**, or a **new refusal SPELLING** anywhere in `src/main/**` (the `'secure-refused'`
 *  zero-spelling half is UNCHANGED and stays tree-wide — that token has no lawful owner). */
function refusalSiteProblems(): string[] {
  const problems: string[] = []
  const dir = join(REPO_ROOT, 'src', 'main')
  if (!existsSync(dir)) {
    problems.push(`ABSTRACT-SUBJECT: src/main does not exist — the zero-spelling scan has no substrate (§1.2 item 9)`)
    return problems
  }
  /** A-3A-1 ② — the EXEMPT-BY-NAME sites: unit 2's landed CHANNEL refusal vocabulary, which is
   *  declared in `main.ts` (`StoreChannelRefusal`) and SURFACES THROUGH the bridge in
   *  `preload.ts` (the `store.put(...)` response member, `reason?: 'malformed-payload' |
   *  'write-failed'`) — the CHANNEL's own closed set in both places, reconciled by unit 2's
   *  `K-1`. The store's OWN receipt declaration is not exempt (it is scanned, and correctly
   *  does not trip: a receipt FORM is not a union arm). */
  const EXEMPT_BY_NAME = new Set(['main.ts', 'store-channels.ts', 'preload.ts'])
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
    const text = readFileSync(join(dir, f), 'utf8')
      .split('\n')
      .filter((line) => !/^\s*(\/\/|\/\*|\*|\*\/)/.test(line))
      .join('\n')
    // (a) THE NEW-REFUSAL-SITE HALF — tree-wide, UNNARROWED: the named refused spelling has no
    //     lawful owner anywhere in `src/main/**` (§1.2 item 9).
    if (text.includes(`'${SECURE_REFUSED_TOKEN}'`)) {
      problems.push(`NEW-REFUSAL-SITE: ${relative(REPO_ROOT, join(dir, f))} spells the refused token — §1.2 item 9 denies a NEW refusal site (§5.1 P-SSW-IM-6 drive 4)`)
    }
    // (b) THE STORE-UNION HALF — narrowed to the UNION MEMBERSHIP per A-3A-1 ②. `main.ts` is
    //     exempt by name (unit 2's `StoreChannelRefusal`); every OTHER `src/main/**` module is
    //     scanned for a `'write-failed'` UNION MEMBER — a bare `| 'write-failed'` union arm or a
    //     `type … = … 'write-failed'` declaration — which is exactly §2.2/`K-2`'s falsifier.
    if (EXEMPT_BY_NAME.has(f)) continue
    const unionArm = new RegExp(`\\|\\s*'${WRITE_FAILED_TOKEN}'|'${WRITE_FAILED_TOKEN}'\\s*\\|`)
    const unionDecl = new RegExp(`(?:type|interface)\\s+\\w*[Rr]efusal\\w*\\s*=[^\\n]*'${WRITE_FAILED_TOKEN}'`)
    if (unionArm.test(text) || unionDecl.test(text)) {
      problems.push(
        `NEW-STORE-UNION-MEMBER: ${relative(REPO_ROOT, join(dir, f))} carries the receipt's reason token AS A UNION MEMBER — §2.2/§3.2 I-5 (\`K-2\`): the receipt's reason is NEVER a member of the store's refusal union (§5.1 P-SSW-IM-6 drive 4; the scan's subject is NARROWED per A-3A-1 ② — \`main.ts\`'s unit-2 channel vocabulary is exempt by name)`,
      )
    }
  }
  return problems
}

/** §1.2 item 5 / §2.3 / §3.2 I-7 — the NINE census over the STORE'S OWN BYTES, printed with
 *  its terms. Restoring five would silently drop four groups from the sanitize filter. */
function nineCensusByteProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(STORE_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, STORE_PATH)} could not be read — the census byte limb has no substrate (§2.3)`)
    return problems
  }
  const decl = /const\s+VALID_GROUPS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(text)
  if (decl === null) {
    problems.push(`CENSUS-SITE: no \`const VALID_GROUPS = new Set([...])\` declaration is readable at ${relative(REPO_ROOT, STORE_PATH)} — §2.3's census site is UNMOVED (§3.2 I-7)`)
    return problems
  }
  const terms = [...decl[1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!)
  if (terms.length !== NINE_GROUPS.length || NINE_GROUPS.some((g) => !terms.includes(g))) {
    problems.push(
      `CENSUS: \`VALID_GROUPS\` reads [${terms.join(', ')}] (CENSUS: ${terms.length}) — §2.3/\`R-4\` fix it at exactly NINE [${NINE_GROUPS.join(', ')}]; the foundation's FIVE-member clause is NOT copied (§3.2 I-7)`,
    )
  }
  return problems
}

/** §1.2 item 6 / ruling (iv) row 1 — `SecuritySettings` is NOT widened: the `write` member
 *  belongs to the IPC RESPONSE record, not the persisted type. */
function securitySettingsWideningProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(TYPES_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, TYPES_PATH)} could not be read — the no-widening limb has no substrate (§1.2 item 6)`)
    return problems
  }
  const at = text.indexOf('export interface SecuritySettings')
  if (at < 0) {
    problems.push(`SETTINGS-TYPE: \`export interface SecuritySettings\` is not readable — the no-widening limb has no subject`)
    return problems
  }
  const body = balancedBody(text, text.indexOf('{', at))
  if (body === null) {
    problems.push(`SETTINGS-TYPE: the \`SecuritySettings\` body is not balance-readable — the no-widening limb has no subject`)
    return problems
  }
  if (/\bwrite\b/.test(body)) {
    problems.push(`SETTINGS-WIDENED: \`SecuritySettings\` carries a \`write\` member — §1.2 item 6 / ruling (iv) row 1: the persisted type is NOT widened; the member belongs to the IPC RESPONSE record (§3.2 I-4)`)
  }
  return problems
}

// ===========================================================================
// §2.1 / §2.4 — THE REAL-`node:fs` boot-read drive (the corrupt/default posture, §3.2 I-3).
// The injected façade is the SHAPE instrument; the corrupt-at-read-back posture is a
// BEHAVIOURAL rule that the real `node:fs` path can be driven to hold. DRIVEN, so the limb
// is measured rather than asserted (and its honest layer is `[T]` over a temp dir — never
// app-green).
// ===========================================================================
async function bootReadRealFsProblems(): Promise<string[]> {
  const problems: string[] = []
  const load = await loadStore()
  if (!load.ok) {
    problems.push(`ABSTRACT-SUBJECT: the store module does not resolve (${load.error}) — the boot-read limb has no subject (§3.2 I-3)`)
    return problems
  }
  const factory = load.ns.createSecurityStore
  if (typeof factory !== 'function') {
    problems.push(`ABSTRACT-SUBJECT: \`createSecurityStore\` is not exported — the boot-read limb has no subject (§2.1 S-1)`)
    return problems
  }
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const dir = mkdtempSync(join(tmpdir(), 'ssw-boot-read-'))
  try {
    const DEFAULT = JSON.stringify({ token: null, enabled: ['read', 'dispatch'], maxJournalLength: undefined })
    // state 1 — a MISSING file
    let store: { get?: () => unknown } | null = null
    try {
      store = factory.call(null, { path: join(dir, 'missing.json') }) as { get?: () => unknown }
    } catch (e) {
      problems.push(`BOOT-THROW (missing): the construction THREW (${(e as Error).message}) — §3.2 I-3: a missing file answers the first-run default and NOTHING throws (§4 RE-1)`)
    }
    if (store !== null && typeof store.get === 'function') {
      const got = store.get() as { enabled?: unknown; token?: unknown }
      if (JSON.stringify({ token: got?.token ?? null, enabled: got?.enabled, maxJournalLength: (got as Record<string, unknown>)?.maxJournalLength }) !== DEFAULT) {
        problems.push(`BOOT-DEFAULT (missing): the answered config is \`${JSON.stringify(got)}\` — §3.2 I-3 fixes the first-run default at \`${DEFAULT}\` (§4 RE-1)`)
      }
    }
    // state 2 — a CORRUPT real file
    const corrupt = join(dir, 'corrupt.json')
    writeFileSync(corrupt, '{ not json at all', 'utf8')
    let store2: { get?: () => unknown } | null = null
    try {
      store2 = factory.call(null, { path: corrupt }) as { get?: () => unknown }
    } catch (e) {
      problems.push(`BOOT-THROW (corrupt): the construction THREW (${(e as Error).message}) — §3.2 I-3: a corrupt file answers the SAME first-run default and NOTHING throws (§4 RE-1)`)
    }
    if (store2 !== null && typeof store2.get === 'function') {
      const got = store2.get() as Record<string, unknown>
      if (JSON.stringify({ token: got?.token, enabled: got?.enabled, maxJournalLength: got?.maxJournalLength }) !== DEFAULT) {
        problems.push(`BOOT-DEFAULT (corrupt): the answered config is \`${JSON.stringify(got)}\` — §3.2 I-3 fixes the SAME default for a corrupt file (§4 RE-1)`)
      }
    }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
  return problems
}

// ===========================================================================
// §2.1's PARAMETER-SEMANTICS ROWS + §3.2 I-6 — the eight CLOSED patch classes.
// The post-state limbs are the LANDED semantics (GREEN-ON-ARRIVAL, §4 RE-4); the receipt
// limb is the landing-driven half.
// ===========================================================================
interface PatchClass {
  id: string
  patch: Record<string, unknown>
  /** the seed config the class is driven from */
  seed?: Record<string, unknown>
  /** the EXACT post-state §2.1's parameter rows declare */
  expect: (post: Record<string, unknown>) => string | null
}

const PATCH_CLASSES: PatchClass[] = [
  {
    id: 'groups:[code] adds+orders (§5.1 P-SSW-TP-2 class 1)',
    patch: { groups: ['code'] },
    expect: (post) => {
      const enabled = post.enabled as string[]
      return Array.isArray(enabled) && enabled.includes('code') && enabled[enabled.length - 1] === 'code'
        ? null
        : `the post-state's \`enabled\` reads [${String(enabled)}] — the NINE-member filter ADDS \`code\` and preserves current-state ORDER (appended) (§2.1; §3.2 I-6)`
    },
  },
  {
    id: 'disable:[code] removes (§5.1 P-SSW-TP-2 class 2)',
    patch: { disable: ['code'] },
    seed: { token: null, enabled: ['read', 'dispatch', 'code'] },
    expect: (post) => {
      const enabled = post.enabled as string[]
      return Array.isArray(enabled) && !enabled.includes('code')
        ? null
        : `the post-state's \`enabled\` reads [${String(enabled)}] — a \`disable\` patch REMOVES the group (§2.1; §3.2 I-6)`
    },
  },
  {
    id: "token:'abc' sets (§5.1 P-SSW-TP-2 class 3)",
    patch: { token: 'abc' },
    expect: (post) => (post.token === 'abc' ? null : `the post-state's \`token\` reads \`${String(post.token)}\` — a non-empty string SETS it (§2.1; §3.2 I-6)`),
  },
  {
    id: 'token:null clears (§5.1 P-SSW-TP-2 class 4)',
    patch: { token: null },
    seed: { token: 'abc', enabled: ['read', 'dispatch'] },
    expect: (post) => (post.token === null ? null : `the post-state's \`token\` reads \`${String(post.token)}\` — \`null\` CLEARS (§2.1; §3.2 I-6)`),
  },
  {
    id: "token:'' clears (§5.1 P-SSW-TP-2 class 5)",
    patch: { token: '' },
    seed: { token: 'abc', enabled: ['read', 'dispatch'] },
    expect: (post) => (post.token === null ? null : `the post-state's \`token\` reads \`${String(post.token)}\` — the empty string CLEARS (§2.1's parameter rows; §3.2 I-6)`),
  },
  {
    id: 'maxJournalLength:50.7 → 50 (§5.1 P-SSW-TP-2 class 6)',
    patch: { maxJournalLength: 50.7 },
    expect: (post) =>
      post.maxJournalLength === 50 ? null : `the post-state's \`maxJournalLength\` reads \`${String(post.maxJournalLength)}\` — a positive number is \`Math.floor\`ed (§2.1's parameter rows; §3.2 I-6)`,
  },
  {
    id: "maxJournalLength:0|-3|NaN|null → undefined (§5.1 P-SSW-TP-2 class 7)",
    patch: { maxJournalLength: null },
    seed: { token: null, enabled: ['read', 'dispatch'], maxJournalLength: 50 },
    expect: (post) =>
      post.maxJournalLength === undefined ? null : `the post-state's \`maxJournalLength\` reads \`${String(post.maxJournalLength)}\` — \`null\`/\`0\`/a negative/\`NaN\` CLEARS to \`undefined\` (§2.1's parameter rows; §3.2 I-6)`,
  },
  {
    id: 'absent members keep the current value (§5.1 P-SSW-TP-2 class 8)',
    patch: {},
    seed: { token: 'keep-me', enabled: ['read', 'dispatch', 'code'], maxJournalLength: 7 },
    expect: (post) =>
      post.token === 'keep-me' && post.maxJournalLength === 7 && Array.isArray(post.enabled) && (post.enabled as string[]).includes('code')
        ? null
        : `the post-state reads \`${JSON.stringify(post)}\` — \`undefined\` KEEPS the current value for every declared member (§2.1's parameter rows; §3.2 I-6)`,
  },
]

// ===========================================================================
// THE ROW ORACLES end here. The rows follow, in register order.
// ===========================================================================

// ---------------------------------------------------------------------------
// P-SSW-IM-1 — THE ATOMIC SHAPE (`S-SSW-ATOM-1`; §2.4 items 1-3; §4 RE-2).
//   3 drives × 2 readings = 6.
//     drive 1 — the success-sequence drive: the recorded order/count + the real path's record
//     drive 2 — the stale-tmp pre-existence drive: overwritten, never read
//     drive 3 — the successful-write drive: NO residual tmp
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-IM-1 — THE ATOMIC SHAPE over the INJECTED fs facade (call order/count ONLY; NO durability claim): every write is `mkdir?` → tmp → `fsync(tmp)` → `rename` → `fsync(dir)`, in that ORDER, exactly ONCE each; a stale tmp is OVERWRITTEN and never read; a successful write leaves NO residual tmp (S-SSW-ATOM-1)', () => {
  it('P-SSW-IM-1 — 3 × 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const realPath = REGISTER_SUBJECT_PATH
    const postState = JSON.stringify({ token: null, enabled: ['read', 'dispatch', 'code'], maxJournalLength: undefined }, null, 2)

    const load = await loadStore()
    const facade = newFsFacade({ seed: { [realPath]: JSON.stringify({ token: null, enabled: ['read', 'dispatch'] }, null, 2) } })

    // the façade's OWN completeness is asserted first, so an under-driving instrument is
    // reported rather than silently reading HELD.
    const facadeProblems = facadeCompletenessProblems(facade)
    expect(facadeProblems, `P-SSW-IM-1 instrument: ${facadeProblems.join(' | ') || 'the injected fs facade supplies every declared leg (§2.1 S-5)'}`).toEqual([])

    /** the ONE driven store the three drives read; `null` when the module/member is absent */
    let store: Record<string, unknown> | null = null
    if (load.ok && typeof load.ns.createSecurityStore === 'function') {
      try {
        store = load.ns.createSecurityStore({ path: realPath, fs: facade }) as Record<string, unknown>
      } catch (e) {
        store = null
        attempt(run, i++, `CREATE-THREW [P-SSW-IM-1]: \`createSecurityStore({path, fs})\` threw (${(e as Error).message}) — §2.1 S-1 declares the facade ADDITIVE-OPTIONAL on \`SecurityStoreOptions\`; at this head the option resolves NOWHERE (§4 RE-3)`)
      }
    } else {
      attempt(run, i++, `module-does-not-exist [P-SSW-IM-1]: ${relative(REPO_ROOT, STORE_PATH)} does not resolve (${load.ok ? 'createSecurityStore not exported' : load.error}) — the atomic-shape drive has no subject (§4 RE-1)`)
    }

    /** the façade's call ledger, read as the SHAPE. The drives below all consume it. */
    let recordedOk = false
    if (store !== null && typeof store.set === 'function') {
      try {
        ;(store.set as (p: unknown) => unknown).call(store, { groups: ['code'] })
        recordedOk = true
      } catch (e) {
        attempt(run, i++, `SET-THREW [P-SSW-IM-1]: \`set({groups:['code']})\` threw (${(e as Error).message}) — §3.2 I-6: NO declared-domain patch throws`)
      }
    } else if (store !== null) {
      attempt(run, i++, `MEMBER-ABSENT [P-SSW-IM-1]: the store's \`set\` member reads \`${typeof (store as Record<string, unknown>).set}\` — §2.1 S-3 declares it (§4 RE-1)`)
    }

    // ---- drive 1: the recorded sequence + the real path's record ----
    await check(run, i++, () =>
      recordedOk
        ? atomicShapeProblems(facade, realPath)[0] ?? null
        : `ABSTRACT-SUBJECT [P-SSW-IM-1 drive 1]: no write was performed over the injected facade — the façade's ledger is [${facade.calls.map((c) => c.step).join(' → ') || 'EMPTY'}] because §2.1 S-1's \`fs?\` option is ABSENT at this head, so the drive cannot reach the shape (§4 RE-3; the façade is this unit's RED-BY-SHIM instrument, ruling (vi))`,
    )
    await check(run, i++, () => {
      if (!recordedOk) return `ABSTRACT-SUBJECT [P-SSW-IM-1 drive 1 reading 2]: the real path's record identity has no subject — no write landed through the façade (§4 RE-3)`
      const onRealPath = facade.files.get(realPath)
      if (onRealPath === undefined) return `REAL-PATH-RECORD: the injected façade carries NO record at \`${relative(REPO_ROOT, realPath)}\` after the write — §2.4 item 1's rename is what puts the serialized settings there (§4 RE-2)`
      return onRealPath === postState ? null : `REAL-PATH-RECORD: the real path carries \`${onRealPath}\` — §2.4 item 1 serializes \`JSON.stringify(current, null, 2)\` of the POST-STATE (§4 RE-2)`
    })

    // ---- drive 2: a PRE-EXISTING stale tmp is OVERWRITTEN and never read ----
    await check(run, i++, () => {
      const stale = JSON.stringify({ token: 'STALE-SHOULD-NEVER-BE-READ', enabled: ['gnosis'] }, null, 2)
      const f2 = newFsFacade({ seed: { [realPath]: postState, [`${realPath}.tmp`]: stale }, failAt: null })
      let s2: Record<string, unknown> | null = null
      try {
        s2 = load.ok && typeof load.ns.createSecurityStore === 'function' ? (load.ns.createSecurityStore({ path: realPath, fs: f2 }) as Record<string, unknown>) : null
      } catch {
        s2 = null
      }
      if (s2 === null) return `ABSTRACT-SUBJECT [P-SSW-IM-1 drive 2]: the store cannot be constructed over the injected facade — the stale-tmp drive has no subject (§4 RE-3)`
      try {
        ;(s2.set as (p: unknown) => unknown).call(s2, { groups: ['code'] })
      } catch (e) {
        return `SET-THREW [P-SSW-IM-1 drive 2]: (${(e as Error).message})`
      }
      const after = f2.files.get(realPath) ?? ''
      if (after.includes('STALE-SHOULD-NEVER-BE-READ')) {
        return `STALE-TMP-READ: the real path's record carries the STALE tmp's bytes — §2.4 item 3(b)/I-2: a pre-existing stale \`${relative(REPO_ROOT, `${realPath}.tmp`)}\` is OVERWRITTEN and NEVER read as input`
      }
      return atomicShapeProblems(f2, realPath)[0] ?? null
    })
    // ---- drive 2, reading 2 (⟶ RE-AIM ⑦ — THE GATE-4 `G-8` REMAND): THE TMP-FATE PROPERTY ----
    //
    // AS-FILED, this reading drove NOTHING of the tmp fate: it rebuilt the same stale-tmp
    // fixture, called `get()` and asserted only that the member was CALLABLE
    // (`got === undefined ? … : null`) — a store-surface check that would hold on a store whose
    // stale tmp was parsed as the record. It inflated the term (`3 × 2 = 6`) with a reading its
    // declared property does not name.
    //
    // RE-AIMED: the reading asserts the ACTUAL §2.4 item 3(b) property over the fixture —
    // (a) the STALE tmp is OVERWRITTEN (its bytes are gone from `${path}.tmp`), and
    // (b) the pre-existing tmp was NEVER PARSED as the record: the BOOT READ (which happens at
    //     construction, BEFORE the drive's `set`) answered the REAL path's record — the stale
    //     tmp's poison token never surfaced — and a SUCCESSFUL write leaves NO tmp behind.
    // The term is UNMOVED (`3 drives × 2 readings = 6`), because the reading is now what it
    // always CLAIMED to be. FALSIFIER: a store that parses `${path}.tmp` on boot reddens (a) via
    // the poisoned token, and a store that keeps the stale tmp reddens (b).
    await check(run, i++, () => {
      const stale = JSON.stringify({ token: 'STALE-SHOULD-NEVER-BE-READ', enabled: ['gnosis'] }, null, 2)
      const f2 = newFsFacade({ seed: { [realPath]: postState, [`${realPath}.tmp`]: stale }, failAt: null })
      let s2: Record<string, unknown> | null = null
      try {
        s2 = load.ok && typeof load.ns.createSecurityStore === 'function' ? (load.ns.createSecurityStore({ path: realPath, fs: f2 }) as Record<string, unknown>) : null
      } catch {
        s2 = null
      }
      if (s2 === null) return `ABSTRACT-SUBJECT [P-SSW-IM-1 drive 2 reading 2]: the boot read has no injected subject (§4 RE-3)`
      // (a) THE BOOT READ PARSED THE REAL PATH, NOT THE STALE TMP — read BEFORE any write.
      const booted = typeof s2.get === 'function' ? ((s2.get as () => unknown).call(s2) as Record<string, unknown>) : undefined
      if (booted === undefined) {
        return `STORE-SURFACE [P-SSW-IM-1 drive 2 reading 2]: the store's \`get\` member is not callable (§2.1 S-2)`
      }
      if (booted?.token === 'STALE-SHOULD-NEVER-BE-READ') {
        return `STALE-TMP-PARSED: the BOOT READ answered the stale tmp's token — §2.4 item 3(b)/I-2: a pre-existing \`${relative(REPO_ROOT, `${realPath}.tmp`)}\` is NEVER parsed as the record (the boot read reads the REAL path ONLY)`
      }
      // (b) THE SUCCESSFUL WRITE LEAVES NO TMP, and the stale bytes it consumed are GONE.
      try {
        ;(s2.set as (p: unknown) => unknown).call(s2, { groups: ['code'] })
      } catch (e) {
        return `SET-THREW [P-SSW-IM-1 drive 2 reading 2]: (${(e as Error).message})`
      }
      if (f2.files.has(`${realPath}.tmp`)) {
        const residue = f2.files.get(`${realPath}.tmp`) ?? ''
        return residue.includes('STALE-SHOULD-NEVER-BE-READ')
          ? `STALE-TMP-UNTOUCHED: the pre-existing \`${relative(REPO_ROOT, `${realPath}.tmp`)}\` still carries its ORIGINAL bytes after a successful write — §2.4 item 3(a)/(b): the stale tmp is OVERWRITTEN (and the rename consumes it), so no tmp survives a SUCCESS`
          : `TMP-RESIDUE: a residual \`${relative(REPO_ROOT, `${realPath}.tmp`)}\` remains after a successful write — §2.4 item 3(a)/I-2 leave NO tmp after a SUCCESS`
      }
      return null
    })

    // ---- drive 3: NO residual tmp after a SUCCESS ----
    await check(run, i++, () => {
      if (!recordedOk) return `ABSTRACT-SUBJECT [P-SSW-IM-1 drive 3]: the no-residual-tmp reading has no subject — no write landed through the facade (§4 RE-3)`
      return facade.files.has(`${realPath}.tmp`)
        ? `TMP-RESIDUE: a residual \`${relative(REPO_ROOT, `${realPath}.tmp`)}\` remains after a successful write — §2.4 item 3(a)/I-2 leave NO tmp after a SUCCESS (§4 RE-2)`
        : null
    })
    await check(run, i++, () => {
      if (!recordedOk) return `ABSTRACT-SUBJECT [P-SSW-IM-1 drive 3 reading 2]: the call-count reading has no subject (§4 RE-3)`
      const steps = facade.calls.map((c) => c.step)
      const expected: AtomicStep[] = ['writeTmp', 'fsyncTmp', 'rename', 'fsyncDir']
      const counts = expected.map((s) => `${s}:${String(steps.filter((x) => x === s).length)}`)
      return expected.every((s) => steps.filter((x) => x === s).length === 1)
        ? null
        : `ATOMIC-COUNT: the recorded per-step counts read [${counts.join(', ')}] — §2.4 item 2 requires every unconditional step EXACTLY ONCE; the landed shape performs NO tmp write, NO fsync and NO rename (§4 RE-2)`
    })

    finish('P-SSW-IM-1', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-IM-2 — THE FAILED-WRITE-INTACT RULE (`S-SSW-ATOM-2`; §2.4 item 6; §3.2 I-1).
//   3 injection points × 2 readings + 2 controls = 8.
//     the three points: the tmp write · `fsyncSync` · `renameSync`
//     reading 1 — the real path's record is BYTE-IDENTICAL to the pre-write record
//     reading 2 — the receipt is `{status:'refused', reason:'write-failed'}` AND `get()`
//                 still answers the in-memory post-state
//     control 1 — the refusal oracle rejects a `committed` receipt
//     control 2 — the byte-identity oracle rejects a ONE-BYTE mutation
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-IM-2 — THE FAILED-WRITE-INTACT RULE: at EACH of the three injection points the previous file stays BYTE-IDENTICAL at the real path, the receipt is the refused form, and `get()` still answers the in-memory post-state (S-SSW-ATOM-2)', () => {
  it('P-SSW-IM-2 — 3 × 2 + 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const realPath = REGISTER_SUBJECT_PATH
    const PRE_WRITE = JSON.stringify({ token: 'PRE-WRITE-TOKEN', enabled: ['read', 'dispatch'], maxJournalLength: 11 }, null, 2)
    const load = await loadStore()

    /** The THREE throwable arms the spec's §2.4 item 6 names. The façade's arm set is the
     *  CLOSED four FACADE_ARMS; the three INJECTION POINTS of this row are the tmp write,
     *  `fsyncSync` and `renameSync` (`mkdirSync` is the fourth arm and is `P-SSW-IM-4`'s). */
    const points: Array<{ arm: FacadeArm; label: string }> = [
      { arm: 'tmpWrite', label: 'the tmp write' },
      { arm: 'fsyncSync', label: 'fsyncSync' },
      { arm: 'renameSync', label: 'renameSync' },
    ]

    for (const point of points) {
      // reading 1 — the real path's record is BYTE-IDENTICAL to the pre-write record
      await check(run, i++, () => {
        const probe = driveRefusal(load, point.arm, realPath, PRE_WRITE)
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-2 ${point.label}]: ${probe.absent}`
        const onReal = probe.files.get(realPath)
        if (onReal !== PRE_WRITE) {
          return `FAILED-WRITE-INTACT (${point.label}): the real path carries \`${String(onReal)}\` — §2.4 item 6/§3.2 I-1 require the PREVIOUS file BYTE-IDENTICAL after a failure at this point (a torn/partial record at the real path is I-1's falsifier)`
        }
        return null
      })
      // reading 2 — the refused receipt + the in-memory post-state
      await check(run, i++, () => {
        const probe = driveRefusal(load, point.arm, realPath, PRE_WRITE)
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-2 ${point.label}]: ${probe.absent}`
        if (probe.receiptAbsent !== null) return `MEMBER-ABSENT [P-SSW-IM-2 ${point.label}]: ${probe.receiptAbsent}`
        const form = receiptFormProblems(probe.receipt, `the ${point.label} refusal`)
        if (form.length > 0) return form.join(' | ')
        if ((probe.receipt as Record<string, unknown>).status !== 'refused') {
          return `REFUSAL-STATUS (${point.label}): the receipt reads \`${JSON.stringify(probe.receipt)}\` — a failure at this injection point answers \`{status:'refused', reason:'${WRITE_FAILED_TOKEN}'}\` (§2.4 item 6; §4 RE-3)`
        }
        if (probe.postState === null) {
          return `IN-MEMORY-POST-STATE (${point.label}): \`get()\` could not be read after the refusal — §3.2 I-1 requires the in-memory post-state still to answer \`get()\` (a \`get()\` that reverts is I-1's falsifier)`
        }
        return null
      })
    }

    // ---- control 1: the receipt oracle REJECTS each genuinely ILL-FORMED receipt, while
    //      ADMITTING the row's own required REFUSED form as its baseline.
    //
    //      AS-FILED (self-vacuous — the `A-3A-1` ③ RE-AIM): the control asserted that
    //      `receiptFormProblems({status:'committed'})` must be NON-EMPTY. That inverts the
    //      oracle's own contract: `receiptFormProblems` is a FORM-VALIDITY oracle (§2.2's TWO
    //      CLOSED forms), and `{status:'committed'}` IS one of them — it is well-formed and
    //      rightly admissible (measured: returns `[]`). The control could only ever pass by
    //      demanding that a VALID form be rejected, so its "expected outcome" was the same
    //      shape as the row's verdict and it discriminated NOTHING.
    //
    //      RE-AIMED: the controls are the receipts that are INVALID BY §2.2/§3.2 I-4/I-5 — a
    //      THIRD STATUS, the `committed` arm CARRYING a `reason`, the `refused` arm MISSING its
    //      `reason`, and a RE-SPELLED reason token. Each must be REJECTED (non-empty), the
    //      OPPOSITE of the row's verdict on its own driven subject, while the row's required
    //      refusal form must be ADMITTED (empty). The control still catches its counterexample:
    //      an oracle loosened to admit a third status, a reasonless refusal, or a re-spelled
    //      reason reddens here — which the as-filed control could not see.
    await check(run, i++, () => {
      const baseline = receiptFormProblems({ status: 'refused', reason: WRITE_FAILED_TOKEN }, 'the control')
      if (baseline.length > 0) {
        return `CONTROL-VACUOUS (P-SSW-IM-2 control 1): the receipt oracle REJECTED the row's OWN required refused form \`{status:'refused', reason:'${WRITE_FAILED_TOKEN}'}\` (\`${baseline.join(' | ')}\`) — the control's baseline must be admissible, else the drive's own verdict is unreadable`
      }
      const wellFormed = receiptFormProblems({ status: 'committed' }, 'the control')
      if (wellFormed.length > 0) {
        return `CONTROL-VACUOUS (P-SSW-IM-2 control 1): the receipt oracle REJECTED the WELL-FORMED \`{status:'committed'}\` (\`${wellFormed.join(' | ')}\`) — that form is the FIRST of §2.2's TWO CLOSED forms and is rightly ADMISSIBLE; a form-validity oracle that rejects a declared form has drifted from §2.2`
      }
      const invalids: Array<{ label: string; receipt: unknown }> = [
        { label: `a THIRD status (\`swallowed\`)`, receipt: { status: 'swallowed' } },
        { label: `the \`committed\` arm carrying a \`reason\``, receipt: { status: 'committed', reason: WRITE_FAILED_TOKEN } },
        { label: `the \`refused\` arm MISSING its \`reason\``, receipt: { status: 'refused' } },
        { label: `a RE-SPELLED reason (\`'${SECURE_REFUSED_TOKEN}'\`)`, receipt: { status: 'refused', reason: SECURE_REFUSED_TOKEN } },
        { label: `\`undefined\` in place of a receipt`, receipt: undefined },
      ]
      for (const bad of invalids) {
        if (receiptFormProblems(bad.receipt, 'the control').length === 0) {
          return `CONTROL-VACUOUS (P-SSW-IM-2 control 1): the receipt oracle ADMITTED ${bad.label} — its expected outcome is the OPPOSITE of the row's verdict (the drive requires the refused form; every ILL-FORMED receipt must be REJECTED), so an oracle admitting it makes the FAILED-WRITE-INTACT row unfalsifiable (§2.2; §3.2 I-4/I-5)`
        }
      }
      return null
    })
    // ---- control 2: the byte-identity oracle rejects a ONE-BYTE mutation ----
    await check(run, i++, () => {
      const mutated = PRE_WRITE.slice(0, 5) + (PRE_WRITE[5] === 'X' ? 'Y' : 'X') + PRE_WRITE.slice(6)
      if (mutated === PRE_WRITE) {
        return `CONTROL-VACUOUS (P-SSW-IM-2 control 2): the one-byte mutation did not change the record — the byte-identity oracle has nothing to discriminate against`
      }
      const identityHolds = (a: string | undefined, b: string): boolean => a === b
      if (identityHolds(realPathRecordProbe(PRE_WRITE), PRE_WRITE) === false) {
        return `CONTROL-VACUOUS (P-SSW-IM-2 control 2): the byte-identity oracle rejected the IDENTICAL record — its baseline is broken`
      }
      if (identityHolds(realPathRecordProbe(mutated), PRE_WRITE)) {
        return `CONTROL-VACUOUS (P-SSW-IM-2 control 2): the byte-identity oracle ACCEPTED a ONE-BYTE-mutated record — the FAILED-WRITE-INTACT property would be unfalsifiable`
      }
      return null
    })

    finish('P-SSW-IM-2', run)
  }, 12_000)
})

/** The `P-SSW-IM-2` drive: a fresh façade seeded with the pre-write record, `failAt` the named
 *  arm, a store constructed over it, one `set()` performed, then the receipt + files read. */
function driveRefusal(
  load: StoreLoad,
  arm: FacadeArm,
  realPath: string,
  preWrite: string,
): {
  files: Map<string, string>
  receipt: unknown
  postState: unknown
  absent: string | null
  receiptAbsent: string | null
} {
  const files = new Map<string, string>([[realPath, preWrite]])
  if (!load.ok || typeof load.ns.createSecurityStore !== 'function') {
    return {
      files,
      receipt: undefined,
      postState: null,
      absent: `the store module/member does not resolve (${load.ok ? 'createSecurityStore not exported' : load.error}) — the ${arm} injection drive has no subject (§4 RE-1)`,
      receiptAbsent: null,
    }
  }
  const facade = newFsFacade({ seed: { [realPath]: preWrite }, failAt: arm })
  let store: Record<string, unknown>
  try {
    store = load.ns.createSecurityStore({ path: realPath, fs: facade }) as Record<string, unknown>
  } catch (e) {
    return {
      files: facade.files,
      receipt: undefined,
      postState: null,
      absent: `\`createSecurityStore({path, fs})\` threw (${(e as Error).message}) — §2.1 S-1's \`fs?\` option resolves NOWHERE at this head (§4 RE-3)`,
      receiptAbsent: null,
    }
  }
  if (typeof store.set !== 'function') {
    return { files: facade.files, receipt: undefined, postState: null, absent: `the store's \`set\` member is not callable (§2.1 S-3)`, receiptAbsent: null }
  }
  try {
    ;(store.set as (p: unknown) => unknown).call(store, { groups: ['code'] })
  } catch (e) {
    // a THROW here is itself a finding: §3.2 I-6 (no patch class throws) and §2.4 item 6 (a
    // refusal answers its receipt — it never throws). Report it as the absent-subject reason
    // so the row's counterexample names it rather than dying silently.
    return {
      files: facade.files,
      receipt: undefined,
      postState: null,
      absent: `the set() THREW at the ${arm} injection point (${(e as Error).message}) — §2.4 item 6/§3.2 I-4: a refusal ANSWERS the refused receipt and NEVER throws`,
      receiptAbsent: null,
    }
  }
  const member = store.lastWriteReceipt
  if (typeof member !== 'function') {
    return {
      files: facade.files,
      receipt: undefined,
      postState: null,
      absent: null,
      receiptAbsent: `\`lastWriteReceipt()\` reads \`${typeof member}\` — §2.1 S-4 declares the NEW member; at this head it resolves NOWHERE, so the refused receipt is UNREACHABLE (§4 RE-1)`,
    }
  }
  const receipt = (member as () => unknown).call(store)
  const postState = typeof store.get === 'function' ? (store.get as () => unknown).call(store) : null
  return { files: facade.files, receipt, postState, absent: null, receiptAbsent: null }
}

function realPathRecordProbe(record: string): string {
  return record
}

// ---------------------------------------------------------------------------
// P-SSW-IM-3 — THE TMP FATE AND THE BOOT READ (`S-SSW-TMP-1`; §2.4 item 3; §3.2 I-2/I-3).
//   3 boot states × 2 readings = 6.
//     state 1 — a valid real file   state 2 — a valid-looking tmp ALONE   state 3 — a corrupt
//     real file
//     reading 1 — the answered settings value    reading 2 — the no-throw property
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-IM-3 — THE TMP FATE AND THE BOOT READ: the boot read reads the REAL path ONLY (a `${path}.tmp` carrying valid-looking bytes is NEVER parsed as the record); a missing file and a corrupt file both answer the first-run default; NOTHING throws on any read-back path (S-SSW-TMP-1)', () => {
  it('P-SSW-IM-3 — 3 × 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const realPath = REGISTER_SUBJECT_PATH
    const tmpPath = `${realPath}.tmp`
    const REAL_RECORD = JSON.stringify({ token: 'REAL-RECORD-TOKEN', enabled: ['read', 'dispatch', 'code'], maxJournalLength: 21 }, null, 2)
    const TMP_POISON = JSON.stringify({ token: 'TMP-ONLY-TOKEN', enabled: ['gnosis'] }, null, 2)
    const load = await loadStore()

    const states: Array<{ label: string; seed: Record<string, string>; reading: (post: unknown) => string | null }> = [
      {
        label: 'a valid real file',
        seed: { [realPath]: REAL_RECORD },
        reading: (post) => {
          const p = (post ?? {}) as Record<string, unknown>
          return p.token === 'REAL-RECORD-TOKEN' && Array.isArray(p.enabled) && (p.enabled as string[]).includes('code')
            ? null
            : `BOOT-VALUE (a valid real file): the answered config reads \`${JSON.stringify(post)}\` — §2.4 item 3(c) reads the REAL path (§4 RE-3)`
        },
      },
      {
        label: 'a valid-looking tmp ALONE',
        seed: { [realPath]: REAL_RECORD, [tmpPath]: TMP_POISON },
        reading: (post) => {
          const p = (post ?? {}) as Record<string, unknown>
          if (p.token === 'TMP-ONLY-TOKEN') {
            return `TMP-PARSED: the boot read answered the TMP file's token — §2.4 item 3(c)/I-2: a \`${relative(REPO_ROOT, tmpPath)}\` is NEVER parsed as the record`
          }
          return p.token === 'REAL-RECORD-TOKEN' ? null : `BOOT-VALUE (a valid-looking tmp ALONE): the answered config reads \`${JSON.stringify(post)}\` — the REAL path's record is the ONLY subject (§4 RE-3)`
        },
      },
      {
        label: 'a corrupt real file',
        seed: { [realPath]: '{ not json at all' },
        reading: (post) => {
          const p = (post ?? {}) as Record<string, unknown>
          const DEFAULT_OK = p.token === null && Array.isArray(p.enabled) && (p.enabled as string[]).join(',') === 'read,dispatch' && p.maxJournalLength === undefined
          return DEFAULT_OK
            ? null
            : `BOOT-DEFAULT (a corrupt real file): the answered config reads \`${JSON.stringify(post)}\` — §3.2 I-3 fixes the first-run default \`{token:null, enabled:['read','dispatch'], maxJournalLength:undefined}\` for a corrupt file (§4 RE-3)`
        },
      },
    ]

    for (const state of states) {
      // reading 1 — the answered settings value
      await check(run, i++, () => {
        const probe = bootProbe(load, realPath, state.seed)
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-3 ${state.label}]: ${probe.absent}`
        return state.reading(probe.post)
      })
      // reading 2 — the no-throw property, over the SAME driven subject
      await check(run, i++, () => {
        const probe = bootProbe(load, realPath, state.seed)
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-3 ${state.label}]: ${probe.absent}`
        return probe.threw === null ? null : `BOOT-THREW (${state.label}): the construction threw (${probe.threw}) — §3.2 I-3: NOTHING throws on any read-back path (§4 RE-3)`
      })
    }

    // the landed real-`node:fs` posture, DRIVEN (never asserted) — its honest layer is `[T]`
    // over a temp dir; it is GREEN-ON-ARRIVAL at this head (§4 RE-4's named green half).
    const realFs = await bootReadRealFsProblems()
    // eslint-disable-next-line no-console
    console.log(
      `SSW P-SSW-IM-3 [the real-` + '`node:fs`' + ` boot-read drive, GREEN-ON-ARRIVAL at this head]: ${realFs.length} finding(s)${realFs.length > 0 ? `\n    ${realFs.join('\n    | ')}` : ''}`,
    )
    expect(realFs, `P-SSW-IM-3 [real-fs drive — GREEN-ON-ARRIVAL]: ${realFs.join(' | ') || 'a missing file and a corrupt file both answer the first-run default; nothing throws (§3.2 I-3)'}`).toEqual([])

    finish('P-SSW-IM-3', run)
  }, 12_000)
})

/** The `P-SSW-IM-3` drive: a store constructed over a façade seeded with the named boot state. */
function bootProbe(
  load: StoreLoad,
  realPath: string,
  seed: Record<string, string>,
): { post: unknown; threw: string | null; absent: string | null } {
  if (!load.ok || typeof load.ns.createSecurityStore !== 'function') {
    return { post: null, threw: null, absent: `the store module/member does not resolve (${load.ok ? 'createSecurityStore not exported' : load.error}) — the boot state has no subject (§4 RE-1)` }
  }
  const facade = newFsFacade({ seed })
  try {
    const store = load.ns.createSecurityStore({ path: realPath, fs: facade }) as Record<string, unknown>
    const post = typeof store.get === 'function' ? (store.get as () => unknown).call(store) : null
    return { post, threw: null, absent: null }
  } catch (e) {
    return {
      post: null,
      threw: (e as Error).message,
      absent: `\`createSecurityStore({path, fs})\` threw (${(e as Error).message}) — §2.1 S-1's \`fs?\` option resolves NOWHERE at this head, so the boot state cannot be driven over an INJECTED facade (§4 RE-3)`,
    }
  }
}

// ---------------------------------------------------------------------------
// P-SSW-IM-4 — THE RED-BY-SHIM FAÇADE (`S-SSW-SHIM-1`; §2.1 S-5; ruling (vi)).
//   4 façade arms × 2 readings + 2 controls = 8.
//     the arms: `mkdirSync` · the tmp write · `fsyncSync` · `renameSync`, each INDEPENDENTLY
//     throwable, each throw answering the refused receipt with the previous file INTACT
//     control 1 — the ABSENT-façade inertness (the seam is INERT by default)
//     control 2 — the discriminating counterexample that the real `fs` is NOT being reached
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-IM-4 — THE RED-BY-SHIM FACADE (the unit\'s declared shim instrument, ruling (vi)): with the facade ABSENT the store behaves identically to the real-`fs` path (the seam is INERT by default); with the facade PRESENT each of the FOUR arms is INDEPENDENTLY throwable and each throw answers the refused receipt with the previous file INTACT (S-SSW-SHIM-1)', () => {
  it('P-SSW-IM-4 — 4 × 2 + 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const realPath = REGISTER_SUBJECT_PATH
    const PRE_WRITE = JSON.stringify({ token: 'PRE-WRITE-TOKEN', enabled: ['read', 'dispatch'] }, null, 2)
    const load = await loadStore()

    for (const arm of FACADE_ARMS) {
      // reading 1 — the refused receipt (member-presence surfaced distinctly, per the RE-1/RE-3 split)
      await check(run, i++, () => {
        const probe = driveRefusal(load, arm, realPath, PRE_WRITE)
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-4 arm ${arm}]: ${probe.absent}`
        if (probe.receiptAbsent !== null) return `MEMBER-ABSENT [P-SSW-IM-4 arm ${arm}]: ${probe.receiptAbsent}`
        const form = receiptFormProblems(probe.receipt, `the ${arm} arm`)
        if (form.length > 0) return form.join(' | ')
        return (probe.receipt as Record<string, unknown>).status === 'refused'
          ? null
          : `ARM-SHIM (${arm}): the receipt reads \`${JSON.stringify(probe.receipt)}\` — a throw from this arm answers the REFUSED receipt (§0 R-7; ruling (vi); §4 RE-3)`
      })
      // reading 2 — the previous file INTACT
      await check(run, i++, () => {
        const probe = driveRefusal(load, arm, realPath, PRE_WRITE)
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-4 arm ${arm}]: ${probe.absent}`
        const onReal = probe.files.get(realPath)
        return onReal === PRE_WRITE
          ? null
          : `ARM-INTACT (${arm}): the real path carries \`${String(onReal)}\` — ruling (vi) requires EACH arm's throw to answer the refused receipt with the previous file INTACT (§2.4 item 6; §3.2 I-1)`
      })
    }

    // ---- control 1: the ABSENT-façade inertness (the seam is INERT by default) ----
    //
    //      AS-FILED (THREW UNCONDITIONALLY — the `A-3A-1` ③ RE-AIM): the control drove
    //      `driveRefusal(null as unknown as StoreLoad, …)` and read `probe.absent`. `null` is
    //      not a `StoreLoad`; `driveRefusal` dereferences `load.ok` on its second line, so the
    //      drive THREW `TypeError: Cannot read properties of null (reading 'ok')` before any
    //      assertion could run — the control never asserted, it only crashed, and the row's
    //      counterexample was a harness defect rather than a property verdict.
    //
    //      RE-AIMED: the null-subject case is driven as its OWN ASSERTED REFUSAL OUTCOME —
    //      the absent-subject class is asserted EXPLICITLY (an absent/malformed loader must
    //      report the absent class, never mint a receipt), inside a guard that converts a throw
    //      into a NAMED counterexample. The control then ALSO measures the real inertness over
    //      a real subject: with NO façade injected the store must still work (§2.1 `S-5`:
    //      ABSENT ⇒ the real `node:fs`).
    //
    //      The control still catches its counterexample: a `driveRefusal` that SILENTLY
    //      accepts an absent loader and reports success (instead of the absent-subject class)
    //      reddens it — and a seam that is REQUIRED rather than inert reddens the real-`fs`
    //      half.
    await check(run, i++, async () => {
      if (!load.ok || typeof load.ns.createSecurityStore !== 'function') {
        return `ABSTRACT-SUBJECT [P-SSW-IM-4 control 1]: the store module/member does not resolve — the inertness control has no subject (§4 RE-1)`
      }
      // (a) THE INERTNESS PROPERTY, DRIVEN OVER A REAL SUBJECT: with NO façade injected the
      //     store must behave EXACTLY as the injected path does — the seam is INERT by
      //     default (§2.1 `S-5`), i.e. the store's declared shape is NOT a façade-only shape.
      //     This is the OPPOSITE of the row's verdict (the four arms are throwable ONLY when a
      //     façade IS injected) and it is driven over the REAL `node:fs` in a temp dir.
      //
      //     NOTE — the AS-FILED drive prodded `null as unknown as StoreLoad` and dereferenced
      //     `load.ok`, throwing `TypeError` before it could assert anything; a null-loader is
      //     NOT this control's subject (it is a harness-shape question), so the re-aim does not
      //     keep poking it. The absent-subject CLASS is already asserted by each of the eight
      //     arm readings above, which report `ABSTRACT-SUBJECT` whenever the subject is absent.
      const { mkdtempSync, rmSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const dir = mkdtempSync(join(tmpdir(), 'ssw-inert-'))
      try {
        const noFacadePath = join(dir, 'sec.json')
        const store = load.ns.createSecurityStore({ path: noFacadePath }) as Record<string, unknown>
        ;(store.set as (p: unknown) => unknown).call(store, { groups: ['code'] })
        const got = (store.get as () => Record<string, unknown>).call(store)
        if (!(Array.isArray(got.enabled) && (got.enabled as string[]).includes('code'))) {
          return `SEAM-INERTNESS (control 1): with NO façade injected the store answered \`${JSON.stringify(got)}\` — §2.1 S-5: ABSENT ⇒ the real \`node:fs\`, and the seam is INERT by default`
        }
        // the receipt is the STORE's own surface (§2.1 S-4): it must NOT be a façade-only
        // artefact, so the no-façade write answers the SAME closed form as the injected path.
        // This is the discriminating counterexample the control exists to catch: a receipt
        // reachable ONLY through the injection would leave this limb unable to observe it.
        const member = store.lastWriteReceipt
        if (typeof member !== 'function') {
          return `SEAM-INERTNESS (control 1): with NO façade injected \`lastWriteReceipt()\` reads \`${typeof member}\` — the receipt is the STORE's own surface (§2.1 S-4) and must not depend on the façade's presence (§4 RE-1)`
        }
        const receipt = (member as () => unknown).call(store)
        const form = receiptFormProblems(receipt, 'the no-façade inertness drive')
        if (form.length > 0) return form.join(' | ')
        if ((receipt as Record<string, unknown>).status !== 'committed') {
          return `SEAM-INERTNESS (control 1): the no-façade write answered \`${JSON.stringify(receipt)}\` — §2.1 S-5/§2.4 item 1: with the real \`node:fs\` and no injected arm failing, the write COMMITS, exactly as the injected path does (the seam is INERT)`
        }
        // ---- ⟶ RE-AIM ⑧ (THE GATE-4 `G-9` REMAND): THE DIFFERENTIAL READING ----------------
        // The limb's DECLARED property is "with the façade ABSENT the store behaves IDENTICALLY
        // TO THE REAL-`fs` PATH". AS-FILED it asserted only that the no-façade store WORKS — the
        // word "identically" had no reading: a no-façade store that diverged from the injected
        // path in its POST-STATE (or in its receipt) would have stayed green.
        //
        // THE OPERATIVE READING: the SAME patch is driven down BOTH paths over the SAME seed —
        // (i) with the façade ABSENT (the real `node:fs`), and (ii) with the façade PRESENT and
        // silent (every arm supplied, nothing failing) — and the two answers are compared. The
        // differential is the observable: both post-states AND both receipt forms must agree.
        // FALSIFIER: a seam that is NOT inert (an injected façade that changes the store's
        // answer — a partial façade, a façade-only code path, a receipt minted only under
        // injection) reddens HERE, because the two paths stop agreeing.
        const noFacadePost = JSON.stringify(got)
        const silentFacade = newFsFacade({ failAt: null })
        const injected = load.ns.createSecurityStore({ path: noFacadePath, fs: silentFacade }) as Record<string, unknown>
        ;(injected.set as (p: unknown) => unknown).call(injected, { groups: ['code'] })
        const injectedPost = JSON.stringify((injected.get as () => unknown).call(injected))
        if (injectedPost !== noFacadePost) {
          return `SEAM-INERTNESS (control 1 — DIFFERENTIAL): the SAME patch answered \`${injectedPost}\` through an injected (silent) façade and \`${noFacadePost}\` through the real \`node:fs\` — §2.1 S-5 declares the façade ADDITIVE with the seam INERT BY DEFAULT, i.e. the injected path must behave IDENTICALLY to the real-` + '`fs`' + ` path. A divergence means the seam is not inert (a façade-only code path)`
        }
        const injectedMember = injected.lastWriteReceipt
        if (typeof injectedMember !== 'function') {
          return `SEAM-INERTNESS (control 1 — DIFFERENTIAL): the injected path has no \`lastWriteReceipt()\` (\`${typeof injectedMember}\`) while the no-façade path does — the receipt surface must not depend on the façade's presence (§2.1 S-4)`
        }
        const injectedReceipt = JSON.stringify((injectedMember as () => unknown).call(injected))
        const noFacadeReceipt = JSON.stringify(receipt)
        if (injectedReceipt !== noFacadeReceipt) {
          return `SEAM-INERTNESS (control 1 — DIFFERENTIAL): the receipt reads \`${injectedReceipt}\` through the injected façade and \`${noFacadeReceipt}\` through the real \`node:fs\` — §2.1 S-5's seam is INERT, so both paths answer the SAME closed form for the SAME patch`
        }
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
      return null
    })
    // ---- control 2: the discriminating counterexample — the real `fs` is NOT being reached ----
    //
    //      AS-FILED (`G-4`, gate-4 REMAND — THE CONTROL DROVE NOTHING): the body built a façade,
    //      recorded `facade.calls.length` (which is trivially 0 on a fresh façade), and read
    //      `existsSync(realPath)` — and then RETURNED. No store was CONSTRUCTED, no write was
    //      DRIVEN, so the property "the real `fs` is not being reached" was never OBSERVED: the
    //      limb asserted a property of an untouched fixture and would have stayed green even if
    //      the store had bypassed the injection entirely and written to the real path.
    //
    //      RE-AIMED: the control now DRIVES the store over the façade with `failAt:'renameSync'`
    //      — the arm that fires AFTER the tmp write has already landed in the façade's table —
    //      and asserts the TWO readings that make "the real `fs` was not reached" OBSERVABLE:
    //        (a) the façade's call ledger is NON-EMPTY (the store really did route its I/O
    //            through the injection, so the drive had a subject at all); and
    //        (b) the REAL path carries NO record on disk (the write never escaped the façade).
    //      THE COUNTEREXAMPLE: a store that reached the real `node:fs` would mint the real file
    //      (and/or leave the façade's ledger empty) — either reddens this limb by name.
    await check(run, i++, () => {
      const facade = newFsFacade({ seed: { [realPath]: PRE_WRITE }, failAt: 'renameSync' })
      if (facade.calls.length !== 0) {
        return `CONTROL-VACUOUS (P-SSW-IM-4 control 2): the freshly-built facade already carries ${facade.calls.length} recorded call(s) — the ledger must start EMPTY for the counterexample to discriminate`
      }
      const contaminated = ((): boolean => {
        try {
          return existsSync(realPath)
        } catch {
          return false
        }
      })()
      if (contaminated) {
        return `CONTROL-VACUOUS (P-SSW-IM-4 control 2): the real path exists on disk BEFORE the drive — the counterexample's discriminator is contaminated`
      }
      const built = buildStore(load, facade, realPath)
      if (built.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-IM-4 control 2]: ${built.absent}`
      try {
        ;(built.store.set as (p: unknown) => unknown).call(built.store, { groups: ['code'] })
      } catch (e) {
        return `SET-THREW [P-SSW-IM-4 control 2]: (${(e as Error).message}) — §2.4 item 6: a refusal ANSWERS its receipt and never throws`
      }
      // (a) the DRIVE actually reached the injection — a store that ignored the façade would
      //     leave this ledger EMPTY, which is the "the real fs is being reached" class itself.
      const steps = facade.calls.map((c) => c.step)
      if (steps.length === 0) {
        return `REAL-FS-REACHED (P-SSW-IM-4 control 2): the driven write recorded NO call over the injected façade (ledger [EMPTY]) while §2.1 S-5 requires the INJECTED façade to be the store's I/O source — a store that reached the real \`node:fs\` instead leaves this ledger bare`
      }
      if (!steps.includes('rename')) {
        return `REAL-FS-REACHED (P-SSW-IM-4 control 2): the driven write reached the façade but never its \`rename\` arm (ledger [${steps.join(' → ')}]) — the control's premise is that \`failAt:'renameSync'\` IS driven`
      }
      // (b) the discriminator: the real path carries NO record — the write did not escape.
      const escaped = ((): boolean => {
        try {
          return existsSync(realPath)
        } catch {
          return false
        }
      })()
      return escaped
        ? `REAL-FS-REACHED (P-SSW-IM-4 control 2): the REAL path \`${relative(REPO_ROOT, realPath)}\` exists on disk AFTER a write driven through an INJECTED failing façade — §2.1 S-5: a production caller never injects one, so a real file appearing here means the INJECTION WAS BYPASSED and the real \`node:fs\` was reached (the discrimination this control exists to make)`
        : null
    })

    finish('P-SSW-IM-4', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-IM-5 — THE NINE-MEMBER CENSUS (`S-SSW-CENS-1`; §2.3; ruling (vii)/`K-3`).
//   4 drives = 4.
//     (1) the set equality over the STORE'S BYTES, printed as its nine terms
//     (2) `set({groups:[all nine]})` admits all nine
//     (3) an unknown group is dropped
//     (4) the POSITIVE CONTROL — a five-member set reddens the same oracle
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-IM-5 — THE VALID_GROUPS NINE-MEMBER CENSUS (UNCHANGED, NOT RE-OPENED — ruling (vii)/`K-3`): the set is exactly the NINE, printed with their terms; the sanitize filter admits every one and rejects an unknown tenth; the four landed census sites are UNMOVED (S-SSW-CENS-1)', () => {
  it('P-SSW-IM-5 — 4', async () => {
    const run = newRun()
    let i = 0
    const load = await loadStore()
    let store: Record<string, unknown> | null = null
    if (load.ok && typeof load.ns.createSecurityStore === 'function') {
      const { mkdtempSync, rmSync } = await import('node:fs')
      const { tmpdir } = await import('node:os')
      const dir = mkdtempSync(join(tmpdir(), 'ssw-census-'))
      try {
        store = load.ns.createSecurityStore({ path: join(dir, 'sec.json') }) as Record<string, unknown>
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    }

    // ---- drive 1: the set equality over the store's own bytes ----
    attempt(run, i++, nineCensusByteProblems()[0] ?? null)
    // ---- drives 2 + 3: the admission of all nine and the rejection of an unknown tenth ----
    attempt(run, i++, store === null ? `ABSTRACT-SUBJECT [P-SSW-IM-5]: the store cannot be constructed — the admission drive has no subject (§4 RE-1)` : nineMemberProblems(store, 'the admission drive')[0] ?? null)
    attempt(run, i++, store === null ? `ABSTRACT-SUBJECT [P-SSW-IM-5]: the store cannot be constructed — the rejection drive has no subject (§4 RE-1)` : rejectUnknownTenth(store))
    // ---- the POSITIVE CONTROL ----
    attempt(run, i++, fiveMemberControlProblems()[0] ?? null)

    finish('P-SSW-IM-5', run)
  }, 12_000)
})

/** §2.3's rejection limb, isolated so its limb index is its own. */
function rejectUnknownTenth(store: Record<string, unknown>): string | null {
  try {
    const post = (store.set as (p: unknown) => { enabled?: unknown }).call(store, { groups: ['unknown-tenth'] }) as { enabled?: unknown }
    const enabled = Array.isArray(post?.enabled) ? (post.enabled as string[]) : []
    return enabled.includes('unknown-tenth')
      ? `UNKNOWN-ADMITTED: \`set({groups:['unknown-tenth']})\` admitted the group — §2.3's filter rejects an unknown tenth (restoring five would instead DROP four of the nine) (§4 RE-1)`
      : null
  } catch (e) {
    return `SET-THREW: \`set({groups:['unknown-tenth']})\` threw (${(e as Error).message}) — §3.2 I-6: no declared-domain patch throws`
  }
}

// ---------------------------------------------------------------------------
// P-SSW-IM-6 — THE NO-SECOND-WRITER / NO-SECOND-REFUSAL-SITE CENSUSES (`S-SSW-CENS-2`).
//   5 drives = 5.
//     (1) `securityStore.set(` count-1   (2) `.applyGatePatch(` count-1
//     (3) the `NEG-SECOND-WRITER` offender set EMPTY over the real tree
//     (4) the zero-spelling scan over `src/main/**` + the receipt's home
//     (5) the discrimination proof — a synthetic second importer reddens the same oracle
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-IM-6 — THE NO-SECOND-WRITER / NO-SECOND-REFUSAL-SITE CENSUSES: `securityStore.set(` is EXACTLY ONE call site and `.applyGatePatch(` EXACTLY ONE, both at their landed sites; NO new `src/main/**` importer of `security-store.js` appears (the receipt\'s home is `src/shared/types.ts`); this unit spells the refused token NOWHERE and adds NO store-union member (S-SSW-CENS-2)', () => {
  it('P-SSW-IM-6 — 5', async () => {
    const run = newRun()
    let i = 0
    attempt(run, i++, setCallSiteProblems()[0] ?? null)
    attempt(run, i++, secondWriterClosureProblems()[0] ?? null)
    attempt(run, i++, refusalSiteProblems()[0] ?? null)
    attempt(run, i++, [...receiptHomeProblems(), ...storeUnionProblems(readMaybe(STORE_PATH)), ...securitySettingsWideningProblems()][0] ?? null)
    attempt(run, i++, secondWriterControlProblems()[0] ?? null)
    finish('P-SSW-IM-6', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-SM-1 — THE ATOMIC-WRITE MACHINE (CLOSED) (`S-SSW-ASM-1`; §2.4 items 1-2/4-6).
//   3 machine states × 2 terminals = 6.
//     states: IDLE · TMP-WRITTEN/FSYNCED · COMMITTED/RENAMED
//     terminals: `committed` (receipt answered, no tmp) · `refused` (previous file intact,
//     receipt answered)
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-SM-1 — THE ATOMIC-WRITE MACHINE (CLOSED) over the injected facade: `IDLE → (set performed) → TMP-WRITTEN → FSYNCED → RENAMED → COMMITTED`, with EVERY failure transitioning to `REFUSED` where the previous file stays intact; the receipt is answered ONLY at a terminal; no state is skipped, none is invented (S-SSW-ASM-1)', () => {
  it('P-SSW-SM-1 — 3 × 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const realPath = REGISTER_SUBJECT_PATH
    const PRE_WRITE = JSON.stringify({ token: 'PRE-WRITE-TOKEN', enabled: ['read', 'dispatch'] }, null, 2)
    const load = await loadStore()

    /** The three machine states, each observed through what the façade's LEDGER shows at it. */
    const states: Array<{ label: string; failAt: FacadeArm | null; observed: (steps: string[]) => string | null }> = [
      {
        label: 'IDLE',
        failAt: 'mkdirSync',
        observed: (steps) => {
          const renamed = steps.includes('rename')
          return renamed ? `STATE-IDLE: the rename leg was reached while the machine was asserted to be at IDLE (recorded ledger: [${steps.join(' → ')}]) — §5.1 declares \`IDLE → (set performed) → …\`; no state is SKIPPED` : null
        },
      },
      {
        label: 'TMP-WRITTEN/FSYNCED',
        failAt: 'renameSync',
        observed: (steps) => {
          const renamed = steps.includes('rename')
          if (!renamed) return null
          const idx = steps.indexOf('rename')
          const before = steps.slice(0, idx)
          return before.includes('writeTmp') && before.includes('fsyncTmp')
            ? null
            : `STATE-ORDER: the rename was reached with the ledger [${before.join(' → ') || 'EMPTY'}] — §2.4 items 1-2 require the tmp write AND its \`fsync\` BEFORE the rename (the rename is the state that follows FSYNCED)`
        },
      },
      {
        label: 'COMMITTED/RENAMED',
        failAt: null,
        observed: (steps) => (steps.includes('rename') && steps.includes('fsyncDir') ? null : `STATE-COMMITTED: a successful write's ledger reads [${steps.join(' → ') || 'EMPTY'}] — the COMMITTED state follows the rename AND the DIRECTORY \`fsync\` (§2.4 item 2: the directory fsync happens AFTER it)`),
      },
    ]

    for (const state of states) {
      // terminal reading 1 — `committed` (receipt answered, NO tmp) / `refused` (previous file
      // intact, receipt answered): the terminal the state's own arm implies
      await check(run, i++, () => {
        const facade = newFsFacade({ seed: { [realPath]: PRE_WRITE }, failAt: state.failAt })
        const built = buildStore(load, facade, realPath)
        if (built.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-SM-1 ${state.label}]: ${built.absent}`
        try {
          ;(built.store.set as (p: unknown) => unknown).call(built.store, { groups: ['code'] })
        } catch (e) {
          return `SET-THREW [P-SSW-SM-1 ${state.label}]: (${(e as Error).message}) — §2.4 item 6: a refusal ANSWERS its receipt and never throws`
        }
        const receiptMember = built.store.lastWriteReceipt
        if (typeof receiptMember !== 'function') {
          return `MEMBER-ABSENT [P-SSW-SM-1 ${state.label}]: \`lastWriteReceipt()\` reads \`${typeof receiptMember}\` — §2.1 S-4's NEW member is the machine's ONLY terminal observable; at this head it resolves NOWHERE, so NO state can be observed reaching a terminal (§4 RE-1)`
        }
        const receipt = (receiptMember as () => unknown).call(built.store)
        const form = receiptFormProblems(receipt, `the ${state.label} terminal`)
        if (form.length > 0) return form.join(' | ')
        const expected = state.failAt === null ? 'committed' : 'refused'
        if ((receipt as Record<string, unknown>).status !== expected) {
          return `TERMINAL: the ${state.label} drive answered \`${JSON.stringify(receipt)}\` — the machine's terminal for this arm is \`${expected}\` (§5.1 P-SSW-SM-1)`
        }
        return null
      })
      // terminal reading 2 — the terminal's OWN shape: `committed` leaves NO tmp; `refused`
      // leaves the previous file INTACT
      await check(run, i++, () => {
        const facade = newFsFacade({ seed: { [realPath]: PRE_WRITE }, failAt: state.failAt })
        const built = buildStore(load, facade, realPath)
        if (built.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-SM-1 ${state.label}]: ${built.absent}`
        try {
          ;(built.store.set as (p: unknown) => unknown).call(built.store, { groups: ['code'] })
        } catch (e) {
          return `SET-THREW [P-SSW-SM-1 ${state.label}]: (${(e as Error).message})`
        }
        const steps = facade.calls.map((c) => c.step)
        const stateProblem = state.observed(steps)
        if (stateProblem !== null) return stateProblem
        if (state.failAt === null) {
          return facade.files.has(`${realPath}.tmp`)
            ? `TERMINAL-COMMITTED: a residual \`${relative(REPO_ROOT, `${realPath}.tmp`)}\` remains after a COMMITTED write — §2.4 item 3(a)/I-2 (§4 RE-2)`
            : null
        }
        const onReal = facade.files.get(realPath)
        return onReal === PRE_WRITE
          ? null
          : `TERMINAL-REFUSED: the real path carries \`${String(onReal)}\` — every failure transitions to REFUSED where the PREVIOUS FILE STAYS INTACT (§2.4 item 6; §3.2 I-1)`
      })
    }

    finish('P-SSW-SM-1', run)
  }, 12_000)
})

/** The `P-SSW-SM-1` store builder. */
function buildStore(load: StoreLoad, facade: FsFacade, realPath: string): { store: Record<string, unknown>; absent: string | null } {
  if (!load.ok || typeof load.ns.createSecurityStore !== 'function') {
    return { store: {}, absent: `the store module/member does not resolve (${load.ok ? 'createSecurityStore not exported' : load.error}) — the machine has no subject (§4 RE-1)` }
  }
  try {
    return { store: load.ns.createSecurityStore({ path: realPath, fs: facade }) as Record<string, unknown>, absent: null }
  } catch (e) {
    return { store: {}, absent: `\`createSecurityStore({path, fs})\` threw (${(e as Error).message}) — §2.1 S-1's \`fs?\` option resolves NOWHERE at this head (§4 RE-3)` }
  }
}

// ---------------------------------------------------------------------------
// P-SSW-TP-1 — RECEIPT TOTALITY (`S-SSW-RCPT-1`; §3.2 I-4; §3.3 legs 1+3).
//   4 outcome classes × 2 assertions = 8.
//     classes: success · the tmp-write failure · the `fsync` failure · the rename failure
//     assertion 1 — the answered form on BOTH surfaces (the store + the SET response)
//     assertion 2 — on a refusal, the file's post-state equals the pre-write record AND
//                    `get()` still answers
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-TP-1 — RECEIPT TOTALITY: for EVERY write-outcome class the write answers EXACTLY ONE of the TWO CLOSED forms on BOTH delivery surfaces (the store AND the SET response), the `write` member is NEVER absent, a refusal NEVER throws and NEVER leaves a silent no-op, and the status is never a third value (S-SSW-RCPT-1)', () => {
  it('P-SSW-TP-1 — 4 × 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const realPath = REGISTER_SUBJECT_PATH
    const PRE_WRITE = JSON.stringify({ token: 'PRE-WRITE-TOKEN', enabled: ['read', 'dispatch'] }, null, 2)
    const load = await loadStore()

    const classes: Array<{ label: string; failAt: FacadeArm | null; expected: string }> = [
      { label: 'success', failAt: null, expected: RECEIPT_STATUSES[0] },
      { label: 'the tmp-write failure', failAt: 'tmpWrite', expected: RECEIPT_STATUSES[1] },
      { label: 'the fsync failure', failAt: 'fsyncSync', expected: RECEIPT_STATUSES[1] },
      { label: 'the rename failure', failAt: 'renameSync', expected: RECEIPT_STATUSES[1] },
    ]

    for (const cls of classes) {
      // assertion 1 — the answered form on the STORE surface (the SET-response surface is
      // `P-SSW-H-2`'s direct-drive leg; the byte-level pin that the return IS the additive
      // record lives there too, so the two rows do not double-count the same reading)
      await check(run, i++, () => {
        const probe = driveRefusal(load, cls.failAt ?? ('folderNeverUsed' as FacadeArm), realPath, PRE_WRITE)
        if (cls.failAt === null) {
          // the success class needs a NON-failing façade, so it is driven through its own build
          const facade = newFsFacade({ seed: { [realPath]: PRE_WRITE }, failAt: null })
          const built = buildStore(load, facade, realPath)
          if (built.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-TP-1 ${cls.label}]: ${built.absent}`
          try {
            ;(built.store.set as (p: unknown) => unknown).call(built.store, { groups: ['code'] })
          } catch (e) {
            return `SET-THREW [P-SSW-TP-1 ${cls.label}]: (${(e as Error).message})`
          }
          const member = built.store.lastWriteReceipt
          if (typeof member !== 'function') {
            return `MEMBER-ABSENT [P-SSW-TP-1 ${cls.label}]: \`lastWriteReceipt()\` reads \`${typeof member}\` — §3.2 I-4: after EVERY performed write EXACTLY ONE of the two closed forms exists on the store; at this head the member resolves NOWHERE (§4 RE-1)`
          }
          const receipt = (member as () => unknown).call(built.store)
          const form = receiptFormProblems(receipt, cls.label)
          if (form.length > 0) return form.join(' | ')
          return (receipt as Record<string, unknown>).status === cls.expected
            ? null
            : `TOTALITY (${cls.label}): the store answered \`${JSON.stringify(receipt)}\` — §3.2 I-4 requires the \`${cls.expected}\` form for this class`
        }
        if (probe.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-TP-1 ${cls.label}]: ${probe.absent}`
        if (probe.receiptAbsent !== null) return `MEMBER-ABSENT [P-SSW-TP-1 ${cls.label}]: ${probe.receiptAbsent}`
        const form = receiptFormProblems(probe.receipt, cls.label)
        if (form.length > 0) return form.join(' | ')
        return (probe.receipt as Record<string, unknown>).status === cls.expected
          ? null
          : `TOTALITY (${cls.label}): the store answered \`${JSON.stringify(probe.receipt)}\` — §3.2 I-4 requires the \`${cls.expected}\` form for this class`
      })
      // assertion 2 — on a refusal the file's post-state equals the PRE-WRITE record AND
      // `get()` still answers; on a success the real path carries the post-state
      await check(run, i++, () => {
        const facade = newFsFacade({ seed: { [realPath]: PRE_WRITE }, failAt: cls.failAt })
        const built = buildStore(load, facade, realPath)
        if (built.absent !== null) return `ABSTRACT-SUBJECT [P-SSW-TP-1 ${cls.label}]: ${built.absent}`
        let threw: string | null = null
        try {
          ;(built.store.set as (p: unknown) => unknown).call(built.store, { groups: ['code'] })
        } catch (e) {
          threw = (e as Error).message
        }
        if (threw !== null) return `REFUSAL-THREW (${cls.label}): a \`set()\` threw (${threw}) — §3.2 I-4: a refusal NEVER throws and NEVER leaves a silent no-op`
        const onReal = facade.files.get(realPath)
        const post = typeof built.store.get === 'function' ? (built.store.get as () => unknown).call(built.store) : null
        if (post === null || typeof post !== 'object') {
          return `NO-POST-STATE (${cls.label}): \`get()\` answered \`${String(post)}\` — §3.2 I-1/I-4 require the in-memory post-state to answer \`get()\` after every performed write`
        }
        if (cls.failAt !== null) {
          return onReal === PRE_WRITE
            ? null
            : `REFUSAL-FILE-STATE (${cls.label}): the real path carries \`${String(onReal)}\` — §2.4 item 6/§3.2 I-1: on a REFUSAL the file's post-state EQUALS the pre-write record`
        }
        const enabled = (post as Record<string, unknown>).enabled
        return Array.isArray(enabled) && (enabled as string[]).includes('code')
          ? null
          : `SUCCESS-POST-STATE (${cls.label}): the answered config reads \`${JSON.stringify(post)}\` — §2.4 item 4: the in-memory post-state is what \`get()\` answers`
      })
    }

    finish('P-SSW-TP-1', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-TP-2 — `set()`/`sanitize` TOTALITY OVER THE PATCH CLASSES (`S-SSW-SAN-1`; §2.1;
// §3.2 I-6). The EIGHT CLOSED patch classes; each asserting the exact post-state + the
// receipt's existence + the no-throw property.
//   §4 RE-4 — the post-state limbs are GREEN-ON-ARRIVAL; the receipt limb is the
//   landing-driven red. Recorded honestly: ONE landing-driven red per class is counted
//   (the receipt limb), never two.
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-TP-2 — `set()`/`sanitize` TOTALITY OVER THE EIGHT CLOSED PATCH CLASSES (THE LANDED SEMANTICS PRESERVED): for EVERY patch class the post-state is EXACTLY what the landed `sanitize`/`set` rules declare, a receipt exists after every write, and NO patch class throws (S-SSW-SAN-1)', () => {
  it('P-SSW-TP-2 — 8', async () => {
    const run = newRun()
    let i = 0
    const load = await loadStore()
    const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')

    /** The receipt-existence limb is FOLDED into the first patch class rather than repeated
     *  eight times: it is ONE landing-driven red (§4 RE-4) and counting it eight times would
     *  inflate the term beyond what the row's property declares. The other seven classes
     *  assert their post-state + the no-throw property, each of which is GREEN-ON-ARRIVAL. */
    for (const cls of PATCH_CLASSES) {
      await check(run, i++, () => {
        if (!load.ok || typeof load.ns.createSecurityStore !== 'function') {
          return `ABSTRACT-SUBJECT [P-SSW-TP-2 ${cls.id}]: the store module/member does not resolve (${load.ok ? 'createSecurityStore not exported' : load.error}) — the patch class has no subject (§4 RE-1)`
        }
        const dir = mkdtempSync(join(tmpdir(), 'ssw-patch-'))
        try {
          const file = join(dir, 'sec.json')
          if (cls.seed !== undefined) writeFileSync(file, JSON.stringify(cls.seed), 'utf8')
          const store = load.ns.createSecurityStore({ path: file }) as Record<string, unknown>
          if (typeof store.set !== 'function' || typeof store.get !== 'function') {
            return `STORE-SURFACE [P-SSW-TP-2 ${cls.id}]: the store's \`set\`/\`get\` members are not both callable — §2.1 S-2/S-3 declare them (§4 RE-1)`
          }
          let post: Record<string, unknown>
          try {
            post = (store.set as (p: unknown) => Record<string, unknown>).call(store, cls.patch)
          } catch (e) {
            return `SET-THREW [P-SSW-TP-2 ${cls.id}]: (${(e as Error).message}) — §3.2 I-6: NO patch class in the declared domain throws`
          }
          const stateProblem = cls.expect(post)
          if (stateProblem !== null) return `[P-SSW-TP-2 ${cls.id}] ${stateProblem}`
          // THE RECEIPT-EXISTENCE LIMB — the landing-driven half (§4 RE-4).
          const member = store.lastWriteReceipt
          if (typeof member !== 'function') {
            return `RECEIPT-ABSENT [P-SSW-TP-2 ${cls.id}]: \`lastWriteReceipt()\` reads \`${typeof member}\` after a \`set()\` — §2.1 S-4/§3.2 I-4: after EVERY performed write EXACTLY ONE of the two closed forms exists on the store (§4 RE-4: the post-state limbs are GREEN-ON-ARRIVAL at this head; THIS limb is the row's ONE landing-driven red)`
          }
          const receipt = (member as () => unknown).call(store)
          const form = receiptFormProblems(receipt, cls.id)
          return form.length > 0 ? form.join(' | ') : null
        } finally {
          rmSync(dir, { recursive: true, force: true })
        }
      })
    }

    finish('P-SSW-TP-2', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-H-1 — THE RECEIPT'S HOME + THE TWO PRELOAD DECLARATIONS (BYTE-SCAN)
// (`S-SSW-PRE-1`; §2.2; §2.5). 3 pins + 1 control = 4.
// `⟶ RULING A-3A-2` ① — PIN 1 now names the RULED home (`src/main/security-store.ts`,
// per `A-3A-1` ①) and PIN 2 IS RE-AIMED: the as-filed `RECEIPT-HOME-COLLISION` limb
// is WITHDRAWN AS ANTI-QUATED and replaced by the DUPLICATE-HOME discrimination
// (EXACTLY ONE of the two files declares the identifier). THE TERM IS UNMOVED: 3 pins
// + 1 control = 4; the register's arithmetic stays `78`.
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-H-1 — THE RECEIPT\'S HOME + THE TWO PRELOAD DECLARATIONS (BYTE-SCAN): `SecurityWriteReceipt` is declared in `src/main/security-store.ts` (THE RULED HOME, `A-3A-1` ① — SELF-CONTAINED, EXPORTED, NO import; `src/shared/types.ts` IS NOT MOVED by this unit) and in EXACTLY ONE of the two files; BOTH `security.set` declaration sites in `src/main/preload.ts` carry the widened return; no third site exists (S-SSW-PRE-1)', () => {
  it('P-SSW-H-1 — 3 + 1 = 4', async () => {
    const run = newRun()
    let i = 0
    const home = receiptHomeProblems()
    // `⟶ RULING A-3A-2 ①` — pin 1 reads the RULED home; pin 2 is the RE-AIMED
    // DUPLICATE-HOME limb (the as-filed `RECEIPT-HOME-COLLISION` is WITHDRAWN, see the header).
    const homePin = home.filter((p) => p.startsWith('RECEIPT-HOME:') || p.startsWith('RECEIPT-HOME-DUPLICATE') || p.startsWith('RECEIPT-FORM'))
    const duplicatePin = home.filter((p) => p.startsWith('RECEIPT-HOME-DUPLICATE'))
    const decls = preloadDeclarationProblems()

    attempt(run, i++, homePin[0] ?? null)
    attempt(run, i++, duplicatePin[0] ?? null)
    attempt(run, i++, decls[0] ?? null)
    // ---- the POSITIVE CONTROL: a DUPLICATE home reddens the same oracle ----
    // `⟶ RULING A-3A-2 ①` — the control is RE-AIMED WITH ITS PIN: the forged corpus that must
    // trip the oracle is now the DUPLICATE-DECLARATION corpus (the ruled home PLUS a leftover
    // shared declaration), not the old "a type in a `src/main/**` module" corpus that the
    // ruling now REQUIRES. The discrimination is preserved: the SAME regex the oracle uses is
    // driven over the forged pair, and the ruling's own mandated layout must NOT trip it.
    attempt(run, i++, (() => {
      const DECLARATION = /export\s+(?:type|interface)\s+SecurityWriteReceipt\s*=/
      const ruledOnly = [
        `export type SecurityWriteReceipt = { status: 'committed' } | { status: 'refused'; reason: '${WRITE_FAILED_TOKEN}' }\n`, // the RULED home
        'export interface SecuritySettings { token: string | null }\n', // `src/shared/types.ts` LEFT IN PLACE (NOT MOVED)
      ]
      const duplicated = [
        `export type SecurityWriteReceipt = { status: 'committed' } | { status: 'refused'; reason: '${WRITE_FAILED_TOKEN}' }\n`,
        `export type SecurityWriteReceipt = { status: 'committed' } | { status: 'refused'; reason: '${WRITE_FAILED_TOKEN}' }\n`, // a LEFTOVER shared declaration
      ]
      const count = (corpus: string[]): number => corpus.filter((f) => DECLARATION.test(f)).length
      if (count(ruledOnly) !== 1) {
        return `CONTROL-VACUOUS (P-SSW-H-1 control 4): the forged RULED-HOME corpus counts ${count(ruledOnly)} declaration home(s), not EXACTLY ONE — the ruling's own mandated layout must NOT redden the duplicate-home limb (\`A-3A-2\` ①)`
      }
      if (count(duplicated) < 2) {
        return `CONTROL-VACUOUS (P-SSW-H-1 control 4): the forged DUPLICATE-HOME corpus counts ${count(duplicated)} declaration home(s) — a type declared in BOTH \`${relative(REPO_ROOT, STORE_PATH)}\` and \`${relative(REPO_ROOT, TYPES_PATH)}\` must redden the SAME oracle (\`A-3A-2\` ①; §1.1 member 2's as-filed home is superseded, the file is NOT MOVED)`
      }
      return null
    })())

    finish('P-SSW-H-1', run)
  }, 12_000)
})

/** `P-SSW-H-2`'s DRIVEN leg (the `G-5` re-aim). The bundle reader: `esbuild` compiles
 *  `src/main/main.ts` to `dist/main/main.cjs`, where the local `securityStore` binding is
 *  INLINED but the handler's BODY is preserved verbatim — so evaluating that body with the
 *  handler's own closures as PARAMETERS drives the REAL registration code, not a paraphrase of
 *  it. Returns the body text (the `{ … }` block) or `null` when it is not readable. */
function bundledHandlerBody(): string | null {
  // `require` is available to this test module under vitest's CJS interop; the bundle is read
  // as TEXT and eval'd by `driveHandler` below — never imported (it would boot the whole app).
  const candidates = [
    join(REPO_ROOT, 'dist', 'main', 'main.cjs'),
    join(REPO_ROOT, 'dist', 'main', 'main.js'),
    join(REPO_ROOT, 'dist', 'main.cjs'),
  ]
  const bundlePath = candidates.find((p) => existsSync(p))
  if (bundlePath === undefined) return null
  let text: string
  try {
    text = readFileSync(bundlePath, 'utf8')
  } catch {
    return null
  }
  const at = text.indexOf('ipcMain.handle(IPC_SECURITY_SET,')
  if (at < 0) return null
  const open = text.indexOf('{', at)
  if (open < 0) return null
  // the handler body closes at the matching brace of the arrow function
  const end = balancedBody(text, open)
  return end === null ? null : `{${end}}`
}

/** Drive a REAL handler body with injected closures. `body` is the bundled handler's `{ … }`
 *  text; the four free identifiers the registered handler closes over (`securityStore`,
 *  `gatePatchFromStoreResult`, `mcp`, `currentEnabled`) are supplied as parameters, so the
 *  drive observes the ACTUAL return expression the landing ships. `null` when the drive could
 *  not be built (the substrate is absent or unreadable) — named by the caller, never silent. */
function driveHandler(
  body: string,
  bindings: {
    securityStore: { set: (p: unknown) => unknown; lastWriteReceipt: () => unknown }
    mcp: { applyGatePatch: (p: unknown) => void }
    currentEnabled: string[]
  },
): ((patch: unknown) => Record<string, unknown>) | null {
  try {
    const factory = new Function(
      'securityStore',
      'gatePatchFromStoreResult',
      'mcp',
      'currentEnabled',
      `return (patch) => ${body}`,
    )
    const gatePatchFromStoreResult = (
      previousEnabled: string[],
      updated: { token?: string | null; enabled: string[] },
    ): { token?: string | null; groups: string[]; disable: string[] } => {
      const after = updated.enabled
      return {
        token: typeof updated.token === 'string' && updated.token !== '' ? updated.token : undefined,
        groups: after.filter((g) => !previousEnabled.includes(g)),
        disable: previousEnabled.filter((g) => !after.includes(g)),
      }
    }
    return factory(bindings.securityStore, gatePatchFromStoreResult, bindings.mcp, bindings.currentEnabled) as (
      patch: unknown,
    ) => Record<string, unknown>
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// P-SSW-H-2 — THE `IPC_SECURITY_SET` RESPONSE LEG, DRIVEN DIRECTLY (the THIRD observability
// leg) (`S-SSW-IPC-1`; §3.3 leg 3; §2.4 item 4). 2 outcome classes × 2 readings + 1
// renderer-discard reading = 5.
//
// `⟶ RE-AIM ⑥ (THE GATE-4 `G-5` REMAND).` THE TERM IS UNMOVED at `2 × 2 + 1 = 5` (printed
// honestly below), and so are the total `78` and the seed `0x20260927`. What moved is what the
// two outcome-class readings MEAN. AS-FILED they were THE SAME BYTE-READ TWICE: the loop read
// `problems[0]` and the `site.call` regex for both labels, no store was constructed and no
// write was driven — so "the receipt is readable on BOTH outcome classes" was asserted once, at
// the byte level, while `P-SSW-TP-1` explicitly disclaims that surface. A hard-coded
// `{ ...updated, write: { status: 'committed' } }` in the handler — which never consults the
// store — would have passed it.
//
// THE OPERATIVE LEG: each outcome class is driven through the REAL registered handler body
// (read from the esbuild bundle of `src/main/main.ts`, the handler's own closures injected as
// parameters) over a store whose `lastWriteReceipt()` answers THAT class's closed form. The
// reading is the RESPONSE RECORD's `write` member, so the two classes are distinguished by what
// the STORE answers rather than by a label. FALSIFIER: a handler body that hard-codes the
// receipt (or that resolves the store's answer once) REDDENS one of the two classes.
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-H-2 — THE `IPC_SECURITY_SET` RESPONSE LEG, DRIVEN DIRECTLY at its real site in `src/main/main.ts` (the THIRD observability leg, §3.3 leg 3): the handler\'s return carries `{ ...updated, write: lastWriteReceipt() }`; the receipt is readable on the response record for BOTH outcome classes; the leg is driven at the handler\'s SUBSTRATE, NEVER through a renderer call site (S-SSW-IPC-1)', () => {
  it('P-SSW-H-2 — 2 × 2 + 1 = 5', async () => {
    const run = newRun()
    let i = 0
    const site = securitySetHandlerSite()
    const problems = setResponseProblems()
    const body = bundledHandlerBody()

    /** The two outcome classes, each carried by the RECEIPT ITSELF (never by a label): the
     *  store the drive injects answers this exact closed form, and the limb reads whether the
     *  RESPONSE RECORD surfaces it. */
    const classes: Array<{ label: string; receipt: unknown; expected: string }> = [
      { label: 'the committed outcome class', receipt: { status: RECEIPT_STATUSES[0] }, expected: RECEIPT_STATUSES[0] },
      { label: 'the refused outcome class', receipt: { status: RECEIPT_STATUSES[1], reason: RECEIPT_REASONS[0] }, expected: RECEIPT_STATUSES[1] },
    ]

    for (const cls of classes) {
      // reading 1 — the SURFACE PIN (the handler's return IS the additive record)
      attempt(run, i++, problems[0] ?? null)
      // reading 2 — the DRIVEN leg: the response record's `write` member follows the STORE
      await check(run, i++, () => {
        if (site.call === null) {
          return `ABSTRACT-SUBJECT [P-SSW-H-2 ${cls.label}]: no \`ipcMain.handle(IPC_SECURITY_SET\` registration is readable in ${relative(REPO_ROOT, MAIN_PATH)} — the leg has no substrate (§3.3 leg 3)`
        }
        if (body === null) {
          return `ABSTRACT-SUBJECT [P-SSW-H-2 ${cls.label}]: the handler BODY could not be driven — no readable esbuild bundle of ${relative(REPO_ROOT, MAIN_PATH)} carrying \`ipcMain.handle(IPC_SECURITY_SET,\` (run \`npm run build\`); the byte-level pin above is then the ONLY reading, which is exactly the "the two classes are the same byte-read twice" vacuity the G-5 remand names`
        }
        const driven = driveHandler(body, {
          securityStore: {
            set: () => ({ token: null, enabled: ['read', 'dispatch', 'code'], maxJournalLength: undefined }),
            lastWriteReceipt: () => cls.receipt,
          },
          mcp: { applyGatePatch: () => {} },
          currentEnabled: ['read', 'dispatch'],
        })
        if (driven === null) {
          return `ABSTRACT-SUBJECT [P-SSW-H-2 ${cls.label}]: the handler body could not be evaluated with the handler's own closures — the drive has no subject (§3.3 leg 3)`
        }
        let response: Record<string, unknown>
        try {
          response = driven({ groups: ['code'] })
        } catch (e) {
          return `HANDLER-THREW [P-SSW-H-2 ${cls.label}]: driving the real handler body threw (${(e as Error).message}) — §2.4 item 4: the SET response is answered for BOTH outcome classes`
        }
        if (!('write' in response)) {
          return `SET-RESPONSE-LEG (${cls.label}): the driven response record carries NO \`write\` member (\`${JSON.stringify(response)}\`) — §3.2 I-4: the \`write\` member is NEVER absent on a SET response`
        }
        const form = receiptFormProblems(response.write, `the ${cls.label} response`)
        if (form.length > 0) return form.join(' | ')
        const status = (response.write as Record<string, unknown>).status
        if (status !== cls.expected) {
          return `SET-RESPONSE-LEG (${cls.label}): the store's \`lastWriteReceipt()\` answered \`${JSON.stringify(cls.receipt)}\` but the response record carries \`${JSON.stringify(response.write)}\` — §2.4 item 4/the THIRD observability leg require the response to surface the STORE's OWN answer (a hard-coded \`write\` that never consults the store is the counterexample this reading exists to catch)`
        }
        // and the response is STILL the additive record (`{ ...updated, write }`), not the bare
        // receipt: the post-state members must ride along.
        if (!('enabled' in response)) {
          return `SET-RESPONSE (${cls.label}): the driven response record carries no post-state \`enabled\` member — §2.4 item 4's record is \`{ ...updated, write: lastWriteReceipt() }\`, never a bare receipt`
        }
        return null
      })
    }

    // ---- the RENDERER-DISCARD negative: a renderer-driven row is UNABLE to observe the receipt ----
    attempt(run, i++, rendererDiscardProblems()[0] ?? null)

    finish('P-SSW-H-2', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-H-3 — THE md5 RE-STATEMENT (`O-2`) (`S-SSW-MD5-1`; §1.1 member 5; `S-P-3`).
//   3 pins + 1 control = 4. §4's PRE-RECORDED AMENDMENT-ROW-1 EXEMPTION applies: this row is
//   EXPECTED RED from the preload's widening until the re-statement lands IN THE SAME COMMIT.
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-H-3 — THE md5 RE-STATEMENT (`O-2`): the `src/main/preload.ts` row of `tests/pd-ui-1-theme-register.test.ts`\'s `UNTOUCHED_DIGESTS` carries the md5 MEASURED at the landing head, `restated: \'U-STORE-SECURITY-ADOPT\'`, the reason + unit named, AND the superseded value `f24ea717a5f8f93a3ac490334611d22a` still VISIBLE; `UNRESTATED_CONTROL_PATH` stays DERIVED and NON-VACUOUS (S-SSW-MD5-1)', () => {
  it('P-SSW-H-3 — 3 + 1 = 4', async () => {
    const run = newRun()
    let i = 0
    const problems = md5RowProblems()
    const restatedPin = problems.filter((p) => p.startsWith('MD5-RESTATEMENT'))
    const supersededPin = problems.filter((p) => p.startsWith('MD5-SUPERSEDED-VISIBLE'))
    const measuredPin = problems.filter((p) => p.startsWith('MD5-MEASURED') || p.startsWith('MD5-ROW-ABSENT'))

    attempt(run, i++, restatedPin[0] ?? null)
    attempt(run, i++, supersededPin[0] ?? null)
    attempt(run, i++, measuredPin[0] ?? null)
    // ---- the POSITIVE CONTROL: the DERIVED path still resolves non-empty and un-re-stated ----
    attempt(run, i++, unrestatedControlProblems()[0] ?? null)

    finish('P-SSW-H-3', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SSW-H-4 — THE NO-DURABILITY / LAYER HONESTY ROW (the ANTI-OVERCLAIM row)
// (`S-SSW-HON-1`; §6's honesty block; `RCA-12`). 2 instrument classes × 2 readings = 4.
//
// `⟶ RE-AIM ⑤ (THE GATE-4 `G-1` REMAND).` THE TERM IS UNMOVED at `2 × 2 = 4`; what moved is
// what the readings MEAN. AS-FILED, reading 1 was `durabilityClaimProblems()` over the four
// SCREAMING-CASE literals — VACUOUS (see the oracle's block). The re-aim makes the SAME two
// readings FALSIFIABLE:
//   instrument class 1 (the call-order recorder):
//     reading 1 — NO artifact of this unit asserts durability in a CLAIM position, read by the
//                 PROSE predicate (case-insensitive) over FIVE artifacts, with the spec's own
//                 NEGATED forms allow-listed;
//     reading 2 — the FAÇADE IS DECLARED SHAPE-ONLY in this file (unchanged);
//   instrument class 2 (the byte-scan surface pins):
//     reading 1 — this file asserts no app/envelope/live/store-green (unchanged);
//     reading 2 — the FALSIFIABILITY CONTROL: the SAME production predicate REDDENS on the
//                 remand's named forged claim line (*"the write is now crash-safe and durable
//                 on disk"*) AND on the as-filed SCREAMING-CASE form, while ADMITTING the
//                 NEGATED forms the real artifacts carry — and the AS-FILED predicate (the
//                 four literals only) is MEASURED against the same forged prose line so the
//                 vacuity is a printed reading rather than an argument.
// ---------------------------------------------------------------------------
describe('SSW §5.1 P-SSW-H-4 — THE NO-DURABILITY / LAYER HONESTY ROW (the anti-overclaim row): no artifact of this unit claims durability, real-`fsync` completion or bytes-on-disk-after-a-crash; every atomic claim is a CALL ORDER/COUNT over the injected facade; the `[H]` rows are reported `RED-BY-SHIM`/byte-scan and NEVER as app-green, envelope-green or live-green (S-SSW-HON-1)', () => {
  it('P-SSW-H-4 — 2 × 2 = 4', async () => {
    const run = newRun()
    let i = 0
    const claimProblems = durabilityClaimProblems()
    const layerProblems = layerHonestyProblems()

    // instrument class 1 — the call-order recorder: reading 1 (NO artifact asserts durability
    // vocabulary in a claim position — the PROSE predicate, with the spec's negations
    // allow-listed) and reading 2 (the façade is DECLARED shape-only).
    attempt(run, i++, claimProblems[0] ?? null)
    attempt(
      run,
      i++,
      (() => {
        const facadeDeclared = /SHAPE ONLY/.test(readMaybe(SELF_PATH) ?? '')
        return facadeDeclared
          ? null
          : `INSTRUMENT-DECLARATION: the call-order recorder is not declared SHAPE-ONLY in this file — §6's honesty block requires every atomic claim to be a CALL ORDER/COUNT over the injected façade, never a durability reading`
      })(),
    )
    // instrument class 2 — the byte-scan surface pins: reading 1 (this file asserts no
    // app/envelope/live/store-green) and reading 2 (the FALSIFIABILITY CONTROL).
    attempt(run, i++, layerProblems[0] ?? null)
    attempt(
      run,
      i++,
      (() => {
        // ---- reading 2, RE-AIMED: the predicate must REDDEN on the real over-claim class ----
        //
        // THE FORGED-CLAIM-CORPUS: exactly the sentences the remand names. `REDDEN` cases are
        // ordinary-English (and literal) durability ASSERTIONS; the NEGATED-FORM-CORPUS cases
        // are the NEGATED forms the spec itself uses, which must stay lawful or the row would
        // redden on a correct landing (an oracle that cannot pass is as useless as one that
        // cannot fail). BOTH corpora are DATA the instrument drives — never this unit's claim.
        const REDDEN: Array<[string, string]> = [ // FORGED-CLAIM-CORPUS
          ['the remand\'s named prose over-claim', 'the write is now crash-safe and durable on disk'],
          ['a prose claim with a capitalised token', 'DONE: the receipt makes the write DURABLE on disk'],
          ['the as-filed SCREAMING-CASE literal', `FSYNC-COMPLETED-ON-DISK: the fsync completed on disk`],
          ['a power-loss claim', 'the record survives a power loss once the rename lands'],
          ['a torn-file claim', 'the write is torn-file-free and the bytes on disk are final'],
        ]
        const ADMIT: Array<[string, string]> = [ // NEGATED-FORM-CORPUS
          ['the spec\'s own honesty clause', 'NO DURABILITY CLAIM FROM A CALL-COUNT (the `fsync` legs are SHAPE-asserted)'],
          ['the spec\'s stated limit', 'durability is asserted NOWHERE in node evidence'],
          ['the shape-only declaration', 'these legs are CALL ORDER/COUNT only — SHAPE ONLY'],
          ['a never-claims clause', 'the instrument never claims a completed crash-safe persist'],
          ['a does-not-prove clause', 'what this does NOT prove: durability; crash recovery; the assembled app'],
        ]
        for (const [label, line] of REDDEN) {
          if (durabilityClaimLine(line, 'subject') === null) {
            return `CONTROL-VACUOUS (P-SSW-H-4 reading 2): the anti-overclaim predicate ADMITTED ${label} — \`${line}\`. The AS-FILED row demanded only the four SCREAMING-CASE literals, so this line could never have reddened it (the vacuity the GATE-4 \`G-1\` remand names); the OPERATIVE predicate must REJECT it (§6's honesty block)`
          }
        }
        for (const [label, line] of ADMIT) {
          if (durabilityClaimLine(line, 'subject') !== null) {
            return `CONTROL-VACUOUS (P-SSW-H-4 reading 2): the anti-overclaim predicate REDDENED on ${label} — \`${line}\`. A NEGATED/limit form the spec itself carries must stay ADMISSIBLE, or the row reddens on a correct landing (§6; the allow-list exists for exactly these)`
          }
        }
        // ---- THE VACUITY, MEASURED: the AS-FILED predicate over the SAME forged prose line ----
        const asFiled = (line: string): boolean => AS_FILED_DURABILITY_LITERALS.some((t) => line.includes(t))
        const forgedProse = REDDEN[0]![1]
        if (asFiled(forgedProse)) {
          return `CONTROL-VACUOUS (P-SSW-H-4 reading 2): the AS-FILED predicate CAUGHT \`${forgedProse}\` — the re-aim's premise (that the four SCREAMING-CASE literals cannot see an ordinary-English claim) does not hold at this head, so this reading's discrimination must be restated`
        }
        if (!asFiled(REDDEN[2]![1])) {
          return `CONTROL-VACUOUS (P-SSW-H-4 reading 2): the AS-FILED predicate MISSED its OWN literal form \`${REDDEN[2]![1]}\` — the second limb's baseline is broken`
        }
        return null
      })(),
    )

    finish('P-SSW-H-4', run)
  }, 12_000)
})

// ===========================================================================
// §5.2 — THE REGISTER REPORT: declared vs executed, `held`/`broken`, the class census, the
// total SUM printed WITH ITS TERMS (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`), and the
// §4 red-id census. **EVERY row is reported; an un-run row is a FAILURE, never a pass.**
// ===========================================================================
describe('SSW §5.2 — THE REGISTER REPORT: THIRTEEN rows, the class census per row, the total printed as the SUM OF ITS TERMS, and the §4 red-id census (RE-1..RE-5)', () => {
  it('the register report — 13 rows · seed 0x20260927 · caps ≤100/row · ≤400 total · the terms printed as sums', () => {
    // eslint-disable-next-line no-console
    console.log(
      '\nSSW REGISTER REPORT (the RED RUN at the pre-edit head)\n' +
        REPORTS.map(
          (r) =>
            `  ${r.row} ${r.strategyId}: ${r.held ? 'held' : 'BROKEN'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
            `stoppedAt ${String(r.stoppedAt)} · ${r.layer} · ${r.redClass} (${r.redId})`,
        ).join('\n') +
        '\nEND SSW REGISTER REPORT',
    )

    // (a) EVERY declared row RAN and REPORTED — an un-run row is a FAILURE, never a pass
    expect(REPORTS.length, 'every DECLARED register row must report (an un-run row is a FAILURE, never a pass — §5)').toBe(DECLARED_REGISTER.length)
    expect(DECLARED_REGISTER.length, '§5.1 declares THIRTEEN rows: P-SSW-IM-1..6 · P-SSW-SM-1 · P-SSW-TP-1..2 · P-SSW-H-1..4').toBe(13)
    const reportedIds = REPORTS.map((r) => r.row).sort()
    expect(reportedIds, 'the reported row-id set equals the declared set — no row is dropped and none is invented').toEqual([...DECLARED_REGISTER.map((r) => r.row)].sort())

    // (b) THE ARITHMETIC — each row's EXECUTED term is its DECLARED term, OR the row was
    //     ABANDONED under §5's `STOP AFTER 5 CONSECUTIVE FAILURES` rule (in which case the
    //     shortfall is REPORTED through `stoppedAt` — the abandonment is never hidden, and an
    //     un-run attempt is a FAILURE, never a pass, which is why such a row's verdict is
    //     BROKEN). A row that neither executed its term NOR recorded a stop is silently
    //     re-scoped and reddens HERE.
    const rows = REPORTS.map((r) => ({ row: r.row, declared: r.declaredTotal, executed: r.executed, stoppedAt: r.stoppedAt }))
    for (const r of rows) {
      if (r.stoppedAt === null) {
        expect(r.executed, `${r.row}: executed ${r.executed} vs declared ${r.declared} with NO recorded stop — a row that does not execute its DECLARED term is silently re-scoped (§5)`).toBe(r.declared)
      } else {
        expect(r.executed, `${r.row}: the row STOPPED at limb ${r.stoppedAt} after ${r.executed} of ${r.declared} declared attempt(s) — §5's STOP-AFTER-5 rule abandons the remainder, and an UN-RUN attempt is reported as a FAILURE (the row's verdict is BROKEN), never a pass`).toBeLessThanOrEqual(r.declared)
      }
      expect(r.declared, `${r.row}: the DECLARED term must be ≤ the per-row cap ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    const total = REPORTS.reduce((a, r) => a + r.executed, 0)
    const declaredTotal = REPORTS.reduce((a, r) => a + r.declaredTotal, 0)
    const terms = REPORTS.map((r) => r.declaredTotal)
    const tRows = REPORTS.filter((r) => r.layer === '[T]')
    const hRows = REPORTS.filter((r) => r.layer === '[H]')
    const tSum = tRows.reduce((a, r) => a + r.declaredTotal, 0)
    const hSum = hRows.reduce((a, r) => a + r.declaredTotal, 0)
    const stopped = REPORTS.filter((r) => r.stoppedAt !== null)
    // eslint-disable-next-line no-console
    console.log(
      `SSW REGISTER TOTALS (printed WITH their terms, §5.2 \`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS\`):\n` +
        `  [T] rows (9): ${tRows.map((r) => r.declaredTotal).join(' + ')} = ${tSum}   (\`P-SSW-IM-1..6\` · \`P-SSW-SM-1\` · \`P-SSW-TP-1..2\`)\n` +
        `  [H] rows (4): ${hRows.map((r) => r.declaredTotal).join(' + ')} = ${hSum}   (\`P-SSW-H-1..4\`)\n` +
        `  ALL 13 DECLARED: ${terms.join(' + ')} = ${declaredTotal}\n` +
        `  EXECUTED at this head: ${REPORTS.map((r) => r.executed).join(' + ')} = ${total}` +
        (stopped.length > 0
          ? `   (the row(s) ${stopped.map((r) => r.row).join(', ')} were ABANDONED under §5's STOP-AFTER-5 rule — the un-run attempts are FAILURES, never passes)`
          : '') +
        `\n  largest row ${Math.max(...terms)} ≤ ${CAPS.perRow} (headroom ${CAPS.perRow - Math.max(...terms)}) · declared total ${declaredTotal} ≤ ${CAPS.total} (headroom ${CAPS.total - declaredTotal})\n` +
        `  the total is an OUTCOME — never the foundation's \`50\`, never a fixed anchor (§5); the foundation's shape source reads \`8\` rows / \`50 = 6 + 4 + 4 + 8 + 6 + 8 + 8 + 6\` and is NOT copied`,
    )
    expect(declaredTotal, `the DECLARED total is the SUM OF THE ROWS' OWN PRINTED TERMS: ${terms.join(' + ')} = ${declaredTotal} (= [T] ${tSum} + [H] ${hSum})`).toBe(tSum + hSum)
    expect(declaredTotal, `the declared total must respect the cap ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
    expect(total, `the EXECUTED total must never exceed the DECLARED one (${total} ≤ ${declaredTotal})`).toBeLessThanOrEqual(declaredTotal)
    expect(Math.max(...terms), `the largest row term must respect the per-row cap ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)

    // (c) THE CLASS CENSUS — reported per row, never conflated
    const byClass = (c: RedClass): string[] => REPORTS.filter((r) => r.redClass === c).map((r) => r.row)
    // eslint-disable-next-line no-console
    console.log(
      `SSW RED-CLASS CENSUS at this head:\n` +
        `  RED-BY-ABSENCE   (${byClass('RED-BY-ABSENCE').length}): ${byClass('RED-BY-ABSENCE').join(', ')}\n` +
        `  RED-BY-SHIM      (${byClass('RED-BY-SHIM').length}): ${byClass('RED-BY-SHIM').join(', ')}\n` +
        `  GREEN-ON-ARRIVAL (${byClass('GREEN-ON-ARRIVAL').length}): ${byClass('GREEN-ON-ARRIVAL').join(', ')}\n` +
        `  GREEN            (${byClass('GREEN').length}): ${byClass('GREEN').join(', ') || '—'}`,
    )
    expect(byClass('GREEN-ON-ARRIVAL').length, 'the GREEN-ON-ARRIVAL rows are EXPLICITLY MARKED (P-SSW-IM-5 · P-SSW-H-4) — a negative/denial row already true at this head, never counted as a landing-driven red (§4)').toBeGreaterThanOrEqual(2)
    expect(byClass('RED-BY-ABSENCE').length + byClass('RED-BY-SHIM').length, 'every row that is NOT GREEN-ON-ARRIVAL carries a named red class (§4)').toBeGreaterThan(0)

    // (d) THE RED-ID CENSUS — every §4 red limb (RE-1..RE-5) is answered by at least one row
    const redIds = new Set(REPORTS.filter((r) => r.redId !== '—').map((r) => r.redId))
    for (const id of ['RE-1', 'RE-2', 'RE-3', 'RE-4', 'RE-5']) {
      expect([...redIds], `§4's ${id} must be answered by at least one register row — a red limb no row drives is a red DROPPED (§7 gate 1)`).toContain(id)
    }

    // (e) THE SEED is the DECLARED literal (never `Date.now()`, never an environment read) and
    //     the LCG is driven once here so the machinery is exercised rather than asserted.
    expect(REGISTER_SEED, '§5 fixes the seed at the literal `0x20260927`').toBe(0x20260927)
    const drawA = lcgDraw(REGISTER_SEED, NINE_GROUPS.length)
    const drawB = lcgDraw(drawA.state, NINE_GROUPS.length)
    expect(drawA.state, 'the LCG advances by exactly ONE STEP per draw').not.toBe(REGISTER_SEED)
    expect(drawB.state, 'the LCG advances by exactly ONE STEP per draw').not.toBe(drawA.state)
    expect(drawA.index, 'a draw indexes the pool by the new state mod its length').toBe(drawA.state % NINE_GROUPS.length)
  }, 12_000)
})
