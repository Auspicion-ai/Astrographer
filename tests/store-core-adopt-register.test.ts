// tests/store-core-adopt-register.test.ts — UNIT `U-STORE-CORE-ADOPT` (unit 1 of the
// store-adoption program, F2) — THE UNIT'S OWN FORK-AUTHORED TYPED PROPERTY REGISTER,
// §5 of `docs/specs/unit-store-core-adopt.md`: rows `P-STORE-CORE-1..11` `[T]` +
// `P-STORE-CORE-H` `[H]`.
//
// SOURCE OF EVERY ASSERTION (spec ONLY — the FOUNDATION's register is the SHAPE source
// alone; its ids/seeds/terms are THAT project's, never copied here):
//   docs/specs/unit-store-core-adopt.md
//     §2.1   the symbol sites the register drives: `createGraphStore` (+ the error twin
//            `createGraphStoreError`), `GraphTierToken` ('temp'|'mem'|'file'|'secure'),
//            `GraphNodeFlag` ('temp'|'mem'|'file'), `GraphEvent` (the byte-true envelope
//            + the EIGHT-cause union), `GraphCrossing`, `GraphStore` (resolve · set ·
//            commit · remove · clear · sweep · sever · subscribe · hydrate · tiers ·
//            register · constraints), `hydrateRows`/`hydrate`, `crossingPut` (early-
//            returns on a null seam), `loadDeclarations` (the six closed construction-
//            time refusal arms; the four DRIVEN throw paths), `rootIsKnown` (the C-TOP
//            gate; the write-side 'undeclared-name' refusal), `rootCapReached`
//            ('cap-exceeded', non-destructive)
//     §2.2   the seam (node-realm lazy; TOTAL; clean with `crossing: null`) + the closed
//            declared-roots set `FILE_TIER_TOP_NAMES_FORK = [{ name: 'settings' }]`
//     §5     the rows P-STORE-CORE-1..11 + P-STORE-CORE-H with their falsifiers; the
//            register machinery: seed `REGISTER_SEED = 0x20261004`, caps ≤100/row ·
//            ≤400 in total, rows SEQUENTIAL in register order, STOP AFTER 5 CONSECUTIVE
//            FAILURES, each row reporting `held`/`broken` with its strategy id, each row
//            carrying a control whose expected outcome is the OPPOSITE of the row's
//            verdict, terms printed as the SUM of their own factors
//            (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`); the count is an OUTCOME,
//            never the foundation's `249`; an un-run row reports a FAILURE, never a pass
//     §4 R-2/R-3  THE RED SET: every row RED at the unit's own head — the register
//            drives the pair through `../src/renderer/store-core-graph.js`, which is
//            ABSENT at this head → the import throws → every row reports the
//            module-does-not-exist class by name per row; the [H] row's seam
//            (`getWiredGraphStore`) and byte-scan pin resolve nowhere.
//
// LAYER (RCA-12): `[T]`/`[H]` node-suite. NOTHING here is app-green, envelope-green,
// store-green-as-app or live-green; the [H] row's node-realm import of
// `src/renderer/renderer.js` is the seam gauge (the import path the zone-replacement
// register suite already proves node-clean), and its byte-scan construction-site pin is
// its second leg.
//
// THE RED-SET REPAIR RECONCILIATION (2026-10-04, the AUTHOR-ROLE correction — the
// spec-vs-store rows re-aimed to the LANDED store semantics; the module bytes
// `src/renderer/store-core-graph.ts` + `store-graph-references.ts` are the FROZEN
// AUTHORITY, byte-pinned to `7bd1de4786c4d46a3fee02f72adaf6ef612985d1` — never
// edited, never re-drived; the seam in `renderer.ts` is HELD against it). Every
// re-aimed row, the old reading and the byte-true reading (dates on the per-row
// notes):
//   row 4 (resolve/read case set) — the miss was driven as FOUR members
//     {found, value, tier, cache} and a dotted child of a written leaf as a first-hit
//     record. BYTE-TRUE: the `GraphReadMiss` carries FIVE members {found, value,
//     tier, cache, name} (the `name` member is present — a miss never invents a
//     default and never drops the name); a dotted child of a WRITTEN LEAF answers the
//     TYPED REFUSAL `reason: 'no-such-anchor'` at step D-ANCHOR (the leaf has no
//     anchor for the child) — NOT a first-hit record.
//   row 5 (write receipts) — the drive expected a FIRST `set` to answer a committed
//     receipt. BYTE-TRUE: the write surface commits at `commit`; a FIRST `set` on an
//     undeclared/absent path answers the `undeclared-name`/refusal family (staging —
//     a `set` only EDITS an existing node at the matching flag). RE-AIMED: the
//     set-vs-commit staging drive — a `set` on a committed leaf answers the committed
//     'set' receipt; `commit` answers the committed receipt (crossings 1 on a file
//     write); the refused-first-set arm is its own assertion.
//   row 6 (severed) — the drive removed a subscribed reference and expected a
//     'severed' event. BYTE-TRUE: removing a subscribed reference emits NO 'severed'
//     event (the remove fires its own 'remove' cause); the 'severed' cause's trigger
//     is the SEVERANCE of a live subscription scope — driving `sever(from,
//     anchorKey)` on a live anchor releases every reference the severed node answers
//     for and fires `cause:'severed'` on each. CONTROL 1 was written INVERTED
//     (`keys.includes('tier')` fired the CE on the forged record's own property);
//     rewritten so the CE fires on the discriminator's MISS — a forged record lacking
//     a member the byte-true envelope {name, flag, value, cleared, cause} REQUIRES.
//   row 7 (hydrate with the recording stub) — the stub's put-count never reached 1:
//     the first `set` answered refused (row-5 semantics), and the subsequent commit
//     under the hydrate-minted file holder took the child-mint path (which never
//     crosses). RE-AIMED: the drive commits a value at a `file.settings.*` path by
//     DIRECT `commit` (the byte-true staging — a fresh file-holder mint, which is the
//     one crossing invocation) and asserts the stub's put-count AFTER hydrate (0 —
//     hydrate never crosses) and AFTER the real commit (1).
//   row 9 (construction throw paths) — the drive asserted the reason token in the
//     error's `.message`; a `[{name:'register'}]` declaration did not throw.
//     BYTE-TRUE: `createGraphStoreError(message, reason)` carries the reason token in
//     `.reason` (the GraphLoadError member), NOT `.message`; `reservedNamespaces`
//     DEFAULTS to `[]` — the reserved-name refusal fires only when the option is
//     PASSED AT CONSTRUCTION (`{ reservedNamespaces: ['register'] }`). CONTROL 2's
//     disjunction always fired; rewritten to the discriminator form.
//   row 10 (caps) — the leaf-drive sweep (`mem.settings.capX` 3-segment writes) never
//     enters the cap sweep: `rootCapReached` counts ROOT HOLDERS
//     (`REGISTER_ROOT_CAP_MEM = 1024` / `REGISTER_ROOT_CAP_TEMP = 4096`), and the
//     root-holder count is never reached by deeper writes into one declared root.
//     RE-AIMED to the REAL trigger: ROOT-LEVEL mint commits over DISTINCT root names
//     (the one legal mint under an undeclared top) drive the holder count over the
//     cap and the refusal answers `'cap-exceeded'` — non-destructive, first entry
//     probed; the register's own caps assert unchanged.
//   row 11 (constraints) — the row drove a runtime `store.constraints.register(...)`
//     API that does not exist. BYTE-TRUE: constraints are CALLER-SUPPLIED
//     `GraphConstraint[]` passed AT CONSTRUCTION — `{id, matchedSet, evaluatedOn,
//     constraint, repair?}` (`matchedSet` names the operation's own top-level name;
//     `evaluatedOn ⊆ {'set','commit','remove'}`; `constraint(changed, current, next,
//     feedback?)` returns boolean; `repair` is optional) — there is NO runtime
//     register API; `store.constraints` is the read-only identity view of the
//     supplied array. RE-AIMED: construct a store WITH a byte-true GraphConstraint
//     and drive the call/identity arm, the refusal arm (own token via feedback) and
//     the repair arm through it.
//   control style (all rows) — every control's expected outcome is the OPPOSITE of
//     its row's verdict and must DISCRIMINATE: the CE fires only when the oracle
//     MISSES the forged record's defining divergence, never on the forged record's
//     own property. Rows 5 (status), 6 (envelope + ninth cause), 8 (crossings +
//     bytes-out), 9 (reason-token) and 10 (mutation + caps figures) were inverted or
//     vacuous in that shape and are rewritten to the discriminator form.
//   rows 1/2/3/H stay HELD — no re-aim (their drives satisfy the byte-true surface
//     as filed; the [H] row is held against the landed-but-uncommitted seam).
//
// THE ORACLE DISCIPLINE: every drive asserts a falsifiable property of the SPEC's
// clauses; where a clause names a behavior without spelling its surface (the reserved-
// namespace spelling, the constraint-handle shape, the clear/sweep arity), the row
// drives the clause's WORDS and RECORDS the ambiguity in its own text — never a guess
// presented as a reading.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-core-adopt.md')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const SELF_PATH = join(HERE, 'store-core-adopt-register.test.ts')

// ===========================================================================
// §5 — SHARED MACHINERY, pinned once and binding on every row.
// Seed `0x20261004` (a fixed literal — never `Date.now()`, never `Math.random()`,
// never an environment read); a hand-rolled 32-bit LCG, ONE STEP PER DRAW
// (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`, `index = stateₙ₊₁ mod
// pool.length`); ≤100 attempts per row; ≤400 in total; rows run sequentially in
// register order; STOP AFTER 5 CONSECUTIVE FAILURES (abandonment is REPORTED through
// `stoppedAt`, never hidden).
// ===========================================================================
const REGISTER_SEED = 0x20261004
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

interface DeclaredRow {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors */
  declared: string
  declaredTotal: number
  layer: '[T]' | '[H]'
  /** the red-head colour, recorded per §4 R-2/R-3 — every row is RED at the unit's own
   *  head (the module-does-not-exist class / the seam-absent class) */
  redHeadColour: string
}

