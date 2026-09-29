// tests/pd-ui-6-modal-state-register.test.ts — unit `PD-UI-6` (THE SETTINGS-MODAL /
// OVERLAY ADOPTION, wave `W1`): the `§4` TYPED PROPERTY REGISTER — all EIGHT rows,
// `P-MD-IM-1` · `P-MD-IM-2` · `P-MD-SM-1` · `P-MD-SM-2` · `P-MD-TP-1` · `P-MD-TP-2` ·
// `P-MD-SM-3` · `P-MD-SM-4`, each with its DECLARED TERMS printed, its control driven, and
// its `held`/`broken` verdict reported with its strategy id.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-pd-ui-6-modal-state.md
//     §4            the eight rows, their property texts, their domains, their declared
//                   attempt terms and the shared machinery (seed, caps, stop-after-5,
//                   control reporting, the class meanings, the two `(bounded)` carve-outs)
//     §4 tally      191 = 32+3 + 15+5 + 14+3 + 20+4+3 + 46+4 + 25+3 + 5+3 + 6+3, printed
//                   with its terms; ≤100/row and ≤400 total; STOP AFTER 5 CONSECUTIVE FAILURES.
//                   ⟨AMENDED 2026-09-29 (finding `A-1` (iii); the disposal is at `§0C` item 1 and the
//                   arithmetic at `§0C` item 11) — annotate-beside, the AS-FILED total is KEPT
//                   VISIBLE here: it read `187 = … + 46+4 + 18+3 + 5+3 + 6+3`. `P-MD-TP-2`'s term is
//                   the ONE term the amendment moves (`18 → 22`, row `21 → 25`, total `187 → 191`)
//                   because the as-filed `12` drives were 2 distinct drives repeated 4× (a boolean
//                   `initialOpen` collapses an injected body to `'closed'`) and the fabricated-body
//                   drive bypassed the adapter. EVERY OTHER ROW'S TERM IS UNMOVED, no row id
//                   changed, and the total is still ≤ the 400 cap.⟩
//     §0C item 11  the ONE moved term and the re-derived arithmetic (`22 + 3 = 25`, `191`)
//     §4 ADAPTER-ROUTE REQUIREMENT (2026-09-29, finding `A-1`) — a row whose text claims the
//                   ADAPTER's own route MUST drive the adapter (the recording-stub route) and MUST
//                   NOT satisfy the claim by calling the vendored mechanism directly
//     §4 CONTROL RULE (restated, finding `A-2`) — a control MUST be able to FAIL for a corpus that
//                   SATISFIES the row, and its SUBJECT MUST be the row's own instrument
//     §0C item 6    THE STRONGEST FALSE-GREEN, which the exposure drives below close: an
//                   implementation that RECOMPUTES the write guard from `isOpen()` instead of
//                   reading the adopted record's `changed` passes every landed row — the
//                   DISCRIMINATING assertion is the WRITE COUNT, not the class
//     §2.3 item 3   the `4 × 5 = 20` matrix (the domain `P-MD-TP-1` quantifies over)
//     §2.3 item 5   the reachable set is TWO; `'held'`/`'closing'` are NEVER entered (which is
//                   why `P-MD-SM-2`'s `4` injected drives come from TWO unreachable bodies and
//                   carry the `(bounded)` carve-out — `§0B` item 2 / finding `R2`)
//     §0B item 2    the `R2` ruling: `P-MD-SM-2`'s injected-drive count is `FOUR` (the authoritative
//                   arithmetic `20 + 4 + 3 = 27`, total `187` — both UNMOVED); the EIGHT wording is
//                   a DOCUMENTATION DEFECT and is re-stated here, never re-arithmetic to `31`
//     §2.4          the `changed`-driven guard and its equivalence to the landed `settle` guard
//     §2.5          the ESCAPE CONTRACT: the callback arm, the invocation schedule
//     §3.1 item 13  the DECLARED PAIR, never the printed equation (`G-8`)
//     §3.4/§3.6/§6.4 the pin-safety classes and the `[T]`-side obligations
//
// ROW-ID DISCIPLINE (`C-5`, binding): every row here is `P-MD-*` — never a bare
// `P-IM-`/`P-SM-`/`P-TP-`, never the foundation's `P-OV-*`; every strategy id is
// `strat:pd-ui-6-*` — never the fork's `strat:modal-*`, never the foundation's `S-OV-*`.
//
// LAYER (`RCA-12`): `[T]` / node-pure and source-text. NOTHING here is app-green; no row is
// a live row, and the register claims no rendered/painted behaviour.
//
// RED-FIRST (`RCA-1`): the rows whose subject is the ADOPTED discipline red at this head with
// the contract text they require. The rows whose subject the unit KEEPS (the class mirror's
// three properties, the vendored-and-kept-half's re-parent limb, the pin-safety classes) read
// the CURRENT tree and are green-on-arrival — they are the unit's REGRESSION GUARD, and a
// landing that deletes the kept half reds them.
//
// `G-9`/`X-9` PIN SAFETY: this file binds NO vitest mock API in any form (the protected
// electron census is a `toEqual` of five names and the non-`'electron'` binder list a `toEqual`
// of four paths — neither may move), and it writes no pinned byte.
import { describe, it, expect, beforeEach } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { installShim, shimDocument, ShimElement } from '../src/shared/dom-shim.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const MODAL_PATH = join(REPO_ROOT, 'src', 'renderer', 'modal-state.ts')
const VENDORED_PATH = join(REPO_ROOT, 'src', 'shared', 'overlay.ts')
const MANIFEST_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const SET_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-vendor-set.test.ts')
const INDEX_HTML_PATH = join(REPO_ROOT, 'src', 'renderer', 'index.html')

function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {
    throw new Error(`PD-UI-6 [T] read failure: ${path} — ${(e as Error).message}`)
  }
}

// ===========================================================================
// §4 — SHARED MACHINERY, pinned once and binding on every row.
//
// Seed `0x55E11E77` (the fork's "SHELL"-family seed, REUSED and DECLARED rather than
// assumed) with `mulberry32`; ≤100 attempts per row; ≤400 in total; rows run sequentially
// in register order; STOP AFTER 5 CONSECUTIVE FAILURES (the running row's remaining
// attempts are abandoned; no further row starts). Never `Date.now()`, never `Math.random()`,
// never an environment read, no PBT library, no new dependency.
// ===========================================================================
const REGISTER_SEED = 0x55e11e77
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

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

interface RowReport {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors */
  declared: string
  declaredTotal: number
  /** the EXECUTED term */
  executed: number
  held: boolean
  stoppedAt: number | null
  counterexamples: string[]
  bounded: string | null
}

const REPORTS: RowReport[] = []
let consecutiveFailures = 0

/** The declared register, in register order, with each row's terms printed as the sum of
 *  its own factors (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`). */
const DECLARED_REGISTER: Array<{ row: string; strategyId: string; declared: string; declaredTotal: number; bounded: string | null }> = [
  { row: 'P-MD-IM-1', strategyId: 'strat:pd-ui-6-totality', declared: '32 + 3', declaredTotal: 35, bounded: null },
  { row: 'P-MD-IM-2', strategyId: 'strat:pd-ui-6-callback', declared: '15 + 5', declaredTotal: 20, bounded: null },
  { row: 'P-MD-SM-1', strategyId: 'strat:pd-ui-6-class-mirror', declared: '14 + 3', declaredTotal: 17, bounded: null },
  // ⟨CORRECTED 2026-09-28 (finding `R2`; the ruling is at `§0B` item 2) — annotate-beside, nothing
  // deleted: AS FILED this entry's `bounded` string read `'ON THE EIGHT INJECTED DRIVES'`, and
  // that wording is a DOCUMENTATION DEFECT. THE ARITHMETIC IS AUTHORITATIVE AND UNMOVED: `20`
  // cells × `1` paired comparison = `20`; plus `4` injected-unreachable-body drives (`'held'`,
  // `'closing'` × open/escape) = `4`; plus `3` controls ⇒ `27`. The count is NOT re-arithmetic to
  // `31` — no eighth drive exists to declare — and the declared total `187` does not move either.
  // This string is PRINTED into each row report line below, so it must no longer assert EIGHT.⟩
  { row: 'P-MD-SM-2', strategyId: 'strat:pd-ui-6-changed-equivalence', declared: '20 + 4 + 3', declaredTotal: 27, bounded: 'ON THE FOUR INJECTED DRIVES' },
  { row: 'P-MD-TP-1', strategyId: 'strat:pd-ui-6-matrix', declared: '46 + 4', declaredTotal: 50, bounded: null },
  // ⟨AMENDED 2026-09-29 (finding `A-1` (iii); the disposal is at `§0C` item 1, the arithmetic at
  // `§0C` item 11) — annotate-beside, the AS-FILED term is KEPT VISIBLE: this entry read
  // `declared: '18 + 3', declaredTotal: 21`. It is the ONE TERM the amendment moves (`18 → 22`,
  // row `21 → 25`, total `187 → 191`), because the as-filed `12` were 2 distinct drives repeated
  // 4× — a boolean `initialOpen` collapses the injected `'held'`/`'closing'` word to `'closed'` —
  // and the row's only fabricate-the-body drive BYPASSED THE ADAPTER. The `+4` is the four NEW
  // DISTINCT injected-body drives (the 2 methods that have an injected-body cell × the 2 injected
  // bodies, each reporting its own declared matrix cell THROUGH the stub); nothing is removed and
  // the reachable pair, the four verb-identity checks and the two injected-body drives survive.⟩
  { row: 'P-MD-TP-2', strategyId: 'strat:pd-ui-6-verb-discipline', declared: '22 + 3', declaredTotal: 25, bounded: null },
  { row: 'P-MD-SM-3', strategyId: 'strat:pd-ui-6-vendored-and-kept-half', declared: '5 + 3', declaredTotal: 8, bounded: 'ON (e)' },
  { row: 'P-MD-SM-4', strategyId: 'strat:pd-ui-6-pin-safety', declared: '6 + 3', declaredTotal: 9, bounded: null },
]

/**
 * A register row's bounded attempt loop. `check(i)` returns a counterexample string, or
 * `null` when the attempt held. The attempt is ALWAYS counted; the loop abandons the
 * row's remaining attempts once `STOP_AFTER` CONSECUTIVE failures have been seen, and sets
 * `registerStoppedAt` so the abandonment is reported rather than hidden.
 */
interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null }
}

function attempt(run: RowRun, i: number, ce: string | null): void {
  // the running row's remaining attempts are ABANDONED once 5 CONSECUTIVE failures have
  // been seen — the abandonment is REPORTED through `stoppedAt`, never hidden
  if (run.stoppedAt !== null) return
  if (run.attempts >= CAPS.perRow) return
  run.attempts++
  if (ce === null) {
    run.consecutive = 0
    return
  }
  run.consecutive++
  run.counterexamples.push(ce)
  if (run.consecutive >= STOP_AFTER && run.stoppedAt === null) {
    run.stoppedAt = i
    consecutiveFailures += STOP_AFTER
  }
}

function finish(
  id: string,
  run: RowRun,
  executedDeclared: number,
  opts: { note?: string } = {},
): { held: boolean } {
  void executedDeclared // the DECLARED total is printed from the table below; the EXECUTED
  // count is read from the run, so an aborted row can never report a figure it did not take
  const executed = run.attempts
  const declared = DECLARED_REGISTER.find((r) => r.row === id)!
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
  }
  REPORTS.push(report)
  const terms =
    `${report.row} ${report.strategyId}: declared ${report.declared} = ${report.declaredTotal} attempt(s); ` +
    `executed ${executed}; STOP-AFTER-5 abandoned at attempt ${String(report.stoppedAt)}${opts.note !== undefined ? `; ${opts.note}` : ''}`
  expect(
    report.held,
    `${terms} — ${report.held ? 'HELD' : 'BROKEN'}` +
      (report.counterexamples.length > 0 ? `; counterexamples: ${report.counterexamples.slice(0, 5).join(' | ')}` : ''),
  ).toBe(true)
  return { held: report.held }
}

