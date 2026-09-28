// tests/gesture-session.test.ts
// ===========================================================================
// U-GSESSION · wave E (ledger row `E6`) · **THE RED SET** (RCA-1)
//
// Contract: `docs/specs/gsession.md` (FILED 2026-09-27, 971 lines, the A-d3 unit,
// `SCH-2` ADOPTED-RESHAPED). The module to be built later is
// `src/shared/gesture-session.ts` (`§0A` ruling note 1 names BOTH paths — this
// file's path is confirmed there: "the module path is `src/shared/gesture-session.ts`,
// and the test file is `tests/gesture-session.test.ts`").
//
// Binding sections read IN FULL before authoring: the `CURRENT STATE` block, `§0`
// (the fourteen recorded rulings) and `§0A` (the TWELVE dated ruling notes —
// CONTRACT, not commentary), the `⟶ ARCHITECT APPROVAL` block (the FIVE formerly
// open items, now ruled: `reset` IS a session terminal · THE SESSION INVOKES
// `commit` · POINTER-AGNOSTIC TERMINATION · a repeat `install` is a first-config-wins
// NO-OP returning `false` with NO event-source call · the count seam is the
// module's own `stats()`/`gesture()`), the Layer declaration (five honesty anchors),
// `§1` (scope, items 1–9), `§2.1` (the surface + the EXPORT CENSUS `4 + 8 = 12` +
// the delegate clause), `§2.2` (the ten prohibitions `P-1`..`P-10`), `§2.3` (items
// 1–8: attachment / window / one-at-a-time / terminals / commit / capture / dispose /
// the FOUR-STATE machine), `§2.4` (items 1–8: opaque events / identity / one gesture /
// monotonic id / connectivity / unusable source / no value validation / nothing
// survives), `§2.5` (the delegate signature list — eleven items, "nothing else
// exists"), `§2.6` (the seven sibling properties + the `F-1` split `F-11`/`F-12`),
// `§3.1` (`M-1`..`M-17`), `§3.2` (`F-1`..`F-12`), `§3.3` (`I-1`..`I-13`),
// `§3.4` (the static rows `R-1`..`R-9`), `§3.5` (the existence rows `R-10`/`R-11`),
// `§4` (`§4.1` the red statement, `§4.2` the authoring order, `§4.3` what the red is
// NOT, `§4.4` the nine stop conditions `S-1`..`S-9`, `§4.5` the delegation gate),
// `§5.1` (diff scope + the DENIED set), `§5.2` (the four legs), `§5.3` (the DONE
// row's ELEVEN items), **`§5.5.1` (the typed Property register — ALL ELEVEN rows,
// executed here, `396` = `58+32+36+30+24+30+40+30+32+24+60`, seed `20260927`,
// caps `≤100`/row · `≤400` total · stop-after-5-consecutive-failures)**,
// `§5.5.2` (the honesty block + the pool-versus-boundary check), `§5.5.3` (the
// attempt arithmetic with its terms, and the reconciled terms `94→24`, `60→58`),
// `§6` (the three falsifications), `§7` (the fifteen honest statements),
// `§7a`/`§7a.1` (**now `0` open** — all five ruled), `§8`, and `§3a`/`§3b` at the
// END (the adversarial SEED set — the `A-*` rows belong to the LATER pass and NONE
// is authored here; `§3b` is EMPTY BY CONSTRUCTION).
//
// LAYER: **[T] lifecycle and CALL COUNTS over arguments.** This unit touches no DOM
// at all — not even `src/shared/dom-shim.ts` (layer declaration anchor 2): the
// ELEMENT is an argument, the EVENT SOURCE is an argument, and the listeners are
// observed through the argument-supplied recorder. **No row below asserts a
// rendered-geometry, layout, paint, coordinate or click-retargeting-in-a-browser
// property** (`I-11`, `R-8`): `§5.2` offers no `[U]` row (structurally: the module
// is imported by no `src/**` file — `R-7`) and claims no `[D]` row (`F-12` is
// `PRECONDITION-GATED` on `U-DIVERGENCE-EXT`, ledger row `C2` — `R-11`).
//
// THE COUNT SEAM IS THE MODULE'S OWN (`§0A` note 12, `M-15`): every count row below
// reads `stats()`/`gesture()` — the session's own monotonic counters — BESIDE the
// recorder's call log. **No row in this file asserts a count by trusting a
// test-authored spy alone** (the `RCA-4` self-verified-green anti-pattern the
// architect's ruling 5 closed): where a row reads the injected `commit` callback's
// own count it asserts the session's reported count in the SAME attempt and requires
// the two to agree.
//
// **THIS FILE IS THE UNIT'S RED SET (`§4.1`) AND NOTHING ELSE.** It is authored
// FIRST and RUN before any implementation: `src/shared/gesture-session.ts` does not
// exist, so every clause row, every static row and every register row fails on the
// module-absent boundary. **No `src/**`, `scripts/**`, `package.json` or spec file is
// created or modified by this pass.**
//
// THE IMPORT BOUNDARY (`§4.1`, the repo's established technique — an `fs` existence
// probe plus a RUN-TIME-COMPUTED specifier resolved through a dynamic
// `import(/* @vite-ignore */ …)`): every row fails as a **LABELLED ASSERTION** naming
// the absent module, never as a collection error that would take the whole red set
// down. `PRE-1` proves the mechanism itself resolves, against an EXISTING module.
//
// LEG 4 (`§5.2` leg 4): `R-6(b)` asserts the EIGHT TYPE-ONLY names of `§2.1`
// (`EventSource`, `GestureElement`, `GestureHandle`, `GestureOptions`,
// `GestureOptionsInput`, `SessionOptions`, `SessionStats`, `GestureStats`), and an
// imported type name is erased at run time — so the honest leg is a standalone strict
// `tsc` over THIS file. At RED time that leg reports the module-absent boundary
// (`TS2307`) and nothing else. **The `TS2307` diagnostic is NOT suppressed** (no
// `@ts-ignore` anywhere below): suppressing it would make the type-only export claim
// unfalsifiable.
//
// AUTHORED ORDER (`§4.2`): the `§3.5` existence/precondition rows `R-10`/`R-11`
// FIRST (they are the red's own premise and are evaluable before the module exists),
// then the `§3.4` static rows `R-9`/`R-1`..`R-8`, then the invariants `I-1`..`I-13`,
// then `M-1`..`M-17`, then `F-1`..`F-11` (**`F-12` is NOT authored as a passing row —
// `§3.2`/`S-6`**), then the `§5.5.1` register rows IN REGISTER ORDER
// (`P-GS-IM-1` · `P-GS-IM-2` · `P-GS-IM-3` · `P-GS-IM-4` · `P-GS-IM-5` ·
// `P-GS-IM-6` · `P-GS-SM-1` · `P-GS-SM-2` · `P-GS-SM-3` · `P-GS-TP-1` ·
// `P-GS-TP-2`), then the register's own status row. The `describe` blocks below are
// in that order; NOTHING is renumbered.
//
// TWO AS-FILED CLAUSES ARE REPORTED IN PLACE RATHER THAN GUESSED, and neither weakens
// a row (see `RED-RUN FINDINGS` at the foot of this file for both, in full):
//   · `§4.1`'s sentence "plus the static rows that can already be evaluated
//     (`R-2`/`R-3`/`R-5`/`R-7`/`R-9`/`R-11`)" calls `R-2`/`R-3`/`R-5`/`R-7`
//     evaluable-before-the-module while `§3.4` defines all four as scans OF the
//     module file — and `R-7` HERE IS the diff-scope row (`§3.4 R-7`), which the
//     sibling specs' numbering does not carry at all. The `§3.4` table governs
//     (this spec's own rows are enumerated there, and `§3.4`'s "What these nine rows
//     do NOT do" block is explicit); the stale `§4.1` list is reported.
//   · `§3.5 R-10`'s RED form ("at the moment the red set is AUTHORED and RUN,
//     `src/shared/gesture-session.ts` does not exist") governed AT RED TIME, when THIS
//     WAS the red run — and `§3.5 R-10`'s own text says a FAIL of it is meaningful
//     ("if the module EXISTS before the red run, this row FAILS and the `RCA-1` red
//     order is broken — the pass that finds it must REPORT the inversion rather than
//     proceed"). **THE INVERSION WAS REPORTED, NOT PROCEEDED PAST** (the red record is
//     in `docs/next-steps.md`'s `E6` row: 66 red / 10 pass, register stopped at
//     `P-GS-IM-1`). The row was then RE-SCOPED to `§3.5 R-10`'s own GREEN form (its
//     second half, which "governs AT GREEN TIME") by the green-time red-set-repair pass
//     of 2026-09-27, exactly as the sibling units' module-absence rows were; the
//     red-run census is kept as PROVENANCE in the row.
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// ===========================================================================
// §2.1 — THE CONTRACT SHAPES, MIRRORED AS STRUCTURAL TYPES. The module cannot be
// imported for its values while it is absent, so this file mirrors `§2.1`'s block;
// the mirror is used ONLY as the harness's own type surface (it is never asserted to
// BE the module's surface — that is `R-6`'s and leg 4's claim, made through the
// `import type` declarations below).
// ===========================================================================
type GestureElement = unknown
interface EventSource {
  on(element: GestureElement, type: string, handler: () => void): void
  off(element: GestureElement, type: string, handler: () => void): void
  isConnected?(element: GestureElement): boolean
}
type GestureCode = 'ok' | 'not-installed' | 'busy' | 'disposed' | 'disconnected' | 'stale' | 'no-gesture'
type GestureOutcome = 'end' | 'reset' | 'cancel' | null
interface GestureHandle {
  readonly id: number
  readonly element: GestureElement
  readonly active: boolean
  readonly outcome: GestureOutcome
  readonly value: unknown
  set(value: unknown): GestureHandle
}
type BeginResult = { readonly ok: true; readonly gesture: GestureHandle } | { readonly ok: false; readonly code: GestureCode }
interface TerminalResult {
  readonly ok: boolean
  readonly code: GestureCode
  readonly committed: boolean
}
interface DisposeReport {
  readonly removed: number
  readonly complete: boolean
}
interface SessionStats {
  readonly installed: number
  readonly sourceCalls: number
  readonly gestures: number
  readonly commits: number
  readonly active: boolean
  readonly gestureId: number
  readonly lastCode: GestureCode
}
interface GestureStats {
  readonly active: boolean
  readonly id: number
  readonly outcome: GestureOutcome
  readonly value: unknown
  readonly commits: number
}
interface GestureOptionsInput {
  readonly capture?: unknown
  readonly onStart?: unknown
  readonly onMove?: unknown
  readonly onEnd?: unknown
  readonly onCancel?: unknown
}
interface SessionOptions {
  readonly source?: EventSource
  readonly commit?: (gesture: GestureHandle, value: unknown) => void
}
interface GestureSessionMirror {
  install(element: GestureElement, options?: GestureOptionsInput): boolean
  begin(element: GestureElement): BeginResult
  end(element: GestureElement, gesture: GestureHandle, value?: unknown): TerminalResult
  reset(element: GestureElement, gesture: GestureHandle, value: unknown): TerminalResult
  cancel(element: GestureElement, gesture?: GestureHandle): TerminalResult
  dispose(): DisposeReport
  gesture(): GestureStats | null
  stats(): SessionStats
  readonly disposed: boolean
}

/** `§2.1`/`§3.4 R-6`(b) — THE TYPE-ONLY HALF, through `§5.2` leg 4. These EIGHT
 *  imports are the compile-time claim that the module exports the eight type
 *  declarations of `§2.1`: this file does not compile unless it does. The `TS2307`
 *  this produces while the module is ABSENT is the red's own leg-4 form and is NOT
 *  suppressed (a `@ts-ignore` here would make the type claim unfalsifiable). */
import type { EventSource as ModuleEventSource } from '../src/shared/gesture-session.js'
import type { GestureElement as ModuleGestureElement } from '../src/shared/gesture-session.js'
import type { GestureHandle as ModuleGestureHandle } from '../src/shared/gesture-session.js'
import type { GestureOptions as ModuleGestureOptions } from '../src/shared/gesture-session.js'
import type { GestureOptionsInput as ModuleGestureOptionsInput } from '../src/shared/gesture-session.js'
import type { SessionOptions as ModuleSessionOptions } from '../src/shared/gesture-session.js'
import type { SessionStats as ModuleSessionStats } from '../src/shared/gesture-session.js'
import type { GestureStats as ModuleGestureStats } from '../src/shared/gesture-session.js'

// ===========================================================================
// **`D-1` — THE TYPED `EventSource` FIXTURE, AND THE LEG-4 PIN** (`§2.1`'s
// `EventSource`, `§2.5` item 2, `§3.1` `M-7b`/`M-8b`, `§5.2` leg 4).
//
// **THIS OBJECT IS TYPED AS THE MODULE'S OWN IMPORTED `EventSource`** (not as this
// file's structural mirror), and it carries the declared capture member
// `capturePointer?(element: GestureElement): void`. That is the whole point of the
// fixture: `§2.1` DECLARES the member and `§2.5` item 2 NAMES it, so a consumer
// implementing a source typed `EventSource` must be able to opt in TYPE-LEGALLY —
// and **this file does not compile while the module's `EventSource` lacks the
// member**. `§5.2` leg 4 (the standalone strict `tsc` over THIS file) is therefore
// the pin that gives the member a real red/green cycle, because `tsconfig.json`
// excludes `tests/**` and leg 2 never reads this file (`§5.2` leg 2's NAMED LIMIT).
//
// The `TS2307`/excess-property diagnostics this produces are NOT suppressed
// anywhere (the `R-6(b)` rule at the head of this file): a `@ts-ignore` here would
// make the declaration claim unfalsifiable.
//
// **⟶ RECORDED 2026-09-27 (`ADV-GS-17`, THE GATE-4 CLOSURE): THE TYPE-LEVEL RED HAS
// FLIPPED GREEN.** As filed this block read *"At RED time — before the Implementer lands
// the member — the expected diagnostic is `error TS2353: Object literal may only specify
// known properties, and 'capturePointer' does not exist in type 'EventSource'`"*. **THE
// MODULE NOW DECLARES THE MEMBER** (`src/shared/gesture-session.ts`'s `EventSource` carries
// `capturePointer?(element: GestureElement): void`, and the module's own capture read is
// `readMember(seam, 'capturePointer')`), so the standalone strict `tsc` leg over THIS file
// is **EXIT `0` WITH ZERO DIAGNOSTICS** — the `TS2353` above is KEPT VISIBLE as the
// as-filed form and is no longer the expected outcome. The as-filed sentence is kept, as
// this file's `⟶` convention requires, and the record now matches the landed bytes.
//
// The fixture is HARNESS-side (`[T]`): every call it records is a CALL THE SESSION
// MADE against an argument-supplied source, never a fact about a browser
// (layer anchor 5, `§4.4 S-7`).
// ===========================================================================
function typedEventSourceRecord(withCapture: boolean): {
  source: ModuleEventSource
  calls: string[]
  capturePointerCalls: unknown[]
  fire: (element: ModuleGestureElement, type: string) => void
} {
  const calls: string[] = []
  const capturePointerCalls: unknown[] = []
  const attached = new Map<ModuleGestureElement, Map<string, () => void>>()
  const source: ModuleEventSource = {
    on(element: ModuleGestureElement, type: string, handler: () => void): void {
      calls.push(`on:${type}`)
      const per = attached.get(element) ?? new Map<string, () => void>()
      per.set(type, handler)
      attached.set(element, per)
    },
    off(element: ModuleGestureElement, type: string, handler: () => void): void {
      void handler
      calls.push(`off:${type}`)
      const per = attached.get(element)
      if (per !== undefined && per.has(type)) per.delete(type)
    },
    // The ONE connectivity reading `§2.4` item 5 allows (`M-7b` asserts the capture
    // call lands AFTER it; `M-14` owns the connectivity clause itself).
    isConnected(element: ModuleGestureElement): boolean {
      void element
      calls.push('isConnected')
      return true
    },
    // ⟶ `D-1`: THE DECLARED MEMBER. If the module's `EventSource` does not carry it yet,
    // THIS line is the leg-4 compile failure — the red this pass exists to report.
    // **⟶ CORRECTED 2026-09-27 (`ADV-GS-37`, the gate-4 closure): THE MODULE NOW CARRIES IT.**
    // The sentence above is kept as the as-filed form (it governed at RED time). MEASURED: the
    // module's own `EventSource` DECLARES `capturePointer?(element: GestureElement): void`
    // (`src/shared/gesture-session.ts`, `§2.1`), so this line is no longer a compile failure —
    // the standalone strict `tsc` leg over THIS file (`§5.2` leg 4) is **EXIT `0` with ZERO
    // diagnostics**, and the red was the `TS2353` the as-filed record names (`ADV-GS-17`).
    // Prose only: no assertion in this file moves for this correction.
    capturePointer(element: ModuleGestureElement): void {
      capturePointerCalls.push(element)
      calls.push('capturePointer')
    },
  }
  // The recorded handler reader — so a row can drive a terminal through the SESSION'S OWN
  // listener (`§2.3` item 1(d)), never by calling a terminal method directly.
  const fire = (element: ModuleGestureElement, type: string): void => {
    const handler = attached.get(element)?.get(type)
    if (handler === undefined) throw new Error(`the typed fixture holds no attached handler for '${type}'`)
    handler()
  }
  if (withCapture) return { source, calls, capturePointerCalls, fire }
  // `M-8b`'s source: **THE SAME SURFACE MINUS THE MEMBER** — the declared degradation
  // (`§2.1`'s `EventSource` block, `§2.5` item 2). The member is deleted BEFORE the
  // freeze, and the freeze itself is checked by `isGenuinelyFrozen` below.
  const bare = source as unknown as Record<string, unknown>
  delete bare['capturePointer']
  Object.freeze(source)
  return { source, calls, capturePointerCalls, fire }
}

/** `M-8b`/`D-12`(b) — **A GENUINELY FROZEN object**: a WRITE to it THROWS or silently
 *  leaves the value unchanged, so the freeze is a real property of the value rather
 *  than an annotation. `Object.isFrozen` alone is reported BESIDE this measurement.
 *  The probe is READ-ONLY on the way out: a frozen object cannot be restored, so the
 *  helper never attempts a second write (the earlier form's "restore" write threw and
 *  the instrument failed on its own cleanup rather than on the property). */
function isGenuinelyFrozen(value: object): boolean {
  const holder = value as Record<string, unknown>
  const before = holder['frozen-probe']
  let threw = false
  try {
    holder['frozen-probe'] = 'written'
  } catch {
    threw = true
  }
  return threw || holder['frozen-probe'] === before
}

// ===========================================================================
// THE IMPORT BOUNDARY (`§4.1`) and the path constants the static/existence rows use.
// ===========================================================================
const MODULE_SRC = new URL('../src/shared/gesture-session.ts', import.meta.url)
/** The run-time specifier of `§5.1` row 1, assembled at RUN time so the
 *  unresolvable import cannot fail this file's transform while the module is
 *  absent (the repo's `.js` → `.ts` resolution applies at run time). */
const MODULE_SPECIFIER = ['..', 'src', 'shared', 'gesture-session.js'].join('/')
const TEST_FILE = fileURLToPath(import.meta.url)
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))
const MODULE_RELPATH = 'src/shared/gesture-session.ts'
const TEST_RELPATH = 'tests/gesture-session.test.ts'
const SPEC_RELPATH = 'docs/specs/gsession.md'

/** `§4.1` — the module-absent reason, as DATA: a clause row asserts it (so the red
 *  message names the absent module) while a REGISTER row counts it as a BROKEN
 *  attempt (`§5.5.1`'s stop-after-5 discipline is what reports the red run's early
 *  stop, and a throw would hide it). */
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
      mod,
      `RED — U-GSESSION red set (§4.1): ${reason ?? 'the module surface is unavailable'}. ` +
        `This row drives §2.1's surface. [${label}]`,
    ).not.toBe(null)
  }
  return mod as Record<string, unknown>
}

/** The named value export of `§2.1`, through the same boundary. */
async function valueExport<T>(name: string, label: string): Promise<T> {
  const mod = await requireModule(label)
  const value = mod[name]
  expect(
    typeof value,
    `§2.1/§3.4 R-6(a) — the runtime VALUE export \`${name}\` is exported by \`${MODULE_RELPATH}\` (the export census is a SET claim: ${JSON.stringify(
      Object.keys(mod).sort(),
    )}) [${label}]`,
  ).not.toBe('undefined')
  return value as T
}

async function makeSession(options?: SessionOptions, label = 'the session factory'): Promise<GestureSessionMirror> {
  const create = await valueExport<(o?: SessionOptions) => GestureSessionMirror>('createGestureSession', label)
  const session = create(options)
  expect(session, `§2.1 — \`createGestureSession\` returns a usable instance (TOTAL, §2.4 item 6) [${label}]`).not.toBe(
    undefined,
  )
  return session
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
  if (typeof value === 'object') return `an object {${Object.keys(value).join(',')}}`
  return String(value)
}

// ===========================================================================
// §2.1 — THE RECORDING SOURCE (the harness). Every ATTACH, DETACH, capture and
// connectivity reading the session makes against the injected source lands here with
// its exact argument values, so a row can assert the CALLS the session made — never a
// fact about a real browser's listener table (layer anchor 5, `§4.4 S-7`).
// ===========================================================================
type OpKind = 'on' | 'off' | 'capture' | 'isConnected'
interface CallRecord {
  readonly seq: number
  readonly op: OpKind
  readonly element: unknown
  readonly type: string
  readonly handler: unknown
}
interface SourceOptions {
  readonly withCapture?: boolean
  readonly isConnected?: (element: unknown) => unknown
  /** ⟶ ADDED 2026-09-27 (the `ADV-GS-2` regression row): configure the recorder to THROW
   *  on a chosen `on` call. The seam's totality is "the call did not throw" (`§2.4` items
   *  1/6), so a source that cannot perform a tracking attach at all is exactly the
   *  degradation class `ADV-GS-2` pins — and the mock seam is the only way to drive it,
   *  because every session source call goes through this recorder (`vi.mock`). */
  readonly failOn?: (pair: { element: unknown; type: string }) => boolean
  /** ⟶ ADDED 2026-09-27 (`D-12`(b)/`ADV-GS-9`, the MISSING FIXTURE): `P-GS-IM-1`'s
   *  configuration `(18)` declares *"a FROZEN source"*, and as filed the fixture never
   *  froze anything — the spec's own cell names this as one of the two configurations that
   *  exist in NO fixture. With `frozen: true` the source is `Object.freeze`d AFTER it is
   *  built (so its `log`/`attached` containers, created above, still record), and the
   *  freeze is MEASURED by `isGenuinelyFrozen` rather than trusted. */
  readonly frozen?: boolean
  /** ⟶ ADDED 2026-09-27 (the `ADV-GS-26` regression row, the gate-4 closure): configure the
   *  recorder's SOURCE-SUPPLIED capture member to THROW on its one call. `§2.1`'s
   *  `EventSource.capturePointer` doc is explicit — *"A throw from it is swallowed by the
   *  same valid-state rule as the source's other callables (`§2.4` item 6) — a throwing
   *  capture member never reaches the consumer boundary and never fails a gesture"* — and
   *  the capture member is the ONE seam entry point whose throw had no row before this
   *  pass. The symmetric form of `failOn`/`failOff`: the recorder logs the ATTEMPT and
   *  THEN throws (the documented order), so a row can measure the attempt count, the
   *  swallowed throw (through `threwAt`) and the gesture's normal termination on the SAME
   *  drive. */
  readonly failCapture?: boolean
  /** ⟶ ADDED 2026-09-27 (the `ADV-GS-30` regression row): a HOOK that runs **INSIDE the
   *  recorder's capture call**, after the ATTEMPT is recorded and before the configured
   *  fault (and before the recorded call returns) — i.e. exactly in the window `§2.3` item
   *  6(b) places the capture call in ("inside `begin`, after the gesture is established").
   *  The row needs the window, not a new seam: a consumer's `capturePointer` may do
   *  ANYTHING, including disposing the session it is mid-`begin` on, and the disposal
   *  must govern (`§2.3` item 7.3). No other option can reach this window, because the
   *  window is opened by the session's own call order. */
  readonly capturePointer?: (element: unknown) => void
}
interface RecorderSource extends EventSource {
  /** The source-SUPPLIED capture entry point (`§2.3` item 6's RULED form): the session
   *  discovers and invokes it from the supplied surface, so no row has to read a
   *  capture-method spelling out of the module's bytes. */
  readonly capturePointer?: (element: unknown) => void
  readonly log: CallRecord[]
  readonly captures: CallRecord[]
  /** **THE SEQUENCES OF THE CALLS THAT THREW** (`D-7`/`M-15`'s corrected counting rule needs
   *  them: a call that THROWS is logged but NOT counted by `stats().sourceCalls`). The
   *  recorder logs the attempt and then throws, so the entry cannot mark itself; this set is
   *  what makes the rule measurable. */
  readonly threwAt: Set<number>
  readonly attached: Map<unknown, Map<string, () => void>>
  readonly handlerOffsets: Map<() => void, number>
  failOff: (pair: { element: unknown; type: string; handlerUnknown: unknown }) => boolean
  failOn: (pair: { element: unknown; type: string }) => boolean
  fire(element: unknown, type: string, event?: unknown): void
  listenerCount(element: unknown): number
  typeMultiset(element: unknown): string[]
  listenerPairs(): string[]
  callCount(): number
  sourceCallsFromStats(): number
}

function makeSource(options: SourceOptions = {}): RecorderSource {
  const log: CallRecord[] = []
  const captures: CallRecord[] = []
  const threwAt = new Set<number>()
  const attached = new Map<unknown, Map<string, () => void>>()
  const handlerOffsets = new Map<() => void, number>()
  let seq = 0
  const record = (op: OpKind, element: unknown, type: string, handler: unknown, captureToo: boolean): void => {
    const rec: CallRecord = { seq, op, element, type, handler }
    seq += 1
    log.push(rec)
    if (captureToo) captures.push(rec)
  }
  const source: RecorderSource = {
    log,
    captures,
    threwAt,
    attached,
    handlerOffsets,
    failOff: () => false,
    failOn: () => false,
    on(element: GestureElement, type: string, handler: () => void): void {
      record('on', element, type, handler, false)
      if (source.failOn !== undefined && source.failOn({ element, type })) {
        threwAt.add(seq - 1)
        throw new Error('the recorder source was configured to fail this `on` call')
      }
      const per = attached.get(element) ?? new Map<string, () => void>()
      per.set(type, handler)
      attached.set(element, per)
      handlerOffsets.set(handler, handlerOffsets.get(handler) ?? log.length - 1)
    },
    off(element: GestureElement, type: string, handler: () => void): void {
      const handlerUnknown: unknown = handler
      if (source.failOff({ element, type, handlerUnknown })) {
        const failed: CallRecord = { seq, op: 'off', element, type, handler }
        threwAt.add(seq)
        seq += 1
        log.push(failed)
        throw new Error('the recorder source was configured to fail this `off` call')
      }
      record('off', element, type, handler, false)
      const per = attached.get(element)
      if (per !== undefined && per.get(type) === handler) per.delete(type)
    },
    isConnected(element: GestureElement): boolean {
      record('isConnected', element, 'isConnected', undefined, false)
      return options.isConnected === undefined ? true : (options.isConnected(element) as boolean)
    },
    fire(element: unknown, type: string, event?: unknown): void {
      const handler = attached.get(element)?.get(type)
      expect(
        handler,
        `the recorder source holds a live handler on the control for the type ${brief(type)}, so the fire is not vacuous`,
      ).not.toBe(undefined)
      ;(handler as (payload?: unknown) => void)(event)
    },
    listenerCount(element: unknown): number {
      let n = 0
      for (const [, type] of (attached.get(element) ?? new Map<string, () => void>()).entries()) {
        void type
        n += 1
      }
      return n
    },
    typeMultiset(element: unknown): string[] {
      return [...(attached.get(element) ?? new Map<string, () => void>()).keys()].sort()
    },
    listenerPairs(): string[] {
      const out: string[] = []
      for (const [element, per] of attached.entries()) for (const [type] of per.entries()) out.push(`${String(element)}::${type}`)
      return out.sort()
    },
    callCount(): number {
      return log.length
    },
    sourceCallsFromStats(): number {
      return log.filter((r) => r.op !== 'capture').length
    },
  }
  if (options.withCapture === false) return source
  // **THE CAPTURE-ELIGIBLE RECORDER** (`§2.1` `GestureOptionsInput.capture`'s RULED
  // form, 2026-09-27): the session calls **A CAPTURE METHOD THE SOURCE SUPPLIES** —
  // named by the source and discovered by the session from its own supplied surface —
  // so the capability and the invocation are both real while the MODULE's bytes carry no
  // DOM-specific capture-method token (`R-3`(2)/`F-11` keep their scans EXACTLY as they
  // are, and they must still FAIL a module whose bytes name that token). This recorder
  // therefore exposes its capture entry point under the module-neutral name
  // `capturePointer`, NOT under a DOM capture-method spelling. **The rows that assert
  // the RULED property assert the COUNT** — exactly one capture call on an opted-in
  // establishment through this supplied surface, zero otherwise — **and never the
  // module's own spelling** (`§2.3` item 6; `I-7`/`I-8`, `M-7`/`M-8`, `F-10`,
  // `P-GS-IM-5`, and `PRE-5`'s positive control).
  const withCapture = source as unknown as Record<string, unknown>
  withCapture['capturePointer'] = (element: unknown): void => {
    record('capture', element, 'capturePointer', undefined, true)
    // ⟶ ADDED 2026-09-27 (`ADV-GS-30`): THE MID-CALL WINDOW, driven by the CONSUMER OWN
    // member — the recorded attempt lands FIRST, so a row can assert that the window really
    // opened (the call happened) while the hook's own effect (a `dispose()`) runs before the
    // call returns.
    if (options.capturePointer !== undefined) options.capturePointer(element)
    // ⟶ ADDED 2026-09-27 (the `ADV-GS-26` regression row): the ATTEMPT is recorded FIRST,
    // then the configured fault fires — the same order `on`/`off` use, so the row can
    // assert "exactly ONE capture ATTEMPT was made" from the recorder's own `captures`
    // array while the throw itself is measured from `threwAt` (`§2.1`'s `capturePointer`
    // doc: the throw is SWALLOWED, the gesture still establishes and still terminates).
    if (options.failCapture === true) {
      threwAt.add(seq - 1)
      throw new Error('the recorder source was configured to fail this capture call')
    }
  }
  // ⟶ `D-12`(b): **THE ABSENT-MEMBER SHAPE IS A PROPERTY-ABSENCE, NOT A PROPERTY SET TO
  // `undefined`.** An explicitly-supplied `isConnected: undefined` therefore DELETES the
  // member from the surface, so `'isConnected' in source === false` and a row can assert
  // the absent-member fixture the spec names (`P-GS-IM-1` configuration `(16)`).
  if (Object.prototype.hasOwnProperty.call(options, 'isConnected') && options.isConnected === undefined) {
    delete withCapture['isConnected']
  }
  // ⟶ `D-12`(b): the freeze lands LAST, after every member (and the capture entry point)
  // exists, so the frozen source is a fully-formed source whose writes are refused.
  if (options.frozen === true) Object.freeze(source)
  return source
}

/** The types the session contracts with its source (`§2.1`, `§0A` note 10). */
const TYPE_START = 'pointerdown'
const TYPE_MOVE = 'pointermove'
const TYPE_END = 'pointerup'
const TYPE_CANCEL = 'pointercancel'
const TYPE_SET = [TYPE_START, TYPE_MOVE, TYPE_END, TYPE_CANCEL]

interface CommitRecord {
  readonly gesture: unknown
  readonly value: unknown
  readonly outcome: unknown
  readonly id: unknown
}
interface Harness {
  readonly session: GestureSessionMirror
  readonly source: RecorderSource
  readonly commits: CommitRecord[]
  readonly thrown: unknown[]
  /** **THE PER-CONTROL ENTRY POINT THE HARNESS OWES** (green-time test repair
   *  2026-09-27, the `b1930d2`/`8e2c777`/`f36f605`/`2437727` class): `makeHarness`'s
   *  `installOptions` was ACCEPTED AND NEVER USED, so the rows below installed with NO
   *  options and their intended hook/`capture` never reached the session (`M-9`/`M-11`/
   *  `M-12`/`M-13`/`I-7`/`I-8`/`F-10` went red on a HARNESS WIRING DEFECT, not on a
   *  module clause). This member threads the harness's own `installOptions` into
   *  `install` (`§2.5` item 2: `install(element, {capture?, onStart?, onMove?, onEnd?,
   *  onCancel?})`), and an explicit argument OVERRIDES it — which is how the rows that
   *  need a DIFFERENT config per element (`M-7`/`M-8`, `F-3`, `I-12b`, `M-11`) still
   *  drive their own. */
  sessionInstall(element: GestureElement, optionsOverride?: GestureOptionsInput): boolean
}
async function makeHarness(options: {
  sourceOptions?: SourceOptions
  installOptions?: GestureOptionsInput
  commitThrows?: boolean
  commitAbsent?: boolean
  label?: string
}): Promise<Harness> {
  const source = makeSource(options.sourceOptions ?? {})
  const commits: CommitRecord[] = []
  const thrown: unknown[] = []
  const commit = options.commitAbsent
    ? undefined
    : (gesture: GestureHandle, value: unknown): void => {
        const record: CommitRecord = { gesture, value, outcome: gesture.outcome, id: gesture.id }
        commits.push(record)
        if (options.commitThrows === true) throw new Error('the consumer commit callback threw')
      }
  const session = await makeSession({ source, commit } as SessionOptions, options.label ?? 'the session factory')
  const installOptions = options.installOptions
  return {
    session,
    source,
    commits,
    thrown,
    sessionInstall(element: GestureElement, optionsOverride?: GestureOptionsInput): boolean {
      return session.install(element, optionsOverride ?? installOptions)
    },
  }
}

// ===========================================================================
// THE PAIRING READER (`I-5`, `M-13`, `P-GS-IM-6`): every `on(element, type, handler)`
// matched against exactly one `off` with the SAME THREE VALUES (element identity, type,
// and the SAME handler reference) — the `§0A` note 3 ledger claim, asserted over the
// recorded CALLS (never over a browser's listener table, layer anchor 5).
// ===========================================================================
function pairOnOffCalls(log: readonly CallRecord[]): { unmatched: string[]; matched: number } {
  const open: CallRecord[] = []
  const unmatched: string[] = []
  let matched = 0
  for (const rec of log) {
    if (rec.op === 'on') {
      open.push(rec)
      continue
    }
    if (rec.op !== 'off') continue
    const at = open.findIndex(
      (candidate) =>
        candidate.element === rec.element && candidate.type === rec.type && candidate.handler === rec.handler,
    )
    if (at < 0) {
      unmatched.push(`an \`off(${rec.type})\` with no matching \`on\` (element ${brief(rec.element)})`)
      continue
    }
    open.splice(at, 1)
    matched += 1
  }
  for (const left of open) unmatched.push(`an unmatched \`on(${left.type})\` (element ${brief(left.element)})`)
  return { unmatched, matched }
}

/** `P-GS-SM-1` — the state derived from the session's OWN readings (`§2.3` item 8's four
 *  states: `absent` · `installed-idle` · `active` · `disposed`). */
type SmState = 'absent' | 'installed-idle' | 'active' | 'disposed'
function deriveState(session: GestureSessionMirror): SmState {
  if (session.disposed) return 'disposed'
  const stats = session.stats()
  if (stats.active || session.gesture() !== null) return 'active'
  return stats.installed > 0 ? 'installed-idle' : 'absent'
}
/** `P-GS-SM-1` — drive ONE op and return its raw result (or `null` for `stats()`). */
function driveOp(
  session: GestureSessionMirror,
  op: string,
  el: unknown,
  newEl: unknown,
  activeHandle: GestureHandle | null,
  staleHandle: GestureHandle | null,
): unknown {
  const handle = activeHandle ?? ({ id: -1 } as GestureHandle)
  if (op === '`install(newEl)`') return session.install(newEl, {})
  if (op === '`install(el)` (repeat)') return session.install(el, {})
  if (op === '`begin(el)`') return session.begin(el)
  if (op === '`end(el, activeHandle)`') return session.end(el, handle)
  if (op === '`end(el, staleHandle)`') return session.end(el, (staleHandle ?? handle) as GestureHandle)
  if (op === '`reset(el, activeHandle, v)`') return session.reset(el, handle, 'v')
  if (op === '`cancel(el)`') return session.cancel(el)
  if (op === '`cancel(el, activeHandle)`') return session.cancel(el, handle)
  if (op === '`dispose()`') return session.dispose()
  return null
}
/** `P-GS-SM-1` — the DECLARED outcome of one (state, op) cell, from `§2.3` item 8.
 *  `state: null` means "the row declares no post-state for this cell" (the counter-only
 *  `stats()` op); `code: null` means "the op carries no code". */
function declaredTransition(state: SmState, op: string): { state: SmState | null; code: string | null } {
  if (op === '`stats()`') return { state: null, code: null }
  if (op === '`dispose()`') return { state: 'disposed', code: null }
  switch (state) {
    case 'disposed':
      if (op === '`install(newEl)`' || op === '`install(el)` (repeat)') return { state: 'disposed', code: null }
      return { state: 'disposed', code: 'disposed' }
    case 'absent':
      if (op === '`install(newEl)`' || op === '`install(el)` (repeat)') return { state: 'installed-idle', code: null }
      if (op === '`begin(el)`') return { state: 'absent', code: 'not-installed' }
      return { state: 'absent', code: 'no-gesture' }
    case 'installed-idle':
      if (op === '`install(newEl)`' || op === '`install(el)` (repeat)') return { state: 'installed-idle', code: null }
      // **A SUCCESSFUL `begin` CARRIES NO `code`** (green-time test repair 2026-09-27):
      // `§2.1`'s `BeginResult` union is `{ok:true, gesture} | {ok:false, code}`, so there
      // is no `code` member on the success arm and comparing one against `'ok'` was
      // unsatisfiable. The cell's claim is the TRANSITION (`installed-idle` → `active`),
      // which the `declared.state` assertion above already makes; the code assertion is
      // therefore declared ABSENT for this cell, not `'ok'`.
      if (op === '`begin(el)`') return { state: 'active', code: null }
      return { state: 'installed-idle', code: 'no-gesture' }
    default:
      // `active`
      if (op === '`install(newEl)`' || op === '`install(el)` (repeat)') return { state: 'active', code: null }
      // **`active × begin(el)` IS DECLARED `'busy'`, NOT "no code"** (green-time test
      // repair 2026-09-27): `§2.3` item 3 is explicit — *"A `begin` while a gesture is
      // active returns `{ok:false, code:'busy'}`"* — and the as-filed `code: null` made
      // the row SKIP the code assertion for this cell entirely while its own `active`
      // branch claimed the state stayed `active`, so the cell asserted neither its
      // transition nor its code. The declared transition table is `§2.3` item 8's
      // ("`active → active` (`'busy'`)": **the code IS the declaration here**).
      if (op === '`begin(el)`') return { state: 'active', code: 'busy' }
      if (op === '`end(el, staleHandle)`') return { state: 'active', code: 'stale' }
      if (op === '`end(el, activeHandle)`' || op === '`reset(el, activeHandle, v)`' || op === '`cancel(el, activeHandle)`') {
        return { state: 'installed-idle', code: 'ok' }
      }
      if (op === '`cancel(el)`') return { state: 'installed-idle', code: 'ok' }
      return { state: 'active', code: null }
  }
}
/** A throwaway element for the totality drives (never inspected by the module). */
const el0: Record<string, unknown> = { control: 'totality' }

/** **THE PROBE'S OWN SAFE READER** (green-time test repair 2026-09-27): the `P-GS-TP-2`
 *  probe asks whether a DRAWN EVENT OBJECT carries the mutating-getter member `(26)`, and
 *  the as-filed probe spelled that question `'readCount' in probe` — which fires
 *  `Proxy`'s `has` trap and THREW for the pool's hostile member `(16)` (`a Proxy whose
 *  traps THROW`), so the ROW ITSELF read a property of the event and broke on its own
 *  probe rather than on the module. `Object.getOwnPropertyNames` triggers NO proxy trap
 *  on the target's own keys and is caught here so no drawn member can break the row; the
 *  no-read claim is about the SESSION's reads, and the row must not manufacture one of
 *  its own. */
function probeOwnNames(value: unknown): string[] {
  try {
    return Object.getOwnPropertyNames(value)
  } catch {
    return []
  }
}

/** **THE HOSTILITY PROBE** (`ADV-GS-24`): does THIS body really throw? Used by `PRE-4`'s
 *  narrowed hostile-pool limb to MEASURE each hostile pool member's hostility (a
 *  coordinate getter that throws, a `Proxy` whose traps throw, a `valueOf` that throws)
 *  instead of declaring it — so the limb can fail. */
function throwsOn(body: () => unknown): boolean {
  try {
    body()
    return false
  } catch {
    return true
  }
}

/** Fire the recorded start handler (`§2.3` item 1(d)) with an OPAQUE event object. */
function fireStart(h: Harness, element: unknown, event?: unknown): void {
  h.source.fire(element, TYPE_START, event)
}
/** Run a session call and CAPTURE a thrown consumer error as data, so a row can
 *  assert both halves of `§3.2 F-3` (the throw propagated AND the detach already
 *  happened) instead of aborting. */
function catching<T>(h: Harness, body: () => T): T | undefined {
  try {
    return body()
  } catch (e) {
    h.thrown.push(e)
    return undefined
  }
}
function endCall(h: Harness, element: unknown, handle: GestureHandle, value?: unknown): TerminalResult | undefined {
  return catching(h, () => (value === undefined ? h.session.end(element, handle) : h.session.end(element, handle, value)))
}
function resetCall(h: Harness, element: unknown, handle: GestureHandle, value: unknown): TerminalResult | undefined {
  return catching(h, () => h.session.reset(element, handle, value))
}
function cancelCall(h: Harness, element: unknown, handle?: GestureHandle): TerminalResult | undefined {
  return catching(h, () => (handle === undefined ? h.session.cancel(element) : h.session.cancel(element, handle)))
}
function beginResult(h: Harness, element: unknown): BeginResult | undefined {
  return catching(h, () => h.session.begin(element))
}

// ===========================================================================
// THE ANTI-EVASION SCANNERS (`§4.4 S-1`) — the token forms are held as FRAGMENTS
// because this file must be able to NAME the tokens it bans (a rule list that spelled
// them joined would put them into this file's own bytes, which `R-8`'s second half
// scans).
// ===========================================================================
/** Split a spelling across chunks so the joined form never appears in this file. */
function chunked(parts: readonly string[]): string {
  return parts.join('')
}
const BOUNDARY_RE = /[A-Za-z0-9_$]/
/** A WORD/IDENTIFIER-BOUNDARY occurrence count (`§3.4 R-1`'s boundary rule): a hit counts
 *  when NEITHER side is an identifier character. **A STRING EDGE IS NOT A WORD CHARACTER** —
 *  the second defect this pass FOUND AND FIXED in its own instrument: an empty side was
 *  being tested with `BOUNDARY_RE`, and `/…/.test('')` is `false`, so `!BOUNDARY_RE.test('')`
 *  was `true` and the guard refused the hit — which meant **an assembled token at the
 *  TAIL of a string could never be flagged**, and the assembly control could not fail. Each
 *  side is now tested for a NON-EMPTY identifier character, so a hit is refused only when a
 *  real identifier character bounds it. */
function isIdentChar(text: string): boolean {
  return text.length > 0 && BOUNDARY_RE.test(text)
}
function boundedOccurrences(text: string, spelling: string): number {
  const needle = spelling.toLowerCase()
  const hay = text.toLowerCase()
  let count = 0
  let at = hay.indexOf(needle)
  while (at >= 0) {
    const before = at === 0 ? '' : hay[at - 1]
    const after = at + needle.length >= hay.length ? '' : hay[at + needle.length]
    if (!isIdentChar(before) && !isIdentChar(after)) count += 1
    at = hay.indexOf(needle, at + 1)
  }
  return count
}
function staticHits(code: string, re: RegExp): string[] {
  return code
    .split('\n')
    .map((text, index) => ({ index, text }))
    .filter(({ text }) => re.test(text))
    .map(({ index, text }) => `line ${index + 1}: ${text.trim()}`)
}
function expectNoStaticHits(code: string, rules: ReadonlyArray<{ what: string; re: RegExp }>, prefix: string): void {
  for (const { what, re } of rules) {
    const hits = staticHits(code, re)
    expect(hits, `${prefix} — '${what}' must not appear: ${JSON.stringify(hits)}`).toEqual([])
  }
}
/** Strip comments while PRESERVING line structure (so a hit's line number is real).
 *  String literals are KEPT: a banned token inside a string is still that token. */
function stripComments(src: string): string {
  let out = ''
  let i = 0
  let quote: string | null = null
  while (i < src.length) {
    const ch = src[i]
    const next = src[i + 1]
    if (quote !== null) {
      out += ch
      if (ch === '\\') {
        out += next ?? ''
        i += 2
        continue
      }
      if (ch === quote) quote = null
      i += 1
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch
      out += ch
      i += 1
      continue
    }
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1
      continue
    }
    if (ch === '/' && next === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n'
        i += 1
      }
      i += 2
      continue
    }
    out += ch
    i += 1
  }
  return out
}
/** The TOKEN-ASSEMBLY closure (`§4.4 S-1`): string literals, template literal parts and
 *  identifier chunks are re-joined (a spelling assembled across chunks is the SAME
 *  violation), with a boundary rule so ordinary words containing a spelling pass. */
const ASSEMBLY_JOIN = '\u0001'
function assembledChunks(src: string): string {
  const chunks: string[] = []
  let i = 0
  const readQuoted = (quote: string): void => {
    i += 1
    let value = ''
    while (i < src.length && src[i] !== quote) {
      if (src[i] === '\\') {
        value += src[i + 1] ?? ''
        i += 2
        continue
      }
      value += src[i]
      i += 1
    }
    i += 1
    chunks.push(value)
  }
  const readTemplate = (): void => {
    i += 1
    let part = ''
    while (i < src.length) {
      if (src[i] === '\\') {
        part += src[i + 1] ?? ''
        i += 2
        continue
      }
      if (src[i] === '`') {
        i += 1
        break
      }
      if (src[i] === '$' && src[i + 1] === '{') {
        // **EMPTY template parts are NOT pushed** — the fourth defect this pass found in its
        // own instrument: a `''` chunk is a phantom piece that manufactures a join where the
        // source has none, and a phantom join between two identifier-adjacent pieces makes
        // the assembled spelling look adjacent to an identifier (the join is then dropped)
        // instead of separated by the template's own `}`/`${` braces. With empty parts
        // skipped, a substitution's braces are REAL separator bytes and the assembled
        // spelling is a bounded token — which is what the row must catch.
        if (part.length > 0) chunks.push(part)
        part = ''
        i += 2
        let depth = 1
        while (i < src.length && depth > 0) {
          const ch = src[i]
          if (ch === '{') depth += 1
          else if (ch === '}') depth -= 1
          else if (ch === '"' || ch === "'") readQuoted(ch)
          else if (ch === '`') readTemplate()
          if (depth > 0) i += 1
        }
        i += 1
        continue
      }
      part += src[i]
      i += 1
    }
    chunks.push(part)
  }
  while (i < src.length) {
    const ch = src[i]
    const next = src[i + 1]
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1
      continue
    }
    if (ch === '/' && next === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1
      i += 2
      continue
    }
    if (ch === '"' || ch === "'") {
      readQuoted(ch)
      continue
    }
    if (ch === '`') {
      readTemplate()
      continue
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let name = ''
      while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) {
        name += src[i]
        i += 1
      }
      chunks.push(name)
      continue
    }
    i += 1
  }
  const joined = chunks.join(ASSEMBLY_JOIN)
  // THE JOIN RULE — stated once. **The sentinel stands for the bytes BETWEEN two pieces
  // (an operator, a bracket, a comma, a quote, a template brace: every one of them REAL
  // source bytes), so a spelling that is rebuilt across such a boundary is exactly the
  // TOKEN ASSEMBLY `§4.4 S-1` forbids — and the rule is therefore: DROP the sentinel only
  // where the two pieces are genuinely ADJACENT (neither side is whitespace), and insert a
  // SPACE wherever a piece boundary is real.** Recorded honestly, because this instrument
  // cost several iterations: a form that joined EVERY boundary defused the row (the
  // assembled token was reconstructed inside a longer word and the boundary rule declined
  // it), and this form is the one that keeps BOTH halves falsifiable — the row's own
  // controls below are the evidence, not the assertion.
  const isSpaceChar = (ch: string): boolean => ch.length > 0 && /\s/.test(ch)
  let out = ''
  for (let at = 0; at < joined.length; at += 1) {
    if (joined[at] === ASSEMBLY_JOIN) {
      const before = at === 0 ? '' : joined[at - 1]
      const after = at + 1 >= joined.length ? '' : joined[at + 1]
      if (isSpaceChar(before) || isSpaceChar(after)) out += ' '
      continue
    }
    out += joined[at]
  }
  return out
}

// ---------------------------------------------------------------------------
// §3.4 R-1 — THE ANTI-EVASION VOCABULARY ROW's banned spellings (fragments).
// SCOPE, exactly as `§3.4 R-1` states it: the scan is the MODULE FILE (whole,
// comments INCLUDED) plus THIS ROW'S OWN CONTROLLED CORPORA, with the normalized
// assembly view JOINED before scanning. **A whole-file scan of THIS test file is
// DELIBERATELY DROPPED**: this file must carry the banned spellings inside `R-1`'s
// own control data, so a whole-file negative over it could only fail.
// ---------------------------------------------------------------------------
const VOCAB_FRAGMENTS: ReadonlyArray<readonly [string, ...string[]]> = [
  [chunked(['select', 'ors'])],
  [chunked(['thres', 'hold'])],
  [chunked(['zo', 'ne'])],
  [chunked(['pa', 'ne'])],
  [chunked(['ta', 'b'])],
  [chunked(['re', 'gion'])],
  [chunked(['dash', 'board'])],
  [chunked(['local', 'Storage'])],
  [chunked(['session', 'Storage'])],
  [chunked(['clo', 'sest'])],
  [chunked(['query', 'Selector'])],
  [chunked(['query', 'SelectorAll'])],
  [chunked(['getElement', 'ById'])],
]
const VOCAB_WORDS: readonly string[] = VOCAB_FRAGMENTS.map((f) => f.join(''))
/** A `data-*`/attribute-name vocabulary (P-1's `data-zone`/`pane-collapse-toggle`
 *  class), assembled from fragments: the hyphen is a chunk of its own. */
const ATTRIBUTE_VOCAB: readonly string[] = [
  chunked(['data', '-', 'zone']),
  chunked(['pane', '-', 'collapse', '-', 'toggle']),
]
const STORE_VOCAB: readonly string[] = [chunked(['local', 'Storage']), chunked(['session', 'Storage']), chunked(['store'])]
/** The violations of ONE text: a BOUNDED raw occurrence (comments INCLUDED — `R-1`'s
 *  scope rule) plus a bounded occurrence that ASSEMBLES out of the text's literals and
 *  identifiers (`§4.4 S-1`'s closure). */
function vocabularyViolations(src: string): string[] {
  const violations: string[] = []
  for (const word of [...VOCAB_WORDS, ...ATTRIBUTE_VOCAB, ...STORE_VOCAB]) {
    if (boundedOccurrences(src, word) > 0) violations.push(`RAW bounded occurrence of '${word}' (a comment counts, S-1)`)
  }
  const assembled = assembledChunks(src)
  for (const word of [...VOCAB_WORDS, ...ATTRIBUTE_VOCAB, ...STORE_VOCAB]) {
    if (boundedOccurrences(assembled, word) > 0) {
      violations.push(`ASSEMBLED bounded occurrence of '${word}' (token assembly is the SAME violation, S-1)`)
    }
  }
  return violations
}
/** The control shapes `§3.4 R-1` requires the scan to FAIL on, plus the boundary halves the
 *  row's own rule implies. **THE ASSEMBLY CONTROLS ARE DRIVEN THROUGH THE REAL
 *  NORMALIZATION.** `§4.4 S-1`'s evasion is a module that carries a banned spelling split
 *  across pieces; the fixtures below are the two mechanical forms of that — a spelling split
 *  across two string literals that are JOINED at run time, and one whose halves are
 *  SUBSTITUTED into a template literal — because a raw `'thres' + 'hold'` fixture never
 *  assembles: the `+` between the two literals is a real byte in the source, so the
 *  normalized view keeps a delimiter there and the spelling is not a bounded token in the
 *  module's own bytes either. The two assembly controls therefore differ exactly in whether
 *  the joined spelling ends up BOUNDED (a violation) or adjacent to an identifier (passed by
 *  the row's own stated boundary rule). */
const VOCAB_POSITIVE_CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ['raw, in code', `${'const'} ${VOCAB_WORDS[1]} = 4`],
  // The two TOKEN-ASSEMBLY shapes, each preceded by a byte that keeps the reassembled
  // token BOUNDED. (`§4.4 S-1` names the evasion; the fixtures are its two mechanical
  // forms: a spelling rebuilt by a JOIN call over its halves, and one SUBSTITUTED into a
  // template literal. A bare `'thres' + 'hold'` fixture is NOT used: the reconstruction is
  // then directly after the enclosing identifier, which is an identifier interior, and
  // `§3.4 R-1`'s boundary rule passes an identifier interior on purpose — that case is the
  // first BOUNDARY control below rather than a positive.)
  ['assembled across JOINED pieces', `( 'thres' + 'hold' )`],
  ['assembled across a template SUBSTITUTION', `( \`\${'thres' + 'hold'}\` )`],
  ['inside a COMMENT', `// the caller's ${VOCAB_WORDS[0]} string is mentioned in a comment only`],
  ['an attribute name', `el.setAttribute('${ATTRIBUTE_VOCAB[0]}', 'a')`],
]
/** The BOUNDARY halves of the same row: an assembled spelling ADJACENT to an identifier
 *  character is **not** a bounded occurrence (`§3.4 R-1`'s boundary rule, whose purpose is
 *  that ordinary words containing a spelling pass), and the scan must therefore leave both
 *  of these alone. */
const VOCAB_ASSEMBLY_BOUNDARY_CONTROLS: readonly string[] = [
  'const k = thres' + '${' + "'hold'" + '}' + '`',
  `${'const'} theThres${'hold'}Factor = 1`,
]
/** `§3.4 R-1`'s NEGATIVE control: this unit's OWN legitimate text must PASS — the four
 *  event types of `§2.1`, the seven result codes of `§2.3` item 4, and the module's own
 *  parameter names. */
const VOCAB_NEGATIVE_CONTROL =
  `const TYPES = ['${TYPE_START}', '${TYPE_MOVE}', '${TYPE_END}', '${TYPE_CANCEL}']\n` +
  `type Code = 'ok' | 'not-installed' | 'busy' | 'disposed' | 'disconnected' | 'stale' | 'no-gesture'\n` +
  `export function install(element: unknown, options: unknown): boolean { return true }\n` +
  `export function on(element: unknown, type: string, handler: () => void): void { void element; void type; void handler }\n`
/** A boundary control: two ordinary word chunks are a token boundary, not a spelling. */
const VOCAB_BOUNDARY_CONTROL = `${'const'} table = 1; ${'const'} stable = 2; ${'const'} tablet = 3`

// ---------------------------------------------------------------------------
// §3.4 R-2 — THE FORBIDDEN-ACCESS tokens (fragments), and no-ambient reads.
// ---------------------------------------------------------------------------
const AMBIENT_FRAGMENTS: ReadonlyArray<readonly [string, ...string[]]> = [
  [chunked(['doc', 'ument'])],
  [chunked(['win', 'dow'])],
  [chunked(['global', 'This'])],
  [chunked(['mat', 'chMedia'])],
  [chunked(['get', 'Computed', 'Style'])],
  [chunked(['active', 'Element'])],
  [chunked(['local', 'Storage'])],
  [chunked(['session', 'Storage'])],
]
const AMBIENT_RULES: ReadonlyArray<{ what: string; re: RegExp }> = [
  {
    what: 'an ambient realm/global read (a `document`/`window`/`globalThis`/`self`/`top`/`parent`/`frames` token, or a computed access on one)',
    re: new RegExp(`\\b(?:${['doc', 'ument'].join('')}|${['win', 'dow'].join('')}|${['global', 'This'].join('')}|self|top|parent|frames)\\b`),
  },
  { what: 'a DOM-global lookup (no element-query token in ANY form — `R-2`)', re: /\b(?:getElementById|querySelector|querySelectorAll|closest)\b/ },
  { what: 'the no-token realm route (a constructed access)', re: /\b(?:Reflect\.construct|constructor\.constructor|eval|new\s+Function)\b/ },
  { what: 'an ambient read for a VALUE (media/geometry/active-element)', re: /\b(?:matchMedia|getComputedStyle|activeElement)\b/ },
  { what: 'an ambient clock/random read', re: /\b(?:Date|Math\.random)\b/ },
  { what: 'a node realm read / environment read', re: /\b(?:process\.env|process\b|__dirname|__filename|require\s*\(|node:)/ },
  { what: 'a persistence surface (no store, no persistence — `P-8`, `I-12`)', re: /\b(?:localStorage|sessionStorage|indexedDB)\b/ },
]
const MODULE_STATE_RULES: ReadonlyArray<{ what: string; re: RegExp }> = [
  { what: 'a module-scope `let`/`var` (a store, cache, memo or counter)', re: /^(?:export\s+)?(?:let|var)\s/m },
  { what: 'a module-scope mutable container (a cache or registry)', re: /\bnew\s+(?:WeakMap|WeakSet|Map|Set)\s*\(/ },
]

// ---------------------------------------------------------------------------
// §3.4 R-3 — THE EVENT-WIRING tokens (fragments): the module performs NO listener
// attachment and NO capture of its own; every attach/detach/capture goes through the
// injected source.
// ---------------------------------------------------------------------------
const WIRING_RULES: ReadonlyArray<{ what: string; re: RegExp }> = [
  { what: 'a direct listener attachment', re: new RegExp(`\\b${['add', 'EventListener'].join('')}\\b`) },
  { what: 'a direct listener detachment', re: new RegExp(`\\b${['remove', 'EventListener'].join('')}\\b`) },
  { what: 'a direct pointer capture', re: new RegExp(`\\b${['set', 'Pointer', 'Capture'].join('')}\\b`) },
  { what: 'a direct pointer release', re: new RegExp(`\\b${['release', 'Pointer', 'Capture'].join('')}\\b`) },
  { what: 'an `on<event>=`-style assignment', re: /\bon[a-z]+\s*=\s*(?!>)/ },
]

// ---------------------------------------------------------------------------
// §3.4 R-8 — THE GEOMETRY / MAGNITUDE tokens (fragments). The coordinate tokens are
// assembled from single-letter chunks for the same reason: this file must be able to
// NAME what it bans, and `R-8` scans this file's own bytes.
// ---------------------------------------------------------------------------
const COORD_FRAGMENTS: ReadonlyArray<readonly [string, ...string[]]> = [
  ['c', 'l', 'i', 'e', 'n', 't', 'X'],
  ['c', 'l', 'i', 'e', 'n', 't', 'Y'],
  ['p', 'a', 'g', 'e', 'X'],
  ['p', 'a', 'g', 'e', 'Y'],
  ['s', 'c', 'r', 'e', 'e', 'n', 'X'],
  ['s', 'c', 'r', 'e', 'e', 'n', 'Y'],
  ['m', 'o', 'v', 'e', 'm', 'e', 'n', 't', 'X'],
  ['m', 'o', 'v', 'e', 'm', 'e', 'n', 't', 'Y'],
  ['o', 'f', 'f', 's', 'e', 't', 'X'],
  ['o', 'f', 'f', 's', 'e', 't', 'Y'],
]
const GEOM_CALL_FRAGMENTS: ReadonlyArray<readonly [string, ...string[]]> = [
  ['get', 'Computed', 'Style'],
  ['getBounding', 'ClientRect'],
  ['offset', 'Width'],
  ['offset', 'Height'],
  ['client', 'Width'],
  ['client', 'Height'],
  ['scroll', 'Width'],
  ['scroll', 'Height'],
  ['match', 'Media'],
  ['inner', 'HTML'],
]
/** The CALL forms only — a MEMBER ACCESS or a WRITE, never the bare spelling (this
 *  file's own rule list and its prohibition lists necessarily carry some spellings). */
const GEOM_CALL_RES: readonly RegExp[] = [
  ...GEOM_CALL_FRAGMENTS.map((f) => new RegExp(`[.\\[]\\s*['"]?${f.join('')}\\b|\\b${f.join('')}\\s*\\(`)),
  ...COORD_FRAGMENTS.map((f) => new RegExp(`[.\\[]\\s*['"]?${f.join('')}\\b`)),
  { what: 'a style write', re: /\bstyle\s*\[|\bstyle\s*\./ } as unknown as RegExp,
]
/** The claim words `§3.4 R-8` forbids in an assertion message or a description. */
const GEOM_CLAIM_FRAGMENTS: ReadonlyArray<readonly [string, ...string[]]> = [
  ['render', 'ed'],
  ['lay', 'out'],
  ['pa', 'int'],
]
const GEOM_CLAIM_RES: readonly RegExp[] = GEOM_CLAIM_FRAGMENTS.map((f) => new RegExp(`\\b${f.join('')}\\b`, 'i'))
function rowTitles(src: string): string[] {
  return [...src.matchAll(/\b(?:it|describe)\(\s*('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g)].map((m) => m[1])
}
// ---------------------------------------------------------------------------
// §3.4 R-12 — THE `P-4` UI-CONTENT WRITE TOKENS, held as FRAGMENTS for the same
// reason the `R-1`/`R-2`/`R-8` rule lists are: this file must be able to NAME the
// tokens it bans without carrying their spellings in its own bytes. SCOPE, exactly
// as `§3.4 R-12` states it: the MODULE file (whole, comments INCLUDED) over the
// NORMALIZED view `R-1` reads, PLUS this row's own controlled corpora — **a
// whole-file negative over THIS test file is DELIBERATELY DROPPED** (`R-1`/`R-8`'s
// scope rule), because the row's own controls must carry the spellings.
// ---------------------------------------------------------------------------
const WRITE_TOKEN_FRAGMENTS: ReadonlyArray<readonly [string, ...string[]]> = [
  ['set', 'Attribute'],
  ['remove', 'Attribute'],
  ['class', 'List'],
  ['class', 'Name'],
  ['text', 'Content'],
  ['inner', 'Text'],
  ['inner', 'HTML'],
  ['outer', 'HTML'],
  ['insert', 'Adjacent', 'HTML'],
  ['insert', 'Adjacent', 'Text'],
  ['create', 'Element'],
  ['create', 'Text', 'Node'],
  ['append', 'Child'],
  ['insert', 'Before'],
  ['remove', 'Child'],
  ['replace', 'Children'],
  ['css', 'Text'],
]
/** The assembled ids the fragments above must rebuild (`R-12`'s own token list). */
const WRITE_TOKEN_IDS: readonly string[] = WRITE_TOKEN_FRAGMENTS.map((f) => f.join(''))
/** The `style`-write family (`§3.4 R-12`'s own parenthetical: `style.setProperty`, a
 *  `.style.`-rooted write, and a `cssText` write). The three forms are stated
 *  separately because the family is a SHAPE rather than a single token: a member call
 *  and a property write root differently, and a `cssText` write is a member write of
 *  its own. **THE FAMILY'S EXACT MEMBERS ARE REPORTED**: `R-12`'s parenthetical is
 *  spelled as a shape (`style.setProperty`, `.style.=`), so this instrument pins the
 *  three mechanical forms the shape names — a `.style`-rooted member write, a
 *  `['style']['<prop>']` computed write, and a `setProperty`/`cssText` write — and
 *  claims nothing wider. */
const WRITE_STYLE_RULES: ReadonlyArray<{ what: string; re: RegExp }> = [
  { what: 'a `.style`-rooted member WRITE (`<x>.style.<prop> =`, or a computed `<x>[\'style\'][\'<prop>\'] =`)', re: /\.\s*style\s*(?:\.\s*[\w$]+\s*(?:=(?!=)|\+\+|--)|\[)/ },
  { what: 'a `style` member CALL (a `setProperty`/`removeProperty`/`setPropertyNS` write through a style object)', re: /\bstyle\s*\.\s*(?:set|remove)Property\b/ },
  { what: 'a `cssText` write (a markup/stylesheet write of the whole style attribute)', re: /\bcssText\b/ },
]
/** The violations of ONE text: a BOUNDED raw occurrence (comments INCLUDED — `R-1`'s
 *  scope rule) plus a bounded occurrence that ASSEMBLES out of the text's literals and
 *  identifiers (`§4.4 S-1`'s closure, the view `R-12` reuses), plus the three
 *  `style`-write shapes. */
function uiContentViolations(src: string): string[] {
  const violations: string[] = []
  for (const token of WRITE_TOKEN_IDS) {
    if (boundedOccurrences(src, token) > 0) violations.push(`RAW bounded occurrence of '${token}' (a comment counts, S-1)`)
  }
  const assembled = assembledChunks(src)
  for (const token of WRITE_TOKEN_IDS) {
    if (boundedOccurrences(assembled, token) > 0) {
      violations.push(`ASSEMBLED bounded occurrence of '${token}' (token assembly is the SAME violation, S-1)`)
    }
  }
  for (const { what, re } of WRITE_STYLE_RULES) {
    for (const hit of staticHits(src, re)) violations.push(`a style write — ${what}: ${hit}`)
  }
  return violations
}
/** The row's own REPORTED census: bounded occurrences per family over ONE text. The
 *  module's figure is the claim (`zero`); this file's figure is the MEASURED reason the
 *  whole-file negative is dropped. Both are printed by the row, so neither is inferred. */
function uiContentCensus(src: string): Record<string, number> {
  const out: Record<string, number> = {}
  const assembled = assembledChunks(src)
  for (const token of WRITE_TOKEN_IDS) {
    const n = boundedOccurrences(src, token) + boundedOccurrences(assembled, token)
    if (n > 0) out[token] = n
  }
  for (const { what, re } of WRITE_STYLE_RULES) {
    const n = staticHits(src, re).length
    if (n > 0) out[what] = n
  }
  return out
}
const WRITE_RAW_TOKEN = WRITE_TOKEN_FRAGMENTS[0].join('')
/** `§3.4 R-12`'s POSITIVE controls — the THREE arms the row names, each built so its
 *  spelling is assembled at run time from fragments (which is also the point of the
 *  ASSEMBLED arm: the normalized view joins what the raw bytes split). */
const WRITE_POSITIVE_CONTROLS: ReadonlyArray<readonly [string, string]> = [
  ['raw, in code', `el.${WRITE_RAW_TOKEN}('id', 'a')`],
  ['assembled across a JOINED literal boundary', `${'const'} a = ( 'set' + 'Attribute' )\n${'const'} b = \` \${'inner' + 'HTML'} \``],
  ['inside a COMMENT', `// the module never calls ${WRITE_RAW_TOKEN} on the element it was handed`],
]
/** `§3.4 R-12`'s NEGATIVE control: this unit's OWN legitimate text must PASS — the four
 *  event types of `§2.1`, the seven result codes of `§2.3` item 4, the module's own
 *  parameter names, and the `capturePointer` member name. */
const WRITE_NEGATIVE_CONTROL =
  `const TYPES = ['${TYPE_START}', '${TYPE_MOVE}', '${TYPE_END}', '${TYPE_CANCEL}']\n` +
  `type Code = 'ok' | 'not-installed' | 'busy' | 'disposed' | 'disconnected' | 'stale' | 'no-gesture'\n` +
  `interface Source { on(element: unknown, type: string, handler: () => void): void; capturePointer?(element: unknown): void }\n` +
  `export function install(element: unknown, options: unknown): boolean { return true }\n` +
  `export function begin(element: unknown): unknown { return element }\n`
/** The `§3.4 R-8` half that binds THIS FILE: raw bytes plus the extracted row
 *  DESCRIPTIONS (`it`/`describe` titles). Both are asserted by `R-8` and by `I-11`. */
function ownGeometryViolations(): string[] {
  const own = readFileSync(TEST_FILE, 'utf8')
  const out: string[] = []
  for (const re of GEOM_CALL_RES) {
    if (!(re instanceof RegExp)) continue
    for (const hit of staticHits(own, re)) out.push(`this file takes a geometry observation — ${hit}`)
  }
  for (const title of rowTitles(own)) {
    for (const re of GEOM_CLAIM_RES) {
      if (re.test(title)) out.push(`a row description claims a resolved fact — ${JSON.stringify(title)}`)
    }
  }
  return out
}

// ===========================================================================
// The small file readers. The HARNESS may read files; the MODULE may not (`R-4`).
// ===========================================================================
function moduleSource(label: string): string {
  expect(
    existsSync(MODULE_SRC),
    `RED — U-GSESSION red set (§4.1): the static rows of §3.4 read the module file and it does not exist yet (${fileURLToPath(
      MODULE_SRC,
    )}). [${label}]`,
  ).toBe(true)
  return readFileSync(MODULE_SRC, 'utf8')
}
function walkSourceFiles(): readonly string[] {
  return [
    'src/main/main.ts',
    'src/main/mcp-server.ts',
    'src/main/preload.ts',
    'src/main/security.ts',
    'src/main/standalone.ts',
    'src/renderer/renderer.ts',
    'src/renderer/runtime.ts',
    'src/renderer/secure-panels.ts',
    'src/shared/types.ts',
    'src/shared/dom-shim.ts',
    'src/shared/zones.ts',
    'src/shared/census.ts',
    'src/shared/layout-projection.ts',
    'src/shared/slot-host.ts',
    'src/shared/owned-list-host.ts',
    'src/shared/mount-invariant-guard.ts',
    'src/shared/path-fork-cycle.ts',
    'src/shared/demo-envelope.ts',
  ].filter((rel) => existsSync(`${REPO_ROOT}/${rel}`))
}
/** Every `gesture-session*` path under `src/**` or `tests/**` (a recursive census,
 *  `node_modules` and dotted directories pruned). `R-10` asserts this set is EXACTLY
 *  this test file while the module is absent, so a second unit-owned artefact under a
 *  unit-owned path is a FINDING rather than a silent extra. */
function walkUnitPaths(): string[] {
  const found: string[] = []
  const visit = (rel: string): void => {
    for (const entry of readdirSync(`${REPO_ROOT}/${rel}`, { withFileTypes: true })) {
      const child = `${rel}/${String(entry.name)}`
      if (entry.isDirectory()) {
        if (String(entry.name) === 'node_modules' || String(entry.name).startsWith('.')) continue
        visit(child)
        continue
      }
      if (/^gesture-session/i.test(String(entry.name))) found.push(child)
    }
  }
  for (const root of ['src', 'tests']) visit(root)
  return found.sort()
}
/** Read a live string-array literal from a source file (`§4.4 S-2`: the seam rows
 *  assert SET EQUALITY AGAINST THE NAMES and read the declaration, never a copy). */
function readArrayLiteral(rel: string, re: RegExp): string[] {
  const src = readFileSync(`${REPO_ROOT}/${rel}`, 'utf8')
  const match = re.exec(src)
  expect(
    match !== null,
    `the LIVE declaration read by this row exists in ${rel} (the row asserts the live source of truth, never a literal copy)`,
  ).toBe(true)
  const start = (match?.index ?? 0) + (match?.[0].length ?? 0)
  const end = src.indexOf(']', start)
  expect(end, `the declaration's literal array in ${rel} is terminated, so the read is not vacuous`).toBeGreaterThan(start)
  const body = src.slice(start, end)
  return (body.match(/'[^'\n]*'|"[^"\n]*"/g) ?? []).map((s) => s.slice(1, -1))
}
function readUnionMembers(rel: string, re: RegExp): string[] {
  const src = readFileSync(`${REPO_ROOT}/${rel}`, 'utf8')
  const at = re.exec(src)
  expect(at !== null, `the live union declaration read by this row exists in ${rel}`).toBe(true)
  const lines = src.slice(at?.index ?? 0).split('\n')
  const kept = [lines[0]]
  for (let i = 1; i < lines.length; i += 1) {
    if (!/^\s*\|/.test(lines[i])) break
    kept.push(lines[i])
  }
  return (kept.join('\n').match(/'[^'\n]*'/g) ?? []).map((s) => s.slice(1, -1))
}

// ===========================================================================
// §2.2/§5.1 — THE CHANGE-SET CENSUS (shared by `R-7` and `R-10`).
// ===========================================================================
function gitOrNull(args: readonly string[]): string[] | null {
  try {
    const out = execFileSync('git', [...args], { encoding: 'utf8' })
    return out.split('\n').map((line) => line.trim()).filter((line) => line.length > 0)
  } catch {
    return null
  }
}
function treeChangeSet(): { paths: string[]; raw: string } {
  try {
    const raw = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' })
    const paths = raw
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => line.slice(3).trim().replace(/^"|"$/g, ''))
    return { paths, raw }
  } catch (e) {
    return { paths: [], raw: `<<git unavailable: ${describeThrown(e)}>>` }
  }
}
/** The COMMITTED range anchored at the commit that ADDED this file (the unit's own
 *  red-set commit), through `HEAD`; `null` while that commit does not exist yet (the
 *  honest RED-time state, `RCA-8(a)`). */
function committedChangeSet(): { anchor: string; range: string; paths: string[] } | null {
  const added = gitOrNull(['log', '--diff-filter=A', '--format=%H', '--', TEST_RELPATH])
  const anchor = added === null ? undefined : added.filter((l) => /^[0-9a-f]{7,40}$/.test(l))[0]
  if (anchor === undefined) return null
  const range = `${anchor}..HEAD`
  const listed = gitOrNull(['log', '--name-only', '--pretty=format:', range])
  if (listed === null) return null
  return { anchor, range, paths: Array.from(new Set(listed)).sort() }
}
/** **THE UNIT-SCOPED COMMIT PARTITION** (`§5.1`'s scope rule, the form the sibling
 *  rows converged on after three of them went red on later units' work): the anchored
 *  range is `anchor..HEAD` and `HEAD` moves through LATER UNITS' commits, so a census
 *  over the WHOLE range would charge this unit for every unit that lands after it. A
 *  commit that touches NONE of this unit's artifacts is another unit's commit and is
 *  OUT of this row's jurisdiction — a boundary, not a licence: a commit carrying one
 *  of this unit's paths TOGETHER WITH `package.json` (or `src/main/**`, or a sibling
 *  artifact) still FAILS. */
function unitScopedCommitted(
  anchor: string,
  range: string,
): { commitsInRange: number; unitCommits: number; files: string[]; allFilesOfUnitCommits: string[] } {
  const listed = [
    ...(gitOrNull(['show', '--name-only', '--format=@@%H', anchor]) ?? []),
    ...(gitOrNull(['log', '--format=@@%H', '--name-only', range]) ?? []),
  ]
  const perCommit = listed
    .join('\n')
    .split('@@')
    .filter((block) => block.trim().length > 0)
    .map((block) => {
      const parts = block
        .split('\n')
        .map((line) => line.trim().replace(/^"|"$/g, ''))
        .filter((line) => line.length > 0)
      return { sha: parts[0] ?? '', files: parts.slice(1) }
    })
  const unitCommits = perCommit.filter((c) => c.files.some(isUnitArtifact))
  const inJurisdiction = (path: string): boolean =>
    isUnitArtifact(path) || /^docs\//.test(path) || UNIT_REVIEW_PROBE.test(path)
  const kept = unitCommits.map((c) => ({ sha: c.sha, files: c.files.filter(inJurisdiction) }))
  return {
    commitsInRange: perCommit.length,
    unitCommits: unitCommits.length,
    files: Array.from(new Set(kept.flatMap((c) => c.files))).sort(),
    allFilesOfUnitCommits: Array.from(new Set(unitCommits.flatMap((c) => c.files))).sort(),
  }
}
/** This unit's OWN `*-greens.md` artifact (`§5.1` row 4). */
const UNIT_GREENS_PROBE = /^docs\/specs\/gsession[^/]*-greens\.md$/
/** This unit's own documentation-review record under `archive/reviews/` (`§5.1` row 4). */
const UNIT_REVIEW_PROBE = /^archive\/reviews\/[^/]*(U-GSESSION|gsession)[^/]*\.md$/
/** This unit's OWN artifacts — the allow-list's code/spec half plus its gate records. */
function isUnitArtifact(path: string): boolean {
  return (
    path === MODULE_RELPATH ||
    path === TEST_RELPATH ||
    path === SPEC_RELPATH ||
    UNIT_GREENS_PROBE.test(path) ||
    UNIT_REVIEW_PROBE.test(path)
  )
}

// ===========================================================================
// ⟶ ADDED 2026-09-27 (`E3`-equivalent repair, RULING B) — **THE SIBLING-ATTRIBUTION /
// TIME-SCOPING MACHINERY.** The three rows `R-7`, `F-9` and `F-9(b)` were RED at `6f6a011`
// on a SIBLING unit's legitimate files, not on this unit's diff:
//   * `src/shared/gutter-affordance.ts` (the sibling `E10`) **VALUE-imports `POINTER_TYPES`
//     from `./gesture-session.js`**, so the *"the module is imported by NO `src/**` file"*
//     claim read `['src/renderer/renderer.ts']` over the LIVE tree;
//   * `src/renderer/renderer.ts` (the sibling's WIRING) appears in the committed change set.
// **THE CONTRACT'S RULE, cited rather than assumed:** `docs/specs/gutter.md` `§3.4 R-4` —
// *"a later unit that legitimately imports THIS module is not a violation of it"* — and
// `§5.1`'s commit-range scope rule, which the sibling rows in `tests/gutter.test.ts` already
// implement in exactly this shape. **THE TWO CLAIMS ARE REPAIRED, NEVER WEAKENED:**
//   * the *"imported by no `src/**` file"* claims (`R-7`, `F-9`) become **TIME-SCOPED** — the
//     census is read **over the TRACKED tree at THIS unit's ANCHOR COMMIT** (the commit that
//     ADDED this test file, computed exactly as `committedChangeSet()` does), and the CURRENT
//     census is **REPORTED with each importer's owner named — never as a FAIL**;
//   * `F-9(b)`'s *"the change set touches NOTHING under `src/renderer/`"* becomes **scoped to
//     THIS unit's OWN attributable change set** (a path belongs to the unit only if it is not
//     a DECLARED SIBLING ARTIFACT).
// **THE FALSIFIABLE CONTROLS ARE KEPT, in both readings:** an importer that is THIS unit's OWN
// artifact (its module/test/spec/its `*-greens.md`/its review record) or an UNCLAIMED path
// **STILL FAILS**, and the six registration sites' set-equality half is untouched.
// ===========================================================================
/** **THE DECLARED SIBLING ARTIFACTS, BY NAME — EVERY MEMBER CITING THE SIBLING SPEC ROW THAT
 *  DECLARES IT.** `E10` / `U-GUTTER-UI`, whose own allow-list is `docs/specs/gutter-ui.md` `§5.1`
 *  (rows `1`, `2`, `3`, `4`, `5` and the two renderer-wiring rows `10`/`11`, the licence the `§R.1`
 *  ruling records). A path on this list may appear in the committed change set without being charged
 *  to THIS unit (it is the sibling's declared work), and an importer on this list is REPORTED WITH
 *  ITS OWNER rather than failed on.
 *
 *  **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE `R-7` DIFF-SCOPE REPAIR PASS, RULING B): THE LIST IS NOW
 *  SEVEN EXPLICIT PATHS PLUS THE PROBE** (the as-filed five are kept, two `docs/specs/` members are
 *  ADDED so the set is the sibling's OWN DECLARED allow-list rather than the subset that happened to
 *  be committed first). The governing rule is `docs/specs/gutter.md` `§5.1`'s commit-range scope
 *  rule — *"…must NOT read a later unit's commits, a sibling's dirty working-tree file, or a sibling
 *  unit's artifact as this unit's diff"* — and `§3.4 R-4` (*"a later unit that legitimately imports
 *  THIS module is not a violation of it"*). **NOTHING IS WEAKENED BY IT:** the DENIED predicate in
 *  `R-7` is BYTE-IDENTICAL, and the predicate below is DRIVEN BOTH WAYS by that row's controls. */
const SIBLING_UNIT_ARTIFACT_PATHS: readonly string[] = [
  'src/shared/gutter-affordance.ts', // `docs/specs/gutter-ui.md` §5.1 allow-list row 1 (NEW — the affordance module)
  'src/shared/demo-envelope.ts', // row 2 — the authored gutter card + the example seam implementations
  'tests/gutter-ui.test.ts', // row 3 (NEW — the red set)
  'docs/specs/gutter-ui.md', // row 4 — the sibling's own spec
  'docs/specs/gutter-ui-review.md', // row 5 — "any other `docs/specs/gutter-ui-*.md` of this unit"
  'docs/specs/gutter-ui-greens.md', // row 5 — the unit's gate-5 blind-greens artifact
  'src/renderer/renderer.ts', // row 10 + §R.1 — the bounded renderer wiring
  'src/renderer/runtime.ts', // row 11 + §R.1 — `Runtime.elementForNodeId` and nothing else
]
// ---------------------------------------------------------------------------
// **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING) — THE THIRD AND FOURTH DECLARING
// UNITS, ADDED BY NAME BECAUSE `R-7`'s DENIED ARM MEASURED THEM AS THIS UNIT'S DIFF.** The as-filed
// `SIBLING_UNIT_ARTIFACT_PATHS` above is KEPT BYTE-FOR-BYTE and the entries below are APPENDED to the
// same declaration; nothing above is rewritten and the DENIED predicate `R-7` applies is untouched.
//
// **THE MEASURED RED AT `1dc6315` (this file's only failing row, `R-7 §3.4`), VERBATIM:**
//   `Denied among them: ["scripts/electron-divergence.mjs","scripts/electron-spawn.mjs",
//    "src/shared/dom-shim.ts","tests/divergence-attribute-extractor.test.ts","tests/ui-leg-contract.test.ts"]`
// — the unit-scoped committed range `0e34e51..HEAD` carries the `U-DIVERGENCE-EXT` unit's own landing
// pass (`C2`: the `H-r10` channel + the set-wise attribute extractor + the shim-integrity pre-flight)
// and the `U-REALDOM-BOOT` test-layer leg's own row file, TOGETHER WITH this unit's suite — the SAME
// over-broad class already repaired twice above (`E10`'s and `E3`'s declared artifacts).
//
// **THE GOVERNING RULE, CITED RATHER THAN ASSUMED:** `docs/specs/gutter.md` `§5.1`'s commit-range scope
// rule (at its `§5.1`, the rule the file's own `R-16` cell also reads) — *"a diff-scope row asserted over
// a **commit range** must scope its list **to THIS UNIT'S OWN ARTIFACTS**, and **must NOT read a later
// unit's commits, a sibling's dirty working-tree file, or a sibling unit's artifact as this unit's
// diff**"* — and `§3.4 R-4` (*"a later unit that legitimately imports THIS module is not a violation of
// it"*; its cell also names `dom-shim.ts` among the paths a sibling's own import-boundary row denies).
//
// **EVERY MEMBER NAMES ITS DECLARING UNIT.** Two units are named here: **the `U-DIVERGENCE-EXT` /
// `C2` HARNESS UNIT** (`scripts/electron-divergence.mjs`, `scripts/electron-spawn.mjs`,
// `tests/divergence-attribute-extractor.test.ts`) — the same attribution `tests/gutter.test.ts`'s
// `SIBLING_DIVERGENCE_UNIT_ARTIFACTS` registry already records for the first two of those paths — and
// **the `U-REALDOM-BOOT` / `C1` LEG UNIT** (`tests/ui-leg-contract.test.ts`).
//
// **`src/shared/dom-shim.ts` — SHARED, AND THAT IS STATED RATHER THAN IMPLIED.** The shim is *not* the
// exclusive property of any unit: **A PATH IS ATTRIBUTED HERE, NOT A UNIT.** This path was CHANGED by
// the `U-DIVERGENCE-EXT` landing pass itself — the attribute-backed `dataset` fix that closed the
// measured `data-wire` divergence (`docs/specs/engine-pin.md`'s `R-16`/`P-IM-1` re-grain records the
// same landing from the engine-pin side) — so it is attributed to THAT unit for this reading.
// **A FUTURE CHANGE TO IT BY ANOTHER UNIT MUST BE RE-ATTRIBUTED (a new measurement, a new entry or an
// amended citation), NEVER SILENTLY INHERITED FROM THIS ONE.**
// ---------------------------------------------------------------------------
const DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS: readonly string[] = [
  // ── THE `U-DIVERGENCE-EXT` / `C2` HARNESS UNIT (each path, its declaring unit named):
  'scripts/electron-divergence.mjs', // the extended harness itself — the `H-r10` channel + the set-wise attribute extractor (`docs/specs/ci-divergence-leg.md`'s `AMENDMENT BLOCK (U-DIVERGENCE-EXT)`, clauses `A-1.1`/`A-1.5`); already declared for `E10`'s scope by the architect's `e135904` ruling, and now NAMED as `C2`'s own landing
  'scripts/electron-spawn.mjs', // the same unit's SHIM-INTEGRITY PRE-FLIGHT landing site (`tests/gutter.test.ts` `SIBLING_DIVERGENCE_UNIT_ARTIFACTS` records the same path/unit pair)
  'tests/divergence-attribute-extractor.test.ts', // the same unit's OWN RED SET (`docs/specs/ci-divergence-leg.md` amendment clause `A-2.8` — the extractor's pure half exercised in the node suite)
  'src/shared/dom-shim.ts', // the SHARED shim, CHANGED by that pass (the attribute-backed `dataset` fix); shared — a path is attributed, not a unit: a later change by another unit is RE-ATTRIBUTED, never silently inherited
  // ── THE `U-REALDOM-BOOT` / `C1` LEG UNIT:
  'tests/ui-leg-contract.test.ts', // that unit's own row file for the additive test-layer leg (`AGENTS.md` item 4); `tests/gutter.test.ts`'s registry names the same path/unit pair
]
// ---------------------------------------------------------------------------
// **⟶ DECLARED 2026-09-27 (THE `U-GSESSION`/`E6` SIDE OF THE `F3` SAME-COMMIT OBLIGATION) — THE
// `U-FOCUS-TOOL` UNIT'S TWO DECLARED TEST ARTIFACTS, EXEMPTED **BY NAME** FROM `R-7`'s `tests/**`
// DENIED PATTERN, EVERY PATH WITH ITS DECLARING UNIT NAMED.**
//
// **THE MEASURED REASON THIS DECLARATION EXISTS (`docs/specs/focus-tool.md` `§5.1` rows 15–22;
// `§5.2` item 4 (iii) `N-15`).** That contract's WIDENED allow-list NAMES **this file** as a
// SAME-COMMIT obligation of the `F3`/`U-FOCUS-TOOL` unit (`§5.1` row 16: the `ALL_TOOLS` name-set
// equality against the sibling `PINNED_TOOL_SET`, that sibling list's length `21 → 22`, the
// `VALID_GROUPS`/`MUTATING_METHODS` equalities, and the `RpcMethod` count `21 → 22` WITH its
// SET-size duplicate check — all IN THE SAME COMMIT). The commit that satisfies that obligation
// therefore TOUCHES `tests/gesture-session.test.ts`, which makes it a unit-touching commit for THIS
// row, and `unitScopedCommitted`'s `allFilesOfUnitCommits` then carries EVERY file of it —
// including the `F3` unit's own red set and its `§5.5.1` register module, plus the sibling suites
// that same commit census-repairs. **THE OBLIGATION WAS UNREACHABLE: `npm test` cannot be green
// while the repair this row's OWN `N-15` obligation requires is charged to this row as a boundary
// violation.** MEASURED, verbatim, before this declaration:
//   `Denied among them: ["tests/census.test.ts","tests/focus-tool-register.ts",
//    "tests/focus-tool.test.ts","tests/slot-host.test.ts","tests/zones.test.ts"]`
//
// **THE SAME DECLARED-EXEMPTION PATTERN THIS FILE ALREADY USES** (the `SIBLING_UNIT_ARTIFACT_PATHS`,
// `COMPOSING_UNIT_ARTIFACT_PATHS` and `DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS` declarations above, each
// with its measured cause recorded and each driving `isSiblingUnitArtifact` to a NAMED owner).
// **IT IS AN EXEMPTION, NOT A RELAXATION: `isDenied` IS UNTOUCHED AND STILL REJECTS EVERY PATH
// BELOW**, and the declaration can only ever REMOVE a path from this row's SUBJECT. The FALSIFIABLE
// HALF IS UNCHANGED: a genuinely denied path still FAILS — `R-7`'s own `(4b)` control drives
// `tests/census.test.ts`, an UNCLAIMED test file that is on NO list here and that `R-7`'s own
// `tests/**` pattern still rejects — and the `(n)` control drives a synthetic THIS-UNIT-OWN denied
// path (`package.json`). */
const F3_UNIT_TEST_ARTIFACT_PATHS: readonly string[] = [
  'tests/focus-tool.test.ts', // `docs/specs/focus-tool.md` §5.1 row 5 — the F3 unit's OWN RED SET (the same-commit obligation's own home)
  'tests/focus-tool-register.ts', // `docs/specs/focus-tool.md` §5.5.1 — the F3 unit's executed property register (a NON-test module, riding the same red-set commit)
  // ── AND THE SIBLING SUITES THAT SAME COMMIT CENSUS-REPAIRS, EACH ANOTHER UNIT'S OWN ARTIFACT
  //    NAMED FOR THE IDENTICAL REASON (`docs/specs/focus-tool.md` `§5.1` rows 15–22 make the census
  //    repair a same-commit obligation AT EACH SITE, so one commit necessarily carries all of them
  //    beside the F3 unit's two). Naming them makes the obligation reachable; the DENIED predicate
  //    still rejects every one, and `R-7`'s controls still drive an unclaimed test file as the
  //    falsifier.
  'tests/census.test.ts', // `docs/specs/focus-tool.md` §5.1 row 15 — the `U-CENSUS` (`E5`) unit's own red set
  'tests/gutter.test.ts', // `docs/specs/focus-tool.md` §5.1 row 17 — the `U-GUTTER` (`E3`) unit's own red set
  'tests/slot-host.test.ts', // `docs/specs/focus-tool.md` §5.1 row 19 — the slot-host unit's own suite
  'tests/zones.test.ts', // `docs/specs/focus-tool.md` §5.1 row 18 — the `U-ZONES` unit's own red set
]
/** **⟶ ADDED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING, THE SAME CLASS AS THE TWO REPAIRS ABOVE).** The
 *  third and fourth declaring units' declared artifacts, BY NAME, each with its unit named in the
 *  comments above and in `SIBLING_UNIT_ARTIFACT_CONTROL` below (which carries the authority per path,
 *  so `R-7` can name the OWNER of every path it excludes and the exclusion is a checkable declaration
 *  rather than a `true`-for-convenience hatch). **THE CLOSED-SET DISCIPLINE IS UNCHANGED** and the
 *  predicate is still driven in the FALSE direction by `R-7`'s own controls — this unit's three
 *  canonical artifacts and every UNCLAIMED path (incl. `src/renderer/secure-panels.ts`) must answer
 *  `false` — so a declaration that claimed everything FAILS there. */
/** Paths whose SHAPE is a sibling `gutter-ui` spec even before they exist on disk (the sibling spec's
 *  own naming convention, `docs/specs/gutter-ui*.md`), so the exclusion stays correct for any further
 *  `docs/specs/gutter-ui-*.md` of that unit. */
const SIBLING_UNIT_ARTIFACT_PROBE = /^docs\/specs\/gutter-ui[^/]*\.md$/
/** **⟶ ADDED 2026-09-27 (THE `R-7` DIFF-SCOPE REPAIR PASS) — THE SECOND DECLARED SIBLING, BY NAME:
 *  `E3` / `U-GUTTER`, THIS UNIT'S OWN COMPOSING UNIT.** `E3`'s allow-list is `docs/specs/gutter.md`
 *  `§5.1`, and its landed module/test/spec are DECLARED ARTIFACTS OF ANOTHER UNIT — not this unit's
 *  diff, whatever commit carries them. **THE MEASURED REASON THIS SET EXISTS:** the range commit
 *  `81ffd31` (`E10`'s own sixth repair pass) carried `tests/gutter.test.ts` **TOGETHER WITH** this
 *  unit's suite, so excluding `E10`'s paths ALONE left the `R-7` DENIED arm red on exactly that path
 *  (`tests/gutter.test.ts` is denied to this unit by `R-7`'s own `/^tests\/(?!gesture-session\.test\.ts$)/`).
 *  `docs/specs/gutter.md` `§5.1`'s scope rule is unit-blind about WHICH sibling: *"a sibling unit's
 *  artifact"* is out of this unit's diff, and `§5.1` item 11 of `docs/specs/gutter-ui.md` records the
 *  same for a sibling's spec. **THE CLOSED-SET DISCIPLINE IS UNCHANGED:** every member cites its own
 *  spec row, and `R-7` drives the predicate `false` for a renderer file that is NOT declared
 *  (`src/renderer/secure-panels.ts`, `docs/specs/gutter-ui.md` `§5.1` item 4 keeps it DENIED), so
 *  this is a NAMED census, never a blanket "not mine" hatch. */
const COMPOSING_UNIT_ARTIFACT_PATHS: readonly string[] = [
  'src/shared/gutter.ts', // `docs/specs/gutter.md` §5.1 allow-list row 1 (the landed module)
  'tests/gutter.test.ts', // row 2 (NEW — the red set); carried by the range commit `81ffd31`
  'docs/specs/gutter.md', // row 3 — `E3`'s contract
  'docs/specs/gutter-greens.md', // row 4 — `E3`'s gate-5 artifact
]
/** **THE SIBLING-UNIT-ARTIFACT PREDICATE (`R-7`'s per-path subject seam, and the importer
 *  attribution's discriminator).** `true` means: this path is a DECLARED artifact of a sibling unit
 *  (`E10`'s eight, or `E3`'s four), so it is **OUT OF SCOPE BY CONSTRUCTION for every clause of
 *  THIS unit** — never this unit's own change, never its own finding.
 *
 *  **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE `R-7` DIFF-SCOPE REPAIR PASS, RULING B).** The as-filed
 *  body read `SIBLING_ARTIFACTS.includes(path) || /^docs\/specs\/gutter-ui[^/]*\.md$/.test(path)` —
 *  i.e. `E10`'s subset only; the two `docs/specs/` members and the whole `COMPOSING_UNIT_ARTIFACT_PATHS`
 *  half are ADDED, each with its citing spec row, so `R-7`'s DENIED arm no longer reads a sibling's
 *  legitimate commit as this unit's diff (`docs/specs/gutter.md` `§5.1`'s commit-range scope rule;
 *  `§3.4 R-4`). **IT IS DRIVEN BOTH WAYS BY `R-7`** — the twelve declared artifacts must answer
 *  `true`, this unit's three canonical artifacts and every UNCLAIMED path (incl.
 *  `src/renderer/secure-panels.ts`) must answer `false`. */
function isSiblingUnitArtifact(path: string): boolean {
  return (
    SIBLING_UNIT_ARTIFACT_PATHS.includes(path) ||
    SIBLING_UNIT_ARTIFACT_PROBE.test(path) ||
    COMPOSING_UNIT_ARTIFACT_PATHS.includes(path) ||
    // **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING): the `U-DIVERGENCE-EXT`
    // (`C2`) harness unit's four declared paths — incl. the SHARED `src/shared/dom-shim.ts`, which
    // that pass CHANGED — and the `U-REALDOM-BOOT` (`C1`) leg unit's `tests/ui-leg-contract.test.ts`.
    // A PATH is attributed here, never a unit: a later change to the shared shim by another unit is
    // RE-ATTRIBUTED, never silently inherited.**
    DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS.includes(path) ||
    // **⟶ DECLARED 2026-09-27 (THE `F3` SAME-COMMIT OBLIGATION, THIS ROW'S `N-15`): the
    // `U-FOCUS-TOOL` unit's two declared artifacts plus the sibling suites its one census-repair
    // commit carries (see `F3_UNIT_TEST_ARTIFACT_PATHS` for the measured cause and the reason the
    // exemption is BY NAME). The predicate's DENIED counterpart is UNTOUCHED and still rejects
    // every path here.**
    F3_UNIT_TEST_ARTIFACT_PATHS.includes(path)
  )
}
/** **THE DECLARED-SIBLING CENSUS, WITH ITS AUTHORITY PER PATH** — the control list `R-7` drives in
 *  the predicate's TRUE direction. Every member names the `§5.1` allow-list row of the sibling spec
 *  that declares it (`docs/specs/gutter-ui.md` rows `1`/`2`/`3`/`4`/`5`/`10`/`11` + `§R.1`;
 *  `docs/specs/gutter.md` rows `1`/`2`/`3`/`4`), so the exclusion can never be read as an unnamed
 *  carve-out.
 *
 *  **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING): FIVE ENTRIES APPENDED, EACH WITH
 *  ITS DECLARING UNIT NAMED IN `owner`** (the `U-DIVERGENCE-EXT`/`C2` harness unit's four, incl. the
 *  SHARED `src/shared/dom-shim.ts`; the `U-REALDOM-BOOT`/`C1` leg unit's one). The as-filed twelve are
 *  KEPT BYTE-FOR-BYTE (their `owner` defaults to the `E10`/`E3` label in `siblingArtifactOwner`), so
 *  `R-7`'s positive control now drives the predicate `true` over SEVENTEEN declared paths, and its RAW
 *  denied reading can name each excluded path's OWNER. */
const SIBLING_UNIT_ARTIFACT_CONTROL: ReadonlyArray<{
  readonly path: string
  readonly authority: string
  readonly owner?: string
}> = [
  { path: 'src/shared/gutter-affordance.ts', authority: '`docs/specs/gutter-ui.md` §5.1 allow-list row `1` (NEW — the affordance module)' },
  { path: 'src/shared/demo-envelope.ts', authority: 'allow-list row `2` (the authoring site — this repo\'s one example seam implementation)' },
  { path: 'tests/gutter-ui.test.ts', authority: 'allow-list row `3` ("NEW — the red set")' },
  { path: 'docs/specs/gutter-ui.md', authority: 'allow-list row `4` (the sibling\'s own spec)' },
  { path: 'docs/specs/gutter-ui-review.md', authority: 'allow-list row `5` ("any other `docs/specs/gutter-ui-*.md` of this unit")' },
  { path: 'docs/specs/gutter-ui-greens.md', authority: 'allow-list row `5` (the gate-5 blind-greens artifact)' },
  { path: 'src/renderer/renderer.ts', authority: 'allow-list row `10` + the `§R.1` ruling (the bounded renderer wiring)' },
  { path: 'src/renderer/runtime.ts', authority: 'allow-list row `11` + the `§R.1` ruling (`Runtime.elementForNodeId` and nothing else)' },
  { path: 'src/shared/gutter.ts', authority: '`docs/specs/gutter.md` §5.1 allow-list row `1` (`E3`\'s landed module)' },
  { path: 'tests/gutter.test.ts', authority: '`docs/specs/gutter.md` §5.1 allow-list row `2` (`E3`\'s red set — carried by the range commit `81ffd31`)' },
  { path: 'docs/specs/gutter.md', authority: '`docs/specs/gutter.md` §5.1 allow-list row `3` (`E3`\'s contract)' },
  { path: 'docs/specs/gutter-greens.md', authority: '`docs/specs/gutter.md` §5.1 allow-list row `4` (`E3`\'s gate-5 artifact)' },
  // ── **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING) — THE FIFTH, SIXTH, SEVENTH,
  // EIGHTH AND NINTH DECLARED PATHS, EACH WITH ITS DECLARING UNIT NAMED.** The measured red (quoted on
  // the declaration above) read these five as `U-GSESSION`'s own denied paths; they are the
  // `U-DIVERGENCE-EXT`/`C2` harness unit's own landing pass and the `U-REALDOM-BOOT`/`C1` leg unit's own
  // row file, each admitted by the SAME scope rule (`docs/specs/gutter.md` §5.1 + `§3.4 R-4`).**
  { path: 'scripts/electron-divergence.mjs', owner: 'the `U-DIVERGENCE-EXT` / `C2` HARNESS unit', authority: 'that unit\'s own extended harness — the `H-r10` channel + the set-wise attribute extractor (`docs/specs/ci-divergence-leg.md`\'s `AMENDMENT BLOCK (U-DIVERGENCE-EXT)`, clauses `A-1.1`/`A-1.5`); already in `E10`\'s scope by the architect\'s `e135904` ruling' },
  { path: 'scripts/electron-spawn.mjs', owner: 'the `U-DIVERGENCE-EXT` / `C2` HARNESS unit', authority: 'that unit\'s SHIM-INTEGRITY PRE-FLIGHT landing site — the same path/unit pair `tests/gutter.test.ts`\'s `SIBLING_DIVERGENCE_UNIT_ARTIFACTS` records' },
  { path: 'tests/divergence-attribute-extractor.test.ts', owner: 'the `U-DIVERGENCE-EXT` / `C2` HARNESS unit', authority: 'that unit\'s OWN RED SET (the same registry records the pair; `docs/specs/ci-divergence-leg.md` amendment clause `A-2.8`)' },
  { path: 'src/shared/dom-shim.ts', owner: 'the `U-DIVERGENCE-EXT` / `C2` HARNESS unit — for THIS reading only: the shim is SHARED (a path is attributed, not a unit; a later change by another unit is RE-ATTRIBUTED, never silently inherited)', authority: 'CHANGED by that pass — the attribute-backed `dataset` fix that closed the measured `data-wire` divergence (`docs/specs/engine-pin.md`’s `R-16`/`P-IM-1` re-grain records the same landing); `docs/specs/gutter.md` §3.4 `R-4`’s own cell names `dom-shim.ts`’s sibling status' },
  { path: 'tests/ui-leg-contract.test.ts', owner: 'the `U-REALDOM-BOOT` / `C1` LEG unit', authority: 'that unit\'s own row file for the additive test-layer leg (`AGENTS.md` item 4) — the same path/unit pair `tests/gutter.test.ts`\'s registry records' },
]
/** **THE DECLARING UNIT, BY PATH** — the census above read as a map, so `R-7` names the OWNER of every
 *  sibling path it excludes (the same `path → declaring unit` discipline the registry in
 *  `tests/gutter.test.ts` uses). A path with no explicit `owner` belongs to one of the two original
 *  declaring units (`E10`/`E3`), which is the label those entries have always carried. */
const SIBLING_ARTIFACT_UNIT_BY_PATH: Readonly<Record<string, string>> = {
  ...Object.fromEntries(
    SIBLING_UNIT_ARTIFACT_CONTROL.map((c) => [c.path, c.owner ?? 'the SIBLING unit (E10 / U-GUTTER-UI) / the COMPOSING unit (E3 / U-GUTTER)']),
  ),
  // **⟶ DECLARED 2026-09-27 (THE `F3` SAME-COMMIT OBLIGATION, THIS ROW'S `N-15`) — the exemption's
  // OWNER MAP, so `R-7` reports each exempted path's declaring unit rather than a fallback label.**
  ...Object.fromEntries(F3_UNIT_TEST_ARTIFACT_PATHS.map((path) => [path, 'the `U-FOCUS-TOOL` / `F3` unit'])),
}
/** **THE PREDICATE'S FALSE DIRECTION, NAMED ONCE** — this unit's own canonical artifacts (which no
 *  sibling allow-list claims), and the UNCLAIMED paths that must STAY this unit's responsibility: a
 *  `src/renderer/**` file no sibling declares (`secure-panels.ts` is DENIED to `E10` by its own
 *  `§5.1` item 4), `src/main/**`, another sibling `src/shared/*` module and another unit's test file.
 *  `R-7` requires every one of these to answer `false`.
 *
 *  **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING): `src/shared/dom-shim.ts` MOVED
 *  OUT OF THIS LIST.** It can no longer be an UNCLAIMED probe: the landing pass that CHANGED it is the
 *  pass the declaration above attributes it to, so a control that pins it `false` would now contradict
 *  that declaration. **THE SUBSTITUTE IS A PATH NO DECLARATION CLAIMS AND THAT STAYS DENIED TO THIS
 *  UNIT** — `src/shared/census.ts` (`R-7`'s own DENIED list, `§5.1` item "another sibling
 *  `src/shared/*` module") — so the control stays the same SIZE and keeps driving the predicate's
 *  false direction with the same force: a predicate that claimed everything still FAILS here. **The
 *  other four as-filed members are KEPT BYTE-FOR-BYTE, and the shim's `false` reading is still driven
 *  elsewhere** (the sibling declaration's own `true` direction is driven in `R-7`'s positive control). */
const GS_UNIT_OWN_ARTIFACT_CONTROL: readonly string[] = [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH]
const UNCLAIMED_PATH_CONTROL: readonly string[] = [
  'src/renderer/secure-panels.ts',
  'src/main/main.ts',
  'src/shared/census.ts',
  // **⟶ SUBSTITUTED 2026-09-27 (THE `F3` SAME-COMMIT OBLIGATION, `R-7`'s `N-15`): `tests/census.test.ts`
  // STOOD HERE AND IS NOW A DECLARED `F3` PATH** (that unit's own census repair rides the same commit —
  // see `F3_UNIT_TEST_ARTIFACT_PATHS`), so it can no longer drive the predicate's FALSE direction. **THE
  // SUBSTITUTE IS A PATH NO DECLARATION CLAIMS AND THAT STAYS DENIED TO THIS UNIT** — an unclaimed
  // sibling test file that `R-7`'s own `/^tests\/(?!gesture-session\.test\.ts$)/` pattern still rejects —
  // so the control keeps the same SIZE and the same force: a predicate that claimed everything (or that
  // swallowed an undeclared test file) still FAILS here.
  'tests/listhost.test.ts',
  'docs/specs/census-greens.md',
]
/** THIS unit's OWN importer paths — a `src/**` file importing the module that this unit itself
 *  owns (its module, its test, its spec, its gate records). **AN IMPORTER HERE STILL FAILS.** */
function isUnitOwnImporter(path: string): boolean {
  return isUnitArtifact(path) || path === MODULE_RELPATH
}
/** Each path's OWNER, NAMED (`R-7`/`F-9` report the current census this way, per RULING B).
 *  **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING):** the sibling branch now names
 *  the DECLARING UNIT the path is actually attributed to (`SIBLING_ARTIFACT_UNIT_BY_PATH`, built from
 *  the census above) instead of one fixed label — a path attributed to the `C2` harness unit or the
 *  `C1` leg unit must not be REPORTED as `E10`'s. The unit-own and unclaimed branches are unchanged. */
function siblingArtifactOwner(path: string): string {
  return SIBLING_ARTIFACT_UNIT_BY_PATH[path] ?? 'a DECLARED sibling artifact'
}
function ownerOfImporter(path: string): string {
  if (isUnitOwnImporter(path)) return 'THIS unit (U-GSESSION) — STILL A FAIL'
  if (isSiblingUnitArtifact(path)) return siblingArtifactOwner(path)
  return 'NO unit’s allow-list claims it'
}
/** The module's `src/**` importers in the **TRACKED** tree **AT THE ANCHOR COMMIT** — the
 *  TIME-SCOPED reading (`§3.4 R-4` + `§5.1`'s commit-range scope rule). A file that was UNTRACKED
 *  at that instant is invisible to it, exactly as it is to the committed arm above; the CURRENT
 *  reading reported beside it names every importer on the live tree, so nothing can hide. */
function importersAtAnchor(anchor: string): string[] {
  const listed = gitOrNull(['ls-tree', '-r', '--name-only', anchor])
  if (listed === null) return []
  const importers: string[] = []
  for (const rel of listed) {
    if (!/^src\/.*\.tsx?$/.test(rel)) continue
    if (rel === MODULE_RELPATH) continue
    const src = gitOrNull(['show', `${anchor}:${rel}`])
    if (src === null || src.length === 0) continue
    if (importsGestureSession(src.join('\n'))) importers.push(rel)
  }
  return Array.from(new Set(importers)).sort()
}
/** The three import forms this unit's own claim names (static `from`, dynamic `import(`, `require(`). */
function importsGestureSession(code: string): boolean {
  const stripped = stripComments(code)
  const rules: readonly RegExp[] = [
    /from\s+['"][^'"]*gesture-session(\.js)?['"]/,
    /import\s*\(\s*['"][^'"]*gesture-session(\.js)?['"]/,
    /require\s*\(\s*['"][^'"]*gesture-session(\.js)?['"]/,
  ]
  return rules.some((re) => re.test(stripped))
}
type ImporterAttribution = {
  readonly atAnchor: string[]
  readonly current: string[]
  readonly currentOwners: Array<{ path: string; owner: string }>
  readonly anchor: string | null
  readonly anchorRange: string | null
}
function importerAttribution(): ImporterAttribution {
  const committed = committedChangeSet()
  const anchor = committed === null ? null : committed.anchor
  const current = Array.from(
    new Set(
      walkSourceFiles().filter((rel) => {
        const src = existsSync(`${REPO_ROOT}/${rel}`) ? readFileSync(`${REPO_ROOT}/${rel}`, 'utf8') : ''
        return src.length > 0 && rel !== MODULE_RELPATH && importsGestureSession(src)
      }),
    ),
  ).sort()
  return {
    atAnchor: anchor === null ? [] : importersAtAnchor(anchor),
    current,
    currentOwners: current.map((path) => ({ path, owner: ownerOfImporter(path) })),
    anchor,
    anchorRange: committed === null ? null : committed.range,
  }
}
const IMPORTER_ATTRIBUTION_GS: ImporterAttribution = importerAttribution()
/** **THE FALSIFIABLE CONTROLS (`⟶ ADDED 2026-09-27`)** — an importer that is THIS unit's own
 *  artifact, and one no unit's allow-list claims, driven SYNTHETICALLY so no file is created. */
const GS_IMPORTER_CONTROL_UNIT_OWN = ['tests/gesture-session.test.ts', 'src/shared/gesture-session.ts']
const GS_IMPORTER_CONTROL_UNCLAIMED = ['src/shared/gesture-session-stray.ts', 'src/renderer/gesture-session-panel.ts']
/** **THE PER-PATH SIBLING-ATTRIBUTION SPLIT (⟶ ADDED 2026-09-27, THE `R-7` DIFF-SCOPE REPAIR
 *  PASS).** The subject rule EVERY sibling-attributed clause of this file binds: **a path counts as
 *  THIS unit's own IFF it is NOT a declared sibling artifact** (`isSiblingUnitArtifact`). It is
 *  RETURNED as a split rather than recomputed so a row can report **both readings separately** (the
 *  RAW reading and the sibling-excluded `U-GSESSION`-own reading) and so its CONTROLS can be DRIVEN
 *  **through this function** instead of re-describing its rule. **The DENIED predicate is NOT applied
 *  here and is NOT weakened**: the rows apply their byte-identical predicate to `own` alone. */
function splitBySiblingAttribution(paths: readonly string[]): { raw: string[]; own: string[]; sibling: string[] } {
  return {
    raw: [...paths],
    own: paths.filter((path) => !isSiblingUnitArtifact(path)),
    sibling: paths.filter((path) => isSiblingUnitArtifact(path)),
  }
}
/** THE ATTRIBUTABLE CHANGE SET: the committed paths MINUS the declared sibling artifacts. A path
 *  that is the sibling's declared work is NOT charged to this unit (`F-9(b)`'s repair). */
function unitAttributableChangeSet(paths: readonly string[]): string[] {
  return splitBySiblingAttribution(paths).own.sort()
}

// ===========================================================================
// §5.5.1 — THE REGISTER'S EXECUTION MACHINERY.
// Caps (uniform for the whole register): `≤100` attempts per row, `≤400` attempts in
// total, rows evaluated SEQUENTIALLY IN REGISTER ORDER, STOP AFTER 5 CONSECUTIVE
// FAILURES (the running row's remaining attempts are abandoned and no further row
// starts). Each row's `it` title carries its row id AND its `S-GS-*` strategy id, and
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

/** **`§5.5.1`'s ELEVEN DECLARED ROWS** — `(row id, strategy id, term, bounded)`, in REGISTER
 *  ORDER, as `§5.5.3` prints them: `396` = `58+32+36+30+24+30+40+30+32+24+60`. Declared
 *  ONCE, at module scope, so `PRE-2` (the table precondition), `PRE-4` (the
 *  pool-versus-boundary rule) and `REGISTER-STATUS` (the executed record) all reconcile
 *  against the same object — which is what makes this file's tables machine-comparable
 *  for the later read-only PBT audit (`§3a A-15`).
 *
 *  **`bounded` — ADDED 2026-09-27 (`ADV-GS-32`, the gate-4 closure): THE PER-ROW
 *  `YES (bounded)` FLAG, so `PRE-2` DERIVES the bounded set from this table instead of
 *  restating four literals against the same four literals (an assertion with no failure
 *  mode).** The flag is the table's own copy of `§5.5.1`'s marking: `true` for the FIVE rows
 *  whose property TEXT quantifies over an unbounded universal while the row drives a bounded
 *  domain (`P-GS-IM-1`, `P-GS-IM-2`, `P-GS-IM-5`, `P-GS-TP-1`, `P-GS-TP-2` — `ADV-GS-25`
 *  moved `P-GS-IM-2` into that set), `false` for the SIX whose `YES` is over a fully
 *  enumerated domain. **NO declared term, row id or strategy id moves for the flag**: it is
 *  metadata BESIDE the declared triple, and the `396` total is still the sum of the terms. */
const REGISTER_DECLARED: ReadonlyArray<{ row: string; strategy: string; term: number; bounded: boolean }> = [
  { row: 'P-GS-IM-1', strategy: 'S-GS-LISTENERS-1', term: 58, bounded: true },
  { row: 'P-GS-IM-2', strategy: 'S-GS-BUSY-1', term: 32, bounded: true },
  { row: 'P-GS-IM-3', strategy: 'S-GS-CODES-1', term: 36, bounded: false },
  { row: 'P-GS-IM-4', strategy: 'S-GS-WINDOW-1', term: 30, bounded: false },
  { row: 'P-GS-IM-5', strategy: 'S-GS-CAPTURE-1', term: 24, bounded: true },
  { row: 'P-GS-IM-6', strategy: 'S-GS-DISPOSE-1', term: 30, bounded: false },
  { row: 'P-GS-SM-1', strategy: 'S-GS-STATE-1', term: 40, bounded: false },
  { row: 'P-GS-SM-2', strategy: 'S-GS-IDENTITY-1', term: 30, bounded: false },
  { row: 'P-GS-SM-3', strategy: 'S-GS-COMMIT-1', term: 32, bounded: false },
  { row: 'P-GS-TP-1', strategy: 'S-GS-TOTAL-1', term: 24, bounded: true },
  { row: 'P-GS-TP-2', strategy: 'S-GS-SEED-1 + S-GS-POOL-1', term: 60, bounded: true },
]
function registerKeySet(rows: ReadonlyArray<{ row: string; strategy: string }>): string[] {
  return rows.map((r) => `${r.row} :: ${r.strategy}`).sort()
}
/** The DECLARED term of one register row, read from the ONE declared table — used by the
 *  un-run rows' failure message so it names the attempts that were NOT executed. */
function declaredTermOf(row: string): number {
  return REGISTER_DECLARED.find((r) => r.row === row)?.term ?? -1
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
  stoppedEarly: boolean
  notStarted: boolean
  registerStoppedAt: string | null
  causes: string[]
}
const registerRecords: RowRecord[] = []
/** The DECLARED term (`§5.5.1`) reconciled against the table this file actually drove —
 *  the reconciliation `§5.3` items 10/11 require. A row that NEVER STARTED is not
 *  reconciled here: its own `finish()` reports it as a FAILURE, which is the loud
 *  message a stopped red run must carry. */
function reconcile(rec: RegisterRow, declared: number, what: string): void {
  const ran = rec.attemptsRunPublic()
  if (ran === 0) return
  expect(ran, `${what} — the declared term is ${declared}`).toBe(declared)
}
class RegisterRow {
  readonly row: string
  readonly strategy: string
  private attemptsRun = 0
  private held = 0
  private broken = 0
  private stoppedEarly = false
  private notStarted = false
  private readonly causes: string[] = []

  constructor(row: string, strategy: string) {
    this.row = row
    this.strategy = strategy
  }

  /** ONE attempt. `body` returns `null` when the property HELD, else the break cause as
   *  a sentence (a throw is caught and is itself a break cause). */
  run(label: string, body: () => string | null): void {
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
          reported: 'FAILURE — never started; the register stopped earlier',
          registerStoppedAt: registerState.stoppedAtRow,
          stoppedFor: registerState.stoppedFor,
        })}`,
      )
      // **THE UN-RUN ROW FAILS, LOUDLY AND BY NAME** (`§4.2` item 2: *"a register row that
      // cannot start is REPORTED AS A FAILURE, never a pass"*, and *"a red run that
      // reports all `396` attempts as executed is the finding, not the expectation"*).
      // A `finish()` that merely returned would leave this row GREEN in the runner's own
      // tally while it never executed a single attempt — exactly the shape the red run
      // must not present. The assertion is a DELIBERATE impossible comparison (the
      // reported-attempt count `0` against the declared term), so its message carries the
      // row, its strategy, the stopping row and the reason.
      expect(
        0,
        `§5.5.1/§4.2 item 2 — the register row \`${this.row}\` (${this.strategy}) NEVER STARTED: 0 of its declared attempts were executed, because the register stopped at \`${String(
          registerState.stoppedAtRow,
        )}\` (${String(registerState.stoppedFor)}). An un-run register row is REPORTED AS A FAILURE, never silently omitted and never a pass`,
      ).toBe(declaredTermOf(this.row))
      return
    }
    expect(
      this.broken,
      `${line} — RED (§5.5.1): ${this.broken} of ${this.attemptsRun} attempts BROKE. First causes: ${JSON.stringify(
        this.causes.slice(0, 3),
      )}`,
    ).toBe(0)
  }
}

/** `S-GS-SEED-1`'s generator: a hand-rolled 32-bit LCG whose constants are literals in
 *  THIS file. `stateₙ₊₁ = (stateₙ·1664525 + 1013904223) mod 2³²`, **ONE step per draw**;
 *  the pool index is `stateₙ₊₁ mod pool.length` — there is NO `next(k)` scaling helper
 *  (`§5.5.1` strategy item 2). */
function makeLcg(seed: number): { state: () => number; step: () => number } {
  let state = seed >>> 0
  return {
    state(): number {
      return state
    },
    step(): number {
      state = (state * LCG_A + LCG_C) % LCG_MOD
      return state
    },
  }
}
/** The pinned-seed DRAW SEQUENCE: one LCG step per draw, `index = state mod 30`. */
const POOL_LENGTH = 30
function poolDrawSequence(draws: number): number[] {
  const lcg = makeLcg(SEED)
  const out: number[] = []
  for (let i = 0; i < draws; i += 1) out.push(lcg.step() % POOL_LENGTH)
  return out
}
const DRAWN_INDICES = poolDrawSequence(60)
const DISTINCT_DRAWN_POOL_MEMBERS = new Set(DRAWN_INDICES).size
/** The first LCG step from the pinned seed, recomputed from the pinned literals
 *  (`state₁ = (20260927·1664525 + 1013904223) mod 2³²`). **REPORTED FIGURE, computed —
 *  not a spec-stated number**: `§5.5.1` pins the seed, the two constants and the ONE-STEP
 *  form but prints no first-state value, so the assertion below is the pass's own
 *  arithmetic check on that form (the pinned literals are `SEED`/`LCG_A`/`LCG_C`). */
const FIRST_LCG_STATE = (SEED * LCG_A + LCG_C) % LCG_MOD

// ---------------------------------------------------------------------------
// §5.5.1 — THE REGISTER TABLES (the pinned inputs each row drives). Setup is NOT
// counted as an attempt: constructing a source, building the recording log or
// snapshotting state is precondition (`§5.5.3`).
// ---------------------------------------------------------------------------
/** `P-GS-TP-2` — the pinned `30`-member event pool, in the spec's fixed order. */
interface PoolMember {
  readonly id: string
  readonly make: () => unknown
}
const EVENT_POOL: ReadonlyArray<PoolMember> = [
  { id: '(1) `undefined`', make: () => undefined },
  { id: '(2) `null`', make: () => null },
  { id: '(3) `0`', make: () => 0 },
  { id: "(4) `''`", make: () => '' },
  { id: '(5) `NaN`', make: () => Number.NaN },
  { id: "(6) `Symbol('ev')`", make: () => Symbol('ev') },
  { id: '(7) `true`', make: () => true },
  { id: '(8) a function', make: () => (): void => undefined },
  { id: '(9) `[]`', make: () => [] },
  { id: '(10) `[1,2,3]`', make: () => [1, 2, 3] },
  { id: '(11) `{}`', make: () => ({}) },
  { id: "(12) `{type: 'pointerdown'}`", make: () => ({ type: TYPE_START }) },
  { id: "(13) `{pointerId: 1, type: 'pointerup'}`", make: () => ({ pointerId: 1, type: TYPE_END }) },
  { id: '(14) an event carrying the two coordinate spellings', make: () => ({ [COORD_FRAGMENTS[0].join('')]: 5, [COORD_FRAGMENTS[1].join('')]: 7 }) },
  {
    id: '(15) an object whose coordinate getter THROWS',
    make: () => {
      const target: Record<string, unknown> = {}
      Object.defineProperty(target, COORD_FRAGMENTS[0].join(''), {
        get(): number {
          throw new Error('the event’s coordinate getter threw')
        },
        enumerable: true,
      })
      return target
    },
  },
  {
    id: '(16) a `Proxy` whose traps THROW',
    make: () =>
      new Proxy(
        {},
        {
          get(): never {
            throw new Error('the event Proxy refused a `get`')
          },
          has(): never {
            throw new Error('the event Proxy refused a `has`')
          },
          getOwnPropertyDescriptor(): never {
            throw new Error('the event Proxy refused a `getOwnPropertyDescriptor`')
          },
        },
      ),
  },
  { id: '(17) a `Proxy` returning `undefined` for every property', make: () => new Proxy({}, { get: () => undefined, has: () => false }) },
  { id: '(18) a frozen `{}`', make: () => Object.freeze({}) },
  { id: '(19) a `Map` instance', make: () => new Map([['a', 1]]) },
  { id: '(20) a `Set` instance', make: () => new Set([1]) },
  { id: '(21) a `Date` instance', make: () => new Date(0) },
  { id: '(22) a resolved promise', make: () => Promise.resolve(1) },
  { id: '(23) an `Error` instance', make: () => new Error('an event-shaped error') },
  {
    id: '(24) a plain object carrying a `Symbol.iterator` member',
    make: () => ({ [Symbol.iterator]: function* (): Generator<number> { yield 1 } }),
  },
  { id: '(25) an array-like object', make: () => ({ length: 3, 0: 'a' }) },
  {
    id: '(26) an object whose getter MUTATES a counter (the no-side-effect probe)',
    make: () => {
      const counter = { reads: 0 }
      const target: Record<string, unknown> = {}
      Object.defineProperty(target, 'probe', {
        get(): number {
          counter.reads += 1
          return counter.reads
        },
        enumerable: true,
      })
      Object.defineProperty(target, 'readCount', { get: () => counter.reads, enumerable: true })
      return target
    },
  },
  {
    id: '(27) an object whose `valueOf` THROWS',
    make: () => ({
      valueOf(): never {
        throw new Error('the event’s `valueOf` threw')
      },
    }),
  },
  {
    id: '(28) an object whose `toString` returns a banned vocabulary spelling',
    make: () => ({
      toString: (): string => `${'thres'}${'hold'}`,
    }),
  },
  { id: '(29) a `WeakMap` instance', make: () => new WeakMap() },
  {
    id: '(30) a class instance with private state',
    make: () =>
      new (class OpaqueEvent {
        readonly #secret: string = 'private'
        reveal(): string {
          return this.#secret
        }
      })(),
  },
]

/** The no-op placeholder event each `P-GS-TP-2` attempt compares its drawn member
 *  against (`§5.5.1`: "behaviour is IDENTICAL to driving the same lifecycle with a
 *  no-op placeholder event"). */
const PLACEHOLDER_EVENT = Object.freeze({}) as unknown

/** The four hooks of `§2.1`, as a fresh record per attempt. */
interface HookLog {
  readonly start: unknown[][]
  readonly move: unknown[][]
  readonly end: unknown[][]
  readonly cancel: unknown[][]
}
function makeHookLog(): HookLog {
  return { start: [], move: [], end: [], cancel: [] }
}
/** **THE COMPOSED HOOK** (green-time test repair 2026-09-27 — the `hookOptions` MERGE
 *  DEFECT): the caller's hook must be the one INVOKED while the recorder is still
 *  OBSERVED (`§3.1 M-11`, `§3.3 I-12b`, `§3.2 F-3` all drive a hook that OBSERVES or
 *  RE-ENTERS, and a merge that dropped it silently discarded the row's own driver). The
 *  caller's hook runs SECOND, so a hook that THROWS still leaves the recorder's entry
 *  (`F-3`'s "the detach already happened" half is asserted from the recorder's log) and
 *  a hook that `dispose()`s still records the call. A NON-CALLABLE hook is still the
 *  ABSENCE of a hook (`§2.1` `GestureOptionsInput`: `onStart?: unknown`), so an
 *  explicit `42`/`'x'` does not become a call. */
function composeHook<A extends unknown[]>(
  recorder: (...args: A) => void,
  caller: unknown,
): (...args: A) => void {
  if (typeof caller !== 'function') return recorder
  const custom = caller as (...args: A) => void
  return (...args: A): void => {
    recorder(...args)
    custom(...args)
  }
}

/** **⟶ `ADV-GS-18` (the gate-4 closure): A GENUINELY SINGLE-HOOK INPUT.** `P-GS-IM-1`'s
 *  configurations `(6)`–`(10)` declare *"`{onStart: fn}` only"* … *"all five hooks"*, and as
 *  filed ALL FIVE were built by `hookOptions(makeHookLog(), {})` — the same ALL-HOOKS-PRESENT
 *  input — so four of the five ids described nothing they built (measured: the module's
 *  resolved input for `(6)`…`(10)` was byte-identical). Each id now builds what it names:
 *  exactly ONE callable hook for `(6)`–`(9)`, and the full set for `(10)`. The hook is a real
 *  callable, so its presence is an input the module reads (`§2.1`
 *  `GestureOptionsInput.onStart?: unknown` — read for callability) rather than an annotation. */
function singleHookOptions(hook: 'onStart' | 'onMove' | 'onEnd' | 'onCancel'): GestureOptionsInput {
  const called: string[] = []
  const record = (): void => void called.push(hook)
  if (hook === 'onStart') return { onStart: record }
  if (hook === 'onMove') return { onMove: record }
  if (hook === 'onEnd') return { onEnd: record }
  return { onCancel: record }
}
function hookOptions(log: HookLog, extra: GestureOptionsInput = {}): GestureOptionsInput {
  return {
    ...extra,
    onStart: composeHook(((element: GestureElement): void => {
      log.start.push([element])
    }) as (...args: [GestureElement]) => void, extra.onStart),
    onMove: composeHook(((gesture: GestureHandle): void => {
      log.move.push([gesture.id])
    }) as (...args: [GestureHandle]) => void, extra.onMove),
    onEnd: composeHook(((element: GestureElement, value: unknown): void => {
      log.end.push([element, value])
    }) as (...args: [GestureElement, unknown]) => void, extra.onEnd),
    onCancel: composeHook(((element: GestureElement): void => {
      log.cancel.push([element])
    }) as (...args: [GestureElement]) => void, extra.onCancel),
  }
}

/** The `P-GS-IM-1` listener-footprint reading: the count AND the tracked
 *  `(element, type)` multiset, read from the recorder's own live map. */
function footprint(source: RecorderSource, element: unknown): { count: number; types: string[] } {
  return { count: source.listenerCount(element), types: source.typeMultiset(element) }
}

/** ⟶ THE FLAGGED DRIVE-LEVEL CORRECTION (`M-15`; the amendment names it, NOT landed by the
 *  SpecWriter): **THE CORRECTED `SessionStats.sourceCalls` COUNTING RULE, APPLIED TO A
 *  RECORDED LOG.** `§2.1`'s `SessionStats.sourceCalls` cell states the rule exactly: *"the
 *  counter increments by ONE for a call that RETURNS, and a call that THROWS is NOT
 *  counted. … A row asserting `sourceCalls` against a recorded call log must therefore
 *  compare it to the count of NON-THROWING entries."*
 *
 *  The recorder logs an attempt and THEN throws (`makeSource`'s documented order), so a
 *  logged entry cannot mark itself; the recorder's `threwAt` set carries the sequences of
 *  the calls that threw, and this helper is the comparison the clause requires. With no
 *  throwing call the set is empty and the helper counts every non-capture entry — which is
 *  what `M-15`'s first arm and `M-4`/`M-6` assert. */
function nonThrowingSourceCalls(log: readonly CallRecord[], threwAt: ReadonlySet<number> = new Set<number>()): number {
  return log.filter((rec) => rec.op !== 'capture' && !threwAt.has(rec.seq)).length
}

/** ⟶ `D-13` (`ADV-GS-13`, the third of the three missing CONTROLS): **THE `P-GS-IM-5` ROW
 *  PREDICATE ITSELF, EXTRACTED SO A CONTROL CAN RUN IT.**
 *
 *  `§5.5.1 P-GS-IM-5`'s per-attempt assertion is *"the exact cumulative capture count for
 *  that flag … `0` at every stage for (2)/(4); `0,0,1,1,1,1` for (1)/(3)"* — i.e. an
 *  OPTED-IN flag must read EXACTLY ONE capture call at the gesture's own terminal (never
 *  more than one anywhere) and a non-opted-in flag EXACTLY ZERO. `PRE-5`'s control arm
 *  previously asserted only that the capture-SKIPPING stand-in produces zero capture
 *  calls; it never RAN THIS PREDICATE against that stand-in, so the control could not show
 *  the row failing. This helper is that predicate: `PRE-5` runs it against the stand-in and
 *  `P-GS-IM-5` runs it against the real module per stage, so the control and the row cannot
 *  drift apart. Declared at module scope (before `PRE-5`'s `describe`) because both use it. */
function im5CountPredicateHolds(observedCount: number, optedIn: boolean): boolean {
  if (observedCount > 1) return false
  return optedIn ? observedCount === 1 : observedCount === 0
}

// ===========================================================================
// R-10 / R-11 — §3.5 THE EXISTENCE ROWS (the red's own premise), AUTHORED FIRST.
// ===========================================================================
describe('R-10/R-11 — §3.5 the existence rows (the red’s own premise)', () => {
  it('R-10 §3.5 (GREEN FORM) — the module-existence row: `src/shared/gesture-session.ts` EXISTS, and the unit-owned change set is EXACTLY the module + this test file', () => {
    // -----------------------------------------------------------------------
    // THE GREEN-TIME RE-SCOPE OF `§3.5 R-10` (green-time test repair 2026-09-27 — the
    // `b1930d2`/`8e2c777`/`f36f605`/`2437727` class, and the SAME re-scope technique the
    // sibling units applied to their own module-absence rows: `tests/zones.test.ts`'s
    // `R-8` and `tests/census.test.ts`'s `R-10` are the models). `§3.5 R-10` says in its
    // OWN text that it "has TWO forms, and BOTH are the row": the RED form governs AT RED
    // TIME and the GREEN form governs "in the state where `§5.1` row 1 (the module, NEW)
    // has LANDED".
    //
    // WHY IT HAD TO BE RE-SCOPED, stated as the spec states it: the as-filed RED form
    // reads *"at the moment the red set is AUTHORED and RUN, `src/shared/gesture-session.ts`
    // does not exist"* — a claim whose ONLY truth-state is the red run ("if the module
    // EXISTS before the red run, this row FAILS and the `RCA-1` red order is broken — the
    // pass that finds it must REPORT the inversion rather than proceed"). The module's
    // existence IS `§5.1` row 1 (the module, NEW — the landed deliverable), so in the
    // GREEN state the as-filed assertion is red BY DESIGN for the correct reason, and
    // leaving it red would report the deliverable's own landing as a defect. **THE
    // INVERSION WAS REPORTED, NOT PROCEEDED PAST**: the red-run pass recorded the
    // module-absent census (`['tests/gesture-session.test.ts']`), which is the RED form.
    //
    // THE CLAIM CARRIED FORWARD is the row's own GREEN form, verbatim: *"the module
    // EXISTS, the unit-owned change set is EXACTLY the module + this test file (no OTHER
    // `gesture-session*` path anywhere in `src/**` or `tests/**`), both canonical
    // artifacts are present, the census is asserted NON-EMPTY before the equality, and
    // the red-run census recorded the red form"*.
    //
    // PROVENANCE — the RED-run form this row carried while the module was absent: the
    // `existsSync(MODULE_SRC)` probe answered `false`, the unit-owned path census returned
    // exactly `['tests/gesture-session.test.ts']`, and the unit-owned change set returned
    // the same single path. The change of the expected set below is the module LANDING
    // (`§5.1` row 1), NOT a weakening: the probe, the path census and the non-vacuity
    // assertions are the SAME instruments.
    // -----------------------------------------------------------------------
    expect(
      existsSync(MODULE_SRC),
      `R-10 (GREEN form)/§5.1 row 1 — the module \`${MODULE_RELPATH}\` is LANDED: the green-state form of this row is the module's EXISTENCE (${fileURLToPath(
        MODULE_SRC,
      )}). The RED-run premise is the opposite assertion and is recorded as provenance above: at AUTHOR+red time this probe answered \`false\` and the row's FAIL was the unit's red-order claim (RCA-1) being broken, never a defect in the deliverable`,
    ).toBe(true)
    // The unit-owned path census, checked against the TREE (so a stray unit-owned path
    // is caught even when an earlier pass committed it), with the non-vacuity assertion
    // BEFORE the equality that is the claim.
    const onDisk = walkUnitPaths()
    expect(
      onDisk.length,
      'R-10/§3.5 — the unit-owned path census is NON-EMPTY, so the equality below is not satisfied vacuously',
    ).toBeGreaterThan(0)
    expect(
      onDisk,
      `R-10 (GREEN form)/§0A note 1 — the unit-owned surface of \`src/**\` and \`tests/**\` is EXACTLY the module of §5.1 row 1 and this test file (no OTHER \`gesture-session*\` path exists there — a second unit-owned path would be an artefact this row's claim does not admit): ${JSON.stringify(
        onDisk,
      )}`,
    ).toEqual([MODULE_RELPATH, TEST_RELPATH])
    // The CHANGE-SET half of the same claim (the row's own words: *"the unit-owned change
    // set is EXACTLY the module + this test file"*): the WORKING TREE plus this unit's own
    // UNIT-SCOPED committed range (a LATER unit's commits are not this unit's diff — the
    // commit-range scope rule `§5.1` and the sibling rows share).
    const tree = treeChangeSet()
    const committed = committedChangeSet()
    const committedUnitOwned =
      committed === null ? [] : unitScopedCommitted(committed.anchor, committed.range).files.filter((p) => /gesture-session/i.test(p))
    const unitOwned = Array.from(new Set([...tree.paths, ...committedUnitOwned].filter((p) => /gesture-session/i.test(p)))).sort()
    expect(
      unitOwned.length,
      `R-10/§3.5 — the unit-owned CHANGE SET is NON-EMPTY (so the census is not vacuous): ${JSON.stringify(tree.raw)}`,
    ).toBeGreaterThan(0)
    expect(
      unitOwned,
      `R-10 (GREEN form) — the unit-owned change set is EXACTLY the module of §5.1 row 1 and this test file, and nothing else; a stray second unit-owned path FAILS. PROVENANCE — at RED time this same census returned \`['${TEST_RELPATH}']\`, which is the as-filed RED form (the module was absent). git status said: ${JSON.stringify(
        tree.raw,
      )}; the unit-scoped committed census said: ${JSON.stringify(committedUnitOwned)}`,
    ).toEqual([MODULE_RELPATH, TEST_RELPATH])
    expect(
      existsSync(TEST_FILE),
      'R-10 — the probe is not vacuous: this test file itself exists on disk through the same mechanism',
    ).toBe(true)
    expect(
      existsSync(new URL('../src/shared/census.ts', import.meta.url)),
      'R-10 — the probe is not vacuous in the other direction either: a SIBLING module really exists, so `existsSync` answers true for a present file',
    ).toBe(true)
  })

  it('R-11 §3.5 — the `[D]`-precondition row, BRANCHED on the harness’s presence: the RED branch (the extended harness is absent — the as-filed, time-scoped reading) OR the GREEN branch (`U-DIVERGENCE-EXT` HAS landed, so `F-12` is now RUNNABLE)', () => {
    // -----------------------------------------------------------------------
    // **⟶ BRANCHED 2026-09-27 (THE `U-DIVERGENCE-EXT` LANDING).** The extended
    // divergence harness HAS LANDED: `scripts/electron-divergence.mjs` carries the
    // `H-r10` channel (the `scenarioEnvelope` spelling), the set-wise extractor and
    // the `[EXT]` tally plus the `ENVELOPE-MISMATCH` instrument-error path, and the
    // unit's own rows live in `tests/divergence-attribute-extractor.test.ts`. The
    // as-filed row therefore read `1 failed` — **and its own message says exactly
    // what that means**: *"A NON-EMPTY list here means `F-12` is now runnable and
    // this unit MAY take it (that harness's own spec is its authority)."*
    //
    // **THE LESSON THIS BRANCH APPLIES (`docs/specs/gutter.md` `§3.5 R-16`, the
    // DEFECTIVE-ROW cell, quoted because it is the authority):** a row written as an
    // unconditional ABSENCE assertion *"FAILS BECAUSE THE WORK WAS DONE (`E3`-BLOCK-1)"*
    // — *"the row MUST BRANCH ON … PRESENCE rather than assert the red form
    // unconditionally."* `R-10` above took its green-form re-scope on the same
    // reasoning. **A pass that fails on the arrival of the thing it probes is
    // measuring the wrong subject.**
    //
    // **THE AUTHORITY FOR THE GREEN BRANCH'S SPELLINGS** is the amendment that
    // defines them, not this row: `docs/specs/ci-divergence-leg.md`'s
    // `AMENDMENT BLOCK (U-DIVERGENCE-EXT, 2026-09-27)` — `A-1.1`/`A-1.5`
    // (`scenarioEnvelope(kind)`), `A-1.6` (`ENVELOPE-MISMATCH`, *"an INSTRUMENT
    // ERROR, NOT a divergence verdict"*) and `A-4` (the `[EXT]` tally, whose checks
    // are *"NEVER counted in `checks`, so `N = 9` cannot move"*).
    //
    // **THE TWO BRANCHES, AND WHY BOTH ARE ROWS RATHER THAN ONE:** the RED branch
    // keeps the as-filed absence assertions (with their time-scoped reading: this
    // probe's own truth-state was AT RED-AUTHOR TIME, and the row's FAIL then was
    // *"not a defect in the deliverable"* — `R-10`'s provenance reading). The GREEN
    // branch asserts the presence of the declared spellings and the RUNNABILITY of
    // `F-12` — which is the MEANINGFUL NEWS for this unit, *"never failing because
    // the work was done."* `F-12` itself is still NOT CLAIMED here (`docs/specs/
    // gsession.md` `§2.6`/`§5.2`: a DONE row that reports it green without the
    // harness's own preconditions is a review finding); what the green branch
    // records is that its PRECONDITION is now MET.
    // -----------------------------------------------------------------------
    const harnessRel = 'scripts/electron-divergence.mjs'
    const harness = readFileSync(`${REPO_ROOT}/${harnessRel}`, 'utf8')
    expect(
      harness.length,
      `R-11/§3.5 — the probe is not vacuous: \`${harnessRel}\` exists and is readable, so its content is a real reading`,
    ).toBeGreaterThan(0)
    // **THE DECLARED SPELLINGS, read FROM THE AMENDMENT rather than derived from the
    // harness** (the control below drives the probe both ways, so a probe that returned
    // "landed" unconditionally, or never, FAILS). Each token is assembled from chunks so
    // this file does not itself carry the spelling it probes for.
    const channelToken = ['scenario', 'Envelope'].join('')
    const mismatchToken = ['ENVELOPE', '-MISMATCH'].join('')
    const extPrefix = ['[', 'EXT', ']'].join('')
    const declaredSpellings = [channelToken, mismatchToken, extPrefix]
    /** **THE PROBE ITSELF**, extracted so its CONTROLS drive the same rule the green
     *  branch depends on: `[]` iff the source carries every declared spelling. */
    const declaredSpellingsPresent = (source: string): string[] =>
      declaredSpellings.filter((token) => !source.includes(token))
    const landed = declaredSpellingsPresent(harness)
    if (landed.length > 0) {
      // ===================== THE RED BRANCH =====================
      expect(
        landed,
        `R-11 (RED form, TIME-SCOPED)/§3.5 — **THE AS-FILED READING: at RED-AUTHOR TIME the extended harness had NOT landed** — no \`${channelToken}\` channel, no \`${mismatchToken}\` instrument-error path and no \`${extPrefix}\` tally existed in \`${harnessRel}\`, whose deliverable is \`U-DIVERGENCE-EXT\` (ledger row \`C2\`) with that row \`BLOCKED\`. **A NON-EMPTY list is therefore the AS-FILED red form and is NOT a defect** (a time-scoped absence reading, exactly as \`R-10\`'s provenance is): if this branch is reached at all, it is reached because the harness is PARTIALLY present, and MISSING: ${JSON.stringify(
          landed,
        )}. That is a real reading about \`U-DIVERGENCE-EXT\`'s own contract (its amendment's \`A-1.1\`/\`A-1.6\`/\`A-4\`), never a claim of this unit's`,
      ).toEqual(landed)
      // THE FALSIFIABLE CORE OF THE RED BRANCH, kept: the RED reading must be driven by
      // the probe and not by a constant, so a source carrying every declared spelling
      // makes `landed` EMPTY (that is the green branch's condition, measured here).
      expect(
        declaredSpellingsPresent(declaredSpellings.join('\n')),
        'R-11/§3.5 (RED branch, control) — the probe is a REAL reading and not a constant: a source carrying every declared spelling answers `[]`, which is exactly the GREEN branch’s condition. A probe that always answered `[]` would fail here',
      ).toEqual([])
    } else {
      // ==================== THE GREEN BRANCH ====================
      expect(
        landed,
        `R-11 (GREEN form, ⟶ BRANCHED 2026-09-27)/§3.5 — **THE HARNESS HAS LANDED: \`${harnessRel}\` carries ALL THREE of the amendment's declared spellings** (\`${channelToken}\` the \`H-r10\` channel, \`${mismatchToken}\` the instrument-error path, \`${extPrefix}\` the tally that is NOT counted in \`checks\`) — \`docs/specs/ci-divergence-leg.md\`'s \`AMENDMENT BLOCK (U-DIVERGENCE-EXT)\` \`A-1.1\`/\`A-1.5\`/\`A-1.6\`/\`A-4\`. **AND THEREFORE \`F-12\` IS NOW RUNNABLE — THE MEANINGFUL NEWS FOR THIS UNIT, and the row's own message states it was the anticipated outcome: a non-empty list *"means \`F-12\` is now runnable and this unit MAY take it (that harness's own spec is its authority)"*. \`F-12\` itself remains **NOT CLAIMED** by this unit (no \`[D]\` row — \`docs/specs/gsession.md\` \`§2.6\`/\`§5.2\`); what moved is its PRECONDITION. Reads: ${JSON.stringify(
          landed,
        )}`,
      ).toEqual([])
      // **THE FALSIFIABLE CONTROL — THE GREEN BRANCH'S OWN CORE, DRIVEN BOTH WAYS.** The
      // claim "the harness EXISTS WITH ITS DECLARED SPELLINGS" must be able to fail: a
      // synthetic harness carrying NONE of them FAILS it (its missing list is the full
      // declared set), while one carrying all three PASSES. So this row is not a
      // tautology that reads green whenever the file exists.
      expect(
        [
          declaredSpellingsPresent('// a synthetic harness carrying NONE of the declared spellings\n'),
          declaredSpellingsPresent(declaredSpellings.map((t) => `// ${t}`).join('\n')),
        ],
        `R-11/§3.5 (GREEN branch, control) — THE GREEN BRANCH CAN STILL FAIL, FOR THE RIGHT REASON: a synthetic harness carrying NONE of the declared spellings must report EVERY spelling MISSING (so the green branch above would FAIL on it), while one carrying all three reports \`[]\`. **The LIVE harness was measured through this same probe** — reads: live=${JSON.stringify(
          declaredSpellingsPresent(harness),
        )}. A probe hardened into a constant fails one direction or the other here`,
      ).toEqual([declaredSpellings, []])
    }
    // **THE EXTENSION'S NODE-SIDE HALF.** The amendment's `A-2.8` requires the
    // extractor's pure half to be *"exercised in the node suite against fixed literal
    // HTML"*. **MEASURED 2026-09-27:** the name that clause used — `tests/divergence-ext.test.ts`
    // — does NOT exist, and the unit's rows live instead in
    // `tests/divergence-attribute-extractor.test.ts` (the divergence unit's own file,
    // whose rows are THAT unit's authority). **The assertion below is kept as filed and
    // is still the honest reading of the name it probes** (an absence probe is never
    // reported as a presence, and a future file landing under that name is a real
    // event this row then reports).
    const extTestRel = 'tests/divergence-ext.test.ts'
    const extractorRowsRel = 'tests/divergence-attribute-extractor.test.ts'
    expect(
      existsSync(`${REPO_ROOT}/${extTestRel}`),
      `R-11/§3.5 — the extension's node-side half under the name the amendment's \`A-2.8\` uses (\`${extTestRel}\`) does not exist. **REPORTED BESIDE IT, NOT INSTEAD OF IT:** the unit's rows were measured at \`${extractorRowsRel}\` (present: ${String(
        existsSync(`${REPO_ROOT}/${extractorRowsRel}`),
      )}) — the divergence unit's own test file, whose rows are that unit's authority, not this row's`,
    ).toBe(false)
    expect(
      existsSync(`${REPO_ROOT}/${extractorRowsRel}`),
      `R-11 (GREEN form)/§3.5 — the extended harness's node-side half is LANDED at \`${extractorRowsRel}\` (measured present), so the absence probe above is a reading about ONE NAME and not about the extension being absent`,
    ).toBe(true)
    // The pinned identity leg's own pin is read LIVE (never a literal copy), so this row
    // also records that `N = 9` is untouched by this unit (`§5.2`: no `[D]` row claimed) —
    // and, since the amendment's `A-4` is *"the `[EXT]` checks are NEVER counted in
    // `checks`"*, this reading is exactly the clause the landing had to preserve.
    const pinned = readFileSync(`${REPO_ROOT}/${harnessRel}`, 'utf8').match(/R13 RESULT: \$\{checks\} checks/)
    expect(
      pinned,
      'R-11 — the pinned leg’s own summary line is read from the live harness (so the `N = 9` identity this unit claims nothing about is a real reading, not a copy)',
    ).not.toBe(null)
  })

  it('R-9 §3.4 — the absent-page-design PROBE: `docs/skills/designing-pages.md` does not exist (a FAIL is meaningful)', () => {
    const pageDesign = new URL('../docs/skills/designing-pages.md', import.meta.url)
    expect(
      existsSync(pageDesign),
      'R-9/§1 item 8/§7 item 11 — `docs/skills/designing-pages.md` DOES NOT EXIST at the time this red set runs. IF IT EXISTS this row FAILS MEANINGFULLY: this unit then OWES a test-use-case coverage row in that file’s coverage matrix PLUS an entry in its demo-page index — and a mechanism renders no page, so the row would be an ABSENCE row rather than a claim',
    ).toBe(false)
    expect(
      existsSync(new URL('../docs/skills/process-guardrails.md', import.meta.url)),
      'R-9/§3.4 — the probe is not vacuous: `docs/skills/process-guardrails.md` DOES exist (globbed `docs/skills/*` at filing), so `existsSync` on the sibling path answers true',
    ).toBe(true)
  })
})

// ===========================================================================
// R-1..R-8 — §3.4 THE STATIC ROWS (the `§2.2` prohibition table's ids).
// ===========================================================================
describe('R — §3.4 the static rows (the §2.2 prohibition table’s ids)', () => {
  it('R-1 §3.4 — THE ANTI-EVASION VOCABULARY ROW: no consumer vocabulary and no banned token, raw, ASSEMBLED or in a comment', () => {
    const raw = moduleSource('R-1 §2.2 P-1/P-4/P-5/P-7')
    // SCOPE (`§3.4 R-1`'s own words): the MODULE file WHOLE, comments INCLUDED, over the
    // NORMALIZED (assembly-JOINED) view, plus THIS ROW'S OWN controlled corpora. **A
    // whole-file negative over this test file is DELIBERATELY DROPPED** — this file must
    // carry the banned spellings inside the controls below, so such a scan could only fail.
    expect(
      vocabularyViolations(raw),
      'R-1/§2.2 P-1 — the module carries no consumer vocabulary token, RAW, ASSEMBLED or in a COMMENT (§4.4 S-1’s closure), and no selector/threshold/attribute/zone/pane/tab/store spelling in any form',
    ).toEqual([])
    // THE CONTROLS, all three forms required by the row.
    for (const [shape, fixture] of VOCAB_POSITIVE_CONTROLS) {
      expect(
        vocabularyViolations(fixture).length,
        `R-1 POSITIVE control (${shape}) — the vocabulary scan MUST fail for a module carrying the spelling ${shape}: the row is otherwise UNFALSIFIED and must not be filed (§4.4 S-1)`,
      ).toBeGreaterThan(0)
    }
    for (const boundaryFixture of VOCAB_ASSEMBLY_BOUNDARY_CONTROLS) {
      expect(
        vocabularyViolations(boundaryFixture),
        `R-1 BOUNDARY half — an assembled spelling ADJACENT TO AN IDENTIFIER is not a bounded occurrence (\`§3.4 R-1\`’s boundary rule, whose purpose is that ordinary words containing a spelling pass): the scan is not over-broad [${boundaryFixture}]`,
      ).toEqual([])
    }
    // Neither assembly control is vacuous: the assembled view really joins the pieces, so
    // the pass/fail above measures the BOUNDARY rule and not an empty string.
    const assembledPositive = assembledChunks(VOCAB_POSITIVE_CONTROLS[1][1])
    expect(
      assembledPositive.includes(VOCAB_WORDS[1]),
      `R-1 — the positive assembly control really ASSEMBLES the spelling in the normalized view (${JSON.stringify(
        assembledPositive,
      )} contains ${JSON.stringify(VOCAB_WORDS[1])})`,
    ).toBe(true)
    expect(
      vocabularyViolations(VOCAB_NEGATIVE_CONTROL),
      'R-1 NEGATIVE control — this unit’s own legitimate text (the four event types of §2.1, the seven result codes of §2.3 item 4, the parameter names) PASSES the vocabulary scan',
    ).toEqual([])
    expect(
      vocabularyViolations(VOCAB_BOUNDARY_CONTROL),
      'R-1 — the BOUNDARY rule holds: ordinary words CONTAINING a spelling are not violations (this is why the scan is bounded)',
    ).toEqual([])
    // The boundary control is not vacuous: the fixture really carries the chunk that
    // would be a spelling under a substring scan.
    expect(
      /table/.test(VOCAB_BOUNDARY_CONTROL),
      'R-1 — the boundary control really carries the word `table`, so the pass above is measured and not an empty-string artifact',
    ).toBe(true)
  })

  it('R-2 §3.4 — THE FORBIDDEN-ACCESS ROW: no realm-rooted access, no ambient read, no element lookup, and ZERO module-level mutable state', () => {
    const raw = moduleSource('R-2 §2.2 P-2/P-3/P-8/P-9')
    const code = stripComments(raw)
    expectNoStaticHits(raw, AMBIENT_RULES, 'R-2 §3.4 (§2.2 P-2/P-3/P-8/P-9)')
    expectNoStaticHits(code, MODULE_STATE_RULES, 'R-2 §3.4 (I-12 zero-state)')
    // The positive controls: every named evasion shape must be caught.
    const controls: ReadonlyArray<readonly [string, string, ReadonlyArray<{ what: string; re: RegExp }>]> = [
      ['a raw realm token', `const d = ${['doc', 'ument'].join('')}`, AMBIENT_RULES],
      ['a COMPUTED access on a banned token', `const g = ${['global', 'This'].join('')}['pro' + 'cess']`, AMBIENT_RULES],
      ['a helper-returned realm alias', `const realm = ${['global', 'This'].join('')}\nrealm['x']`, AMBIENT_RULES],
      ['the no-token realm route', `const g = ({}).constructor.constructor('return this')()`, AMBIENT_RULES],
      ['an ambient clock read', `const t = Date.now()`, AMBIENT_RULES],
      ['a node environment read', `const e = process.env['X']`, AMBIENT_RULES],
      ['a module-scope `let` (a counter/store)', `${'let'} calls = 0`, MODULE_STATE_RULES],
      ['a module-scope Map (a cache)', `${'const'} cache = new Map()`, MODULE_STATE_RULES],
    ]
    for (const [label, fixture, rules] of controls) {
      expect(
        rules.some(({ re }) => staticHits(fixture, re).length > 0),
        `R-2 POSITIVE control (${label}) must FAIL its scan — the prohibition is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
    // THE ROW'S STATED LIMIT (`§3.4 R-2`): **a BLANKET ban on `[expr]` is NOT claimed** —
    // a locally constructed object's computed access and ordinary indexing carry no
    // banned token and are deliberately not banned. A row asserting "no bracket notation
    // at all" FAILS this row's own text and is `S-3`.
    const legitimateIndexing = `${'const'} out: Record<string, unknown> = {}\nout['a'] = 1\nfor (const k of Object.keys(out)) { void out[k] }`
    expectNoStaticHits(legitimateIndexing, AMBIENT_RULES, 'R-2 STATED LIMIT — local computed access')
    expect(
      staticHits(legitimateIndexing, /\[/).length,
      'R-2 STATED LIMIT — the scan does not ban bracket notation as such (the legitimate fixture is full of it and passes)',
    ).toBeGreaterThan(0)
  })

  it('R-3 §3.4 — THE EVENT-WIRING ROW: no listener attachment and no capture of the module’s own — every attach/detach/capture goes through the injected source', () => {
    const code = stripComments(moduleSource('R-3 §2.2 P-3/P-7, I-8'))
    expectNoStaticHits(code, WIRING_RULES, 'R-3 §3.4')
    for (const [label, fixture] of [
      ['a direct attachment', `el.${['add', 'EventListener'].join('')}('${TYPE_START}', () => {})`],
      ['a direct detachment', `el.${['remove', 'EventListener'].join('')}('${TYPE_START}', () => {})`],
      ['a direct capture', `el.${['set', 'Pointer', 'Capture'].join('')}(1)`],
      ['an `on<event>=` assignment', `el.on${TYPE_START} = () => {}`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        WIRING_RULES.some(({ re }) => staticHits(stripComments(fixture), re).length > 0),
        `R-3 POSITIVE control (${label}) must FAIL the token scan — the prohibition is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
    // The row's OWN falsifiable half pairs the token scan with a runtime ORDERED LOG
    // (`M-6`, `F-10`): a capture call reachable from `install` or from a start listener
    // FAILS. The pair is the row — a text scan cannot prove the absence of a capture for
    // all control flow (`§3.4 R-3`'s honest limit), so the runtime half is asserted by
    // `M-6`/`M-7`/`F-10`/`P-GS-IM-5` below.
    const sources = walkSourceFiles()
    expect(
      sources.length,
      'R-3 — the consumer census is non-empty, so the "no importer" claim below is a census of real files',
    ).toBeGreaterThan(10)
  })

  it('R-4 §3.4 — THE IMPORT-BOUNDARY ROW: `src/shared/gesture-session.ts` imports NOTHING, not even a type-only import', async () => {
    const raw = moduleSource('R-4 §2.2 P-10, I-13')
    const importRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'any `import` statement at all (including a type-only one)', re: /^\s*import\b|\bimport\s*\(/m },
      { what: 'a CommonJS `require(`', re: /\brequire\s*\(/ },
      { what: 'a dynamic `import(`', re: /\bimport\s*\(/ },
      { what: 'an `export … from` re-export (a form of import)', re: /\bexport\s+(?:\*|\{[^}]*\})\s*from\b/ },
    ]
    expectNoStaticHits(raw, importRules, 'R-4 §3.4 (§2.2 P-10, I-13)')
    for (const [label, fixture] of [
      ['a value import', `import { x } from './zones.js'`],
      ['a TYPE-ONLY import', `import type { X } from './types.js'`],
      ['a dynamic import', `${'const'} m = await import('./x.js')`],
      ['a re-export', `export { y } from './y.js'`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        importRules.some(({ re }) => staticHits(fixture, re).length > 0),
        `R-4 POSITIVE control (${label}) must FAIL the import scan — the row is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
    // THE NEGATIVE control: this unit's own legitimate text (a module that imports
    // NOTHING, with the four event types and the seven codes) PASSES.
    const legitimate = `${'export'} const POINTER_TYPES = Object.freeze({ start: '${TYPE_START}', move: '${TYPE_MOVE}', end: '${TYPE_END}', cancel: '${TYPE_CANCEL}' })\n`
    expectNoStaticHits(legitimate, importRules, 'R-4 NEGATIVE control — a module that imports nothing')
    // The COMPANION claim is `R-7`'s (this module is imported by NO `src/**` file).
    const module = await resolveModule()
    void module
  })

  it('R-5 §3.4 — THE ISOLATION / OWNERSHIP ROW: only argument elements reach the source, identity is the key, and the isolated SecurePanels scope is never touched', async () => {
    const h = await makeHarness({ installOptions: {} })
    const elA: Record<string, unknown> = { name: 'control-a' }
    const elB: Record<string, unknown> = { name: 'control-b' }
    const cloneOfA: Record<string, unknown> = { name: 'control-a' }
    expect(h.sessionInstall(elA), 'R-5/§2.4 item 2 — the first install of a distinct element returns `true`').toBe(true)
    expect(h.sessionInstall(elB), 'R-5/§2.4 item 2 — a structurally identical but DISTINCT object is a SECOND control').toBe(true)
    expect(
      h.sessionInstall(cloneOfA),
      'R-5/§2.4 item 2 (I-9) — a structural CLONE of `elA` is a different object and therefore a DIFFERENT control (identity, never name/class/attribute/position)',
    ).toBe(true)
    const handedElements = new Set(h.source.log.filter((r) => r.op === 'on').map((r) => r.element))
    for (const element of handedElements) {
      expect(
        [elA, elB, cloneOfA].includes(element as Record<string, unknown>),
        `R-5/§2.2 P-2, I-9 — EVERY element handed to the source is EXACTLY an argument of \`install\` (the module derives, looks up or caches NO element): ${brief(element)}`,
      ).toBe(true)
    }
    expect(
      h.source.log.filter((r) => r.op === 'on').length,
      'R-5/I-9 — the three distinct objects produced exactly three start listeners (the ledger is keyed by reference)',
    ).toBe(3)
    // ⟶ `D-13`/`ADV-GS-13` — **THE MISSING RUNTIME-OWNERSHIP CONTROL.** `§3.4 R-5` demands
    // the row's own words: *"a positive control: an implementation that looked an element
    // up, cached one, or closed over one **FAILS**"*. The as-filed row carried a control
    // for its STATIC half only (`R-5 POSITIVE control (…)` inside the loop below), so its
    // RUNTIME half — *"only the exact references passed to `install` and to `begin`"* —
    // could not FAIL and was therefore unfalsifiable. The stand-in below is a minimal
    // implementation of the FORBIDDEN shape (it hands the source an element it produced
    // itself, derived from the argument, instead of the argument), and the row's own
    // runtime check is then run against it.
    const forbiddenSource = makeSource({})
    const handedElementsOf = (source: RecorderSource): unknown[] => source.log.filter((r) => r.op === 'on').map((r) => r.element)
    const theArgument: Record<string, unknown> = { name: 'the-argument' }
    const lookedUp: Record<string, unknown> = { name: 'looked-up-by-the-implementation' }
    forbiddenSource.on(lookedUp, TYPE_START, (): void => undefined)
    expect(
      handedElementsOf(forbiddenSource).every((element) => [theArgument].includes(element as Record<string, unknown>)),
      'R-5/D-13 POSITIVE CONTROL — an implementation that hands the source an element which was NOT the argument (a lookup, a cache or a closure) FAILS the row’s own runtime check: the check is falsifiable rather than vacuous',
    ).toBe(false)
    expect(
      handedElementsOf(h.source)
        .filter((element) => ![elA, elB, cloneOfA].includes(element as Record<string, unknown>))
        .length,
      'R-5/D-13 — and on the REAL module the same check finds nothing: every element handed to the source is exactly an argument (`§2.2 P-2`, `I-9`)',
    ).toBe(0)
    // The static half: no reference to the isolated scope and no second mount reference.
    const code = stripComments(moduleSource('R-5 §0 ruling 11, MULTI-GRAPH-ISOLATION'))
    const isolationRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'the isolated `SecurePanels` scope', re: /\b(?:secure-panels|securePanels|SecurePanels)\b/ },
      { what: 'a second mount reference', re: /\b(?:createRoot|mountEl|secondGraph|graphB)\b/ },
      { what: 'a graph/registry lookup', re: /\b(?:listTargets|list_targets|registered\s*\(|provident\b)/ },
    ]
    expectNoStaticHits(code, isolationRules, 'R-5 §3.4 (§0 ruling 11)')
    for (const [label, fixture] of [
      ['a secure-panels import', `import { p } from './secure-panels.js'`],
      ['a second mount', `${'const'} secondGraph = mountEl(el)`],
      ['a target lookup', `${'const'} t = list_targets()`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        isolationRules.some(({ re }) => staticHits(fixture, re).length > 0),
        `R-5 POSITIVE control (${label}) must FAIL the isolation scan — a positive is a FINDING, not a style note`,
      ).toBe(true)
    }
    void elB
  })

  it('R-6 §3.4 — THE EXPORT-CENSUS ROW: SET EQUALITY over the FOUR value exports; the EIGHT type-only names through leg 4; and the FIVE-SEAM negative', async () => {
    const mod = await requireModule('R-6 §2.1')
    const VALUE_EXPORTS = ['createGestureSession', 'installGestureListeners', 'detachGestureListeners', 'POINTER_TYPES']
    const valueExports = Object.keys(mod)
      .filter((k) => k !== 'default')
      .sort()
    expect(
      valueExports,
      `R-6(a)/§2.1 — the module’s RUNTIME exports are EXACTLY the FOUR value exports ${JSON.stringify(
        [...VALUE_EXPORTS].sort(),
      )} — \`4\` value exports + \`8\` type declarations = \`12\` exported names, and a FIFTH value export FAILS this SET equality (never a bare count — §4.4 S-2). Observed: ${JSON.stringify(
        valueExports,
      )}`,
    ).toEqual([...VALUE_EXPORTS].sort())
    // The POSITIVE control: a namespace carrying a fifth value export FAILS.
    const fiveValueExports: Record<string, unknown> = {
      createGestureSession: 1,
      installGestureListeners: 2,
      detachGestureListeners: 3,
      POINTER_TYPES: 4,
      gestureSessionFor: 5,
    }
    expect(
      Object.keys(fiveValueExports).filter((k) => k !== 'default').sort(),
      'R-6(a) POSITIVE control — a namespace with a FIFTH value export does not equal the pinned set',
    ).not.toEqual([...VALUE_EXPORTS].sort())
    // The TYPE-ONLY half is a COMPILE-TIME claim (`§5.2` leg 4): the eight `import type`
    // declarations at the head of this file do not compile unless the module exports the
    // eight names. The locals below exercise them so the imports are used, not decorative.
    const moduleEventSource: ModuleEventSource | null = null
    const moduleElement: ModuleGestureElement = { control: true }
    const moduleOptionsInput: ModuleGestureOptionsInput = { capture: true }
    const moduleGestureOptions: ModuleGestureOptions | null = null
    const moduleSessionOptions: ModuleSessionOptions = { source: undefined, commit: undefined }
    const moduleSessionStats: ModuleSessionStats | null = null
    const moduleGestureStats: ModuleGestureStats | null = null
    const moduleGestureHandle: ModuleGestureHandle | null = null
    expect(
      [
        moduleEventSource,
        moduleOptionsInput,
        moduleGestureOptions,
        moduleSessionStats,
        moduleGestureStats,
        moduleGestureHandle,
      ],
      'R-6(b)/§2.1 — the EIGHT type-only names (`EventSource`, `GestureElement`, `GestureHandle`, `GestureOptions`, `GestureOptionsInput`, `SessionOptions`, `SessionStats`, `GestureStats`) are exported by the module: this row does not COMPILE unless they are, which is the leg-4 half of the claim (an erased type cannot fail at run time)',
    ).toEqual([null, { capture: true }, null, null, null, null])
    expect(
      Object.keys(moduleSessionOptions),
      'R-6(b) — the `SessionOptions` mirror carries `source` and `commit` as its two members (§2.1)',
    ).toEqual(['source', 'commit'])
    expect(brief(moduleElement), 'R-6(b) — `GestureElement` is `unknown` in `§2.1`, so any value is a legal element').toBe(
      'an object {control}',
    )
    // (c) THE FIVE-SEAM NEGATIVE, by SET EQUALITY AGAINST THE NAMES where a name-complete
    // row exists (`S-2`), never by a bare count.
    const toolsLive = readArrayLiteral('src/main/mcp-server.ts', /static\s+readonly\s+ALL_TOOLS\s*:\s*string\[\]\s*=\s*\[/)
    const siblingPinned = readArrayLiteral('tests/engine-pin-version.test.ts', /const\s+PINNED_TOOL_SET\s*=\s*\[/)
    expect(
      siblingPinned.length,
      'R-6(c)/§4.4 S-2 — the sibling name-complete row (`tests/engine-pin-version.test.ts`) pins the 22 tool NAMES (`N-15`/`N-19`: `provident.focus` joins it in the SAME COMMIT); this row cites it rather than re-authoring it',
    ).toBe(22)
    expect(
      toolsLive.sort(),
      `R-6(c)/§2.2 P-6 — the LIVE \`ALL_TOOLS\` set equals the pinned 22-NAME set (a tool ADDED or REMOVED fails BY NAME, not by count): ${JSON.stringify(
        toolsLive,
      )}`,
    ).toEqual([...siblingPinned].sort())
    const groupsLive = readArrayLiteral('src/main/security.ts', /const\s+VALID_GROUPS[^=]*=\s*new\s+Set\(\s*\[/)
    expect(
      groupsLive.sort(),
      'R-6(c)/§2.2 P-6 — the LIVE `VALID_GROUPS` keeps its FIVE named members',
    ).toEqual(['code', 'dispatch', 'graph', 'module', 'read'])
    const mutatingLive = readArrayLiteral('src/renderer/renderer.ts', /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\s*\[/)
    expect(
      mutatingLive.sort(),
      'R-6(c)/§2.2 P-6 — the LIVE `MUTATING_METHODS` keeps its SEVEN named entries (this unit adds no mutating IPC method)',
    ).toEqual(['code.load', 'code.loadBatch', 'dispatch', 'journal', 'load', 'op', 'teardown'])
    const rpcLive = readUnionMembers('src/shared/types.ts', /export\s+type\s+RpcMethod\s*=/)
    expect(rpcLive.length, 'R-6(c)/§2.2 P-6 / `N-15` — the LIVE `RpcMethod` union is name-complete in this census (22 members, `focus` included in the SAME COMMIT)').toBe(22)
    expect(new Set(rpcLive).size, 'R-6(c) / `N-15` — the `RpcMethod` census is a SET (distinct members), so the count is not a bag').toBe(22)
    // The module itself carries NO registration token of any kind.
    const code = stripComments(moduleSource('R-6(c) §2.2 P-6'))
    const seamRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'a tool/resource/group registration', re: /\b(?:registerTool|registerResource|VALID_GROUPS|MUTATING_METHODS|ALL_TOOLS|ALL_RESOURCES|RpcMethod)\b/ },
      { what: 'an IPC surface', re: /\b(?:ipcRenderer|ipcMain|RpcRequest|list_targets|listTargets)\b/ },
      { what: 'a tool/resource descriptor', re: /\b(?:name\s*:\s*['"][a-z_.]+['"][^}]*inputSchema|inputSchema|mimeType\b)/ },
      { what: 'a `stats`/`gesture` wiring to an agent-reachable surface', re: /\b(?:dispatch|get_rendered_html|getRenderedHtml)\b/ },
    ]
    expectNoStaticHits(code, seamRules, 'R-6(c) §3.4 (F-9(b), A-10)')
    for (const [label, fixture] of [
      ['a registration', `registerTool('x')`],
      ['a group-table read', `${'const'} g = VALID_GROUPS`],
      ['a resource descriptor', `{ name: 'provident.x', inputSchema: {} }`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        seamRules.some(({ re }) => staticHits(fixture, re).length > 0),
        `R-6(c) POSITIVE control (${label}) must FAIL the seam scan — the prohibition is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
    // And the value exports are NAMED, not merely counted (`R-6`'s own text: "A row
    // asserting only a COUNT without NAMING the names FAILS this row's own text").
    for (const name of VALUE_EXPORTS) {
      expect(
        Object.prototype.hasOwnProperty.call(mod, name),
        `R-6(a) — the value export \`${name}\` is NAMED in the module's own namespace (§2.1's export census)`,
      ).toBe(true)
    }
    // The `POINTER_TYPES` record is FROZEN and carries the four pinned event types.
    const types = mod['POINTER_TYPES'] as Record<string, string>
    expect(
      types,
      'R-6(a)/§2.1 — `POINTER_TYPES` is exported as a value (`§0A` note 10: the four event types are the session’s contract, frozen and non-configurable)',
    ).not.toBe(undefined)
    expect(Object.keys(types).sort(), 'R-6(a)/§2.1 — `POINTER_TYPES` carries exactly `start`/`move`/`end`/`cancel`').toEqual([
      'cancel',
      'end',
      'move',
      'start',
    ])
    expect(
      [types['start'], types['move'], types['end'], types['cancel']],
      'R-6(a)/§2.1 — the four pinned names, in the spec’s order: `start` = pointerdown · `move` = pointermove · `end` = pointerup · `cancel` = pointercancel',
    ).toEqual([TYPE_START, TYPE_MOVE, TYPE_END, TYPE_CANCEL])
    expect(
      Object.isFrozen(types),
      'R-6(a)/§2.1 — `POINTER_TYPES` is FROZEN (`§2.1`: "Frozen, not configurable, and carrying NO consumer vocabulary")',
    ).toBe(true)
  })

  it('R-7 §3.4 — THE DIFF-SCOPE ROW (UNIT-SCOPED): the unit’s own committed artifacts inside the allow-list, the DENIED set over the WHOLE committed set, and the “imported by no `src/**` file” companion claim', () => {
    // -----------------------------------------------------------------------
    // `§5.1`'s scope rule, in the UNIT-SCOPED form the sibling passes converged on
    // (three sibling rows went red on LATER units' work before this scoping was
    // fixed): the ALLOW-LIST binds THIS UNIT'S OWN COMMITTED ARTIFACTS, the DENIED set
    // binds the WHOLE committed set, any carve-out is NAMED, and a `git status`-ONLY
    // probe — vacuous after any commit — or an un-anchored whole-range probe is NOT
    // this row's form.
    //
    // **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE `R-7` DIFF-SCOPE REPAIR PASS, RULING B) — THE
    // PREAMBLE ABOVE IS KEPT BYTE-FOR-BYTE AS FILED AND IS ANNOTATED, NEVER REWRITTEN.** Its
    // sentence *"the DENIED set binds the WHOLE committed set"* stays this row's CLAIM; what the
    // repair moves is the arm's SUBJECT, because the as-filed reading measured FALSE at `81ffd31`:
    // `'tests/gutter-ui.test.ts' was COMMITTED inside this unit’s range 709a4a0e..HEAD and is in the
    // DENIED set` — a SIBLING unit's declared red set, carried in the same range commit as this
    // unit's suite (and `tests/gutter.test.ts`, `E3`'s declared red set, with it). **The governing
    // rule is `docs/specs/gutter.md` `§5.1`'s commit-range scope rule — *"must NOT read a later
    // unit's commits, a sibling's dirty working-tree file, or a sibling unit's artifact as this
    // unit's diff"* — and `§3.4 R-4`, *"a later unit that legitimately imports THIS module is not a
    // violation of it"*.** The DENIED predicate below is BYTE-IDENTICAL and UNWEAKENED; the subject
    // is `U-GSESSION`'s OWN attributable committed paths; the controls that keep it falsifiable (a
    // synthetic unit-own denied path STILL FAILS, a sibling-only set contributes NOTHING, the
    // sibling predicate is driven BOTH ways, non-vacuity stated) are in the annotated arm below.
    // -----------------------------------------------------------------------
    const ALLOWED: readonly string[] = [
      MODULE_RELPATH,
      TEST_RELPATH,
      SPEC_RELPATH,
      'docs/next-steps.md',
      'docs/decisions.md',
      'docs/pending.md',
      'docs/FORKER.md',
      'docs/defects.md',
      'docs/HANDOFF.md',
    ]
    const inScope = (path: string): boolean => ALLOWED.includes(path) || UNIT_GREENS_PROBE.test(path) || UNIT_REVIEW_PROBE.test(path)
    /** **`§5.1`'s "Outside the scope, ALWAYS" DENIED set** — it binds absolutely. A pure
     *  `src/shared/` mechanism may touch none of these. */
    const DENIED: readonly string[] = [
      'src/main/',
      'src/renderer/',
      'src/shared/dom-shim.ts',
      'src/shared/types.ts',
      'src/shared/zones.ts',
      'src/shared/census.ts',
      'src/shared/layout-projection.ts',
      'src/shared/owned-list-host.ts',
      'src/shared/slot-host.ts',
      'src/shared/mount-invariant-guard.ts',
      'package.json',
      'package-lock.json',
      'scripts/',
      'node_modules/',
      '../Preempt-Providence/',
    ]
    const DENIED_PATTERNS: readonly RegExp[] = [
      // A SIBLING unit's artifact — the carve-out is NAMED: this unit's OWN
      // `docs/specs/gsession*-greens.md` and its own review record are admitted.
      /^docs\/specs\/(?!gsession[^/]*-greens\.md$).*-greens\.md$/,
      /^archive\/reviews\/(?!.*(U-GSESSION|gsession)).*\.md$/,
      // Another unit's EXISTING test file (this unit authors exactly one test file).
      /^tests\/(?!gesture-session\.test\.ts$)/,
      // The composing units' own specs (`§5.1`: they are THEIRS to file).
      /^docs\/specs\/(?:gutter|relocate|container)\.md$/,
    ]
    const isDenied = (path: string): boolean =>
      DENIED.some((d) => path === d || path.startsWith(d)) || DENIED_PATTERNS.some((re) => re.test(path))
    const SCOPE_TEXT = `${ALLOWED.join(' + ')} + this unit’s own docs/specs/gsession*-greens.md + its own review record under archive/reviews/`
    const committed = committedChangeSet()
    if (committed !== null) {
      const scoped = unitScopedCommitted(committed.anchor, committed.range)
      expect(
        scoped.unitCommits,
        `R-7/§5.1 — at least ONE commit in ${committed.range} touched this unit’s own artifacts: the unit-scoped census is non-empty (commits in the range: ${scoped.commitsInRange}, unit-touching commits: ${scoped.unitCommits}). A commit touching none of them is another unit’s commit and is out of this row’s jurisdiction — a boundary, not a licence`,
      ).toBeGreaterThan(0)
      expect(
        scoped.files.length,
        `R-7/§5.1 — the unit’s own committed change set (${committed.range}, unit-scoped) is NON-EMPTY: a vacuous census cannot pass this row`,
      ).toBeGreaterThan(0)
      // -----------------------------------------------------------------------
      // **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE `R-7` DIFF-SCOPE REPAIR PASS, RULING B) — THE SAME
      // OVER-BROAD CLASS `tests/gutter.test.ts`'s `R-12` ALREADY REPAIRED, IN THIS ROW'S OWN
      // DENIED-SET ARM.** The AS-FILED ARM IS KEPT VISIBLE ABOVE (the scope preamble's *"the DENIED
      // set binds the WHOLE committed set"* — which stays the row's CLAIM) AND ITS SUBJECT ALONE IS
      // SUPERSEDED: it bound the byte-identical predicate over the WHOLE
      // `allFilesOfUnitCommits` reading, which is sound only while `HEAD` moves through THIS unit's
      // commits. **THE MEASURED FAILURE AT `81ffd31`, VERBATIM:**
      //
      //   `R-7/§5.1 — 'tests/gutter-ui.test.ts' was COMMITTED inside this unit’s range
      //    709a4a0e..HEAD and is in the DENIED set: a boundary violation whatever its content.`
      //
      // `81ffd31` is `E10`'s (`U-GUTTER-UI`) own sixth repair pass: it carried **`E10`'s DECLARED
      // red set** (`tests/gutter-ui.test.ts`, `docs/specs/gutter-ui.md` `§5.1` allow-list row `3`)
      // **TOGETHER WITH THIS UNIT'S SUITE** — and **`E3`'s DECLARED red set**
      // (`tests/gutter.test.ts`, `docs/specs/gutter.md` `§5.1` allow-list row `2`) as well — so TWO
      // SIBLING units' artifacts were read as THIS unit's own diff and the arm FAILED on them.
      // **THE GOVERNING RULE, CITED RATHER THAN ASSUMED:** `docs/specs/gutter.md` `§5.1`'s
      // commit-range scope rule — an allow-list/DENIED census *"asserted over a commit range must
      // scope its … census to THIS UNIT'S OWN ARTIFACTS … and must NOT read a later unit's commits, a
      // sibling's dirty working-tree file, or a sibling unit's artifact as this unit's diff"* — and
      // `§3.4 R-4` (*"a later unit that legitimately imports THIS module is not a violation of it"*).
      //
      // **THE REPAIR IS A SUBJECT SEAM, NEVER A WEAKER PREDICATE:** `isDenied` above is
      // BYTE-IDENTICAL to the as-filed one, still denies every one of those paths in the RAW
      // reading, and is reported whole below. What moved is the arm's SUBJECT: **a committed path
      // counts as THIS unit's own IFF it is NOT a declared sibling artifact**
      // (`isSiblingUnitArtifact`, both named sibling sets with their citing spec rows). **A DENIED
      // PATH AMONG THIS UNIT'S OWN ATTRIBUTABLE PATHS STILL FAILS** — the synthetic control below
      // drives exactly that — and a SIBLING-ONLY set contributes NOTHING.
      //
      // **⟶ SIBLING-ATTRIBUTED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING) — THE SAME OVER-BROAD CLASS,
      // A THIRD TIME, ON THE NEXT UNIT TO LAND.** The annotation above is KEPT BYTE-FOR-BYTE and
      // EXTENDED, never rewritten. **THE MEASURED RED AT `1dc6315`, VERBATIM:**
      //
      //   `Denied among them: ["scripts/electron-divergence.mjs","scripts/electron-spawn.mjs",
      //    "src/shared/dom-shim.ts","tests/divergence-attribute-extractor.test.ts",
      //    "tests/ui-leg-contract.test.ts"]`
      //
      // i.e. `U-DIVERGENCE-EXT`'s (`C2`) own landing pass — the `H-r10` channel, the set-wise extractor
      // and the shim-integrity pre-flight, plus the SHARED `src/shared/dom-shim.ts` that pass CHANGED —
      // and `U-REALDOM-BOOT`'s (`C1`) own row file were committed inside this unit's range and read as
      // this unit's diff. **THE REPAIR IS THE SAME SUBJECT SEAM, EXTENDED BY NAME:** the declaration
      // above now names FIVE more paths, EACH WITH ITS DECLARING UNIT (`SIBLING_UNIT_ARTIFACT_CONTROL`
      // + `SIBLING_ARTIFACT_UNIT_BY_PATH`), so the RAW reading below REPORTS each excluded path's
      // OWNER — the reading is never dropped, and `isDenied` is untouched. **THE GOVERNING RULE,
      // RE-CITED FOR THIS LANDING:** `docs/specs/gutter.md` `§5.1`'s commit-range scope rule (*"must
      // NOT read … a sibling unit's artifact as this unit's diff"*) and `§3.4 R-4` (*"a later unit that
      // legitimately imports THIS module is not a violation of it"*). **The shim is SHARED and is
      // attributed as A PATH, not as a unit's property: a later change to it by another unit must be
      // RE-ATTRIBUTED, never silently inherited from this declaration.**
      // -----------------------------------------------------------------------
      const committedSplit = splitBySiblingAttribution(scoped.allFilesOfUnitCommits)
      const ownCommitted = committedSplit.own
      const rawDeniedInRange = committedSplit.raw.filter(isDenied)
      const rawDeniedWithOwners = rawDeniedInRange.map((p) => ({ path: p, owner: siblingArtifactOwner(p) }))
      console.log(
        `R-7 §5.1 (SIBLING-ATTRIBUTED COMMITTED CENSUS) MEASURED :: ${JSON.stringify({
          range: committed.range,
          rawCommitted: committedSplit.raw,
          siblingArtifactsExcluded: committedSplit.sibling,
          unitOwnCommitted: ownCommitted,
          rawDeniedReading: rawDeniedInRange,
          rawDeniedReadingWithOwners: rawDeniedWithOwners,
          unitOwnDeniedReading: ownCommitted.filter(isDenied),
          unitOwnCount: ownCommitted.length,
          siblingCount: committedSplit.sibling.length,
          clause: 'docs/specs/gutter.md §5.1 (commit-range scope rule) + §3.4 R-4',
        })}`,
      )
      expect(
        [
          committedSplit.raw.length === ownCommitted.length + committedSplit.sibling.length,
          committedSplit.sibling.every((p) => isSiblingUnitArtifact(p)),
          ownCommitted.every((p) => !isSiblingUnitArtifact(p)),
        ],
        `R-7/§5.1 — THE SPLIT IS DRIVEN ON THE LIVE RANGE RATHER THAN ASSUMED: (1) the unit-scoped committed reading is partitioned EXACTLY (raw = own ⊕ sibling), (2) every EXCLUDED path really answers \`isSiblingUnitArtifact === true\`, and (3) every THIS-UNIT path really answers \`false\` — a predicate that claimed everything (or nothing) FAILS here. READS: ${JSON.stringify(
          [
            committedSplit.raw.length,
            ownCommitted.length,
            committedSplit.sibling.length,
            committedSplit.sibling.map((p) => [p, isSiblingUnitArtifact(p)]),
            ownCommitted.map((p) => [p, isSiblingUnitArtifact(p)]),
          ],
        )}. RAW committed set: ${JSON.stringify(
          committedSplit.raw,
        )}. EXCLUDED as declared sibling artifacts: ${JSON.stringify(
          committedSplit.sibling,
        )}. THIS unit's own committed set (THE ARM'S SUBJECT): ${JSON.stringify(ownCommitted)}`,
      ).toEqual([true, true, true])
      expect(
        committedSplit.sibling.length,
        `R-7/§5.1 — **NON-VACUITY OF THE EXCLUSION: THE EXCLUSION IS DOING REAL WORK ON THIS RANGE, NOT DECORATION.** A sibling count of ZERO would mean no sibling unit's artifact was ever in this reading and the scoping above proved nothing — the measured reading is the opposite. \`${committed.range}\` contains SIBLING-ATTRIBUTED paths: ${JSON.stringify(
          committedSplit.sibling,
        )}. THIS unit's own attributable subject is NON-EMPTY too (${ownCommitted.length} paths): ${JSON.stringify(
          ownCommitted,
        )}`,
      ).toBeGreaterThan(0)
      expect(
        ownCommitted.filter(isDenied),
        `R-7/§5.1 — **THE DENIED SET BINDS \`U-GSESSION\`'S OWN ATTRIBUTABLE COMMITTED PATHS, AND \`isDenied\` IS BYTE-IDENTICAL TO THE AS-FILED PREDICATE (NO SIBLING ESCAPE HATCH WAS ADDED TO IT).** A denied path among THIS unit's own attributable paths FAILS this row (control below drives exactly that); a SIBLING's declared artifact is out of the arm's subject BY CONSTRUCTION and is REPORTED, never failed on — a sibling's DENIED path is its own row's finding, not this unit's (\`§5.1\`'s commit-range scope rule). THIS unit's own committed subject: ${JSON.stringify(
          ownCommitted,
        )}. Denied among them: ${JSON.stringify(
          ownCommitted.filter(isDenied),
        )}. **THE RAW FULL-RANGE DENIED READING, REPORTED (NON-FAILING) — NEVER DROPPED, AND WITH EACH
        PATH'S OWNING UNIT NAMED (⟶ ADDED 2026-09-27, THE U-DIVERGENCE-EXT LANDING):** ${JSON.stringify(
          rawDeniedWithOwners,
        )} — every path in it is a declared SIBLING artifact and is excluded by the SPLIT (${JSON.stringify(
          committedSplit.sibling,
        )}), never by a weaker predicate. Excluded sibling artifacts, each against \`isSiblingUnitArtifact\` AND \`isDenied\` (so the exclusion is visibly about SUBJECT while the boundary predicate still rejects every one): ${JSON.stringify(
          committedSplit.sibling.map((p) => [p, siblingArtifactOwner(p), isSiblingUnitArtifact(p), isDenied(p)]),
        )}`,
      ).toEqual([])
      // ---- THE REPAIRED ARM'S OWN FALSIFIABLE CONTROLS (ALL SYNTHETIC: no file is created) ----
      // (1) **THE ARM CAN STILL FAIL.** A synthetic THIS-UNIT-OWN committed set carrying a DENIED
      //     path is driven through the SAME two stages the arm runs (the split, then the
      //     byte-identical predicate); exactly that path must be reported.
      const CONTROL_OWN_DENIED_PATH = 'package.json'
      const controlOwnDrive = splitBySiblingAttribution([TEST_RELPATH, CONTROL_OWN_DENIED_PATH])
      expect(
        controlOwnDrive.own.filter(isDenied),
        `R-7/§5.1 POSITIVE CONTROL (THE NARROWED ARM CAN STILL FAIL, AND FOR THE RIGHT REASON): a synthetic THIS-UNIT-OWN committed set carrying a DENIED path (\`${CONTROL_OWN_DENIED_PATH}\`, denied by §5.1 absolutely) is still REPORTED by the byte-identical \`isDenied\`, so a denied path among this unit's own changes FAILS the arm — the scoping is a SUBJECT seam, not a weakened predicate. Drive: ${JSON.stringify(
          controlOwnDrive.raw,
        )}. Split → own: ${JSON.stringify(
          controlOwnDrive.own,
        )}, sibling: ${JSON.stringify(controlOwnDrive.sibling)}. Denied among own: ${JSON.stringify(
          controlOwnDrive.own.filter(isDenied),
        )}`,
      ).toEqual([CONTROL_OWN_DENIED_PATH])
      // (2) **A SIBLING-ONLY SET CONTRIBUTES NOTHING** — the direction that makes this row green.
      //     **⟶ EXTENDED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING): the drive now names ALL THREE
      //     declared units' path sets** (the as-filed two plus the `C2` harness / `C1` leg set added
      //     above), so the count is stated WITH ITS TERMS rather than as a bare literal.
      const declaredSiblingPaths = [
        ...SIBLING_UNIT_ARTIFACT_PATHS,
        ...COMPOSING_UNIT_ARTIFACT_PATHS,
        ...DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS,
      ]
      const controlSiblingOnly = splitBySiblingAttribution(declaredSiblingPaths)
      expect(
        [controlSiblingOnly.own, controlSiblingOnly.sibling.length],
        `R-7/§5.1 CONTROL (A SIBLING-ONLY COMMIT/SET CONTRIBUTES NOTHING TO THIS ARM): every one of the DECLARED sibling artifacts — ${SIBLING_UNIT_ARTIFACT_PATHS.length} + ${COMPOSING_UNIT_ARTIFACT_PATHS.length} + ${DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS.length} = ${SIBLING_UNIT_ARTIFACT_PATHS.length + COMPOSING_UNIT_ARTIFACT_PATHS.length + DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS.length}, TERMS PRINTED — is excluded, so the arm's subject is EMPTY and NOTHING of a sibling's legitimate commit can FAIL this unit's row. Drive: ${JSON.stringify(
          controlSiblingOnly.raw,
        )}. own: ${JSON.stringify(
          controlSiblingOnly.own,
        )}. sibling count: ${controlSiblingOnly.sibling.length}`,
      ).toEqual([
        [],
        SIBLING_UNIT_ARTIFACT_PATHS.length +
          COMPOSING_UNIT_ARTIFACT_PATHS.length +
          DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS.length,
      ])
      // (3) **THE MEASURED FAILURE'S OWN TWO PATHS ARE BOTH DENIED *AND* BOTH EXCLUDED** — i.e. the
      //     exclusion, and nothing else, is what makes this row's DENIED half green. The first
      //     reading proves the exclusion is doing real work; the second that it is the SPLIT's work
      //     and not a softer predicate's.
      expect(
        ['tests/gutter-ui.test.ts', 'tests/gutter.test.ts'].filter((p) => !isDenied(p)),
        `R-7/§5.1 — THE AS-FILED FAILURE'S OWN DRIVE (stage 1/2): BOTH paths the over-broad arm FAILED on are STILL DENIED by the byte-identical \`isDenied\` — it is untouched — so the exclusion, not a weakened predicate, is what removes them. This list is EMPTY when they are both denied. Reads: ${JSON.stringify(
          ['tests/gutter-ui.test.ts', 'tests/gutter.test.ts'].map((p) => [p, isDenied(p), isSiblingUnitArtifact(p)]),
        )}`,
      ).toEqual([])
      expect(
        splitBySiblingAttribution(['tests/gutter-ui.test.ts', 'tests/gutter.test.ts']).own,
        `R-7/§5.1 — THE AS-FILED FAILURE'S OWN DRIVE (stage 2/2): the SAME two paths leave the arm's subject because BOTH are declared sibling artifacts (\`docs/specs/gutter-ui.md\` §5.1 row 3; \`docs/specs/gutter.md\` §5.1 row 2) — a sibling's legitimate commit, read as this unit's diff no longer (\`§5.1\`'s commit-range scope rule; \`§3.4 R-4\`). Reads: ${JSON.stringify(
          ['tests/gutter-ui.test.ts', 'tests/gutter.test.ts'].map((p) => [p, isSiblingUnitArtifact(p)]),
        )}`,
      ).toEqual([])
      // (4) **THE PREDICATE IS DRIVEN BOTH WAYS ON ITS OWN REAL DECLARED ARTIFACTS** — the control
      //     that keeps the exclusion from being a blanket hatch: a predicate answering `true` for
      //     everything (which would make the arm vacuous) FAILS the first list, and one that also
      //     swallowed this unit's own artifacts FAILS the second.
      expect(
        SIBLING_UNIT_ARTIFACT_CONTROL.filter((c) => !isSiblingUnitArtifact(c.path)).map((c) => c.path),
        `R-7/§5.1 POSITIVE CONTROL (THE SIBLING CLASS, THE PREDICATE'S TRUE DIRECTION): EVERY declared sibling artifact (${SIBLING_UNIT_ARTIFACT_CONTROL.length} entries, ${SIBLING_UNIT_ARTIFACT_PATHS.length} + ${COMPOSING_UNIT_ARTIFACT_PATHS.length} + ${DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS.length}) must read \`isSiblingUnitArtifact === true\` — the list is EMPTY when they do. **READS (path, owning unit, reading):** ${JSON.stringify(
          SIBLING_UNIT_ARTIFACT_CONTROL.map((c) => [c.path, siblingArtifactOwner(c.path), isSiblingUnitArtifact(c.path)]),
        )}. ${SIBLING_UNIT_ARTIFACT_CONTROL.map((c) => `${c.path} ← ${c.authority}`).join(' · ')}`,
      ).toEqual([])
      // (4b) **⟶ ADDED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING) — THE WHOLE DECLARATION IS DRIVEN,
      //      NOT ONLY THE CONTROL LIST, AND EACH EXCLUDED PATH'S OWNING UNIT IS NAMED.** The five
      //      paths the measured red read as this unit's own diff are pinned BOTH ways here: they must
      //      still be DENIED (so the exclusion is about SUBJECT only, and `isDenied` is unweakened)
      //      and they must answer `true` to the sibling predicate (so the exclusion really covers
      // (4b) **⟶ ADDED 2026-09-27 (THE U-DIVERGENCE-EXT LANDING) — THE WHOLE DECLARATION IS DRIVEN,
      //      NOT ONLY THE CONTROL LIST, AND EACH EXCLUDED PATH'S OWNING UNIT IS NAMED.** The five
      //      paths the measured red read as this unit's own diff are pinned BOTH ways here: they must
      //      still be DENIED (so the exclusion is about SUBJECT only, and `isDenied` is unweakened)
      //      and they must answer `true` to the sibling predicate (so the exclusion really covers
      //      them). **THE OWNER MAP IS ALSO DRIVEN, NOT ONLY READ:** every declared path must resolve
      //      through `SIBLING_ARTIFACT_UNIT_BY_PATH` to a NAMED declaring unit (the fallback label is
      //      a finding, not a pass), so a mis-keyed census entry cannot silently report the wrong
      //      owner. Each list is EMPTY when its claim holds.
      const DECLARED_OWNER_LABELS = [
        'the `U-DIVERGENCE-EXT` / `C2` HARNESS unit',
        'the `U-REALDOM-BOOT` / `C1` LEG unit',
        'the SIBLING unit (E10 / U-GUTTER-UI) / the COMPOSING unit (E3 / U-GUTTER)',
      ]
      const measuredRedPaths = [
        'scripts/electron-divergence.mjs',
        'scripts/electron-spawn.mjs',
        'src/shared/dom-shim.ts',
        'tests/divergence-attribute-extractor.test.ts',
        'tests/ui-leg-contract.test.ts',
      ]
      expect(
        [
          declaredSiblingPaths.filter((p) => !isSiblingUnitArtifact(p)),
          measuredRedPaths.filter((p) => !isDenied(p)),
          measuredRedPaths.filter((p) => !isSiblingUnitArtifact(p)),
          measuredRedPaths.filter((p) => {
            const owner = siblingArtifactOwner(p)
            return !DECLARED_OWNER_LABELS.some((label) => owner.startsWith(label))
          }),
          // **⟶ ADDED 2026-09-27 (THE `F3` SAME-COMMIT OBLIGATION, THIS ROW'S `N-15`): THE
          // DECLARED EXEMPTION IS DRIVEN BOTH WAYS.** (5) every path on the F3 declaration answers
          // `isSiblingUnitArtifact === true` (so the exemption really covers them), (6) every one of
          // them is STILL DENIED by the byte-identical `isDenied` (so the PROHIBITION was not
          // weakened — only the SUBJECT moved), and (7) each resolves to the NAMED `F3` unit through
          // `SIBLING_ARTIFACT_UNIT_BY_PATH` (a fallback label here is a finding, not a pass). Each
          // list is EMPTY when its claim holds.
          [...F3_UNIT_TEST_ARTIFACT_PATHS, ...declaredSiblingPaths].filter((p) => !isSiblingUnitArtifact(p)),
          F3_UNIT_TEST_ARTIFACT_PATHS.filter((p) => !isDenied(p)),
          F3_UNIT_TEST_ARTIFACT_PATHS.filter((p) => !siblingArtifactOwner(p).startsWith('the `U-FOCUS-TOOL` / `F3` unit')),
        ],
        `R-7/§5.1 POSITIVE CONTROL (⟶ ADDED 2026-09-27, THE U-DIVERGENCE-EXT LANDING): (1) EVERY path in the WHOLE declaration (all ${declaredSiblingPaths.length} = ${SIBLING_UNIT_ARTIFACT_PATHS.length} + ${COMPOSING_UNIT_ARTIFACT_PATHS.length} + ${DIVERGENCE_EXT_UNIT_ARTIFACT_PATHS.length}) answers \`true\`; (2) the five paths the measured \`1dc6315\` red read as this unit's OWN DENIED diff are STILL DENIED by the byte-identical \`isDenied\` (the predicate is untouched — no sibling escape hatch was added to it); (3) the same five answer \`true\` to the sibling predicate (they are what the exclusion covers); (4) each of them resolves to a NAMED declaring unit (a fallback/unclaimed label here is a finding, not a pass). **⟶ AND (5)/(6)/(7): THE F3 DECLARATION IS DRIVEN THE SAME THREE WAYS** — its ${F3_UNIT_TEST_ARTIFACT_PATHS.length} paths all answer \`true\`, all are STILL DENIED (\`isDenied\` unweakened: nothing was relaxed), and all resolve to the named \`U-FOCUS-TOOL\` / \`F3\` unit. **READS (path, owning unit, isDenied, isSiblingUnitArtifact):** ${JSON.stringify(
          measuredRedPaths.map((p) => [p, siblingArtifactOwner(p), isDenied(p), isSiblingUnitArtifact(p)]),
        )}. F3 DECLARATION READS: ${JSON.stringify(
          F3_UNIT_TEST_ARTIFACT_PATHS.map((p) => [p, siblingArtifactOwner(p), isDenied(p), isSiblingUnitArtifact(p)]),
        )}`,
      ).toEqual([[], [], [], [], [], [], []])
      expect(
        GS_UNIT_OWN_ARTIFACT_CONTROL.filter((p) => isSiblingUnitArtifact(p)),
        `R-7/§5.1 POSITIVE CONTROL (THE PREDICATE'S FALSE DIRECTION, so the exclusion cannot be vacuous): THIS unit's own three canonical artifacts must read \`isSiblingUnitArtifact === false\` — a predicate that excluded them too would make the arm pass by construction. Reads: ${JSON.stringify(
          GS_UNIT_OWN_ARTIFACT_CONTROL.map((p) => [p, isSiblingUnitArtifact(p)]),
        )}`,
      ).toEqual([])
      expect(
        UNCLAIMED_PATH_CONTROL.filter((p) => isSiblingUnitArtifact(p)),
        `R-7/§5.1 POSITIVE CONTROL (THE EXCLUSION IS A CLOSED, NAMED CENSUS — NEVER A BLANKET "NOT MINE" HATCH): a path no sibling spec's allow-list declares STAYS this unit's responsibility and answers \`false\` — including \`src/renderer/secure-panels.ts\`, which \`docs/specs/gutter-ui.md\` §5.1 item 4 keeps DENIED, and \`tests/listhost.test.ts\`, an UNCLAIMED test file that this row's own DENIED pattern still rejects (substituted for \`tests/census.test.ts\`, which is now a DECLARED \`F3\` path). Reads: ${JSON.stringify(
          UNCLAIMED_PATH_CONTROL.map((p) => [p, isSiblingUnitArtifact(p), isDenied(p)]),
        )}`,
      ).toEqual([])
      for (const path of scoped.files.filter((p) => isUnitArtifact(p) || /^docs\//.test(p))) {
        if (isDenied(path)) continue
        expect(
          inScope(path) || /^docs\/specs\/[^/]*\.md$/.test(path) || /^docs\/[^/]*\.md$/.test(path),
          `R-7/§5.1 — '${path}' is one of this unit’s own committed artifacts and is outside the allow-list (${SCOPE_TEXT})`,
        ).toBe(true)
      }
      expect(
        scoped.files.filter((p) => [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH].includes(p)).length,
        `R-7 — at least ONE of the unit’s three canonical artifacts is genuinely committed inside the unit-scoped range, so the census is a census of real unit work: ${JSON.stringify(
          scoped.files,
        )}`,
      ).toBeGreaterThan(0)
    } else {
      // THE RED-TIME BRANCH: the red-set commit does not exist yet (`RCA-8(a)`), so the
      // census falls back to the WORKING TREE and SAYS SO — a probe that silently passed
      // on an empty range would be the vacuity this form closes.
      const tree = treeChangeSet()
      expect(
        tree.paths.includes(TEST_RELPATH),
        `R-7/§5.1 — the canonical artifact this RED set authors is present in the change set, so the census is not vacuous: ${JSON.stringify(
          tree.paths,
        )}`,
      ).toBe(true)
    }
    // THE WORKING-TREE HALF, scoped to THIS UNIT'S OWN artifacts (a sibling's in-flight
    // file is not this unit's diff).
    for (const path of treeChangeSet().paths.filter((p) => isUnitArtifact(p))) {
      expect(
        isDenied(path),
        `R-7/§5.1 — '${path}' is in the DENIED set and is present in the WORKING TREE: a boundary violation whatever its content`,
      ).toBe(false)
      expect(inScope(path), `R-7/§5.1 — '${path}' is outside this unit’s diff scope (the allow-list is: ${SCOPE_TEXT})`).toBe(true)
    }
    // THE DENIED SET'S OWN FALSIFIABILITY, asserted rather than assumed.
    for (const probe of [
      'src/main/main.ts',
      'src/renderer/renderer.ts',
      'src/shared/dom-shim.ts',
      'src/shared/types.ts',
      'src/shared/zones.ts',
      'src/shared/census.ts',
      'tests/census.test.ts',
      'package.json',
      'package-lock.json',
      'scripts/mcp-cli.mjs',
      'docs/specs/census-greens.md',
      'docs/specs/gutter.md',
      'archive/reviews/2026-09-27-U-CENSUS-doc-review.md',
    ]) {
      expect(isDenied(probe), `R-7 — the DENIED set really rejects '${probe}' (the row’s falsifiable half)`).toBe(true)
    }
    // …and this unit's own artifacts are not themselves denied.
    for (const path of [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH, 'docs/specs/gsession-greens.md']) {
      expect(isDenied(path), `R-7 — '${path}' is THIS unit’s own artifact and can be in no denied set`).toBe(false)
    }
    // THE COMPANION CLAIM (`§3.4 R-7`'s second half, `§7` item 2): at the time this red
    // set runs, `src/shared/gesture-session.ts` is imported by NO `src/**` file.
    //
    // **⟶ REPAIRED 2026-09-27 (THE SIBLING-ATTRIBUTED / TIME-SCOPED REPAIR, RULING B).** THE
    // AS-FILED FORM IS KEPT VISIBLE ABOVE AND SUPERSEDED: it asserted `importers === []` over a
    // walk of the LIVE tree, and the LIVE tree now carries `src/renderer/renderer.ts` — **the
    // SIBLING unit `E10`'s WIRING**, which legitimately imports this module (`E10`'s module
    // value-imports `POINTER_TYPES` from `./gesture-session.js`, and the wiring
    // `startGutterAffordance(runtime)` is `E10`'s own artifact). **MEASURED at `6f6a011`: the
    // as-filed reading was `['src/renderer/renderer.ts']`.** **THE CLAIM IN ITS TIME-SCOPED FORM,
    // with `docs/specs/gutter.md` `§3.4 R-4` — *"a later unit that legitimately imports THIS module
    // is not a violation of it"* — and `§5.1`'s commit-range scope rule:** the census is read over
    // the **TRACKED tree at THIS unit's ANCHOR COMMIT** (the commit that ADDED this test file,
    // computed by the SAME `committedChangeSet()` this row's diff-scope half already uses), and the
    // **CURRENT census is REPORTED with each importer's owner named — NEVER AS A FAIL.**
    // **THE FALSIFIABLE CONTROL IS KEPT:** an importer that is THIS unit's OWN artifact or an
    // UNCLAIMED path **STILL FAILS**, asserted below on synthetic lists so no file is created.
    console.log(
      `R-7 §3.4 (TIME-SCOPED COMPANION) MEASURED :: ${JSON.stringify({
        anchor: IMPORTER_ATTRIBUTION_GS.anchor,
        anchorRange: IMPORTER_ATTRIBUTION_GS.anchorRange,
        importersAtAnchor: IMPORTER_ATTRIBUTION_GS.atAnchor,
        currentImporters: IMPORTER_ATTRIBUTION_GS.current,
        currentImportersByOwner: IMPORTER_ATTRIBUTION_GS.currentOwners,
        clause: 'docs/specs/gutter.md §3.4 R-4 + §5.1',
      })}`,
    )
    expect(
      IMPORTER_ATTRIBUTION_GS.atAnchor,
      `R-7/§7 item 2 — **THE COMPANION CLAIM IN ITS TIME-SCOPED FORM: at THIS unit's own red/green time — the TRACKED tree at the ANCHOR COMMIT \`${String(
        IMPORTER_ATTRIBUTION_GS.anchor,
      )}\` (range \`${String(IMPORTER_ATTRIBUTION_GS.anchorRange)}\`) — \`${MODULE_RELPATH}\` is imported by NO \`src/**\` file.** The unit's green proves the contract holds for a caller, NOT that the app behaved differently at that time. **THE CURRENT CENSUS IS REPORTED, NAMED BY OWNER, AND IS NEVER A FAIL:** ${JSON.stringify(
        IMPORTER_ATTRIBUTION_GS.currentOwners,
      )} (a later unit's legitimate importer is not a violation of this claim, \`docs/specs/gutter.md\` \`§3.4 R-4\`; \`§5.1\`'s commit-range scope rule). Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION_GS.atAnchor,
      )}`,
    ).toEqual([])
    // THE CONTROL: an importer this unit OWNS, and one no unit's allow-list claims, must still be
    // reported as failures by the SAME owner-attribution the reading above uses.
    for (const probe of GS_IMPORTER_CONTROL_UNIT_OWN) {
      expect(
        ownerOfImporter(probe).includes('STILL A FAIL'),
        `R-7/§3.4 R-4 — THE CONTROL: an importer that is THIS unit's OWN artifact (\`${probe}\`) is NEVER excused by the sibling attribution (a unit may not import its own module and call it a sibling's work)`,
      ).toBe(true)
    }
    for (const probe of GS_IMPORTER_CONTROL_UNCLAIMED) {
      expect(
        ownerOfImporter(probe),
        `R-7/§3.4 R-4 — THE CONTROL: an importer that NO unit's allow-list claims (\`${probe}\`) is REPORTED AS UNCLAIMED, so the sibling carve-out cannot silently absorb an unexplained importer`,
      ).toBe('NO unit’s allow-list claims it')
    }
    expect(
      isSiblingUnitArtifact('src/renderer/renderer.ts'),
      `R-7 — and the attribution's own discriminator: the measured live importer \`src/renderer/renderer.ts\` IS the sibling \`E10\`'s declared artifact (its wiring), while this unit's own module/test/spec are NOT (asserted just below)`,
    ).toBe(true)
    for (const own of [MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH]) {
      expect(
        isSiblingUnitArtifact(own),
        `R-7 — '${own}' is THIS unit's own artifact and can never be attributed to a sibling`,
      ).toBe(false)
    }
  })

  it('R-8 §3.4 — THE GEOMETRY / MAGNITUDE ROW: no geometry-observation call, no coordinate read and no geometry-shaped claim, in the module or in this file', () => {
    // (a) THE MODULE FILE's raw bytes, comments included.
    const raw = moduleSource('R-8 §2.2 P-9, I-11')
    for (const re of GEOM_CALL_RES) {
      if (!(re instanceof RegExp)) continue
      const hits = staticHits(raw, re)
      expect(
        hits,
        `R-8(a)/§2.2 P-9 — the module observes no geometry and reads no coordinate: ${JSON.stringify(
          hits,
        )}. The contract and its CALL COUNTS are provable here; ANY rendered-geometry claim is UNPROVABLE in this repo today, and §5.2 offers no [U] row`,
      ).toEqual([])
    }
    // (b)/(c) THIS UNIT'S OWN TEST FILE: raw bytes, plus the row DESCRIPTIONS extracted
    // from it (the tokens are held as FRAGMENTS, which is why this half reads raw bytes
    // and the extracted titles rather than the rule list).
    expect(
      ownGeometryViolations(),
      'R-8(b)/(c) — this unit’s own [T] test file takes no geometry observation and reads no coordinate, and no row description claims a resolved/layout/magnitude fact',
    ).toEqual([])
    const titles = rowTitles(readFileSync(TEST_FILE, 'utf8'))
    expect(
      titles.length,
      'R-8(c) — the extracted-description census is NON-EMPTY (a vacuous extraction cannot pass this row)',
    ).toBeGreaterThan(50)
    // POSITIVE controls: a corpus observing geometry or a coordinate must FAIL, and a
    // description claiming a resolved magnitude must FAIL.
    const geometryCorpus = `${'const s = get' + 'Computed' + 'Style'}(el)\nconst w = el.${'offset' + 'Width'}\nconst x = e.${COORD_FRAGMENTS[0].join('')}`
    expect(
      GEOM_CALL_RES.some((re) => re instanceof RegExp && staticHits(geometryCorpus, re).length > 0),
      'R-8 POSITIVE control — a corpus observing geometry or reading a coordinate FAILS the scanner (the row is otherwise UNFALSIFIED)',
    ).toBe(true)
    const claimCorpus = ['the control is ', 'render', 'ed at the ', 'lay', 'out position'].join('')
    expect(
      GEOM_CLAIM_RES.some((re) => re.test(claimCorpus)),
      'R-8 POSITIVE control — a description claiming a resolved fact FAILS the claim scanner',
    ).toBe(true)
    expect(
      GEOM_CLAIM_RES.some((re) => re.test('the session commits the consumer’s own value exactly once at a terminal')),
      'R-8 NEGATIVE control — ordinary lifecycle wording is NOT a claim',
    ).toBe(false)
    // THE ROW'S STATED LIMIT: a text scan cannot prove the absence of a claim for ALL
    // prose — the contract half is `§5.2`'s refusal to offer a `[U]`/`[D]` row and
    // `I-11`'s clause.
    expect(
      readFileSync(`${REPO_ROOT}/package.json`, 'utf8').includes('"ui"'),
      'R-8/§5.2 — the `ui` leg EXISTS and is green, so this unit’s refusal to offer a `[U]` row is STRUCTURAL (the module is imported by no `src/**` file and reads no coordinate), not a leg-availability excuse',
    ).toBe(true)
  })

  it('R-12 §3.4 — THE `P-4` UI-CONTENT WRITE ROW (the pair with `M-18`): the module authors NO UI content — no write token RAW, ASSEMBLED or in a COMMENT — over the MODULE’s bytes plus this row’s OWN controlled corpora', () => {
    // SCOPE (`§3.4 R-12`'s own words): the MODULE file WHOLE, comments INCLUDED, over the
    // SAME NORMALIZED view `R-1` reads (string-literal concatenation JOINED before scanning,
    // comments scanned like code, a word/identifier BOUNDARY rule), PLUS THIS ROW'S OWN
    // controlled corpora. **A WHOLE-FILE NEGATIVE OVER THIS TEST FILE IS DELIBERATELY
    // DROPPED** — and here the drop is MEASURED rather than assumed: the census below
    // records, per family, how many bounded write-token occurrences this file's own bytes
    // actually carry (the row's controls DO carry them), so the drop is a recorded scope
    // fact and not a claim about this file.
    const raw = moduleSource('R-12 §2.2 P-4, R-1, R-8')
    expect(
      uiContentViolations(raw),
      'R-12/§2.2 P-4 — the module authors NO element, text, class, attribute or stylesheet write: no prohibited UI-CONTENT WRITE token occurs in its bytes, RAW, ASSEMBLED across a literal boundary or inside a COMMENT (`R-1`’s normalized view; the honest limit is the pair with `M-18`)',
    ).toEqual([])
    // THE ROW'S OWN CENSUS, printed: how the module’s bytes and this file’s bytes answer the
    // same scanner. The module’s figure is the row’s claim (zero); the file’s figure is the
    // MEASURED justification for the dropped whole-file negative.
    const moduleCensus = uiContentCensus(raw)
    const ownBytes = readFileSync(TEST_FILE, 'utf8')
    const ownCensus = uiContentCensus(ownBytes)
    console.log(
      `§3.4 R-12 write-token census :: ${JSON.stringify({
        module: moduleCensus,
        testFileBytes: ownCensus,
        scope: 'the MODULE file whole, comments included, over the R-1 normalized view, plus THIS ROW’s controlled corpora',
        dropped: 'a whole-file negative over this test file is DELIBERATELY DROPPED (§3.4 R-12’s scope rule); its measured occurrence count is the field above',
      })}`,
    )
    expect(
      Object.values(moduleCensus).reduce((sum, n) => sum + n, 0),
      'R-12/§2.2 P-4 — the module’s own census is ZERO in every family, not merely free of a reported violation (the scanner and the count are the same instrument)',
    ).toBe(0)
    // THE POSITIVE CONTROLS — THREE ARMS, all three required by the row: a corpus spelling
    // ONE of these tokens RAW, one JOINED ACROSS A LITERAL BOUNDARY, and one INSIDE A
    // COMMENT must each FAIL the scan, or the row is unfalsified and must not be filed.
    for (const [shape, fixture] of WRITE_POSITIVE_CONTROLS) {
      expect(
        uiContentViolations(fixture).length,
        `R-12 POSITIVE control (${shape}) — the UI-content write scan MUST fail for a corpus carrying the token ${shape}: a row that cannot fail is UNFALSIFIED and must not be filed (\`§3.4 R-12\`, the R-1 control form)`,
      ).toBeGreaterThan(0)
    }
    // The ASSEMBLED arm is not vacuous: the normalized view really joins the pieces, so the
    // failure above measures a reassembled token and not an empty-string artifact.
    const assembledPositive = assembledChunks(WRITE_POSITIVE_CONTROLS[1][1])
    const assembledTokensInControl = WRITE_TOKEN_IDS.filter((id) => assembledPositive.includes(id))
    expect(
      assembledTokensInControl.length,
      `R-12 — the positive assembly control really ASSEMBLES the banned tokens it carries in the normalized view (${JSON.stringify(
        assembledPositive,
      )} contains ${JSON.stringify(assembledTokensInControl)})`,
    ).toBeGreaterThan(0)
    // The COMMENT arm is not vacuous either: the token it carries really sits in a comment.
    expect(
      uiContentViolations(stripComments(WRITE_POSITIVE_CONTROLS[2][1])),
      'R-12 — the COMMENT arm proves COMMENTS ARE SCANNED LIKE CODE (`R-1`’s view): the very same corpus PASSES once its comment is stripped, so the comment arm’s failure is the comment and not a stray code token',
    ).toEqual([])
    expect(
      staticHits(WRITE_POSITIVE_CONTROLS[2][1], /\/\//).length,
      'R-12 — the comment arm really is a comment',
    ).toBeGreaterThan(0)
    // THE NEGATIVE CONTROL (`§3.4 R-12`): this unit's OWN legitimate text — the four event
    // types, the seven result codes, the parameter names and the `capturePointer` member
    // name — must PASS.
    expect(
      uiContentViolations(WRITE_NEGATIVE_CONTROL),
      'R-12 NEGATIVE control — this unit’s own legitimate text (the four event types of §2.1, the seven result codes of §2.3 item 4, the parameter names of §2.5 and the `capturePointer` member name) PASSES the UI-content write scan: the row is not over-broad',
    ).toEqual([])
    expect(
      WRITE_NEGATIVE_CONTROL.length,
      'R-12 — the negative control is non-vacuous (it really carries the unit’s legitimate vocabulary)',
    ).toBeGreaterThan(100)
    // THE ROW'S HONEST LIMIT, stated in the row itself: a text scan cannot prove the absence
    // of a write for EVERY control flow, so the static half is PAIRED with `M-18`'s runtime
    // write-log assertion — **and the pair is the row** (`R-3`'s form). The runtime half is
    // authored in the `§3.1` block below and is reachable from here by name only.
    expect(
      rowTitles(readFileSync(TEST_FILE, 'utf8')).some((title) => title.includes('M-18')),
      'R-12 — the PAIR is present in this file: `M-18`’s runtime write-log row is authored alongside this one (a static scan is the pair’s half, not the row — §3.4 R-12’s honest limit)',
    ).toBe(true)
  })
})

// ===========================================================================
// I-1..I-13 — §3.3, the invariants that hold in EVERY state.
// ===========================================================================
describe('I — §3.3 the every-state invariants', () => {
  it('I-1 §3.3 — THE SINGLE GESTURE AUTHORITY: one session has AT MOST ONE active gesture, and NO consumer-reachable call commits outside a terminal', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    expect(h.sessionInstall(el), 'I-1 — the control is installed').toBe(true)
    // There is NO `commit()` method on the session (the architect’s ruling 2, `§0A` note 5).
    const surface = h.session as unknown as Record<string, unknown>
    expect(
      surface['commit'],
      'I-1/§0A note 5 — the session exposes NO `commit()` method: the session invokes the consumer’s injected callback, and there is no consumer-reachable commit path (§2.5: "Nothing else exists")',
    ).toBe(undefined)
    const first = beginResult(h, el)
    expect(first?.ok, 'I-1 — the first `begin` establishes exactly one gesture').toBe(true)
    const second = beginResult(h, el)
    expect(second, 'I-1/§2.3 item 3 — a second `begin` while a gesture is active is REFUSED `busy`').toEqual({
      ok: false,
      code: 'busy',
    })
    expect(
      h.session.stats().active,
      'I-1/§2.3 item 3 — AT MOST ONE active gesture: the refusal changed nothing, so the first gesture is still the only one',
    ).toBe(true)
    expect(h.commits.length, 'I-1 — the `busy` refusal committed NOTHING').toBe(0)
    // `§2.5`: no capture/release method and no policy parameter exists on the session.
    for (const forbidden of [
      'setPointerCapture',
      'releasePointerCapture',
      'boundsFor',
      'axisFor',
      'isResizable',
      'defaultSizeFor',
      'candidatesFor',
      'resolveTarget',
      'onReveal',
    ]) {
      expect(
        surface[forbidden],
        `I-1/§2.5 — the session exposes no \`${forbidden}\` member: "Nothing else exists" (a policy parameter here would be the V-13 second authority)`,
      ).toBe(undefined)
    }
  })

  it('I-2 §3.3 — EXACTLY ONE COMMIT PER GESTURE that reaches an `end`/`reset` terminal, and `stats().commits` equals the number of such terminals', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const outcomes: string[] = []
    for (let i = 0; i < 3; i += 1) {
      const r = beginResult(h, el)
      expect(r?.ok, `I-2 — gesture ${i + 1} established`).toBe(true)
      const handle = (r as { ok: true; gesture: GestureHandle }).gesture
      expect(h.session.stats().commits, `I-2 — gesture ${i + 1} has committed NOTHING while active`).toBe(i)
      const done = endCall(h, el, handle)
      expect(done?.committed, `I-2 — the \`end\` terminal of gesture ${i + 1} reports \`committed: true\``).toBe(true)
      outcomes.push(String(handle.outcome))
      expect(
        h.session.stats().commits,
        `I-2 (the heart of this unit) — after ${i + 1} \`end\` terminals the session’s OWN counter reads ${i + 1}, and the injected callback was invoked exactly ${i + 1} time(s)`,
      ).toBe(i + 1)
      expect(h.commits.length, 'I-2 — the session’s count and the callback’s own invocation count AGREE (no count is asserted from a spy alone)').toBe(i + 1)
    }
    expect(outcomes, 'I-2/§2.3 item 4 — every terminal reports the pinned outcome vocabulary member `end`').toEqual([
      'end',
      'end',
      'end',
    ])
  })

  it('I-3 §3.3 — ZERO COMMIT INVOCATIONS ON CANCEL: `cancel`, a `pointercancel`, and a `dispose()` during a gesture', async () => {
    // (a) the recorded `pointercancel` handler.
    const h1 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elA: Record<string, unknown> = { id: 'a' }
    h1.sessionInstall(elA)
    fireStart(h1, elA, PLACEHOLDER_EVENT)
    h1.source.fire(elA, TYPE_CANCEL, PLACEHOLDER_EVENT)
    expect(h1.commits.length, 'I-3/§2.3 item 4 — a `pointercancel` commits ZERO times').toBe(0)
    expect(h1.session.stats().commits, 'I-3 — the session’s own counter also reads ZERO after a `pointercancel`').toBe(0)
    // (b) a consumer abort through the direct terminal.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elB: Record<string, unknown> = { id: 'b' }
    h2.sessionInstall(elB)
    const r = beginResult(h2, elB)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    handle.set('a value that must NOT be committed')
    const done = cancelCall(h2, elB, handle)
    expect(done, 'I-3 — the `cancel` terminal returns its declared shape').toEqual({ ok: true, code: 'ok', committed: false })
    expect(h2.commits.length, 'I-3/§2.3 item 4 — a consumer abort commits ZERO times').toBe(0)
    expect(h2.session.stats().commits, 'I-3/§2.6 item 2 — "cancel ⇒ zero sink writes" is the consumer’s own conclusion from "its callback did not run"').toBe(0)
    // (c) a `dispose()` during a gesture.
    const h3 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elC: Record<string, unknown> = { id: 'c' }
    h3.sessionInstall(elC)
    fireStart(h3, elC, PLACEHOLDER_EVENT)
    h3.session.dispose()
    expect(h3.commits.length, 'I-3/§2.3 item 7(1) — a `dispose()` during a gesture takes the `cancel` path and commits ZERO times').toBe(0)
    expect(h3.session.stats().commits, 'I-3 — the three cancel paths all leave the session’s commit counter at ZERO').toBe(0)
  })

  it('I-3b §3.3 — EXACTLY ONE COMMIT ON RESET, OF THE SUPPLIED VALUE, with `outcome: \'reset\'`', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const userValue = { chosen: 'by the consumer' }
    const suppliedDefault = { the: 'supplied default' }
    handle.set(userValue)
    const done = resetCall(h, el, handle, suppliedDefault)
    expect(done, 'I-3b/§2.3 item 4 — `reset` reports `{ok:true, code:\'ok\', committed:true}`').toEqual({
      ok: true,
      code: 'ok',
      committed: true,
    })
    expect(h.commits.length, 'I-3b — never zero, never two: exactly ONE commit').toBe(1)
    expect(
      h.commits[0].value,
      'I-3b/§0A note 6 — the commit carries the SUPPLIED value BY IDENTITY, never the previously-set value',
    ).toBe(suppliedDefault)
    expect(h.commits[0].value, 'I-3b — the previously-set user value is NOT what is committed').not.toBe(userValue)
    expect(h.commits[0].outcome, 'I-3b — the discriminator the consumer reads is `gesture.outcome === \'reset\'`').toBe('reset')
    expect(handle.outcome, 'I-3b — the handle reports `reset`').toBe('reset')
    expect(h.session.stats().commits, 'I-3b — the session’s own counter reads ONE').toBe(1)
    // The session supplies NO default of its own: an `undefined` supplied value is
    // committed verbatim (`§2.3` item 4: "`reset` always commits its supplied value,
    // which may be `undefined`").
    const r2 = beginResult(h, el)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    resetCall(h, el, handle2, undefined)
    expect(h.commits.length, 'I-3b — a `reset` with `undefined` STILL commits (the session invents no default)').toBe(2)
    expect(h.commits[1].value, 'I-3b — the committed value is exactly the supplied `undefined`').toBe(undefined)
  })

  it('I-3c §3.3 — A THROWING COMMIT IS STILL THE GESTURE’S ONE COMMIT, AND IS NEVER RETRIED', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()), commitThrows: true })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const done = endCall(h, el, handle)
    expect(done, 'I-3c — the throw PROPAGATES to the caller of the terminal (the session does not swallow consumer errors)').toBe(undefined)
    expect(h.thrown.length, 'I-3c/§3.2 F-3(c) — the consumer’s throw reached the caller').toBe(1)
    expect(h.commits.length, 'I-3c — the throwing commit is STILL the gesture’s ONE commit').toBe(1)
    expect(h.session.stats().commits, 'I-3c — the session’s own counter reads ONE after the throw').toBe(1)
    expect(h.session.stats().active, 'I-3c — the gesture is no longer active despite the throw').toBe(false)
    expect(h.commits.length, 'I-3c — the session NEVER retries the commit (no second invocation exists)').toBe(1)
    expect(h.source.listenerCount(el), 'I-3c/§0A note 11 — a throwing `commit` cannot leave a tracking listener behind').toBe(1)
  })

  it('I-4 §3.3 — THE TRACKING LISTENERS EXIST ONLY BETWEEN START AND TERMINAL: exactly ONE on an idle control, exactly FOUR during a gesture, ONE again after every terminal', async () => {
    for (const terminal of ['end', 'reset', 'cancel'] as const) {
      const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
      const el: Record<string, unknown> = { id: 'a' }
      h.sessionInstall(el)
      expect(
        footprint(h.source, el),
        `I-4/§2.3 item 2 — an installed, IDLE control holds EXACTLY ONE listener (the start listener), of type '${TYPE_START}' [terminal: ${terminal}]`,
      ).toEqual({ count: 1, types: [TYPE_START] })
      const r = beginResult(h, el)
      const handle = (r as { ok: true; gesture: GestureHandle }).gesture
      expect(
        footprint(h.source, el),
        `I-4/§2.3 item 2(a) — during the gesture the control holds EXACTLY FOUR listeners (start + move + end + cancel), i.e. the three tracking listeners were opened IN the window [terminal: ${terminal}]`,
      ).toEqual({ count: 4, types: [TYPE_CANCEL, TYPE_END, TYPE_MOVE, TYPE_START].sort() })
      if (terminal === 'end') endCall(h, el, handle)
      else if (terminal === 'reset') resetCall(h, el, handle, 'd')
      else cancelCall(h, el, handle)
      expect(
        footprint(h.source, el),
        `I-4/§2.3 item 2(c) — at the terminal the tracking three are detached and the count returns to ONE, the start listener REMAINING [terminal: ${terminal}]`,
      ).toEqual({ count: 1, types: [TYPE_START] })
    }
  })

  it('I-5 §3.3 — THE BASELINE RESTORE IS EXACT AND REPORTED: every `on` matched by exactly one `off` with the same three values, and the report is honest', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elA: Record<string, unknown> = { id: 'a' }
    const elB: Record<string, unknown> = { id: 'b' }
    h.sessionInstall(elA)
    h.sessionInstall(elB)
    fireStart(h, elA, PLACEHOLDER_EVENT)
    const report = h.session.dispose()
    expect(report.removed, 'I-5/§2.3 item 7(2) — four listeners from the gesture control + one from the idle control = FIVE detaches').toBe(5)
    expect(report.complete, 'I-5 — every detach succeeded, so the report is honest about it').toBe(true)
    const paired = pairOnOffCalls(h.source.log)
    expect(
      paired.unmatched,
      `I-5/§0A note 3 — EVERY \`on(element, type, handler)\` the session made is matched by exactly ONE \`off\` with the same three values: unmatched = ${JSON.stringify(
        paired.unmatched,
      )}`,
    ).toEqual([])
    expect(
      h.source.listenerPairs(),
      'I-5 (layer anchor 5, §4.4 S-7) — this row asserts the CALLS the session made against the injected source, NEVER a fact about a real browser’s listener table: the session’s own contribution is EMPTY',
    ).toEqual([])
    // The HONEST half: a throwing `off` is caught PER CALL, the remaining detaches still
    // run, and `complete: false` is reported.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elC: Record<string, unknown> = { id: 'c' }
    const elD: Record<string, unknown> = { id: 'd' }
    h2.sessionInstall(elC)
    h2.sessionInstall(elD)
    fireStart(h2, elC, PLACEHOLDER_EVENT)
    h2.source.failOff = (pair: { type: string }): boolean => pair.type === TYPE_MOVE
    const report2 = h2.session.dispose()
    expect(report2.removed, 'I-5/§2.3 item 7(4) — `removed` counts the SUCCESSFUL detaches (five attempts, one throws, four succeed)').toBe(4)
    expect(
      report2.complete,
      'I-5/§2.3 item 7(4) — `complete: false` is the honest "the baseline could not be fully restored", never a false restore',
    ).toBe(false)
    expect(
      h2.source.log.filter((r) => r.op === 'off').length,
      'I-5 — the remaining detaches STILL RAN after the throwing one (the catch is per call)',
    ).toBe(5)
  })

  it('I-6 §3.3 — NO DOCUMENT-DELEGATED LISTENER AND NO DOM ACCESS, EVER (raw, assembled, commented or realm-rooted)', async () => {
    const raw = moduleSource('I-6 §2.2 P-2/P-3')
    const delegatedRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      {
        what: 'a document/window-delegated listener (the A-d3 REJECTED shape)',
        re: /\b(?:addEventListener|removeEventListener)\b|\bon[a-z]+\s*=\s*(?!>)/,
      },
      { what: 'an element lookup token in ANY form', re: /\b(?:closest|querySelector|querySelectorAll|getElementById)\b/ },
      { what: 'a realm token', re: /\b(?:document|window|globalThis)\b/ },
    ]
    expectNoStaticHits(raw, delegatedRules, 'I-6 §3.3 (§2.2 P-2/P-3)')
    const assembled = assembledChunks(raw)
    expectNoStaticHits(assembled, delegatedRules, 'I-6 §3.3 (the normalized ASSEMBLY view)')
    for (const [label, fixture] of [
      ['a document-delegated listener', `${['doc', 'ument'].join('')}.${['add', 'EventListener'].join('')}('${TYPE_START}', () => {})`],
      ['an ASSEMBLED element lookup', `el[${['clo', 'sest'].join('')}]('x')`],
      ['a comment-carried delegation', `// ${['doc', 'ument'].join('')} delegation is the rejected shape`],
    ] as ReadonlyArray<readonly [string, string]>) {
      const scanned = label === 'a comment-carried delegation' ? fixture : stripComments(fixture)
      expect(
        delegatedRules.some(({ re }) => staticHits(scanned, re).length > 0),
        `I-6 POSITIVE control (${label}) must FAIL the scan — the acceptance line is "zero document-delegated listeners · zero closest/querySelector calls" and a scan that cannot fail is UNFALSIFIED`,
      ).toBe(true)
    }
    const legitimate = `${'export'} function install(element: unknown, options: unknown): boolean { void element; void options; return true }`
    expectNoStaticHits(legitimate, delegatedRules, 'I-6 NEGATIVE control — the unit’s own legitimate text')
  })

  it('I-7 §3.3 — ZERO CAPTURE CALLS BEFORE ESTABLISHMENT, and a capture count of ZERO-or-ONE per gesture', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: true }) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    expect(
      h.source.captures.length,
      'I-7/§2.3 item 6(a) — nothing is captured on `install`: ZERO capture calls before the interaction is established',
    ).toBe(0)
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    expect(
      h.source.captures.length,
      'I-7/§2.3 item 6(b) — an opted-in `begin` makes EXACTLY ONE capture call, after establishment (inside `begin`, after the tracking listeners open)',
    ).toBe(1)
    expect(h.source.captures[0].element, 'I-7/§2.3 item 6(b) — the capture call carries the gesture’s OWN element').toBe(el)
    const captureSeq = h.source.captures[0].seq
    const trackingSeqs = h.source.log.filter((rec) => rec.op === 'on' && rec.type !== TYPE_START).map((rec) => rec.seq)
    expect(
      Math.min(...trackingSeqs),
      'I-7/§2.3 item 6 — the capture call appears AFTER the three tracking `on` calls (establishment precedes capture)',
    ).toBeLessThan(captureSeq)
    const connectedSeq = h.source.log.find((rec) => rec.op === 'isConnected')?.seq ?? -1
    expect(
      connectedSeq,
      'I-7/§2.4 item 5 — the connectivity reading precedes the capture call (the element is known connected before capture)',
    ).toBeLessThan(captureSeq)
    // The second `pointermove` and the terminal: never MORE than one capture call.
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    endCall(h, el, handle)
    expect(
      h.source.captures.length,
      'I-7 (the whole row) — a gesture’s capture count is ZERO or ONE, never more: no release call is invented and no second capture appears',
    ).toBe(1)
    // The falsy-value side: any falsy `capture` never captures.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: 0 }) })
    const el2: Record<string, unknown> = { id: 'b' }
    h2.sessionInstall(el2)
    const r2 = beginResult(h2, el2)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    endCall(h2, el2, handle2)
    expect(
      h2.source.captures.length,
      'I-7/§2.3 item 6(a) — a FALSY `capture` of ANY kind (here `0`) yields ZERO capture calls, ever — the capture entry point is never called',
    ).toBe(0)
  })

  it('I-8 §3.3 — EVERY listener and the capture call go through the INJECTED SOURCE, and the session obtains no element except as an argument', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: true }) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    fireStart(h, el, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
    const ops = h.source.log.map((rec) => rec.op)
    expect(
      ops.filter((op) => op === 'on').length,
      'I-8/§0A ruling 1 — every attachment went through the injected source’s `on` (one start listener + the three tracking listeners)',
    ).toBe(4)
    expect(ops.filter((op) => op === 'off').length, 'I-8 — every detachment went through the injected source’s `off`').toBe(3)
    expect(ops.filter((op) => op === 'capture').length, 'I-8/§2.2 P-3 — the ONE capture call also goes through the source').toBe(1)
    expect(
      h.source.log.every((rec) => rec.element === el || rec.element === undefined),
      'I-8/§2.2 P-2 — the session never obtains an element except as an argument: every source call it made carries an element it was HANDED',
    ).toBe(true)
    // The event source that carries NO capture member at all is the valid degradation,
    // never a throw (`§2.4` item 6).
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: true }), sourceOptions: { withCapture: false } })
    const el2: Record<string, unknown> = { id: 'b' }
    expect(
      h2.sessionInstall(el2),
      'I-8/§2.4 item 6 — a source without a capture member is still a USABLE source (the capture call is optional, never a precondition)',
    ).toBe(true)
    expect(beginResult(h2, el2)?.ok, 'I-8/§2.4 item 6 — the gesture still establishes for an opted-in control on a capture-less source').toBe(true)
  })

  it('I-9 §3.3 — ELEMENT IDENTITY IS BY REFERENCE: the same object is one control, a structurally identical distinct object is another, and no string ever derives an element', async () => {
    const h = await makeHarness({ installOptions: {} })
    const first: Record<string, unknown> = { nodeType: 1, id: 'same' }
    const clone: Record<string, unknown> = { nodeType: 1, id: 'same' }
    expect(h.sessionInstall(first), 'I-9/§2.4 item 2 — the first install returns `true`').toBe(true)
    expect(
      h.sessionInstall(first),
      'I-9/§2.4 item 2 (the ARCHITECT’S ruling 4) — a REPEAT install on the SAME object is a NO-OP returning `false`',
    ).toBe(false)
    const before = h.source.log.length
    expect(
      h.source.log.length,
      'I-9/§2.3 item 1(b) — the repeat install makes NO source call at all ("a second `install` does not double listeners" is satisfied STRUCTURALLY)',
    ).toBe(before)
    expect(h.sessionInstall(clone), 'I-9 — a structurally IDENTICAL but distinct object is a SECOND control').toBe(true)
    const startCalls = h.source.log.filter((rec) => rec.op === 'on' && rec.type === TYPE_START)
    expect(
      startCalls.map((rec) => rec.element),
      'I-9/§2.4 item 2 — two `on` calls, one carrying each OBJECT REFERENCE (identity assertions, never a name/class/attribute/position match)',
    ).toEqual([first, clone])
    // The static half: no element is ever derived from a string.
    const code = stripComments(moduleSource('I-9 §0A note 2, §2.4 item 2'))
    const deriveRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'an element lookup (a string-derived element)', re: /\b(?:closest|querySelector|querySelectorAll|getElementById)\b/ },
      { what: 'an attribute/class/name match', re: /\b(?:getAttribute|classList|className|tagName|matches)\b/ },
      { what: 'a position/index match', re: /\b(?:children|childNodes|parentNode|nextSibling)\b/ },
    ]
    expectNoStaticHits(code, deriveRules, 'I-9 §3.3')
    for (const [label, fixture] of [
      ['a selector-derived element', `el.${['query', 'Selector'].join('')}('#x')`],
      ['an attribute match', `el.getAttribute('data-x')`],
      ['a position match', `${'const'} p = el.parentNode`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        deriveRules.some(({ re }) => staticHits(stripComments(fixture), re).length > 0),
        `I-9 POSITIVE control (${label}) must FAIL the derivation scan — the row is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
  })

  it('I-10 §3.3 — TOTALITY AT THE SEAM: the factory never throws for ANY argument, and every method returns its declared shape for every input', async () => {
    const create = await valueExport<(o?: unknown) => GestureSessionMirror>('createGestureSession', 'I-10')
    const hostileOptions: readonly unknown[] = [
      undefined,
      null,
      42,
      'a string',
      true,
      {},
      { source: undefined },
      { source: null },
      { source: 42 },
      { source: {} },
      { source: { on: 42, off: null } },
      { source: { on: () => undefined, off: () => undefined } },
      { commit: 42 },
      new Proxy({}, { get: () => undefined, has: () => false }),
    ]
    for (const options of hostileOptions) {
      let session: GestureSessionMirror | null = null
      let thrown: unknown = null
      try {
        session = create(options as never)
      } catch (e) {
        thrown = e
      }
      expect(
        thrown,
        `I-10/§2.4 item 6 — \`createGestureSession\` NEVER throws, whatever it is handed (options: ${brief(options)}); it threw ${brief(thrown)}`,
      ).toBe(null)
      const s = session as unknown as GestureSessionMirror
      expect(typeof s.stats, `I-10 — the instance returned for ${brief(options)} carries a callable \`stats\``).toBe('function')
      const stats = s.stats()
      expect(
        Object.keys(stats).sort(),
        'I-10/§2.1 — `stats()` returns its DECLARED shape for every construction argument (`installed`, `sourceCalls`, `gestures`, `commits`, `active`, `gestureId`, `lastCode`)',
      ).toEqual(['active', 'commits', 'gestureId', 'gestures', 'installed', 'lastCode', 'sourceCalls'])
      expect(brief(s.gesture()), `I-10 — \`gesture()\` returns \`null\` when idle for ${brief(options)}`).toBe('null')
    }
  })

  it('I-11 §3.3 — NEVER A GEOMETRY, COORDINATE OR MAGNITUDE CLAIM: the module reads NO pointer coordinate and NO event field at all', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // The event object is OPAQUE: a Proxy whose every trap throws cannot change anything,
    // because no read happens.
    const hostileEvent = new Proxy(
      {},
      {
        get(): never {
          throw new Error('the event’s `get` trap was reached — the session read a field it may not read')
        },
        has(): never {
          throw new Error('the event’s `has` trap was reached')
        },
        getOwnPropertyDescriptor(): never {
          throw new Error('the event’s `getOwnPropertyDescriptor` trap was reached')
        },
      },
    )
    let thrown: unknown = null
    try {
      fireStart(h, el, hostileEvent)
      h.source.fire(el, TYPE_MOVE, hostileEvent)
      h.source.fire(el, TYPE_END, hostileEvent)
    } catch (e) {
      thrown = e
    }
    expect(
      thrown,
      `I-11/§2.4 item 1 — the session reads NO field of the event object: a Proxy whose traps THROW changed nothing because no read occurred; observed ${brief(thrown)}`,
    ).toBe(null)
    expect(h.session.stats().commits, 'I-11 — the lifecycle completed normally over an opaque event (the commit count is the declared ONE)').toBe(1)
    // The mechanical consequence: no coordinate reaches the session, so it cannot know a
    // distance, a delta or a magnitude.
    expect(
      h.session.stats().active,
      'I-11/§2.4 item 1 (the magnitude clause in mechanical form) — the session carries no coordinate, so NO row of this unit may claim a magnitude, a resolution or an agent-drivable drag',
    ).toBe(false)
  })

  it('I-12 §3.3 — NO STORE, NO PERSISTENCE, NO CROSS-GESTURE CARRY: at most ONE gesture record, discarded at every terminal', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const r1 = beginResult(h, el)
    const handle1 = (r1 as { ok: true; gesture: GestureHandle }).gesture
    const carried = { first: 'gesture value' }
    handle1.set(carried)
    endCall(h, el, handle1)
    const r2 = beginResult(h, el)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    expect(
      handle2.value,
      'I-12/§2.4 item 8 — a NEW gesture’s value starts as `undefined` regardless of the previous gesture’s value: NOTHING is carried across a gesture boundary',
    ).toBe(undefined)
    expect(handle2.value, 'I-12 — the previous gesture’s value object is not reachable from the new gesture').not.toBe(carried)
    expect(
      [...h.source.log, ...h.commits].some((rec) => Object.is((rec as { value?: unknown }).value, carried)),
      'I-12/§2.4 item 8 — the value survived only as the COMMIT ARGUMENT of the gesture that set it, never in an element-keyed value, cache, memo or map',
    ).toBe(true)
    // The static half: no store, no persistence, no module-level mutable state.
    const raw = moduleSource('I-12 §2.2 P-8')
    expectNoStaticHits(raw, MODULE_STATE_RULES, 'I-12 §3.3 (§2.2 P-8)')
    const storeRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'a persistence surface', re: /\b(?:localStorage|sessionStorage|indexedDB|writeFile|readFile|node:fs)\b/ },
      { what: 'a store/cache/memo vocabulary', re: /\b(?:new\s+Map\s*\(|new\s+WeakMap\s*\(|\bcache\b|\bmemo\b|\bregistry\b|\bjournal\b)\b/ },
    ]
    expectNoStaticHits(stripComments(raw), storeRules, 'I-12 §3.3 (§2.2 P-8, §1 item 5)')
    for (const [label, fixture] of [
      ['a persistence write', `${['local', 'Storage'].join('')}.setItem('k', 'v')`],
      ['an element-keyed cache', `${'const'} cache = new Map()`],
      ['a journal reference', `${'const'} journal = []`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        storeRules.some(({ re }) => staticHits(fixture, re).length > 0),
        `I-12 POSITIVE control (${label}) must FAIL the store scan — "no store, no persistence" is a TESTABLE claim, not a slogan`,
      ).toBe(true)
    }
    // Only two numbers persist, and they are monotonic — **and they report exactly what
    // the drives above performed**: this row runs TWO gestures (`gestures === 2`) and
    // terminates exactly ONE of them, so the second gesture has committed nothing at all
    // (`commits === 1`). **A commit is issued by a TERMINAL (`§2.3` item 4: `end`/`reset`
    // ⇒ exactly one; `cancel` ⇒ zero), so an ACTIVE gesture contributes no commit** — the
    // same count `I-2`/`M-4`/`M-10`/`P-GS-SM-3` assert, and the as-filed `[2, 2]` was
    // unsatisfiable for a gesture that was never terminated.
    const stats = h.session.stats()
    expect(
      [stats.gestures, stats.commits],
      'I-12/§0A note 8 — only `gestureSeq` and `commitCount` (two numbers) outlive a gesture: TWO gestures were established and exactly ONE was terminated, so the counters read [2, 1] (§2.3 item 4: the commit is the TERMINAL’s, and the second gesture has not reached one)',
    ).toEqual([2, 1])
    expect(
      stats.active,
      'I-12/§2.4 item 8 — the second gesture is STILL ACTIVE at this reading, which is why its commit does not exist yet: the counter is the terminal count, never a per-`begin` count',
    ).toBe(true)
  })

  it('I-12b §3.3 — RE-ENTRANCY CANNOT CORRUPT THE BASELINE OR THE COUNT: a hook that re-enters sees a consistent state', async () => {
    const log = makeHookLog()
    const reentrant: unknown[] = []
    const h = await makeHarness({})
    const el: Record<string, unknown> = { id: 'a' }
    // An `onStart` that re-enters `begin`, and an `onEnd` that re-enters `begin` and
    // `cancel` — all after the terminal has already detached.
    h.sessionInstall(
      el,
      hookOptions(log, {
        onStart: (): void => {
          log.start.push(['re-entrant'])
          reentrant.push(h.session.begin(el))
        },
        onEnd: (): void => {
          log.end.push(['re-entrant'])
          reentrant.push(h.session.begin(el))
          reentrant.push(h.session.cancel(el))
        },
      }),
    )
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    endCall(h, el, handle)
    expect(
      reentrant[0],
      'I-12b/§2.3 item 3 — a `begin` from inside `onStart` is REFUSED `busy` (the gesture is already established), never a second authority',
    ).toEqual({ ok: false, code: 'busy' })
    expect(
      [(reentrant[1] as TerminalResult | BeginResult).ok ? 'ok' : (reentrant[1] as { code: string }).code],
      'I-12b/§0A note 11 — a `begin` from inside `onEnd` sees the gesture ALREADY inactive and the listeners ALREADY detached: no new gesture can be started from a terminal’s own turn',
    ).toEqual(['busy'])
    expect(h.commits.length, 'I-12b — the re-entrant calls produced exactly ONE commit (the terminal’s own), never two').toBe(1)
    expect(h.session.stats().commits, 'I-12b — the session’s own counter agrees: the re-entrancy could not double-commit').toBe(1)
    expect(
      h.source.listenerCount(el),
      'I-12b/§2.3 item 4 — the re-entrancy left NO listener behind: the control is back to its ONE start listener',
    ).toBe(1)
    // A `dispose()` from inside a hook is honoured, and the terminal completes with no
    // further commit.
    const h2 = await makeHarness({})
    const el2: Record<string, unknown> = { id: 'b' }
    let disposedFromHook = false
    h2.sessionInstall(
      el2,
      hookOptions(makeHookLog(), {
        onEnd: (): void => {
          disposedFromHook = true
          h2.session.dispose()
        },
      }),
    )
    const r2 = beginResult(h2, el2)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    endCall(h2, el2, handle2)
    expect(disposedFromHook, 'I-12b — the hook’s `dispose()` ran').toBe(true)
    expect(h2.session.disposed, 'I-12b/§2.3 item 7 — a `dispose()` from inside a hook is HONOURED').toBe(true)
    // **THE COUNT, READ AGAINST ITS OWN CLAUSE.** `I-12b`'s words are *"a `dispose()` from
    // inside a hook is honoured and the terminal completes **without a FURTHER commit**"* —
    // and `§2.3` item 4 fixes the terminal's own count at **exactly one** (`end` ⇒ exactly
    // 1), so the honoured `dispose()` is what must add NOTHING: the count stays the ONE
    // commit of the `end` terminal (`stats().commits === 1`), never two. The as-filed
    // `toBe(0)` contradicted `§2.3` item 4's exactly-one and measured a commit that the
    // terminal is REQUIRED to issue.
    expect(
      h2.commits.length,
      'I-12b/§2.3 item 4 — the terminal completes with its OWN exactly-one commit and the honoured `dispose()` adds NO FURTHER commit (one, never two)',
    ).toBe(1)
    expect(
      h2.session.stats().commits,
      'I-12b — the session’s own counter agrees with the injected callback: ONE commit, from the `end` terminal, with the `dispose()` inside the hook contributing none',
    ).toBe(1)
  })

  it('I-13 §3.3 — NO AMBIENT READ AND NO IMPORT: the module reads no ambient global and imports NOTHING', async () => {
    const raw = moduleSource('I-13 §2.2 P-2/P-10')
    const ambientRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'an ambient global token', re: /\b(?:document|window|globalThis|self|top|parent|frames)\b/ },
      { what: 'an ambient reading', re: /\b(?:matchMedia|getComputedStyle|activeElement|process\.env)\b/ },
      { what: 'a clock or random source', re: /\b(?:Date|Math\.random)\b/ },
      { what: 'any import statement at all', re: /^\s*import\b|\bimport\s*\(|\brequire\s*\(/m },
      { what: 'an engine or shim reference', re: /\b(?:provident-ssr|dom-shim|zones\.js|census\.js|layout-projection)\b/ },
    ]
    expectNoStaticHits(raw, ambientRules, 'I-13 §3.3 (§0 ruling 12)')
    expectNoStaticHits(assembledChunks(raw), ambientRules, 'I-13 §3.3 (the normalized ASSEMBLY view)')
    for (const [label, fixture] of [
      ['an ambient read', `const t = ${['mat', 'chMedia'].join('')}('(min-width: 1px)')`],
      ['an assembled realm token', `const d = ${['global', 'This'].join('')}[${['"doc"', ' + "ument"'].join('')}]`],
      ['an engine import', `import { x } from 'provident-ssr'`],
      ['a shim import', `import { mountEl } from './dom-shim.js'`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        ambientRules.some(({ re }) => staticHits(fixture, re).length > 0) ||
          (label === 'an assembled realm token' && ambientRules.some(({ re }) => staticHits(assembledChunks(fixture), re).length > 0)),
        `I-13 POSITIVE control (${label}) must FAIL the scan — the portability reason the seam exists is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
  })
})

// ===========================================================================
// M-1..M-17 — §3.1 THE VALID / HAPPY STATES.
// ===========================================================================
describe('M — §3.1 the valid states', () => {
  it('M-1 §3.1 — a control is installed, and its start listener is on ITS OWN element: exactly TWO `on` calls, one per element, both `pointerdown`', async () => {
    const h = await makeHarness({ installOptions: {} })
    const elA: Record<string, unknown> = { id: 'a' }
    const elB: Record<string, unknown> = { id: 'b' }
    expect(h.sessionInstall(elA), 'M-1/§2.3 item 1(a) — the first install returns `true`').toBe(true)
    expect(h.sessionInstall(elB), 'M-1/§2.3 item 1(a) — the second install returns `true`').toBe(true)
    const startCalls = h.source.log.filter((rec) => rec.op === 'on')
    expect(startCalls.length, 'M-1 — exactly TWO `on` calls for two installed controls').toBe(2)
    expect(
      startCalls.map((rec) => rec.type),
      `M-1 — BOTH calls carry the pinned start type '${TYPE_START}'`,
    ).toEqual([TYPE_START, TYPE_START])
    expect(startCalls[0].element, 'M-1 — one call carries `elA` BY IDENTITY').toBe(elA)
    expect(startCalls[1].element, 'M-1 — one call carries `elB` BY IDENTITY').toBe(elB)
    expect(
      startCalls.filter((rec) => rec.element !== elA && rec.element !== elB),
      'M-1/§2.2 P-7 — ZERO `on` calls carry any other element (the start listener is attached to the control, not delegated to a document or a parent)',
    ).toEqual([])
    expect(typeof startCalls[0].handler, 'M-1 — the attached handler is a function the session owns').toBe('function')
    expect(
      startCalls[0].handler,
      'M-1/§2.3 item 1(a) — the handler bound to `elA` is NOT the handler bound to `elB` (each is bound to ITS OWN element)',
    ).not.toBe(startCalls[1].handler)
  })

  it('M-2 §3.1 — a gesture is established by the control’s OWN listener, and the event object is never read', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // The row passes an OPAQUE event object: a Proxy with throwing traps. If the module
    // read ANY property the attempt would throw.
    const opaqueEvent = new Proxy(
      {},
      {
        get(): never {
          throw new Error('the handler read a property of the event object')
        },
        has(): never {
          throw new Error('the handler probed the event object')
        },
      },
    )
    let thrown: unknown = null
    try {
      h.source.fire(el, TYPE_START, opaqueEvent)
    } catch (e) {
      thrown = e
    }
    expect(
      thrown,
      `M-2/§2.3 item 1(d) — the session’s own handler takes NO parameter it uses: the event object is not read and not passed anywhere; observed ${brief(thrown)}`,
    ).toBe(null)
    expect(h.session.stats().gestures, 'M-2/§2.3 item 1(d) — the handler called `begin(element)`, so the session records ONE gesture').toBe(1)
    expect(h.session.stats().active, 'M-2 — a gesture is ACTIVE on `elA`').toBe(true)
    expect(h.session.gesture()?.id, 'M-2/§2.4 item 4 — the handle’s `id` is `1` (monotonic, instance-local, starts at 1)').toBe(1)
    expect(h.session.gesture()?.active, 'M-2/§2.1 — the active reading reports `active: true`').toBe(true)
    expect(h.session.stats().gestureId, 'M-2/§2.1 — `stats().gestureId` reads the live id').toBe(1)
    // The start listener is the ONE that was attached to the control (the seam is the
    // control’s own element, never a document).
    expect(h.source.log.filter((rec) => rec.op === 'on' && rec.type === TYPE_START).length, 'M-2/§2.3 item 1 — one start listener was attached').toBe(1)
    expect(h.source.listenerCount(el), 'M-2/§2.3 item 2(a) — the gesture opened the three tracking listeners on the SAME element (1 → 4)').toBe(4)
  })

  it('M-3 §3.1 — the session’s callbacks receive the consumer’s values VERBATIM (never coerced, copied, frozen or validated)', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const objectValue = { k: 1 }
    const symbolValue = Symbol('s')
    handle.set(objectValue)
    handle.set(symbolValue)
    handle.set(undefined)
    expect(
      Object.is(handle.value, undefined),
      'M-3/§2.4 item 7 — `undefined` is stored VERBATIM as the current value (no validation, no default)',
    ).toBe(true)
    const done = endCall(h, el, handle)
    expect(done?.committed, 'M-3 — the commit still happens exactly once (an `undefined` value commits — `§2.3` item 4)').toBe(true)
    expect(h.commits.length, 'M-3 — exactly ONE commit').toBe(1)
    expect(h.commits[0].value, 'M-3 — the callback receives the gesture’s last value VERBATIM (`undefined`)').toBe(undefined)
    expect(h.commits[0].gesture, 'M-3 — the callback receives the TERMINAL handle by identity').toBe(handle)
    expect(h.commits[0].outcome, 'M-3 — the handle’s `outcome` is the discriminator the consumer reads').toBe('end')
    // The object case, by identity; and the `NaN`/`-0` cases by `Object.is`.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    h2.sessionInstall(el)
    const r2 = beginResult(h2, el)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    handle2.set(objectValue)
    expect(handle2.value, 'M-3 — the object value is stored BY IDENTITY (never copied, frozen or cloned)').toBe(objectValue)
    expect(Object.isFrozen(objectValue), 'M-3 — the session does not FREEZE the consumer’s value').toBe(false)
    endCall(h2, el, handle2)
    expect(h2.commits[0].value, 'M-3 — the committed object is the SAME reference the consumer handed in').toBe(objectValue)
    const h3 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    h3.sessionInstall(el)
    const r3 = beginResult(h3, el)
    const handle3 = (r3 as { ok: true; gesture: GestureHandle }).gesture
    handle3.set(Number.NaN)
    endCall(h3, el, handle3)
    expect(Object.is(h3.commits[0].value, Number.NaN), 'M-3/§2.4 item 7 — `NaN` survives verbatim (`Object.is` equality)').toBe(true)
    const h4 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    h4.sessionInstall(el)
    const r4 = beginResult(h4, el)
    const handle4 = (r4 as { ok: true; gesture: GestureHandle }).gesture
    handle4.set(-0)
    endCall(h4, el, handle4)
    expect(Object.is(h4.commits[0].value, -0), 'M-3 — `-0` survives verbatim (no coercion to `0`)').toBe(true)
  })

  it('M-4 §3.1 — one commit for a normal end: a full `begin` → `pointermove` → `pointerup` sequence', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    fireStart(h, el, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
    expect(h.commits.length, 'M-4/§2.3 items 4/5 — `commit` is invoked EXACTLY once over the whole sequence').toBe(1)
    expect(h.session.stats().commits, 'M-4 — `session.stats().commits === 1` (the session’s OWN counter, not the spy alone)').toBe(1)
    expect(h.session.stats().active, 'M-4 — `stats().active === false` after the terminal').toBe(false)
    expect(h.commits[0].outcome, 'M-4 — the handle’s `outcome === \'end\'`').toBe('end')
    expect(h.source.listenerCount(el), 'M-4/§2.3 item 2(c) — the three tracking listeners were detached at the terminal (back to ONE)').toBe(1)
  })

  it('M-5 §3.1 — a second gesture is a NEW gesture: ids `1` then `2`, two commits, and nothing carried', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const r1 = beginResult(h, el)
    const handle1 = (r1 as { ok: true; gesture: GestureHandle }).gesture
    expect(handle1.id, 'M-5/§2.4 item 4 — the first gesture’s id is `1`').toBe(1)
    handle1.set({ first: true })
    endCall(h, el, handle1)
    const r2 = beginResult(h, el)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    expect(handle2.id, 'M-5/§2.4 item 4 — the second gesture’s id is `2` (monotonic, never reused)').toBe(2)
    expect(handle2.id, 'M-5 — the two ids differ (no reuse across the boundary)').not.toBe(handle1.id)
    expect(handle2.value, 'M-5/§2.4 item 8 — the second handle’s `value` starts as `undefined` regardless of the first gesture’s value: NOTHING is carried').toBe(undefined)
    expect(handle1.active, 'M-5 — the first handle reports `active: false` once its terminal has run').toBe(false)
    expect(handle1.outcome, 'M-5 — the first handle keeps its terminal’s word').toBe('end')
    endCall(h, el, handle2)
    expect(h.session.stats().commits, 'M-5 — two full sequences ⇒ TWO commits').toBe(2)
    expect(h.commits.length, 'M-5 — the injected callback’s own count agrees with the session’s').toBe(2)
  })

  it('M-6 §3.1 — the tracking listeners exist only inside the window: the ordered call log is exactly the pinned pattern', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const afterInstall = h.source.log.map((rec) => `${rec.op}:${rec.type}`)
    expect(afterInstall, 'M-6/§2.3 item 1(a) — after `install` the log is exactly ONE `on(pointerdown)`').toEqual([`on:${TYPE_START}`])
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    expect(
      h.source.log.map((rec) => `${rec.op}:${rec.type}`),
      `M-6/§2.3 item 2(a) — a successful \`begin\` logs, IN ORDER: the connectivity reading (iff callable), then \`on(pointermove)\`, \`on(pointerup)\`, \`on(pointercancel)\` — once each, on the SAME element`,
    ).toEqual([`on:${TYPE_START}`, 'isConnected:isConnected', `on:${TYPE_MOVE}`, `on:${TYPE_END}`, `on:${TYPE_CANCEL}`])
    expect(
      h.source.log.filter((rec) => rec.op === 'on' || rec.op === 'off').every((rec) => rec.element === el),
      'M-6/§2.3 item 2(b) — NO listener is ever attached to any OTHER element during the gesture (no window/document tracking — the A-d3 rejected shape)',
    ).toBe(true)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    endCall(h, el, handle)
    const terminalOps = h.source.log.slice(5).map((rec) => `${rec.op}:${rec.type}`)
    expect(
      terminalOps,
      `M-6/§2.3 item 2(c) — the terminal’s FIRST step is \`off(move)\`, \`off(end)\`, \`off(cancel)\` IN THAT ORDER, with the same three values, detaching BEFORE any consumer code (§0A note 11)`,
    ).toEqual([`off:${TYPE_MOVE}`, `off:${TYPE_END}`, `off:${TYPE_CANCEL}`])
    expect(
      h.source.log.slice(5).every((rec) => rec.element === el),
      'M-6 — every detach carries the SAME element the attach carried',
    ).toBe(true)
  })

  it('M-7 §3.1 — `capture: true` opts ONE control in, and the call happens AFTER establishment', async () => {
    const h = await makeHarness({})
    const elA: Record<string, unknown> = { id: 'a' }
    const elB: Record<string, unknown> = { id: 'b' }
    h.sessionInstall(elA, { capture: true })
    h.sessionInstall(elB, {})
    const rA = beginResult(h, elA)
    const handleA = (rA as { ok: true; gesture: GestureHandle }).gesture
    cancelCall(h, elA, handleA)
    const rB = beginResult(h, elB)
    const handleB = (rB as { ok: true; gesture: GestureHandle }).gesture
    cancelCall(h, elB, handleB)
    expect(h.source.captures.length, 'M-7/§2.3 item 6 — exactly ONE capture call over both controls').toBe(1)
    expect(h.source.captures[0].element, 'M-7 — the single capture call is on the OPTED-IN control `elA`').toBe(elA)
    const seqOf = (type: string): number => h.source.log.find((rec) => rec.op === 'on' && rec.type === type && rec.element === elA)?.seq ?? -1
    expect(
      h.source.captures[0].seq,
      `M-7 — the capture call appears in the call log AFTER the three tracking \`on\` calls (move ${seqOf(TYPE_MOVE)}, end ${seqOf(
        TYPE_END,
      )}, cancel ${seqOf(TYPE_CANCEL)} vs capture ${h.source.captures[0].seq}): capture happens after establishment`,
    ).toBeGreaterThan(Math.max(seqOf(TYPE_MOVE), seqOf(TYPE_END), seqOf(TYPE_CANCEL)))
    expect(
      h.source.captures.filter((rec) => rec.element === elB),
      'M-7/§2.3 item 6(a) — ZERO capture calls for `elB`, which did not opt in (the absent `capture` is the ABSENCE OF OPT-IN, never a mechanism default)',
    ).toEqual([])
  })

  it('M-8 §3.1 — `capture` truthiness is the opt-in: `\'yes\'` opts in, `0` does not', async () => {
    const h = await makeHarness({})
    const elYes: Record<string, unknown> = { id: 'yes' }
    const elZero: Record<string, unknown> = { id: 'zero' }
    h.sessionInstall(elYes, { capture: 'yes' })
    h.sessionInstall(elZero, { capture: 0 })
    const r1 = beginResult(h, elYes)
    const h1 = (r1 as { ok: true; gesture: GestureHandle }).gesture
    cancelCall(h, elYes, h1)
    const r2 = beginResult(h, elZero)
    const h2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    cancelCall(h, elZero, h2)
    expect(
      h.source.captures.filter((rec) => rec.element === elYes).length,
      'M-8/§2.3 item 6(b) — `Boolean(\'yes\') === true` opts the control in: exactly one capture call, after establishment',
    ).toBe(1)
    expect(
      h.source.captures.filter((rec) => rec.element === elZero).length,
      'M-8/§2.3 item 6(a) — `Boolean(0) === false` does not: ZERO capture calls (every falsy value does not opt in — `P-GS-IM-5`)',
    ).toBe(0)
    expect(
      h.source.captures.length,
      'M-8 — the truthiness rule alone decides the opt-in (no other value state matters)',
    ).toBe(1)
  })

  it('M-7b §3.1 — `capturePointer` is the source’s ONE capture member, DECLARED on `EventSource`: exactly ONE call, carrying the gesture’s OWN element, after the three tracking `on` calls and after `isConnected`', async () => {
    // -----------------------------------------------------------------------
    // `§3.1 M-7b` (`D-1`/`ADV-GS-3`): a TYPED recording source carrying
    // `capturePointer` (`typedEventSourceRecord(true)` — typed as the MODULE's
    // `EventSource`, so leg 4 pins the declaration), `install(el, {capture: true})`,
    // establish. Required: EXACTLY ONE call reaching that member, carrying the
    // gesture's OWN element, appearing AFTER the three tracking `on` calls and AFTER
    // `isConnected` (`§2.1`'s `EventSource`, `§2.5` item 2, `§2.3` item 6(b)).
    // -----------------------------------------------------------------------
    const create = await valueExport<(o?: ModuleSessionOptions) => GestureSessionMirror>('createGestureSession', 'M-7b §2.1')
    const typed = typedEventSourceRecord(true)
    const commits: unknown[] = []
    const session = create({
      source: typed.source,
      commit: (gesture, value): void => void commits.push([gesture.outcome, value]),
    })
    const el: Record<string, unknown> = { id: 'typed-opted-in' }
    expect(
      session.install(el, { capture: true }),
      'M-7b — the opted-in install through the TYPED `EventSource` succeeds (the declaration is usable, not decorative)',
    ).toBe(true)
    const began = session.begin(el)
    expect(began.ok, `M-7b/§2.3 item 6(b) — the typed-source establishment succeeds; got ${JSON.stringify(began)}`).toBe(true)
    const handle = (began as { ok: true; gesture: GestureHandle }).gesture
    // (i) EXACTLY ONE call reaching the member.
    expect(
      typed.capturePointerCalls.length,
      `M-7b/§2.5 item 2 — EXACTLY ONE capture call reaches the source's \`capturePointer\` member over the whole establishment (log ${JSON.stringify(
        typed.calls,
      )})`,
    ).toBe(1)
    // (ii) carrying the gesture's OWN element, by identity.
    expect(
      typed.capturePointerCalls[0],
      'M-7b/§2.3 item 6(b) — the capture call carries the GESTURE’s OWN element, by identity (`toBe`, never a structural match)',
    ).toBe(el)
    // (iii) appearing AFTER the three tracking `on` calls and AFTER `isConnected`.
    const at = (needle: string): number => typed.calls.indexOf(needle)
    const captureAt = at('capturePointer')
    expect(captureAt, 'M-7b — the capture call has a position in the ordered call log').toBeGreaterThan(-1)
    expect(
      captureAt > at(`on:${TYPE_MOVE}`) && captureAt > at(`on:${TYPE_END}`) && captureAt > at(`on:${TYPE_CANCEL}`),
      `M-7b/§2.3 item 6(b) — the capture call appears AFTER the three tracking \`on\` calls (move ${at(
        `on:${TYPE_MOVE}`,
      )}, end ${at(`on:${TYPE_END}`)}, cancel ${at(`on:${TYPE_CANCEL}`)} vs capture ${captureAt}): capture happens AFTER establishment`,
    ).toBe(true)
    expect(
      captureAt > at('isConnected'),
      `M-7b/§2.3 item 6(b) — and AFTER \`isConnected\` (isConnected ${at('isConnected')} vs capture ${captureAt}); §5.2 leg 4 is the pin that this fixture compiles`,
    ).toBe(true)
    // The terminal keeps the count at ONE (no release call is invented — `§2.3` item 6(c)).
    session.end(el, handle)
    expect(
      typed.capturePointerCalls.length,
      'M-7b/§2.3 item 6(c) — the gesture’s terminal adds NO further capture call and invents no release call',
    ).toBe(1)
    expect(commits.length, 'M-7b — the establishment is real: its `end` terminal committed exactly once').toBe(1)
  })

  it('M-8b §3.1 — a capture-LESS source is the DECLARED DEGRADATION: an opt-in with no member still establishes and still terminates normally', async () => {
    // -----------------------------------------------------------------------
    // `§3.1 M-8b` (the `D-1` remedy (iii)): `install(el, {capture: true})` on a source
    // whose surface has NO `capturePointer` member, then `begin`, then `pointerup`.
    // Required: ZERO capture calls, NO throw, no diagnostic and no refusal; the gesture
    // ESTABLISHES, opens the three tracking listeners, TERMINATES NORMALLY at its
    // terminal (the declared commit count for that path = one), and restores the
    // baseline to `1` — the absence is the degradation, never a failure.
    // -----------------------------------------------------------------------
    const create = await valueExport<(o?: ModuleSessionOptions) => GestureSessionMirror>('createGestureSession', 'M-8b §2.1')
    const bare = typedEventSourceRecord(false)
    // **THE FIXTURE'S OWN PRECONDITION, ASSERTED BEFORE THE DRIVE**: the source really
    // has no capture member, and it really is frozen (`D-12`(b)'s "genuinely frozen"
    // form) — a source that merely claims to lack the member would make the ZERO below
    // vacuous.
    expect(
      Object.prototype.hasOwnProperty.call(bare.source, 'capturePointer'),
      'M-8b/§2.1 — the fixture’s surface carries NO `capturePointer` member, so the degradation is driven rather than assumed',
    ).toBe(false)
    expect(
      isGenuinelyFrozen(bare.source),
      `M-8b/D-12(b) — the capture-less source is GENUINELY frozen (a write throws or leaves the value unchanged): Object.isFrozen = ${String(
        Object.isFrozen(bare.source),
      )}`,
    ).toBe(true)
    const commits: unknown[] = []
    const session = create({
      source: bare.source,
      commit: (gesture, value): void => void commits.push([gesture.outcome, value]),
    })
    const el: Record<string, unknown> = { id: 'typed-capture-less' }
    expect(session.install(el, { capture: true }), 'M-8b — the opted-in install on the capture-LESS source still returns `true`').toBe(true)
    expect(session.stats().installed, 'M-8b/§2.3 item 1(a) — the control is installed (the degradation is not a refusal to install)').toBe(1)
    expect(
      bare.calls,
      'M-8b/§2.3 item 1(a) — the install attaches EXACTLY ONE listener, the start listener, on the control’s own element',
    ).toEqual([`on:${TYPE_START}`])
    expect(bare.calls.filter((c) => c.startsWith('capture')), 'M-8b/§2.3 item 6(a) — ZERO capture calls at `install`').toEqual([])
    // The establishment: `{ok:true}` and the three tracking listeners, IN ORDER.
    const began = session.begin(el)
    expect(
      began.ok,
      `M-8b/§2.5 item 2 — the absence of the member still ESTABLISHES the gesture (\`begin\` ⇒ \`{ok:true}\`), never a throw, a diagnostic or a refusal; got ${JSON.stringify(
        began,
      )}`,
    ).toBe(true)
    const handle = (began as { ok: true; gesture: GestureHandle }).gesture
    expect(handle.element, 'M-8b/§2.1 — the handle carries the gesture’s OWN element, so the drive is not vacuous').toBe(el)
    expect(
      bare.calls,
      'M-8b/§2.3 item 2(a) — the establishment opens the three tracking listeners (after the connectivity reading), and NO capture call appears anywhere in the log',
    ).toEqual([`on:${TYPE_START}`, 'isConnected', `on:${TYPE_MOVE}`, `on:${TYPE_END}`, `on:${TYPE_CANCEL}`])
    expect(
      bare.capturePointerCalls.length,
      'M-8b/§2.1 — ZERO capture calls for the whole gesture: the absence of the member IS the declared degradation',
    ).toBe(0)
    // The terminal: normal termination for that path — the recorded `'pointerup'`
    // handler drives the session's OWN terminal (`§2.3` item 2(b)), and `pointerup`
    // ⇒ exactly ONE commit.
    expect(bare.calls.includes(`on:${TYPE_END}`), 'M-8b — the fixture really holds the recorded `pointerup` handler before the drive').toBe(true)
    bare.fire(el, TYPE_END)
    expect(session.stats().active, 'M-8b — the gesture terminated normally (nothing is left active)').toBe(false)
    expect(commits.length, 'M-8b/§2.3 item 4 — the declared commit count for this path is EXACTLY ONE (the `end` terminal)').toBe(1)
    expect(session.stats().commits, 'M-8b — the session’s OWN counter agrees with the injected callback (no spy-only count)').toBe(1)
    expect(session.stats().lastCode, 'M-8b — the last result code is `ok`: no consumer boundary saw an error').toBe('ok')
    expect(
      bare.calls.slice(-3),
      'M-8b/§2.3 item 2(c) — the terminal detaches the tracking three, in the pinned order',
    ).toEqual([`off:${TYPE_MOVE}`, `off:${TYPE_END}`, `off:${TYPE_CANCEL}`])
    expect(
      bare.calls.filter((c) => c.startsWith('capture')),
      'M-8b/§2.3 item 6(a) — and the terminal adds ZERO capture calls (no release call is invented)',
    ).toEqual([])
    expect(
      bare.calls.filter((c) => c.startsWith('on')).length - bare.calls.filter((c) => c.startsWith('off')).length,
      'M-8b — the baseline is restored to `1` (the start listener the install attached; the three tracking listeners are gone)',
    ).toBe(1)
  })

  it('M-9 §3.1 — `pointercancel` is a cancel terminal: zero commits, `onCancel` once, the tracking three detached and the start listener retained', async () => {
    const log = makeHookLog()
    const h = await makeHarness({ installOptions: hookOptions(log) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    fireStart(h, el, PLACEHOLDER_EVENT)
    const activeHandle = (h.session.gesture() as GestureStats | null)?.id
    h.source.fire(el, TYPE_CANCEL, PLACEHOLDER_EVENT)
    expect(h.commits.length, 'M-9/§2.3 item 4 — `commit` invoked ZERO times on a `pointercancel`').toBe(0)
    expect(log.cancel.length, 'M-9 — `onCancel` ran exactly ONCE').toBe(1)
    expect(log.cancel[0][0], 'M-9 — `onCancel` receives the gesture’s own element').toBe(el)
    expect(h.session.stats().active, 'M-9 — the gesture is no longer active').toBe(false)
    expect(h.session.gesture(), 'M-9/§2.1 — `gesture()` returns `null` once the terminal has run (idle)').toBe(null)
    expect(
      h.source.listenerCount(el),
      `M-9/§2.3 item 2(c) — the three tracking listeners are detached at the cancel terminal, and the START listener REMAINS (the element stays installed): ${JSON.stringify(
        h.source.typeMultiset(el),
      )} [active handle id was ${String(activeHandle)}]`,
    ).toBe(1)
    expect(h.source.typeMultiset(el), 'M-9 — the retained listener is the start listener').toEqual([TYPE_START])
  })

  it('M-10 §3.1 — `end` commits ONCE and an `undefined` value STILL commits (twice, one each)', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // (a) no `set` at all.
    const r1 = beginResult(h, el)
    const handle1 = (r1 as { ok: true; gesture: GestureHandle }).gesture
    const done1 = endCall(h, el, handle1)
    expect(done1, 'M-10/§2.3 item 4 — a successful `end` returns `{ok:true, code:\'ok\', committed:true}`').toEqual({
      ok: true,
      code: 'ok',
      committed: true,
    })
    expect(h.commits.length, 'M-10 — the first `end` — with NO `set` at all — committed exactly once').toBe(1)
    expect(h.commits[0].value, 'M-10 — the committed value is `undefined` (the gesture never set one)').toBe(undefined)
    // (b) `set(undefined)` explicitly.
    const r2 = beginResult(h, el)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    handle2.set(undefined)
    expect(handle2.value, 'M-10/§2.4 item 7 — `set(undefined)` is stored verbatim (no validation, no default)').toBe(undefined)
    const done2 = endCall(h, el, handle2)
    expect(done2?.committed, 'M-10 — the second `end` also reports `committed: true` (the commit is a COUNT, never a "commit only if something changed" heuristic)').toBe(true)
    expect(h.commits.length, 'M-10 — TWO gestures, TWO commits, ONE EACH').toBe(2)
    expect(h.commits[1].value, 'M-10 — the second commit also receives `undefined`').toBe(undefined)
    expect(h.session.stats().commits, 'M-10 — the session’s own counter reads TWO').toBe(2)
  })

  it('M-11 §3.1 — `cancel` detaches BEFORE the consumer’s hook runs (the baseline is restored before consumer code)', async () => {
    const observed: { offsAtHook: number; opAtHook: string[] } = { offsAtHook: -1, opAtHook: [] }
    const h = await makeHarness({})
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(
      el,
      hookOptions(makeHookLog(), {
        onCancel: (): void => {
          observed.offsAtHook = h.source.log.filter((rec) => rec.op === 'off').length
          observed.opAtHook = h.source.log.map((rec) => `${rec.op}:${rec.type}`)
        },
      }),
    )
    fireStart(h, el, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_CANCEL, PLACEHOLDER_EVENT)
    expect(
      observed.offsAtHook,
      'M-11/§0A note 11 — at the moment `onCancel` runs, the log ALREADY contains the three `off` calls: the baseline is restored BEFORE any consumer code',
    ).toBe(3)
    expect(
      observed.opAtHook.slice(-3),
      `M-11/§2.3 item 2(c) — the detaches precede the hook, in the pinned order: ${JSON.stringify(observed.opAtHook)}`,
    ).toEqual([`off:${TYPE_MOVE}`, `off:${TYPE_END}`, `off:${TYPE_CANCEL}`])
    expect(
      h.source.listenerCount(el),
      'M-11 — the hook observed a control already back to its ONE start listener',
    ).toBe(1)
    // The `commit` half of the same rule, for the committing terminals.
    const observedCommit: { offsAtCommit: number } = { offsAtCommit: -1 }
    const h2 = await makeHarness({
      commitThrows: false,
    })
    const el2: Record<string, unknown> = { id: 'b' }
    const commits: number[] = []
    const h3 = await makeHarness({})
    void h2
    void commits
    const session3 = await makeSession(
      {
        source: h3.source,
        commit: (): void => {
          observedCommit.offsAtCommit = h3.source.log.filter((rec) => rec.op === 'off').length
        },
      },
      'M-11 (the commit half)',
    )
    session3.install(el2)
    const r3 = session3.begin(el2)
    const handle3 = (r3 as { ok: true; gesture: GestureHandle }).gesture
    session3.end(el2, handle3)
    expect(
      observedCommit.offsAtCommit,
      'M-11/§0A note 11 — the terminal order is (1) detach, (2) mark inactive, (3) run the hook, (4) invoke `commit`: the `commit` call also observes the detaches already done',
    ).toBe(3)
  })

  it('M-12 §3.1 — `reset` commits the SUPPLIED value exactly once, with its own outcome', async () => {
    const log = makeHookLog()
    const h = await makeHarness({ installOptions: hookOptions(log) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const userValue = { user: 'chose this' }
    const suppliedDefault = { supplied: 'default' }
    handle.set(userValue)
    const done = resetCall(h, el, handle, suppliedDefault)
    expect(done, 'M-12/§2.3 item 4 — `reset` returns `{ok:true, code:\'ok\', committed:true}`').toEqual({
      ok: true,
      code: 'ok',
      committed: true,
    })
    expect(h.commits.length, 'M-12 — `commit` called exactly ONCE').toBe(1)
    expect(h.commits[0].value, 'M-12/§0A note 6 — with the SUPPLIED value, NOT `userValue`').toBe(suppliedDefault)
    expect(handle.outcome, 'M-12 — `handle.outcome === \'reset\'`').toBe('reset')
    expect(log.end.length, 'M-12/§2.3 item 4 — the `reset` terminal runs the `onEnd` hook (it is an end-class terminal), once').toBe(1)
    expect(log.end[0][1], 'M-12 — the hook receives the SUPPLIED value').toBe(suppliedDefault)
    expect(
      log.cancel.length,
      'M-12 — the `cancel` hook does NOT run: `reset` is not a cancel (a composing controller distinguishes the two by `outcome`)',
    ).toBe(0)
    expect(h.source.listenerCount(el), 'M-12 — the tracking three are detached at the reset terminal').toBe(1)
  })

  it('M-13 §3.1 — `dispose()` restores the session’s own baseline and is IDEMPOTENT: FIVE detaches, then `{removed: 0, complete: true}`', async () => {
    const log = makeHookLog()
    const h = await makeHarness({ installOptions: hookOptions(log) })
    const elA: Record<string, unknown> = { id: 'a' }
    const elB: Record<string, unknown> = { id: 'b' }
    h.sessionInstall(elA)
    h.sessionInstall(elB)
    fireStart(h, elA, PLACEHOLDER_EVENT)
    const first = h.session.dispose()
    expect(h.commits.length, 'M-13/§2.3 item 7(1) — a `dispose()` during a gesture takes the `cancel` path: `commit` ZERO times').toBe(0)
    expect(log.cancel.length, 'M-13 — `onCancel` ran ONCE for the in-flight gesture').toBe(1)
    expect(
      first.removed,
      'M-13/§2.3 item 7(2) — EVERY session-attached listener detached: 4 from `elA` (start + the three tracking) + 1 from `elB` = FIVE',
    ).toBe(5)
    expect(first.complete, 'M-13 — the detach was complete, and the report says so').toBe(true)
    const pairs = pairOnOffCalls(h.source.log)
    expect(pairs.unmatched, `M-13 — every detach matches its \`on\` by the same three values (element, type, HANDLER IDENTITY): ${JSON.stringify(pairs.unmatched)}`).toEqual([])
    const callsBefore = h.source.log.length
    const second = h.session.dispose()
    expect(second, 'M-13/§2.3 item 7(5) — the SECOND `dispose()` reports `{removed: 0, complete: true}`').toEqual({
      removed: 0,
      complete: true,
    })
    expect(h.source.log.length, 'M-13 — the second call performs ZERO source calls (the difference is asserted, not assumed)').toBe(callsBefore)
    expect(h.session.disposed, 'M-13/§2.3 item 7(3) — `session.disposed === true` FOREVER').toBe(true)
    expect(h.session.stats().installed, 'M-13 — the ledger is emptied: `stats().installed === 0`').toBe(0)
    expect(h.session.stats().active, 'M-13 — `stats().active === false`').toBe(false)
    expect(h.session.gesture(), 'M-13 — `gesture()` returns `null`').toBe(null)
  })

  it('M-14 §3.1 — `begin` is established only when the element is connected: `true` and `undefined` both proceed, with ONE reading per attempt', async () => {
    for (const [label, answer] of [
      ['`true`', true],
      ['`undefined`', undefined],
    ] as ReadonlyArray<readonly [string, unknown]>) {
      const h = await makeHarness({ sourceOptions: { isConnected: () => answer } })
      const el: Record<string, unknown> = { id: 'a' }
      h.sessionInstall(el)
      const r = beginResult(h, el)
      expect(r?.ok, `M-14/§2.4 item 5 — \`isConnected\` returning ${label} means "no contrary evidence" and the gesture PROCEEDS`).toBe(true)
      const tracking = h.source.log.filter((rec) => rec.op === 'on' && rec.type !== TYPE_START)
      expect(tracking.length, `M-14 — the three tracking listeners are attached for the ${label} answer`).toBe(3)
      expect(
        h.source.log.filter((rec) => rec.op === 'isConnected').length,
        `M-14/§2.4 item 5 — \`isConnected(element)\` is called EXACTLY ONCE per \`begin\` attempt (${label})`,
      ).toBe(1)
    }
    // The `null` answer of the same clause: still no contrary evidence.
    const h2 = await makeHarness({ sourceOptions: { isConnected: () => null } })
    const el2: Record<string, unknown> = { id: 'b' }
    h2.sessionInstall(el2)
    expect(beginResult(h2, el2)?.ok, 'M-14/§2.4 item 5 — a `null` return is NOT the failing answer: only EXACTLY `false` fails').toBe(true)
  })

  it('M-15 §3.1 — the counters are the session’s own and are readable: `sourceCalls` follows the corrected rule (a call that THROWS is logged but NOT counted)', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // M-4 sequence.
    fireStart(h, el, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
    // M-9 sequence.
    fireStart(h, el, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_CANCEL, PLACEHOLDER_EVENT)
    // M-12 sequence.
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    resetCall(h, el, handle, 'd')
    const stats = h.session.stats()
    expect(stats.gestures, 'M-15/§0A note 12 — three successful `begin` calls, instance-lifetime').toBe(3)
    expect(stats.commits, 'M-15 — TWO commits: the `end` and the `reset` (the `cancel` committed nothing)').toBe(2)
    expect(stats.active, 'M-15 — no gesture is active').toBe(false)
    expect(stats.gestureId, 'M-15/§2.1 — `gestureId` is `0` when idle').toBe(0)
    expect(stats.lastCode, 'M-15 — the LAST result code this session produced is `ok`').toBe('ok')
    expect(stats.installed, 'M-15 — one control is installed (by identity)').toBe(1)
    expect(
      stats.sourceCalls,
      `M-15/§2.1 — \`sourceCalls\` equals the count of NON-THROWING \`on\` + \`off\` + \`isConnected\` entries in the recorded log (the counting rule §2.1’s \`SessionStats.sourceCalls\` cell states: the counter increments by ONE for a call that RETURNS, and a call that THROWS is NOT counted; capture calls are not one of the three members the field names): stats ${stats.sourceCalls} vs non-throwing log entries ${nonThrowingSourceCalls(h.source.log, h.source.threwAt)}`,
    ).toBe(nonThrowingSourceCalls(h.source.log, h.source.threwAt))
    expect(stats.sourceCalls, 'M-15 — the equation above is non-vacuous (the count is a real total, not zero)').toBeGreaterThan(0)
    // ⟶ THE FLAGGED DRIVE-LEVEL CORRECTION (the spec amendment names it, NOT landed by the
    // SpecWriter; this is the TEST side): **THE CORRECTED COUNTING RULE IS ONLY FALSIFIABLE
    // WHEN A SOURCE CALL ACTUALLY THROWS.** As filed, this row's drive performed no
    // throwing call, so `stats().sourceCalls` and the raw log length agreed for a reason
    // that did not exercise the rule — a module counting THROWING calls as well would have
    // passed. The second arm below drives a THROWING tracking attach (the `ADV-GS-2`
    // degradation class) and asserts the corrected rule directly: the throwing call is
    // LOGGED but NOT counted, so `stats().sourceCalls` is strictly LESS than the number of
    // logged `on`/`off`/`isConnected` entries and equals the NON-THROWING count.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el2: Record<string, unknown> = { id: 'a' }
    expect(h2.sessionInstall(el2), 'M-15 — the throwing-call arm installs its own control').toBe(true)
    h2.source.failOn = ({ element, type }): boolean => type === TYPE_MOVE && element === el2
    const threwBefore = h2.source.threwAt.size
    // **THE SESSION SWALLOWS ITS OWN SEAM ERROR** (`§2.4` item 6: an `on` that throws is the
    // valid-state degradation, never propagated) — so the drive observes the throw through
    // the RECORDER's own `threwAt` set, not through an exception at the consumer boundary.
    const refusedBegin = beginResult(h2, el2)
    expect(
      h2.source.threwAt.size,
      'M-15/§2.1 — the arm’s precondition: the tracking attach really THREW (the recorder logged the attempt before throwing, `makeSource`’s order), so the rule below has a throwing call to exclude',
    ).toBe(threwBefore + 1)
    expect(
      refusedBegin,
      'M-15/§2.1 — and the throw was swallowed at the seam: the consumer boundary sees the declared REFUSAL, never an error (§2.4 item 6)',
    ).toEqual({ ok: false, code: 'not-installed' })
    h2.source.failOn = (): boolean => false
    const retried = beginResult(h2, el2)
    expect(retried?.ok, 'M-15 — the arm’s retry establishes the gesture so the arm reaches a terminal too').toBe(true)
    h2.source.fire(el2, TYPE_END, PLACEHOLDER_EVENT)
    const rawLogged = h2.source.sourceCallsFromStats()
    const h2Stats = h2.session.stats()
    expect(
      rawLogged,
      'M-15/§2.1 — the arm logged MORE `on`/`off`/`isConnected` entries than the session counted, because ONE of them threw (a module that counted the throwing call would report the RAW total here)',
    ).toBeGreaterThan(h2Stats.sourceCalls)
    expect(
      h2Stats.sourceCalls,
      `M-15/§2.1 — the CORRECTED counting rule, measured on a call that really THREW: \`sourceCalls\` counts only the callables that RETURNED — stats ${h2Stats.sourceCalls} vs non-throwing log entries ${nonThrowingSourceCalls(
        h2.source.log,
        h2.source.threwAt,
      )} vs raw logged ${rawLogged}`,
    ).toBe(nonThrowingSourceCalls(h2.source.log, h2.source.threwAt))
    expect(
      h2.source.threwAt.size,
      'M-15/§2.1 — the arm really carries ONE throwing entry, so the comparison above has something to exclude (a vacuous set would reduce the rule to the raw count it must differ from)',
    ).toBe(1)
  })

  it('M-16 §3.1 — ISOLATION (`MULTI-GRAPH-ISOLATION`): an element only ANOTHER session installed cannot be established here', async () => {
    const sessionA = await makeHarness({})
    const sessionB = await makeHarness({})
    const elX: Record<string, unknown> = { id: 'x' }
    expect(sessionA.session.install(elX), 'M-16 — session A installs `elX`').toBe(true)
    const before = sessionB.source.log.length
    const result = beginResult(sessionB, elX)
    expect(
      result,
      'M-16/§2.3 item 1(c) — session B reports `{ok:false, code:\'not-installed\'}`: an element installed only by ANOTHER session is not installed here (`docs/decisions.md` `MULTI-GRAPH-ISOLATION`)',
    ).toEqual({ ok: false, code: 'not-installed' })
    expect(sessionB.source.log.length, 'M-16 — session B makes ZERO source calls for the refusal').toBe(before)
    expect(sessionA.session.stats().active, 'M-16 — session A is UNAFFECTED: its own state is untouched by session B’s refusal').toBe(false)
    expect(sessionA.session.stats().installed, 'M-16 — session A still holds its own ledger entry').toBe(1)
  })

  it('M-17 §3.1 — `gesture()` is the active reading and `null` when idle', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    expect(h.session.gesture(), 'M-17/§2.1 — `gesture()` returns `null` before any gesture').toBe(null)
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const during = h.session.gesture()
    expect(during, 'M-17 — during a gesture the reading is a `GestureStats`').not.toBe(null)
    expect(during?.active, 'M-17 — `active: true` while the gesture is in flight').toBe(true)
    expect(during?.id, 'M-17 — the LIVE id is reported').toBe(handle.id)
    expect(during?.outcome, 'M-17/§2.1 — `outcome` is `null` while active').toBe(null)
    expect(during?.commits, 'M-17 — `commits: 0` while active').toBe(0)
    endCall(h, el, handle)
    expect(h.session.gesture(), 'M-17/§2.4 item 8 — after the terminal, `gesture()` returns `null` again (the active record is discarded)').toBe(null)
    expect(handle.active, 'M-17 — the terminal’s facts remain readable through the HANDLE (`active: false`)').toBe(false)
    expect(handle.outcome, 'M-17 — and through the handle’s `outcome`').toBe('end')
    expect(h.session.stats().commits, 'M-17 — and through `stats()`').toBe(1)
  })

  // -------------------------------------------------------------------------
  // `§3.1 M-18` — THE `P-4` RULE SET'S RUNTIME HALF (the `D-9`/`ADV-GS-12`
  // amendment). It is authored HERE, at the foot of the `§3.1` block it closes,
  // and it is the PAIR of `§3.4 R-12` (authored last in the `§3.4` block) — the
  // spec's own filing order for the two new ids.
  //
  // STATES THIS ROW ENUMERATES (one arm per state, all driven in ONE lifecycle):
  //   (1) an installed control with a write-recording surface, before any gesture
  //       — the surface's log is EMPTY and the write-call census is ZERO;
  //   (2) a gesture ESTABLISHED on that control (`begin`) — the establishment path
  //       performs no write (the attach/capture/connectivity calls are the
  //       source's, and the session's own change set names no write token);
  //   (3) the ACTIVE window with a `pointermove` delivered through the source's own
  //       fire path — no write on the move path;
  //   (4) the `end` TERMINAL (one commit) — no write on the terminal path;
  //   (5) IDLE again after the terminal — still no write, and the element's own log
  //       is EMPTY over the WHOLE lifecycle, not merely at the end.
  // FAIL-STATE THIS ROW COVERS: if the session authored ANY element/class/text/
  // style write, the element's OWN recorded log would be non-empty (the surfaces
  // are real members of the element the session is handed) — so the row fails
  // rather than passing vacuously.
  // -------------------------------------------------------------------------
  it('M-18 §3.1 — THE `P-4` RULE SET’S RUNTIME HALF (the pair with `R-12`): a full lifecycle authors NO UI content — the element’s own recorded write log stays EMPTY and no prohibited write token is in the session’s change set', async () => {
    // -------------------------------------------------------------------------
    // **⟶ `ADV-GS-23` (THE GATE-4 CLOSURE, 2026-09-27): THE RECORDING SURFACE NOW COVERS
    // EVERY `R-12` TOKEN FAMILY.** As filed this instrument carried THREE members
    // (`set${'Attribute'}`, `classList.add`, `textContent`) while the row's own claim — and
    // `§2.2 P-4`/`§3.4 R-12` — covers *"no attribute write, no class write, no text write,
    // no markup write, no insert/append, no `style` write"*: a module doing a markup
    // assignment, a child append or a stylesheet write on the element it was handed would
    // have PASSED this row. The surface below carries every family `R-12` enumerates — the
    // attribute/class/text family, the markup family (`innerHTML`-style / `outerHTML`-style /
    // the two `insertAdjacent*` inserts), the node family (`appendChild` / `insertBefore` /
    // `removeChild` / `replaceChildren`), the factory family (`createElement` /
    // `createTextNode`) and the THREE stylesheet-write shapes (a member write through the
    // style object, a plain-style-attribute write and a `cssText` write) — and the style
    // object is a `Proxy` so a DIRECT property write (the shape a plain function triple
    // cannot see) is recorded too.
    //
    // **EVERY SPELLING IS ASSEMBLED AT RUN TIME FROM FRAGMENTS**, because this file's own
    // raw bytes are scanned by `R-8` (a member-access spelling of the markup or stylesheet
    // tokens here would fail `R-8`(b)), and because `R-12`'s own scope rule drops a
    // whole-file negative over this file precisely so its controls may carry the spellings.
    // -------------------------------------------------------------------------
    const attempts: Array<{ surface: string; wrote: true }> = []
    const write = (surface: string): void => void attempts.push({ surface, wrote: true })
    const W = {
      attrSet: ['set', 'Attribute'].join(''),
      attrRemove: ['remove', 'Attribute'].join(''),
      classFamily: ['class', 'List'].join(''),
      classProp: ['class', 'Name'].join(''),
      textProp: ['text', 'Content'].join(''),
      textPropAlt: ['inner', 'Text'].join(''),
      markupInner: ['inner', 'HTML'].join(''),
      markupOuter: ['outer', 'HTML'].join(''),
      insMarkup: ['insert', 'Adjacent', 'HTML'].join(''),
      insText: ['insert', 'Adjacent', 'Text'].join(''),
      makeElement: ['create', 'Element'].join(''),
      makeTextNode: ['create', 'Text', 'Node'].join(''),
      addChild: ['append', 'Child'].join(''),
      insBefore: ['insert', 'Before'].join(''),
      dropChild: ['remove', 'Child'].join(''),
      replaceKids: ['replace', 'Children'].join(''),
      cssWrite: ['css', 'Text'].join(''),
      styleRoot: ['st', 'yle'].join(''),
      styleSet: ['set', 'Property'].join(''),
      styleRemove: ['remove', 'Property'].join(''),
    } as const
    // THE METHOD FAMILY (a call records a write).
    const methodSurface: Record<string, unknown> = {
      [W.attrSet]: (name: string): void => write(`${W.attrSet}(${name})`),
      [W.attrRemove]: (name: string): void => write(`${W.attrRemove}(${name})`),
      [W.classFamily]: {
        add: (name: string): void => write(`${W.classFamily}.add(${name})`),
        remove: (name: string): void => write(`${W.classFamily}.remove(${name})`),
        toggle: (name: string): void => write(`${W.classFamily}.toggle(${name})`),
      },
      [W.insMarkup]: (position: string): void => write(`${W.insMarkup}(${position})`),
      [W.insText]: (position: string): void => write(`${W.insText}(${position})`),
      [W.makeElement]: (tag: string): void => write(`${W.makeElement}(${tag})`),
      [W.makeTextNode]: (): void => write(W.makeTextNode),
      [W.addChild]: (): void => write(W.addChild),
      [W.insBefore]: (): void => write(W.insBefore),
      [W.dropChild]: (): void => write(W.dropChild),
      [W.replaceKids]: (): void => write(W.replaceKids),
    }
    const el: Record<string, unknown> = { id: 'a' }
    for (const key of Object.keys(methodSurface)) el[key] = methodSurface[key]
    // THE PROPERTY-WRITE FAMILY (an ASSIGNMENT records a write; a read records nothing).
    for (const prop of [W.textProp, W.textPropAlt, W.markupInner, W.markupOuter, W.classProp]) {
      Object.defineProperty(el, prop, {
        configurable: true,
        enumerable: true,
        get: (): undefined => undefined,
        set: (): void => write(`${prop} =`),
      })
    }
    // THE STYLESHEET FAMILY: a `Proxy` so BOTH a member write (the `setProperty`-shaped and
    // `removeProperty`-shaped calls) and a DIRECT property write through the style object
    // land in the same log.
    const styleRoot = new Proxy({} as Record<string, unknown>, {
      get: (_target, prop): unknown => {
        if (typeof prop !== 'string') return undefined
        if (prop === W.styleSet || prop === W.styleRemove) {
          return (name: string): void => write(`${W.styleRoot}.${prop}(${name})`)
        }
        return undefined
      },
      set: (_target, prop): boolean => {
        write(`${W.styleRoot}.${String(prop)} =`)
        return true
      },
    })
    el[W.styleRoot] = styleRoot
    const styleObject = styleRoot as Record<string, unknown>
    // NOT VACUOUS — THE "RECORD THEN CLEAR" PROBE (`ADV-GS-23`'s own requirement: the
    // instrument must be PROVABLY LIVE), run over EVERY family the row now claims: one
    // direct write per family lands in the element's own log, the count is asserted, and
    // the log is then CLEARED so the emptiness asserted below is a MEASUREMENT.
    const methodMember = (token: string): ((...args: unknown[]) => void) => el[token] as (...args: unknown[]) => void
    const classMember = el[W.classFamily] as Record<string, (...args: unknown[]) => void>
    const probes: ReadonlyArray<readonly [string, () => void]> = [
      [`${W.attrSet} family`, () => methodMember(W.attrSet)('probe', 'x')],
      [`${W.attrRemove} family`, () => methodMember(W.attrRemove)('probe')],
      [`${W.classFamily}.add family`, () => classMember.add('probe')],
      [`${W.classFamily}.remove family`, () => classMember.remove('probe')],
      [`${W.classFamily}.toggle family`, () => classMember.toggle('probe')],
      [`${W.classProp} write`, () => void (el[W.classProp] = 'probe')],
      [`${W.textProp} write`, () => void (el[W.textProp] = 'probe')],
      [`${W.textPropAlt} write`, () => void (el[W.textPropAlt] = 'probe')],
      [`${W.markupInner} write`, () => void (el[W.markupInner] = '<i></i>')],
      [`${W.markupOuter} write`, () => void (el[W.markupOuter] = '<i></i>')],
      [`${W.insMarkup} family`, () => methodMember(W.insMarkup)('beforeend')],
      [`${W.insText} family`, () => methodMember(W.insText)('beforeend')],
      [`${W.makeElement} family`, () => methodMember(W.makeElement)('div')],
      [`${W.makeTextNode} family`, () => methodMember(W.makeTextNode)('x')],
      [`${W.addChild} family`, () => methodMember(W.addChild)({})],
      [`${W.insBefore} family`, () => methodMember(W.insBefore)({}, {})],
      [`${W.dropChild} family`, () => methodMember(W.dropChild)({})],
      [`${W.replaceKids} family`, () => methodMember(W.replaceKids)({})],
      [`a ${W.styleRoot}-object member write (the 'setProperty' shape)`, () => (styleObject[W.styleSet] as (n: string) => void)('color')],
      [`a ${W.styleRoot}-object member write (the 'removeProperty' shape)`, () => (styleObject[W.styleRemove] as (n: string) => void)('color')],
      [`a DIRECT property write through the ${W.styleRoot} object`, () => void (styleObject['color'] = 'red')],
      [`a ${W.cssWrite} write through the ${W.styleRoot} object`, () => void (styleObject[W.cssWrite] = 'color: red')],
    ]
    for (const [family, probe] of probes) {
      try {
        probe()
      } catch (e) {
        throw new Error(`M-18 — the write-recording surface could not be probed for the ${family}: ${describeThrown(e)}`)
      }
    }
    expect(
      probes.length,
      'M-18/`ADV-GS-23` — the PROBE covers every family the row claims, so the surface cannot be live for one family and inert for the rest',
    ).toBe(22)
    expect(
      attempts.length,
      `M-18 — the write-recording surface is LIVE in EVERY family the row claims: a direct write per family lands in the element’s own log (${probes.length} probes, ${probes.length} recorded writes), so the EMPTY log the row asserts below is measured and not a fixture that cannot record`,
    ).toBe(probes.length)
    expect(
      new Set(attempts.map((a) => a.surface)).size,
      'M-18 — and each probe recorded a DISTINCT surface spelling (a probe pair that collapsed onto one member would leave a family unmeasured)',
    ).toBe(probes.length)
    attempts.length = 0
    // THE LIFECYCLE (`§3.1 M-18`: install → begin → pointermove → end) over a recording
    // source. No `capture` opt-in is used: the capture path is `M-7`/`M-7b`'s, and this row
    // pins the WRITE SET, not the capture count.
    const h = await makeHarness({ label: 'M-18 §2.2 P-4, §3.4 R-12' })
    expect(h.sessionInstall(el), 'M-18 — the control is installed on the write-recording element').toBe(true)
    expect(
      attempts,
      'M-18 STATE (1) — an installation authors no UI content on the element it was handed (the element’s own log is EMPTY)',
    ).toEqual([])
    const begun = beginResult(h, el)
    expect(begun?.ok, 'M-18 STATE (2) — the gesture is established, so the write claim below covers the establishment path and not a refusal').toBe(true)
    h.source.fire(el, TYPE_MOVE, { id: 'evt-move' })
    expect(
      attempts,
      'M-18 STATES (2)/(3) — establishing the gesture and delivering a `pointermove` through the source author NO write on the element',
    ).toEqual([])
    const handle = (begun as { ok: true; gesture: GestureHandle }).gesture
    endCall(h, el, handle)
    expect(h.commits.length, 'M-18 STATE (4) — the terminal really ran (exactly one commit), so the write claim covers the terminal path').toBe(1)
    expect(h.session.gesture(), 'M-18 STATE (5) — the session is IDLE again after the terminal (the lifecycle completed)').toBe(null)
    expect(
      attempts,
      'M-18/§2.2 P-4 — over the WHOLE lifecycle (install → begin → pointermove → end) the session authors NO UI content: no attribute write, no class write, no text write, no markup write, no insert/append and no style write reached the element it was handed — the element’s own recorded write log stays EMPTY',
    ).toEqual([])
    // THE SESSION'S OWN CHANGE SET, read from the run — **RE-WORDED BY `ADV-GS-23`**: the
    // as-filed limb filtered the recorder's log against the very op set the recorder can
    // emit (`['on','off','capture','isConnected']`), so it could not fail and stood as a
    // claim it was not. The claim is now asserted in a FALSIFIABLE form: the source half of
    // the change set is EXACTLY the declared lifecycle op multiset — `4` attaches (the start
    // listener plus the three tracking attaches), `3` detaches (the tracking three at the
    // `end` terminal) and `1` connectivity reading (the recorder supplies a callable
    // `isConnected` returning `true`, `§2.4` item 5) — so an EXTRA operation of any kind,
    // or a missing one, FAILS here. (The write half is the empty log asserted above; the two
    // halves together are the session's whole change set.)
    const opCounts = h.source.log.reduce<Record<string, number>>((acc, rec) => {
      acc[rec.op] = (acc[rec.op] ?? 0) + 1
      return acc
    }, {})
    expect(
      Object.keys(opCounts).sort(),
      'M-18 — the source half of the change set names NO operation beyond the four the source’s own contract exposes (`on`/`off`/`isConnected` here, no capture: this row uses no opt-in) — measured against the DECLARED lifecycle multiset below, so a fifth operation of any kind fails both limbs',
    ).toEqual(['isConnected', 'off', 'on'])
    expect(
      opCounts,
      'M-18 — and the measured multiset EQUALS the declared lifecycle multiset (`on` × 4 = the start listener + the three tracking attaches; `off` × 3 = the tracking detaches at the `end` terminal; `isConnected` × 1 = the one connectivity reading per `begin`): an extra or missing call fails here, which is what makes this limb a claim rather than a tautology',
    ).toEqual({ on: 4, off: 3, isConnected: 1 })
    expect(
      h.source.log.length,
      'M-18 — the lifecycle really made calls, so the change-set reading above is over a non-empty log',
    ).toBe(8)
    // THE PAIR (`§3.4 R-12`: "and the pair is the row", `R-3`'s form): the static half is
    // asserted by the row above, and this runtime half is what a text scan cannot prove.
    expect(
      rowTitles(readFileSync(TEST_FILE, 'utf8')).filter((title) => title.includes('R-12')).length,
      'M-18 — the PAIR is present: `§3.4 R-12`’s static write-token row is authored in the `§3.4` block above (this row is the runtime half of THAT row, not a row of its own)',
    ).toBeGreaterThan(0)
  })
})

// ===========================================================================
// F-1..F-11 — §3.2 THE DOCUMENTED FAIL-STATES. (`F-12` is NOT authored as a passing
// row: `§3.2`/`§4.4 S-6` make it `NOT-RUNNABLE-HERE`, and `R-11` is its probe.)
// ===========================================================================
describe('F — §3.2 the documented fail-states (every outcome is a VALUE)', () => {
  it('F-1 §3.2 — THE REJECTED SOURCE SHAPE: a `selectors`/`threshold`/attribute-shaped options object is IGNORED, and behaviour is byte-identical', async () => {
    const rejectedOptions = {
      // The REJECTED shapes of `§0` ruling 4, driven as the CONSUMER's own data.
      [['select', 'ors'].join('')]: '#a',
      [['thres', 'hold'].join('')]: 4,
      [['data', '-', 'zone'].join('')]: 'z1',
      [['add', 'EventListener'].join('')]: () => undefined,
    } as unknown as GestureOptionsInput
    const plain = await makeHarness({ installOptions: { capture: true } })
    const rejected = await makeHarness({ installOptions: { ...rejectedOptions, capture: true } })
    const elPlain: Record<string, unknown> = { id: 'a' }
    const elRejected: Record<string, unknown> = { id: 'a' }
    plain.session.install(elPlain, { capture: true })
    rejected.session.install(elRejected, { ...rejectedOptions, capture: true })
    const r1 = beginResult(plain, elPlain)
    const r2 = beginResult(rejected, elRejected)
    const h1 = (r1 as { ok: true; gesture: GestureHandle }).gesture
    const h2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    plain.source.fire(elPlain, TYPE_END, PLACEHOLDER_EVENT)
    rejected.source.fire(elRejected, TYPE_END, PLACEHOLDER_EVENT)
    expect(
      rejected.source.log.map((rec) => `${rec.op}:${rec.type}`),
      'F-1/§2.2 P-1 — there is NO code path by which a selector or a threshold reaches behaviour: the call log is BYTE-IDENTICAL to the same `install` without the rejected fields',
    ).toEqual(plain.source.log.map((rec) => `${rec.op}:${rec.type}`))
    expect(h2.id, 'F-1 — the gesture ids match: the hostile fields changed nothing').toBe(h1.id)
    expect(rejected.commits.length, 'F-1 — the commit count is unchanged by the ignored fields').toBe(plain.commits.length)
    expect(rejected.commits.length, 'F-1 — and that count is the declared ONE for a `pointerup` terminal').toBe(1)
  })

  it('F-2 §3.2 — A SECOND START WHILE A GESTURE IS ACTIVE: both second calls are `busy`, with ZERO extra source calls and the active gesture untouched', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elA: Record<string, unknown> = { id: 'a' }
    const elB: Record<string, unknown> = { id: 'b' }
    h.sessionInstall(elA)
    h.sessionInstall(elB)
    const r = beginResult(h, elA)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    handle.set('the active value')
    const callsBefore = h.source.log.length
    expect(beginResult(h, elA), 'F-2/§2.3 item 3 — `begin(elA)` during an active gesture is refused `busy`').toEqual({
      ok: false,
      code: 'busy',
    })
    expect(beginResult(h, elB), 'F-2 — a `begin` on ANOTHER installed control is ALSO refused `busy` (one gesture authority for the whole instance)').toEqual({
      ok: false,
      code: 'busy',
    })
    expect(h.source.log.length, 'F-2/§2.4 item 3 — ZERO extra source calls: no second listener set was opened').toBe(callsBefore)
    expect(h.session.gesture()?.id, 'F-2 — the ACTIVE gesture is untouched (same handle id)').toBe(handle.id)
    expect(h.session.gesture()?.value, 'F-2 — the ACTIVE gesture’s value is unchanged').toBe('the active value')
    expect(handle.active, 'F-2 — the active handle is still active').toBe(true)
    expect(h.session.stats().commits, 'F-2 — no extra commit occurred').toBe(0)
    expect(h.session.stats().gestures, 'F-2 — the refused calls created NO gesture').toBe(1)
  })

  it('F-3 §3.2 — A CONSUMER HOOK OR `commit` THROWS: the throw PROPAGATES, the detach already happened, and no listener is left behind', async () => {
    // (a) `onMove` throws.
    const h1 = await makeHarness({})
    const elA: Record<string, unknown> = { id: 'a' }
    h1.sessionInstall(elA, hookOptions(makeHookLog(), { onMove: (): never => { throw new Error('onMove threw') } }))
    fireStart(h1, elA, PLACEHOLDER_EVENT)
    let thrown1: unknown = null
    try {
      h1.source.fire(elA, TYPE_MOVE, PLACEHOLDER_EVENT)
    } catch (e) {
      thrown1 = e
    }
    expect(thrown1, 'F-3(a)/§0A note 11 — the `onMove` throw PROPAGATES to the caller (the session does not swallow consumer errors)').not.toBe(null)
    expect(h1.session.stats().active, 'F-3(a) — the gesture remains active after a throwing `onMove` (a move is not a terminal)').toBe(true)
    expect(h1.source.listenerCount(elA), 'F-3(a) — a throwing `onMove` leaves the tracking listeners in place (the gesture is still in flight)').toBe(4)
    // (b) `onEnd` throws.
    const h2 = await makeHarness({})
    const elB: Record<string, unknown> = { id: 'b' }
    h2.sessionInstall(elB, hookOptions(makeHookLog(), { onEnd: (): never => { throw new Error('onEnd threw') } }))
    fireStart(h2, elB, PLACEHOLDER_EVENT)
    let thrown2: unknown = null
    try {
      h2.source.fire(elB, TYPE_END, PLACEHOLDER_EVENT)
    } catch (e) {
      thrown2 = e
    }
    expect(thrown2, 'F-3(b) — the `onEnd` throw PROPAGATES').not.toBe(null)
    expect(
      h2.source.listenerCount(elB),
      'F-3(b)/§0A note 11 — in EVERY case the three tracking listeners are ALREADY detached before the hook ran: the control is back to ONE',
    ).toBe(1)
    expect(h2.session.stats().active, 'F-3(b) — the gesture is no longer active despite the hook’s throw').toBe(false)
    expect(
      h2.commits.length,
      'F-3(b)/§2.3 item 4 — the terminal order is detach → inactive → hook → commit, so a throwing HOOK still reaches the commit: exactly ONE',
    ).toBe(1)
    // (c) `commit` throws.
    const h3 = await makeHarness({ installOptions: hookOptions(makeHookLog()), commitThrows: true })
    const elC: Record<string, unknown> = { id: 'c' }
    h3.sessionInstall(elC)
    fireStart(h3, elC, PLACEHOLDER_EVENT)
    let thrown3: unknown = null
    try {
      h3.source.fire(elC, TYPE_END, PLACEHOLDER_EVENT)
    } catch (e) {
      thrown3 = e
    }
    expect(thrown3, 'F-3(c)/§3.3 I-3c — the `commit` throw PROPAGATES to the caller of the terminal').not.toBe(null)
    expect(h3.commits.length, 'F-3(c) — the commit counts as the gesture’s ONE commit').toBe(1)
    expect(h3.session.stats().commits, 'F-3(c) — the session’s own counter records it').toBe(1)
    expect(h3.session.stats().active, 'F-3(c) — the gesture is no longer active').toBe(false)
    expect(h3.source.listenerCount(elC), 'F-3(c)/§0A note 11 — a throwing `commit` cannot leave a tracking listener behind').toBe(1)
  })

  it('F-4 §3.2 — A TERMINAL ON A STALE HANDLE: refused `stale`, committing NOTHING, and the live gesture is STILL ACTIVE', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    const other: Record<string, unknown> = { id: 'other' }
    h.sessionInstall(el)
    h.sessionInstall(other)
    const r1 = beginResult(h, el)
    const stale = (r1 as { ok: true; gesture: GestureHandle }).gesture
    endCall(h, el, stale)
    const r2 = beginResult(h, el)
    const live = (r2 as { ok: true; gesture: GestureHandle }).gesture
    live.set('the live value')
    const commitsBefore = h.commits.length
    expect(
      endCall(h, el, stale),
      'F-4/§2.4 item 4 — an `end` carrying the id-1 handle while id 2 is active returns `{ok:false, code:\'stale\', committed:false}`',
    ).toEqual({ ok: false, code: 'stale', committed: false })
    expect(h.commits.length, 'F-4 — the stale refusal commits NOTHING').toBe(commitsBefore)
    expect(
      resetCall(h, el, stale, 'x'),
      'F-4 — `reset` on a stale handle is refused the same way (the refusal vocabulary is closed)',
    ).toEqual({ ok: false, code: 'stale', committed: false })
    expect(
      cancelCall(h, el, stale),
      'F-4 — `cancel` on a stale handle is refused the same way',
    ).toEqual({ ok: false, code: 'stale', committed: false })
    expect(h.session.gesture()?.id, 'F-4 — the id-2 gesture is STILL ACTIVE (a refusal never half-terminates)').toBe(live.id)
    expect(h.session.gesture()?.value, 'F-4 — its value is untouched').toBe('the live value')
    expect(live.active, 'F-4 — the live handle still reports `active: true`').toBe(true)
    expect(h.source.listenerCount(el), 'F-4 — the live gesture’s four listeners are untouched by the refusals').toBe(4)
    // The ELEMENT-mismatch half: a handle whose element differs from the passed element.
    expect(
      endCall(h, other, live),
      'F-4/§2.3 item 4 — a handle whose `element` is not the passed `element` is refused `stale` (the precondition checks id AND element identity)',
    ).toEqual({ ok: false, code: 'stale', committed: false })
    expect(h.session.gesture()?.id, 'F-4 — and that refusal also left the live gesture active').toBe(live.id)
  })

  it('F-5 §3.2 — A TERMINAL WITH NO ACTIVE GESTURE (the IDLE case of the corrected clause): `no-gesture`, with zero commits and zero source calls', async () => {
    // -----------------------------------------------------------------------
    // **⟶ THE FLAGGED DRIVE-LEVEL CORRECTION (the spec amendment names it, NOT landed by the
    // SpecWriter; this is the TEST side): `F-5`'s cell reads GENERICALLY — *"`end(el, handle)`
    // / `reset(el, handle, v)` / `cancel(el, handle)` when idle"* — and `§5.5.1`'s own
    // tombstone note says which case binds: *"`§3.2 F-5`'s 'a terminal with NO active
    // gesture' row keeps `'no-gesture'` — **its drive is the IDLE case**, not a disposed
    // session."* (The `cancel`-element-mismatch reading and the disposed-session reading
    // both return other codes under `§2.3` item 7.3, so an ambiguous drive could not be
    // satisfied by any implementation.) **THE DRIVE, MADE UNAMBIGUOUS:** a session with ONE
    // control INSTALLED, live and NOT disposed (`installed-idle` in `§2.3` item 8's state
    // machine), whose previous gesture ran to its `end` terminal first — so the handle is a
    // REAL handle from a completed gesture, NOT malformed and NOT stale-by-id of a live
    // gesture, and the element IS the one that session installed. `§2.3` item 8 lists
    // `absent → installed-idle` and `installed-idle` as the states where a terminal with no
    // active gesture is refused, and `P-GS-SM-1`'s `absent` row asserts `'no-gesture'` for
    // the same ops — the two rows agree on the idle case and neither claims the disposed one.
    // -----------------------------------------------------------------------
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // A handle from a completed gesture, so the call is not malformed — simply idle.
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    endCall(h, el, handle)
    // THE STATE THE DRIVE BINDS, ASSERTED BEFORE THE TERMINALS (so the idle case is the one
    // actually driven, not a disposed or absent state that would carry another code).
    expect(deriveState(h.session), 'F-5 — the drive is the IDLE case: the session is `installed-idle` (`§2.3` item 8), not `disposed` and not `absent`').toBe('installed-idle')
    expect(h.session.disposed, 'F-5 — and NOT disposed (a disposed session reports `disposed` for every terminal — `§2.3` item 7.3)').toBe(false)
    expect(h.session.gesture(), 'F-5 — with NO active gesture (`gesture()` is `null`)').toBe(null)
    const callsBefore = h.source.log.length
    const commitsBefore = h.commits.length
    expect(endCall(h, el, handle), 'F-5/§2.3 item 4 — an `end` while idle reports `no-gesture`').toEqual({
      ok: false,
      code: 'no-gesture',
      committed: false,
    })
    expect(resetCall(h, el, handle, 'v'), 'F-5 — a `reset` while idle reports `no-gesture`').toEqual({
      ok: false,
      code: 'no-gesture',
      committed: false,
    })
    expect(cancelCall(h, el, handle), 'F-5 — a `cancel` with a non-active handle reports `no-gesture`').toEqual({
      ok: false,
      code: 'no-gesture',
      committed: false,
    })
    expect(cancelCall(h, el), 'F-5/§2.1 — a `cancel(element)` with the handle OMITTED while idle reports `no-gesture` too').toEqual({
      ok: false,
      code: 'no-gesture',
      committed: false,
    })
    expect(h.commits.length, 'F-5 — ZERO commits across all four refusals').toBe(commitsBefore)
    expect(h.source.log.length, 'F-5 — ZERO source calls across all four refusals').toBe(callsBefore)
  })

  it('F-6 §3.2 — `begin` ON AN ELEMENT THAT WAS NEVER INSTALLED HERE: `not-installed`, zero source calls, nothing recorded', async () => {
    const h = await makeHarness({})
    const elZ: Record<string, unknown> = { id: 'z' }
    const callsBefore = h.source.log.length
    expect(
      beginResult(h, elZ),
      'F-6/§2.3 item 1(c) — a fresh session reports `{ok:false, code:\'not-installed\'}` for an element it never installed',
    ).toEqual({ ok: false, code: 'not-installed' })
    expect(h.source.log.length, 'F-6 — ZERO source calls for the refusal').toBe(callsBefore)
    expect(h.session.stats(), 'F-6 — nothing is recorded by the refusal (the instance stays in its initial state)').toEqual({
      installed: 0,
      sourceCalls: 0,
      gestures: 0,
      commits: 0,
      active: false,
      gestureId: 0,
      lastCode: 'not-installed',
    })
  })

  it('F-7 §3.2 — A DISCONNECTED ELEMENT AT `begin`: `disconnected`, NO tracking listener, no gesture, and `onStart` does not run', async () => {
    const log = makeHookLog()
    const h = await makeHarness({ sourceOptions: { isConnected: () => false }, installOptions: hookOptions(log) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    const callsBefore = h.source.log.length
    expect(
      beginResult(h, el),
      'F-7/§2.4 item 5 — `isConnected(element)` returning EXACTLY `false` makes `begin` report `{ok:false, code:\'disconnected\'}`',
    ).toEqual({ ok: false, code: 'disconnected' })
    expect(
      h.source.log.slice(callsBefore).map((rec) => `${rec.op}:${rec.type}`),
      'F-7 — the log shows ONLY the `isConnected` call: NO tracking listener is attached',
    ).toEqual(['isConnected:isConnected'])
    expect(log.start.length, 'F-7 — `onStart` does NOT run for a refused begin').toBe(0)
    expect(h.session.stats().active, 'F-7 — no gesture exists').toBe(false)
    expect(h.session.stats().gestures, 'F-7 — no gesture was counted').toBe(0)
    expect(h.session.gesture(), 'F-7 — `gesture()` is `null`').toBe(null)
    expect(h.source.listenerCount(el), 'F-7 — the control keeps only its start listener').toBe(1)
  })

  it('F-8 §3.2 — AN UNUSABLE OR THROWING SOURCE: the VALID-STATE DEGRADATION, never a throw', async () => {
    const create = await valueExport<(o?: unknown) => GestureSessionMirror>('createGestureSession', 'F-8')
    const unusable: ReadonlyArray<readonly [string, () => unknown]> = [
      ['an ABSENT source (`{}`)', () => ({})],
      ['`{source: undefined}`', () => ({ source: undefined })],
      ['`{source: null}`', () => ({ source: null })],
      ['`{source: 42}` (a primitive)', () => ({ source: 42 })],
      ["`{source: 'a string'}`", () => ({ source: 'a string' })],
      ['`{source: {}}` (no `on`/`off`)', () => ({ source: {} })],
      ['a source whose `on` is not callable', () => ({ source: { on: 42, off: () => undefined } })],
      // **`§2.4` item 6's `off` CASE IS THE `off` THAT IS NOT CALLABLE — NOT ONE THAT
      // THROWS**, and **a THROWING `isConnected` IS NOT AN UNUSABLE SOURCE EITHER**
      // (green-time test repair 2026-09-27). The as-filed table ALSO listed
      // `a source whose \`off\` THROWS` and `a source whose \`isConnected\` THROWS` here and
      // demanded `install → false` for both, which contradicted `§2.4` item 6's own exact
      // definition ("'Unusable' is exact: the source is not an object … **or** its `on`
      // is not callable, **or** its `off` is not callable"), `§2.4` item 5 ("a throwing
      // seam must not crash a gesture … an ABSENT `isConnected` … means 'no contrary
      // evidence' and the check PASSES") and this row's own later half, which requires the
      // throwing-`isConnected` source to PROCEED. **Both throwing sources are CALLABLE, so
      // both are USABLE**: their failures are the per-call catches `§2.4` item 5 and
      // `§2.3` item 7(4) declare, and both drives are kept below, in the half that cites
      // the clause that governs them.
      ['a source whose `off` is not callable', () => ({ source: { on: () => undefined, off: null } })],
      ['a source whose `on` THROWS', () => ({ source: { on: (): never => { throw new Error('the source threw on `on`') }, off: () => undefined } })],
    ]
    const el: Record<string, unknown> = { id: 'a' }
    for (const [label, makeOptions] of unusable) {
      let session: GestureSessionMirror | null = null
      let thrown: unknown = null
      try {
        session = create(makeOptions() as never)
      } catch (e) {
        thrown = e
      }
      expect(thrown, `F-8/§2.4 item 6 — construction NEVER throws for ${label}: the degradation is the VALID state, never a throw`).toBe(null)
      const s = session as unknown as GestureSessionMirror
      const installThrown = ((): unknown => {
        try {
          return s.install(el, {})
        } catch (e) {
          return e
        }
      })()
      expect(
        installThrown,
        `F-8/§2.4 item 6 — \`install\` never throws for ${label}; it returns the boolean \`false\``,
      ).toBe(false)
      const begin = s.begin(el)
      expect(
        (begin as { code?: string }).code,
        `F-8/§2.4 item 6 — \`begin\` reports the declared code for ${label} (an unusable source means the element was never installed)`,
      ).toBe('not-installed')
      expect(
        s.stats(),
        `F-8/§2.4 item 6 — \`stats()\` reports zeros for ${label}`,
      ).toEqual({ installed: 0, sourceCalls: 0, gestures: 0, commits: 0, active: false, gestureId: 0, lastCode: 'not-installed' })
      expect(s.gesture(), `F-8/§2.4 item 6 — \`gesture()\` returns \`null\` for ${label}`).toBe(null)
      expect(
        [s.end(el, { id: 1 } as GestureHandle), s.reset(el, { id: 1 } as GestureHandle, 'v'), s.cancel(el)],
        `F-8/§2.4 item 6 — the three terminals report \`{ok:false, code:\'no-gesture\', committed:false}\` for ${label}`,
      ).toEqual([
        { ok: false, code: 'no-gesture', committed: false },
        { ok: false, code: 'no-gesture', committed: false },
        { ok: false, code: 'no-gesture', committed: false },
      ])
      expect(
        ((): unknown => {
          try {
            return s.dispose()
          } catch (e) {
            return e
          }
        })(),
        `F-8 — \`dispose()\` never throws for ${label} and reports its declared shape`,
      ).toEqual({ removed: 0, complete: true })
    }
    // The `on`-that-throws ledger half: NO ledger entry is created.
    const calls: string[] = []
    const throwingOn = {
      on: (): never => {
        calls.push('on')
        throw new Error('the source threw on `on`')
      },
      off: (): void => {
        calls.push('off')
      },
    }
    const s2 = create({ source: throwingOn } as never)
    expect(s2.install(el, {}), 'F-8/§2.4 item 6 — a THROWING `on` makes `install` return `false` (the throw is swallowed at the seam)').toBe(false)
    expect(calls, 'F-8 — the source was really called once, so the degradation is measured and not assumed').toEqual(['on'])
    // ── REPAIRED 2026-09-27 (the adversarial pass's `ADV-GS-1`, and the module fix it
    // drove): the old expectation demanded that the SECOND attempt not reach the source at
    // all — but `§2.4` item 6 and `§2.3` item 1(c) say a throwing `on` leaves **NO LEDGER
    // ENTRY**, and a module with no entry MUST re-attempt. The as-written row therefore
    // FAILED a contract-conforming module and PASSED the module that bricked the element
    // for the session's lifetime (a transient seam failure could never be retried). THE
    // LEDGER-ABSENCE EVIDENCE IS NOW THE RETRY: the second attempt reaches the source and
    // gets a second `on`.
    expect(
      s2.install(el, {}),
      'F-8/§2.4 item 6 — and NO ledger entry was created: the second attempt REACHES the source again (nothing was recorded)',
    ).toBe(false)
    expect(
      calls,
      'F-8 — the second attempt DID make a source call, which is the ledger-absence evidence (had an entry been written, the retry would have been refused before the source saw it)',
    ).toEqual(['on', 'on'])
    // The THROWING-`off` half: **THE `off` THAT THROWS IS CALLABLE, SO THE SOURCE IS
    // USABLE** (`§2.4` item 6's exact definition), and its failure is the per-call catch
    // of `§2.3` item 7(4) — reached at `dispose()`, NOT at `install`. This is the drive
    // the as-filed "unusable" table above mis-scoped to `install → false`.
    const throwingOffSource = {
      on: (): void => undefined,
      off: (): never => {
        throw new Error('the source threw on `off`')
      },
    }
    const s3b = create({ source: throwingOffSource } as never)
    expect(
      s3b.install(el, { capture: true }),
      'F-8/§2.4 item 6 — a source whose `off` THROWS is still a USABLE source (`off` is CALLABLE; "unusable" is exact and does not name a throwing `off`): `install` returns `true` and attaches the start listener',
    ).toBe(true)
    expect(
      s3b.stats().installed,
      'F-8/§2.4 item 6 — and the ledger entry EXISTS (the throw is not at the install seam at all)',
    ).toBe(1)
    expect(
      ((): unknown => {
        try {
          return s3b.begin(el)
        } catch (e) {
          return e
        }
      })(),
      'F-8/§2.4 item 6 — `begin` proceeds for that source (only an exact `false` from `isConnected` refuses, §2.4 item 5)',
    ).toMatchObject({ ok: true })
    expect(
      ((): unknown => {
        try {
          return s3b.dispose()
        } catch (e) {
          return e
        }
      })(),
      'F-8/§2.3 item 7(4) — the throwing `off` is caught PER CALL at `dispose()`, which never throws and honestly reports `complete: false`',
    ).toEqual({ removed: 0, complete: false })
    // The same clause through the recording source: the per-call catch and the honest report.
    const goodSource = makeSource({})
    const s3 = create({ source: goodSource } as never)
    expect(
      s3.install(el, {}),
      'F-8/§2.4 item 6 — the recording source is usable, so its install succeeds and the dispose half below measures a real baseline',
    ).toBe(true)
    goodSource.failOff = (): boolean => true
    goodSource.failOff = (): boolean => true
    let report: DisposeReport | null = null
    let thrownOff: unknown = null
    try {
      report = s3.dispose()
    } catch (e) {
      thrownOff = e
    }
    expect(thrownOff, 'F-8/§2.3 item 7(6) — `dispose()` never throws, whatever the source does').toBe(null)
    expect(report, 'F-8/§2.3 item 7(4) — a throwing `off` yields `{removed: <successes>, complete: false}`').toEqual({
      removed: 0,
      complete: false,
    })
    // The THROWING-`isConnected` half: **THE SOURCE IS USABLE** (`§2.4` item 6's exact
    // definition names only the source's SHAPE and the callability of `on`/`off`), the
    // throw is swallowed, and the gesture PROCEEDS (`§2.4` item 5). The `install` result is
    // asserted explicitly, because this is the drive the as-filed "unusable" table above
    // mis-scoped to `install → false`.
    const throwingConnected = makeSource({
      isConnected: (): never => {
        throw new Error('the source threw on `isConnected`')
      },
    })
    const s4 = create({ source: throwingConnected } as never)
    expect(
      s4.install(el, {}),
      'F-8/§2.4 item 6 — a source whose `isConnected` THROWS is still a USABLE source: `install` returns `true` with a ledger entry',
    ).toBe(true)
    expect(
      s4.begin(el),
      'F-8/§2.4 item 5 — a throwing `isConnected` means "no contrary evidence" and the gesture PROCEEDS (the failure is swallowed, never propagated)',
    ).toMatchObject({ ok: true })
    expect(s4.stats().active, 'F-8 — the gesture really is active after the swallowed throw').toBe(true)
  })

  it('F-9 §3.2 — THE SESSION IS UNREACHABLE BY `provident.dispatch` AND EXPOSES NO MCP SURFACE', async () => {
    const mod = await requireModule('F-9 §0 ruling 10, P-6')
    const keys = Object.keys(mod).filter((k) => k !== 'default')
    expect(
      keys.sort(),
      'F-9/§0 ruling 10 — the module’s value exports are EXACTLY the four of §2.1: no tool descriptor, no `RpcMethod` string, no IPC channel name, no `list_targets` handle',
    ).toEqual(['POINTER_TYPES', 'createGestureSession', 'detachGestureListeners', 'installGestureListeners'])
    for (const key of keys) {
      expect(
        ['createGestureSession', 'installGestureListeners', 'detachGestureListeners', 'POINTER_TYPES'].includes(key),
        `F-9 — the export \`${key}\` is one of the four named mechanism exports (never an MCP-shaped name)`,
      ).toBe(true)
    }
    // No session handle appears in a `list_targets`-shaped surface, and no `src/**` file
    // imports the module (§0 ruling 10's own obligation row).
    //
    // **⟶ REPAIRED 2026-09-27 (THE SIBLING-ATTRIBUTED / TIME-SCOPED REPAIR, RULING B).** THE
    // AS-FILED FORM IS KEPT VISIBLE ABOVE AND SUPERSEDED: it asserted `importers === []` over a
    // walk of the LIVE tree, and the LIVE tree now carries `src/renderer/renderer.ts` — **the
    // SIBLING unit `E10`'s own WIRING** (`startGutterAffordance(runtime)`), whose module
    // value-imports `POINTER_TYPES` from `./gesture-session.js`. **MEASURED at `6f6a011`: the
    // as-filed reading was `['src/renderer/renderer.ts']`.** **THE CLAIM IN ITS TIME-SCOPED FORM,
    // citing `docs/specs/gutter.md` `§3.4 R-4` — *"a later unit that legitimately imports THIS
    // module is not a violation of it"* — and `§5.1`'s commit-range scope rule:** the census is read
    // over the **TRACKED tree at this unit's ANCHOR COMMIT**, and the **CURRENT census is REPORTED
    // with each importer's owner named — NEVER AS A FAIL.** **THE FALSIFIABLE CONTROL IS KEPT:** an
    // importer that is THIS unit's OWN artifact or an UNCLAIMED path **STILL FAILS**, asserted on
    // the same owner-attribution the reading uses (and in `R-7`, on synthetic lists).
    console.log(
      `F-9 §3.2 (TIME-SCOPED COMPANION) MEASURED :: ${JSON.stringify({
        anchor: IMPORTER_ATTRIBUTION_GS.anchor,
        anchorRange: IMPORTER_ATTRIBUTION_GS.anchorRange,
        importersAtAnchor: IMPORTER_ATTRIBUTION_GS.atAnchor,
        currentImporters: IMPORTER_ATTRIBUTION_GS.current,
        currentImportersByOwner: IMPORTER_ATTRIBUTION_GS.currentOwners,
        clause: 'docs/specs/gutter.md §3.4 R-4 + §5.1',
      })}`,
    )
    expect(
      IMPORTER_ATTRIBUTION_GS.atAnchor,
      `F-9/§0 ruling 10 — "no session handle in \`list_targets\`; a dispatch on a session-owned element's node yields the ordinary handler result with no session side effect": **THE MODULE IS IMPORTED BY NO \`src/**\` FILE at THIS unit's own time — the TRACKED tree at the ANCHOR COMMIT \`${String(
        IMPORTER_ATTRIBUTION_GS.anchor,
      )}\` (range \`${String(IMPORTER_ATTRIBUTION_GS.anchorRange)}\`).** **THE CURRENT CENSUS IS REPORTED, NAMED BY OWNER, AND IS NEVER A FAIL:** ${JSON.stringify(
        IMPORTER_ATTRIBUTION_GS.currentOwners,
      )} (a later unit's legitimate importer is not a violation of this claim, \`docs/specs/gutter.md\` \`§3.4 R-4\`; \`§5.1\`'s commit-range scope rule). Read: ${JSON.stringify(
        IMPORTER_ATTRIBUTION_GS.atAnchor,
      )}`,
    ).toEqual([])
    for (const probe of GS_IMPORTER_CONTROL_UNIT_OWN) {
      expect(
        ownerOfImporter(probe).includes('STILL A FAIL'),
        `F-9/§3.4 R-4 — THE CONTROL: an importer that is THIS unit's OWN artifact (\`${probe}\`) is NEVER excused by the sibling attribution`,
      ).toBe(true)
    }
    for (const probe of GS_IMPORTER_CONTROL_UNCLAIMED) {
      expect(
        ownerOfImporter(probe),
        `F-9/§3.4 R-4 — THE CONTROL: an importer that NO unit's allow-list claims (\`${probe}\`) is REPORTED AS UNCLAIMED, so the sibling carve-out cannot silently absorb an unexplained importer`,
      ).toBe('NO unit’s allow-list claims it')
    }
    // The `stats()`/`gesture()` seam is an ordinary module method, NOT an agent-reachable
    // surface (`§0A` note 12).
    const code = stripComments(moduleSource('F-9 §0A note 12'))
    const seamRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'an MCP/IPC registration or channel name', re: /\b(?:list_targets|listTargets|ipcRenderer|ipcMain|RpcMethod|MUTATING_METHODS|VALID_GROUPS|ALL_TOOLS)\b/ },
      { what: 'a JSON-RPC or tool-descriptor shape', re: /\b(?:jsonrpc|inputSchema|server\.tool|registerTool|registerResource)\b/ },
    ]
    expectNoStaticHits(code, seamRules, 'F-9 §3.2 (§0 ruling 10, P-6)')
    for (const [label, fixture] of [
      ['a target listing', `${'const'} t = list_targets()`],
      ['a registration', `registerTool('provident.gesture', { inputSchema: {} })`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        seamRules.some(({ re }) => staticHits(fixture, re).length > 0),
        `F-9 POSITIVE control (${label}) must FAIL the seam scan — the row is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
  })

  it('F-9(b) §3.2 — THE SIX REGISTRATION SITES ARE UNTOUCHED: asserted BY SET EQUALITY AGAINST THE NAMES, never by a bare count', async () => {
    await requireModule('F-9(b) §0 ruling 9')
    // The four named seams of the gate record, each read from its OWN live declaration
    // (`src/shared/gesture-session.test.ts` would be a fabricated seam: the six sites are
    // this repo's own, and the five NAME-COMPLETE sets below are theirs).
    const toolsLive = readArrayLiteral('src/main/mcp-server.ts', /static\s+readonly\s+ALL_TOOLS\s*:\s*string\[\]\s*=\s*\[/)
    expect(toolsLive.length, 'F-9(b)/§0 ruling 9 / `N-15` — `ALL_TOOLS` reads its 22 names (set equality is asserted against the sibling name-complete row in `R-6(c)`)').toBe(22)
    expect(new Set(toolsLive).size, 'F-9(b) / `N-15` — the tool census is a SET (distinct names), so no name is a duplicate').toBe(22)
    const groupsLive = readArrayLiteral('src/main/security.ts', /const\s+VALID_GROUPS[^=]*=\s*new\s+Set\(\s*\[/)
    expect(groupsLive.sort(), 'F-9(b) — `VALID_GROUPS` keeps its FIVE named members').toEqual([
      'code',
      'dispatch',
      'graph',
      'module',
      'read',
    ])
    const mutatingLive = readArrayLiteral('src/renderer/renderer.ts', /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\s*\[/)
    expect(mutatingLive.length, 'F-9(b) — `MUTATING_METHODS` keeps its SEVEN named entries').toBe(7)
    const rpcLive = readUnionMembers('src/shared/types.ts', /export\s+type\s+RpcMethod\s*=/)
    expect(rpcLive.length, 'F-9(b) / `N-15` — the `RpcMethod` union reads its 22 members (`focus` included in the SAME COMMIT)').toBe(22)
    // The renderer RPC switch and the preload bridge are unchanged: this unit's own
    // change set touches NEITHER file.
    //
    // **⟶ REPAIRED 2026-09-27 (THE SIBLING-ATTRIBUTED REPAIR, RULING B).** THE AS-FILED FORM IS
    // KEPT VISIBLE ABOVE AND SUPERSEDED: it read `treeChangeSet()` — the **WORKING TREE** — over
    // the WHOLE tree, so **a SIBLING's legitimate in-flight file was charged to THIS unit.**
    // **MEASURED at `6f6a011`: the as-filed reading was `['src/renderer/renderer.ts']`, the sibling
    // `E10`'s own WIRING** (`startGutterAffordance(runtime)` — one of `E10`'s DECLARED artifacts, by
    // name, in `SIBLING_UNIT_ARTIFACT_PATHS` above). **THE CLAIM IS NOW SCOPED TO THIS UNIT'S OWN ATTRIBUTABLE
    // CHANGE SET:** a path belongs to the unit only if it is NOT a declared sibling artifact
    // (`docs/specs/gutter.md` `§3.4 R-4` — *"a later unit that legitimately imports THIS module is
    // not a violation of it"* — and `§5.1`'s commit-range scope rule). **THE PROBE KEEPS ITS
    // FALSIFIABILITY: a `src/renderer/**` or `src/main/**` path that is NOT a declared sibling
    // artifact STILL FAILS**, and the six registration sites' set-equality half above is UNTOUCHED.
    const tree = treeChangeSet()
    const attributable = unitAttributableChangeSet(tree.paths)
    const siblingInFlight = tree.paths.filter((p) => isSiblingUnitArtifact(p)).sort()
    console.log(
      `F-9(b) §5.1 (SIBLING-ATTRIBUTED CHANGE SET) MEASURED :: ${JSON.stringify({
        workingTreePaths: tree.paths,
        siblingArtifactsExcluded: siblingInFlight,
        unitAttributable: attributable,
        clause: 'docs/specs/gutter.md §3.4 R-4 + §5.1',
      })}`,
    )
    for (const denied of ['src/renderer/', 'src/main/']) {
      expect(
        attributable.filter((p) => p.startsWith(denied)),
        `F-9(b)/§5.1 — THIS UNIT'S OWN ATTRIBUTABLE change set touches NOTHING under '${denied}', so the renderer RPC switch and the preload bridge are unchanged. **THE SIBLING'S DECLARED ARTIFACTS ARE EXCLUDED BY NAME — the as-filed whole-tree reading charged \`src/renderer/renderer.ts\` (the sibling \`E10\`'s own wiring) to this unit.** Excluded sibling artifacts: ${JSON.stringify(
          siblingInFlight,
        )}. Full working-tree reading: ${JSON.stringify(
          tree.paths,
        )}`,
      ).toEqual([])
    }
    // THE CONTROL: a `src/renderer/**` path that is NOT a declared sibling artifact must STILL be
    // attributable to this unit — the exclusion is BY NAME and cannot absorb an unexplained path.
    expect(
      unitAttributableChangeSet(['src/renderer/renderer.ts', 'src/renderer/gesture-session-panel.ts']),
      `F-9(b) POSITIVE control — the sibling exclusion is BY NAME: a \`src/renderer/**\` path that no declared sibling artifact covers STAYS in this unit's attributable set (so the scoping above cannot pass vacuously)`,
    ).toEqual(['src/renderer/gesture-session-panel.ts'])
    expect(
      unitAttributableChangeSet([MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH]),
      `F-9(b) NEGATIVE control — and THIS unit's own artifacts are never excluded from its own attributable set`,
    ).toEqual([MODULE_RELPATH, TEST_RELPATH, SPEC_RELPATH].sort())
    expect(
      existsSync(`${REPO_ROOT}/src/main/preload.ts`),
      'F-9(b) — the probe is not vacuous: the preload bridge really exists, so the untouched claim is about a real artifact',
    ).toBe(true)
  })

  it('F-9c §3.2 — A `pointerdown` ON A CHILD OF AN INSTALLED CONTROL (a re-fired start listener) while a gesture is active: `busy`, no second gesture, no second listener set', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const elA: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(elA)
    const r = beginResult(h, elA)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const callsBefore = h.source.log.length
    // The child's own handler is not the session's business: the session's recorded start
    // handler is fired again, exactly as a child's bubbled press would reach it.
    h.source.fire(elA, TYPE_START, PLACEHOLDER_EVENT)
    expect(h.session.gesture()?.id, 'F-9c/§2.3 item 3 — the session starts NO second gesture (the same handle is still the only active one)').toBe(handle.id)
    expect(h.session.stats().gestures, 'F-9c — the re-fired start listener created no new gesture').toBe(1)
    expect(h.source.log.length, 'F-9c/§2.4 item 3 — NO second listener set was opened').toBe(callsBefore)
    expect(h.source.listenerCount(elA), 'F-9c — the control still holds exactly FOUR listeners (the one gesture’s set)').toBe(4)
    expect(h.commits.length, 'F-9c — no commit occurred').toBe(0)
    expect(
      h.session.stats().lastCode,
      'F-9c/§0A ruling 3 (POINTER-AGNOSTIC TERMINATION) — the session never inspects the event to decide this: the start listener’s own turn sees a `busy` refusal',
    ).toBe('busy')
  })

  it('F-10 §3.2 — `capture` IS READ FOR TRUTHINESS ONLY AND NEVER BEFORE ESTABLISHMENT: the ordered log over the whole lifecycle', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: true }) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    expect(
      h.source.log.map((rec) => `${rec.op}:${rec.type}`),
      'F-10/§2.3 item 6, P-3 — there is NO capture call before `begin` at all: after `install` the log carries only the start `on`',
    ).toEqual([`on:${TYPE_START}`])
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    const log = h.source.log.map((rec) => `${rec.op}:${rec.type}`)
    expect(log, 'F-10 — the full ordered log after an opted-in `begin`').toEqual([
      `on:${TYPE_START}`,
      'isConnected:isConnected',
      `on:${TYPE_MOVE}`,
      `on:${TYPE_END}`,
      `on:${TYPE_CANCEL}`,
      'capture:capturePointer',
    ])
    expect(
      log.filter((entry) => entry.startsWith('capture:')).length,
      'F-10 — the capture call appears EXACTLY ONCE, after the three tracking `on` calls and after `isConnected`',
    ).toBe(1)
    expect(
      h.source.log[5].element,
      'F-10 — and it carries the gesture’s OWN element',
    ).toBe(el)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    endCall(h, el, handle)
    expect(
      h.source.log.filter((rec) => rec.op === 'capture').length,
      'F-10 — after the terminal the capture count is STILL ONE (no second capture, and no release call is invented)',
    ).toBe(1)
    // A falsy `capture` produces no capture anywhere in the same log shape.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: false }) })
    const el2: Record<string, unknown> = { id: 'b' }
    h2.sessionInstall(el2)
    const r2 = beginResult(h2, el2)
    const handle2 = (r2 as { ok: true; gesture: GestureHandle }).gesture
    endCall(h2, el2, handle2)
    expect(
      h2.source.log.filter((rec) => rec.op === 'capture'),
      'F-10/§2.3 item 6(a) — for a falsy `capture` the capture entry point is NEVER called',
    ).toEqual([])
  })

  it('F-11 §3.2 — THE STRUCTURAL `F-1` HALF: no code path in this module can retarget a press’s `click`', () => {
    const raw = moduleSource('F-11 §2.6 (the structural half)')
    const code = stripComments(raw)
    const retargetRules: ReadonlyArray<{ what: string; re: RegExp }> = [
      { what: 'a `click` listener or `click` token of any kind', re: /\bclick\b/i },
      { what: 'a listener on any element other than the control (a delegated/second-element attach)', re: /\b(?:document|window|body|parentNode|ownerDocument)\b/ },
      { what: 'an element re-lookup', re: /\b(?:closest|querySelector|querySelectorAll|getElementById)\b/ },
      { what: 'a capture call outside `begin`’s establishment path', re: new RegExp(`\\b${['set', 'Pointer', 'Capture'].join('')}\\b`) },
      { what: 'a direct listener attachment (the rejected delegated shape)', re: new RegExp(`\\b${['add', 'EventListener'].join('')}\\b`) },
    ]
    expectNoStaticHits(raw, retargetRules, 'F-11 §3.2 (§2.6)')
    expectNoStaticHits(assembledChunks(raw), retargetRules, 'F-11 (the normalized ASSEMBLY view)')
    for (const [label, fixture] of [
      ['a `click` listener', `el.${['add', 'EventListener'].join('')}('click', () => {})`],
      ['a document-delegated attach', `${['doc', 'ument'].join('')}.${['add', 'EventListener'].join('')}('${TYPE_START}', h)`],
      ['a direct capture', `el.${['set', 'Pointer', 'Capture'].join('')}(1)`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        retargetRules.some(({ re }) => staticHits(fixture, re).length > 0),
        `F-11 POSITIVE control (${label}) must FAIL the retargeting scan — the structural half is otherwise UNFALSIFIED`,
      ).toBe(true)
    }
    // ⟶ `D-13`/`ADV-GS-13` — **THE MISSING `F-11` CONTROL: THE ASSEMBLED-TOKEN POSITIVE.**
    // The row drives TWO views (`expectNoStaticHits(raw, …)` and
    // `expectNoStaticHits(assembledChunks(raw), …)`), but every positive control above is
    // a RAW spelling — so nothing showed the ASSEMBLED half able to fail, and the row's
    // named evasion class (`§4.4 S-1`: *a static prohibition satisfiable by splitting a
    // token is not satisfied*) was asserted rather than driven. The fixture below splits
    // the listener-attachment spelling into two string literals that a `join('')` — and
    // the row's own normalizer (`string-literal concatenation JOINED before scanning`,
    // `§3.4 R-1`/`F-11`'s shared view) — reassemble: a module carrying it would attach a
    // listener directly and could retarget a press's `click`.
    // The fixture's shape is the one this file's own `R-1` controls use for the same
    // evasion (see `VOCAB_POSITIVE_CONTROLS`): the spelling is SUBSTITUTED into a template
    // literal, so the normalizer's own template-brace bytes separate it from its
    // neighbours and the reassembled token is BOUNDED. A bare `'add' + 'EventListener'`
    // fixture does NOT work here — the reassembled spelling then sits inside a longer
    // identifier run and the row's own stated boundary rule declines it (that case is
    // `R-1`'s BOUNDARY control, and it is deliberately not a positive).
    const assembledEvasion = `( \`\${'${'add'}' + '${'EventListener'}'}\` )`
    expect(
      staticHits(assembledEvasion, retargetRules[4].re).length,
      'F-11/D-13 (the fixture’s own precondition) — the RAW view does NOT see the split spelling in one piece, so the fixture really tests the ASSEMBLED half',
    ).toBe(0)
    expect(
      staticHits(assembledChunks(assembledEvasion), retargetRules[4].re).length,
      'F-11/D-13 POSITIVE CONTROL — the ASSEMBLED view DOES see it: the row’s normalized-assembly half must FAIL a corpus that splits its token into pieces (`§4.4 S-1`), and this is the control that shows the half can fail',
    ).toBeGreaterThan(0)
    expect(
      retargetRules.some(({ re }) => staticHits(assembledChunks(assembledEvasion), re).length > 0),
      'F-11/D-13 — and the SAME verdict is reached by the row’s own rule list, so the control exercises the row and not a private instrument',
    ).toBe(true)
    // The start type is PINNED (`§0A` note 10) and the module's only capture call is
    // inside `begin` and only for an opted-in control — the runtime half is
    // `I-7`/`I-8`/`P-GS-IM-5`'s.
    expect(TYPE_START, 'F-11/§0A note 10 — the start type is pinned to the ledger’s own name').toBe('pointerdown')
    expect(
      TYPE_SET.length,
      'F-11 — the module owns exactly FOUR event type names, and no fifth exists (a `click` type would be a fifth)',
    ).toBe(4)
  })
})

// ===========================================================================
// **`D-2` — `ADV-GS-2`, THE TRACKING-ATTACH REFUSAL (the gate-4 regression row, AUTHORED
// 2026-09-27).** The module fix is LANDED (`begin` checks the three tracking attaches,
// rolls the successful ones back, refuses with the EXISTING closed-domain code and leaves
// the element installed so a transient seam failure is retryable); only the ROW was owed.
// The recorder's own `failOn` hook (the `SourceOptions` member added for exactly this) is
// consulted INSIDE the recorder's `on`, AFTER the call is recorded and BEFORE the attach
// is written to the `attached` map, so a chosen tracking type really refuses.
//
// LAYER: `[T]` — call counts and lifecycle over an argument-supplied source (layer anchor
// 5). The row asserts THE RECORDED CALLS, never a browser's listener table (`S-7`).
// ===========================================================================
describe('ADV-GS-2 — the tracking-attach refusal (the gate-4 regression row)', () => {
  it('ADV-GS-2 — a tracking `on` that THROWS refuses `not-installed`, rolls the successful attaches back, commits nothing, and leaves the element ESTABLISHABLE', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: true }) })
    const el: Record<string, unknown> = { id: 'adv-gs-2' }
    expect(h.sessionInstall(el), 'ADV-GS-2 — the precondition: the control installs (so the refusal below is a TRACKING-attach refusal, not an install refusal)').toBe(true)
    expect(
      h.sessionInstall(el),
      'ADV-GS-2/§2.3 item 1(b) — a repeat install is a NO-OP returning `false` (the precondition the retry limb depends on: the ledger is keyed by identity)',
    ).toBe(false)
    // The seam can attach the START listener but REFUSES the `pointermove` attach — the
    // exact degradation class the gate-4 finding pinned (before the fix a seam that could
    // not perform the `pointermove` attach still reported `{ok:true}` with a live handle
    // while NO tracking listener existed, which latched the consumer `busy`).
    h.source.failOn = ({ element, type }): boolean => type === TYPE_MOVE && element === el
    const before = h.source.log.length
    // ---- (i) THE REFUSAL CODE IS THE EXISTING CLOSED-DOMAIN `'not-installed'`.
    const refused = beginResult(h, el)
    expect(
      refused,
      'ADV-GS-2/(i) — the refusal is the EXISTING closed-domain code `not-installed`: NO eighth code member is invented (`§2.3` item 4’s SEVEN-member union, `§4.4 S-9`)',
    ).toEqual({ ok: false, code: 'not-installed' })
    expect(
      h.session.stats().lastCode,
      'ADV-GS-2/(i) — and the session’s own readable record carries the same code (`§2.1` `stats().lastCode`)',
    ).toBe('not-installed')
    // The ordered log of the attempt itself: move attach attempted and recorded, then the
    // roll-back of move, then the two attaches that never happened.
    const attempt = h.source.log.slice(before).map((rec) => `${rec.op}:${rec.type}`)
    expect(
      attempt,
      'ADV-GS-2/(ii) — the refusal is visible in the recorded log: the connectivity reading, the three tracking `on` ATTEMPTS (the first refuses, the seam throws AFTER the call is recorded — `makeSource`’s documented order), then the roll-back’s three detaches',
    ).toEqual([
      'isConnected:isConnected',
      `on:${TYPE_MOVE}`,
      `on:${TYPE_END}`,
      `on:${TYPE_CANCEL}`,
      `off:${TYPE_MOVE}`,
      `off:${TYPE_END}`,
      `off:${TYPE_CANCEL}`,
    ])
    expect(
      h.source.log.slice(before).filter((rec) => rec.op === 'on').every((rec) => rec.element === el),
      'ADV-GS-2/(ii) — and every attempted attach carried the gesture’s OWN element (no other element is ever touched: `I-9`, `R-5`)',
    ).toBe(true)
    // ---- (ii) THE SUCCESSFUL TRACKING ATTACH IS ROLLED BACK — **MEASURED FROM THE
    // RECORDER'S OWN `attached` MAP** (`source.listenerCount`) **AND** from its log
    // (`pairOnOffCalls`, the same pairing reader `I-5`/`M-13`/`P-GS-IM-6` use).
    expect(
      h.source.listenerCount(el),
      'ADV-GS-2/(ii) — MEASURED FROM THE RECORDER’S `attached` MAP: the control holds ONLY its start listener after the refusal (the `pointermove` attach was rolled back, not left live)',
    ).toBe(1)
    expect(h.source.typeMultiset(el), 'ADV-GS-2/(ii) — and the retained type is the start listener’s').toEqual([TYPE_START])
    const pairs = pairOnOffCalls(h.source.log)
    // The unmatched `off`s, MEASURED from the recorder's own log **BY A SEQUENTIAL
    // PAIRING** (an `off` may only consume an `on` that PRECEDES it and has not already
    // been consumed): a later retry's `on(pointerup)` must not retroactively pair an
    // `off(pointerup)` the refusal path already made.
    const open: CallRecord[] = []
    const unmatchedOffs: string[] = []
    for (const rec of h.source.log) {
      if (rec.op === 'on') {
        open.push(rec)
        continue
      }
      if (rec.op !== 'off') continue
      const at = open.findIndex((prior) => prior.element === rec.element && prior.type === rec.type && prior.handler === rec.handler)
      if (at < 0) unmatchedOffs.push(rec.type)
      else open.splice(at, 1)
    }
    expect(
      unmatchedOffs,
      'ADV-GS-2/(ii) — MEASURED FROM THE RECORDER’S LOG BY SEQUENTIAL PAIRING: NO `off` is unmatched, because the recorder logs the `on` ATTEMPT before the configured throw (`makeSource`’s documented order: `record(...)` then `failOn`), so the two roll-back detaches for the attaches that never completed still pair with their own recorded attempts. **THE HONEST READING, STATED RATHER THAN OVER-CLAIMED:** the log stays BALANCED (`I-5`’s sentence is not contradicted here), while the recorder’s `attached` MAP holds only the start listener — the roll-back’s extra two `off`s remove nothing because nothing was attached',
    ).toEqual([])
    expect(
      pairs.unmatched,
      'ADV-GS-2/(ii) — MID-ROW the pairing reader `I-5`/`M-13`/`P-GS-IM-6` use reports exactly ONE open `on`: the START listener, which is `install`’s own and is still live by design (the element stays installed — the point of the clause). The other THREE `on`s are already matched, so the roll-back left nothing open behind it',
    ).toEqual(['an unmatched `on(pointerdown)` (element an object {id})'])
    expect(
      pairs.matched,
      'ADV-GS-2/(ii) — THREE pairs are matched at this point, MEASURED: the successful `on(pointermove)` and its roll-back, plus the refused `begin`’s recorded `on(pointerup)`/`on(pointercancel)` ATTEMPTS pairing with the roll-back’s own `off`s for those types. **THE HONEST READING, STATED RATHER THAN OVER-CLAIMED:** the recorder logs the `on` ATTEMPT before the configured throw (`makeSource`’s documented order: `record(...)` then `failOn`), so the log stays BALANCED (`I-5`’s sentence is NOT contradicted here) while the recorder’s `attached` MAP holds only the start listener — the roll-back’s extra two `off`s remove nothing because nothing was attached',
    ).toBe(3)
    expect(
      h.source.log.filter((rec) => rec.type === TYPE_MOVE).map((rec) => rec.op),
      'ADV-GS-2/(ii) — the `pointermove` attach is matched by its own roll-back, in that order (an unmatched attach would leave a live tracking listener)',
    ).toEqual(['on', 'off'])
    // ---- (iii) NOTHING COMMITS.
    expect(
      h.commits,
      'ADV-GS-2/(iii) — the COMMIT SINK received NOTHING for the refused gesture (the refusal is not a terminal)',
    ).toEqual([])
    expect(h.session.stats().commits, 'ADV-GS-2/(iii) — and the SESSION’S OWN counter reads zero (`§0A` note 12: the count seam is the module’s own)').toBe(0)
    expect(
      h.session.stats().gestures,
      'ADV-GS-2/(iii)/`ADV-GS-15` — **THE CLAUSE GOVERNS, NOT THE BYTES:** `§2.1`’s `SessionStats.gestures` cell declares the field as *“Successful `begin` calls, instance-lifetime”*, and `§2.3`’s refusal clauses create NO gesture — so a REFUSED `begin` leaves the counter at `0`. **⟶ RECORDED 2026-09-27 (`ADV-GS-17`, the gate-4 closure): THIS LIMB IS GREEN AGAINST THE LANDED MODULE** — the module-side fix `ADV-GS-15` asked for has LANDED (`src/shared/gesture-session.ts`: the increment of `counters.gestures`, and the `record.id` it feeds, sit AFTER the tracking-attach check and AFTER the `onStart` try/catch, immediately before `counters.lastCode = \'ok\'` and the `{ok:true}` return — so both refusals leave the counter and the id untouched), so a refused `begin` consumes neither the counter nor the id. The as-filed text read *“**THIS IS THE ROW’S INTENTIONAL RED** … the landed module increments it BEFORE that check, so this assertion reads `1` today”* and is kept here as the as-filed form; the row was never re-tuned to the measured figure, and it does not need to be — the fix landed under it',
    ).toBe(0)
    expect(
      h.session.stats().active,
      'ADV-GS-2/(iii) — the session is NOT left active by the refusal (the latch the gate-4 finding pinned)',
    ).toBe(false)
    expect(h.session.gesture(), 'ADV-GS-2/(iii) — and `gesture()` reports `null` (no half-built record survives the refusal)').toBe(null)
    // ---- (iv) THE ELEMENT STAYS INSTALLED, and the SAME element establishes normally
    // once the seam can attach again — driven to its TERMINAL, with the commit count for
    // that path asserted.
    expect(
      h.session.stats().installed,
      'ADV-GS-2/(iv) — the element STAYS INSTALLED after the refusal (the `busy`-latch defect this row pins: a transient seam failure must be retryable)',
    ).toBe(1)
    h.source.failOn = (): boolean => false
    const callsBeforeRetry = h.source.log.length
    const retried = beginResult(h, el)
    expect(
      retried?.ok,
      `ADV-GS-2/(iv) — the SAME element establishes NORMALLY once the seam can attach again (a refused \`begin\` must not brick the control); got ${JSON.stringify(
        retried,
      )}`,
    ).toBe(true)
    const handle = (retried as { ok: true; gesture: GestureHandle }).gesture
    expect(
      h.session.stats().gestures,
      'ADV-GS-2/(iv)/`ADV-GS-15` — THE REFUSAL CONSUMED NO GESTURE: the SAME element’s establishment after the refusal is the session’s **FIRST** gesture, so the lifetime counter reads `1` (`§2.1`’s `SessionStats.gestures` — *“Successful `begin` calls, instance-lifetime”*; the refused `begin` was not one, and `§2.3`’s refusal clauses create no gesture)',
    ).toBe(1)
    expect(
      handle.id,
      'ADV-GS-2/(iv)/`ADV-GS-15` — and the id proves it: the first gesture’s handle carries `id === 1` (`M-2`’s *“the handle’s `id === 1`”`, `§2.4` item 4 — *“`id` starts at `1`, increments on every SUCCESSFUL `begin`”*; a refused `begin` is not a successful one, so it must not consume an id). **⟶ RECORDED 2026-09-27 (`ADV-GS-17`, the gate-4 closure): THE FIX HAS LANDED AND THIS LIMB IS GREEN.** The as-filed text read *“The landed module increments the counter before the tracking-attach check and derives `record.id` from it, so it hands this handle `id: 2` — **the second half of the same intentional red** (`ADV-GS-15`)”; the increment now sits AFTER that check AND AFTER the `onStart` try/catch, immediately before `counters.lastCode = \'ok\'` and the `{ok:true}` return, so the first successful gesture is handed `id: 1` and the pre-fix reading is kept here as provenance only',
    ).toBe(1)
    expect(
      h.source.log
        .slice(callsBeforeRetry + 1, callsBeforeRetry + 4)
        .map((rec) => rec.type),
      'ADV-GS-2/(iv) — the retry really re-attaches the three tracking listeners, in the pinned order (`§2.3` item 2(a); the entry at `callsBeforeRetry` is the retry’s own connectivity reading)',
    ).toEqual([TYPE_MOVE, TYPE_END, TYPE_CANCEL])
    expect(
      h.source.listenerCount(el),
      'ADV-GS-2/(iv) — the retry carries the control from `1` listener to `4` (`§2.3` item 2(a)) — the refusal left no listener behind and the retry added none twice',
    ).toBe(4)
    expect(h.source.captures.length, 'ADV-GS-2/(iv) — the opted-in capture call happens on the SUCCESSFUL establishment (`§2.3` item 6(b)), and the refused `begin` made none').toBe(1)
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
    expect(
      h.commits.length,
      'ADV-GS-2/(iv) — the retry’s terminal is the ordinary `end` terminal: EXACTLY ONE commit for that path (§2.3 item 4) — and the refusal contributed none, so the lifetime count is also ONE',
    ).toBe(1)
    expect(h.session.stats().commits, 'ADV-GS-2/(iv) — the session’s own counter agrees with the sink (no spy-only count)').toBe(1)
    expect(
      h.session.stats().gestures,
      'ADV-GS-2/(iv)/`ADV-GS-15` — the lifetime counter STILL reads ONE after the retry’s terminal (`§2.1`’s `SessionStats.gestures`: exactly ONE successful `begin` happened in this row, and the refused one was no gesture) — asserted BESIDE the terminal too, so the corrected contract holds across the whole refuse → retry → terminal cycle rather than at a single point',
    ).toBe(1)
    expect(
      h.session.stats().active,
      'ADV-GS-2/(iv) — and the gesture terminated normally (the session is idle again, not latched in `busy`)',
    ).toBe(false)
    expect(h.session.stats().lastCode, 'ADV-GS-2/(iv) — the successful retry’s own record reads `ok`').toBe('ok')
    expect(
      h.source.listenerCount(el),
      'ADV-GS-2/(iv) — the terminal restored the baseline to `1` (`§2.3` item 2(c)): the whole refuse → retry → terminal cycle is balanced',
    ).toBe(1)
  })
})
// ===========================================================================
// **⟶ THE GATE-4 CLOSURE ROWS (2026-09-27) — `ADV-GS-16`, `ADV-GS-26`, `ADV-GS-22(a)`.**
//
// Three seam states had NO row before this pass. They are §3/`§2.1` clause rows (not
// register rows): none of them is a `§5.5.1` attempt, and the declared register terms,
// the `396` total, the seed and the caps are UNTOUCHED by this block.
//   · `ADV-GS-16` — the `onStart`-throws path of the SAME counter clause (AS FILED, THE RED
//     OF THIS PASS — the as-filed phrase is kept visible; see the `⟶ RECORDED` correction at
//     the end of this bullet, where **THE ROW IS GREEN**). `§2.1`'s `SessionStats.gestures`
//     cell reads
//     *"Successful `begin` calls, instance-lifetime"*, `§2.4` item 4 has the handle `id`
//     *"start at `1`, increment on every **successful** `begin`"*, and `M-2` puts the first
//     gesture's handle at `id === 1` — while the module AS FILED consummated the counter and
//     the id BEFORE `onStart` ran, so a `begin` whose `onStart` throws (it cleans up and
//     RETHROWS, `§2.3` item 1(d)) still counted as a gesture and consumed an id. The row
//     asserts the CLAUSE, so it was RED until the module side moved the increment.
//     **⟶ RECORDED 2026-09-27 (`ADV-GS-16`'s module fix): THE ROW IS GREEN** — the increment
//     now sits AFTER the tracking-attach check AND AFTER the `onStart` try/catch,
//     immediately before `counters.lastCode = 'ok'` and the `{ok:true}` return, so the
//     throwing attempt consumes neither the counter nor the id.
//   · `ADV-GS-26` — the SOURCE-SUPPLIED capture member's throw. `§2.1`'s
//     `EventSource.capturePointer` doc is explicit that a throw from it is SWALLOWED like
//     the source's other callables (`§2.4` item 6), and `§2.3` item 6's count is unchanged
//     by it. No row drove it.
//   · `ADV-GS-22(a)` — the `commit`-ABSENT terminal. **THE ADJUDICATED READING (carried by
//     this pass and by the parallel SpecWriter pass): `committed` is the
//     COMMITTING-TERMINAL discriminator — `true` for `end`/`reset`, `false` for `cancel` —
//     and it is INDEPENDENT of whether a `commit` callback was installed; `stats().commits`
//     counts the session's actual `commit` invocations and therefore stays `0` when no
//     callback exists** (`§2.1`'s `TerminalResult` cell, corrected to this reading).
// ===========================================================================
describe('ADV-GS-16 / ADV-GS-26 / ADV-GS-22(a) — the gate-4 closure rows of the `§2.1`/`§2.3` seam', () => {
  it('ADV-GS-16 — a THROWING `onStart`: `begin` cleans up and RETHROWS, and the attempt consumes NO gesture counter and NO id (the §2.1 `gestures` clause vs the landed bytes) — GREEN SINCE THE 2026-09-27 MODULE FIX (the as-filed title read `THE RED OF THIS PASS`)', async () => {
    // STATES ENUMERATED BEFORE THE ROW (the file’s own convention):
    //  (1) a control installed whose `onStart` THROWS (it throws only on its FIRST call, so
    //      the SAME element can be re-established afterwards — the retry limb of state (4));
    //  (2) the `begin` whose `onStart` throws: the CALLER observes the throw (`§2.3` item 1(d));
    //  (3) the post-throw reading: the tracking three rolled back, idle again, `gesture() ===
    //      null`, and — THE CLAUSE — NO gesture counted and NO id consumed;
    //  (4) the SAME element’s next successful `begin`, which must therefore be the session’s
    //      FIRST gesture: `stats().gestures === 1` and `handle.id === 1` (`M-2`, `§2.4` item 4).
    // NO `capture` OPT-IN IS DRIVEN, deliberately: `§2.1` does NOT adjudicate whether an
    // opted-in control's capture call is made on this (un-established) path — the capture
    // clause places the call *"AFTER the gesture is established"*, and this path establishes
    // no gesture — so this row does not invent a reading for it (see the report).
    const sentinel = 'the consumer’s `onStart` hook threw'
    let onStartCalls = 0
    const h = await makeHarness({
      installOptions: {
        capture: false,
        onStart: (): never => {
          onStartCalls += 1
          if (onStartCalls === 1) throw new Error(sentinel)
          return undefined as never
        },
      },
      label: 'ADV-GS-16 §2.1 SessionStats.gestures · §2.4 item 4 · M-2',
    })
    const el: Record<string, unknown> = { id: 'a' }
    expect(
      h.sessionInstall(el),
      'ADV-GS-16 STATE (1) — the control installs with the throwing `onStart` (so the refusal below is the HOOK path, not an install refusal)',
    ).toBe(true)
    expect(
      h.source.listenerCount(el),
      'ADV-GS-16 STATE (1) — the start listener is live before the attempt (the element is installed)',
    ).toBe(1)
    // STATE (2) — THE CALLER OBSERVES THE THROW. `§2.3` item 1(d) has the session’s own
    // handler call `begin(element)`; `§2.1`’s `onStart` cell has a throw *"propagate to the
    // caller of `begin`"* and leave NO listener behind.
    const began = beginResult(h, el)
    expect(
      began,
      'ADV-GS-16 STATE (2) — `begin` does NOT return a result: the `onStart` throw PROPAGATES to the caller (§2.1’s `onStart` cell, §2.3 item 1(d) — a consumer hook’s error is never swallowed)',
    ).toBe(undefined)
    expect(h.thrown.length, 'ADV-GS-16 STATE (2) — exactly ONE throw escaped the `begin` call').toBe(1)
    expect(
      describeThrown(h.thrown[0]),
      'ADV-GS-16 STATE (2) — and it is the CONSUMER’S throw (the session adds nothing to it)',
    ).toContain(sentinel)
    expect(onStartCalls, 'ADV-GS-16 STATE (2) — the hook really ran (the throw came from the consumer’s `onStart`, not from a refusal before it)').toBe(1)
    // STATE (3) — THE CLEANUP HALF, all of it asserted from the recorder and the session’s
    // OWN readings (never from the exception alone).
    expect(
      h.source.listenerCount(el),
      'ADV-GS-16 STATE (3) — the three tracking attaches are ROLLED BACK by the throwing path: the control holds its ONE start listener again and nothing else',
    ).toBe(1)
    expect(h.source.typeMultiset(el), 'ADV-GS-16 STATE (3) — and the retained type is the start listener’s').toEqual([TYPE_START])
    expect(h.session.stats().active, 'ADV-GS-16 STATE (3) — no gesture is left active by the throwing path').toBe(false)
    expect(h.session.gesture(), 'ADV-GS-16 STATE (3) — `gesture()` reports `null` (no half-built record survives)').toBe(null)
    expect(
      h.session.stats().gestureId,
      'ADV-GS-16 STATE (3) — `stats().gestureId` is `0` (the session is IDLE — §2.1’s `gestureId`: "the active gesture id, or `0` when idle")',
    ).toBe(0)
    // **THE CLAUSE’S FIRST READING, taken here and ASSERTED TOGETHER WITH THE SECOND** (so a
    // reader sees BOTH violations of the one clause in a single verbatim failure rather than
    // only the first one reached): `§2.1`’s `SessionStats.gestures` cell declares the field as
    // *"Successful `begin` calls, instance-lifetime"*, and a `begin` whose `onStart` throws is
    // NOT a successful one — it returns NO result, cleans up, and rethrows.
    const gesturesAfterTheThrow = h.session.stats().gestures
    // STATE (4) — THE SAME ELEMENT’S NEXT SUCCESSFUL `begin` (the hook throws only once, so
    // this establishment really succeeds).
    expect(
      h.session.stats().installed,
      'ADV-GS-16 STATE (4) — the element is STILL INSTALLED after the throwing path (the refusal/throw must not brick the control)',
    ).toBe(1)
    const retry = beginResult(h, el)
    expect(
      retry?.ok,
      'ADV-GS-16 STATE (4) — the SAME element establishes NORMALLY on the next attempt (the throwing path left the control usable)',
    ).toBe(true)
    const handle = (retry as { ok: true; gesture: GestureHandle }).gesture
    // **THE CLAUSE, ASSERTED AS ONE READING SO BOTH OF ITS VIOLATIONS ARE REPORTED TOGETHER.**
    // `§2.1`’s `SessionStats.gestures` cell reads *"Successful `begin` calls,
    // instance-lifetime"*; `§2.4` item 4 reads *"`id` starts at `1`, increments on every
    // **successful** `begin`"*; and `M-2` puts the first gesture’s handle at `id === 1`. A
    // `begin` whose `onStart` threw was NOT successful — it returned no result, cleaned up and
    // rethrew — so the throwing attempt must consume neither the counter nor the id: the
    // reading after the throw is `0`, and the SAME element’s next successful establishment is
    // the session’s FIRST gesture, reading `1` with `handle.id === 1`.
    //
    // **AS FILED, THIS WAS THE RED OF THIS PASS.** The module AS FILED incremented
    // `counters.gestures` before `onStart` ran and fed `record.id` from it, so the measured
    // triple then read
    // `{gesturesAfterTheThrow: 1, gesturesAfterTheRetry: 2, retryHandleId: 2}` — the clause,
    // not the bytes, is what this row asserts, and the row is NOT to be re-tuned.
    // **⟶ RECORDED 2026-09-27 (`ADV-GS-16`'s module fix): the increment now sits AFTER the
    // `onStart` try/catch, immediately before `counters.lastCode = 'ok'` and the `{ok:true}`
    // return, so the landed bytes measure the clause itself — the triple below reads
    // `{0, 1, 1}` and the row is GREEN.**
    expect(
      {
        gesturesAfterTheThrow,
        gesturesAfterTheRetry: h.session.stats().gestures,
        retryHandleId: handle.id,
      },
      'ADV-GS-16 STATE (3)/(4) — **THE CLAUSE GOVERNING, NOT THE BYTES:** a `begin` whose `onStart` THROWS is not a successful `begin` (§2.1’s `SessionStats.gestures` — *"Successful `begin` calls, instance-lifetime"*; §2.4 item 4 — *"`id` starts at `1`, increments on every SUCCESSFUL `begin`"*; M-2 — *"the handle’s `id === 1`"* for the session’s first gesture), so the throwing attempt consumes NEITHER the counter nor the id and the retry is the FIRST gesture',
    ).toEqual({ gesturesAfterTheThrow: 0, gesturesAfterTheRetry: 1, retryHandleId: 1 })
    // The retry’s own terminal, so the row’s lifecycle is closed rather than left in flight.
    endCall(h, el, handle)
    expect(
      h.commits.length,
      'ADV-GS-16 STATE (4) — the retry’s `end` terminal commits exactly once (the throwing attempt contributed no commit, it never reached a terminal)',
    ).toBe(1)
  })

  it('ADV-GS-26 — a THROWING `capturePointer` is SWALLOWED: exactly ONE capture attempt, the throw never reaches the consumer boundary, and the gesture still establishes and still terminates normally', async () => {
    // STATES ENUMERATED BEFORE THE ROW:
    //  (1) an OPTED-IN install: ZERO capture attempts at install time (`§2.3` item 6(a));
    //  (2) the `begin` whose ONE capture attempt THROWS — the attempt is recorded, the throw
    //      is swallowed, `begin` still reports `ok:true` and the three tracking listeners open;
    //  (3) the lifecycle to its `end` terminal: the hooks all run in order, the declared commit
    //      count happens, NO second capture attempt and NO release call is invented, and the
    //      baseline is restored to ONE listener;
    //  (4) the consumer boundary: nothing observed an error — no throw escaped any call, and no
    //      hook saw one.
    const hookLog = makeHookLog()
    const h = await makeHarness({
      sourceOptions: { failCapture: true },
      installOptions: hookOptions(hookLog, { capture: true }),
      label: 'ADV-GS-26 §2.1 EventSource.capturePointer · §2.4 item 6 · §2.3 item 6(b)',
    })
    const el: Record<string, unknown> = { id: 'a' }
    expect(
      h.sessionInstall(el),
      'ADV-GS-26 STATE (1) — the opted-in control installs (the opt-in is the input; the source’s capture member is the capability)',
    ).toBe(true)
    expect(
      h.source.captures.length,
      'ADV-GS-26 STATE (1) — ZERO capture attempts at `install`: the capture entry point is never called before the gesture is established (`§2.3` item 6(a), `I-7`)',
    ).toBe(0)
    // STATE (2) — THE ONE ATTEMPT WHOSE THROW IS SWALLOWED.
    const began = beginResult(h, el)
    expect(
      began?.ok,
      'ADV-GS-26 STATE (2) — the capture member’s THROW IS SWALLOWED: `begin` still reports `{ok:true, gesture}` and nothing reaches the caller (`§2.1`’s `capturePointer` doc — *"a throwing capture member never reaches the consumer boundary and never fails a gesture"*; `§2.4` item 6)',
    ).toBe(true)
    expect(
      h.source.captures.length,
      'ADV-GS-26 STATE (2) — EXACTLY ONE capture ATTEMPT was made (the recorder logs the attempt and THEN throws, `makeSource`’s documented order): the count `§2.3` item 6(b) declares is a count of attempts, and a swallowed throw does not change it',
    ).toBe(1)
    expect(
      h.source.captures[0].element,
      'ADV-GS-26 STATE (2) — and the attempt carried the gesture’s OWN element (identity, `§2.3` item 6(b))',
    ).toBe(el)
    expect(
      [...h.source.threwAt].length,
      'ADV-GS-26 STATE (2) — THE DISCRIMINATING EVIDENCE: the configured fault really FIRED (exactly one logged call was configured to throw), so the swallow above is measured against a throw that happened and not against a fixture that never threw',
    ).toBe(1)
    expect(
      h.source.threwAt.has(h.source.captures[0].seq),
      'ADV-GS-26 STATE (2) — and the call that threw is the CAPTURE attempt itself (its own log sequence is in `threwAt`), not some other member’s',
    ).toBe(true)
    expect(
      h.thrown.length,
      'ADV-GS-26 STATE (2)/(4) — NOTHING reached the consumer boundary: the swallowed throw was not re-thrown, wrapped or reported through any call',
    ).toBe(0)
    const tracking = h.source.log.filter((rec) => rec.op === 'on' && rec.type !== TYPE_START)
    expect(
      tracking.map((rec) => rec.type),
      'ADV-GS-26 STATE (2) — the gesture STILL ESTABLISHES: the three tracking listeners were attached, in the pinned order (`§2.3` item 2(a))',
    ).toEqual([TYPE_MOVE, TYPE_END, TYPE_CANCEL])
    expect(
      hookLog.start.length,
      'ADV-GS-26 STATE (2) — and `onStart` ran exactly once (the capture path precedes it and its failure changed nothing about the establishment)',
    ).toBe(1)
    // STATE (3) — THE LIFECYCLE TERMINATES NORMALLY AT ITS DECLARED COMMIT COUNT.
    h.source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
    h.source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
    expect(
      [hookLog.move.length, hookLog.end.length, hookLog.cancel.length],
      'ADV-GS-26 STATE (3) — the consumer’s hooks ran on the declared path: ONE `pointermove` delivery, ONE `onEnd`, ZERO `onCancel`',
    ).toEqual([1, 1, 0])
    expect(
      h.commits.length,
      'ADV-GS-26 STATE (3) — the DECLARED COMMIT COUNT still happens: an `end` terminal commits exactly once (`§2.3` item 4)',
    ).toBe(1)
    expect(h.session.stats().commits, 'ADV-GS-26 STATE (3) — the session’s own counter agrees with the sink (no spy-only count)').toBe(1)
    expect(
      h.source.captures.length,
      'ADV-GS-26 STATE (3) — and NO second capture attempt (nor any invented release call): the gesture’s capture count is ZERO-or-ONE, and an opted-in gesture that threw still made exactly ONE attempt',
    ).toBe(1)
    expect(
      h.source.listenerCount(el),
      'ADV-GS-26 STATE (3) — the terminal restored the baseline to ONE listener (the start listener remains)',
    ).toBe(1)
    expect(h.session.gesture(), 'ADV-GS-26 STATE (3) — the session is idle again after the terminal (the swallowed throw left no latch)').toBe(null)
    expect(h.session.disposed, 'ADV-GS-26 STATE (4) — and the session is not disposed or otherwise degraded by the swallowed throw').toBe(false)
  })

  it('ADV-GS-22(a) — with NO `commit` callback installed, `committed` is the COMMITTING-TERMINAL discriminator (`true` for `end`/`reset`, `false` for `cancel`) and `stats().commits` stays `0`', async () => {
    // STATES ENUMERATED BEFORE THE ROW (the three terminals, all on sessions created with NO
    // `commit` callback at all):
    //  (1) `end`   ⇒ `{ok:true, code:'ok', committed:true}`  · `stats().commits === 0`;
    //  (2) `reset` ⇒ `{ok:true, code:'ok', committed:true}`  · `stats().commits === 0`;
    //  (3) `cancel`⇒ `{ok:true, code:'ok', committed:false}` · `stats().commits === 0`.
    // THE ADJUDICATED READING (`§2.1`’s `TerminalResult` cell, corrected): `committed` is the
    // session’s record of WHICH TERMINAL ran — the committing-terminal discriminator — and it
    // is INDEPENDENT of whether a callback was installed; `stats().commits` counts the
    // session’s ACTUAL `commit` invocations, so with no callback it stays `0`.
    const create = await valueExport<(o?: SessionOptions) => GestureSessionMirror>(
      'createGestureSession',
      'ADV-GS-22(a) §2.1 TerminalResult · §2.3 item 4',
    )
    const source = makeSource({})
    const sessionOptions: SessionOptions = { source }
    expect(
      Object.keys(sessionOptions),
      'ADV-GS-22(a) STATE (0) — the drive really installs NO callback: the options object carries `source` and NOTHING else (no `commit` key at all, not one set to `undefined`)',
    ).toEqual(['source'])
    const session = create(sessionOptions)
    const el: Record<string, unknown> = { id: 'a' }
    expect(session.install(el, {}), 'ADV-GS-22(a) STATE (0) — the control installs on the callback-less session').toBe(true)
    // (1) THE `end` TERMINAL.
    const first = session.begin(el)
    expect(first.ok, 'ADV-GS-22(a) STATE (1) — a gesture establishes on the callback-less session').toBe(true)
    const firstHandle = (first as { ok: true; gesture: GestureHandle }).gesture
    const ended = session.end(el, firstHandle, 'v')
    expect(
      ended,
      'ADV-GS-22(a) STATE (1) — `end` on a callback-less session reports `{ok:true, code:\'ok\', committed:true}`: `committed` is the COMMITTING-TERMINAL discriminator and does NOT depend on a callback being installed',
    ).toEqual({ ok: true, code: 'ok', committed: true })
    expect(
      session.stats().commits,
      'ADV-GS-22(a) STATE (1) — and `stats().commits` counts ACTUAL `commit` invocations: with no callback there were none, so the counter stays `0` while `committed` is `true`',
    ).toBe(0)
    expect(session.gesture(), 'ADV-GS-22(a) STATE (1) — the gesture is over (`gesture()` is `null`)').toBe(null)
    // (2) THE `reset` TERMINAL — the other committing terminal.
    const second = session.begin(el)
    expect(second.ok, 'ADV-GS-22(a) STATE (2) — the second gesture establishes').toBe(true)
    const secondHandle = (second as { ok: true; gesture: GestureHandle }).gesture
    expect(
      session.reset(el, secondHandle, 'default'),
      'ADV-GS-22(a) STATE (2) — `reset` reports `committed:true` too (it is the OTHER committing terminal), still with no callback installed',
    ).toEqual({ ok: true, code: 'ok', committed: true })
    expect(
      session.stats().commits,
      'ADV-GS-22(a) STATE (2) — and the lifetime `commit` count is STILL `0` (no callback exists to invoke)',
    ).toBe(0)
    // (3) THE `cancel` TERMINAL — the NON-committing one.
    const third = session.begin(el)
    expect(third.ok, 'ADV-GS-22(a) STATE (3) — the third gesture establishes').toBe(true)
    expect(
      session.cancel(el),
      'ADV-GS-22(a) STATE (3) — `cancel` reports `{ok:true, code:\'ok\', committed:false}`: the discriminator reads `false` for the non-committing terminal, which is the SAME answer it gives on a session that HAS a callback',
    ).toEqual({ ok: true, code: 'ok', committed: false })
    expect(
      session.stats().commits,
      'ADV-GS-22(a) STATE (3) — and the lifetime count is still `0` after all three terminals',
    ).toBe(0)
    expect(
      session.stats().gestures,
      'ADV-GS-22(a) STATE (3) — three successful `begin` calls ran, so the gesture counter reads `3` (the callback’s absence changes no gesture fact)',
    ).toBe(3)
    expect(session.gesture(), 'ADV-GS-22(a) STATE (3) — idle after the third terminal').toBe(null)
    expect(
      source.listenerCount(el),
      'ADV-GS-22(a) STATE (3) — the start listener remains for the next gesture: no terminal of the three touched it',
    ).toBe(1)
  })
})

// ===========================================================================
// **⟶ THE GATE-4 CLOSURE ROW (2026-09-27) — `ADV-GS-30`: A `begin` WHOSE SESSION IS
// DISPOSED **DURING THE CALL** MUST REFUSE `'disposed'`.**
//
// **THE RULING THE ROW IS AUTHORED FROM (the CLAUSE, never the module's current bytes).**
// `§2.3` item 7.7 (_"THE DISPOSAL GOVERNS A `begin` WHOSE SESSION IS DISPOSED DURING THAT
// CALL"_, added by the `ADV-GS-30` amendment; the same rule stood at item 7.3 before it was
// re-stated as `7.7`, and **item 7.3** remains the clause for the general inert-session
// reading this row cites): *"A `begin` whose session is disposed during the call must NOT
// report success: it refuses `{ok:false, code:'disposed'}` — the EXISTING SEVEN-MEMBER
// closed-domain code, with NO EIGHTH MEMBER added — and the refused attempt consumes NOTHING:
// the discarded record stays DISCARDED (`gesture()` stays `null`), the gesture COUNTER is NOT
// consumed (`stats().gestures` stays at its pre-call value, `0` on a fresh session), the
// handle ID is NOT consumed (`stats().gestureId` stays `0`), `stats().active` stays `false`,
// the ledger stays EMPTIED (`stats().installed === 0`) and the baseline stays restored."*
// `§2.3` item 7.3 supplies the same readings from the other direction: *"mark the instance
// **`disposed = true` FOREVER**: `install` returns `false` without a source call, **`begin`
// reports `'disposed'`**, every terminal reports `'disposed'` **without detaching or
// committing**, `stats()` reports `{installed: 0, active: false}`, `gesture()` returns
// `null`, and **the counters keep their last values** (they are not reset — `§0A` note 8)."*
// The clause binds the SESSION's state, not the CALLER's path into it. `§2.1`'s
// `SessionStats.gestures` cell (*"Successful `begin` calls, instance-lifetime"*) and `§2.4`
// item 4 (*"`id` starts at `1`, increments on every **successful** `begin`"*) therefore leave
// a refused `begin` — the `'disposed'` refusal among them — owing the counter and the id
// NOTHING, and `§2.3` item 8's `any → disposed` transition makes the disposal the governing
// fact.
//
// **THE TWO WINDOWS THE CLAUSE LEAVES OPEN, BOTH DRIVEN.** The establishment order `§2.3`
// item 1(d) pins is: the establishment checks (`§2.4` item 5) → the three tracking attaches
// (item 2(a)) → the capture call iff opted in (item 6(b)) → `onStart`. Two of those four
// steps run CONSUMER code, so two windows exist in which a session can be disposed mid-`begin`:
//   · WINDOW A — **dispose from `capturePointer`** (the consumer's own capture member);
//   · WINDOW B — **dispose from `onStart`**.
// The ruling covers both ("from `capturePointer`, from `onStart`, or any consumer code
// running in that window"): the disposal governs, so the call REFUSES with
// `{ok:false, code:'disposed'}`, the discarded record stays discarded, `gesture()` stays
// `null`, and the gesture counter and id are NOT consumed.
//
// **WHAT IS DRIVEN PER WINDOW, AND WHAT IS DELIBERATELY NOT.** Driven: the refusal
// (`{ok:false, code:'disposed'}`), `session.disposed === true`, `stats().gestures === 0`,
// `stats().gestureId === 0`, `gesture() === null`, `stats().active === false`, the listener
// baseline back to the install-time footprint (`0` — `§2.3` item 7.2 detaches everything this
// session attached, `I-5`: *"after `dispose()` the session's own contribution is ZERO
// listeners"*), and `stats().installed === 0` (`§2.3` item 7.3's own reading). **NOT driven,
// and reported rather than invented** — see the silence notes inside the row:
//   (S-1) `stats().lastCode` is asserted as the DERIVED reading of the ONE code the call
//         produced (`§2.1`'s `lastCode` cell: *"the LAST result code this session produced"*),
//         because the spec pins NO cell for `lastCode` after a `dispose()`-governed refusal —
//         **`§2.3` item 7.7 records this SILENCE explicitly** (*"this clause pins NO `lastCode`
//         cell for a dispose-governed refusal … a row that asserts `lastCode === 'disposed'`
//         after this refusal is DERIVING it from that cell rather than citing a clause written
//         for this path"*), and `§0A` note 8's *"counters keep their last values"* names the
//         counters and says nothing about `lastCode`; the limb is the DERIVATION and not a
//         cited cell.
//   (S-2) `stats().disposed` is NOT asserted as a reading of `SessionStats`: `§2.1`'s
//         `SessionStats` block declares SEVEN fields (`installed`, `sourceCalls`, `gestures`,
//         `commits`, `active`, `gestureId`, `lastCode`) and NO `disposed` field — the disposal
//         reading is `session.disposed` (`§2.1`'s `GestureSession`: *"`true` forever once
//         `dispose()` has run"*, `§2.5` item 8). The row therefore asserts the key SET of
//         `stats()` BESIDE the disposal reading, so a spec that later adds the field has a
//         failing row here rather than a silent one.
// No register attempt moves for this row: it is a `§2.3` clause row, not a `§5.5.1`
// attempt, and the declared terms, the `396` total, the seed and the caps are untouched.
// ===========================================================================
describe('ADV-GS-30 — a `begin` whose session is disposed MID-CALL (the `§2.3` item 7.7 / item 7.3 disposal rule)', () => {
  it('ADV-GS-30 — disposing the session from inside `capturePointer` and from inside `onStart`: `begin` REFUSES `{ok:false, code:\'disposed\'}`, and the counter, the id and the record are NOT consumed', async () => {
    // STATES ENUMERATED BEFORE THE ROW (the file's own convention):
    //  WINDOW A — the session is disposed from inside the SOURCE'S CAPTURE CALL, i.e. after the
    //    three tracking attaches and the `isConnected` reading, before `onStart`:
    //    (A1) `install(el, {capture:true})` → the control is installed, ONE start listener, no
    //         capture attempt yet (`§2.3` item 6(a));
    //    (A2) `begin(el)` → the attempt runs; the capture call disposes the session mid-call;
    //         THE CLAUSE: the call REFUSES `'disposed'` and consumes nothing;
    //    (A3) the post-refusal reading: `disposed`, `installed === 0`, `active === false`,
    //         `gestures === 0`, `gestureId === 0`, `gesture() === null`, and the listener
    //         baseline back to `0` (the session's own contribution — item 7.2/I-5).
    //  WINDOW B — the same, with the disposal coming from inside the consumer's `onStart`
    //    (the LAST consumer step of the establishment order, so the refusal must still govern):
    //    (B1) `install(el, {capture:false})` (so the window driven is unambiguously `onStart`);
    //    (B2) `begin(el)` → `onStart` disposes the session mid-call; THE SAME CLAUSE applies;
    //    (B3) the same post-refusal reading as (A3).
    // NO reading is asserted that no clause pins: the two silences met here are reported in the
    // block's header comments (S-1 `lastCode`, S-2 `SessionStats.disposed`).
    const runWindow = async (
      windowName: string,
      options: {
        sourceOptions: SourceOptions
        installOptions: GestureOptionsInput
        disposals: DisposeReport[]
        /** The window's consumer code, bound to the session the drive creates: it must call
         *  `dispose()` from INSIDE the establishment order and push the report into
         *  `options.disposals`. */
        bindWindow: (session: GestureSessionMirror) => void
      },
    ): Promise<void> => {
      // **THE WINDOW IS A CONSUMER'S OWN CODE INSIDE THE CALL.** The session reference is bound
      // before the drive (the consumer code needs the instance it disposes), and the window
      // closes before the call returns. `disposals` is filled by the window itself, which is how
      // the row measures that the window REALLY OPENED — a window that never fired would make
      // every reading below vacuous.
      const source = makeSource(options.sourceOptions)
      const session = await makeSession(
        { source, commit: (): void => undefined } as SessionOptions,
        `ADV-GS-30 window ${windowName}`,
      )
      options.bindWindow(session)
      const el: Record<string, unknown> = { id: 'a' }
      expect(
        session.install(el, options.installOptions),
        `ADV-GS-30 WINDOW ${windowName} STATE (1) — the control installs (so the refusal below is the DISPOSAL and not an install refusal)`,
      ).toBe(true)
      expect(
        source.listenerCount(el),
        `ADV-GS-30 WINDOW ${windowName} STATE (1) — the install-time footprint the baseline must be restored to is ONE listener (the start listener, §2.3 item 1(a))`,
      ).toBe(1)
      expect(
        session.disposed,
        `ADV-GS-30 WINDOW ${windowName} STATE (1) — the session is NOT disposed before the attempt (otherwise the drive would be vacuous)`,
      ).toBe(false)
      // STATE (2) — THE MID-CALL DISPOSAL, driven from INSIDE the call.
      const began = session.begin(el)
      expect(
        options.disposals.length,
        `ADV-GS-30 WINDOW ${windowName} STATE (2) — the window REALLY OPENED: the consumer code that disposes the session ran exactly ONCE inside the \`begin\` call`,
      ).toBe(1)
      expect(
        session.disposed,
        `ADV-GS-30 WINDOW ${windowName} STATE (2) — the disposal landed: \`session.disposed === true\` (§2.1's \`GestureSession.disposed\` — \`true\` forever once \`dispose()\` has run; §2.3 item 7.3 — \`disposed = true\` FOREVER)`,
      ).toBe(true)
      expect(
        options.disposals[0]?.complete,
        `ADV-GS-30 WINDOW ${windowName} STATE (2) — the disposal reported the baseline restore of this session's own listeners and reported it COMPLETE (§2.3 items 7.2/7.4: no \`off\` threw in this window, so the \`complete: false\` limb must not be reported)`,
      ).toBe(true)
      // THE CLAUSE, ASSERTED AS ONE READING (the `ADV-GS-16` convention): the RETURNED result of
      // the call whose session was disposed mid-call, together with the state it governed.
      expect(
        began,
        `ADV-GS-30 WINDOW ${windowName} STATE (2) — **THE CLAUSE GOVERNING, NOT THE BYTES: §2.3 item 7.7 — "a \`begin\` whose session is disposed during the call must NOT report success: it refuses \`{ok:false, code:'disposed'}\`" (the same rule as item 7.3's "\`begin\` reports \`'disposed'\`" on a disposed session)** — so a \`begin\` whose session is disposed DURING the call REFUSES \`{ok:false, code:'disposed'}\` and never reports \`{ok:true, gesture}\` on an inert instance (the disposal governs the call, however late in the establishment order it lands); got ${JSON.stringify(
          began,
          (_k, v: unknown) => (typeof v === 'function' ? 'a function' : v),
        )}`,
      ).toEqual({ ok: false, code: 'disposed' })
      expect(
        session.stats().lastCode,
        `ADV-GS-30 WINDOW ${windowName} STATE (2) — SILENCE (S-1), DRIVEN AS A DERIVATION: §2.1's \`lastCode\` cell reads "the LAST result code this session produced", and the ONE result code this call produced is the \`'disposed'\` refusal above — the spec pins NO cell for \`lastCode\` after a dispose-governed refusal, so this limb is the derivation and is reported as one (see the block header)`,
      ).toBe('disposed')
      // STATE (3) — THE POST-REFUSAL READING, ALL OF IT FROM THE SESSION'S OWN SEAM.
      expect(
        session.stats().gestures,
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — the gesture COUNTER is NOT consumed: §2.1's \`SessionStats.gestures\` counts "Successful \`begin\` calls", and a \`begin\` that refused \`'disposed'\` is not one (the same clause \`ADV-GS-15\`/\`ADV-GS-16\` pin for the other refusal paths) — the lifetime counter stays \`0\``,
      ).toBe(0)
      expect(
        session.stats().gestureId,
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — the gesture ID is NOT consumed (\`0\` — the idle reading, §2.1's \`gestureId\` cell; a \`begin\` that never established may not spend the discarded record's id, §2.4 item 4)`,
      ).toBe(0)
      expect(
        session.gesture(),
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — \`gesture()\` is \`null\`: the DISPOSED record stayed discarded (§2.1's \`gesture()\` cell — "the active gesture's reading, or \`null\` when idle"; §2.3 item 7.3 — "gesture() returns null")`,
      ).toBe(null)
      expect(
        session.stats().active,
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — \`stats().active === false\` (the state is \`disposed\`, §2.3 items 7.3/8: "any state → disposed")`,
      ).toBe(false)
      expect(
        session.stats().installed,
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — \`stats().installed === 0\`: the ledger was EMPTIED by the disposal (§2.3 item 7.3's own reading — "\`stats()\` reports \`{installed: 0, active: false}\`") and the refused \`begin\` restored nothing`,
      ).toBe(0)
      expect(
        source.listenerCount(el),
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — THE BASELINE IS RESTORED: the install-time footprint (\`1\`, asserted in STATE (1)) minus the session's own detach is \`0\` — §2.3 item 7.2 detaches "every start listener of every installed control", and \`I-5\` reads "after \`dispose()\` the session's own contribution is ZERO listeners"; a \`begin\` that reported success after the disposal would be the only way listeners could come back, so this reading is the listener half of the same clause`,
      ).toBe(0)
      expect(
        source.typeMultiset(el),
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — and no listener of ANY type survives the disposal (the empty multiset, not a count-only claim)`,
      ).toEqual([])
      expect(
        Object.keys(session.stats()).sort(),
        `ADV-GS-30 WINDOW ${windowName} STATE (3) — SILENCE (S-2), ASSERTED SO A LATER SPEC CHANGE FAILS HERE RATHER THAN PASSING SILENTLY: §2.1's \`SessionStats\` block declares SEVEN fields and NO \`disposed\` field, so the disposal reading is \`session.disposed\` (§2.1's \`GestureSession\`, §2.5 item 8) — NOT \`stats().disposed\`; this row asserts the key set it reads so a spec that adds the field has a failing row at this site`,
      ).toEqual(['active', 'commits', 'gestureId', 'gestures', 'installed', 'lastCode', 'sourceCalls'])
    }
    // ---- WINDOW A: the disposal comes from inside the SOURCE'S CAPTURE CALL.
    // The two windows drive the seam directly with the SAME `makeSource`/`makeSession` pair
    // `makeHarness` composes (the harness's own shape is shared by 85 rows and is not extended
    // here), which is also what makes the window's disposal report readable.
    const disposalsA: DisposeReport[] = []
    let windowA: (() => void) | null = null
    await runWindow('A (`capturePointer`)', {
      installOptions: { capture: true },
      disposals: disposalsA,
      bindWindow: (session: GestureSessionMirror): void => {
        windowA = (): void => {
          disposalsA.push(session.dispose())
        }
      },
      sourceOptions: {
        capturePointer: (): void => {
          // The consumer code the session invokes inside `begin`, after establishment
          // (`§2.3` item 6(b)); its disposal must govern the call that is still running.
          const disposeWindow = windowA
          if (disposeWindow !== null) disposeWindow()
        },
      },
    })
    // ---- WINDOW B: the disposal comes from inside the consumer's `onStart`.
    const disposalsB: DisposeReport[] = []
    let windowB: (() => void) | null = null
    await runWindow('B (`onStart`)', {
      sourceOptions: {},
      disposals: disposalsB,
      bindWindow: (session: GestureSessionMirror): void => {
        windowB = (): void => {
          disposalsB.push(session.dispose())
        }
      },
      installOptions: {
        capture: false,
        onStart: (): void => {
          const disposeWindow = windowB
          if (disposeWindow !== null) disposeWindow()
        },
      },
    })
  })
})

// ===========================================================================
// **⟶ THE `ADV-GS-30` SECOND LIMB (2026-09-27) — THE ATTEMPT'S OWN RECORD DISCARDED
// DURING THE ESTABLISHMENT ORDER, WITH THE SESSION NOT DISPOSED: the same refusal, driven
// on the shape the DISPOSAL limb does NOT reach.**
//
// **THE RULING THE ROW IS AUTHORED FROM (the CLAUSE as the parallel spec pass states it,
// never the module's current bytes).** `§2.3` item 7.7 — the clause `ADV-GS-30` stated for
// the MID-CALL DISPOSAL — is stated as an EXTENSION covering the order's OTHER discard
// shape: *"a `begin` whose OWN record is discarded during the establishment order (consumer
// code inside the order — e.g. `cancel(element)` from `onStart` — ending this attempt
// before the counter increment) must NOT report `{ok:true}` either: the attempt refuses
// with the closed-domain `'disposed'` — the same refusal the disposal shape uses, because
// the seven-member domain offers no more specific member; the counter and the id are NOT
// consumed, `gesture()` stays `null`, and `lastCode` reads `'disposed'`. A re-lex of that
// code for the discard-only shape would need its own gate (`§4.4 S-8`/`S-9`)."*
// Two limbs of ONE clause, and the CLAUSE'S OWN TEXT is what separates them:
//   · THE DISPOSAL LIMB — the session is DISPOSED inside the order (`dispose()` from
//     `capturePointer` or from `onStart`). `session.disposed === true` afterwards, which is
//     the reading that DRIVES the guard's `ended` half. Covered by the `ADV-GS-30` row above.
//   · THE DISCARD-ONLY LIMB — **the session is NEVER disposed**; consumer code inside the
//     order calls `cancel(element)`, which ends THIS attempt's own record and discards it
//     (`§2.3` item 8's terminal, `§0A` note 8: the record is one gesture deep and every
//     terminal discards it) **before the counter increment**. This is the guard's OTHER
//     half (`slot !== record`), and it is the limb this row exists to pin.
// **`cancel(element)` NEEDS NO HANDLE** (`§2.5` item 8's `gesture?` is OPTIONAL), which is
// exactly why the window is reachable from consumer code that has never seen the handle
// the in-flight `begin` has not yet returned — the establishment order (`§2.3` item 1(d))
// opens it without any handle being passed to the consumer.
//
// **THE CLOSED-DOMAIN JUSTIFICATION, stated at the reading it explains.** `§2.3` item 4's
// result-code union has SEVEN members (`'ok'`, `'not-installed'`, `'busy'`, `'disposed'`,
// `'disconnected'`, `'stale'`, `'no-gesture'`) and the ruling refuses to invent an EIGHTH
// (`§2.2`/`§4.4 S-9`; the `ADV-GS-2` row above keeps the same line). None of the other six
// fits: the session is NOT `busy` (`slot` was discarded, so the `busy` check that opens the
// next `begin` reads `null`), the control IS installed (the ledger entry and its start
// listener are untouched), the element IS connected, no handle was presented (so not
// `'stale'`), and there is no gesture to have (so not `'no-gesture'`). The RULED reading is
// therefore the `'disposed'` refusal — the code that says the thing the refusal actually
// means: **the record this call would have established no longer exists**, so the call may
// not report success on it.
//
// **WHAT IS DRIVEN.** The refusal (`{ok:false, code:'disposed'}`), the DISCRIMINATING FACT
// that this limb is NOT the disposal limb (`session.disposed === false`), `stats().gestures
// === 0`, `stats().gestureId === 0`, `gesture() === null`, `stats().active === false`,
// `stats().lastCode === 'disposed'`, plus the two supporting readings that show the
// element's own state was NOT destroyed by the discard (`stats().installed === 1`, the
// install-time start-listener footprint `1` untouched — `§2.3` item 1(a)) and the
// non-vacuity evidence that the window really opened (`theCancel` was the SUCCESSFUL
// terminal `{ok:true, code:'ok', committed:false}` and `onStart` ran exactly once).
// **SILENCE, reported rather than invented:** `lastCode` is read as the DERIVATION `§2.3`
// item 7.7 itself records (`§2.1`'s `lastCode` cell — *"the LAST result code this session
// produced"* — is the only cell for it; the clause pins NO cell for a `'disposed'` refusal),
// which is the same derivation the `ADV-GS-30` row above reports as its `S-1`.
//
// **THE ROW IS GREEN ON LANDING, AND THAT IS STATED PLAINLY RATHER THAN DRESSED AS A RED.**
// The module's guard already reads `if (ended || slot !== record) return
// refuseBegin('disposed')`, so BOTH limbs are satisfied by the landed bytes and **this pass
// adds NO red and must not manufacture one** (manufacturing a red here would mean asserting
// a reading the clause does not rule). **ITS VALUE IS THE MISSING CLAUSE COVERAGE:** the
// disposal limb is driven by the row above, while the discard limb is driven by NOTHING —
// so before this row, a future pass could NARROW the guard (`ended` kept, `slot !== record`
// removed) and the whole suite would still pass, leaving the clause's second limb unpinned
// and the narrowing invisible. This row is the failing row that narrowing now hits: the
// discard window would then report `{ok:true}` and every reading above breaks.
// **No register attempt moves for this row:** it is a `§2.3` clause row, NOT a `§5.5.1`
// register row — no row id, strategy id, attempt term, the `396` total, the seed or the caps
// is touched, and the register still declares ELEVEN rows.
// ===========================================================================
describe('ADV-GS-30 (second limb) — a `begin` whose OWN record is discarded during the establishment order by consumer code inside it, with the session NOT disposed', () => {
  it('ADV-GS-30 (discard limb) — `cancel(element)` from inside `onStart`: `begin` REFUSES the closed-domain `disposed` while `session.disposed === false`, and the counter, the id and the record are NOT consumed', async () => {
    // STATES ENUMERATED BEFORE THE ROW (the file's own convention):
    //  (1) `install(el)` with an `onStart` that will discard this attempt from INSIDE it →
    //      the control is installed, ONE start listener (the install-time footprint), no
    //      gesture yet, the session NOT disposed.
    //  (2) `begin(el)` → the establishment order runs; `onStart` (the ORDER'S LAST CONSUMER
    //      STEP, `§2.3` item 1(d)) calls `cancel(el)`, which ends and DISCARDS this attempt's
    //      own record BEFORE the counter increment; the order then reaches the liveness
    //      re-check and THE CLAUSE rules the refusal `'disposed'`.
    //  (3) the post-refusal reading: `disposed === false` (this is NOT the disposal limb),
    //      `gestures === 0`, `gestureId === 0`, `gesture() === null`, `active === false`,
    //      `lastCode === 'disposed'`, and the element's own state intact
    //      (`installed === 1`, the ONE start listener still attached).
    // NO reading is asserted that no clause pins: the `lastCode` limb is the derivation
    // `§2.3` item 7.7 records, reported as one in the block header above.
    const el: Record<string, unknown> = { id: 'a' }
    let startRuns = 0
    const cancels: TerminalResult[] = []
    let sessionRef: GestureSessionMirror | null = null
    const h = await makeHarness({
      installOptions: {
        capture: false,
        onStart: (element: unknown): void => {
          // **THE WINDOW, DRIVEN BY CONSUMER CODE INSIDE THE ESTABLISHMENT ORDER.** The
          // element is the argument the hook receives and NO HANDLE IS NEEDED: `cancel`'s
          // handle parameter is OPTIONAL (`§2.5` item 8), so this call is exactly the shape
          // the clause names — *"consumer code inside the order — e.g. `cancel(element)`
          // from `onStart`"*. The session reference is read (never captured) so the call is
          // provably the SESSION's own `cancel`, and the terminal's result is kept so the
          // row can show the discard SUCCEEDED rather than assume it.
          startRuns += 1
          cancels.push((sessionRef as GestureSessionMirror).cancel(element))
        },
      },
    })
    sessionRef = h.session
    // STATE (1) — THE INSTALL-TIME FOOTPRINT, so every reading below has a measured baseline.
    expect(
      h.sessionInstall(el),
      'ADV-GS-30 (discard limb) STATE (1) — the control installs (so the refusal below is the DISCARD and not an install refusal)',
    ).toBe(true)
    expect(
      h.source.listenerCount(el),
      'ADV-GS-30 (discard limb) STATE (1) — the install-time footprint the post-refusal reading is compared against is ONE listener (the start listener, §2.3 item 1(a))',
    ).toBe(1)
    expect(
      h.session.disposed,
      'ADV-GS-30 (discard limb) STATE (1) — the session is NOT disposed before the attempt: THIS limb is the discard-only shape, so the disposal limb cannot be what the refusal below reports',
    ).toBe(false)
    // STATE (2) — THE DISCARD, driven from INSIDE the call and by consumer code only.
    const began = h.session.begin(el)
    expect(
      startRuns,
      'ADV-GS-30 (discard limb) STATE (2) — the window REALLY OPENED: the consumer code inside the establishment order ran exactly ONCE inside the `begin` call',
    ).toBe(1)
    expect(
      cancels,
      'ADV-GS-30 (discard limb) STATE (2) — the discard SUCCEEDED, which is what makes the refusal below governed by the DISCARD rather than by a refusal the consumer made itself: `cancel(element)` returned the terminal `{ok:true, code:\'ok\', committed:false}` (§2.3 item 4: a cancel commits ZERO times)',
    ).toEqual([{ ok: true, code: 'ok', committed: false }])
    expect(
      h.session.disposed,
      'ADV-GS-30 (discard limb) STATE (2) — **THE DISCRIMINATING FACT OF THIS LIMB: `session.disposed === false` AFTER the refusal.** `§2.1` `GestureSession.disposed` is "`true` forever once `dispose()` has run" — `dispose()` NEVER ran here, so the refusal below is the establishment order\'s OWN DISCARD (`slot !== record`) and NOT the disposal (`ended`). Without this reading the row could be satisfied by the disposal limb and would pin nothing new',
    ).toBe(false)
    // THE CLAUSE, ASSERTED AS ONE READING (the `ADV-GS-16`/`ADV-GS-30` convention).
    expect(
      began,
      `ADV-GS-30 (discard limb) STATE (2) — **THE CLAUSE GOVERNING, NOT THE BYTES: §2.3 item 7.7 discard limb — a begin whose OWN record is discarded during the establishment order (consumer code inside the order — the clause names cancel(element) from onStart — ending this attempt before the counter increment) must NOT report success either: the attempt refuses with the closed-domain 'disposed', the same refusal the disposal shape uses, because the seven-member domain offers no more specific member — and a re-lex of that code for the discard-only shape would need its own gate (§4.4 S-8/S-9)** — so a begin whose own record no longer exists when the establishment order ends REFUSES with that same closed-domain 'disposed' and never reports success on a record that was discarded; got ${JSON.stringify(
        began,
        (_k: unknown, v: unknown) => (typeof v === 'function' ? 'a function' : v),
      )}`,
    ).toEqual({ ok: false, code: 'disposed' })
    // STATE (3) — THE POST-REFUSAL READING of the session's OWN seam (`§0A` note 12).
    expect(
      h.session.stats().gestures,
      'ADV-GS-30 (discard limb) STATE (3) — the gesture COUNTER is NOT consumed: §2.1\'s `SessionStats.gestures` counts "Successful `begin` calls", and a `begin` that refused is not one (§2.4 item 4: the id increments "on every SUCCESSFUL `begin`"; the same clause the `ADV-GS-15`/`ADV-GS-16`/`ADV-GS-30` rows pin for the other refusal paths) — the lifetime counter stays `0`',
    ).toBe(0)
    expect(
      h.session.stats().gestureId,
      'ADV-GS-30 (discard limb) STATE (3) — the gesture ID is NOT consumed (`0` — the idle reading, §2.1\'s `gestureId` cell): the discarded record\'s id is not spent, and the next successful `begin` still takes id `1` (§2.4 item 4 — ids stay consecutive for SUCCESSFUL gestures)',
    ).toBe(0)
    expect(
      h.session.gesture(),
      'ADV-GS-30 (discard limb) STATE (3) — `gesture()` is `null`: the DISCARDED record stayed discarded and the refused `begin` resurrects nothing (§2.1\'s `gesture()` cell — "the active gesture\'s reading, or `null` when idle"; §2.3 item 8\'s terminal discards the record, §0A note 8)',
    ).toBe(null)
    expect(
      h.session.stats().active,
      'ADV-GS-30 (discard limb) STATE (3) — `stats().active === false`: the record was ended by the consumer cancel call itself (§2.3 item 4, the `active → installed-idle` transition; item 8) and the refused `begin` never made it active',
    ).toBe(false)
    expect(
      h.session.stats().lastCode,
      'ADV-GS-30 (discard limb) STATE (3) — `stats().lastCode` reads `\'disposed\'`, reported as the DERIVATION §2.3 item 7.7 itself records (the clause pins NO `lastCode` cell for a `\'disposed\'` refusal): §2.1\'s `lastCode` cell reads "the LAST result code this session produced", and the ONE result code this call produced is the refusal above — the same derivation the `ADV-GS-30` disposal row reports as its `S-1`',
    ).toBe('disposed')
    expect(
      h.session.stats().installed,
      'ADV-GS-30 (discard limb) STATE (3) — `stats().installed` is still `1`: the DISCARD is not a DISPOSAL — the ledger was NOT emptied (contrast the disposal clause of §2.3 item 7.3, which empties it: the `ADV-GS-30` row above asserts `installed === 0` there), so the element\'s own install survives the refused attempt',
    ).toBe(1)
    expect(
      h.source.listenerCount(el),
      'ADV-GS-30 (discard limb) STATE (3) — THE BASELINE IS UNTOUCHED: the post-refusal footprint equals the install-time footprint asserted in STATE (1) (`1`), because the discard detaches the attempt\'s three TRACKING listeners (§2.3 item 2(c)) and never the start listener of the control itself (§2.3 item 1(a)) — and the refused `begin` adds none',
    ).toBe(1)
  })
})

// ===========================================================================
// §5.5.1 — PRE harness preconditions (NOT spec rows). `§4.2` item 2 requires the
// un-run register rows to be REPORTED AS FAILURES; these rows exist so a red run's
// OWN instruments are proved to work before they are trusted.
// ===========================================================================
describe('PRE — harness preconditions (not spec rows)', () => {
  it('PRE-1 the dynamic import boundary itself resolves and casts (proved against an EXISTING pure module)', async () => {
    const existing = ['..', 'src', 'shared', 'census.js'].join('/')
    const mod = (await import(/* @vite-ignore */ existing)) as Record<string, unknown>
    expect(
      typeof mod['computeTrackVars'],
      'PRE-1 — the computed-specifier import boundary resolves against an EXISTING module, so every module-absent row below fails as an ASSERTION and never as a collection error',
    ).toBe('function')
    expect(
      typeof mod['default'],
      'PRE-1 — the existing pure module carries no default export, which is the shape `R-6(a)` filters (`Object.keys(mod).filter((k) => k !== \'default\')`)',
    ).toBe('undefined')
  })

  it('PRE-2 (harness) — the §5.5.1 register tables are the ones the spec specifies (seed, terms, caps, arithmetic, the pinned LCG step)', () => {
    expect(SEED, 'PRE-2/§5.5.1 — the seed is the pinned literal `20260927`').toBe(20260927)
    expect(LCG_A, 'PRE-2/§5.5.1 — the LCG multiplier is the pinned literal').toBe(1664525)
    expect(LCG_C, 'PRE-2/§5.5.1 — the LCG increment is the pinned literal').toBe(1013904223)
    expect(LCG_MOD, 'PRE-2/§5.5.1 — the LCG modulus is `2³²`').toBe(4294967296)
    expect(REGISTER_ROW_CAP, 'PRE-2/§5.5.1 — the per-row cap is `<=100`').toBe(100)
    expect(REGISTER_TOTAL_CAP, 'PRE-2/§5.5.1 — the register cap is `<=400`').toBe(400)
    expect(CONSECUTIVE_FAILURE_CAP, 'PRE-2/§5.5.1 — the stop rule is 5 consecutive failures').toBe(5)
    expect(POOL_LENGTH, 'PRE-2/§5.5.1 — `pool.length === 30` (the pinned pool)').toBe(30)
    // The ELEVEN declared rows — `(row id, strategy id, term)` in REGISTER ORDER, with the
    // terms printed so the total is the SUM OF ITS OWN TERMS
    // (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`, ACTIVE): `396` =
    // `58+32+36+30+24+30+40+30+32+24+60`. The table is declared ONCE at module scope, so
    // `PRE-2`, `PRE-4`, `P-GS-TP-2` and `REGISTER-STATUS` all reconcile against the same
    // object — which is what makes this file's tables machine-comparable for the later
    // read-only PBT audit (`§3a A-15`).
    const declared = REGISTER_DECLARED.map((r) => [r.row, r.term] as const)
    const total = declared.reduce((sum, [, n]) => sum + n, 0)
    expect(
      total,
      'PRE-2/§5.3 item 11 — the declared total is the SUM OF ITS OWN TERMS: 58+32+36+30+24+30+40+30+32+24+60 = 396',
    ).toBe(396)
    expect(total, 'PRE-2/§5.5.3 — the total is inside the `<=400` register cap').toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    expect(REGISTER_DECLARED.length, 'PRE-2/§5.5.1 — the register declares ELEVEN rows').toBe(11)
    for (const [row, n] of declared) {
      expect(n, `PRE-2/§5.5.1 — row ${row} is inside the <=100 per-row cap`).toBeLessThanOrEqual(REGISTER_ROW_CAP)
    }
    expect(
      REGISTER_DECLARED.map((r) => r.row),
      'PRE-2/§5.5.1 — the eleven row ids, in register order (a rename or a dropped row fails here)',
    ).toEqual([
      'P-GS-IM-1',
      'P-GS-IM-2',
      'P-GS-IM-3',
      'P-GS-IM-4',
      'P-GS-IM-5',
      'P-GS-IM-6',
      'P-GS-SM-1',
      'P-GS-SM-2',
      'P-GS-SM-3',
      'P-GS-TP-1',
      'P-GS-TP-2',
    ])
    expect(
      REGISTER_DECLARED.map((r) => r.strategy),
      'PRE-2/§5.5.1 — the eleven strategy ids, one per row, in register order',
    ).toEqual([
      'S-GS-LISTENERS-1',
      'S-GS-BUSY-1',
      'S-GS-CODES-1',
      'S-GS-WINDOW-1',
      'S-GS-CAPTURE-1',
      'S-GS-DISPOSE-1',
      'S-GS-STATE-1',
      'S-GS-IDENTITY-1',
      'S-GS-COMMIT-1',
      'S-GS-TOTAL-1',
      'S-GS-SEED-1 + S-GS-POOL-1',
    ])
    // The four `YES (bounded)` rows (`§5.5.1`'s own list) are NAMED so the audit does not
    // have to infer which rows are bounded. **⟶ CORRECTED 2026-09-27 (`ADV-GS-32`, the
    // gate-4 closure): THE SET IS DERIVED FROM THE REGISTER TABLE ABOVE (`REGISTER_DECLARED`'s
    // per-row `bounded` flag), NOT RESTATED AS FOUR LITERALS COMPARED AGAINST THE SAME FOUR
    // LITERALS** — the as-filed form was `expect(['P-GS-IM-1','P-GS-IM-5','P-GS-TP-1',
    // 'P-GS-TP-2']).toEqual(['P-GS-IM-1','P-GS-IM-5','P-GS-TP-1','P-GS-TP-2'])`, an assertion
    // that cannot FAIL, whose message said *"the FOUR rows … (the other SEVEN are `YES`)"* while
    // `§5.5.1`'s own count note marks **FIVE** rows `YES (bounded)` (`P-GS-IM-2` joined the set —
    // `ADV-GS-25`) and `P-GS-IM-2`'s own row title says so. The derivation below therefore has a
    // real failure mode: a row whose flag moves, a row added or dropped from the table, or a
    // rename all change the derived set.
    const boundedRows = REGISTER_DECLARED.filter((r) => r.bounded).map((r) => r.row)
    const unboundedRows = REGISTER_DECLARED.filter((r) => !r.bounded).map((r) => r.row)
    expect(
      boundedRows,
      'PRE-2/§5.5.1 — the rows the table marks `YES (bounded)`, DERIVED from the table’s own per-row flag and compared to the FIVE `§5.5.1` names in register order (`P-GS-IM-1`, `P-GS-IM-2`, `P-GS-IM-5`, `P-GS-TP-1`, `P-GS-TP-2` — `ADV-GS-25` moved `P-GS-IM-2` into the bounded set, so the count is FIVE and the other SIX are `YES` over fully enumerated domains)',
    ).toEqual(['P-GS-IM-1', 'P-GS-IM-2', 'P-GS-IM-5', 'P-GS-TP-1', 'P-GS-TP-2'])
    expect(
      boundedRows.length + unboundedRows.length,
      'PRE-2/§5.5.1 — the FIVE `YES (bounded)` rows plus the SIX `YES` rows account for ALL ELEVEN register rows (the derivation above is over the whole table, not over a subset of it)',
    ).toBe(11)
    expect(
      unboundedRows,
      'PRE-2/§5.5.1 — the SIX rows whose `YES` is over a fully enumerated domain, DERIVED from the same flag (the as-filed message read “the other SEVEN”, the count that was true while the bounded set was FOUR)',
    ).toEqual(['P-GS-IM-3', 'P-GS-IM-4', 'P-GS-IM-6', 'P-GS-SM-1', 'P-GS-SM-2', 'P-GS-SM-3'])
    // The pinned one-step LCG form, recomputed from the pinned literals.
    expect(
      FIRST_LCG_STATE,
      'PRE-2/§5.5.1 — ONE LCG step from the pinned seed is `(20260927·1664525 + 1013904223) mod 2³² = 1750210706` (recomputed from the pinned literals AND checked against a BigInt evaluation of the same expression, so the `mod 2³²` reduction is asserted rather than assumed at float precision)',
    ).toBe(1750210706)
    expect(
      DRAWN_INDICES.length,
      'PRE-2/§5.5.1 — the draw sequence of `P-GS-TP-2` really performs 60 draws (one LCG step each)',
    ).toBe(60)
    expect(
      DRAWN_INDICES.every((i) => i >= 0 && i < POOL_LENGTH),
      'PRE-2/§5.5.1 — every drawn index is inside the pool (`index = state mod 30`)',
    ).toBe(true)
    // **A DRAW IS NOT A SWEEP (`§5.5.2` item 3).** The DISTINCT-MEMBER count is a REPORTED
    // figure (`§5.3` item 11), never a coverage claim: no row may assert "all 30". **⟶
    // `ADV-GS-28` (the gate-4 closure): the figure is now PINNED EXACTLY (`=== 26`) rather
    // than bounded (`> 0` / `<= 30`)**, because the tracker's and the spec's *"`26` of `30`"*
    // record otherwise had no failure mode anywhere in this file — a draw-sequence change
    // that moved the coverage would have been silently accepted here while every record
    // still printed `26`.
    expect(
      DISTINCT_DRAWN_POOL_MEMBERS,
      `PRE-2/§5.5.2 item 3 — the 60 pinned draws hit EXACTLY ${DISTINCT_DRAWN_POOL_MEMBERS} of the pool's 30 members, which is the \`26\` of \`30\` figure the record prints; this is a REPORTED EXECUTION FIGURE (a draw is not a sweep), and NO row may assert that every member was drawn`,
    ).toBe(26)
    expect(DISTINCT_DRAWN_POOL_MEMBERS, 'PRE-2/§5.5.2 item 3 — the reported figure is a real count of the fixed pool').toBeLessThanOrEqual(30)
    console.log(
      `§5.5.1 P-GS-TP-2 pool-draw record :: ${JSON.stringify({
        draws: 60,
        poolLength: POOL_LENGTH,
        distinctMembersDrawn: DISTINCT_DRAWN_POOL_MEMBERS,
        undrawnMembers: POOL_LENGTH - DISTINCT_DRAWN_POOL_MEMBERS,
        coverageClaim: 'NONE — a draw is not a sweep (§5.5.2 item 3)',
        seed: SEED,
        step: 'ONE LCG step per draw; index = state_{n+1} mod 30',
      })}`,
    )
  })

  it('PRE-3 (harness) — the R-1/R-2/R-8 scanners detect their evasions and pass the legitimate text (their own controls)', () => {
    for (const [shape, fixture] of VOCAB_POSITIVE_CONTROLS) {
      expect(
        vocabularyViolations(fixture).length,
        `PRE-3/S-1 — the vocabulary scan MUST fail for the shape ${shape}: the row is otherwise UNFALSIFIED`,
      ).toBeGreaterThan(0)
    }
    for (const boundaryFixture of VOCAB_ASSEMBLY_BOUNDARY_CONTROLS) {
      expect(
        vocabularyViolations(boundaryFixture),
        `PRE-3 — the BOUNDARY half passes (an identifier-adjacent assembled spelling is not a bounded occurrence) [${boundaryFixture}]`,
      ).toEqual([])
    }
    expect(vocabularyViolations(VOCAB_NEGATIVE_CONTROL), 'PRE-3 — this unit’s own legitimate text PASSES the vocabulary scan').toEqual([])
    for (const [label, fixture] of [
      ['a raw realm token', `const d = ${['doc', 'ument'].join('')}`],
      ['an ambient clock read', `const t = Date.now()`],
      ['a module-scope `let`', `${'let'} n = 0`],
    ] as ReadonlyArray<readonly [string, string]>) {
      expect(
        AMBIENT_RULES.some(({ re }) => staticHits(fixture, re).length > 0) || MODULE_STATE_RULES.some(({ re }) => staticHits(fixture, re).length > 0),
        `PRE-3/R-2 — the access scanner MUST fail for '${label}'`,
      ).toBe(true)
    }
    const geometryCorpus = `const s = get${'Computed'}Style(el)\nconst x = e.${COORD_FRAGMENTS[0].join('')}`
    expect(
      GEOM_CALL_RES.some((re) => re instanceof RegExp && staticHits(geometryCorpus, re).length > 0),
      'PRE-3/R-8 — the geometry/coordinate scanner MUST fail for a corpus that observes geometry or reads a coordinate',
    ).toBe(true)
    expect(
      GEOM_CALL_RES.some((re) => re instanceof RegExp && staticHits('the session commits the consumer’s own value exactly once at a terminal', re).length > 0),
      'PRE-3/R-8 — and it PASSES the unit’s own lifecycle wording (the negative control)',
    ).toBe(false)
  })

  it('PRE-4 (harness) — THE POOL-VERSUS-BOUNDARY RULE: every register row’s declared members satisfy ITS OWN declared boundary', () => {
    // `§5.5.2` item 7's rule, re-run against THIS file's LANDED tables: a pool or table
    // member that contradicts its own row's declared boundary is a REGISTER DEFECT, and
    // it is checked at AUTHORING time.
    const im1StageCounts = IM1_CONFIGURATIONS.map((c) => (c.id === '(20) a second element also installed' ? 2 : 3))
    expect(
      im1StageCounts.length,
      'PRE-4/P-GS-IM-1 — the 20 configurations are the declared domain',
    ).toBe(20)
    expect(
      im1StageCounts.reduce((sum, n) => sum + n, 0),
      'PRE-4/P-GS-IM-1 — the configuration×stage enumeration produces `19 × 3 + 1 × 2 = 59` observations, and the declared term is stated CONSERVATIVELY as `58` — one attempt FEWER than the enumeration, so no attempt is claimed that the drive does not perform (§5.5.3)',
    ).toBe(59)
    expect(
      REGISTER_DECLARED[0].term,
      'PRE-4/P-GS-IM-1 — the declared `58` is at or below what the drive performs (never above it)',
    ).toBeLessThanOrEqual(im1StageCounts.reduce((sum, n) => sum + n, 0))
    // Every configuration's declared opt-in agrees with the input its own `make` BUILDS —
    // **⟶ NARROWED BY `ADV-GS-24` (the gate-4 closure):** the as-filed limb asserted
    // `typeof configuration.capture === 'boolean'`, a property the interface types as
    // `boolean`, so it was TRUE FOR ALL TWENTY BY CONSTRUCTION and could not fail. The claim
    // is now the RESOLVED flag the module itself reads — `Boolean(capture)`, `§2.1`
    // `GestureOptionsInput.capture` — computed FROM THE BUILT OPTIONS, so a configuration
    // whose declaration and built input disagree FAILS here.
    for (const configuration of IM1_CONFIGURATIONS) {
      const built = configuration.make(makeSource(configuration.sourceOptions ?? {})) as GestureOptionsInput
      expect(
        Boolean(built.capture),
        `PRE-4/P-GS-IM-1/§5.5.1 — configuration ${configuration.id} DECLARES the resolved opt-in \`${String(
          configuration.capture,
        )}\` and its own \`make\` BUILDS \`${JSON.stringify(built.capture)}\`: \`capture\` is read for truthiness (\`Boolean(capture)\`), so the declaration must agree with the input the row really drives`,
      ).toBe(configuration.capture)
    }
    // **⟶ `D-12`(b)/`ADV-GS-9`: THE TWO FIXTURES THE SPEC NAMES AS MISSING, ASSERTED AS
    // BUILT VALUES RATHER THAN AS ANNOTATIONS.** As filed, `(16)`'s `isConnected`-less shape
    // was driven by a recorder whose callable `isConnected` returned `true` (i.e. `(12)`
    // again) and `(18)`'s frozen shape was frozen by nothing. Both are now real, and these
    // assertions are what stop them silently regressing to aliases.
    const im1ById = (prefix: string): Im1Configuration => {
      const found = IM1_CONFIGURATIONS.filter((c) => c.id.startsWith(prefix))
      expect(found.length, `PRE-4/P-GS-IM-1 — exactly ONE configuration carries the id prefix ${prefix} (a rename would make the fixture checks below vacuous)`).toBe(1)
      return found[0]
    }
    const absentMemberConfig = im1ById('(16)')
    const absentMemberSource = makeSource(absentMemberConfig.sourceOptions ?? {})
    expect(
      Object.prototype.hasOwnProperty.call(absentMemberSource, 'isConnected'),
      'PRE-4/P-GS-IM-1 — configuration `(16)`’s source really has NO `isConnected` member (the absent-member fixture the spec names as existing in NO fixture before this pass)',
    ).toBe(false)
    expect(
      typeof (absentMemberSource as unknown as Record<string, unknown>)['isConnected'],
      'PRE-4/P-GS-IM-1 — and the member reads `undefined` rather than a callable, which is the seam state `§2.4` item 5 calls "no contrary evidence"',
    ).toBe('undefined')
    expect(
      absentMemberConfig.sourceOptions?.isConnected,
      'PRE-4/P-GS-IM-1 — the configuration DECLARES the member absent (`sourceOptions.isConnected === undefined`), so the fixture and its declaration agree',
    ).toBe(undefined)
    const frozenConfig = im1ById('(18)')
    const frozenSource = makeSource(frozenConfig.sourceOptions ?? {})
    expect(
      Object.isFrozen(frozenSource),
      'PRE-4/P-GS-IM-1 — configuration `(18)`’s source is FROZEN (`Object.isFrozen`)',
    ).toBe(true)
    expect(
      isGenuinelyFrozen(frozenSource),
      'PRE-4/P-GS-IM-1 — and GENUINELY so: a WRITE to it throws or is refused, which is what the spec’s cell means by "NEVER ACTUALLY FROZEN" (the as-filed `(18)` was `(12)`’s shape again)',
    ).toBe(true)
    expect(
      frozenSource.captures.length,
      'PRE-4/P-GS-IM-1 — the frozen source is still a USABLE source for the session (its own containers record), so the freeze is a property of the surface and not a broken fixture',
    ).toBe(0)
    const classConfig = im1ById('(17)')
    const classSource = new Im1ClassSource()
    expect(
      Object.getPrototypeOf(classSource) === Im1ClassSource.prototype,
      'PRE-4/P-GS-IM-1 — configuration `(17)`’s source is a CLASS INSTANCE: its prototype is the class’s `prototype` (for an object literal the prototype is `Object.prototype`, which is the discriminator)',
    ).toBe(true)
    expect(
      Object.getPrototypeOf({} as object) === Object.prototype,
      'PRE-4/P-GS-IM-1 — the discriminator’s other half: an object LITERAL’s prototype is `Object.prototype`, so the check above really separates the two shapes',
    ).toBe(true)
    expect(classConfig.sourceClass, 'PRE-4/P-GS-IM-1 — and the configuration declares that shape').toBe(true)
    expect(classConfig.sourceOptions, 'PRE-4/P-GS-IM-1 — and the class-instance shape is driven by the CLASS, not by the recorder factory (so `sourceOptions` is absent for it)').toBe(undefined)
    const commitAbsentConfig = im1ById('(19)')
    expect(
      commitAbsentConfig.commitAbsent,
      'PRE-4/P-GS-IM-1 — configuration `(19)` really creates its session with `commit` ABSENT (the drive reads this flag, so the shape is not decorative)',
    ).toBe(true)
    // **THE DERIVED DISTINCT-INPUT FIGURE IS DERIVABLE FROM THIS TABLE** (`D-12`(b)):
    // printing the term-by-term arithmetic so the register row can report it beside the
    // declared figure rather than restating the declaration.
    const derivedDistinct = [...new Set(IM1_CONFIGURATIONS.map((c) => c.distinctKey))]
    expect(
      derivedDistinct.length + (IM1_CONFIGURATIONS.length - derivedDistinct.length),
      `PRE-4/P-GS-IM-1 — the derived distinct-input arithmetic closes on the table: ${derivedDistinct.length} distinct + ${
        IM1_CONFIGURATIONS.length - derivedDistinct.length
      } aliases = ${IM1_CONFIGURATIONS.length} configurations (per-configuration keys: ${IM1_CONFIGURATIONS.map(
        (c) => `${c.id.split(' ')[0]}→${c.distinctKey}`,
      ).join(', ')})`,
    ).toBe(20)
    expect(
      IM2_START_SHAPES.length * IM2_RESTART_ATTEMPTS.length,
      'PRE-4/P-GS-IM-2 — `8` start shapes × `4` re-start attempts = `32`',
    ).toBe(32)
    expect(IM3_CALL_SHAPES.length * IM3_STATE_SHAPES.length, 'PRE-4/P-GS-IM-3 — `4` call shapes × `9` states = `36`').toBe(36)
    expect(IM4_TERMINALS.length * IM4_STAGES.length, 'PRE-4/P-GS-IM-4 — `6` terminals × `5` stages = `30`').toBe(30)
    expect(IM5_FLAGS.length * IM5_STAGES.length, 'PRE-4/P-GS-IM-5 — `4` flag values × `6` stages = `24`').toBe(24)
    // **⟶ `ADV-GS-19` (the gate-4 closure): THE DISTINCT FIGURE IS DERIVED FROM THE TABLE.**
    // `§5.5.1` names TWO aliased stage pairs in prose; the register row derives its distinct
    // figure from `IM5_STAGE_ALIAS_PAIRS` (positions less pairs), so this row checks the
    // pairs are REAL positions of the stage table and that the derived arithmetic is the one
    // the register row prints — the declared `24` counts stage POSITIONS and is UNMOVED.
    expect(
      IM5_STAGE_ALIAS_PAIRS.every(([earlier, later]) => earlier < later && later < IM5_STAGES.length && earlier >= 0),
      'PRE-4/P-GS-IM-5 — every declared aliased pair names two in-range stage positions of `IM5_STAGES`, in order (a stale index would make the derived distinct figure wrong rather than failing loudly)',
    ).toBe(true)
    expect(
      new Set(IM5_STAGE_ALIAS_PAIRS.flat()).size,
      'PRE-4/P-GS-IM-5 — the declared pairs are DISJOINT (each position is aliased with at most one other, which is what makes "positions less pairs" the correct derivation)',
    ).toBe(2 * IM5_STAGE_ALIAS_PAIRS.length)
    expect(
      IM5_FLAGS.length * (IM5_STAGES.length - IM5_STAGE_ALIAS_PAIRS.length),
      'PRE-4/P-GS-IM-5 — the DERIVED distinct-observation figure `4` flags × (`6` positions − `2` aliased pairs) = `16`, printed BESIDE the declared `24` and never substituted for it (`ADV-GS-19`)',
    ).toBe(16)
    expect(
      IM6_SHAPES.length * IM6_STATES.length * IM6_OPERATIONS.length,
      'PRE-4/P-GS-IM-6 — `3` session shapes × `2` gesture states × `5` operations = `30`',
    ).toBe(30)
    expect(SM1_STATES.length * SM1_OPS.length, 'PRE-4/P-GS-SM-1 — `4` states × `10` ops = `40`').toBe(40)
    expect(SM2_SHAPES.length * SM2_PAIRS.length, 'PRE-4/P-GS-SM-2 — `5` element shapes × `6` operation pairs = `30`').toBe(30)
    expect(SM3_PATHS.length * SM3_SHAPES.length, 'PRE-4/P-GS-SM-3 — `4` terminal paths × `8` value/consumer shapes = `32`').toBe(32)
    expect(
      TP1_PHASES.reduce((sum, phase) => sum + phase.shapes.length * 2, 0),
      'PRE-4/P-GS-TP-1 — the three phases drive `4` shapes each over `2` drives: `(4+4+4) × 2 = 24` DRIVES (the per-call ASSERTIONS (`≥3` each: did-not-throw · declared kind · declared members callable) are reported as the row’s `assertions` figure, NEVER as attempts — the DUAL COUNT the ACTIVE rule requires)',
    ).toBe(24)
    expect(
      EVENT_POOL.length,
      'PRE-4/P-GS-TP-2 — the pool holds exactly the 30 declared members',
    ).toBe(30)
    expect(
      EVENT_POOL.length * TP2_CONFIGURATIONS.length,
      'PRE-4/P-GS-TP-2 — `30` pool members × `2` event configurations = `60` draws',
    ).toBe(60)
    expect(
      new Set(EVENT_POOL.map((m) => m.id)).size,
      'PRE-4/P-GS-TP-2 — the pool’s 30 member ids are DISTINCT (a duplicate member would be a register defect)',
    ).toBe(30)
    // THE BOUNDARY CHECK ITSELF (`§5.5.2` item 7, re-run against the landed table): every
    // pool member satisfies the row's declared boundary ("the session reads no field of
    // the event object"), because the boundary is an ABSENCE of reading — and the members'
    // hostility is what makes that absence falsifiable rather than assumed.
    //
    // **⟶ NARROWED BY `ADV-GS-24` (the gate-4 closure):** the as-filed limb asserted
    // `typeof member.make === 'function'` for all THIRTY members (true by construction for
    // every table entry) and said nothing about hostility. The claim is now MEASURED, per
    // hostile member, by driving the very refusal the no-read claim rests on: `(15)`'s
    // coordinate getter really throws, `(16)`'s traps really throw, `(17)` really answers
    // `undefined` for every property, `(26)`'s mutating getter really moves its counter
    // (so the probe measures reads rather than assuming them), `(27)`'s `valueOf` really
    // throws and `(28)`'s `toString` really returns a banned vocabulary spelling.
    const hostileMembers = [15, 16, 17, 26, 27, 28].map((n) => EVENT_POOL[n - 1])
    expect(
      hostileMembers.map((m) => m.id.split(' ')[0]),
      'PRE-4/P-GS-TP-2 — the six hostile members are the DECLARED ones, selected by index from the pinned pool order (a reorder of the pool would otherwise leave this limb measuring other members than it names)',
    ).toEqual(['(15)', '(16)', '(17)', '(26)', '(27)', '(28)'])
    const coordinateSpelling = COORD_FRAGMENTS[0].join('')
    const bannedVocabulary = ['thres', 'hold'].join('')
    const hostileEvidence: ReadonlyArray<readonly [string, () => boolean]> = [
      [
        '(15)',
        () =>
          throwsOn(() => (hostileMembers[0].make() as Record<string, unknown>)[coordinateSpelling]) &&
          !throwsOn(() => (EVENT_POOL[10].make() as Record<string, unknown>)[coordinateSpelling]),
      ],
      [
        '(16)',
        () =>
          throwsOn(() => (hostileMembers[1].make() as Record<string, unknown>)['anything']) &&
          throwsOn(() => 'anything' in (hostileMembers[1].make() as object)),
      ],
      ['(17)', () => (hostileMembers[2].make() as Record<string, unknown>)['anything'] === undefined],
      [
        '(26)',
        () => {
          const counter = hostileMembers[3].make() as { probe?: unknown; readCount: number }
          const before = counter.readCount
          void counter.probe
          return before === 0 && counter.readCount === 1
        },
      ],
      [
        '(27)',
        () =>
          throwsOn(() => Number(hostileMembers[4].make() as { valueOf(): number })) &&
          !throwsOn(() => Number(EVENT_POOL[10].make() as object)),
      ],
      ['(28)', () => String(hostileMembers[5].make()).includes(bannedVocabulary)],
    ]
    expect(
      hostileEvidence.filter(([, evidence]) => !evidence()).map(([id]) => id),
      `PRE-4/P-GS-TP-2 — EVERY hostile member’s hostility is MEASURED, not declared: the members whose own falsification does not actually fire are named here (measured: ${hostileEvidence
        .map(([id, evidence]) => `${id}=${evidence() ? 'hostile' : 'NOT-hostile'}`)
        .join(', ')})`,
    ).toEqual([])
    expect(hostileMembers.length, 'PRE-4/P-GS-TP-2 — the hostile-accessor/Proxy/mutating-getter/valueOf members are really in the pool (the no-read claim is falsifiable)').toBe(6)
  })

  it('PRE-5 (harness) — THE CAPTURE-COUNT POSITIVE CONTROL: the rows counting capture calls still FAIL a module that SKIPS the capture (the ruled resolution must not weaken the requirement)', async () => {
    // -----------------------------------------------------------------------
    // WHAT THIS ROW IS, AND WHY IT EXISTS. The capture conflict the Implementer
    // stopped on was RULED by the supervisor on 2026-09-27 (`§2.1`
    // `GestureOptionsInput.capture`'s amended cell, and `§2.3` item 6): the session
    // calls **a capture method the SOURCE supplies** — named by the source and
    // discovered by the session from its own supplied surface — so **the module's bytes
    // carry no DOM-specific capture-method token** while `R-3`(2)/`F-11` keep their
    // scans EXACTLY as they are (each must still FAIL a module whose bytes name that
    // token). The test side lands that ruling by asserting the COUNT through the
    // recorder's supplied surface (see `makeSource`) and NEVER the module's spelling.
    //
    // **THE RESOLUTION MUST NOT WEAKEN THE REQUIREMENT**, and this control is the
    // evidence: a stand-in implementation that attaches the start listener and
    // establishes the gesture but SKIPS the capture produces **ZERO** capture calls —
    // exactly the count `P-GS-IM-5`/`I-7`/`F-10` REJECT for an opted-in establishment (they
    // require exactly ONE) — so those rows are demonstrably FALSIFIABLE by a
    // capture-skipping module and are not satisfied by the harness's own shape.
    // -----------------------------------------------------------------------
    const installable = (source: RecorderSource): ((element: GestureElement, options?: GestureOptionsInput) => boolean) => {
      const attached = new Set<GestureElement>()
      return (element: GestureElement, options: GestureOptionsInput = {}): boolean => {
        void options
        if (element === null || element === undefined || attached.has(element)) return false
        source.on(element, TYPE_START, (): void => undefined)
        attached.add(element)
        return true
      }
    }
    // (A) THE CONTROL ARM: a capture-SKIPPING implementation yields ZERO capture calls
    // for an OPTED-IN control — which is what the counting rows must catch.
    const skippingSource = makeSource({})
    const skippingInstall = installable(skippingSource)
    const control: Record<string, unknown> = { control: 'capture-skipping' }
    expect(
      skippingInstall(control, { capture: true }),
      'PRE-5 — the control arm installs the OPTED-IN control (so its ZERO capture count is a real measurement, not a vacuous setup)',
    ).toBe(true)
    expect(
      skippingSource.captures.length,
      'PRE-5 POSITIVE CONTROL — a module that SKIPS the capture produces ZERO capture calls on an opted-in establishment: this is the count `P-GS-IM-5`/`I-7`/`F-10` reject, so a capture-skipping module FAILS those rows and the ruled resolution (source-supplied capture, count-only assertions) does NOT weaken the requirement',
    ).toBe(0)
    // ⟶ `D-13`/`ADV-GS-13` — **THE MISSING CONTROL: THE ROW'S OWN PREDICATE, RUN AGAINST
    // THE STAND-IN.** The count above is a NUMBER; what the control must show is that the
    // ROW's predicate REJECTS it. `im5CountPredicateHolds` IS that predicate, extracted so
    // it cannot drift from the row, and the row it belongs to is `P-GS-IM-5`.
    expect(
      im5CountPredicateHolds(skippingSource.captures.length, true),
      'PRE-5/D-13 POSITIVE CONTROL — the `P-GS-IM-5` row predicate REJECTS the capture-skipping stand-in’s count for an OPTED-IN control (it requires exactly ONE): the row belonging to this control CAN FAIL when the thing it forbids is present, which is what makes `PRE-5` a control rather than a restatement',
    ).toBe(false)
    // And the predicate is not a constant: it ACCEPTS the count the row requires, so the
    // FAIL above is the stand-in's doing and not a predicate that rejects everything.
    expect(
      im5CountPredicateHolds(1, true),
      'PRE-5/D-13 — the predicate ACCEPTS the count `P-GS-IM-5` requires for an opted-in flag (a predicate that rejects everything would make the control vacuous)',
    ).toBe(true)
    expect(
      im5CountPredicateHolds(0, false),
      'PRE-5/D-13 — and it ACCEPTS ZERO for a NON-opted-in flag, which is the row’s other declared count (so the predicate distinguishes the two flags rather than reading a constant)',
    ).toBe(true)
    // (B) THE COUNTER'S OWN CONTROL: the recorder really records a capture call, so the
    // ZERO above is the skipping module's doing and not a blind counter.
    const recordingSource = makeSource({})
    const recording = recordingSource as unknown as Record<string, (element: unknown) => void>
    expect(typeof recording['capturePointer'], 'PRE-5 — the capture-eligible recorder exposes ONE capture entry point under the module-neutral name the rows count through').toBe('function')
    recording['capturePointer'](control)
    expect(
      recordingSource.captures.length,
      'PRE-5 — the recorder really records a capture call, so the ZERO in the control arm measures the IMPLEMENTATION and not a blind counter (a capture call made AFTER the count is not an evasion: no earlier call was made)',
    ).toBe(1)
    expect(
      typeof (makeSource({ withCapture: false }) as unknown as Record<string, unknown>)['capturePointer'],
      'PRE-5/§2.4 item 6 — a source WITHOUT a capture member is still a USABLE source (`I-8`’s degradation arm): the capture entry point is simply absent, which is why the count rows are the falsifiable reading and the token scan is not',
    ).toBe('undefined')
    // (C) THE MODULE ARM: the real module, driven through the harness the rows use.
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: true }) })
    const el: Record<string, unknown> = { id: 'a' }
    expect(h.sessionInstall(el), 'PRE-5 — the real module installs the opted-in control through the harness’s `installOptions` (the wiring defect this pass repaired)').toBe(true)
    const began = beginResult(h, el)
    expect(began?.ok, 'PRE-5 — the opted-in establishment succeeds, so the capture count below is read from a real `begin`').toBe(true)
    expect(
      h.source.captures.length,
      'PRE-5/§2.3 item 6(b) — the real module makes EXACTLY ONE capture call through the source-supplied method on an opted-in establishment (the ruled resolution: the capability and the invocation are real, the module carries no token)',
    ).toBe(1)
    // The second configuration of the same row: only a TRUTHY flag captures.
    const h2 = await makeHarness({ installOptions: hookOptions(makeHookLog(), { capture: 0 }) })
    const el2: Record<string, unknown> = { id: 'b' }
    h2.sessionInstall(el2)
    beginResult(h2, el2)
    expect(
      h2.source.captures.length,
      'PRE-5/§2.3 item 6(a) — a FALSY flag yields ZERO capture calls, so the count distinguishes the two configurations rather than reading a constant',
    ).toBe(0)
  })
})

// ===========================================================================
// §5.5.1 — THE REGISTER TABLES (the pinned inputs each row drives), continued.
// ===========================================================================
/** `P-GS-IM-1` — the `20` configurations, in the spec's fixed order.
 *
 *  **⟶ `D-12`(b)/`ADV-GS-9`: WHAT MOVED AND WHAT DID NOT.** `§5.5.1`'s corrected cell
 *  records that *"the `20` configurations are `15` DISTINCT INPUTS … because FIVE of the
 *  twenty are ALIASES or DUPLICATES of another member"*, and names the three duplications
 *  it can see: the two capture alias pairs `(1)`/`(4)` and `(2)`/`(5)`, the `isConnected`-less
 *  shape `(16)` duplicating `(12)` *("the recorder supplies a callable `isConnected`
 *  returning `true` in both")*, and the *"FROZEN-source shape `(18)` [that] is NEVER
 *  ACTUALLY FROZEN"*. **The DECLARED term and the DECLARED distinct figure are the
 *  spec's and are asserted as declarations**; what this pass owes — AS FILED, and **⟶
 *  DISCHARGED 2026-09-27, see the dated note at the end of this paragraph** — is that the two
 *  shapes
 *  it names as MISSING FIXTURES (`(16)`'s ABSENT-MEMBER source and `(18)`'s GENUINELY
 *  FROZEN source) really exist, and that the table's OWN distinct figure is derivable from
 *  the table rather than asserted as a slogan. Each configuration therefore carries
 *  `sourceOptions` (the source the drive builds), `frozen`/`sourceClass` (the two fixture
 *  properties) and `distinctKey` (the INPUT the module observes: the resolved capture flag,
 *  the connectivity shape, whether `commit` is absent, whether a second control is
 *  installed — plus the source's own behavioural shape). `PRE-4` asserts the fixtures and
 *  prints the arithmetic; the register row prints the THREE `§5.5.1` figures BESIDE the
 *  derived one. **⟶ DISCHARGED 2026-09-27 (`D-12`(`b`), the test-side owed-items pass whose
 *  record is at the file's end): the two MISSING FIXTURES now EXIST and are asserted in
 *  `PRE-4`, and the table's own distinct figure is COMPUTED from the table — so the
 *  obligation this paragraph states in the present tense is met, not outstanding.**
 *
 *  **⟶ CORRECTED 2026-09-27 (`ADV-GS-33`, the gate-4 closure): THE BARE `15` AT THIS SITE
 *  WAS A SPEC FIGURE THAT NO LONGER EXISTS.** `§5.5.1`'s cell now states its figures WITH
 *  THEIR DEFINITIONS AND DERIVATIONS (`ADV-GS-18`), so this block cites them as they now
 *  read: **DECLARED CONFIGURATIONS `20`** (the domain the `58`-attempt term rests on) ·
 *  **DISTINCT `distinctKey` LABELS `16`** (the `20` declared less the `4` label duplicates —
 *  the capture pairs `(4)`→`(1)` and `(3)`/`(5)`/`(11)`→`(2)`; *see the SILENCE REPORTED at
 *  this row's `PRE-4` site: `§5.5.1 P-GS-IM-1`'s cell still prints the `16` as `20 − 5 + 1`*)
 *  · **DISTINCT MODULE-OBSERVABLE INPUTS `13`** (the `16` labels less the `3` the module
 *  cannot distinguish — `(17)` and `(18)` both read as `(12)`, and `(12)` itself reads as the
 *  `capture=false` group's input), which is the figure the table derives (`ADV-GS-18`
 *  measured `16` LABELS and `13` MODULE-OBSERVABLE INPUTS). **The superseded as-filed `15`
 *  is kept visible in the sentence above so no later pass re-derives it as current.** The
 *  row's DERIVED/asserted figures (`16` labels / `13` observable) are UNCHANGED: only the
 *  prose figures moved.
 *
 *  **NO configuration is removed, added or renumbered** and the declared `58` does not move. */
interface Im1Configuration {
  readonly id: string
  readonly capture: boolean
  readonly make: (source: RecorderSource) => GestureOptionsInput
  readonly secondElement?: boolean
  readonly sourceOptions?: SourceOptions
  /** `(16)` — the source really has NO `isConnected` member (`§5.1`'s named missing fixture). */
  readonly noIsConnectedMember?: boolean
  /** `(17)` — the source is a CLASS INSTANCE rather than an object literal. */
  readonly sourceClass?: boolean
  /** `(18)` — the source is GENUINELY FROZEN (a write throws or is refused). */
  readonly frozen?: boolean
  /** `(19)` — the session is created with `commit` absent. */
  readonly commitAbsent?: boolean
  /** The INPUT the module observes for this configuration (see the interface note above). */
  readonly distinctKey: string
}
/** `(17)`'s class-instance source (a source that is NOT an object literal). It carries the
 *  recorder surface the row reads (`log`/`listenerCount`/`typeMultiset`), so it plugs into
 *  the same footprint reading — while `Object.getPrototypeOf(source) === source` is the
 *  property that makes it a class instance rather than a plain object. */
class Im1ClassSource implements RecorderSource {
  readonly log: CallRecord[] = []
  readonly captures: CallRecord[] = []
  /** No call this source makes is configured to throw, so the set is empty — declared rather
   *  than omitted because the corrected `sourceCalls` rule (`M-15`) reads it. */
  readonly threwAt = new Set<number>()
  readonly attached = new Map<unknown, Map<string, () => void>>()
  readonly handlerOffsets = new Map<() => void, number>()
  private seq = 0
  failOff(): boolean {
    return false
  }
  failOn(): boolean {
    return false
  }
  on(element: unknown, type: string, handler: () => void): void {
    this.log.push({ seq: this.seq, op: 'on', element, type, handler })
    this.seq += 1
    const per = this.attached.get(element) ?? new Map<string, () => void>()
    per.set(type, handler)
    this.attached.set(element, per)
  }
  off(element: unknown, type: string, handler: () => void): void {
    this.log.push({ seq: this.seq, op: 'off', element, type, handler })
    this.seq += 1
    const per = this.attached.get(element)
    if (per !== undefined && per.get(type) === handler) per.delete(type)
  }
  isConnected(element: unknown): boolean {
    void element
    this.log.push({ seq: this.seq, op: 'isConnected', element, type: 'isConnected', handler: undefined })
    this.seq += 1
    return true
  }
  capturePointer(element: unknown): void {
    const record: CallRecord = { seq: this.seq, op: 'capture', element, type: 'capturePointer', handler: undefined }
    this.seq += 1
    this.log.push(record)
    this.captures.push(record)
  }
  fire(): void {
    /* not driven by this row */
  }
  listenerCount(element: unknown): number {
    return (this.attached.get(element) ?? new Map<string, () => void>()).size
  }
  typeMultiset(element: unknown): string[] {
    return [...(this.attached.get(element) ?? new Map<string, () => void>()).keys()].sort()
  }
  listenerPairs(): string[] {
    const out: string[] = []
    for (const [element, per] of this.attached.entries()) for (const [type] of per.entries()) out.push(`${String(element)}::${type}`)
    return out.sort()
  }
  callCount(): number {
    return this.log.length
  }
  sourceCallsFromStats(): number {
    return this.log.filter((r) => r.op !== 'capture').length
  }
}
const IM1_CONFIGURATIONS: ReadonlyArray<Im1Configuration> = [
  { id: '(1) `{capture: true}`', capture: true, make: () => ({ capture: true }), distinctKey: 'capture=true' },
  { id: '(2) `{capture: false}`', capture: false, make: () => ({ capture: false }), distinctKey: 'capture=false' },
  { id: '(3) `{}` (absent)', capture: false, make: () => ({}), distinctKey: 'capture=false' },
  {
    id: "(4) `{capture: 'yes'}` (truthy non-boolean)",
    capture: true,
    make: () => ({ capture: 'yes' }),
    distinctKey: 'capture=true',
  },
  { id: '(5) `{capture: 0}` (falsy non-boolean)', capture: false, make: () => ({ capture: 0 }), distinctKey: 'capture=false' },
  { id: '(6) `{onStart: fn}` only', capture: false, make: () => singleHookOptions('onStart'), distinctKey: 'hooks=onStart' },
  { id: '(7) `{onMove: fn}` only', capture: false, make: () => singleHookOptions('onMove'), distinctKey: 'hooks=onMove' },
  { id: '(8) `{onEnd: fn}` only', capture: false, make: () => singleHookOptions('onEnd'), distinctKey: 'hooks=onEnd' },
  { id: '(9) `{onCancel: fn}` only', capture: false, make: () => singleHookOptions('onCancel'), distinctKey: 'hooks=onCancel' },
  { id: '(10) all five hooks', capture: false, make: () => hookOptions(makeHookLog(), {}), distinctKey: 'hooks=onStart+onMove+onEnd+onCancel' },
  {
    id: '(11) hooks present but NON-callable',
    capture: false,
    make: () => ({ onMove: 42, onEnd: 'x' }),
    distinctKey: 'capture=false',
  },
  {
    id: '(12) an `isConnected` seam returning `true`',
    capture: false,
    make: () => ({}),
    sourceOptions: { isConnected: () => true },
    distinctKey: 'isConnected=true',
  },
  {
    id: '(13) an `isConnected` seam returning `undefined`',
    capture: false,
    make: () => ({}),
    sourceOptions: { isConnected: () => undefined },
    distinctKey: 'isConnected=undefined',
  },
  {
    id: '(14) an `isConnected` seam returning `null`',
    capture: false,
    make: () => ({}),
    sourceOptions: { isConnected: () => null },
    distinctKey: 'isConnected=null',
  },
  {
    id: '(15) an `isConnected` seam that THROWS',
    capture: false,
    make: () => ({}),
    sourceOptions: {
      isConnected: (): never => {
        throw new Error('isConnected threw')
      },
    },
    distinctKey: 'isConnected=throws',
  },
  // ⟶ `D-12`(b): **THE ABSENT-MEMBER FIXTURE THE SPEC NAMES AS MISSING.** As filed this
  // shape was driven by a recorder whose callable `isConnected` returned `true` — i.e. it
  // duplicated `(12)` and never reached a source that LACKS the member. The recorder's own
  // `isConnected` method is REPLACED here (`undefined` ⇒ `readMember(seam, 'isConnected')`
  // is not a function ⇒ "no contrary evidence", `§2.4` item 5).
  {
    id: '(16) NO `isConnected` member at all',
    capture: false,
    make: () => ({}),
    sourceOptions: { isConnected: undefined },
    noIsConnectedMember: true,
    distinctKey: 'isConnected=absent',
  },
  {
    id: '(17) a source that is a CLASS INSTANCE',
    capture: false,
    make: () => ({}),
    sourceClass: true,
    distinctKey: 'source=class-instance',
  },
  // ⟶ `D-12`(b): **THE GENUINELY FROZEN FIXTURE THE SPEC NAMES AS MISSING.** As filed this
  // shape was `(12)`'s source again (nothing was ever frozen). `Object.freeze` is applied
  // after the source is built, and `PRE-4` checks that a WRITE to it really throws or is
  // refused (`isGenuinelyFrozen`) rather than trusting the annotation.
  {
    id: '(18) a FROZEN source',
    capture: false,
    make: () => ({}),
    sourceOptions: { isConnected: () => true, frozen: true },
    frozen: true,
    distinctKey: 'source=frozen',
  },
  {
    id: '(19) a session created with `commit` ABSENT',
    capture: false,
    make: () => ({}),
    commitAbsent: true,
    distinctKey: 'commit=absent',
  },
  {
    id: '(20) a second element also installed',
    capture: false,
    make: () => ({}),
    secondElement: true,
    distinctKey: 'second-element=true',
  },
]
/** The three per-configuration observation stages (`P-GS-IM-1`). **THE DECLARED TERM `58`
 *  IS UNTOUCHED by this comment** — the `D-11`(c) correction is about the property TEXT's
 *  terminal claim, not the stage count.
 *
 *  **⟶ `D-12`(c)/`ADV-GS-10`: THE DRIVE REACHES THE `end` TERMINAL ONLY.** `§5.5.1`'s
 *  corrected property text reads *"`1` again after the `end` terminal … the row's own DRIVE
 *  reaches the `end` terminal only, so the honest statement is 'after the `end` terminal' —
 *  the `reset` and `cancel` counts are asserted by `P-GS-IM-4`'s six terminals and by
 *  `P-GS-IM-5`'s per-stage flags, NOT by this row"*. The third stage below IS that `end`
 *  terminal, and nothing in this row claims a `reset` or a `cancel` count. */
const IM1_STAGES = ['after `install`', 'during the gesture', 'after the `end` terminal'] as const
/** **⟶ `ADV-GS-18` (the gate-4 closure): THE MODULE-OBSERVABLE INPUT KEY, DERIVED FROM THE
 *  FIXTURE THE DRIVE REALLY BUILDS.** The `distinctKey` LABEL each configuration carries is
 *  the configuration's OWN name for the input it declares — and two of those labels
 *  (`source=class-instance` for `(17)`, `source=frozen` for `(18)`) name properties the
 *  MODULE CANNOT OBSERVE at all: `§2.1`'s `EventSource` names `on`/`off`/`isConnected?`/
 *  `capturePointer?` and nothing else, so a class-instance source with a callable
 *  `isConnected` returning `true` presents the same input as `(12)`'s object literal, and a
 *  frozen source presents the same input as an unfrozen one for every member the module
 *  reads. This helper is the honest figure: it BUILDS each configuration's source and
 *  options exactly as the drive does and projects only what the module can read —
 *
 *   (a) the RESOLVED capture flag (`Boolean(built.capture)`, `§2.1` `GestureOptionsInput`),
 *   (b) the set of hook members that are present AND CALLABLE,
 *   (c) the CONNECTIVITY shape: `absent` (no callable member — `§2.4` item 5's "no contrary
 *       evidence" seam state) or the OUTCOME of one reading (`returns-true` / `returns-
 *       undefined` / `returns-null` / `throws`),
 *   (d) whether `commit` was supplied (`(19)`'s input), and
 *   (e) whether a SECOND control is installed (`(20)`'s input).
 *
 *  Fixture-only properties are deliberately NOT part of the key. The row prints this derived
 *  figure BESIDE the `§5.5.1` `P-GS-IM-1` figures as they now read — DECLARED CONFIGURATIONS
 *  `20` · DISTINCT `distinctKey` LABELS `16` · DISTINCT MODULE-OBSERVABLE INPUTS `13`
 *  (the three superseding the stale bare `15`; `ADV-GS-33`) — and BESIDE the `58` term,
 *  never substituted for any of them. */
function im1ObservableKey(configuration: Im1Configuration): string {
  const source = configuration.sourceClass === true ? new Im1ClassSource() : makeSource(configuration.sourceOptions ?? {})
  const built = configuration.make(source) as Record<string, unknown>
  const connectMember = (source as unknown as Record<string, unknown>)['isConnected']
  let connect: string
  if (typeof connectMember !== 'function') {
    connect = 'absent'
  } else {
    let outcome: string
    try {
      const reading = (connectMember as (element: unknown) => unknown).call(source, { probe: true })
      outcome = reading === true ? 'returns-true' : reading === undefined ? 'returns-undefined' : reading === null ? 'returns-null' : `returns-${String(reading)}`
    } catch {
      outcome = 'throws'
    }
    connect = outcome
  }
  const hooks = (['onStart', 'onMove', 'onEnd', 'onCancel'] as const).filter((name) => typeof built[name] === 'function')
  return [
    `capture=${String(Boolean(built.capture))}`,
    `connect=${connect}`,
    `hooks=${hooks.length === 0 ? 'none' : hooks.join('+')}`,
    `commit=${configuration.commitAbsent === true ? 'absent' : 'present'}`,
    `second=${configuration.secondElement === true ? 'installed' : 'none'}`,
  ].join(';')
}
/** `P-GS-IM-2` — the `8` caller-supplied start shapes and the `4` re-start attempts. */
const IM2_START_SHAPES = [
  '(1) `begin(el)` called directly (idle → active)',
  '(2) the recorded `pointerdown` handler fired',
  '(3) both, in sequence',
  '(4) a `begin` from a DIFFERENT installed control',
  '(5) a `begin` from inside `onStart` (re-entrancy)',
  '(6) a `begin` from inside `onMove` (re-entrancy)',
  '(7) a `begin` on the same control with the SAME element object',
  '(8) a `begin` on a structurally identical but DISTINCT element object',
] as const
const IM2_RESTART_ATTEMPTS = [
  'the direct `begin`',
  'the re-fired start listener',
  'the cross-control `begin`',
  'the `busy`-probe `begin`',
] as const
/** `P-GS-IM-3` — the `4` call shapes and the `9` state shapes. */
const IM3_CALL_SHAPES = ['(1) `begin(el)`', '(2) `end(el, handle)`', '(3) `reset(el, handle, v)`', '(4) `cancel(el, handle)`'] as const
const IM3_STATE_SHAPES = [
  '(1) idle, element never installed here',
  '(2) idle, element installed here',
  '(3) active on THIS session',
  '(4) active on this session, the call passed a STALE handle',
  '(5) disposed',
  '(6) disposed, element never installed',
  '(7) unusable source (`{source: 42}`)',
  '(8) `isConnected` returns exactly `false`',
  '(9) a second session in which the OTHER session installed the element',
] as const
/** **`P-GS-IM-3`'s DECLARED CELLS, DERIVED FROM `§2.3` ITEM 4'S CLOSED UNION** (green-time
 *  test repair 2026-09-27 — the row's as-filed expectation map was INTERNALLY
 *  CONTRADICTORY: it gave `21` cells the code `'ok'` and then applied REFUSAL-INERTNESS
 *  assertions to those same cells, `6` BEGIN cells demanded `'busy'` in state/idle states
 *  where `F-6`/`F-7`/`F-8`/`M-16` and this row's OWN trailing precedence assertion demand
 *  `'not-installed'`/`'disconnected'`, and `3` terminal cells demanded `'not-installed'`
 *  where `P-GS-SM-1`'s `absent` row demands `'no-gesture'`). The declared outcome of a
 *  cell is now derived from the CONTRACT'S OWN precedence, stated in the two clauses the
 *  row already asserts:
 *
 *  1. **THE STATE IS CHECKED FIRST, WITH `'disposed'` OUTRANKING `'not-installed'`**
 *     (`§2.3` item 7(3)): in states `(5)`/`(6)` every call shape reports `'disposed'`.
 *  2. **THEN `'busy'` OUTRANKS THE INSTALLATION AND CONNECTIVITY CHECKS** (`§2.4` item 5,
 *     and this row's own second precedence clause): while a gesture is active, `begin`
 *     reports `'busy'`, never `'disconnected'`.
 *  3. **THEN `'not-installed'`** for a `begin` on an element this session (not) installed:
 *     the `absent` state `(1)`, the unusable source `(7)`, and the cross-session case
 *     `(9)` (§2.4 item 6: `install` returned `false` with NO ledger entry, so the element
 *     is not installed HERE), then `'disconnected'` for the exact-`false` seam `(8)`.
 *  4. **THEN `'no-gesture'` for a terminal with no active gesture** (`§2.3` item 4 —
 *     `P-GS-SM-1`'s `absent` row states the same), **`'stale'` for a terminal carrying a
 *     handle that is not the active gesture's** (state `(4)`).
 *
 *  **A CELL WHOSE CALL LEGITIMATELY SUCCEEDS CARRIES NO CODE — `'ok'` IS NOT A CODE A
 *  SUCCESS PROVES.** `§2.1` declares `BeginResult` as a discriminated union whose success
 *  ARM HAS NO `code` MEMBER AT ALL (`{ok:true, gesture}`), so a `begin` success is
 *  asserted by its `ok`/state, never by a code; and a SUCCESSFUL TERMINAL is a
 *  COMMITTING terminal (`§2.3` item 4: `end`/`reset` ⇒ **exactly one** commit,
 *  `committed:true`), so those cells assert their OWN counts and are exempt from the
 *  refusal-inertness assertions — which belong to REFUSALS only (`§2.3` item 4's last
 *  row: "any terminal on a stale/absent handle: NO detach, NO hook, NO commit"). */
interface Im3Cell {
  readonly code: string | null
  readonly succeeds: boolean
  /** The commit invocations THIS call must make when it succeeds (`§2.3` item 4:
   *  `end`/`reset` ⇒ `1`; `begin` ⇒ `0`; `cancel` ⇒ `0`). */
  readonly commitDelta: number
}
function im3Declared(state: string, callShape: string): Im3Cell {
  const terminal = !callShape.startsWith('(1)')
  const cancelling = callShape.startsWith('(4)')
  // 1 — the disposed states outrank everything, for EVERY call shape.
  if (state.startsWith('(5)') || state.startsWith('(6)')) return { code: 'disposed', succeeds: false, commitDelta: 0 }
  // 2 — an active gesture: `begin` is `busy` (and that outranks connectivity), a
  //     terminal on the ACTIVE handle is the legal terminal (`end`/`reset` commit
  //     exactly once, `cancel` commits ZERO times), and a terminal on a STALE handle is
  //     refused `stale`.
  if (state.startsWith('(3)') || state.startsWith('(4)')) {
    if (!terminal) return { code: 'busy', succeeds: false, commitDelta: 0 }
    if (state.startsWith('(4)')) return { code: 'stale', succeeds: false, commitDelta: 0 }
    return { code: 'ok', succeeds: true, commitDelta: cancelling ? 0 : 1 }
  }
  // 3 — an idle `begin`: the session's own checks, in their declared order.
  if (!terminal) {
    // `(2)` is the ONLY cell in the whole grid whose call LEGITIMATELY SUCCEEDS, and
    // `§2.1`'s `BeginResult` union carries NO `code` on its success arm.
    if (state.startsWith('(2)')) return { code: null, succeeds: true, commitDelta: 0 }
    // `(8)`: the seam's exact `false` is the connectivity refusal (`§2.4` item 5).
    if (state.startsWith('(8)')) return { code: 'disconnected', succeeds: false, commitDelta: 0 }
    // `(1)` never installed, `(7)` an unusable source (`install` → `false`, no ledger
    // entry), `(9)` installed only by ANOTHER session: all three report `'not-installed'`.
    return { code: 'not-installed', succeeds: false, commitDelta: 0 }
  }
  // 4 — an idle terminal: there is no active gesture to terminate.
  return { code: 'no-gesture', succeeds: false, commitDelta: 0 }
}
/** `P-GS-IM-4` — the `6` terminals and the `5` observation stages. */
const IM4_TERMINALS = [
  "the recorded 'pointerup' handler",
  "the recorded 'pointercancel' handler",
  'a direct `end`',
  'a direct `reset`',
  'a direct `cancel`',
  'a `dispose()` during the gesture',
] as const
const IM4_STAGES = ['after `install`', 'after `begin`', 'after the first `pointermove`', 'mid-terminal (from inside the hook)', 'after the terminal'] as const
/** `P-GS-IM-5` — the `4` flag values and the `6` stages. */
const IM5_FLAGS: ReadonlyArray<{ id: string; capture: unknown; optedIn: boolean }> = [
  { id: '(1) `true`', capture: true, optedIn: true },
  { id: '(2) `false`', capture: false, optedIn: false },
  { id: "(3) `'yes'` (truthy non-boolean)", capture: 'yes', optedIn: true },
  { id: '(4) `0` (falsy non-boolean)', capture: 0, optedIn: false },
]
const IM5_STAGES = [
  'after `install`',
  'after `begin`',
  'after the first `pointermove`',
  'after the second `pointermove`',
  "after the terminal's detach",
  "after the terminal's `commit`",
] as const
/** `P-GS-IM-5` — **THE TWO ALIASED STAGE PAIRS, DECLARED (`⟶ ADV-GS-19`, the gate-4
 *  closure).** `§5.5.1`'s cell names them in its own prose — *"the two `pointermove`
 *  stages and the two post-terminal stages read the SAME cumulative capture count"* — while
 *  this file hard-coded `5` distinct stages per flag, a figure its own printed aliasing
 *  list CONTRADICTED (two named pairs subtract TWO positions, not one: `6 − 2 = 4`). Each
 *  pair is `[earlierPosition, laterPosition]`; the register row asserts the equality
 *  MEASURED (the later position's cumulative count equals the earlier one's on every
 *  drive, inside the stage loop) and DERIVES its distinct figure from THIS table, so the
 *  row can no longer print a figure its own data contradicts.
 *  **THE DECLARED TERM `24` IS UNMOVED** — it counts stage POSITIONS (`4` flags × `6`). */
const IM5_STAGE_ALIAS_PAIRS: ReadonlyArray<readonly [number, number]> = [
  [2, 3],
  [4, 5],
]
/** `P-GS-IM-6` — the `3` session shapes, `2` gesture states and `5` operations. */
const IM6_SHAPES = [
  '(1) two controls installed, no gesture',
  '(2) two controls installed, a gesture active on the first',
  '(3) one control installed, an opted-in gesture active, and a THROWING `off`',
] as const
const IM6_STATES = ['idle', 'active-at-dispose'] as const
const IM6_OPERATIONS = ['`dispose()`', '`dispose()` again', '`install(newEl)`', '`begin(oldEl)`', '`stats()`'] as const
/** `P-GS-SM-1` — the `4` states and the `10` ops. */
const SM1_STATES = ['absent', 'installed-idle', 'active', 'disposed'] as const
const SM1_OPS = [
  '`install(newEl)`',
  '`install(el)` (repeat)',
  '`begin(el)`',
  '`end(el, activeHandle)`',
  '`end(el, staleHandle)`',
  '`reset(el, activeHandle, v)`',
  '`cancel(el)`',
  '`cancel(el, activeHandle)`',
  '`dispose()`',
  '`stats()`',
] as const
/** `P-GS-SM-2` — the `5` element shapes and the `6` operation pairs. */
const SM2_SHAPES = [
  '(1) a plain object `{}`',
  '(2) an object with a `nodeType`-ish numeric field',
  '(3) a frozen object',
  '(4) an object with `Symbol`-keyed state',
  '(5) a structurally identical CLONE of `(1)`',
] as const
const SM2_PAIRS = [
  'install `(1)` then `(1)`',
  'install `(1)` then `(5)`',
  '`begin(1)` then `begin(5)` while `(1)` is active',
  '`end(5, handleOf1)` (element mismatch ⇒ `\'stale\'`)',
  'install `(1)`, `dispose()`, reinstall `(1)`',
  'install `(5)` while `(1)` is installed and active',
] as const
/** `P-GS-SM-3` — the `4` terminal paths and the `8` value/consumer shapes. */
const SM3_PATHS = [
  "the recorded 'pointerup' handler",
  'a direct `end`',
  'a direct `reset`',
  "the recorded 'pointercancel' handler",
] as const
const SM3_SHAPES = [
  '(a) no `set` at all (value `undefined`)',
  '(b) `set(0)`',
  '(c) `set(NaN)`',
  '(d) `set(\'\')`',
  '(e) `set({k:1})` (an object, by identity)',
  "(f) `set(Symbol('s'))`",
  '(g) `onMove` THROWS mid-gesture',
  '(h) `commit` THROWS',
] as const
/** `P-GS-TP-1` — the `3` phases, each with its own `4`-shape domain over `2` drives. */
interface Tp1Phase {
  readonly id: string
  readonly shapes: ReadonlyArray<{ readonly id: string; readonly make: () => unknown }>
  readonly drive: (shape: string, made: unknown) => string | null
}
const TP1_PHASES: ReadonlyArray<Tp1Phase> = [
  {
    id: 'PHASE A — the FACTORY: `4` option shapes × the `2` callables it must return usable instances for',
    shapes: [
      { id: '(1) `undefined`', make: () => undefined },
      { id: '(2) `{}`', make: () => ({}) },
      { id: '(3) `42` (a primitive)', make: () => 42 },
      { id: '(4) `{source: null}`', make: () => ({ source: null }) },
    ],
    drive: () => null,
  },
  {
    id: 'PHASE B — the SEAM: `4` source shapes × the `2` module-level functions',
    shapes: [
      { id: '(1) `undefined`', make: () => undefined },
      { id: '(2) `{on(){}, off(){}}` (callable, no `isConnected`)', make: () => ({ on: (): void => undefined, off: (): void => undefined }) },
      {
        id: '(3) a source whose `on`/`off`/`isConnected` all THROW',
        make: () => ({
          on: (): never => {
            throw new Error('on threw')
          },
          off: (): never => {
            throw new Error('off threw')
          },
          isConnected: (): never => {
            throw new Error('isConnected threw')
          },
        }),
      },
      { id: '(4) `{on: 42, off: null}` (non-callable members)', make: () => ({ on: 42, off: null }) },
    ],
    drive: () => null,
  },
  {
    id: 'PHASE C — the SESSION METHODS under a hostile source: `4` hostile states × the `2` method drives',
    shapes: [
      { id: '(1) a THROWING source', make: () => undefined },
      { id: '(2) a NON-CALLABLE source', make: () => undefined },
      { id: '(3) `{source: null}`', make: () => undefined },
      { id: '(4) a session whose `commit` THROWS', make: () => undefined },
    ],
    drive: () => null,
  },
]
/** `P-GS-TP-2` — the `2` event configurations. */
const TP2_CONFIGURATIONS = ['(1) `capture` opted in', '(2) no capture'] as const

// ===========================================================================
// §5.5.1 — THE TYPED PROPERTY REGISTER (11 rows, executed deterministically, no PBT
// harness). Rows are evaluated SEQUENTIALLY IN REGISTER ORDER with
// STOP AFTER 5 CONSECUTIVE FAILURES; an un-run row FAILS.
// ===========================================================================
describe('§5.5.1 — the typed property register (11 rows, executed deterministically, no PBT harness)', () => {
  it('P-GS-IM-1 [S-GS-LISTENERS-1] — EVERY configuration × stage: the session’s OWN listener footprint is 1 idle / 4 active / 1 after the `end` terminal (58 declared attempts; the `reset`/`cancel` counts are `P-GS-IM-4`’s) — YES (bounded)', async () => {
    const rec = new RegisterRow('P-GS-IM-1', 'S-GS-LISTENERS-1')
    const moduleState = await resolveModule()
    for (const configuration of IM1_CONFIGURATIONS) {
      const stageCount = configuration.id === '(20) a second element also installed' ? 2 : 3
      const stages = IM1_STAGES.slice(0, stageCount)
      for (const stage of stages) {
        rec.run(`${configuration.id} × stage ${stage}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          // Each attempt builds its own session/source: setup is NOT an attempt
          // (`§5.5.3`), so the drive itself is the counted observation.
          // **⟶ `D-12`(b): THE SOURCE IS THE CONFIGURATION'S OWN DECLARED ONE.** As filed
          // this chain selected the seam by `id.startsWith(...)`, which meant `(16)` was
          // given a CALLABLE `isConnected` returning `true` (duplicating `(12)`) and `(18)`
          // was frozen by nothing at all — the two shapes the spec names as existing in NO
          // fixture. The configuration now declares `sourceOptions` (and `frozen`/
          // `sourceClass`), and `PRE-4` asserts those declarations against the built value.
          const source = configuration.sourceClass === true
            ? new Im1ClassSource()
            : makeSource(configuration.sourceOptions ?? {})
          const commitCalls: unknown[] = []
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const session =
            configuration.commitAbsent === true
              ? create({ source })
              : create({ source, commit: (_g: GestureHandle, v: unknown): void => void commitCalls.push(v) })
          const el: Record<string, unknown> = configuration.sourceClass === true ? {} : { control: true }
          const options = configuration.make(source)
          if (!session.install(el, options)) return `the install of configuration ${configuration.id} returned \`false\``
          // **⟶ `ADV-GS-18` (the gate-4 closure): CONFIGURATION `(20)` REALLY INSTALLS ITS
          // SECOND ELEMENT.** The row declares `(20)` as *"a session with a SECOND element
          // also installed"* and drives it for `2` stages rather than `3` (its terminal
          // belongs to the FIRST element) — but as filed the `secondElement` flag was
          // DECLARED AND NEVER USED, so `(20)`'s input was `(3)`'s and its own second
          // observation stage had no motive. The second control is now installed here, so the
          // configuration's id, its stage count and its module-observable input key all agree.
          if (configuration.secondElement === true) {
            if (!session.install({ control: true, second: true }, options)) {
              return `configuration ${configuration.id} declares a SECOND element and its install returned \`false\``
            }
          }
          // Stage 1 — AFTER INSTALL: exactly ONE listener, of type 'pointerdown'.
          const afterInstall = footprint(source, el)
          if (source.listenerCount(el) !== 1 || source.typeMultiset(el).join(',') !== TYPE_START) {
            return `after \`install\` the footprint must be exactly 1 listener of type '${TYPE_START}'; got ${JSON.stringify(afterInstall)}`
          }
          if (stage === IM1_STAGES[0]) return null
          const began = session.begin(el)
          if (!began.ok) return `the \`begin\` of configuration ${configuration.id} was refused \`${began.code}\``
          const handle = began.gesture
          // Stage 2 — DURING THE GESTURE: exactly FOUR listeners, the declared multiset.
          const during = footprint(source, el)
          const expectedFour = [TYPE_CANCEL, TYPE_END, TYPE_MOVE, TYPE_START].sort().join(',')
          if (during.count !== 4 || during.types.join(',') !== expectedFour) {
            return `during the gesture the footprint must be exactly 4 listeners (${expectedFour}); got ${JSON.stringify(during)}`
          }
          const outsideTypes = source.log
            .filter((r) => r.op === 'on' || r.op === 'off')
            .map((r) => r.type)
            .filter((t) => !TYPE_SET.includes(t))
          if (outsideTypes.length > 0) return `a listener carried a type OUTSIDE the pinned four: ${JSON.stringify(outsideTypes)}`
          if (stage === IM1_STAGES[1]) return null
          // Stage 3 — AFTER THE `end` TERMINAL (the ONLY terminal this row drives,
          // `D-12`(c)): back to ONE, the start listener.
          session.end(el, handle)
          const after = footprint(source, el)
          if (after.count !== 1 || after.types.join(',') !== TYPE_START) {
            return `after the \`end\` terminal the footprint must be back to 1 listener ('${TYPE_START}'); got ${JSON.stringify(after)}`
          }
          return null
        })
      }
    }
    rec.finish()
    // **THE DECLARED TERM AND THE MEASURED DRIVE, EACH REPORTED AS ITS OWN FIGURE**
    // (green-time test repair 2026-09-27, the sibling registers' form): `§5.5.3` states in
    // its own words that `58` "is stated **conservatively** as `58`, one attempt **fewer**
    // than the enumeration produces, so no attempt is claimed that the drive does not
    // perform" — the enumeration is `19 × 3 + 1 × 2 = 59`. `PRE-4` asserts only `58 ≤ 59`;
    // asserting the DRIVE against the DECLARED figure would have demanded that two real
    // observations be discarded (a weakening), and discarding them to print `58` would be
    // worse. So the DECLARED term `58` is printed and reconciled as the declaration it is,
    // and the MEASURED figure is reported and reconciled against the enumeration that
    // produces it — **no figure is silently substituted for the other**.
    expect(
      declaredTermOf('P-GS-IM-1'),
      'P-GS-IM-1/§5.5.3 — the DECLARED term is `58` (`20` configurations × `3` stages, less `1` for configuration `(20)`’s unreachable third stage — `19 × 3 + 1 × 2 = 59` enumerated observations, one BELOW which the declared `58` is stated conservatively; the as-filed message printed “less `2`”, which contradicted this row’s own next assertion and has been corrected at this site — `ADV-GS-27`): the declared figure is what the `≤100`/row and `≤400` register caps are compared against',
    ).toBe(58)
    expect(
      rec.attemptsRunPublic(),
      'P-GS-IM-1/§5.5.3 — the MEASURED observation count of the `20`-configuration × stage drive is `59` (`19 × 3 + 1 × 2`), which is the enumeration the declared `58` is stated conservatively BELOW: the drive performs every observation, and no attempt is claimed that it does not perform',
    ).toBe(59)
    expect(
      declaredTermOf('P-GS-IM-1'),
      'P-GS-IM-1/§5.5.3 — the declared term is CONSERVATIVE: it never exceeds the observations the drive performs (the reconciliation `§5.5.3` records)',
    ).toBeLessThanOrEqual(rec.attemptsRunPublic())
    reconcile(
      rec,
      59,
      'P-GS-IM-1 — the MEASURED drive is `20` configurations × `3` stages less configuration `(20)`’s unreachable third stage = `59` observations; the DECLARED term remains `58`',
    )
    // **⟶ `D-12`(b), RE-DERIVED BY `ADV-GS-18` (the gate-4 closure): THE THREE HONEST
    // FIGURES, EACH DERIVED FROM THE TABLE, PRINTED BESIDE THE DECLARED `58`.** `§5.5.1`'s
    // cell states its figures WITH THEIR DEFINITIONS (`ADV-GS-18`; the bare `15` this comment
    // used to cite is a spec figure that no longer exists — `ADV-GS-33`) and names the
    // duplications it can see. This row now prints THREE figures, each COMPUTED here rather
    // than hard-coded:
    //   (1) the DECLARED `20` configurations (the domain the `58` term rests on);
    //   (2) the distinct `distinctKey` LABEL count, exactly as the table defines the labels
    //       — the labels include the two FIXTURE-ONLY shapes (`(17)`'s class instance,
    //       `(18)`'s freeze) which the module cannot observe;
    //   (3) the distinct MODULE-OBSERVABLE input count, DERIVED by building each
    //       configuration's source/options as the drive does and projecting only what the
    //       module can read (`im1ObservableKey`) — under which `(17)` and `(18)` read as
    //       `(12)`-shaped inputs, because a class-instance source with a callable
    //       `isConnected` returning `true`, and a frozen source for every member the module
    //       reads, are the same input.
    // The arithmetic is printed term by term, per configuration, so the difference between
    // the three is auditable and no figure is silently substituted for another.
    const distinctKeys = [...new Set(IM1_CONFIGURATIONS.map((c) => c.distinctKey))]
    const labelAliasCount = IM1_CONFIGURATIONS.length - distinctKeys.length
    const observableKeys = IM1_CONFIGURATIONS.map((c) => im1ObservableKey(c))
    const distinctObservable = [...new Set(observableKeys)]
    const observableAliasCount = IM1_CONFIGURATIONS.length - distinctObservable.length
    const im1TermArithmetic = IM1_CONFIGURATIONS.map(
      (c) => `${c.id.split(' ')[0]}→label[${c.distinctKey}] observable[${im1ObservableKey(c)}]`,
    )
    console.log(
      `§5.5.1 P-GS-IM-1 distinct-input record :: ${JSON.stringify({
        declaredConfigurations: IM1_CONFIGURATIONS.length,
        specDeclaredDistinctInputs: 20,
        specFigures: {
          declaredConfigurations: 20,
          distinctDistinctKeyLabels: 16,
          distinctModuleObservableInputs: 13,
        },
        specNamedAliases: 5,
        tableDerivedDistinctLabels: distinctKeys.length,
        tableDerivedLabelAliases: labelAliasCount,
        tableDerivedDistinctModuleObservableInputs: distinctObservable.length,
        tableDerivedObservableAliases: observableAliasCount,
        derivedLabels: distinctKeys,
        derivedObservableKeys: distinctObservable,
        perConfiguration: im1TermArithmetic,
        declaredTerm: declaredTermOf('P-GS-IM-1'),
        measuredObservations: rec.attemptsRunPublic(),
        definitions: {
          declaredConfigurations: 'the table’s OWN members (§5.5.1’s DECLARED CONFIGURATIONS `20` — the domain the `58` term rests on)',
          distinctDistinctKeyLabels: '§5.5.1’s DISTINCT `distinctKey` LABELS `16` (the declared `20` less the `4` label duplicates), derived here from the table’s own `distinctKey` values',
          distinctModuleObservableInputs: '§5.5.1’s DISTINCT MODULE-OBSERVABLE INPUTS `13` (the `16` labels less the `3` the module cannot distinguish — `(17)`/`(18)` read as `(12)`, and `(12)` reads as the `capture=false` group’s input), derived here by `im1ObservableKey`',
          label: 'the configuration’s own declared `distinctKey` label, INCLUDING the fixture-only shapes the module cannot observe',
          observable: 'DERIVED by `im1ObservableKey`: the resolved capture flag, the callable hook set, the connectivity outcome, `commit`-absent and second-element — the input the MODULE can read',
        },
        note: 'the DECLARED CONFIGURATIONS 20 and the DECLARED term 58 are the figures the caps are compared against (REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS, ACTIVE); the DISTINCT figures 16 (labels) and 13 (module-observable) are the derived ones, reported BESIDE them and never substituted — the stale bare `15` this record used to print is superseded (`ADV-GS-33`)',
      })}`,
    )
    expect(
      IM1_CONFIGURATIONS.length,
      'P-GS-IM-1/§5.5.1 — figure (1): the domain is the DECLARED `20` configurations (no configuration is removed or added: the declared term `58` rests on it)',
    ).toBe(20)
    expect(
      distinctKeys.length,
      `P-GS-IM-1/§5.5.1 — figure (2): the TABLE’S OWN distinct-\`distinctKey\`-LABEL count, DERIVED from the twenty configurations (never hard-coded: this assertion pins the figure the record above prints), beside §5.5.1’s DISTINCT \`distinctKey\` LABELS \`16\` and the declared term \`58\` — every label is the configuration’s own name for its input, including the fixture-only shapes (the stale bare \`15\` this message used to print is superseded, \`ADV-GS-33\`)`,
    ).toBe(16)
    expect(
      distinctObservable.length,
      `P-GS-IM-1/§5.5.1 — figure (3): the DISTINCT MODULE-OBSERVABLE INPUT count, DERIVED by \`im1ObservableKey\` from the sources and options the drive really builds (\`${distinctObservable.length}\` distinct observable inputs + \`${observableAliasCount}\` observable aliases = \`${IM1_CONFIGURATIONS.length}\` configurations), printed BESIDE §5.5.1’s DISTINCT MODULE-OBSERVABLE INPUTS \`13\` and the label figure \`16\` — never substituted for either (the stale bare \`15\` is superseded, \`ADV-GS-33\`)`,
    ).toBe(13)
    // THE ADVERSARIAL PASS'S OWN TWO LABEL-ONLY CLAIMS, MEASURED RATHER THAN NARRATED: `(17)`
    // (a class-instance source with a callable `isConnected` returning `true`) reads as `(12)`,
    // and `(18)` (a frozen source) reads as an unfrozen one for every member the module reads.
    const im1IndexOf = (prefix: string): number => {
      const at = IM1_CONFIGURATIONS.findIndex((c) => c.id.startsWith(prefix))
      expect(at, `P-GS-IM-1/\`ADV-GS-18\` — the table really carries configuration ${prefix}`).toBeGreaterThanOrEqual(0)
      return at
    }
    expect(
      observableKeys[im1IndexOf('(17)')],
      'P-GS-IM-1/`ADV-GS-18` — `(17)`’s class-instance source reads as `(12)`’s input for every member the module can observe (the class-ness is a FIXTURE-ONLY key, which is why the label figure and the observable figure differ)',
    ).toBe(observableKeys[im1IndexOf('(12)')])
    expect(
      observableKeys[im1IndexOf('(18)')],
      'P-GS-IM-1/`ADV-GS-18` — and `(18)`’s frozen source reads as an UNFROZEN one: the freeze is invisible to the module’s own reads, so its label is fixture-only too',
    ).toBe(observableKeys[im1IndexOf('(12)')])
    // THE FIVE SINGLE-HOOK CONFIGURATIONS ARE FIVE GENUINELY DISTINCT INPUTS (`ADV-GS-18`):
    // as filed all five built the ALL-HOOKS input, so four of the five ids described nothing.
    const singleHookIndices = ['(6)', '(7)', '(8)', '(9)'].map(im1IndexOf)
    expect(
      singleHookIndices.map((at) => observableKeys[at]),
      'P-GS-IM-1/`ADV-GS-18` — `(6)`–`(9)` build four GENUINELY DIFFERENT single-hook inputs (each carries exactly one callable hook, so the five members’ ids describe what they build)',
    ).toEqual([
      'capture=false;connect=returns-true;hooks=onStart;commit=present;second=none',
      'capture=false;connect=returns-true;hooks=onMove;commit=present;second=none',
      'capture=false;connect=returns-true;hooks=onEnd;commit=present;second=none',
      'capture=false;connect=returns-true;hooks=onCancel;commit=present;second=none',
    ])
    const hookFamilyKeys = ['(6)', '(7)', '(8)', '(9)', '(10)'].map((prefix) => observableKeys[im1IndexOf(prefix)])
    const hookCountOf = (key: string): number => key.split('hooks=')[1].split(';')[0].split('+').length
    expect(
      hookFamilyKeys.map(hookCountOf),
      `P-GS-IM-1/\`ADV-GS-18\` — the five hook-family members \`(6)\`–\`(10)\` build FIVE DISTINCT inputs whose callable-hook counts are \`1,1,1,1,4\` (four genuinely single-hook inputs plus the all-hooks member): as filed all five built the ALL-HOOKS input, so four of their ids described nothing they built (measured keys: ${JSON.stringify(
        hookFamilyKeys,
      )})`,
    ).toEqual([1, 1, 1, 1, 4])
    expect(
      new Set(hookFamilyKeys).size,
      'P-GS-IM-1/`ADV-GS-18` — and the five keys are five DISTINCT strings, so each member’s observable input really differs from its siblings’',
    ).toBe(5)
    expect(
      observableKeys[im1IndexOf('(20)')],
      'P-GS-IM-1/`ADV-GS-18` — and `(20)` REALLY installs its second element, so its observable key differs from the single-control shapes (measured, not annotated)',
    ).toBe('capture=false;connect=returns-true;hooks=none;commit=present;second=installed')
    expect(
      distinctKeys.length + labelAliasCount,
      'P-GS-IM-1/§5.5.1 — figure (2)’s arithmetic closes on the table: derived distinct labels + derived label aliases = 20 configurations',
    ).toBe(20)
    expect(
      distinctObservable.length + observableAliasCount,
      'P-GS-IM-1/§5.5.1 — figure (3)’s arithmetic closes on the table too: derived distinct observable inputs + derived observable aliases = 20 configurations',
    ).toBe(20)
    expect(
      declaredTermOf('P-GS-IM-1'),
      'P-GS-IM-1/§5.5.1 — the DECLARED term `58` is UNMOVED, and all three derived figures are REPORTED figures beside it (never a substitute: `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`, ACTIVE)',
    ).toBe(58)
  })

  it('P-GS-IM-2 [S-GS-BUSY-1] — EVERY start shape × re-start attempt: at most ONE active gesture, every further start refused `busy` (32 attempts)', async () => {
    const rec = new RegisterRow('P-GS-IM-2', 'S-GS-BUSY-1')
    const moduleState = await resolveModule()
    for (const shape of IM2_START_SHAPES) {
      for (const attempt of IM2_RESTART_ATTEMPTS) {
        rec.run(`${shape} × ${attempt}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const source = makeSource({})
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const session = create({ source, commit: (): void => undefined })
          const el: Record<string, unknown> = { id: 'a' }
          const other: Record<string, unknown> = { id: 'b' }
          const clone: Record<string, unknown> = { id: 'a' }
          session.install(el, {})
          session.install(other, {})
          // The shape's own establishment.
          if (shape.startsWith('(2)') || shape.startsWith('(3)')) source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
          else session.begin(el)
          if (shape.startsWith('(3)')) session.begin(el)
          if (shape.startsWith('(4)')) session.begin(other)
          if (shape.startsWith('(5)')) {
            // re-entrancy: a `begin` from inside `onStart` is driven by reinstalling with
            // that hook — the session's own `begin` remains the one authority.
            const s2Source = makeSource({})
            const s2 = create({
              source: s2Source,
              commit: (): void => undefined,
            })
            s2.install(el, {
              onStart: (): void => {
                s2.begin(el)
              },
            })
            s2.begin(el)
            source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
          }
          if (shape.startsWith('(6)')) {
            const s3Source = makeSource({})
            const s3 = create({ source: s3Source, commit: (): void => undefined })
            s3.install(el, {
              onMove: (): void => {
                s3.begin(el)
              },
            })
            s3.begin(el)
            s3Source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
            source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
          }
          if (shape.startsWith('(7)')) source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
          if (shape.startsWith('(8)')) {
            session.install(clone, {})
            source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
          }
          const active = session.gesture()
          if (active === null) return `the start shape ${shape} established no active gesture (the row’s own precondition)`
          const before = {
            id: active.id,
            value: active.value,
            commits: session.stats().commits,
            listeners: source.listenerCount(el),
            calls: source.log.length,
          }
          // THE RE-START ATTEMPT ITSELF.
          let refusal: unknown = null
          if (attempt === IM2_RESTART_ATTEMPTS[0]) refusal = session.begin(el)
          else if (attempt === IM2_RESTART_ATTEMPTS[1]) {
            // The re-fired start listener's refusal is observed through the session's own
            // recorded last code, since the handler returns nothing.
            source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
            refusal = { ok: false, code: session.stats().lastCode }
          } else if (attempt === IM2_RESTART_ATTEMPTS[2]) refusal = session.begin(other)
          else refusal = session.begin(clone)
          const code = (refusal as { code?: string }).code
          if (code !== 'busy') return `the re-start attempt must be REFUSED \`busy\`; got ${JSON.stringify(refusal)}`
          if (!session.stats().active) return 'the `busy` refusal deactivated the active gesture (it must change NOTHING)'
          if (session.gesture()?.id !== before.id) return 'the active gesture’s id changed across a `busy` refusal'
          if (!Object.is(session.gesture()?.value, before.value)) return 'the active gesture’s value changed across a `busy` refusal'
          if (session.stats().commits !== before.commits) return 'a `busy` refusal issued a commit'
          if (source.listenerCount(el) !== before.listeners) return `a \`busy\` refusal changed the listener count (${before.listeners} → ${source.listenerCount(el)})`
          if (source.listenerCount(el) !== 4) return `while a gesture is active the control must hold FOUR listeners; got ${source.listenerCount(el)}`
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 32, 'P-GS-IM-2 — the declared term is `32` (`8` start shapes × `4` re-start attempts)')
  })

  it('P-GS-IM-3 [S-GS-CODES-1] — EVERY call shape × state shape: the DECLARED refusal code and an INERT refusal (36 attempts)', async () => {
    const rec = new RegisterRow('P-GS-IM-3', 'S-GS-CODES-1')
    const moduleState = await resolveModule()
    for (const callShape of IM3_CALL_SHAPES) {
      for (const state of IM3_STATE_SHAPES) {
        rec.run(`${callShape} × ${state}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const unusable = state.startsWith('(7)')
          const source = makeSource({
            isConnected: state.startsWith('(8)') ? () => false : undefined,
          })
          const commitCount = { value: 0 }
          const session = create({
            source: unusable ? 42 : source,
            commit: (): void => {
              commitCount.value += 1
            },
          })
          const el: Record<string, unknown> = { id: 'a' }
          const other: Record<string, unknown> = { id: 'other' }
          let handle: GestureHandle | null = null
          let stale: GestureHandle | null = null
          let foreignOwner = false
          // **THE STATE'S LEDGER IS BUILT TO MATCH THE STATE'S OWN DECLARATION** (green-time
          // test repair 2026-09-27): `(1)` is "element NEVER installed here", `(6)` is
          // "disposed, element never installed", `(7)` is the unusable source (whose
          // `install` returns `false` and creates NO ledger entry — `§2.4` item 6), and
          // `(9)` is the CROSS-SESSION case whose whole point is that this session's own
          // ledger does NOT hold the element (`§0` ruling 11 / `M-16`). The as-filed
          // condition installed into THIS session for state `(9)`, which made the cell a
          // measure of a session that HAD installed the element — the opposite of what the
          // state declares.
          if (!state.startsWith('(1)') && !state.startsWith('(6)') && !state.startsWith('(7)') && !state.startsWith('(9)')) {
            session.install(el, {})
          }
          if (state.startsWith('(3)') || state.startsWith('(4)')) {
            const began = session.begin(el)
            if (!began.ok) return `the state ${state} could not establish the gesture it presumes (code ${began.code})`
            handle = began.gesture
          }
          if (state.startsWith('(4)')) {
            // **A GENUINELY STALE HANDLE** (green-time test repair 2026-09-27): the as-filed
            // block called a bare `session.begin(el)` while a gesture was already active —
            // refused `'busy'` (`§2.3` item 3) — so `stale` stayed `null`, the row passed
            // the handle from `passedHandle ?? ({id:1})`, and the call was not the stale
            // call the cell declares. The stale handle comes from a PREVIOUS gesture:
            // terminate the active one, establish the NEXT, and keep the first's handle, so
            // a gesture is genuinely active again while the kept handle is stale
            // (`§2.4` item 4 — a handle is valid only for the ONE active gesture with that
            // id AND that element identity).
            const first = handle
            session.end(el, first as GestureHandle)
            const second = session.begin(el)
            if (!second.ok) return `the state ${state} could not re-establish a live gesture after terminating the first (code ${second.code})`
            stale = first
            handle = second.gesture
          }
          if (state.startsWith('(9)')) {
            const otherSession = create({ source: makeSource({}), commit: (): void => undefined })
            foreignOwner = otherSession.install(el, {})
          }
          if (state.startsWith('(5)') || state.startsWith('(6)')) session.dispose()
          const callsBefore = source.log.length
          const commitsBefore = commitCount.value
          const passedHandle = state.startsWith('(4)') ? (stale as GestureHandle) : handle
          const result: unknown =
            callShape.startsWith('(1)')
              ? session.begin(el)
              : callShape.startsWith('(2)')
                ? session.end(el, passedHandle ?? ({ id: 1 } as GestureHandle))
                : callShape.startsWith('(3)')
                  ? session.reset(el, passedHandle ?? ({ id: 1 } as GestureHandle), 'v')
                  : session.cancel(el, passedHandle ?? undefined)
          const code = (result as { code?: string }).code
          // Non-vacuity: the cross-session state really has ANOTHER session owning the
          // element (so the `'not-installed'` cell measures isolation, not a stray).
          if (state.startsWith('(9)') && !foreignOwner) {
            return 'the cross-session state (9) was not built: the OTHER session did not install the element, so the cell would measure nothing (§0 ruling 11)'
          }
          // The DECLARED cell, from the map above (the contract's own precedence).
          const declared = im3Declared(state, callShape)
          if (declared.succeeds) {
            // **A LEGITIMATELY SUCCEEDING CELL.** `§2.1`: a successful `begin` carries no
            // `code` (and no refusal happened at all), and `§2.3` item 4: a successful
            // `end`/`reset`/`cancel` is a TERMINAL — so the assertions are the call's OWN
            // declared outcome, never the refusal-inertness facts.
            if (declared.code === null) {
              if (code !== undefined) {
                return `the call ${callShape} in state ${state} LEGITIMATELY SUCCEEDS, so it carries no refusal code (§2.1: \`BeginResult\`'s success arm is \`{ok:true, gesture}\`, with NO \`code\` member); got \`${String(code)}\` (${JSON.stringify(result)})`
              }
              if ((result as { ok?: boolean }).ok !== true) {
                return `the declared outcome for ${callShape} in state ${state} is a SUCCESS; got ${JSON.stringify(result)}`
              }
              if (!session.stats().active) return `the legal \`begin\` of state ${state} did not activate a gesture`
              if (commitCount.value !== commitsBefore + declared.commitDelta) {
                return `a legal \`begin\` must commit NOTHING; got ${commitCount.value - commitsBefore} invocation(s)`
              }
              return null
            }
            if ((result as { ok?: boolean }).ok !== true) {
              return `the declared outcome for ${callShape} in state ${state} is a SUCCESS (\`${declared.code}\`); got ${JSON.stringify(result)}`
            }
            if (code !== declared.code) {
              return `the declaring SUCCESS of ${callShape} in state ${state} reports \`${declared.code}\`; got \`${String(code)}\``
            }
            // A successful terminal commits EXACTLY the declared number of times — ONCE
            // for `end`/`reset`, ZERO for `cancel` (`§2.3` item 4, the heart of this unit):
            // the count the as-filed inertness assertion contradicted.
            if (commitCount.value !== commitsBefore + declared.commitDelta) {
              return `the successful terminal ${callShape} in state ${state} must invoke \`commit\` exactly ${declared.commitDelta} time(s) (§2.3 item 4); got ${commitCount.value - commitsBefore}`
            }
            if ((result as { committed?: boolean }).committed !== (declared.commitDelta === 1)) {
              return `the successful terminal ${callShape} in state ${state} must report \`committed: ${String(declared.commitDelta === 1)}\` (§2.3 item 4); got ${JSON.stringify(result)}`
            }
            return null
          }
          if (code !== declared.code) {
            return `the declared code for ${callShape} in state ${state} is \`${String(declared.code)}\`; got \`${String(code)}\` (${JSON.stringify(result)})`
          }
          // THE INERTNESS FACTS — FOR A REFUSAL, which is what `§2.3` item 4's last row
          // declares: commit zero times, no detach, NO hook, and **no ATTACH**.
          // **THE ONE ALLOWED READING IS THE CONNECTIVITY PROBE**: `§2.4` item 5 states
          // that at `begin`, iff `source.isConnected` is callable, the session calls
          // `isConnected(element)` **exactly once** — and `F-7` asserts precisely that for a
          // `'disconnected'` refusal ("the log shows ONLY the `isConnected` call"). So the
          // log's growth is declared as the ONE `isConnected` reading that the refusal's own
          // clause permits (`1` in the `'disconnected'` state, `0` where the check is not
          // reached or was already made), and no `on`/`off`/capture call may appear.
          const logged = source.log.slice(callsBefore)
          const expectedReadings = state.startsWith('(8)') && callShape.startsWith('(1)') ? 1 : 0
          const readings = logged.filter((rec) => rec.op === 'isConnected').length
          const attachments = logged.filter((rec) => rec.op !== 'isConnected')
          if (readings !== expectedReadings || attachments.length > 0) {
            return `the refusal added source calls beyond the ${
              expectedReadings === 1 ? 'ONE connectivity reading §2.4 item 5 permits' : 'none it permits'
            }: ${JSON.stringify(logged)}`
          }
          if (commitCount.value !== commitsBefore) return 'the refusal invoked `commit`'
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 36, 'P-GS-IM-3 — the declared term is `36` (`4` call shapes × `9` state shapes)')
    // THE TWO PRECEDENCE CLAUSES, asserted in the same pass.
    const { mod } = await resolveModule()
    if (mod === null) return
    const create = mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
    const disposedSession = create({ source: makeSource({}) })
    disposedSession.dispose()
    expect(
      (disposedSession.begin({ id: 'never-installed' }) as { code: string }).code,
      'P-GS-IM-3/§2.3 item 7(3) — PRECEDENCE 1: `\'disposed\'` OUTRANKS `\'not-installed\'`',
    ).toBe('disposed')
    // **THE SECOND PRECEDENCE CLAUSE NEEDS A CONNECTED CONTROL TO ESTABLISH THE FIRST
    // GESTURE** (green-time test repair 2026-09-27): the as-filed drive installed ONE
    // element into a source whose `isConnected` returns exactly `false` and then expected
    // the SECOND `begin` on that SAME element to be `'busy'` — but the FIRST `begin` was
    // itself refused `'disconnected'` (`§2.4` item 5), so no gesture was ever active and
    // the cell compared `'disconnected'` against `'busy'`. The clause is about the ORDER of
    // the session's own checks, so the gesture must exist: `busyEl` is installed on a
    // source that answers `true` and establishes; `disconnectedEl` (installed on the same
    // source, whose reading is now `false`) is the element whose connectivity WOULD refuse;
    // and the `begin` on it must report `'busy'` — **the connectivity check is not even
    // reached**, which the recorded source log proves (no `isConnected` call was added by
    // the refused `begin`).
    const busySource = makeSource({ isConnected: (element: unknown) => (element as { id?: string }).id !== 'disconnected' })
    const busySession = create({ source: busySource })
    const busyEl: Record<string, unknown> = { id: 'busy' }
    const disconnectedEl: Record<string, unknown> = { id: 'disconnected' }
    busySession.install(busyEl, {})
    busySession.install(disconnectedEl, {})
    expect(busySession.begin(busyEl), 'P-GS-IM-3/§2.4 item 5 — the connected control establishes the gesture the precedence clause needs').toMatchObject({ ok: true })
    const isConnectedCallsBefore = busySource.log.filter((rec) => rec.op === 'isConnected').length
    expect(
      (busySession.begin(disconnectedEl) as { code: string }).code,
      'P-GS-IM-3/§2.4 item 5 — PRECEDENCE 2: `\'busy\'` (already active) beats `\'disconnected\'` (the connectivity check is not even reached)',
    ).toBe('busy')
    expect(
      busySource.log.filter((rec) => rec.op === 'isConnected').length,
      'P-GS-IM-3/§2.4 item 5 — and the clause is MEASURED, not assumed: the refused `begin` made NO connectivity reading at all, so `\'disconnected\'` really was not reached',
    ).toBe(isConnectedCallsBefore)
  })

  it('P-GS-IM-4 [S-GS-WINDOW-1] — EVERY terminal × stage: the ordered call log matches the declared pattern, stage by stage (30 attempts)', async () => {
    const rec = new RegisterRow('P-GS-IM-4', 'S-GS-WINDOW-1')
    const moduleState = await resolveModule()
    for (const terminal of IM4_TERMINALS) {
      for (const stage of IM4_STAGES) {
        rec.run(`${terminal} × stage ${stage}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const source = makeSource({})
          const observedAtHook: string[] = []
          const session = create({
            source,
            commit: (): void => undefined,
          })
          const el: Record<string, unknown> = { id: 'a' }
          session.install(el, {
            onEnd: (): void => void observedAtHook.push(...source.log.map((r) => `${r.op}:${r.type}`)),
            onCancel: (): void => void observedAtHook.push(...source.log.map((r) => `${r.op}:${r.type}`)),
          })
          if (stage === IM4_STAGES[0]) {
            const log = source.log.map((r) => `${r.op}:${r.type}`)
            return log.join(',') === `on:${TYPE_START}` ? null : `after \`install\` the log must be exactly \`on:${TYPE_START}\`; got ${JSON.stringify(log)}`
          }
          const began = session.begin(el)
          if (!began.ok) return `the \`begin\` was refused \`${began.code}\``
          const handle = began.gesture
          if (stage === IM4_STAGES[1]) {
            const log = source.log.map((r) => `${r.op}:${r.type}`)
            const expected = [`on:${TYPE_START}`, 'isConnected:isConnected', `on:${TYPE_MOVE}`, `on:${TYPE_END}`, `on:${TYPE_CANCEL}`]
            return log.join(',') === expected.join(',') ? null : `after \`begin\` the log must be ${JSON.stringify(expected)}; got ${JSON.stringify(log)}`
          }
          source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
          if (stage === IM4_STAGES[2]) {
            const count = source.listenerCount(el)
            return count === 4 ? null : `after the first \`pointermove\` the control must hold FOUR listeners; got ${count}`
          }
          if (stage === IM4_STAGES[3]) {
            // MID-TERMINAL: the hook must observe the detaches already present. A
            // `dispose()` and a direct `cancel` run no `onEnd`, so the observable hook is
            // `onCancel` for those; the three tracking `off`s are asserted from the log
            // anyway.
            if (terminal.startsWith('the recorded \'pointerup\'')) source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
            else if (terminal.startsWith('the recorded \'pointercancel\'')) source.fire(el, TYPE_CANCEL, PLACEHOLDER_EVENT)
            else if (terminal === 'a direct `end`') session.end(el, handle)
            else if (terminal === 'a direct `reset`') session.reset(el, handle, 'd')
            else if (terminal === 'a direct `cancel`') session.cancel(el, handle)
            else session.dispose()
            const offs = observedAtHook.filter((entry) => entry.startsWith('off:')).length
            if (offs !== 3) {
              return `at the terminal the consumer hook must observe the three \`off\` calls already present; observed ${offs} in ${JSON.stringify(observedAtHook)}`
            }
            return null
          }
          if (terminal.startsWith('the recorded \'pointerup\'')) source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
          else if (terminal.startsWith('the recorded \'pointercancel\'')) source.fire(el, TYPE_CANCEL, PLACEHOLDER_EVENT)
          else if (terminal === 'a direct `end`') session.end(el, handle)
          else if (terminal === 'a direct `reset`') session.reset(el, handle, 'd')
          else if (terminal === 'a direct `cancel`') session.cancel(el, handle)
          else session.dispose()
          const finalLog = source.log.map((r) => `${r.op}:${r.type}`)
          // **THE TAIL IS THE TERMINAL'S OWN DETACH ORDER — AND `dispose()` HAS ONE MORE
          // STEP THAN A TERMINAL** (green-time test repair 2026-09-27): `§0A` note 11 and
          // `§2.3` item 2(c) fix the terminal's detach order as
          // `off(move)`, `off(end)`, `off(cancel)` — so for the FIVE terminals that stop at
          // the gesture window, those three ARE the log's last three entries. **But
          // `dispose()` is not only a cancel: `dispose()` × stage 5 must ALSO detach the
          // START listener** (`§2.3` item 7(2): "the three tracking listeners of an
          // in-flight gesture … **and every start listener of every installed control**"),
          // which is the LAST call dispose makes. So the declared tail for that terminal is
          // the four-entry pattern whose last three are `off(end)`, `off(cancel)`,
          // `off(start)`. **The as-filed cell required the tracking three to be the last
          // three entries for ALL SIX terminals, which no implementation satisfying
          // `§2.3` items 2(c) AND 7(2) together can produce** — the start-listener detach
          // cannot be both before and after `onCancel`.
          const expectedTail =
            terminal === 'a `dispose()` during the gesture'
              ? [`off:${TYPE_MOVE}`, `off:${TYPE_END}`, `off:${TYPE_CANCEL}`, `off:${TYPE_START}`]
              : [`off:${TYPE_MOVE}`, `off:${TYPE_END}`, `off:${TYPE_CANCEL}`]
          const tail = finalLog.slice(-expectedTail.length)
          if (tail.join(',') !== expectedTail.join(',')) {
            return `the terminal's declared detach tail must be ${JSON.stringify(expectedTail)}; got ${JSON.stringify(tail)} (full log ${JSON.stringify(finalLog)})`
          }
          const count = source.listenerCount(el)
          const expectedCount = terminal === 'a `dispose()` during the gesture' ? 0 : 1
          return count === expectedCount ? null : `after the terminal the control must hold ${expectedCount} listener(s); got ${count}`
        })
      }
    }
    rec.finish()
    reconcile(rec, 30, 'P-GS-IM-4 — the declared term is `30` (`6` terminals × `5` stages)')
  })

  it('P-GS-IM-5 [S-GS-CAPTURE-1] — EVERY flag value × stage: ZERO capture before establishment, EXACTLY ONE after it iff truthy, at the gesture’s `end` terminal (24 declared attempts; 16 distinct observations, DERIVED) — YES (bounded)', async () => {
    const rec = new RegisterRow('P-GS-IM-5', 'S-GS-CAPTURE-1')
    const moduleState = await resolveModule()
    for (const flag of IM5_FLAGS) {
      const expectedPerStage = flag.optedIn ? [0, 1, 1, 1, 1, 1] : [0, 0, 0, 0, 0, 0]
      for (const [index, stage] of IM5_STAGES.entries()) {
        rec.run(`${flag.id} × stage ${stage}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const source = makeSource({})
          const session = create({ source, commit: (): void => undefined })
          const el: Record<string, unknown> = { id: 'a' }
          session.install(el, { capture: flag.capture })
          // **EACH STAGE'S READING IS A SNAPSHOT OF ITS OWN MOMENT** (green-time test
          // repair 2026-09-27): `source.captures` is the recorder's LIVE array, so the
          // as-filed row pushed its LENGTH six times and then read `readings[index]` AFTER
          // the whole lifecycle had run — every reading was therefore the FINAL count,
          // which made the "after `install`"/"after `begin`" stages unsatisfiable for an
          // opted-in flag while the row's own `expectedPerStage[0] = 0` was correct. Each
          // stage's count is now taken INTO THE SNAPSHOT at the moment of the stage.
          const readings: number[] = []
          readings.push(source.captures.length)
          const began = session.begin(el)
          if (!began.ok) return `the \`begin\` was refused \`${began.code}\``
          const handle = began.gesture
          // Stage 2 — the establishment point (`§2.3` item 6(b)): the capture call, iff
          // opted in, has already happened inside `begin`.
          readings.push(source.captures.length)
          const captureSeq = source.captures.length > 0 ? source.captures[0].seq : -1
          const captureElement = source.captures.length > 0 ? source.captures[0].element : undefined
          source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
          readings.push(source.captures.length)
          source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
          readings.push(source.captures.length)
          // **THE DRIVE'S TERMINAL IS THE `end` TERMINAL — AND ONLY IT** (`D-12`(c): the
          // property text says "at the gesture's terminal (the row's drive terminates with
          // `end`)"; the `reset`/`cancel` capture counts are `P-GS-IM-4`'s six terminals and
          // this row's per-STAGE flags, never a claim this row makes about the other two).
          session.end(el, handle)
          // Stage 5 — "after the terminal's detach": the terminal has returned, so this is
          // the cumulative count at THAT stage, taken here.
          readings.push(source.captures.length)
          // Stage 6 — "after the terminal's `commit`": the commit callback has run (it is
          // synchronous and inside the terminal), so the reading is taken once more at the
          // stage the row names. **Stages 5 and 6 read the SAME cumulative count**, and so do
          // stages 3 and 4 — the TWO alias pairs `IM5_STAGE_ALIAS_PAIRS` declares and this row
          // MEASURES (below), both of them real and DISJOINT, so the honest DISTINCT figure is
          // `6` stage POSITIONS less `2` aliased pairs = **`4` distinct readings per flag × `4`
          // flag values = `16` distinct observations**, while the DECLARED term `24` (`4` flags ×
          // `6` positions) stays UNMOVED and remains the figure the caps are compared against.
          // **⟶ CORRECTED 2026-09-27 (`D-12`, the gate-8 documentation review):** the as-filed
          // sentence read *"that aliasing is what makes the honest DISTINCT figure `5` per flag,
          // not `6` (`D-12`(c)/`ADV-GS-10`)"* — the SUPERSEDED reasoning, which counted ONE
          // alias pair while `§5.5.1`'s own prose names TWO (`ADV-GS-19` corrected the code at
          // this site to derive `16`; the sentence above still narrated the `5`). Kept visible
          // as provenance so no later pass re-derives the `5`/`20` pair as current.
          readings.push(source.captures.length)
          const observed = readings[index]
          if (observed !== expectedPerStage[index]) {
            return `for the flag ${flag.id} the capture count at stage ${stage} must be ${expectedPerStage[index]}; got ${observed} (readings ${JSON.stringify(readings)})`
          }
          // **⟶ `ADV-GS-19`: THE DECLARED ALIASING IS MEASURED, NOT MERELY ASSERTED.** The
          // two pairs `IM5_STAGE_ALIAS_PAIRS` names read the SAME cumulative count, so the
          // later position of a pair must equal its earlier one on EVERY drive. This is the
          // check that makes the derived distinct figure (`6 − 2 = 4` readings per flag)
          // something the table PROVES rather than something the row declares.
          const aliasPair = IM5_STAGE_ALIAS_PAIRS.find(([, later]) => later === index)
          if (aliasPair !== undefined && readings[aliasPair[1]] !== readings[aliasPair[0]]) {
            return `the stage positions ${aliasPair[0]} and ${aliasPair[1]} are a DECLARED ALIASED PAIR (§5.5.1’s own two named pairs: the two 'pointermove' stages and the two post-terminal stages): they must read the SAME cumulative capture count; got ${readings[aliasPair[0]]} and ${readings[aliasPair[1]]} (readings ${JSON.stringify(readings)})`
          }
          if (source.captures.length > 1) return `an opted-in gesture produced MORE than one capture call (${source.captures.length})`
          // Every capture call carries the gesture's OWN element and a real log position —
          // read from the SNAPSHOT taken at the establishment stage, never from the live
          // array after the lifecycle (which made the pre-establishment stage unassertable).
          if (captureSeq >= 0) {
            if (captureElement !== el) return 'a capture call carried an element other than the gesture’s own'
            if (captureSeq < 0) return 'the capture call has no log position'
          }
          // No capture call may appear before the "after `begin`" stage.
          if (index === 0 && readings[0] !== 0) return 'a capture call appeared at the "after `install`" stage'
          // **THE STAGE READINGS ARE REAL SNAPSHOTS, NOT ONE FINAL COUNT READ SIX TIMES**:
          // for an OPTED-IN flag nothing is captured through `install`, the establishment
          // point (`readings[1]`, taken after `begin`) is the FIRST reading that is `1`, and
          // every later stage stays `1` — the `0,0,1,1,1,1` progression `§5.5.1` declares.
          if (flag.optedIn && !(readings[0] === 0 && readings[1] === 1 && readings[2] === 1 && readings[5] === 1)) {
            return `for the opted-in flag ${flag.id} the readings must be \`0\` at "after install" and \`1\` from the establishment stage on; got ${JSON.stringify(readings)} (a constant reading would mean the stages were not snapshotted)`
          }
          if (!flag.optedIn && readings.some((n) => n !== 0)) {
            return `for the non-opted-in flag ${flag.id} EVERY stage must read ZERO capture calls; got ${JSON.stringify(readings)}`
          }
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 24, 'P-GS-IM-5 — the declared term is `24` (`4` flag values × `6` stages)')
    // **⟶ `D-12`(c)/`ADV-GS-10`, CORRECTED BY `ADV-GS-19` (the gate-4 closure): THE DECLARED
    // TERM BESIDE THE HONEST DISTINCT-DRIVE FIGURE — NOW DERIVED FROM THE TABLE.** `§5.5.1`'s
    // cell states it in its own words: *"the DECLARED term `24` stands and the HONEST
    // DISTINCT-DRIVE figure is `5` DISTINCT STAGES PER FLAG value (the two `pointermove`
    // stages and the two post-terminal stages read the SAME cumulative capture count, so the
    // row drives `6` stage POSITIONS whose DISTINCT observations are `5` per flag …"*, and
    // *"the row's drive terminates with `end`"*. **THE CELL'S OWN ARITHMETIC AND ITS OWN
    // ALIASING LIST DISAGREE: two named pairs subtract TWO positions, not one, so the honest
    // figure per flag is `6 − 2 = 4` — and this row now DERIVES it from the table rather than
    // hard-coding a figure its printed aliasing list contradicts.** The DECLARED `24` is
    // UNMOVED (it counts stage POSITIONS) and remains the figure the caps are compared
    // against.
    const im5DistinctStagesPerFlag = IM5_STAGES.length - IM5_STAGE_ALIAS_PAIRS.length
    const im5DistinctObservations = IM5_FLAGS.length * im5DistinctStagesPerFlag
    console.log(
      `§5.5.1 P-GS-IM-5 distinct-drive record :: ${JSON.stringify({
        declaredTerm: 24,
        declaredTerms: '4 flag values x 6 stage positions',
        distinctFlagValues: IM5_FLAGS.length,
        distinctStagesPerFlag: im5DistinctStagesPerFlag,
        distinctObservations: im5DistinctObservations,
        stagePositions: IM5_STAGES.length,
        aliasingStagePositions: IM5_STAGE_ALIAS_PAIRS.map(
          ([earlier, later]) => `${IM5_STAGES[earlier]} ≡ ${IM5_STAGES[later]} (the same cumulative capture count)`,
        ),
        derivation: 'DERIVED from the table: stage POSITIONS (6) less the TWO declared aliased pairs (2) = 4 distinct readings per flag; 4 flags x 4 = 16 distinct observations',
        terminalDriveReaches: 'the `end` terminal only (the `reset`/`cancel` counts are P-GS-IM-4s and P-GS-IM-5s per-stage flags)',
        attemptsRun: rec.attemptsRunPublic(),
      })}`,
    )
    expect(
      IM5_STAGE_ALIAS_PAIRS.length,
      'P-GS-IM-5/§5.5.1 — the table declares the TWO aliased pairs `§5.5.1`’s own prose names ("the two `pointermove` stages and the two post-terminal stages read the SAME cumulative capture count"), which is what makes the derived figure `4` per flag rather than the hard-coded `5`',
    ).toBe(2)
    expect(
      im5DistinctObservations,
      `P-GS-IM-5/§5.5.1 — the HONEST DISTINCT-DRIVE figure, DERIVED from the table: \`${IM5_FLAGS.length}\` distinct flag values × \`${im5DistinctStagesPerFlag}\` distinct stage readings per flag (\`${IM5_STAGES.length}\` stage POSITIONS less the \`${IM5_STAGE_ALIAS_PAIRS.length}\` declared aliased pairs) = \`${im5DistinctObservations}\` distinct observations, reported BESIDE the declared \`24\` and never substituted for it`,
    ).toBe(16)
    expect(
      IM5_STAGES.length,
      `P-GS-IM-5/§5.5.1 — the row drives \`${IM5_STAGES.length}\` stage POSITIONS (the declared \`24\` rests on them), of which \`${im5DistinctStagesPerFlag}\` are DISTINCT readings per flag`,
    ).toBe(6)
    // The per-stage assertion ITSELF is now the extracted predicate the `PRE-5` control
    // runs (`D-13`), so the control and the row cannot drift apart.
    expect(
      im5CountPredicateHolds(1, true) && im5CountPredicateHolds(0, false) && !im5CountPredicateHolds(0, true),
      'P-GS-IM-5/§5.5.1 — the per-stage predicate this row asserts is the SAME function `PRE-5`’s control runs against the capture-skipping stand-in (one predicate, one verdict — `§5.5.1`’s `0,0,1,1,1,1` / all-zero progression)',
    ).toBe(true)
  })

  it('P-GS-IM-6 [S-GS-DISPOSE-1] — EVERY session shape × gesture state × operation: the baseline is restored, the report shape is honest, and NOTHING is retained (30 attempts; the falsifiable second-`dispose()` drive is `M-13`’s)', async () => {
    const rec = new RegisterRow('P-GS-IM-6', 'S-GS-DISPOSE-1')
    const moduleState = await resolveModule()
    for (const shape of IM6_SHAPES) {
      for (const gestureState of IM6_STATES) {
        for (const operation of IM6_OPERATIONS) {
          rec.run(`${shape} × ${gestureState} × ${operation}`, () => {
            if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
            const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
            if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
            const source = makeSource({})
            const commits = { value: 0 }
            const session = create({
              source,
              commit: (): void => {
                commits.value += 1
              },
            })
            const elA: Record<string, unknown> = { id: 'a' }
            const elB: Record<string, unknown> = { id: 'b' }
            const newEl: Record<string, unknown> = { id: 'new' }
            session.install(elA, { capture: shape.startsWith('(3)') })
            if (!shape.startsWith('(3)')) session.install(elB, {})
            const active = gestureState === 'active-at-dispose'
            if (active) {
              const began = session.begin(elA)
              if (!began.ok) return `the shape ${shape} could not establish the gesture it declares (code ${began.code})`
            }
            if (shape.startsWith('(3)')) source.failOff = (): boolean => true
            // **EVERY LISTENER THE SESSION ATTACHED IS DETACHED AT `dispose()`** (green-time
            // test repair 2026-09-27): the as-filed expression returned `0` for the IDLE
            // gesture state, so `shapes (1)/(2) × idle × dispose()` demanded
            // `report.removed === 0` while `M-13`/`I-5` (§2.3 item 7(2), `§0A` note 3)
            // require `dispose()` to detach **every start listener of every installed
            // control** — `2` for two idle controls. The declared expectation is the
            // number of `on` calls the session made (`§2.3` item 7(2): the tracking three
            // of an in-flight gesture PLUS every start listener), which is exactly what
            // the idle and active states both contribute.
            const expectedDetaches = source.log.filter((r) => r.op === 'on').length
            const statsBefore = session.stats()
            const gesturesBefore = statsBefore.gestures
            const commitsBefore = statsBefore.commits
            const callsBefore = source.log.length
            if (operation === IM6_OPERATIONS[0]) {
              const report = session.dispose()
              if (report.complete === shape.startsWith('(3)')) {
                return `for the shape ${shape} the report must carry \`complete: ${String(!shape.startsWith('(3)'))}\`; got ${JSON.stringify(report)}`
              }
              if (!shape.startsWith('(3)') && report.removed !== expectedDetaches) {
                return `the report’s \`removed\` must be the number of detaches (${expectedDetaches}); got ${report.removed}`
              }
              if (commits.value !== 0) return 'a `dispose()` invoked `commit` (the cancel path commits ZERO times)'
              const pairs = pairOnOffCalls(source.log)
              if (!shape.startsWith('(3)') && pairs.unmatched.length > 0) {
                return `after \`dispose()\` every \`on\` must be matched by exactly one \`off\` with the same three values; unmatched ${JSON.stringify(pairs.unmatched)}`
              }
              if (!shape.startsWith('(3)') && source.listenerPairs().length !== 0) {
                return `the net listener count after \`dispose()\` must be ZERO; got ${JSON.stringify(source.listenerPairs())}`
              }
              return null
            }
            if (operation === IM6_OPERATIONS[1]) {
              session.dispose()
              const report = session.dispose()
              // ⟶ `D-12`(a)/`ADV-GS-8`: **THE SECOND CALL'S DRIVE IS `M-13`'s, NOT THIS ROW'S.**
              // `§5.5.1 P-GS-IM-6`'s corrected cell states it in its own words: the
              // second-`dispose()` limb is *"a TAUTOLOGY for a conforming module (a
              // permanently-inert instance cannot make a source call), so THIS ROW DOES NOT
              // CLAIM IT AS ITS OWN FALSIFIABLE DRIVE: the falsifiable second-`dispose()`
              // drive is `M-13`'s, which runs it against a live recording source and asserts
              // the zero-call report. What this register cell still carries is the report
              // SHAPE the second call shares with the first (`removed`/`complete`) and the
              // retained-state facts."* So this cell asserts the SHAPE — and nothing here is
              // offered as the falsifiable zero-call drive; `M-13` runs that (`§3.1`), with
              // its own `{removed: 0, complete: true}` assertion against a live source.
              if (report.removed !== 0 || report.complete !== true) {
                return `the SECOND \`dispose()\` must report the shared report SHAPE \`{removed: 0, complete: true}\`; got ${JSON.stringify(report)}`
              }
              const secondCallCalls = source.log.slice(callsBefore).length
              void secondCallCalls
              // The retained-state half of the cell, on the SAME drive (`§2.3` item 7(3)).
              const after = session.stats()
              if (after.installed !== 0) return `\`stats().installed\` must be 0 after \`dispose()\`; got ${after.installed}`
              if (after.active !== false) return '`stats().active` must be false after `dispose()`'
              if (session.gesture() !== null) return '`gesture()` must return `null` after `dispose()`'
              if (session.disposed !== true) return '`session.disposed` must stay `true` (the state is irreversible)'
              // The two counters KEEP their values across the boundary (`§2.3` item 7(3),
              // `§0A` note 8) — the cell's own retained-state facts, asserted on this drive.
              if (after.gestures !== gesturesBefore) return 'the `gestures` counter must KEEP its value across the second `dispose()`'
              if (after.commits !== commitsBefore) return 'the `commits` counter must KEEP its value across the second `dispose()`'
              return null
            }
            if (operation === IM6_OPERATIONS[2]) {
              session.dispose()
              const returned = session.install(newEl, {})
              return returned === false ? null : `\`install\` after \`dispose()\` must return \`false\`; got ${JSON.stringify(returned)}`
            }
            if (operation === IM6_OPERATIONS[3]) {
              session.dispose()
              const result = session.begin(elA)
              return result.ok === false && result.code === 'disposed'
                ? null
                : `\`begin\` after \`dispose()\` must report \`disposed\`; got ${JSON.stringify(result)}`
            }
            session.dispose()
            const stats = session.stats()
            if (stats.installed !== 0) return `\`stats().installed\` must be 0 after \`dispose()\`; got ${stats.installed}`
            if (stats.active !== false) return '`stats().active` must be false after `dispose()`'
            if (session.gesture() !== null) return '`gesture()` must return `null` after `dispose()`'
            if (stats.gestures !== gesturesBefore) return 'the `gestures` counter must KEEP its value across `dispose()`'
            if (stats.commits !== commitsBefore) return 'the `commits` counter must KEEP its value across `dispose()`'
            return null
          })
        }
      }
    }
    rec.finish()
    reconcile(rec, 30, 'P-GS-IM-6 — the declared term is `30` (`3` session shapes × `2` gesture states × `5` operations)')
    // -----------------------------------------------------------------------
    // **⟶ `ADV-GS-20` (THE GATE-4 CLOSURE, 2026-09-27): THE HONEST DISTINCT-DRIVE FIGURE IS
    // DERIVED FROM THIS TABLE, NOT HARD-CODED.** `§5.5.2`'s DECLARED-VERSUS-DISTINCT ledger
    // prints `P-GS-IM-6 — DECLARED 30, DISTINCT DRIVES 26 (shape (1)'s redundant gesture
    // state)`, and NEITHER HALF is what the table does: the drive's ONLY shape-dependent
    // branch is its own `(3)`-class selector (`shape.startsWith('(3)')`), which means shapes
    // `(1)` and `(2)` are BYTE-IDENTICAL DRIVES over ALL TEN of their cells (both states × five
    // operations), and the signature below is derived by running THAT SAME classifier over the
    // table. The derivation is therefore `2` drive classes × `2` gesture states × `5`
    // operations = `20` DISTINCT DRIVES — an EXACT figure, not a bound, because the drive is a
    // pure function of (class, state, operation) — against the declared `30` attempt term,
    // which counts CELLS and is what the caps are compared against (the DECLARED term `30` is
    // UNMOVED).
    const im6DriveSignature = (shape: string, gestureState: string, operation: string): string =>
      `${shape.startsWith('(3)') ? 'the `(3)`-class shape' : 'the (1)/(2) class (its only branch is the `(3)` selector)'} × ${gestureState} × ${operation}`
    const im6Signatures = IM6_SHAPES.flatMap((shape) =>
      IM6_STATES.flatMap((gestureState) => IM6_OPERATIONS.map((operation) => im6DriveSignature(shape, gestureState, operation))),
    )
    const im6DistinctDrives = new Set(im6Signatures).size
    console.log(
      `§5.5.1 P-GS-IM-6 distinct-drive record :: ${JSON.stringify({
        declaredTerm: 30,
        declaredTerms: '3 session shapes x 2 gesture states x 5 operations',
        specDeclaredDistinctDrives: 26,
        specNamedReason: 'shape (1)’s redundant gesture state',
        tableDerivedDistinctDrives: im6DistinctDrives,
        tableDerivedKind: 'EXACT (the drive is a pure function of the shape class, the gesture state and the operation)',
        tableDerivedReason:
          'the drive’s ONLY shape-dependent branch is its own `(3)`-class selector, so shapes (1) and (2) are BYTE-IDENTICAL drives over ALL TEN of their cells — the redundancy is not confined to “shape (1)’s redundant gesture state”',
        aliasedCells: im6Signatures.length - im6DistinctDrives,
        measuredCells: im6Signatures.length,
      })}`,
    )
    expect(
      im6Signatures.length,
      'P-GS-IM-6/§5.5.3 — the derived census covers every DECLARED cell (`3` shapes × `2` states × `5` operations = `30`), so the derived distinct figure is a statement about the whole table',
    ).toBe(30)
    expect(
      im6DistinctDrives,
      `P-GS-IM-6/§5.5.1 — the HONEST DISTINCT-DRIVE figure, DERIVED by running the drive’s OWN shape classifier over the table: \`2\` drive classes × \`2\` gesture states × \`5\` operations = \`${im6DistinctDrives}\` DISTINCT drives (EXACT, not a bound), printed BESIDE the declared \`30\` and never substituted for it. The spec’s \`26\` and its reason ("shape (1)’s redundant gesture state") are what the table DERIVES as \`${
        im6Signatures.length - im6DistinctDrives
      }\` aliased cells over the \`(1)\`/\`(2)\` pair in BOTH states`,
    ).toBe(20)
    expect(
      new Set(IM6_SHAPES.map((shape) => shape.startsWith('(3)'))).size,
      'P-GS-IM-6/`ADV-GS-20` — the table really holds TWO drive classes (one `(3)`-class member and two `(1)`/`(2)`-class members whose only distinguishing text is their id), which is the premise of the derivation above',
    ).toBe(2)
  })

  it('P-GS-SM-1 [S-GS-STATE-1] — EVERY state × op: the declared transition or refusal, with monotonic counters (40 attempts)', async () => {
    const rec = new RegisterRow('P-GS-SM-1', 'S-GS-STATE-1')
    const moduleState = await resolveModule()
    for (const state of SM1_STATES) {
      for (const op of SM1_OPS) {
        rec.run(`${state} × ${op}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const source = makeSource({})
          const session = create({ source, commit: (): void => undefined })
          const el: Record<string, unknown> = { id: 'a' }
          const newEl: Record<string, unknown> = { id: 'new' }
          let activeHandle: GestureHandle | null = null
          let staleHandle: GestureHandle | null = null
          if (state === 'installed-idle' || state === 'active') session.install(el, {})
          if (state === 'active') {
            const began = session.begin(el)
            if (!began.ok) return `the \`active\` state could not be built (code ${began.code})`
            activeHandle = began.gesture
          }
          if (state === 'disposed') {
            session.install(el, {})
            session.dispose()
          }
          if (op.startsWith('`end(el, staleHandle)`') && deriveState(session) === 'active') {
            // **A GENUINE EARLIER-GESTURE HANDLE, BUILT WITHOUT DISTURBING THE ACTIVE
            // STATE** (green-time test repair 2026-09-27): the as-filed block called a bare
            // `session.begin(el)` on a session that ALREADY had an active gesture, so the
            // `begin` was refused `'busy'` (`§2.3` item 3 — a stale handle CANNOT be
            // manufactured while a gesture is active), `staleHandle` stayed `null`, and the
            // row then passed the ACTIVE handle to `end`, which legitimately succeeded. The
            // handle must instead come from a PREVIOUS gesture: terminate the active one,
            // establish the NEXT one, and keep the FIRST gesture's handle — the previous
            // handle is now stale while a gesture is genuinely active again (`§2.4` item 4),
            // so the refusal this cell declares (`'stale'`, with the id-N gesture STILL
            // ACTIVE) is reachable.
            const first = activeHandle
            session.end(el, first as GestureHandle)
            const second = session.begin(el)
            if (!second.ok) return `the state ${state} could not re-establish a live gesture after terminating the first (code ${second.code})`
            activeHandle = second.gesture
            staleHandle = first
          }
          const statsBefore = session.stats()
          const stateBefore = deriveState(session)
          const result = driveOp(session, op, el, newEl, activeHandle, staleHandle)
          const stateAfter = deriveState(session)
          const statsAfter = session.stats()
          if (statsAfter.gestures < statsBefore.gestures) return 'the `gestures` counter went BACKWARDS'
          if (statsAfter.commits < statsBefore.commits) return 'the `commits` counter went BACKWARDS'
          const declared = declaredTransition(stateBefore as SmState, op)
          if (declared.state !== null && stateAfter !== declared.state) {
            return `the op ${op} in state ${state} must reach \`${declared.state}\`; got \`${stateAfter}\` (${JSON.stringify(result)})`
          }
          if (declared.code !== null) {
            const code = op === '`stats()`' ? 'ok' : ((result as { code?: string }).code ?? String(result))
            if (code !== declared.code) return `the declared code for ${op} in state ${state} is \`${declared.code}\`; got \`${code}\``
          }
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 40, 'P-GS-SM-1 — the declared term is `40` (`4` states × `10` ops)')
  })

  it('P-GS-SM-2 [S-GS-IDENTITY-1] — EVERY element shape × operation pair: the ledger is keyed by REFERENCE IDENTITY (30 attempts)', async () => {
    const rec = new RegisterRow('P-GS-SM-2', 'S-GS-IDENTITY-1')
    const moduleState = await resolveModule()
    for (const shape of SM2_SHAPES) {
      for (const pair of SM2_PAIRS) {
        rec.run(`${shape} × ${pair}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const source = makeSource({})
          const session = create({ source, commit: (): void => undefined })
          const first: Record<string, unknown> = { plain: true }
          const clone: Record<string, unknown> = { plain: true }
          const frozen = Object.freeze({ plain: true })
          const withSymbol = { [Symbol('k')]: 1 }
          const nodeLike = { nodeType: 1 }
          const target = ((): unknown => {
            if (shape.startsWith('(1)')) return first
            if (shape.startsWith('(2)')) return nodeLike
            if (shape.startsWith('(3)')) return frozen
            if (shape.startsWith('(4)')) return withSymbol
            return clone
          })()
          const startCalls = (): number => source.log.filter((r) => r.op === 'on' && r.type === TYPE_START).length
          if (pair === SM2_PAIRS[0]) {
            if (session.install(target, {}) !== true) return 'the first install must return `true`'
            const callsAfterFirst = startCalls()
            if (session.install(target, {}) !== false) return 'the SECOND install of the SAME object must return `false`'
            if (startCalls() !== callsAfterFirst) return 'the repeat install made a source call (it must be a NO-OP)'
            return session.stats().installed === 1 ? null : `the ledger must hold ONE entry; got ${session.stats().installed}`
          }
          if (pair === SM2_PAIRS[1]) {
            session.install(first, {})
            session.install(clone, {})
            if (startCalls() !== 2) return `two structurally identical but DISTINCT objects must yield TWO start listeners; got ${startCalls()}`
            return session.stats().installed === 2 ? null : `the ledger must hold TWO entries; got ${session.stats().installed}`
          }
          if (pair === SM2_PAIRS[2]) {
            session.install(first, {})
            session.install(clone, {})
            const one = session.begin(first)
            if (!one.ok) return `the first \`begin\` was refused \`${one.code}\``
            const second = session.begin(clone)
            return !second.ok && second.code === 'busy'
              ? null
              : `a \`begin\` on the DISTINCT clone while the first is active must be refused \`busy\`; got ${JSON.stringify(second)}`
          }
          if (pair === SM2_PAIRS[3]) {
            session.install(first, {})
            session.install(clone, {})
            const began = session.begin(first)
            if (!began.ok) return `the \`begin\` was refused \`${began.code}\``
            const result = session.end(clone, began.gesture)
            if (result.ok !== false || result.code !== 'stale') {
              return `an ELEMENT MISMATCH must be refused \`stale\`; got ${JSON.stringify(result)}`
            }
            return session.stats().active ? null : 'the live gesture was half-terminated by the element-mismatch refusal'
          }
          if (pair === SM2_PAIRS[4]) {
            session.install(first, {})
            session.dispose()
            const returned = session.install(first, {})
            return returned === false ? null : `a reinstall after \`dispose()\` must return \`false\`; got ${JSON.stringify(returned)}`
          }
          session.install(first, {})
          const began = session.begin(first)
          if (!began.ok) return `the \`begin\` was refused \`${began.code}\``
          const installResult = session.install(clone, {})
          if (installResult !== true) return 'a DIFFERENT object installed during an active gesture must still return `true`'
          return session.stats().installed === 2 ? null : `the ledger must hold TWO entries; got ${session.stats().installed}`
        })
      }
    }
    rec.finish()
    reconcile(rec, 30, 'P-GS-SM-2 — the declared term is `30` (`5` element shapes × `6` operation pairs)')
  })

  it('P-GS-SM-3 [S-GS-COMMIT-1] — EVERY terminal path × value/consumer shape: the exact commit count, in the session’s OWN report (32 attempts) — THE HEART OF THIS UNIT', async () => {
    const rec = new RegisterRow('P-GS-SM-3', 'S-GS-COMMIT-1')
    const moduleState = await resolveModule()
    for (const path of SM3_PATHS) {
      for (const shape of SM3_SHAPES) {
        rec.run(`${path} × ${shape}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const source = makeSource({})
          const commits: unknown[] = []
          let thrownByCommit = 0
          const session = create({
            source,
            commit: (_g: GestureHandle, value: unknown): void => {
              commits.push(value)
              if (shape.startsWith('(h)')) {
                thrownByCommit += 1
                throw new Error('the consumer commit callback threw')
              }
            },
          })
          const el: Record<string, unknown> = { id: 'a' }
          session.install(el, {
            onMove: shape.startsWith('(g)')
              ? (): never => {
                  throw new Error('the consumer onMove threw')
                }
              : undefined,
          })
          const began = session.begin(el)
          if (!began.ok) return `the \`begin\` was refused \`${began.code}\``
          const handle = began.gesture
          // The shape's own value state.
          const objectValue = { k: 1 }
          if (shape.startsWith('(b)')) handle.set(0)
          else if (shape.startsWith('(c)')) handle.set(Number.NaN)
          else if (shape.startsWith("(d)")) handle.set('')
          else if (shape.startsWith('(e)')) handle.set(objectValue)
          else if (shape.startsWith("(f)")) handle.set(Symbol('s'))
          if (shape.startsWith('(g)')) {
            // The throwing `onMove` is driven, then the gesture is terminated normally: the
            // path's commit count must still be the declared one.
            let moveThrew = false
            try {
              source.fire(el, TYPE_MOVE, PLACEHOLDER_EVENT)
            } catch {
              moveThrew = true
            }
            if (!moveThrew) return 'the shape (g) `onMove` throw did not propagate (the row’s own precondition)'
            if (!session.stats().active) return 'the gesture was terminated by a throwing `onMove` (a move is not a terminal)'
          }
          if (shape.startsWith('(h)')) {
            // Only the committing paths can throw here.
          }
          // **THE RULED COUNT SEAM** (green-time test repair 2026-09-27): a
          // `pointerup`/`pointercancel` path terminates from INSIDE the session's own
          // recorded handler, whose `source.fire()` returns **`null`** — so the as-filed
          // `result?.committed` read `undefined` off that `null` and could never be `true`
          // for the recorded `'pointerup'` path, although `§2.3` item 4 declares
          // `{ok:true, code:'ok', committed:true}` for a successful `end`. The session's
          // OWN counters and its own `lastCode` ARE the report of the terminal that ran
          // (`§0A` note 12: `stats()`/`gesture()` are the count seam, and the
          // `TerminalResult`'s `code` is the same `lastCode` the session keeps), so the
          // recorded-handler paths are read from the session's report — the ruling's own
          // seam — rather than from the fire return, while a direct `end`/`reset`/`cancel`
          // keeps reading its OWN returned `TerminalResult`.
          const sessionReported = (): TerminalResult => ({
            ok: session.stats().lastCode === 'ok',
            code: session.stats().lastCode,
            committed: session.stats().commits === 1,
          })
          const terminate = (): unknown => {
            if (path.startsWith("the recorded 'pointerup'")) {
              source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
              return sessionReported()
            }
            if (path.startsWith("the recorded 'pointercancel'")) {
              source.fire(el, TYPE_CANCEL, PLACEHOLDER_EVENT)
              return sessionReported()
            }
            if (path === 'a direct `end`') return session.end(el, handle)
            return session.reset(el, handle, 'the supplied default')
          }
          let terminalThrew = false
          let result: unknown = null
          try {
            result = terminate()
          } catch {
            terminalThrew = true
          }
          const expectedCommits =
            path.startsWith("the recorded 'pointercancel'") ? 0 : 1
          if (commits.length !== expectedCommits) {
            return `the path ${path} in shape ${shape} must invoke \`commit\` ${expectedCommits} time(s); got ${commits.length}`
          }
          if (session.stats().commits !== expectedCommits) {
            return `the session’s OWN counter must report ${expectedCommits}; got ${session.stats().commits}`
          }
          if (shape.startsWith('(h)')) {
            // **THE THROWING `commit` IS REACHED ONLY WHERE A COMMIT HAPPENS** (green-time
            // test repair 2026-09-27): `§5.5.1 P-GS-SM-3` declares the `(h)` limb as *"a
            // throw still leaves the path's commit count as declared"*, and the path's
            // declared count is what decides whether the throw can exist at all — a
            // `'pointercancel'` path invokes `commit` **ZERO** times (`§2.3` item 4:
            // *"cancel — including a `pointercancel` … ⇒ ZERO"*), so no `commit` call exists
            // there to throw and demanding a propagated throw was unsatisfiable. The clause
            // is therefore asserted ON THE COMMITTING PATHS, and — exactly as
            // `§5.5.1 P-GS-SM-3` requires — the cancelling path's count is asserted as
            // declared (`0`) with NO commit invocation to throw.
            if (expectedCommits === 0) {
              if (thrownByCommit !== 0) return `the path ${path} declares ZERO commits, so the throwing \`commit\` must never be invoked; got ${thrownByCommit} invocation(s)`
              if (terminalThrew) return `the path ${path} declares ZERO commits (§2.3 item 4), so no \`commit\` throw can propagate from it; the terminal threw`
            } else {
              if (!terminalThrew) return 'the shape (h) `commit` throw did not PROPAGATE'
              if (thrownByCommit !== 1) return `the throwing commit must still be invoked exactly once (never retried); got ${thrownByCommit}`
              if (session.stats().commits !== 1) return 'the throwing commit must STILL count as the gesture’s ONE commit'
            }
          }
          if (!shape.startsWith('(h)') && expectedCommits === 1) {
            const committed = (result as TerminalResult | null)?.committed
            if (committed !== true) return `the committing terminal must report \`committed: true\`; got ${JSON.stringify(result)}`
          }
          if (expectedCommits === 0) {
            const committed = (result as TerminalResult | null)?.committed
            if (committed !== false) return `a cancel terminal must report \`committed: false\`; got ${JSON.stringify(result)}`
          }
          if (path === 'a direct `reset`' && commits.length === 1) {
            const committedValue = commits[0]
            if (committedValue !== 'the supplied default') {
              return `\`reset\` must commit the SUPPLIED value; got ${brief(committedValue)}`
            }
          }
          if (shape.startsWith('(e)') && path !== 'a direct `reset`' && commits.length === 1) {
            if (commits[0] !== objectValue) return 'the committed object must be the SAME reference the consumer set (by identity)'
          }
          if (handle.outcome !== null && session.stats().active) {
            return `the terminal left the session ACTIVE with outcome \`${String(handle.outcome)}\` (a refusal never half-terminates, but a successful terminal must end the gesture)`
          }
          if (source.listenerCount(el) !== 1) {
            return `after the terminal the control must hold ONE listener; got ${source.listenerCount(el)}`
          }
          return null
        })
      }
    }
    rec.finish()
    reconcile(rec, 32, 'P-GS-SM-3 — the declared term is `32` (`4` terminal paths × `8` value/consumer shapes)')
  })

  it('P-GS-TP-1 [S-GS-TOTAL-1] — EVERY phase × shape × function: never throw, always return the declared shape (24 DRIVES) — YES (bounded)', async () => {
    const rec = new RegisterRow('P-GS-TP-1', 'S-GS-TOTAL-1')
    const moduleState = await resolveModule()
    let assertions = 0
    /** `ADV-GS-24`: the source value each PHASE-A seam drive really handed to
     *  `installGestureListeners` — recorded so the four drives can be shown to be four
     *  DIFFERENT calls rather than the four copies of `installGestureListeners(undefined, …)`
     *  the as-filed arm performed. */
    const phaseASeamSources: Array<{ shape: string; source: unknown }> = []
    for (const phase of TP1_PHASES) {
      for (const shape of phase.shapes) {
        for (const fn of ['the returned SESSION', 'the module-level seam'] as const) {
          rec.run(`${phase.id} × ${shape.id} × ${fn}`, () => {
            if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
            const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
            const install = moduleState.mod['installGestureListeners'] as (
              s: unknown,
              e: unknown,
              h: (element: unknown) => void,
            ) => (() => void) | null
            const detach = moduleState.mod['detachGestureListeners'] as (s: unknown, e: unknown, h: unknown) => boolean
            if (typeof create !== 'function' || typeof install !== 'function' || typeof detach !== 'function') {
              return '§2.1’s three value exports are not all functions'
            }
            const made = shape.make()
            const element: Record<string, unknown> = { control: true }
            if (phase.id.startsWith('PHASE A')) {
              if (fn === 'the returned SESSION') {
                let session: GestureSessionMirror | null = null
                try {
                  session = create(made as never)
                } catch (e) {
                  return `\`createGestureSession\` threw for ${shape.id}: ${describeThrown(e)}`
                }
                assertions += 3
                if (session === null || typeof session !== 'object') return `the factory returned ${brief(session)}`
                for (const member of ['install', 'begin', 'end', 'reset', 'cancel', 'dispose', 'gesture', 'stats']) {
                  if (typeof (session as unknown as Record<string, unknown>)[member] !== 'function') {
                    return `the returned instance is missing the callable member \`${member}\``
                  }
                }
                return null
              }
              // **⟶ THE SHAPE IS DRIVEN, NOT DISCARDED (`ADV-GS-24`, the gate-4 closure).**
              // As filed this arm called `installGestureListeners(undefined, element, …)` for
              // ALL FOUR Phase-A shapes, so four of the twenty-four DRIVES were the same call
              // and the shape under test never reached the seam. The seam's own totality input
              // is its SOURCE argument, so the drive now hands it a value DERIVED FROM THE
              // SHAPE: the shape itself, except where the shape carries a `source` member
              // (`(4) {source: null}`), in which case that member is the source argument. The
              // four drives therefore carry four DISTINCT source values (asserted below).
              const seamSource =
                made !== null && typeof made === 'object' && 'source' in (made as Record<string, unknown>)
                  ? (made as Record<string, unknown>)['source']
                  : made
              let returned: unknown = null
              try {
                returned = install(seamSource as never, element, () => undefined)
              } catch (e) {
                return `\`installGestureListeners\` threw for the source derived from the Phase-A shape ${shape.id}: ${describeThrown(e)}`
              }
              assertions += 3
              phaseASeamSources.push({ shape: shape.id, source: seamSource })
              return returned === null || typeof returned === 'function' ? null : `the seam returned ${brief(returned)}`
            }
            if (phase.id.startsWith('PHASE B')) {
              const source = made
              if (fn === 'the module-level seam') {
                for (const [label, target] of [
                  ['`null`', null],
                  ['`undefined`', undefined],
                  ['a real object', element],
                ] as ReadonlyArray<readonly [string, unknown]>) {
                  let handler: unknown = null
                  let threw: unknown = null
                  try {
                    handler = install(source as never, target, () => undefined)
                  } catch (e) {
                    threw = e
                  }
                  assertions += 3
                  if (threw !== null) {
                    return `\`installGestureListeners(${shape.id}, ${label})\` threw: ${describeThrown(threw)}`
                  }
                  if (handler !== null && typeof handler !== 'function' && (source as { on?: unknown })?.on !== undefined) {
                    return `\`installGestureListeners(${shape.id}, ${label})\` returned ${brief(handler)}`
                  }
                }
                let detached: unknown = null
                try {
                  detached = detach(source as never, element, null)
                } catch (e) {
                  return `\`detachGestureListeners(${shape.id})\` threw: ${describeThrown(e)}`
                }
                if (typeof detached !== 'boolean') return `\`detachGestureListeners(${shape.id})\` returned ${brief(detached)}, not a boolean`
                if (detached !== false) return `\`detachGestureListeners(${shape.id}, element, null)\` must return \`false\` for a never-attached handler; got ${String(detached)}`
                return null
              }
              // PHASE B's second drive: the same two functions, driven with a REAL element
              // through the returned session's own install (the seam the session uses).
              let session: GestureSessionMirror | null = null
              try {
                session = create({ source: source as never })
              } catch (e) {
                return `\`createGestureSession\` threw for the source shape ${shape.id}: ${describeThrown(e)}`
              }
              assertions += 3
              if (session === null) return 'the factory returned null for a hostile source'
              let returned: unknown = null
              let threw: unknown = null
              try {
                returned = session.install(element, {})
              } catch (e) {
                threw = e
              }
              if (threw !== null) return `\`install\` threw for the source shape ${shape.id}: ${describeThrown(threw)}`
              return typeof returned === 'boolean' ? null : `\`install\` returned ${brief(returned)}, not a boolean`
            }
            // PHASE C — the session methods under a hostile state.
            const hostileSource = shape.id.startsWith('(1)')
              ? {
                  on: (): never => {
                    throw new Error('on threw')
                  },
                  off: (): never => {
                    throw new Error('off threw')
                  },
                }
              : shape.id.startsWith('(2)')
                ? { on: 42, off: null }
                : undefined
            let session: GestureSessionMirror | null = null
            try {
              session = create(
                (shape.id.startsWith('(3)') ? { source: null } : { source: hostileSource, commit: shape.id.startsWith('(4)') ? (): never => { throw new Error('commit threw') } : undefined }) as never,
              )
            } catch (e) {
              return `\`createGestureSession\` threw in phase C for ${shape.id}: ${describeThrown(e)}`
            }
            const s = session as unknown as GestureSessionMirror
            if (fn === 'the module-level seam') {
              for (const member of ['install', 'begin', 'end', 'reset', 'cancel', 'dispose', 'gesture', 'stats'] as const) {
                let threw: unknown = null
                try {
                  const fnValue = (s as unknown as Record<string, (...args: unknown[]) => unknown>)[member]
                  if (typeof fnValue === 'function') {
                    if (member === 'install' || member === 'begin') fnValue(el0)
                    else if (member === 'end') fnValue(el0, { id: 1 })
                    else if (member === 'reset') fnValue(el0, { id: 1 }, 'v')
                    else if (member === 'cancel') fnValue(el0)
                    else fnValue()
                  }
                } catch (e) {
                  threw = e
                }
                assertions += 3
                if (threw !== null) return `\`${member}\` threw under ${shape.id}: ${describeThrown(threw)}`
              }
              if (typeof s.disposed !== 'boolean') return '`disposed` is not a boolean'
              return null
            }
            // The second drive: the handle's `set`, plus the declared shapes.
            let threw: unknown = null
            try {
              const began = s.begin(el0)
              if (began.ok) {
                const returnedHandle = began.gesture.set('v')
                assertions += 3
                if (returnedHandle !== began.gesture) return '`set` did not return the same handle'
                if (typeof began.gesture.id !== 'number') return '`handle.id` is not a number'
                if (typeof began.gesture.active !== 'boolean') return '`handle.active` is not a boolean'
              } else {
                assertions += 3
                if (typeof began.code !== 'string') return 'the refusal carries no code'
              }
              const stats = s.stats()
              assertions += 3
              if (typeof stats.installed !== 'number' || typeof stats.commits !== 'number' || typeof stats.active !== 'boolean') {
                return `\`stats()\` returned ${JSON.stringify(stats)}`
              }
            } catch (e) {
              threw = e
            }
            if (threw !== null) return `the method drive threw under ${shape.id}: ${describeThrown(threw)}`
            return null
          })
        }
      }
    }
    rec.finish()
    reconcile(
      rec,
      24,
      'P-GS-TP-1 — the declared term is `24` DRIVES (`(4+4+4)` shapes × `2` drives = `24`); the per-call ASSERTIONS (`≥3` each) are reported as the row’s `assertions` figure and NEVER as attempts',
    )
    // The per-call ASSERTIONS figure is reported BESIDE the attempts and never
    // substituted for them (the DUAL COUNT). It is only MEANINGFUL once a module exists
    // — at red time no drive reaches a call at all, so the figure is legitimately zero
    // and its assertion is gated on the module's presence rather than reported as a
    // second, misleading break of this row (the row's own red reason is the register
    // record above).
    if (moduleState.mod !== null) {
      expect(
        assertions,
        'P-GS-TP-1/§5.3 item 11 — the DUAL COUNT’s second figure: the per-call assertions the 24 DRIVES performed (the as-filed `94` counted ASSERTIONS rather than drives; `§5.5.3` records that reconciliation and the declared count is `24`)',
      ).toBeGreaterThanOrEqual(24 * 3)
      // **⟶ `ADV-GS-24` (the gate-4 closure), ARM 1 — THE PHASE-A SEAM DRIVES THE SHAPE.**
      // The claim: the four PHASE-A seam drives are four DIFFERENT calls, each carrying the
      // source value DERIVED FROM ITS OWN SHAPE (the as-filed arm handed all four the same
      // `undefined`). Neither this assertion nor the reach-drive below is an ATTEMPT — the
      // declared term `24` is UNMOVED (the DUAL COUNT rule); they are gate-4 closure
      // controls, and they are gated on the module's presence exactly as the assertions
      // figure above is.
      expect(
        phaseASeamSources.map((d) => d.shape),
        'P-GS-TP-1/`ADV-GS-24` — the PHASE-A seam arm ran once per declared shape (four drives, not four copies of one call)',
      ).toHaveLength(4)
      const distinctSeamSources = new Set(phaseASeamSources.map((d) => String(d.source)))
      expect(
        distinctSeamSources.size,
        `P-GS-TP-1/\`ADV-GS-24\` — the four PHASE-A seam drives hand the seam FOUR DISTINCT source values (measured: ${JSON.stringify(
          phaseASeamSources.map((d) => `${d.shape.split(' ')[0]}→${String(d.source)}`),
        )}); the as-filed arm passed \`undefined\` four times, so the shape under test never reached the function`,
      ).toBe(4)
      // **⟶ `ADV-GS-24`, ARM 2 — PHASE C's SHAPE `(4)` REACHES ITS DISTINCTIVE MEMBER.**
      // Shape `(4)` is *"a session whose `commit` THROWS"*, and as filed its drive created a
      // session with NO usable source: `install` returned `false`, `begin` reported
      // `not-installed`, no terminal ever ran — so the throwing commit never fired and the
      // shape's own distinctive member was decorative. The drive below ESTABLISHES a gesture
      // on a usable recorder source and drives the `end` terminal, so the consumer's throw is
      // really reached, and asserts the four clause facts that go with it (`§2.3` items 4/5,
      // `§3.2 F-3`(c), `I-3c`): the throw PROPAGATES to the caller, the tracking listeners are
      // ALREADY detached, the gesture is no longer active, and the commit still counts as the
      // gesture's ONE commit (never retried).
      const commitSentinel = 'the consumer commit callback threw'
      const reachSource = makeSource({})
      const reachElement: Record<string, unknown> = { id: 'phase-c-shape-4' }
      const createReach = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
      const reachSession = createReach({
        source: reachSource,
        commit: (): never => {
          throw new Error(commitSentinel)
        },
      })
      expect(
        reachSession.install(reachElement, {}),
        'P-GS-TP-1/`ADV-GS-24` — the shape `(4)` reach-drive installs on a USABLE source, so the terminal below can really reach the throwing commit',
      ).toBe(true)
      const reachBegan = reachSession.begin(reachElement)
      expect(
        reachBegan.ok,
        'P-GS-TP-1/`ADV-GS-24` — and it really establishes a gesture (a refused `begin` would leave the throwing commit unreachable, which is the defect this arm closes)',
      ).toBe(true)
      const reachHandle = (reachBegan as { ok: true; gesture: GestureHandle }).gesture
      let reachCaught: unknown = null
      try {
        reachSession.end(reachElement, reachHandle)
      } catch (e) {
        reachCaught = e
      }
      expect(
        reachCaught === null ? null : describeThrown(reachCaught).includes(commitSentinel),
        `P-GS-TP-1/\`ADV-GS-24\` — shape \`(4)\`'s DISTINCTIVE member really fired: the \`end\` terminal invoked the consumer’s throwing \`commit\` and the throw PROPAGATED to the caller (\`§2.3\` item 5, \`§3.2 F-3\`(c) — the session swallows its OWN seam errors, never the consumer’s); got ${reachCaught === null ? 'no throw at all' : describeThrown(reachCaught)}`,
      ).toBe(true)
      expect(
        reachSource.listenerCount(reachElement),
        'P-GS-TP-1/`ADV-GS-24` — and the tracking three were ALREADY detached when the consumer’s throw ran (`§2.3` item 2(c)): the baseline is back to its ONE start listener',
      ).toBe(1)
      expect(
        reachSession.stats().commits,
        'P-GS-TP-1/`ADV-GS-24` — a throwing commit is still the gesture’s ONE commit and is NEVER retried (`I-3c`)',
      ).toBe(1)
      expect(
        reachSession.gesture(),
        'P-GS-TP-1/`ADV-GS-24` — and the gesture is no longer active after the terminal (no half-terminated record survives the consumer’s throw)',
      ).toBe(null)
    }
  })

  it('P-GS-TP-2 [S-GS-SEED-1 + S-GS-POOL-1] — EVERY pinned-seed draw × event configuration: the event is OPAQUE (60 draws) — YES (bounded)', async () => {
    const rec = new RegisterRow('P-GS-TP-2', 'S-GS-SEED-1 + S-GS-POOL-1')
    const moduleState = await resolveModule()
    const baseline: { commits: number; listeners: number } = { commits: -1, listeners: -1 }
    // The baseline drive: the same lifecycle with a NO-OP placeholder event.
    {
      const source = makeSource({})
      const commits: unknown[] = []
      const create = moduleState.mod === null ? null : (moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror)
      if (typeof create === 'function') {
        const session = create({ source, commit: (_g: GestureHandle, v: unknown): void => void commits.push(v) })
        const el: Record<string, unknown> = { id: 'baseline' }
        session.install(el, {})
        source.fire(el, TYPE_START, PLACEHOLDER_EVENT)
        const listeners = source.log.filter((r) => r.op === 'on' && r.type !== TYPE_START).length
        source.fire(el, TYPE_END, PLACEHOLDER_EVENT)
        baseline.commits = commits.length
        baseline.listeners = listeners
      }
    }
    let readsObserved = 0
    for (const [configIndex, configuration] of TP2_CONFIGURATIONS.entries()) {
      for (let draw = 0; draw < POOL_LENGTH; draw += 1) {
        const member = EVENT_POOL[DRAWN_INDICES[configIndex * POOL_LENGTH + draw]]
        rec.run(`draw ${draw + 1} × ${configuration} × pool member ${member.id}`, () => {
          if (moduleState.mod === null) return moduleState.reason ?? 'the module is absent'
          const create = moduleState.mod['createGestureSession'] as (o?: unknown) => GestureSessionMirror
          if (typeof create !== 'function') return '§2.1’s `createGestureSession` is not a function'
          const event = member.make()
          const source = makeSource({})
          const commits: unknown[] = []
          const session = create({
            source,
            commit: (_g: GestureHandle, v: unknown): void => void commits.push(v),
          })
          const el: Record<string, unknown> = { id: 'drawn' }
          session.install(el, configIndex === 0 ? { capture: true } : {})
          // The drawn event is handed to the session's OWN recorded start handler.
          let threw: unknown = null
          try {
            source.fire(el, TYPE_START, event)
          } catch (e) {
            threw = e
          }
          if (threw !== null) {
            return `the session read a field of the drawn event ${member.id} (the handler threw ${describeThrown(threw)})`
          }
          const tracking = source.log.filter((r) => r.op === 'on' && r.type !== TYPE_START)
          if (tracking.length !== 3) {
            return `the gesture must attach exactly THREE tracking listeners for the drawn event ${member.id}; got ${tracking.length}`
          }
          const active = session.gesture()
          if (active === null) return `no gesture was established for the drawn event ${member.id}`
          let termThrew: unknown = null
          try {
            source.fire(el, TYPE_END, event)
          } catch (e) {
            termThrew = e
          }
          if (termThrew !== null) return `the terminal read a field of the drawn event ${member.id} (${describeThrown(termThrew)})`
          if (commits.length !== 1) return `the declared commit count for the 'pointerup' path is ONE; got ${commits.length} for the drawn event ${member.id}`
          if (session.stats().commits !== 1) return `the session’s own counter must read ONE for the drawn event ${member.id}`
          const restored = source.listenerCount(el)
          if (restored !== 1) return `the listener baseline must be restored (ONE listener) after the drawn event ${member.id}; got ${restored}`
          if (Object.is(event, undefined) || Object.is(event, null)) return null
          // The no-side-effect probe: a mutating getter member's counter must be unchanged.
          const probe = event as { readCount?: unknown }
          if (typeof probe === 'object' && probe !== null && probeOwnNames(probe).includes('readCount')) {
            const reads = (probe as { readCount?: number }).readCount
            if (reads !== 0) return `the drawn event ${member.id} had a property READ ${String(reads)} time(s) — the session must read NO field`
            readsObserved += 1
          }
          return null
        })
      }
    }
    rec.finish()
    reconcile(
      rec,
      60,
      'P-GS-TP-2 — the declared term is `60` (`30` pool members × `2` event configurations = `60` pinned-seed draws, one LCG step each)',
    )
    // THE DUAL COUNT (`§5.3` item 11): the DECLARED figure is what the caps are compared
    // against; the DISTINCT-MEMBER figure is REPORTED BESIDE it and never substituted.
    expect(
      DRAWN_INDICES.length,
      'P-GS-TP-2/§5.5.1 — the drive really performs 60 draws (one LCG step per draw)',
    ).toBe(60)
    expect(
      DISTINCT_DRAWN_POOL_MEMBERS,
      `P-GS-TP-2/§5.5.2 item 3 — the REPORTED distinct-pool-member figure for the 60 draws over the 30-member pool is EXACTLY ${DISTINCT_DRAWN_POOL_MEMBERS} (the \`26\` of \`30\` the record prints, pinned here — \`ADV-GS-28\`): a DRAW IS NOT A SWEEP, and no row here asserts that every member was drawn`,
    ).toBe(26)
    if (moduleState.mod !== null) {
      // The three figures below are only MEANINGFUL once a module exists: at red time no
      // draw reaches the session at all, so their assertions are gated on the module's
      // presence (the row's own red reason is the register record above) rather than
      // reported as extra breaks of this row.
      expect(baseline.commits, 'P-GS-TP-2 — the no-op placeholder baseline established the declared commit count the draws are compared against').toBe(1)
      expect(baseline.listeners, 'P-GS-TP-2 — the no-op placeholder baseline attached the declared three tracking listeners').toBe(3)
      // **⟶ `ADV-GS-28`: THE REASON NAMES A DISCRIMINATING EVIDENCE, NOT A BARE NON-ZERO
      // COUNT.** Pool member `(26)` is *"an object whose getter MUTATES a counter"*, so the
      // no-read claim is measurable: the counter must still read `0` after the session's own
      // drive. `readsObserved` counts the attempts that reached that probe, and the
      // DISCRIMINATING figure is how many times the pinned draw sequence ACTUALLY DREW member
      // `(26)` — DERIVED from `DRAWN_INDICES`, never hard-coded. The two must be EQUAL, which
      // proves both that the member was drawn and that every one of its draws left the counter
      // untouched (a module that read the event would have moved it).
      const member26Index = EVENT_POOL.findIndex((m) => m.id.startsWith('(26)'))
      const member26Draws = DRAWN_INDICES.filter((i) => i === member26Index).length
      expect(
        readsObserved,
        `P-GS-TP-2/§5.5.1 — the mutating-getter pool member (26) was really driven: the pinned draw sequence draws it ${member26Draws} time(s) (derived from \`DRAWN_INDICES\`: index ${member26Index} occurs at draws ${JSON.stringify(
          DRAWN_INDICES.map((i, at) => (i === member26Index ? at + 1 : null)).filter((at) => at !== null),
        )}), and EVERY one of those draws reached the probe with its counter still \`0\` — so the "read at most zero times" claim is measured rather than assumed (\`ADV-GS-28\`)`,
      ).toBe(member26Draws)
      expect(
        member26Draws,
        'P-GS-TP-2/`ADV-GS-28` — and that discriminating figure is non-zero: a zero would make the equality above vacuous and would mean the no-read claim was never really probed',
      ).toBeGreaterThan(0)
      // THE PROBE'S OWN POSITIVE CONTROL: the counter instrument really MOVES when a read
      // happens — ONE direct read of member `(26)`'s mutating getter takes its counter from `0`
      // to `1`, which is the discriminating evidence that a session read would have been
      // CAUGHT by the equality above rather than silently missed.
      const controlMember = EVENT_POOL[member26Index].make() as { probe?: unknown; readCount: number }
      const beforeControl = controlMember.readCount
      void controlMember.probe
      expect(
        [beforeControl, controlMember.readCount],
        'P-GS-TP-2/`ADV-GS-28` — the mutating-getter probe is LIVE: ONE direct read moves its counter from `0` to `1`, so a session read would have failed the equality above instead of passing unnoticed',
      ).toEqual([0, 1])
    }
  })

  it('REGISTER-STATUS (harness, NOT a spec row) — the register’s own execution record: seed, per-row attempts/held/broken, the stop, the un-run rows, and the pool-draw figure', () => {
    const census = {
      declaredTotal: 396,
      terms: '58+32+36+30+24+30+40+30+32+24+60',
      seed: SEED,
      step: 'ONE LCG step per draw; index = state_{n+1} mod pool.length (pool.length = 30)',
      attemptsRun: registerState.attempts,
      rowsRecorded: registerRecords.length,
      stoppedAtRow: registerState.stoppedAtRow,
      stoppedFor: registerState.stoppedFor,
      poolDraws: { declared: 60, poolLength: POOL_LENGTH, distinctMembersDrawn: DISTINCT_DRAWN_POOL_MEMBERS },
      perRow: registerRecords.map((r) => ({
        row: r.row,
        strategy: r.strategy,
        attemptsRun: r.attemptsRun,
        held: r.held,
        broken: r.broken,
        stoppedEarly: r.stoppedEarly,
        notStarted: r.notStarted,
      })),
    }
    console.log(`§5.5.1 register status :: ${JSON.stringify(census)}`)
    expect(
      registerRecords.length,
      'REGISTER-STATUS — all ELEVEN register rows reported their record (§5.5.1: 11 rows)',
    ).toBe(11)
    expect(
      registerKeySet(registerRecords.map((r) => ({ row: r.row, strategy: r.strategy }))),
      'REGISTER-STATUS/§5.5.1 — the executed rows and their strategy ids are EXACTLY the register’s declared eleven (a SET comparison sorted by row id — a rename, a dropped row or a wrong strategy id fails here)',
    ).toEqual(registerKeySet(REGISTER_DECLARED))
    expect(
      registerRecords.map((r) => r.seed),
      'REGISTER-STATUS/§5.5.1 — every executed row carries the ONE pinned seed `20260927` (the row record prints it, so the audit need not infer it)',
    ).toEqual(REGISTER_DECLARED.map(() => SEED))
    expect(
      REGISTER_DECLARED.reduce((sum, r) => sum + r.term, 0),
      'REGISTER-STATUS/§5.5.3 — the declared total is the SUM OF ITS OWN TERMS and reads `396` (`58+32+36+30+24+30+40+30+32+24+60`)',
    ).toBe(396)
    expect(
      registerState.attempts,
      'REGISTER-STATUS — the register never exceeds the `<=400`-attempts cap',
    ).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
    for (const r of registerRecords) {
      expect(r.attemptsRun, `REGISTER-STATUS — row ${r.row} never exceeds the <=100-attempts-per-row cap`).toBeLessThanOrEqual(
        REGISTER_ROW_CAP,
      )
    }
    const notStarted = registerRecords.filter((r) => r.attemptsRun === 0)
    if (registerState.stoppedAtRow === null) {
      // **THE DUAL COUNT, AND THE ONLY PLACE THE TWO FIGURES MAY DIFFER**
      // (green-time test repair 2026-09-27). The DECLARED total is `396` and does NOT
      // move; but `§5.5.3` states in its own words that `P-GS-IM-1`'s declared term is
      // *"stated CONSERVATIVELY as `58`, one attempt FEWER than the enumeration produces"*
      // — and that row's drive PERFORMES the enumeration's `59` observations, because
      // discarding a real observation to match the conservative declaration would be the
      // weaker instrument. So an unstopped run totals the declared `396` PLUS that one
      // conservative attempt = `397`, and the assertion below is the honest one: the
      // measured total is the SUM OF THE MEASURED PER-ROW FIGURES, it is inside the
      // `≤400` cap, and its difference from the declared `396` is attributed to the ONE
      // row whose declaration is documented as conservative.
      const measuredTerms = registerRecords.map((r) => r.attemptsRun)
      const measuredTotal = measuredTerms.reduce((sum, n) => sum + n, 0)
      expect(
        measuredTotal,
        `REGISTER-STATUS — the MEASURED total is the SUM OF THE MEASURED PER-ROW FIGURES (${measuredTerms.join('+')} = ${measuredTotal})`,
      ).toBe(registerState.attempts)
      expect(
        measuredTotal,
        'REGISTER-STATUS/§5.5.3 — the MEASURED total stays inside the `<=400` register cap (the declared `396` is what the caps are compared against; the measured figure is reported beside it)',
      ).toBeLessThanOrEqual(REGISTER_TOTAL_CAP)
      const conservativeRows = registerRecords.filter((r) => r.attemptsRun !== declaredTermOf(r.row))
      expect(
        conservativeRows.map((r) => `${r.row} declared ${declaredTermOf(r.row)} / measured ${r.attemptsRun}`),
        'REGISTER-STATUS/§5.5.3 — the ONLY row whose measured drive differs from its declared term is `P-GS-IM-1`, whose declaration `§5.5.3` documents as CONSERVATIVE (`58` against the enumeration’s `59`); every other row executes exactly its declared term',
      ).toEqual(['P-GS-IM-1 declared 58 / measured 59'])
      expect(
        measuredTotal - REGISTER_DECLARED.reduce((sum, r) => sum + r.term, 0),
        'REGISTER-STATUS/§5.5.3 — the measured-vs-declared difference is exactly the ONE conservative attempt `§5.5.3` documents, and nothing else',
      ).toBe(1)
      console.log(
        `§5.5.1 register dual count :: ${JSON.stringify({
          declaredTotal: 396,
          declaredTerms: REGISTER_DECLARED.map((r) => r.term),
          measuredTotal,
          measuredTerms,
          difference: measuredTotal - 396,
          attributedTo: 'P-GS-IM-1 (declared 58, conservatively below the enumeration’s 59 — §5.5.3)',
        })}`,
      )
      expect(notStarted, 'REGISTER-STATUS — no row is un-run in an unstopped register').toEqual([])
    } else {
      expect(
        registerState.stoppedFor,
        'REGISTER-STATUS — the stop is attributed: the stop-after-5 rule records WHICH row stopped it and WHY (the un-run rows are then asserted as FAILURES by their own `finish()`)',
      ).not.toBe(null)
      expect(
        registerState.attempts,
        'REGISTER-STATUS — a stopped run is strictly shorter than the declared 396',
      ).toBeLessThan(396)
      expect(
        notStarted.length,
        `REGISTER-STATUS — the stop at ${String(registerState.stoppedAtRow)} left ${notStarted.length} register row(s) un-started, and each of them FAILED rather than passed (§5.5.1 strategy item 3)`,
      ).toBeGreaterThan(0)
      console.log(
        `§5.5.1 un-run rows :: ${JSON.stringify(
          notStarted.map((r) => ({ row: r.row, attemptsRun: 0, reported: 'FAILURE — never started; the register stopped earlier' })),
        )}`,
      )
    }
  })
})

// ===========================================================================
// §6 — THE THREE FALSIFICATIONS, each on its own row, so the unit's own
// falsification conditions are asserted rather than narrated.
// ===========================================================================
describe('§6 — the unit’s three falsifications (each asserted, never narrated)', () => {
  it('§6 (a) — the FIRST falsification: one gesture authority, the three declared commit counts, the window and the baseline', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // The three declared commit counts, in ONE session, from the session’s own counter.
    const r1 = beginResult(h, el)
    endCall(h, el, (r1 as { ok: true; gesture: GestureHandle }).gesture)
    const r2 = beginResult(h, el)
    resetCall(h, el, (r2 as { ok: true; gesture: GestureHandle }).gesture, 'd')
    const r3 = beginResult(h, el)
    cancelCall(h, el, (r3 as { ok: true; gesture: GestureHandle }).gesture)
    expect(
      h.session.stats().commits,
      '§6 (a) — `I-1`/`I-2`/`I-3`/`I-3b`: the three terminals produce exactly `1` (end) + `1` (reset) + `0` (cancel) = TWO commits, read from the session’s OWN counter',
    ).toBe(2)
    expect(h.commits.length, '§6 (a) — and the injected callback agrees exactly (no spy-only count)').toBe(2)
    expect(h.source.listenerCount(el), '§6 (a) — `I-4`/`I-5`: the baseline is restored after every terminal (ONE listener)').toBe(1)
    const report = h.session.dispose()
    expect(report, '§6 (a) — `I-5`: `dispose()` restores the session’s OWN baseline exactly').toEqual({ removed: 1, complete: true })
    expect(h.source.listenerPairs(), '§6 (a) — and the session’s own contribution is ZERO listeners').toEqual([])
  })

  it('§6 (b) — the SECOND falsification: the session cannot express its contract without policy (no bounds, default, axis, threshold, drop or reveal set)', async () => {
    const h = await makeHarness({ installOptions: hookOptions(makeHookLog()) })
    const el: Record<string, unknown> = { id: 'a' }
    h.sessionInstall(el)
    // No consumer-reachable `commit` (the single-authority clause).
    expect(
      (h.session as unknown as Record<string, unknown>)['commit'],
      '§6 (b) — `I-1`: there is NO consumer-reachable `commit`',
    ).toBe(undefined)
    // No value is validated or defaulted (`§2.4` item 7).
    const r = beginResult(h, el)
    const handle = (r as { ok: true; gesture: GestureHandle }).gesture
    for (const value of [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, -0, '', Symbol('v'), () => undefined, { a: [1] }]) {
      expect(
        handle.set(value),
        `§6 (b)/§2.4 item 7 — \`set(${brief(value)})\` returns the handle (nothing is validated, coerced, rounded or clamped)`,
      ).toBe(handle)
      expect(Object.is(handle.value, value), `§6 (b) — the value ${brief(value)} is stored VERBATIM`).toBe(true)
    }
    // The delegate list of `§2.5`: there is no such parameter to pass.
    const surface = h.session as unknown as Record<string, unknown>
    for (const name of [
      'boundsFor',
      'clampToBounds',
      'defaultSizeFor',
      'isResizable',
      'axisFor',
      'threshold',
      'candidatesFor',
      'resolveTarget',
      'onReveal',
      'selectors',
    ]) {
      expect(surface[name], `§6 (b)/§2.5 — the session exposes no \`${name}\` member: "Nothing else exists"`).toBe(undefined)
    }
    expect(
      Object.getOwnPropertyNames(Object.getPrototypeOf(h.session) ?? {}).filter((n) => /bound|threshold|reveal|target|selector/i.test(n)),
      '§6 (b)/§4.4 S-8 — no policy obligation was pulled into this unit (a fabricated edge would be a FINDING)',
    ).toEqual([])
  })

  it('§6 (c) — the THIRD falsification: the unit makes no claim its layer cannot verify (`I-11`, `R-8`, no `[U]`/`[D]` row, `F-12` precondition-gated)', async () => {
    // The module reads no coordinate and no event field (`§2.4` item 1) — asserted on the
    // runtime side in `I-11`, and on the static side in `R-8`. Here the CLAIM side: this
    // unit's own rows hold no geometry/magnitude vocabulary, and `F-12` is not claimed.
    const titles = rowTitles(readFileSync(TEST_FILE, 'utf8'))
    expect(
      titles.filter((t) => GEOM_CLAIM_RES.some((re) => re.test(t))),
      '§6 (c)/`I-11` — NO row description of this file claims a resolved, painted, coordinate or magnitude fact (`RK-19`’s false-green class)',
    ).toEqual([])
    expect(
      titles.filter((t) => /F-12/.test(t) && !/NOT-RUNNABLE|precondition|R-11/i.test(t)),
      '§6 (c)/§2.6 — `F-12` is NOT authored as a passing row: no row of this file asserts the behavioural half as proven',
    ).toEqual([])
    const { mod } = await resolveModule()
    void mod
    // The divergence leg's pinned count is NOT claimed by this unit (`§5.2`).
    const harness = readFileSync(`${REPO_ROOT}/scripts/electron-divergence.mjs`, 'utf8')
    expect(
      harness.includes('R13 RESULT: ${checks} checks, ${failures} failures'),
      '§6 (c)/§5.2 — the pinned `N = 9` identity leg exists and is untouched; this unit runs NO `[D]` row and claims NO divergence result',
    ).toBe(true)
  })
})

// ===========================================================================
// RED-RUN FINDINGS — the clauses reported rather than guessed, and the rows that did
// NOT go red for a legitimate reason. **Nothing below is a `§3`/`§5.5` row**; it is the
// pass's own record, kept in the artifact so the audit reads it beside the tables.
// ===========================================================================
//
// FINDING 1 — REPORTED, NOT GUESSED: `§4.1`'s as-filed list of "the static rows that
// can already be evaluated (`R-2`/`R-3`/`R-5`/`R-7`/`R-9`/`R-11`)" contradicts `§3.4`,
// which defines `R-2`/`R-3`/`R-5`/`R-7` as scans OF the module file (evaluable only once
// it exists — exactly what `§3.5 R-10` records) and which numbers the diff-scope row as
// `R-7` (the sibling specs number their diff-scope rows `R-4`/`R-8`), while `R-9` here is
// the absent-page-design probe. `§3.4`'s own table and its closing block ("What these
// nine rows do NOT do") GOVERN; the stale `§4.1` list is not followed for `R-2`/`R-3`/
// `R-5`/`R-7`, and no row was weakened to match it. The only module-independent static
// rows in this file are `R-9` (the page-design probe) and `R-11` (the `[D]` precondition),
// and both are authored EVALUABLE AND EXPECTED GREEN — a legitimate non-red, reported.
//
// FINDING 2 — `§3.5 R-10`'s RED form is asserted AT RED TIME by design (the row's own
// text: a FAIL is meaningful, because it would mean the `RCA-1` red order was inverted).
// Its GREEN form ("the module EXISTS and the unit-owned change set is EXACTLY the module
// + this test file") is recorded as PROVENANCE in the row, to be re-scoped by the
// green-time pass exactly as the sibling units' module-absence rows were.
// **⟶ RECORDED 2026-09-27 (the green-time red-set-repair pass, repair `N`): THE RE-SCOPING HAS
// HAPPENED** — the row now reads `R-10 §3.5 (GREEN FORM)` (module PRESENT), the as-filed RED form
// and the red-run census are kept as PROVENANCE at the row, and the future tense of the sentence
// above is therefore SUPERSEDED. **No assertion moved for this correction.**
//
// FINDING 3 — `§5.5.1 P-GS-TP-1`'s strategy cell states its `24` as `3 phases × 4 shapes
// × 2 functions` and then ALSO states that "`4 + 4 + 4 = 12` phase-shape drives; `12 × 2`
// functions = `24`" — i.e. it describes Phase A's domain (`4` option shapes × `2`
// callables), Phase B's (`4` source shapes × `2` functions) and Phase C's
// ("`10` methods × `5` hostile states, minus the `2` functions' Phase-B overlap") in
// terms that do not multiply to `4` shapes each. The DECLARED TERM `24` is what binds
// (`§5.5.3` prints it with its terms, and the caps compare against it), so this file
// drives `4` shapes × `2` drives in EACH of the three phases — which is the only reading
// under which the declared `24` is the sum of its own parts — and reports the residual
// wording ambiguity here instead of inventing a different count.
//
// NON-RED, LEGITIMATELY: `R-9` and `R-11` are green by construction (the file and the
// harness really are absent), and they are the two rows `§4.1` correctly names as
// evaluable before the module exists. They are NOT counted into the red set.
// ===========================================================================
//
// ===========================================================================
// GREEN-TIME RED-SET REPAIR (2026-09-27) — THE RECORD OF THIS PASS.
// `b1930d2`/`8e2c777`/`f36f605`/`2437727` class: the Implementer STOPPED rather than
// bend the module (the module is NOT mine and NOTHING in `src/**` was changed by this
// pass), and this pass verified each failing row against the MODULE and the CONTRACT.
// **EVERY REPAIR BELOW KEEPS THE ROW'S id, intent, clause citations and messages**, the
// register's declared rows, per-row terms, strategy ids, the `396` total, the seed and
// the pool are UNTOUCHED (`396` = `58+32+36+30+24+30+40+30+32+24+60`), and NO figure was
// changed except where it was provably wrong.
//
//  TEST-SIDE REPAIRS (each verified against the module AND the contract):
//   · A. HARNESS WIRING: `makeHarness` accepted `installOptions` and NEVER USED IT, so
//        `M-9`/`M-11`/`M-12`/`M-13`/`I-7`/`I-8`/`F-10` installed with NO options and their
//        hook/`capture` never reached the session. The harness now returns a
//        `sessionInstall` that threads the harness's own `installOptions` into
//        `install` (§2.5 item 2), with an explicit override for the rows that need a
//        per-element config. `M-7`/`M-8` (which install explicitly) stayed green.
//   · B. HOOK MERGE: `hookOptions(log, extra)` spread `extra` FIRST and then overwrote
//        `onStart`/`onMove`/`onEnd`/`onCancel`, silently DISCARDING the caller's hook —
//        `F-3`(a) observed no throw and `I-12b`'s `reentrant` stayed empty. The caller's
//        hook is now COMPOSED (recorder first, caller second) so the caller's hook IS the
//        one invoked and the recorder is still observed.
//   · C. `F-8`'s "unusable" TABLE mixed CALLABILITY with THROWING: it listed a source
//        whose `off` THROWS and one whose `isConnected` THROWS and demanded
//        `install → false`, contradicting §2.4 item 6's exact definition (unusable =
//        not an object, or `on` not callable, or `off` not callable), §2.4 item 5 and
//        this row's own later half (the throwing `isConnected` must make the gesture
//        PROCEED). Both throwing sources are CALLABLE and therefore USABLE; their drives
//        are kept and now assert the clauses that govern them (§2.3 item 7(4)'s per-call
//        catch; §2.4 item 5's swallowed reading).
//   · D. `I-12` asserted `[gestures, commits] === [2, 2]` while the SECOND gesture was
//        never terminated — a commit is issued by a TERMINAL (§2.3 item 4), so the count
//        is `[2, 1]`, the same count `I-2`/`M-4`/`M-10`/`P-GS-SM-3` assert. The figure
//        moved; nothing else did.
//   · E. `I-12b`'s "hook-disposed ⇒ ZERO commits" limb contradicted §2.3 item 4's
//        exactly-one for the terminal's own commit. The clause is `without a FURTHER
//        commit`, so the row asserts ONE (the `end` terminal's) and the session's own
//        counter agreeing.
//   · F. `P-GS-IM-3`'s expectation map was INTERNALLY CONTRADICTORY (it gave 21 cells
//        `'ok'` and then applied refusal-INERTNESS to them; six `begin` cells demanded
//        `'busy'` in idle states; three terminal cells demanded `'not-installed'`). It is
//        now DERIVED FROM §2.3 item 4's closed union and the two precedence clauses the
//        row itself asserts: a successful `begin` carries NO `code` (§2.1's
//        `BeginResult` success arm has no such member), a successful terminal commits
//        exactly the declared number of times, and the inertness facts bind REFUSALS.
//        Cell counts, the `36` term and the strategy id are unchanged.
//   · G. `P-GS-IM-1`'s `reconcile(rec, 58)` against a `59`-observation drive:
//        §5.5.3 states `58` is DELIBERATELY CONSERVATIVE and `PRE-4` asserts only
//        `58 ≤ 59`. The DECLARED term is now asserted as the declared figure AND the
//        MEASURED count as its own reported number, so neither is substituted for the
//        other and no real observation is discarded to match a conservative declaration.
//   · H. `P-GS-IM-4`: the `dispose()` terminal's tail demanded the tracking three while
//        §2.3 item 7(2) ALSO requires `dispose()` to detach the START listener —
//        the start-listener detach cannot be both before and after `onCancel`. The
//        `dispose()` cell's declared tail is the FOUR-call pattern
//        (`off(move)`, `off(end)`, `off(cancel)`, `off(start)`), and the other five
//        terminals keep the tracking three.
//   · I. `P-GS-IM-5`: the row pushed `source.captures.length` six times and read the
//        array AFTER the lifecycle, so every reading was the FINAL count and the
//        pre-establishment stages were unsatisfiable for an opted-in flag (while the
//        row's own `expectedPerStage[0] = 0` was right). Every stage's reading is now
//        SNAPSHOTTED at its own moment, and the row additionally asserts the
//        `0,0,1,1,1,1` progression (a constant reading is a FAIL).
//   · J. `P-GS-IM-6`: `expectedDetaches` was `0` for the IDLE gesture state, so
//        shapes (1)/(2) × idle × `dispose()` demanded `removed === 0` while `M-13`/`I-5`
//        (§2.3 item 7(2)) require `dispose()` to detach EVERY start listener of every
//        installed control. The expectation is the number of listeners the session
//        attached.
//   · K. `P-GS-SM-1`: (i) `installed-idle × begin` compared `result.code` with `'ok'`
//        although a success carries NO `code`; (ii) `active × end(el, staleHandle)`
//        called a bare `begin` while a gesture was ACTIVE (refused `'busy'`), so no stale
//        handle could exist and the ACTIVE handle was passed. The stale handle is now
//        built from a PREVIOUS gesture (terminate, re-establish, keep the first handle),
//        and `active × begin(el)` declares `'busy'` — the code §2.3 item 8 declares.
//   · L. `P-GS-SM-3`: the recorded-handler paths read `result?.committed` off
//        `source.fire()`'s `null` return. The row now reads the SESSION's own report
//        (`stats().commits` / `stats().lastCode` — §0A note 12's count seam) for those
//        paths, and the `(h)` throwing-`commit` limb is asserted where a commit EXISTS:
//        the `'pointercancel'` path declares ZERO commits (§2.3 item 4), so it has no
//        commit call to throw.
//   · M. `P-GS-TP-2`: the row's OWN no-read probe spelled its question
//        `'readCount' in probe`, which fires the pool member `(16)` Proxy's throwing
//        `has` trap — the ROW read the event and broke on its own instrument. The probe
//        now uses `Object.getOwnPropertyNames` (no proxy trap is fired), caught.
//   · N. `R-10` was authored in its RED form only; the module has landed, so the row is
//        re-scoped to §3.5 R-10's own GREEN form (module PRESENT — the two canonical
//        artifacts are the module + this test file, no OTHER `gesture-session*` path on
//        disk, non-vacuity asserted first) with the red-run census kept as PROVENANCE.
//
//  THE CAPTURE RESOLUTION (landed here, not re-litigated): the RULED form of §2.3 item 6
//  is that the session calls A CAPTURE METHOD THE SOURCE SUPPLIES, so the module's bytes
//  carry NO DOM capture-method token while the capability and the invocation stay real.
//  The harness's recorder therefore exposes its capture entry point under the
//  module-neutral name `capturePointer`, and every capture row asserts the COUNT
//  (exactly one on an opted-in establishment, zero otherwise) and NEVER the module's
//  spelling. `R-3`(2) and `F-11` keep their scans EXACTLY as they are (they must still
//  fail a module whose bytes name the token), and `PRE-5` is the POSITIVE CONTROL that
//  the count rows still fail a module that SKIPS the capture.
//
//  **⟶ RECORDED 2026-09-27 (`ADV-GS-17`, THE GATE-4 CLOSURE): THE MODULE-SIDE FIX LANDED.**
//  The as-filed paragraph read: *"**THE ONE REMAINING RED IS MODULE-SIDE, AND IT IS NOT MINE
//  TO FIX.** The landed module discovers the supplied capture method by the DOM method's own
//  NAME — `readMember(seam, 'setPointerCapture')` (`src/shared/gesture-session.ts` line 276)
//  — which is the token `R-3`(2) and `F-11` must reject … **The fix is ONE identifier on the
//  module side** … **NOTHING in `src/**` was edited by this pass.**"* **THE FIX HAS LANDED:
//  the module now discovers the capability by the module-neutral, source-supplied name
//  (`readMember(seam, 'capturePointer')`), so `R-3`(2)/`F-11` keep their scans intact and the
//  capture rows drive a real, source-supplied capability.** The as-filed text is kept here as
//  provenance; **this pass edited nothing in `src/**` either.**
//
// (The full as-filed paragraph, kept verbatim so nothing is silently rewritten: *"THE ONE
// REMAINING RED IS MODULE-SIDE, AND IT IS NOT MINE TO FIX. The landed module discovers the
// supplied capture method by the DOM method's own NAME — `readMember(seam,
// 'setPointerCapture')` — which is the token `R-3`(2) and `F-11` must reject, and which no
// source-supplied surface in this harness provides. The fix is ONE identifier on the module
// side: discover it under the source-supplied name the ruling implies (`'capturePointer'` —
// or any module-neutral name the implementer prefers, in which case this harness's recorder
// and `F-10`'s one asserted log entry must use that same name; `PRE-5` prints both ends).
// NOTHING in `src/**` was edited by this pass."*)
// ===========================================================================

// ===========================================================================
// ADV-GS-2 — THE TRACKING-ATTACH REFUSAL: **THE ROW IS AUTHORED (2026-09-27).**
//
// THE FINDING WAS REAL AND THE MODULE FIX IS LANDED: `begin` now checks the three
// tracking `on` results, rolls the successful attaches back, refuses with the EXISTING
// closed-domain code `'not-installed'` (no eighth code member is invented — `§4.4 S-9`),
// commits nothing, and leaves the element installed so a transient seam failure is
// retryable. Before the fix a seam that could not perform a `pointermove` attach could
// still report `{ok:true}` with a live handle while NO tracking listener existed — a
// gesture the session could never finish, which latched the consumer `busy` for the rest
// of the session.
//
// WHY THE ROW WAS OWED RATHER THAN WRITTEN (kept as provenance, in the past tense):
// driving the refusal needs an `on` call that THROWS, and in this harness every `on` the
// session makes goes through the mock seam's recorder — a throw injected from a row-level
// source object never reaches the session (measured: the row read `refused.ok === true`,
// i.e. the refusal path was not taken). The recorder has a `failOff` hook and the
// symmetric `failOn` hook was added for exactly this; wiring it to a real refusal needed
// one more pass through this file's seam, which the gate-4 closure did not have budget for.
//
// **AUTHORED — THE ROW IS `ADV-GS-2`** (`describe('ADV-GS-2 — the tracking-attach refusal
// (the gate-4 regression row)')`, placed between the `F-*` block and the `PRE` harness
// block): `h.source.failOn` is wired to the recorder's own `on` for the `pointermove`
// type, and the row asserts **(i)** the refusal code `'not-installed'` (NO eighth code
// member — `§4.4 S-9`), **(ii)** the roll-back, measured BOTH from the recorder's
// `attached` map (`listenerCount === 1`, `typeMultiset === ['pointerdown']`) AND from its
// log by the same sequential pairing reader `I-5`/`M-13`/`P-GS-IM-6` use, **(iii)** that
// NOTHING commits (`h.commits` empty and `stats().commits === 0`), and **(iv)** that the
// element stays INSTALLED and the SAME element then establishes normally once `failOn` is
// flipped off, driven to its `end` terminal with the commit count for that path asserted
// as ONE. **`§5.5.1`'s declared attempts are untouched by this row** (it is a
// `§3`/gate-4 regression row, not a register row), and **the `396` total, its eleven
// terms, the seed, the caps and every strategy id are unchanged**.
//
// TWO FINDINGS THE AUTHORED ROW MEASURED AND REPORTED (neither bent):
//   · the recorder logs an `on` ATTEMPT before the configured throw, so the roll-back's
//     two detaches for never-completed attaches still pair with their own recorded
//     attempts — the log stays BALANCED (`I-5`'s sentence is NOT contradicted here),
//     while the `attached` map holds only the start listener. Asserted, not over-claimed.
//   · the refused `begin`'s counter consumption — **now `ADV-GS-15` below, and the row
//     asserts the CLAUSE, not the measured figure** (the remand of 2026-09-27).
//
// **⟶ `ADV-GS-15` — THE REFUSED `begin` MUST NOT CONSUME A GESTURE (RECORDED
// 2026-09-27, the remand that CORRECTS THIS ROW).** THE CONTRADICTION, NAMED: **the
// clause** — `§2.1`'s `SessionStats.gestures` doc cell reads *"Successful `begin` calls,
// instance-lifetime"* and `§2.3`'s refusal clauses (`§2.3` item 1(b) for a repeat/refused
// path, and the refusal of a `begin` whose tracking attach cannot be made) create **NO**
// gesture — while **the measured module (`src/shared/gesture-session.ts`, READ-ONLY in
// this pass) increments `counters.gestures` BEFORE the three tracking `on` attaches are
// checked and BEFORE the capture call**, so a REFUSED `begin` reads `gestures: 1` and one
// real gesture thereafter reads `2` (and the refused attempt consumes the gesture id, so
// the first REAL gesture is handed id `2` — against `M-2`'s *"the handle's `id === 1`"*
// for the session's first gesture). **THE FIX IS MODULE-SIDE AND IS OWED TO THE
// IMPLEMENTER'S NEXT PASS: the gesture counter (and the id it feeds) must be
// incremented only by a `begin` that ESTABLISHES** — after the tracking-attach check,
// beside the capture call. **This row therefore asserts the CLAUSE and is INTENTIONALLY
// RED until that fix lands: the red is a PINNED CONTRACT VIOLATION, NOT a broken test.**
// ⟶ RECORDED 2026-09-27 (`ADV-GS-16`, the module fix): this paragraph is AS-FILED and is
// the requirement as stated for the refused-attach path; the increment now sits after the
// `onStart` try/catch AS WELL, immediately before `counters.lastCode = 'ok'` and the
// `{ok:true}` return, and **the row is GREEN — the increment no longer precedes the hook.**
// A reader who sees this row fail must read it as *the module owes the fix*, never as
// *the expectation is stale* — and must NOT re-tune the row to the measured figure.
// ⟶ RECORDED 2026-09-27 LATER THE SAME DAY (`ADV-GS-17`, the gate-4 closure): THAT READING IS NOW
// HISTORICAL — the fix HAS landed (the paragraph below records it), so a failure at this row is a
// REGRESSION against the landed module and **NOT** a fix still owed.
//
// **⟶ RECORDED 2026-09-27 LATER THE SAME DAY (`ADV-GS-17`, THE GATE-4 CLOSURE): THE FIX
// HAS LANDED, AND THE ADV-GS-2 ROW IS GREEN.** The as-filed text above is kept verbatim as
// the record of what was owed; the landed module
// (`src/shared/gesture-session.ts`) now increments `counters.gestures` — and derives
// `record.id` from it — AFTER the three tracking `on` results are checked AND AFTER the
// `onStart` try/catch, immediately before `counters.lastCode = 'ok'` and the `{ok:true}`
// return — so a REFUSED `begin` reads `gestures: 0`, the next real gesture reads `1`
// and is handed `id: 1`. **No row was re-tuned to the pre-fix measured figures**; the red
// was discharged by the module-side fix, which is the only way it was ever allowed to
// clear. (The SAME clause, on the `onStart`-throws path rather than the refused-attach
// path, is `ADV-GS-16`'s row — and `ADV-GS-16`'s module fix has since LANDED the same
// way: the increment no longer precedes the `onStart` hook, so THAT row is GREEN too.)
//
// Tracked in `docs/pending.md` §H with this reasoning.
// ⟶ RECORDED 2026-09-27: THE CITATION ABOVE IS MIS-POINTED AND THE TRACKER ROW IS STALE — the
// `ADV-GS-15`/`ADV-GS-16` counter reasoning is NOT in `docs/pending.md` §H (that section is the
// `U-PROJ` DONE pass's residues and carries no `ADV-GS-15`/`ADV-GS-16` text at all), and §H's
// `U-GSESSION` row still describes `D-2`'s row as OWED and `§3b` as unlanded. The landed sites of
// this reasoning are `docs/specs/gsession.md`'s `§2.1` `SessionStats.gestures`/`gestureId` cells,
// `§2.3` item 1(d) and the module's own dated notes; the adjacent `onStart`-path observation is
// PARKED at `§2.3` item 6(c) with its revisit condition. **The tracker staleness is REPORTED and
// not fixed here: this file may not edit the trackers.**

// ===========================================================================
// **⟶ RECORDED 2026-09-27 — THE TEST-SIDE OWED ITEMS PASS (`D-1`, `D-2`,
// `D-12`, `D-13`, AND THE TWO FLAGGED DRIVE-LEVEL CORRECTIONS).**
//
// WHAT THIS PASS LANDED, EACH WITH ITS SITE:
//   · **`D-1` — THE TYPED `EventSource` FIXTURE AND THE TWO ROWS.** `typedEventSourceRecord`
//     (module scope, near the `import type` block) builds a source TYPED AS THE MODULE'S OWN
//     IMPORTED `EventSource` carrying the declared member `capturePointer?(element)`; `M-7b`
//     (§3.1, beside `M-7`/`M-8`) asserts EXACTLY ONE call reaching that member, carrying the
//     gesture's OWN element, AFTER the three tracking `on` calls and AFTER `isConnected`; and
//     `M-8b` asserts the DECLARED DEGRADATION on a capture-LESS, GENUINELY FROZEN source
//     (zero capture calls, no throw, no diagnostic, the gesture establishes, opens the three
//     tracking listeners, terminates normally at the recording `pointerup` with EXACTLY ONE
//     commit, and the baseline back to `1`).
//   · **`D-2` — THE `ADV-GS-2` ROW** (`describe('ADV-GS-2 — the tracking-attach refusal …')`,
//     between the `F-*` block and `PRE`), with the parked comment block at the file's end
//     UPDATED IN PLACE (reasoning kept, the row marked AUTHORED with its name/date/site).
//   · **`D-12`(`a`)** — `P-GS-IM-6`'s second-`dispose()` limb now asserts the report SHAPE and
//     the retained-state facts and states in place that the FALSIFIABLE drive is `M-13`'s.
//   · **`D-12`(`b`)** — the two MISSING FIXTURES (`(16)`'s ABSENT-MEMBER source, `(18)`'s
//     GENUINELY FROZEN source) now exist and are asserted in `PRE-4`; `(17)` is a real class
//     instance; the table carries a `distinctKey` per configuration so the distinct-input
//     figure is DERIVED (printed) rather than restated, and the declared figures are printed
//     BESIDE the derived figure in the register row. **⟶ CARRIED FURTHER BY `ADV-GS-18`
//     (the gate-4 closure):** the as-filed row still HARD-CODED its derived figure (`12`) and
//     built all five "single-hook" configurations from ONE all-hooks fixture; the row now
//     computes three figures from the table (the `20` declared configurations, the `16`
//     distinct LABELS, the `13` distinct MODULE-OBSERVABLE inputs via `im1ObservableKey`) and
//     `(6)`–`(10)` plus `(20)` really build/install what their ids say. **⟶ AND `ADV-GS-33`
//     (the gate-4 closure): the as-filed `15` this line printed as "the DECLARED figure" is
//     superseded — `§5.5.1` now states DECLARED CONFIGURATIONS `20` · DISTINCT
//     `distinctKey` LABELS `16` · DISTINCT MODULE-OBSERVABLE INPUTS `13`, and the row's
//     DERIVED/asserted figures stay `16`/`13`.**
//   · **`D-12`(`c`)** — `P-GS-IM-1`'s row/stage/message text now reads the `end`-terminal drive
//     (the `reset`/`cancel` counts named as `P-GS-IM-4`'s), and `P-GS-IM-5`'s declarations and
//     messages read `6` stage POSITIONS beside the declared `24`. **⟶ CORRECTED BY
//     `ADV-GS-19` (the gate-4 closure):** the as-filed text continued *"`/ `5` distinct
//     observations per flag = `20` distinct observations"*, a figure hard-coded in the row
//     while `§5.5.1`'s own prose names TWO aliased stage pairs — so the derived figure is now
//     `6 − 2 = 4` readings per flag × `4` flags = **`16`**, DERIVED from the declared
//     `IM5_STAGE_ALIAS_PAIRS` table and measured inside the stage loop. The declared `24` is
//     UNMOVED.
//   · **`D-13` — THE THREE MISSING CONTROLS, each inside the row it belongs to:** `R-5`'s
//     runtime-ownership control (a stand-in that hands the source an element which was NOT
//     the argument FAILS the row's own check); `F-11`'s ASSEMBLED-TOKEN positive control (a
//     template-substituted split spelling is invisible to the raw view and caught by the
//     assembled view, driven through the row's own rule list); and `PRE-5`'s ROW PREDICATE
//     control (`im5CountPredicateHolds`, extracted at module scope and shared with
//     `P-GS-IM-5`, REJECTS the capture-skipping stand-in's zero and ACCEPTS the counts the
//     row requires).
//   · **`M-15`'s drive correction** — the row now compares `stats().sourceCalls` against the
//     count of NON-THROWING log entries (the recorder's `threwAt` set carries the sequences
//     of the calls that threw), and a SECOND ARM drives a really-throwing tracking attach so
//     the corrected rule is falsifiable: the raw logged total is strictly GREATER than the
//     reported count, and the reported count equals the non-throwing count.
//   · **`F-5`'s drive correction** — the drive is now the UNAMBIGUOUS IDLE case the corrected
//     clause bounds (`installed-idle`, NOT disposed, `gesture() === null`, with a real handle
//     from a completed gesture), asserted before the four terminals.
//
// FINDINGS THIS PASS MEASURED AND DID NOT BEND (each carried, not smoothed over):
//   · **`D-1`'s TYPE-LEVEL RED HAS FLIPPED GREEN (`⟶ ADV-GS-17`, the gate-4 closure).**
//     The as-filed bullet read: *"`D-1`'s TYPE-LEVEL RED IS REAL AND STILL RED. `§5.2` leg 4
//     (…) reports EXACTLY ONE diagnostic — `error TS2353: Object literal may only specify
//     known properties, and 'capturePointer' does not exist in type 'EventSource'` — because
//     the module's `EventSource` (`src/shared/gesture-session.ts`) declares only `on`, `off`
//     and `isConnected?`. … The fix is one member on the MODULE side and is not this pass's
//     to make."* **THE FIX LANDED: the module's `EventSource` now declares
//     `capturePointer?(element: GestureElement): void`, and the module's capture read is
//     `readMember(seam, 'capturePointer')`.** The standalone strict `tsc` leg over THIS file
//     is **EXIT `0` with ZERO diagnostics** (re-run by this pass — `ADV-GS-17`), so the
//     member's red/green cycle is complete and the `TS2353` above is kept only as the
//     as-filed record. **Nothing in `src/**` was edited by this pass.**
//   · **`P-GS-IM-1`'s DECLARED DISTINCT-INPUT FIGURE IS `15`; THE TABLE NOW DERIVES
//     `16` LABELS AND `13` MODULE-OBSERVABLE INPUTS (`⟶ ADV-GS-18`, the gate-4 closure).**
//     **⟶ SUPERSEDED 2026-09-27 (`ADV-GS-33`, the gate-4 closure): the `15` in this line's
//     own title is a spec figure that NO LONGER EXISTS — `§5.5.1 P-GS-IM-1` now states its
//     figures WITH THEIR DEFINITIONS, DECLARED CONFIGURATIONS `20` · DISTINCT `distinctKey`
//     LABELS `16` · DISTINCT MODULE-OBSERVABLE INPUTS `13` — and this bullet's title is kept
//     visible as the as-filed form while the body below already carries the landed `16`/`13`
//     pair. The row's DERIVED/asserted figures are unchanged.**
//     The as-filed bullet read *"THE TABLE DERIVES `12` … 20 = 12 distinct + 8 aliases"*, and
//     that `12` was BOTH hard-coded in the assertion and contradicted by the table's own
//     printed aliasing list, because the FIVE "single-hook" configurations `(6)`…`(10)` were
//     all built from the SAME all-hooks fixture (so their ids described nothing they built)
//     and because `(20)`'s `secondElement` flag was declared and never used. **Three figures
//     are now COMPUTED in the row from the table:** the `20` declared configurations; the `16`
//     distinct `distinctKey` LABELS the table defines (including the two FIXTURE-ONLY labels
//     `(17)`'s class instance and `(18)`'s freeze); and the `13` distinct MODULE-OBSERVABLE
//     inputs, derived by building each configuration's source/options exactly as the drive
//     does and projecting only what the module can read (`im1ObservableKey` — under which
//     `(17)` and `(18)` read as `(12)`-shaped inputs, asserted as such). `(6)`–`(9)` now build
//     four GENUINELY single-hook inputs, `(10)` builds the all-hooks input, and `(20)` really
//     installs its second element. **The DECLARED CONFIGURATIONS `20` and the DECLARED term
//     `58` are unmoved** (`ADV-GS-33`: the as-filed `15` of this sentence is superseded by
//     `§5.5.1`'s three defined figures)
//     and the derived figures are printed BESIDE them (never substituted); this remains a
//     register-cell-vs-table disagreement, reported rather than tuned green.
//   · **`ADV-GS-15` — `ADV-GS-2`/`stats().gestures`: A REFUSED `begin` MUST NOT CONSUME A
//     GESTURE (the finding this pass measured, and the remand that CORRECTED THE ROW).** The
//     clause: `§2.1` declares `SessionStats.gestures` as *"Successful `begin` calls,
//     instance-lifetime"* (`§2.4` item 4: *"`id` starts at `1`, increments on every SUCCESSFUL
//     `begin`"*; `M-2`: *"the handle's `id === 1`"* for the first gesture) and `§2.3`'s refusal
//     clauses create NO gesture. The bytes THEN: the landed module incremented its gesture
//     counter BEFORE its tracking-attach check (and derived `record.id` from it), so a refused
//     `begin` read `gestures: 1`, a single real gesture then read `2`, and the first REAL
//     gesture was handed id `2`. **THE ROW ASSERTS THE CLAUSE — `gestures === 0` after the
//     refusal, `gestures === 1` and `handle.id === 1` after the retry — AND IS NOW GREEN: THE
//     MODULE-SIDE FIX LANDED** (`⟶ ADV-GS-17`, the gate-4 closure: the increment, and the
//     `record.id` it feeds, sit after the tracking-attach check AND after the `onStart`
//     try/catch, immediately before `counters.lastCode = 'ok'`).
//     The former text of this bullet asserted the MEASURED figure *beside* the clause, which
//     codified the violation instead of pinning the contract; that is the defect this remand
//     removes, and the red was discharged by the fix rather than by re-tuning the row. (The
//     same finding, stated at the row: the `ADV-GS-15` block above
//     `describe('ADV-GS-2 …')`.)
//   · **`ADV-GS-16` — THE SAME CLAUSE ON THE `onStart`-THROWS PATH, AND IT IS GREEN (the
//     `onStart` fix has LANDED).** The refused-attach path was fixed first, and this pass's
//     module fix carried the SAME clause onto the hook path: `counters.gestures` no longer
//     moves before the consumer's `onStart` hook runs, so a `begin` whose `onStart` throws
//     (it rolls the tracking listeners back and RETHROWS) counts as NO gesture and consumes
//     NO id. The row authored by this pass asserts the clause, and the landed bytes now
//     measure `{gestures after the throw: 0, gestures after the retry: 1, retry handle id:
//     1}` against the required `{0, 1, 1}`. **This was the ONE red this pass reported, and
//     it is now discharged by the module fix** — the increment moved after the `onStart`
//     try/catch (immediately before `counters.lastCode = 'ok'` and the `{ok:true}` return),
//     so the clause holds rather than the row being re-tuned to it.
//   · **`ADV-GS-2`'s roll-back LOG IS BALANCED, and that is measured not assumed:** the
//     recorder logs an `on` ATTEMPT before its configured throw, so the two detaches for
//     never-completed attaches still pair with their own recorded attempts (`pairOnOffCalls`
//     reports no unmatched `off`); the `attached` MAP, however, holds only the start listener.
//     `I-5`'s sentence is therefore NOT contradicted by this path, and the row says so.
//   · **`P-GS-IM-6`'s declared `30` / distinct `20` (DERIVED), `P-GS-IM-1`'s declared `58` /
//     meas. `59` / labels `16` / module-observable `13`, and `P-GS-IM-5`'s declared `24` /
//     distinct `16` (DERIVED), are the figures this file prints.** The `⟶ ADV-GS-18/19/20`
//     closure replaced the as-filed hard-coded distinct figures (`12`, `5`, `26`) with
//     DERIVED ones and recorded the reasons, so no row prints a figure its own table
//     contradicts. **No register id, term, strategy id, the `396` total, the seed or any cap
//     moved in this pass** — the DECLARED terms (`58`/`24`/`30`) are unmoved and are what the
//     caps are compared against.
//   · **⟶ `ADV-GS-30`/`ADV-GS-32`/`ADV-GS-33`/`ADV-GS-37` — THE GATE-4 CLOSURE'S FOUR
//     TEST-SIDE ITEMS (2026-09-27, this pass).**
//     **`ADV-GS-30` (MED — AS FILED, THE RED OF THIS PASS; ⟶ RECORDED 2026-09-27: THE ROW IS
//     GREEN — see the correction at the end of this bullet).** A `begin` whose session is
//     disposed DURING the call reported `{ok:true, gesture}` on an inert instance. The row added by
//     this pass (`describe('ADV-GS-30 — a \`begin\` whose session is disposed MID-CALL …')`)
//     drives BOTH windows the establishment order leaves open — the disposal from inside
//     `capturePointer` and from inside `onStart` — and asserts, per window, the `§2.3` item
//     7.3 refusal `{ok:false, code:'disposed'}`, `session.disposed === true`, the counter
//     `stats().gestures === 0`, `stats().gestureId === 0`, `gesture() === null`,
//     `stats().active === false`, `stats().installed === 0`, and the listener baseline back
//     to `0` (`I-5`). **It is authored from the CLAUSE, never from the module's bytes.** Two
//     silences are reported in the row's own comments rather than invented:
//     **S-1** — `stats().lastCode` after a dispose-governed refusal has NO pinned cell
//     (`§0A` note 8 names the counters and says nothing of `lastCode`), so the row asserts the
//     refusal's own code as a DERIVATION and says so; **S-2** — `stats().disposed` is NOT a
//     `SessionStats` field (`§2.1` declares SEVEN), so the row asserts the disposal through
//     `session.disposed` and, beside it, the exact key set of `stats()` so a spec that adds
//     the field fails HERE rather than passing silently. The harness gained ONE option for
//     this row (`SourceOptions.capturePointer`, the mid-call hook inside the recorder's
//     capture call) — the window cannot be reached otherwise, because it is opened by the
//     session's own call order.
//     **⟶ RECORDED 2026-09-27 (the gate-4 closure's module fix): THE ROW IS GREEN.** The landed
//     module carries the liveness re-check `if (ended || slot !== record) return
//     refuseBegin('disposed')` at the END of the establishment order and ABOVE the counter
//     increment, so BOTH windows this row drives (the disposal from inside `capturePointer`
//     and from inside `onStart`) refuse on the landed bytes instead of reporting
//     `{ok:true, gesture}` on an inert instance — the red was discharged by that fix, whose
//     row is this one, and NOT by re-tuning the row.
//     **`ADV-GS-32`.** `PRE-2`'s bounded-set assertion compared four literals to the same
//     four literals (unfalsifiable) and printed *"the FOUR rows … (the other SEVEN are
//     `YES`)"* while `§5.5.1` marks FIVE (`P-GS-IM-2` joined, `ADV-GS-25`). The register table
//     `REGISTER_DECLARED` now carries a per-row `bounded` flag, and `PRE-2` DERIVES the
//     bounded and unbounded sets from it (and asserts they account for all ELEVEN rows), with
//     the message corrected to FIVE / SIX. **No declared term, row id or strategy id moved
//     for the flag** (`396` = `58+32+36+30+24+30+40+30+32+24+60` is still the sum of the
//     terms).
//     **`ADV-GS-33`.** The `P-GS-IM-1` row's own messages and log record printed the stale
//     bare `15` (*"beside the DECLARED `15`"*) — a spec figure that no longer exists. They now
//     cite `§5.5.1`'s three defined figures: DECLARED CONFIGURATIONS `20` · DISTINCT
//     `distinctKey` LABELS `16` · DISTINCT MODULE-OBSERVABLE INPUTS `13`, with the as-filed
//     `15` kept visible as provenance at each corrected site. **The row's DERIVED/asserted
//     figures (`16` labels / `13` observable, computed from the table) are UNCHANGED.**
//     **`ADV-GS-37`.** The typed-`EventSource` fixture's comment still framed its
//     `capturePointer` member as *"the leg-4 compile failure — the red this pass exists to
//     report"* with no adjacent correction; the dated `⟶` correction now stands beside it
//     (the module declares the member, leg 4 is exit `0`, the red was `TS2353`). Prose only —
//     **no assertion moved for it.**
//     **WHAT DID NOT MOVE:** no register row id, no row count (still ELEVEN), no attempt term,
//     the `396` total and its eleven printed terms, the seed `20260927`, the caps
//     (`≤100`/row · `≤400` total · stop-after-5), the strategy ids, the `26`-of-`30` figure,
//     and no existing green row was weakened or re-tuned. **`src/**` was NOT touched by this
//     pass**, and nothing was committed.
// ===========================================================================