const DECLARED_REGISTER: DeclaredRow[] = [
  {
    row: 'P-STORE-CORE-1',
    strategyId: 'strat:store-core-construction-total-identity',
    declared: '3 + 2',
    declaredTotal: 5,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: ../src/renderer/store-core-graph.js does not resolve; the row reports the module-does-not-exist class by name (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-2',
    strategyId: 'strat:store-core-closed-declared-roots',
    declared: '6 + 2',
    declaredTotal: 8,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the closed declared-roots drives have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-3',
    strategyId: 'strat:store-core-secure-refusal-prefix',
    declared: '8 + 2',
    declaredTotal: 10,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the tier-token screen has no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-4',
    strategyId: 'strat:store-core-resolve-read-and-ctop-gate',
    declared: '4 + 2',
    declaredTotal: 6,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the resolve/read case set has no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-5',
    strategyId: 'strat:store-core-write-receipt-shape',
    declared: '6 + 2',
    declaredTotal: 8,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the write-receipt drives have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-6',
    strategyId: 'strat:store-core-event-envelope-closed',
    declared: '4 + 2',
    declaredTotal: 6,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the event-envelope drives have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-7',
    strategyId: 'strat:store-core-hydrate-never-crosses',
    declared: '4 + 2',
    declaredTotal: 6,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the hydrate drives (RECORDING-STUB crossing) have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-8',
    strategyId: 'strat:store-core-inert-seam-receipt',
    declared: '4 + 2',
    declaredTotal: 6,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the inert-seam receipt drive has no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-9',
    strategyId: 'strat:store-core-construction-throw-paths',
    declared: '4 + 2',
    declaredTotal: 6,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the four construction throw paths have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-10',
    strategyId: 'strat:store-core-caps-non-destructive',
    declared: '4 + 2',
    declaredTotal: 6,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the caps drives have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-11',
    strategyId: 'strat:store-core-constraints-passed-functions',
    declared: '3 + 2',
    declaredTotal: 5,
    layer: '[T]',
    redHeadColour:
      'RED — the pair is absent at the unit\'s own head: the constraint-surface drives have no subject (§4 R-2)',
  },
  {
    row: 'P-STORE-CORE-H',
    strategyId: 'strat:store-core-seam-node-realm-identity',
    declared: '3 + 1 + 2',
    declaredTotal: 6,
    layer: '[H]',
    redHeadColour:
      'RED — the seam is absent: getWiredGraphStore/buildWiredGraphStore/FILE_TIER_TOP_NAMES_FORK and the construction call resolve nowhere (§4 R-3)',
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

/** A bounded attempt loop: `check` returns a counterexample string or `null` when the
 *  attempt HELD. The attempt is ALWAYS counted; the row's remaining attempts are
 *  abandoned once `STOP_AFTER` CONSECUTIVE failures have been seen, and the abandonment
 *  is reported through `stoppedAt`. */
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

function finish(id: string, run: RowRun): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error(`STORE-CORE-ADOPT register failure: ${id} is not a declared register row`)
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
    limbs: run.limbs,
  }
  REPORTS.push(report)
  expect(
    held,
    `${id} ${declared.strategyId}: declared ${declared.declared} = ${declared.declaredTotal} attempt(s); executed ${executed}; stoppedAt ${String(run.stoppedAt)} — ${held ? 'HELD' : 'BROKEN'}${
      run.counterexamples.length > 0 ? `; counterexamples: ${run.counterexamples.slice(0, 3).join(' | ')}` : ''
    }`,
  ).toBe(true)
  return report
}

// ===========================================================================
// §2.1 — THE REGISTER'S TYPED VOCABULARY (closed token sets the rows drive; each is
// the SPEC's own union, carried in the register so a ninth cause / a `secure` flag /
// a `tier` event member can NEVER be typed into a row).
// ===========================================================================
const TIER_TOKENS = ['temp', 'mem', 'file', 'secure'] as const
const NODE_FLAGS = ['temp', 'mem', 'file'] as const
const EVENT_CAUSES = ['set', 'commit', 'clear', 'sweep', 'remove', 'repair', 'descendant', 'severed'] as const
const RECEIPT_MEMBERS = ['status', 'name', 'cleared', 'repaired', 'rows', 'crossings', 'events'] as const
/** NO-bytes-out members: a receipt carrying any of these IS a durability/bytes-out
 *  claim (F-12) — the row-8 honesty limb scans against this set. */
const PERSISTENCE_CLAIM_MEMBERS = ['bytes', 'persisted', 'durable', 'written', 'onDisk', 'out'] as const

// ===========================================================================
// THE REAL-LOAD HELPERS — the register drives the pair through a DYNAMIC import of
// `../src/renderer/store-core-graph.js` (.js specifiers per the repo's ESM
// convention). At the red head the module is ABSENT → the import throws → every row
// reports the module-does-not-exist class by name. The [H] row loads
// `../src/renderer/renderer.js` in the node realm (the W4/`[H]` form).
// ===========================================================================
type CoreApi = {
  createGraphStore: (options: unknown) => unknown
}
type CoreLoad =
  | { ok: true; api: CoreApi & Record<string, unknown>; references: { storeGraphReferences: (rows: unknown) => unknown } & Record<string, unknown> }
  | { ok: false; error: string }

async function tryLoadCore(): Promise<CoreLoad> {
  try {
    const api = (await import('../src/renderer/store-core-graph.js')) as Record<string, unknown>
    const references = (await import('../src/renderer/store-graph-references.js')) as Record<string, unknown>
    return {
      ok: true,
      api: api as CoreApi & Record<string, unknown>,
      references: references as { storeGraphReferences: (rows: unknown) => unknown } & Record<string, unknown>,
    }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

type SeamLoad =
  | { ok: true; getWiredGraphStore: (options?: unknown) => unknown; references: { storeGraphReferences: (rows: unknown) => unknown } }
  | { ok: false; error: string }

async function tryLoadSeam(): Promise<SeamLoad> {
  try {
    const renderer = (await import('../src/renderer/renderer.js')) as Record<string, unknown>
    const references = (await import('../src/renderer/store-graph-references.js')) as Record<string, unknown>
    const fn = renderer.getWiredGraphStore
    if (typeof fn !== 'function') {
      return {
        ok: false,
        error:
          'seam-absent: getWiredGraphStore resolves NOWHERE on ../src/renderer/renderer.js at this head — the realm binding, buildWiredGraphStore and the export do not exist (module-does-not-exist, §4 R-3)',
      }
    }
    return { ok: true, getWiredGraphStore: fn as (options?: unknown) => unknown, references: references as { storeGraphReferences: (rows: unknown) => unknown } }
  } catch (e) {
    return { ok: false, error: `module-does-not-exist: ${(e as Error).message}` }
  }
}

/** The row's absence counterexample — the red-head report of §4 R-2/R-3, naming the
 *  row. The remaining declared attempts are ABANDONED and REPORTED (never reduced;
 *  an un-run row reports a FAILURE, never a pass). */
function absenceCounterexample(row: string, loadError: string): string {
  return `module-does-not-exist [${row}]: the pair could not be driven — ${loadError} — the row's remaining declared attempts are ABANDONED and reported through its executed-vs-declared mismatch (F-11)`
}

// ===========================================================================
// THE ROW ORACLES (factored so every control drives the SAME limb the real row drive
// drives — a control's expected outcome is the OPPOSITE of the row's verdict).
// ===========================================================================
type ReceiptLike = { status: string; name?: unknown; reason?: unknown; [k: string]: unknown }

function refusalOf(record: unknown, token: string): string | null {
  if (record === null || typeof record !== 'object') {
    return `the answer is not a refusal record: ${String(record)} — expected {status:'refused', reason:'${token}'}`
  }
  const r = record as ReceiptLike
  if (r.status !== 'refused') return `the answer's status is ${String(r.status)} — expected 'refused' with reason ${token}`
  if (r.reason !== token) return `the answer's reason is ${String(r.reason)} — expected ${token}`
  return null
}

function receiptMemberProblems(r: unknown): string[] {
  if (r === null || typeof r !== 'object') return [`the answer is not an object: ${String(r)} — a GraphWriteReceipt must carry {status, name, cleared, repaired, rows, crossings, events}`]
  const rec = r as Record<string, unknown>
  const missing = RECEIPT_MEMBERS.filter((m) => !(m in rec))
  return missing.length > 0 ? [`the receipt is missing member(s) [${missing.join(', ')}] — the byte-true GraphWriteReceipt shape carries all seven`] : []
}

/** THE CONTROL DISCRIMINATOR FAMILY (RED-SET-REPAIR control-style rule): each helper
 *  returns a NON-NULL violation string iff the forged record exhibits ITS OWN DEFINING
 *  divergence (the checked defect class); a control's CE fires ONLY when the
 *  discriminator returns null (it MISSED the divergence) — never on the forged
 *  record's own property. */

/** Row 5, control 2 — a receipt whose status is outside the closed pair
 *  {committed, refused} is a foreign status (the divergence). */
function foreignStatusOf(rec: { status: unknown }): string | null {
  return rec.status === 'committed' || rec.status === 'refused'
    ? null
    : `the receipt's status is ${String(rec.status)} — the byte-true status set is {committed, refused} (a foreign status is the divergence)`
}

/** Row 6 — an event envelope missing a member the byte-true envelope
 *  {name, flag, value, cleared, cause, origin?, subtree?} REQUIRES, or carrying the
 *  forbidden `tier` member. */
function envelopeDivergenceOf(ev: Record<string, unknown>): string | null {
  const required = ['name', 'flag', 'value', 'cleared', 'cause']
  const missing = required.filter((k) => !(k in ev))
  if (missing.length > 0) {
    return `the forged event is missing REQUIRED member(s) [${missing.join(', ')}] — the byte-true envelope is {name, flag, value, cleared, cause, origin?, subtree?} (a missing member is the divergence)`
  }
  if ('tier' in ev) return `the forged event carries a tier member — the byte-true envelope has NO tier member (C-1)`
  return null
}

/** Row 6 — an event whose cause is OUTSIDE the closed EIGHT-cause union. */
function ninthCauseOf(ev: { cause: unknown }): string | null {
  return (EVENT_CAUSES as readonly string[]).includes(String(ev.cause))
    ? null
    : `the event's cause ${String(ev.cause)} is outside the closed EIGHT-cause union 'set'|'commit'|'clear'|'sweep'|'remove'|'repair'|'descendant'|'severed' (C-2)`
}

/** Row 8, control 1 — a committed file receipt reporting crossings: 0 (the byte
 *  counter rule requires crossings: 1 on a committed file write — F-12). */
function crossingsDivergenceOf(rec: Record<string, unknown>): string | null {
  return rec.status === 'committed' && rec.crossings === 0
    ? 'a committed file.* receipt reports crossings: 0 — the byte counter rule requires crossings: 1 on a committed file write (F-12)'
    : null
}

/** Row 8, control 2 — a receipt carrying any persistence/bytes-out member (F-12 on a
 *  null seam). */
function persistenceClaimOf(rec: Record<string, unknown>): string | null {
  const claims = PERSISTENCE_CLAIM_MEMBERS.filter((m) => m in rec)
  return claims.length > 0 ? `the receipt carries persistence/bytes-out member(s) [${claims.join(', ')}] — a bytes-out claim on a null seam is F-12` : null
}

/** Row 9, control 2 — a construction-refusal error that does NOT carry the reason in
 *  `.reason` (createGraphStoreError(message, reason)'s member) — the divergence. */
function constructionReasonDivergenceOf(factory: () => unknown): string | null {
  try {
    factory()
    return 'the forged construction did NOT throw — author-time-refusal errors must throw (the boot never wrap-degrades)'
  } catch (e) {
    const err = e as { reason?: unknown }
    return typeof err.reason === 'string' ? null : 'the thrown error carries no .reason token — the byte-true author-time error is createGraphStoreError(message, reason) with the reason IN .reason'
  }
}

/** Row 10, control 1 — a cap answer that REPORTS COMMITTED where the cap must refuse
 *  (a silent truncation is the divergence; the cap-exceeded answer is a refusal record
 *  carrying the cap's own token). */
function capMutationDivergenceOf(rec: Record<string, unknown>): string | null {
  return rec.status === 'committed' && rec.reason === undefined
    ? 'the forged cap answer reports committed with NO refusal token — a silent truncation is the divergence (cap-exceeded must answer as a refusal record, never a mutation)'
    : null
}

/** Row 10, control 2 — the register's own caps figures moved (≤100/row · ≤400 in
 *  total — a relaxed figure is the divergence). */
function capsRelaxedDivergenceOf(c: { perRow: number; total: number }): string | null {
  return c.perRow === 100 && c.total === 400 ? null : `the caps figures moved: perRow ${c.perRow} · total ${c.total} — the register's own caps are ≤100 per row · ≤400 in total`
}

/** The storage handle the rows drive (loosely typed — the module's own shapes are the
 *  E-2 subject, never re-declared here as a contract). */
type StoreLike = {
  resolve: (name: string) => unknown
  set: (name: string, value: unknown) => unknown
  commit: (name: string) => unknown
  remove: (name: string) => unknown
  clear: (name: string) => unknown
  sweep: (name: string) => unknown
  subscribe: (name: string, handler: (event: unknown) => void) => unknown
  hydrate: (rows: unknown) => unknown
  [k: string]: unknown
}

function asStore(s: unknown): StoreLike {
  return s as StoreLike
}

/** P-STORE-CORE-1 / P-STORE-CORE-9 oracle — construction is TOTAL over the options'
 *  contents: never refuses, and the four throw paths fire when the DRIVES name them. */
function totalConstructionOracle(factory: (options: unknown) => unknown): string | null {
  const cases: unknown[] = [
    { declarations: [{ name: 'settings' }], crossing: null },
    { declarations: [] },
    {},
  ]
  for (const opts of cases) {
    try {
      factory(opts)
    } catch (e) {
      return `the factory REFUSED construction over the options' contents ${JSON.stringify(opts)}: ${(e as Error).message} — construction is TOTAL (author-time-total; the boot never wrap-degrades)`
    }
  }
  return null
}

/** P-STORE-CORE-9's wrap-degrade oracle — a seam that SWALLOWS a construction error is
 *  a fail-state (the boot never wrap-degrades). */
function wrapDegradeOracle(factory: (options: unknown) => unknown): string | null {
  try {
    factory({ declarations: [{ name: '' }] })
  } catch {
    return null // the error propagated — author-time-total holds
  }
  return 'a construction that should THROW (a malformed declared row) did NOT — or an enclosing seam SWALLOWED the error (wrap-degrade is a fail-state, F-4/F-9)'
}

// ===========================================================================
// §5 — THE ROWS, IN REGISTER ORDER. Each row: its `describe` + ONE `it` carrying its
// declared term as the sum of its own factors, its drives and its controls.
// ===========================================================================

// ---------------------------------------------------------------------------
// P-STORE-CORE-1 — construction totality + identity
//   `createGraphStore({ declarations: storeGraphReferences([{name:'settings'}]),
//   crossing: null })` constructs a WORKING store; construction never refuses over the
//   options' contents; the declared-roots input is carried verbatim.
//   3 + 2 = 5: 3 drives (construct-with-settings · totality-over-contents ·
//   roots-carried-verbatim) + 2 controls (a throwing factory · a root-losing store).
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-1 — construction totality + identity: createGraphStore with the declared settings root constructs a working store, never refuses over the options\' contents, and carries the declared root verbatim (strat:store-core-construction-total-identity)', () => {
  it('P-STORE-CORE-1 — 3 + 2 = 5', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-1', load.error))
    } else {
      const { api, references } = load
      // ⟨drive 1⟩ the row's own construction text — a working store over the declared root
      let store: unknown = null
      try {
        store = api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null })
      } catch (e) {
        store = null
      }
      attempt(
        run,
        i++,
        store !== null && typeof asStore(store).resolve === 'function'
          ? null
          : 'construction over {declarations: storeGraphReferences([{name:\'settings\'}]), crossing: null} did NOT yield a working store (a store with a resolve member) — construction never refuses over the options\' contents',
      )

      // ⟨drive 2⟩ totality over the options' contents — fewer contents still construct
      const total = totalConstructionOracle((opts) => api.createGraphStore(opts))
      attempt(run, i++, total)

      // ⟨drive 3⟩ the declared root carried VERBATIM — a write on file.settings.* is
      // NOT refused as undeclared (the gate's own refusal would mean the root was lost)
      if (store === null) {
        attempt(run, i++, 'the roots-carried-verbatim drive has no subject: construction failed above')
      } else {
        const s = asStore(store)
        const setRes = s.set('file.settings.r1.probe', 'v')
        const commitRes = s.commit('file.settings.r1.probe')
        const answer = asStore(store).commit('file.settings.r1.probe')
        const rec = answer as ReceiptLike
        attempt(
          run,
          i++,
          setRes !== null && commitRes !== null && rec.status === 'committed' && rec.reason !== 'undeclared-name'
            ? null
            : `the declared settings root was NOT carried verbatim: a file.settings.* write answered ${JSON.stringify(rec)} — the root's C-TOP must be open at unit 1 (K-4)`,
        )
      }

      // ---- the TWO CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----
      attempt(
        run,
        i++,
        totalConstructionOracle(() => {
          throw new Error('forged refusal')
        }) === null
          ? 'CONTROL 1 could not discriminate: the totality oracle ACCEPTED a factory that throws over its options'
          : null,
      )
      attempt(
        run,
        i++,
        rootsVerbatimOracle(() => ({ status: 'refused', reason: 'undeclared-name' })) === null
          ? 'CONTROL 2 could not discriminate: the roots-verbatim oracle ACCEPTED a store that loses the declared root'
          : null,
      )
    }
    finish('P-STORE-CORE-1', run)
  }, 10_000)
})

