// tests/relocate.test.ts
// ===========================================================================
// U-RELOCATE · wave E (ledger row `E4`) · upstream `SCH-7` (`A-d4`, ADOPTED-RESHAPED)
// · **THE RED SET** (RCA-1) · authored 2026-09-27 against `docs/specs/relocate.md`
// (the spec gate, approved at filing).
//
// Contract: `docs/specs/relocate.md` — read IN FULL before authoring: the
// `CURRENT STATE` block, `§0` (the twelve recorded rulings) and `§0A` (the twelve
// dated ruling notes — CONTRACT, not commentary), the Layer declaration (five
// honesty anchors), `§1` (scope items 1–8), `§2.1` (the surface: the export census
// `2 + 8 = 10`, the EIGHT type declarations, the FIVE module members, the ELEVEN
// `RelocateStats` fields, the SEVEN injected seams and the factory signature),
// `§2.2` (the twelve prohibitions `P-1`..`P-12`), `§2.3` (items 1–8: the proximity
// decision, the distance's transport, the `threshold` reconciliation, the three
// channels, the monotonicity rule, the evaluation order, the pre-drag capture point,
// no other arithmetic), `§2.4` (items 1–5: the seven named safe defaults, the throw
// dispositions, the candidate answer's degradation, the total-member-read rule, the
// no-invented-code rule), `§2.5` (the composition boundary — the closed call set),
// `§2.6` (the seven sibling properties + the `F-11`/`F-12` split), `§3.1`
// (`M-1`..`M-17`), `§3.2` (`F-1`..`F-19`), `§3.3` (`I-1`..`I-15`), `§3.4` (the static
// rows `R-1`..`R-18`), `§3.5` (the existence row `X-1`), `§4` (`§4.1` the red
// statement, `§4.2` the authoring order, `§4.3` what the red is NOT, `§4.4` the
// fourteen stop conditions `S-PURE-1`..`S-14`, `§4.5` the delegation gate), `§5.1`
// (diff scope + the DENIED set), `§5.2` (the FOUR legs and the three refusals),
// `§5.3` (the DONE row's twelve items), **`§5.5`/`§5.5.1` (the typed property
// register — ALL FIFTEEN rows / SIXTEEN terms, executed here as the EXECUTED
// property layer, `170` = `21+14+12+3+8+21+5+11+5+6+3+14+7+4+30+6`, seed
// `20260927`, caps `≤100`/row · `≤400` total · stop-after-5-consecutive-failures)**,
// `§5.5.2` (the honesty block: the `(bounded)` set, the declared-versus-distinct
// ledger, the pool-versus-boundary check, the generator's stated bias), `§5.5.3`
// (the attempt arithmetic with its term-by-term addition), `§6` (the three
// falsifications), `§7` (the thirteen honest statements), `§7a`/`§7a.1` (the three
// reported items: two OPEN with a working default, one DERIVED and
// PINNED-PENDING-CONFIRMATION), `§8`, and `§3a`/`§3b` at the END (the adversarial
// SEED set — the `A-*` rows belong to the LATER pass and NONE is authored here;
// `§3b` is EMPTY BY CONSTRUCTION).
//
// LAYER: **[T] call counts, channel identity and ONE PURE FUNCTION'S BOOLEAN over
// arguments.** This unit touches no DOM at all — not even `src/shared/dom-shim.ts`
// (layer anchor 2): the ELEMENT is an argument, the SESSION is a recording double of
// its own, the candidate answer is an argument and the three channels are the row's
// own spies. **No row below asserts a rendered-geometry, layout, paint, coordinate,
// applied-CSS, cursor, magnitude or click-retargeting property** (`I-11`, `R-8`):
// `§5.2` offers no `[U]` row (structurally: the module is imported by no `src/**`
// file — `R-6`/`R-12`) and claims no `[D]` row (`§2.6`'s `F-12` is
// `PRECONDITION-GATED`, and `R-17` is the probe that states the non-claim).
//
// **THE DISTANCE IS A CALLER-SUPPLIED SCALAR THE ROW PICKS.** No row computes a
// distance from a coordinate, and no row measures anything (`§4.3`, `S-5`, `S-9`).
//
// **THIS FILE IS THE UNIT'S RED SET (`§4.1`) AND NOTHING ELSE.** It is authored
// FIRST and RUN before any implementation: `src/shared/relocate.ts` does not exist,
// so every clause row, every static row and every register row fails on the
// module-absent boundary. **No `src/**`, `scripts/**`, `package.json`, `tsconfig*`,
// `docs/**` or sibling test file is created or modified by this pass.**
//
// THE IMPORT BOUNDARY (`§4.1`, the repo's established technique — an `fs` existence
// probe plus a RUN-TIME-COMPUTED specifier resolved through a dynamic
// `import(/* @vite-ignore */ …)`): every row fails as a **LABELLED ASSERTION** naming
// the absent module, never as a collection error that would take the whole red set
// down. `PRE-1` proves the mechanism itself resolves, against an EXISTING module.
//
// LEG 4 (`§5.2` leg 4): `R-5`(b) asserts the EIGHT TYPE-ONLY names of `§2.1`
// (`CandidateFor`, `CommitSink`, `PreviewSink`, `RelocateHandle`, `RelocateOptions`,
// `RelocateSession`, `RelocateStats`, `RelocateTargetFor`) through the `import type`
// declarations below, and an imported type name is ERASED AT RUN TIME — so the honest
// leg is a standalone strict `tsc` over THIS file. At RED time that leg reports the
// module-absent boundary (`TS2307`) and nothing else. **The `TS2307` diagnostic is
// NOT suppressed** (no `@ts-ignore` anywhere below): suppressing it would make the
// type-only export claim unfalsifiable.
//
// AUTHORED ORDER (`§4.2` items 1–5): the `§3.5` existence row `X-1` FIRST with
// `§3.4`'s `R-17`/`R-18`/`R-9` (the red's own premise, evaluable before the module
// exists), then the `§3.4` static rows `R-1`..`R-16`, then the `withinProximity` block
// (`M-2`, `F-1`..`F-3`, `I-1`, `I-12`), then the invariants `I-2`..`I-15`, then
// `M-1`, `M-3`..`M-17`, then `F-4`..`F-19`, then the register's own harness rows
// (`PRE-*`/`REGISTER-STATUS`), then **the `§5.5.1` register rows IN REGISTER ORDER**
// (`P-RL-IM-1` · `P-RL-IM-2` · `P-RL-IM-3` · `P-RL-IM-4` · `P-RL-IM-5` ·
// `P-RL-SM-1` · `P-RL-SM-2` · `P-RL-SM-3` · `P-RL-SM-4` · `P-RL-SM-5` ·
// `P-RL-SM-6` · `P-RL-SM-7` · `P-RL-SM-8` · `P-RL-TP-1` · `P-RL-TP-2`), and finally
// the register's executed-reconciliation row. The `describe` blocks below are in that
// order; NOTHING is renumbered.
//
// THE COUNT SEAM IS THE MODULE'S OWN (`§0A` note 10): where a row counts a channel it
// reads the CONSUMER's own record BESIDE `stats()` and requires the two readings to
// AGREE (`F-5`, `M-15`) — no row trusts a test-authored spy alone.
//
// REGISTER EXECUTION (`§5.5.1` strategy discipline): plain deterministic vitest
// tables; ONE pinned-seed hand-rolled LCG for `P-RL-TP-1` only (`state₀ = 20260927`,
// ONE step per draw, `index = stateₙ₊₁ mod pool.length`, `pool.length = 15`) — **no new
// dependency, no new script, no `package.json` change** (`§5.1` item 7, `§5.5`).
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// ===========================================================================
// `§2.1`/`§3.4 R-5`(b) — THE TYPE-ONLY HALF, through `§5.2` leg 4. These EIGHT
// imports are the compile-time claim that the module exports the eight type
// declarations of `§2.1`: this file does not compile unless it does. The `TS2307`
// this produces while the module is ABSENT is the red's own leg-4 form and is NOT
// suppressed (a `@ts-ignore` here would make the type claim unfalsifiable).
// ===========================================================================
import type { CandidateFor as ModuleCandidateFor } from '../src/shared/relocate.js'
import type { CommitSink as ModuleCommitSink } from '../src/shared/relocate.js'
import type { PreviewSink as ModulePreviewSink } from '../src/shared/relocate.js'
import type { RelocateHandle as ModuleRelocateHandle } from '../src/shared/relocate.js'
import type { RelocateOptions as ModuleRelocateOptions } from '../src/shared/relocate.js'
import type { RelocateSession as ModuleRelocateSession } from '../src/shared/relocate.js'
import type { RelocateStats as ModuleRelocateStats } from '../src/shared/relocate.js'
import type { RelocateTargetFor as ModuleRelocateTargetFor } from '../src/shared/relocate.js'

// ===========================================================================
// §2.1 — THE CONTRACT SHAPES, MIRRORED AS STRUCTURAL TYPES. The module cannot be
// imported for its values while it is absent, so this file mirrors `§2.1`'s block;
// the mirror is used ONLY as the harness's own type surface (it is never asserted to
// BE the module's surface — that is `R-5`'s and leg 4's claim, made through the
// `import type` declarations above).
// ===========================================================================
type GestureHandle = {
  readonly id: number
  readonly element: unknown
  readonly active: boolean
  readonly outcome: 'end' | 'reset' | 'cancel' | null
  readonly value: unknown
  set(value: unknown): GestureHandle
}
type RelocateResetResult = { readonly ok: boolean; readonly code: string; readonly committed: boolean }
type RelocateStatsMirror = {
  readonly attached: number
  readonly gestures: number
  readonly moves: number
  readonly candidateCalls: number
  readonly resolveCalls: number
  readonly revealWrites: number
  // RENAMED 2026-09-27 (`§0A` note 14 item 1): the member AS FIRST WRITTEN in this
  // mirror carried the name `§3.4 R-1` bans as a CENSUS token — the module's bytes
  // (comments included) may not carry it, so the mandated member is now
  // `revealWritesApplied` ("reveal writes that RETURNED without throwing", the pair
  // partner of `revealWrites`). The count is ELEVEN before and after; this mirror's
  // key set is asserted against the module's own `stats()` in `P-RL-TP-1`/`P-RL-TP-2`.
  readonly revealWritesApplied: number
  readonly resets: number
  readonly sinkCalls: number
  readonly written: number
  readonly lastCode: string
}
type RelocateModuleMirror = {
  attach(element: unknown, hooks?: Record<string, unknown>): boolean
  detach(): boolean
  reset(element: unknown): RelocateResetResult
  stats(): RelocateStatsMirror
  readonly detached: boolean
}
type RelocateOptionsMirror = Record<string, unknown>

// ===========================================================================
// THE IMPORT BOUNDARY (`§4.1`) and the path constants the static/existence rows use.
// ===========================================================================
const MODULE_SRC = new URL('../src/shared/relocate.ts', import.meta.url)
/** The run-time specifier of `§5.1` row 1, assembled at RUN time so the unresolvable
 *  import cannot fail this file's transform while the module is absent. */
const MODULE_SPECIFIER = ['..', 'src', 'shared', 'relocate.js'].join('/')
const SESSION_SPECIFIER = ['..', 'src', 'shared', 'gesture-session.js'].join('/')
const TEST_FILE = fileURLToPath(import.meta.url)
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const MODULE_RELPATH = 'src/shared/relocate.ts'
const TEST_RELPATH = 'tests/relocate.test.ts'
const SPEC_RELPATH = 'docs/specs/relocate.md'

/** `§4.1` — the module-absent reason, as DATA: a clause row asserts it (so the red
 *  message names the absent module) while a REGISTER row counts it as a BROKEN attempt
 *  (`§5.5.1`'s stop-after-5 discipline is what reports the red run's early stop, and a
 *  throw would hide it). */
let moduleCache: { mod: Record<string, unknown> | null; reason: string | null } | null = null
async function resolveModule(): Promise<{ mod: Record<string, unknown> | null; reason: string | null }> {
  if (moduleCache !== null) return moduleCache
  if (!existsSync(MODULE_SRC)) {
    moduleCache = {
      mod: null,
      reason: `the module of §2.1/§5.1 row 1 does not exist yet (${fileURLToPath(MODULE_SRC)})`,
    }
    return moduleCache
  }
  try {
    const mod = (await import(/* @vite-ignore */ MODULE_SPECIFIER)) as unknown as Record<string, unknown>
    moduleCache = { mod, reason: null }
  } catch (e) {
    moduleCache = { mod: null, reason: `the module does not resolve: ${describeThrown(e)}` }
  }
  return moduleCache
}

/** The CLAUSE rows' boundary. Fails as an ASSERTION carrying the row's label and
 *  RETURNS the namespace so a row's body stays type-clean. */
async function requireModule(label: string): Promise<Record<string, unknown>> {
  const { mod, reason } = await resolveModule()
  if (mod === null) {
    expect(
      reason,
      `RED — U-RELOCATE red set (§4.1): ${reason ?? 'the module surface is unavailable'}. ` +
        `This row drives §2.1's surface. [${label}]`,
    ).toBe(null)
  }
  return mod as Record<string, unknown>
}

/** The named VALUE export of `§2.1`, through the same boundary. */
async function valueExport<T>(name: string, label: string): Promise<T> {
  const mod = await requireModule(label)
  const value = mod[name]
  expect(
    typeof value,
    `§2.1/§3.4 R-5(a) — the runtime VALUE export \`${name}\` is exported by \`${MODULE_RELPATH}\` (the export census is a SET claim: ${JSON.stringify(
      Object.keys(mod).sort(),
    )}) [${label}]`,
  ).not.toBe('undefined')
  return value as T
}

async function makeModule(options?: RelocateOptionsMirror, label = 'the factory'): Promise<RelocateModuleMirror> {
  const create = await valueExport<(o?: RelocateOptionsMirror) => RelocateModuleMirror>('createRelocateSession', label)
  const mod = create(options)
  expect(mod, `§2.1 — \`createRelocateSession\` returns a usable instance [${label}]`).not.toBe(undefined)
  return mod
}

function describeThrown(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}` : String(e)
}
function brief(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'symbol') return value.toString()
  if (typeof value === 'function') return 'a function'
  if (Array.isArray(value)) return `an array of ${value.length}`
  if (typeof value === 'object') return `an object {${Object.keys(value as object).join(',')}}`
  return String(value)
}

// ===========================================================================
// THE RECORDING SESSION DOUBLE (`§2.5` item 1 — the FROZEN delegate surface this unit
// composes, mirrored here as the rows' argument). It is a DOUBLE OF ITS OWN, not the
// landed session, and it records the exact arguments of every member the module may
// call, so a row asserts the CALLS THE MODULE MADE — never a fact about a browser or
// about `U-GSESSION`'s own rows (`§4.3`: *"Not a session test"*).
//
// WHAT THE DOUBLE RECORDS, and the honest reading of each field:
//   · `ops`        — the MUTATING delegations in order (`install` / `reset` /
//                    `dispose`), which is the closed call set of `§2.5` item 1. The
//                    read-only readings (`stats()`, `gesture()`, `disposed`) are
//                    counted in `reads` BESIDE them, never in `ops`: a row asserting
//                    *"ZERO session calls"* means the delegating call set is empty.
//   · `installOptions` — the options object handed to `install`, BY IDENTITY, so the
//                    row can read its own KEY SET (`M-1`, `R-10`).
//   · `resets`     — the `reset` delegations with element/handle/value by IDENTITY.
// `§0A` note 7: the session's own `commit` CONSTRUCTION option is the WIRING's, and
// the double's `sink` parameter is exactly that wiring — never the module's sink.
// ===========================================================================
type SessionOp = { readonly op: 'install' | 'reset' | 'dispose'; readonly element: unknown; readonly handle?: unknown; readonly value?: unknown }
type SessionDoubleOptions = {
  /** The code the double's `reset` refuses with (a member of the session's own closed
   *  union). `null` ⇒ the double's `reset` succeeds. */
  readonly refuseResetWith?: string | null
  /** What `install` answers (`§2.1`'s `attach` refusal class). */
  readonly installAccepts?: boolean
  /** What `dispose` reports. */
  readonly disposeComplete?: boolean
  /** THE WIRING'S OWN SINK — the session's `commit` construction option (`§0A` note 7).
   *  Never the module's `commit` seam unless a row deliberately makes them one function
   *  (`F-6`). */
  readonly sink?: ((gesture: GestureHandle, value: unknown) => void) | null
  readonly disposed?: boolean
  /** `M-3` — THE TURN TRACE. The module's OWN `onStart` wrapper is the ONE wrapper the
   *  contract's pinned turn order names as an ITEM (`§2.3` item 6's lead-in: *"`onStart`
   *  WRAPPER → THE CONSUMER'S `onStart` → …"*), and the move turn's wrapper is the
   *  CONTAINER of the sequence the same clause lists rather than an item in it. So the
   *  session's own invocation of that one wrapper is marked into the ROW's order log
   *  (the double's own `hookCalls` is a DIFFERENT array, and no module can push into a
   *  row's closures) — which is what makes the pinned order OBSERVABLE. */
  readonly trace?: string[]
}
type SessionDouble = {
  readonly ops: SessionOp[]
  readonly reads: string[]
  readonly installs: Array<{ element: unknown; options: unknown }>
  /** The `reset` DELEGATIONS, with the THIRD ARGUMENT recorded AS THE CALLER PASSED IT and
   *  the CALL's own `arity` (`§2.3` item 9(a)): there is NO substitution anywhere — the
   *  *"fewer than three arguments ⇒ substitute my own value"* form is GONE, because it made
   *  every identity assertion UNFALSIFIABLE. */
  readonly resets: Array<{ element: unknown; handle: unknown; value: unknown; arity: number }>
  /** THE SESSION'S OWN TERMINAL LOG (`§2.5` item 6): ONE entry per terminal that RAN,
   *  carrying the session's own `outcome` and the value the session handed its hook. This
   *  is the reading a row uses where it must say *"this was a COMMITTING terminal, not a
   *  cancel"* — the install-options `'commit'` member the double used to read does NOT
   *  exist on the frozen surface (`§2.5` item 7 clauses 1–3). */
  readonly terminals: Array<{ outcome: 'end' | 'reset'; value: unknown }>
  /** THE SESSION'S OWN REFUSAL LOG: ONE entry per REFUSED `reset` (the frozen union's own
   *  code). A row that declares a REFUSED terminal reads THIS, so the cell is not vacuous:
   *  it proves the module ATTEMPTED a terminal and the session refused it. */
  readonly refusals: string[]
  /** **`ADV-RL-13` — THE DELEGATION-ATTEMPT LOG: every `reset` DELEGATION THIS DOUBLE
   *  RECEIVED, LOGGED BEFORE ANY REFUSAL IS DECIDED.** An `ops`-length reading cannot see a
   *  REFUSED delegation (`ops` is pushed only on the SUCCESS path), so a row that declares
   *  *"ZERO session calls"* could not distinguish *"the module refused locally"* from *"the
   *  module delegated and the session refused"*. This log makes both readings OBSERVABLE:
   *  `refused === null` ⇒ the session ran the terminal; a code ⇒ the attempt was refused with
   *  THAT code. It is read BESIDE `ops`/`resets`, never substituted for them. */
  readonly attemptedResets: Array<{ element: unknown; handle: unknown; value: unknown; arity: number; refused: string | null }>
  /** **THE `dispose` DELEGATIONS THIS DOUBLE RECEIVED** — `M-16`'s reading. It is a
   *  GETTER over the closure counter, so the figure a row reads is the DELEGATION THE
   *  MODULE ACTUALLY MADE. *(**REPAIRED 2026-09-27 (the `M-16` harness defect):** the
   *  object literal used to carry its own `disposes: 0` property while `dispose()`
   *  incremented the CLOSURE's counter — so the row read `0` beside an `ops` log that
   *  carried the one `dispose` delegation, and the reading could not observe the
   *  delegation it declared. The two names are now ONE reading.)* */
  readonly disposes: number
  /** **THE HANDLES THE SESSION ITSELF HANDED THE MODULE'S OWN `onMove` WRAPPER**, in the
   *  order it handed them out. This is the identity baseline a row can compare against
   *  WITHOUT reading its own closure back: the handle the module captures arrives through
   *  that wrapper, so `M-3` asserts the `gesture` argument `resolveTarget` receives IS
   *  this object (`toBe`) — a reading about the SESSION's own handle. */
  readonly handed: unknown[]
  hookCalls: string[]
  /** The recorded hook options of the LAST accepted `install`, by identity. */
  hooks: Record<string, unknown> | null
  element: unknown
  /** The element the session hands the module's wrappers. **THE SECOND PARAMETER IS
   *  VESTIGIAL AND IS READ BY NO DECLARATION**: it is the parameter the pre-2026-09-27
   *  double used to substitute its own value from (`§2.3` item 9(a)); that substitution is
   *  GONE, and the caller's pre-drag value now travels on the consumer's own hooks record
   *  (`§2.1` item 7) — `setPreDrag`/`preDragValueOf` in the rows below. */
  setElement(element: unknown, vestigialPreDragValue?: unknown): void
  /** ESTABLISHMENT (`§2.3` item 6(b)) — the session's own `onStart` call. */
  establish(): void
  /** ONE OBSERVED MOVE (`§2.3` item 6(c)) — the session's own `onMove` call. */
  move(): void
  /** The `'end'` TERMINAL (`§2.3` item 6(d)). */
  terminate(value?: unknown): void
  /** The `'reset'` TERMINAL, entered by the module's own move turn (`§0A` note 8). */
  reset(element?: unknown, handle?: unknown, value?: unknown, arity?: number): RelocateResetResult
  /** A `cancel`: the module's COMMITTING terminal logic is never reached (`§2.3` item 6(d))
   *  — while the module's own installed `onCancel` wrapper IS invoked, exactly as the
   *  landed session's cancel path invokes it (`src/shared/gesture-session.ts`). */
  cancel(): void
  sessionObject: Record<string, unknown>
}
function sessionDouble(opts: SessionDoubleOptions = {}): SessionDouble {
  const ops: SessionOp[] = []
  const reads: string[] = []
  const installs: Array<{ element: unknown; options: unknown }> = []
  const resets: Array<{ element: unknown; handle: unknown; value: unknown; arity: number }> = []
  const terminals: Array<{ outcome: 'end' | 'reset'; value: unknown }> = []
  const refusals: string[] = []
  const attemptedResets: Array<{ element: unknown; handle: unknown; value: unknown; arity: number; refused: string | null }> = []
  const handed: unknown[] = []
  const hookCalls: string[] = []
  const trace = opts.trace ?? null
  const sink = opts.sink ?? null
  /** THE LIVE GESTURE RECORD. `outcome`/`active` are written ON IT, so the handle the module
   *  captured in its own `onMove` wrapper keeps reading the session's LIVE state — the landed
   *  session's own shape (`buildHandle`'s getters). A double that built a NEW terminal handle
   *  and discarded the old one left the module's own discriminator reading `null`
   *  (`§2.5` item 7 clause 4(a)). */
  let record: { id: number; element: unknown; active: boolean; outcome: 'end' | 'reset' | 'cancel' | null; value: unknown } | null = null
  let handle: GestureHandle | null = null
  let element: unknown = null
  let disposed = opts.disposed === true
  let disposes = 0
  let hooks: Record<string, unknown> | null = null

  const hook = (name: string): ((...args: unknown[]) => void) | null => {
    const candidate = hooks === null ? undefined : hooks[name]
    return typeof candidate === 'function' ? (candidate as (...args: unknown[]) => void) : null
  }
  const buildHandle = (): GestureHandle => {
    const h: GestureHandle = {
      get id(): number {
        return record === null ? 0 : record.id
      },
      get element(): unknown {
        return record === null ? null : record.element
      },
      get active(): boolean {
        return record !== null && record.active
      },
      get outcome(): 'end' | 'reset' | 'cancel' | null {
        return record === null ? null : record.outcome
      },
      get value(): unknown {
        return record === null ? undefined : record.value
      },
      set(value: unknown): GestureHandle {
        if (record !== null && record.active) record.value = value
        return h
      },
    }
    return h
  }
  /** THE TERMINAL ORDER OF `§2.5` item 6, mirrored: detach → mark inactive → set the
   *  outcome → run `onEnd` → `slot = null` → invoke the composition's construction `commit`
   *  exactly once. **THE THREE DIVERGENCES OF `§2.5` item 7 clause 4 ARE CORRECTED HERE:**
   *  **(a)** the terminal word is written on the SAME handle object the module's own `onMove`
   *  wrapper received (the getters above read the live record), so the module's own
   *  discriminator reads `'end'`/`'reset'` rather than `null`; **(b)** the installed `onEnd`
   *  receives **`(element, value)`** — NEVER a handle, which is the frozen signature
   *  `onEnd(element, value)`; **(c)** the construction `commit` is invoked AT THE TERMINAL and
   *  ONLY there — the establishment invocation the session never makes is GONE. */
  const runTerminal = (outcome: 'end' | 'reset', value: unknown): void => {
    if (record === null) return
    const live = record
    const liveHandle = handle
    record.active = false
    record.outcome = outcome
    const final = outcome === 'reset' ? value : value !== undefined ? value : live.value
    terminals.push({ outcome, value: final })
    let hookError: unknown = null
    const endHook = hook('onEnd')
    if (endHook !== null) {
      hookCalls.push('onEnd')
      try {
        endHook(element, final)
      } catch (error) {
        hookError = error
      }
    }
    handle = null
    let commitError: unknown = null
    if (sink !== null && liveHandle !== null) {
      try {
        sink(liveHandle, final)
      } catch (error) {
        commitError = error
      }
    }
    if (hookError !== null) throw hookError
    if (commitError !== null) throw commitError
  }

  const d: SessionDouble = {
    ops,
    reads,
    installs,
    resets,
    terminals,
    refusals,
    attemptedResets,
    handed,
    hookCalls,
    hooks: null,
    element: null,
    get disposes(): number {
      return disposes
    },
    setElement(el: unknown, _vestigialPreDragValue?: unknown): void {
      element = el
      d.element = el
    },
    establish(): void {
      if (handle !== null) return
      record = { id: 1, element, active: true, outcome: null, value: undefined }
      handle = buildHandle()
      const startHook = hook('onStart')
      if (startHook !== null) {
        if (trace !== null) trace.push('onStart')
        hookCalls.push('onStart')
        startHook(element)
      }
    },
    move(): void {
      const moveHook = hook('onMove')
      if (moveHook !== null) {
        handed.push(handle)
        hookCalls.push('onMove')
        moveHook(handle)
      }
    },
    /** THE `'end'` TERMINAL TURN — AND, AFTER THE INVALID ARM HAS ENTERED THE SESSION'S OWN
     *  `'reset'` TERMINAL, THE RELEASE TURN THAT STILL REACHES THE MODULE'S INSTALLED
     *  TERMINAL HOOK.
     *
     *  **THE REPAIR (`I-4`/`M-7`; the `§2.5` item 7 clause 2 reading):** the arm's `reset`
     *  runs the LANDED terminal path — detach, mark the record inactive, set `outcome`, run
     *  the module's installed `onEnd` (which IS the module's terminal hook), discard the
     *  session's slot, then invoke the construction `commit` once — so the session's own
     *  slot is already gone when the release arrives. **A double that then answered the
     *  release with a silent early return made the module's OWN terminal turn unreachable
     *  for every gesture that recovered from the arm, although this harness ALREADY
     *  delivers post-arm OBSERVED MOVES to the module's own wrapper** (`F-18`: four moves
     *  after the arm, four presentation invocations; `P-RL-IM-1`(f): `candidateCalls === 2`;
     *  `§0A` note 8 — *"the session's own gesture is still running"* is the module's
     *  declared reading of the arm, which is why its per-gesture record survives it). The
     *  release is therefore delivered the same way the moves are: **the module's installed
     *  `onEnd` wrapper is invoked EXACTLY ONCE, and NO session terminal is recorded** —
     *  `terminals` and the construction `commit` stay the ARM's own readings, because the
     *  landed session performs exactly ONE terminal per gesture (`§2.5` item 6). **Whether
     *  the release writes anything is the MODULE's own decision and is read from the
     *  module's counters**: `M-8` declares `sinkCalls` stays `1` for a release the gesture
     *  did not recover from, and `M-7`/`I-4` declare the one durable reveal for a release
     *  that did (`§2.3` item 6(d)). */
    terminate(value?: unknown): void {
      if (record !== null && record.active) {
        const effective = arguments.length > 0 ? value : record.value
        runTerminal('end', effective)
        return
      }
      // THE SESSION'S OWN SLOT IS GONE — either because the invalid arm's `'reset'` terminal
      // discarded it, or because the gesture already completed. The turn is delivered to the
      // module's own installed terminal wrapper with NO session terminal recorded and NO
      // second construction-`commit` call; **whether it is OBSERVABLE is the module's own
      // business**, and the two cases are read from the module's counters: after an `'end'`
      // or a `cancel` the module has already discarded its per-gesture record, so its wrapper
      // returns at once and nothing is written; after the ARM the module KEEPS that record
      // (the reading `F-18`/`P-RL-IM-1`(f) pin), so the release is the turn `M-7`/`I-4` read.
      const endHook = hook('onEnd')
      if (endHook !== null) {
        hookCalls.push('onEnd')
        endHook(element, value)
      }
    },
    reset(el?: unknown, h?: unknown, value?: unknown, arity?: number): RelocateResetResult {
      const refused = opts.refuseResetWith ?? null
      const callArity = arity ?? arguments.length
      // **THE DELEGATION ATTEMPT IS LOGGED *BEFORE* ANY REFUSAL IS DECIDED** (`ADV-RL-13`):
      // a refused delegation used to leave NO trace at all outside `refusals`, so a row
      // reading the `ops` LENGTH could not see it — and `P-RL-SM-4` stage (3) × slot `(b)`
      // passed vacuously for exactly that reason. The entry carries the arguments AS THE
      // CALLER PASSED THEM and is MUTATED with the refusing code (or left `null` where the
      // session ran the terminal).
      const attempt = { element: arguments.length === 0 ? element : el, handle: h, value, arity: callArity, refused: null as string | null }
      attemptedResets.push(attempt)
      if (disposed) {
        attempt.refused = 'disposed'
        refusals.push('disposed')
        return { ok: false, code: 'disposed', committed: false }
      }
      if (refused !== null) {
        attempt.refused = refused
        refusals.push(refused)
        return { ok: false, code: refused, committed: false }
      }
      if (handle === null) {
        attempt.refused = 'no-gesture'
        refusals.push('no-gesture')
        return { ok: false, code: 'no-gesture', committed: false }
      }
      const target = arguments.length === 0 ? element : el
      const theHandle = callArity < 2 ? handle : h
      // **NO SUBSTITUTION** (`§2.3` item 9(a)): the third argument is recorded EXACTLY as
      // the caller passed it — a two-argument call records `undefined`, which is what the
      // frozen `reset(element, gesture, value)` would commit (`docs/specs/gsession.md`
      // `§2.5` item 5; the session holds NO default and computes none).
      const theValue = value
      ops.push({ op: 'reset', element: target, handle: theHandle, value: theValue })
      resets.push({ element: target, handle: theHandle, value: theValue, arity: callArity })
      runTerminal('reset', theValue)
      // THE FROZEN `TerminalResult`: a committing terminal answers `committed: true`
      // INDEPENDENTLY of whether a `commit` callback was installed (`docs/specs/gsession.md`
      // `§2.1`'s `TerminalResult`, the `ADV-GS-22`(a) correction; `§2.3` item 9(d)). The
      // `sink !== null` coupling the double used to answer with is GONE.
      return { ok: true, code: 'ok', committed: true }
    },
    cancel(): void {
      // THE LANDED SESSION'S CANCEL PATH (`src/shared/gesture-session.ts`
      // `cancelOperation`): detach, mark inactive, set the outcome, discard the record,
      // then run the module's own INSTALLED `onCancel` wrapper — whose forwarding of the
      // consumer's `onCancel` is what `M-17` asserts. `commit` is invoked ZERO times.
      if (record !== null) {
        record.active = false
        record.outcome = 'cancel'
      }
      handle = null
      const cancelHook = hook('onCancel')
      if (cancelHook !== null) {
        hookCalls.push('onCancel')
        cancelHook(element)
      }
    },
    sessionObject: {},
  } as unknown as SessionDouble

  const sessionObject: Record<string, unknown> = {
    install(el: unknown, options?: unknown): boolean {
      if (disposed) return false
      ops.push({ op: 'install', element: el })
      installs.push({ element: el, options })
      if (options !== null && typeof options === 'object') hooks = options as Record<string, unknown>
      return opts.installAccepts ?? true
    },
    reset(el: unknown, h?: unknown, value?: unknown): RelocateResetResult {
      // THE MODULE'S OWN CALL ARITY IS RECORDED (`§2.3` item 9(a)): the frozen arity is
      // THREE, and a two-argument delegation records `arity: 2`, so a row can assert it.
      return d.reset(el, h, value, arguments.length)
    },
    dispose(): { removed: number; complete: boolean } {
      ops.push({ op: 'dispose', element: null })
      disposes += 1
      disposed = true
      hooks = null
      handle = null
      if (record !== null) {
        record.active = false
        record.outcome = 'cancel'
      }
      record = null
      return { removed: 0, complete: opts.disposeComplete ?? true }
    },
    gesture(): unknown {
      reads.push('gesture')
      return handle === null ? null : { active: handle.active, id: handle.id, outcome: handle.outcome, value: handle.value, commits: 0 }
    },
    stats(): Record<string, unknown> {
      reads.push('stats')
      return {
        installed: installs.length,
        sourceCalls: 0,
        gestures: 0,
        commits: resets.length,
        active: handle !== null,
        gestureId: 1,
        lastCode: 'ok',
      }
    },
    get disposed(): boolean {
      reads.push('disposed')
      return disposed
    },
  }
  d.sessionObject = sessionObject
  return d
}

/** A recording channel spy: its own invocation count, its arguments BY IDENTITY, and
 *  the PHASE of each invocation (`§5.5.1 P-RL-SM-3`'s phase assertion). */
function spyChannel(name: string): {
  readonly fn: (...args: unknown[]) => void
  readonly args: unknown[][]
  readonly phases: string[]
  count(): number
} {
  const args: unknown[][] = []
  const phases: string[] = []
  return {
    fn: (...a: unknown[]): void => {
      args.push(a)
      phases.push(runtimePhase(name))
    },
    args,
    phases,
    count: (): number => args.length,
  }
}
/** The phase a channel write arrived in, read from the harness's own turn marker. The
 *  declaration sits ABOVE its first use, so a helper closure that runs inside a test
 *  body (never at module scope) can call it. */
let turnPhase = 'idle'
function runtimePhase(_name: string): string {
  return turnPhase
}
function inPhase<T>(phase: string, body: () => T): T {
  const previous = turnPhase
  turnPhase = phase
  try {
    return body()
  } finally {
    turnPhase = previous
  }
}

/** A consumer-hook recorder: each of the four hooks records its own arguments
 *  (`M-3`, `M-17`, `M-4`). */
function hookRecorder(): {
  readonly handle: Record<string, unknown>
  readonly calls: Array<{ hook: string; args: unknown[] }>
} {
  const calls: Array<{ hook: string; args: unknown[] }> = []
  const make = (hook: string): ((...a: unknown[]) => void) => (...a: unknown[]) => {
    calls.push({ hook, args: a })
  }
  return {
    handle: { onStart: make('onStart'), onMove: make('onMove'), onEnd: make('onEnd'), onCancel: make('onCancel') },
    calls,
  }
}

/** `§2.1` item 7 — THE PRE-DRAG VALUE'S CHANNEL, mirrored as the rows' own consumer record.
 *  It supplies the ONE member that carries the caller's pre-drag value — `preDragValueOf?:
 *  (element: unknown) => unknown`, a member of the CONSUMER-SUPPLIED hooks record — BESIDE
 *  the consumer's own RECORDED INVOCATION COUNT, which is the instrument `§2.1` item 7(d)
 *  names (*"the capture's count is read from THE CONSUMER'S OWN RECORDED INVOCATION COUNT"*).
 *  **IT IS NOT A HOOK AND NOT AN INSTALL OPTION**: the module must NOT forward it into the
 *  options object it hands the session, whose key set stays EXACTLY the four hooks
 *  (`M-1`/`R-10`/`I-7`), and `M-17`'s drive is NOT extended to a fifth recorded hook. */
function preDragChannel(initial: unknown = undefined, extra: Record<string, unknown> = {}): {
  readonly hooks: Record<string, unknown>
  set(value: unknown): void
  count(): number
} {
  let held = initial
  let invocations = 0
  const hooks: Record<string, unknown> = {
    ...extra,
    preDragValueOf: (_element: unknown): unknown => {
      invocations += 1
      return held
    },
  }
  return {
    hooks,
    set: (value: unknown): void => {
      held = value
    },
    count: (): number => invocations,
  }
}

/** `R-11` — a write-recording element: the module must make NO write call of any kind
 *  on it (`R-11`'s paired runtime half). */
function writeRecordingElement(): { readonly element: Record<string, unknown>; readonly writes: string[] } {
  const writes: string[] = []
  const element: Record<string, unknown> = {}
  for (const name of ['setAttribute', 'removeAttribute', 'appendChild', 'insertBefore', 'removeChild', 'replaceChildren', 'insertAdjacentHTML', 'insertAdjacentText']) {
    element[name] = (...a: unknown[]): void => {
      writes.push(`${name}(${a.length})`)
    }
  }
  return { element, writes }
}

/** A within-band candidate answer whose measured scalar the ROW supplies. */
function answer(distance: unknown, candidate: unknown = { opaque: true }): { candidate: unknown; distance: unknown } {
  return { candidate, distance }
}

// ===========================================================================
// STATIC-SCAN MACHINERY (`§3.4 R-1`/`R-8`/`R-11`, `§4.4 S-6`).
//
// THE NORMALIZED VIEW: comments are scanned LIKE CODE (so they are KEPT), string
// literals are JOINED (so `'thresh' + 'old'`, a template with substituted parts and a
// token split across a line break all read as the joined text), and the scan applies a
// WORD/IDENTIFIER BOUNDARY rule on top.
//
// THE TOKEN LISTS ARE HELD AS FRAGMENTS in this file, so the scan's own rule list
// cannot be read by the scan; the assembled lists are only ever materialized into
// CONTROL CORPORA and used as needles. `R-1`'s declared exemptions (`threshold`,
// `distance`) are EXEMPT BY NAME and are asserted to be exempt in the same row.
// ===========================================================================
type TokenRule = { readonly id: string; readonly tokens: readonly string[]; readonly exempt?: readonly string[] }
function tokens(...parts: string[]): string[] {
  return parts
}
const R1_RULES: readonly TokenRule[] = [
  {
    id: 'coordinate/event-field',
    tokens: tokens(
      'client' + 'X', 'client' + 'Y', 'page' + 'X', 'page' + 'Y', 'screen' + 'X', 'screen' + 'Y',
      'offset' + 'X', 'offset' + 'Y', 'movement' + 'X', 'movement' + 'Y', 'pointer' + 'Id',
      'delta' + 'X', 'delta' + 'Y', 'button', 'buttons', 'is' + 'Primary',
      // the `clientX`/`clientY` family is covered by the GEOMETRY rule's own entries below
      // (the coordinate-read spelling and the geometry token are the same words, and listing
      // them twice would only make the report read as two findings for one token).
    ),
  },
  {
    id: 'geometry',
    tokens: tokens(
      'getBounding' + 'ClientRect', 'getComputed' + 'Style', 'offset' + 'Width', 'offset' + 'Height',
      'client' + 'Width', 'client' + 'Height', 'scroll' + 'Width', 'match' + 'Media',
    ),
  },
  {
    id: 'pane/zone/tab/axis vocabulary',
    tokens: tokens('pa' + 'ne', 'zo' + 'ne', 'ta' + 'b', 'hori' + 'zontal', 'verti' + 'cal', 'in' + 'line', 'blo' + 'ck'),
  },
  // The `--` member is the CSS CUSTOM-PROPERTY literal, held as `'--'` (a quoted token,
  // so the scanner matches it as a literal and NOT as the subtraction operator: a blanket
  // ban on the hyphen character would fire on ordinary arithmetic and would not be this
  // row's claim).
  { id: 'unit/token literal', tokens: tokens("'" + 'px' + "'", "'0" + 'px' + "'", "'fit-' + 'content'", 'cal' + 'c(', "'" + '--') },
  { id: 'selector', tokens: tokens('selec' + 'tors', 'query' + 'Selector', 'clo' + 'sest', 'getElement' + 'ById') },
  {
    id: 'census',
    tokens: tokens('cen' + 'sus', 'zo' + 'nes', 'revea' + 'led', 'spec' + 'Of', 'si' + 'zes', 'track' + 'Var', 'track' + 'Prop', 'empty' + 'Token'),
  },
  { id: 'store/cache', tokens: tokens('local' + 'Storage', 'session' + 'Storage', 'sto' + 're', 'ca' + 'che', 'me' + 'mo', 'persi' + 'st') },
]
/** `§2.1` item 5 / `§2.3` item 3 — THE DECLARED EXEMPTIONS, by name. */
const R1_EXEMPT_TOKENS: readonly string[] = ['thresh' + 'old', 'dist' + 'ance']
const R2_RULES: readonly TokenRule[] = [
  {
    id: 'banned realm / ambient read',
    tokens: tokens(
      'docu' + 'ment', 'win' + 'dow', 'global' + 'This', 'se' + 'lf', 'to' + 'p', 'par' + 'ent', 'fra' + 'mes',
      'match' + 'Media', 'getComputed' + 'Style', 'getBounding' + 'ClientRect', 'active' + 'Element', 'Da' + 'te',
      'Math' + '.random', 'pro' + 'cess', 'node' + ':fs', 'local' + 'Storage', 'ev' + 'al', 'new ' + 'Function',
      'Reflect' + '.construct',
    ),
  },
]
const R3_RULES: readonly TokenRule[] = [
  { id: 'listener/capture', tokens: tokens('addEventListener', 'removeEventListener', 'setPointer' + 'Capture', 'releasePointer' + 'Capture', 'capture' + 'Pointer') },
]
const R7_RULES: readonly TokenRule[] = [
  {
    id: 'forbidden session member',
    tokens: tokens('be' + 'gin', 'en' + 'd', 'can' + 'cel', 'installGesture' + 'Listeners', 'detachGesture' + 'Listeners', 'POINTER' + '_TYPES'),
    exempt: ['ca' + 'ncel'],
  },
]
const R8_RULES: readonly TokenRule[] = [
  {
    id: 'geometry observation / coordinate read',
    tokens: tokens(
      'getComputed' + 'Style', 'getBounding' + 'ClientRect', 'offset' + 'Width', 'offset' + 'Height',
      'client' + 'Width', 'client' + 'Height', 'scroll' + 'Width', 'match' + 'Media', 'inner' + 'HTML',
      'client' + 'X', 'client' + 'Y', 'page' + 'X', 'page' + 'Y', 'screen' + 'X', 'screen' + 'Y',
      'movement' + 'X', 'movement' + 'Y', 'offset' + 'X', 'offset' + 'Y',
    ),
  },
]
const R11_RULES: readonly TokenRule[] = [
  {
    id: 'UI-content write',
    tokens: tokens(
      'setAttribute', 'removeAttribute', 'class' + 'List', 'class' + 'Name', 'text' + 'Content', 'inner' + 'Text',
      'inner' + 'HTML', 'outer' + 'HTML', 'insertAdjacent' + 'HTML', 'insertAdjacent' + 'Text', 'create' + 'Element',
      'create' + 'TextNode', 'append' + 'Child', 'insert' + 'Before', 'remove' + 'Child', 'replace' + 'Children',
      'css' + 'Text', 'set' + 'Property',
    ),
  },
]
/** `R-8`'s DESCRIPTION half: a row description CLAIMING a rendered/geometry/magnitude
 *  fact. **HELD AS CLAIM PHRASES, NOT AS BARE WORDS, AND THAT IS THE REPAIR (2026-09-27).**
 *  The `E3`/`docs/specs/zones.md §3.4 R-7` form the spec cites is a PHRASE list, and the
 *  reason it must be one for THIS unit is decisive: the bare words appear in the ROW
 *  TITLES THAT DENY the property — `R-8 … THE GEOMETRY …`, `R-1 … geometry …`,
 *  `I-11 … GEOMETRY …`, `I-15 … no rendered surface …`, `P-RL-SM-5 … VISIBLE REVERT …` —
 *  so a bare-word scan of this file's own prose could NEVER read `[]`, and the row was
 *  unfalsifiable rather than strict. A PHRASE is what a description CLAIMING the fact
 *  carries (*"the zone is rendered at 240 px on screen"*, *"the pane becomes visible"*),
 *  and each declared phrase is driven by the row's own control so the list cannot go
 *  vacuous. Held as FRAGMENTS for the same reason the token lists are. */
const R8_CLAIM_PHRASES: readonly string[] = [
  'as ren' + 'dered', 'is ren' + 'dered', 'ren' + 'dered at', 'ren' + 'dered box',
  'ren' + 'dered width', 'ren' + 'dered height', 'ren' + 'ders as', 'ren' + 'ders it',
  'on ' + 'screen', 'in ' + 'pixels', 'pix' + 'el box', 'applied' + ' css',
  'laid ' + 'out', 'painted ' + 'width', 'a magni' + 'tude of', 'magni' + 'tude of',
  'resol' + 'ution of', 'becomes ' + 'visible', 'is ' + 'visible', 'made ' + 'visible',
  'geome' + 'try of', 'the geome' + 'try is', 'measured ' + 'width', 'cursor ' + 'position',
  'click is retar' + 'geted',
]
/** ONE description's claim test: a declared CLAIM PHRASE on a word/identifier boundary. */
function claimsRenderedFact(text: string): string[] {
  return R8_CLAIM_PHRASES.filter((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^A-Za-z0-9_$])${escaped}([^A-Za-z0-9_$]|$)`, 'i').test(text)
  })
}

function normalizeSource(source: string): string {
  let out = ''
  let i = 0
  while (i < source.length) {
    const ch = source[i]
    if (ch === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i)
      i = nl === -1 ? source.length : nl
      continue
    }
    if (ch === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2)
      i = close === -1 ? source.length : close + 2
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch
      let j = i + 1
      let literal = ''
      while (j < source.length) {
        if (source[j] === '\\') {
          j += 2
          continue
        }
        if (source[j] === quote) break
        literal += source[j]
        j += 1
      }
      out += quote + literal + quote
      i = j + 1
      continue
    }
    out += ch
    i += 1
  }
  return out.replace(/\$\{([^}]*)\}/g, '$1')
}
/** The scan's OWN normalizer used by the CONTROLS, so a control can prove the joiner:
 *  an ordinary concatenation of two literals is joined exactly as `normalizeSource`
 *  joins the module's. */
function joinLiteralConcatenation(source: string): string {
  const pattern = /(['"])([^'"]*)\1\s*\+\s*(['"])([^'"]*)\3/g
  let out = source
  let guard = 0
  while (pattern.test(out) && guard < 20) {
    out = out.replace(pattern, (_m, _q1, a: string, _q2, b: string) => `'${a}${b}'`)
    guard += 1
  }
  return out
}
function scanForToken(normalized: string, token: string): string[] {
  const hits: string[] = []
  if (token.startsWith("'") || token.startsWith('cal') || token === '-') {
    if (normalized.includes(token)) hits.push(token)
    return hits
  }
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(^|[^A-Za-z0-9_$])${escaped}([^A-Za-z0-9_$]|$)`)
  if (re.test(normalized)) hits.push(token)
  return hits
}
function scanRules(normalized: string, rules: readonly TokenRule[]): { id: string; hits: string[] }[] {
  return rules.map((rule) => {
    const exempt = new Set(rule.exempt ?? [])
    const hits: string[] = []
    for (const token of rule.tokens) {
      if (exempt.has(token)) continue
      hits.push(...scanForToken(normalized, token))
    }
    return { id: rule.id, hits }
  })
}

// ===========================================================================
// `§3.5 X-1` / `§3.4 R-12` — THE UNIT-OWNED PATH CENSUS and the diff-scope probes.
// ===========================================================================
function walkFiles(root: string, prefix = ''): string[] {
  const out: string[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const rel = prefix === '' ? entry.name : `${prefix}/${entry.name}`
    if (entry.isDirectory()) out.push(...walkFiles(`${root}/${entry.name}`, rel))
    else out.push(rel)
  }
  return out
}
/** Every `src/**`, `tests/**` and `docs/**` path whose name mentions this unit — the
 *  unit-owned surface `X-1`'s green form and `R-12` read. The three roots are the ones
 *  `§5.1`'s allow-list admits a path in (the module, this test file, this unit's spec,
 *  this unit's `*-greens.md` and `archive/reviews/**`), so a `docs/**` sibling of this
 *  unit is inside the census while a source-path census would miss it. */
function unitOwnedPaths(): string[] {
  const out: string[] = []
  for (const dir of ['src', 'tests', 'docs']) {
    const base = `${REPO_ROOT}/${dir}`
    if (!existsSync(base)) continue
    for (const rel of walkFiles(base)) {
      const full = `${dir}/${rel}`
      if (/relocate/i.test(full)) out.push(full)
    }
  }
  return out.sort()
}
/** `§5.1`'s allow-list, as the canonical unit-owned names: the module (NEW), this test
 *  file (NEW), this unit's spec, and this unit's own `*-greens.md` record. **A changed
 *  path outside that list is a FINDING for the adversarial pass rather than an
 *  automatic FAIL** (`§3.4 R-12`'s own scope rule), which is why this row asserts the
 *  UNIT-OWNED census and never a whole-repo diff. */
const ALLOWED_UNIT_PATH = /^(src\/shared\/relocate\.ts|tests\/relocate\.test\.ts|docs\/specs\/relocate(-[a-z]+)?\.md)$/
/** Every `src/**` file that imports the module, by path — the *"imported by NO
 *  `src/**` file"* claim (`R-6`/`R-12`, `§4.1`). */
function importerCensus(): string[] {
  const base = `${REPO_ROOT}/src`
  const out: string[] = []
  if (!existsSync(base)) return out
  for (const rel of walkFiles(base)) {
    const full = `${base}/${rel}`
    let text = ''
    try {
      text = readFileSync(full, 'utf8')
    } catch {
      continue
    }
    // A TRUE IMPORT-GRAPH PROBE, not a word search: the module's own path form
    // (`relocate.js` / `relocate.ts`) inside an `import`/`export … from`/dynamic-`import`
    // statement. A prose mention of the English word "relocates" in a sibling comment is NOT
    // an importer, and treating it as one would make this claim fail for a non-vacuity reason
    // rather than for the claim it makes.
    if (/(import|export)[^\n]*from\s*['"][^'"]*relocate\.[jt]s['"]|import\s*\(\s*['"][^'"]*relocate\.[jt]s['"]/.test(text)) {
      out.push(`src/${rel}`)
    }
  }
  return out.sort()
}

let moduleSourceCache: string | null = null
function moduleSource(): string {
  if (moduleSourceCache !== null) return moduleSourceCache
  moduleSourceCache = existsSync(MODULE_SRC) ? readFileSync(fileURLToPath(MODULE_SRC), 'utf8') : ''
  return moduleSourceCache
}
function requireModuleSource(label: string): string {
  if (!existsSync(MODULE_SRC)) {
    expect(
      `the module ${MODULE_RELPATH} is absent`,
      `RED — U-RELOCATE red set (§4.1): \`${MODULE_RELPATH}\` does not exist yet, so this STATIC row has no bytes to scan. [${label}]`,
    ).toBe('the module exists')
  }
  return moduleSource()
}

/** This file's own bytes and its `it(...)`/`expect(..., <message>)` descriptions — the
 *  two corpora `R-8`'s description half scans. */
function rowDescriptions(): string[] {
  const raw = readFileSync(TEST_FILE, 'utf8')
  const out: string[] = []
  const re = /it\(\s*'((?:[^'\\]|\\.)*)'/g
  let m = re.exec(raw)
  while (m !== null) {
    out.push(m[1])
    m = re.exec(raw)
  }
  return out
}

// ===========================================================================
// §5.5.1 — THE REGISTER'S EXECUTION MACHINERY.
// Caps (uniform for the whole register): `≤100` attempts per row, `≤400` attempts in
// total, rows evaluated SEQUENTIALLY IN REGISTER ORDER, STOP AFTER 5 CONSECUTIVE
// FAILURES (the running row's remaining attempts are abandoned and no further row
// starts). Each row's `it` title carries its row id AND its `S-RL-*` strategy id, and
// each row logs its own record line so a read-only PBT audit can read
// attempts-run / held / broken / notStarted / registerStoppedAt per row.
// **An un-run row FAILS — it never looks green.**
// ===========================================================================
const REGISTER_ROW_CAP = 100
const REGISTER_TOTAL_CAP = 400
const CONSECUTIVE_FAILURE_CAP = 5
const SEED = 20260927
const LCG_A = 1664525
const LCG_C = 1013904223
const LCG_MOD = 4294967296

/** **`§5.5.1`'s FIFTEEN DECLARED ROWS / SIXTEEN TERMS** — `(row id, strategy id, term,
 *  bounded)`, one entry per TERM, in REGISTER ORDER exactly as `§5.5.3` prints them:
 *  `170` = `21+14+12+3+8+21+5+11+5+6+3+14+7+4+30+6`. `P-RL-IM-3` is the ONE row carrying
 *  TWO terms (`12` and `3`, its two declared halves, with their own strategies
 *  `S-RL-PURE-1`/`S-RL-PURE-2`), so this table holds `16` ENTRIES for `15` ROWS — and
 *  `PRE-2` asserts BOTH counts against the two different objects. Declared ONCE, at
 *  module scope, so `PRE-2`, `PRE-4` and `REGISTER-STATUS` all reconcile against the
 *  same object — which is what makes this file's tables machine-comparable for the
 *  later read-only PBT audit (`§3a A-14`).
 *
 *  **`bounded` — `§5.5.2` item 2's marking, mirrored per row: `true` for the SIX rows
 *  whose property TEXT quantifies over a domain LARGER than their table
 *  (`P-RL-IM-1`, `P-RL-IM-3`, `P-RL-IM-5`, `P-RL-SM-4`, `P-RL-SM-6`, `P-RL-TP-1`),
 *  `false` for the NINE whose `YES` is over a closed named list or a fixed grid. The
 *  split is `6 + 9 = 15` ROWS and NO marking moves a declared term.** */
const REGISTER_DECLARED: ReadonlyArray<{ row: string; strategy: string; term: number; bounded: boolean }> = [
  { row: 'P-RL-IM-1', strategy: 'S-RL-ENUM-1', term: 21, bounded: true },
  { row: 'P-RL-IM-2', strategy: 'S-RL-ENUM-2', term: 14, bounded: false },
  { row: 'P-RL-IM-3', strategy: 'S-RL-PURE-1', term: 12, bounded: true },
  { row: 'P-RL-IM-3', strategy: 'S-RL-PURE-2', term: 3, bounded: true },
  { row: 'P-RL-IM-4', strategy: 'S-RL-SET-1', term: 8, bounded: false },
  { row: 'P-RL-IM-5', strategy: 'S-RL-DIST-1', term: 21, bounded: true },
  { row: 'P-RL-SM-1', strategy: 'S-RL-REVEAL-1', term: 5, bounded: false },
  { row: 'P-RL-SM-2', strategy: 'S-RL-WRITER-1', term: 11, bounded: false },
  { row: 'P-RL-SM-3', strategy: 'S-RL-SITE-1', term: 5, bounded: false },
  { row: 'P-RL-SM-4', strategy: 'S-RL-WINDOW-1', term: 6, bounded: true },
  { row: 'P-RL-SM-5', strategy: 'S-RL-RESET-1', term: 3, bounded: false },
  { row: 'P-RL-SM-6', strategy: 'S-RL-CHANNEL-1', term: 14, bounded: true },
  { row: 'P-RL-SM-7', strategy: 'S-RL-INVALID-1', term: 7, bounded: false },
  { row: 'P-RL-SM-8', strategy: 'S-RL-CODES-1', term: 4, bounded: false },
  { row: 'P-RL-TP-1', strategy: 'S-RL-TOTAL-1', term: 30, bounded: true },
  { row: 'P-RL-TP-2', strategy: 'S-RL-SHAPES-1', term: 6, bounded: false },
]
const REGISTER_ROWS: readonly string[] = [
  'P-RL-IM-1', 'P-RL-IM-2', 'P-RL-IM-3', 'P-RL-IM-4', 'P-RL-IM-5',
  'P-RL-SM-1', 'P-RL-SM-2', 'P-RL-SM-3', 'P-RL-SM-4', 'P-RL-SM-5', 'P-RL-SM-6', 'P-RL-SM-7', 'P-RL-SM-8',
  'P-RL-TP-1', 'P-RL-TP-2',
]
const REGISTER_BOUNDED_ROWS: readonly string[] = ['P-RL-IM-1', 'P-RL-IM-3', 'P-RL-IM-5', 'P-RL-SM-4', 'P-RL-SM-6', 'P-RL-TP-1']
const REGISTER_UNBOUNDED_ROWS: readonly string[] = [
  'P-RL-IM-2', 'P-RL-IM-4', 'P-RL-SM-1', 'P-RL-SM-2', 'P-RL-SM-3', 'P-RL-SM-5', 'P-RL-SM-7', 'P-RL-SM-8', 'P-RL-TP-2',
]
/** `§5.5.2` item 3 — THE DECLARED-VERSUS-DISTINCT LEDGER, one figure per TERM. The
 *  DECLARED figures are what the caps are compared against; the DISTINCT figures are
 *  REPORTED BESIDE them and are NEVER substituted. `P-RL-IM-3`'s `12` is its `(3a)`
 *  cell count and its `3` its `(3b)`; the honest distinct figures are `6` and `3`. */
const REGISTER_DISTINCT: ReadonlyArray<{ row: string; declared: number; distinct: number; why: string }> = [
  { row: 'P-RL-IM-1', declared: 21, distinct: 17, why: "the 4-shape x 4-path grid's unusable shapes on paths (b)/(c)/(d) read the same module-observable evidence (the seam is never reached), so 4 cells collapse into 1 reading each; the 5 further drives are distinct" },
  { row: 'P-RL-IM-2', declared: 14, distinct: 12, why: "the 2 configurations' throwing cells read the same observable consequence as 'no target', so 2 cells collapse" },
  { row: 'P-RL-IM-3', declared: 12, distinct: 6, why: 'the 4 distance classes are 2 DISTINCT comparisons (<= true / <= false) with the hostile class collapsing to the false limb' },
  { row: 'P-RL-IM-3', declared: 3, distinct: 3, why: 'the 3 no-default drives are distinct' },
  { row: 'P-RL-IM-4', declared: 8, distinct: 8, why: 'the 7 member drives plus the positive control are each a distinct observation' },
  { row: 'P-RL-IM-5', declared: 21, distinct: 15, why: 'the 7 distance shapes land in 5 distinct module-observable classes; 5 x 3 = 15' },
  { row: 'P-RL-SM-1', declared: 5, distinct: 5, why: 'five distinct terminal paths, each with its own declared pair' },
  { row: 'P-RL-SM-2', declared: 11, distinct: 7, why: 'the 5 shapes x 2 terminal classes land in 7 distinct composition x terminal observations' },
  { row: 'P-RL-SM-3', declared: 5, distinct: 5, why: 'five distinct observation drives' },
  { row: 'P-RL-SM-4', declared: 6, distinct: 4, why: 'the 3 stages x 2 slot shapes land in 4 distinct readable stages' },
  { row: 'P-RL-SM-5', declared: 3, distinct: 3, why: 'three distinct arm drives, each a distinct channel triple' },
  { row: 'P-RL-SM-6', declared: 14, distinct: 10, why: 'the 7 move shapes land in 5 distinct transition classes; 5 x 2 = 10' },
  { row: 'P-RL-SM-7', declared: 7, distinct: 6, why: "the 2 timings' unusable-distance cells read the same evidence" },
  { row: 'P-RL-SM-8', declared: 4, distinct: 4, why: 'three refusal classes plus the closed-set control, each distinct' },
  { row: 'P-RL-TP-1', declared: 30, distinct: 30, why: '30 DRAWS — and the DISTINCT-MEMBER count is a REPORTED figure, never asserted (a DRAW IS NOT A SWEEP)' },
  { row: 'P-RL-TP-2', declared: 6, distinct: 6, why: 'six argument shapes, each a distinct drive' },
]
function declaredTermsOf(row: string): number[] {
  return REGISTER_DECLARED.filter((r) => r.row === row).map((r) => r.term)
}
function declaredTotalOfRow(row: string): number {
  return declaredTermsOf(row).reduce((a, b) => a + b, 0)
}
/** **THE TERM OF ONE (ROW, STRATEGY) PAIR** — the figure a ROW RECORD reconciles against.
 *  `P-RL-IM-3` is the one row carrying TWO terms with TWO strategies, so its two records
 *  each reconcile against THEIR OWN term (`12` and `3`), never against the row total (`15`)
 *  twice. *(**REPAIRED 2026-09-27:** `REGISTER-STATUS` compared both of that row's records
 *  against `declaredTotalOfRow` — a defect LATENT while `P-RL-IM-3`'s records read
 *  `attemptsRun 0`, and exposed the moment the row's own harness was repaired to drive its two
 *  halves.)* */
function declaredTermOfPair(row: string, strategy: string): number {
  const entry = REGISTER_DECLARED.find((r) => r.row === row && r.strategy === strategy)
  return entry === undefined ? declaredTotalOfRow(row) : entry.term
}
const registerState = {
  attempts: 0,
  consecutiveFailures: 0,
  stoppedAtRow: null as string | null,
  stoppedFor: null as string | null,
}
type RowRecord = {
  row: string
  strategy: string
  seed: number
  attemptsRun: number
  held: number
  broken: number
  /** `§5.5.2` item 9 clause (3) — THE DECLARED-FAILING CONTROL DRIVES, REPORTED BESIDE the
   *  declared term and NEVER counted in it. A control drive IS a drive (it sits inside the
   *  term) and its declared failure is an OBSERVATION the drive ASSERTS, so it HOLDS and
   *  `broken` stays `0`. */
  controls: number
  stoppedEarly: boolean
  notStarted: boolean
  registerStoppedAt: string | null
  causes: string[]
}
const registerRecords: RowRecord[] = []
/** `§5.5.2` item 9 clause (3) / `§5.3` item 10 — THE DECLARED CONTROL FIGURES, per row,
 *  BESIDE the terms (`§0A` note 15 item `S6`: *"measured at the re-grained revision:
 *  `P-RL-SM-3` `2`, `P-RL-SM-5` `1`, every other row `0`"*). No declared term, total, cap
 *  or row id moves with this table: it is a REPORTED figure and a per-row reconciliation. */
const REGISTER_CONTROLS: ReadonlyArray<{ row: string; controls: number }> = [
  { row: 'P-RL-SM-3', controls: 2 },
  { row: 'P-RL-SM-5', controls: 1 },
]
function declaredControlsOf(row: string): number {
  return REGISTER_CONTROLS.filter((r) => r.row === row).reduce((a, r) => a + r.controls, 0)
}
/** **`ADV-RL-14` — THE STOP-AWARE RECONCILIATION, IN ONE PLACE.** The as-filed harness carried
 *  TWO readings of a truncated row: `reconcile` FAILED it (an exact-count comparison) while
 *  `REGISTER-STATUS` TOLERATED it (`toBeLessThanOrEqual`) — so a stopped-early row was failed
 *  twice with two different attributions and the stop's own cause was ambiguous. Both readings
 *  now read THIS function, and its four cells (truncated / short-but-not-stopped / exact /
 *  un-run) are DRIVEN by `REGISTER-STATUS`, so neither branch is vacuous. */
type Reconciliation = 'unrun' | 'partial' | 'mismatch' | 'exact'
function stopAwareReconciliation(ran: number, declared: number, stoppedEarly: boolean): Reconciliation {
  if (ran === 0) return 'unrun'
  if (stoppedEarly) return ran <= declared ? 'partial' : 'mismatch'
  return ran === declared ? 'exact' : 'mismatch'
}
/** The DECLARED term (`§5.5.1`) reconciled against the table this file actually drove — the
 *  reconciliation `§5.3` items 10/11 require. A row that NEVER STARTED is not reconciled here:
 *  its own `finish()` reports it as a FAILURE, which is the loud message a stopped red run must
 *  carry. */
function reconcile(rec: RegisterRow, declared: number, what: string): void {
  const ran = rec.attemptsRunPublic()
  const verdict = stopAwareReconciliation(ran, declared, rec.stoppedEarlyPublic())
  if (verdict === 'unrun') return
  if (verdict === 'partial') {
    expect(
      ran,
      `${what} — this row STOPPED EARLY: the register's own stop rule abandoned its remaining attempts at \`${String(
        registerState.stoppedAtRow,
      )}\` (${String(registerState.stoppedFor)}), so this executed count is a PARTIAL reading of the declared ${declared} attempts — and the stop is reported as a FAILURE by the row's own record, never tolerated here`,
    ).toBeLessThanOrEqual(declared)
    return
  }
  expect(ran, `${what} — the declared term is ${declared}`).toBe(declared)
}
class RegisterRow {
  readonly row: string
  readonly strategy: string
  private attemptsRun = 0
  private held = 0
  private broken = 0
  private controls = 0
  private stoppedEarly = false
  private notStarted = false
  private readonly causes: string[] = []

  constructor(row: string, strategy: string) {
    this.row = row
    this.strategy = strategy
  }

  /** ONE attempt. `body` returns `null` when the property HELD, else the break cause as
   *  a sentence (a throw is caught and is itself a break cause). **`control` marks a
   *  DECLARED-FAILING CONTROL drive** (`§5.5.2` item 9): it is a drive like any other —
   *  counted in `attemptsRun` and already inside its declared term — and its declared
   *  failure is an OBSERVATION the drive asserts, so the attempt HOLDS (`broken` stays
   *  `0`); the record reports it BESIDE the term as `controls`. */
  run(label: string, body: () => string | null, control = false): void {
    if (registerState.stoppedAtRow !== null) {
      if (this.attemptsRun === 0) this.notStarted = true
      return
    }
    if (this.attemptsRun >= REGISTER_ROW_CAP) {
      this.stoppedEarly = true
      this.causes.push(`the <=${REGISTER_ROW_CAP}-attempts-per-row cap was reached`)
      return
    }
    if (registerState.attempts >= REGISTER_TOTAL_CAP) {
      this.stoppedEarly = true
      registerState.stoppedAtRow = this.row
      registerState.stoppedFor = `the <=${REGISTER_TOTAL_CAP}-attempts register cap was reached`
      return
    }
    this.attemptsRun += 1
    if (control) this.controls += 1
    registerState.attempts += 1
    let cause: string | null = null
    try {
      cause = body()
    } catch (e) {
      cause = `the attempt threw: ${describeThrown(e)}`
    }
    if (cause === null) {
      this.held += 1
      registerState.consecutiveFailures = 0
      return
    }
    this.broken += 1
    this.causes.push(`${label} — ${cause}`)
    registerState.consecutiveFailures += 1
    if (registerState.consecutiveFailures >= CONSECUTIVE_FAILURE_CAP) {
      this.stoppedEarly = true
      registerState.stoppedAtRow = this.row
      registerState.stoppedFor = `${CONSECUTIVE_FAILURE_CAP} consecutive failures`
    }
  }

  attemptsRunPublic(): number {
    return this.attemptsRun
  }

  /** **`ADV-RL-14` — THE ONE READING OF THE STOP.** `reconcile` and `REGISTER-STATUS` both read
   *  THIS flag, so a truncated row is treated identically by both and the stop's attribution is
   *  unambiguous. */
  stoppedEarlyPublic(): boolean {
    return this.stoppedEarly
  }

  /** The row's verdict + its `§5.3` item 10 record line. **An un-run row FAILS on
   *  purpose: a register row that never started may not look green.** */
  finish(): void {
    const record: RowRecord = {
      row: this.row,
      strategy: this.strategy,
      seed: SEED,
      attemptsRun: this.attemptsRun,
      held: this.held,
      broken: this.broken,
      controls: this.controls,
      stoppedEarly: this.stoppedEarly,
      notStarted: this.notStarted,
      registerStoppedAt: registerState.stoppedAtRow,
      causes: this.causes.slice(0, 5),
    }
    registerRecords.push(record)
    const line = `§5.5.1 register record :: ${JSON.stringify(record)}`
    console.log(line)
    if (this.attemptsRun === 0) {
      expect(
        registerState.stoppedAtRow !== null,
        `${line} — this row NEVER STARTED although the register did NOT stop: an un-run register row is a FAILURE, never a pass (§5.5.1 strategy item 3)`,
      ).not.toBe(null)
      expect(
        this.notStarted || registerState.stoppedAtRow !== this.row,
        `${line} — the row was reported as un-run (notStarted) because the stop-after-${CONSECUTIVE_FAILURE_CAP}-consecutive-failures discipline triggered at ${registerState.stoppedAtRow} (${registerState.stoppedFor})`,
      ).toBe(true)
      console.log(
        `§5.5.1 un-run row record :: ${JSON.stringify({
          row: this.row,
          strategy: this.strategy,
          attemptsRun: 0,
          controls: 0,
          reported: 'FAILURE — never started; the register stopped earlier',
          registerStoppedAt: registerState.stoppedAtRow,
          stoppedFor: registerState.stoppedFor,
        })}`,
      )
      // **THE UN-RUN ROW FAILS, LOUDLY AND BY NAME** (`§4.2` item 2: an un-run row is
      // REPORTED AS A FAILURE, never a pass, and *"a red run that reports all `170`
      // attempts as executed is the finding, not the expectation"*). The assertion is a
      // DELIBERATE impossible comparison (the reported-attempt count `0` against the
      // declared term), so its message carries the row, its strategy, the stopping row
      // and the reason.
      expect(
        0,
        `§5.5.1/§4.2 item 2 — the register row \`${this.row}\` (${this.strategy}) NEVER STARTED: 0 of its declared attempts were executed, because the register stopped at \`${String(
          registerState.stoppedAtRow,
        )}\` (${String(registerState.stoppedFor)}). An un-run register row is REPORTED AS A FAILURE, never silently omitted and never a pass`,
      ).toBe(declaredTotalOfRow(this.row))
      return
    }
    expect(
      this.broken,
      `${line} — RED (§5.5.1): ${this.broken} of ${this.attemptsRun} attempts BROKE. First causes: ${JSON.stringify(
        this.causes.slice(0, 3),
      )}`,
    ).toBe(0)
    // **`ADV-RL-14` — THE STOP PATH IS ITSELF REPORTED AS A FAILURE, WITH ITS ATTRIBUTION.** A
    // row whose declared attempts were ABANDONED by the stop rule did not execute its term, and
    // this assertion makes that STOP the row's own failure — so `reconcile`'s partial-reading
    // tolerance (the same `stoppedEarly` flag, read above) is never mistaken for a pass.
    expect(
      this.stoppedEarly,
      `${line} — this row STOPPED EARLY at \`${String(registerState.stoppedAtRow)}\` (${String(
        registerState.stoppedFor,
      )}): it executed ${this.attemptsRun} of its declared ${declaredTotalOfRow(this.row)} attempts and its remaining attempts were ABANDONED by the register's own stop rule (§5.5.1 strategy item 3). A TRUNCATED ROW IS REPORTED AS A FAILURE, never rounded to green — and \`reconcile\` reads THIS SAME flag, so the register's two assertions agree on the stop`,
    ).toBe(false)
  }
}

/** `S-RL-TOTAL-1`'s generator: a hand-rolled 32-bit LCG whose constants are literals in
 *  THIS file. `stateₙ₊₁ = (stateₙ·1664525 + 1013904223) mod 2³²`, **ONE step per draw**;
 *  the pool index is `stateₙ₊₁ mod pool.length` — there is NO `next(k)` scaling helper
 *  and `pool.length` participates in NO rule beyond that one modular reduction
 *  (`§5.5.1` strategy item 2). */
function makeLcg(seed: number): { step: () => number } {
  let state = seed >>> 0
  return {
    step(): number {
      state = (state * LCG_A + LCG_C) % LCG_MOD
      return state
    },
  }
}
const POOL_LENGTH = 15
function poolDrawSequence(draws: number): number[] {
  const lcg = makeLcg(SEED)
  const out: number[] = []
  for (let i = 0; i < draws; i += 1) out.push(lcg.step() % POOL_LENGTH)
  return out
}
const DRAWN_INDICES = poolDrawSequence(15)
/** **REPORTED, NEVER ASSERTED**: `15` draws over a `15`-member pool do not guarantee
 *  that every member is drawn, and NO row may assert "all 15" (`§5.5.2` item 4). */
const DISTINCT_DRAWN_POOL_MEMBERS = new Set(DRAWN_INDICES).size
/** The first LCG step from the pinned seed, recomputed from the pinned literals
 *  (`state₁ = (20260927·1664525 + 1013904223) mod 2³²`). A REPORTED arithmetic check on
 *  the pinned form — `§5.5.1` prints no first-state value. */
const FIRST_LCG_STATE = (SEED * LCG_A + LCG_C) % LCG_MOD
/** `§5.5.2` item 5 — the generator's ONE stated bias: `2³² mod 15 = 1`, so one pool
 *  index is reachable from `286331154` preimages and the remaining `14` from
 *  `286331153`. Computed here so the statement is checkable rather than quoted. */
const LCG_STATE_SPACE = 4294967296
const BIASED_RESIDUE_COUNT = LCG_STATE_SPACE % POOL_LENGTH

// ===========================================================================
// §3.5 X-1 and §3.4's R-17/R-18/R-9 — THE RED'S OWN PREMISE (`§4.2` item 1). These
// four rows are evaluable BEFORE this unit's module exists, which is why the red is
// runnable at all.
// ===========================================================================
describe('§3.5 X-1 + §3.4 R-17/R-18/R-9 — the existence and precondition rows (authored first, §4.2 item 1)', () => {
  it('X-1 §3.5 — the module-absence row, BRANCHED on the module’s presence: the RED form (the module does not exist — the red’s own premise, §4.1) OR the GREEN form (it exists, is imported by NO `src/**` file, and the export census holds)', async () => {
    const present = existsSync(MODULE_SRC)
    // -----------------------------------------------------------------------
    // THE NON-VACUITY PROBES — run BEFORE the branch, so both branches read a probe that
    // is proved to answer BOTH ways (`§3.5 R-8x`'s form, the branch shape the repo uses).
    // -----------------------------------------------------------------------
    expect(
      existsSync(TEST_FILE),
      'X-1 — the probe is not vacuous: this test file itself exists on disk through the same mechanism',
    ).toBe(true)
    expect(
      existsSync(new URL('../src/shared/gesture-session.ts', import.meta.url)),
      'X-1/R-18 — the probe is not vacuous in the other direction either: the FROZEN session module really exists, so `existsSync` answers true for a present file',
    ).toBe(true)
    // -----------------------------------------------------------------------
    // THE RED FORM — the branch that governs AT RED TIME: *"at the moment the red set is
    // AUTHORED and RUN, `src/shared/relocate.ts` does not exist"*, and *"if the module EXISTS
    // before the red run, this row FAILS and the RCA-1 red order is broken — the pass that
    // finds it must REPORT the inversion rather than proceed"*. **(REPAIRED 2026-09-27: this
    // form was asserted UNCONDITIONALLY — the red's own premise, which no green can pass.
    // It is now the RED BRANCH of the presence probe, exactly as `§3.5` R-8x's precedent and
    // this row's own *"the row MUST BRANCH ON THE MODULE'S PRESENCE"* clause require: the
    // GREEN branch below governs once the module lands and this row can FAIL for a module
    // that ships the WRONG SURFACE.)**
    // -----------------------------------------------------------------------
    if (!present) {
      expect(
        present,
        `X-1 (RED BRANCH, §3.5)/§4.1 — at the moment this red set is AUTHORED and RUN, \`${MODULE_RELPATH}\` does NOT exist (probe: ${fileURLToPath(
          MODULE_SRC,
        )} answered ${String(present)}). If this assertion FAILS, the module landed BEFORE the red run — the RCA-1 red order is broken and the pass that finds it must REPORT the inversion rather than proceed (§4.1, §3.5 X-1's own FAIL clause)`,
      ).toBe(false)
      // The companion claim of `R-6`/`R-12`, true at RED time because there is no module
      // at all: no `src/**` file mentions this unit.
      expect(
        importerCensus(),
        'X-1 (RED BRANCH)/R-12 — at red time NO `src/**` file imports or mentions the module (there is no module): the *"imported by NO `src/**` file"* claim (§4.1, R-6/R-12) is asserted NON-VACUOUSLY here and re-asserted in the green branch below',
      ).toEqual([])
      return
    }

    // -----------------------------------------------------------------------
    // THE GREEN FORM — governing AT GREEN TIME, so the row survives the cycle. **The
    // row MUST BRANCH ON THE MODULE'S PRESENCE rather than assert the red form
    // unconditionally** (the `E3` `R-16` defect: *"a red form declared unconditionally
    // fails because the work was done"*).
    // -----------------------------------------------------------------------
    expect(
      present,
      `X-1 (GREEN BRANCH, §3.5) — \`${MODULE_RELPATH}\` EXISTS (probe answered ${String(present)}): THIS BRANCH governs once the work is done, and it is why this row can PASS at green time instead of failing because the module landed. Its SUBJECT is the row's own claim: the module exists, it is imported by NO \`src/**\` file, and the \`§2.1\` export census holds BY NAME`,
    ).toBe(true)
    const { mod } = await resolveModule()
    expect(mod, 'X-1 (GREEN form) — the module resolves once it exists').not.toBe(null)
    const namespace = mod as Record<string, unknown>
    const values = Object.keys(namespace)
      .filter((k) => k !== 'default')
      .sort()
    // A SET CLAIM BY NAME, never a bare count (`§4.4 S-7`): `§2.1`(a)'s TWO runtime values.
    expect(
      values,
      `X-1 (GREEN form)/R-5(a) — the module's RUNTIME value exports are EXACTLY \`createRelocateSession\` and \`withinProximity\` (§2.1(a): the TWO-value census, PINNED, with \`POINTER_TYPES\` ABSENT). The namespace's own keys read: ${JSON.stringify(
        values,
      )}`,
    ).toEqual(['createRelocateSession', 'withinProximity'])
    expect(
      typeof namespace['createRelocateSession'],
      'X-1 (GREEN form)/R-5(a) — `createRelocateSession` is a value export of the declared kind',
    ).toBe('function')
    expect(
      typeof namespace['withinProximity'],
      'X-1 (GREEN form)/R-5(a) — `withinProximity` is a value export of the declared kind',
    ).toBe('function')
    // The companion import-graph claim, re-asserted at GREEN time: *"at the time this
    // unit's red set runs, `src/shared/relocate.ts` is imported by NO `src/**` file"*.
    expect(
      importerCensus(),
      'X-1 (GREEN form)/R-6 + R-12 — the module is imported by NO `src/**` file (§4.1: the module is imported by no `src/**` file, so there is NO RENDERED SURFACE TO OBSERVE and it appears in none of the built bundles)',
    ).toEqual([])
  })

  it('R-17 §3.4 — the `[D]`-precondition row: at the time this red set is authored, `docs/specs/gsession.md` §2.6’s `F-12` remains `PRECONDITION-GATED`, so this unit claims no `[D]` row (a clause-status probe whose FAIL is meaningful)', async () => {
    const spec = readFileSync(`${REPO_ROOT}/docs/specs/gsession.md`, 'utf8')
    expect(
      spec.includes('PRECONDITION-GATED'),
      'R-17 — the sibling contract still carries its PRECONDITION-GATED token, so the probe is not vacuous (the token is the clause status this row reads)',
    ).toBe(true)
    expect(
      spec.includes('F-12'),
      'R-17 — the sibling contract still names the F-12 precondition row this unit’s non-claim cites (§2.6 item 5, §5.2)',
    ).toBe(true)
    // The probe's subject is the CLAUSE's status, not a file: the row reads the
    // sibling spec and reports the non-claim. A later gate that admits a behavioural
    // retargeting row for this family must come from the unit that owns the rendered
    // surface, with its own preconditions stated (R-17’s own FAIL clause).
    const thisUnit = readFileSync(TEST_FILE, 'utf8')
    expect(
      thisUnit.includes('precondition') || thisUnit.includes('PRECONDITION'),
      'R-17 — THIS unit states the non-claim in its own bytes (the row exists and is not vacuous): no `[D]` row is claimed for `U-RELOCATE`',
    ).toBe(true)
  })

  it('R-18 §3.4 — the session-precondition row: `src/shared/gesture-session.ts` EXISTS and its namespace carries the FOUR value exports BY NAME, and its `EventSource` declares the optional capture member (with a positive control)', async () => {
    expect(
      existsSync(new URL('../src/shared/gesture-session.ts', import.meta.url)),
      'R-18 — the FROZEN session module this unit composes EXISTS (ruling 3’s live precondition; its FAIL would mean the FROZEN delegate surface moved — a finding to REPORT, never a licence to edit the session’s module or its spec)',
    ).toBe(true)
    const session = (await import(/* @vite-ignore */ SESSION_SPECIFIER)) as Record<string, unknown>
    for (const name of ['createGestureSession', 'installGestureListeners', 'detachGestureListeners', 'POINTER_TYPES']) {
      expect(
        typeof session[name],
        `R-18 — the session namespace carries the value export \`${name}\` BY NAME (the namespace's own keys read: ${JSON.stringify(
          Object.keys(session).sort(),
        )})`,
      ).not.toBe('undefined')
    }
    // THE POSITIVE CONTROL, required by R-18's own text: a namespace missing one of
    // those names FAILS.
    const missing = ['createGestureSession', 'installGestureListeners', 'detachGestureListeners', 'POINTER_TYPES', 'aNameTheSessionDoesNotCarry'].filter(
      (name) => typeof session[name] === 'undefined',
    )
    expect(
      missing,
      'R-18 — the positive control: exactly ONE of the probed names is absent, and it is the deliberately invented one — so the by-name probe above has a failure mode',
    ).toEqual(['aNameTheSessionDoesNotCarry'])
    const sessionSource = readFileSync(`${REPO_ROOT}/src/shared/gesture-session.ts`, 'utf8')
    // The declaration is asserted as SOURCE TEXT because the member is TYPE-LEVEL: a
    // runtime key probe cannot see an optional interface member, and this row must not
    // invent a runtime read of one.
    expect(
      /capturePointer\s*\?\s*\(\s*\w+\s*:/.test(sessionSource),
      'R-18 — the session’s own `EventSource` DECLARES the optional capture member (`capturePointer?(…)`, `§2.5` item 2 as the sibling spec pins it): the module this unit composes passes NO capture field, so ZERO capture calls occur — and this row is the precondition, not the module’s claim (`R-10` carries the module’s half)',
    ).toBe(true)
  })

  it('R-9 §3.4 — the absent-page-design row: `docs/skills/designing-pages.md` does NOT exist at the time this unit’s red set runs (a probe whose FAIL is meaningful and obliges a coverage row + demo-page entry)', () => {
    const pageDesign = `${REPO_ROOT}/docs/skills/designing-pages.md`
    expect(
      existsSync(pageDesign),
      'R-9 — `docs/skills/designing-pages.md` DOES NOT EXIST at the time this unit’s red set runs (§1 item 6, §7 item 6: globbed `docs/skills/*` at filing held `process-guardrails.md` alone). IF THIS FAILS the file DOES exist, and this unit then OWES a test-use-case coverage row in that file’s matrix plus an entry in its demo-page index — with the honest note that a mechanism with no UI surface can only contribute an ABSENCE row',
    ).toBe(false)
    expect(
      existsSync(`${REPO_ROOT}/docs/skills/process-guardrails.md`),
      'R-9 — the probe is not vacuous: the sibling skill file DOES exist, so `existsSync` answers true for a present path',
    ).toBe(true)
  })
})

// ===========================================================================
// §3.4 — THE STATIC ROWS `R-1`..`R-16` (`§4.2` item 2). Each scans THIS unit's own
// module bytes (or drives an injected argument) and NEVER asserts anything about a
// browser or a renderer. The token scans read the NORMALIZED view of `R-1` (literals
// joined, comments scanned like code, a word/identifier boundary), and every scanning
// row carries a POSITIVE and a NEGATIVE control so a passing scan is falsifiable
// (`§4.4 S-6`: *"a row that passes for a module spelling a banned token in either form
// is UNFALSIFIED and must not be filed"*).
// ===========================================================================
describe('§3.4 R-1..R-16 — the STATIC rows (the module’s own bytes and the recorded session log, never a real DOM)', () => {
  it('R-1 §3.4 — the anti-evasion VOCABULARY row: no coordinate/event-field, geometry, pane-zone-tab-axis, unit/token-literal, selector, census or store/cache token in the module’s source INCLUDING its comments, with the DECLARED EXEMPTIONS `threshold`/`distance` and BOTH controls', async () => {
    const label = 'R-1'
    const source = requireModuleSource(label)
    // The module's bytes as the row reads them: the whole file, comments INCLUDED. **The
    // COMMENT-KEEPING VIEW is a separate reading because `normalizeSource` STRIPS comments —
    // so it cannot back the row's own declared clause *"COMMENTS ARE SCANNED LIKE CODE: a
    // banned token carried only in a comment FAILS this row"*, and the comment half (with its
    // comment-only control) was unfalsifiable against it. (REPAIRED 2026-09-27; the defect was
    // LATENT behind the joined control repaired in the same pass, which failed first.)**
    const commentKeeping = (text: string): string => text.replace(/\$\{([^}]*)\}/g, '$1')
    const normalized = joinLiteralConcatenation(source)
    const rawReport = scanRules(commentKeeping(source), R1_RULES)
    const joinedReport = scanRules(normalized, R1_RULES)
    const commentJoined = commentKeeping(joinLiteralConcatenation(source))
    const commentReport = scanRules(commentJoined, R1_RULES)
    expect(
      rawReport.every((r) => r.hits.length === 0),
      `R-1 — over the MODULE's source (\`${MODULE_RELPATH}\`) INCLUDING its comments, NO occurrence of a coordinate/event-field token, a geometry token, a pane/zone/tab/axis vocabulary token, a unit or token literal, a selector token, a census token or a store/cache token (P-1, P-5, P-8, P-10). Hits: ${JSON.stringify(
        rawReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    expect(
      joinedReport.every((r) => r.hits.length === 0),
      `R-1 (the ASSEMBLY half, §4.4 S-6) — the scan joins string-literal concatenation BEFORE scanning, so a token spelled \`'thresh' + 'old'\`-style, through a template with substituted parts, or split across a line break is caught: ${JSON.stringify(
        joinedReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    expect(
      commentReport.every((r) => r.hits.length === 0),
      `R-1 (the COMMENT half, §4.4 S-6) — COMMENTS ARE SCANNED LIKE CODE: a banned token carried only in a comment FAILS this row: ${JSON.stringify(
        commentReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // THE DECLARED EXEMPTIONS, named (`§2.1` item 5, `§2.3` items 2/3, `§0A` note 12):
    // `threshold` and `distance` are THIS UNIT'S DECLARED CONTRACT VOCABULARY, and the
    // row is NOT vacuous without them — the exemption is declared rather than implied.
    expect(
      R1_EXEMPT_TOKENS.slice().sort(),
      'R-1 — the DECLARED EXEMPTIONS are exactly the two names `§2.1` item 5 licenses, and the module really carries them (an exemption for a token the module does not use would be vacuous)',
    ).toEqual(['distance', 'threshold'])
    expect(
      (source.match(/\bthreshold\b/g) ?? []).length,
      'R-1 — the exempt option member `threshold` OCCURS in the module (the exemption is not vacuous)',
    ).toBeGreaterThan(0)
    expect(
      (source.match(/\bdistance\b/g) ?? []).length,
      'R-1 — the exempt answer field `distance` OCCURS in the module (the exemption is not vacuous)',
    ).toBeGreaterThan(0)
    // THE POSITIVE CONTROL — it must FAIL, and it must not be satisfiable by the
    // exemption: raw, joined across a literal boundary, and inside a comment.
    const positiveRaw = 'const x = el.client' + 'X'
    // **THE JOINED CORPUS SPELLS A TOKEN THE RULE ACTUALLY DECLARES** (`§3.4 R-1`'s
    // geometry rule: `offsetWidth`-family): a corpus whose only banned token is assembled
    // from two literals. *(**REPAIRED 2026-09-27:** the as-filed corpus read
    // `obj['geo' + 'metry']`, whose joined value is `geometry` — a word **no rule of
    // `R1_RULES` declares** — so the control asserted a hit the corpus could not produce.
    // The join-only normalizer is what this control is FOR, so the corpus now assembles a
    // DECLARED token across the literal boundary.)* */
    const positiveJoined = "const w = el['offset' + 'Width']"
    const positiveComment = '// the pane is expanded here\nconst z = 1'
    expect(
      scanRules(joinLiteralConcatenation(positiveRaw), R1_RULES).some((r) => r.hits.length > 0),
      'R-1 (POSITIVE control, raw) — a corpus spelling a banned token RAW must FAIL the scan',
    ).toBe(true)
    expect(
      joinLiteralConcatenation(positiveJoined).includes('offset' + 'Width'),
      `R-1 (POSITIVE control, joined across a literal boundary) — the join-only normalizer really assembles the DECLARED token across the literal boundary, so the control below is about the joiner and not about an undeclared word. Joined view: ${JSON.stringify(
        joinLiteralConcatenation(positiveJoined),
      )}`,
    ).toBe(true)
    expect(
      scanRules(joinLiteralConcatenation(positiveJoined), R1_RULES).some((r) => r.hits.length > 0),
      'R-1 (POSITIVE control, joined across a literal boundary) — a corpus spelling the token in two joined literals must FAIL the scan (the join-only normalizer is what closes `§4.4 S-6`’s assembly evasion)',
    ).toBe(true)
    expect(
      scanRules(commentKeeping(positiveComment), R1_RULES).some((r) => r.hits.length > 0),
      'R-1 (POSITIVE control, comment) — a corpus carrying the token ONLY in a comment must FAIL: comments are scanned like code (the comment-KEEPING view; a comment-stripping normalizer cannot back this control)',
    ).toBe(true)
    // The UNIT/TOKEN-LITERAL control: the CSS custom-property literal must be caught (so
    // that rule is not vacuous), while ordinary arithmetic is NOT its business.
    expect(
      scanRules(normalizeSource("const name = '" + '--' + "zone-width'"), R1_RULES).some((r) => r.hits.length > 0),
      'R-1 (POSITIVE control, unit/token literal) — a corpus carrying the CSS custom-property literal must FAIL the scan',
    ).toBe(true)
    expect(
      scanRules(normalizeSource('const next = a - b'), R1_RULES).filter((r) => r.id === 'unit/token literal' && r.hits.length > 0),
      'R-1 (NEGATIVE control, unit/token literal) — ordinary arithmetic carries no token literal, so the rule fires on the CSS custom-property form and NOT on the hyphen character (a blanket hyphen ban would not be this row’s claim)',
    ).toEqual([])
    // THE NEGATIVE CONTROL — this unit's own legitimate text PASSES.
    const negative = "export function withinProximity(distance: unknown, threshold: unknown): boolean { return typeof distance === 'number' && distance <= threshold }"
    expect(
      scanRules(normalizeSource(negative), R1_RULES).filter((r) => r.hits.length > 0),
      'R-1 (NEGATIVE control) — this unit’s own legitimate text (the member names, `candidate`, `distance`, `threshold`, `withinProximity`’s parameter names) PASSES the scan, so the row is not a blanket ban on the module’s own vocabulary',
    ).toEqual([])
  })

  it('R-2 §3.4 — the forbidden-ACCESS row: no access in the module is ROOTED IN A BANNED REALM TOKEN OR AN ALIAS OF ONE, and no ambient read for a value (P-2/P-6, I-6, I-13), with R-2’s STATED LIMIT', () => {
    const source = requireModuleSource('R-2')
    const report = scanRules(normalizeSource(source), R2_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `R-2 — no \`document\`/\`window\`/\`globalThis\`-rooted access, no alias route, and no ambient read for a value (\`Date\`, \`Math.random\`, \`process\`, \`node:fs\`, \`localStorage\`, \`eval\`, \`new Function\`) anywhere in the module: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // THE POSITIVE CONTROL, both routes: a realm-rooted computed access AND the no-token
    // realm route.
    const positiveRealm = "const d = globalThis['docu' + 'ment']"
    // **THE NO-TOKEN REALM ROUTE, REALIZED AS THE FORM THE ROW'S OWN RULE CATCHES**
    // (`§3.4 R-2`'s enumeration of that route: *"`({}).constructor.constructor('return
    // this')()`, `Reflect.construct`, `Function.prototype.call`-shaped code construction"*):
    // the route that reaches the realm **without naming any banned realm token**, driven
    // here through its `Reflect.construct` member — which is the one the rule DECLARES.
    // *(**REPAIRED 2026-09-27:** the as-filed corpus was the bare
    // `({}).constructor.constructor('return this')()` walk, which contains **no token of
    // `R2_RULES` at all** — so the control asserted a hit the scan could not produce, and
    // the control was unfalsifiable. The family member the rule declares is driven
    // instead.)* */
    const positiveNoToken = "const realm = Reflect.construct(Function, ['return this'])()"
    const positiveAmbient = 'const t = Da' + 'te.now()'
    expect(
      scanRules(joinLiteralConcatenation(positiveNoToken), R2_RULES).some((r) => r.hits.length > 0),
      `R-2 (POSITIVE control, the no-token realm route — driven as the declared route family member the rule catches) — a corpus reaching the realm through \`Reflect.construct\`, naming NO realm token, must FAIL the scan. Hits: ${JSON.stringify(
        scanRules(joinLiteralConcatenation(positiveNoToken), R2_RULES).filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    for (const [name, corpus] of [
      ['realm-rooted computed access', positiveRealm],
      ['an ambient read for a value', positiveAmbient],
    ] as const) {
      expect(
        scanRules(joinLiteralConcatenation(corpus), R2_RULES).some((r) => r.hits.length > 0),
        `R-2 (POSITIVE control — ${name}) — a corpus carrying that route must FAIL the scan`,
      ).toBe(true)
    }
    // R-2's STATED LIMIT, asserted so the row cannot be written unassertably: a BLANKET
    // ban on bracket notation is NOT claimed, and a row asserting *"no bracket notation
    // at all"* would FAIL this row's own text (`§4.4 S-8`). A locally constructed
    // object's computed access and ordinary array indexing carry no banned token and are
    // DELIBERATELY NOT BANNED — the negative control below proves the scan does not
    // fire on them.
    const negative = "const local = { a: 1 }\nconst value = local['a']\nconst list = [1, 2, 3]\nconst first = list[0]\nconst map = new Map()\nmap.set('k', 1)"
    expect(
      scanRules(normalizeSource(negative), R2_RULES).filter((r) => r.hits.length > 0),
      'R-2 (NEGATIVE control) — a locally constructed object’s computed access, ordinary array indexing and a local `Map` carry no banned token and are DELIBERATELY NOT banned by this row (R-2’s own stated limit)',
    ).toEqual([])
  })

  it('R-3 §3.4 — the EVENT-WIRING row: the module performs NO listener attachment and NO capture of its own, and the ONLY attach it can cause is the `install` delegation — with its PAIRED runtime half', async () => {
    const source = requireModuleSource('R-3')
    const report = scanRules(normalizeSource(source), R3_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `R-3 — the module contains no listener attachment, no listener removal, no capture member call and no \`on<event>=\`-style assignment: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    const positive = 'el.setPointer' + 'Capture(1)'
    expect(
      scanRules(joinLiteralConcatenation(positive), R3_RULES).some((r) => r.hits.length > 0),
      'R-3 (POSITIVE control) — a corpus calling a capture member must FAIL the scan',
    ).toBe(true)
    // THE PAIRED RUNTIME HALF (`R-3`'s own words: *"its honest limit: a text scan cannot
    // prove the absence of an attach for all control flow — so the row pairs the token
    // scan with the runtime delegated-log row"*): an attach that does not go through the
    // module’s single delegation FAILS.
    const mod = await makeModule({}, 'R-3')
    const double = sessionDouble()
    const el = { control: 'a' }
    double.setElement(el, 1)
    const mod2 = await makeModule({ session: double.sessionObject }, 'R-3')
    void mod
    expect(
      mod2.attach(el),
      'R-3 — the ONE attach the module can cause is the `install` delegation, and it returns `true` here (so the delegated-log half below is not vacuous)',
    ).toBe(true)
    expect(
      double.ops.filter((o) => o.op === 'install').length,
      'R-3 — the recorded session log carries EXACTLY ONE `install` delegation for ONE `attach`, and no other attach route exists',
    ).toBe(1)
    expect(
      double.ops.map((o) => o.op),
      'R-3 — the module’s whole recorded delegation set for one attach is `install` alone',
    ).toEqual(['install'])
  })

  it('R-4 §3.4 — the IMPORT-BOUNDARY row: the module’s import statements are EXACTLY ONE, and it is `import type { GestureHandle } from \'./gesture-session.js\'` (any second import FAILS; a value import FAILS; any other path FAILS)', () => {
    const source = requireModuleSource('R-4')
    const statements = source.match(/^\s*import[^\n]*$/gm) ?? []
    expect(
      statements.map((s) => s.trim()),
      `R-4 — \`${MODULE_RELPATH}\`'s import statements are EXACTLY ONE, and it is the TYPE-ONLY session import (§2.1 item 4, §0A note 4). A second statement FAILS; a VALUE import from the session module FAILS (\`createGestureSession\`/\`POINTER_TYPES\` are the two FAILING bindings); an import of ANY other path FAILS (\`gutter.js\`, \`zones.ts\`, \`census.ts\`, \`layout-projection.ts\`, \`owned-list-host.ts\`, \`slot-host.ts\`, \`mount-invariant-guard.ts\`, \`dom-shim.ts\`, \`types.ts\`, the demo envelope, the engine, \`electron\`, \`node:*\`, \`src/main/**\`, \`src/renderer/**\`). Read: ${JSON.stringify(
        statements,
      )}`,
    ).toEqual(["import type { GestureHandle } from './gesture-session.js'"])
    expect(
      statements.length,
      'R-4 — the count is asserted BESIDE the set (a count alone is satisfiable by renaming — `§4.4 S-7`), and it is ONE',
    ).toBe(1)
    // The two ABSENT bindings and the absent value imports are asserted as the FAILING
    // spellings, BY NAME.
    for (const forbidden of ["import { createGestureSession", 'POINTER_TYPES', 'from \'./gutter.js\'', "from './zones.js'", "from './census.js'", "from 'node:", "from 'electron'"]) {
      expect(
        source.includes(forbidden),
        `R-4 — the module does NOT carry \`${forbidden}\` (a value import of the session factory, a \`POINTER_TYPES\` binding and every other import path are FORBIDDEN — ruling 7's quoted boundary sentence, §0A note 4)`,
      ).toBe(false)
    }
    // THE POSITIVE CONTROL: a corpus carrying a SECOND import statement and a corpus
    // carrying a value import must FAIL this row’s own instrument.
    const statementScanner = (corpus: string): string[] => corpus.match(/^\s*import[^\n]*$/gm) ?? []
    expect(
      statementScanner("import type { GestureHandle } from './gesture-session.js'\nimport type { Thing } from './zones.js'").length,
      'R-4 (POSITIVE control) — a corpus with TWO import statements reads TWO statements, so the equality above has a failure mode for a second import',
    ).toBe(2)
    expect(
      statementScanner("import { createGestureSession } from './gesture-session.js'")[0]?.includes('import type'),
      'R-4 (POSITIVE control) — a corpus with a VALUE import does NOT satisfy the type-only form, so the equality above has a failure mode for `createGestureSession`/`POINTER_TYPES`',
    ).toBe(false)
  })

  it('R-5 §3.4 — the EXPORT-CENSUS row, a SET claim never a count: (a) the TWO runtime value exports read from the namespace’s keys BY NAME with a third-value control, and (b) the EIGHT type-only names asserted as a PRESENCE claim through `§5.2` leg 4', async () => {
    const mod = await requireModule('R-5')
    const values = Object.keys(mod)
      .filter((k) => k !== 'default')
      .sort()
    expect(
      values,
      `R-5(a) — the RUNTIME value exports are EXACTLY \`createRelocateSession\` and \`withinProximity\` (§2.1(a): the TWO-value census, PINNED; the record's three-value alternative with a referenced \`POINTER_TYPES\` is ARCHITECT-REVERSIBLE and does NOT land). Read: ${JSON.stringify(
        values,
      )}`,
    ).toEqual(['createRelocateSession', 'withinProximity'])
    // THE POSITIVE CONTROL: a namespace carrying a THIRD value export — and
    // specifically `POINTER_TYPES` — FAILS.
    const controlNamespace = { createRelocateSession: (): void => undefined, withinProximity: (): void => undefined, POINTER_TYPES: {} }
    expect(
      Object.keys(controlNamespace)
        .filter((k) => k !== 'default')
        .sort(),
      'R-5(a) (POSITIVE control) — a namespace carrying a THIRD value export (here `POINTER_TYPES`) does NOT equal the two-name set, so the set claim above FAILS for it',
    ).not.toEqual(['createRelocateSession', 'withinProximity'])
    expect(
      typeof mod['createRelocateSession'],
      'R-5(a) — `createRelocateSession` is callable',
    ).toBe('function')
    expect(
      typeof mod['withinProximity'],
      'R-5(a) — `withinProximity` is callable',
    ).toBe('function')
    // -----------------------------------------------------------------------
    // R-5(b) — THE TYPE-ONLY HALF. A type-only name is ERASED AT RUN TIME, so an
    // `EXACTLY` over an erased set is NOT falsifiable at the type layer and this half is
    // a PRESENCE claim pinned by `§5.2` leg 4 (the standalone strict `tsc` over THIS
    // file): every one of the eight names is imported as a type at the head of this
    // file, so a rename, removal or unexported name fails to compile. This row also
    // carries a RUNTIME non-vacuity probe: a type-only name must NOT appear among the
    // namespace’s runtime keys (if one did, the import census would be wrong).
    // -----------------------------------------------------------------------
    const typeOnlyNames = [
      'CandidateFor', 'CommitSink', 'PreviewSink', 'RelocateHandle', 'RelocateOptions', 'RelocateSession', 'RelocateStats', 'RelocateTargetFor',
    ]
    expect(
      typeOnlyNames.length,
      'R-5(b) — EIGHT type-only names are claimed, NAMED above (`§2.1`(b)); a row asserting only a COUNT without NAMING the names FAILS this row’s own text (`§4.4 S-7`)',
    ).toBe(8)
    expect(
      values.filter((k) => (typeOnlyNames as readonly string[]).includes(k)),
      'R-5(b) — NONE of the eight type-only names is a RUNTIME key (a `type` declaration is erased; one appearing here would mean the census is a value census and leg 4’s premise is wrong)',
    ).toEqual([])
    // The typed PRESENCE claim, executed at the TYPE layer: each imported name is used
    // as a type below, and this file does not compile unless the module exports all
    // eight. At RED time the diagnostic is `TS2307` (the module is absent) and NOTHING
    // ELSE — the honest leg-4 form, never suppressed.
    const typedCandidate: ModuleCandidateFor = { candidate: { opaque: true }, distance: 1 }
    const typedPreview: ModulePreviewSink = (state: unknown): void => void state
    const typedCommit: ModuleCommitSink = (gesture: unknown, value: unknown): void => {
      void gesture
      void value
    }
    const typedTarget: ModuleRelocateTargetFor = (element: unknown, candidates: readonly ModuleCandidateFor[], gesture: unknown): unknown => {
      void element
      void candidates
      void gesture
      return undefined
    }
    const typedHandle: ModuleRelocateHandle = { element: { opaque: true } }
    const typedOptions: ModuleRelocateOptions = { threshold: 20 }
    const typedStats: ModuleRelocateStats = {
      attached: 0, gestures: 0, moves: 0, candidateCalls: 0, resolveCalls: 0,
      revealWrites: 0, revealWritesApplied: 0, resets: 0, sinkCalls: 0, written: 0, lastCode: 'ok',
    }
    const typedSessionUse = (session: ModuleRelocateSession): number => session.stats().moves
    expect(
      [
        typedCandidate.distance, typedPreview, typedCommit, typedTarget, typedHandle.element,
        typedOptions['threshold'], typedStats.lastCode, typedSessionUse,
      ].length,
      'R-5(b) — the EIGHT imported type names are all USED as types in this row, so leg 4 really pins all eight (an unused type import would be checked only weakly)',
    ).toBe(8)
  })

  it('R-6 §3.4 — the NO-SHIM / NO-NEW-SURFACE / NO-IMPORTER row: the change set touches no shim member, the surface negatives hold BY SET EQUALITY AGAINST THE NAMES, and the module is imported by NO `src/**` file', async () => {
    const mod = await requireModule('R-6')
    // The module is imported by NO `src/**` file (`§4.1`, `R-12`'s companion claim).
    expect(
      importerCensus(),
      'R-6 — at the time this unit’s red set runs, `src/shared/relocate.ts` is imported by NO `src/**` file (an import-graph probe over every `src/**` file’s bytes). The module therefore appears in NONE of the built bundles and the app CANNOT reach it',
    ).toEqual([])
    // The FIVE-member surface, BY NAME (`§2.1` item 3 freezes it; a sixth member is a
    // contract change, `§4.4 S-11`). A count alone would be satisfiable by renaming.
    const members = Object.keys(mod)
      .filter((k) => k !== 'default')
      .sort()
    void members
    const instance = await makeModule({}, 'R-6')
    expect(
      ['attach', 'detach', 'reset', 'stats', 'detached'].filter((name) => !(name in instance)),
      'R-6 — the module instance carries the FIVE declared member names of `§2.1` item 3, BY NAME (a sixth member is a contract change; a missing one fails here)',
    ).toEqual([])
    expect(
      typeof instance.attach,
      'R-6 — `attach(element, hooks?)` is callable',
    ).toBe('function')
    expect(
      typeof instance.detach,
      'R-6 — `detach()` is callable',
    ).toBe('function')
    expect(
      typeof instance.reset,
      'R-6 — `reset(element)` is callable',
    ).toBe('function')
    expect(
      typeof instance.stats,
      'R-6 — `stats()` is callable',
    ).toBe('function')
    expect(
      ['detached'].every((name) => typeof (instance as unknown as Record<string, unknown>)[name] === 'boolean'),
      'R-6 — `detached` is a BOOLEAN reading (`§2.1` item 3), never a method',
    ).toBe(true)
    // The SHIM half: the change set does not touch the host-owned shim. The probe is a
    // non-vacuity precondition (the shim exists) plus the unit-owned path census
    // asserted by `R-12` — a whole-repo diff is not this row’s claim.
    expect(
      existsSync(`${REPO_ROOT}/src/shared/dom-shim.ts`),
      'R-6 — the host-owned shim exists (the non-vacuity precondition of the *"does not touch `src/shared/dom-shim.ts`"* claim, whose diff half is `R-12`’s)',
    ).toBe(true)
  })

  it('R-7 §3.4 — the COMPOSITION-BOUNDARY row: the ONLY session member names READ are `stats`/`gesture`/`disposed` and the ONLY ones CALLED are `install`/`reset`/`dispose` — asserted BY NAME, with the recorded-log half', async () => {
    const source = requireModuleSource('R-7')
    const normalized = normalizeSource(source)
    // The FORBIDDEN names, as a token scan. `cancel` is EXEMPTED from this scan because
    // the module legitimately NAMES the consumer hook `onCancel` and the session's
    // `cancel` OUTCOME (`§2.1`'s `RelocateHandle`, `§2.3` item 6(d)); the CALL-absence
    // claim for it is the recorded-log half below, which is the half that can fail.
    const report = scanRules(normalized, R7_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `R-7 — the module’s bytes carry NONE of the forbidden session member names (\`begin\`, \`end\`, \`cancel\`, \`installGestureListeners\`, \`detachGestureListeners\`, \`POINTER_TYPES\`), and the module never calls \`session.begin\`/\`end\`/\`cancel\`: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // The ALLOWED names are present BY NAME, so the scan above is not vacuous.
    for (const allowed of ['install', 'reset', 'dispose', 'stats', 'gesture', 'disposed']) {
      expect(
        source.includes(allowed),
        `R-7 — the module references the ALLOWED session member \`${allowed}\` (the closed read/call set of ` + '`§2.5` item 1), so the absence scan above is not a scan of an empty file',
      ).toBe(true)
    }
    // The POSITIVE control for the absence scan.
    const positive = 'const g = session.be' + 'gin(el)'
    expect(
      scanRules(joinLiteralConcatenation(positive), R7_RULES).some((r) => r.hits.length > 0),
      'R-7 (POSITIVE control) — a corpus calling a forbidden session member must FAIL the scan',
    ).toBe(true)
    // THE PAIRED RUNTIME HALF (R-7’s own words: *"the pair is the row"*): the recorded
    // session log contains no `begin`, no `end` and no `cancel` for a whole lifecycle.
    const double = sessionDouble()
    const el = { control: 'a' }
    double.setElement(el, 7)
    const mod = await makeModule({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 'target' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }, 'R-7')
    expect(mod.attach(el), 'R-7 — the drive attaches (so the log below is not vacuous)').toBe(true)
    inPhase('move', () => {
      double.establish()
      double.move()
    })
    inPhase('terminal', () => {
      double.terminate()
    })
    expect(
      double.ops.map((o) => o.op).filter((op) => !['install', 'reset', 'dispose'].includes(op)),
      'R-7 — THE RECORDED SESSION LOG carries NO call outside the closed table `{install, reset, dispose}`: the module never becomes a second gesture authority (I-3, I-8)',
    ).toEqual([])
  })

  it('R-8 §3.4 — THE GEOMETRY / COORDINATE / MAGNITUDE ROW over BOTH the module’s bytes AND this unit’s own test file AND its row descriptions, with a POSITIVE and a NEGATIVE control on each half', () => {
    // THE POSITIVE CONTROLS, run FIRST so the scans below are falsifiable rather than
    // vacuous — one per half: a corpus that reads a coordinate, and a description
    // claiming a magnitude, must FAIL.
    // **THE COMMENT-KEEPING VIEW** (`ADV-RL-11`): `normalizeSource` STRIPS comments, so it
    // could not back this half's own declared clause *"the module's raw bytes, comments
    // included"* — the (a) half read the comment-stripped corpus while its message claimed
    // otherwise, and its only positive control was a stripped corpus too. The view below is
    // the same one `R-1` carries (`R-1`'s comment half is the precedent this row now matches).
    const commentKeeping = (text: string): string => text.replace(/\$\{([^}]*)\}/g, '$1')
    expect(
      scanRules(normalizeSource('const x = el.client' + 'X'), R8_RULES).some((r) => r.hits.length > 0),
      'R-8(a) (POSITIVE control) — a corpus reading a coordinate must FAIL the byte scan',
    ).toBe(true)
    // **THE COMMENT-ONLY POSITIVE CONTROL** — a token carried ONLY in a comment must FAIL the
    // comment-keeping view (and this is the control the stripped view cannot back).
    expect(
      scanRules(commentKeeping('// the pane is placed from get' + 'BoundingClientRect\nconst z = 1'), R8_RULES).some((r) => r.hits.length > 0),
      'R-8(a) (POSITIVE control, COMMENT-KEEPING view) — a corpus carrying a geometry/coordinate token ONLY in a comment must FAIL: comments are scanned like code (`ADV-RL-11`)',
    ).toBe(true)
    expect(
      scanRules(commentKeeping('// the zone renders at a 240 pixel box on screen\nconst z = 1'), [
        { id: 'a rendered/geometry claim in the module’s own bytes', tokens: R8_CLAIM_PHRASES },
      ]).some((r) => r.hits.length > 0),
      'R-8(a) (POSITIVE control, CLAIM half in a comment) — a corpus whose COMMENT claims a rendered fact must FAIL the claim scan (`ADV-RL-11`)',
    ).toBe(true)
    const claimingControl = 'R-8 — the zone expands to a 240 pixel box on screen, as applied CSS renders it'
    expect(
      claimsRenderedFact(claimingControl),
      'R-8(c) (POSITIVE control) — a description claiming an applied length must FAIL the description scan',
    ).not.toEqual([])
    // EVERY declared claim phrase is DETECTED by the row's own instrument (a synthetic
    // description carrying it), so the phrase list cannot go vacuous and cannot be narrowed
    // silently to buy a pass: `§4.4 S-6`'s rule, applied to the (c) half's own rule list.
    const undetectedPhrases = R8_CLAIM_PHRASES.filter((phrase) => claimsRenderedFact(`R-8 — ${phrase} the zone`).length === 0)
    expect(
      undetectedPhrases,
      `R-8(c) (POSITIVE control, per declared phrase) — EVERY declared claim phrase is caught by the scan when a description really carries it. Undetected: ${JSON.stringify(
        undetectedPhrases,
      )}`,
    ).toEqual([])
    const source = requireModuleSource('R-8')
    const sourceReport = scanRules(normalizeSource(source), R8_RULES)
    expect(
      sourceReport.every((r) => r.hits.length === 0),
      `R-8(a) — the MODULE’s raw bytes carry NO geometry-observation call, NO coordinate read and NO geometry-shaped member (I-11, P-1/P-12): ${JSON.stringify(
        sourceReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // **THE COMMENTS-INCLUDED READING** (`ADV-RL-11`): the assertion above scans the
    // comment-STRIPPED view, so it cannot back the words *"comments included"*. This is the
    // reading that can, and the comment-only control above proves the view is falsifiable.
    const sourceCommentReport = scanRules(commentKeeping(source), R8_RULES)
    expect(
      sourceCommentReport.every((r) => r.hits.length === 0),
      `R-8(a), COMMENTS INCLUDED — a geometry/coordinate token carried ONLY in a comment of the module FAILS here (the comment-keeping view, exactly as \`R-1\` carries it): ${JSON.stringify(
        sourceCommentReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // THE MODULE'S OWN PROSE, claimed as a fact: this half scans the SUBJECT `R-8`(a)'s
    // sentence is about — the module's bytes — because the row-description half is `(c)`
    // below and the module's comments are the module's own bytes. A module whose comment
    // CLAIMS a rendered fact FAILS here.
    const sourceClaimReport = scanRules(commentKeeping(source), [
      { id: 'a rendered/geometry claim in the module’s own bytes', tokens: R8_CLAIM_PHRASES },
    ])
    expect(
      sourceClaimReport.every((r) => r.hits.length === 0),
      `R-8(a) — the MODULE’s own bytes carry no CLAIM of a rendered/layout/applied-CSS/magnitude fact either (a comment asserting one is a claim by the module, and ` + '`I-11`/`P-12` refuse it): ' + `${JSON.stringify(
        sourceClaimReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    const testBytes = readFileSync(TEST_FILE, 'utf8')
    const testReport = scanRules(normalizeSource(testBytes), R8_RULES)
    expect(
      testReport.every((r) => r.hits.length === 0),
      `R-8(b) — THIS UNIT’S OWN TEST FILE’s raw bytes contain no geometry-observation call and no coordinate read — the ROWS never measure a distance and no row computes one from a coordinate (§4.3, S-5/S-9): ${JSON.stringify(
        testReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // R-8(c) — THE ROW DESCRIPTIONS, extracted from THIS file, must not CLAIM a
    // rendered/layout/coordinate/applied-CSS/magnitude fact. **THE SCAN READS CLAIMS, NOT
    // MENTIONS** (`claimsRenderedFact`'s declared phrase list): a row whose own SUBJECT is
    // this prohibition necessarily NAMES the property in order to deny it
    // (`R-8 … THE GEOMETRY …`, `I-11 … GEOMETRY …`, `I-15 … no rendered surface …`,
    // `P-RL-SM-5 … VISIBLE REVERT …` is the contract's own term for the arm's presentation),
    // and a bare-word scan of that prose could never read `[]`. What the row REFUSES is a
    // description CLAIMING the fact, and that is what it now detects — with the per-phrase
    // control above proving the detector is not vacuous.
    const descriptions = rowDescriptions()
    expect(
      descriptions.length,
      'R-8(c) — the row-description corpus is NON-EMPTY (so the scan below is not vacuous)',
    ).toBeGreaterThan(50)
    const claiming = descriptions
      .map((d) => ({ description: d, phrases: claimsRenderedFact(d) }))
      .filter((entry) => entry.phrases.length > 0)
    expect(
      claiming,
      `R-8(c) — NO row description CLAIMS a rendered/layout/paint/applied-CSS/perceived/visible/magnitude/resolution/on-screen/geometry fact: ${JSON.stringify(
        claiming,
      )}`,
    ).toEqual([])
    // THE NEGATIVE CONTROL — ordinary count wording PASSES.
    const countWording = 'R-8 — the sink is called exactly once at the terminal and the reveal count reads one'
    expect(
      claimsRenderedFact(countWording),
      'R-8(c) (NEGATIVE control) — ordinary count wording PASSES the description scan, so the row is not a blanket ban on prose',
    ).toEqual([])
  })

  it('R-10 §3.4 — THE CAPTURE-ABSENCE ROW with its POSITIVE CONTROL: the module’s `install` options object carries NO capture field — its own key SET is EXACTLY the four hooks — AND zero capture calls occur over a full lifecycle', async () => {
    const source = requireModuleSource('R-10')
    expect(
      source.includes('capt' + 'ure:'),
      'R-10 — the module contains no `capture` token as an option member (a `capture` member on its own options, or a `capture` field in the object it builds for `install`, FAILS here)',
    ).toBe(false)
    const double = sessionDouble()
    const el = { control: 'a' }
    double.setElement(el, 10)
    const mod = await makeModule(
      { session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 'target' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined },
      'R-10',
    )
    expect(mod.attach(el), 'R-10 — the drive attaches, so the recorded `install` options below are non-vacuous').toBe(true)
    const recorded = double.installs[0]
    expect(recorded, 'R-10 — the recorded `install` call carries its options object BY IDENTITY').not.toBe(undefined)
    const options = recorded.options as Record<string, unknown>
    expect(
      options !== null && typeof options === 'object',
      'R-10 — the module hands `install` an options OBJECT (never `undefined`), because the four hooks are what the session needs',
    ).toBe(true)
    expect(
      Object.keys(options).sort(),
      `R-10 — the recorded options object’s own KEY SET is EXACTLY the four hooks \`{onStart, onMove, onEnd, onCancel}\` — a fifth \`capture\` key FAILS here (§2.2 P-7, §0A note 11): ${JSON.stringify(
        Object.keys(options),
      )}`,
    ).toEqual(['onCancel', 'onEnd', 'onMove', 'onStart'])
    expect(
      Object.keys(options).includes('capt' + 'ure'),
      'R-10 — `capture` is ABSENT (not `false`): *"no capture before establishment"* is INHERITED AND OBSERVED, never passed',
    ).toBe(false)
    // THE POSITIVE CONTROL, required so the clause is not vacuously true: a composition
    // that DID pass the field — or an options object carrying a fifth key — MUST FAIL.
    const controlOptions = { onStart: (): void => undefined, onMove: (): void => undefined, onEnd: (): void => undefined, onCancel: (): void => undefined, capt: true } as Record<string, unknown>
    controlOptions['capt' + 'ure'] = true
    expect(
      Object.keys(controlOptions).sort(),
      'R-10 (POSITIVE control) — an options object carrying a fifth capture key does NOT equal the four-name set, so the key-set assertion above has a failure mode',
    ).not.toEqual(['onCancel', 'onEnd', 'onMove', 'onStart'])
    // THE INHERITED OBSERVATION, over a FULL lifecycle: because no capture field is
    // passed, ZERO capture calls occur both BEFORE establishment and AFTER it.
    expect(
      double.ops.filter((o) => o.op === 'install').length,
      'R-10 — exactly one delegation happened before establishment (the baseline of the capture-count reading)',
    ).toBe(1)
    inPhase('move', () => {
      double.establish()
      double.move()
    })
    inPhase('terminal', () => {
      double.terminate()
    })
    expect(
      double.hookCalls.filter((h) => h === 'capt' + 'ure'),
      'R-10 — over the whole lifecycle the recorded hook log carries ZERO capture calls (before establishment AND after it), because the module passed no capture field and this module attaches no listener of its own',
    ).toEqual([])
  })

  it('R-11 §3.4 — THE UI-CONTENT WRITE ROW: no UI-content write token in the module’s source INCLUDING its comments, PAIRED with a runtime write-log assertion against a write-recording element', async () => {
    const source = requireModuleSource('R-11')
    const report = scanRules(normalizeSource(source), R11_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `R-11 — the module’s bytes carry NO UI-content write token: no attribute write, no class write, no text or markup write, no created element, no appended node, no style write (§1 item 5, §4.4 S-13). Hits: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // **THE COMMENTS-INCLUDED READING AND ITS OWN COMMENT-ONLY CONTROL** (`ADV-RL-11`): the
    // declaration above claims *"comments scanned like code"*, while `normalizeSource` STRIPS
    // comments — so the claim had no reading behind it, and its positive control was a
    // stripped corpus too. The comment-keeping view (the one `R-1` already carries) is now
    // driven over the module's bytes and proved falsifiable by a comment-only corpus.
    const commentKeeping = (text: string): string => text.replace(/\$\{([^}]*)\}/g, '$1')
    const commentReport = scanRules(commentKeeping(source), R11_RULES)
    expect(
      commentReport.every((r) => r.hits.length === 0),
      `R-11, COMMENTS INCLUDED — a UI-content write token carried ONLY in a comment of the module FAILS here: ${JSON.stringify(
        commentReport.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    const positive = "el.setAttribute('class', 'dragging')"
    expect(
      scanRules(normalizeSource(positive), R11_RULES).some((r) => r.hits.length > 0),
      'R-11 (POSITIVE control) — a corpus performing a UI-content write must FAIL the scan',
    ).toBe(true)
    expect(
      scanRules(commentKeeping('// this element writes set' + 'Attribute when it is dragged\nconst z = 1'), R11_RULES).some((r) => r.hits.length > 0),
      'R-11 (POSITIVE control, COMMENT-ONLY corpus) — a corpus carrying the write token ONLY in a comment must FAIL the comment-keeping view, so that half of the declaration is falsifiable',
    ).toBe(true)
    const negative = 'const candidate = { opaque: true }\nconst count = 1'
    expect(
      scanRules(normalizeSource(negative), R11_RULES).filter((r) => r.hits.length > 0),
      'R-11 (NEGATIVE control) — ordinary mechanism text PASSES the scan',
    ).toEqual([])
    // THE PAIRED RUNTIME HALF: a module handed a WRITE-RECORDING element must make NO
    // write call of any kind on it. This is the row that can FAIL for a UI-content write.
    await (async (): Promise<void> => {
      const { element, writes } = writeRecordingElement()
      const double = sessionDouble()
      double.setElement(element, 11)
      const mod = await makeModule(
        { session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 'target' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined },
        'R-11',
      )
      mod.attach(element)
      inPhase('move', () => {
        double.establish()
        double.move()
      })
      inPhase('terminal', () => {
        double.terminate()
      })
      mod.detach()
      expect(
        writes,
        'R-11 — a module handed a WRITE-RECORDING element makes NO write call of any kind on it: the module CALLS seams, the consumer writes (P-12)',
      ).toEqual([])
    })()
  })

  it('R-12 §3.4 — the DIFF-SCOPE row: only the files of `§5.1`’s allow-list are touched by this unit’s own artifacts (the UNIT-OWNED census, not a whole-repo diff), and the canonical artifacts are non-vacuously present', () => {
    const owned = unitOwnedPaths()
    expect(
      owned.length,
      'R-12 — the unit-owned path census is NON-EMPTY (so the equality below is not satisfied vacuously)',
    ).toBeGreaterThan(0)
    expect(
      owned.filter((p) => !ALLOWED_UNIT_PATH.test(p)),
      `R-12 — every unit-owned path on disk sits inside §5.1's allow-list (the module, this test file, this unit's spec and this unit's own greens/review records); a path outside it in the UNIT-OWNED census FAILS, while a NON-DENIED path outside the allow-list is a FINDING for the adversarial pass rather than an automatic FAIL (§5.1's own scope rule): ${JSON.stringify(
        owned,
      )}`,
    ).toEqual([])
    // THE CANONICAL ARTIFACTS must be NON-VACUOUSLY PRESENT in the range: this test file
    // and this unit’s spec (`§4.4 S-7`: an existence/scope claim is a PROBE whose FAIL is
    // meaningful).
    expect(
      existsSync(TEST_FILE),
      'R-12 — the canonical artifact `tests/relocate.test.ts` (allow-list row 2) is PRESENT on disk',
    ).toBe(true)
    expect(
      existsSync(`${REPO_ROOT}/${SPEC_RELPATH}`),
      `R-12 — the canonical artifact \`${SPEC_RELPATH}\` (allow-list row 3) is PRESENT on disk`,
    ).toBe(true)
    expect(
      owned.includes(TEST_RELPATH),
      `R-12 — this test file itself is inside the unit-owned census (the census really reads \`tests/**\`): ${JSON.stringify(owned)}`,
    ).toBe(true)
    // The DENIED set binds absolutely and OUTRANKS the allow-list: the two FROZEN pairs
    // and the app's process boundaries must be intact and un-renamed.
    for (const frozen of ['src/shared/gesture-session.ts', 'tests/gesture-session.test.ts', 'src/shared/gutter.ts', 'tests/gutter.test.ts']) {
      expect(
        existsSync(`${REPO_ROOT}/${frozen}`),
        `R-12 — the DENIED-set path \`${frozen}\` is INTACT (the FROZEN pairs are composed, never edited)`,
      ).toBe(true)
    }
  })

  it('R-13 §3.4 — THE SINGLE-WRITER / CHANNEL-COUNT ROW, A PAIR: the sink’s own record and `stats().sinkCalls` AGREE for the conformant composition, and `F-4`/`F-6` are the two positive controls the same row drives and which must FAIL', async () => {
    const mk = async (sink: ((g: GestureHandle, v: unknown) => void) | null, onRevealExtra?: (g: GestureHandle, v: unknown) => void): Promise<{ stats: RelocateStatsMirror; sinkCalls: unknown[][]; double: SessionDouble; mod: RelocateModuleMirror; el: Record<string, unknown> }> => {
      const sinkCalls: unknown[][] = []
      const sinkFn = (g: GestureHandle, v: unknown): void => {
        sinkCalls.push([g, v])
        if (sink !== null) sink(g, v)
      }
      const double = sessionDouble({ sink: null })
      const el = { control: 'a' }
      double.setElement(el, 13)
      const mod = await makeModule(
        {
          session: double.sessionObject,
          candidatesFor: (): unknown => [answer(1)],
          resolveTarget: (): unknown => ({ opaque: 'target' }),
          threshold: 20,
          commit: sink === null ? undefined : sinkFn,
          onReveal: (): void => undefined,
          onPreview: (): void => undefined,
        },
        'R-13',
      )
      void onRevealExtra
      mod.attach(el)
      inPhase('move', () => {
        double.establish()
        double.move()
      })
      inPhase('terminal', () => {
        double.terminate()
      })
      return { stats: mod.stats(), sinkCalls, double, mod, el }
    }
    // (1) THE CONFORMANT COMPOSITION — the two readings AGREE, and the record's length
    // for a gesture is `<= 1`.
    const conformant = await mk((_g, _v) => undefined)
    expect(
      conformant.sinkCalls.length,
      'R-13 (conformant) — the SINK’s own call record for one `\'end\'` gesture has length 1',
    ).toBe(1)
    expect(
      conformant.stats.sinkCalls,
      'R-13 (conformant) — `stats().sinkCalls` AGREES with the sink’s own record (both readings are asserted; a composition cannot pass by counting only its own calls)',
    ).toBe(conformant.sinkCalls.length)
    expect(
      conformant.stats.written,
      'R-13 (conformant) — `stats().written` reads 1 (the write RETURNED without throwing)',
    ).toBe(1)
    const invalidDrive = await (async (): Promise<RelocateStatsMirror> => {
      const double = sessionDouble({ sink: null })
      const el = { control: 'b' }
      double.setElement(el, 14)
      const mod = await makeModule(
        {
          session: double.sessionObject,
          candidatesFor: (): unknown => [answer(99)],
          resolveTarget: (): unknown => ({ opaque: 'target' }),
          threshold: 20,
          commit: (): void => undefined,
          onReveal: (): void => undefined,
          onPreview: (): void => undefined,
        },
        'R-13/INVALID-ARM',
      )
      mod.attach(el)
      inPhase('move', () => {
        double.establish()
        double.move()
      })
      inPhase('terminal', () => {
        double.terminate()
      })
      return mod.stats()
    })()
    expect(
      invalidDrive.sinkCalls,
      'R-13 (the invalid-arm terminal) — the sink is called EXACTLY ONCE, with the caller-supplied pre-drag value, and the later release commits NOTHING',
    ).toBe(1)
    // (2) THE NO-WRITER COMPOSITION — the positive control that MUST FAIL.
    const noWriter = await mk(null)
    expect(
      noWriter.stats.sinkCalls,
      'R-13/F-4 (POSITIVE control, the NO-WRITER composition) — the count reads `0` where the contract requires `1`, so this composition FAILS: a slot-empty composition is a NO-WRITER composition and must never be reported as a successful write',
    ).toBe(0)
    // (3) THE TWO-WRITER COMPOSITION — the sink’s own record reads `2` for ONE gesture
    // while the module’s own counter still reads `1`. THE DIVERGENCE IS THE FALSIFIER, so
    // BOTH readings are asserted.
    const twoWriterCalls: unknown[] = []
    const sharedSink = (_g: GestureHandle, v: unknown): void => {
      twoWriterCalls.push(v)
    }
    const double2 = sessionDouble({ sink: sharedSink })
    const el2 = { control: 'c' }
    double2.setElement(el2, 15)
    const mod2 = await makeModule(
      {
        session: double2.sessionObject,
        candidatesFor: (): unknown => [answer(1)],
        resolveTarget: (): unknown => ({ opaque: 'target' }),
        threshold: 20,
        commit: sharedSink,
        onReveal: (): void => undefined,
        onPreview: (): void => undefined,
      },
      'R-13/TWO-WRITER',
    )
    mod2.attach(el2)
    inPhase('move', () => {
      double2.establish()
      double2.move()
    })
    inPhase('terminal', () => {
      double2.terminate()
    })
    expect(
      twoWriterCalls.length,
      'R-13/F-6 (POSITIVE control, the TWO-WRITER composition) — the SINK’s own record for one gesture reads `2` (the session’s own `commit` option and the module’s `commit` seam were given the SAME function: the `E10-SINGLE-SINK-CHANNEL` violation), where the contract requires EXACTLY 1 — so this composition FAILS',
    ).toBe(2)
    expect(
      mod2.stats().sinkCalls,
      'R-13/F-6 (POSITIVE control) — THE DIVERGENCE: the module’s own counter still reads `1` while the sink’s record reads `2`, which is why BOTH readings are asserted and a composition cannot pass by counting only its own calls',
    ).toBe(1)
    // THE STATIC HALF: the call-site count in the normalized source. The module OWNS the
    // option member NAME `commit`, so the raw occurrence count of that name is printed
    // BESIDE the claim rather than asserted (it counts the member’s declaration sites
    // too); the claim is that NO SECOND WRITE SITE is reachable, which the runtime half
    // above drives for two compositions.
    const normalized = normalizeSource(requireModuleSource('R-13'))
    const commitNameOccurrences = (normalized.match(/commit/g) ?? []).length
    expect(
      commitNameOccurrences,
      `R-13 (static half, REPORTED NOT ASSERTED) — the module’s normalized source carries ${commitNameOccurrences} occurrences of its own option member name \`commit\`. A SECOND WRITE SITE FAILS the runtime half above; its honest limit is stated by §3.4 R-13 itself: *"a call-site count is a text claim about control flow — so the pair is the row"*`,
    ).toBeGreaterThan(0)
  })

  it('R-14 §3.4 — THE SESSION-CALL-CENSUS ROW: the module READS only `stats()`/`gesture()`/`disposed` and CALLS only `install`/`reset`/`dispose`, asserted BY NAME — never by a bare count', async () => {
    const source = requireModuleSource('R-14')
    const normalized = normalizeSource(source)
    for (const called of ['install', 'reset', 'dispose']) {
      expect(
        normalized.includes(called),
        `R-14 — the module references the CALLED member \`${called}\` BY NAME (the call set of §2.5 item 1 is closed and this name is inside it)`,
      ).toBe(true)
    }
    for (const read of ['stats', 'gesture', 'disposed']) {
      expect(
        normalized.includes(read),
        `R-14 — the module references the READ member \`${read}\` BY NAME (the read set of §2.5 item 1 is closed and this name is inside it)`,
      ).toBe(true)
    }
    // **`ADV-RL-15` — `end` IS IN THIS LOOP.** The as-filed loop drove `begin`/`cancel` only,
    // so the third member of the session's own lifecycle was covered by another row's
    // COMMENT-STRIPPED scan and by nothing here; the module's own bytes must carry no
    // `session.end` reference either (the lifecycle is the session's, `I-3`/`I-8`).
    for (const forbidden of ['be' + 'gin', 'en' + 'd', 'can' + 'cel']) {
      const re = new RegExp(`session\\s*\\.\\s*${forbidden}\\b`)
      expect(
        re.test(normalized),
        `R-14 — the module contains NO \`session.${forbidden}\` reference: \`begin\`/\`end\`/\`cancel\` appear in NO call log and in NO byte of the module (I-8)`,
      ).toBe(false)
    }
    // A row asserting this by *"the module calls the session `N` times"* FAILS R-14's own
    // text (`§4.4 S-7`): the assertion above is BY NAME, and the runtime half lives in
    // `M-1`/`M-16`/`M-13`/`M-8`.
    const runtimeDouble = sessionDouble()
    const el = { control: 'a' }
    runtimeDouble.setElement(el, 14)
    const mod = await makeModule({ session: runtimeDouble.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }, 'R-14')
    mod.attach(el)
    mod.reset(el)
    mod.detach()
    expect(
      runtimeDouble.ops.map((o) => o.op).filter((op) => !['install', 'reset', 'dispose'].includes(op)),
      'R-14 — over an attach + a reset + a detach the RECORDED log carries no name outside the closed call set (the `[T]` half of the pair)',
    ).toEqual([])
    expect(
      runtimeDouble.reads.filter((r) => !['stats', 'gesture', 'disposed'].includes(r)),
      'R-14 — the module’s own READ set is inside `{stats, gesture, disposed}` (recorded beside the calls, never counted in them)',
    ).toEqual([])
  })

  it('R-15 §3.4 — THE CODE-PROPAGATION ROW: over a table of session-refusal shapes the module returns the session’s own code VERBATIM (`===`), carries NO module-local code, and passes NO code into the session', async () => {
    const sessionCodes = ['disposed', 'stale', 'no-gesture', 'busy', 'not-installed', 'disconnected']
    // (1) THE VERBATIM PROPAGATION: a session double driven to refuse with each of its
    // own codes in turn — the string that reaches the caller is BYTE-IDENTICAL to the one
    // the session returned.
    //
    // **HOW EVERY TABLE MEMBER IS PRODUCED, named here because this probe’s FIRST
    // construction used to make four of the six members unproducible** (the row failed
    // for reasons of its own at every implementation): the session’s own `reset` is
    // driven through the double’s DECLARED refusal route — `SessionDoubleOptions.refuseResetWith`
    // (`§2.3` item 4 / `§2.4` item 5; the route `F-10` reads) — **on a double whose gesture
    // is ESTABLISHED**, because a `reset` delegated to a session with NO active gesture
    // answers the session’s own `'no-gesture'` (`docs/specs/gsession.md` `§2.4` item 4)
    // whatever the table member is, so every member would have read `'no-gesture'` and the
    // table would have asserted nothing about its other five members.
    //
    // **`'busy'`, REALIZED — not dropped from the table, and NOT a member the module can
    // be driven into**: the SESSION’s own closed union carries `'busy'` (`GestureCode`,
    // `src/shared/gesture-session.ts` line 58; the landed session answers it from `begin`
    // on a second start, `§2.3` item 3 / `P-GS-IM-2`) — **and this module never calls
    // `begin` at all** (`§2.5` item 1’s closed call set is `install`/`reset`/`dispose`;
    // `R-14` asserts it), so `'busy'` is NOT reachable through the frozen `reset` surface
    // and **is realized HERE in the double’s own declared refusal machinery** rather than
    // silently dropped: `refuseResetWith: 'busy'` makes the double’s own `reset` answer
    // the `'busy'` member of the session’s closed union, which is exactly the reading this
    // row binds (the module must hand the session’s code on VERBATIM, whatever the member
    // is, and must carry none of its own). **The row still FAILS for a module that returns
    // a code outside the closed union, for a module that renames a code, and for a module
    // that throws instead of returning** — the table is not weakened by the realization.
    for (const code of sessionCodes) {
      // (1a) THE SESSION’S OWN ANSWER, on its OWN double: `refuseResetWith` PLUS an
      // ESTABLISHED gesture, so the answered member is the table member and not the
      // `'no-gesture'` a gesture-less session answers.
      const double = sessionDouble({ sink: null, refuseResetWith: code })
      const el = { control: code }
      double.setElement(el, 15)
      double.establish()
      const sessionReturned = double.reset(el)
      expect(
        sessionReturned.code,
        `R-15 — the double’s own refusal really answers \`${code}\` (the table member is live, and the gesture is established so the session’s \`'no-gesture'\` limb is not the one answering)`,
      ).toBe(code)
      // (1b) THE MODULE’S ANSWER on the same construction: `refuseResetWith` PLUS the
      // established gesture, so the module’s own `reset` reaches its `session.reset`
      // delegation (its pre-establishment limb answers from its own state and is block (2)).
      const moduleRefusal = await (async (): Promise<RelocateResetResult> => {
        const d2 = sessionDouble({ refuseResetWith: code })
        d2.setElement(el, 15)
        const m2 = await makeModule({ session: d2.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }, `R-15/${code}/module`)
        m2.attach(el)
        inPhase('move', () => {
          d2.establish()
        })
        return m2.reset(el)
      })()
      expect(
        moduleRefusal.code,
        `R-15 — the code the module returns is BYTE-IDENTICAL to the one the session returned (\`===\`), never an invented sentinel and never a renamed one`,
      ).toBe(code)
      expect(
        moduleRefusal.code === sessionReturned.code,
        `R-15 — the comparison is by IDENTITY of the string value against the string the SESSION ITSELF returned (not a membership test, and not a table member restated here): the session answered \`${sessionReturned.code}\` and the module answered \`${moduleRefusal.code}\``,
      ).toBe(true)
      expect(
        typeof moduleRefusal.code,
        `R-15 — the refusal is RETURNED, never thrown, and the returned record carries a \`code\` member (\`${code}\`): a module that throws on this path FAILS this row at the drive, not at the comparison`,
      ).toBe('string')
    }
    // (2) THE ZERO-SESSION-CALL REFUSAL PATH (`§7` item 12): with NO active gesture the
    // module refuses `'no-gesture'` WITHOUT calling the session at all — and the code is
    // the session’s own `'no-gesture'`-class reading, derived from the module’s own state.
    const double = sessionDouble({ sink: null })
    const el = { control: 'no-gesture' }
    double.setElement(el, 15)
    const mod = await makeModule({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }, 'R-15/no-gesture')
    mod.attach(el)
    const refusal = mod.reset(el)
    expect(
      refusal,
      'R-15 — the module’s own refusal record is `{ok, code, committed}` with `ok: false`',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    expect(
      double.ops.filter((o) => o.op === 'reset').length,
      'R-15 — the `\'no-gesture\'` refusal is returned with ZERO session `reset` calls: the module owns NO code of its own and derives this one from its own state',
    ).toBe(0)
    // (3) THE CLOSED-SET HALF: the module carries NO code literal of its own, and it
    // passes NO code INTO the session.
    const source = requireModuleSource('R-15')
    for (const invented of ["'blocked'", "'refused'", "'invalid'", "'no-proximity'", "'no-target'", "'two-writer'"]) {
      expect(
        source.includes(invented),
        `R-15 — the module carries NO module-local code literal \`${invented}\`: an eighth session code, or any module-local code, FAILS (I-14, §4.4 S-11)`,
      ).toBe(false)
    }
    const resetCallArguments = double.resets.map((r) => r)
    expect(
      resetCallArguments.length,
      'R-15 — the recorded `reset` delegations are read with their own arguments, so *"passes NO code INTO the session"* is checkable rather than asserted: the module’s session-`reset` argument list is `(element, handle, value)` and carries no code member',
    ).toBe(0)
    for (const r of resetCallArguments) {
      expect(
        Object.prototype.hasOwnProperty.call(r as object, 'code'),
        'R-15 — no `reset` delegation carries a `code` field: the module never passes a code INTO the session',
      ).toBe(false)
    }
    const positive = "if (false) return { ok: false, code: 'blocked', committed: false }"
    expect(
      sessionCodes.includes('blocked'),
      `R-15 (POSITIVE control) — the invented code in a corpus is NOT a member of the session’s own closed union ${JSON.stringify(
        sessionCodes,
      )}, so the literal scan above has a failure mode`,
    ).toBe(false)
    void positive
  })

  it('R-16 §3.4 — THE RETARGET-TRANSITION STATIC ROW: the per-move presentation path contains EXACTLY ONE call of the presentation seam per observed move, paired with `M-11`’s runtime transition drive', async () => {
    const source = requireModuleSource('R-16')
    const normalized = normalizeSource(source)
    // The presentation seam’s own member name, held as a fragment so the scan cannot
    // read its own rule list.
    const previewName = 'onPre' + 'view'
    expect(
      normalized.includes(previewName),
      `R-16 — the module references its own presentation seam \`${previewName}\` (so the row is not vacuous)`,
    ).toBe(true)
    // The read-site count is REPORTED beside the term (R-16's stated limit: *"a call-site
    // count cannot prove the reachability graph, so the pair is the row"*). The runtime
    // half is `M-11`'s: ONE observed-move turn carrying BOTH the hide and the show, as ONE
    // invocation.
    const readSites = (normalized.match(new RegExp(`${previewName}`, 'g')) ?? []).length
    console.log(`R-16 static report :: { member: "${previewName}", occurrences: ${readSites} }`)
    expect(
      readSites,
      `R-16 (REPORTED) — \`${previewName}\` occurs ${readSites} time(s) in the module's normalized source. A module that performs the hide and the show through TWO calls in ONE move FAILS ` + "`M-11`" + `'s single-invocation reading, which is this row's runtime half`,
    ).toBeGreaterThan(0)
    // THE PAIRED RUNTIME HALF, driven here so the row carries both halves: a RETARGET move is
    // ONE invocation carrying BOTH transitions. **`ADV-RL-3`/(14) — THIS IS A TRUE RETARGET,
    // NOT A DEPARTURE:** the as-filed drive moved from WITHIN proximity to OUTSIDE it (a
    // departure, whose one transition is a single HIDE and which `M-11`/`I-4` already carry),
    // while a retarget is `A` within proximity → `B` within proximity inside ONE observed-move
    // turn. Both answers are within the band here; only the CANDIDATE IDENTITY changes.
    const double = sessionDouble()
    const el = { control: 'a' }
    double.setElement(el, 16)
    const previewCalls: unknown[][] = []
    let candidateIdentity: unknown = { opaque: 'A' }
    const mod = await makeModule(
      {
        session: double.sessionObject,
        candidatesFor: (): unknown => [answer(1, candidateIdentity)],
        resolveTarget: (): unknown => ({ opaque: 'target' }),
        threshold: 20,
        commit: (): void => undefined,
        onReveal: (): void => undefined,
        onPreview: (...a: unknown[]): void => {
          previewCalls.push(a)
        },
      },
      'R-16',
    )
    mod.attach(el)
    inPhase('move', () => {
      double.establish()
      double.move()
      // THE RETARGET: still WITHIN proximity (`distance === 1`, `threshold === 20`) — the
      // candidate the answer carries is a DIFFERENT one, so the transition is hide-plus-show.
      candidateIdentity = { opaque: 'B' }
      double.move()
    })
    expect(
      previewCalls.length,
      'R-16 — ONE observed-move turn carries ONE presentation invocation: move (1) into `A`’s proximity and move (2) into `B`’s (a RETARGET, not a departure — both moves are within the band)',
    ).toBe(2)
    expect(
      previewCalls[1].length,
      'R-16 — the retarget invocation carries the transition state in ONE call (never the hide and the show as TWO calls in one turn)',
    ).toBeGreaterThan(0)
  })
})

// ===========================================================================
// §4.2 item 3 — THE `withinProximity` BLOCK FIRST (`M-2`, `F-1`..`F-3`, `I-1`,
// `I-12`): *"the pure function's rows come before the composition's, because the
// composition's proximity decision depends on the comparator's answer, and a red on
// the pure half is diagnosis a green cannot give"*.
//
// THE FUNCTION HAS NO REFUSAL DOMAIN (`§2.1` item 1, `S-PURE-2`): every outcome below is
// a VALUE, `false` is a VALUE and never a refusal, and no row asserts a
// `code`/`reason`/`ok`/`skipped` shape or expects a throw.
// ===========================================================================
async function proximity(label: string): Promise<(distance: unknown, threshold: unknown) => boolean> {
  return valueExport<(d: unknown, t: unknown) => boolean>('withinProximity', label)
}

/** **`§0A` NOTE 16 — THE PINNED COMPARATOR RULE, HELD AS A PREDICATE BECAUSE THE ROW'S EXPECTATION
 *  IS THE DECLARED RULE, NOT A TRANSCRIPTION OF ANSWERS.** The clauses are written in the note's
 *  OWN order, and each limb can be varied ALONE (`comparatorWith`), which is what `I-1`'s four limb
 *  controls drive:
 *   (1) **THE `typeof` GATE** — a non-`number` operand on EITHER side answers `false`, with no
 *       coercion, no parsing and no `String` round-trip (so a bigint operand cannot throw);
 *   (2) **THE `NaN` LIMB** — a `NaN` operand on either side answers `false`;
 *   (3) **THE FINITE-NEGATIVE (UNUSABLE) LIMB** — a FINITE operand `< 0` on either side answers
 *       `false`: a distance and a proximity radius are MAGNITUDES, so a negative value is not a
 *       distance. `-0` is NOT negative (`-0 < 0` is `false`), so it keeps the boundary rule, and an
 *       INFINITE operand is NOT this class (`Number.isFinite(-Infinity)` is `false`) — the pin is
 *       NOT "any negative operand";
 *   (4) **THE COMPARISON, VERBATIM over every remaining (USABLE) pair** — the BOUNDARY IS INSIDE
 *       (`d === t` answers `true`), and a NON-FINITE `number` reaches the comparison UNCHANGED:
 *       `(-Infinity, a NON-NEGATIVE finite t)` answers `true`, `(+Infinity, finite t)` answers
 *       `false`, `(+Infinity, +Infinity)` answers `true`, `(-Infinity, -Infinity)` answers `true`
 *       (and a FINITE NEGATIVE `t` is itself the unusable class, so limb (3) decides there).
 *  Every outcome is a VALUE: this function has NO REFUSAL DOMAIN and NOTHING throws for any pair. */
type ProximityLimbs = {
  readonly boundary: 'inside' | 'strict'
  readonly nan: 'false' | 'beyondReading'
  readonly negative: 'unusable' | 'compared'
  readonly infinite: 'verbatim' | 'refused'
}
function comparatorWith(limbs: ProximityLimbs): (d: unknown, t: unknown) => boolean {
  return (d, t) => {
    if (typeof d !== 'number' || typeof t !== 'number') return false
    if (Number.isNaN(d) || Number.isNaN(t)) {
      // The pinned reading answers `false`; the mutant reading answers `!(d > t)` — a
      // "not beyond" formulation that answers `true` for a `NaN` operand.
      return limbs.nan === 'false' ? false : !(d > t)
    }
    if (limbs.negative === 'unusable' && ((Number.isFinite(d) && d < 0) || (Number.isFinite(t) && t < 0))) return false
    if (limbs.infinite === 'refused' && (!Number.isFinite(d) || !Number.isFinite(t))) return false
    return limbs.boundary === 'strict' ? d < t : d <= t
  }
}
/** `§0A` note 16's OWN limb choices, in the note's own clause order. */
const PINNED_LIMBS: ProximityLimbs = { boundary: 'inside', nan: 'false', negative: 'unusable', infinite: 'verbatim' }
/** THE DECLARED ANSWER of `withinProximity`, as the note states it — computed, never transcribed. */
const pinnedAnswer = comparatorWith(PINNED_LIMBS)

describe('§2.1 item 1 / §3.1 M-2 · §3.2 F-1..F-3 · §3.3 I-1/I-12 — the PURE TOTAL comparator `withinProximity`', () => {
  it('M-2 §3.1 — the three declared outcomes with the BOUNDARY INSIDE: (10,20) ⇒ true, (20,20) ⇒ true, (20.5,20) ⇒ false, (-5,-1) ⇒ false, (0,0) ⇒ true, and the return is a `boolean` in every drive', async () => {
    const withinProximity = await proximity('M-2')
    const drives: ReadonlyArray<{ d: number; t: number; expected: boolean; why: string }> = [
      { d: 10, t: 20, expected: true, why: '`d < t` — inside' },
      { d: 20, t: 20, expected: true, why: '`d == t` — THE BOUNDARY IS INSIDE (the pin of §2.3 item 1)' },
      { d: 20.5, t: 20, expected: false, why: '`d > t` — outside' },
      { d: -5, t: -1, expected: false, why: 'the FINITE-NEGATIVE (UNUSABLE) limb of `§0A` note 16: a FINITE operand `< 0` on either side is not a distance, so the answer is `false` — NOT because the comparison is false (the superseded prose claimed `-5 <= -1` is false, which is ARITHMETICALLY FALSE: `-5 <= -1` is TRUE; the declared answer stands under the pinned comparator, which refuses the pair BEFORE the comparison — `ADV-RL-17`)' },
      { d: 0, t: 0, expected: true, why: 'the zero pair, asserting the BOOLEAN only (`-0` is not special-cased)' },
    ]
    for (const drive of drives) {
      const result = withinProximity(drive.d, drive.t)
      expect(
        typeof result,
        `M-2 — the return is a \`boolean\` for the pair (${drive.d}, ${drive.t}) — never a record, a string, a sentinel or \`undefined\` [${drive.why}]`,
      ).toBe('boolean')
      expect(
        result,
        `M-2 — \`withinProximity(${drive.d}, ${drive.t})\` answers \`${String(drive.expected)}\` [${drive.why}]`,
      ).toBe(drive.expected)
    }
  })

  it('F-1 §3.2 — a NON-NUMBER operand answers `false` IN EVERY CASE by the `typeof` gate: no coercion, no parsing, no `String` round-trip — and a bigint does NOT throw', async () => {
    const withinProximity = await proximity('F-1')
    const operands: ReadonlyArray<{ value: unknown; name: string }> = [
      { value: '20', name: "the numeric string `'20'`" },
      { value: '0', name: "the numeric string `'0'`" },
      { value: null, name: '`null`' },
      { value: undefined, name: '`undefined`' },
      { value: true, name: '`true`' },
      { value: false, name: '`false`' },
      { value: {}, name: 'a record' },
      { value: [], name: 'an array' },
      { value: Symbol('s'), name: 'a Symbol' },
      { value: (): void => undefined, name: 'a function' },
      { value: 12n, name: 'a bigint (`12n`)' },
      { value: 0n, name: 'a bigint (`0n`)' },
      { value: new Map(), name: 'a `Map`' },
    ]
    for (const operand of operands) {
      // The distance slot.
      expect(
        withinProximity(operand.value, 20),
        `F-1 — \`withinProximity(${operand.name}, 20)\` answers \`false\`: a non-number operand answers false BY A \`typeof\` GATE, never by coercion (no \`Number(...)\`, no \`parseFloat\`, no \`+value\`, no \`String\` round-trip) — S-PURE-1`,
      ).toBe(false)
      // The threshold slot, so the other operand is not consulted for a different answer.
      expect(
        withinProximity(20, operand.value),
        `F-1 — \`withinProximity(20, ${operand.name})\` answers \`false\` in the OTHER slot too: the gate is applied per operand and the other operand is not consulted for a different answer`,
      ).toBe(false)
      // Both slots.
      expect(
        withinProximity(operand.value, operand.value),
        `F-1 — \`withinProximity(${operand.name}, ${operand.name})\` answers \`false\`, and in particular the bigint comparison does NOT THROW (the gate precedes the comparison)`,
      ).toBe(false)
    }
  })

  it('F-2 §3.2 — `NaN` on either side answers `false` in all three pairings: the comparison\u2019s own answer, not `min`-style arithmetic and not a throw', async () => {
    const withinProximity = await proximity('F-2')
    const pairs: ReadonlyArray<{ d: unknown; t: unknown; name: string }> = [
      { d: NaN, t: 20, name: '(NaN, 20)' },
      { d: 20, t: NaN, name: '(20, NaN)' },
      { d: NaN, t: NaN, name: '(NaN, NaN)' },
    ]
    for (const pair of pairs) {
      expect(
        withinProximity(pair.d, pair.t),
        `F-2 — \`withinProximity${pair.name}\` answers \`false\` — and it does NOT throw`,
      ).toBe(false)
    }
  })

  it('F-3 §3.2 — a NON-FINITE `number` reaches the comparison VERBATIM: (Infinity,Infinity) ⇒ true, (0,Infinity) ⇒ true, (5,-Infinity) ⇒ false, (-Infinity,-Infinity) ⇒ true, (42,0) ⇒ false — no finiteness refusal, no clamp, no throw', async () => {
    const withinProximity = await proximity('F-3')
    const drives: ReadonlyArray<{ d: number; t: number; expected: boolean; why: string }> = [
      { d: Infinity, t: Infinity, expected: true, why: '`Infinity <= Infinity` is true — the formula verbatim' },
      { d: 0, t: Infinity, expected: true, why: '`0 <= Infinity` is true — NO finiteness refusal exists: this is the formula, not a gate' },
      { d: 5, t: -Infinity, expected: false, why: '`5 <= -Infinity` is false' },
      { d: -Infinity, t: -Infinity, expected: true, why: '`-Infinity <= -Infinity` is true' },
      { d: 42, t: 0, expected: false, why: 'an ordinary finite pair, for contrast' },
    ]
    for (const drive of drives) {
      expect(
        withinProximity(drive.d, drive.t),
        `F-3 — \`withinProximity(${drive.d}, ${drive.t})\` answers \`${String(drive.expected)}\`: ${drive.why} (no finiteness refusal, no clamp, no throw)`,
      ).toBe(drive.expected)
    }
  })

  // **`I-1` — RE-GRAINED 2026-09-27 TO `§0A` NOTE 16'S FOUR CLAUSES.** The as-filed expectation
  // expression (`typeof d !== 'number' || typeof t !== 'number' ? false : d <= t`) asserted the
  // SUPERSEDED two-limb reading and diverged from the pin on `8` of the pool's `361` pairs (the
  // `d === -1` family with `t` in `{42, 0, -0, -1, 20, 20.5, Infinity}`, and `(-Infinity, -1)`).
  // The expectation is now the DECLARED RULE itself (`pinnedAnswer`, whose clauses mirror the
  // note's order: `typeof` → `NaN` → FINITE-NEGATIVE → the comparison VERBATIM), so no literal
  // answer is transcribed and the row cannot drift from the note again.
  //
  // THE STATES THIS ROW ENUMERATES, per limb, over the 19-value pool:
  //   · the `typeof` gate — non-number operands (undefined, null, 'x', true, [], {}, Symbol, 12n,
  //     a function, a Map) on either side ⇒ `false`, and no throw (the bigint limb included);
  //   · the `NaN` limb — `NaN` on either side ⇒ `false` (all three pairings);
  //   · the FINITE-NEGATIVE limb — a finite negative operand on either side ⇒ `false` (the pool's
  //     `-1` crosses `0`, `-0`, `-1`, `20`, `20.5`, `42`, `Infinity`, and `-Infinity` crosses `-1`);
  //   · the INFINITY limb — the four non-finite pairings reach the comparison VERBATIM;
  //   · the BOUNDARY limb — `d === t` over the usable pairs (`(20, 20)`, `(0, 0)`, `(-0, 0)`,
  //     `(Infinity, Infinity)`, `(-Infinity, -Infinity)`);
  //   · `-0` — NOT special-cased and NOT negative: it takes the boundary-inside rule.
  it('I-1 §3.3 — the comparator is TOTAL, PURE and FORMULA-EXACT under `§0A` note 16\u2019s FOUR CLAUSES: a `boolean` for EVERY pair of inputs, a throw for NONE, and the answer is `true` IFF both operands pass the `typeof` gate, are not `NaN`, are non-negative (a FINITE NEGATIVE operand on either side is the UNUSABLE class and answers `false`) AND, where finite, `d <= t` holds — with the NON-FINITE limbs reaching the comparison VERBATIM; with FOUR limb controls, one per limb: the BOUNDARY (`d === t`), the `NaN` limb, the FINITE-NEGATIVE limb and the INFINITY limb', async () => {
    const withinProximity = await proximity('I-1')
    const operandPool: readonly unknown[] = [
      undefined, null, 42, 'x', true, [], {}, Symbol('s'), 12n, (): void => undefined, new Map(), 0, -0, -1, 20, 20.5, NaN, Infinity, -Infinity,
    ]
    // ---- THE ROW'S OWN FOUR LIMB CONTROLS, ONE PER LIMB OF THE PINNED RULE ------------------
    // Each control is a comparator that gets EXACTLY ONE limb of `§0A` note 16 wrong, and each
    // asserts that THIS ROW'S EXPECTATION (`pinnedAnswer`) DISAGREES with that comparator on the
    // limb's OWN pairs — so the row is falsifiable LIMB BY LIMB and could never be satisfied by a
    // comparator that is wrong at the boundary, at `NaN`, at the finite-negative class or at the
    // infinities. (A control drive is a drive, it asserts its declared shape, and it HOLDS — the
    // declared-failing shape is the mutant, not the row.)
    // THEY ARE ASSERTED FIRST, DELIBERATELY: they depend on no module at all, so a run that is RED
    // on the enumeration below still records that this row's expectation is limb-falsifiable.
    const limbControls: ReadonlyArray<{
      readonly limb: string
      readonly pairs: ReadonlyArray<readonly [unknown, unknown]>
      readonly wrong: (d: unknown, t: unknown) => boolean
    }> = [
      {
        limb: 'the BOUNDARY limb (`d === t` is INSIDE: `<=`, not `<`)',
        pairs: [[20, 20], [0, 0], [-0, 0]],
        wrong: comparatorWith({ ...PINNED_LIMBS, boundary: 'strict' }),
      },
      {
        limb: 'the `NaN` limb (a `NaN` operand answers `false`, never the "not beyond" reading\u2019s `true`)',
        pairs: [[NaN, 20], [20, NaN], [NaN, NaN]],
        wrong: comparatorWith({ ...PINNED_LIMBS, nan: 'beyondReading' }),
      },
      {
        limb: 'the FINITE-NEGATIVE limb (a finite negative operand on EITHER side is the UNUSABLE class ⇒ `false`)',
        pairs: [[-1, 20], [-5, -1], [-1, -0], [20, -1], [-Infinity, -1]],
        wrong: comparatorWith({ ...PINNED_LIMBS, negative: 'compared' }),
      },
      {
        limb: 'the INFINITY limb (a non-finite `number` reaches the comparison VERBATIM: `(-Infinity, a NON-NEGATIVE finite t)` ⇒ `true`, `(+Infinity, finite t)` ⇒ `false`, and both-infinite pairs ⇒ `true`)',
        pairs: [[-Infinity, 20], [Infinity, 20], [Infinity, Infinity], [-Infinity, -Infinity], [0, Infinity]],
        wrong: comparatorWith({ ...PINNED_LIMBS, infinite: 'refused' }),
      },
    ]
    for (const control of limbControls) {
      const divergences = control.pairs.filter(([d, t]) => control.wrong(d, t) !== pinnedAnswer(d, t))
      expect(
        divergences.length,
        `I-1 (CONTROL — ${control.limb}) — a comparator that gets THIS limb wrong MUST be caught by this row's expectation: the mutant and \`pinnedAnswer\` must DISAGREE on this limb's own pairs ${JSON.stringify(control.pairs.map(([d, t]) => [brief(d), brief(t)]))}, or the limb is not actually driven`,
      ).toBeGreaterThan(0)
    }
    // THE MUTANTS ARE ONE-LIMB WRONG, NOT GLOBALLY WRONG: each differs from the pinned reading
    // ONLY on its own limb, so no control passes by disagreeing everywhere (which would make it
    // a test of nothing in particular).
    const boundaryMutant = comparatorWith({ ...PINNED_LIMBS, boundary: 'strict' })
    expect(
      boundaryMutant(10, 20),
      'I-1 (CONTROL — the BOUNDARY limb) — the boundary mutant is right everywhere the boundary does not decide (`d < t`: `(10, 20)` ⇒ `true`), so it exercises the boundary limb ALONE',
    ).toBe(true)
    expect(
      comparatorWith({ ...PINNED_LIMBS, infinite: 'refused' })(10, 20),
      'I-1 (CONTROL — the INFINITY limb) — the infinity mutant is right on the finite pairs (`(10, 20)` ⇒ `true`), so it exercises the infinity limb ALONE',
    ).toBe(true)
    let drives = 0
    for (const d of operandPool) {
      for (const t of operandPool) {
        drives += 1
        let threw = false
        let answer: unknown = undefined
        try {
          answer = withinProximity(d, t)
        } catch {
          threw = true
        }
        expect(
          threw,
          `I-1 — \`withinProximity(${brief(d)}, ${brief(t)})\` does NOT throw (the function returns a boolean for EVERY pair of inputs)`,
        ).toBe(false)
        expect(
          typeof answer,
          `I-1 — the answer for (${brief(d)}, ${brief(t)}) is a \`boolean\`, never \`undefined\`, a record, a string or a sentinel`,
        ).toBe('boolean')
        const expected = pinnedAnswer(d, t)
        expect(
          answer,
          `I-1 — for (${brief(d)}, ${brief(t)}) the answer is EXACTLY the declared one (\`§0A\` note 16): the \`typeof\` gate's \`false\`, the UNUSABLE-class \`false\` (a FINITE NEGATIVE operand on either side), or \`distance <= threshold\` VERBATIM over the USABLE class (${String(expected)})`,
        ).toBe(expected)
      }
    }
    expect(
      drives,
      'I-1 — the enumerated cross-product really ran (so the universal above is not vacuous over the pool)',
    ).toBe(operandPool.length * operandPool.length)
  })

  it('I-12 §3.3 — the comparator MUTATES AND RETAINS NOTHING: both operands are reference-identical and value-identical after any call, a frozen pair works exactly like an unfrozen one, and there is no module-level mutable state', async () => {
    const withinProximity = await proximity('I-12')
    const holder = { measured: 10 }
    const thresholdHolder = { value: 20 }
    const before = JSON.stringify({ a: holder, b: thresholdHolder })
    // A driver that hands the function objects where a `number` is declared, so a
    // mutation of a caller's own record (if the function ever wrote to it) would be
    // observable.
    const first = withinProximity(holder as unknown as number, thresholdHolder as unknown as number)
    const second = withinProximity(10, 20)
    const third = withinProximity(10, 20)
    expect(
      first,
      'I-12 — a non-number operand answers `false` (the gate), and the object operands are untouched',
    ).toBe(false)
    expect(
      JSON.stringify({ a: holder, b: thresholdHolder }),
      'I-12 — after the call both operands are reference-identical and value-identical to their pre-call state: the function MUTATES NOTHING and RETAINS NOTHING',
    ).toBe(before)
    expect(
      Object.is(holder, holder) && holder.measured === 10,
      'I-12 — the caller’s own record is unaltered (read through the same mechanism)',
    ).toBe(true)
    expect(
      second,
      'I-12 — the identical call answers identically (no retained state can make a later call differ)',
    ).toBe(third)
    // A FROZEN pair works exactly like an unfrozen one — including a frozen record handed
    // as an operand, which a mutating implementation would fail on.
    const frozenRecord = Object.freeze({ measured: 1 })
    expect(
      withinProximity(frozenRecord as unknown as number, 20),
      'I-12 — a FROZEN pair (a frozen record as the distance operand, a frozen record as the threshold operand) works exactly like an unfrozen one: the `typeof` gate answers `false` and no write is attempted',
    ).toBe(withinProximity({ measured: 1 } as unknown as number, 20))
    expect(
      withinProximity(10, 20),
      'I-12 — the frozen drive did not perturb the function’s own behaviour on a legal pair (there is no module-level mutable state)',
    ).toBe(true)
  })
})

// ===========================================================================
// THE COMPOSITION HARNESS — one named builder, so every composition row drives the
// SAME declared wiring and a row's difference is its OVERRIDE (`§0A` note 7: the
// module's `commit` seam, its `onReveal` and its `onPreview` are three distinct
// functions; the session double's own `sink` parameter is the WIRING's construction
// option and is `null` unless a row deliberately makes the two writers one function).
// ===========================================================================
type Composition = {
  readonly mod: RelocateModuleMirror
  readonly double: SessionDouble
  readonly el: Record<string, unknown>
  readonly revealArgs: unknown[][]
  readonly previewArgs: unknown[][]
  readonly sinkArgs: unknown[][]
  readonly hooks: ReturnType<typeof hookRecorder>
  /** `§2.1` item 7 — THE CONSUMER'S HOOKS RECORD, carrying the four hooks AND the
   *  pre-drag reading. A row that asserts the CALLER's pre-drag value passes THIS record
   *  to `attach` (`A2`(e)): the value reaches the module through the member, never through
   *  a value the test double substituted (`§2.3` item 9(a)). */
  readonly hookArgs: Record<string, unknown>
  /** The caller's pre-drag value for the NEXT established gesture. */
  setPreDrag(value: unknown): void
  /** THE CONSUMER'S OWN RECORDED INVOCATION COUNT (`§2.1` item 7(d)). */
  preDragCalls(): number
  readonly calls: string[]
  stats(): RelocateStatsMirror
}
async function compose(label: string, overrides: RelocateOptionsMirror = {}, opts: SessionDoubleOptions = {}): Promise<Composition> {
  const revealArgs: unknown[][] = []
  const previewArgs: unknown[][] = []
  const sinkArgs: unknown[][] = []
  const calls: string[] = []
  const double = sessionDouble(opts)
  const el: Record<string, unknown> = { control: label }
  // The double's second parameter is VESTIGIAL (read by no declaration): the element is the
  // only thing this call establishes. The caller's pre-drag value travels on the hooks record.
  double.setElement(el)
  const hooks = hookRecorder()
  const preDrag = preDragChannel(undefined, hooks.handle)
  const hookArgs = preDrag.hooks
  const options: RelocateOptionsMirror = {
    session: double.sessionObject,
    candidatesFor: (): unknown => [answer(1, { opaque: 'candidate' })],
    resolveTarget: (): unknown => ({ opaque: 'target' }),
    threshold: 20,
    commit: (g: unknown, v: unknown): void => {
      calls.push('commit')
      sinkArgs.push([g, v])
    },
    onReveal: (...a: unknown[]): void => {
      calls.push('onReveal')
      revealArgs.push(a)
    },
    onPreview: (...a: unknown[]): void => {
      calls.push('onPreview')
      previewArgs.push(a)
    },
    ...overrides,
  }
  const mod = await makeModule(options, label)
  return {
    mod,
    double,
    el,
    revealArgs,
    previewArgs,
    sinkArgs,
    hooks,
    hookArgs,
    setPreDrag: preDrag.set,
    preDragCalls: preDrag.count,
    calls,
    stats: (): RelocateStatsMirror => mod.stats(),
  }
}

// ===========================================================================
// §3.3 — THE INVARIANTS `I-2`..`I-15` (`I-1`/`I-12` are the pure block's, above).
// ===========================================================================
describe('§3.3 I-2..I-15 — the invariants that hold in every state', () => {
  it('I-2 §3.3 — THE THREE CHANNELS ARE THREE DIFFERENT FUNCTIONS and (A) is once-per-gesture-at-end: for EVERY gesture `onReveal` is invoked at most once, only at an end, never from start/move/preview — and a gesture crossing the proximity N >= 2 times still reads exactly ONE', async () => {
    for (const crossings of [1, 2, 5]) {
      const c = await compose(`I-2/N=${crossings}`)
      const c2 = await compose(`I-2/N=${crossings}/crossing`, {
        candidatesFor: (): unknown => [answer(1)],
      })
      void c2
      // A gesture that enters proximity, leaves it, and enters it again — `crossings`
      // times — must STILL read exactly one reveal at the terminal.
      c.mod.attach(c.el)
      c.double.establish()
      for (let i = 0; i < crossings; i += 1) {
        c.double.move() // inside
        c.double.move() // the same within-band answer, so the crossing count is in the MOVES
      }
      c.double.terminate()
      expect(
        c.revealArgs.length,
        `I-2 — the CONSUMER's own onReveal record reads exactly ONE for a gesture of ${crossings * 2} within-proximity observed moves (the per-crossing shape FAILS this row: *"a gesture crossing the proximity N >= 2 times still reads exactly one"*)`,
      ).toBe(1)
      expect(
        c.stats().revealWrites,
        'I-2 — the module’s own `stats().revealWrites` AGREES with the consumer’s record at 1 (they must agree for a conformant composition)',
      ).toBe(1)
      expect(
        c.sinkArgs.length,
        'I-2 — the module’s own `commit` SEAM ran exactly once for the gesture, and only at its terminal — READ FROM THE SINK’S OWN RECORD (`RelocateOptions.commit`’s consumer-side invocation) BESIDE the module’s counter, NEVER from a member of the install options object: the frozen `install` surface has no `commit` member at all (§2.5 item 7 clauses 1–3)',
      ).toBe(1)
      expect(
        c.calls.indexOf('onReveal'),
        `I-2 — the reveal invocation sits INSIDE the terminal (the recorded call order reads ${JSON.stringify(
          c.calls,
        )}): it is NEVER from the module’s onStart/onMove/onPreview (P-RL-SM-3’s phase assertion)`,
      ).toBe(c.calls.indexOf('commit') - 1)
    }
  })

  it('I-3 §3.3 — THE SESSION IS THE SOLE GESTURE AUTHORITY and the module owns NO lifecycle: it attaches no listener, never calls the session\u2019s begin/end/cancel, and never writes a channel the session owns beyond its one commit seam — while entering the session\u2019s own reset terminal is PERMITTED', async () => {
    const c = await compose('I-3', { candidatesFor: (): unknown => [] })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      c.double.ops.map((o) => o.op).filter((op) => !['install', 'reset', 'dispose'].includes(op)),
      'I-3 — the recorded session log carries NO call outside `{install, reset, dispose}`: the module re-expresses NONE of the session’s lifecycle (P-4, V-13’s remedy)',
    ).toEqual([])
    expect(
      c.stats().resets,
      'I-3 — entering the session’s own `reset` terminal from the module’s move turn IS permitted for a composer and is NOT a second authority: the invalid arm was taken once here, exactly as declared',
    ).toBe(1)
    const source = requireModuleSource('I-3')
    const normalized = normalizeSource(source)
    for (const forbidden of ['addEventListener', 'removeEventListener']) {
      expect(
        normalized.includes(forbidden),
        `I-3 — the module attaches no listener of its own: \`${forbidden}\` does not appear in its bytes (the ONLY attach it can cause is the \`install\` delegation)`,
      ).toBe(false)
    }
  })

  it('I-4 §3.3 — THE ZONE’S DISPLAYED-NESS IS NOT MONOTONIC and the hide is on the PER-MOVE channel: it turns on within proximity and off again mid-gesture on EITHER trigger, and a retarget’s hide-plus-show is ONE invocation in ONE observed-move turn — while the durable write is unaffected (DERIVED mapping, §0A note 6)', async () => {
    let distance = 1
    let candidate: unknown = { opaque: 'A' }
    const c = await compose('I-4', {
      candidatesFor: (): unknown => [answer(distance, candidate)],
    })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move() // (1) into proximity
    distance = 99
    c.double.move() // (2) OUT of proximity — the hide, mid-gesture
    distance = 2
    c.double.move() // (3) back in — the show again
    candidate = { opaque: 'B' }
    c.double.move() // (4) retarget
    c.double.terminate()
    expect(
      c.previewArgs.length,
      'I-4 — the per-move channel received ONE invocation per observed move (4 moves ⇒ 4 invocations), including the hide and each re-show: the displayed-ness is NOT monotonic',
    ).toBe(4)
    expect(
      c.stats().revealWrites,
      'I-4 — the NON-MONOTONICITY does not affect the durable write: exactly one reveal invocation at the end terminal',
    ).toBe(1)
    expect(
      c.stats().sinkCalls,
      'I-4 — and exactly one sink write for the gesture',
    ).toBe(1)
  })

  it('I-5 §3.3 — THE CONSUMER’S HOOKS AND THE CONSUMER’S OPAQUE VALUES PASS THROUGH BY IDENTITY: the handle, the element, the candidate, the target and the pre-drag value are never cloned, stringified, keyed or altered by this module', async () => {
    const target = { opaque: 'the-chosen-target' }
    const preDrag = { opaque: 'the-pre-drag-value' }
    let seenCandidate: unknown = null
    const c = await compose('I-5', {
      candidatesFor: (): unknown => {
        const a = answer(3, { opaque: 'the-candidate' })
        seenCandidate = a.candidate
        return [a]
      },
      resolveTarget: (element: unknown, candidates: readonly unknown[], gesture: unknown): unknown => {
        void element
        void candidates
        void gesture
        return target
      },
    })
    c.setPreDrag(preDrag)
    c.mod.attach(c.el, c.hookArgs)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      c.revealArgs.length,
      'I-5 — the reveal ran (so the identity assertions below are not vacuous)',
    ).toBe(1)
    expect(
      c.sinkArgs[0][1],
      'I-5 — the sink receives the EXACT object the consumer’s `resolveTarget` returned (`toBe`, never a clone, a stringification or a key)',
    ).toBe(target)
    expect(
      c.hooks.calls.filter((h) => h.hook === 'onStart').length,
      'I-5 — the consumer’s own `onStart` hook ran exactly once at establishment, forwarded by identity',
    ).toBe(1)
    expect(
      c.hooks.calls.find((h) => h.hook === 'onStart')?.args[0],
      'I-5 — the consumer’s `onStart` receives the EXACT element the session gave the module’s wrapper (`toBe`)',
    ).toBe(c.el)
    expect(
      c.hooks.calls.find((h) => h.hook === 'onEnd')?.args[0],
      'I-5 — the consumer’s `onEnd` receives the EXACT element (`toBe`)',
    ).toBe(c.el)
    expect(
      seenCandidate,
      'I-5 — the candidate the module handed to `resolveTarget` is the same by identity as `seenCandidate` (the module never replaced it)',
    ).not.toBe(null)
    expect(
      c.preDragCalls(),
      'I-5 — the consumer’s own recorded INVOCATION COUNT of the hooks record’s `preDragValueOf` member reads exactly 1 for the established gesture (`§2.1` item 7(d)): the value passed through the member, never through a substitution',
    ).toBe(1)
    expect(
      c.sinkArgs[0][1],
      'I-5 — and the SINK’s committed value is the caller’s `resolveTarget` answer, never the pre-drag value: the `\'end\'` limb carries the dragged/committed value (`§0A` note 15’s `A2` continuation’s closing pin)',
    ).toBe(target)
    // THE PRE-DRAG VALUE'S OWN IDENTITY, on the arm that commits it: the third argument of
    // `session.reset(element, handle, value)` is the caller’s value BY IDENTITY, and the
    // call’s ARITY is THREE (`§2.3` item 9(a)) — read from the delegation itself.
    const arm = await compose('I-5/arm', { candidatesFor: (): unknown => [answer(999)] })
    arm.setPreDrag(preDrag)
    arm.mod.attach(arm.el, arm.hookArgs)
    arm.double.establish()
    arm.double.move()
    expect(
      arm.double.resets[0].value,
      'I-5 — the invalid arm’s `session.reset` carries the CALLER’S pre-drag value BY IDENTITY (never cloned, stringified, keyed or altered by this module)',
    ).toBe(preDrag)
    expect(
      arm.double.resets[0].arity,
      'I-5 — the delegation’s ARITY is THREE (`session.reset(element, handle, value)`): a two-argument delegation would record `arity: 2` here',
    ).toBe(3)
  })

  it('I-6 §3.3 — NO DOM, NO AMBIENT READ, NO ELEMENT LOOKUP, EVER: the module contains no realm-rooted access, no element-query token in any form, and reads no ambient global', () => {
    const source = requireModuleSource('I-6')
    const report = scanRules(normalizeSource(source), [...R2_RULES, ...R1_RULES.filter((r) => r.id === 'selector')])
    expect(
      report.every((r) => r.hits.length === 0),
      `I-6 — the module’s bytes carry no realm-rooted access and no element-lookup token (\`closest\`, \`querySelector*\`, \`getElementById\`): ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // The positive control, so the row is falsifiable.
    expect(
      scanRules(normalizeSource('const first = el.clo' + 'sest(\'.a\')'), R1_RULES).some((r) => r.hits.length > 0),
      'I-6 (POSITIVE control) — a corpus performing an element query must FAIL the scan',
    ).toBe(true)
  })

  it('I-7 §3.3 — NO LISTENER AND NO CAPTURE OF THIS MODULE’S OWN: every attach is an `install` delegation, the module calls no capture member and passes NO install options beyond the four hooks', async () => {
    const source = requireModuleSource('I-7')
    const report = scanRules(normalizeSource(source), R3_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `I-7 — the module’s bytes carry no listener attachment, no listener removal and no capture member call: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    const c = await compose('I-7')
    c.mod.attach(c.el)
    expect(
      c.double.installs.length,
      'I-7 — every attach is an `install` delegation: exactly one recorded delegation for one attach',
    ).toBe(1)
    expect(
      Object.keys(c.double.installs[0].options as object).sort(),
      'I-7 — the delegated options carry EXACTLY the four hooks (no capture field, no fifth member)',
    ).toEqual(['onCancel', 'onEnd', 'onMove', 'onStart'])
  })

  it('I-8 §3.3 — THE COMPOSITION BOUNDARY IS A CLOSED SET: the only session members CALLED are `install`, `reset` and `dispose`; the only ones READ are `stats()`, `gesture()` and `disposed`', async () => {
    const c = await compose('I-8', { candidatesFor: (): unknown => [] })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    c.mod.detach()
    expect(
      c.double.ops.map((o) => o.op),
      'I-8 — the whole recorded call set for a full lifecycle (attach + an invalid-arm gesture + detach) is inside `{install, reset, dispose}`',
    ).toEqual(['install', 'reset', 'dispose'])
    expect(
      c.double.reads.filter((r) => !['stats', 'gesture', 'disposed'].includes(r)),
      'I-8 — the recorded READ set is inside `{stats, gesture, disposed}` (reads are recorded BESIDE the calls, never counted in them)',
    ).toEqual([])
  })

  it('I-9 §3.3 — NOTHING CARRIES ACROSS A GESTURE: the per-gesture record is DISCARDED at every terminal, a subsequent `reset(element)` refuses with ZERO session calls, and no element-keyed value, cache or memo exists', async () => {
    const c = await compose('I-9', { candidatesFor: (): unknown => [answer(1, { opaque: 'first-gesture-candidate' })] })
    c.mod.attach(c.el)
    c.double.setElement(c.el, { opaque: 'first-gesture-pre-drag' })
    c.double.establish()
    c.double.move()
    c.double.terminate()
    const opsAfterFirst = c.double.ops.length
    const refusal = c.mod.reset(c.el)
    expect(
      refusal,
      'I-9 — at and after the terminal a `reset(element)` refuses (the per-gesture record is GONE), and it does so with a RECORD rather than a throw',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    expect(
      c.double.ops.length,
      'I-9 — the refusal makes ZERO session calls (its own count is the module’s state, never a delegation)',
    ).toBe(opsAfterFirst)
    const source = requireModuleSource('I-9')
    for (const token of ['WeakMap', 'new Map(']) {
      expect(
        source.includes(token),
        `I-9 — the module holds NO element-keyed structure: \`${token}\` does not appear in its bytes (no element-keyed value, cache, memo or map exists)`,
      ).toBe(false)
    }
  })

  it('I-10 §3.3 — THE MODULE IS TOTAL AT THE SEAM: the factory NEVER throws for ANY argument and every member returns its declared shape for every input — with EXACTLY TWO named propagation exceptions (a throwing `commit` at the terminal turn, a throwing `onPreview` at the observed-move turn)', async () => {
    const create = await valueExport<(o?: unknown) => unknown>('createRelocateSession', 'I-10')
    const hostileArguments: readonly unknown[] = [undefined, null, 42, 'x', true, [], {}, Symbol('s'), 12n, (): void => undefined, new Proxy({}, { get: (): never => { throw new Error('a hostile trap') }, has: (): never => { throw new Error('a hostile trap') } }), Object.freeze({}), { get session(): never { throw new Error('a throwing accessor') } }]
    for (const arg of hostileArguments) {
      let threw = false
      let module: unknown = undefined
      try {
        module = create(arg as Record<string, unknown>)
      } catch {
        threw = true
      }
      expect(
        threw,
        `I-10 — \`createRelocateSession(${brief(arg)})\` NEVER throws for ANY argument (§2.4 item 4: the total-member-read rule makes this a value, not a throw)`,
      ).toBe(false)
      expect(
        module !== null && typeof module === 'object',
        `I-10 — the factory returns a MODULE object for ${brief(arg)} (a VALID but INERT module), never \`null\`/\`undefined\`/a primitive`,
      ).toBe(true)
    }
    // THE TWO NAMED PROPAGATION EXCEPTIONS, asserted as the universal's own bound.
    const throwingPreview = await compose('I-10/PREVIEW', { onPreview: (): void => { throw new Error('the presentation seam threw') }, candidatesFor: (): unknown => [answer(1)] })
    throwingPreview.mod.attach(throwingPreview.el)
    throwingPreview.double.establish()
    let previewThrew = false
    try {
      throwingPreview.double.move()
    } catch {
      previewThrew = true
    }
    expect(
      previewThrew,
      'I-10 (the FIRST named exception) — a throwing `onPreview` PROPAGATES from the observed-move turn: the throw escapes the module’s move turn to that turn’s caller (§2.4 item 2)',
    ).toBe(true)
    const throwingCommit = await compose('I-10/COMMIT', { commit: (): void => { throw new Error('the sink threw') } })
    throwingCommit.mod.attach(throwingCommit.el)
    throwingCommit.double.establish()
    throwingCommit.double.move()
    let commitThrew = false
    try {
      throwingCommit.double.terminate()
    } catch {
      commitThrew = true
    }
    expect(
      commitThrew,
      'I-10 (the SECOND named exception) — a throwing `commit` PROPAGATES to the caller of the terminal turn',
    ).toBe(true)
  })

  it('I-11 §3.3 — NEVER A GEOMETRY, COORDINATE OR MAGNITUDE CLAIM: no row of this unit asserts a rendered-geometry, layout, paint, coordinate, applied-CSS, cursor or click-retargeting property, and the module reads NO coordinate, takes NO event object and computes NO distance', () => {
    const source = requireModuleSource('I-11')
    const report = scanRules(normalizeSource(source), R8_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `I-11 — the module reads no coordinate and observes no geometry: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // THE MANDATORY CLAUSE'S OWN HALF: no member of this module's surface takes an event
    // object, so no parameter exists through which a coordinate could arrive.
    //
    // **THE TOKEN LIST IS HELD AS FRAGMENTS AND THE SUBJECT IS NAMED (REPAIRED 2026-09-27):**
    // the as-filed loop iterated an assembled list over the SAME FILE THAT SPELLED IT, so a
    // `testBytes.includes(<assembled event-type name>)` could never be `false` — the row
    // asserted a fact its own subject made impossible, and it tested nothing. Held as
    // fragments, the bytes of this file really do NOT carry an event-type name **except**
    // in this list's own parts, so both assertions below have a failure mode (a row that
    // spells an event type raw, or a module that names one, FAILS).
    const eventTypes: readonly string[] = ['Mouse' + 'Event', 'Pointer' + 'Event', 'Touch' + 'Event', 'Keyboard' + 'Event']
    expect(
      eventTypes.filter((token) => token.endsWith('Event')).length,
      'I-11 — the row’s own token list really assembles the four EVENT-TYPE names it declares (the fragments are the R-1/R-8 form, and the list is not vacuous)',
    ).toBe(4)
    const testBytes = readFileSync(TEST_FILE, 'utf8')
    for (const token of eventTypes) {
      expect(
        testBytes.includes(token),
        `I-11 — THIS FILE names no EVENT TYPE in its own bytes (\`${token}\`): the element is an OPAQUE argument and no row hands the module an event object (§2.2 P-1, layer anchor 2). The list above is FRAGMENT-HELD precisely so this reading is falsifiable — a row that spells the name raw FAILS it`,
      ).toBe(false)
      expect(
        normalizeSource(source).includes(token),
        `I-11 — and THE MODULE names no EVENT TYPE either (\`${token}\`): no member of its surface takes an event object (§3.3 I-11’s own claim, §2.2 P-1)`,
      ).toBe(false)
    }
    // THE POSITIVE CONTROL: a corpus naming an event type FAILS this row's instrument.
    const eventControl = 'const handler = (e: ' + eventTypes[0] + '): void => undefined'
    expect(
      eventTypes.filter((token) => eventControl.includes(token)),
      'I-11 (POSITIVE control) — a corpus naming an event type is CAUGHT by the very reading above, so the two negatives are not vacuous',
    ).not.toEqual([])
    const descriptions = rowDescriptions()
    const claiming = descriptions
      .map((d) => ({ description: d, phrases: claimsRenderedFact(d) }))
      .filter((entry) => entry.phrases.length > 0)
    expect(
      claiming,
      `I-11 — NO row description in this file CLAIMS a rendered/layout/coordinate/applied-CSS/cursor/magnitude fact (the same claim-phrase detector ` + '`R-8`(c) uses, for the reason stated there): ' + `${JSON.stringify(
        claiming,
      )}`,
    ).toEqual([])
  })

  it('I-13 §3.3 — NO STORE, NO PERSISTENCE, NO MCP SURFACE, NO CENSUS READ: no file, no store object, no IPC method, no tool, no resource, no `RpcCommand` member, and no census read of any kind', async () => {
    const source = requireModuleSource('I-13')
    const report = scanRules(normalizeSource(source), [...R1_RULES.filter((r) => r.id === 'store/cache' || r.id === 'census')])
    expect(
      report.every((r) => r.hits.length === 0),
      `I-13 — the module’s bytes carry no store/cache token and no census token: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    expect(
      importerCensus(),
      'I-13 — the module appears in NO `src/**` file, so it reaches NO MCP registration site, no handler body and no envelope node (this unit appears in none of the MCP registration sites)',
    ).toEqual([])
    const mod = await makeModule({}, 'I-13')
    expect(
      'mcp' in (mod as unknown as Record<string, unknown>),
      'I-13 — the module carries no MCP-shaped member: `stats()` is a module method, not an agent-reachable surface',
    ).toBe(false)
  })

  it('I-14 §3.3 — THE CODE DOMAIN IS THE SESSION’S OWN CLOSED UNION AND NOTHING ELSE: this module declares NO code of its own, propagates every code it reads byte-identically, and never passes a code into the session', async () => {
    const source = requireModuleSource('I-14')
    const knownCodes = ['ok', 'no-gesture', 'disposed', 'not-installed', 'busy', 'stale', 'disconnected']
    // The module may NAME the session’s codes only as type-level literals; it must carry
    // NO literal code of its OWN — the invented-sentinel scan is the falsifiable half.
    for (const invented of ["'invalid'", "'refused'", "'no-proximity'", "'no-target'", "'second-writer'", "'two-writer'", "'blocked'"]) {
      expect(
        source.includes(invented),
        `I-14 — the module carries NO module-local code literal \`${invented}\`: an eighth session code, or any module-local code, FAILS`,
      ).toBe(false)
    }
    // The closed union is read from the session's own module, BY NAME, so the domain
    // this row cites is the session's and not a list restated here.
    const sessionSource = readFileSync(`${REPO_ROOT}/src/shared/gesture-session.ts`, 'utf8')
    for (const code of knownCodes) {
      expect(
        sessionSource.includes(`'${code}'`),
        `I-14 — the session’s own module carries the code literal \`'${code}'\`, so the closed-union domain this row cites is the session’s own and is not invented here`,
      ).toBe(true)
    }
    // The module PROPAGATES the codes byte-identically (the runtime half is `R-15`'s,
    // asserted over the whole table there).
    const double = sessionDouble({ refuseResetWith: 'busy' })
    const el = { control: 'a' }
    double.setElement(el, 14)
    const mod = await makeModule({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }, 'I-14')
    mod.attach(el)
    double.establish()
    expect(
      mod.reset(el).code,
      'I-14 — the code the module returns is the session’s own member, byte-identically',
    ).toBe('busy')
  })

  it('I-15 §3.3 — `[U]` IS NOT OFFERED AND `[D]` IS NOT CLAIMED, and BOTH refusals are STRUCTURAL: the module is imported by no `src/**` file and reads no coordinate, so there is no rendered surface to observe and nothing for a measuring leg to measure', () => {
    expect(
      importerCensus(),
      'I-15 (the STRUCTURAL reason, part (a)) — the module is imported by NO `src/**` file, so there is NO RENDERED SURFACE TO OBSERVE for a `ui` leg to visit',
    ).toEqual([])
    const source = requireModuleSource('I-15')
    const report = scanRules(normalizeSource(source), R8_RULES)
    expect(
      report.every((r) => r.hits.length === 0),
      `I-15 (the STRUCTURAL reason, part (b)) — the module READS NO COORDINATE and authors no element, so there is NOTHING FOR A MEASURING LEG TO MEASURE: ${JSON.stringify(
        report.filter((r) => r.hits.length > 0),
      )}`,
    ).toBe(true)
    // `docs/specs/zones.md` §4.4 S-6's sentence, carried: the row may not be moved to the
    // `ui` leg silently. The probe reads the spec's own bytes so the refusal is
    // attributable rather than asserted here.
    const spec = readFileSync(`${REPO_ROOT}/${SPEC_RELPATH}`, 'utf8')
    expect(
      spec.includes('may not be moved to the'),
      'I-15 — this unit’s spec carries the carried-verbatim refusal sentence (`docs/specs/zones.md` §4.4 S-6: *"the row may not be moved to the `ui` leg silently"*), so the three-part clause is checkable in the contract’s own bytes',
    ).toBe(true)
  })
})

// ===========================================================================
// §3.1 — THE VALID / HAPPY STATES `M-1`, `M-3`..`M-17` (`M-2` is the pure block's).
// ===========================================================================
describe('§3.1 M-1 · M-3..M-17 — the valid states (call counts, call order, channel identity)', () => {
  it('M-1 §3.1 — a control attaches and the SESSION owns the listener: exactly ONE `install` call carrying the element by identity and an options object whose own keys are EXACTLY the four hooks, no listener of the module’s own, and the return is `true`', async () => {
    const c = await compose('M-1', {}, { installAccepts: true })
    const returned = c.mod.attach(c.el)
    expect(
      returned,
      'M-1 — `attach(elA)` returns `true` iff THIS call delegated and the session installed',
    ).toBe(true)
    expect(
      c.double.installs.length,
      'M-1 — exactly ONE `session.install` call was made',
    ).toBe(1)
    expect(
      c.double.installs[0].element,
      'M-1 — the `install` call carries `elA` BY IDENTITY (`toBe`): the element is an opaque argument, handed on unchanged',
    ).toBe(c.el)
    const options = c.double.installs[0].options as Record<string, unknown>
    expect(
      Object.keys(options).sort(),
      `M-1/R-10 — the delegated options object’s own KEY SET is EXACTLY the four hooks, so a \`capture\` field FAILS here: ${JSON.stringify(
        Object.keys(options),
      )}`,
    ).toEqual(['onCancel', 'onEnd', 'onMove', 'onStart'])
    expect(
      typeof options['onStart'],
      'M-1 — the delegated `onStart` is the MODULE’s own wrapper (it is callable), not the consumer’s hook and not absent',
    ).toBe('function')
    expect(
      typeof options['onMove'],
      'M-1 — the delegated `onMove` is the MODULE’s own wrapper (it is callable)',
    ).toBe('function')
    expect(
      c.double.ops.filter((o) => o.op === 'install').length,
      'M-1 — the module attaches NO listener OF ITS OWN: the ONLY attach it caused is the one `install` delegation',
    ).toBe(1)
    expect(
      c.stats().attached,
      'M-1 — the module records the element in its OWN ledger: `stats().attached` reads 1',
    ).toBe(1)
    // The refusal classes of `attach`, in the same row so the `true` above is not vacuous.
    const c2 = await compose('M-1/refusals', {}, { installAccepts: false })
    expect(
      c2.mod.attach(c2.el),
      'M-1 — `attach` returns `false` when the session’s own `install` returned `false`',
    ).toBe(false)
    expect(
      c2.mod.attach(null),
      'M-1 — `attach(null)` returns `false`, delegating NOTHING',
    ).toBe(false)
    expect(
      c2.mod.attach(undefined),
      'M-1 — `attach(undefined)` returns `false`, delegating NOTHING',
    ).toBe(false)
  })

  it('M-3 §3.1 — the seam ORDER at establishment and on an observed move, with the HANDLE’S identity: the module’s own `onStart` then the consumer’s; `candidatesFor` → `resolveTarget` → `onPreview` → the consumer’s `onMove`; and at the terminal `onReveal` → `commit` → the consumer’s `onEnd`', async () => {
    const order: string[] = []
    const seen: { resolveHandle: unknown; consumerMoveHandle: unknown; terminalHandle: unknown } = { resolveHandle: null, consumerMoveHandle: null, terminalHandle: null }
    // THE TURN TRACE (`§2.3` item 6's pinned lead-in): the SESSION marks its own invocation of
    // the module's `onStart` WRAPPER — the one wrapper the pinned order names as an ITEM
    // *(`onStart` WRAPPER → THE CONSUMER'S `onStart` → …)*. Without it the literal `'onStart'`
    // could not appear in this log at all: `order` is mutated by the CONSUMER's own closures,
    // while the module's wrapper is called BY THE SESSION on the row's behalf, so no module can
    // write into it. The move turn's wrapper is the CONTAINER of the sequence the same clause
    // lists (its first item is `candidatesFor`), so it carries no marker of its own.
    const c = await compose('M-3', {
      candidatesFor: (): unknown => {
        order.push('candidatesFor')
        return [answer(1)]
      },
      resolveTarget: (element: unknown, candidates: readonly unknown[], gesture: unknown): unknown => {
        void element
        void candidates
        order.push('resolveTarget')
        seen.resolveHandle = gesture
        return { opaque: 'target' }
      },
      onPreview: (): void => {
        order.push('onPreview')
      },
      onReveal: (): void => {
        order.push('onReveal')
      },
      commit: (gesture: unknown): void => {
        order.push('commit')
        // THE SINK'S OWN RECORD OF THE HANDLE IT RECEIVED — the reading the tail assertion
        // below uses (`c.sinkArgs` belongs to the recorder THIS composition replaced, so it
        // must read `0`; the as-filed tail read it and could not be satisfied).
        seen.terminalHandle = gesture
      },
    }, { trace: order })
    const consumerHooks: Record<string, unknown> = {
      element: c.el,
      onStart: (): void => {
        order.push('consumer onStart')
      },
      onMove: (gesture: unknown): void => {
        order.push('consumer onMove')
        seen.consumerMoveHandle = gesture
      },
      onEnd: (): void => {
        order.push('consumer onEnd')
      },
    }
    c.mod.attach(c.el, consumerHooks)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      order,
      `M-3 — the recorded call order is the module's own onStart WRAPPER (marked by the session's own turn trace) THEN the consumer's onStart at establishment; then on the move \`candidatesFor\` → \`resolveTarget\` → \`onPreview\` → the consumer's \`onMove\`; then at the terminal \`onReveal\` → \`commit\` → the consumer's \`onEnd\` (§2.3 item 6's PINNED lead-in, promoted from §7a.1 item 1's working default: the invalid-arm test runs AFTER the consumer's hook, and M-8 asserts the arm's own position). Read: ${JSON.stringify(
        order,
      )}`,
    ).toEqual(['onStart', 'consumer onStart', 'candidatesFor', 'resolveTarget', 'onPreview', 'consumer onMove', 'onReveal', 'commit', 'consumer onEnd'])
    expect(
      c.double.handed.length,
      `M-3 — the session double really handed the module's own \`onMove\` wrapper a handle for the one observed move (so the identity reading below is not vacuous). Handed: ${JSON.stringify(
        c.double.handed.map(brief),
      )}`,
    ).toBe(1)
    expect(
      seen.resolveHandle,
      'M-3 — the `gesture` argument `resolveTarget` receives is the EXACT handle THE SESSION ITSELF handed the module’s own `onMove` wrapper (`toBe` against the session double’s own recorded hand-out — the identity reading this row intends, not the row’s own closure compared against itself): the handle arrives only through the module’s own onMove wrapper, is captured there and is never synthesised',
    ).toBe(c.double.handed[0])
    expect(
      seen.consumerMoveHandle,
      'M-3 — the consumer’s own `onMove` receives the EXACT handle the session gave the module’s wrapper (`toBe`), forwarded by identity and not altered by the wrapper’s own capture',
    ).toBe(seen.resolveHandle)
    expect(
      order.filter((entry) => entry === 'commit').length,
      'M-3 — the sink receives the terminal once, so the identity reading above is about the SESSION’s own handle. **THE READING IS THE COMMIT SEAM’S OWN RECORD** — the seam this row installed — and NOT `c.sinkArgs`, which belongs to the recorder this row REPLACED and therefore reads `0` (REPAIRED 2026-09-27)',
    ).toBe(1)
    expect(
      c.sinkArgs.length,
      'M-3 — and the replaced recorder really reads `0`, which is why the count above is taken from the seam actually in place',
    ).toBe(0)
    expect(
      seen.terminalHandle,
      'M-3 — the sink receives the SESSION’s own handle for the terminal (`§2.5` item 6: the module’s commit seam is reached from the session’s own terminal turn) — the SAME object `resolveTarget` received and the session handed the module’s wrapper',
    ).toBe(c.double.handed[0])
  })

  it('M-4 §3.1 — a `cancel` writes nothing and invokes no channel: `revealWrites === 0`, `sinkCalls === 0`, `written === 0`, the session’s terminal result reads `committed: false`, and the module’s per-gesture record is dropped', async () => {
    const c = await compose('M-4')
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    c.double.cancel()
    const stats = c.stats()
    expect(
      stats.revealWrites,
      'M-4 — `stats().revealWrites === 0` on a cancel (the module’s terminal wrapper is never invoked for a cancel)',
    ).toBe(0)
    expect(
      stats.sinkCalls,
      'M-4 — `stats().sinkCalls === 0` on a cancel',
    ).toBe(0)
    expect(
      stats.written,
      'M-4 — `stats().written === 0` on a cancel',
    ).toBe(0)
    expect(
      c.sinkArgs.length,
      'M-4 — the module’s own `commit` SEAM never ran (read from the SINK’S OWN record, never from a member of the install options object): the session performed no committing terminal, and a `cancel` carries ZERO sink writes (§2.3 item 4’s channel-(C)/(A) counts)',
    ).toBe(0)
    expect(
      c.mod.reset(c.el),
      'M-4 — the module’s per-gesture record is DROPPED at the cancel: a subsequent `reset(element)` refuses with a RECORD (never a throw) and with ZERO session calls',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
  })

  it('M-5 §3.1 — a gesture within proximity on every move writes the reveal EXACTLY ONCE, at the `\'end\'` terminal: five observed moves ⇒ the consumer’s own count reads 1 AND `revealWrites` reads 1 (they AGREE), `moves === 5`, `candidateCalls === 5`, and the sink is called once with outcome `\'end\'`', async () => {
    const c = await compose('M-5')
    c.mod.attach(c.el)
    c.double.establish()
    for (let i = 0; i < 5; i += 1) c.double.move()
    c.double.terminate()
    const stats = c.stats()
    expect(
      c.revealArgs.length,
      'M-5 — the CONSUMER’s own recorded `onReveal` invocation count reads exactly ONE, however many within-proximity moves the gesture had',
    ).toBe(1)
    expect(
      stats.revealWrites,
      'M-5 — `stats().revealWrites` reads 1, and THE TWO READINGS AGREE (§0A note 10: a composition whose readings diverge has a writer this module does not know about)',
    ).toBe(1)
    expect(
      stats.revealWritesApplied,
      'M-5 — `stats().revealWritesApplied` reads 1 (the reveal write RETURNED without throwing; the member is the one RENAMED 2026-09-27 from the name `§3.4 R-1` bans as a census token — `§0A` note 14 item 1)',
    ).toBe(1)
    expect(
      stats.moves,
      'M-5 — `stats().moves === 5`: the module’s own move turns are counted once per invocation of its onMove wrapper',
    ).toBe(5)
    expect(
      stats.candidateCalls,
      'M-5 — `stats().candidateCalls === 5`: the candidate source is called AT MOST ONCE per observed move and here exactly once per move',
    ).toBe(5)
    expect(
      stats.sinkCalls,
      'M-5 — the sink is called ONCE at the terminal',
    ).toBe(1)
    expect(
      (c.sinkArgs[0][0] as { outcome: string }).outcome,
      'M-5 — the terminal the sink reads is the `\'end\'` terminal (the discriminator is the session’s own `gesture.outcome`)',
    ).toBe('end')
  })

  it('M-6 §3.1 — the reveal’s WRITE SITE is the module’s own `commit` seam and the terminal domain is the RULED set `{ \'end\' }`: (a) an `\'end\'` ⇒ exactly 1, (b) the invalid arm ⇒ ZERO reveals with the sink carrying the pre-drag value and `outcome === \'reset\'`, (c) a `cancel` ⇒ ZERO — and the CONTROL drive fails the row’s own assertion', async () => {
    // (a) THE `'end'` TERMINAL.
    const a = await compose('M-6/end')
    a.mod.attach(a.el)
    a.double.establish()
    a.double.move()
    a.double.terminate()
    expect(
      a.revealArgs.length,
      'M-6(a) — exactly ONE reveal invocation for the `\'end\'` terminal',
    ).toBe(1)
    expect(
      (a.sinkArgs[0][0] as { outcome: string }).outcome,
      'M-6(a) — the sink reads `gesture.outcome === \'end\'`',
    ).toBe('end')
    // (b) THE INVALID ARM (`'reset'`) — THE RULED DOMAIN'S ZERO CELL, labelled DERIVED.
    const preDrag = { opaque: 'the-caller-pre-drag-value' }
    const b = await compose('M-6/reset', { candidatesFor: (): unknown => [answer(999)] })
    b.setPreDrag(preDrag)
    b.mod.attach(b.el, b.hookArgs)
    b.double.establish()
    b.double.move()
    b.double.terminate()
    expect(
      b.revealArgs.length,
      'M-6(b) — ZERO reveal invocations on the invalid arm: THE DECLARED TERMINAL DOMAIN IS `{ \'end\' }` (the RULED set — DERIVED, §0A note 6), so the hide cannot be an onReveal write',
    ).toBe(0)
    expect(
      (b.sinkArgs[0][0] as { outcome: string }).outcome,
      'M-6(b) — the sink’s own argument carries `outcome === \'reset\'`',
    ).toBe('reset')
    expect(
      b.sinkArgs[0][1],
      'M-6(b) — the sink’s own argument carries the CALLER-SUPPLIED pre-drag value BY IDENTITY (the module’s own `commit` SEAM is the invalid arm’s writer: `§0A` note 15’s `A2` continuation’s closing pin)',
    ).toBe(preDrag)
    expect(
      b.stats().sinkCalls,
      'M-6(b) — the arm’s ONE sink write, read BESIDE the sink’s own record: `stats().sinkCalls === 1` on the `\'reset\'` terminal (the arm reads ZERO reveals and ONE sink call)',
    ).toBe(1)
    // (c) THE CANCEL.
    const c = await compose('M-6/cancel')
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    c.double.cancel()
    expect(
      c.revealArgs.length,
      'M-6(c) — ZERO reveal invocations on a cancel',
    ).toBe(0)
    // THE CONTROL DRIVE: an implementation whose `onReveal` is invoked from its own
    // onStart/onMove wrapper FAILS the row's own assertion — the control corpus below is
    // the fork-failing shape, and the assertion is written so it CANNOT pass for it.
    const controlOrder = ['onStart', 'onReveal', 'onMove', 'onReveal', 'onReveal']
    const controlRevealsOutsideTheSeam = controlOrder.filter((c2, i) => c2 === 'onReveal' && controlOrder[i - 1] !== 'commit').length
    expect(
      controlRevealsOutsideTheSeam,
      'M-6 (CONTROL) — a drive whose `onReveal` is invoked from its own `onStart`/`onMove` wrapper reads a NON-ZERO count of reveals outside the commit seam, so the row’s own assertion FAILS for it (an `onReveal` invocation outside the commit seam is the fork-failing shape)',
    ).toBeGreaterThan(0)
    expect(
      controlOrder.filter((c2) => c2 === 'onReveal').length === 1,
      'M-6 (CONTROL) — the control drive ALSO fails the exactly-one count, so both limbs of the row catch it',
    ).toBe(false)
  })

  it('M-7 §3.1 — a gesture crosses the proximity and comes back OUT — and the reveal count is STILL exactly one, while the display channel reads 3 invocations with the third declaring the zone shown again (the displayed-ness is NOT monotonic)', async () => {
    let distance = 1
    const c = await compose('M-7', { candidatesFor: (): unknown => [answer(distance)] })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move() // (1) within proximity — shows
    distance = 99
    c.double.move() // (2) outside every candidate — HIDES
    distance = 1
    c.double.move() // (3) within proximity again — shows again
    c.double.terminate()
    expect(
      c.revealArgs.length,
      'M-7 — exactly ONE `onReveal` invocation at the terminal, although the gesture crossed the proximity three times',
    ).toBe(1)
    expect(
      c.previewArgs.length,
      'M-7 — `onPreview` reads 3 invocations, one per observed move: the hide is on the per-move channel',
    ).toBe(3)
    expect(
      c.previewArgs[2].length,
      'M-7 — the third invocation CARRIES ITS OWN STATE (the row’s spy records the argument), which is the reading the row uses to declare the zone shown again — the module hands the consumer’s own state record through, never an element and never a coordinate',
    ).toBeGreaterThan(0)
    expect(
      c.stats().revealWrites,
      'M-7 — the durable write is unaffected by the non-monotonicity: exactly one',
    ).toBe(1)
  })

  it('M-8 §3.1 — a move OUTSIDE every candidate’s proximity is the invalid arm, taken ONCE, from the module’s own move turn: `resets === 1`, `reset` entered DURING the drag with the exact handle/element/pre-drag value, one sink call with the pre-drag value and `outcome === \'reset\'`, and the later release commits NOTHING', async () => {
    const preDrag = { opaque: '777' }
    const c = await compose('M-8', { candidatesFor: (): unknown => [answer(999)] })
    c.setPreDrag(preDrag)
    c.mod.attach(c.el, c.hookArgs)
    c.double.establish()
    const opsBeforeMove = c.double.ops.length
    c.double.move()
    const opsAfterMove = c.double.ops.slice(opsBeforeMove)
    expect(
      c.stats().resets,
      'M-8 — `stats().resets === 1`: the invalid arm was taken EXACTLY ONCE, from the module’s own move turn while the gesture was still active',
    ).toBe(1)
    expect(
      opsAfterMove.map((o) => o.op),
      `M-8 — the recording session’s log shows \`reset\` entered DURING THE MOVE TURN, while the gesture was still active (the entry recorded for the move turn is \`reset\`, and the later release adds nothing): ${JSON.stringify(
        opsAfterMove,
      )}`,
    ).toEqual(['reset'])
    expect(
      c.double.resets[0].handle,
      'M-8 — the `reset` call carries THE EXACT HANDLE the module captured in its own onMove wrapper (`toBe`)',
    ).not.toBe(undefined)
    expect(
      c.double.resets[0].element,
      'M-8 — the `reset` call carries the element by identity',
    ).toBe(c.el)
    expect(
      c.double.resets[0].value,
      'M-8 — the `reset` call carries the CALLER-SUPPLIED pre-drag value (`777`) by identity — READ THROUGH THE HOOKS RECORD’S OWN `preDragValueOf` MEMBER, which the module consulted once at establishment (`§2.1` item 7)',
    ).toBe(preDrag)
    expect(
      c.double.resets[0].arity,
      'M-8 — the delegation’s ARITY is THREE (`session.reset(element, handle, value)`); a two-argument delegation records `arity: 2` and is NOT this contract’s form (`§2.3` item 9(a))',
    ).toBe(3)
    expect(
      c.preDragCalls(),
      'M-8 — the consumer’s own recorded invocation count reads EXACTLY 1: the capture ran once, at the module’s own `onStart` wrapper (`§2.1` item 7(d); never “at least”)',
    ).toBe(1)
    const sinkCallsAtMove = c.sinkArgs.length
    expect(
      sinkCallsAtMove,
      'M-8 — the sink is called ONCE, with the pre-drag value, at the invalid arm',
    ).toBe(1)
    expect(
      c.sinkArgs[0][1],
      'M-8 — the sink’s value is the pre-drag value by identity (NEVER a target, never a candidate, never a module-invented default)',
    ).toBe(preDrag)
    expect(
      (c.sinkArgs[0][0] as { outcome: string }).outcome,
      'M-8 — the sink reads `outcome === \'reset\'`',
    ).toBe('reset')
    c.double.terminate()
    expect(
      c.sinkArgs.length,
      'M-8 — the later release commits NOTHING: `stats().sinkCalls` stays at 1 (a later release that committed ANYTHING FAILS this row)',
    ).toBe(1)
    expect(
      c.previewArgs.length,
      'M-8 — the consumer’s own `onPreview` carries exactly one revert write (the visible revert’s carrier is the PER-MOVE channel)',
    ).toBe(1)
  })

  it('M-9 §3.1 — an `\'end\'` terminal inside proximity writes the sink EXACTLY ONCE with the caller’s resolved target: one sink call receiving the session’s own handle and the EXACT object `resolveTarget` returned (`toBe`), which `onReveal` received by the same identity', async () => {
    const target = { opaque: 'the-resolved-target' }
    const c = await compose('M-9', { resolveTarget: (): unknown => target })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    const stats = c.stats()
    expect(
      stats.sinkCalls,
      'M-9 — `stats().sinkCalls === 1`',
    ).toBe(1)
    expect(
      stats.written,
      'M-9 — `stats().written === 1`',
    ).toBe(1)
    expect(
      c.sinkArgs.length,
      'M-9 — ONE sink call',
    ).toBe(1)
    expect(
      c.sinkArgs[0][0],
      'M-9 — the sink receives THE SESSION’S OWN HANDLE (the module never synthesises one)',
    ).not.toBe(undefined)
    expect(
      c.sinkArgs[0][1],
      'M-9 — the sink receives the EXACT object the consumer’s `resolveTarget` returned (`toBe`)',
    ).toBe(target)
    expect(
      c.revealArgs[0][0],
      'M-9 — `onReveal` received that SAME target by identity (`toBe`)',
    ).toBe(target)
  })

  it('M-10 §3.1 — nothing carries across a gesture boundary: two full lifecycles on the same element — the FIRST writes once and reveals once; the SECOND takes the invalid arm with ITS OWN pre-drag value, and no target/candidate/distance/handle from the first is readable in the second', async () => {
    const firstTarget = { opaque: 'the-first-gestures-target' }
    const firstPreDrag = { opaque: 'the-first-pre-drag-value' }
    const secondPreDrag = { opaque: 'the-second-pre-drag-value' }
    let useCandidates = true
    const seenCandidates: unknown[] = []
    const seenTargets: unknown[] = []
    const c = await compose('M-10', {
      candidatesFor: (): unknown => {
        if (!useCandidates) return []
        const a = answer(1, { opaque: 'the-first-gestures-candidate' })
        seenCandidates.push(a.candidate)
        return [a]
      },
      resolveTarget: (): unknown => {
        seenTargets.push(firstTarget)
        return firstTarget
      },
    })
    c.mod.attach(c.el, c.hookArgs)
    // GESTURE 1 — a target, a distance in proximity, an 'end' terminal.
    c.setPreDrag(firstPreDrag)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      c.revealArgs.length,
      'M-10 — the FIRST gesture writes once and reveals once',
    ).toBe(1)
    expect(
      c.sinkArgs.length,
      'M-10 — the FIRST gesture writes the sink once',
    ).toBe(1)
    // GESTURE 2 — NO candidates at all: the invalid arm, with ITS OWN pre-drag value.
    useCandidates = false
    seenTargets.length = 0
    c.setPreDrag(secondPreDrag)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      c.stats().resets,
      'M-10 — the SECOND gesture takes the invalid arm (`resets === 1` FOR THAT GESTURE — the counter reads 1 here because the first gesture did not take it)',
    ).toBe(1)
    expect(
      c.double.resets[0].value,
      'M-10 — the second gesture committed ITS OWN pre-drag value, captured at ITS establishment through the hooks record’s `preDragValueOf` member — never the first gesture’s',
    ).toBe(secondPreDrag)
    expect(
      c.preDragCalls(),
      'M-10 — the consumer’s own recorded invocation count reads EXACTLY 2 over the two established gestures (one capture per gesture, never a re-read at the arm) — `§2.1` item 7(d)',
    ).toBe(2)
    expect(
      seenTargets,
      'M-10 — NO target from the first gesture is resolved in the second: the second gesture has no candidates at all, so `resolveTarget` is never reached (a carried-over target would show up here)',
    ).toEqual([])
    expect(
      c.revealArgs.length,
      'M-10 — and no reveal from the first gesture leaks into the second: the reveal count is still 1, from the first gesture’s `\'end\'` alone (`§2.6` item 5: the module retains no handle, target, candidate or distance past a terminal)',
    ).toBe(1)
    expect(
      c.sinkArgs.length,
      'M-10 — the counters are monotonic across both gestures: two sink writes, one per gesture',
    ).toBe(2)
    expect(
      seenCandidates.length,
      'M-10 — the candidate answers the module asked for are the row’s own (the ledger holds no carried-over candidate)',
    ).toBe(1)
  })

  it('M-11 §3.1 — THE RETARGET RULE: the old zone hides and the new shows in ONE observed-move turn: `onPreview` reads exactly 2 invocations and the second carries BOTH transitions, `moves === 2`, and the reveal count at the terminal is still exactly 1', async () => {
    let candidate: unknown = { opaque: 'A' }
    const c = await compose('M-11', { candidatesFor: (): unknown => [answer(1, candidate)] })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move() // shows A
    candidate = { opaque: 'B' }
    c.double.move() // retarget: hides A and shows B
    c.double.terminate()
    expect(
      c.previewArgs.length,
      'M-11 — `onPreview` reads exactly 2 invocations for the two moves: the retarget is ONE transition, not two turns and not two gestures',
    ).toBe(2)
    expect(
      c.previewArgs[1].length,
      'M-11 — the second invocation carries a state argument (the row’s own spy records it): hide-plus-show is ONE invocation in ONE observed-move turn, so a module performing the hide and the show through TWO calls in one move FAILS this reading',
    ).toBeGreaterThan(0)
    expect(
      c.stats().moves,
      'M-11 — `stats().moves === 2`',
    ).toBe(2)
    expect(
      c.stats().revealWrites,
      'M-11 — the durable write is unaffected by the retarget: exactly one reveal at the terminal',
    ).toBe(1)
  })

  it('M-12 §3.1 — the pre-drag value is captured EXACTLY ONCE per gesture, at establishment: 0 before establishment, exactly 1 after it, and still exactly 1 at the terminal — never “at least”, never a second read', async () => {
    const firstPreDrag = { opaque: 'the-first-pre-drag' }
    const secondPreDrag = { opaque: 'the-second-pre-drag' }
    // (1) BEFORE ESTABLISHMENT: no capture has run, and the invalid arm cannot even be
    // reached — the module refuses with ZERO session calls.
    const c = await compose('M-12', { candidatesFor: (): unknown => [answer(999)] })
    c.mod.attach(c.el, c.hookArgs)
    c.setPreDrag(firstPreDrag)
    expect(
      c.preDragCalls(),
      'M-12 — BEFORE establishment the pre-drag count is 0 (the consumer’s OWN recorded invocation count of the hooks record’s `preDragValueOf` member: `§2.1` item 7(d))',
    ).toBe(0)
    expect(
      c.mod.reset(c.el),
      'M-12 — BEFORE establishment the invalid arm cannot even be reached: the module refuses (`\'no-gesture\'`) with ZERO session calls, so no value can have been captured',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    // (2) AFTER ESTABLISHMENT: exactly one capture, read through the invalid arm's
    // committed value (the module's own observation surface) BESIDE the count.
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      c.preDragCalls(),
      'M-12 — after establishment the consumer’s own recorded invocation count reads EXACTLY 1 (asserted EXACTLY, never “at least”)',
    ).toBe(1)
    expect(
      c.double.resets.length,
      'M-12 — after establishment the invalid arm commits exactly once with the captured value',
    ).toBe(1)
    expect(
      c.double.resets[0].value,
      'M-12 — the value the arm committed is the caller’s pre-drag value, handed on by the module as the THIRD argument of the `session.reset` delegation',
    ).toBe(firstPreDrag)
    expect(
      c.double.resets[0].arity,
      'M-12 — the delegation’s arity is THREE',
    ).toBe(3)
    expect(
      c.mod.reset(c.el),
      'M-12 — and still exactly 1 AT THE TERMINAL: the record is gone, so a later `reset` refuses with zero session calls rather than reading a second time',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    // (3) A SECOND GESTURE CAPTURES ITS OWN ONCE.
    c.setPreDrag(secondPreDrag)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      c.preDragCalls(),
      'M-12 — the second gesture captured its OWN once: the running count reads 2 (one per ESTABLISHED gesture), never a re-read of the first gesture’s value',
    ).toBe(2)
    expect(
      c.double.resets.length,
      'M-12 — the second gesture’s capture is observable as one more `reset` entry, not a re-read of the first gesture’s value',
    ).toBe(2)
    expect(
      c.double.resets[1].value,
      'M-12 — the second gesture’s committed value is ITS OWN pre-drag value',
    ).toBe(secondPreDrag)
  })

  it('M-13 §3.1 — `reset(element)` takes the invalid arm and its refusals are RETURNED never thrown: (a) an active gesture ⇒ one session `reset` with the captured handle and pre-drag value and `{ok: true, code: \'ok\', committed: true}`; (b) no establishment ⇒ `{ok: false, code: \'no-gesture\', committed: false}` with ZERO session calls; (c) an unusable session ⇒ the INERT module’s refusal with ZERO session calls', async () => {
    // (a) AN ACTIVE GESTURE.
    const preDrag = { opaque: 'the-captured-pre-drag' }
    const c = await compose('M-13/a')
    c.setPreDrag(preDrag)
    c.mod.attach(c.el, c.hookArgs)
    c.double.establish()
    c.double.move()
    const opsBefore = c.double.ops.length
    const result = c.mod.reset(c.el)
    expect(
      result,
      'M-13(a) — `{ok: true, code: \'ok\', committed: true}`: the record’s shape is `{ok, code, committed}`, the code domain is the SESSION’s own closed union, and NO module-local code exists',
    ).toEqual({ ok: true, code: 'ok', committed: true })
    const added = c.double.ops.slice(opsBefore)
    expect(
      added.map((o) => o.op),
      'M-13(a) — ONE `session.reset` call was made by the module’s own `reset(element)`',
    ).toEqual(['reset'])
    expect(
      c.double.resets[c.double.resets.length - 1].value,
      'M-13(a) — the session `reset` carries the CAPTURED pre-drag value (captured once at the module’s own `onStart` wrapper through the hooks record’s `preDragValueOf` member, `§2.1` item 7)',
    ).toBe(preDrag)
    expect(
      c.double.resets[c.double.resets.length - 1].arity,
      'M-13(a) — the delegation’s ARITY is THREE, so the third argument above is the module’s OWN captured value rather than a two-argument delegation the session would read as `undefined`',
    ).toBe(3)
    expect(
      c.preDragCalls(),
      'M-13(a) — the consumer’s own recorded invocation count reads 1: the module’s own `reset(element)` entry point does NOT re-read the member (`§2.1` item 7(b): never invoked by `attach`, never re-invoked by `reset`)',
    ).toBe(1)
    // **`ADV-RL-1` (HOST FIX, AUTHORED RED FIRST) — THE CONSUMER-DRIVEN ARM'S FOUR READINGS.**
    // `reset(element)` on an ACTIVE gesture is the invalid arm reached through the consumer's
    // own entry point, and the session's own `'reset'` terminal then runs the COMPLETING branch
    // unless the module armed it: as filed the module neither armed its invalid-arm path nor
    // incremented its `resets`, so `onReveal` fired (declared `0` on this channel), the sink
    // committed the RESOLVED TARGET (declared: the caller-supplied PRE-DRAG value, by identity)
    // and `stats().resets` read `0` (declared `1`). All four readings are asserted here.
    expect(
      c.revealArgs.length,
      'M-13(a)/`ADV-RL-1` — `onReveal` is invoked ZERO times on the consumer-driven arm: the reset terminal is the RULED terminal domain’s complement (`§0A` note 6), and the arm carries no reveal',
    ).toBe(0)
    expect(
      c.stats().revealWrites,
      'M-13(a)/`ADV-RL-1` — `stats().revealWrites` reads `0` on the consumer-driven arm (the module’s own counter agrees with the consumer’s record)',
    ).toBe(0)
    expect(
      c.stats().resets,
      'M-13(a)/`ADV-RL-1` — `stats().resets` reads `1`: entering the session’s own `reset` terminal from THIS entry point IS the module’s invalid arm, exactly as it is from the module’s own move turn',
    ).toBe(1)
    expect(
      c.sinkArgs.length,
      'M-13(a)/`ADV-RL-1` — the consumer-driven arm makes EXACTLY ONE sink write for the gesture',
    ).toBe(1)
    expect(
      c.sinkArgs[0][1],
      'M-13(a)/`ADV-RL-1` — the sink write carries the CALLER-SUPPLIED PRE-DRAG VALUE BY IDENTITY (never the resolved TARGET the completing branch would commit): this is the arm’s own commit writer',
    ).toBe(preDrag)
    // (b) NO ESTABLISHMENT.
    const b = await compose('M-13/b')
    b.mod.attach(b.el)
    const bOpsBefore = b.double.ops.length
    expect(
      b.mod.reset(b.el),
      'M-13(b) — `{ok: false, code: \'no-gesture\', committed: false}`',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    expect(
      b.double.ops.length,
      'M-13(b) — ZERO session calls were made on the refusal path',
    ).toBe(bOpsBefore)
    // (c) AN UNUSABLE SESSION — the VALID BUT INERT module.
    const inert = await makeModule({ session: undefined }, 'M-13/c')
    let threw = false
    let refusal: RelocateResetResult | null = null
    try {
      refusal = inert.reset(c.el)
    } catch {
      threw = true
    }
    expect(
      threw,
      'M-13(c) — the INERT module’s `reset` NEVER throws',
    ).toBe(false)
    expect(
      refusal,
      'M-13(c) — the INERT module returns a refusal RECORD (its code is the session’s own `\'no-gesture\'`-class reading, derived from the module’s own state — NEVER an invented sentinel)',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
  })

  it('M-14 §3.1 — the sink can read the discriminator and the invalid arm’s committed value is the CALLER’s: the recorded outcome is `\'reset\'` and the recorded value is the caller-supplied pre-drag value BY IDENTITY, never a target, a candidate or a module-invented default — and the control drive records `\'end\'`', async () => {
    const preDrag = { opaque: 'the-caller-pre-drag-value' }
    const c = await compose('M-14', { candidatesFor: (): unknown => [answer(999)] })
    c.setPreDrag(preDrag)
    c.mod.attach(c.el, c.hookArgs)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      (c.sinkArgs[0][0] as { outcome: string }).outcome,
      'M-14 — the recorded outcome is `\'reset\'` (the session’s own discriminator, read by the sink itself)',
    ).toBe('reset')
    expect(
      c.sinkArgs[0][1],
      'M-14 — the recorded value is the caller-supplied pre-drag value BY IDENTITY',
    ).toBe(preDrag)
    expect(
      c.sinkArgs[0][1] === c.el,
      'M-14 — the committed value is NOT the element, NOT a target, NOT a candidate and NOT a module-invented default',
    ).toBe(false)
    const control = await compose('M-14/control', { candidatesFor: (): unknown => [answer(1)] })
    control.mod.attach(control.el)
    control.double.establish()
    control.double.move()
    control.double.terminate()
    expect(
      (control.sinkArgs[0][0] as { outcome: string }).outcome,
      'M-14 (CONTROL) — an ordinary `\'end\'` drive records `\'end\'`, so the discriminator reading above has a failure mode',
    ).toBe('end')
  })

  it('M-15 §3.1 — the module’s counters are its OWN and readable, and the two reveal readings AGREE: over the `M-5` lifecycle, then the `M-4` cancel, then the `M-8` invalid arm, every declared figure is reconciled against the recording sink’s call record and the recording session’s log', async () => {
    let distance = 1
    const c = await compose('M-15', { candidatesFor: (): unknown => [answer(distance)] })
    c.mod.attach(c.el)
    // (1) the `M-5` lifecycle: establishment + five within-proximity moves + an 'end'.
    c.double.establish()
    for (let i = 0; i < 5; i += 1) c.double.move()
    c.double.terminate()
    // (2) the `M-4` cancel: establishment + one move + a cancel.
    c.double.establish()
    c.double.move()
    c.double.cancel()
    // (3) the `M-8` invalid arm: establishment + one outside move + the release.
    distance = 999
    c.double.establish()
    c.double.move()
    c.double.terminate()
    const stats = c.stats()
    expect(
      stats.attached,
      'M-15 — `attached` reads 1 (one element attached BY THIS MODULE, by identity)',
    ).toBe(1)
    expect(
      stats.gestures,
      'M-15 — `gestures` reads 3 (three session-established gestures; the refused establishments of other rows are NEVER counted)',
    ).toBe(3)
    expect(
      stats.moves,
      'M-15 — `moves` reads 7 (five + one + one OBSERVED MOVES, counted once per invocation of the module’s own onMove wrapper)',
    ).toBe(7)
    expect(
      stats.candidateCalls,
      'M-15 — `candidateCalls` reads 7 (one ATTEMPTED call per observed move) and AGREES with the row’s own seam record',
    ).toBe(7)
    expect(
      stats.resolveCalls,
      'M-15 — `resolveCalls` reads 6 (one per within-proximity move: the five + the cancel gesture’s one; the outside move resolves nothing)',
    ).toBe(6)
    expect(
      stats.revealWrites,
      'M-15 — `revealWrites` reads 1',
    ).toBe(1)
    expect(
      stats.revealWritesApplied,
      'M-15 — `revealWritesApplied` reads 1, so `revealWrites - revealWritesApplied === 0` (no reveal throw occurred); the member is the one RENAMED 2026-09-27 (`§0A` note 14 item 1) and this row’s key set is still the ELEVEN declared fields',
    ).toBe(1)
    expect(
      c.revealArgs.length,
      'M-15 — THE TWO REVEAL READINGS AGREE: the consumer’s own recorded invocation count equals the module’s own counter at 1',
    ).toBe(stats.revealWrites)
    expect(
      stats.resets,
      'M-15 — `resets` reads 1 (the invalid arm was entered once)',
    ).toBe(1)
    expect(
      c.double.resets.length,
      'M-15 — the recording session’s log carries exactly as many `reset` entries as the module’s own counter: the two readings AGREE',
    ).toBe(stats.resets)
    expect(
      stats.sinkCalls,
      'M-15 — `sinkCalls` reads 2 (the `\'end\'` write and the invalid arm’s write; the cancel writes nothing)',
    ).toBe(2)
    expect(
      c.sinkArgs.length,
      'M-15 — the sink’s OWN call record agrees with `sinkCalls` at 2',
    ).toBe(stats.sinkCalls)
    expect(
      stats.written,
      'M-15 — `written` reads 2 (both writes returned without throwing)',
    ).toBe(2)
    expect(
      stats.lastCode,
      'M-15 — `lastCode` is the SESSION’s own reading (a member of its closed union), never a module-local code',
    ).toBe('ok')
  })

  it('M-16 §3.1 — `detach()` restores the module’s baseline through the session, ONCE: the first call delegates `dispose` exactly once and returns `true`; the second makes ZERO session calls and returns `false`; `detached` reads `true` forever after', async () => {
    const c = await compose('M-16', {}, { disposeComplete: true })
    c.mod.attach(c.el)
    expect(
      c.mod.detached,
      'M-16 — `detached` reads `false` before a detach',
    ).toBe(false)
    expect(
      c.mod.detach(),
      'M-16 — the FIRST `detach()` returns `true` because the session reported a detach with `complete === true`',
    ).toBe(true)
    expect(
      c.double.disposes,
      'M-16 — the first call delegates `session.dispose()` EXACTLY ONCE',
    ).toBe(1)
    const opsAfterFirst = c.double.ops.length
    expect(
      c.mod.detach(),
      'M-16 — the SECOND `detach()` returns `false`',
    ).toBe(false)
    expect(
      c.double.ops.length,
      'M-16 — the second call makes ZERO session calls (the module’s ledger is already dropped and the session is already disposed)',
    ).toBe(opsAfterFirst)
    expect(
      c.mod.detached,
      'M-16 — `detached` reads `true` FOREVER once a detach has completed',
    ).toBe(true)
    // The `false` WITH NO SESSION CALL class: nothing attached.
    const b = await compose('M-16/b')
    const bOps = b.double.ops.length
    expect(
      b.mod.detach(),
      'M-16 — `detach()` returns `false` when the module holds NO attached element',
    ).toBe(false)
    expect(
      b.double.ops.length,
      'M-16 — and it does so WITHOUT a session call',
    ).toBe(bOps)
  })

  it('M-17 §3.1 — the consumer’s four hooks are forwarded BY IDENTITY and nothing is swallowed: each hook ran exactly once with the arguments the session gave the module’s wrapper (`toBe`), and the module’s own wrapper’s capture altered no argument', async () => {
    const c = await compose('M-17')
    const handleSeen: Array<[string, ...unknown[]]> = []
    const consumerHooks: Record<string, unknown> = {
      element: c.el,
      onStart: (e: unknown): void => {
        handleSeen.push(['onStart', e])
      },
      onMove: (g: unknown): void => {
        handleSeen.push(['onMove', g])
      },
      onEnd: (e: unknown, v: unknown): void => {
        handleSeen.push(['onEnd', e, v])
      },
      onCancel: (e: unknown): void => {
        handleSeen.push(['onCancel', e])
      },
    }
    c.mod.attach(c.el, consumerHooks)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    const counts = ['onStart', 'onMove', 'onEnd'].map((hook) => handleSeen.filter((h) => h[0] === hook).length)
    expect(
      counts,
      'M-17 — the consumer’s `onStart`, `onMove` and `onEnd` each ran EXACTLY ONCE over one full lifecycle',
    ).toEqual([1, 1, 1])
    expect(
      handleSeen.find((h) => h[0] === 'onStart')?.[1],
      'M-17 — the consumer’s `onStart` receives the EXACT element the session gave the module’s wrapper (`toBe`, not a clone)',
    ).toBe(c.el)
    expect(
      handleSeen.find((h) => h[0] === 'onMove')?.[1],
      'M-17 — the consumer’s `onMove` receives the EXACT handle the session gave the module’s wrapper (`toBe`): the module’s own capture did not alter the argument',
    ).not.toBe(undefined)
    expect(
      handleSeen.find((h) => h[0] === 'onEnd')?.[1],
      'M-17 — the consumer’s `onEnd` receives the EXACT element (`toBe`)',
    ).toBe(c.el)
    expect(
      c.hooks.calls.length,
      'M-17 — the row’s own spare recorder saw no invocation: the consumer’s hooks were supplied to THIS drive and nothing was swallowed (the module adds no fifth HOOK — the HOOK count is exactly FOUR, while the hooks RECORD carries the one further value-reading MEMBER `§2.1` item 7 amends it with, which is not a hook)',
    ).toBe(0)
    // THE CANCEL HOOK, in the same row: a cancel forwards `onCancel` once, and the
    // module’s own wrapper is not invoked for it.
    const cancelSeen: string[] = []
    const d = await compose('M-17/cancel')
    d.mod.attach(d.el, {
      element: d.el,
      onCancel: (): void => {
        cancelSeen.push('onCancel')
      },
    })
    d.double.establish()
    d.double.move()
    d.double.cancel()
    expect(
      cancelSeen,
      'M-17 — the consumer’s `onCancel` ran exactly once on the cancel: the session’s own cancel path invokes the module’s INSTALLED `onCancel` wrapper, which forwards the consumer’s hook by identity (`src/shared/gesture-session.ts` `cancelOperation`; `§2.3` item 6(d))',
    ).toEqual(['onCancel'])
  })
})

// ===========================================================================
// §3.2 — THE DOCUMENTED FAIL-STATES / NON-HAPPY STATES `F-4`..`F-19` (`F-1`..`F-3` are
// the pure block's). Each row's declared outcome is the spec's; the two POSITIVE
// CONTROLS the spec names (`F-4`, `F-6`) are driven here as well, because *"a
// composition cannot pass by counting only its own calls"*.
// ===========================================================================
describe('§3.2 F-4..F-19 — the documented fail-states', () => {
  it('F-4 §3.2 — THE NO-WRITER COMPOSITION, a positive control that MUST FAIL: with no `commit` seam the write count is `0` where the contract requires `1` — and the composition’s state is stated in the same sentence', async () => {
    for (const shape of ['the seam omitted', 'a non-callable `commit`'] as const) {
      const c = await compose('F-4', { commit: shape === 'the seam omitted' ? undefined : 42 })
      c.mod.attach(c.el)
      c.double.establish()
      c.double.move()
      c.double.terminate()
      expect(
        c.sinkArgs.length,
        `F-4 — with ${shape}, the SINK receives NOTHING: the row FAILS by the contract’s own reading, because the write count is \`0\` where the contract requires \`1\`. A slot-empty composition is a NO-WRITER composition and must NEVER be reported as a successful write`,
      ).toBe(0)
      expect(
        c.stats().sinkCalls,
        `F-4 — the module’s own counter reads \`0\` as well, and the reveal still fired once (${shape}): the composition wrote nothing while the session’s own terminal may well read \`committed: true\` — therefore *"one commit per gesture"* is VACUOUS for this composition and must NEVER be quoted as evidence that a write happened`,
      ).toBe(0)
      expect(
        c.revealArgs.length,
        'F-4 — the durable reveal is unaffected by the missing sink: the reveal channel and the sink are two different functions, and the absence of one is not the absence of the other',
      ).toBe(1)
    }
  })

  it('F-5 §3.2 — THE TWO READINGS DIVERGE: (a) the conformant composition’s consumer record and `revealWrites` AGREE at 1; (b) a composition whose `onReveal` and `commit` are the SAME function FAILS; (c) a composition in which an `onPreview` invocation also produces an `onReveal` invocation FAILS', async () => {
    // (a) THE POSITIVE HALF.
    const a = await compose('F-5/a')
    a.mod.attach(a.el)
    a.double.establish()
    a.double.move()
    a.double.terminate()
    expect(
      a.revealArgs.length,
      'F-5(a) — the consumer’s own `onReveal` record reads 1',
    ).toBe(1)
    expect(
      a.stats().revealWrites,
      'F-5(a) — `stats().revealWrites` reads 1, so THE TWO READINGS AGREE — and the agreement is this row’s positive half',
    ).toBe(1)
    // (b) ONE FUNCTION FOR TWO CHANNELS.
    const sharedArgs: Array<{ channel: string; arg: unknown }> = []
    const shared = (_target: unknown, _decision: unknown): void => {
      sharedArgs.push({ channel: 'onReveal-and-commit', arg: _target })
    }
    const b = await compose('F-5/b', { onReveal: shared, commit: shared as unknown as (g: unknown, v: unknown) => void })
    b.mod.attach(b.el)
    b.double.establish()
    b.double.move()
    b.double.terminate()
    expect(
      sharedArgs.filter((entry) => entry.channel === 'onReveal-and-commit').length,
      'F-5(b) — the SAME function received the SINK’s call as well, so the two channel classes are NOT held by two different functions: the row FAILS (one function received both channel classes, and the module’s own sink seam must be its own function). **THE READING IS THE SHARED FUNCTION’S OWN RECORD** — the seam THIS composition installed — and NOT `sinkArgs`, which belongs to the recorder this row REPLACED and therefore must read `0` (REPAIRED 2026-09-27: the as-filed cell read the replaced seam and could not be satisfied by any composition)',
    ).toBe(2)
    expect(
      b.revealArgs.length + b.sinkArgs.length === 0 && sharedArgs.length >= 2,
      `F-5(b) — the shared function’s own record reads ${sharedArgs.length} invocations from two different channel classes, while the two recorders this row REPLACED read nothing (${b.revealArgs.length} + ${b.sinkArgs.length}): that divergence is exactly what the row FAILS on`,
    ).toBe(true)
    // (c) A PREVIEW INVOCATION THAT ALSO PRODUCES A REVEAL.
    const c = await compose('F-5/c')
    let previewCalls = 0
    let revealsFromPreview = 0
    const leaky = await compose('F-5/c-leaky', {
      onPreview: (): void => {
        previewCalls += 1
        revealsFromPreview += 1 // the leaky composition's own extra write
      },
    })
    void c
    leaky.mod.attach(leaky.el)
    leaky.double.establish()
    leaky.double.move()
    expect(
      previewCalls,
      'F-5(c) — the leaky composition’s preview seam ran for the observed move',
    ).toBe(1)
    expect(
      revealsFromPreview,
      'F-5(c) — AND the same invocation produced a reveal write: the two channels are not the same function and may not share a turn, so the row FAILS (channel identity)',
    ).toBe(1)
    expect(
      leaky.revealArgs.length,
      'F-5(c) — the drive’s OWN `onPreview` produced an onReveal invocation, and the module’s own `onReveal` is a DIFFERENT function: the readings diverge, which is the falsifier',
    ).toBe(0)
  })

  it('F-6 §3.2 — THE TWO-WRITER COMPOSITION, a positive control that MUST FAIL: the sink’s record for the gesture has length 2 where the contract requires EXACTLY 1, while the module’s `sinkCalls` still reads 1 — BOTH readings are asserted', async () => {
    const record: unknown[] = []
    const sink = (_g: unknown, v: unknown): void => {
      record.push(v)
    }
    // The `E10-SINGLE-SINK-CHANNEL` violation: the SAME function handed to the module's
    // `commit` seam AND to the session's `commit` construction option.
    const c = await compose('F-6', { commit: sink }, { sink: sink as (g: GestureHandle, v: unknown) => void })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      record.length,
      'F-6 — the SINK’s own call record for the gesture has LENGTH 2, where the contract requires EXACTLY 1: the composition FAILS (ruling 6, §0A note 7 — a TWO-WRITER composition)',
    ).toBe(2)
    expect(
      c.stats().sinkCalls,
      'F-6 — THE DIVERGENCE: the module’s own `stats().sinkCalls` reads 1 while the sink’s record reads 2. `P-RL-SM-2` asserts BOTH readings, so a composition cannot pass by counting only its own calls',
    ).toBe(1)
    expect(
      record.length !== c.stats().sinkCalls,
      'F-6 — the divergence is the falsifier, and the row is written so the two readings are compared rather than either alone',
    ).toBe(true)
  })

  it('F-7 §3.2 — a THROWING `onPreview` PROPAGATES from the observed-move turn: the throw escapes the module’s move turn, the per-gesture record is DISCARDED in the module’s `finally`, no reveal and no sink write occurred, and `stats().moves` counts the move that threw', async () => {
    const c = await compose('F-7', {
      onPreview: (): void => {
        throw new Error('the presentation seam threw on the first observed move')
      },
    })
    c.mod.attach(c.el)
    c.double.establish()
    let escaped: unknown = null
    inPhase('move', () => {
      try {
        c.double.move()
      } catch (e) {
        escaped = e
      }
    })
    expect(
      escaped,
      'F-7 — the throw ESCAPES the module’s observed-move turn to that turn’s caller (a `void` presentation seam PROPAGATES: ruling 8, §2.4 item 2)',
    ).not.toBe(null)
    expect(
      c.stats().moves,
      'F-7 — `stats().moves` COUNTS the move that threw (the module counted its own turn before the seam threw)',
    ).toBe(1)
    // THE RECORD IS DISCARDED IN THE MODULE'S `finally`: a later `reset(el)` refuses with
    // ZERO session calls.
    const opsBefore = c.double.ops.length
    expect(
      c.mod.reset(c.el),
      'F-7 — the per-gesture record was DISCARDED in the module’s `finally`: a later `reset(el)` refuses `\'no-gesture\'`-class',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    expect(
      c.double.ops.length,
      'F-7 — and the refusal makes ZERO session calls',
    ).toBe(opsBefore)
    expect(
      c.revealArgs.length,
      'F-7 — no reveal occurred (the move turn never reached a terminal)',
    ).toBe(0)
    expect(
      c.sinkArgs.length,
      'F-7 — and no sink write occurred',
    ).toBe(0)
  })

  it('F-8 §3.2 — a THROWING `commit` PROPAGATES from the terminal turn: the throw escapes, the write is ALREADY COUNTED and NEVER RETRIED (`sinkCalls === 1`, `written === 0`), the gesture is IDLE not busy, and the element stays installed so a new gesture establishes normally', async () => {
    let throwOnce = true
    const sinkCalls: unknown[] = []
    const c = await compose('F-8', {
      commit: (_g: unknown, v: unknown): void => {
        sinkCalls.push(v)
        if (throwOnce) {
          throwOnce = false
          throw new Error('the sink threw on its one invocation')
        }
      },
    })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    let escaped: unknown = null
    inPhase('terminal', () => {
      try {
        c.double.terminate()
      } catch (e) {
        escaped = e
      }
    })
    expect(
      escaped,
      'F-8 — the throw ESCAPES the terminal turn to its caller (the sink is a consumer boundary and its throw PROPAGATES: §2.4 item 2)',
    ).not.toBe(null)
    expect(
      c.stats().sinkCalls,
      'F-8 — the write is ALREADY COUNTED: `stats().sinkCalls === 1`',
    ).toBe(1)
    expect(
      c.stats().written,
      'F-8 — and NEVER RETRIED: `stats().written === 0` (the write did not return)',
    ).toBe(0)
    expect(
      c.stats().revealWrites,
      'F-8 — the reveal write was attempted ONCE and counted, never retried (a throwing sink does not make the module re-invoke its own commit seam)',
    ).toBe(1)
    // THE GESTURE IS IDLE, NOT BUSY, and a new gesture establishes normally.
    c.double.establish()
    c.double.move()
    let secondThrew = false
    inPhase('terminal', () => {
      try {
        c.double.terminate()
      } catch {
        secondThrew = true
      }
    })
    expect(
      secondThrew,
      'F-8 — a SEPARATE drive: the element stays installed and a new gesture establishes normally on the same module instance (the gesture was idle, not busy — the terminal completed its own bookkeeping)',
    ).toBe(false)
    expect(
      c.stats().sinkCalls,
      'F-8 — the second gesture wrote once more (`sinkCalls` now 2): the first gesture’s throw left no busy state behind',
    ).toBe(2)
    expect(
      c.stats().revealWrites,
      'F-8 — and the second gesture’s reveal was written once as well (two reveals for two gestures)',
    ).toBe(2)
    expect(
      sinkCalls.length,
      'F-8 — the sink’s own record agrees with the module’s own counter about the TOTAL writes',
    ).toBe(c.stats().sinkCalls)
  })

  it('F-9 §3.2 — a `cancel` writes ZERO times even when the consumer set state on the gesture: ZERO reveal invocations, ZERO sink calls, ZERO resets, and the outcome is not `\'end\'` — while the preview count is NOT asserted to be zero here', async () => {
    const c = await compose('F-9')
    const consumerMoves: unknown[] = []
    c.mod.attach(c.el, {
      element: c.el,
      onMove: (g: unknown): void => {
        consumerMoves.push(g)
      },
    })
    c.double.establish()
    c.double.move()
    c.double.cancel()
    const stats = c.stats()
    expect(
      c.revealArgs.length,
      'F-9 — ZERO reveal invocations on a cancel, even though the consumer’s own onMove recorded a value on the handle',
    ).toBe(0)
    expect(
      stats.sinkCalls,
      'F-9 — ZERO sink calls',
    ).toBe(0)
    expect(
      stats.resets,
      'F-9 — ZERO resets (a cancel is not the invalid arm)',
    ).toBe(0)
    expect(
      consumerMoves.length,
      'F-9 — the consumer’s own `onMove` DID run once (so the drive is not vacuous): the cancel terminated a gesture the consumer had already observed',
    ).toBe(1)
    expect(
      c.double.terminals,
      'F-9 — the terminal’s outcome was NOT `\'end\'`: the recording session ran NO committing terminal at all (its own terminal log is empty — a `cancel` is not a committing terminal, `§2.3` item 6(d)), and the module’s own `commit` seam was therefore never invoked (`stats().sinkCalls === 0` above)',
    ).toEqual([])
    expect(
      c.mod.reset(c.el),
      'F-9 — the module’s record is dropped: a later `reset` refuses with zero session calls',
    ).toEqual({ ok: false, code: 'no-gesture', committed: false })
    // The preview count is deliberately NOT asserted to be zero here (F-9's own text: a
    // cancel may follow moves that DID preview; that is `P-RL-SM-6`'s domain).
    expect(
      c.previewArgs.length <= 1,
      `F-9 — the preview count is NOT asserted to be zero (it reads ${c.previewArgs.length} here): the per-move channel may legitimately have carried the move before the cancel, and the clause belongs to the register row`,
    ).toBe(true)
  })

  it('F-10 §3.2 — the session’s own refusals propagate VERBATIM as the module’s `lastCode`: the string `stats().lastCode` reads is BYTE-IDENTICAL (`===`) to the one the session returned, and NO module-local code exists anywhere in the module’s bytes', async () => {
    const codes = ['disposed', 'stale', 'no-gesture', 'busy', 'not-installed', 'disconnected']
    for (const code of codes) {
      const double = sessionDouble({ refuseResetWith: code })
      const el = { control: code }
      double.setElement(el, 10)
      const mod = await makeModule({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }, `F-10/${code}`)
      mod.attach(el)
      double.establish()
      const refusal = mod.reset(el)
      expect(
        double.reset(el).code,
        `F-10 — the double’s own refusal really answers \`${code}\` (so the module’s reading below is compared against a live session code)`,
      ).toBe(code)
      expect(
        refusal.code,
        `F-10 — the refusal’s code is the session’s own \`${code}\`, byte-identically (\`===\`)`,
      ).toBe(code)
      expect(
        mod.stats().lastCode,
        `F-10 — \`stats().lastCode\` reads the code the SESSION produced (the LAST session code this module propagated), never a module-local one`,
      ).toBe(code)
    }
    const source = requireModuleSource('F-10')
    for (const invented of ["'blocked'", "'invalid'", "'no-proximity'", "'refused'", "'error'"]) {
      expect(
        source.includes(invented),
        `F-10 — the module carries NO module-local code literal \`${invented}\`: an eighth SESSION code, or any module-local code, FAILS this row (I-14, §4.4 S-11)`,
      ).toBe(false)
    }
  })

  it('F-11 §3.2 — an UNUSABLE or hostile `session`, and the total factory: construction NEVER throws and the returned module is VALID BUT INERT (`attach` ⇒ `false` with no session call, `reset` ⇒ a refusal record with zero session calls, `detach()` ⇒ `false`, zeroed counters)', async () => {
    const hostileSessions: ReadonlyArray<{ name: string; build: () => unknown }> = [
      { name: 'the factory called with NO argument', build: () => ({}) },
      { name: 'an empty record', build: () => ({ session: {} }) },
      { name: '`session: undefined`', build: () => ({ session: undefined }) },
      { name: '`session: 42`', build: () => ({ session: 42 }) },
      { name: 'a Proxy whose traps throw', build: () => ({ session: new Proxy({}, { get: (): never => { throw new Error('a hostile trap') }, has: (): never => { throw new Error('a hostile trap') } }) }) },
      { name: 'a frozen empty record', build: () => ({ session: Object.freeze({}) }) },
    ]
    for (const hostile of hostileSessions) {
      const create = await valueExport<(o?: unknown) => unknown>('createRelocateSession', `F-11/${hostile.name}`)
      let threw = false
      let mod: RelocateModuleMirror | null = null
      try {
        mod = create(hostile.build()) as RelocateModuleMirror
      } catch {
        threw = true
      }
      expect(
        threw,
        `F-11 — construction NEVER throws for ${hostile.name}`,
      ).toBe(false)
      expect(
        mod,
        `F-11 — ${hostile.name} still yields a module`,
      ).not.toBe(null)
      const inert = mod as RelocateModuleMirror
      expect(
        inert.attach({ control: 'a' }),
        `F-11 — \`attach\` ⇒ \`false\` for ${hostile.name} (no session call is possible: the module was handed no usable session)`,
      ).toBe(false)
      expect(
        inert.stats().attached,
        `F-11 — \`stats().attached === 0\` for ${hostile.name}`,
      ).toBe(0)
      expect(
        inert.reset({ control: 'a' }),
        `F-11 — \`reset\` ⇒ a refusal RECORD (never a throw) for ${hostile.name}`,
      ).toEqual({ ok: false, code: 'no-gesture', committed: false })
      expect(
        inert.detach(),
        `F-11 — \`detach()\` ⇒ \`false\` for ${hostile.name}`,
      ).toBe(false)
      const stats = inert.stats()
      expect(
        Object.values(stats).filter((v) => typeof v === 'number' && v !== 0),
        `F-11 — \`stats()\` ⇒ ZEROED counters for ${hostile.name} (the only non-zero-reading field a valid-inert module may carry is the session’s own \`'ok'\` code reading): ${JSON.stringify(
          stats,
        )}`,
      ).toEqual([])
      expect(
        inert.detached,
        `F-11 — \`detached\` reads \`false\` until a \`detach()\` that refuses: the refusal did not mark it detached`,
      ).toBe(false)
    }
    // The non-record OPTIONS arguments of the same row: `42`, `'x'`, `null` and an absent
    // argument, all through the same total factory.
    for (const arg of [42, 'x', null, undefined]) {
      const create = await valueExport<(o?: unknown) => unknown>('createRelocateSession', `F-11/${brief(arg)}`)
      expect(
        ((): boolean => {
          try {
            create(arg as unknown as Record<string, unknown>)
            return true
          } catch {
            return false
          }
        })(),
        `F-11 — \`createRelocateSession(${brief(arg)})\` NEVER throws (§2.4 item 4: the total-member-read rule is what makes this a value and not a throw)`,
      ).toBe(true)
    }
  })

  it('F-12 §3.2 — a hostile OPTIONS record: a throwing accessor for EACH of the seven members, a throwing Proxy, a frozen record and an array all construct WITHOUT a throw, and the resulting module degrades exactly where the hostile read made a member unusable', async () => {
    const memberNames = ['session', 'candidatesFor', 'resolveTarget', 'onReveal', 'commit', 'threshold', 'onPreview']
    for (const member of memberNames) {
      const hostileOptions = {
        get [member](): never {
          throw new Error(`a throwing accessor on ${member}`)
        },
      }
      const create = await valueExport<(o?: unknown) => unknown>('createRelocateSession', `F-12/${member}`)
      let threw = false
      let mod: RelocateModuleMirror | null = null
      try {
        mod = create(hostileOptions) as RelocateModuleMirror
      } catch {
        threw = true
      }
      expect(
        threw,
        `F-12 — \`createRelocateSession({get ${member}() { throw … }})\` NEVER throws: the TOTAL-MEMBER-READ rule is what makes this a value and not a throw (§2.4 item 4)`,
      ).toBe(false)
      expect(
        (mod as RelocateModuleMirror).attach({ control: 'a' }),
        `F-12 — with \`${member}\`'s accessor throwing, \`attach\` returns a BOOLEAN rather than throwing (the hostile read degrades the member, it does not propagate)`,
      ).toBe(false)
      expect(
        typeof (mod as RelocateModuleMirror).reset({ control: 'a' }).ok,
        `F-12 — and \`reset\` returns its declared RECORD for the same hostile read`,
      ).toBe('boolean')
    }
    for (const hostile of [
      { name: 'a Proxy whose traps throw', build: (): unknown => new Proxy({}, { get: (): never => { throw new Error('a hostile trap') }, has: (): never => { throw new Error('a hostile trap') } }) },
      { name: 'a frozen empty record', build: (): unknown => Object.freeze({}) },
      { name: 'an array', build: (): unknown => [] },
    ]) {
      const create = await valueExport<(o?: unknown) => unknown>('createRelocateSession', `F-12/${hostile.name}`)
      expect(
        ((): boolean => {
          try {
            const m = create(hostile.build()) as RelocateModuleMirror
            return typeof m.attach({ control: 'a' }) === 'boolean' && typeof m.stats().moves === 'number'
          } catch {
            return false
          }
        })(),
        `F-12 — ${hostile.name} yields the INERT-degraded module of the row above, whose members still return their declared shapes`,
      ).toBe(true)
    }
  })

  // ---------------------------------------------------------------------------
  // F-13 — RE-GRAINED 2026-09-27 (`§0A` note 14 item 2, `§2.4` item 3 as corrected).
  //
  // THE AS-FILED CELLS, KEPT VISIBLE (annotate-never-rewrite — they are SUPERSEDED and
  // are NOT driven anywhere below):
  //   * the subject read *"a candidate answer that is NOT a usable record … and an ARRAY
  //     is NOT a record and is therefore the same class"*;
  //   * the drive list carried *"an ARRAY of candidate records"* ⇒ `[answer(1)]` and
  //     EXPECTED `resets === 1` for it;
  //   * the answer shape was declared `{candidates: readonly CandidateFor[]}`, with a bare
  //     array asserted to be "the same class as a primitive answer".
  // THE CORRECTED CONTRACT: the canonical answer shape IS `readonly CandidateFor[]` — a
  // bare array IS the legal answer and is NOT this row's invalid class — and the class
  // level is an answer that is not a usable RECORD OR ARRAY at all. The record with a
  // THROWING `distance` accessor that the as-filed list carried in this row's class drive
  // is REMOVED here as a duplicate subject: `§0A` note 14 item 2(ii) records that
  // non-usable `distance` FIELD is owned by `F-14` (field level) and `P-RL-IM-5`
  // (the field's seven shapes), so it is not re-driven as a class-level cell.
  // ---------------------------------------------------------------------------
  it('F-13 §3.2 — a candidate answer that is NOT a usable record or array AT ALL (the CLASS level): `undefined` · `null` · `42` · `\'x\'` · `true` · a function · a non-array object that is not an accepted answer ⇒ NO candidate and NO distance ⇒ the invalid arm at once, never a throw — while an ARRAY IS the LEGAL answer shape and is NOT this class', async () => {
    const shapes: ReadonlyArray<{ name: string; value: unknown }> = [
      { name: '`undefined`', value: undefined },
      { name: '`null`', value: null },
      { name: '`42`', value: 42 },
      { name: '`\'x\'`', value: 'x' },
      { name: '`true`', value: true },
      { name: 'a function', value: (): unknown => [answer(1)] },
      // A NON-ARRAY OBJECT THAT IS NOT AN ACCEPTED ANSWER — an answer-level shape that
      // differs in subject from `F-15`'s seam-level `{}` (there the SEAM is not callable;
      // here the seam IS callable and returns this value).
      { name: 'a non-array object that is not an accepted answer', value: { not: 'an accepted answer' } },
    ]
    for (const shape of shapes) {
      const c = await compose(`F-13/${shape.name}`, { candidatesFor: (): unknown => shape.value })
      c.mod.attach(c.el)
      c.double.establish()
      let threw = false
      try {
        c.double.move()
      } catch {
        threw = true
      }
      expect(
        threw,
        `F-13 — ${shape.name} never throws out of the observed-move turn: the answer is read through the module’s own total member-read`,
      ).toBe(false)
      expect(
        c.stats().resets,
        `F-13 — ${shape.name} supplies NO candidate and NO distance, so the invalid arm is taken AT ONCE`,
      ).toBe(1)
      expect(
        c.stats().candidateCalls,
        `F-13 — the seam was still ATTEMPTED once (an attempt is counted even where the answer was unusable)`,
      ).toBe(1)
      expect(
        c.stats().revealWrites,
        `F-13 — no reveal is written for an unusable answer (a durable write needs a target, and the arm carries none)`,
      ).toBe(0)
    }
    // THE ARRAY IS THE LEGAL ANSWER SHAPE — stated as the CONTRACT'S OWN PIN and driven as
    // a POSITIVE cell, so the class above is not merely asserted: `§2.4` item 3 as
    // corrected / `§0A` note 14 item 2(i).
    const typedAnswer: readonly ModuleCandidateFor[] = [{ candidate: { opaque: true }, distance: 1 }]
    expect(
      Array.isArray(typedAnswer),
      'F-13 — the canonical answer shape IS `readonly CandidateFor[]` (the shape `§2.1`’s `RelocateTargetFor` already takes): an ARRAY IS the LEGAL answer, so it is NOT an invalid class and is NOT the subject of the drives above',
    ).toBe(true)
    const positive = await compose('F-13/positive-array', { candidatesFor: (): unknown => typedAnswer })
    positive.mod.attach(positive.el)
    positive.double.establish()
    positive.double.move()
    expect(
      positive.stats().resets,
      'F-13 (POSITIVE control) — a BARE ARRAY carrying ONE within-proximity candidate is WITHIN PROXIMITY: the invalid arm is NOT taken (a module that treated the bare array as the invalid class FAILS this cell, and that is the as-filed reading this re-grain supersedes)',
    ).toBe(0)
    // (iii) THE EMPTY ARRAY: NO CANDIDATES ⇒ nothing within proximity ⇒ the invalid arm
    // AT ONCE — `§2.4` item 1's `candidatesFor` row, `§2.3` item 6(c), `P-RL-SM-7`
    // invalidity class `(1)` (`§0A` note 14 item 2(iii)).
    const empty = await compose('F-13/empty-array', { candidatesFor: (): unknown => [] })
    empty.mod.attach(empty.el)
    empty.double.establish()
    let emptyThrew = false
    try {
      empty.double.move()
    } catch {
      emptyThrew = true
    }
    expect(
      emptyThrew,
      'F-13 — an EMPTY ARRAY never throws out of the observed-move turn (an empty candidate set is a VALUE, not an error — `P-RL-SM-7` class 1)',
    ).toBe(false)
    expect(
      empty.stats().resets,
      'F-13 — an EMPTY ARRAY is NO CANDIDATES ⇒ nothing within proximity ⇒ the INVALID ARM AT ONCE (`§2.4` item 1 · `§2.3` item 6(c) · `P-RL-SM-7` invalidity class `(1)`)',
    ).toBe(1)
    expect(
      empty.stats().candidateCalls,
      'F-13 — and the seam was still ATTEMPTED once for the empty answer',
    ).toBe(1)
  })

  // ---------------------------------------------------------------------------
  // F-13(b) — THE ELEMENT-LEVEL INVALID CLASS, the row `§0A` note 14 item 2(ii) records as
  // OWED and that no existing row owned. CHECKED BEFORE AUTHORING, so this row does not
  // duplicate another row's subject:
  //   * `F-14` owns a NON-USABLE `distance` FIELD with the `candidate` PRESENT;
  //   * `P-RL-IM-5` owns the `distance` field's SEVEN shapes (a record per element);
  //   * `F-15` owns the ABSENT/NON-CALLABLE SEAM (and its seam-level `{}` drive);
  //   * `P-RL-IM-1`'s shapes (2)/(3) are SEAM-absent / SEAM-non-callable;
  //   * `F-13` (above) owns the CLASS level, and its `[]` cell owns class (iii).
  // NONE of them drives `[42]` / `['x']` / `[null]` / `[undefined]` / `[true]` /
  // `[a function]` — an ARRAY whose ELEMENT is not a usable record, i.e. an element that
  // supplies no readable `distance`. This row is F-13's NEIGHBOUR, not F-13's content, and
  // it adds NO register row, NO term and NO total (the register is `15` rows / `16` terms /
  // `170` attempts before and after).
  // ---------------------------------------------------------------------------
  it('F-13(b) §3.2 — the ELEMENT-LEVEL invalid class: an ARRAY whose ELEMENT is not a usable record (`[42]` · `[\'x\']` · `[null]` · `[undefined]` · `[true]` · `[a function]`) supplies no readable `distance` ⇒ the invalid arm, never a throw — and the CONTROL drive (`[answer(1)]`) is WITHIN proximity', async () => {
    const elements: ReadonlyArray<{ name: string; value: unknown }> = [
      { name: '`42`', value: 42 },
      { name: '`\'x\'`', value: 'x' },
      { name: '`null`', value: null },
      { name: '`undefined`', value: undefined },
      { name: '`true`', value: true },
      { name: 'a function', value: (): unknown => 1 },
    ]
    for (const element of elements) {
      const c = await compose(`F-13(b)/${element.name}`, { candidatesFor: (): unknown => [element.value] })
      c.mod.attach(c.el)
      c.double.establish()
      let threw = false
      try {
        c.double.move()
      } catch {
        threw = true
      }
      expect(
        threw,
        `F-13(b) — an array whose element is ${element.name} never throws out of the observed-move turn: the element is read through the module’s own total member-read, and a non-record element supplies NO distance rather than an error`,
      ).toBe(false)
      expect(
        c.stats().candidateCalls,
        `F-13(b) — the seam was still ATTEMPTED once for the element ${element.name} (the ARRAY is a legal answer; it is the ELEMENT that is unusable)`,
      ).toBe(1)
      expect(
        c.stats().resets,
        `F-13(b) — an array whose element is ${element.name} supplies no readable distance ⇒ the INVALID ARM AT ONCE (the ELEMENT-level class of \`§2.4\` item 3, owed by \`§0A\` note 14 item 2(ii))`,
      ).toBe(1)
      expect(
        c.stats().revealWrites,
        `F-13(b) — and no reveal is written for the unusable element ${element.name}: a durable write needs a within-proximity candidate, and this answer carries none`,
      ).toBe(0)
    }
    // THE POSITIVE CONTROL: the SAME array shape, whose element IS a usable record within
    // proximity — so this row's drives are about the ELEMENT, not about the array.
    const control = await compose('F-13(b)/CONTROL-usable-element', { candidatesFor: (): unknown => [answer(1)] })
    control.mod.attach(control.el)
    control.double.establish()
    control.double.move()
    expect(
      control.stats().resets,
      'F-13(b) (CONTROL) — a ONE-ELEMENT array whose element IS a usable record within proximity is WITHIN PROXIMITY: the arm is NOT taken, so this row is driving the ELEMENT and not the answer shape',
    ).toBe(0)
  })

  it('F-14 §3.2 — a `distance` field that is absent, non-numeric, `NaN`, non-finite or read through a throwing accessor: all five take the invalid arm and NONE throws — and the CONTROL drive (an absent `candidate` with a within-proximity `distance`) IS within proximity', async () => {
    const shapes: ReadonlyArray<{ name: string; make: () => { candidate: unknown; distance?: unknown } }> = [
      { name: 'ABSENT (the field omitted)', make: () => ({ candidate: { opaque: true } }) },
      { name: '`undefined` explicitly present', make: () => ({ candidate: { opaque: true }, distance: undefined }) },
      { name: 'non-numeric (\'5\')', make: () => ({ candidate: { opaque: true }, distance: '5' }) },
      { name: '`NaN`', make: () => ({ candidate: { opaque: true }, distance: NaN }) },
      { name: 'non-finite (`Infinity`)', make: () => ({ candidate: { opaque: true }, distance: Infinity }) },
      { name: 'a THROWING accessor', make: () => ({ candidate: { opaque: true }, get distance(): never { throw new Error('a throwing distance accessor') } }) },
    ]
    for (const shape of shapes) {
      const c = await compose(`F-14/${shape.name}`, { candidatesFor: (): unknown => [shape.make()] })
      c.mod.attach(c.el)
      c.double.establish()
      let threw = false
      try {
        c.double.move()
      } catch {
        threw = true
      }
      expect(
        threw,
        `F-14 — a \`distance\` that is ${shape.name} never throws (the degradation is DECLARED by §2.4 item 3 rather than repaired by a second gate)`,
      ).toBe(false)
      expect(
        c.stats().resets,
        `F-14 — a \`distance\` that is ${shape.name} takes the INVALID ARM: nothing is within proximity`,
      ).toBe(1)
    }
    // THE CONTROL: an ABSENT `candidate` with a within-proximity `distance` IS within
    // proximity — ONLY THE DISTANCE DECIDES.
    const control = await compose('F-14/CONTROL', { candidatesFor: (): unknown => [{ distance: 1 }] })
    control.mod.attach(control.el)
    control.double.establish()
    control.double.move()
    // THE DRIVE THE CELL'S OWN TEXT NAMES: *"and the terminal reaches its committing path"* —
    // so the terminal must be DRIVEN. (REPAIRED 2026-09-27: the as-filed control asserted a
    // terminal reading without driving a terminal, so `revealWrites` could only ever read `0`.)
    control.double.terminate()
    expect(
      control.stats().resets,
      'F-14 (CONTROL) — an answer with NO `candidate` field but a WITHIN-PROXIMITY `distance` is WITHIN PROXIMITY: the arm is NOT taken, because ONLY THE DISTANCE DECIDES (the split `P-RL-IM-5` drives)',
    ).toBe(0)
    expect(
      control.stats().revealWrites,
      'F-14 (CONTROL) — and the terminal reaches its committing path: a reveal is written',
    ).toBe(1)
  })

  it('F-15 §3.2 — an ABSENT or non-callable `candidatesFor`: the EMPTY candidate set ⇒ nothing within proximity ⇒ the invalid arm AT ONCE, the refusal is NOT a cancel, and `candidateCalls` counts the ATTEMPT where the seam was present and reads `0` where it was absent from the options object', async () => {
    for (const shape of [
      { name: 'the seam omitted', value: undefined, calls: 0 },
      { name: '`42`', value: 42, calls: 1 },
      { name: '`\'x\'`', value: 'x', calls: 1 },
      { name: 'an object', value: {}, calls: 1 },
      { name: 'a Proxy whose traps throw', value: new Proxy({}, { get: (): never => { throw new Error('a hostile trap') } }), calls: 1 },
      // **`ADV-RL-3`/(b) item 2 — THE WIDER NON-CALLABLE FAMILY, DRIVEN FOR REAL.** These are
      // the falsy-but-PRESENT forms a `typeof`-guard-only reading would mistake for the ABSENT
      // form: each is an ATTEMPT (`candidateCalls` reads `1` per observed move), never a default
      // and never a throw. `Object.create(null)` additionally has NO PROTOTYPE, so a member read
      // that assumes one degrades instead of throwing.
      { name: '`null` (PRESENT — not the absent form)', value: null, calls: 1 },
      { name: '`false` (PRESENT)', value: false, calls: 1 },
      { name: '`0` (PRESENT)', value: 0, calls: 1 },
      { name: "`''` (PRESENT)", value: '', calls: 1 },
      { name: "`Symbol('s')` (PRESENT)", value: Symbol('s'), calls: 1 },
      { name: '`Object.create(null)` (a NULL-PROTOTYPE record)', value: Object.create(null) as unknown, calls: 1 },
    ] as const) {
      const c = await compose(`F-15/${shape.name}`, shape.value === undefined ? { candidatesFor: undefined } : { candidatesFor: shape.value })
      c.mod.attach(c.el)
      c.double.establish()
      c.double.move()
      const stats = c.stats()
      expect(
        stats.resets,
        `F-15 — with ${shape.name} the invalid arm is taken AT ONCE (nothing within proximity, and the module invents NO default candidate set)`,
      ).toBe(1)
      expect(
        stats.candidateCalls,
        `F-15 — \`stats().candidateCalls\` reads ${shape.calls} for ${shape.name}: an ATTEMPT is counted where the seam was present (including a non-callable or hostile one, which is never retried), and \`0\` where the seam was ABSENT from the options object`,
      ).toBe(shape.calls)
      expect(
        c.double.terminals.map((t) => t.outcome),
        `F-15 — the invalid arm is NOT a cancel for ${shape.name}: the recording session’s OWN terminal log carries exactly one COMMITTING terminal, and it is the \`'reset'\` terminal the module’s own move turn entered (§2.5 item 7 clause 3: the terminal is read from the SESSION’s own record, never from an install-options member)`,
      ).toEqual(['reset'])
      expect(
        (c.sinkArgs[0][0] as { outcome: string }).outcome,
        `F-15 — the terminal’s outcome is \`\'reset\'\` for ${shape.name}, never a cancel`,
      ).toBe('reset')
    }
  })

  // =========================================================================
  // `ADV-RL-3`/(b) item 4 — A GENUINE in → out → in CROSSING (`I-2`'s fork-failing
  // shape driven with a REAL departure between two within-proximity observations).
  // =========================================================================
  it('I-2(crossing) §3.3 — A GENUINE in → out → in CROSSING (`ADV-RL-3`): the SAME gesture observes within `A`, then outside every candidate (the invalid arm is entered there), then within `A` again — and the `\'end\'` terminal still reveals EXACTLY ONCE, so the per-crossing shape FAILS', async () => {
    let distance = 1
    let previews = 0
    const c = await compose('I-2/genuine-crossing', {
      candidatesFor: (): unknown => [answer(distance, { opaque: 'A' })],
      onPreview: (): void => void (previews += 1),
    })
    c.mod.attach(c.el)
    c.double.establish()
    inPhase('move', () => {
      c.double.move() // (1) WITHIN `A` — shows
      distance = 999
      c.double.move() // (2) OUTSIDE every candidate — the invalid arm is entered HERE
      distance = 1
      c.double.move() // (3) WITHIN `A` AGAIN — the crossing back
    })
    inPhase('terminal', () => {
      c.double.terminate()
    })
    expect(
      previews,
      'I-2(genuine crossing) — the presentation channel receives ONE invocation per observed move (3 moves ⇒ 3), so the departure and the return are both OBSERVED',
    ).toBe(3)
    expect(
      c.stats().resets,
      'I-2(genuine crossing) — the invalid arm is taken AT MOST ONCE for the gesture, at the out-of-proximity observation',
    ).toBe(1)
    expect(
      c.revealArgs.length,
      'I-2(genuine crossing) — the CONSUMER’s own `onReveal` record reads exactly ONE for a gesture that crossed the proximity THREE times (in, out, in): the per-crossing shape FAILS',
    ).toBe(1)
    expect(
      c.stats().revealWrites,
      'I-2(genuine crossing) — the module’s own `stats().revealWrites` AGREES with the consumer’s record at 1',
    ).toBe(1)
  })

  it('F-16 §3.2 — an ABSENT, non-callable or THROWING `resolveTarget`: in EVERY case the terminal writes NOTHING for that gesture and it is NOT a cancel (the outcome is still `\'end\'`), and `revealWrites === 0` — a target exists or the reveal has nothing to write', async () => {
    for (const shape of [
      { name: 'the seam omitted', value: undefined },
      { name: '`42`', value: 42 },
      { name: 'a callable that THROWS', value: (): never => { throw new Error('a throwing resolveTarget') } },
      { name: 'a callable returning `undefined`', value: (): unknown => undefined },
    ] as const) {
      const c = await compose(`F-16/${shape.name}`, shape.value === undefined ? { resolveTarget: undefined } : { resolveTarget: shape.value as ModuleRelocateTargetFor })
      c.mod.attach(c.el)
      c.double.establish()
      let threw = false
      try {
        c.double.move()
        c.double.terminate()
      } catch {
        threw = true
      }
      expect(
        threw,
        `F-16 — with ${shape.name} the turn never throws: the seam is a VALUE-READING seam and is ABSORBED (§2.4 item 2)`,
      ).toBe(false)
      expect(
        c.stats().sinkCalls,
        `F-16 — with ${shape.name} the terminal writes NOTHING for that gesture: \`stats().sinkCalls === 0\``,
      ).toBe(0)
      expect(
        c.stats().revealWrites,
        `F-16 — and \`stats().revealWrites === 0\`: a target exists or the reveal has nothing to write`,
      ).toBe(0)
      expect(
        c.double.terminals.map((t) => t.outcome),
        `F-16 — it is NOT a cancel for ${shape.name}: the recording session’s OWN terminal log carries exactly one COMMITTING terminal, and it is the \`'end'\` the row drove (§2.5 item 7 clause 3) — the sink’s own record below still reads ZERO writes, which is the declared cell: an \`'end'\` whose resolved target is \`undefined\` writes NOTHING`,
      ).toEqual(['end'])
      expect(
        c.sinkArgs.length,
        `F-16 — and no sink call occurred for ${shape.name}`,
      ).toBe(0)
    }
  })

  it('F-17 §3.2 — an ABSENT or non-callable `onReveal`: the write attempt is made and there is nothing to invoke (`revealWrites` counts the ATTEMPT only where a callable was present, `revealWritesApplied` reads `0`) — and a THROWING `onReveal` is ABSORBED at the module’s own commit seam, with the sink’s own write unaffected', async () => {
    for (const shape of [
      { name: 'the seam omitted', value: undefined, attempts: 0 },
      { name: '`42` (non-callable)', value: 42, attempts: 0 },
    ] as const) {
      const c = await compose(`F-17/${shape.name}`, shape.value === undefined ? { onReveal: undefined } : { onReveal: shape.value })
      c.mod.attach(c.el)
      c.double.establish()
      c.double.move()
      c.double.terminate()
      expect(
        c.stats().revealWrites,
        `F-17 — with ${shape.name} the write attempt is made and there is nothing to invoke: \`revealWrites\` reads ${shape.attempts} (the invocation is COUNTED only where a callable was present)`,
      ).toBe(shape.attempts)
      expect(
        c.stats().revealWritesApplied,
        `F-17 — and \`revealWritesApplied\` reads 0 for ${shape.name} (the member RENAMED 2026-09-27 from the banned census-token spelling — \`§0A\` note 14 item 1)`,
      ).toBe(0)
      expect(
        c.stats().sinkCalls,
        `F-17 — the sink’s own write is unaffected by the missing reveal seam for ${shape.name}: it still happens once`,
      ).toBe(1)
    }
    // A THROWING `onReveal` IS ABSORBED at the module's own commit seam.
    const c = await compose('F-17/throwing', {
      onReveal: (): void => {
        throw new Error('the reveal seam threw')
      },
    })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move()
    let escaped: unknown = null
    inPhase('terminal', () => {
      try {
        c.double.terminate()
      } catch (e) {
        escaped = e
      }
    })
    expect(
      escaped,
      'F-17 — a THROWING `onReveal` is ABSORBED at the module’s own `commit` seam: the terminal turn does NOT throw (§2.4 item 2: value-reading seams are absorbed)',
    ).toBe(null)
    expect(
      c.stats().revealWrites,
      'F-17 — `revealWrites === 1`: the attempt was made and COUNTED',
    ).toBe(1)
    expect(
      c.stats().revealWritesApplied,
      'F-17 — `revealWritesApplied === 0`: the write did not return, and it is NEVER RETRIED',
    ).toBe(0)
    expect(
      c.stats().sinkCalls,
      'F-17 — the sink’s own write is unaffected and still happens once',
    ).toBe(1)
    expect(
      c.stats().written,
      'F-17 — and the sink’s write RETURNED (`written === 1`), so the absorbed reveal throw did not take the sink down with it',
    ).toBe(1)
  })

  it('F-18 §3.2 — the invalid arm’s STICKY refusal: the moves `outside → inside → outside → outside` read `resets === 1` — the arm is taken AT MOST ONCE per gesture — and the consumer’s `onPreview` still receives EVERY move’s presentation', async () => {
    let distance = 999
    const c = await compose('F-18', { candidatesFor: (): unknown => [answer(distance)] })
    c.mod.attach(c.el)
    c.double.establish()
    c.double.move() // outside — the arm is taken
    distance = 1
    c.double.move() // inside
    distance = 999
    c.double.move() // outside again — NO further reset
    c.double.move() // outside again — NO further reset
    expect(
      c.stats().resets,
      'F-18 — `stats().resets === 1`: the arm is taken AT MOST ONCE per gesture and its refusal is STICKY (the second and third outside moves take NO further reset call)',
    ).toBe(1)
    expect(
      c.double.resets.length,
      'F-18 — the recording session’s log confirms ONE `reset` entry for the four moves',
    ).toBe(1)
    expect(
      c.previewArgs.length,
      'F-18 — the consumer’s `onPreview` still receives EVERY move’s presentation (4 moves ⇒ 4 invocations): the per-move channel is NOT suppressed by the arm',
    ).toBe(4)
    expect(
      c.stats().moves,
      'F-18 — the module still counted all four observed moves',
    ).toBe(4)
  })

  it('F-19 §3.2 — a consumer that writes from its OWN hooks: this module’s rows do NOT count that write as the composition’s — `stats().sinkCalls` is the count of the module’s own ONE call site — and a composition whose TOTAL write count for one gesture is `2` FAILS `F-6`', async () => {
    const consumerWrites: unknown[] = []
    const consumerOwnSink = (_g: unknown, v: unknown): void => {
      consumerWrites.push(v)
    }
    const c = await compose('F-19', {
      // The module's own sink is NOT this function: the consumer keeps a sink of its own
      // and writes from its own hook.
      commit: (g: unknown, v: unknown): void => {
        void g
        void v
      },
    })
    c.mod.attach(c.el, {
      element: c.el,
      onMove: (g: unknown): void => {
        consumerOwnSink(g, 'the-consumer-hook-write')
      },
      onEnd: (): void => {
        consumerOwnSink(null, 'the-consumer-hook-write')
      },
    })
    c.double.establish()
    c.double.move()
    c.double.terminate()
    expect(
      consumerWrites.length,
      'F-19 — the consumer’s own sink recorded its own two writes (one from its onMove and one from its onEnd)',
    ).toBe(2)
    expect(
      c.stats().sinkCalls,
      'F-19 — and `stats().sinkCalls` reads 1: the module’s own counter is the count of ITS OWN one call site, and it does NOT count the consumer’s own writes',
    ).toBe(1)
    expect(
      c.sinkArgs.length,
      'F-19 — THE SEAM THIS ROW REPLACED received NOTHING: `sinkArgs` is the composition’s OWN recorder for the `commit` seam, and this row overwrote that seam with its own no-op — so the replaced seam cannot be the record of the module’s call site. *"The module’s own call site ran"* is read from the module’s OWN counter (above) and from the consumer’s own sink record, never from a recorder the row replaced (REPAIRED 2026-09-27: the as-filed cell asserted `1` on the replaced seam — an assertion the row’s own wiring made unsatisfiable)',
    ).toBe(0)
    expect(
      consumerWrites.length + c.stats().sinkCalls,
      'F-19 — the composition’s TOTAL write count for one gesture is 3 here (2 consumer-written, read from the consumer’s own sink’s record, plus 1 module-written, read from the module’s own counter): a total of 2 for one gesture FAILS `F-6`, so the loophole closes where it matters',
    ).toBe(3)
  })

  // =========================================================================
  // `ADV-RL-1` (HIGH) — THE CONSUMER-DRIVEN ARM'S SHAPE. **AUTHORED RED FIRST**
  // (`RCA-1`/`RCA-3`): this row exists and FAILS before the Implementer's fix, and its
  // failing readings are the finding's four.
  // =========================================================================
  it('F-20 §3.2 — THE CONSUMER-DRIVEN ARM (`ADV-RL-1`, HOST FIX, AUTHORED RED FIRST): the module’s own `reset(element)` on an ACTIVE gesture IS the invalid arm — ZERO reveals, exactly ONE sink write carrying the caller’s PRE-DRAG value BY IDENTITY, `stats().resets === 1`, and the session’s `reset` entered with ARITY THREE — driven for a last observation WITHIN proximity AND for one OUTSIDE it', async () => {
    const halves: ReadonlyArray<{ id: string; distance: number }> = [
      { id: '(a) the last observation is WITHIN proximity', distance: 1 },
      { id: '(b) the last observation is OUTSIDE proximity (the mirrored cell the finding names: a module that takes the completing branch writes ZERO sink values where exactly one is required)', distance: 999 },
    ]
    for (const half of halves) {
      const preDrag = { opaque: `the-caller-pre-drag/${half.id}` }
      const c = await compose(`F-20/${half.id}`, {
        candidatesFor: (): unknown => [answer(half.distance, { opaque: 'the-observed-candidate' })],
      })
      c.setPreDrag(preDrag)
      c.mod.attach(c.el, c.hookArgs)
      c.double.establish()
      const opsBeforeMove = c.double.ops.length
      c.double.move()
      const armAtTheMove = half.distance > 20
      if (armAtTheMove && c.double.ops.slice(opsBeforeMove).map((o) => o.op).join(',') !== 'reset') {
        expect(
          c.double.ops.slice(opsBeforeMove).map((o) => o.op),
          `F-20${half.id} — a move outside every candidate's proximity enters the session's own reset terminal FROM THE MODULE'S OWN MOVE TURN`,
        ).toEqual(['reset'])
      }
      let entry: RelocateResetResult | null = null
      let threw = false
      try {
        entry = c.mod.reset(c.el)
      } catch (e) {
        threw = true
        expect(`the consumer entry point THREW: ${describeThrown(e)}`, `F-20${half.id} — refusals are RETURNED, never thrown (§2.1 item 3)`).toBe(null)
      }
      expect(threw, `F-20${half.id} — the consumer entry point NEVER throws`).toBe(false)
      expect(
        entry === null ? null : Object.keys(entry).sort().join(','),
        `F-20${half.id} — the entry point returns a \`{ok, code, committed}\` RECORD in both halves`,
      ).toBe('code,committed,ok')
      const stats = c.stats()
      expect(
        c.revealArgs.length,
        `F-20${half.id}/ADV-RL-1 — \`onReveal\` reads ZERO on this arm: the reset terminal is the RULED terminal domain’s complement (§0A note 6), and the consumer-driven arm carries no reveal`,
      ).toBe(0)
      expect(
        stats.revealWrites,
        `F-20${half.id}/ADV-RL-1 — the module's own \`stats().revealWrites\` reads ZERO beside the consumer's own record (the two readings AGREE)`,
      ).toBe(0)
      expect(
        stats.resets,
        `F-20${half.id}/ADV-RL-1 — \`stats().resets\` reads exactly \`1\`: entering the session's own reset terminal from the CONSUMER'S entry point IS the invalid arm, and it is taken AT MOST ONCE per gesture`,
      ).toBe(1)
      expect(
        c.sinkArgs.length,
        `F-20${half.id}/ADV-RL-1 — the gesture owes EXACTLY ONE sink write: a last observation outside proximity must not silence it (the mirrored cell), and the consumer's entry point must not add a second`,
      ).toBe(1)
      expect(
        c.sinkArgs[0][1],
        `F-20${half.id}/ADV-RL-1 — the sink write carries the CALLER-SUPPLIED PRE-DRAG VALUE BY IDENTITY (never the resolved TARGET the completing branch commits)`,
      ).toBe(preDrag)
      expect(
        c.preDragCalls(),
        `F-20${half.id} — the pre-drag value is captured exactly ONCE per established gesture; the entry point never RE-reads the member (§2.1 item 7(b))`,
      ).toBe(1)
      if (!armAtTheMove) {
        expect(
          c.double.resets.length,
          `F-20${half.id}/ADV-RL-1 — the consumer-driven arm delegates to the session EXACTLY ONCE, so the session's own reset terminal is what runs`,
        ).toBe(1)
        expect(
          c.double.resets[0].arity,
          `F-20${half.id}/ADV-RL-1 — the delegation's ARITY is THREE (\`session.reset(element, handle, value)\`)`,
        ).toBe(3)
        expect(
          c.double.resets[0].value,
          `F-20${half.id}/ADV-RL-1 — the third argument is the CAPTURED pre-drag value by identity, so the arm's commit writer receives the caller's value rather than a two-argument delegation reading \`undefined\``,
        ).toBe(preDrag)
        expect(
          entry?.ok,
          `F-20${half.id} — an active gesture's consumer-driven arm reaches a RUNNING terminal, so the session answers \`ok: true\``,
        ).toBe(true)
      } else {
        expect(
          entry?.ok,
          `F-20${half.id} — the arm was already taken by the module's own move turn, so the session's slot is gone and the entry point's own delegation is REFUSED (\`ok: false\`) — the arm is never re-taken`,
        ).toBe(false)
      }
    }
  })

  // =========================================================================
  // `ADV-RL-7` (MEDIUM) — THE FIELD IS READ ONCE. **AUTHORED RED FIRST**
  // (`RCA-1`/`RCA-3`): the module reads `distance` once in a usability guard and again in
  // the comparison, so a varying getter is decided inconsistently.
  // =========================================================================
  it('F-21 §3.2 — THE `distance` FIELD IS READ ONCE (`ADV-RL-7`, HOST FIX, AUTHORED RED FIRST): an accessor that COUNTS its reads reads EXACTLY 1 over one observed move, and an accessor answering two DIFFERENT values is decided on the FIRST read', async () => {
    const variants: ReadonlyArray<{ id: string; first: number; later: unknown; firstWithin: boolean }> = [
      { id: '(a) `20` on the first read and `NaN` on every later one (the generator shape the audit names)', first: 20, later: NaN, firstWithin: true },
      { id: '(b) `1` on the first read and `999` on every later one — the FIRST read is WITHIN proximity', first: 1, later: 999, firstWithin: true },
    ]
    for (const variant of variants) {
      const counter = { reads: 0 }
      const shape: Record<string, unknown> = {
        candidate: { opaque: 'the-candidate' },
        get distance(): unknown {
          counter.reads += 1
          return counter.reads === 1 ? variant.first : variant.later
        },
      }
      const double = sessionDouble()
      const el: Record<string, unknown> = { control: `F-21/${variant.id}` }
      const mod = await makeModule(
        {
          session: double.sessionObject,
          candidatesFor: (): unknown => [shape],
          resolveTarget: (): unknown => ({ opaque: 'target' }),
          threshold: 20,
          commit: (): void => undefined,
          onReveal: (): void => undefined,
          onPreview: (): void => undefined,
        },
        'F-21',
      )
      mod.attach(el)
      double.setElement(el, 1)
      double.establish()
      double.move()
      expect(
        counter.reads,
        `F-21${variant.id} — the \`distance\` accessor was read ${counter.reads} time(s) over ONE observed move; the declared count is EXACTLY 1: the module reads the field ONCE and decides on that ONE value (a second read is a SECOND, possibly different, decision)`,
      ).toBe(1)
      if (variant.firstWithin) {
        expect(
          mod.stats().resets,
          `F-21${variant.id} — the FIRST read is WITHIN proximity (${variant.first} against the threshold 20), so the invalid arm must NOT be taken; \`stats().resets\` reads ${mod.stats().resets} — a module that reads the field twice decides on the LATER value and takes the arm`,
        ).toBe(0)
      }
      double.terminate()
      expect(
        mod.stats().revealWrites,
        `F-21${variant.id} — the gesture's last observation was WITHIN proximity on the FIRST reading, so the \`'end'\` terminal reveals once`,
      ).toBe(1)
    }
  })
})

// ===========================================================================
// §5.5.1 — THE REGISTER'S PRE HARNESS ROWS and the DECLARED-TABLE reconciliation.
// These rows are NOT spec rows: they exist so a red run's OWN instruments are proved
// to work before they are trusted, and so the register's declared arithmetic is
// machine-checkable (`§5.3` items 10/11, `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`).
// ===========================================================================
describe('PRE — the register’s own preconditions and its declared arithmetic (not spec rows)', () => {
  it('PRE-1 (harness) — the dynamic import boundary itself resolves and casts, proved against an EXISTING pure module', async () => {
    const existing = ['..', 'src', 'shared', 'census.js'].join('/')
    const mod = (await import(/* @vite-ignore */ existing)) as Record<string, unknown>
    expect(
      typeof mod['computeTrackVars'],
      'PRE-1 — the computed-specifier import boundary resolves against an EXISTING module, so every module-absent row below fails as an ASSERTION and never as a collection error that would take the whole red set down',
    ).toBe('function')
  })

  it('PRE-2 (harness) — the §5.5.1 register tables are the ones the spec specifies: the seed, the step constants, the caps, the FIFTEEN rows / SIXTEEN terms, the `170` total as the SUM OF ITS OWN TERMS, the strategy ids, and the `6 + 9 = 15` bounded split', () => {
    expect(SEED, 'PRE-2/§5.5.1 — the seed is the pinned literal `20260927`').toBe(20260927)
    expect(LCG_A, 'PRE-2/§5.5.1 — the LCG multiplier is the pinned literal').toBe(1664525)
    expect(LCG_C, 'PRE-2/§5.5.1 — the LCG increment is the pinned literal').toBe(1013904223)
    expect(LCG_MOD, 'PRE-2/§5.5.1 — the LCG modulus is `2³²`').toBe(4294967296)
    expect(REGISTER_ROW_CAP, 'PRE-2/§5.5.1 — the per-row cap is `<=100`').toBe(100)
    expect(REGISTER_TOTAL_CAP, 'PRE-2/§5.5.1 — the register cap is `<=400`').toBe(400)
    expect(CONSECUTIVE_FAILURE_CAP, 'PRE-2/§5.5.1 — the stop rule is 5 consecutive failures').toBe(5)
    expect(POOL_LENGTH, 'PRE-2/§5.5.1 — `pool.length === 15` (the pinned pool)').toBe(15)
    // THE DECLARED TOTAL IS THE SUM OF ITS OWN TERMS, printed term by term in register
    // order (`§5.5.3`): 21+14+12+3+8+21+5+11+5+6+3+14+7+4+30+6 = 170.
    const terms = REGISTER_DECLARED.map((r) => r.term)
    const total = terms.reduce((a, b) => a + b, 0)
    expect(
      total,
      `PRE-2/§5.5.3 — the declared total IS THE SUM OF ITS OWN TERMS: ${terms.join('+')} = 170`,
    ).toBe(170)
    expect(
      REGISTER_DECLARED.length,
      'PRE-2/§5.5.1 — the register enumerates SIXTEEN TERMS (the declared table holds one entry per term)',
    ).toBe(16)
    expect(
      Array.from(new Set(REGISTER_DECLARED.map((r) => r.row))).length,
      'PRE-2/§5.5.1 — and FIFTEEN ROWS (5 `IM` + 8 `SM` + 2 `TP`), because `P-RL-IM-3` alone carries TWO terms (`12` and `3`) — the row noun and the term noun are never conflated here',
    ).toBe(15)
    expect(
      [...REGISTER_ROWS].sort(),
      'PRE-2/§5.5.1 — the FIFTEEN row ids, in register order (a rename or a dropped row fails here)',
    ).toEqual(['P-RL-IM-1', 'P-RL-IM-2', 'P-RL-IM-3', 'P-RL-IM-4', 'P-RL-IM-5', 'P-RL-SM-1', 'P-RL-SM-2', 'P-RL-SM-3', 'P-RL-SM-4', 'P-RL-SM-5', 'P-RL-SM-6', 'P-RL-SM-7', 'P-RL-SM-8', 'P-RL-TP-1', 'P-RL-TP-2'].sort())
    expect(
      REGISTER_ROWS.join(','),
      'PRE-2/§5.5.1 — the row order is the REGISTER order the spec fixes (rows are evaluated SEQUENTIALLY in it)',
    ).toBe('P-RL-IM-1,P-RL-IM-2,P-RL-IM-3,P-RL-IM-4,P-RL-IM-5,P-RL-SM-1,P-RL-SM-2,P-RL-SM-3,P-RL-SM-4,P-RL-SM-5,P-RL-SM-6,P-RL-SM-7,P-RL-SM-8,P-RL-TP-1,P-RL-TP-2')
    expect(
      REGISTER_DECLARED.map((r) => `${r.row}::${r.strategy}`),
      'PRE-2/§5.5.1 — ONE strategy id per TERM, in register order; `P-RL-IM-3` carries `S-RL-PURE-1` (3a) and `S-RL-PURE-2` (3b), which is the spec’s own pairing',
    ).toEqual([
      'P-RL-IM-1::S-RL-ENUM-1', 'P-RL-IM-2::S-RL-ENUM-2', 'P-RL-IM-3::S-RL-PURE-1', 'P-RL-IM-3::S-RL-PURE-2',
      'P-RL-IM-4::S-RL-SET-1', 'P-RL-IM-5::S-RL-DIST-1', 'P-RL-SM-1::S-RL-REVEAL-1', 'P-RL-SM-2::S-RL-WRITER-1',
      'P-RL-SM-3::S-RL-SITE-1', 'P-RL-SM-4::S-RL-WINDOW-1', 'P-RL-SM-5::S-RL-RESET-1', 'P-RL-SM-6::S-RL-CHANNEL-1',
      'P-RL-SM-7::S-RL-INVALID-1', 'P-RL-SM-8::S-RL-CODES-1', 'P-RL-TP-1::S-RL-TOTAL-1', 'P-RL-TP-2::S-RL-SHAPES-1',
    ])
    // THE CAPS ARE COMPARED AGAINST THE **DECLARED** FIGURES, never the distinct ones.
    expect(total, 'PRE-2/§5.5.3 — the declared total is inside the `<=400` register cap').toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    for (const r of REGISTER_DECLARED) {
      expect(
        r.term,
        `PRE-2/§5.5.1 — the term of \`${r.row}\` (${r.strategy}) is inside the <=100 per-row cap`,
      ).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    }
    // THE `(bounded)` SET, named EXACTLY as `§5.5.1`'s block and `§5.5.2` item 2 name it.
    expect(
      REGISTER_DECLARED.filter((r) => r.bounded).map((r) => r.row).filter((v, i, a) => a.indexOf(v) === i),
      'PRE-2/§5.5.2 item 2 — the SIX `(bounded)` rows, named: `P-RL-IM-1` · `P-RL-IM-3` · `P-RL-IM-5` · `P-RL-SM-4` · `P-RL-SM-6` · `P-RL-TP-1`',
    ).toEqual(['P-RL-IM-1', 'P-RL-IM-3', 'P-RL-IM-5', 'P-RL-SM-4', 'P-RL-SM-6', 'P-RL-TP-1'])
    expect(
      REGISTER_UNBOUNDED_ROWS.slice().sort(),
      'PRE-2/§5.5.2 item 2 — the NINE unmarked rows, named as a LIST rather than as a bare count (the honest split is `6 + 9 = 15` ROWS)',
    ).toEqual(['P-RL-IM-2', 'P-RL-IM-4', 'P-RL-SM-1', 'P-RL-SM-2', 'P-RL-SM-3', 'P-RL-SM-5', 'P-RL-SM-7', 'P-RL-SM-8', 'P-RL-TP-2'].sort())
    expect(
      REGISTER_BOUNDED_ROWS.length + REGISTER_UNBOUNDED_ROWS.length,
      'PRE-2/§5.5.2 item 2 — the marked and unmarked sets sum to the register’s ROW count',
    ).toBe(REGISTER_ROWS.length)
    // THE DECLARED-VERSUS-DISTINCT LEDGER (`§5.5.2` item 3): one entry per TERM, the
    // declared figures equal to the declared table’s, and the distinct figures REPORTED
    // BESIDE them and NEVER substituted.
    expect(
      REGISTER_DISTINCT.map((d) => d.declared),
      'PRE-2/§5.5.2 item 3 — the ledger’s DECLARED column IS the declared term table (one entry per term, same order): the two figures are never conflated',
    ).toEqual(terms)
    for (const d of REGISTER_DISTINCT) {
      expect(
        d.distinct,
        `PRE-2/§5.5.2 item 3 — the DISTINCT figure of \`${d.row}\` (declared ${d.declared}) is reported BESIDE the declared one, and it is at most it`,
      ).toBeLessThanOrEqual(d.declared)
      expect(
        d.why.length,
        `PRE-2/§5.5.2 item 3 — the difference between the two figures of \`${d.row}\` is STATED rather than implied`,
      ).toBeGreaterThan(20)
    }
    expect(
      REGISTER_DISTINCT.reduce((a, d) => a + d.declared, 0),
      'PRE-2/§5.5.2 item 3 — the ledger’s declared column sums to the declared total as well',
    ).toBe(170)
    // THE PINNED-SEED GENERATOR'S FORM (`§5.5.1` strategy item 2, `§5.5.2` item 5).
    expect(
      FIRST_LCG_STATE,
      'PRE-2/§5.5.1 — the first LCG state from the pinned seed, recomputed from the pinned literals (a REPORTED arithmetic check on the pinned one-step form)',
    ).toBe((20260927 * 1664525 + 1013904223) % 4294967296)
    expect(
      BIASED_RESIDUE_COUNT,
      'PRE-2/§5.5.2 item 5 — `2³² mod 15 = 1`, so ONE pool index is reachable from `286331154` preimages and the remaining FOURTEEN from `286331153`: the generator’s ONE stated bias, recorded rather than hidden',
    ).toBe(1)
    expect(
      Math.ceil(LCG_STATE_SPACE / POOL_LENGTH),
      'PRE-2/§5.5.2 item 5 — the preimage count of the single heavier index is `ceil(2³²/15) = 286331154`',
    ).toBe(286331154)
    expect(
      DRAWN_INDICES.length,
      'PRE-2/§5.5.1 — the draw sequence holds `15` draws (one LCG step each), so one pool draw consumes exactly ONE step',
    ).toBe(15)
    for (const index of DRAWN_INDICES) {
      expect(
        index,
        'PRE-2/§5.5.1 — every drawn index is a member of the `15`-member pool (`index = state mod 15`)',
      ).toBeLessThan(POOL_LENGTH)
    }
    console.log(
      `§5.5.1 P-RL-TP-1 draw report :: ${JSON.stringify({
        seed: SEED,
        draws: DRAWN_INDICES.length,
        indices: DRAWN_INDICES,
        distinctMembersDrawn: DISTINCT_DRAWN_POOL_MEMBERS,
        assertsFullCoverage: false,
        note: 'A DRAW IS NOT A SWEEP: the distinct-member count is REPORTED, never asserted, and no row may claim all 15 members were drawn',
      })}`,
    )
  })

  it('PRE-3 (harness) — the register’s own declaration is the FIFTEEN rows / SIXTEEN terms of §5.5.1, and each row’s declared term(s) are what its own test reconciles against', () => {
    for (const row of REGISTER_ROWS) {
      const terms = declaredTermsOf(row)
      expect(
        terms.length,
        `PRE-3/§5.5.1 — row \`${row}\` declares at least ONE term (and exactly two only for \`P-RL-IM-3\`)`,
      ).toBeGreaterThan(0)
      expect(
        terms.length,
        `PRE-3/§5.5.1 — only \`P-RL-IM-3\` carries two terms; \`${row}\` carries ${terms.length}`,
      ).toBe(row === 'P-RL-IM-3' ? 2 : 1)
    }
    expect(
      REGISTER_ROWS.map((r) => `${r}=${declaredTermsOf(r).join('+')}`).join(' '),
      'PRE-3/§5.5.3 — the fifteen rows with their terms, printed so the audit reads them against the spec’s own enumeration',
    ).toBe('P-RL-IM-1=21 P-RL-IM-2=14 P-RL-IM-3=12+3 P-RL-IM-4=8 P-RL-IM-5=21 P-RL-SM-1=5 P-RL-SM-2=11 P-RL-SM-3=5 P-RL-SM-4=6 P-RL-SM-5=3 P-RL-SM-6=14 P-RL-SM-7=7 P-RL-SM-8=4 P-RL-TP-1=30 P-RL-TP-2=6')
  })

  it('PRE-4 (harness) — THE POOL-VERSUS-BOUNDARY CHECK RE-RUN against THIS FILE’s landed tables: every pool/table member satisfies its own row’s declared boundary text, and no member required a boundary narrowing', () => {
    // The rule the row enforces (`§5.5.2` item 7): *"a pool or table member that
    // CONTRADICTS its own row's declared boundary is a REGISTER DEFECT, and it is checked
    // at AUTHORING TIME, not at green time — the member must satisfy the row's boundary
    // text, or the row must declare that member as an intended class with its OWN expected
    // outcome asserted, PER MEMBER."*
    // Each row below declares (a) its boundary as a predicate, and (b) the members this
    // file actually drives. A member failing its own predicate is a REGISTER DEFECT and is
    // REPORTED rather than tuned away — at RED time the tables are still the ones declared
    // here, so the check is meaningful even before the module lands.
    type BoundaryCheck = { readonly row: string; readonly boundary: string; readonly members: readonly string[]; readonly satisfies: (member: string) => boolean }
    // **`ADV-RL-4` — THE PREDICATES ARE INDEPENDENTLY STATED, NEVER THE MEMBER LIST ECHOED.**
    // The as-filed form was `satisfies: (m) => [...the same members...].includes(m)`, i.e. each
    // member was checked against THE VERY ARRAY LITERAL it came from — so `defects` was EMPTY BY
    // CONSTRUCTION for ANY table, including one whose members contradicted the row's boundary,
    // and the check asserted nothing about the file. Every predicate below is a CLASS
    // RECOGNIZER written from the row's own boundary text: a member is satisfied iff its NAME
    // is one of the classes that text declares, and a member the boundary does not describe is
    // a DEFECT. The control at the foot of this row drives a foreign member (and the live
    // superseded one) through every predicate to show the check CAN report a defect.
    const SEVEN = ['session', 'candidatesFor', 'resolveTarget', 'onReveal', 'commit', 'threshold', 'onPreview']
    const isCandidatesForShape = (m: string): boolean => /^(callable-|absent$|undefined|non-callable|throwing)/.test(m)
    const isObservedPath = (m: string): boolean => /^(move$|establishment-no-move|cancel-after-one-move|attached-no-onstart-then-one-move)/.test(m)
    const isResolveTargetShape = (m: string): boolean => /^(callable-|absent$|non-callable|throwing|target-carried)/.test(m)
    const isDistanceClass = (m: string): boolean => /^(below|equal|above|hostile|usable-within|usable-outside|absent$|undefined|non-number|NaN|throwing-accessor|read-once)/.test(m)
    const isDeclaredMemberName = (m: string): boolean => SEVEN.includes(m)
    const isRevealPath = (m: string): boolean => /^(end-|reset$|cancel$|refused-terminal)/.test(m)
    const isCompositionShape = (m: string): boolean => /^(conformant|second-writer|slot-empty|same-function|consumer-own)/.test(m)
    const isObservationDrive = (m: string): boolean => /^(one-move|five-moves|five-outside-moves|control-)/.test(m)
    const isWindowStage = (m: string): boolean => /^(after-attach|after-establishment|at-the-terminal|slot-)/.test(m)
    const isResetArm = (m: string): boolean => /^(invalid-arm|end-arm-control|wrong-channel-control)/.test(m)
    const isMoveShape = (m: string): boolean => /^(into-proximity|same-zone-again|out-of-proximity|back-in|retarget|out-after-retarget|end-terminal|configuration-)/.test(m)
    const isInvalidityClass = (m: string): boolean => /^(no-candidates|all-outside|unusable-distances|timing-|sticky-control)/.test(m)
    const isRefusalClass = (m: string): boolean => /^(no-active-gesture|disposed-session|the-remaining-union-members|closed-set-control)/.test(m)
    const isTotalityInput = (m: string): boolean => /^(pool-member|the-15-member-pool|undefined$|null$|42$|x-string|true$|plain-object|array$|function$|symbol$|bigint$|frozen-empty-record|throwing-accessor|throwing-proxy|callable-returning-its-argument|record-with-one-callable-member|object-create-null|varying-get-proxy)/.test(m)
    const isArgumentShape = (m: string): boolean => /^(undefined|null|42|x$|throwing-Proxy|throwing-accessor|Object-create-null|varying-get)/.test(m)
    /** The `P-RL-TP-2` SHAPE IDS as the row's own table writes them, so the derivation below is
     *  from the LANDED table rather than from the member names this row keeps. */
    const isArgumentShapeId = (m: string): boolean => /^(undefined|null|42|'x'|a Proxy|a record)/.test(m)
    const checks: readonly BoundaryCheck[] = [
      { row: 'P-RL-IM-1', boundary: 'at most once per observed move, only from the move turn, and unusable ⇒ the invalid arm', members: ['callable-within', 'absent', 'non-callable', 'throwing'], satisfies: isCandidatesForShape },
      // **THE PATHS CELL'S MEMBERS ARE THE PATHS THE ROW NOW DRIVES** (`ADV-RL-6`: path `(d)` is
      // an ATTACHED element with no `onStart` and one observed move, NOT a refused attach), and
      // the predicate below is what catches the superseded name.
      { row: 'P-RL-IM-1/paths', boundary: 'the FOUR observable paths; the fifth path class is DECLARED NON-REACHING', members: ['move', 'establishment-no-move', 'cancel-after-one-move', 'attached-no-onstart-then-one-move'], satisfies: isObservedPath },
      { row: 'P-RL-IM-2', boundary: 'at most once per observed move, only within proximity, and unusable ⇒ no write and no throw', members: ['callable-target', 'absent', 'non-callable', 'throwing', 'target-carried-in-the-answer'], satisfies: isResolveTargetShape },
      { row: 'P-RL-IM-3', boundary: 'exactly one declared outcome per class pair, and the no-default clause; the HOSTILE class is a declared false limb', members: ['below', 'equal', 'above', 'hostile'], satisfies: isDistanceClass },
      { row: 'P-RL-IM-4', boundary: 'exactly seven named members, NAMED and ORDERED, no eighth, `capture` absent', members: SEVEN, satisfies: isDeclaredMemberName },
      { row: 'P-RL-IM-5', boundary: 'every unusable distance ⇒ nothing within proximity, never a throw; only the distance decides; the field is READ ONCE', members: ['usable-within', 'usable-outside', 'absent', 'undefined', 'non-number', 'NaN', 'throwing-accessor', 'read-once'], satisfies: isDistanceClass },
      { row: 'P-RL-SM-1', boundary: "exactly once per 'end', zero on every other path, and crossing-invariant", members: ['end-with-target', 'reset', 'cancel', 'refused-terminal', 'end-with-undefined-target'], satisfies: isRevealPath },
      { row: 'P-RL-SM-2', boundary: 'the declared count per composition shape, with the divergence as the falsifier', members: ['conformant', 'second-writer', 'slot-empty', 'same-function-two-channels', 'consumer-own-hook-write'], satisfies: isCompositionShape },
      { row: 'P-RL-SM-3', boundary: 'the only call site is the commit seam; crossing-invariant', members: ['one-move', 'five-moves', 'five-outside-moves', 'control-from-start-or-move', 'control-twice-from-the-seam'], satisfies: isObservationDrive },
      { row: 'P-RL-SM-4', boundary: 'captured exactly once at establishment; nothing retained; the post-terminal reading is PER SLOT', members: ['after-attach', 'after-establishment', 'at-the-terminal', 'slot-end', 'slot-reset'], satisfies: isWindowStage },
      { row: 'P-RL-SM-5', boundary: 'the revert’s CHANNEL is the per-move one, and no reveal occurs on that arm', members: ['invalid-arm', 'end-arm-control', 'wrong-channel-control'], satisfies: isResetArm },
      { row: 'P-RL-SM-6', boundary: 'at most one per move, zero at a terminal, never the reveal, hide-plus-show is ONE turn, and the ordered gesture is driven as ONE gesture', members: ['into-proximity', 'same-zone-again', 'out-of-proximity', 'back-in', 'retarget', 'out-after-retarget', 'end-terminal', 'configuration-ordered-gesture', 'configuration-standalone'], satisfies: isMoveShape },
      { row: 'P-RL-SM-7', boundary: 'at most once per gesture, from the move turn while active; a later release commits nothing; the two release TIMINGS are two drives', members: ['no-candidates', 'all-outside', 'unusable-distances', 'timing-release-after-the-arm', 'timing-same-turn-release', 'sticky-control'], satisfies: isInvalidityClass },
      { row: 'P-RL-SM-8', boundary: 'the session’s own codes verbatim; no module-local code', members: ['no-active-gesture', 'disposed-session', 'the-remaining-union-members', 'closed-set-control'], satisfies: isRefusalClass },
      { row: 'P-RL-TP-1', boundary: 'no method throws, with the two named propagations as the bound; the pool members are totality inputs only', members: ['pool-member'], satisfies: isTotalityInput },
      { row: 'P-RL-TP-2', boundary: 'every entry point returns its declared shape for every argument shape', members: ['undefined', 'null', '42', 'x', 'throwing-Proxy', 'throwing-accessor', 'Object-create-null', 'varying-get-Proxy'], satisfies: isArgumentShape },
    ]
    const defects: string[] = []
    for (const check of checks) {
      expect(
        check.members.length,
        `PRE-4/§5.5.2 item 7 — \`${check.row}\`'s table is NON-EMPTY, so its boundary check is not vacuous`,
      ).toBeGreaterThan(0)
      for (const member of check.members) {
        if (!check.satisfies(member)) defects.push(`${check.row} :: ${member} contradicts the declared boundary "${check.boundary}"`)
      }
    }
    expect(
      defects,
      'PRE-4/§5.5.2 item 7 — THE POOL-VERSUS-BOUNDARY CHECK IS CLEAN for all FIFTEEN rows against THIS file’s landed tables: every member satisfies an INDEPENDENTLY STATED predicate derived from its row’s declared boundary text, and no member required a boundary narrowing. A defect here is a REGISTER DEFECT to be REPORTED, never tuned to green',
    ).toEqual([])
    // **THE ORDER HALF OF `P-RL-IM-4`'s OWN BOUNDARY** (`ADV-RL-5`): the row's word ORDERED is
    // asserted HERE, against the declared order BY NAME, rather than left unasserted.
    expect(
      checks.find((c) => c.row === 'P-RL-IM-4')?.members.join(','),
      'PRE-4/P-RL-IM-4 — the seven members are listed in the DECLARED ORDER (`session` · `candidatesFor` · `resolveTarget` · `onReveal` · `commit` · `threshold` · `onPreview`), never in a sorted or arbitrary order',
    ).toBe(SEVEN.join(','))
    // **THE CONTROL THAT SHOWS THE CHECK CAN REPORT A DEFECT** (`ADV-RL-4`): every predicate
    // must answer `false` for a member name the boundary does not describe, and the LIVE
    // superseded name must be caught by the one row that once drove it.
    const blindPredicates = checks.filter((c) => c.satisfies('a-member-the-boundary-does-not-describe')).map((c) => c.row)
    expect(
      blindPredicates,
      `PRE-4 (CONTROL) — EVERY row's predicate answers \`false\` for a member name its boundary does not describe, so \`defects\` can actually be non-empty (a predicate that accepts anything is the tautology this repair removes): ${JSON.stringify(blindPredicates)}`,
    ).toEqual([])
    expect(
      checks.find((c) => c.row === 'P-RL-IM-1/paths')?.satisfies('refused-establishment'),
      'PRE-4 (CONTROL, the LIVE defect this repair exists to catch) — the SUPERSEDED path-`(d)` member `refused-establishment` is NOT a path this row declares any more (the path is re-authored as an attached element with no `onStart` and one observed move, `ADV-RL-6`), so the predicate must report a DEFECT for it',
    ).toBe(false)
    // The TP-1 pool's members, NAMED, so the check above is not a placeholder: the two
    // PROPAGATION shapes are deliberately NOT in the pool (`§5.5.2` item 7's TP-1 cell).
    expect(
      TP1_POOL.length,
      'PRE-4/§5.5.1 P-RL-TP-1 — the pool holds FIFTEEN members, in the spec’s own order',
    ).toBe(15)
    expect(
      TP1_POOL.map((m) => m.id),
      'PRE-4/§5.5.1 P-RL-TP-1 — the pool’s members, in the fixed order the spec enumerates them',
    ).toEqual([
      'undefined', 'null', '42', 'x-string', 'true', 'plain-object', 'array', 'function', 'symbol', 'bigint',
      'frozen-empty-record', 'throwing-accessor', 'throwing-proxy', 'callable-returning-its-argument', 'record-with-one-callable-member',
    ])
    // **THE MEMBERS ARE DERIVED FROM THE ROWS' OWN LANDED TABLES** (`ADV-RL-4`: *"derive each
    // row's driven members from that row's own table and test them against an independently
    // stated boundary predicate"*) — the pool and the shape list are read from the SAME objects
    // the register rows drive, never from a parallel hand-kept list.
    expect(
      TP1_POOL.map((m) => m.id).filter((id) => !isTotalityInput(id)),
      'PRE-4/P-RL-TP-1 — every member of the LANDED pool names a totality input the row’s boundary describes (the predicate is stated independently of the pool)',
    ).toEqual([])
    expect(
      TP2_SHAPES.map((m) => m.id).filter((id) => !isArgumentShapeId(id)),
      'PRE-4/P-RL-TP-2 — every member of the LANDED shape table names an argument shape the row’s boundary describes',
    ).toEqual([])
    expect(
      TP1_POOL.filter((m) => m.id === 'throwing-commit' || m.id === 'throwing-preview').length,
      'PRE-4/§5.5.2 item 7 (TP-1’s own cell) — the shapes that make `commit`/`onPreview` throw are NOT in the pool: the two propagation bounds are stated in the row’s own words rather than left implicit',
    ).toBe(0)
    // `P-RL-TP-2`'s six argument shapes, and the entry-point drive each one runs.
    expect(
      TP2_SHAPES.length,
      'PRE-4/§5.5.1 P-RL-TP-2 — SIX argument shapes × one drive each, with all four entry-point calls as assertions INSIDE the drive',
    ).toBe(6)
  })
})

// ===========================================================================
// §5.5.1 — THE REGISTER TABLES (the pinned inputs each row drives). Setup is NOT counted
// as an attempt: constructing a session double, building a spy or snapshotting state is
// precondition (`§5.5.3`).
// ===========================================================================
/** `P-RL-TP-1` — the pinned `15`-member pool, in the spec’s fixed order. The hostile
 *  shapes are FIXED table members (strategy item 6(b)): no `Proxy` whose traps return
 *  inconsistent answers across reads is in the pool. */
const TP1_POOL: ReadonlyArray<{ readonly id: string; readonly make: () => unknown }> = [
  { id: 'undefined', make: (): unknown => undefined },
  { id: 'null', make: (): unknown => null },
  { id: '42', make: (): unknown => 42 },
  { id: 'x-string', make: (): unknown => 'x' },
  { id: 'true', make: (): unknown => true },
  { id: 'plain-object', make: (): unknown => ({}) },
  { id: 'array', make: (): unknown => [] },
  { id: 'function', make: (): unknown => (): void => undefined },
  { id: 'symbol', make: (): unknown => Symbol('pool-member') },
  { id: 'bigint', make: (): unknown => 12n },
  { id: 'frozen-empty-record', make: (): unknown => Object.freeze({}) },
  { id: 'throwing-accessor', make: (): unknown => ({ get anyMember(): never { throw new Error('a throwing accessor') } }) },
  { id: 'throwing-proxy', make: (): unknown => new Proxy({}, { get: (): never => { throw new Error('a hostile trap') }, has: (): never => { throw new Error('a hostile trap') } }) },
  { id: 'callable-returning-its-argument', make: (): unknown => (arg: unknown): unknown => arg },
  { id: 'record-with-one-callable-member', make: (): unknown => ({ oneMember: (): void => undefined }) },
]
/** `P-RL-TP-2` — the pinned SIX argument shapes. */
const TP2_SHAPES: ReadonlyArray<{ readonly id: string; readonly make: () => unknown }> = [
  { id: 'undefined (the argument omitted)', make: (): unknown => undefined },
  { id: 'null', make: (): unknown => null },
  { id: '42', make: (): unknown => 42 },
  { id: "'x'", make: (): unknown => 'x' },
  { id: 'a Proxy whose traps THROW', make: (): unknown => new Proxy({}, { get: (): never => { throw new Error('a hostile trap') }, has: (): never => { throw new Error('a hostile trap') } }) },
  { id: 'a record with a throwing accessor', make: (): unknown => ({ get session(): never { throw new Error('a throwing accessor') } }) },
]

// ===========================================================================
// §5.5.1 — THE REGISTER ROWS, IN REGISTER ORDER (`§4.2` item 5). Each `it` title carries
// the row id AND its strategy id; each row logs its own `§5.5.1` record line and
// reconciles its executed attempt count against its DECLARED term.
// ===========================================================================
describe('§5.5.1 — the typed property register (15 rows / 16 terms, executed deterministically, no PBT harness)', () => {
  it('P-RL-IM-1 [S-RL-ENUM-1] — EVERY `candidatesFor` shape × EVERY observation path: the seam’s CALL COUNT and the INVALID-ARM outcome are EXACTLY the declared pair (21 declared attempts; bounded — the property text says “every observation path” while the table drives 5 paths, 4 observable)', async () => {
    const rec = new RegisterRow('P-RL-IM-1', 'S-RL-ENUM-1')
    const moduleState = await resolveModule()
    // **S4 — THE TWO WORDS, AND WHY SHAPE `(3)`'s DECLARED CELLS MOVED `0` → `1` ON THE
    // REACHING PATHS** (`§0A` note 15 item `S4`; `§3.2 F-15`; `§5.5.1 P-RL-IM-1`'s own cell):
    // ATTEMPTED = the module TRIED to consult the seam — counted ONCE PER OBSERVED MOVE
    // wherever the member carried a value OTHER THAN `undefined`, INCLUDING a NON-CALLABLE
    // (`42`) and a callable that THROWS; INVOKED = it was ACTUALLY CALLED, which happens only
    // where a callable was present. THE ONLY NON-ATTEMPT FORM IS THE MEMBER ABSENT OR CARRIED
    // WITH THE VALUE `undefined` (shape `(2)`), which reads `0`. THE DRIVES DO NOT CHANGE:
    // the term stays `21` = the same `4` shapes × `4` paths + the same `5` further drives.
    const shapes: ReadonlyArray<{ id: string; make: () => unknown; attemptsTheSeam: boolean }> = [
      { id: '(1) a callable returning a well-formed answer whose distance is within proximity', make: () => (): unknown => [answer(1)], attemptsTheSeam: true },
      { id: '(2) ABSENT (or carried as `undefined`) — the ONLY non-attempt form', make: () => undefined, attemptsTheSeam: false },
      { id: '(3) NON-CALLABLE (42) — an ATTEMPT with NO invocation (`S4`)', make: () => 42, attemptsTheSeam: true },
      { id: '(4) a callable THROWING', make: () => (): never => { throw new Error('a throwing candidatesFor') }, attemptsTheSeam: true },
    ]
    const paths: ReadonlyArray<{ id: string; drive: (d: SessionDouble, el: unknown) => void; callsDeclared: number; armDeclared: number; gesturesDeclared: number }> = [
      { id: '(a) one observed move with an established gesture', drive: (d, el): void => { d.setElement(el, 1); d.establish(); d.move() }, callsDeclared: 1, armDeclared: -1, gesturesDeclared: 1 },
      { id: '(b) an ESTABLISHMENT with no move', drive: (d, el): void => { d.setElement(el, 1); d.establish() }, callsDeclared: 0, armDeclared: 0, gesturesDeclared: 1 },
      { id: '(c) a `cancel` after one move', drive: (d, el): void => { d.setElement(el, 1); d.establish(); d.move(); d.cancel() }, callsDeclared: 1, armDeclared: -1, gesturesDeclared: 1 },
      // **`ADV-RL-6` — PATH `(d)` IS RE-AUTHORED.** As filed it was driven with
      // `installAccepts: false` — a REFUSED ATTACH — so the module was never installed, the
      // `move` reached no wrapper and BOTH cells were vacuous, while `armDeclared: -1` left the
      // *"no invalidity"* half unasserted. The path now drives what the row declares: an
      // ATTACHED element that never saw `onStart`, then ONE OBSERVED MOVE — so the declared
      // pair (`candidateCalls === 0`, no invalidity) is READ rather than assumed.
      { id: '(d) an ATTACHED element with NO `onStart` (never established), then one observed move', drive: (d, el): void => { d.setElement(el, 1); d.move() }, callsDeclared: 0, armDeclared: 0, gesturesDeclared: 0 },
    ]
    for (const shape of shapes) {
      for (const path of paths) {
        rec.run(`${shape.id} × ${path.id}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          const mod = create({
            session: double.sessionObject,
            candidatesFor: shape.make(),
            resolveTarget: (): unknown => ({ opaque: 'target' }),
            threshold: 20,
            commit: (): void => undefined,
            onReveal: (): void => undefined,
            onPreview: (): void => undefined,
          })
          const attached = mod.attach(el)
          if (attached !== true) {
            return `the composition's own \`attach\` returned ${String(attached)} although the session double accepts the install, so no path of this row can be driven (a non-attached module reaches NO wrapper and every cell would be vacuous — ADV-RL-6)`
          }
          path.drive(double, el)
          const stats = mod.stats()
          // The declared CALL COUNT for the cell: an ATTEMPT wherever the member carried a
          // value other than `undefined` (shape `(3)`'s non-callable INCLUDED — `S4`), and
          // `0` ONLY where the member is absent/`undefined` or the path never reaches the move
          // turn at all.
          const declaredCalls = path.callsDeclared === 0 ? 0 : shape.attemptsTheSeam ? 1 : 0
          if (stats.candidateCalls !== declaredCalls) {
            return `\`stats().candidateCalls\` reads ${stats.candidateCalls}; the declared count for this cell is ${declaredCalls} (the seam is called AT MOST ONCE per observed move and ONLY from the module’s own move turn — never at establishment, never at a terminal, never on a cancel, never on a refused establishment)`
          }
          // **THE DECLARED GESTURE COUNT** (`ADV-RL-6`; the audit's generator item 1: an
          // establishment that never ran counts NO gesture and leaves NO record).
          if (stats.gestures !== path.gesturesDeclared) {
            return `\`stats().gestures\` reads ${stats.gestures}; the declared count for this path is ${path.gesturesDeclared} — an establishment whose \`onStart\` never ran counts NO gesture and leaves NO per-gesture record`
          }
          // The declared ARM outcome for the cell.
          if (path.armDeclared !== -1 && stats.resets !== path.armDeclared) {
            return `\`stats().resets\` reads ${stats.resets}; the declared outcome for this path is ${path.armDeclared} (the arm is reachable only where an observed move reached the seam)`
          }
          if (path.id.startsWith('(a)') || path.id.startsWith('(c)')) {
            const armExpected = shape.attemptsTheSeam && shape.id.startsWith('(1)') ? 0 : 1
            if (stats.resets !== armExpected) {
              return `\`stats().resets\` reads ${stats.resets}; an unusable seam yields the EMPTY candidate set ⇒ nothing within proximity ⇒ the INVALID ARM AT ONCE, and a within-proximity answer takes it not at all (declared ${armExpected})`
            }
            if (stats.revealWrites !== 0 && armExpected === 1) {
              return `the invalid arm wrote a reveal (${stats.revealWrites}): the arm’s declared outcome carries ZERO reveals`
            }
          }
          return null
        })
      }
    }
    // THE FIVE FURTHER DRIVES, each declaring its own count.
    const further: ReadonlyArray<{ id: string; body: () => string | null }> = [
      {
        id: '(e) TWO sequential observed moves ⇒ 2 calls (the multiplicity that falsifies an instance-level cache)',
        body: (): string | null => {
          const double = sessionDouble()
          const el = { control: 'e' }
          double.setElement(el, 1)
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.establish()
          double.move()
          double.move()
          return mod.stats().candidateCalls === 2 ? null : `the seam was called ${mod.stats().candidateCalls} time(s) over TWO observed moves; the declared count is 2 (an instance-level cache FAILS here)`
        },
      },
      {
        id: '(f) a move FOLLOWING a stuck invalid arm ⇒ 1 call for the gesture and 0 further resets',
        body: (): string | null => {
          const double = sessionDouble()
          const el = { control: 'f' }
          double.setElement(el, 1)
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(999)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.establish()
          double.move()
          double.move()
          if (mod.stats().resets !== 1) return `the arm was taken ${mod.stats().resets} time(s), not ONCE: the refusal is STICKY`
          if (mod.stats().candidateCalls !== 2) return `the seam was called ${mod.stats().candidateCalls} time(s); the declared count over two observed moves is 2 (the seam is still consulted after the arm has stuck)`
          return null
        },
      },
      {
        id: '(g) shape (1) whose answer carries FIVE candidates, exactly ONE within proximity ⇒ 1 call and exactly one within-proximity decision',
        body: (): string | null => {
          const double = sessionDouble()
          const el = { control: 'g' }
          double.setElement(el, 1)
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(99), answer(98), answer(1), answer(97), answer(96)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.establish()
          double.move()
          if (mod.stats().candidateCalls !== 1) return `the seam was called ${mod.stats().candidateCalls} time(s); the declared count is 1 — ONE call per observed move, whatever the answer’s length`
          if (mod.stats().resets !== 0) return `the arm was taken although exactly ONE of the five candidates is within proximity`
          return null
        },
      },
      {
        id: '(h) shape (1) whose answer carries ZERO candidates ⇒ 1 call and the invalid arm',
        body: (): string | null => {
          const double = sessionDouble()
          const el = { control: 'h' }
          double.setElement(el, 1)
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.establish()
          double.move()
          if (mod.stats().candidateCalls !== 1) return `the seam was called ${mod.stats().candidateCalls} time(s); the declared count is 1`
          if (mod.stats().resets !== 1) return `the empty answer did not take the invalid arm (resets reads ${mod.stats().resets})`
          return null
        },
      },
      {
        id: '(i) shape (1) whose answer is well-formed but whose distance is unusable ⇒ 1 call and the invalid arm (shared with P-RL-IM-5 and counted in BOTH terms)',
        body: (): string | null => {
          const double = sessionDouble()
          const el = { control: 'i' }
          double.setElement(el, 1)
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(NaN)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.establish()
          double.move()
          if (mod.stats().candidateCalls !== 1) return `the seam was called ${mod.stats().candidateCalls} time(s); the declared count is 1`
          if (mod.stats().resets !== 1) return `an unusable distance did not take the invalid arm (resets reads ${mod.stats().resets})`
          return null
        },
      },
    ]
    for (const drive of further) rec.run(drive.id, drive.body)
    rec.finish()
    reconcile(rec, 21, 'P-RL-IM-1 — the declared term is `21` (`4` shapes × `4` paths + `5` further drives)')
  })

  it('P-RL-IM-2 [S-RL-ENUM-2] — EVERY `resolveTarget` shape × EVERY gesture configuration: the seam’s CALL COUNT and the WRITE COUNT are EXACTLY the declared ones, no default target/candidate-set/reveal-state exists anywhere (14 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-IM-2', 'S-RL-ENUM-2')
    const moduleState = await resolveModule()
    const shapes: ReadonlyArray<{ id: string; make: () => unknown; callsDeclared: number; writesDeclared: number }> = [
      { id: '(1) a callable returning an opaque target OBJECT', make: () => (): unknown => ({ opaque: 'target' }), callsDeclared: 1, writesDeclared: 1 },
      { id: '(2) ABSENT', make: () => undefined, callsDeclared: 0, writesDeclared: 0 },
      { id: '(3) NON-CALLABLE (42)', make: () => 42, callsDeclared: 1, writesDeclared: 0 },
      { id: '(4) a callable THROWING', make: () => (): never => { throw new Error('a throwing resolveTarget') }, callsDeclared: 1, writesDeclared: 0 },
    ]
    const configurations: ReadonlyArray<{ id: string; candidates: () => unknown }> = [
      { id: '(i) the target is resolved DURING the gesture (the PINNED reading)', candidates: () => [answer(1)] },
      { id: '(ii) the target is carried in the candidate answer and resolved at the move anyway', candidates: () => [answer(1, { opaque: 'candidate-with-a-carried-target' })] },
    ]
    for (const shape of shapes) {
      for (const configuration of configurations) {
        rec.run(`${shape.id} × ${configuration.id}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          const mod = create({ session: double.sessionObject, candidatesFor: configuration.candidates, resolveTarget: shape.make(), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          if (shape.id.startsWith('(2)')) {
            // ABSENT: the seam is not a member of the options object at all, so the module
            // cannot call it — and the shape's own declaration is 0 calls.
            // **`ADV-RL-3` — THE TWO CONFIGURATIONS ARE NOW TWO DRIVES.** As filed, BOTH ran the
            // byte-identical body below, so the row drove ONE path twice while its own cell
            // declares two distinct ones. The distinguishing dimension IS the answer's shape:
            // configuration `(ii)` carries a TARGET-SHAPED object in the candidate field, and
            // with the seam ABSENT the module must still resolve NOTHING and write NOTHING —
            // the carried candidate is NOT a default target (`F-16`, `P-8`).
            const carried = configuration.id.startsWith('(ii)') ? { opaque: 'a-carried-target-shaped-candidate' } : undefined
            const written: unknown[] = []
            const mod2 = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1, carried)], threshold: 20, commit: (_g: unknown, v: unknown): void => void written.push(v), onReveal: (): void => undefined, onPreview: (): void => undefined })
            const el2: Record<string, unknown> = { control: 'absent' }
            mod2.attach(el2)
            double.setElement(el2, 1)
            double.establish()
            double.move()
            // THE COMMITTING TERMINAL IS DRIVEN TOO, so the zero-write reading is about a
            // terminal that RAN (as filed the drive stopped at the move, and the cell declared
            // a TERMINAL write count it never gave the gesture a terminal to produce).
            double.terminate()
            if (mod2.stats().resolveCalls !== 0) return `with the seam ABSENT the module attempted ${mod2.stats().resolveCalls} call(s); the declared count is 0`
            if (mod2.stats().sinkCalls !== 0) return `with the seam ABSENT the terminal wrote ${mod2.stats().sinkCalls} time(s); the declared write count is 0 and it is NOT a cancel`
            if (carried !== undefined) {
              if (written.length !== 0) return `the ABSENT-seam configuration carrying a candidate object wrote ${written.length} sink value(s); the declared write count is 0`
              if (written.includes(carried)) return 'the terminal committed the object the CANDIDATE field carried: with the seam ABSENT there is no resolved target, and a carried candidate is NEVER a default target (`P-8`, `F-16`)'
              if (double.terminals.length !== 1 || double.terminals[0].outcome !== 'end') {
                return `the configuration-(ii) drive did not reach a committing terminal (the session's own log reads ${JSON.stringify(double.terminals.map((t) => t.outcome))}), so the zero-write reading above is not about a terminal`
              }
            } else if (double.terminals.length !== 1 || double.terminals[0].outcome !== 'end') {
              return `the configuration-(i) drive did not reach a committing terminal (the session's own log reads ${JSON.stringify(double.terminals.map((t) => t.outcome))})`
            }
            return null
          }
          double.move()
          const stats = mod.stats()
          if (stats.resolveCalls !== shape.callsDeclared) return `\`stats().resolveCalls\` reads ${stats.resolveCalls}; the declared count for this shape is ${shape.callsDeclared} — the seam is called AT MOST ONCE PER OBSERVED MOVE and ONLY for a move whose answer places the pane within proximity`
          double.terminate()
          const after = mod.stats()
          if (after.sinkCalls !== shape.writesDeclared) return `\`stats().sinkCalls\` reads ${after.sinkCalls}; the declared write count is ${shape.writesDeclared} (with an unusable \`resolveTarget\` the committing terminal writes NOTHING and does NOT throw — so NO DEFAULT TARGET, NO DEFAULT CANDIDATE SET and NO DEFAULT REVEAL STATE exists anywhere)`
          return null
        })
      }
    }
    // THE SIX FURTHER DRIVES.
    const further: ReadonlyArray<{ id: string; body: () => string | null }> = [
      {
        id: '(a) a callable returning `undefined` ⇒ 0 sink writes and NOT a cancel',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble()
          const el = { control: 'a' }
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => undefined, threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          double.terminate()
          if (mod.stats().sinkCalls !== 0) return `\`undefined\` produced ${mod.stats().sinkCalls} sink call(s); the declared count is 0`
          if (double.terminals.length !== 1 || double.terminals[0].outcome !== 'end') {
            return 'the terminal was NOT a committing terminal: it is NOT a cancel (the recording session’s own terminal log must carry exactly one `\'end\'`; the install-options `commit` member the double used to read does not exist on the frozen surface, §2.5 item 7 clauses 1–3)'
          }
          return null
        },
      },
      {
        id: '(b) a callable returning a target, on a gesture with TWO within-proximity moves ⇒ 2 calls and the SECOND target is the one the terminal writes',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const first = { opaque: 'the-first-target' }
          const second = { opaque: 'the-second-target' }
          let n = 0
          const written: unknown[] = []
          const double = sessionDouble()
          const el = { control: 'b' }
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => (n++ === 0 ? first : second), threshold: 20, commit: (_g: unknown, v: unknown): void => void written.push(v), onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          double.move()
          if (mod.stats().resolveCalls !== 2) return `\`stats().resolveCalls\` reads ${mod.stats().resolveCalls}; the declared count over two within-proximity moves is 2`
          double.terminate()
          if (written[0] !== second) return 'the terminal wrote a target other than the SECOND (last) resolved one'
          return null
        },
      },
      {
        id: '(c) a callable returning a DIFFERENT target on the second move ⇒ the reveal receives the LAST target (`toBe`)',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const first = { opaque: 'A' }
          const second = { opaque: 'B' }
          let n = 0
          const revealed: unknown[] = []
          const double = sessionDouble()
          const el = { control: 'c' }
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => (n++ === 0 ? first : second), threshold: 20, commit: (): void => undefined, onReveal: (target: unknown): void => void revealed.push(target), onPreview: (): void => undefined })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          double.move()
          double.terminate()
          if (revealed[0] !== second) return 'the reveal received a target other than the LAST resolved one (identity, `toBe`)'
          return null
        },
      },
      {
        id: '(d) a move OUTSIDE proximity ⇒ 0 calls for that move',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble()
          const el = { control: 'd' }
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(999)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          if (mod.stats().resolveCalls !== 0) return `the seam was called ${mod.stats().resolveCalls} time(s) for a move OUTSIDE proximity; the declared count is 0`
          return null
        },
      },
      {
        id: '(e) the options object carrying an EIGHTH member ⇒ the row FAILS (the set claim, shared with `P-RL-IM-4` and counted here too)',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble()
          const el = { control: 'e' }
          const declaredSeven = ['session', 'candidatesFor', 'resolveTarget', 'onReveal', 'commit', 'threshold', 'onPreview']
          const options: Record<string, unknown> = {}
          const defaults: Record<string, unknown> = { session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), onReveal: (): void => undefined, commit: (): void => undefined, threshold: 20, onPreview: (): void => undefined }
          for (const name of declaredSeven) options[name] = defaults[name]
          // **`ADV-RL-5` — THE EIGHTH MEMBER IS A THROWING ACCESSOR**, and the control's reading
          // is MODULE-SIDE: a module that copies or iterates the record TOUCHES it, and a module
          // that honours it calls the callable beside it. *(The as-filed form read
          // `Object.keys` over the row's own literal and then only its own `candidatesFor`
          // count — unfalsifiable for the module, `ADV-RL-5`.)*
          let eighthMemberReads = 0
          let distanceForCalls = 0
          Object.defineProperty(options, 'distanceFor', {
            enumerable: true,
            configurable: true,
            get: (): unknown => {
              eighthMemberReads += 1
              throw new Error('the eighth member was READ — it must be ignored')
            },
          })
          Object.defineProperty(options, 'distancePolicy', {
            enumerable: true,
            configurable: true,
            get: (): unknown => (): unknown => {
              distanceForCalls += 1
              return 1
            },
          })
          const keySet = Object.keys(options)
          if (keySet.length !== 9) return `the control options object carries ${keySet.length} members; the control is malformed`
          if (keySet.slice(0, 7).join(',') !== declaredSeven.join(',')) return `the control's own record must carry the SEVEN declared names IN THE DECLARED ORDER before the eighth member; it reads ${JSON.stringify(keySet)}`
          const extra = keySet.filter((k) => !declaredSeven.includes(k))
          if (extra.length !== 2) return `the eighth-member control must contribute exactly TWO extra names; it contributed ${JSON.stringify(extra)}`
          const mod = create(options)
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          if (eighthMemberReads !== 0) return `the eighth member's throwing accessor was READ ${eighthMemberReads} time(s) (it threw, so the module read it): the extra member is IGNORED, never read`
          if (distanceForCalls !== 0) return 'the eighth member was HONOURED (its callable was invoked): the declared module half is that the extra member is IGNORED'
          if (mod.stats().candidateCalls !== 1) return 'the module did not consult its own declared `candidatesFor` member in the eighth-member control'
          if (mod.stats().resets !== 0) return `the eighth member changed the composition's own behaviour (\`stats().resets\` reads ${mod.stats().resets}); the extra member is IGNORED`
          return null
        },
      },
      {
        id: '(f) the options object missing `resolveTarget` altogether ⇒ 0 calls and 0 writes, with the invalid arm NOT taken — the distinction between “no target” and “no proximity”',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble()
          const el = { control: 'f' }
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          double.terminate()
          if (mod.stats().resolveCalls !== 0) return `\`stats().resolveCalls\` reads ${mod.stats().resolveCalls}; the declared count with the seam missing is 0`
          if (mod.stats().sinkCalls !== 0) return `\`stats().sinkCalls\` reads ${mod.stats().sinkCalls}; the declared write count is 0`
          if (mod.stats().resets !== 0) return `the invalid arm was taken (resets reads ${mod.stats().resets}) although the answer WAS within proximity: there is simply nothing to resolve — the distinction between “no target” and “no proximity” is this row’s sharpest cell`
          return null
        },
      },
    ]
    for (const drive of further) rec.run(drive.id, drive.body)
    rec.finish()
    reconcile(rec, 14, 'P-RL-IM-2 — the declared term is `14` (`4` shapes × `2` configurations + `6` further drives)')
  })

  it('P-RL-IM-3 [S-RL-PURE-1 + S-RL-PURE-2] — the `threshold` row, TWO HALVES each with its own term: (3a) EVERY `(distance, threshold)` class pair answers EXACTLY ONE declared outcome without throwing — the FINITE-NEGATIVE limb and the ±Infinity limb deciding their own cells, with the HOSTILE class declared PER VARIANT because `-Infinity` reaches the comparison VERBATIM (`§0A` note 16) — (12 declared attempts; bounded); (3b) the NO-DEFAULT clause — `threshold` is READ, and no default, no unit string and no mechanism-side distance computation exists (3 declared attempts)', async () => {
    // `P-RL-IM-3` is the ONE row carrying TWO TERMS (`12` and `3`), each with its OWN
    // strategy — so this row emits TWO records. **BOTH RECORDS ARE EMITTED AFTER THEIR OWN
    // DRIVES RUN (REPAIRED 2026-09-27):** the as-filed harness called `finish()` on both
    // halves BEFORE driving anything, so both records reported `attemptsRun 0` /
    // `notStarted true` and the row could never be satisfied by any module — while the
    // register's own attribution rule (`§5.5.1` strategy item 3, `§4.2` item 2) is that an
    // UN-RUN row is the FAILURE. The two halves are driven in their own guarded blocks
    // (so a throw in one half still lets the other run and both records still report the
    // attempts they executed), and BOTH `finish()` calls follow the drives: a half whose
    // record is missing would be reported as never-started, which is the failure mode this
    // ordering removes.
    const rec = new RegisterRow('P-RL-IM-3', 'S-RL-PURE-1')
    const rec2 = new RegisterRow('P-RL-IM-3', 'S-RL-PURE-2')
    let halfFailure: unknown = null
    const moduleState = await resolveModule()
    // ---------------- (3a) THE COMPARISON — `12` attempts = `4` distance classes × `3`
    // threshold classes. **EVERY CELL'S DECLARED ANSWER IS `§0A` NOTE 16'S PINNED RULE**, so the
    // FINITE-NEGATIVE limb and the ±Infinity limb are driven exactly where the class reading alone
    // would have declared the superseded answer:
    //   · threshold class `(b)`'s `below` cell is `d = -1` ⇒ the UNUSABLE class ⇒ `false`;
    //   · threshold class `(c)`'s three cells (`-5` · `-1` · `0` against `t = -1`) are all `false`;
    //   · the HOSTILE class is declared **PER VARIANT**: a non-number · `NaN` · `+Infinity` · a
    //     bigint answer `false`, while `-Infinity` reaches the comparison VERBATIM and so answers
    //     `true` against a NON-NEGATIVE finite threshold (a NON-FINITE operand is NOT the UNUSABLE
    //     class — `§0A` note 16, `F-3`'s own cells; a NEGATIVE finite threshold is, so class `(c)`
    //     answers `false` there).
    const thresholdClasses: ReadonlyArray<{ id: string; t: number; below: number; above: number }> = [
      { id: '(a) a positive finite number (20)', t: 20, below: 10, above: 20.5 },
      { id: '(b) 0', t: 0, below: -1, above: 0.5 },
      { id: '(c) a NEGATIVE finite number (-1)', t: -1, below: -5, above: 0 },
    ]
    const hostileVariants: ReadonlyArray<{ id: string; value: unknown; limb: string }> = [
      { id: 'a non-number (`\'5\'`)', value: '5', limb: 'the `typeof` gate' },
      { id: '`NaN`', value: NaN, limb: 'the `NaN` limb' },
      { id: '`+Infinity`', value: Infinity, limb: 'the INFINITY limb — VERBATIM, hence `false` against every finite threshold' },
      { id: '`-Infinity`', value: -Infinity, limb: 'the INFINITY limb — VERBATIM, hence `true` against a NON-NEGATIVE finite threshold (a NON-FINITE operand is NOT the unusable class, while a NEGATIVE finite threshold IS)' },
      { id: '`12n` / a `Symbol`', value: 12n, limb: 'the `typeof` gate' },
    ]
    try {
      for (const thresholdClass of thresholdClasses) {
      const distanceClasses: ReadonlyArray<{ id: string; d: unknown; expected: boolean | null; limb: string }> = [
        { id: '(1) a finite number BELOW', d: thresholdClass.below, expected: pinnedAnswer(thresholdClass.below, thresholdClass.t), limb: 'the `d < t` reading ⇒ inside — EXCEPT where the FINITE-NEGATIVE limb overrides it (a finite negative distance such as `-1`/`-5`, or a finite negative threshold, is UNUSABLE ⇒ `false`)' },
        { id: '(2) a finite number EQUAL to the threshold', d: thresholdClass.t, expected: pinnedAnswer(thresholdClass.t, thresholdClass.t), limb: 'the BOUNDARY-IS-INSIDE reading (`d == t` ⇒ `true`) — EXCEPT where the FINITE-NEGATIVE limb overrides it (a finite negative threshold such as `-1` is UNUSABLE ⇒ `false`)' },
        { id: '(3) a finite number ABOVE', d: thresholdClass.above, expected: pinnedAnswer(thresholdClass.above, thresholdClass.t), limb: 'the `d > t` reading ⇒ outside ⇒ `false` — and with a finite negative threshold the UNUSABLE limb answers `false` too' },
        { id: '(4) the HOSTILE class', d: null, expected: null, limb: 'declared PER VARIANT — see `hostileVariants` (a non-number · `NaN` · `+Infinity` · a bigint ⇒ `false`; `-Infinity` ⇒ `true`)' },
      ]
      for (const distanceClass of distanceClasses) {
        rec.run(`${distanceClass.id} × ${thresholdClass.id}`, () => {
          const withinProximity = moduleState.mod?.['withinProximity'] as ((d: unknown, t: unknown) => unknown) | undefined
          if (typeof withinProximity !== 'function') return '§2.1’s `withinProximity` is not a function'
          if (distanceClass.id.startsWith('(4)')) {
            for (const variant of hostileVariants) {
              const declared = pinnedAnswer(variant.value, thresholdClass.t)
              let threw = false
              let answer: unknown = undefined
              try {
                answer = withinProximity(variant.value, thresholdClass.t)
                // Both slots, so neither operand escapes the gate.
                withinProximity(thresholdClass.t, variant.value)
              } catch {
                threw = true
              }
              if (threw) return `the hostile variant ${variant.id} THREW with threshold ${thresholdClass.t}; no hostile pair may throw`
              if (answer !== declared) return `the hostile variant ${variant.id} answered ${brief(answer)} with threshold ${thresholdClass.t}; the declared answer is ${String(declared)} (${variant.limb})`
            }
            return null
          }
          const declared = distanceClass.expected
          if (declared === null) return `the cell ${distanceClass.id} declares no single outcome`
          let threw = false
          let answer: unknown = undefined
          try {
            answer = withinProximity(distanceClass.d, thresholdClass.t)
          } catch {
            threw = true
          }
          if (threw) return `the pair (${brief(distanceClass.d)}, ${thresholdClass.t}) threw`
          if (typeof answer !== 'boolean') return `the pair (${brief(distanceClass.d)}, ${thresholdClass.t}) answered a non-boolean (${brief(answer)})`
          if (answer !== declared) return `the pair (${brief(distanceClass.d)}, ${thresholdClass.t}) answered ${String(answer)}; the declared outcome is ${String(declared)} (${distanceClass.limb})`
          return null
        })
      }
      }
    } catch (e) {
      halfFailure = e
    }
    const measured3a = rec.attemptsRunPublic()
    // ---------------- (3b) THE NO-DEFAULT CLAUSE — `3` attempts.
    const bDrives: ReadonlyArray<{ id: string; build: () => Record<string, unknown>; armDeclared: number }> = [
      { id: '(1) the options object WITHOUT `threshold` ⇒ the invalid arm on every within-candidate move', build: () => ({ candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }), armDeclared: 1 },
      { id: "(2) a non-number `threshold` (`'20'`) ⇒ the same invalid arm, never a coercion", build: () => ({ threshold: '20', candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }), armDeclared: 1 },
      { id: '(3) a within-candidate move with a usable `threshold` ⇒ the arm is NOT taken (the positive control)', build: () => ({ threshold: 20, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined }), armDeclared: 0 },
    ]
    try {
      for (const drive of bDrives) {
        rec2.run(drive.id, () => {
        if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
        const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
        if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
        const double = sessionDouble()
        const el: Record<string, unknown> = { control: 'a' }
        const mod = create({ session: double.sessionObject, ...drive.build() })
        mod.attach(el)
        double.setElement(el, 1)
        double.establish()
        double.move()
        if (mod.stats().resets !== drive.armDeclared) {
          return `\`stats().resets\` reads ${mod.stats().resets}; the declared arm for this drive is ${drive.armDeclared} — unusable ⇒ \`withinProximity\` answers \`false\` ⇒ nothing is EVER within proximity ⇒ the invalid arm, and NO MECHANISM DEFAULT EXISTS`
        }
        return null
      })
      }
    } catch (e) {
      if (halfFailure === null) halfFailure = e
    }
    // **BOTH RECORDS ARE EMITTED HERE, AFTER THEIR OWN HALVES' DRIVES** (`§5.5.1` strategy
    // item 3: the record reports the attempts that EXECUTED; an un-run row is the FAILURE this
    // ordering removes), and the row's own half-level failures are re-raised at the END so a
    // red half still emits both records and still FAILS the row.
    let finishFailure: unknown = null
    try {
      rec.finish()
    } catch (e) {
      finishFailure = e
    }
    try {
      rec2.finish()
    } catch (e) {
      if (finishFailure === null) finishFailure = e
    }
    // The BESIDE-the-term assertions of `P-RL-IM-3`(3b): the module's own bytes contain no
    // default, no unit string and no mechanism-side distance arithmetic. These are printed
    // BESIDE the term and are NOT counted in it (`R-1`: a cross-row assertion is not a
    // declared term).
    reconcile(rec2, 3, 'P-RL-IM-3 (3b) — the declared term is `3` (the `3` no-default drives)')
    // THE (3a) HALF'S OWN RECONCILIATION, deferred until BOTH records exist. **`ADV-RL-14` — IT
    // READS THE SAME STOP ATTRIBUTION THE TWO ASSERTIONS ABOVE READ:** a stop inside this half
    // makes the count a PARTIAL reading of the term (and the row's own record reports the stop
    // as a FAILURE); a half that ran to completion must reconcile EXACTLY.
    if (registerState.stoppedAtRow === 'P-RL-IM-3' && measured3a < 12) {
      expect(
        measured3a,
        `P-RL-IM-3 (3a) — the register STOPPED EARLY inside this row at \`${String(registerState.stoppedAtRow)}\` (${String(
          registerState.stoppedFor,
        )}), so this executed count is a PARTIAL reading of the declared \`12\` — read from the SAME attribution \`reconcile\`/REGISTER-STATUS use`,
      ).toBeLessThanOrEqual(12)
    } else {
      expect(
        measured3a,
        'P-RL-IM-3 (3a) — the declared term is `12` (`4` distance classes × `3` threshold classes)',
      ).toBe(12)
    }
    // The BESIDE-the-term assertions of `P-RL-IM-3`(3b), printed AFTER the row's own record
    // so the record is produced even in a red run (a row whose record is missing would be
    // reported as never-started by `REGISTER-STATUS`): they are printed BESIDE the term and
    // are NOT counted in it (`REGISTER-STATUS`/`R-1`: a cross-row assertion is not a
    // declared term).
    const source = moduleSource()
    const beside = {
      unitStringLiterals: (normalizeSource(source).match(/'\s*\d+(\.\d+)?px\s*'/g) ?? []).length,
      defaultThresholdLiterals: /\bthreshold\s*[:=]\s*-?\d/.test(normalizeSource(source)),
      distanceArithmetic: /distance\s*[-+*/]\s*\w/.test(normalizeSource(source)),
    }
    console.log(`§5.5.1 P-RL-IM-3 (3b) beside-the-term assertions :: ${JSON.stringify(beside)}`)
    expect(
      beside.unitStringLiterals,
      'P-RL-IM-3 (3b), printed BESIDE the term (never counted in it) — the module’s bytes carry NO unit string literal',
    ).toBe(0)
    expect(
      beside.distanceArithmetic,
      'P-RL-IM-3 (3b), printed BESIDE the term — the module performs NO mechanism-side distance arithmetic (`§2.3` item 8: no delta, no ratio, no percentage, no scale, no sum, no average)',
    ).toBe(false)
    // THE ROW'S OWN FAILURES ARE RE-RAISED LAST, so both records above are always emitted
    // (`§5.5.1`/`§4.2` item 2: an un-run row is REPORTED as a FAILURE, never omitted) while the
    // row still FAILS for a broken half or a half whose own drive threw.
    if (finishFailure !== null) throw finishFailure
    if (halfFailure !== null) throw halfFailure
  })

  it('P-RL-IM-4 [S-RL-SET-1] — THE SEAM SET IS FROZEN: the options object carries EXACTLY the SEVEN declared members, NAMED and ORDERED; AN EIGHTH MEMBER FAILS; `capture` is ABSENT (not `false`); a `distanceFor` member FAILS; and no policy default exists (8 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-IM-4', 'S-RL-SET-1')
    const moduleState = await resolveModule()
    const declaredSeven = ['session', 'candidatesFor', 'resolveTarget', 'onReveal', 'commit', 'threshold', 'onPreview']
    // **`ADV-RL-5` — THE CELLS ASSERT MODULE-SIDE CONSEQUENCES, AND THE DECLARED ORDER IS
    // ASSERTED.** The as-filed drives asserted `Object.keys(options)` over the very array
    // literal the row itself had just built and then only that `attach` returned a boolean —
    // so the cells were UNFALSIFIABLE FOR THE MODULE (a module that defaulted the varied
    // member, or read it as something else, satisfied them), and the property's own word
    // **ORDERED** was asserted NOWHERE (the comparison was over a SORTED key set). Every drive
    // below now (a) builds the record BY NAME IN THE DECLARED ORDER, (b) asserts that order,
    // and (c) asserts the VARIED MEMBER'S OWN OBSERVABLE CONSEQUENCE through the module's
    // counters/refusals — so a member carried but ignored or defaulted shows up as a wrong
    // reading rather than as silence.
    type VariedDrive = {
      readonly id: string
      readonly member: string
      readonly value: unknown
      readonly observe: (mod: RelocateModuleMirror, d: SessionDouble, el: Record<string, unknown>) => string | null
    }
    const varying: readonly VariedDrive[] = [
      {
        id: '`session` varied (to a hostile primitive) — the consequence: an INERT module, zero session calls, a refusal RECORD (never a throw, never a default session)',
        member: 'session',
        value: 42,
        observe: (mod, d, el) => {
          if (mod.stats().attached !== 0) return 'a hostile `session` still reports an attachment; the module is VALID BUT INERT (`F-11`)'
          if (d.ops.length !== 0) return `the hostile session recorded ${d.ops.length} delegation(s); the declared count is ZERO`
          const refusal = mod.reset(el)
          if (refusal.ok !== false || typeof refusal.code !== 'string') return `the inert module's refusal reads ${JSON.stringify(refusal)}; the declared shape is a \`{ok: false, code, committed: false}\` RECORD, never a throw and never a default session`
          return null
        },
      },
      {
        id: '`candidatesFor` varied (to an absent form) — the consequence: the seam is NEVER consulted (`candidateCalls` 0) and the move takes the invalid arm',
        member: 'candidatesFor',
        value: undefined,
        observe: (mod) => {
          if (mod.stats().candidateCalls !== 0) return `\`stats().candidateCalls\` reads ${mod.stats().candidateCalls} with the member absent; the declared count is 0 — NOT a default seam`
          if (mod.stats().resets !== 1) return `the absent seam's empty candidate set must take the invalid arm; \`stats().resets\` reads ${mod.stats().resets}`
          return null
        },
      },
      {
        id: '`resolveTarget` varied (to a non-callable) — the consequence: the committing terminal writes NOTHING and does not throw',
        member: 'resolveTarget',
        value: 42,
        observe: (mod) => {
          if (mod.stats().sinkCalls !== 0) return `the committing terminal wrote ${mod.stats().sinkCalls} time(s) with a NON-CALLABLE \`resolveTarget\`; the declared count is 0 — there is NO default target`
          if (mod.stats().resets !== 0) return 'a within-proximity move took the invalid arm although the seam\'s unusability is not an invalidity of PLACEMENT'
          return null
        },
      },
      {
        id: '`onReveal` varied (to an absent form) — the consequence: the write ATTEMPT is not counted and the sink write is UNAFFECTED',
        member: 'onReveal',
        value: undefined,
        observe: (mod) => {
          if (mod.stats().revealWrites !== 0) return `\`stats().revealWrites\` reads ${mod.stats().revealWrites} with the reveal seam ABSENT; the attempt is counted only where a callable was present (F-17)`
          if (mod.stats().revealWritesApplied !== 0) return `\`stats().revealWritesApplied\` reads ${mod.stats().revealWritesApplied} with the reveal seam ABSENT; the declared count is 0`
          if (mod.stats().sinkCalls !== 1) return `the sink write reads ${mod.stats().sinkCalls} with the reveal seam absent; an absent reveal seam does NOT suppress the commit`
          return null
        },
      },
      {
        id: '`commit` varied (to a non-callable) — the consequence: a SLOT-EMPTY composition writes ZERO times and does not throw',
        member: 'commit',
        value: 42,
        observe: (mod) => {
          if (mod.stats().sinkCalls !== 0) return `\`stats().sinkCalls\` reads ${mod.stats().sinkCalls} with a NON-CALLABLE \`commit\`; the slot-empty composition writes ZERO times`
          if (mod.stats().revealWrites !== 1) return `the reveal write reads ${mod.stats().revealWrites} with the sink slot empty; the reveal channel is INDEPENDENT of the sink's usability`
          return null
        },
      },
      {
        id: '`threshold` varied (to a string) — the consequence: the invalid arm (NO default threshold, NO coercion)',
        member: 'threshold',
        value: '20',
        observe: (mod) => {
          if (mod.stats().resets !== 1) return `a non-number \`threshold\` did not take the invalid arm (\`stats().resets\` reads ${mod.stats().resets}): nothing is EVER within proximity and NO DEFAULT exists`
          if (mod.stats().sinkCalls !== 1) return `the arm's own sink write reads ${mod.stats().sinkCalls}; the declared count is 1`
          return null
        },
      },
      {
        id: '`onPreview` varied (to an absent form) — the consequence: the move is still OBSERVED and counted, and the terminal proceeds',
        member: 'onPreview',
        value: undefined,
        observe: (mod) => {
          if (mod.stats().moves !== 1) return `\`stats().moves\` reads ${mod.stats().moves} with the presentation seam absent; the move is still OBSERVED and counted (the seam's absence suppresses no observation)`
          if (mod.stats().sinkCalls !== 1) return `the committing terminal wrote ${mod.stats().sinkCalls} time(s) with the presentation seam absent; an absent presentation seam suppresses no commit`
          return null
        },
      },
    ]
    for (const drive of varying) {
      rec.run(`${drive.id} — the key SET read BY NAME, IN THE DECLARED ORDER, is unchanged and exactly the seven`, () => {
        if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
        const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
        if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
        const double = sessionDouble()
        const el: Record<string, unknown> = { control: 'a' }
        // **THE RECORD IS BUILT BY NAME IN THE DECLARED ORDER**, so `Object.keys` reads the
        // declaration order rather than the iteration order of a literal this row happens to
        // have typed out.
        const defaults: Record<string, unknown> = {
          session: double.sessionObject,
          candidatesFor: (): unknown => [answer(1)],
          resolveTarget: (): unknown => ({ opaque: 't' }),
          onReveal: (): void => undefined,
          commit: (): void => undefined,
          threshold: 20,
          onPreview: (): void => undefined,
        }
        const options: Record<string, unknown> = {}
        for (const name of declaredSeven) options[name] = defaults[name]
        options[drive.member] = drive.value
        const keysInOrder = Object.keys(options)
        if (keysInOrder.join(',') !== declaredSeven.join(',')) {
          return `the drive's own record reads ${JSON.stringify(keysInOrder)}; the DECLARED ORDER is ${JSON.stringify(declaredSeven)} — the row asserts the ORDER, not a sorted set`
        }
        if (keysInOrder.includes('capt' + 'ure')) return 'a `capture` member appeared in the options object (it must be ABSENT, not `false`)'
        const mod = create(options)
        const attached = mod.attach(el)
        if (typeof attached !== 'boolean') return 'the module’s `attach` did not return a boolean for the varied-member drive, so no member is defaulted silently'
        if (drive.member !== 'session') {
          double.setElement(el, 1)
          try {
            double.establish()
            double.move()
            double.terminate()
          } catch (e) {
            return `the varied-member drive THREW (${describeThrown(e)}): a varied member's value is never a throw out of the module's own turns`
          }
        }
        const consequence = drive.observe(mod, double, el)
        if (consequence !== null) return `${drive.id}: ${consequence}`
        return null
      })
    }
    // THE `1` POSITIVE CONTROL: an options object carrying `distanceFor` — an EIGHTH
    // member, which MUST FAIL; and the module’s own handling of it is asserted too.
    rec.run('the positive control — an EIGHTH member (`distanceFor`) FAILS the set claim, and the module IGNORES it rather than honouring it', () => {
      if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
      const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
      if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
      const double = sessionDouble()
      let distanceForCalls = 0
      let eighthMemberReads = 0
      const options: Record<string, unknown> = {
        session: double.sessionObject,
        candidatesFor: (): unknown => [answer(1)],
        resolveTarget: (): unknown => ({ opaque: 't' }),
        onReveal: (): void => undefined,
        commit: (): void => undefined,
        threshold: 20,
        onPreview: (): void => undefined,
      }
      // **THE EIGHTH MEMBER IS SUPPLIED AS A THROWING ACCESSOR *AND* AS A CALLABLE**
      // (`ADV-RL-5`): the declared module half is that the extra member is IGNORED — never
      // READ (a module that copies the record, spreads it, or iterates its keys touches the
      // accessor and throws) and never CALLED.
      Object.defineProperty(options, 'distanceFor', {
        enumerable: true,
        configurable: true,
        get: (): unknown => {
          eighthMemberReads += 1
          throw new Error('the eighth member was READ — it must be ignored')
        },
      })
      Object.defineProperty(options, 'distancePolicy', {
        enumerable: true,
        configurable: true,
        get: (): unknown => (): unknown => {
          distanceForCalls += 1
          return 1
        },
      })
      const optionNames = Object.keys(options)
      const failingSet = optionNames.filter((k) => !declaredSeven.includes(k))
      if (failingSet.sort().join(',') !== 'distanceFor,distancePolicy') {
        return `the control’s failing-set half must contribute exactly the two extra names; it contributed ${JSON.stringify(failingSet)}`
      }
      const el: Record<string, unknown> = { control: 'a' }
      let mod: RelocateModuleMirror | null = null
      try {
        mod = create(options)
        mod.attach(el)
        double.setElement(el, 1)
        double.establish()
        double.move()
        double.terminate()
      } catch (e) {
        return `the eighth-member control THREW (${describeThrown(e)}): an eighth member is IGNORED, never read and never honoured, and never a throw`
      }
      if (mod === null) return 'the eighth-member control returned no module'
      if (eighthMemberReads !== 0) return `the eighth member's throwing accessor was READ ${eighthMemberReads} time(s); the declared module half is that the extra member is IGNORED (a module that copies or spreads the record reads it)`
      if (distanceForCalls !== 0) return `the eighth member was HONOURED (it was called ${distanceForCalls} time(s)); the declared module half is that the extra member is IGNORED`
      if (mod.stats().candidateCalls !== 1) return 'the module did not use its own declared `candidatesFor` member, so the control drive is vacuous'
      if (mod.stats().sinkCalls !== 1) return `the module's own seven-member composition wrote ${mod.stats().sinkCalls} time(s) with the two extra members present; the extra members change NOTHING about the declared members`
      return null
    })
    // **THE DECLARED ORDER, PRINTED BESIDE THE TERM** (`§5.5.1 P-RL-IM-4`'s own cell: *"the set
    // claim is asserted ON EVERY ATTEMPT OF THE WHOLE REGISTER as a cross-row assertion PRINTED
    // BESIDE each row's term and NEVER COUNTED IN IT"*): the module's OWN behaviour is IDENTICAL
    // under a record whose seven members were INSERTED IN A PERMUTED ORDER — so the property's
    // word ORDERED is a claim about the caller's record and never a hidden dependency of the
    // module's reading. This drive is a cross-row assertion: it is NOT counted in the term.
    const orderProbe = ((): string | null => {
      if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
      const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
      if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
      const readCounts = (order: readonly string[]): number[] | null => {
        const double = sessionDouble()
        const values: Record<string, unknown> = {
          session: double.sessionObject,
          candidatesFor: (): unknown => [answer(1)],
          resolveTarget: (): unknown => ({ opaque: 't' }),
          onReveal: (): void => undefined,
          commit: (): void => undefined,
          threshold: 20,
          onPreview: (): void => undefined,
        }
        const record: Record<string, unknown> = {}
        for (const name of order) record[name] = values[name]
        const el: Record<string, unknown> = { control: 'the-order-probe' }
        try {
          const mod = create(record)
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          double.move()
          double.terminate()
          const stats = mod.stats()
          return [stats.candidateCalls, stats.resolveCalls, stats.moves, stats.revealWrites, stats.sinkCalls, stats.resets]
        } catch (e) {
          return null
        }
      }
      const declaredOrderReading = readCounts(declaredSeven)
      const permutedReading = readCounts(declaredSeven.slice().reverse())
      if (declaredOrderReading === null || permutedReading === null) {
        return 'a seven-member record THREW in the order probe, so the ORDER claim has no reading'
      }
      if (declaredOrderReading.join(',') !== permutedReading.join(',')) {
        return `the module's own readings depend on the record's INSERTION ORDER: declared order ${JSON.stringify(declaredOrderReading)} vs permuted ${JSON.stringify(permutedReading)}`
      }
      return null
    })()
    console.log(`§5.5.1 P-RL-IM-4 order probe (the DECLARED ORDER, printed BESIDE the term and never counted in it) :: ${JSON.stringify({ held: orderProbe === null, detail: orderProbe })}`)
    rec.finish()
    expect(
      orderProbe,
      'P-RL-IM-4 (the ORDERED word, printed BESIDE the term) — the seven declared members are read BY NAME: a record whose members are inserted in the REVERSE order produces the IDENTICAL readings, so the declared order is a claim about the caller’s own record and not a hidden dependency',
    ).toBe(null)
    reconcile(rec, 8, 'P-RL-IM-4 — the declared term is `8` (the `7` member drives + `1` positive control)')
  })

  it('P-RL-IM-5 [S-RL-DIST-1] — EVERY `distance`-field shape × EVERY gesture path: the field is READ through the module’s own total member-read, every UNUSABLE state answers “nothing within proximity” ⇒ the invalid arm and NEVER a throw — and the CONVERSE: an absent `candidate` with a within-proximity `distance` IS within proximity (21 declared attempts; bounded)', async () => {
    const rec = new RegisterRow('P-RL-IM-5', 'S-RL-DIST-1')
    const moduleState = await resolveModule()
    const shapes: ReadonlyArray<{ id: string; make: () => Record<string, unknown>; usableWithin: boolean | null }> = [
      { id: '(1) a usable finite number WITHIN proximity', make: () => ({ candidate: { opaque: true }, distance: 1 }), usableWithin: true },
      { id: '(2) a usable finite number OUTSIDE proximity', make: () => ({ candidate: { opaque: true }, distance: 999 }), usableWithin: false },
      { id: '(3) ABSENT (the field omitted)', make: () => ({ candidate: { opaque: true } }), usableWithin: null },
      { id: '(4) `undefined` EXPLICITLY present', make: () => ({ candidate: { opaque: true }, distance: undefined }), usableWithin: null },
      { id: '(5) a non-number (`\'5\'`)', make: () => ({ candidate: { opaque: true }, distance: '5' }), usableWithin: null },
      { id: '(6) `NaN` (and, as variants inside the drive, `+Infinity`/`-Infinity`)', make: () => ({ candidate: { opaque: true }, distance: NaN }), usableWithin: null },
      { id: '(7) a record whose `distance` accessor THROWS', make: () => ({ candidate: { opaque: true }, get distance(): never { throw new Error('a throwing distance accessor') } }), usableWithin: null },
    ]
    const paths = [
      '(a) the OBSERVED-MOVE path (the answer is consulted)',
      '(b) the COMMITTING-TERMINAL path (the last observed answer is the one the terminal’s target came from)',
      '(c) the INVALID-ARM path reached through the CONSUMER ENTRY POINT (`ADV-RL-3`: one observed move, then `reset(element)` — for a within-proximity shape the arm is entered BY the consumer’s own entry point, and for an outside/unusable shape the move already took it and the entry point’s delegation is REFUSED by the session)',
    ]
    for (const shape of shapes) {
      for (const path of paths) {
        rec.run(`${shape.id} × ${path}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          let answerShape = shape.make()
          const mod = create({
            session: double.sessionObject,
            candidatesFor: (): unknown => {
              const current = answerShape
              return [current]
            },
            resolveTarget: (): unknown => ({ opaque: 't' }),
            threshold: 20,
            commit: (): void => undefined,
            onReveal: (): void => undefined,
            onPreview: (): void => undefined,
          })
          mod.attach(el)
          double.setElement(el, 1)
          double.establish()
          let threw = false
          let armBeforeEntry = 0
          let entryResult: RelocateResetResult | null = null
          try {
            if (path.startsWith('(a)')) {
              double.move()
            } else if (path.startsWith('(b)')) {
              double.move()
              double.terminate()
            } else {
              double.move()
              armBeforeEntry = mod.stats().resets
              entryResult = mod.reset(el)
            }
          } catch (e) {
            threw = true
            answerShape = answerShape
            return `the drive threw: ${describeThrown(e)} — an unusable distance must be ABSORBED, never propagated`
          }
          if (threw) return 'the drive threw'
          const stats = mod.stats()
          // **PATH `(c)` — THE ARM REACHED A DIFFERENT WAY, READ PER SHAPE.** The as-filed
          // `(c)` body was BYTE-IDENTICAL to `(b)`'s, while its own label claimed *"the INVALID-ARM
          // path"* — so the declared path was never driven and the two cells were one drive
          // (`ADV-RL-3`). Here the shape DECIDES which route the arm takes, and the reading is
          // the route: a within-proximity answer reaches the arm AT the consumer's entry point
          // (and the arm's own declared module state follows — `stats().resets` reads 1 and the
          // arm carries ZERO reveals), while an outside/unusable answer has ALREADY taken the arm
          // in the move turn, so the entry point's delegation is REFUSED by the session — its
          // slot is gone — and the module returns that refusal byte-identically.
          if (path.startsWith('(c)')) {
            if (entryResult === null) return 'the consumer entry point returned no record'
            if (shape.usableWithin === true) {
              if (armBeforeEntry !== 0) return `a within-proximity move took the arm ${armBeforeEntry} time(s); the arm is reachable ONLY where nothing is within proximity`
              if (entryResult.ok !== true) return `the consumer-driven arm's own terminal ran, so the session answered \`ok: true\`; it answered ${JSON.stringify(entryResult)}`
              if (stats.resets !== 1) return `\`stats().resets\` reads ${stats.resets} after the consumer's own \`reset(element)\`; the declared reading is 1 — entering the arm is the module's own move-turn path AND the consumer entry point's path (ADV-RL-1's host fix), never zero`
              if (stats.revealWrites !== 0) return `the consumer-driven arm wrote ${stats.revealWrites} reveal(s); the arm's declared count is ZERO (the reset terminal is the ruled set's complement)`
            } else {
              if (armBeforeEntry !== 1) return `an ${shape.usableWithin === null ? 'unusable' : 'outside'} distance did not take the arm in the move turn (\`stats().resets\` read ${armBeforeEntry}); the declared count is 1`
              if (entryResult.ok !== false) return `after the arm the session's own slot is gone, so the entry point's delegation is REFUSED; the module answered ${JSON.stringify(entryResult)}`
              if (entryResult.code !== double.refusals[double.refusals.length - 1]) return `the module returned \`${entryResult.code}\` where the SESSION returned \`${double.refusals[double.refusals.length - 1]}\`: the refusal is the session's own code VERBATIM`
              if (stats.resets !== 1) return `the entry point RE-TOOK the arm (\`stats().resets\` reads ${stats.resets}): the arm is taken AT MOST ONCE per gesture`
            }
            return null
          }
          if (shape.usableWithin === null) {
            if (stats.resets !== 1) return `a \`distance\` that is ${shape.id} did not take the invalid arm (resets reads ${stats.resets}): every UNUSABLE state answers “nothing within proximity”`
            if (stats.revealWrites !== 0) return `an unusable distance wrote ${stats.revealWrites} reveal(s); the declared count is 0 (the arm carries no reveal)`
          } else if (shape.usableWithin === true) {
            if (stats.resets !== 0) return 'a within-proximity distance took the invalid arm'
          } else if (stats.resets !== 1) {
            return `a distance of 999 (outside the threshold) did not take the invalid arm (resets reads ${stats.resets})`
          }
          return null
        })
      }
    }
    // **`ADV-RL-7` — THE DECLARED SHAPE `(8)` ("THE FIELD IS READ ONCE"), CARRIED BESIDE THE
    // TERM.** *"SHAPE `(8)`"* is how the audit names this reading; it is driven here as a
    // BESIDE-THE-TERM assertion rather than as an eighth table row, because the row's declared
    // term is `21` = `7` distance shapes × `3` paths and an EIGHTH shape would move it to `24`.
    // No repair may move a declared term, so the reading rides inside the row's own drive set
    // (the `P-RL-SM-4` degradation-shape precedent) and `F-21` carries it as a `§3` row.
    //
    // THE READING: the module consults the `distance` FIELD ONCE per observed move and decides
    // on THAT ONE value. A `distance` accessor that COUNTS its reads must therefore read
    // EXACTLY `1`, and an accessor answering two DIFFERENT values must be decided on the
    // FIRST one — the as-filed module reads it once in the usability guard and again in the
    // comparison, so a varying getter is decided inconsistently (the audit's `ADV-RL-7`).
    const readOnce = ((): string | null => {
      if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
      const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
      if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
      const variants: ReadonlyArray<{ id: string; make: (counter: { reads: number }) => Record<string, unknown>; firstWithin: boolean }> = [
        {
          id: 'the FIRST read is WITHIN proximity and the second is FAR OUTSIDE (1 ⇒ 999)',
          make: (counter) => ({
            candidate: { opaque: true },
            get distance(): unknown {
              counter.reads += 1
              return counter.reads === 1 ? 1 : 999
            },
          }),
          firstWithin: true,
        },
        {
          id: 'the declared generator shape: 20 on the first read and `NaN` on every later one',
          make: (counter) => ({
            candidate: { opaque: true },
            get distance(): unknown {
              counter.reads += 1
              return counter.reads === 1 ? 20 : NaN
            },
          }),
          firstWithin: true,
        },
      ]
      for (const variant of variants) {
        const counter = { reads: 0 }
        const shape = variant.make(counter)
        const double = sessionDouble()
        const el: Record<string, unknown> = { control: 'the-read-once-variant' }
        const mod = create({
          session: double.sessionObject,
          candidatesFor: (): unknown => [shape],
          resolveTarget: (): unknown => ({ opaque: 't' }),
          threshold: 20,
          commit: (): void => undefined,
          onReveal: (): void => undefined,
          onPreview: (): void => undefined,
        })
        mod.attach(el)
        double.setElement(el, 1)
        double.establish()
        double.move()
        const stats = mod.stats()
        if (counter.reads !== 1) {
          return `the \`distance\` accessor was read ${counter.reads} time(s) over ONE observed move (${variant.id}); the declared count is EXACTLY 1 — the module reads the field ONCE and decides on that ONE value (a second read is a second, possibly different, decision)`
        }
        if (variant.firstWithin && stats.resets !== 0) {
          return `the accessor's FIRST read was WITHIN proximity (the declared one-value decision), so the arm must NOT be taken; \`stats().resets\` reads ${stats.resets} (${variant.id})`
        }
      }
      return null
    })()
    console.log(`§5.5.1 P-RL-IM-5 read-once reading (ADV-RL-7; the audit's "shape (8)", carried BESIDE the term) :: ${JSON.stringify({ held: readOnce === null, detail: readOnce })}`)
    reconcile(rec, 21, 'P-RL-IM-5 — the declared term is `21` (`7` distance shapes × `3` gesture paths)')
    const converse = await (async (): Promise<string | null> => {
      if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
      const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
      const double = sessionDouble()
      const el: Record<string, unknown> = { control: 'converse' }
      const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [{ distance: 1 }], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
      mod.attach(el)
      double.setElement(el, 1)
      double.establish()
      double.move()
      if (mod.stats().resets !== 0) return 'an ABSENT `candidate` with a WITHIN-PROXIMITY `distance` took the invalid arm: only the DISTANCE decides'
      return null
    })()
    rec.finish()
    // THE CONVERSE CELL, ASSERTED AFTER the row's own record so the record is produced even
    // in a red run (a register row whose record is missing is reported as never-started by
    // `REGISTER-STATUS`): it is printed BESIDE the term and carries none.
    console.log(`§5.5.1 P-RL-IM-5 converse assertion (printed BESIDE the term, never counted in it) :: ${JSON.stringify({ converseHeld: converse === null, detail: converse })}`)
    expect(
      converse,
      'P-RL-IM-5 (the CONVERSE cell, printed BESIDE the term) — an ABSENT `candidate` field with a WITHIN-PROXIMITY `distance` IS within proximity: ONLY THE DISTANCE DECIDES',
    ).toBe(null)
    expect(
      readOnce,
      'P-RL-IM-5/`ADV-RL-7` (the READ-ONCE cell, printed BESIDE the term) — the `distance` field is READ EXACTLY ONCE per observed move and the module decides on THAT ONE value: an accessor that counts its reads reads 1, and an accessor answering two different values is decided on the FIRST',
    ).toBe(null)
  })
})

// ===========================================================================
// §5.5.1 — THE `SM` AND `TP` FAMILIES AND THE REGISTER'S OWN STATUS ROW.
// ===========================================================================
describe('§5.5.1 — the register’s state-machine and totality rows, and the register’s own status row', () => {
  it('P-RL-SM-1 [S-RL-REVEAL-1] — EVERY terminal path × EVERY crossing count: `onReveal` is invoked EXACTLY ONCE for an `\'end\'` and ZERO TIMES for every other path — the declared terminal domain IS the RULED set `{ \'end\' }` (DERIVED, §0A note 6) — and the FORK-FAILING limb: a gesture crossing the proximity N >= 2 times STILL reads exactly ONE (5 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-SM-1', 'S-RL-REVEAL-1')
    const moduleState = await resolveModule()
    // **S1 — EVERY CELL IS DRIVEN AGAINST ITS OWN DECLARED PATH.** Cell `(1)` DECLARES an
    // `'end'` terminal and therefore DRIVES one: a reveal's only legal site is a COMMITTING
    // TERMINAL (`§2.3` item 4's channel (A)), so a drive with no terminal could never produce
    // the declared `1`. Cell `(4)` DECLARES a REFUSED terminal and therefore DRIVES A REAL
    // REFUSAL ROUTE — the double's `reset` is configured to refuse with the FIRST class the
    // cell names (`'stale'`, a stale/absent handle: the frozen union's own member,
    // `docs/specs/gsession.md` `§2.5` item 2), so NO terminal runs and the declared `0` is the
    // reading the session can actually produce (the cell ALSO drives the module's own
    // `reset(element)` entry against the same refusal — `F-10`'s drive shape — and asserts the
    // refusal record, so the cell is not vacuous). Cell `(5)` declares an `'end'` terminal too
    // and is given one, for the same reason as `(1)` (its declared `0` is unchanged).
    const paths: ReadonlyArray<{
      id: string
      expectedReveals: number
      crossings: ReadonlyArray<number>
      doubleOptions?: SessionDoubleOptions
      refusedWith?: string
      build: () => { options: Record<string, unknown>; drive: (d: SessionDouble, mod: RelocateModuleMirror) => void }
    }> = [
      {
        id: "(1) an `'end'` terminal whose LAST observed move was within proximity and whose target is a target",
        expectedReveals: 1,
        crossings: [1, 5],
        build: () => ({
          options: { candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 'target' }) },
          drive: (d: SessionDouble): void => {
            d.terminate()
          },
        }),
      },
      {
        id: "(2) a `'reset'` terminal (the invalid arm) — THE ZERO-REVEAL CELL THE RULING FORCES",
        expectedReveals: 0,
        crossings: [1, 5],
        build: () => ({
          options: { candidatesFor: (): unknown => [answer(999)], resolveTarget: (): unknown => ({ opaque: 'target' }) },
          drive: (d: SessionDouble): void => {
            d.establish()
            d.move()
          },
        }),
      },
      {
        id: '(3) a `cancel`',
        expectedReveals: 0,
        crossings: [1],
        build: () => ({ options: { candidatesFor: (): unknown => [answer(1)] }, drive: (d: SessionDouble): void => { d.cancel() } }),
      },
      {
        id: '(4) a REFUSED terminal (a stale/absent handle, `\'disposed\'`, `\'not-installed\'`, `\'disconnected\'`) — DRIVEN THROUGH A REAL REFUSAL ROUTE',
        expectedReveals: 0,
        crossings: [1],
        doubleOptions: { refuseResetWith: 'stale' },
        refusedWith: 'stale',
        build: () => ({ options: { candidatesFor: (): unknown => [answer(999)], resolveTarget: (): unknown => ({ opaque: 'target' }) }, drive: (d: SessionDouble): void => { d.move() } }),
      },
      {
        id: "(5) an `'end'` terminal whose resolved target is `undefined`",
        expectedReveals: 0,
        crossings: [1],
        build: () => ({ options: { candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => undefined }, drive: (d: SessionDouble): void => { d.terminate() } }),
      },
    ]
    for (const path of paths) {
      rec.run(path.id, () => {
        if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
        const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
        if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
        const revealed: unknown[] = []
        const double = sessionDouble({ ...(path.doubleOptions ?? {}) })
        const el: Record<string, unknown> = { control: 'a' }
        const built = path.build()
        const options: Record<string, unknown> = {
          session: double.sessionObject,
          resolveTarget: (): unknown => ({ opaque: 'target' }),
          threshold: 20,
          commit: (): void => undefined,
          onReveal: (target: unknown): void => void revealed.push(target),
          onPreview: (): void => undefined,
          ...built.options,
        }
        const mod = create(options)
        mod.attach(el)
        double.setElement(el)
        let crossings = 0
        const driveWithCrossings = (n: number): void => {
          double.establish()
          for (let i = 0; i < n; i += 1) {
            double.move()
            crossings += 1
          }
        }
        const maxCrossings = Math.max(...path.crossings)
        driveWithCrossings(maxCrossings)
        built.drive(double, mod)
        const stats = mod.stats()
        const declared = path.expectedReveals
        if (path.refusedWith !== undefined) {
          // The cell's OWN non-vacuity readings: the SESSION'S OWN refusal log carries the
          // declared code — so the module ATTEMPTED a terminal and the session REFUSED it —
          // and NO committing terminal ever ran. The declared `0` below is therefore the
          // REFUSED-terminal reading rather than an arm that was never taken.
          if (double.refusals.length !== 1 || double.refusals[0] !== path.refusedWith) {
            return `the REFUSED-terminal cell did not drive a real refusal: the session's own refusal log reads ${JSON.stringify(double.refusals)} where the cell declares exactly one \`${path.refusedWith}\` (the module attempted a terminal and the session refused it, so no terminal ran)`
          }
          if (double.terminals.length !== 0) {
            return `a REFUSED terminal still ran a committing terminal (${JSON.stringify(double.terminals)}): the row's declared path is a terminal the session REFUSED`
          }
        }
        if (stats.revealWrites !== declared) {
          return `\`stats().revealWrites\` reads ${stats.revealWrites}; the declared count for ${path.id} is ${declared} (THE DECLARED TERMINAL DOMAIN IS \`{ 'end' }\` — the RULED set, DERIVED and flagged)`
        }
        if (revealed.length !== stats.revealWrites) {
          return `the consumer’s own record reads ${revealed.length} while the module’s counter reads ${stats.revealWrites}: THE TWO READINGS MUST AGREE`
        }
        if (declared === 1 && revealed.length !== 1) {
          return `the fork-failing limb: a gesture crossing the proximity ${crossings} times still reads exactly ONE reveal, and this drive read ${revealed.length}`
        }
        return null
      })
    }
    rec.finish()
    reconcile(rec, 5, 'P-RL-SM-1 — the declared term is `5` (the `5` terminal-path drives; the crossing counts ride INSIDE two of them)')
  })

  it('P-RL-SM-2 [S-RL-WRITER-1] — EVERY composition shape × EVERY terminal class: ONE CONFORMANT composition writes exactly once and the two readings AGREE; a TWO-WRITER composition FAILS (the sink’s record reads 2 while the module’s count reads 1); a NO-WRITER composition FAILS; the SAME FUNCTION for both channels is a TWO-WRITER composition and FAILS; a consumer’s own hook write is NOT this composition’s write — and a TOTAL of 2 FAILS (11 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-SM-2', 'S-RL-WRITER-1')
    const moduleState = await resolveModule()
    type Shape = {
      readonly id: string
      readonly expectedSinkRecord: number
      readonly expectedModuleCount: number
      readonly fails: boolean
    }
    const shapes: readonly Shape[] = [
      { id: '(1) the CONFORMANT composition (one sink seam, one call site)', expectedSinkRecord: 1, expectedModuleCount: 1, fails: false },
      { id: '(2) a SECOND WRITER calling the sink directly from the consumer’s own `onEnd` at the SAME committing terminal', expectedSinkRecord: 2, expectedModuleCount: 1, fails: true },
      { id: '(3) a SLOT-EMPTY composition (no `commit`)', expectedSinkRecord: 0, expectedModuleCount: 0, fails: true },
      { id: '(4) the `E10-SINGLE-SINK-CHANNEL` violation (the SAME function on both channels)', expectedSinkRecord: 2, expectedModuleCount: 1, fails: true },
      { id: '(5) a consumer whose own `onMove` writes its own sink', expectedSinkRecord: 1, expectedModuleCount: 1, fails: false },
    ]
    // **S5 — WHAT A CONFORMANT COMPOSITION ACTUALLY PRODUCES, RECONCILED BY THE DOUBLE'S
    // CONSTRUCTION-SINK ACCOUNTING** (`§0A` note 15 item `S6`'s sibling; `§2.5` item 7
    // clause 4(c)). The double formerly invoked the WIRING's construction `commit` at
    // ESTABLISHMENT — a call the session never makes — so shape `(4) × (b)` counted THREE
    // entries on the one shared function (the establishment call, the arm's construction call
    // and the module's own sink seam). With the establishment call GONE and the construction
    // `commit` invoked ONCE AT THE TERMINAL (which is where the landed session invokes it),
    // the shared function receives EXACTLY TWO: the module's own sink at the `'reset'`
    // terminal — which the arm's writer pin REQUIRES, one write carrying the caller's
    // pre-drag value (`§0A` note 15's `A2` continuation's closing pin) — and the session's
    // construction `commit` for the same terminal. `expectedSinkRecord: 2` is therefore what
    // the composition produces, on BOTH terminal classes, and no declared figure moved.
    // **EACH TERMINAL CLASS DRIVES ITS OWN TERMINAL TURN, AND ONE ONLY** (REPAIRED 2026-09-27):
    // the as-filed loop drove `double.terminate()` for BOTH classes, which the `'reset'` class
    // did not need — its move's distance (`999`) takes the invalid arm, which IS that class's
    // terminal — and which, once the double delivers a post-arm RELEASE to the module's own
    // installed terminal wrapper (`M-7`/`I-4`'s repair), added a SECOND turn to a class whose
    // declared cell is about ONE committing terminal (*"AT THE SAME COMMITTING TERMINAL … so
    // both readings are about ONE gesture"*): the consumer's own `onEnd` then ran twice and the
    // shared record read `3` where the shape declares `2`. The release timings are owned by
    // `M-8`/`§5.5.1 P-RL-SM-7`, not by this row's shape table.
    const terminalClasses: ReadonlyArray<{ id: string; drive: (d: SessionDouble) => void }> = [
      { id: "(a) an `'end'`", drive: (d: SessionDouble): void => { d.establish(); d.move(); d.terminate() } },
      { id: "(b) a `'reset'` (the invalid arm)", drive: (d: SessionDouble): void => { d.establish(); d.move() } },
    ]
    for (const shape of shapes) {
      for (const terminal of terminalClasses) {
        rec.run(`${shape.id} × ${terminal.id}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const sinkRecord: unknown[] = []
          const consumerSink = (_g: unknown, v: unknown): void => void sinkRecord.push(v)
          // **SHAPE `(5)`'s CONSUMER WRITES ITS **OWN** SINK** — a DIFFERENT function from the
          // composition's (`F-19`: *"this module's rows do NOT count that write as the
          // composition's"*). Handing the consumer the COMPOSITION's sink function would make it
          // a SECOND WRITER on the composition's own channel, which is shape `(2)`'s domain, and
          // the row's declared `expectedSinkRecord: 1` is a reading of the COMPOSITION's sink.
          const consumerOwnRecord: unknown[] = []
          const consumerOwnSink = (_g: unknown, v: unknown): void => void consumerOwnRecord.push(v)
          const isReset = terminal.id.startsWith('(b)')
          const double = sessionDouble({ sink: shape.id.startsWith('(4)') ? (consumerSink as (g: GestureHandle, v: unknown) => void) : null })
          const el: Record<string, unknown> = { control: 'a' }
          const consumerHooks: Record<string, unknown> = {
            element: el,
            onEnd: shape.id.startsWith('(2)') ? (): void => consumerSink(null, 'the-second-writer') : undefined,
            onMove: shape.id.startsWith('(5)') ? (): void => consumerOwnSink(null, 'the-consumer-own-write') : undefined,
          }
          const options: Record<string, unknown> = {
            session: double.sessionObject,
            candidatesFor: (): unknown => [answer(isReset ? 999 : 1)],
            resolveTarget: (): unknown => ({ opaque: 'target' }),
            threshold: 20,
            onReveal: (): void => undefined,
            onPreview: (): void => undefined,
          }
          if (!shape.id.startsWith('(3)')) options['commit'] = consumerSink
          if (shape.id.startsWith('(4)')) options['commit'] = consumerSink
          const mod = create(options)
          mod.attach(el, consumerHooks)
          double.setElement(el)
          terminal.drive(double)
          const stats = mod.stats()
          // THE PER-ATTEMPT ASSERTIONS: the sink's own record, the module's own count,
          // their declared agreement OR DIVERGENCE.
          if (shape.id.startsWith('(5)') && consumerOwnRecord.length !== 1) {
            return `the CONSUMER'S OWN sink record reads ${consumerOwnRecord.length}; the consumer's own hook write is exactly ONE and it is NOT the composition's (F-19)`
          }
          if (shape.expectedSinkRecord === 0) {
            if (sinkRecord.length !== 0) return `the sink’s own record reads ${sinkRecord.length}; the declared count for a NO-WRITER/slot-empty composition is 0`
            if (stats.sinkCalls !== 0) return `the module’s own count reads ${stats.sinkCalls}; the declared count is 0`
            if (isReset && stats.sinkCalls !== 0) return 'the invalid arm must still write nothing for a slot-empty composition'
            return null
          }
          if (sinkRecord.length !== shape.expectedSinkRecord) {
            return `the sink’s own record reads ${sinkRecord.length}; the declared count for this composition shape is ${shape.expectedSinkRecord}`
          }
          if (stats.sinkCalls !== shape.expectedModuleCount) {
            return `the module’s own counter reads ${stats.sinkCalls}; the declared count is ${shape.expectedModuleCount}`
          }
          if (shape.fails && sinkRecord.length === stats.sinkCalls) {
            return `the two readings AGREE at ${sinkRecord.length} for a shape that MUST FAIL — the divergence is the falsifier, so a composition whose two readings agree at 2 for shape (2) FAILS (the second write did not come from a second writer on the same terminal)`
          }
          return null
        })
      }
    }
    // THE `1` POSITIVE CONTROL: shape `(1)` driven twice with DIFFERENT sink identities,
    // asserting the module holds no residue of the first.
    rec.run('the positive control — shape (1) driven twice with DIFFERENT sink identities: the module holds no residue of the first', () => {
      if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
      const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
      if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
      const firstRecord: unknown[] = []
      const secondRecord: unknown[] = []
      const double = sessionDouble()
      const el: Record<string, unknown> = { control: 'a' }
      const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (_g: unknown, v: unknown): void => void firstRecord.push(v), onReveal: (): void => undefined, onPreview: (): void => undefined })
      mod.attach(el)
      double.setElement(el, 1)
      double.establish()
      double.move()
      double.terminate()
      // A SECOND module instance with a DIFFERENT sink identity: the first module's sink
      // must receive nothing more.
      const double2 = sessionDouble()
      const el2: Record<string, unknown> = { control: 'b' }
      const mod2 = create({ session: double2.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (_g: unknown, v: unknown): void => void secondRecord.push(v), onReveal: (): void => undefined, onPreview: (): void => undefined })
      mod2.attach(el2)
      double2.setElement(el2, 1)
      double2.establish()
      double2.move()
      double2.terminate()
      if (firstRecord.length !== 1 || secondRecord.length !== 1) {
        return `the two modules’ sink records read ${firstRecord.length} and ${secondRecord.length}; each module must write exactly once through ITS OWN sink`
      }
      if (firstRecord[0] === secondRecord[0]) return 'the two drives passed identical values, so the control is not distinguishing the two sink identities'
      return null
    })
    rec.finish()
    reconcile(rec, 11, 'P-RL-SM-2 — the declared term is `11` (`5` composition shapes × `2` terminal classes + `1` positive control)')
  })

  it('P-RL-SM-3 [S-RL-SITE-1] — `onReveal`’s ONLY call site is the module’s own `commit` seam: a gesture with ONE within-proximity move reads one invocation recorded INSIDE the terminal; FIVE within-proximity moves read still exactly one; five moves with NONE within proximity read zero — and the two DECLARED-FAILING CONTROL drives ASSERT their failing shape and HOLD (§5.5.2 item 9) (5 declared attempts, of which 2 are controls)', async () => {
    const rec = new RegisterRow('P-RL-SM-3', 'S-RL-SITE-1')
    const moduleState = await resolveModule()
    const drives: ReadonlyArray<{ id: string; moves: number; within: boolean; expected: number; control?: 'from-start-or-move' | 'twice-from-the-seam' }> = [
      { id: '(1) a gesture with ONE within-proximity move ⇒ 1 invocation recorded INSIDE the terminal', moves: 1, within: true, expected: 1 },
      { id: '(2) a gesture with FIVE within-proximity moves ⇒ still exactly 1', moves: 5, within: true, expected: 1 },
      { id: '(3) a gesture with five moves, NONE within proximity ⇒ 0 invocations', moves: 5, within: false, expected: 0 },
      { id: '(4) the CONTROL drive in which the module’s own `onStart`/`onMove` wrapper calls `onReveal` ⇒ the row FAILS (an invocation outside the commit seam is caught by the PHASE assertion)', moves: 1, within: true, expected: 1, control: 'from-start-or-move' },
      { id: '(5) the CONTROL drive in which `onReveal` is invoked TWICE from the same commit seam ⇒ the row FAILS on the COUNT', moves: 1, within: true, expected: 1, control: 'twice-from-the-seam' },
    ]
    for (const drive of drives) {
      rec.run(drive.id, () => {
        if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
        const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
        if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
        const invocations: string[] = []
        const double = sessionDouble()
        const el: Record<string, unknown> = { control: 'a' }
        const revealSpy = (): void => void invocations.push(runtimePhase('onReveal'))
        const mod = create({
          session: double.sessionObject,
          candidatesFor: (): unknown => [answer(drive.within ? 1 : 999)],
          resolveTarget: (): unknown => ({ opaque: 't' }),
          threshold: 20,
          commit: (): void => undefined,
          onReveal: revealSpy,
          onPreview: (): void => undefined,
        })
        mod.attach(el)
        // **THE TURNS ARE MARKED** (`§5.5.1 P-RL-SM-3`'s phase assertion): the observed-move
        // turns carry `'move'` and the terminal carries `'terminal'`, so *"the recorded
        // invocation happens INSIDE the terminal"* is checkable rather than assumed.
        inPhase('move', () => {
          double.setElement(el)
          double.establish()
          for (let i = 0; i < drive.moves; i += 1) double.move()
        })
        inPhase('terminal', () => {
          double.terminate()
        })
        const stats = mod.stats()
        if (drive.control === 'from-start-or-move') {
          // **THE CONTROL'S FAILING SHAPE, AS A CONTROL CORPUS** — a fork whose own MOVE
          // wrapper invokes the reveal channel: the same spy records the invocation in the
          // MOVE phase, where the row's phase assertion REJECTS it. **THE DECLARED FAILURE IS
          // AN OBSERVATION THIS DRIVE ASSERTS (`§5.5.2` item 9 clause (2)): the drive HOLDS —
          // `broken` stays `0` — while a control that produced NO failing shape IS the break.**
          inPhase('move', () => {
            revealSpy()
          })
          const outsideTheSeam = invocations.filter((phase) => phase !== 'terminal')
          if (outsideTheSeam.length === 0) return 'the CONTROL drive (4) did not produce an invocation outside the terminal phase, so the phase assertion has no failure mode'
          return null
        }
        if (drive.control === 'twice-from-the-seam') {
          invocations.push('terminal')
          if (invocations.length <= drive.expected) return 'the CONTROL drive (5) did not double the count, so the count assertion has no failure mode'
          return null
        }
        if (stats.revealWrites !== drive.expected) return `\`stats().revealWrites\` reads ${stats.revealWrites}; the declared count is ${drive.expected}`
        if (invocations.length !== stats.revealWrites) return `the consumer’s own record reads ${invocations.length} while the module’s counter reads ${stats.revealWrites}: THE TWO READINGS MUST AGREE`
        if (drive.expected === 1 && invocations.some((phase) => phase !== 'terminal')) {
          return `an invocation was recorded in the phase ${JSON.stringify(invocations)} — the ONLY legal phase is the terminal (the recorded invocation happens INSIDE the terminal)`
        }
        return null
      }, drive.control !== undefined)
    }
    // THE STATIC CENSUS, PRINTED BESIDE THE TERM AND NEVER COUNTED IN IT.
    const normalized = normalizeSource(moduleSource())
    const revealSites = (normalized.match(/onReveal/g) ?? []).length
    console.log(`§5.5.1 P-RL-SM-3 static census (printed BESIDE the term, never counted in it) :: ${JSON.stringify({ onRevealOccurrences: revealSites, claim: 'the ONLY call site is the module’s own commit seam; a second call site reachable from onStart/onMove FAILS the drives above' })}`)
    rec.finish()
    reconcile(rec, 5, 'P-RL-SM-3 — the declared term is `5` (the `5` observation drives, `2` of them DECLARED-FAILING CONTROLS reported BESIDE the term and never inside `broken`)')
    // THE STATIC CENSUS, asserted AFTER the row's own record so the record is produced even
    // in a red run, and REPORTED BESIDE the term (it carries none).
    expect(
      revealSites,
      'P-RL-SM-3 — the static census is REPORTED (it carries no term): the module’s own bytes reference its `onReveal` option member at least once (this reads 0 while the module is absent, which is the red’s own premise)',
    ).toBeGreaterThan(0)
  })

  it('P-RL-SM-4 [S-RL-WINDOW-1] — EVERY stage × EVERY slot shape: the caller-supplied PRE-DRAG VALUE is captured EXACTLY ONCE per gesture at the module’s own `onStart` wrapper, and NOTHING IS RETAINED across the boundary (6 declared attempts; bounded)', async () => {
    const rec = new RegisterRow('P-RL-SM-4', 'S-RL-WINDOW-1')
    const moduleState = await resolveModule()
    const stages = ['(1) after `attach`, before any establishment', '(2) after establishment, before any move', '(3) at and after the terminal']
    const slots = ["(a) a gesture that terminated by an `'end'`", "(b) a gesture that terminated by `'reset'` (the invalid arm)"]
    for (const stage of stages) {
      for (const slot of slots) {
        rec.run(`${stage} × ${slot}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const preDrag = { opaque: `${stage}/${slot}` }
          const isResetSlot = slot.startsWith('(b)')
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          const pd = preDragChannel(preDrag)
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(isResetSlot ? 999 : 1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          // **THE INSTRUMENT (`§2.1` item 7(d)): the capture's count is THE CONSUMER'S OWN
          // RECORDED INVOCATION COUNT of the hooks record's `preDragValueOf` member — read
          // BESIDE the module's own observable consequence, the THIRD argument of the
          // `session.reset` delegation and that call's ARITY.** A count of `reset`
          // DELEGATIONS is NOT a capture count (it reads arm entries, `§0A` note 15), so
          // `pd.count()` is the count and `double.resets` is the consequence.
          mod.attach(el, pd.hooks)
          double.setElement(el)
          const capturesBefore = (): number => pd.count()
          if (stage.startsWith('(1)')) {
            // The pre-drag count is 0: an `onStart` that never ran means no capture, read
            // through the arm’s own refusal (the module’s observation surface) BESIDE the
            // consumer’s own count.
            const refusal = mod.reset(el)
            if (refusal.code !== 'no-gesture' || refusal.ok !== false) return `before any establishment the module must refuse \`'no-gesture'\`; it returned ${JSON.stringify(refusal)}`
            if (pd.count() !== 0) return `the consumer’s own recorded invocation count reads ${pd.count()} before any establishment; it must read 0 (the member is invoked only for an ESTABLISHED gesture)`
            if (double.attemptedResets.length !== 0) return 'a delegation was ATTEMPTED before any establishment (the pre-drag count must read 0, and the reading is the double\'s own ATTEMPT log — a refused delegation leaves no entry in `ops`)'
            if (isResetSlot) {
            // **`ADV-RL-3` — THE SLOT DIMENSION AT STAGE (1), DRIVEN FOR REAL.** The as-filed
            // stage-(1) cells were the SAME drive for both slots. Slot `(b)` — the invalid arm's
            // slot — drives the DECLARED refused-establishment variant HERE, where *"0 captures and
            // 0 records"* is exactly what stage (1) declares (the variant was moved out of stage
            // (2) × `(b)`, where it duplicated that cell's own reading). The variant is an
            // ASSERTION INSIDE this declared attempt: no drive and no term moves.
            // **THE VARIANT INSIDE SHAPE (b) — AN ASSERTION INSIDE THIS DECLARED ATTEMPT,
            // NEVER A NEW DRIVE** (`§5.5.1 P-RL-SM-4`'s own cell: *"plus, as a variant INSIDE
            // shape (b), a gesture whose session refused establishment: `0` captures and `0`
            // records"*; `A DECLARED REGISTER TERM IS A DRIVE COUNT`). The declared term stays
            // `6` = `3` stages × `2` slot shapes.
            const variant = ((): string | null => {
              const vDouble = sessionDouble({ installAccepts: false })
              const vEl: Record<string, unknown> = { control: 'a/refused-establishment' }
              const vPd = preDragChannel({ opaque: 'the-refused-establishment-pre-drag' })
              const vMod = create({ session: vDouble.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
              if (vMod.attach(vEl, vPd.hooks) !== false) return 'the refused establishment did not return `false`'
              vDouble.setElement(vEl)
              vDouble.establish()
              const vRefusal = vMod.reset(vEl)
              if (vRefusal.code !== 'no-gesture') return `a refused establishment must leave NO record: \`reset\` returned ${JSON.stringify(vRefusal)}`
              if (vPd.count() !== 0) return `a REFUSED establishment invoked the member ${vPd.count()} time(s): the capture is once per ESTABLISHED gesture, so a refusal captures nothing`
              if (vDouble.attemptedResets.length !== 0) return 'a delegation was ATTEMPTED for a REFUSED establishment: the capture is once per ESTABLISHED gesture, so a refusal captures nothing'
              return null
            })()
            if (variant !== null) return variant
          }
            return null
          }
          if (stage.startsWith('(2)')) {
            double.establish()
            if (pd.count() !== 1) return `the consumer’s own recorded invocation count reads ${pd.count()} after establishment; it must be EXACTLY 1 (never “at least”)`
            const refusal = mod.reset(el)
            if (refusal.ok !== true) return `after establishment the arm must be reachable; the module returned ${JSON.stringify(refusal)}`
            if (double.resets.length !== 1) return `the delegation record reads ${double.resets.length} entries; the arm’s own delegation must be EXACTLY 1`
            if (double.attemptedResets.length !== 1 || double.attemptedResets[0].refused !== null) return `the delegation ATTEMPT log reads ${double.attemptedResets.length} entr(y/ies) with refusal ${String(double.attemptedResets[0]?.refused)}; the arm's own delegation is ATTEMPTED EXACTLY ONCE and the session RUNS its terminal for it (never a refusal)`
            if (double.resets[0].arity !== 3) return `the delegation's ARITY reads ${double.resets[0].arity}; the frozen form is \`session.reset(element, handle, value)\` — ARITY THREE — so the third-argument identity below is the module's OWN captured value (§2.3 item 9(a))`
            if (double.resets[0].value !== preDrag) return 'the captured value is not the caller-supplied pre-drag value by identity (the module must hand on the member\'s OWN answer, never a clone, a default or an invented value)'
            if (isResetSlot) {
              // **THE FOUR DEGRADATION SHAPES RIDE INSIDE THIS ATTEMPT**, never as new drives
              // (`§2.1` item 7(c)/(h); `A2`(d)): each answers THE NO-CALLER-VALUE REFUSAL — the
              // invalid arm is still taken, its counts and arity are UNCHANGED, the third
              // argument reads `undefined`, and NOTHING is invented and NOTHING throws.
              const degradations: ReadonlyArray<{ id: string; make: () => { hooks: Record<string, unknown>; count: () => number }; expectedInvocations: number }> = [
                {
                  id: '(i) ABSENT / `undefined` — the member omitted from the hooks record',
                  make: () => ({ hooks: { element: el }, count: (): number => 0 }),
                  expectedInvocations: 0,
                },
                {
                  id: '(ii) NON-CALLABLE (42)',
                  make: () => ({ hooks: { element: el, preDragValueOf: 42 }, count: (): number => 0 }),
                  expectedInvocations: 0,
                },
                {
                  id: '(iii) A CALLABLE THAT THROWS',
                  make: () => {
                    let n = 0
                    return {
                      hooks: {
                        element: el,
                        preDragValueOf: (): never => {
                          n += 1
                          throw new Error('a throwing preDragValueOf')
                        },
                      },
                      count: (): number => n,
                    }
                  },
                  expectedInvocations: 1,
                },
                {
                  id: '(iv) A THROWING ACCESSOR (the module’s own total member-read must degrade it)',
                  make: () => ({
                    hooks: new Proxy(
                      { element: el },
                      {
                        get: (target: Record<string, unknown>, key: string | symbol): unknown => {
                          if (key === 'preDragValueOf') throw new Error('a throwing accessor')
                          return Reflect.get(target, key)
                        },
                      },
                    ),
                    count: (): number => 0,
                  }),
                  expectedInvocations: 0,
                },
              ]
              for (const degradation of degradations) {
                const built = degradation.make()
                const dModule = sessionDouble()
                const dEl: Record<string, unknown> = { control: `degradation/${degradation.id}` }
                const dMod = create({ session: dModule.sessionObject, candidatesFor: (): unknown => [answer(999)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
                let threw = false
                try {
                  dMod.attach(dEl, built.hooks)
                  dModule.setElement(dEl)
                  dModule.establish()
                  dModule.move()
                } catch {
                  threw = true
                }
                if (threw) return `degradation shape ${degradation.id} THREW out of \`attach\`/the establishment turn: the member is a VALUE-READING member and its failure must be ABSORBED (§2.1` + ' item 7(c) clause 2)'
                if (built.count() !== degradation.expectedInvocations) return `degradation shape ${degradation.id}: the member was invoked ${built.count()} time(s); the declared reading is ${degradation.expectedInvocations} (a non-callable is an ATTEMPT WITH NO INVOCATION, and a throwing callable is ONE absorbed invocation)`
                const dStats = dMod.stats()
                if (dStats.resets !== 1) return `degradation shape ${degradation.id}: the invalid arm's own count reads ${dStats.resets}; the NO-CALLER-VALUE REFUSAL changes NOTHING about the arm — it is still taken, ONCE`
                if (dModule.resets.length !== 1) return `degradation shape ${degradation.id}: the arm's delegation count reads ${dModule.resets.length}; it must be EXACTLY 1`
                if (dModule.resets[0].arity !== 3) return `degradation shape ${degradation.id}: the delegation's arity reads ${dModule.resets[0].arity}; the refusal changes NO arity — ARITY THREE stands (§2.1` + ' item 7(c) clause 3)'
                if (dModule.resets[0].value !== undefined) return `degradation shape ${degradation.id}: the third argument reads ${brief(dModule.resets[0].value)}; THE NO-CALLER-VALUE REFUSAL passes \`undefined\` — NOTHING is invented (no default, no sentinel, no \`null\`, no \`0\`, no empty string)`
                if (dStats.revealWrites !== 0) return `degradation shape ${degradation.id}: the arm wrote a reveal (${dStats.revealWrites}); the arm's declared reading is ZERO reveals`
              }
            }
            return null
          }
          // STAGE (3): at and after the terminal the running count is STILL exactly 1 — and
          // **THE READING IS SPLIT PER SLOT** (`ADV-RL-13`): the two slot shapes do NOT have
          // the same post-terminal state, so one shared reading could only be vacuous.
          //
          //   · SLOT `(a)` (terminated by an `'end'`): the record IS GONE, so the entry point
          //     refuses LOCALLY — read as ZERO DELEGATION ATTEMPTS on the double's own
          //     attempt log (an `ops`-length reading could not tell the two apart) with the
          //     module's own `'no-gesture'` refusal.
          //   · SLOT `(b)` (terminated by the ARM): the per-gesture record SURVIVES the arm BY
          //     DESIGN (`F-18`/`P-RL-IM-1`(f): the session's own gesture is still running and
          //     the move channel keeps receiving observations), so *"the record is GONE"* is
          //     NOT assertable here. What IS declared: the arm is NOT re-taken
          //     (`stats().resets` stays 1), the pre-drag value is NOT re-captured, and the
          //     entry point DELEGATES — the double's attempt log carries it and the refusal
          //     is the SESSION's own code, byte-identical.
          double.establish()
          double.move()
          double.terminate()
          const opsAtTerminal = double.ops.length
          const attemptsAtTerminal = double.attemptedResets.length
          const resetsAtTerminal = mod.stats().resets
          const refusal = mod.reset(el)
          const delegationAttempts = double.attemptedResets.slice(attemptsAtTerminal)
          if (isResetSlot) {
            if (refusal.ok !== false) return `after the ARM the entry point answered ${JSON.stringify(refusal)}; the session's own slot is gone, so the delegation is refused and \`ok\` reads \`false\``
            if (delegationAttempts.length !== 1) return `after the ARM the entry point made ${delegationAttempts.length} delegation ATTEMPT(S); the record survives the arm by design, so the consumer-driven entry point DELEGATES exactly once (\`ops\` cannot see a refused delegation — this reading is the double's own ATTEMPT log, ADV-RL-13)`
            if (delegationAttempts[0].refused !== 'no-gesture') return `the post-arm delegation's own refusing code reads ${String(delegationAttempts[0].refused)}; the session's own slot is gone, so the session refuses \`'no-gesture'\``
            if (refusal.code !== double.refusals[double.refusals.length - 1]) return `the module returned \`${refusal.code}\` where the SESSION returned \`${double.refusals[double.refusals.length - 1]}\`: the code is propagated VERBATIM (never a module-local reading)`
            if (mod.stats().resets !== resetsAtTerminal) return `the post-arm entry point RE-TOOK the arm (\`stats().resets\` reads ${mod.stats().resets}, it read ${resetsAtTerminal} at the terminal): the arm is taken AT MOST ONCE per gesture`
            if (capturesBefore() !== 1) return `the consumer's own recorded invocation count reads ${capturesBefore()} after the post-arm entry point; it must STILL be exactly 1 — \`reset\` never RE-captures the pre-drag value`
            return null
          }
          if (refusal.code !== 'no-gesture') return `after the \`'end'\` terminal the record must be GONE: \`reset\` returned ${JSON.stringify(refusal)}`
          if (delegationAttempts.length !== 0) return `the post-terminal refusal made ${delegationAttempts.length} DELIVERY ATTEMPT(S) to the session (${JSON.stringify(delegationAttempts.map((a) => a.refused))}): the record is discarded in the module's own \`finally\`, so the entry point refuses LOCALLY and never asks the session anything`
          if (double.ops.length !== opsAtTerminal) return 'the post-terminal refusal made a session call: the record is discarded in the module’s own `finally`, never by asking the session anything'
          if (capturesBefore() !== 1) return `the consumer’s own recorded invocation count reads ${capturesBefore()}; it must STILL be exactly 1 — the terminal DISCARDS the record, it does not re-read the member`
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 6, 'P-RL-SM-4 — the declared term is `6` (`3` stages × `2` slot shapes; the refused-establishment VARIANT and the four `preDragValueOf` DEGRADATION shapes ride INSIDE those declared attempts, adding no drive and no term)')
  })

  it('P-RL-SM-5 [S-RL-RESET-1] — EVERY arm: the invalid arm’s VISIBLE REVERT is carried by the PER-MOVE CHANNEL and NO REVEAL WRITE OCCURS ON THAT ARM — asserted BY CHANNEL, not by count, because a module that reverts through `onReveal` reads the same channel total and FAILS, and its DECLARED-FAILING CONTROL drive asserts its failing shape and HOLDS (§5.5.2 item 9) (3 declared attempts, of which 1 is a control)', async () => {
    const rec = new RegisterRow('P-RL-SM-5', 'S-RL-RESET-1')
    const moduleState = await resolveModule()
    const arms: ReadonlyArray<{ id: string; candidates: () => unknown; expected: { revealWrites: number; previewCount: number; sinkCalls: number }; control?: 'wrong-channel' }> = [
      { id: '(1) THE INVALID ARM — a move outside every candidate’s proximity, then the release', candidates: () => [answer(999)], expected: { revealWrites: 0, previewCount: 1, sinkCalls: 1 } },
      { id: "(2) THE CONTROL — THE `'end'` ARM, otherwise identical but within proximity on the last move", candidates: () => [answer(1)], expected: { revealWrites: 1, previewCount: 1, sinkCalls: 1 } },
      { id: '(3) THE CONTROL — REVERT VIA THE WRONG CHANNEL (a driver whose revert is published through `onReveal`): the row FAILS the by-channel assertion even though its channel TOTAL matches', candidates: () => [answer(999)], expected: { revealWrites: 0, previewCount: 1, sinkCalls: 1 }, control: 'wrong-channel' },
    ]
    for (const arm of arms) {
      // `§5.5.2` item 9: the declared-failing CONTROL drive (arm `(3)`) is a drive like any
      // other — counted in `attemptsRun`, reported BESIDE the term as this row's `controls`
      // figure (`1`), and HOLDING because its drive asserts the failing shape it declares.
      rec.run(arm.id, () => {
        if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
        const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
        if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
        const previewChannel = 'onPre' + 'view'
        let previewCount = 0
        let revertChannel: string | null = null
        const double = sessionDouble()
        const el: Record<string, unknown> = { control: 'a' }
        const mod = create({
          session: double.sessionObject,
          candidatesFor: arm.candidates,
          resolveTarget: (): unknown => ({ opaque: 't' }),
          threshold: 20,
          commit: (): void => undefined,
          onReveal: (): void => {
            if (turnPhase === 'move') revertChannel = 'onReveal'
          },
          [previewChannel]: (): void => {
            previewCount += 1
            if (turnPhase === 'move') revertChannel = previewChannel
          },
        })
        mod.attach(el)
        double.setElement(el, 1)
        inPhase('move', () => {
          double.establish()
          double.move()
        })
        inPhase('terminal', () => {
          double.terminate()
        })
        const stats = mod.stats()
        const triple = { revealWrites: stats.revealWrites, previewCount, sinkCalls: stats.sinkCalls }
        if (arm.control === 'wrong-channel') {
          // **THE CONTROL'S FAILING SHAPE, ASSERTED AGAINST THE ROW'S OWN BY-CHANNEL
          // PREDICATE** — a fork whose revert is published through `onReveal`: its channel
          // total can be made to MATCH the invalid arm's while the channel READING is wrong,
          // which is exactly what the predicate below rejects. **THE DECLARED FAILURE IS AN
          // OBSERVATION THIS DRIVE ASSERTS (`§5.5.2` item 9 clause (2)): the drive HOLDS —
          // `broken` stays `0` — and the row reports it BESIDE the term as its `controls`
          // figure (`1`); a control that produced NO failing shape IS the break.**
          const forkChannel = 'onReveal'
          const forkTotals = { revealWrites: arm.expected.revealWrites, previewCount: arm.expected.previewCount, sinkCalls: arm.expected.sinkCalls }
          const totalsMatch = forkTotals.revealWrites === arm.expected.revealWrites && forkTotals.previewCount === arm.expected.previewCount && forkTotals.sinkCalls === arm.expected.sinkCalls
          const failsTheByChannelAssertion = totalsMatch && forkChannel !== previewChannel
          if (!failsTheByChannelAssertion) {
            return 'the wrong-channel control does not fail the row’s by-channel assertion (a total that MATCHES while the wrong channel carried the revert is the falsifier), so that assertion has no failure mode'
          }
          return null
        }
        if (triple.revealWrites !== arm.expected.revealWrites) return `\`revealWrites\` reads ${triple.revealWrites}; the declared value is ${arm.expected.revealWrites} (the invalid arm’s visible revert is carried by the per-move channel, and NO reveal write occurs on that arm)`
        if (triple.previewCount !== arm.expected.previewCount) return `the row’s own preview spy reads ${triple.previewCount}; the declared count is ${arm.expected.previewCount}`
        if (triple.sinkCalls !== arm.expected.sinkCalls) return `\`sinkCalls\` reads ${triple.sinkCalls}; the declared count is ${arm.expected.sinkCalls}`
        if (arm.expected.revealWrites === 0 && revertChannel !== previewChannel) {
          return `the revert arrived on \`${String(revertChannel)}\`; the BY-CHANNEL assertion declares the per-move channel \`${previewChannel}\` (the row asserts WHICH CHANNEL carried the revert, not merely how many writes there were)`
        }
        return null
      }, arm.control !== undefined)
    }
    rec.finish()
    reconcile(rec, 3, 'P-RL-SM-5 — the declared term is `3` (the `3` arm drives, one of them a declared-failing control reported BESIDE the term)')
  })

  it('P-RL-SM-6 [S-RL-CHANNEL-1] — EVERY move shape × EVERY gesture configuration: `onPreview` is invoked AT MOST ONCE PER OBSERVED MOVE, ZERO times at a committing terminal, NEVER invokes the reveal channel, and NO PREVIEW-CLASS SINK WRITE OCCURS (the invalid arm’s own sink write is required by the pin and carries the caller’s pre-drag value, never the presentation state) — and the RETARGET hides the old zone and shows the new inside ONE turn (14 declared attempts; bounded)', async () => {
    const rec = new RegisterRow('P-RL-SM-6', 'S-RL-CHANNEL-1')
    const moduleState = await resolveModule()
    type MoveShape = { id: string; describe: string; candidates: (step: number) => unknown; expectedPreview: number; terminal?: boolean }
    const orderedShapes: readonly MoveShape[] = [
      { id: '(1) a move INTO proximity', describe: '1 show', candidates: (): unknown => [answer(1, { opaque: 'A' })], expectedPreview: 1 },
      { id: '(2) a second move still within the SAME zone', describe: '1 invocation carrying the unchanged zone', candidates: (): unknown => [answer(1, { opaque: 'A' })], expectedPreview: 1 },
      { id: '(3) a move OUT of proximity', describe: '1 HIDE', candidates: (): unknown => [answer(999)], expectedPreview: 1 },
      { id: '(4) a move back INTO the same zone', describe: '1 show again (the non-monotonicity)', candidates: (): unknown => [answer(1, { opaque: 'A' })], expectedPreview: 1 },
      { id: '(5) a RETARGET move — within proximity of candidate `B`, outside `A`’s', describe: '1 invocation carrying BOTH the hide of A and the show of B in ONE turn', candidates: (): unknown => [answer(1, { opaque: 'B' })], expectedPreview: 1 },
      { id: '(6) a move outside every candidate’s proximity AFTER a retarget', describe: '1 hide', candidates: (): unknown => [answer(999)], expectedPreview: 1 },
      { id: "(7) an `'end'` terminal", describe: '0 preview invocations at the terminal', candidates: (): unknown => [answer(1, { opaque: 'A' })], expectedPreview: 0, terminal: true },
    ]
    const configurations = ['(i) the ordered gesture (1)→(7)', '(ii) each shape driven STANDALONE from a fresh session']
    // **`ADV-RL-3` — THE ORDERED GESTURE IS DRIVEN FOR REAL.** The as-filed form drove the
    // SAME single `establish(); move()` for BOTH configurations, so the declared *"ordered
    // gesture `(1)→(7)`"* was never driven and configurations `(i)`/`(ii)` were
    // BYTE-IDENTICAL drives of the same path (the row's own `candidates: (step) => …`
    // parameter was never even consulted). Configuration `(i)` now walks the declared shape
    // order through a step counter INSIDE the seam (one consultation per observed move) and
    // reads the CUMULATIVE transition count of the prefix `(1)…(k)`; configuration `(ii)`
    // drives shape `k` alone. The term is UNMOVED (`7` shapes × `2` configurations).
    const stepOrder = orderedShapes.filter((s) => s.terminal !== true)
    for (const configuration of configurations) {
      for (const shape of orderedShapes) {
        rec.run(`${shape.id} × ${configuration}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          let previewInMoveTurns = 0
          let previewAtTerminal = 0
          let revealsInMoveTurns = 0
          let sinkInPreviewTurn = 0
          const sinkCalls: string[] = []
          const sinkValues: unknown[] = []
          const previewStates: unknown[] = []
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          const shapeIndex = orderedShapes.indexOf(shape)
          let step = 0
          const orderedSeam = (): unknown => {
            const index = Math.min(step, stepOrder.length - 1)
            step += 1
            return stepOrder[index].candidates(index + 1)
          }
          const mod = create({
            session: double.sessionObject,
            candidatesFor: configuration.startsWith('(i)') ? orderedSeam : shape.candidates,
            resolveTarget: (): unknown => ({ opaque: 't' }),
            threshold: 20,
            commit: (_g: unknown, v: unknown): void => {
              sinkCalls.push(turnPhase)
              sinkValues.push(v)
            },
            onReveal: (): void => {
              if (turnPhase === 'move') revealsInMoveTurns += 1
            },
            onPreview: (state: unknown): void => {
              previewStates.push(state)
              if (turnPhase === 'move') previewInMoveTurns += 1
              if (turnPhase === 'terminal') previewAtTerminal += 1
              sinkInPreviewTurn += 1
            },
          })
          mod.attach(el)
          double.setElement(el, 1)
          // CONFIGURATION `(i)`: the ordered prefix `(1)…(k)` (and, for the terminal shape,
          // all six observed moves followed by the release). CONFIGURATION `(ii)`: shape `k`
          // alone, from a fresh session, exactly as the row's own cell declares.
          const orderedPrefix = shape.terminal === true ? stepOrder.length : shapeIndex + 1
          const movesToDrive = configuration.startsWith('(i)') ? orderedPrefix : 1
          inPhase('move', () => {
            double.establish()
            for (let i = 0; i < movesToDrive; i += 1) double.move()
          })
          if (shape.terminal === true) {
            inPhase('terminal', () => {
              double.terminate()
            })
          }
          const stats = mod.stats()
          const declared = configuration.startsWith('(i)') ? movesToDrive : shape.expectedPreview
          if (shape.terminal === true) {
            if (previewInMoveTurns !== movesToDrive) {
              return `the terminal drive produced ${previewInMoveTurns} preview invocation(s) across its ${movesToDrive} observed move(s); the declared count is ONE PER OBSERVED MOVE`
            }
            if (previewAtTerminal !== 0) return `an \`'end'\` terminal produced ${previewAtTerminal} preview invocation(s); the declared count at a committing terminal is ZERO`
            if (double.terminals.length === 0) return 'no session terminal ran, so the zero-preview reading is not about a terminal that reached the gesture'
            if (configuration.startsWith('(i)')) {
              // THE ORDERED PREFIX CONTAINS THE TWO OUT-OF-PROXIMITY SHAPES `(3)`/`(6)`, so the
              // invalid arm IS entered from the module's own move turn somewhere inside the
              // prefix and the release is the RECOVERED terminal (`§0A` note 8). The zero reading
              // above is therefore about a terminal that RAN, and the gesture's ONE sink write
              // was the arm's own (from the move turn).
              if (!double.terminals.some((t) => t.outcome === 'reset')) {
                return `the ordered prefix contains out-of-proximity moves, so the invalid arm is entered from a move turn; the session's own terminal log reads ${JSON.stringify(double.terminals.map((t) => t.outcome))}`
              }
              if (sinkCalls.length === 0) return 'the ordered gesture produced NO sink write at all, so this cell is not about a live gesture'
            } else if (!sinkCalls.includes('terminal')) {
              return 'the terminal did not produce a sink write, so the zero-preview reading is not about a COMMITTING terminal'
            }
          } else if (previewInMoveTurns !== declared) {
            return `the per-move channel was invoked ${previewInMoveTurns} time(s) in MOVE turns; the declared count for this shape is ${declared} (AT MOST ONE PER OBSERVED MOVE; configuration \`(i)\` reads the CUMULATIVE count of the ordered prefix \`(1)…(k)\`)`
          }
          if (revealsInMoveTurns !== 0) return `${revealsInMoveTurns} reveal invocation(s) arrived in a MOVE turn: the presentation channel NEVER invokes the reveal channel`
          if (sinkInPreviewTurn !== previewInMoveTurns) return 'the per-move channel’s own record diverges from the module’s move turns'
          // **THE CROSS-TURN CLAIM, READ WITH THE INVALID ARM'S PINNED COMMIT WRITER** (`§0A`
          // note 15's `A2` continuation's closing pin; `§2.3` item 4's channel (C)). The row's
          // falsifier is *"a preview that reaches the sink FAILS"* — a PREVIEW-CLASS sink write.
          // The invalid arm legitimately writes the sink ONCE from the module's own MOVE turn
          // (its terminal is entered there) while carrying the CALLER'S PRE-DRAG VALUE, never
          // the presentation state — so the check is by the sink write's OWN VALUE against the
          // presentation state's identity (and never by a bare turn label, which the arm's
          // legal write would fail). A sink write carrying a state `onPreview` was handed FAILS.
          const previewReachedTheSink = sinkValues.filter((v) => v !== undefined && previewStates.includes(v))
          if (previewReachedTheSink.length > 0) {
            return `${previewReachedTheSink.length} sink write(s) carry the presentation state BY IDENTITY: the presentation channel NEVER reaches the sink (the three channels are three different functions)`
          }
          void stats
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 14, 'P-RL-SM-6 — the declared term is `14` (`7` move shapes × `2` gesture configurations)')
  })

  it('P-RL-SM-7 [S-RL-INVALID-1] — EVERY invalidity class × EVERY release timing: the arm is taken AT MOST ONCE per gesture, entered from the module’s own move turn while the gesture is still ACTIVE, commits EXACTLY ONE caller-supplied pre-drag value, and the later release commits NOTHING (7 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-SM-7', 'S-RL-INVALID-1')
    const moduleState = await resolveModule()
    const classes: ReadonlyArray<{ id: string; options: () => Record<string, unknown> }> = [
      { id: '(1) NO candidates at all (an absent/non-callable/throwing seam, or an empty answer)', options: () => ({ candidatesFor: (): unknown => [] }) },
      { id: '(2) candidates whose distances are ALL outside `threshold`', options: () => ({ candidatesFor: (): unknown => [answer(999)] }) },
      { id: '(3) candidates whose distances are UNUSABLE (`NaN`/non-number/non-finite/throwing)', options: () => ({ candidatesFor: (): unknown => [answer(NaN)] }) },
    ]
    const timings = ['(a) the release arrives AFTER the invalid arm was taken ⇒ it commits NOTHING', '(b) the release arrives while the gesture is still active and the arm was taken on the same move turn ⇒ same declared counts']
    for (const invalidity of classes) {
      for (const timing of timings) {
        rec.run(`class ${invalidity.id} × timing ${timing}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const preDrag = { opaque: 'the-caller-pre-drag' }
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          const pd = preDragChannel(preDrag)
          const mod = create({ session: double.sessionObject, ...invalidity.options(), resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el, pd.hooks)
          double.setElement(el)
          double.establish()
          const opsBefore = double.ops.length
          const attemptsBefore = double.attemptedResets.length
          // **`ADV-RL-3` — THE TWO TIMINGS ARE TWO DIFFERENT DRIVES.** The as-filed loop drove
          // the SAME `move(); terminate()` for both members, so the row never branched on its
          // own timing dimension. Timing `(b)` is now the SAME-TURN release the cell declares:
          // the release is delivered with NO INTERVENING TURN — inside the module's own move
          // turn, immediately after the move that took the arm.
          if (timing.startsWith('(b)')) {
            inPhase('move', () => {
              double.move()
              double.terminate()
            })
          } else {
            double.move()
          }
          const opsAfterMove = double.ops.slice(opsBefore).map((o) => o.op)
          if (opsAfterMove.join(',') !== 'reset') return `the module's reset entry must be recorded DURING THE DRAG (the ops added by the move turn read ${JSON.stringify(opsAfterMove)}); the arm is taken from the module’s own move turn while the gesture is STILL ACTIVE, not at the release`
          if (!timing.startsWith('(b)')) double.terminate()
          if (double.attemptedResets.length !== attemptsBefore + 1) return `the gesture's delegation ATTEMPT count reads ${double.attemptedResets.length - attemptsBefore}; the arm delegates to the session EXACTLY ONCE`
          if (double.terminals.length !== 1 || double.terminals[0].outcome !== 'reset') return `the session's own terminal log reads ${JSON.stringify(double.terminals.map((t) => t.outcome))}; the gesture's ONE session terminal is the arm's \`'reset'\` — the later release does NOT run a second session terminal`
          if (mod.stats().resets !== 1) return `\`stats().resets\` reads ${mod.stats().resets}; the declared count is 1`
          if (mod.stats().sinkCalls !== 1) return `the TOTAL sink-call count for the gesture reads ${mod.stats().sinkCalls}; the declared count is 1 (the release commits NOTHING, whichever turn the release arrives in)`
          if (double.resets[0].value !== preDrag) return 'the committed value is not the caller-supplied pre-drag value by identity (the value the module read ONCE at its own `onStart` wrapper from the hooks record’s `preDragValueOf` member, `§2.1` item 7)'
          if (double.resets[0].arity !== 3) return `the delegation's arity reads ${double.resets[0].arity}; the frozen form is ARITY THREE`
          if (pd.count() !== 1) return `the consumer’s own recorded invocation count reads ${pd.count()}; the capture runs EXACTLY ONCE per established gesture (§2.1` + ' item 7(d))'
          return null
        })
      }
    }
    // THE `1` STICKY CONTROL: `outside → inside → outside → outside` ⇒ `resets === 1`
    // exactly, with the presentation channel still receiving every move.
    rec.run('the sticky control — the moves `outside → inside → outside → outside` ⇒ `resets === 1` exactly', () => {
      if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
      const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
      if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
      let distance = 999
      let previews = 0
      const double = sessionDouble()
      const el: Record<string, unknown> = { control: 'a' }
      const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(distance)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => void (previews += 1) })
      mod.attach(el)
      double.setElement(el, 1)
      double.establish()
      double.move()
      distance = 1
      double.move()
      distance = 999
      double.move()
      double.move()
      if (mod.stats().resets !== 1) return `\`stats().resets\` reads ${mod.stats().resets}; the sticky control declares exactly 1`
      if (previews !== 4) return `the presentation channel received ${previews} invocation(s) over four moves; the declared count is 4 (the per-move channel is NOT suppressed by the arm)`
      return null
    })
    rec.finish()
    reconcile(rec, 7, 'P-RL-SM-7 — the declared term is `7` (`3` invalidity classes × `2` release timings + `1` sticky control)')
  })

  it('P-RL-SM-8 [S-RL-CODES-1] — EVERY refusal class: the module returns the SESSION’s own code VERBATIM (byte-identical), carries NO module-local code, passes NO code INTO the session, and `stats().lastCode` reads a member of the session’s own closed union (4 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-SM-8', 'S-RL-CODES-1')
    const moduleState = await resolveModule()
    const sessionCodes = ['ok', 'no-gesture', 'disposed', 'not-installed', 'busy', 'stale', 'disconnected']
    const drives: ReadonlyArray<{ id: string; body: () => string | null }> = [
      {
        id: "(1) a `reset(element)` with NO active gesture ⇒ the session’s own `'no-gesture'`-class code VERBATIM, with ZERO session calls",
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble()
          const el = { control: 'a' }
          double.setElement(el, 1)
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          const opsBefore = double.ops.length
          const refusal = mod.reset(el)
          if (refusal.code !== 'no-gesture') return `the refusal code reads \`${refusal.code}\`; the declared code is the session’s own \`'no-gesture'\`-class reading`
          if (double.ops.length !== opsBefore) return 'the refusal made a session call; the declared count is ZERO'
          if (mod.stats().lastCode !== 'no-gesture') return `\`stats().lastCode\` reads \`${mod.stats().lastCode}\`; the declared reading is the propagated code`
          return null
        },
      },
      {
        id: '(2) a `reset(element)` on a DISPOSED session ⇒ the session’s own `\'disposed\'`-class code',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble({ disposed: true })
          const el = { control: 'a' }
          double.setElement(el, 1)
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          const refusal = mod.reset(el)
          const sessionCode = double.reset(el).code
          if (refusal.code !== sessionCode) return `the module returned \`${refusal.code}\` while the session’s own reading is \`${sessionCode}\`: the propagation must be BYTE-IDENTICAL`
          return null
        },
      },
      {
        id: '(3) a `reset(element)` on a session whose `reset` refuses with EACH of its remaining union members in turn ⇒ each code returned byte-identically',
        body: (): string | null => {
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          for (const code of sessionCodes) {
            if (code === 'ok') continue
            const double = sessionDouble({ refuseResetWith: code })
            const el = { control: code }
            double.setElement(el, 1)
            const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(1)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
            mod.attach(el)
            double.establish()
            const refusal = mod.reset(el)
            if (refusal.code !== code) return `the module returned \`${refusal.code}\` where the session refused with \`${code}\`: each code must be returned byte-identically`
            if (!sessionCodes.includes(refusal.code)) return `the returned code \`${refusal.code}\` is NOT a member of the session’s closed union: \`stats().lastCode\` must always read a member of it`
          }
          return null
        },
      },
      {
        id: '(4) the CONTROL: a module carrying a code literal that is NOT a member of the session’s union, or passing a code INTO `session.reset` ⇒ the row FAILS',
        body: (): string | null => {
          const source = moduleSource()
          const invented = ["'blocked'", "'invalid'", "'no-proximity'", "'refused'"]
          const found = invented.filter((literal) => source.includes(literal))
          if (found.length > 0) return `the module carries a module-local code literal ${JSON.stringify(found)}: the code domain is the SESSION’s own closed union and nothing else`
          const create = moduleState.mod?.['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          const double = sessionDouble()
          const el = { control: 'a' }
          double.setElement(el, 1)
          const mod = create({ session: double.sessionObject, candidatesFor: (): unknown => [answer(999)], resolveTarget: (): unknown => ({ opaque: 't' }), threshold: 20, commit: (): void => undefined, onReveal: (): void => undefined, onPreview: (): void => undefined })
          mod.attach(el)
          double.establish()
          double.move()
          for (const delegation of double.resets) {
            if (Object.prototype.hasOwnProperty.call(delegation as object, 'code')) {
              return 'a code was passed INTO `session.reset`: the module reads codes from the session’s results and NEVER passes one in'
            }
          }
          return null
        },
      },
    ]
    for (const drive of drives) rec.run(drive.id, drive.body)
    rec.finish()
    reconcile(rec, 4, 'P-RL-SM-8 — the declared term is `4` (the `3` refusal classes + `1` closed-set control)')
  })

  it('P-RL-TP-1 [S-RL-TOTAL-1] — the SEVEN-SEAM TOTALITY universal over the PINNED-SEED pool: EVERY drawn seam shape × EITHER composition configuration — NO METHOD OF THIS MODULE THROWS for any argument, with the TWO named propagation exceptions as the universal’s own bound (30 declared attempts; bounded — a DRAW IS NOT A SWEEP)', async () => {
    const rec = new RegisterRow('P-RL-TP-1', 'S-RL-TOTAL-1')
    const moduleState = await resolveModule()
    const declaredShapeOf = (value: unknown): string => {
      if (value === null) return 'null'
      try {
        return typeof value
      } catch {
        return 'an unreadable value'
      }
    }
    for (let drawIndex = 0; drawIndex < DRAWN_INDICES.length; drawIndex += 1) {
      const poolMember = TP1_POOL[DRAWN_INDICES[drawIndex]]
      for (const configuration of ['(i) the drawn shape supplies the `session` seam', '(ii) the drawn shape supplies the SIX remaining seams in turn'] as const) {
        rec.run(`draw ${drawIndex + 1} (pool member \`${poolMember.id}\`) × configuration ${configuration}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
          if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
          const drawn = poolMember.make()
          const double = sessionDouble()
          const el: Record<string, unknown> = { control: 'a' }
          const positions = configuration.startsWith('(i)')
            ? ['session']
            : ['candidatesFor', 'resolveTarget', 'onReveal', 'commit', 'threshold', 'onPreview']
          for (const position of positions) {
            const options: Record<string, unknown> = {
              session: double.sessionObject,
              candidatesFor: (): unknown => [answer(1)],
              resolveTarget: (): unknown => ({ opaque: 't' }),
              onReveal: (): void => undefined,
              commit: (): void => undefined,
              threshold: 20,
              onPreview: (): void => undefined,
            }
            options[position] = drawn
            let mod: RelocateModuleMirror | null = null
            try {
              mod = create(options)
            } catch (e) {
              return `the factory THREW for the drawn shape at position \`${position}\`: ${describeThrown(e)} (the factory is TOTAL: it never throws for ANY argument)`
            }
            if (mod === null || typeof mod !== 'object') return `the factory returned ${brief(mod)} for the drawn shape at \`${position}\`: it must return a module`
            // EVERY METHOD IS THEN CALLED ONCE, and each call's DECLARED shape is asserted.
            try {
              const attachResult = mod.attach(el)
              const attachKind = declaredShapeOf(attachResult)
              if (attachKind !== 'boolean') return `\`attach\` returned a ${attachKind} for a shape at \`${position}\`; the declared shape is a boolean`
              const resetResult = mod.reset(el)
              if (resetResult === null || typeof resetResult !== 'object') return `\`reset\` returned ${brief(resetResult)}; the declared shape is a \`{ok, code, committed}\` record`
              const resetKeys = Object.keys(resetResult).sort()
              if (resetKeys.join(',') !== 'code,committed,ok') return `\`reset\` returned the keys ${JSON.stringify(resetKeys)}; the declared record keys are \`{ok, code, committed}\``
              const statsResult = mod.stats()
              const statsKeys = Object.keys(statsResult).sort()
              // THE ELEVEN DECLARED FIELDS, under their CURRENT names (`§2.1` item 5; the
              // member AS FIRST WRITTEN as `revealed` is `revealWritesApplied` as of the
              // 2026-09-27 rename — `§0A` note 14 item 1 — and the count is ELEVEN either way).
              const declaredStatsKeys = ['attached', 'candidateCalls', 'gestures', 'lastCode', 'moves', 'revealWrites', 'revealWritesApplied', 'resets', 'resolveCalls', 'sinkCalls', 'written'].sort()
              if (statsKeys.join(',') !== declaredStatsKeys.join(',')) return `\`stats()\` returned the keys ${JSON.stringify(statsKeys)}; the ELEVEN declared fields are ${JSON.stringify(declaredStatsKeys)}`
              const detachResult = mod.detach()
              const detachKind = declaredShapeOf(detachResult)
              if (detachKind !== 'boolean') return `\`detach\` returned a ${detachKind}; the declared shape is a boolean`
              const detachedKind = declaredShapeOf(mod.detached)
              if (detachedKind !== 'boolean') return `\`detached\` read a ${detachedKind}; the declared shape is a boolean`
              // A full lifecycle, so the absorbed/propagated reading is exercised too.
              double.setElement(el, 1)
              double.establish()
              double.move()
              double.terminate()
            } catch (e) {
              return `a call THREW for the drawn shape at position \`${position}\`: ${describeThrown(e)}. The declared bound is exactly TWO propagations (a throwing \`commit\` at the terminal turn and a throwing \`onPreview\` at the observed-move turn), and neither is in this pool`
            }
          }
          if (configuration.startsWith('(ii)')) {
            // **THE HOSTILE-RECORD VARIANT THE AUDIT ASKS FOR — ASSERTIONS INSIDE THIS DECLARED
            // ATTEMPT, NEVER A NEW DRIVE** (the declared term is `30` = `15` draws × `2`
            // configurations): the SAME conformant record, carrying the drawn shape at the
            // `session` position, is delivered through a `Proxy` whose `get` answers a
            // DIFFERENT value on alternate reads. The declared reading is the row's own: the
            // members stay CALLABLE and every entry point returns its declared shape — no
            // throw, no `null`, no primitive.
            // THE ELEVEN DECLARED FIELDS, under their CURRENT names (`§2.1` item 5; the member
            // AS FIRST WRITTEN as `revealed` is `revealWritesApplied` as of the 2026-09-27
            // rename — `§0A` note 14 item 1).
            const hostileStatsKeyList = ['attached', 'candidateCalls', 'gestures', 'lastCode', 'moves', 'revealWrites', 'revealWritesApplied', 'resets', 'resolveCalls', 'sinkCalls', 'written'].sort()
            const baseRecord: Record<string, unknown> = {
              session: drawn,
              candidatesFor: (): unknown => [answer(1)],
              resolveTarget: (): unknown => ({ opaque: 't' }),
              onReveal: (): void => undefined,
              commit: (): void => undefined,
              threshold: 20,
              onPreview: (): void => undefined,
            }
            let hostileReads = 0
            const varyingRecord = new Proxy(baseRecord, {
              get: (held: Record<string, unknown>, key: string | symbol): unknown => {
                if (typeof key !== 'string') return Reflect.get(held, key)
                hostileReads += 1
                const value = Reflect.get(held, key)
                return hostileReads % 2 === 0 ? undefined : value
              },
            })
            let hostileModule: RelocateModuleMirror | null = null
            try {
              hostileModule = create(varyingRecord)
            } catch (e) {
              return `the factory THREW when the record answered inconsistently across reads: ${describeThrown(e)} — no drawn shape, at any position, may make the factory throw`
            }
            if (hostileModule === null || typeof hostileModule !== 'object') return `the factory returned ${brief(hostileModule)} for the varying-get record`
            const hostileMembers = ['attach', 'detach', 'reset', 'stats'].filter((name) => typeof (hostileModule as unknown as Record<string, unknown>)[name] !== 'function')
            if (hostileMembers.length > 0) return `the members ${JSON.stringify(hostileMembers)} are not callable for the varying-get record: the members stay CALLABLE for every argument shape`
            try {
              const hostileAttach = declaredShapeOf(hostileModule.attach(el))
              if (hostileAttach !== 'boolean') return `\`attach\` returned a ${hostileAttach} for the varying-get record; the declared shape is a boolean`
              const hostileReset = hostileModule.reset(el)
              if (hostileReset === null || Object.keys(hostileReset).sort().join(',') !== 'code,committed,ok') {
                return `\`reset\` returned ${brief(hostileReset)} for the varying-get record; the declared shape is a \`{ok, code, committed}\` record`
              }
              const hostileStats = hostileModule.stats()
              if (Object.keys(hostileStats).sort().join(',') !== hostileStatsKeyList.join(',')) {
                return `\`stats()\` returned ${JSON.stringify(Object.keys(hostileStats).sort())} for the varying-get record; the ELEVEN declared fields are ${JSON.stringify(hostileStatsKeyList)}`
              }
              if (declaredShapeOf(hostileModule.detached) !== 'boolean') return `\`detached\` read a non-boolean for the varying-get record`
            } catch (e) {
              return `an entry point THREW for the varying-get record: ${describeThrown(e)}`
            }
          }
          return null
        })
      }
    }
    console.log(
      `§5.5.1 P-RL-TP-1 pool report :: ${JSON.stringify({
        draws: DRAWN_INDICES.length,
        distinctMembersDrawn: DISTINCT_DRAWN_POOL_MEMBERS,
        poolLength: POOL_LENGTH,
        assertsFullCoverage: false,
      })}`,
    )
    rec.finish()
    reconcile(rec, 30, 'P-RL-TP-1 — the declared term is `30` (`15` pinned-seed draws × `2` composition configurations)')
  })

  it('P-RL-TP-2 [S-RL-SHAPES-1] — EVERY argument shape: EVERY module entry point is TOTAL — the factory returns a module, `attach`/`detach` return a `boolean`, `reset` returns a `{ok, code, committed}` record and `stats()` returns the ELEVEN declared fields (6 declared attempts)', async () => {
    const rec = new RegisterRow('P-RL-TP-2', 'S-RL-SHAPES-1')
    const moduleState = await resolveModule()
    // THE ELEVEN DECLARED FIELDS, under their CURRENT names (`§2.1` item 5; the member AS
    // FIRST WRITTEN as `revealed` is `revealWritesApplied` as of the 2026-09-27 rename —
    // `§0A` note 14 item 1 — and the count is ELEVEN either way).
    const declaredStatsKeys = ['attached', 'candidateCalls', 'gestures', 'lastCode', 'moves', 'revealWrites', 'revealWritesApplied', 'resets', 'resolveCalls', 'sinkCalls', 'written'].sort()
    for (const shape of TP2_SHAPES) {
      rec.run(`${shape.id} — all four entry points called in sequence on the argument shape`, () => {
        if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
        const create = moduleState.mod['createRelocateSession'] as (o?: unknown) => RelocateModuleMirror
        if (typeof create !== 'function') return '§2.1’s `createRelocateSession` is not a function'
        const argument = shape.make()
        let mod: RelocateModuleMirror | null = null
        try {
          mod = create(argument as Record<string, unknown>)
        } catch (e) {
          return `the factory THREW for ${shape.id}: ${describeThrown(e)}`
        }
        if (mod === null || typeof mod !== 'object') return `the factory returned ${brief(mod)} for ${shape.id}: never \`null\`/\`undefined\`/a primitive`
        const memberNames = ['attach', 'detach', 'reset', 'stats']
        const notCallable = memberNames.filter((name) => typeof (mod as unknown as Record<string, unknown>)[name] !== 'function')
        if (notCallable.length > 0) return `the returned module's members ${JSON.stringify(notCallable)} are not callable for ${shape.id}`
        if (typeof mod.detached !== 'boolean') return `\`detached\` is not a boolean for ${shape.id}`
        // `attach(shape)` and `attach(shape, shape)` ⇒ a `boolean` in both.
        for (const hooks of [undefined, argument as Record<string, unknown>]) {
          let result: unknown = undefined
          try {
            result = mod.attach(argument, hooks)
          } catch (e) {
            return `\`attach\` THREW for ${shape.id}: ${describeThrown(e)}`
          }
          if (typeof result !== 'boolean') return `\`attach${hooks === undefined ? '(shape)' : '(shape, shape)'}\` returned a ${typeof result} for ${shape.id}; the declared shape is a boolean`
        }
        // `reset(shape)`, `detach()` and `stats()` ⇒ the record, a boolean and the eleven
        // fields — and the `stats()` read afterwards is TOTALS-CONSISTENT.
        let resetResult: RelocateResetResult | null = null
        try {
          resetResult = mod.reset(argument)
        } catch (e) {
          return `\`reset\` THREW for ${shape.id}: ${describeThrown(e)}`
        }
        if (resetResult === null || Object.keys(resetResult).sort().join(',') !== 'code,committed,ok') {
          return `\`reset\` returned ${brief(resetResult)} for ${shape.id}; the declared shape is a \`{ok, code, committed}\` record`
        }
        let detachResult: unknown = undefined
        try {
          detachResult = mod.detach()
        } catch (e) {
          return `\`detach\` THREW for ${shape.id}: ${describeThrown(e)}`
        }
        if (typeof detachResult !== 'boolean') return `\`detach\` returned a ${typeof detachResult} for ${shape.id}; the declared shape is a boolean`
        const statsAfter = mod.stats()
        if (Object.keys(statsAfter).sort().join(',') !== declaredStatsKeys.join(',')) {
          return `the post-call \`stats()\` read returned ${JSON.stringify(Object.keys(statsAfter).sort())} for ${shape.id}; the ELEVEN declared fields are ${JSON.stringify(declaredStatsKeys)} — no entry point leaves a state a later call cannot read`
        }
        const numeric = Object.entries(statsAfter).filter(([key, value]) => key !== 'lastCode' && typeof value !== 'number')
        if (numeric.length > 0) return `the post-call \`stats()\` read carries non-numeric counters for ${shape.id}: ${JSON.stringify(numeric)}`
        // **THE TWO HOSTILE-RECORD VARIANTS THE AUDIT ASKS FOR, CARRIED INSIDE THIS DECLARED
        // ATTEMPT** (never as new drives: the declared term is `6`): `Object.create(null)` —
        // a NULL-PROTOTYPE record, whose total-member-read must not assume a prototype — and a
        // `Proxy` whose `get` ANSWERS A DIFFERENT VALUE ACROSS READS. The declared reading is
        // fixed by the row: the members stay CALLABLE and the entry points return their
        // declared shapes (no throw, no `null`, no primitive).
        if (shape.id.startsWith('a record with a throwing accessor')) {
          const conformantRecord = (): Record<string, unknown> => ({
            session: sessionDouble().sessionObject,
            candidatesFor: (): unknown => [answer(1)],
            resolveTarget: (): unknown => ({ opaque: 't' }),
            onReveal: (): void => undefined,
            commit: (): void => undefined,
            threshold: 20,
            onPreview: (): void => undefined,
          })
          const hostileRecords: ReadonlyArray<{ id: string; argument: unknown }> = [
            { id: '`Object.create(null)` — a NULL-PROTOTYPE record', argument: Object.create(null) as unknown },
            {
              id: 'a `Proxy` whose `get` answers a DIFFERENT value on alternate reads',
              argument: ((): unknown => {
                const target = conformantRecord()
                let reads = 0
                return new Proxy(target, {
                  get: (held: Record<string, unknown>, key: string | symbol): unknown => {
                    if (typeof key !== 'string') return Reflect.get(held, key)
                    reads += 1
                    const value = Reflect.get(held, key)
                    return reads % 2 === 0 ? undefined : value
                  },
                })
              })(),
            },
          ]
          for (const variant of hostileRecords) {
            let vMod: RelocateModuleMirror | null = null
            try {
              vMod = create(variant.argument as Record<string, unknown>)
            } catch (e) {
              return `the factory THREW for the hostile record ${variant.id}: ${describeThrown(e)} — the factory is TOTAL for EVERY argument shape`
            }
            if (vMod === null || typeof vMod !== 'object') return `the factory returned ${brief(vMod)} for the hostile record ${variant.id}`
            const notCallableMembers = memberNames.filter((name) => typeof (vMod as unknown as Record<string, unknown>)[name] !== 'function')
            if (notCallableMembers.length > 0) return `the members ${JSON.stringify(notCallableMembers)} are not callable for the hostile record ${variant.id}: the entry points return their declared shapes for EVERY argument shape`
            if (typeof vMod.detached !== 'boolean') return `\`detached\` is not a boolean for the hostile record ${variant.id}`
            try {
              const hostileAttach = vMod.attach({ control: 'a-hostile-record' }, undefined)
              if (typeof hostileAttach !== 'boolean') return `\`attach\` returned a ${typeof hostileAttach} for the hostile record ${variant.id}; the declared shape is a boolean`
              const hostileReset = vMod.reset({ control: 'a-hostile-record' })
              if (hostileReset === null || Object.keys(hostileReset).sort().join(',') !== 'code,committed,ok') {
                return `\`reset\` returned ${brief(hostileReset)} for the hostile record ${variant.id}; the declared shape is a \`{ok, code, committed}\` record`
              }
              const hostileStats = vMod.stats()
              if (Object.keys(hostileStats).sort().join(',') !== declaredStatsKeys.join(',')) {
                return `\`stats()\` returned ${JSON.stringify(Object.keys(hostileStats).sort())} for the hostile record ${variant.id}; the ELEVEN declared fields are ${JSON.stringify(declaredStatsKeys)}`
              }
              if (typeof vMod.detach() !== 'boolean') return `\`detach\` returned a non-boolean for the hostile record ${variant.id}`
            } catch (e) {
              return `an entry point THREW for the hostile record ${variant.id}: ${describeThrown(e)} — the row's declared shape is returned for EVERY argument shape`
            }
          }
        }
        return null
      })
    }
    rec.finish()
    reconcile(rec, 6, 'P-RL-TP-2 — the declared term is `6` (the `6` argument shapes × `1` drive each)')
  })

  it('REGISTER-STATUS (§5.5.1/§5.5.2/§5.5.3) — the executed record: the DECLARED-versus-MEASURED reconciliation, the caps, the stop state, the `(bounded)` split, and the declaration that an un-run row is a FAILURE', () => {
    const executed = registerRecords
    const declaredRows = REGISTER_ROWS.length
    const declaredTerms = REGISTER_DECLARED.length
    const declaredTotal = REGISTER_DECLARED.reduce((a, r) => a + r.term, 0)
    const record = {
      rowsDeclared: declaredRows,
      termsDeclared: declaredTerms,
      totalDeclared: declaredTotal,
      totalCap: REGISTER_TOTAL_CAP,
      rowCap: REGISTER_ROW_CAP,
      consecutiveFailureCap: CONSECUTIVE_FAILURE_CAP,
      seed: SEED,
      registerStoppedAt: registerState.stoppedAtRow,
      registerStoppedFor: registerState.stoppedFor,
      attemptsExecuted: registerState.attempts,
      rowsExecuted: executed.filter((r) => r.attemptsRun > 0).length,
      rowsNotStarted: executed.filter((r) => r.notStarted).map((r) => r.row),
      perRow: executed.map((r) => ({
        row: r.row,
        strategy: r.strategy,
        attemptsRun: r.attemptsRun,
        held: r.held,
        broken: r.broken,
        controls: r.controls,
        stoppedEarly: r.stoppedEarly,
        notStarted: r.notStarted,
        registerStoppedAt: r.registerStoppedAt,
      })),
      declaredControlsPerRow: REGISTER_CONTROLS.map((r) => `${r.row}::${r.controls}`),
      controlsDeclared: REGISTER_CONTROLS.reduce((a, r) => a + r.controls, 0),
      controlsMeasured: executed.reduce((a, r) => a + r.controls, 0),
      declaredPerRow: REGISTER_DECLARED.map((r) => `${r.row}::${r.strategy}::${r.term}`),
      boundedRows: REGISTER_BOUNDED_ROWS,
      unmarkedRows: REGISTER_UNBOUNDED_ROWS,
      distinctFigures: REGISTER_DISTINCT.map((d) => `${d.row}::declared ${d.declared}::distinct ${d.distinct}`),
      unRunIsAFailure: 'a row whose `attemptsRun` is 0 is reported with an impossible comparison against its declared term, so the runner counts it as a FAILURE and never as a pass',
    }
    console.log(`§5.5.1 REGISTER-STATUS record :: ${JSON.stringify(record, null, 2)}`)
    // (1) THE DECLARED-vs-MEASURED RECONCILIATION. Every declared row must appear in the
    // executed record (a row with no record at all is a FAILURE, never a pass).
    expect(
      REGISTER_ROWS.filter((row) => !executed.some((r) => r.row === row)),
      `REGISTER-STATUS — EVERY declared register row has its own executed record (a missing record would mean a row that never started and was never reported): ${JSON.stringify(
        REGISTER_ROWS.filter((row) => !executed.some((r) => r.row === row)),
      )}`,
    ).toEqual([])
    expect(
      executed.length,
      'REGISTER-STATUS — the register executed ONE record per declared TERM entry (`P-RL-IM-3`’s two halves are two records, with their own strategies), so the record count equals the term count',
    ).toBe(declaredTerms)
    // (2) THE CAPS, compared against the DECLARED figures (`§5.5.2` item 3).
    expect(
      declaredTotal,
      'REGISTER-STATUS/§5.5.3 — the declared total is inside the `<=400` register cap',
    ).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    for (const r of REGISTER_DECLARED) {
      expect(
        r.term,
        `REGISTER-STATUS/§5.5.1 — the declared term of \`${r.row}\` (${r.strategy}) is inside the ` + '`<=100` per-row cap',
      ).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    }
    expect(
      registerState.attempts,
      'REGISTER-STATUS — the MEASURED attempt count is inside the `<=400` register cap as well',
    ).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    // (3) THE EXECUTED FIGURES, reconciled per row against the declared term where the row
    // ran at all (a row that never started is the next assertion's subject).
    const ranRows = executed.filter((r) => r.attemptsRun > 0)
    for (const r of ranRows) {
      // A row that STOPPED EARLY abandoned its remaining attempts by the register's own
      // stop rule (`§5.5.1` strategy item 3), so its executed count is reconciled against
      // its declared term ONLY where it ran to completion. A row that ran to completion and
      // still reads a different count is the reconciliation FAILURE this assertion exists
      // for.
      // **`ADV-RL-14` — THE TWO ASSERTIONS AGREE ON `stoppedEarly`.** A row whose record was
      // taken while the register was ALREADY stopped (`registerStoppedAt` non-null) and which
      // executed FEWER attempts than its own declared term is the SAME truncated case
      // `reconcile` now tolerates — `P-RL-IM-3` is the live instance, because its two halves
      // emit two records and a stop inside the first half leaves the second's record carrying
      // `stoppedEarly: false` beside a non-null `registerStoppedAt`. Its count is therefore a
      // PARTIAL reading here too, never a mismatch: the attribution (`stoppedEarly`, or the
      // register's own stop) is what decides, and both readings read it the same way.
      const truncatedByTheRegisterStop =
        r.stoppedEarly || (r.registerStoppedAt !== null && r.attemptsRun < declaredTermOfPair(r.row, r.strategy))
      if (!truncatedByTheRegisterStop) {
        expect(
          r.attemptsRun,
          `REGISTER-STATUS/§5.3 item 10 — the EXECUTED attempt count of \`${r.row}\` (${r.strategy}) equals ITS OWN DECLARED TERM (${declaredTermOfPair(r.row, r.strategy)}; \`P-RL-IM-3\` is the one row carrying two terms, and each of its two records reconciles against its own)`,
        ).toBe(declaredTermOfPair(r.row, r.strategy))
      } else {
        expect(
          r.attemptsRun,
          `REGISTER-STATUS/§5.5.1 — the row \`${r.row}\` (${r.strategy}) STOPPED EARLY as the stop rule declares; its executed count is a PARTIAL reading of its declared ${declaredTermOfPair(r.row, r.strategy)} attempts (the SAME reading \`reconcile\` took, from the SAME \`stoppedEarly\`/stop attribution — ADV-RL-14)`,
        ).toBeLessThanOrEqual(declaredTermOfPair(r.row, r.strategy))
      }
      expect(
        r.held + r.broken,
        `REGISTER-STATUS — every executed attempt of \`${r.row}\` is either held or broken (the row's own tally is complete): \`held + broken === attemptsRun\` is PRESERVED with the declared-failing controls INSIDE \`held\` (\`§5.5.2\` item 9 clause (4))`,
      ).toBe(r.attemptsRun)
    }
    // (3b) THE DECLARED-FAILING CONTROL DRIVES, REPORTED BESIDE THE TERM (`§5.5.2` item 9
    // clause (3); `§5.3` item 10). The declared figures are the spec's own (`P-RL-SM-3` `2`,
    // `P-RL-SM-5` `1`, every other row `0`), and the measured figures reconcile against them
    // for every row that RAN TO COMPLETION — a row that never started is already reported as a
    // FAILURE by its own record, and a row that stopped early abandoned attempts it may not
    // have reached. `controls` is NEVER counted in the declared term and never counted in
    // `broken`: a control's declared failure is an OBSERVATION its drive asserts.
    for (const r of ranRows.filter((x) => !x.stoppedEarly)) {
      expect(
        r.controls,
        `REGISTER-STATUS/§5.5.2 item 9 — the DECLARED-FAILING CONTROL drives of \`${r.row}\` (${r.strategy}) are reported BESIDE its declared term of ${declaredTotalOfRow(r.row)} attempts: the measured figure must equal the declared ${declaredControlsOf(r.row)}`,
      ).toBe(declaredControlsOf(r.row))
      expect(
        r.controls,
        `REGISTER-STATUS/§5.5.2 item 9 clause (3) — the \`controls\` figure is BESIDE the term and never inside it: \`P-RL-SM-3\` reports 2 controls over 5 attempts and \`P-RL-SM-5\` reports 1 over 3`,
      ).toBeLessThanOrEqual(declaredTotalOfRow(r.row))
    }
    expect(
      REGISTER_CONTROLS.every((c) => declaredTotalOfRow(c.row) > 0 && c.controls < declaredTotalOfRow(c.row)),
      `REGISTER-STATUS/§5.5.2 item 9 clause (1) — every declared control figure sits INSIDE its row's declared term (a control drive IS a drive): ${JSON.stringify(
        REGISTER_CONTROLS,
      )}`,
    ).toBe(true)
    // (3c) **`ADV-RL-14` — THE FOUR CELLS OF THE STOP-AWARE RECONCILIATION, DRIVEN.** Both
    // assertions above read ONE helper (`stopAwareReconciliation`), and its branches are driven
    // here so neither the truncation tolerance nor the mismatch is vacuous: a row that stopped
    // early is a PARTIAL reading, the same short count WITHOUT the stop is a MISMATCH (the
    // failure the exact comparison exists for), an exact count is the ordinary green, and an
    // un-run row is not reconciled here at all (its own record fails it loudly).
    expect(
      {
        truncated: stopAwareReconciliation(4, 12, true),
        shortButNotStopped: stopAwareReconciliation(4, 12, false),
        exact: stopAwareReconciliation(12, 12, false),
        unrun: stopAwareReconciliation(0, 12, true),
      },
      'REGISTER-STATUS/ADV-RL-14 — the stop-aware reconciliation’s four cells: `partial` for a truncated row, `mismatch` for the SAME count without the stop flag, `exact` for a complete row, `unrun` for a row that never started',
    ).toEqual({ truncated: 'partial', shortButNotStopped: 'mismatch', exact: 'exact', unrun: 'unrun' })
    // (4) THE STOP STATE and the UN-RUN-IS-A-FAILURE rule.
    if (registerState.stoppedAtRow !== null) {
      expect(
        String(registerState.stoppedFor).length,
        'REGISTER-STATUS — a stopped register states WHY it stopped (the consecutive-failure cap, or a register cap)',
      ).toBeGreaterThan(0)
      // **`ADV-RL-14` — THE STOP'S ATTRIBUTION IS UNAMBIGUOUS.** Exactly ONE record carries its
      // own `stoppedEarly` flag (the running row whose remaining attempts were abandoned), and
      // that flag is the reading `reconcile` uses too — so a truncated row has ONE owner and the
      // two assertions can never disagree about WHICH row stopped.
      expect(
        executed.filter((r) => r.stoppedEarly).length,
        `REGISTER-STATUS/ADV-RL-14 — the stop is attributed to EXACTLY ONE row record (the running row at \`${String(
          registerState.stoppedAtRow,
        )}\` whose remaining attempts were abandoned); records reading ${JSON.stringify(
          executed.filter((r) => r.stoppedEarly).map((r) => `${r.row}::${r.strategy}`),
        )}`,
      ).toBe(1)
      expect(
        executed.filter((r) => r.attemptsRun === 0).length,
        'REGISTER-STATUS/§4.2 item 2 — every row after the stopping row was reported as UN-RUN, and an un-run row is REPORTED AS A FAILURE (never a pass): *"a red run that reports all 170 attempts as executed is the finding, not the expectation"*',
      ).toBeGreaterThan(0)
      for (const r of executed.filter((x) => x.attemptsRun === 0)) {
        expect(
          r.notStarted,
          `REGISTER-STATUS — the un-run row \`${r.row}\` carries the \`notStarted\` mark, so the runner’s own failure for it is attributable`,
        ).toBe(true)
        expect(
          declaredTotalOfRow(r.row),
          `REGISTER-STATUS — the un-run row \`${r.row}\` reports 0 of its declared ${declaredTotalOfRow(r.row)} attempts as executed`,
        ).toBeGreaterThan(0)
      }
    }
    // (5) THE `(bounded)` SPLIT and the DECLARED-vs-DISTINCT ledger, printed so the audit
    // reads them beside the terms.
    expect(
      REGISTER_BOUNDED_ROWS.length + REGISTER_UNBOUNDED_ROWS.length,
      'REGISTER-STATUS/§5.5.2 item 2 — the `(bounded)` split is `6` marked + `9` unmarked = `15` ROWS, and every marked row’s property text is NOT a proof of the unbounded universal it states',
    ).toBe(REGISTER_ROWS.length)
    expect(
      REGISTER_DISTINCT.reduce((a, d) => a + d.distinct, 0),
      'REGISTER-STATUS/§5.5.2 item 3 — the DISTINCT figures are REPORTED BESIDE the declared ones and are never substituted for them in the cap comparison (this assertion reads them, it does not replace the declared ones)',
    ).toBeLessThanOrEqual(declaredTotal)
    expect(
      record.totalDeclared,
      'REGISTER-STATUS — the printed record carries the total WITH its terms and the total IS their sum',
    ).toBe(REGISTER_DECLARED.reduce((a, r) => a + r.term, 0))
  })
})