// ===========================================================================
// THE ADOPTED SURFACE + THE ADAPTER'S OWN BYTES, compiled with ONLY its single (vendored)
// import declaration replaced by an injected transition function — the instrument that
// makes the callback arm and the verb/state discipline drivable.
// ===========================================================================
type AdoptedBody = 'closed' | 'open' | 'held' | 'closing'
type AdoptedRecord = { state: AdoptedBody; changed: boolean }
type TransitionFn = (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord

let vendoredLoaded = false

/** The adopted surface, loaded ONCE (lazily — the register's rows are the only callers, and
 *  a module-level `await` would make this file's own parse order load-bearing). */
async function adopted(): Promise<{ transition: TransitionFn, declare: (t: unknown, n: unknown, i: unknown) => { name: string | null, value: unknown, removal: unknown, target: unknown } }> {
  const mod = (await import(/* @vite-ignore */ pathToFileURL(VENDORED_PATH).href)) as Record<string, unknown>
  vendoredLoaded = true
  const transition = mod.overlayTransition
  if (typeof transition !== 'function') {
    throw new Error(
      `PD-UI-6 contract failure [§2.1]: the vendored module ${VENDORED_PATH} must export \`overlayTransition(state, verb, callback?)\` — the adopted DECISION half this register quantifies over`,
    )
  }
  return {
    transition: transition as TransitionFn,
    declare: mod.overlayInertDeclaration as (t: unknown, n: unknown, i: unknown) => { name: string | null, value: unknown, removal: unknown, target: unknown },
  }
}

/** The synchronous handle the rows use, after `adopted()` has resolved. */
let overlayTransition: TransitionFn = (() => {
  throw new Error('PD-UI-6 register failure: `adopted()` must be awaited before a row drives the mechanism')
}) as unknown as TransitionFn
let overlayInertDeclaration: (t: unknown, n: unknown, i: unknown) => { name: string | null, value: unknown, removal: unknown, target: unknown } =
  (() => {
    throw new Error('PD-UI-6 register failure: `adopted()` must be awaited before a row drives the declaration')
  }) as unknown as (t: unknown, n: unknown, i: unknown) => { name: string | null, value: unknown, removal: unknown, target: unknown }

async function loadAdopted(): Promise<void> {
  if (vendoredLoaded) return
  const mod = await adopted()
  overlayTransition = mod.transition
  overlayInertDeclaration = mod.declare
}

interface ModalController {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
}
interface CallLog {
  state: unknown
  verb: unknown
  callback: unknown
}
interface Corpus {
  calls: CallLog[]
  createModalController: (options?: unknown) => ModalController
  installSettingsModal: (...args: unknown[]) => void
}

/** `§2.1`'s single vendored edge — the ONE member the corpus substitutes into the adapter. */
const ADOPTED_MEMBER = 'overlayTransition'

/** THE INSTRUMENT'S INJECTED VALUE'S SHAPE (an INSTRUMENT matter, never an assertion).
 *
 *  `instantiateCorpus` substitutes the adapter's single import declaration with a
 *  DESTRUCTURING bind — `const { overlayTransition: overlayTransition } =
 *  __PD_UI_6_TRANSITION__` — exactly the substitution form the sibling unit uses
 *  (`tests/pd-ui-1-theme-adoption.test.ts`: `const { … } = __ADOPTED_STUB__`, fed an
 *  OBJECT `{ resolveTheme, applyThemeDeclaration }`). A destructuring read therefore takes
 *  its members from the value bound to the injected name, so THE VALUE MUST BE AN OBJECT
 *  carrying the imported member under its SOURCE name. Handing in a BARE function — as this
 *  instrument did through the red run — destructures to `undefined` and makes every adapter
 *  call throw `overlayTransition is not a function`: an INSTRUMENT fault that masquerades as
 *  a contract reading (`P-MD-TP-2` read `emitted verb undefined` on every drive for exactly
 *  this reason, and `P-MD-IM-2`'s CONTROL 1 observed no invocation for it).
 *
 *  WHICH SHAPE, AND WHY THIS ONE: the two candidates are (a) an OBJECT-shaped injected value
 *  under the existing destructuring bind, and (b) re-emitting the bind as a single-name
 *  passthrough (`const overlayTransition = __PD_UI_6_TRANSITION__`) fed the bare function.
 *  They are EQUIVALENT for the discrimination this corpus exists for — either way the
 *  substituted member is a caller-supplied function whose returned record may CONTRADICT the
 *  raw arguments (the register's falsifying drives), and the adapter's own bytes decide
 *  everything else. (a) is taken because it is the SIBLING UNIT'S substitution form, needs no
 *  change to the emitted bind, and stays correct about the import's own binding structure: the
 *  object is keyed by the declared SOURCE names, so an aliased import keeps its meaning where a
 *  single-name passthrough would silently misbind it. The member is injected ONLY by its
 *  spec-declared name (`§2.1`: the adapter imports exactly one module and one member), so a
 *  member the corpus cannot honestly supply fails loudly here rather than binding this stub
 *  to it. */
function injectedTransitionValue(named: ts.NamedImports, stub: (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord): Record<string, unknown> {
  const value: Record<string, unknown> = {}
  for (const el of named.elements) {
    const source = (el.propertyName ?? el.name).text
    if (source !== ADOPTED_MEMBER) {
      throw new Error(
        `PD-UI-6 contract failure [§2.1 import census]: the adapter's single import must be the vendored transition edge \`{ ${ADOPTED_MEMBER} }\` — the corpus injects that member by name and no other; it reads \`${source}\``,
      )
    }
    value[source] = stub
  }
  return value
}

function instantiateCorpus(stub: (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord): Corpus {
  const src = readText(MODAL_PATH)
  const sf = ts.createSourceFile('corpus.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const imports = sf.statements.filter(ts.isImportDeclaration)
  if (imports.length !== 1) {
    throw new Error(
      `PD-UI-6 contract failure [§2.1 import census]: src/renderer/modal-state.ts must carry EXACTLY ONE import statement (the vendored edge); the corpus reads ${String(imports.length)}`,
    )
  }
  const decl = imports[0]!
  const named = decl.importClause?.namedBindings
  if (named === undefined || !ts.isNamedImports(named)) {
    throw new Error('PD-UI-6 contract failure [§2.1 import census]: the adapter must import the vendored member by NAMED bindings')
  }
  const bindings = named.elements.map((el) => `${(el.propertyName ?? el.name).text}: ${el.name.text}`)
  const replacement = `const { ${bindings.join(', ')} } = __PD_UI_6_TRANSITION__`
  const transformed = src.slice(0, decl.getStart(sf)) + replacement + src.slice(decl.getEnd())
  const js = ts.transpileModule(transformed, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText
  const mod: { exports: Record<string, unknown> } = { exports: {} }
  new Function('exports', '__PD_UI_6_TRANSITION__', js)(mod.exports, injectedTransitionValue(named, stub))
  const create = mod.exports.createModalController
  if (typeof create !== 'function') {
    throw new Error('PD-UI-6 contract failure [§2.1]: the corpus must export `createModalController(options?)` — the adapter the unit re-expresses over the vendored mechanism')
  }
  return {
    calls: [],
    createModalController: create as (options?: unknown) => ModalController,
    installSettingsModal: (mod.exports.installSettingsModal ?? ((): void => undefined)) as (...args: unknown[]) => void,
  }
}

function recordingCorpus(stub?: (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord): Corpus {
  // ⟨INSTRUMENT DEFECT, CORRECTED 2026-09-29 (`A-1`'s re-derivation pass) — annotate-beside: AS
  // FILED the WIRING stub pushed into `corpus.calls` while `instantiateCorpus` handed the adapter
  // the SEPARATE array it had built (`built.calls`), so the two diverged and an `at(-1)` read could
  // observe an EARLIER call. The drive now hands the adapter the SAME array the returned corpus
  // exposes, so the recorded log is the adapter's own calls in order — an instrument fix inside
  // the rows, no assertion and no declared term touched.⟩
  const calls: CallLog[] = []
  const inner = stub ?? overlayTransition
  const wrapped = (state: unknown, verb: unknown, callback?: unknown): AdoptedRecord => {
    calls.push({ state, verb, callback })
    return inner(state, verb, callback)
  }
  const built = instantiateCorpus(wrapped)
  return { calls, createModalController: built.createModalController, installSettingsModal: built.installSettingsModal }
}

function caught(fn: () => unknown): string | null {
  try {
    fn()
    return null
  } catch (e) {
    return (e as Error)?.message ?? String(e)
  }
}

function voidCall(c: ModalController, m: 'open' | 'close' | 'toggle'): string | null {
  return caught(() => (c as unknown as Record<string, () => unknown>)[m]())
}

/** THE INJECTED RECORD STUB — an INSTRUMENT, never an assertion.
 *
 *  It replaces the adapter's single vendored edge with a caller-supplied function whose
 *  returned record may CONTRADICT the raw `(state, verb)` arguments. That is exactly the
 *  instrument `§0C` item 6's false-green needs: no landed drive can make the adapter's guard
 *  disagree with a RECOMPUTATION, because for the vendored mechanism
 *  `changed === (next !== previous)` always holds.
 *
 *  The adapter's `isOpen()` reads its HELD word (the last returned `state`), so a scripted
 *  stub can drive `isOpen()` and the write guard INDEPENDENTLY — which is how the two
 *  exposure drives below separate a `changed`-reading implementation from an
 *  `isOpen()`-recomputing one. */
interface StubScript {
  /** the record the NEXT invocation returns */
  next: AdoptedRecord
  /** the `(state, verb)` pairs the adapter handed in, in order */
  seen: Array<{ state: unknown; verb: unknown }>
  /** the record the LAST invocation returned (the pair the adapter consumed) */
  answer: AdoptedRecord
  /** set by `recordingCorpus`'s wrapper: the verb the LAST adapter call actually emitted */
  lastVerb?: unknown
}

function scriptedStub(script: StubScript): (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord {
  return (state, verb): AdoptedRecord => {
    script.seen.push({ state, verb })
    script.lastVerb = verb
    script.answer = script.next
    return script.next
  }
}

/** THE ONE-SHOT INJECTION STUB — the register's declared route for a body the fork cannot reach
 *  (`§2.3` item 5): it answers the INJECTED body for the FIRST `'toggle'` it sees (the drive that
 *  establishes the unreachable starting word) and the REAL adopted mechanism afterwards, so every
 *  later drive is the mechanism's own answer THROUGH the adapter. The adapter's word therefore
 *  holds a body it never invented — exactly the clause `P-MD-TP-2` and `P-MD-SM-2` assert. */
function injectedStub(body: AdoptedBody): (state: unknown, verb: unknown, callback?: unknown) => AdoptedRecord {
  let injected = false
  return (state, verb, callback) => {
    if (!injected && verb === 'toggle') {
      injected = true
      return { state: body, changed: false }
    }
    return overlayTransition(state, verb, callback) as AdoptedRecord
  }
}

/** THE REFERENCE FRAME MIRROR: the wiring's class-write instrument, reduced to its contract
 *  (`§2.2` item 6 + `§2.4`). It holds the frame's live token set, one class write per real
 *  transition, and NO write on an idempotent no-op.
 *
 *  WHY THIS INSTRUMENT EXISTS, AND WHY IT IS HONEST: the wiring's own `apply()` path is not
 *  reachable from an injected record in a node test — the wiring builds its controller from
 *  the module's REAL vendored import, there is no seam for a stub, and injecting one would
 *  take the mock-binding form `§6.4` forbids. What IS drivable is the instrument the exposure
 *  drives need in order to discriminate: the wiring's write counter, whose decision can be
 *  swapped. `faithful` reads the ADOPTED RECORD's `changed` member (`§2.4` clause 3);
 *  `recomputing` reproduces the false-green of `§0C` item 6 verbatim — it IGNORES the record
 *  and recomputes the guard from `isOpen()`. Every drive below asserts the WRITE COUNT,
 *  because `§0C` item 6 clause (a) is explicit that the CLASS can come out right by
 *  computation; only the counted writes separate the two implementations. */
class FrameMirrorInstrument {
  tokens: string[]
  writes = 0
  private word: AdoptedBody
  private readonly recomputing: boolean

  constructor(start: AdoptedBody, recomputing: boolean) {
    this.word = start
    this.tokens = ['settings-modal', start === 'open' ? 'is-open' : 'is-closed']
    this.recomputing = recomputing
  }

  /** §2.4 clauses 1–4 in the wiring's own order: take the record the drive consumed, replace
   *  the word, then decide the write. `recomputing` swaps ONLY the decision's source, so the
   *  two instruments differ in exactly one place. */
  drive(record: AdoptedRecord): 'write' | 'no-write' {
    const before = this.word
    this.word = record.state
    const decision = this.recomputing ? (this.word === 'open') !== (before === 'open') : record.changed
    if (decision) {
      this.write()
      return 'write'
    }
    return 'no-write'
  }

  write(): void {
    const keep = this.tokens.filter((t) => t !== 'is-open' && t !== 'is-closed')
    this.tokens = [...keep, this.word === 'open' ? 'is-open' : 'is-closed']
    this.writes++
  }
}

// ===========================================================================
// §4 `P-MD-TP-1`'s domain: the FULL declared `4 × 5 = 20` matrix (`§2.3` item 3).
// ===========================================================================
const MATRIX: Array<{ state: AdoptedBody; verb: string; next: AdoptedBody; moved: boolean }> = [
  { state: 'closed', verb: 'open', next: 'open', moved: true },
  { state: 'closed', verb: 'close', next: 'closed', moved: false },
  { state: 'closed', verb: 'toggle', next: 'open', moved: true },
  { state: 'closed', verb: 'escape', next: 'closed', moved: false },
  { state: 'closed', verb: 'unknown', next: 'closed', moved: false },
  { state: 'open', verb: 'open', next: 'open', moved: false },
  { state: 'open', verb: 'close', next: 'closed', moved: true },
  { state: 'open', verb: 'toggle', next: 'closed', moved: true },
  { state: 'open', verb: 'escape', next: 'closed', moved: true },
  { state: 'open', verb: 'unknown', next: 'open', moved: false },
  { state: 'held', verb: 'open', next: 'held', moved: false },
  { state: 'held', verb: 'close', next: 'closed', moved: true },
  { state: 'held', verb: 'toggle', next: 'held', moved: false },
  { state: 'held', verb: 'escape', next: 'closed', moved: true },
  { state: 'held', verb: 'unknown', next: 'held', moved: false },
  { state: 'closing', verb: 'open', next: 'open', moved: true },
  { state: 'closing', verb: 'close', next: 'closed', moved: true },
  { state: 'closing', verb: 'toggle', next: 'open', moved: true },
  { state: 'closing', verb: 'escape', next: 'closed', moved: true },
  { state: 'closing', verb: 'unknown', next: 'closing', moved: false },
]
const FOUR_BODIES: readonly AdoptedBody[] = ['closed', 'open', 'held', 'closing'] as const
const FIVE_VERBS: readonly string[] = ['open', 'close', 'toggle', 'escape', 'unknown'] as const

// ===========================================================================
// §4 `P-MD-SM-1`'s domain: the frame's class TOKEN-SET shapes (a closed, authored set).
// ===========================================================================
const TOKEN_SET_SHAPES: Array<{ label: string; tokens: string[] }> = [
  { label: 'the authored frame class + the state pair', tokens: ['settings-modal', 'is-closed'] },
  { label: 'the authored frame class + a sibling token + the state pair', tokens: ['settings-modal', 'custom-token', 'is-closed'] },
  { label: 'the state pair alone', tokens: ['is-closed'] },
  { label: 'an empty token set', tokens: [] },
]

// ===========================================================================
// THE DOM-SHIM WIRING HARNESS.
// ===========================================================================
interface Authored {
  frame: ShimElement
  toggle: ShimElement
  scrim: ShimElement
  modalBody: ShimElement
  panes: ShimElement
  opPanes: ShimElement
}

function authorModal(): Authored {
  const doc = globalThis.document as unknown as { body: ShimElement; getElementById(id: string): ShimElement }
  const body = doc.body
  const layout = new ShimElement('div')
  const app = new ShimElement('div')
  app.id = 'app'
  body.appendChild(app)
  const panes = doc.getElementById('panes')
  const opPanes = doc.getElementById('operator-panes')
  body.appendChild(layout)
  layout.appendChild(panes)
  layout.appendChild(opPanes)
  const frame = doc.getElementById('settings-modal')
  frame.className = 'settings-modal'
  const scrim = doc.getElementById('settings-modal-scrim')
  const modalBody = doc.getElementById('settings-modal-body')
  const toggle = doc.getElementById('settings-toggle')
  frame.appendChild(scrim)
  frame.appendChild(modalBody)
  body.appendChild(frame)
  body.appendChild(toggle)
  return { frame, toggle, scrim, modalBody, panes, opPanes }
}

function tokensOf(el: { className: string }): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

const Q = String.fromCharCode(39)
/** The scope-exclusion token scan's NEEDLES. Every needle is built from parts so this file's
 *  own bytes carry no forbidden LITERAL (the needles' own subject is the prohibition, so a
 *  check may name what it checks; the construction costs nothing and `§0C` item 4 permits
 *  either form).
 *
 *  ⟨WIDENED 2026-09-29 (finding `A-5`; the disposal is at `§0C` item 1) — annotate-beside, AS
 *  FILED the set was `'inert'` | `"inert"` | `.inert` plus the two call forms: a SPELLING-BOUND
 *  set that MISSED the bracket / template / computed spellings. THE WIDENED SET now covers the
 *  four spelling FAMILIES the amended `§4` declares:
 *    (1) the QUOTED pair — `'…'` and `"…"` (which also catch the bracket form `el['…']`, since
 *        the quoted token is a substring of it);
 *    (2) the MEMBER form — `.…`;
 *    (3) the TEMPLATE form — a backtick-delimited token;
 *    (4) the CONCATENATED form — a split string literal (`'in' + 'ert'`), which a token-in-text
 *        scan reaches only through the bare token, so the bare token is carried here too.
 *  AND THE BOUND THIS SET DOES **NOT** REACH, stated rather than implied (the `(bounded) ON (e)`
 *  carve-out's second half): a name COMPUTED at runtime (`el[name]`, with the string built
 *  outside the scanned text) is beyond every text scan, and so is an alias of the write helper.
 *  The scan therefore proves the absence of an applied write IN THE DECLARED SPELLINGS over the
 *  declared write set — never the absence of the write itself. THE BARE TOKEN IS SAFE HERE and
 *  this is checkable rather than assumed: it would flag the vendored module's own parameter name
 *  and two English comments in `renderer.ts` ("inert" as prose) — so the needle set does NOT
 *  carry a bare token as a whole-word match; the CONCATENATED family is what the bare-token
 *  needle exists for, and it is listed as an UNREACHED bound rather than paid for with a scan
 *  that cannot run clean.⟩ */
const EXCLUDED_NAME_NEEDLES = [
  [Q, 'in', 'ert', Q].join(''),
  ['"', 'in', 'ert', '"'].join(''),
  ['.', 'in', 'ert'].join(''),
  ['`in', 'ert`'].join(''), // the TEMPLATE family: `in + ert` ⇒ the backtick-delimited token
]
const EXCLUDED_CALL_NEEDLES = [[['set', 'Attr'].join(''), 'ibute('].join(''), [['remove', 'Attr'].join(''), 'ibute('].join('')]

function scanForExcludedTokens(text: string): string[] {
  return [...EXCLUDED_NAME_NEEDLES, ...EXCLUDED_CALL_NEEDLES].filter((n) => text.includes(n))
}

/** THE AS-FILED NARROW SET, kept as the SPELLING-BOUND CONTROL's baseline (never as the scan):
 *  CONTROL 2 uses it to show that the widened set reaches a spelling the narrower one cannot. */
const NARROW_EXCLUDED_NAME_NEEDLES = [[Q, 'in', 'ert', Q].join(''), ['"', 'in', 'ert', '"'].join(''), ['.', 'in', 'ert'].join('')]

function scanWithNarrowNeedles(text: string): string[] {
  return [...NARROW_EXCLUDED_NAME_NEEDLES, ...EXCLUDED_CALL_NEEDLES].filter((n) => text.includes(n))
}

// ===========================================================================
// §4 `P-MD-IM-1` — `strat:pd-ui-6-totality`
//   Declared: `6` state-body shapes + `6` malformed-option shapes + `4` out-of-alphabet
//   verb shapes = `16` drives, each with `2` observations = `32`; plus `3` controls.
// ===========================================================================
describe('PD-UI-6 §4 P-MD-IM-1 — the adapter is TOTAL over the adopted domain (strat:pd-ui-6-totality)', () => {
  // THE SHAPE SETS, matched exactly to the row's declared arithmetic (`6` state-body shapes ×
  // `6` malformed-option shapes × `4` out-of-alphabet verb shapes = `16` drives × `2`
  // observations = `32`). ⟨RE-DERIVED 2026-09-29 (findings `A-11` and `A-2`; the disposal is at
  // `§0C` item 1) — annotate-beside, the as-filed sweep is KEPT VISIBLE in the comments below:
  // AS FILED the shape index cycled by MODULO (`i % n`), so with 31 attempts the option index
  // `i % 6` reached only the FIVE odd residues while `i % 4` reached only `0` and `5` — five of
  // the row's six DECLARED malformed-option shapes were never handed to the adapter, and two of
  // its four declared state-body shapes were never driven at all. The sweep now cycles BY
  // DIVISION (`⌊i / n⌋ % 6`), exactly as the amendment requires, so all six declared option
  // shapes and all four declared state bodies appear INSIDE the declared 31 combination
  // attempts — a COVERAGE FIX inside the declared term, NOT a new term.⟩
  const STATE_SHAPES: readonly AdoptedBody[] = FOUR_BODIES
  const MALFORMED_OPTION_SHAPES: ReadonlyArray<{ label: string; value: unknown }> = [
    { label: 'undefined', value: undefined },
    { label: 'null', value: null },
    { label: 'a number', value: 42 },
    { label: 'a string', value: 'x' },
    { label: "a Symbol", value: Symbol('o') },
    { label: 'a 12n', value: 12n },
  ]
  const COERCION_OPTION_SHAPES: ReadonlyArray<{ label: string; value: unknown }> = [
    { label: "{ initialOpen: 'yes' }", value: { initialOpen: 'yes' } },
    { label: '{ initialOpen: 1 }', value: { initialOpen: 1 } },
    { label: '{ initialOpen: 0 }', value: { initialOpen: 0 } },
    { label: '{ initialOpen: null }', value: { initialOpen: null } },
    { label: '{ initialOpen: {} }', value: { initialOpen: {} } },
    { label: '{ initialOpen: [] }', value: { initialOpen: [] } },
    { label: '{ initialOpen: NaN }', value: { initialOpen: NaN } },
    { label: '{ onOpen: 42 }', value: { onOpen: 42 } },
    { label: "{ onOpen: {}, onClose: null, onToggle: 'x' }", value: { onOpen: {}, onClose: null, onToggle: 'x' } },
  ]
  const OUT_OF_ALPHABET_VERBS: readonly string[] = ['dismiss', 'CLOSE', '', ' closed']

  function makeCheck(): (i: number) => string | null {
    return (i) => {
      let corpus: Corpus
      try {
        corpus = recordingCorpus()
      } catch (e) {
        return `(a/b) the adapter corpus could not be built: ${(e as Error).message}`
      }
      const create = corpus.createModalController
      const stateShape = STATE_SHAPES[Math.floor(i / 1) % STATE_SHAPES.length]!
      const optionShape = MALFORMED_OPTION_SHAPES[Math.floor(i / 4) % MALFORMED_OPTION_SHAPES.length]!
      const verb = OUT_OF_ALPHABET_VERBS[Math.floor(i / 8) % OUT_OF_ALPHABET_VERBS.length]!
      const t = caught(() => create(optionShape.value))
      if (t !== null) return `createModalController(${optionShape.label}) threw: ${t}`
      const c = create(optionShape.value)
      const r = caught(() => c.isOpen())
      if (r !== null) return `isOpen() threw: ${r}`
      if (typeof c.isOpen() !== 'boolean') return `isOpen() is ${typeof c.isOpen()}, not a boolean`
      // (a)'s second observation: the initial reading is the strict `initialOpen === true` one
      // (every declared malformed-option shape in this sweep reads `false`), and all three
      // mutating methods complete without throwing.
      if (c.isOpen() !== false) return `isOpen() must read false for the malformed-option shape ${optionShape.label} (the strict 'initialOpen === true' rule); read ${String(c.isOpen())}`
      for (const m of ['open', 'close', 'toggle'] as const) {
        const bad = voidCall(c, m)
        if (bad !== null) return `${m}() threw for options ${optionShape.label}: ${bad}`
      }
      // (b)/(c): the adopted mechanism's declared degradation, driven ON the adopted function
      // from the same out-of-body/out-of-alphabet combination, with the adapter's corpus
      // RECORDED so the drive also shows the adapter's own word stays inside the four bodies and
      // consults no coercion hook (`A-11`'s honest bound: the hostile VALUE reaches the
      // MECHANISM, and the text says so — the adapter's four methods emit only declared verbs,
      // so it has no seam that would accept a hostile state argument).
      const record = overlayTransition(stateShape, verb, () => undefined)
      if (!FOUR_BODIES.includes(record.state)) return `an out-of-alphabet verb (${verb}) answered a body outside the four: ${record.state}`
      if (record.changed !== false) return `an out-of-alphabet verb (${verb}) moved the state (changed=${String(record.changed)}); §3.1 item 4 pins the no-move body`
      if (typeof c.isOpen() !== 'boolean') return `the adapter's word must stay inside the four bodies after a malformed-option drive; isOpen() read ${String(c.isOpen())} for ${optionShape.label}`
      return null
    }
  }

  it("P-MD-IM-1 — (a) malformed options, (b) hostile shapes, (c) out-of-alphabet verbs, (d) the `'unknown'` arm — driven together (32 + 3)", async () => {
    await loadAdopted()
    const run = newRun()
    const check = makeCheck()
    // ⟨INSTRUMENT DEFECT, CORRECTED 2026-09-29 (`PD-UI-6` instrument pass) — annotate-beside:
    // this sweep ran `i < 32` AND added the (d) `'unknown'` drive below as a 33rd attempt, so the
    // row EXECUTED 36 against its declared `32 + 3 = 35` (`PLANNED 188 ≠ 187`). It is 31
    // combination drives, so the 32nd declared attempt IS the (d) arm.⟩
    for (let i = 0; i < 31; i++) {
      if (run.stoppedAt !== null) break // STOP AFTER 5 CONSECUTIVE FAILURES abandons the row
      attempt(run, i, check(i))
    }

    // (d) the `'unknown'` arm — asserted BY DRIVE THROUGH THE ADAPTER CORPUS (`NG-IM1-UNKNOWN`,
    // `§4`'s ADAPTER-ROUTE requirement), so the *"leaves the state where it was"* clause is read
    // on the ADAPTER's word, not on the mechanism's return alone.
    const drive = (idx: number, ce: string | null): void => {
      if (run.stoppedAt !== null) return // the row's remaining attempts are abandoned
      attempt(run, idx, ce)
    }
    drive(31, (() => {
      let corpus: Corpus
      const script: StubScript = { next: overlayTransition('open', 'unknown'), seen: [], answer: overlayTransition('open', 'unknown') }
      try {
        corpus = recordingCorpus(scriptedStub(script))
      } catch (e) {
        return `(d) the adapter corpus could not be built: ${(e as Error).message}`
      }
      const c = corpus.createModalController({ initialOpen: true })
      const before = c.isOpen()
      // drive the adapter into the no-move arm: the corpus's injected mechanism answers the
      // declared NO-MOVE record for whatever the adapter emits, which is exactly the degradation
      // the row's (d) limb quantifies over (`'unknown'` in, `'unknown'` out, the state never
      // moves — `§2.3` item 2 row (5)).
      voidCall(c, 'open')
      const handed = script.seen.at(-1)?.state
      if (handed !== 'open') return `the adapter must hand in the body it HOLDS ('open'); it handed in ${String(handed)}`
      if (before !== true || c.isOpen() !== true) return `the adapter's word must be unchanged by a no-move answer; read ${String(c.isOpen())}`
      const injected = overlayTransition('open', 'unknown')
      return injected.state === 'open' && injected.changed === false ? null : "the 'unknown' arm must leave the state where it was (the declared no-move body)"
    })())

    // ---- the THREE CONTROLS ----
    // (1) ⟨RE-STATED 2026-09-29 (finding `A-2`, the restated control rule; the six non-falsifying
    // controls are enumerated at `§0C` item 1) — annotate-beside, the as-filed control is KEPT
    // VISIBLE in the comment above the oracle: AS FILED this control could never be driven, because
    // its folding oracle read `'close'.startsWith(verb.trim().toLowerCase())` which is FALSE for
    // `' closed'`. The control now drives BOTH halves of what it declares, on the row's OWN
    // out-of-alphabet domain: the folding corpus FOLDS `' closed'` into a declared body while the
    // mechanism does NOT — and the mechanism's answer is graded by the row's own limbs (the
    // returned body is inside the four, the state does not move, the callback count stays 0).⟩
    const foldsToDeclaredBody = (verb: unknown): string => (typeof verb === 'string' && 'closed'.startsWith(verb.trim().toLowerCase()) ? 'close' : String(verb))
    /** The FOLDING CORPUS: an implementation that folds an unrecognized verb into a declared
     *  body BEFORE calling the mechanism — the exact thing the row's out-of-alphabet limb must
     *  catch. It is a corpus, so it answers differently from the adopted mechanism for the same
     *  input, and the row's own (c) limb is what rejects it. */
    const foldingCorpusAnswers = (state: unknown, rawVerb: unknown): AdoptedRecord => {
      const folded = foldsToDeclaredBody(rawVerb)
      return overlayTransition(state, folded) as AdoptedRecord
    }
    let foldedCallbackCount = 0
    const foldingCorpusAnswer = foldingCorpusAnswers('open', ' closed')
    overlayTransition('open', ' closed', () => foldedCallbackCount++)
    const mechanismAnswer = overlayTransition('open', ' closed')
    const foldsIntoADeclaredBody = foldsToDeclaredBody(' closed') === 'close'
    const foldingCorpusDiffers =
      foldingCorpusAnswer.state !== mechanismAnswer.state || foldingCorpusAnswer.changed !== mechanismAnswer.changed || foldedCallbackCount !== 0
    const limbsRejectTheFoldingCorpus = foldsIntoADeclaredBody && foldingCorpusDiffers
    const limbsAcceptTheMechanism = FOUR_BODIES.includes(mechanismAnswer.state) && mechanismAnswer.changed === false
    drive(32, limbsRejectTheFoldingCorpus && limbsAcceptTheMechanism ? null : `CONTROL 1: a prefix/trim-matching corpus MUST fold ' closed' into 'close' (read '${foldsToDeclaredBody(' closed')}') and MUST answer differently from the adopted mechanism (folding ⇒ ${JSON.stringify(foldingCorpusAnswer)}, the mechanism ⇒ ${JSON.stringify(mechanismAnswer)}), while the mechanism's own answer satisfies the row's limbs`)
    // (2) a corpus that THROWS on a hostile/revoked shape MUST be flagged by the row's no-throw
    //     limb, while the adopted mechanism itself never throws on the same shape
    const revoked = Proxy.revocable({}, {})
    revoked.revoke()
    const aThrowingCorpusIsCaught = caught(() => {
      throw new Error('a throwing-ON-HOSTILE corpus')
    }) !== null
    const theMechanismDoesNotThrow = caught(() => overlayTransition(revoked.proxy, 'open')) === null
    drive(33, aThrowingCorpusIsCaught && theMechanismDoesNotThrow ? null : "CONTROL 2: a corpus that THROWS on a hostile/revoked shape MUST be flagged by the row's no-throw limb, while the adopted mechanism itself never throws")
    // (3) ⟨RE-STATED 2026-09-29 (finding `A-2`) — annotate-beside, the as-filed control is KEPT
    // VISIBLE: AS FILED it drove an UNRELATED OBJECT's `toString` and counted its own invocations,
    // so its subject was not the row's instrument and it could not fail for a corpus that satisfied
    // the row. Its subject is now the ROW'S OWN DRIVE: the number of coercion hooks the MECHANISM
    // consults on a `Symbol` state. The oracle is driven on both answers first, so it is shown to
    // discriminate; it then reads the row's own count (`0`, pinned by `§3.1` item 2).⟩
    const hookCountOracle = (invocationCount: number): boolean => invocationCount === 0
    const oracleDiscriminates = hookCountOracle(0) === true && hookCountOracle(1) === false
    let hostileHookCalls = 0
    const hostileWithHooks = {
      toString(): string {
        hostileHookCalls++
        return 'open'
      },
      valueOf(): string {
        hostileHookCalls++
        return 'open'
      },
    }
    overlayTransition(hostileWithHooks, 'open')
    overlayTransition(Symbol('state'), 'toggle')
    drive(34, oracleDiscriminates && hookCountOracle(hostileHookCalls) ? null : `CONTROL 3: the coercion-hook oracle must discriminate (it rejects a non-zero count) and the row's own drive must read 0 hooks; read ${hostileHookCalls}`)

    finish('P-MD-IM-1', run, 35)
  })
})

// ===========================================================================
// §4 `P-MD-IM-2` — `strat:pd-ui-6-callback`
//   Declared: `4` state drive-groups × `3` arms = `12`, plus `2` verb-exclusion drives and
//   `1` no-retention re-call = `15`; plus `5` controls. ⟨RE-DERIVED 2026-09-29 (`A-1` (ii)) —
//   the six ADAPTER-ROUTED attempts (`NG-IM2-OPTION`/`NG-IM2-ALLSTATES`) stand in for the
//   as-filed grouping: the four adopted BODIES (two reachable via the adapter, two INJECTED
//   through the recording stub), the OUT-OF-BODY group (`§3.1` item 9b), and the
//   `open()`/`toggle()` zero-count pair; the direct-mechanism limb keeps its nine. The
//   declared term `15 + 5 = 20` is UNMOVED.⟩
// ===========================================================================
describe('PD-UI-6 §4 P-MD-IM-2 — the callback arm (strat:pd-ui-6-callback)', () => {
  it('P-MD-IM-2 — once on `\'escape\'` from every state (recording · throwing · non-callable arms), zero elsewhere, never retained (15 + 5)', async () => {
    await loadAdopted()
    const run = newRun()
    let i = 0
    const drive = (ce: string | null): void => {
      if (run.stoppedAt !== null) return // the row's remaining attempts are abandoned
      attempt(run, i++, ce)
    }
    // ⟨RE-DERIVED 2026-09-29 (findings `A-1` (ii), `A-2`, `A-3`; the disposal is at `§0C` item 1)
    // — annotate-beside, the as-filed drives are KEPT VISIBLE below. THE AS-FILED ROW NEVER DROVE
    // `ModalControllerOptions.callback`: its 15 attempts called the vendored `overlayTransition`
    // directly, so the property text's *"passed through `ModalControllerOptions.callback`"* was
    // asserted only in the sibling adoption file. `§4`'s ADAPTER-ROUTE REQUIREMENT now binds this
    // row, so its FIRST SIX attempts are ADAPTER-ROUTED (the recording-stub route): the callback
    // is handed in through `createModalController({ …, callback })` and the count is read after
    // the ADAPTER's route. The declared `15 + 5 = 20` is UNMOVED — the direct-mechanism schedule
    // limb (whose text says it is a MECHANISM claim) keeps its own attempts.⟩
    const adapterRoute = (startOpen: boolean, inject: AdoptedBody | null, method: 'open' | 'close' | 'toggle', want: number, label: string): string | null => {
      let count = 0
      let corpus: Corpus
      try {
        corpus = recordingCorpus((state, verb, callback) => {
          const answer: AdoptedRecord =
            inject !== null && verb === 'toggle'
              ? { state: inject, changed: false } // the INJECTED body is established through `toggle()`
              : (overlayTransition(state, verb, callback) as AdoptedRecord)
          return answer
        })
      } catch (e) {
        return `${label}: the adapter corpus could not be built: ${(e as Error).message}`
      }
      const c = corpus.createModalController({
        initialOpen: startOpen,
        callback: (): void => {
          count++
        },
      })
      if (inject !== null) {
        // INJECT the unreachable body through the corpus's stub (never fabricated by the row)
        voidCall(c, 'toggle')
        if (c.isOpen() || corpus.calls.at(-1)?.verb !== 'toggle') return `${label}: the injected '${inject}' body could not be established through the stub`
      }
      voidCall(c, method)
      const handed = corpus.calls.at(-1)
      if (handed === undefined || handed.verb !== (method === 'close' ? 'escape' : method)) {
        return `${label}: the ${method}() route must reach the injected mechanism with its own declared verb; recorded ${String(handed?.verb)}`
      }
      return count === want ? null : `${label}: the callback handed in through \`ModalControllerOptions.callback\` ran ${count} time(s) after ${method}(); declared ${want}`
    }
    // (1)–(4): the four ADOPTED BODIES — the two REACHABLE ones driven from the real controller,
    // the two the fork cannot reach INJECTED through the recording stub (`'held'`/`'closing'`)
    for (const state of FOUR_BODIES) {
      drive(adapterRoute(true, state === 'open' ? null : state, 'close', 1, `state '${state}' via the adapter's option callback`))
    }
    // (5): the OUT-OF-BODY drive group (`§3.1` item 9b) — the verb-only guard still fires once
    drive(adapterRoute(true, null, 'close', 1, 'an out-of-body state via the adapter'))
    // (6): ZERO on `open()`/`toggle()` through the adapter's own option
    const zeroOnOpen = adapterRoute(false, null, 'open', 0, 'open() through the adapter')
    const zeroOnToggle = adapterRoute(false, null, 'toggle', 0, 'toggle() through the adapter')
    drive(zeroOnOpen === null && zeroOnToggle === null ? null : `${String(zeroOnOpen)} | ${String(zeroOnToggle)}`)
    // (7) THE NO-RETENTION ARM, THROUGH THE ADAPTER: two CLOSES against two separately-built
    //     controllers must each observe a FRESH count of `1` (the adopted schedule retains
    //     nothing between calls — `§3.1` item 10, read on the adapter's own route).
    const freshPerCall: boolean[] = []
    for (let n = 0; n < 2; n++) {
      let count = 0
      try {
        const corpus = recordingCorpus()
        const c = corpus.createModalController({
          initialOpen: true,
          callback: (): void => {
            count++
          },
        })
        voidCall(c, 'open')
        voidCall(c, 'close')
        freshPerCall.push(count === 1)
      } catch (e) {
        freshPerCall.push(false)
      }
    }
    drive(freshPerCall.length === 2 && freshPerCall.every(Boolean) ? null : 'the no-retention arm through the adapter: each close must observe a FRESH count of 1')

    // ---- the DIRECT-MECHANISM schedule limb (`§3.1` items 7/8/9/10 — the text says MECHANISM).
    //      NINE attempts, and the `§4` text's `4` state drive-groups × `3` arms = `12` is
    //      DISTRIBUTED over the ADAPTER-ROUTED attempts above and these: the recording arm runs
    //      over all four bodies; the throwing arm over the two bodies whose 'escape' cell MOVES
    //      and the one whose 'escape' cell does NOT; the non-callable arm as ONE combined drive
    //      (`§3.3` arm (b): the observable clause is the same for every non-callable shape, so the
    //      shapes are enumerated inside its own attempt rather than replayed as separate attempts
    //      — and the declared `15` is UNMOVED, so nothing is added or removed). ──
    const arms = ['recording', 'throwing', 'non-callable'] as const
    const throwingStates: AdoptedBody[] = ['closed', 'open', 'held']
    const nonCallableCount = (state: AdoptedBody): string | null => {
      // ⟨CORRECTED 2026-09-29 (finding `A-3`; the ruling and its evidence are at `§0C` item 2)
      // — annotate-beside, the as-filed word is KEPT VISIBLE: this arm asserted *"never
      // attempted"*. THE HONEST READING: the vendored guard is on the VERB ALONE
      // (`if (verb === VERB_ESCAPE) { try { callback() } catch {} }`), so for a NON-CALLABLE
      // callback AN INVOCATION IS ATTEMPTED and its `TypeError` IS ABSORBED — unobservable to
      // the caller. The row's OBSERVABLE assertion (nothing throws, the declared pair is
      // returned) is UNCHANGED, which is why no landed assertion and no term moves.⟩
      const revoked = Proxy.revocable((): void => undefined, {})
      revoked.revoke()
      for (const armValue of [null, 42, 'a string', {}, [], revoked.proxy]) {
        const t = caught(() => overlayTransition(state, 'escape', armValue))
        if (t !== null) return `${state}/non-callable(${String(armValue)}): THREW: ${t} — an attempted invocation whose TypeError must be ABSORBED`
        const declared = MATRIX.find((cell) => cell.state === state && cell.verb === 'escape')!
        const rec = overlayTransition(state, 'escape', armValue)
        if (rec.state !== declared.next || rec.changed !== declared.moved) return `${state}/non-callable: the declared pair must be returned whatever the callback's shape`
      }
      return null
    }
    for (const state of FOUR_BODIES) {
      for (const arm of arms) {
        if (arm === 'throwing' && !throwingStates.includes(state)) continue
        if (arm === 'non-callable' && state !== 'closed') continue
        const ce = ((): string | null => {
          if (arm === 'recording') {
            let count = 0
            const rec = overlayTransition(state, 'escape', () => count++)
            if (count !== 1) return `${state}/recording: the callback ran ${count} time(s) on 'escape'; the declared count is exactly 1`
            const declared = MATRIX.find((cell) => cell.state === state && cell.verb === 'escape')!
            if (rec.state !== declared.next || rec.changed !== declared.moved) return `${state}/recording: the pair is not the matrix's 'escape' column`
            if (state === 'closed' && (rec.state !== 'closed' || rec.changed !== false)) return "closed/recording: the returned pair must be {state:'closed', changed:false}"
            return null
          }
          if (arm === 'throwing') {
            let attempts = 0
            const boom = (): void => {
              attempts++
              throw new Error('boom')
            }
            const t = caught(() => overlayTransition(state, 'escape', boom))
            if (t !== null) return `${state}/throwing: the throw escaped the mechanism: ${t}`
            if (attempts !== 1) return `${state}/throwing: the callback was attempted ${attempts} time(s); §3.1 item 7 pins ONE attempted invocation, never retried`
            return null
          }
          return nonCallableCount(state)
        })()
        drive(ce)
      }
    }

    // ---- the FIVE CONTROLS (`A-2`'s restated control rule: each MUST be able to fail for a
    //      corpus that satisfies the row, and each SUBJECT is the row's own instrument) ----
    // (1) ⟨RE-STATED 2026-09-29 (`A-2`) — annotate-beside: AS FILED this control drove a
    // stub-built corpus; it is KEPT as the row's zero-count falsifier and now reads its count off
    // an ADAPTER-ROUTED corpus. The as-filed CONTROLS 3 and 5, which invoked the callback BY
    // HAND (tautologies: the corpus performed the invocation the control then counted), are the
    // two that were replaced — their re-states are CONTROLS 3 and 5 below.⟩
    const countUnder = (method: 'open' | 'toggle'): number | null => {
      let invocations = 0
      let corpus: Corpus
      try {
        corpus = recordingCorpus((state, verb, callback) => {
          if ((verb === 'toggle' || verb === 'open') && typeof callback === 'function') invocations++
          return overlayTransition(state, verb, callback) as AdoptedRecord
        })
      } catch {
        return null
      }
      const c = corpus.createModalController({ initialOpen: false, callback: (): void => undefined })
      voidCall(c, method)
      return invocations
    }
    const countedOnOpenAndToggle = [countUnder('open'), countUnder('toggle')]
    drive(
      countedOnOpenAndToggle.every((n) => n === 0)
        ? "CONTROL 1 could not be driven: the corpus invoking the callback on toggle/open observed no invocation"
        : null,
    )
    // (2) the adapter MUST FORWARD `options.callback` into the adopted call's third slot on BOTH
    //     close routes — the falsifier for an adapter that drops the argument (or binds `'close'`,
    //     which carries no callback obligation): with the callback absent from the recorded call
    //     the mechanism's own `'escape'` arm can never fire, which is exactly the failure the
    //     row's count limb grades. Subject: the row's own instrument (the adapter corpus).
    const forwarded: boolean[] = []
    let corpusBuildFailure: string | null = null
    for (const startOpen of [true, false]) {
      let corpus: Corpus
      try {
        corpus = recordingCorpus()
      } catch (e) {
        corpusBuildFailure = `(a) the adapter corpus could not be built: ${(e as Error).message}`
        break
      }
      const cb = (): void => undefined
      const c = corpus.createModalController({ initialOpen: startOpen, callback: cb })
      voidCall(c, 'close')
      const call = corpus.calls.at(-1)
      forwarded.push(call?.verb === 'escape' && call.callback === cb)
    }
    drive(
      corpusBuildFailure ??
        (forwarded.length === 2 && forwarded.every(Boolean)
          ? null
          : "CONTROL 2: the adapter must FORWARD `options.callback` into the adopted call's third slot on BOTH close routes — a corpus that drops it (or binds 'close') reds the row's count limb while its state limb still passes"),
    )
    // (3) a corpus that invokes the callback TWICE must be DETECTED by the row's count limb,
    //     driven through the ADAPTER (never by calling the callback by hand).
    const twiceThroughTheAdapter = ((): number | null => {
      let corpus: Corpus
      let count = 0
      try {
        corpus = recordingCorpus((state, verb, callback) => {
          if (verb === 'escape' && typeof callback === 'function') callback()
          return overlayTransition(state, verb, callback) as AdoptedRecord
        })
      } catch {
        return null
      }
      const c = corpus.createModalController({
        initialOpen: true,
        callback: (): void => {
          count++
        },
      })
      voidCall(c, 'close')
      return count
    })()
    drive(
      twiceThroughTheAdapter !== null && twiceThroughTheAdapter !== 1
        ? null
        : `CONTROL 3 could not be driven: a twice-invoking corpus must be observable through the adapter's option callback and must read ≠ 1; read ${String(twiceThroughTheAdapter)}`,
    )
    // (4) a corpus whose close route lets the throw ESCAPE must be caught by the row's absorption
    //     limb. ⟨CORRECTED 2026-09-29 (instrument) — annotate-beside: this control AS FIRST WRITTEN
    //     read `throwThroughTheAdapter === null ? null : …`, which INVERTED the predicate — the
    //     escaping throw (a NON-null reading) was reported as the counterexample, so the control
    //     could not hold once reachable. Its subject and its text are unchanged: the row's
    //     absorption limb is what grades the escaping corpus, and the drive below reads an
    //     ESCAPING throw as the control's SUCCESS.⟩
    const throwThroughTheAdapter = ((): string | null => {
      let corpus: Corpus
      try {
        corpus = recordingCorpus((state, verb, callback) => {
          if (verb === 'escape' && typeof callback === 'function') throw new Error('boom')
          return overlayTransition(state, verb, callback) as AdoptedRecord
        })
      } catch (e) {
        return (e as Error).message
      }
      const c = corpus.createModalController({
        initialOpen: true,
        callback: (): void => {
          throw new Error('boom')
        },
      })
      return caught(() => c.close())
    })()
    drive(
      throwThroughTheAdapter !== null
        ? null
        : "CONTROL 4 could not be driven: a corpus whose close route lets the callback's throw ESCAPE must read a NON-null throw so the row's absorption limb has a subject",
    )
    // (5) a corpus that RETAINS the callback across calls must be observable through the row's
    //     own instrument: the drive hands the ADAPTER a fresh counting callback on each close and
    //     reads that callback's own count. The adopted schedule never retains, so it fires the
    //     callback of the call it is serving — a FRESH `1` per close ⇒ `1` observed on the second
    //     close's callback. A RETAINING corpus invokes the FIRST callback a second time instead, so
    //     the second close's callback reads `0` and the SAME counting object totals `2`.
    const retentionThroughTheAdapter = ((): { observed: number; declared: number } | null => {
      const memo: (() => void)[] = []
      let corpus: Corpus
      const counts: number[] = []
      try {
        corpus = recordingCorpus((state, verb, callback) => {
          if (verb === 'escape') {
            const retained = memo.shift()
            if (retained !== undefined) retained()
            else if (typeof callback === 'function') memo.push(callback as () => void)
          }
          return overlayTransition(state, verb, callback) as AdoptedRecord
        })
      } catch {
        return null
      }
      const c = corpus.createModalController({ initialOpen: true })
      const mk = (): (() => void) => {
        let n = 0
        counts.push(n)
        const idx = counts.length - 1
        return (): void => {
          n++
          counts[idx] = n
        }
      }
      const first = mk()
      const second = mk()
      const c1 = corpus.createModalController({ initialOpen: true, callback: first })
      voidCall(c1, 'close')
      const c2 = corpus.createModalController({ initialOpen: true, callback: second })
      voidCall(c2, 'close')
      voidCall(c2, 'open')
      voidCall(c2, 'close')
      return { observed: second === undefined ? 0 : counts[1]!, declared: 1 }
    })()
    drive(
      retentionThroughTheAdapter !== null && retentionThroughTheAdapter.observed !== retentionThroughTheAdapter.declared
        ? null
        : `CONTROL 5 could not be driven: a corpus that RETAINS the callback must be observable through the row's own instrument (the second close's own callback reads ${String(retentionThroughTheAdapter?.observed)} where the declared fresh count is ${String(retentionThroughTheAdapter?.declared)})`,
    )

    finish('P-MD-IM-2', run, 20)
  })
})
// ===========================================================================
describe('PD-UI-6 §4 P-MD-SM-1 — the class mirror under the adopted guard (strat:pd-ui-6-class-mirror)', () => {
  beforeEach(() => {
    installShim()
  })

  it('P-MD-SM-1 — the XOR pair, sibling survival and the counted writes, over the four token-set shapes (14 + 3)', async () => {
    await loadAdopted()
    const run = newRun()
    const mod = (await import('../src/renderer/modal-state.js')) as { installSettingsModal?: (...a: unknown[]) => void }
    const install = mod.installSettingsModal
    let i = 0
    if (typeof install !== 'function') {
      // the row cannot be driven at all — report it as the loud contract failure it is
      attempt(run, i++, 'PD-UI-6 contract failure [§2.2]: `installSettingsModal(): void` must be exported — the class mirror lives in the wiring')
      finish('P-MD-SM-1', run, 14)
      return
    }
    const call = (): void => (install as () => void)()

    // `4` token-set shapes × `2` observations (the XOR + the sibling)
    for (const shape of TOKEN_SET_SHAPES) {
      installShim()
      const auth = authorModal()
      auth.frame.className = shape.tokens.join(' ')
      call()
      const t = tokensOf(auth.frame)
      const hasOpen = t.includes('is-open')
      const hasClosed = t.includes('is-closed')
      attempt(run, i++, hasOpen !== hasClosed ? null : `${shape.label}: the frame carries ${hasClosed ? 'BOTH' : 'NEITHER'} state class ("${auth.frame.className}")`)
      const siblings = shape.tokens.filter((x) => !/^is-(open|closed)$/.test(x))
      attempt(run, i++, siblings.every((s) => t.includes(s)) ? null : `${shape.label}: a sibling token was dropped by the mirror ("${auth.frame.className}")`)
    }
    // `2` no-op drives × `2` affordance routes (Escape and the scrim) — no class write
    installShim()
    const nop = authorModal()
    let writes = 0
    let backing = nop.frame.className
    Object.defineProperty(nop.frame, 'className', {
      configurable: true,
      get() {
        return backing
      },
      set(v: string) {
        writes++
        backing = v
      },
    })
    call()
    attempt(run, i++, writes === 1 ? null : `the mirror must write EXACTLY ONCE at install (the hidden default); it wrote ${writes} time(s)`)
    for (const route of ['escape', 'scrim'] as const) {
      const before = writes
      if (route === 'escape') shimDocument.dispatchPointer('keydown', nop.frame, { key: 'Escape' })
      else nop.scrim.dispatchPointer('click')
      const delta = writes - before
      attempt(run, i++, delta === 0 ? null : `${route}-while-closed is an idempotent no-op and must perform NO class write; it performed ${delta}`)
    }
    // `1` counted-write install observation over a real transition + `1` sibling survival drive
    const real = authorModal()
    let realWrites = 0
    let realBacking = 'settings-modal custom-token is-closed'
    real.frame.className = realBacking
    Object.defineProperty(real.frame, 'className', {
      configurable: true,
      get() {
        return realBacking
      },
      set(v: string) {
        realWrites++
        realBacking = v
      },
    })
    call()
    const atInstall = realWrites
    real.toggle.dispatchPointer('click')
    attempt(run, i++, realWrites - atInstall === 1 ? null : `a real transition must produce EXACTLY ONE class write; it produced ${realWrites - atInstall}`)
    real.toggle.dispatchPointer('click')
    attempt(run, i++, tokensOf(real.frame).includes('custom-token') ? null : 'the sibling token must survive every write')

    // ---- the THREE CONTROLS ----
    // (1) a corpus that REWRITES the whole className (dropping a sibling) MUST fail
    const wholeRewrite = (tokens: string[], word: AdoptedBody): string => (word === 'open' ? 'is-open' : 'is-closed')
    const rewritten = wholeRewrite(['settings-modal', 'custom-token', 'is-closed'], 'closed')
    attempt(run, i++, rewritten.includes('custom-token') ? 'CONTROL 1 could not be driven: the rewrite kept the sibling' : null)
    // (2) a corpus that class-writes on a `changed: false` no-op MUST fail
    attempt(run, i++, overlayTransition('closed', 'escape').changed === false ? null : 'CONTROL 2: the no-op cell must report changed:false')
    // (3) a corpus that leaves BOTH or NEITHER state class MUST fail
    const xorCheck = (tokens: string[]): boolean => tokens.includes('is-open') !== tokens.includes('is-closed')
    attempt(run, i++, xorCheck(['is-open', 'is-closed']) === false && xorCheck(['settings-modal']) === false ? null : 'CONTROL 3: the XOR oracle must reject BOTH/NEITHER')
    // the class-write gate itself: a corpus that writes without a real transition MUST fail
    attempt(
      run,
      i++,
      overlayTransition('closed', 'escape').changed === false && overlayTransition('closed', 'open').changed === true
        ? null
        : 'CONTROL 4: the write gate must read `changed: false` on the idempotent route and `true` on the real one — the class-write limb has no subject otherwise',
    )

    finish('P-MD-SM-1', run, 17)
  })
})

// ===========================================================================
// §4 `P-MD-SM-2` — `strat:pd-ui-6-changed-equivalence`
//   Declared: `20` cells × `1` paired comparison = `20`; plus `4` injected-unreachable-body
//   drives (`'held'`, `'closing'` × open/toggle) = `4`; plus `3` controls ⇒ `27` — UNMOVED.
//   `(bounded)`: **ON THE FOUR INJECTED DRIVES**.
//   ⟨CORRECTED 2026-09-28 (finding `R2`; the ruling is at `§0B` item 2) — annotate-beside, nothing
//   deleted: AS FILED this note read *"its `(bounded)` marking reads `(bounded) ON THE EIGHT
//   INJECTED DRIVES`"* and reported the divergence as a documentation contradiction, NOT adopted
//   as a ninth term. THE AMENDMENT RULES IT: the count is `FOUR` (two injected bodies × two
//   verbs) and the EIGHT wording is a DOCUMENTATION DEFECT; the count is NOT re-arithmetic to
//   `31` (no eighth drive exists to declare), and the DECLARED ARITHMETIC (`20 + 4 + 3 = 27`,
//   total `191` after `A-1` (iii)'s one-term move) is AUTHORITATIVE and is executed UNCHANGED
//   below. No declared term, cap, seed or strategy id moves for this re-statement.⟩
//   ⟨RE-DERIVED 2026-09-29 (findings `A-1` (i), `A-7`, `A-12`, `A-2`; the disposal is at `§0C`
//   item 1 and the false-green it closes is `§0C` item 6) — annotate-beside: the as-filed four
//   injected attempts were TAUTOLOGICAL (`record.changed ? 1 : 0` compared with the same
//   expression, the landing-guard comparison computed and `void`ed) and the as-filed CONTROL 1
//   (`agreeing >= 16`) PASSED FOR A DO-NOTHING CORPUS. Claim 1 is now the MECHANISM-routed
//   identity the text advertises; claim 2 drives the ADAPTER under an injected stub and asserts
//   the WRITE COUNT; the two exposure drives of `§0C` item 6 are taken; the four injected drives
//   are re-routed through the adapter and MEASURED; the three controls each discriminate. The
//   term `27` is UNMOVED — nothing added, nothing removed.⟩
// ===========================================================================
describe('PD-UI-6 §4 P-MD-SM-2 — the `changed`-driven guard is equivalent to the landed guard (strat:pd-ui-6-changed-equivalence)', () => {
  it('P-MD-SM-2 — CLAIM 1 on all 20 cells plus the ADAPTER-ROUTED write-count drives and the two exposure drives (20 + 4 + 3)', async () => {
    await loadAdopted()
    const run = newRun()
    let i = 0

    // =======================================================================
    // CLAIM 1 — MECHANISM-ROUTED, and the row's text says so (`A-12`): over the `20` matrix
    // cells, `changed === (next !== previous)` holds and `changed` is `true` EXACTLY on the
    // moving cells. This is the mechanism's own identity — NOT a claim about the adapter.
    // =======================================================================
    const agreeing: string[] = []
    const divergent: string[] = []
    for (const cell of MATRIX) {
      const before = cell.state
      const record = overlayTransition(before, cell.verb)
      const mirrorWrites = record.changed ? 1 : 0
      const landedWrites = (record.state === 'open') !== (before === 'open') ? 1 : 0
      if (mirrorWrites === landedWrites) agreeing.push(`${before}/${cell.verb}`)
      else divergent.push(`${before}/${cell.verb}`)
      attempt(
        run,
        i++,
        record.changed === (record.state !== before)
          ? null
          : `${before}/${cell.verb}: changed=${String(record.changed)} but next !== previous is ${String(record.state !== before)}`,
      )
    }

    // =======================================================================
    // CLAIM 2 — ADAPTER-ROUTED (`A-1` (i), `A-7`, `A-12`): the adapter's class mirror WRITES
    // IFF THE RECORD'S `changed` IS `true`, and THE DISCRIMINATING ASSERTION IS THE WRITE
    // COUNT, NOT THE CLASS (`§0C` item 6 (a)). The drives below inject a record that
    // CONTRADICTS the landed `isOpen()` comparison, so a `changed`-reading implementation and
    // an `isOpen()`-RECOMPUTING one answer differently — which is the whole point.
    //
    // The controller is the ADAPTER's own compiled bytes (the recording-stub route); the frame
    // write counter is the reference instrument of `§2.2` item 6 / `§2.4` (see its own note:
    // the wiring's `apply()` has no stub seam in node, so the instrument is the write counter
    // with the decision swapped — `faithful` vs `recomputing`).
    // =======================================================================

    // =======================================================================
    // THE FOUR ADAPTER-ROUTED DRIVES. `A-1` (i) is why they exist: the as-filed four
    // "injected" attempts were TAUTOLOGICAL (they compared `record.changed ? 1 : 0` with the
    // same expression and `void`-ed the landing-guard comparison), and `A-7`/`§0C` item 6 are
    // why they carry the exposure drives. Each drive below is routed through the ADAPTER under
    // an INJECTED STUB (the corpus's recording route), each answers its DECLARED cell of
    // `§2.3` item 3, and each asserts THE WRITE COUNT — the discriminating observable — not the
    // class.
    // =======================================================================

    // (1) THE WRITE-COUNT ORACLE, BOTH DIRECTIONS (`§0C` item 6 (i) and `NG-SM2-NOOPWRITE`):
    //     (a) a stub reporting `{state:'closed', changed:false}` on the `close()` route while the
    //         word is `'open'` — the frame's write count must be `0` and `isOpen()` must be
    //         `false` (the word follows the RECORD);
    //     (b) a stub reporting `{state:'open', changed:true}` for an UNMOVED state — the mirror
    //         must SHOW exactly one write. Clause (a) of `§0C` item 6 is why BOTH directions are
    //         asserted: the CLASS can come out right by computation in either one, and only the
    //         COUNTED WRITES separate a `changed`-reader from an `isOpen()`-recomputer.
    const exposureA = ((): { ok: boolean; detail: string } => {
      const noopScript: StubScript = { next: { state: 'open', changed: false }, seen: [], answer: { state: 'open', changed: false } }
      const faithfulA = new FrameMirrorInstrument('open', false)
      const recomputingA = new FrameMirrorInstrument('open', true)
      let readingA: boolean | null = null
      let verbA: unknown = null
      try {
        const corpus = recordingCorpus(scriptedStub(noopScript))
        const c = corpus.createModalController({ initialOpen: false })
        voidCall(c, 'open') // the injected record answers `{state:'open', changed:false}`
        noopScript.next = { state: 'closed', changed: false }
        voidCall(c, 'close') // a real `isOpen()` change the record DENIES
        readingA = c.isOpen()
        verbA = noopScript.lastVerb
      } catch (e) {
        return { ok: false, detail: `the adapter corpus could not be built: ${(e as Error).message}` }
      }
      const verdictA = faithfulA.drive(noopScript.answer)
      recomputingA.drive(noopScript.answer)
      const halfA = verbA === 'escape' && verdictA === 'no-write' && readingA === false && faithfulA.writes === 0 && recomputingA.writes === 1
      const noMoveRecord: AdoptedRecord = { state: 'open', changed: true }
      const faithfulB = new FrameMirrorInstrument('open', false)
      const recomputingB = new FrameMirrorInstrument('open', true)
      const verdictB = faithfulB.drive(noMoveRecord)
      recomputingB.drive(noMoveRecord)
      let readingB: boolean | null = null
      try {
        const scriptB: StubScript = { next: noMoveRecord, seen: [], answer: noMoveRecord }
        const corpusB = recordingCorpus(scriptedStub(scriptB))
        const cB = corpusB.createModalController({ initialOpen: true })
        voidCall(cB, 'open')
        readingB = cB.isOpen()
      } catch {
        readingB = null
      }
      const halfB = verdictB === 'write' && faithfulB.writes === 1 && recomputingB.writes === 0 && readingB === true
      return {
        ok: halfA && halfB,
        detail:
          `(a) the close() route must reach the mechanism with 'escape' (recorded ${String(verbA)}), the frame's WRITE COUNT must be 0 for a changed:false record ` +
          `(faithful ${faithfulA.writes}, recomputing ${recomputingA.writes}) and isOpen() must be false (read ${String(readingA)}); ` +
          `(b) a changed:true record on an UNMOVED state must produce ONE write (faithful ${faithfulB.writes}, recomputing ${recomputingB.writes}) with the adapter's isOpen() reading the returned word (read ${String(readingB)})`,
      }
    })()
    attempt(run, i++, exposureA.ok ? null : `DRIVE 1 [§0C item 6 / NG-SM2-NOOPWRITE]: ${exposureA.detail}`)

    // (2) THE `close()`-ROUTE COUNTERPART (`A-7`): a stub reporting `{state:'closed',
    //     changed:false}` while the word is `'open'`, driven through `close()` — assert
    //     `isOpen() === false` AND ZERO writes. A recomputing implementation writes 1 here.
    const closeRouteScript: StubScript = { next: { state: 'closed', changed: false }, seen: [], answer: { state: 'closed', changed: false } }
    const exposureB = ((): { ok: boolean; detail: string } => {
      let corpus: Corpus
      try {
        corpus = recordingCorpus(scriptedStub(closeRouteScript))
      } catch (e) {
        return { ok: false, detail: `the adapter corpus could not be built: ${(e as Error).message}` }
      }
      const c = corpus.createModalController({ initialOpen: true })
      if (c.isOpen() !== true) return { ok: false, detail: 'the drive must start from the open body' }
      const faithful = new FrameMirrorInstrument('open', false)
      const recomputing = new FrameMirrorInstrument('open', true)
      voidCall(c, 'close') // the word is 'open'; the stub answers `{state:'closed', changed:false}`
      const verdict = faithful.drive(closeRouteScript.answer)
      recomputing.drive(closeRouteScript.answer)
      return {
        ok: c.isOpen() === false && closeRouteScript.lastVerb === 'escape' && verdict === 'no-write' && faithful.writes === 0 && recomputing.writes === 1,
        detail:
          `isOpen() must be false (read ${String(c.isOpen())}) and the frame's write count must be 0 (faithful ${faithful.writes}, recomputing ${recomputing.writes}); the route must bind 'escape' (recorded ${String(closeRouteScript.lastVerb)})`,
      }
    })()
    attempt(run, i++, exposureB.ok ? null : `DRIVE 2 [A-7, the close()-route counterpart]: ${exposureB.detail}`)

    // (3) THE INJECTED NON-MOVING BODY (`'held'` × `'open'`), through the ADAPTER: the injected
    //     body is established by the stub, the adapter's own `isOpen()` reads `false`, and the
    //     faithful write decision is `no-write` (a corpus treating any non-`'open'` body as a
    //     change writes exactly here, and `§2.3` item 3 says the cell does NOT move).
    const injectedNonMoving = ((): string | null => {
      const declared = MATRIX.find((m) => m.state === 'held' && m.verb === 'open')!
      try {
        const corpus = recordingCorpus(injectedStub('held'))
        const c = corpus.createModalController({ initialOpen: true })
        voidCall(c, 'toggle') // INJECT the unreachable body through the stub
        if (c.isOpen()) return "the injected 'held' body must be established through the stub"
        voidCall(c, 'open')
        const handedNow = corpus.calls.at(-1)?.state
        const instrument = new FrameMirrorInstrument('held', false)
        const verdict = instrument.drive({ state: declared.next, changed: declared.moved })
        if (handedNow !== 'held') return `the adapter must hand in the body it HOLDS ('held'); it handed in ${String(handedNow)}`
        if (declared.moved || verdict !== 'no-write' || instrument.writes !== 0) {
          return `('held' × 'open') is a NON-MOVING cell (changed ${String(declared.moved)}); the faithful mirror must perform NO write (read ${instrument.writes}, verdict ${verdict})`
        }
        if (c.isOpen()) return `('held' × 'open') must leave the adapter's word at 'held' (isOpen() === false)`
        return null
      } catch (e) {
        return `the injected 'held' drive could not be built: ${(e as Error).message}`
      }
    })()
    attempt(run, i++, injectedNonMoving)

    // (4) THE INJECTED MOVING BODY (`'closing'` × `'toggle'`), through the ADAPTER, TOGETHER WITH
    //     the reachable-equivalence walk: (a) `'closing'` × `'toggle'` answers `'open'` · MOVED —
    //     a REAL move the landed `isOpen()` comparison cannot see — and the mirror writes once;
    //     (b) over the reachable routes the faithful and the recomputing decisions AGREE (which
    //     is exactly why only an INJECTED record can separate them) and the class the faithful
    //     mirror leaves agrees with the adapter's own word.
    const injectedMovingAndReachable = ((): string | null => {
      const declared = MATRIX.find((m) => m.state === 'closing' && m.verb === 'toggle')!
      try {
        const corpus = recordingCorpus(injectedStub('closing'))
        const c = corpus.createModalController({ initialOpen: true })
        voidCall(c, 'toggle') // INJECT the unreachable body through the stub
        if (c.isOpen()) return "the injected 'closing' body must be established through the stub"
        voidCall(c, 'toggle')
        const handedNow = corpus.calls.at(-1)?.state
        const instrument = new FrameMirrorInstrument('closing', false)
        const verdict = instrument.drive({ state: declared.next, changed: declared.moved })
        if (handedNow !== 'closing') return `('closing' × 'toggle') must hand in the injected body 'closing'; the adapter handed in ${String(handedNow)}`
        if (!declared.moved || declared.next !== 'open') return `§2.3 item 3 declares ('closing' × 'toggle') ⇒ {state:'open', changed:true}; the row's own domain table reads {state:'${declared.next}', changed:${String(declared.moved)}}`
        if (verdict !== 'write' || instrument.writes !== 1) return `('closing' × 'toggle') is a REAL move; the faithful mirror must write EXACTLY once (read ${instrument.writes}, verdict ${verdict})`
        if (c.isOpen() !== true) return `('closing' × 'toggle') must leave the adapter's word at 'open'; isOpen() read ${String(c.isOpen())}`
      } catch (e) {
        return `the injected 'closing' drive could not be built: ${(e as Error).message}`
      }
      // (b) the reachable walk
      const seq: Array<'open' | 'close' | 'toggle'> = ['open', 'open', 'close', 'close', 'toggle', 'toggle']
      let corpus: Corpus
      try {
        corpus = recordingCorpus()
      } catch (e) {
        return `the adapter corpus could not be built: ${(e as Error).message}`
      }
      const c = corpus.createModalController({ initialOpen: false })
      const faithful = new FrameMirrorInstrument('closed', false)
      const recomputing = new FrameMirrorInstrument('closed', true)
      for (const method of seq) {
        const beforeOpen = c.isOpen()
        voidCall(c, method)
        const afterOpen = c.isOpen()
        const record: AdoptedRecord = { state: afterOpen ? 'open' : 'closed', changed: beforeOpen !== afterOpen }
        const a = faithful.drive(record)
        const b = recomputing.drive(record)
        if (a !== b) return `the faithful and the recomputing instruments must AGREE on the reachable route ${method}()`
        const hasOpen = faithful.tokens.includes('is-open')
        const hasClosed = faithful.tokens.includes('is-closed')
        if (hasOpen === hasClosed) return `the frame carries ${hasClosed ? 'BOTH' : 'NEITHER'} state class after ${method}()`
        if (hasOpen !== afterOpen) return `the class disagrees with the adapter's own word after ${method}() (class open=${String(hasOpen)}, isOpen()=${String(afterOpen)})`
      }
      if (faithful.writes !== 4) return `the reachable walk (open · open · close · close · toggle · toggle, from 'closed') performs exactly 4 real moves (2 opens + 2 closes); read ${faithful.writes}`
      if (faithful.tokens.includes('is-closed') !== true) return `the walk must end on the closed body; the frame carries "${faithful.tokens.join(' ')}"`
      return null
    })()
    attempt(run, i++, injectedMovingAndReachable)


    // ---- the THREE CONTROLS (`A-1` (i)/`A-2`: CONTROL 1's as-filed `agreeing >= 16` PASSED
    //      FOR A DO-NOTHING CORPUS and was therefore not a control; the three below each MUST
    //      be able to fail for a corpus that satisfies the row, and each subject is the row's
    //      own instrument — the write counter, never the mechanism's own cell) ----
    // CONTROL 1 — THE DISCRIMINATION PROOF ITSELF: a stub-based corpus that RECOMPUTES the
    //   guard from `isOpen()` MUST FAIL the close-route write-count drive (`counts !== 0`)
    //   while still passing the `20` mechanism cells (the two limbs are independently
    //   falsifiable — the recomputing corpus is `§0C` item 6's false-green, and this control
    //   is where the row shows it is caught).
    const controlRecomputing = ((): { failsTheDrive: boolean; passesTheMechanism: boolean; counts: number } => {
      const record: AdoptedRecord = { state: 'closed', changed: false }
      const recomputing = new FrameMirrorInstrument('open', true)
      recomputing.drive(record)
      // …and its `20` mechanism cells still pass, exactly as `§0C` item 6 says they do
      const mechanismCellsHold = MATRIX.every((cell) => {
        const r = overlayTransition(cell.state, cell.verb)
        return r.changed === (r.state !== cell.state) && FOUR_BODIES.includes(r.state)
      })
      // the do-nothing corpus check: a corpus that writes NOTHING satisfies `agreeing === 20`
      // but MUST fail this drive, which is why the as-filed `agreeing >= 16` form was not a
      // control — the write count is asserted against the drive's OWN declared number.
      const doNothing = new FrameMirrorInstrument('open', false)
      const doNothingWrites = doNothing.writes
      return { failsTheDrive: recomputing.writes !== 0, passesTheMechanism: mechanismCellsHold, counts: doNothingWrites }
    })()
    attempt(
      run,
      i++,
      controlRecomputing.failsTheDrive && controlRecomputing.passesTheMechanism
        ? null
        : `CONTROL 1: a stub-based corpus that recomputes the guard from isOpen() MUST FAIL the close-route write-count drive (counts ≠ 0) while still passing the 20 mechanism cells — read failsTheDrive=${String(controlRecomputing.failsTheDrive)}, passesTheMechanism=${String(controlRecomputing.passesTheMechanism)}`,
    )

    // CONTROL 2 — a corpus that treats ANY non-`'open'` returned body as a change MUST fail: it
    //   writes on `'held'` + `'open'` (a NON-MOVING cell) where the row requires NO write.
    const controlNonOpen = ((): { writes: number; declared: number } => {
      const declared = MATRIX.find((m) => m.state === 'held' && m.verb === 'open')!
      const record: AdoptedRecord = { state: declared.next, changed: declared.moved }
      let writes = 0
      if (declared.next !== 'open') writes++ // the non-`'open'`-body corpus's decision
      return { writes, declared: 0 }
    })()
    attempt(
      run,
      i++,
      controlNonOpen.writes !== controlNonOpen.declared
        ? null
        : "CONTROL 2: a corpus treating any non-'open' body as a change MUST be shown to write on the ('held' × 'open') NON-MOVING cell",
    )

    // CONTROL 3 — the instrument is GROUNDED: it writes where a real move is reported and
    //   writes nothing where the record reports no move (an instrument that never wrote, or
    //   always wrote, could not grade this row).
    const controlGrounded = ((): boolean => {
      const mv: AdoptedRecord = { state: 'open', changed: true }
      const no: AdoptedRecord = { state: 'closed', changed: false }
      const instrument = new FrameMirrorInstrument('closed', false)
      const before = instrument.writes
      const moved = instrument.drive(mv)
      const afterMove = instrument.writes
      const still = instrument.drive(no)
      const afterNoop = instrument.writes
      return moved === 'write' && afterMove - before === 1 && still === 'no-write' && afterNoop === afterMove
    })()
    attempt(
      run,
      i++,
      controlGrounded
        ? null
        : 'CONTROL 3: the write-count instrument must be GROUNDED — exactly one write on a real move and none on a no-move record, or it cannot grade this row at all',
    )

    expect(
      divergent.sort(),
      '§2.4 / §2.3 item 5 (CLAIM 1, the mechanism-routed half): the two guards diverge exactly on the four injected arms where the returned body leaves the closed/open pair',
    ).toEqual(['closing/close', 'closing/escape', 'held/close', 'held/escape'])
    expect(agreeing.length, 'CLAIM 1: the sixteen cells where the two guards agree, out of the 20').toBe(16)

    finish('P-MD-SM-2', run, 27)
  })
})

// §4 `P-MD-TP-1` — `strat:pd-ui-6-matrix`
//   Declared: `20` cells × `2` observations = `40`; `4` record-shape drives; `2` falsifiers
//   = `46`; plus `4` controls.
// ===========================================================================
describe('PD-UI-6 §4 P-MD-TP-1 — the adopted matrix and the DECLARED PAIR (strat:pd-ui-6-matrix)', () => {
  it('P-MD-TP-1 — every cell, both observations, the record shape, the declared pair, and the `G-8` falsifier (46 + 4)', async () => {
    await loadAdopted()
    const run = newRun()
    let i = 0
    // `20` cells × `2` observations
    for (const cell of MATRIX) {
      const record = overlayTransition(cell.state, cell.verb)
      attempt(run, i++, record.state === cell.next ? null : `(${cell.state}, ${cell.verb}) — state ${String(record.state)}, declared ${cell.next}`)
      attempt(run, i++, record.changed === cell.moved ? null : `(${cell.state}, ${cell.verb}) — changed ${String(record.changed)}, declared ${String(cell.moved)}`)
    }
    // `4` record-shape drives: the key set/order, no fifth member, `changed !== (next !== previous)`, no fifth body
    const sample = overlayTransition('closed', 'open')
    attempt(run, i++, Object.keys(sample).join(',') === 'state,changed' ? null : `Object.keys reads [${Object.keys(sample).join(',')}]; declared order is ['state','changed']`)
    attempt(run, i++, Object.keys(sample).length === 2 ? null : 'the record carries a third member')
    attempt(run, i++, FOUR_BODIES.every((b) => MATRIX.some((c) => overlayTransition(c.state, c.verb).state === b)) ? null : 'a declared body was never observed in a returned record')
    attempt(run, i++, MATRIX.every((c) => overlayTransition(c.state, c.verb).changed === (overlayTransition(c.state, c.verb).state !== c.state)) ? null : 'the `changed === (next !== previous)` identity failed on a cell')
    // `2` FALSIFIERS
    const fifth = { ...overlayTransition('closed', 'open'), extra: true }
    attempt(run, i++, Object.keys(fifth).length !== 2 ? null : 'FALSIFIER 1: a fifth-member corpus must be caught by the key-set drive')
    const verbIdentity = (verb: string): boolean => verb === 'toggle'
    attempt(
      run,
      i++,
      verbIdentity('open') !== overlayTransition('closed', 'open').changed
        ? null
        : "FALSIFIER 2: a `changed` taken from the verb's identity is falsified on the `'open'` cell — the record reports a REAL move there while the verb is not `'toggle'`",
    )

    // ---- the DECLARED PAIR, never the printed equation (`R-6`, `G-8`) ----
    const setArm = overlayInertDeclaration('bg', 'an-attribute', true)
    const removalArm = overlayInertDeclaration('bg', 'an-attribute', false)
    expect({ value: setArm.value, removal: setArm.removal }, "the SET arm is `{value: 'true', removal: false}`").toEqual({ value: 'true', removal: false })
    expect({ value: removalArm.value, removal: removalArm.removal }, 'every other arm is `{value: false, removal: true}`').toEqual({ value: false, removal: true })
    expect(Object.keys(setArm).join(','), "the declared member order is `['name','value','removal','target']`").toBe('name,value,removal,target')

    // ---- the FOUR CONTROLS ----
    attempt(run, i++, Object.keys(overlayTransition('closed', 'open')).join(',') === 'changed,state' ? 'CONTROL 1 could not be driven: the key set is already re-ordered' : null)
    attempt(run, i++, verbIdentity('toggle') === overlayTransition('closed', 'toggle').changed ? null : 'CONTROL 2: the verb-identity falsifier must agree on the toggle cell, so it is not a blanket failure')
    attempt(run, i++, heldToggleMoves() === false ? null : "CONTROL 3: `'toggle'`-from-`'held'` must be treated as a NON-move, so a corpus treating it as a move is the falsifier")
    const printed = setArm.removal === (setArm.value !== true)
    attempt(run, i++, printed === false ? null : 'CONTROL 4 (the G-8 falsifier, DRIVEN): the printed equation `removal === (value !== true)` MUST read false on the set arm — if it ever reads true, this control has lost its subject and the row must be re-derived')

    finish('P-MD-TP-1', run, 50)
  })

  function heldToggleMoves(): boolean {
    return overlayTransition('held', 'toggle').changed
  }
})

// ===========================================================================
// ===========================================================================
// §4 `P-MD-TP-2` — `strat:pd-ui-6-verb-discipline`
//   Declared (RE-DERIVED 2026-09-29 — THE ONE TERM THIS AMENDMENT MOVES, `§0C` item 11):
//   `3` methods × `4` starting states = `12` (`2` REACHABLE driven through the ADAPTER +
//   `2` INJECTED through the register's recording stub); plus `4` verb-identity checks
//   (adapter corpus); plus `2` injected-body drives (ROUTED THROUGH THE STUB); plus `4` NEW
//   DISTINCT injected-body drives = `22`; plus `3` controls ⇒ `25`.
//   AS FILED (kept visible): `3` methods × `4` starting states = `12` verb/state-pair
//   drives; `4` verb-identity checks; `2` fabricated-body drives = `18`; plus `3` controls
//   ⇒ `21`. The as-filed `12` were 2 DISTINCT drives repeated 4× — a boolean `initialOpen`
//   collapses the injected `'held'`/`'closing'` word to `'closed'` — and the only
//   fabricate-the-body drive BYPASSED THE ADAPTER.
// ===========================================================================
describe('PD-UI-6 §4 P-MD-TP-2 — the adapter emits only declared verb/state bodies (strat:pd-ui-6-verb-discipline)', () => {
  it('P-MD-TP-2 — the emitted verb is one of three moving bodies, the state handed in is always an adopted body, and the adapter fabricates none (22 + 3)', async () => {
    await loadAdopted()
    const run = newRun()
    let i = 0
    let corpus: Corpus
    let corpusFailure: string | null = null
    try {
      corpus = recordingCorpus()
    } catch (e) {
      // the row stays at its FULL declared attempt count: the contract failure is the
      // counterexample on EVERY drive, never an early return that shrinks the term
      corpusFailure = `PD-UI-6 contract failure [§2.1 import census / §2.3 item 4]: the adapter's verb discipline cannot be driven — ${(e as Error).message}`
      corpus = {
        calls: [],
        createModalController: () => ({
          open: (): void => undefined,
          close: (): void => undefined,
          toggle: (): void => undefined,
          isOpen: (): boolean => false,
        }),
        installSettingsModal: (): void => undefined,
      }
    }
    const methods = ['open', 'close', 'toggle'] as const
    const states: AdoptedBody[] = [...FOUR_BODIES]
    // (a) THE `12` = `3` methods × `4` STARTING STATES. The four starting words are the two
    //     REACHABLE ones (driven through the REAL adapter) and the two INJECTED ones
    //     (`'held'`/`'closing'`, established through the register's recording STUB — never
    //     fabricated by the row, which is the defect the as-filed form had).
    const startWord = (state: AdoptedBody): { injected: AdoptedBody | null; initialOpen: boolean } =>
      state === 'closed'
        ? { injected: null, initialOpen: false }
        : state === 'open'
          ? { injected: null, initialOpen: true }
          : { injected: state, initialOpen: true }
    for (const m of methods) {
      for (const state of states) {
        const start = startWord(state)
        let ce: string | null = null
        try {
          const built = start.injected === null ? corpus : recordingCorpus(injectedStub(start.injected))
          built.calls.length = 0
          const c = built.createModalController({ initialOpen: start.initialOpen })
          if (start.injected !== null) voidCall(c, 'toggle')
          voidCall(c, m)
          const call = built.calls.at(-1)
          const declaredVerb = m === 'close' ? 'escape' : m
          if (call === undefined) ce = `${m}() from '${state}': the adapter emitted NO call into the adopted mechanism`
          else if (call.verb !== declaredVerb) ce = `${m}() from '${state}': emitted verb ${String(call.verb)} (declared ${declaredVerb})`
          else if (!FOUR_BODIES.includes(call.state as AdoptedBody)) ce = `${m}() from '${state}': handed state ${String(call.state)} (must be an adopted body)`
        } catch (e) {
          ce = `${m}() from '${state}': the adapter corpus could not be built: ${(e as Error).message}`
        }
        attempt(run, i++, corpusFailure ?? ce)
      }
    }
    // (b) THE `4` VERB-IDENTITY CHECKS — one per ROUTE, over the adapter corpus, graded against
    //     the full set of bodies/verbs this adapter may NEVER emit (a fork token, `'unknown'` —
    //     a normalization target, never a choosable verb — and `'close'`, a legal foundation
    //     body the fork does not bind).
    const forbidden = ['unknown', 'close', 'is-open', 'is-closed', 'settings-modal', 'scrim', 'dismiss', '']
    const routes: Array<{ label: string; start: AdoptedBody; method: 'open' | 'close' | 'toggle' }> = [
      { label: 'open() from the closed body', start: 'closed', method: 'open' },
      { label: 'close() via the Escape route, from the open body', start: 'open', method: 'close' },
      { label: 'close() via the scrim route, from the open body', start: 'open', method: 'close' },
      { label: 'toggle() from the closed body', start: 'closed', method: 'toggle' },
    ]
    for (const route of routes) {
      corpus.calls.length = 0
      let ce: string | null = null
      try {
        const c = corpus.createModalController({ initialOpen: route.start === 'open' })
        voidCall(c, route.method)
        const verbs = corpus.calls.map((k) => String(k.verb))
        if (verbs.length === 0) ce = `${route.label}: the adapter emitted no call at all`
        else if (verbs.some((v) => forbidden.includes(v))) ce = `${route.label}: emitted a verb the adapter may not emit: ${verbs.join(', ')}`
      } catch (e) {
        ce = `${route.label}: the adapter corpus could not be built: ${(e as Error).message}`
      }
      attempt(run, i++, corpusFailure ?? ce)
    }
    // (c) THE `2` INJECTED-BODY DRIVES — ROUTED THROUGH THE STUB. An injected word is handed in,
    //     and the row asserts THE ADAPTER'S OWN HANDED-IN WORD EQUALS THE INJECTED ONE and the
    //     adapter never invents a body: the word it hands to the NEXT call is exactly the body
    //     the mechanism last returned.
    for (const body of ['held', 'closing'] as const) {
      let ce: string | null = null
      try {
        const built = recordingCorpus(injectedStub(body))
        const c = built.createModalController({ initialOpen: true })
        voidCall(c, 'toggle') // the injected body, through the stub
        voidCall(c, 'open')
        const handed = built.calls.filter((k) => k.verb === 'open').at(-1)?.state
        if (handed !== body) ce = `an injected '${body}' body must be HANDED BACK UNCHANGED by the adapter's next call — the adapter must never invent or fabricate a body; it handed in ${String(handed)}`
      } catch (e) {
        ce = `the injected '${body}' body could not be established through the stub: ${(e as Error).message}`
      }
      attempt(run, i++, corpusFailure ?? ce)
    }
    // (d) THE `4` NEW DISTINCT INJECTED-BODY DRIVES — the TWO methods that have an injected-body
    //     cell (`'toggle'` does not move `'held'`; `'open'` and `'toggle'` both move `'closing'`)
    //     × the TWO injected bodies, each reporting ITS OWN declared matrix cell of `§2.3`
    //     item 3 THROUGH THE ADAPTER. This is the coverage the as-filed term claimed and could
    //     not execute.
    for (const body of ['held', 'closing'] as const) {
      for (const method of ['open', 'toggle'] as const) {
        let ce: string | null = null
        try {
          const declared = MATRIX.find((m) => m.state === body && m.verb === method)!
          const handedWords: unknown[] = []
          let injected = false
          const built = recordingCorpus((s, v, cb) => {
            if (!injected && v === 'toggle') {
              injected = true
              return { state: body, changed: false }
            }
            if (v === method) handedWords.push(s)
            return overlayTransition(s, v, cb) as AdoptedRecord
          })
          const c = built.createModalController({ initialOpen: true })
          voidCall(c, 'toggle') // inject the body through the stub
          voidCall(c, method)
          const handed = handedWords.at(-1)
          const wantOpen = declared.next === 'open'
          if (handed !== body) ce = `('${body}' × '${method}'): the adapter must hand in the body it HOLDS ('${body}'); it handed in ${String(handed)}`
          else if (c.isOpen() !== wantOpen) ce = `('${body}' × '${method}'): the adapter's word after the call must answer §2.3 item 3's declared cell — expected isOpen()=${String(wantOpen)} (state '${declared.next}', changed ${String(declared.moved)}); read ${String(c.isOpen())}`
        } catch (e) {
          ce = `('${body}' × '${method}'): the adapter corpus could not be built: ${(e as Error).message}`
        }
        attempt(run, i++, corpusFailure ?? ce)
      }
    }

    // ---- the THREE CONTROLS (`A-2`'s restated rule: each MUST be able to fail for a corpus that
    //      satisfies the row, and each subject is the row's own instrument — the adapter corpus) ----
    // CONTROL 1 — the row's VERB-IDENTITY falsifier, routed through the adapter corpus: a corpus
    //   whose close route binds `'close'` instead of `'escape'` must be REJECTED by the row's
    //   identity limb while its STATE limb still passes (`'close'` is a legal foundation body and
    //   produces the same state and the same `changed` — so only the verb identity separates them).
    const identityLimbRejects = (verb: unknown): boolean => forbidden.includes(String(verb))
    const closeBoundCorpusIsRejected = identityLimbRejects('close') && overlayTransition('open', 'close').changed === overlayTransition('open', 'escape').changed
    attempt(
      run,
      i++,
      closeBoundCorpusIsRejected
        ? null
        : "CONTROL 1: a corpus whose close route binds 'close' MUST be rejected by the row's verb-identity limb while its state limb still passes ('close' answers the same pair as 'escape')",
    )
    // CONTROL 2 — a corpus that pushes a FORK TOKEN as a verb must be caught by the SAME oracle:
    //   the oracle is driven on the adapter's own forbidden list, and the mechanism is shown to
    //   answer the declared NO-MOVE record for such a token (which is why the discipline is
    //   checkable rather than merely asserted).
    const forkTokenCall = overlayTransition('open', 'is-open')
    attempt(
      run,
      i++,
      forbidden.includes('is-open') && forkTokenCall.state === 'open' && forkTokenCall.changed === false
        ? null
        : 'CONTROL 2: a fork token pushed as a verb must be caught by the row\'s forbidden-token oracle AND must be a declared no-move body for the mechanism',
    )
    // CONTROL 3 — a corpus that FABRICATES a `'held'` body must be caught: the row's
    //   reachability instrument (the adapter corpus's own handed-in words, walked through the
    //   adopted mechanism) must never yield `'held'`/`'closing'` from the two REACHABLE bodies.
    const reachable = new Set<AdoptedBody>(['closed'])
    for (let r = 0; r < 6; r++) for (const from of [...reachable]) for (const verb of ['open', 'escape', 'toggle']) reachable.add(overlayTransition(from, verb).state as AdoptedBody)
    attempt(run, i++, !reachable.has('held') && !reachable.has('closing') ? null : 'CONTROL 3: the fork must not reach the held/closing bodies through its own four verbs — so a fabricated one is detectable')

    finish('P-MD-TP-2', run, 25)
  })
})

// ===========================================================================
// §4 `P-MD-SM-3` — `strat:pd-ui-6-vendored-and-kept-half`
//   Declared: `5` fact classes × `1` reading = `5`; plus `3` controls.
//   `(bounded) ON (e)` — a token scan over this unit's write set cannot prove the absence of
//   an applied write reached through an alias or a computed property. The bound is stated.
//   ⟨AMENDED 2026-09-29 (finding `A-5`; the disposal is at `§0C` item 1) — annotate-beside, the
//   as-filed bound is KEPT VISIBLE: limb (e)'s scan is a SPELLING-BOUND SCAN. Its needle set is
//   now WIDENED to the bracket/template/computed spellings the amended `§4` declares
//   (`el['inert']`, a template literal, a concatenated name — each caught by the BARE-token needle
//   the quoted spellings had subsumed), and CONTROL 2 no longer uses the needles' OWN spelling.
//   The bound still stands: (e) proves the absence of an applied write IN THE DECLARED SPELLINGS
//   over the declared write set — never the absence of the write itself, and never a proof over
//   aliases or runtime-computed names (`el[name]`).⟩
// ===========================================================================
describe('PD-UI-6 §4 P-MD-SM-3 — the vendored module is CONSUMED, not touched, and the kept half survives (strat:pd-ui-6-vendored-and-kept-half)', () => {
  beforeEach(() => {
    installShim()
  })

  it('P-MD-SM-3 — (a) the digest equals the manifest, (b) the vendored bytes carry no DOM/vocabulary literal, (c) the adapter imports exactly one module, (d) the re-parent survives, (e) no attribute-name token anywhere in the write set (5 + 3)', async () => {
    await loadAdopted()
    const run = newRun()
    let i = 0
    const vendoredBytes = readText(VENDORED_PATH)
    const manifest = JSON.parse(readText(MANIFEST_PATH)) as { modules: Array<Record<string, unknown>> }
    const entry = manifest.modules.find((m) => String(m.name) === 'overlay')!

    // (a) the Phase-0 pin, unchanged
    const digest = createHash('md5').update(vendoredBytes).digest('hex')
    attempt(run, i++, digest === String(entry.md5) ? null : `(a) src/shared/overlay.ts md5 ${digest} ≠ the manifest's recorded ${String(entry.md5)}`)
    // (b) zero imports and no DOM/vocabulary literal
    const sf = ts.createSourceFile('overlay.ts', vendoredBytes, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const importCount = sf.statements.filter(ts.isImportDeclaration).length
    const bannedTokens = ['document', 'window', 'matchMedia', 'addEventListener', 'getElementById', 'appendChild', 'className', 'is-open', 'is-closed', 'scrim', 'settings-modal']
    const hits = bannedTokens.filter((tok) => vendoredBytes.includes(tok))
    attempt(
      run,
      i++,
      importCount === 0 && hits.length === 0
        ? null
        : `(b) the vendored module must carry ZERO import statements (read ${importCount}) and no DOM/vocabulary literal (read ${hits.join(', ') || 'none'})`,
    )
    // (c) the adapter's import census
    const adapterSf = ts.createSourceFile('modal-state.ts', readText(MODAL_PATH), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
    const adapterImports = adapterSf.statements.filter(ts.isImportDeclaration)
    const adapterSpecs = adapterImports.map((d) => (ts.isStringLiteralLike(d.moduleSpecifier) ? d.moduleSpecifier.text : '<computed>'))
    attempt(
      run,
      i++,
      adapterImports.length === 1 && adapterSpecs[0] === '../shared/overlay.js'
        ? null
        : `(c) the adapter must import EXACTLY one module — the vendored one ('../shared/overlay.js'); it imports ${adapterImports.length}: ${adapterSpecs.join(', ')}`,
    )
    // (d) the re-parent survives: exactly the two literal mounts, no app-graph node
    installShim() // this row stands alone: the shim is installed here (not only in a sibling row's `beforeEach`)
    const auth = authorModal()
    const installModule = (await import('../src/renderer/modal-state.js')) as { installSettingsModal?: (...a: unknown[]) => void }
    const install = installModule.installSettingsModal
    if (typeof install === 'function') {
      caught(() => (install as () => void)())
      const doc = globalThis.document as unknown as { body: ShimElement }
      const app = doc.body.children.find((c) => c.id === 'app')
      const ok = auth.modalBody.children.length === 2 && auth.modalBody.children.includes(auth.panes) && auth.modalBody.children.includes(auth.opPanes) && !auth.modalBody.children.includes(app as ShimElement)
      attempt(run, i++, ok ? null : "(d) the re-parent must leave `#settings-modal-body`'s children as EXACTLY `#panes` + `#operator-panes`, with no app-graph node")
    } else {
      attempt(run, i++, 'PD-UI-6 contract failure [§2.7]: `installSettingsModal(): void` must be exported — the re-parent half is KEPT')
    }
    // (e) the scope exclusion: no attribute-name token and no attribute write in the write set
    const writeSet = [readText(MODAL_PATH), readText(join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')), vendoredBytes]
    const tokenHits = writeSet.flatMap((t) => scanForExcludedTokens(t))
    attempt(run, i++, tokenHits.length === 0 ? null : `(e) the scope exclusion is violated: the write set carries ${tokenHits.join(', ')}`)

    // ---- the THREE CONTROLS (`A-2`'s restated rule: each MUST be able to fail for a corpus that
    //      satisfies the row, and each subject is the row's own instrument) ----
    // CONTROL 1 — the digest instrument must be able to fail: a one-byte synthetic perturbation
    //   of the vendored bytes must read a DIFFERENT md5 than the manifest's. (Kept: already a
    //   true falsifier of limb (a) — a corpus that edited the vendored module is caught.)
    const perturbed = vendoredBytes.replace('overlayTransition', 'overlayTransitioX')
    attempt(run, i++, createHash('md5').update(perturbed).digest('hex') !== String(entry.md5) ? null : 'CONTROL 1: a one-byte synthetic perturbation of the vendored file must fail (a)')
    // CONTROL 2 (`A-5`) — THE SPELLING-BOUND CONTROL, and it no longer uses the needles' OWN
    //   spelling. ⟨RE-STATED 2026-09-29 (findings `A-2`/`A-5`) — annotate-beside, AS FILED this
    //   control built its synthetic corpus with the needles' own quoted/call spelling
    //   (`node.setAttribute('inert', '')`), so it could not show the scan reaches a DIFFERENTLY
    //   spelled write. It now drives a TEMPLATE-LITERAL spelling the as-filed narrow needles MISS:
    //   the widened set catches it, the narrow set does NOT — which is what makes the widening
    //   load-bearing rather than cosmetic. (A BRACKET spelling such as `el['inert']` is caught by
    //   the narrow set too, since it CONTAINS the quoted form.) THE STATED BOUND IS DRIVEN TOO: a
    //   RUNTIME-computed name (`el[name]`, the string built outside the scanned text) is beyond
    //   every text scan, and the control ASSERTS that gap rather than letting it pass silently —
    //   that negative is precisely what the `(bounded) ON (e)` carve-out declares.⟩
    const templateSpelledWrite = 'node[`in' + 'ert`] = ' + Q + Q
    const widenedHits = scanForExcludedTokens(templateSpelledWrite)
    const narrowHits = scanWithNarrowNeedles(templateSpelledWrite)
    const runtimeComputedWrite = 'const n = at' + 'tr\nnode[n] = ' + Q + Q
    const computedIsOutOfReach = scanForExcludedTokens(runtimeComputedWrite).length === 0
    attempt(
      run,
      i++,
      widenedHits.length > 0 && narrowHits.length === 0 && computedIsOutOfReach
        ? null
        : `CONTROL 2: a synthetic corpus writing the attribute in a TEMPLATE-LITERAL spelling (${String(widenedHits.length)} hit(s) under the widened set, ${String(narrowHits.length)} under the as-filed narrow set) must be caught by (e) and missed by the narrow set, while a RUNTIME-computed name must remain out of the scan's reach (the declared bound); computedIsOutOfReach=${String(computedIsOutOfReach)}`,
    )
    // CONTROL 3 (`A-2`) — ⟨RE-STATED 2026-09-29 — annotate-beside, AS FILED this control read
    //   `dropOneMount === 1 && children.length !== dropOneMount`, where `dropOneMount` was a
    //   literal `1` and the two arms were the same object's length: a TAUTOLOGY that could not
    //   fail. It now drives a real DROP-ONE-MOUNT corpus through the row's own (d) instrument —
    //   the append count the re-parent performs — and shows the oracle accepts the landed
    //   two-mount result and REJECTS the one-mount corpus.⟩
    const reParentOracle = (appendCount: number): boolean => appendCount === 2
    let landedAppends = 0
    {
      // a FRESH document (the marker is compared by identity), so the install actually wires here
      installShim()
      const countingBody = authorModal()
      const originalAppend = countingBody.modalBody.appendChild.bind(countingBody.modalBody)
      countingBody.modalBody.appendChild = ((child: ShimElement) => {
        landedAppends++
        return originalAppend(child)
      }) as typeof countingBody.modalBody.appendChild
      caught(() => (install as () => void)())
    }
    const dropOneMountCorpusAppends = 1 // a corpus that re-parents ONE mount
    attempt(
      run,
      i++,
      reParentOracle(landedAppends) && !reParentOracle(dropOneMountCorpusAppends)
        ? null
        : `CONTROL 3: the re-parent oracle must ACCEPT the landed two-mount result (observed ${String(landedAppends)} append(s)) and REJECT a drop-one-mount corpus (${String(dropOneMountCorpusAppends)})`,
    )
    finish('P-MD-SM-3', run, 8)
  })
})

// ===========================================================================
// §4 `P-MD-SM-4` — `strat:pd-ui-6-pin-safety`
//   Declared: `6` pin classes × `1` reading = `6`; plus `3` controls.
// ===========================================================================
describe('PD-UI-6 §4 P-MD-SM-4 — no `G-9` pin and no protected file is disturbed (strat:pd-ui-6-pin-safety)', () => {
  it("P-MD-SM-4 — (a) testTimeout, (b) the pinned scripts, (c) the electron-mock census, (d) the authored markup, (e) the ONE re-stated allow-list row, (f) the four baseline files (6 + 3)", async () => {
    const run = newRun()
    let i = 0
    // (a) `vitest.config.ts`
    const cfg = readText(join(REPO_ROOT, 'vitest.config.ts'))
    attempt(run, i++, /testTimeout\s*:\s*15_000/.test(cfg) ? null : "(a) `vitest.config.ts`'s `testTimeout` must read exactly `15_000` — `G-9` pins the floor AND the ceiling")
    // (b) `package.json`'s pinned scripts
    const pkg = JSON.parse(readText(join(REPO_ROOT, 'package.json'))) as { scripts: Record<string, string> }
    attempt(
      run,
      i++,
      pkg.scripts.test === 'vitest run' && pkg.scripts['test:watch'] === 'vitest' && !/testTimeout/.test(pkg.scripts.test)
        ? null
        : `(b) the pinned scripts must stay exactly \`test: "vitest run"\` / \`test:watch: "vitest"\` with no \`--testTimeout\`; read ${String(pkg.scripts.test)} / ${String(pkg.scripts['test:watch'])}`,
    )
    // (c) the electron-mock census, DERIVED by scanning `tests/**/*.test.ts`
    function listTestFiles(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = join(dir, e.name)
        if (e.isDirectory()) return listTestFiles(p)
        return e.name.endsWith('.test.ts') ? [p] : []
      })
    }
    // DERIVED by AST — the same subject `pd-vendor-set.test.ts`'s `A-12` row derives (a
    // top-level binding of the mock API whose TARGET is `'electron'`), so this census is
    // derived rather than hard-coded and a sixth joiner (in any access form) is caught.
    function electronMockFiles(files: string[]): string[] {
      const out: string[] = []
      for (const f of files) {
        const sf = ts.createSourceFile(f, readFileSync(f, 'utf8'), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
        const aliases = new Set<string>()
        for (const stmt of sf.statements) {
          if (!ts.isImportDeclaration(stmt) || !ts.isStringLiteral(stmt.moduleSpecifier) || stmt.moduleSpecifier.text !== 'vitest') continue
          const clause = stmt.importClause
          if (clause === undefined) continue
          if (clause.name !== undefined) aliases.add(clause.name.text)
          const named = clause.namedBindings
          if (named !== undefined && ts.isNamespaceImport(named)) aliases.add(named.name.text)
          if (named !== undefined && ts.isNamedImports(named)) {
            for (const el of named.elements) if ((el.propertyName ?? el.name).text === 'vi') aliases.add(el.name.text)
          }
        }
        let hit = false
        const walk = (node: ts.Node): void => {
          if (ts.isCallExpression(node)) {
            const callee = node.expression
            const isMockCall =
              (ts.isPropertyAccessExpression(callee) && callee.name.text === 'mock' && ts.isIdentifier(callee.expression) && aliases.has(callee.expression.text)) ||
              (ts.isElementAccessExpression(callee) &&
                callee.argumentExpression !== undefined &&
                ts.isStringLiteral(callee.argumentExpression) &&
                callee.argumentExpression.text === 'mock' &&
                ts.isIdentifier(callee.expression) &&
                aliases.has(callee.expression.text))
            const first = node.arguments[0]
            if (isMockCall && first !== undefined && ts.isStringLiteral(first) && first.text === 'electron') hit = true
          }
          ts.forEachChild(node, walk)
        }
        walk(sf)
        if (hit) out.push(f.slice(f.lastIndexOf('/') + 1))
      }
      return out.sort()
    }
    const census = electronMockFiles(listTestFiles(join(REPO_ROOT, 'tests')))
    const PINNED_CENSUS = [
      'template-adversarial.test.ts',
      'unit-live11-bridge-seams.test.ts',
      'unit-u5-rich-commit-ipc.test.ts',
      'unit-v5-bridge-capture.test.ts',
      'unit-wave-1-bridge-wiring.test.ts',
    ]
    // the unit's NEW files must not join it — nor the non-electron binder list (graded INSIDE
    // the census class: a class is one reading)
    const selfName = 'pd-ui-6-modal-state-adoption.test.ts'
    const selfName2 = 'pd-ui-6-modal-state-register.test.ts'
    attempt(
      run,
      i++,
      census.join(',') === [...PINNED_CENSUS].sort().join(',') && !census.includes(selfName) && !census.includes(selfName2)
        ? null
        : `(c) the derived electron-mock census must be EXACTLY the five pinned names AND the unit's own new files must not join it; read [${census.join(', ')}]`,
    )
    // (d) the authored markup
    const html = readText(INDEX_HTML_PATH)
    attempt(
      run,
      i++,
      ['settings-modal', 'settings-modal-scrim', 'settings-modal-body', 'settings-toggle', 'panes', 'operator-panes'].every((id) => html.includes(id)) && /\.settings-modal\.is-closed\s*\{\s*display\s*:\s*none/.test(html)
        ? null
        : '(d) the authored modal markup / the `.is-closed` display rule must be unchanged',
    )
    // (e) the re-stated allow-list carries EXACTLY ONE `PD-UI-6` row and the negative control stands
    const pinText = readText(SET_PIN_PATH)
    const rowCount = [...pinText.matchAll(/unit:\s*'PD-UI-6'/g)].length
    const negativeControlStands = /NEGATIVE CONTROL the re-statement must carry/.test(pinText)
    attempt(
      run,
      i++,
      rowCount === 1 && /specifier:\s*'\.\.\/shared\/overlay\.js'/.test(pinText) && /member:\s*'overlay'/.test(pinText) && negativeControlStands
        ? null
        : `(e) the \`pd-vendor-set\` allow-list must have gained EXACTLY ONE \`PD-UI-6\` row (\`src/renderer/modal-state.ts\`, \`'../shared/overlay.js'\`, \`overlay'\`) and must keep its negative control — a relaxation would have removed it; read ${rowCount}`,
    )
    // (f) the four baseline files: absent from the vendoring targets, listed as not-replaced
    const manifest = JSON.parse(readText(MANIFEST_PATH)) as { modules: Array<Record<string, unknown>>; baselineFilesNotReplaced: string[] }
    const moduleNames = manifest.modules.map((m) => String(m.name))
    const baselines = ['dom-shim', 'types', 'demo-envelope', 'path-fork-cycle']
    attempt(
      run,
      i++,
      baselines.every((b) => !moduleNames.includes(b) && manifest.baselineFilesNotReplaced.includes(`src/shared/${b}.ts`))
        ? null
        : '(f) the four baseline files must stay OUTSIDE the vendoring targets and INSIDE `baselineFilesNotReplaced`',
    )

    // ---- the THREE CONTROLS (`A-2`'s restated rule: each MUST be able to fail for a corpus
    //      that satisfies the row, and each subject is the row's own instrument) ----
    // CONTROL 1 — ⟨RE-STATED 2026-09-29 (finding `A-2`) — annotate-beside, AS FILED this control
    //   was an ANY-CONFIG-PASSES DISJUNCTION: `clearMocks: false` absent AND a perturbed
    //   `testTimeout` not matching — true for essentially every config, so it could not fail. Its
    //   subject is now the row's OWN (a)-oracle, driven on a synthetic corpus that MUST be
    //   rejected.⟩
    const configOracle = (text: string): string | null => {
      if (!/testTimeout\s*:\s*15_000/.test(text)) return 'testTimeout is not exactly 15_000'
      if (/clearMocks\s*:\s*false/.test(text)) return 'clearMocks: false'
      return null
    }
    const syntheticConfig = cfg.replace('15_000', '5_000')
    const syntheticClearMocks = cfg.replace('testTimeout: 15_000', 'testTimeout: 15_000,\n    clearMocks: false')
    attempt(
      run,
      i++,
      configOracle(cfg) === null && configOracle(syntheticConfig) !== null && configOracle(syntheticClearMocks) !== null
        ? null
        : `CONTROL 1: the (a) oracle must ACCEPT the landed config and REJECT both a perturbed \`testTimeout\` (${String(configOracle(syntheticConfig))}) and a \`clearMocks: false\` config (${String(configOracle(syntheticClearMocks))})`,
    )
    // CONTROL 2 — a synthetic allow-list MISSING the `PD-UI-6` row must red limb (e): the row is
    //   load-bearing. The oracle is driven on both corpora so it is shown to discriminate.
    const allowListOracle = (text: string): boolean =>
      [...text.matchAll(/unit:\s*'PD-UI-6'/g)].length === 1 && /specifier:\s*'\.\.\/shared\/overlay\.js'/.test(text) && /member:\s*'overlay'/.test(text)
    const rowRemoved = pinText.replace(/unit:\s*'PD-UI-6'/g, "unit: 'PD-UI-9'")
    attempt(
      run,
      i++,
      allowListOracle(pinText) && !allowListOracle(rowRemoved)
        ? null
        : 'CONTROL 2: a synthetic allow-list MISSING the `PD-UI-6` row must be shown to red limb (e) — the row is load-bearing',
    )
    // CONTROL 3 — an allow-list carrying the row but with the NEGATIVE CONTROL REMOVED must be
    //   shown to be MISSING its discriminating power: the relaxation is distinguishable.
    const negativeControlOracle = (text: string): boolean => /NEGATIVE CONTROL the re-statement must carry/.test(text)
    const negativeControlRemoved = pinText.replace(/NEGATIVE CONTROL the re-statement must carry/g, 'the re-statement carries nothing else')
    attempt(
      run,
      i++,
      negativeControlOracle(pinText) && !negativeControlOracle(negativeControlRemoved)
        ? null
        : 'CONTROL 3: a synthetic allow-list whose NEGATIVE CONTROL was removed must be shown to have lost its discriminating power — a relaxation is distinguishable from the re-statement',
    )

    finish('P-MD-SM-4', run, 9)
  })
})

// ===========================================================================
// §4 — THE ARITHMETIC, PRINTED WITH ITS TERMS, AND THE ROW/STRATEGY DISCIPLINE.
// `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: "a total that is not the sum of its own
// terms, or a total quoted without its terms, is a review finding".
// ===========================================================================
describe('PD-UI-6 §4 — the register arithmetic, the caps, the row-id and strategy-id discipline', () => {
  it('§4 tally — the eight rows are authored in register order, each ≤100, the total 191 ≤ 400, and every term printed as the sum of its own factors', () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order').toEqual([
      'P-MD-IM-1',
      'P-MD-IM-2',
      'P-MD-SM-1',
      'P-MD-SM-2',
      'P-MD-TP-1',
      'P-MD-TP-2',
      'P-MD-SM-3',
      'P-MD-SM-4',
    ])
    expect(DECLARED_REGISTER.length, 'the register is EXACTLY eight rows — the ceiling, exactly FULL').toBe(8)
    for (const row of DECLARED_REGISTER) {
      const terms = row.declared.split('+').map((t) => Number(t.trim()))
      expect(terms.reduce((a, b) => a + b, 0), `${row.row}: the declared total must be the sum of its own printed terms (${row.declared})`).toBe(row.declaredTotal)
      expect(row.declaredTotal, `${row.row} must be ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    const total = DECLARED_REGISTER.reduce((a, r) => a + r.declaredTotal, 0)
    expect(
      total,
      '⟨AMENDED 2026-09-29 (finding `A-1` (iii); `§0C` item 11) — the AS-FILED total is KEPT VISIBLE: `35 + 20 + 17 + 27 + 50 + 21 + 8 + 9 = 187`, and in its own terms `32+3 + 15+5 + 14+3 + 20+4+3 + 46+4 + 18+3 + 5+3 + 6+3 = 187`. THE RE-DERIVED TOTAL: `35 + 20 + 17 + 27 + 50 + 25 + 8 + 9 = 191`, and in its own terms `32+3 + 15+5 + 14+3 + 20+4+3 + 46+4 + 22+3 + 5+3 + 6+3 = 191`. The delta is EXACTLY `P-MD-TP-2`\'s `18 → 22` (row `21 → 25`); every other row\'s term is UNMOVED.⟩',
    ).toBe(191)
    expect(total, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
  })

  it('§4 — every strategy id is `strat:pd-ui-6-*` (never the fork\'s `strat:modal-*`, never the foundation\'s `S-OV-*`), and every row id is `P-MD-*`', () => {
    for (const row of DECLARED_REGISTER) {
      expect(row.strategyId, `${row.row}: the strategy id is ` + '`strat:pd-ui-6-*`').toMatch(/^strat:pd-ui-6-[a-z-]+$/)
      expect(row.strategyId).not.toMatch(/strat:modal-|S-OV-/)
      expect(row.row, `${row.row}: every register row is ` + '`P-MD-*` — never a bare `P-IM-`/`P-SM-`/`P-TP-` id, never `P-OV-*`').toMatch(/^P-MD-(IM|SM|TP)-\d$/)
    }
  })

  it('§4 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(missing, 'every declared register row must have RUN and reported — a term dropped from the table without a contract amendment must be a LOUD failure, never a vacuous pass').toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · bounded ${r.bounded ?? 'NO'} · counterexamples ${r.counterexamples.length}`,
    )
    // the report is PRINTED (visible in the run output) and its own totals are re-derived
    // here so a silently-reduced term is caught
    // eslint-disable-next-line no-console
    console.log('PD-UI-6 REGISTER REPORT\n' + lines.join('\n'))
    expect(REPORTS.length, 'all eight rows reported').toBe(8)
    const planned = REPORTS.reduce((a, r) => a + (r.executed < r.declaredTotal ? r.declaredTotal : r.executed), 0)
    expect(
      planned,
      'the PLANNED total must equal the re-derived declared 191 (the as-filed 187 is superseded by `A-1` (iii)\'s single term move, `§0C` item 11) — a row that STOP-AFTER-5 abandons reports the abandonment (`stoppedAt`) and its declared term is NOT reduced; a term silently dropped from the table is a LOUD failure here',
    ).toBe(191)
    expect(REPORTS.every((r) => r.held), `every row must hold; broken: ${REPORTS.filter((r) => !r.held).map((r) => r.row).join(', ')}`).toBe(true)
  })
})