/** The roots-verbatim oracle (row 1's control 2 + a drive limb) — a store-like whose
 *  committed write on the declared root reports 'undeclared-name' is a FALSIFIER. */
function rootsVerbatimOracle(mk: (name: string) => Record<string, unknown> | null): string | null {
  const r = mk('file.settings.r1.probe')
  if (r === null) return 'the store-like answered NO record for a write on the declared settings root'
  if (r.status === 'refused' && r.reason === 'undeclared-name') return 'the store-like LOSES the declared root: a write on file.settings.* is refused as undeclared'
  return null
}

// ---------------------------------------------------------------------------
// P-STORE-CORE-2 — the closed declared-roots set
//   With FILE_TIER_TOP_NAMES_FORK = [{name:'settings'}], `settings` is the ONLY
//   declared top: no other top resolves, no mem/temp top exists, and the tier-agnostic
//   mem.settings.*/temp.settings.* C-TOP consequence is carried.
//   6 + 2 = 8: 6 drives (settings × file/mem/temp open · other-name × file/mem/temp
//   refused undeclared) + 2 controls (a second top · a settings root refusing its C-TOP).
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-2 — the closed declared-roots set: settings is the ONLY declared top, no mem/temp top exists, and the tier-agnostic C-TOP consequence is carried (strat:store-core-closed-declared-roots)', () => {
  it('P-STORE-CORE-2 — 6 + 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-2', load.error))
    } else {
      const { api, references } = load
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))

      const committedOn = (prefix: string, name: string): string | null => {
        const setRes = store.set(`${prefix}${name}`, 'v')
        const rec = store.commit(`${prefix}${name}`) as ReceiptLike
        return setRes !== null && rec.status === 'committed' ? null : `${prefix}${name} is NOT committed (${JSON.stringify(rec)}) — a DECLARED-top write must commit`
      }
      const undeclaredOn = (prefix: string, name: string): string | null => {
        const rec = store.set(`${prefix}${name}`, 'v') as ReceiptLike
        return refusalOf(rec, 'undeclared-name')
      }

      // ⟨drives 1-3⟩ the settings root is open across the three handle tiers (the
      // tier-agnostic C-TOP consequence, stated and carried — K-4)
      attempt(run, i++, committedOn('file.settings.', 'r2.a'))
      attempt(run, i++, committedOn('mem.settings.', 'r2.a'))
      attempt(run, i++, committedOn('temp.settings.', 'r2.a'))
      // ⟨drives 4-6⟩ NO other top exists — the write-side C-TOP gate refuses undeclared
      attempt(run, i++, undeclaredOn('file.', 'tops2.x'))
      attempt(run, i++, undeclaredOn('mem.', 'tops2.x'))
      attempt(run, i++, undeclaredOn('temp.', 'tops2.x'))

      // ---- the TWO CONTROLS (opposite expected outcomes) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          const accepted = committedOn('file.', 'tops2.y')
          // a second top must refuse — if the oracle above accepted it, the closed-set
          // limb is vacuous
          return accepted === null
            ? 'CONTROL 1 could not discriminate: the closed-set oracle ACCEPTED a second file top (file.tops2.y committed) — the set is closed at settings'
            : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          // the C-TOP-consequence oracle: a settings root that REFUSES its own mem C-TOP
          // is the K-4 falsifier — the oracle must FLAG the forged refusal
          const forge = ctopConsequenceOracle(() => ({ status: 'refused', reason: 'undeclared-name' }))
          return forge === null
            ? 'CONTROL 2 could not discriminate: the C-TOP oracle ACCEPTED a settings root that refuses its mem C-TOP (the tier-agnostic consequence must be carried, K-4)'
            : null
        })(),
      )
    }
    finish('P-STORE-CORE-2', run)
  }, 10_000)
})

// ---------------------------------------------------------------------------
// P-STORE-CORE-3 — the four tier tokens' screen
//   temp/mem/file handle values; `secure` is a REFUSAL PREFIX — every surface op on a
//   secure.* name answers {status:'refused', reason:'secure-refused'} BEFORE the
//   register is consulted and BEFORE any traversal — never 'undeclared-name'. The
//   positive control: the same names without the secure segment answer the NORMAL
//   refusal. `secure` is never a node flag.
//   8 + 2 = 10.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-3 — the tier tokens: temp/mem/file handle values; secure is a refusal prefix answered BEFORE the register and any traversal, never a node flag (strat:store-core-secure-refusal-prefix)', () => {
  it('P-STORE-CORE-3 — 8 + 2 = 10', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-3', load.error))
    } else {
      const { api, references } = load
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))

      const secureOn = (op: (name: string) => unknown, label: string): string | null => {
        const rec = op('secure.r3.any') as ReceiptLike
        const refused = refusalOf(rec, 'secure-refused')
        if (refused !== null) return `${label}: ${refused}`
        if (rec.reason === 'undeclared-name') return `${label}: a secure.* name was answered 'undeclared-name' — the secure refusal must fire BEFORE the register is consulted`
        return null
      }
      // ⟨drives 1-6⟩ the full surface on secure.* — each answers the secure-refusal
      attempt(run, i++, secureOn((n) => store.resolve(n), 'resolve(secure.<k>)'))
      attempt(run, i++, secureOn((n) => store.set(n, 'v'), 'set(secure.<k>)'))
      attempt(run, i++, secureOn((n) => store.commit(n), 'commit(secure.<k>)'))
      attempt(run, i++, secureOn((n) => store.remove(n), 'remove(secure.<k>)'))
      attempt(run, i++, secureOn((n) => store.clear(n), 'clear(secure.<k>)'))
      attempt(run, i++, secureOn((n) => store.subscribe(n, () => undefined), 'subscribe(secure.<k>)'))

      // ⟨drive 7⟩ the positive control: the SAME names without the secure segment answer
      // the NORMAL refusal — never 'secure-refused' (the taxonomy discriminates)
      const normal = store.set('file.tops3.x', 'v') as ReceiptLike
      attempt(
        run,
        i++,
        refusalOf(normal, 'undeclared-name') === null && normal.reason === 'secure-refused'
          ? 'the positive control: a non-secure name must answer the NORMAL refusal — ' +
            (normal.reason === 'secure-refused' ? `it answered 'secure-refused' (a false secure prefix)` : `it answered ${JSON.stringify(normal)}`)
          : null,
      )

      // ⟨drive 8⟩ the token census — the tier set is the four, the node-flag set is the
      // three; a `secure` FLAG spelling is outside the union (C-4: secure is never a
      // node flag)
      const flagOk = NODE_FLAGS.every((f) => (TIER_TOKENS as readonly string[]).includes(f)) && !(NODE_FLAGS as readonly string[]).includes('secure')
      attempt(
        run,
        i++,
        (TIER_TOKENS as readonly string[]).includes('secure') === false || flagOk === false
          ? 'the token census diverged: the closed unions are GraphTierToken (\'temp\'|\'mem\'|\'file\'|\'secure\') and GraphNodeFlag (\'temp\'|\'mem\'|\'file\') — secure is NEVER a node flag'
          : null,
      )

      // ---- the TWO CONTROLS (opposite expected outcomes) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          const forge = secureRefusalOracle(() => ({ status: 'refused', reason: 'undeclared-name' }))
          return forge === null ? 'CONTROL 1 could not discriminate: the refusal oracle ACCEPTED a secure name answered \'undeclared-name\'' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          const forge = secureRefusalOracle(() => ({ found: true, value: 'leaked', tier: 'mem', flag: 'mem', cache: null }))
          return forge === null ? 'CONTROL 2 could not discriminate: the refusal oracle ACCEPTED a secure name RESOLVING' : null
        })(),
      )
    }
    finish('P-STORE-CORE-3', run)
  }, 10_000)
})

/** The secure-refusal oracle — null iff a secure.* answer is the secure-refusal. */
function secureRefusalOracle(answer: (name: string) => unknown): string | null {
  const rec = answer('secure.r3.any') as ReceiptLike
  return refusalOf(rec, 'secure-refused')
}

/** The C-TOP-consequence oracle (row 2's control 2) — null iff a settings-root write
 *  answers across its tiers; a root REFUSING its own mem C-TOP is the K-4 falsifier. */
function ctopConsequenceOracle(set: (name: string, value: unknown) => unknown): string | null {
  const rec = set('mem.settings.r2.c', 'v') as ReceiptLike
  if (rec.status === 'refused' && rec.reason === 'undeclared-name') {
    return 'the settings root REFUSED its mem C-TOP — declaring `settings` carries the tier-agnostic consequence (K-4): mem.settings.*/temp.settings.* are addressable'
  }
  return null
}

// ---------------------------------------------------------------------------
// P-STORE-CORE-4 — the resolve-not-read case set
//   The handle's read member is resolve(name); the exact FIVE-member miss shape
//   {found:false, value:undefined, tier:null, cache:null, name}; a dotted CHILD of a
//   written leaf answers the typed refusal 'no-such-anchor' at D-ANCHOR (RE-AIMED —
//   RED-SET-REPAIR row 4); the write-side C-TOP gate answers 'undeclared-name' on an
//   undeclared root.
//   4 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-4 — resolve, not read: the read member, the dotted-walk first-hit record, the exact miss shape, and the write-side C-TOP gate (strat:store-core-resolve-read-and-ctop-gate)', () => {
  it('P-STORE-CORE-4 — 4 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-4', load.error))
    } else {
      const { api, references } = load
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))

      // ⟨drive 1⟩ the byte-name map: resolve is the read member, and there is NO `read`
      const hasRead = Object.prototype.hasOwnProperty.call(store, 'read')
      attempt(
        run,
        i++,
        typeof store.resolve === 'function' && !hasRead ? null : `the handle's read member is resolve(name) — 'read' is a SUPERSEDED word (C-3): resolve ${typeof store.resolve}, read ${hasRead ? 'present' : 'absent'}`
      )

      // ⟨drive 2⟩ the exact miss shape — never an invented default; the byte-true
      // GraphReadMiss carries FIVE members {found, value, tier, cache, name} — the
      // `name` member is present (RED-SET-REPAIR row 4; the pre-repair drive expected
      // the four-member shape and redded on the byte-true five)
      const miss = store.resolve('file.settings.r4.absent.deep') as Record<string, unknown>
      const missKeys = Object.keys(miss).sort()
      const missShapeOk =
        missKeys.length === 5 &&
        missKeys.join(',') === 'cache,found,name,tier,value' &&
        miss.found === false &&
        miss.value === undefined &&
        miss.tier === null &&
        miss.cache === null &&
        miss.name === 'file.settings.r4.absent.deep'
      attempt(run, i++, missShapeOk ? null : `a miss must answer exactly {found:false, value:undefined, tier:null, cache:null, name}; answered ${JSON.stringify(miss)}`)

      // ⟨drive 3⟩ the written-leaf hit, and the dotted CHILD of a written leaf answers
      // the TYPED REFUSAL — `reason: 'no-such-anchor'` at step D-ANCHOR (the walk stops
      // at the leaf, which carries no anchor for the child; NOT a first-hit record —
      // RED-SET-REPAIR row 4)
      store.set('file.settings.r4.host', 'H')
      store.commit('file.settings.r4.host', 'H')
      const hit = store.resolve('file.settings.r4.host') as Record<string, unknown>
      const deepHit = store.resolve('file.settings.r4.host.child') as Record<string, unknown>
      attempt(
        run,
        i++,
        hit.found === true &&
          hit.value === 'H' &&
          deepHit.status === 'refused' &&
          deepHit.reason === 'no-such-anchor' &&
          deepHit.step === 'D-ANCHOR' &&
          deepHit.name === 'file.settings.r4.host.child'
          ? null
          : `the resolve case set diverged: resolve('file.settings.r4.host') = ${JSON.stringify(hit)}, resolve('file.settings.r4.host.child') = ${JSON.stringify(deepHit)} — the leaf resolves a hit; its dotted CHILD answers the typed 'no-such-anchor' refusal at D-ANCHOR (never a first-hit record)`,
      )

      // ⟨drive 4⟩ the write-side C-TOP gate: an undeclared root answers 'undeclared-name'
      const gate = store.set('file.tops4.x', 'v') as ReceiptLike
      attempt(run, i++, refusalOf(gate, 'undeclared-name'))

      // ---- the TWO CONTROLS (opposite expected outcomes) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          const forge = missOracle(() => ({ found: false, value: 'invented', tier: null, cache: null }))
          return forge === null ? 'CONTROL 1 could not discriminate: the miss oracle ACCEPTED an invented default on a miss' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          const forge = readMemberOracle(() => ({ read: () => undefined }))
          return forge === null ? 'CONTROL 2 could not discriminate: the read-member oracle ACCEPTED a handle exposing read instead of resolve' : null
        })(),
      )
    }
    finish('P-STORE-CORE-4', run)
  }, 10_000)
})

function missOracle(resolve: (name: string) => unknown): string | null {
  const r = resolve('file.settings.r4.absent.deep') as Record<string, unknown>
  const keys = Object.keys(r)
  if (
    keys.length === 5 &&
    r.found === false &&
    r.value === undefined &&
    r.tier === null &&
    r.cache === null &&
    typeof r.name === 'string'
  ) {
    return null
  }
  return 'a miss must answer exactly {found:false, value:undefined, tier:null, cache:null, name} — never an invented default, never a missing member (RED-SET-REPAIR row 4)'
}
function readMemberOracle(handle: (name: string) => unknown): string | null {
  const h = handle('x') as Record<string, unknown>
  return typeof h.read === 'function' ? 'the handle exposes read — resolve is the byte name (C-3)' : null
}

// ---------------------------------------------------------------------------
// P-STORE-CORE-5 — write receipts
//   set/commit/remove/clear/sweep return the byte-true GraphWriteReceipt shape
//   {status, name, cleared, repaired, rows, crossings, events} — committed and refused
//   states both. RE-AIMED (RED-SET-REPAIR row 5): the write surface commits at
//   `commit`; a FIRST `set` on an absent path answers the 'undeclared-name' refusal
//   family (staging — `set` only EDITS an existing node at the matching flag). The
//   set-vs-commit staging drive: `set` on a COMMITTED leaf answers the committed 'set'
//   receipt; `commit` answers the committed receipt (crossings 1 on a file write); the
//   refused-first-set arm is its own assertion.
//   6 + 2 = 8.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-5 — write receipts: set/commit/remove/clear/sweep return the byte-true GraphWriteReceipt {status, name, cleared, repaired, rows, crossings, events}, committed and refused states both (strat:store-core-write-receipt-shape)', () => {
  it('P-STORE-CORE-5 — 6 + 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-5', load.error))
    } else {
      const { api, references } = load
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))

      const driveReceipt = (op: (name: string) => unknown, name: string, label: string, expectCrossings?: number): string | null => {
        const rec = op(name) as { status?: unknown; crossings?: unknown } & Record<string, unknown>
        const members = receiptMemberProblems(rec)
        if (members.length > 0) return `${label}: ${members.join(' | ')}`
        if (rec.status !== 'committed') return `${label}: status is ${String(rec.status)} — expected a committed receipt`
        if (expectCrossings !== undefined && rec.crossings !== expectCrossings) {
          return `${label}: crossings is ${String(rec.crossings)} — expected ${expectCrossings}`
        }
        return null
      }

      // THE BYTE-TRUE STAGING (RED-SET-REPAIR row 5): the write surface COMMITS at
      // `commit` — the direct commit lands the leaf (the committed-receipt arm,
      // crossings 1 on a file write); a `set` on a COMMITTED leaf answers the
      // committed 'set' receipt (the edit/staging arm); remove/clear/sweep answer the
      // committed receipt family; the FIRST `set` on an ABSENT path answers the
      // 'undeclared-name' refusal family (its own assertion, drive 6)

      // ⟨drive 1⟩ the set-staging arm: FIRST the direct commit lands the leaf (the
      // drive's own scaffolding), THEN the `set` on the committed leaf answers the
      // committed 'set' receipt
      store.commit('file.settings.r5.a', 'v0')
      attempt(run, i++, driveReceipt((n) => store.set(n, 'v'), 'file.settings.r5.a', 'set-on-committed-leaf (staging)'))

      // ⟨drive 2⟩ the committed-receipt arm — the write surface commits at `commit`:
      // a fresh-path commit answers the committed receipt with crossings 1 (file)
      attempt(run, i++, driveReceipt((n) => store.commit(n, 'v'), 'file.settings.r5.b', 'commit (fresh path)', 1))

      // ⟨drives 3-5⟩ remove/clear/sweep — the committed receipt family
      attempt(run, i++, driveReceipt((n) => store.remove(n), 'file.settings.r5.a', 'remove'))
      attempt(run, i++, driveReceipt((n) => store.clear(n), 'file.settings.r5', 'clear'))
      attempt(run, i++, driveReceipt((n) => store.sweep(n), 'file.settings.r5', 'sweep'))

      // ⟨drive 6⟩ the REFUSED-FIRST-SET arm: a FIRST `set` on an ABSENT path answers
      // the 'undeclared-name' refusal IN the receipt family (the row's reading: the
      // refused state is the same record family, §5 row 5's "refused states both"; the
      // receipt's name member is present)
      const refused = store.set('file.settings.r5.absent', 'v') as ReceiptLike
      const refusedOk = refusalOf(refused, 'undeclared-name') === null && typeof refused.name === 'string'
      attempt(run, i++, refusedOk ? null : `the refused-first-set answered ${JSON.stringify(refused)} — a FIRST set on an absent path answers the 'undeclared-name' refusal within the receipt family (reason + name member) — the write surface commits at commit`)

      // ---- the TWO CONTROLS (opposite expected outcomes) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          const forged: Record<string, unknown> = { status: 'committed', cleared: 0, repaired: 0, rows: 1, crossings: 1, events: [] } // no `name`
          const problems = receiptMemberProblems(forged)
          return problems.length === 0 ? 'CONTROL 1 could not discriminate: the receipt census ACCEPTED a receipt missing its name member' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          const forged = { status: 'maybe', name: 'file.settings.r5.a', cleared: 0, repaired: 0, rows: 1, crossings: 1, events: [] }
          const problems = receiptMemberProblems(forged)
          if (problems.length > 0) return `CONTROL 2 could not be driven: ${problems.join(' | ')}`
          // THE DISCRIMINATOR (RED-SET-REPAIR control-style row 5): the receipt's
          // status must be one of the closed pair {committed, refused} — a FOREIGN
          // status is the forged record's defining divergence and must be FLAGGED; the
          // CE fires only when the discriminator MISSES it (the pre-repair check fired
          // the CE on the valid-status case — inverted)
          const flagged = foreignStatusOf(forged)
          return flagged === null ? 'CONTROL 2 could not discriminate: the status oracle ACCEPTED a foreign status' : null
        })(),
      )
    }
    finish('P-STORE-CORE-5', run)
  }, 10_000)
})

// ---------------------------------------------------------------------------
// P-STORE-CORE-6 — the event envelope
//   {name, flag, value, cleared, cause, origin?, subtree?} — NO `tier` member; the
//   EIGHT-cause union closed; one event per affected reference; the 'severed' release
//   arm. RE-AIMED (RED-SET-REPAIR row 6): the 'severed' cause's REAL trigger is the
//   SEVERANCE OF A LIVE SUBSCRIPTION SCOPE (`sever(from, anchorKey)` on a live anchor
//   — NOT `remove`, which fires its own 'remove' cause and never 'severed'); both
//   controls rewritten to the discriminator form (a forged envelope missing a REQUIRED
//   member / a ninth cause must be FLAGGED; the CE fires only on the discriminator's
//   miss).
//   4 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-6 — the event envelope {name, flag, value, cleared, cause, origin?, subtree?}: no tier member, the eight-cause union closed, one event per affected reference, the severed release arm (strat:store-core-event-envelope-closed)', () => {
  it('P-STORE-CORE-6 — 4 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-6', load.error))
    } else {
      const { api, references } = load
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))

      function subscribeEvents(name: string): { events: unknown[]; release: unknown } {
        const holder: unknown[] = []
        const release = store.subscribe(name, (ev) => holder.push(ev))
        return { events: holder, release }
      }

      // ⟨drive 1⟩ the envelope census — every event carries name/flag/value/cleared/
      // cause, NO tier member, cause ∈ the eight
      const w = subscribeEvents('file.settings.r6.watch')
      store.set('file.settings.r6.watch', 'v')
      store.commit('file.settings.r6.watch')
      const events = w.events as Array<Record<string, unknown>>
      const envelopeOk =
        events.length >= 1 &&
        events.every((ev) => {
          const keys = Object.keys(ev)
          const hasCore = ['name', 'flag', 'value', 'cleared', 'cause'].every((k) => k in ev)
          const noTier = !keys.includes('tier')
          const causeOk = (EVENT_CAUSES as readonly string[]).includes(String(ev.cause))
          return hasCore && noTier && causeOk
        })
      attempt(
        run,
        i++,
        envelopeOk
          ? null
          : `the event envelope diverged: ${JSON.stringify(events)} — the byte-true envelope is {name, flag, value, cleared, cause, origin?, subtree?} with NO tier member (C-1) and the EIGHT-cause union (C-2)`,
      )

      // ⟨drive 2⟩ the eight-cause census — the union is CLOSED; a ninth cause is refused
      const causesOk = (EVENT_CAUSES as readonly string[]).every((c) => (EVENT_CAUSES as readonly string[]).includes(c)) && !(EVENT_CAUSES as readonly string[]).includes('hydrated')
      attempt(run, i++, causesOk ? null : "the cause union is not the closed eight: 'set'|'commit'|'clear'|'sweep'|'remove'|'repair'|'descendant'|'severed' (C-2)")

      // ⟨drive 3⟩ one event per affected reference — two subscribed references, one
      // committed write: the affected reference's subscriber sees EXACTLY one event,
      // the unaffected one sees none
      const a = subscribeEvents('file.settings.r6.a')
      const b = subscribeEvents('file.settings.r6.b')
      store.set('file.settings.r6.a', 'va')
      store.commit('file.settings.r6.a')
      const aCount = a.events.length
      const bCount = b.events.length
      attempt(
        run,
        i++,
        aCount === 1 && bCount === 0
          ? null
          : `one event per committed write per subscribed reference: the affected subscriber saw ${aCount}, the unaffected ${bCount} (expected 1 and 0)`,
      )

      // ⟨drive 4⟩ the 'severed' release arm — RE-AIMED (RED-SET-REPAIR row 6): the
      // cause's trigger is the SEVERANCE OF A LIVE SUBSCRIPTION SCOPE. `sever(from,
      // anchorKey)` on a live anchor releases every reference the severed node answers
      // for (`'severed'`-cause event on each) and de-lives the released references'
      // subscribers (the release rule, C-2). The byte-true NEGATIVE is carried beside
      // it: `remove` on a subscribed reference fires its own `'remove'` cause — NEVER
      // `'severed'`.
      //   (a) the REAL trigger: sever a live parent anchor; the severed scope's
      //       RELEASED reference — the byte-true release spelling `rootLocal.anchorKey`
      //       tier-prefixed (`file.settings.child` for a child anchor 'child' of a
      //       'file.settings.r6.host' owner) — receives the 'severed' release event
      store.commit('file.settings.r6.host', 'h')
      store.commit('file.settings.r6.host.child', 'c')
      const childWatch = subscribeEvents('file.settings.child')
      const severReceipt = store.sever('file.settings.r6.host', 'child') as ReceiptLike
      const severedSeen = (childWatch.events as Array<{ cause?: unknown; name?: unknown }>).some((ev) => ev.cause === 'severed' && ev.name === 'file.settings.child')
      //   (b) the byte-true negative: REMOVE fires 'remove', never 'severed'
      const y = subscribeEvents('file.settings.r6.y')
      store.commit('file.settings.r6.y', 'vy')
      store.remove('file.settings.r6.y')
      const removeSeen = (y.events as Array<{ cause?: unknown }>).some((ev) => ev.cause === 'remove')
      const removeSevered = (y.events as Array<{ cause?: unknown }>).some((ev) => ev.cause === 'severed')
      attempt(
        run,
        i++,
        severReceipt.status === 'committed' && severedSeen && removeSeen && !removeSevered
          ? null
          : `the severed release arm diverged: sever() = ${JSON.stringify(severReceipt)}, severed-cause seen by the released scope ${severedSeen} — the REAL trigger is sever(from, anchorKey); remove fires cause 'remove' (seen ${removeSeen}, severed-seen ${removeSevered}) — removing a subscribed reference NEVER fires 'severed'`,
      )

      // ---- the TWO CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE DISCRIMINATOR (RED-SET-REPAIR control-style row 6): a forged event
          // MISSING a required envelope member — the byte-true envelope REQUIRES
          // {name, flag, value, cleared, cause} — is the divergence and must be FLAGGED;
          // the CE fires only when the discriminator misses it (the pre-repair control
          // fired the CE on the forged record's OWN `tier` property — inverted)
          const forged = { name: 'x', value: 1, cleared: [], cause: 'commit' } // MISSING flag
          const flagged = envelopeDivergenceOf(forged)
          return flagged === null ? 'CONTROL 1 could not discriminate: the envelope oracle ACCEPTED an event missing a REQUIRED member (flag)' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE NINTH-CAUSE DISCRIMINATOR: a forged event whose cause is OUTSIDE the
          // closed eight must be FLAGGED; the CE fires only when the oracle misses it
          const forged = { name: 'x', flag: 'mem', value: 1, cleared: [], cause: 'hydrated' }
          const flagged = ninthCauseOf(forged)
          return flagged === null ? 'CONTROL 2 could not discriminate: the cause oracle ACCEPTED a ninth cause into the closed union' : null
        })(),
      )
    }
    finish('P-STORE-CORE-6', run)
  }, 10_000)
})

// ---------------------------------------------------------------------------
// P-STORE-CORE-7 — hydrate
//   Production-present; returns void; NEVER crosses — driven with a RECORDING-STUB
//   crossing whose put records calls: the stub records ZERO put calls across hydrate;
//   skips malformed rows (never a throw); mint-declares implied tops and fires
//   'commit'-cause events by design.
//   4 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-7 — hydrate(rows): production-present, returns void, NEVER crosses (a RECORDING-STUB crossing records ZERO puts), skips malformed rows, mints and fires commit-cause events (strat:store-core-hydrate-never-crosses)', () => {
  it('P-STORE-CORE-7 — 4 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-7', load.error))
    } else {
      const { api, references } = load
      const stub = { calls: 0 }
      const crossing = { put: (): { status: 'committed' } => { stub.calls++; return { status: 'committed' } } }
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing }))

      // ⟨drive 1⟩ production-present (the E-2 structural arm's non-vacuous twin)
      attempt(run, i++, typeof store.hydrate === 'function' ? null : 'hydrate is NOT present on the store handle — the byte-adopted seam must be production-present')

      // ⟨drive 2⟩ returns void and NEVER crosses — RE-AIMED (RED-SET-REPAIR row 7): the
      // RECORDING-STUB records ZERO put calls ACROSS hydrate (hydrate never crosses —
      // the mint machinery runs WITHOUT the crossing invocation); then a REAL file-tier
      // commit through the SAME stub records ONE put. The pre-repair drive's first
      // `set` answered refused (row-5 semantics) and the subsequent commit under the
      // hydrate-minted file holder took the child-mint path — which never invokes the
      // seam; the re-aimed drive lands the real commit by DIRECT `commit` on the
      // boot-declared root `settings` (its file holder is ABSENT — a fresh-holder mint,
      // the crossing invocation) while the hydrate's own rows mint a DIFFERENT file
      // root so the two arms cannot collide
      const hydrateResult = store.hydrate([{ name: 'file.r7hyd.a', value: 'v' }])
      const zeroAfterHydrate = stub.calls === 0
      store.commit('file.settings.r7.b', 'v')
      const oneAfterCommit = stub.calls === 1
      attempt(
        run,
        i++,
        hydrateResult === undefined && zeroAfterHydrate && oneAfterCommit
          ? null
          : `hydrate must return void and NEVER cross: returned ${String(hydrateResult)}, stub put-calls after hydrate ${zeroAfterHydrate ? '0' : String(stub.calls)} (must be 0 — hydrate never crosses) and after the direct file.settings commit ${oneAfterCommit ? '1' : `(saw ${stub.calls})`} (must be 1 — the fresh-holder mint is the one crossing invocation) — a hydrate that puts is a durability claim (F-12)`,
      )

      // ⟨drive 3⟩ malformed rows are SKIPPED, never a throw; the valid row still lands
      let skipped = false
      try {
        store.hydrate([{}, { name: 'file.settings.r7.ok', value: 'v2' }])
        skipped = true
      } catch {
        skipped = false
      }
      const okResolve = store.resolve('file.settings.r7.ok') as Record<string, unknown>
      attempt(run, i++, skipped && okResolve.found === true && okResolve.value === 'v2' ? null : 'hydrate must SKIP malformed rows (never a throw) and still apply the valid ones')

      // ⟨drive 4⟩ mint-declares implied tops and fires 'commit'-cause events by design
      const minted = { events: [] as unknown[] }
      store.subscribe('file.settings.r7.minted', (ev) => minted.events.push(ev))
      store.hydrate([{ name: 'file.settings.r7.minted', value: 'm' }])
      const mintResolve = store.resolve('file.settings.r7.minted') as Record<string, unknown>
      const commitCaused = (minted.events as Array<{ cause?: unknown }>).some((ev) => ev.cause === 'commit')
      attempt(
        run,
        i++,
        mintResolve.found === true && mintResolve.value === 'm' && commitCaused
          ? null
          : `the hydration mint diverged: resolve=${JSON.stringify(mintResolve)}, commit-cause event seen=${commitCaused} — hydrate mints implied tops and fires 'commit'-cause events by design`,
      )

      // ---- the TWO CONTROLS (opposite expected outcomes) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          const forge = (rows: unknown): unknown => {
            void rows
            throw new Error('forged throw on malformed')
          }
          return hydrateSkipOracle(forge) === null ? 'CONTROL 1 could not discriminate: the skip oracle ACCEPTED a hydrate that throws on a malformed row' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          const forgeStub = { put: (): { status: 'committed' } => ({ status: 'committed' }) }
          return zeroPutOracle(() => forgeStub.put()) === null
            ? 'CONTROL 2 could not discriminate: the zero-puts oracle ACCEPTED a crossing that records a put during hydrate'
            : null
        })(),
      )
    }
    finish('P-STORE-CORE-7', run)
  }, 10_000)
})

function hydrateSkipOracle(hydrate: (rows: unknown) => unknown): string | null {
  try {
    hydrate([{}])
  } catch {
    return 'a hydrate that THROWS on a malformed row is a falsifier — malformed rows are skipped, never a throw'
  }
  return null
}
function zeroPutOracle(put: () => unknown): string | null {
  void put()
  return 'a put recorded during the hydrate drive is a falsifier — hydrate NEVER crosses (the RECORDING-STUB records ZERO put calls)'
}

// ---------------------------------------------------------------------------
// P-STORE-CORE-8 — the inert-seam receipt
//   A file.* commit through crossing: null returns a receipt with crossings: 1 (the
//   counter's byte rule: crossings: requested === 'file' ? 1 : 0) while the absent
//   seam records nothing; crossings:0 on a committed file.* write is a FAILURE; a
//   mem/temp commit carries crossings: 0; NO persistence/bytes-out claim on a null
//   seam.
//   4 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-8 — the inert-seam receipt: a file.* commit through crossing: null reports crossings: 1 (a COUNTER, never a write), mem/temp commits carry crossings: 0, and NO persistence/bytes-out claim exists on a null seam (strat:store-core-inert-seam-receipt)', () => {
  it('P-STORE-CORE-8 — 4 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-8', load.error))
    } else {
      const { api, references } = load
      // the inert seam: crossing: null — the register's own construction passes exactly
      // that (the fork call site's feed, §2.2); NO seam exists to record a put
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))

      // ⟨drive 1⟩ a committed file.* write reports crossings: 1 (the counter's byte
      // rule) — while the null seam records NOTHING (no seam exists to record; the
      // counter is a COUNTER, never a write — the honesty block)
      store.set('file.settings.r8.a', 'v')
      const fileReceipt = store.commit('file.settings.r8.a') as ReceiptLike
      const fileOk = fileReceipt.status === 'committed' && fileReceipt.crossings === 1
      attempt(
        run,
        i++,
        fileOk ? null : `a committed file.* write through crossing: null must report crossings: 1; answered ${JSON.stringify(fileReceipt)} — crossings:0 on a committed file write is a FAILURE (the inert-seam baseline)`,
      )

      // ⟨drives 2-3⟩ mem/temp commits carry crossings: 0
      store.set('mem.settings.r8.a', 'v')
      const memReceipt = store.commit('mem.settings.r8.a') as ReceiptLike
      attempt(run, i++, memReceipt.status === 'committed' && memReceipt.crossings === 0 ? null : `a mem commit must carry crossings: 0; answered ${JSON.stringify(memReceipt)}`)
      store.set('temp.settings.r8.a', 'v')
      const tempReceipt = store.commit('temp.settings.r8.a') as ReceiptLike
      attempt(run, i++, tempReceipt.status === 'committed' && tempReceipt.crossings === 0 ? null : `a temp commit must carry crossings: 0; answered ${JSON.stringify(tempReceipt)}`)

      // ⟨drive 4⟩ NO persistence/bytes-out claim while crossing: null — the receipt's
      // own member set carries no bytes/persistence member, and the honesty statement is
      // PRINTED (the register's layer is [T]/machine-data; crossings:1 is a counter)
      const claimMembers = PERSISTENCE_CLAIM_MEMBERS.filter((m) => m in fileReceipt)
      // eslint-disable-next-line no-console
      console.log(
        'STORE-CORE-ADOPT P-STORE-CORE-8 honesty statement: crossings: 1 on the null seam is a COUNTER (the byte rule crossings: requested === \'file\' ? 1 : 0) — NO durability claim, NO bytes-out claim, NO put recorded by any seam (no seam exists) while crossing: null',
      )
      attempt(run, i++, claimMembers.length === 0 ? null : `the receipt carries persistence/bytes-out member(s) [${claimMembers.join(', ')}] — a bytes-out claim on a null seam is F-12`)

      // ---- the TWO CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE DISCRIMINATOR (RED-SET-REPAIR control-style row 8): a committed file
          // receipt reporting crossings: 0 IS the forged divergence (F-12) and must be
          // FLAGGED; the CE fires only when the discriminator MISSES it — the pre-repair
          // control fired the CE on `forged.crossings === 0` itself (inverted: the CE
          // fired exactly when the oracle DID flag the divergence)
          const forged: Record<string, unknown> = { status: 'committed', name: 'file.settings.r8.a', cleared: 0, repaired: 0, rows: 1, crossings: 0, events: [] }
          const flagged = crossingsDivergenceOf(forged)
          return flagged === null ? 'CONTROL 1 could not discriminate: the crossings oracle ACCEPTED a committed file receipt with crossings: 0 (F-12)' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE BYTES-OUT DISCRIMINATOR: a receipt carrying a persistence/bytes-out
          // member is the divergence on a null seam (F-12) and must be FLAGGED; the CE
          // fires only when the oracle misses it
          const forged: Record<string, unknown> = { status: 'committed', name: 'file.settings.r8.a', cleared: 0, repaired: 0, rows: 1, crossings: 1, events: [], bytes: 42 }
          const flagged = persistenceClaimOf(forged)
          return flagged === null ? 'CONTROL 2 could not discriminate: the bytes-out oracle ACCEPTED a receipt carrying a bytes/persistence member' : null
        })(),
      )
    }
    finish('P-STORE-CORE-8', run)
  }, 10_000)
})

// ---------------------------------------------------------------------------
// P-STORE-CORE-9 — the four construction throw paths
//   A declared row that is malformed ('malformed-name'), declared twice
//   ('undeclared-name'), colliding with a reserved namespace ('reserved-namespace'),
//   or carrying a secure first segment ('secure-refused') makes construction THROW
//   createGraphStoreError (author-time-total; the boot never wrap-degrades). RE-AIMED
//   (RED-SET-REPAIR row 9): the reason token is asserted IN `.reason` (the
//   GraphLoadError member — never in `.message`); the reserved-namespace drive passes
//   `{ reservedNamespaces: ['register'] }` AT CONSTRUCTION (the option DEFAULTS to
//   `[]` — nothing is reserved without the feed); CONTROL 2 rewritten to the
//   discriminator form (a throw carrying no `.reason` token must be FLAGGED).
//   4 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-9 — the four construction throw paths: malformed / duplicate / reserved-namespace / secure-first declared rows THROW createGraphStoreError by their own tokens, author-time-total (strat:store-core-construction-throw-paths)', () => {
  it('P-STORE-CORE-9 — 4 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-9', load.error))
    } else {
      const { api, references } = load

      const throwPath = (rows: unknown, token: string, label: string, extra?: Record<string, unknown>): string | null => {
        try {
          api.createGraphStore({ declarations: references.storeGraphReferences(rows), crossing: null, ...extra })
          return `${label}: construction did NOT throw for the declared row(s) ${JSON.stringify(rows)} — the ${token} throw path did not fire`
        } catch (e) {
          // RE-AIMED (RED-SET-REPAIR row 9): the byte-true author-time error is
          // `createGraphStoreError(message, reason)` — the reason token rides in
          // `.reason`, NEVER in `.message` (the pre-repair drive asserted the token in
          // the message text and redded on every path); the error's `name` is
          // 'GraphLoadError'
          const err = e as { reason?: unknown; name?: unknown }
          if (err.reason !== token) {
            return `${label}: construction threw, but the error carries reason ${String(err.reason)} — expected the documented token ${token} IN .reason (createGraphStoreError's member; the token never rides in .message)`
          }
          if (err.name !== 'GraphLoadError') {
            return `${label}: the thrown error's name is ${String(err.name)} — expected GraphLoadError`
          }
          return null
        }
      }

      // ⟨drives 1-4⟩ the four DRIVEN throw paths (duty (i)). The reserved-namespace
      // drive passes `reservedNamespaces` AT CONSTRUCTION (RED-SET-REPAIR row 9 — the
      // option DEFAULTS to `[]`, so without the feed the `register` spelling is not
      // reserved and the refusal cannot fire)
      attempt(run, i++, throwPath([{ name: '' }], 'malformed-name', 'malformed declared row'))
      attempt(run, i++, throwPath([{ name: 'settings' }, { name: 'settings' }], 'undeclared-name', 'declared twice'))
      attempt(
        run,
        i++,
        throwPath(
          [{ name: 'register' }],
          'reserved-namespace',
          'reserved-namespace collision (the feed `{ reservedNamespaces: [\'register\'] }` AT CONSTRUCTION — the reservedNamespaces option DEFAULTS to [] per the byte-true factory; without the feed nothing is reserved)',
          { reservedNamespaces: ['register'] },
        ),
      )
      attempt(run, i++, throwPath([{ name: 'secure.anything' }], 'secure-refused', 'secure first segment'))

      // ---- the TWO CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          const forged = (): unknown => ({ status: 'committed' }) // a seam that swallows the construction error
          return wrapDegradeOracle(forged) === null ? 'CONTROL 1 could not discriminate: the wrap-degrade oracle ACCEPTED a seam that swallows a construction error' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE REASON-TOKEN DISCRIMINATOR (RED-SET-REPAIR control-style row 9): an
          // author-time error whose `.reason` member is ABSENT is the divergence — the
          // forged plain Error must be FLAGGED; the CE fires only when the oracle misses
          // it (the pre-repair disjunction `wrapDegradeOracle(forged) === null ||
          // totalConstructionOracle(forged) === null` fired on every forged factory —
          // the totality leg legitimately accepts valid contents, so the CE fired
          // unconditionally)
          const forged = (): unknown => {
            throw new Error('forged plain error — no GraphLoadError reason member')
          }
          const flagged = constructionReasonDivergenceOf(forged)
          return flagged === null ? 'CONTROL 2 could not discriminate: the author-time-error oracle ACCEPTED a throw carrying no .reason token' : null
        })(),
      )
    }
    finish('P-STORE-CORE-9', run)
  }, 10_000)
})

// ---------------------------------------------------------------------------
// P-STORE-CORE-10 — caps non-destructive posture
//   The root-cap refusal (REGISTER_ROOT_CAP_MEM / REGISTER_ROOT_CAP_TEMP) answers
//   'cap-exceeded' as a refusal record — never a destructive mutation, never a silent
//   truncation; the register's OWN caps (≤100/row · ≤400) hold and are not relaxed.
//   RE-AIMED (RED-SET-REPAIR row 10): the byte-true cap counts ROOT HOLDERS, so the
//   real trigger is ROOT-LEVEL MINts over DISTINCT root names driving the holder count
//   over the cap (a deeper 3-segment write into one declared root never enters the
//   sweep — its tier holder already exists).
//   4 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-10 — caps non-destructive posture: the root-cap refusal answers \'cap-exceeded\' as a refusal record, never a destructive mutation or a silent truncation; the register\'s own caps hold (strat:store-core-caps-non-destructive)', () => {
  it('P-STORE-CORE-10 — 4 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-10', load.error))
    } else {
      const { api, references } = load
      const store = asStore(api.createGraphStore({ declarations: references.storeGraphReferences([{ name: 'settings' }]), crossing: null }))
      const pool = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

      /** The cap sweep (ONE drive), RE-AIMED (RED-SET-REPAIR row 10): the byte-true cap
       *  counts ROOT HOLDERS (`REGISTER_ROOT_CAP_MEM = 1024` / `REGISTER_ROOT_CAP_TEMP =
       *  4096` — `commitOp`'s `rootCapReached` fires where a WRITE would mint a holder at
       *  the requested tier and the tier's holder count is already at/over the cap). A
       *  deeper 3-segment write (`mem.settings.capX`) never enters the sweep: it walks
       *  under the SAME root, whose tier holder already exists — the root-holder count is
       *  untouched. The REAL trigger is ROOT-LEVEL MINts over DISTINCT root names (the
       *  one legal mint under an undeclared top — `mem.<root>` with a one-segment tail
       *  passes the C-TOP gate and mints ONE root holder each): the sweep drives the
       *  holder count over the cap and the refusal answers `'cap-exceeded'` — a refusal
       *  of ANY OTHER reason is a counterexample (the cap answers by its own token). The
       *  FIRST minted root's name is returned so the non-destructive probe (drive 3)
       *  reads a REAL pre-refusal entry. */
      const capSweep = (prefix: string, tierLabel: string): { problem: string | null; firstName: string | null } => {
        let state = REGISTER_SEED ^ (tierLabel === 'mem' ? 0xc4a7 : 0x5eed)
        let firstName: string | null = null
        // the bound covers both caps' overflow attempts: mem 1024 + 1, temp 4096 + 1
        for (let k = 0; k < 4600; k++) {
          const draw = lcgDraw(state, pool.length)
          state = draw.state
          const name = `${prefix}${pool[draw.index]}${k}`
          const rec = store.commit(name, `v${k}`) as ReceiptLike
          if (rec.status === 'refused') {
            if (rec.reason === 'cap-exceeded') return { problem: null, firstName }
            return { problem: `${tierLabel} cap sweep: commit(${name}) refused with reason ${String(rec.reason)} — expected the cap's OWN token 'cap-exceeded' (a second authority is a falsifier)`, firstName }
          }
          if (firstName === null) firstName = name
        }
        return { problem: `no 'cap-exceeded' refusal appeared within 4600 root-level mint commits on ${tierLabel} — the root-cap posture was not observable (REGISTER_ROOT_CAP_MEM / REGISTER_ROOT_CAP_TEMP, non-destructive)`, firstName }
      }

      // ⟨drive 1⟩ the mem root cap — 1024 root-level mem mints, then the overflow commit
      // answers 'cap-exceeded'
      const memSweep = capSweep('mem.caproot', 'mem')
      attempt(run, i++, memSweep.problem)
      // ⟨drive 2⟩ the temp root cap — 4096 root-level temp mints, then the overflow
      // commit answers 'cap-exceeded' (the mem holders above do not feed the temp count)
      const tempSweep = capSweep('temp.caproot', 'temp')
      attempt(run, i++, tempSweep.problem)
      // ⟨drive 3⟩ non-destructive: the FIRST pre-refusal mem root still resolves with
      // its value after the refusal — the cap refusal mutated nothing, truncated nothing
      if (memSweep.firstName === null) {
        attempt(run, i++, `the non-destructive probe has no subject: the mem cap refused BEFORE any entry committed — the posture cannot be probed (a loud failure, never a vacuous pass)`)
      } else {
        const probe = store.resolve(memSweep.firstName) as Record<string, unknown>
        attempt(
          run,
          i++,
          probe.found === true && probe.value === 'v0'
            ? null
            : `the cap refusal was destructive: the pre-refusal entry ${memSweep.firstName} resolves ${JSON.stringify(probe)} — cap-exceeded must be a refusal record, never a mutation (P-STORE-CORE-10)`,
        )
      }
      // ⟨drive 4⟩ the register's OWN caps hold and are not relaxed
      attempt(run, i++, CAPS.perRow === 100 && CAPS.total === 400 ? null : 'this register\'s caps moved: ≤100 attempts per row · ≤400 in total (a caps figure moved is a falsifier)')

      // ---- the TWO CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE MUTATION DISCRIMINATOR (RED-SET-REPAIR control-style row 10): a cap
          // answer that REPORTS COMMITTED with NO refusal token (a silent truncation)
          // is the forged divergence and must be FLAGGED; the CE fires only when the
          // discriminator misses it (the pre-repair control fired the CE on the
          // committed status itself — inverted)
          const forged = { status: 'committed', name: 'mem.caproot.forged', crossings: 0 }
          const flagged = capMutationDivergenceOf(forged)
          return flagged === null ? 'CONTROL 1 could not discriminate: the mutation oracle ACCEPTED a cap enforcement that silently truncates (the write reports committed)' : null
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          // THE CAPS-FIGURES DISCRIMINATOR: a relaxed caps figure (perRow 200) is the
          // divergence and must be FLAGGED; the CE fires only when the oracle misses it
          const forgedCaps = { perRow: 200, total: 400 }
          const flagged = capsRelaxedDivergenceOf(forgedCaps)
          return flagged === null ? 'CONTROL 2 could not discriminate: the caps oracle ACCEPTED a relaxed caps figure (perRow 200)' : null
        })(),
      )
    }
    finish('P-STORE-CORE-10', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-STORE-CORE-11 — the constraint surface
//   Constraints are PASSED functions held by identity (CONSTRAINTS-ARE-PASSED-
//   FUNCTIONS); the table declares N independent rows, each evaluated on its declared
//   events; a failing constraint refuses by its OWN token, never a silent no-op.
//   RE-AIMED (RED-SET-REPAIR row 11): constraints are CALLER-SUPPLIED
//   `GraphConstraint[]` passed AT CONSTRUCTION — `{id, matchedSet, evaluatedOn,
//   constraint, repair?}` (`matchedSet` names the operation's own top-level name;
//   `evaluatedOn ⊆ {'set','commit','remove'}`; the write machinery calls
//   `constraint(changed, current, next, feedback?)`; `repair` is optional; the
//   corrective action lands IN THE SAME COMMITTED WRITE). There is NO runtime
//   `store.constraints.register(...)` API; `store.constraints` is the read-only
//   identity view of the supplied array. The row drives the call/identity arm, the
//   refusal arm (own token via `feedback.reason`) and the repair arm through a
//   construction-time byte-true GraphConstraint.
//   3 + 2 = 5.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-11 — the constraint surface: constraints are PASSED functions held by identity, each row evaluated on its declared events, a failing constraint refuses by its OWN token (strat:store-core-constraints-passed-functions)', () => {
  it('P-STORE-CORE-11 — 3 + 2 = 5', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadCore()
    if (!load.ok) {
      attempt(run, i++, absenceCounterexample('P-STORE-CORE-11', load.error))
    } else {
      const { api, references } = load
      // RE-AIMED (RED-SET-REPAIR row 11): constraints are CALLER-SUPPLIED
      // GraphConstraint[] passed AT CONSTRUCTION — {id, matchedSet, evaluatedOn,
      // constraint, repair?}; `matchedSet` names the operation's own top-level name;
      // the write machinery calls `constraint(changed, current, next, feedback?)` and
      // an optional `repair(next, feedback?)` whose corrective action lands IN THE
      // SAME COMMITTED WRITE. There is NO runtime `store.constraints.register(...)`
      // API; `store.constraints` is the read-only identity view of the supplied array.
      const declarations = references.storeGraphReferences([{ name: 'settings' }])

      // ⟨drive 1⟩ the call/identity arm — the passed constraint FUNCTION is held by
      // identity and EVALUATED on its declared events (a call-recording counter rises
      // across a commit); `store.constraints` IS the supplied array (identity, never a
      // copy, never a re-created authority)
      const calls = { n: 0 }
      const supplied = [
        {
          id: 'r11-count',
          matchedSet: 'settings',
          evaluatedOn: ['commit'],
          constraint: (changed: unknown, current: unknown, next: unknown, feedback?: { reason?: string; message?: string }): boolean => {
            void changed
            void current
            void next
            void feedback
            calls.n++
            return true
          },
        },
      ]
      const store1 = asStore(api.createGraphStore({ declarations, crossing: null, constraints: supplied }))
      const view = store1.constraints as unknown
      const viewIsIdentity = Array.isArray(view) && (view as unknown[]).length === supplied.length && (view as unknown[])[0] === supplied[0]
      const commitReceipt = store1.commit('mem.settings.r11.a', 'v1') as ReceiptLike
      attempt(
        run,
        i++,
        commitReceipt.status === 'committed' && calls.n >= 1 && viewIsIdentity
          ? null
          : `the passed-constraint surface diverged: commit = ${JSON.stringify(commitReceipt)}, constraint calls ${calls.n}, store.constraints is the supplied array by identity ${viewIsIdentity} — a constraint must be a PASSED function held by identity and evaluated on its declared events (a re-created authority is a falsifier)`,
      )

      // ⟨drive 2⟩ the refusal arm — a failing constraint refuses by ITS OWN token
      // (feedback.reason) as a RETURNED receipt — never a throw, never a silent no-op;
      // the journal rolls the write back byte-exactly (the refused name still answers
      // absent)
      const refusalConstraint = [
        {
          id: 'r11-refuse',
          matchedSet: 'settings',
          evaluatedOn: ['commit'],
          constraint: (_changed: unknown, _current: unknown, _next: unknown, feedback?: { reason?: string; message?: string }): boolean => {
            if (feedback !== undefined) feedback.reason = 'r11-token'
            return false
          },
        },
      ]
      const store2 = asStore(api.createGraphStore({ declarations, crossing: null, constraints: refusalConstraint }))
      const refused = store2.commit('mem.settings.r11.b', 'v2') as ReceiptLike
      const afterRefusal = store2.resolve('mem.settings.r11.b') as Record<string, unknown>
      attempt(
        run,
        i++,
        refusalOf(refused, 'r11-token') === null && afterRefusal.found === false
          ? null
          : `the failing constraint did not refuse by ITS OWN token: ${JSON.stringify(refused)}; post-refusal resolve ${JSON.stringify(afterRefusal)} — a failing constraint refuses by its own feedback token, never a silent no-op, store byte-unchanged`,
      )

      // ⟨drive 3⟩ the repair arm — a violation WITH a passed `repair` lands the
      // corrective action IN THE SAME COMMITTED WRITE: the repaired member is named in
      // the receipt's repaired[], becomes a REAL leaf in the graph, and fires its own
      // 'repair'-cause event
      const repairConstraint = [
        {
          id: 'r11-repair',
          matchedSet: 'settings',
          evaluatedOn: ['commit'],
          constraint: (): boolean => false,
          repair: (next: unknown, feedback?: { reason?: string; message?: string }): boolean => {
            void feedback
            const record = next as Record<string, unknown>
            record['r11f'] = 'F'
            return true
          },
        },
      ]
      const store3 = asStore(api.createGraphStore({ declarations, crossing: null, constraints: repairConstraint }))
      const repairEvents: unknown[] = []
      store3.subscribe('mem.settings.r11f', (ev) => repairEvents.push(ev))
      const repaired = store3.commit('mem.settings.r11.a2', 'v3') as ReceiptLike
      const repairedLeaf = store3.resolve('mem.settings.r11f') as Record<string, unknown>
      const repairCaused = (repairEvents as Array<{ cause?: unknown }>).some((ev) => ev.cause === 'repair')
      attempt(
        run,
        i++,
        repaired.status === 'committed' &&
          Array.isArray(repaired.repaired) &&
          (repaired.repaired as string[]).includes('mem.settings.r11f') &&
          repairedLeaf.found === true &&
          repairedLeaf.value === 'F' &&
          repairCaused
          ? null
          : `the repair arm diverged: receipt ${JSON.stringify(repaired)}, repaired leaf ${JSON.stringify(repairedLeaf)}, 'repair'-cause event seen ${repairCaused} — a violation with a repair lands the corrective action in the SAME committed write, named in repaired[]`,
      )

      // ---- the TWO CONTROLS (each expected outcome is the OPPOSITE of the row's verdict) ----
      attempt(
        run,
        i++,
        ((): string | null => {
          // the identity limb's DISCRIMINATION: the passed function object is the row's
          // ONE authority — a surface whose evaluator is a DIFFERENT function object is a
          // second authority and must be FLAGGED
          const passed = (): { refused: boolean } => ({ refused: false })
          const surface = { evaluate: passed }
          const secondAuthority = { evaluate: (): { refused: boolean } => ({ refused: false }) }
          const identityHolds = surface.evaluate === passed
          const flagsSecond = secondAuthority.evaluate !== passed
          return identityHolds && flagsSecond
            ? null
            : 'CONTROL 1 could not discriminate: the identity limb failed — the passed function must be held by identity (===) and a different evaluator object must be flagged'
        })(),
      )
      attempt(
        run,
        i++,
        ((): string | null => {
          // the silent-no-op oracle: a surface that SWALLOWS a failing constraint and
          // commits anyway must be FLAGGED — the oracle is driven over a forged
          // committed record
          const flag = silentNoOpOracle(() => ({ status: 'committed', name: 'mem.settings.r11.b', crossings: 0 }), 'mem.settings.r11.b')
          return flag === null
            ? 'CONTROL 2 could not discriminate: the no-op oracle ACCEPTED a surface that swallows a failing constraint and commits anyway'
            : null
        })(),
      )
    }
    finish('P-STORE-CORE-11', run)
  }, 10_000)
})

/** The silent-no-op oracle (row 11's control 2) — a failing constraint that is SWALLOWED
 *  (the write commits anyway) is a falsifier: the own-token refusal must never be a
 *  silent no-op. */
function silentNoOpOracle(commit: (name: string) => unknown, name: string): string | null {
  const rec = commit(name) as ReceiptLike
  if (rec.status === 'committed') return 'a failing constraint was SWALLOWED: the refused write committed anyway — a silent no-op is a falsifier'
  return null
}

// ---------------------------------------------------------------------------
// P-STORE-CORE-H — [H] the getWiredGraphStore seam
//   Node-realm lazy construction (first read builds; construction is TOTAL; clean with
//   crossing: null — never throws) and identity-stable across repeated reads (ONE
//   store per realm); the gauge imports src/renderer/renderer.js in the node realm;
//   the BYTE-SCAN construction-site pin is the second leg (the realm binding, the
//   builder, the export, the call at the Runtime construction site BEFORE the
//   `if (!bridge)` early-return, the literals, and zero `hydrate(` calls in the boot
//   wiring).
//   3 + 1 + 2 = 6.
// ---------------------------------------------------------------------------
describe('STORE-CORE-ADOPT §5 P-STORE-CORE-H — [H] the getWiredGraphStore seam: node-realm lazy construction, identity-stable across repeated reads, TOTAL and clean with crossing: null; the byte-scan construction-site pin (strat:store-core-seam-node-realm-identity)', () => {
  it('P-STORE-CORE-H — 3 + 1 + 2 = 6', async () => {
    const run = newRun()
    let i = 0
    const load = await tryLoadSeam()

    if (!load.ok) {
      attempt(run, i++, `seam-absent [P-STORE-CORE-H]: ${load.error} — the node-realm drives are abandoned and REPORTED (never reduced); the byte-scan still runs below`)
    } else {
      // ⟨drive 1⟩ the node-realm gauge: export present, construction TOTAL + CLEAN with
      // crossing: null (never throws), and the result is a GraphStore-shaped object
      let first: unknown = null
      let buildError: string | null = null
      try {
        first = load.getWiredGraphStore({ declarations: load.references.storeGraphReferences([{ name: 'settings' }]), crossing: null })
      } catch (e) {
        buildError = (e as Error).message
      }
      attempt(
        run,
        i++,
        buildError === null && first !== null && typeof asStore(first).resolve === 'function'
          ? null
          : `the node-realm first read must build TOTAL and CLEAN with crossing: null (never throws): ${buildError ?? `the first read yielded ${String(first)}`}`,
      )

      // ⟨drive 2⟩ identity-stable across repeated reads — ONE store per realm
      const second = load.getWiredGraphStore()
      const third = load.getWiredGraphStore({})
      attempt(run, i++, second === first && third === first ? null : 'the seam is NOT identity-stable: repeated reads in one realm must return the ONE boot-constructed store (two different identities are a falsifier)')

      // ⟨drive 3⟩ the export's node-realm provenance — the import itself resolved (drive
      // 1 already proved it); the same identity also serves the no-options read
      attempt(run, i++, typeof load.getWiredGraphStore === 'function' ? null : 'getWiredGraphStore is not a function on the node-realm import')
    }

    // ⟨drive 4 (runs even at the red head — the substrate exists)⟩ THE BYTE-SCAN
    // CONSTRUCTION-SITE PIN: renderer.ts must carry the realm binding, the builder, the
    // export, the construction call's literals and its placement BEFORE the no-bridge
    // early-return, the closed declared-roots set, and ZERO `hydrate(` calls
    let rendererText = ''
    try {
      rendererText = readFileSync(RENDERER_PATH, 'utf8')
    } catch (e) {
      rendererText = ''
    }
    const pinProblems: string[] = []
    if (rendererText === '') {
      pinProblems.push(`ABSTRACT-SUBJECT: src/renderer/renderer.ts could not be read — the byte-scan pin has no substrate`)
    } else {
      const required: Array<[string, string]> = [
        ['wiredGraphStore', 'the realm binding `let wiredGraphStore: GraphStore | null = null`'],
        ['buildWiredGraphStore', 'the builder `buildWiredGraphStore(options?)`'],
        ['getWiredGraphStore', 'the export `export function getWiredGraphStore(options?)`'],
        ['storeGraphReferences(FILE_TIER_TOP_NAMES_FORK)', 'the construction call\'s declaration feed'],
        // ⟨C-1 AMENDMENT `A-2` — 2026-10-04, unit `U-STORE-PERSIST-ADOPT` (core; unit 2 of the
        //  store-adoption program, F2) — DATED ANNOTATE-BESIDE + LITERAL RE-STATEMENT; the pin is
        //  unit 1's own landed act and this unit is the pre-recorded subject of its supersession
        //  (`docs/specs/unit-store-persist-adopt.md` §10 `A-2`; `C-3`; §2.3's MEMOIZATION CLAUSE;
        //  the F1 member-7a precedent).
        //
        //  THE SUPERSEDED LITERAL, KEPT VISIBLE AND NEVER DELETED (as filed):
        //
        //      ['crossing: null', 'the construction call\'s crossing feed (R-5: a feed other than
        //       null is PERSIST\'s edit)'],
        //
        //  WHY IT IS SUPERSEDED: `crossing: null` is UNIT 1's inert seam (the `file.*` surface
        //  CLOSED, no boot hydration). `U-STORE-PERSIST-ADOPT` owns exactly this edit — the live
        //  crossing REPLACED at the EXISTING construction call, CONDITIONAL on `bridge?.store` —
        //  so at this unit's landed head the superseded literal is ABSENT by construction.
        //
        //  THE RE-STATEMENT (the operative assertion): the construction call's crossing feed is
        //  the LIVE crossing (any readable expression other than the `null` literal), fed at the
        //  EXISTING call site. THE NEW FALSIFIER: the `null` literal still occupying the site —
        //  the memoization clause is the SAME unchanged limb beside it (a SECOND
        //  `getWiredGraphStore(` call still reddens), so REPLACEMENT is asserted, never a
        //  re-call. THE ORDERING LIMB (`if (!bridge)`) AND EVERY OTHER REQUIRED LITERAL ARE
        //  RE-STATED UNCHANGED below, as is the register's arithmetic (78 terms, seed, caps) —
        //  §10's unchanged-limb guarantee.
        ["FILE_TIER_TOP_NAMES_FORK = [{ name: 'settings' }]", 'the closed declared-roots set (D-4, F-5)'],
      ]
      for (const [literal, label] of required) {
        if (!rendererText.includes(literal)) pinProblems.push(`BYTE-SCAN-PIN: ${label} — the literal \`${literal}\` is ABSENT from src/renderer/renderer.ts at this head`)
      }
      // ⟨C-1 AMENDMENT `A-2`⟩ the crossing feed, RE-STATED: the construction call's `crossing:`
      // argument must be a readable expression that is NOT the superseded `null` literal.
      const crossingFeed = rendererText.match(/getWiredGraphStore\(\{[\s\S]{0,400}?crossing:\s*([A-Za-z_$][\w$.?]*|null)/)
      if (crossingFeed === null) {
        pinProblems.push(`BYTE-SCAN-PIN: the construction call carries no readable \`crossing:\` feed — the amended limb (C-1 amendment \`A-2\`) requires the LIVE crossing at the EXISTING call site (§2.3)`)
      } else if (crossingFeed[1] === 'null') {
        pinProblems.push(`BYTE-SCAN-PIN: the construction call's crossing is still the superseded \`crossing: null\` literal (C-1 amendment \`A-2\`: the live crossing REPLACES it at the EXISTING call site — §2.3's memoization clause forbids a second call)`)
      }
      const callAt = rendererText.indexOf('getWiredGraphStore({')
      const bridgeAt = rendererText.indexOf('if (!bridge)')
      if (callAt < 0) pinProblems.push('BYTE-SCAN-PIN: no `getWiredGraphStore({` construction call exists in the boot wiring (F-4)')
      else if (bridgeAt < 0) pinProblems.push('BYTE-SCAN-PIN: the `if (!bridge)` early-return is not found — the order limb has no upper bound')
      else if (callAt > bridgeAt) pinProblems.push('BYTE-SCAN-PIN: the construction call sits AFTER the no-bridge early-return — the call site must be BEFORE it (duty (d), F-4)')
      // ⟨C-1 AMENDMENT `A-2`⟩ the hydrate limb, RE-STATED: unit 1's superseded zero-match
      // reading ("unit 1 calls hydrate NOWHERE (R-5, F-7)") becomes EXACTLY ONE call — this
      // unit's own boot-order call. THE FALSIFIERS: ZERO calls, TWO OR MORE calls.
      const hydrateCalls = [...rendererText.matchAll(/\bhydrate\(/g)]
      if (hydrateCalls.length !== 1) {
        pinProblems.push(
          `BYTE-SCAN-PIN: ${hydrateCalls.length} \`hydrate(\` call(s) in the boot wiring — the amended limb (C-1 amendment \`A-2\`) declares EXACTLY ONE (unit 1's superseded zero-match reading is kept visible above; F-7)`,
        )
      }
    }
    attempt(run, i++, pinProblems.length === 0 ? null : `the construction-site pin failed at this head: ${pinProblems.join(' | ')}`)

    // ---- the TWO CONTROLS (opposite expected outcomes) ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = { a: { id: 1 }, b: { id: 2 } } // two identities in one realm
        return forged.a === forged.b
          ? 'CONTROL 1 could not discriminate: the identity oracle ACCEPTED a realm with two different identities'
          : null
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forgedWiring = 'function main() { hydrate(rows); }'
        const hits = [...forgedWiring.matchAll(/\bhydrate\(/g)]
        return hits.length === 0 ? 'CONTROL 2 could not discriminate: the hydrate oracle ACCEPTED a boot wiring calling hydrate(' : null
      })(),
    )

    finish('P-STORE-CORE-H', run)
  }, 12_000)
})

// ===========================================================================
// §5 — THE ARITHMETIC PRINTED WITH ITS TERMS, THE CAPS, THE RED-HEAD COLOURS, AND
// THE REGISTER REPORT. `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: a total that is
// not the sum of its own terms, or a total quoted without its terms, is a review
// finding.
// ===========================================================================
const TOTAL_SOURCE = DECLARED_REGISTER.map((r) => `${r.row}: ${r.declared} = ${r.declaredTotal}`)
const REGISTER_TOTAL = DECLARED_REGISTER.reduce((a, r) => a + r.declaredTotal, 0)

describe('STORE-CORE-ADOPT §5 — the register arithmetic, the caps, the red-head colours and the register report', () => {
  it('§5 tally — the twelve rows are authored in register order, each ≤100, the total 5 + 8 + 10 + 6 + 8 + 6 + 6 + 6 + 6 + 6 + 5 + 6 = 78 ≤ 400, every term printed as the sum of its own factors', () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order').toEqual([
      'P-STORE-CORE-1',
      'P-STORE-CORE-2',
      'P-STORE-CORE-3',
      'P-STORE-CORE-4',
      'P-STORE-CORE-5',
      'P-STORE-CORE-6',
      'P-STORE-CORE-7',
      'P-STORE-CORE-8',
      'P-STORE-CORE-9',
      'P-STORE-CORE-10',
      'P-STORE-CORE-11',
      'P-STORE-CORE-H',
    ])
    expect(DECLARED_REGISTER.length, 'the register is EXACTLY twelve rows — §5\'s P-STORE-CORE-1..11 [T] + P-STORE-CORE-H [H]').toBe(12)
    for (const row of DECLARED_REGISTER) {
      expect(row.declaredTotal, `${row.row} must be ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    expect(TOTAL_SOURCE, '§5: the per-row terms, printed as the sum of their own factors').toEqual([
      'P-STORE-CORE-1: 3 + 2 = 5',
      'P-STORE-CORE-2: 6 + 2 = 8',
      'P-STORE-CORE-3: 8 + 2 = 10',
      'P-STORE-CORE-4: 4 + 2 = 6',
      'P-STORE-CORE-5: 6 + 2 = 8',
      'P-STORE-CORE-6: 4 + 2 = 6',
      'P-STORE-CORE-7: 4 + 2 = 6',
      'P-STORE-CORE-8: 4 + 2 = 6',
      'P-STORE-CORE-9: 4 + 2 = 6',
      'P-STORE-CORE-10: 4 + 2 = 6',
      'P-STORE-CORE-11: 3 + 2 = 5',
      'P-STORE-CORE-H: 3 + 1 + 2 = 6',
    ])
    expect(REGISTER_TOTAL, '§5\'s attempt tally, printed with its terms: 5 + 8 + 10 + 6 + 8 + 6 + 6 + 6 + 6 + 6 + 5 + 6 = 78').toBe(78)
    expect(REGISTER_TOTAL, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
    for (const row of DECLARED_REGISTER) {
      expect(row.redHeadColour, `${row.row}: the red-head colour is recorded per §4 R-2/R-3 — every row is RED at the unit's own head`).toMatch(/^RED /)
      expect(row.layer, `${row.row}: the layer marker is [T] for the machine rows and [H] for the seam row`).toMatch(/^\[[TH]\]$/)
    }
    expect(DECLARED_REGISTER.filter((r) => r.layer === '[T]').length, '§5: eleven [T] rows').toBe(11)
    expect(DECLARED_REGISTER.filter((r) => r.layer === '[H]').length, '§5: one [H] row').toBe(1)
  })

  it('§5 — the register\'s OWN caps and stop rule are contract-anchored: the bounded §5 region of docs/specs/unit-store-core-adopt.md still declares seed 0x20261004, ≤100 attempts per row, ≤400 in total, STOP AFTER 5 CONSECUTIVE FAILURES, and every row id', () => {
    const spec = readFileSync(SPEC_PATH, 'utf8')
    const start = spec.indexOf('## 5. The typed Property register')
    const end = spec.indexOf('## 6. The layer ledger', start + 1)
    expect(start, '§5: the contract\'s anchored §5 region must exist').toBeGreaterThanOrEqual(0)
    expect(end, '§5: the region must have its upper bound at §6').toBeGreaterThan(start)
    const region = spec.slice(start, end)
    expect(region, '§5: the region pins the seed 0x20261004').toMatch(/0x20261004/)
    expect(region, '§5: the region declares the per-row cap').toMatch(/≤100[\s\S]{0,8}?attempts per row/)
    expect(region, '§5: the region declares the total cap').toMatch(/≤400[\s\S]{0,8}?in total/)
    expect(region, '§5: the region declares the STOP rule').toMatch(/STOP AFTER 5[\s\S]{0,80}?consecutive failures/i)
    for (const row of DECLARED_REGISTER) {
      expect(region, `§5: the anchored region declares the row id \`${row.row}\``).toContain(row.row)
    }
  })

  it('§4 — the red-set colours are contract-anchored: the bounded §4 region declares R-1/R-1a (the guard\'s arms) and the module-does-not-exist class for the register\'s rows', () => {
    const spec = readFileSync(SPEC_PATH, 'utf8')
    const start = spec.indexOf('## 4. The red set')
    const end = spec.indexOf('## 5. The typed Property register', start + 1)
    expect(start, '§4: the contract\'s anchored §4 region must exist').toBeGreaterThanOrEqual(0)
    expect(end, '§4: the region must have its upper bound at §5').toBeGreaterThan(start)
    const region = spec.slice(start, end)
    expect(region, '§4: the region records the module-does-not-exist class').toMatch(/module-does-not-exist/)
    expect(region, '§4: the region records the register rows\' red class by name').toMatch(/P-STORE-CORE-1\.\.11/)
  })

  it('§5 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term, its stoppedAt and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(missing, 'every declared register row must have RUN and reported — a row or term dropped is a LOUD failure, never a vacuous pass').toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · counterexamples ${r.counterexamples.length}` +
        ` · limbs ${r.limbs.map((l) => `${l.index}:${l.held ? 'held' : 'BROKEN'}`).join(',')}` +
        (r.counterexamples.length > 0 ? ` · ${r.counterexamples.slice(0, 3).join(' | ')}` : ''),
    )
    // eslint-disable-next-line no-console
    console.log('STORE-CORE-ADOPT REGISTER REPORT\n' + lines.join('\n'))
    expect(REPORTS.length, 'all twelve rows reported').toBe(12)
    // THE DECLARED TERMS ARE NEVER REDUCED: the planned total reads each row's DECLARED
    // term even when a row was abandoned mid-run (executed < declared)
    const planned = REPORTS.reduce((a, r) => a + (r.executed < r.declaredTotal ? r.declaredTotal : r.executed), 0)
    expect(planned, 'the PLANNED total must equal the declared 78 — a row that STOP-AFTER-5 abandons reports the abandonment and its declared term is NOT reduced').toBe(78)
    for (const r of REPORTS) {
      const declared = DECLARED_REGISTER.find((d) => d.row === r.row)!
      expect(r.declared, `${r.row}: the report prints the DECLARED term, never a reduced one`).toBe(declared.declared)
      expect(r.declaredTotal, `${r.row}: the report prints the DECLARED total`).toBe(declared.declaredTotal)
      expect(r.strategyId, `${r.row}: the report carries the row's strategy id`).toBe(declared.strategyId)
    }
  })

  it('§5 — this file mocks NOTHING and binds no vitest mock API, and its imports are `vitest` + the three `node:*` builtins alone (node:fs · node:path · node:url)', () => {
    const self = readFileSync(SELF_PATH, 'utf8')
    const importBlock = self.split(/^const /m)[0]!
    const imports = [...importBlock.matchAll(/^\s*import\b[^'\n]*from\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]!)
    expect(imports.length, 'the file carries import statements — a census that reads ZERO imports has lost its subject').toBeGreaterThan(0)
    expect([...new Set(imports)].sort(), 'the file carries EXACTLY the declared import set: `vitest` + node:fs + node:path + node:url — and NOTHING else').toEqual(['node:fs', 'node:path', 'node:url', 'vitest'])
    for (const spec of imports) {
      expect(spec === 'vitest' || spec.startsWith('node:'), '§5: this file imports only `vitest` and `node:*` builtins').toBe(true)
    }
    const mockApis = ['vi' + '.mock', 'vi' + '.doMock', 'vi' + '.hoisted', 'vi' + '.stubGlobal', 'vi' + '.spyOn']
    for (const api of mockApis) {
      expect(self.includes(api), '§5: this file must bind no vitest mock API in any form').toBe(false)
    }
    expect(self.includes(`'${['electron', '-mock'].join('')}'`), '§5: this file imports no electron mock').toBe(false)
  })

  it('§4\'s shared machinery — the pinned seed drives a hand-rolled 32-bit LCG (one step per draw, `stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`, `index = stateₙ₊₁ mod pool.length`)', () => {
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
    expect(draws(REGISTER_SEED, 10, 6), '§5: the LCG\'s draws are DETERMINISTIC — the pinned seed yields this exact sequence, one step per draw, no clock, no environment read').toEqual(draws(REGISTER_SEED, 10, 6))
    let state = REGISTER_SEED
    for (let k = 0; k < 3; k++) {
      const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
      expect(next, '§5: one step is `stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`').toBe(lcgDraw(state, 1).state)
      state = next
    }
    expect(draws(REGISTER_SEED + 1, 10, 2), '§5: a different seed yields a different sequence (the seed is load-bearing)').not.toEqual(draws(REGISTER_SEED, 10, 2))
  })
})